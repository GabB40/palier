/* test41 : lot v2.14. Fenetre de deux passages sur la cible : la cible
   suivante vaut la plus haute des deux dernieres lectures plus une, une
   mauvaise seance est absorbee, deux consecutives font redescendre. Memoire
   p.prevMin ecrite sur les seules lectures exploitables et completes, remise
   a zero a tout changement de palier (montee, descente, relevement de
   fourchette, ajustement manuel), lecture partielle et allegee sans effet,
   palier tenu qui ecrit sans lire, holdClimb et correction, message de recul
   au recapitulatif, arrondi des tenues, sauvegarde anterieure sans memoire,
   texte « Comment ca marche » en quatre blocs. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' != '+JSON.stringify(b)); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 /* un etat pose n a ni grace, ni memoire de fenetre, ni palier tenu */
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   p.range=(o&&o.range)?o.range.slice():e.reps.slice();
   p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.load!=null) p.load=o.load;
   if(o&&o.band) p.band=o.band;
   delete p.hold; delete p.grace; delete p.setsBand; delete p.prevMin; p.best=0; p.sets=[];
   return p; };
 const dit=(m,re)=>m.some(x=>re.test(x));
 const RECUL=/cible recalée/;
 /* mollets debout : 12-25 au poids du corps, plafond au haut de fourchette,
    donc ni montee ni descente de palier possible depuis la base, ce qui isole
    la cible de tout autre mecanisme */
 const M='mollets-debout';
 if(DB[M].reps[0]!==12||DB[M].reps[1]!==25||'cap' in DB[M]) err('prealable : mollets debout attendus en 12-25, plafond au haut, sans champ cap (v2.16)');

 /* ---------- 1. le tableau de Gabriel ---------- */
 await neuf();
 let p=pose(M);
 const suite=[12,13,14,15].map(v=>{ applyProgress(M,[v,v,v],true,false); return p.target; });
 eq(suite,[13,14,15,16],'cas nominal : quatre passages a la cible donnent 13, 14, 15, 16');
 if(p.prevMin!==15) err('la memoire porte la plus petite serie du dernier passage, '+p.prevMin);
 /* 5e passage, mauvaise seance a 12 pour une cible a 16 : absorbee, muette */
 let m=applyProgress(M,[12,12,12],true,false);
 if(p.target!==16) err('une mauvaise seance isolee ne fait pas reculer la cible, '+p.target);
 if(m.length) err('un passage absorbe ne produit aucun message : '+m.join(' | '));
 if(p.prevMin!==12) err('la memoire est ecrite meme quand elle n a pas joue, '+p.prevMin);
 /* 6e passage en forme : 16 donne 17, rien n a ete perdu */
 applyProgress(M,[16,16,16],true,false);
 if(p.target!==17) err('rien n est perdu quand le passage suivant tient : '+p.target);
 /* et le tableau ligne a ligne, memoire posee a la main */
 const tab=[[12,13,14],[12,15,16],[15,12,16],[14,13,15]];
 tab.forEach(([a,b,c])=>{ pose(M,{target:18}); perfOf(M).prevMin=a; applyProgress(M,[b,b,b],true,false);
   if(perfOf(M).target!==c) err('tableau : '+a+' puis '+b+' devait donner '+c+', obtenu '+perfOf(M).target); });
 /* la plus petite serie du passage commande, pas la derniere */
 pose(M,{target:16}); perfOf(M).prevMin=13; applyProgress(M,[18,14,13],true,false);
 if(perfOf(M).target!==14) err('la plus petite serie commande : 18/14/13 sur memoire 13 devait donner 14');
 console.log('tableau OK : 12,13,14,15 puis 12 absorbe, 16 donne 17 ; les quatre lignes du tableau tiennent');

 /* ---------- 2. deux passages sous la cible : recul dit au recap ---------- */
 /* cible 18 issue d un passage a 17 : la memoire porte 17 */
 pose(M,{target:18}); perfOf(M).prevMin=17;
 m=applyProgress(M,[14,14,14],true,false);
 if(perfOf(M).target!==18) err('premier passage sous la cible : absorbe, '+perfOf(M).target);
 if(m.length) err('premier passage sous la cible : muet, '+m.join(' | '));
 m=applyProgress(M,[13,13,13],true,false);
 if(perfOf(M).target!==15) err('second passage sous la cible : recul au meilleur des deux plus un, '+perfOf(M).target);
 if(!dit(m,/^Mollets debout : cible recalée de 18 à 15, deux passages en dessous \\(14 puis 13\\)$/)) err('message de recul attendu, nomme et motive : '+m.join(' | '));
 if(m.length!==1) err('un seul message par evenement : '+m.join(' | '));
 /* v2.23 : le cas constate le 25 septembre 2026. Pompes a cible 9 issue d un
    8/8/8, puis 9/9/6 absorbe, puis 9/9/7 : la cible recule a 8 alors que la
    seconde lecture est meilleure que la premiere. Le message porte les deux
    lectures, dans l ordre ou elles ont ete faites, pour que la direction se
    lise. Ni le recul ni la regle ne changent. */
 const PO='pompes-poignees';
 pose(PO,{target:9,band:'aucune'}); perfOf(PO).prevMin=8;
 m=applyProgress(PO,[9,9,6],true,false);
 if(perfOf(PO).target!==9) err('pompes : 9/9/6 absorbe par la memoire, '+perfOf(PO).target);
 if(m.length) err('pompes : premier passage sous la cible muet, '+m.join(' | '));
 m=applyProgress(PO,[9,9,7],true,false);
 if(perfOf(PO).target!==8) err('pompes : max(6,7)+1 donne 8, '+perfOf(PO).target);
 if(!dit(m,/^Pompes : cible recalée de 9 à 8, deux passages en dessous \\(6 puis 7\\)$/)) err('pompes : les deux lectures dans l ordre, '+m.join(' | '));
 if(m.length!==1) err('pompes : un seul message, '+m.join(' | '));
 if(perfOf(PO).prevMin!==7) err('pompes : la memoire porte la lecture du jour apres le message, '+perfOf(PO).prevMin);
 console.log('recul OK : deux lectures dites dans l ordre (v2.23), 6 puis 7 sur le cas reel des pompes');
 /* sans memoire, un recul reste muet : la v1.15 tient pour le premier passage */
 pose(M,{target:16});
 m=applyProgress(M,[12,12,12],true,false);
 if(perfOf(M).target!==13) err('sans memoire, la cible suit le passage, '+perfOf(M).target);
 if(dit(m,RECUL)) err('un recul sans memoire derriere lui reste muet : '+m.join(' | '));
 /* la lecture partielle garde son message, avec la clause quand elle a lieu */
 pose(M,{target:16}); perfOf(M).prevMin=15;
 m=applyProgress(M,[15,11,11],true,false);
 if(perfOf(M).target!==16) err('partiel absorbe par la memoire : cible inchangee, '+perfOf(M).target);
 if(!dit(m,/des séries sous le plancher/)||dit(m,RECUL)) err('partiel sans recul : signal seul, '+m.join(' | '));
 m=applyProgress(M,[15,11,11],true,false);
 if(perfOf(M).target!==12) err('partiel deux fois : les deux lectures valent 11, cible 12, '+perfOf(M).target);
 if(!dit(m,/des séries sous le plancher.*cible recalée de 16 à 12/)) err('partiel avec recul : un seul message portant la clause, '+m.join(' | '));
 if(m.length!==1) err('partiel avec recul : un seul message, '+m.join(' | '));
 /* l echec sans descente possible porte lui aussi la clause, une seule fois */
 pose(M,{target:20}); perfOf(M).prevMin=9;
 m=applyProgress(M,[9,9,9],true,false);
 if(!dit(m,/aucune série au plancher \\(9 pour un bas à 12\\), cible recalée de 20 à 12/)) err('echec sans descente : signal avec clause, '+m.join(' | '));
 if(m.length!==1) err('echec sans descente : un seul message, '+m.join(' | '));
 console.log('message OK : recul dit apres deux passages, muet apres un seul, clause portee par partiel et echec, jamais deux messages');

 /* ---------- 3. remises a zero : la memoire ne survit pas a un changement de palier ---------- */
 const L=Object.keys(DB).filter(id=>DB[id].mode==='load'&&DB[id].reps&&!DB[id].bnd)[0];
 const eL=DB[L], lo=eL.reps[0], hi=eL.reps[1];
 /* montee */
 pose(L,{target:hi}); perfOf(L).prevMin=hi-1;
 const l0=perfOf(L).load;
 m=applyProgress(L,[hi,hi,hi],true,false);
 if(perfOf(L).load<=l0) err('prealable : montee attendue sur '+L);
 if(perfOf(L).prevMin!=null) err('la montee remet la memoire a zero');
 if(perfOf(L).target!==lo) err('retour au bas de fourchette apres montee');
 delete perfOf(L).grace;
 /* premier passage au nouveau palier : sans memoire, la cible suit ce passage seul */
 applyProgress(L,[lo+2,lo+2,lo+2],true,false);
 if(perfOf(L).target!==lo+3) err('premier passage au nouveau palier : cible = lecture + 1, '+perfOf(L).target);
 if(perfOf(L).prevMin!==lo+2) err('memoire ecrite au nouveau palier');
 /* descente du filet */
 pose(L,{target:lo+3,load:perfOf(L).load}); perfOf(L).prevMin=lo+2;
 const l1=perfOf(L).load;
 m=applyProgress(L,[1,1,1],true,false);
 if(perfOf(L).load>=l1) err('prealable : descente attendue');
 if(perfOf(L).prevMin!=null) err('la descente remet la memoire a zero');
 if(perfOf(L).target!==lo) err('cible au bas de fourchette apres descente, '+perfOf(L).target);
 if(dit(m,RECUL)) err('apres une descente, le message de descente suffit : '+m.join(' | '));
 if(m.length!==1) err('descente : un seul message, '+m.join(' | '));
 /* v2.16 : le relevement de fourchette n existe plus, il n y a plus de
    remise a zero a tester de ce cote ; test43 verifie qu aucune donnee ne
    peut le declencher. Plafond atteint : rien ne change de palier, la
    memoire s ecrit */
 pose(M,{target:25}); perfOf(M).prevMin=24;
 m=applyProgress(M,[25,25,25],true,false);
 if(!dit(m,/Plafond atteint/)) err('prealable : plafond attendu');
 if(perfOf(M).prevMin!==25) err('au plafond le palier ne change pas, la memoire s ecrit, '+perfOf(M).prevMin);
 /* ajustement manuel de charge, dans les deux sens */
 pose(L); perfOf(L).prevMin=lo+1;
 cur={steps:[{k:'set',id:L,key:L,set:1,of:1}],i:0,log:{},xp:0,type:'alterne',exos:[L]};
 view='session';
 adjLoad(1);
 if(perfOf(L).prevMin!=null) err('monter la charge a la main remet la memoire a zero');
 perfOf(L).prevMin=lo+1;
 adjLoad(-1);
 if(perfOf(L).prevMin!=null) err('baisser la charge a la main remet la memoire a zero');
 /* charge inchangee (butee) : la memoire reste */
 pose(L,{load:loadLadder(state.gear)[0]}); perfOf(L).prevMin=lo+1;
 adjLoad(-1);
 if(perfOf(L).prevMin!==lo+1) err('un ajustement sans effet ne touche pas la memoire');
 /* ajustement manuel de bande */
 const F='face-pulls';
 pose(F,{band:'rouge'}); perfOf(F).prevMin=12;
 cur={steps:[{k:'set',id:F,key:F,set:1,of:1}],i:0,log:{},xp:0,type:'alterne',exos:[F]};
 adjBand(1);
 if(perfOf(F).band==='rouge') err('prealable : la bande devait monter');
 if(perfOf(F).prevMin!=null) err('changer de bande a la main remet la memoire a zero');
 cur=null; view='home';
 console.log('remises a zero OK : montee, descente, ajustement manuel de charge et de bande ; plafond et butee conservent la memoire');

 /* ---------- 4. provenance : partielle, allegee, non qualifiee ---------- */
 pose(M,{target:16}); perfOf(M).prevMin=15;
 applyProgress(M,[9],false,false);
 if(perfOf(M).target!==16) err('lecture partielle : cible inchangee');
 if(perfOf(M).prevMin!==15) err('lecture partielle : memoire inchangee, le minimum d un passage ampute est biaise');
 applyProgress(M,[9,9,9],true,true);
 if(perfOf(M).prevMin!==15||perfOf(M).target!==16) err('seance allegee : ni cible ni memoire');
 applyProgress(M,[9,9,9],true,false,true);
 if(perfOf(M).prevMin!==15||perfOf(M).target!==16) err('lecture non qualifiee : ni cible ni memoire');
 console.log('provenance OK : partielle, allegee et non qualifiee n ecrivent pas la memoire');

 /* ---------- 5. palier tenu : ecrit sans lire ---------- */
 pose(M,{target:16}); perfOf(M).prevMin=15; setHold(M,true);
 m=applyProgress(M,[20,20,20],true,false);
 if(perfOf(M).target!==16) err('palier tenu : la cible ne bouge pas');
 if(perfOf(M).prevMin!==20) err('palier tenu : la memoire s ecrit quand meme, '+perfOf(M).prevMin);
 if(dit(m,RECUL)) err('palier tenu : aucun recul a dire');
 setHold(M,false);
 applyProgress(M,[15,15,15],true,false);
 if(perfOf(M).target!==21) err('a la liberation, la memoire ecrite sous le palier tenu sert : max(20,15)+1, obtenu '+perfOf(M).target);
 console.log('palier tenu OK : memoire ecrite, cible figee, memoire lue a la liberation');

 /* ---------- 6. tenues : arrondi au multiple de 5 apres la fenetre ---------- */
 const PL='planche';
 pose(PL,{target:30});
 applyProgress(PL,[34,34],true,false);
 if(perfOf(PL).target!==35) err('34 s donnent 35');
 applyProgress(PL,[20,20],true,false);
 if(perfOf(PL).target!==35) err('une tenue courte isolee est absorbee, '+perfOf(PL).target);
 m=applyProgress(PL,[21,21],true,false);
 if(perfOf(PL).target!==25) err('deux tenues courtes : max(20,21)+1 arrondi a 25, '+perfOf(PL).target);
 if(!dit(m,/^Planche : cible recalée de 35 à 25, deux passages en dessous \\(20 puis 21\\)$/)) err('message de recul sur une tenue : '+m.join(' | '));
 console.log('tenues OK : absorption puis arrondi au multiple de 5');

 /* ---------- 7. seance complete : holdClimb et correction ---------- */
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
 await neuf();
 /* toutes les series au haut de fourchette : chaque exercice a charge monte */
 let h=await joue((id,e)=>e.reps?e.reps[1]:1);
 const c=(cur.climbs||[]).filter(x=>DB[x.id].reps&&DB[x.id].mode!=='time')[0];
 if(!c) err('prealable : une montee attendue au recapitulatif');
 if(perfOf(c.id).prevMin!=null) err('apres montee, memoire a zero');
 holdClimb(cur.climbs.indexOf(c));
 if(!isHeld(c.id)) err('prealable : palier tenu apres holdClimb');
 if(perfOf(c.id).load!==c.prev.load||perfOf(c.id).target!==c.prev.target) err('holdClimb restaure le palier et la cible');
 if(perfOf(c.id).prevMin!==DB[c.id].reps[1]) err('holdClimb restaure la memoire depuis le passage joue au palier restaure, '+perfOf(c.id).prevMin);
 /* correction : la memoire suit les valeurs corrigees, depuis le meme point de depart */
 await neuf();
 h=await joue((id,e)=>e.reps?e.reps[0]+1:1);
 const k0=state.undo.keys.filter(k=>{ const e=DB[splitKey(k).id]; return e.reps&&e.mode!=='time'; })[0];
 const id0=splitKey(k0).id, e0=DB[id0], i0=state.undo.keys.indexOf(k0);
 if(perfOf(id0).prevMin!==e0.reps[0]+1) err('apres seance, memoire = plus petite serie jouee, '+perfOf(id0).prevMin);
 if(state.undo.perf[id0].prevMin!=null) err('l instantane porte l etat d avant seance, sans memoire');
 corrigerSeance({[k0]:h.items[i0].sets.map(()=>e0.reps[0]+3)});
 if(perfOf(id0).prevMin!==e0.reps[0]+3) err('la correction rejoue et la memoire suit, '+perfOf(id0).prevMin);
 if(perfOf(id0).target!==Math.min(e0.reps[1],e0.reps[0]+4)) err('cible recalculee depuis l instantane, '+perfOf(id0).target);
 corrigerSeance({[k0]:h.items[i0].sets.map(()=>e0.reps[0]+2)});
 if(perfOf(id0).prevMin!==e0.reps[0]+2) err('seconde correction depuis le meme instantane, '+perfOf(id0).prevMin);
 if(perfOf(id0).target!==e0.reps[0]+3) err('seconde correction : cible sans memoire parasite de la premiere, '+perfOf(id0).target);
 /* la fenetre joue d une seance a l autre, en flux reel */
 await neuf();
 await joue((id,e)=>e.reps?e.reps[0]+3:1);
 const rec=state.hist[state.hist.length-1].items.filter(it=>DB[it.id].reps&&DB[it.id].mode!=='time')[0];
 const idr=rec.id, er=DB[idr];
 /* on rejoue le meme exercice a la main, moins bien : absorbe */
 const t1=perfOf(idr).target;
 m=applyProgress(idr,rec.sets.map(()=>er.reps[0]),true,false);
 if(perfOf(idr).target!==t1) err('en flux : une seance plus faible est absorbee, '+perfOf(idr).target+' pour '+t1);
 console.log('seance OK : holdClimb rend la memoire du palier restaure, la correction la rejoue, la fenetre joue d une seance a l autre');

 /* ---------- 8. sauvegarde anterieure : la memoire se seme depuis la derniere lecture (v2.15) ---------- */
 /* La v2.14 ne migrait rien et test41 l interdisait ; l audit externe a montre
    que chaque exercice revivait alors une fois le recul silencieux. p.sets est
    une lecture, pas une valeur devinee : elle seme la memoire. Le detail des
    gardes est dans test42, ici seul le principe. */
 await neuf();
 const vieux={v:2,rounds:3,perf:{[M]:{load:0,range:[12,25],target:16,best:16,sets:[15,15,15],date:'2026-09-01T10:00:00.000Z'}}};
 const mig=migrateState(g(vieux));
 if(mig.perf[M].prevMin!==15) err('la migration seme la memoire depuis la derniere lecture, '+mig.perf[M].prevMin);
 state.perf[M]=g(mig.perf[M]);
 m=applyProgress(M,[12,12,12],true,false);
 if(perfOf(M).target!==16) err('des la premiere seance apres mise a jour, une mauvaise seance est absorbee, '+perfOf(M).target);
 if(m.length) err('absorbee, donc muette');
 console.log('sauvegarde OK : la memoire est semee a la migration, pas de recul de transition');

 /* ---------- 9. forme du code ---------- */
 const SRC=${JSON.stringify(src)};
 const ap=SRC.slice(SRC.indexOf('function applyProgress('),SRC.indexOf('function divergence('));
 if((ap.match(/p\\.prevMin=minSet/g)||[]).length!==1) err('une seule ecriture de la memoire dans applyProgress');
 if((SRC.match(/p\\.prevMin=/g)||[]).length!==2) err('deux ecritures de la memoire dans toute la source, applyProgress et holdClimb, '+(SRC.match(/p\\.prevMin=/g)||[]).length+' (la migration ecrit q.prevMin, sur l objet brut)');
 const al=SRC.slice(SRC.indexOf('function adjLoad('),SRC.indexOf('function releaseOnManualUp('));
 const ab=SRC.slice(SRC.indexOf('function adjBand('),SRC.indexOf('function swapPain('));
 if(!/delete p\\.prevMin/.test(al)||!/delete p\\.prevMin/.test(ab)) err('les deux ajustements manuels remettent la memoire a zero');
 console.log('forme OK : deux ecritures, deux remises a zero manuelles');

 /* ---------- 10. texte : quatre blocs, la cible en tete ---------- */
 if(!/^Cible/.test(COMMENT[0].t)) err('le bloc de tete porte la cible, '+COMMENT[0].t);
 const plat=COMMENT.map(b=>b.c+' '+b.l.join(' ')).join(' ');
 if(!/pas là où tu t'arrêtes/.test(plat)) err('le texte doit dire que la cible n est pas un ordre d arret');
 if(!/plus haute des deux derniers passages/.test(plat)) err('le texte doit dire la fenetre');
 if(!/deux de suite, si/.test(plat)) err('le texte doit dire la descente de cible');
 if(!/retombe au bas de la fourchette/.test(plat)) err('le texte doit dire le retour au bas a la montee de charge');
 if(!/séance allégée/.test(plat)) err('le texte doit nommer la seance allegee');
 if((plat.match(/affaissement du bassin/g)||[]).length!==1) err('l exemple du bassin est dit une fois');
 if(!/la limite n'est pas l'épuisement des pectoraux, c'est l'affaissement du bassin/.test(plat)) err('l exemple des pompes est conserve tel quel');
 if(/Sur les pompes, la planche, le gainage lat/.test(plat)) err('pas de liste nominative des fiches');
 if(plat.indexOf('Fin de série')<0) err('renvoi a la ligne de la fiche');
 if(/—/.test(plat)) err('pas de tiret cadratin');
 const mots=plat.split(/\\s+/).length;
 if(mots>650) err('le texte s est rallonge au-dela du mesure, '+mots+' mots');
 view='set'; render();
 if(html.indexOf('Cible, calibration, fin de série, fiches')<0) err('sous-titre de la card Reglages');
 COMMENT.forEach(b=>{ if(html.indexOf(b.t)<0) err('Reglages doit porter le bloc « '+b.t+' »'); });
 state.intro=true; view='home'; render();
 COMMENT.forEach(b=>{ if(html.indexOf(b.t)<0) err('l accueil porte les quatre accroches tant que le bloc n a pas ete lu'); });
 if(/data-k="cmt0"[^>]*open/.test(html)) err('sur l accueil les developpements sont replies');
 if(html.indexOf(COMMENT[0].l[0])<0) err('le developpement est present sur place, replie');
 console.log('texte OK : quatre blocs, cible en tete, fenetre et descente dites, exemple des pompes intact, '+mots+' mots');

 console.log('TESTS FENETRE DE CIBLE V2.14 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
