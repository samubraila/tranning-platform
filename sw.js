// FORGE52 Service Worker – macht die App offline nutzbar.
// Bei Änderungen an Dateien die Version erhöhen, damit Handys die neue Version laden.
const VERSION = 'forge52-v1.1.1';
const PREFIX = 'forge52-';
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
  // cache: 'reload' umgeht den HTTP-Cache, damit wirklich die neue Version gespeichert wird
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // Nur eigene alte Caches löschen – andere Apps auf derselben Domain (z. B. /Buch/) bleiben unberührt
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Selbstheilung: Hat eine andere App auf derselben Domain unseren Cache gelöscht,
// lädt die App ihn beim nächsten Start (online) automatisch neu.
async function ensureCache() {
  const cache = await caches.open(VERSION);
  const keys = await cache.keys();
  if (keys.length >= ASSETS.length) return;
  await cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })));
}
self.addEventListener('message', (e) => {
  if (e.data === 'ensure-cache') e.waitUntil(ensureCache().catch(() => {}));
});

// Stale-while-revalidate: sofort aus dem Cache, im Hintergrund aktualisieren
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Ein fester Cache-Schlüssel ohne Query/Hash, damit nie eine veraltete Kopie (z. B. ?utm=…) ausgeliefert wird
  const keyUrl = new URL(req.url);
  keyUrl.search = '';
  keyUrl.hash = '';
  const key = keyUrl.href;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(key);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) return cached;
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') return (await cache.match(new URL('./', self.registration.scope).href)) || cache.match(new URL('./index.html', self.registration.scope).href);
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }),
  );
});
