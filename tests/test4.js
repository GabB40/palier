const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({style:{},click(){},remove(){},set onchange(f){}}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
global.Blob=function(a){this.parts=a};global.URL={createObjectURL:()=>'blob:x',revokeObjectURL(){}};
global.FileReader=function(){this.readAsText=()=>{}};
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 const D=d=>new Date(Date.now()-d*864e5).toISOString();
 // 1. jours actifs : 3 seances le meme jour = 1 jour actif
 state.goal=4; state.hist=[];
 for(let i=0;i<3;i++) state.hist.push({date:D(0),type:'alterne',items:[],xp:0});
 if(thisWeekCount(state)!==1) throw new Error('3 seances/jour devraient compter 1 jour, obtenu '+thisWeekCount(state));
 // 4 jours distincts valident la semaine
 state.hist=[0,1,2,3].map(i=>({date:D(i),type:'alterne',items:[],xp:0}));
 const wc=weekCounts(state), tot=Object.values(wc).reduce((a,v)=>a+v,0);
 if(tot!==4) throw new Error('4 jours distincts attendus, obtenu '+tot);
 console.log('jours actifs OK : 3 seances/jour -> 1, 4 jours -> 4');
 // 2. thisWeekCount respecte son parametre
 if(thisWeekCount({goal:4,hist:[]})!==0) throw new Error('thisWeekCount ignore son parametre');
 console.log('thisWeekCount(parametre) OK');
 // 3. seance incomplete : enregistree, sans bonus, sans rotation
 state=null; await loadState(); domicile(); state.warm='aucun'; state.cardio=false;
 const idx0=Object.assign({},state.slotIdx);
 startSession();
 const st=cur.steps[0]; TVAL(st,8);
 const xpAvant=state.xp;
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const h=state.hist[state.hist.length-1];
 if(!h||!h.inc) throw new Error('seance incomplete non marquee');
 if(h.items.length!==1) throw new Error('items incomplets: '+h.items.length);
 if(h.xp!==XP_SET) throw new Error('xp incomplete devrait etre '+XP_SET+', obtenu '+h.xp);
 if(typeof h.real!=='number'||h.real<60) throw new Error('duree reelle absente');
 if(JSON.stringify(state.slotIdx)!==JSON.stringify(idx0)) throw new Error('rotation avancee sur incomplete');
 if(view!=='recap') throw new Error('pas de recap apres quit, vue='+view);
 if(!/incomplète/.test(html)) throw new Error('recap sans mention incomplete');
 console.log('seance incomplete OK : enregistree, +'+h.xp+' XP, '+h.real+' s reels, rotation intacte');
 cur=null;
 // 4. seance complete : rotation avance, real present
 startSession();
 let g=0; while(view==='session'&&g++<300){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set') TVAL(s,8); else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 const h2=state.hist[state.hist.length-1];
 if(h2.inc) throw new Error('seance complete marquee incomplete');
 if(typeof h2.real!=='number') throw new Error('real absent sur seance complete');
 if(state.slotIdx.push!==idx0.push+1) throw new Error('rotation non avancee');
 console.log('seance complete OK : real='+h2.real+' s, rotation avancee');
 cur=null;
 // 5. statistiques : calculs et rendu
 state.hist=[
  {date:'2026-07-06T19:00:00.000Z',type:'alterne',mode:'alterne',dur:15,real:840,xp:40,
   items:[{id:'curls-halteres',sets:[10,9,9],load:4},{id:'pompes-poignees',sets:[8,7],load:0},{id:'goblet-squat',sets:[8,8],load:10},{id:'planche',sets:[30],load:0}]},
  {date:D(9),type:'alterne',mode:'alterne',dur:15,real:900,xp:40,
   items:[{id:'curls-halteres',sets:[12,11,10],load:6},{id:'rowing-kettlebell',sets:[10,9],load:10},{id:'fentes-arriere',sets:[8,8],load:0},{id:'bird-dog',sets:[8,8],load:0}]},
  {date:D(10),type:'alterne',mode:'alterne',dur:15,real:930,xp:40,
   items:[{id:'face-pulls',sets:[12,12,11],load:0},{id:'pompes-poignees',sets:[9,8],load:0},{id:'mollets-debout',sets:[20,20],load:0},{id:'dead-bug',sets:[10,10],load:0}]}
 ];
 const lj=loadJourney(state);
 const c=lj.find(j=>j.id==='curls-halteres');
 if(!c||c.a.load!==4||c.b.load!==6) throw new Error('trajectoire curls fausse');
 const cov=coverage(state,4);
 if(cov.pull<=0||cov.push<=0) throw new Error('couverture vide');
 const ts=timeStats(state);
 if(ts.avgReal!==15||ts.n!==3) throw new Error('timeStats: avg '+ts.avgReal+' n '+ts.n);
 view='prog'; render();
 ['Assiduité','Couverture musculaire','Trajectoire des charges','Temps d\\'entraînement'].forEach(s=>{
   if(html.indexOf(s)<0) throw new Error('bloc absent: '+s); });
 if(!/4 kg en juil\\S* 2026 → 6 kg en/.test(html.replace(/,/g,'.'))&&html.indexOf('4 kg en')<0) throw new Error('trajectoire non affichee');
 console.log('stats OK : trajectoire 4->6 kg, couverture',JSON.stringify(cov),', temps moyen',ts.avgReal,'min');
 // 6. etat vide : la vue prog se rend sans stats ni erreur
 state.hist=[]; view='prog'; render();
 if(/Assiduité/.test(html)) throw new Error('stats affichees sans historique');
 console.log('etat vide OK');
 // 7. export : payload valide et import symetrique
 state.xp=123; state.hist=[{date:D(0),type:'alterne',items:[],xp:10}];
 const pl=JSON.parse(payload());
 if(pl.app!=='palier'||pl.xp!==123) throw new Error('payload invalide');
 applyImport(pl);
 if(state.xp!==123) throw new Error('import rate');
 let ko=false; try{applyImport({foo:1});}catch(e){ko=true;}
 if(!ko) throw new Error('import accepte un contenu invalide');
 downloadData();
 console.log('export/import OK');
 console.log('TESTS V1.1 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
