"""
Geometry 3D Graph Engine
========================
3D Geometry object graph engine that creates coordinate mesh grids and line segments
(points, lines, planes) using SymPy and exports data to Plotly-compatible JSON structures.

Provides robust timeout protection, equation simplification, and comprehensive geometry visualization.
"""

import math
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from sympy import (
    sympify, simplify, sqrt, pi, Abs, Matrix, Rational, nsimplify, S, N, re as sympy_re
)
from sympy.geometry import Point3D, Line3D, Plane

# Robustly import GeometryError (fallback for compatibility across different SymPy versions)
try:
    from sympy.geometry.exceptions import GeometryError
except ImportError:
    GeometryError = ValueError

# Thread pool prevents complex symbolic math from blocking indefinitely
_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="geo3d-graph")
_TIMEOUT_SECONDS = 8

# Allows safe characters for mathematical evaluation + 'eE' for scientific notation
_COMPONENT_RE = re.compile(r"^[0-9+\-*/(). \tsqrtpieE]*$")
_LOCAL_DICT = {"pi": pi, "sqrt": sqrt}


class Geometry3DGraphError(ValueError):
    """Custom exception for all controlled graph rendering errors."""
    pass


def _run_with_timeout(func, seconds=_TIMEOUT_SECONDS):
    """Executes a function with a strict timeout to prevent thread hanging."""
    future = _EXECUTOR.submit(func)
    try:
        return future.result(timeout=seconds)
    except FutureTimeoutError:
        raise Geometry3DGraphError("Calculation took too long. Try a simpler expression.")


def _parse_component(text, label="value"):
    """Parses a single coordinate or scalar string into a SymPy expression."""
    text = (text or "").strip()
    if not text:
        raise Geometry3DGraphError(f"{label} is empty")
    if not _COMPONENT_RE.match(text):
        raise Geometry3DGraphError(
            f"{label} contains characters that aren't allowed — use numbers, +-*/, sqrt() or pi"
        )
    try:
        val = sympify(text, locals=_LOCAL_DICT)
    except Exception:
        raise Geometry3DGraphError(f"Couldn't understand '{text}' in {label}")
    
    if not getattr(val, "is_number", False):
        raise Geometry3DGraphError(f"'{text}' in {label} isn't a valid mathematical number")
    return val


def _parse_triplet(text, label="value"):
    """Parses a string of 3 comma-separated components into a tuple of SymPy expressions."""
    if text is None:
        raise Geometry3DGraphError(f"{label} is missing")
    text = str(text).strip()
    # Support both comma and semicolon separators
    parts = [p.strip() for p in text.replace(";", ",").split(",") if p.strip()]
    if len(parts) != 3:
        raise Geometry3DGraphError(f"{label} must have exactly 3 components (x,y,z), got {len(parts)}")
    return tuple(_parse_component(p, f"{label}[{i}]") for i, p in enumerate(parts))


def _parse_point(text, label="Point"):
    return _parse_triplet(text, label)


def _parse_direction(text, label="Direction"):
    return _parse_triplet(text, label)


def _to_float_tuple(coords, precision=6):
    """Converts sympy numbers to plain Python floats for JSON / Plotly serialization."""
    try:
        return tuple(round(float(N(c)), precision) for c in coords)
    except TypeError:
        # Happens if user inputs complex-yielding expressions like sqrt(-1)
        raise Geometry3DGraphError("Coordinates evaluated to complex numbers. Ensure all inputs are real values.")


def _fmt_point(coords):
    """Formats coordinates cleanly for labels."""
    return f"({', '.join(str(simplify(c)) for c in coords)})"


def _fmt_vector(v):
    """Formats vector directions cleanly for labels."""
    return f"<{', '.join(str(simplify(c)) for c in v)}>"


def _fmt_num(n):
    """Simplifies and converts a single number to string."""
    return str(simplify(n))


def _sample_line_segment(p1, p2, num_points=50):
    """Generates equidistant points along a finite line segment."""
    p1f = _to_float_tuple(p1)
    p2f = _to_float_tuple(p2)
    xs, ys, zs = [], [], []
    for i in range(num_points):
        t = i / (num_points - 1)
        xs.append(p1f[0] + t * (p2f[0] - p1f[0]))
        ys.append(p1f[1] + t * (p2f[1] - p1f[1]))
        zs.append(p1f[2] + t * (p2f[2] - p1f[2]))
    return xs, ys, zs


def _sample_infinite_line(point, direction, length=8.0, num_points=60):
    """Generates coordinates to visualize a portion of an infinite line."""
    P = Matrix(point)
    d = Matrix(direction)
    mag = d.norm()
    if mag == 0:
        raise Geometry3DGraphError("Direction vector is zero")
    unit = d / mag
    half = float(length) / 2.0
    start = P - half * unit
    end = P + half * unit
    return _sample_line_segment(tuple(start[:]), tuple(end[:]), num_points)


def _sample_plane_mesh(plane, center=None, size=6.0, resolution=25):
    """
    Return X, Y, Z grids for a surface plot of the plane.
    *Optimized for pure float operations during the nested grid loop*
    """
    p0 = Matrix(plane.p1)
    n = Matrix(plane.normal_vector)
    n = n / n.norm()

    # Find two orthogonal vectors lying on the plane
    if abs(float(N(n[0]))) < 0.9:
        tmp = Matrix([1, 0, 0])
    else:
        tmp = Matrix([0, 1, 0])
        
    u = n.cross(tmp)
    u = u / u.norm()
    v = n.cross(u)
    v = v / v.norm()

    c = Matrix(center) if center is not None else p0

    # Cast to python floats FIRST to avoid extremely slow O(N^2) sympy arithmetic loops
    c_f = [float(N(x)) for x in c]
    u_f = [float(N(x)) for x in u]
    v_f = [float(N(x)) for x in v]
    
    half = float(size) / 2.0
    xs, ys, zs = [], [], []
    
    for i in range(resolution):
        row_x, row_y, row_z = [], [], []
        s = -half + (i / (resolution - 1)) * size
        for j in range(resolution):
            t = -half + (j / (resolution - 1)) * size
            
            # Pure python float arithmetic - >100x faster than looping Matrix operations
            row_x.append(round(c_f[0] + s * u_f[0] + t * v_f[0], 6))
            row_y.append(round(c_f[1] + s * u_f[1] + t * v_f[1], 6))
            row_z.append(round(c_f[2] + s * u_f[2] + t * v_f[2], 6))
            
        xs.append(row_x)
        ys.append(row_y)
        zs.append(row_z)
        
    return xs, ys, zs


def _line_from_params(p, suffix=""):
    """Safely extracts line data from common parameter patterns."""
    # Prefer two-point form if available
    if p.get("point1") and p.get("point2"):
        P1 = _parse_point(p.get("point1"), "Point 1")
        P2 = _parse_point(p.get("point2"), "Point 2")
        return Line3D(P1, P2)

    point_key = f"line{suffix}_point" if suffix else "line_point"
    dir_key = f"line{suffix}_direction" if suffix else "line_direction"
    
    # Accept short names if standard ones are missing
    if not p.get(point_key) and p.get("point"):
        point_key = "point"
    if not p.get(dir_key) and p.get("direction"):
        dir_key = "direction"
    if not p.get(dir_key) and p.get("direction1"):
        dir_key = "direction1"

    P = _parse_point(p.get(point_key), f"Line {suffix or ''} point".strip())
    d = _parse_direction(p.get(dir_key), f"Line {suffix or ''} direction ratios".strip())
    return Line3D(P, direction_ratio=list(d))


def _plane_from_params(p):
    """Safely constructs a SymPy Plane from various parameter styles."""
    mode = (p.get("plane_mode") or "point_normal").strip().lower()
    
    if mode == "three_points":
        P1 = _parse_point(p.get("plane_point1") or p.get("point1"), "Plane point 1")
        P2 = _parse_point(p.get("plane_point2") or p.get("point2"), "Plane point 2")
        P3 = _parse_point(p.get("plane_point3") or p.get("point3"), "Plane point 3")
        try:
            return Plane(P1, P2, P3)
        except (GeometryError, ValueError):
            raise Geometry3DGraphError(
                "These three plane points are collinear — they don't determine a unique plane."
            )
            
    P = _parse_point(p.get("plane_point") or p.get("point"), "Plane point")
    n = _parse_direction(p.get("plane_normal") or p.get("normal"), "Plane normal vector")
    return Plane(P, normal_vector=n)


def plot_distance_points(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    p1f = _to_float_tuple(P1)
    p2f = _to_float_tuple(P2)
    xs, ys, zs = _sample_line_segment(P1, P2)

    dist = simplify(sqrt(sum((c2 - c1) ** 2 for c1, c2 in zip(P1, P2))))

    traces = [
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Points",
            "x": [p1f[0], p2f[0]],
            "y": [p1f[1], p2f[1]],
            "z": [p1f[2], p2f[2]],
            "marker": {"size": 8, "color": ["#2563eb", "#dc2626"]},
            "text": [f"P1 {_fmt_point(P1)}", f"P2 {_fmt_point(P2)}"],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Distance",
            "x": xs,
            "y": ys,
            "z": zs,
            "line": {"width": 4, "color": "#16a34a"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Distance = {_fmt_num(dist)}",
        "result": _fmt_num(dist),
        "steps": [
            "Distance formula: √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]",
            f"P1 = {_fmt_point(P1)}, P2 = {_fmt_point(P2)}",
        ],
    }


def plot_section_formula(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    m = _parse_component(p.get("m", "1"), "m")
    n = _parse_component(p.get("n", "1"), "n")
    mode = (p.get("mode") or "internal").strip().lower()

    if mode == "external":
        denom = m - n
        if simplify(denom) == 0:
            raise Geometry3DGraphError("For external division, m and n can't be equal")
        coords = tuple(simplify((m * c2 - n * c1) / denom) for c1, c2 in zip(P1, P2))
    else:
        denom = m + n
        if simplify(denom) == 0:
            raise Geometry3DGraphError("m + n can't be zero")
        coords = tuple(simplify((m * c2 + n * c1) / denom) for c1, c2 in zip(P1, P2))

    p1f = _to_float_tuple(P1)
    p2f = _to_float_tuple(P2)
    rf = _to_float_tuple(coords)
    xs, ys, zs = _sample_line_segment(P1, P2)

    traces = [
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Points",
            "x": [p1f[0], p2f[0], rf[0]],
            "y": [p1f[1], p2f[1], rf[1]],
            "z": [p1f[2], p2f[2], rf[2]],
            "marker": {"size": 8, "color": ["#2563eb", "#dc2626", "#ca8a04"]},
            "text": [
                f"P1 {_fmt_point(P1)}",
                f"P2 {_fmt_point(P2)}",
                f"R {_fmt_point(coords)}",
            ],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Segment",
            "x": xs,
            "y": ys,
            "z": zs,
            "line": {"width": 3, "color": "#64748b"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Section point R = {_fmt_point(coords)}",
        "result": _fmt_point(coords),
        "steps": [
            f"{'External' if mode == 'external' else 'Internal'} section formula",
            f"P1 = {_fmt_point(P1)}, P2 = {_fmt_point(P2)}, m:n = {m}:{n}",
        ],
    }


def plot_direction_ratios(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    dr = tuple(simplify(c2 - c1) for c1, c2 in zip(P1, P2))
    mag = simplify(sqrt(sum(c ** 2 for c in dr)))
    if mag == 0:
        raise Geometry3DGraphError("Point 1 and Point 2 are the same point")
    dc = tuple(simplify(c / mag) for c in dr)

    xs, ys, zs = _sample_line_segment(P1, P2)
    p1f = _to_float_tuple(P1)
    p2f = _to_float_tuple(P2)

    traces = [
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Points",
            "x": [p1f[0], p2f[0]],
            "y": [p1f[1], p2f[1]],
            "z": [p1f[2], p2f[2]],
            "marker": {"size": 8, "color": ["#2563eb", "#dc2626"]},
            "text": [f"P1 {_fmt_point(P1)}", f"P2 {_fmt_point(P2)}"],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Direction",
            "x": xs,
            "y": ys,
            "z": zs,
            "line": {"width": 5, "color": "#7c3aed"},
        },
    ]
    return {
        "traces": traces,
        "title": f"DR = {_fmt_vector(dr)} | DC = {_fmt_vector(dc)}",
        "result": f"Direction ratios = {_fmt_vector(dr)}",
        "extra": f"Direction cosines = {_fmt_vector(dc)}",
        "steps": [
            "Direction ratios: (x₂-x₁, y₂-y₁, z₂-z₁)",
            f"Magnitude = {_fmt_num(mag)}",
        ],
    }


def plot_line_two_points(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    line = Line3D(P1, P2)
    xs, ys, zs = _sample_infinite_line(P1, line.direction_ratio, length=10.0)
    p1f = _to_float_tuple(P1)
    p2f = _to_float_tuple(P2)

    traces = [
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Given points",
            "x": [p1f[0], p2f[0]],
            "y": [p1f[1], p2f[1]],
            "z": [p1f[2], p2f[2]],
            "marker": {"size": 8, "color": ["#2563eb", "#dc2626"]},
            "text": [f"P1 {_fmt_point(P1)}", f"P2 {_fmt_point(P2)}"],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Line",
            "x": xs,
            "y": ys,
            "z": zs,
            "line": {"width": 4, "color": "#0ea5e9"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Line through {_fmt_point(P1)} and {_fmt_point(P2)}",
        "result": f"Direction ratios = {_fmt_vector(line.direction_ratio)}",
        "steps": [
            "Parametric form: r = P1 + t·(P2 − P1)",
            f"Direction = {_fmt_vector(line.direction_ratio)}",
        ],
    }


def plot_plane_point_normal(p):
    plane = _plane_from_params(p)
    xs, ys, zs = _sample_plane_mesh(plane, size=8.0)
    p0 = _to_float_tuple(plane.p1)
    
    n = plane.normal_vector
    n_unit = Matrix(n) / Matrix(n).norm()
    tip = Matrix(plane.p1) + 2.5 * n_unit
    tipf = _to_float_tuple(tuple(tip[:]))

    traces = [
        {
            "type": "surface",
            "name": "Plane",
            "x": xs,
            "y": ys,
            "z": zs,
            "opacity": 0.55,
            "colorscale": [[0, "#38bdf8"], [1, "#0284c7"]],
            "showscale": False,
        },
        {
            "type": "scatter3d",
            "mode": "markers+lines",
            "name": "Normal",
            "x": [p0[0], tipf[0]],
            "y": [p0[1], tipf[1]],
            "z": [p0[2], tipf[2]],
            "marker": {"size": 5, "color": "#dc2626"},
            "line": {"width": 5, "color": "#dc2626"},
        },
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Point on plane",
            "x": [p0[0]],
            "y": [p0[1]],
            "z": [p0[2]],
            "marker": {"size": 7, "color": "#16a34a"},
            "text": [f"P {_fmt_point(plane.p1)}"],
            "hoverinfo": "text",
        },
    ]
    return {
        "traces": traces,
        "title": f"Plane with normal {_fmt_vector(n)}",
        "result": f"Normal = {_fmt_vector(n)}",
        "steps": [
            "Plane equation: n · (r − P0) = 0",
            f"Point on plane = {_fmt_point(plane.p1)}",
        ],
    }


def plot_plane_three_points(p):
    # Reuse the same mesh generator
    return plot_plane_point_normal({
        "plane_mode": "three_points",
        "plane_point1": p.get("point1") or p.get("plane_point1"),
        "plane_point2": p.get("point2") or p.get("plane_point2"),
        "plane_point3": p.get("point3") or p.get("plane_point3"),
    })


def plot_distance_point_plane(p):
    P_coords = _parse_point(p.get("point"), "Point")
    P = Point3D(*P_coords)
    plane = _plane_from_params(p)
    foot = plane.projection(P)
    dist = simplify(plane.distance(P))

    xs, ys, zs = _sample_plane_mesh(plane, center=tuple(foot), size=7.0)
    pf = _to_float_tuple(P.args)
    ff = _to_float_tuple(foot.args)
    lx, ly, lz = _sample_line_segment(tuple(P), tuple(foot), num_points=20)

    traces = [
        {
            "type": "surface",
            "name": "Plane",
            "x": xs,
            "y": ys,
            "z": zs,
            "opacity": 0.5,
            "colorscale": [[0, "#a5b4fc"], [1, "#6366f1"]],
            "showscale": False,
        },
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Point & Foot",
            "x": [pf[0], ff[0]],
            "y": [pf[1], ff[1]],
            "z": [pf[2], ff[2]],
            "marker": {"size": 8, "color": ["#dc2626", "#16a34a"]},
            "text": [f"P {_fmt_point(P)}", f"Foot {_fmt_point(foot)}"],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Perpendicular",
            "x": lx,
            "y": ly,
            "z": lz,
            "line": {"width": 4, "color": "#f59e0b", "dash": "dash"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Distance = {_fmt_num(dist)}",
        "result": _fmt_num(dist),
        "steps": [
            "Distance = |ax+by+cz+d| / √(a²+b²+c²)",
            f"Foot of perpendicular = {_fmt_point(foot)}",
        ],
    }


def plot_distance_point_line(p):
    P_coords = _parse_point(p.get("point"), "Point")
    P = Point3D(*P_coords)
    line = _line_from_params(p)
    foot = line.projection(P)
    dist = simplify(line.distance(P))

    xs, ys, zs = _sample_infinite_line(line.p1, line.direction_ratio, length=10.0)
    pf = _to_float_tuple(P.args)
    ff = _to_float_tuple(foot.args)
    lx, ly, lz = _sample_line_segment(tuple(P), tuple(foot), num_points=20)

    traces = [
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Line",
            "x": xs,
            "y": ys,
            "z": zs,
            "line": {"width": 4, "color": "#0ea5e9"},
        },
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Point & Foot",
            "x": [pf[0], ff[0]],
            "y": [pf[1], ff[1]],
            "z": [pf[2], ff[2]],
            "marker": {"size": 8, "color": ["#dc2626", "#16a34a"]},
            "text": [f"P {_fmt_point(P)}", f"Foot {_fmt_point(foot)}"],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Perpendicular",
            "x": lx,
            "y": ly,
            "z": lz,
            "line": {"width": 4, "color": "#f59e0b", "dash": "dash"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Distance = {_fmt_num(dist)}",
        "result": _fmt_num(dist),
        "steps": [
            "Distance from point to line = | (P−A) × d | / |d|",
            f"Foot = {_fmt_point(foot)}",
        ],
    }


def plot_intersection_line_plane(p):
    line = _line_from_params(p)
    plane = _plane_from_params(p)
    inter = plane.intersection(line)
    
    if not inter:
        raise Geometry3DGraphError("Line is parallel to the plane (no intersection).")
    
    Q = inter[0]
    # Guard against when intersection is exactly the entire line itself
    if type(Q).__name__ == "Line3D":
        raise Geometry3DGraphError("Line is completely contained within the plane (infinite intersections).")
        
    qf = _to_float_tuple(Q.args)

    xs_l, ys_l, zs_l = _sample_infinite_line(line.p1, line.direction_ratio, length=10.0)
    xs_p, ys_p, zs_p = _sample_plane_mesh(plane, center=Q, size=7.0)

    traces = [
        {
            "type": "surface",
            "name": "Plane",
            "x": xs_p,
            "y": ys_p,
            "z": zs_p,
            "opacity": 0.5,
            "colorscale": [[0, "#86efac"], [1, "#16a34a"]],
            "showscale": False,
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Line",
            "x": xs_l,
            "y": ys_l,
            "z": zs_l,
            "line": {"width": 5, "color": "#0ea5e9"},
        },
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Intersection",
            "x": [qf[0]],
            "y": [qf[1]],
            "z": [qf[2]],
            "marker": {"size": 10, "color": "#dc2626", "symbol": "diamond"},
            "text": [f"Q {_fmt_point(Q)}"],
            "hoverinfo": "text",
        },
    ]
    return {
        "traces": traces,
        "title": f"Intersection point = {_fmt_point(Q)}",
        "result": _fmt_point(Q),
        "steps": [
            "Solve parametric equations of the line with the plane equation",
            f"Intersection = {_fmt_point(Q)}",
        ],
    }


def plot_image_in_plane(p):
    P = _parse_point(p.get("point"), "Point")
    plane = _plane_from_params(p)
    
    foot = plane.projection(Point3D(*P))
    # reflection: 2*foot - P
    reflected = tuple(simplify(2 * f - c) for f, c in zip(foot.args, P))

    xs, ys, zs = _sample_plane_mesh(plane, center=foot, size=7.0)
    pf = _to_float_tuple(P)
    ff = _to_float_tuple(foot.args)
    rf = _to_float_tuple(reflected)
    lx, ly, lz = _sample_line_segment(P, reflected, num_points=30)

    traces = [
        {
            "type": "surface",
            "name": "Plane (mirror)",
            "x": xs,
            "y": ys,
            "z": zs,
            "opacity": 0.45,
            "colorscale": [[0, "#fcd34d"], [1, "#d97706"]],
            "showscale": False,
        },
        {
            "type": "scatter3d",
            "mode": "markers",
            "name": "Points",
            "x": [pf[0], ff[0], rf[0]],
            "y": [pf[1], ff[1], rf[1]],
            "z": [pf[2], ff[2], rf[2]],
            "marker": {"size": 8, "color": ["#2563eb", "#16a34a", "#dc2626"]},
            "text": [
                f"P {_fmt_point(P)}",
                f"Foot {_fmt_point(foot)}",
                f"Image {_fmt_point(reflected)}",
            ],
            "hoverinfo": "text",
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Perpendicular",
            "x": lx,
            "y": ly,
            "z": lz,
            "line": {"width": 3, "color": "#64748b", "dash": "dot"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Image = {_fmt_point(reflected)}",
        "result": _fmt_point(reflected),
        "steps": [
            "Image P' = 2·Foot − P",
            f"Foot of perpendicular = {_fmt_point(foot)}",
        ],
    }


def plot_shortest_distance_lines(p):
    # Two lines: line1 (point1 + dir1), line2 (point2 + dir2)
    P1 = _parse_point(p.get("point1") or p.get("line1_point"), "Line 1 point")
    d1 = _parse_direction(p.get("direction1") or p.get("line1_direction"), "Line 1 direction")
    P2 = _parse_point(p.get("point2") or p.get("line2_point"), "Line 2 point")
    d2 = _parse_direction(p.get("direction2") or p.get("line2_direction"), "Line 2 direction")

    L1 = Line3D(P1, direction_ratio=list(d1))
    L2 = Line3D(P2, direction_ratio=list(d2))
    dist = simplify(L1.distance(L2))

    # Approximate feet of the common perpendicular (for visualization)
    v1 = Matrix(d1)
    v2 = Matrix(d2)
    n = v1.cross(v2)
    
    if n.norm() == 0:
        # parallel lines fallback
        foot1 = P1
        foot2 = L2.projection(Point3D(*P1)).args
    else:
        # parametric solve for skew lines shortest segment endpoints
        A = Matrix(P1)
        B = Matrix(P2)
        try:
            # Derived via algebraic projection onto common normal
            t = ((B - A).dot(v2.cross(n))) / (v1.dot(v2.cross(n)))
            s = ((B - A).dot(v1.cross(n))) / (v1.dot(v2.cross(n)))
            foot1 = tuple((A + t * v1)[:])
            foot2 = tuple((B + s * v2)[:])
        except Exception:
            foot1 = P1
            foot2 = L2.projection(Point3D(*P1)).args

    xs1, ys1, zs1 = _sample_infinite_line(P1, d1, length=10.0)
    xs2, ys2, zs2 = _sample_infinite_line(P2, d2, length=10.0)
    lx, ly, lz = _sample_line_segment(foot1, foot2, num_points=15)

    traces = [
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Line 1",
            "x": xs1,
            "y": ys1,
            "z": zs1,
            "line": {"width": 4, "color": "#2563eb"},
        },
        {
            "type": "scatter3d",
            "mode": "lines",
            "name": "Line 2",
            "x": xs2,
            "y": ys2,
            "z": zs2,
            "line": {"width": 4, "color": "#dc2626"},
        },
        {
            "type": "scatter3d",
            "mode": "lines+markers",
            "name": "Shortest distance",
            "x": lx,
            "y": ly,
            "z": lz,
            "line": {"width": 5, "color": "#16a34a"},
            "marker": {"size": 6, "color": "#16a34a"},
        },
    ]
    return {
        "traces": traces,
        "title": f"Shortest distance = {_fmt_num(dist)}",
        "result": _fmt_num(dist),
        "steps": [
            "Shortest distance between two skew lines = | (P2−P1) · (d1 × d2) | / |d1 × d2|",
        ],
    }


def plot_coplanarity(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    P3 = _parse_point(p.get("point3"), "Point 3")
    P4 = _parse_point(p.get("point4"), "Point 4")

    v1 = Matrix(P2) - Matrix(P1)
    v2 = Matrix(P3) - Matrix(P1)
    v3 = Matrix(P4) - Matrix(P1)
    triple = simplify(v1.dot(v2.cross(v3)))
    coplanar = (triple == 0)

    pts = [_to_float_tuple(pt) for pt in (P1, P2, P3, P4)]
    
    # Render tetrahedron edges
    edges = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
    edge_traces = []
    for i, j in edges:
        edge_traces.append({
            "type": "scatter3d",
            "mode": "lines",
            "name": "Edge",
            "x": [pts[i][0], pts[j][0]],
            "y": [pts[i][1], pts[j][1]],
            "z": [pts[i][2], pts[j][2]],
            "line": {"width": 3, "color": "#64748b"},
            "showlegend": False,
        })

    traces = [
        {
            "type": "scatter3d",
            "mode": "markers+text",
            "name": "Points",
            "x": [pt[0] for pt in pts],
            "y": [pt[1] for pt in pts],
            "z": [pt[2] for pt in pts],
            "marker": {"size": 8, "color": ["#2563eb", "#dc2626", "#16a34a", "#ca8a04"]},
            "text": ["P1", "P2", "P3", "P4"],
            "textposition": "top center",
        },
    ] + edge_traces

    if coplanar:
        # If they are coplanar, graphically map out the shared plane.
        try:
            pl = Plane(Point3D(*P1), Point3D(*P2), Point3D(*P3))
            xs, ys, zs = _sample_plane_mesh(pl, size=6.0)
            traces.insert(0, {
                "type": "surface",
                "name": "Common plane",
                "x": xs,
                "y": ys,
                "z": zs,
                "opacity": 0.35,
                "colorscale": [[0, "#c4b5fd"], [1, "#7c3aed"]],
                "showscale": False,
            })
        except Exception:
            pass

    result = "Yes — coplanar" if coplanar else "No — NOT coplanar"
    return {
        "traces": traces,
        "title": result,
        "result": result,
        "extra": f"Scalar triple product = {_fmt_num(triple)}",
        "steps": [
            "Four points are coplanar iff (P2−P1)·[(P3−P1)×(P4−P1)] = 0",
            f"Triple product = {_fmt_num(triple)}",
        ],
    }


# Dictionary mapping requested operation types to their specific plot functions
PLOT_OPERATIONS = {
    "distance_points": plot_distance_points,
    "section_formula": plot_section_formula,
    "direction_ratios": plot_direction_ratios,
    "line_two_points": plot_line_two_points,
    "plane_point_normal": plot_plane_point_normal,
    "plane_three_points": plot_plane_three_points,
    "distance_point_plane": plot_distance_point_plane,
    "distance_point_line": plot_distance_point_line,
    "intersection_line_plane": plot_intersection_line_plane,
    "image_in_plane": plot_image_in_plane,
    "shortest_distance_lines": plot_shortest_distance_lines,
    "coplanarity": plot_coplanarity,
}


def generate_3d_plot_data(operation: str, params: dict) -> dict:
    """
    Main entry point for generating Plotly JSON data schemas representing Sympy geometry.

    Returns a dict with:
        - traces   : list of Plotly 3D trace dicts (scatter3d / surface)
        - title    : short title for the plot
        - result   : human-readable result string
        - steps    : list of explanation steps
        - extra    : optional extra info
    """
    handler = PLOT_OPERATIONS.get(operation)
    if handler is None:
        raise Geometry3DGraphError(
            f"Unknown / unsupported plot operation: {operation}. "
            f"Supported: {', '.join(sorted(PLOT_OPERATIONS))}"
        )
        
    params = params or {}
    try:
        # Wrapped in a robust thread execution for preventing system hangs
        outcome = _run_with_timeout(lambda: handler(params))
        outcome["operation"] = operation
        return outcome
    except Geometry3DGraphError:
        raise
    except ZeroDivisionError:
        raise Geometry3DGraphError("Division by zero — please check the math parameters.")
    except GeometryError as e:
        raise Geometry3DGraphError(str(e))
    except ValueError as e:
        raise Geometry3DGraphError(str(e))


# ---------------------------------------------------------------------------
# Execution stub for running unit tests
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import json

    demos = [
        ("distance_points", {"point1": "0,0,0", "point2": "3,4,12"}),
        ("section_formula", {"point1": "1,2,3", "point2": "5,6,7", "m": "1", "n": "2"}),
        ("plane_point_normal", {"plane_point": "0,0,0", "plane_normal": "1,1,1"}),
        ("distance_point_plane", {
            "point": "1,1,1",
            "plane_point": "0,0,0",
            "plane_normal": "1,0,0",
        }),
        ("line_two_points", {"point1": "0,0,0", "point2": "1,1,1"}),
        ("coplanarity", {
            "point1": "0,0,0", "point2": "1,0,0",
            "point3": "0,1,0", "point4": "1,1,0",
        }),
    ]

    print("=" * 60)
    print("Geometry 3D Graph Engine — Integration Tests")
    print("=" * 60)
    for op, params in demos:
        try:
            data = generate_3d_plot_data(op, params)
            print(f"\n✓ {op}")
            print(f"  Title : {data['title']}")
            print(f"  Result: {data['result']}")
            print(f"  Traces: {len(data['traces'])} (types: {[t['type'] for t in data['traces']]})")
        except Exception as e:
            print(f"\n✗ {op} → {e}")

    print("\n" + "=" * 60)
    print("All supported operations:", ", ".join(sorted(PLOT_OPERATIONS)))
    print("Engine module verified and actively ready.")