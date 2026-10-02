// FORGE52 Service Worker – macht die App offline nutzbar.
// Bei Änderungen an Dateien die Version erhöhen, damit Handys die neue Version laden.
const VERSION = 'forge52-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/main.js',
  './js/router.js',
  './js/store.js',
  './js/logic.js',
  './js/utils.js',
  './js/icons.js',
  './js/theme.js',
  './js/ui/components.js',
  './js/ui/charts.js',
  './js/ui/timer.js',
  './js/data/exercises.js',
  './js/data/program.js',
  './js/data/academy.js',
  './js/views/shared.js',
  './js/views/home.js',
  './js/views/plan.js',
  './js/views/session.js',
  './js/views/library.js',
  './js/views/academy.js',
  './js/views/progress.js',
  './js/views/settings.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Stale-while-revalidate: sofort aus dem Cache, im Hintergrund aktualisieren
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) return cached;
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') return cache.match('./index.html');
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }),
  );
});
