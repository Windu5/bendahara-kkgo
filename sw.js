const CACHE_NAME = 'KKGO-digital-v1';

// Gunakan relative path agar kompatibel dengan arsitektur GitHub Pages
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.js'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Memaksa update ke Service worker baru seketika
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                          .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    
    // PENGAMANAN FATAL: Abaikan caching untuk request ke Database API Firebase
    // Ini memastikan data keuangan yang ditarik selalu REAL-TIME dari server
    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('securetoken.googleapis.com')) {
        return; 
    }

    // Strategi "Network First, fallback to Cache" untuk HTML & UI
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Jangan cache jika respons gagal atau tidak valid
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Update cache diam-diam di background agar selalu fresh
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            // Fallback: Jika offline (tidak ada koneksi), load dari Cache lokal
            .catch(() => caches.match(event.request)) 
    );
});