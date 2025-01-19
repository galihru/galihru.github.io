const CACHE_NAME = 'g4lihru-v1';
const urlsToCache = [
    './', // Menggunakan relatif untuk GitHub Pages
    './index.htm',
    './987654567.png',
    './manifest.json',
    './sw.js',
    './logo/192x192.png',
    './logo/512x512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Error caching files during install:', err);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Simpan salinan respons di cache untuk akses mendatang
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Kembalikan dari cache jika fetch gagal
                return caches.match(event.request).then(cachedResponse => {
                    return cachedResponse || caches.match('./index.htm');
                });
            })
    );
});
