// SPX Scanner — service worker: cache เฉพาะตัวหน้าเว็บ (app shell) เท่านั้น
// ข้อมูลชุดสแกนอยู่ใน localStorage ของเบราว์เซอร์ ไม่ผ่าน service worker นี้
// v5: กรองโค้ดที่ไม่ใช่เลขพัสดุ (เสียงเตือนเฉพาะ + ไม่บันทึกลงรายการ)
const CACHE = 'spx-scanner-v5';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // ไฟล์นอก origin ปล่อยผ่านปกติ
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
