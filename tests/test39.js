// Lot v2.12, second volet : la dette v1.15 et le texte « Comment ca marche ».
//
// Quatre correctifs et un texte, reunis parce qu ils touchent les memes deux
// fonctions, corrigerSeance et checkUnlocks.
//
//   1. le verrou a porte de bande lit le dernier passage, plus un maximum
//      historique, et le barreau qu il compare est celui ECRIT AVEC les series
//   2. une correction de seance ne detruit plus en silence un geste manuel
//      posterieur, et elle annonce ce qu elle defait
//   3. le detail de seance affiche la charge courante sur les exercices a
//      charge fixe, pas la charge de depart du catalogue
//   4. le texte est a deux endroits et n a qu un seul rendu
//
// Le piege que la section 1 protege est celui que la remise a zero de bandBest
// fermait par effet de bord : une seance jouee au barreau precedent peut faire
// monter la bande en fin de seance, et lire le barreau COURANT attribuerait
// alors les repetitions a un barreau sous lequel elles n ont pas ete faites.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const cards={};
function rebuild(h){
  Object.keys(cards).forEach(k=>delete cards[k]);
  const re=/<details([^>]*)>/g; let m;
  while((m=re.exec(h))!==null){
    const attrs=m[1], k=/data-k="([^"]+)"/.exec(attrs);
    if(!k) continue;
    cards[k[1]]={key:k[1],open:/\sopen(\s|>|$)/.test(attrs+' '),getAttribute(n){return n==='data-k'?this.key:null}};
  }
}
const mk=cap=>({set innerHTML(v){if(cap){html=v;rebuild(v);}},get innerHTML(){return cap?html:''},
  classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>Object.keys(cards).map(k=>cards[k]),
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.vider=()=>new Promise(r=>vraiTimeout(r,0));
global.SRC=raw;

const S=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 const jouer=()=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   renderSession();
   const e=DB[st.id];
   if(e.mode==='stretch'){ skipSet(); return true; }
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=40; } else if(e.rhythm){ st.rt={d:40,g:40,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=40; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 const jouerTout=()=>{ let n=0; while(cur&&!cur.recap&&jouer()){ if(++n>400) err('boucle de seance non bornee'); } };
 const SUP='tractions-assistees-supination', STR='tractions-strictes-supination';

 // ================= 1. LE VERROU LIT LE DERNIER PASSAGE =================
 /* E1, le piege. Le passage est joue au barreau qui precede le plus fin, avec
    assez de repetitions pour faire monter la bande. A la fin, p.band vaut le
    barreau le plus fin et p.sets contient dix repetitions : lire le barreau
    courant ouvrirait la porte sur des repetitions faites sous une bande plus
    forte. */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1], avant=L[L.length-2];
   const p=perfOf(SUP); p.band=avant; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,10,10],true,false,false);
   if(p.band!==fin) err('E1 : la seance doit faire monter au barreau le plus fin, obtenu '+p.band);
   if(p.setsBand!==avant) err('E1 : le barreau ecrit doit etre celui sous lequel les series ont ete jouees, obtenu '+p.setsBand);
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('E1 : dix repetitions au barreau precedent ne doivent pas ouvrir les strictes');
 }
 /* nominal : le meme compte, joue au barreau le plus fin, ouvre */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,8,8],true,false,false);
   if(p.setsBand!==fin) err('nominal : barreau joue attendu '+fin+', obtenu '+p.setsBand);
   checkUnlocks(3,false);
   if(!state.unlocked[STR]) err('nominal : dix repetitions au barreau le plus fin doivent ouvrir les strictes');
 }
 /* etat herite : sans barreau enregistre, le verrou attend le prochain passage
    plutot que de deviner. Une valeur reconstituee vaudrait moins que son
    absence (meme motif qu it.rng en v2.4). */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.sets=[10,10,10]; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   delete p.setsBand;
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('herite : sans barreau enregistre, le verrou ne doit pas s ouvrir');
   applyProgress(SUP,[10,10,10],true,false,false);
   checkUnlocks(3,false);
   if(!state.unlocked[STR]) err('herite : le passage suivant doit rouvrir le chemin');
 }
 /* un record ancien ne prouve rien non plus : la lecture porte sur le dernier
    passage, et c est le sens meme de l alignement. Sans ce cas, une regression
    vers p.best passerait, les deux valeurs coincidant dans le cas nominal. */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,10,10],true,false,false);   /* le record est pose */
   state.unlocked={};
   applyProgress(SUP,[4,4,4],true,false,false);      /* le dernier passage est faible */
   if(p.best<10) err('le record doit avoir ete conserve, sinon le cas ne discrimine rien');
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('un record ancien ne doit pas ouvrir le verrou : la lecture porte sur le dernier passage');
 }
 /* une seance allegee ne prouve rien, la garde de provenance vaut aussi ici */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,10,10],true,true,false);
   if(p.setsBand!==fin) err('allegee : le barreau joue est une information, il doit s ecrire');
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('allegee : le verrou ne doit pas s ouvrir');
 }
 console.log('verrou OK : barreau precedent refuse, barreau le plus fin accepte, etat herite en attente, allegee sans effet');

 // ================= 2. UNE SEULE LECTURE DE REPETITIONS =================
 /* La branche bandGate a fondu dans la lecture commune : le comptage de series
    n existe qu a un seul endroit, les deux conditions de niveau, barreau et
    charge, s y ajoutent en conjonction. Deux comptages separes, c est deux
    regles qui divergeront. */
 /* les commentaires sont retires avant de chercher : ils NOMMENT bandBest,
    exprès, pour dire ce que la v2.12 a retire et pourquoi. Chercher dans le
    texte brut ferait tomber la suite sur sa propre documentation. */
 const sansCom=s=>s.replace(/\\/\\*[\\s\\S]*?\\*\\//g,' ').replace(/(^|[^:])\\/\\/[^\\n]*/g,'$1 ');
 {
   const s=sansCom(checkUnlocks.toString());
   const n=(s.match(/lock\\.need/g)||[]).length;
   if(n!==1) err('le compte de repetitions doit etre lu une seule fois dans checkUnlocks, trouve '+n);
   if(/bandBest/.test(s)) err('bandBest subsiste dans checkUnlocks');
   if(!/setsBand/.test(s)) err('la conjonction sur le barreau joue a disparu');
 }
 {
   const code=sansCom(SRC).replace(/delete q\\.bandBest;/,'');
   if(/bandBest/.test(code)) err('bandBest subsiste ailleurs que dans la migration');
 }
 /* la migration retire la cle morte des etats herites */
 {
   const s={v:2,perf:{'face-pulls':{load:0,range:[10,18],target:12,best:9,sets:[9,9,9],band:'rouge',bandBest:9}},gear:JSON.parse(JSON.stringify(DEFAULT_GEAR))};
   const m=migrateState(JSON.parse(JSON.stringify(s)),s);
   if('bandBest' in m.perf['face-pulls']) err('la migration doit retirer la cle morte');
 }
 console.log('lecture OK : un seul comptage, une conjonction de barreau, cle morte retiree a la migration');

 // ================= 3. LA CORRECTION PRESERVE ET ANNONCE =================
 /* Le geste manuel posterieur a la seance n est pas une consequence de la
    seance : la restauration l effacait sans un mot. */
 await neuf();
 startSession();
 jouerTout();
 await vider();
 {
   const cible=state.undo.keys.map(k=>splitKey(k).id).filter(id=>DB[id].reps&&DB[id].mode!=='stretch')[0];
   if(!cible) err('aucun exercice tenable dans la seance');
   setHold(cible,true);
   const vals={};
   state.undo.keys.forEach((k,i)=>{ vals[k]=state.hist[state.hist.length-1].items[i].sets.map(v=>Math.max(1,v-2)); });
   const r=corrigerSeance(vals);
   if(!isHeld(cible)) err('un palier tenu pose apres la seance doit survivre a la correction');
   if(!r) err('la correction doit rendre un recapitulatif');
 }
 /* ce qu elle defait, elle le dit, et dans un bloc a part */
 await neuf();
 {
   const id='curls-halteres';
   const p=perfOf(id); p.range=DB[id].reps.slice(); p.target=DB[id].reps[1]; p.load=4;
   startSession();
   /* on force le quatuor a contenir l exercice vise en jouant directement le
      moteur de fin de seance : la seance tiree ne le contient pas forcement */
   /* la valeur saisie est remise a zero avec l identifiant : startSession a
      deja rendu le premier ecran, donc st.val porte la cible de l exercice
      d origine et survivrait a la substitution. */
   cur.steps.forEach(s=>{ if(s.k==='set'&&!s.cool){ s.id=id; s.key=id; s.val=null; } });
   jouerTout();
   await vider();
   const h=state.hist[state.hist.length-1];
   const monte=state.perf[id].load>4;
   if(!monte) err('la seance de reference doit produire une montee de charge, load='+state.perf[id].load);
   const vals={}; state.undo.keys.forEach((k,i)=>{ vals[k]=h.items[i].sets.map(()=>DB[id].reps[0]); });
   const r=corrigerSeance(vals);
   if(state.perf[id].load!==4) err('la correction doit ramener la charge');
   if(!r.undone||!r.undone.length) err('une montee defaite doit etre annoncee');
   if(!r.undone.some(m=>/Montée annulée/.test(m))) err('le message d annulation doit nommer ce qu il defait : '+r.undone.join(' | '));
   if(r.msgs.some(m=>/annulée/i.test(m))) err('une annulation ne doit pas etre melangee aux messages de progression');
   const bloc=undoneHtml(r.undone);
   if(bloc.indexOf('tag flame')<0) err('le bloc d annulation doit se distinguer des messages de progression');
   if(undoneHtml([])!=='') err('sans annulation, aucun bloc ne doit etre rendu');
 }
 console.log('correction OK : palier tenu preserve, montee defaite annoncee a part, rien a dire quand rien n est defait');

 // ================= 4. CHARGE COURANTE DANS LE DETAIL DE SEANCE =================
 /* Le mode fixe lisait e.load0, la charge de depart du catalogue. */
 await neuf();
 {
   const id='goblet-squat';
   const L=fixedLadder(id,state.gear);
   if(L.length<2) err('l echelle du goblet squat doit avoir plusieurs barreaux');
   const p=perfOf(id); p.load=L[1].v;
   /* le libelle du bas de ligne est lu en entier : « KB 10 kg » est un prefixe
      de « KB 10 kg + lestes 2 kg », donc une recherche par sous-chaine ne
      discriminerait rien. Meme piege que l accord de genre en v2.10. */
   const basDe=h=>{ const m=/<br>([^<]*)<\\/span>/.exec(h); return m?m[1]:null; };
   if(basDe(exoRowHtml(id))!==esc(L[1].lbl)) err('le detail doit afficher la charge courante, obtenu « '+basDe(exoRowHtml(id))+' »');
   /* et la charge de depart reste affichee quand elle EST la charge courante */
   p.load=L[0].v;
   if(basDe(exoRowHtml(id))!==esc(L[0].lbl)) err('la charge de depart doit s afficher quand elle est courante');
 }
 console.log('charge OK : le detail de seance suit la progression sur les exercices a charge fixe');

 // ================= 5. LE TEXTE, DEUX ENDROITS, UN SEUL RENDU =================
 await neuf();
 /* v2.14 : le compte de blocs n est plus epingle, une assertion qui epingle
    une valeur est fausse en meme temps que le code (v1.15). La forme, si :
    chaque bloc porte un titre, une accroche et au moins un developpement. */
 if(COMMENT.length<3) err('au moins trois blocs attendus, '+COMMENT.length);
 COMMENT.forEach((b,i)=>{ if(!b.t||!b.c||!b.l||!b.l.length) err('bloc '+i+' incomplet'); });
 {
   /* l accueil le porte tant qu il n a pas ete lu, et le bouton le retire */
   state.intro=true; view='home'; render();
   const acc=html;
   if(acc.indexOf(COMMENT[0].t)<0) err('le bloc d introduction doit etre sur l accueil');
   if(acc.indexOf('En savoir plus')<0) err('le developpement doit etre offert sur place');
   if(/data-k="cmt0"[^>]*open/.test(acc)) err('sur l accueil les developpements sont replies');
   closeIntro();
   if(html.indexOf(COMMENT[0].t)>=0) err('le bouton doit retirer le bloc');
   if(state.intro!==false) err('le drapeau doit etre une valeur, pas une absence');
   /* et il ne revient pas au rechargement */
   save(); state=null; await loadState();
   if(state.intro!==false) err('le retrait doit survivre au rechargement');
 }
 {
   view='set'; render();
   const reg=html;
   COMMENT.forEach(b=>{ if(reg.indexOf(b.t)<0) err('Reglages doit porter le bloc « '+b.t+' »'); });
   if(!/data-k="cmt0"[^>]*open/.test(reg)) err('dans Reglages les developpements sont deplies d office');
   if(reg.indexOf(COMMENT[0].l[0])<0) err('le developpement complet doit etre present dans Reglages');
 }
 /* un seul chemin de rendu : deux copies du texte divergeraient */
 if((SRC.match(/const COMMENT=/g)||[]).length!==1) err('le texte doit avoir une seule source');
 if((SRC.match(/function commentHtml/g)||[]).length!==1) err('le rendu doit avoir un seul chemin');
 console.log('texte OK : replie sur l accueil, deplie dans Reglages, une source et un rendu');

 // ================= 6. LE CRITERE DE FIN DE SERIE SUR LES FICHES =================
 /* Sept fiches portent le critere specifique, toutes portent la regle generale
    et le lien. Le compte est verifie : une fiche qui perdrait son champ ne se
    verrait pas autrement. */
 {
   const avec=Object.keys(DB).filter(id=>DB[id].fin);
   /* v2.13 : cinq fiches de plus, l escalier du pont fessier et le pont au sol
      lui-meme, qui portait deja le meme signal sans le nommer. Le texte de
      Comment ca marche ne liste plus les fiches une par une depuis ce lot : la
      liste nominative devenait fausse a chaque ajout sans que rien ne le
      signale, elle a ete remplacee par un renvoi a la ligne de la fiche. */
   /* v2.18 : quinze, les deux fiches de l escalier du squat */
   /* v2.19 : seize, le gainage lateral avec abductions */
   if(avec.length!==16) err('seize fiches attendues avec un critere propre, obtenu '+avec.length+' : '+avec.join(','));
   ['pompes-poignees','planche','gainage-lateral','dead-bug','pallof-press','elevations-laterales','tractions-assistees-supination','tractions-assistees-pronation',
    'pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste',
    'squat-une-jambe-chaise','squat-une-jambe-chaise-leste','gainage-lateral-jambe-levee']
     .forEach(id=>{ if(!DB[id]||!DB[id].fin) err('critere de fin de serie absent sur '+id); });
   const l=finLineHtml('pompes-poignees');
   if(l.indexOf('affaissement du bassin')<0) err('le critere des pompes doit nommer l affaissement du bassin');
   if(l.indexOf('goComment')<0) err('la fiche doit mener au texte complet');
   const g=finLineHtml('face-pulls');
   if(g.indexOf('plus le même exercice')<0) err('une fiche sans critere propre doit porter la regle generale');
   if(g.indexOf('Fin de série')>=0) err('une fiche sans critere propre ne doit pas annoncer un critere propre');
 }
 console.log('fiches OK : treize criteres propres, la regle generale et le lien partout');

 console.log('TESTS DETTE V1.15 ET COMMENT CA MARCHE V2.12 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
