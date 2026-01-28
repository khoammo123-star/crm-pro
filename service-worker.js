// =====================================================
// CRM PRO - SERVICE WORKER
// PWA Offline Support & Caching
// =====================================================

const CACHE_NAME = 'crm-pro-v2';
const STATIC_CACHE = 'crm-static-v2';
const DYNAMIC_CACHE = 'crm-dynamic-v2';

// Files to cache on install
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles/variables.css',
    '/styles/main.css',
    '/styles/components.css',
    '/styles/layout.css',
    '/styles/pages.css',
    '/styles/mobile.css',
    '/js/config.js',
    '/js/api.js',
    '/js/utils.js',
    '/js/components.js',
    '/js/app.js',
    '/js/pages/dashboard.js',
    '/js/pages/contacts.js',
    '/js/pages/companies.js',
    '/js/pages/deals.js',
    '/js/pages/tasks.js'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js'
];

// =====================================================
// INSTALL EVENT - Pre-cache static files
// =====================================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Pre-caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                // Cache external resources
                return caches.open(DYNAMIC_CACHE).then((cache) => {
                    return Promise.allSettled(
                        EXTERNAL_RESOURCES.map(url =>
                            cache.add(url).catch(err => console.log('[SW] Failed to cache:', url))
                        )
                    );
                });
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
    );
});

// =====================================================
// ACTIVATE EVENT - Clean old caches
// =====================================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// =====================================================
// FETCH EVENT - Serve from cache or network
// =====================================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API requests (let them go to network)
    if (url.hostname === 'script.google.com' || url.hostname.includes('supabase')) {
        return;
    }

    // Strategy: Cache First for static files
    if (isStaticFile(request)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Strategy: Network First for dynamic content
    event.respondWith(networkFirst(request));
});

// =====================================================
// CACHING STRATEGIES
// =====================================================

/**
 * Cache First - Try cache, fallback to network
 * Best for: Static files (CSS, JS, images)
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Cache first failed:', error);
        return caches.match('/index.html'); // Fallback to app shell
    }
}

/**
 * Network First - Try network, fallback to cache
 * Best for: HTML pages, dynamic content
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network first failed, trying cache...');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return offline page
        return caches.match('/index.html');
    }
}

/**
 * Stale While Revalidate - Return cache immediately, update in background
 * Best for: Data that can be slightly stale
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });

    return cachedResponse || fetchPromise;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function isStaticFile(request) {
    const url = new URL(request.url);
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// =====================================================
// BACKGROUND SYNC (for offline actions)
// =====================================================
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncPendingData());
    }
});

async function syncPendingData() {
    // Get pending actions from IndexedDB and send to server
    console.log('[SW] Syncing pending data...');
    // TODO: Implement offline queue sync
}

// =====================================================
// PUSH NOTIFICATIONS (future)
// =====================================================
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Bạn có thông báo mới',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'CRM Pro', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

console.log('[SW] Service Worker loaded');
