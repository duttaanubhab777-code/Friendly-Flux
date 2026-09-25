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

        // কাস্টম পপআপের বেসিক ইভেন্ট লিসেনার (সবার জন্য)
        const customModal = document.getElementById("custom-select-modal");
        const modalCloseBtn = document.getElementById("close-select-modal");
        const modalBox = document.querySelector('.modal-box'); // মডেল বক্সটি সিলেক্ট করা হলো
        
        function closeGenericModal() {
            if(customModal) customModal.classList.add("hidden");
        }

        if(modalCloseBtn) modalCloseBtn.addEventListener("click", closeGenericModal);
        if(customModal) customModal.addEventListener("click", (e) => {
            if (e.target === customModal) closeGenericModal();
        });

        const themeLightBtn = document.getElementById("theme-light-btn");
        const themeDarkBtn = document.getElementById("theme-dark-btn");

        function setTheme(mode) {
            const html = document.documentElement;
            localStorage.setItem("flux-theme", mode);
            if (mode === "dark") {
                html.setAttribute("data-theme", "dark");
                themeDarkBtn.classList.add("active");
                themeLightBtn.classList.remove("active");
            } else {
                html.removeAttribute("data-theme");
                themeLightBtn.classList.add("active");
                themeDarkBtn.classList.remove("active");
            }
        }
        setTheme(localStorage.getItem("flux-theme") || "dark");

        if (themeLightBtn && themeDarkBtn) {
            themeLightBtn.addEventListener("click", () => setTheme("light"));
            themeDarkBtn.addEventListener("click", () => setTheme("dark"));
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
            if (resultDisplay) resultDisplay.innerHTML = "";

            if (dynamicInputs) {
                // সাধারণ <select> সরিয়ে এখানে কাস্টম ট্রিগার বাটন দেওয়া হলো
                dynamicInputs.innerHTML = `
                    <div class="input-group" style="grid-column: 1 / -1; margin-bottom: 15px;">
                        <label>${dictionary.targetLabel[currentLang]}</label>
                        <input type="hidden" id="target-variable" value="">
                        <button type="button" id="basic-target-trigger" class="custom-input custom-select-trigger">
                            <span id="basic-target-text">${dictionary.targetDefault[currentLang]}</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>
                    <div id="value-inputs" class="input-grid" style="grid-column: 1 / -1; display: contents;"></div>
                `;

                const targetHiddenInput = document.getElementById("target-variable");
                const targetText = document.getElementById("basic-target-text");
                const targetTrigger = document.getElementById("basic-target-trigger");
                const valueInputs = document.getElementById("value-inputs");
                const modalOptionsList = document.getElementById("custom-modal-options");

                if (targetTrigger && customModal && modalOptionsList) {
                    targetTrigger.addEventListener("click", function() {
                        modalOptionsList.innerHTML = ""; 
                        const currentValue = targetHiddenInput.value;

                        // সিলেক্ট বক্সের পজিশন অনুযায়ী মডাল বক্স প্লেস করা হচ্ছে
                        if (modalBox) {
                            const rect = this.getBoundingClientRect();
                            
                            // CSS-এর ডিজাইনের উপর নির্ভর না করে সরাসরি JavaScript থেকে Fixed করা হলো
                            modalBox.style.position = 'fixed'; 
                            modalBox.style.margin = '0';
                            modalBox.style.left = rect.left + 'px';
                            modalBox.style.width = rect.width + 'px';
                            
                            // মোবাইল বা ছোট স্ক্রিনের নিচে পর্যাপ্ত জায়গা আছে কিনা চেক করা
                            const spaceBelow = window.innerHeight - rect.bottom;
                            
                            if (spaceBelow < 260 && rect.top > 260) {
                                // নিচে জায়গা না থাকলে ড্রপডাউনটি বোতামের উপরের দিকে খুলবে
                                modalBox.style.top = 'auto';
                                modalBox.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
                            } else {
                                // নিচে জায়গা থাকলে স্বাভাবিকভাবে বোতামের নিচেই খুলবে
                                modalBox.style.bottom = 'auto';
                                modalBox.style.top = (rect.bottom + 8) + 'px';
                            }
                        }

                        item.all_variables.forEach((variable) => {
                            const li = document.createElement("li");
                            const labelText = currentLang === "en" ? `Find ${variable}` : `${variable} বের করুন`;
                            
                            if (currentValue === variable) {
                                li.classList.add("selected");
                            }
                            
                            li.innerHTML = `
                                <span>${labelText}</span>
                                <i class="fa-solid fa-check check-icon"></i>
                            `;
                            
                            // অপশনে ক্লিক করলে যা হবে
                            li.addEventListener("click", function(e) {
                                e.stopPropagation(); // মডাল বন্ধ হওয়া ঠেকানো
                                document.querySelectorAll("#custom-modal-options li").forEach(el => el.classList.remove("selected"));
                                this.classList.add("selected");
                                
                                targetHiddenInput.value = variable;
                                targetText.innerText = labelText;
                                
                                // বাকি ইনপুটগুলো জেনারেট করা
                                valueInputs.innerHTML = "";
                                const variablesToInput = item.all_variables.filter((v) => v !== variable);
                                variablesToInput.forEach((vInput) => {
                                    const inputLabelStr = currentLang === "en" ? `Enter value of ${vInput}` : `${vInput} এর মান দিন`;
                                    valueInputs.innerHTML += `
                                        <div class="input-group">
                                            <label>${inputLabelStr}</label>
                                            <!-- এখানে type="number" পরিবর্তন করে type="text" করা হলো যাতে x, a, বা নেগেটিভ মান দেওয়া যায় -->
                                            <input type="text" id="var-${vInput}" placeholder="${vInput}" class="custom-input">
                                        </div>
                                    `;
                                });

                                setTimeout(closeGenericModal, 150);
                            });
                            
                            modalOptionsList.appendChild(li);
                        });
                        
                        customModal.classList.remove("hidden");
                    });
                }
            }

            if (calcSection) {
                calcSection.classList.remove("hidden");
                calcSection.style.display = ""; // ট্যাব সুইচিং লেআউট বাগ প্রতিরোধ
                calcSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
                const targetHiddenInput = document.getElementById("target-variable");
                const target = targetHiddenInput ? targetHiddenInput.value : "";
                
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
                    const val = inputElem ? inputElem.value.trim() : "";
                    if (val === "") isValid = false;
                    
                    // নম্বর হলে নম্বর হিসেবে, আর ভেরিয়েবল (x, a) বা এক্সপ্রেশন হলে স্ট্রিং হিসেবে সেভ হবে
                    const parsedNum = Number(val);
                    variablesData[variable] = isNaN(parsedNum) ? val : parsedNum;
                });

                if (!isValid) {
                    alert(currentLang === "en" ? "Fill all fields!" : "সব ঘর পূরণ করুন!");
                    return;
                }

                if (resultDisplay) {
                    resultDisplay.innerHTML = currentLang === "en" ? "<i>Calculating...</i>" : "<i>হিসাব হচ্ছে...</i>";
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
                            // রেজাল্ট ডিজাইন স্মার্ট সলভারের মতো প্রিমিয়াম করা হলো
                            let stepsHtml = data.steps && data.steps.length > 0 
                                ? `<div style="font-size: 0.9em; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px; text-align: left; color: var(--text-main);">
                                     <b style="color: var(--primary);">Calculation Steps:</b><br>
                                     ${data.steps.join("<br>")}
                                   </div>` 
                                : "";
                            resultDisplay.innerHTML = `<span style="color: var(--primary); font-size: 1.3em;">${data.target} = ${data.result}</span> ${stepsHtml}`;
                        } else {
                            resultDisplay.innerHTML = `<span style="color: #ff6b6b;">${currentLang === "en" ? 'Error:' : 'সমস্যা:'} ${data.error}</span>`;
                        }
                    }
                } catch (err) {
                    console.error(err);
                    if (resultDisplay) {
                        resultDisplay.innerHTML = `<span style="color: #ff6b6b;">${currentLang === "en" ? 'Server connection failed!' : 'সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!'}</span>`;
                    }
                }
            });
        }

        updateStaticTexts();
        renderGrid();
    }

    return { init };
})();
