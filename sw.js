/* XI.2 service worker v2
   - Aset CDN yang versinya dikunci (Tailwind, Supabase JS, font file): cache-first -> buka kedua kali hampir instan.
   - CSS font Google: stale-while-revalidate.
   - File situs sendiri: network-first (konten selalu terbaru), jatuh ke cache kalau jaringan lambat (>4 dtk) atau mati.
   - Supabase / API tidak pernah disentuh. */
const CACHE = 'xi2-v6';
const STATIC_HOSTS = ['cdn.jsdelivr.net', 'cdn.tailwindcss.com', 'fonts.gstatic.com'];
const SWR_HOSTS = ['fonts.googleapis.com'];
const NET_TIMEOUT = 4000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const cacheable = res => res && (res.ok || res.type === 'opaque');
const put = (req, res) => { if (cacheable(res)) { const c = res.clone(); caches.open(CACHE).then(ch => ch.put(req, c)).catch(() => {}); } return res; };

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;

  if (STATIC_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res))));
    return;
  }
  if (SWR_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => put(req, res)).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  e.respondWith(new Promise(resolve => {
    let done = false;
    const fallback = () => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match(url.pathname.indexOf('/admin/') === 0 ? './admin/' : './') : undefined));
    const t = setTimeout(() => { fallback().then(r => { if (r && !done) { done = true; resolve(r); } }); }, NET_TIMEOUT);
    fetch(req, { cache: 'no-cache' }).then(res => { clearTimeout(t); put(req, res); if (!done) { done = true; resolve(res); } })
      .catch(() => { clearTimeout(t); if (!done) fallback().then(r => { done = true; resolve(r || Response.error()); }); });
  }));
});
