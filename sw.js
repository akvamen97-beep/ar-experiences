const CACHE_NAME = 'ar-alive-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://aframe.io/releases/1.5.0/aframe.min.js',
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  // Кэшируем JSON проектов и медиа при первом запросе
  if (e.request.url.includes('/data/')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache => 
        cache.match(e.request).then(cached => {
          return fetch(e.request).then(networkResp => {
            cache.put(e.request, networkResp.clone());
            return networkResp;
          }).catch(() => cached || new Response('Offline', {status: 503}));
        })
      )
    );
  } else {
    // Статика: cache-first
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});