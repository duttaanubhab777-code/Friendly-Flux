
    document.addEventListener('DOMContentLoaded', function() {
        // ১. app.py-এর CHEMISTRY_FORMULAS অনুযায়ী কনফিগারেশন[span_3](start_span)[span_3](end_span)
        const chemistryFormulas = {
            "moles": ["mass", "molar_mass"],            // mass, molar_mass[span_4](start_span)[span_4](end_span)
            "molarity": ["moles", "volume_liters"],     // moles, volume_liters[span_5](start_span)[span_5](end_span)
            "ideal_gas_pressure": ["n", "T", "V"]       // n (moles), T (temp), V (volume)[span_6](start_span)[span_6](end_span)
        };

        const chemistrySelect = document.getElementById('chemistry-select');
        const chemistryInputs = document.getElementById('chemistry-inputs');
        const resultDisplay = document.getElementById('chemistry-result');

        // ২. ড্রপডাউন থেকে ফর্মুলা সিলেক্ট করলে বক্স তৈরি করা
        chemistrySelect.addEventListener('change', function() {
            chemistryInputs.innerHTML = ''; 
            resultDisplay.innerText = '';
            const selected = this.value;

            if (chemistryFormulas[selected]) {
                chemistryFormulas[selected].forEach(variable => {
                    chemistryInputs.innerHTML += `
                        <div class="input-group">
                            <label>Enter ${variable}:</label>
                            <input type="number" id="var-${variable}" placeholder="Value of ${variable}">
                        </div>
                    `;
                });
            }
        });

        // ৩. Calculate বাটনে ক্লিক করলে ডেটা পাঠানো
        document.getElementById('chemistry-calc-btn').addEventListener('click', () => {
            const selected = chemistrySelect.value;
            if (!selected) return alert("Please select a formula first!");

            // ইউজারের ইনপুটগুলো জোগাড় করা
            let variablesData = {};
            chemistryFormulas[selected].forEach(variable => {
                const val = document.getElementById(`var-${variable}`).value;
                variablesData[variable] = parseFloat(val);
            });

            // app.py-এর নিয়ম অনুযায়ী JSON তৈরি[span_7](start_span)[span_7](end_span)
            const requestBody = {
                formula: selected,
                variables: variablesData
            };

            const API_BASE = "https://<তোমার-pythonanywhere-username>.pythonanywhere.com";

            resultDisplay.innerText = "Calculating...";
            
            // Chemistry-এর নির্দিষ্ট API-তে ( /api/chemistry/solve ) POST রিকোয়েস্ট পাঠানো[span_8](start_span)[span_8](end_span)
            fetch(`${API_BASE}/api/chemistry/solve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // সফল হলে app.py থেকে 'result' ফেরত আসে[span_9](start_span)[span_9](end_span)
                    resultDisplay.innerText = `Result: ${data.result.toFixed(2)}`;
                } else {
                    resultDisplay.innerText = `Error: ${data.error}`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultDisplay.innerText = "Connection failed! Backend is not running.";
            });
        });
    });

