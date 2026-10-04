"""
Algebra core
============
Shared plumbing for every part of the algebra engine (equations, matrices,
sequences & series, permutations & combinations, graphs):

  * AlgebraError            - the one exception the Flask layer turns into HTTP 400
  * run_with_timeout        - bounded thread-pool so a hard problem can never hang the server
  * preprocess()            - character whitelist, unicode -> ascii, |x| -> Abs(x), bracket check
  * parse()                 - sympy's parser with a fixed, tiny vocabulary (never Python builtins' power)
  * Ctx                     - carries per-request names (matrix placeholders, sum indices) into parse()

Security notes
--------------
Input is never passed to eval()/exec() directly. It must first pass a strict
character whitelist (no quotes, no colons -> no strings, lambdas or slices),
and text containing "__" or attribute access (".name") is rejected outright,
which closes the usual sympy.parse_expr escape routes.
"""
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

from sympy import (
    E, pi, oo, I, log, exp, sqrt, Abs, factorial, binomial, ff,
    root as sympy_root, MatrixBase,
)
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor,
)

TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)
EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="algebra-engine")
TIMEOUT_SECONDS = 8

MAX_LEN = 800
MAX_OP_COUNT = 500
MAX_SYSTEM_SIZE = 6
MAX_POLY_DEGREE = 40
MAX_MATRIX_SIZE = 6

# Only what algebra needs — no trig/calculus functions on purpose.
LOCAL_DICT = {
    "e": E, "pi": pi, "oo": oo, "infinity": oo, "inf": oo, "i": I, "I": I,
    "log": log, "ln": log, "exp": exp, "sqrt": sqrt,
    "abs": Abs, "Abs": Abs, "factorial": factorial, "root": sympy_root,
    "binomial": binomial, "ff": ff,
}

# Other modules (matrix, discrete) register the extra functions they let users
# call INSIDE an expression (det(...), sum(...), ...). Filled at import time.
EXTRA_LOCALS = {}

# After abs-bar conversion the text should only ever contain these characters.
ALLOWED_STATEMENT_CHARS = re.compile(r"^[0-9a-zA-Z_+\-*/^!(){}\[\].,;\n\s=<>]*$")

REL_TOKEN_RE = r"!=|<=|>=|<|>|="

PREFERRED_VAR_ORDER = ["x", "y", "z", "t", "u", "v", "w", "n", "k", "m"]
_SUPERSCRIPTS = {"⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
                 "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9"}


class AlgebraError(ValueError):
    """Raised for any user-facing algebra problem (bad input, unsupported
    problem, ...). The Flask layer maps this to an HTTP 400 response."""
    pass


class Ctx:
    """Per-request names that parse() must know about (matrix placeholders, sum indices)."""

    def __init__(self):
        self.locals = {}


# ---------------------------------------------------------------------------
# Timeouts
# ---------------------------------------------------------------------------
def run_with_timeout(func, seconds=TIMEOUT_SECONDS):
    future = EXECUTOR.submit(func)
    try:
        return future.result(timeout=seconds)
    except FutureTimeoutError:
        raise TimeoutError("This computation is too complex and timed out")


# ---------------------------------------------------------------------------
# Input cleaning
# ---------------------------------------------------------------------------
def _superscript_repl(m):
    digits = "".join(_SUPERSCRIPTS.get(c, "") for c in m.group(0))
    return "^" + digits


def check_balanced_brackets(text: str) -> None:
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in ")]}":
            if not stack:
                raise AlgebraError("There's an extra closing bracket with no matching opening one")
            if stack.pop() != pairs[ch]:
                raise AlgebraError("The brackets don't match up — check ( ) and [ ]")
    if stack:
        raise AlgebraError("A bracket is missing its matching closing bracket")


def convert_abs_bars(text: str) -> str:
    """Turn |...| into Abs(...). Assumes non-nested absolute values, which
    covers every realistic algebra problem."""
    if text.count("|") % 2 != 0:
        raise AlgebraError("Unbalanced absolute value bars '|' — each |...| needs a matching pair")
    while "|" in text:
        first = text.index("|")
        second = text.index("|", first + 1)
        inner = text[first + 1:second]
        text = text[:first] + "Abs(" + inner + ")" + text[second + 1:]
    return text


# Friendly spellings of permutation / combination -> sympy functions
_COMB_RENAMES = [
    (re.compile(r"(?<![A-Za-z0-9_])(\d+)\s*C\s*(\d+)(?![A-Za-z0-9_(])"), r"binomial(\1,\2)"),
    (re.compile(r"(?<![A-Za-z0-9_])(\d+)\s*P\s*(\d+)(?![A-Za-z0-9_(])"), r"ff(\1,\2)"),
    (re.compile(r"(?<![A-Za-z_])(?:nCr|ncr|comb|binom)\s*\("), "binomial("),
    (re.compile(r"(?<![A-Za-z_])(?:nPr|npr|perm)\s*\("), "ff("),
    (re.compile(r"(?<![A-Za-z_])C\s*\("), "binomial("),
    (re.compile(r"(?<![A-Za-z_])P\s*\("), "ff("),
]


def preprocess(raw) -> str:
    if raw is None:
        raise AlgebraError("Input is empty")
    text = str(raw).strip()
    if not text:
        raise AlgebraError("Input is empty")
    if len(text) > MAX_LEN:
        raise AlgebraError("Input is too long")

    text = (text.replace("≤", "<=").replace("≥", ">=").replace("≠", "!=")
                .replace("π", "pi").replace("∞", "oo")
                .replace("÷", "/").replace("×", "*").replace("·", "*")
                .replace("−", "-").replace("–", "-").replace("—", "-"))
    # √ : "√(x+1)" -> sqrt(x+1) ; "√x" / "√2" -> sqrt(x) / sqrt(2)
    text = re.sub(r"√\s*\(", "sqrt(", text)
    text = re.sub(r"√\s*([A-Za-z0-9.]+)", r"sqrt(\1)", text)
    text = text.replace("√", "sqrt")
    text = re.sub(r"[⁰¹²³⁴⁵⁶⁷⁸⁹]+", _superscript_repl, text)

    # Block the well-known sympy.parse_expr escape routes before anything else.
    if "__" in text or re.search(r"\.\s*[A-Za-z_]", text):
        raise AlgebraError("The input contains characters that aren't allowed")

    for pattern, repl in _COMB_RENAMES:
        text = pattern.sub(repl, text)

    text = convert_abs_bars(text)
    if not ALLOWED_STATEMENT_CHARS.match(text):
        raise AlgebraError("The input contains characters that aren't allowed")
    check_balanced_brackets(text)
    return text


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------
def parse(text: str, ctx: Ctx = None):
    """Parse one expression with sympy. Returns a sympy expression, or a Matrix
    when the text evaluates to one (matrix literals / matrix functions)."""
    text = (text or "").strip()
    if not text:
        raise AlgebraError("Expression is empty")
    local = dict(LOCAL_DICT)
    local.update(EXTRA_LOCALS)
    if ctx is not None:
        local.update(ctx.locals)
    try:
        expr = parse_expr(text, local_dict=local, transformations=TRANSFORMS)
    except AlgebraError:
        raise
    except (ArithmeticError, RecursionError):
        raise AlgebraError("That calculation isn't defined (division by zero or a value that is too large)")
    except Exception:
        raise AlgebraError(f"Couldn't understand '{text}' — check the brackets and operators")
    if isinstance(expr, (list, tuple, dict, set)):
        raise AlgebraError(f"Couldn't understand '{text}' — check the brackets and operators")
    try:
        if not isinstance(expr, MatrixBase) and expr.count_ops() > MAX_OP_COUNT:
            raise AlgebraError("This expression is too complex to process")
    except AlgebraError:
        raise
    except Exception:
        pass
    return expr


def pick_variable(*exprs, hint=None):
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
    for name in PREFERRED_VAR_ORDER:
        if name in by_name:
            return by_name[name]
    return sorted(found, key=lambda s: s.name)[0]


def safe_numeric(expr):
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


def split_top_level(text: str, sep: str = ","):
    """Split on `sep`, ignoring separators nested inside (), [] or {}."""
    parts, depth, cur = [], 0, []
    for ch in text:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch == sep and depth == 0:
            parts.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    parts.append("".join(cur).strip())
    return parts


def match_call(text: str):
    """If `text` is exactly one function call  name( ... )  return (name, inner_args_text),
    otherwise None. Handles nested brackets."""
    m = re.fullmatch(r"\s*([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)\s*", text, re.S)
    if not m:
        return None
    inner = m.group(2)
    depth = 0
    for ch in inner:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
            if depth < 0:
                return None     # the first "(" closed before the end -> not a single call
    return (m.group(1), inner) if depth == 0 else None
