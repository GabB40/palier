/* test20 : correction de la derniere seance : instantane, rejeu, fenetre,
   invariants, ecran de saisie et fil de retour. Chantier v1.15, bloc 3. */
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
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
 };
 /* joue une seance complete en imposant la valeur de chaque serie */
 const joue=async(val)=>{
   startSession();
   cur.log={}; cur.done=0;
   cur.steps.forEach(s=>{ if(s.k!=='set'||s.cool) return;
     const k=s.key||s.id, e=DB[s.id];
     (cur.log[k]=cur.log[k]||[]).push(val(s.id,e)); cur.done++; });
   cur.i=cur.steps.length;
   await endSession(false);
   return state.hist[state.hist.length-1];
 };
 const cible=id=>state.perf[id].target;

 // 1. l instantane est pose, date, et porte ce que cur ne peut plus dire
 await neuf();
 let h=await joue((id,e)=>e.reps?e.reps[0]:1);
 if(!state.undo) throw new Error('instantane absent');
 if(state.undo.date!==h.date) throw new Error('instantane non date sur la derniere seance');
 if(state.undo.rounds!==h.rounds) throw new Error('le volume de la seance doit etre memorise');
 if(Object.keys(state.undo.full).length!==state.undo.keys.length) throw new Error('full par cle absent');
 if(!corrigible()) throw new Error('la derniere seance doit etre corrigible');
 console.log('E1 OK : instantane pose, date, avec full et volume de seance');

 // 2. correction sans effet de seuil : la cible suit, le reste ne bouge pas
 const k0=state.undo.keys[0], id0=splitKey(k0).id, e0=DB[id0];
 const xp0=state.xp, badges0=state.badges.length, rot0=JSON.stringify(state.slotIdx);
 const nb=state.hist.length, div0=JSON.stringify(state.div), lu0=state.loadUps;
 const v=state.hist[nb-1].items[0].sets.map(()=>e0.reps[0]+2);
 corrigerSeance({[k0]:v});
 if(state.hist[nb-1].items[0].sets.join()!==v.join()) throw new Error('valeurs non ecrites dans l historique');
 if(cible(id0)!==Math.max(e0.reps[0],Math.min(e0.reps[1],Math.ceil((e0.reps[0]+3)/(e0.mode==='time'?5:1))*(e0.mode==='time'?5:1)))) throw new Error('cible non recalculee : '+cible(id0));
 if(state.xp!==xp0||state.badges.length!==badges0||JSON.stringify(state.slotIdx)!==rot0||state.hist.length!==nb) throw new Error('invariants casses : les valeurs seules changent');
 if(state.loadUps!==lu0||JSON.stringify(state.div)!==div0) throw new Error('div ou loadUps modifies sans montee');
 console.log('E2 OK : la cible suit, XP, badges, rotation et couverture ne bougent pas');

 // 3. correction qui cree une montee, puis correction qui la supprime
 await neuf();
 h=await joue((id,e)=>e.reps?e.reps[0]:1);
 const kc=state.undo.keys.filter(k=>{const e=DB[splitKey(k).id];return e.mode==='load'||e.mode==='fixed';})[0];
 if(kc){
   const idc=splitKey(kc).id, ec=DB[idc], i=state.undo.keys.indexOf(kc);
   const l0=state.undo.perf[idc].load, ups0=state.undo.loadUps;
   corrigerSeance({[kc]:state.hist[state.hist.length-1].items[i].sets.map(()=>ec.reps[1])});
   if(state.perf[idc].load<=l0) throw new Error('E3 : montee attendue apres correction');
   if(state.loadUps!==ups0+1) throw new Error('E3 : loadUps doit suivre');
   if(!state.perf[idc].grace) throw new Error('E3 : la grace doit etre posee par le rejeu');
   corrigerSeance({[kc]:state.hist[state.hist.length-1].items[i].sets.map(()=>ec.reps[0])});
   if(state.perf[idc].load!==l0) throw new Error('E4 : la montee doit etre defaite, charge '+state.perf[idc].load+' au lieu de '+l0);
   if(state.loadUps!==ups0) throw new Error('E4 : loadUps doit revenir');
   if(state.perf[idc].grace) throw new Error('E4 : la grace doit disparaitre avec la montee');
   console.log('E3-E4 OK : une correction cree puis defait une montee, loadUps et grace suivent');
 }

 // 4. une double correction repart toujours de l instantane d origine
 const kd=state.undo.keys[0], idd=splitKey(kd).id, ed=DB[idd], j=0;
 const base=JSON.stringify(state.undo.perf[idd]);
 corrigerSeance({[kd]:state.hist[state.hist.length-1].items[j].sets.map(()=>ed.reps[1])});
 corrigerSeance({[kd]:state.hist[state.hist.length-1].items[j].sets.map(()=>ed.reps[0])});
 if(JSON.stringify(state.undo.perf[idd])!==base) throw new Error('E6 : l instantane ne doit pas etre repris apres correction');
 console.log('E6 OK : la correction reste corrigeable, toujours depuis le meme point');

 // 5. une valeur nulle, vide ou non entiere est refusee
 const av=state.hist[state.hist.length-1].items[0].sets.join();
 corrigerSeance({[kd]:state.hist[state.hist.length-1].items[0].sets.map(()=>0)});
 if(state.hist[state.hist.length-1].items[0].sets.join()!==av) throw new Error('E11 : une serie a zero ne doit pas etre ecrite');
 corrigerSeance({[kd]:[1]});
 if(state.hist[state.hist.length-1].items[0].sets.join()!==av) throw new Error('E11 : on ne retire pas une serie par la correction');
 console.log('E11 OK : zero refuse, ajout et suppression refuses');

 // 6. la fenetre se ferme au demarrage de la seance suivante
 startSession();
 if(state.undo) throw new Error('E8 : la fenetre doit se fermer au demarrage de la seance suivante');
 if(corrigible()) throw new Error('E8 : plus rien a corriger');
 console.log('E8 OK : la fenetre se ferme quand une nouvelle seance demarre');

 // 7. l instantane survit a un rechargement
 await neuf();
 await joue((id,e)=>e.reps?e.reps[0]:1);
 await save();
 const gele=JSON.stringify(state.undo);
 state=null; await loadState(); domicile();
 if(!state.undo||JSON.stringify(state.undo)!==gele) throw new Error('E7 : l instantane doit survivre a un rechargement');
 console.log('E7 OK : l instantane est persiste, la correction survit a un rechargement');

 // 8. seance allegee : le rejeu utilise le mode de la seance, pas l etat courant
 await neuf();
 lightMode=true;
 await joue((id,e)=>e.reps?e.reps[1]:1);
 lightMode=false;
 if(!state.undo.light) throw new Error('E10 : le mode allege doit etre memorise');
 const ku=state.undo.keys[0], idu=splitKey(ku).id;
 const t0=state.perf[idu].target;
 corrigerSeance({[ku]:state.hist[state.hist.length-1].items[0].sets.slice()});
 if(state.perf[idu].target!==t0) throw new Error('E10 : une seance allegee ne fait pas progresser, meme rejouee');
 console.log('E10 OK : le rejeu utilise le mode et le volume de la seance corrigee');

 // 9. l ecran de correction se rend et refuse zero
 await neuf();
 await joue((id,e)=>e.reps?e.reps[0]:1);
 openFix('prog');
 if(!/Corriger la séance/.test(html)) throw new Error('E-UI : ecran de correction absent');
 if(!/Série 1/.test(html)) throw new Error('E-UI : les series doivent etre numerotees');
 /* v2.25 : clr n est stylee que sous .search ; hors recherche, un bouton qui la porte
    prend le style plein par defaut */
 if(!/<button class="discret mt"[^>]*onclick="fixClose\\(\\)">Annuler<\\/button>/.test(html)) throw new Error('E-UI : Annuler doit etre un bouton discret');
 if(/disabled/.test(html)) throw new Error('E-UI : bouton actif attendu sur des valeurs valides');
 const kk=state.undo.keys[0];
 fixVals[kk]=fixVals[kk].map(()=>0);
 renderFix();
 if(!/disabled/.test(html)) throw new Error('E-UI : le bouton doit etre inerte avec une serie a zero');
 /* le retour suit le fil : correction depuis l historique, retour a l historique */
 fixVals[kk]=fixVals[kk].map(()=>DB[splitKey(kk).id].reps[0]);
 fixApply();
 if(view!=='prog') throw new Error('E-UI : une correction depuis Progres doit y revenir, vue='+view);
 if(cur) throw new Error('E-UI : aucun recapitulatif ne doit rester en place');
 openFix('recap'); fixApply();
 if(view!=='recap') throw new Error('E-UI : une correction depuis le recapitulatif y revient');
 if(!/<button class="discret mt"[^>]*>Une valeur est fausse \\? Corriger<\\/button>/.test(html)) throw new Error('E-UI : Corriger doit etre un bouton discret sous le bouton principal');
 if(/class="clr/.test(html)) throw new Error('E-UI : clr hors de la recherche');
 if(!/(^|\\n)button\\.discret\\{[^}]*background:none/.test(fs.readFileSync('head.html','utf8'))) throw new Error('E-UI : button.discret doit avoir une regle non scopee');
 console.log('E-UI OK : ecran rendu, series numerotees, validation inerte a zero, retour au point de depart, Annuler et Corriger discrets');

 console.log('TESTS CORRECTION DE SEANCE V1.15 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
