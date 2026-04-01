// 1. Identificador de la versión (BPM Mixer v3.0)
const CACHE_NAME = 'LB-Master-Deck-v3.0';

// 2. Archivos Vitales para que el Deck suene hasta en el desierto
const INITIAL_ASSETS = [
  './',
  './index.html',
  './logo.png' 
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🦁 [LB-Deck]: Núcleo del sistema instalado.');
      return cache.addAll(INITIAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// --- FASE DE ACTIVACIÓN ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🦁 [LB-Deck]: Borrando rastro antiguo:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('🦁 [LB-Deck]: Sistema en línea y listo para el mambo.');
      return self.clients.claim();
    })
  );
});

// --- ESTRATEGIA DE RED: NETWORK FIRST CON AUTO-RECUPERACIÓN ---
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // MODO OFFLINE: Si no hay señal, rugimos con lo que hay en el caché
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
        
