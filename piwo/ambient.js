/* Ambient ala menu PS5: pad dalam yang pelan "bernapas", kilau tinggi samar, dan sesekali denting lembut.
   Disintesis langsung lewat WebAudio (tanpa file audio). Mulai setelah intro selesai & ada sentuhan pertama.
   Dikontrol toggle "Musik Latar" di Pengaturan (localStorage: xia_amb). */
(()=>{
'use strict';
const KEY='xia_amb',R=document.documentElement;
const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
let on=store(KEY)!=='0',ctx=null,master=null,bus=null,started=false,timer=0,hidden=false;
const LEVEL=.34,FADE_IN=6,rnd=(a,b)=>a+Math.random()*(b-a);

function build(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 /* latencyHint 'playback' = buffer lebih besar, jauh lebih tahan glitch/kresek di HP */
 try{ctx=new AC({latencyHint:'playback'})}catch(e){ctx=new AC()}
 const lite=(R.dataset.perf||'mid')==='lite';
 master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
 bus=ctx.createGain();bus.gain.value=1;
 const dry=ctx.createGain();dry.gain.value=.7;bus.connect(dry);dry.connect(master);
 /* "reverb" murah: dua delay berumpan balik + lowpass (jauh lebih ringan daripada convolver) */
 if(!lite)[[.37,.42,-1],[.53,.38,1]].forEach(([d,fb,pan])=>{
  const dl=ctx.createDelay(1);dl.delayTime.value=d;const f=ctx.createGain();f.gain.value=fb;
  const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=1800;
  const wet=ctx.createGain();wet.gain.value=.35;
  bus.connect(dl);dl.connect(tone);tone.connect(f);f.connect(dl);tone.connect(wet);
  if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan*.5;wet.connect(p);p.connect(master)}else wet.connect(master)});
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.3;lp.connect(bus);
 const lfo=(rate,depth,target)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g);g.connect(target);o.start();return g};
 lfo(.045,350,lp.frequency);
 /* pad: akor D mayor lapang. Satu LFO per nada (dipakai bersama), bukan per oscillator */
 const chord=lite?[[73.42,.3],[110,.24],[220,.14]]:[[73.42,.28],[110,.22],[146.83,.18],[185,.12],[220,.12]];
 chord.forEach(([f,v])=>{
  const g=ctx.createGain();g.gain.value=v*.55;g.connect(lp);
  const l=lfo(rnd(.03,.09),v*.3,g.gain);
  [lite?0:-5,5].slice(lite?1:0).forEach((det,k)=>{const o=ctx.createOscillator();o.type=k?'triangle':'sine';o.frequency.value=f;o.detune.value=det;o.connect(g);o.start()})});
 return true}
function sparkle(){ /* denting lembut acak dari pentatonik D mayor */
 if(!ctx||!on||hidden||ctx.state!=='running'||!bus)return;
 const f=[587.33,659.25,739.99,880,987.77,1174.66,1318.51][Math.random()*7|0],t=ctx.currentTime;
 const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+3.2);g.connect(bus);
 [[f,1],[f*2.001,.18]].forEach(([fr,v])=>{const o=ctx.createOscillator(),h=ctx.createGain();o.type='sine';o.frequency.value=fr;h.gain.value=v;o.connect(h);h.connect(g);o.start(t);o.stop(t+3.4)})}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{sparkle();schedule()},rnd(7000,15000))}

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
 setOn(v){on=!!v;store(KEY,on?'1':'0');if(on)play();else pause(1)}};

/* mulai: tunggu intro selesai, lalu sentuhan pertama (aturan autoplay browser) */
let armed=false;
function arm(){
 if(armed)return;armed=true;
 const go=()=>{['pointerdown','keydown','touchend'].forEach(e=>removeEventListener(e,go,true));play()};
 ['pointerdown','keydown','touchend'].forEach(e=>addEventListener(e,go,{capture:true,passive:true}));
 /* kalau browser mengizinkan autoplay (mis. sudah pernah berinteraksi), langsung jalan */
 setTimeout(()=>{if(on&&!document.hidden){try{const t=new (window.AudioContext||window.webkitAudioContext)();const ok=t.state==='running';t.close();if(ok)go()}catch(e){}}},400)}
function whenIntroDone(){
 if(!R.classList.contains('piwo-intro'))return arm();
 const mo=new MutationObserver(()=>{if(!R.classList.contains('piwo-intro')){mo.disconnect();setTimeout(arm,700)}});
 mo.observe(R,{attributes:true,attributeFilter:['class']});
 setTimeout(()=>{mo.disconnect();arm()},15000)} /* jaga-jaga */

document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)pause(.6);else if(started)play()});
const bind=()=>{const t=document.getElementById('toggle-amb');if(t){t.checked=on;t.addEventListener('change',()=>API.setOn(t.checked))}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();whenIntroDone()});else{bind();whenIntroDone()}
})();
