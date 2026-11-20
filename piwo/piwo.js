/* Piwo: sutradara maskot. Intro loncat ke tengah, tinggal di pojok tiap halaman, ikut masuk ke chat Labz AI. */
(()=>{
window.PIWO_BUILD='25-intro-zoom';
const R=document.documentElement,calm=matchMedia('(prefers-reduced-motion: reduce)').matches,tier=R.dataset.perf||'mid';
/* ---- pause total saat tab/PWA di background: timer, jam animasi, suara, dan semua animasi CSS/WAAPI ---- */
const WQ=new Set();let hid=0,hAt=0,paused=[];
const vnow=()=>performance.now()-hid;
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){hAt=performance.now();WQ.forEach(h=>h.pause());
  try{paused=document.getAnimations().filter(a=>a.playState==='running');paused.forEach(a=>a.pause())}catch(e){paused=[]}
  try{const c=m&&m.sfx&&m.sfx.ctx;if(c&&c.state==='running')c.suspend()}catch(e){}}
 else{hid+=performance.now()-hAt;WQ.forEach(h=>h.resume());paused.forEach(a=>{try{a.play()}catch(e){}});paused=[];
  try{const c=m&&m.sfx&&m.sfx.ctx;if(c&&c.state==='suspended'&&!skip)c.resume()}catch(e){}}});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wait=ms=>new Promise(r=>{let left=ms,t=0,st=0;const go=()=>{st=performance.now();t=setTimeout(done,Math.max(0,left))},done=()=>{t=0;WQ.delete(h);r()},h={pause(){if(t){clearTimeout(t);t=0;left-=performance.now()-st}},resume(){if(!t)go()}};WQ.add(h);if(!document.hidden)go()}),$=id=>document.getElementById(id);
const host=document.createElement('div');host.id='piwo-host';host.style.cssText='position:fixed;left:0;top:0;pointer-events:none;will-change:transform';document.body.appendChild(host);
let m,cur={x:0,y:0,s:90},at='home',busy=false,skip=false,tk=0,lock=false;
let panelOpen=false,tilt=0; /* tilt (derajat) cuma dipakai intro */
let hv=0,hr=0,bigS=0; /* hv/hr: offset melayang (px/derajat), cuma dipakai intro */
let lastS=-1,lastT='';const setT=v=>{if(v!==lastT){lastT=v;host.style.transform=v}};const put=a=>{cur=a;
 if(bigS){if(lastS!==bigS){lastS=bigS;host.style.width=host.style.height=bigS+'px'}const k=a.s/bigS,o=(a.s-bigS)/2,rr=tilt+hr;setT('translate('+(a.x+o).toFixed(1)+'px,'+(a.y+hv+o).toFixed(1)+'px)'+(rr?' rotate('+rr.toFixed(2)+'deg)':'')+' scale('+k.toFixed(4)+')');return}
 if(a.s!==lastS){lastS=a.s;host.style.width=host.style.height=a.s+'px'}const rr=tilt+hr;setT('translate('+a.x.toFixed(1)+'px,'+(a.y+hv).toFixed(1)+'px)'+(rr?' rotate('+rr.toFixed(2)+'deg)':''))};
const setZ=z=>{[m.gl,m.fx,m.bub].forEach((e,i)=>e.style.zIndex=z+i);const w=$('pp-acc-wrap');if(w)w.style.zIndex=z+1};
const A={
 home(){const s=clamp(innerWidth*.15,52,76),f=$('labz-ai-fab'),d=$('liquid-glass-dock'),fr=f&&f.getBoundingClientRect(),t=fr?fr.top:(d?d.getBoundingClientRect().top:innerHeight-90);return{x:(fr?fr.left+fr.width/2:innerWidth-s)-s/2,y:t-s*.92-4,s}},
 center(){const s=Math.min(innerWidth*.52,innerHeight*.34,280);return{x:(innerWidth-s)/2,y:(innerHeight-s)/2-innerHeight*.03,s}},
 pet(){const sh=document.querySelector('#piwo-pet .pp-sheet'),top=sh&&panelOpen?sh.getBoundingClientRect().top:innerHeight-340,s=clamp(Math.min(innerWidth*.42,innerHeight*.26),110,190);return{x:(innerWidth-s)/2,y:top+6-s*.92,s}},
 game(){const s=clamp(innerWidth*.17,56,76);return{x:innerWidth-s-8,y:innerHeight-s*.92-18,s}},
 chat(){const e=$('xc-piwo');if(!e)return A.home();const r=e.getBoundingClientRect(),s=r.width*1.15;return{x:r.left+r.width/2-s/2,y:r.bottom+4-s*.92,s}}
};
/* terbang: busur parabola + squash tiap mendarat */
const fly=(to,o)=>new Promise(res=>{o=Object.assign({dur:900,hops:1,h:.26},o);const a=Object.assign({},cur),t0=vnow();let k=-1;busy=true;
 const f=n=>{if(skip&&!o.force){busy=false;res();return}const t=Math.min(1,(n-hid-t0)/o.dur),T=typeof to=='function'?to():to,e=(o.lin||o.hops>1)?t:t*t*(3-2*t),ph=t*o.hops,
  arc=t>=1?0:Math.abs(Math.sin(ph*Math.PI))*o.h*innerHeight*(o.hops>1?1-t*.55:1);
  if(m&&t<1&&Math.floor(ph)!==k){k=Math.floor(ph);m.sy.kick(-2.6);m.flash('happy',.5)}
  put({x:a.x+(T.x-a.x)*e,y:a.y+(T.y-a.y)*e-arc,s:a.s+(T.s-a.s)*e});
  if(t<1)requestAnimationFrame(f);else{busy=false;if(m&&(!skip||o.force))m.squish(1.5);res()}};
 requestAnimationFrame(f)});
/* gerak lurus dengan easing bebas (dipakai intro); tt = target kemiringan (derajat) */
const move=(to,dur,ease,tt)=>new Promise(res=>{const a=Object.assign({},cur),t0=vnow(),k0=tilt;busy=true;
 const f=n=>{if(skip){busy=false;res();return}const t=Math.min(1,(n-hid-t0)/dur),e=ease(t);tilt=tt==null?tilt:k0+(tt-k0)*t;put({x:a.x+(to.x-a.x)*e,y:a.y+(to.y-a.y)*e,s:a.s+(to.s-a.s)*e});if(t<1)requestAnimationFrame(f);else{busy=false;res()}};requestAnimationFrame(f)});
/* gravitasi: naik = melambat sampai puncak (kecepatan 0), jatuh = makin ngebut */
const rise=t=>1-Math.pow(1-t,1.7),fall=t=>t*t;
/* melayang di puncak: bobbing pelan + miring, selama fn() berjalan */
const hang=async(c,fn)=>{let on=true;const t0=performance.now();busy=true;
 const f=n=>{if(!on)return;const k=(n-t0)/1000;tilt+=(-11-tilt)*.06;put({x:c.x+Math.sin(k*1.3)*3,y:c.y-Math.min(k,1.6)*9+Math.sin(k*2.2)*3,s:c.s});requestAnimationFrame(f)};requestAnimationFrame(f);
 try{await fn()}finally{on=false;busy=false}};
/* ================= INTRO v5 "Kamera" (±4,5 dtk): rack focus, bokeh, Piwo nyosor ke lensa, cekrek =================
   Piwo ngintip, BOING ke tengah, nyapa, lalu "Cheese~!" cekrek. Tanpa panel. Penutup: layar terbuka, loncat ke pojok.
   (catatan lama v3:
   Piwo ngintip malu-malu dari bawah, jongkok, BOING melesat (jejak bintang), salto di puncak sambil hati beterbangan,
   nyapa, kaget, jatuh "wheee", POOF di dasar layar, layar utama terbuka melingkar dari titik jatuh, Piwo loncat ke pojok. */
const rnd=(a,b)=>a+Math.random()*(b-a);
const PFX=(()=>{let box;const COL=['#6ee7b7','#7dd3fc','#f9a8d4','#fde68a','#ffffff'];
 const mk=()=>{if(!box||!box.isConnected){box=document.createElement('div');box.id='piwo-fx';box.style.cssText='position:fixed;inset:0;z-index:220;pointer-events:none;overflow:hidden';document.body.appendChild(box)}return box};
 const spark=(x,y,o)=>{if(calm||!document.body)return;o=o||{};const e=document.createElement('i'),sz=o.sz||rnd(10,20),col=o.col||COL[Math.random()*COL.length|0],dx=o.dx!=null?o.dx:rnd(-40,40),dy=o.dy!=null?o.dy:rnd(-50,-10),op=o.op||1;
  e.textContent=o.ch||'✦';e.style.cssText='position:absolute;left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px;font:'+sz.toFixed(0)+'px/1 system-ui,sans-serif;font-style:normal;color:'+col+';'+(tier==='high'?'text-shadow:0 0 8px '+col+';':'')+'will-change:transform,opacity;margin:-'+(sz/2).toFixed(0)+'px 0 0 -'+(sz/2).toFixed(0)+'px';
  mk().appendChild(e);
  const a=e.animate([{transform:'translate(0,0) scale(.2) rotate(0deg)',opacity:0},{transform:'translate('+dx*.5+'px,'+dy*.5+'px) scale(1) rotate(90deg)',opacity:op,offset:.25},{transform:'translate('+dx+'px,'+dy+'px) scale(.3) rotate(220deg)',opacity:0}],{duration:o.d||rnd(700,1100),easing:'cubic-bezier(.2,.7,.3,1)'});a.onfinish=()=>e.remove()};
 const burst=(x,y,n,spd,up)=>{for(let i=0;i<n;i++){const ang=up?-Math.PI*(.1+.8*i/Math.max(1,n-1)):Math.PI*2*i/n+rnd(-.2,.2),r=rnd(.6,1)*spd,h=Math.random()<.35;
  spark(x,y,{dx:Math.cos(ang)*r,dy:Math.sin(ang)*r,ch:h?'♥':'✦',col:h?'#f9a8d4':null,sz:h?rnd(14,22):rnd(10,18)})}};
 return{spark,burst,clear:()=>{box&&box.remove();box=null}}})();
async function intro(){
 const S=m.sfx;
 const rm=()=>{const b=document.getElementById('piwo-snd');b&&b.remove()};
 /* browser memblokir suara sebelum ada sentuhan: kalau masih tertahan, tampilkan tombol kecil (tidak ikut melewati intro) */
 const chip=()=>{if(document.getElementById('piwo-snd')||R.classList.contains('piwo-out'))return;const b=document.createElement('button');b.id='piwo-snd';b.type='button';b.textContent='🔊 Ketuk untuk suara';
  b.style.cssText='position:fixed;left:50%;bottom:calc(28px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:215;padding:12px 20px;border:0;border-radius:99px;font:700 14px Inter,system-ui,sans-serif;background:rgba(27,107,81,.94);color:#fff;box-shadow:0 8px 24px -8px rgba(0,0,0,.45);opacity:0;transition:opacity .4s';
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.addEventListener('click',()=>{S.init();Promise.resolve(S.ctx&&S.ctx.resume&&S.ctx.resume()).then(()=>{if(!skip){S.musicStart();S.pop()}});b.remove()});
  document.body.appendChild(b);requestAnimationFrame(()=>{b.style.opacity=1})};
 const audioStart=()=>{if(!S.on)return;S.init();setTimeout(()=>{if(skip)return;if(!S.ctx||S.ctx.state==='running')S.musicStart();else chip()},180)};
 let amb=0,ttl=null,trail=0;
 const out=()=>{clearInterval(amb);clearInterval(trail);try{hoverOff()}catch(e){}R.classList.add('piwo-out');S.musicStop(.7);rm();if(ttl)ttl.animate([{opacity:1},{opacity:0}],{duration:300,fill:'forwards'});setTimeout(()=>{R.classList.remove('piwo-intro','piwo-out');ttl&&ttl.remove()},1050)};
 if(calm){put(A.home());out();return}
 lock=true;const W=innerWidth,H=innerHeight,tier2=tier==='lite',s=Math.min(W*.3,H*.16,128),c={x:(W-s)/2,y:(H-s)/2,s},below={x:c.x,y:H+s*.25,s},peek={x:c.x,y:H-s*.72,s},ctr=()=>({x:cur.x+cur.s/2,y:cur.y+cur.s/2});
 const big=Math.min(W*.86,H*.46,330),bc={x:(W-big)/2,y:(H-big)/2-H*.02,s:big};
 const nap=ms=>skip?Promise.resolve():wait(ms);
 const io=t=>t*t*(3-2*t),blurOk=false;
 bigS=Math.max(bc.s,s);put(below);setZ(210);
 const sk=()=>{skip=true;m.hush();S.musicStop(.3);rm()};addEventListener('pointerdown',sk,{once:true});
 const sp=document.getElementById('piwo-splash'),dark=R.dataset.mode==='dark',ink=dark?'#bfeedd':'#1B6B51';
 /* ---- suara kamera (dirakit dari sfx yang sudah ada, tanpa file baru) ---- */
 const bip=()=>S.vt(1760,1760,.07,{v:.05,a:.004});
 const shutter=()=>{S.noise(.05,3600,.7,.3,0,'highpass');S.noise(.07,1500,1,.28,.09,'bandpass');S.vt(1900,1200,.04,{v:.05,d:.01})};
 const flashEl=()=>{if(!document.body)return;const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:216;background:#fff;pointer-events:none;opacity:0';document.body.appendChild(f);f.animate([{opacity:0},{opacity:.9,offset:.16},{opacity:0}],{duration:380,easing:'ease-out'}).onfinish=()=>f.remove()};
 const ripple=()=>{if(!document.body)return;const q=ctr(),r=document.createElement('i');r.style.cssText='position:fixed;left:'+(q.x-30)+'px;top:'+(q.y-30)+'px;width:60px;height:60px;border-radius:50%;border:3px solid rgba(255,255,255,.95);'+(tier==='high'?'box-shadow:0 0 18px rgba(255,255,255,.7);':'')+'z-index:214;pointer-events:none';document.body.appendChild(r);r.animate([{transform:'scale(.3)',opacity:1},{transform:'scale(3.4)',opacity:0}],{duration:560,easing:'ease-out'}).onfinish=()=>r.remove()};
 /* ---- panggung: kertas titik + bokeh lensa + bingkai viewfinder ---- */
 if(!document.getElementById('pi-css')){const st=document.createElement('style');st.id='pi-css';st.textContent=
  '.pi-stage{position:absolute;inset:0;will-change:transform,filter}'+
  '.pi-paper{position:absolute;inset:0;background-image:radial-gradient(rgba(27,107,81,.16) 1.3px,transparent 1.6px);background-size:22px 22px;-webkit-mask-image:radial-gradient(75% 65% at 50% 45%,#000 30%,transparent 100%);mask-image:radial-gradient(75% 65% at 50% 45%,#000 30%,transparent 100%)}'+
  'html[data-mode="dark"] .pi-paper{background-image:radial-gradient(rgba(191,238,221,.14) 1.3px,transparent 1.6px)}'+
  '.pi-bkw{position:absolute;inset:0;will-change:transform}'+
  '.pi-bk{position:absolute;border-radius:50%;will-change:transform,opacity;animation:pi-bk 2.4s ease-in-out infinite alternate;background:radial-gradient(circle,rgba(var(--bk),.30) 0 58%,rgba(var(--bk),.62) 62% 67%,transparent 71%)}'+
  'html[data-mode="dark"][data-perf="high"] .pi-bk{mix-blend-mode:screen}'+
  '@keyframes pi-bk{from{transform:translate(-7px,8px) scale(.88);opacity:.5}to{transform:translate(9px,-9px) scale(1.12);opacity:.95}}'+
  '.pi-dd{position:absolute;font-style:normal;line-height:1;opacity:.85;animation:pi-fl 2.2s ease-in-out infinite alternate;will-change:transform}'+
  '@keyframes pi-fl{from{transform:translateY(-5px) rotate(-8deg)}to{transform:translateY(6px) rotate(8deg)}}'+
  '.pi-vf{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 12px) 14px calc(env(safe-area-inset-bottom,0px) + 12px);pointer-events:none}'+
  '.pi-vf i{position:absolute;width:22px;height:22px;border:0 solid currentColor;opacity:.6}'+
  '.pi-vf i:nth-child(1){left:0;top:0;border-width:3px 0 0 3px;border-top-left-radius:9px}.pi-vf i:nth-child(2){right:0;top:0;border-width:3px 3px 0 0;border-top-right-radius:9px}'+
  '.pi-vf i:nth-child(3){left:0;bottom:0;border-width:0 0 3px 3px;border-bottom-left-radius:9px}.pi-vf i:nth-child(4){right:0;bottom:0;border-width:0 3px 3px 0;border-bottom-right-radius:9px}'+
  '.pi-rec{position:absolute;left:30px;top:9px;display:flex;align-items:center;gap:5px;font:800 10px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;opacity:.8}'+
  '.pi-rec:before{content:"";width:8px;height:8px;border-radius:50%;background:#f43f5e;animation:pi-rec .7s steps(2) infinite}@keyframes pi-rec{50%{opacity:.15}}'+
  '.pi-fx{position:absolute;border:2.5px solid #facc15;border-radius:14px;pointer-events:none;box-shadow:0 0 14px rgba(250,204,21,.5)}'+
  'html[data-perf="lite"] .pi-bk{animation:none;opacity:.75}'+
  'html[data-perf="lite"] .pi-paper{-webkit-mask-image:none;mask-image:none;opacity:.6}'+
  'html:not([data-perf="high"]) .pi-stage{will-change:transform}'+
  '.pi-hint{position:absolute;left:0;right:0;bottom:calc(40px + env(safe-area-inset-bottom,0px));text-align:center;font:600 11.5px Inter,system-ui,sans-serif;letter-spacing:.03em;opacity:.55}';
  document.head.appendChild(st)}
 let stage=null,bkw=null,fx=null;
 if(sp){
  stage=document.createElement('div');stage.className='pi-stage';sp.appendChild(stage);
  const paper=document.createElement('div');paper.className='pi-paper';stage.appendChild(paper);
  bkw=document.createElement('div');bkw.className='pi-bkw';stage.appendChild(bkw);
  [[10,14,86,'110,231,183'],[78,10,64,'125,211,252'],[86,46,98,'249,168,212'],[4,52,70,'253,230,138'],[70,80,90,'110,231,183'],[18,84,60,'125,211,252'],[44,92,74,'249,168,212']].forEach(([x,y,z,col],i)=>{if(i>=(tier2?3:tier==='mid'?5:7))return;const e=document.createElement('i');e.className='pi-bk';e.style.cssText='left:'+x+'%;top:'+y+'%;width:'+z+'px;height:'+z+'px;margin:-'+z/2+'px 0 0 -'+z/2+'px;--bk:'+col+';animation-delay:-'+(i*.55).toFixed(2)+'s;animation-duration:'+(2+i*.3).toFixed(1)+'s';bkw.appendChild(e)});
  [['✦',6,24,22],['♥',88,20,18],['⭐',90,60,20],['♥',12,88,16]].forEach(([ch,x,y,z],i)=>{if(tier2&&i>1)return;const e=document.createElement('i');e.className='pi-dd';e.textContent=ch;e.style.cssText='left:'+x+'%;top:'+y+'%;font-size:'+z+'px;animation-delay:-'+(i*.7)+'s;color:'+['#6ee7b7','#f9a8d4','#bae6fd','#fde68a'][i%4];stage.appendChild(e)});
  ttl=document.createElement('div');ttl.textContent='XI.2 Creative Lab';
  ttl.style.cssText='position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 4.5%);transform:translateX(-50%);padding:9px 18px;border-radius:99px;font:800 15px/1 Inter,system-ui,sans-serif;letter-spacing:.02em;white-space:nowrap;'+(dark?'color:#bfeedd;background:rgba(255,255,255,.08);border:1px solid rgba(191,238,221,.2)':'color:#1B6B51;background:rgba(255,255,255,.75);border:1px solid rgba(27,107,81,.18);box-shadow:0 10px 30px -12px rgba(27,107,81,.5)');
  sp.appendChild(ttl);ttl.animate([{opacity:0,transform:'translate(-50%,-14px) scale(.9)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:420,delay:60,easing:'cubic-bezier(.2,1.4,.4,1)',fill:'backwards'});
  const hint=document.createElement('div');hint.className='pi-hint';hint.textContent='ketuk untuk lewati';hint.style.color=ink;sp.appendChild(hint);hint.animate([{opacity:0},{opacity:.55}],{duration:500,delay:700,fill:'backwards'});
  /* rack focus: dari buram (bokeh) ke tajam */
  if(!calm)stage.animate([{filter:blurOk?'blur(14px)':'none',transform:'scale(1.18)'},{filter:blurOk?'blur(0px)':'none',transform:'scale(1)'}],{duration:760,easing:'ease-out',fill:'forwards'})
 }
 /* dolly: Piwo ngedeket = latar buram + membesar (depth of field); mundur = balik tajam */
 const dolly=on=>{if(!stage)return;const a=on?['blur(0px)','scale(1)','blur(8px)','scale(1.08)']:['blur(8px)','scale(1.08)','blur(0px)','scale(1)'];
  stage.animate([{filter:blurOk?a[0]:'none',transform:a[1]},{filter:blurOk?a[2]:'none',transform:a[3]}],{duration:340,easing:'ease-out',fill:'forwards'});
  bkw&&bkw.animate(on?[{transform:'scale(1)'},{transform:'scale(1.55)'}]:[{transform:'scale(1.55)'},{transform:'scale(1)'}],{duration:340,easing:'ease-out',fill:'forwards'})};
 const focus=(on)=>{if(!sp)return;if(!on){fx&&fx.remove();fx=null;return}const q=ctr(),z=cur.s*1.3;fx=document.createElement('div');fx.className='pi-fx';fx.style.cssText='left:'+(q.x-z/2)+'px;top:'+(q.y-z/2)+'px;width:'+z+'px;height:'+z+'px';sp.appendChild(fx);
  fx.animate([{transform:'scale(1.7)',opacity:0},{transform:'scale(.94)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}],{duration:260,easing:'ease-out'})};
 amb=setInterval(()=>{if(!skip&&!document.hidden)PFX.spark(rnd(0,W),H+10,{ch:'●',sz:rnd(8,18),dx:rnd(-30,30),dy:-rnd(H*.25,H*.6),d:rnd(2000,3200),col:['#a7f3d0','#bae6fd','#fbcfe8'][Math.random()*3|0],op:.4})},tier2?900:tier==='mid'?420:300);
 /* ---- kekuatan melayang (hover): Piwo naik pelan, lalu ngambang bobbing di tengah dengan bayangan + percikan di bawahnya ---- */
 let hovOn=false,hovT=0,hovRaf=0,shadow=null,hovSpark=0;
 const hoverOn=()=>{if(hovOn||calm)return;hovOn=true;hovT=performance.now();
  if(sp&&!shadow){shadow=document.createElement('i');shadow.style.cssText='position:fixed;left:0;top:0;z-index:209;pointer-events:none;border-radius:50%;background:radial-gradient(closest-side,rgba(15,70,50,.34),rgba(15,70,50,0));opacity:0;will-change:transform,opacity';document.body.appendChild(shadow)}
  const f=n=>{if(!hovOn)return;const k=(n-hovT)/1000,amp=Math.min(1,k/.7);hv=Math.sin(k*2.3)*7*amp-5*amp;hr=Math.sin(k*1.5)*2.6*amp;
   if(!busy)put(cur);
   if(shadow){const q=cur,gy=Math.min(H-10,q.y+q.s*.98+30),w=q.s*(.74-hv*.012),op=Math.max(0,(.5+hv*.02)*amp);shadow.style.transform='translate('+(q.x+q.s/2-w/2).toFixed(1)+'px,'+gy.toFixed(1)+'px) scale(1,.22)';shadow.style.width=shadow.style.height=w.toFixed(0)+'px';shadow.style.opacity=op.toFixed(2)}
   hovRaf=requestAnimationFrame(f)};
  hovRaf=requestAnimationFrame(f);
  hovSpark=setInterval(()=>{if(skip||document.hidden||tier2&&Math.random()<.5)return;const q=ctr();PFX.spark(q.x+rnd(-cur.s*.18,cur.s*.18),q.y+cur.s*.42,{dx:rnd(-10,10),dy:rnd(14,34),sz:rnd(7,12),d:rnd(650,950),op:.8})},tier2?420:230)};
 const hoverOff=()=>{hovOn=false;cancelAnimationFrame(hovRaf);clearInterval(hovSpark);hv=0;hr=0;if(shadow){shadow.remove();shadow=null}};
 const trailOn=()=>{clearInterval(trail);trail=setInterval(()=>{if(skip||document.hidden||tier2&&Math.random()<.5)return;const q=ctr();PFX.spark(q.x+rnd(-cur.s*.22,cur.s*.22),q.y+cur.s*.3,{dx:rnd(-18,18),dy:rnd(10,40),sz:rnd(9,16),d:rnd(450,700)})},tier2?110:tier==='mid'?80:55)},trailOff=()=>clearInterval(trail);
 const talk=(mood,line)=>{if(line){m.hush();m.react(mood);m.say(line,{mood:'happy',speed:80,hold:.4})}else m.react(mood)};
 audioStart();
 await nap(120);
 /* ===== pacing baru: tiap adegan dikasih jeda napas biar sempat dicerna ===== */
 /* 0. layar tenang + judul + bokeh, mata sempat menetap */
 await nap(500);
 /* 1. ngintip malu-malu dari bawah, pelan, lalu kaget sendiri */
 if(!skip){S.peek();m.flash('shy',1.2);await move(peek,650,io,0)}
 await nap(350);
 if(!skip){m.flash('surprised',.7);S.squeak();m.sy.kick(1.4);m.sx.kick(-.8);await nap(450)}
 /* 2. antisipasi: jongkok... lalu MELAYANG naik pelan ke tengah dengan jejak bintang */
 if(!skip){S.squish();m.sy.kick(-3.4);m.sx.kick(2.2);await nap(300)}
 if(!skip){S.boing();S.whoosh();m.flash('happy',1.4);m.sy.kick(2.4);const q=ctr();PFX.burst(q.x,q.y+s*.3,tier2?5:9,s*.9,true);trailOn()}
 await move(c,950,rise,0);trailOff();tilt=0;hoverOn();
 if(!skip){S.twinkle();m.flash('giggle',1.1);const q=ctr();PFX.burst(q.x,q.y,tier2?6:12,s)}
 await nap(500);
 /* 3. perkenalan: Piwo = webnya sendiri. Satu kalimat per adegan biar kebaca */
 if(!skip){S.hello();m.react('wave');m.say('Halo, aku Piwo~',{mood:'happy',speed:60,hold:4});await nap(1400)}
 if(!skip){S.pop();m.flash('happy',1.4);m.say('Aku itu web XI.2 Creative Lab, versi imutnya~',{mood:'happy',speed:52,hold:4});const q=ctr();PFX.burst(q.x,q.y,tier2?4:8,s*.9);await nap(2000)}
 /* 4. ajakan: Piwo maju mendekat, layar terbuka dari dia, lalu dia jaga di pojok */
 if(!skip){S.hello();m.react('wave');m.say('Yuk, explore bareng aku~',{mood:'happy',speed:56,hold:2.6});await nap(1250)}
 /* zoom: Piwo nyosor ke lensa (membesar halus), layar terbuka dari dia, lalu mundur lagi */
 if(!skip){S.whoosh();m.flash('wink',1.6);dolly(true)}
 await move(bc,560,io,0);
 if(!skip){S.pop();m.sy.kick(-2.4);m.sx.kick(1.8);const q=ctr();PFX.burst(q.x,q.y,tier2?6:12,Math.min(W*.4,170));out()}else{S.squish();m.sy.kick(-3.2);m.sx.kick(2.2);await wait(190);out()}
 await nap(520);
 if(!skip)dolly(false);
 /* 4. loncat ke pojok */
 hoverOff();
 const h=A.home();
 if(!skip){S.fly();m.flash('happy',1)}else{S.fly();m.sy.kick(2.8);m.sx.kick(-1.6);m.flash('happy',1)}
 await fly(h,{dur:skip?720:850,h:skip?.15:.09,force:true});
 bigS=0;lastS=-1;put(cur);
 if(!skip){S.pop();const q=ctr();PFX.burst(q.x,q.y,10,h.s*1.1)}
 setZ(60);removeEventListener('pointerdown',sk);skip=false;lock=false;tilt=0;try{sessionStorage.setItem('piwo-intro','1')}catch(e){}
 setTimeout(()=>{PFX.clear();focus(false);sp&&sp.querySelectorAll('.pi-stage,.pi-vf,.pi-hint').forEach(e=>e.remove())},1500);
}
/* ikut ke chat AI */
async function chat(on){
 if(!m)return;
 if(on&&at==='pet'&&window.PiwoPet)await PiwoPet.close(true);
 if(on&&at!=='chat'){at='chat';setZ(160);m.hush();await fly(A.chat,{dur:650,h:.2});if(at==='chat')m.react('wave')}
 else if(!on&&at==='chat'){at='home';await fly(A.home,{dur:700,h:.22});if(at==='home')setZ(60)}
}
/* komentar tiap pindah halaman: komentar lama langsung hilang, yang baru langsung muncul */
const PG={
 beranda:['wave',['Halo! Selamat datang di XI.2~','Hai hai, balik ke beranda!','Mau lihat apa hari ini?']],
 momen:['happy',['Ini sorotan kegiatan kelas kita!','Wah, momen seru nih~','Geser-geser aja fotonya!']],
 jadwal:['nod',['Cek jadwal dulu biar nggak salah mapel~','Hari ini pelajaran apa ya?','Jangan lupa bawa bukunya!']],
 anggota:['love',['Ini temen-temen sekelas, keren semua!','Banyak banget temennya~','Jangan lupa nyapa temen ya!']],
 papan:['surprise',['Tugasnya jangan ditunda ya!','Yuk centang yang udah kelar~','Deadline mengintai, semangat!']]};
let lastPg,lastLine='',pgT=0;
setInterval(()=>{const p=window.__page;if(!m||!p||p===lastPg)return;const first=lastPg===undefined;lastPg=p;window.PiwoPet&&PiwoPet.page(p);
 if(first)return;m.hush();clearTimeout(pgT);const c=PG[p];if(!c||at!=='home'||lock)return;
 pgT=setTimeout(()=>{if(at!=='home'||lock)return;const ls=c[1].filter(x=>x!==lastLine),l=ls[Math.random()*ls.length|0];lastLine=l;m.react(c[0]);m.say(l,{mood:'happy',speed:42})},230)},90);


/* ================= API inti: dipakai pet.js & games.js ================= */
let readyRes;const ready=new Promise(r=>readyRes=r);
window.PiwoCore={ready,clamp,wait,calm,tier,host,put,setZ,fly,A,$,
 get m(){return m},get cur(){return cur},get at(){return at},set at(v){at=v},get busy(){return busy},get lock(){return lock},
 get panelOpen(){return panelOpen},set panelOpen(v){panelOpen=v},get skip(){return skip},chat};

window.Piwo={
 say:(t,o)=>m&&m.say(t,o),react:n=>m&&m.react(n),chat,setSound:on=>m&&m.setSound(on),
 openPet:t=>window.PiwoPet&&PiwoPet.open(t),closePet:()=>window.PiwoPet&&PiwoPet.close(),
 think(on){if(!m)return;if(on){window.PiwoPet&&PiwoPet.quest('chat');m.state='thinking';m.lastAct=performance.now()}else if(m.state==='thinking')m.state='idle'},
 talk(on,t){if(!m)return;clearInterval(tk);if(on)tk=setInterval(()=>m.talkT=Math.random()<.25?.05:.4+Math.random()*.6,90);else{m.talkT=0;m.react(/maaf|belum ada|tidak ada|gagal/i.test(t||'')?'sad':'nod')}},
 fail(){m&&m.react('sad')}
};

/* reaksi kecil di seluruh web: sengaja jarang (ada jeda) supaya tidak berisik */
let buzzAt=0;const pickL=a=>a[Math.random()*a.length|0];
const buzz=(mood,line,cd)=>{const n=Date.now();if(!m||at!=='home'||lock||busy||R.classList.contains('piwo-intro')||n-buzzAt<(cd==null?25000:cd))return;buzzAt=n;m.hush();m.react(mood);if(line)m.say(line,{mood:'happy',speed:42})};
window.Piwo.buzz=buzz;
(()=>{const t0=Date.now();let mode=R.dataset.mode;
 new MutationObserver(()=>{const v=R.dataset.mode;if(v===mode)return;mode=v;if(Date.now()-t0<4000)return;
  buzz(v==='dark'?'yawn':'happy',v==='dark'?'Mode gelap~ adem di mata ya':'Terang lagi! Semangat~')}).observe(R,{attributes:true,attributeFilter:['data-mode']});
 const tl=document.getElementById('tasks-list');
 if(tl)tl.addEventListener('click',e=>{const el=e.target.closest('[data-task-act="toggle"]');if(!el)return;const id=el.dataset.id;
  setTimeout(()=>{const nw=[...tl.querySelectorAll('[data-task-act="toggle"]')].find(x=>x.dataset.id===id);if(!nw||!nw.querySelector('.material-symbols-rounded'))return;
   const c=(document.getElementById('task-counter')||{}).textContent||'',mm=c.match(/(\d+)\/(\d+)/),all=mm&&mm[1]===mm[2];
   buzz(all?'happy':'nod',all?'Semua tugas beres! Keren banget~':pickL(['Mantap, satu tugas kelar!','Yey, centang lagi~','Terus semangat!']),all?0:7000)},120)});
 const sm=document.getElementById('story-modal');
 if(sm)new MutationObserver(()=>{if(!sm.classList.contains('hidden'))buzz('happy','Wah, momen seru ya!',40000)}).observe(sm,{attributes:true,attributeFilter:['class']});
})();

/* easter egg: logo Piwo di header bisa diputer kayak fidget spinner. Tap makin sering = makin ngebut, kebanyakan = Piwo ikut jungkir balik */
(()=>{const box=document.getElementById('header-badge-code'),img=box&&box.querySelector('img');if(!img||calm)return;
 box.style.setProperty('transform','none','important');box.style.setProperty('rotate','none','important');img.style.transform='';
 let ang=0,om=0,run=false,settle=false,tgt=0,last=0,taps=0,tapT=0,sayAt=0;
 const can=()=>m&&at==='home'&&!lock&&!busy&&!panelOpen&&!R.classList.contains('piwo-intro');
 const talk=(mood,l)=>{const n=Date.now();if(n-sayAt<3500||!can())return;sayAt=n;m.hush();m.react(mood);m.say(l,{mood:'happy',speed:42})};
 const stop=()=>{ang=0;om=0;run=false;settle=false;img.style.transform=''};
 /* ngebut -> melambat -> berhenti persis tegak (kelipatan 360) */
 const frame=n=>{const dt=Math.min(.05,(n-last)/1e3);last=n;
  if(!settle){om*=Math.exp(-1.7*dt);ang+=om*dt;if(om<260){settle=true;tgt=Math.ceil(ang/360)*360;if(tgt-ang<30)tgt+=360}}
  else{const d=tgt-ang,v=Math.min(om,Math.max(30,d*2.4));om=v;ang+=v*dt;if(tgt-ang<=.5){stop();return}}
  img.style.transform='rotate('+(ang%360).toFixed(1)+'deg)';requestAnimationFrame(frame)};
 const spinMascot=()=>{if(!can())return;busy=true;const t0=performance.now();m.react('surprise');
  const f=n=>{const t=Math.min(1,(n-t0)/1100),e=1-Math.pow(1-t,3);tilt=720*e;put(cur);if(t<1)requestAnimationFrame(f);else{tilt=0;put(cur);busy=false;m.react('dizzy');m.say('Pusing~ 🌀 awas ketagihan lho!',{mood:'happy'})}};requestAnimationFrame(f)};
 box.addEventListener('click',e=>{if(e.detail===0)return; /* keyboard tetap navigasi biasa */
  e.preventDefault();e.stopPropagation();
  const n=Date.now();taps=n-tapT<2200?taps+1:1;tapT=n;
  om=Math.min(3600,Math.max(om,0)+650);settle=false;if(m&&m.sfx&&m.sfx.pop)try{m.sfx.pop()}catch(_){}
  if(!run){run=true;last=performance.now();requestAnimationFrame(frame)}
  if(taps===3)talk('giggle','Eh, aku diputer-puter~');
  else if(taps===6)talk('dizzy','Pusing pusing… 🌀');
  else if(taps>=9){taps=0;spinMascot()}},true);
})();
/* tiap frame: Piwo ngikutin anchor kalau lagi di chat / panel pet / game */
(function tick(){if(m&&!busy&&!lock){if(at==='chat')put(A.chat());else if(at==='pet')put(A.pet());else if(at==='game')put(A.game())}requestAnimationFrame(tick)})();
const refit=()=>{if(m&&!busy&&!lock&&at==='home')put(A.home())};setInterval(refit,700);addEventListener('resize',refit);
const oo=window.openChatbot,oc=window.closeChatbot;
window.openChatbot=function(){const r=oo&&oo.apply(this,arguments);chat(true);return r};
window.closeChatbot=function(){const r=oc&&oc.apply(this,arguments);chat(false);return r};
const inp=$('xia-chatbot-input');
if(inp){inp.addEventListener('input',()=>{if(m&&m.state==='idle'){m.state='listening';m.lastAct=performance.now()}});inp.addEventListener('blur',()=>{if(m&&m.state==='listening')m.state='idle'})}
(async()=>{try{
 m=await XiaMascot.mount(host,{bodySrc:'piwo/mascot-body.webp',sleepAfter:60000,sound:(()=>{try{return localStorage.getItem('xia_sfx')!=='0'}catch(e){return true}})(),volume:2.8,z:60,maxDpr:{lite:1.25,mid:1.5,high:2}[tier]||1.5,fps:tier==='lite'?30:0,blockClicks:true,
  chatter:['Colek aku dong~','Tahan aku lama-lama, ada menu peliharaan~','Bingung? Tanya aku aja ya!','Ada tugas yang belum dikerjain?']});
 put(A.home());
 addEventListener('pointerdown',()=>m&&m.sfx.init(),{once:true,capture:true,passive:true});
 readyRes(m);
 if(R.classList.contains('piwo-intro'))await intro();
}catch(e){R.classList.remove('piwo-intro','piwo-out');console.warn('Piwo gagal dimuat',e)}})();
})();
