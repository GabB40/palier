/* ============ CONSTRUCTION DE LA SEANCE ============ */
function warmupList(w){
  const mode=w||(cur&&cur.warmMode)||state.warm;
  if(mode==='aucun') return [];
  if(mode==='court') return WARM_SHORT.map(i=>WARMUP[i]);
  return WARMUP;
}
/* v2.22 : le decompte de lancement fait partie du poste echauffement. Il est
   chronometre, donc il tique dans le modele rejoue, et l annonce doit le
   compter pour qu une seance jouee aux cibles reste egale a son annonce. */
const START_PREP=5;
function warmupSec(w){ const L=warmupList(w); return L.length?START_PREP+L.reduce((a,x)=>a+x.s,0):0; }
/* ROTATION SOUS PROFIL REDUIT (v2.0). La grille des positions est filtree par
   les verrous, les retraits et desormais la resolution materielle, et le
   compteur indexe la grille filtree. C est le mecanisme deja en place pour les
   verrous, etendu d un predicat.
   Mesure qui a fait ecarter la variante du balayage circulaire, qui aurait
   laisse le compteur sur la grille de reference et avance jusqu a la premiere
   position resoluble : les positions non servies donnent alors leur frequence
   a la position servie qui les suit, ce qui n a rien de proportionnel. Sur la
   grille tiree a six positions, verrous fermes, profil halteres seuls, elle
   donne face pulls 20, face pulls seconde part 30 et curls 10 sur soixante
   seances, avec la meme part jouee jusqu a trois fois d affilee. Balayage des
   cinquante-sept parties resolubles de taille au moins deux : ecart de
   frequence jusqu a 66,7 %, equitable sur six parties seulement, contre
   cinquante-sept sur cinquante-sept ici.
   Le compteur, lui, n est jamais deplace par la resolution : il avance d un
   cran par seance quel que soit le profil. C est cela, et non l absence de
   modulo propre au profil, qui garantit qu un retour au profil precedent
   reprend la rotation ou elle en etait. Verifie : apres sept seances ailleurs,
   la position servie au retour est celle qu on aurait eue sans jamais partir. */
/* v2.8 : position lue dans le vivier, dephasage compris. Un cran de plus par
   tour de vivier accompli, propre a l emplacement. Lecture pure : elle ne
   touche pas le compteur, ne connait pas l etat, et pickAt la traverse comme
   pickFromPool, sans quoi le carrousel annoncerait un autre tirage que celui
   qui sortira. */
function phaseIdx(slot,c,n){
  if(n<=0) return 0;
  const k=SLOT_PHASE[slot]||0;
  return (c + k*Math.floor(c/n)) % n;
}
function pickFromPool(slot){
  const pos=posTirables(slot,state.gear);
  if(!pos.length) return SLOTS[slot].pool[0];
  const i=pos[phaseIdx(slot,state.slotIdx[slot]||0,pos.length)];
  return resolvePos(slot,i,state.gear)||SLOTS[slot].pool[i];
}
/* v1.18 : le tirage a n seances d ici, pour les panneaux a venir du detail de
   seance. Lecture seule, sans repli ni ajustement du jour : une seance allegee
   ou une variante de douleur est une bascule du jour, elle n a pas a colorer
   ce qui vient. L ordre n est exact qu a jeu normal : une seance quittee
   n avance rien, une allegee gele les emplacements substitues, un verrou qui
   s ouvre recompose le vivier. */
function drawAhead(k){ return SLOT_ORDER.map(s=>pickAt(s,k)); }
function pickAt(slot,k){
  const pos=posTirables(slot,state.gear);
  if(!pos.length) return SLOTS[slot].pool[0];
  const i=pos[phaseIdx(slot,(state.slotIdx[slot]||0)+k,pos.length)];
  return resolvePos(slot,i,state.gear)||SLOTS[slot].pool[i];
}
/* autant de panneaux que le plus gros vivier. v2.8 : la fenetre ne promet plus
   l exhaustivite, elle promet l exactitude. Que toute tranche de n tirages
   porte les n exercices equivaut a une suite de periode n, et deux suites de
   periode 5 sur jambes et gainage redonnent les cinq paires rigides que le
   dephasage supprime. Les deux garanties sont exclusives, mesure a l appui :
   les tenir ensemble aurait demande onze panneaux. Six panneaux exacts valent
   mieux que onze panneaux exhaustifs, l exhaustivite n ayant jamais ete un
   engagement consomme, seulement une consequence de la rigidite. */
function aheadCount(){
  return SLOT_ORDER.reduce((m,s)=>{
    const n=posTirables(s,state.gear).length;
    return Math.max(m,n||1);
  },1);
}
/* Ajustements du jour (v1.13). Reglages porte les defauts, l accueil les ajuste
   pour la seance qui vient. Meme cycle de vie que le mode allege : un mode
   ponctuel n est pas un reglage, il ne survit jamais a une seance. */
let dayWarm=null, dayCardio=null, dayStretch=null, dayRounds=null;
function effWarm(){ return dayWarm==null?state.warm:dayWarm; }
function effCardio(){ return dayCardio==null?!!state.cardio:dayCardio; }
function effStretch(){ return dayStretch==null?(state.stretch!==false):dayStretch; }
function effRounds(){ return dayRounds==null?roundsOf(state):dayRounds; }
function roundsOf(s){ const r=s&&s.rounds; return ROUNDS_CHOICES.indexOf(r)<0?3:r; }
function dayTouched(){ return dayWarm!=null||dayCardio!=null||dayStretch!=null||dayRounds!=null; }
function clearDay(){ dayWarm=dayCardio=dayStretch=dayRounds=null; }
/* v1.13 : plus d ordre de sacrifice. Le nombre de series est choisi, les
   options s ajoutent au lieu de rogner le volume, et le total est annonce. */
function planFor(){ return {rounds:effRounds(),cardio:effCardio(),warm:effWarm()}; }
function roundsFor(){ return planFor().rounds; }
function workSteps(steps){ return steps.filter(s=>s.k==='set'&&!s.cool); }
/* repos inerte du mode alterne : reglable depuis la v1.14, la transition de
   15 s n etait qu un defaut. Une sauvegarde anterieure n a pas le champ. */
function transSec(){ const t=state&&state.trans; return TRANS_CHOICES.indexOf(t)<0?TRANSITION:t; }
/* Constructeur unique des etapes de repos. Deux sites emettent des repos, la
   construction de seance et le changement de volume en cours de seance : la
   regle vit ici et nulle part ailleurs, sinon les deux divergeront comme
   l avaient fait les trois ecritures de next avant la v2.6.
   Le drapeau pause est porte par l etape et jamais rededuit de sa duree :
   l ecran, la decomposition et les tests lisent tous le meme fait.
   v2.11 : etre au raccord ne suffit plus. Il faut en plus que la paire y soit
   nommee dans PAUSE_RACCORD_PAIRS. Liste vide = aucune pause, l outil n ajoute
   pas de temps mort pour un probleme qu il n a pas observe. */
function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }
function restStep(raccord,avant,apres){
  return (raccord&&pauseAu(avant,apres))
    ? {k:'rest',sec:PAUSE_TOUR,pause:true}
    : {k:'rest',sec:transSec()};
}
function tempoOf(id){ const t=TEMPO_EX[id]; return t==null?TEMPO:t; }
function switchSec(id){ return SWITCH_EX[id]||0; }
/* cout reel d une serie, exercice par exercice : un unilateral coute deux fois
   le travail, une tenue coute sa cible plus le decompte de preparation. */
function serieSec(id,light){
  const e=DB[id]; if(!e) return INSTALL;
  const p=perfFor(id,!!light);
  /* un etirement bilateral enchaine ses deux phases apres un seul decompte,
     leur somme faisant la duree de base : il coute sa duree, une fois. Une
     tenue par cote est deux tenues completes, decompte compris (v1.13). */
  if(e.mode==='stretch') return INSTALL_STRETCH+prepSec()+(e.dur||45);
  if(e.mode==='time'){
    const c=p.target||(e.reps?e.reps[0]:30);
    return INSTALL+(e.side?2:1)*(prepSec()+c);
  }
  /* Tenues rythmees (v2.17) : chronometrees et non plus modelisees. Un
     decompte, puis deux cotes en alternance, chaque tenue suivie de sa
     bascule. Au premier barreau, 3 + 2 = 5 s vaut exactement l ancien tempo
     du bird-dog : le modele ne bouge pas a la migration. */
  if(e.rhythm){
    const r=p.target||baseReps(e,p)[0];
    return INSTALL+prepSec()+2*r*(tenueOf(id,p)+e.rhythm.bascule);
  }
  /* Repetitions cadencees (v2.19) : chronometrees comme les tenues par cote.
     Pour chaque cote, un decompte, l etablissement de la ligne, puis la cible
     en cycles de montee et de descente. Le retournement entre les deux cotes
     n est pas modelise, pas plus que sur une tenue par cote. v2.22 : un cote
     ou deux selon e.side, et la tenue en haut du pont dans le cycle. Le cycle
     de 4,5 s donne des demi-secondes : le cote est arrondi, le modele rejoue
     comptant des secondes entieres. Une reprise rejoue un decompte,
     interruption non modelisee. */
  if(e.cadence){
    const r=p.target||e.reps[0], c=e.cadence;
    return INSTALL+(e.side?2:1)*Math.round(prepSec()+(c.etab||0)+r*(c.monte+(c.tenue||0)+c.descente));
  }
  const r=p.target||(e.reps?e.reps[0]:10);
  return INSTALL+(e.side?switchSec(id):0)+Math.round(r*tempoOf(id)*(e.side?2:1));
}
/* Part non chronometree d une serie (v1.16). Le modele rejoue applique la ligne
   de partage de la v1.14 a l envers : tout ce que l outil chronometre est compte
   tick par tick a sa valeur reelle, et seul ce pendant quoi aucun chrono ne
   tourne se calcule ici. D ou les trois cas. Un etirement n a que son
   installation, sa preparation et sa duree ayant defile. Une tenue n a que son
   installation, pour la meme raison, decompte de preparation compris et deux
   fois s il y a deux cotes. Une serie chiffree porte en plus son tempo, calcule
   sur la valeur reellement saisie et non sur la cible : c est toute la raison
   d etre du rejeu. */
function serieModelAdd(id,val){
  const e=DB[id]; if(!e) return INSTALL;
  if(e.mode==='stretch') return INSTALL_STRETCH;
  if(e.mode==='time'||e.rhythm||e.cadence) return INSTALL;   /* rythme et cadence : tout a defile au tick */
  const r=val||0;
  return INSTALL+(e.side?switchSec(id):0)+Math.round(r*tempoOf(id)*(e.side?2:1));
}
/* Ressource physique qu un exercice mobilise : les deux barres d halteres, ou
   la kettlebell et ses lestes. Une bande se change de barreau sans montage. */
function gearKey(id){
  const e=DB[id]; if(!e) return null;
  if(e.mode==='load') return 'halteres';
  if(e.mode==='fixed') return 'kb';
  return null;
}
/* Remontages imposes par la sequence reelle des series : le premier montage se
   fait avant la seance, il ne compte pas. Vaut zero dans la grande majorite
   des tirages, et jusqu a cinq fois quand deux exercices se disputent les
   halteres a des charges differentes dans un circuit alterne. */
function remounts(plan){
  const last={}, pairs=[]; let n=0;
  (plan.steps||[]).forEach(st=>{
    if(st.k!=='set'||st.cool) return;
    const k=gearKey(st.id); if(!k) return;
    const c=prescLoad(st.id);
    if(last[k]!=null&&Math.abs(last[k]-c)>0.01){
      n++;
      if(pairs.indexOf(k)<0) pairs.push(k);
    }
    last[k]=c;
  });
  return {n:n,sec:n*REMOUNT,gear:pairs};
}
/* les deux montages a alterner sur une ressource, pour l avertissement du
   detail de seance : le materiel a sortir ne suffit pas a preparer une seance
   qui change de charge en cours de route */
function remountPairs(plan){
  const seen={}, out=[];
  (plan.exos||[]).forEach(id=>{
    const k=gearKey(id); if(!k) return;
    if(!seen[k]) seen[k]=[];
    const c=prescLoad(id);
    if(!seen[k].some(x=>Math.abs(x.load-c)<0.01)) seen[k].push({id:id,load:c});
  });
  Object.keys(seen).forEach(k=>{ if(seen[k].length>1) out.push({gear:k,items:seen[k]}); });
  return out;
}
/* decomposition de la duree annoncee : ce que la card Contenu affiche poste
   par poste, et dont le total etiquette le bouton de volume. */
function planParts(plan){
  const w=warmupSec(plan.warm);
  let exos=0, trans=0, cool=0, cardio=0, pause=0, nPause=0;
  plan.steps.forEach(st=>{
    if(st.k==='set') { if(st.cool) cool+=serieSec(st.id,false); else exos+=serieSec(st.id,plan.light); }
    /* v2.10 : la pause de raccord est un poste a part. Elle entrait deja dans
       le total, tous les repos y etant sommes, mais la ligne Transitions
       l aurait annoncee au tarif de la transition. */
    else if(st.k==='rest'){ if(st.pause){ pause+=st.sec; nPause++; } else trans+=st.sec; }
    else if(st.k==='cardio') cardio+=CARDIO_SEC;
  });
  const rm=remounts(plan);
  return {warm:w,exos:exos,trans:trans,pause:pause,nPause:nPause,remount:rm.sec,nRemount:rm.n,cardio:cardio,cool:cool,
          total:w+exos+trans+pause+rm.sec+cardio+cool};
}
function estimateSec(plan){ return planParts(plan).total; }
/* La substitution du mode allege se fait ici, a la construction, et nulle part
   ailleurs : le materiel a sortir, le resume de l accueil, l estimation de duree
   et les etapes en decoulent sans que rien d autre ait a connaitre le mode. */
function buildSession(){
  const adj=planFor();
  const steps=[];
  const light=lightOn();
  /* le repli doit etre realisable ici : meme filtre que le geste de douleur */
  const sub=id=>(light&&fbOf(id))?fbOf(id):id;
  const mark=(st,orig)=>{ if(st.id!==orig){ st.from=orig; st.key=orig+'>'+st.id; st.swapped=true; st.light=true; } return st; };
  const orig=SLOT_ORDER.map(pickFromPool);
  const exos=orig.map(sub);
  const R=adj.rounds;
  for(let r=0;r<R;r++){
    exos.forEach((id,i)=>{
      steps.push(mark({k:'set',id:id,key:id,set:r+1,of:R,round:r+1},orig[i]));
      const last=(r===R-1&&i===exos.length-1);
      /* raccord = repos qui suit le dernier exercice d un tour. Aucun repos n
         est emis apres la derniere serie de la seance, donc rien n est ajoute
         apres le dernier tour : le raccord y perdrait son objet, aucun pousse
         ne suit. */
      if(!last) steps.push(restStep(i===exos.length-1,id,exos[0]));
    });
  }
  if(adj.cardio) steps.push(mark({k:'cardio',id:sub(CARDIO_ID)},CARDIO_ID));
  /* etirements de fin de seance : deux par seance en rotation sur les six.
     Comptes dans la duree annoncee depuis la v1.13 : ce nombre est un total,
     tout compris. */
  if(effStretch()){
    stretchesFor().forEach(id=>steps.push({k:'set',id:id,key:id,cool:true,set:1,of:1}));
  }
  /* emplacements dont l exercice prevu a ete remplace par un repli : ce sont
     eux, et eux seuls, dont la rotation gele apres une seance allegee (v1.13) */
  const subs={};
  SLOT_ORDER.forEach((s,i)=>{ if(exos[i]!==orig[i]) subs[s]=true; });
  /* next et nextKey sont poses ici et nulle part ailleurs, sur la liste
     complete : un repos annonce le pas de travail qui le suit reellement */
  relinkRests(steps);
  return {type:'alterne',exos:exos,orig:orig,light:light,steps:steps,subs:subs,
          warm:adj.warm,cardio:adj.cardio};
}
/* deux etirements par seance, la rotation couvre les six en trois seances */
function stretchesFor(){
  const n=STRETCH_PER_SESSION, i=(state.stretchIdx||0)%STRETCH_POOL.length, out=[];
  for(let k=0;k<n;k++) out.push(STRETCH_POOL[(i+k)%STRETCH_POOL.length]);
  return out;
}

/* ============ NAVIGATION ============ */
let view='home', cur=null, timers={};
/* Etat d ouverture des cards repliables (v1.14), releve juste avant chaque
   rendu et lu par les cards au moment ou elles s ecrivent. Memoire vive du
   rendu uniquement : les cles de l ancienne page ne correspondent a rien dans
   la nouvelle, donc l etat ne traverse pas un changement de vue, et rien n est
   ecrit dans la sauvegarde. Ferme reste le defaut a chaque arrivee sur un
   ecran, et la ligne fermee garde son role de resume. */
let openCards={};
/* Animation d apparition des cards : elle vaut pour une arrivee sur un ecran,
   pas pour un rafraichissement du meme ecran. Le rendu recreant tout le DOM a
   chaque bouton presse, l animation se rejouait sur toutes les cards a chaque
   clic, ce qui donnait l impression que la page se rafraichissait (v1.14).
   Chaque ecran annonce sa cle en entrant : identique a la precedente, on retire
   la classe et rien ne bouge ; differente, on la pose et l arrivee s anime. La
   classe vit sur le conteneur, qui n est jamais recree. En seance la cle porte
   le numero d etape : passer d une serie a la suivante est une arrivee, ajuster
   une charge sur la meme serie n en est pas une. */
let lastScreen=null;
function screenEnter(key){
  const el=$('#app');
  if(!el||!el.classList) return;
  if(key===lastScreen){ el.classList.remove('enter'); return; }
  lastScreen=key;
  el.classList.add('enter');
}
function clearTimers(){Object.values(timers).forEach(t=>clearInterval(t));timers={};}
/* historique navigateur : chaque vue pousse son hash, les fleches
   avant/arriere de la souris ou du navigateur pilotent le routeur */
function hashOK(){return typeof window!=='undefined'&&window.location&&typeof window.addEventListener==='function';}
let navLock=false;
function setHash(h){
  if(!hashOK()) return;
  if(window.location.hash==='#'+h) return;
  navLock=true;
  window.location.hash=h;
}
function go(v){clearTimers();if(v==='lib')libQ='';view=v;render();try{window.scrollTo(0,0);}catch(e){} setHash(v);}
const NAVI={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
 lib:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
 prog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 set:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>'
};
function renderNav(){
  if(view==='session'||view==='recap'){$('#nav').innerHTML='';return;}
  const items=[['home','Accueil'],['lib','Exercices'],['prog','Progrès'],['set','Réglages']];
  $('#nav').innerHTML=items.map(([v,l])=>'<button class="navbtn'+(view===v?' on':'')+'" onclick="go(\''+v+'\')">'+NAVI[v]+l+'</button>').join('');
}
function kbHint(){return '<div class="kb muted">Clavier : <b>Entrée</b> valider · <b>Espace</b> pause / départ · <b>+ −</b> ajuster · <b>↑ ↓</b> défiler · <b>Échap</b> quitter</div>';}

/* ============ ACCUEIL ============ */
/* Bandeau de profil (v2.0). Rien a l ecran tant qu on est chez soi : un
   bandeau permanent qui dirait « Domicile » serait du bruit quotidien pour une
   information qui ne varie jamais. Des qu on n y est plus, une ligne permanente
   porte le nom du profil et le bouton de retour, et une seconde ligne repliee
   nomme les schemas non servis. Le retour est a un geste, parce que l oubli de
   revenir est la panne la plus probable et la plus couteuse. */
function profilBanner(){
  if(!horsDomicile()) return '';
  const perdus=schemasPerdus(state.gear);
  return '<div class="card" style="background:var(--flame-soft);border-left:4px solid var(--flame)">'+
    '<div class="spread"><b>'+esc(profilNom())+'</b>'+
    '<button class="quiet" style="padding:6px 14px;font-size:.8rem" onclick="switchProfil(\'domicile\')">Retour domicile</button></div>'+
    (perdus.length
      ? '<details data-k="ban-perd"'+cardOpen('ban-perd',false)+'><summary class="muted small">'+
        perdus.length+' schéma'+(perdus.length>1?'s':'')+' non servi'+(perdus.length>1?'s':'')+'</summary>'+
        '<div class="chipline">'+perdus.map(n=>'<span class="chip off">'+esc(n)+'</span>').join('')+'</div></details>'
      : '<div class="muted small mt">Tous les schémas sont servis ici.</div>')+
  '</div>';
}
/* Bandeau d accueil (v2.0). Il etait conditionne a l historique vide depuis la
   v1.18 ; il l est desormais au drapeau d onboarding, pose par l etat neuf et
   retire par la validation de l inventaire. Deux consequences voulues : il ne
   revient pas si l historique est vide pour une autre raison, et un import de
   sauvegarde n a pas d onboarding, le drapeau n etant jamais cree par une
   migration.
   Il ne bloque rien : un inventaire vide sert deja les quatre groupes, la
   seance du jour est composee et lançable derriere le bandeau. */
function onboardBanner(){
  if(!state.onboard) return '';
  return '<div class="card" style="background:var(--accent-soft)"><b>Bienvenue.</b>'+
    '<div class="small" style="margin-top:6px">Choisis ton volume, l\'outil compose la séance et annonce le temps qu\'elle prendra. Tu saisis ce que tu fais réellement, il gère la progression en répétitions puis en charge. Rien à décider.</div>'+
    '<div class="small" style="margin-top:8px">Commence par dire ce que tu as sous la main : l\'outil ne prescrit que des exercices réalisables avec ton matériel.</div>'+
    '<button class="big mt" onclick="goMateriel()">Déclarer mon matériel</button></div>';
}
/* Rendu de « Comment ça marche ». Le meme texte a deux endroits, un seul
   rendu. ouvert=true deplie les trois developpements d office, c est la forme
   de Reglages ou l on vient expres lire ; sur l accueil ils sont replies, la
   promesse de cet ecran etant qu il n y a rien a lire pour lancer une seance.
   Les details portent une cle data-k, donc leur ouverture survit au re-rendu
   comme toutes les autres (v1.14). */
function commentHtml(ouvert){
  return COMMENT.map((b,i)=>
    '<span class="lead'+(i?' mt':'')+'">'+esc(b.t)+'</span>'+
    '<div>'+b.c+'</div>'+
    '<details data-k="cmt'+i+'"'+cardOpen('cmt'+i,!!ouvert)+'><summary>En savoir plus</summary>'+
    b.l.map(p=>'<div class="mt">'+p+'</div>').join('')+'</details>').join('');
}
/* Bloc d introduction de l accueil. Il se retire definitivement d un bouton,
   comme le bandeau de materiel : un texte constant affiche a chaque lancement
   devient du bruit, et l accueil promet qu il n y a rien a decider. Le drapeau
   est une valeur et non une absence (v2.3), pose a true par defaultState : une
   sauvegarde anterieure le recoit donc, et c est voulu, le texte est nouveau
   pour elle aussi. Reglages le garde en permanence pour le relire. */
function introCard(){
  if(state.intro===false) return '';
  return '<div class="card muted small">'+
    '<div class="spread"><b class="small">Comment ça marche</b></div>'+
    commentHtml(false)+
    '<button class="quiet mt" style="padding:8px 14px;font-size:.8rem" onclick="closeIntro()">J\'ai lu, retirer ce bloc</button>'+
    '<div class="muted small" style="margin-top:6px">Tu le retrouveras dans Réglages, en bas.</div></div>';
}
function closeIntro(){ state.intro=false; save(); render(); }
function renderHome(){
  screenEnter('home');
  carIdx=0;
  const li=lvlInfo(state.xp), wc=thisWeekCount(state), ws=weekStreak(state);
  const wk=prevWeekKey(0), wg=goalForWeek(state,wk), adj=wg<state.goal;
  const plan=buildSession();
  const parts=planParts(plan);
  const est=Math.round(parts.total/60);
  let dots='';for(let i=0;i<Math.max(wg,wc);i++)dots+='<i class="'+(i<wc?(i<wg?'on':'extra'):'')+'"></i>';
  const desc=plan.exos.map(id=>DB[id].nom).join(' · ');
  $('#app').innerHTML=
  '<div class="spread" style="margin-bottom:14px"><h1>Palier</h1><span class="tag">Niv. <span class="num">'+li.lvl+'</span> · '+rankOf(li.lvl)+'</span></div>'+
  onboardBanner()+
  introCard()+
  (!storageOK?'<div class="card vig">Sauvegarde indisponible dans cet environnement : la progression ne sera pas conservée.</div>':'')+
  profilBanner()+
  '<div class="card">'+
    '<div class="spread"><span class="tag">Séance alternée</span><span class="muted small">~'+est+' min</span></div>'+
    (lightMode?'<div class="tag flame mt">Séance allégée : variantes de repli et cibles réduites</div>':'')+
    '<div style="margin:10px 0 2px;font-weight:700">'+esc(desc)+'</div>'+
    '<div class="muted small">'+(workSteps(plan.steps).length/SLOT_ORDER.length)+' séries par exercice'+(plan.cardio?' + cardio':'')+(plan.steps.some(s=>s.cool)?' + étirements':'')+'</div>'+
    roundsSeg()+
    /* v2.24 : attente de la synchronisation, conflit ou version plus recente
       en ligne prennent la place du bouton */
    (syncLancement()||'<button class="big mt" onclick="startSession()">Lancer la séance</button>')+
    '<div class="seg mt">'+
    '<button class="'+(lightMode?'flamebtn':'quiet')+'" onclick="toggleLight()">Séance allégée'+(lightMode?' ✓':'')+'</button></div>'+
  '</div>'+
  /* v2.15 : l objectif hebdomadaire sous le lancement et avant le detail de
     seance, ouvert par defaut depuis la v1.10 et long de quatre exercices :
     mesure a 1 300 px du haut sur mobile, l instrument de l habitude etait le
     dernier a se lire. L ordre seul change, pas l ouverture du detail. */
  '<div class="card">'+
    '<div class="spread"><h3>Cette semaine</h3>'+(ws>0?'<span class="tag flame">🔥 '+ws+' sem.</span>':'')+'</div>'+
    '<div class="spread mt"><div class="week-dots">'+dots+'</div><span class="num" style="font-weight:700">'+wc+' / '+wg+'</span></div>'+
    '<div class="muted small" style="margin-top:8px">'+(wc>=wg?'Semaine validée. Le reste est du bonus.':'Encore '+(wg-wc)+' jour'+(wg-wc>1?'s':'')+' actif'+(wg-wc>1?'s':'')+' pour valider la semaine.')+'</div>'+
    (adj?'<div class="muted small" style="margin-top:4px">Semaine '+(state.hist.length&&isoWeek(new Date(state.hist[0].date))===wk?'de démarrage':'de reprise')+' : objectif ramené à '+wg+' au prorata des jours disponibles, au lieu de '+state.goal+'.</div>':'')+
  '</div>'+
  contentCard(plan,parts)+
  sessionDetailHtml(plan)+
  '<div class="card">'+
    '<div class="spread"><h3>Progression</h3><span class="muted small num">'+state.xp+' XP</span></div>'+
    '<div class="bar mt"><i style="width:'+li.pct+'%"></i></div>'+
    '<div class="muted small" style="margin-top:6px">Encore <span class="num">'+li.next+'</span> XP pour le niveau '+(li.lvl+1)+'</div>'+
  '</div>';
  renderNav();
  carFit();
  syncReprise();
}
/* Le bouton porte ce qu on controle : le nombre de series. Le temps calcule du
   jour se lit dessous, et il est vrai par construction (v1.13). */
function roundsSeg(){
  const cur0=effRounds();
  return '<div class="muted small mt">Volume de la séance</div>'+
    '<div class="seg roundseg" style="margin-top:6px">'+ROUNDS_CHOICES.map(r=>{
      const t=Math.round(estimateSec(planWith(r))/60);
      return '<button class="'+(cur0===r?'':'quiet')+'" onclick="setRounds('+r+')">'+
             '<b>'+r+' séries</b><span class="sub">~'+t+' min</span></button>';
    }).join('')+'</div>';
}
/* meme plan, autre nombre de series : sert a etiqueter les boutons sans
   toucher a l etat ni aux ajustements du jour */
function planWith(r){
  const keep=dayRounds; dayRounds=r;
  const p=buildSession();
  dayRounds=keep;
  return p;
}
/* La decomposition affiche chaque poste au dixieme de minute, et le total avec
   eux : arrondis a la minute, six lignes ne retombaient pas sur leur somme, et
   un total qui ne se retrouve pas est le defaut qui a fait tomber l ancien
   modele. L en-tete de seance et les boutons de volume gardent l arrondi. */
function fmtMin(sec){ return '~'+Math.round(sec/60)+' min'; }
/* v2.10 : les pauses de raccord sont exclues, elles ont leur propre ligne et
   leur propre duree. Ce compteur n a jamais servi qu au libelle n x t s. */
function nRest(plan){ return (plan.steps||[]).filter(s=>s.k==='rest'&&!s.pause).length; }
/* Contenu de la seance : ferme, l en-tete resume les options du jour ; ouvert,
   il donne la decomposition chiffree et les trois ajustements ponctuels.
   L accueil promet qu il n y a rien a decider pendant la seance : ces choix se
   font avant, comme la duree et la seance allegee. */
function contentCard(plan,parts){
  const WL={complet:'échauffement complet',court:'échauffement court',aucun:'sans échauffement'};
  const resume=[WL[plan.warm]||plan.warm,plan.cardio?'cardio':'sans cardio',effStretch()?'étirements':'sans étirements']
    .join(' · ');
  const row=(l,s,d)=>'<div class="spread" style="margin-top:4px"><span class="muted small">'+l+
    (d?' <span style="opacity:.7">'+d+'</span>':'')+'</span><span class="num small">'+(s?fmtDur(s):'—')+'</span></div>';
  const seg=(lbl,opts,f,val)=>'<div class="muted small mt">'+lbl+'</div><div class="seg" style="margin-top:4px">'+
    opts.map(o=>'<button class="'+(val===o[0]?'':'quiet')+'" onclick="'+f+'('+(typeof o[0]==='string'?"'"+o[0]+"'":o[0])+')">'+o[1]+'</button>').join('')+'</div>';
  return '<details class="card" data-k="home-contenu"'+cardOpen('home-contenu',false)+'><summary><span class="ttl">Contenu</span><span class="val">'+esc(resume)+'</span></summary>'+
    row('Exercices',parts.exos,plan.exos.length+' × '+effRounds()+' séries')+
    row('Transitions',parts.trans,nRest(plan)+' × '+transSec()+' s')+
    (parts.pause?row('Pause de tour',parts.pause,parts.nPause+' × '+PAUSE_TOUR+' s'):'')+
    (parts.remount?row('Remontage de charge',parts.remount,parts.nRemount+' × '+REMOUNT+' s'):'')+
    row('Échauffement',parts.warm)+
    row('Cardio',parts.cardio)+
    row('Étirements',parts.cool)+
    '<div class="spread" style="margin-top:8px;border-top:1px solid var(--line);padding-top:8px"><b>Total</b><b class="num">'+fmtDur(parts.total)+'</b></div>'+
    seg('Échauffement',[['complet','Complet'],['court','Court'],['aucun','Aucun']],'setDayWarm',plan.warm)+
    seg('Cardio',[[1,'Oui'],[0,'Non']],'setDayCardio',plan.cardio?1:0)+
    seg('Étirements',[[1,'Oui'],[0,'Non']],'setDayStretch',effStretch()?1:0)+
    '<div class="muted small mt">Ajustements pour aujourd\'hui seulement. Les valeurs par défaut se règlent dans Réglages.'+
    (dayTouched()?' <b>Modifié pour cette séance.</b>':'')+'</div>'+
  '</details>';
}
function setRounds(r){ dayRounds=(r===roundsOf(state))?null:r; render(); }
function setDayWarm(w){ dayWarm=(w===state.warm)?null:w; render(); }
function setDayCardio(v){ const b=!!v; dayCardio=(b===!!state.cardio)?null:b; render(); }
function setDayStretch(v){ const b=!!v; dayStretch=(b===(state.stretch!==false))?null:b; render(); }

