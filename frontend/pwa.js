// Friendly Flux PWA: service worker + "Install App" button
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function (err) {
            console.warn('Service worker registration failed:', err);
        });
    });
}

(function () {
    var btn = document.getElementById('install-btn');
    if (!btn) return;

    var deferredPrompt = null;
    var isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    // Already installed / running as app: no need for the button
    if (isStandalone) {
        btn.hidden = true;
        return;
    }

    // Button styles (kept here so no existing CSS file is touched)
    var css = document.createElement('style');
    css.textContent =
        '.install-btn{display:inline-flex;align-items:center;gap:8px;margin-left:auto;margin-right:12px;' +
        'padding:8px 16px;border:0;border-radius:999px;cursor:pointer;font:600 14px var(--font-body,Inter,sans-serif);' +
        'color:#04101c;background:var(--accent,#38bdf8);box-shadow:0 6px 18px rgba(56,189,248,.35);' +
        'transition:transform .15s ease,box-shadow .15s ease}' +
        '.install-btn:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(56,189,248,.5)}' +
        '.install-btn[hidden]{display:none}' +
        '@media(max-width:640px){.install-btn{margin-right:8px;padding:8px 12px}.install-btn .install-text{display:none}}' +
        '.install-help{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(0,0,0,.6);padding:20px}' +
        '.install-help-box{max-width:360px;width:100%;padding:22px;border-radius:16px;background:var(--bg-alt,#0d1326);' +
        'color:var(--ink,#eaf0fb);border:1px solid var(--card-border,rgba(255,255,255,.12));' +
        'font:400 15px/1.55 var(--font-body,Inter,sans-serif)}' +
        '.install-help-box h3{margin:0 0 10px;font-size:18px}' +
        '.install-help-box button{margin-top:14px;padding:8px 18px;border:0;border-radius:999px;cursor:pointer;' +
        'font-weight:600;background:var(--accent,#38bdf8);color:#04101c}';
    document.head.appendChild(css);

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
    });

    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        btn.hidden = true;
    });

    function showHelp() {
        var ua = navigator.userAgent || '';
        var isIOS = /iphone|ipad|ipod/i.test(ua);
        var msg = isIOS
            ? 'Safari-তে নিচের <b>Share</b> বাটনে চাপুন, তারপর <b>"Add to Home Screen"</b> সিলেক্ট করুন।'
            : 'ব্রাউজারের <b>মেনু (⋮)</b> খুলে <b>"Install app"</b> বা <b>"Add to Home screen"</b> সিলেক্ট করুন।';
        var wrap = document.createElement('div');
        wrap.className = 'install-help';
        wrap.innerHTML =
            '<div class="install-help-box"><h3>Friendly Flux ইনস্টল করুন</h3><p>' + msg +
            '</p><button type="button">ঠিক আছে</button></div>';
        wrap.addEventListener('click', function (ev) {
            if (ev.target === wrap || ev.target.tagName === 'BUTTON') wrap.remove();
        });
        document.body.appendChild(wrap);
    }

    btn.addEventListener('click', function () {
        if (!deferredPrompt) {
            showHelp();
            return;
        }
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
            if (choice.outcome === 'accepted') btn.hidden = true;
            deferredPrompt = null;
        });
    });
})();
