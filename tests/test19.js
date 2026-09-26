/* test19 : composition des viviers (retrait des barreaux depasses, poids double
   des face pulls et son espacement), marquage des exercices de repli, date du
   dernier import, et les deux mecanismes de fin de seance que test18 ne couvre
   pas parce qu ils vivent dans endSession : le signal d exercice non realise
   et la file de celebrations devenue identitaire. Chantier v1.15, bloc 2. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile(); };
 const tire=()=>SLOTS.pull.pool.filter(id=>!isLocked(id)&&!estRetire(id));
 await neuf();

 // 1. le poids double : deux entrees face-pulls, ecartees dans le tableau declare
 const pos=[]; SLOTS.pull.pool.forEach((id,i)=>{ if(id==='face-pulls') pos.push(i); });
 if(pos.length!==2) throw new Error('deux entrees face-pulls attendues dans le vivier tire, trouve '+pos.length);
 console.log('poids double OK : face-pulls compte deux fois dans le vivier tire');

 // 2. espacement dans les quatre etats de verrous, avec le retrait de la
 //    decision A. Le mandat disait « environ trois positions » sans dire dans
 //    quel etat : c est le tableau filtre qui compte, pas le tableau declare.
 const etats=[
   ['aujourd hui',{}],
   ['+ assistee pronation',{'tractions-assistees-pronation':1}],
   ['+ stricte supination',{'tractions-assistees-pronation':1,'tractions-strictes-supination':1}],
   ['+ stricte pronation',{'tractions-assistees-pronation':1,'tractions-strictes-supination':1,'tractions-strictes-pronation':1}]
 ];
 const vus=[];
 etats.forEach(([nom,unl])=>{
   state.unlocked=Object.assign({},unl);
   const P=tire(), q=[]; P.forEach((id,i)=>{ if(id==='face-pulls') q.push(i); });
   if(q.length!==2) throw new Error(nom+' : face-pulls doit sortir deux fois du filtre');
   const d=q[1]-q[0], e=[d,P.length-d].sort((a,b)=>a-b);
   if(e[0]<3) throw new Error(nom+' : entrees trop proches ('+e.join('/')+'), face-pulls sortirait deux seances de suite');
   vus.push(nom+' '+P.length+' entrees, ecarts '+e.join('/'));
 });
 console.log('espacement OK sur les quatre etats : '+vus.join(' · '));

 // 3. decision A : le barreau depasse quitte le vivier au deblocage
 state.unlocked={};
 if(tire().indexOf('tractions-assistees-supination')<0) throw new Error('la variante assistee doit etre au vivier avant deblocage');
 /* le retrait attend que plus aucun verrou ferme ne lise l exercice : la
    pronation assistee lit le dernier passage de la supination assistee, la
    retirer trop tot rendrait sa branche definitivement infranchissable */
 state.unlocked={'tractions-strictes-supination':true};
 if(tire().indexOf('tractions-assistees-supination')<0) throw new Error('retrait premature : un verrou ferme lit encore cet exercice');
 state.unlocked={'tractions-strictes-supination':true,'tractions-assistees-pronation':true};
 if(tire().indexOf('tractions-assistees-supination')>=0) throw new Error('la variante assistee doit quitter le vivier une fois ses verrous ouverts');
 if(tire().indexOf('tractions-strictes-supination')<0) throw new Error('la stricte doit entrer au vivier');
 if(isLocked('tractions-assistees-supination')) throw new Error('un barreau retire n est pas reverrouille : sa fiche et sa progression restent intactes');
 console.log('retrait OK : le barreau depasse sort du tirage sans etre reverrouille');

 // 4. la taille du vivier ne gonfle plus a chaque deblocage
 const tailles=etats.map(([nom,unl])=>{ state.unlocked=Object.assign({},unl); return tire().length; });
 if(tailles[3]>tailles[2]) throw new Error('le dernier deblocage ne doit pas faire gonfler le vivier, obtenu '+tailles.join('/'));
 console.log('taille du vivier tire OK : '+tailles.join(' -> ')+' au lieu de gonfler a chaque escalier');

 // 4b. aucun retrait ne peut orpheliner un verrou (F1 de l audit v1.15)
 Object.keys(DB).forEach(id=>{ const L=DB[id].lock; if(!L) return;
   state.unlocked={};
   Object.keys(DB).forEach(x=>{ if(DB[x].retire===L.after) state.unlocked[x]=true; });
   if(state.unlocked[id]) return;   /* un verrou deja ouvert ne peut plus etre orpheline */
   if(estRetire(L.after)) throw new Error('retrait orphelinant le verrou de '+id+' : '+L.after+' n enregistrera plus rien');
 });
 state.unlocked={};
 console.log('anti-orphelin OK : aucun retrait ne rend un verrou infranchissable');

 // 4c. les series d une seance allegee ne nourrissent aucun verrou (F2)
 await neuf();
 const src='goblet-squat', cible='rdl-kettlebell';
 applyProgress(src,[15,15,15],true,true);          /* seance allegee */
 checkUnlocks(3,false);
 if(state.unlocked[cible]) throw new Error('des series allegees ont ouvert un verrou a la seance suivante');
 applyProgress(src,[15,15,15],true,false);         /* seance normale */
 checkUnlocks(3,false);
 if(!state.unlocked[cible]) throw new Error('une seance normale doit ouvrir le verrou');
 console.log('provenance OK : la garde allegee couvre la seance suivante, pas seulement la seance elle-meme');

 // 4d. une descente n entre pas dans les paliers proposes au recapitulatif (F3)
 await neuf();
 const pf=perfOf('developpe-sol'); pf.load=6; pf.target=8; pf.range=DB['developpe-sol'].reps.slice();
 const av={load:pf.load,band:pf.band||null,range:pf.range.slice(),hold:false};
 applyProgress('developpe-sol',[3,3,3],true,false);
 if(pf.load>=av.load) throw new Error('descente attendue');
 if(estMontee(pf,av,DB['developpe-sol'])) throw new Error('une descente ne doit pas etre proposee comme palier a tenir');
 console.log('paliers OK : seules les montees sont proposees au recapitulatif');


 // 5. le tirage ne rend jamais un exercice retire
 await neuf();
 state.unlocked={'tractions-strictes-supination':true,'tractions-strictes-pronation':true,'tractions-assistees-pronation':true};
 const sortis={};
 for(let i=0;i<40;i++){ state.slotIdx.pull=i; sortis[pickFromPool('pull')]=1; }
 if(sortis['tractions-assistees-supination']||sortis['tractions-assistees-pronation']) throw new Error('un exercice retire est sorti au tirage');
 if(!sortis['face-pulls']) throw new Error('face-pulls doit sortir');
 console.log('tirage OK : '+Object.keys(sortis).length+' exercices distincts, aucun barreau depasse');

 // 6. marquage des exercices de repli
 await neuf();
 const replis=Object.keys(DB).filter(id=>estRepli(id));
 if(replis.indexOf('pompes-inclinees')<0||replis.indexOf('tirage-doux')<0||replis.indexOf('planche-genoux')<0) throw new Error('replis manquants : '+replis.join(','));
 if(replis.some(id=>SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0))) throw new Error('un exercice du vivier ne peut pas etre marque repli');
 if(estRepli('pompes-poignees')) throw new Error('un exercice du vivier marque repli');
 const h=libRowHtml('pompes-inclinees');
 if(!/>repli</.test(h)) throw new Error('etiquette repli absente de la ligne de bibliotheque');
 if(h.indexOf(DB['pompes-poignees'].nom)<0) throw new Error('la ligne doit nommer ce que le repli remplace');
 if(/>repli</.test(libRowHtml('pompes-poignees'))) throw new Error('etiquette repli sur un exercice du vivier');
 showFiche('planche-genoux','lib');
 if(!/Exercice de repli/.test(html)) throw new Error('bloc de repli absent de la fiche');
 if(html.indexOf(DB['planche'].nom)<0) throw new Error('la fiche doit nommer l exercice remplace');
 console.log('replis OK : '+replis.length+' exercices marques, lien nomme dans les deux sens');

 // 7. date du dernier import
 await neuf();
 if(state.lastImport) throw new Error('aucun import ne doit etre date sur un etat neuf');
 const paquet=JSON.parse(payload());
 delete paquet.lastImport;
 applyImport(paquet);
 if(!state.lastImport) throw new Error('applyImport doit dater l import');
 const d1=state.lastImport;
 if(!/Dernier import le/.test((renderSettings(),html))) throw new Error('la date d import doit s afficher dans la card Donnees');
 /* le fichier importe porte la date de l appareil emetteur : elle est ecrasee */
 const vieux=JSON.parse(payload()); vieux.lastImport='2000-01-01T00:00:00.000Z';
 applyImport(vieux);
 if(state.lastImport===vieux.lastImport) throw new Error('la date du fichier importe ne doit pas survivre');
 if(state.lastImport<d1) throw new Error('la nouvelle date doit etre posterieure');
 console.log('import OK : date posee au point de convergence, celle du fichier ecrasee');

 // 8. signal d exercice non realise : emis sur un exercice entierement passe,
 //    muet sur ceux qu une seance quittee n a jamais atteints
 await neuf();
 const seance=(cible,quitA)=>{
   startSession('alterne');
   const etapes=cur.steps.filter(s=>s.k==='set'&&!s.cool);
   let arret=null;
   etapes.forEach(s=>{
     const oid=s.from||s.id;
     if(quitA&&oid===quitA&&arret===null) arret=cur.steps.indexOf(s);
   });
   cur.i=arret===null?cur.steps.length:arret;
   cur.log={}; cur.done=0;
   etapes.forEach(s=>{
     const oid=s.from||s.id, i=cur.steps.indexOf(s);
     if(i>=cur.i) return;                       /* jamais atteint */
     if(oid===cible) return;                    /* entierement passe */
     (cur.log[s.key||s.id]=cur.log[s.key||s.id]||[]).push(DB[s.id].reps?DB[s.id].reps[0]:1);
     cur.done++;
   });
   return cur;
 };
 startSession('alterne');
 const passe=cur.exos[1];
 seance(passe,null);
 await endSession(false);   /* endSession se termine sur le recap : cur porte les msgs */
 const msgs=cur.msgs;
 if(!msgs.some(m=>m.indexOf('Exercice non réalisé')>=0&&m.indexOf(DB[passe].nom)>=0)) throw new Error('signal attendu sur l exercice entierement passe · '+msgs.join(' | '));
 console.log('exercice non realise OK : signale et nomme sur une seance menee au bout');

 await neuf();
 startSession('alterne');
 const exos2=cur.exos.slice();
 seance(null,exos2[2]);
 await endSession(true);
 const jamais=exos2[3];
 if(cur.msgs.some(m=>m.indexOf('Exercice non réalisé')>=0&&m.indexOf(DB[jamais].nom)>=0)) throw new Error('un exercice jamais atteint par une seance quittee ne doit rien signaler');
 console.log('seance quittee OK : les exercices jamais atteints restent muets');

 // 9. celebrations identitaire : un echange de deblocage fete le nouveau
 await neuf();
 state.unlocked={'rdl-kettlebell':true};
 let q=celebrations(['rdl-kettlebell'],[],1);
 if(q.length) throw new Error('un deblocage deja fete ne doit pas l etre deux fois');
 state.unlocked={'kb-swings':true};
 q=celebrations(['rdl-kettlebell'],[],1);
 if(q.length!==1||q[0].nom!==DB['kb-swings'].nom) throw new Error('un echange de deblocage doit feter le nouveau : le compteur ne le voyait pas');
 console.log('celebrations OK : comparaison par identite, l echange est vu');

 console.log('TESTS VIVIERS, REPLIS ET IMPORT V1.15 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
