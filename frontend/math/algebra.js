// =====================================================================
// ALGEBRA TOOL — talks ONLY to /api/algebra/solve (Backend/formulas/algebra_engine.py)
// Deliberately self-contained: doesn't touch calculus/geometry state,
// doesn't require the bilingual dictionary in lang.js to function.
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("algebra-input");
    const varInput = document.getElementById("algebra-var-input");
    const exampleRow = document.getElementById("algebra-example-row");
    const liveStatus = document.getElementById("algebra-live-status");

    const solveBtn = document.getElementById("algebra-solve-btn");
    const solveBtnSpinner = document.getElementById("algebra-solve-btn-spinner");
    const solveBtnText = document.getElementById("algebra-solve-btn-text");

    const resultCard = document.getElementById("algebra-result-card");
    const resultHead = document.getElementById("algebra-result-head");
    const resultText = document.getElementById("algebra-result-text");
    const resultExtra = document.getElementById("algebra-result-extra");
    const resultNote = document.getElementById("algebra-result-note");
    const resultActions = document.getElementById("algebra-result-actions");
    const copyResultBtn = document.getElementById("algebra-copy-result-btn");
    const stepsToggle = document.getElementById("algebra-steps-toggle");
    const stepsList = document.getElementById("algebra-steps-list");

    if (!solveBtn) return; // Algebra section isn't on this page

    const EXAMPLES = [
        "x^2-5x+6=0",
        "(x+2)(x+3)",
        "2x+3y=7; x-y=1",
        "|x-3|<5",
        "1/(x-2)+1/(x+2)=1",
        "sqrt(x+1)=3",
        "2^x=16",
        "x^3-6x^2+11x-6=0",
    ];

    EXAMPLES.forEach((ex) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "example-chip";
        chip.textContent = ex;
        chip.addEventListener("click", () => {
            input.value = ex;
            input.focus();
        });
        exampleRow.appendChild(chip);
    });

    const CATEGORY_LABELS = {
        algebraic_simplification: "Simplification",
        numeric_expression: "Numeric / complex arithmetic",
        numeric_equation: "Statement",
        linear_equation: "Linear equation",
        linear_equation_parametric: "Linear equation (parametric)",
        quadratic_equation: "Quadratic equation",
        quadratic_equation_parametric: "Quadratic equation (parametric)",
        polynomial_equation: "Polynomial equation",
        rational_equation: "Rational equation",
        radical_equation: "Radical equation",
        exponential_equation: "Exponential equation",
        logarithmic_equation: "Logarithmic equation",
        absolute_value_equation: "Absolute value equation",
        general_equation: "Equation",
        inequality: "Inequality",
        compound_inequality: "Compound inequality",
        linear_system: "System of linear equations",
        nonlinear_system: "System of equations",
    };

    function hideResult() {
        resultCard.classList.add("hidden");
        resultCard.classList.remove("error");
    }

    function setLoading(isLoading) {
        solveBtn.disabled = isLoading;
        solveBtnSpinner.classList.toggle("hidden", !isLoading);
        solveBtnText.textContent = isLoading ? "Solving..." : "Solve";
    }

    if (stepsToggle) {
        stepsToggle.addEventListener("click", () => {
            const open = stepsList.classList.toggle("hidden");
            stepsToggle.classList.toggle("open", !open);
            stepsToggle.querySelector("span").textContent = open ? "Show working" : "Hide working";
        });
    }

    if (copyResultBtn) {
        copyResultBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(resultText.dataset.plainText || resultText.textContent).then(() => {
                const original = copyResultBtn.textContent;
                copyResultBtn.textContent = "Copied!";
                setTimeout(() => { copyResultBtn.textContent = original; }, 1500);
            });
        });
    }

    function appendExtraRow(container, label, value) {
        if (value === undefined || value === null || value === "" ||
            (Array.isArray(value) && value.length === 0)) return;
        const row = document.createElement("div");
        row.className = "extra-row";
        row.style.marginBottom = "6px";
        const text = Array.isArray(value) ? value.join(", ") : String(value);
        row.innerHTML = `<strong>${label}:</strong> ${text}`;
        container.appendChild(row);
    }

    function showSuccess(data) {
        resultCard.classList.remove("hidden", "error");

        resultHead.textContent = CATEGORY_LABELS[data.category] || "Result";
        resultHead.classList.remove("hidden");

        resultText.textContent = data.result || "";
        resultText.dataset.plainText = data.result || "";

        resultExtra.innerHTML = "";
        appendExtraRow(resultExtra, "Discriminant", data.discriminant);
        appendExtraRow(resultExtra, "Nature of roots", data.nature_of_roots);
        appendExtraRow(resultExtra, "Vertex", data.vertex);
        appendExtraRow(resultExtra, "Axis of symmetry", data.axis_of_symmetry);
        appendExtraRow(resultExtra, "Degree", data.degree);
        appendExtraRow(resultExtra, "Numeric approximation", data.numeric_solutions);
        appendExtraRow(resultExtra, "Domain restrictions", data.domain_restrictions);
        appendExtraRow(resultExtra, "Extraneous solutions rejected", data.extraneous_solutions);
        appendExtraRow(resultExtra, "Rectangular form", data.rectangular_form);
        appendExtraRow(resultExtra, "Polar form", data.polar_form);
        appendExtraRow(resultExtra, "Modulus", data.modulus);
        resultExtra.classList.toggle("hidden", resultExtra.children.length === 0);

        const noteBits = [];
        if (data.note) noteBits.push(data.note);
        if (Array.isArray(data.warnings)) noteBits.push(...data.warnings);
        if (noteBits.length) {
            resultNote.textContent = noteBits.join(" · ");
            resultNote.classList.remove("hidden");
        } else {
            resultNote.classList.add("hidden");
        }

        if (Array.isArray(data.steps) && data.steps.length) {
            stepsList.innerHTML = "";
            data.steps.forEach((s) => {
                const li = document.createElement("li");
                li.textContent = s;
                stepsList.appendChild(li);
            });
            stepsToggle.classList.remove("hidden");
            stepsList.classList.add("hidden");
            stepsToggle.classList.remove("open");
            stepsToggle.querySelector("span").textContent = "Show working";
        } else {
            stepsToggle.classList.add("hidden");
            stepsList.classList.add("hidden");
        }

        resultActions.classList.remove("hidden");
    }

    function showError(message) {
        resultCard.classList.remove("hidden");
        resultCard.classList.add("error");
        resultHead.classList.add("hidden");
        resultExtra.classList.add("hidden");
        resultNote.classList.add("hidden");
        stepsToggle.classList.add("hidden");
        stepsList.classList.add("hidden");
        resultActions.classList.add("hidden");
        resultText.textContent = message || "Something went wrong.";
        resultText.dataset.plainText = "";
    }

    if (liveStatus) {
        input.addEventListener("input", () => {
            liveStatus.textContent = "";
        });
    }

    solveBtn.addEventListener("click", async () => {
        const problem = input.value.trim();
        if (!problem) {
            showError("Please type a problem first.");
            return;
        }
        const variable = varInput.value.trim() || null;

        setLoading(true);
        hideResult();

        try {
            const response = await fetch(`${window.getApiBase()}/api/algebra/solve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: problem, variable }),
            });
            const data = await response.json();

            if (data.success) {
                showSuccess(data);
            } else {
                showError(data.error || "Couldn't solve that problem.");
            }
        } catch (err) {
            console.error(err);
            showError("Couldn't reach the server. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            solveBtn.click();
        }
    });
});
