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
