const SW_VERSION = '2026.05.02.1';
const CACHE_VERSION = `kaf-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `kaf-runtime-${SW_VERSION}`;
const OFFLINE_CACHE = `kaf-offline-pack-${SW_VERSION}`;

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
  '/CSS/household-tools-concerts.css',
  '/CSS/visited-locations-tab.css',
  '/JS%20Files/tab-content-loader.js',
  '/JS%20Files/household-tools-concerts-system.js',
  '/JS%20Files/visited-locations-tab-system.js',
  '/JS%20Files/nature-challenge-tab-system.js',
  '/JS%20Files/pwa-offline-system.js',
  '/HTML%20Files/tabs/visited-locations-tab.html',
  '/HTML%20Files/tabs/nature-challenge-tab.html',
  '/HTML%20Files/tabs/bike-trails-tab.html',
  '/HTML%20Files/tabs/birding-locations-tab.html',
  '/HTML%20Files/tabs/household-tools-tab.html',
  '/HTML%20Files/tabs/recipes-tab.html',
  '/HTML%20Files/tabs/garden-planner-tab.html',
  '/HTML%20Files/tabs/budget-planner-tab.html',
  '/HTML%20Files/offline-pack-health.html',
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
  if (event.data.type === 'GET_SW_VERSION') {
    const payload = {
      type: 'SW_VERSION',
      swVersion: SW_VERSION,
      cacheVersion: CACHE_VERSION,
      runtimeCache: RUNTIME_CACHE,
      offlineCache: OFFLINE_CACHE
    };
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(payload);
    }
    return;
  }
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
  const pathname = url.pathname || '/';
  const isCriticalAppAsset = (
    pathname === '/' ||
    pathname === '/index.html' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/JS%20Files/') ||
    pathname.startsWith('/CSS/') ||
    pathname.startsWith('/HTML%20Files/') ||
    pathname.startsWith('/data/')
  );

  function buildFreshRequest(originalRequest) {
    if (!isCriticalAppAsset) return originalRequest;
    try {
      return new Request(originalRequest, { cache: 'no-store' });
    } catch (_error) {
      return originalRequest;
    }
  }

  async function fetchNetworkFirstWithCacheFallback() {
    const networkRequest = buildFreshRequest(req);
    try {
      const network = await fetch(networkRequest);
      const runtime = await caches.open(RUNTIME_CACHE);
      if (network && network.ok) {
        runtime.put(req, network.clone());
      }
      return network;
    } catch (_error) {
      const cached = await caches.match(req);
      if (cached) return cached;
      return caches.match('/index.html');
    }
  }

  if (isNavigation) {
    event.respondWith(fetchNetworkFirstWithCacheFallback());
    return;
  }

  if (isCriticalAppAsset) {
    event.respondWith(fetchNetworkFirstWithCacheFallback());
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

