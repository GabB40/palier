/* test44 : lot v2.17, tenues rythmees. Le bird-dog et le dead bug deviennent
   des exercices en repetitions dont chaque repetition est une tenue, sur une
   echelle a trois barreaux [tenue, bas, haut], rythmee au son. L ecran se pilote
   a l horloge : l etat se derive du temps ecoule, les coups sont programmes en
   avance sur l horloge audio. Le Stop perd la tenue en cours, Reprendre repart
   sur le cote interrompu, « - 1 tenue » rogne la valeur au journal, la montee
   passe au barreau suivant et la descente au precedent, la migration est un
   no-op, l historique porte it.tenue, la fiche rend les trois marches. */
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
global.avance=dt=>{ const fin=WALL+dt; while(WALL<fin-1e-9){ const pas=Math.min(.25,fin-WALL); WALL+=pas; actx.currentTime+=pas; ticks.slice().forEach(t=>t.f()); } };

const EXPORT_PERF={
 'bird-dog':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-25T15:33:16.130Z'},
 'dead-bug':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-29T14:29:08.550Z'}
};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const dit=(m,re)=>m.some(x=>re.test(x));
 const EXPORT_PERF=${JSON.stringify(EXPORT_PERF)};
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=3; state.sound=true; };
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   delete p.tenue; p.range=e.reps.slice(); p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.hold) p.hold=true; else delete p.hold;
   delete p.grace; delete p.prevMin; p.best=0; p.sets=[]; return p; };
 const RY=['bird-dog','dead-bug'];
 const L=[[3,6,12],[6,4,8],[10,3,6]];

 /* ---------- 1. catalogue ---------- */
 await neuf();
 RY.forEach(id=>{
   const e=DB[id];
   if(!e.rhythm||JSON.stringify(e.rhythm.ladder)!==JSON.stringify(L)) err(id+' : echelle 3/6-12, 6/4-8, 10/3-6 attendue, '+JSON.stringify(e.rhythm));
   if(e.rhythm.bascule!==2) err(id+' : bascule de 2 s, constante d exercice');
   if(e.mode!=='bw'||!e.side||JSON.stringify(e.reps)!==JSON.stringify([6,12])) err(id+' : mode bw, par cote, base 6-12 conservee pour la migration');
   if(!/bip/.test(e.desc.join(' '))) err(id+' : la fiche s execute au son');
   if(!/10 s/.test(e.next)||!/jamais de lest/.test(e.next)) err(id+' : la marche ecrite est celle du dernier barreau, sans lest : '+e.next);
   if(unitOf(e)!=='tenues') err(id+' : l unite est la tenue');
 });
 if(tempoOf('bird-dog')!==TEMPO) err('le bird-dog n a plus de tempo modelise');
 if(!/Souffle/.test(DB['dead-bug'].vig)||!/fléchisseurs/.test(DB['dead-bug'].vig)) err('dead bug : consignes de souffle et de levier');
 if(typeof tone!=='function'||typeof toneCancel!=='function') err('emetteur simple-coup absent');
 /* helpers d echelle */
 const e0=DB['bird-dog'];
 if(rungOf(e0,undefined).i!==0||rungOf(e0,undefined).tenue!==3) err('tenue absente : premier barreau');
 if(rungOf(e0,6).i!==1||rungOf(e0,6).reps.join('-')!=='4-8') err('6 s : deuxieme barreau, 4-8');
 if(rungOf(e0,99).i!==0) err('tenue inconnue : retombe au premier barreau');
 if(rungOf(DB['planche'],3)!==null) err('pas d echelle de tenues sur la planche');
 if(baseReps(e0,{tenue:10}).join('-')!=='3-6'||baseReps(DB['planche'],{}).join('-')!=='20-45') err('baseReps lit le barreau ou le catalogue');
 console.log('catalogue OK : echelle a trois barreaux sur les deux, bascule 2, mode bw conserve, tempo retire, fiches au son, helpers');

 /* ---------- 2. modele de temps ---------- */
 pose('bird-dog',{target:8});
 if(serieSec('bird-dog')!==INSTALL+3+2*8*5) err('serie modelisee : prep + 2 x reps x (tenue + bascule), '+serieSec('bird-dog'));
 perfOf('bird-dog').tenue=10; perfOf('bird-dog').range=[3,6]; perfOf('bird-dog').target=4;
 if(serieSec('bird-dog')!==INSTALL+3+2*4*12) err('a 10 s : 12 s par cycle, '+serieSec('bird-dog'));
 if(serieModelAdd('bird-dog',8)!==INSTALL) err('rejeu : tout a defile au tick, seule l installation se modelise');
 console.log('modele OK : serie chronometree, rejeu a l installation');

 /* ---------- 3. ecran, a horloge pilotee ---------- */
 await neuf();
 state.prep=3;
 startSession(); cur.phase='work';
 cur.steps=[{k:'set',id:'bird-dog',key:'bird-dog',set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:'bird-dog',key:'bird-dog',set:2,of:2,round:2}];
 cur.i=0; pose('bird-dog',{target:6}); renderSession();
 let st=cur.steps[0];
 if(st.val!==0) err('avant le depart la valeur vaut 0, pas la cible : '+st.val);
 if(html.indexOf('toggleRhythm()')<0||html.indexOf('>Démarrer<')<0) err('bouton Demarrer attendu');
 if(html.indexOf('trimRhythm(')>=0||html.indexOf('resumeRhythm(')>=0) err('ni rognage ni reprise avant le Stop');
 if(!/<b class="num">3 s<\\/b><span>Tenue<\\/span>/.test(html)) err('l en-tete porte le barreau');
 validateSet(); if(cur.i!==0) err('Valider est inerte avant toute serie');
 tones.length=0;
 if(!/Prêt · Droite/.test(html)) err('avant le depart, le tag annonce le cote qui demarre');
 if(!/<span style="color:var\\(--accent\\);font-weight:700">Droite <b class="num">0<\\/b><\\/span>/.test(html)) err('avant le depart, la droite est mise en valeur');
 const wall0=WALL;
 toggleRhythm();
 if(!st.rt.on||st.rt.t0!==wall0+3.15) err('depart : t0 = maintenant + decompte + 0,15 s');
 if(el('#phlabel').textContent!=='En position · Droite'||el('#cc').textContent!=='3') err('decompte : En position, cote qui demarre, 3');
 /* le decompte enchaine : trois coups a 700 avant t0, puis l ouverture a 950 sur t0 */
 avance(3.3);
 const T0=st.rt.t0, off=st.rt.off;
 const prep=tones.filter(o=>o.at<T0+off-1e-6);
 if(prep.length!==6||!prep.every(o=>o.frequency.value===700)) err('le decompte sonne comme partout ailleurs : trois secondes en coup double a 700 Hz, '+prep.length);
 const dts=prep.map(o=>Math.round((o.at-(T0+off))*100)/100).sort((a,b)=>a-b);
 if(JSON.stringify(dts)!==JSON.stringify([-3,-2.74,-2,-1.74,-1,-0.74])) err('coup double a 260 ms, comme beep() : '+JSON.stringify(dts));
 if(tones.some(o=>o.frequency.value===1150)) err('pas de 1150 au zero : il est colle au 1200 du ton de cible');
 const ouv0=tones.find(o=>Math.abs(o.at-(T0+off))<1e-6);
 if(!ouv0||ouv0.frequency.value!==950) err('l ouverture de la premiere tenue est a 950 Hz sur t0');
 if(el('#phlabel').textContent!=='Droite') err('premiere tenue a droite');
 if(el('#cc').textContent!=='3') err('chrono de tenue : 3 s restantes, '+el('#cc').textContent);
 avance(2.85);                         /* e = 3.0 : fermeture, bascule */
 if(el('#phlabel').textContent!=='Passe à gauche') err('apres la tenue, la bascule annonce l autre cote');
 if(!/Droite <b class="num">1<\\/b> · <span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">0<\\/b><\\/span>/.test(el('#rcount').innerHTML)) err('bascule : le cote annonce est mis en valeur : '+el('#rcount').innerHTML);
 avance(2);                            /* e = 5.0 : tenue gauche */
 if(el('#phlabel').textContent!=='Gauche') err('deuxieme tenue a gauche');
 if(!/<span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">0<\\/b><\\/span>/.test(el('#rcount').innerHTML)) err('tenue : le cote en cours est mis en valeur : '+el('#rcount').innerHTML);
 /* Valider et ESPACE pendant le rythme : Valider inerte, ESPACE = Stop plus loin */
 validateSet(); if(cur.i!==0||!st.rt.on) err('Valider est inerte pendant le rythme');
 trimRhythm(); if(st.rt.d||st.rt.g||st.rt.s0!==0) err('le rognage est inerte pendant le rythme');
 /* jusqu a la cible : la fermeture qui amene un cote a 6 recoit 1200 Hz,
    la droite a la tenue 10 (t0 + 53), la gauche a la tenue 11 (t0 + 58) */
 avance(60);
 const cibles=tones.filter(o=>o.frequency.value===1200).map(o=>Math.round((o.at-off-T0)*100)/100);
 if(JSON.stringify(cibles)!==JSON.stringify([53,58])) err('ton de cible sur les fermetures qui atteignent 6 de chaque cote : '+JSON.stringify(cibles));
 const ferm=tones.filter(o=>o.frequency.value===700&&o.at>T0+off).map(o=>Math.round((o.at-off-T0)*100)/100);
 if(ferm.indexOf(53)>=0||ferm.indexOf(58)>=0) err('la fermeture de cible n est pas doublee d un coup grave');
 if(ferm.indexOf(63)<0) err('le metronome continue apres la cible');
 const ouv=tones.filter(o=>o.frequency.value===950).map(o=>Math.round((o.at-off-T0)*100)/100);
 for(let i=0;i<12;i++) if(ouv.indexOf(5*i)<0) err('ouverture manquante a t0 + '+(5*i));
 if(tones.some(o=>o.frequency.value===950&&Math.abs(o.at-(T0+off+70))<1e-6)) err('rien n est programme au-dela de la fenetre d avance');
 /* le modele compte les secondes ecoulees, une par tick */
 if(cur.model<60) err('le temps qui defile compte au modele : '+cur.model);
 /* Stop pendant une tenue : elle est perdue. e = 65.0+... : tenue 13 (65-68) */
 avance(2.9);                          /* e = 67.9, en tenue 13, gauche ; sa fermeture a 68 est deja programmee */
 if(el('#phlabel').textContent!=='Gauche') err('e=67.9 : tenue 13, gauche');
 const pendant=tones.filter(o=>o.at>actx.currentTime);
 if(!pendant.length) err('prealable : un coup programme au-dela du Stop');
 toggleRhythm();
 if(st.rt.on||!st.rt.stopped) err('Stop');
 if(st.rt.d!==7||st.rt.g!==6) err('13 tenues fermees : droite 7, gauche 6, '+st.rt.d+'/'+st.rt.g);
 if(st.rt.s0!==1) err('la reprise repartira a gauche, cote interrompu');
 if(st.val!==6||!st.done) err('au journal le cote le plus court, 6 : '+st.val);
 if(!pendant.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('les coups programmes au-dela du Stop sont annules');
 if(html.indexOf('resumeRhythm()')<0||html.indexOf('trimRhythm()')<0||html.indexOf('resetRhythm()')<0) err('apres le Stop : Reprendre, - 1 tenue, Reinitialiser');
 if(html.indexOf('− 1 tenue')<0) err('libelle du rognage');
 if(!/Au journal : <b class="num">6<\\/b> tenues de 3 s par côté, le côté le plus court fait foi/.test(html)) err('la ligne de journal dit la valeur et le cote court');
 if(html.indexOf('class="big ok"')<0) err('Valider est actif apres le Stop');
 /* Rognage : il retire la derniere tenue comptee, du cote ou elle a ete
    comptee, et le journal se recalcule sur les compteurs. A 7 et 6 la latence
    du Stop est deja absorbee par le cote court : le premier retrait remet les
    compteurs d accord sans faire bouger le journal, le second seulement fait
    descendre la valeur. Plancher sur les compteurs, pas sur la valeur. */
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 trimRhythm();
 if(st.rt.d!==6||st.rt.g!==6||st.rt.s0!==0) err('- 1 tenue : retiree a droite, ou elle a ete comptee : '+JSON.stringify(st.rt));
 if(st.val!==6) err('le journal etait deja borne par le cote court, il ne bouge pas : '+st.val);
 if(!/Droite <b class=\\"num\\">6<\\/b> · Gauche <b class=\\"num\\">6<\\/b>/.test(html)) err('les compteurs suivent le rognage');
 if(/font-weight:700">(Droite|Gauche)/.test(html)) err('serie arretee : aucun cote en jeu, aucun mis en valeur');
 touche('-');
 if(st.rt.d!==6||st.rt.g!==5||st.val!==5) err('touche moins : la suivante se retire a gauche, journal 5 : '+JSON.stringify(st.rt)+' '+st.val);
 touche('+'); if(st.val!==5) err('plus est inerte');
 for(let i=0;i<15;i++) trimRhythm();   /* quatre appuis de trop : les compteurs s arretent a zero */
 if(st.rt.d!==0||st.rt.g!==0||st.val!==0) err('plancher sur les compteurs : '+JSON.stringify(st.rt)+' '+st.val);
 if(!/trimRhythm\\(\\)" disabled/.test(html)) err('bouton grise quand il n y a plus rien a retirer');
 if(/class="big ok"/.test(html)) err('a zero tenue, Valider est inerte');
 /* reprise : decompte, puis premiere tenue a gauche, l ecart reste d au plus un */
 st.rt.d=7; st.rt.g=6; st.rt.s0=1; st.val=6;
 resumeRhythm();
 if(!st.rt.on||el('#phlabel').textContent!=='En position · Gauche') err('la reprise rejoue le decompte en annoncant le cote interrompu');
 avance(3.3);
 if(el('#phlabel').textContent!=='Gauche') err('la reprise repart sur le cote interrompu');
 if(!/Droite <b class="num">7<\\/b> · <span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">6<\\/b><\\/span>/.test(el('#rcount').innerHTML)) err('les compteurs reprennent ou ils etaient, gauche en jeu');
 /* pendant la reprise la valeur d avant est encore portee : ni rognage, ni
    validation, ni touche moins tant que le rythme court */
 trimRhythm(); touche('-'); validateSet();
 if(st.rt.d!==7||st.rt.g!==6||st.val!==6||cur.i!==0||!st.rt.on) err('pendant le rythme repris : rognage et validation inertes, '+JSON.stringify({d:st.rt.d,g:st.rt.g,val:st.val,i:cur.i}));
 avance(3.5);                          /* e = 3.5 : tenue gauche fermee, bascule */
 if(el('#phlabel').textContent!=='Passe à droite') err('apres la reprise a gauche, bascule vers la droite');
 /* Stop pendant une bascule : la tenue precedente est gardee */
 toggleRhythm();
 if(st.rt.d!==7||st.rt.g!==7||st.rt.s0!==0) err('stop en bascule : droite 7, gauche 7, reprise a droite : '+JSON.stringify(st.rt));
 if(st.val!==7) err('valeur au journal 7, '+st.val);
 /* ESPACE : Stop pendant le rythme, inerte une fois arretee */
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 espace(); if(st.rt.on) err('ESPACE ne relance pas une serie arretee');
 /* reinitialiser puis repartir a l ESPACE, et Stop a l ESPACE */
 resetRhythm();
 if(st.rt.d||st.rt.g||st.rt.stopped||st.rt.on||st.val!==0||st.done) err('reinitialiser efface tout : '+JSON.stringify(st.rt));
 espace(); if(!cur.steps[0].rt||!cur.steps[0].rt.on) err('ESPACE demarre');
 avance(3.3+8.2);                     /* e = 8.35 : deux tenues fermees, une par cote */
 espace(); if(cur.steps[0].rt.on||cur.steps[0].rt.d!==1||cur.steps[0].rt.g!==1) err('ESPACE arrete, une tenue fermee par cote');
 /* validation : la valeur part au journal, la duree aussi */
 validateSet();
 if(cur.i!==1||JSON.stringify(cur.log['bird-dog'])!=='[1]') err('validation : 1 au journal, '+JSON.stringify(cur.log));
 /* retour d un pas efface le rythme */
 stepBack();
 if(cur.i!==0||cur.steps[0].rt.d||cur.steps[0].rt.stopped||cur.steps[0].val||cur.log['bird-dog']) err('stepBack efface la serie et son rythme : '+JSON.stringify(cur.steps[0].rt));
 /* sans son : pas de coup, l etat se derive quand meme */
 state.sound=false; tones.length=0;
 toggleRhythm(); avance(3.3+3.5);
 if(tones.length) err('son coupe : aucun coup');
 if(el('#phlabel').textContent!=='Passe à gauche') err('son coupe : le rythme se lit a l ecran');
 toggleRhythm(); if(cur.steps[0].rt.d!==1) err('son coupe : la mesure vaut');
 console.log('ecran OK : decompte qui enchaine, alternance, ton de cible sur la fermeture de chaque cote, Stop en tenue perd, en bascule garde, reprise sur le cote interrompu, cote annonce au decompte et mis en valeur dans les comptes, rognage a son cote, ESPACE, journal, sans son');

 /* ---------- 4. moteur : montee, descente, plafond ---------- */
 await neuf();
 RY.forEach(id=>{
   const e=DB[id], p=pose(id,{target:6}); state.loadUps=0; state.div={push:0,pull:0,core:0};
   let m=applyProgress(id,[12,12],true,false);
   if(p.tenue!==6||p.range.join('-')!=='4-8'||p.target!==4||!p.grace||state.loadUps!==1) err(id+' : montee au deuxieme barreau, 4-8, cible 4, grace : '+JSON.stringify(p));
   if(!dit(m,/tenues de 6 s, retour à 4 par côté/)) err(id+' : message de montee, '+m.join(' | '));
   if(p.prevMin!=null) err(id+' : la memoire se remet a zero a la montee');
   delete p.grace;
   m=applyProgress(id,[8,8],true,false);
   if(p.tenue!==10||p.range.join('-')!=='3-6'||p.target!==3) err(id+' : montee au troisieme barreau');
   delete p.grace;
   m=applyProgress(id,[6,6],true,false);
   if(p.tenue!==10||p.range.join('-')!=='3-6'||p.target!==6||p.grace) err(id+' : au dernier barreau, plafond, cible au haut, pas de grace : '+JSON.stringify(p));
   if(!dit(m,/Plafond atteint/)||!m.some(x=>x.indexOf(e.next)>=0)) err(id+' : le plafond nomme la marche ecrite, '+m.join(' | '));
   /* descente : deux passages sous le plancher sans grace */
   m=applyProgress(id,[2,2],true,false);
   if(p.tenue!==6||p.range.join('-')!=='4-8'||p.target!==4) err(id+' : descente au deuxieme barreau, cible au bas : '+JSON.stringify(p));
   if(!dit(m,/retour aux tenues de 6 s/)) err(id+' : message de descente, '+m.join(' | '));
   m=applyProgress(id,[2,2],true,false);
   if(p.tenue!==3||p.range.join('-')!=='6-12') err(id+' : descente au premier barreau');
   m=applyProgress(id,[2,2],true,false);
   if(p.tenue!==3||p.range.join('-')!=='6-12') err(id+' : au premier barreau, pas de barreau inferieur, fourchette immobile');
   if(!dit(m,/aucune série au plancher/)) err(id+' : seul le signal passe, '+m.join(' | '));
   /* palier tenu : pas de montee */
   pose(id,{target:12,hold:true});
   applyProgress(id,[12,12],true,false);
   if(perfOf(id).tenue!=null) err(id+' : palier tenu, aucune montee');
   /* lecture partielle : pas de montee non plus */
   pose(id,{target:12});
   applyProgress(id,[12,12],false,false);
   if(perfOf(id).tenue!=null) err(id+' : lecture partielle, aucune montee');
 });
 /* estMontee lit la tenue, jamais la fourchette */
 const pre={tenue:3,range:[6,12],load:0}, post={tenue:6,range:[4,8],load:0};
 if(!estMontee(post,pre,DB['bird-dog'])) err('estMontee : montee de tenue');
 if(estMontee(pre,post,DB['bird-dog'])) err('estMontee : une descente eleve la fourchette sans etre une montee');
 if(estMontee({range:[6,12],load:0},{tenue:3,range:[6,12],load:0},DB['bird-dog'])) err('estMontee : tenue absente vaut 3');
 /* Tenir ce palier depuis le recapitulatif restaure la tenue : une seance
    reduite a deux series de bird-dog, jouee au haut de fourchette */
 const joueBD=async v=>{
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:'bird-dog',key:'bird-dog',set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:'bird-dog',key:'bird-dog',set:2,of:2,round:2}];
   cur.i=0; renderSession();
   let garde=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length){
     if(++garde>40) err('boucle de seance non bornee');
     const s=cur.steps[cur.i]; if(!s) break;
     if(s.k!=='set'){ nextStep(); continue; }
     s.rt={d:v,g:v,s0:0,on:false,stopped:true,t0:null}; s.done=true; s.val=v;
     validateSet();
   }
   for(let i=0;i<80;i++) await Promise.resolve();
 };
 pose('bird-dog',{target:12}); state.loadUps=0;
 await joueBD(12);
 const c=(cur.climbs||[]).find(x=>x.id==='bird-dog');
 if(!c) err('prealable : montee de bird-dog au recapitulatif');
 if(perfOf('bird-dog').tenue!==6) err('prealable : deuxieme barreau apres la seance');
 holdClimb(cur.climbs.indexOf(c));
 const ph=perfOf('bird-dog');
 if(ph.tenue!=null||ph.range.join('-')!=='6-12'||ph.target!==12||!ph.hold||state.loadUps!==0) err('holdClimb : tenue, fourchette, cible et compteur restaures : '+JSON.stringify(ph)+' '+state.loadUps);
 /* Correction de la derniere seance qui defait la montee de barreau : elle se
    dit. avantCor doit porter la tenue, sans quoi estMontee compare deux fois
    le premier barreau et l annulation est muette. */
 await neuf();
 pose('bird-dog',{target:12}); state.loadUps=0;
 await joueBD(12);
 if(perfOf('bird-dog').tenue!==6) err('prealable : montee au deuxieme barreau');
 const kbd=state.undo.keys.find(k=>splitKey(k).id==='bird-dog');
 if(!kbd) err('prealable : bird-dog dans l instantane de correction');
 const rc=corrigerSeance({[kbd]:state.hist[state.hist.length-1].items.find(x=>x.id==='bird-dog').sets.map(()=>6)});
 if(perfOf('bird-dog').tenue!=null) err('la correction ramene au premier barreau : '+perfOf('bird-dog').tenue);
 if(!rc||!(rc.undone||[]).some(x=>/Montée annulée/.test(x)&&/Bird-dog/.test(x))) err('la montee de barreau annulee doit se dire : '+JSON.stringify(rc&&rc.undone));
 cur=null; view='home';
 console.log('moteur OK : trois barreaux, montee au bas avec grace, plafond avec marche ecrite, descente avec signal au premier, palier tenu, lecture partielle, estMontee, holdClimb, montee de barreau annulee dite');

 /* Etape quittee pendant le rythme : le rt est desarme et les coups
    programmes au-dela sont annules, sans passer par le Stop. */
 await neuf();
 pose('bird-dog',{target:6});
 startSession(); cur.phase='work';
 cur.steps=[{k:'set',id:'bird-dog',key:'bird-dog',set:1,of:2,round:1},{k:'set',id:'bird-dog',key:'bird-dog',set:2,of:2,round:2}];
 cur.i=0; renderSession();
 {
   const sa=cur.steps[0];
   toggleRhythm(); avance(10);
   const enAvance=tones.filter(o=>o.at>actx.currentTime);
   if(!sa.rt.on||!enAvance.length) err('prealable : rythme en cours avec des coups programmes');
   skipSet();
   if(sa.rt.on) err('serie passee : le rt est desarme');
   if(!enAvance.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('serie passee : les coups programmes sont annules');
   if(cur.i!==1) err('serie passee : on avance');
 }
 cur=null; view='home';
 console.log('abandon OK : une etape quittee pendant le rythme desarme et annule ses coups');

 /* ---------- 5. migration ---------- */
 await neuf();
 state.perf['bird-dog']={load:0,range:[4,8],target:5,best:0,sets:[],date:null,tenue:6};
 state.perf['dead-bug']={load:0,range:[7,13],target:13,best:0,sets:[],date:null};
 await save(); const raw=localStorage._m[Object.keys(localStorage._m).find(k=>/palier/i.test(k))||Object.keys(localStorage._m)[0]];
 state=null; await loadState();
 let q=state.perf['bird-dog'];
 if(q.tenue!==6||q.range.join('-')!=='4-8'||q.target!==5) err('un 4-8 a 6 s est conforme a son barreau, rien ne bouge : '+JSON.stringify(q));
 q=state.perf['dead-bug'];
 if(q.range.join('-')!=='6-12'||q.target!==12) err('un 7-13 sans tenue est un reste de relevement, revient au premier barreau : '+JSON.stringify(q));
 /* la sauvegarde du 12 septembre : no-op */
 await neuf();
 Object.keys(EXPORT_PERF).forEach(id=>{ state.perf[id]=g(EXPORT_PERF[id]); });
 await save(); state=null; await loadState();
 Object.keys(EXPORT_PERF).forEach(id=>{
   const a=state.perf[id], b=EXPORT_PERF[id];
   if(a.tenue!=null||a.range.join('-')!==b.range.join('-')||a.target!==b.target||JSON.stringify(a.sets)!==JSON.stringify(b.sets)) err(id+' : migration neutre attendue, '+JSON.stringify(a));
   if(tenueOf(id,a)!==3) err(id+' : tenue derivee 3');
 });
 console.log('migration OK : barreau respecte, reste de relevement ecrete, sauvegarde du 12 septembre intacte');

 /* ---------- 6. journal, derniere fois, fiche ---------- */
 await neuf();
 pose('bird-dog',{target:6}); perfOf('bird-dog').tenue=6; perfOf('bird-dog').range=[4,8]; perfOf('bird-dog').target=8;
 await joueBD(8);                      /* haut du barreau : la seance fait monter a 10 s */
 if(perfOf('bird-dog').tenue!==10) err('prealable : montee au troisieme barreau');
 const h=state.hist[state.hist.length-1];
 if(!h) err('seance non historisee');
 const itb=h.items.find(x=>x.id==='bird-dog');
 if(!itb) err('bird-dog absent de l historique');
 {
   if(itb.tenue!==6||JSON.stringify(itb.rng)!=='[4,8]') err('it.tenue ecrit avant progression, avec la fourchette du barreau : '+JSON.stringify(itb));
   /* derniere fois : la tenue jouee se dit quand elle differe du barreau du jour */
   const p=perfOf('bird-dog');
   if(!/à 6 s/.test(lastLevel('bird-dog',p))) err('barreau change : « à 6 s » : '+lastLevel('bird-dog',p));
   p.tenue=6;
   if(lastLevel('bird-dog',p)!=='') err('meme barreau : rien a dire');
   if(palierVal('bird-dog',itb)!==6||palierLbl('bird-dog',6)!=='tenues de 6 s'||!palierUp('bird-dog',3,6)||palierUp('bird-dog',6,3)) err('palier d un passage : la tenue');
   if(palierVal('bird-dog',{rng:[6,12],sets:[8]})!==3) err('un passage sans it.tenue a ete joue a 3 s');
   if(tenueTag(itb).indexOf('6 s')<0||tenueTag({sets:[8]})!=='') err('etiquette de tenue au journal');
 }
 /* fiche : trois marches, position, marche suivante */
 const p6=perfOf('bird-dog'); p6.tenue=6; p6.range=[4,8]; p6.target=4;
 const E=echelleOf('bird-dog');
 if(!E||E.quoi!=='tenue'||E.lbl.length!==3||E.i!==1||E.lbl[1]!=='6 s · 4-8') err('echelle de tenues sur la fiche : '+JSON.stringify(E));
 const H=echelleHtml('bird-dog');
 if(!/Marche <b class="num">2<\\/b> sur <b class="num">3<\\/b>/.test(H)) err('position sur l echelle : '+H);
 if(!/Marche suivante : <b>10 s · 3-6<\\/b>/.test(H)) err('marche suivante : le barreau de 10 s');
 if(!/toutes les séries atteignent <b class="num">8<\\/b> tenues/.test(H)) err('condition de montee au haut du barreau, en tenues : '+H);
 html=''; showFiche('bird-dog');
 if(!/Fourchette de travail : 4-8 tenues de 6 s × 2 séries, par côté/.test(html)) err('la fourchette de travail de la fiche est celle du barreau, avec sa tenue');
 delete state.perf['dead-bug'];
 if(echelleOf('dead-bug').i!==-1) err('sans performance, vierge, comme une bande');
 console.log('journal OK : it.tenue, derniere fois, palier d un passage, etiquette, fiche a trois marches');

 console.log('TESTS TENUES RYTHMEES V2.17 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
