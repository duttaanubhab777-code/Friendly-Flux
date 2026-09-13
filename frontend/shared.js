/* ==========================================================================
   Friendly Flux — Shared Page Logic
   Physics আর Chemistry পেজ দুটোর কোড প্রায় হুবহু এক ছিল — শুধু ডেটা আলাদা।
   দুই জায়গায় কপি-পেস্ট থাকার কারণেই আগে বাগ হয়েছিল (physics.js নতুন
   backend-এর জন্য আপডেট হয়েছিল, কিন্তু chemistry.js পুরনো থেকে গিয়েছিল)।
   এখন একটাই ফাইলে লজিক আছে; নতুন পেজ (math ইত্যাদি) বানাতে হলে শুধু
   FriendlyFluxApp.init({...}) কল করলেই হবে।
   ========================================================================== */

const FriendlyFluxApp = (function () {

    // production API_BASE-এ কখনোই শেষে "/" রাখবে না — রাখলে
    // `${API_BASE}/api/...` করার সময় "//api/..." (ডবল স্ল্যাশ) তৈরি হয়,
    // আর Flask সেই route matchই করে না, ফলে PythonAnywhere-এ সবসময় 404 আসে
    // (লোকালহোস্টে বোঝা যায় না, কারণ লোকাল URL-এ ভুলটা ছিল না)।
    function getApiBase() {
        if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
            return "http://127.0.0.1:5000";
        }
        return "https://friendlyflux.pythonanywhere.com"; // <-- খেয়াল করো, শেষে "/" নেই
    }

    function init({ formulas, dictionary, apiPath }) {
        let currentLang = "en";
        let selectedFormulaId = null;

        const formulaGrid = document.getElementById("formula-grid");
        const searchInput = document.getElementById("search-input");
        const calcSection = document.getElementById("calculator-section");
        const dynamicInputs = document.getElementById("dynamic-inputs");
        const calcTitle = document.getElementById("calc-title");
        const resultDisplay = document.getElementById("result-display");

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
            renderGrid(searchInput.value);
            if (selectedFormulaId) openCalculator(selectedFormulaId);
        });

        function updateStaticTexts() {
            document.querySelectorAll("[data-lang]").forEach((el) => {
                const key = el.getAttribute("data-lang");
                if (dictionary[key]) el.innerText = dictionary[key][currentLang];
            });
            searchInput.placeholder = dictionary.searchPlaceholder[currentLang];
        }

        function renderGrid(query = "") {
            formulaGrid.innerHTML = "";
            const lowerQuery = query.toLowerCase();

            Object.values(formulas).forEach((item) => {
                const matchName =
                    item.name.en.toLowerCase().includes(lowerQuery) || item.name.bn.includes(query);
                const matchTag = item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

                if (matchName || matchTag) {
                    const card = document.createElement("div");
                    card.className = "formula-card";
                    card.innerHTML = `<h3>${item.name[currentLang]}</h3><p>${item.formula}</p>`;
                    card.addEventListener("click", () => openCalculator(item.id));
                    formulaGrid.appendChild(card);
                }
            });
        }

        searchInput.addEventListener("input", (e) => renderGrid(e.target.value));

        function openCalculator(id) {
            selectedFormulaId = id;
            const item = formulas[id];

            calcTitle.innerText = `${item.name[currentLang]} (${item.formula})`;
            resultDisplay.innerText = "";

            dynamicInputs.innerHTML = `
                <div class="input-group" style="grid-column: 1 / -1;">
                    <label>${dictionary.targetLabel[currentLang]}</label>
                    <select id="target-variable">
                        <option value="">${dictionary.targetDefault[currentLang]}</option>
                        ${item.all_variables.map((v) => `<option value="${v}">Find ${v}</option>`).join("")}
                    </select>
                </div>
                <div id="value-inputs" class="input-grid" style="grid-column: 1 / -1; display: contents;"></div>
            `;

            const targetSelect = document.getElementById("target-variable");
            const valueInputs = document.getElementById("value-inputs");

            targetSelect.addEventListener("change", function () {
                const target = this.value;
                valueInputs.innerHTML = "";
                if (target) {
                    const variablesToInput = item.all_variables.filter((v) => v !== target);
                    variablesToInput.forEach((variable) => {
                        const labelStr = currentLang === "en" ? `Enter value of ${variable}` : `${variable} এর মান দিন`;
                        valueInputs.innerHTML += `
                            <div class="input-group">
                                <label>${labelStr}</label>
                                <input type="number" step="any" id="var-${variable}" placeholder="${variable}">
                            </div>
                        `;
                    });
                }
            });

            calcSection.classList.remove("hidden");
            calcSection.scrollIntoView({ behavior: "smooth" });
        }

        document.getElementById("close-calc").addEventListener("click", () => {
            calcSection.classList.add("hidden");
            selectedFormulaId = null;
        });

        document.getElementById("calculate-btn").addEventListener("click", async () => {
            if (!selectedFormulaId) return;
            const target = document.getElementById("target-variable").value;
            if (!target) {
                alert(currentLang === "en" ? "Please select a target!" : "অনুগ্রহ করে টার্গেট সিলেক্ট করুন!");
                return;
            }

            const item = formulas[selectedFormulaId];
            const variablesToInput = item.all_variables.filter((v) => v !== target);

            let variablesData = {};
            let isValid = true;
            variablesToInput.forEach((variable) => {
                const val = document.getElementById(`var-${variable}`).value;
                if (val === "") isValid = false;
                variablesData[variable] = parseFloat(val);
            });

            if (!isValid) {
                alert(currentLang === "en" ? "Fill all fields!" : "সব ঘর পূরণ করুন!");
                return;
            }

            resultDisplay.innerText = currentLang === "en" ? "Calculating..." : "হিসাব হচ্ছে...";

            try {
                const response = await fetch(`${getApiBase()}${apiPath}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ target, variables: variablesData }),
                });
                const data = await response.json();

                if (data.success) {
                    resultDisplay.innerText = `${data.target} = ${data.result}`;
                    if (data.steps && data.steps.length > 0) {
                        console.log("ক্যালকুলেশনের ধাপসমূহ:\n" + data.steps.join("\n"));
                    }
                } else {
                    resultDisplay.innerText = currentLang === "en" ? `Error: ${data.error}` : `সমস্যা: ${data.error}`;
                }
            } catch (err) {
                console.error(err);
                resultDisplay.innerText =
                    currentLang === "en" ? "Server connection failed!" : "সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!";
            }
        });

        updateStaticTexts();
        renderGrid();
    }

    return { init };
})();
