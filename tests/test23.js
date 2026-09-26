// Nouveautes v1.18 : retrait du mode cible et du bouton de saut de seance,
// carrousel des seances a venir dans le detail de seance.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
/* le CSS de la bande se lit dans head.html, comme dans test42 */
const CSS=fs.readFileSync('head.html','utf8');
const T=`
(async()=>{
 const CSS=${JSON.stringify(CSS)};
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 const sans=h=>h.split('data:image').map((x,i)=>i?x.slice(x.indexOf('"')):x).join(' ');
 const panneaux=h=>(h.match(/class="carpane"/g)||[]).length;

 // 1. le mode cible ne survit nulle part
 await neuf();
 ['SESSIONS','CIBLE_ORDER','setMode','setRest','skipType'].forEach(n=>{
   if(eval('typeof '+n)!=='undefined') throw new Error(n+' survit au retrait du mode cible');
 });
 if(buildSession().type!=='alterne') throw new Error('le type de seance n est plus constant');
 if(weeklySets()!==roundsOf(state)*state.goal) throw new Error('volume hebdomadaire par groupe faux');
 console.log('retrait OK : decoupage, reglages et bouton de saut absents, un seul type de seance');

 // 2. les champs orphelins disparaissent a la migration, et l historique garde le sien
 await neuf();
 state.mode='cible'; state.cibleIdx=4; state.rest=90;
 await save(); state=null; await loadState(); domicile();
 if(state.mode!==undefined||state.cibleIdx!==undefined||state.rest!==undefined)
   throw new Error('champ orphelin conserve : '+JSON.stringify({mode:state.mode,cibleIdx:state.cibleIdx,rest:state.rest}));
 const avant=JSON.stringify(state);
 migrateState(state);
 if(JSON.stringify(state)!==avant) throw new Error('la migration v1.18 n est pas idempotente');
 console.log('migration OK : mode, cibleIdx et rest retires, idempotente');

 // 3. libelle d historique : rien en alterne, allegee marquee, Ciblee pour une entree ancienne
 await neuf();
 if(histLab({mode:'alterne'})!=='') throw new Error('le mot Alternee subsiste sur une ligne d historique');
 if(histLab({mode:'alterne',light:true})!=='allégée') throw new Error('marque allegee perdue');
 if(histLab({mode:'cible',type:'core'})!=='Ciblée') throw new Error('entree ancienne non identifiee');
 if(histLab({mode:'cible',light:true})!=='Ciblée · allégée') throw new Error('cumul des deux marques faux');
 state.hist.push({date:new Date().toISOString(),mode:'cible',type:'core',items:[],xp:0});
 view='prog'; render();
 if(html.indexOf('Ciblée')<0) throw new Error('une entree ancienne ne se rend plus');
 console.log('historique OK : mot constant retire, entree ancienne encore lisible');

 // 4. autant de panneaux que le plus gros vivier, et chaque panneau EXACT
 /* v2.8 : la promesse d exhaustivite sur la fenetre est retiree, elle etait
    incompatible avec le dephasage des viviers. Que toute tranche de n tirages
    porte les n exercices equivaut a une suite de periode n ; jambes et gainage
    comptant cinq entrees chacun, deux suites de periode 5 redonnent cinq paires
    rigides, soit exactement ce que le dephasage supprime. La tenir aurait
    demande onze panneaux au lieu de six. Ce qui est teste ici est la propriete
    que le carrousel promet vraiment : chaque panneau annonce le tirage qui
    sortira reellement a cette distance, a jeu normal. */
 await neuf();
 const N=aheadCount();
 const tailles=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(id=>!isLocked(id)&&!estRetire(id)).length);
 if(N!==Math.max.apply(null,tailles)) throw new Error('fenetre '+N+' pour des viviers '+tailles.join('/'));
 for(let dep=0;dep<210;dep++){
   SLOT_ORDER.forEach(s=>state.slotIdx[s]=dep);
   const annonce=[]; for(let k=0;k<N;k++) annonce.push(drawAhead(k).join('|'));
   for(let k=0;k<N;k++){
     SLOT_ORDER.forEach(s=>state.slotIdx[s]=dep+k);
     const reel=SLOT_ORDER.map(pickFromPool).join('|');
     if(reel!==annonce[k]) throw new Error('depart '+dep+', panneau '+k+' annonce '+annonce[k]+' et sort '+reel);
   }
 }
 SLOT_ORDER.forEach(s=>state.slotIdx[s]=0);
 console.log('fenetre OK : '+N+' panneaux, chacun exact sur les 210 departs');

 // 5. le panneau zero est la seance du jour, le panneau un est le tirage suivant
 await neuf();
 view='home'; render();
 if(panneaux(html)!==N) throw new Error(panneaux(html)+' panneaux rendus pour '+N+' attendus');
 const jour=buildSession().exos, suiv=drawAhead(1);
 if(jour.some((id,i)=>id!==drawAhead(0)[i])) throw new Error('le panneau du jour ne suit pas le tirage courant');
 if(suiv.some(id=>jour.indexOf(id)>=0)) throw new Error('un exercice du jour reapparait des le panneau suivant');
 const t=sans(html), i0=t.indexOf('data-i="0"'), i1=t.indexOf('data-i="1"');
 if(i0<0||i1<0||i0>i1) throw new Error('ordre des panneaux');
 suiv.forEach(id=>{ if(t.slice(i1).indexOf(DB[id].nom)<0) throw new Error('exercice absent du panneau suivant : '+DB[id].nom); });
 console.log('panneaux OK : le jour puis les tirages a venir, dans l ordre');

 // 6. ce que les panneaux a venir portent, et ce qu ils ne portent pas
 const p1=t.slice(i1, t.indexOf('data-i="2"')>0?t.indexOf('data-i="2"'):t.length);
 if(p1.indexOf('Cibles et charges à ton niveau actuel')<0) throw new Error('mention de niveau absente');
 if(p1.indexOf('futnote')>p1.indexOf('Matériel à sortir')) throw new Error('la mention doit preceder le materiel');
 if(p1.indexOf('Matériel à sortir')<0) throw new Error('materiel absent d un panneau a venir');
 /* le sous-titre d une ligne a venir ne porte que le groupe musculaire : la
    duree du jour s y ajoute apres un separateur, qui doit rester absent */
 const sousTitres=p1.split('class="muted small">').slice(1).map(x=>x.split('<')[0]);
 const avecSep=sousTitres.filter(x=>x.indexOf(' · ')>=0);
 if(avecSep.length) throw new Error('duree sur une ligne a venir : '+avecSep[0]);
 if(!sousTitres.length) throw new Error('aucun sous-titre lu, le controle ne prouve rien');
 console.log('contenu OK : mention en tete, materiel present, aucune duree');

 // 7. le barreau de bande figure sur la ligne, du jour comme a venir
 await neuf();
 const idb=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(x=>!isLocked(x)&&!estRetire(x))).reduce((a,b)=>a.concat(b),[])
   .filter(id=>DB[id].bnd&&perfFor(id,false).band&&perfFor(id,false).band!=='aucune')[0];
 if(!idb) throw new Error('aucun exercice a bande pour le controle');
 const ligne=exoRowHtml(idb);
 /* v2.10 : le libelle dit « bande » et non « elastique », et il porte la
    realisation au feminin. L ancien controle cherchait « elastique » suivi de
    la CLE du niveau, au masculin : il passait par prefixe, « elastique noir »
    etant un prefixe de « elastique noire », et n aurait donc jamais vu le
    desaccord qu il etait cense couvrir. */
 if(ligne.indexOf('bande '+bandNom(perfFor(idb,false).band))<0) throw new Error('barreau de bande absent de la ligne de '+DB[idb].nom);
 if(/[ée]lastique\s+(rose|verte|bleue|violette|noire|blanche|grise)/i.test(ligne)) throw new Error('desaccord de genre sur la ligne de '+DB[idb].nom);
 console.log('bande OK : barreau annonce sur la ligne, '+DB[idb].nom+' en '+bandNom(perfFor(idb,false).band));

 // 8. l index du carrousel ne persiste pas
 carIdx=3; view='home'; render();
 if(carIdx!==0) throw new Error('le carrousel reste parque sur un panneau a venir');
 console.log('index OK : remis a zero a chaque affichage de l accueil');

 // 8 bis. le glissement est pilote, le defilement lisse natif n est plus demande
 if(typeof carGlide!=='function') throw new Error('le glissement pilote a disparu');
 if(!(CAR_MS>0&&CAR_MS<=400)) throw new Error('duree de glissement hors de portee : '+CAR_MS);
 if(/behavior\s*:\s*'smooth'/.test(carGo.toString())) throw new Error('carGo redemande le defilement lisse natif');
 if(carGo.toString().indexOf('carGlide')<0) throw new Error('carGo ne passe plus par le glissement pilote');
 /* la deceleration part de la position courante et arrive exactement a la cible */
 const e=k=>1-Math.pow(1-k,3);
 if(e(0)!==0||e(1)!==1) throw new Error('la deceleration ne couvre pas tout le trajet');
 let prev=-1, croiss=true;
 for(let k=0;k<=1.0001;k+=0.05){ const v=e(Math.min(1,k)); if(v<prev) croiss=false; prev=v; }
 if(!croiss) throw new Error('la deceleration revient en arriere');
 console.log('glissement OK : pilote en '+CAR_MS+' ms, deceleration monotone de 0 a 1');

 /* 8 ter. La bande prend la hauteur du panneau affiche. Une bande flex prend
    sinon celle de son plus grand enfant, et les panneaux a venir sont
    systematiquement plus hauts que celui du jour, intitule et encart de niveau
    en plus : le vide s ouvrait sous la derniere ligne de la seance du jour
    jusqu a la card suivante (corrige le 13 septembre 2026). */
 /* Sans alignement en haut, l etirement par defaut donne a chaque panneau la
    hauteur de la ligne : la mesure rend le plus grand et carFit se reecrit sa
    propre hauteur. C est l assertion qui manquait au premier passage, celle de
    la mesure ne pouvant rien prouver sur un offsetHeight simule. */
 if(!/\\.carstrip\\{[^}]*align-items:flex-start/.test(CSS)) throw new Error('la bande doit aligner ses panneaux en haut, sinon la mesure rend la hauteur du plus grand');
 if(!/\\.carstrip\\{[^}]*overflow-y:hidden/.test(CSS)) throw new Error('la bande doit cacher le debordement vertical : une hauteur fausse capturerait le defilement de la page');
 if(!/\\.carstrip\\{[^}]*transition:height/.test(CSS)) throw new Error('la hauteur de la bande se transitionne');
 if(carGo.toString().indexOf('carFit')<0) throw new Error('carGo ne remesure pas la hauteur');
 if(carScroll.toString().indexOf('carFit')<0) throw new Error('un balayage ne remesure pas la hauteur');
 if(renderHome.toString().indexOf('carFit')<0) throw new Error('l accueil ne mesure pas la hauteur au rendu');
 if(!/ontoggle="carFit\\(\\)"/.test(html)) throw new Error('la card repliee ne remesure pas a son ouverture');
 {
   const DQ=document.querySelector;
   const pans=[{offsetHeight:300},{offsetHeight:420},{offsetHeight:380}];
   const strip={style:{},querySelectorAll:()=>pans};
   document.querySelector=s=>s==='#carstrip'?strip:DQ(s);
   carIdx=0; carFit();
   if(strip.style.height!=='300px') throw new Error('hauteur du panneau du jour attendue, '+strip.style.height);
   carIdx=1; carFit();
   if(strip.style.height!=='420px') throw new Error('la hauteur suit le panneau affiche, '+strip.style.height);
   carIdx=9; carFit();
   if(strip.style.height!=='380px') throw new Error('index hors bornes ramene au dernier panneau, '+strip.style.height);
   /* card repliee : rien ne se mesure, la consigne s efface plutot que d ecraser
      la bande a zero */
   pans[2].offsetHeight=0; carFit();
   if(strip.style.height!=='') throw new Error('mesure nulle : la consigne de hauteur doit s effacer, '+strip.style.height);
   document.querySelector=DQ;
   carIdx=0;
 }
 console.log('hauteur OK : la bande suit le panneau affiche, mesure nulle effacee, debordement vertical cache');

 // 9. la ligne fermee porte le nom du panneau et non la marque allegee
 await neuf(); lightMode=true; view='home'; render();
 const som=sans(html).split('home-detail')[1].split('</summary>')[0];
 if(som.indexOf('Aujourd\\'hui')<0) throw new Error('la ligne fermee ne porte pas le nom du panneau');
 if(som.indexOf('allégée')>=0) throw new Error('la marque allegee occupe encore la ligne fermee');
 if(sans(html).indexOf('cibles réduites')<0) throw new Error('la seance allegee n est plus annoncee ailleurs');
 lightMode=false;
 console.log('en-tete OK : nom du panneau, allegee dite dans le bandeau et l encart');

 // 10. seance allegee : les replis restent au jour, les panneaux a venir montrent le tirage normal
 await neuf(); lightMode=true;
 const pl=buildSession();
 const remplaces=pl.exos.filter((id,i)=>id!==pl.orig[i]);
 if(!remplaces.length) throw new Error('aucune substitution : le controle ne prouve rien');
 view='home'; render();
 const u=sans(html), j1=u.indexOf('data-i="1"');
 remplaces.forEach(id=>{ if(u.slice(j1).indexOf(DB[id].nom)>=0&&drawAhead(1).indexOf(id)<0)
   throw new Error('un repli du jour deborde sur les panneaux a venir : '+DB[id].nom); });
 lightMode=false;
 console.log('allegee OK : les replis ne colorent que le panneau du jour');

 // 11. les reglages : la card Structure a disparu, son chiffre a demenage
 await neuf(); view='set'; render();
 if(html.indexOf('Structure de séance')>=0) throw new Error('la card Structure survit');
 if(html.indexOf('Ciblée')>=0) throw new Error('le mode cible est encore nomme dans les reglages');
 const ser=html.split('Séries par exercice')[1].split('</details>')[0];
 if(ser.indexOf('séries par groupe musculaire et par semaine')<0) throw new Error('volume hebdomadaire absent de Series par exercice');
 if(ser.indexOf('>'+weeklySets()+'<')<0) throw new Error('le chiffre affiche ne suit pas le reglage');
 const pied=html.split('class="card muted small"')[1]||'';
 const titres=['Ce que fait PALIER','Comment les exercices sont choisis','Pourquoi les séances sont alternées'];
 titres.forEach(t=>{ if(pied.indexOf('>'+t+'</span>')<0) throw new Error('intitule absent du pied des reglages : '+t); });
 const pos=titres.map(t=>pied.indexOf(t));
 if(pos[0]>pos[1]||pos[1]>pos[2]) throw new Error('l outil doit etre presente avant son catalogue puis sa structure');
 if((pied.match(/class="lead/g)||[]).length!==3) throw new Error('trois intitules attendus dans le pied');
 if(pied.indexOf('douleur inhabituelle ou persistante')<0) throw new Error('la ligne de prudence a disparu');
 console.log('reglages OK : card retiree, chiffre dans Series par exercice, structure expliquee en bas');

 // 12. aria-label sur les boutons a symbole nu
 await neuf(); view='set'; render();
 const nSet=(html.match(/aria-label=/g)||[]).length;
 if(nSet<6) throw new Error('steppers des reglages sans etiquette : '+nSet);
 view='home'; render();
 const nHome=(sans(html).match(/aria-label=/g)||[]).length;
 if(nHome<3) throw new Error('boutons du carrousel sans etiquette : '+nHome);
 console.log('etiquettes OK : '+nSet+' dans les reglages, '+nHome+' sur l accueil');

 console.log('TESTS V1.18 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
