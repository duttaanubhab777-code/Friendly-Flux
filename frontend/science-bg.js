/* ==========================================================================
   Friendly Flux — Ambient Science Background
   Purely decorative canvas animation layered behind the existing UI.
   Does not touch, read, or depend on any existing app logic — safe to drop
   into any page. Reads the theme from <body data-bg-theme="...">.
   ========================================================================== */
(function () {
    "use strict";

    var THEME = document.body.getAttribute("data-bg-theme") || "home";
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-color-scheme: no-preference)");
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function isDark() {
        return document.documentElement.getAttribute("data-theme") === "dark";
    }

    var canvas = document.createElement("canvas");
    canvas.id = "science-bg-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d");

    var W, H, DPR;
    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    /* ---------------------------------------------------------------- */
    /* Palettes per subject                                              */
    /* ---------------------------------------------------------------- */
    var PALETTES = {
        home: { light: ["#2563eb", "#0ea5e9", "#eab308", "#22c55e", "#ef4444"], dark: ["#60a5fa", "#38bdf8", "#facc15", "#4ade80", "#fb7185"] },
        math: { light: ["#7c3aed", "#2563eb", "#0891b2", "#e11d48"], dark: ["#c4b5fd", "#60a5fa", "#67e8f9", "#fb7185"] },
        physics: { light: ["#2F6FED", "#16C79A", "#FF9A3D"], dark: ["#6C8CFF", "#00E0B8", "#FFC94D"] },
        chemistry: { light: ["#0d9488", "#7c3aed", "#22c55e"], dark: ["#2dd4bf", "#a78bfa", "#4ade80"] },
        "math-welcome": { light: ["#a78bfa", "#818cf8", "#f472b6", "#fbbf24"], dark: ["#c4b5fd", "#93c5fd", "#f9a8d4", "#fde68a"] }
    };
    function palette() {
        var p = PALETTES[THEME] || PALETTES.home;
        return isDark() ? p.dark : p.light;
    }
    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

    /* ---------------------------------------------------------------- */
    /* Particle sets                                                     */
    /* ---------------------------------------------------------------- */
    var particles = [];

    var MATH_SYMBOLS = ["∫", "∑", "π", "√", "∞", "Δ", "θ", "x²", "÷", "≈", "λ", "ƒ(x)"];
    var CHEM_SYMBOLS = ["H₂O", "O₂", "CO₂", "NaCl", "C₆H₁₂O₆", "e⁻", "pH", "N₂"];

    function makeParticle(kind) {
        var pal = palette();
        var base = {
            x: rand(0, W),
            y: rand(0, H),
            color: pick(pal),
            opacity: rand(0.08, 0.22),
            speed: rand(0.08, 0.35),
            drift: rand(-0.15, 0.15),
            angle: rand(0, Math.PI * 2),
            spin: rand(-0.004, 0.004),
            size: rand(14, 30)
        };
        if (kind === "symbol") {
            base.text = pick(THEME === "chemistry" ? CHEM_SYMBOLS : MATH_SYMBOLS);
            base.size = rand(16, 36);
        } else if (kind === "orbit") {
            base.radius = rand(18, 40);
            base.orbitSpeed = rand(0.01, 0.03);
        } else if (kind === "bubble") {
            base.size = rand(4, 16);
        } else if (kind === "star") {
            base.size = rand(1, 2.4);
            base.twinkle = rand(0, Math.PI * 2);
        }
        base.kind = kind;
        return base;
    }

    function buildField() {
        particles = [];
        var count;
        if (THEME === "math") {
            count = 22;
            for (var i = 0; i < count; i++) particles.push(makeParticle("symbol"));
        } else if (THEME === "math-welcome") {
            count = 16;
            for (var i2 = 0; i2 < count; i2++) particles.push(makeParticle("symbol"));
            for (var s = 0; s < 60; s++) particles.push(makeParticle("star"));
        } else if (THEME === "physics") {
            count = 10;
            for (var j = 0; j < count; j++) particles.push(makeParticle("orbit"));
            for (var s2 = 0; s2 < 40; s2++) particles.push(makeParticle("star"));
        } else if (THEME === "chemistry") {
            count = 20;
            for (var k = 0; k < count; k++) particles.push(makeParticle("bubble"));
            for (var t = 0; t < 10; t++) particles.push(makeParticle("symbol"));
        } else {
            count = 18;
            for (var m = 0; m < count; m++) particles.push(makeParticle(pick(["symbol", "bubble", "star"])));
        }
    }
    buildField();

    /* ---------------------------------------------------------------- */
    /* Draw helpers                                                      */
    /* ---------------------------------------------------------------- */
    function drawSymbol(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.font = "600 " + p.size + "px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
    }

    function drawBubble(p) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawOrbit(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.opacity;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 0.4, p.angle, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = p.color;
        var nx = Math.cos(p.angle) * p.radius;
        var ny = Math.sin(p.angle) * p.radius * 0.4;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawStar(p) {
        ctx.save();
        var tw = 0.5 + 0.5 * Math.sin(p.twinkle);
        ctx.globalAlpha = p.opacity * tw;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function step(p) {
        if (p.kind === "orbit") {
            p.angle += p.orbitSpeed;
            p.x += p.drift * 0.2;
            return;
        }
        if (p.kind === "star") {
            p.twinkle += 0.02;
            return;
        }
        p.y -= p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        if (p.y < -40) { p.y = H + 40; p.x = rand(0, W); }
        if (p.x < -60) p.x = W + 60;
        if (p.x > W + 60) p.x = -60;
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            step(p);
            if (p.kind === "symbol") drawSymbol(p);
            else if (p.kind === "bubble") drawBubble(p);
            else if (p.kind === "orbit") drawOrbit(p);
            else if (p.kind === "star") drawStar(p);
        }
        if (!prefersReduced) requestAnimationFrame(frame);
    }

    if (prefersReduced) {
        // Draw a single still frame so the page still feels themed, without motion.
        frame();
    } else {
        requestAnimationFrame(frame);
    }

    // Re-tint particles automatically when the page's own dark/light toggle changes.
    var mo = new MutationObserver(function () {
        var pal = palette();
        particles.forEach(function (p) { p.color = pick(pal); });
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
