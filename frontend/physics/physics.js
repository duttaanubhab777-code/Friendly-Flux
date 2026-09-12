document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Dictionary & Config
    const dictionary = {
        title: { en: "PhysicsLab", bn: "ফিজিক্স ল্যাব" },
        heroTitle: { en: "Explore the Laws of Universe", bn: "মহাবিশ্বের নিয়মগুলো জানুন" },
        heroSub: { en: "Search and calculate complex physics formulas instantly.", bn: "যেকোনো কঠিন সূত্র খুঁজুন এবং নিমেষে হিসাব করুন।" },
        searchPlaceholder: { en: "Search formulas (e.g., Force, বেগ)...", bn: "সূত্র খুঁজুন (যেমন: বল, Force)..." },
        availableFormulas: { en: "Available Formulas", bn: "সকল সূত্র" },
        calcBtn: { en: "Calculate Result", bn: "ফলাফল নির্ণয় করুন" },
        scientistTitle: { en: "Legendary Physicists", bn: "মহান পদার্থবিজ্ঞানীরা" },
        newtonBio: { en: "Formulated the laws of motion and universal gravitation.", bn: "গতির তিনটি সূত্র এবং মহাকর্ষীয় সূত্র আবিষ্কার করেন।" },
        ohmBio: { en: "Discovered the relationship between current, voltage, and resistance.", bn: "বিদ্যুৎ প্রবাহ, ভোল্টেজ এবং রোধের মধ্যকার সম্পর্ক আবিষ্কার করেন।" }
    };

    // Formulas Data (Matches app.py logic)[span_1](start_span)[span_1](end_span)
    const formulas = {
        "newtons_second_law": {
            id: "newtons_second_law", variables: ["m", "a"],
            name: { en: "Newton's Second Law", bn: "নিউটনের দ্বিতীয় সূত্র" },
            formula: "F = ma",
            tags: ["newton", "force", "mass", "acceleration", "বল", "ভর", "ত্বরণ"]
        },
        "kinetic_energy": {
            id: "kinetic_energy", variables: ["m", "v"],
            name: { en: "Kinetic Energy", bn: "গতিশক্তি" },
            formula: "KE = ½mv²",
            tags: ["energy", "kinetic", "velocity", "শক্তি", "গতি", "বেগ"]
        },
        "ohms_law": {
            id: "ohms_law", variables: ["I", "R"],
            name: { en: "Ohm's Law", bn: "ওমের সূত্র" },
            formula: "V = IR",
            tags: ["ohm", "voltage", "current", "resistance", "ভোল্টেজ", "বিদ্যুৎ", "রোধ"]
        },
        "final_velocity": {
            id: "final_velocity", variables: ["u", "a", "t"],
            name: { en: "Final Velocity", bn: "চূড়ান্ত বেগ" },
            formula: "v = u + at",
            tags: ["velocity", "time", "motion", "বেগ", "সময়", "গতি"]
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
            const labelStr = currentLang === 'en' ? `Value of ${variable}` : `${variable} এর মান`;
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

    // 6. Calculate & Fetch Backend[span_2](start_span)[span_2](end_span)
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

        const requestBody = { formula: selectedFormulaId, variables: variablesData }; // Matches app.py JSON struct[span_3](start_span)[span_3](end_span)
        const API_BASE = "https://friendlyflux.pythonanywhere.com";

        resultDisplay.innerText = currentLang === 'en' ? "Calculating..." : "হিসাব হচ্ছে...";
        
        fetch(`${API_BASE}/api/physics/solve`, { // Using PythonAnywhere endpoint[span_4](start_span)[span_4](end_span)
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
