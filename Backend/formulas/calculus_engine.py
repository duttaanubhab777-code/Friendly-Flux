"""
Calculus Engine — ইউজার যা টাইপ করে (যেমন "sin(x)^2 * x") সেটাকে sympy দিয়ে
পার্স করে ডিফারেনশিয়েট বা ইন্টিগ্রেট করে। যত কঠিন এক্সপ্রেশনই হোক
(একাধিক চলরাশি, sin/cos/e/ln মেশানো থাকুক), sympy নিজেই বের করে।
"""
import re
import signal

from sympy import (
    symbols, sin, cos, tan, cot, sec, csc,
    asin, acos, atan, acot, asec, acsc,
    sinh, cosh, tanh, log, exp, sqrt, pi, E, oo, zoo,
    Symbol, Integral, diff, integrate, simplify, Abs, nsimplify
)
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor,
)

_TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)

# ফাংশন/ধ্রুবকের নাম — এগুলো ছাড়া বাকি যেকোনো অক্ষর একেকটা ভ্যারিয়েবল ধরে নেওয়া হয়
_LOCAL_DICT = {
    "e": E, "pi": pi, "oo": oo, "infinity": oo, "inf": oo,
    "sin": sin, "cos": cos, "tan": tan, "cot": cot, "sec": sec, "csc": csc,
    "asin": asin, "acos": acos, "atan": atan, "acot": acot, "asec": asec, "acsc": acsc,
    "sinh": sinh, "cosh": cosh, "tanh": tanh,
    "log": log, "ln": log, "exp": exp, "sqrt": sqrt, "abs": Abs,
}

# ইউজারের ইনপুটে শুধু এই ক্যারেক্টারগুলোই থাকতে পারবে — নিরাপত্তার জন্য
_ALLOWED_CHARS = re.compile(r"^[0-9a-zA-Z_+\-*/^(){}.,\s]*$")
_MAX_LEN = 250


class CalculusError(ValueError):
    pass


def _validate_and_preprocess(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        raise CalculusError("Expression is empty")
    if len(text) > _MAX_LEN:
        raise CalculusError("Expression is too long")
    if not _ALLOWED_CHARS.match(text):
        raise CalculusError("Expression contains characters that are not allowed")
    return text


def _parse(text: str):
    try:
        return parse_expr(text, local_dict=_LOCAL_DICT, transformations=_TRANSFORMS)
    except Exception:
        raise CalculusError("Couldn't understand this expression — check the brackets and symbols")


def _run_with_timeout(func, seconds=8):
    """
    কঠিন এক্সপ্রেশনে sympy কখনো কখনো অনেকক্ষণ আটকে থাকতে পারে (বা কার্যত
    অসীম সময় নেয়)। পুরো সার্ভার যেন আটকে না যায়, তাই কয়েক সেকেন্ড পর
    জোর করে থামিয়ে দেওয়া হয়। (শুধু Linux/Mac-এ কাজ করে — PythonAnywhere এ
    ঠিকঠাক চলবে; Windows-এ signal.alarm না থাকায় টাইমআউট ছাড়াই চলবে।)
    """
    if not hasattr(signal, "SIGALRM"):
        return func()

    def _handler(signum, frame):
        raise TimeoutError("calculation took too long")

    old_handler = signal.signal(signal.SIGALRM, _handler)
    signal.alarm(seconds)
    try:
        return func()
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)


def _format_result(expr) -> str:
    text = str(simplify(expr))
    text = text.replace("**", "^")
    text = text.replace("exp(", "e^(")
    text = text.replace("log(", "ln(")
    return text


def solve_calculus(operation: str, expression: str, variable: str = "x", order: int = 1,
                    lower=None, upper=None):
    """
    operation: "differentiate" | "integrate"
    variable:  কোন চলরাশির সাপেক্ষে (একাধিক চলরাশি থাকলে বাকিগুলো ধ্রুবক ধরা হয়)
    order:     ডিফারেনশিয়েশনের ক্ষেত্রে কততম ডেরিভেটিভ (1, 2, 3...)
    lower/upper: ইন্টিগ্রেশনের ক্ষেত্রে দেওয়া থাকলে definite integral (যেমন "0", "pi")
    রিটার্ন করে dict: {result, is_numeric, is_definite, note}
    """
    expr_text = _validate_and_preprocess(expression)
    expr = _run_with_timeout(lambda: _parse(expr_text))

    var_name = (variable or "x").strip() or "x"
    if not re.fullmatch(r"[a-zA-Z_][a-zA-Z0-9_]*", var_name):
        raise CalculusError("Invalid variable name")
    var = symbols(var_name)

    if var not in expr.free_symbols and operation == "differentiate":
        # ভ্যারিয়েবলটা এক্সপ্রেশনেই নেই — ডেরিভেটিভ তখন 0
        return {"result": "0", "is_numeric": False, "is_definite": False,
                "note": f"'{var_name}' does not appear in the expression, so its derivative is 0."}

    try:
        order = int(order)
    except (TypeError, ValueError):
        order = 1
    order = max(1, min(order, 6))  # অযৌক্তিক বড় order (server-hang এড়াতে) সীমাবদ্ধ রাখা হলো

    if operation == "differentiate":
        result_expr = _run_with_timeout(lambda: diff(expr, var, order))
        return {
            "result": _format_result(result_expr),
            "is_numeric": False,
            "is_definite": False,
            "note": None,
        }

    if operation == "integrate":
        is_definite = lower is not None and upper is not None and str(lower).strip() != "" and str(upper).strip() != ""

        if is_definite:
            lower_expr = _parse(_validate_and_preprocess(str(lower)))
            upper_expr = _parse(_validate_and_preprocess(str(upper)))
            result_expr = _run_with_timeout(lambda: integrate(expr, (var, lower_expr, upper_expr)))

            if result_expr.has(Integral):
                raise CalculusError("Couldn't evaluate this definite integral")

            numeric_val = _run_with_timeout(lambda: result_expr.evalf())
            return {
                "result": _format_result(result_expr),
                "numeric_result": str(numeric_val),
                "is_numeric": True,
                "is_definite": True,
                "note": None,
            }

        result_expr = _run_with_timeout(lambda: integrate(expr, var))
        if result_expr.has(Integral):
            raise CalculusError(
                "No elementary (closed-form) antiderivative was found for this expression"
            )
        return {
            "result": _format_result(result_expr) + " + C",
            "is_numeric": False,
            "is_definite": False,
            "note": None,
        }

    raise CalculusError(f"Unknown operation: {operation}")
