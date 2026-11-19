/*! Labz Mascot v1 — maskot interaktif (WebGL2 mesh-warp + wajah prosedural).
 *  Pakai:  const m = await XiaMascot.mount(hostEl, { bodySrc:'mascot-body.webp' });
 *          m.say('Halo!'); m.setState('thinking'); m.react('wave'); m.ask(promiseOrFn);
 *  hostEl = elemen persegi (lebar = ukuran maskot). Maskot digambar di canvas fixed layar penuh.
 */
(function (global) {
'use strict';

/* ---------------------------------------------------------------- util */
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

class Spring {
  constructor(v = 0, k = 180, c = 12) { this.x = v; this.v = 0; this.t = v; this.k = k; this.c = c; }
  step(dt) { const a = this.k * (this.t - this.x) - this.c * this.v; this.v += a * dt; this.x += this.v * dt; }
  kick(v) { this.v += v; }
}

/* ruang-rest 1024 x 1024 (sama dengan render body) */
const BASE = [512, 945];
const EYE = [[357, 450], [667, 450]], CHEEK = [[282, 506], [742, 506]], MOUTH = [512, 516];
const FR = [192, 352, 640, 256];               // kotak tekstur wajah

/* ---------------------------------------------------------------- pose */
const D = {
  ear: 0, earL: null, earR: null, arm: 0, armL: null, armR: null, foot: 0,
  open: 1, happy: 0, love: 0, dizzy: 0, wide: 0, sad: 0, lid: 0, blush: .15,
  mOpen: 0, mSmile: .35, mW: 1, mCat: 1, mWavy: 0, tear: 0, sweat: 0, sparkle: 0,
  lookX: null, lookY: null, tilt: 0, sy: 1, fast: 0, breath: 1
};
const P = {
  idle: {},
  listening: { ear: -.1, wide: .5, open: 1.06, blush: .28, mSmile: .35, lookY: .15, lookX: 0, sy: 1.02, tilt: .03 },
  thinking: { lookX: .78, lookY: -.8, mCat: 0, mWavy: 1, mSmile: 0, earL: .15, earR: -.15, armR: .5, tilt: .07, open: .92, lid: .1, blush: .1 },
  sleep: { open: 0, mOpen: .1, mCat: 0, mSmile: .2, ear: .3, blush: .35, sy: .97, lookX: 0, lookY: .2, breath: 1.8 },
  happy: { happy: 1, mOpen: .65, mW: 1.3, mCat: 0, mSmile: 1, blush: .75, arm: .3, ear: -.08, sparkle: 1 },
  giggle: { happy: 1, mOpen: .5, mCat: 0, mSmile: 1, blush: .85 },
  petted: { happy: 1, blush: 1, mCat: 1, mSmile: 1, ear: .12, fast: 1 },
  love: { love: 1, mOpen: .3, mCat: 0, mSmile: 1, blush: 1, arm: .3 },
  shy: { happy: .7, blush: 1.25, mCat: 0, mWavy: .7, lookX: -.9, lookY: .5, arm: .5, tilt: -.06, ear: .2 },
  wave: { mOpen: .45, mCat: 0, mSmile: 1, blush: .4, ear: -.12 },
  surprised: { wide: 1, open: 1.12, mOpen: .85, mW: .36, mCat: 0, mSmile: 0, ear: -.14, arm: .4, sweat: 1, fast: 1, lookX: 0, lookY: 0 },
  sad: { sad: 1, lid: .12, ear: .5, mCat: 0, mSmile: -.75, mOpen: .12, tear: 1, blush: 0, sy: .97, arm: -.12, lookY: .5, lookX: 0 },
  dizzy: { dizzy: 1, mWavy: 1, mCat: 0, ear: .22, lookX: 0, lookY: 0, fast: 1 },
  yawn: { open: .1, mOpen: 1.05, mW: .72, mCat: 0, mSmile: 0, ear: .32, lookX: 0, lookY: 0 },
  held: { wide: .75, open: 1.1, mOpen: .5, mW: .5, mCat: 0, mSmile: 0, arm: .5, ear: -.12, fast: 1 },
  air: { happy: .85, mOpen: .8, mCat: 0, mSmile: 1, mW: 1.2, arm: .45, ear: -.12, fast: 1 }
};
const MOODS = {
  happy: { mSmile: .9, blush: .5, sparkle: 1, mOpen: .12, mCat: 0 },
  sad: { sad: .8, lid: .1, mSmile: -.4, ear: .45, mCat: 0, tear: .6 },
  surprised: { wide: .8, open: 1.1, ear: -.3 },
  love: { blush: .95, mSmile: 1, sparkle: 1 },
  shy: { blush: 1, lookX: -.7, lookY: .4 }
};
const FKEYS = ['happy', 'love', 'dizzy', 'wide', 'sad', 'lid', 'blush', 'mSmile', 'mW', 'mCat', 'mWavy', 'tear', 'sweat', 'sparkle'];

/* ---------------------------------------------------------------- bunyi */
class Sfx {
  constructor() { this.on = false; this.ctx = null; this.out = null; this.vol = 2.6; this.nb = null; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const c = this.ctx = new (global.AudioContext || global.webkitAudioContext)();
      /* master: gain besar + compressor biar nyaring tapi nggak pecah */
      const m = c.createGain(); m.gain.value = this.vol;
      const k = c.createDynamicsCompressor(); k.threshold.value = -14; k.knee.value = 12; k.ratio.value = 5; k.attack.value = .003; k.release.value = .15;
      m.connect(k); k.connect(c.destination); this.out = m;
    } catch (e) { }
  }
  setVol(v) { this.vol = v; if (this.out) this.out.gain.value = v; }
  tone(f0, f1, dur, type, vol, delay) {
    if (!this.on || !this.ctx) return; const c = this.ctx, t = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol || .15, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + .03);
  }
  noise(dur, f, q, vol, delay, type) {
    if (!this.on || !this.ctx) return; const c = this.ctx, t = c.currentTime + (delay || 0);
    if (!this.nb) { const n = c.sampleRate * .3 | 0, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.nb = b; }
    const s = c.createBufferSource(); s.buffer = this.nb; const fl = c.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 1;
    const g = c.createGain(); g.gain.setValueAtTime(vol || .3, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(this.out); s.start(t, Math.random() * .1, dur);
  }
  /* ---- mesin suara imut: nada + vibrato + lowpass + attack halus ---- */
  vt(f0, f1, dur, o) {
    o = o || {}; if (!this.on || !this.ctx) return; const c = this.ctx, t = c.currentTime + (o.d || 0);
    const osc = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur * (o.glide || 1));
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vd || 18; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05); }
    lp.type = 'lowpass'; lp.frequency.value = o.lp || 5200; lp.Q.value = .5;
    const a = o.a || .012, v = o.v || .15;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(lp); lp.connect(g); g.connect(this.out); osc.start(t); osc.stop(t + dur + .03);
  }
  chirp(f0, f1, dur, v, d) { this.vt(f0, f1, dur, { type: 'triangle', v, d, vib: 30, vd: 32, lp: 4200, a: .015 }); } /* "pyu~" */
  bell(f, v, d) { this.vt(f, f, .55, { v, d, a: .004, lp: 7000 }); this.vt(f * 2.76, f * 2.76, .22, { v: v * .22, d, a: .003, lp: 7000 }); } /* kotak musik */
  boing() { this.vt(230, 620, .16, { v: .24, vib: 22, vd: 20 }); this.vt(620, 300, .2, { v: .15, d: .12, vib: 26, vd: 22 }); this.vt(300, 420, .16, { v: .08, d: .3 }); }
  squeak() { this.chirp(950, 1600, .1, .17); }
  giggle() { for (let i = 0; i < 4; i++) this.chirp(760 + i * 80, 980 + i * 95, .075, .14, i * .095); }
  blip() { this.vt(rand(620, 820), rand(560, 760), .06, { v: .07, lp: 3000 }); }
  pop() { this.vt(720, 260, .09, { v: .22, a: .004 }); this.noise(.03, 2400, .8, .08, 0, 'highpass'); }
  yawn() { this.vt(430, 210, .75, { v: .12, vib: 5, vd: 8, lp: 1800, a: .15 }); }
  /* suara khusus pet */
  munch() { for (let i = 0; i < 3; i++) { this.noise(.07, 1800 + i * 300, 1.4, .55, i * .16); this.tone(220, 120, .07, 'triangle', .18, i * .16); } }
  gulp() { this.tone(300, 120, .14, 'sine', .22, .02); }
  growl() { this.tone(110, 70, .5, 'sawtooth', .11); this.tone(95, 60, .45, 'sawtooth', .09, .12); }
  levelup() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, .16, 'triangle', .2, i * .09)); this.tone(1318, 1318, .35, 'sine', .16, .4); }
  snore() { this.tone(150, 90, .6, 'sine', .12); this.tone(140, 85, .6, 'sine', .1, .9); }
  coin() { this.tone(988, 988, .08, 'square', .1); this.tone(1319, 1319, .26, 'square', .1, .08); }
  bell() { this.tone(1320, 1320, .22, 'sine', .16); this.tone(1760, 1760, .3, 'sine', .12, .08); }
  play() { this.tone(400, 800, .1, 'triangle', .2); this.tone(600, 1200, .1, 'triangle', .2, .1); this.tone(800, 1600, .12, 'triangle', .18, .2); }

  /* ---- efek intro (imut) ---- */
  squish() { this.vt(360, 150, .18, { v: .2, vib: 30, vd: 14, lp: 1600 }); this.vt(250, 330, .12, { type: 'triangle', v: .08, d: .12, lp: 1500 }); }
  whoosh() { this.noise(.5, 900, .7, .28, 0, 'bandpass'); this.vt(300, 1400, .42, { v: .1, lp: 3200, a: .08 }); this.vt(450, 1800, .34, { type: 'triangle', v: .045, d: .05, lp: 3000 }); }
  twinkle() { [1318.5, 1568, 1976, 2637].forEach((f, i) => this.bell(f, .1, i * .075)); }
  sparkle() { this.bell([1046.5, 1174.7, 1318.5, 1568, 1760][Math.random() * 5 | 0], .08, 0); }
  slide() { this.vt(1250, 260, .6, { v: .14, vib: 9, vd: 40, lp: 3400 }); this.vt(1900, 400, .55, { type: 'triangle', v: .045, d: .02, vib: 9, vd: 50, lp: 3000 }); }
  thud() { this.vt(140, 50, .24, { v: .32, a: .004, lp: 500 }); this.noise(.12, 380, .5, .3, 0, 'lowpass'); this.vt(520, 330, .12, { type: 'triangle', v: .07, d: .04, lp: 2000 }); }
  tada() { [523.3, 659.3, 784, 1046.5].forEach((f, i) => this.bell(f, .13, i * .075)); [1318.5, 1568, 2093].forEach((f, i) => this.bell(f, .09, .34 + i * .06)); this.vt(523.3, 523.3, .7, { type: 'triangle', v: .05, d: .3, lp: 1500, a: .05 }); }
  fly() { this.vt(420, 1300, .5, { v: .1, a: .06, lp: 3200 }); this.vt(640, 1800, .44, { type: 'triangle', v: .045, d: .05, lp: 3000 }); }
  hello() { this.chirp(900, 1350, .09, .17, 0); this.chirp(1150, 1750, .13, .17, .13); } /* "pi-pyu~" */
  heart() { this.bell(1568, .08, 0); this.bell(2093, .08, .08); this.bell(2637, .06, .16); }
  peek() { this.vt(380, 640, .14, { v: .12, vib: 18, vd: 14, lp: 2400 }); } /* "mup" */
  huh() { this.chirp(1100, 1500, .1, .13, 0); this.chirp(1500, 1000, .14, .12, .12); } /* "eh?" */

  /* ---- musik latar: kotak musik + bass petik, nada pentatonik C mayor, loop 4 birama ---- */
  musicStart() {
    if (!this.on || !this.ctx || this.mus) return;
    const c = this.ctx; this.mus = c.createGain();
    this.mus.gain.setValueAtTime(.0001, c.currentTime); this.mus.gain.exponentialRampToValueAtTime(.55, c.currentTime + .7); this.mus.connect(this.out);
    this.mT = c.currentTime + .08; this.mI = 0;
    this.mTimer = setInterval(() => this._mSched(), 100); this._mSched();
  }
  _mn(f, dur, type, vol, t) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(this.mus); o.start(t); o.stop(t + dur + .03);
  }
  _mSched() {
    if (!this.mus || !this.ctx) return; const c = this.ctx, STEP = .23;
    const M = [659.25, 0, 783.99, 659.25, 523.25, 0, 587.33, 0, 659.25, 0, 783.99, 880, 783.99, 0, 659.25, 0,
      880, 0, 1046.5, 880, 783.99, 0, 659.25, 0, 587.33, 659.25, 783.99, 659.25, 523.25, 0, 0, 0];
    const B = [[130.81, 196], [110, 164.81], [174.61, 261.63], [196, 293.66]];
    while (this.mT < c.currentTime + .5) {
      const i = this.mI % 32, t = this.mT, f = M[i];
      if (f) { this._mn(f, .34, 'sine', .15, t); this._mn(f * 2, .18, 'sine', .045, t); this._mn(f * 3, .08, 'sine', .015, t); }
      if (i % 4 === 0) this._mn(B[(i / 8) | 0][(i % 8) / 4], .22, 'triangle', .15, t);
      if (i % 2 === 1) this._mn(2400, .03, 'square', .012, t);
      this.mT += STEP; this.mI++;
    }
  }
  musicStop(fade) {
    if (!this.mus || !this.ctx) return; const c = this.ctx, g = this.mus, f = fade || .6; clearInterval(this.mTimer); this.mus = null;
    try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(Math.max(.0001, g.gain.value), c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + f); } catch (e) { }
    setTimeout(() => { try { g.disconnect(); } catch (e) { } }, f * 1000 + 100);
  }
}

/* ---------------------------------------------------------------- shader */
const VS = `#version 300 es
in vec2 aPos;
uniform vec2 uHost; uniform float uUnit; uniform vec2 uView; uniform vec2 uRoot;
uniform float uRot; uniform vec2 uScale; uniform float uSway, uLag, uBreath;
uniform vec2 uEar, uArm, uFoot, uShift; uniform float uIsFace; uniform vec4 uFR;
out vec2 vUV;
vec2 rot(vec2 p, vec2 c, float a){ float s=sin(a), co=cos(a); vec2 d=p-c; return c+vec2(co*d.x-s*d.y, s*d.x+co*d.y); }
vec2 deform(vec2 p){
  float es = clamp((300.-p.y)/230.,0.,1.); es = es*es;
  float gl = exp(-pow((p.x-307.)/120.,2.)), gr = exp(-pow((p.x-717.)/120.,2.));
  vec2 q = p;
  q.x -= uEar.x*170.*es*gl; q.y += uEar.x*70.*es*gl;
  q.x += uEar.y*170.*es*gr; q.y += uEar.y*70.*es*gr;
  p = q;
  float ym = 1.-smoothstep(125.,175.,abs(p.y-585.));
  float al = (1.-smoothstep(140.,185.,p.x))*ym;
  p = rot(p, vec2(228.,500.), uArm.x*al);
  float ar = smoothstep(839.,884.,p.x)*ym;
  p = rot(p, vec2(796.,500.), -uArm.y*ar);
  float wy = smoothstep(750.,800.,p.y);
  p.y -= uFoot.x*wy*(1.-smoothstep(440.,500.,p.x)) + uFoot.y*wy*smoothstep(524.,584.,p.x);
  float h = clamp((945.-p.y)/870.,0.,1.);
  p.y = 945. + (p.y-945.)*(1.+uBreath*h);
  p.x = 512. + (p.x-512.)*(1.-uBreath*.55*h);
  p.x += uSway*h*h*90.;
  p.y += uLag*h*70.;
  vec2 B = vec2(512.,945.);
  p = B + (p-B)*uScale;
  p = rot(p, B, uRot);
  return p;
}
void main(){
  vec2 p = deform(aPos);
  if(uIsFace>.5) p += uShift;
  vec2 px = uHost + p*uUnit + uRoot;
  vec2 n = (px/uView)*2.-1.; n.y=-n.y;
  gl_Position = vec4(n,0.,1.);
  vUV = uIsFace>.5 ? (aPos-uFR.xy)/uFR.zw : aPos/1024.;
}`;
const FS = `#version 300 es
precision mediump float;
in vec2 vUV; uniform sampler2D uTex; out vec4 o;
void main(){ o = texture(uTex, vUV); }`;

function grid(x0, y0, w, h, nx, ny) {
  const pos = new Float32Array((nx + 1) * (ny + 1) * 2), idx = new Uint16Array(nx * ny * 6);
  let k = 0; for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { pos[k++] = x0 + w * i / nx; pos[k++] = y0 + h * j / ny; }
  k = 0; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.set([a, c, b, b, c, d], k); k += 6; }
  return { pos, idx };
}

/* ---------------------------------------------------------------- wajah (canvas 2D) */
function makeFuzz(n, seed) { const r = mulberry(seed); return Array.from({ length: n }, () => ({ a: r() * TAU, k: .98 + r() * .17, l: .2 + r() * .55, j: (r() - .5) * .9, al: .5 + r() * .45 })); }
const FUZZ = [makeFuzz(70, 3), makeFuzz(70, 9)];
const ell = (c, x, y, rx, ry) => { c.beginPath(); c.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), 0, 0, TAU); c.fill(); };
function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * .55); c.bezierCurveTo(x - s * 1.25, y - s * .2, x - s * .7, y - s * 1.15, x, y - s * .45); c.bezierCurveTo(x + s * .7, y - s * 1.15, x + s * 1.25, y - s * .2, x, y + s * .55); c.closePath(); }
function starPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.closePath(); }

function drawEye(c, i, F, t, openEff) {
  const side = i ? 1 : -1, k = 1 + F.wide * .13;
  const rx = 30.4 * k, ryB = 38.5 * k;
  const cx = EYE[i][0] + F.lx * 5, cy = EYE[i][1] + F.ly * 4;
  const hH = smooth(.45, .75, F.happy), hL = smooth(.45, .75, F.love), hD = smooth(.45, .75, F.dizzy);
  const aBase = (1 - hH) * (1 - hL) * (1 - hD);
  const aOpen = smooth(.1, .45, openEff), aNormal = aBase * aOpen, aClosed = aBase * (1 - aOpen);
  // bayangan lembut di sekitar mata
  const hy = cy + ryB * .25, g = c.createRadialGradient(cx, hy, rx * .3, cx, hy, rx * 1.75);
  g.addColorStop(0, 'rgba(10,50,38,.38)'); g.addColorStop(1, 'rgba(10,50,38,0)');
  c.fillStyle = g; ell(c, cx, hy, rx * 1.8, ryB * 1.6);

  if (aNormal > .01) {
    const ry = ryB * Math.max(.14, Math.min(1.12, openEff));
    c.save(); c.globalAlpha = aNormal;
    if (F.lid > .01 || F.sad > .01) {
      const o = x => side < 0 ? (cx - x) / rx : (x - cx) / rx;
      const yb = x => cy - ry + 2 * ry * F.lid + F.sad * ry * .9 * o(x);
      const xl = cx - rx * 1.7, xr = cx + rx * 1.7;
      c.beginPath(); c.moveTo(xl, yb(xl)); c.lineTo(xr, yb(xr)); c.lineTo(xr, cy + ry * 3); c.lineTo(xl, cy + ry * 3); c.closePath(); c.clip();
    }
    c.fillStyle = '#0e0a0a'; ell(c, cx, cy, rx, ry);
    const lg = c.createRadialGradient(cx, cy + ry * .5, 2, cx, cy + ry * .4, rx * .8);
    lg.addColorStop(0, 'rgba(96,150,130,.88)'); lg.addColorStop(1, 'rgba(60,100,88,.55)');
    c.fillStyle = lg; ell(c, cx + F.lx * 3, cy + ry * .4, rx * .7, ry * .5);
    const hs = 1 - F.wide * .18;
    c.fillStyle = '#fff'; ell(c, cx + rx * .33 + F.lx * 2, cy - ry * .43 + F.ly, rx * .285 * hs, ry * .29 * hs);
    c.fillStyle = 'rgba(255,255,255,.78)'; ell(c, cx - rx * .46 + F.lx * 2, cy + ry * .44, rx * .16, ry * .14);
    if (F.sparkle > .02) { c.fillStyle = 'rgba(255,255,255,' + (.9 * F.sparkle) + ')'; const p = .75 + .25 * Math.sin(t * 6 + i); starPath(c, cx - rx * .38, cy - ry * .12, rx * .3 * p * F.sparkle); c.fill(); }
    c.restore();
    c.save(); c.globalAlpha = aNormal * .9; c.lineWidth = 1.7; c.lineCap = 'round';
    for (const f of FUZZ[i]) {
      const bx = cx + Math.cos(f.a) * rx * f.k, by = cy + Math.sin(f.a) * ry * f.k, ang = f.a + PI + f.j, len = 2.5 + f.l * 3.8;
      c.strokeStyle = 'rgba(112,210,164,' + f.al + ')'; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len); c.stroke();
    }
    c.restore();
  }
  if (aClosed > .01) {
    c.save(); c.globalAlpha = aClosed; c.strokeStyle = '#1b1112'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - rx * .95, cy + 2); c.quadraticCurveTo(cx, cy + ryB * .5, cx + rx * .95, cy + 2); c.stroke(); c.restore();
  }
  if (hH > .01) {
    c.save(); c.globalAlpha = hH * (1 - hL) * (1 - hD); c.strokeStyle = '#1b1112'; c.lineWidth = 7.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - rx * 1.02, cy + ryB * .28); c.quadraticCurveTo(cx, cy - ryB * .78, cx + rx * 1.02, cy + ryB * .28); c.stroke(); c.restore();
  }
  if (hL > .01) {
    c.save(); c.globalAlpha = hL * (1 - hD); const p = 1 + .07 * Math.sin(t * 8), s = rx * 1.4 * p;
    c.fillStyle = '#ff4f7b'; heartPath(c, cx, cy, s); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; ell(c, cx - s * .38, cy - s * .38, s * .2, s * .14); c.restore();
  }
  if (hD > .01) {
    c.save(); c.globalAlpha = hD; c.fillStyle = '#f5f4ec'; ell(c, cx, cy, rx * 1.05, ryB * .95);
    c.strokeStyle = '#2a1d1d'; c.lineWidth = 3.2; c.lineJoin = 'round'; c.beginPath();
    for (let a = 0; a < 4 * PI; a += .2) { const r = a / (4 * PI) * rx * .95, aa = a * (i ? -1 : 1) + t * 9; const x = cx + Math.cos(aa) * r, y = cy + Math.sin(aa) * r * (ryB / rx) * .95; a ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); c.restore();
  }
  if (F.tear > .05) {
    const ph = (t * .55 + i * .37) % 1, ty = cy + ryB * .75 + ph * 30, tx = cx + side * rx * .62;
    c.save(); c.globalAlpha = F.tear * (1 - ph * .85); c.fillStyle = 'rgba(160,222,250,.95)';
    c.beginPath(); c.moveTo(tx, ty - 11); c.quadraticCurveTo(tx + 8, ty + 1, tx, ty + 8); c.quadraticCurveTo(tx - 8, ty + 1, tx, ty - 11); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; ell(c, tx - 2, ty, 1.6, 2.6); c.restore();
  }
}

function drawMouth(c, F, t) {
  const cx = MOUTH[0], cy = MOUTH[1], open = F.mOpen;
  const cat = F.mCat * (1 - clamp(open * 4, 0, 1)) * (1 - F.mWavy);
  const wavy = F.mWavy * (1 - clamp(open * 4, 0, 1));
  const plain = (1 - F.mCat) * (1 - clamp(open * 4, 0, 1)) * (1 - F.mWavy);
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#2e1c1e';
  if (cat > .02) {
    c.globalAlpha = cat; c.lineWidth = 4.6; const w = 26 * F.mW, d = 7 + F.mSmile * 3;
    c.beginPath(); c.moveTo(cx - w, cy); c.quadraticCurveTo(cx - w / 2, cy + d * 1.7, cx, cy);
    c.moveTo(cx, cy); c.quadraticCurveTo(cx + w / 2, cy + d * 1.7, cx + w, cy); c.stroke();
  }
  if (wavy > .02) {
    c.globalAlpha = wavy; c.lineWidth = 4.2; c.beginPath();
    for (let x = -24; x <= 24; x += 3) { const y = cy + 4 + Math.sin(x * .32 + t * 3.2) * 3.4; x === -24 ? c.moveTo(cx + x, y) : c.lineTo(cx + x, y); } c.stroke();
  }
  if (plain > .02) {
    c.globalAlpha = plain; c.lineWidth = 4.6; const s = F.mSmile;
    c.beginPath(); c.moveTo(cx - 20, cy - s * 6); c.quadraticCurveTo(cx, cy + s * 12, cx + 20, cy - s * 6); c.stroke();
  }
  if (open > .04) {
    c.globalAlpha = clamp(open * 5, 0, 1); const o = clamp(open, 0, 1.2);
    const hw = 26 * F.mW * (.6 + .5 * Math.min(1, o)), depth = 7 + o * 30, lift = F.mSmile * 7, cyy = cy - lift;
    c.beginPath(); c.moveTo(cx - hw, cyy); c.quadraticCurveTo(cx, cyy + 6 * F.mSmile + 2, cx + hw, cyy);
    c.bezierCurveTo(cx + hw * .9, cyy + depth * 1.3, cx - hw * .9, cyy + depth * 1.3, cx - hw, cyy); c.closePath();
    c.fillStyle = '#4a1820'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#f0748f'; ell(c, cx, cyy + depth * 1.05, hw * .66, depth * .5); c.restore();
    c.lineWidth = 3.4; c.stroke();
  }
  c.globalAlpha = 1;
}

function drawFace(c, fs, F, t, openEff) {
  c.setTransform(fs, 0, 0, fs, 0, 0); c.clearRect(0, 0, FR[2], FR[3]); c.translate(-FR[0], -FR[1]);
  if (F.blush > .02) for (let i = 0; i < 2; i++) {
    const g = c.createRadialGradient(CHEEK[i][0], CHEEK[i][1], 0, CHEEK[i][0], CHEEK[i][1], 82);
    g.addColorStop(0, 'rgba(255,104,138,' + clamp(.5 * F.blush, 0, .8) + ')'); g.addColorStop(1, 'rgba(255,104,138,0)');
    c.fillStyle = g; c.fillRect(CHEEK[i][0] - 85, CHEEK[i][1] - 85, 170, 170);
  }
  drawEye(c, 0, F, t, openEff); drawEye(c, 1, F, t, openEff);
  drawMouth(c, F, t);
  if (F.sweat > .02) {
    c.save(); c.globalAlpha = F.sweat; c.fillStyle = 'rgba(150,215,245,.96)'; const x = 770, y = 400 + Math.sin(t * 2) * 2;
    c.beginPath(); c.moveTo(x, y - 17); c.quadraticCurveTo(x + 13, y + 3, x, y + 13); c.quadraticCurveTo(x - 13, y + 3, x, y - 17); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; ell(c, x - 4, y + 3, 2.4, 4); c.restore();
  }
}

/* ---------------------------------------------------------------- css */
const CSS = `
.xm-shadow{position:absolute;left:17%;top:87.5%;width:66%;height:7%;border-radius:50%;pointer-events:none;
  background:radial-gradient(closest-side,var(--xm-shadow,rgba(18,80,60,.5)),transparent);filter:blur(3px)}
.xm-fx,.xm-gl{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none}
.xm-bubble{position:fixed;left:0;top:0;z-index:var(--xm-z,60);max-width:min(78vw,270px);padding:10px 14px;border-radius:22px;
  font:600 14px/1.38 var(--xm-font,system-ui,sans-serif);color:var(--xm-bubble-fg,#16241d);background:var(--xm-bubble-bg,rgba(255,255,255,.92));
  border:1px solid var(--xm-bubble-bd,rgba(27,107,81,.22));box-shadow:0 10px 28px -14px rgba(10,40,30,.45),inset 0 1px 0 rgba(255,255,255,.7);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:0;transform:translateY(8px) scale(.92);transform-origin:var(--xm-tail,50%) 100%;
  transition:opacity .22s,transform .3s cubic-bezier(.34,1.56,.64,1);cursor:pointer;touch-action:manipulation;visibility:hidden;-webkit-user-select:none;user-select:none}
.xm-bubble.on{opacity:1;transform:none;visibility:visible}
.xm-bubble::after{content:"";position:absolute;bottom:-6px;left:calc(var(--xm-tail,50%) - 6px);width:12px;height:12px;background:inherit;border:inherit;border-top:0;border-left:0;transform:rotate(45deg);border-radius:0 0 4px 0}
.xm-bubble .b{opacity:0}
.xm-bubble .xm-dots{display:none;gap:5px;padding:5px 2px}
.xm-bubble.dots .xm-txt{display:none}.xm-bubble.dots .xm-dots{display:inline-flex}
.xm-dots i{width:8px;height:8px;border-radius:50%;background:var(--xm-bubble-dot,#1b6b51);animation:xmd 1s infinite ease-in-out}
.xm-dots i:nth-child(2){animation-delay:.15s}.xm-dots i:nth-child(3){animation-delay:.3s}
@keyframes xmd{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}
@media (prefers-reduced-motion:reduce){.xm-dots i{animation:none}.xm-bubble{transition:opacity .15s}}
`;
let cssDone = false;
function injectCss() { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

/* ---------------------------------------------------------------- Mascot */
const DEFAULTS = { bodySrc: 'mascot-body.webp', sleepAfter: 45000, sound: false, volume: 0, greeting: null, chatter: [], returnHome: true, gravity: 3400, z: 60, maxDpr: 2, fps: 0, blockClicks: false };

class Mascot {
  constructor(host, o) {
    this.o = Object.assign({}, DEFAULTS, o || {}); this.host = host;
    this.calm = !!(global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    const S = (k, c, v) => new Spring(v || 0, k, c);
    this.sx = S(260, 12, 1); this.sy = S(260, 12, 1); this.rot = S(110, 7); this.sway = S(80, 5.5); this.lag = S(150, 9);
    this.ear = [S(170, 9), S(170, 9)]; this.arm = [S(140, 8), S(140, 8)]; this.foot = [S(220, 14), S(220, 14)];
    this.F = { open: 1, happy: 0, love: 0, dizzy: 0, wide: 0, sad: 0, lid: 0, blush: .15, mOpen: 0, mSmile: .35, mW: 1, mCat: 1, mWavy: 0, tear: 0, sweat: 0, sparkle: 0, lx: 0, ly: 0 };
    this.t = 0; this.last = 0; this.mBase = 0; this.yawning = false; this.state = 'idle'; this.ov = null; this.timers = []; this.parts = []; this.G = this.o.gravity;
    this.pos = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 }; this.mode = 'rest'; this.holdT = { x: 0, y: 0 }; this.homeT = 0;
    this.ptr = { x: -999, y: -999, t: -99 }; this.hover = false; this.down = null; this.rub = 0; this.pokes = [];
    this.look = { x: 0, y: 0 }; this.wander = { x: 0, y: 0, next: 0 }; this.blink = { next: 2, p: -1, dbl: false };
    this.rotNow = 0; this.scx = 1; this.scy = 1; this.H = { left: 0, top: 0, width: 1, height: 1 };
    this.unit = 1; this.speech = null; this.talk = 0; this.talkT = 0; this.twitch = 3; this.chat = rand(40, 80);
    this.lastAct = performance.now(); this.faceKey = ''; this.listeners = {}; this.sfx = new Sfx(); this.sfx.on = !!this.o.sound; if (this.o.volume) this.sfx.vol = this.o.volume;
    this.waveSide = 0; this.waveEnd = 0; this.petEnd = 0; this.nextHeart = 0; this.nextZ = 0; this.nextStar = 0; this.throwFast = false; this.homingHop = false;
    this.dead = false; this.frame = this.frame.bind(this);
  }

  /* ---------- setup ---------- */
  async init() {
    injectCss(); const h = this.host; if (getComputedStyle(h).position === 'static') h.style.position = 'relative';
    this.shadow = document.createElement('div'); this.shadow.className = 'xm-shadow'; h.appendChild(this.shadow);
    this.gl = document.createElement('canvas'); this.gl.className = 'xm-gl'; this.gl.style.zIndex = this.o.z; document.body.appendChild(this.gl);
    this.fx = document.createElement('canvas'); this.fx.className = 'xm-fx'; this.fx.style.zIndex = this.o.z + 1; document.body.appendChild(this.fx);
    this.fxc = this.fx.getContext('2d');
    this.bub = document.createElement('div'); this.bub.className = 'xm-bubble'; this.bub.style.zIndex = this.o.z + 2;
    this.bub.innerHTML = '<span class="xm-txt"><span class="a"></span><span class="b"></span></span><span class="xm-dots"><i></i><i></i><i></i></span>';
    document.body.appendChild(this.bub); this.bA = this.bub.querySelector('.a'); this.bB = this.bub.querySelector('.b');
    this.bub.addEventListener('click', () => this.hush());
    this.faceCv = document.createElement('canvas'); this.fcx = this.faceCv.getContext('2d');
    const img = new Image(); img.decoding = 'async'; img.src = this.o.bodySrc; await img.decode(); this.img = img;
    // mask hit-test (256x256, didilatasi)
    const m = document.createElement('canvas'); m.width = m.height = 256; const mc = m.getContext('2d', { willReadFrequently: true }); mc.drawImage(img, 0, 0, 256, 256);
    const d = mc.getImageData(0, 0, 256, 256).data, a = new Uint8Array(65536), mk = new Uint8Array(65536);
    for (let i = 0; i < 65536; i++) a[i] = d[i * 4 + 3];
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { let v = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < 256 && yy < 256) v = Math.max(v, a[yy * 256 + xx]); } mk[y * 256 + x] = v; }
    this.mask = mk;
    this.initGL(); this.resize();
    this._rs = () => this.resize(); addEventListener('resize', this._rs);
    this.bindInput(); this.raf = requestAnimationFrame(this.frame);
    if (this.o.greeting) this.later(1, () => this.say(this.o.greeting, { mood: 'happy' }));
    return this;
  }

  initGL() {
    let gl = null; try { gl = this.gl.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true }); } catch (e) { }
    if (!gl) { this.g2 = this.gl.getContext('2d'); this.gl2d = true; return; }
    this.glc = gl;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    this.pr = pr; this.U = {}; for (const n of ['uHost', 'uUnit', 'uView', 'uRoot', 'uRot', 'uScale', 'uSway', 'uLag', 'uBreath', 'uEar', 'uArm', 'uFoot', 'uShift', 'uIsFace', 'uFR', 'uTex']) this.U[n] = gl.getUniformLocation(pr, n);
    const mk = (g) => { const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STATIC_DRAW); const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW); return { vao, n: g.idx.length }; };
    this.mBody = mk(grid(0, 0, 1024, 1024, 48, 48)); this.mFace = mk(grid(FR[0], FR[1], FR[2], FR[3], 40, 16));
    const tex = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.tBody = tex(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img); gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.tFace = tex(); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  resize() {
    const vw = innerWidth, vh = innerHeight; this.vw = vw; this.vh = vh;
    let dpr = Math.min(devicePixelRatio || 1, this.o.maxDpr || 2); dpr = Math.min(dpr, Math.sqrt(4.2e6 / (vw * vh))); this.dpr = dpr;
    for (const c of [this.gl, this.fx]) { c.width = Math.round(vw * dpr); c.height = Math.round(vh * dpr); c.style.width = vw + 'px'; c.style.height = vh + 'px'; }
    this.faceKey = ''; this.fxDirty = true;
  }

  /* ---------- util ---------- */
  later(s, fn) { this.timers.push({ at: this.t + s, fn }); }
  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); return this; }
  emitEv(ev, d) { (this.listeners[ev] || []).forEach(f => { try { f(d); } catch (e) { } }); }
  activity() { this.lastAct = performance.now(); if (this.state === 'sleep') this.wake(); }
  flash(name, s) { this.ov = { name, end: this.t + s }; }
  setSound(on) { this.sfx.on = !!on; if (on) { this.sfx.init(); this.sfx.pop(); } }
  setState(s) { if (this.state === 'sleep' && s !== 'sleep') this.sfx.pop(); this.state = s; if (s !== 'thinking') this.dots(false); else this.dots(true); this.lastAct = performance.now(); }
  scr(rx, ry) { const dx = (rx - 512) * this.scx, dy = (ry - 945) * this.scy, c = Math.cos(this.rotNow), s = Math.sin(this.rotNow); return { x: this.H.left + (512 + c * dx - s * dy) * this.unit + this.pos.x, y: this.H.top + (945 + s * dx + c * dy) * this.unit + this.pos.y }; }
  toRest(px, py) { const u = this.unit; let x = (px - this.H.left - this.pos.x) / u - 512, y = (py - this.H.top - this.pos.y) / u - 945; const c = Math.cos(-this.rotNow), s = Math.sin(-this.rotNow); const rx = (c * x - s * y) / this.scx, ry = (s * x + c * y) / this.scy; return [512 + rx, 945 + ry]; }
  hit(px, py) { const [x, y] = this.toRest(px, py); if (x < 0 || y < 0 || x >= 1024 || y >= 1024) return null; if (this.mask[((y / 4) | 0) * 256 + ((x / 4) | 0)] < 40) return null; return { x, y, region: this.regionAt(x, y) }; }
  regionAt(x, y) {
    if (y < 345 && (Math.hypot(x - 307, y - 215) < 150 || Math.hypot(x - 717, y - 215) < 150)) return 'ear';
    if ((x < 195 || x > 829) && y > 420 && y < 750) return 'arm';
    if (y > 790 && (x < 470 || x > 554)) return 'foot';
    if (Math.hypot((x - 512) / 215, (y - 720) / 175) < 1) return 'belly';
    if (Math.hypot(x - 282, y - 506) < 85 || Math.hypot(x - 742, y - 506) < 85) return 'cheek';
    return y < 650 ? 'head' : 'body';
  }
  bounds() { const S = this.H.width; return { minX: Math.min(0, -(this.H.left + .0235 * S) + 2), maxX: Math.max(0, this.vw - (this.H.left + .978 * S) - 2), minY: Math.min(0, -(this.H.top + .08 * S) + 2), maxY: 0 }; }

  /* ---------- input ---------- */
  bindInput() {
    this._pd = e => this.onDown(e); this._pm = e => this.onMove(e); this._pu = e => this.onUp(e);
    this._ts = e => { const t = e.touches[0]; if (t && this.hit(t.clientX, t.clientY)) e.preventDefault(); };
    addEventListener('pointerdown', this._pd, true); addEventListener('pointermove', this._pm, { passive: true });
    addEventListener('pointerup', this._pu, true); addEventListener('pointercancel', this._pu, true);
    addEventListener('touchstart', this._ts, { passive: false });
    this._ck = e => { if (this.o.blockClicks && this.hit(e.clientX, e.clientY)) { e.stopPropagation(); e.preventDefault(); } }; addEventListener('click', this._ck, true);
    this._vis = () => { this.last = 0; }; document.addEventListener('visibilitychange', this._vis);
  }
  onDown(e) {
    if (e.button > 0 || this.bub.contains(e.target)) return; const h = this.hit(e.clientX, e.clientY); if (!h) return;
    this.ptr = { x: e.clientX, y: e.clientY, t: this.t }; this.sfx.init(); this.activity();
    this.down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: this.t, region: h.region, moved: false, pet: false, mx: e.clientX, my: e.clientY };
  }
  onMove(e) {
    const dx = e.clientX - this.ptr.x, dy = e.clientY - this.ptr.y, dist = Math.hypot(dx, dy); this.ptr.x = e.clientX; this.ptr.y = e.clientY; this.ptr.t = this.t;
    const h = this.hit(e.clientX, e.clientY); this.hover = !!h && this.mode !== 'held' && e.pointerType !== 'touch';
    const d = this.down;
    if (d && d.id === e.pointerId) {
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) { d.moved = true; if (['head', 'ear', 'cheek'].includes(d.region)) d.pet = true; else this.startHold(e.clientX, e.clientY); }
      if (this.mode === 'held') { this.holdT.x = e.clientX - this.grab.x; this.holdT.y = e.clientY - this.grab.y; }
      else if (d.pet && h && ['head', 'ear', 'cheek'].includes(h.region)) this.addRub(dist);
    } else if (h && e.pointerType !== 'touch' && (h.region === 'head' || h.region === 'ear') && this.mode === 'rest') { this.addRub(dist * .8); this.activity(); }
  }
  onUp(e) {
    const d = this.down; if (!d || d.id !== e.pointerId) return; this.down = null;
    if (this.mode === 'held') return this.release();
    if (!d.moved) this.poke(d.region);
  }
  addRub(v) { this.rub += v; if (this.rub > 650) { this.rub = 0; this.pet(); } }

  /* ---------- reaksi ---------- */
  poke(region) {
    const now = this.t; this.pokes = this.pokes.filter(t => now - t < 5); this.pokes.push(now); const n = this.pokes.length;
    this.emitEv('poke', { region, n }); this.activity();
    if (n >= 8) { this.pokes = []; return this.react('dizzy'); }
    if (n === 5) { this.sfx.squeak(); this.flash('shy', 1.8); this.say('Ih, geli~ udah dong~', { speed: 45 }); this.squish(1.2); return; }
    switch (region) {
      case 'belly': this.squish(1.4); this.react('giggle'); break;
      case 'ear': this.ear[0].kick(rand(3.5, 5)); this.ear[1].kick(rand(3.5, 5)); this.squish(.5); this.sfx.squeak(); this.flash('surprised', .55); this.emit('excl', 1, 512, 60); break;
      case 'arm': this.react('wave', this.hitSide()); break;
      case 'foot': this.foot[0].kick(rand(-10, 10)); this.foot[1].kick(rand(-10, 10)); this.hop(34); this.sfx.squeak(); break;
      case 'cheek': this.react('shy'); break;
      default: this.squish(1); this.sfx.boing(); this.flash('giggle', .8); this.emit('heart', 1, 512, 260);
    }
  }
  hitSide() { return this.ptr.x < this.scr(512, 500).x ? 0 : 1; }
  squish(p, dir) { this.sy.kick(-3.1 * p); this.sx.kick(1.9 * p); this.lag.kick(-2 * p); this.sway.kick((dir == null ? rand(-3, 3) : dir) * p); }
  pet() { this.sfx.giggle(); this.flash('petted', 2.2); this.petEnd = this.t + 2.2; this.emit('heart', 3, 512, 250); this.emitEv('pet'); }
  hop(h, vx) {
    if (this.mode === 'held') return; if (this.calm) { this.squish(.6); return; }
    this.sy.kick(-2.4); this.later(.09, () => { if (this.mode === 'held') return; this.vel.y = -Math.sqrt(2 * this.G * (h || 70)); this.vel.x = vx || 0; this.mode = 'air'; this.sy.kick(3.2); this.sx.kick(-1.3); });
  }
  react(name, a) {
    this.activity();
    switch (name) {
      case 'hop': this.hop(a || 80); this.sfx.boing(); this.flash('happy', 1); break;
      case 'wave': this.waveSide = a === 0 || a === 1 ? a : (Math.random() < .5 ? 0 : 1); this.waveEnd = this.t + 1.6; this.flash('wave', 1.6); this.sfx.squeak(); this.later(.1, () => this.emit('spark', 2, this.waveSide ? 930 : 94, 440)); break;
      case 'giggle': this.flash('giggle', 1.1); this.sfx.giggle(); for (let i = 0; i < 4; i++) this.later(i * .14, () => { this.lag.kick(i % 2 ? 2.4 : -2.4); this.sy.kick(i % 2 ? 1 : -1); }); this.emit('heart', 2, 512, 250); break;
      case 'shy': this.flash('shy', 1.8); this.sfx.squeak(); this.emit('heart', 1, 512, 270); this.sway.kick(-3); break;
      case 'surprise': this.flash('surprised', 1.2); this.hop(44); this.sfx.squeak(); this.emit('excl', 1, 512, 60); break;
      case 'nod': this.sy.kick(-2.6); this.later(.28, () => this.sy.kick(-2.2)); break;
      case 'shake': for (let i = 0; i < 4; i++) this.later(i * .16, () => this.rot.kick(i % 2 ? 2.4 : -2.4)); break;
      case 'sad': this.flash('sad', 2.6); this.sy.kick(-1.4); break;
      case 'love': this.flash('love', 2.4); this.sfx.giggle(); this.emit('heart', 5, 512, 250); break;
      case 'happy': this.flash('happy', 2); this.hop(50); this.emit('star', 4, 512, 200); break;
      case 'dizzy': this.flash('dizzy', 2.6); this.sfx.yawn(); break;
      case 'yawn': this.flash('yawn', 2); this.sfx.yawn(); this.sy.kick(1.4); break;
    }
  }
  wake() {
    this.state = 'idle'; this.lastAct = performance.now(); this.sfx.squeak(); this.flash('surprised', .7); this.hop(26); this.emit('excl', 1, 512, 60);
    if (Math.random() < .6) this.later(.8, () => this.say(pick(['Hah? Aku ketiduran ya...', 'Eh, udah balik? Hehe~', 'Mmh... aku bangun kok~']), { speed: 38 }));
  }
  startHold(px, py) {
    this.mode = 'held'; this.grab = { x: px - this.pos.x, y: py - this.pos.y }; this.holdT.x = this.pos.x; this.holdT.y = this.pos.y; this.sfx.squeak(); this.hush();
    this.emitEv('grab');
  }
  release() {
    const sp = Math.hypot(this.vel.x, this.vel.y), k = sp > 2600 ? 2600 / sp : 1; this.vel.x *= k; this.vel.y *= k; this.throwFast = sp > 1300; this.mode = 'air'; this.emitEv('drop');
    if (this.pos.y >= -1 && Math.abs(this.vel.y) < 80 && Math.abs(this.vel.x) < 40) { this.pos.y = 0; this.mode = 'rest'; }
  }
  impact(v, axis) {
    if (v < 120) return;
    if (axis === 'y') { this.sy.kick(-v * .0042); this.sx.kick(v * .0026); this.lag.kick(-v * .002); this.rot.kick(rand(-1, 1) * v * .0008); if (v > 300) this.sfx.boing(); if (v > 500) this.emit('spark', 3, 512, 930); }
    else { this.sx.kick(-v * .003); this.rot.kick(rand(-1, 1) * v * .001); if (v > 300) this.sfx.pop(); }
  }
  land() {
    if (this.throwFast) { this.throwFast = false; this.flash('dizzy', 2.2); for (let i = 0; i < 5; i++) this.emit('star', 1, 512, 120); }
    else if (this.o.returnHome && Math.abs(this.pos.x) > 6) { this.flash('happy', 1.2); }
  }

  /* ---------- partikel ---------- */
  emit(type, n, rx, ry) {
    const p = this.scr(rx, ry), s = clamp(this.H.width * .045, 10, 24);
    for (let i = 0; i < n; i++) this.parts.push({ type, x: p.x + rand(-14, 14) * this.unit * 2, y: p.y, vx: rand(-34, 34), vy: type === 'z' ? -26 : rand(-90, -150), g: type === 'z' ? 0 : 120, life: 0, max: type === 'excl' ? 1 : rand(1, 1.6), s: s * rand(.8, 1.25), rot: rand(-.5, .5), vr: rand(-1, 1) });
    this.fxDirty = true;
  }

  /* ---------- bicara ---------- */
  say(text, o) {
    o = o || {}; this.hush(true); this.activity();
    const sp = this.speech = { text: String(text), i: 0, acc: 0, speed: o.speed || 32, mood: o.mood || null, st: 'type', hold: 0, hmax: (o.hold != null ? o.hold : 1.4 + String(text).length * .055), res: null };
    const pr = new Promise(r => { sp.res = r; });
    this.dots(false); this.bA.textContent = ''; this.bB.textContent = sp.text; if (this.bub.classList.contains('on')) { this.bub.classList.remove('on'); void this.bub.offsetWidth; } this.bub.classList.add('on'); this.emitEv('say', text);
    return pr;
  }
  hush(silent) {
    const sp = this.speech; this.speech = null; this.talkT = 0;
    if (sp) { if (sp.res) sp.res(); }
    if (!silent) { this.bub.classList.remove('on'); }
  }
  dots(on) { this.bub.classList.toggle('dots', on); if (on) this.bub.classList.add('on'); else if (!this.speech) this.bub.classList.remove('on'); }
  async ask(task, o) {
    o = o || {}; this.hush(); this.activity(); this.setState('listening'); await new Promise(r => setTimeout(r, 650)); this.setState('thinking');
    let out; const t0 = performance.now();
    try { out = await Promise.resolve(typeof task === 'function' ? task() : task); } catch (e) { out = { text: 'Aduh, aku lagi error nih... coba lagi ya?', mood: 'sad' }; }
    const wait = Math.max(0, (o.minThink || 1100) - (performance.now() - t0)); if (wait) await new Promise(r => setTimeout(r, wait));
    this.setState('idle'); if (typeof out === 'string') out = { text: out };
    if (out.react) this.react(out.react);
    return this.say(out.text, { mood: out.mood });
  }

  /* ---------- otak ---------- */
  pose() {
    const p = Object.assign({}, D); Object.assign(p, P[this.state] || {});
    if (this.speech && this.speech.mood && MOODS[this.speech.mood]) Object.assign(p, MOODS[this.speech.mood]);
    if (this.hover && this.state === 'idle' && !this.ov) { p.blush = .42; p.mSmile = .75; p.ear = -.1; p.wide = .15; }
    if (this.mode === 'air' && this.throwFast) Object.assign(p, P.air);
    if (this.ov && this.t < this.ov.end) Object.assign(p, P[this.ov.name]);
    if (this.mode === 'held') Object.assign(p, P.held);
    return p;
  }
  brain(dt) {
    const t = this.t, F = this.F;
    for (let i = this.timers.length - 1; i >= 0; i--) if (this.timers[i].at <= t) { const f = this.timers[i].fn; this.timers.splice(i, 1); f(); }
    if (this.ov && t >= this.ov.end) this.ov = null;
    const p = this.pose(), k = 1 - Math.exp(-dt * (p.fast ? 28 : 13));
    for (const key of FKEYS) F[key] += (p[key] - F[key]) * k;
    F.open += (p.open - F.open) * (1 - Math.exp(-dt * 22));
    // bicara: mulut
    this.talk += (this.talkT - this.talk) * (1 - Math.exp(-dt * 26));
    this.mBase += (p.mOpen - this.mBase) * k; F.mOpen = Math.max(this.mBase, this.talk);
    // kedip
    const b = this.blink; let bf = 1;
    if (this.state === 'idle' || this.state === 'listening' || this.state === 'thinking') {
      b.next -= dt; if (b.next <= 0 && b.p < 0) { b.p = 0; b.dbl = Math.random() < .2; }
      if (b.p >= 0) { b.p += dt / .17; bf = 1 - Math.sin(clamp(b.p, 0, 1) * PI); if (b.p >= 1) { b.p = -1; b.next = b.dbl ? .12 : rand(2.2, 5.5); b.dbl = false; } }
    }
    this.blinkF = bf;
    // arah pandang
    let tx, ty;
    if (p.lookX != null) { tx = p.lookX; ty = p.lookY || 0; }
    else if (this.t - this.ptr.t < 4 && this.ptr.x > -900) { const c = this.scr(512, 430), S = this.H.width; tx = clamp((this.ptr.x - c.x) / (S * 1.1), -1, 1); ty = clamp((this.ptr.y - c.y) / (S * 1.1), -1, 1); }
    else { const w = this.wander; if (t > w.next) { w.next = t + rand(1.6, 4); w.x = rand(-.55, .55); w.y = rand(-.3, .35); if (Math.random() < .3) { w.x = 0; w.y = 0; } } tx = w.x; ty = w.y; }
    const lk = 1 - Math.exp(-dt * 9); this.look.x += (tx - this.look.x) * lk; this.look.y += (ty - this.look.y) * lk; F.lx = this.look.x; F.ly = this.look.y;
    // badan
    const er = p.earR != null ? p.earR : p.ear, el = p.earL != null ? p.earL : p.ear, ar = p.armR != null ? p.armR : p.arm, al = p.armL != null ? p.armL : p.arm;
    this.ear[0].t = el; this.ear[1].t = er;
    this.arm[0].t = al + Math.sin(t * 1.3) * .03; this.arm[1].t = ar + Math.sin(t * 1.3 + 2) * .03;
    if (t < this.waveEnd) { const s = this.waveSide; this.arm[s].t = .6 + Math.sin(t * 15) * .22; }
    if (this.state === 'thinking') this.arm[1].t = ar + Math.sin(t * 2.2) * .05;
    const happyish = F.happy > .6 && (this.state === 'happy' || (this.ov && this.ov.name === 'happy'));
    this.foot[0].t = happyish ? Math.sin(t * 10) * 9 : 0; this.foot[1].t = happyish ? Math.sin(t * 10 + PI) * 9 : 0;
    if (this.mode === 'held') { this.foot[0].t = -16 + Math.sin(t * 7) * 17; this.foot[1].t = -16 + Math.sin(t * 7 + 1.7) * 17; this.sy.t = 1.07; this.rot.t = clamp(this.vel.x * .0009, -.5, .5) + Math.sin(t * 5) * .04; }
    else { this.sy.t = p.sy; this.rot.t = p.tilt + this.look.x * .03 + (F.dizzy > .5 ? Math.sin(t * 4.5) * .14 : 0); }
    // murmur / elus
    if (t < this.petEnd && t > this.nextHeart) { this.nextHeart = t + .42; this.emit('heart', 1, 512, 250); }
    if (this.state === 'sleep' && t > this.nextZ) { this.nextZ = t + 1.7; this.emit('z', 1, 700, 300); }
    if (F.dizzy > .5 && t > this.nextStar) { this.nextStar = t + .22; this.parts.push({ type: 'star', orb: true, a: rand(0, TAU), r: this.H.width * .2, life: 0, max: .9, s: clamp(this.H.width * .04, 9, 20), x: 0, y: 0, vx: 0, vy: 0, g: 0, rot: 0, vr: 3 }); this.fxDirty = true; }
    // acak: kuping, rantai ocehan, tidur
    if (this.state === 'idle' && !this.speech && !this.calm) { this.twitch -= dt; if (this.twitch <= 0) { this.twitch = rand(4, 10); this.ear[Math.random() < .5 ? 0 : 1].kick(rand(2.2, 4)); } }
    const idleMs = performance.now() - this.lastAct;
    if (this.state === 'idle' && this.mode === 'rest' && !this.speech && !this.down) {
      if (this.o.sleepAfter && idleMs > this.o.sleepAfter && !this.yawning) {
        this.yawning = true; this.flash('yawn', 2); this.sfx.yawn(); this.sy.kick(1.4);
        this.later(1.9, () => { this.yawning = false; if (this.state === 'idle' && performance.now() - this.lastAct > this.o.sleepAfter) this.state = 'sleep'; });
      }
      else if (!this.yawning && this.o.chatter.length && idleMs > 20000) { this.chat -= dt; if (this.chat <= 0) { this.chat = rand(45, 90); this.say(pick(this.o.chatter), { mood: 'happy' }); } }
    }
    // tahan lama = angkat
    const d = this.down; if (d && !d.moved && this.mode !== 'held' && t - d.t > .45 && !d.pet) this.startHold(d.x, d.y);
    // ketik teks
    const sp = this.speech;
    if (sp) {
      if (sp.st === 'type') {
        sp.acc += dt * sp.speed; const n = Math.min(sp.text.length, Math.floor(sp.acc));
        if (n !== sp.i) {
          const ch = sp.text[n - 1] || ''; sp.i = n; this.bA.textContent = sp.text.slice(0, n); this.bB.textContent = sp.text.slice(n);
          this.talkT = /[aiueoAIUEO]/.test(ch) ? rand(.75, 1) : /[a-zA-Z]/.test(ch) ? rand(.3, .5) : .05;
          if (n % 2 === 0) this.sfx.blip(); if (ch === ' ') this.lag.kick(-.9);
          if (/[.!?~]/.test(ch)) this.talkT = .05;
        }
        if (n >= sp.text.length) { sp.st = 'hold'; this.talkT = 0; }
      } else { sp.hold += dt; if (sp.hold > sp.hmax) { this.bub.classList.remove('on'); const r = sp.res; this.speech = null; if (r) r(); } }
    }
  }
  physics(dt) {
    const b = this.bounds();
    if (this.mode === 'held') {
      const tx = clamp(this.holdT.x, b.minX, b.maxX), ty = clamp(this.holdT.y, b.minY, b.maxY), k = 1 - Math.exp(-dt * 16), ox = this.pos.x, oy = this.pos.y;
      this.pos.x += (tx - this.pos.x) * k; this.pos.y += (ty - this.pos.y) * k;
      this.vel.x = lerp(this.vel.x, (this.pos.x - ox) / dt, .35); this.vel.y = lerp(this.vel.y, (this.pos.y - oy) / dt, .35); return;
    }
    if (this.mode === 'air') {
      this.vel.y += this.G * dt; this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
      if (this.pos.x < b.minX) { this.pos.x = b.minX; if (this.vel.x < 0) { this.impact(-this.vel.x, 'x'); this.vel.x *= -.5; } }
      if (this.pos.x > b.maxX) { this.pos.x = b.maxX; if (this.vel.x > 0) { this.impact(this.vel.x, 'x'); this.vel.x *= -.5; } }
      if (this.pos.y < b.minY) { this.pos.y = b.minY; if (this.vel.y < 0) this.vel.y *= -.3; }
      if (this.pos.y >= 0) {
        this.pos.y = 0; const iv = this.vel.y; this.impact(iv, 'y');
        if (iv > 380) { this.vel.y = -iv * .36; this.vel.x *= .8; if (this.throwFast) this.land(); }
        else { this.vel.y = 0; if (this.homingHop) { this.vel.x = 0; this.homingHop = false; } this.mode = 'ground'; this.land(); }
      }
    } else if (this.mode === 'ground') {
      this.pos.x = clamp(this.pos.x + this.vel.x * dt, b.minX, b.maxX); this.vel.x *= Math.exp(-dt * 5.5);
      if (Math.abs(this.vel.x) < 8) { this.vel.x = 0; this.mode = 'rest'; this.homeT = .5; }
    } else if (this.mode === 'rest') {
      this.pos.y = 0;
      if (Math.abs(this.pos.x) > .5 && this.o.returnHome && !this.down) {
        this.homeT -= dt;
        if (this.homeT <= 0) { if (Math.abs(this.pos.x) < 14) { this.pos.x = 0; } else { this.homingHop = true; this.homeT = .75; this.hop(42, clamp(-this.pos.x * 2.6, -380, 380)); } }
      }
    }
  }

  /* ---------- render ---------- */
  frame(now) {
    if (this.dead) return; this.raf = requestAnimationFrame(this.frame);
    if (document.hidden) { this.last = 0; return; }
    if (this.o.fps && this.last && now - this.last < 1000 / this.o.fps - 3) return;
    if (!this.last) this.last = now; const dt = Math.min(.033, (now - this.last) / 1000); this.last = now; if (dt <= 0) return;
    const r = this.host.getBoundingClientRect(); this.H = r; this.unit = r.width / 1024; if (r.width < 8) return;
    this.t += dt; this.brain(dt); this.physics(dt);
    for (const s of [this.sx, this.sy, this.rot, this.sway, this.lag, ...this.ear, ...this.arm, ...this.foot]) s.step(dt);
    this.draw(dt); this.hudUpdate();
  }
  draw(dt) {
    const F = this.F, t = this.t, p = this.pose(), awake = this.state !== 'sleep';
    const amp = (awake ? .011 : .02) * (this.calm ? .5 : 1), rate = awake ? 2.1 : 1.3, breath = Math.sin(t * rate) * amp * p.breath;
    const jig = (this.t < this.petEnd) ? Math.sin(t * 34) * .007 : 0;
    this.scx = this.sx.x + (1 - this.sy.x) * .5 + jig; this.scy = this.sy.x - jig; this.rotNow = this.rot.x;
    const openEff = F.open * (this.blinkF == null ? 1 : this.blinkF);
    // wajah
    const fs = Math.min(1.3, Math.ceil(clamp(this.unit * this.dpr, .35, 1.3) * 4) / 4), W = Math.ceil(FR[2] * fs), Hh = Math.ceil(FR[3] * fs);
    const anim = F.dizzy > .02 || F.love > .02 || F.mWavy > .02 || F.tear > .05 || F.sparkle > .02 || F.sweat > .02;
    const key = [W, openEff, F.lx, F.ly, ...FKEYS.map(k => F[k]), F.mOpen].map(v => typeof v === 'number' ? v.toFixed(2) : v).join(',') + (anim ? '|' + ((t * 30) | 0) : '');
    const dirty = key !== this.faceKey; this.faceKey = key;
    if (dirty) { if (this.faceCv.width !== W) { this.faceCv.width = W; this.faceCv.height = Hh; } drawFace(this.fcx, fs, F, t, openEff); }
    const sh = [F.lx * 16, F.ly * 10];
    if (this.glc) {
      const gl = this.glc, U = this.U, H = this.H;
      gl.viewport(0, 0, this.gl.width, this.gl.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(this.pr);
      gl.uniform2f(U.uHost, H.left, H.top); gl.uniform1f(U.uUnit, this.unit); gl.uniform2f(U.uView, this.vw, this.vh); gl.uniform2f(U.uRoot, this.pos.x, this.pos.y);
      gl.uniform1f(U.uRot, this.rotNow); gl.uniform2f(U.uScale, this.scx, this.scy); gl.uniform1f(U.uSway, this.sway.x); gl.uniform1f(U.uLag, this.lag.x); gl.uniform1f(U.uBreath, breath);
      gl.uniform2f(U.uEar, this.ear[0].x, this.ear[1].x); gl.uniform2f(U.uArm, this.arm[0].x, this.arm[1].x); gl.uniform2f(U.uFoot, this.foot[0].x, this.foot[1].x);
      gl.uniform4f(U.uFR, FR[0], FR[1], FR[2], FR[3]); gl.uniform1i(U.uTex, 0); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(U.uIsFace, 0); gl.uniform2f(U.uShift, 0, 0); gl.bindTexture(gl.TEXTURE_2D, this.tBody); gl.bindVertexArray(this.mBody.vao); gl.drawElements(gl.TRIANGLES, this.mBody.n, gl.UNSIGNED_SHORT, 0);
      gl.uniform1f(U.uIsFace, 1); gl.uniform2f(U.uShift, sh[0], sh[1]); gl.bindTexture(gl.TEXTURE_2D, this.tFace);
      if (dirty) { gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.faceCv); }
      gl.bindVertexArray(this.mFace.vao); gl.drawElements(gl.TRIANGLES, this.mFace.n, gl.UNSIGNED_SHORT, 0);
    } else if (this.g2) { // cadangan 2D (tanpa warp bagian tubuh)
      const c = this.g2, u = this.unit, H = this.H, d = this.dpr; c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, this.vw, this.vh);
      c.translate(H.left + this.pos.x + BASE[0] * u, H.top + this.pos.y + BASE[1] * u); c.rotate(this.rotNow); c.scale(this.scx * (1 - breath * .5), this.scy * (1 + breath)); c.translate(-BASE[0] * u, -BASE[1] * u);
      c.drawImage(this.img, 0, 0, 1024 * u, 1024 * u); c.drawImage(this.faceCv, (FR[0] + sh[0]) * u, (FR[1] + sh[1]) * u, FR[2] * u, FR[3] * u);
    }
    // bayangan tanah
    const lift = clamp(-this.pos.y / (this.H.width * .6), 0, .7), sc = 1 - lift * .5;
    this.shadow.style.transform = 'translateX(' + (this.pos.x).toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')'; this.shadow.style.opacity = (1 - lift * .8).toFixed(2);
    this.drawFx(dt);
  }
  drawFx(dt) {
    const c = this.fxc, ps = this.parts; if (!ps.length && !this.fxDirty) return; this.fxDirty = false;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, this.vw, this.vh);
    for (let i = ps.length - 1; i >= 0; i--) {
      const q = ps[i]; q.life += dt; if (q.life >= q.max) { ps.splice(i, 1); continue; }
      if (q.orb) { q.a += dt * 4.5; const hd = this.scr(512, 120); q.x = hd.x + Math.cos(q.a) * q.r; q.y = hd.y - 8 + Math.sin(q.a) * q.r * .28; }
      else { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.type === 'z') q.x += Math.sin(q.life * 3) * .4; }
      q.rot += q.vr * dt; const u = q.life / q.max, pop = Math.min(1, q.life / .16), a = (1 - u * u) * 1, s = q.s * (.4 + .6 * pop + (q.type === 'z' ? u * .5 : 0));
      c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(q.x, q.y); if (q.type !== 'excl' && q.type !== 'z') c.rotate(q.rot * .5);
      switch (q.type) {
        case 'heart': c.fillStyle = '#ff6b8f'; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5; heartPath(c, 0, 0, s * .8); c.fill(); c.stroke(); break;
        case 'star': case 'spark': c.fillStyle = '#ffd35c'; c.strokeStyle = 'rgba(160,110,0,.35)'; c.lineWidth = 1; starPath(c, 0, 0, s * .9); c.fill(); c.stroke(); break;
        case 'z': c.font = '800 ' + (s * 1.5) + 'px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.9)'; c.fillStyle = '#5b94d6'; c.strokeText('z', 0, 0); c.fillText('z', 0, 0); break;
        case 'excl': c.font = '900 ' + (s * 2) + 'px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.95)'; c.fillStyle = '#ff6a4d'; c.strokeText('!', 0, 0); c.fillText('!', 0, 0); break;
      }
      c.restore();
    }
    if (!ps.length) c.clearRect(0, 0, this.vw, this.vh);
  }
  hudUpdate() {
    const b = this.bub; if (!b.classList.contains('on')) return;
    const a = this.scr(512, 95), bw = b.offsetWidth, bh = b.offsetHeight; const left = clamp(a.x - bw / 2, 8, this.vw - bw - 8);
    const top = Math.max(8, a.y - bh - 16); b.style.left = left.toFixed(0) + 'px'; b.style.top = top.toFixed(0) + 'px'; b.style.setProperty('--xm-tail', clamp(a.x - left, 22, bw - 22).toFixed(0) + 'px');
  }
  destroy() {
    this.dead = true; cancelAnimationFrame(this.raf); removeEventListener('resize', this._rs); removeEventListener('pointerdown', this._pd, true); removeEventListener('pointermove', this._pm);
    removeEventListener('pointerup', this._pu, true); removeEventListener('pointercancel', this._pu, true); removeEventListener('touchstart', this._ts); document.removeEventListener('visibilitychange', this._vis);
    [this.gl, this.fx, this.bub, this.shadow].forEach(n => n && n.remove());
  }
}

global.XiaMascot = { version: '1.0', async mount(host, opts) { const m = new Mascot(host, opts); await m.init(); return m; } };
})(window);
