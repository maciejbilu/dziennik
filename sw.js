// Service worker: aplikacja działa offline. Dane do arkusza zawsze idą przez sieć.
const CACHE = 'dziennik-v13';
const FILES = ['./', './index.html', './manifest.json', './icon.svg', './pdf.min.mjs', './pdf.worker.min.mjs'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return; // Apps Script i filmy: bez cache
  // Najpierw sieć (świeża wersja), a bez internetu wersja z pamięci.
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
