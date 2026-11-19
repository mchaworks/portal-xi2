/* Piwo: sutradara maskot. Intro loncat ke tengah, tinggal di pojok tiap halaman, ikut masuk ke chat Labz AI. */
(()=>{
window.PIWO_BUILD='14-pet-dock';
const R=document.documentElement,calm=matchMedia('(prefers-reduced-motion: reduce)').matches,tier=R.dataset.perf||'mid';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wait=ms=>new Promise(r=>setTimeout(r,ms)),$=id=>document.getElementById(id);
const host=document.createElement('div');host.id='piwo-host';host.style.cssText='position:fixed;left:0;top:0;pointer-events:none;will-change:transform';document.body.appendChild(host);
let m,cur={x:0,y:0,s:90},at='home',busy=false,skip=false,tk=0,lock=false;
let panelOpen=false,tilt=0; /* tilt (derajat) cuma dipakai intro */
const put=a=>{cur=a;host.style.width=host.style.height=a.s+'px';host.style.transform='translate('+a.x.toFixed(1)+'px,'+a.y.toFixed(1)+'px)'+(tilt?' rotate('+tilt.toFixed(2)+'deg)':'')};
const setZ=z=>{[m.gl,m.fx,m.bub].forEach((e,i)=>e.style.zIndex=z+i);const w=$('pp-acc-wrap');if(w)w.style.zIndex=z+1};
const A={
 home(){const s=clamp(innerWidth*.15,52,76),f=$('labz-ai-fab'),d=$('liquid-glass-dock'),fr=f&&f.getBoundingClientRect(),t=fr?fr.top:(d?d.getBoundingClientRect().top:innerHeight-90);return{x:(fr?fr.left+fr.width/2:innerWidth-s)-s/2,y:t-s*.92-4,s}},
 center(){const s=Math.min(innerWidth*.52,innerHeight*.34,280);return{x:(innerWidth-s)/2,y:(innerHeight-s)/2-innerHeight*.03,s}},
 pet(){const sh=document.querySelector('#piwo-pet .pp-sheet'),top=sh&&panelOpen?sh.getBoundingClientRect().top:innerHeight-340,s=clamp(Math.min(innerWidth*.42,innerHeight*.26),110,190);return{x:(innerWidth-s)/2,y:top+6-s*.92,s}},
 game(){const s=clamp(innerWidth*.17,56,76);return{x:innerWidth-s-8,y:innerHeight-s*.92-18,s}},
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
/* gerak lurus dengan easing bebas (dipakai intro); tt = target kemiringan (derajat) */
const move=(to,dur,ease,tt)=>new Promise(res=>{const a=Object.assign({},cur),t0=performance.now(),k0=tilt;busy=true;
 const f=n=>{const t=skip?1:Math.min(1,(n-t0)/dur),e=ease(t);tilt=tt==null?tilt:k0+(tt-k0)*t;put({x:a.x+(to.x-a.x)*e,y:a.y+(to.y-a.y)*e,s:a.s+(to.s-a.s)*e});if(t<1)requestAnimationFrame(f);else{busy=false;res()}};requestAnimationFrame(f)});
/* gravitasi: naik = melambat sampai puncak (kecepatan 0), jatuh = makin ngebut */
const rise=t=>1-Math.pow(1-t,1.7),fall=t=>t*t;
/* melayang di puncak: bobbing pelan + miring, selama fn() berjalan */
const hang=async(c,fn)=>{let on=true;const t0=performance.now();busy=true;
 const f=n=>{if(!on)return;const k=(n-t0)/1000;tilt+=(-11-tilt)*.06;put({x:c.x+Math.sin(k*1.3)*3,y:c.y-Math.min(k,1.6)*9+Math.sin(k*2.2)*3,s:c.s});requestAnimationFrame(f)};requestAnimationFrame(f);
 try{await fn()}finally{on=false;busy=false}};
/* ================= INTRO v3 "Pop-in" =================
   Piwo ngintip malu-malu dari bawah, jongkok, BOING melesat (jejak bintang), salto di puncak sambil hati beterbangan,
   nyapa, kaget, jatuh "wheee", POOF di dasar layar, layar utama terbuka melingkar dari titik jatuh, Piwo loncat ke pojok. */
const rnd=(a,b)=>a+Math.random()*(b-a);
const PFX=(()=>{let box;const COL=['#6ee7b7','#7dd3fc','#f9a8d4','#fde68a','#ffffff'];
 const mk=()=>{if(!box||!box.isConnected){box=document.createElement('div');box.id='piwo-fx';box.style.cssText='position:fixed;inset:0;z-index:220;pointer-events:none;overflow:hidden';document.body.appendChild(box)}return box};
 const spark=(x,y,o)=>{if(calm||!document.body)return;o=o||{};const e=document.createElement('i'),sz=o.sz||rnd(10,20),col=o.col||COL[Math.random()*COL.length|0],dx=o.dx!=null?o.dx:rnd(-40,40),dy=o.dy!=null?o.dy:rnd(-50,-10),op=o.op||1;
  e.textContent=o.ch||'✦';e.style.cssText='position:absolute;left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px;font:'+sz.toFixed(0)+'px/1 system-ui,sans-serif;font-style:normal;color:'+col+';text-shadow:0 0 8px '+col+';will-change:transform,opacity;margin:-'+(sz/2).toFixed(0)+'px 0 0 -'+(sz/2).toFixed(0)+'px';
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
 const out=()=>{clearInterval(amb);clearInterval(trail);R.classList.add('piwo-out');S.musicStop(.9);rm();if(ttl)ttl.animate([{opacity:1},{opacity:0}],{duration:350,fill:'forwards'});setTimeout(()=>{R.classList.remove('piwo-intro','piwo-out');ttl&&ttl.remove()},1150)};
 if(calm){put(A.home());out();return}
 lock=true;const W=innerWidth,H=innerHeight,tier2=tier==='lite',s=Math.min(W*.26,H*.17,130),c={x:(W-s)/2,y:(H-s)/2-H*.05,s},below={x:c.x,y:H+s*.25,s},peek={x:c.x,y:H-s*.72,s},ctr=()=>({x:cur.x+cur.s/2,y:cur.y+cur.s/2});
 put(below);setZ(210);
 const sk=()=>{skip=true;m.hush();S.musicStop(.3);rm()};addEventListener('pointerdown',sk,{once:true});
 /* judul kecil + gelembung pastel naik pelan */
 const sp=document.getElementById('piwo-splash'),dark=R.dataset.mode==='dark';
 if(sp){ttl=document.createElement('div');ttl.textContent='XI.2 Creative Lab';
  ttl.style.cssText='position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 13%);transform:translateX(-50%);padding:9px 18px;border-radius:99px;font:800 15px/1 Inter,system-ui,sans-serif;letter-spacing:.02em;white-space:nowrap;'+(dark?'color:#bfeedd;background:rgba(255,255,255,.08);border:1px solid rgba(191,238,221,.2)':'color:#1B6B51;background:rgba(255,255,255,.7);border:1px solid rgba(27,107,81,.18);box-shadow:0 10px 30px -12px rgba(27,107,81,.5)');
  sp.appendChild(ttl);ttl.animate([{opacity:0,transform:'translate(-50%,14px) scale(.9)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:550,delay:120,easing:'cubic-bezier(.2,1.4,.4,1)',fill:'backwards'})}
 amb=setInterval(()=>{if(!skip)PFX.spark(rnd(0,W),H+10,{ch:'●',sz:rnd(8,20),dx:rnd(-30,30),dy:-rnd(H*.25,H*.6),d:rnd(2600,4200),col:['#a7f3d0','#bae6fd','#fbcfe8'][Math.random()*3|0],op:.4})},tier2?500:240);
 const trailOn=()=>{clearInterval(trail);trail=setInterval(()=>{if(skip||tier2&&Math.random()<.5)return;const q=ctr();PFX.spark(q.x+rnd(-cur.s*.22,cur.s*.22),q.y+cur.s*.3,{dx:rnd(-18,18),dy:rnd(10,40),sz:rnd(9,16),d:rnd(500,800)})},55)},trailOff=()=>clearInterval(trail);
 audioStart();
 await wait(320);
 /* 1. muncul kaget: mata melotot */
 if(!skip){S.peek();m.flash('surprised',.75);m.sy.kick(1.8);await move(peek,360,rise,0)}
 /* 2. malu sebentar, lalu jongkok bertekad */
 if(!skip){m.flash('shy',.6);S.squeak();m.sx.kick(1.2);await wait(520)}
 if(!skip){S.squish();m.flash('happy',.6);m.sy.kick(-3.8);m.sx.kick(2.4);await wait(230)}
 /* 3. BOING: melesat + ledakan bintang di bawah kaki */
 if(!skip){S.boing();S.whoosh();m.sy.kick(3);const q=ctr();PFX.burst(q.x,q.y+s*.3,tier2?5:10,s*.9,true);trailOn()}
 await move(c,700,rise,-4);trailOff();
 /* 4. salto + ketawa, hati beterbangan */
 if(!skip){S.twinkle();S.giggle();m.flash('giggle',.7);const q=ctr();PFX.burst(q.x,q.y,tier2?6:14,s)}
 await move(c,540,rise,-360);tilt=0;
 /* 5. mata hati, lalu nyapa sambil melambai */
 if(!skip)await hang(c,async()=>{m.react('love');S.heart&&S.heart();await wait(420);if(skip)return;S.hello();m.react('wave');await m.say('Halo, aku Piwo~',{mood:'happy',hold:.4})});
 /* 6. kaget, jatuh pusing */
 if(!skip){m.react('surprise');S.huh();m.sy.kick(-2.4);await wait(240)}
 if(!skip)m.flash('dizzy',1);
 trailOn();S.slide();await move(below,560,fall,26);trailOff();
 if(!skip){S.thud();PFX.burst(c.x+s/2,H-8,tier2?10:20,Math.min(W*.55,230),true)} /* POOF */
 tilt=0;put(cur);
 out();if(!skip){S.tada();await wait(480)}
 /* 7. loncat ke pojok dengan senyum */
 const h=A.home();put({x:h.x,y:H+h.s,s:h.s});
 if(!skip){S.fly();m.flash('happy',1)}
 await fly(h,{dur:700,h:.14});
 if(!skip){S.pop();const q=ctr();PFX.burst(q.x,q.y,10,h.s*1.1)}
 setZ(60);removeEventListener('pointerdown',sk);skip=false;lock=false;tilt=0;try{sessionStorage.setItem('piwo-intro','1')}catch(e){}
 setTimeout(PFX.clear,1800);
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
