// Nouveautes v1.6 : retrait des dips, developpe halteres au sol, tolerance aux
// identifiants d historique absents, interrupteur des sons, decompte de
// preparation, bips pre-cible, serie en clair, ecran reordonne, pastilles
// groupees par tour et par exercice, card Sons dans les reglages.
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
(async function(){
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 // 1. dips retires de partout, catalogue a 36 avec le developpe au sol
 if(DB['dips']||CFG['dips']) throw new Error('dips toujours en base');
 if(SLOTS.push.pool.indexOf('dips')>=0) throw new Error('dips toujours au vivier pousse');
 if(typeof IMG!=='undefined'&&IMG['dips']) throw new Error('image dips toujours embarquee');
 if(Object.keys(DB).some(id=>DB[id].lock&&DB[id].lock.after==='dips')) throw new Error('un verrou reference encore les dips');
 if(Object.keys(DB).length!==55) throw new Error('catalogue attendu a 55, obtenu '+Object.keys(DB).length);   /* v2.18 : +2, escalier du squat */
 console.log('dips OK : retires de DB, CFG, vivier, images et verrous, catalogue a 46');
 // 2. developpe halteres au sol : mode load, vivier pousse, materiel, repli, figure
 const dv=DB['developpe-sol'];
 if(!dv) throw new Error('developpe-sol absent');
 if(CFG['developpe-sol'].mode!=='load'||CFG['developpe-sol'].cat!=='push') throw new Error('developpe-sol mal configure');
 if(SLOTS.push.pool.indexOf('developpe-sol')<0) throw new Error('developpe-sol hors vivier pousse');
 if(SLOTS.push.pool.length!==3) throw new Error('vivier pousse attendu a 3');
 if(!dv.mat||!dv.mat.length) throw new Error('materiel absent');
 if(!DB[dv.fb]) throw new Error('repli invalide : '+dv.fb);
 if(dv.lock) throw new Error('developpe-sol ne doit pas etre verrouille');
 const f=figFor('developpe-sol',dv.fig,dv.nom);
 if(!f||f.indexOf('<img')<0) throw new Error('croquis non rendu');
 if(typeof IMG!=='undefined'&&!IMG['developpe-sol']) throw new Error('croquis absent de la banque');
 const p0=perfOf('developpe-sol');
 if(p0.load!==6) throw new Error('charge de depart attendue 6, obtenue '+p0.load);
 const L=loadLadder(state.gear);
 if(L.indexOf(6)<0) throw new Error('6 kg absent de l echelle de charge reelle');
 console.log('developpe-sol OK : load 6 kg sur l echelle, vivier pousse a 3, croquis embarque, repli '+dv.fb);
 // 3. identifiants fantomes dans l historique : Progres, Replis, trajectoires tiennent
 state.hist=[{date:new Date(Date.now()-7*864e5).toISOString(),dur:900,plan:900,items:[
   {id:'dips',sets:[8,8]},
   {id:'corde-a-sauter',sets:[3]},
   {id:'fantome',sets:[5],sw:true,from:'dips'},
   {id:'pompes-inclinees',sets:[6],sw:true,from:'pompes-poignees'},
   {id:'goblet-squat',sets:[8,8],load:12}
 ]}];
 state.perf['dips']={sets:[8,8],load:0};
 const sh=statsHtml();
 if(sh.indexOf('Dips')>=0) throw new Error('exercice fantome affiche dans les stats');
 const ps=painSwaps(state,4);
 if(ps.some(x=>x.id==='dips')) throw new Error('repli d origine fantome compte');
 if(!ps.some(x=>x.id==='pompes-poignees')) throw new Error('repli reel perdu');
 const cov=coverage(state,4);
 if(cov.legs!==2) throw new Error('coverage faussee par les fantomes : '+cov.legs);
 view='prog'; render();
 if(html.indexOf('Progrès')<0) throw new Error('vue Progres ne rend plus');
 console.log('fantomes OK : stats, replis, couverture et Progres tiennent sur des ids absents');
 // 4. interrupteur des sons : porte dans beep, defauts sains
 state.hist=[]; state.perf={};
 if(!sndOn()) throw new Error('sons attendus actifs par defaut');
 if(prepSec()!==5) throw new Error('decompte attendu a 5 par defaut, obtenu '+prepSec());
 state.sound=false;
 if(sndOn()) throw new Error('interrupteur inoperant');
 beep(880,.2); // ne doit ni jouer ni jeter
 state.sound=true; state.prep=0;
 if(prepSec()!==0) throw new Error('decompte 0 non respecte');
 state.prep=null;
 if(prepSec()!==5) throw new Error('absence de reglage doit valoir 5');
 console.log('sons OK : porte globale dans beep, defauts actifs et 5 s');
 // 5. bips pre-cible : approche sur les 5 dernieres secondes, arrivee inchangee, garde a 5
 const K=(v,t)=>preBipKind(v,t);
 if(K(14,20)!==0||K(15,20)!==1||K(19,20)!==1||K(20,20)!==2||K(21,20)!==0) throw new Error('fenetre pre-cible fausse');
 if(K(1,4)!==0&&K(2,4)!==0) throw new Error('garde target<=5 absent sur l approche');
 if(K(4,4)!==2) throw new Error('bip d arrivee perdu sur petite cible');
 if(K(3,0)!==0) throw new Error('cible nulle doit rester muette');
 console.log('pre-cible OK : approche a t-5, arrivee preservee, petites cibles gardees');
 // 6. decompte de preparation : arme au demarrage, pas quand il vaut 0
 startSession(); if(cur.phase==='warm') skipWarm();
 while(cur.steps[cur.i].k!=='set'||DB[cur.steps[cur.i].id].mode==='time'?false:true){ if(DB[cur.steps[cur.i].id]&&DB[cur.steps[cur.i].id].mode==='time'&&cur.steps[cur.i].k==='set')break; nextStep(); if(cur.i>=cur.steps.length) break; }
 let stT=cur.steps.find((s,i)=>i>=cur.i&&s.k==='set'&&DB[s.id].mode==='time');
 if(stT){
   while(cur.steps[cur.i]!==stT) nextStep();
   state.prep=3; toggleChrono();
   if(cur.steps[cur.i].prepLeft!==3) throw new Error('decompte non arme : '+cur.steps[cur.i].prepLeft);
   toggleChrono(); // stop pendant le decompte
   if(cur.steps[cur.i].prepLeft!=null) throw new Error('decompte non annule au stop');
   state.prep=0; toggleChrono();
   if(cur.steps[cur.i].prepLeft!=null) throw new Error('decompte a 0 doit demarrer direct');
   clearTimers();
   console.log('decompte OK : arme a 3, annule au stop, direct a 0');
 } else console.log('decompte : aucun exercice tenu tire ce jour, teste via les purs');
 cur=null; state.prep=null;
 // 7. ecran d exercice : serie en clair, plus de pips, ordre cible > charge > illustration
 state.perf={}; startSession(); if(cur.phase==='warm') skipWarm();
 while(cur.steps[cur.i].k!=='set') nextStep();
 const st=cur.steps[cur.i];
 const card=setHtml(st);
 if(card.indexOf('setpips')>=0) throw new Error('pips toujours presents');
 if(!/Série <b class="num">1<\\/b> sur/.test(card)) throw new Error('serie en clair absente');
 const iP=card.indexOf('perfline'), iF=card.indexOf('figbox')>=0?card.indexOf('figbox'):card.indexOf('<svg');
 if(iP<0||iF<0||iP>iF) throw new Error('la cible ne precede pas l illustration');
 const iL=card.indexOf('loadbox');
 if(iL>=0&&(iL<iP||iL>iF)) throw new Error('la charge n est pas entre cible et illustration');
 console.log('ecran OK : serie en clair, cible puis charge puis illustration entiere');
 // 8. pastilles groupees : un bloc par tour
 const dA=dotsHtml(cur.steps,0);
 const nT=(dA.match(/class="grp/g)||[]).length;
 const R=workSteps(cur.steps).filter(s=>s.round===1).length?Math.max(...workSteps(cur.steps).map(s=>s.round)):0;
 if(nT!==R) throw new Error('alterne : '+nT+' blocs pour '+R+' tours');
 const dDone=dotsHtml(cur.steps,workSteps(cur.steps).filter(s=>s.round===1).length);
 if((dDone.match(/grp full/g)||[]).length!==1) throw new Error('le tour boucle ne change pas de contour');
 cur=null;
 console.log('pastilles OK : '+R+' blocs-tours, contour du tour boucle');
 // 9. reglages : card Sons dans le bloc seance, valeur en en-tete, decompte regle
 view='set'; render();
 const iSons=html.indexOf('<span class="ttl">Sons</span>');
 if(iSons<0) throw new Error('card Sons absente');
 if(html.indexOf('<span class="ttl">Sons</span><span class="val">Activés · décompte 5 s · repère 5 s</span>')<0) throw new Error('valeur en en-tete fausse');
 const iEt=html.indexOf('<span class="ttl">Étirements de fin de séance</span>'), iRe=html.indexOf('<span class="ttl">Repos entre séries</span>');
 if(!(iEt<iSons&&(iRe<0||iSons<iRe))) throw new Error('card Sons hors du bloc seance');
 state.sound=false; render();
 if(html.indexOf('<span class="ttl">Sons</span><span class="val">Coupés</span>')<0) throw new Error('etat coupe non reflete');
 state.sound=true;
 console.log('reglages OK : Sons apres Étirements, valeur en en-tete dans les deux etats');
 console.log('TESTS V1.6 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
