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
  const guideBtn = document.getElementById("symbol-guide-btn");
const guidePanel = document.getElementById("symbol-guide-panel");
const closeGuideBtn = document.getElementById("close-guide-btn");

guideBtn.addEventListener("click", () => {
    guidePanel.classList.toggle("hidden");
});
closeGuideBtn.addEventListener("click", () => {
    guidePanel.classList.add("hidden");
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
        graph: ["sin(x)", "x^2", "1/(x^2+1)", "e^(-x^2)", "tan(x)", "sin(x)/x"],
    };
    const exampleRow = document.getElementById("example-row");

    function renderExamples() {
        exampleRow.innerHTML = "";
        (EXAMPLES[mode] || []).forEach((example) => {
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

    // ---------- Mode switch: Differentiate / Integrate / Graph ----------
    const modeButtons = document.querySelectorAll(".mode-btn");
    const orderGroup = document.getElementById("order-group");
    const definiteToggleGroup = document.getElementById("definite-toggle-group");
    const boundsRow = document.getElementById("bounds-row");
    const graphRangeRow = document.getElementById("graph-range-row");
    const definiteToggle = document.getElementById("definite-toggle");
    const resultCard = document.getElementById("result-card");
    const graphCard = document.getElementById("graph-card");

    let chartInstance = null;

    function hideResult() {
        resultCard.classList.add("hidden");
        resultCard.classList.remove("error");
        graphCard.classList.add("hidden");
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    }

    modeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            mode = btn.getAttribute("data-mode");
            modeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            orderGroup.classList.add("hidden");
            definiteToggleGroup.classList.add("hidden");
            boundsRow.classList.add("hidden");
            graphRangeRow.classList.add("hidden");

            if (mode === "differentiate") {
                orderGroup.classList.remove("hidden");
            } else if (mode === "integrate") {
                definiteToggleGroup.classList.remove("hidden");
                boundsRow.classList.toggle("hidden", !definiteToggle.checked);
            } else if (mode === "graph") {
                graphRangeRow.classList.remove("hidden");
            }

            // Update button text
            const btnText = document.getElementById("solve-btn-text");
            if (mode === "graph") {
                btnText.innerText = t("graphBtn");
            } else {
                btnText.innerText = t("solveBtn");
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

    // আগের ক্যারেক্টার অক্ষর/সংখ্যা হলে, আর নতুন যা বসছে সেটাও অক্ষর দিয়ে শুরু হলে, মাঝে * বসাও
    const prevChar = before.slice(-1);
    const needsSeparator = /[a-zA-Z0-9)]$/.test(prevChar) && /^[a-zA-Z]/.test(text);
    const separator = needsSeparator ? "*" : "";

    const toInsert = separator + text + (closingText || "");
    exprInput.value = before + toInsert + after;
    const cursorPos = start + separator.length + text.length;
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

  function findMatchingParen(str, openIndex) {
    let depth = 1;
    for (let i = openIndex + 1; i < str.length; i++) {
        if (str[i] === "(") depth++;
        else if (str[i] === ")") {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}
function findMatchingBrace(str, openIndex) {
    let depth = 1;
    for (let i = openIndex + 1; i < str.length; i++) {
        if (str[i] === "{") depth++;
        else if (str[i] === "}") {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function readTermForward(text, start) {
    let i = start;
    if (text[i] === "(") {
        const close = findMatchingParen(text, i);
        if (close === -1) return { term: text.slice(i), end: text.length };
        return { term: text.slice(i + 1, close), end: close + 1 };
    }
    if (text[i] === "\\") {
        let j = i + 1;
        while (j < text.length && /[a-zA-Z]/.test(text[j])) j++;
        while (text[j] === "{") {
            const close = findMatchingBrace(text, j);
            if (close === -1) break;
            j = close + 1;
        }
        while (text[j] === "(") {
            const close = findMatchingParen(text, j);
            if (close === -1) break;
            j = close + 1;
        }
        return { term: text.slice(i, j), end: j };
    }
    let j = i;
    while (j < text.length && /[a-zA-Z0-9_.]/.test(text[j])) j++;
    while (text[j] === "(") {
        const close = findMatchingParen(text, j);
        if (close === -1) break;
        j = close + 1;
    }
    if (text[j] === "^") {
        j++;
        if (text[j] === "{") {
            const close = findMatchingBrace(text, j);
            if (close !== -1) j = close + 1;
        } else if (j < text.length) {
            j++;
        }
    }
    return { term: text.slice(i, j), end: j };
}

function readTermBackward(text, end) {
    if (text[end - 1] === ")") {
        let depth = 1, j = end - 2;
        while (j >= 0 && depth > 0) {
            if (text[j] === ")") depth++;
            else if (text[j] === "(") depth--;
            if (depth === 0) break;
            j--;
        }
        if (j < 0) return { term: text.slice(0, end), start: 0 };
        let k = j;
        while (k > 0 && /[a-zA-Z0-9_.]/.test(text[k - 1])) k--;
        return { term: text.slice(k, end), start: k };
    }
    let j = end;
    while (j > 0 && /[a-zA-Z0-9_.]/.test(text[j - 1])) j--;
    return { term: text.slice(j, end), start: j };
}

function convertDivision(text) {
    let idx = text.indexOf("/");
    let guard = 0;
    while (idx !== -1 && guard < 50) {
        guard++;
        const before = readTermBackward(text, idx);
        const after = readTermForward(text, idx + 1);
        const replaced = "\\frac{" + before.term + "}{" + after.term + "}";
        text = text.slice(0, before.start) + replaced + text.slice(after.end);
        idx = text.indexOf("/");
    }
    return text;
}
  
function convertSqrt(text) {
    let idx = text.indexOf("sqrt(");
    while (idx !== -1) {
        const openParen = idx + 4;
        const closeParen = findMatchingParen(text, openParen);
        if (closeParen === -1) break;
        const inner = text.slice(openParen + 1, closeParen);
        text = text.slice(0, idx) + "\\sqrt{" + inner + "}" + text.slice(closeParen + 1);
        idx = text.indexOf("sqrt(");
    }
    return text;
}
  function convertAbs(text) {
    let idx = text.indexOf("abs(");
    while (idx !== -1) {
        const openParen = idx + 3;
        const closeParen = findMatchingParen(text, openParen);
        if (closeParen === -1) break;
        const inner = text.slice(openParen + 1, closeParen);
        text = text.slice(0, idx) + "\\left|" + inner + "\\right|" + text.slice(closeParen + 1);
        idx = text.indexOf("abs(");
    }
    return text;
  }

function toLatexPreview(raw) {
    let s = raw;
    s = convertSqrt(s);
    s = convertAbs(s);
  s = convertDivision(s);
    s = s.replace(/\*/g, " \\cdot ");
    s = s.replace(/\bpi\b/g, "\\pi");

    // KaTeX নিজে চেনে এমন ফাংশন — সরাসরি ব্যাকস্ল্যাশ ব্যবহার করা যায়
    const nativeFuncs = ["sin", "cos", "tan", "cot", "sec", "csc",
                         "sinh", "cosh", "tanh", "ln", "log", "exp"];
    nativeFuncs.forEach((f) => {
        s = s.replace(new RegExp("\\b" + f + "\\(", "g"), "\\" + f + "(");
    });

    // asin/acos/atan কে বেশি প্রচলিত arcsin/arccos/arctan হিসেবে দেখানো (এগুলো KaTeX চেনে)
    s = s.replace(/\basin\(/g, "\\arcsin(");
    s = s.replace(/\bacos\(/g, "\\arccos(");
    s = s.replace(/\batan\(/g, "\\arctan(");

    // বাকি সব কাস্টম/কম-প্রচলিত ফাংশন — \operatorname{} দিয়ে upright দেখানো
    const customFuncs = ["asinh", "acosh", "atanh", "acsch", "asech", "acoth",
                         "csch", "sech", "coth", "floor", "ceil", "sign", "gamma"];
    customFuncs.forEach((f) => {
        s = s.replace(new RegExp("\\b" + f + "\\(", "g"), "\\operatorname{" + f + "}(");
    });

    return s;
}
  function updateLiveStatus() {
    const text = exprInput.value.trim();

    const previewEl = document.getElementById("expr-preview");
    if (text) {
        katex.render(toLatexPreview(text), previewEl, { throwOnError: false });
    } else {
        previewEl.innerHTML = "";
    }

    

    
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
        if (isLoading) {
            solveBtnText.innerText = mode === "graph" ? t("graphingBtn") : t("solvingBtn");
        } else {
            solveBtnText.innerText = mode === "graph" ? t("graphBtn") : t("solveBtn");
        }
    }

    function showResult({ text, latex, numericResult, note, isError }) {
    graphCard.classList.add("hidden");
    resultCard.classList.remove("hidden");
    resultCard.classList.toggle("error", !!isError);

    resultText.dataset.plainText = text; // কপি বাটনের জন্য প্লেইন টেক্সট রেখে দিলাম

    if (latex && !isError) {
        let toRender = latex;
        if (numericResult) toRender += ` \\approx ${numericResult}`;
        try {
            katex.render(toRender, resultText, { throwOnError: false, displayMode: true });
        } catch (e) {
            resultText.innerText = text;
        }
    } else {
        resultText.innerText = text;
    }

    if (note) {
        resultNote.innerText = note;
        resultNote.classList.remove("hidden");
    } else {
        resultNote.classList.add("hidden");
    }
    resultActions.classList.toggle("hidden", !!isError);
    }

    function renderGraph(points, expression, note) {
        resultCard.classList.add("hidden");
        graphCard.classList.remove("hidden");

        const titleEl = document.getElementById("graph-title");
titleEl.innerHTML = "";
const labelSpan = document.createElement("span");
labelSpan.innerText = `${t("graphTitle")}: `;
titleEl.appendChild(labelSpan);
const mathSpan = document.createElement("span");
titleEl.appendChild(mathSpan);
katex.render(toLatexPreview(expression), mathSpan, { throwOnError: false });

        const noteEl = document.getElementById("graph-note");
        if (note) {
            noteEl.innerText = note;
            noteEl.classList.remove("hidden");
        } else {
            noteEl.classList.add("hidden");
        }

        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const canvas = document.getElementById("graph-canvas");
        const ctx = canvas.getContext("2d");
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
      const rootStyles = getComputedStyle(document.documentElement);
const primaryColor = rootStyles.getPropertyValue('--primary').trim();
const isMobile = window.innerWidth < 480;
        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: xs,
                datasets: [{
                    label: expression,
                    data: ys,
                    borderColor: primaryColor,
backgroundColor: primaryColor + "26",
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.15,
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: isMobile ? 0.85 : 1.1,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (items) => `x = ${items[0].label}`,
                            label: (item) => `y = ${item.formattedValue}`,
                        },
                    },
                },
                scales: {
                    x: {
                        type: "linear",
                        title: { display: true, text: "x", color: isDark ? "#9ca3af" : "#6b7280" },
                        ticks: { color: isDark ? "#9ca3af" : "#6b7280", maxTicksLimit: isMobile ? 6 : 10, font: { size: isMobile ? 10 : 12 } },
                        grid: { color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
                    },
                    y: {
                        title: { display: true, text: "y", color: isDark ? "#9ca3af" : "#6b7280" },
                        ticks: { color: isDark ? "#9ca3af" : "#6b7280", font: { size: isMobile ? 10 : 12 } },
                        grid: { color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
                    },
                },
            },
        });
    }

    copyResultBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(resultText.dataset.plainText || resultText.innerText).then(() => {
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

        setLoading(true);

        if (mode === "graph") {
            // ---------- Graph mode ----------
            const xminRaw = document.getElementById("xmin-input").value.trim();
            const xmaxRaw = document.getElementById("xmax-input").value.trim();
            const body = {
                expression,
                variable,
                xmin: xminRaw === "" ? -10 : Number(xminRaw),
                xmax: xmaxRaw === "" ? 10 : Number(xmaxRaw),
                num_points: 400,
            };

            try {
                const response = await fetch(`${getApiBase()}/api/math/graph`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                const data = await response.json();

                if (data.success && data.points && data.points.length > 0) {
                    renderGraph(data.points, data.expression || expression, data.note);
                } else {
                    showResult({ text: data.error || t("noPointsMsg"), isError: true });
                }
            } catch (err) {
                console.error(err);
                showResult({ text: t("serverErrMsg"), isError: true });
            } finally {
                setLoading(false);
            }
            return;
        }

        // ---------- Differentiate / Integrate ----------
        const body = { operation: mode, expression, variable };

        if (mode === "differentiate") {
            body.order = clampOrder(orderInput.value);
        } else if (definiteToggle.checked) {
            body.lower = document.getElementById("lower-input").value.trim();
            body.upper = document.getElementById("upper-input").value.trim();
        }

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
    showResult({
        text,
        latex: data.latex,
        numericResult: data.is_numeric ? data.numeric_result : null,
        note: data.note,
        isError: false,
    });
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
