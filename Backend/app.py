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
from formulas.math_ocr import extract_expression_from_image, OcrError
from formulas.geometry3d_engine import solve_geometry3d, Geometry3DError

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
# MATH — ছবি থেকে অংক পড়ে নেওয়া (OCR via Gemini vision)
# ---------------------------------------------------------------------------
_MAX_OCR_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB


@app.route("/api/math/ocr", methods=["POST"])
def math_ocr():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image file was sent"}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"success": False, "error": "No image file was sent"}), 400

    image_bytes = file.read()
    if len(image_bytes) > _MAX_OCR_IMAGE_BYTES:
        return jsonify({"success": False, "error": "Image is too large (max 8MB)"}), 400

    mime_type = file.mimetype or "image/jpeg"
    try:
        expression = extract_expression_from_image(image_bytes, mime_type)
        return jsonify({"success": True, "expression": expression})
    except OcrError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------------------------------------
# THREE-DIMENSIONAL GEOMETRY
# ---------------------------------------------------------------------------
@app.route("/api/geometry3d/solve", methods=["POST"])
def geometry3d_solve():
    data = request.get_json(silent=True) or {}
    operation = data.get("operation", "")
    params = data.get("params", {})

    try:
        outcome = solve_geometry3d(operation, params)
        return jsonify({"success": True, **outcome})
    except Geometry3DError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except TimeoutError:
        return jsonify({"success": False, "error": "This calculation is too complex and timed out"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)