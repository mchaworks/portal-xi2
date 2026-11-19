/* XI.2 pasang-aplikasi (PWA): popup ajakan install.
   - Muncul saat kunjungan pertama, lalu tiap 2 kali refresh (muat ke-1, 3, 5, ...) sampai aplikasi terpasang.
   - Android/Chrome: tombol "Pasang" memakai prompt bawaan browser. iOS / browser tanpa prompt: tampil panduan singkat.
   - Tidak muncul kalau sudah dibuka sebagai aplikasi (fullscreen/standalone) atau sudah terpasang.
   - Dipakai di web utama dan admin; hitungan refresh dipisah per aplikasi. */
(function () {
  'use strict';
  var SC = document.currentScript;
  var BASE = SC && SC.src ? SC.src.replace(/[^\/]*$/, '') : './';
  var ADMIN = /\/admin(\/|$)/.test(location.pathname);
  var APP = ADMIN ? 'admin' : 'main';
  var K_N = 'xia-pwa-n:' + APP, K_DONE = 'xia-pwa-done:' + APP;
  var EVERY = 2;

  function ls(get, k, v) { try { return get ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; } }

  var standalone = (window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: minimal-ui)').matches)) || navigator.standalone === true;
  if (standalone) { ls(false, K_DONE, '1'); return; }
  if (ls(true, K_DONE) === '1') return;
  if (!(location.protocol === 'https:' || location.hostname === 'localhost')) return;

  /* hitung muat halaman; tampil di muat ke-1, 3, 5, ... */
  var n = (parseInt(ls(true, K_N), 10) || 0) + 1;
  ls(false, K_N, String(n));
  var due = (n - 1) % EVERY === 0;

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { ls(false, K_DONE, '1'); deferred = null; close(); });

  if (!due) return;

  var ua = navigator.userAgent || '';
  var IOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var ANDROID = /android/i.test(ua);
  var root = null;

  var TXT = ADMIN
    ? { t: 'Pasang Admin XI.2', d: 'Buka panel admin layar penuh langsung dari layar utama, lebih cepat dan tanpa bilah browser.' }
    : { t: 'Pasang XI.2 Creative Lab', d: 'Buka portal layar penuh dari layar utama: lebih cepat, tanpa bilah browser, dan tetap bisa dibuka saat sinyal lemah.' };

  function css() {
    if (document.getElementById('xia-pwa-css')) return;
    var s = document.createElement('style'); s.id = 'xia-pwa-css';
    s.textContent =
      '#xia-pwa{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom,0px));background:rgba(8,20,14,0);transition:background .35s;font-family:Inter,system-ui,sans-serif;pointer-events:none}' +
      '#xia-pwa.on{background:rgba(8,20,14,.38);pointer-events:auto}' +
      '#xia-pwa .xp-card{position:relative;width:min(440px,100%);padding:22px 20px 18px;border-radius:30px;background:var(--md-sys-color-surface-container-high,#fff);color:var(--md-sys-color-on-surface,#171D1A);border:1px solid var(--md-sys-color-outline-variant,rgba(0,0,0,.12));box-shadow:0 24px 60px -20px rgba(0,0,0,.5);transform:translateY(110%);transition:transform .5s cubic-bezier(.22,1.2,.36,1)}' +
      '#xia-pwa.on .xp-card{transform:none}' +
      '#xia-pwa .xp-top{display:flex;gap:14px;align-items:center}' +
      '#xia-pwa .xp-ico{flex:none;width:64px;height:64px;border-radius:20px;background:var(--md-sys-color-primary-container,#A6F2D1);display:grid;place-items:center;overflow:hidden}' +
      '#xia-pwa .xp-ico img{width:52px;height:52px;object-fit:contain}' +
      '#xia-pwa h2{margin:0;font-size:18px;line-height:1.2;font-weight:800;letter-spacing:-.01em}' +
      '#xia-pwa p{margin:6px 0 0;font-size:13.5px;line-height:1.45;opacity:.78}' +
      '#xia-pwa ol{margin:14px 0 0;padding:12px 14px 12px 32px;border-radius:18px;background:var(--md-sys-color-surface-container,#EEF4EF);font-size:13px;line-height:1.55;font-weight:600}' +
      '#xia-pwa .xp-row{display:flex;gap:10px;margin-top:16px}' +
      '#xia-pwa button{flex:1;border:0;border-radius:99px;padding:14px 18px;font:800 15px Inter,system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}' +
      '#xia-pwa .xp-go{background:var(--md-sys-color-primary,#1B6B51);color:var(--md-sys-color-on-primary,#fff)}' +
      '#xia-pwa .xp-no{flex:none;background:transparent;color:var(--md-sys-color-on-surface-variant,#404943);padding-left:20px;padding-right:20px}' +
      '@media(prefers-reduced-motion:reduce){#xia-pwa,#xia-pwa .xp-card{transition:none}}';
    document.head.appendChild(s);
  }

  function close() {
    if (!root) return;
    var r = root; root = null;
    r.classList.remove('on');
    setTimeout(function () { r.remove(); }, 450);
  }

  function steps() {
    if (IOS) return '<ol><li>Ketuk tombol <b>Bagikan</b> di Safari</li><li>Pilih <b>Tambah ke Layar Utama</b></li><li>Ketuk <b>Tambah</b></li></ol>';
    return '<ol><li>Ketuk menu <b>⋮</b> di pojok kanan atas browser</li><li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b></li></ol>';
  }

  function open() {
    if (root || document.getElementById('xia-pwa')) return;
    var canPrompt = !!deferred;
    if (!canPrompt && !IOS && !ANDROID) return;   /* desktop tanpa dukungan install: diam saja */
    css();
    root = document.createElement('div'); root.id = 'xia-pwa';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', TXT.t);
    root.innerHTML =
      '<div class="xp-card"><div class="xp-top"><div class="xp-ico"><img alt="" src="' + BASE + 'icons/piwo.png"></div>' +
      '<div><h2>' + TXT.t + '</h2><p>' + TXT.d + '</p></div></div>' +
      (canPrompt ? '' : steps()) +
      '<div class="xp-row"><button type="button" class="xp-no">Nanti</button>' +
      (canPrompt ? '<button type="button" class="xp-go">Pasang</button>' : '<button type="button" class="xp-go">Mengerti</button>') +
      '</div></div>';
    document.body.appendChild(root);
    requestAnimationFrame(function () { requestAnimationFrame(function () { root && root.classList.add('on'); }); });

    root.querySelector('.xp-no').addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    root.querySelector('.xp-go').addEventListener('click', function () {
      if (!deferred) { close(); return; }
      var d = deferred; deferred = null;
      close();
      try {
        d.prompt();
        d.userChoice.then(function (c) { if (c && c.outcome === 'accepted') ls(false, K_DONE, '1'); });
      } catch (e) {}
    });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  }

  /* tunggu intro Piwo selesai & event install (maks ~3 dtk setelah halaman siap), lalu tampilkan */
  function start() {
    var t0 = Date.now(), introGone = 0;
    var iv = setInterval(function () {
      var intro = document.documentElement.classList.contains('piwo-intro');
      if (intro) { introGone = 0; if (Date.now() - t0 > 25000) clearInterval(iv); return; }
      if (!introGone) introGone = Date.now();
      if (document.hidden) return;
      if (deferred || Date.now() - introGone > 3000) { clearInterval(iv); setTimeout(open, 600); }
    }, 400);
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
