"""
Graph Engine — কোনো এক-চলকীয় এক্সপ্রেশন (sin(x), e^(-x^2), 1/x, …)
কে সংখ্যাগতভাবে স্যাম্পল করে গ্রাফ আঁকার জন্য বিন্দু তৈরি করে।

পার্সিং, ভ্যালিডেশন ও টাইমআউট লজিক calculus_engine থেকে শেয়ার করা —
যাতে একই নিয়মে এক্সপ্রেশন গ্রহণ/প্রত্যাখ্যান হয়।

পারফরম্যান্স নোট: sympy-এর lambdify ব্যবহার করে expression-টাকে একটা
vectorized numpy function-এ বদলে সব পয়েন্ট একসাথে (loop ছাড়া) হিসাব করা
হয় — এটা প্রতি-পয়েন্টে subs()+evalf() করার চেয়ে বহুগুণ দ্রুত, বিশেষ করে
num_points বড় হলে। কিছু বিরল sympy function numpy-তে lambdify না হলে
পুরনো ধীর কিন্তু নির্ভরযোগ্য per-point পদ্ধতিতে (_sample_slow) fallback
করা হয়।
"""
import math
import numpy as np
import sympy as sp

from engines.calculus_engine import (
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
    num_points = max(20, min(num_points, 2000))

    step = (xmax - xmin) / (num_points - 1)

    def _sample_slow():
        """পুরনো per-point পদ্ধতি — lambdify ব্যর্থ হলে fallback হিসেবে ব্যবহৃত।
        প্রতিটা পয়েন্টের জন্য আলাদা subs()+evalf() করে, তাই ধীর, কিন্তু
        যেকোনো sympy expression-এর জন্য নির্ভরযোগ্যভাবে কাজ করে।"""
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

    def _sample():
        x_vals = [xmin + i * step for i in range(num_points)]

        try:
            f = sp.lambdify(var, expr, modules=["numpy"])
            x_arr = np.array(x_vals, dtype=np.float64)
            with np.errstate(all="ignore"):  # log(negative), 1/0 ইত্যাদির warning চাপা দেওয়া
                y_raw = f(x_arr)
            y_arr = np.asarray(y_raw, dtype=np.complex128)
            # কিছু expression (যেমন শুধু ধ্রুবক) স্কেলার রিটার্ন করতে পারে —
            # তখন পুরো x_arr-এর জন্য একই মান broadcast করে দেওয়া হচ্ছে
            if y_arr.shape == ():
                y_arr = np.full(x_arr.shape, y_arr, dtype=np.complex128)
        except Exception:
            return _sample_slow()

        local_points = []
        for x_val, y_val in zip(x_vals, y_arr):
            if np.isfinite(y_val.real) and abs(y_val.imag) < 1e-9:
                local_points.append({"x": round(float(x_val), 8), "y": round(float(y_val.real), 8)})

        if not local_points:
            # lambdify কারিগরিভাবে সফল হলেও কোনো ভ্যালিড পয়েন্ট না দিলে
            # (edge-case sympy/numpy semantics mismatch) নির্ভরযোগ্য
            # পদ্ধতিতে আবার চেষ্টা করা হচ্ছে, যাতে false negative না হয়
            return _sample_slow()
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
