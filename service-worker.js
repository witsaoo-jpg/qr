// Service Worker สำหรับ Futuristic QR Studio PWA
const CACHE_NAME = 'qr-studio-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ดึงข้อมูลจากแคชเมื่อออฟไลน์
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // คืนค่าจากแคชถ้ามี
        if (response) {
          return response;
        }
        
        // ดึงจากเน็ตเวิร์คถ้าไม่มีในแคช
        return fetch(event.request)
          .then(response => {
            // ตรวจสอบว่าคำขอถูกต้องหรือไม่
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // คัดลอก response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // ถ้าออฟไลน์และไม่พบในแคช
            return caches.match('./index.html');
          });
      })
  );
});

// อัปเดต Service Worker
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
