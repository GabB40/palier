// Lot v2.7 : ordre du circuit. La suite ne verifie pas le contenu de
// SLOT_ORDER, ce serait une tautologie : elle verifie les invariants qui
// doivent survivre a un changement d ordre, et que rien dans le code ne suppose
// une position particuliere. Elle reste vraie quel que soit l ordre choisi,
// sauf la section 2 qui porte sur la decision elle-meme.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const SRC=src;
const T=`
(async function(){
 await loadState();
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 state.hist=[]; state.perf={}; state.unlocked={}; lightMode=false;
 const catOf=id=>DB[id].cat;

 // 1. le plan suit SLOT_ORDER, tour par tour, quel que soit le volume
 ROUNDS_CHOICES.forEach(R=>{
   state.rounds=R;
   for(let k=0;k<12;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     const p=buildSession();
     const w=workSteps(p.steps);
     if(w.length!==4*R) throw new Error('pas de travail attendus '+(4*R)+', obtenus '+w.length+' a '+R+' tours');
     for(let r=0;r<R;r++){
       const tour=w.slice(r*4,r*4+4).map(st=>catOf(st.id));
       if(tour.join(',')!==SLOT_ORDER.join(','))
         throw new Error('tour '+(r+1)+' hors ordre : '+tour.join(',')+' au lieu de '+SLOT_ORDER.join(','));
     }
     if(p.exos.map(catOf).join(',')!==SLOT_ORDER.join(','))
       throw new Error('plan.exos hors ordre au tirage '+k);
     if(p.orig.map(catOf).join(',')!==SLOT_ORDER.join(','))
       throw new Error('plan.orig hors ordre au tirage '+k);
   }
 });
 state.rounds=3;
 console.log('ordre OK : chaque tour porte les quatre emplacements une fois, dans l ordre du circuit, a 2, 3 et 4 tours');

 // 2. le circuit est circulaire : quatre adjacences, dont la fermeture du tour.
 //    Decision v2.10 : pousse, jambes, tire, gainage. Elle remplace celle de
 //    la v2.7, dont la mesure comparait des ordres miroir toujours ex aequo et
 //    supposait les quatre emplacements independants sur l epaule. Le tour se
 //    referme desormais sur gainage vers pousse, et cette fermeture porte la
 //    pause de raccord : l ordre seul serait une regression mesuree, les deux
 //    decisions sont indissociables. L egalite explicite fige la decision ;
 //    les proprietes qui suivent disent pourquoi elle a ete prise. Les autres
 //    sections de la suite restent vraies quel que soit l ordre.
 if(SLOT_ORDER.join(',')!=='push,legs,pull,core')
   throw new Error('ordre du circuit attendu push,legs,pull,core, obtenu '+SLOT_ORDER.join(','));
 const adj=[];
 for(let i=0;i<SLOT_ORDER.length;i++) adj.push(SLOT_ORDER[i]+'>'+SLOT_ORDER[(i+1)%SLOT_ORDER.length]);
 if(adj.length!==4) throw new Error('quatre adjacences attendues, obtenues '+adj.length);
 if(adj.indexOf('legs>core')>=0) throw new Error('adjacence jambes vers gainage toujours presente');
 if(adj.indexOf('core>push')<0) throw new Error('le tour ne se referme pas sur gainage vers pousse');
 /* ce que l ordre achete : le tire cesse d etre precede du pousse. Le face
    pull, marque epaule, voyait son predecesseur conflictuer dans 67 % des
    quatuors en v2.7 et dans 13 % ici. */
 if(adj.indexOf('legs>pull')<0) throw new Error('le tire n est plus precede des jambes, le face pull perd sa protection');
 if(adj.indexOf('push>pull')>=0) throw new Error('le pousse precede encore le tire');
 if(SLOT_ORDER[0]!=='push') throw new Error('le pousse n ouvre plus le tour');
 {
   const p=buildSession(), w=workSteps(p.steps);
   for(let i=0;i+1<w.length;i++){
     if(catOf(w[i].id)==='legs'&&catOf(w[i+1].id)==='core')
       throw new Error('jambes suivi de gainage dans la sequence reelle, pas '+i);
   }
   if(catOf(w[w.length-1].id)!=='core') throw new Error('le dernier pas de travail n est pas le gainage');
 }
 console.log('circuit OK : quatre adjacences, plus de jambes vers gainage ni de pousse vers tire, fermeture par gainage vers pousse');

 // 3. le carrousel colle au plan : drawAhead(0) donne le tirage du jour
 for(let k=0;k<10;k++){
   state.slotIdx={push:k,pull:k,legs:k,core:k};
   const p=buildSession(), a=drawAhead(0);
   if(a.join('|')!==p.orig.join('|'))
     throw new Error('carrousel decorrele du plan au tirage '+k+' : '+a.join(',')+' vs '+p.orig.join(','));
   if(a.map(catOf).join(',')!==SLOT_ORDER.join(','))
     throw new Error('carrousel hors ordre au tirage '+k);
 }
 console.log('carrousel OK : meme tirage et meme ordre que le plan, sur dix positions');

 // 4. les repos annoncent le pas de travail suivant, y compris aux bornes de
 //    tour, et aucun repos ne suit le dernier pas de travail
 {
   state.slotIdx={push:0,pull:0,legs:0,core:0};
   state.rounds=4; state.cardio=false;
   const p=buildSession();
   const L=p.steps;
   let bornes=0;
   for(let i=0;i<L.length;i++){
     if(L[i].k!=='rest') continue;
     let j=i+1; while(j<L.length&&L[j].k!=='set') j++;
     if(j>=L.length||L[j].cool) throw new Error('repos sans pas de travail suivant, position '+i);
     if(L[i].next!==L[j].id) throw new Error('repos annonce '+L[i].next+' au lieu de '+L[j].id);
     if(L[i].nextKey!==(L[j].key||L[j].id)) throw new Error('nextKey desaccorde a la position '+i);
     /* v2.10 : la borne de tour est gainage vers pousse */
     if(catOf(L[i-1].id)==='core'&&catOf(L[j].id)==='push') bornes++;
   }
   if(bornes!==3) throw new Error('trois bornes de tour attendues a 4 tours, obtenues '+bornes);
   const w=workSteps(L), last=L.indexOf(w[w.length-1]);
   for(let i=last+1;i<L.length;i++)
     if(L[i].k==='rest') throw new Error('repos apres le dernier pas de travail');
   console.log('repos OK : chaque repos annonce le pas qui le suit, trois bornes de tour, aucun repos en queue');
 }

 // 5. les etirements suivent le dernier tour et ne portent pas de repos
 {
   state.warm='complet'; state.stretch=true; state.cardio=true;
   const p=buildSession(), L=p.steps;
   const cools=L.map((s,i)=>s.cool?i:-1).filter(i=>i>=0);
   if(!cools.length) throw new Error('aucun etirement alors qu ils sont actifs');
   const w=workSteps(L);
   const lastWork=L.indexOf(w[w.length-1]);
   if(cools[0]<lastWork) throw new Error('un etirement precede le dernier pas de travail');
   console.log('etirements OK : apres le dernier tour, jamais intercales');
 }

 // 6. duree annoncee et remontages de charge sont indifferents a l ordre :
 //    permuter les quatre exercices a l interieur de chaque tour ne les change
 //    pas. C est la propriete qui rend un changement d ordre neutre sur le
 //    modele de temps.
 {
   state.cardio=false; state.stretch=false; state.warm='court';
   for(let k=0;k<10;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     const p=buildSession();
     const a=planParts(p);
     const q=JSON.parse(JSON.stringify(p));
     const w=q.steps.filter(s=>s.k==='set'&&!s.cool);
     const R=effRounds();
     for(let r=0;r<R;r++){
       const bloc=w.slice(r*4,r*4+4);
       const permute=[bloc[3],bloc[1],bloc[2],bloc[0]];
       let n=0;
       for(let i=0;i<q.steps.length;i++){
         if(q.steps[i].k==='set'&&!q.steps[i].cool){
           if(n>=r*4&&n<r*4+4) q.steps[i]=permute[n-r*4];
           n++;
         }
       }
     }
     const b=planParts(q);
     if(Math.round(a.total)!==Math.round(b.total))
       throw new Error('duree sensible a l ordre au tirage '+k+' : '+Math.round(a.total)+' vs '+Math.round(b.total));
     if(a.nRemount!==b.nRemount)
       throw new Error('remontages sensibles a l ordre au tirage '+k+' : '+a.nRemount+' vs '+b.nRemount);
   }
   console.log('modele de temps OK : duree et remontages inchanges par permutation des quatre exercices');
 }

 // 7. le gel de rotation suit l emplacement et non la position : plan.subs est
 //    indexe par nom d emplacement, en accord avec l ordre de plan.orig. Le cas
 //    qui discrimine est la substitution PARTIELLE : quand les quatre
 //    emplacements basculent ensemble, un index decale reste indetectable.
 {
   lightMode=true;
   let partiels=0;
   for(let k=0;k<30;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     const p=buildSession();
     const changes=SLOT_ORDER.filter((s,i)=>p.exos[i]!==p.orig[i]);
     Object.keys(p.subs).forEach(s=>{
       if(SLOT_ORDER.indexOf(s)<0) throw new Error('subs porte un emplacement inconnu : '+s);
     });
     if(Object.keys(p.subs).length!==changes.length)
       throw new Error('subs compte '+Object.keys(p.subs).length+' emplacements pour '+changes.length+' substitutions, tirage '+k);
     SLOT_ORDER.forEach((s,i)=>{
       const change=p.exos[i]!==p.orig[i];
       if(change&&!p.subs[s]) throw new Error('emplacement '+s+' substitue mais non marque, tirage '+k);
       if(!change&&p.subs[s]) throw new Error('emplacement '+s+' marque sans substitution, tirage '+k);
       if(change&&catOf(p.orig[i])!==s) throw new Error('index de subs decorrele de SLOT_ORDER sur '+s);
     });
     if(changes.length>0&&changes.length<4) partiels++;
   }
   if(partiels<5) throw new Error('trop peu de substitutions partielles pour discriminer : '+partiels);
   lightMode=false;
   console.log('gel OK : subs indexe par emplacement, verifie sur '+partiels+' tirages a substitution partielle');
 }

 // 8. bibliotheque et couverture suivent l ordre du circuit, libelles pris sur
 //    SLOTS, et aucune table de libelles n est restee recopiee dans le code
 {
   state.hist=[]; view='lib'; libQ=''; render();
   const pos=SLOT_ORDER.map(s=>html.indexOf('>'+SLOTS[s].label+'<'));
   pos.forEach((x,i)=>{ if(x<0) throw new Error('libelle absent de la bibliotheque : '+SLOTS[SLOT_ORDER[i]].label); });
   for(let i=1;i<pos.length;i++)
     if(pos[i]<pos[i-1]) throw new Error('bibliotheque hors ordre du circuit');
   const iCardio=html.indexOf('>Cardio<');
   if(iCardio>=0&&iCardio<pos[pos.length-1]) throw new Error('Cardio avant le dernier emplacement');
 }
 {
   /* la couverture ne rend ses barres qu une fois une semaine revolue :
      l historique couvre trois semaines */
   state.hist=[21,17,14,10,7].map(d=>({date:new Date(Date.now()-d*864e5).toISOString(),dur:900,plan:900,items:[
     {id:'pompes-poignees',sets:[8,8]},{id:'face-pulls',sets:[10,10]},
     {id:'planche',sets:[20,20]},{id:'goblet-squat',sets:[8,8],load:10}]}));
   const sh=statsHtml();
   const pos=SLOT_ORDER.map(s=>sh.indexOf(SLOTS[s].label));
   pos.forEach((x,i)=>{ if(x<0) throw new Error('libelle absent de la couverture : '+SLOTS[SLOT_ORDER[i]].label); });
   for(let i=1;i<pos.length;i++)
     if(pos[i]<pos[i-1]) throw new Error('couverture hors ordre du circuit');
   state.hist=[];
   console.log('affichages OK : bibliotheque et couverture rangees dans l ordre du circuit');
 }
 if(SRC.indexOf("['push','Poussé'],['pull','Tiré']")>=0)
   throw new Error('table de libelles recopiee dans la bibliotheque');
 if(SRC.indexOf("{push:'Poussé',pull:'Tiré'")>=0)
   throw new Error('table de libelles recopiee dans la couverture');
 if((SRC.match(/label:'Poussé'/g)||[]).length!==1)
   throw new Error('le libelle Poussé doit etre declare une fois et une seule, dans SLOTS');
 console.log('source OK : un seul jeu de libelles d emplacement, celui de SLOTS');

 // 9. le tirage lui-meme n a pas bouge : a compteurs egaux, chaque emplacement
 //    sert la meme position qu avant le changement d ordre. Le vivier est lu
 //    par emplacement et jamais par rang dans le circuit.
 {
   for(let k=0;k<15;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     SLOT_ORDER.forEach(s=>{
       const pos=posTirables(s,state.gear);
       const attendu=pos[k%pos.length];
       const rendu=SLOTS[s].pool.indexOf(pickFromPool(s));
       if(rendu!==attendu&&!resolvePos(s,attendu,state.gear))
         throw new Error('tirage decale sur '+s+' au compteur '+k);
     });
   }
   console.log('tirage OK : chaque emplacement lit son vivier par son nom, sans reference a son rang');
 }

 console.log('TESTS ORDRE DU CIRCUIT V2.7 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
