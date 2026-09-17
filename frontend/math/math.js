// =====================================================================
// 1. গ্লোবাল কনফিগারেশন (যাতে সব JS ফাইল এগুলো ব্যবহার করতে পারে)
// =====================================================================
window.currentLang = "en";

window.getApiBase = function() {
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
        return "http://127.0.0.1:5000";
    }
    return "https://friendlyflux.pythonanywhere.com"; 
};

window.t = function(key) {
    return dictionary[key] ? dictionary[key][window.currentLang] : key;
};

window.updateStaticTexts = function() {
    document.querySelectorAll("[data-lang]").forEach((el) => {
        const key = el.getAttribute("data-lang");
        if (dictionary[key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = dictionary[key][window.currentLang];
            } else {
                el.innerText = dictionary[key][window.currentLang];
            }
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {
    // ---------- Theme & Language Toggle (শুধুমাত্র এখানেই থাকবে) ----------
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
        window.currentLang = window.currentLang === "en" ? "bn" : "en";
        window.updateStaticTexts();
        if(typeof updateLiveStatus === "function") updateLiveStatus();
    });

    // =====================================================================
    // 2. CALCULUS & GRAPH LOGIC
    // =====================================================================
    let mode = "differentiate";
    
    const guideBtn = document.getElementById("symbol-guide-btn");
    const guidePanel = document.getElementById("symbol-guide-panel");
    const closeGuideBtn = document.getElementById("close-guide-btn");

    if(guideBtn) {
        guideBtn.addEventListener("click", () => guidePanel.classList.toggle("hidden"));
        closeGuideBtn.addEventListener("click", () => guidePanel.classList.add("hidden"));
    }

    const EXAMPLES = {
        differentiate: ["sin(x)^2 * cos(x)", "x^3 + 2*x - 5", "e^x * ln(x)", "1/(x^2 + 1)"],
        integrate: ["x^2", "sin(x)", "1/x", "e^x * cos(x)"],
        graph: ["sin(x)", "x^2", "1/(x^2+1)", "e^(-x^2)", "tan(x)", "sin(x)/x"],
    };
    const exampleRow = document.getElementById("example-row");
    const exprInput = document.getElementById("expr-input");

    function renderExamples() {
        if(!exampleRow) return;
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

    const modeButtons = document.querySelectorAll(".mode-btn");
    const orderGroup = document.getElementById("order-group");
    const definiteToggleGroup = document.getElementById("definite-toggle-group");
    const boundsRow = document.getElementById("bounds-row");
    const graphRangeRow = document.getElementById("graph-range-row");
    const definiteToggle = document.getElementById("definite-toggle");
    const resultCard = document.getElementById("result-card");
    const graphCard = document.getElementById("graph-card");
    

    function hideResult() {
        if(resultCard) {
            resultCard.classList.add("hidden");
            resultCard.classList.remove("error");
        }
        if(graphCard) graphCard.classList.add("hidden");
        if (window.clearCalcGraph) window.clearCalcGraph();
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

            const btnText = document.getElementById("solve-btn-text");
            if(btnText) btnText.innerText = mode === "graph" ? window.t("graphBtn") : window.t("solveBtn");

            renderExamples();
            hideResult();
        });
    });

    if(definiteToggle) {
        definiteToggle.addEventListener("change", () => {
            boundsRow.classList.toggle("hidden", !definiteToggle.checked);
        });
    }

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

    function insertAtCursor(text, closingText) {
        if(!exprInput) return;
        const start = exprInput.selectionStart;
        const end = exprInput.selectionEnd;
        const before = exprInput.value.substring(0, start);
        const after = exprInput.value.substring(end);

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

    const keypadWrap = document.getElementById("keypad-tabs");
    if(keypadWrap) {
        keypadWrap.parentElement.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-insert]");
            if (!btn) return;
            insertAtCursor(btn.getAttribute("data-insert"), btn.getAttribute("data-close"));
        });
    }

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

    document.querySelectorAll('[id^="key-backspace"]').forEach((b) => b.addEventListener("click", backspaceExpr));
    document.querySelectorAll('[id^="key-clear"]').forEach((b) => b.addEventListener("click", clearExpr));

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

    // math.js - replace existing readTermForward
function readTermForward(text, start) {
    let i = start;
    let endIdx = i;
    let isPureParen = false;

    if (text[i] === "(") {
        const close = findMatchingParen(text, i);
        if (close !== -1) { endIdx = close + 1; isPureParen = true; } 
        else endIdx = text.length;
    } else if (text[i] === "\\") {
        let j = i + 1;
        while (j < text.length && /[a-zA-Z]/.test(text[j])) j++;
        while (text[j] === "{") {
            const close = findMatchingBrace(text, j);
            if (close !== -1) j = close + 1; else break;
        }
        while (text[j] === "(") {
            const close = findMatchingParen(text, j);
            if (close !== -1) j = close + 1; else break;
        }
        endIdx = j;
    } else {
        let j = i;
        while (j < text.length && /[a-zA-Z0-9_.]/.test(text[j])) j++;
        while (j < text.length && text[j] === "(") {
            const close = findMatchingParen(text, j);
            if (close !== -1) j = close + 1; else break;
        }
        endIdx = j;
    }

    // Power check - পাওয়ার থাকলে ব্র্যাকেট রিমুভ করা যাবে না
    if (endIdx < text.length && text[endIdx] === "^") {
        isPureParen = false; 
        let j = endIdx + 1;
        if (j < text.length && text[j] === "{") {
            const close = findMatchingBrace(text, j);
            if (close !== -1) j = close + 1; else j = text.length;
        } else if (j < text.length && text[j] === "(") {
            const close = findMatchingParen(text, j);
            if (close !== -1) j = close + 1; else j = text.length;
        } else {
            while (j < text.length && /[a-zA-Z0-9_.]/.test(text[j])) j++;
        }
        endIdx = j;
    }

    if (isPureParen) return { term: text.slice(i + 1, endIdx - 1), end: endIdx };
    return { term: text.slice(i, endIdx), end: endIdx };
}

// math.js - replace existing readTermBackward
function readTermBackward(text, end) {
    let j = end;
    let hasPower = false;
    
    function stepBack(idx) {
        if (idx > 0 && (text[idx - 1] === ")" || text[idx - 1] === "}")) {
            let closeChar = text[idx - 1];
            let openChar = closeChar === ")" ? "(" : "{";
            let depth = 1, k = idx - 1;
            while (k > 0 && depth > 0) {
                k--;
                if (text[k] === closeChar) depth++;
                else if (text[k] === openChar) depth--;
            }
            while (k > 0 && /[a-zA-Z0-9_.]/.test(text[k - 1])) k--;
            return k;
        }
        let k = idx;
        while (k > 0 && /[a-zA-Z0-9_.]/.test(text[k - 1])) k--;
        return k;
    }

    j = stepBack(j);
    if (j > 0 && text[j - 1] === "^") {
        hasPower = true;
        j = stepBack(j - 1);
    }

    let termStr = text.slice(j, end);
    if (!hasPower && termStr.startsWith("(") && termStr.endsWith(")")) {
        let depth = 0, valid = true;
        for (let k = 0; k < termStr.length - 1; k++) {
            if (termStr[k] === "(") depth++;
            else if (termStr[k] === ")") depth--;
            if (depth === 0) { valid = false; break; }
        }
        if (valid) return { term: termStr.slice(1, -1), start: j };
    }
    return { term: termStr, start: j };
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

  // convertSqrt/convertAbs-এর মতোই depth-aware — নেস্টেড bracket-সহ exponent ঠিকভাবে ধরে
function convertPower(text) {
    let idx = text.indexOf("^");
    let guard = 0;
    while (idx !== -1 && guard < 100) {
        guard++;
        const afterIdx = idx + 1;
        if (text[afterIdx] === "(") {
            const close = findMatchingParen(text, afterIdx);
            if (close === -1) break;
            const inner = text.slice(afterIdx + 1, close);
            text = text.slice(0, idx) + "^{" + inner + "}" + text.slice(close + 1);
        } else {
            const m = text.slice(afterIdx).match(/^[a-zA-Z0-9.-]+/);
            if (!m) { idx = text.indexOf("^", idx + 1); continue; }
            const end = afterIdx + m[0].length;
            text = text.slice(0, idx) + "^{" + m[0] + "}" + text.slice(end);
        }
        idx = text.indexOf("^", idx + 1);
    }
    return text;
}

    function toLatexPreview(raw) {
    let s = raw;
    
    s = convertPower(s);
    // -----------------------------------------------------------

    s = convertSqrt(s);
    s = convertAbs(s);
    s = convertDivision(s);
    s = s.replace(/\*/g, " \\cdot ");
    s = s.replace(/\bpi\b/g, "\\pi");

    const nativeFuncs = ["sin", "cos", "tan", "cot", "sec", "csc",
                        "sinh", "cosh", "tanh", "ln", "log", "exp"];
    nativeFuncs.forEach((f) => {
        s = s.replace(new RegExp("\\b" + f + "\\(", "g"), "\\" + f + "(");
    });

s = s.replace(/\basin\(/g, "\\sin^{-1}(");
s = s.replace(/\bacos\(/g, "\\cos^{-1}(");
s = s.replace(/\batan\(/g, "\\tan^{-1}(");
s = s.replace(/\bacot\(/g, "\\cot^{-1}(");
s = s.replace(/\basec\(/g, "\\sec^{-1}(");
s = s.replace(/\bacsc\(/g, "\\csc^{-1}(");

s = s.replace(/\basinh\(/g, "\\sinh^{-1}(");
s = s.replace(/\bacosh\(/g, "\\cosh^{-1}(");
s = s.replace(/\batanh\(/g, "\\tanh^{-1}(");
s = s.replace(/\bacoth\(/g, "\\coth^{-1}(");
s = s.replace(/\basech\(/g, "\\operatorname{sech}^{-1}(");
s = s.replace(/\bacsch\(/g, "\\operatorname{csch}^{-1}(");

    const customFuncs = ["csch", "sech", "coth", "floor", "ceil", "sign", "gamma"];
    customFuncs.forEach((f) => {
        s = s.replace(new RegExp("\\b" + f + "\\(", "g"), "\\operatorname{" + f + "}(");
    });
    return s;
}


    function updateLiveStatus() {
        if(!exprInput) return;
        const text = exprInput.value.trim();
        const previewEl = document.getElementById("expr-preview");
        
        if (text) {
            katex.render("\\displaystyle " + toLatexPreview(text), previewEl, { throwOnError: false });

        } else {
            previewEl.innerHTML = "";
        }

        exprInput.classList.remove("invalid");
        liveStatus.classList.remove("ok", "error");

        if (!text) {
            liveStatus.innerHTML = `<span class="dot"></span>${window.t("statusEmpty")}`;
            return;
        }
        if (!ALLOWED_CHARS_RE.test(text)) {
            liveStatus.classList.add("error");
            exprInput.classList.add("invalid");
            liveStatus.innerHTML = `<span class="dot"></span>${window.t("statusBadChar")}`;
            return;
        }
        const balance = bracketBalance(text);
        if (balance === "extra-close") {
            liveStatus.classList.add("error");
            exprInput.classList.add("invalid");
            liveStatus.innerHTML = `<span class="dot"></span>${window.t("statusUnbalancedClose")}`;
            return;
        }
        if (balance === "missing-close") {
            liveStatus.classList.add("error");
            exprInput.classList.add("invalid");
            liveStatus.innerHTML = `<span class="dot"></span>${window.t("statusUnbalancedOpen")}`;
            return;
        }
        liveStatus.classList.add("ok");
        liveStatus.innerHTML = `<span class="dot"></span>${window.t("statusOk")}`;
    }

    if(exprInput) exprInput.addEventListener("input", updateLiveStatus);

    const ocrImageInput = document.getElementById("expr-image-input");
    const ocrStatus = document.getElementById("ocr-status");

    if(ocrImageInput) {
        ocrImageInput.addEventListener("change", async () => {
            const file = ocrImageInput.files[0];
            if (!file) return;

            ocrStatus.classList.remove("hidden", "error");
            ocrStatus.innerText = window.t("ocrReading");

            const formData = new FormData();
            formData.append("image", file);

            try {
                const response = await fetch(`${window.getApiBase()}/api/math/ocr`, {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();

                if (data.success) {
                    exprInput.value = data.expression;
                    updateLiveStatus();
                    ocrStatus.classList.remove("error");
                    ocrStatus.innerText = window.t("ocrDone");
                    setTimeout(() => ocrStatus.classList.add("hidden"), 2500);
                } else {
                    ocrStatus.classList.add("error");
                    ocrStatus.innerText = data.error;
                }
            } catch (err) {
                console.error(err);
                ocrStatus.classList.add("error");
                ocrStatus.innerText = window.t("serverErrMsg");
            } finally {
                ocrImageInput.value = "";
            }
        });
    }

    const orderInput = document.getElementById("order-input");
    function clampOrder(value) {
        let n = parseInt(value, 10);
        if (isNaN(n)) n = 1;
        return Math.max(1, Math.min(6, n));
    }
    if(document.getElementById("order-minus")) {
        document.getElementById("order-minus").addEventListener("click", () => {
            orderInput.value = clampOrder(parseInt(orderInput.value, 10) - 1);
        });
        document.getElementById("order-plus").addEventListener("click", () => {
            orderInput.value = clampOrder(parseInt(orderInput.value, 10) + 1);
        });
        orderInput.addEventListener("change", () => { orderInput.value = clampOrder(orderInput.value); });
    }

    const solveBtn = document.getElementById("solve-btn");
    const solveBtnSpinner = document.getElementById("solve-btn-spinner");
    const solveBtnText = document.getElementById("solve-btn-text");
    const resultText = document.getElementById("result-text");
    const resultNote = document.getElementById("result-note");
    const resultActions = document.getElementById("result-actions");
    const copyResultBtn = document.getElementById("copy-result-btn");
  const graphResultBtn = document.getElementById("graph-result-btn");
const resultGraphContainer = document.getElementById("result-graph-container");

    function setLoading(isLoading) {
        if(!solveBtn) return;
        solveBtn.disabled = isLoading;
        solveBtnSpinner.classList.toggle("hidden", !isLoading);
        if (isLoading) {
            solveBtnText.innerText = mode === "graph" ? window.t("graphingBtn") : window.t("solvingBtn");
        } else {
            solveBtnText.innerText = mode === "graph" ? window.t("graphBtn") : window.t("solveBtn");
        }
    }

    function showResult({ text, latex, numericResult, note, isError }) {
        graphCard.classList.add("hidden");
      if (resultGraphContainer) {
        resultGraphContainer.classList.add("hidden");
        if (window.clearCalcGraph) window.clearCalcGraph("result-graph-container");
      }
        resultCard.classList.remove("hidden");
        resultCard.classList.toggle("error", !!isError);

        resultText.dataset.plainText = text; 

        if (latex && !isError) {
    let toRender = latex;
    if (numericResult) toRender += ` \\approx ${numericResult}`;
    resultText.innerHTML = `\\[ ${toRender} \\]`;
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([resultText]).catch(() => {
            resultText.innerText = text;
        });
    } else {
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
         labelSpan.innerText = `${window.t("graphTitle")}: `;
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

        window.renderCalcGraph(points, expression);
    }

    if(copyResultBtn) {
    copyResultBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(resultText.dataset.plainText || resultText.innerText).then(() => {
            const original = copyResultBtn.innerText;
            copyResultBtn.innerText = window.t("copiedBtn");
            setTimeout(() => { copyResultBtn.innerText = original; }, 1500);
        });
    });
}

if (graphResultBtn) {
    graphResultBtn.addEventListener("click", async () => {
        const expression = resultText.dataset.rawResult;
        const variable = resultText.dataset.rawVariable || "x";
        if (!expression) return;

        graphResultBtn.disabled = true;
        const originalLabel = graphResultBtn.innerText;
        graphResultBtn.innerText = window.t("graphingBtn");

        try {
            const response = await fetch(`${window.getApiBase()}/api/math/graph`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expression, variable, xmin: -10, xmax: 10, num_points: 1000 }),
            });
            const data = await response.json();

            resultGraphContainer.classList.remove("hidden");
            if (data.success && data.points && data.points.length > 0) {
                window.renderCalcGraph(data.points, expression, "result-graph-container");
            } else {
                resultGraphContainer.innerText = data.error || window.t("noPointsMsg");
            }
        } catch (err) {
            console.error(err);
            resultGraphContainer.classList.remove("hidden");
            resultGraphContainer.innerText = window.t("serverErrMsg");
        } finally {
            graphResultBtn.disabled = false;
            graphResultBtn.innerText = originalLabel;
        }
    });
}
            

    if(solveBtn) {
        solveBtn.addEventListener("click", async () => {
            const expression = exprInput.value.trim();
            const variable = document.getElementById("var-input").value.trim() || "x";

            if (!expression) {
                updateLiveStatus();
                showResult({ text: window.t("emptyExprMsg"), isError: true });
              
                return;
            }

            setLoading(true);

            if (mode === "graph") {
                const xminRaw = document.getElementById("xmin-input").value.trim();
                const xmaxRaw = document.getElementById("xmax-input").value.trim();
                
                // pi, e, 2*pi ইত্যাদি গাণিতিক মান সাপোর্ট করার জন্য math.evaluate ব্যবহার
                let xminVal = -10, xmaxVal = 10;
                try { if(xminRaw) xminVal = math.evaluate(xminRaw); } catch(e) { xminVal = -10; }
                try { if(xmaxRaw) xmaxVal = math.evaluate(xmaxRaw); } catch(e) { xmaxVal = 10; }

                const body = {
                    expression,
                    variable,
                    xmin: xminVal, // আপডেট করা ভ্যালু
                    xmax: xmaxVal, // আপডেট করা ভ্যালু
                    num_points: 2000,
                };
          

                try {
                    const response = await fetch(`${window.getApiBase()}/api/math/graph`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });
                    const data = await response.json();

                    if (data.success && data.points && data.points.length > 0) {
                        renderGraph(data.points, data.expression || expression, data.note);
                    } else {
                        showResult({ text: data.error || window.t("noPointsMsg"), isError: true });
                    }
                } catch (err) {
                    console.error(err);
                    showResult({ text: window.t("serverErrMsg"), isError: true });
                } finally {
                    setLoading(false);
                }
                return;
            }

            const body = { operation: mode, expression, variable };

            if (mode === "differentiate") {
                body.order = clampOrder(orderInput.value);
            } else if (definiteToggle.checked) {
                body.lower = document.getElementById("lower-input").value.trim();
                body.upper = document.getElementById("upper-input").value.trim();
            }

            showResult({ text: window.t("solvingBtn"), isError: false });

            try {
                const response = await fetch(`${window.getApiBase()}/api/math/calculus`, {
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
                  resultText.dataset.rawResult = data.result;
resultText.dataset.rawVariable = variable;
if (graphResultBtn) {
    graphResultBtn.classList.toggle("hidden", variable.includes(","));
}

                } else {
                    showResult({ text: data.error, isError: true });
                }
            } catch (err) {
                console.error(err);
                showResult({ text: window.t("serverErrMsg"), isError: true });
            } finally {
                setLoading(false);
            }
        });
    }

    renderExamples();
    if(exprInput) updateLiveStatus();
    
    // Initial static text load
    window.updateStaticTexts();
});