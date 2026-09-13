"""
Graph Engine — কোনো এক-চলকীয় এক্সপ্রেশন (sin(x), e^(-x^2), 1/x, …)
কে সংখ্যাগতভাবে স্যাম্পল করে গ্রাফ আঁকার জন্য বিন্দু তৈরি করে।

পার্সিং, ভ্যালিডেশন ও টাইমআউট লজিক calculus_engine থেকে শেয়ার করা —
যাতে একই নিয়মে এক্সপ্রেশন গ্রহণ/প্রত্যাখ্যান হয়।
"""
import math

from formulas.calculus_engine import (
    CalculusError,
    _validate_and_preprocess,
    _parse,
    _resolve_variables,
    _run_with_timeout,
)


def generate_graph_data(expression: str, variable: str = "x",
                        xmin: float = -10.0, xmax: float = 10.0,
                        num_points: int = 300):
    """
    Parse an expression of one free variable and sample it numerically
    over [xmin, xmax]. Returns a list of {x, y} dicts (only real finite values).
    Complex / undefined points are simply skipped so the frontend can draw
    continuous segments where the function is real.
    """
    expr_text = _validate_and_preprocess(expression)
    expr = _run_with_timeout(lambda: _parse(expr_text))

    variables = _resolve_variables(variable)
    if len(variables) > 1:
        raise CalculusError("Graphing currently supports only one variable at a time")

    var = variables[0]

    # If the expression has other free symbols, treat them as constants = 1
    free = expr.free_symbols - {var}
    if free:
        subs = {s: 1 for s in free}
        expr = expr.subs(subs)

    try:
        xmin = float(xmin)
        xmax = float(xmax)
    except (TypeError, ValueError):
        xmin, xmax = -10.0, 10.0
    if xmin >= xmax:
        raise CalculusError("xmin must be less than xmax")

    try:
        num_points = int(num_points)
    except (TypeError, ValueError):
        num_points = 300
    num_points = max(20, min(num_points, 1000))

    step = (xmax - xmin) / (num_points - 1)

    def _sample():
        local_points = []
        for i in range(num_points):
            x_val = xmin + i * step
            try:
                y_sym = expr.subs(var, x_val)
                y_num = complex(y_sym.evalf())
                if y_num.imag == 0 and math.isfinite(y_num.real):
                    local_points.append({"x": round(x_val, 8), "y": round(y_num.real, 8)})
            except Exception:
                continue
        return local_points

    points = _run_with_timeout(_sample, seconds=6)

    if not points:
        raise CalculusError(
            "Could not produce any real points for this expression in the given range. "
            "Try a different interval or check the domain."
        )

    return {
        "points": points,
        "variable": str(var),
        "xmin": xmin,
        "xmax": xmax,
        "expression": expression.strip(),
        "note": None if not free else (
            f"Other free symbols ({', '.join(str(s) for s in free)}) were treated as 1."
        ),
    }
