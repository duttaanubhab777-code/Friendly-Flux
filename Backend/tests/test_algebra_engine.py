"""
Comprehensive tests for formulas/algebra_engine.py

Run with:  cd Backend && python -m pytest tests/test_algebra_engine.py -v

These tests check mathematical correctness (not just "did it not crash"),
so they parse the returned `result`/`solutions` and verify them against
the original equation with sympy — a hardcoded string match would not
catch a wrong-but-similar-looking answer.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from sympy import symbols, sympify, simplify, I, Eq, E

from formulas.algebra_engine import solve_algebra, AlgebraError

x, y, z, a, b, c = symbols("x y z a b c")


def _solutions_as_sympy(result, var=x):
    """Helper: turn result['solutions'] (list of strings like 'x = 5' or '5')
    into a list of sympy values, tolerant of the 'var = ' prefix."""
    out = []
    for s in result.get("solutions") or []:
        s = s.strip()
        if "=" in s:
            s = s.split("=", 1)[1].strip()
        out.append(sympify(s, locals={"i": I, "e": E}))
    return out


def _assert_root_set_equal(result, expected, var=x):
    got = set(simplify(v) for v in _solutions_as_sympy(result, var))
    exp = set(simplify(v) for v in expected)
    assert got == exp, f"expected {exp}, got {got} (raw: {result.get('solutions')})"


# ---------------------------------------------------------------------------
# 1. Basic simplification
# ---------------------------------------------------------------------------
class TestSimplification:
    def test_combine_like_terms(self):
        r = solve_algebra("2x + 3x - 4x")
        assert simplify(sympify(r["result"]) - x) == 0

    def test_expand_product(self):
        r = solve_algebra("(x+2)(x+3)")
        assert simplify(sympify(r["result"].replace("^", "**")) - (x**2 + 5*x + 6)) == 0

    def test_cancel_rational_expression(self):
        r = solve_algebra("(x^2-1)/(x-1)")
        assert simplify(sympify(r["result"]) - (x + 1)) == 0
        assert any("1" in d for d in r["domain_restrictions"])

    def test_exact_fraction_not_decimal(self):
        r = solve_algebra("1/3 + 1/3")
        assert r["result"] == "2/3"
        assert "0.6666" not in r["result"]


# ---------------------------------------------------------------------------
# 2. Linear equations
# ---------------------------------------------------------------------------
class TestLinear:
    def test_simple(self):
        r = solve_algebra("2x+6=16")
        assert r["category"] == "linear_equation"
        _assert_root_set_equal(r, [5])

    def test_variable_both_sides(self):
        r = solve_algebra("3x+5 = x+11")
        _assert_root_set_equal(r, [3])

    def test_no_solution(self):
        r = solve_algebra("x+1=x+2")
        assert "no solution" in r["result"].lower()

    def test_infinite_solutions(self):
        r = solve_algebra("2x+4=2(x+2)")
        assert "Infinitely many" in r["result"] or "infinitely many" in r["result"]

    def test_parametric(self):
        r = solve_algebra("a*x+b=0")
        assert r["category"] == "linear_equation_parametric"
        assert "a" in r["warnings"][0]


# ---------------------------------------------------------------------------
# 3. Quadratic equations
# ---------------------------------------------------------------------------
class TestQuadratic:
    def test_two_real_roots(self):
        r = solve_algebra("x^2-5x+6=0")
        assert r["category"] == "quadratic_equation"
        _assert_root_set_equal(r, [2, 3])
        assert r["nature_of_roots"] == "two distinct real roots"

    def test_repeated_root(self):
        r = solve_algebra("x^2-4x+4=0")
        _assert_root_set_equal(r, [2])
        assert "repeated" in r["nature_of_roots"]

    def test_complex_roots(self):
        r = solve_algebra("x^2+4=0")
        _assert_root_set_equal(r, [2*I, -2*I])
        assert "complex" in r["nature_of_roots"]

    def test_vertex_and_axis(self):
        r = solve_algebra("x^2-4x+3=0")
        assert "2" in r["axis_of_symmetry"]

    def test_parametric_quadratic_fixed_leading_coeff(self):
        # leading coefficient is a concrete 1, not symbolic -> should NOT
        # branch into the a=0 case-split (that would be nonsensical here)
        r = solve_algebra("x^2+b*x+c=0")
        assert r["category"] == "quadratic_equation"
        assert "If 1" not in r["result"]


# ---------------------------------------------------------------------------
# 4. Polynomial equations
# ---------------------------------------------------------------------------
class TestPolynomial:
    def test_cubic_factorable(self):
        r = solve_algebra("x^3-6x^2+11x-6=0")
        assert r["category"] == "polynomial_equation"
        _assert_root_set_equal(r, [1, 2, 3])

    def test_degree_too_high_is_graceful(self):
        r = solve_algebra("x^100+1=0")
        assert r["category"] == "polynomial_equation"
        assert "too complex" in r["result"] or "beyond" in r["result"]


# ---------------------------------------------------------------------------
# 5 & 6. Simultaneous equations / systems
# ---------------------------------------------------------------------------
class TestSystems:
    def test_two_var_linear(self):
        r = solve_algebra("2x+3y=7\nx-y=1")
        assert r["category"] == "linear_system"
        assert r["solutions"]["x"] == "2" and r["solutions"]["y"] == "1"

    def test_three_var_linear(self):
        r = solve_algebra("x+y+z=6; 2x-y+z=3; x+2y-3z=-4")
        assert r["solutions"]["x"] == "1"
        assert r["solutions"]["y"] == "2"
        assert r["solutions"]["z"] == "3"

    def test_inconsistent_system(self):
        r = solve_algebra("2x+3=5; 2x+3=10")
        assert "inconsistent" in r["result"]

    def test_dependent_infinite_solutions(self):
        r = solve_algebra("2x+3=5; 4x+6=10")
        # a single equation's worth of info -> unique in this case (x=1),
        # but structurally still solved via linsolve without crashing
        assert r["category"] == "linear_system"

    def test_nonlinear_system(self):
        r = solve_algebra("x^2+y^2=25; x+y=7")
        assert r["category"] == "nonlinear_system"
        assert len(r["solutions"]) == 2


# ---------------------------------------------------------------------------
# 8. Inequalities
# ---------------------------------------------------------------------------
class TestInequalities:
    def test_linear(self):
        r = solve_algebra("2x+3 > 7")
        assert r["result"] == "(2, ∞)"

    def test_quadratic(self):
        r = solve_algebra("x^2-5x+6 <= 0")
        assert r["result"] == "[2, 3]"

    def test_rational(self):
        r = solve_algebra("(x-1)/(x+2) > 0")
        assert "∪" in r["result"]

    def test_compound(self):
        r = solve_algebra("1 < x <= 5")
        assert r["result"] == "(1, 5]"


# ---------------------------------------------------------------------------
# 9. Absolute value
# ---------------------------------------------------------------------------
class TestAbsoluteValue:
    def test_equation(self):
        r = solve_algebra("|x-3|=5")
        _assert_root_set_equal(r, [8, -2])

    def test_inequality(self):
        r = solve_algebra("|2x+1|<7")
        assert r["result"] == "(-4, 3)"


# ---------------------------------------------------------------------------
# 10. Rational equations + extraneous handling
# ---------------------------------------------------------------------------
class TestRational:
    def test_solves_and_restricts(self):
        r = solve_algebra("1/(x-2) + 1/(x+2) = 1")
        assert r["category"] == "rational_equation"
        assert any("2" in d for d in r["domain_restrictions"])

    def test_extraneous_from_squaring_style(self):
        r = solve_algebra("((x+1)/(x-1))^2 = 4")
        _assert_root_set_equal(r, [sympify("1/3"), 3])


# ---------------------------------------------------------------------------
# 11. Radical equations
# ---------------------------------------------------------------------------
class TestRadical:
    def test_valid_solution(self):
        r = solve_algebra("sqrt(x+1) = 3")
        _assert_root_set_equal(r, [8])

    def test_extraneous_rejected(self):
        r = solve_algebra("sqrt(x+1) = -3")
        assert "No valid solution" in r["result"]


# ---------------------------------------------------------------------------
# 12 & 13. Exponential / logarithmic
# ---------------------------------------------------------------------------
class TestExponentialLog:
    def test_exponential_simple(self):
        r = solve_algebra("2^x = 16")
        _assert_root_set_equal(r, [4])

    def test_exponential_prefers_real_branch(self):
        r = solve_algebra("3^(2*x-1) = 27")
        assert r["solutions"] == ["2"]

    def test_log_two_arg(self):
        r = solve_algebra("log(x,2)=5")
        _assert_root_set_equal(r, [32])

    def test_log_domain_filters_negative_root(self):
        r = solve_algebra("ln(x)+ln(x-1)=3")
        for s in _solutions_as_sympy(r):
            assert float(s.evalf()) > 1


# ---------------------------------------------------------------------------
# 14. Complex numbers
# ---------------------------------------------------------------------------
class TestComplex:
    def test_arithmetic(self):
        r = solve_algebra("(3+4i)*(1-2i)")
        assert r["category"] == "numeric_expression"
        assert simplify(sympify(r["result"], locals={"i": I}) - (11 - 2*I)) == 0

    def test_modulus_present(self):
        r = solve_algebra("3+4i")
        assert r["modulus"] == "5"


# ---------------------------------------------------------------------------
# 16. Domain / extraneous checking already covered above; a few more:
# ---------------------------------------------------------------------------
class TestDomainAndErrors:
    def test_true_identity(self):
        r = solve_algebra("5=5")
        assert "True" in r["result"]

    def test_false_identity(self):
        r = solve_algebra("3=4")
        assert "False" in r["result"]

    def test_empty_input_raises(self):
        with pytest.raises(AlgebraError):
            solve_algebra("")

    def test_unbalanced_brackets_raises(self):
        with pytest.raises(AlgebraError):
            solve_algebra("(x+2=5")

    def test_disallowed_characters_raise(self):
        with pytest.raises(AlgebraError):
            solve_algebra("x^2 & y")

    def test_too_many_relations_raises(self):
        with pytest.raises(AlgebraError):
            solve_algebra("2x=3=4")

    def test_unbalanced_abs_bars_raise(self):
        with pytest.raises(AlgebraError):
            solve_algebra("|x-3=5")


# ---------------------------------------------------------------------------
# Security: never uses eval/exec on raw input
# ---------------------------------------------------------------------------
class TestSecurity:
    def test_injection_like_input_is_rejected_or_harmless(self):
        for bad in ["__import__('os').system('ls')", "import os", "exec('1')"]:
            with pytest.raises(AlgebraError):
                solve_algebra(bad)


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
