// Offline support: the app shell is cached on first load; hashed build files are cached as they're fetched.
// Bump VERSION to force installed copies to drop old caches.
const VERSION = 'dsa-revise-v19';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(['/', '/index.html', '/manifest.webmanifest'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/downloads/') || url.pathname.includes('/api/')) return;
  const key = req.mode === 'navigate' ? '/index.html' : req;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(key, { ignoreSearch: true });
      const fresh = fetch(req).then(res => {
        if (res.ok && req.mode !== 'navigate') cache.put(req, res.clone());
        if (res.ok && req.mode === 'navigate') cache.put('/index.html', res.clone());
        return res;
      }).catch(() => undefined);
      if (cached) { e.waitUntil(fresh); return cached; }
      return (await fresh) || (req.mode === 'navigate' ? cache.match('/index.html') : Response.error());
    })
  );
});
