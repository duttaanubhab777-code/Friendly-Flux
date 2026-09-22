document.addEventListener("DOMContentLoaded", () => {
    // =====================================================================
    // ১. DOM Elements Selection
    // =====================================================================
    const catBtns = document.querySelectorAll(".alg-cat-btn");
    const inputModes = document.querySelectorAll(".alg-input-mode");

    const btnSolve = document.getElementById("algebra-solve-btn");
    const spinner = document.getElementById("algebra-solve-btn-spinner");
    const btnText = document.getElementById("algebra-solve-btn-text");
    const statusDiv = document.getElementById("algebra-live-status");

    const resultCard = document.getElementById("algebra-result-card");
    const resultHead = document.getElementById("algebra-result-head");
    const resultText = document.getElementById("algebra-result-text");
    const resultExtra = document.getElementById("algebra-result-extra");
    const resultNote = document.getElementById("algebra-result-note");
    const stepsToggle = document.getElementById("algebra-steps-toggle");
    const stepsList = document.getElementById("algebra-steps-list");
    const copyResultBtn = document.getElementById("algebra-copy-result-btn");
    const resultActions = document.getElementById("algebra-result-actions");

    let currentCat = "general";

    // =====================================================================
    // ২. Category Tab Switching
    // =====================================================================
    function switchCategory(targetCat) {
        currentCat = targetCat;
        catBtns.forEach(b => b.classList.remove("active"));
        const targetBtn = document.querySelector(`.alg-cat-btn[data-cat="${targetCat}"]`);
        if(targetBtn) targetBtn.classList.add("active");

        inputModes.forEach(mode => mode.classList.add("hidden"));
        const activePanel = document.getElementById(`alg-mode-${targetCat}`);
        if(activePanel) activePanel.classList.remove("hidden");
    }

    catBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            switchCategory(btn.dataset.cat);
        });
    });

    switchCategory("general");

    // =====================================================================
    // ৩. Matrix Builder Logic
    // =====================================================================
    const matOp = document.getElementById("alg-matrix-op");
    const matBBox = document.getElementById("matrix-b-box");

    function createMatrixGrid(gridId, rowsId, colsId) {
        const grid = document.getElementById(gridId);
        if(!grid) return;
        const rows = parseInt(document.getElementById(rowsId).value) || 2;
        const cols = parseInt(document.getElementById(colsId).value) || 2;
        
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.innerHTML = "";
        
        for (let i = 0; i < rows * cols; i++) {
            const inp = document.createElement("input");
            inp.type = "text";
            inp.className = "alg-num-input";
            inp.style.width = "100%";
            inp.placeholder = "0";
            grid.appendChild(inp);
        }
    }

    function buildMatrices() {
        createMatrixGrid("mat-a-grid", "mat-a-rows", "mat-a-cols");
        createMatrixGrid("mat-b-grid", "mat-b-rows", "mat-b-cols");
    }

    ["mat-a-rows", "mat-a-cols", "mat-b-rows", "mat-b-cols"].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener("input", buildMatrices);
    });

    if(matOp) {
        matOp.addEventListener("change", () => {
            if (matOp.value === "add" || matOp.value === "multiply") {
                matBBox.classList.remove("hidden");
            } else {
                matBBox.classList.add("hidden");
            }
        });
    }
    buildMatrices();

    function getMatrixString(gridId, rowsId, colsId) {
        const grid = document.getElementById(gridId);
        const rows = parseInt(document.getElementById(rowsId).value) || 2;
        const cols = parseInt(document.getElementById(colsId).value) || 2;
        const inputs = grid.querySelectorAll("input");
        
        let mat = "[";
        for (let r = 0; r < rows; r++) {
            let rowArr = [];
            for (let c = 0; c < cols; c++) {
                let val = inputs[r * cols + c].value.trim() || "0";
                rowArr.push(val);
            }
            mat += "[" + rowArr.join(",") + "]";
            if (r < rows - 1) mat += ",";
        }
        mat += "]";
        return mat;
    }

    // =====================================================================
    // ৪. Linear Systems Logic
    // =====================================================================
    const linsysSize = document.getElementById("linsys-size");
    const linsysGrid = document.getElementById("linsys-grid");

    function buildLinsys() {
        if(!linsysSize || !linsysGrid) return;
        const size = parseInt(linsysSize.value) || 2;
        linsysGrid.innerHTML = "";
        
        for (let i = 1; i <= size; i++) {
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.gap = "10px";
            wrapper.style.width = "100%";
            
            const lbl = document.createElement("span");
            lbl.innerText = (window.currentLang === "bn" ? `সমীকরণ ${i}:` : `Eq ${i}:`);
            lbl.style.color = "var(--text-color)";
            lbl.style.fontWeight = "bold";
            
            const inp = document.createElement("input");
            inp.type = "text";
            inp.className = "alg-select";
            inp.style.flex = "1";
            
            if (i === 1) {
                inp.placeholder = window.currentLang === "bn" ? "যেমন: 2x + 3y = 7" : "e.g. 2x + 3y = 7";
            } else {
                inp.placeholder = window.currentLang === "bn" ? "যেমন: x - y = 1" : "e.g. x - y = 1";
            }
            
            wrapper.appendChild(lbl);
            wrapper.appendChild(inp);
            linsysGrid.appendChild(wrapper);
        }
    }

    if(linsysSize) linsysSize.addEventListener("input", buildLinsys);
    buildLinsys();

    // =====================================================================
    // ৫. Combinatorics Logic
    // =====================================================================
    const combType = document.getElementById("alg-comb-type");
    const combNR = document.getElementById("comb-n-r-inputs");
    const combBinom = document.getElementById("comb-binom-inputs");
    const combRBox = document.getElementById("comb-r-box");

    if(combType) {
        combType.addEventListener("change", () => {
            if (combType.value === "binomial") {
                combNR.classList.remove("hidden");
                combBinom.classList.remove("hidden");
                combRBox.classList.add("hidden");
            } else {
                combNR.classList.remove("hidden");
                combBinom.classList.add("hidden");
                combRBox.classList.remove("hidden");
            }
        });
    }

    // =====================================================================
    // ৬. Live Preview (KaTeX)
    // =====================================================================
    const genInput = document.getElementById("algebra-input");
    const genPreview = document.getElementById("algebra-expr-preview");
    let previewTimeout;

    if(genInput) {
        genInput.addEventListener("input", () => {
            clearTimeout(previewTimeout);
            const val = genInput.value.trim();
            if(!val) {
                genPreview.classList.add("hidden");
                genPreview.innerHTML = "";
                return;
            }
            previewTimeout = setTimeout(() => {
                genPreview.classList.remove("hidden");
                try {
                    katex.render(`\\displaystyle ${val.replace(/;/g, '\\quad ; \\quad')}`, genPreview, { throwOnError: false });
                } catch(e) {
                    genPreview.innerText = val;
                }
            }, 300);
        });
    }

    // =====================================================================
    // ৭. Translation & Status Helper (যেটা হারিয়ে গেছিল)
    // =====================================================================
    function t(text) {
        if (!window.algTranslate) return text;
        if (!text) return "";
        if (window.currentLang === "en") return text;
        
        const mathBlocks = [];
        let processed = text.replace(/(\\\(.*?\\\)|\\\[.*?\\\]|\$\$.*?\$\$)/g, (match) => {
            mathBlocks.push(match);
            return `⟦${mathBlocks.length - 1}⟧`;
        });

        processed = window.algTranslate(processed);

        processed = processed.replace(/⟦(\d+)⟧/g, (match, idx) => {
            return mathBlocks[parseInt(idx, 10)];
        });

        return processed;
    }

    // এই ফাংশনটি ডিলিট হয়ে গেছিল! এটি ছাড়া কোড এরর দেবে।
    function showStatus(msg, isError) {
        if(!statusDiv) return;
        statusDiv.innerHTML = `<span style="color: ${isError ? 'var(--error-color, #ef4444)' : 'inherit'}">${msg}</span>`;
    }


    // =====================================================================
    // ৮. Main API Call & Render (বাটন হ্যাং ফিক্স সহ)
    // =====================================================================
    if(btnSolve) {
        btnSolve.addEventListener("click", async () => {
            let finalInput = "";
            let varTarget = document.getElementById("algebra-var-input") ? document.getElementById("algebra-var-input").value.trim() : "";

            if (currentCat === "general") {
                finalInput = genInput.value.trim();
                if(!finalInput) return showStatus(window.currentLang === "bn" ? "দয়া করে একটি গাণিতিক সমস্যা লিখুন।" : "Please enter an expression.", true);
            } 
            else if (currentCat === "matrix") {
                const op = matOp.value;
                const matA = getMatrixString("mat-a-grid", "mat-a-rows", "mat-a-cols");
                
                if (["add", "multiply"].includes(op)) {
                    const matB = getMatrixString("mat-b-grid", "mat-b-rows", "mat-b-cols");
                    finalInput = op === "add" ? `${matA} + ${matB}` : `${matA} * ${matB}`;
                } else {
                    finalInput = `${op}(${matA})`;
                }
            }
            else if (currentCat === "linsys") {
                const inps = linsysGrid.querySelectorAll("input");
                let eqs = [];
                inps.forEach(i => { if(i.value.trim()) eqs.push(i.value.trim()); });
                if(eqs.length === 0) return showStatus(window.currentLang === "bn" ? "অন্তত একটি সমীকরণ লিখুন।" : "Please enter at least one equation.", true);
                finalInput = eqs.join(" ; ");
            }
            else if (currentCat === "combinatorics") {
                const type = combType.value;
                const n = document.getElementById("comb-n").value || "0";
                
                if (type === "ncr") {
                    const r = document.getElementById("comb-r").value || "0";
                    finalInput = `binomial(${n}, ${r})`;
                } else if (type === "npr") {
                    const r = document.getElementById("comb-r").value || "0";
                    finalInput = `factorial(${n}) / factorial(${n} - ${r})`;
                } else if (type === "binomial") {
                    const a = document.getElementById("comb-a").value || "x";
                    const b = document.getElementById("comb-b").value || "y";
                    finalInput = `expand((${a} + ${b})^${n})`;
                }
            }

            // Loading state (Language Aware)
            btnSolve.disabled = true;
            spinner.classList.remove("hidden");
            btnText.innerText = window.currentLang === "bn" ? "সমাধান হচ্ছে..." : "Solving..."; 
            showStatus("", false);
            resultCard.classList.add("hidden");
            stepsList.classList.add("hidden");
            stepsList.innerHTML = "";
            resultActions.classList.add("hidden");
            
            try {
                const apiBase = (typeof window.getApiBase === 'function') ? window.getApiBase() : "";
                const res = await fetch(`${apiBase}/api/algebra/solve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: finalInput, variable: varTarget })
                });
                
                // সার্ভার এরর হলে বাটন যেন আটকে না থাকে
                if (!res.ok) {
                    throw new Error(`Server Error: ${res.status}`);
                }
                
                const data = await res.json();
                
                if (!data.success) {
                    showStatus(t(data.error || "An error occurred."), true);
                    return;
                }

                // ==========================================
                // FIX: পাইথন থেকে আসা LaTeX এররগুলো ক্লিন করা
                // ==========================================
                function fixLatex(str) {
                    if (!str || typeof str !== "string") return str;
                    // \text ভুল করে Tab (\t) হয়ে গেলে তা ঠিক করা এবং \quad এর পর স্পেস দেওয়া
                    return str.replace(/\text/g, "\\text").replace(/\\quad([a-zA-Z])/g, "\\quad $1");
                }
                
                data.raw_latex = fixLatex(data.raw_latex);
                data.result_latex = fixLatex(data.result_latex);
                if (data.steps_latex) data.steps_latex = data.steps_latex.map(fixLatex);
                if (data.steps) data.steps = data.steps.map(fixLatex);
                // ==========================================

                // ১. Problem/Input Render

                resultHead.innerHTML = `<h4>${window.currentLang === "bn" ? "সমস্যা:" : "Problem:"}</h4> <div class="math-result-large">\\( ${data.raw_latex || data.clean_input || finalInput} \\)</div>`;
                
                // ২. Result Render
                let resStr = data.result_latex ? `\\( ${data.result_latex} \\)` : (data.result || "");
                resultText.innerHTML = `<h4>${window.currentLang === "bn" ? "ফলাফল:" : "Result:"}</h4> <div class="math-result-large">${resStr}</div>`;
                resultText.dataset.plainText = data.result;
                
                // ৩. Extra Text Render
                if (data.text) {
                    resultExtra.classList.remove("hidden");
                    resultExtra.innerHTML = t(data.text);
                } else {
                    resultExtra.classList.add("hidden");
                }

                // ৪. Note/Method Render
                if (data.method) {
                    resultNote.classList.remove("hidden");
                    resultNote.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${t(data.method)}`;
                } else {
                    resultNote.classList.add("hidden");
                }

                // ৫. Steps Render
                const stepsArr = data.steps_latex || data.steps || [];
                if (stepsArr.length > 0) {
                    stepsToggle.classList.remove("hidden");
                    stepsToggle.querySelector("span").innerText = window.currentLang === "bn" ? "ধাপগুলো দেখুন" : "Show working";
                    stepsList.innerHTML = "";
                    stepsArr.forEach(step => {
                        const li = document.createElement("li");
                        li.innerHTML = t(step); 
                        stepsList.appendChild(li);
                    });
                } else {
                    stepsToggle.classList.add("hidden");
                }

                resultCard.classList.remove("hidden");
                resultActions.classList.remove("hidden");
                
                if (window.renderMathInElement) {
                    renderMathInElement(resultCard, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ]
                    });
                }
                
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            } catch (err) {
                console.error(err);
                showStatus(window.currentLang === "bn" ? "নেটওয়ার্ক এরর: সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।" : "Network error: Could not reach the server.", true);
            } finally {
                btnSolve.disabled = false;
                spinner.classList.add("hidden");
                btnText.innerText = window.currentLang === "bn" ? "সমাধান করো" : "Solve";
            }
        });
    }

    // =====================================================================
    // ৯. Steps & Copy Buttons (Language Aware)
    // =====================================================================
    if(stepsToggle) {
        stepsToggle.addEventListener("click", () => {
            stepsList.classList.toggle("hidden");
            const span = stepsToggle.querySelector("span");
            const isHidden = stepsList.classList.contains("hidden");
            if (window.currentLang === "bn") {
                span.innerText = isHidden ? "ধাপগুলো দেখুন" : "ধাপগুলো লুকান";
            } else {
                span.innerText = isHidden ? "Show working" : "Hide working";
            }
        });
    }

    if(copyResultBtn) {
        copyResultBtn.addEventListener("click", () => {
            const txt = resultText.dataset.plainText || resultText.innerText;
            navigator.clipboard.writeText(txt).then(() => {
                const original = copyResultBtn.innerText;
                copyResultBtn.innerText = window.currentLang === "bn" ? "কপি হয়েছে!" : "Copied!";
                setTimeout(() => { copyResultBtn.innerText = original; }, 1500);
            });
        });
    }
});
