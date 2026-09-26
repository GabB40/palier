// Lot de cloture du chantier materiel (v2.0) : onboarding sur inventaire vide, sixieme niveau de bande,
// realisation par nuancier, lestes de 0,5 kg, marche basse declarable, compteur
// de progressions, verrou des strictes sur l echelle entiere, fin des dialogues
// systeme.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),
  body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};
/* Aucun stub de dialogue systeme ici, a dessein : si un chemin en appelait
   encore un, la suite planterait au lieu de repondre oui a sa place. */
const SRC=src;
const T=`
(async()=>{
 const err=m=>{throw new Error(m)};
 const key=k=>handlers.forEach(h=>h({key:k,code:k===' '?'Space':k,target:{tagName:'DIV'},preventDefault(){}}));
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ localStorage._m={}; state=null; cur=null; lightMode=false; view='home'; await loadState(); };

 // ================= 1. ONBOARDING =================
 await neuf();
 if(state.onboard!==true) err('l etat neuf ne porte pas le drapeau d onboarding');
 if(ownedBands(state.gear).length!==0) err('l inventaire neuf porte des bandes');
 if(RES_ORDER.some(k=>k!=='elast'&&aRes(k))) err('l inventaire neuf porte une ressource');
 if(loadLadderProg(state.gear).length!==1) err('l inventaire neuf porte des disques');
 if(state.profil!=='domicile'||!state.profils.domicile) err('le profil domicile n est pas pose des l etat neuf');
 if(state.profils.domicile.gear!==state.gear) err('l invariant du profil actif ne tient pas a l etat neuf');
 /* un inventaire vide sert quand meme les quatre groupes : c est ce qui rend
    legitime la validation d une card vide, et l onboarding l annonce */
 SLOT_ORDER.forEach(s=>{ if(!posTirables(s,state.gear).length) err('groupe vide a l inventaire nul : '+s); });
 const cVide=schemasServis(state.gear);
 /* onze et non douze depuis que la marche basse est declarable : le profil sans
    rien perd aussi la montee sur marche. Coherent avec les sept pertes de test25. */
 if(cVide.servis!==11||cVide.total!==18) err('inventaire vide : 11 schemas sur 18 attendus, '+cVide.servis+'/'+cVide.total);
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')<0) err('le bandeau d onboarding ne pointe pas vers la card Materiel');
 /* le drapeau survit aux enregistrements intermediaires : on peut regler un
    theme avant de valider son inventaire */
 setTheme('dark'); await save(); setTheme('auto');
 if(state.onboard!==true) err('le drapeau d onboarding n a pas survecu a un enregistrement');
 state=null; await loadState();
 if(state.onboard!==true) err('le drapeau d onboarding n a pas survecu au rechargement');
 validGear();
 if(state.onboard) err('la validation ne retire pas le drapeau');
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')>=0) err('le bandeau survit a la validation');
 /* et valider ne verrouille rien : la card reste editable a l identique */
 view='set'; render();
 if(html.indexOf('Valider mon matériel')>=0) err('le bouton de validation survit a la validation');
 if(html.indexOf('Ajouter un type de disque')<0) err('la card n est plus editable apres validation');
 /* v2.3, le trou de la suite d origine : elle verifiait le retrait en memoire et
    s arretait la. La validation ne vaut que si elle traverse le rechargement,
    seule chose que voit l utilisateur. */
 await save();
 state=null; await loadState();
 if(state.onboard) err('le drapeau revient au rechargement apres validation');
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')>=0) err('le bandeau revient au rechargement apres validation');
 /* jamais cree par une migration : une sauvegarde qui ne porte pas la cle
    n a pas d onboarding, quel que soit le chemin d entree. Le sujet n est plus
    fabrique a la main : c est loadState et applyImport qui sont mis a l epreuve,
    le defaut d origine vivant chez l appelant et non dans migrateState. */
 const vieille={app:'palier',v:2,xp:10,goal:4,hist:[],perf:{},unlocked:{},badges:[],
   gear:JSON.parse(JSON.stringify(DEFAULT_GEAR))};
 const s2=Object.assign(defaultState(),vieille);
 migrateState(s2,vieille);
 if(s2.onboard) err('migrateState a cree un onboarding');
 localStorage._m={'palier-state-v2':JSON.stringify(vieille)};
 state=null; await loadState();
 if(state.onboard) err('une sauvegarde anterieure a la v2.0 recoit un onboarding');
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')>=0) err('bandeau sur une sauvegarde anterieure a la v2.0');
 state=null; localStorage._m={}; await loadState(); domicile();
 applyImport(JSON.parse(payload()));
 if(state.onboard) err('un import de sauvegarde recoit un onboarding');
 /* la cle est desormais une valeur et non une absence : le fichier exporte la
    porte, et une sauvegarde ecrite pendant l onboarding la garde a true, son
    inventaire n ayant pas ete declare */
 if(!('onboard' in JSON.parse(payload()))) err('le fichier exporte ne porte pas le drapeau');
 await neuf();
 const enCours=JSON.parse(payload());
 if(enCours.onboard!==true) err('un export pendant l onboarding doit porter le drapeau');
 state=null; localStorage._m={}; await loadState();
 applyImport(enCours);
 if(state.onboard!==true) err('un import exporte pendant l onboarding perd son drapeau');
 console.log('onboarding OK : inventaire vide, quatre groupes servis, drapeau survivant, traversant la validation et jamais migre');

 // ================= 2. SIXIEME NIVEAU =================
 await neuf(); domicile();
 if(BANDS.length!==6) err('six niveaux attendus');
 const ordRes=bandOrder({bnd:'res'}), ordAss=bandOrder({bnd:'ass'});
 if(ordRes[ordRes.length-1]!=='n6') err('le sixieme niveau n est pas au sommet de la resistance');
 if(ordAss[0]!=='n6') err('le sixieme niveau n est pas l entree la plus facile en assistance');
 if(ordAss[ordAss.length-1]!=='jaune') err('le jaune n est plus le barreau le plus dur en assistance');
 /* les cinq cles existantes ne bougent pas : perf et hist les referencent */
 ['jaune','rouge','noir','violet','vert'].forEach((b,i)=>{ if(BANDS[i].id!==b) err('cle de niveau deplacee : '+b); });
 if(bandReal('n6')) err('le sixieme niveau est tenu par defaut a domicile');
 /* possede, il devient un barreau de plus au sommet des exercices en resistance */
 const fp=DB['face-pulls'];
 const avant=bandLadder(fp,state.gear).length;
 setBandReal('n6','bleu');
 if(bandLadder(fp,state.gear).length!==avant+1) err('le sixieme niveau n allonge pas l echelle de resistance');
 const p6=perfOf('face-pulls'); p6.band='vert';
 if(nextBandFor(fp,'vert',state.gear,1)!=='n6') err('le plafond de resistance ne devient pas une montee');
 setBandReal('n6','');
 console.log('slot 6 OK : sommet en resistance, entree facile en assistance, jaune intact, cles inchangees');

 // ================= 3. NUANCIER =================
 await neuf(); domicile();
 if(PAL.length!==12) err('nuancier de douze couleurs attendu');
 PAL.forEach(c=>{ if(!coulOK(c[0])||!coulLbl(c[0])||!coulHex(c[0])) err('couleur incomplete : '+c[0]); });
 /* la presence EST la realisation : une seule donnee */
 setBandReal('rouge','');
 if(ownedBands(state.gear).indexOf('rouge')>=0) err('un niveau sans realisation reste possede');
 setBandReal('rouge','bleu');
 if(ownedBands(state.gear).indexOf('rouge')<0) err('un niveau realise n est pas possede');
 if(bandNom('rouge')!=='bleue') err('libelle de realisation faux : '+bandNom('rouge'));
 /* doublon autorise, leve a l affichage et seulement quand il est effectif */
 setBandReal('violet','bleu');
 if(bandNom('rouge')!=='bleue, niveau 2'||bandNom('violet')!=='bleue, niveau 4') err('doublon non desambigue : '+bandNom('rouge'));
 setBandReal('violet','violet');
 if(bandNom('rouge')!=='bleue') err('desambiguisation maintenue hors doublon');
 if(bandLabel('rouge')!=='bande bleue') err('bandLabel ne suit pas la realisation');
 if(bandLabel('aucune')!=='sans bande') err('barreau zero mal nomme');
 /* accord en genre : la v2.0 disait « bande noir » */
 setBandReal('noir','noir');
 if(bandLabel('noir')!=='bande noire') err('accord en genre absent : '+bandLabel('noir'));
 /* migration d une realisation libre heritee du nommage de la v2.0 */
 const libre={app:'palier',v:2,xp:0,goal:4,hist:[],perf:{},unlocked:{},badges:[],
   gear:Object.assign(JSON.parse(JSON.stringify(DEFAULT_GEAR)),
     {bands:{jaune:'ma vieille jaune',rouge:'Bleue',noir:'noir',violet:'',vert:'vert'}})};
 const s3=Object.assign(defaultState(),JSON.parse(JSON.stringify(libre)));
 migrateState(s3,libre);
 if(s3.gear.bands.jaune!=='jaune') err('realisation libre non ramenee a une couleur : '+s3.gear.bands.jaune);
 if(s3.gear.bands.rouge!=='bleu') err('libelle de couleur non reconnu : '+s3.gear.bands.rouge);
 if(s3.gear.bands.violet!=='') err('un niveau absent est devenu present');
 if(s3.gear.bands.n6!=='') err('le sixieme niveau n est pas pose vide');
 const avantIdem=JSON.stringify(s3.gear.bands);
 migrateState(s3,libre);
 if(JSON.stringify(s3.gear.bands)!==avantIdem) err('la migration du nuancier n est pas idempotente');
 console.log('nuancier OK : douze couleurs, presence = realisation, doublon leve, accord, migration idempotente');

 // ================= 4. LESTES DE 0,5 KG =================
 await neuf(); domicile();
 state.gear.cuffs={'0.5':1,'1':1,'2':1};
 const par1=cuffSteps(state.gear,1), par2=cuffSteps(state.gear,2);
 if(JSON.stringify(par1)!==JSON.stringify([0,0.5,1,1.5,2,2.5,3,3.5])) err('sommes de sous-ensembles fausses : '+par1.join(','));
 if(JSON.stringify(par2)!==JSON.stringify([0,1,2,3,4,5,6,7])) err('echelle a deux membres fausse : '+par2.join(','));
 const gob=fixedLadder('goblet-squat',state.gear);
 if(gob.length!==8||gob[gob.length-1].v!==17) err('echelle du goblet : 8 barreaux jusqu a 17 kg attendus, '+gob.length+'/'+gob[gob.length-1].v);
 if(gob[3].lbl.indexOf('1,5')<0&&gob.some(x=>/\\d\\.\\d/.test(x.lbl))) err('un libelle porte un point decimal');
 /* une paire seule ne fabrique pas de barreau intermediaire */
 state.gear.cuffs={'2':1};
 if(JSON.stringify(cuffSteps(state.gear,2))!==JSON.stringify([0,4])) err('paire isolee mal echelonnee');
 state.gear.cuffs={};
 if(fixedLadder('goblet-squat',state.gear).length!==1) err('sans leste, l echelle fixe doit se reduire au kettlebell');
 console.log('lestes OK : sommes de sous-ensembles, goblet a 8 barreaux jusqu a 17 kg, libelles a la virgule');

 // ================= 5. MARCHE BASSE ET REPLIS =================
 await neuf(); domicile();
 if(RES_ORDER.length!==9||RES_ORDER.indexOf('stepbas')<0) err('neuf ressources declarables attendues');
 if(JSON.stringify(NEEDS['step-ups-bas'])!==JSON.stringify(['stepbas'])) err('le step-up bas ne declare pas son besoin');
 /* migration : presente par defaut, mais une absence declaree n est pas rallumee */
 const sansStep={app:'palier',v:2,xp:0,goal:4,hist:[],perf:{},unlocked:{},badges:[],
   gear:JSON.parse(JSON.stringify(DEFAULT_GEAR))};
 delete sansStep.gear.res.stepbas;
 const s4=Object.assign(defaultState(),JSON.parse(JSON.stringify(sansStep)));
 migrateState(s4,sansStep);
 if(s4.gear.res.stepbas!==1) err('la marche basse n est pas presente par migration');
 s4.gear.res.stepbas=0; migrateState(s4,sansStep);
 if(s4.gear.res.stepbas!==0) err('la migration rallume une marche basse decochee');
 /* l inventaire neuf, lui, la laisse decochee */
 await neuf();
 if(aRes('stepbas')) err('l inventaire vide coche la marche basse');
 /* repli douleur : jamais vers un exercice que le materiel ne sert pas */
 domicile();
 if(fbOf('fentes-arriere')!=='step-ups-bas') err('le repli des fentes devrait etre servi a domicile');
 toggleRes('stepbas');
 if(fbOf('fentes-arriere')!==null) err('repli propose alors que la marche basse est decochee');
 if(DB['fentes-arriere'].fb!=='step-ups-bas') err('le lien de repli lui-meme ne doit pas bouger');
 toggleRes('stepbas');
 /* les trois couples deja vivants en v2.0, fermes par le meme filtre */
 [['elevations-laterales','tirage-doux'],['rowing-kettlebell','rowing-elastique'],
  ['rowing-suspension','rowing-elastique']].forEach(c=>{
   if(fbOf(c[0])!==c[1]) err('repli attendu a domicile : '+c[0]);
 });
 BANDS.forEach(b=>setBandReal(b.id,''));
 [['elevations-laterales'],['rowing-kettlebell'],['rowing-suspension']].forEach(c=>{
   if(fbOf(c[0])!==null) err('repli a elastique propose sans elastique : '+c[0]);
 });
 /* et la seance allegee emprunte le meme chemin */
 domicile(); BANDS.forEach(b=>setBandReal(b.id,''));
 lightMode=true;
 const plan=buildSession();
 if(plan.exos.indexOf('rowing-elastique')>=0||plan.exos.indexOf('tirage-doux')>=0) err('la seance allegee substitue vers un exercice non servi');
 lightMode=false;
 console.log('marche basse OK : neuvieme ressource, migration prudente, replis filtres sur les deux chemins');

 // ================= 6. VERROU DES STRICTES =================
 await neuf(); domicile();
 /* temoin E1 : un profil ne possedant que la verte ne prouve rien */
 state.gear.bands={vert:'vert'};
 const src1='tractions-assistees-supination';
 const pE=perfOf(src1); pE.band='vert';
 applyProgress(src1,[10,10,10],true,false,nonQualifie(src1));
 checkUnlocks(3,false,{});
 if(state.unlocked['tractions-strictes-supination']) err('E1 : le verrou s ouvre sur la verte');
 /* nominal : le meme compte avec l elastique le plus fin ouvre toujours */
 await neuf(); domicile();
 const pN=perfOf(src1); pN.band='jaune';
 applyProgress(src1,[10,10,10],true,false,nonQualifie(src1));
 checkUnlocks(3,false,{});
 if(!state.unlocked['tractions-strictes-supination']) err('le verrou ne s ouvre plus dans le cas nominal');
 /* et le libelle dit ce qui est verifie */
 if(lockCond(DB['tractions-strictes-supination']).indexOf('le plus fin')<0) err('l enonce du verrou ne suit pas la regle');
 console.log('verrou OK : ferme sur la verte, ouvert sur le jaune, enonce conforme');

 // ================= 7. COMPTEUR DE PROGRESSIONS =================
 await neuf(); domicile();
 const avantPerf=JSON.stringify(Object.keys(state.perf).sort().map(k=>[k,state.perf[k]]));
 const dom=progDispo(state.gear);
 if(dom.total!==9||dom.marche!==9) err('domicile : 9 sur 9 attendus, '+dom.marche+' sur '+dom.total);
 const gVert=JSON.parse(JSON.stringify(state.gear)); gVert.bands={vert:'vert'};
 const v=progDispo(gVert);
 if(v.total!==9||v.marche!==6) err('verte seule : 6 sur 9 attendus, '+v.marche+' sur '+v.total);
 const gVide=JSON.parse(JSON.stringify(EMPTY_GEAR));
 const z=progDispo(gVide);
 if(z.total!==1||z.marche!==0) err('inventaire vide : 0 sur 1 attendu, '+z.marche+' sur '+z.total);
 /* un palier tenu quitte le denominateur : il a choisi de ne pas monter */
 setHold('curls-halteres',true);
 if(progDispo(state.gear).total!==8) err('un palier tenu reste compte');
 setHold('curls-halteres',false);
 /* lecture pure : les entrees deja presentes ne bougent pas */
 const apresPerf=JSON.stringify(Object.keys(state.perf).sort().filter(k=>avantPerf.indexOf('"'+k+'"')>=0||true).map(k=>[k,state.perf[k]]));
 progDispo(state.gear); progDispo(gVert);
 if(JSON.stringify(Object.keys(state.perf).sort().map(k=>[k,state.perf[k]]))!==apresPerf) err('le compteur ecrit dans perf');
 console.log('compteur OK : 9/9 a domicile, 6/9 sur la verte seule, 0/1 sans rien, lecture pure');

 // ================= 8. PLUS AUCUN DIALOGUE SYSTEME =================
 if(/[^a-zA-Z]prompt\\s*\\(/.test(SRC)) err('un prompt systeme survit dans les sources');
 if(/[^a-zA-Z]confirm\\s*\\(/.test(SRC)) err('un confirm systeme survit dans les sources');
 if(typeof renameBand!=='undefined'||typeof toggleBand!=='undefined') err('un ecrivain de bande retire est encore expose');
 /* sortie de seance : un seul geste ne quitte rien */
 await neuf(); domicile();
 state.warm='aucun'; state.cardio=false; state.stretch=false;
 startSession();
 const st0=cur.steps[0]; st0.val=8; validateSet();
 quitSession();
 if(!askQuit) err('la question de sortie n est pas posee');
 if(view!=='session') err('la seance a ete quittee sans reponse');
 if(html.indexOf('Quitter la séance ?')<0) err('la question de sortie ne s affiche pas');
 key('Enter'); key(' ');
 if(view!=='session'||!askQuit) err('une touche reflexe a repondu a la question');
 key('Escape');
 if(askQuit) err('Echap n annule pas la question');
 quitSession(); quitConfirm();
 await new Promise(r=>setTimeout(r,10));
 const h=state.hist[state.hist.length-1];
 if(!h||!h.inc) err('la sortie confirmee n enregistre pas une seance incomplete');
 console.log('dialogues OK : aucun prompt ni confirm systeme, sortie en deux temps, touches inertes');

 // ================= 9. CARD MATERIEL =================
 await neuf(); domicile();
 view='set'; render();
 ['Présent','Absent','Possédée','Absente','Modifier l\\'échelle','Nommer'].forEach(m=>{
   if(html.indexOf('>'+m+'<')>=0) err('un bouton label-etat survit : '+m);
 });
 if(html.indexOf('class="sw')<0) err('aucun interrupteur dans la card');
 if(html.indexOf('class="pastille"')<0) err('aucune pastille de niveau');
 if(html.indexOf('schémas moteurs servis')<0) err('compteur de schemas absent du pied de card');
 if(html.indexOf('encore une marche ici')<0) err('compteur de progressions absent du pied de card');
 if(html.indexOf('Marche basse')<0) err('la marche basse n est pas declarable dans la card');
 /* ajout dynamique d un type de disque : quatre exemplaires, mesure a l appui */
 const L0=loadLadderProg(state.gear).length;
 addPlate('2.5');
 if(state.gear.plates['2.5']!==4) err('un type de disque doit entrer a quatre exemplaires');
 if(loadLadderProg(state.gear).length<=L0) err('ajouter un type n a pas allonge l echelle de progression');
 adjPlate('2.5',-2); adjPlate('2.5',-2);
 if(state.gear.plates['2.5']!==0) err('un type ne retombe pas a zero');
 view='set'; render();
 if(html.indexOf('>2,5 kg<')<0) err('un type a zero ne redevient pas proposable');
 console.log('card OK : interrupteurs, pastilles, deux compteurs, types de disques dynamiques');

 console.log('TESTS LOT CLOTURE V2.0 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
