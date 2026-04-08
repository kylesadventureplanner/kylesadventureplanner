const CACHE_VERSION = 'kaf-shell-v1';
const RUNTIME_CACHE = 'kaf-runtime-v1';
const OFFLINE_CACHE = 'kaf-offline-pack-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/CSS/design-tokens.css',
  '/CSS/components.css',
  '/CSS/utilities.css',
  '/CSS/browse-page.css',
  '/CSS/edit-page.css',
  '/CSS/bike-details-window.css',
  '/CSS/mobile-standalone-enhancements.css',
  '/JS%20Files/tab-content-loader.js',
  '/JS%20Files/visited-locations-tab-system.js',
  '/JS%20Files/nature-challenge-tab-system.js',
  '/JS%20Files/pwa-offline-system.js',
  '/HTML%20Files/tabs/visited-locations-tab.html',
  '/HTML%20Files/tabs/nature-challenge-tab.html',
  '/HTML%20Files/tabs/bike-trails-tab.html',
  '/data/nature-challenge-birds.tsv'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(PRECACHE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key !== CACHE_VERSION && key !== RUNTIME_CACHE && key !== OFFLINE_CACHE) {
        return caches.delete(key);
      }
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (!event || !event.data) return;
  if (event.data.type === 'WARM_OFFLINE_PACK') {
    event.waitUntil((async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.addAll(PRECACHE_ASSETS);
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;

  const isNavigation = req.mode === 'navigate';
  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const network = await fetch(req);
        const runtime = await caches.open(RUNTIME_CACHE);
        runtime.put(req, network.clone());
        return network;
      } catch (_error) {
        const cached = await caches.match(req);
        if (cached) return cached;
        return caches.match('/index.html');
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const network = await fetch(req);
      const runtime = await caches.open(RUNTIME_CACHE);
      runtime.put(req, network.clone());
      return network;
    } catch (_error) {
      const fallback = await caches.match('/index.html');
      return fallback || Response.error();
    }
  })());
});

