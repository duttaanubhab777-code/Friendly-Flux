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
        updateLiveStatus();
    });

    function updateStaticTexts() {
        document.querySelectorAll("[data-lang]").forEach((el) => {
            const key = el.getAttribute("data-lang");
            if (dictionary[key]) el.innerText = dictionary[key][currentLang];
        });
    }

    function t(key) {
        return dictionary[key] ? dictionary[key][currentLang] : key;
    }

    // ---------- Quick-fill examples ----------
    const EXAMPLES = {
        differentiate: ["sin(x)^2 * cos(x)", "x^3 + 2*x - 5", "e^x * ln(x)", "1/(x^2 + 1)"],
        integrate: ["x^2", "sin(x)", "1/x", "e^x * cos(x)"],
    };
    const exampleRow = document.getElementById("example-row");

    function renderExamples() {
        exampleRow.innerHTML = "";
        EXAMPLES[mode].forEach((example) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "example-chip";
            chip.textContent = example;
            chip.addEventListener("click", () => {
                exprInput.value = example;
                updateLiveStatus();
                exprInput.focus();
            });
            exampleRow.appendChild(chip);
        });
    }

    // ---------- Mode switch: Differentiate vs Integrate ----------
    const modeButtons = document.querySelectorAll(".mode-btn");
    const orderGroup = document.getElementById("order-group");
    const definiteToggleGroup = document.getElementById("definite-toggle-group");
    const boundsRow = document.getElementById("bounds-row");
    const definiteToggle = document.getElementById("definite-toggle");
    const resultCard = document.getElementById("result-card");

    function hideResult() {
        resultCard.classList.add("hidden");
        resultCard.classList.remove("error");
    }

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
            renderExamples();
            hideResult();
        });
    });

    definiteToggle.addEventListener("change", () => {
        boundsRow.classList.toggle("hidden", !definiteToggle.checked);
    });

    // ---------- Keypad tabs ----------
    const keypadTabs = document.querySelectorAll(".keypad-tab");
    keypadTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            keypadTabs.forEach((t2) => t2.classList.remove("active"));
            tab.classList.add("active");
            document.querySelectorAll(".keypad-panel").forEach((panel) => {
                panel.classList.toggle("hidden", panel.id !== tab.getAttribute("data-panel"));
            });
        });
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
        updateLiveStatus();
    }

    // সব keypad panel-এর data-insert বোতামের জন্য একটাই delegated listener
    document.getElementById("keypad-tabs").parentElement.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-insert]");
        if (!btn) return;
        insertAtCursor(btn.getAttribute("data-insert"), btn.getAttribute("data-close"));
    });

    function clearExpr() {
        exprInput.value = "";
        exprInput.focus();
        updateLiveStatus();
    }

    function backspaceExpr() {
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
        updateLiveStatus();
    }

    // চারটে keypad panel-এর প্রতিটাতেই backspace/clear বোতাম আছে — সবগুলোকে একই হ্যান্ডলার দেওয়া হলো
    document.querySelectorAll('[id^="key-backspace"]').forEach((b) => b.addEventListener("click", backspaceExpr));
    document.querySelectorAll('[id^="key-clear"]').forEach((b) => b.addEventListener("click", clearExpr));

    // ---------- Live validation: bracket balance + allowed characters ----------
    // এটা ব্যাকএন্ডের নিয়মের একটা client-side আয়না — চূড়ান্ত যাচাই সবসময় সার্ভারেই হয়,
    // কিন্তু এখানে দেখালে ইউজার সাবমিট করার আগেই ভুলটা ধরতে পারে
    const ALLOWED_CHARS_RE = /^[0-9a-zA-Z_+\-*/^!(){}.,\s]*$/;
    const liveStatus = document.getElementById("live-status");

    function bracketBalance(text) {
        let depth = 0;
        for (const ch of text) {
            if (ch === "(") depth++;
            else if (ch === ")") {
                depth--;
                if (depth < 0) return "extra-close";
            }
        }
        return depth > 0 ? "missing-close" : "balanced";
    }

    function updateLiveStatus() {
        const text = exprInput.value.trim();
        exprInput.classList.remove("invalid");
        liveStatus.classList.remove("ok", "error");

        if (!text) {
            liveStatus.innerHTML = `<span class="dot"></span>${t("statusEmpty")}`;
            return;
        }
        if (!ALLOWED_CHARS_RE.test(text)) {
            liveStatus.classList.add("error");
            exprInput.classList.add("invalid");
            liveStatus.innerHTML = `<span class="dot"></span>${t("statusBadChar")}`;
            return;
        }
        const balance = bracketBalance(text);
        if (balance === "extra-close") {
            liveStatus.classList.add("error");
            exprInput.classList.add("invalid");
            liveStatus.innerHTML = `<span class="dot"></span>${t("statusUnbalancedClose")}`;
            return;
        }
        if (balance === "missing-close") {
            liveStatus.classList.add("error");
            exprInput.classList.add("invalid");
            liveStatus.innerHTML = `<span class="dot"></span>${t("statusUnbalancedOpen")}`;
            return;
        }
        liveStatus.classList.add("ok");
        liveStatus.innerHTML = `<span class="dot"></span>${t("statusOk")}`;
    }

    exprInput.addEventListener("input", updateLiveStatus);

    // ---------- Scan a photo of the problem ----------
    const ocrImageInput = document.getElementById("expr-image-input");
    const ocrStatus = document.getElementById("ocr-status");

    ocrImageInput.addEventListener("change", async () => {
        const file = ocrImageInput.files[0];
        if (!file) return;

        ocrStatus.classList.remove("hidden", "error");
        ocrStatus.innerText = t("ocrReading");

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(`${getApiBase()}/api/math/ocr`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                exprInput.value = data.expression;
                updateLiveStatus();
                ocrStatus.classList.remove("error");
                ocrStatus.innerText = t("ocrDone");
                setTimeout(() => ocrStatus.classList.add("hidden"), 2500);
            } else {
                ocrStatus.classList.add("error");
                ocrStatus.innerText = data.error;
            }
        } catch (err) {
            console.error(err);
            ocrStatus.classList.add("error");
            ocrStatus.innerText = t("serverErrMsg");
        } finally {
            // একই ফাইল আবার বেছে নিলেও যেন change ইভেন্ট ফায়ার হয়
            ocrImageInput.value = "";
        }
    });

    // ---------- Derivative-order stepper ----------
    const orderInput = document.getElementById("order-input");
    function clampOrder(value) {
        let n = parseInt(value, 10);
        if (isNaN(n)) n = 1;
        return Math.max(1, Math.min(6, n));
    }
    document.getElementById("order-minus").addEventListener("click", () => {
        orderInput.value = clampOrder(parseInt(orderInput.value, 10) - 1);
    });
    document.getElementById("order-plus").addEventListener("click", () => {
        orderInput.value = clampOrder(parseInt(orderInput.value, 10) + 1);
    });
    orderInput.addEventListener("change", () => { orderInput.value = clampOrder(orderInput.value); });

    // ---------- Solve ----------
    const solveBtn = document.getElementById("solve-btn");
    const solveBtnSpinner = document.getElementById("solve-btn-spinner");
    const solveBtnText = document.getElementById("solve-btn-text");
    const resultText = document.getElementById("result-text");
    const resultNote = document.getElementById("result-note");
    const resultActions = document.getElementById("result-actions");
    const copyResultBtn = document.getElementById("copy-result-btn");

    function setLoading(isLoading) {
        solveBtn.disabled = isLoading;
        solveBtnSpinner.classList.toggle("hidden", !isLoading);
        solveBtnText.innerText = isLoading ? t("solvingBtn") : t("solveBtn");
    }

    function showResult({ text, note, isError }) {
        resultCard.classList.remove("hidden");
        resultCard.classList.toggle("error", !!isError);
        resultText.innerText = text;

        if (note) {
            resultNote.innerText = note;
            resultNote.classList.remove("hidden");
        } else {
            resultNote.classList.add("hidden");
        }
        resultActions.classList.toggle("hidden", !!isError);
    }

    copyResultBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(resultText.innerText).then(() => {
            const original = copyResultBtn.innerText;
            copyResultBtn.innerText = t("copiedBtn");
            setTimeout(() => { copyResultBtn.innerText = original; }, 1500);
        });
    });

    solveBtn.addEventListener("click", async () => {
        const expression = exprInput.value.trim();
        const variable = document.getElementById("var-input").value.trim() || "x";

        if (!expression) {
            updateLiveStatus();
            showResult({ text: t("emptyExprMsg"), isError: true });
            return;
        }

        const body = { operation: mode, expression, variable };

        if (mode === "differentiate") {
            body.order = clampOrder(orderInput.value);
        } else if (definiteToggle.checked) {
            body.lower = document.getElementById("lower-input").value.trim();
            body.upper = document.getElementById("upper-input").value.trim();
        }

        setLoading(true);
        showResult({ text: t("solvingBtn"), isError: false });

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
                    text += `  ≈ ${data.numeric_result}`;
                }
                showResult({ text, note: data.note, isError: false });
            } else {
                showResult({ text: data.error, isError: true });
            }
        } catch (err) {
            console.error(err);
            showResult({ text: t("serverErrMsg"), isError: true });
        } finally {
            setLoading(false);
        }
    });

    renderExamples();
    updateLiveStatus();
    updateStaticTexts();
});
