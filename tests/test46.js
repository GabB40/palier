/* test46 : lot v2.19, gainage lateral avec abductions. L exercice passe des
   secondes aux repetitions cadencees : planche tenue sur un cote, jambe du
   dessus qui monte et descend au son, un cote entier puis l autre. L ecran se
   pilote a l horloge, comme test44 : l etat se derive du temps ecoule, les
   coups sont programmes en avance sur l horloge audio. Sections : catalogue,
   modele de temps, premier cote, second cote et validation, Stop precoce et
   sans son, abandon et retours, progression et journal, migration de la
   performance tenue, passages herites, fiche. */
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
 const dit=(m,re)=>m.some(x=>re.test(x));
 const ID='gainage-lateral-jambe-levee';
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=3; state.sound=true; };
 const pose=(o)=>{ const p=perfOf(ID); p.range=[8,15]; p.target=(o&&o.target!=null)?o.target:8;
   if(o&&o.hold) p.hold=true; else delete p.hold; delete p.grace; delete p.prevMin; p.best=0; p.sets=[]; return p; };
 const seance=()=>{ startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:ID,key:ID,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:ID,key:ID,set:2,of:2,round:2}];
   cur.i=0; renderSession(); return cur.steps[0]; };
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 const rel=(o,T0,off)=>Math.round((o.at-off-T0)*100)/100;

 await neuf();
 // 1. catalogue
 {
   const e=DB[ID];
   if(e.mode!=='bw'||!e.side||e.sets!==2||JSON.stringify(e.reps)!=='[8,15]') err('mode bw, par cote, 2 series, 8-15 : '+JSON.stringify({m:e.mode,r:e.reps,s:e.sets}));
   if(JSON.stringify(e.cadence)!==JSON.stringify({monte:1.5,descente:1.5,etab:3})) err('cadence 1,5 / 1,5, etablissement 3 s : '+JSON.stringify(e.cadence));
   if(e.rhythm||e.assise||rungSpec(e)) err('aucune echelle de consigne : la progression est celle d un bw');
   if(unitOf(e)!=='reps') err('unite : reps, '+unitOf(e));
   if(e.retire!=='gainage-lateral'||e.fb!=='gainage-lateral') err('retrait et repli inchanges');
   if(!e.lock||e.lock.after!=='gainage-lateral'||e.lock.need!==45||e.lock.minSets!==2) err('verrou inchange : 2 series de 45 s au gainage lateral');
   if(e.nom!=='Gainage latéral, abductions'||e.en!=='Side plank with hip abduction') err('nom : '+e.nom+' / '+e.en);
   const d=e.desc.join(' ');
   if(!/double bip/.test(d)||!/bip aigu/.test(d)||!/bip grave/.test(d)||!/1,5 s/.test(d)||!/35°/.test(d)||!/effleurer/.test(d)) err('la fiche s execute au son, 1,5 s, 35°, effleurer : '+d);
   if(!/jambe revenue/.test(d)) err('la fiche dit quand une repetition compte');
   if(/chrono/.test(d)||/tiens-la/.test(d)) err('plus rien de la tenue dans le geste');
   if(!e.fin||!/ligne casse/.test(e.fin)) err('critere de fin propre');
   if(/appui en moins/.test(e.vig)) err('l appui en moins etait faux : jambes serrees, deux appuis au sol');
   if(!/seule la hanche bouge/.test(e.vig)||e.vig.indexOf('<b>Épaules :</b>')<0||!/ne bloque jamais/.test(e.vig)) err('vigilance : tronc immobile, epaules, anti-apnee');
   if(/[Ll]est/.test(e.next)||!/pas de marche outillée/.test(e.next)) err('plafond : impasse dite, aucun lest promis : '+e.next);
   if(DB['gainage-lateral'].next!=='le gainage latéral avec abductions prend le relais') err('plafond du predecesseur : '+DB['gainage-lateral'].next);
   if(DB['bird-dog'].cadence||DB['gainage-lateral'].cadence) err('la cadence ne concerne que cet exercice');
   /* v2.22 : la lignee du pont fessier rejoint la cadence, avec sa propre spec */
   if(Object.keys(DB).filter(id=>DB[id].cadence&&!DB[id].cadence.reprise).join()!==ID) err('un seul exercice cadence sans reprise');
   if(typeof cadStart!=='function'||typeof toggleCadence!=='function'||CAD_GO!==1150) err('moteur cadence et depart a 1150');
 }
 console.log('catalogue OK : bw 8-15 par cote, cadence 1,5/1,5 et 3 s, verrou et repli inchanges, fiche au son, plafond sans lest');

 // 2. modele de temps
 await neuf();
 pose({target:8});
 if(serieSec(ID)!==INSTALL+2*(3+3+8*3)) err('serie : INSTALL + 2 x (prep + etab + cible x 3), '+serieSec(ID));
 pose({target:15});
 if(serieSec(ID)!==INSTALL+2*(3+3+45)) err('a 15 : 45 s de cadence par cote, '+serieSec(ID));
 state.prep=5;
 if(serieSec(ID)!==INSTALL+2*(5+3+45)) err('le decompte regle entre au modele');
 if(serieModelAdd(ID,15)!==INSTALL) err('rejeu : tout a defile au tick');
 if(serieSec('bird-dog')!==INSTALL+5+2*perfOf('bird-dog').target*5) err('le modele du bird-dog ne bouge pas');
 console.log('modele OK : deux cotes chronometres, etablissement compris, rejeu a l installation');

 // 3. premier cote, a horloge pilotee
 await neuf();
 pose({target:5});
 let st=seance();
 if(st.val!==0) err('avant le depart la valeur vaut 0');
 if(html.indexOf('toggleCadence()')<0||html.indexOf('>Démarrer<')<0) err('bouton Demarrer');
 if(/Prêt · Droite/.test(html)===false) err('avant le depart : Pret, cote droit');
 if(!/Droite à faire<\\/span> · Gauche à faire · cible <b class="num">5<\\/b> par côté/.test(html)) err('comptes : a faire, cote droit mis en valeur : '+html.match(/id="rcount">[^]*?<\\/div>/));
 if(html.indexOf('trimCad(')>=0||html.indexOf('resetCad()')>=0) err('ni rognage ni remise a zero avant toute mesure');
 if(/<span>Tenue<\\/span>/.test(html)) err('pas de barreau de tenue en tete');
 if(!/<b class="num">8-15<\\/b><span>Fourchette/.test(html)) err('fourchette 8-15 en tete');
 if(!/Montée <b class="num">1,5<\\/b> s, descente <b class="num">1,5<\\/b> s, au son/.test(html)) err('consigne de cadence avant le depart');
 validateSet(); if(cur.i!==0) err('Valider inerte avant toute mesure');
 tones.length=0;
 const wall0=WALL;
 toggleCadence();
 if(!st.ct.on||Math.abs(st.ct.t0-(wall0+6.15))>1e-9) err('depart : t0 = maintenant + decompte + 0,15 + etablissement, '+(st.ct.t0-wall0));
 if(el('#phlabel').textContent!=='En position · Droite'||el('#cc').textContent!=='3') err('decompte : En position, 3 : '+el('#cc').textContent);
 if(!/Allonge-toi sur le côté droit/.test(el('#aide').textContent)) err('consigne du decompte');
 const T0=st.ct.t0, off=st.ct.off, zero=T0-3;
 const prep=tones.filter(o=>o.frequency.value===700&&o.at<zero+off-1e-6).map(o=>Math.round((o.at-off-zero)*100)/100).sort((a,b)=>a-b);
 if(JSON.stringify(prep)!==JSON.stringify([-3,-2.74,-2,-1.74,-1,-0.74])) err('decompte en coup double a 700 Hz : '+JSON.stringify(prep));
 const go=tones.filter(o=>o.frequency.value===1150).map(o=>Math.round((o.at-off-zero)*100)/100);
 if(JSON.stringify(go)!=='[0,0.26]') err('au zero, le double coup a 1150 du gainage lateral classique : '+JSON.stringify(go));
 avance(3.3);                                   /* e = -2.85 : etablissement */
 if(el('#phlabel').textContent!=='Droite'||el('#cc').textContent!=='0'||!/Établis la ligne/.test(el('#phase').innerHTML)) err('etablissement : Droite, 0, Etablis la ligne : '+el('#phlabel').textContent+' '+el('#cc').textContent+' '+el('#phase').innerHTML);
 if(!/tag ok/.test(el('#phase').innerHTML)) err('etablissement en vert');
 if(!/Droite <b class="num">0<\\/b>/.test(el('#rcount').innerHTML)) err('etablissement : le cote en jeu est a 0');
 if(tones.some(o=>o.frequency.value===950&&o.at<T0+off-1e-6)) err('aucune montee pendant l etablissement');
 avance(2.95);                                  /* e = 0.10 : premiere montee */
 const m0=tones.find(o=>Math.abs(o.at-(T0+off))<1e-6);
 if(!m0||m0.frequency.value!==950) err('premiere montee a 950 Hz sur t0');
 if(!/>Monte</.test(el('#phase').innerHTML)||el('#cc').textContent!=='1') err('e=0,1 : Monte, repetition en cours 1 (v2.22)');
 if(!/Le Stop fige ce côté/.test(el('#aide').textContent)) err('consigne pendant la cadence');
 validateSet(); trimCad(0); touche('-');
 if(cur.i!==0||!st.ct.on||st.sides[0]!=null) err('pendant la cadence : Valider, rognage et touche moins inertes');
 avance(1.5);                                   /* e = 1.6 : descente */
 if(!/>Descends</.test(el('#phase').innerHTML)||!/tag pause/.test(el('#phase').innerHTML)||el('#cc').textContent!=='1') err('e=1,6 : Descends en orange, repetition en cours 1');
 avance(1.5);                                   /* e = 3.1 : repetition comptee jambe revenue */
 if(el('#cc').textContent!=='2'||!/>Monte</.test(el('#phase').innerHTML)) err('e=3,1 : repetition en cours 2, Monte');
 if(!/<span style="color:var\\(--accent\\);font-weight:700">Droite <b class="num">1<\\/b><\\/span> · Gauche à faire/.test(el('#rcount').innerHTML)) err('comptes en direct : '+el('#rcount').innerHTML);
 avance(17.7);                                  /* e = 20.8 : six repetitions, septieme programmee */
 const mon=tones.filter(o=>o.frequency.value===950&&o.at>=T0+off-1e-6).map(o=>rel(o,T0,off));
 const des=tones.filter(o=>o.frequency.value===700&&o.at>T0+off).map(o=>rel(o,T0,off));
 const cib=tones.filter(o=>o.frequency.value===1200).map(o=>rel(o,T0,off));
 if(JSON.stringify(mon)!=='[0,3,6,9,15,18,21]') err('montees tous les 3 s, sauf celle de la repetition-cible : '+JSON.stringify(mon));
 if(JSON.stringify(des)!=='[1.5,4.5,7.5,10.5,13.5,16.5,19.5,22.5]') err('descentes a 1,5 s de chaque montee, cadence continue : '+JSON.stringify(des));
 if(JSON.stringify(cib)!=='[12]') err('v2.22 : ton de cible sur la montee de la cinquieme repetition, a la place de son 950 : '+JSON.stringify(cib));
 if(cur.model<20) err('le temps qui defile compte au modele : '+cur.model);
 const pendant=tones.filter(o=>o.at>actx.currentTime);
 if(!pendant.length) err('prealable : des coups programmes au-dela du Stop');
 toggleCadence();                               /* Stop en montee de la septieme */
 if(st.ct.on||!st.done||st.sides[0]!==6||st.sides[1]!==null||st.val!==6) err('Stop : cote droit a 6, gauche a faire : '+JSON.stringify(st.sides));
 if(!pendant.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('les coups programmes sont annules au Stop');
 if(!/Côté droit mesuré/.test(html)||!/>Second côté</.test(html)) err('apres le Stop : cote droit mesure, Second cote');
 if(!/Retourne-toi, puis Second côté/.test(html)) err('consigne de retournement');
 if(html.indexOf('trimCad(0)')<0||html.indexOf('trimCad(1)')<0||html.indexOf('resetCad()')<0) err('rognage par cote et remise a zero proposes');
 if(!/trimCad\\(1\\)" disabled/.test(html)) err('le cote gauche non mesure ne se rogne pas');
 if(/class="big ok"/.test(html)) err('un seul cote mesure : Valider inerte');
 validateSet(); if(cur.i!==0) err('Valider inerte sur un seul cote');
 console.log('premier cote OK : decompte, depart a 1150, etablissement, montees et descentes a 1,5 s, compte jambe revenue, ton de cible a la place de la montee, Stop qui annule');

 // 4. second cote, validation, rognage, remise a zero
 {
   const w1=WALL;
   espace();
   if(!st.ct.on||st.side!==1||st.done) err('ESPACE lance le second cote');
   if(el('#phlabel').textContent!=='En position · Gauche') err('decompte du second cote : '+el('#phlabel').textContent);
   if(!/Allonge-toi sur le côté gauche/.test(el('#aide').textContent)) err('consigne du second cote');
   const T1=st.ct.t0;
   if(Math.abs(T1-(w1+6.15))>1e-9) err('second cote : meme depart');
   avance(7);
   trimCad(0); trimCad(1); touche('-'); validateSet();
   if(st.sides[0]!==6||st.sides[1]!==null||cur.i!==0||!st.ct.on) err('pendant le second cote : rognage des deux cotes et validation inertes : '+st.sides);
   avance(6.15+12.4-7);                         /* e = 12.4 : quatre repetitions */
   if(el('#phlabel').textContent!=='Gauche'||el('#cc').textContent!=='5') err('second cote : Gauche, quatre faites, cinquieme en cours');
   if(!/Droite <b class="num">6<\\/b> · <span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">4<\\/b>/.test(el('#rcount').innerHTML)) err('comptes des deux cotes : '+el('#rcount').innerHTML);
   espace();
   if(st.ct.on||st.sides.join()!=='6,4'||!st.done) err('ESPACE arrete le second cote : '+st.sides);
   if(!/Au journal : <b class="num">4<\\/b> répétitions par côté, le côté le plus court fait foi/.test(html)) err('ligne de journal');
   if(html.indexOf('class="big ok"')<0) err('deux cotes mesures : Valider actif');
   if(!/id="ct" disabled/.test(html)||!/>Série mesurée</.test(html)) err('bouton principal eteint : serie mesuree');
   espace(); if(st.ct.on||st.side!==1) err('ESPACE inerte apres le dernier cote');
   touche('-');
   if(st.sides.join()!=='6,3'||st.val!==3) err('touche moins : rogne le cote courant, '+st.sides);
   touche('+'); if(st.sides.join()!=='6,3') err('plus inerte');
   trimCad(0);
   if(st.sides.join()!=='5,3') err('rognage du cote droit : '+st.sides);
   if(!/Au journal : <b class="num">3<\\/b> répétitions par côté/.test(html)) err('le journal suit le rognage');
   for(let i=0;i<9;i++) trimCad(1);
   if(st.sides[1]!==0) err('plancher a zero : '+st.sides);
   if(!/trimCad\\(1\\)" disabled/.test(html)) err('bouton gris a zero');
   if(/class="big ok"/.test(html)) err('un cote a zero : Valider inerte');
   if(!/Un côté sans répétition complète/.test(html)) err('message d un cote a zero');
   validateSet(); if(cur.i!==0) err('un cote a zero ne se valide pas');
   resetCad();
   if(st.sides[1]!==null||st.done||st.side!==1||st.sides[0]!==5) err('remise a zero du seul cote courant : '+JSON.stringify(st.sides));
   if(!/>Second côté</.test(html)||!/Prêt · Gauche/.test(html)) err('apres remise a zero : Pret, Gauche, Second cote');
   toggleCadence(); avance(6.15+15.2);           /* e = 15.2 : cinq */
   toggleCadence();
   if(st.sides.join()!=='5,5') err('second cote refait : '+st.sides);
   if(/le côté le plus court fait foi/.test(html)) err('cotes egaux : pas de mention du cote court');
   validateSet();
   if(cur.i!==1||JSON.stringify(cur.log[ID])!=='[5]') err('validation : 5 au journal, '+JSON.stringify(cur.log));
   if(!cur.back||cur.back.val!==5) err('un pas en arriere est ouvert');
   stepBack();
   const s0=cur.steps[0];
   /* le rendu qui suit le retour recree un etat vierge */
   if(cur.i!==0||(s0.ct&&s0.ct.on)||JSON.stringify(s0.sides)!=='[null,null]'||s0.done||s0.side!==0||cur.log[ID]) err('stepBack efface la mesure cadencee : '+JSON.stringify(s0));
   if(!/Prêt · Droite/.test(html)) err('apres le retour, on repart du cote droit');
 }
 console.log('second cote OK : ESPACE, comptes des deux cotes, cote court au journal, ESPACE inerte, rognage par cote, plancher, remise a zero du cote courant, validation, retour d un pas');

 // 5. Stop precoce, sans son
 await neuf();
 pose({target:8});
 st=seance();
 toggleCadence(); avance(1);
 toggleCadence();
 if(st.sides[0]!==0||!st.done) err('Stop pendant le decompte : 0');
 if(!/Aucune répétition complète : réinitialise ce côté/.test(html)) err('message d un cote vide');
 resetCad();
 toggleCadence(); avance(4);                    /* e = -2.15 : etablissement */
 toggleCadence();
 if(st.sides[0]!==0) err('Stop pendant l etablissement : 0');
 espace(); avance(6.15+3.2); espace();
 if(st.sides.join()!=='0,1') err('second cote a 1 : '+st.sides);
 validateSet(); if(cur.i!==0) err('un premier cote vide ne se valide pas');
 await neuf();
 pose({target:8}); state.sound=false; tones.length=0;
 st=seance();
 toggleCadence(); avance(6.15+4.6);
 if(tones.length) err('son coupe : aucun coup');
 if(st.ct.off!==null) err('son coupe : pas d horloge audio');
 if(el('#cc').textContent!=='2'||!/>Descends</.test(el('#phase').innerHTML)) err('son coupe : la cadence se lit a l ecran');
 toggleCadence(); if(st.sides[0]!==1) err('son coupe : la mesure vaut');
 console.log('stop precoce OK : decompte et etablissement valent 0, cote vide non validable, sans son la cadence se lit');

 // 6. abandon, repli douleur et retour
 await neuf();
 pose({target:8});
 st=seance();
 toggleCadence(); avance(10);
 {
   const avance_=tones.filter(o=>o.at>actx.currentTime);
   if(!st.ct.on||!avance_.length) err('prealable : cadence en cours');
   skipSet();
   if(st.ct.on) err('serie passee : cadence desarmee');
   if(!avance_.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('serie passee : coups annules');
   if(cur.i!==1) err('serie passee : on avance');
 }
 await neuf();
 pose({target:8});
 st=seance();
 toggleCadence(); avance(6.15+9.2); toggleCadence();
 if(st.sides[0]!==3) err('prealable : cote droit a 3');
 if(fbOf(ID)!=='gainage-lateral') err('prealable : repli sur le gainage lateral');
 toggleCadence(); avance(1);
 swapPain();
 const sp=cur.steps[0];
 if(sp.id!=='gainage-lateral'||sp.ct||JSON.stringify(sp.sides)!=='[null,null]'||sp.done||sp.side!==0) err('repli : la mesure cadencee ne passe pas au repli tenu : '+JSON.stringify(sp));
 if(tones.some(o=>o.at>actx.currentTime&&!(o.stops||[]).length)) err('repli : les coups en attente sont annules');
 if(cur.steps[2].ct||cur.steps[2].sides) err('repli : les series suivantes repartent vierges');
 if(!/1er côté : \\u2014/.test(html)) err('le repli tenu repart de zero : '+(html.match(/1er côté[^<]*/)||[''])[0]);
 toggleChrono(); avance(2); toggleChrono();
 if(!sp.sides||sp.sides[0]==null) err('prealable : une tenue mesuree sur le repli');
 revertSwap();
 if(sp.id!==ID||JSON.stringify(sp.sides)!=='[null,null]'||sp.done||sp.side!==0||(sp.ct&&sp.ct.on)) err('retour : la tenue en secondes ne revient pas sur l exercice cadence : '+JSON.stringify(sp));
 if(!/Prêt · Droite/.test(html)||!/Droite à faire/.test(html)) err('retour : ecran cadence vierge');
 cur=null; view='home';
 console.log('abandon OK : serie passee desarmee ; repli et retour sans transport de mesure');

 // 7. progression et journal
 await neuf();
 {
   let p=pose({target:15});
   let m=applyProgress(ID,[15,15],true,false);
   if(p.range.join('-')!=='8-15'||p.target!==15||p.grace) err('au plafond : fourchette et cible immobiles : '+JSON.stringify(p));
   if(!dit(m,/Plafond atteint/)||!m.some(x=>x.indexOf(DB[ID].next)>=0)) err('message de plafond : '+m.join(' | '));
   p=pose({target:8});
   applyProgress(ID,[10,9],true,false);
   if(p.range.join('-')!=='8-15'||p.target<9||p.target>11) err('cible suivante en repetitions : '+JSON.stringify(p));
   if(p.tenue!=null||p.assise!=null) err('aucun barreau pose');
   if(estMontee(p,{range:[8,15],load:0,target:8},DB[ID])) err('aucune montee de palier sur un bw');
   const E=echelleOf(ID);
   if(!E||E.quoi!=='fourchette'||E.lbl.join()!=='8-15 reps'||E.i!==0) err('fiche : fourchette 8-15 reps, '+JSON.stringify(E));
 }
 await neuf();
 pose({target:6});
 startSession(); cur.phase='work';
 cur.steps=[{k:'set',id:ID,key:ID,set:1,of:2,round:1},{k:'set',id:ID,key:ID,set:2,of:2,round:2}];
 cur.i=0; renderSession();
 for(let k=0;k<2;k++){ const s=cur.steps[cur.i]; s.sides=[7,6]; s.side=1; s.done=true; s.ct={on:false,t0:null}; validateSet(); }
 for(let i=0;i<80;i++) await Promise.resolve();
 {
   const h=state.hist[state.hist.length-1];
   const it=h&&h.items.find(x=>x.id===ID);
   if(!it||JSON.stringify(it.sets)!=='[6,6]') err('journal : 6 et 6, cote court : '+JSON.stringify(it));
   if(JSON.stringify(it.rng)!=='[8,15]'||it.tenue!=null||it.assise!=null||it.u!=null) err('passage : fourchette 8-15, ni tenue, ni assise, ni unite heritee : '+JSON.stringify(it));
   if(unitAt(DB[ID],it)!=='reps') err('unite du passage : reps');
   if(palierVal(ID,it)!=='8-15') err('palier du passage : 8-15');
 }
 cur=null; view='home';
 console.log('progression OK : plafond sans marche, cible en repetitions, fourchette seule, journal au cote court avec it.rng');

 // 8. migration de la performance tenue
 await neuf();
 {
   const vieux={load:0,range:[15,45],target:30,best:45,sets:[45,44],prevMin:44,date:'2026-09-16T10:00:00.000Z'};
   const conforme={load:0,range:[8,15],target:12,best:12,sets:[12,11],prevMin:11,date:'2026-09-18T10:00:00.000Z'};
   const glat={load:0,range:[15,45],target:45,best:49,sets:[49,48,48],prevMin:48,date:'2026-09-15T10:00:00.000Z'};
   state.unlocked[ID]=true;
   state.perf[ID]=g(vieux); state.perf['gainage-lateral']=g(glat);
   state.hist=[
     {date:'2026-09-15T10:00:00.000Z',rounds:3,items:[{id:'gainage-lateral',sets:[49,48,48],load:0,rng:[15,45]}]},
     {date:'2026-09-16T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[45,44],load:0,rng:[15,45]},{id:'bird-dog',sets:[8,8],load:0,rng:[6,12],tenue:3}]}
   ];
   state.undo={date:'2026-09-16T10:00:00.000Z',keys:[ID],full:{},perf:{[ID]:g(vieux)}};
   await save(); state=null; await loadState();
   const q=state.perf[ID];
   if(q&&(q.range.join('-')!=='8-15'||(q.sets||[]).length||q.prevMin!=null||q.best)) err('la performance tenue repart de zero : '+JSON.stringify(q));
   const q2=perfOf(ID);
   if(q2.range.join('-')!=='8-15'||q2.target!==8||q2.sets.length) err('recreee au bas de fourchette : '+JSON.stringify(q2));
   if(!state.unlocked[ID]) err('le deblocage est conserve');
   if(JSON.stringify(state.perf['gainage-lateral'])!==JSON.stringify(glat)) err('le gainage lateral n est pas touche : '+JSON.stringify(state.perf['gainage-lateral']));
   const itv=state.hist[1].items[0], itb=state.hist[1].items[1], itg=state.hist[0].items[0];
   if(itv.u!=='s') err('le passage tenu est marque en secondes : '+JSON.stringify(itv));
   if(JSON.stringify(itv.sets)!=='[45,44]'||JSON.stringify(itv.rng)!=='[15,45]') err('le passage tenu garde ses valeurs');
   if(itb.u!=null||itg.u!=null) err('aucun autre passage marque');
   if(state.undo) err('la seance jouee sous l ancien regime ne se corrige plus');
   if(corrigible()) err('correction fermee');
   /* idempotence et etat conforme */
   state.perf[ID]=g(conforme);
   state.hist[1].items.push({id:ID,sets:[12,11],load:0,rng:[8,15]});
   state.undo={date:state.hist[1].date,keys:[ID],full:{},perf:{[ID]:g(conforme)}};
   const a=migrateState(g(state)), b=migrateState(g(a));
   if(JSON.stringify(a)!==JSON.stringify(b)) err('migration non idempotente');
   if(JSON.stringify(a.perf[ID])!==JSON.stringify(conforme)) err('une performance conforme ne bouge pas : '+JSON.stringify(a.perf[ID]));
   if(a.hist[1].items[2].u!=null) err('un passage cadence n est pas marque');
   if(!a.undo) err('un instantane conforme est garde');
   /* etat neuf : no-op */
   await neuf();
   const n0=g(state), n1=migrateState(g(state));
   if(JSON.stringify(n0.perf)!==JSON.stringify(n1.perf)||JSON.stringify(n0.hist)!==JSON.stringify(n1.hist)) err('etat neuf : migration sans effet');
 }
 console.log('migration OK : performance tenue remise a zero, deblocage garde, passages tenus marques en secondes, correction fermee, idempotente, conforme et neuf intacts');

 // 9. passages herites a l affichage
 await neuf();
 {
   state.unlocked[ID]=true;
   state.hist=[
     {date:'2026-09-16T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[45,44],load:0,rng:[15,45]}]},
     {date:'2026-09-18T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[9,8],load:0,rng:[8,15]}]},
     {date:'2026-09-20T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[10,10],load:0,rng:[8,15]}]}
   ];
   await save(); state=null; await loadState();
   const P=exoPassages(ID);
   if(P.length!==3||P[0].it.u!=='s') err('prealable : trois passages, le premier en secondes');
   if(unitAt(DB[ID],P[0].it)!=='s'||unitAt(DB[ID],P[1].it)!=='reps') err('unite par passage');
   if(palierVal(ID,P[0].it)!==null) err('un passage tenu n est pas un palier de l echelle actuelle');
   const PAL=paliersOf(ID);
   if(PAL.length!==1||PAL[0].v!=='8-15'||!PAL[0].first) err('chemin des paliers : depart a 8-15, sans descente fantome depuis 15-45 : '+JSON.stringify(PAL));
   html=''; showFiche(ID); ficheMoreId=ID; html=''; showFiche(ID);
   if(html.indexOf(setsHtml([45,44])+' s</span>')<0) err('fiche : le passage tenu se lit en secondes');
   if(html.indexOf(setsHtml([45,44])+' reps')>=0) err('fiche : jamais des secondes lues comme des repetitions');
   if(html.indexOf(setsHtml([9,8])+' reps</span>')<0) err('fiche : les passages cadences en reps');
   if(/↓ <b>8-15/.test(html)) err('fiche : pas de descente fantome');
   const H=histItemsHtml(state.hist[0]);
   if(H.indexOf(setsHtml([45,44])+' s</span>')<0) err('detail de seance : secondes');
   if(histItemsHtml(state.hist[1]).indexOf(setsHtml([9,8])+' reps')<0) err('detail de seance : reps');
   ficheMoreId=null;
 }
 console.log('passages herites OK : unite par passage a la fiche et au detail, chemin des paliers sans le regime tenu');

 // 10. fiche
 await neuf();
 {
   html=''; showFiche(ID);
   if(html.indexOf('Gainage latéral, abductions')<0) err('nom sur la fiche');
   if(html.indexOf(lockCond(DB[ID]))<0) err('verrou sur la fiche');
   if(!/Fin de série<\\/b> · le bassin qui descend/.test(html)) err('critere de fin rendu');
   if(!/Fourchette de travail : 8-15 reps/.test(html)) err('fourchette de travail en reps : '+(html.match(/Fourchette de travail[^<]*/)||[''])[0]);
   if(html.indexOf('35°')<0||html.indexOf('double bip')<0) err('geste rendu');
   view='lib'; html=''; render();
   if(html.indexOf('Gainage latéral, abductions')<0) err('bibliotheque');
 }
 console.log('fiche OK : nom, verrou, critere de fin, fourchette en reps, geste, bibliotheque');

 // 11. repli douleur entre deux tenues
 await neuf();
 {
   state.unlocked['planche-ballon']=true;
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:'planche-ballon',key:'planche-ballon',set:1,of:2,round:1},{k:'set',id:'planche-ballon',key:'planche-ballon',set:2,of:2,round:2}];
   cur.i=0; renderSession();
   const s1=cur.steps[0];
   if(fbOf('planche-ballon')!=='planche') err('prealable : la planche au sol est le repli du ballon');
   toggleChrono(); tic(3+17); toggleChrono();   /* 3 s de decompte */
   if(s1.sides[0]!==17||!s1.done||!/class="big ok"/.test(html)) err('prealable : 17 s mesurees sur le ballon, validables : '+JSON.stringify(s1.sides));
   swapPain();
   if(s1.id!=='planche') err('repli vers la planche au sol');
   if(s1.done||s1.val||(s1.sides&&s1.sides[0]!=null)) err('la tenue faite sur le ballon ne suit pas l exercice qui change d identite : '+JSON.stringify({sides:s1.sides,done:s1.done,val:s1.val}));
   if(/class="big ok"/.test(html)) err('rien a valider tant que la tenue n est pas refaite au sol');
   if(cur.steps[1].sides&&cur.steps[1].sides[0]!=null) err('les series suivantes repartent vierges');
   validateSet();
   if(cur.i!==0||cur.log['planche-ballon>planche']) err('aucune valeur ne part au journal du repli : '+JSON.stringify(cur.log));
   toggleChrono(); tic(3+24); toggleChrono();
   if(s1.sides[0]!==24) err('prealable : 24 s mesurees au sol');
   revertSwap();
   if(s1.id!=='planche-ballon') err('retour au ballon');
   if(s1.done||s1.val||(s1.sides&&s1.sides[0]!=null)) err('la tenue faite au sol ne revient pas sur le ballon : '+JSON.stringify({sides:s1.sides,done:s1.done}));
   /* une serie deja validee reste acquise : le repli n efface que l etape en cours */
   toggleChrono(); tic(3+30); toggleChrono(); validateSet();
   if(JSON.stringify(cur.log['planche-ballon'])!=='[30]') err('prealable : une serie validee sur le ballon');
   swapPain();
   if(JSON.stringify(cur.log['planche-ballon'])!=='[30]') err('le repli ne defait pas une serie deja validee');
   if(cur.steps[1].id!=='planche'||cur.steps[1].done) err('la serie suivante bascule, vierge');
 }
 cur=null; view='home';
 console.log('repli entre tenues OK : la mesure ne suit pas le changement d identite, dans les deux sens, et une serie validee reste acquise');

 console.log('TESTS REPETITIONS CADENCEES V2.19 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
