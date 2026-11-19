/* XI.2 extras: mode pemeliharaan, pencatat kunjungan (statistik admin), daftar kelompok, PWA. */
(function () {
  'use strict';
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/[^\/]*$/, '') : './';
  var C = window.XIA_CONFIG || {};
  var ok = !!(C.SUPABASE_URL && !/YOUR_/.test(C.SUPABASE_URL) && C.SUPABASE_ANON_KEY && !/^YOUR_/.test(C.SUPABASE_ANON_KEY));
  var H = ok ? { apikey: C.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + C.SUPABASE_ANON_KEY } : {};

  function rest(path, opt) {
    opt = opt || {};
    opt.headers = Object.assign({}, H, opt.headers || {});
    return fetch(C.SUPABASE_URL + '/rest/v1/' + path, opt);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && /^https:$|^http:$/.test(location.protocol) && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).catch(function () {});
    });
  }

  if (!ok) return;

  /* ---------- Mode pemeliharaan ---------- */
  var OV_ID = 'xia-maint';
  function showMaint(msg) {
    var ov = document.getElementById(OV_ID);
    if (!ov) {
      ov = document.createElement('div');
      ov.id = OV_ID;
      ov.setAttribute('role', 'alertdialog');
      ov.setAttribute('aria-live', 'polite');
      ov.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#F5FBF6;color:#171D19';
      if (document.documentElement.getAttribute('data-mode') === 'dark') { ov.style.background = '#0E1410'; ov.style.color = '#E0E4DE'; }
      ov.innerHTML = '<div style="max-width:360px"><div style="font-size:56px;line-height:1">🛠️</div><h1 style="font-size:22px;font-weight:800;margin:16px 0 8px">Sedang diperbarui</h1><p id="xia-maint-msg" style="font-size:15px;line-height:1.5;opacity:.85;margin:0"></p></div>';
      document.body.appendChild(ov);
      document.documentElement.style.overflow = 'hidden';
    }
    ov.querySelector('#xia-maint-msg').textContent = msg || 'Web sedang diperbarui. Coba lagi sebentar ya!';
  }
  function hideMaint() {
    var ov = document.getElementById(OV_ID);
    if (ov) { ov.remove(); document.documentElement.style.overflow = ''; }
  }
  var lastMaint = 0;
  function checkMaint() {
    if (Date.now() - lastMaint < 15000) return;
    lastMaint = Date.now();
    rest('site_settings?select=key,value&key=in.(maintenance,maintenance_message)').then(function (r) { return r.ok ? r.json() : null; }).then(function (rows) {
      if (!rows) return; // gagal = anggap normal
      var S = {}; rows.forEach(function (x) { S[x.key] = x.value; });
      if (String(S.maintenance || '').toLowerCase() === 'on') showMaint(S.maintenance_message); else hideMaint();
    }).catch(function () {});
  }

  /* ---------- Statistik kunjungan ---------- */
  function deviceId() {
    try {
      var d = localStorage.getItem('xia_dev');
      if (!d) {
        d = ((window.crypto && crypto.randomUUID && crypto.randomUUID()) || (Math.random().toString(36).slice(2) + Date.now().toString(36) + 'abcdefgh')).replace(/-/g, '');
        localStorage.setItem('xia_dev', d);
      }
      return d;
    } catch (e) { return null; }
  }
  function pageName() {
    var p = location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).pop() || 'beranda';
    p = p.replace(/\.html$/, '').toLowerCase();
    return (p === 'xi2' || p === 'portal-xi2-main') ? 'beranda' : p.slice(0, 40);
  }
  function track() {
    var dev = deviceId(), page = pageName();
    if (!dev || dev.length < 8) return;
    try {
      var k = 'xia_pv_' + page, last = +sessionStorage.getItem(k) || 0;
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(k, String(Date.now()));
    } catch (e) {}
    rest('page_views', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ page: page, device_id: dev.slice(0, 64) }) }).catch(function () {});
  }

  /* ---------- Daftar kelompok (hanya halaman utama) ---------- */
  var lastGroups = 0, groupSig = '';
  function renderGroups(rows) {
    var sig = JSON.stringify(rows);
    if (sig === groupSig) return;
    groupSig = sig;
    var sec = document.getElementById('kelompok');
    if (!rows.length) { if (sec) sec.remove(); return; }
    if (!sec) {
      var anchor = document.getElementById('papan');
      if (!anchor) return;
      sec = document.createElement('section');
      sec.id = 'kelompok';
      sec.className = 'space-y-6';
      anchor.parentNode.insertBefore(sec, anchor);
    }
    var byTitle = {}, order = [];
    rows.forEach(function (g) { if (!byTitle[g.title]) { byTitle[g.title] = []; order.push(g.title); } byTitle[g.title].push(g); });
    sec.innerHTML = '<div><span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-m3-primary mb-1.5"><span class="material-symbols-rounded text-[16px]">groups</span>Kerja Bareng</span><h2 class="font-display font-extrabold text-3xl text-m3-onSurface">Daftar Kelompok</h2></div>' +
      order.map(function (t) {
        return '<div class="space-y-3"><h3 class="font-display font-bold text-lg text-m3-onSurface">' + esc(t) + '</h3><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">' +
          byTitle[t].map(function (g) {
            var names = String(g.members || '').split(/[,\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
            return '<div class="bg-m3-surfaceLow rounded-3xl border border-m3-outlineVariant/40 p-5"><div class="flex items-center justify-between mb-2"><b class="font-display text-m3-onSurface">' + esc(g.group_name) + '</b><span class="text-xs font-semibold text-m3-onSurfaceVariant">' + names.length + ' orang</span></div><ol class="text-sm text-m3-onSurfaceVariant space-y-1 list-decimal list-inside">' + names.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ol></div>';
          }).join('') + '</div></div>';
      }).join('');
  }
  function loadGroups() {
    if (!document.getElementById('papan')) return;
    if (Date.now() - lastGroups < 15000) return;
    lastGroups = Date.now();
    rest('class_groups?select=title,group_name,members,sort_order,created_at&order=sort_order.asc,created_at.asc&limit=200').then(function (r) { return r.ok ? r.json() : null; }).then(function (rows) { if (rows) renderGroups(rows); }).catch(function () {});
  }

  /* ---------- Lencana debug (?debug=1): tier perangkat + waktu frame saat scroll ---------- */
  function setupDebug() {
    if (!/[?&]debug=1/.test(location.search)) return;
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:6px;bottom:96px;z-index:2147482000;background:rgba(0,0,0,.78);color:#fff;font:11px/1.35 monospace;padding:6px 8px;border-radius:8px;pointer-events:none;white-space:pre';
    document.body.appendChild(el);
    var last = 0, worst = 0, sum = 0, n = 0, long50 = 0, scrolling = 0, tmr = 0;
    function loop(t) {
      if (last && scrolling) { var d = t - last; sum += d; n++; if (d > worst) worst = d; if (d > 50) long50++; }
      last = t; requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.addEventListener('scroll', function () { scrolling = 1; clearTimeout(tmr); tmr = setTimeout(function () { scrolling = 0; last = 0; }, 200); }, { passive: true });
    function bd() { var c = 0; document.querySelectorAll('*').forEach(function (e) { var cs = getComputedStyle(e); if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none')) c++; }); return c; }
    setInterval(function () {
      el.textContent = 'tier: ' + document.documentElement.dataset.perf + '\nfps~: ' + (n ? Math.round(1000 / (sum / n)) : '-') + '\nterburuk: ' + Math.round(worst) + ' ms\nframe>50ms: ' + long50 + '\nblur aktif: ' + bd() + '\nmem: ' + (navigator.deviceMemory || '?') + 'GB  cpu: ' + (navigator.hardwareConcurrency || '?');
    }, 1000);
  }

  function boot() { setupDebug(); checkMaint(); loadGroups(); track(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  setInterval(function () { if (!document.hidden) { checkMaint(); loadGroups(); } }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { checkMaint(); loadGroups(); } });
})();
