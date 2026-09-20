const CACHE_NAME = 'campus-fixit-cache-v22';

const STATIC_ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/js/firebase-config.js',
    '/auth/login.html',
    '/auth/register.html',
    '/student/dashboard.html',
    '/admin/dashboard.html',
    '/worker/dashboard.html'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    // Clear old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Don't intercept Firebase API calls or external domains
    if (!requestUrl.origin.includes(self.location.origin)) {
        return;
    }
    
    // For HTML requests, use Stale While Revalidate for instant loading
    if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => {
                        // Offline fallback logic here if needed
                    });
                    
                    // Return cached immediately if available, else wait for network
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // For static assets (CSS, JS, Images), use Cache First strategy
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((networkResponse) => {
                // Cache the newly fetched asset
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        })
    );
});

