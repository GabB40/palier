const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 // 1. integrite base
 const ids=Object.keys(DB);
 ids.forEach(id=>{const e=DB[id];
   if(!e.nom||!e.desc||!e.vig) throw new Error('champ manquant '+id);
   if(!e.cat) throw new Error('cat manquante '+id);
   if(e.fb&&!DB[e.fb]) throw new Error('fb invalide '+id);
   if(e.lock&&!DB[e.lock.after]) throw new Error('lock invalide '+id);
 });
 console.log('exercices:',ids.length,'| illustres:',ids.filter(i=>IMG[i]).length);
 SLOT_ORDER.forEach(s=>SLOTS[s].pool.forEach(id=>{if(!DB[id])throw new Error('pool '+s+' -> '+id)}));
 if(typeof SESSIONS!=='undefined'||typeof CIBLE_ORDER!=='undefined') throw new Error('le decoupage du mode cible survit');
 STRETCH_POOL.forEach(id=>{if(!DB[id]||DB[id].mode!=='stretch')throw new Error('etirement invalide '+id)});
 WARMUP.forEach(w=>{if(w.img&&!IMG[w.img])throw new Error('warmup img '+w.img)});
 // 2. echelle de charge
 const L=loadLadder(state.gear);
 if(L[0]!==2) throw new Error('ladder debut');
 console.log('paliers:',L.length,'de',L[0],'a',L[L.length-1],'kg');
 // 3. volume et duree annoncee (v1.13 : le volume se choisit, le temps se calcule)
 let prev=0;
 ROUNDS_CHOICES.forEach(r=>{
   state.rounds=r;
   const p=buildSession();
   const est=Math.round(estimateSec(p)/60);
   if(p.steps.filter(s=>s.k==='set'&&!s.cool).length!==r*SLOT_ORDER.length) throw new Error('series prevues '+r);
   if(est<=prev) throw new Error('duree non croissante a '+r+' series: '+est);
   prev=est;
   console.log('  '+r+' series ->',est,'min,',p.steps.filter(s=>s.k==='set').length,'etapes');
 });
 state.rounds=3;
 // 4. seance complete au clavier, mode alterne
 const key=k=>handlers.forEach(h=>h({key:k,code:k===' '?'Space':k,target:{tagName:'DIV'},preventDefault(){}}));
 /* v1.13 : ENTREE ne valide plus une tenue tant que chaque cote prevu n a pas
    de mesure. Ce parcours teste l enchainement d une seance, pas le chrono :
    il pose les mesures directement, la machine a etats des tenues et son
    clavier etant couverts par la suite v1.13 avec horloge pilotee. */
 const fillHold=()=>{
   if(view!=='session'||!cur||cur.phase!=='work') return;
   const st=cur.steps[cur.i];
   if(!st||st.k!=='set') return;
   const e=DB[st.id]; if(!e) return;
   /* v2.17 : une tenue rythmee se valide arretee, avec sa valeur au journal */
   if(e.rhythm){ st.rt={d:8,g:8,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=8; return; }
   /* v2.22 : une serie cadencee se valide cotes mesures */
   if(e.cadence){ cadInit(st); st.sides=st.sides.map(()=>8); st.side=st.sides.length-1; st.done=true; st.val=8; return; }
   if(e.mode!=='time') return;
   holdInit(st,e);
   for(let i=0;i<st.sides.length;i++) if(st.sides[i]==null) st.sides[i]=30;
 };
 const runSession=async()=>{ let g=0; while((view==='session'||view==='home')&&g++<300){ fillHold(); key('Enter'); } await new Promise(r=>setTimeout(r,6)); };
 view='home';
 for(let i=0;i<8;i++){ view='home'; await runSession(); if(view!=='recap') throw new Error('seance '+i+' vue='+view); key('Enter'); }
 console.log('8 seances alternees OK · xp',state.xp,'· hist',state.hist.length);
 // 5. double progression sur un exercice charge
 const cid='curls-halteres';
 let p=perfOf(cid); const l0=p.load;
 for(let i=0;i<12;i++){ applyProgress(cid,[DB[cid].reps[1],DB[cid].reps[1],DB[cid].reps[1]]); }
 p=perfOf(cid);
 if(p.load<=l0) throw new Error('charge non montee: '+l0+' -> '+p.load);
 console.log('double progression curls:',l0,'->',p.load,'kg · montees',state.loadUps);
 // regression si trop dur : v1.15, le premier passage suivant une montee est
 // gracie, le filet ne joue qu au passage d apres
 const before=p.load;
 applyProgress(cid,[2,2,2]);
 if(perfOf(cid).load!==before) throw new Error('la grace post-montee doit masquer la premiere descente');
 applyProgress(cid,[2,2,2]);
 if(perfOf(cid).load>=before) throw new Error('pas de repli de charge');
 console.log('repli de charge OK:',before,'->',perfOf(cid).load);
 // 6. cinq seances de plus
 for(let i=0;i<5;i++){ view='home'; await runSession(); if(view!=='recap') throw new Error('seance '+i+' vue='+view); key('Enter'); }
 console.log('5 seances OK · hist',state.hist.length);
 // 7. deblocages
 console.log('debloques:',Object.keys(state.unlocked).join(', ')||'aucun');
 console.log('badges:',state.badges.length);
 // 8. toutes les vues
 ['home','lib','prog','set'].forEach(v=>{view=v;render();});
 ids.forEach(id=>showFiche(id));
 // 9. persistance
 await save(); const xp=state.xp; state=null; await loadState(); domicile();
 if(state.xp!==xp) throw new Error('persistance');
 console.log('persistance OK');
 // 10. reglages
 setWarm('court'); setWarm('aucun'); setCardio(false); setTrans(10); setTrans(15); setWarm('complet'); setCardio(true);
 if(typeof setMode!=='undefined'||typeof setRest!=='undefined'||typeof skipType!=='undefined') throw new Error('reglage retire encore expose');
 adjPlate('1.25',4);
 console.log('avec 1.25 :',loadLadder(state.gear).length,'paliers');
 console.log('TOUS LES TESTS PASSENT · v'+VERSION);
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
