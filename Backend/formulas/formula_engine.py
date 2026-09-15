"""
Formula Engine — হাইব্রিড ফরোয়ার্ড চেইনিং এবং অটো-ডেডলক ব্রേকার (Simultaneous Solver)
"""
import re
from sympy import (
    symbols, Eq, sympify, solve as sympy_solve,
    sin, cos, tan, exp, log, sqrt, pi, E, Abs,
)

_TOKEN_RE = re.compile(r'[a-zA-Z_][a-zA-Z0-9_]*')
_RESERVED = {
    'sin', 'cos', 'tan', 'exp', 'log', 'log10', 'ln', 'sqrt', 'pi', 'abs',
}

_MATH_LOCALS = {
    'sin': sin, 'cos': cos, 'tan': tan,
    'exp': exp, 'log': log, 'ln': log,
    'log10': lambda x: log(x) / log(10.0),
    'sqrt': sqrt, 'pi': pi, 'abs': Abs,
}


def parse_formula(formula_str: str) -> Eq:
    lhs_str, rhs_str = formula_str.split('=', 1)
    names = set(_TOKEN_RE.findall(formula_str)) - _RESERVED
    local_syms = {name: symbols(name) for name in names}
    local_syms.update(_MATH_LOCALS)
    return Eq(
        sympify(lhs_str.strip(), locals=local_syms),
        sympify(rhs_str.strip(), locals=local_syms)
    )


def solve_target(formula_strings: list, known_values: dict, target: str):
    equations = [parse_formula(f) for f in formula_strings]
    known = dict(known_values)
    steps = []

    if target in known:
        return known, steps

    progress = True
    while target not in known and progress:
        progress = False
        
        # ১. ফরোয়ার্ড চেইনিং (Forward Chaining) - ধাপে ধাপে মান বের করা
        for eq in equations:
            eq_vars = {str(s) for s in eq.free_symbols}
            unknown_vars = eq_vars - known.keys()

            if len(unknown_vars) == 1:
                unknown = next(iter(unknown_vars))
                substituted = eq.subs({symbols(k): v for k, v in known.items()})
                solved = sympy_solve(substituted, symbols(unknown))
                if solved:
                    real_solutions = [s for s in solved if getattr(s, "is_real", True)]
                    chosen = max(real_solutions) if real_solutions else solved[0]
                    known[unknown] = float(chosen)
                    steps.append(f"{unknown} = {known[unknown]}")
                    progress = True

        # ২. সাইমালটাস ফলব্যাক (যখন ফরোয়ার্ড চেইনিং আটকে যাবে, তখন ডেডলক ভাঙবে)
        if target not in known and not progress:
            subbed_eqs = [eq.subs({symbols(k): v for k, v in known.items()}) for eq in equations]
            candidate_eqs = [eq for eq in subbed_eqs if len(eq.free_symbols) >= 1 and len(eq.free_symbols) <= 3]

            for i in range(len(candidate_eqs)):
                for j in range(i + 1, len(candidate_eqs)):
                    eq1 = candidate_eqs[i]
                    eq2 = candidate_eqs[j]

                    common_symbols = eq1.free_symbols.intersection(eq2.free_symbols)
                    if common_symbols:
                        try:
                            solve_vars = list(common_symbols)
                            solutions = sympy_solve([eq1, eq2], solve_vars, dict=True)

                            if solutions:
                                found_new = False
                                for sol in solutions:
                                    for sym, val_expr in sol.items():
                                        var_name = str(sym)
                                        if var_name not in known:
                                            val = float(val_expr.evalf())
                                            if val > 0:  # পজিটিভ ফিজিক্যাল ভ্যালু ফিল্টার
                                                known[var_name] = val
                                                steps.append(f"Simultaneous solve: {var_name} = {val}")
                                                found_new = True
                                if found_new:
                                    progress = True
                                    break
                        except Exception:
                            continue
                    if progress:
                        break
                if progress:
                    break

    if target not in known:
        raise ValueError(f"'{target}' বের করার জন্য পর্যাপ্ত তথ্য নেই")

    return known, steps
