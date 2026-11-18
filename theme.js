/* XI.2 Creative Lab — toggle dark mode dengan animasi bubble (ala Telegram).
   Tombol: <button class="xia-mode-btn" data-xia-mode> (sudah ada di markup tiap halaman).
   Urutan: View Transition API (clip-path lingkaran dari titik tombol) -> fallback overlay lingkaran. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'xia-mode';
  var COLORS = { dark: '#0E1410', light: '#F5FBF6' };
  var rm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var busy = false;

  function stored() { try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function current() { return root.getAttribute('data-mode') === 'dark' ? 'dark' : 'light'; }
  /* pastikan data-mode selalu terisi (default terang) sebelum tombol dipakai */
  if (!root.getAttribute('data-mode')) root.setAttribute('data-mode', stored() || 'light');

  function paint(mode) {
    root.setAttribute('data-mode', mode);
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.setAttribute('content', COLORS[mode]);
    var label = mode === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';
    document.querySelectorAll('[data-xia-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', label);
      b.setAttribute('title', label);
    });
    try { window.dispatchEvent(new CustomEvent('xia-modechange', { detail: { mode: mode } })); } catch (e) {}
  }

  function haptic() { try { if (typeof triggerHaptic === 'function') triggerHaptic(12); else if (navigator.vibrate) navigator.vibrate(10); } catch (e) {} }

  function radius(x, y) {
    return Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 4;
  }

  function swap(next, x, y) {
    if (busy) return;
    busy = true;
    var done = function () { busy = false; root.classList.remove('xia-theme-switching'); };
    var r = radius(x, y);
    var EASE = 'cubic-bezier(.3,.7,.1,1)', DUR = 760;

    /* tanpa animasi: reduced motion */
    if (rm.matches) { paint(next); done(); return; }

    root.classList.add('xia-theme-switching');

    /* 1) View Transition: snapshot lama tetap, snapshot baru "dibuka" dari tombol */
    if (typeof document.startViewTransition === 'function') {
      var vt;
      try { vt = document.startViewTransition(function () { paint(next); }); } catch (e) { vt = null; }
      if (vt) {
        vt.ready.then(function () {
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: DUR, easing: EASE, pseudoElement: '::view-transition-new(root)' }
          );
        }).catch(function () {});
        vt.finished.then(done, done);
        return;
      }
    }

    /* 2) Fallback: lingkaran warna baru melebar, lalu mode diganti dan lingkaran memudar */
    var ov = document.createElement('div');
    ov.className = 'xia-mode-bubble';
    ov.style.background = COLORS[next];
    ov.style.clipPath = 'circle(0px at ' + x + 'px ' + y + 'px)';
    document.body.appendChild(ov);
    var grow = ov.animate(
      { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
      { duration: DUR * 0.8, easing: EASE, fill: 'forwards' }
    );
    grow.onfinish = function () {
      paint(next);
      var fade = ov.animate({ opacity: [1, 0] }, { duration: 260, easing: 'ease-out', fill: 'forwards' });
      fade.onfinish = function () { ov.remove(); done(); };
    };
    grow.oncancel = function () { ov.remove(); paint(next); done(); };
  }

  function toggle(btn) {
    var next = current() === 'dark' ? 'light' : 'dark';
    var b = btn.getBoundingClientRect();
    var x = b.left + b.width / 2, y = b.top + b.height / 2;
    save(next);
    haptic();
    swap(next, x, y);
  }

  function bind() {
    document.querySelectorAll('[data-xia-mode]').forEach(function (btn) {
      if (btn.__xiaMode) return;
      btn.__xiaMode = true;
      btn.addEventListener('click', function (e) { e.preventDefault(); toggle(btn); });
    });
    paint(current());
  }

  /* mode utama = terang. Gelap hanya kalau pengguna memilihnya sendiri lewat tombol. */
  /* sinkron antar tab/halaman */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light') && e.newValue !== current()) paint(e.newValue);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
