"""
Algebra — Matrices & Determinants
=================================
Typing matrices
---------------
    [[1,2],[3,4]]            rows in brackets      (also  [[x,2],[3,x]] )
    [1 2; 3 4]   [1,2;3,4]   rows separated by ;   (easier on a phone keypad)

Commands (case-insensitive) — each returns a full worked solution:
    det(A)  inv(A)  transpose(A)  trace(A)  rank(A)  rref(A)  adj(A)
    cofactor(A)  minor(A, i, j)  eigen(A)  charpoly(A)
Arithmetic works directly:   A+B   A-B   3*A   A*B   A^3   A^-1
and everything nests:         det(A*B)    inv(transpose(A))

Inside equations a determinant is just a number, so this also works:
    det([[x,2],[3,x]]) = 0          (solved like any other equation)
"""
import re

from sympy import (
    Matrix, MatrixBase, Symbol, S, Rational, eye, simplify, expand, factor,Float,
    nsimplify, Poly, roots as sym_roots,
)

from .algebra_core import (
    AlgebraError, Ctx, EXTRA_LOCALS, MAX_MATRIX_SIZE,
    parse, run_with_timeout, split_top_level, safe_numeric, match_call,
)
from .algebra_render import (
    M, raw, step, fmt, tex, matrix_tex, det_tex, add_extra, text_tex,
)

try:  # sympy >= 1.13 keeps these in .exceptions
    from sympy.matrices.exceptions import ShapeError, NonInvertibleMatrixError
except Exception:  # pragma: no cover - older sympy
    from sympy.matrices.common import ShapeError, NonInvertibleMatrixError


# ---------------------------------------------------------------------------
# Building matrices from text
# ---------------------------------------------------------------------------
def _split_ws(text):
    """Split on whitespace that is not inside brackets."""
    parts, depth, cur = [], 0, []
    for ch in text:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch.isspace() and depth == 0:
            if cur:
                parts.append("".join(cur))
                cur = []
        else:
            cur.append(ch)
    if cur:
        parts.append("".join(cur))
    return parts


def _split_entries(row_text):
    row_text = row_text.strip()
    if not row_text:
        raise AlgebraError("A matrix row is empty")
    if "," in "".join(ch for ch in _strip_nested(row_text)):
        return [p for p in split_top_level(row_text, ",")]
    return _split_ws(row_text)


def _strip_nested(text):
    """Keep only the characters that sit at bracket depth 0."""
    depth, out = 0, []
    for ch in text:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        elif depth == 0:
            out.append(ch)
    return "".join(out)


def _clean_entry(value):
    if hasattr(value, "has") and value.has(Float.__class__) is False:
        pass
    try:
        if value.atoms(Float.__class__ if False else __import__("sympy").Float):
            return nsimplify(value, rational=True)
    except Exception:
        pass
    return value


def _parse_matrix_literal(body, ctx):
    body = body.strip()
    if not body:
        raise AlgebraError("The matrix is empty — write something like [[1,2],[3,4]]")
    if body.startswith("["):
        rows_txt = split_top_level(body, ",")
        rows = []
        for r in rows_txt:
            r = r.strip()
            if not (r.startswith("[") and r.endswith("]")):
                raise AlgebraError("Write a matrix like [[1,2],[3,4]] or [1 2; 3 4]")
            rows.append(_split_entries(r[1:-1]))
    else:
        rows = [_split_entries(r) for r in split_top_level(body, ";") if r.strip()]

    if not rows:
        raise AlgebraError("The matrix is empty — write something like [[1,2],[3,4]]")
    width = len(rows[0])
    if any(len(r) != width for r in rows):
        raise AlgebraError("Every row of a matrix must have the same number of entries")
    if len(rows) > MAX_MATRIX_SIZE or width > MAX_MATRIX_SIZE:
        raise AlgebraError(f"Matrices up to {MAX_MATRIX_SIZE}×{MAX_MATRIX_SIZE} are supported")

    entries = []
    for r in rows:
        line = []
        for cell in r:
            v = parse(cell, ctx)
            if isinstance(v, MatrixBase):
                raise AlgebraError("A matrix can't contain another matrix")
            line.append(_clean_entry(v))
        entries.append(line)
    return Matrix(entries)


def extract_matrices(text, ctx=None):
    """Replace every matrix literal by a placeholder name and remember its value in ctx."""
    ctx = ctx or Ctx()
    if "[" not in text:
        return text, ctx
    out, i, n, count = [], 0, len(text), 0
    while i < n:
        ch = text[i]
        if ch == "[":
            depth, j = 0, i
            while j < n:
                if text[j] == "[":
                    depth += 1
                elif text[j] == "]":
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            if j >= n:
                raise AlgebraError("A matrix is missing its closing ]")
            m = _parse_matrix_literal(text[i + 1:j], ctx)
            name = f"_mx{count}"
            count += 1
            ctx.locals[name] = m
            out.append(f" {name} ")
            i = j + 1
        else:
            out.append(ch)
            i += 1
    return "".join(out), ctx


def has_matrix(ctx):
    return any(isinstance(v, MatrixBase) for v in ctx.locals.values())


# ---------------------------------------------------------------------------
# Small numeric helpers
# ---------------------------------------------------------------------------
def _is_numeric(m):
    return all(e.is_number for e in m)


def _shape(m):
    return f"{m.rows}×{m.cols}"


def _det(m):
    d = m.det(method="berkowitz")
    return expand(d) if not d.is_number else simplify(d)


def _need_square(m, what):
    if m.rows != m.cols:
        raise AlgebraError(f"{what} needs a square matrix, but this one is {_shape(m)}")


def _ptex(e):
    """LaTeX of a matrix entry, wrapped in brackets when it needs them."""
    t = tex(e)
    if e.is_Symbol or (e.is_Number and e.is_nonnegative):
        return t
    return r"\left(" + t + r"\right)"


def _signed_terms_tex(terms):
    """terms: list of (sign(+1/-1), latex). -> '3 - 4 + 5' style latex."""
    out = []
    for k, (sg, body) in enumerate(terms):
        if k == 0:
            out.append(("-" if sg < 0 else "") + body)
        else:
            out.append((" - " if sg < 0 else " + ") + body)
    return "".join(out) if out else "0"


def _get_matrix(text, ctx, fname):
    val = parse(text, ctx)
    if not isinstance(val, MatrixBase):
        raise AlgebraError(f"{fname}() needs a matrix — for example {fname}([[1,2],[3,4]])")
    return val


def _graph_matrix(m):
    """JSON-safe list-of-lists when m is a real numeric 2x2 / 3x3 (for the transformation graph)."""
    if m.rows == m.cols and m.rows in (2, 3) and _is_numeric(m):
        try:
            vals = [[float(e) for e in row] for row in m.tolist()]
            return vals
        except Exception:
            return None
    return None


def _finish(res, m_for_graph=None):
    gm = _graph_matrix(m_for_graph) if m_for_graph is not None else None
    if gm is not None:
        res["_g"] = {"type": "matrix", "matrix": gm}
    return res


def _matrix_result(category, method, steps, value, **extra):
    res = {"category": category, "method": method, "steps": steps, "warnings": []}
    if isinstance(value, MatrixBase):
        res["result"] = fmt(value)
        res["result_latex"] = matrix_tex(value)
        res["result_matrix"] = [[fmt(e) for e in row] for row in value.tolist()]
        res["shape"] = [value.rows, value.cols]
    else:
        res["result"] = fmt(value)
        res["result_latex"] = tex(value)
        num = safe_numeric(value) if getattr(value, "is_number", False) and not value.is_Rational else None
        if num is not None:
            res["numeric_value"] = num
    res.update(extra)
    return res


# ---------------------------------------------------------------------------
# Determinant
# ---------------------------------------------------------------------------
def _det2_line(sub):
    """'ad - bc' with the real numbers substituted, as a (plain, latex) pair."""
    a, b, c, d = sub[0, 0], sub[0, 1], sub[1, 0], sub[1, 1]
    lx = f"{_ptex(a)}{_ptex(d)} - {_ptex(b)}{_ptex(c)}"
    pl = f"({fmt(a)})({fmt(d)}) - ({fmt(b)})({fmt(c)})"
    return pl, lx


def det_steps(m):
    """Worked determinant (steps list, value)."""
    n = m.rows
    value = _det(m)
    steps = []
    if n == 1:
        steps.append(step("A 1×1 determinant is just its only entry: ", M(raw(f"det = {fmt(value)}", det_tex(m) + " = " + tex(value)))))
        return steps, value

    if n == 2:
        a, b, c, d = m[0, 0], m[0, 1], m[1, 0], m[1, 1]
        steps.append(step("For a 2×2 matrix: ", M(raw("|a b; c d| = ad − bc",
                     r"\begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc"))))
        pl, lx = _det2_line(m)
        steps.append(step("Substitute the entries: ", M(raw(f"det = {pl}", det_tex(m) + " = " + lx))))
        steps.append(step("Result: ", M(raw(f"det = {fmt(value)}", r"\det A = " + tex(value)))))
        return steps, value

    # n >= 3 : Laplace (cofactor) expansion along the most convenient row / column
    zr = [sum(1 for j in range(n) if m[i, j] == 0) for i in range(n)]
    zc = [sum(1 for i in range(n) if m[i, j] == 0) for j in range(n)]
    best_r = max(range(n), key=lambda i: (zr[i], -i))
    best_c = max(range(n), key=lambda j: (zc[j], -j))
    use_col = zc[best_c] > zr[best_r]
    idx = best_c if use_col else best_r
    line_name = f"column {idx + 1}" if use_col else f"row {idx + 1}"
    why = " (it has the most zeros, so the least work)" if max(zr[best_r], zc[best_c]) > 0 else ""

    steps.append(step(f"Expand along {line_name}{why}: ",
                      M(raw("det = Σ (−1)^(i+j)·a_ij·M_ij",
                            r"\det A = \sum (-1)^{i+j}\, a_{ij}\, M_{ij}"))))

    terms_tex, terms_plain, minor_lines, value_terms = [], [], [], []
    for t in range(n):
        i, j = (t, idx) if use_col else (idx, t)
        a = m[i, j]
        if a == 0:
            continue
        sign = -1 if (i + j) % 2 else 1
        sub = m.minor_submatrix(i, j)
        mv = _det(sub)
        terms_tex.append((sign, _ptex(a) + r"\cdot" + det_tex(sub)))
        terms_plain.append((sign, f"({fmt(a)})·det{fmt(sub)}"))
        if n == 3:
            pl, lx = _det2_line(sub)
            minor_lines.append(step(f"Minor M{i + 1}{j + 1}: ",
                                    M(raw(f"= {pl} = {fmt(mv)}", det_tex(sub) + " = " + lx + " = " + tex(mv)))))
        else:
            minor_lines.append(step(f"Minor M{i + 1}{j + 1}: ",
                                    M(raw(f"= {fmt(mv)}", det_tex(sub) + " = " + tex(mv)))))
        value_terms.append((sign, _ptex(a) + r"\cdot" + _ptex(mv), f"({fmt(a)})({fmt(mv)})"))

    if not terms_tex:
        steps.append(step("Every entry on that line is 0, so the determinant is ", M(0)))
        return steps, value

    zero_note = " (terms with a 0 entry vanish)" if len(terms_tex) < n else ""
    steps.append(step(f"Write out the terms with signs (−1)^(i+j){zero_note}: ",
                      M(raw("det = " + " ".join(("−" if s < 0 else "+") + " " + p for s, p in terms_plain),
                            r"\det A = " + _signed_terms_tex(terms_tex)))))
    steps.extend(minor_lines)
    steps.append(step("Combine: ",
                      M(raw("det = " + " ".join(("−" if s < 0 else "+") + " " + p for s, _, p in value_terms) + f" = {fmt(value)}",
                            r"\det A = " + _signed_terms_tex([(s, l) for s, l, _ in value_terms]) + " = " + tex(value)))))
    return steps, value


def cmd_det(args, ctx):
    if len(args) != 1:
        raise AlgebraError("det() takes one matrix — for example det([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "det")
    _need_square(m, "A determinant")
    steps = [step("Matrix: ", M(m))]
    st, value = det_steps(m)
    steps += st
    res = _matrix_result("determinant", "Cofactor expansion" if m.rows >= 3 else "Cross-multiplication (ad − bc)",
                         steps, value, order=m.rows)
    res["result_latex"] = r"\det A = " + tex(value)
    add_extra(res, "matrix", fmt(m), det_tex(m))
    add_extra(res, "singular", "Singular (determinant = 0): no inverse, rows are dependent" if value == 0
              else "Non-singular (determinant ≠ 0): the inverse exists", None, text=True)
    return _finish(res, m)


# ---------------------------------------------------------------------------
# Row reduction (Gauss–Jordan) with a recorded trail
# ---------------------------------------------------------------------------
def _gauss_jordan(m, max_ops=40):
    A = m.copy()
    rows, cols = A.shape
    r, pivots, ops = 0, [], []
    for c in range(cols):
        if r >= rows:
            break
        pr = next((i for i in range(r, rows) if A[i, c] != 0), None)
        if pr is None:
            continue
        if pr != r:
            A.row_swap(r, pr)
            ops.append((f"R{r + 1} ↔ R{pr + 1}", rf"R_{{{r + 1}}} \leftrightarrow R_{{{pr + 1}}}", A.copy()))
        piv = A[r, c]
        if piv != 1:
            A[r, :] = A[r, :] / piv
            ops.append((f"R{r + 1} → (1/({fmt(piv)}))·R{r + 1}",
                        rf"R_{{{r + 1}}} \to \frac{{1}}{{{tex(piv)}}} R_{{{r + 1}}}", A.copy()))
        for i in range(rows):
            if i != r and A[i, c] != 0:
                f = A[i, c]
                A[i, :] = A[i, :] - f * A[r, :]
                ops.append((f"R{i + 1} → R{i + 1} − ({fmt(f)})·R{r + 1}",
                            rf"R_{{{i + 1}}} \to R_{{{i + 1}}} - {_ptex(f)} R_{{{r + 1}}}", A.copy()))
        pivots.append(c)
        r += 1
    return A, pivots, ops[:max_ops], len(ops) > max_ops


def _row_ops_steps(ops, truncated):
    out = []
    for plain, lx, mat in ops:
        out.append(step(M(raw(plain, lx)), "  →  ", M(mat)))
    if truncated:
        out.append("(Further row operations omitted — see the final matrix.)")
    return out


def cmd_rref(args, ctx, category="matrix_rref"):
    if len(args) != 1:
        raise AlgebraError("rref() takes one matrix — for example rref([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "rref")
    steps = [step("Matrix: ", M(m))]
    if _is_numeric(m):
        A, pivots, ops, trunc = _gauss_jordan(m)
        steps.append("Gauss–Jordan elimination (row operations):")
        steps += _row_ops_steps(ops, trunc)
    else:
        A, pivs = m.rref()
        pivots = list(pivs)
        steps.append("Row-reduce (treating the letters as generic non-zero values).")
    steps.append(step("Reduced row echelon form: ", M(A)))
    steps.append(step("Pivot columns: ", ", ".join(str(p + 1) for p in pivots) or "none",
                      f"  →  rank = {len(pivots)}"))
    res = _matrix_result(category, "Gauss–Jordan elimination", steps, A)
    add_extra(res, "rank", str(len(pivots)), str(len(pivots)))
    return _finish(res, m)


def cmd_rank(args, ctx):
    if len(args) != 1:
        raise AlgebraError("rank() takes one matrix — for example rank([[1,2],[2,4]])")
    m = _get_matrix(args[0], ctx, "rank")
    steps = [step("Matrix: ", M(m))]
    if _is_numeric(m):
        A, pivots, ops, trunc = _gauss_jordan(m)
        steps.append("Reduce to row echelon form:")
        steps += _row_ops_steps(ops, trunc)
        steps.append(step("Reduced form: ", M(A)))
        rk = len(pivots)
    else:
        A, pivs = m.rref()
        rk = len(pivs)
        steps.append(step("Row-reduced form: ", M(A)))
    steps.append(step("Number of non-zero rows (pivots) = ", M(rk), " → the rank is ", M(rk), "."))
    res = _matrix_result("matrix_rank", "Row reduction", steps, S(rk))
    res["result_latex"] = rf"\operatorname{{rank}}(A) = {rk}"
    add_extra(res, "matrix", fmt(m), matrix_tex(m))
    if m.rows == m.cols:
        add_extra(res, "full_rank", "Yes — full rank (invertible)" if rk == m.rows else "No — the matrix is rank-deficient (singular)", None, text=True)
    return _finish(res, m)


# ---------------------------------------------------------------------------
# Cofactors, adjugate, inverse
# ---------------------------------------------------------------------------
def _minor_and_cofactor_matrices(m):
    n = m.rows
    minors = Matrix(n, n, lambda i, j: _det(m.minor_submatrix(i, j)) if n > 1 else 1)
    cof = Matrix(n, n, lambda i, j: (-1) ** (i + j) * minors[i, j])
    return minors, cof


def cmd_cofactor(args, ctx, category="matrix_cofactor"):
    if len(args) != 1:
        raise AlgebraError("cofactor() takes one matrix — for example cofactor([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "cofactor")
    _need_square(m, "Cofactors")
    if m.rows == 1:
        raise AlgebraError("Cofactors need at least a 2×2 matrix")
    minors, cof = _minor_and_cofactor_matrices(m)
    steps = [
        step("Matrix: ", M(m)),
        "Minor M_ij = the determinant left after deleting row i and column j.",
        step("Matrix of minors: ", M(minors)),
        step("Cofactor C_ij = (−1)^(i+j)·M_ij — flip the sign wherever i+j is odd.", ""),
        step("Cofactor matrix: ", M(cof)),
    ]
    res = _matrix_result(category, "Minors and signs (−1)^(i+j)", steps, cof)
    return _finish(res, m)


def cmd_adj(args, ctx):
    if len(args) != 1:
        raise AlgebraError("adj() takes one matrix — for example adj([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "adj")
    _need_square(m, "The adjugate")
    if m.rows == 1:
        raise AlgebraError("The adjugate needs at least a 2×2 matrix")
    minors, cof = _minor_and_cofactor_matrices(m)
    adj = cof.T
    steps = [
        step("Matrix: ", M(m)),
        step("Matrix of minors: ", M(minors)),
        step("Cofactor matrix (apply signs (−1)^(i+j)): ", M(cof)),
        step("Adjugate = transpose of the cofactor matrix: ", M(adj)),
    ]
    res = _matrix_result("matrix_adjugate", "Transpose of the cofactor matrix", steps, adj)
    res["result_latex"] = r"\operatorname{adj}A = " + matrix_tex(adj)
    return _finish(res, m)


def inverse_steps(m):
    """(steps, inverse or None). Handles singular matrices without raising."""
    n = m.rows
    d = _det(m)
    steps = [step("Matrix: ", M(m))]
    dsteps, _ = det_steps(m)
    steps.append("First find the determinant:")
    steps += dsteps
    if d == 0:
        steps.append(step("det A = 0, so A is singular and has no inverse."))
        return steps, None

    steps.append(step("det A ≠ 0, so the inverse exists:  A⁻¹ = adj(A) / det(A)."))
    if n == 2:
        a, b, c, dd = m[0, 0], m[0, 1], m[1, 0], m[1, 1]
        swapped = Matrix([[dd, -b], [-c, a]])
        steps.append(step("For 2×2: swap the diagonal, negate the other two: ", M(swapped)))
        inv = (swapped / d).applyfunc(simplify)
        steps.append(step("Divide by the determinant: ",
                          M(raw(f"A⁻¹ = (1/{fmt(d)})·{fmt(swapped)}",
                                r"A^{-1} = \frac{1}{" + tex(d) + "}" + matrix_tex(swapped) + "=" + matrix_tex(inv)))))
    elif n == 3:
        minors, cof = _minor_and_cofactor_matrices(m)
        adj = cof.T
        steps.append(step("Matrix of minors: ", M(minors)))
        steps.append(step("Cofactor matrix (signs (−1)^(i+j)): ", M(cof)))
        steps.append(step("Adjugate (transpose of cofactors): ", M(adj)))
        inv = (adj / d).applyfunc(simplify)
        steps.append(step("Divide by the determinant: ",
                          M(raw(f"A⁻¹ = (1/{fmt(d)})·{fmt(adj)}",
                                r"A^{-1} = \frac{1}{" + tex(d) + "}" + matrix_tex(adj) + "=" + matrix_tex(inv)))))
    else:
        if _is_numeric(m):
            aug = m.row_join(eye(n))
            A, _, ops, trunc = _gauss_jordan(aug)
            steps.append(step("Row-reduce the augmented matrix [A | I]:"))
            steps += _row_ops_steps(ops, trunc)
            inv = A[:, n:]
        else:
            inv = m.inv().applyfunc(simplify)
            steps.append("Computed with the adjugate method.")
        steps.append(step("The right-hand block is the inverse: ", M(inv)))

    check = (m * inv).applyfunc(simplify) == eye(n)
    steps.append(step("Check: A·A⁻¹ = I → ", "true ✓" if check else "could not be confirmed"))
    return steps, inv


def cmd_inv(args, ctx):
    if len(args) != 1:
        raise AlgebraError("inv() takes one matrix — for example inv([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "inv")
    _need_square(m, "An inverse")
    steps, inv = run_with_timeout(lambda: inverse_steps(m))
    if inv is None:
        res = {"category": "matrix_inverse", "method": "Determinant test", "steps": steps, "warnings": [],
               "result": "Not invertible — the matrix is singular (det = 0)",
               "result_latex": r"\det A = 0 \;\Rightarrow\; A^{-1}\ \text{does not exist}"}
        return _finish(res, m)
    res = _matrix_result("matrix_inverse", "Adjugate / determinant" if m.rows <= 3 else "Gauss–Jordan elimination", steps, inv)
    res["result_latex"] = r"A^{-1} = " + matrix_tex(inv)
    add_extra(res, "determinant", fmt(_det(m)), tex(_det(m)))
    return _finish(res, m)


# ---------------------------------------------------------------------------
# Simple unary commands
# ---------------------------------------------------------------------------
def cmd_transpose(args, ctx):
    if len(args) != 1:
        raise AlgebraError("transpose() takes one matrix — for example transpose([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "transpose")
    t = m.T
    steps = [step("Matrix: ", M(m)),
             "Transpose: rows become columns (entry (i, j) moves to (j, i)).",
             step("Result: ", M(raw(f"Aᵀ = {fmt(t)}", r"A^{T} = " + matrix_tex(t))))]
    res = _matrix_result("matrix_transpose", "Swap rows and columns", steps, t)
    res["result_latex"] = r"A^{T} = " + matrix_tex(t)
    return _finish(res, m)


def cmd_trace(args, ctx):
    if len(args) != 1:
        raise AlgebraError("trace() takes one matrix — for example trace([[1,2],[3,4]])")
    m = _get_matrix(args[0], ctx, "trace")
    _need_square(m, "The trace")
    diag = [m[i, i] for i in range(m.rows)]
    total = simplify(sum(diag))
    steps = [step("Matrix: ", M(m)),
             step("The trace is the sum of the main-diagonal entries: ",
                  M(raw("tr A = " + " + ".join(fmt(d) for d in diag) + f" = {fmt(total)}",
                        r"\operatorname{tr}A = " + " + ".join(_ptex(d) for d in diag) + " = " + tex(total))))]
    res = _matrix_result("matrix_trace", "Sum of the main diagonal", steps, total)
    res["result_latex"] = r"\operatorname{tr}A = " + tex(total)
    return _finish(res, m)


def cmd_minor(args, ctx):
    if len(args) != 3:
        raise AlgebraError("minor(A, i, j) needs a matrix and a row and column number — e.g. minor([[1,2],[3,4]], 1, 2)")
    m = _get_matrix(args[0], ctx, "minor")
    _need_square(m, "A minor")
    try:
        i, j = int(parse(args[1], ctx)), int(parse(args[2], ctx))
    except Exception:
        raise AlgebraError("The row and column numbers in minor(A, i, j) must be whole numbers")
    if not (1 <= i <= m.rows and 1 <= j <= m.cols):
        raise AlgebraError(f"Row and column numbers must be between 1 and {m.rows}")
    sub = m.minor_submatrix(i - 1, j - 1)
    mv = _det(sub) if sub.rows else S(1)
    cof = (-1) ** (i + j) * mv
    steps = [step("Matrix: ", M(m)),
             step(f"Delete row {i} and column {j}: ", M(sub)),
             step(f"Minor M{i}{j} = determinant of what is left: ", M(raw(f"= {fmt(mv)}", det_tex(sub) + " = " + tex(mv)))),
             step(f"Cofactor C{i}{j} = (−1)^({i}+{j}) · M{i}{j} = ", M(cof))]
    res = _matrix_result("matrix_minor", f"Delete row {i} and column {j}", steps, mv)
    res["result_latex"] = rf"M_{{{i}{j}}} = {tex(mv)}"
    add_extra(res, "cofactor", fmt(cof), rf"C_{{{i}{j}}} = {tex(cof)}")
    return _finish(res, m)


# ---------------------------------------------------------------------------
# Characteristic polynomial, eigenvalues, eigenvectors
# ---------------------------------------------------------------------------
_LAM = Symbol("λ")


def _charpoly_expr(m):
    n = m.rows
    return expand((_LAM * eye(n) - m).det(method="berkowitz"))


def cmd_charpoly(args, ctx):
    if len(args) != 1:
        raise AlgebraError("charpoly() takes one matrix — for example charpoly([[2,1],[1,2]])")
    m = _get_matrix(args[0], ctx, "charpoly")
    _need_square(m, "The characteristic polynomial")
    lam_minus = m - _LAM * eye(m.rows)
    p = _charpoly_expr(m)
    steps = [step("Matrix: ", M(m)),
             step("Form A − λI: ", M(lam_minus)),
             step("Characteristic polynomial p(λ) = det(A − λI) = ", M(raw(fmt(p), tex(p))))]
    if m.rows <= 4:
        try:
            fp = run_with_timeout(lambda: factor(p))
            if fp != p:
                steps.append(step("Factorised: ", M(raw(fmt(fp), tex(fp)))))
        except Exception:
            pass
    res = _matrix_result("matrix_charpoly", "det(A − λI)", steps, p)
    res["result_latex"] = r"p(\lambda) = " + tex(p)
    return _finish(res, m)


def cmd_eigen(args, ctx):
    if len(args) != 1:
        raise AlgebraError("eigen() takes one matrix — for example eigen([[2,1],[1,2]])")
    m = _get_matrix(args[0], ctx, "eigen")
    _need_square(m, "Eigenvalues")
    if m.rows > 4:
        raise AlgebraError("Eigenvalues are supported for matrices up to 4×4")
    lam_minus = m - _LAM * eye(m.rows)
    p = _charpoly_expr(m)
    steps = [step("Matrix: ", M(m)),
             step("Eigenvalues λ satisfy det(A − λI) = 0. First A − λI: ", M(lam_minus)),
             step("Characteristic equation: ", M(raw(f"{fmt(p)} = 0", tex(p) + " = 0")))]
    try:
        fp = run_with_timeout(lambda: factor(p))
        if fp != p:
            steps.append(step("Factorise: ", M(raw(f"{fmt(fp)} = 0", tex(fp) + " = 0"))))
    except Exception:
        pass

    def _compute():
        return m.eigenvects()

    try:
        triples = run_with_timeout(_compute)
    except TimeoutError:
        raise
    except Exception:
        raise AlgebraError("Couldn't find the eigenvalues of this matrix in closed form")
    triples = sorted(triples, key=lambda t: (str(t[0].is_real), fmt(t[0])))

    eig_plain, eig_tex, lines_tex = [], [], []
    for val, mult, vecs in triples:
        v = simplify(val)
        eig_plain.append(f"λ = {fmt(v)}" + (f" (multiplicity {mult})" if mult > 1 else ""))
        eig_tex.append(rf"\lambda = {tex(v)}" + (rf"\ \ (\text{{multiplicity }}{mult})" if mult > 1 else ""))
    steps.append(step("Eigenvalues: ", ",  ".join(eig_plain)))

    total = sum(mult for _, mult, _ in triples)
    if total != m.rows:
        steps.append("Some eigenvalues are complex or too complicated to express exactly here.")

    for val, mult, vecs in triples:
        v = simplify(val)
        steps.append(step(f"For λ = ", M(v), ": solve (A − λI)v = 0, i.e. ", M(m - v * eye(m.rows)), M(raw("v = 0", r"\mathbf{v} = \mathbf{0}"))))
        for vec in vecs:
            vv = vec.applyfunc(simplify)
            # scale to clear denominators for a tidy answer
            try:
                from sympy import ilcm, fraction
                dens = [fraction(e)[1] for e in vv]
                lcm_ = ilcm(*[int(dn) for dn in dens if dn.is_Integer]) if dens else 1
                if lcm_ and lcm_ != 1:
                    vv = (vv * lcm_).applyfunc(simplify)
            except Exception:
                pass
            steps.append(step("Eigenvector: ", M(vv)))
            lines_tex.append(rf"\lambda = {tex(v)}:\ \ \mathbf{{v}} = {matrix_tex(vv)}")

    tr, dt = simplify(m.trace()), _det(m)
    if total == m.rows:
        eig_sum = simplify(sum(val * mult for val, mult, _ in triples))
        eig_prod = simplify(_prod([val ** mult for val, mult, _ in triples]))
        steps.append(step("Check: sum of eigenvalues = trace → ", M(eig_sum), " = ", M(tr),
                          "  and  product of eigenvalues = determinant → ", M(eig_prod), " = ", M(dt)))

    res = {"category": "matrix_eigen", "method": "Characteristic equation det(A − λI) = 0",
           "steps": steps, "warnings": [],
           "result": "; ".join(eig_plain),
           "result_latex": r"\begin{gathered}" + r" \\ ".join(eig_tex) + r"\end{gathered}" if len(eig_tex) > 1 else (eig_tex[0] if eig_tex else "")}
    if lines_tex:
        add_extra(res, "eigenvectors", "; ".join(l.replace(r"\lambda", "λ") for l in lines_tex[:0]) or "see below",
                  r"\begin{gathered}" + r" \\ ".join(lines_tex) + r"\end{gathered}")
    add_extra(res, "trace", fmt(tr), tex(tr))
    add_extra(res, "determinant", fmt(dt), tex(dt))
    return _finish(res, m)


def _prod(items):
    out = S(1)
    for it in items:
        out = out * it
    return out


# ---------------------------------------------------------------------------
# Matrix arithmetic  (A+B, A-B, kA, AB, A^n)
# ---------------------------------------------------------------------------
_PH = r"_mx\d+"


def _expr_tex(text, ctx):
    """Best-effort LaTeX of the typed matrix expression."""
    parts = re.split(rf"\s*({_PH})\s*", text)
    out = []
    for p in parts:
        if not p:
            continue
        if p in ctx.locals:
            out.append(matrix_tex(ctx.locals[p]))
        else:
            q = p.strip()
            q = re.sub(r"\^\s*\(\s*(-?\d+)\s*\)", r"^{\1}", q)
            q = re.sub(r"\^\s*(-?\d+)", r"^{\1}", q)
            q = q.replace("*", r"\cdot ")
            out.append(q)
    return " ".join(out)


def _entrywise_add(a, b, sign):
    op = "+" if sign > 0 else "−"
    ops = "+" if sign > 0 else "-"
    lines_tex = []
    return Matrix(a.rows, a.cols, lambda i, j: a[i, j] + sign * b[i, j]), op, ops


def _product_entry_lines(a, b, prod, limit=9):
    """Show how each entry of a product is built (only for small results)."""
    if a.rows * b.cols > limit:
        return None
    rows = []
    for i in range(a.rows):
        row = []
        for j in range(b.cols):
            terms = " + ".join(f"{_ptex(a[i, k])}\\cdot{_ptex(b[k, j])}" for k in range(a.cols))
            row.append(terms)
        rows.append(row)
    body = r" \\ ".join(" & ".join(r) for r in rows)
    return r"\begin{pmatrix}" + body + r"\end{pmatrix}"


def handle_matrix_expression(text, ctx):
    """text is the placeholder-substituted expression; returns a full result dict."""
    try:
        value = parse(text, ctx)
    except (ShapeError,):
        raise AlgebraError("The matrix sizes don't fit this operation (for A·B the columns of A must equal the rows of B; "
                           "for A+B both must be the same size)")
    except NonInvertibleMatrixError:
        raise AlgebraError("This matrix is singular (determinant 0), so it has no inverse")
    except TypeError:
        raise AlgebraError("That mixes a matrix and a plain number in a way that isn't defined "
                           "(you can multiply a matrix by a number, but not add one)")
    if not isinstance(value, MatrixBase):
        return None  # a scalar came out (e.g. 2*det(A)) -> the caller treats it as an ordinary expression

    t = text.strip()
    steps = [step("Given: ", M(raw(re.sub(_PH, lambda mo: fmt(ctx.locals[mo.group(0)]), t).replace("  ", " "),
                                    _expr_tex(t, ctx))))]
    category, method = "matrix_operation", "Matrix arithmetic"

    two = re.fullmatch(rf"\s*({_PH})\s*([+\-])\s*({_PH})\s*", t)
    prod2 = re.fullmatch(rf"\s*({_PH})\s*\*?\s*({_PH})\s*", t)
    power = re.fullmatch(rf"\s*({_PH})\s*\^\s*\(?\s*(-?\d+)\s*\)?\s*", t)
    scal_l = re.fullmatch(rf"\s*(.+?)\s*\*?\s*({_PH})\s*", t)
    scal_r = re.fullmatch(rf"\s*({_PH})\s*\*\s*(.+?)\s*", t)

    try:
        if two:
            a, b = ctx.locals[two.group(1)], ctx.locals[two.group(3)]
            sign = 1 if two.group(2) == "+" else -1
            method = "Add / subtract corresponding entries"
            steps.append("Add (or subtract) the entries in matching positions:" if a.shape == b.shape else "")
            steps.append(step("Result: ", M(value)))
        elif prod2:
            a, b = ctx.locals[prod2.group(1)], ctx.locals[prod2.group(2)]
            method = "Row-by-column multiplication"
            steps.append(step(f"Sizes: ({_shape(a)})·({_shape(b)}) → result is {a.rows}×{b.cols}. "
                              "Each entry is (row of A)·(column of B)."))
            detail = _product_entry_lines(a, b, value)
            if detail:
                steps.append(step("Entry by entry: ", M(raw("…", detail))))
            steps.append(step("Result: ", M(value)))
        elif power:
            a = ctx.locals[power.group(1)]
            n = int(power.group(2))
            _need_square(a, "A power")
            method = "Repeated multiplication" if n >= 2 else ("Inverse" if n < 0 else "Identity")
            if n == 0:
                steps.append("Any square matrix to the power 0 is the identity matrix.")
            elif n < 0:
                steps.append(f"A^(−{abs(n)}) means the inverse raised to the power {abs(n)}.")
                d = _det(a)
                if d == 0:
                    raise AlgebraError("This matrix is singular (determinant 0), so it has no inverse")
            elif 2 <= n <= 4:
                acc = a
                for k in range(2, n + 1):
                    acc = acc * a
                    steps.append(step(f"A^{k} = ", M(acc)))
            else:
                steps.append(f"A^{n} computed by repeated squaring.")
            steps.append(step("Result: ", M(value)))
        else:
            steps.append("Evaluate the matrix expression step by step:")
            steps.append(step("Result: ", M(value)))
    except ShapeError:
        raise AlgebraError("The matrix sizes don't fit this operation")

    steps = [s for s in steps if s != ""]
    res = _matrix_result(category, method, steps, value)
    return _finish(res, value)


# ---------------------------------------------------------------------------
# Linear systems in matrix form (called by the equation engine)
# ---------------------------------------------------------------------------
def linear_system_matrix_steps(A, b, variables):
    """Extra worked steps for  A·x = b : matrix form, determinant, Cramer's rule / Gauss–Jordan.
    Returns (steps, extras dict). Never raises."""
    steps, extras = [], {}
    try:
        n = A.rows
        xv = Matrix(variables)
        steps.append(step("Matrix form  A·X = B: ", M(raw(f"{fmt(A)}·{fmt(xv)} = {fmt(b)}",
                                                          matrix_tex(A) + matrix_tex(xv) + " = " + matrix_tex(b)))))
        if A.rows == A.cols and A.rows in (2, 3, 4):
            D = _det(A)
            steps.append(step("Determinant of the coefficient matrix: ", M(raw(f"D = {fmt(D)}", r"D = " + det_tex(A) + " = " + tex(D)))))
            extras["determinant"] = D
            if D != 0 and A.rows <= 3:
                steps.append("D ≠ 0, so Cramer's rule applies: replace one column by B at a time.")
                for k, v in enumerate(variables):
                    Ak = A.copy()
                    Ak[:, k] = b
                    Dk = _det(Ak)
                    steps.append(step(f"D_{v} = ", M(raw(f"{fmt(Dk)}", det_tex(Ak) + " = " + tex(Dk))),
                                      "   →   ", M(raw(f"{v} = D_{v}/D = {fmt(simplify(Dk / D))}",
                                                       rf"{tex(v)} = \frac{{D_{{{tex(v)}}}}}{{D}} = \frac{{{tex(Dk)}}}{{{tex(D)}}} = {tex(simplify(Dk / D))}"))))
            elif D == 0:
                steps.append("D = 0, so Cramer's rule can't be used — the system has no solution or infinitely many. "
                             "Row-reduce the augmented matrix instead.")
        if _is_numeric(A) and _is_numeric(b):
            aug = A.row_join(b)
            R, piv, ops, trunc = _gauss_jordan(aug)
            if A.rows > 3 or not (A.rows == A.cols and _det(A) != 0):
                steps.append(step("Augmented matrix [A | B]: ", M(aug)))
                steps += _row_ops_steps(ops, trunc)
                steps.append(step("Reduced form: ", M(R)))
    except Exception:
        pass
    return steps, extras


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------
COMMANDS = {
    "det": cmd_det, "determinant": cmd_det,
    "inv": cmd_inv, "inverse": cmd_inv,
    "transpose": cmd_transpose, "trans": cmd_transpose,
    "trace": cmd_trace, "tr": cmd_trace,
    "rank": cmd_rank,
    "rref": cmd_rref,
    "adj": cmd_adj, "adjoint": cmd_adj, "adjugate": cmd_adj,
    "cofactor": cmd_cofactor, "cof": cmd_cofactor,
    "minor": cmd_minor,
    "eigen": cmd_eigen, "eig": cmd_eigen, "eigenvalues": cmd_eigen, "eigenvectors": cmd_eigen,
    "charpoly": cmd_charpoly,
}


def try_solve(text, ctx):
    """Handle `text` if it is a matrix command / matrix expression, else return None.
    Only called when the statement has no =, <, > (those go to the equation engine)."""
    call = match_call(text)
    if call and call[0].lower() in COMMANDS:
        args = split_top_level(call[1], ",")
        return COMMANDS[call[0].lower()](args, ctx)
    if has_matrix(ctx):
        return handle_matrix_expression(text, ctx)
    return None


# ---- scalar versions, so these can be used inside ordinary expressions / equations ----
def _f_det(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("det() needs a matrix — for example det([[1,2],[3,4]])")
    _need_square(m, "A determinant")
    return _det(m)


def _f_inv(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("inv() needs a matrix — for example inv([[1,2],[3,4]])")
    _need_square(m, "An inverse")
    try:
        return m.inv().applyfunc(simplify)
    except NonInvertibleMatrixError:
        raise AlgebraError("This matrix is singular (determinant 0), so it has no inverse")


def _f_transpose(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("transpose() needs a matrix")
    return m.T


def _f_trace(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("trace() needs a matrix")
    _need_square(m, "The trace")
    return simplify(m.trace())


def _f_rank(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("rank() needs a matrix")
    return S(m.rank())


def _f_adj(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("adj() needs a matrix")
    _need_square(m, "The adjugate")
    return m.adjugate()


def _f_cof(m):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("cofactor() needs a matrix")
    _need_square(m, "Cofactors")
    return _minor_and_cofactor_matrices(m)[1]


def _f_minor(m, i, j):
    if not isinstance(m, MatrixBase):
        raise AlgebraError("minor() needs a matrix")
    _need_square(m, "A minor")
    return _det(m.minor_submatrix(int(i) - 1, int(j) - 1))


EXTRA_LOCALS.update({
    "det": _f_det, "determinant": _f_det,
    "inv": _f_inv, "inverse": _f_inv,
    "transpose": _f_transpose, "trans": _f_transpose,
    "trace": _f_trace, "tr": _f_trace,
    "rank": _f_rank,
    "adj": _f_adj, "adjoint": _f_adj, "adjugate": _f_adj,
    "cofactor": _f_cof, "cof": _f_cof,
    "minor": _f_minor,
})
