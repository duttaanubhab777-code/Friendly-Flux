"""
Formula Engine — string আকারে লেখা ফর্মুলা থেকে sympy দিয়ে ধাপে ধাপে
(forward-chaining) টার্গেট ভ্যারিয়েবল বের করে।
"""
import re
from sympy import symbols, Eq, sympify, solve as sympy_solve

_TOKEN_RE = re.compile(r'[a-zA-Z_][a-zA-Z0-9_]*')
_RESERVED = {'sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'pi', 'E'}


def parse_formula(formula_str: str) -> Eq:
    """ "F = m*a"  ->  Eq(F, m*a) """
    lhs_str, rhs_str = formula_str.split('=')
    names = set(_TOKEN_RE.findall(formula_str)) - _RESERVED
    local_syms = {name: symbols(name) for name in names}
    return Eq(
        sympify(lhs_str.strip(), locals=local_syms),
        sympify(rhs_str.strip(), locals=local_syms)
    )


def solve_target(formula_strings: list, known_values: dict, target: str):
    """
    formula_strings: ["F = m*a", "KE = m*v**2/2", ...]
    known_values: {"F": 50, "m": 2}
    target: "a"
    রিটার্ন করে (known: dict[str, float], steps: list[str])
    """
    equations = [parse_formula(f) for f in formula_strings]
    known = dict(known_values)
    steps = []

    if target in known:
        return known, steps

    progress = True
    while target not in known and progress:
        progress = False
        for eq in equations:
            eq_vars = {str(s) for s in eq.free_symbols}
            unknown_vars = eq_vars - known.keys()

            # ঠিক একটাই অজানা ভ্যারিয়েবল থাকলেই শুধু এই ইকুয়েশনটা কাজে লাগবে
            if len(unknown_vars) == 1:
                unknown = next(iter(unknown_vars))
                substituted = eq.subs({symbols(k): v for k, v in known.items()})
                solved = sympy_solve(substituted, symbols(unknown))
                if solved:
                    known[unknown] = float(solved[0])
                    steps.append(f"{unknown} = {known[unknown]}")
                    progress = True

    if target not in known:
        raise ValueError(f"'{target}' বের করার জন্য পর্যাপ্ত তথ্য নেই")

    return known, steps