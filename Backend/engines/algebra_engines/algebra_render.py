"""
Algebra render helpers
======================
Every answer the algebra engine produces exists in TWO forms:

  * plain text  ("x = 2 or x = 3")            -> used by the Copy button, the tests, and
                                                  as a fallback when LaTeX can't be shown
  * LaTeX       ("x = 2 \\quad x = 3")          -> what the frontend actually draws (KaTeX)

Writing every step twice by hand would be error-prone, so a step is built ONCE
from small pieces and both forms are derived from it:

    S("Given: ", M(lhs, " = ", rhs))

    - plain text pieces (str passed straight to S)   -> stay ordinary text
    - anything wrapped in M(...) (or any sympy object) -> becomes inline math

`M(...)` accepts sympy expressions, matrices, numbers, lists, and short raw
strings such as " = " or " ≠ " (the usual symbols are converted to LaTeX).
"""
import re

from sympy import latex as _sym_latex, Basic, MatrixBase

# ---------------------------------------------------------------------------
# Plain-text formatting (same look the engine has always used)
# ---------------------------------------------------------------------------


def fmt(expr) -> str:
    """Human-readable plain text: ** -> ^, exp( -> e^(, log( -> ln(, I -> i."""
    if isinstance(expr, MatrixBase):
        rows = expr.tolist()
        return "[" + ", ".join("[" + ", ".join(fmt(e) for e in row) + "]" for row in rows) + "]"
    try:
        text = str(expr)
    except Exception:
        return str(expr)
    text = text.replace("**", "^")
    text = text.replace("exp(", "e^(")
    text = text.replace("log(", "ln(")
    text = re.sub(r"\bI\b", "i", text)
    return text


# ---------------------------------------------------------------------------
# LaTeX formatting
# ---------------------------------------------------------------------------
_TEX_SYMBOLS = [
    ("≠", r" \neq "), ("≥", r" \geq "), ("≤", r" \leq "), ("±", r" \pm "),
    ("·", r" \cdot "), ("×", r" \times "), ("∞", r" \infty "), ("∪", r" \cup "),
    ("∩", r" \cap "), ("∅", r" \emptyset "), ("²", "^{2}"), ("³", "^{3}"),
    ("→", r" \to "), ("∈", r" \in "), ("≈", r" \approx "), ("θ", r" \theta "),
    ("λ", r" \lambda "), ("Δ", r" \Delta "), ("π", r" \pi "), ("Σ", r" \sum "),
    ("−", "-"),
]


def _symbols_to_tex(s: str) -> str:
    for src, dst in _TEX_SYMBOLS:
        s = s.replace(src, dst)
    return s


def tex(obj) -> str:
    """LaTeX for a sympy object / matrix / number. Strings are treated as raw math."""
    if isinstance(obj, str):
        return _symbols_to_tex(obj)
    if isinstance(obj, MatrixBase):
        return matrix_tex(obj)
    if isinstance(obj, bool):
        return r"\text{true}" if obj else r"\text{false}"
    if isinstance(obj, (int, float)):
        return str(obj)
    try:
        return _sym_latex(obj, ln_notation=True)
    except Exception:
        return str(obj)


def text_tex(s: str) -> str:
    """Wrap ordinary words for use INSIDE display math."""
    out = []
    for ch in str(s):
        if ch in "{}%&#$_":
            out.append("\\" + ch)
        elif ch == "\\":
            out.append(r"\textbackslash{}")
        elif ch == "^":
            out.append(r"\^{}")
        elif ch == "~":
            out.append(r"\~{}")
        else:
            out.append(ch)
    return r"\text{" + "".join(out) + "}"


def matrix_tex(m, kind: str = "p") -> str:
    """pmatrix (round brackets) by default; kind='v' gives determinant bars."""
    env = {"p": "pmatrix", "v": "vmatrix", "b": "bmatrix"}.get(kind, "pmatrix")
    rows = m.tolist()
    body = r" \\ ".join(" & ".join(tex(e) for e in row) for row in rows)
    return r"\begin{" + env + "}" + body + r"\end{" + env + "}"


def det_tex(m) -> str:
    return matrix_tex(m, "v")


def gathered(lines):
    """Stack several LaTeX lines; a single line is returned untouched."""
    lines = [l for l in lines if l]
    if not lines:
        return ""
    if len(lines) == 1:
        return lines[0]
    return r"\begin{gathered}" + r" \\ ".join(lines) + r"\end{gathered}"


def set_tex(sol) -> str:
    """LaTeX for a sympy Interval / Union / FiniteSet / EmptySet / Reals."""
    from sympy import S
    if sol == S.EmptySet:
        return r"\emptyset"
    if sol == S.Reals:
        return r"\left(-\infty, \infty\right)"
    return tex(sol)


# ---------------------------------------------------------------------------
# M(...) and S(...) : the tiny builder
# ---------------------------------------------------------------------------
class M:
    """One inline-math segment, made of one or more parts."""
    __slots__ = ("plain", "tex")

    def __init__(self, *parts):
        pl, tx = [], []
        for p in parts:
            a, b = _part(p)
            pl.append(a)
            tx.append(b)
        self.plain = "".join(pl)
        self.tex = "".join(tx)


def _part(p):
    if isinstance(p, M):
        return p.plain, p.tex
    if isinstance(p, str):
        return p, _symbols_to_tex(p)
    if isinstance(p, MatrixBase):
        return fmt(p), matrix_tex(p)
    if isinstance(p, (list, tuple)):
        parts = [_part(x) for x in p]
        return ", ".join(a for a, _ in parts), r",\ ".join(b for _, b in parts)
    if isinstance(p, (int, float)) and not isinstance(p, bool):
        return str(p), str(p)
    return fmt(p), tex(p)


class Step:
    __slots__ = ("plain", "latex")

    def __init__(self, plain: str, latex: str):
        self.plain = plain
        self.latex = latex

    def __str__(self):
        return self.plain


def raw(plain: str, latex: str) -> "M":
    """A math segment whose plain text and LaTeX are supplied explicitly."""
    m = M()
    m.plain = plain
    m.tex = latex
    return m


def S(*parts) -> Step:
    """Build a step. `str` pieces stay text; everything else becomes inline math."""
    plain, lx = [], []
    for p in parts:
        if isinstance(p, str):
            plain.append(p)
            lx.append(p)
        else:
            a, b = _part(p)
            plain.append(a)
            lx.append("\\(" + b + "\\)")
    return Step("".join(plain), "".join(lx))


step = S   # readable alias:  step("Given: ", M(...))


def split_steps(steps):
    """[Step | str, ...] -> (plain list, latex list)."""
    plain, lx = [], []
    for s in steps or []:
        if isinstance(s, Step):
            plain.append(s.plain)
            lx.append(s.latex)
        else:
            plain.append(str(s))
            lx.append(str(s))
    return plain, lx


def add_extra(result: dict, key: str, plain=None, latex=None, text: bool = False):
    """Append a labelled detail row (Discriminant, Vertex, Rank, ...) to result['extras'].
    The frontend translates `key` into a label, so the backend stays language-neutral."""
    if plain is None or plain == "" or (isinstance(plain, (list, tuple)) and not plain):
        return
    if isinstance(plain, (list, tuple)):
        plain = ", ".join(str(p) for p in plain)
    row = {"key": key, "plain": str(plain)}
    if latex and not text:
        row["latex"] = latex
    result.setdefault("extras", []).append(row)
def rel(lhs, op, rhs) -> M:
    """সহজে গাণিতিক সম্পর্ক (যেমন: x = 2) তৈরি করার জন্য হেল্পার ফাংশন।"""
    return M(lhs, f" {op} ", rhs)

def join_math(items, sep=", ") -> M:
    """অনেকগুলো গাণিতিক আইটেমকে কমা (বা অন্য কিছু) দিয়ে যুক্ত করার জন্য হেল্পার ফাংশন।"""
    parts = []
    for i, item in enumerate(items):
        if i > 0:
            parts.append(sep)
        parts.append(item)
    return M(*parts)
