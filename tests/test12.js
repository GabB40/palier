// Nouveautes v1.10 : bande de couverture a echelle fixe, plancher mobile par
// groupe en entretien, projection de la configuration, ecretage au-dela de 24,
// message au-dessus de la bande, zone de reference repliable, detail de seance
// ouvert par defaut.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='complet'; state.cardio=false; state.stretch=false; state.rounds=3; state.goal=4;};
 const REP={push:'pompes-poignees',pull:'face-pulls',legs:'goblet-squat',core:'planche'};
 /* v1.11 : la couverture se moyenne sur les semaines revolues, l historique
    de test vit donc dans la semaine precedente et porte le volume d une seule
    semaine, sans le facteur 4 de l ancien denominateur fixe */
 const poser=(o)=>{ const j=new Date(Date.now()-7*864e5).toISOString();
   state.hist=[{date:j,dur:900,items:Object.keys(o).map(c=>({id:REP[c],sets:new Array(o[c]).fill(10)}))}]; };
 const tenir=(cat,v)=>holdableIds().filter(id=>DB[id].cat===cat&&!isLocked(id)).forEach(id=>{const p=perfOf(id); if(v)p.hold=true; else delete p.hold;});
 await neuf();

 // 1. l etat par defaut ne porte plus showDetail, et le detail de seance est ouvert
 if('showDetail' in defaultState()) throw new Error('showDetail aurait du disparaitre de l etat par defaut');
 view='home'; render();
 if(!/<details class="card" data-k="home-detail" open/.test(html)) throw new Error('le detail de seance doit etre ouvert par defaut');
 console.log('detail OK : showDetail retire, detail de seance ouvert par defaut');

 // 2. plancher par groupe : binaire, tous les exercices tenables et deverrouilles
 if(covFloor('legs')!==8) throw new Error('plancher de construction attendu a 8');
 tenir('legs',true);
 if(!groupHeld('legs')) throw new Error('groupe jambes attendu en entretien');
 if(covFloor('legs')!==4) throw new Error('plancher d entretien attendu a 4, obtenu '+covFloor('legs'));
 if(covFloor('push')!==8) throw new Error('les autres groupes ne doivent pas bouger');
 const verrouilles=holdableIds().filter(id=>DB[id].cat==='legs'&&isLocked(id));
 if(!verrouilles.length) throw new Error('le vivier jambes devrait contenir au moins un exercice verrouille');
 if(verrouilles.some(id=>isHeld(id))) throw new Error('les exercices verrouilles ne devaient pas etre tenus');
 const un=holdableIds().filter(id=>DB[id].cat==='legs'&&!isLocked(id))[0];
 delete perfOf(un).hold;
 if(groupHeld('legs')) throw new Error('un seul exercice relache doit suffire a sortir de l entretien');
 if(covFloor('legs')!==8) throw new Error('plancher attendu de retour a 8');
 tenir('legs',true);
 console.log('plancher OK : binaire par groupe, verrouilles ignores, un relache suffit a repasser a 8');

 // 3. echelle fixe a 24 et ecretage
 if(COV_SCALE!==24||COV_MIN!==8||COV_MAX!==16||COV_MIN_HOLD!==4) throw new Error('bornes de bande inattendues');
 if(covPct(8)!==33.3||covPct(16)!==66.7||covPct(4)!==16.7) throw new Error('graduations mal placees');
 if(covPct(27)!==100||covPct(-3)!==0) throw new Error('ecretage de position attendu entre 0 et 100');
 console.log('echelle OK : 8 au tiers, 16 aux deux tiers, positions ecretees');

 // 4. projection : issue du volume choisi, jamais d une table (v1.13)
 const cas=[['complet',true,2,4],['complet',false,3,4],['complet',false,4,4],['court',false,4,5],['complet',false,2,3],['aucun',false,3,4]];
 cas.forEach(([w,c,r,g])=>{
   state.warm=w; state.cardio=c; state.rounds=r; state.goal=g;
   const attendu=r*g;
   if(covProjection().n!==attendu) throw new Error('projection '+w+'/'+c+'/'+r+' : '+covProjection().n+' au lieu de '+attendu);
   const det=covProjection().det;
   if(det.indexOf(r+' série')<0) throw new Error('le volume choisi doit figurer dans le detail');
   if(det.indexOf(c?'avec cardio':'sans cardio')<0) throw new Error('le cardio doit figurer dans le detail');
 });
 /* le cardio s ajoute desormais, il ne retire plus un tour en silence */
 state.warm='complet'; state.cardio=true; state.rounds=2; state.goal=4;
 if(covProjection().n!==8) throw new Error('le cardio ne doit plus rogner le volume');
 if(covProjection().det.indexOf('avec cardio')<0) throw new Error('le cardio active doit etre annonce');
 state.warm='complet'; state.cardio=false; state.rounds=3; state.goal=4;
 if(covProjection().n!==12) throw new Error('3 series a 4 jours : 12 series attendues');
 console.log('projection OK : conforme au volume choisi sur 6 configurations, cardio additif');

 // 5. rendu de la card : rails, pastille, graduation 4, couleur du chiffre
 poser({push:11,pull:12,legs:5,core:9});
 view='prog'; render();
 if(!/Configuration actuelle \\(3 séries par exercice, échauffement complet, sans cardio, objectif 4 jours\\) : <b class="num" style="color:var\\(--ok\\)">12<\\/b>/.test(html)) throw new Error('ligne de projection attendue en vert');
 if(!/<span class="tenu">tenu<\\/span>/.test(html)) throw new Error('pastille tenu attendue sur le groupe en entretien');
 if((html.match(/class="tenu"/g)||[]).length!==1) throw new Error('une seule pastille attendue');
 if(html.indexOf('>4</span>')<0) throw new Error('graduation 4 attendue des qu un groupe est en entretien');
 if(!/<span class="zone" style="left:16.7%;width:50%">/.test(html)) throw new Error('zone d entretien attendue de 4 a 16');
 if(!/<span class="zone" style="left:33.3%;width:33.4%">/.test(html)) throw new Error('zone de construction attendue de 8 a 16');
 if(/class="cur out"/.test(html)) throw new Error('aucun groupe n est hors de sa bande ici');
 if(/en retrait/.test(html)) throw new Error('un groupe en entretien a 5 ne doit pas etre signale en retrait');
 console.log('rendu OK : pastille, graduation 4, zone elargie, jambes a 5 non reprochees');

 // 6. hors bande : au-dessus, en dessous, et ecretage du rail
 tenir('legs',false);
 poser({push:20,pull:27,legs:5,core:12});
 view='prog'; render();
 if((html.match(/class="cur out"/g)||[]).length!==3) throw new Error('trois curseurs hors bande attendus, obtenu '+(html.match(/class="cur out"/g)||[]).length);
 if(!/<span class="clip">/.test(html)) throw new Error('ecretage attendu au-dela de 24');
 if((html.match(/class="clip"/g)||[]).length!==1) throw new Error('un seul rail ecrete attendu');
 if(html.indexOf('>27</span>')<0) throw new Error('le chiffre exact doit rester affiche malgre l ecretage');
 if(!/Poussé et Tiré au-dessus de la bande/.test(html)) throw new Error('message au-dessus de la bande attendu');
 if(!/jours de repos/.test(html)) throw new Error('incise sur les jours de repos attendue');
 if(!/Jambes en retrait/.test(html)) throw new Error('le signal en retrait existant doit rester');
 console.log('hors bande OK : trois curseurs orange, un rail ecrete, message au-dessus avec les jours de repos');

 // 7. rien au-dessus de la bande quand tout est dedans, et projection orange hors bande
 poser({push:9,pull:10,legs:9,core:12});
 view='prog'; render();
 if(/au-dessus de la bande/.test(html)) throw new Error('aucun message ne doit apparaitre dans la bande');
 /* v1.13 : le volume plafonne a 4 series, c est l objectif hebdo qui porte
    la projection au-dessus de la bande */
 state.warm='court'; state.rounds=4; state.goal=5;
 view='prog'; render();
 if(!/<b class="num" style="color:var\\(--flame\\)">20<\\/b>/.test(html)) throw new Error('projection a 20 attendue en orange');
 state.warm='complet'; state.rounds=2; state.goal=3;
 view='prog'; render();
 if(!/<b class="num" style="color:var\\(--flame\\)">6<\\/b>/.test(html)) throw new Error('projection a 6 attendue en orange');
 state.warm='complet'; state.rounds=3; state.goal=4;
 console.log('projection OK : verte dans la bande, orange au-dessus comme en dessous');

 // 8. zone de reference repliable, fermee par defaut, et graduation 4 absente hors entretien
 view='prog'; render();
 if(!/<summary>Comment lire ces chiffres<\\/summary>/.test(html)) throw new Error('zone de reference absente');
 if(/<details style="margin-top:12px[^>]*open/.test(html)) throw new Error('la zone de reference doit etre fermee par defaut');
 if(!/bande visée/.test(html)||!/hors bande/.test(html)) throw new Error('legende attendue dans la zone repliable');
 if(/class="tenu"/.test(html)) throw new Error('aucune pastille hors entretien');
 if(html.indexOf('>4</span>')>=0) throw new Error('graduation 4 uniquement quand un groupe est en entretien');
 console.log('reference OK : zone fermee par defaut, legende dedans, graduation 4 conditionnelle');

 // 9. l ancienne barre proportionnelle a disparu, l etat sauvegarde n a pas bouge
 if(/<div class="bar" style="flex:1"><i style="width:/.test(html)) throw new Error('l ancienne barre a echelle variable subsiste');
 const avant=JSON.stringify(state);
 view='prog'; render(); view='home'; render();
 if(JSON.stringify(state)!==avant) throw new Error('le rendu ne doit rien ecrire dans l etat');
 if(!VERSION) throw new Error('version absente');
 console.log('etat OK : ancienne barre retiree, aucun effet de bord, version '+VERSION);
 console.log('TESTS V1.10 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
