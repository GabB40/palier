/* test43 : lot v2.16. Le plafond d un exercice au poids du corps ou tenu vaut
   le haut de sa fourchette, le champ cap et le relevement de fourchette
   n existent plus, la migration d ecretage se derive, la garde de semis qui
   supposait le relevement tombe, la cible vaut le haut au plafond, le verrou
   des fentes lestees lit 15, la fiche rend une marche unique, et une tenue
   chronometree se rogne apres le Stop. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
const bips=[];
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{},
  AudioContext:function(){ return {currentTime:0,destination:{},
    createOscillator:()=>{const o={frequency:{value:0},connect(){},start(){},stop(){}};bips.push(o);return o;},
    createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
/* horloge pilotee a la main : les chronos sont deterministes */
let ticks=[];
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ ticks=ticks.filter(x=>x!==t); };
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };

/* Les onze entrees du recensement, telles qu elles sont dans la sauvegarde du
   12 septembre 2026 : aucune n est relevee. Les absentes n avaient jamais ete
   jouees. */
const EXPORT_PERF={
 'fentes-arriere':{load:0,range:[8,15],target:10,best:9,sets:[9,9,9],date:'2026-08-25T15:33:16.130Z'},
 'bird-dog':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-25T15:33:16.130Z'},
 'dead-bug':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-29T14:29:08.550Z'},
 'step-ups':{load:0,range:[8,15],target:13,best:12,sets:[12,12],date:'2026-09-10T15:23:22.378Z'},
 'rowing-suspension':{load:0,range:[8,15],target:11,best:10,sets:[10,10,10],date:'2026-09-03T15:05:55.058Z'},
 'pompes-inclinees':{load:0,range:[8,20],target:8,best:8,sets:[8,8,8],date:'2026-08-14T15:02:46.219Z'},
 'tractions-strictes-supination':{load:0,range:[3,8],target:3,best:0,sets:[],date:null},
 'tractions-strictes-pronation':{load:0,range:[3,8],target:3,best:0,sets:[],date:null},
 'box-squat':{load:0,range:[8,15],target:8,best:0,sets:[],date:null}
};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const dit=(m,re)=>m.some(x=>re.test(x));
 const SRC=${JSON.stringify(src)};
 const EXPORT_PERF=${JSON.stringify(EXPORT_PERF)};
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=0; state.sound=false; };
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   p.range=e.reps.slice(); p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.hold) p.hold=true; else delete p.hold;
   delete p.grace; delete p.prevMin; p.best=0; p.sets=[]; return p; };
 const BWT=Object.keys(DB).filter(id=>(DB[id].mode==='bw'||DB[id].mode==='time')&&!DB[id].bnd&&!DB[id].rhythm&&!DB[id].assise&&DB[id].reps)   /* v2.17 : les tenues rythmees ont une echelle ; v2.18 : l assise aussi */;

 /* ---------- 1. catalogue : plus de cap, une marche ecrite partout ---------- */
 await neuf();
 Object.keys(DB).forEach(id=>{ if('cap' in DB[id]) err(id+' : le champ cap n existe plus (v2.16)'); });
 /* v2.17 : bird-dog et dead bug ont rejoint l echelle de tenues, dix-neuf restent sans echelle */
 if(BWT.length!==19) err('dix-neuf exercices au poids du corps ou tenus sans echelle attendus, '+BWT.length);
 BWT.forEach(id=>{ if(!DB[id].next) err(id+' : marche ecrite absente, un plafond sans marche est une impasse muette'); });
 const fl=DB['fentes-arriere-lestee'].lock;
 if(fl.need!==15||fl.need!==DB['fentes-arriere'].reps[1]) err('verrou des fentes lestees a 15, le haut de fourchette, '+fl.need);
 if(fl.cond.indexOf('15 fentes')<0) err('le texte du verrou dit 15 : '+fl.cond);
 /* v2.17 : l allongement des tenues est devenu l echelle, la marche ecrite
    est celle du dernier barreau, 10 s. L assertion suit. */
 if(!/10 s/.test(DB['bird-dog'].next)) err('la marche ecrite du bird-dog est celle du dernier barreau, 10 s : '+DB['bird-dog'].next);
 if(!/jamais de lest/.test(DB['bird-dog'].next)||!/jamais de lest/.test(DB['dead-bug'].next)) err('jamais de lest, sur les deux');
 /* le moteur ne porte plus le mecanisme, pas seulement les donnees */
 if(/fourchette relevée|fourchette redescendue/.test(SRC)) err('le relevement ou sa descente miroir est encore dans le code');
 if(/e\\.cap\\b/.test(SRC.replace(/\\/\\*[\\s\\S]*?\\*\\//g,''))) err('le code lit encore un champ cap hors commentaires');
 console.log('catalogue OK : aucun cap, 19 plafonnes avec marche ecrite, fentes a 15, mecanisme absent du code');

 /* ---------- 2. moteur : la fourchette ne bouge dans aucun sens ---------- */
 await neuf();
 state.div={push:0,pull:0};
 BWT.forEach(id=>{
   const e=DB[id], base=e.reps.slice(), pas=(e.mode==='time')?5:1;
   const p=pose(id,{target:base[0]});
   const d0=g(state.div);
   let m=applyProgress(id,[base[1],base[1],base[1]],true,false);
   if(p.range.join('-')!==base.join('-')) err(id+' : fourchette relevee, '+p.range);
   if(!dit(m,/Plafond atteint/)||!dit(m,new RegExp(e.next.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&')))) err(id+' : le plafond doit nommer la marche ecrite, '+m.join(' | '));
   if(p.target!==base[1]) err(id+' : au plafond la cible vaut le haut, '+p.target);
   if(p.grace) err(id+' : pas de grace, aucun palier n a change');
   if(p.prevMin!==base[1]) err(id+' : au plafond la memoire s ecrit, '+p.prevMin);
   if(JSON.stringify(state.div)!==JSON.stringify(d0)) err(id+' : un plafond n est pas une montee pour div');
   m=applyProgress(id,[base[0]-pas-1,base[0]-pas-1,base[0]-pas-1],true,false);
   if(p.range.join('-')!==base.join('-')) err(id+' : fourchette descendue, '+p.range);
   if(dit(m,/redescendue/)) err(id+' : message de descente sans barreau inferieur');
   if(!dit(m,/aucune série au plancher/)) err(id+' : le signal d echec doit passer');
   /* fenetre de deux passages (v2.14) : un seul passage rate est absorbe par
      la memoire ecrite au plafond, le second recale la cible au bas */
   if(p.target!==base[1]) err(id+' : un passage sous le plancher est absorbe par la memoire, cible '+p.target);
   m=applyProgress(id,[base[0]-pas-1,base[0]-pas-1,base[0]-pas-1],true,false);
   if(p.range.join('-')!==base.join('-')) err(id+' : fourchette descendue au second passage, '+p.range);
   if(p.target!==base[0]) err(id+' : deux passages sous le plancher recalent la cible au bas, '+p.target);
   if(!dit(m,/cible recalée/)) err(id+' : le recul a deux passages se dit');
 });
 /* cible au haut au plafond : le cas qui le motive, une cible depassee */
 const pf=pose('fentes-arriere',{target:12});
 applyProgress('fentes-arriere',[15,15,15],true,false);
 if(pf.target!==15) err('cible 12 puis 15/15/15 : la cible doit valoir 15, '+pf.target);
 /* et le meme au sommet d une echelle de bande : c est general */
 await neuf();
 const pp=perfOf('pompes-poignees'); pp.band='vert'; pp.target=12; pp.range=DB['pompes-poignees'].reps.slice(); delete pp.prevMin;
 const mp=applyProgress('pompes-poignees',[15,15,15],true,false);
 if(!dit(mp,/Plafond atteint/)) err('sommet de bande attendu');
 if(pp.target!==15) err('au sommet d une echelle aussi, la cible vaut le haut, '+pp.target);
 console.log('moteur OK : 19 exercices, plafond nomme, immobile dans les deux sens, cible au haut au plafond');

 /* ---------- 3. fiche : une marche unique, la regle et sa condition ---------- */
 await neuf();
 BWT.forEach(id=>{
   const E=echelleOf(id);
   if(!E||E.lbl.length!==1||E.i!==0||E.quoi!=='fourchette') err(id+' : une marche unique attendue, '+JSON.stringify(E));
   if(E.lbl[0]!==DB[id].reps.join('-')+' '+unitOf(DB[id])) err(id+' : la marche est la fourchette du catalogue, '+E.lbl[0]);
 });
 /* v2.17 : le bird-dog a rejoint l echelle de tenues, les fentes arriere,
    8-15 par cote, portent le temoin du regime de la fourchette a sa place */
 const H=echelleHtml('fentes-arriere');
 if(/Marche <b class="num">1<\\/b> sur/.test(H)) err('« Marche 1 sur 1 » ne doit plus s afficher');
 if(H.indexOf('Plafond de la fourchette atteint')>=0) err('l ancien libelle de plafond ne doit plus s afficher');
 if(!/Au haut de la fourchette, toutes les séries à <b class="num">15<\\/b> reps/.test(H)) err('la regle de plafond et sa condition : '+H);
 if(H.indexOf(esc(DB['fentes-arriere'].next))<0) err('la marche ecrite figure sur la fiche');
 if(H.indexOf('9-16')>=0||H.indexOf('10-17')>=0) err('plus aucune fourchette decalee sur la fiche');
 /* temoin : une fourchette stockee hors catalogue est une position perdue, ce
    que la migration empeche precisement */
 perfOf('fentes-arriere').range=[9,16];
 if(echelleOf('fentes-arriere').i!==-1) err('temoin : fourchette hors catalogue, position introuvable');
 perfOf('fentes-arriere').range=[8,15];
 /* la planche, tenue, passe par le meme chemin */
 const HP=echelleHtml('planche');
 if(!/toutes les séries à <b class="num">45<\\/b> s/.test(HP)||HP.indexOf(esc(DB['planche'].next))<0) err('planche : regle a 45 s et marche ecrite');
 console.log('fiche OK : marche unique sur les 19, regle avec condition, marche ecrite, temoin de position');

 /* ---------- 4. migration : ecretage derive, par les deux chemins d entree ---------- */
 const releve=()=>({v:2,rounds:3,perf:{
   'bird-dog':{load:0,range:[7,13],target:13,best:13,sets:[13,13],date:'2026-09-01T10:00:00.000Z',prevMin:11},
   'dead-bug':{load:0,range:[8,14],target:14,best:14,sets:[14,14],date:'2026-09-01T10:00:00.000Z'},
   'fentes-arriere':{load:0,range:[9,16],target:9,best:16,sets:[9,9],date:'2026-09-01T10:00:00.000Z',prevMin:7},
   'tractions-strictes-supination':{load:0,range:[4,9],target:5,best:0,sets:[],date:null},
   'step-ups':{load:0,range:[8,15],target:13,best:12,sets:[12,12],date:'2026-09-10T15:23:22.378Z',prevMin:12},
   'planche':{load:0,range:[20,45],target:45,best:44,sets:[42,41],date:'2026-09-10T15:23:22.378Z'}}});
 const verif=(q,quoi)=>{
   ['bird-dog','dead-bug','fentes-arriere','tractions-strictes-supination','step-ups','planche'].forEach(id=>{
     const b=DB[id].reps;
     if(q[id].range.join('-')!==b.join('-')) err(quoi+' : '+id+' fourchette '+q[id].range+' au lieu de '+b);
     if(q[id].target>b[1]) err(quoi+' : '+id+' cible '+q[id].target+' au-dessus du haut');
   });
   if(q['bird-dog'].target!==12||q['dead-bug'].target!==12) err(quoi+' : cibles bornees a 12');
   if(q['fentes-arriere'].target!==9) err(quoi+' : une cible dans la fourchette n est pas touchee');
   /* la memoire survit a l ecretage : un relevement n a jamais change le
      niveau physique, une lecture sous 7-13 vaut une lecture sous 6-12 */
   if(q['bird-dog'].prevMin!==11||q['fentes-arriere'].prevMin!==7) err(quoi+' : une fourchette ecretee garde sa memoire telle quelle, sans la resemer depuis les series, '+q['bird-dog'].prevMin+'/'+q['fentes-arriere'].prevMin);
   if(q['dead-bug'].prevMin!==14) err(quoi+' : sans memoire, la derniere lecture se seme, meme au haut (garde v2.15 tombee), '+q['dead-bug'].prevMin);
   if(q['step-ups'].prevMin!==12) err(quoi+' : une fourchette conforme garde sa memoire');
   if(q['bird-dog'].best!==13) err(quoi+' : le maximum historique n est pas reecrit');
   if(q['planche'].prevMin!==41) err(quoi+' : la garde « haut moins un pas » est tombee, la planche seme 41, '+q['planche'].prevMin);
 };
 localStorage._m={'palier-state-v2':JSON.stringify(releve())};
 state=null; await loadState(); domicile();
 verif(state.perf,'loadState');
 const encore=migrateState(g(state)); verif(encore.perf,'idempotence');
 if(JSON.stringify(encore.perf)!==JSON.stringify(state.perf)) err('migration non idempotente');
 await neuf();
 applyImport(Object.assign({app:'palier',version:'2.15',xp:0,hist:[]},releve()));
 verif(state.perf,'applyImport');
 /* la sauvegarde reelle du 12 septembre : aucune des onze n est relevee, la
    migration n y touche a rien d autre que la memoire de fenetre (v2.15) */
 await neuf();
 applyImport({app:'palier',version:'2.9',xp:1108,hist:[],v:2,rounds:3,perf:g(EXPORT_PERF)});
 Object.keys(EXPORT_PERF).forEach(id=>{
   const a=EXPORT_PERF[id], q=state.perf[id];
   if(q.range.join('-')!==a.range.join('-')) err('export : '+id+' fourchette modifiee, '+q.range);
   if(q.target!==a.target) err('export : '+id+' cible modifiee, '+q.target);
   if(perfFor(id).target!==a.target) err('export : '+id+' prescription du jour modifiee');
 });
 if(state.perf['bird-dog'].prevMin!==8) err('export : la memoire v2.15 se seme a 8 sur le bird-dog');
 console.log('migration OK : ecretage derive sur six entrees par loadState et applyImport, idempotente, no-op sur la sauvegarde du 12 septembre');

 /* ---------- 5. rognage apres le Stop ---------- */
 await neuf();
 startSession();
 const allerA=pred=>{ let k=0; while(view==='session'&&k++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'&&DB[s.id]&&pred(DB[s.id])) return s;
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
   err('aucune etape voulue dans cette seance'); };
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 /* une tenue d un bloc : la planche est tirable dans le premier tirage, sinon
    on prend la premiere tenue unilaterale et on ne teste que le cote courant */
 let st=allerA(e=>e.mode==='time');
 const e5=DB[st.id];
 renderSession();
 if(html.indexOf('trimHold(')>=0) err('pas de rognage avant toute mesure');
 toggleChrono(); tic(44);
 if(st.val!==44) err('chrono a 44 attendu, '+st.val);
 if(html.indexOf('trimHold(')>=0) err('pas de rognage pendant que le chrono tourne');
 trimHold(st.side);
 if(st.val!==44) err('trimHold est inerte pendant que le chrono tourne');
 toggleChrono();                        /* Stop : la mesure est une borne haute */
 if(st.sides[st.side]!==44) err('mesure figee a 44 attendue');
 if(html.indexOf('trimHold('+st.side+')')<0||html.indexOf('− 1 s')<0) err('le bouton de rognage doit apparaitre apres le Stop : '+html.slice(html.indexOf('chrono'),html.indexOf('chrono')+900));
 if(html.indexOf('aria-label="Retirer une seconde"')<0) err('le bouton porte un aria-label');
 trimHold(st.side);
 if(st.sides[st.side]!==43||st.val!==43) err('un appui retire une seconde, '+st.sides[st.side]+'/'+st.val);
 touche('-');
 if(st.sides[st.side]!==42) err('la touche moins rogne aussi, '+st.sides[st.side]);
 touche('+'); touche('=');
 if(st.sides[st.side]!==42) err('plus est inerte sur une tenue, on n ajoute pas des secondes non tenues');
 if(html.indexOf('Réinitialiser')<0) err('la remise a zero reste offerte a cote du rognage');
 /* plancher : une serie a zero n est pas une serie, on ne descend pas sous 1 */
 st.sides[st.side]=2; st.val=2; renderSession();
 trimHold(st.side); trimHold(st.side); trimHold(st.side);
 if(st.sides[st.side]!==1) err('plancher a 1, '+st.sides[st.side]);
 if(!/onclick="trimHold\\(\\d\\)" disabled/.test(html)) err('a 1 le bouton est grise');
 /* la valeur rognee est celle qui part au journal */
 st.sides[st.side]=40; st.val=40; renderSession();
 if(e5.side){ for(let i=0;i<st.sides.length;i++) if(st.sides[i]==null) st.sides[i]=45; renderSession(); }
 trimHold(st.side); trimHold(st.side);
 const k5=st.key||st.id;
 validateSet();
 const jl=cur.log[k5];
 if(!jl||jl[jl.length-1]!==38) err('la valeur rognee doit partir au journal, '+JSON.stringify(jl));
 console.log('rognage OK : bouton et touche moins apres le Stop seulement, plancher a 1, plus inerte, valeur rognee au journal');

 /* ---------- 6. rognage par cote : chaque cote mesure porte son bouton ---------- */
 await neuf();
 /* on avance le compteur du vivier gainage jusqu a un tirage qui porte une
    tenue par cote, le gainage lateral */
 let st6=null;
 for(let c=0;c<30&&!st6;c++){
   cur=null; view='home'; state.slotIdx.core=c; startSession();
   if(cur.steps.some(x=>x.k==='set'&&DB[x.id]&&DB[x.id].mode==='time'&&DB[x.id].side)) st6=allerA(e=>e.mode==='time'&&e.side);
 }
 if(!st6) err('aucun tirage ne porte de tenue par cote');
 holdInit(st6,DB[st6.id]);
 toggleChrono(); tic(30); toggleChrono();          /* premier cote : 30 */
 if(html.indexOf('trimHold(0)')<0) err('premier cote mesure : bouton present');
 if(html.indexOf('trimHold(1)')>=0) err('second cote non mesure : pas de bouton');
 toggleChrono(); tic(27);                          /* second cote en cours */
 trimHold(0);
 if(st6.sides[0]!==30) err('le premier cote ne se rogne pas pendant que le second tourne');
 toggleChrono();                                   /* second cote : 27 */
 if(html.indexOf('trimHold(0)')<0||html.indexOf('trimHold(1)')<0) err('les deux cotes mesures portent chacun leur bouton');
 trimHold(0); trimHold(0); trimHold(0); trimHold(0); /* 30 -> 26 */
 if(st6.sides[0]!==26||st6.sides[1]!==27) err('le rognage vise le cote demande, '+st6.sides.join('/'));
 if(st6.val!==27) err('le chrono affiche reste celui du cote courant');
 const k6=st6.key||st6.id;
 validateSet();
 const j6=cur.log[k6];
 if(!j6||j6[j6.length-1]!==26) err('c est le cote le plus court, rogne, qui part au journal : '+JSON.stringify(j6));
 /* aucun bouton de rognage sur une serie chiffree ni un etirement */
 const st7=cur.steps[cur.i];
 if(st7&&st7.k==='set'&&DB[st7.id].mode!=='time'){ renderSession(); if(html.indexOf('trimHold(')>=0) err('le rognage n existe que sur les tenues'); }
 cur=null; view='home';
 console.log('rognage par cote OK : un bouton par cote mesure, le cote rogne est celui qui part au journal');

 console.log('TESTS PLAFOND ET ROGNAGE V2.16 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
