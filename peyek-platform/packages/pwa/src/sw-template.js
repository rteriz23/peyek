/**
 * @rterizz23/peyek-pwa — Service Worker Template
 *
 * Copy this file to your public root as `sw.js`.
 * Customize CACHE_NAME and PRECACHE_URLS for your needs.
 *
 * Strategy:
 *   - Static assets → Cache First
 *   - API / dynamic routes → Network First
 *   - Offline fallback → /offline.html
 */

const CACHE_NAME = 'peyek-pwa-v1';

// List your critical static assets here
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/offline.html', // Create this page for offline fallback
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log('[PeyekSW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log('[PeyekSW] Activated.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and cross-origin requests
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    // Network first for API routes
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache first for static assets
    event.respondWith(cacheFirst(request));
});

// ─── Strategies ─────────────────────────────────────────────────────────────

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch {
        const offline = await caches.match('/offline.html');
        return offline || new Response('Offline', { status: 503 });
    }
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
