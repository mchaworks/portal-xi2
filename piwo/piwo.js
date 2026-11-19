/* Piwo: sutradara maskot. Intro loncat ke tengah, tinggal di pojok tiap halaman, ikut masuk ke chat Labz AI. */
(()=>{
const R=document.documentElement,calm=matchMedia('(prefers-reduced-motion: reduce)').matches,tier=R.dataset.perf||'mid';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wait=ms=>new Promise(r=>setTimeout(r,ms)),$=id=>document.getElementById(id);
const host=document.createElement('div');host.id='piwo-host';host.style.cssText='position:fixed;left:0;top:0;pointer-events:none;will-change:transform';document.body.appendChild(host);
let m,cur={x:0,y:0,s:90},at='home',busy=false,skip=false,tk=0,lock=false;
let panelOpen=false;
const put=a=>{cur=a;host.style.width=host.style.height=a.s+'px';host.style.transform='translate('+a.x.toFixed(1)+'px,'+a.y.toFixed(1)+'px)'};
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
/* gerak lurus dengan easing bebas (dipakai intro) */
const move=(to,dur,ease)=>new Promise(res=>{const a=Object.assign({},cur),t0=performance.now();busy=true;
 const f=n=>{const t=skip?1:Math.min(1,(n-t0)/dur),e=ease(t);put({x:a.x+(to.x-a.x)*e,y:a.y+(to.y-a.y)*e,s:a.s+(to.s-a.s)*e});if(t<1)requestAnimationFrame(f);else{busy=false;res()}};requestAnimationFrame(f)});
const easeOutBack=t=>{const c=1.9,u=t-1;return 1+(c+1)*u*u*u+c*u*u},easeIn=t=>t*t*t;
/* intro ala Duolingo: melesat dari bawah layar ke tengah, melambai, jatuh lagi, layar utama muncul, Piwo naik ke pojok */
async function intro(){
 const out=()=>{R.classList.add('piwo-out');setTimeout(()=>R.classList.remove('piwo-intro','piwo-out'),900)};
 if(calm){put(A.home());out();return}
 lock=true;const c=A.center(),below={x:c.x,y:innerHeight+c.s*.25,s:c.s};put(below);setZ(210);
 const sk=()=>{skip=true;m.hush()};addEventListener('pointerdown',sk,{once:true});
 await wait(500);
 if(!skip){m.sy.kick(-3.4);m.sx.kick(2);await wait(280)} /* jongkok dulu */
 if(!skip){m.sfx.boing&&m.sfx.boing();m.sy.kick(2.6);m.flash('happy',.8)}
 await move(c,820,easeOutBack); /* kelontar ke tengah, sedikit lewat lalu mengendap */
 if(!skip){m.squish(1.1);m.react('wave');await m.say('Halo, aku Piwo! Yuk masuk~',{mood:'happy',hold:.9})}
 if(!skip){m.react('surprise');await wait(220);m.rot.kick(3.5)}
 await move(below,640,easeIn); /* jatuh lagi ke bawah layar */
 out();if(!skip)await wait(520);
 const h=A.home();put({x:h.x,y:innerHeight+h.s,s:h.s}); /* naik ke pojok setelah layar utama tampil */
 await fly(h,{dur:850,h:.12});
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
  chatter:['Colek aku dong~','Bingung? Tanya aku aja ya!','Ada tugas yang belum dikerjain?']});
 put(A.home());
 addEventListener('pointerdown',()=>m&&m.sfx.init(),{once:true,capture:true,passive:true});
 readyRes(m);
 if(R.classList.contains('piwo-intro'))await intro();
}catch(e){R.classList.remove('piwo-intro','piwo-out');console.warn('Piwo gagal dimuat',e)}})();
})();
