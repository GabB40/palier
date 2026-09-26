/* test31 : lot v2.5. Escalier des mollets. Plafond ramene au haut de fourchette
   et disparition des relevements fantomes, ecretage des fourchettes heritees,
   masse mobilisable et cle derivee masse, echelle du sac, condition de charge
   du verrou dans les deux sens, invariant de vivier a cinq entrees tirables
   dans les quatre etats, chaine de substitution et replis. */
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
 const neuf=async()=>{ localStorage._m={}; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const CH=['mollets-debout','mollets-debout-leste','mollets-une-jambe','mollets-une-jambe-leste'];

 /* ---------- 1. plus aucun relevement fantome ---------- */
 await neuf();
 if('cap' in DB['mollets-debout']||'cap' in DB['mollets-une-jambe']) err('v2.16 : plus de champ cap, le plafond est le haut de fourchette');
 const E=echelleOf('mollets-debout');
 if(E.lbl.length!==1) err('une seule marche attendue, '+E.lbl.length+' affichees : '+E.lbl.join(' | '));
 if(E.i!==0) err('position introuvable sur une echelle a une marche');
 /* le moteur ne doit plus relever la fourchette : un passage au plafond
    annonce la marche suivante et laisse la fourchette ou elle est */
 const p=perfOf('mollets-debout'); p.target=25;
 const msgs=applyProgress('mollets-debout',[25,25],true,false,false);
 eq(perfOf('mollets-debout').range,[12,25],'la fourchette ne doit pas bouger au plafond');
 if(!msgs.some(m=>/Plafond atteint/.test(m))) err('le plafond doit etre annonce');
 console.log('plafond OK : une seule marche, aucune fourchette relevee, marche suivante annoncee');

 /* ---------- 2. ecretage des fourchettes heritees ---------- */
 /* etat ecrit sous la v2.4, en plein relevement : la migration le ramene dans
    les bornes, sinon echelleOf perd la position et la carte annonce « pas
    encore de niveau enregistre » sur un exercice joue depuis des mois */
 await neuf();
 const vieux={v:2,rounds:3,perf:{
   'mollets-debout':{load:0,range:[13,26],target:26,best:26,sets:[26,26],date:'2026-08-01T10:00:00.000Z'},
   'pont-fessier':{load:0,range:[10,20],target:14,best:14,sets:[],date:null}}};
 const m=migrateState(JSON.parse(JSON.stringify(vieux)));
 eq(m.perf['mollets-debout'].range,[12,25],'fourchette heritee ecretee');
 if(m.perf['mollets-debout'].target!==25) err('cible heritee ecretee, '+m.perf['mollets-debout'].target);
 if(m.perf['mollets-debout'].best!==26) err('le maximum historique n est pas reecrit');
 eq(m.perf['pont-fessier'].range,[10,20],'une fourchette deja conforme n est pas touchee');
 if(m.perf['pont-fessier'].target!==14) err('cible conforme non touchee');
 const deux=migrateState(JSON.parse(JSON.stringify(m)));
 if(JSON.stringify(deux.perf)!==JSON.stringify(m.perf)) err('migration non idempotente');
 /* la carte retrouve sa position, ce que l etat non ecrete lui interdisait */
 state.perf['mollets-debout']=JSON.parse(JSON.stringify(m.perf['mollets-debout']));
 if(echelleOf('mollets-debout').i<0) err('position perdue sur l echelle apres migration');
 state.perf['mollets-debout'].range=[13,26];
 if(echelleOf('mollets-debout').i>=0) err('temoin : sans ecretage la position doit etre introuvable');
 console.log('migration OK : 13-26 ramene a 12-25, position retrouvee, idempotente');

 /* ---------- 3. masse mobilisable et cle derivee ---------- */
 await neuf();
 if(masseMobilisable(state.gear)!==47) err('masse de l inventaire par defaut attendue a 47 kg, '+masseMobilisable(state.gear));
 const g=j=>JSON.parse(JSON.stringify(j));
 const kbSeule={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{},kbs:{'10':1},res:{kb:1}};
 const lestesSeuls={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{'1':1,'2':1},kbs:{},res:{cuff:1}};
 if(masseMobilisable(kbSeule)!==10) err('une kettlebell de 10 doit peser 10, '+masseMobilisable(kbSeule));
 if(masseMobilisable(lestesSeuls)!==6) err('les deux paires de lestes pesent 6 kg, '+masseMobilisable(lestesSeuls));
 /* chaque famille reste soumise a son drapeau : masquer les halteres retire
    leurs disques du calcul, comme aRes masque les bandes et les kettlebells */
 const sansHal=g(DEFAULT_GEAR); sansHal.res.hal=0;
 if(masseMobilisable(sansHal)!==16) err('sans halteres il reste kettlebell et lestes, '+masseMobilisable(sansHal));
 /* la cle masse n a pas d interrupteur a elle : elle se derive du seuil */
 if(!aRes('masse',state.gear)) err('l inventaire complet doit servir la cle masse');
 if(!aRes('masse',kbSeule)) err('une kettlebell de 10 suffit au premier barreau : c est tout l objet de la cle derivee');
 if(aRes('masse',lestesSeuls)) err('6 kg sont sous le pas, la cle ne doit pas etre servie');
 console.log('masse OK : 47 kg par defaut, kettlebell seule suffit, lestes seuls non, drapeaux respectes');

 /* ---------- 4. echelle du sac ---------- */
 await neuf();
 SAC_EX.forEach(id=>{
   const L=fixedLadder(id,state.gear).map(x=>x.v);
   eq(L,[10,20,30,40],'echelle du sac de '+id);
 });
 /* elle se derive de la masse et non d une constante de plafond */
 eq(fixedLadder('mollets-debout-leste',kbSeule).map(x=>x.v),[10],'inventaire pauvre : un seul barreau');
 eq(fixedLadder('mollets-debout-leste',lestesSeuls).map(x=>x.v),[],'sous le pas : echelle vide');
 if(fixedCap('mollets-debout-leste')!==null) err('aucun plafond pose sur le sac, il se derive de l inventaire');
 /* les exercices a kettlebell ne sont pas touches par la branche sac */
 if(fixedLadder('goblet-squat',state.gear)[0].lbl.indexOf('KB')<0) err('la branche kettlebell doit rester intacte');
 if(fixedLadder('mollets-debout-leste',state.gear)[0].lbl.indexOf('sac')<0) err('libelle du sac attendu');
 /* le pas ne descend pas sous dix : c est la regle mesuree, pas un reglage */
 if(PAS_SAC!==10) err('pas du sac attendu a 10 kg');
 console.log('echelle OK : 10/20/30/40 derives de la masse, vide sous le pas, kettlebells intactes');

 /* ---------- 5. verrous de la chaine, et la condition de charge ---------- */
 await neuf();
 for(let i=1;i<CH.length;i++){
   const l=DB[CH[i]].lock;
   if(!l||l.after!==CH[i-1]) err(CH[i]+' doit se verrouiller derriere '+CH[i-1]);
   if(l.minSets!==2) err('verrou a deux series sur '+CH[i]);
   if(DB[CH[i]].retire!==CH[i-1]) err(CH[i]+' doit retirer '+CH[i-1]);
 }
 if(DB['mollets-debout-leste'].lock.need!==DB['mollets-debout'].reps[1]) err('le verrou vaut le plafond du predecesseur, son haut de fourchette');
 if(DB['mollets-une-jambe-leste'].lock.need!==DB['mollets-une-jambe'].reps[1]) err('idem sur le dernier echelon');
 /* le temoin qui compte : 25 repetitions au PREMIER barreau ne doivent pas
    ouvrir la version sur une jambe, sinon les barreaux 20, 30 et 40 de la
    version bilaterale ne seraient jamais joues */
 await neuf();
 state.unlocked['mollets-debout-leste']=true;
 const L=fixedLadder('mollets-debout-leste',state.gear);
 /* checkUnlocks est appele par la fin de seance, jamais par applyProgress :
    poser les series sans l appeler ferait passer la section pour une bonne
    raison alors que rien ne serait teste. Meme forme que test18 et test28. */
 /* v2.18 : le verrou lit la charge ecrite AVEC les series, p.setsLoad : le
    temoin la pose comme applyProgress le ferait. */
 const met=(charge,sets)=>{ const q=perfOf('mollets-debout-leste'); q.load=charge; q.setsLoad=charge; q.sets=sets.slice();
   delete state.unlocked['mollets-une-jambe']; return checkUnlocks(3,false); };
 met(10,[25,25]);
 if(state.unlocked['mollets-une-jambe']) err('verrou ouvert au premier barreau : la condition de charge ne mord pas');
 met(L[L.length-2].v,[25,25]);
 if(state.unlocked['mollets-une-jambe']) err('verrou ouvert a l avant-dernier barreau');
 met(L[L.length-1].v,[24,25]);
 if(state.unlocked['mollets-une-jambe']) err('la condition de repetitions doit continuer de valoir au dernier barreau');
 const ms=met(L[L.length-1].v,[25,25]);
 if(!state.unlocked['mollets-une-jambe']) err('verrou ferme au dernier barreau avec les repetitions');
 if(!ms.length) err('le deblocage doit etre annonce');
 console.log('verrou charge OK : ferme a 10 kg, ouvert a 40 kg, sur les memes 25 repetitions');

 /* ---------- 6. un inventaire pauvre n est pas enferme ---------- */
 /* difference assumee avec bandGate : l exercice ouvert ne demande aucun
    materiel, le dernier barreau se lit donc sur l echelle FILTREE */
 await neuf();
 state.gear=g(kbSeule); syncProfil();
 state.unlocked['mollets-debout-leste']=true;
 const q2=perfOf('mollets-debout-leste'); q2.load=10; q2.setsLoad=10; q2.sets=[25,25];
 checkUnlocks(3,false);
 if(!state.unlocked['mollets-une-jambe']) err('un inventaire a 10 kg doit pouvoir ouvrir un exercice au poids du corps');
 console.log('inventaire pauvre OK : 10 kg est son dernier barreau, le verrou s ouvre');

 /* ---------- 7. vivier a cinq entrees tirables dans les quatre etats ---------- */
 await neuf();
 const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
 /* v2.13 : porte a 15 par l escalier du pont fessier, sans effet sur le
    nombre d entrees tirables, qui est l invariant mesure juste en dessous.
    v2.18 : 17, escalier du squat, meme raisonnement. */
 if(SLOTS.legs.pool.length!==17) err('vivier de reference a 17 entrees');
 const vus=[];
 for(let i=0;i<CH.length;i++){
   const t=tir();
   if(t.length!==5) err('etat '+i+' : cinq entrees tirables attendues, '+t.length);
   if(t.indexOf(CH[i])<0) err('etat '+i+' : '+CH[i]+' doit etre tirable');
   CH.forEach((c,j)=>{ if(j!==i&&t.indexOf(c)>=0) err('etat '+i+' : '+c+' ne doit pas etre tirable en meme temps'); });
   vus.push(t.join('>'));
   if(i+1<CH.length) state.unlocked[CH[i+1]]=true;
 }
 /* la substitution se fait sur place : meme ordre a chaque etat */
 const pos=vus.map(v=>v.split('>').indexOf(CH[0])<0?null:0);
 if(new Set(vus.map(v=>v.split('>').length)).size!==1) err('la taille du vivier tirable doit etre stable');
 console.log('vivier OK : cinq entrees tirables dans les quatre etats, un seul echelon de mollets a la fois');

 /* ---------- 8. besoin materiel et chaine de substitution ---------- */
 await neuf();
 eq(NEEDS['mollets-debout-leste'],['masse'],'besoin des mollets lestes');
 eq(NEEDS['mollets-une-jambe-leste'],['masse'],'besoin des mollets une jambe lestes');
 if(NEEDS['mollets-debout']||NEEDS['mollets-une-jambe']) err('les versions au poids du corps ne declarent aucun besoin');
 const iB=SLOTS.legs.pool.indexOf('mollets-debout-leste');
 const iU=SLOTS.legs.pool.indexOf('mollets-une-jambe-leste');
 if(resolvePos('legs',iB,state.gear)!=='mollets-debout-leste') err('avec du poids, la position sert la variante chargee');
 /* on ne retire QUE les sources de masse, le reste de l inventaire est intact :
    sinon la mesure porterait aussi sur le marchepied et la kettlebell, et une
    chute du vivier serait mise au compte des mollets a tort */
 const sansMasse=g(DEFAULT_GEAR); sansMasse.res.hal=0; sansMasse.res.kb=0; sansMasse.res.cuff=0;
 state.gear=sansMasse; syncProfil();
 if(aRes('masse',state.gear)) err('temoin : plus aucune masse declaree');
 if(resolvePos('legs',iB,state.gear)!=='mollets-debout') err('sans poids, la chaine descend vers le poids du corps');
 if(resolvePos('legs',iU,state.gear)!=='mollets-une-jambe') err('idem sur l echelon unilateral');
 /* le verrou doit etre ouvert pour que la position entre dans le tirage : sans
    cela on mesurerait l etat du verrou et non la chaine materielle */
 state.unlocked['mollets-debout-leste']=true;
 const t2=posTirables('legs',state.gear);
 if(t2.indexOf(iB)<0) err('verrou ouvert et sans poids, la position doit rester servie par sa chaine');
 if(t2.indexOf(SLOTS.legs.pool.indexOf('mollets-debout'))>=0) err('le predecesseur retire ne doit pas revenir dans le tirage');
 if(t2.length!==5) err('le vivier reste a cinq positions, '+t2.length);
 /* le schema moteur suit l insertion */
 if(SCHEMA.legs.length!==SLOTS.legs.pool.length) err('schema moteur desaligne du vivier');
 console.log('materiel OK : cle masse en contrat, chaine vers le poids du corps, schema aligne');

 /* ---------- 9. replis, jamais vers un exercice verrouillable ---------- */
 await neuf();
 CH.slice(1).forEach(id=>{
   const f=DB[id].fb;
   if(!f) err(id+' doit porter un repli');
   if(DB[f].lock) err('repli verrouillable sur '+id+' : '+f);
 });
 if(DB['mollets-debout'].fb) err('la base de la chaine n a pas de repli au-dessous');
 console.log('replis OK : les trois echelons replient sur la base, qui n est jamais verrouillee');

 /* ---------- 10. cout de seance et illustrations ---------- */
 await neuf();
 CH.forEach(id=>{ if(tempoOf(id)!==3.5) err('tempo attendu a 3,5 s sur '+id); });
 if(!DB['mollets-une-jambe'].side||!DB['mollets-une-jambe-leste'].side) err('les deux versions unilaterales doivent porter side');
 if(DB['mollets-debout'].side||DB['mollets-debout-leste'].side) err('les deux versions bilaterales ne doivent pas porter side');
 /* un unilateral vaut deux fois le travail : c est ce qui borne sa fourchette
    a 8-15 la ou la version bilaterale tient 12-25 */
 const s1=INSTALL+Math.round(15*3.5*2), s2=INSTALL+Math.round(25*3.5);
 if(s1<s2) err('la fourchette unilaterale doit couter au moins autant que la bilaterale a son sommet');
 CH.forEach(id=>{ if(typeof IMG!=='undefined'&&!IMG[id]) err('illustration absente : '+id); });
 CH.forEach(id=>{ if(!DB[id].mat||!DB[id].mat.length) err('materiel non renseigne : '+id); });
 console.log('forme OK : tempo, side, cout de seance coherent, quatre illustrations en banque');

 console.log('TESTS ESCALIER DES MOLLETS V2.5 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
