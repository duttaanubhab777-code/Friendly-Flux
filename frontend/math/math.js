document.addEventListener("DOMContentLoaded", () => {
    let currentLang = "en";
    let mode = "differentiate";

    function getApiBase() {
        if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
            return "http://127.0.0.1:5000";
        }
        return "https://friendlyflux.pythonanywhere.com"; // খেয়াল রেখো, শেষে "/" নেই
    }

    // ---------- Theme & language toggle (physics/chemistry পেজের মতোই) ----------
    document.getElementById("theme-toggle").addEventListener("click", function () {
        const html = document.documentElement;
        if (html.getAttribute("data-theme") === "dark") {
            html.removeAttribute("data-theme");
            this.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            html.setAttribute("data-theme", "dark");
            this.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    document.getElementById("lang-toggle").addEventListener("click", () => {
        currentLang = currentLang === "en" ? "bn" : "en";
        updateStaticTexts();
    });

    function updateStaticTexts() {
        document.querySelectorAll("[data-lang]").forEach((el) => {
            const key = el.getAttribute("data-lang");
            if (dictionary[key]) el.innerText = dictionary[key][currentLang];
        });
    }

    // ---------- Mode switch: Differentiate vs Integrate ----------
    const modeButtons = document.querySelectorAll(".mode-btn");
    const orderGroup = document.getElementById("order-group");
    const definiteToggleGroup = document.getElementById("definite-toggle-group");
    const boundsRow = document.getElementById("bounds-row");
    const definiteToggle = document.getElementById("definite-toggle");

    modeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            mode = btn.getAttribute("data-mode");
            modeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            if (mode === "differentiate") {
                orderGroup.classList.remove("hidden");
                definiteToggleGroup.classList.add("hidden");
                boundsRow.classList.add("hidden");
            } else {
                orderGroup.classList.add("hidden");
                definiteToggleGroup.classList.remove("hidden");
                boundsRow.classList.toggle("hidden", !definiteToggle.checked);
            }
            document.getElementById("calc-result").innerText = "";
        });
    });

    definiteToggle.addEventListener("change", () => {
        boundsRow.classList.toggle("hidden", !definiteToggle.checked);
    });

    // ---------- Phone-friendly keypad: insert text at cursor position ----------
    const exprInput = document.getElementById("expr-input");

    function insertAtCursor(text, closingText) {
        const start = exprInput.selectionStart;
        const end = exprInput.selectionEnd;
        const before = exprInput.value.substring(0, start);
        const after = exprInput.value.substring(end);
        const toInsert = closingText ? text + closingText : text;
        exprInput.value = before + toInsert + after;
        // cursor বসবে ব্র্যাকেটের ভেতরে (যেমন "sin(" লিখলে cursor "(" এর পরে বসবে)
        const cursorPos = start + text.length;
        exprInput.focus();
        exprInput.setSelectionRange(cursorPos, cursorPos);
    }

    document.getElementById("keypad").addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const insert = btn.getAttribute("data-insert");
        if (insert !== null) {
            insertAtCursor(insert, btn.getAttribute("data-close"));
        }
    });

    document.getElementById("key-backspace").addEventListener("click", () => {
        const start = exprInput.selectionStart;
        const end = exprInput.selectionEnd;
        if (start === end && start > 0) {
            exprInput.value = exprInput.value.slice(0, start - 1) + exprInput.value.slice(end);
            exprInput.setSelectionRange(start - 1, start - 1);
        } else {
            exprInput.value = exprInput.value.slice(0, start) + exprInput.value.slice(end);
            exprInput.setSelectionRange(start, start);
        }
        exprInput.focus();
    });

    document.getElementById("key-clear").addEventListener("click", () => {
        exprInput.value = "";
        exprInput.focus();
    });

    // ---------- Solve ----------
    document.getElementById("solve-btn").addEventListener("click", async () => {
        const resultBox = document.getElementById("calc-result");
        const expression = exprInput.value.trim();
        const variable = document.getElementById("var-input").value.trim() || "x";

        if (!expression) {
            alert(currentLang === "en" ? "Please write a problem first!" : "আগে একটা অংক লেখো!");
            return;
        }

        const body = { operation: mode, expression, variable };

        if (mode === "differentiate") {
            body.order = parseInt(document.getElementById("order-input").value, 10) || 1;
        } else if (definiteToggle.checked) {
            body.lower = document.getElementById("lower-input").value.trim();
            body.upper = document.getElementById("upper-input").value.trim();
        }

        resultBox.innerText = currentLang === "en" ? "Solving..." : "সমাধান হচ্ছে...";

        try {
            const response = await fetch(`${getApiBase()}/api/math/calculus`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            if (data.success) {
                let text = `= ${data.result}`;
                if (data.is_numeric && data.numeric_result) {
                    text += `  ≈ ${parseFloat(data.numeric_result).toFixed(6).replace(/\.?0+$/, "")}`;
                }
                if (data.note) {
                    text += currentLang === "en" ? `\n(${data.note})` : `\n(${data.note})`;
                }
                resultBox.innerText = text;
            } else {
                resultBox.innerText = (currentLang === "en" ? "Error: " : "সমস্যা: ") + data.error;
            }
        } catch (err) {
            console.error(err);
            resultBox.innerText =
                currentLang === "en" ? "Server connection failed!" : "সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!";
        }
    });

    updateStaticTexts();
});
