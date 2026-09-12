document.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'en';
    let selectedFormulaId = null;

    const formulaGrid = document.getElementById('formula-grid');
    const searchInput = document.getElementById('search-input');
    const calcSection = document.getElementById('calculator-section');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const calcTitle = document.getElementById('calc-title');
    const resultDisplay = document.getElementById('result-display');

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

        Object.values(chemistryFormulas).forEach(item => {
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
        const item = chemistryFormulas[id];
        
        calcTitle.innerText = `${item.name[currentLang]} (${item.formula})`;
        resultDisplay.innerText = "";
        
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

    document.getElementById('calculate-btn').addEventListener('click', () => {
        if (!selectedFormulaId) return;
        const target = document.getElementById('target-variable').value;
        if (!target) return alert(currentLang === 'en' ? "Please select a target!" : "অনুগ্রহ করে টার্গেট সিলেক্ট করুন!");

        let variablesData = {};
        const variablesToInput = chemistryFormulas[selectedFormulaId].all_variables.filter(v => v !== target);
        
        let isValid = true;
        variablesToInput.forEach(variable => {
            const val = document.getElementById(`var-${variable}`).value;
            if (val === "") isValid = false;
            variablesData[variable] = parseFloat(val);
        });

        if (!isValid) return alert(currentLang === 'en' ? "Fill all fields!" : "সব ঘর পূরণ করুন!");

        const requestBody = { formula: selectedFormulaId, target: target, variables: variablesData };
        const API_BASE = "https://friendlyflux.pythonanywhere.com/";

        resultDisplay.innerText = currentLang === 'en' ? "Calculating..." : "হিসাব হচ্ছে...";
        
        fetch(`${API_BASE}/api/chemistry/solve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resultDisplay.innerText = `${target} = ${data.result.toFixed(2)}`;
            } else {
                resultDisplay.innerText = `Error: ${data.error}`;
            }
        }).catch(() => {
            resultDisplay.innerText = "Server Error!";
        });
    });

    updateStaticTexts();
    renderGrid();
});
