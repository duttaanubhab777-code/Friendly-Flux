# Friendly Flux

**Friendly Flux** is a web platform for solving problems in **Mathematics, Physics, and Chemistry**, built as a lightweight Flask API paired with a static, framework-free frontend. It combines a step-by-step formula solver (for Physics/Chemistry) with a full symbolic calculus engine (for Math), so learners can plug in known values or type an expression and get a worked, human-readable answer.

🔗 **Live site:** https://duttaanubhab777-code.github.io

---

## Features

### 📐 Mathematics — Calculus Solver
- **Differentiation** — supports single-variable derivatives of any order (1st–6th) and mixed partial derivatives (e.g. `∂²/∂x∂y`).
- **Integration** — indefinite and definite integrals, with automatic detection of non-elementary (no closed-form) results.
- **Graphing** — numerically samples any single-variable expression over a custom range and renders it as a line chart.
- Powered by [SymPy](https://www.sympy.org/) for true symbolic computation — not numeric approximation — so results are exact, simplified expressions (e.g. `x^(y-1)*y`, not decimals).
- Understands a wide range of functions out of the box: trigonometric, inverse trigonometric, hyperbolic, inverse hyperbolic, logarithmic, exponential, factorial, floor/ceiling, sign, and gamma.
- Built-in safeguards: bracket-balance checking, character allow-listing, expression complexity limits, and per-request timeouts — so malformed or malicious input never hangs or crashes the server.

### 🚀 Physics & 🧪 Chemistry — Formula Solver
- A shared **forward-chaining formula engine**: give it any known values, and it automatically figures out which formulas can be applied — in what order — to solve for the unknown you're after, showing each intermediate step.
- Formulas are defined as plain algebraic strings (e.g. `"F = m*a"`), parsed and solved symbolically via SymPy, so adding new formulas doesn't require writing solver logic by hand.
- Covers a growing set of Physics and Chemistry topics, organized by chapter/subject.

### 🌐 Frontend
- Pure HTML/CSS/JavaScript — no build step, no framework, deployable as-is to any static host (currently GitHub Pages).
- Bilingual UI (English / বাংলা) with a single toggle.
- Light/dark theme support.
- Mobile-first design with a categorized on-screen keypad for typing expressions without a physical keyboard.
- Live input validation (bracket balance, allowed characters) before a request ever reaches the server.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Backend    | Python, Flask, Flask-CORS, SymPy                  |
| Frontend   | HTML5, CSS3, vanilla JavaScript, Chart.js         |
| Deployment | Backend on PythonAnywhere · Frontend on GitHub Pages |

---

## Project Structure

```
Friendly-Flux/
├── Backend/
│   ├── app.py                    # Flask app — all API routes
│   ├── requirements-3.txt        # Python dependencies
│   └── formulas/
│       ├── calculus_engine.py    # Differentiation / integration (SymPy)
│       ├── graph_engine.py       # Numerical sampling for the Graph tool
│       ├── formula_engine.py     # Forward-chaining solver for Physics/Chemistry
│       ├── physics_formulas.py   # Physics formula definitions
│       └── chemistry_formulas.py # Chemistry formula definitions
│
└── frontend/
    ├── index.html, style.css, script.js, shared.js   # Landing page
    ├── math/                     # Calculus Solver page
    ├── physics/                  # Physics Solver page
    └── chemistry/                # Chemistry Solver page
```

---

## Getting Started (Local Development)

### Backend

```bash
cd Backend
pip install -r requirements-3.txt
python app.py
```

The API will start on `http://127.0.0.1:5000`.

### Frontend

The frontend is fully static — open any of the HTML files directly, or serve the `frontend/` folder with any local server (e.g. VS Code Live Server, `python -m http.server`). By default it talks to `http://127.0.0.1:5000` when running on `localhost`, and falls back to the deployed backend otherwise.

---

## API Overview

| Endpoint                | Method | Purpose                                   |
|--------------------------|--------|--------------------------------------------|
| `/api/health`            | GET    | Health check                               |
| `/api/math/solve`        | POST   | Evaluate a plain arithmetic expression      |
| `/api/math/calculus`     | POST   | Differentiate or integrate an expression    |
| `/api/math/graph`        | POST   | Get sampled points for plotting             |
| `/api/physics/solve`     | POST   | Solve for a target physics variable         |
| `/api/chemistry/solve`   | POST   | Solve for a target chemistry variable       |

All endpoints accept and return JSON. See `Backend/api-example.js` for sample request/response payloads.

---

## Credits

Built by **Anubhab Dutta** & **Arnab Adhikari**.

© 2026 Friendly Flux

