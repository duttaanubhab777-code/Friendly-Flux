// ==========================================
// script.js — Friendly Flux Main Logic
// ==========================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------
// 1) THEME TOGGLE (light / dark, saved to device)
// ---------------------------------------------
(function initTheme() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('flux-theme');
    const startTheme = saved || 'dark'; // site defaults to dark until the user picks light

    applyTheme(startTheme);

    toggleBtn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('flux-theme', next);
    });

    function applyTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            toggleBtn.setAttribute('aria-pressed', 'true');
            toggleBtn.setAttribute('aria-label', 'Switch to light mode');
        } else {
            root.removeAttribute('data-theme');
            toggleBtn.setAttribute('aria-pressed', 'false');
            toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
})();

// ---------------------------------------------
// 2) HERO CONSTELLATION CANVAS
// ---------------------------------------------
(function initConstellation() {
    const canvas = document.getElementById('constellation');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, points;
    const POINT_COUNT = 70;
    const LINK_DIST = 130;
    const mouse = { x: null, y: null };

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    function makePoints() {
        points = Array.from({ length: POINT_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.6 + 0.6,
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        for (const p of points) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(148, 197, 253, 0.85)';
            ctx.fill();
        }

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[j].x, points[j].y);
                    ctx.strokeStyle = `rgba(94, 165, 245, ${1 - dist / LINK_DIST})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                const dx = points[i].x - mouse.x;
                const dy = points[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST * 1.4) {
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(167, 139, 250, ${1 - dist / (LINK_DIST * 1.4)})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }

        if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    makePoints();
    step();

    window.addEventListener('resize', () => { resize(); makePoints(); });
    canvas.parentElement.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('pointerleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
})();

// ---------------------------------------------
// 3) 3D TILT ON SUBJECT CARDS (pointer devices only)
// ---------------------------------------------
(function initTilt() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.subject-card').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
        });
        card.addEventListener('pointerleave', () => {
            card.style.transform = '';
        });
    });
})();

// ---------------------------------------------
// 4) SCROLL REVEAL + STAT COUNTERS
// ---------------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

function observeReveal(el) {
    revealObserver.observe(el);
}

document.querySelectorAll('.reveal').forEach(observeReveal);

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach((el) => statObserver.observe(el));

function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ---------------------------------------------
// 5) SCIENTISTS: fetch, render, filter
// ---------------------------------------------
let allScientists = [];

fetch('scientists.json')
    .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then((scientists) => {
        allScientists = scientists;
        renderScientists(allScientists);
        initFilterBar();
    })
    .catch((error) => {
        console.error('Error loading the scientist data:', error);
        const container = document.getElementById('scientists-container');
        if (container) {
            container.innerHTML = `
                <p style="color: #ef4444; font-weight: 600; grid-column: 1 / -1;">
                    ⚠️ Data loading blocked by browser security. Please view this on the live GitHub Pages link to see the cards.
                </p>
            `;
        }
    });

function renderScientists(list) {
    const container = document.getElementById('scientists-container');
    if (!container) return;
    container.innerHTML = '';

    list.forEach((scientist) => {
        const card = document.createElement('div');
        card.classList.add('scientist-card', 'reveal');
        card.setAttribute('data-subject', scientist.subject || 'science');

        card.innerHTML = `
            <div class="scientist-name">${scientist.name}</div>
            <div class="scientist-field"><i class="fa-solid fa-graduation-cap"></i> ${scientist.field}</div>
            <p>${scientist.description}</p>
            <div class="formula-box">${scientist.formula}</div>
        `;

        container.appendChild(card);
        observeReveal(card);
        requestAnimationFrame(() => card.classList.add('in-view'));
    });
}

function initFilterBar() {
    const chips = document.querySelectorAll('.filter-chip');
    const pill = document.querySelector('.filter-pill');
    if (!chips.length) return;

    function movePill(chip) {
        pill.style.width = `${chip.offsetWidth}px`;
        pill.style.transform = `translateX(${chip.offsetLeft - 6}px)`;
    }

    movePill(document.querySelector('.filter-chip.active'));
    window.addEventListener('resize', () => movePill(document.querySelector('.filter-chip.active')));

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            chips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            movePill(chip);

            const filter = chip.dataset.filter;
            const filtered = filter === 'all'
                ? allScientists
                : allScientists.filter((s) => s.subject === filter);
            renderScientists(filtered);
        });
    });
}
