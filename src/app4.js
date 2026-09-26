/* ============ ETAT ============ */
const SKEY='palier-state-v2';
let state=null, storageOK=true;
/* Etat neuf (v2.0). L inventaire part vide et le drapeau d onboarding est pose
   ici, et ici seulement : migrateState ne le cree jamais, donc un import de
   sauvegarde n a pas d onboarding, ce qui est le comportement voulu. Une liste
   pre-remplie se survole, une liste vide se remplit, et le resultat colle a la
   realite de l utilisateur.
   Le profil domicile est declare des l etat neuf : sans lui, la chip de profil
   et la liste de bascule restent vides jusqu au premier enregistrement, c est-
   a-dire pendant tout l onboarding. */
function defaultState(){return {
  v:2, xp:0, goal:4, theme:'auto', rounds:3,
  trans:15, warm:'complet', cardio:true, stretch:true, loadUps:0,
  gear:JSON.parse(JSON.stringify(EMPTY_GEAR)), onboard:true, intro:true,
  profil:'domicile', profils:{domicile:{nom:'Domicile'}},
  slotIdx:{push:0,pull:0,legs:0,core:0}, stretchIdx:0, sessionCount:0, lightRun:0,
  div:{push:0,pull:0},
  hist:[], perf:{}, unlocked:{}, badges:[]
};}
const store={
  async get(k){
    if(typeof window!=='undefined'&&window.storage){ try{const r=await window.storage.get(k); if(r&&r.value!=null) return r.value;}catch(e){} }
    try{ const v=localStorage.getItem(k); if(v!=null) return v; }catch(e){}
    return null;
  },
  async set(k,v){
    let ok=false;
    if(typeof window!=='undefined'&&window.storage){ try{ await window.storage.set(k,v); ok=true; }catch(e){} }
    try{ localStorage.setItem(k,v); ok=true; }catch(e){}
    return ok;
  }
};
/* Migrations (v1.16). Elles vivaient dans loadState, donc elles ne jouaient que
   sur le localStorage : applyImport, qui construit l etat depuis un fichier,
   n en rejouait aucune. Une sauvegarde ancienne reimportee revenait donc avec
   ses valeurs d origine, sans que rien ne le dise. Elles sont ici, et les deux
   chemins d entree les appellent.
   Le parametre p est l objet brut lu, s l etat en construction : certaines
   migrations doivent distinguer « champ absent » de « champ a zero ». */
/* Migration v2.0. Deux gestes seulement, tous deux idempotents.
   Les ressources declarables apparaissent au complet : une sauvegarde
   anterieure vient forcement d un inventaire domicile ou tout etait suppose
   present, et rien ne permettrait de deviner une absence.
   Chaque niveau de bande declare recoit sa realisation par defaut, sa propre
   couleur, ce qui transforme la carte de presence en carte de realisation sans
   rien perdre. Un niveau absent le reste, sa realisation etant vide.
   Le profil domicile enveloppe l inventaire existant, sans le copier : il en
   devient le porteur nomme. */
function migrateV2(s){
  if(!s.gear) return;
  if(!s.gear.res) s.gear.res=JSON.parse(JSON.stringify(DEFAULT_GEAR.res));
  s.gear.bands=s.gear.bands||{};
  BANDS.forEach(b=>{ const v=s.gear.bands[b.id];
    if(v===1||v===true) s.gear.bands[b.id]=b.id;
    else if(!v) s.gear.bands[b.id]=''; });
  if(!s.profil) s.profil='domicile';
  if(!s.profils) s.profils={};
  if(!s.profils.domicile) s.profils.domicile={nom:'Domicile'};
  s.profils[s.profil]=s.profils[s.profil]||{nom:'Domicile'};
  s.profils[s.profil].gear=s.gear;
}
/* Second temps de la migration v2.0, pose apres migrateV2 dont il lit
   l inventaire deja etabli. Trois sondes de forme, toutes idempotentes, aucune
   ne cree le drapeau d onboarding.
   La marche basse est presente par defaut sur toute sauvegarde existante, meme
   doctrine que le reste des ressources : elles viennent d un domicile ou tout
   etait suppose la, et rien ne permettrait de deviner une absence. La sonde
   distingue le champ absent du champ a zero, sinon elle rallumerait a chaque
   lecture une marche basse volontairement decochee.
   Le sixieme niveau de bande n existait pas : il est absent, pas decoche.
   Une realisation hors nuancier ne peut venir que d une sauvegarde bricolee ou
   d un jeu de test, le nommage libre n ayant jamais ete deploye : on la ramene
   a une couleur, par sa cle, par son libelle, puis par la couleur d origine du
   niveau. Le niveau reste tenu dans tous les
   cas, seule sa teinte peut changer. */
function migrateV2b(s){
  if(!s.gear) return;
  s.gear.res=s.gear.res||{};
  if(s.gear.res.stepbas==null) s.gear.res.stepbas=1;
  s.gear.bands=s.gear.bands||{};
  BANDS.forEach(b=>{
    const v=s.gear.bands[b.id];
    if(v==null){ s.gear.bands[b.id]=''; return; }
    if(typeof v!=='string'){ s.gear.bands[b.id]=v?(coulOK(b.id)?b.id:'gris'):''; return; }
    if(!v||coulOK(v)) return;
    const t=v.trim().toLowerCase();
    const parLbl=PAL.filter(x=>x[1]===t)[0];
    s.gear.bands[b.id]=parLbl?parLbl[0]:(coulOK(b.id)?b.id:'gris');
  });
}
/* Migration v2.1, par sondes de forme comme toutes les autres. Les
   kettlebells deviennent une carte de poids possedes : une sauvegarde
   anterieure qui declarait la ressource possede la kettlebell de 10 kg, seule
   du carnet. Les elastiques et les lestes recoivent leur drapeau de presence,
   masque non destructif sur le modele de hal : il vaut 1 des lors que quelque
   chose est declare, sinon 0, ce qui est exactement l invariant que la card
   maintient ensuite. */
function migrateV21(s){
  if(!s.gear) return;
  /* Une sauvegarde ancienne sans table de ressources vient forcement d une
     epoque ou tout etait suppose present : la cible de migration est le
     domicile, comme partout ailleurs. La sonde porte sur l absence de la
     table, jamais sur un numero de version. */
  if(!s.gear.res) s.gear.res=JSON.parse(JSON.stringify(DEFAULT_GEAR.res));
  if(!s.gear.kbs) s.gear.kbs=s.gear.res.kb?{'10':1}:{};
  if(s.gear.res.elast==null) s.gear.res.elast=ownedBands(s.gear).length?1:0;
  if(s.gear.res.cuff==null) s.gear.res.cuff=CUFF_W.some(w=>(s.gear.cuffs||{})[w])?1:0;
}
function migrateState(s,p){
  p=p||s;
  if(!p.v||p.v<2){ s.perf={}; s.unlocked={}; s.v=2; s.slotIdx={push:0,pull:0,legs:0,core:0}; }
  if(!s.gear) s.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR));
  if(!s.slotIdx) s.slotIdx={push:0,pull:0,legs:0,core:0};
  /* v1.2 : capacite manchon, bandes, lestes, et remise a plat des fourchettes
     des exercices qui passent sur une echelle (leur fourchette ne monte plus) */
  if(!s.gear.maxPerEnd) s.gear.maxPerEnd=5;
  if(!s.gear.bands) s.gear.bands=JSON.parse(JSON.stringify(DEFAULT_GEAR.bands));
  if(!s.gear.cuffs) s.gear.cuffs=JSON.parse(JSON.stringify(DEFAULT_GEAR.cuffs));
  if(s.gear.plates&&s.gear.plates['1.25']==null) s.gear.plates['1.25']=0;
  migrateV21(s);
  if(s.profils) Object.keys(s.profils).forEach(k=>{ if(s.profils[k]&&s.profils[k].gear) migrateV21({gear:s.profils[k].gear}); });
  /* v1.4 : etirements de fin de seance, rotation, compteur d ecart */
  if(s.stretch==null) s.stretch=true;
  if(s.stretchIdx==null) s.stretchIdx=0;
  if(!s.div) s.div={push:0,pull:0};
  /* v1.13 : la duree choisie devient un nombre de series. La correspondance
     reprend exactement ce que l ancien calcul produisait sans cardio, donc
     personne ne voit son volume changer a la mise a jour. */
  if(p.rounds==null&&p.duration!=null) s.rounds={10:2,15:3,20:4}[p.duration]||3;
  if(ROUNDS_CHOICES.indexOf(s.rounds)<0) s.rounds=3;
  delete s.duration;
  if(s.lightRun==null) s.lightRun=0;
  /* v1.16 : app et version appartiennent a l enveloppe du fichier exporte, pas
     aux donnees. applyImport les faisait entrer dans l etat, ou elles ecrasaient
     ensuite la vraie version a chaque export, payload assignant state par-dessus.
     Un « version 1.0 » fossile survivait ainsi a quinze versions. */
  delete s.app; delete s.version;
  /* v1.18 : le mode cible est retire. Trois champs deviennent orphelins dans
     l etat, mode, cibleIdx et rest, ce dernier n ayant jamais servi qu au repos
     chronometre de ce mode. Meme traitement que le « version 1.0 » ci-dessus :
     on ne garde pas un reglage que plus rien ne lit. Les entrees d historique
     gardent en revanche leur mode, qui dit sous quel regime elles ont ete
     jouees et sert encore au libelle des anciennes. */
  delete s.mode; delete s.cibleIdx; delete s.rest;
  /* v1.17 : le plafond des deux tenues au sol descend de 60 a 45 s. La copie
     stockee dans perf ne se corrige pas seule, elle est ecrite une fois pour
     toutes a la creation de l exercice ; sans cette migration une planche deja
     jouee garderait une fourchette 20-60 que le catalogue ne connait plus, et
     une cible a 60 s que rien n aurait plus le droit de faire redescendre.
     Ecretage seulement : une fourchette deja conforme n est pas touchee, la
     migration est donc idempotente et sans effet sur un etat neuf.
     v2.5 : meme cas sur les mollets debout, dont le plafond descend de 30 a 25.
     Une progression deja engagee dans les relevements porte par exemple 13-26,
     au-dessus du nouveau haut : sans ecretage echelleOf ne retrouve plus la
     position courante dans l echelle et la carte affiche « pas encore de niveau
     enregistre » sur un exercice joue depuis des mois. Mesure avant correction,
     rejouee en test.
     C est aussi ce cas qui a montre qu ecreter le seul haut ne suffit pas. Un
     relevement fait monter les DEUX bornes ensemble, si bien qu une fourchette
     hors bornes a toujours un bas hors bornes lui aussi : 13-26 ecrete au seul
     haut donne 13-25, que l echelle ne reconnait pas davantage que 13-26
     puisqu elle n a qu une marche, 12-25. La fourchette revient donc entiere a
     sa base. Sans effet sur les deux planches, dont la base commence a 20 la ou
     l ancien ecretage les ramenait deja.
     v2.16 : la liste en dur disparait, l ecretage est derive. Le plafond de
     tout exercice au poids du corps ou tenu vaut desormais le haut de sa
     fourchette et le relevement n existe plus, donc toute fourchette stockee
     au-dessus de la base est un reste d un relevement fantome, sur les onze
     entrees qui en portaient encore un. Elle revient entiere a sa base et la
     cible est bornee. La memoire de fenetre n est pas touchee : un relevement
     n a jamais change le niveau physique de l exercice, meme poids du corps,
     meme geste, donc une lecture faite sous 7-13 est exactement comparable a
     une lecture sous 6-12. La remise a zero de la v2.14 visait un changement
     de palier reel ; il n y en a pas eu. Idempotente et sans effet sur une
     fourchette conforme. Mesure sur la sauvegarde du 12 septembre 2026 :
     aucune des onze n etait relevee, la migration y est un no-op. */
  /* v2.19 : le gainage lateral jambe levee passe des secondes aux repetitions
     cadencees. Il est debloque depuis le 15 septembre 2026, donc une
     performance a pu etre creee en secondes : fourchette 15-45, cible, series
     et memoire de fenetre dans une unite que l exercice n a plus. L ecretage
     qui suit ne suffirait pas, il bornerait une cible de 15 s a 15
     repetitions et garderait une memoire en secondes. La performance repart
     donc de zero, comme un exercice neuf, et perfOf la recree a la premiere
     lecture. Le temoin est la fourchette : celle d un exercice au poids du
     corps ne bouge plus depuis la v2.16, une fourchette differente de la base
     ne peut venir que du regime tenu. Les passages de ce regime restent a
     l historique, marques it.u = 's' : leurs series sont des secondes, et la
     fiche doit le dire. Le marqueur est une valeur ecrite, pas une deduction
     a la lecture, qui casserait le jour ou la base bougerait. Idempotente,
     sans effet sur un etat neuf ni sur un exercice non cadence. */
  /* v2.22 : portee nommee. Le pont fessier et sa lignee passent eux aussi en
     cadence, mais ils etaient deja en repetitions : une fourchette heritee y
     est un reste de relevement, que l ecretage qui suit ramene a la base.
     Sans la liste, elle aurait efface leur performance. */
  const exSecondes=id=>CAD_DEPUIS_SECONDES.indexOf(id)>=0;
  Object.keys(s.perf||{}).forEach(id=>{
    const e=DB[id], q=s.perf[id];
    if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;
    if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];
  });
  (s.hist||[]).forEach(h=>(h.items||[]).forEach(it=>{
    const e=it&&DB[it.id];
    if(!e||!e.cadence||!exSecondes(it.id)||!it.rng||it.u!=null) return;
    if(it.rng[0]!==e.reps[0]||it.rng[1]!==e.reps[1]) it.u='s';
  }));
  /* L instantane de correction de la derniere seance restaurerait une
     performance en secondes : la seance jouee sous l ancien regime ne se
     corrige plus. */
  if(s.undo&&s.undo.perf&&Object.keys(s.undo.perf).some(id=>{
    const e=DB[id], q=s.undo.perf[id];
    return e&&e.cadence&&exSecondes(id)&&q&&q.range&&(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]);
  })) delete s.undo;
  Object.keys(s.perf||{}).forEach(id=>{
    const e=DB[id], q=s.perf[id];
    if(!e||!q||!e.reps||e.bnd||!(e.mode==='bw'||e.mode==='time')) return;
    /* v2.17 : sur une echelle de tenues la base est celle du barreau, pas la
       premiere fourchette du catalogue, sinon la migration ramenait un 4-8
       joue a 6 s sur le 6-12 du barreau de depart. p.tenue absent vaut le
       premier barreau : la migration des deux exercices est un no-op. */
    const base=baseReps(e,q);
    if(q.range&&(q.range[0]!==base[0]||q.range[1]!==base[1])) q.range=base.slice();
    if(q.target!=null&&q.target>base[1]) q.target=base[1];
  });
  Object.keys(s.perf||{}).forEach(id=>{
    const e=DB[id], q=s.perf[id];
    if(!e||!q) return;
    if((e.bnd||e.mode==='fixed'||e.mode==='band')&&e.reps){
      q.range=e.reps.slice();
      if(q.target==null||q.target>e.reps[1]) q.target=e.reps[1];
      if(q.target<e.reps[0]) q.target=e.reps[0];
    }
    if(e.bnd&&!q.band){ const L=bandLadder(e,s.gear); q.band=(e.band0&&L.indexOf(e.band0)>=0)?e.band0:L[0]; }
    /* v2.12 : bandBest ne veut plus rien dire, la cle est retiree des etats
       herites. Rien ne la remplace a la migration : le barreau joue s ecrit au
       moment ou il est vrai, donc la preuve du verrou repart de la prochaine
       seance jouee sur l exercice source. Une valeur reconstituee ici vaudrait
       moins que son absence, meme motif qu it.rng en v2.4. */
    delete q.bandBest;
    /* v2.15 : la memoire de la fenetre de cible se seme depuis la derniere
       lecture enregistree. Ce n est pas une valeur reconstituee, p.sets est la
       lecture elle-meme, avec ses marqueurs de provenance : une lecture pure,
       comme la retroactivite des paliers en v2.4. Sans elle, chaque exercice
       revivait une fois le recul silencieux que la v2.14 supprime, sur
       plusieurs semaines de transition (releve d audit externe). Gardes : pas
       de lecture allegee ni non qualifiee ; pas de grace, qui dit que le
       dernier passage a fait monter le palier et que ses series sont a l
       ancien. La v2.15 portait une troisieme garde, sur le poids du corps et
       les tenues : pas de semis quand tout le passage etait au haut de
       fourchette moins un pas, parce qu un tel passage pouvait avoir releve
       la fourchette sans laisser de grace. Le relevement n existe plus
       (v2.16), un passage au plafond ne change plus de palier, et l ecretage
       ci-dessus a deja ramene toute fourchette relevee a sa base : la garde
       n a plus d objet et tombe. Idempotente : ne touche jamais une memoire
       deja posee, absente comprise apres un premier passage v2.14. */
    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)
      q.prevMin=Math.min.apply(null,q.sets);
  });
  /* v2.3 : sonde de forme sur le drapeau d onboarding. Elle ne le cree jamais,
     elle l abaisse quand rien ne le porte. Le drapeau n existe que dans l etat
     neuf, ou defaultState le pose a true, et les deux chemins d entree partent
     de la, Object.assign n ecrasant que les cles presentes dans la source. Sans
     cette sonde, un objet lu sans la cle repart avec le true de l etat neuf :
     c est ce qui faisait revenir le bandeau a chaque rechargement apres
     validation, et ce qui donnait un onboarding a toute sauvegarde anterieure a
     la v2.0. La sonde lit l objet brut et non l etat en construction, seul
     moyen de distinguer un champ absent d un champ deja abaisse. Une sauvegarde
     ecrite pendant l onboarding porte true et le garde, ce qui est voulu : son
     inventaire n a pas ete declare. */
  if(p.onboard==null) s.onboard=false;
  /* en dernier : la v2.0 lit un inventaire de bandes deja etabli par les
     migrations qui la precedent, elle ne peut donc pas s executer avant elles */
  migrateV2(s);
  migrateV2b(s);
  return s;
}
async function loadState(){
  let raw=null;
  try{ raw=await store.get(SKEY); }catch(e){}
  if(!raw){ try{ raw=await store.get('palier-state-v1'); }catch(e){} }
  let s=defaultState();
  if(raw){ try{
    const p=JSON.parse(raw);
    s=Object.assign(s,p);
    migrateState(s,p);
  }catch(e){} }
  state=s;
  /* l invariant « state.gear EST l inventaire du profil actif » doit tenir des
     l entree, sur les deux chemins : migrateV2 le pose pour une sauvegarde
     lue, syncProfil le pose pour un etat neuf, sans rien ecrire sur le disque */
  syncProfil();
  storageOK=await store.set(SKEY+'-ping','1');
}
async function save(){
  /* Version qui a ecrit cette sauvegarde (v1.16). Ecrite au save et non a
     l export, pour que le localStorage la porte aussi : les migrations futures
     se lisent alors sur un numero au lieu de se deviner a la forme des donnees.
     Limite assumee, elle ne renseigne que les sauvegardes posterieures a son
     introduction, les sondes de forme restent necessaires pour les anciennes. */
  syncProfil();
  state.appVersion=VERSION;
  const ok=await store.set(SKEY,JSON.stringify(state));
  if(!ok&&storageOK){ storageOK=false; flash('Sauvegarde indisponible : données en mémoire seulement'); }
  /* v2.24 : marque l etat comme modifie et programme l envoi ; inerte sans cle */
  if(typeof syncTouch==='function') syncTouch();
}
function applyTheme(){
  const pref=(state&&state.theme)||'auto';
  const dark=pref==='dark'||(pref==='auto'&&typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
}

/* ============ OUTILS ============ */
const $=s=>document.querySelector(s);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function flash(msg,ms){
  const f=$('#flash'); if(!f) return;
  f.textContent=msg; f.classList.add('show');
  clearTimeout(f._t); f._t=setTimeout(()=>f.classList.remove('show'),ms||2800);
}
/* interrupteur global des sons (v1.6) : la porte est ici, dans l unique
   fonction d emission, donc elle coupe tout d un coup : echauffement, repos,
   cible, decompte de preparation, phases et fin du cardio, celebration */
function sndOn(){ return !state||state.sound!==false; }
function prepSec(){ const v=state&&state.prep; return v==null?5:v; }
/* repere des tenues chronometrees (v2.20) : un clic discret toutes les
   REPERE.pas secondes pendant planche et gainage lateral, pour savoir ou l on
   en est sans voir l ecran. Actif par defaut, comme les sons : la cle absente
   vaut vrai. Le pas vaut celui des tenues, et les cibles de tenue etant des
   multiples de 5, le dernier repere tombe sur le debut de l approche. Repere
   pur, il ne mesure rien : la mesure reste le Stop et le rognage. */
const REPERE={pas:5,freq:1800,gain:.12,dur:.04};
function repereOn(){ return !state||state.repere!==false; }
function beep(freq,dur){
  if(!sndOn()) return;
  try{
    const ctx=beep.ctx||(beep.ctx=new (window.AudioContext||window.webkitAudioContext)());
    const d=dur||.2;
    [0,.26].forEach(off=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=freq||950; o.connect(g); g.connect(ctx.destination);
      const t=ctx.currentTime+off;
      g.gain.setValueAtTime(.001,t);
      g.gain.exponentialRampToValueAtTime(.5,t+.02);
      g.gain.exponentialRampToValueAtTime(.001,t+d);
      o.start(t); o.stop(t+d+.02);
    });
  }catch(e){}
  try{ if(navigator.vibrate) navigator.vibrate([90,70,90]); }catch(e){}
}
/* Emetteur simple-coup (v2.17), pour le metronome des tenues rythmees. beep()
   joue chaque ton deux fois a 260 ms d ecart : sur une tenue de 3 s le second
   coup tombe au dixieme de la tenue et brouille l ouverture. Ici un coup par
   evenement, ordonnance a un instant precis de l horloge audio et non « tout
   de suite », ce qui permet de programmer les bips en avance et de ne pas
   dependre du moment ou le timer JS se reveille. Meme porte sonore que beep,
   meme contexte, pas de vibration : le motif [90,70,90] dure 250 ms, meme
   defaut que le double coup. Retourne le contexte pour que l appelant lise
   l horloge ; null quand le son est coupe ou indisponible. Gain optionnel
   (v2.20), 0,45 par defaut comme les autres sons : le repere des tenues joue
   plus bas. */
function audioCtx(){
  try{ return beep.ctx||(beep.ctx=new (window.AudioContext||window.webkitAudioContext)()); }catch(e){ return null; }
}
function tone(freq,at,dur,gain){
  if(!sndOn()) return;
  const ctx=audioCtx(); if(!ctx) return;
  try{
    if(ctx.state==='suspended'&&ctx.resume) ctx.resume();
    const d=dur||.12, t=Math.max(at||0,ctx.currentTime+.001);
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.frequency.value=freq||950; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain||.45,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.start(t); o.stop(t+d+.02);
    tone.live=(tone.live||[]).filter(x=>x.t>ctx.currentTime-1);
    tone.live.push({o:o,t:t});
  }catch(e){}
}
/* Annule les coups deja programmes et non encore joues : au Stop, rien ne doit
   sonner apres le geste. */
function toneCancel(){
  const ctx=beep.ctx, L=tone.live||[]; tone.live=[];
  if(!ctx) return;
  L.forEach(x=>{ if(x.t>ctx.currentTime-.01){ try{ x.o.stop(ctx.currentTime); }catch(e){} } });
}
function fmtT(s){return Math.floor(s/60)+':'+String(Math.max(0,s%60)).padStart(2,'0');}
/* duree lisible : secondes sous la minute, minutes au dixieme au-dela, la
   decimale disparaissant quand elle vaut zero. Le dixieme n est pas un luxe :
   sans lui, les postes de la decomposition ne retombent pas sur leur total. */
function fmtDur(sec){
  if(sec<60) return Math.round(sec)+' s';
  const m=Math.round(sec/6)/10;
  return String(m).replace('.',',')+' min';
}
/* Liste de series, formatee au meme endroit pour tout le monde (v1.16). Six
   points d affichage la produisaient a la main, dont quatre avec des espaces
   autour du slash et deux sans : l application etait deja incoherente avec
   elle-meme. Le separateur est attenue et porte une micro-marge, ce qui separe
   les nombres par le contraste au lieu de la distance et rend six caracteres
   sur une liste de quatre valeurs. */
function setsHtml(a){ return (a||[]).join('<i class="sl">/</i>'); }
/* Cle de jour et cle de mois, dans le fuseau de l appareil (v2.6). Elles
   etaient decoupees par toISOString().slice(), qui rend une date UTC : entre
   minuit et deux heures du matin a Bruxelles, le fichier telecharge portait la
   veille pendant que la card annoncait le jour meme, et une seance de nuit se
   serait comptee la veille alors que la semaine ISO qui la contient, elle, se
   calcule deja sur les getters locaux. Deux decoupages du meme instant sur la
   meme ligne finissent par diverger, c est la lecon du plafond de liste.
   Un instant se stocke en UTC, un jour civil se lit sur l horloge de celui qui
   regarde : le decoupage est desormais fait au meme endroit pour tout le monde. */
function dayKey(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());}
function monthKey(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1);}
/* Ecart en jours civils, et non en tranches de 24 h : un export fait hier a
   20 h se lisait « aujourd hui » ce matin a 8 h, juste au-dessus d une ligne
   qui affichait la veille. Le passage par Date.UTC des composantes locales
   neutralise les changements d heure, ou une journee ne fait pas 24 h. */
function dayGap(iso){
  const a=new Date(iso), b=new Date();
  return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())
                    -Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);
}
/* Heure de l horloge locale (v2.9). Un seul endroit decoupe l heure d un
   instant, comme dayKey decoupe son jour : fmtDT la lisait a la main, et deux
   decoupages du meme instant sur la meme ligne finissent par diverger. */
function fmtHM(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return p(d.getHours())+'h'+p(d.getMinutes());}
/* Duree ecoulee en minutes entieres (v2.9). Tronquee et jamais arrondie : a
   12 min 50 s l ecran annonce 12, sans quoi l indicateur revendiquerait du temps
   qui n a pas ete passe. La seconde est volontairement absente : l ecran de
   transition porte deja un decompte a la seconde, et deux nombres qui defilent a
   la meme cadence, l un vers le haut l autre vers le bas, ne se distinguent
   plus.
   Le nom fmtMin etait deja pris, dans app5.js, par la duree ANNONCEE au tilde.
   Deux declarations du meme nom ne cohabitent pas, la derniere assemblee gagne,
   et le rendu portait « ~0 min » : l ecoule affichait la duree annoncee. Le
   formateur porte donc le nom de sa grandeur et non celui de son unite. */
function fmtEcoule(sec){return Math.max(0,Math.floor(sec/60))+' min';}
function fmtDT(iso){const d=new Date(iso),p=n=>String(n).padStart(2,'0');return fmtHM(iso)+' '+p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(2);}
function isoWeek(d){
  const dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=dt.getUTCDay()||7; dt.setUTCDate(dt.getUTCDate()+4-day);
  const y=dt.getUTCFullYear();
  return y+'-S'+String(Math.ceil((((dt-Date.UTC(y,0,1))/864e5)+1)/7)).padStart(2,'0');
}
/* jours actifs par semaine : plusieurs seances le meme jour comptent pour un */
function weekCounts(st){
  const m={};
  st.hist.forEach(h=>{const k=isoWeek(new Date(h.date));(m[k]=m[k]||{})[dayKey(h.date)]=1;});
  const o={}; Object.keys(m).forEach(k=>o[k]=Object.keys(m[k]).length);
  return o;
}
function prevWeekKey(o){const d=new Date();d.setDate(d.getDate()-7*o);return isoWeek(d);}
/* date de la premiere seance de chaque semaine, en ISO */
function weekFirsts(st){
  const m={};
  st.hist.forEach(h=>{ const k=isoWeek(new Date(h.date)); if(!m[k]||h.date<m[k]) m[k]=h.date; });
  return m;
}
/* Objectif applicable a une semaine donnee.
   Une semaine dont la premiere seance suit une semaine entierement vide est une
   semaine tronquee (demarrage ou reprise) : on n a pas eu sept jours pour tenir
   le rythme, l objectif est mis au prorata des jours reellement disponibles,
   arrondi au superieur, jamais au-dessus de l objectif nominal ni sous 1.
   Le calcul se fige sur la premiere seance de la semaine : tant qu aucune seance
   n a eu lieu, l objectif nominal reste affiche, sinon attendre ferait baisser
   la barre tout seul. */
function goalForWeek(st,key){
  const g=st.goal, m=weekFirsts(st), f=m[key];
  if(!f) return g;
  const d=new Date(f);
  const prev=isoWeek(new Date(d.getTime()-7*864e5));
  if(m[prev]) return g;
  const rem=8-(d.getDay()||7);
  return Math.max(1,Math.min(g,Math.ceil(g*rem/7)));
}
function weekStreak(st){
  const m=weekCounts(st); let s=0,i=1;
  const ok=k=>(m[k]||0)>=goalForWeek(st,k);
  if(ok(prevWeekKey(0))) s=1;
  while(ok(prevWeekKey(i))){s++;i++;}
  return s;
}
function thisWeekCount(st){return weekCounts(st)[prevWeekKey(0)]||0;}

/* ============ PROGRESSION ============ */
function perfOf(id){
  const e=DB[id];
  if(!state.perf[id]) state.perf[id]={load:e.load0||0,range:e.reps?e.reps.slice():null,target:e.reps?e.reps[0]:0,best:0,sets:[],date:null};
  const p=state.perf[id];
  if(!p.range&&e.reps) p.range=e.reps.slice();
  if(p.target==null&&p.range) p.target=p.range[0];
  if(e.bnd&&!p.band){ const L=bandLadder(e,state.gear); p.band=(e.band0&&L.indexOf(e.band0)>=0)?e.band0:L[0]; }
  return p;
}
/* Fourchette courante d un exercice : celle de la performance, qui bouge avec
   le cliquet, et non celle du catalogue qui est seulement son plancher. */
function rangeOf(p,e){ return (p&&p.range)||(e&&e.reps)||[0,0]; }
/* Echelle de tenues (v2.17). Un barreau est [tenue, bas, haut] par cote ; la
   position vaut p.tenue, absente au premier barreau : c est ce qui rend la
   migration neutre, aucune ecriture n est necessaire pour etre au depart.
   Une tenue stockee qui n est pas sur l echelle retombe au premier barreau,
   comme une bande inconnue retombe au bas de la sienne. */
/* v2.18 : l echelle de consigne se generalise a la hauteur d assise. Meme
   forme, [valeur, bas, haut], meme regle de position absente au premier
   barreau ; seule la cle stockee change, p.tenue ou p.assise, pour qu aucun
   etat existant ne soit relu autrement. Le metronome reste propre aux tenues :
   tout ce qui chronometre continue de tester e.rhythm. Sur l assise, monter
   d un barreau veut dire DESCENDRE la chaise : le sens se lit sur l indice,
   jamais sur la valeur. */
function rungSpec(e){
  if(e&&e.rhythm&&e.rhythm.ladder) return {k:'tenue',L:e.rhythm.ladder};
  if(e&&e.assise&&e.assise.ladder) return {k:'assise',L:e.assise.ladder};
  return null;
}
function rungVal(e,p){ const s=rungSpec(e); return (s&&p)?p[s.k]:undefined; }
function rungOf(e,v){
  const s=rungSpec(e), L=s&&s.L; if(!L||!L.length) return null;
  let i=0;
  if(v!=null) L.forEach((r,k)=>{ if(r[0]===v) i=k; });
  return {i:i,v:L[i][0],tenue:L[i][0],reps:[L[i][1],L[i][2]],n:L.length,k:s.k};
}
/* Etiquette d un barreau : « 6 s » sur une tenue, « assise 50 cm » sur une
   chaise. */
function rungLbl(e,v){ const s=rungSpec(e); if(!s||v==null) return ''; return s.k==='assise'?'assise '+v+' cm':v+' s'; }
function tenueOf(id,p){ const e=DB[id]; if(!e||!e.rhythm) return null; const r=rungOf(e,p&&p.tenue); return r?r.tenue:null; }
function assiseOf(id,p){ const e=DB[id]; if(!e||!e.assise) return null; const r=rungOf(e,p&&p.assise); return r?r.v:null; }
/* Fourchette de base d un exercice : celle du barreau sur une echelle de
   tenues, celle du catalogue partout ailleurs. */
function baseReps(e,p){ const r=rungOf(e,rungVal(e,p)); return r?r.reps:(e&&e.reps?e.reps:null); }
/* Palier exige par un verrou, et palier sous lequel le dernier passage de
   l exercice source a ete joue (v2.18). Trois portes :
   - loadTop (v2.5) : dernier barreau de l echelle filtree par l inventaire ;
   - kbTop : la kettlebell la plus lourde declaree, seule, sans lestes. Le
     goblet squat ouvre ainsi le squat sur une jambe a 16 kg chez Gabriel et
     non a 22 : les trois barreaux a lestes au-dessus valent chacun environ
     2 % de la charge sur les cuisses ;
   - rungTop : dernier barreau d une echelle de consigne, l assise la plus
     basse.
   Le palier joue se lit sur p.setsLoad ou p.setsRung, ecrits avec les
   series. Absents, sur une performance anterieure au champ, la porte reste
   fermee et la preuve repart du prochain passage, comme la porte de bande en
   v2.12 : un verrou ne s ouvre pas sur une supposition. */
function gatePalier(e){
  const lk=e&&e.lock; if(!lk) return null;
  const src=DB[lk.after], p=state.perf[lk.after]||{};
  if(lk.loadTop||lk.kbTop){
    const L=(src&&src.mode==='fixed')?fixedLadder(lk.after,state.gear):[];
    let x=null;
    if(lk.loadTop) x=L.length?L[L.length-1]:null;
    else { const kb=kbOwned(state.gear); if(kb.length){ const k=kb[kb.length-1]; x=L.find(r=>Math.abs(r.v-k)<0.001)||null; } }
    const j=p.setsLoad;
    return {ok:!!x&&j!=null&&j>=x.v-0.001,exige:x?x.lbl:null,joue:j!=null?loadLabelFor(lk.after,j):null};
  }
  if(lk.rungTop){
    const s=rungSpec(src), top=(s&&s.L.length)?s.L[s.L.length-1][0]:null, j=p.setsRung;
    return {ok:top!=null&&j===top,exige:top!=null?rungLbl(src,top):null,joue:j!=null?rungLbl(src,j):null};
  }
  return null;
}
function isLocked(id){const e=DB[id];return !!(e&&e.lock&&!state.unlocked[id]);}
/* Un barreau depasse quitte son vivier au deblocage de son successeur (v1.15).
   Le mecanisme est explicite, un champ sur l exercice qui remplace, comme
   lock.after et next : pas de moteur generique. Motif : chaque exercice ajoute
   a un vivier reduit la frequence des autres, et l escalier de progression
   ajoutait sans jamais retirer, jusqu a quatre variantes du meme mouvement
   vertical dans le vivier tire. Le retrait ne touche ni l historique, ni la
   fiche, ni la progression de l exercice retire : il ne sort que du tirage. */
/* Un exercice de repli ne sort jamais au tirage : il n apparait qu en cas de
   douleur ou de seance allegee. La bibliotheque les affichait comme les
   autres, avec le meme « a faire », alors qu ils ne viendront jamais d
   eux-memes. Le lien existait dans un sens, la fiche d origine nomme son
   repli ; il manquait en sens inverse. */
function replieDe(id){
  return Object.keys(DB).filter(x=>DB[x].fb===id&&x!==id);
}
/* Lien inverse de la table de substitution, pour la bibliotheque et la fiche.
   La v1.16 avait donne ce sens inverse aux replis douleur, qui apparaissaient
   comme des exercices ordinaires alors qu ils ne viennent jamais d eux-memes.
   Les substituts materiels ont le meme besoin, avec un motif different a
   nommer : ils remplacent une position quand le materiel manque. */
/* Un exercice est servi quand toutes ses ressources sont declarees. */
/* PROFILS (v2.0). Deux a trois profils nommes, dont le domicile qui ne se
   supprime pas. La bascule est manuelle et ne s eteint jamais toute seule :
   une expiration automatique se declencherait toujours au mauvais moment, et
   l outil n a aucun moyen de savoir qu on est rentre.
   Invariant : state.gear EST l inventaire du profil actif, unique poignee de
   lecture et d ecriture pour tout le reste du code. state.profils ne conserve
   que le nom et l inventaire des profils inactifs ; celui du profil actif y est
   rafraichi a chaque enregistrement, pour qu une sauvegarde exportee ne porte
   jamais deux versions divergentes du meme inventaire. */
const PROFIL_MAX=3;
function profilId(){ return state.profil||'domicile'; }
function profilNom(id){ const p=(state.profils||{})[id||profilId()]; return p?p.nom:'Domicile'; }
function horsDomicile(){ return profilId()!=='domicile'; }
function syncProfil(){
  if(!state.profils) state.profils={};
  if(!state.profils[profilId()]) state.profils[profilId()]={nom:'Domicile'};
  state.profils[profilId()].gear=state.gear;
}
function switchProfil(id){
  if(!state.profils||!state.profils[id]||id===profilId()) return;
  syncProfil();
  state.profil=id;
  state.gear=JSON.parse(JSON.stringify(state.profils[id].gear||DEFAULT_GEAR));
  save(); render();
}
/* Un profil neuf part VIDE (v2.1), et la copie devient un geste explicite.
   La justification d origine, « il est plus court d en decocher que de tout
   cocher », n est vraie que si le profil de destination ressemble au domicile.
   Mesure sur l inventaire reel : pour declarer « rien du tout », 22 gestes
   depuis une copie contre 0 depuis vide ; pour « un elastique vert plus un
   ancrage », 19 contre 4 ; la copie ne l emporte que sur un profil riche,
   9 contre 13. Et l argument de justesse est deja au carnet, pose pour le
   premier lancement : une liste vide se remplit, une liste pre-remplie se
   survole, un inventaire pre-rempli au materiel d ailleurs se valide sans
   etre lu. La copie reste offerte pour le cas ou elle gagne. */
function addProfil(nom,src){
  if(Object.keys(state.profils||{}).length>=PROFIL_MAX){ flash('Trois profils au maximum'); return; }
  const n=(nom||'').trim(); if(!n) return;
  let id='p'+Date.now().toString(36);
  syncProfil();
  const base=(src&&state.profils[src])?state.profils[src].gear:EMPTY_GEAR;
  state.profils[id]={nom:n,gear:JSON.parse(JSON.stringify(base))};
  state.profil=id;
  state.gear=JSON.parse(JSON.stringify(state.profils[id].gear));
  save(); render();
}
function renameProfil(id,nom){
  const n=(nom||'').trim();
  if(!n||!state.profils||!state.profils[id]) return;
  state.profils[id].nom=n; save(); render();
}
/* La confirmation vit dans l interface en v2.0, en deux temps, et non
   dans un dialogue systeme : cette fonction ne s appelle qu une fois la
   decision prise. */
function delProfil(id){
  if(id==='domicile'||!state.profils||!state.profils[id]) return;
  delete state.profils[id];
  if(profilId()===id){ state.profil='domicile'; state.gear=JSON.parse(JSON.stringify(state.profils.domicile.gear||DEFAULT_GEAR)); }
  save(); render();
}
/* Qualification materielle d une lecture. Une performance n est pas qualifiee
   quand le materiel declare n a pas permis de servir le niveau canonique, donc
   quand la prescription a ete bornee. Ce n est PAS une propriete du profil :
   loin de chez soi, un exercice dont le barreau est disponible se joue et
   compte normalement, et un exercice substitue progresse pour son propre
   compte, avec sa propre echelle. Seul le meme exercice joue plus bas que son
   niveau canonique produit une lecture incomparable. */
function nonQualifie(id){
  const g=gearPerf(id);
  return !!g.gearCut;
}
function servi(id,gear){
  return (NEEDS[id]||[]).every(k=>aRes(k,gear));
}
/* Variante de repli REALISABLE ici (v2.0). Le chemin des replis date de la
   v1.8, il est anterieur au resolveur et ne consultait pas l inventaire : trois
   couples etaient deja dans ce cas avant la marche basse, les elevations laterales repliant
   sur le tirage doux, le rowing kettlebell et le tirage en suspension repliant
   sur le rowing elastique. Sans elastique, le geste de protection proposait un
   exercice impossible. La marche basse en aurait ajoute un quatrieme.
   Meme doctrine que le resolveur : une chaine epuisee ne fabrique pas un
   equivalent, elle laisse la perte visible. Ici la perte est le bouton lui-meme,
   qui n apparait pas ; « Passer » reste la sortie.
   La fiche, elle, continue de nommer le repli : elle decrit l exercice et non
   la seance. */
function fbOf(id,gear){
  const f=DB[id]&&DB[id].fb;
  if(!f||!DB[f]) return null;
  return servi(f,gear||state.gear)?f:null;
}
/* Resolution d une position (v2.0). L intention d une position est un schema
   moteur, pas un exercice : quand le materiel manque, la position descend sa
   chaine jusqu au premier substitut servi. La chaine est ordonnee du plus
   proche de l intention au plus degrade, et une chaine epuisee laisse la
   position non resolue plutot que d inventer un equivalent qui n en est pas
   un. Sans etat : la resolution se recalcule a chaque tirage, donc rendre un
   materiel releve la position toute seule, sans migration ni verrou. */
function resolvePos(slot,i,gear){
  const ref=SLOTS[slot].pool[i];
  if(!ref) return null;
  if(servi(ref,gear)) return ref;
  const ch=(SUBS[slot]||{})[i]||[];
  for(const x of ch) if(servi(x,gear)) return x;
  return null;
}
/* positions tirables : ni verrouillees, ni retirees, ni non resolues */
function posTirables(slot,gear){
  const out=[];
  SLOTS[slot].pool.forEach((id,i)=>{
    if(isLocked(id)||estRetire(id)) return;
    if(resolvePos(slot,i,gear)) out.push(i);
  });
  return out;
}
/* schemas non servis, pour le bandeau et l editeur d inventaire */
function posPerdues(gear){
  const out=[];
  SLOT_ORDER.forEach(s=>SLOTS[s].pool.forEach((id,i)=>{
    if(isLocked(id)||estRetire(id)) return;
    if(!resolvePos(s,i,gear)) out.push({slot:s,i:i,ref:id});
  }));
  return out;
}
/* libelles des schemas non servis, dedoublonnes : deux positions du meme
   schema ne se comptent qu une fois, sinon le bandeau annoncerait deux pertes
   la ou l utilisateur n en ressent qu une */
function schemasPerdus(gear){
  const out=[];
  posPerdues(gear).forEach(x=>{
    const n=(SCHEMA[x.slot]||[])[x.i]||DB[x.ref].nom;
    if(out.indexOf(n)<0) out.push(n);
  });
  return out;
}
/* Progressions disponibles dans ce profil (v2.0).
   Denominateur : les exercices tirables dont l echelle depend de l inventaire,
   modes charge et fixe, plus tout exercice a bande. Les exercices en
   repetitions pures en sont dehors, leur marge ne depend pas du materiel, et
   les paliers tenus aussi, ils ont choisi de ne pas monter.
   Numerateur : ceux qui ont un barreau disponible ici strictement au-dessus de
   leur niveau canonique, ET dont la prescription du jour n est pas bornee. Un
   exercice borne produit une lecture non qualifiee, donc il ne peut pas
   progresser du tout ici : l annoncer comme ayant une marche serait faux.
   Le denominateur, lui, ne bouge pas avec le bornage : c est l ecart entre les
   deux nombres qui porte l information sous un profil reduit.
   Lecture pure, aucune ecriture : perfOf cree l entree manquante avec les
   valeurs du catalogue, exactement comme le fait le rendu d une fiche. */
/* Le bornage se recalcule sur l inventaire passe en parametre et non par
   gearPerf, qui lit state.gear : le compteur doit pouvoir juger un profil qui
   n est pas le profil actif, ne serait-ce que pour se laisser mesurer. */
function aUneMarche(id,gear){
  const e=DB[id], p=perfOf(id);
  if(e.bnd){
    const b=bandBorne(e,p.band,gear);
    if(b.cut||b.up) return false;
    const O=bandOrder(e), r=O.indexOf(p.band);
    return bandLadder(e,gear).some(x=>O.indexOf(x)>r);
  }
  if(e.mode==='fixed'||e.mode==='load'){
    const l=loadBorne(id,p.load,gear);
    if(l.cut||l.up) return false;
    const fc=(e.mode==='fixed')?fixedCap(id):null;
    const L=(e.mode==='fixed')?fixedLadder(id,gear).map(x=>x.v):loadLadderProg(gear);
    return L.some(v=>v>p.load+0.01&&(fc==null||v<=fc+0.01));
  }
  return false;
}
function progDispo(gear){
  const g=gear||state.gear, ids=[];
  SLOT_ORDER.forEach(s=>posTirables(s,g).forEach(i=>{
    const x=resolvePos(s,i,g); if(x&&ids.indexOf(x)<0) ids.push(x);
  }));
  const dep=ids.filter(id=>{
    const e=DB[id];
    return (e.mode==='load'||e.mode==='fixed'||e.bnd)&&!perfOf(id).hold;
  });
  return {marche:dep.filter(id=>aUneMarche(id,g)).length,total:dep.length};
}
function schemasServis(gear){
  const tot=SLOT_ORDER.reduce((a,s)=>a.concat((SCHEMA[s]||[]).filter((n,i)=>!isLocked(SLOTS[s].pool[i])&&!estRetire(SLOTS[s].pool[i]))),[]);
  const uniq=[]; tot.forEach(n=>{ if(uniq.indexOf(n)<0) uniq.push(n); });
  return {servis:uniq.length-schemasPerdus(gear).length,total:uniq.length};
}
function substitutDe(id){
  const out=[];
  SLOT_ORDER.forEach(s=>{
    const t=SUBS[s]||{};
    Object.keys(t).forEach(i=>{
      if(t[i].indexOf(id)>=0){
        const ref=SLOTS[s].pool[i];
        if(ref&&ref!==id&&out.indexOf(ref)<0) out.push(ref);
      }
    });
  });
  return out;
}
function estSubstitut(id){
  if(SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0)) return false;
  return substitutDe(id).length>0;
}
function estRepli(id){
  if(SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0)) return false;
  return replieDe(id).length>0;
}
function estRetire(id){
  const u=state.unlocked||{};
  if(!Object.keys(u).some(x=>u[x]&&DB[x]&&DB[x].retire===id)) return false;
  /* Un retrait ne doit pas orpheliner un verrou. Un exercice retire n enregistre
     plus rien, et un verrou qui lit son dernier passage deviendrait
     definitivement infranchissable : le retrait attend que plus aucun verrou
     ferme ne lise cet exercice. La condition se derive des donnees, ce n est pas
     un jugement. */
  const lu=Object.keys(DB).some(x=>DB[x].lock&&DB[x].lock.after===id&&!u[x]);
  return !lu;
}
function unitOf(e){return e.mode==='time'?'s':(e.mode==='circuit'?'rounds':(e.rhythm?'tenues':'reps'));}
/* Un palier tenu fige le niveau d un exercice : la cible cesse de monter, la
   charge et la bande cessent d evoluer vers le haut. Le filet de securite
   reste actif. Toute montee manuelle de charge libere le palier, une descente
   le conserve : baisser n a jamais valeur de « je repars en avant ». */
function isHeld(id){ const p=state.perf[id]; return !!(p&&p.hold); }
function setHold(id,v){
  const p=perfOf(id);
  if(v){ p.hold=true; p.holdAt=new Date().toISOString(); }
  else { delete p.hold; delete p.holdAt; }
  /* l ecart tire/pousse se mesure depuis le dernier changement de paliers */
  state.div={push:0,pull:0};
}
/* ============ SEANCE ALLEGEE (v1.8) ============ */
/* Mode ponctuel, choisi sur l accueil avant de lancer : le jour ou on est
   courbature partout, faire une seance amoindrie plutot que rien.
   Trois effets, decides ensemble :
   - substitution par la variante de repli la ou elle existe (12 exercices sur 36) ;
   - allegement de la cible ailleurs : -30 % arrondi a l inferieur, jamais sous le
     bas de fourchette ; quand le calcul passerait dessous, le debordement est
     encaisse par la charge (au moins -20 % sur l echelle continue des halteres,
     un barreau sur les echelles ordinales que sont les bandes et le kettlebell) ;
   - gel de la progression dans les deux sens sur toute la seance.
   Remonter les repetitions apres une descente de barreau a ete ecarte : ce serait
   reconstituer l effort qu on cherche a retirer. */
let lightMode=false;
function lightOn(){
  if(typeof cur!=='undefined'&&cur&&!cur.recap) return !!cur.light;
  return lightMode;
}
/* ============ BORNAGE MATERIEL A LA LECTURE (v2.0) ============
   Regle : l inventaire ne modifie jamais perf, il borne a la lecture. Le niveau
   canonique reste ce que la progression a ecrit, et la prescription du jour est
   ce que le materiel declare permet d en realiser. Consequence directe : un
   materiel decoche puis recoche restitue exactement l etat d avant, ce que la
   v1.18 detruisait definitivement en ecrivant dans perf depuis les reglages.
   L ordre des niveaux appartient a l echelle, jamais a l inventaire : celui-ci
   determine seulement lesquels sont realisables ici. */
function gearPerf(id){
  const e=DB[id], p=perfOf(id);
  const out={band:p.band,load:p.load,gearCut:false,gearUp:false};
  if(e.bnd&&p.band!=null){
    const b=bandBorne(e,p.band,state.gear);
    out.band=b.band; if(b.up) out.gearUp=true; if(b.cut||b.up) out.gearCut=true;
  }
  if(e.mode==='fixed'||e.mode==='load'){
    const l=loadBorne(id,p.load,state.gear);
    out.load=l.load; if(l.up) out.gearUp=true; if(l.cut||l.up) out.gearCut=true;
  }
  return out;
}
/* charge a monter reellement, pour le materiel a sortir et le comptage des
   remontages : la charge bornee et non la charge canonique */
function prescLoad(id){ return gearPerf(id).load; }
function lightPerf(id,vue){
  const e=DB[id], p=vue||perfOf(id);
  const out={target:p.target,load:p.load,band:p.band,repsCut:false,loadCut:false};
  if(!p.range||e.mode==='stretch'||e.cat==='cardio'||e.mode==='circuit') return out;
  const low=p.range[0], base=p.target||low;
  let t=Math.floor(base*0.7);
  if(e.mode==='time') t=Math.floor(t/5)*5;
  if(t>=low){ out.target=t; out.repsCut=t<base; return out; }
  out.target=low; out.repsCut=low<base;
  /* debordement sur la charge : le seul levier restant en bas de fourchette */
  if(e.mode==='load'){
    const L=loadLadder(state.gear), goal=p.load*0.8;
    for(let i=L.length-1;i>=0;i--) if(L[i]<=goal+1e-9){ if(L[i]<p.load-1e-9){out.load=L[i];out.loadCut=true;} break; }
  } else if(e.mode==='fixed'){
    const L=fixedLadder(id,state.gear);
    let i=-1; for(let k=0;k<L.length;k++) if(Math.abs(L[k].v-p.load)<0.01){i=k;break;}
    if(i>0){ out.load=L[i-1].v; out.loadCut=true; }
  } else if(e.bnd){
    const nb=nextBandFor(e,p.band,state.gear,-1);
    if(nb&&nb!==p.band){ out.band=nb; out.loadCut=true; }
  }
  return out;
}
/* Lecture des cibles a afficher : identique a perfOf hors mode allege, copie
   allegee sinon. Toujours une copie en allege : rien ne doit toucher l etat.
   sub=true signale un exercice deja remplace par sa variante de repli : il ne
   recoit pas la baisse de cible en plus, sinon l allegement compterait double.
   La copie garde quand meme la marque light, qui gele l interface. */
/* perfFor est une lecture, jamais une poignee d ecriture : elle rend toujours
   une copie bornee, meme hors mode allege. Les seuls ajustements manuels en
   seance passent par perfOf, qui rend l objet vivant. Un seul chemin pour
   prescrire, un seul pour ecrire. L allegement se calcule sur la vue bornee et
   non sur le niveau canonique, sinon il pourrait descendre vers un barreau que
   le materiel declare ne realise pas. */
function perfFor(id,sub){
  const p=perfOf(id), g=gearPerf(id);
  const vue=Object.assign({},p,{band:g.band,load:g.load,gearCut:g.gearCut,gearUp:g.gearUp});
  if(!lightOn()) return vue;
  if(sub) return Object.assign(vue,{light:true,repsCut:false,loadCut:false});
  const l=lightPerf(id,vue);
  return Object.assign(vue,{target:l.target,load:l.load,band:l.band,light:true,repsCut:l.repsCut,loadCut:l.loadCut});
}
function heldCount(){ return Object.keys(state.perf).filter(id=>DB[id]&&state.perf[id].hold).length; }
/* fin de serie : on enregistre, et on evalue la double progression en fin d exercice.
   full=false quand la lecture n est pas exploitable (serie sautee, repli douleur,
   seance quittee) : on enregistre, le filet de securite joue, mais rien ne monte. */
function applyProgress(id,sets,full,light,unqual){
  const e=DB[id], p=perfOf(id), msgs=[];
  if(full===undefined) full=true;
  /* PROVENANCE D UNE LECTURE, trois regimes : exploitable, issue d une seance
     allegee, non qualifiee par le materiel. Une information s enregistre
     toujours, une action exige les trois feux verts.
     Les deux marqueurs sont poses sur la performance et non sur la seance : la
     v1.15 avait deja fait ce deplacement pour l allegee, parce que la seance
     normale suivante lisait le dernier passage sans savoir d ou il venait. Le
     marqueur materiel suit le meme modele.
     La sortie de regime est placee AVANT toute ecriture d action, y compris le
     record et le meilleur de bande : en v1.18 ces deux-la etaient ecrits
     au-dessus de la sortie, et la branche bandGate de checkUnlocks lisait le
     meilleur de bande sans garde de provenance. Ecrit ainsi, aucun chemin ne
     peut diverger a nouveau. */
  p.sets=sets.slice(); p.date=new Date().toISOString();
  /* v2.12 : le barreau sous lequel les series ont ete jouees s ecrit ici, avec
     elles et avant toute progression, donc p.band vaut encore la valeur d avant
     seance. Il decrit p.sets, comme p.date : sa place est cette ligne et non
     plus bas, pour que le couple reste coherent y compris en seance allegee ou
     sous materiel non conforme, ou les provenances suffisent a bloquer l action.
     Ce qui n est pas rejouable s ecrit au moment ou il est vrai (v2.4). */
  if(e.bnd) p.setsBand=p.band||null;
  /* v2.18 : meme regle pour la charge et pour le barreau de consigne. Le
     verrou « au dernier cran » lisait p.load APRES la progression de fin de
     seance : deux series de 25 jouees a l avant-dernier cran des mollets
     lestes montaient la charge au dernier, et le successeur s ouvrait sur
     des series qui n y avaient pas ete faites. Il lit desormais ceci. */
  if(e.mode==='load'||e.mode==='fixed') p.setsLoad=p.load||0;
  if(rungSpec(e)) p.setsRung=rungOf(e,rungVal(e,p)).v;
  if(light) p.lightSets=true; else delete p.lightSets;
  if(unqual) p.unqualSets=true; else delete p.unqualSets;
  if(light||unqual) return msgs;
  const best=Math.max.apply(null,sets.concat([0]));
  if(best>p.best) p.best=best;
  /* le module cardio est un bloc de duree fixe : rien a faire progresser */
  if(e.cat==='cardio'||e.mode==='circuit') return msgs;
  if(!p.range||!sets.length) return msgs;
  /* Regle des bornes (v1.15) : les predicats d evenement se lisent sur la
     fourchette d entree, les recalibrages sur la fourchette courante. La v2.16
     avait retire toute ecriture de p.range ; la v2.17 en reintroduit deux, les
     deux sens de l echelle de tenues, ou la fourchette EST celle du barreau.
     La reaffectation avant nextTarget n est donc plus vraie par construction :
     elle est ce qui fait suivre les bornes au barreau qui vient de changer. */
  let low=p.range[0], top=p.range[1];
  const step=(e.mode==='time')?5:1;
  /* Cible suivante = plus haute des deux dernieres lectures + 1, arrondie au
     multiple du pas de l exercice, bornee a la fourchette (v1.11, fenetre en
     v2.14). Chaque lecture est la plus petite serie du passage. Le pas vaut 1
     en repetitions et 5 sur les tenues chronometrees : monter une planche
     d une seconde par passage demandait 40 passages pour aller de 20 a 60 s,
     soit environ un an au rythme de rotation reel, la ou les autres exercices
     franchissent leur fourchette en 8 a 14 passages. Le « + 1 » avant
     l arrondi est indispensable : sans lui, tenir exactement sa cible ne
     ferait jamais rien monter. Les bornes des exercices tenus sont deja
     toutes multiples de 5, l arrondi ne peut donc pas sortir de la
     fourchette. Les etirements et l echauffement ne passent pas ici.
     FENETRE DE DEUX PASSAGES (v2.14). Avec un horizon d un seul passage, une
     mauvaise seance a 12 sur une cible a 16 recalait la cible a 13, sans un
     mot : un seul jour hors forme effacait l ancre. Le principe d architecture
     dit de decider sur l observable, il n oblige pas a oublier l avant-dernier
     passage. p.prevMin porte la plus petite serie du passage exploitable
     precedent au palier courant ; la cible vaut max(prevMin, minSet) + 1. Une
     mauvaise seance est absorbee, deux consecutives font redescendre, et le
     recul devient un evenement qui se dit au recapitulatif. La memoire se
     remet a zero a tout changement de palier, montee, descente et ajustement
     manuel de charge ou de bande (le relevement de fourchette, qui en faisait
     partie, n existe plus depuis la v2.16) : une lecture
     faite a un autre palier n est pas comparable. Elle ne s ecrit que sur une
     lecture exploitable et complete, le minimum d un passage ampute etant
     biaise vers le haut, motif deja retenu pour interdire la descente sur
     journal tronque. Un palier tenu l ecrit sans la lire : c est une
     observation, pas une decision. Absente, pas de memoire, aucune migration.
     Ecarte, le cliquet qui ne redescend jamais dans la fourchette : il ment
     apres toute vraie regression, et garder 16 apres un 12 exige de savoir
     que c etait une mauvaise journee, ce que l outil n observe pas. */
  const nextTarget=v=>Math.max(low,Math.min(top,Math.ceil((v+1)/step)*step));
  const plafond=()=>msgs.push('Plafond atteint sur '+e.nom+' : '+(nextFor(id,state.gear)||'pas de marche outillée au-delà pour l\'instant'));
  /* Grace post-montee (v1.15) : le premier passage suivant une montee de
     barreau ne peut pas declencher de descente, le temps de s adapter. Elle
     est consommee par tout passage complet, palier tenu compris : elle est
     liee au passage, pas au regime. Une seance allegee est deja sortie plus
     haut, une lecture partielle ne consomme pas. Elle est lue puis effacee
     avant la montee, sinon une nouvelle pose serait aussitot annulee. */
  const grace=!!p.grace;
  if(full) delete p.grace;
  const monte=!p.hold&&full&&sets.every(v=>v>=top);
  const minSet=Math.min.apply(null,sets), maxSet=Math.max.apply(null,sets);
  let montee=false, descendu=false;
  if(monte){
    if(e.mode==='load'){
      const nl=nextLoadProg(p.load,state.gear,1);
      if(nl>p.load){ p.load=nl; p.target=low; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : charge montée à '+fmtKg(nl)+', retour à '+low+' reps'); }
      else msgs.push(e.nom+' : charge maximale disponible avec ton matériel, ajoute des disques pour continuer');
    } else if(e.bnd){
      /* echelle ordinale de bandes : barreau suivant vers le plus dur.
         Le message nomme le barreau et rien d autre (v2.21). Il portait « dans
         le dos », vrai des seules pompes aux poignees et concatene a tous les
         exercices a bande de resistance : les face pulls, ancres a hauteur de
         visage, annoncaient une bande dans le dos. Un placement est une
         consigne de montage, elle se lit avant l exercice et la puce de
         materiel la porte deja, conditionnee a l exercice ; ce recapitulatif se
         lit une fois la seance finie. La branche « aucune » disparait avec :
         bandLabel la traite. Le sens descendant, lui, n a jamais porte de
         placement, les deux sens sont desormais symetriques. */
      const nb=nextBandFor(e,p.band,state.gear,1);
      if(nb){ p.band=nb; p.target=low; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : '+(e.bnd==='ass'?'moins d\'aide, ':'')+bandLabel(nb)+', retour à '+low+' reps'); }
      else plafond();
    } else if(e.mode==='fixed'){
      /* echelle numerique kettlebell + lestes (+ haltere pour le rowing) */
      const L=fixedLadder(id,state.gear), fc=fixedCap(id);
      let nl=null; for(const x of L) if(x.v>p.load+0.01&&(fc==null||x.v<=fc+0.01)){ nl=x; break; }
      if(nl){ p.load=nl.v; p.target=low; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : charge montée à '+nl.lbl+', retour à '+low+' reps'); }
      else plafond();
    } else if(e.rhythm){
      /* Echelle de tenues (v2.17) : barreau suivant, fourchette du barreau,
         cible au bas, grace, comme une bande. C est la seule ecriture de
         p.range depuis la v2.16, et c est un vrai changement de palier : la
         tenue cumulee par cote passe de 36 a 24 s puis de 48 a 30 s, un
         tiers perdu au retour au bas, comme a une montee de charge. */
      const r=rungOf(e,p.tenue);
      if(r.i<r.n-1){
        const nr=e.rhythm.ladder[r.i+1];
        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : tenues de '+nr[0]+' s, retour à '+nr[1]+' par côté'); }
      else plafond();
    } else if(e.assise){
      /* Echelle d assise (v2.18), meme geste que les tenues : barreau
         suivant, chaise plus basse, fourchette du barreau, cible au bas,
         grace. */
      const r=rungOf(e,p.assise);
      if(r.i<r.n-1){
        const nr=e.assise.ladder[r.i+1];
        p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : assise à '+nr[0]+' cm, retour à '+nr[1]+' par côté'); }
      else plafond();
    } else {
      /* Poids du corps et tenues : aucune echelle. Jusqu en v2.15 le moteur
         « relevait » ici la fourchette d un pas, bas+1 et haut+1, tant qu un
         champ cap le permettait, cible portee au nouveau haut et sans grace :
         du +1 lineaire habille en fourchette, qui affichait « Marche 1 sur 3 »
         pour un escalier que personne n avait dessine. Retire en v2.16 : le
         haut de fourchette est le plafond, et ce qui suit est la marche
         ecrite, un successeur derriere verrou ou une consigne manuelle. */
      plafond();
    }
  }
  /* Au plafond, la cible vaut le haut (v2.16). Quand toutes les series
     atteignent le haut sans qu aucun palier ne bouge, sommet d echelle ou
     fourchette sans echelle, la cible n etait pas recalculee : une cible a 12
     restait a 12 apres un 15/15/15, et ne se rattrapait qu au passage suivant
     par la memoire de fenetre. Elle vaut desormais le haut, qui est ce que
     nextTarget aurait rendu, borne par la fourchette. */
  if(monte&&!montee) p.target=top;
  if(!monte){
    /* Filet de securite (v1.15). Le critere se deplace de la serie vers le
       passage : [15,15,7] descendait, ne descend plus et devient un signal ;
       [9,9,9] ne descendait pas, descend desormais. Ni assouplissement ni
       durcissement. La borne est stricte : le plancher atteint est une
       reussite dans la fourchette, pas un echec. Mesure sur les sept
       premieres seances reelles : quatorze passages a max = bas, que la borne
       large aurait tous retrogrades, zero passage sous le plancher. La
       constante « bas - 2 » disparait sans remplacement. */
    const echec=maxSet<low, partiel=minSet<low&&maxSet>=low;
    /* La descente exige une lecture complete : « toutes les series » n est pas
       evaluable sur un journal ampute, ou l affirmation devient d autant plus
       facile que le journal est court. L information, elle, passe toujours. */
    if(echec&&full&&!grace){
      if(e.mode==='load'){
        if(p.load>0){
          const dl=nextLoadProg(p.load,state.gear,-1);
          if(dl<p.load){ p.load=dl; descendu=true; msgs.push(e.nom+' : charge redescendue à '+fmtKg(dl)+', on consolide avant de repartir'); }
        }
      } else if(e.bnd){
        const pb=nextBandFor(e,p.band,state.gear,-1);
        if(pb){ p.band=pb; descendu=true;
          msgs.push(e.nom+' : '+(e.bnd==='ass'?'un peu plus d\'aide, '+bandLabel(pb):(pb==='aucune'?'retour sans bande':'retour à la '+bandLabel(pb)))+', on consolide avant de repartir'); }
      } else if(e.mode==='fixed'){
        const L=fixedLadder(id,state.gear);
        let dl=null; for(let i=L.length-1;i>=0;i--) if(L[i].v<p.load-0.01){ dl=L[i]; break; }
        if(dl){ p.load=dl.v; descendu=true; msgs.push(e.nom+' : charge redescendue à '+dl.lbl+', on consolide avant de repartir'); }
      }
      else if(e.rhythm){
        /* Barreau inferieur de l echelle de tenues (v2.17). Au premier
           barreau, comme au poids du corps : seul le signal passe. La cible se
           recale ensuite par nextTarget sur la fourchette du barreau, donc au
           bas, comme apres une descente de charge : on consolide. */
        const r=rungOf(e,p.tenue);
        if(r.i>0){ const pr=e.rhythm.ladder[r.i-1]; p.tenue=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;
          msgs.push(e.nom+' : retour aux tenues de '+pr[0]+' s, on consolide avant de repartir'); }
      }
      else if(e.assise){
        /* Barreau d assise inferieur (v2.18) : la chaise remonte. C est le
           filet qui couvre une entree a 40 cm trop raide, deux passages de
           suite sous le plancher, la grace protegeant le premier. */
        const r=rungOf(e,p.assise);
        if(r.i>0){ const pr=e.assise.ladder[r.i-1]; p.assise=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;
          msgs.push(e.nom+' : retour à l\'assise de '+pr[0]+' cm, on consolide avant de repartir'); }
      }
      /* Poids du corps et tenues : pas de barreau inferieur. Le miroir du
         relevement, la fourchette qui redescendait d un pas (v1.15), est parti
         avec lui en v2.16 : la fourchette ne bouge plus dans aucun sens, seul
         le signal passe. */
    }
    /* Un seul message par evenement : la descente quand elle a lieu, le signal
       sinon. La grace, la lecture partielle et l absence de barreau inferieur
       empechent le geste, jamais l information. */
    /* Le nom de l exercice ouvre le message : ces deux signaux n entrainent
       aucune action, donc rien dans le recapitulatif ne dit de quel exercice
       ils parlent. « Aucune série au plancher » est exact que la lecture soit
       complete ou ampute, la ou « toutes les séries » aurait ete faux sur un
       journal tronque. */
    const low0=low;
    low=p.range[0]; top=p.range[1];
    const prev=p.target;
    /* Fenetre de deux passages (v2.14) : la reference est la plus haute des
       deux dernieres lectures. Apres une descente, le passage a ete joue a
       l ancien palier et la memoire ne vaut plus : la reference retombe sur
       la seule lecture du jour, ce qui donne le bas de fourchette. */
    const fen=full&&!descendu&&p.prevMin!=null;
    const ref=fen?Math.max(p.prevMin,minSet):minSet;
    /* la cible ne monte ni sur un palier tenu, ni sur une lecture partielle */
    if(!p.hold&&full) p.target=nextTarget(ref);
    else if(p.target>top) p.target=top;
    /* Le recul de cible se dit au recapitulatif (v2.14). La v1.15 le taisait
       dans la fourchette, au motif qu il etait le moteur qui fonctionne et non
       un evenement : sur un horizon d un passage, il arrivait des qu un
       passage etait moins bon que le precedent. Sur deux passages, il signifie
       deux passages consecutifs sous la cible, ce qui informe. Un recul sans
       memoire, premier passage apres un ajustement manuel ou sur une
       sauvegarde anterieure, reste muet : il n a qu un passage derriere lui,
       la v1.15 tient pour lui. Un seul message par evenement : l echec sans
       descente et la lecture partielle portent deja le leur, la clause
       « cible recalee » s y ajoute quand elle a lieu, et le message autonome
       ne sort que hors de ces deux cas. Le bas cite par l echec est celui de
       la fourchette d entree. v2.23 : le message autonome porte les deux
       lectures, l ancienne puis celle du jour. Sans elles, un recul qui suit
       une remontee (6 puis 7 sous une cible a 9) se lisait comme une
       regression, alors que la direction est visible dans les deux nombres.
       p.prevMin porte encore ici l ancienne lecture, il n est reecrit que
       plus bas. */
    const recul=prev>p.target?', cible recalée de '+prev+' à '+p.target:'';
    if(echec&&!descendu) msgs.push(e.nom+' : aucune série au plancher ('+maxSet+' pour un bas à '+low0+')'+recul);
    else if(partiel) msgs.push(e.nom+' : des séries sous le plancher ('+minSet+' pour un bas à '+low+')'+recul);
    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');
  }
  /* La memoire de la fenetre s ecrit sur toute lecture exploitable et
     complete, palier tenu compris, et se remet a zero quand le palier a
     change pendant ce passage : la lecture du jour a ete faite a l ancien
     palier, elle ne dit rien du nouveau. */
  if(full){ if(montee||descendu) delete p.prevMin; else p.prevMin=minSet; }
  /* div compte les montees reussies, pas les passages au plafond : un exercice
     bloque au dernier barreau gonflait le compteur a chaque passage */
  if(montee&&e.cat){ state.div=state.div||{push:0,pull:0}; if(state.div[e.cat]!=null) state.div[e.cat]++; }
  return msgs;
}
/* Ecart tire/pousse cree par les paliers tenus. Un seul sens est signale :
   le pousse qui prend de l avance sur un tire tenu, defavorable aux epaules.
   L inverse est benin et ne declenche rien. */
const DIV_SEUIL=3;
function divergence(){
  const d=state.div||{push:0,pull:0};
  const tireTenu=Object.keys(state.perf).some(id=>DB[id]&&DB[id].cat==='pull'&&state.perf[id].hold);
  const ecart=(d.push||0)-(d.pull||0);
  return (tireTenu&&ecart>=DIV_SEUIL)?ecart:0;
}
/* Deblocages. Le volume de la seance est passe en parametre plutot que lu dans
   un global : la fonction doit pouvoir etre rejouee sur une seance corrigee
   avec le volume de cette seance, et non avec le reglage courant. Une seance
   allegee n ouvre aucun verrou : un mode qui ne fait rien monter ne doit rien
   deverrouiller non plus. Quatre des cinq sources de verrou ont une variante de
   repli et sont remplacees en allege, donc n enregistrent rien ; le souleve
   roumain n en a pas, il est joue a charge reduite, et son compte de
   repetitions alimentait le verrou du swing, le mouvement le plus dynamique du
   catalogue pour le rachis. Aucun verrou ne lit plus best : c est un maximum
   historique que l outil ne sait pas corriger. */
/* Enonce d un verrou : le compte exige depend du volume, il se calcule a
   l affichage plutot que d etre fige dans la donnee. */
function lockCond(e){
  if(!e||!e.lock) return '';
  const n=Math.min(e.lock.minSets||1,effRounds());
  return String(e.lock.cond).replace('{n}',n);
}
function checkUnlocks(vol,light,prevu){
  const msgs=[];
  if(light) return msgs;
  Object.keys(DB).forEach(id=>{
    const e=DB[id];
    if(e.lock&&!state.unlocked[id]){
      const src=DB[e.lock.after], p=state.perf[e.lock.after];
      if(!p) return;
      /* Une seule lecture de repetitions pour tous les verrous (v2.12). Elle
         porte sur des series de la meme seance, pas sur un maximum historique :
         on lit la derniere seance enregistree. Le compte exige est plafonne par
         le volume joue, sinon « 3 series de 6 » etait arithmetiquement
         irrealisable au volume de 2 et le verrou ne s ouvrait jamais. Le
         plafond porte sur le volume et non sur le nombre de series
         enregistrees : sinon une seance quittee apres une seule serie suffirait
         a ouvrir.
         Le volume qui compte est celui reellement prevu pour l exercice source.
         Les deux conditions de niveau, barreau de bande et charge, s ajoutent
         ensuite en conjonction : aucune ne remplace la lecture des repetitions,
         et aucune branche ne peut donc en avoir une version a elle. */
      const v=(prevu&&prevu[e.lock.after])||vol||roundsOf(state);
      const k=Math.min(e.lock.minSets||1,v);
      let ok=(p.sets||[]).filter(x=>x>=e.lock.need).length>=k;
      /* Porte de bande (v2.0, alignee en v2.12). Le barreau exige est le plus
         dur de l ECHELLE, et non de l echelle filtree par l inventaire actif :
         une premiere ecriture du chantier lisait bandLadder, si bien que sous
         un profil ne possedant que la verte, dix repetitions avec l assistance
         maximale ouvraient les tractions strictes, la verte etant alors le
         dernier barreau disponible. Temoin mesure avant correction, et rejoue a
         chaque build. Consequence assumee : qui ne possede le jaune dans aucun
         profil ne peut pas ouvrir les strictes, on ne prouve pas une
         quasi-traction avec une grosse bande.
         Le barreau lu est celui ECRIT AVEC LES SERIES, jamais le barreau
         courant : une seance jouee au barreau precedent peut faire monter la
         bande en fin de seance, auquel cas le barreau courant serait le bon et
         les repetitions auraient ete faites sous un autre. C est exactement le
         trou que la remise a zero de bandBest fermait par effet de bord. */
      if(ok&&e.lock.bandGate&&src&&src.bnd){
        const L=bandOrder(src);
        ok=L.length>0&&!!p.setsBand&&p.setsBand===L[L.length-1];
      }
      /* Condition de charge (v2.5) : un verrou ne savait lire qu un compte de
         repetitions, si bien qu un successeur pose derriere un exercice a charge
         s ouvrait au premier barreau et retirait son predecesseur avant qu il
         ait servi.
         Le dernier barreau se lit ici sur l echelle FILTREE par l inventaire, a
         l inverse de la porte de bande ci-dessus : voir le commentaire de
         mollets-une-jambe dans CFG, l exercice ouvert ne demande aucun materiel
         et un seuil absolu y enfermerait un inventaire pauvre. */
      if(ok&&(e.lock.loadTop||e.lock.kbTop||e.lock.rungTop)) ok=gatePalier(e).ok;
      /* Les trois feux verts, appliques APRES les branches et non dans l une
         d elles. En v1.18 la garde de provenance vivait dans la branche
         normale, en else if : la branche bandGate, placee avant, ne la
         rencontrait jamais et un maximum de bande obtenu en seance allegee
         ouvrait le verrou des tractions strictes. Ecrite ici, aucune branche
         presente ni future ne peut l oublier. */
      if(p.lightSets||p.unqualSets) ok=false;
      if(ok){ state.unlocked[id]=true; msgs.push('🔓 Débloqué : '+e.nom); }
    }
  });
  return msgs;
}
function checkBadges(){
  const msgs=[];
  BADGES.forEach(b=>{ if(!state.badges.includes(b.id)&&b.test(state)){ state.badges.push(b.id); msgs.push(b.ico+' Badge : '+b.nom); } });
  return msgs;
}

