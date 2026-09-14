"""
Calculus Engine — ইউজার যা টাইপ করে (যেমন "sin(x)^2 * x") সেটাকে sympy দিয়ে
পার্স করে ডিফারেনশিয়েট বা ইন্টিগ্রেট করে। যত কঠিন এক্সপ্রেশনই হোক
(একাধিক চলরাশি, sin/cos/e/ln মেশানো থাকুক), sympy নিজেই বের করে।

এই ভার্সনে যেসব দুর্বলতা ঠিক করা হয়েছে:
  1. আগে signal.alarm() দিয়ে timeout করা হতো, যেটা শুধু main thread-এ কাজ করে।
     Flask যদি threaded/gunicorn মোডে চলে (production-এ সাধারণত চলে), তখন
     signal.alarm() ValueError ছুঁড়ে পুরো request crash করিয়ে দিতে পারত।
     এখন ThreadPoolExecutor দিয়ে timeout করা হচ্ছে — যেকোনো thread থেকে কাজ করে।
  2. Inverse hyperbolic (asinh/acosh/atanh) ও reciprocal hyperbolic
     (csch/sech/coth) ফাংশন আগে একদমই সাপোর্ট ছিল না — টাইপ করলে চুপচাপ
     ভুল উত্তর (unevaluated derivative) দিয়ে দিত, এরর দিত না। এখন যোগ করা হলো।
  3. factorial, floor, ceiling, sign, gamma, max/min যোগ করা হলো।
  4. Variable-এর নাম যদি কোনো ফাংশন/কনস্ট্যান্টের নামের সাথে মিলে যায়
     (যেমন কেউ "sin" বা "e" কে ভ্যারিয়েবল বানাতে চাইলে) — এখন স্পষ্ট এরর দেয়।
  5. Bracket mismatch হলে (যেমন "(" বেশি বা কম) নির্দিষ্ট করে বলে দেয়।
  6. খুব বেশি জটিল/nested এক্সপ্রেশন (server hang এড়াতে) আগেভাগেই আটকে দেয়।
  7. Mixed partial derivative সাপোর্ট — "x,y" এর মতো কমা দিয়ে একাধিক
     ভ্যারিয়েবল দিলে ∂²/∂x∂y বের করে দেয়।
  8. Complex/non-real ফলাফল হলে সেটা স্পষ্ট করে জানায়, ভুলভাবে round করে না।
"""
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from sympy import (
    symbols, sin, cos, tan, cot, sec, csc,
    asin, acos, atan, acot, asec, acsc,
    sinh, cosh, tanh, csch, sech, coth,
    asinh, acosh, atanh, acsch, asech, acoth,
    log, exp, sqrt, pi, E, oo, I,
    factorial, floor, ceiling, sign, gamma, Max, Min,
    Integral, diff, integrate, simplify, Abs, nsimplify, latex
)
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor,
)

_TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)

# একটা shared thread pool — request-ভিত্তিক নতুন thread না বানিয়ে পুনরায় ব্যবহার করা হয়
_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="calc-engine")

# ফাংশন/ধ্রুবকের নাম — এগুলো ছাড়া বাকি যেকোনো অক্ষর একেকটা ভ্যারিয়েবল ধরে নেওয়া হয়
_LOCAL_DICT = {
    "e": E, "pi": pi, "oo": oo, "infinity": oo, "inf": oo, "i": I,
    "sin": sin, "cos": cos, "tan": tan, "cot": cot, "sec": sec, "csc": csc,
    "asin": asin, "acos": acos, "atan": atan, "acot": acot, "asec": asec, "acsc": acsc,
    "arcsin": asin, "arccos": acos, "arctan": atan,
    "sinh": sinh, "cosh": cosh, "tanh": tanh, "csch": csch, "sech": sech, "coth": coth,
    "asinh": asinh, "acosh": acosh, "atanh": atanh,
    "acsch": acsch, "asech": asech, "acoth": acoth,
    "arcsinh": asinh, "arccosh": acosh, "arctanh": atanh,
    "log": log, "ln": log, "exp": exp, "sqrt": sqrt, "abs": Abs,
    "factorial": factorial, "floor": floor, "ceil": ceiling, "ceiling": ceiling,
    "sign": sign, "gamma": gamma, "max": Max, "min": Min,
}

# ইউজারের ইনপুটে শুধু এই ক্যারেক্টারগুলোই থাকতে পারবে — নিরাপত্তার জন্য
_ALLOWED_CHARS = re.compile(r"^[0-9a-zA-Z_+\-*/^!(){}.,\s]*$")
_MAX_LEN = 250
# sympy expression-এর জটিলতার (operation count) সীমা — এর বেশি হলে টাইমআউটের
# আগেই আটকে দেওয়া হয়, যাতে সার্ভার আটকে না থাকে
_MAX_OP_COUNT = 400
_TIMEOUT_SECONDS = 8


class CalculusError(ValueError):
    pass


def _check_balanced_brackets(text: str) -> None:
    depth = 0
    for ch in text:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth < 0:
                raise CalculusError("There's an extra ')' with no matching '(' — check your brackets")
    if depth > 0:
        raise CalculusError("A '(' is missing its matching ')' — check your brackets")


def _validate_and_preprocess(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        raise CalculusError("Expression is empty")
    if len(text) > _MAX_LEN:
        raise CalculusError("Expression is too long")
    if not _ALLOWED_CHARS.match(text):
        raise CalculusError("Expression contains characters that are not allowed")
    _check_balanced_brackets(text)
    return text


def _parse(text: str):
    try:
        expr = parse_expr(text, local_dict=_LOCAL_DICT, transformations=_TRANSFORMS)
    except Exception:
        raise CalculusError("Couldn't understand this expression — check the brackets and symbols")

    try:
        op_count = expr.count_ops()
    except Exception:
        op_count = 0
    if op_count > _MAX_OP_COUNT:
        raise CalculusError("This expression is too complex to process — try breaking it into smaller parts")
    return expr


def _run_with_timeout(func, seconds=_TIMEOUT_SECONDS):
    """
    কঠিন এক্সপ্রেশনে sympy কখনো কখনো অনেকক্ষণ আটকে থাকতে পারে। কয়েক সেকেন্ড
    পর জোর করে থামিয়ে দেওয়া হয় — ThreadPoolExecutor ব্যবহার করা হয়েছে বলে
    এটা main thread ছাড়াও (threaded Flask / gunicorn worker-এর ভেতরেও) কাজ
    করে। ব্যাকগ্রাউন্ড থ্রেডটা টাইমআউটের পরও কিছুক্ষণ চলতে পারে, কিন্তু
    ইউজারের request আটকে থাকে না।
    """
    future = _EXECUTOR.submit(func)
    try:
        return future.result(timeout=seconds)
    except FutureTimeoutError:
        raise TimeoutError("calculation took too long")


def _format_numeric(value) -> str:
    try:
        if value.is_real is False:
            re_part = value.as_real_imag()[0].evalf()
            im_part = value.as_real_imag()[1].evalf()
            return f"{re_part:.6g} + {im_part:.6g}i (complex value)"
    except Exception:
        pass
    try:
        return f"{float(value):.10g}"
    except Exception:
        return str(value)


def _format_result(expr) -> str:
    text = str(simplify(expr))
    text = text.replace("**", "^")
    text = text.replace("exp(", "e^(")
    text = text.replace("log(", "ln(")
    return text

def _format_latex(expr) -> str:
    return latex(simplify(expr))

def _resolve_variables(variable: str):
    """
    'x' -> single-variable mode
    'x,y' -> mixed-partial mode (ordered list of variables)
    """
    var_name = (variable or "x").strip() or "x"
    raw_names = [v.strip() for v in var_name.split(",") if v.strip()]
    if not raw_names:
        raw_names = ["x"]

    resolved = []
    for name in raw_names:
        if not re.fullmatch(r"[a-zA-Z_][a-zA-Z0-9_]*", name):
            raise CalculusError(f"'{name}' is not a valid variable name")
        if name.lower() in _LOCAL_DICT:
            raise CalculusError(
                f"'{name}' is a reserved function/constant name — please use a different "
                f"variable name, like x, y, t, or u"
            )
        resolved.append(symbols(name))
    return resolved


def solve_calculus(operation: str, expression: str, variable: str = "x", order: int = 1,
                    lower=None, upper=None):
    """
    operation: "differentiate" | "integrate"
    variable:  কোন চলরাশির সাপেক্ষে (একাধিক চলরাশি থাকলে বাকিগুলো ধ্রুবক ধরা হয়)।
               কমা দিয়ে একাধিক ভ্যারিয়েবল দিলে (যেমন "x,y") mixed partial ধরা হবে।
    order:     ডিফারেনশিয়েশনের ক্ষেত্রে কততম ডেরিভেটিভ (1, 2, 3...) — single-variable
               মোডেই কার্যকর; mixed-partial মোডে প্রতিটা ভ্যারিয়েবলে ঠিক একবার করে
               ডিফারেনশিয়েট করা হয়।
    lower/upper: ইন্টিগ্রেশনের ক্ষেত্রে দেওয়া থাকলে definite integral (যেমন "0", "pi")
    রিটার্ন করে dict: {result, is_numeric, is_definite, note}
    """
    expr_text = _validate_and_preprocess(expression)
    expr = _run_with_timeout(lambda: _parse(expr_text))


    variables = _resolve_variables(variable)
    is_mixed = len(variables) > 1

    try:
        order = int(order)
    except (TypeError, ValueError):
        order = 1
    order = max(1, min(order, 6))  # অযৌক্তিক বড় order (server-hang এড়াতে) সীমাবদ্ধ রাখা হলো

    if operation == "differentiate":
        missing = [str(v) for v in variables if v not in expr.free_symbols]
        if missing and len(missing) == len(variables):
            names = ", ".join(missing)
            return {"result": "0", "latex": "0", "is_numeric": False, "is_definite": False,
                    "note": f"None of '{names}' appear in the expression, so the derivative is 0."}

        if is_mixed:
            result_expr = _run_with_timeout(lambda: diff(expr, *variables))
            names = "".join(str(v) for v in variables)
            return {
                "result": _format_result(result_expr),
              "latex": _format_latex(result_expr),
                "is_numeric": False,
                "is_definite": False,
                "note": f"Mixed partial derivative ∂{len(variables)}/∂{names} "
                        f"(each variable differentiated once, in the order given).",
            }

        result_expr = _run_with_timeout(lambda: diff(expr, variables[0], order))
        return {
            "result": _format_result(result_expr),
          "latex": _format_latex(result_expr),
            "is_numeric": False,
            "is_definite": False,
            "note": None,
        }

    if operation == "integrate":
        if is_mixed:
            raise CalculusError("Integration currently supports one variable at a time")
        var = variables[0]
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
              "latex": _format_latex(result_expr),
                "numeric_result": _format_numeric(numeric_val),
                "is_numeric": True,
                "is_definite": True,
                "note": None,
            }

        result_expr = _run_with_timeout(lambda: integrate(expr, var))
        if result_expr.has(Integral):
            raise CalculusError(
                "No elementary (closed-form) antiderivative was found for this expression"
            )

        note = None
        if var not in expr.free_symbols:
            note = f"'{var}' does not appear in the expression, so it's treated as a constant multiplier."

        return {
            "result": _format_result(result_expr) + " + C",
          "latex": _format_latex(result_expr) + " + C",
            "is_numeric": False,
            "is_definite": False,
            "note": note,
        }

    raise CalculusError(f"Unknown operation: {operation}")
