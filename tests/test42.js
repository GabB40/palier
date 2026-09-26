/* test42 : lot v2.15, lisibilite. Migration de la memoire de fenetre depuis
   la derniere lecture (releve d audit externe sur la v2.14), bibliotheque en
   trois paliers sans nom tronque et avec les substituts marques, valeurs
   d en-tete ferme qui passent a la ligne, « Cette semaine » sous le lancement,
   detail de seance sans phrases constantes, « Derniere fois » portant le
   niveau quand il differe, referentiel d assiduite replie, texte de fiche,
   etiquettes a 0,68 rem, colonne de 600 px au-dessus de 900 px. */
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
const CSS=fs.readFileSync('head.html','utf8');

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const SRC=${JSON.stringify(src)};
 const CSS=${JSON.stringify(CSS)};
 const M='mollets-debout', PL='planche', F='face-pulls';
 const L=Object.keys(DB).filter(id=>DB[id].mode==='load'&&DB[id].reps&&!DB[id].bnd)[0];

 /* ---------- 1. migration de la memoire : gardes ---------- */
 const perf=(o)=>Object.assign({load:0,range:[12,25],target:16,best:16,sets:[15,15,15],date:'2026-09-01T10:00:00.000Z'},o||{});
 const mig=(id,o)=>migrateState(g({v:2,rounds:3,perf:{[id]:perf(o)}})).perf[id];
 if(mig(M).prevMin!==15) err('lecture exploitable : semee, '+mig(M).prevMin);
 if(mig(M,{sets:[15,13,14]}).prevMin!==13) err('la plus petite serie est semee');
 if('prevMin' in mig(M,{lightSets:true})) err('lecture allegee : pas de memoire');
 if('prevMin' in mig(M,{unqualSets:true})) err('lecture non qualifiee : pas de memoire');
 if('prevMin' in mig(L,{load:6.5,range:DB[L].reps.slice(),sets:[12,12,12],grace:true})) err('grace posee : le dernier passage a monte, pas de memoire');
 if(mig(L,{load:6.5,range:DB[L].reps.slice(),sets:DB[L].reps.map(()=>DB[L].reps[1]).concat([DB[L].reps[1]])}).prevMin!==DB[L].reps[1]) err('charge au plafond sans grace : le palier n a pas bouge, la memoire se seme');
 /* v2.16 : la garde « au haut de fourchette moins un pas » tombe avec le
    relevement. Un passage au plafond n a change aucun palier, ses series sont
    au palier courant, elles sement. */
 if(mig(M,{sets:[25,25,25]}).prevMin!==25) err('poids du corps au haut de fourchette : plus de relevement possible, semee (v2.16)');
 if(mig(M,{sets:[24,25,24]}).prevMin!==24) err('poids du corps au haut moins un pas : semee (v2.16)');
 if(mig(M,{sets:[23,24,25]}).prevMin!==23) err('poids du corps sous le haut moins un pas : semee, '+mig(M,{sets:[23,24,25]}).prevMin);
 if(mig(PL,{range:[20,45],target:45,sets:[40,45]}).prevMin!==40) err('tenue au haut moins un pas de 5 : semee (v2.16)');
 if(mig(PL,{range:[20,45],target:40,sets:[35,35]}).prevMin!==35) err('tenue sous le haut moins un pas : semee');
 if('prevMin' in mig(M,{sets:[]})) err('sans serie : rien');
 if('prevMin' in mig(M,{sets:undefined})) err('sans champ : rien');
 if(mig(M,{prevMin:9}).prevMin!==9) err('une memoire deja posee n est pas reecrite');
 if(mig(M,{hold:true}).prevMin!==15) err('palier tenu : la memoire se seme, c est une observation');
 const une=migrateState(g({v:2,rounds:3,perf:{[M]:perf()}})), deux=migrateState(g(une));
 if(JSON.stringify(une.perf)!==JSON.stringify(deux.perf)) err('migration non idempotente');
 console.log('migration OK : semee depuis la derniere lecture, gardes de provenance, de grace et de plafond, idempotente');

 /* ---------- 2. migration : les deux chemins d entree ---------- */
 localStorage._m={'palier-state-v2':JSON.stringify({v:2,rounds:3,perf:{[M]:perf()}})};
 state=null; await loadState();
 if(perfOf(M).prevMin!==15) err('loadState doit semer la memoire');
 await neuf();
 applyImport({app:'palier',version:'2.13',xp:0,hist:[],v:2,rounds:3,perf:{[M]:perf({sets:[14,14,14]})}});
 if(perfOf(M).prevMin!==14) err('applyImport doit semer la memoire');
 console.log('chemins OK : loadState et applyImport sement tous deux');

 /* ---------- 3. bibliotheque : trois paliers, substituts marques ---------- */
 await neuf();
 perfOf(L).load=6.5; perfOf(L).sets=[12,12,12];
 perfOf(F).sets=[18,18];
 view='lib'; libQ=''; render();
 const lib=html;
 const card=(label)=>{ const i=lib.indexOf('<h3>'+label+'</h3>'); const j=lib.indexOf('<div class="card">',i+1); return lib.slice(i,j<0?lib.length:j); };
 const jambes=card('Jambes'), tire=card('Tiré'), pousse=card('Poussé');
 if(!jambes||!tire||!pousse) err('trois groupes attendus');
 /* ordre : aucune ligne verrouillee avant le sous-titre hors tirage, aucune ligne hors tirage avant la fin des lignes en rotation */
 const iSub=jambes.indexOf('class="libsub"'), iLock=jambes.indexOf('<details class="libtier"'), iFirstLocked=jambes.indexOf('lockedrow');
 if(iSub<0||iLock<0) err('jambes : sous-titre hors tirage et bloc verrouille attendus');
 if(iFirstLocked<iLock) err('jambes : une ligne verrouillee avant le bloc des verrouilles');
 if(jambes.indexOf('>repli<')>=0&&jambes.indexOf('>repli<')<iSub) err('jambes : un repli avant le sous-titre hors tirage');
 const nLock=Object.keys(DB).filter(id=>DB[id].cat==='legs'&&isLocked(id)).length;
 if(jambes.indexOf('<summary><b>'+nLock+'</b> paliers à débloquer</summary>')<0) err('jambes : le compte de verrouilles est porte par la ligne fermee, '+nLock);
 if(/<details class="libtier"[^>]*open/.test(jambes)) err('jambes : le bloc des verrouilles est ferme par defaut');
 /* substituts et replis : etiquette, origine, jamais « a faire » */
 if(tire.indexOf('>substitut<')<0) err('tire : les substituts materiels sont marques');
 if(tire.indexOf('substitut de ')<0) err('tire : le substitut nomme ce dont il prend la place');
 const horsT=tire.slice(tire.indexOf('class="libsub"'),tire.indexOf('<details class="libtier"'));
 if(horsT.indexOf('à faire')>=0) err('tire : « a faire » sur une ligne hors tirage');
 /* le niveau descend en ligne 2, la colonne de droite ne porte que les series */
 if(pousse.indexOf('<span class="lvl">· 6,5 kg</span>')<0) err('pousse : le niveau descend en ligne 2');
 if(/<span class="num small st">[^<]*kg/.test(pousse)) err('pousse : la colonne de droite ne porte pas la charge');
 if(pousse.indexOf('12/12/12')<0&&pousse.indexOf('12<')<0) err('pousse : les series du dernier passage restent a droite');
 if(tire.indexOf('· '+bandLabel('rouge')+'</span>')<0&&tire.indexOf('<span class="lvl">· ')<0) err('tire : la bande descend en ligne 2');
 /* recherche : ouvre le bloc, et le referme quand elle s efface */
 libFilter('mollets');
 const q1=html;
 if(!/<details class="libtier"[^>]*open/.test(q1)) err('une recherche ouvre le bloc des verrouilles');
 if((q1.match(/lockedrow/g)||[]).length!==3) err('mollets : trois verrouilles attendus a l etat neuf, '+(q1.match(/lockedrow/g)||[]).length);
 if(q1.indexOf('Mollets debout</b>')<0) err('mollets : l accessible est la, en entier');
 libFilter('');
 if(/<details class="libtier"[^>]*open/.test(html)) err('la recherche effacee referme le bloc');
 libFilter('zzzz');
 if(html.indexOf('Aucun exercice ne correspond')<0) err('recherche vide annoncee');
 libFilter('');
 /* le nom ne se tronque plus, ni ici ni dans le detail de seance */
 if(!/\\.exorow \\.ex b\\{white-space:normal/.test(CSS)) err('le nom de bibliotheque doit pouvoir passer a la ligne');
 if(/\\.exorow \\.ex b\\{[^}]*ellipsis/.test(CSS)) err('plus d ellipse sur le nom de bibliotheque');
 if(!/\\.nextexo \\.ex b\\{white-space:normal/.test(CSS)) err('le nom du detail de seance doit pouvoir passer a la ligne');
 if(lib.indexOf('Toute la banque, avec les paliers à débloquer')>=0) err('l ancien pied de liste a disparu');
 console.log('bibliotheque OK : rotation, hors tirage, verrouilles replies avec compte, substituts marques, niveau en ligne 2, recherche qui ouvre et referme');

 /* ---------- 4. en-tetes fermes : la valeur passe a la ligne ---------- */
 const val=CSS.match(/details\\.card>summary \\.val\\{[^}]*\\}/);
 if(!val) err('regle .val introuvable');
 if(!/white-space:normal/.test(val[0])||/ellipsis/.test(val[0])||/nowrap/.test(val[0])) err('la valeur d en-tete ferme ne doit plus etre coupee : '+val[0]);
 console.log('en-tetes OK : la valeur passe a la ligne');

 /* ---------- 5. accueil : ordre des cards ---------- */
 await neuf();
 view='home'; render();
 const iL=html.indexOf('Lancer la séance'), iW=html.indexOf('<h3>Cette semaine</h3>'), iC=html.indexOf('data-k="home-contenu"'), iD=html.indexOf('data-k="home-detail"'), iP=html.indexOf('<h3>Progression</h3>');
 if(!(iL>0&&iW>iL&&iC>iW&&iD>iC&&iP>iD)) err('ordre attendu : lancement, semaine, contenu, detail, progression ; obtenu '+[iL,iW,iC,iD,iP].join(','));
 /* detail de seance : plus de phrases constantes */
 if(html.indexOf('Touche un exercice pour sa fiche complète')>=0) err('phrase constante « Touche un exercice » encore presente');
 if(html.indexOf('plus le module cardio qui coûte')>=0) err('phrase constante sur le cardio encore presente');
 if(html.indexOf('comptés dans le temps annoncé')>=0) err('la ligne des etirements est raccourcie');
 if(effStretch()&&!/Puis [^<]+ · \\d/.test(html)) err('la ligne des etirements porte encore les etirements du jour et leur duree');
 console.log('accueil OK : Cette semaine sous le lancement, detail sans phrases constantes, etirements du jour conserves');

 /* ---------- 6. derniere fois avec le niveau quand il differe ---------- */
 await neuf();
 const ph={load:6.5,band:null};
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:L,sets:[12,12,12],load:6}]}];
 if(lastLevel(L,ph)!==' <span class="muted">à '+loadLabelFor(L,6)+'</span>') err('charge differente : le niveau joue est dit, obtenu '+lastLevel(L,ph));
 if(lastLevel(L,{load:6})!=='') err('meme charge : rien');
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:F,sets:[18,18],band:'rouge'}]}];
 if(lastLevel(F,{band:'noir'})!==' <span class="muted">en '+bandLabel('rouge')+'</span>') err('bande differente : le barreau joue est dit');
 if(lastLevel(F,{band:'rouge'})!=='') err('meme bande : rien');
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:'rowing-elastique',from:L,sets:[10,10],load:0}]}];
 if(lastLevel(L,ph)!=='') err('un passage de repli ne compte pas comme passage propre');
 state.hist=[];
 if(lastLevel(L,ph)!=='') err('sans historique : rien');
 if(lastLevel(M,{load:0})!=='') err('poids du corps : rien');
 /* et sur l ecran de serie reel */
 await neuf();
 startSession();
 const st=cur.steps.filter(s=>s.k==='set'&&!s.cool)[0];
 cur.i=cur.steps.indexOf(st); if(cur.phase!=='work'){ cur.phase='work'; }
 perfOf(st.id).sets=[9,9,9];
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:st.id,sets:[9,9,9],load:(DB[st.id].mode==='load'?99:0),band:(DB[st.id].bnd?'vert':undefined)}]}];
 renderSession();
 const attendu=lastLevel(st.id,perfFor(st.id,false));
 if(html.indexOf('Dernière fois')<0) err('ligne derniere fois attendue');
 if(attendu&&html.indexOf(attendu)<0) err('l ecran de serie porte le niveau joue quand il differe');
 cur=null; view='home';
 console.log('derniere fois OK : niveau dit quand il differe, muet sinon, replis ignores, rendu en seance');

 /* ---------- 7. progres : referentiel d assiduite replie ---------- */
 await neuf();
 state.hist=[{date:new Date(Date.now()-9*86400000).toISOString(),type:'alterne',dur:15,real:900,xp:20,rounds:3,items:[{id:M,sets:[12,12,12]}]}];
 view='prog'; render();
 if(html.indexOf('data-k="prog-assid"')<0) err('referentiel d assiduite dans une zone repliable');
 if(/data-k="prog-assid"[^>]*open/.test(html)) err('replie par defaut');
 if(html.indexOf('Comment lire ce graphique')<0||html.indexOf('12 dernières semaines, jours actifs')<0) err('le texte du referentiel est conserve, replie');
 console.log('progres OK : referentiel d assiduite replie, texte conserve');

 /* ---------- 8. fiche : texte et pastilles ---------- */
 showFiche(M,'lib');
 if(html.indexOf("La cible suit tes séries, puis la charge prend le relais.")<0) err('texte de progression de la fiche');
 if(html.indexOf("monte d'un cran à chaque séance")>=0) err('ancien texte encore present');
 console.log('fiche OK : la cible suit les series');

 /* ---------- 9. forme : etiquettes, desktop, mobile inchange ---------- */
 if(/font-size:\\.6rem|font-size:\\.62rem/.test(SRC)||/font-size:\\.6rem|font-size:\\.62rem/.test(CSS)) err('plus aucune etiquette sous 0,68 rem');
 if(!/\\.tenu\\{font-size:\\.68rem/.test(CSS)) err('.tenu a 0,68 rem');
 if(!/@media \\(min-width:900px\\)\\{#app\\{max-width:600px\\}\\}/.test(CSS)) err('colonne de 600 px au-dessus de 900 px');
 if(!/#app\\{max-width:480px;margin:0 auto/.test(CSS)) err('la colonne mobile reste a 480 px');
 if((CSS.match(/max-width:600px/g)||[]).length!==1) err('une seule regle desktop');
 console.log('forme OK : etiquettes a 0,68 rem, desktop 600 px sous media query, mobile intact');

 console.log('TESTS LISIBILITE V2.15 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
