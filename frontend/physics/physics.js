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

        // ২. ট্যাব সুইচিং লজিক (ക്লাসভিত্তিক ও নিখুঁত সমাধান)
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
                            ? `<div style="font-size: 0.9em; margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 8px; color: #4b5563; text-align: left;">
                                 <b style="color: #3b82f6;">Calculation Steps:</b><br>
                                 ${data.steps.join("<br>")}
                               </div>` 
                            : "";
                            
                        resultDisplay.innerHTML = `<span style="color: #2563eb; font-size: 1.3em;">${data.target} = ${data.result}</span> ${stepsHtml}`;
                    } else {
                        resultDisplay.innerHTML = `<span style="color: #ef4444;">Error: ${data.error}</span>`;
                    }
                }
            } catch (error) {
                console.error(error);
                if(resultDisplay) resultDisplay.innerHTML = `<span style="color: #ef4444;">Server connection failed!</span>`;
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
