// ==========================================
// api-example.js — এটা GitHub-এর frontend রিপোতে যোগ করবে
// physics.html / chemistry.html / math.html -এ <script src="api-example.js"></script>
// দিয়ে যোগ করলেই backend-এর সাথে link হয়ে যাবে।
// ==========================================

// নিজের PythonAnywhere username বসাও
const API_BASE = "https://YOUR-PYTHONANYWHERE-USERNAME.pythonanywhere.com";

// Backend live আছে কিনা চেক (console-এ দেখা যাবে)
fetch(`${API_BASE}/api/health`)
  .then((res) => res.json())
  .then((data) => console.log("Backend status:", data))
  .catch((err) => console.error("Backend unreachable:", err));

// ---- Math সলভ করার উদাহরণ ----
async function solveMath(expression, variables = {}) {
  const res = await fetch(`${API_BASE}/api/math/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expression, variables }),
  });
  return res.json();
}

// ---- Physics ফর্মুলা সলভ করার উদাহরণ ----
async function solvePhysics(formula, variables = {}) {
  const res = await fetch(`${API_BASE}/api/physics/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formula, variables }),
  });
  return res.json();
}

// ---- Chemistry ফর্মুলা সলভ করার উদাহরণ ----
async function solveChemistry(formula, variables = {}) {
  const res = await fetch(`${API_BASE}/api/chemistry/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formula, variables }),
  });
  return res.json();
}

// ব্যবহার:
// solvePhysics("newtons_second_law", { m: 2, a: 5 }).then(console.log);
// solveChemistry("moles", { mass: 18, molar_mass: 18 }).then(console.log);
// solveMath("a**2 + b**2", { a: 3, b: 4 }).then(console.log);
