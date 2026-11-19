/* Ambient ala menu PS5: pad dalam yang pelan "bernapas", kilau tinggi samar, dan sesekali denting lembut.
   Disintesis langsung lewat WebAudio (tanpa file audio). Mulai setelah intro selesai & ada sentuhan pertama.
   Dikontrol toggle "Musik Latar" di Pengaturan (localStorage: xia_amb). */
(()=>{
'use strict';
const KEY='xia_amb',R=document.documentElement;
const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
let on=store(KEY)!=='0',ctx=null,master=null,bus=null,started=false,timer=0,hidden=false;
const LEVEL=.34,FADE_IN=6,rnd=(a,b)=>a+Math.random()*(b-a);

function impulse(c,sec){ /* reverb buatan: noise stereo yang meluruh */
 const n=c.sampleRate*sec|0,b=c.createBuffer(2,n,c.sampleRate);
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}
 return b}

function build(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 ctx=new AC();
 master=ctx.createGain();master.gain.value=0;
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;
 master.connect(comp);comp.connect(ctx.destination);
 const dry=ctx.createGain();dry.gain.value=.55;dry.connect(master);
 const rev=ctx.createConvolver();rev.buffer=impulse(ctx,4.2);
 const wet=ctx.createGain();wet.gain.value=.9;rev.connect(wet);wet.connect(master);
 bus=ctx.createGain();bus.gain.value=1;bus.connect(dry);bus.connect(rev);
 /* filter global yang pelan membuka-menutup */
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.4;lp.connect(bus);
 const lfo=(rate,depth,target,phase)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g);g.connect(target);o.start(ctx.currentTime+(phase||0));return o};
 lfo(.045,380,lp.frequency);
 /* pad: akor Dmaj9 yang lapang, tiap suara bernapas dengan kecepatan sendiri */
 const chord=[[73.42,.26],[110,.2],[146.83,.18],[185,.12],[220,.12],[329.63,.07],[440,.04]];
 chord.forEach(([f,v],i)=>{
  [-6,6].forEach((det,j)=>{
   const o=ctx.createOscillator();o.type=j?'triangle':'sine';o.frequency.value=f;o.detune.value=det+rnd(-3,3);
   const g=ctx.createGain();g.gain.value=v*.5;
   o.connect(g);g.connect(lp);o.start();
   lfo(rnd(.025,.09),v*.32,g.gain,rnd(0,8)); /* amplitudo naik-turun pelan */
  })});
 /* kilau tinggi samar */
 [1174.66,1479.98].forEach((f,i)=>{const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;const g=ctx.createGain();g.gain.value=.012;
  o.connect(g);g.connect(rev);o.start();lfo(.07+i*.03,.011,g.gain,i*3)});
 return true}

function sparkle(){ /* denting lembut acak dari pentatonik D mayor */
 if(!ctx||!on||hidden||ctx.state!=='running'||!bus)return;
 const f=[587.33,659.25,739.99,880,987.77,1174.66,1318.51][Math.random()*7|0],t=ctx.currentTime;
 const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+3.2);g.connect(bus);
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
