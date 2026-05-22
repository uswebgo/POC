/**
 * Service Worker - Agenda Inteligente PWA
 *
 * Estrategia:
 * - Cache-first para archivos estáticos (HTML, manifest, etc.)
 * - Network-first para datos de API (Supabase, Google Apps Script)
 * - Fallback offline para modo sin conexión
 */

const CACHE_NAME = 'agenda-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// URLs que NUNCA se cachean (APIs dinámicas)
const DYNAMIC_URLS = [
  'supabase.co',
  'script.google.com',
  'googleapis.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log('SW: Algunos archivos no pudieron ser cacheados');
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(cacheName !== CACHE_NAME) {
            console.log('SW: Limpiando caché anterior:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Solo cachear GET requests
  if(event.request.method !== 'GET') return;

  const url = event.request.url;

  // ===== STRATEGY: Network-first para APIs dinámicas =====
  // Intentar red primero, caché como fallback
  if(DYNAMIC_URLS.some(apiUrl => url.includes(apiUrl))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // No cachear respuestas de API
          return response;
        })
        .catch(() => {
          // Si falla la red, usar caché
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || new Response(
                'Sin conexión - No hay datos en caché',
                { status: 503, statusText: 'Sin conexión' }
              );
            });
        })
    );
    return;
  }

  // ===== STRATEGY: Cache-first para archivos estáticos =====
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si está en caché, devolverlo
      if(response) return response;

      // Si no, hacer fetch y cachear
      return fetch(event.request).then(response => {
        // No cachear respuestas de error
        if(!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clonar y cachear
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Fallback: intentar servir desde caché
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || new Response(
              'Offline - No hay página en caché',
              { status: 503, statusText: 'Offline' }
            );
          });
      });
    })
  );
});
