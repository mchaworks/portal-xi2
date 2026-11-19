/* Piwo Arcade: 5 game + papan skor (Supabase). Tampilan pakai token tema web, ikut mode terang/gelap. */
(()=>{
'use strict';
const META=[
 {id:'catch',n:'Tangkap Makanan',e:'🍎',ref:40,d:'Tap makanan yang jatuh. Hindari 🌶️ (−3), ⭐ = 5 poin, ⏱️ nambah waktu. Combo bikin bonus!'},
 {id:'memory',n:'Pasangkan Kartu',e:'🧠',ref:100,d:'Buka dua kartu dan cocokkan 8 pasang. Makin sedikit langkah & makin cepat, makin tinggi skornya.'},
 {id:'whack',n:'Usir Tikus',e:'🐭',ref:30,d:'Tap 🐭 yang muncul dari lubang (+1), 🧀 emas (+3). Jangan tap 🐱 (−2)! 30 detik.'},
 {id:'jump',own:1,n:'Piwo Lompat',e:'🏃',ref:25,d:'Tap untuk lompat, tahan buat lompat lebih tinggi. Lewati rintangan, ambil ⭐ (+2). Makin lama makin ngebut!'},
 {id:'quiz',n:'Kuis Kelas',e:'💡',ref:80,d:'10 soal pengetahuan umum, 12 detik per soal. Benar = 10 poin.'}];
const QB=[['Ibu kota Sumatera Selatan?','Palembang','Jambi','Bengkulu','Lampung'],['Hasil dari 12 × 12?','144','121','124','132'],['Rumus kimia air?','H₂O','CO₂','O₂','NaCl'],['Planet terdekat dari Matahari?','Merkurius','Venus','Mars','Bumi'],
['Proklamasi kemerdekaan Indonesia dibacakan tanggal?','17 Agustus 1945','17 Agustus 1950','1 Juni 1945','28 Oktober 1945'],['Penulis novel “Laskar Pelangi”?','Andrea Hirata','Tere Liye','Habiburrahman El Shirazy','Pramoedya Ananta Toer'],['Gas terbanyak di atmosfer Bumi?','Nitrogen','Oksigen','Karbon dioksida','Argon'],
['Satuan SI untuk gaya?','Newton','Joule','Watt','Pascal'],['Jembatan ikonik kota Palembang?','Jembatan Ampera','Jembatan Suramadu','Jembatan Barelang','Jembatan Mahakam'],['Akar kuadrat dari 169?','13','12','14','17'],['Sila pertama Pancasila?','Ketuhanan Yang Maha Esa','Kemanusiaan yang adil dan beradab','Persatuan Indonesia','Keadilan sosial'],
['Organ yang memompa darah ke seluruh tubuh?','Jantung','Paru-paru','Hati','Ginjal'],['Makanan khas Palembang berbahan ikan dan sagu?','Pempek','Rendang','Gudeg','Soto Betawi'],['Benua terluas di dunia?','Asia','Afrika','Amerika','Eropa'],['Hasil dari 7² + 3²?','58','52','62','64'],
['Proses tumbuhan membuat makanan dengan bantuan cahaya?','Fotosintesis','Respirasi','Transpirasi','Fermentasi'],['Presiden pertama Republik Indonesia?','Soekarno','Soeharto','Moh. Hatta','B.J. Habibie'],['Antonim kata “rajin”?','Malas','Tekun','Giat','Ulet'],['Simbol kimia unsur emas?','Au','Ag','Fe','Go'],
['Sungai yang membelah kota Palembang?','Musi','Kapuas','Mahakam','Barito'],['Jumlah sudut dalam segitiga?','180°','90°','270°','360°'],['Simbol kimia natrium?','Na','N','Ne','Ni'],['Ibu kota Jepang?','Tokyo','Osaka','Kyoto','Seoul'],['Mamalia terbesar di dunia?','Paus biru','Gajah afrika','Hiu paus','Jerapah'],
['Bilangan prima di antara ini?','17','15','21','27'],['Sumpah Pemuda diikrarkan tahun?','1928','1945','1908','1926'],['Alat untuk mengukur suhu?','Termometer','Barometer','Higrometer','Amperemeter'],['Lagu kebangsaan Indonesia?','Indonesia Raya','Garuda Pancasila','Halo-Halo Bandung','Tanah Airku'],
['Nilai sin 90° adalah?','1','0','½','√3'],['Lapisan atmosfer tempat kita hidup?','Troposfer','Stratosfer','Mesosfer','Termosfer'],['Kepanjangan CPU?','Central Processing Unit','Computer Power Unit','Central Program Utility','Core Processing Unit'],['Hukum Newton I disebut juga hukum?','Kelembaman','Aksi-reaksi','Gravitasi','Percepatan'],
['Rumus luas lingkaran?','πr²','2πr','πd²','½πr'],['Pencetus teori relativitas?','Albert Einstein','Isaac Newton','Galileo Galilei','Nikola Tesla'],['Candi Borobudur terletak di Jawa …?','Tengah','Barat','Timur','Selatan'],['Mata uang Jepang?','Yen','Won','Yuan','Ringgit'],
['Arti “Bhinneka Tunggal Ika”?','Berbeda-beda tetapi tetap satu','Bersatu kita teguh','Satu nusa satu bangsa','Tanah air beta'],['15% dari 200 adalah?','30','25','35','20'],['Organ penghasil insulin?','Pankreas','Hati','Lambung','Usus halus'],['Ibu kota Australia?','Canberra','Sydney','Melbourne','Perth'],
['Bagian sel tempat respirasi seluler?','Mitokondria','Ribosom','Nukleus','Lisosom'],['Kepanjangan HTML?','HyperText Markup Language','High Text Machine Language','HyperTool Multi Language','Home Text Markup Level'],['Hasil dari 2¹⁰?','1024','512','2048','100'],['Kata baku yang benar?','Apotek','Apotik','Apothek','Apoteek'],
['Gunung tertinggi di Indonesia?','Puncak Jaya','Gunung Kerinci','Gunung Rinjani','Gunung Semeru'],['Pelukis lukisan Mona Lisa?','Leonardo da Vinci','Pablo Picasso','Vincent van Gogh','Raden Saleh']];
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CSS=`
#piwo-game{position:fixed;inset:0;z-index:1500;display:flex;flex-direction:column;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Inter,system-ui,sans-serif;color:var(--md-sys-color-on-surface);
 background:radial-gradient(70% 45% at 15% 0%,color-mix(in srgb,var(--md-sys-color-primary-container) 80%,transparent),transparent 70%),radial-gradient(60% 40% at 100% 100%,color-mix(in srgb,var(--md-sys-color-tertiary-container) 70%,transparent),transparent 70%),var(--md-sys-color-surface);animation:pgIn .35s ease both}
@keyframes pgIn{from{opacity:0;transform:scale(1.03)}}
.pg-top{flex:none;display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 8px}
.pg-back{width:40px;height:40px;border-radius:50%;border:1px solid var(--md-sys-color-outline-variant);background:rgba(var(--glass-rgb,245,251,246),.9);color:inherit;display:grid;place-items:center;cursor:pointer;flex:none}
.pg-title{flex:1;font:800 17px/1.1 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pg-chip{padding:7px 13px;border-radius:99px;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container);min-width:58px;text-align:center}
.pg-chip.b{background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container)}
.pg-stage{flex:1;min-height:0;position:relative;overflow:hidden}
.pg-foot{display:none}
.pg-card{position:absolute;left:50%;top:50%;width:min(92%,380px);max-height:96%;overflow:auto;touch-action:pan-y;transform:translate(-50%,-50%);padding:20px 18px 18px;border-radius:40px 14px 40px 14px;text-align:center;
 background:rgba(var(--glass-rgb,245,251,246),.96);border:1px solid var(--md-sys-color-outline-variant);box-shadow:0 24px 60px -24px rgba(0,0,0,.45);animation:pgPop .45s cubic-bezier(.22,1.3,.36,1) both;z-index:5}
@keyframes pgPop{from{opacity:0;transform:translate(-50%,-46%) scale(.9)}}
.pg-blob{width:68px;height:68px;margin:0 auto 8px;display:grid;place-items:center;font-size:36px;background:var(--md-sys-color-primary-container);border-radius:38% 62% 55% 45%/48% 40% 60% 52%}
.pg-card h2{margin:0;font:800 24px/1.1 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.025em}
.pg-card p{margin:8px 0 0;font-size:13px;line-height:1.45;font-weight:500;color:var(--md-sys-color-on-surface-variant)}
.pg-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px}
.pg-chips span{padding:5px 11px;border-radius:99px;font-size:12px;font-weight:800;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}
.pg-chips span.g{background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container)}
.pg-big{font:800 54px/1 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.04em;margin:6px 0 0;color:var(--md-sys-color-primary)}
.pg-lb{margin:14px 0 0;padding:0;list-style:none;text-align:left;display:grid;gap:4px}
.pg-lb li{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:14px;font-size:12.5px;font-weight:700;background:var(--md-sys-color-surface-container)}
.pg-lb li.me{background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container)}.pg-lb li b{width:18px;opacity:.6}.pg-lb li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pg-lb li em{font-style:normal;font-weight:800}
.pg-lbh{margin:14px 0 0;font:800 12px/1 Inter,sans-serif;text-align:left;color:var(--md-sys-color-on-surface-variant);letter-spacing:.04em;text-transform:uppercase}
.pg-btns{display:flex;gap:8px;margin-top:16px}.pg-btns button{flex:1;border:0;border-radius:99px;padding:13px 10px;font:800 14px/1 Inter,sans-serif;cursor:pointer;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transition:transform .15s}
.pg-btns button.alt{background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}.pg-btns button:active{transform:scale(.95)}
.pg-cd{position:absolute;inset:0;display:grid;place-items:center;font:800 96px/1 'Bricolage Grotesque',Inter,sans-serif;color:var(--md-sys-color-primary);z-index:6;pointer-events:none}
.pg-cd b{animation:pgCd .9s ease both}@keyframes pgCd{from{opacity:0;transform:scale(2)}40%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}
.pg-i{position:absolute;left:0;top:0;font-size:40px;line-height:1;padding:8px;cursor:pointer;touch-action:none;will-change:transform}
.pg-pop{position:absolute;font:800 18px/1 Inter,sans-serif;pointer-events:none;z-index:4;animation:pgUp .7s ease-out both}@keyframes pgUp{to{opacity:0;transform:translateY(-34px)}}
.pg-pop.p{color:var(--md-sys-color-primary)}.pg-pop.n{color:#ef4444}
/* memory */
.pg-mg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.pg-mc{position:relative;padding:0;border:0;background:none;perspective:600px;cursor:pointer}
.pg-mc .in{position:absolute;inset:0;transition:transform .35s;transform-style:preserve-3d}.pg-mc.up .in,.pg-mc.ok .in{transform:rotateY(180deg)}
.pg-mc .f,.pg-mc .bk{position:absolute;inset:0;display:grid;place-items:center;border-radius:20px 8px 20px 8px;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.pg-mc .bk{background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);font:800 22px/1 'Bricolage Grotesque',sans-serif;border:2px solid var(--md-sys-color-outline-variant)}
.pg-mc .f{transform:rotateY(180deg);background:var(--md-sys-color-surface-container-high);font-size:clamp(24px,8vw,38px);border:2px solid var(--md-sys-color-outline-variant)}
.pg-mc.ok .f{background:var(--md-sys-color-primary-container);border-color:var(--md-sys-color-primary)}
/* whack */
.pg-wg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;grid-template-columns:repeat(3,1fr);gap:10px 14px}
.pg-h{position:relative;aspect-ratio:1;overflow:hidden;border-radius:0 0 50% 50%/0 0 30% 30%;cursor:pointer;touch-action:none}
.pg-h::after{content:'';position:absolute;left:0;right:0;bottom:0;height:34%;border-radius:50%;background:var(--md-sys-color-tertiary-container);box-shadow:inset 0 8px 14px rgba(0,0,0,.28);z-index:2}
.pg-h::before{content:'';position:absolute;left:8%;right:8%;bottom:6%;height:22%;border-radius:50%;background:rgba(0,0,0,.35);z-index:0}
.pg-cr{position:absolute;left:0;right:0;bottom:16%;text-align:center;font-size:calc(var(--cell,100px)*.52);line-height:1;transform:translateY(105%);transition:transform .14s ease-out;z-index:1}.pg-h.up .pg-cr{transform:none}.pg-h.hit .pg-cr{transform:translateY(60%) scale(.8);opacity:.6}
/* jump */
.pg-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
/* quiz */
.pg-qz{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:0 16px 84px;max-width:460px;margin:0 auto}
.pg-qn{font-size:12px;font-weight:800;color:var(--md-sys-color-on-surface-variant)}.pg-qt{height:6px;border-radius:6px;background:var(--md-sys-color-surface-container-highest);overflow:hidden}.pg-qt i{display:block;height:100%;width:100%;background:var(--md-sys-color-primary);border-radius:6px}
.pg-qq{padding:16px;border-radius:30px 12px 30px 12px;background:var(--md-sys-color-surface-container-high);border:1px solid var(--md-sys-color-outline-variant);font:800 17px/1.3 'Bricolage Grotesque',Inter,sans-serif;text-align:center}
.pg-qa{display:grid;gap:8px}.pg-qa button{padding:13px 14px;border-radius:18px;border:2px solid transparent;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);font:700 14px/1.25 Inter,sans-serif;text-align:left;cursor:pointer;transition:transform .12s}
.pg-qa button:active{transform:scale(.97)}.pg-qa button.ok{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)}.pg-qa button.no{background:#ef4444;color:#fff}
`;
let styled=false;
function loop(fn){let last=performance.now(),on=true,id;const f=n=>{if(!on)return;const dt=Math.min(.05,(n-last)/1e3);last=n;fn(dt);id=requestAnimationFrame(f)};id=requestAnimationFrame(f);return()=>{on=false;cancelAnimationFrame(id)}}
const popAt=(S,x,y,t,c)=>{const e=document.createElement('div');e.className='pg-pop '+c;e.textContent=t;e.style.left=x+'px';e.style.top=y+'px';S.appendChild(e);setTimeout(()=>e.remove(),700)};

/* ---------- 1. Tangkap Makanan ---------- */
function gCatch(S,H,end,env){let score=0,time=30,combo=0,t=0,sp=0,over=false;const items=new Set(),FOOD=[['🍎',1],['🍓',1],['🍙',1],['🍩',2],['🍕',2],['🍪',1]];
 const hud=()=>{H.a.textContent='⭐ '+score;H.b.textContent='⏱ '+Math.ceil(time)};hud();
 function spawn(){const r=Math.random();let g;if(r<.17)g={e:'🌶️',p:-3,bad:1};else if(r<.22)g={e:'⏱️',p:0,time:3};else if(r<.29)g={e:'⭐',p:5};else{const f=pick(FOOD);g={e:f[0],p:f[1]}}
  const el=document.createElement('div');el.className='pg-i';el.textContent=g.e;S.appendChild(el);
  const it={el,g,x:rnd(4,S.clientWidth-60),y:-60,vy:rnd(150,220)+Math.min(220,t*5),rot:rnd(-30,30),done:0};items.add(it);
  el.addEventListener('pointerdown',ev=>{ev.preventDefault();if(it.done||over)return;it.done=1;items.delete(it);el.remove();const gx=it.x,gy=it.y;
   if(g.bad){score=Math.max(0,score-3);combo=0;env.m.react('surprise');env.sfx.growl();popAt(S,gx,gy,'−3','n')}
   else if(g.time){time=Math.min(45,time+3);env.sfx.coin();popAt(S,gx,gy,'+3 dtk','p')}
   else{combo++;const b=combo>0&&combo%5===0?1:0;score+=g.p+b;env.sfx.pop();env.m.squish(.5);if(combo%6===0)env.m.react('happy');popAt(S,gx,gy,'+'+(g.p+b)+(b?' combo!':''),'p')}
   hud()})}
 const stop=loop(dt=>{if(over)return;t+=dt;time-=dt;sp-=dt;if(sp<=0){spawn();sp=Math.max(.32,.78-t*.012)}
  const h=S.clientHeight;items.forEach(it=>{it.y+=it.vy*dt;it.rot+=dt*20;it.el.style.transform='translate('+it.x.toFixed(1)+'px,'+it.y.toFixed(1)+'px) rotate('+it.rot.toFixed(1)+'deg)';if(it.y>h+10){items.delete(it);it.el.remove()}});
  H.b.textContent='⏱ '+Math.max(0,Math.ceil(time));if(time<=0){over=true;end(score)}});
 return{stop}}

/* ---------- 2. Pasangkan Kartu ---------- */
function gMemory(S,H,end,env){const em=shuf(['🍎','🍓','🍩','🍕','🍙','🍪','🧋','🍜']),deck=shuf(em.concat(em));let first=null,lock=false,moves=0,matched=0,secs=0,over=false;
 const g=document.createElement('div');g.className='pg-mg';const sz=Math.max(150,Math.min(S.clientWidth-24,S.clientHeight-96,400));g.style.width=sz+'px';g.style.height=sz+'px';S.appendChild(g);
 const hud=()=>{H.a.textContent='👣 '+moves;H.b.textContent='⏱ '+Math.floor(secs)};hud();
 const cards=deck.map(e=>{const b=document.createElement('button');b.type='button';b.className='pg-mc';b.innerHTML='<div class="in"><div class="bk">?</div><div class="f">'+e+'</div></div>';g.appendChild(b);const c={b,e,open:0};
  b.addEventListener('pointerdown',ev=>{ev.preventDefault();if(lock||over||c.open)return;c.open=1;b.classList.add('up');env.sfx.blip();
   if(!first){first=c;return}moves++;hud();const a=first;first=null;
   if(a.e===c.e){lock=true;setTimeout(()=>{a.b.classList.add('ok');c.b.classList.add('ok');lock=false;matched++;env.sfx.pop();env.m.squish(.6);if(matched===8){over=true;env.m.react('happy');setTimeout(()=>end(Math.max(10,Math.min(160,Math.round(190-moves*5-secs)))),500)}},380)}
   else{lock=true;setTimeout(()=>{a.b.classList.remove('up');c.b.classList.remove('up');a.open=c.open=0;lock=false},750)}});return c});
 const stop=loop(dt=>{if(over)return;secs+=dt;H.b.textContent='⏱ '+Math.floor(secs);if(secs>=90){over=true;end(matched*6)}});return{stop}}

/* ---------- 3. Usir Tikus ---------- */
function gWhack(S,H,end,env){let score=0,time=30,t=0,sp=.5,over=false;const w=document.createElement('div');w.className='pg-wg';const sz=Math.min(S.clientWidth-24,S.clientHeight-20,380);w.style.width=sz+'px';w.style.setProperty('--cell',Math.floor((sz-28)/3)+'px');S.appendChild(w);
 const hud=()=>{H.a.textContent='⭐ '+score;H.b.textContent='⏱ '+Math.ceil(time)};hud();
 const hs=Array.from({length:9},()=>{const el=document.createElement('div');el.className='pg-h';el.innerHTML='<div class="pg-cr"></div>';w.appendChild(el);const h={el,cr:el.firstChild,life:0,type:null,lock:0};
  el.addEventListener('pointerdown',ev=>{ev.preventDefault();if(over||!h.type||h.life<=0)return;const ty=h.type;h.life=0;h.type=null;h.lock=1;el.classList.add('hit');setTimeout(()=>{el.classList.remove('up','hit');h.lock=0},180);
   const r=el.getBoundingClientRect(),sr=S.getBoundingClientRect(),px=r.left-sr.left+r.width/2-10,py=r.top-sr.top;
   if(ty.p<0){score=Math.max(0,score+ty.p);env.sfx.growl();env.m.react('surprise');popAt(S,px,py,String(ty.p),'n')}else{score+=ty.p;env.sfx.pop();env.m.squish(.5);popAt(S,px,py,'+'+ty.p,'p')}hud()});return h});
 const T=[{e:'🐭',p:1,w:70},{e:'🧀',p:3,w:10},{e:'🐱',p:-2,w:20}];
 const stop=loop(dt=>{if(over)return;t+=dt;time-=dt;sp-=dt;
  if(sp<=0){sp=Math.max(.36,.85-t*.014);const free=hs.filter(h=>!h.type&&!h.lock);if(free.length){const h=pick(free);let r=Math.random()*100,ty=T[0];for(const x of T){if(r<x.w){ty=x;break}r-=x.w}h.type=ty;h.life=Math.max(.6,1.15-t*.016);h.cr.textContent=ty.e;h.el.classList.add('up')}}
  hs.forEach(h=>{if(h.type){h.life-=dt;if(h.life<=0){h.type=null;h.el.classList.remove('up')}}});
  H.b.textContent='⏱ '+Math.max(0,Math.ceil(time));if(time<=0){over=true;end(score)}});return{stop}}

/* ---------- 4. Piwo Lompat (canvas) ---------- */
function gJump(S,H,end,env){const cv=document.createElement('canvas');cv.className='pg-cv';S.appendChild(cv);const dpr=Math.min(2,devicePixelRatio||1),W=S.clientWidth,Hh=S.clientHeight;cv.width=W*dpr;cv.height=Hh*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
 const cs=getComputedStyle(document.documentElement),col=n=>cs.getPropertyValue(n).trim()||'#1B6B51',P=col('--md-sys-color-primary'),PC=col('--md-sys-color-primary-container'),OV=col('--md-sys-color-outline-variant'),TC=col('--md-sys-color-tertiary-container');
 const img=new Image();img.src='./icons/piwo.png';const gy=Hh*.8,S0=46,px=W*.2,G=2300;let y=gy-S0,vy=0,hold=false,buf=0,score=0,t=0,speed=290,nextObs=.8,over=false,dist=0,rot=0;const obs=[],stars=[],clouds=Array.from({length:4},()=>({x:rnd(0,W),y:rnd(20,gy*.45),s:rnd(.5,1)}));
 const hud=()=>{H.a.textContent='🏃 '+score;H.b.textContent=Math.floor(dist/60)+' m'};hud();
 const jump=()=>{if(over)return;buf=.12};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();hold=true;jump()});const up=()=>{hold=false};const kd=e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();if(!e.repeat){hold=true;jump()}}},ku=e=>{if(e.code==='Space'||e.code==='ArrowUp')hold=false};addEventListener('keydown',kd);addEventListener('keyup',ku);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',up);
 const stop=loop(dt=>{t+=dt;if(!over){speed=290+Math.min(300,t*8);dist+=speed*dt;rot=0;
   if(buf>0){buf-=dt;if(y>=gy-S0-1){vy=-780;buf=0;env.sfx.boing&&env.sfx.boing()}}
   vy+=G*(hold&&vy<0?.5:1)*dt;y+=vy*dt;if(y>gy-S0){y=gy-S0;vy=0}else rot=vy*.0006;
   nextObs-=dt;if(nextObs<=0){const big=Math.random()<.4;obs.push({x:W+20,w:big?30:36,h:big?52:36,e:big?'🌵':'🪨',p:0});if(Math.random()<.45)stars.push({x:W+20+rnd(180,300),y:gy-rnd(110,150),g:0});nextObs=rnd(.95,1.7)*(290/speed)+.35}
   obs.forEach(o=>{o.x-=speed*dt;if(!o.p&&o.x+o.w<px){o.p=1;score++;hud()}
    if(px+S0-9>o.x+4&&px+9<o.x+o.w-4&&y+S0-6>gy-o.h+4&&!over){over=true;env.m.react('sad');env.sfx.growl();setTimeout(()=>end(score),600)}});
   stars.forEach(s=>{s.x-=speed*dt;if(!s.g&&Math.abs(s.x-(px+S0/2))<30&&Math.abs(s.y-(y+S0/2))<34){s.g=1;score+=2;env.sfx.coin();hud()}});
   for(let i=obs.length-1;i>=0;i--)if(obs[i].x<-60)obs.splice(i,1);for(let i=stars.length-1;i>=0;i--)if(stars[i].x<-40||stars[i].g)stars.splice(i,1);
   clouds.forEach(k=>{k.x-=speed*dt*.12*k.s;if(k.x<-60){k.x=W+40;k.y=rnd(20,gy*.45)}});H.b.textContent=Math.floor(dist/60)+' m'}
  c.clearRect(0,0,W,Hh);c.globalAlpha=.55;c.fillStyle=PC;clouds.forEach(k=>{c.beginPath();c.ellipse(k.x,k.y,38*k.s,14*k.s,0,0,7);c.fill()});c.globalAlpha=1;
  c.fillStyle=TC;c.fillRect(0,gy,W,Hh-gy);c.fillStyle=P;c.fillRect(0,gy,W,4);c.fillStyle=OV;for(let i=0;i<14;i++){const x=((i*90-dist*.9)%(W+90)+W+90)%(W+90)-45;c.fillRect(x,gy+18+(i%3)*14,22,3)}
  c.font='34px serif';c.textBaseline='bottom';c.textAlign='left';obs.forEach(o=>{c.font=Math.round(o.h*1.05)+'px serif';c.fillText(o.e,o.x-2,gy+4)});
  c.font='30px serif';c.textBaseline='middle';c.textAlign='center';stars.forEach(s=>c.fillText('⭐',s.x,s.y+Math.sin(t*5+s.x)*3));
  c.save();c.translate(px+S0/2,y+S0/2);c.rotate(rot);if(over)c.rotate(.5);if(img.complete&&img.naturalWidth)c.drawImage(img,-S0/2-4,-S0/2-4,S0+8,S0+8);else{c.fillStyle=P;c.beginPath();c.arc(0,0,S0/2,0,7);c.fill()}c.restore();c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(px+S0/2,gy+3,S0*.4*(1-(gy-S0-y)/400),5,0,0,7);c.fill()});
 return{stop(){stop();removeEventListener('keydown',kd);removeEventListener('keyup',ku)}}}

/* ---------- 5. Kuis Kelas ---------- */
function gQuiz(S,H,end,env){const qs=shuf(QB).slice(0,10);let i=0,score=0,tm=12,lock=false,over=false;const box=document.createElement('div');box.className='pg-qz';S.appendChild(box);
 const hud=()=>{H.a.textContent='⭐ '+score;H.b.textContent='✓ '+i+'/10'};
 function show(){hud();if(i>=10){over=true;env.m.react(score>=60?'happy':'nod');setTimeout(()=>end(score),300);return}lock=false;tm=12;const q=qs[i],ans=q[1],opts=shuf(q.slice(1));
  box.innerHTML='<div class="pg-qn">Soal '+(i+1)+' dari 10</div><div class="pg-qt"><i></i></div><div class="pg-qq">'+E(q[0])+'</div><div class="pg-qa">'+opts.map(o=>'<button type="button" data-a="'+E(o)+'">'+E(o)+'</button>').join('')+'</div>';
  box.querySelectorAll('button').forEach(b=>b.addEventListener('pointerdown',ev=>{ev.preventDefault();if(lock||over)return;pick1(b.dataset.a===ans,b,ans)}))}
 function pick1(good,b,ans){lock=true;if(good){score+=10;env.sfx.coin();env.m.react('nod');b&&b.classList.add('ok')}else{env.sfx.growl();env.m.react('sad');b&&b.classList.add('no');box.querySelectorAll('button').forEach(x=>{if(x.dataset.a===ans)x.classList.add('ok')})}
  hud();setTimeout(()=>{i++;show()},900)}
 show();const stop=loop(dt=>{if(over||lock)return;tm-=dt;const bar=box.querySelector('.pg-qt i');if(bar)bar.style.width=Math.max(0,tm/12*100)+'%';if(tm<=0){lock=true;pick1(false,null,qs[i][1])}});return{stop}}

const GAMES={catch:gCatch,memory:gMemory,whack:gWhack,jump:gJump,quiz:gQuiz};
const BACK='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';

function start(id,env){
 if(!styled){const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);styled=true}
 const meta=META.find(x=>x.id===id),ov=document.createElement('div');ov.id='piwo-game';
 ov.innerHTML='<div class="pg-top"><button class="pg-back" type="button" aria-label="Kembali">'+BACK+'</button><div class="pg-title">'+meta.e+' '+E(meta.n)+'</div><span class="pg-chip"></span><span class="pg-chip b"></span></div><div class="pg-stage"></div><div class="pg-foot"></div>';
 document.body.appendChild(ov);const S=ov.querySelector('.pg-stage'),chips=ov.querySelectorAll('.pg-chip'),H={a:chips[0],b:chips[1]};let cur=null,alive=true,cdT=0;
 const clearStage=()=>{if(cur){try{cur.stop()}catch(e){}cur=null}S.replaceChildren()};
 const quit=()=>{if(!alive)return;alive=false;clearTimeout(cdT);clearStage();ov.remove();env.done()};
 ov.querySelector('.pg-back').onclick=quit;
 function intro(){clearStage();H.a.textContent='';H.b.textContent='';const inf=env.info(id);
  const c=document.createElement('div');c.className='pg-card';c.innerHTML='<div class="pg-blob">'+meta.e+'</div><h2>'+E(meta.n)+'</h2><p>'+E(meta.d)+'</p><div class="pg-chips"><span>🏆 Rekor '+inf.best+'</span><span class="g">'+(inf.left?'🪙 Hadiah '+inf.left+'x lagi':'Mode latihan')+'</span></div><div class="pg-lbw"></div><div class="pg-btns"><button type="button" class="alt" data-x>Keluar</button><button type="button" data-go>Mulai</button></div>';
  S.appendChild(c);c.querySelector('[data-x]').onclick=quit;c.querySelector('[data-go]').onclick=()=>run();
  env.top(id).then(r=>{if(!alive||!c.isConnected||!r)return;const w=c.querySelector('.pg-lbw');if(!r.top||!r.top.length){w.innerHTML='<div class="pg-lbh">Papan skor</div><p>Belum ada skor. Jadilah yang pertama!</p>';return}
   w.innerHTML='<div class="pg-lbh">Papan skor kelas'+(r.rank?' · kamu #'+r.rank+' dari '+r.total:'')+'</div><ul class="pg-lb">'+r.top.map((x,k)=>'<li class="'+(x.me?'me':'')+'"><b>'+(k+1)+'</b><span>'+E(x.name)+(x.me?' (kamu)':'')+'</span><em>'+x.best+'</em></li>').join('')+'</ul>'})}
 function run(){clearStage();let n=3;const cd=document.createElement('div');cd.className='pg-cd';S.appendChild(cd);env.m.react('nod');
  const tick=()=>{if(!alive)return;if(n===0){cd.remove();go();return}cd.innerHTML='<b>'+n+'</b>';env.sfx.blip();n--;cdT=setTimeout(tick,800)};tick()}
 function go(){let done=false;cur=GAMES[id](S,H,sc=>{if(done||!alive)return;done=true;result(sc)},env)}
 function result(score){const r=env.submit(id,score),good=score>=meta.ref*1.2?'🎉 Keren banget!':score>=meta.ref*.6?'😄 Seru!':'🙂 Lumayan!';if(r.newBest)env.sfx.levelup();env.m.react(score>=meta.ref*.6?'happy':'nod');
  clearStage();const c=document.createElement('div');c.className='pg-card';
  c.innerHTML='<h2>'+good+'</h2><div class="pg-big">'+score+'</div><p>'+(r.newBest?'✨ Rekor baru!':'Skor akhir')+'</p><div class="pg-chips"><span class="g">'+(r.rewarded?'🪙 +'+r.coins+' koin':'Latihan (hadiah habis)')+'</span><span>⭐ +'+r.xp+' XP</span><span class="rk">Peringkat …</span></div><div class="pg-btns"><button type="button" class="alt" data-x>Selesai</button><button type="button" data-go>Main lagi</button></div>';
  S.appendChild(c);c.querySelector('[data-x]').onclick=quit;c.querySelector('[data-go]').onclick=()=>run();
  r.rank.then(x=>{const el=c.querySelector('.rk');if(!el)return;if(x&&x.rank)el.textContent='🏅 Peringkat #'+x.rank;else el.remove()})}
 intro()}
window.PiwoGames={meta:META,start};
})();
