// Service Worker for caching map tiles
const CACHE_NAME = 'map-tiles-v1';
const TILE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Tile URL patterns to cache
const TILE_PATTERNS = [
    /^https:\/\/tile\.openstreetmap\.org\/.*/,
    /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/.*/,
    /^https:\/\/maps\.api\.2gis\.ru\/.*/
];

// Check if URL is a map tile
function isTileRequest(url) {
    return TILE_PATTERNS.some(pattern => pattern.test(url));
}

// Install event - setup cache
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('map-tiles-') && name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - cache strategy for tiles
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Only handle tile requests
    if (!isTileRequest(url)) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                // Check if cached response exists and is not expired
                if (cachedResponse) {
                    const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
                    const now = new Date();
                    
                    if (now - cachedDate < TILE_CACHE_DURATION) {
                        console.log('[SW] Serving from cache:', url);
                        return cachedResponse;
                    }
                }

                // Fetch from network and cache
                return fetch(event.request).then((response) => {
                    // Only cache successful responses
                    if (response.status === 200) {
                        const responseToCache = response.clone();
                        const headers = new Headers(responseToCache.headers);
                        headers.append('sw-cached-date', new Date().toISOString());

                        responseToCache.blob().then((blob) => {
                            cache.put(
                                event.request,
                                new Response(blob, {
                                    status: responseToCache.status,
                                    statusText: responseToCache.statusText,
                                    headers: headers
                                })
                            );
                        });

                        console.log('[SW] Cached tile:', url);
                    }
                    return response;
                }).catch((error) => {
                    console.error('[SW] Fetch failed, returning cached version if available:', error);
                    return cachedResponse || new Response('Tile not available', { status: 503 });
                });
            });
        })
    );
});
