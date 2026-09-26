/* test48 : lot v2.22. Decompte de lancement devant l echauffement, aigu
   sur la montee de la repetition-cible et chiffre de la repetition en cours,
   pont fessier et sa lignee en cadence a trois temps avec reprise, migration
   v2.19 bornee aux abductions. Horloges pilotees, comme test46. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
/* horloge audio : currentTime pilotable ; chaque oscillateur retient sa
   frequence et l instant de son start */
const tones=[];
const actx={currentTime:0,destination:{},state:'running',resume(){},
  createOscillator:()=>{const o={frequency:{value:0},connect(){},start(t){o.at=t;tones.push(o);},stop(t){o.stops=(o.stops||[]).concat([t]);}};return o;},
  createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{},
  AudioContext:function(){ return actx; }};
/* horloge murale pilotable, en secondes */
let WALL=1000;
global.performance={now:()=>WALL*1000};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v;else this._h=v},get innerHTML(){return cap?html:(this._h||'')},classList:{add(){},remove(){}},style:{},textContent:'',className:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
let ticks=[];
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ ticks=ticks.filter(x=>x!==t); };
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
/* avance les deux horloges de dt secondes et reveille la boucle tous les
   250 ms, comme le ferait le navigateur */
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.avance=dt=>{ const fin=WALL+dt; while(WALL<fin-1e-9){ const pas=Math.min(.25,fin-WALL); WALL+=pas; actx.currentTime+=pas; ticks.slice().forEach(t=>t.f()); } };


const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=3; state.sound=true; };
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 const rel=(o,T0,off)=>Math.round((o.at-off-T0)*100)/100;
 const freqs=()=>tones.map(o=>o.frequency.value);
 const seance=(id,target)=>{ const p=perfOf(id); p.target=target; delete p.hold; delete p.grace; delete p.prevMin; p.sets=[];
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:id,key:id,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:id,key:id,set:2,of:2,round:2}];
   cur.i=0; renderSession(); return cur.steps[0]; };
 const PONTS=['pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'];

 // 1. decompte de lancement
 await neuf();
 if(START_PREP!==5) err('decompte de lancement : 5 s fixes');
 state.prep=10;
 state.warm='complet';
 if(warmupSec('complet')!==5+WARMUP.reduce((a,x)=>a+x.s,0)) err('annonce : decompte compris dans le poste echauffement, et independant du reglage des tenues');
 if(warmupSec('aucun')!==0) err('sans echauffement, pas de decompte a l annonce');
 tones.length=0;
 startSession();
 const m0=cur.model;
 if(cur.startLeft!==5||!/Départ dans/.test(html)||!/id="wt">5</.test(html)) err('ecran : Depart dans 5');
 if(cur.warmT!==WARMUP[0].s) err('le chrono de la premiere etape n est pas entame');
 if(freqs().filter(f=>f===700).length!==2) err('premier bip a 700, coup double comme startPrep : '+freqs());
 tic(4);
 if(cur.startLeft!==1||el('#wt').textContent!=='1'||freqs().filter(f=>f===700).length!==10) err('cinq bips a 700 : '+freqs());
 if(freqs().indexOf(1150)>=0) err('pas d aigu avant le zero');
 tic(1);
 if(cur.startLeft!==0||freqs().filter(f=>f===1150).length!==2) err('au zero, l aigu a 1150 : '+freqs());
 if(el('#wt').textContent!==fmtT(WARMUP[0].s)) err('le chrono de l etape s affiche au zero : '+el('#wt').textContent);
 if(cur.model!==m0+5) err('cinq secondes chronometrees au modele : '+(cur.model-m0));
 tic(3);
 if(cur.warmT!==WARMUP[0].s-3) err('l echauffement part apres le decompte : '+cur.warmT);
 renderWarm(); if(/Départ dans/.test(html)) err('le decompte ne se rejoue pas au rendu');
 console.log('decompte OK : 5 s fixes, bip a chaque seconde, aigu au depart, au modele et a l annonce, puis l echauffement');

 // 2. pause, etape suivante, passer
 await neuf(); state.warm='complet';
 startSession(); tic(2);
 toggleWarm(); tic(5);
 if(cur.startLeft!==3) err('Pause fige le decompte : '+cur.startLeft);
 tones.length=0; toggleWarm();
 if(freqs().filter(f=>f===700).length!==2) err('la reprise rejoue le bip de la seconde en cours');
 tic(3); if(cur.startLeft!==0||cur.warmI!==0) err('reprise jusqu au depart, premiere etape');
 await neuf(); state.warm='complet';
 startSession(); tic(1); nextWarm();
 if(cur.startLeft!==0||cur.warmI!==1||/Départ dans/.test(html)) err('Etape suivante annule le decompte');
 await neuf(); state.warm='complet';
 startSession(); skipWarm();
 if(cur.startLeft!==0||cur.phase!=='work') err('Passer l echauffement annule le decompte');
 await neuf(); state.warm='aucun';
 startSession();
 if(cur.phase!=='work'||cur.startLeft!==0) err('sans echauffement, aucun decompte de lancement');
 console.log('controles OK : pause et reprise, etape suivante et passer annulent, rien sans echauffement');

 // 3. catalogue du pont
 await neuf();
 PONTS.forEach(id=>{
   const c=DB[id].cadence;
   if(!c||c.monte!==1.5||c.tenue!==1||c.descente!==2||c.etab!==0||!c.reprise) err('cadence du pont 1,5 / 1 / 2, sans etablissement, avec reprise : '+id);
 });
 if(DB['gainage-lateral-jambe-levee'].cadence.reprise||DB['gainage-lateral-jambe-levee'].cadence.tenue) err('abductions : ni reprise ni tenue en haut');
 if(JSON.stringify(CAD_DEPUIS_SECONDES)!=='["gainage-lateral-jambe-levee"]') err('migration v2.19 bornee aux abductions');
 if(serieSec('pont-fessier')!==INSTALL+Math.round(3+perfOf('pont-fessier').target*4.5)) err('modele : un bloc, cycle 4,5 s');
 perfOf('pont-fessier-une-jambe').target=9;
 if(serieSec('pont-fessier-une-jambe')!==INSTALL+2*Math.round(3+9*4.5)) err('modele : deux cotes, cote arrondi');
 if(serieModelAdd('pont-fessier',20)!==INSTALL) err('rejeu : tout a defile au tick');
 console.log('catalogue OK : cinq ponts cadences 1,5/1/2 avec reprise, modele a un ou deux blocs');

 // 4. pont bilateral : tenue en haut, aigu sur la montee cible, chiffre en cours
 await neuf();
 let st=seance('pont-fessier',4);
 if(st.sides.length!==1) err('un seul bloc sur le pont bilateral');
 if(!/Faites à faire<\\/span> · cible <b class="num">4<\\/b>/.test(html)) err('comptes sans cote : '+html.match(/id="rcount">[^]*?<\\/div>/));
 if(!/tenue en haut <b class="num">1<\\/b> s/.test(html)||/Un côté entier/.test(html)) err('consigne de cadence du pont');
 tones.length=0; toggleCadence();
 const T0=st.ct.t0, off=st.ct.off;
 if(Math.abs(T0-(WALL+3.15))>1e-9) err('sans etablissement, le decompte enchaine');
 if(tones.some(o=>o.frequency.value===1150)) err('pas de depart a 1150 sans etablissement');
 if(el('#phlabel').textContent!=='En position') err('decompte sans cote : '+el('#phlabel').textContent);
 if(!/première montée vient au bip/.test(el('#aide').textContent)) err('consigne du decompte : '+el('#aide').textContent);
 avance(3.25);                                  /* e = 0.10 */
 if(el('#cc').textContent!=='1'||!/>Monte</.test(el('#phase').innerHTML)) err('e=0,1 : Monte, 1');
 avance(1.5);                                   /* e = 1.6 */
 if(el('#cc').textContent!=='1'||!/>Tiens</.test(el('#phase').innerHTML)) err('e=1,6 : Tiens, 1');
 avance(1);                                     /* e = 2.6 */
 if(!/>Descends</.test(el('#phase').innerHTML)) err('e=2,6 : Descends');
 avance(2);                                     /* e = 4.6 */
 if(el('#cc').textContent!=='2'||!/Faites <b class="num">1<\\/b>/.test(el('#rcount').innerHTML)) err('e=4,6 : en cours 2, une faite : '+el('#rcount').innerHTML);
 avance(20);
 const mon=tones.filter(o=>o.frequency.value===950).map(o=>rel(o,T0,off));
 const des=tones.filter(o=>o.frequency.value===700&&o.at>T0+off).map(o=>rel(o,T0,off));
 const cib=tones.filter(o=>o.frequency.value===1200).map(o=>rel(o,T0,off));
 if(JSON.stringify(cib)!=='[13.5]') err('aigu sur la montee de la quatrieme : '+JSON.stringify(cib));
 if(mon.indexOf(13.5)>=0||mon.slice(0,4).join()!=='0,4.5,9,18') err('montees toutes les 4,5 s, sauf la cible : '+JSON.stringify(mon));
 if(des.slice(0,3).join()!=='2.5,7,11.5') err('descente apres montee et tenue : '+JSON.stringify(des));
 toggleCadence();                               /* e = 24.6 : cinq faites, sixieme en cours */
 if(st.sides[0]!==5||!st.done||st.ct.on) err('Stop : cinq repetitions terminees, '+JSON.stringify(st.sides));
 if(!/Série arrêtée/.test(html)||html.indexOf('resumeCad()')<0) err('apres le Stop : Reprendre propose');
 if(!/id="ct" disabled/.test(html)) err('bloc unique : bouton principal eteint');
 if(html.indexOf('class="big ok"')<0) err('validable apres le Stop');
 espace(); if(st.ct.on) err('ESPACE ne reprend pas, la reprise est un bouton');
 console.log('pont bilateral OK : trois temps, aigu sur la montee cible, chiffre en cours, Stop au compte termine');

 // 5. reprise : repart du compte, decompte rejoue, aigu seulement si la cible reste a atteindre
 tones.length=0; resumeCad();
 if(!st.ct.on||st.ct.base!==5||st.sides[0]!==null) err('reprise armee depuis 5');
 if(freqs().filter(f=>f===700).length!==6) err('la reprise rejoue le decompte : '+freqs());
 avance(3.25);
 if(el('#cc').textContent!=='6') err('reprise : la sixieme en cours, '+el('#cc').textContent);
 avance(10);
 if(tones.some(o=>o.frequency.value===1200)) err('cible deja atteinte : pas d aigu a la reprise');
 toggleCadence();
 if(st.sides[0]!==7) err('reprise : 5 + 2 = 7, '+JSON.stringify(st.sides));
 touche('-'); if(st.sides[0]!==6) err('touche moins rogne');
 resetCad(); if(st.sides[0]!==null||st.done) err('Reinitialiser efface');
 resumeCad(); if(st.ct.on) err('rien a reprendre apres une remise a zero');
 await neuf();
 st=seance('pont-fessier',6);
 toggleCadence(); avance(3.15+9.3); toggleCadence();        /* deux faites */
 tones.length=0; resumeCad(); avance(3.15+20);
 const c2=tones.filter(o=>o.frequency.value===1200).map(o=>rel(o,st.ct.t0,st.ct.off));
 if(JSON.stringify(c2)!=='[13.5]') err('reprise a 2, cible 6 : aigu sur la quatrieme montee de la reprise, '+JSON.stringify(c2));
 toggleCadence(); validateSet();
 if(JSON.stringify(cur.log['pont-fessier'])!==JSON.stringify([st.sides[0]])||cur.i!==1) err('validation au journal');
 console.log('reprise OK : repart du compte, decompte rejoue, aigu sur la montee cible restante, rognage et remise a zero');

 // 6. pont unilateral : deux cotes, reprise du cote en cours, jamais du cote quitte
 await neuf(); state.unlocked['pont-fessier-leste']=true; state.unlocked['pont-fessier-une-jambe']=true;
 st=seance('pont-fessier-une-jambe',8);
 if(st.sides.length!==2) err('deux cotes');
 toggleCadence();
 if(!/Pied droit au sol/.test(el('#aide').textContent)) err('consigne du cote : '+el('#aide').textContent);
 avance(3.15+9.3); toggleCadence();
 if(st.sides.join()!=='2,') err('cote droit a 2');
 if(!/Change de jambe, puis Second côté/.test(html)||!/Reprendre continue ce côté/.test(html)) err('consigne entre les cotes');
 resumeCad(); avance(3.15+4.6); toggleCadence();
 if(st.sides.join()!=='3,') err('reprise du cote droit : 3');
 toggleCadence();                               /* Second cote */
 if(st.side!==1||!st.ct.on||st.ct.base!==0) err('second cote frais');
 avance(3.15+4.6); toggleCadence();
 if(st.sides.join()!=='3,1') err('gauche a 1 : '+st.sides);
 resumeCad(); if(!st.ct.on||st.side!==1||st.ct.base!==1) err('reprise du cote gauche');
 toggleCadence();
 if(st.sides.join()!=='3,1') err('Stop au decompte : rien de plus');
 if(!/Au journal : <b class="num">1<\\/b> répétition par côté/.test(html)) err('journal au cote court');
 console.log('pont unilateral OK : un cote puis l autre, reprise du cote en cours, jamais du cote quitte');

 // 7. abductions : ni reprise, ni tenue ; le Stop reste definitif
 await neuf(); state.unlocked['gainage-lateral-jambe-levee']=true;
 st=seance('gainage-lateral-jambe-levee',5);
 toggleCadence(); avance(6.15+7); toggleCadence();
 if(html.indexOf('resumeCad()')>=0) err('pas de Reprendre sur les abductions');
 resumeCad(); if(st.ct.on) err('resumeCad inerte sans reprise');
 console.log('abductions OK : Stop definitif, aucune reprise');

 // 8. migration : un pont a fourchette heritee est ecrete, pas efface
 await neuf();
 const vieux=g(state);
 vieux.perf['pont-fessier']={load:0,range:[11,21],target:21,best:21,sets:[21,21,21],date:'2026-09-01T10:00:00.000Z'};
 vieux.perf['gainage-lateral-jambe-levee']={load:0,range:[15,45],target:20,best:20,sets:[20,20],date:'2026-09-15T10:00:00.000Z'};
 localStorage._m={}; localStorage.setItem('palier-state-v2',JSON.stringify(vieux)); state=null; await loadState();
 const q=state.perf['pont-fessier'];
 if(!q||q.range.join()!=='10,20'||q.best!==21) err('pont : ecretage et non effacement, '+JSON.stringify(q));
 if(state.perf['gainage-lateral-jambe-levee']) err('abductions : la performance en secondes repart de zero');
 console.log('migration OK : la regle v2.19 ne vise que l ancienne tenue, le pont herite est ecrete');

 console.log('TESTS V2.22 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
