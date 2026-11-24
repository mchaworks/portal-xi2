/* Ambient playful: pad cerah tipis + petikan kotak musik iseng (pentatonik C).
   Disintesis langsung lewat WebAudio (tanpa file audio). Mulai setelah intro selesai & ada sentuhan pertama.
   Dikontrol toggle "Musik Latar" di Pengaturan (localStorage: xia_amb). */
(()=>{
'use strict';
const KEY='xia_amb',R=document.documentElement;
const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
let on=store(KEY)!=='0',ctx=null,master=null,bus=null,started=false,timer=0,hidden=false;
const LEVEL=.3,FADE_IN=3,rnd=(a,b)=>a+Math.random()*(b-a);
/* v3 "playful": pad terang (C - Am - F - G) + petikan kotak musik pentatonik C yang iseng, jeda acak. Tanpa drone rendah. */
const CH=[[261.63,329.63,392],[220,261.63,329.63],[174.61,261.63,349.23],[196,246.94,392]],SC=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
let pad=[],ci=0,padT=0,gap=0;

function build(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 try{ctx=new AC({latencyHint:'playback'})}catch(e){ctx=new AC()}
 const lite=(R.dataset.perf||'mid')==='lite';
 master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
 bus=ctx.createGain();bus.gain.value=1;
 const dry=ctx.createGain();dry.gain.value=.85;bus.connect(dry);dry.connect(master);
 /* gema imut: satu delay pendek berumpan balik (ringan) */
 if(!lite){const dl=ctx.createDelay(1);dl.delayTime.value=.3;const f=ctx.createGain();f.gain.value=.3;
  const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=2600;const wet=ctx.createGain();wet.gain.value=.25;
  bus.connect(dl);dl.connect(tone);tone.connect(f);f.connect(dl);tone.connect(wet);wet.connect(master)}
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;lp.Q.value=.3;lp.connect(bus);
 /* pad tipis dan cerah (oktaf tengah), bergeser ke akor berikutnya pelan-pelan */
 const n=lite?2:3;
 for(let i=0;i<n;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type=i?'triangle':'sine';o.frequency.value=CH[0][i];g.gain.value=i?.05:.085;o.connect(g);g.connect(lp);o.start();pad.push(o)}
 return true}
function nextChord(){ci=(ci+1)%CH.length;if(!ctx)return;pad.forEach((o,i)=>o.frequency.setTargetAtTime(CH[ci][i],ctx.currentTime,.5))}
function pluck(f,t,v){ /* nada kotak musik: sine + sedikit oktaf, hilang cepat */
 const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.7);g.connect(bus);
 [[f,'sine',1],[f*2,'triangle',.14]].forEach(([fr,ty,k])=>{const o=ctx.createOscillator(),h=ctx.createGain();o.type=ty;o.frequency.value=fr;h.gain.value=k;o.connect(h);h.connect(g);o.start(t);o.stop(t+.75)})}
function bloop(t){ /* "bloop" kecil yang lucu, sesekali */
 const o=ctx.createOscillator(),g=ctx.createGain(),f=rnd(500,780);o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.9,t+.09);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(bus);o.start(t);o.stop(t+.2)}
function sparkle(){ /* frasa pendek 2-4 nada naik/turun, kadang bloop atau diam */
 if(!ctx||!on||hidden||ctx.state!=='running'||!bus)return;
 const r=Math.random(),t=ctx.currentTime+.02;
 if(r<.25)return;
 if(r<.38){bloop(t);return}
 let i=Math.random()*5|0;const n=2+(Math.random()*3|0),dir=Math.random()<.6?1:-1,st=rnd(.11,.17);
 for(let k=0;k<n;k++){pluck(SC[Math.max(0,Math.min(SC.length-1,i))],t+k*st,.05-k*.004);i+=dir*(Math.random()<.7?1:2)}}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{sparkle();if(++gap%5===0)nextChord();schedule()},rnd(1300,2600))}

function fade(to,sec){if(!master)return;const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(to,t+sec)}
async function play(){
 if(!on||hidden)return;
 if(!ctx&&!build())return;
 try{if(ctx.state!=='running')await ctx.resume()}catch(e){}
 if(ctx.state!=='running')return;
 fade(LEVEL,started?1.5:FADE_IN);started=true;schedule()}
function pause(sec){clearTimeout(timer);if(!ctx)return;fade(0,sec);setTimeout(()=>{if(ctx&&(!on||hidden)&&master.gain.value<.01)ctx.suspend().catch(()=>{})},sec*1000+120)}

const API=window.XiaAmbient={
 get on(){return on},
 get playing(){return !!(on&&started&&ctx&&ctx.state==='running')},
 setOn(v){on=!!v;store(KEY,on?'1':'0');if(on)play();else pause(1);document.dispatchEvent(new CustomEvent('xia-amb',{detail:on}))}};

/* mulai: tunggu intro selesai. Sentuhan SEBELUM intro selesai (mis. ketuk untuk lewati / buka suara intro) tetap dihitung:
   AudioContext dibuka di dalam gesture itu, jadi begitu intro selesai musik langsung masuk tanpa perlu ketuk lagi.
   Event aktivasi: touch pakai pointerup/touchend/click (pointerdown TIDAK membuka audio di Chrome Android). */
const GEV=['pointerup','touchend','click','keydown'];
let listening=false,gestured=false,introDone=false;
function onGesture(){
 gestured=true;
 if(on){ if(!ctx)build(); if(ctx&&ctx.state!=='running')ctx.resume().catch(()=>{}) }
 if(introDone)kick()}
function listen(){if(listening)return;listening=true;GEV.forEach(e=>addEventListener(e,onGesture,{capture:true,passive:true}))}
function unlisten(){if(!listening)return;listening=false;GEV.forEach(e=>removeEventListener(e,onGesture,{capture:true}))}
async function kick(){await play();if(started&&ctx&&ctx.state==='running')unlisten()}
function finish(){
 if(introDone)return;introDone=true;
 if(gestured)return kick();
 /* kalau browser mengizinkan autoplay (mis. sudah sering berinteraksi / PWA terpasang), langsung jalan */
 setTimeout(()=>{if(on&&!started&&!document.hidden){try{const t=new (window.AudioContext||window.webkitAudioContext)();const ok=t.state==='running';t.close();if(ok)kick()}catch(e){}}},400)}
function whenIntroDone(){
 listen();
 if(!R.classList.contains('piwo-intro'))return finish();
 const mo=new MutationObserver(()=>{if(!R.classList.contains('piwo-intro')){mo.disconnect();setTimeout(finish,700)}});
 mo.observe(R,{attributes:true,attributeFilter:['class']});
 setTimeout(()=>{mo.disconnect();finish()},15000)} /* jaga-jaga */

document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)pause(.6);else if(started)play()});
const bind=()=>{const t=document.getElementById('toggle-amb');if(t){t.checked=on;t.addEventListener('change',()=>API.setOn(t.checked))}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();whenIntroDone()});else{bind();whenIntroDone()}

/* Tombol mute ambient: ikut barisan tombol di header (sebelah mode gelap), sinkron dengan switch "Musik Latar" di Pengaturan.
   Dulu melayang di kanan bawah dan menutupi Piwo. */
(()=>{
 const ON='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
 const OFF='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.6 2 2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4-2.4-2.4z"/></svg>';
 const css=document.createElement('style');
 css.textContent='#amb-fab{position:relative;flex:none;width:40px;height:40px;padding:0;border-radius:50%;display:inline-grid;place-items:center;color:var(--md-sys-color-primary,#1B6B51);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .15s,opacity .2s}'
 +'#amb-fab:active{transform:scale(.88)}#amb-fab[aria-pressed="false"]{color:var(--md-sys-color-on-surface-variant,#58655e);opacity:.8}'
 +'#amb-fab.amb-float{position:fixed;top:calc(env(safe-area-inset-top,0px) + 14px);right:14px;z-index:60}'
 +'html.piwo-intro #amb-fab{display:none}'
 +'.amb-host{gap:6px!important}@media(max-width:420px){.amb-host>*{width:36px!important;height:36px!important;min-width:0}.amb-host svg.piwo-ico{width:22px;height:22px}}';
 document.head.appendChild(css);
 const mk=()=>{
  if(document.getElementById('amb-fab'))return;
  const b=document.createElement('button');b.id='amb-fab';b.type='button';b.className='m3-spring-btn xia-glass-btn';
  let last='';const ui=()=>{const live=API.playing,k=live?'1':'0';if(k===last)return;last=k;b.innerHTML=live?ON:OFF;b.setAttribute('aria-pressed',live?'true':'false');b.setAttribute('aria-label',live?'Matikan musik latar':'Nyalakan musik latar');b.title=b.getAttribute('aria-label')};
  b.addEventListener('click',async()=>{
   /* kalau musik 'aktif' tapi belum bunyi (browser menahan), ketukan ini MENYALAKAN, bukan mematikan */
   if(API.on&&!API.playing){introDone=true;await kick();ui();return}
   const v=!API.on;const t=document.getElementById('toggle-amb');if(t)t.checked=v;API.setOn(v);if(v){introDone=true;await kick()}last='';ui()});
  document.addEventListener('xia-amb',()=>{last='';ui()});ui();setInterval(ui,1200);
  const mode=document.querySelector('header [data-xia-mode]'),host=mode&&mode.parentElement;
  if(host){host.classList.add('amb-host');host.insertBefore(b,mode)}
  else{b.classList.add('amb-float');document.body.appendChild(b)}};
 if(document.body)mk();else document.addEventListener('DOMContentLoaded',mk);
})();
})();
