// ==========================================
// script.js - Friendly Flux Main Logic
// ==========================================

// Fetch data invisibly from the external JSON file
fetch('scientists.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(scientists => {
        const scientistsContainer = document.getElementById('scientists-container');

        // Loop through each scientist in the JSON data
        scientists.forEach(scientist => {
            // Create a new div element for the card
            const card = document.createElement('div');
            card.classList.add('scientist-card');

            // Insert the HTML structure with the dynamic data
            card.innerHTML = `
                <div class="scientist-name">${scientist.name}</div>
                <div class="scientist-field"><i class="fa-solid fa-graduation-cap"></i> ${scientist.field}</div>
                <p>${scientist.description}</p>
                <div class="formula-box">${scientist.formula}</div>
            `;

            // Add the card to our main container in index.html
            scientistsContainer.appendChild(card);
        });
    })
    .catch(error => {
        console.error('Error loading the scientist data:', error);
        
        // Error message if JSON fails to load (e.g., when opened locally without a server)
        const scientistsContainer = document.getElementById('scientists-container');
        if (scientistsContainer) {
            scientistsContainer.innerHTML = `
                <p style="color: #ef4444; font-weight: 600; grid-column: 1 / -1;">
                    ⚠️ Data loading blocked by browser security. Please view this on the live GitHub Pages link to see the cards.
                </p>
            `;
        }
    });
