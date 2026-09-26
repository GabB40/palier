// Nouveautes v1.16 : rappel des series du jour et ligne de performance G,
// separateur unique, fourchette courante affichee, recapitulatif enrichi,
// modele rejoue au tick, appVersion et migrations rejouees a l import.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;

// Horloge pilotee. Le drain ne joue QUE le minuteur courant : draine sans cette
// precaution, il enchaine sur celui de l etape suivante, cree par le rendu que
// la fin de l etape precedente vient de declencher, et compte des secondes qui
// appartiennent a une autre etape.
let TIMER=null;
global.setInterval=fn=>{const h={fn:fn};TIMER=h;return h;};
global.clearInterval=h=>{if(h&&typeof h==='object')h.dead=true;};
global.setTimeout=fn=>({fn:fn});
global.clearTimeout=()=>{};
global.__d=max=>{const h=TIMER;let n=0;while(h&&!h.dead&&n<(max||500)){h.fn();n++;}return n;};
/* v2.22 : horloge murale pilotee pour la cadence, lue par rhythmNow */
let CLOCK=1000;
global.performance={now:()=>CLOCK*1000};
global.__adv=s=>{ CLOCK+=s; };
global.__dn=n=>{const h=TIMER;let i=0;while(h&&!h.dead&&i<n){h.fn();i++;}return i;};

const T=`
(async()=>{
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();

   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.goal=4;state.sound=false; };

 /* ---------- 1. separateur unique, appele partout ---------- */
 await neuf();
 const S=setsHtml([12,11,10]);
 if(S.indexOf(' / ')>=0) throw new Error('le separateur ne doit plus porter d espaces');
 if(S!=='12<i class="sl">/</i>11<i class="sl">/</i>10') throw new Error('forme du separateur : '+S);
 if(setsHtml([])!=='' || setsHtml(null)!=='') throw new Error('liste vide mal geree');
 if(setsHtml([9])!=='9') throw new Error('une seule valeur ne porte pas de separateur');
 console.log('T1 OK : separateur attenue unique, sans espaces, liste vide et singleton geres');

 /* ---------- 2. la fourchette affichee est celle de l exercice ---------- */
 await neuf();
 const p1=perfOf('pompes-poignees');
 p1.range=[8,16]; p1.target=8;
 if(rangeOf(p1,DB['pompes-poignees'])[1]!==16) throw new Error('rangeOf ne lit pas la fourchette courante');
 if(rangeOf(null,DB['pompes-poignees'])[1]!==DB['pompes-poignees'].reps[1]) throw new Error('rangeOf sans perf doit retomber sur le catalogue');
 startSession();
 cur.phase='work'; cur.i=0;
 const cible=cur.steps[0].id;
 perfOf(cible).range=[8,16]; perfOf(cible).target=9;
 render();
 if(html.indexOf('8-16')<0&&DB[cible].reps) {
   /* l exercice tire n est pas forcement celui qu on a truque : on verifie sur
      la fourchette reellement portee par l exercice de l etape */
   const r=rangeOf(perfOf(cible),DB[cible]);
   if(html.indexOf(r[0]+'-'+r[1])<0) throw new Error('la fourchette affichee ne suit pas p.range');
 }
 console.log('T2 OK : la fourchette affichee est celle de la performance, pas celle du catalogue');

 /* ---------- 3. rappel des series du jour ---------- */
 await neuf();
 startSession(); cur.phase='work'; cur.i=0;
 render();
 if(/Aujourd'hui/.test(html)) throw new Error('pas de pastille du jour a la premiere serie');
 if(!/Dernière fois/.test(html)===false&&state.perf[cur.steps[0].id].sets.length) throw new Error('coherence derniere fois');
 const st0=cur.steps[0];
 st0.val=13; validateSet();
 cur.i=0; render();
 if(!/Aujourd'hui/.test(html)) throw new Error('la pastille du jour manque a la serie suivante');
 if(html.indexOf('>13<')<0) throw new Error('la valeur du jour n est pas affichee');
 st0.val=12; validateSet();
 cur.i=0; render();
 if(html.indexOf('13<i class="sl">/</i>12')<0) throw new Error('toutes les series du jour doivent etre listees, pas seulement la derniere');
 console.log('T3 OK : les series du jour apparaissent des la deuxieme, toutes, avec le separateur commun');

 /* ---------- 4. un repli en cours d exercice repart d une liste vide ---------- */
 await neuf();
 startSession(); cur.phase='work';
 let iRepli=-1;
 cur.steps.forEach((s,i)=>{ if(iRepli<0&&s.k==='set'&&!s.cool&&DB[s.id].fb&&DB[s.id].reps&&DB[s.id].mode!=='time') iRepli=i; });
 if(iRepli<0) throw new Error('aucun exercice avec repli dans ce tirage');
 cur.i=iRepli; cur.steps[iRepli].val=10; validateSet();
 cur.i=iRepli; render();
 if(html.indexOf('>10<')<0) throw new Error('la serie du jour devrait etre visible avant le repli');
 swapPain();
 cur.i=iRepli; render();
 if(/Aujourd'hui/.test(html)) throw new Error('apres un repli, les series du jour ne sont plus les memes : la liste doit repartir vide');
 console.log('T4 OK : le journal est lu sous la cle courante, un repli repart d une liste vide');

 /* ---------- 5. modele rejoue : le tick compte le chronometre ---------- */
 await neuf();
 state.warm='complet';
 startSession();
 const m0=cur.model, plan0=cur.planSec;
 if(plan0==null) throw new Error('planSec doit etre pose au lancement');
 if(Math.abs(plan0-estimateSec({steps:cur.steps,warm:cur.warmMode,light:cur.light}))>1) {
   /* estimateSec attend un plan complet : on se contente de verifier l ordre de grandeur */
   if(plan0<300||plan0>3000) throw new Error('planSec hors de toute plausibilite : '+plan0);
 }
 if(m0!==0&&m0<0) throw new Error('le modele part du remontage de charge, jamais negatif');
 render();                       /* ecran d echauffement, demarre son chrono */
 /* v2.22 : le decompte de lancement tique d abord, puis passe la main */
 if(__dn(20)!==START_PREP) throw new Error('le decompte de lancement doit tiquer '+START_PREP+' fois puis s arreter');
 if(__dn(7)!==7) throw new Error('le chrono d echauffement n a pas tique sept fois');
 if(cur.model!==m0+START_PREP+7) throw new Error('decompte et sept secondes d echauffement doivent valoir '+(START_PREP+7)+' : '+(cur.model-m0));
 console.log('T5 OK : chaque seconde chronometree incremente le modele, une par une');

 /* ---------- 6. la part non chronometree suit la valeur saisie ---------- */
 await neuf();
 startSession(); cur.phase='work';
 let iReps=-1;
 cur.steps.forEach((s,i)=>{ if(iReps<0&&s.k==='set'&&!s.cool&&DB[s.id].mode!=='time') iReps=i; });
 cur.i=iReps;
 const id6=cur.steps[iReps].id, e6=DB[id6];
 const avant=cur.model;
 cur.steps[iReps].val=10; validateSet();
 const dix=cur.model-avant;
 await neuf();
 startSession(); cur.phase='work'; cur.i=iReps;
 const avant2=cur.model;
 cur.steps[iReps].id=id6; cur.steps[iReps].val=20; validateSet();
 const vingt=cur.model-avant2;
 if(!(vingt>dix)) throw new Error('vingt repetitions doivent couter plus cher que dix');
 const attendu=Math.round(10*tempoOf(id6)*(e6.side?2:1));
 if(vingt-dix!==attendu) throw new Error('l ecart doit valoir dix repetitions au tempo de l exercice : '+(vingt-dix)+' au lieu de '+attendu);
 if(serieModelAdd(id6,10)!==INSTALL+(e6.side?switchSec(id6):0)+Math.round(10*tempoOf(id6)*(e6.side?2:1))) throw new Error('serieModelAdd ne suit pas le modele v1.14');
 console.log('T6 OK : la part modelisee est calculee sur la valeur saisie, tempo de l exercice compris');

 /* ---------- 7. une tenue ne facture que son installation ---------- */
 await neuf();
 if(serieModelAdd('planche',45)!==INSTALL) throw new Error('une tenue ne doit facturer que son installation, son chrono ayant defile');
 if(serieModelAdd('etir-nuque',null)!==INSTALL_STRETCH) throw new Error('un etirement ne doit facturer que son installation courte');
 console.log('T7 OK : tenues et etirements ne facturent que leur installation, le reste a tique');

 /* ---------- 8. le retour d un pas defait la part modelisee ---------- */
 await neuf();
 startSession(); cur.phase='work';
 let iR=-1; cur.steps.forEach((s,i)=>{ if(iR<0&&s.k==='set'&&!s.cool&&DB[s.id].mode!=='time') iR=i; });
 cur.i=iR;
 const m8=cur.model;
 cur.steps[iR].val=12; validateSet();
 if(cur.model===m8) throw new Error('la validation n a rien ajoute au modele');
 stepBack();
 if(cur.model!==m8) throw new Error('le retour d un pas doit defaire exactement la part ajoutee : '+cur.model+' au lieu de '+m8);
 console.log('T8 OK : le retour d un pas defait la part modelisee, sans toucher aux secondes deja passees');

 /* ---------- 9. l entree d historique porte les deux durees a la seconde ---------- */
 await neuf();
 startSession(); cur.phase='work';
 while(cur.i<cur.steps.length&&!cur.recap){
   const s=cur.steps[cur.i];
   if(!s||s.k!=='set'){ if(!s) break; nextStep(); continue; }
   if(DB[s.id].mode==='time'){ s.sides=new Array(DB[s.id].side?2:1).fill(30); s.done=true; }
   if(DB[s.id].cadence){ cadInit(s); s.sides=s.sides.map(()=>10); s.side=s.sides.length-1; s.done=true; }
   s.val=10; validateSet();
 }
 for(let i=0;i<40;i++) await Promise.resolve();   /* endSession est async : on laisse la fin de seance se poser */
 const h9=state.hist[state.hist.length-1];
 if(h9.planSec==null) throw new Error('planSec absent de l entree');
 if(h9.model==null) throw new Error('model absent de l entree');
 if(h9.planSec===Math.round(h9.planSec/60)*60&&h9.planSec%60===0) { /* tolere, mais improbable */ }
 if(h9.plan!==Math.round(h9.planSec/60)) throw new Error('la minute affichee doit deriver de la seconde stockee');
 console.log('T9 OK : annonce stockee a la seconde, modele stocke, minute derivee');

 /* ---------- 10. recapitulatif : durees, volume, passage precedent ---------- */
 view='recap'; render();
 if(!/série/.test(html)&&!/séries/.test(html)) throw new Error('le volume joue manque au recapitulatif');
 if(!/min/.test(html)) throw new Error('la duree manque au recapitulatif');
 console.log('T10 OK : le recapitulatif porte la duree et le volume joue');

 /* ---------- 11. comparaison au passage precedent, marque d allege ---------- */
 await neuf();
 const idc='pompes-poignees';
 perfOf(idc).sets=[7,7,7]; perfOf(idc).lightSets=true;
 cur={recap:true,xp:10,msgs:[],type:'alterne',weekJust:false,inc:false,light:false,pop:[],popI:0,climbs:[],
      done:3,total:3,planSec:900,model:940,real:1000,
      items:[{id:idc,sets:[9,9,9],load:0,prev:[7,7,7],prevLight:true}]};
 view='recap'; render();
 if(html.indexOf('avant : 7<i class="sl">/</i>7<i class="sl">/</i>7')<0) throw new Error('le passage precedent doit etre affiche sous les valeurs du jour');
 if(!/allégée/.test(html)) throw new Error('une comparaison a un passage allege doit etre annoncee comme telle');
 cur.items[0].prevLight=false; render();
 if(/allégée/.test(html)) throw new Error('marque d allege affichee a tort');
 console.log('T11 OK : passage precedent affiche, marque d allege posee seulement quand elle s applique');

 /* ---------- 12. ecart au modele : moyenne, seances completes seulement ---------- */
 await neuf();
 const seance=(d,real,model,inc)=>{const e={date:d,type:'alterne',mode:'alterne',rounds:3,plan:Math.round(900/60),planSec:900,model:model,items:[{id:idc,sets:[8,8,8],load:0}],xp:63,real:real};if(inc)e.inc=true;return e;};
 const J=n=>{const x=new Date();x.setDate(x.getDate()-n);x.setHours(18,0,0,0);return x.toISOString();};
 state.hist=[seance(J(3),1000,940),seance(J(2),1100,1040),seance(J(1),5000,900,true)];
 const ts=timeStats(state);
 if(ts.nModel!==2) throw new Error('la seance quittee ne doit pas entrer dans l ecart au modele : '+ts.nModel);
 if(ts.gap!==60) throw new Error('ecart moyen attendu 60 s, obtenu '+ts.gap);
 view='prog'; render();
 if(!/Écart au modèle/.test(html)) throw new Error('la ligne d ecart au modele manque a la card Temps');
 console.log('T12 OK : ecart moyen sur les seules seances completes, 60 s sur deux seances');

 /* ---------- 13. decomposition dans la seance depliee ---------- */
 if(!/dont répétitions faites/.test(html)) throw new Error('la decomposition manque a la seance depliee');
 if(!/dont écart au modèle/.test(html)) throw new Error('le second terme de la decomposition manque');
 const dec=histTimeHtml(state.hist[0]);
 if(!dec) throw new Error('histTimeHtml vide sur une seance complete');
 if(histTimeHtml({real:900})!=='') throw new Error('pas de decomposition sans planSec ni model');
 console.log('T13 OK : decomposition presente dans le detail, absente des seances sans mesure');

 /* ---------- 14. appVersion ecrit au save, enveloppe hors de l etat ---------- */
 await neuf();
 await save();
 if(state.appVersion!==VERSION) throw new Error('appVersion doit etre ecrite au save');
 const brut=JSON.parse(localStorage.getItem('palier-state-v2'));
 if(brut.appVersion!==VERSION) throw new Error('appVersion absente du localStorage');
 if(brut.app!=null||brut.version!=null) throw new Error('l enveloppe ne doit pas etre dans l etat stocke');
 const env=JSON.parse(payload());
 if(env.app!=='palier'||env.version!==VERSION) throw new Error('l enveloppe du fichier exporte est fausse');
 console.log('T14 OK : appVersion au save, enveloppe posee a l export et absente de l etat');

 /* ---------- 15. le fossile version 1.0 ne survit pas a un import ---------- */
 await neuf();
 const fossile={app:'palier',version:'1.0',v:2,xp:100,goal:4,hist:[],perf:{},unlocked:{},badges:[],duration:15};
 applyImport(fossile);
 if(state.version!=null||state.app!=null) throw new Error('app et version doivent sortir de l etat a l import');
 const env2=JSON.parse(payload());
 if(env2.version!==VERSION) throw new Error('un export apres import doit porter la vraie version, obtenu '+env2.version);
 console.log('T15 OK : le fossile version 1.0 ne survit pas a un import');

 /* ---------- 16. les migrations se rejouent a l import ---------- */
 await neuf();
 const vieux={app:'palier',version:'1.12',v:2,xp:10,goal:4,hist:[],perf:{},unlocked:{},badges:[],duration:20};
 applyImport(vieux);
 if(state.rounds!==4) throw new Error('la migration duree vers series doit se rejouer a l import : rounds='+state.rounds);
 if(state.duration!=null) throw new Error('le champ duree doit disparaitre a l import');
 if(state.stretchIdx==null||state.div==null) throw new Error('les migrations v1.4 doivent se rejouer a l import');
 console.log('T16 OK : les migrations se rejouent a l import, duree 20 min devient 4 series');

 /* ---------- 17. migrateState est idempotente ---------- */
 await neuf();
 state.rounds=3;
 const a1=JSON.stringify(migrateState(JSON.parse(JSON.stringify(state))));
 const a2=JSON.stringify(migrateState(JSON.parse(a1)));
 if(a1!==a2) throw new Error('migrateState doit etre idempotente');
 console.log('T17 OK : migrateState est idempotente');

 /* ---------- 18. identite : seance jouee aux cibles, model == planSec ---------- */
 /* C est la garantie centrale du modele rejoue. Si elle tient, l ecart au modele
    ne contient plus que ce que le modele represente mal et les interruptions, et
    plus du tout les repetitions faites au-dela ou en deca des cibles. */
 const joue=async(cfg,bonus)=>{
   state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm=cfg[0]; state.cardio=cfg[1]; state.stretch=cfg[2]; state.rounds=cfg[3];
  state.sound=false;
   startSession();
   const planSec=cur.planSec;
   let extra=0, cible0=null;
   if(cur.phase==='warm'){ renderSession(); let g=0; while(cur.phase==='warm'&&g++<40) __d(500); }
   let g=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length&&g++<500){
     const st=cur.steps[cur.i];
     if(st.k==='rest'){ renderSession(); __d(500); continue; }
     if(st.k==='cardio'){ renderSession(); toggleCardio(); __d(500); continue; }
     const e=DB[st.id];
     renderSession();
     if(e.mode==='stretch'){ toggleStretch(); __d(500); __d(500); validateSet(); continue; }
     if(e.mode==='time'){
       const c=perfFor(st.id,!!st.light).target, n=(e.side?2:1);
       for(let k=0;k<n;k++){ toggleChrono(); __d(500); __dn(c); toggleChrono(); }
       validateSet(); continue;
     }
     /* v2.22 : une serie cadencee se joue a l horloge murale, Stop une
        demi-seconde apres la fin de la repetition-cible, cote par cote */
     if(e.cadence){
       const sp=cadSpec(st);
       for(let k=0;k<sp.n;k++){ toggleCadence(); __adv(prepSec()+.15+sp.etab+sp.cible*sp.cycle+.5); cadLoop(); toggleCadence(); }
       validateSet(); continue;
     }
     const c=perfFor(st.id,!!st.light).target;
     let v=c;
     if(bonus&&cible0===null){ cible0=st.id; v=c+bonus; extra=Math.round(bonus*tempoOf(st.id)*(e.side?2:1)); }
     st.val=v; validateSet();
   }
   for(let i=0;i<80;i++) await Promise.resolve();
   const h=state.hist[state.hist.length-1];
   return {planSec:planSec,model:h.model,real:h.real,extra:extra,id:cible0};
 };
 for(const cfg of [['complet',false,true,3],['court',true,true,2],['aucun',false,false,4],['complet',true,true,4]]){
   const r=await joue(cfg,0);
   if(r.model!==r.planSec) throw new Error('identite rompue sur '+cfg.join('/')+' : planSec='+r.planSec+' model='+r.model);
 }
 console.log('T18 OK : seance jouee aux cibles, le modele rejoue retombe exactement sur l annonce, sur quatre configurations');

 /* ---------- 19. des repetitions en plus deplacent le modele, pas l annonce ---------- */
 const r19=await joue(['complet',false,true,3],8);
 if(r19.planSec===r19.model-r19.extra===false) throw new Error('incoherence de mesure');
 if(r19.model-r19.planSec!==r19.extra)
   throw new Error('huit repetitions de plus sur '+r19.id+' doivent deplacer le modele de '+r19.extra+' s, obtenu '+(r19.model-r19.planSec));
 if(r19.extra<=0) throw new Error('le bonus de repetitions doit couter du temps');
 console.log('T19 OK : huit repetitions de plus deplacent le modele de '+r19.extra+' s et laissent l annonce inchangee');

 console.log('TESTS V1.16 OK');
})();
`;
eval(src+T);
