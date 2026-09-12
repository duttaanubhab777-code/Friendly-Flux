
    document.addEventListener('DOMContentLoaded', function() {
        const physicsFormulas = {
            "newtons_second_law": ["m", "a"],
            "kinetic_energy": ["m", "v"],
            "ohms_law": ["I", "R"],
            "final_velocity": ["u", "a", "t"]
        };

        const physicsSelect = document.getElementById('physics-select');
        const physicsInputs = document.getElementById('physics-inputs');
        const resultDisplay = document.getElementById('physics-result');

        physicsSelect.addEventListener('change', function() {
            physicsInputs.innerHTML = ''; 
            resultDisplay.innerText = '';
            const selected = this.value;

            if (physicsFormulas[selected]) {
                physicsFormulas[selected].forEach(variable => {
                    physicsInputs.innerHTML += `
                        <div class="input-group">
                            <label>Enter ${variable}:</label>
                            <input type="number" id="var-${variable}" placeholder="Value of ${variable}">
                        </div>
                    `;
                });
            }
        });

        document.getElementById('physics-calc-btn').addEventListener('click', () => {
            const selected = physicsSelect.value;
            if (!selected) return alert("Please select a formula first!");

            let variablesData = {};
            physicsFormulas[selected].forEach(variable => {
                const val = document.getElementById(`var-${variable}`).value;
                variablesData[variable] = parseFloat(val);
            });

            const requestBody = {
                formula: selected,
                variables: variablesData
            };

            const API_BASE = "https://<তোমার-pythonanywhere-username>.pythonanywhere.com";

            resultDisplay.innerText = "Calculating...";
            
            fetch(`${API_BASE}/api/physics/solve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
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

