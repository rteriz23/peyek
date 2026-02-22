/**
 * P.E.Y.E.K Website Service Worker v1.0
 * Cache-first for static assets, network-first for pages
 */
const CACHE = 'peyek-site-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/docs.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/offline.html',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono&display=swap',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.filter(u => !u.startsWith('http') || u.includes('fonts')))));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.pathname.startsWith('/api/')) {
        e.respondWith(networkFirst(e.request));
    } else {
        e.respondWith(cacheFirst(e.request));
    }
});

async function cacheFirst(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const resp = await fetch(req);
        if (resp.ok) (await caches.open(CACHE)).put(req, resp.clone());
        return resp;
    } catch {
        return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
}

async function networkFirst(req) {
    try {
        const resp = await fetch(req);
        (await caches.open(CACHE)).put(req, resp.clone());
        return resp;
    } catch {
        return (await caches.match(req)) || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503, headers: { 'Content-Type': 'application/json' }
        });
    }
}
