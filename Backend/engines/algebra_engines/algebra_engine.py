"""
Algebra Engine
==============
The dispatcher and the equation solvers of the algebra package.

    algebra_core.py    shared plumbing  (errors, timeouts, safe parsing, resource guard)
    algebra_render.py  every step / answer in TWO forms: plain text + LaTeX
    algebra_matrix.py  matrices & determinants (det, inv, rank, eigen, A*B, A^n ...)
    algebra_engine.py  <- this file: chooses what kind of problem it is and solves it

Scope
-----
Expression simplification, linear / quadratic / polynomial equations, systems of
equations (with the matrix / Cramer's-rule working), inequalities (simple, compound,
absolute-value, rational), rational / radical / exponential / logarithmic equations,
complex-number arithmetic, parametric (symbolic-coefficient) equations, and every
matrix operation of algebra_matrix.py.  Calculus, geometry, physics and chemistry
have their own engines.

Public API
----------
    solve_algebra(raw_input: str, variable: str | None = None) -> dict

The returned dict always has: success, input, normalized_input, category, method,
steps (plain text), steps_latex (text with \\( ... \\) inline maths), result,
result_latex, warnings.  Depending on the problem it also has: solutions,
solutions_latex, numeric_solutions, verification, domain_restrictions(+_latex),
extraneous_solutions, extras [{key, plain, latex}], number_line, _g (matrix
transformation data) and the older single-purpose keys (discriminant, vertex,
nature_of_roots, degree, modulus ...) that the tests and older clients use.

Security
--------
No eval()/exec() on raw input.  Text passes a character whitelist, a resource
guard (algebra_core.guard_resources) and sympy's parser with a minimal namespace.
"""
import re

from sympy import (
    Symbol, Eq, Ne, Lt, Le, Gt, Ge, S,
    solve, solveset, linsolve, ConditionSet, linear_eq_to_matrix,
    simplify, expand, factor, cancel, together, fraction,
    sqrt, Abs, log, exp, I,
    Poly, roots, Mul, Pow,
    Interval, Union, FiniteSet, MatrixBase,
    re as s_re, im as s_im, atan2, oo,
)

from .algebra_core import (
    AlgebraError, Ctx, run_with_timeout, preprocess, parse, pick_variable,
    safe_numeric, 
    MAX_SYSTEM_SIZE, MAX_POLY_DEGREE, REL_TOKEN_RE,
)
from .algebra_render import (
    M, S as step, raw, fmt, tex, set_tex, rel, join_math, gathered, split_steps,
    add_extra, text_tex,
)
from . import algebra_matrix as _matrix   # importing registers det/inv/... for use inside equations

__all__ = ["solve_algebra", "AlgebraError"]

_REL_MAP = {"<": Lt, "<=": Le, ">": Gt, ">=": Ge, "!=": Ne, "=": Eq}

# Words the LaTeX strings may contain inside \text{...}; the frontend translates these.
_OR = r"\quad\text{or}\quad"
_AND = r"\text{ and }"


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def _parse_scalar(text):
    """parse() for places where a whole matrix makes no sense (equations, inequalities)."""
    e = parse(text)
    if isinstance(e, MatrixBase):
        raise AlgebraError("Equations and inequalities between whole matrices aren't supported — "
                           "use det(...), rank(...), trace(...) or the matrix commands instead")
    return e


def _timed(func):
    return run_with_timeout(func)


def _verify_solution(lhs, rhs, var, sol):
    """Substitute `sol` back into the ORIGINAL equation and check it holds.
    Returns True / False, or None if it genuinely can't be determined."""
    try:
        diff = _timed(lambda: simplify(lhs.subs(var, sol) - rhs.subs(var, sol)))
        if diff == 0:
            return True
        if diff.free_symbols:
            return None
        val = complex(diff.evalf())
        return abs(val) < 1e-9
    except Exception:
        return None


def _check_step(lhs, rhs, var, sol, verdict):
    """One worked line: substitute the candidate into the original equation."""
    lv = rv = None
    try:
        lv = simplify(lhs.subs(var, sol))
        rv = simplify(rhs.subs(var, sol))
    except Exception:
        pass
    mark = {True: "✓", False: "✗ (extraneous)", None: "?"}[verdict]
    head = ["Check ", M(var, " = ", sol), ": "]
    if lv is not None and rv is not None and lv.is_number and rv.is_number:
        head += ["left side ", M(lv), ", right side ", M(rv), "  →  ", mark]
    else:
        head += [mark]
    return step(*head)


def _m_lists(ms):
    """[M, M, ...] -> (plain list, latex list)"""
    return [m.plain for m in ms], [m.tex for m in ms]


def _eq_m(var, val):
    return M(var, " = ", val)


def _join_latex(items, sep=_OR):
    """x = 2  or  x = 3   (stacked on separate lines when there are many)."""
    if not items:
        return ""
    if len(items) <= 3:
        return sep.join(items)
    return gathered(items)


def _sols_payload(var, sols, joiner_plain="; "):
    """Result text + result LaTeX for a list of  var = value  solutions."""
    ms = [_eq_m(var, s_) for s_ in sols]
    return joiner_plain.join(m.plain for m in ms), _join_latex([m.tex for m in ms])


def _rel_symbol(op):
    return {"<=": "≤", ">=": "≥", "!=": "≠"}.get(op, op)


def _domain_pack(var, points):
    return _m_lists([M(var, " ≠ ", z) for z in points])


# ---------------------------------------------------------------------------
# Structure detection
# ---------------------------------------------------------------------------
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
    """Best-effort list of M(...) domain restrictions implied by an expression's own
    structure (denominators, logs, even roots)."""
    found = {}
    try:
        _, den = fraction(together(expr))
        if var in den.free_symbols:
            for z in _timed(lambda: solve(Eq(den, 0), var)):
                m = M(var, " ≠ ", z)
                found[m.plain] = m
    except Exception:
        pass
    for node in expr.atoms(log):
        arg = node.args[0]
        if var in arg.free_symbols:
            m = M(arg, " > 0")
            found[m.plain] = m
    for node in expr.atoms(Pow):
        if node.exp.is_Rational and node.exp.q % 2 == 0 and var in node.base.free_symbols:
            m = M(node.base, " ≥ 0")
            found[m.plain] = m
    return [found[k] for k in sorted(found)]


# ---------------------------------------------------------------------------
# Expression simplification (no relational operator at all)
# ---------------------------------------------------------------------------
def _handle_numeric_expression(expr, steps):
    val = simplify(expr)
    is_complex = bool(val.has(I)) or (val.is_real is False)
    if val != expr:
        steps.append(step("Evaluate exactly: ", M(expr, " = ", val)))
    result = {
        "category": "numeric_expression",
        "method": "Direct exact evaluation" + (" (complex arithmetic)" if is_complex else ""),
        "steps": steps,
        "result": fmt(val),
        "result_latex": tex(val),
        "warnings": [],
    }
    if is_complex:
        try:
            rp, ip = simplify(s_re(val)), simplify(s_im(val))
            modulus = simplify(sqrt(rp ** 2 + ip ** 2))
            argument = float(atan2(float(ip.evalf()), float(rp.evalf())))
            result.update({
                "rectangular_form": f"{fmt(rp)} + {fmt(ip)}i",
                "conjugate": f"{fmt(rp)} - {fmt(ip)}i",
                "modulus": fmt(modulus),
                "argument_radians": f"{argument:.6g}",
                "argument_degrees": f"{argument * 180 / 3.14159265358979:.6g}°",
                "polar_form": f"{fmt(modulus)}·(cos({argument:.4g}) + i·sin({argument:.4g}))",
            })
            add_extra(result, "rectangular", result["rectangular_form"], rf"{tex(rp)} + {tex(ip)}\,i")
            add_extra(result, "conjugate", result["conjugate"], rf"{tex(rp)} - {tex(ip)}\,i")
            add_extra(result, "modulus", result["modulus"], tex(modulus))
            add_extra(result, "argument", f"{argument:.6g} rad = {result['argument_degrees']}",
                      rf"{argument:.4g}\ \text{{rad}} = {argument * 180 / 3.14159265358979:.4g}^\circ")
            add_extra(result, "polar", result["polar_form"],
                      rf"{tex(modulus)}\left(\cos {argument:.4g} + i \sin {argument:.4g}\right)")
        except Exception:
            pass
    else:
        num = safe_numeric(val)
        if num is not None:
            result["numeric_value"] = num
            if not val.is_Integer:
                add_extra(result, "numeric", num, num)
    return result


def _handle_expression(text):
    expr = _parse_scalar(text)
    steps = [step("Given expression: ", M(expr))]
    free_vars = sorted(expr.free_symbols, key=lambda s_: s_.name)
    if not free_vars:
        return _handle_numeric_expression(expr, steps)

    expanded = _timed(lambda: expand(expr))
    simplified = _timed(lambda: simplify(expr))
    try:
        factored = _timed(lambda: factor(expr))
    except Exception:
        factored = expr

    _, den = fraction(together(expr))
    is_rational = any(v in den.free_symbols for v in free_vars)

    domain = []
    if is_rational:
        for v in free_vars:
            domain += _domain_from_structure(expr, v)
        cancelled = _timed(lambda: cancel(expr))
        steps.append(step("Combine into a single fraction and cancel common factors: ", M(cancelled)))
        primary = cancelled
        simplified = cancelled
        expanded_str = None
    else:
        steps.append(step("Expand: ", M(expanded)))
        steps.append(step("Combine like terms / simplify: ", M(simplified)))
        if factored != expr and str(factored) != str(simplified):
            steps.append(step("Factored form: ", M(factored)))
        primary = expanded
        expanded_str = fmt(expanded)

    dom_unique = {m.plain: m for m in domain}
    dom_list = [dom_unique[k] for k in sorted(dom_unique)]
    dom_plain, dom_tex = _m_lists(dom_list)
    if dom_list:
        steps.append(step("Values that are not allowed: ", join_math(dom_list)))

    result = {
        "category": "algebraic_simplification",
        "method": "Expand / combine like terms / factor / cancel common factors",
        "steps": steps,
        "result": fmt(primary),
        "result_latex": tex(primary),
        "expanded_form": expanded_str,
        "factored_form": fmt(factored),
        "simplified_form": fmt(simplified),
        "domain_restrictions": dom_plain,
        "domain_restrictions_latex": dom_tex,
        "warnings": [],
    }
    add_extra(result, "factored", fmt(factored), tex(factored))
    if not is_rational:
        add_extra(result, "simplified", fmt(simplified), tex(simplified))
    return result


# ---------------------------------------------------------------------------
# Linear equation  (ax + b = 0,  possibly with symbolic parameters)
# ---------------------------------------------------------------------------
def _handle_linear(expanded_expr, lhs, rhs, var, params):
    poly = Poly(expanded_expr, var)
    a, b = poly.all_coeffs() if poly.degree() == 1 else (S(0), (poly.all_coeffs() or [S(0)])[0])

    steps = [
        step("Given: ", rel(lhs, "=", rhs)),
        step("Move every term to one side: ", rel(expanded_expr, "=", 0)),
        step("Collected form: ", M("(", a, ")·", var, " + (", b, ") = 0")),
    ]

    a_is_symbolic = bool(a.free_symbols & set(params))
    pnames = ", ".join(str(p) for p in params)

    if params and a_is_symbolic:
        steps.append(step(f"Treating {pnames} as parameter(s) rather than numbers."))
        gen = simplify(-b / a)
        case_text = (
            f"If {fmt(a)} ≠ 0:  {var} = -({fmt(b)})/({fmt(a)}) = {fmt(gen)}\n"
            f"If {fmt(a)} = 0 and {fmt(b)} = 0:  infinitely many solutions (the equation is an identity)\n"
            f"If {fmt(a)} = 0 and {fmt(b)} ≠ 0:  no solution"
        )
        case_tex = gathered([
            r"\text{If } " + tex(a) + r" \ne 0:\quad " + tex(var) + " = " + tex(gen),
            r"\text{If } " + tex(a) + " = 0" + _AND + tex(b) + r" = 0:\quad \text{infinitely many solutions}",
            r"\text{If } " + tex(a) + " = 0" + _AND + tex(b) + r" \ne 0:\quad \text{no solution}",
        ])
        steps.append(step("Split into cases on the parameter, because the coefficient of ", M(var), " could be 0."))
        return {
            "category": "linear_equation_parametric",
            "method": "Isolate the variable, with a case split on the parameter(s)",
            "steps": steps, "result": case_text, "result_latex": case_tex,
            "solutions": None,
            "warnings": [f"Parametric equation — the number of solutions depends on {pnames}"],
        }

    if params:
        steps.append(step(f"Treating {pnames} as parameter(s); the coefficient of {var} is a fixed, nonzero number."))

    if a == 0:
        if b == 0:
            return {
                "category": "linear_equation", "method": "Identity check",
                "steps": steps + ["Both sides are identical for every value."],
                "result": f"Infinitely many solutions — true for every real {var}",
                "result_latex": r"\text{infinitely many solutions}",
                "solutions": "all real numbers", "warnings": [],
            }
        return {
            "category": "linear_equation", "method": "Identity check",
            "steps": steps + [step(M(b), " = 0 is false, so no value of ", M(var), " works.")],
            "result": "No solution", "result_latex": r"\text{no solution}",
            "solutions": [], "warnings": [],
        }

    sol = simplify(-b / a)
    steps.append(step("Isolate the variable: ", M(var, " = -(", b, ") / (", a, ") = ", sol)))
    verdict = _verify_solution(lhs, rhs, var, sol)
    steps.append(_check_step(lhs, rhs, var, sol, verdict))
    result_plain, result_tex = _sols_payload(var, [sol])
    return {
        "category": "linear_equation",
        "method": "Isolate the variable (move constants, divide by the coefficient)",
        "steps": steps,
        "result": result_plain, "result_latex": result_tex,
        "solutions": [fmt(sol)], "solutions_latex": [tex(sol)],
        "numeric_solutions": [n for n in [safe_numeric(sol)] if n is not None],
        "verification": [verdict],
        "warnings": [] if not params else [f"Solved in terms of parameter(s): {pnames}"],
    }


# ---------------------------------------------------------------------------
# Quadratic equation  (ax^2 + bx + c = 0)
# ---------------------------------------------------------------------------
def _handle_quadratic(expanded_expr, lhs, rhs, var, params):
    poly = Poly(expanded_expr, var)
    a, b, c = poly.all_coeffs()
    pnames = ", ".join(str(p) for p in params)

    steps = [
        step("Given: ", rel(lhs, "=", rhs)),
        step("Standard form ", M(raw("ax² + bx + c = 0", r"ax^{2} + bx + c = 0")), ": ",
             M("(", a, ")", var, "² + (", b, ")", var, " + (", c, ") = 0")),
    ]

    a_is_symbolic = bool(a.free_symbols & set(params))

    if params and a_is_symbolic:
        steps.append(step(f"Treating {pnames} as parameter(s)."))
        note = (
            f"If {fmt(a)} ≠ 0: use the quadratic formula with a={fmt(a)}, b={fmt(b)}, c={fmt(c)}:\n"
            f"  {var} = (-({fmt(b)}) ± √(({fmt(b)})² - 4({fmt(a)})({fmt(c)}))) / (2·({fmt(a)}))\n"
            f"If {fmt(a)} = 0: the equation reduces to the linear equation "
            f"({fmt(b)}){var} + ({fmt(c)}) = 0."
        )
        note_tex = gathered([
            r"\text{If } " + tex(a) + r" \ne 0:\quad " + tex(var) + r" = \frac{-\left(" + tex(b)
            + r"\right) \pm \sqrt{\left(" + tex(b) + r"\right)^{2} - 4\left(" + tex(a) + r"\right)\left("
            + tex(c) + r"\right)}}{2\left(" + tex(a) + r"\right)}",
            r"\text{If } " + tex(a) + r" = 0:\quad \left(" + tex(b) + r"\right)" + tex(var)
            + r" + \left(" + tex(c) + r"\right) = 0",
        ])
        try:
            sols = _timed(lambda: solve(Eq(expanded_expr, 0), var))
        except Exception:
            sols = []
        return {
            "category": "quadratic_equation_parametric",
            "method": "Quadratic formula with a case split on the leading coefficient",
            "steps": steps, "result": note, "result_latex": note_tex,
            "solutions": [fmt(s_) for s_ in sols], "solutions_latex": [tex(s_) for s_ in sols],
            "warnings": [f"Parametric coefficients — see the case analysis ({pnames})"],
        }

    if params:
        steps.append(step(f"Treating {pnames} as parameter(s); the leading coefficient is a fixed, nonzero number."))

    D = simplify(b ** 2 - 4 * a * c)
    steps.append(step("Discriminant: ", M("D = b² - 4ac = (", b, ")² - 4(", a, ")(", c, ") = ", D)))

    try:
        factored = _timed(lambda: factor(expanded_expr))
        if factored != expanded_expr and isinstance(factored, Mul):
            steps.append(step("Factorization: ", rel(factored, "=", 0)))
    except Exception:
        pass

    sqrtD = sqrt(D)
    r1 = simplify((-b + sqrtD) / (2 * a))
    r2 = simplify((-b - sqrtD) / (2 * a))
    steps.append(step("Quadratic formula: ", M(raw(f"{var} = (-b ± √D) / (2a)",
                                                    rf"{tex(var)} = \frac{{-b \pm \sqrt{{D}}}}{{2a}}"))))
    steps.append(step("Substitute: ", M(raw(f"{var} = (-({fmt(b)}) ± √({fmt(D)})) / (2·({fmt(a)}))",
                                             rf"{tex(var)} = \frac{{-\left({tex(b)}\right) \pm \sqrt{{{tex(D)}}}}}"
                                             rf"{{2\left({tex(a)}\right)}}"))))

    D_is_number = D.is_number
    if D_is_number:
        if D > 0:
            nature, sign_ = "two distinct real roots", ">"
        elif D == 0:
            nature, sign_ = "one repeated real root", "="
        else:
            nature, sign_ = "two complex conjugate roots", "<"
        steps.append(step("Since ", M(f"D {sign_} 0"), f", there are {nature}."))
    else:
        nature = (f"depends on the sign of D = {fmt(D)} (positive → two real roots, zero → one repeated "
                  f"real root, negative → two complex conjugate roots)")
        steps.append(step("D is symbolic, so the nature of the roots ", nature, "."))

    roots_list = [r1] if (D_is_number and D == 0) else [r1, r2]
    unique_roots = list(dict.fromkeys(roots_list))

    vertex_x = simplify(-b / (2 * a))
    vertex_y = simplify(expanded_expr.subs(var, vertex_x))

    verification = None
    if not params:
        verification = [_verify_solution(lhs, rhs, var, r_) for r_ in unique_roots]
        for r_, v_ in zip(unique_roots, verification):
            steps.append(_check_step(lhs, rhs, var, r_, v_))

    result_plain, result_tex = _sols_payload(var, unique_roots, " or ")
    result = {
        "category": "quadratic_equation",
        "method": "Quadratic formula (with discriminant analysis)",
        "steps": steps,
        "result": result_plain,
        "result_latex": result_tex,
        "solutions": [fmt(r_) for r_ in unique_roots],
        "solutions_latex": [tex(r_) for r_ in unique_roots],
        "numeric_solutions": [n for n in (safe_numeric(r_) for r_ in unique_roots) if n is not None],
        "discriminant": fmt(D),
        "nature_of_roots": nature,
        "vertex": f"({fmt(vertex_x)}, {fmt(vertex_y)})",
        "axis_of_symmetry": f"{var} = {fmt(vertex_x)}",
        "verification": verification,
        "warnings": [] if not params else [f"Solved in terms of parameter(s): {pnames}"],
    }
    add_extra(result, "discriminant", fmt(D), tex(D))
    add_extra(result, "nature", nature, None, text=True)
    add_extra(result, "vertex", result["vertex"], rf"\left({tex(vertex_x)},\ {tex(vertex_y)}\right)")
    add_extra(result, "axis", result["axis_of_symmetry"], rf"{tex(var)} = {tex(vertex_x)}")
    try:
        add_extra(result, "sum_roots", fmt(simplify(-b / a)), tex(simplify(-b / a)))
        add_extra(result, "product_roots", fmt(simplify(c / a)), tex(simplify(c / a)))
    except Exception:
        pass
    return result


# ---------------------------------------------------------------------------
# Higher-degree polynomial equation
# ---------------------------------------------------------------------------
def _handle_polynomial(expanded_expr, lhs, rhs, var, params):
    poly = Poly(expanded_expr, var)
    deg = poly.degree()
    steps = [
        step("Given: ", rel(lhs, "=", rhs)),
        step(f"Polynomial form (degree {deg}): ", rel(expanded_expr, "=", 0)),
    ]
    if params:
        steps.append(f"Note: {', '.join(str(p) for p in params)} are treated as parameters.")

    if deg > MAX_POLY_DEGREE:
        msg = (f"Degree {deg} is beyond this engine's practical limit ({MAX_POLY_DEGREE}) — "
               "returning a controlled response instead of attempting an expensive computation.")
        return {
            "category": "polynomial_equation",
            "method": f"Factorization / root-finding for a degree-{deg} polynomial",
            "steps": steps, "result": msg, "result_latex": text_tex(msg),
            "solutions": [], "numeric_solutions": [], "degree": deg,
            "note": "Computation too complex for the current limits.",
            "warnings": ["Degree too high for closed-form root finding"],
        }

    note = None
    try:
        factored = _timed(lambda: factor(expanded_expr))
        if factored != expanded_expr:
            steps.append(step("Factorization: ", rel(factored, "=", 0)))
            steps.append("A product is zero when one of its factors is zero — set each factor equal to 0.")
    except TimeoutError:
        steps.append("(Factorization skipped — took too long)")
    except Exception:
        pass

    try:
        rts = _timed(lambda: roots(poly))
    except Exception:
        rts = {}

    multiplicities = {}
    if rts:
        items = list(rts.items())
        sol_objs = [r_ for r_, _ in items]
        plain_lines, tex_lines = [], []
        for r_, m_ in items:
            mm = _eq_m(var, r_)
            plain_lines.append(mm.plain + (f" (multiplicity {m_})" if m_ > 1 else ""))
            tex_lines.append(mm.tex + (rf"\ \ (\text{{multiplicity }}{m_})" if m_ > 1 else ""))
        result_text = "; ".join(plain_lines)
        result_tex = _join_latex(tex_lines)
        solutions = [fmt(r_) for r_ in sol_objs]
        numeric = [n for n in (safe_numeric(r_) for r_ in sol_objs) if n is not None]
        verification = [_verify_solution(lhs, rhs, var, r_) for r_ in sol_objs]
        multiplicities = {fmt(r_): m_ for r_, m_ in items}
    else:
        try:
            sols = _timed(lambda: solve(Eq(expanded_expr, 0), var))
        except Exception:
            sols = []
        sol_objs = sols
        if not sols:
            result_text = (
                "No closed-form roots were found. For degree ≥ 5 polynomials this can genuinely "
                "have no expression in radicals (Abel–Ruffini theorem); it could also just be a "
                "very complex case for the current computation limits."
            )
            result_tex = text_tex(result_text)
            solutions, numeric, verification = [], [], []
            note = "No closed-form solution found."
        else:
            result_text, result_tex = _sols_payload(var, sols)
            solutions = [fmt(s_) for s_ in sols]
            numeric = [n for n in (safe_numeric(s_) for s_ in sols) if n is not None]
            verification = [_verify_solution(lhs, rhs, var, s_) for s_ in sols]

    out = {
        "category": "polynomial_equation",
        "method": f"Factorization / root-finding for a degree-{deg} polynomial",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": solutions, "solutions_latex": [tex(s_) for s_ in sol_objs],
        "numeric_solutions": numeric,
        "degree": deg,
        "leading_coefficient": fmt(poly.all_coeffs()[0]),
        "multiplicities": multiplicities,
        "verification": verification,
        "note": note,
        "warnings": [],
    }
    add_extra(out, "degree", str(deg), str(deg))
    add_extra(out, "leading_coefficient", out["leading_coefficient"], tex(poly.all_coeffs()[0]))
    return out


# ---------------------------------------------------------------------------
# Rational equation  (variable in a denominator)
# ---------------------------------------------------------------------------
def _handle_rational(expr, lhs, rhs, var):
    num, den = fraction(together(expr))
    steps = [step("Given: ", rel(lhs, "=", rhs))]

    restricted_vals = []
    if var in den.free_symbols:
        try:
            restricted_vals = _timed(lambda: solve(Eq(den, 0), var))
        except Exception:
            restricted_vals = []
        if restricted_vals:
            steps.append(step("Restricted value(s) (denominator = 0): ",
                              join_math([_eq_m(var, z) for z in restricted_vals])))
        else:
            steps.append("Restricted value(s) (denominator = 0): none")

    steps.append(step("Combine into a single fraction: ", M(raw(f"({fmt(num)}) / ({fmt(den)}) = 0",
                                                                  rf"\frac{{{tex(num)}}}{{{tex(den)}}} = 0"))))
    steps.append(step("Clear the denominator: ", rel(num, "=", 0)))

    try:
        candidates = _timed(lambda: solve(Eq(num, 0), var))
    except Exception:
        candidates = []
    if candidates:
        steps.append(step("Candidate(s): ", join_math([_eq_m(var, c) for c in candidates])))

    valid, extraneous, verification = [], [], []
    for c in candidates:
        if any(simplify(c - rv) == 0 for rv in restricted_vals):
            extraneous.append(c)
            verification.append(False)
            steps.append(step(M(var, " = ", c), " makes a denominator zero → rejected."))
            continue
        v = _verify_solution(lhs, rhs, var, c)
        verification.append(v)
        (valid if v is not False else extraneous).append(c)
        steps.append(_check_step(lhs, rhs, var, c, v))

    if valid:
        result_text, result_tex = _sols_payload(var, valid)
    else:
        result_text = "No valid solution (every candidate was extraneous or restricted)"
        result_tex = r"\text{no valid solution}"

    dom_plain, dom_tex = _domain_pack(var, restricted_vals)
    return {
        "category": "rational_equation",
        "method": "Combine fractions, clear denominators, solve, then reject extraneous/restricted values",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": [fmt(c) for c in valid], "solutions_latex": [tex(c) for c in valid],
        "domain_restrictions": dom_plain, "domain_restrictions_latex": dom_tex,
        "extraneous_solutions": [fmt(c) for c in extraneous],
        "extraneous_solutions_latex": [tex(c) for c in extraneous],
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Radical (surd) equation  (variable under a root)
# ---------------------------------------------------------------------------
def _handle_radical(lhs, rhs, var):
    steps = [
        step("Given: ", rel(lhs, "=", rhs)),
        "Isolate the radical and raise both sides to the matching power to remove it, "
        "then check every candidate in the ORIGINAL equation (squaring can introduce extraneous roots).",
    ]
    try:
        candidates = _timed(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        candidates = []
    if candidates:
        steps.append(step("Candidate(s): ", join_math([_eq_m(var, c) for c in candidates])))

    valid, extraneous, verification = [], [], []
    for c in candidates:
        v = _verify_solution(lhs, rhs, var, c)
        verification.append(v)
        (valid if v is not False else extraneous).append(c)
        steps.append(_check_step(lhs, rhs, var, c, v))

    if valid:
        result_text, result_tex = _sols_payload(var, valid)
    else:
        result_text = "No valid solution (candidate(s) were extraneous)"
        result_tex = r"\text{no valid solution}"

    domain = {}
    for node in (lhs.atoms(Pow) | rhs.atoms(Pow)):
        if node.exp.is_Rational and node.exp.q % 2 == 0 and var in node.base.free_symbols:
            m = M(node.base, " ≥ 0")
            domain[m.plain] = m
    dom_plain, dom_tex = _m_lists([domain[k] for k in sorted(domain)])

    return {
        "category": "radical_equation",
        "method": "Isolate the radical, raise both sides, solve, then verify against the original equation",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": [fmt(c) for c in valid], "solutions_latex": [tex(c) for c in valid],
        "extraneous_solutions": [fmt(c) for c in extraneous],
        "extraneous_solutions_latex": [tex(c) for c in extraneous],
        "domain_restrictions": dom_plain, "domain_restrictions_latex": dom_tex,
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Exponential equation  (variable in an exponent)
# ---------------------------------------------------------------------------
def _handle_exponential(lhs, rhs, var):
    steps = [
        step("Given: ", rel(lhs, "=", rhs)),
        step("The unknown ", M(var), " is in an exponent — take logarithms of both sides (or match bases) to bring it down."),
    ]
    try:
        sols = _timed(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        sols = []

    if not sols:
        return {
            "category": "exponential_equation", "method": "Logarithms / base matching",
            "steps": steps, "result": "No closed-form solution found",
            "result_latex": r"\text{no closed-form solution}",
            "solutions": [], "warnings": ["Could not solve this symbolically"],
        }

    # sympy's solve() sometimes returns extra complex branches from the periodicity of
    # the complex exponential; prefer the real solution(s).
    real_sols = [s_ for s_ in sols if s_.is_real or (s_.is_real is None and not s_.has(I))]
    sols = real_sols if real_sols else sols

    numeric = [n for n in (safe_numeric(s_) for s_ in sols) if n is not None]
    verification = [_verify_solution(lhs, rhs, var, s_) for s_ in sols]
    for s_, v_ in zip(sols, verification):
        steps.append(_check_step(lhs, rhs, var, s_, v_))
    note = ("This solution involves the Lambert W function (needed when the variable appears "
            "both inside and outside an exponent).") if any("LambertW" in str(s_) for s_ in sols) else None

    result_text, result_tex = _sols_payload(var, sols)
    return {
        "category": "exponential_equation",
        "method": "Logarithms / base matching",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": [fmt(s_) for s_ in sols], "solutions_latex": [tex(s_) for s_ in sols],
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
        step("Given: ", rel(lhs, "=", rhs)),
        "Use log identities to combine/isolate the logarithm(s), then rewrite in exponential form.",
    ]
    log_nodes = lhs.atoms(log) | rhs.atoms(log)
    domain = {}
    for node in log_nodes:
        arg = node.args[0]
        if var in arg.free_symbols:
            m = M(arg, " > 0")
            domain[m.plain] = m
    dom_list = [domain[k] for k in sorted(domain)]
    if dom_list:
        steps.append(step("A logarithm needs a positive argument: ", join_math(dom_list)))

    try:
        candidates = _timed(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        candidates = []
    if candidates:
        steps.append(step("Candidate(s): ", join_math([_eq_m(var, c) for c in candidates])))

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
        if in_domain:
            steps.append(_check_step(lhs, rhs, var, c, v))
        else:
            steps.append(step(M(var, " = ", c), " puts a negative (or zero) number inside a logarithm → rejected."))

    if valid:
        result_text, result_tex = _sols_payload(var, valid)
    else:
        result_text = "No valid solution (candidate(s) violate the logarithm's domain)"
        result_tex = r"\text{no valid solution}"

    dom_plain, dom_tex = _m_lists(dom_list)
    return {
        "category": "logarithmic_equation",
        "method": "Log identities + domain check",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": [fmt(c) for c in valid], "solutions_latex": [tex(c) for c in valid],
        "extraneous_solutions": [fmt(c) for c in extraneous],
        "extraneous_solutions_latex": [tex(c) for c in extraneous],
        "domain_restrictions": dom_plain, "domain_restrictions_latex": dom_tex,
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Absolute value equation
# ---------------------------------------------------------------------------
def _handle_absolute(lhs, rhs, var):
    steps = [step("Given: ", rel(lhs, "=", rhs))]
    candidates = []

    if lhs.atoms(Abs) and not rhs.atoms(Abs):
        inner = list(lhs.atoms(Abs))[0].args[0]
        steps.append(step("Case 1 (inside ≥ 0): ", rel(inner, "=", rhs)))
        steps.append(step("Case 2 (inside < 0): ", M(inner, " = -(", rhs, ")")))
        try:
            c1 = _timed(lambda: solve(Eq(inner, rhs), var))
            c2 = _timed(lambda: solve(Eq(inner, -rhs), var))
            candidates = list(dict.fromkeys(c1 + c2))
        except Exception:
            candidates = []

    if not candidates:
        try:
            candidates = list(_timed(lambda: solveset(Eq(lhs, rhs), var, domain=S.Reals)))
        except Exception:
            candidates = []

    valid, extraneous, verification = [], [], []
    for c in candidates:
        v = _verify_solution(lhs, rhs, var, c)
        verification.append(v)
        (valid if v is not False else extraneous).append(c)
        steps.append(_check_step(lhs, rhs, var, c, v))

    if valid:
        result_text, result_tex = _sols_payload(var, valid)
    else:
        result_text, result_tex = "No solution", r"\text{no solution}"

    return {
        "category": "absolute_value_equation",
        "method": "Case split on the sign inside the absolute value, then verify each candidate",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": [fmt(c) for c in valid], "solutions_latex": [tex(c) for c in valid],
        "extraneous_solutions": [fmt(c) for c in extraneous],
        "extraneous_solutions_latex": [tex(c) for c in extraneous],
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Fallback for equations that don't fit a specific category cleanly
# ---------------------------------------------------------------------------
def _handle_generic(lhs, rhs, var):
    steps = [step("Given: ", rel(lhs, "=", rhs))]
    try:
        sols = _timed(lambda: solve(Eq(lhs, rhs), var))
    except Exception:
        sols = []
    if not sols:
        msg = ("Could not find a closed-form solution — this may be outside the "
               "engine's supported capabilities.")
        return {
            "category": "general_equation", "method": "Symbolic solve",
            "steps": steps, "result": msg, "result_latex": text_tex(msg),
            "solutions": [], "warnings": ["Unsupported or too complex for closed-form solving"],
        }
    verification = [_verify_solution(lhs, rhs, var, s_) for s_ in sols]
    result_text, result_tex = _sols_payload(var, sols)
    return {
        "category": "general_equation", "method": "Symbolic solve",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "solutions": [fmt(s_) for s_ in sols], "solutions_latex": [tex(s_) for s_ in sols],
        "verification": verification,
        "warnings": [],
    }


# ---------------------------------------------------------------------------
# Equation dispatcher
# ---------------------------------------------------------------------------
def _finalize(result, lhs, rhs, var):
    result.setdefault("variable", str(var) if var is not None else None)
    result.setdefault("equation", f"{fmt(lhs)} = {fmt(rhs)}")
    result.setdefault("equation_latex", f"{tex(lhs)} = {tex(rhs)}")
    return result


def _check_relational_truth(lhs, rhs, op):
    try:
        if op in ("=", "!="):
            lv, rv = complex(lhs.evalf()), complex(rhs.evalf())
            return (lv == rv) if op == "=" else (lv != rv)
        lv, rv = float(lhs.evalf()), float(rhs.evalf())
        return {"<": lv < rv, "<=": lv <= rv, ">": lv > rv, ">=": lv >= rv}[op]
    except Exception:
        raise AlgebraError("Couldn't evaluate this numeric statement")


def _handle_equation(lhs_t, rhs_t, var_hint):
    lhs = _parse_scalar(lhs_t)
    rhs = _parse_scalar(rhs_t)
    expr = lhs - rhs
    free_vars = sorted(lhs.free_symbols | rhs.free_symbols, key=lambda s_: s_.name)

    if not free_vars:
        truth = _check_relational_truth(lhs, rhs, "=")
        return {
            "category": "numeric_equation", "method": "Direct evaluation",
            "steps": [step(rel(lhs, "=", rhs))],
            "result": "True — this equation is always true" if truth else "False — this equation has no solution",
            "result_latex": r"\text{true}" if truth else r"\text{false}",
            "solutions": [], "warnings": [],
        }

    var = pick_variable(lhs, rhs, hint=var_hint)
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
        expanded = _timed(lambda: expand(expr))
        poly = Poly(expanded, var)
    except TimeoutError:
        raise
    except Exception:
        return _finalize(_handle_generic(lhs, rhs, var), lhs, rhs, var)

    deg = poly.degree()
    if deg <= 0:
        coeffs = poly.all_coeffs()
        truth = (not coeffs) or coeffs[0] == 0
        return {
            "category": "numeric_equation", "method": "Direct evaluation",
            "steps": [step(M(var), " cancels out: ", rel(expanded, "=", 0))],
            "result": "True — infinitely many solutions" if truth else "False — no solution",
            "result_latex": r"\text{infinitely many solutions}" if truth else r"\text{no solution}",
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
def _fmt_interval_notation(s_) -> str:
    if s_ == S.EmptySet:
        return "No solution (∅)"
    if s_ == S.Reals:
        return "All real numbers (-∞, ∞)"
    if isinstance(s_, Union):
        return " ∪ ".join(_fmt_interval_notation(a) for a in s_.args)
    if isinstance(s_, Interval):
        left = "-∞" if s_.left == -oo else fmt(s_.left)
        right = "∞" if s_.right == oo else fmt(s_.right)
        lb, rb = ("(" if s_.left_open else "["), (")" if s_.right_open else "]")
        return f"{lb}{left}, {right}{rb}"
    if isinstance(s_, FiniteSet):
        return "{" + ", ".join(fmt(e) for e in s_) + "}"
    return str(s_)


def _fmt_solution_set(sol) -> str:
    if isinstance(sol, (Interval, Union, FiniteSet)) or sol == S.EmptySet or sol == S.Reals:
        return _fmt_interval_notation(sol)
    return str(sol).replace("&", "and").replace("|", "or")


def _solution_set_tex(sol) -> str:
    try:
        return set_tex(sol)
    except Exception:
        return text_tex(_fmt_solution_set(sol))


def _float_or_none(v):
    """±oo -> None (the frontend draws an arrow), otherwise a float."""
    try:
        if v in (oo, -oo):
            return None
        return float(v.evalf())
    except Exception:
        return None


def _number_line(sol):
    """A JSON description of a real solution set so the frontend can draw a number line:
    {"intervals": [{"lo","hi","lo_open","hi_open","lo_label","hi_label"}], "points": [{"x","label"}]}
    (lo / hi = None means the interval runs off to -oo / +oo)."""
    try:
        if sol == S.EmptySet:
            return {"intervals": [], "points": []}
        if sol == S.Reals:
            return {"intervals": [{"lo": None, "hi": None, "lo_open": True, "hi_open": True,
                                   "lo_label": None, "hi_label": None}], "points": []}
        pieces = list(sol.args) if isinstance(sol, Union) else [sol]
        intervals, points = [], []
        for p in pieces:
            if isinstance(p, Interval):
                intervals.append({"lo": _float_or_none(p.left), "hi": _float_or_none(p.right),
                                  "lo_open": bool(p.left_open), "hi_open": bool(p.right_open),
                                  "lo_label": None if p.left == -oo else fmt(p.left),
                                  "hi_label": None if p.right == oo else fmt(p.right)})
            elif isinstance(p, FiniteSet):
                for e in p:
                    v = _float_or_none(e)
                    if v is not None:
                        points.append({"x": v, "label": fmt(e)})
            else:
                return None
        return {"intervals": intervals, "points": points}
    except Exception:
        return None


def _solve_relational(rel_, var):
    try:
        sol = _timed(lambda: solveset(rel_, var, domain=S.Reals))
    except Exception:
        sol = None
    if sol is None or isinstance(sol, ConditionSet):
        try:
            from sympy import reduce_inequalities
            sol = _timed(lambda: reduce_inequalities([rel_], [var]))
        except Exception:
            raise AlgebraError("Couldn't solve this inequality")
    return sol


def _handle_inequality_simple(lhs_t, op, rhs_t):
    lhs, rhs = _parse_scalar(lhs_t), _parse_scalar(rhs_t)
    expr = lhs - rhs
    var = pick_variable(lhs, rhs)

    if var is None:
        truth = _check_relational_truth(lhs, rhs, op)
        return {
            "category": "inequality", "method": "Direct evaluation",
            "steps": [step(rel(lhs, op, rhs))],
            "result": "True" if truth else "False",
            "result_latex": r"\text{true}" if truth else r"\text{false}",
            "solutions": [], "warnings": [],
        }

    rel_ = _REL_MAP[op](lhs, rhs)
    has_abs = expr.has(Abs)
    num, den = fraction(together(expr))
    is_rational = var in den.free_symbols

    steps = [step("Given: ", rel(lhs, op, rhs)),
             step("Rewrite as: ", rel(_timed(lambda: expand(expr)), op, 0))]
    dom_plain, dom_tex = [], []
    if is_rational:
        try:
            zeros_den = _timed(lambda: solve(Eq(den, 0), var))
        except Exception:
            zeros_den = []
        dom_plain, dom_tex = _domain_pack(var, zeros_den)
        if zeros_den:
            steps.append(step("Denominator is zero at: ", join_math(zeros_den), " — excluded from the domain"))
        else:
            steps.append("Denominator is zero at: none — excluded from the domain")
    if has_abs:
        steps.append("Contains an absolute value — split into cases on the sign of the inner expression.")

    try:
        critical = _timed(lambda: solve(Eq(num, 0), var))
        if critical:
            steps.append(step("Critical point(s) where the expression is zero: ", join_math(critical)))
    except Exception:
        pass
    steps.append("Test the sign of the expression in each interval formed by the critical points / domain gaps.")

    sol = _solve_relational(rel_, var)
    steps.append(step("Solution set: ", M(raw(_fmt_solution_set(sol), _solution_set_tex(sol)))))

    out = {
        "category": "inequality",
        "method": "Move everything to one side, find critical points, analyze signs",
        "steps": steps,
        "result": _fmt_solution_set(sol),
        "result_latex": _solution_set_tex(sol),
        "domain_restrictions": dom_plain, "domain_restrictions_latex": dom_tex,
        "variable": str(var),
        "warnings": [],
    }
    nl = _number_line(sol)
    if nl is not None:
        out["number_line"] = nl
    return out


def _handle_compound_inequality(tokens):
    lo_t, op1, mid_t, op2, hi_t = tokens
    lo, mid, hi = _parse_scalar(lo_t), _parse_scalar(mid_t), _parse_scalar(hi_t)
    var = pick_variable(mid)
    if var is None:
        raise AlgebraError("No variable found in this compound inequality")

    rel1 = _REL_MAP[op1](lo, mid)
    rel2 = _REL_MAP[op2](mid, hi)
    steps = [
        step("Given: ", M(lo, f" {_rel_symbol(op1)} ", mid, f" {_rel_symbol(op2)} ", hi)),
        "Split into two inequalities, solve each, then take the intersection.",
    ]
    sol1 = _solve_relational(rel1, var)
    sol2 = _solve_relational(rel2, var)
    steps.append(step("Left part: ", rel(lo, op1, mid), "  →  ", M(raw(_fmt_solution_set(sol1), _solution_set_tex(sol1)))))
    steps.append(step("Right part: ", rel(mid, op2, hi), "  →  ", M(raw(_fmt_solution_set(sol2), _solution_set_tex(sol2)))))
    try:
        sol = sol1.intersect(sol2)
        result_text, result_tex = _fmt_solution_set(sol), _solution_set_tex(sol)
    except Exception:
        sol = None
        result_text = f"({_fmt_solution_set(sol1)}) ∩ ({_fmt_solution_set(sol2)})"
        result_tex = rf"\left({_solution_set_tex(sol1)}\right) \cap \left({_solution_set_tex(sol2)}\right)"
    steps.append(step("Intersection: ", M(raw(result_text, result_tex))))

    out = {
        "category": "compound_inequality",
        "method": "Split into two inequalities, solve, then intersect",
        "steps": steps,
        "result": result_text, "result_latex": result_tex,
        "variable": str(var),
        "warnings": [],
    }
    if sol is not None:
        nl = _number_line(sol)
        if nl is not None:
            out["number_line"] = nl
    return out


# ---------------------------------------------------------------------------
# Systems of equations
# ---------------------------------------------------------------------------
def _solve_system(parts, var_hint):
    if len(parts) > MAX_SYSTEM_SIZE:
        raise AlgebraError(f"Too many equations in the system (max {MAX_SYSTEM_SIZE})")

    eqs, all_vars, eq_ms = [], set(), []
    for p in parts:
        tokens = [t.strip() for t in re.split(f"({REL_TOKEN_RE})", p)]
        if len(tokens) != 3 or tokens[1] != "=":
            raise AlgebraError(f"'{p}' isn't a valid equation for a system — expected something like 'x + y = 3'")
        lhs, rhs = _parse_scalar(tokens[0]), _parse_scalar(tokens[2])
        eqs.append(Eq(lhs, rhs))
        eq_ms.append(rel(lhs, "=", rhs))
        all_vars |= lhs.free_symbols | rhs.free_symbols

    variables = sorted(all_vars, key=lambda s_: s_.name)
    if not variables:
        raise AlgebraError("No variables found in this system")
    if len(variables) > MAX_SYSTEM_SIZE:
        raise AlgebraError("Too many variables in this system")

    steps = [step(f"Equation {i + 1}: ", m) for i, m in enumerate(eq_ms)]

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
        steps.append(step("This is a linear system — solving by elimination / Gaussian elimination."))
        extras_from_matrix = {}
        try:
            # linear_eq_to_matrix(exprs, vars) returns (A, b) for  A·x = b  with exprs = 0
            A, b = linear_eq_to_matrix([eq.lhs - eq.rhs for eq in eqs], variables)
            extra_steps, extras_from_matrix = _matrix.linear_system_matrix_steps(A, b, variables)
            steps += extra_steps
        except Exception:
            pass
        try:
            sol = _timed(lambda: linsolve(eqs, variables))
        except Exception:
            sol = None
        if not sol:
            steps.append(step("The equations contradict each other, so there is no solution."))
            return {
                "category": "linear_system", "method": "Gaussian elimination (linsolve)",
                "steps": steps, "result": "No solution — the system is inconsistent",
                "result_latex": r"\text{no solution — the system is inconsistent}",
                "solutions": {}, "warnings": [],
            }
        tuple_sol = list(sol)[0]
        free_params = set()
        for comp in tuple_sol:
            free_params |= (comp.free_symbols - set(variables))
        result_map = {str(v): fmt(val) for v, val in zip(variables, tuple_sol)}
        result_map_tex = {str(v): tex(val) for v, val in zip(variables, tuple_sol)}
        pairs = [_eq_m(v, val) for v, val in zip(variables, tuple_sol)]
        result_text = ", ".join(m.plain for m in pairs)
        result_tex = gathered([m.tex for m in pairs]) if len(pairs) > 3 else r",\quad ".join(m.tex for m in pairs)

        if free_params:
            steps.append(step("There are fewer independent equations than unknowns, so the solution has free parameter(s): ",
                              join_math(sorted(free_params, key=lambda s_: s_.name))))
            return {
                "category": "linear_system", "method": "Gaussian elimination (linsolve)",
                "steps": steps,
                "result": f"Infinitely many solutions (parametric): {result_text}",
                "result_latex": r"\text{infinitely many solutions:}\quad " + result_tex,
                "solutions": result_map, "solutions_latex": result_map_tex,
                "free_parameters": sorted(str(s_) for s_ in free_params),
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
        steps.append(step("Solution: ", join_math(pairs)))
        steps.append(step("Check: substitute the solution into every original equation → "
                     + ("all true ✓" if all(v is True for v in verification) else "could not be fully confirmed")))
        out = {
            "category": "linear_system", "method": "Gaussian elimination (linsolve)",
            "steps": steps, "result": result_text, "result_latex": result_tex,
            "solutions": result_map, "solutions_latex": result_map_tex,
            "verification": verification, "warnings": [],
        }
        if "determinant" in extras_from_matrix:
            D = extras_from_matrix["determinant"]
            add_extra(out, "determinant", fmt(D), tex(D))
        add_extra(out, "unknowns", str(len(variables)), str(len(variables)))
        return out

    steps.append(step("This system is nonlinear — solving symbolically."))
    try:
        sols = _timed(lambda: solve(eqs, variables, dict=True))
    except Exception:
        sols = []
    if not sols:
        return {
            "category": "nonlinear_system", "method": "Symbolic solve",
            "steps": steps,
            "result": "No solution found (or the system is too complex for a closed-form answer)",
            "result_latex": r"\text{no solution found (or too complex for a closed form)}",
            "solutions": [], "warnings": ["Could not solve symbolically"],
        }
    formatted = [{str(k): fmt(v) for k, v in sd.items()} for sd in sols]
    formatted_tex = [{str(k): tex(v) for k, v in sd.items()} for sd in sols]
    sol_lines_plain, sol_lines_tex = [], []
    for k_, sd in enumerate(sols, 1):
        pairs = [_eq_m(kk, vv) for kk, vv in sd.items()]
        sol_lines_plain.append(", ".join(m.plain for m in pairs))
        sol_lines_tex.append(r",\quad ".join(m.tex for m in pairs))
        steps.append(step(f"Solution {k_}: ", join_math(pairs)))
    return {
        "category": "nonlinear_system", "method": "Symbolic solve",
        "steps": steps,
        "result": " | ".join(sol_lines_plain),
        "result_latex": gathered(sol_lines_tex) if len(sol_lines_tex) > 1 else sol_lines_tex[0],
        "solutions": formatted, "solutions_latex": formatted_tex, "warnings": [],
    }


# ---------------------------------------------------------------------------
# Top-level dispatch
# ---------------------------------------------------------------------------
def _split_system(text):
    parts = [p.strip() for p in re.split(r"[;\n]+", text) if p.strip()]
    return parts if parts else [text]


def _solve_single(text, var_hint):
    tokens = [t for t in re.split(f"({REL_TOKEN_RE})", text)]
    op_positions = [i for i, t in enumerate(tokens) if t in _REL_MAP]

    if not op_positions:
        return _handle_expression(text)

    if len(op_positions) == 1:
        lhs_t, op, rhs_t = tokens[0].strip(), tokens[1], tokens[2].strip()
        if op == "=":
            return _handle_equation(lhs_t, rhs_t, var_hint)
        return _handle_inequality_simple(lhs_t, op, rhs_t)

    if len(op_positions) == 2 and all(tokens[i] != "=" for i in op_positions):
        return _handle_compound_inequality([t.strip() for t in tokens])

    raise AlgebraError("Too many relational operators in one statement — "
                       "split it into a system (separate with ';') if you meant several equations")


def _to_result_latex(result):
    """Every result must carry result_latex; derive it from the plain text if a handler didn't."""
    if result.get("result_latex"):
        return
    plain = str(result.get("result", ""))
    try:
        result["result_latex"] = tex(parse(plain))
    except Exception:
        result["result_latex"] = text_tex(plain)


def _finish(result, raw_input, clean_text):
    plain, latex = split_steps(result.get("steps"))
    result["steps"], result["steps_latex"] = plain, latex
    result.setdefault("warnings", [])
    _to_result_latex(result)
    result.setdefault("success", True)
    result["input"] = raw_input
    result["normalized_input"] = clean_text
    return result


def solve_algebra(raw_input: str, variable:   None) -> dict:
    """Main entry point. See the module docstring for the return shape."""
    clean = preprocess(raw_input)
    ctx = Ctx()
    
    # [[1,2],[3,4]] / [1 2; 3 4] become placeholders BEFORE the text is split on ';'
    text, ctx = _matrix.extract_matrices(clean, ctx)
    parts = _split_system(text)

    result = None
    if len(parts) > 1:
        result = _solve_system(parts, variable)
    else:
        if not re.search(REL_TOKEN_RE, parts[0]):
            result = _matrix.try_solve(parts[0], ctx)      # commands / matrix arithmetic
        if result is None:
            result = _solve_single(parts[0], variable)
            
    return _finish(result, raw_input, clean)

