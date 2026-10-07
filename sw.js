// BIM MASTER Viewer · service worker: abre rápido y funciona sin conexión
const VERSION = 'bmv-2026-10-07';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const CDN = /^https:\/\/cdn\.jsdelivr\.net\/npm\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Página: primero la red (para recibir actualizaciones) y, si no hay conexión, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copia)); return r; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  // Librerías con versión fija (RA, three.js): se guardan la primera vez que se usan
  if (CDN.test(req.url)) {
    e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return r; })));
    return;
  }
  // Archivos propios (íconos, manifiesto): copia guardada y actualización en segundo plano
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then(h => { const red = fetch(req).then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return r; }).catch(() => h); return h || red; }));
  }
});
