// Offline support: precache the whole app, serve from cache, refresh in the background.
// Bump VERSION on every deploy so installed copies pick up new content.
const VERSION = 'dsa-revise-v17';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'problems.js', 'notes.js', 'topics.js', 'solutions.js', 'mycode.js', 'explain.js', 'lessons.js', 'plus/plus1.js', 'plus/plus2.js',
  'plus/plus3.js', 'plus/plus4.js', 'playbook.js', 'viz.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/maskable-192.png', 'icons/maskable-512.png',
];

self.addEventListener('install', e => {
  // take over as soon as the new files are cached, so an installed app updates on the next launch
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
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
  // never cache the Android APK download or the sync API: always straight to the network
  if (url.pathname.includes('/downloads/') || url.pathname.includes('/api/')) return;
  const key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(key, { ignoreSearch: true });
      const fresh = fetch(req).then(res => {
        if (res.ok && req.mode !== 'navigate') cache.put(req, res.clone());
        return res;
      }).catch(() => undefined);
      if (cached) { e.waitUntil(fresh); return cached; }
      return (await fresh) || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    })
  );
});
