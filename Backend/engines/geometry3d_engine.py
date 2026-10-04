"""
Three-Dimensional Geometry Engine
==================================
স্কুল/কলেজের "3D Geometry" চ্যাপ্টারের প্রায় সবগুলো ক্লাসিক সমস্যা এক জায়গায়:
দুটো বিন্দুর দূরত্ব, সেকশন ফর্মুলা, direction ratios/cosines, রেখা ও তলের
সমীকরণ, রেখা-রেখা / তল-তল / রেখা-তল কোণ, লম্বের পাদবিন্দু, প্রতিবিম্ব,
coplanarity, এবং রেখা-তলের ছেদবিন্দু।

sympy.geometry (Point3D, Line3D, Plane) দিয়ে গণনার আসল কাজটা হয়; এই
মডিউল শুধু ইউজারের ইনপুট (যেমন "1,2,3" বা "sqrt(2)/2") পার্স করে, ঠিক
ফাংশনটা কল করে, আর ফলাফলটা পড়ার-উপযোগী করে সাজিয়ে দেয় — সাথে প্রতিটা
অপারেশনের জন্য ছোট ছোট ধাপ (steps) ও দেয়, যাতে ইউজার শুধু উত্তর না,
পদ্ধতিটাও বুঝতে পারে।

ইনপুট ফরম্যাট (সব জায়গায় একই রকম, যাতে ইউজারকে আলাদা করে কিছু মনে
রাখতে না হয়):
  - বিন্দু / direction ratios / normal vector  ->  "x,y,z"  (যেমন "1,2,3")
  - প্রতিটা কম্পোনেন্টে সংখ্যা, ভগ্নাংশ, sqrt(), pi লেখা যায় (যেমন "sqrt(2),0,-1/2")
"""
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from sympy import (
    sympify, simplify, sqrt, pi, Abs, Matrix, Rational, nsimplify, S
)
from sympy.geometry import Point3D, Line3D, Plane
from sympy.geometry.exceptions import GeometryError

_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="geo3d-engine")
_TIMEOUT_SECONDS = 8

# প্রতিটা কম্পোনেন্টে শুধু সংখ্যা, +-*/(), দশমিক বিন্দু, আর sqrt/pi লেখার
# জন্য প্রয়োজনীয় অক্ষরগুলোই (s,q,r,t,p,i) অনুমোদিত — নিরাপত্তার জন্য
_COMPONENT_RE = re.compile(r"^[0-9+\-*/(). \tsqrtpi]*$")
_LOCAL_DICT = {"pi": pi, "sqrt": sqrt}


class Geometry3DError(ValueError):
    pass


def _run_with_timeout(func, seconds=_TIMEOUT_SECONDS):
    future = _EXECUTOR.submit(func)
    try:
        return future.result(timeout=seconds)
    except FutureTimeoutError:
        raise TimeoutError("calculation took too long")


def _parse_component(text, label="value"):
    text = (text or "").strip()
    if not text:
        raise Geometry3DError(f"{label} is empty")
    if not _COMPONENT_RE.match(text):
        raise Geometry3DError(f"{label} contains characters that aren't allowed — use numbers, +-*/, sqrt() or pi")
    try:
        val = sympify(text, locals=_LOCAL_DICT)
    except Exception:
        raise Geometry3DError(f"Couldn't understand '{text}' in {label}")
    if not getattr(val, "is_number", False):
        raise Geometry3DError(f"'{text}' in {label} isn't a valid number")
    return val


def _parse_triplet(text, label="value"):
    if text is None:
        raise Geometry3DError(f"{label} is missing")
    parts = [p.strip() for p in str(text).split(",")]
    if len(parts) != 3:
        raise Geometry3DError(f"{label} needs exactly 3 comma-separated numbers, like 1,2,3")
    return tuple(_parse_component(p, f"{label} (component {i + 1})") for i, p in enumerate(parts))


def _parse_point(text, label="Point"):
    return Point3D(*_parse_triplet(text, label))


def _parse_direction(text, label="Direction ratios"):
    dr = _parse_triplet(text, label)
    if all(simplify(c) == 0 for c in dr):
        raise Geometry3DError(f"{label} can't all be zero")
    return dr


def _fmt_num(val):
    """ছোট, readable ফরম্যাট — পুরোপুরি সংখ্যা হলে exact ভ্যালু, নয়তো exact + দশমিক দুটোই"""
    val = simplify(val)
    text = str(val)
    if val.is_rational:
        return text
    try:
        approx = float(val.evalf())
        return f"{text} ≈ {approx:.6g}"
    except Exception:
        return text


def _fmt_point(pt):
    return "(" + ", ".join(_fmt_num(c) for c in pt) + ")"


def _fmt_vector(v):
    return "(" + ", ".join(_fmt_num(c) for c in v) + ")"


def _fmt_angle_rad(rad_expr):
    rad_expr = simplify(rad_expr)
    deg_val = float((rad_expr * 180 / pi).evalf())
    return f"{deg_val:.4f}°"


def _direction_of(line_or_ratios):
    if isinstance(line_or_ratios, Line3D):
        return tuple(line_or_ratios.direction_ratio)
    return tuple(line_or_ratios)


def _plane_equation_str(plane):
    eq = simplify(plane.equation())
    return f"{eq} = 0"


# ---------------------------------------------------------------------------
# 1. দুটো বিন্দুর মধ্যে দূরত্ব
# ---------------------------------------------------------------------------
def op_distance_points(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    dist = simplify(P1.distance(P2))
    steps = [
        "Distance formula: d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]",
        f"P1 = {_fmt_point(P1)}, P2 = {_fmt_point(P2)}",
    ]
    return {"result": _fmt_num(dist), "steps": steps}


# ---------------------------------------------------------------------------
# 2. সেকশন ফর্মুলা (internal / external division)
# ---------------------------------------------------------------------------
def op_section_formula(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    m = _parse_component(p.get("m", "1"), "m")
    n = _parse_component(p.get("n", "1"), "n")
    mode = (p.get("mode") or "internal").strip().lower()

    if mode == "external":
        denom = m - n
        if simplify(denom) == 0:
            raise Geometry3DError("For external division, m and n can't be equal")
        coords = tuple(simplify((m * c2 - n * c1) / denom) for c1, c2 in zip(P1, P2))
        formula = "R = (m·P2 - n·P1) / (m - n)"
    else:
        denom = m + n
        if simplify(denom) == 0:
            raise Geometry3DError("m + n can't be zero")
        coords = tuple(simplify((m * c2 + n * c1) / denom) for c1, c2 in zip(P1, P2))
        formula = "R = (m·P2 + n·P1) / (m + n)"

    steps = [
        f"{'External' if mode == 'external' else 'Internal'} section formula: {formula}",
        f"P1 = {_fmt_point(P1)}, P2 = {_fmt_point(P2)}, m:n = {m}:{n}",
    ]
    return {"result": _fmt_point(coords), "steps": steps}


# ---------------------------------------------------------------------------
# 3. Direction ratios ও direction cosines
# ---------------------------------------------------------------------------
def op_direction_ratios(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    dr = tuple(simplify(c2 - c1) for c1, c2 in zip(P1, P2))
    mag = simplify(sqrt(sum(c ** 2 for c in dr)))
    if mag == 0:
        raise Geometry3DError("Point 1 and Point 2 are the same point — no direction is defined")
    dc = tuple(simplify(c / mag) for c in dr)

    steps = [
        "Direction ratios: (x₂-x₁, y₂-y₁, z₂-z₁)",
        f"Direction ratios = {_fmt_vector(dr)}",
        f"Magnitude = √(a² + b² + c²) = {_fmt_num(mag)}",
        "Direction cosines = direction ratios ÷ magnitude",
    ]
    return {
        "result": f"Direction ratios = {_fmt_vector(dr)}",
        "extra": f"Direction cosines = {_fmt_vector(dc)}",
        "steps": steps,
    }


# ---------------------------------------------------------------------------
# 4. দুটো রেখার মধ্যে কোণ
# ---------------------------------------------------------------------------
def op_angle_between_lines(p):
    d1 = _parse_direction(p.get("direction1"), "Direction ratios of line 1")
    d2 = _parse_direction(p.get("direction2"), "Direction ratios of line 2")
    v1, v2 = Matrix(d1), Matrix(d2)
    cos_theta = Abs(v1.dot(v2)) / (v1.norm() * v2.norm())
    from sympy import acos
    angle = _run_with_timeout(lambda: acos(cos_theta))
    steps = [
        "cos θ = |a₁a₂ + b₁b₂ + c₁c₂| / (√(a₁²+b₁²+c₁²) · √(a₂²+b₂²+c₂²))",
        f"Direction ratios: line 1 = {_fmt_vector(d1)}, line 2 = {_fmt_vector(d2)}",
    ]
    return {"result": _fmt_angle_rad(angle), "steps": steps}


# ---------------------------------------------------------------------------
# 5. দুটো তলের মধ্যে কোণ
# ---------------------------------------------------------------------------
def op_angle_between_planes(p):
    n1 = _parse_direction(p.get("normal1"), "Normal vector of plane 1")
    n2 = _parse_direction(p.get("normal2"), "Normal vector of plane 2")
    v1, v2 = Matrix(n1), Matrix(n2)
    cos_theta = Abs(v1.dot(v2)) / (v1.norm() * v2.norm())
    from sympy import acos
    angle = _run_with_timeout(lambda: acos(cos_theta))
    steps = [
        "cos θ = |n₁·n₂| / (|n₁| |n₂|)  — using the normal vectors of the two planes",
        f"Normals: n1 = {_fmt_vector(n1)}, n2 = {_fmt_vector(n2)}",
    ]
    return {"result": _fmt_angle_rad(angle), "steps": steps}


# ---------------------------------------------------------------------------
# 6. একটা রেখা ও একটা তলের মধ্যে কোণ
# ---------------------------------------------------------------------------
def op_angle_line_plane(p):
    d = _parse_direction(p.get("direction"), "Direction ratios of the line")
    n = _parse_direction(p.get("normal"), "Normal vector of the plane")
    vd, vn = Matrix(d), Matrix(n)
    sin_theta = Abs(vd.dot(vn)) / (vd.norm() * vn.norm())
    from sympy import asin
    angle = _run_with_timeout(lambda: asin(sin_theta))
    steps = [
        "sin θ = |d·n| / (|d| |n|)  — d = line's direction, n = plane's normal",
        f"d = {_fmt_vector(d)}, n = {_fmt_vector(n)}",
    ]
    return {"result": _fmt_angle_rad(angle), "steps": steps}


# ---------------------------------------------------------------------------
# 7. তিনটে বিন্দু দিয়ে তলের সমীকরণ
# ---------------------------------------------------------------------------
def op_plane_three_points(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    P3 = _parse_point(p.get("point3"), "Point 3")
    try:
        plane = _run_with_timeout(lambda: Plane(P1, P2, P3))
    except (GeometryError, ValueError):
        raise Geometry3DError("These three points are collinear — infinitely many planes pass through them")
    steps = [
        "Plane through 3 points: normal n = (P2-P1) × (P3-P1), then n · (r - P1) = 0",
        f"P1={_fmt_point(P1)}, P2={_fmt_point(P2)}, P3={_fmt_point(P3)}",
    ]
    return {
        "result": _plane_equation_str(plane),
        "extra": f"Normal vector = {_fmt_vector(plane.normal_vector)}",
        "steps": steps,
    }


# ---------------------------------------------------------------------------
# 8. বিন্দু + normal দিয়ে তলের সমীকরণ
# ---------------------------------------------------------------------------
def op_plane_point_normal(p):
    P = _parse_point(p.get("point"), "Point")
    n = _parse_direction(p.get("normal"), "Normal vector")
    plane = Plane(P, normal_vector=n)
    steps = [
        "Plane through a point with a given normal: n · (r - P) = 0",
        f"P = {_fmt_point(P)}, n = {_fmt_vector(n)}",
    ]
    return {"result": _plane_equation_str(plane), "steps": steps}


# ---------------------------------------------------------------------------
# 9. দুটো বিন্দু দিয়ে রেখার সমীকরণ
# ---------------------------------------------------------------------------
def op_line_two_points(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    if P1 == P2:
        raise Geometry3DError("Point 1 and Point 2 are the same — a line needs two distinct points")
    dr = tuple(simplify(c2 - c1) for c1, c2 in zip(P1, P2))

    parametric = (
        f"x = {_fmt_num(P1.x)} + ({_fmt_num(dr[0])})t,  "
        f"y = {_fmt_num(P1.y)} + ({_fmt_num(dr[1])})t,  "
        f"z = {_fmt_num(P1.z)} + ({_fmt_num(dr[2])})t"
    )
    result = parametric
    if all(simplify(c) != 0 for c in dr):
        symmetric = (
            f"(x - {_fmt_num(P1.x)})/{_fmt_num(dr[0])} = "
            f"(y - {_fmt_num(P1.y)})/{_fmt_num(dr[1])} = "
            f"(z - {_fmt_num(P1.z)})/{_fmt_num(dr[2])}"
        )
        result = symmetric

    steps = [
        "Direction ratios = (x₂-x₁, y₂-y₁, z₂-z₁), then use the point-direction form of a line",
        f"P1 = {_fmt_point(P1)}, direction ratios = {_fmt_vector(dr)}",
    ]
    return {"result": result, "extra": f"Parametric form: {parametric}", "steps": steps}


# ---------------------------------------------------------------------------
# 10. বিন্দু থেকে তলের দূরত্ব
# ---------------------------------------------------------------------------
def op_distance_point_plane(p):
    P = _parse_point(p.get("point"), "Point")
    plane = _plane_from_params(p)
    dist = _run_with_timeout(lambda: plane.distance(P))
    steps = [
        "Distance of a point from a plane ax+by+cz+d=0: |a·x₀+b·y₀+c·z₀+d| / √(a²+b²+c²)",
        f"Point = {_fmt_point(P)}, Plane: {_plane_equation_str(plane)}",
    ]
    return {"result": _fmt_num(dist), "steps": steps}


# ---------------------------------------------------------------------------
# 11. বিন্দু থেকে রেখার দূরত্ব
# ---------------------------------------------------------------------------
def op_distance_point_line(p):
    P = _parse_point(p.get("point"), "Point")
    line = _line_from_params(p)
    dist = _run_with_timeout(lambda: line.distance(P))
    steps = [
        "Distance of a point from a line = |PQ × d| / |d|, using any point Q on the line and its direction d",
        f"Point = {_fmt_point(P)}, Line through {_fmt_point(line.p1)} with direction {_fmt_vector(line.direction_ratio)}",
    ]
    return {"result": _fmt_num(dist), "steps": steps}


# ---------------------------------------------------------------------------
# 12. দুটো রেখার মধ্যে সবচেয়ে কম দূরত্ব (Shortest distance)
# ---------------------------------------------------------------------------
def op_shortest_distance_lines(p):
    l1 = _line_from_params(p, suffix="1")
    l2 = _line_from_params(p, suffix="2")

    d1, d2 = Matrix(l1.direction_ratio), Matrix(l2.direction_ratio)
    is_parallel = _run_with_timeout(lambda: l1.is_parallel(l2))

    dist = _run_with_timeout(lambda: l1.distance(l2))
    dist = simplify(dist)

    if is_parallel:
        relation = "The two lines are parallel."
    elif simplify(dist) == 0:
        relation = "The two lines intersect (shortest distance is 0)."
    else:
        relation = "The two lines are skew (they don't meet and aren't parallel)."

    steps = [
        "For skew lines through A (dir. a) and B (dir. b): shortest distance = |(B-A) · (a×b)| / |a×b|",
        "If a×b = 0, the lines are parallel and the distance is found differently.",
        f"Line 1: through {_fmt_point(l1.p1)}, direction {_fmt_vector(l1.direction_ratio)}",
        f"Line 2: through {_fmt_point(l2.p1)}, direction {_fmt_vector(l2.direction_ratio)}",
    ]
    return {"result": _fmt_num(dist), "extra": relation, "steps": steps}


# ---------------------------------------------------------------------------
# 13. তলের উপর বিন্দু থেকে লম্বের পাদবিন্দু
# ---------------------------------------------------------------------------
def op_foot_perpendicular_plane(p):
    P = _parse_point(p.get("point"), "Point")
    plane = _plane_from_params(p)
    foot = _run_with_timeout(lambda: plane.projection(P))
    steps = [
        "Foot of perpendicular = P - [(P-P0)·n / |n|²] · n, where P0 is any point on the plane and n its normal",
        f"Point = {_fmt_point(P)}, Plane: {_plane_equation_str(plane)}",
    ]
    return {"result": _fmt_point(foot), "steps": steps}


# ---------------------------------------------------------------------------
# 14. রেখার উপর বিন্দু থেকে লম্বের পাদবিন্দু
# ---------------------------------------------------------------------------
def op_foot_perpendicular_line(p):
    P = _parse_point(p.get("point"), "Point")
    line = _line_from_params(p)
    foot = _run_with_timeout(lambda: line.projection(P))
    steps = [
        "Foot of perpendicular = A + [(P-A)·d / |d|²] · d, where A is a point on the line and d its direction",
        f"Point = {_fmt_point(P)}, Line through {_fmt_point(line.p1)} with direction {_fmt_vector(line.direction_ratio)}",
    ]
    return {"result": _fmt_point(foot), "steps": steps}


# ---------------------------------------------------------------------------
# 15. তলে বিন্দুর প্রতিবিম্ব (Image / reflection)
# ---------------------------------------------------------------------------
def op_image_in_plane(p):
    P = _parse_point(p.get("point"), "Point")
    plane = _plane_from_params(p)

    def compute():
        Pm = Matrix(P)
        p0 = Matrix(plane.p1)
        n = Matrix(plane.normal_vector)
        t = (Pm - p0).dot(n) / n.dot(n)
        return Pm - 2 * t * n

    reflected = _run_with_timeout(compute)
    steps = [
        "Image of P in a plane: P' = P - 2·[(P-P0)·n / |n|²]·n, where P0 is on the plane and n its normal",
        f"Point = {_fmt_point(P)}, Plane: {_plane_equation_str(plane)}",
    ]
    return {"result": _fmt_point(tuple(reflected)), "steps": steps}


# ---------------------------------------------------------------------------
# 16. চারটে বিন্দু একই তলে আছে কিনা (Coplanarity)
# ---------------------------------------------------------------------------
def op_coplanarity(p):
    P1 = _parse_point(p.get("point1"), "Point 1")
    P2 = _parse_point(p.get("point2"), "Point 2")
    P3 = _parse_point(p.get("point3"), "Point 3")
    P4 = _parse_point(p.get("point4"), "Point 4")

    v1 = Matrix(P2) - Matrix(P1)
    v2 = Matrix(P3) - Matrix(P1)
    v3 = Matrix(P4) - Matrix(P1)
    triple_product = simplify(v1.dot(v2.cross(v3)))
    volume = simplify(Abs(triple_product) / 6)
    coplanar = triple_product == 0

    steps = [
        "Four points are coplanar if the scalar triple product (P2-P1)·[(P3-P1)×(P4-P1)] = 0",
        f"Scalar triple product = {_fmt_num(triple_product)}",
        f"Volume of the tetrahedron they form = {_fmt_num(volume)}",
    ]
    result = "Yes — the four points are coplanar" if coplanar else "No — the four points are NOT coplanar"
    return {"result": result, "extra": f"Tetrahedron volume = {_fmt_num(volume)}", "steps": steps}


# ---------------------------------------------------------------------------
# 17. একটা রেখা ও তলের ছেদবিন্দু
# ---------------------------------------------------------------------------
def op_intersection_line_plane(p):
    line = _line_from_params(p)
    plane = _plane_from_params(p)

    hits = _run_with_timeout(lambda: plane.intersection(line))
    steps = [
        "Substitute the line's parametric form x=x0+at, y=y0+bt, z=z0+ct into the plane's equation and solve for t",
        f"Line through {_fmt_point(line.p1)}, direction {_fmt_vector(line.direction_ratio)}",
        f"Plane: {_plane_equation_str(plane)}",
    ]

    if not hits:
        return {"result": "No intersection — the line is parallel to the plane", "steps": steps}
    if isinstance(hits[0], Line3D):
        return {"result": "The line lies entirely inside the plane (infinitely many intersection points)", "steps": steps}
    return {"result": _fmt_point(hits[0]), "steps": steps}


# ---------------------------------------------------------------------------
# Shared helpers: request params -> sympy Line3D / Plane
# ---------------------------------------------------------------------------
def _line_from_params(p, suffix=""):
    point_key = f"line_point{suffix}"
    dir_key = f"line_direction{suffix}"
    point2_key = f"line_point2{suffix}"
    mode = (p.get(f"line_mode{suffix}") or "point_direction").strip().lower()

    if mode == "two_points":
        P1 = _parse_point(p.get(point_key), f"Line {suffix or ''} point 1".strip())
        P2 = _parse_point(p.get(point2_key), f"Line {suffix or ''} point 2".strip())
        if P1 == P2:
            raise Geometry3DError(f"Line {suffix or ''} needs two distinct points".strip())
        return Line3D(P1, P2)

    P = _parse_point(p.get(point_key), f"Line {suffix or ''} point".strip())
    d = _parse_direction(p.get(dir_key), f"Line {suffix or ''} direction ratios".strip())
    return Line3D(P, direction_ratio=list(d))


def _plane_from_params(p):
    mode = (p.get("plane_mode") or "point_normal").strip().lower()
    if mode == "three_points":
        P1 = _parse_point(p.get("plane_point1"), "Plane point 1")
        P2 = _parse_point(p.get("plane_point2"), "Plane point 2")
        P3 = _parse_point(p.get("plane_point3"), "Plane point 3")
        try:
            return Plane(P1, P2, P3)
        except (GeometryError, ValueError):
            raise Geometry3DError("These three plane points are collinear — they don't determine a unique plane")

    P = _parse_point(p.get("plane_point"), "Plane point")
    n = _parse_direction(p.get("plane_normal"), "Plane normal vector")
    return Plane(P, normal_vector=n)


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------
OPERATIONS = {
    "distance_points": op_distance_points,
    "section_formula": op_section_formula,
    "direction_ratios": op_direction_ratios,
    "angle_between_lines": op_angle_between_lines,
    "angle_between_planes": op_angle_between_planes,
    "angle_line_plane": op_angle_line_plane,
    "plane_three_points": op_plane_three_points,
    "plane_point_normal": op_plane_point_normal,
    "line_two_points": op_line_two_points,
    "distance_point_plane": op_distance_point_plane,
    "distance_point_line": op_distance_point_line,
    "shortest_distance_lines": op_shortest_distance_lines,
    "foot_perpendicular_plane": op_foot_perpendicular_plane,
    "foot_perpendicular_line": op_foot_perpendicular_line,
    "image_in_plane": op_image_in_plane,
    "coplanarity": op_coplanarity,
    "intersection_line_plane": op_intersection_line_plane,
}


def solve_geometry3d(operation: str, params: dict) -> dict:
    handler = OPERATIONS.get(operation)
    if handler is None:
        raise Geometry3DError(f"Unknown operation: {operation}")
    params = params or {}
    try:
        return handler(params)
    except Geometry3DError:
        raise
    except ZeroDivisionError:
        raise Geometry3DError("This leads to a division by zero — check the inputs (e.g. duplicate points)")
    except GeometryError as e:
        raise Geometry3DError(str(e))
    except ValueError as e:
        raise Geometry3DError(str(e))
