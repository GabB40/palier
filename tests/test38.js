// Lot v2.12, premier volet : journal enrichi.
//
// Trois champs de plus dans l entree d historique, et rien qui les lise. C est
// la propriete la plus importante de ce lot et la plus facile a perdre : ils
// s accumulent pour qu une decision puisse un jour se prendre sur des donnees,
// ils ne decident rien aujourd hui. Une suite qui verifierait seulement leur
// presence laisserait passer le jour ou un signal viendrait s y brancher en
// douce, d ou la section 7.
//
// Ce que la suite protege :
//   roundsPlan  les tours annonces au lancement, la ou rounds porte le realise
//   it.tgt      la cible visee ce jour-la, que rien ne permet de rejouer
//   it.secs     la duree de chaque serie, brute, de l arrivee a la validation
//   la parite stricte de secs avec sets, y compris sous repli douleur
//   l idempotence de l horodatage au re-rendu, et sa remise a zero au retour
//   la survie des trois champs a une correction de seance
//
// L horloge est figee et deplacable : sans cela une duree mesuree ne serait pas
// discriminable d un zero, et la suite ne prouverait rien.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.vider=()=>new Promise(r=>vraiTimeout(r,0));
global.SRC=raw;
/* Horloge figee et deplacable, reprise de test36 : la duree d une serie est un
   ecart entre deux instants, elle n est mesurable que si la suite tient les
   deux. */
const VraieDate=Date;
let T0=0;
global.figer=iso=>{ T0=new VraieDate(iso).getTime();
  function D(){ return arguments.length?new VraieDate(...arguments):new VraieDate(T0); }
  D.prototype=VraieDate.prototype; D.now=()=>T0; D.UTC=VraieDate.UTC; D.parse=VraieDate.parse;
  global.Date=D; };
global.avancer=sec=>{ T0+=sec*1000; };

const S=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 /* On joue le chemin reel de l application, jamais un cur fabrique : c est la
    lecon de la v2.3, une suite qui fabrique son sujet ne teste pas son
    appelant. duree, en secondes, est le temps passe sur l ecran de serie. */
 const jouer=(duree)=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   renderSession();                       /* l arrivee sur l ecran horodate */
   if(duree) avancer(duree);
   const e=DB[st.id];
   if(e.mode==='stretch'){ skipSet(); return true; }
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 const jouerTout=(duree)=>{ let n=0; while(cur&&!cur.recap&&jouer(duree)){ if(++n>400) err('boucle de seance non bornee'); } };
 /* joue la prochaine SERIE : jouer() avance aussi sur les transitions, donc
    l appeler n fois ne joue pas n series, et une section qui compte les series
    jouees doit passer par ici. */
 const jouerSerie=(duree)=>{ let n=0;
   while(cur&&!cur.recap&&cur.steps[cur.i]&&cur.steps[cur.i].k!=='set'){ nextStep(); if(++n>20) err('aucune serie atteinte'); }
   return jouer(duree); };
 const derniere=()=>state.hist[state.hist.length-1];

 // ================= 1. LES TROIS CHAMPS EXISTENT ET DISENT VRAI =================
 figer('2026-09-12T10:00:00');
 await neuf(3);
 startSession();
 /* cibles relevees juste apres la construction de seance, donc avant toute
    validation : c est exactement ce que it.tgt doit porter. Les lire apres la
    seance ne prouverait rien, la progression les ayant deplacees. */
 const avantT={};
 cur.steps.forEach(st=>{ if(st.k==='set'&&!st.cool) avantT[st.id]=perfFor(st.id,false).target; });
 jouerTout(20);
 await vider();
 const h1=derniere();
 if(!h1) err('aucune entree ecrite');
 if(h1.roundsPlan!==3) err('roundsPlan attendu 3, obtenu '+h1.roundsPlan);
 if(h1.rounds!==3) err('rounds realise attendu 3, obtenu '+h1.rounds);
 h1.items.forEach(it=>{
   const e=DB[it.id];
   if(e.mode==='stretch') return;
   if(it.tgt==null) err('cible du jour absente sur '+it.id);
   if(avantT[it.id]!=null&&it.tgt!==avantT[it.id]) err('la cible ecrite doit etre celle d avant seance sur '+it.id+' : '+it.tgt+' au lieu de '+avantT[it.id]);
   if(!Array.isArray(it.secs)) err('durees absentes sur '+it.id);
   if(it.secs.length!==it.sets.length) err('parite rompue sur '+it.id+' : '+it.secs.length+' durees pour '+it.sets.length+' series');
   it.secs.forEach(v=>{ if(v!==20) err('duree attendue 20 s sur '+it.id+', obtenu '+v); });
 });
 /* la cible ecrite est celle d AVANT progression : c est tout l interet du
    champ, la cible d apres est deja dans perf et se relit sans historique */
 console.log('champs OK : roundsPlan, cible du jour et durees par serie, 20 s mesurees sur '+h1.items.length+' exercices');

 // ================= 2. LA DUREE EST BRUTE =================
 /* Ni plancher ni ecretage, a la difference de real qui porte un Math.max(60).
    Une serie validee dans la seconde vaut zero, et une serie de vingt minutes
    vaut vingt minutes : nettoyer a l ecriture enfouirait un jugement dans la
    donnee. */
 figer('2026-09-12T11:00:00');
 await neuf(2);
 startSession();
 let premier=true;
 while(cur&&!cur.recap){ const st=cur.steps[cur.i]; if(!st) break;
   if(st.k==='set'&&premier){ premier=false; jouer(0); } else jouer(900); }
 await vider();
 const h2=derniere();
 const plat=[].concat.apply([],h2.items.map(it=>it.secs||[]));
 if(plat.indexOf(0)<0) err('une serie validee aussitot doit valoir 0, durees vues : '+plat.join(','));
 if(plat.indexOf(900)<0) err('une serie de 900 s doit valoir 900, durees vues : '+plat.join(','));
 if(h2.real<60) err('real garde son plancher, lui : '+h2.real);
 console.log('brut OK : zero conserve, 900 s conservees, le plancher reste au seul total de seance');

 // ================= 3. L HORODATAGE EST IDEMPOTENT =================
 /* Un re-rendu de la meme etape ne redemarre pas le compte. C est ce qui fait
    qu ajuster une charge, ouvrir une card ou changer de volume ne raccourcit
    pas la serie en cours. */
 figer('2026-09-12T12:00:00');
 await neuf(2);
 startSession();
 while(cur.steps[cur.i].k!=='set') nextStep();
 renderSession();
 avancer(30);
 renderSession(); renderSession();       /* deux re-rendus au milieu */
 avancer(30);
 {
   const st=cur.steps[cur.i], e=DB[st.id];
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else st.val=perfFor(st.id,false).target||8;
   const k=st.key||st.id;
   validateSet();
   if(cur.secs[k][0]!==60) err('le re-rendu a redemarre le compte : '+cur.secs[k][0]+' au lieu de 60');
 }
 console.log('idempotence OK : deux re-rendus au milieu d une serie ne touchent pas sa duree');

 // ================= 4. LE RETOUR D UN PAS DEFAIT LA DUREE =================
 /* Et la serie refaite repart d un horodatage neuf : sans la remise a zero,
    elle heriterait du temps de la premiere tentative. */
 {
   const st=cur.steps[cur.i-1]||cur.steps[cur.i];
   const k=st.key||st.id;
   const avant=(cur.secs[k]||[]).length;
   if(!cur.back) err('le retour d un pas doit etre offert apres une validation');
   stepBack();
   if((cur.secs[k]||[]).length!==avant-1) err('la duree ne se defait pas avec la serie');
   /* stepBack rend deja l ecran, donc l horodatage neuf est pose la : les
      douze secondes qui suivent sont bien celles de la reprise, et le rendu
      intercale ne les remet pas a zero. */
   avancer(5);
   renderSession();
   avancer(7);
   const st2=cur.steps[cur.i], e2=DB[st2.id];
   if(e2.mode==='time'){ holdInit(st2,e2); for(let i=0;i<st2.sides.length;i++) st2.sides[i]=30; } else if(e2.rhythm){ st2.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st2.done=true; if(!st2.val) st2.val=30; }
   else st2.val=perfFor(st2.id,false).target||8;
   validateSet();
   const v=cur.secs[k][cur.secs[k].length-1];
   if(v!==12) err('la serie refaite doit repartir d un horodatage neuf pose au retour, obtenu '+v);
 }
 console.log('retour OK : la duree se defait avec la serie, la reprise repart de zero');

 // ================= 5. VOLUME CHANGE EN COURS DE SEANCE =================
 /* roundsPlan garde ce qui a ete lance, rounds porte ce qui a ete fait. Et le
    tour ajoute ne recopie pas l horodatage de son modele, sans quoi ses series
    porteraient une duree calculee depuis le debut du tour precedent. */
 /* Le tour ajoute est clone du DERNIER tour, donc le lancement se fait a deux
    series et la montee a trois intervient une fois le second tour entame : le
    modele porte alors des etapes deja jouees, horodatage compris. Monter depuis
    un tour que rien n a encore touche ne discriminerait pas la recopie. */
 figer('2026-09-12T13:00:00');
 await neuf(2);
 startSession();
 jouerSerie(10); jouerSerie(10); jouerSerie(10); jouerSerie(10);   /* tour 1 */
 jouerSerie(10);                                                  /* premiere serie du tour 2 */
 if(volAllowed().indexOf(3)<0) err('le passage a 3 series doit etre offert');
 setSessionRounds(3);
 jouerTout(10);
 await vider();
 const h5=derniere();
 if(h5.roundsPlan!==2) err('roundsPlan doit rester 2, obtenu '+h5.roundsPlan);
 if(h5.rounds!==3) err('rounds realise attendu 3, obtenu '+h5.rounds);
 h5.items.forEach(it=>{ (it.secs||[]).forEach(v=>{ if(v!==10) err('duree polluee par le clonage de tour sur '+it.id+' : '+v); }); });
 /* descente aussi : 3 lances, 2 joues */
 figer('2026-09-12T14:00:00');
 await neuf(3);
 startSession();
 jouer(10);
 setSessionRounds(2);
 jouerTout(10);
 await vider();
 const h5b=derniere();
 if(h5b.roundsPlan!==3||h5b.rounds!==2) err('descente de volume : '+h5b.roundsPlan+' lances, '+h5b.rounds+' joues');
 console.log('volume OK : 2 lances et 3 joues depuis un tour entame, puis 3 lances et 2 joues, durees intactes');

 // ================= 6. REPLI DOUILEUR ET SERIE PASSEE =================
 /* La cle composee « origine>repli » porte ses propres durees, et une serie
    passee n ecrit rien : ni serie, ni duree, donc la parite tient sans garde. */
 figer('2026-09-12T15:00:00');
 await neuf(3);
 startSession();
 jouer(12);
 while(cur.steps[cur.i].k!=='set') nextStep();
 {
   const st=cur.steps[cur.i];
   if(DB[st.id].fb){ renderSession(); swapPain(); }
 }
 skipSet();
 jouerTout(12);
 await vider();
 const h6=derniere();
 h6.items.forEach(it=>{
   if(DB[it.id].mode==='stretch') return;
   if((it.secs||[]).length!==it.sets.length) err('parite rompue apres repli ou serie passee sur '+it.id);
 });
 if(!h6.items.some(it=>it.sw)) err('aucun repli observe, la section ne prouve rien');
 console.log('parite OK : repli douleur et serie passee, durees et series toujours au meme compte');

 // ================= 7. AUCUN SIGNAL NE LES LIT =================
 /* Informatifs, jamais decisionnels. Le moteur de progression, les verrous et
    le predicat de montee ne doivent contenir aucune lecture des trois champs :
    c est la condition pour qu ils respectent le principe d architecture, et
    c est ce qui se perdra en premier si personne ne le tient. */
 [['applyProgress',applyProgress],['checkUnlocks',checkUnlocks],['estMontee',estMontee],['lightPerf',lightPerf],['perfFor',perfFor]]
   .forEach(([nom,f])=>{
     const s=f.toString();
     if(/\\bsecs\\b/.test(s)) err(nom+' lit les durees par serie : un signal decisionnel s est branche dessus');
     if(/\\btgt\\b/.test(s)) err(nom+' lit la cible du jour');
     if(/roundsPlan/.test(s)) err(nom+' lit les tours prevus');
   });
 /* et rien nulle part ne les compare a un seuil */
 if(/secs[^;]{0,40}[<>]=?\\s*\\d/.test(SRC)) err('une comparaison a seuil sur les durees existe dans la source');
 console.log('inertie OK : progression, verrous et predicat de montee ignorent les trois champs');

 // ================= 8. SURVIE A UNE CORRECTION =================
 /* La correction ne reecrit que sets. Les trois champs doivent la traverser
    intacts, comme load, band et rng avant eux. */
 figer('2026-09-12T16:00:00');
 await neuf(3);
 startSession();
 jouerTout(25);
 await vider();
 const avant=JSON.parse(JSON.stringify(derniere()));
 const vals={};
 state.undo.keys.forEach((k,i)=>{ vals[k]=avant.items[i].sets.map(v=>Math.max(1,v-1)); });
 corrigerSeance(vals);
 const apres=derniere();
 if(apres.roundsPlan!==avant.roundsPlan) err('roundsPlan perdu a la correction');
 apres.items.forEach((it,i)=>{
   if(it.tgt!==avant.items[i].tgt) err('cible du jour perdue a la correction sur '+it.id);
   if(JSON.stringify(it.secs)!==JSON.stringify(avant.items[i].secs)) err('durees perdues a la correction sur '+it.id);
   if(JSON.stringify(it.sets)===JSON.stringify(avant.items[i].sets)) err('la correction n a rien corrige sur '+it.id);
 });
 console.log('correction OK : series corrigees, cible du jour et durees intactes');

 console.log('TESTS JOURNAL ENRICHI V2.12 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
