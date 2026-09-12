document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Dictionary & Config
    const dictionary = {
        title: { en: "ChemLab", bn: "কেমিস্ট্রি ল্যাব" },
        heroTitle: { en: "Explore the Chemical World", bn: "রসায়নের দুনিয়ায় স্বাগতম" },
        heroSub: { en: "Search and calculate complex chemistry formulas instantly.", bn: "যেকোনো রাসায়নিক সূত্র খুঁজুন এবং নিমেষে হিসাব করুন।" },
        searchPlaceholder: { en: "Search formulas (e.g., Moles, চাপ)...", bn: "সূত্র খুঁজুন (যেমন: মোল, Pressure)..." },
        availableFormulas: { en: "Available Formulas", bn: "সকল সূত্র" },
        calcBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" },
        scientistTitle: { en: "Legendary Chemists", bn: "মহান রসায়নবিদগণ" },
        curieBio: { en: "Pioneered research on radioactivity and discovered the elements polonium and radium.", bn: "তেজস্ক্রিয়তা নিয়ে যুগান্তকারী গবেষণা করেন এবং পোলোনিয়াম ও রেডিয়াম আবিষ্কার করেন।" },
        mendeleevBio: { en: "Created the Periodic Table of Elements, predicting the properties of elements yet to be discovered.", bn: "পর্যায় সারণী (Periodic Table) তৈরি করেন এবং অজানা মৌলের ধর্ম সম্পর্কে ভবিষ্যদ্বাণী করেন।" }
    };

    // Formulas Data (Matches app.py logic for CHEMISTRY)[span_1](start_span)[span_1](end_span)
    const formulas = {
        "moles": {
            id: "moles", variables: ["mass", "molar_mass"],
            name: { en: "Moles", bn: "মোল সংখ্যা" },
            formula: "n = mass / M",
            tags: ["moles", "mass", "molar", "মোল", "ভর"]
        },
        "molarity": {
            id: "molarity", variables: ["moles", "volume_liters"],
            name: { en: "Molarity", bn: "মোলারিটি" },
            formula: "M = moles / V",
            tags: ["molarity", "volume", "concentration", "মোলারিটি", "আয়তন"]
        },
        "ideal_gas_pressure": {
            id: "ideal_gas_pressure", variables: ["n", "T", "V"],
            name: { en: "Ideal Gas Pressure", bn: "আদর্শ গ্যাস চাপ" },
            formula: "P = nRT / V",
            tags: ["pressure", "gas", "ideal", "চাপ", "গ্যাস"]
        }
    };

    let currentLang = 'en';
    let selectedFormulaId = null;

    // Elements
    const formulaGrid = document.getElementById('formula-grid');
    const searchInput = document.getElementById('search-input');
    const calcSection = document.getElementById('calculator-section');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const calcTitle = document.getElementById('calc-title');
    const resultDisplay = document.getElementById('result-display');
    const themeBtn = document.getElementById('theme-toggle');

    // 2. Theme Toggle
    themeBtn.addEventListener('click', () => {
        const body = document.documentElement;
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    // 3. Language Toggle
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
        const searchInputEl = document.getElementById('search-input');
        searchInputEl.placeholder = dictionary[searchInputEl.getAttribute('data-placeholder')][currentLang];
    }

    // 4. Render Grid & Search
    function renderGrid(query = "") {
        formulaGrid.innerHTML = "";
        const lowerQuery = query.toLowerCase();

        Object.values(formulas).forEach(item => {
            const matchName = item.name.en.toLowerCase().includes(lowerQuery) || item.name.bn.includes(query);
            const matchTag = item.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            
            if (matchName || matchTag) {
                const card = document.createElement('div');
                card.className = 'formula-card';
                card.innerHTML = `
                    <h3>${item.name[currentLang]}</h3>
                    <p>${item.formula}</p>
                `;
                card.addEventListener('click', () => openCalculator(item.id));
                formulaGrid.appendChild(card);
            }
        });
    }

    searchInput.addEventListener('input', (e) => renderGrid(e.target.value));

    // 5. Dynamic Calculator Interaction
    function openCalculator(id) {
        selectedFormulaId = id;
        const item = formulas[id];
        
        calcTitle.innerText = `${item.name[currentLang]} (${item.formula})`;
        dynamicInputs.innerHTML = "";
        resultDisplay.innerText = "";

        item.variables.forEach(variable => {
            // বাংলা-ইংরেজিতে লেবেল সুন্দর করার জন্য 
            let labelStr = "";
            if(currentLang === 'en') {
                labelStr = `Value of ${variable.replace('_', ' ')}`;
            } else {
                labelStr = `${variable.replace('_', ' ')} এর মান`;
            }
            
            dynamicInputs.innerHTML += `
                <div class="input-group">
                    <label>${labelStr}</label>
                    <input type="number" id="var-${variable}" placeholder="${labelStr}">
                </div>
            `;
        });

        calcSection.classList.remove('hidden');
        calcSection.scrollIntoView({ behavior: 'smooth' });
    }

    document.getElementById('close-calc').addEventListener('click', () => {
        calcSection.classList.add('hidden');
        selectedFormulaId = null;
    });

    // 6. Calculate & Fetch Backend
    document.getElementById('calculate-btn').addEventListener('click', () => {
        if (!selectedFormulaId) return;
        
        let variablesData = {};
        let isValid = true;

        formulas[selectedFormulaId].variables.forEach(variable => {
            const val = document.getElementById(`var-${variable}`).value;
            if (val === "") isValid = false;
            variablesData[variable] = parseFloat(val);
        });

        if (!isValid) {
            resultDisplay.innerText = currentLang === 'en' ? "Please fill all fields!" : "সবগুলো ঘর পূরণ করুন!";
            return;
        }

        const requestBody = { formula: selectedFormulaId, variables: variablesData };
        const API_BASE = "https://friendlyflux.pythonanywhere.com"; 

        resultDisplay.innerText = currentLang === 'en' ? "Calculating..." : "হিসাব হচ্ছে...";
        
        // Chemistry API-তে রিকোয়েস্ট পাঠানো[span_2](start_span)[span_2](end_span)
        fetch(`${API_BASE}/api/chemistry/solve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const prefix = currentLang === 'en' ? "Result:" : "ফলাফল:";
                resultDisplay.innerText = `${prefix} ${data.result.toFixed(2)}`;
            } else {
                resultDisplay.innerText = `Error: ${data.error}`;
            }
        })
        .catch(error => {
            resultDisplay.innerText = currentLang === 'en' ? "Server Error!" : "সার্ভারের সমস্যা!";
        });
    });

    // Initialize
    updateStaticTexts();
    renderGrid();
});
