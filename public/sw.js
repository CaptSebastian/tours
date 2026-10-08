// Service worker: zorgt dat een tour ook leesbaar blijft zonder internet
// (onder bruggen, of voor gasten zonder databundel na het openen van de link).
//
// - Pagina's: eerst online proberen, anders de opgeslagen versie.
// - Foto's, CSS, JS en fonts: opgeslagen versie als die er is, anders downloaden en bewaren.
// - Bij het openen van een tour vraagt de pagina om alle foto's + de tipspagina alvast op te slaan.
//
// Verhoog VERSION als je wilt dat alle telefoons de opgeslagen kopie weggooien.

const VERSION = 'v1';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isAsset(req) {
  return ['image', 'style', 'script', 'font'].includes(req.destination);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req.url, copy));
          }
          return res;
        })
        .catch(async () =>
          (await caches.match(req.url, { ignoreSearch: true })) ||
          new Response('<h1>Offline</h1><p>No internet connection. Please try again in a moment.</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        )
    );
    return;
  }

  if (isAsset(req)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok || res.type === 'opaque') {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});

// Bericht van een tourpagina: { type: 'precache', urls: [...] }
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'precache') return;
  const urls = event.data.urls ?? [];
  event.waitUntil(
    Promise.all(
      urls.map(async (u) => {
        const url = new URL(u, self.location.origin);
        const same = url.origin === self.location.origin;
        const isPage = same && !/\.[a-z0-9]+$/i.test(url.pathname);
        const cache = await caches.open(isPage ? PAGES : ASSETS);
        if (await cache.match(url.href)) return;
        try {
          const res = await fetch(url.href, { mode: same ? 'same-origin' : 'no-cors' });
          if (res.ok || res.type === 'opaque') await cache.put(url.href, res);
        } catch {}
      })
    ).then(() => event.source?.postMessage({ type: 'precached' }))
  );
});
