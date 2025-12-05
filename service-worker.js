
const CACHE_NAME = 'pwa-book-1bd4fb-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Merriweather:wght@300;400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request).then(response => {
           // Check if we received a valid response
           if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
           }
           // Clone the response
           var responseToCache = response.clone();
           caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
           });
           return response;
        });
      }).catch(() => {
         // Fallback logic for offline could go here if needed
         if (event.request.mode === 'navigate') {
             return caches.match('./index.html');
         }
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
