/* ==========================================================================
   PHYSICS.JS - Main Logic File
   ========================================================================== */

function initPhysicsPage() {
    
    // ১. Basic Initialization (সব ঠিক থাকলে রান করবে)
    if (typeof FriendlyFluxApp !== 'undefined' && typeof physicsFormulas !== 'undefined' && typeof dictionary !== 'undefined') {
        try {
            FriendlyFluxApp.init({
                formulas: physicsFormulas,
                dictionary: dictionary,
                apiPath: "/api/physics/solve",
            });
        } catch (error) {
            console.error("Shared JS Error:", error);
        }
    }

    /* ==========================================================================
       SMART AI SOLVER & TAB LOGIC
       ========================================================================== */

    const tabBasic = document.getElementById("tab-basic");
    const tabSmart = document.getElementById("tab-smart");
    const basicContainer = document.getElementById("basic-mode-container");
    const smartContainer = document.getElementById("smart-mode-container");
    const oldCalcSection = document.getElementById("calculator-section"); 

    // ২. ট্যাব সুইচিং লজিক (ক্লাসভিত্তিক ও নিখুঁত সমাধান)
    if (tabBasic && tabSmart && basicContainer && smartContainer) {
        
        // শুরুতে ডিফল্ট অবস্থা সেট করা হচ্ছে
        basicContainer.classList.remove("hidden");
        smartContainer.classList.add("hidden");

        tabBasic.addEventListener("click", () => {
            tabBasic.classList.add("active");
            tabSmart.classList.remove("active");
            
            // ক্লাস টগল করার মাধ্যমে কন্টেইনার সচল করা হলো
            basicContainer.classList.remove("hidden");
            smartContainer.classList.add("hidden");
            
            // ক্যালকুলেটর সেকশনের ইনলাইন স্টাইল রিসেট করা যাতে ক্লিকের সমস্যা না হয়
            if(oldCalcSection) {
                oldCalcSection.style.display = ""; 
            }
        });

        tabSmart.addEventListener("click", () => {
            tabSmart.classList.add("active");
            tabBasic.classList.remove("active");
            
            smartContainer.classList.remove("hidden");
            basicContainer.classList.add("hidden");
            
            if(oldCalcSection) {
                oldCalcSection.classList.add("hidden");
                oldCalcSection.style.display = "none";
            }
        });
    }


    // ৩. নতুন ইনপুট ফিল্ড (জানা মান) যোগ করার লজিক
    const smartKnownContainer = document.getElementById("smart-known-values");
    const btnAddVar = document.getElementById("btn-add-var");

    function addSmartInputRow() {
        if (!smartKnownContainer) return;
        
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "10px";
        row.style.marginTop = "10px";

        row.innerHTML = `
            <input type="text" class="smart-var-name custom-input" placeholder="Variable (e.g. u)" style="flex: 1;">
            <input type="number" step="any" class="smart-var-val custom-input" placeholder="Value" style="flex: 2;">
            <button class="remove-var" style="background: transparent; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0 10px;">✖</button>
        `;

        row.querySelector(".remove-var").addEventListener("click", () => row.remove());
        smartKnownContainer.appendChild(row);
    }

    if (btnAddVar && smartKnownContainer) {
        addSmartInputRow();
        addSmartInputRow();
        btnAddVar.addEventListener("click", addSmartInputRow);
    }


        /* ==========================================================================
       VARIABLE INFO & CUSTOM SELECT POPUP LOGIC (Fully Auto-Dynamic + Search)
       ========================================================================== */
    const targetTrigger = document.getElementById("smart-target-trigger");
    const targetText = document.getElementById("smart-target-text");
    const targetHiddenInput = document.getElementById("smart-target");
    
    const customModal = document.getElementById("custom-select-modal");
    const modalCloseBtn = document.getElementById("close-select-modal");
    const modalOptionsList = document.getElementById("custom-modal-options");
    const modalSearchInput = document.getElementById("modal-search-input"); // সার্চ বার

    // তোমার তৈরি করা বাইলিঙ্গুয়াল ইনফো ফাংশন
    function showVariableInfo(symbol) {
        const infoModal = document.getElementById("variable-info-modal");
        const infoTitle = document.getElementById("variable-info-title");
        const infoBody = document.getElementById("variable-info-body");
        if (!infoModal) return;

        const tabBasic = document.getElementById("tab-basic");
        const isEnglish = tabBasic && tabBasic.innerText.includes("Basic"); 
        const langKey = isEnglish ? "en" : "bn";

        const matches = Object.values(physicsFormulas).filter(f => f.all_variables.includes(symbol));
        const usedSymbols = [...new Set(matches.flatMap(f => f.all_variables))];

        infoTitle.innerText = isEnglish ? `Ways to find "${symbol}"` : `"${symbol}" বের করার উপায়গুলো`;
        infoBody.innerHTML =
            matches.map(f => `<p style="margin-bottom:10px;"><b>${f.name[langKey]}</b><br>${f.formula}</p>`).join("") +
            `<hr style="margin:15px 0; border-color: var(--border);">` +
            usedSymbols.map(s => {
                const varName = variableGlossary[s] ? variableGlossary[s][langKey] : "?";
                return `<p>${s} = ${varName}</p>`;
            }).join("");
            
        const infoOkBtn = document.getElementById("variable-info-ok");
        const infoChangeBtn = document.getElementById("variable-info-change");
        
        if (infoOkBtn) infoOkBtn.innerText = isEnglish ? "OK" : "ঠিক আছে";
        if (infoChangeBtn) infoChangeBtn.innerText = isEnglish ? "Target Change" : "টার্গেট পরিবর্তন";

        infoModal.classList.remove("hidden");
    }

    // অটো-ম্যাজিক: সমস্ত ফর্মুলা ঘেঁটে নিজে থেকে ডেটা তৈরি করার ফাংশন
    function getDynamicOptions() {
        if (typeof physicsFormulas === 'undefined') return [];
        
        const uniqueVars = [...new Set(Object.values(physicsFormulas).flatMap(f => f.all_variables))];
        
        return uniqueVars.map(v => {
            const enName = (typeof variableGlossary !== 'undefined' && variableGlossary[v]) ? variableGlossary[v].en : "";
            const bnName = (typeof variableGlossary !== 'undefined' && variableGlossary[v]) ? variableGlossary[v].bn : "";
            return {
                value: v,
                en: enName ? `${v} (${enName})` : v,
                bn: bnName ? `${v} (${bnName})` : v
            };
        }).sort((a, b) => a.value.localeCompare(b.value)); 
    }

    // রেন্ডার ও ফিল্টার করার ফাংশন
    function renderModalOptions(searchQuery = "") {
        if(!modalOptionsList) return;
        
        const tabBasic = document.getElementById("tab-basic");
        const isEnglish = tabBasic && tabBasic.innerText.includes("Basic");
        const langKey = isEnglish ? "en" : "bn";
        
        modalOptionsList.innerHTML = ""; 
        const currentValue = targetHiddenInput.value;
        const query = searchQuery.toLowerCase().trim();

        const options = getDynamicOptions(); 

        options.forEach(opt => {
            const labelText = opt[langKey];
            
            // সার্চ ফিল্টারিং
            if (query && !labelText.toLowerCase().includes(query) && !opt.value.toLowerCase().includes(query)) {
                return; 
            }

            const li = document.createElement("li");
            li.dataset.value = opt.value;
            if(currentValue === opt.value) li.classList.add("selected");

            li.innerHTML = `
                <span>${labelText}</span>
                <i class="fa-solid fa-check check-icon"></i>
            `;

            li.addEventListener("click", function() {
                document.querySelectorAll(".custom-option-list li").forEach(el => el.classList.remove("selected"));
                this.classList.add("selected");
                
                targetHiddenInput.value = opt.value;
                targetText.removeAttribute("data-lang"); 
                targetText.innerText = labelText;
                
                showVariableInfo(opt.value);
                
                setTimeout(() => { closeSelectModal(); }, 250); 
            });

            modalOptionsList.appendChild(li);
        });
    }

    function openSelectModal() {
        if(!customModal) return;
        
        const tabBasic = document.getElementById("tab-basic");
        const isEnglish = tabBasic && tabBasic.innerText.includes("Basic");
        
        const customModalTitle = document.getElementById("custom-modal-title");
        if (customModalTitle) {
            customModalTitle.innerText = isEnglish ? "Select Target Variable" : "টার্গেট ভ্যারিয়েবল নির্বাচন করুন";
        }
        
        if(modalSearchInput) {
            modalSearchInput.value = ""; 
            modalSearchInput.placeholder = isEnglish ? "Search target..." : "খুঁজুন...";
        }

        renderModalOptions(); 
        customModal.classList.remove("hidden");
        
        if(modalSearchInput) setTimeout(() => modalSearchInput.focus(), 100);
    }

    function closeSelectModal() {
        if(customModal) customModal.classList.add("hidden");
    }

    // --- EVENT LISTENERS ---
    const infoOkBtn = document.getElementById("variable-info-ok");
    const infoChangeBtn = document.getElementById("variable-info-change");
    
    if (infoOkBtn) infoOkBtn.addEventListener("click", () => document.getElementById("variable-info-modal").classList.add("hidden"));
    if (infoChangeBtn) infoChangeBtn.addEventListener("click", () => {
        document.getElementById("variable-info-modal").classList.add("hidden");
        openSelectModal();
    });

    if(targetTrigger) {
        targetTrigger.addEventListener("click", () => {
            if (targetHiddenInput.value) {
                showVariableInfo(targetHiddenInput.value);
            } else {
                openSelectModal();
            }
        });
    }
    
    if(modalCloseBtn) modalCloseBtn.addEventListener("click", closeSelectModal);
    
    if(customModal) {
        customModal.addEventListener("click", (e) => {
            if(e.target === customModal) closeSelectModal();
        });
    }

    if(modalSearchInput) {
        modalSearchInput.addEventListener("input", (e) => {
            renderModalOptions(e.target.value);
        });
    }

    // ভাষা পরিবর্তন হলে টার্গেট ট্রান্সলেট হবে
    const langToggleBtnMain = document.getElementById("lang-toggle");
    if (langToggleBtnMain) {
        langToggleBtnMain.addEventListener("click", () => {
            setTimeout(() => {
                const tabBasic = document.getElementById("tab-basic");
                const isEnglish = tabBasic && tabBasic.innerText.includes("Basic");
                const langKey = isEnglish ? "en" : "bn";

                const currentVal = targetHiddenInput.value;
                if (currentVal) {
                    const options = getDynamicOptions();
                    const selectedOpt = options.find(opt => opt.value === currentVal);
                    if (selectedOpt) {
                        targetText.innerText = selectedOpt[langKey];
                    }
                }
            }, 100); 
        });
    }



    // ৪. ব্যাকএন্ডে API রিকোয়েস্ট পাঠানো 
    const btnSolveSmart = document.getElementById("btn-solve-smart");
    const resultDisplay = document.getElementById("smart-result-display");

    if (btnSolveSmart) {
        btnSolveSmart.addEventListener("click", async () => {
            const targetElement = document.getElementById("smart-target");
            const target = targetElement ? targetElement.value : "";
            const isEnglish = document.documentElement.getAttribute("lang") !== "bn"; 

            if (!target) {
                if (resultDisplay) {
                    resultDisplay.innerHTML = `<span style="color: #ef4444;">${isEnglish ? "Please select what you want to find!" : "অনুগ্রহ করে টার্গেট সিলেক্ট করুন!"}</span>`;
                }
                return;
            }

            const names = document.querySelectorAll(".smart-var-name");
            const vals = document.querySelectorAll(".smart-var-val");
            let knownValues = {};

            for (let i = 0; i < names.length; i++) {
                const name = names[i].value.trim();
                const val = vals[i].value;
                if (name && val !== "") {
                    knownValues[name] = parseFloat(val);
                }
            }

            if (Object.keys(knownValues).length === 0) {
                if (resultDisplay) {
                    resultDisplay.innerHTML = `<span style="color: #ef4444;">${isEnglish ? "Provide at least one known value!" : "অন্তত একটি জানা মান দিন!"}</span>`;
                }
                return;
            }

            if(resultDisplay) resultDisplay.innerHTML = isEnglish ? "<i>Calculating path...</i>" : "<i>ধাপ নির্ণয় করা হচ্ছে...</i>";

            // ১. ফাংশনটি এখানে যোগ করুন (যদি আগে না থাকে)
            function getApiBase() {
                if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
                    return "http://127.0.0.1:5000";
                }
                return "https://friendlyflux.pythonanywhere.com";
            }

            try {
                // ২. ১২৩ নম্বর লাইনের ফেচ (fetch) রিকোয়েস্টটিকে এভাবে আপডেট করুন
                const response = await fetch(`${getApiBase()}/api/physics/solve`, { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ target: target, variables: knownValues }) 
                });
                
                const data = await response.json();

                if(resultDisplay) {
                    if(data.success) {
                        let stepsHtml = data.steps && data.steps.length > 0 
                            ? `<div style="font-size: 0.9em; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px; text-align: left;">
                                 <b style="color: var(--primary);">Calculation Steps:</b><br>
                                 ${data.steps.join("<br>")}
                               </div>` 
                            : "";
                            
                        resultDisplay.innerHTML = `<span style="color: var(--primary); font-size: 1.3em;">${data.target} = ${data.result}</span> ${stepsHtml}`;
                    } else {
                        resultDisplay.innerHTML = `<span style="color: #ff6b6b;">Error: ${data.error}</span>`;
                    }
                }
            } catch (error) {
                console.error(error);
                if(resultDisplay) resultDisplay.innerHTML = `<span style="color: #ff6b6b;">Server connection failed!</span>`;
            }
        });
    }
}

// মোবাইল ব্রাউজার বা এডিটরে DOMContentLoaded ইভেন্ট মিস হওয়া আটকাতে এই চেকটি করা হলো
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPhysicsPage);
} else {
    initPhysicsPage();
}
