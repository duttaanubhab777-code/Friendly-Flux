"""
Friendly Flux - Backend (Flask)
================================
"""

import math
import re

from flask import Flask, jsonify, request
from flask_cors import CORS

from formulas.physics_formulas import PHYSICS_FORMULAS
from formulas.chemistry_formulas import CHEMISTRY_FORMULAS
from formulas.formula_engine import solve_target
from formulas.calculus_engine import solve_calculus, CalculusError
from formulas.graph_engine import generate_graph_data

app = Flask(__name__)

ALLOWED_ORIGINS = [
    "https://duttaanubhab777-code.github.io",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:9999",
]
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Friendly Flux backend is running"})


# ---------------------------------------------------------------------------
# MATH — আগের মতোই অপরিবর্তিত
# ---------------------------------------------------------------------------
SAFE_MATH_NAMES = {name: getattr(math, name) for name in dir(math) if not name.startswith("_")}


def safe_eval(expression: str, variables: dict):
    if not re.fullmatch(r"[0-9a-zA-Z_+\-*/(){}., \s\.]*", expression):
        raise ValueError("Invalid characters in expression")
    allowed_names = {**SAFE_MATH_NAMES, **variables}
    return eval(expression, {"__builtins__": {}}, allowed_names)  # noqa: S307


@app.route("/api/math/solve", methods=["POST"])
def math_solve():
    data = request.get_json(silent=True) or {}
    expression = data.get("expression", "")
    variables = data.get("variables", {})
    try:
        result = safe_eval(expression, variables)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ---------------------------------------------------------------------------
# PHYSICS
# ---------------------------------------------------------------------------
@app.route("/api/physics/solve", methods=["POST"])
def physics_solve():
    data = request.get_json(silent=True) or {}
    target = data.get("target")
    known_values = data.get("variables", {})

    if not target:
        return jsonify({"success": False, "error": "Target variable is missing"}), 400

    try:
        result, steps = solve_target(PHYSICS_FORMULAS, known_values, target)
        return jsonify({
            "success": True,
            "target": target,
            "result": result[target],
            "steps": steps
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e), "known_values_so_far": known_values}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ---------------------------------------------------------------------------
# CHEMISTRY
# ---------------------------------------------------------------------------
@app.route("/api/chemistry/solve", methods=["POST"])
def chemistry_solve():
    data = request.get_json(silent=True) or {}
    target = data.get("target")
    known_values = data.get("variables", {})

    if not target:
        return jsonify({"success": False, "error": "Target variable is missing"}), 400

    try:
        result, steps = solve_target(CHEMISTRY_FORMULAS, known_values, target)
        return jsonify({
            "success": True,
            "target": target,
            "result": result[target],
            "steps": steps
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e), "known_values_so_far": known_values}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ---------------------------------------------------------------------------
# CALCULUS — ইন্টিগ্রেশন / ডিফারেনশিয়েশন (sympy দিয়ে symbolic সমাধান)
# ---------------------------------------------------------------------------
@app.route("/api/math/calculus", methods=["POST"])
def calculus_solve():
    data = request.get_json(silent=True) or {}
    operation = data.get("operation", "")
    expression = data.get("expression", "")
    variable = data.get("variable", "x")
    order = data.get("order", 1)
    lower = data.get("lower")
    upper = data.get("upper")

    if operation not in ("differentiate", "integrate"):
        return jsonify({"success": False, "error": "operation must be 'differentiate' or 'integrate'"}), 400

    try:
        outcome = solve_calculus(operation, expression, variable, order, lower, upper)
        return jsonify({"success": True, **outcome})
    except CalculusError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except TimeoutError as e:
        return jsonify({"success": False, "error": "This expression is too complex and timed out"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ---------------------------------------------------------------------------
# GRAPH — any single-variable expression → numerical points for plotting
# ---------------------------------------------------------------------------
@app.route("/api/math/graph", methods=["POST"])
def math_graph():
    data = request.get_json(silent=True) or {}
    expression = data.get("expression", "")
    variable = data.get("variable", "x")
    xmin = data.get("xmin", -10)
    xmax = data.get("xmax", 10)
    num_points = data.get("num_points", 300)

    try:
        outcome = generate_graph_data(expression, variable, xmin, xmax, num_points)
        return jsonify({"success": True, **outcome})
    except CalculusError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except TimeoutError:
        return jsonify({"success": False, "error": "This expression is too complex and timed out"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)