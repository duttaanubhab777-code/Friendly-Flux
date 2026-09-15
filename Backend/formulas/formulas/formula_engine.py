"""
Formula Engine — string আকারে লেখা ফর্মুলা থেকে sympy দিয়ে ধাপে ধাপে
(forward-chaining) টার্গেট ভ্যারিয়েবল বের করে।
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

# sympy locals so log10 / ln work inside formula strings
# Note: do NOT map bare "E" here — it would collide with energy symbols (E, E_cell, …)
_MATH_LOCALS = {
    'sin': sin, 'cos': cos, 'tan': tan,
    'exp': exp, 'log': log, 'ln': log,
    # NOTE: must be log(10.0) — not log(10) — or the base stays an exact
    # symbolic term (sympy won't auto-evaluate log(10) since 10 is an
    # Integer). Mixing that leftover symbolic log(10) with float
    # coefficients elsewhere in the equation made sympy's solve() hang
    # for several seconds on every pH/Nernst/rate-constant style formula.
    'log10': lambda x: log(x) / log(10.0),
    'sqrt': sqrt, 'pi': pi, 'abs': Abs,
}


def parse_formula(formula_str: str) -> Eq:
    """ "F = m*a"  ->  Eq(F, m*a) """
    lhs_str, rhs_str = formula_str.split('=', 1)
    names = set(_TOKEN_RE.findall(formula_str)) - _RESERVED
    local_syms = {name: symbols(name) for name in names}
    local_syms.update(_MATH_LOCALS)
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
                    # sympy_solve() যেকোনো ক্রমে root গুলো দেয় — উদাহরণ:
                    # v**2 = 100 সমাধান করলে [-10, 10] আসে, [0]-তে সরাসরি
                    # ইনডেক্স করলে মাঝেমধ্যে ভুল করে -10 বেছে নেয়। এখানে
                    # শুধু বাস্তব (real) সমাধানগুলো রাখা হচ্ছে, আর একাধিক
                    # থাকলে বড়টা (ধনাত্মক) নেওয়া হচ্ছে, কারণ ভর/বেগ/আয়তনের
                    # মতো রাশি বাস্তব জগতে ঋণাত্মক হয় না।
                    # নোট: ভবিষ্যতে যদি এমন কোনো রাশি (যেমন তাপমাত্রার
                    # পরিবর্তন) যোগ করো যেখানে ঋণাত্মক মানও অর্থবহ, তখন এই
                    # heuristic-টা আবার দেখে নিও।
                    real_solutions = [s for s in solved if getattr(s, "is_real", True)]
                    chosen = max(real_solutions) if real_solutions else solved[0]
                    known[unknown] = float(chosen)
                    steps.append(f"{unknown} = {known[unknown]}")
                    progress = True

    if target not in known:
        raise ValueError(f"'{target}' বের করার জন্য পর্যাপ্ত তথ্য নেই")

    return known, steps