/* test16 : modele de temps v1.14. Tempo par exercice, installation, bascule de
   cote la ou l outil n en compte aucune, et remontage de charge compte sur la
   sequence reelle des series. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ localStorage._m={}; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile(); state.prep=5; };
 await neuf();

 // 1. le tempo appartient a l exercice, avec un defaut et des exceptions
 if(TEMPO!==4.5) throw new Error('tempo par defaut attendu a 4,5 s');
 if(tempoOf('pompes-poignees')!==4.5) throw new Error('un exercice sans exception prend le defaut');
 if(tempoOf('kb-swings')!==1.5) throw new Error('un mouvement balistique ne prend pas le tempo controle');
 if(tempoOf('mollets-debout')!==3.5) throw new Error('amplitude courte : tempo propre');
 /* v2.17 : le bird-dog est chronometre, il n a plus de tempo modelise */
 if(tempoOf('bird-dog')!==TEMPO) throw new Error('tenue rythmee : plus de tempo propre, l exercice est chronometre');
 Object.keys(TEMPO_EX).forEach(id=>{ if(!DB[id]) throw new Error('tempo declare pour un exercice inconnu : '+id); });
 console.log('tempo OK : defaut a 4,5 s, exceptions declarees exercice par exercice');

 // 2. installation : courte pour un etirement, sans saisie ni materiel
 const st=STRETCH_POOL[0], e=DB[st];
 if(serieSec(st,false)!==INSTALL_STRETCH+prepSec()+e.dur) throw new Error('un etirement coute son installation courte, son decompte et sa duree');
 if(INSTALL_STRETCH>=INSTALL) throw new Error('un etirement ne doit pas couter autant qu une serie chiffree');
 /* le decompte de preparation reste compte a part : le couper allege le total */
 const avecPrep=serieSec(st,false); state.prep=0;
 if(serieSec(st,false)!==avecPrep-5) throw new Error('le decompte de preparation doit peser exactement sa duree');
 state.prep=5;
 console.log('installation OK : etirement a '+INSTALL_STRETCH+' s, serie a '+INSTALL+' s, decompte compte a part');

 // 3. bascule de cote : seulement la ou l outil n en compte aucune
 ['fentes-arriere','step-ups','bird-dog','dead-bug'].forEach(id=>{
   if(switchSec(id)) throw new Error('alterne a chaque repetition, aucune bascule a compter : '+id); });
 if(switchSec('pallof-press')!==5) throw new Error('pallof press : pivot autour d un ancrage fixe');
 if(switchSec('rowing-kettlebell')!==10) throw new Error('rowing kettlebell : charge reposee et deux appuis deplaces');
 /* une tenue par cote rejoue un decompte a chaque cote : deja compte, jamais doublonne */
 const gl=DB['gainage-lateral'], cg=perfOf('gainage-lateral').target;
 if(serieSec('gainage-lateral',false)!==INSTALL+2*(prepSec()+cg)) throw new Error('une tenue par cote ne prend pas de bascule en plus de ses deux decomptes');
 const pp=perfOf('pallof-press').target;
 if(serieSec('pallof-press',false)!==INSTALL+5+Math.round(pp*tempoOf('pallof-press')*2)) throw new Error('pallof press : bascule ajoutee une fois, travail double');
 console.log('bascule OK : deux exercices concernes, tenues et etirements bilateraux exclus');

 // 4. remontage : zero quand rien ne se dispute une ressource
 await neuf();
state.rounds=3; state.warm='complet'; state.cardio=false; state.stretch=true;
 const idx=(slot,id)=>{ const p=SLOTS[slot].pool.filter(x=>!isLocked(x)); const i=p.indexOf(id);
   if(i<0) throw new Error('exercice hors vivier tirable : '+id); state.slotIdx[slot]=i; };
 idx('push','pompes-poignees'); idx('pull','rowing-suspension'); idx('legs','pont-fessier'); idx('core','planche');
 let plan=buildSession();
 if(remounts(plan).n!==0) throw new Error('aucune charge partagee : aucun remontage');
 if(planParts(plan).remount!==0) throw new Error('le poste remontage doit valoir zero');
 if(remountPairs(plan).length) throw new Error('aucun montage a alterner a signaler');

 // 5. deux exercices sur les memes halteres a des charges differentes
 idx('push','elevations-laterales'); idx('pull','curls-halteres');
 perfOf('elevations-laterales').load=2; perfOf('curls-halteres').load=4;
 plan=buildSession();
 const rm=remounts(plan);
 /* le circuit repasse de l un a l autre a chaque tour : 2R-1 changements, le
    premier montage etant fait avant la seance */
 if(rm.n!==2*3-1) throw new Error('cinq remontages attendus sur trois tours, obtenu '+rm.n);
 if(rm.sec!==rm.n*REMOUNT) throw new Error('le poste doit valoir le nombre de remontages par leur cout');
 if(planParts(plan).remount!==rm.sec) throw new Error('la decomposition doit porter le remontage');
 const pairs=remountPairs(plan);
 if(pairs.length!==1||pairs[0].gear!=='halteres'||pairs[0].items.length!==2) throw new Error('les deux montages a alterner doivent etre nommes');
 /* a charges egales, plus rien a changer : le nombre tombe a zero */
 perfOf('curls-halteres').load=2;
 if(remounts(buildSession()).n!==0) throw new Error('memes charges : aucun remontage');
 perfOf('curls-halteres').load=4;
 /* et le volume choisi fait varier le nombre, puisqu il se compte sur la sequence */
 state.rounds=2; if(remounts(buildSession()).n!==3) throw new Error('deux tours : trois remontages');
 state.rounds=4; if(remounts(buildSession()).n!==7) throw new Error('quatre tours : sept remontages');
 state.rounds=3;
 console.log('remontage OK : nul sans conflit, 2R-1 quand le circuit alterne deux montages');

 // 6. une bande se change de barreau, ce n est pas un montage
 if(gearKey('face-pulls')) throw new Error('un elastique ne demande aucun montage');
 if(gearKey('pompes-poignees')) throw new Error('le poids du corps ne demande aucun montage');
 if(gearKey('curls-halteres')!=='halteres') throw new Error('les halteres sont une ressource partagee');
 if(gearKey('goblet-squat')!=='kb') throw new Error('la kettlebell et ses lestes sont une ressource partagee');

 // 7. l avertissement remonte dans le detail de seance, et seulement alors
 view='home'; render();
 if(!/changer 5 fois pendant la séance/.test(html)) throw new Error('le detail doit prevenir du changement de montage');
 if(!/Les haltères passent de/.test(html)) throw new Error('le detail doit nommer les deux montages');
 perfOf('curls-halteres').load=2; render();
 if(/changer \\d+ fois pendant la séance/.test(html)) throw new Error('sans conflit, aucun avertissement');
 console.log('avertissement OK : nomme les deux montages et leur nombre, absent sinon');

 // 8. le temps de chaque exercice s affiche et se retrouve dans le poste
 await neuf();
state.rounds=3; state.stretch=true; state.cardio=false;
 const pl=buildSession(), parts=planParts(pl);
 let somme=0; pl.exos.forEach(id=>somme+=3*serieSec(id,pl.light));
 if(somme!==parts.exos) throw new Error('le poste Exercices doit valoir la somme des exercices');
 view='home'; render();
 pl.exos.forEach(id=>{ const t=fmtDur(3*serieSec(id,pl.light));
   if(html.indexOf(t)<0) throw new Error('temps absent du detail pour '+id+' (attendu '+t+')'); });
 console.log('temps par exercice OK : affiche ligne par ligne, somme egale au poste');

 // 9. tout ce que l outil chronometre reste compte a sa valeur exacte
 const wm=warmupSec('complet');
 if(wm!==START_PREP+WARMUP.reduce((a,x)=>a+x.s,0)) throw new Error('l echauffement vaut son decompte de lancement plus la somme de ses etapes (v2.22)');
 if(warmupSec('aucun')!==0) throw new Error('sans echauffement, ni etapes ni decompte de lancement');
 /* v2.10 : les raccords de tour sont des repos, mais pas au tarif transition */
 if(parts.trans!==pl.steps.filter(x=>x.k==='rest'&&!x.pause).length*transSec()) throw new Error('les transitions valent leur nombre par leur duree');
 if(parts.pause!==pl.steps.filter(x=>x.k==='rest'&&x.pause).length*PAUSE_TOUR) throw new Error('les pauses de raccord valent leur nombre par leur duree');
 state.cardio=true;
 if(planParts(buildSession()).cardio!==CARDIO_SEC) throw new Error('le cardio vaut sa duree');
 console.log('postes chronometres OK : echauffement, transitions et cardio a leur valeur exacte');

 console.log('TESTS MODELE DE TEMPS V1.14 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
