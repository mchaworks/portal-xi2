/* Piwo: sutradara maskot. Intro loncat ke tengah, tinggal di pojok tiap halaman, ikut masuk ke chat Labz AI. */
(()=>{
const R=document.documentElement,calm=matchMedia('(prefers-reduced-motion: reduce)').matches,tier=R.dataset.perf||'mid';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wait=ms=>new Promise(r=>setTimeout(r,ms)),$=id=>document.getElementById(id);
const host=document.createElement('div');host.id='piwo-host';host.style.cssText='position:fixed;left:0;top:0;pointer-events:none;will-change:transform';document.body.appendChild(host);
let m,cur={x:0,y:0,s:90},at='home',busy=false,skip=false,tk=0,lock=false;
let pb=null,panelOpen=false;
const put=a=>{cur=a;host.style.width=host.style.height=a.s+'px';host.style.transform='translate('+a.x.toFixed(1)+'px,'+a.y.toFixed(1)+'px)';if(pb)posBtn()};
const setZ=z=>[m.gl,m.fx,m.bub].forEach((e,i)=>e.style.zIndex=z+i);
const A={
 home(){const s=clamp(innerWidth*.15,52,76),f=$('labz-ai-fab'),d=$('liquid-glass-dock'),fr=f&&f.getBoundingClientRect(),t=fr?fr.top:(d?d.getBoundingClientRect().top:innerHeight-90);return{x:(fr?fr.left+fr.width/2:innerWidth-s)-s/2,y:t-s*.92-4,s}},
 center(){const s=Math.min(innerWidth*.52,innerHeight*.34,280);return{x:(innerWidth-s)/2,y:(innerHeight-s)/2-innerHeight*.03,s}},
 pet(){const sh=document.querySelector('#piwo-pet .pp-sheet'),top=sh&&panelOpen?sh.getBoundingClientRect().top:innerHeight-340,s=clamp(Math.min(innerWidth*.42,innerHeight*.26),110,190);return{x:(innerWidth-s)/2,y:top+6-s*.92,s}},
 chat(){const e=$('xc-piwo');if(!e)return A.home();const r=e.getBoundingClientRect(),s=r.width*1.15;return{x:r.left+r.width/2-s/2,y:r.bottom+4-s*.92,s}}
};
/* terbang: busur parabola + squash tiap mendarat */
const fly=(to,o)=>new Promise(res=>{o=Object.assign({dur:900,hops:1,h:.26},o);const a=Object.assign({},cur),t0=performance.now();let k=-1;busy=true;
 const f=n=>{const t=skip?1:Math.min(1,(n-t0)/o.dur),T=typeof to=='function'?to():to,e=(o.lin||o.hops>1)?t:t*t*(3-2*t),ph=t*o.hops,
  arc=t>=1?0:Math.abs(Math.sin(ph*Math.PI))*o.h*innerHeight*(o.hops>1?1-t*.55:1);
  if(m&&t<1&&Math.floor(ph)!==k){k=Math.floor(ph);m.sy.kick(-2.6);m.flash('happy',.5)}
  put({x:a.x+(T.x-a.x)*e,y:a.y+(T.y-a.y)*e-arc,s:a.s+(T.s-a.s)*e});
  if(t<1)requestAnimationFrame(f);else{busy=false;if(m&&!skip)m.squish(1.5);res()}};
 requestAnimationFrame(f)});
async function intro(){
 const out=()=>{R.classList.add('piwo-out');setTimeout(()=>R.classList.remove('piwo-intro','piwo-out'),650)};
 if(calm){put(A.home());out();return}
 lock=true;const c=A.center();put({x:-c.s*.55,y:innerHeight+c.s*.3,s:c.s});setZ(210); /* ngumpet di bawah-samping layar */
 const sk=()=>{skip=true;m.hush()};addEventListener('pointerdown',sk,{once:true});
 await wait(450);
 if(!skip){m.rot.kick(-4);m.sy.kick(-3);await wait(200)} /* jongkok, miring */
 await fly(c,{dur:1250,h:.32,lin:true}); /* lompat besar diagonal ke tengah */
 if(!skip){m.rot.kick(4);await fly(c,{dur:520,hops:2,h:.05})} /* mantul kecil */
 if(!skip){m.react('wave');await m.say('Halo, aku Piwo! Yuk masuk~',{mood:'happy',hold:.7})}
 out();await fly(A.home,{dur:950,h:.3});
 setZ(60);removeEventListener('pointerdown',sk);skip=false;lock=false;try{sessionStorage.setItem('piwo-intro','1')}catch(e){}
}
/* ikut ke chat AI */
async function chat(on){
 if(!m)return;
 if(on&&at==='pet')await petClose(true);
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
setInterval(()=>{const p=window.__page;if(!m||!p||p===lastPg)return;const first=lastPg===undefined;lastPg=p;
 if(first)return;m.hush();clearTimeout(pgT);const c=PG[p];if(!c||at!=='home'||lock)return;
 pgT=setTimeout(()=>{if(at!=='home'||lock)return;const ls=c[1].filter(x=>x!==lastLine),l=ls[Math.random()*ls.length|0];lastLine=l;m.react(c[0]);m.say(l,{mood:'happy',speed:42})},230)},90);

/* ================= PET: status, aksi, suara, simpan ke Supabase ================= */
const PK='piwo-pet-v1',DEV=(()=>{try{let d=localStorage.getItem('xia_dev');if(!d){d=((crypto.randomUUID&&crypto.randomUUID())||(Math.random().toString(36).slice(2)+Date.now().toString(36)+'abcdefgh')).replace(/-/g,'');localStorage.setItem('xia_dev',d)}return d}catch(e){return 'tmp'+Math.random().toString(36).slice(2,12)+'xyz'}})();
const pet={name:'Piwo',hunger:80,happy:80,energy:80,xp:0,t:Date.now()},FOODS=['🍙','🍎','🍪','🍓','🍕','🍩'];
let sleepUntil=0,lastWarn=0,lastPetXp=0,dirty=false,saveT=0,lastCd=0;
const lvOf=x=>1+Math.floor(Math.sqrt(Math.max(0,x)/12)),xpAt=l=>12*(l-1)*(l-1);
const sb=(fn,body,keep)=>{const C=window.XIA_CONFIG;if(!C||!C.SUPABASE_URL||!C.SUPABASE_ANON_KEY)return Promise.resolve(null);
 return fetch(C.SUPABASE_URL+'/rest/v1/rpc/'+fn,{method:'POST',keepalive:!!keep,headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:'Bearer '+C.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.ok?r.json():null).catch(()=>null)};
const saveLocal=()=>{try{localStorage.setItem(PK,JSON.stringify(pet))}catch(e){}};
const flush=keep=>{clearTimeout(saveT);if(!dirty)return;dirty=false;sb('piwo_pet_save',{p_device:DEV,p_name:pet.name,p_hunger:Math.round(pet.hunger),p_happy:Math.round(pet.happy),p_energy:Math.round(pet.energy),p_xp:Math.round(pet.xp)},keep)};
const changed=()=>{pet.t=Date.now();dirty=true;saveLocal();render();clearTimeout(saveT);saveT=setTimeout(()=>flush(),3000)};
const cl100=v=>clamp(v,0,100);
/* waktu berjalan: makin lama makin lapar/bosan. offline dibatasi 6 jam & ada batas bawah, jadi Piwo nggak "mati" */
function decay(ms,offline){const min=Math.min(ms,6*36e5)/6e4;if(min<=0)return;const sl=!offline&&m&&m.state==='sleep';
 pet.hunger=cl100(pet.hunger-min*(sl?.2:.5));
 pet.happy=cl100(pet.happy-min*(pet.hunger<20?.6:.3));
 pet.energy=cl100(sl?pet.energy+min*1.5:pet.energy-min*(offline?.1:.25));
 if(offline){pet.hunger=Math.max(pet.hunger,5);pet.happy=Math.max(pet.happy,10)}}
function gain(xp){const l0=lvOf(pet.xp);pet.xp+=xp;const l1=lvOf(pet.xp);if(l1>l0&&m){m.sfx.levelup();m.react('happy');setTimeout(()=>m&&m.say('Level up! Sekarang aku Lv '+l1+'~',{mood:'happy'}),500)}}
function status(){if(Date.now()<sleepUntil||(m&&m.state==='sleep'))return'Zzz… lagi tidur';
 if(pet.hunger<25)return'Laper banget… kasih makan dong';if(pet.energy<20)return'Ngantuk berat, butuh tidur';if(pet.happy<25)return'Lagi sedih, ajak main yuk';
 const a=(pet.hunger+pet.happy+pet.energy)/3;return a>75?'Lagi happy banget!':a>50?'Baik-baik aja~':'Agak lesu nih…'}
let ui=null;
function render(){if(!ui)return;const l=lvOf(pet.xp),a=xpAt(l),b=xpAt(l+1);
 ui.name.firstChild.nodeValue=pet.name+' ✎';ui.lv.textContent='Lv '+l;ui.xp.style.width=clamp((pet.xp-a)/(b-a)*100,0,100)+'%';ui.xpt.textContent=Math.floor(pet.xp-a)+' / '+(b-a)+' XP';ui.st.textContent=status();
 [['hunger',pet.hunger],['happy',pet.happy],['energy',pet.energy]].forEach(([k,v])=>{const e=ui[k];e.style.width=v+'%';e.parentNode.classList.toggle('low',v<25);e.parentNode.nextSibling.textContent=Math.round(v)});
 const sl=Date.now()<sleepUntil||(m&&m.state==='sleep');ui.feed.disabled=ui.play.disabled=ui.nap.disabled=sl;
 if(pb)pb.classList.toggle('alert',pet.hunger<25||pet.energy<20||pet.happy<25)}
function emoji(ch,rise){if(!m)return;const s=cur.s,e=document.createElement('div');e.textContent=ch;
 e.style.cssText='position:fixed;left:'+(cur.x+s/2-s*.14)+'px;top:0;font-size:'+Math.round(s*.28)+'px;z-index:175;pointer-events:none;will-change:transform,opacity';document.body.appendChild(e);
 const y0=cur.y-s*(rise?-.05:.12),y1=rise?cur.y-s*.3:cur.y+s*.4;
 e.animate([{transform:'translateY('+y0+'px) scale(.5)',opacity:0},{transform:'translateY('+(y0+(y1-y0)*.2)+'px) scale(1.15)',opacity:1,offset:.2},{transform:'translateY('+y1+'px) scale(.85)',opacity:1,offset:.85},{transform:'translateY('+y1+'px) scale(.2)',opacity:0}],{duration:rise?1100:850,easing:'ease-in'}).onfinish=()=>e.remove()}
const cooldown=ms=>{const n=Date.now();if(n-lastCd<ms)return false;lastCd=n;return true};
const ACT={
 feed(){if(!m||!cooldown(1100))return;m.sfx.init();
  if(pet.hunger>=96){m.react('shake');m.say('Udah kenyang banget, nanti meletus~',{mood:'shy'});return}
  emoji(FOODS[Math.random()*FOODS.length|0]);setTimeout(()=>{if(!m)return;m.sfx.munch();m.squish(1.1)},430);setTimeout(()=>{if(!m)return;m.sfx.gulp();m.react('happy');pet.hunger=cl100(pet.hunger+32);pet.happy=cl100(pet.happy+5);gain(4);changed();
   m.say(pet.hunger>90?'Hmm, enak banget! Kenyang~':'Nyam nyam, makasih ya!',{mood:'happy'})},900)},
 play(){if(!m||!cooldown(1500))return;m.sfx.init();
  if(pet.energy<15){m.react('yawn');m.say('Aku capek… tidur dulu ya?',{mood:'sad'});return}
  emoji('🎾',true);m.sfx.play();m.react('hop',90);setTimeout(()=>m&&m.react('giggle'),450);
  pet.happy=cl100(pet.happy+26);pet.energy=cl100(pet.energy-10);pet.hunger=cl100(pet.hunger-5);gain(6);changed();
  setTimeout(()=>m&&m.say(['Seru banget!','Lagi lagi lagi~','Hihi, ayo main lagi!'][Math.random()*3|0],{mood:'happy'}),700)},
 nap(){if(!m||Date.now()<sleepUntil)return;m.sfx.init();
  if(pet.energy>=92){m.react('shake');m.say('Belum ngantuk nih~',{mood:'shy'});return}
  hushBubble();m.setState('sleep');m.sfx.snore();sleepUntil=Date.now()+7000;
  const iv=setInterval(()=>{if(!m||Date.now()>=sleepUntil){clearInterval(iv);return}pet.energy=cl100(pet.energy+6);m.sfx.snore();changed()},1500);
  setTimeout(()=>{if(!m)return;gain(2);pet.energy=cl100(Math.max(pet.energy,75));pet.t=Date.now();if(m.state==='sleep')m.wake();changed()},7000);changed()},
 rub(){if(!m)return;m.sfx.init();m.react('love');pet.happy=cl100(pet.happy+8);gain(1);changed()}
};
const hushBubble=()=>{try{m.hush()}catch(e){}};
function rename(){const n=prompt('Kasih nama peliharaanmu (maks 16 huruf):',pet.name);if(n==null)return;const v=n.trim().slice(0,16);if(!v)return;pet.name=v;changed();if(m)m.say('Hai, namaku sekarang '+v+'~',{mood:'happy'})}
function build(){
 const st=document.createElement('style');st.textContent=`
#piwo-pet-btn{position:fixed;left:0;top:0;z-index:65;width:42px;height:42px;border-radius:50%;border:0;display:grid;place-items:center;font-size:21px;line-height:1;cursor:pointer;
 background:var(--md-sys-color-surface-container-high,#fff);color:var(--md-sys-color-on-surface,#171D19);box-shadow:0 4px 14px rgba(0,0,0,.18),0 0 0 1px var(--md-sys-color-outline-variant,rgba(0,0,0,.08));
 opacity:0;pointer-events:none;transition:opacity .25s;-webkit-tap-highlight-color:transparent}
#piwo-pet-btn.alert::after{content:'';position:absolute;right:4px;top:4px;width:11px;height:11px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 2px var(--md-sys-color-surface-container-high,#fff);animation:ppPulse 1.3s infinite}
@keyframes ppPulse{50%{transform:scale(1.35)}}
#piwo-pet{position:fixed;inset:0;z-index:150;pointer-events:none;visibility:hidden}
#piwo-pet.on{pointer-events:auto;visibility:visible}
#piwo-pet .pp-scrim{position:absolute;inset:0;background:rgba(0,0,0,.32);opacity:0;transition:opacity .3s}
#piwo-pet.on .pp-scrim{opacity:1}
#piwo-pet .pp-sheet{position:absolute;left:0;right:0;bottom:0;max-width:520px;margin:0 auto;padding:10px 18px calc(18px + env(safe-area-inset-bottom,0px));border-radius:28px 28px 0 0;
 background:var(--md-sys-color-surface-container-high,#fff);color:var(--md-sys-color-on-surface,#171D19);transform:translateY(105%);transition:transform .38s cubic-bezier(.2,.9,.25,1);box-shadow:0 -10px 40px rgba(0,0,0,.25);font-family:inherit}
#piwo-pet.on .pp-sheet{transform:none}
.pp-grab{width:38px;height:4px;border-radius:4px;background:var(--md-sys-color-outline-variant,#c4c8c2);margin:0 auto 10px}
.pp-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.pp-name{font:800 19px/1.2 inherit;background:none;border:0;color:inherit;padding:4px 0;cursor:pointer}
.pp-lv{display:inline-block;margin-left:6px;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:800;background:var(--md-sys-color-primary-container,#cdeed9);color:var(--md-sys-color-on-primary-container,#0b2015)}
.pp-x{width:36px;height:36px;border-radius:50%;border:0;background:var(--md-sys-color-surface-container-highest,#e4e9e4);color:inherit;font-size:16px;cursor:pointer}
.pp-xpw{height:6px;border-radius:6px;background:var(--md-sys-color-surface-container-highest,#e4e9e4);overflow:hidden;margin:6px 0 2px}
.pp-xpw i{display:block;height:100%;width:0;border-radius:6px;background:var(--md-sys-color-tertiary,#8a6d00);transition:width .5s}
.pp-xpt{font-size:11px;opacity:.65;text-align:right}
.pp-st{margin:6px 0 12px;font-size:14px;font-weight:600;opacity:.85}
.pp-row{display:grid;grid-template-columns:86px 1fr 28px;align-items:center;gap:8px;margin:7px 0;font-size:13px;font-weight:700}
.pp-bar{height:10px;border-radius:10px;background:var(--md-sys-color-surface-container-highest,#e4e9e4);overflow:hidden}
.pp-bar i{display:block;height:100%;width:0;border-radius:10px;transition:width .5s,background .3s}
.pp-bar.low i{background:#ef4444!important}
.pp-row b{font-size:12px;opacity:.7;text-align:right;font-weight:700}
.pp-act{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}
.pp-act button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 9px;border-radius:18px;border:0;cursor:pointer;font:700 12px/1.1 inherit;
 background:var(--md-sys-color-secondary-container,#d7e8dc);color:var(--md-sys-color-on-secondary-container,#0e1f14);transition:transform .12s,opacity .2s}
.pp-act button span{font-size:24px;line-height:1}
.pp-act button:active{transform:scale(.93)}
.pp-act button:disabled{opacity:.4}
`;document.head.appendChild(st);
 pb=document.createElement('button');pb.id='piwo-pet-btn';pb.type='button';pb.setAttribute('aria-label','Buka peliharaan Piwo');pb.title='Peliharaan';pb.textContent='🐾';document.body.appendChild(pb);
 pb.addEventListener('click',()=>petOpen());
 const root=document.createElement('div');root.id='piwo-pet';root.setAttribute('aria-hidden','true');
 root.innerHTML=`<div class="pp-scrim"></div><section class="pp-sheet" role="dialog" aria-label="Peliharaan Piwo"><div class="pp-grab"></div>
<div class="pp-head"><div><button class="pp-name" type="button" aria-label="Ganti nama">Piwo ✎</button><span class="pp-lv">Lv 1</span></div><button class="pp-x" type="button" aria-label="Tutup">✕</button></div>
<div class="pp-xpw"><i></i></div><div class="pp-xpt"></div><p class="pp-st"></p>
<div class="pp-row"><span>🍙 Kenyang</span><div class="pp-bar"><i style="background:#f59e0b"></i></div><b></b></div>
<div class="pp-row"><span>💖 Senang</span><div class="pp-bar"><i style="background:#ec4899"></i></div><b></b></div>
<div class="pp-row"><span>⚡ Energi</span><div class="pp-bar"><i style="background:#22c55e"></i></div><b></b></div>
<div class="pp-act"><button type="button" data-a="feed" aria-label="Kasih makan"><span>🍙</span>Makan</button><button type="button" data-a="play" aria-label="Ajak main"><span>🎾</span>Main</button><button type="button" data-a="nap" aria-label="Tidurkan"><span>🌙</span>Tidur</button><button type="button" data-a="rub" aria-label="Elus"><span>💕</span>Elus</button></div></section>`;
 document.body.appendChild(root);
 const q=x=>root.querySelector(x),bars=root.querySelectorAll('.pp-bar i');
 ui={root,name:q('.pp-name'),lv:q('.pp-lv'),xp:q('.pp-xpw i'),xpt:q('.pp-xpt'),st:q('.pp-st'),hunger:bars[0],happy:bars[1],energy:bars[2],feed:q('[data-a=feed]'),play:q('[data-a=play]'),nap:q('[data-a=nap]')};
 ui.name.addEventListener('click',rename);
 q('.pp-x').addEventListener('click',()=>petClose());q('.pp-scrim').addEventListener('click',()=>petClose());
 root.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>ACT[b.dataset.a]()));
 addEventListener('keydown',e=>{if(e.key==='Escape')petClose()});
 render()}
const posBtn=()=>{const show=at==='home'&&!lock&&!busy&&!panelOpen&&!(R.classList.contains('piwo-intro'));pb.style.opacity=show?1:0;pb.style.pointerEvents=show?'auto':'none';
 pb.style.transform='translate('+clamp(cur.x-48,6,innerWidth-52).toFixed(1)+'px,'+(cur.y+cur.s*.4).toFixed(1)+'px)'};
async function petOpen(){if(!m||panelOpen||lock||at==='chat')return;panelOpen=true;at='pet';ui.root.classList.add('on');ui.root.setAttribute('aria-hidden','false');setZ(160);hushBubble();render();
 await wait(60);if(calm)put(A.pet());else await fly(A.pet,{dur:620,h:.2});if(at==='pet')m.react('wave')}
async function petClose(quiet){if(!panelOpen)return;panelOpen=false;ui.root.classList.remove('on');ui.root.setAttribute('aria-hidden','true');
 if(at==='pet')at='home';if(quiet)return;if(calm)put(A.home());else await fly(A.home,{dur:650,h:.22});if(at==='home')setZ(60)}
/* tik tiap 20 dtk: status turun, Piwo mengeluh kalau perlu */
setInterval(()=>{if(!m)return;const n=Date.now();decay(n-pet.t,false);pet.t=n;saveLocal();dirty=true;render();
 if(n-lastWarn<120000||lock||busy||at!=='home'||m.state==='sleep'||document.hidden)return;
 if(pet.hunger<25){lastWarn=n;m.sfx.growl();m.react('sad');m.say('Perutku bunyi… laper nih~',{mood:'sad'})}
 else if(pet.energy<20){lastWarn=n;m.react('yawn');m.say('Hoaam… ngantuk…',{mood:'sad'})}
 else if(pet.happy<25){lastWarn=n;m.react('sad');m.say('Main sama aku dong…',{mood:'sad'})}},20000);
setInterval(()=>{if(dirty)flush()},120000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){pet.t=Date.now();saveLocal();dirty=true;flush(true)}});
async function loadPet(){
 let loc=null;try{loc=JSON.parse(localStorage.getItem(PK))}catch(e){}
 const ok=o=>o&&typeof o.hunger=='number'&&typeof o.happy=='number'&&typeof o.energy=='number';
 if(ok(loc)){Object.assign(pet,loc);decay(Date.now()-(loc.t||Date.now()),true)}
 pet.t=Date.now();build();render();
 const r=await sb('piwo_pet_get',{p_device:DEV});
 if(r&&ok(r)){const srvT=Date.now()-(r.now-r.last_tick); /* waktu simpan server, dalam jam perangkat ini */
  if(!ok(loc)||(loc.t||0)<srvT-1000){Object.assign(pet,{name:r.name||pet.name,hunger:r.hunger,happy:r.happy,energy:r.energy,xp:Math.max(r.xp,pet.xp)});decay(Math.max(0,r.now-r.last_tick),true);pet.t=Date.now()}
  else if(r.xp>pet.xp)pet.xp=r.xp}
 dirty=true;saveLocal();render();
 if(m)setTimeout(()=>{if(m&&!lock&&at==='home'&&!document.hidden){if(pet.hunger<25){m.sfx.growl();m.say('Aku laper… kasih makan dong~',{mood:'sad'})}else if(pet.energy<20)m.say('Ngantuk banget hari ini…',{mood:'sad'})}},6000)}

window.Piwo={
 say:(t,o)=>m&&m.say(t,o),react:n=>m&&m.react(n),chat,setSound:on=>m&&m.setSound(on),openPet:petOpen,closePet:()=>petClose(),
 think(on){if(!m)return;if(on){m.state='thinking';m.lastAct=performance.now()}else if(m.state==='thinking')m.state='idle'},
 talk(on,t){if(!m)return;clearInterval(tk);if(on)tk=setInterval(()=>m.talkT=Math.random()<.25?.05:.4+Math.random()*.6,90);else{m.talkT=0;m.react(/maaf|belum ada|tidak ada|gagal/i.test(t||'')?'sad':'nod')}},
 fail(){m&&m.react('sad')}
};
(function tick(){if(m&&!busy&&!lock){if(at==='chat')put(A.chat());else if(at==='pet')put(A.pet())}requestAnimationFrame(tick)})();
const refit=()=>{if(m&&!busy&&!lock&&at==='home')put(A.home())};setInterval(refit,700);addEventListener('resize',refit);
const oo=window.openChatbot,oc=window.closeChatbot;
window.openChatbot=function(){const r=oo&&oo.apply(this,arguments);chat(true);return r};
window.closeChatbot=function(){const r=oc&&oc.apply(this,arguments);chat(false);return r};
const inp=$('xia-chatbot-input');
if(inp){inp.addEventListener('input',()=>{if(m&&m.state==='idle'){m.state='listening';m.lastAct=performance.now()}});inp.addEventListener('blur',()=>{if(m&&m.state==='listening')m.state='idle'})}
(async()=>{try{
 m=await XiaMascot.mount(host,{bodySrc:'piwo/mascot-body.webp',sleepAfter:60000,sound:(()=>{try{return localStorage.getItem('xia_sfx')!=='0'}catch(e){return true}})(),volume:2.8,z:60,maxDpr:{lite:1.25,mid:1.5,high:2}[tier]||1.5,fps:tier==='lite'?30:0,blockClicks:true,
  chatter:['Colek aku dong~','Bingung? Tanya aku aja ya!','Ada tugas yang belum dikerjain?']});
 put(A.home());
 addEventListener('pointerdown',()=>m&&m.sfx.init(),{once:true,capture:true,passive:true});
 m.on('pet',()=>{const n=Date.now();if(n-lastPetXp<4000)return;lastPetXp=n;pet.happy=cl100(pet.happy+5);gain(1);changed()});
 loadPet();
 if(R.classList.contains('piwo-intro'))await intro();
}catch(e){R.classList.remove('piwo-intro','piwo-out');console.warn('Piwo gagal dimuat',e)}})();
})();
