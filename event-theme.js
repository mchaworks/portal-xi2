/* XI.2 Creative Lab — Tema Event + Koleksi (collectible)
   Cara kerja:
   - Tiap tema event didaftarkan di EVENTS (tanggal mulai/akhir dalam WIB, UTC+7).
   - Di tanggal event tema aktif otomatis untuk semua pengunjung, dan ada tombol "Klaim".
   - Yang sudah klaim, tema-nya masuk Koleksi (disimpan di browser: localStorage 'xia-collection')
     dan bisa dipasang lagi kapan saja. Yang tidak klaim, balik ke tampilan biasa besoknya.
   - Preview/tes: tambahkan ?evtdate=2026-11-25 ke URL (bertahan selama tab dibuka). ?evtdate= untuk mematikan.
   Skrip ini dimuat di <head> supaya atribut tema terpasang sebelum halaman pertama dicat. */
(function () {
  'use strict';
  var root = document.documentElement;
  var LS_COL = 'xia-collection', LS_PICK = 'xia-event-pick', SS_DATE = 'xia-evtdate';

  /* ---------- registri event ---------- */
  var EVENTS = [{
    id: 'hari-guru-2026',
    attr: 'hari-guru',
    name: 'Papan Tulis & Apel Emas',
    short: 'Hari Guru 2026',
    series: 'Hari Besar',
    rarity: 'Langka',
    start: '2026-11-25', end: '2026-11-25',
    dateLabel: '25 Nov 2026',
    codePrefix: 'HG26',
    themeColor: { light: '#FCF7E8', dark: '#16231F' },
    title: 'Selamat Hari Guru Nasional — XI.2 Creative Lab',
    banner: 'Selamat Hari Guru Nasional<b class="evt-bd"> · 25 November 2026</b>',
    hero: {
      hero_badge: 'Selamat Hari Guru Nasional • 25 November 2026',
      hero_title_1: 'Terima kasih, Guru,',
      hero_title_highlight: 'kami tumbuh',
      hero_title_2: 'karena kalian.',
      hero_description: 'Untuk setiap penjelasan yang diulang dengan sabar, dan setiap doa yang tak pernah kami dengar. Dari seluruh {class_name}: terima kasih, Bapak dan Ibu Guru.'
    },
    greet: { head: 'Selamat Hari Guru Nasional', defTo: 'Bapak & Ibu Guru', defMsg: 'Terima kasih sudah sabar mengajar kami. Semoga Bapak dan Ibu selalu sehat dan bahagia.', foot: 'XI.2 Creative Lab • 25 November 2026' }
  }];

  /* ---------- util ---------- */
  function qp(n) { try { return new URLSearchParams(location.search).get(n); } catch (e) { return null; } }
  var SIM = null;
  /* Dikosongkan: tema ikut tanggal asli (WIB), tampil 25 Nov 2026 saja lalu balik normal otomatis. Tes: ?evtdate=2026-11-25 */
  var FORCE_DATE = '';
  try {
    var q = qp('evtdate');
    if (q !== null) { if (/^\d{4}-\d{2}-\d{2}$/.test(q)) sessionStorage.setItem(SS_DATE, q); else sessionStorage.removeItem(SS_DATE); }
    SIM = sessionStorage.getItem(SS_DATE) || FORCE_DATE;
  } catch (e) {}
  /* tanggal sekarang di WIB (UTC+7), format YYYY-MM-DD */
  function today() { return SIM || new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10); }
  function isLive(e) { var t = today(); return t >= e.start && t <= e.end; }
  function started(e) { return today() >= e.start; }

  function loadCol() { try { var o = JSON.parse(localStorage.getItem(LS_COL) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function saveCol(o) { try { localStorage.setItem(LS_COL, JSON.stringify(o)); } catch (e) {} }
  function getPick() { try { return localStorage.getItem(LS_PICK) || ''; } catch (e) { return ''; } }
  function setPick(v) { try { if (v) localStorage.setItem(LS_PICK, v); else localStorage.removeItem(LS_PICK); } catch (e) {} }
  function owned(e) { return !!loadCol()[e.id]; }
  function isActive(e) {
    if (isLive(e)) return getPick() !== 'off:' + e.id;
    return started(e) && owned(e) && getPick() === e.id;
  }

  /* ---------- pasang tema (sinkron, sebelum halaman dicat) ---------- */
  var ev = null;
  for (var i = 0; i < EVENTS.length; i++) { if (isActive(EVENTS[i])) { ev = EVENTS[i]; break; } }
  window.XIA_EVENT = ev ? { active: true, id: ev.id, hero: ev.hero, title: ev.title, live: isLive(ev) } : { active: false };
  if (ev) root.setAttribute('data-event', ev.attr); else root.removeAttribute('data-event');

  var anyStarted = EVENTS.some(started);
  var rm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  if (anyStarted) { /* font kapur */
    try {
      var fl = document.createElement('link');
      fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap';
      document.head.appendChild(fl);
    } catch (e) {}
  }

  function metaColor() {
    if (!ev) return;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', root.getAttribute('data-mode') === 'dark' ? ev.themeColor.dark : ev.themeColor.light);
  }
  window.addEventListener('xia-modechange', metaColor);

  /* ---------- ikon & gambar (SVG inline) ---------- */
  var ICON_COL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="12" height="16" rx="2.5"/><path d="M4.5 7.5V18a3 3 0 0 0 3 3H16"/><path d="m14 8 .95 1.9 2.1.3-1.5 1.45.35 2.1L14 12.8l-1.9 1 .35-2.1-1.5-1.45 2.1-.3z"/></svg>';
  var APPLE = '<svg viewBox="0 0 200 170" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M98 58c-16-14-46-6-46 26 0 30 22 52 46 52s46-22 46-52c0-32-30-40-46-26z" fill="#FFD966" stroke="#F3EFDD" stroke-width="3.5"/>' +
    '<path d="M98 58c0-12 5-22 14-30" stroke="#F3EFDD" stroke-width="4"/>' +
    '<path d="M104 42c10-10 24-10 32-3-7 10-22 12-32 3z" fill="#86BFA6" stroke="#F3EFDD" stroke-width="3"/>' +
    '<path d="M76 84c0-10 6-17 14-19" stroke="#fff" stroke-opacity=".7" stroke-width="5"/>' +
    '<g transform="rotate(38 162 104)"><rect x="154" y="58" width="16" height="74" rx="3" fill="#D4492F" stroke="#F3EFDD" stroke-width="3"/><path d="M154 132h16l-8 18z" fill="#F3EFDD"/><rect x="154" y="58" width="16" height="12" rx="3" fill="#E8A33D" stroke="#F3EFDD" stroke-width="3"/></g>' +
    '<text x="22" y="150" font-family="Caveat,cursive" font-weight="700" font-size="40" fill="#F3EFDD" stroke="none">A+</text></svg>';
  var APPLE_SM = '<svg viewBox="0 0 40 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c-4-4-12-2-12 6 0 8 5 14 12 14s12-6 12-14c0-8-8-10-12-6z" fill="#FFD966" stroke="#F3EFDD" stroke-width="1.8"/><path d="M20 13c0-3 1-5 3-7" stroke="#F3EFDD" stroke-width="2"/><path d="M22 9c2-2 6-2 8 0-2 3-6 3-8 0z" fill="#86BFA6"/></svg>';
  var APPLE_LINE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7.5c-2.2-1.8-6-.8-6 3.4 0 4 2.6 7.6 6 7.6s6-3.6 6-7.6c0-4.2-3.8-5.2-6-3.4z"/><path d="M12 7.5c0-1.7.7-3 1.9-4"/></svg>';
  var CAP = '<svg class="evt-cap" viewBox="0 0 192 192" aria-hidden="true"><ellipse cx="96" cy="57" rx="36" ry="5" fill="#000" opacity=".18"/><g transform="rotate(-6 96 40)"><path d="M62 28v20q34 16 68 0V28z" fill="#172821" stroke="#0b1511" stroke-width="2" stroke-linejoin="round"/><path d="M66 48q30 12 60 0" fill="none" stroke="#2f5646" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M42 22 96 36l54-14v5L96 41 42 27z" fill="#0f1a16" stroke="#0b1511" stroke-width="2" stroke-linejoin="round"/><path d="M96 10 150 22 96 36 42 22z" fill="#20352D" stroke="#0b1511" stroke-width="2" stroke-linejoin="round"/><path d="M96 13 130 20.500" fill="none" stroke="#3b6453" stroke-width="2" stroke-linecap="round" opacity=".55"/><path d="M96 23Q122 28 143 24v20" fill="none" stroke="#FFD966" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="96" cy="23" r="3.600" fill="#FFD966" stroke="#C99A1E" stroke-width="1.4"/><path d="M139 43h8l2 12h-12z" fill="#FFD966" stroke="#C99A1E" stroke-width="1.4" stroke-linejoin="round"/><path d="M141 55v5M143 55v6M145 55v5" stroke="#FFD966" stroke-width="1.6" stroke-linecap="round"/></g></svg>';
  function dsvg(inner) { return '<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  var D_APPLE = dsvg('<path d="M30 18c-6-5-16-2-16 9 0 10 7 18 16 18s16-8 16-18c0-11-10-14-16-9z"/><path d="M30 18c0-5 2-9 6-12"/><path d="M33 12c4-4 9-4 12-1-3 5-9 5-12 1z"/>');
  var D_PENCIL = dsvg('<path d="M12 48 L16 36 L40 12 L48 20 L24 44 Z"/><path d="M16 36 L24 44"/><path d="M36 16 L44 24"/><path d="M12 48 L18 46"/>');
  var D_STAR = dsvg('<path d="m30 8 6.500 13.500 14.800 2-10.800 10.300 2.700 14.700L30 41.500 16.800 48.500l2.700-14.700L8.700 23.500l14.800-2z"/>');
  var D_BOOK = dsvg('<path d="M8 14c8-3 16-3 22 3v30c-6-6-14-6-22-3z"/><path d="M52 14c-8-3-16-3-22 3v30c6-6 14-6 22-3z"/>');
  var D_BULB = dsvg('<path d="M22 40c0-5-8-7-8-16a16 16 0 0 1 32 0c0 9-8 11-8 16z"/><path d="M23 47h14M25 53h10"/>');

  /* ---------- helper DOM ---------- */
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function haptic(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {} }
  var toastT;
  function toast(msg) {
    var t = document.querySelector('.evt-toast');
    if (!t) { t = el('div', 'evt-toast'); t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; void t.offsetWidth; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2400);
  }
  function mkCode(e) {
    var A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', s = '', r;
    try { r = new Uint8Array(4); crypto.getRandomValues(r); } catch (x) { r = [Math.random() * 255, Math.random() * 255, Math.random() * 255, Math.random() * 255]; }
    for (var i = 0; i < 4; i++) s += A.charAt(Math.floor(r[i]) % A.length);
    return e.codePrefix + '-' + s;
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }); } catch (e) { return iso.slice(0, 10); }
  }

  /* jalankan fn setelah splash pembuka Piwo hilang (maks 25 dtk) */
  function afterIntro(fn, extra) {
    if (!root.classList.contains('piwo-intro')) { setTimeout(fn, extra || 0); return; }
    var done = false, mo;
    function go() { if (done) return; done = true; try { mo.disconnect(); } catch (e) {} setTimeout(fn, extra || 0); }
    try { mo = new MutationObserver(function () { if (!root.classList.contains('piwo-intro')) go(); }); mo.observe(root, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
    setTimeout(go, 25000);
  }

  /* ---------- konfeti ---------- */
  function confetti(n) {
    if (rm.matches) return;
    if (root.getAttribute('data-perf') === 'lite') n = Math.min(n, 18);
    var layer = el('div', 'evt-confetti'); layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    var cols = ['#FFD966', '#D4492F', '#F3EFDD', '#86BFA6', '#E8A33D'];
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i'), s = 6 + Math.random() * 8;
      p.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + (s * (Math.random() > .5 ? 1 : .45)) + 'px;background:' + cols[i % cols.length] + ';border-radius:' + (Math.random() > .7 ? '50%' : '2px');
      layer.appendChild(p);
      try {
        p.animate([
          { transform: 'translate3d(0,-12vh,0) rotate(0deg)', opacity: 1 },
          { transform: 'translate3d(' + (Math.random() * 160 - 80) + 'px,112vh,0) rotate(' + (Math.random() * 900 - 450) + 'deg)', opacity: 1 }
        ], { duration: 2200 + Math.random() * 1800, delay: Math.random() * 500, easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'forwards' });
      } catch (e) {}
    }
    setTimeout(function () { layer.remove(); }, 5000);
  }

  /* ---------- modal generik ---------- */
  var openModalEl = null, lastFocus = null;
  function closeModal() {
    var m = openModalEl; if (!m) return;
    openModalEl = null;
    m.classList.remove('on');
    document.removeEventListener('keydown', onKey, true);
    setTimeout(function () { m.remove(); root.classList.remove('evt-lock'); if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} } }, rm.matches ? 0 : 260);
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(); return; }
    if (e.key === 'Tab' && openModalEl) { /* kurung fokus di dalam dialog */
      var f = openModalEl.querySelectorAll('button,[href],input,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    }
  }
  function openModal(innerHtml, label) {
    if (openModalEl) { openModalEl.remove(); openModalEl = null; }
    lastFocus = document.activeElement;
    var m = el('div', 'evt-modal');
    var d = el('div', 'evt-dlg', innerHtml);
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', label || 'Dialog');
    m.appendChild(d);
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
    document.body.appendChild(m);
    root.classList.add('evt-lock');
    openModalEl = m;
    document.addEventListener('keydown', onKey, true);
    requestAnimationFrame(function () { m.classList.add('on'); var x = d.querySelector('.evt-x'); if (x) x.focus(); });
    var xs = d.querySelectorAll('[data-evt-close]');
    for (var i = 0; i < xs.length; i++) xs[i].addEventListener('click', closeModal);
    return d;
  }

  /* ---------- kartu koleksi ---------- */
  function cardHtml(e, state, rec) {
    if (state === 'locked') {
      return '<div class="evt-card locked" aria-label="Kartu terkunci"><div class="evt-in"><div class="evt-art">' + APPLE + '</div><div class="evt-meta"><span class="evt-rar">' + e.rarity + '</span><div class="evt-nm">' + e.name + '</div><div class="evt-dt">' + e.short.toUpperCase() + '</div></div></div></div>';
    }
    return '<div class="evt-card' + (state === 'use' ? ' on-use' : '') + '" data-tilt tabindex="0" aria-label="Kartu ' + e.short + '"><div class="evt-in"><div class="evt-art">' + APPLE + '</div><div class="evt-meta"><span class="evt-rar">' + e.rarity + ' · ' + e.series + '</span><div class="evt-nm">' + e.name + '</div><div class="evt-dt">' + e.short.toUpperCase() + (rec ? ' • ' + rec.code : '') + '</div></div></div></div>';
  }
  function bindTilt(root_) {
    if (rm.matches || root.getAttribute('data-perf') === 'lite') return;
    var cards = root_.querySelectorAll('[data-tilt]');
    Array.prototype.forEach.call(cards, function (c) {
      function mv(ev_) {
        var r = c.getBoundingClientRect(), x = (ev_.clientX - r.left) / r.width, y = (ev_.clientY - r.top) / r.height;
        c.classList.add('tilting');
        c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        c.style.setProperty('--ry', ((x - .5) * 16).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 16).toFixed(2) + 'deg');
      }
      function rs() { c.classList.remove('tilting'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); c.style.setProperty('--mx', '50%'); c.style.setProperty('--my', '50%'); }
      c.addEventListener('pointermove', mv); c.addEventListener('pointerleave', rs); c.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') rs(); });
    });
  }

  /* ---------- aksi ---------- */
  function claim(e) {
    var c = loadCol();
    if (!c[e.id]) { c[e.id] = { at: new Date().toISOString(), code: mkCode(e) }; saveCol(c); }
    setPick(''); /* besoknya balik normal; dipasang lagi lewat Koleksi */
    haptic(18);
    refreshBtn();
    var t = document.querySelector('.evt-teaser'); if (t) { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 400); }
    reveal(e);
  }
  function applyTheme(e, on) {
    if (isLive(e)) setPick(on ? e.id : 'off:' + e.id); else setPick(on ? e.id : '');
    toast(on ? 'Memasang tema…' : 'Kembali ke tampilan biasa…');
    setTimeout(function () { location.reload(); }, 450);
  }
  function reveal(e) {
    var rec = loadCol()[e.id];
    var d = openModal(
      '<div class="evt-reveal"><div class="evt-hd"><div><h2>Masuk koleksi!</h2><p class="evt-sub">Tema <b>' + e.name + '</b> sekarang jadi punyamu. Pasang lagi kapan saja dari menu Koleksi, bahkan setelah hari H lewat.</p></div><button class="evt-x" data-evt-close aria-label="Tutup">✕</button></div>' +
      '<div class="evt-cardwrap">' + cardHtml(e, 'use', rec) + '</div>' +
      '<p class="evt-cap-info">Kode kolektor<br><span class="evt-code">' + rec.code + '</span><br>Diklaim ' + fmtDate(rec.at) + '</p>' +
      '<div class="evt-actions" style="margin-top:14px"><button class="evt-btn" data-evt-close>Mantap</button><button class="evt-btn ghost" data-evt-open-col>Lihat koleksi</button></div></div>', 'Tema masuk koleksi');
    bindTilt(d);
    var o = d.querySelector('[data-evt-open-col]'); if (o) o.addEventListener('click', function () { closeModal(); setTimeout(openSheet, 300); });
    setTimeout(function () { confetti(46); }, 350);
  }

  function openSheet() {
    var d = openModal('<div id="evt-sheet-body"></div>', 'Koleksi tema');
    renderSheet(d.querySelector('#evt-sheet-body'));
  }
  function renderSheet(host) {
    var col = loadCol(), h = '';
    h += '<div class="evt-hd"><div><h2>Koleksi Tema</h2><p class="evt-sub">Tema spesial hari besar. Cuma bisa diklaim di hari-H-nya, setelah itu jadi koleksi yang bisa dipasang kapan pun.</p></div><button class="evt-x" data-evt-close aria-label="Tutup">✕</button></div><div class="evt-grid">';
    EVENTS.forEach(function (e) {
      if (!started(e)) return;
      var rec = col[e.id], live = isLive(e), act = isActive(e);
      h += '<div class="evt-cardwrap">';
      if (rec) {
        h += cardHtml(e, act ? 'use' : 'own', rec);
        h += '<p class="evt-cap-info"><b>' + e.name + '</b><br>Diklaim ' + fmtDate(rec.at) + ' · ' + rec.code + '</p><div class="evt-actions">';
        h += act ? '<button class="evt-btn ghost" data-evt-act="off" data-id="' + e.id + '">Lepas tema</button>' : '<button class="evt-btn" data-evt-act="on" data-id="' + e.id + '">Pasang tema</button>';
        if (e.greet) h += '<button class="evt-btn ghost" data-evt-act="greet" data-id="' + e.id + '">Tulis ucapan</button>';
        h += '</div>';
      } else if (live) {
        h += cardHtml(e, 'own', null);
        h += '<p class="evt-cap-info"><b>' + e.name + '</b><br>Tersedia hari ini saja.</p><div class="evt-actions"><button class="evt-btn warm" data-evt-act="claim" data-id="' + e.id + '">Klaim sekarang</button></div>';
      } else {
        h += cardHtml(e, 'locked', null);
        h += '<p class="evt-cap-info"><b>Belum diklaim</b><br>Tema ini cuma bisa diklaim pada ' + e.dateLabel + '.</p>';
      }
      h += '</div>';
    });
    h += '<div class="evt-cardwrap"><div class="evt-card soon"><div class="evt-in"><div class="evt-art"><span class="evt-q">?</span></div><div class="evt-meta"><div class="evt-nm" style="color:inherit">Segera hadir</div></div></div></div><p class="evt-cap-info">Tema berikutnya menyusul di hari besar selanjutnya.</p></div>';
    h += '</div>';
    if (SIM) h += '<p class="evt-foot">Mode simulasi tanggal: <b>' + SIM + '</b>. <a data-evt-act="reset">Reset koleksi & pilihan</a> · <a data-evt-act="endsim">Matikan simulasi</a></p>';
    host.innerHTML = h;
    bindTilt(host);
    Array.prototype.forEach.call(host.querySelectorAll('[data-evt-close]'), function (b) { b.addEventListener('click', closeModal); });
    Array.prototype.forEach.call(host.querySelectorAll('[data-evt-act]'), function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-evt-act'), e = EVENTS.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
        if (a === 'claim' && e) { closeModal(); setTimeout(function () { claim(e); }, 280); }
        else if (a === 'on' && e) applyTheme(e, true);
        else if (a === 'off' && e) applyTheme(e, false);
        else if (a === 'greet' && e) { closeModal(); setTimeout(function () { openGreeting(e); }, 280); }
        else if (a === 'reset') { try { localStorage.removeItem(LS_COL); localStorage.removeItem(LS_PICK); } catch (x) {} location.reload(); }
        else if (a === 'endsim') { try { sessionStorage.removeItem(SS_DATE); } catch (x) {} location.href = location.pathname; }
      });
    });
  }

  /* ---------- kartu ucapan (PNG dari canvas) ---------- */
  function wrap(ctx, text, maxW) {
    var words = String(text).replace(/\s+/g, ' ').trim().split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function chalk(ctx, txt, x, y, color) {
    ctx.fillStyle = color; ctx.globalAlpha = .35; ctx.fillText(txt, x + 1.5, y + 1.5);
    ctx.globalAlpha = .95; ctx.fillText(txt, x, y); ctx.globalAlpha = 1;
  }
  function drawGreeting(cv, g, data) {
    var W = 1080, H = 1350, ctx = cv.getContext('2d');
    cv.width = W; cv.height = H;
    var wood = ctx.createLinearGradient(0, 0, W, H); wood.addColorStop(0, '#B98550'); wood.addColorStop(.5, '#9C6B38'); wood.addColorStop(1, '#B07A43');
    ctx.fillStyle = wood; ctx.fillRect(0, 0, W, H);
    var bd = ctx.createRadialGradient(W / 2, H * .3, 80, W / 2, H / 2, H * .75); bd.addColorStop(0, '#2B4A3E'); bd.addColorStop(1, '#16231F');
    ctx.fillStyle = bd; ctx.fillRect(34, 34, W - 68, H - 68);
    ctx.strokeStyle = 'rgba(243,239,221,.32)'; ctx.lineWidth = 3; ctx.setLineDash([16, 12]); ctx.strokeRect(66, 66, W - 132, H - 132); ctx.setLineDash([]);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    /* apel emas */
    ctx.save(); ctx.translate(W / 2, 214); ctx.scale(1.15, 1.15);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#F3EFDD';
    ctx.beginPath(); ctx.moveTo(0, -46); ctx.bezierCurveTo(-24, -70, -66, -58, -66, -14); ctx.bezierCurveTo(-66, 28, -34, 58, 0, 58); ctx.bezierCurveTo(34, 58, 66, 28, 66, -14); ctx.bezierCurveTo(66, -58, 24, -70, 0, -46); ctx.closePath();
    ctx.fillStyle = '#FFD966'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -46); ctx.quadraticCurveTo(2, -70, 16, -88); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -66); ctx.bezierCurveTo(22, -84, 46, -84, 58, -72); ctx.bezierCurveTo(48, -54, 22, -52, 8, -66); ctx.fillStyle = '#86BFA6'; ctx.fill(); ctx.stroke();
    ctx.restore();
    var F = "Caveat,'Bricolage Grotesque',cursive";
    ctx.font = '700 104px ' + F; if (ctx.measureText(g.head).width > W - 200) ctx.font = '700 84px ' + F;
    chalk(ctx, g.head, W / 2, 410, '#FFD966');
    ctx.font = '700 66px ' + F; chalk(ctx, 'Untuk ' + data.to, W / 2, 500, '#F3EFDD');
    /* garis kapur */
    ctx.strokeStyle = 'rgba(255,217,102,.8)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2 - 170, 534); for (var k = 0; k < 8; k++) ctx.quadraticCurveTo(W / 2 - 170 + k * 42.5 + 10, 534 + (k % 2 ? 9 : -9), W / 2 - 170 + (k + 1) * 42.5, 534); ctx.stroke();
    ctx.font = '600 70px ' + F;
    var lines = wrap(ctx, data.msg, W - 240).slice(0, 8), y = 640;
    lines.forEach(function (ln) { chalk(ctx, ln, W / 2, y, '#F3EFDD'); y += 88; });
    if (data.from) { ctx.font = '700 62px ' + F; ctx.textAlign = 'right'; chalk(ctx, '— ' + data.from, W - 130, Math.max(y + 40, 1090), '#FFB4A5'); ctx.textAlign = 'center'; }
    ctx.font = '600 28px Inter,system-ui,sans-serif'; ctx.fillStyle = 'rgba(243,239,221,.62)'; ctx.fillText(g.foot, W / 2, H - 100);
    /* kapur & penghapus di dasar papan */
    ctx.fillStyle = '#F3EFDD'; ctx.fillRect(130, H - 76, 74, 14); ctx.fillStyle = '#FFD966'; ctx.fillRect(214, H - 76, 54, 14);
  }
  function openGreeting(e) {
    var g = e.greet; if (!g) return;
    var d = openModal(
      '<div class="evt-hd"><div><h2>Tulis ucapan</h2><p class="evt-sub">Jadi kartu papan tulis yang bisa disimpan atau dibagikan ke guru.</p></div><button class="evt-x" data-evt-close aria-label="Tutup">✕</button></div>' +
      '<canvas class="evt-prev" id="evt-cv" aria-label="Pratinjau kartu ucapan"></canvas>' +
      '<label class="evt-field"><span>Untuk</span><input id="evt-to" maxlength="30" autocomplete="off" placeholder="' + g.defTo + '"></label>' +
      '<label class="evt-field"><span>Ucapan</span><textarea id="evt-msg" rows="3" maxlength="140"></textarea><small id="evt-cnt"></small></label>' +
      '<label class="evt-field"><span>Dari</span><input id="evt-from" maxlength="30" autocomplete="off" placeholder="Namamu (boleh dikosongkan)"></label>' +
      '<div class="evt-actions"><button class="evt-btn" id="evt-save">Simpan gambar</button><button class="evt-btn ghost" id="evt-share" hidden>Bagikan</button></div>', 'Tulis ucapan Hari Guru');
    var cv = d.querySelector('#evt-cv'), to = d.querySelector('#evt-to'), msg = d.querySelector('#evt-msg'), fr = d.querySelector('#evt-from'), cnt = d.querySelector('#evt-cnt');
    msg.value = g.defMsg;
    function data() { return { to: to.value.trim() || g.defTo, msg: msg.value.trim() || g.defMsg, from: fr.value.trim() }; }
    var tm;
    function draw() { cnt.textContent = msg.value.length + '/140'; drawGreeting(cv, g, data()); }
    function later() { clearTimeout(tm); tm = setTimeout(draw, 120); }
    [to, msg, fr].forEach(function (i) { i.addEventListener('input', later); });
    var fp = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('700 80px Caveat'), document.fonts.load('600 70px Caveat')]) : Promise.resolve();
    draw(); fp.then(draw, draw);
    function blob(cb) { cv.toBlob(cb, 'image/png'); }
    d.querySelector('#evt-save').addEventListener('click', function () {
      drawGreeting(cv, g, data());
      blob(function (b) {
        if (!b) return toast('Gagal membuat gambar');
        var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ucapan-hari-guru.png';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast('Kartu disimpan'); confetti(26);
      });
    });
    var sh = d.querySelector('#evt-share');
    try { if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] })) sh.hidden = false; } catch (x) {}
    sh.addEventListener('click', function () {
      drawGreeting(cv, g, data());
      blob(function (b) {
        if (!b) return;
        var f = new File([b], 'ucapan-hari-guru.png', { type: 'image/png' });
        navigator.share({ files: [f], title: g.head, text: g.head + ' 🍎' }).catch(function () {});
      });
    });
  }

  /* ---------- tombol koleksi di header ---------- */
  var colBtns = [];
  function needDot() { return EVENTS.some(function (e) { return isLive(e) && !owned(e); }); }
  function refreshBtn() {
    colBtns.forEach(function (b) {
      var dot = b.querySelector('.evt-dot');
      if (needDot()) { if (!dot) b.appendChild(el('span', 'evt-dot')); } else if (dot) dot.remove();
    });
  }
  function mountButton() {
    if (!anyStarted) return;
    var mb = document.querySelector('[data-xia-mode]'); if (!mb || !mb.parentNode) return;
    var b = el('button', 'xia-mode-btn evt-col-btn', ICON_COL);
    b.type = 'button'; b.setAttribute('aria-label', 'Koleksi tema'); b.title = 'Koleksi tema';
    b.addEventListener('click', function () { haptic(10); openSheet(); });
    mb.parentNode.insertBefore(b, mb);
    colBtns.push(b); refreshBtn();
  }

  /* ---------- pita, dekor, topi ---------- */
  function mountBanner() {
    if (!ev || document.querySelector('.evt-banner')) return;
    try { if (sessionStorage.getItem('evt-banner-x-' + ev.id)) return; } catch (e) {}
    var b = el('div', 'evt-banner',
      APPLE_LINE.replace('<svg ', '<svg style="color:#FFD966" ') + '<span>' + ev.banner + '</span>' +
      (ev.greet ? '<button type="button" class="evt-b-btn">Tulis ucapan</button>' : '') +
      '<button type="button" class="evt-b-x" aria-label="Tutup pita">✕</button>');
    b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Ucapan Hari Guru');
    document.body.insertBefore(b, document.body.firstChild);
    var gb = b.querySelector('.evt-b-btn'); if (gb) gb.addEventListener('click', function () { openGreeting(ev); });
    b.querySelector('.evt-b-x').addEventListener('click', function () { b.remove(); try { sessionStorage.setItem('evt-banner-x-' + ev.id, '1'); } catch (e) {} });
  }
  function mountDeco() {
    if (!ev || document.querySelector('.evt-deco')) return;
    var items = [
      ['94%', '45%', '50px', '-14deg', '9s', '0s', D_PENCIL, '#A83A2A'],
      ['91%', '24%', '54px', '12deg', '11s', '-3s', D_APPLE, '#D4492F'],
      ['6%', '62%', '44px', '8deg', '10s', '-5s', D_STAR, '#B8860B'],
      ['92%', '66%', '56px', '-10deg', '12s', '-2s', D_BOOK, '#1F5A47'],
      ['47%', '90%', '46px', '6deg', '9.5s', '-6s', D_BULB, '#B8860B'],
      ['86%', '86%', '40px', '14deg', '10.5s', '-1s', D_STAR, '#D4492F'],
      ['2%', '84%', '52px', '-8deg', '11.5s', '-4s', D_PENCIL, '#1F5A47'],
      ['78%', '10%', '36px', '-6deg', '10s', '-7s', '<b style="font-weight:700">A+</b>', '#D4492F', 1],
      ['12%', '38%', '30px', '5deg', '12s', '-2s', '<b style="font-weight:700">ABC</b>', '#1F5A47', 1]
    ];
    var layer = el('div', 'evt-deco'); layer.setAttribute('aria-hidden', 'true');
    items.forEach(function (it) {
      var s = el('span', it[8] ? 'evt-tx' : '', it[6]);
      s.style.cssText = '--x:' + it[0] + ';--y:' + it[1] + ';--s:' + it[2] + ';--r:' + it[3] + ';--t:' + it[4] + ';--d:' + it[5] + ';--c:' + it[7];
      layer.appendChild(s);
    });
    document.body.appendChild(layer);
  }
  function mountCap() {
    var b = document.getElementById('header-badge-code');
    if (b && ev && !b.querySelector('.evt-cap')) b.insertAdjacentHTML('beforeend', CAP);
    var sp = document.getElementById('hero-spinning-badge');
    if (sp && ev) sp.textContent = 'A+';
  }

  /* ---------- teaser klaim ---------- */
  function mountTeaser() {
    var e = EVENTS.filter(function (x) { return isLive(x) && !owned(x); })[0];
    if (!e) return;
    try { if (sessionStorage.getItem('evt-teaser-x-' + e.id)) return; } catch (x) {}
    var t = el('div', 'evt-teaser',
      '<div class="evt-mini"><div>' + APPLE_SM + '</div></div>' +
      '<div class="evt-tt"><b>Tema langka, cuma hari ini</b><span>Klaim "' + e.name + '" buat dikoleksi.</span></div>' +
      '<button class="evt-btn" type="button">Klaim</button><button class="evt-tx" type="button" aria-label="Tutup">✕</button>');
    t.setAttribute('role', 'region'); t.setAttribute('aria-label', 'Klaim tema Hari Guru');
    document.body.appendChild(t);
    t.querySelector('.evt-btn').addEventListener('click', function () { claim(e); });
    t.querySelector('.evt-tx').addEventListener('click', function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 400); try { sessionStorage.setItem('evt-teaser-x-' + e.id, '1'); } catch (x) {} });
    afterIntro(function () { t.classList.add('on'); }, 900);
  }

  ready(function () {
    metaColor();
    mountButton();
    if (ev) {
      mountBanner(); mountDeco(); mountCap();
      var k = 'evt-confetti-' + ev.id, first = true;
      try { first = !sessionStorage.getItem(k); sessionStorage.setItem(k, '1'); } catch (e) {}
      if (first && isLive(ev)) afterIntro(function () { confetti(34); }, 500);
    }
    mountTeaser();
    window.addEventListener('storage', function (e) { if (e.key === LS_COL || e.key === LS_PICK) refreshBtn(); });
  });

  window.XIA_EVENTS = { list: EVENTS, openCollection: openSheet, today: today };
})();
