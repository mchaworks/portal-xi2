/* Piwo Pet v3: status, toko, misi, hub game. Tampilan mengikuti token tema web (Material You sage, bentuk organik, mode gelap). */
(()=>{
'use strict';
const C=window.PiwoCore;if(!C)return;
const {clamp,wait,calm,A,put,setZ,fly}=C;let m=null;
const PK='piwo-pet-v3',DEV=(()=>{try{let d=localStorage.getItem('xia_dev');if(!d){d=((crypto.randomUUID&&crypto.randomUUID())||(Math.random().toString(36).slice(2)+Date.now().toString(36)+'abcdefgh')).replace(/-/g,'');localStorage.setItem('xia_dev',d)}return d}catch(e){return 'tmp'+Math.random().toString(36).slice(2,12)+'xyz'}})();
const FOODS=[{id:'nasi',e:'🍙',n:'Onigiri',p:0,h:22,hp:3},{id:'apel',e:'🍎',n:'Apel',p:3,h:30,hp:5},{id:'kue',e:'🍪',n:'Kukis',p:4,h:25,hp:10},{id:'stroberi',e:'🍓',n:'Stroberi',p:5,h:28,hp:12},{id:'donat',e:'🍩',n:'Donat',p:6,h:35,hp:15},{id:'es',e:'🍦',n:'Es Krim',p:6,h:15,hp:22},{id:'mie',e:'🍜',n:'Mie',p:7,h:45,hp:12},{id:'pizza',e:'🍕',n:'Pizza',p:8,h:50,hp:10},{id:'boba',e:'🧋',n:'Boba',p:10,h:20,hp:25,en:12}];
const ACCS=[{id:'bunga',e:'🌸',n:'Bunga',slot:'head',p:20,lv:1},{id:'pita',e:'🎀',n:'Pita',slot:'head',p:25,lv:1},{id:'topi',e:'🧢',n:'Topi',slot:'head',p:30,lv:2},{id:'sulap',e:'🎩',n:'Topi Sulap',slot:'head',p:45,lv:3},{id:'headset',e:'🎧',n:'Headphone',slot:'head',p:55,lv:3},{id:'toga',e:'🎓',n:'Toga',slot:'head',p:60,lv:4},{id:'mahkota',e:'👑',n:'Mahkota',slot:'head',p:120,lv:6},
 {id:'kacamata',e:'👓',n:'Kacamata',slot:'eyes',p:30,lv:1},{id:'hitam',e:'🕶️',n:'Kacamata Hitam',slot:'eyes',p:35,lv:2},{id:'goggle',e:'🥽',n:'Goggles',slot:'eyes',p:50,lv:4},
 {id:'lonceng',e:'🔔',n:'Lonceng',slot:'neck',p:25,lv:1},{id:'syal',e:'🧣',n:'Syal',slot:'neck',p:40,lv:2},{id:'kalung',e:'📿',n:'Kalung',slot:'neck',p:45,lv:3},{id:'medali',e:'🏅',n:'Medali',slot:'neck',p:50,lv:4}];
const QUESTS=[{id:'feed',t:'Kasih makan 2x',n:2,r:8},{id:'play',t:'Ajak main 2x',n:2,r:8},{id:'rub',t:'Elus Piwo 3x',n:3,r:6},{id:'pages',t:'Buka 3 halaman portal',n:3,r:8},{id:'chat',t:'Tanya Piwo 1 pertanyaan',n:1,r:10},{id:'game',t:'Main 1 game',n:1,r:8},{id:'game3',t:'Main game 3x',n:3,r:12}];
const GM={catch:{rw:2,max:12,div:4},memory:{rw:2,max:12,div:10},whack:{rw:2,max:12,div:4},jump:{rw:2,max:12,div:4},quiz:{rw:2,max:12,div:8}};
const GIDS=Object.keys(GM);
const pet={name:'Piwo',hunger:80,happy:80,energy:80,xp:0,t:Date.now(),coins:0,streak:0,claim:'',own:[],eq:{},fav:'',q:{d:'',p:{},c:{},pg:[]},gp:{d:'',n:{},best:{}},tip:0};
let sleepUntil=0,lastWarn=0,lastPetXp=0,dirty=false,saveT=0,lastCd=0,needT=0,tab='rawat',ui=null,gameOn=false,toastT=0,lbAt=0;const LB={};
const day=o=>{const d=new Date(Date.now()+(o||0)*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dq=()=>{if(!pet.q||pet.q.d!==day())pet.q={d:day(),p:{},c:{},pg:[]};if(!pet.gp||typeof pet.gp.n!=='object'||pet.gp.n===null)pet.gp={d:'',n:{},best:{}};if(typeof pet.gp.best!=='object'||!pet.gp.best)pet.gp.best={};if(pet.gp.d!==day()){pet.gp.d=day();pet.gp.n={}}};
const lvOf=x=>1+Math.floor(Math.sqrt(Math.max(0,x)/12)),xpAt=l=>12*(l-1)*(l-1),cl=v=>clamp(v,0,100);
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sb=(fn,body,keep)=>{const K=window.XIA_CONFIG;if(!K||!K.SUPABASE_URL||!K.SUPABASE_ANON_KEY)return Promise.resolve(null);
 return fetch(K.SUPABASE_URL+'/rest/v1/rpc/'+fn,{method:'POST',keepalive:!!keep,headers:{apikey:K.SUPABASE_ANON_KEY,Authorization:'Bearer '+K.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.ok?r.json():null).catch(()=>null)};
const extra=()=>({coins:pet.coins,streak:pet.streak,claim:pet.claim,own:pet.own,eq:pet.eq,fav:pet.fav,q:pet.q,gp:pet.gp,tip:pet.tip});
const saveLocal=()=>{try{localStorage.setItem(PK,JSON.stringify(pet))}catch(e){}};
const flush=keep=>{clearTimeout(saveT);if(!dirty)return;dirty=false;sb('piwo_pet_save',{p_device:DEV,p_name:pet.name,p_hunger:Math.round(pet.hunger),p_happy:Math.round(pet.happy),p_energy:Math.round(pet.energy),p_xp:Math.round(pet.xp),p_extra:extra()},keep)};
const changed=full=>{pet.t=Date.now();dirty=true;saveLocal();render(full);clearTimeout(saveT);saveT=setTimeout(()=>flush(),3000)};
function decay(ms,offline){const min=Math.min(ms,6*36e5)/6e4;if(min<=0)return;const sl=!offline&&m&&m.state==='sleep';
 pet.hunger=cl(pet.hunger-min*(sl?.2:.5));pet.happy=cl(pet.happy-min*(pet.hunger<20?.6:.3));pet.energy=cl(sl?pet.energy+min*1.5:pet.energy-min*(offline?.1:.25));
 if(offline){pet.hunger=Math.max(pet.hunger,5);pet.happy=Math.max(pet.happy,10)}}
function gain(xp){const l0=lvOf(pet.xp);pet.xp+=xp;const l1=lvOf(pet.xp);if(l1>l0&&m){m.sfx.levelup();m.react('happy');const nw=ACCS.filter(a=>a.lv===l1).map(a=>a.e).join(' ');
 setTimeout(()=>m&&m.say('Level up! Sekarang Lv '+l1+(nw?' · toko buka '+nw:'')+'~',{mood:'happy'}),500);toast('⭐ Level '+l1+'!'+(nw?' Aksesori baru '+nw:''))}}
function toast(t){if(!ui)return;ui.toast.textContent=t;ui.toast.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>ui.toast.classList.remove('on'),2600)}
function earn(c,msg){pet.coins+=c;if(m)m.sfx.coin();toast('+'+c+' koin · '+msg)}
function qp(id,n){dq();const Q=QUESTS.find(x=>x.id===id);if(!Q||pet.q.c[id])return;pet.q.p[id]=(pet.q.p[id]||0)+(n||1);
 if(pet.q.p[id]>=Q.n){pet.q.c[id]=1;earn(Q.r,'Misi: '+Q.t);if(QUESTS.every(x=>pet.q.c[x.id]))setTimeout(()=>{earn(15,'Semua misi hari ini beres!');changed(true)},1200)}changed(true)}
function status(){if(Date.now()<sleepUntil||(m&&m.state==='sleep'))return['😴','Zzz… lagi tidur'];
 if(pet.hunger<25)return['🥺','Laper banget, kasih makan dong'];if(pet.energy<20)return['🥱','Ngantuk berat, butuh tidur'];if(pet.happy<25)return['😢','Lagi sedih, ajak main yuk'];
 const a=(pet.hunger+pet.happy+pet.energy)/3;return a>75?['😄','Lagi happy banget!']:a>50?['🙂','Baik-baik aja~']:['😪','Agak lesu nih…']}
const needs=()=>pet.hunger<25||pet.energy<20||pet.happy<25||pet.claim!==day();

/* ---------- aksesori nempel ke badan Piwo ---------- */
const AS={head:{x:512,y:122,k:.3},eyes:{x:512,y:452,k:.44},neck:{x:512,y:600,k:.26}};let accWrap=null;const accEl={};
function accSync(){if(!accWrap)return;['head','eyes','neck'].forEach(sl=>{const id=pet.eq[sl],a=id&&ACCS.find(x=>x.id===id);
 if(!a){if(accEl[sl]){accEl[sl].remove();delete accEl[sl]}return}
 if(!accEl[sl]){const e=document.createElement('div');e.className='pp-acc';accWrap.appendChild(e);accEl[sl]=e}accEl[sl].textContent=a.e})}
(function accTick(){requestAnimationFrame(accTick);if(!m||!accWrap)return;const cur=C.cur;accWrap.style.display=gameOn?'none':'';
 for(const sl in accEl){const d=AS[sl],p=m.scr(d.x,d.y),e=accEl[sl];e.style.fontSize=(cur.s*d.k*((m.scx+m.scy)/2)).toFixed(1)+'px';e.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) translate(-50%,-50%) rotate('+m.rotNow.toFixed(3)+'rad)'}
 /* badge ikut Piwo */
 if(ui){const ok=C.at==='home'&&!C.lock&&!C.busy&&!gameOn&&!C.panelOpen;ui.badge.classList.toggle('show',ok);
  if(ok){ui.badge.style.transform='translate('+clamp(cur.x-14,6,innerWidth-44)+'px,'+clamp(cur.y+cur.s*.12,60,innerHeight-120)+'px)';ui.badge.classList.toggle('dot',needs())}}})();
function emoji(ch,rise){if(!m)return;const cur=C.cur,s=cur.s,e=document.createElement('div');e.textContent=ch;
 e.style.cssText='position:fixed;left:'+(cur.x+s/2-s*.14)+'px;top:0;font-size:'+Math.round(s*.28)+'px;z-index:1560;pointer-events:none;will-change:transform,opacity';document.body.appendChild(e);
 const y0=cur.y-s*(rise?-.05:.12),y1=rise?cur.y-s*.3:cur.y+s*.4;
 e.animate([{transform:'translateY('+y0+'px) scale(.5)',opacity:0},{transform:'translateY('+(y0+(y1-y0)*.2)+'px) scale(1.15)',opacity:1,offset:.2},{transform:'translateY('+y1+'px) scale(.85)',opacity:1,offset:.85},{transform:'translateY('+y1+'px) scale(.2)',opacity:0}],{duration:rise?1100:850,easing:'ease-in'}).onfinish=()=>e.remove()}
const cooldown=ms=>{const n=Date.now();if(n-lastCd<ms)return false;lastCd=n;return true};
const hush=()=>{try{m.hush()}catch(e){}};
const ACT={
 feed(f){f=f||FOODS[0];if(!m)return;m.sfx.init();
  if(pet.hunger>=96){m.react('shake');m.say('Udah kenyang banget, nanti meletus~',{mood:'shy'});return}
  if(f.p>pet.coins){toast('Koinmu kurang, selesaikan misi atau main game dulu');return}
  if(!cooldown(1100))return;
  pet.coins-=f.p;const fav=f.id===pet.fav;emoji(f.e);setTimeout(()=>{if(m){m.sfx.munch();m.squish(1.1)}},430);
  setTimeout(()=>{if(!m)return;m.sfx.gulp();m.react(fav?'love':'happy');pet.hunger=cl(pet.hunger+f.h);pet.happy=cl(pet.happy+f.hp*(fav?2:1));if(f.en)pet.energy=cl(pet.energy+f.en);gain((f.p?5:3)+(fav?4:0));qp('feed');changed(true);
   m.say(fav?'WAH, ini favoritku! Makasih banyak ❤️':pet.hunger>90?'Hmm, enak banget! Kenyang~':'Nyam nyam, makasih ya!',{mood:'happy'})},900);changed(true)},
 play(){if(!m)return;m.sfx.init();if(pet.energy<15){m.react('yawn');m.say('Aku capek… tidur dulu ya?',{mood:'sad'});return}if(!cooldown(1500))return;
  emoji('🎾',true);m.sfx.play();m.react('hop',90);setTimeout(()=>m&&m.react('giggle'),450);
  pet.happy=cl(pet.happy+26);pet.energy=cl(pet.energy-10);pet.hunger=cl(pet.hunger-5);gain(6);qp('play');changed(true);
  setTimeout(()=>m&&m.say(['Seru banget!','Lagi lagi lagi~','Hihi, ayo main lagi!'][Math.random()*3|0],{mood:'happy'}),700)},
 nap(){if(!m||Date.now()<sleepUntil)return;m.sfx.init();
  if(pet.energy>=92){m.react('shake');m.say('Belum ngantuk nih~',{mood:'shy'});return}
  hush();m.setState('sleep');m.sfx.snore();sleepUntil=Date.now()+7000;
  const iv=setInterval(()=>{if(!m||Date.now()>=sleepUntil){clearInterval(iv);return}pet.energy=cl(pet.energy+6);m.sfx.snore();changed()},1500);
  setTimeout(()=>{if(!m)return;gain(2);pet.energy=cl(Math.max(pet.energy,75));pet.t=Date.now();if(m.state==='sleep')m.wake();changed(true)},7000);changed(true)},
 rub(){if(!m)return;m.sfx.init();m.react('love');pet.happy=cl(pet.happy+8);gain(1);qp('rub');changed(true)},
 claim(){dq();const t=day();if(pet.claim===t)return;pet.streak=pet.claim===day(-1)?pet.streak+1:1;pet.claim=t;const bonus=pet.streak%7===0?20:0;
  earn(10+Math.min(pet.streak,7)*3+bonus,'Absen harian · streak '+pet.streak+' hari'+(bonus?' 🎁':''));gain(3);if(m)m.react('happy');changed(true)},
 acc(id){const a=ACCS.find(x=>x.id===id);if(!a)return;m&&m.sfx.init();
  if(pet.eq[a.slot]===id){delete pet.eq[a.slot];m&&m.sfx.pop()}
  else if(pet.own.includes(id)){pet.eq[a.slot]=id;m&&(m.sfx.pop(),m.react('happy'))}
  else{if(lvOf(pet.xp)<a.lv){toast('Butuh Lv '+a.lv+' dulu');return}if(pet.coins<a.p){toast('Koinmu kurang');return}
   pet.coins-=a.p;pet.own.push(id);pet.eq[a.slot]=id;if(m){m.sfx.coin();m.react('love');setTimeout(()=>m.say('Wah, '+a.n+' baru! Keren nggak?',{mood:'happy'}),400)}}
  accSync();changed(true)}
};
function rename(){const n=prompt('Kasih nama peliharaanmu (maks 16 huruf):',pet.name);if(n==null)return;const v=n.trim().slice(0,16);if(!v)return;pet.name=v;changed(true);if(m)m.say('Hai, namaku sekarang '+v+'~',{mood:'happy'})}

/* ---------- ikon (SVG inline, warna ikut tema) ---------- */
const I=(d,s)=>'<svg width="'+(s||20)+'" height="'+(s||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
const IC={heart:I('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),bag:I('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8a3 3 0 0 1 6 0"/>'),list:I('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/>'),pad:I('<rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 10v5M5.5 12.5h5"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>'),
 x:I('<path d="M6 6l12 12M18 6 6 18"/>',18),coin:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 10c0-1 1.1-1.6 2.5-1.6s2.5.6 2.5 1.6-1.1 1.4-2.5 1.6-2.5.6-2.5 1.6 1.1 1.6 2.5 1.6 2.5-.6 2.5-1.6"/>',16),
 food:I('<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 1.5-3 4-3 7h3v11"/>',18),bolt:I('<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z"/>',18),paw:I('<circle cx="6.5" cy="10" r="1.8"/><circle cx="10.5" cy="6.5" r="1.8"/><circle cx="15.5" cy="6.5" r="1.8"/><circle cx="19" cy="10" r="1.8"/><path d="M12.8 11.5c-2.8 0-5.3 3-5.3 5.2 0 1.6 1.4 2.3 2.8 2.1 1-.2 1.5-.5 2.5-.5s1.5.3 2.5.5c1.4.2 2.8-.5 2.8-2.1 0-2.2-2.5-5.2-5.3-5.2z" fill="currentColor" stroke="none"/>',20),lock:I('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',13),trophy:I('<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4.5c0 3 1.5 4 3.5 4M16 6h3.5c0 3-1.5 4-3.5 4M12 13v4M8.5 20h7"/>',15)};
const meter=(k,ic,lb,col)=>'<div class="pp-m" data-k="'+k+'"><span class="pp-mi" style="--c:'+col+'">'+ic+'</span><div class="pp-mb"><div class="pp-mt"><b>'+lb+'</b><em></em></div><div class="pp-bar"><i style="background:'+col+'"></i></div></div></div>';

/* ---------- tampilan panel ---------- */
const GAMEMETA=()=>window.PiwoGames?PiwoGames.meta:[];
function paneShop(){const lv=lvOf(pet.xp);
 return '<h4>Makanan<small>langsung dimakan Piwo · favorit = bonus 2x</small></h4><div class="pp-grid">'+FOODS.map(f=>'<button type="button" class="pp-it" data-food="'+f.id+'"><span class="e">'+f.e+'</span><b>'+f.n+'</b><i class="pp-pr">'+(f.p?IC.coin+f.p:'Gratis')+'</i>'+(f.id===pet.fav?'<u>favorit</u>':'')+'</button>').join('')+'</div>'+
 '<h4>Aksesori<small>naik level buat buka yang baru</small></h4><div class="pp-grid">'+ACCS.map(a=>{const on=pet.eq[a.slot]===a.id,own=pet.own.includes(a.id),lock=!own&&lv<a.lv;
  return '<button type="button" class="pp-it'+(on?' on':'')+(lock?' lock':'')+'" data-acc="'+a.id+'"><span class="e">'+a.e+'</span><b>'+a.n+'</b><i class="pp-pr">'+(on?'Dipakai':own?'Pakai':lock?IC.lock+'Lv '+a.lv:IC.coin+a.p)+'</i></button>'}).join('')+'</div>'}
function paneQuest(){dq();const t=day(),got=pet.claim===t,st=got?pet.streak:(pet.claim===day(-1)?pet.streak:0),cur=st%7===0&&st>0?7:st%7;
 let dots='';for(let i=1;i<=7;i++)dots+='<span class="'+(i<=cur?'on':'')+'">'+(i===7?'🎁':i)+'</span>';
 const done=QUESTS.filter(q=>pet.q.c[q.id]).length;
 return '<div class="pp-card"><div class="pp-ct"><div><b>Absen harian</b><small>'+(got?'Sudah diambil, besok lanjut ya!':'Ambil koin gratis. Hari ke-7 dapat bonus 🎁')+'</small></div><button type="button" class="pp-go" data-claim="1"'+(got?' disabled':'')+'>'+(got?'Selesai':'Ambil')+'</button></div><div class="pp-dots">'+dots+'</div></div>'+
 '<h4>Misi hari ini<small>'+done+'/'+QUESTS.length+' beres · reset tiap hari</small></h4>'+QUESTS.map(q=>{const p=Math.min(q.n,pet.q.p[q.id]||0),d=!!pet.q.c[q.id];return '<div class="pp-q'+(d?' done':'')+'"><div><b>'+E(q.t)+'</b><div class="pp-bar sm"><i style="width:'+(p/q.n*100)+'%;background:var(--md-sys-color-primary)"></i></div></div><span>'+(d?'✓':p+'/'+q.n)+'</span><em>'+IC.coin+q.r+'</em></div>'}).join('')}
function paneGame(){dq();const ms=GAMEMETA();
 return '<h4>Arcade Piwo<small>Rekor masuk papan skor kelas · hadiah koin '+GM.catch.rw+'x per game tiap hari</small></h4><div class="pp-gg">'+ms.map(g=>{const left=Math.max(0,GM[g.id].rw-(pet.gp.n[g.id]||0)),l=LB[g.id],best=pet.gp.best[g.id]||0;
  return '<button type="button" class="pp-gc" data-game="'+g.id+'"><span class="gi">'+g.e+'</span><b>'+E(g.n)+'</b><small>'+(best?'Rekor '+best:'Belum dimainkan')+(l&&l.rank?' · #'+l.rank:'')+'</small><i>'+(left?'Hadiah '+left+'x':'Latihan')+'</i></button>'}).join('')+'</div>'}
function render(full){if(!ui)return;const l=lvOf(pet.xp),a=xpAt(l),b=xpAt(l+1),s=status();
 ui.name.firstChild.nodeValue=pet.name;ui.lv.textContent='Lv '+l;ui.coins.lastChild.nodeValue=' '+pet.coins;ui.xp.style.width=clamp((pet.xp-a)/(b-a)*100,0,100)+'%';ui.xpt.textContent=Math.floor(pet.xp-a)+' / '+(b-a)+' XP ke Lv '+(l+1);
 ui.stE.textContent=s[0];ui.stT.textContent=s[1];ui.fav.textContent='Makanan favorit: '+((FOODS.find(f=>f.id===pet.fav)||{}).e||'?');
 [['hunger',pet.hunger],['happy',pet.happy],['energy',pet.energy]].forEach(([k,v])=>{const e=ui.ms[k];e.bar.style.width=v+'%';e.root.classList.toggle('low',v<25);e.num.textContent=Math.round(v)});
 const sl=Date.now()<sleepUntil||(m&&m.state==='sleep');ui.acts.forEach(b=>b.disabled=sl);
 if(full){ui.shop.innerHTML=paneShop();ui.quest.innerHTML=paneQuest();ui.game.innerHTML=paneGame()}
 ui.tabs.forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));ui.panes.forEach(p=>p.classList.toggle('on',p.dataset.pane===tab))}
const CSS=`
#piwo-pet{position:fixed;inset:0;z-index:1500;pointer-events:none;visibility:hidden;font-family:Inter,system-ui,sans-serif;--pp-card:26px 10px 26px 10px}
html[data-shape=squircle] #piwo-pet{--pp-card:22px}html[data-shape=pill] #piwo-pet{--pp-card:24px}
#piwo-pet.on{pointer-events:auto;visibility:visible}
#piwo-pet .pp-scrim{position:absolute;inset:0;background:rgba(0,12,6,.38);opacity:0;transition:opacity .3s}#piwo-pet.on .pp-scrim{opacity:1}
#piwo-pet .pp-sheet{position:absolute;left:0;right:0;bottom:0;max-width:540px;height:min(70vh,560px);margin:0 auto;padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));border-radius:36px 36px 0 0;display:flex;flex-direction:column;
 background:rgba(var(--glass-rgb,245,251,246),.96);color:var(--md-sys-color-on-surface);border:1px solid var(--md-sys-color-outline-variant);border-bottom:0;-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
 transform:translateY(105%);transition:transform .42s cubic-bezier(.22,1.2,.36,1);box-shadow:0 -14px 44px -16px rgba(0,0,0,.35)}
html[data-perf=lite] #piwo-pet .pp-sheet{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--md-sys-color-surface-container-high)}
#piwo-pet.on .pp-sheet{transform:none}
.pp-grab{width:40px;height:4px;border-radius:4px;background:var(--md-sys-color-outline-variant);margin:0 auto 10px;flex:none}
.pp-head{display:flex;align-items:center;gap:8px;flex:none}.pp-head>div:first-child{flex:1;min-width:0;display:flex;align-items:center;gap:8px}
.pp-name{font:800 21px/1.1 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.02em;background:none;border:0;color:inherit;padding:2px 0;cursor:pointer;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pp-name::after{content:'✎';font-size:12px;opacity:.5;margin-left:6px}
.pp-lv{padding:3px 10px;border-radius:99px;font-size:12px;font-weight:800;background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container)}
.pp-coins{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:99px;font-size:13px;font-weight:800;background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container)}
.pp-x{width:36px;height:36px;border-radius:50%;border:0;display:grid;place-items:center;background:var(--md-sys-color-surface-container-highest);color:inherit;cursor:pointer}
.pp-xpw{height:6px;border-radius:6px;background:var(--md-sys-color-surface-container-highest);overflow:hidden;margin:10px 0 3px;flex:none}
.pp-xpw i{display:block;height:100%;width:0;border-radius:6px;background:var(--md-sys-color-primary);transition:width .5s}
.pp-xpt{font-size:11px;font-weight:600;color:var(--md-sys-color-on-surface-variant);text-align:right;flex:none;margin-bottom:6px}
.pp-body{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:2px 2px 8px}
.pp-pane{display:none}.pp-pane.on{display:block;animation:ppIn .3s ease both}@keyframes ppIn{from{opacity:0;transform:translateY(8px)}}
.pp-nav{flex:none;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:5px;margin-top:6px;border-radius:99px;background:var(--md-sys-color-surface-container);border:1px solid var(--md-sys-color-outline-variant)}
.pp-nav button{border:0;background:none;color:var(--md-sys-color-on-surface-variant);display:flex;flex-direction:column;align-items:center;gap:2px;font:700 11px/1 Inter,sans-serif;padding:8px 0 7px;border-radius:99px;cursor:pointer;transition:background .25s,color .25s}
.pp-nav button.on{background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}
.pp-status{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--pp-card);background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container);font-weight:700;font-size:14px}
.pp-status .se{font-size:26px;line-height:1}
.pp-ms{display:grid;gap:10px;margin:12px 0}
.pp-m{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:20px;background:var(--md-sys-color-surface-container)}
.pp-mi{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;flex:none;color:#fff;background:var(--c)}
.pp-mb{flex:1;min-width:0}.pp-mt{display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px}.pp-mt b{font-weight:700}.pp-mt em{font-style:normal;font-weight:800;opacity:.7}
.pp-bar{height:8px;border-radius:8px;background:var(--md-sys-color-surface-container-highest);overflow:hidden}.pp-bar.sm{height:5px;margin-top:6px}
.pp-bar i{display:block;height:100%;width:0;border-radius:8px;transition:width .5s}
.pp-m.low .pp-bar i{background:#ef4444!important}.pp-m.low .pp-mi{background:#ef4444!important}
.pp-act{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.pp-act button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 0 10px;border-radius:22px 10px 22px 10px;border:0;cursor:pointer;font:700 12px/1.1 Inter,sans-serif;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);transition:transform .15s,opacity .2s}
.pp-act button span{font-size:25px;line-height:1}
.pp-act button:active,.pp-it:active,.pp-go:active,.pp-gc:active{transform:scale(.94)}.pp-act button:disabled{opacity:.4}
.pp-fav{font-size:12px;font-weight:600;color:var(--md-sys-color-on-surface-variant);margin:12px 0 0;text-align:center}
.pp-pane h4{margin:14px 0 8px;font:800 15px/1.2 'Bricolage Grotesque',Inter,sans-serif}.pp-pane h4:first-child{margin-top:2px}
.pp-pane h4 small,.pp-card small{display:block;font:600 11.5px/1.35 Inter,sans-serif;color:var(--md-sys-color-on-surface-variant);margin-top:3px}
.pp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pp-it{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:12px 4px 9px;border-radius:22px 10px 22px 10px;border:2px solid transparent;cursor:pointer;background:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);font:inherit;transition:transform .15s}
.pp-it .e{font-size:28px;line-height:1.1}.pp-it b{font-size:11.5px;font-weight:700;text-align:center}
.pp-pr{display:inline-flex;align-items:center;gap:3px;font-style:normal;font-size:11px;font-weight:800;padding:3px 8px;border-radius:99px;background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container)}
.pp-pr svg{width:12px;height:12px}
.pp-it u{position:absolute;top:-6px;right:-2px;text-decoration:none;font-size:9.5px;font-weight:800;background:#ef4444;color:#fff;border-radius:99px;padding:2px 7px}
.pp-it.on{border-color:var(--md-sys-color-primary);background:var(--md-sys-color-primary-container)}.pp-it.lock{opacity:.5}
.pp-card{padding:14px;border-radius:var(--pp-card);background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}
.pp-ct{display:flex;align-items:center;gap:12px}.pp-ct>div{flex:1}.pp-card b{font-size:14px;font-weight:800}
.pp-dots{display:flex;gap:5px;margin-top:12px}.pp-dots span{flex:1;text-align:center;font-size:11px;font-weight:800;padding:6px 0;border-radius:10px;background:rgba(0,0,0,.08);opacity:.65}.pp-dots span.on{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);opacity:1}
.pp-go{border:0;border-radius:99px;padding:11px 20px;font:800 13px/1 Inter,sans-serif;cursor:pointer;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transition:transform .15s}.pp-go:disabled{opacity:.45}
.pp-q{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;padding:10px 14px;border-radius:18px;margin-bottom:6px;background:var(--md-sys-color-surface-container)}
.pp-q b{font-size:12.5px;font-weight:700}.pp-q span{font-size:12px;font-weight:800;opacity:.7}
.pp-q em{display:inline-flex;align-items:center;gap:3px;font-style:normal;font-size:12px;font-weight:800;background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container);padding:3px 9px;border-radius:99px}.pp-q em svg{width:12px;height:12px}
.pp-q.done{opacity:.55}.pp-q.done b{text-decoration:line-through}
.pp-gg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pp-gc{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:14px;border-radius:var(--pp-card);border:0;cursor:pointer;text-align:left;background:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);font:inherit;transition:transform .15s}
.pp-gc .gi{width:46px;height:46px;display:grid;place-items:center;font-size:25px;margin-bottom:6px;background:var(--md-sys-color-primary-container);border-radius:38% 62% 55% 45%/48% 40% 60% 52%}
.pp-gc b{font:800 14px/1.2 'Bricolage Grotesque',Inter,sans-serif}.pp-gc small{font-size:11px;font-weight:600;color:var(--md-sys-color-on-surface-variant)}
.pp-gc i{font-style:normal;font-size:10.5px;font-weight:800;margin-top:6px;padding:3px 9px;border-radius:99px;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}
#pp-toast{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));z-index:1700;transform:translate(-50%,-160%);padding:11px 18px;border-radius:99px;max-width:88vw;font:700 13px/1.3 Inter,sans-serif;background:var(--md-sys-color-on-surface);color:var(--md-sys-color-surface);box-shadow:0 10px 28px rgba(0,0,0,.3);transition:transform .38s cubic-bezier(.22,1.2,.36,1);pointer-events:none;text-align:center}#pp-toast.on{transform:translate(-50%,0)}
#pp-acc-wrap{position:fixed;inset:0;z-index:61;pointer-events:none}
.pp-acc{position:absolute;left:0;top:0;line-height:1;pointer-events:none;will-change:transform;filter:drop-shadow(0 2px 2px rgba(0,0,0,.28))}
#pp-badge{position:fixed;left:0;top:0;z-index:62;width:36px;height:36px;border-radius:50%;border:1px solid var(--md-sys-color-outline-variant);display:grid;place-items:center;cursor:pointer;padding:0;
 background:rgba(var(--glass-rgb,245,251,246),.95);color:var(--md-sys-color-primary);box-shadow:0 6px 16px -6px rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .25s}
#pp-badge.show{opacity:1;pointer-events:auto}
#pp-badge.dot::after{content:'';position:absolute;top:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid var(--md-sys-color-surface)}
`;
function build(){
 const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 accWrap=document.createElement('div');accWrap.id='pp-acc-wrap';document.body.appendChild(accWrap);
 const root=document.createElement('div');root.id='piwo-pet';root.setAttribute('aria-hidden','true');
 root.innerHTML='<div class="pp-scrim"></div><section class="pp-sheet" role="dialog" aria-label="Peliharaan Piwo"><div class="pp-grab"></div>'+
 '<div class="pp-head"><div><button class="pp-name" type="button" aria-label="Ganti nama">Piwo</button><span class="pp-lv">Lv 1</span></div><span class="pp-coins">'+IC.coin+' 0</span><button class="pp-x" type="button" aria-label="Tutup">'+IC.x+'</button></div>'+
 '<div class="pp-xpw"><i></i></div><div class="pp-xpt"></div><div class="pp-body">'+
 '<div class="pp-pane" data-pane="rawat"><div class="pp-status"><span class="se"></span><span class="st"></span></div><div class="pp-ms">'+meter('hunger',IC.food,'Kenyang','#f59e0b')+meter('happy',IC.heart,'Senang','#ec4899')+meter('energy',IC.bolt,'Energi','#22a06b')+'</div>'+
 '<div class="pp-act"><button type="button" data-a="feed" aria-label="Kasih makan"><span>🍙</span>Makan</button><button type="button" data-a="play" aria-label="Ajak main"><span>🎾</span>Main</button><button type="button" data-a="nap" aria-label="Tidurkan"><span>🌙</span>Tidur</button><button type="button" data-a="rub" aria-label="Elus"><span>💕</span>Elus</button></div><p class="pp-fav"></p></div>'+
 '<div class="pp-pane" data-pane="toko"></div><div class="pp-pane" data-pane="misi"></div><div class="pp-pane" data-pane="game"></div></div>'+
 '<nav class="pp-nav"><button type="button" data-tab="rawat">'+IC.heart+'Rawat</button><button type="button" data-tab="toko">'+IC.bag+'Toko</button><button type="button" data-tab="misi">'+IC.list+'Misi</button><button type="button" data-tab="game">'+IC.pad+'Game</button></nav></section>';
 document.body.appendChild(root);
 const tt=document.createElement('div');tt.id='pp-toast';tt.setAttribute('role','status');document.body.appendChild(tt);
 const bd=document.createElement('button');bd.type='button';bd.id='pp-badge';bd.setAttribute('aria-label','Buka peliharaan Piwo');bd.innerHTML=IC.paw;document.body.appendChild(bd);
 const q=x=>root.querySelector(x),ms={};['hunger','happy','energy'].forEach(k=>{const r=q('[data-k='+k+']');ms[k]={root:r,bar:r.querySelector('.pp-bar i'),num:r.querySelector('em')}});
 ui={root,toast:tt,badge:bd,name:q('.pp-name'),lv:q('.pp-lv'),coins:q('.pp-coins'),xp:q('.pp-xpw i'),xpt:q('.pp-xpt'),stE:q('.se'),stT:q('.st'),fav:q('.pp-fav'),ms,acts:[...root.querySelectorAll('.pp-act button')],
  shop:q('[data-pane=toko]'),quest:q('[data-pane=misi]'),game:q('[data-pane=game]'),tabs:[...root.querySelectorAll('[data-tab]')],panes:[...root.querySelectorAll('[data-pane]')]};
 ui.name.addEventListener('click',rename);q('.pp-x').addEventListener('click',()=>close());q('.pp-scrim').addEventListener('click',()=>close());bd.addEventListener('click',()=>open());
 ui.tabs.forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;if(tab==='game')refreshLB();render(true)}));
 root.addEventListener('click',e=>{const t=e.target.closest('[data-a],[data-food],[data-acc],[data-claim],[data-game]');if(!t)return;
  if(t.dataset.a)ACT[t.dataset.a]();else if(t.dataset.food)ACT.feed(FOODS.find(f=>f.id===t.dataset.food));else if(t.dataset.acc)ACT.acc(t.dataset.acc);else if(t.dataset.claim)ACT.claim();else if(t.dataset.game)launch(t.dataset.game)});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!gameOn)close()});
 accSync();render(true)}
function refreshLB(){if(Date.now()-lbAt<60000)return;lbAt=Date.now();GIDS.forEach(g=>sb('piwo_score_top',{p_game:g,p_limit:1,p_device:DEV}).then(r=>{if(r){LB[g]=r;if(r.best>(pet.gp.best[g]||0)){pet.gp.best[g]=r.best}render(true)}}))}

/* ---------- buka / tutup panel ---------- */
async function open(t){if(!m||C.panelOpen||C.lock||C.at!=='home'||C.busy||gameOn)return;if(t)tab=t;C.panelOpen=true;C.at='pet';ui.root.classList.add('on');ui.root.setAttribute('aria-hidden','false');setZ(1510);hush();dq();if(tab==='game')refreshLB();render(true);
 m.sfx.init();await wait(60);if(calm)put(A.pet());else await fly(A.pet,{dur:620,h:.2});if(C.at==='pet')m.react('wave')}
async function close(quiet){if(!C.panelOpen)return;C.panelOpen=false;ui.root.classList.remove('on');ui.root.setAttribute('aria-hidden','true');
 if(C.at==='pet')C.at='home';if(quiet)return;if(calm)put(A.home());else await fly(A.home,{dur:650,h:.22});if(C.at==='home')setZ(60)}

/* ---------- game: logika hadiah di sini, tampilan & permainan di games.js ---------- */
function submit(id,score){dq();score=Math.max(0,Math.round(score));const g=GM[id],n=pet.gp.n[id]||0,rewarded=n<g.rw;pet.gp.n[id]=n+1;
 const coins=rewarded?Math.min(g.max,Math.floor(score/g.div)):0,xp=Math.min(30,Math.floor(score/4)+2),newBest=score>(pet.gp.best[id]||0);if(newBest)pet.gp.best[id]=score;
 if(coins){pet.coins+=coins;m&&m.sfx.coin()}gain(xp);pet.happy=cl(pet.happy+10);pet.energy=cl(pet.energy-5);qp('game');qp('game3');changed(true);
 const rank=sb('piwo_score_submit',{p_device:DEV,p_game:id,p_name:pet.name,p_score:score}).then(r=>{if(r){LB[id]=Object.assign(LB[id]||{},{best:r.best,rank:r.rank})}return r});
 return {coins,xp,rewarded,newBest,left:Math.max(0,g.rw-n-1),rank}}
async function launch(id){if(!m||gameOn||!window.PiwoGames)return;dq();gameOn=true;C.panelOpen=false;ui.root.classList.remove('on');C.at='game';m.sfx.init();hush();
 if(calm)put(A.game());else fly(A.game,{dur:520,h:.15});
 PiwoGames.start(id,{m,sfx:m.sfx,calm,name:()=>pet.name,
  info:g=>({best:pet.gp.best[g]||0,left:Math.max(0,GM[g].rw-(pet.gp.n[g]||0)),rw:GM[g].rw,max:GM[g].max}),
  top:g=>sb('piwo_score_top',{p_game:g,p_limit:5,p_device:DEV}).then(r=>{if(r)LB[g]=r;return r}),submit,
  done:async()=>{gameOn=false;tab='game';C.at='pet';C.panelOpen=true;ui.root.classList.add('on');ui.root.setAttribute('aria-hidden','false');render(true);await wait(60);if(calm)put(A.pet());else await fly(A.pet,{dur:560,h:.18})}})}

/* ---------- loop 20 dtk: status turun & Piwo mengeluh ---------- */
setInterval(()=>{if(!m)return;const n=Date.now();decay(n-pet.t,false);pet.t=n;saveLocal();dirty=true;render();
 if(n-lastWarn<120000||C.lock||C.busy||C.at!=='home'||m.state==='sleep'||document.hidden)return;
 const say=(f,t)=>{lastWarn=n;needT=n+9000;f&&f();m.say(t+' (tap di sini buat ngurus)',{mood:'sad'})};
 if(pet.hunger<25)say(()=>{m.sfx.growl();m.react('sad')},'Perutku bunyi… laper nih~');
 else if(pet.energy<20)say(()=>m.react('yawn'),'Hoaam… ngantuk…');
 else if(pet.happy<25)say(()=>m.react('sad'),'Main sama aku dong…')},20000);
setInterval(()=>{if(dirty)flush()},120000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){pet.t=Date.now();saveLocal();dirty=true;flush(true)}});
async function load(){
 let loc=null;try{loc=JSON.parse(localStorage.getItem(PK)||localStorage.getItem('piwo-pet-v2'))}catch(e){}
 const ok=o=>o&&typeof o.hunger=='number'&&typeof o.happy=='number'&&typeof o.energy=='number';
 if(ok(loc)){Object.assign(pet,loc);decay(Date.now()-(loc.t||Date.now()),true)}
 if(!pet.fav)pet.fav=FOODS[1+(Math.random()*(FOODS.length-1)|0)].id;
 pet.t=Date.now();dq();build();
 const r=await sb('piwo_pet_get',{p_device:DEV});
 if(r&&ok(r)){const srvT=Date.now()-(r.now-r.last_tick);
  if(!ok(loc)||(loc.t||0)<srvT-1000){const ex=r.extra&&typeof r.extra==='object'?r.extra:{};Object.assign(pet,ex,{name:r.name||pet.name,hunger:r.hunger,happy:r.happy,energy:r.energy,xp:Math.max(r.xp,pet.xp)});if(!pet.fav)pet.fav=FOODS[1].id;decay(Math.max(0,r.now-r.last_tick),true);pet.t=Date.now()}
  else if(r.xp>pet.xp)pet.xp=r.xp}
 dq();dirty=true;saveLocal();accSync();render(true);
 setTimeout(()=>{if(!m||C.lock||C.at!=='home'||document.hidden)return;
  if(!pet.tip){pet.tip=1;changed();m.say('Tap ikon 🐾 di dekatku atau tahan aku lama-lama, ada status, toko, misi & game~',{mood:'happy'})}
  else if(pet.hunger<25){needT=Date.now()+9000;m.sfx.growl();m.say('Aku laper… tap di sini buat kasih makan~',{mood:'sad'})}else if(pet.energy<20)m.say('Ngantuk banget hari ini…',{mood:'sad'})},6500)}
let lp=null;
addEventListener('pointerdown',e=>{if(!m||C.lock||C.panelOpen||gameOn||C.at!=='home'||e.button>0||!ui)return;if(!m.hit(e.clientX,e.clientY))return;
 lp={id:e.pointerId,x:e.clientX,y:e.clientY,tm:setTimeout(()=>{if(!lp)return;lp=null;m.down=null;m.rub=0;try{navigator.vibrate&&navigator.vibrate(14)}catch(_){}m.squish(1.3);m.sfx.bell();open()},520)}},true);
['pointermove','pointerup','pointercancel'].forEach(t=>addEventListener(t,e=>{if(!lp||e.pointerId!==lp.id)return;if(t!=='pointermove'||Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10){clearTimeout(lp.tm);lp=null}},true));
function mountEntries(){
 const chips=document.getElementById('xc-chips');
 if(chips&&!document.getElementById('pp-chip')){const b=document.createElement('button');b.type='button';b.id='pp-chip';b.className='xc-chip';b.textContent='🐾 Peliharaanku';
  b.addEventListener('click',e=>{e.stopPropagation();if(typeof window.closeChatbot==='function')window.closeChatbot();setTimeout(()=>open(),760)});chips.appendChild(b)}
 const lb=document.getElementById('toggle-sfx')&&document.getElementById('toggle-sfx').closest('label');
 if(lb&&!document.getElementById('pp-set')){const b=document.createElement('button');b.type='button';b.id='pp-set';b.className=lb.className.replace('cursor-pointer','')+' w-full text-left cursor-pointer';
  b.innerHTML='<div><div class="text-xs font-bold">Peliharaan Piwo</div><div class="text-[11px] text-m3-onSurfaceVariant">Status, toko aksesori, misi harian &amp; game</div></div><span style="font-size:22px">🐾</span>';
  b.addEventListener('click',()=>open());lb.parentNode.insertBefore(b,lb.nextSibling)}}
window.PiwoPet={open,close:()=>close(),quest:qp,page(p){dq();if(!pet.q.pg.includes(p)){pet.q.pg.push(p);qp('pages')}},petted(){const n=Date.now();if(n-lastPetXp<4000)return;lastPetXp=n;pet.happy=cl(pet.happy+5);gain(1);qp('rub');changed(true)}};
C.ready.then(mm=>{m=mm;if(!m)return;load();mountEntries();setTimeout(mountEntries,1500);m.on('pet',()=>PiwoPet.petted());m.bub.addEventListener('click',()=>{if(Date.now()<needT){needT=0;open()}})});
})();
