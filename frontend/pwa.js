// Registers the service worker so Friendly Flux works as an installable PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function (err) {
            console.warn('Service worker registration failed:', err);
        });
    });
}
