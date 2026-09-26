/* test18 : filet de securite en quatre cas a borne stricte, grace
   post-montee, signaux sans action, correctif du compteur de divergence, et
   verrous plafonnes par le volume de la seance. Chantier v1.15, issu de
   l enquete equilibre musculaire (tours 1 a 18).
   v2.16 : le cliquet des fourchettes et son relevement n existent plus. T7, T8,
   T11, T12, T16 et T22 asserteraient un mecanisme retire ; ils assertent
   desormais l invariant qui le remplace, une fourchette qui ne bouge dans
   aucun sens et un plafond qui annonce la marche ecrite. T23 change d objet. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
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
 /* pose un exercice dans un etat connu : fourchette d origine, cible au bas */
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   p.range=(o&&o.range)?o.range.slice():e.reps.slice();
   p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.load!=null) p.load=o.load;
   if(o&&o.band) p.band=o.band;
   if(o&&o.hold) p.hold=true; else delete p.hold;
   delete p.grace; delete p.setsBand; delete p.prevMin; p.best=0; p.sets=[];   /* v2.14 : un etat pose n a pas de memoire de fenetre */
   return p; };
 const dit=(m,re)=>m.some(x=>re.test(x));
 const DESC=/redescendue|plus d'aide|retour sans bande|retour à la/i;
 const ECHEC=/aucune série au plancher/;
 const PART=/des séries sous le plancher/;
 await neuf();

 // T1. les vecteurs mesures a max = bas sur les sept premieres seances reelles :
 //     aucune descente, aucun signal, cible avancee d un pas. Dix d entre eux
 //     etaient sur une lecture exploitable, les seuls qu une borne large aurait
 //     pu retrograder ; les autres venaient d une seance allegee ou quittee.
 const T1=[['pompes-poignees',[6,6]],['face-pulls',[10,10]],['dead-bug',[6,6]],
   ['elevations-laterales',[12]],['curls-halteres',[10,10,10]],['step-ups',[8,8,8]],
   ['tractions-assistees-supination',[4,4,4]],['goblet-squat',[8,8,8]],
   ['rowing-suspension',[8,8,8]],['fentes-arriere',[8,8,8]],['pompes-inclinees',[8,8,8]],
   ['rowing-elastique',[10,10,10]],['pont-fessier',[10,10,10]],['pont-fessier',[10,10,10]]];
 T1.forEach(([id,s])=>{
   const p=pose(id), lo=p.range[0], pas=(DB[id].mode==='time')?5:1;
   const m=applyProgress(id,s,true,false);
   if(dit(m,DESC)||dit(m,ECHEC)||dit(m,PART)) throw new Error('T1 '+id+' : le plancher atteint ne doit rien declencher · '+m.join(' | '));
   if(p.target!==lo+pas) throw new Error('T1 '+id+' : cible '+p.target+' attendue '+(lo+pas));
 });
 console.log('T1 OK : les '+T1.length+' vecteurs mesures a max = bas ne declenchent rien ; sur les sept seances reelles, dix de ces passages etaient sur une lecture exploitable, que la borne large aurait retrogrades');

 // T2. [bas,bas,bas] apres montee et grace : rien ne descend, rien ne signale
 let p=pose('face-pulls',{band:'rouge',target:10});
 p.grace=true;
 let m=applyProgress('face-pulls',[10,10,10],true,false);
 if(p.band!=='rouge'||dit(m,DESC)||dit(m,ECHEC)||dit(m,PART)) throw new Error('T2 : reconstruction au plancher retrogradee');
 if(p.target!==11) throw new Error('T2 : cible '+p.target);
 console.log('T2 OK : reconstruire au plancher apres une montee ne retrograde pas');

 // T3. [12,6,5] cible 11 : partiel avec recul mentionne, aucune descente
 p=pose('face-pulls',{band:'rouge',target:11});
 m=applyProgress('face-pulls',[12,6,5],true,false);
 if(p.band!=='rouge') throw new Error('T3 : effondrement partiel ne doit pas descendre');
 if(!dit(m,PART)||!dit(m,/cible recalée de 11 à 10/)) throw new Error('T3 : signal partiel ou recul absent · '+m.join(' | '));
 console.log('T3 OK : effondrement partiel signale, cible recalee mentionnee, aucune action');

 // T4. [10,6,5] cible 10 : partiel seul, pas de recul (contre-exemple d equivalence)
 p=pose('face-pulls',{band:'rouge',target:10});
 m=applyProgress('face-pulls',[10,6,5],true,false);
 if(!dit(m,PART)) throw new Error('T4 : signal partiel absent');
 if(dit(m,/cible recalée/)) throw new Error('T4 : aucun recul a signaler ici');
 console.log('T4 OK : partiel sans recul, les deux predicats sont independants');

 // T5. [12,12,12] cible 14 : la cible recule, aucun message (assertion d absence)
 p=pose('face-pulls',{band:'rouge',target:14});
 m=applyProgress('face-pulls',[12,12,12],true,false);
 if(p.target!==13) throw new Error('T5 : cible '+p.target+' attendue 13');
 if(m.length) throw new Error('T5 : un recul dans la fourchette est le moteur qui fonctionne, pas un evenement · '+m.join(' | '));
 console.log('T5 OK : recul sans partiel, muet');

 // T6. [9,9,8] : descente de bande, barreau joue conserve, message de descente seul
 p=pose('face-pulls',{band:'rouge',target:11});
 m=applyProgress('face-pulls',[9,9,8],true,false);
 if(p.band!=='jaune') throw new Error('T6 : descente de bande attendue, obtenu '+p.band);
 /* v2.12 : le barreau ecrit avec les series est celui sous lequel elles ont
    ete jouees, donc rouge, et la descente qui suit ne le reecrit pas. */
 if(p.setsBand!=='rouge') throw new Error('T6 : barreau joue attendu rouge, obtenu '+p.setsBand);
 if(!dit(m,DESC)||dit(m,ECHEC)) throw new Error('T6 : un seul message par evenement · '+m.join(' | '));
 if(p.target!==p.range[0]) throw new Error('T6 : cible au bas courant attendue');
 console.log('T6 OK : passage uniformement sous le plancher, descente et un seul message');

 // T7. poids du corps sous le plancher : aucun barreau inferieur, la fourchette
 //     ne bouge pas, le signal seul passe (v2.16 : plus de descente de fourchette)
 p=pose('fentes-arriere');
 m=applyProgress('fentes-arriere',[3,3,3],true,false);
 if(p.range[0]!==8||p.range[1]!==15) throw new Error('T7 : fourchette '+p.range);
 if(dit(m,DESC)||!dit(m,ECHEC)) throw new Error('T7 : sans barreau inferieur, signal seul · '+m.join(' | '));
 m=applyProgress('fentes-arriere',[3,3,3],true,false);
 if(p.range[0]!==8||p.range[1]!==15) throw new Error('T7 : la base ne doit pas etre franchie');
 if(dit(m,DESC)||!dit(m,ECHEC)) throw new Error('T7 : au second passage, toujours le signal seul · '+m.join(' | '));
 console.log('T7 OK : sans barreau inferieur, la fourchette reste a sa base et le signal passe');

 // T8. poids du corps au plafond : la fourchette ne monte plus, le plafond
 //     s annonce a chaque passage et la cible reste bornee au haut (v2.16)
 p=pose('fentes-arriere');
 const suite=[];
 for(let i=0;i<5;i++){ m=applyProgress('fentes-arriere',[15,15,15],true,false); suite.push(p.range.join('-')+(dit(m,/Plafond atteint/)?'!':'?')); }
 if(suite.join(' ')!=='8-15! 8-15! 8-15! 8-15! 8-15!') throw new Error('T8 : sequence '+suite.join(' '));
 if(p.target!==15) throw new Error('T8 : cible bornee au haut attendue, '+p.target);
 console.log('T8 OK : cinq passages au plafond, fourchette immobile, plafond annonce a chaque fois');

 // T9. grace : premier echec masque, second echec descend
 p=pose('curls-halteres',{load:6,target:20});
 m=applyProgress('curls-halteres',[20,20,20],true,false);
 if(!p.grace) throw new Error('T9 : grace non posee a la montee de charge');
 const l0=p.load;
 m=applyProgress('curls-halteres',[7,7,7],true,false);
 if(p.load!==l0) throw new Error('T9 : la grace doit masquer la descente');
 if(!dit(m,ECHEC)) throw new Error('T9 : signal d echec attendu pendant la grace · '+m.join(' | '));
 if(p.grace) throw new Error('T9 : grace non consommee par un passage complet');
 m=applyProgress('curls-halteres',[7,7,7],true,false);
 if(p.load>=l0) throw new Error('T9 : descente attendue au passage suivant');
 if(!dit(m,DESC)||dit(m,ECHEC)) throw new Error('T9 : message de descente seul attendu');
 console.log('T9 OK : la grace protege d une action, jamais d une information');

 // T10. la grace survit a une seance allegee et a une lecture partielle
 p=pose('curls-halteres',{load:6,target:20});
 applyProgress('curls-halteres',[20,20,20],true,false);
 applyProgress('curls-halteres',[5,5,5],true,true);      // allegee
 if(!p.grace) throw new Error('T10 : une seance allegee ne consomme pas la grace');
 applyProgress('curls-halteres',[5],false,false);        // lecture partielle
 if(!p.grace) throw new Error('T10 : une lecture partielle ne consomme pas la grace');
 applyProgress('curls-halteres',[5,5,5],true,false);
 if(p.grace) throw new Error('T10 : un passage complet doit consommer la grace');
 console.log('T10 OK : la grace attend un passage complet reel');

 // T11. la grace est posee par charge, bande et fixed ; un plafond de fourchette n en pose pas, rien n a monte
 p=pose('curls-halteres',{load:6,target:20}); applyProgress('curls-halteres',[20,20,20],true,false);
 if(!p.grace) throw new Error('T11 : charge');
 p=pose('face-pulls',{band:'jaune',target:18}); applyProgress('face-pulls',[18,18,18],true,false);
 if(!p.grace) throw new Error('T11 : bande');
 p=pose('goblet-squat',{load:10,target:15}); applyProgress('goblet-squat',[15,15,15],true,false);
 if(!p.grace) throw new Error('T11 : fixed');
 p=pose('fentes-arriere'); applyProgress('fentes-arriere',[15,15,15],true,false);
 if(p.range[1]!==15) throw new Error('T11 : la fourchette ne doit pas bouger au plafond');
 if(p.grace) throw new Error('T11 : pas de grace au plafond, aucun palier n a change');
 console.log('T11 OK : grace sur trois montees, aucune sur un plafond de fourchette');

 // T12. div compte les montees reussies, plus les passages au plafond
 await neuf();
 state.div={push:0,pull:0};
 p=pose('curls-halteres',{load:6,target:20}); applyProgress('curls-halteres',[20,20,20],true,false);
 if(state.div.pull!==1) throw new Error('T12 : montee de charge non comptee');
 p=pose('rowing-suspension'); m=applyProgress('rowing-suspension',[15,15,15],true,false);
 if(!dit(m,/Plafond atteint/)) throw new Error('T12 : plafond attendu au haut de fourchette du tirage en suspension');
 if(state.div.pull!==1) throw new Error('T12 : un plafond de fourchette n est pas une montee, il ne compte pas (v2.16)');
 p=pose('gainage-lateral',{target:45});
 const avant=state.div.core===undefined?null:state.div.core;
 p=pose('pompes-poignees',{band:'vert',target:15});
 const d0=state.div.push;
 m=applyProgress('pompes-poignees',[15,15,15],true,false);
 if(!dit(m,/Plafond atteint/)) throw new Error('T12 : plafond attendu au dernier barreau');
 if(state.div.push!==d0) throw new Error('T12 : un passage au plafond ne doit plus incrementer');
 console.log('T12 OK : montees comptees, plafonds exclus, fourchette comprise');

 // T13. sous palier tenu : la descente joue, le partiel s emet, aucun recul possible
 p=pose('face-pulls',{band:'rouge',target:12,hold:true});
 m=applyProgress('face-pulls',[9,9,9],true,false);
 if(p.band!=='jaune') throw new Error('T13 : le filet reste actif sous palier tenu');
 p=pose('face-pulls',{band:'rouge',target:12,hold:true});
 m=applyProgress('face-pulls',[12,6,5],true,false);
 if(!dit(m,PART)) throw new Error('T13 : partiel attendu');
 if(p.target!==12) throw new Error('T13 : la cible est gelee sous palier tenu');
 if(dit(m,/cible recalée/)) throw new Error('T13 : aucun recul possible sous palier tenu');
 console.log('T13 OK : filet actif sous palier tenu, cible gelee');

 // T14. planche et gainage lateral : plafond = haut de fourchette, no-op garanti
 ['planche','gainage-lateral'].forEach(id=>{
   const q=pose(id), r0=q.range.join('-');
   const mm=applyProgress(id,[5,5,5],true,false);
   if(q.range.join('-')!==r0) throw new Error('T14 '+id+' : fourchette modifiee');
   if(dit(mm,DESC)||!dit(mm,ECHEC)) throw new Error('T14 '+id+' : signal seul attendu · '+mm.join(' | '));
 });
 console.log('T14 OK : les deux exercices tenus traversent la branche sans effet, et signalent quand meme');

 // T15. invariance : un passage dans la fourchette sans montee ne touche a rien
 await neuf(); state.div={push:0,pull:0};
 p=pose('goblet-squat',{load:10,target:10});
 const snap=JSON.stringify([p.load,p.range,state.div,state.loadUps]);
 m=applyProgress('goblet-squat',[11,11,11],true,false);
 if(m.length) throw new Error('T15 : aucun message attendu · '+m.join(' | '));
 if(JSON.stringify([p.load,p.range,state.div,state.loadUps])!==snap) throw new Error('T15 : etat modifie');
 if(p.target!==12) throw new Error('T15 : cible '+p.target);
 console.log('T15 OK : dans la fourchette, seule la cible bouge');

 // T16. regle des bornes sur une fourchette immobile : un passage sous le
 //      plancher recale la cible au bas de la fourchette courante, qui est la base
 p=pose('fentes-arriere',{target:12});
 applyProgress('fentes-arriere',[5,5,5],true,false);
 if(p.range.join('-')!=='8-15') throw new Error('T16 : fourchette '+p.range);
 if(p.target!==8) throw new Error('T16 : cible '+p.target+' attendue 8');
 console.log('T16 OK : recalibrage au bas de la fourchette courante');

 // T17. echec total pendant la grace : signal emis, aucune action
 p=pose('goblet-squat',{load:12,target:8}); p.grace=true;
 const lg=p.load;
 m=applyProgress('goblet-squat',[3,3,3],true,false);
 if(p.load!==lg) throw new Error('T17 : la grace doit masquer la descente');
 if(!dit(m,ECHEC)) throw new Error('T17 : signal d echec attendu · '+m.join(' | '));
 console.log('T17 OK : pendant la grace, l information passe');

 // T18. exercice au poids du corps a sa fourchette d origine : signal, pas d action
 p=pose('mollets-debout');
 m=applyProgress('mollets-debout',[4,4,4],true,false);
 if(p.range.join('-')!==DB['mollets-debout'].reps.join('-')) throw new Error('T18 : la base ne bouge pas');
 if(!dit(m,ECHEC)||dit(m,DESC)) throw new Error('T18 : signal seul attendu, c est le cas nominal · '+m.join(' | '));
 console.log('T18 OK : a la fourchette d origine, le no-op est silencieux mais le signal passe');

 // T19. exercice au barreau le plus bas de son echelle : aucune descente possible
 p=pose('face-pulls',{band:'jaune',target:10});
 m=applyProgress('face-pulls',[5,5,5],true,false);
 if(p.band!=='jaune') throw new Error('T19 : pas de barreau sous le jaune');
 if(!dit(m,ECHEC)||dit(m,DESC)) throw new Error('T19 : signal seul attendu · '+m.join(' | '));
 if(!/^Face pulls/.test(m.filter(x=>ECHEC.test(x))[0]||'')) throw new Error('T19 : le signal doit nommer l exercice, sinon deux signaux se confondent au recapitulatif');
 console.log('T19 OK : sans barreau inferieur, l information passe quand meme, et elle nomme l exercice');

 // T20. lecture partielle : jamais de descente, toujours le signal
 p=pose('face-pulls',{band:'rouge',target:10});
 m=applyProgress('face-pulls',[8],false,false);
 if(p.band!=='rouge') throw new Error('T20 : une lecture ampute ne doit pas retrograder');
 if(!dit(m,ECHEC)) throw new Error('T20 : signal attendu · '+m.join(' | '));
 console.log('T20 OK : « toutes les series » ne s affirme pas sur un journal ampute');

 // T21. grace pendante puis palier tenu : consommee par le passage complet sous hold
 p=pose('goblet-squat',{load:12,target:8}); p.grace=true; p.hold=true;
 const lh=p.load;
 applyProgress('goblet-squat',[3,3,3],true,false);
 if(p.load!==lh) throw new Error('T21 : descente masquee attendue');
 if(p.grace) throw new Error('T21 : la grace est liee au passage, pas au regime');
 applyProgress('goblet-squat',[3,3,3],true,false);
 if(p.load>=lh) throw new Error('T21 : descente attendue au passage suivant, meme sous palier tenu');
 console.log('T21 OK : la grace se consomme sous palier tenu comme ailleurs');

 // T22. huit passages au plafond puis dix sous le plancher sur tous les
 //      exercices au poids du corps et tenus : la fourchette ne bouge dans
 //      aucun sens, la cible reste dedans, le plafond s annonce (v2.16)
 const BW=Object.keys(DB).filter(id=>(DB[id].mode==='bw'||DB[id].mode==='time')&&!DB[id].bnd&&!DB[id].rhythm&&!DB[id].assise&&DB[id].reps)   /* v2.17 : les tenues rythmees ont une echelle ; v2.18 : l assise aussi */;
 BW.forEach(id=>{
   const q=pose(id), base=DB[id].reps.slice(), pas=(DB[id].mode==='time')?5:1;
   for(let i=0;i<8;i++){ delete q.grace; m=applyProgress(id,[base[1],base[1],base[1]],true,false);
     if(q.range.join('-')!==base.join('-')) throw new Error('T22 '+id+' : fourchette relevee, '+q.range);
     if(!dit(m,/Plafond atteint/)) throw new Error('T22 '+id+' : plafond non annonce au passage '+(i+1)); }
   if(q.target!==base[1]) throw new Error('T22 '+id+' : cible '+q.target+' au lieu du haut '+base[1]);
   for(let i=0;i<10;i++){
     delete q.grace;
     m=applyProgress(id,[base[0]-pas-1,base[0]-pas-1,base[0]-pas-1],true,false);
     if(q.range.join('-')!==base.join('-')) throw new Error('T22 '+id+' : fourchette descendue, '+q.range);
     if(dit(m,DESC)) throw new Error('T22 '+id+' : message de descente sur un exercice sans barreau inferieur');
     if(q.target<q.range[0]||q.target>q.range[1]) throw new Error('T22 '+id+' : cible '+q.target+' hors de '+q.range);
   }
 });
 console.log('T22 OK : '+BW.length+' exercices, fourchette immobile dans les deux sens, cible dedans, plafond annonce');

 // T23. cible heritee au-dessus du haut sur un palier tenu : elle est bornee au haut
 p=pose('bird-dog',{target:14,hold:true});
 applyProgress('bird-dog',[1,1,1],true,false);
 if(p.range.join('-')!=='6-12') throw new Error('T23 : fourchette '+p.range);
 if(p.target!==12) throw new Error('T23 : cible '+p.target+' attendue bornee a 12');
 console.log('T23 OK : sous palier tenu, une cible hors fourchette est bornee au haut');

 // T24. exercice charge a charge nulle : aucune descente de charge ni de fourchette
 p=pose('developpe-sol',{load:0,target:8});
 const r24=p.range.join('-');
 m=applyProgress('developpe-sol',[3,3,3],true,false);
 if(p.load!==0||p.range.join('-')!==r24) throw new Error('T24 : rien ne doit bouger');
 if(!dit(m,ECHEC)) throw new Error('T24 : signal attendu');
 console.log('T24 OK : comportement decide, plus herite, pour une charge nulle');

 // T25. verrou a compte multiple : plafonne par le volume joue, jamais par le journal
 await neuf();
 const V='tractions-assistees-pronation', L=DB[V].lock, anc=L.after;
 const met=(sets)=>{ state.unlocked={}; state.perf[anc]=Object.assign(perfOf(anc),{sets:sets.slice(),best:Math.max.apply(null,sets.concat([0]))}); };
 met([6,6]); checkUnlocks(3,false);
 if(state.unlocked[V]) throw new Error('T25 : deux series ne suffisent pas au volume 3');
 met([6,6]); checkUnlocks(2,false);
 if(!state.unlocked[V]) throw new Error('T25 : au volume 2, deux series doivent suffire, sinon le verrou est irrealisable');
 met([7]); checkUnlocks(2,false);
 if(state.unlocked[V]) throw new Error('T25 : une seule serie d une seance quittee ne doit pas ouvrir');
 met([6,6,6]); checkUnlocks(3,false);
 if(!state.unlocked[V]) throw new Error('T25 : trois series au volume 3 doivent ouvrir');
 console.log('T25 OK : le volume est la barre, les series jouees sont la preuve');

 // T26. une seance allegee n ouvre aucun verrou
 met([6,6,6]); checkUnlocks(3,true);
 if(state.unlocked[V]) throw new Error('T26 : une seance allegee ne deverrouille rien');
 checkUnlocks(3,false);
 if(!state.unlocked[V]) throw new Error('T26 : la seance normale suivante doit ouvrir');
 console.log('T26 OK : un mode qui ne fait rien monter ne deverrouille rien');

 // T27. aucun verrou ne lit best, et les deux verrous de la chaine posterieure
 //      prouvent une capacite actuelle et non un maximum historique
 await neuf();
 const q=perfOf('goblet-squat'); q.best=15; q.sets=[8,8,8];
 checkUnlocks(3,false);
 if(state.unlocked['rdl-kettlebell']) throw new Error('T27 : best ne doit plus ouvrir un verrou');
 /* v2.1 : les deux verrous de la charniere exigent DEUX series, comme les
    quatre autres verrous du catalogue. Une serie isolee au plafond se
    rattrape par un bon jour, deux series dans la meme seance prouvent la
    capacite courante, et c est la famille la plus exposee sur une L5. */
 q.sets=[15,8,8]; checkUnlocks(3,false);
 if(state.unlocked['rdl-kettlebell']) throw new Error('T27 : une seule serie a 15 ne doit plus ouvrir');
 q.sets=[15,15,8]; checkUnlocks(3,false);
 if(!state.unlocked['rdl-kettlebell']) throw new Error('T27 : deux series a 15 sur le dernier passage doivent ouvrir');
 console.log('T27 OK : les verrous lisent le dernier passage, plus jamais best');

 // T28. l enonce affiche suit le compte reellement exige
 await neuf();
 state.rounds=3;
 if(!/Fais 3 séries de 6/.test(lockCond(DB[V]))) throw new Error('T28 : enonce au volume 3 : '+lockCond(DB[V]));
 state.rounds=2;
 if(!/Fais 2 séries de 6/.test(lockCond(DB[V]))) throw new Error('T28 : enonce au volume 2 : '+lockCond(DB[V]));
 if(/\\{n\\}/.test(lockCond(DB['rdl-kettlebell']))) throw new Error('T28 : jeton non substitue');
 console.log('T28 OK : l enonce dit ce qui est verifie, a tous les volumes');

 /* v2.12 : les deux sujets fabriques ci-dessous portent secs, que validateSet
    ecrit a cote de log. On complete le sujet plutot que d assouplir
    l application : le seul constructeur reel de cur est startSession, et il
    l initialise. */
 // T29. rendu de la saisie : l explication du zero existe et suit l etat du bouton
 await neuf();
 const st={k:'set',id:'curls-halteres',key:'curls-halteres'};
 cur={steps:[st],i:0,log:{},secs:{},xp:0,done:0,type:'alterne',rounds:3};
 st.val=10;
 let h=setHtml(st);
 if(!/id="vz"/.test(h)) throw new Error('T29 : explication absente du rendu');
 if(!/id="vz"[^>]*display:none/.test(h)) throw new Error('T29 : elle doit etre masquee au-dessus de zero');
 if(/id="vb"[^>]*disabled/.test(h)) throw new Error('T29 : bouton actif attendu a 10');
 st.val=0; h=setHtml(st);
 if(/id="vz"[^>]*display:none/.test(h)) throw new Error('T29 : elle doit etre visible a zero');
 if(!/id="vb"[^>]*disabled/.test(h)) throw new Error('T29 : bouton inerte attendu a zero');
 console.log('T29 OK : le bouton et son explication sont rendus ensemble, et bump les bascule sans re-rendre');

 // T30. une serie a zero n est jamais journalisee
 cur={steps:[st],i:0,log:{},secs:{},xp:0,done:0,type:'alterne',rounds:3};
 st.val=0; validateSet();
 if(Object.keys(cur.log).length) throw new Error('T30 : une serie a zero ne doit rien enregistrer');
 st.val=7; validateSet();
 if((cur.log['curls-halteres']||[]).join()!=='7') throw new Error('T30 : la serie valide doit passer');
 console.log('T30 OK : zero refuse a la validation, pas seulement grise');

 console.log('TESTS FILET, CLIQUET ET VERROUS V1.15 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
