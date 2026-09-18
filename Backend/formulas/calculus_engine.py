"""
Calculus Engine — ইউজার যা টাইপ করে (যেমন "sin(x)^2 * x") সেটাকে sympy দিয়ে
পার্স করে ডিফারেনশিয়েট বা ইন্টিগ্রেট করে।
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
    Integral, diff, integrate, simplify, Abs, nsimplify, latex,
    Poly, Pow, expand, preorder_traversal, Piecewise,
    hyper, meijerg, uppergamma, lowergamma, elliptic_e, elliptic_f, elliptic_k, elliptic_pi,
    gammasimp, count_ops, trigsimp, factor, cancel, radsimp,
    erf, erfc, Si, Ci, Ei, li, polylog
)
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor,
)

_TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)

_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="calc-engine")

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

_ALLOWED_CHARS = re.compile(r"^[0-9a-zA-Z_+\-*/^!(){}.,\s]*$")
_MAX_LEN = 250
_MAX_OP_COUNT = 400
_TIMEOUT_SECONDS = 20

class CalculusError(ValueError):
    pass

ALLOWED_CHARS = _ALLOWED_CHARS
MAX_EXPRESSION_LENGTH = _MAX_LEN

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

check_balanced_brackets = _check_balanced_brackets

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

def _pick_principal_branch(expr, var):
    if not isinstance(expr, Piecewise):
        return expr
    real_candidates = [val for val, cond in expr.args if not val.has(I)]
    if len(real_candidates) == 1:
        return real_candidates[0]
    return expr

def _textbook_form(expr):
    """
    একাধিক সরলীকরণ candidate বানিয়ে, যেটায় operation সংখ্যা সবচেয়ে কম সেটা বেছে নেয়।
    কেন blindly সব সময় cancel()+factor() না বসিয়ে candidate-ভিত্তিক পদ্ধতি —
    যাচাই করে দেখা গেছে এগুলো মাঝেমধ্যে উল্টো জটিল ফলাফল দেয় (যেমন x/(x+1)^2 এর
    ইন্টিগ্রালে log(x+1) + 1/(x+1) কে একটামাত্র বড় ভগ্নাংশে জুড়ে দেয়), তাই সবচেয়ে
    "ছোট" ফর্মটাই রাখা হয়। trigsimp সাধারণত নিরাপদ ও উপকারী (যেমন sin(x)^4 এর
    ইন্টিগ্রালকে double/quadruple-angle ফর্মে আনে) — কিন্তু দুটো mathematically-সমান
    antiderivative যেগুলো শুধু ধ্রুবকে (constant of integration) আলাদা
    (যেমন sin^2(x)/2 বনাম -cos^2(x)/2), সেটা কোনো simplification দিয়েই একরকম করা
    যায় না — কারণ ওটা ভুল না, শুধু ভিন্ন একটা বৈধ প্রতিনিধি।
    """
    candidates = [expr]
    try:
        candidates.append(simplify(expr))
    except Exception:
        pass
    try:
        candidates.append(trigsimp(expr))
    except Exception:
        pass
    try:
        candidates.append(cancel(factor(radsimp(trigsimp(simplify(expr))))))
    except Exception:
        pass
    try:
        return min(candidates, key=lambda e: count_ops(e))
    except Exception:
        return expr

def _format_result(expr) -> str:
    text = str(_textbook_form(expr))
    text = text.replace("**", "^")
    text = text.replace("exp(", "e^(")
    text = text.replace("log(", "ln(")
    return text

def _format_latex(expr) -> str:
    return latex(_textbook_form(expr), inv_trig_style="power", ln_notation=True)

def _resolve_variables(variable: str):
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

def _try_weierstrass(expr, var, seconds):
    """
    t = tan(var/2) বসিয়ে sin/cos-এর rational fraction-কে t-এর rational fraction
    বানিয়ে দেয় (sin = 2t/(1+t^2), cos = (1-t^2)/(1+t^2), dx = 2/(1+t^2) dt)।
    শুধু তখনই কাজ করে যখন expr-এ var শুধু sin(var)/cos(var)-এর ভেতর দিয়েই আসে
    (var আলাদাভাবে খোলা অবস্থায় থাকলে substitution-এর পর var রয়ে যাবে, তখন None রিটার্ন করে)।
    ইচ্ছাকৃতভাবে periodicity-এর branch-jump (floor()) correction বাদ দেওয়া হয়েছে,
    যাতে ফলাফল বইয়ের মতো সহজ দেখায় — তাই এটা indefinite integral-এর "+C" ফর্মের
    জন্য উপযুক্ত, কিন্তু সব ডোমেইনে ১০০% globally rigorous না। সব ত্রিকোণমিতিক
    ভগ্নাংশে কাজ করবে না (যেমন 1/(sin(x)+tan(x)) এটাতেও ফেইল করে)।
    """
    from sympy import Dummy
    try:
        if not (expr.has(sin(var)) or expr.has(cos(var))):
            return None
        t = Dummy('t', real=True)
        substituted = expr.subs({sin(var): 2 * t / (1 + t**2), cos(var): (1 - t**2) / (1 + t**2)})
        if substituted.has(var):
            return None
        integrand_t = substituted * (2 / (1 + t**2))
        result_t = _run_with_timeout(lambda: integrate(integrand_t, t), seconds=seconds)
    except Exception:
        return None
    if result_t is None or result_t.has(Integral):
        return None
    try:
        return result_t.subs(t, tan(var / 2))
    except Exception:
        return None

def _try_quadratic_shift(expr, var, seconds):
    quadratics = set()
    try:
        for node in preorder_traversal(expr):
            if isinstance(node, Pow):
                base = node.base
                if var in base.free_symbols and not base.free_symbols - {var}:
                    try:
                        p = Poly(base, var)
                        if p.degree() == 2:
                            quadratics.add(base)
                    except Exception:
                        continue
    except Exception:
        return None

    for quad in quadratics:
        try:
            p = Poly(quad, var)
            a, b, c = p.all_coeffs()
        except Exception:
            continue
        if a == 0:
            continue
        h = -b / (2 * a)
        if h == 0:
            continue

        try:
            shifted = expr.subs(var, var + h)
            shifted = shifted.replace(
                lambda e: isinstance(e, Pow),
                lambda e: Pow(expand(e.base), e.exp),
            )
            result = _run_with_timeout(lambda: integrate(shifted, var), seconds=seconds)
        except Exception:
            continue

        if result is not None and not result.has(Integral):
            back = result.subs(var, var - h)
            back = _pick_principal_branch(simplify(back), var)
            if not back.has(I):
                return back
    return None

def _try_binomial_differential(expr, var, seconds):
    from sympy import Pow, simplify, preorder_traversal, Dummy, S
    try:
        binomials = []
        for node in preorder_traversal(expr):
            if isinstance(node, Pow):
                base = node.base
                p = node.exp
                if not p.is_Rational or p.is_Integer:
                    continue
                c, addends = base.as_coeff_add(var)
                if len(addends) == 1:
                    term = addends[0]
                    coeff, factors = term.as_coeff_mul(var)
                    if len(factors) == 1 and isinstance(factors[0], Pow) and factors[0].base == var:
                        binomials.append((c, coeff, factors[0].exp, p, base))
                    elif len(factors) == 1 and factors[0] == var:
                        binomials.append((c, coeff, 1, p, base))

        for a_, b_, n, p, base in binomials:
            remainder = simplify(expr / (base**p))
            c_rem, factors_rem = remainder.as_coeff_mul(var)
            m = 0
            if len(factors_rem) == 0:
                m = 0
            elif len(factors_rem) == 1 and isinstance(factors_rem[0], Pow) and factors_rem[0].base == var:
                m = factors_rem[0].exp
            elif len(factors_rem) == 1 and factors_rem[0] == var:
                m = 1
            else:
                continue

            k1 = S(m + 1) / n
            
            # Case 1: (m+1)/n is integer
            if getattr(k1, 'is_Integer', False) and b_ != 0:
                u = Dummy('u')
                integrand_u = (1 / (b_ * n)) * (((u - a_) / b_)**(k1 - 1)) * (u**p)
                res_u = _run_with_timeout(lambda: integrate(simplify(integrand_u), u), seconds=seconds)
                if res_u is not None and not res_u.has(Integral):
                    return res_u.subs(u, a_ + b_ * var**n)

            k2 = k1 + p
            
            # Case 2: (m+1)/n + p is integer
            if getattr(k2, 'is_Integer', False) and a_ != 0:
                u = Dummy('u')
                integrand_u = (-1 / (a_ * n)) * (((u - b_) / a_)**(-k2 - 1)) * (u**p)
                res_u = _run_with_timeout(lambda: integrate(simplify(integrand_u), u), seconds=seconds)
                if res_u is not None and not res_u.has(Integral):
                    return res_u.subs(u, a_ * var**(-n) + b_)
    except Exception:
        pass
    return None

def _integrate_indefinite(expr, var):
    result_expr = Integral(expr, var)

    # 1. Fast mode
    try:
        res1 = _run_with_timeout(lambda: integrate(expr, var, meijerg=False), seconds=6)
        if not res1.has(Integral):
            result_expr = res1
    except Exception:
        pass

    # 2. Manual mode
    if result_expr.has(Integral):
        try:
            res2 = _run_with_timeout(lambda: integrate(simplify(expr), var, manual=True), seconds=6)
            if not res2.has(Integral):
                result_expr = res2
        except Exception:
            pass

    # 3. Heurisch mode
    if result_expr.has(Integral):
        try:
            res3 = _run_with_timeout(lambda: integrate(expr, var, heurisch=True), seconds=6)
            if not res3.has(Integral):
                result_expr = res3
        except Exception:
            pass

    # 3.5. Weierstrass Substitution (t = tan(x/2)) — ত্রিকোণমিতিক ভগ্নাংশের জন্য
    if result_expr.has(Integral):
        try:
            res_w = _try_weierstrass(expr, var, seconds=6)
            if res_w is not None:
                result_expr = res_w
        except Exception:
            pass

    # 4. Quadratic Shift (Completed square)
    if result_expr.has(Integral):
        try:
            res4 = _try_quadratic_shift(expr, var, seconds=6)
            if res4 is not None:
                result_expr = res4
        except Exception:
            pass

    # 5. Binomial Differential (Chebyshev)
    if result_expr.has(Integral):
        try:
            res_cheb = _try_binomial_differential(expr, var, seconds=6)
            if res_cheb is not None:
                result_expr = res_cheb
        except Exception:
            pass

    # 6. Default fallback & Gamma Cleanup
    if result_expr.has(Integral):
        try:
            res5 = _run_with_timeout(lambda: integrate(expr, var), seconds=10)
            if res5 is not None and not res5.has(Integral):
                clean_res5 = gammasimp(res5)
                result_expr = nsimplify(clean_res5, rational=True)
        except Exception:
            pass

    # 6.5. floor() (branch-jump correction) থেকে গেলে — বইয়ের মতো সহজ ফর্ম পাওয়া যায় কিনা
    #      Weierstrass দিয়ে আরেকবার চেষ্টা করি (stage 1-3 প্রায়ই floor()-সহ উত্তর দিয়ে আগেই
    #      থামিয়ে দেয়, তাই stage 3.5 পর্যন্ত পৌঁছায়ই না)
    if result_expr.has(floor):
        try:
            res_w2 = _try_weierstrass(expr, var, seconds=6)
            if (res_w2 is not None and not res_w2.has(floor)
                    and not res_w2.has(Integral)
                    and count_ops(res_w2) <= count_ops(result_expr)):
                result_expr = res_w2
        except Exception:
            pass

    if isinstance(result_expr, Piecewise):
        result_expr = _pick_principal_branch(result_expr, var)

    return result_expr

_SPECIAL_FUNCS = (hyper, meijerg, uppergamma, lowergamma,
                   elliptic_e, elliptic_f, elliptic_k, elliptic_pi,
                   erf, erfc, Si, Ci, Ei, li, polylog)

def _is_non_elementary(expr) -> bool:
    try:
        return any(expr.has(f) for f in _SPECIAL_FUNCS)
    except Exception:
        return False

def _series_fallback(expr, var, order=8, point=0):
    """
    যখন উত্তরে special function (erf, hyper, gamma...) চলে আসে — মানে কোনো elementary
    closed-form নেই — তখন x=point-এর কাছাকাছি integrand-কে টেইলর সিরিজে ভেঙে
    term-by-term ইন্টিগ্রেট করে একটা approximate পলিনমিয়াল দেয়।
    এটা exact antiderivative না, শুধু point-এর কাছাকাছি বৈধ একটা আসন্ন মান —
    তাই কখনোই মূল "result" হিসেবে ব্যবহার করা উচিত না, আলাদা field হিসেবে
    স্পষ্ট লেবেল দিয়ে দেখানো উচিত।
    """
    try:
        series_expr = expr.series(var, point, order).removeO()
        result = integrate(series_expr, var)
        if result is None or result.has(Integral):
            return None
        return result
    except Exception:
        return None

def solve_calculus(operation: str, expression: str, variable: str = "x", order: int = 1,
                    lower=None, upper=None):
    expr_text = _validate_and_preprocess(expression)
    expr = _run_with_timeout(lambda: _parse(expr_text))

    expr = nsimplify(expr, rational=True)

    variables = _resolve_variables(variable)
    real_subs = {s: symbols(s.name, real=True) for s in expr.free_symbols}
    expr = expr.subs(real_subs)
    variables = [symbols(v.name, real=True) for v in variables]

    is_mixed = len(variables) > 1

    try:
        order = int(order)
    except (TypeError, ValueError):
        order = 1
    order = max(1, min(order, 6))

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
        is_definite = (
            lower is not None and upper is not None
            and str(lower).strip() != "" and str(upper).strip() != ""
        )

        if is_definite:
            lower_expr = _parse(_validate_and_preprocess(str(lower)))
            upper_expr = _parse(_validate_and_preprocess(str(upper)))
            
            # প্রথমে SymPy-কে সরাসরি চেষ্টা করতে দিই
            result_expr = _run_with_timeout(lambda: integrate(expr, (var, lower_expr, upper_expr)))

            # যদি সে না পারে বা gamma/hyper হাবিজাবি দেয়, তখন আমাদের স্পেশাল ইঞ্জিন নামবে!
            if result_expr.has(Integral) or _is_non_elementary(result_expr):
                try:
                    # ১. অ্যান্টিডেরিভেটিভ বের করো (আমাদের সুপার ইঞ্জিন দিয়ে)
                    antideriv = _integrate_indefinite(expr, var)
                    
                    if not antideriv.has(Integral) and not _is_non_elementary(antideriv):
                        # ২. F(upper) - F(lower) ফর্মুলা প্রয়োগ করো
                        val_upper = antideriv.subs(var, upper_expr)
                        val_lower = antideriv.subs(var, lower_expr)
                        result_expr = simplify(val_upper - val_lower)
                except Exception:
                    pass

            if result_expr.has(Integral):
                # ৩. ক্লোজড-ফর্ম কিছুতেই না পাওয়া গেলে Numeric Quadrature দিয়ে
                #    সরাসরি সংখ্যাসূচক আসন্ন মান বের করার চেষ্টা করি
                numeric_only = None
                try:
                    numeric_only = _run_with_timeout(
                        lambda: Integral(expr, (var, lower_expr, upper_expr)).evalf(),
                        seconds=10,
                    )
                except Exception:
                    numeric_only = None

                if numeric_only is not None and numeric_only.is_number:
                    return {
                        "result": _format_numeric(numeric_only),
                        "latex": _format_latex(Integral(expr, (var, lower_expr, upper_expr))),
                        "numeric_result": _format_numeric(numeric_only),
                        "is_numeric": True,
                        "is_definite": True,
                        "note": (
                            "এই ইন্টিগ্রালের কোনো ক্লোজড-ফর্ম (elementary) উত্তর পাওয়া যায়নি, "
                            "তাই Numeric Quadrature (সংখ্যাসূচক পদ্ধতি) দিয়ে আসন্ন মান দেওয়া হলো।"
                        ),
                    }

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

        result_expr = _integrate_indefinite(expr, var)

        if result_expr.has(Integral):
            raise CalculusError(
                "No elementary (closed-form) antiderivative was found for this expression"
            )

        note = None
        series_approx = None
        if _is_non_elementary(result_expr):
            note = (
                "This integral has no elementary (algebraic/trig/exp/log) antiderivative. "
                "The result below uses a special function (hypergeometric/elliptic/gamma), "
                "which is mathematically correct but not standard for a textbook."
            )
            approx = _series_fallback(expr, var)
            if approx is not None:
                series_approx = {
                    "result": _format_result(approx),
                    "latex": _format_latex(approx),
                    "info": "x=0-এর কাছাকাছি ৮ পদের টেইলর সিরিজ থেকে পাওয়া আসন্ন মান — এটা exact উত্তর না।",
                }
        elif var not in expr.free_symbols:
            note = f"'{var}' does not appear in the expression, so it's treated as a constant multiplier."

        return {
            "result": _format_result(result_expr) + " + C",
            "latex": _format_latex(result_expr) + " + C",
            "is_numeric": False,
            "is_definite": False,
            "series_approx": series_approx,
            "note": note,
        }

    raise CalculusError(f"Unknown operation: {operation}")
