"""
Friendly Flux - Backend (Flask)
================================
এই ফাইলটা PythonAnywhere-এ আপলোড হবে। GitHub-এ থাকা frontend (index.html,
physics.html, chemistry.html, math.html ইত্যাদি) এই backend-এর API endpoint-এ
fetch() করে ডেটা/সমাধান নেবে।

কীভাবে কাজ করে (Link ব্যবস্থা):
--------------------------------
1. Frontend (GitHub Pages) এবং Backend (PythonAnywhere) দুটো আলাদা ডোমেইনে
   থাকবে বলে ব্রাউজার by-default cross-origin request ব্লক করে দেয়।
   এই সমস্যা সমাধানের জন্য flask-cors ব্যবহার করা হয়েছে, যাতে শুধুমাত্র
   তোমার GitHub Pages ডোমেইন থেকে আসা request-গুলো allow করা হয়।

2. Frontend থেকে শুধু এই একটা লাইন বদলালেই backend-এর সাথে link হয়ে যাবে:

       const API_BASE = "https://<তোমার-pythonanywhere-username>.pythonanywhere.com";

   তারপর যেকোনো জায়গায়:
       fetch(`${API_BASE}/api/math/solve`, { ... })

3. নিচে PHYSICS, CHEMISTRY, MATH — তিনটে subject-এর জন্য আলাদা blueprint-এর
   মতো route রাখা হয়েছে, যাতে ভবিষ্যতে formula যোগ করা সহজ হয়।
"""

import math
import re

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# ---------------------------------------------------------------------------
# CORS CONFIG — এখানেই আসল "link"। GitHub Pages-এর ডোমেইনটা বসাও।
# উদাহরণ: "https://arnabadhikari125117y.github.io"
# ডেভেলপমেন্টের সময় লোকাল টেস্টের জন্য "*" রাখা আছে; প্রোডাকশনে বদলে
# নিজের GitHub Pages URL বসিয়ে দিও।
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "https://duttaanubhab777-code.github.io",   # <-- এখানে নিজের GitHub Pages ডোমেইন বসাও
    "http://127.0.0.1:5500",                    # লোকাল টেস্ট (VS Code Live Server)
    "http://localhost:5500",
  "http://localhost:9999",
  #Acode app a localtest er jonno
]
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})


# ---------------------------------------------------------------------------
# HEALTH CHECK — frontend লোড হওয়ার সময় backend live আছে কিনা চেক করতে পারবে
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Friendly Flux backend is running"})


# ---------------------------------------------------------------------------
# MATH — সাধারণ এক্সপ্রেশন এবং কিছু বিল্ট-ইন ফর্মুলা সলভার
# ---------------------------------------------------------------------------

# নিরাপদ math ফাংশন whitelist (eval-কে নিয়ন্ত্রণে রাখার জন্য)
SAFE_MATH_NAMES = {name: getattr(math, name) for name in dir(math) if not name.startswith("_")}


def safe_eval(expression: str, variables: dict):
    """
    শুধুমাত্র সংখ্যা, +-*/ **, বন্ধনী এবং math মডিউলের ফাংশন/কনস্ট্যান্ট
    ব্যবহার করে expression evaluate করে। arbitrary code চালানো আটকানো হয়েছে।
    """
    if not re.fullmatch(r"[0-9a-zA-Z_+\-*/(){}., \s\.]*", expression):
        raise ValueError("Invalid characters in expression")

    allowed_names = {**SAFE_MATH_NAMES, **variables}
    return eval(expression, {"__builtins__": {}}, allowed_names)  # noqa: S307 (whitelisted)


@app.route("/api/math/solve", methods=["POST"])
def math_solve():
    """
    Body (JSON):
    {
        "expression": "a**2 + b**2",
        "variables": {"a": 3, "b": 4}
    }
    """
    data = request.get_json(silent=True) or {}
    expression = data.get("expression", "")
    variables = data.get("variables", {})

    try:
        result = safe_eval(expression, variables)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ---------------------------------------------------------------------------
# PHYSICS — নামযুক্ত ফর্মুলার ডিকশনারি; সহজে নতুন ফর্মুলা যোগ করা যাবে
# ---------------------------------------------------------------------------
PHYSICS_FORMULAS = {
    "newtons_second_law": lambda v: v["m"] * v["a"],                     # F = m*a
    "kinetic_energy": lambda v: 0.5 * v["m"] * v["v"] ** 2,              # KE = 1/2 m v^2
    "ohms_law": lambda v: v["I"] * v["R"],                               # V = I*R
    "final_velocity": lambda v: v["u"] + v["a"] * v["t"],                # v = u + at
}


@app.route("/api/physics/solve", methods=["POST"])
def physics_solve():
    """
    Body (JSON):
    {
        "formula": "newtons_second_law",
        "variables": {"m": 2, "a": 5}
    }
    """
    data = request.get_json(silent=True) or {}
    formula_name = data.get("formula")
    variables = data.get("variables", {})

    formula_fn = PHYSICS_FORMULAS.get(formula_name)
    if not formula_fn:
        return jsonify({
            "success": False,
            "error": f"Unknown formula '{formula_name}'",
            "available_formulas": list(PHYSICS_FORMULAS.keys()),
        }), 400

    try:
        result = formula_fn(variables)
        return jsonify({"success": True, "formula": formula_name, "result": result})
    except KeyError as e:
        return jsonify({"success": False, "error": f"Missing variable: {e}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ---------------------------------------------------------------------------
# CHEMISTRY — নামযুক্ত ফর্মুলার ডিকশনারি
# ---------------------------------------------------------------------------
CHEMISTRY_FORMULAS = {
    "moles": lambda v: v["mass"] / v["molar_mass"],                      # n = mass / M
    "molarity": lambda v: v["moles"] / v["volume_liters"],               # M = mol / L
    "ideal_gas_pressure": lambda v: (v["n"] * 0.0821 * v["T"]) / v["V"],  # PV = nRT (R in L.atm/mol.K)
}


@app.route("/api/chemistry/solve", methods=["POST"])
def chemistry_solve():
    """
    Body (JSON):
    {
        "formula": "moles",
        "variables": {"mass": 18, "molar_mass": 18}
    }
    """
    data = request.get_json(silent=True) or {}
    formula_name = data.get("formula")
    variables = data.get("variables", {})

    formula_fn = CHEMISTRY_FORMULAS.get(formula_name)
    if not formula_fn:
        return jsonify({
            "success": False,
            "error": f"Unknown formula '{formula_name}'",
            "available_formulas": list(CHEMISTRY_FORMULAS.keys()),
        }), 400

    try:
        result = formula_fn(variables)
        return jsonify({"success": True, "formula": formula_name, "result": result})
    except KeyError as e:
        return jsonify({"success": False, "error": f"Missing variable: {e}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    # লোকাল টেস্টের জন্য। PythonAnywhere-এ WSGI ফাইল দিয়ে চলবে, এটা লাগবে না।
    app.run(debug=True, port=5000)
