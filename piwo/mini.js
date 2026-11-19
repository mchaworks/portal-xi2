/* Piwo mini: teman ringan untuk halaman NGL & Kamera (tanpa WebGL). Muncul di pojok, jarang bicara, tidak menutupi konten. */
(()=>{
'use strict';
const sc=document.currentScript,base=sc&&sc.src?sc.src:location.href,IMG=new URL('../icons/piwo.png',base).href;
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
let bubT=0,lastIdle=0,box,img,bub;
const CSS=`
#pm{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:60;width:58px;height:58px;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;opacity:0;transform:translateY(90px);transition:transform .7s cubic-bezier(.22,1.3,.36,1),opacity .4s}
#pm.on{opacity:1;transform:none}
#pm img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 6px 8px rgba(0,0,0,.22));transform-origin:50% 90%;${calm?'':'animation:pmBob 3.4s ease-in-out infinite'}}
#pm.hop img{animation:pmHop .5s cubic-bezier(.3,1.5,.5,1)}
@keyframes pmBob{50%{transform:translateY(-3px) scaleY(1.03)}}
@keyframes pmHop{0%{transform:scale(1.2,.8)}40%{transform:translateY(-14px) scale(.92,1.1)}100%{transform:none}}
#pm-b{position:fixed;right:76px;bottom:calc(26px + env(safe-area-inset-bottom,0px));z-index:60;max-width:min(62vw,230px);padding:10px 14px;border-radius:20px 20px 6px 20px;font:700 13px/1.35 Inter,system-ui,sans-serif;
 background:var(--md-sys-color-surface-container-high,#fff);color:var(--md-sys-color-on-surface,#111);border:1px solid var(--md-sys-color-outline-variant,rgba(0,0,0,.12));box-shadow:0 10px 26px -10px rgba(0,0,0,.35);
 opacity:0;transform:translateY(8px) scale(.94);transform-origin:100% 100%;transition:opacity .25s,transform .35s cubic-bezier(.22,1.3,.36,1);pointer-events:none}
#pm-b.on{opacity:1;transform:none}
body::after{content:'';display:block;height:76px}
@media(prefers-reduced-motion:reduce){#pm,#pm-b{transition:opacity .2s}}`;
function say(t,ms){if(!bub||!t)return;clearTimeout(bubT);bub.textContent=t;bub.classList.add('on');bubT=setTimeout(()=>bub.classList.remove('on'),ms||3600)}
function hop(){if(calm||!box)return;box.classList.remove('hop');void box.offsetWidth;box.classList.add('hop')}
const P={lines:['Hai! Aku Piwo~','Semangat ya!','Colek aku lagi dong~'],
 say(t,ms){hop();say(t,ms)},
 /* komentar tambahan, ada jeda minimum biar tidak berisik */
 hint(t){const n=Date.now();if(n-lastIdle<20000)return;lastIdle=n;P.say(t)}};
window.PiwoMini=P;
function mount(){
 const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 box=document.createElement('button');box.type='button';box.id='pm';box.setAttribute('aria-label','Piwo');box.innerHTML='<img alt="" decoding="async">';img=box.firstChild;img.src=IMG;
 bub=document.createElement('div');bub.id='pm-b';bub.setAttribute('role','status');bub.setAttribute('aria-live','polite');
 document.body.appendChild(bub);document.body.appendChild(box);
 box.addEventListener('click',()=>{try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}P.say(P.lines[Math.random()*P.lines.length|0])});
 setTimeout(()=>box.classList.add('on'),600);
 /* sapaan sekali per sesi per halaman */
 let seen=false;const k='piwo-mini:'+location.pathname;try{seen=!!sessionStorage.getItem(k);sessionStorage.setItem(k,'1')}catch(_){}
 if(!seen&&P.hello)setTimeout(()=>{if(!document.hidden)P.say(P.hello,4200)},1700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
