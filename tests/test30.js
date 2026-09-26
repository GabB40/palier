/* test30 : lot v2.4. Progression par exercice sur les fiches. Reconstruction
   retroactive depuis state.hist, chemin des paliers dans les deux sens et sur
   les deux sens de bande, garde d ecriture de it.rng et sa survie a la
   correction, position et fenetre sur l echelle, bornage des passages, ligne
   de repli, verrou dans les deux sens, provenance, silence des blocs la ou ils
   n ont rien a dire. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{throw new Error(m);};
 /* l etat neuf part d un inventaire vide : chaque rechargement s ancre au
    domicile, et le drapeau s abaisse au lieu de disparaitre (v2.3) */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; ficheMoreId=null;
   await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 /* une entree d historique posee a la main, a J-n */
 const seance=(joursAvant,items,extra)=>{
   const d=new Date(); d.setDate(d.getDate()-joursAvant);
   return Object.assign({date:d.toISOString(),type:'alterne',mode:'alterne',rounds:3,plan:15,xp:30,items:items},extra||{});
 };
 /* joue une seance entiere jusqu au recapitulatif, valeur imposee par serie */
 const jouer=async(v)=>{
   startSession(); cur.phase='work';
   let garde=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length){
     if(++garde>400) err('boucle de seance non bornee');
     const s=cur.steps[cur.i];
     if(!s) break;
     if(s.k!=='set'){ nextStep(); continue; }
     if(DB[s.id].mode==='time'){ s.sides=new Array(DB[s.id].side?2:1).fill(30); s.done=true; }
     /* v2.17 : une tenue rythmee se valide arretee, comme une tenue mesuree */
     if(DB[s.id].rhythm){ s.rt={d:v,g:v,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; }
     /* v2.22 : le pont fessier est cadence */
     if(DB[s.id].cadence){ cadInit(s); s.sides=s.sides.map(()=>v); s.side=s.sides.length-1; s.done=true; }
     s.val=v; validateSet();
   }
   for(let i=0;i<60;i++) await Promise.resolve();   /* endSession est async */
 };

 /* ---------- 1. reconstruction retroactive ---------- */
 await neuf();
 const ID='developpe-sol';
 state.hist=[seance(9,[{id:ID,sets:[8,8,8],load:6}]),
             seance(6,[{id:ID,sets:[9,9,9],load:6}]),
             seance(3,[{id:ID,sets:[12,12,12],load:6}])];
 const avant=JSON.stringify(state);
 const P1=exoPassages(ID);
 if(P1.length!==3) err('trois passages attendus, '+P1.length+' rendus');
 if(P1.some(x=>x.repl)) err('aucun de ces passages n est un repli');
 if(P1[0].h.date>P1[2].h.date) err('les passages doivent sortir du plus ancien au plus recent');
 /* la propriete qui justifie le chantier : c est une lecture, rien n est ecrit */
 if(JSON.stringify(state)!==avant) err('exoPassages a modifie l etat');
 if(JSON.stringify(paliersOf(ID))===undefined) err('paliersOf doit rendre un tableau');
 if(JSON.stringify(state)!==avant) err('paliersOf a modifie l etat');
 console.log('retroactif OK : trois passages reconstruits depuis hist, sans aucune ecriture');

 /* ---------- 2. chemin des paliers, montee ---------- */
 await neuf();
 state.hist=[seance(12,[{id:ID,sets:[8,8,8],load:2}]),
             seance(10,[{id:ID,sets:[12,12,12],load:2}]),
             seance(8,[{id:ID,sets:[8,8,8],load:2.5}]),
             seance(6,[{id:ID,sets:[12,12,12],load:2.5}]),
             seance(4,[{id:ID,sets:[8,8,8],load:3}])];
 const M=paliersOf(ID);
 if(M.length!==3) err('trois entrees attendues au chemin des paliers, '+M.length+' rendues');
 if(!M[0].first||M[0].v!==2) err('la premiere entree est le depart, a 2 kg');
 if(M[0].up!==undefined) err('le depart ne porte pas de sens');
 if(M[1].v!==2.5||M[1].up!==true) err('la deuxieme entree est une montee a 2,5 kg');
 if(M[2].v!==3||M[2].up!==true) err('la troisieme entree est une montee a 3 kg');
 /* les dates sont celles du PREMIER passage a chaque valeur, pas du dernier */
 if(M[0].date!==state.hist[0].date) err('date du depart fausse');
 if(M[1].date!==state.hist[2].date) err('la montee est datee du premier passage a 2,5 kg');
 if(M[2].date!==state.hist[4].date) err('la montee est datee du premier passage a 3 kg');
 console.log('montee OK : 2 / 2,5 / 3 kg, depart puis deux montees, aux dates du premier passage');

 /* ---------- 3. chemin des paliers, descente ---------- */
 await neuf();
 state.hist=[seance(9,[{id:ID,sets:[10,10,10],load:6}]),
             seance(6,[{id:ID,sets:[12,12,12],load:7}]),
             seance(3,[{id:ID,sets:[6,6,6],load:6}])];
 const D=paliersOf(ID);
 if(D.length!==3) err('trois entrees attendues, '+D.length+' rendues');
 if(D[1].up!==true) err('6 vers 7 kg est une montee');
 if(D[2].up!==false) err('7 vers 6 kg est une descente');
 if(D[2].v!==6) err('la descente revient a 6 kg');
 console.log('descente OK : 6 / 7 / 6 kg, la troisieme entree est marquee descente');

 /* ---------- 4. chemin des paliers, bandes ---------- */
 /* le sens se lit dans bandOrder et non dans la couleur : sur un exercice
    d assistance, aller vers le barreau plus fin est une montee */
 await neuf();
 const ASS='tractions-assistees-supination', RES='face-pulls';
 if(DB[ASS].bnd!=='ass') err(ASS+' doit etre un exercice d assistance');
 if(DB[RES].bnd==='ass') err(RES+' doit etre un exercice de resistance');
 const Oa=bandOrder(DB[ASS]), Or=bandOrder(DB[RES]);
 if(Oa.indexOf('rouge')<Oa.indexOf('noir')) err('en assistance, rouge doit venir apres noir dans l ordre');
 if(Or.indexOf('rouge')>Or.indexOf('noir')) err('en resistance, rouge doit venir avant noir dans l ordre');
 if(palierUp(ASS,'noir','rouge')!==true) err('assistance : passer du noir au rouge est une montee');
 if(palierUp(ASS,'rouge','noir')!==false) err('assistance : revenir au noir est une descente');
 /* contre-temoin : la meme couleur, l autre sens */
 if(palierUp(RES,'noir','rouge')!==false) err('resistance : passer du noir au rouge est une descente');
 if(palierUp(RES,'rouge','noir')!==true) err('resistance : passer du rouge au noir est une montee');
 state.hist=[seance(9,[{id:ASS,sets:[5,5,5],band:'noir'}]),
             seance(6,[{id:ASS,sets:[8,8,8],band:'rouge'}]),
             seance(3,[{id:ASS,sets:[4,4,4],band:'noir'}])];
 const B=paliersOf(ASS);
 if(B.length!==3||B[1].up!==true||B[2].up!==false) err('chemin des paliers a bande faux : '+JSON.stringify(B));
 console.log('bandes OK : le sens vient de bandOrder, temoin en assistance et contre-temoin en resistance');

 /* ---------- 5. garde d ecriture de it.rng ---------- */
 await neuf();
 const GARDE=Object.keys(DB).filter(id=>{const e=DB[id];return !e.bnd&&(e.mode==='bw'||e.mode==='time');});
 /* l assertion porte sur le critere, jamais sur la valeur courante : une
    assertion qui epingle un nombre devient fausse en meme temps que le code */
 GARDE.forEach(id=>{ const e=DB[id];
   if(e.bnd) err(id+' est a bande, il ne doit pas etre dans la garde');
   if(e.mode!=='bw'&&e.mode!=='time') err(id+' n est ni bw ni time');
 });
 if(DB['pompes-poignees'].mode!=='bw') err('pompes-poignees doit etre en mode bw');
 if(!DB['pompes-poignees'].bnd) err('pompes-poignees doit progresser par la bande');
 if(GARDE.indexOf('pompes-poignees')>=0) err('pompes-poignees est en bw mais progresse par bande : il sort de la garde');
 /* partition : tout exercice qui porte une echelle est couvert par exactement
    un regime, dans l ordre d applyProgress : charge, bande, charge fixe, puis
    fourchette. Aucun ne doit rester sans valeur de palier. */
 Object.keys(DB).forEach(id=>{
   const e=DB[id];
   if(!echelleOf(id)) return;
   const regimes=[!!e.bnd,e.mode==='load'||e.mode==='fixed',GARDE.indexOf(id)>=0].filter(Boolean).length;
   if(regimes!==1) err(id+' est couvert par '+regimes+' regimes de palier au lieu d un seul');
 });
 console.log('garde OK : '+GARDE.length+' exercices, pompes-poignees exclu, un seul regime de palier par echelle');

 /* ---------- 6. survie a la correction ---------- */
 await neuf();
 await jouer(9);
 if(!corrigible()) err('la seance jouee doit etre corrigible');
 const h6=state.hist[state.hist.length-1];
 const photo=h6.items.map(it=>JSON.stringify({id:it.id,load:it.load,band:it.band,rng:it.rng}));
 const vals={};
 state.undo.keys.forEach((k,i)=>{ if(h6.items[i]) vals[k]=h6.items[i].sets.map(()=>7); });
 corrigerSeance(vals);
 const h6b=state.hist[state.hist.length-1];
 h6b.items.forEach((it,i)=>{
   if(JSON.stringify({id:it.id,load:it.load,band:it.band,rng:it.rng})!==photo[i])
     err('la correction a touche load, band ou rng sur '+it.id);
   if(it.sets.some(v=>v!==7)) err('les series corrigees doivent valoir 7 sur '+it.id);
 });
 console.log('correction OK : sur '+h6b.items.length+' items, seuls les sets bougent, load band et rng intacts');

 /* ---------- 7. position sur l echelle ---------- */
 await neuf();
 const L7=loadLadderProg(state.gear);
 if(rangIn(L7,L7[4])!==4) err('rangIn doit rendre la marche exacte quand elle existe');
 /* une valeur intermediaire retombe sur la plus haute marche atteinte : c est
    le reglage manuel, qui se fait sur l echelle complete */
 const entre=(L7[4]+L7[5])/2;
 if(rangIn(L7,entre)!==4) err('rangIn doit retomber sur la plus haute marche atteinte');
 if(rangIn(L7,L7[0]-1)!==-1) err('rangIn doit rendre -1 quand rien n est regle');
 /* le cas -1 annonce le depart de l echelle, jamais une marche suivante */
 if(state.perf[ID]) err('la perf ne doit pas exister avant tout acces');
 const H7=echelleHtml(ID);
 if(H7.indexOf('l\\'échelle commence à')<0) err('le depart d echelle doit etre annonce : '+H7);
 if(H7.indexOf('Marche suivante')>=0) err('aucune marche suivante ne doit etre annoncee au depart');
 /* et surtout, un depart ne se lit pas comme un plafond : sans marche suivante,
    le bloc retomberait sinon sur le message de derniere marche */
 if(H7.indexOf('Dernière marche outillée')>=0||H7.indexOf('Plafond de la fourchette')>=0)
   err('un depart d echelle ne doit pas etre annonce comme un plafond : '+H7);
 if(H7.indexOf('class="tag ech')>=0) err('aucune pastille d echelle au depart');
 perfOf(ID).load=L7[4];
 if(echelleHtml(ID).indexOf('Marche suivante')<0) err('une fois la perf posee, la marche suivante est annoncee');
 console.log('position OK : marche exacte, repli sur la plus haute atteinte, -1 rend un depart d echelle');

 /* ---------- 8. fenetre d echelle ---------- */
 await neuf();
 const E8=echelleOf(ID);
 if(!E8||E8.lbl.length<10) err('l echelle des halteres doit compter assez de marches pour justifier la fenetre');
 /* v2.15 : les pastilles portent une classe, le test ne les reconnait plus a une taille de police */
 const nPast=s=>(s.match(/class="tag ech/g)||[]).length;
 const nPts=s=>(s.match(/>…</g)||[]).length;
 const N=E8.lbl.length;
 perfOf(ID).load=loadLadderProg(state.gear)[0];
 let s8=echelleHtml(ID);
 if(nPast(s8)!==4) err('au bas de l echelle, quatre pastilles attendues, '+nPast(s8));
 if(nPts(s8)!==1||s8.indexOf('…')<s8.indexOf('class="tag ech')) err('au bas de l echelle, un seul point de suspension, a droite');
 perfOf(ID).load=loadLadderProg(state.gear)[Math.floor(N/2)];
 s8=echelleHtml(ID);
 if(nPast(s8)!==7) err('au milieu, sept pastilles attendues, '+nPast(s8));
 if(nPts(s8)!==2) err('au milieu, un point de suspension de chaque cote');
 perfOf(ID).load=loadLadderProg(state.gear)[N-1];
 s8=echelleHtml(ID);
 if(nPast(s8)!==4) err('au sommet, quatre pastilles attendues, '+nPast(s8));
 if(nPts(s8)!==1||s8.lastIndexOf('…')>s8.lastIndexOf('class="tag ech')) err('au sommet, un seul point de suspension, a gauche');
 if(nPast(s8)>7) err('la fenetre ne doit jamais depasser sept pastilles');
 console.log('fenetre OK : '+N+' marches, au plus sept pastilles, points de suspension du bon cote');

 /* ---------- 9. bornage des passages ---------- */
 await neuf();
 state.hist=[]; for(let i=20;i>0;i--) state.hist.push(seance(i,[{id:ID,sets:[8,8,8],load:6}]));
 const lignes=s=>{ const t=s.split('derniers passages</div>')[1]; if(t===undefined) err('bloc des passages introuvable');
   return (t.split('<button')[0].match(/class="histline"/g)||[]).length; };
 let s9=passagesHtml(ID);
 if(lignes(s9)!==3) err('trois lignes attendues replie, '+lignes(s9));
 if(s9.indexOf('Voir plus')<0) err('le bouton Voir plus doit apparaitre au-dela de trois passages');
 ficheMore(ID);
 s9=passagesHtml(ID);
 if(lignes(s9)!==12) err('douze lignes attendues depliees, '+lignes(s9));
 if(s9.indexOf('Voir moins')<0) err('le bouton doit proposer de replier');
 ficheMore(ID);
 s9=passagesHtml(ID);
 if(lignes(s9)!==3) err('le bouton doit rebasculer a trois lignes, '+lignes(s9));
 /* le chemin des paliers, lui, n est jamais tronque */
 state.hist.forEach((h,i)=>{ h.items[0].load=2+i*0.5; });
 const PAL9=paliersOf(ID);
 if(PAL9.length!==20) err('le chemin des paliers ne se tronque pas : '+PAL9.length+' entrees sur 20 changements');
 console.log('bornage OK : trois lignes, douze depliees, retour a trois, chemin des paliers entier a '+PAL9.length+' entrees');

 /* ---------- 10. ligne de repli ---------- */
 await neuf();
 const ORI='planche', REP=DB['planche'].fb;
 if(!REP) err('planche doit declarer un repli');
 state.hist=[seance(6,[{id:ORI,sets:[30,30,30],rng:[20,45]}]),
             seance(3,[{id:REP,sets:[25,25,25],rng:[20,45],sw:true,from:ORI}])];
 const P10=exoPassages(ORI);
 if(P10.length!==2) err('la seance de repli doit apparaitre sur la fiche d origine');
 if(!P10[1].repl) err('la seconde entree doit etre marquee repli');
 const s10=passagesHtml(ORI);
 if(s10.indexOf('remplacé par')<0) err('la ligne de repli doit se nommer');
 if(s10.indexOf('opacity:.5')<0) err('la ligne de repli doit etre grisee');
 if(s10.indexOf('showFiche(\\''+REP+'\\')')<0) err('la ligne de repli doit pointer vers la fiche du repli');
 /* et la seance de repli n entre pas dans le chemin des paliers de l origine */
 if(paliersOf(ORI).length!==1) err('un passage de repli ne fabrique pas un palier sur l origine');
 console.log('repli OK : ligne grisee a sa date, cliquable vers '+REP+', hors du chemin des paliers');

 /* ---------- 11. verrou, les deux sens ---------- */
 await neuf();
 const V='planche-ballon', SRC=DB[V].lock.after;
 delete state.unlocked[V];
 perfOf(SRC).sets=[45,30];
 const v11=verrouHtml(V);
 if(v11.indexOf('Verrouillé par')<0) err('le verrou doit nommer ce qui le ferme');
 if(v11.indexOf(esc(lockCond(DB[V])))<0) err('l enonce du verrou doit etre affiche');
 if(v11.indexOf('À la dernière séance')<0) err('l etat a la derniere seance doit etre affiche');
 if(v11.indexOf('pas sur un record')<0) err('le verrou doit dire qu il lit le dernier passage');
 /* l autre sens, depuis l ouvreur */
 const o11=verrouHtml(SRC);
 if(o11.indexOf('Cet exercice ouvre')<0) err('l ouvreur doit annoncer ce qu il ouvre');
 if(o11.indexOf(esc(DB[V].nom))<0) err('l ouvreur doit nommer l exercice ouvert');
 if(DB[V].retire!==SRC) err(V+' doit retirer '+SRC+' de la rotation');
 if(o11.indexOf('prendra la place')<0) err('le remplacement en rotation doit etre annonce');
 state.unlocked[V]=true;
 if(verrouHtml(SRC).indexOf('a pris la place')<0) err('une fois ouvert, le remplacement se dit au passe');
 /* variante bandGate */
 await neuf();
 const VB='tractions-strictes-supination', SB=DB[VB].lock.after;
 if(!DB[VB].lock.bandGate) err(VB+' doit porter un verrou a bandGate');
 delete state.unlocked[VB];
 /* v2.12 : le meilleur affiche sort des series du dernier passage, et le
    barreau affiche sort de celui qui a ete ecrit avec elles. */
 const pb=perfOf(SB); pb.sets=[8,7]; pb.band='noir'; pb.setsBand='noir';
 const b11=verrouHtml(VB);
 const fin=bandOrder(DB[SB])[bandOrder(DB[SB]).length-1];
 if(b11.indexOf(esc(bandLabel(fin)))<0) err('le verrou a bandGate doit nommer le barreau exige : '+esc(bandLabel(fin)));
 if(b11.indexOf('meilleure série')<0) err('le verrou a bandGate doit afficher la meilleure serie du passage');
 if(b11.indexOf('>8<')<0) err('la meilleure serie affichee doit sortir du dernier passage');
 if(b11.indexOf('>'+DB[VB].lock.need+'<')<0) err('le verrou a bandGate doit afficher le compte exige');
 console.log('verrou OK : les deux sens, mention de remplacement dans les deux temps, variante bandGate couverte');

 /* ---------- 12. provenance ---------- */
 await neuf();
 delete state.unlocked[V];
 const p12=perfOf(SRC); p12.sets=[45,45]; p12.lightSets=true;
 if(verrouHtml(V).indexOf('ne compte pas pour le verrou')<0) err('une lecture allegee doit etre annoncee comme ne comptant pas');
 p12.lightSets=false; p12.unqualSets=true;
 if(verrouHtml(V).indexOf('ne compte pas pour le verrou')<0) err('une lecture non qualifiee doit etre annoncee comme ne comptant pas');
 p12.unqualSets=false;
 if(verrouHtml(V).indexOf('ne compte pas pour le verrou')>=0) err('une lecture exploitable ne porte pas cette mention');
 if(verrouHtml(V).indexOf('À la dernière séance')<0) err('une lecture exploitable affiche l etat');
 console.log('provenance OK : lightSets et unqualSets annonces, lecture exploitable non marquee');

 /* ---------- 13. robustesse ---------- */
 await neuf();
 const IDS=Object.keys(DB);
 IDS.forEach(id=>{ try{ showFiche(id); }catch(e){ err('showFiche leve sur '+id+' a historique vide : '+e.message); } });
 state.hist=IDS.filter(id=>DB[id].reps&&DB[id].mode!=='circuit'&&DB[id].mode!=='stretch')
   .map((id,i)=>seance(i+1,[{id:id,sets:[8,8,8],load:2,band:'noir',rng:[8,12]}]));
 IDS.forEach(id=>{ try{ showFiche(id); }catch(e){ err('showFiche leve sur '+id+' avec historique : '+e.message); } });
 console.log('robustesse OK : showFiche passe sur les '+IDS.length+' fiches, historique vide comme fourni');

 /* ---------- 14. la garde effective, sur une seance reellement jouee ---------- */
 /* endSession lit pre[k].range, construit depuis state.perf et non depuis
    perfOf : la garde ecrite ne suffit pas, il faut que la fourchette existe au
    moment ou l item se compose. Une seance jouee depuis un etat neuf tranche. */
 await neuf();
 let vus=0; const vusIds={}; let prem=null;
 /* plusieurs seances : un tirage isole ne contient qu un ou deux exercices de
    la garde, ce qui ferait un temoin trop etroit */
 for(let n=0;n<8;n++){
   await jouer(9);
   const hn=state.hist[state.hist.length-1];
   if(n===0){
     /* le depart du chemin des paliers se verifie ici et non apres huit
        seances, ou d autres entrees se seraient ajoutees */
     prem=hn.items.filter(it=>{const e=DB[it.id];return !e.bnd&&(e.mode==='bw'||e.mode==='time');})[0];
     if(!prem) err('la premiere seance ne contient aucun exercice de la garde');
     const PP=paliersOf(prem.id);
     if(PP.length!==1||!PP[0].first) err('le chemin des paliers doit porter son depart des la premiere seance sur '+prem.id);
   }
   hn.items.forEach(it=>{
     const e=DB[it.id], dansGarde=!e.bnd&&(e.mode==='bw'||e.mode==='time');
     if(dansGarde){
       if(!it.rng) err(it.id+' est dans la garde mais son item ne porte pas de fourchette');
       const r=rangeOf(state.undo.perf[it.id],e);
       if(it.rng[0]!==r[0]||it.rng[1]!==r[1]) err(it.id+' porte une fourchette qui n est pas celle d avant seance');
       if(palierVal(it.id,it)===null) err(it.id+' doit produire une valeur de palier');
       vus++; vusIds[it.id]=1;
     } else if(it.rng) err(it.id+' est hors garde et ne doit pas porter de fourchette');
   });
 }
 if(Object.keys(vusIds).length<2) err('temoin trop etroit : '+Object.keys(vusIds).length+' exercice de la garde vu');
 console.log('garde effective OK : '+vus+' items de la garde sur '+Object.keys(vusIds).length+' exercices portent leur fourchette, depart pose des la premiere seance');

 /* ---------- 15. les blocs restent muets ---------- */
 await neuf();
 const MUETS=IDS.filter(id=>DB[id].mode==='stretch'||DB[id].mode==='circuit');
 if(MUETS.length<3) err('temoin trop court : '+MUETS.length+' exercices sans echelle');
 MUETS.forEach(id=>{
   if(echelleOf(id)!==null) err(id+' ne doit pas porter d echelle');
   if(echelleHtml(id)!=='') err(id+' ne doit pas rendre le bloc d echelle');
   if(passagesHtml(id)!=='') err(id+' ne doit rien rendre sans passage');
   if(verrouHtml(id)!=='') err(id+' n a ni verrou ni ouverture, il ne rend rien');
 });
 /* un exercice sans verrou et qui n en ouvre aucun reste muet lui aussi */
 const LIBRE=IDS.filter(id=>!DB[id].lock&&!IDS.some(x=>DB[x].lock&&DB[x].lock.after===id));
 if(!LIBRE.length) err('temoin absent : aucun exercice sans verrou ni ouverture');
 if(verrouHtml(LIBRE[0])!=='') err(LIBRE[0]+' ne doit pas rendre de bloc verrou');
 /* et un exercice a echelle sans aucun passage ne rend pas le bloc Progression */
 if(passagesHtml(ID)!=='') err('sans passage, le bloc Progression reste vide');
 if(echelleHtml(ID)==='') err('le bloc d echelle, lui, existe des l etat neuf');
 console.log('silence OK : '+MUETS.length+' fiches sans echelle, blocs vides sur passages et verrou');

 console.log('TESTS PROGRESSION PAR EXERCICE V2.4 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
