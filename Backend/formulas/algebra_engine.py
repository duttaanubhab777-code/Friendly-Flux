"""
Algebra Engine
==============
A professional-grade, self-contained symbolic Algebra engine.

This module is intentionally independent from the other engines in this
project (calculus_engine.py, geometry3d_engine.py, ...). It follows the
same conventions used elsewhere in `formulas/` (a bounded thread-pool for
timeouts, a whitelist of allowed input characters, sympy for exact
symbolic math, and a small `XxxError` exception that the Flask layer turns
into a 400 response) so it fits the existing project without needing any
changes to how the other engines work.

Scope
-----
Expression simplification, linear/quadratic/polynomial equations,
factorization, systems of equations, inequalities (including compound and
absolute-value), rational/radical/exponential/logarithmic equations,
complex-number arithmetic, and simple parametric (symbolic-coefficient)
equations. Calculus, geometry, physics and chemistry are explicitly out of
scope for this module — those already have their own engines.

Public API
----------
    solve_algebra(raw_input: str, variable: str | None = None) -> dict

`variable` is optional — when the problem has more than one unknown (e.g.
"a*x + b = 0"), it tells the engine which symbol to solve for; otherwise a
sensible one is picked automatically (x, y, z, t, ... before a, b, c, ...).

The returned dict always has at least: success, input, normalized_input,
category, method, steps, result, warnings. Depending on the problem type it
may also include: solutions, numeric_solutions, domain_restrictions,
extraneous_solutions, verification, discriminant, nature_of_roots, vertex,
axis_of_symmetry, degree, note.

Security
--------
No eval()/exec() is ever used. All input goes through a strict character
whitelist and sympy's own parser (`parse_expr`) with a fixed, tiny set of
named functions/constants — never Python's builtins.
"""
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from sympy import (
    symbols, Symbol, Eq, Ne, Lt, Le, Gt, Ge, S,
    solve, solveset, linsolve, ConditionSet,
    simplify, expand, factor, cancel, together, fraction, nsimplify,
    sqrt, Abs, log, exp, I, E, pi, oo,
    factorial, root as sympy_root,
    Poly, roots, Mul, Add, Pow,
    Interval, Union, FiniteSet,
    re as s_re, im as s_im, atan2,
)
from sympy.core.relational import Relational
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor,
)

_TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)
_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="algebra-engine")
_TIMEOUT_SECONDS = 8

_MAX_LEN = 500
_MAX_OP_COUNT = 500
_MAX_SYSTEM_SIZE = 6
_MAX_POLY_DEGREE = 40

# Only what's needed for algebra — no trig/calculus functions here on purpose.
_LOCAL_DICT = {
    "e": E, "pi": pi, "oo": oo, "infinity": oo, "inf": oo, "i": I, "I": I,
    "log": log, "ln": log, "exp": exp, "sqrt": sqrt,
    "abs": Abs, "Abs": Abs, "factorial": factorial, "root": sympy_root,
}

# After abs-bar conversion the text should only ever contain these characters.
_ALLOWED_STATEMENT_CHARS = re.compile(r"^[0-9a-zA-Z_+\-*/^!(){}\[\].,;\n\s=<>]*$")

_REL_TOKEN_RE = r'!=|<=|>=|<|>|='
_REL_MAP = {'<': Lt, '<=': Le, '>': Gt, '>=': Ge, '!=': Ne, '=': Eq}
_PREFERRED_VAR_ORDER = ['x', 'y', 'z', 't', 'u', 'v', 'w', 'n', 'k', 'm']
_SUPERSCRIPTS = {'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
                  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'}


class AlgebraError(ValueError):
    """Raised for any user-facing algebra problem (bad input, unsupported
    problem, etc). The Flask layer maps this to an HTTP 400 response."""
    pass


# ---------------------------------------------------------------------------
# Low-level helpers: timeouts, formatting, safe parsing
# ---------------------------------------------------------------------------
def _run_with_timeout(func, seconds=_TIMEOUT_SECONDS):
    future = _EXECUTOR.submit(func)
    try:
        return future.result(timeout=seconds)
    except FutureTimeoutError:
        raise TimeoutError("This computation is too complex and timed out")


def _fmt(expr) -> str:
    """Human-readable formatting: ** -> ^, exp( -> e^(, log( -> ln(, I -> i."""
    try:
        text = str(expr)
    except Exception:
        return str(expr)
    text = text.replace("**", "^")
    text = text.replace("exp(", "e^(")
    text = text.replace("log(", "ln(")
    text = re.sub(r'\bI\b', 'i', text)
    return text


def _safe_numeric(expr):
    """Decimal approximation of a symbolic value, or None if it isn't purely numeric."""
    try:
        val = expr.evalf()
        if getattr(val, "is_real", None):
            return f"{float(val):.10g}"
        rp, ip = val.as_real_imag()
        rp, ip = float(rp), float(ip)
        if abs(ip) < 1e-12:
            return f"{rp:.10g}"
        sign = "+" if ip >= 0 else "-"
        return f"{rp:.6g} {sign} {abs(ip):.6g}i"
    except Exception:
        return None


def _verify_solution(lhs, rhs, var, sol):
    """Substitute `sol` back into the ORIGINAL equation and check it holds.
    Returns True / False, or None if it genuinely can't be determined
    (e.g. other free parameters remain)."""
    try:
        diff = _run_with_timeout(lambda: simplify(lhs.subs(var, sol) - rhs.subs(var, sol)))
        if diff == 0:
            return True
        if diff.free_symbols:
            return None
        val = complex(diff.evalf())
        return abs(val) < 1e-9
    except Exception:
        return None


def _superscript_repl(m):
    digits = ''.join(_SUPERSCRIPTS.get(c, '') for c in m.group(0))
    return '^' + digits


def _check_balanced_brackets(text: str) -> None:
    depth = 0
    for ch in text:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
            if depth < 0:
                raise AlgebraError("There's an extra closing bracket with no matching opening one")
    if depth > 0:
        raise AlgebraError("A bracket is missing its matching closing bracket")


def _convert_abs_bars(text: str) -> str:
    """Turn |...| into Abs(...). Assumes non-nested absolute values, which
    covers every realistic algebra problem (nested/overlapping |...| is
    ambiguous in plain-text input anyway)."""
    if text.count('|') % 2 != 0:
        raise AlgebraError("Unbalanced absolute value bars '|' — each |...| needs a matching pair")
    while '|' in text:
        first = text.index('|')
        second = text.index('|', first + 1)
        inner = text[first + 1:second]
        text = text[:first] + "Abs(" + inner + ")" + text[second + 1:]
    return text


def _preprocess(raw) -> str:
    if raw is None:
        raise AlgebraError("Input is empty")
    text = str(raw).strip()
    if not text:
        raise AlgebraError("Input is empty")
    if len(text) > _MAX_LEN:
        raise AlgebraError("Input is too long")
    text = (text.replace('≤', '<=').replace('≥', '>=').replace('≠', '!=')
                .replace('√', 'sqrt').replace('π', 'pi')
                .replace('÷', '/').replace('×', '*').replace('·', '*'))
    text = re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹]+', _superscript_repl, text)
    text = _convert_abs_bars(text)
    if not _ALLOWED_STATEMENT_CHARS.match(text):
        raise AlgebraError("The input contains characters that aren't allowed")
    _check_balanced_brackets(text)
    return text


def _parse(text: str):
    text = (text or "").strip()
    if not text:
        raise AlgebraError("Expression is empty")
    try:
        expr = parse_expr(text, local_dict=_LOCAL_DICT, transformations=_TRANSFORMS)
    except Exception:
        raise AlgebraError(f"Couldn't understand '{text}' — check the brackets and operators")
    try:
        if expr.count_ops() > _MAX_OP_COUNT:
            raise AlgebraError("This expression is too complex to process")
    except AlgebraError:
        raise
    except Exception:
        pass
    return expr


def _pick_variable(*exprs, hint=None):
    found = set()
    for e in exprs:
        try:
            found |= e.free_symbols
        except Exception:
            pass
    if not found:
        return None
    if hint:
        for s in found:
            if s.name == hint:
                return s
    by_name = {s.name: s for s in found}
    for name in _PREFERRED_VAR_ORDER:
        if name in by_name:
            return by_name[name]
    return sorted(found, key=lambda s: s.name)[0]


def _build_relational(lhs, rhs, op):
    cls = _REL_MAP.get(op)
    if cls is None:
        raise AlgebraError(f"Unknown relational operator '{op}'")
    return cls(lhs, rhs)


def _check_relational_truth(lhs, rhs, op):
    try:
        if op in ('=', '!='):
            lv, rv = complex(lhs.evalf()), complex(rhs.evalf())
            return (lv == rv) if op == '=' else (lv != rv)
        lv, rv = float(lhs.evalf()), float(rhs.evalf())
        return {'<': lv < rv, '<=': lv <= rv, '>': lv > rv, '>=': lv >= rv}[op]
    except Exception:
        raise AlgebraError("Couldn't evaluate this numeric statement")


def _fmt_interval_notation(s) -> str:
    if s == S.EmptySet:
        return "No solution (∅)"
    if s == S.Reals:
        return "All real numbers (-∞, ∞)"
    if isinstance(s, Union):
        return " ∪ ".join(_fmt_interval_notation(a) for a in s.args)
    if isinstance(s, Interval):
        left = "-∞" if s.left == -oo else _fmt(s.left)
        right = "∞" if s.right == oo else _fmt(s.right)
        lb, rb = ("(" if s.left_open else "["), (")" if s.right_open else "]")
        return f"{lb}{left}, {right}{rb}"
    if isinstance(s, FiniteSet):
        return "{" + ", ".join(_fmt(e) for e in s) + "}"
    return str(s)


def _fmt_solution_set(sol) -> str:
    if isinstance(sol, (Interval, Union, FiniteSet)) or sol == S.EmptySet or sol == S.Reals:
        return _fmt_interval_notation(sol)
    return str(sol).replace('&', 'and').replace('|', 'or')


def _has_var_in_radical(expr, var) -> bool:
    for node in expr.atoms(Pow):
        if node.exp.is_Rational and not node.exp.is_Integer and var in node.base.free_symbols:
            return True
    return False


def _has_var_in_exponent(expr, var) -> bool:
    for node in expr.atoms(Pow):
        if var in node.exp.free_symbols:
            return True
    for node in expr.atoms(exp):
        if var in node.args[0].free_symbols:
            return True
    return False


def _domain_from_structure(expr, var):
    """Best-effort list of domain restrictions implied by an expression's
    own structure (denominators, logs, even roots) — used by the
    'simplify an expression' path."""
    restrictions = set()
    try:
        _, den = fraction(together(expr))
        if var in den.free_symbols:
            for z in _run_with_timeout(lambda: solve(Eq(den, 0), var)):
                restrictions.add(f"{var} ≠ {_fmt(z)}")
    except Exception:
        pass
    for node in expr.atoms(log):
        arg = node.args[0]
        if var in arg.free_symbols:
            restrictions.add(f"{_fmt(arg)} > 0")
    for node in expr.atoms(Pow):
        if node.exp.is_Rational and node.exp.q % 2 == 0 and var in node.base.free_symbols:
            restrictions.add(f"{_fmt(node.base)} ≥ 0")
    return sorted(restrictions)


# ---------------------------------------------------------------------------
# Expression simplification (no relational operator at all)
# ---------------------------------------------------------------------------
def _handle_numeric_expression(expr, steps):
    val = simplify(expr)
    is_complex = bool(val.has(I)) or (val.is_real is False)
    result = {
        "category": "numeric_expression",
        "method": "Direct exact evaluation" + (" (complex arithmetic)" if is_complex else ""),
        "steps": steps,
        "result": _fmt(val),
        "warnings": [],
    }
    if is_complex:
        try:
            rp, ip = simplify(s_re(val)), simplify(s_im(val))
            modulus = simplify(sqrt(rp ** 2 + ip ** 2))
            argument = float(atan2(float(ip.evalf()), float(rp.evalf())))
            result.update({
                "rectangular_form": f"{_fmt(rp)} + {_fmt(ip)}i",
                "conjugate": f"{_fmt(rp)} - {_fmt(ip)}i",
                "modulus": _fmt(modulus),
                "argument_radians": f"{argument:.6g}",
                "argument_degrees": f"{argument * 180 / 3.14159265358979:.6g}°",
                "polar_form": f"{_fmt(modulus)}·(cos({argument:.4g}) + i·sin({argument:.4g}))",
            })
        except Exception:
            pass
    else:
        num = _safe_numeric(val)
        if num is not None:
            result["numeric_value"] = num
    return result


def _handle_expression(text):
    expr = _parse(text)
    steps = [f"Given expression: {_fmt(expr)}"]
    free_vars = sorted(expr.free_symbols, key=lambda s: s.name)
    if not free_vars:
        return _handle_numeric_expression(expr, steps)

    expanded = expand(expr)
    simplified = simplify(expr)
    try:
        factored = _run_with_timeout(lambda: factor(expr))
    except Exception:
        factored = expr

    _, den = fraction(together(expr))
    is_rational = any(v in den.free_symbols for v in free_vars)

    domain_restrictions = []
    if is_rational:
        for v in free_vars:
            domain_restrictions += _domain_from_structure(expr, v)
        cancelled = _run_with_timeout(lambda: cancel(expr))
        steps.append(f"Combine into a single fraction and cancel common factors: {_fmt(cancelled)}")
        primary = cancelled
        simplified = cancelled
        expanded_str = None
    else:
        steps.append(f"Expand: {_fmt(expanded)}")
        steps.append(f"Combine like terms / simplify: {_fmt(simplified)}")
        if factored != expr and str(factored) != str(simplified):
            steps.append(f"Factored form: {_fmt(factored)}")
        primary = expanded
        expanded_str = _fmt(expanded)

    return {
        "category": "algebraic_simplification",
        "method": "Expand / combine like terms / factor / cancel common factors",
        "steps": steps,
        "result": _fmt(primary),
        "expanded_form": expanded_str,
        "factored_form": _fmt(factored),
        "simplified_form": _fmt(simplified),
        "domain_restrictions": sorted(set(domain_restrictions)),
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Linear equation  (ax + b = 0,  possibly with symbolic parameters)
# ---------------------------------------------------------------------------
def _handle_linear(expanded_expr, lhs, rhs, var, params):
    poly = Poly(expanded_expr, var)
    a, b = poly.all_coeffs() if poly.degree() == 1 else (S(0), (poly.all_coeffs() or [S(0)])[0])

    steps = [
        f"Given: {_fmt(lhs)} = {_fmt(rhs)}",
        f"Move every term to one side: {_fmt(expanded_expr)} = 0",
        f"Collected form: ({_fmt(a)})·{var} + ({_fmt(b)}) = 0",
    ]

    a_is_symbolic = bool(a.free_symbols & set(params))

    if params and a_is_symbolic:
        pnames = ", ".join(str(p) for p in params)
        steps.append(f"Treating {pnames} as parameter(s) rather than numbers.")
        case_text = (
            f"If {_fmt(a)} ≠ 0:  {var} = -({_fmt(b)})/({_fmt(a)}) = {_fmt(simplify(-b / a))}\n"
            f"If {_fmt(a)} = 0 and {_fmt(b)} = 0:  infinitely many solutions (the equation is an identity)\n"
            f"If {_fmt(a)} = 0 and {_fmt(b)} ≠ 0:  no solution"
        )
        return {
            "category": "linear_equation_parametric",
            "method": "Isolate the variable, with a case split on the parameter(s)",
            "steps": steps,
            "result": case_text,
            "solutions": None,
            "warnings": [f"Parametric equation — the number of solutions depends on {pnames}"],
        }

    if params:
        pnames = ", ".join(str(p) for p in params)
        steps.append(f"Treating {pnames} as parameter(s); the coefficient of {var} is a fixed, nonzero number.")

    if a == 0:
        if b == 0:
            return {
                "category": "linear_equation", "method": "Identity check",
                "steps": steps + ["Both sides are identical for every value."],
                "result": f"Infinitely many solutions — true for every real {var}",
                "solutions": "all real numbers", "warnings": [],
            }
        return {
            "category": "linear_equation", "method": "Identity check",
            "steps": steps + [f"{_fmt(b)} = 0 is false, so no value of {var} works."],
            "result": "No solution", "solutions": [], "warnings": [],
        }

    sol = simplify(-b / a)
    steps.append(f"Isolate {var}: {var} = -({_fmt(b)}) / ({_fmt(a)}) = {_fmt(sol)}")
    return {
        "category": "linear_equation",
        "method": "Isolate the variable (move constants, divide by the coefficient)",
        "steps": steps,
        "result": f"{var} = {_fmt(sol)}",
        "solutions": [_fmt(sol)],
        "numeric_solutions": [n for n in [_safe_numeric(sol)] if n is not None],
        "verification": [_verify_solution(lhs, rhs, var, sol)],
        "warnings": [] if not params else [f"Solved in terms of parameter(s): {', '.join(str(p) for p in params)}"],
    }


# ---------------------------------------------------------------------------
# Quadratic equation  (ax^2 + bx + c = 0)
# ---------------------------------------------------------------------------
def _handle_quadratic(expanded_expr, lhs, rhs, var, params):
    poly = Poly(expanded_expr, var)
    a, b, c = poly.all_coeffs()

    steps = [
        f"Given: {_fmt(lhs)} = {_fmt(rhs)}",
        f"Standard form: ({_fmt(a)}){var}² + ({_fmt(b)}){var} + ({_fmt(c)}) = 0",
    ]

    a_is_symbolic = bool(a.free_symbols & set(params))

    if params and a_is_symbolic:
        pnames = ", ".join(str(p) for p in params)
        steps.append(f"Treating {pnames} as parameter(s).")
        note = (
            f"If {_fmt(a)} ≠ 0: use the quadratic formula with a={_fmt(a)}, b={_fmt(b)}, c={_fmt(c)}:\n"
            f"  {var} = (-({_fmt(b)}) ± √(({_fmt(b)})² - 4({_fmt(a)})({_fmt(c)}))) / (2·({_fmt(a)}))\n"
            f"If {_fmt(a)} = 0: the equation reduces to the linear equation "
            f"({_fmt(b)}){var} + ({_fmt(c)}) = 0."
        )
        try:
            sols = _run_with_timeout(lambda: solve(Eq(expanded_expr, 0), var))
        except Exception:
            sols = []
        return {
            "category": "quadratic_equation_parametric",
            "method": "Quadratic formula with a case split on the leading coefficient",
            "steps": steps, "result": note,
            "solutions": [_fmt(s) for s in sols],
            "warnings": [f"Parametric coefficients — see the case analysis ({pnames})"],
        }

    if params:
        pnames = ", ".join(str(p) for p in params)
        steps.append(f"Treating {pnames} as parameter(s); the leading coefficient is a fixed, nonzero number.")

    D = simplify(b ** 2 - 4 * a * c)
    steps.append(f"Discriminant: D = b² - 4ac = ({_fmt(b)})² - 4({_fmt(a)})({_fmt(c)}) = {_fmt(D)}")

    try:
        factored = _run_with_timeout(lambda: factor(expanded_expr))
        if factored != expanded_expr and isinstance(factored, Mul):
            steps.append(f"Factorization: {_fmt(factored)} = 0")
    except Exception:
        pass

    sqrtD = sqrt(D)
    r1 = simplify((-b + sqrtD) / (2 * a))
    r2 = simplify((-b - sqrtD) / (2 * a))
    steps.append(f"Quadratic formula: {var} = (-({_fmt(b)}) ± √D) / (2·({_fmt(a)}))")

    D_is_number = D.is_number
    if D_is_number:
        if D > 0:
            nature = "two distinct real roots"
        elif D == 0:
            nature = "one repeated real root"
        else:
            nature = "two complex conjugate roots"
        steps.append(f"Since D {'>' if D.is_positive else ('=' if D == 0 else '<')} 0, there are {nature}.")
    else:
        nature = f"depends on the sign of D = {_fmt(D)} (positive → two real roots, zero → one repeated " \
                  f"real root, negative → two complex conjugate roots)"
        steps.append(f"D is symbolic, so the nature of the roots {nature}.")

    roots_list = [r1] if (D_is_number and D == 0) else [r1, r2]
    unique_roots = list(dict.fromkeys(roots_list))

    vertex_x = simplify(-b / (2 * a))
    vertex_y = simplify(expanded_expr.subs(var, vertex_x))

    verification = None
    if not params:
        verification = [_verify_solution(lhs, rhs, var, r) for r in unique_roots]

    result = {
        "category": "quadratic_equation",
        "method": "Quadratic formula (with discriminant analysis)",
        "steps": steps,
        "result": " or ".join(f"{var} = {_fmt(r)}" for r in unique_roots),
        "solutions": [_fmt(r) for r in unique_roots],
        "numeric_solutions": [n for n in (_safe_numeric(r) for r in unique_roots) if n is not None],
        "discriminant": _fmt(D),
        "nature_of_roots": nature,
        "vertex": f"({_fmt(vertex_x)}, {_fmt(vertex_y)})",
        "axis_of_symmetry": f"{var} = {_fmt(vertex_x)}",
        "verification": verification,
        "warnings": [] if not params else [f"Solved in terms of parameter(s): {', '.join(str(p) for p in params)}"],
    }
    return result


# ---------------------------------------------------------------------------
# Higher-degree polynomial equation
# ---------------------------------------------------------------------------
def _handle_polynomial(expanded_expr, lhs, rhs, var, params):
    poly = Poly(expanded_expr, var)
    deg = poly.degree()
    steps = [
        f"Given: {_fmt(lhs)} = {_fmt(rhs)}",
        f"Polynomial form (degree {deg}): {_fmt(expanded_expr)} = 0",
    ]
    if params:
        steps.append(f"Note: {', '.join(str(p) for p in params)} are treated as parameters.")

    if deg > _MAX_POLY_DEGREE:
        return {
            "category": "polynomial_equation",
            "method": f"Factorization / root-finding for a degree-{deg} polynomial",
            "steps": steps,
            "result": f"Degree {deg} is beyond this engine's practical limit ({_MAX_POLY_DEGREE}) — "
                      "returning a controlled response instead of attempting an expensive computation.",
            "solutions": [], "numeric_solutions": [], "degree": deg,
            "note": "Computation too complex for the current limits.",
            "warnings": ["Degree too high for closed-form root finding"],
        }

    note = None
    try:
        factored = _run_with_timeout(lambda: factor(expanded_expr))
        if factored != expanded_expr:
            steps.append(f"Factorization: {_fmt(factored)} = 0")
    except TimeoutError:
        steps.append("(Factorization skipped — took too long)")
    except Exception:
        pass

    try:
        rts = _run_with_timeout(lambda: roots(poly))
    except Exception:
        rts = {}

    if rts:
        items = list(rts.items())
        result_text = "; ".join(
            f"{var} = {_fmt(r)}" + (f" (multiplicity {m})" if m > 1 else "")
            for r, m in items
        )
        solutions = [_fmt(r) for r, _ in items]
        numeric = [n for n in (_safe_numeric(r) for r, _ in items) if n is not None]
        verification = [_verify_solution(lhs, rhs, var, r) for r, _ in items]
        multiplicities = {_fmt(r): m for r, m in items}
    else:
        try:
            sols = _run_with_timeout(lambda: solve(Eq(expanded_expr, 0), var))
        except Exception:
            sols = []
        if not sols:
            result_text = (
                "No closed-form roots were found. For degree ≥ 5 polynomials this can genuinely "
                "have no expression in radicals (Abel–Ruffini theorem); it could also just be a "
                "very complex case for the current computation limits."
            )
            solutions, numeric, verification, multiplicities = [], [], [], {}
            note = "No closed-form solution found."
        else:
            result_text = "; ".join(f"{var} = {_fmt(s)}" for s in sols)
            solutions = [_fmt(s) for s in sols]
            numeric = [n for n in (_safe_numeric(s) for s in sols) if n is not None]
            verification = [_verify_solution(lhs, rhs, var, s) for s in sols]
            multiplicities = {}

    return {
        "category": "polynomial_equation",
        "method": f"Factorization / root-finding for a degree-{deg} polynomial",
        "steps": steps,
        "result": result_text,
        "solutions": solutions,
        "numeric_solutions": numeric,
        "degree": deg,
        "leading_coefficient": _fmt(poly.all_coeffs()[0]),
        "multiplicities": multiplicities,
        "verification": verification,
        "note": note,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Rational equation  (variable in a denominator)
# ---------------------------------------------------------------------------
def _handle_rational(expr, lhs, rhs, var):
    num, den = fraction(together(expr))
    steps = [f"Given: {_fmt(lhs)} = {_fmt(rhs)}"]

    restricted_vals = []
    if var in den.free_symbols:
        try:
            restricted_vals = _run_with_timeout(lambda: solve(Eq(den, 0), var))
        except Exception:
            restricted_vals = []
        steps.append(
            "Restricted value(s) (denominator = 0): "
            + (", ".join(f"{var} = {_fmt(z)}" for z in restricted_vals) if restricted_vals else "none")
        )

    steps.append(f"Combine into a single fraction: ({_fmt(num)}) / ({_fmt(den)}) = 0")
    steps.append(f"Clear the denominator: {_fmt(num)} = 0")

    try:
        candidates = _run_with_timeout(lambda: solve(Eq(num, 0), var))
    except Exception:
        candidates = []

    valid, extraneous, verification = [], [], []
    for c in candidates:
        if any(simplify(c - rv) == 0 for rv in restricted_vals):
            extraneous.append(c)
            verification.append(False)
            continue
        v = _verify_solution(lhs, rhs, var, c)
        verification.append(v)
        (valid if v is not False else extraneous).append(c)

    result_text = ("; ".join(f"{var} = {_fmt(c)}" for c in valid)
                   if valid else "No valid solution (every candidate was extraneous or restricted)")

    return {
        "category": "rational_equation",
        "method": "Combine fractions, clear denominators, solve, then reject extraneous/restricted values",
        "steps": steps,
        "result": result_text,
        "solutions": [_fmt(c) for c in valid],
        "domain_restrictions": [f"{var} ≠ {_fmt(z)}" for z in restricted_vals],
        "extraneous_solutions": [_fmt(c) for c in extraneous],
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Radical (surd) equation  (variable under a root)
# ---------------------------------------------------------------------------
def _handle_radical(lhs, rhs, var):
    steps = [
        f"Given: {_fmt(lhs)} = {_fmt(rhs)}",
        "Isolate the radical and raise both sides to the matching power to remove it, "
        "then check every candidate in the ORIGINAL equation (squaring can introduce extraneous roots).",
    ]
    try:
        candidates = _run_with_timeout(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        candidates = []

    valid, extraneous, verification = [], [], []
    for c in candidates:
        v = _verify_solution(lhs, rhs, var, c)
        verification.append(v)
        (valid if v is not False else extraneous).append(c)

    result_text = ("; ".join(f"{var} = {_fmt(c)}" for c in valid)
                   if valid else "No valid solution (candidate(s) were extraneous)")

    domain = set()
    for node in (lhs.atoms(Pow) | rhs.atoms(Pow)):
        if node.exp.is_Rational and node.exp.q % 2 == 0 and var in node.base.free_symbols:
            domain.add(f"{_fmt(node.base)} ≥ 0")

    return {
        "category": "radical_equation",
        "method": "Isolate the radical, raise both sides, solve, then verify against the original equation",
        "steps": steps,
        "result": result_text,
        "solutions": [_fmt(c) for c in valid],
        "extraneous_solutions": [_fmt(c) for c in extraneous],
        "domain_restrictions": sorted(domain),
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Exponential equation  (variable in an exponent)
# ---------------------------------------------------------------------------
def _handle_exponential(lhs, rhs, var):
    steps = [
        f"Given: {_fmt(lhs)} = {_fmt(rhs)}",
        f"'{var}' appears in an exponent — take logarithms of both sides (or match bases) to bring it down.",
    ]
    try:
        sols = _run_with_timeout(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        sols = []

    if not sols:
        return {
            "category": "exponential_equation", "method": "Logarithms / base matching",
            "steps": steps, "result": "No closed-form solution found",
            "solutions": [], "warnings": ["Could not solve this symbolically"],
        }

    # sympy's solve() sometimes returns extra complex branches from the
    # periodicity of the complex exponential (e.g. a^x = b has infinitely
    # many complex solutions differing by 2*pi*i*k/ln(a)). For a plain
    # algebra problem the real solution(s) are what's wanted, so prefer
    # those and only fall back to the complex branches if there's no real one.
    real_sols = [s for s in sols if s.is_real or (s.is_real is None and not s.has(I))]
    sols = real_sols if real_sols else sols

    numeric = [n for n in (_safe_numeric(s) for s in sols) if n is not None]
    verification = [_verify_solution(lhs, rhs, var, s) for s in sols]
    note = "This solution involves the Lambert W function (needed when the variable appears " \
           "both inside and outside an exponent)." if any('LambertW' in str(s) for s in sols) else None

    return {
        "category": "exponential_equation",
        "method": "Logarithms / base matching",
        "steps": steps,
        "result": "; ".join(f"{var} = {_fmt(s)}" for s in sols),
        "solutions": [_fmt(s) for s in sols],
        "numeric_solutions": numeric,
        "verification": verification,
        "note": note,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Logarithmic equation
# ---------------------------------------------------------------------------
def _handle_logarithmic(lhs, rhs, var):
    steps = [
        f"Given: {_fmt(lhs)} = {_fmt(rhs)}",
        "Use log identities to combine/isolate the logarithm(s), then rewrite in exponential form.",
    ]
    log_nodes = lhs.atoms(log) | rhs.atoms(log)
    domain = set()
    for node in log_nodes:
        arg = node.args[0]
        if var in arg.free_symbols:
            domain.add(f"{_fmt(arg)} > 0")

    try:
        candidates = _run_with_timeout(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        candidates = []

    valid, extraneous, verification = [], [], []
    for c in candidates:
        in_domain = True
        for node in log_nodes:
            arg = node.args[0]
            if var in arg.free_symbols:
                try:
                    val = arg.subs(var, c)
                    if val.is_real and float(val.evalf()) <= 0:
                        in_domain = False
                except Exception:
                    pass
        v = _verify_solution(lhs, rhs, var, c) if in_domain else False
        verification.append(v)
        (valid if in_domain and v is not False else extraneous).append(c)

    result_text = ("; ".join(f"{var} = {_fmt(c)}" for c in valid)
                   if valid else "No valid solution (candidate(s) violate the logarithm's domain)")

    return {
        "category": "logarithmic_equation",
        "method": "Log identities + domain check",
        "steps": steps,
        "result": result_text,
        "solutions": [_fmt(c) for c in valid],
        "extraneous_solutions": [_fmt(c) for c in extraneous],
        "domain_restrictions": sorted(domain),
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Absolute value equation
# ---------------------------------------------------------------------------
def _handle_absolute(lhs, rhs, var):
    steps = [f"Given: {_fmt(lhs)} = {_fmt(rhs)}"]
    candidates = []

    if lhs.atoms(Abs) and not rhs.atoms(Abs):
        inner = list(lhs.atoms(Abs))[0].args[0]
        steps.append(f"Case 1 (inside ≥ 0): {_fmt(inner)} = {_fmt(rhs)}")
        steps.append(f"Case 2 (inside < 0): {_fmt(inner)} = -({_fmt(rhs)})")
        try:
            c1 = _run_with_timeout(lambda: solve(Eq(inner, rhs), var))
            c2 = _run_with_timeout(lambda: solve(Eq(inner, -rhs), var))
            candidates = list(dict.fromkeys(c1 + c2))
        except Exception:
            candidates = []

    if not candidates:
        try:
            candidates = list(_run_with_timeout(lambda: solveset(Eq(lhs, rhs), var, domain=S.Reals)))
        except Exception:
            candidates = []

    valid, extraneous, verification = [], [], []
    for c in candidates:
        v = _verify_solution(lhs, rhs, var, c)
        verification.append(v)
        (valid if v is not False else extraneous).append(c)

    result_text = "; ".join(f"{var} = {_fmt(c)}" for c in valid) if valid else "No solution"

    return {
        "category": "absolute_value_equation",
        "method": "Case split on the sign inside the absolute value, then verify each candidate",
        "steps": steps,
        "result": result_text,
        "solutions": [_fmt(c) for c in valid],
        "extraneous_solutions": [_fmt(c) for c in extraneous],
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Fallback for equations that don't fit a specific category cleanly
# ---------------------------------------------------------------------------
def _handle_generic(lhs, rhs, var):
    steps = [f"Given: {_fmt(lhs)} = {_fmt(rhs)}"]
    try:
        sols = _run_with_timeout(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        sols = []
    if not sols:
        return {
            "category": "general_equation", "method": "Symbolic solve",
            "steps": steps,
            "result": "Could not find a closed-form solution — this may be outside the "
                      "engine's supported capabilities.",
            "solutions": [], "warnings": ["Unsupported or too complex for closed-form solving"],
        }
    verification = [_verify_solution(lhs, rhs, var, s) for s in sols]
    return {
        "category": "general_equation", "method": "Symbolic solve",
        "steps": steps,
        "result": "; ".join(f"{var} = {_fmt(s)}" for s in sols),
        "solutions": [_fmt(s) for s in sols],
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Equation dispatcher
# ---------------------------------------------------------------------------
def _finalize(result, lhs, rhs, var):
    result.setdefault("variable", str(var) if var is not None else None)
    result.setdefault("equation", f"{_fmt(lhs)} = {_fmt(rhs)}")
    return result


def _handle_equation(lhs_t, rhs_t, var_hint):
    lhs = _parse(lhs_t)
    rhs = _parse(rhs_t)
    expr = lhs - rhs
    free_vars = sorted(lhs.free_symbols | rhs.free_symbols, key=lambda s: s.name)

    if not free_vars:
        truth = _check_relational_truth(lhs, rhs, '=')
        return {
            "category": "numeric_equation", "method": "Direct evaluation",
            "steps": [f"{_fmt(lhs)} = {_fmt(rhs)}"],
            "result": "True — this equation is always true" if truth else "False — this equation has no solution",
            "solutions": [], "warnings": [],
        }

    var = _pick_variable(lhs, rhs, hint=var_hint)
    params = [v for v in free_vars if v != var]

    if expr.has(Abs):
        return _finalize(_handle_absolute(lhs, rhs, var), lhs, rhs, var)
    if expr.has(log):
        return _finalize(_handle_logarithmic(lhs, rhs, var), lhs, rhs, var)
    if _has_var_in_exponent(expr, var):
        return _finalize(_handle_exponential(lhs, rhs, var), lhs, rhs, var)
    if _has_var_in_radical(expr, var):
        return _finalize(_handle_radical(lhs, rhs, var), lhs, rhs, var)

    try:
        _, den = fraction(together(expr))
    except Exception:
        den = S(1)
    if var in den.free_symbols:
        return _finalize(_handle_rational(expr, lhs, rhs, var), lhs, rhs, var)

    try:
        expanded = expand(expr)
        poly = Poly(expanded, var)
    except Exception:
        return _finalize(_handle_generic(lhs, rhs, var), lhs, rhs, var)

    deg = poly.degree()
    if deg <= 0:
        coeffs = poly.all_coeffs()
        truth = (not coeffs) or coeffs[0] == 0
        return {
            "category": "numeric_equation", "method": "Direct evaluation",
            "steps": [f"'{var}' cancels out: {_fmt(expanded)} = 0"],
            "result": "True — infinitely many solutions" if truth else "False — no solution",
            "solutions": [], "warnings": [],
        }
    if deg == 1:
        return _finalize(_handle_linear(expanded, lhs, rhs, var, params), lhs, rhs, var)
    if deg == 2:
        return _finalize(_handle_quadratic(expanded, lhs, rhs, var, params), lhs, rhs, var)
    return _finalize(_handle_polynomial(expanded, lhs, rhs, var, params), lhs, rhs, var)


# ---------------------------------------------------------------------------
# Inequalities (simple and compound)
# ---------------------------------------------------------------------------
def _solve_relational(rel, var):
    try:
        sol = _run_with_timeout(lambda: solveset(rel, var, domain=S.Reals))
    except Exception:
        sol = None
    if sol is None or isinstance(sol, ConditionSet):
        try:
            from sympy import reduce_inequalities
            sol = _run_with_timeout(lambda: reduce_inequalities([rel], [var]))
        except Exception:
            raise AlgebraError("Couldn't solve this inequality")
    return sol


def _handle_inequality_simple(lhs_t, op, rhs_t):
    lhs, rhs = _parse(lhs_t), _parse(rhs_t)
    expr = lhs - rhs
    var = _pick_variable(lhs, rhs)

    if var is None:
        truth = _check_relational_truth(lhs, rhs, op)
        return {
            "category": "inequality", "method": "Direct evaluation",
            "steps": [f"{_fmt(lhs)} {op} {_fmt(rhs)}"],
            "result": "True" if truth else "False", "solutions": [], "warnings": [],
        }

    rel = _build_relational(lhs, rhs, op)
    has_abs = expr.has(Abs)
    num, den = fraction(together(expr))
    is_rational = var in den.free_symbols

    steps = [f"Given: {_fmt(lhs)} {op} {_fmt(rhs)}", f"Rewrite as: {_fmt(expand(expr))} {op} 0"]
    domain_restrictions = []
    if is_rational:
        try:
            zeros_den = _run_with_timeout(lambda: solve(Eq(den, 0), var))
        except Exception:
            zeros_den = []
        domain_restrictions = [f"{var} ≠ {_fmt(z)}" for z in zeros_den]
        steps.append("Denominator is zero at: " +
                      (", ".join(_fmt(z) for z in zeros_den) if zeros_den else "none") +
                      " — excluded from the domain")
    if has_abs:
        steps.append("Contains an absolute value — split into cases on the sign of the inner expression.")

    try:
        critical = _run_with_timeout(lambda: solve(Eq(num, 0), var))
        if critical:
            steps.append(f"Critical point(s) where the expression is zero: {', '.join(_fmt(c) for c in critical)}")
    except Exception:
        pass
    steps.append("Test the sign of the expression in each interval formed by the critical points / domain gaps.")

    sol = _solve_relational(rel, var)
    result_text = _fmt_solution_set(sol)

    return {
        "category": "inequality",
        "method": "Move everything to one side, find critical points, analyze signs",
        "steps": steps,
        "result": result_text,
        "domain_restrictions": domain_restrictions,
        "variable": str(var),
        "warnings": [],
    }


def _handle_compound_inequality(tokens):
    lo_t, op1, mid_t, op2, hi_t = tokens
    lo, mid, hi = _parse(lo_t), _parse(mid_t), _parse(hi_t)
    var = _pick_variable(mid)
    if var is None:
        raise AlgebraError("No variable found in this compound inequality")

    rel1 = _build_relational(lo, mid, op1)
    rel2 = _build_relational(mid, hi, op2)
    steps = [
        f"Given: {_fmt(lo)} {op1} {_fmt(mid)} {op2} {_fmt(hi)}",
        "Split into two inequalities, solve each, then take the intersection.",
    ]
    sol1 = _solve_relational(rel1, var)
    sol2 = _solve_relational(rel2, var)
    try:
        sol = sol1.intersect(sol2)
        result_text = _fmt_solution_set(sol)
    except Exception:
        result_text = f"({_fmt_solution_set(sol1)}) ∩ ({_fmt_solution_set(sol2)})"

    return {
        "category": "compound_inequality",
        "method": "Split into two inequalities, solve, then intersect",
        "steps": steps,
        "result": result_text,
        "variable": str(var),
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Systems of equations
# ---------------------------------------------------------------------------
def _solve_system(parts, var_hint):
    if len(parts) > _MAX_SYSTEM_SIZE:
        raise AlgebraError(f"Too many equations in the system (max {_MAX_SYSTEM_SIZE})")

    eqs, eq_strs, all_vars = [], [], set()
    for p in parts:
        tokens = [t.strip() for t in re.split(f'({_REL_TOKEN_RE})', p)]
        if len(tokens) != 3 or tokens[1] != '=':
            raise AlgebraError(f"'{p}' isn't a valid equation for a system — expected something like 'x + y = 3'")
        lhs, rhs = _parse(tokens[0]), _parse(tokens[2])
        eqs.append(Eq(lhs, rhs))
        eq_strs.append(f"{_fmt(lhs)} = {_fmt(rhs)}")
        all_vars |= lhs.free_symbols | rhs.free_symbols

    variables = sorted(all_vars, key=lambda s: s.name)
    if not variables:
        raise AlgebraError("No variables found in this system")
    if len(variables) > _MAX_SYSTEM_SIZE:
        raise AlgebraError("Too many variables in this system")

    steps = [f"Equation {i + 1}: {s}" for i, s in enumerate(eq_strs)]

    is_linear = True
    for eq in eqs:
        try:
            p = Poly(eq.lhs - eq.rhs, *variables)
            if p.total_degree() > 1:
                is_linear = False
                break
        except Exception:
            is_linear = False
            break

    if is_linear:
        steps.append("This is a linear system — solving by elimination / Gaussian elimination.")
        try:
            sol = _run_with_timeout(lambda: linsolve(eqs, variables))
        except Exception:
            sol = None
        if not sol:
            return {
                "category": "linear_system", "method": "Gaussian elimination (linsolve)",
                "steps": steps, "result": "No solution — the system is inconsistent",
                "solutions": {}, "warnings": [],
            }
        tuple_sol = list(sol)[0]
        free_params = set()
        for comp in tuple_sol:
            free_params |= (comp.free_symbols - set(variables))
        result_map = {str(v): _fmt(val) for v, val in zip(variables, tuple_sol)}
        result_text = ", ".join(f"{k} = {v}" for k, v in result_map.items())
        if free_params:
            return {
                "category": "linear_system", "method": "Gaussian elimination (linsolve)",
                "steps": steps,
                "result": f"Infinitely many solutions (parametric): {result_text}",
                "solutions": result_map,
                "free_parameters": sorted(str(s) for s in free_params),
                "warnings": [],
            }
        verification = []
        subs_map = dict(zip(variables, tuple_sol))
        for eq in eqs:
            try:
                d = simplify(eq.lhs.subs(subs_map) - eq.rhs.subs(subs_map))
                verification.append(d == 0)
            except Exception:
                verification.append(None)
        return {
            "category": "linear_system", "method": "Gaussian elimination (linsolve)",
            "steps": steps, "result": result_text,
            "solutions": result_map, "verification": verification, "warnings": [],
        }

    steps.append("This system is nonlinear — solving symbolically.")
    try:
        sols = _run_with_timeout(lambda: solve(eqs, variables, dict=True))
    except Exception:
        sols = []
    if not sols:
        return {
            "category": "nonlinear_system", "method": "Symbolic solve",
            "steps": steps,
            "result": "No solution found (or the system is too complex for a closed-form answer)",
            "solutions": [], "warnings": ["Could not solve symbolically"],
        }
    formatted = [{str(k): _fmt(v) for k, v in sd.items()} for sd in sols]
    result_text = " | ".join(", ".join(f"{k} = {v}" for k, v in fd.items()) for fd in formatted)
    return {
        "category": "nonlinear_system", "method": "Symbolic solve",
        "steps": steps, "result": result_text, "solutions": formatted, "warnings": [],
    }


# ---------------------------------------------------------------------------
# Top-level dispatch
# ---------------------------------------------------------------------------
def _split_system(text):
    parts = [p.strip() for p in re.split(r'[;\n]+', text) if p.strip()]
    return parts if parts else [text]


def _solve_single(text, var_hint):
    tokens = [t for t in re.split(f'({_REL_TOKEN_RE})', text)]
    op_positions = [i for i, t in enumerate(tokens) if t in _REL_MAP]

    if not op_positions:
        return _handle_expression(text)

    if len(op_positions) == 1:
        lhs_t, op, rhs_t = tokens[0].strip(), tokens[1], tokens[2].strip()
        if op == '=':
            return _handle_equation(lhs_t, rhs_t, var_hint)
        return _handle_inequality_simple(lhs_t, op, rhs_t)

    if len(op_positions) == 2 and all(tokens[i] != '=' for i in op_positions):
        return _handle_compound_inequality([t.strip() for t in tokens])

    raise AlgebraError("Too many relational operators in one statement — "
                        "split it into a system (separate with ';') if you meant several equations")


def solve_algebra(raw_input: str, variable: str = None) -> dict:
    """Main entry point. See module docstring for the return shape."""
    text = _preprocess(raw_input)
    parts = _split_system(text)

    if len(parts) > 1:
        result = _solve_system(parts, variable)
    else:
        result = _solve_single(parts[0], variable)

    result.setdefault("success", True)
    result["input"] = raw_input
    result["normalized_input"] = text
    return result
