/* Friendly Flux - Service Worker */
const VERSION = 'v2';
const SHELL_CACHE = 'flux-shell-' + VERSION;
const RUNTIME_CACHE = 'flux-runtime-' + VERSION;

// App files cached on install so the app opens offline
const SHELL_FILES = [
    './',
    'chemistry/chemistry.css',
    'chemistry/chemistry.html',
    'chemistry/chemistry.js',
    'chemistry/lang.js',
    'icons/apple-touch-icon.png',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'index.html',
    'math/algebra/algebra-lang.js',
    'math/algebra/algebra-lang_rules.js',
    'math/algebra/algebra.css',
    'math/algebra/algebra.js',
    'math/core/calculus-graph.js',
    'math/core/lang.js',
    'math/core/math.css',
    'math/core/math.js',
    'math/geometry/geometry3d-graph.js',
    'math/geometry/geometry3d.css',
    'math/geometry/geometry3d.js',
    'math/geometry/geometrylang.js',
    'math/math.html',
    'math/welcome/math-welcome.css',
    'math/welcome/math-welcome.html',
    'physics/lang.js',
    'physics/physics.css',
    'physics/physics.html',
    'physics/physics.js',
    'science-bg.css',
    'science-bg.js',
    'scientists.json',
    'script.js',
    'shared.js',
    'style.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) =>
            // one failing file must not break the whole install
            Promise.all(SHELL_FILES.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k.startsWith('flux-') && k !== SHELL_CACHE && k !== RUNTIME_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Backend calls (solver / graph / OCR) must always hit the network
function isApiRequest(url) {
    return (
        url.pathname.startsWith('/api/') ||
        url.hostname.endsWith('pythonanywhere.com') ||
        url.port === '5000'
    );
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (!/^https?:$/.test(url.protocol)) return;
    if (isApiRequest(url)) return;

    // Page navigation: network first, fall back to cache when offline
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
                    return res;
                })
                .catch(() =>
                    caches.match(req, { ignoreSearch: true }).then(
                        (hit) => hit || caches.match('./index.html')
                    )
                )
        );
        return;
    }

    // Our own files (html/css/js/json): network first so users always get the latest
    // version after a GitHub update; cache is used only when offline / server is slow.
    if (url.origin === self.location.origin) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res && res.status === 200) {
                        const copy = res.clone();
                        caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match(req, { ignoreSearch: true }))
        );
        return;
    }

    // External libraries / fonts (CDN): serve from cache, refresh in background
    event.respondWith(
        caches.match(req).then((cached) => {
            const network = fetch(req)
                .then((res) => {
                    if (res && (res.status === 200 || res.type === 'opaque')) {
                        const copy = res.clone();
                        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
