/* ==========================================================================
   Friendly Flux — Shared Page Logic
   ========================================================================== */

const FriendlyFluxApp = (function () {

    function getApiBase() {
        if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
            return "http://127.0.0.1:5000";
        }
        return "https://friendlyflux.pythonanywhere.com";
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

        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", function () {
                const html = document.documentElement;
                if (html.getAttribute("data-theme") === "dark") {
                    html.removeAttribute("data-theme");
                    this.innerHTML = '<i class="fa-solid fa-moon"></i>';
                } else {
                    html.setAttribute("data-theme", "dark");
                    this.innerHTML = '<i class="fa-solid fa-sun"></i>';
                }
            });
        }

        const langToggle = document.getElementById("lang-toggle");
        if (langToggle) {
            langToggle.addEventListener("click", () => {
                currentLang = currentLang === "en" ? "bn" : "en";
                updateStaticTexts();
                if (searchInput) renderGrid(searchInput.value);
                if (selectedFormulaId) openCalculator(selectedFormulaId);
            });
        }

        function updateStaticTexts() {
            document.querySelectorAll("[data-lang]").forEach((el) => {
                const key = el.getAttribute("data-lang");
                if (dictionary[key]) el.innerText = dictionary[key][currentLang];
            });
            if (searchInput && dictionary.searchPlaceholder) {
                searchInput.placeholder = dictionary.searchPlaceholder[currentLang];
            }
        }

        function renderGrid(query = "") {
            if (!formulaGrid) return;
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

        if (searchInput) {
            searchInput.addEventListener("input", (e) => renderGrid(e.target.value));
        }

        function openCalculator(id) {
            selectedFormulaId = id;
            const item = formulas[id];

            if (calcTitle) calcTitle.innerText = `${item.name[currentLang]} (${item.formula})`;
            if (resultDisplay) resultDisplay.innerText = "";

            if (dynamicInputs) {
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

                if (targetSelect) {
                    targetSelect.addEventListener("change", function () {
                        const target = this.value;
                        if (valueInputs) valueInputs.innerHTML = "";
                        if (target) {
                            const variablesToInput = item.all_variables.filter((v) => v !== target);
                            variablesToInput.forEach((variable) => {
                                const labelStr = currentLang === "en" ? `Enter value of ${variable}` : `${variable} এর মান দিন`;
                                if (valueInputs) {
                                    valueInputs.innerHTML += `
                                        <div class="input-group">
                                            <label>${labelStr}</label>
                                            <input type="number" step="any" id="var-${variable}" placeholder="${variable}">
                                        </div>
                                    `;
                                }
                            });
                        }
                    });
                }
            }

            if (calcSection) {
                calcSection.classList.remove("hidden");
                calcSection.scrollIntoView({ behavior: "smooth" });
            }
        }

        const closeCalc = document.getElementById("close-calc");
        if (closeCalc) {
            closeCalc.addEventListener("click", () => {
                if (calcSection) calcSection.classList.add("hidden");
                selectedFormulaId = null;
            });
        }

        const calculateBtn = document.getElementById("calculate-btn");
        if (calculateBtn) {
            calculateBtn.addEventListener("click", async () => {
                if (!selectedFormulaId) return;
                const targetSelect = document.getElementById("target-variable");
                const target = targetSelect ? targetSelect.value : "";
                
                if (!target) {
                    alert(currentLang === "en" ? "Please select a target!" : "অনুগ্রহ করে টার্গেট সিলেক্ট করুন!");
                    return;
                }

                const item = formulas[selectedFormulaId];
                const variablesToInput = item.all_variables.filter((v) => v !== target);

                let variablesData = {};
                let isValid = true;
                variablesToInput.forEach((variable) => {
                    const inputElem = document.getElementById(`var-${variable}`);
                    const val = inputElem ? inputElem.value : "";
                    if (val === "") isValid = false;
                    variablesData[variable] = parseFloat(val);
                });

                if (!isValid) {
                    alert(currentLang === "en" ? "Fill all fields!" : "সব ঘর পূরণ করুন!");
                    return;
                }

                if (resultDisplay) {
                    resultDisplay.innerText = currentLang === "en" ? "Calculating..." : "হিসাব হচ্ছে...";
                }

                try {
                    const response = await fetch(`${getApiBase()}${apiPath}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ target, variables: variablesData }),
                    });
                    const data = await response.json();

                    if (resultDisplay) {
                        if (data.success) {
                            resultDisplay.innerText = `${data.target} = ${data.result}`;
                            if (data.steps && data.steps.length > 0) {
                                console.log("ক্যালকুলেশনের ধাপসমূহ:\n" + data.steps.join("\n"));
                            }
                        } else {
                            resultDisplay.innerText = currentLang === "en" ? `Error: ${data.error}` : `সমস্যা: ${data.error}`;
                        }
                    }
                } catch (err) {
                    console.error(err);
                    if (resultDisplay) {
                        resultDisplay.innerText =
                            currentLang === "en" ? "Server connection failed!" : "সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!";
                    }
                }
            });
        }

        updateStaticTexts();
        renderGrid();
    }

    return { init };
})();
