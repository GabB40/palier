/* test40 : lot v2.13. Escalier du pont fessier. Plafond ramene au haut de
   fourchette et ecretage des fourchettes heritees, echelle de la charge posee
   sur les hanches et son plafond constant, chaine de quatre verrous dont un
   lit la charge, invariant de vivier a cinq entrees tirables dans les cinq
   etats, reindexation de SUBS.legs apres insertion, replis vers le pont au sol,
   criteres de fin de serie et texte « Comment ca marche ». */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' != '+JSON.stringify(b)); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const neuf=async()=>{ localStorage._m={}; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const CH=['pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'];

 /* ---------- 1. le plafond vaut le haut de fourchette ---------- */
 /* meme defaut que les mollets debout avant la v2.5 : cap a 25 pour une
    fourchette 10-20 fabriquait cinq relevements que rien n annoncait */
 await neuf();
 if('cap' in DB['pont-fessier']) err('v2.16 : plus de champ cap, le plafond est le haut de fourchette');
 if(DB['pont-fessier-une-jambe'].reps[1]!==15||DB['hip-thrust-une-jambe'].reps[1]!==15) err('les deux echelons au poids du corps unilateraux plafonnent a 15');
 const E=echelleOf('pont-fessier');
 if(E.lbl.length!==1) err('une seule marche attendue, '+E.lbl.length);
 const p=perfOf('pont-fessier'); p.target=20;
 const msgs=applyProgress('pont-fessier',[20,20,20],true,false,false);
 eq(perfOf('pont-fessier').range,[10,20],'la fourchette ne doit pas bouger au plafond');
 if(!msgs.some(m=>/Plafond atteint/.test(m))) err('le plafond doit etre annonce');
 console.log('plafond OK : une seule marche, aucune fourchette relevee, marche suivante annoncee');

 /* ---------- 2. ecretage des fourchettes heritees ---------- */
 await neuf();
 const vieux={v:2,rounds:3,perf:{
   'pont-fessier':{load:0,range:[11,21],target:21,best:21,sets:[21,21,21],date:'2026-09-01T10:00:00.000Z'},
   'mollets-debout':{load:0,range:[12,25],target:20,best:20,sets:[],date:null}}};
 const m=migrateState(g(vieux));
 eq(m.perf['pont-fessier'].range,[10,20],'fourchette heritee ecretee');
 if(m.perf['pont-fessier'].target!==20) err('cible heritee ecretee, '+m.perf['pont-fessier'].target);
 if(m.perf['pont-fessier'].best!==21) err('le maximum historique n est pas reecrit');
 eq(m.perf['mollets-debout'].range,[12,25],'une fourchette deja conforme n est pas touchee');
 const deux=migrateState(g(m));
 if(JSON.stringify(deux.perf)!==JSON.stringify(m.perf)) err('migration non idempotente');
 state.perf['pont-fessier']=g(m.perf['pont-fessier']);
 if(echelleOf('pont-fessier').i<0) err('position perdue sur l echelle apres migration');
 state.perf['pont-fessier'].range=[11,21];
 if(echelleOf('pont-fessier').i>=0) err('temoin : sans ecretage la position doit etre introuvable');
 console.log('migration OK : 11-21 ramene a 10-20, position retrouvee, idempotente');

 /* ---------- 3. echelle de la charge sur les hanches ---------- */
 await neuf();
 if(PAS_HANCHES!==10) err('pas attendu a 10 kg');
 if(CAP_HANCHES!==20) err('plafond attendu a 20 kg');
 eq(HANCHES_EX,['pont-fessier-leste','hip-thrust-une-jambe-leste'],'les deux fiches a charge sur les hanches');
 HANCHES_EX.forEach(id=>{ eq(fixedLadder(id,state.gear).map(x=>x.v),[10,20],'echelle des hanches de '+id); });
 /* l inventaire borne toujours par le bas : le plafond ne fabrique pas de
    barreau que la masse declaree ne porte pas */
 const kbSeule={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{},kbs:{'10':1},res:{kb:1}};
 const lestesSeuls={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{'1':1,'2':1},kbs:{},res:{cuff:1}};
 eq(fixedLadder('pont-fessier-leste',kbSeule).map(x=>x.v),[10],'inventaire pauvre : un seul barreau');
 eq(fixedLadder('pont-fessier-leste',lestesSeuls).map(x=>x.v),[],'sous le pas : echelle vide');
 /* le plafond ne passe pas par fixedCap : checkUnlocks lit le dernier barreau
    de fixedLadder sans appliquer le plafond, le verrou serait inatteignable */
 if(fixedCap('pont-fessier-leste')!==null) err('aucun fixedCap sur les hanches');
 if(fixedCap('hip-thrust-une-jambe-leste')!==null) err('aucun fixedCap sur le dernier echelon');
 /* la masse complete vaut 47 kg et l echelle du sac les expose tous : c est
    bien le plafond, et non l inventaire, qui arrete celle des hanches a 20 */
 if(masseMobilisable(state.gear)!==47) err('masse de reference attendue a 47 kg');
 eq(fixedLadder('mollets-debout-leste',state.gear).map(x=>x.v),[10,20,30,40],'l echelle du sac reste entiere');
 if(fixedLadder('pont-fessier-leste',state.gear)[0].lbl.indexOf('sur les hanches')<0) err('libelle des hanches attendu');
 if(fixedLadder('goblet-squat',state.gear)[0].lbl.indexOf('KB')<0) err('la branche kettlebell doit rester intacte');
 console.log('echelle OK : 10/20 sous plafond constant, bornee par la masse, sac et kettlebells intacts');

 /* ---------- 4. chaine des quatre verrous ---------- */
 await neuf();
 for(let i=1;i<CH.length;i++){
   const l=DB[CH[i]].lock;
   if(!l||l.after!==CH[i-1]) err(CH[i]+' doit se verrouiller derriere '+CH[i-1]);
   if(l.minSets!==2) err('verrou a deux series sur '+CH[i]);
   if(DB[CH[i]].retire!==CH[i-1]) err(CH[i]+' doit retirer '+CH[i-1]);
 }
 if(DB['pont-fessier'].lock) err('la base de la chaine ne se verrouille pas');
 if(DB['pont-fessier-leste'].lock.need!==DB['pont-fessier'].reps[1]) err('le premier verrou vaut le plafond du predecesseur, son haut de fourchette');
 if(DB['hip-thrust-une-jambe'].lock.need!==DB['pont-fessier-une-jambe'].reps[1]) err('le verrou du hip thrust vaut le plafond du pont une jambe');
 if(DB['hip-thrust-une-jambe-leste'].lock.need!==DB['hip-thrust-une-jambe'].reps[1]) err('idem sur le dernier echelon');
 if(DB['pont-fessier-une-jambe'].lock.loadTop!==true) err('le verrou du pont une jambe doit lire la charge');
 if(DB['hip-thrust-une-jambe'].lock.loadTop) err('aucune condition de charge sur un predecesseur au poids du corps');

 /* ---------- 5. la condition de charge mord ---------- */
 /* temoin qui compte : 20 repetitions au premier barreau ne doivent pas ouvrir
    la version sur une jambe, sinon le barreau 20 ne serait jamais joue */
 await neuf();
 state.unlocked['pont-fessier-leste']=true;
 const L=fixedLadder('pont-fessier-leste',state.gear);
 /* v2.18 : la charge jouee s ecrit avec les series, p.setsLoad */
 const met=(charge,sets)=>{ const q=perfOf('pont-fessier-leste'); q.load=charge; q.setsLoad=charge; q.sets=sets.slice();
   delete state.unlocked['pont-fessier-une-jambe']; return checkUnlocks(3,false); };
 met(10,[20,20,20]);
 if(state.unlocked['pont-fessier-une-jambe']) err('verrou ouvert au premier barreau : la condition de charge ne mord pas');
 /* le pont leste se joue en trois series et le verrou en exige deux : le
    temoin doit donc n en laisser qu une au compte, sinon il ouvre a bon droit */
 met(L[L.length-1].v,[19,19,20]);
 if(state.unlocked['pont-fessier-une-jambe']) err('la condition de repetitions doit continuer de valoir au dernier barreau');
 const ms=met(L[L.length-1].v,[20,20,20]);
 if(!state.unlocked['pont-fessier-une-jambe']) err('verrou ferme au dernier barreau avec les repetitions');
 if(!ms.length) err('le deblocage doit etre annonce');
 console.log('verrou charge OK : ferme a 10 kg, ouvert a 20 kg, sur les memes 20 repetitions');

 /* ---------- 6. un inventaire pauvre n est pas enferme ---------- */
 await neuf();
 state.gear=g(kbSeule); syncProfil();
 state.unlocked['pont-fessier-leste']=true;
 const q2=perfOf('pont-fessier-leste'); q2.load=10; q2.setsLoad=10; q2.sets=[20,20,20];
 checkUnlocks(3,false);
 if(!state.unlocked['pont-fessier-une-jambe']) err('un inventaire a 10 kg doit pouvoir ouvrir un exercice au poids du corps');
 console.log('inventaire OK : le dernier barreau se lit sur l echelle filtree, 10 kg ouvrent');

 /* ---------- 7. vivier a cinq entrees tirables dans les cinq etats ---------- */
 await neuf();
 const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
 if(SLOTS.legs.pool.length!==17) err('vivier de reference a 17 entrees, '+SLOTS.legs.pool.length);   /* v2.18 : escalier du squat */
 const tailles=[];
 for(let i=0;i<CH.length;i++){
   const t=tir();
   if(t.indexOf(CH[i])<0) err('etat '+i+' : '+CH[i]+' doit etre tirable');
   CH.forEach((c,j)=>{ if(j!==i&&t.indexOf(c)>=0) err('etat '+i+' : '+c+' ne doit pas etre tirable en meme temps'); });
   tailles.push(t.length);
   if(i+1<CH.length) state.unlocked[CH[i+1]]=true;
 }
 if(new Set(tailles).size!==1) err('la taille du vivier tirable doit etre stable : '+tailles.join(','));
 if(tailles[0]!==5) err('cinq entrees tirables attendues, '+tailles[0]);
 if(SCHEMA.legs.length!==SLOTS.legs.pool.length) err('schema moteur desaligne du vivier');
 /* le dephasage v2.8 lit le nombre de positions TIRABLES et non la taille du
    vivier : l insertion de quatre fiches verrouillees ne le touche pas */
 if(SLOT_PHASE.legs!==3) err('constante de dephasage des jambes modifiee');
 console.log('vivier OK : cinq entrees tirables dans les cinq etats, schema aligne, dephasage intact');

 /* ---------- 8. SUBS.legs reindexe apres insertion ---------- */
 /* quatre insertions apres l index 3 decalent tout ce qui suit : une cle restee
    sur son ancien rang ferait replier les mollets lestes sur un step-up */
 await neuf();
 /* v2.18 : deux insertions de plus apres l index 0, cles decalees de deux,
    et une cle nouvelle, le squat sur une jambe leste replie sur sa version au
    poids du corps */
 const att={6:'pont-fessier-leste',9:'hip-thrust-une-jambe-leste',11:'mollets-debout-leste',
            13:'mollets-une-jambe-leste',14:'step-ups',15:'rdl-kettlebell',0:'goblet-squat',4:'fentes-arriere-lestee',
            2:'squat-une-jambe-chaise-leste'};
 Object.keys(SUBS.legs).forEach(k=>{
   const id=SLOTS.legs.pool[+k];
   if(att[k]!==id) err('SUBS.legs['+k+'] vise '+id+', attendu '+att[k]);
   SUBS.legs[k].forEach(s=>{ if(!DB[s]) err('substitut inconnu : '+s); });
 });
 const kP=SLOTS.legs.pool.indexOf('pont-fessier-leste'), kH=SLOTS.legs.pool.indexOf('hip-thrust-une-jambe-leste');
 if(!SUBS.legs[kP]||SUBS.legs[kP][0]!=='pont-fessier') err('le pont leste doit se replier sur le pont au sol');
 if(!SUBS.legs[kH]||SUBS.legs[kH][0]!=='hip-thrust-une-jambe') err('le hip thrust leste doit se replier sur sa version au poids du corps');
 /* et la chaine materielle sert la position sans masse declaree */
 const iB=SLOTS.legs.pool.indexOf('pont-fessier-leste');
 if(resolvePos('legs',iB,state.gear)!=='pont-fessier-leste') err('avec du poids, la position sert la variante chargee');
 const sansMasse=g(DEFAULT_GEAR); sansMasse.res.hal=0; sansMasse.res.kb=0; sansMasse.res.cuff=0;
 state.gear=sansMasse; syncProfil();
 if(aRes('masse',state.gear)) err('temoin : plus aucune masse declaree');
 if(resolvePos('legs',iB,state.gear)!=='pont-fessier') err('sans poids, la chaine descend vers le poids du corps');
 eq(NEEDS['pont-fessier-leste'],['masse'],'besoin du pont leste');
 eq(NEEDS['hip-thrust-une-jambe-leste'],['masse'],'besoin du hip thrust leste');
 if(NEEDS['pont-fessier-une-jambe']||NEEDS['hip-thrust-une-jambe']) err('les echelons au poids du corps ne declarent aucun besoin');
 console.log('substitution OK : huit cles reindexees, chaine vers le poids du corps, contrats materiels justes');

 /* ---------- 9. replis, jamais vers un exercice verrouillable ---------- */
 await neuf();
 CH.slice(1).forEach(id=>{
   const f=DB[id].fb;
   if(!f) err(id+' doit porter un repli');
   if(f!=='pont-fessier') err('repli attendu vers le pont au sol sur '+id+', obtenu '+f);
   if(DB[f].lock) err('repli verrouillable sur '+id+' : '+f);
 });
 if(DB['pont-fessier'].fb) err('la base de la chaine n a pas de repli au-dessous');
 console.log('replis OK : les quatre echelons replient sur la base, qui n est jamais verrouillee');

 /* ---------- 10. forme des fiches, cout de seance, illustrations ---------- */
 await neuf();
 CH.forEach(id=>{
   if(!DB[id].fin) err('critere de fin de serie absent sur '+id);
   if(!DB[id].nom||!DB[id].en||!DB[id].mus) err('fiche incomplete : '+id);
   if(!DB[id].desc||DB[id].desc.length<3) err('execution en moins de trois points : '+id);
   if(!DB[id].vig) err('ligne de vigilance absente : '+id);
   if(typeof IMG!=='undefined'&&!IMG[id]) err('illustration absente : '+id);
   if(tempoOf(id)!==TEMPO) err('tempo par defaut attendu sur '+id);
   if(NEXT[id]===undefined) err('marche suivante non ecrite : '+id);
 });
 ['pont-fessier-leste','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'].forEach(id=>{
   if(!DB[id].mat||!DB[id].mat.length) err('materiel non renseigne : '+id);
 });
 ['pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'].forEach(id=>{
   if(!DB[id].side) err('side attendu sur '+id);
   eq(DB[id].reps,[8,15],'fourchette unilaterale de '+id);
   if(DB[id].sets!==2) err('deux series sur un unilateral : '+id);
 });
 ['pont-fessier','pont-fessier-leste'].forEach(id=>{
   if(DB[id].side) err('side inattendu sur '+id);
   eq(DB[id].reps,[10,20],'fourchette bilaterale de '+id);
   if(DB[id].sets!==3) err('trois series sur un bilateral : '+id);
 });
 /* un unilateral vaut deux fois le travail : au sommet de sa fourchette il
    coute au moins ce que coute le bilateral au sommet de la sienne */
 const s1=INSTALL+Math.round(15*TEMPO*2), s2=INSTALL+Math.round(20*TEMPO);
 if(s1<s2) err('la fourchette unilaterale doit couter au moins autant que la bilaterale a son sommet');
 console.log('forme OK : cinq criteres de fin, side et fourchettes, materiel, illustrations, cout coherent');

 /* ---------- 11. le texte ne liste plus les fiches une par une ---------- */
 /* la liste nominative devenait fausse a chaque lot qui ajoute un critere de
    fin de serie, sans que rien ne le signale : elle renvoie desormais a la
    ligne portee par la fiche */
 const plat=COMMENT.map(b=>b.c+' '+b.l.join(' ')).join(' ');
 if(/Sur les pompes, la planche, le gainage lat/.test(plat)) err('le texte ne doit plus enumerer les fiches a critere de fin');
 if(plat.indexOf('Fin de série')<0) err('le texte doit renvoyer a la ligne de la fiche');
 /* la calibration ne concerne pas que la charge : elle concerne aussi les
    repetitions, sur tous les exercices */
 if(/Elle ne concerne que les exercices dont tu choisis la charge/.test(plat)) err('l ancienne phrase de calibration est fausse et doit avoir disparu');
 /* v2.14 : la regle de cible a change et vit dans son propre bloc ; le test
    ne verifie plus une chaine exacte ni un compte de developpements, valeurs
    epinglees qui tombaient avec le texte, mais que la regle est dite */
 if(!/plus petite série/.test(plat)||!/deux derniers passages/.test(plat)) err('le texte doit dire comment la cible en repetitions se calcule');
 const cal=COMMENT.filter(b=>/calibration/i.test(b.t))[0];
 if(!cal||cal.l.length<2) err('le bloc de calibration doit porter un developpement');
 if(plat.indexOf('vidéo')<0) err('le texte doit autoriser la recherche hors de l outil');
 console.log('texte OK : calibration en repetitions dite, renvoi a la fiche, recherche hors outil');

 console.log('TESTS ESCALIER DU PONT FESSIER V2.13 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
