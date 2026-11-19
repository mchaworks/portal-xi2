/* Piwo: sutradara maskot. Intro loncat ke tengah, tinggal di pojok tiap halaman, ikut masuk ke chat Labz AI. */
(()=>{
const R=document.documentElement,calm=matchMedia('(prefers-reduced-motion: reduce)').matches,tier=R.dataset.perf||'mid';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wait=ms=>new Promise(r=>setTimeout(r,ms)),$=id=>document.getElementById(id);
const host=document.createElement('div');host.id='piwo-host';host.style.cssText='position:fixed;left:0;top:0;pointer-events:none;will-change:transform';document.body.appendChild(host);
let m,cur={x:0,y:0,s:90},at='home',busy=false,skip=false,tk=0,lock=false;
const put=a=>{cur=a;host.style.width=host.style.height=a.s+'px';host.style.transform='translate('+a.x.toFixed(1)+'px,'+a.y.toFixed(1)+'px)'};
const setZ=z=>[m.gl,m.fx,m.bub].forEach((e,i)=>e.style.zIndex=z+i);
const A={
 home(){const s=clamp(innerWidth*.17,58,84),d=$('liquid-glass-dock'),t=d?d.getBoundingClientRect().top:innerHeight-90;return{x:innerWidth-s-6,y:t-s*.92-4,s}},
 center(){const s=Math.min(innerWidth*.52,innerHeight*.34,280);return{x:(innerWidth-s)/2,y:(innerHeight-s)/2-innerHeight*.03,s}},
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
 if(on&&at!=='chat'){at='chat';setZ(160);m.hush();await fly(A.chat,{dur:650,h:.2});if(at==='chat')m.react('wave')}
 else if(!on&&at==='chat'){at='home';await fly(A.home,{dur:700,h:.22});if(at==='home')setZ(60)}
}
/* nyapa tiap halaman/section, sekali per kunjungan */
const SEC={momen:['happy','Ini sorotan kegiatan kelas kita!'],jadwal:['nod','Cek jadwal dulu biar nggak salah mapel~'],anggota:['love','Ini temen-temen sekelas, keren semua!'],papan:['surprise','Tugasnya jangan ditunda ya!']};
function watch(){const seen=new Set(),io=new IntersectionObserver(es=>es.forEach(e=>{const id=e.target.id;
 if(!e.isIntersecting||seen.has(id)||at!=='home'||busy||m.speech)return;seen.add(id);m.react(SEC[id][0]);m.say(SEC[id][1],{mood:'happy'})}),{rootMargin:'-45% 0px -45% 0px'});
 Object.keys(SEC).forEach(id=>{const e=$(id);e&&io.observe(e)})}
window.Piwo={
 say:(t,o)=>m&&m.say(t,o),react:n=>m&&m.react(n),chat,
 think(on){if(!m)return;if(on){m.state='thinking';m.lastAct=performance.now()}else if(m.state==='thinking')m.state='idle'},
 talk(on,t){if(!m)return;clearInterval(tk);if(on)tk=setInterval(()=>m.talkT=Math.random()<.25?.05:.4+Math.random()*.6,90);else{m.talkT=0;m.react(/maaf|belum ada|tidak ada|gagal/i.test(t||'')?'sad':'nod')}},
 fail(){m&&m.react('sad')}
};
(function tick(){if(m&&!busy&&!lock&&at==='chat')put(A.chat());requestAnimationFrame(tick)})();
const refit=()=>{if(m&&!busy&&!lock&&at==='home')put(A.home())};setInterval(refit,700);addEventListener('resize',refit);
const oo=window.openChatbot,oc=window.closeChatbot;
window.openChatbot=function(){const r=oo&&oo.apply(this,arguments);chat(true);return r};
window.closeChatbot=function(){const r=oc&&oc.apply(this,arguments);chat(false);return r};
const inp=$('xia-chatbot-input');
if(inp){inp.addEventListener('input',()=>{if(m&&m.state==='idle'){m.state='listening';m.lastAct=performance.now()}});inp.addEventListener('blur',()=>{if(m&&m.state==='listening')m.state='idle'})}
(async()=>{try{
 m=await XiaMascot.mount(host,{bodySrc:'piwo/mascot-body.webp',sleepAfter:60000,sound:false,z:60,maxDpr:{lite:1.25,mid:1.5,high:2}[tier]||1.5,fps:tier==='lite'?30:0,blockClicks:true,
  chatter:['Colek aku dong~','Bingung? Tanya aku aja ya!','Ada tugas yang belum dikerjain?']});
 put(A.home());if(R.classList.contains('piwo-intro'))await intro();
 watch();
}catch(e){R.classList.remove('piwo-intro','piwo-out');console.warn('Piwo gagal dimuat',e)}})();
})();
