// Nouveautes v1.17 : plafond des tenues au sol ramene a 45 s avec migration,
// planche sur ballon et gainage lateral jambe levee derriere un verrou, retrait
// du predecesseur du tirage et promotion en repli douleur.
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
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3;state.sound=false; };

 /* ---------- 1. plafonds : les quatre tenues de gainage s arretent a 45 s ---------- */
 /* v2.19 : la jambe levee sort de la liste, elle passe en repetitions
    cadencees, 8-15, dont les 15 font 45 s de planche */
 await neuf();
 const attendu={'planche':[20,45],'planche-genoux':[20,45],'gainage-lateral':[15,45],
   'planche-ballon':[15,45]};
 Object.keys(attendu).forEach(id=>{
   const e=DB[id];
   if(!e) throw new Error('exercice absent du catalogue : '+id);
   if(e.mode!=='time') throw new Error(id+' devrait etre une tenue chronometree');
   if(e.reps[0]!==attendu[id][0]||e.reps[1]!==attendu[id][1]) throw new Error(id+' : fourchette '+e.reps.join('-')+' au lieu de '+attendu[id].join('-'));
   if('cap' in e) throw new Error(id+' : le champ cap n existe plus, le plafond est le haut de fourchette (v2.16)');
 });
 { const j=DB['gainage-lateral-jambe-levee'];
   if(j.mode!=='bw'||!j.cadence||j.reps.join('-')!=='8-15') throw new Error('la jambe levee est en repetitions cadencees, 8-15');
   if(15*(j.cadence.monte+j.cadence.descente)!==45) throw new Error('15 repetitions cadencees font 45 s de planche'); }
 console.log('plafonds OK : quatre tenues a 45 s, plafond egal au haut de fourchette, abductions a 15 x 3 s');

 /* ---------- 2. migration : une fourchette 20-60 stockee redescend a 20-45 ---------- */
 await neuf();
 const vieux={v:2,rounds:3,perf:{
   'planche':{load:0,range:[20,60],target:60,best:60,sets:[60,60],date:'2026-08-01T10:00:00.000Z'},
   'planche-genoux':{load:0,range:[20,60],target:55,best:55,sets:[],date:null},
   'gainage-lateral':{load:0,range:[15,45],target:30,best:30,sets:[],date:null}}};
 const m=migrateState(JSON.parse(JSON.stringify(vieux)));
 if(m.perf['planche'].range[1]!==45) throw new Error('planche : fourchette non ecretee, '+m.perf['planche'].range.join('-'));
 if(m.perf['planche'].target!==45) throw new Error('planche : cible non ecretee, '+m.perf['planche'].target);
 if(m.perf['planche'].range[0]!==20) throw new Error('le bas de fourchette ne doit pas bouger');
 if(m.perf['planche-genoux'].range[1]!==45) throw new Error('planche-genoux : fourchette non ecretee');
 if(m.perf['planche-genoux'].target!==45) throw new Error('planche-genoux : cible non ecretee');
 if(m.perf['gainage-lateral'].range[1]!==45||m.perf['gainage-lateral'].target!==30) throw new Error('une fourchette deja conforme ne doit pas etre touchee');
 if(m.perf['planche'].best!==60) throw new Error('le maximum historique n est pas reecrit');
 // idempotence : rejouer la migration ne bouge plus rien
 const deux=migrateState(JSON.parse(JSON.stringify(m)));
 if(JSON.stringify(deux.perf)!==JSON.stringify(m.perf)) throw new Error('migration non idempotente');
 console.log('migration OK : 20-60 devient 20-45 sur les deux planches, idempotente, cible ecretee');

 /* ---------- 3. verrous : deux series de 45 s, cote faible compris ---------- */
 await neuf();
 if(!isLocked('planche-ballon')) throw new Error('la planche sur ballon doit demarrer verrouillee');
 if(!isLocked('gainage-lateral-jambe-levee')) throw new Error('le gainage jambe levee doit demarrer verrouille');
 const cond=lockCond(DB['planche-ballon']);
 if(/\\{n\\}/.test(cond)) throw new Error('le jeton {n} n a pas ete resolu : '+cond);
 if(cond.indexOf('2 séries')<0) throw new Error('a 3 series de volume, le verrou doit annoncer 2 series : '+cond);
 if(cond.indexOf('45 s')<0) throw new Error('le verrou doit annoncer 45 s : '+cond);
 // une seule serie a 45 ne suffit pas
 applyProgress('planche',[45,30],true,false);
 checkUnlocks(3,false,null);
 if(state.unlocked['planche-ballon']) throw new Error('une seule serie a 45 s ne doit pas ouvrir le verrou');
 // deux series a 45 ouvrent
 applyProgress('planche',[45,45],true,false);
 let ms=checkUnlocks(3,false,null);
 if(!state.unlocked['planche-ballon']) throw new Error('deux series a 45 s doivent ouvrir le verrou');
 if(!ms.join(' ').match(/Débloqué/)) throw new Error('message de deblocage attendu');
 console.log('verrou OK : enonce resolu a 2 series de 45 s, une seule ne suffit pas');

 /* ---------- 4. le cote faible commande sur le gainage lateral ---------- */
 await neuf();
 // la serie enregistree pour un tenu unilateral est deja le minimum des deux cotes
 const st={id:'gainage-lateral'}; holdInit(st,DB['gainage-lateral']);
 if(st.sides.length!==2) throw new Error('un tenu unilateral prevoit deux mesures');
 applyProgress('gainage-lateral',[45,45],true,false);
 checkUnlocks(3,false,null);
 if(!state.unlocked['gainage-lateral-jambe-levee']) throw new Error('deux passages a 45 s doivent ouvrir la jambe levee');
 await neuf();
 applyProgress('gainage-lateral',[45,20],true,false);   // 20 s = cote faible d un passage
 checkUnlocks(3,false,null);
 if(state.unlocked['gainage-lateral-jambe-levee']) throw new Error('un cote faible a 20 s ne doit pas ouvrir le verrou');
 console.log('cote faible OK : le minimum des deux cotes commande le verrou');

 /* ---------- 5. une seance allegee n ouvre aucun de ces verrous ---------- */
 await neuf();
 applyProgress('planche',[45,45],true,true);            // series issues d une allegee
 checkUnlocks(3,false,null);
 if(state.unlocked['planche-ballon']) throw new Error('des series d une seance allegee ne doivent rien ouvrir');
 console.log('allegee OK : la provenance des series bloque le deblocage');

 /* ---------- 6. retrait : le vivier gainage vaut cinq entrees dans les quatre etats ---------- */
 const vivier=()=>SLOTS.core.pool.filter(id=>!isLocked(id)&&!estRetire(id));
 await neuf();
 const s0=vivier();
 if(s0.join(',')!=='planche,bird-dog,gainage-lateral,dead-bug,pallof-press') throw new Error('etat neuf : '+s0.join(','));
 state.unlocked['planche-ballon']=true;
 const s1=vivier();
 if(s1.join(',')!=='planche-ballon,bird-dog,gainage-lateral,dead-bug,pallof-press') throw new Error('ballon debloque : '+s1.join(','));
 state.unlocked['gainage-lateral-jambe-levee']=true;
 const s2=vivier();
 if(s2.join(',')!=='planche-ballon,bird-dog,gainage-lateral-jambe-levee,dead-bug,pallof-press') throw new Error('les deux debloques : '+s2.join(','));
 state.unlocked['planche-ballon']=false;
 const s3=vivier();
 if(s3.join(',')!=='planche,bird-dog,gainage-lateral-jambe-levee,dead-bug,pallof-press') throw new Error('jambe levee seule : '+s3.join(','));
 [s0,s1,s2,s3].forEach((v,i)=>{ if(v.length!==5) throw new Error('etat '+i+' : '+v.length+' entrees au lieu de 5'); });
 console.log('vivier OK : cinq entrees et meme ordre dans les quatre etats de verrous');

 /* ---------- 7. le predecesseur devient le repli douleur du successeur ---------- */
 await neuf();
 if(DB['planche-ballon'].fb!=='planche') throw new Error('la planche au sol doit etre le repli du ballon');
 if(DB['gainage-lateral-jambe-levee'].fb!=='gainage-lateral') throw new Error('le gainage au sol doit etre le repli de la jambe levee');
 if(DB['planche'].fb!=='planche-genoux') throw new Error('le repli de la planche au sol ne doit pas bouger');
 // en seance allegee, la substitution joue
 state.unlocked['planche-ballon']=true;
 state.slotIdx={push:0,pull:0,legs:0,core:0};
 lightMode=true;
 const plan=buildSession();
 lightMode=false;
 const iBall=plan.orig.indexOf('planche-ballon');
 if(iBall<0) throw new Error('le ballon devait sortir a l emplacement gainage');
 if(plan.exos[iBall]!=='planche') throw new Error('en allegee, le ballon doit ceder la place a la planche au sol');
 console.log('repli OK : chaine planche sur ballon > planche > planche sur genoux');

 /* ---------- 8. textes de plafond : plus de long lever, la marche suivante est nommee ---------- */
 await neuf();
 if(/coude/i.test(DB['planche'].next||'')) throw new Error('le texte du long lever plank doit avoir disparu');
 if(DB['planche'].next.indexOf('ballon')<0) throw new Error('le plafond de la planche doit nommer le ballon');
 if(DB['gainage-lateral'].next.indexOf('abductions')<0) throw new Error('le plafond du gainage doit nommer les abductions');
 /* v2.19 : plus de lest promis sur la jambe levee, la suite reste a decider */
 if(/leste/i.test(DB['gainage-lateral-jambe-levee'].next)||!/pas de marche outillée/.test(DB['gainage-lateral-jambe-levee'].next)) throw new Error('jambe levee : impasse dite, sans lest promis');
 [['planche-ballon','ballon']].forEach(([id,mot])=>{
   const n=DB[id].next||'';
   if(!n) throw new Error(id+' : marche suivante non documentee');
   if(n.toLowerCase().indexOf(mot)<0) throw new Error(id+' : marche suivante attendue autour de « '+mot+' », lu : '+n);
   if(n.indexOf('pas encore')<0) throw new Error(id+' : la marche suivante n est pas outillee, le texte doit le dire');
 });
 const msg=applyProgress('planche',[45,45],true,false);
 if(!msg.join(' ').match(/Plafond atteint sur Planche : la planche sur ballon prend le relais/)) throw new Error('message de plafond : '+msg.join(' '));
 console.log('plafonds OK : long lever retire, marche suivante nommee, dette annoncee');

 /* ---------- 9. materiel : le ballon est annonce quand il sert ---------- */
 await neuf();
 if((DB['planche-ballon'].mat||[]).indexOf('Swiss ball')<0) throw new Error('le ballon doit figurer au materiel');
 const g=sessionGear({exos:['planche-ballon'],orig:['planche-ballon'],cardio:false});
 if(g.indexOf('Swiss ball')<0) throw new Error('le detail de seance doit sortir le ballon : '+g.join(', '));
 const g2=sessionGear({exos:['gainage-lateral-jambe-levee'],orig:['gainage-lateral-jambe-levee'],cardio:false});
 if(g2.indexOf('Swiss ball')>=0) throw new Error('le gainage lateral ne demande pas de ballon');
 console.log('materiel OK : ballon annonce sur la planche ballon seulement');

 /* ---------- 10. illustrations embarquees ---------- */
 if(typeof IMG!=='undefined'){
   if(!IMG['planche-ballon']) throw new Error('illustration planche-ballon absente de la banque');
   if(!IMG['gainage-lateral-jambe-levee']) throw new Error('illustration gainage-lateral-jambe-levee absente');
   if(Object.keys(IMG).length!==58) throw new Error('banque attendue a 58 images, '+Object.keys(IMG).length+' trouvees');   /* v2.18 : +2, escalier du squat */
   /* Aucune image morte : toute entree de la banque sert soit une fiche, soit
      une etape d echauffement. Le controle par les seules cles de DB etait
      trompeur, deux images d echauffement passaient pour orphelines. */
   const warmImgs=WARMUP.map(x=>x.img).filter(Boolean);
   const mortes=Object.keys(IMG).filter(k=>!DB[k]&&warmImgs.indexOf(k)<0);
   if(mortes.length) throw new Error('images mortes dans la banque : '+mortes.join(', '));
   console.log('images OK : banque a 58, aucune image morte, les sept nouvelles sont branchees');
 }

 /* ---------- 11. la couverture musculaire ne change pas de forme ---------- */
 await neuf();
 state.unlocked['planche-ballon']=true; state.unlocked['gainage-lateral-jambe-levee']=true;
 const pools=poolsFor();
 if(pools.length!==4) throw new Error('quatre emplacements attendus');
 if(pools[3].length!==5) throw new Error('le vivier gainage doit rester a cinq apres les deux deblocages');
 console.log('couverture OK : quatre emplacements, gainage a cinq apres deblocage complet');

 /* ---------- 12. rendu : les deux fiches s affichent, verrou compris ---------- */
 await neuf();
 ['planche-ballon','gainage-lateral-jambe-levee'].forEach(id=>{
   showFiche(id);
   if(html.indexOf(DB[id].nom)<0) throw new Error('fiche muette : '+id);
   if(html.indexOf(lockCond(DB[id]))<0) throw new Error('la condition de verrou doit apparaitre sur '+id);
   if(html.indexOf('45 s')<0) throw new Error('la fiche doit annoncer les 45 s exiges : '+id);
 });
 view='lib'; render();
 if(html.indexOf('Planche sur ballon')<0) throw new Error('la bibliotheque doit lister la planche sur ballon');
 if(html.indexOf('Gainage latéral, abductions')<0) throw new Error('la bibliotheque doit lister les abductions');
 console.log('rendu OK : deux fiches et deux lignes de bibliotheque');

 /* ---------- 13. enveloppe en tete du fichier exporte ---------- */
 await neuf();
 const cles=Object.keys(JSON.parse(payload()));
 if(cles[0]!=='app'||cles[1]!=='version') throw new Error('app et version doivent ouvrir le fichier, lu : '+cles.slice(0,3).join(', '));
 const brut=payload();
 if(brut.indexOf('{"app":"palier","version":"'+VERSION+'"')!==0) throw new Error('le fichier doit commencer par son enveloppe : '+brut.slice(0,60));
 // la valeur reste celle du programme, pas celle d un etat qui en rapporterait une
 state.version='1.0'; state.app='autre';
 const env=JSON.parse(payload());
 if(env.version!==VERSION||env.app!=='palier') throw new Error('l enveloppe doit gagner sur l etat, lu : '+env.app+' '+env.version);
 const cles2=Object.keys(env);
 if(cles2[0]!=='app'||cles2[1]!=='version') throw new Error('l ordre doit tenir meme si l etat porte les memes cles');
 delete state.version; delete state.app;
 console.log('enveloppe OK : app et version en tete, valeurs du programme, ordre stable');

 console.log('TESTS V1.17 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
