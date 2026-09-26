// Lot v2.9 : heure et temps ecoule sur la ligne du tag de l ecran de
// transition. Ce que la suite protege : l ancrage sur cur.t0, la troncature a
// la minute, l absence de seconde, le decoupage unique de l heure, et la
// frontiere de la v2.2, la ligne annonce et ne prescrit rien.
// Le fuseau est force avant le premier appel a Date : sous TZ=UTC un defaut de
// decoupage local ne se verrait pas.
process.env.TZ='Europe/Brussels';
if(Intl.DateTimeFormat().resolvedOptions().timeZone!=='Europe/Brussels')
  throw new Error('fuseau non force : la suite ne pourrait rien discriminer');

const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
/* Les elements interroges par la boucle de transition sont captes : #rt et #tl
   doivent recevoir leur texte de la boucle elle-meme, et non d un re-rendu.
   C est ce qui distingue « la ligne se rafraichit » de « la ligne est juste au
   moment ou l ecran est ecrit ». */
const cap={};
const live=id=>({get textContent(){return cap[id]||''},set textContent(v){cap[id]=v},
  classList:{add(){},remove(){}},value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
global.document={querySelector:s=>s==='#app'?appEl:(s==='#rt'||s==='#tl'?live(s.slice(1)):(s==='.lightbox'?null:other)),
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
/* L intervalle est capture au lieu d etre lance : la suite le fait avancer pas
   a pas, ce qui permet de dissocier « le temps passe » de « la boucle tourne ».
   Un compteur incremente confond les deux, l ancrage sur t0 non. */
let boucles=[];
global.setInterval=fn=>{ const h={fn:fn}; boucles.push(h); return h; };
global.clearInterval=h=>{ boucles=boucles.filter(x=>x!==h); };
/* setTimeout est neutralise comme dans les autres suites, sans quoi les
   celebrations de fin de seance se declencheraient. Le vrai est conserve pour
   une seule chose : laisser la chaine de promesses de endSession se resoudre,
   la section 5 lisant l entree d historique qu elle ecrit. */
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.vider=()=>new Promise(r=>vraiTimeout(r,0));
global.battre=n=>{ for(let i=0;i<(n||1);i++) boucles.slice().forEach(h=>h.fn()); };
global.SRC=raw;
/* Horloge figee et deplacable. La suite ne doit rien devoir a l heure de son
   lancement, et elle doit pouvoir avancer l horloge sans faire tourner la
   boucle : c est exactement le cas de la mise en veille du telephone. */
const VraieDate=Date;
let T0=0;
global.figer=iso=>{ T0=new VraieDate(iso).getTime();
  function D(){ return arguments.length?new VraieDate(...arguments):new VraieDate(T0); }
  D.prototype=VraieDate.prototype; D.now=()=>T0; D.UTC=VraieDate.UTC; D.parse=VraieDate.parse;
  global.Date=D; };
global.avancer=sec=>{ T0+=sec*1000; };
global.degeler=()=>{ global.Date=VraieDate; };

const S=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; };
 /* on joue le chemin reel de l application : rien n est ecrit a la main dans
    cur, sans quoi la suite fabriquerait son sujet */
 const jouer=()=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   const e=DB[st.id];
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else if(e.mode==='stretch'){ skipSet(); return true; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 /* la ligne telle qu elle est ecrite dans l ecran, sans le reste de la card */
 const LIGNE=/<span class="tline num" id="tl">([^<]*)<\\/span>/;
 const ligne=s=>{ const m=restHtml(s).match(LIGNE); return m?m[1]:null; };
 const FORME=/^\\d{2}h\\d{2} · \\d+ min$/;
 const minutes=t=>{ const m=t.match(/· (\\d+) min$/); if(!m) throw new Error('ligne illisible : '+t); return +m[1]; };
 const premierRepos=()=>{ const i=cur.steps.findIndex(s=>s.k==='rest'); if(i<0) throw new Error('aucune transition dans la seance'); return cur.steps[i]; };

 /* ---------- 1. la ligne est sur chaque transition, et nulle part ailleurs ---------- */
 figer('2026-09-06T18:42:30');
 await neuf(4);
 startSession();
 const reposList=cur.steps.filter(s=>s.k==='rest');
 if(reposList.length!==15) throw new Error('quinze transitions attendues a quatre series, '+reposList.length);
 reposList.forEach((s,i)=>{
   const t=ligne(s);
   if(t===null) throw new Error('transition '+i+' sans ligne temporelle');
   if(!FORME.test(t)) throw new Error('transition '+i+' : forme inattendue « '+t+' »');
   if(t.indexOf('18h42')!==0) throw new Error('transition '+i+' : heure attendue 18h42, ligne « '+t+' »');
 });
 /* aucun autre ecran ne la porte : elle appartient a la transition, qui annonce,
    et pas aux ecrans qui prescrivent ou qui chronometrent deja */
 const travail=cur.steps.filter(s=>s.k==='set');
 travail.forEach(s=>{ if(setHtml(s).indexOf('id="tl"')>=0) throw new Error('l ecran de serie ne doit pas porter la ligne'); });
 {
   const savW=state.warm; state.warm='complet';
   await neuf(3); state.warm='complet'; startSession();
   if(cur.phase!=='warm') throw new Error('echauffement attendu au lancement');
   renderWarm();
   if(html.indexOf('id="tl"')>=0) throw new Error('l echauffement ne doit pas porter la ligne');
   state.warm=savW;
 }
 await neuf(3); state.cardio=true; startSession();
 {
   const c=cur.steps.find(s=>s.k==='cardio');
   if(!c) throw new Error('module cardio attendu');
   if(cardioHtml(c).indexOf('id="tl"')>=0) throw new Error('le cardio ne doit pas porter la ligne');
 }
 console.log('presence OK : '+reposList.length+' transitions portent la ligne, ni serie, ni echauffement, ni cardio');

 /* ---------- 2. la ligne suit cur.t0, elle n est pas un compteur ---------- */
 figer('2026-09-06T18:00:00');
 await neuf(3);
 startSession();
 const r2=premierRepos();
 if(minutes(ligne(r2))!==0) throw new Error('au lancement la ligne doit annoncer 0 min');
 /* l horloge avance de dix minutes sans qu aucune boucle ne tourne : c est la
    mise en veille du telephone, ou setInterval est etrangle. Un compteur
    incremente afficherait encore 0. */
 avancer(600);
 if(minutes(ligne(r2))!==10) throw new Error('dix minutes ecoulees hors boucle doivent etre vues, ligne « '+ligne(r2)+' »');
 if(ligne(r2).indexOf('18h10')!==0) throw new Error('l heure doit suivre l horloge, ligne « '+ligne(r2)+' »');
 /* symetrique : la boucle tourne cinq fois sans que l horloge bouge. Le
    decompte descend, l ecoulé ne bouge pas. */
 cur.i=cur.steps.indexOf(r2);
 renderSession();
 /* un battement d amorce : la ligne du DOM n est ecrite que par la boucle, et
    comparer a « rien » ne mesurerait que le premier passage */
 battre(1);
 const avant=cap.tl;
 if(!avant) throw new Error('la boucle doit ecrire la ligne');
 battre(5);
 if(cap.tl!==avant) throw new Error('cinq battements sans horloge ne doivent rien changer a l ecoule');
 if(!cap.rt) throw new Error('le decompte doit etre ecrit par la boucle');
 /* et la boucle rafraichit bien la ligne quand l horloge, elle, avance */
 avancer(120); battre(1);
 if(minutes(cap.tl)!==12) throw new Error('la boucle doit rafraichir la ligne, ecoule lu '+cap.tl);
 console.log('ancrage OK : la ligne se recalcule depuis t0, pas depuis la boucle');

 /* ---------- 3. troncature, jamais arrondi ---------- */
 const cas=[[0,0],[1,0],[59,0],[60,1],[119,1],[770,12],[779,12],[780,13],[6199,103]];
 cas.forEach(([sec,att])=>{
   if(fmtEcoule(sec)!==att+' min') throw new Error(sec+' s doit donner '+att+' min, fmtEcoule rend '+fmtEcoule(sec));
 });
 if(fmtEcoule(-30)!=='0 min') throw new Error('une duree negative doit se lire 0 min');
 /* le nom ne doit pas retomber sur celui de la duree annoncee : fmtMin rend un
    tilde, et une seconde declaration du meme nom aurait ecrase la premiere sans
    bruit. Le defaut a existe, il rendait « ~0 min » sur l ecran de transition. */
 if(fmtEcoule===fmtMin) throw new Error('le formateur de l ecoule ne doit pas etre celui de la duree annoncee');
 if(fmtEcoule(600).indexOf('~')>=0) throw new Error('l ecoule est mesure, il ne porte pas le tilde de l annonce');
 if((SRC.match(/function fmtEcoule\\(/g)||[]).length!==1) throw new Error('fmtEcoule doit etre declaree une seule fois');
 /* sur le chemin reel, et pas seulement sur le formateur */
 figer('2026-09-06T19:00:00');
 await neuf(3); startSession();
 const r3=premierRepos();
 avancer(779);
 if(minutes(ligne(r3))!==12) throw new Error('12 min 59 s doit s afficher 12 min');
 avancer(1);
 if(minutes(ligne(r3))!==13) throw new Error('13 min 00 s doit s afficher 13 min');
 console.log('troncature OK : neuf durees, 12 min 59 s annonce 12');

 /* ---------- 4. un seul decoupage de l heure ---------- */
 const instants=['2026-01-01T00:00:00','2026-01-01T00:09:00','2026-06-21T13:05:00',
                 '2026-09-06T18:42:30','2026-12-31T23:59:59','2026-03-29T03:30:00'];
 instants.forEach(iso=>{
   const d=new Date(iso), p=n=>String(n).padStart(2,'0');
   const attendu=p(d.getHours())+'h'+p(d.getMinutes());
   if(fmtHM(iso)!==attendu) throw new Error(iso+' : fmtHM rend '+fmtHM(iso)+', attendu '+attendu);
   if(fmtDT(iso).indexOf(fmtHM(iso)+' ')!==0)
     throw new Error(iso+' : fmtDT doit commencer par fmtHM, sans quoi deux decoupages du meme instant divergent');
 });
 /* fmtHM sans argument lit l horloge, comme dayKey */
 figer('2026-09-06T07:05:00');
 if(fmtHM()!=='07h05') throw new Error('fmtHM() doit lire l horloge, rendu '+fmtHM());
 /* la source ne recoupe l heure nulle part ailleurs */
 {
   const n=(SRC.match(/getHours\\(\\)/g)||[]).length;
   if(n!==1) throw new Error('getHours ne doit apparaitre qu une fois, dans fmtHM ; trouve '+n);
 }
 console.log('decoupage OK : six instants, une seule lecture de getHours dans la source');

 /* ---------- 5. meme ancre que la duree reelle de l historique ---------- */
 figer('2026-09-06T17:30:00');
 await neuf(2);
 startSession();
 const dep=cur.t0;
 let garde=0, dernier=null;
 while(cur&&cur.i<cur.steps.length&&garde++<200){
   avancer(37);
   const st=cur.steps[cur.i];
   if(st&&st.k==='rest') dernier=ligne(st);
   if(!jouer()) break;
 }
 if(dernier===null) throw new Error('aucune transition traversee');
 const attendu5=Math.floor((Date.now()-dep)/1000);
 for(let k=0;k<5;k++) await vider();
 const ent=state.hist[state.hist.length-1];
 if(!ent) throw new Error('aucune entree d historique');
 if(ent.real==null) throw new Error('l entree doit porter une duree reelle');
 if(Math.abs(ent.real-attendu5)>1)
   throw new Error('la duree reelle doit deriver du meme t0 : historique '+ent.real+', ecoule '+attendu5);
 if(Math.floor(ent.real/60)<minutes(dernier))
   throw new Error('la ligne ne peut pas annoncer plus que la duree finalement enregistree');
 console.log('ancre OK : ligne et duree reelle derivent du meme t0, '+ent.real+' s enregistrees');

 /* ---------- 6. la frontiere de la v2.2 tient ---------- */
 figer('2026-09-06T18:42:00');
 await neuf(4);
 startSession();
 garde=0;
 while(cur&&cur.i<cur.steps.length-1&&garde++<200){
   const st=cur.steps[cur.i];
   if(st.k==='rest'){
     const t=ligne(st);
     if(t===null) throw new Error('transition sans ligne en cours de seance');
     if(!FORME.test(t)) throw new Error('forme inattendue en cours de seance : « '+t+' »');
     if(/\\d+:\\d\\d/.test(t)) throw new Error('aucune seconde ne doit figurer sur la ligne : « '+t+' »');
     if(t.indexOf('onclick')>=0) throw new Error('la ligne ne doit rien declencher');
     if(t.indexOf('~')>=0) throw new Error('le tilde appartient a la duree annoncee, pas a une mesure');
     /* Inventaire exhaustif plutot que chasse aux valeurs interdites : chercher
        la cible « 8 » dans « 18h42 » la trouve toujours et ne prouve rien. La
        ligne ne porte que trois nombres, et on dit lesquels. Aucune cible,
        aucune charge, aucun barreau, aucune duree annoncee ne peut s y glisser
        sans casser le compte. */
     const nb=t.match(/\\d+/g)||[];
     if(nb.length!==3) throw new Error('la ligne doit porter exactement trois nombres, l heure, la minute et l ecoule : « '+t+' »');
     const d=new Date();
     const p=n=>String(n).padStart(2,'0');
     if(nb[0]!==p(d.getHours())||nb[1]!==p(d.getMinutes()))
       throw new Error('les deux premiers nombres sont l heure de l horloge : « '+t+' »');
     if(+nb[2]!==Math.floor(sessionElapsed()/60))
       throw new Error('le troisieme nombre est l ecoule tronque : « '+t+' »');
   }
   avancer(11);
   if(!jouer()) break;
 }
 console.log('frontiere OK : ni seconde, ni cible, ni charge, ni barreau, ni annonce, ni action');

 /* ---------- 7. sans ancre, la ligne disparait et le tag reste centre ---------- */
 figer('2026-09-06T18:42:00');
 await neuf(3);
 startSession();
 const r7=premierRepos();
 if(restHtml(r7).indexOf('class="spread"')<0) throw new Error('avec ancre, le tag partage sa ligne');
 delete cur.t0;
 if(sessionTime()!=='') throw new Error('sans t0, sessionTime doit rendre une chaine vide');
 const nu=restHtml(r7);
 if(nu.indexOf('id="tl"')>=0) throw new Error('sans t0, la ligne ne doit pas etre ecrite');
 if(nu.indexOf('class="spread"')>=0) throw new Error('sans second occupant, le tag ne doit pas passer en spread : il serait chasse a gauche');
 if(nu.indexOf('<span class="tag">')<0) throw new Error('le tag doit subsister');
 degeler();
 console.log('degenerescence OK : sans t0, ni ligne ni spread, le tag reste centre');

 console.log('TESTS INDICATEURS TEMPORELS V2.9 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
