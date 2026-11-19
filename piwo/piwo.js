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
 game(){const s=clamp(innerWidth*.3,92,128);return{x:(innerWidth-s)/2,y:innerHeight-s*.92-14,s}},
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
setInterval(()=>{const p=window.__page;if(!m||!p||p===lastPg)return;const first=lastPg===undefined;lastPg=p;qpage(p);
 if(first)return;m.hush();clearTimeout(pgT);const c=PG[p];if(!c||at!=='home'||lock)return;
 pgT=setTimeout(()=>{if(at!=='home'||lock)return;const ls=c[1].filter(x=>x!==lastLine),l=ls[Math.random()*ls.length|0];lastLine=l;m.react(c[0]);m.say(l,{mood:'happy',speed:42})},230)},90);

/* ================= PET v2: koin, toko aksesori, misi harian, game, simpan ke Supabase ================= */
const PK='piwo-pet-v2',DEV=(()=>{try{let d=localStorage.getItem('xia_dev');if(!d){d=((crypto.randomUUID&&crypto.randomUUID())||(Math.random().toString(36).slice(2)+Date.now().toString(36)+'abcdefgh')).replace(/-/g,'');localStorage.setItem('xia_dev',d)}return d}catch(e){return 'tmp'+Math.random().toString(36).slice(2,12)+'xyz'}})();
const FOODS=[{id:'nasi',e:'🍙',n:'Onigiri',p:0,h:22,hp:3},{id:'apel',e:'🍎',n:'Apel',p:3,h:30,hp:5},{id:'kue',e:'🍪',n:'Kukis',p:4,h:25,hp:10},{id:'stroberi',e:'🍓',n:'Stroberi',p:5,h:28,hp:12},{id:'donat',e:'🍩',n:'Donat',p:6,h:35,hp:15},{id:'pizza',e:'🍕',n:'Pizza',p:8,h:50,hp:10},{id:'boba',e:'🧋',n:'Boba',p:10,h:20,hp:25,en:12}];
const ACCS=[{id:'bunga',e:'🌸',n:'Bunga',slot:'head',p:20,lv:1},{id:'pita',e:'🎀',n:'Pita',slot:'head',p:25,lv:1},{id:'topi',e:'🧢',n:'Topi',slot:'head',p:30,lv:2},{id:'sulap',e:'🎩',n:'Topi Sulap',slot:'head',p:45,lv:3},{id:'toga',e:'🎓',n:'Toga',slot:'head',p:60,lv:4},{id:'mahkota',e:'👑',n:'Mahkota',slot:'head',p:120,lv:6},
 {id:'kacamata',e:'👓',n:'Kacamata',slot:'eyes',p:30,lv:1},{id:'hitam',e:'🕶️',n:'Kacamata Hitam',slot:'eyes',p:35,lv:2},
 {id:'lonceng',e:'🔔',n:'Lonceng',slot:'neck',p:25,lv:1},{id:'syal',e:'🧣',n:'Syal',slot:'neck',p:40,lv:2},{id:'medali',e:'🏅',n:'Medali',slot:'neck',p:50,lv:4}];
const QUESTS=[{id:'feed',t:'Kasih makan 2x',n:2,r:8},{id:'play',t:'Ajak main 2x',n:2,r:8},{id:'rub',t:'Elus Piwo 3x',n:3,r:6},{id:'pages',t:'Buka 3 halaman portal',n:3,r:8},{id:'chat',t:'Tanya Piwo 1 pertanyaan',n:1,r:10},{id:'game',t:'Main Tangkap Makanan',n:1,r:8}];
const pet={name:'Piwo',hunger:80,happy:80,energy:80,xp:0,t:Date.now(),coins:0,streak:0,claim:'',own:[],eq:{},fav:'',q:{d:'',p:{},c:{},pg:[]},gp:{d:'',n:0,best:0},tip:0};
let sleepUntil=0,lastWarn=0,lastPetXp=0,dirty=false,saveT=0,lastCd=0,needT=0,tab='rawat',ui=null,gameOn=false;
const day=o=>{const d=new Date(Date.now()+(o||0)*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dq=()=>{if(!pet.q||pet.q.d!==day())pet.q={d:day(),p:{},c:{},pg:[]};if(!pet.gp)pet.gp={d:'',n:0,best:0};if(pet.gp.d!==day()){pet.gp.d=day();pet.gp.n=0}};
const lvOf=x=>1+Math.floor(Math.sqrt(Math.max(0,x)/12)),xpAt=l=>12*(l-1)*(l-1),cl100=v=>clamp(v,0,100);
const extra=()=>({coins:pet.coins,streak:pet.streak,claim:pet.claim,own:pet.own,eq:pet.eq,fav:pet.fav,q:pet.q,gp:pet.gp,tip:pet.tip});
const sb=(fn,body,keep)=>{const C=window.XIA_CONFIG;if(!C||!C.SUPABASE_URL||!C.SUPABASE_ANON_KEY)return Promise.resolve(null);
 return fetch(C.SUPABASE_URL+'/rest/v1/rpc/'+fn,{method:'POST',keepalive:!!keep,headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:'Bearer '+C.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.ok?r.json():null).catch(()=>null)};
const saveLocal=()=>{try{localStorage.setItem(PK,JSON.stringify(Object.assign({},pet,{t:pet.t})))}catch(e){}};
const flush=keep=>{clearTimeout(saveT);if(!dirty)return;dirty=false;sb('piwo_pet_save',{p_device:DEV,p_name:pet.name,p_hunger:Math.round(pet.hunger),p_happy:Math.round(pet.happy),p_energy:Math.round(pet.energy),p_xp:Math.round(pet.xp),p_extra:extra()},keep)};
const changed=full=>{pet.t=Date.now();dirty=true;saveLocal();render(full);clearTimeout(saveT);saveT=setTimeout(()=>flush(),3000)};
/* waktu berjalan: makin lama makin lapar/bosan. offline dibatasi 6 jam & ada batas bawah, jadi Piwo nggak "mati" */
function decay(ms,offline){const min=Math.min(ms,6*36e5)/6e4;if(min<=0)return;const sl=!offline&&m&&m.state==='sleep';
 pet.hunger=cl100(pet.hunger-min*(sl?.2:.5));pet.happy=cl100(pet.happy-min*(pet.hunger<20?.6:.3));pet.energy=cl100(sl?pet.energy+min*1.5:pet.energy-min*(offline?.1:.25));
 if(offline){pet.hunger=Math.max(pet.hunger,5);pet.happy=Math.max(pet.happy,10)}}
function gain(xp){const l0=lvOf(pet.xp);pet.xp+=xp;const l1=lvOf(pet.xp);if(l1>l0&&m){m.sfx.levelup();m.react('happy');const nw=ACCS.filter(a=>a.lv===l1).map(a=>a.e).join(' ');setTimeout(()=>m&&m.say('Level up! Sekarang Lv '+l1+(nw?' · toko buka '+nw:'')+'~',{mood:'happy'}),500);toast('⭐ Level '+l1+'!'+(nw?' Aksesori baru '+nw:''))}}
let toastT=0;function toast(t){if(!ui)return;ui.toast.textContent=t;ui.toast.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>ui.toast.classList.remove('on'),2600)}
function earn(c,msg){pet.coins+=c;if(m)m.sfx.coin();toast('🪙 +'+c+' · '+msg)}
function qp(id,n){dq();const Q=QUESTS.find(x=>x.id===id);if(!Q||pet.q.c[id])return;pet.q.p[id]=(pet.q.p[id]||0)+(n||1);
 if(pet.q.p[id]>=Q.n){pet.q.c[id]=1;earn(Q.r,'Misi: '+Q.t);if(QUESTS.every(x=>pet.q.c[x.id]))setTimeout(()=>{earn(15,'Semua misi hari ini beres!');changed(true)},1200)}changed(true)}
function qpage(p){dq();if(!pet.q.pg.includes(p)){pet.q.pg.push(p);qp('pages')}}
function status(){if(Date.now()<sleepUntil||(m&&m.state==='sleep'))return'Zzz… lagi tidur';
 if(pet.hunger<25)return'Laper banget… kasih makan dong';if(pet.energy<20)return'Ngantuk berat, butuh tidur';if(pet.happy<25)return'Lagi sedih, ajak main yuk';
 const a=(pet.hunger+pet.happy+pet.energy)/3;return a>75?'Lagi happy banget!':a>50?'Baik-baik aja~':'Agak lesu nih…'}
/* ---------- aksesori: elemen DOM yang nempel ke tubuh Piwo (ikut goyang/loncat) ---------- */
const AS={head:{x:512,y:122,k:.3},eyes:{x:512,y:452,k:.44},neck:{x:512,y:600,k:.26}};let accWrap=null;const accEl={};
function accSync(){if(!accWrap)return;['head','eyes','neck'].forEach(sl=>{const id=pet.eq[sl],a=id&&ACCS.find(x=>x.id===id);
 if(!a){if(accEl[sl]){accEl[sl].remove();delete accEl[sl]}return}
 if(!accEl[sl]){const e=document.createElement('div');e.className='pp-acc';accWrap.appendChild(e);accEl[sl]=e}accEl[sl].textContent=a.e})}
(function accTick(){requestAnimationFrame(accTick);if(!m||!accWrap)return;for(const sl in accEl){const d=AS[sl],p=m.scr(d.x,d.y),e=accEl[sl];
 e.style.fontSize=(cur.s*d.k*((m.scx+m.scy)/2)).toFixed(1)+'px';e.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) translate(-50%,-50%) rotate('+m.rotNow.toFixed(3)+'rad)'}})();
function emoji(ch,rise){if(!m)return;const s=cur.s,e=document.createElement('div');e.textContent=ch;
 e.style.cssText='position:fixed;left:'+(cur.x+s/2-s*.14)+'px;top:0;font-size:'+Math.round(s*.28)+'px;z-index:1560;pointer-events:none;will-change:transform,opacity';document.body.appendChild(e);
 const y0=cur.y-s*(rise?-.05:.12),y1=rise?cur.y-s*.3:cur.y+s*.4;
 e.animate([{transform:'translateY('+y0+'px) scale(.5)',opacity:0},{transform:'translateY('+(y0+(y1-y0)*.2)+'px) scale(1.15)',opacity:1,offset:.2},{transform:'translateY('+y1+'px) scale(.85)',opacity:1,offset:.85},{transform:'translateY('+y1+'px) scale(.2)',opacity:0}],{duration:rise?1100:850,easing:'ease-in'}).onfinish=()=>e.remove()}
const cooldown=ms=>{const n=Date.now();if(n-lastCd<ms)return false;lastCd=n;return true};
const hushBubble=()=>{try{m.hush()}catch(e){}};
const ACT={
 feed(f){f=f||FOODS[0];if(!m||!cooldown(1100))return;m.sfx.init();
  if(pet.hunger>=96){m.react('shake');m.say('Udah kenyang banget, nanti meletus~',{mood:'shy'});return}
  if(f.p>pet.coins){toast('Koinmu kurang 🪙 — selesaikan misi dulu!');return}
  pet.coins-=f.p;const fav=f.id===pet.fav;emoji(f.e);setTimeout(()=>{if(!m)return;m.sfx.munch();m.squish(1.1)},430);
  setTimeout(()=>{if(!m)return;m.sfx.gulp();m.react(fav?'love':'happy');pet.hunger=cl100(pet.hunger+f.h);pet.happy=cl100(pet.happy+f.hp*(fav?2:1));if(f.en)pet.energy=cl100(pet.energy+f.en);gain((f.p?5:3)+(fav?4:0));qp('feed');changed(true);
   m.say(fav?'WAH, ini favoritku! Makasih banyak ❤️':pet.hunger>90?'Hmm, enak banget! Kenyang~':'Nyam nyam, makasih ya!',{mood:'happy'})},900)},
 play(){if(!m||!cooldown(1500))return;m.sfx.init();
  if(pet.energy<15){m.react('yawn');m.say('Aku capek… tidur dulu ya?',{mood:'sad'});return}
  emoji('🎾',true);m.sfx.play();m.react('hop',90);setTimeout(()=>m&&m.react('giggle'),450);
  pet.happy=cl100(pet.happy+26);pet.energy=cl100(pet.energy-10);pet.hunger=cl100(pet.hunger-5);gain(6);qp('play');changed(true);
  setTimeout(()=>m&&m.say(['Seru banget!','Lagi lagi lagi~','Hihi, ayo main lagi!'][Math.random()*3|0],{mood:'happy'}),700)},
 nap(){if(!m||Date.now()<sleepUntil)return;m.sfx.init();
  if(pet.energy>=92){m.react('shake');m.say('Belum ngantuk nih~',{mood:'shy'});return}
  hushBubble();m.setState('sleep');m.sfx.snore();sleepUntil=Date.now()+7000;
  const iv=setInterval(()=>{if(!m||Date.now()>=sleepUntil){clearInterval(iv);return}pet.energy=cl100(pet.energy+6);m.sfx.snore();changed()},1500);
  setTimeout(()=>{if(!m)return;gain(2);pet.energy=cl100(Math.max(pet.energy,75));pet.t=Date.now();if(m.state==='sleep')m.wake();changed()},7000);changed()},
 rub(){if(!m)return;m.sfx.init();m.react('love');pet.happy=cl100(pet.happy+8);gain(1);qp('rub');changed(true)},
 claim(){dq();const t=day();if(pet.claim===t)return;pet.streak=pet.claim===day(-1)?pet.streak+1:1;pet.claim=t;earn(10+Math.min(pet.streak,7)*3,'Absen harian · streak '+pet.streak+' hari');gain(3);if(m)m.react('happy');changed(true)},
 acc(id){const a=ACCS.find(x=>x.id===id);if(!a)return;m&&m.sfx.init();
  if(pet.eq[a.slot]===id){delete pet.eq[a.slot];m&&m.sfx.pop()}
  else if(pet.own.includes(id)){pet.eq[a.slot]=id;m&&(m.sfx.pop(),m.react('happy'))}
  else{if(lvOf(pet.xp)<a.lv){toast('🔒 Butuh Lv '+a.lv);return}if(pet.coins<a.p){toast('Koinmu kurang 🪙');return}
   pet.coins-=a.p;pet.own.push(id);pet.eq[a.slot]=id;if(m){m.sfx.coin();m.react('love');setTimeout(()=>m.say('Wah, '+a.n+' baru! Keren nggak?',{mood:'happy'}),400)}}
  accSync();changed(true)}
};
function rename(){const n=prompt('Kasih nama peliharaanmu (maks 16 huruf):',pet.name);if(n==null)return;const v=n.trim().slice(0,16);if(!v)return;pet.name=v;changed(true);if(m)m.say('Hai, namaku sekarang '+v+'~',{mood:'happy'})}
/* ---------- tampilan panel ---------- */
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function paneShop(){const lv=lvOf(pet.xp);
 return '<h4>Makanan <small>langsung dimakan Piwo · favorit = bonus 2x</small></h4><div class="pp-grid">'+FOODS.map(f=>'<button type="button" class="pp-it" data-food="'+f.id+'"><span class="e">'+f.e+'</span><b>'+f.n+'</b><i>'+(f.p?'🪙 '+f.p:'Gratis')+'</i>'+(f.id===pet.fav?'<u>❤️ favorit</u>':'')+'</button>').join('')+'</div>'+
 '<h4>Aksesori <small>naik level buat buka yang baru</small></h4><div class="pp-grid">'+ACCS.map(a=>{const on=pet.eq[a.slot]===a.id,own=pet.own.includes(a.id),lock=!own&&lv<a.lv;
  return'<button type="button" class="pp-it'+(on?' on':'')+(lock?' lock':'')+'" data-acc="'+a.id+'"><span class="e">'+a.e+'</span><b>'+a.n+'</b><i>'+(on?'✓ Dipakai':own?'Pakai':lock?'🔒 Lv '+a.lv:'🪙 '+a.p)+'</i></button>'}).join('')+'</div>'}
function paneQuest(){dq();const t=day(),got=pet.claim===t,st=got?pet.streak:(pet.claim===day(-1)?pet.streak:0);
 let dots='';for(let i=1;i<=7;i++)dots+='<span class="'+(i<=st%7||(st>0&&st%7===0)?'on':'')+'">'+(i===7?'🎁':i)+'</span>';
 return'<div class="pp-card"><div><b>Absen harian</b><small>'+(got?'Sudah diambil. Besok lanjut ya!':'Ambil koin gratis, makin lama streak makin banyak')+'</small><div class="pp-dots">'+dots+'</div></div><button type="button" class="pp-go" data-claim="1"'+(got?' disabled':'')+'>'+(got?'✓':'Ambil')+'</button></div>'+
 '<h4>Misi hari ini <small>reset tiap hari</small></h4>'+QUESTS.map(q=>{const p=Math.min(q.n,pet.q.p[q.id]||0),d=!!pet.q.c[q.id];return'<div class="pp-q'+(d?' done':'')+'"><div><b>'+E(q.t)+'</b><div class="pp-bar sm"><i style="width:'+(p/q.n*100)+'%;background:#22c55e"></i></div></div><span>'+(d?'✓':p+'/'+q.n)+'</span><em>🪙 '+q.r+'</em></div>'}).join('')}
function paneGame(){dq();const left=Math.max(0,3-pet.gp.n);
 return'<div class="pp-card col"><div><b>🍎 Tangkap Makanan</b><small>30 detik. Tap makanan yang jatuh, jangan tap 🌶️! ⭐ = 5 poin.</small></div><div class="pp-info"><span>🏆 Rekor <b>'+(pet.gp.best||0)+'</b></span><span>🎟️ Hadiah hari ini <b>'+left+'/3</b></span></div><button type="button" class="pp-go big" data-game="1">Mulai main</button></div><p class="pp-note">Koin hadiah = skor ÷ 3 (maks 20). Setelah 3x sehari, tetap bisa latihan tapi tanpa koin.</p>'}
function render(full){if(!ui)return;const l=lvOf(pet.xp),a=xpAt(l),b=xpAt(l+1);
 ui.name.firstChild.nodeValue=pet.name+' ✎';ui.lv.textContent='Lv '+l;ui.coins.textContent='🪙 '+pet.coins;ui.xp.style.width=clamp((pet.xp-a)/(b-a)*100,0,100)+'%';ui.xpt.textContent=Math.floor(pet.xp-a)+' / '+(b-a)+' XP';ui.st.textContent=status();
 ui.fav.textContent='Makanan favorit: '+((FOODS.find(f=>f.id===pet.fav)||{}).e||'?');
 [['hunger',pet.hunger],['happy',pet.happy],['energy',pet.energy]].forEach(([k,v])=>{const e=ui[k];e.style.width=v+'%';e.parentNode.classList.toggle('low',v<25);e.parentNode.nextSibling.textContent=Math.round(v)});
 const sl=Date.now()<sleepUntil||(m&&m.state==='sleep');ui.feed.disabled=ui.play.disabled=ui.nap.disabled=sl;
 if(full||ui.dirtyTab){ui.dirtyTab=0;ui.shop.innerHTML=paneShop();ui.quest.innerHTML=paneQuest();ui.game.innerHTML=paneGame()}
 ui.tabs.forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));ui.panes.forEach(p=>p.classList.toggle('on',p.dataset.pane===tab))}
function build(){
 const st=document.createElement('style');st.textContent=`
#piwo-pet{position:fixed;inset:0;z-index:1500;pointer-events:none;visibility:hidden}
#piwo-pet.on{pointer-events:auto;visibility:visible}
#piwo-pet .pp-scrim{position:absolute;inset:0;background:rgba(0,0,0,.34);opacity:0;transition:opacity .3s}
#piwo-pet.on .pp-scrim{opacity:1}
#piwo-pet .pp-sheet{position:absolute;left:0;right:0;bottom:0;max-width:520px;height:min(66vh,520px);margin:0 auto;padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));border-radius:28px 28px 0 0;display:flex;flex-direction:column;
 background:var(--md-sys-color-surface-container-high,#fff);color:var(--md-sys-color-on-surface,#171D19);transform:translateY(105%);transition:transform .38s cubic-bezier(.2,.9,.25,1);box-shadow:0 -10px 40px rgba(0,0,0,.25);font-family:inherit}
#piwo-pet.on .pp-sheet{transform:none}
.pp-grab{width:38px;height:4px;border-radius:4px;background:var(--md-sys-color-outline-variant,#c4c8c2);margin:0 auto 8px;flex:none}
.pp-head{display:flex;align-items:center;gap:8px;flex:none}
.pp-head>div:first-child{flex:1;min-width:0}
.pp-name{font:800 18px/1.2 inherit;background:none;border:0;color:inherit;padding:3px 0;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pp-lv{display:inline-block;margin-left:6px;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:800;background:var(--md-sys-color-primary-container,#cdeed9);color:var(--md-sys-color-on-primary-container,#0b2015)}
.pp-coins{padding:5px 11px;border-radius:99px;font-size:13px;font-weight:800;background:#fde68a;color:#5b4300}
.pp-x{width:34px;height:34px;border-radius:50%;border:0;background:var(--md-sys-color-surface-container-highest,#e4e9e4);color:inherit;font-size:15px;cursor:pointer}
.pp-xpw{height:6px;border-radius:6px;background:var(--md-sys-color-surface-container-highest,#e4e9e4);overflow:hidden;margin:6px 0 2px;flex:none}
.pp-xpw i{display:block;height:100%;width:0;border-radius:6px;background:var(--md-sys-color-tertiary,#8a6d00);transition:width .5s}
.pp-xpt{font-size:11px;opacity:.65;text-align:right;flex:none}
.pp-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:4px;border-radius:16px;background:var(--md-sys-color-surface-container-highest,#e4e9e4);margin:6px 0 8px;flex:none}
.pp-tabs button{border:0;background:none;color:inherit;font:700 12.5px/1 inherit;padding:9px 0;border-radius:12px;cursor:pointer;opacity:.75}
.pp-tabs button.on{background:var(--md-sys-color-surface,#fff);opacity:1;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.pp-body{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.pp-pane{display:none}.pp-pane.on{display:block}
.pp-st{margin:2px 0 8px;font-size:14px;font-weight:700;opacity:.9}
.pp-fav{font-size:12px;opacity:.65;margin:8px 0 0}
.pp-row{display:grid;grid-template-columns:86px 1fr 28px;align-items:center;gap:8px;margin:7px 0;font-size:13px;font-weight:700}
.pp-bar{height:10px;border-radius:10px;background:var(--md-sys-color-surface-container-highest,#e4e9e4);overflow:hidden}
.pp-bar.sm{height:6px;margin-top:5px}
.pp-bar i{display:block;height:100%;width:0;border-radius:10px;transition:width .5s,background .3s}
.pp-bar.low i{background:#ef4444!important}
.pp-row b{font-size:12px;opacity:.7;text-align:right;font-weight:700}
.pp-act{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
.pp-act button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 9px;border-radius:18px;border:0;cursor:pointer;font:700 12px/1.1 inherit;background:var(--md-sys-color-secondary-container,#d7e8dc);color:var(--md-sys-color-on-secondary-container,#0e1f14);transition:transform .12s,opacity .2s}
.pp-act button span{font-size:24px;line-height:1}
.pp-act button:active,.pp-it:active,.pp-go:active{transform:scale(.94)}
.pp-act button:disabled{opacity:.4}
.pp-pane h4{margin:12px 0 7px;font-size:13px;font-weight:800}.pp-pane h4:first-child{margin-top:2px}
.pp-pane h4 small,.pp-card small{display:block;font-size:11px;font-weight:600;opacity:.65;margin-top:2px}
.pp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pp-it{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px 8px;border-radius:16px;border:2px solid transparent;cursor:pointer;background:var(--md-sys-color-secondary-container,#d7e8dc);color:var(--md-sys-color-on-secondary-container,#0e1f14);font:inherit;transition:transform .12s}
.pp-it .e{font-size:27px;line-height:1.1}.pp-it b{font-size:11.5px;font-weight:800;text-align:center}.pp-it i{font-style:normal;font-size:11px;font-weight:700;opacity:.8}
.pp-it u{position:absolute;top:-7px;right:-3px;text-decoration:none;font-size:9.5px;font-weight:800;background:#ef4444;color:#fff;border-radius:99px;padding:2px 6px}
.pp-it.on{border-color:var(--md-sys-color-primary,#1b6b3a)}.pp-it.lock{opacity:.5}
.pp-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;background:var(--md-sys-color-secondary-container,#d7e8dc);color:var(--md-sys-color-on-secondary-container,#0e1f14)}
.pp-card>div:first-child{flex:1}.pp-card b{font-size:14px;font-weight:800}.pp-card.col{flex-direction:column;align-items:stretch}
.pp-dots{display:flex;gap:5px;margin-top:8px}.pp-dots span{flex:1;text-align:center;font-size:11px;font-weight:800;padding:5px 0;border-radius:9px;background:rgba(0,0,0,.1);opacity:.6}.pp-dots span.on{background:#f59e0b;color:#fff;opacity:1}
.pp-go{border:0;border-radius:14px;padding:11px 18px;font:800 13px/1 inherit;cursor:pointer;background:var(--md-sys-color-primary,#1b6b3a);color:var(--md-sys-color-on-primary,#fff);transition:transform .12s}
.pp-go:disabled{opacity:.45}.pp-go.big{padding:14px;font-size:15px}
.pp-q{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;padding:9px 12px;border-radius:14px;margin-bottom:6px;background:var(--md-sys-color-surface-container-highest,#e4e9e4)}
.pp-q b{font-size:12.5px;font-weight:700}.pp-q span{font-size:12px;font-weight:800;opacity:.75}.pp-q em{font-style:normal;font-size:12px;font-weight:800;background:#fde68a;color:#5b4300;padding:3px 8px;border-radius:99px}
.pp-q.done{opacity:.55}.pp-q.done b{text-decoration:line-through}
.pp-info{display:flex;gap:8px}.pp-info span{flex:1;padding:9px;border-radius:12px;text-align:center;font-size:12px;font-weight:700;background:rgba(0,0,0,.08)}.pp-info b{font-size:14px}
.pp-note{font-size:11px;opacity:.6;margin:10px 2px}
#pp-toast{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));z-index:1600;transform:translate(-50%,-140%);padding:10px 16px;border-radius:99px;max-width:88vw;font:800 13px/1.3 inherit;background:#1f2a22;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .35s cubic-bezier(.2,.9,.25,1);pointer-events:none;text-align:center}
#pp-toast.on{transform:translate(-50%,0)}
#pp-acc-wrap{position:fixed;inset:0;z-index:61;pointer-events:none}
.pp-acc{position:absolute;left:0;top:0;line-height:1;pointer-events:none;will-change:transform;filter:drop-shadow(0 2px 2px rgba(0,0,0,.28))}
#piwo-game{position:fixed;inset:0;z-index:1500;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;background:radial-gradient(80% 60% at 50% 30%,rgba(255,244,214,.96),rgba(255,226,170,.96));font-family:inherit;color:#3b2a00}
html[data-mode=dark] #piwo-game{background:radial-gradient(80% 60% at 50% 30%,#2a2417,#16130b);color:#ffe9b0}
.pg-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 0;z-index:5;pointer-events:none}
.pg-top b{font-size:22px;font-weight:900}.pg-top button{pointer-events:auto;width:38px;height:38px;border-radius:50%;border:0;background:rgba(0,0,0,.14);color:inherit;font-size:16px}
.pg-i{position:absolute;left:0;top:0;font-size:42px;line-height:1;will-change:transform;cursor:pointer;touch-action:none;padding:8px}
.pg-res{position:absolute;inset:0;z-index:6;display:none;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:18vh;gap:10px;text-align:center}
.pg-res.on{display:flex}.pg-res h2{font-size:30px;font-weight:900;margin:0}.pg-res p{font-size:15px;font-weight:700;margin:0}
.pg-res div{display:flex;gap:10px;margin-top:10px}.pg-res button{border:0;border-radius:16px;padding:13px 20px;font:800 14px/1 inherit;cursor:pointer;background:#1b6b3a;color:#fff}.pg-res button.alt{background:rgba(0,0,0,.14);color:inherit}
`;document.head.appendChild(st);
 accWrap=document.createElement('div');accWrap.id='pp-acc-wrap';document.body.appendChild(accWrap);
 const root=document.createElement('div');root.id='piwo-pet';root.setAttribute('aria-hidden','true');
 root.innerHTML=`<div class="pp-scrim"></div><section class="pp-sheet" role="dialog" aria-label="Peliharaan Piwo"><div class="pp-grab"></div>
<div class="pp-head"><div><button class="pp-name" type="button" aria-label="Ganti nama">Piwo ✎</button><span class="pp-lv">Lv 1</span></div><span class="pp-coins">🪙 0</span><button class="pp-x" type="button" aria-label="Tutup">✕</button></div>
<div class="pp-xpw"><i></i></div><div class="pp-xpt"></div>
<div class="pp-tabs"><button type="button" data-tab="rawat">🏠 Rawat</button><button type="button" data-tab="toko">🛍️ Toko</button><button type="button" data-tab="misi">📋 Misi</button><button type="button" data-tab="game">🎮 Game</button></div>
<div class="pp-body">
<div class="pp-pane" data-pane="rawat"><p class="pp-st"></p>
<div class="pp-row"><span>🍙 Kenyang</span><div class="pp-bar"><i style="background:#f59e0b"></i></div><b></b></div>
<div class="pp-row"><span>💖 Senang</span><div class="pp-bar"><i style="background:#ec4899"></i></div><b></b></div>
<div class="pp-row"><span>⚡ Energi</span><div class="pp-bar"><i style="background:#22c55e"></i></div><b></b></div>
<div class="pp-act"><button type="button" data-a="feed" aria-label="Kasih makan"><span>🍙</span>Makan</button><button type="button" data-a="play" aria-label="Ajak main"><span>🎾</span>Main</button><button type="button" data-a="nap" aria-label="Tidurkan"><span>🌙</span>Tidur</button><button type="button" data-a="rub" aria-label="Elus"><span>💕</span>Elus</button></div>
<p class="pp-fav"></p></div>
<div class="pp-pane" data-pane="toko"></div><div class="pp-pane" data-pane="misi"></div><div class="pp-pane" data-pane="game"></div>
</div></section>`;
 document.body.appendChild(root);
 const tt=document.createElement('div');tt.id='pp-toast';tt.setAttribute('role','status');document.body.appendChild(tt);
 const q=x=>root.querySelector(x),bars=root.querySelectorAll('.pp-bar i');
 ui={root,toast:tt,name:q('.pp-name'),lv:q('.pp-lv'),coins:q('.pp-coins'),xp:q('.pp-xpw i'),xpt:q('.pp-xpt'),st:q('.pp-st'),fav:q('.pp-fav'),hunger:bars[0],happy:bars[1],energy:bars[2],
  feed:q('[data-a=feed]'),play:q('[data-a=play]'),nap:q('[data-a=nap]'),shop:q('[data-pane=toko]'),quest:q('[data-pane=misi]'),game:q('[data-pane=game]'),
  tabs:[...root.querySelectorAll('[data-tab]')],panes:[...root.querySelectorAll('[data-pane]')]};
 ui.name.addEventListener('click',rename);q('.pp-x').addEventListener('click',()=>petClose());q('.pp-scrim').addEventListener('click',()=>petClose());
 ui.tabs.forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;render(true)}));
 root.addEventListener('click',e=>{const t=e.target.closest('[data-a],[data-food],[data-acc],[data-claim],[data-game]');if(!t)return;
  if(t.dataset.a)ACT[t.dataset.a]();else if(t.dataset.food)ACT.feed(FOODS.find(f=>f.id===t.dataset.food));else if(t.dataset.acc)ACT.acc(t.dataset.acc);else if(t.dataset.claim)ACT.claim();else if(t.dataset.game)gameStart()});
 addEventListener('keydown',e=>{if(e.key==='Escape'){if(gameOn)gameQuit();else petClose()}});
 accSync();render(true)}
/* ---------- buka / tutup panel ---------- */
async function petOpen(t){if(!m||panelOpen||lock||at!=='home'||busy||gameOn)return;if(t)tab=t;panelOpen=true;at='pet';ui.root.classList.add('on');ui.root.setAttribute('aria-hidden','false');setZ(1510);hushBubble();dq();render(true);
 m.sfx.init();await wait(60);if(calm)put(A.pet());else await fly(A.pet,{dur:620,h:.2});if(at==='pet')m.react('wave')}
async function petClose(quiet){if(!panelOpen)return;panelOpen=false;ui.root.classList.remove('on');ui.root.setAttribute('aria-hidden','true');
 if(at==='pet')at='home';if(quiet)return;if(calm)put(A.home());else await fly(A.home,{dur:650,h:.22});if(at==='home')setZ(60)}
/* ---------- game: Tangkap Makanan ---------- */
let G=null;
function gameStart(){if(!m||gameOn)return;dq();gameOn=true;panelOpen=false;ui.root.classList.remove('on');at='game';m.sfx.init();hushBubble();
 const ov=document.createElement('div');ov.id='piwo-game';ov.innerHTML='<div class="pg-top"><b class="pg-s">⭐ 0</b><b class="pg-t">30</b><button type="button" aria-label="Tutup">✕</button></div><div class="pg-res"></div>';document.body.appendChild(ov);
 ov.querySelector('.pg-top button').onclick=gameQuit;
 G={ov,score:0,left:30,t0:performance.now(),items:new Set(),run:true,hits:0,res:ov.querySelector('.pg-res'),sEl:ov.querySelector('.pg-s'),tEl:ov.querySelector('.pg-t')};
 if(calm)put(A.game());else fly(A.game,{dur:520,h:.15});
 const GOOD=[['🍎',1],['🍓',1],['🍩',2],['🍕',2],['🍙',1],['⭐',5]],BAD=['🌶️'];
 const spawn=()=>{if(!G||!G.run)return;const el=document.createElement('div'),bad=Math.random()<.2,g=bad?[BAD[0],-3]:(Math.random()<.08?GOOD[5]:GOOD[Math.random()*5|0]);
  el.className='pg-i';el.textContent=g[0];const x=6+Math.random()*(innerWidth-70),el_t=(performance.now()-G.t0)/1000,dur=2600-el_t*35;el.style.left=x+'px';ov.appendChild(el);
  const an=el.animate([{transform:'translateY(-60px) rotate(0deg)'},{transform:'translateY('+(innerHeight+20)+'px) rotate('+(Math.random()*60-30|0)+'deg)'}],{duration:Math.max(1500,dur),easing:'linear'});
  const it={el,an,done:0};G.items.add(it);an.onfinish=()=>{G&&G.items.delete(it);el.remove()};
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(it.done||!G||!G.run)return;it.done=1;const r=el.getBoundingClientRect();an.cancel();el.style.transform='translateY('+(r.top-8)+'px)';
   G.score=Math.max(0,G.score+g[1]);G.sEl.textContent='⭐ '+G.score;
   if(g[1]<0){m.react('surprise');m.sfx.growl()}else{m.sfx.pop();m.squish(.5);if(++G.hits%6===0)m.react('happy')}
   el.animate([{opacity:1,transform:el.style.transform+' scale(1)'},{opacity:0,transform:el.style.transform+' scale(1.7)'}],{duration:240,fill:'forwards'}).onfinish=()=>el.remove()});
  G.sp=setTimeout(spawn,Math.max(330,720-el_t*14))};
 spawn();
 G.tick=setInterval(()=>{if(!G)return;const l=Math.max(0,30-Math.floor((performance.now()-G.t0)/1000));G.tEl.textContent='⏱ '+l;if(l<=0)gameEnd()},250)}
function gameClear(){if(!G)return;G.run=false;clearTimeout(G.sp);clearInterval(G.tick);G.items.forEach(i=>i.an.cancel())}
function gameEnd(){if(!G||!G.run)return;gameClear();const s=G.score,rewarded=pet.gp.n<3;pet.gp.n++;const c=rewarded?Math.min(20,Math.floor(s/3)):0,xp=Math.floor(s/2),best=s>(pet.gp.best||0);if(best)pet.gp.best=s;
 pet.coins+=c;gain(xp);pet.happy=cl100(pet.happy+10);pet.energy=cl100(pet.energy-6);qp('game');changed(true);
 if(c)m.sfx.coin();m.react(s>=15?'happy':'nod');
 G.res.innerHTML='<h2>'+(s>=25?'🎉 Keren!':s>=12?'😄 Seru!':'🙂 Lumayan!')+'</h2><p>Skor <b>'+s+'</b>'+(best?' · rekor baru!':'')+'</p><p>'+(rewarded?'🪙 +'+c:'Latihan (hadiah harian habis)')+' · ⭐ +'+xp+' XP</p><div><button type="button" class="alt" data-r="done">Selesai</button><button type="button" data-r="again">Main lagi</button></div>';
 G.res.classList.add('on');G.res.onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;const a=b.dataset.r;gameDestroy();if(a==='again')setTimeout(gameStart,60);else gameHome(true)}}
function gameDestroy(){gameClear();if(G&&G.ov)G.ov.remove();G=null;gameOn=false}
async function gameHome(openPanel){at='home';if(openPanel){tab='game';await petOpenFromGame()}else{if(calm)put(A.home());else await fly(A.home,{dur:650,h:.22});if(at==='home')setZ(60)}}
async function petOpenFromGame(){panelOpen=true;at='pet';ui.root.classList.add('on');ui.root.setAttribute('aria-hidden','false');render(true);await wait(60);if(calm)put(A.pet());else await fly(A.pet,{dur:560,h:.18})}
function gameQuit(){if(!gameOn)return;gameDestroy();gameHome(true)}
/* ---------- tik tiap 20 dtk: status turun, Piwo mengeluh kalau perlu ---------- */
setInterval(()=>{if(!m)return;const n=Date.now();decay(n-pet.t,false);pet.t=n;saveLocal();dirty=true;render();
 if(n-lastWarn<120000||lock||busy||at!=='home'||m.state==='sleep'||document.hidden)return;
 const say=(f,t)=>{lastWarn=n;needT=n+9000;f&&f();m.say(t+' (tap di sini buat ngurus)',{mood:'sad'})};
 if(pet.hunger<25)say(()=>{m.sfx.growl();m.react('sad')},'Perutku bunyi… laper nih~');
 else if(pet.energy<20)say(()=>m.react('yawn'),'Hoaam… ngantuk…');
 else if(pet.happy<25)say(()=>m.react('sad'),'Main sama aku dong…')},20000);
setInterval(()=>{if(dirty)flush()},120000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){pet.t=Date.now();saveLocal();dirty=true;flush(true)}});
async function loadPet(){
 let loc=null;try{loc=JSON.parse(localStorage.getItem(PK)||localStorage.getItem('piwo-pet-v1'))}catch(e){}
 const ok=o=>o&&typeof o.hunger=='number'&&typeof o.happy=='number'&&typeof o.energy=='number';
 if(ok(loc)){Object.assign(pet,loc);decay(Date.now()-(loc.t||Date.now()),true)}
 if(!pet.fav)pet.fav=FOODS[1+(Math.random()*(FOODS.length-1)|0)].id;
 pet.t=Date.now();dq();build();
 const r=await sb('piwo_pet_get',{p_device:DEV});
 if(r&&ok(r)){const srvT=Date.now()-(r.now-r.last_tick); /* waktu simpan server, dalam jam perangkat ini */
  if(!ok(loc)||(loc.t||0)<srvT-1000){const ex=r.extra&&typeof r.extra==='object'?r.extra:{};Object.assign(pet,ex,{name:r.name||pet.name,hunger:r.hunger,happy:r.happy,energy:r.energy,xp:Math.max(r.xp,pet.xp)});if(!pet.fav)pet.fav=FOODS[1].id;decay(Math.max(0,r.now-r.last_tick),true);pet.t=Date.now()}
  else if(r.xp>pet.xp)pet.xp=r.xp}
 dq();dirty=true;saveLocal();accSync();render(true);
 if(m)setTimeout(()=>{if(!m||lock||at!=='home'||document.hidden)return;
  if(!pet.tip){pet.tip=1;changed();m.say('Tahan aku lama-lama atau buka Pengaturan, ada status, toko & misi harian~',{mood:'happy'})}
  else if(pet.hunger<25){needT=Date.now()+9000;m.sfx.growl();m.say('Aku laper… tap di sini buat kasih makan~',{mood:'sad'})}else if(pet.energy<20)m.say('Ngantuk banget hari ini…',{mood:'sad'})},6500)}
/* ---------- pintu masuk (nggak nutupin apa pun): tahan Piwo, chip di chat, baris di Pengaturan, atau tap bubble keluhannya ---------- */
let lp=null;
addEventListener('pointerdown',e=>{if(!m||lock||panelOpen||gameOn||at!=='home'||e.button>0||!ui)return;if(!m.hit(e.clientX,e.clientY))return;
 lp={id:e.pointerId,x:e.clientX,y:e.clientY,tm:setTimeout(()=>{if(!lp)return;lp=null;m.down=null;m.rub=0;try{navigator.vibrate&&navigator.vibrate(14)}catch(_){}m.squish(1.3);m.sfx.bell();petOpen()},520)}},true);
['pointermove','pointerup','pointercancel'].forEach(t=>addEventListener(t,e=>{if(!lp||e.pointerId!==lp.id)return;if(t!=='pointermove'||Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10){clearTimeout(lp.tm);lp=null}},true));
function mountEntries(){
 const chips=document.getElementById('xc-chips');
 if(chips&&!document.getElementById('pp-chip')){const b=document.createElement('button');b.type='button';b.id='pp-chip';b.className='xc-chip';b.textContent='🐾 Peliharaanku';
  b.addEventListener('click',e=>{e.stopPropagation();if(typeof window.closeChatbot==='function')window.closeChatbot();setTimeout(()=>petOpen(),760)});chips.appendChild(b)}
 const lb=document.getElementById('toggle-sfx')&&document.getElementById('toggle-sfx').closest('label');
 if(lb&&!document.getElementById('pp-set')){const b=document.createElement('button');b.type='button';b.id='pp-set';b.className=lb.className.replace('cursor-pointer','')+' w-full text-left cursor-pointer';
  b.innerHTML='<div><div class="text-xs font-bold">Peliharaan Piwo</div><div class="text-[11px] text-m3-onSurfaceVariant">Status, toko aksesori, misi harian &amp; game</div></div><span style="font-size:22px">🐾</span>';
  b.addEventListener('click',()=>petOpen());lb.parentNode.insertBefore(b,lb.nextSibling)}}

window.Piwo={
 say:(t,o)=>m&&m.say(t,o),react:n=>m&&m.react(n),chat,setSound:on=>m&&m.setSound(on),openPet:petOpen,closePet:()=>petClose(),
 think(on){if(!m)return;if(on){qp('chat');m.state='thinking';m.lastAct=performance.now()}else if(m.state==='thinking')m.state='idle'},
 talk(on,t){if(!m)return;clearInterval(tk);if(on)tk=setInterval(()=>m.talkT=Math.random()<.25?.05:.4+Math.random()*.6,90);else{m.talkT=0;m.react(/maaf|belum ada|tidak ada|gagal/i.test(t||'')?'sad':'nod')}},
 fail(){m&&m.react('sad')}
};
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
 m.on('pet',()=>{const n=Date.now();if(n-lastPetXp<4000)return;lastPetXp=n;pet.happy=cl100(pet.happy+5);gain(1);qp('rub');changed(true)});
 loadPet();mountEntries();setTimeout(mountEntries,1500);
 m.bub.addEventListener('click',()=>{if(Date.now()<needT){needT=0;petOpen()}});
 if(R.classList.contains('piwo-intro'))await intro();
}catch(e){R.classList.remove('piwo-intro','piwo-out');console.warn('Piwo gagal dimuat',e)}})();
})();
