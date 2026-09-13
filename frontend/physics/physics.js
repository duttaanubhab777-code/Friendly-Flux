document.addEventListener('DOMContentLoaded', () => {
  // --- API_BASE ডায়নামিক সেটআপ শুরু ---
    let API_BASE = "";
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        API_BASE = "http://127.0.0.1:5000"; // লোকালহোস্ট বা Acode-এর জন্য
    } else {
        // GitHub-এ চললে PythonAnywhere-এর লিংক ব্যবহার করবে
        API_BASE = "https://friendlyflux.pythonanywhere.com/"; 
    }
    // --- API_BASE ডায়নামিক সেটআপ শেষ ---

    let currentLang = 'en';
    let selectedFormulaId = null;

    

    const formulaGrid = document.getElementById('formula-grid');
    const searchInput = document.getElementById('search-input');
    const calcSection = document.getElementById('calculator-section');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const calcTitle = document.getElementById('calc-title');
    const resultDisplay = document.getElementById('result-display');

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', function() {
        const body = document.documentElement;
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            this.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            this.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    // Language Toggle
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'bn' : 'en';
        updateStaticTexts();
        renderGrid(searchInput.value);
        if (selectedFormulaId) openCalculator(selectedFormulaId);
    });

    function updateStaticTexts() {
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (dictionary[key]) el.innerText = dictionary[key][currentLang];
        });
        searchInput.placeholder = dictionary.searchPlaceholder[currentLang];
    }

    function renderGrid(query = "") {
        formulaGrid.innerHTML = "";
        const lowerQuery = query.toLowerCase();

        Object.values(physicsFormulas).forEach(item => {
            const matchName = item.name.en.toLowerCase().includes(lowerQuery) || item.name.bn.includes(query);
            const matchTag = item.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            
            if (matchName || matchTag) {
                const card = document.createElement('div');
                card.className = 'formula-card';
                card.innerHTML = `<h3>${item.name[currentLang]}</h3><p>${item.formula}</p>`;
                card.addEventListener('click', () => openCalculator(item.id));
                formulaGrid.appendChild(card);
            }
        });
    }

    searchInput.addEventListener('input', (e) => renderGrid(e.target.value));

    function openCalculator(id) {
        selectedFormulaId = id;
        const item = physicsFormulas[id];
        
        calcTitle.innerText = `${item.name[currentLang]} (${item.formula})`;
        resultDisplay.innerText = "";
        
        // টার্গেট সিলেক্ট করার ড্রপডাউন
        dynamicInputs.innerHTML = `
            <div class="input-group" style="grid-column: 1 / -1;">
                <label>${dictionary.targetLabel[currentLang]}</label>
                <select id="target-variable">
                    <option value="">${dictionary.targetDefault[currentLang]}</option>
                    ${item.all_variables.map(v => `<option value="${v}">Find ${v}</option>`).join('')}
                </select>
            </div>
            <div id="value-inputs" class="input-grid" style="grid-column: 1 / -1; display: contents;"></div>
        `;

        const targetSelect = document.getElementById('target-variable');
        const valueInputs = document.getElementById('value-inputs');

        targetSelect.addEventListener('change', function() {
            const target = this.value;
            valueInputs.innerHTML = "";
            if(target) {
                const variablesToInput = item.all_variables.filter(v => v !== target);
                variablesToInput.forEach(variable => {
                    const labelStr = currentLang === 'en' ? `Enter value of ${variable}` : `${variable} এর মান দিন`;
                    valueInputs.innerHTML += `
                        <div class="input-group">
                            <label>${labelStr}</label>
                            <input type="number" id="var-${variable}" placeholder="${variable}">
                        </div>
                    `;
                });
            }
        });

        calcSection.classList.remove('hidden');
        calcSection.scrollIntoView({ behavior: 'smooth' });
    }

    document.getElementById('close-calc').addEventListener('click', () => {
        calcSection.classList.add('hidden');
        selectedFormulaId = null;
    });

    document.getElementById('calculate-btn').addEventListener('click', async () => {
    if (!selectedFormulaId) return;
    const target = document.getElementById('target-variable').value;
    
    if (!target) return alert(currentLang === 'en' ? "Please select a target!" : "অনুগ্রহ করে টার্গেট সিলেক্ট করুন!");
    
    let variablesData = {};
    const variablesToInput = physicsFormulas[selectedFormulaId].all_variables.filter(v => v !== target);
    
    let isValid = true;
    
    variablesToInput.forEach(variable => {
        const val = document.getElementById(`var-${variable}`).value;
        if (val === "") isValid = false;
        variablesData[variable] = parseFloat(val);
    });
    
    if (!isValid) return alert(currentLang === 'en' ? "Fill all fields!" : "সব ঘর পূরণ করুন!");
    
    // --- এখান থেকে নতুন সার্ভারে কল করার লজিক শুরু ---
    const requestBody = {
        target: target,
        variables: variablesData
    };

    try {
        // সার্ভারে রিকোয়েস্ট পাঠানো (await দিয়ে অপেক্ষা করা)
        const response = await fetch(`${API_BASE}/api/physics/solve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // রেজাল্ট দেখানোর লজিক
        if (data.success) {
            // মূল উত্তর তৈরি করা
            const resultText = currentLang === 'en' 
                ? `${data.target} = ${data.result}` 
                : `${data.target} = ${data.result}`;

            // তোমার HTML-এ যেখানে রেজাল্ট দেখাও, তার ID যদি 'result' হয়:
            document.getElementById('result-display').innerText = resultText;

            // ধাপে ধাপে অংকটা কীভাবে হলো সেটা কনসোলে দেখানো
            if (data.steps && data.steps.length > 0) {
                console.log("ক্যালকুলেশনের ধাপসমূহ:\n" + data.steps.join("\n"));
            }

        } else {
            // পাইথন অংকটা মেলাতে না পারলে
            alert(currentLang === 'en' ? `Error: ${data.error}` : `সমস্যা: ${data.error}`);
        }

    } catch (error) {
        // নেটওয়ার্ক সমস্যা বা সার্ভার অফ থাকলে
        console.error(error);
        alert(currentLang === 'en' ? "Server connection failed!" : "সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!");
    }
});

    

    updateStaticTexts();
    renderGrid();
});
