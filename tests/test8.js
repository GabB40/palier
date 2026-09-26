const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=4; };
 /* date du jour d une semaine ISO decalee de n semaines vers le passe */
 const ilY=(n,jour)=>{ const d=new Date(); d.setDate(d.getDate()-7*n);
   const cur=(d.getDay()||7); d.setDate(d.getDate()-cur+jour); d.setHours(12,0,0,0); return d.toISOString(); };
 const seance=(date,items)=>({date:date,type:'alterne',mode:'alterne',dur:15,real:900,xp:40,
   items:items||[{id:'pompes-poignees',sets:[8,8,8],load:0}]});

 // 1. moyenne de jours actifs : semaine en cours exclue, denominateur borne aux
 //    semaines revolues. Le cas reel de Gabriel : une seule seance, un dimanche.
 await neuf();
 state.hist=[seance(ilY(0,7))];
 if(avgActiveDays(state,4)!==null) throw new Error('moyenne affichee alors qu aucune semaine n est revolue');
 view='prog'; render();
 if(/Moyenne de jours actifs/.test(html)) throw new Error('la ligne de moyenne s affiche sans semaine revolue');
 console.log('moyenne OK : masquee tant qu aucune semaine n est revolue (cas d une seule seance ce dimanche)');

 // 2. une semaine revolue a 3 jours actifs : 3,0 sur 1 semaine, pas 0,8 sur 4
 await neuf();
 state.hist=[seance(ilY(1,1)),seance(ilY(1,3)),seance(ilY(1,5)),seance(ilY(0,1))];
 let a=avgActiveDays(state,4);
 if(!a||a.weeks!==1) throw new Error('denominateur non borne aux semaines observees : '+JSON.stringify(a));
 if(a.avg!==3) throw new Error('moyenne faussee : '+a.avg+' au lieu de 3');
 view='prog'; render();
 if(!/3<\\/span>\\/sem sur 1 semaine révolue/.test(html)) throw new Error('libelle de moyenne incorrect');
 console.log('moyenne OK : 3/sem sur 1 semaine revolue, la semaine en cours ne dilue plus');

 // 3. quatre semaines pleines : la fenetre se remplit et la semaine en cours reste dehors
 await neuf();
 state.hist=[];
 for(let s=1;s<=4;s++) for(let j=1;j<=2;j++) state.hist.push(seance(ilY(s,j)));
 for(let j=1;j<=6;j++) state.hist.push(seance(ilY(0,j)));
 state.hist.sort((x,y)=>x.date<y.date?-1:1);
 a=avgActiveDays(state,4);
 if(a.weeks!==4||a.avg!==2) throw new Error('fenetre pleine faussee : '+JSON.stringify(a));
 console.log('moyenne OK : 2/sem sur 4 semaines revolues, 6 jours en cours ignores');

 // 4. bloc replis douleur : compte les replis par exercice d origine
 await neuf();
 const org='pompes-poignees', fb=DB[org].fb;
 state.hist=[
   seance(ilY(1,1),[{id:org,sets:[8,8,8],load:0}]),
   seance(ilY(1,3),[{id:fb,sets:[8,8],load:0,sw:true,from:org}]),
   seance(ilY(0,1),[{id:fb,sets:[7,7],load:0,sw:true,from:org}])
 ];
 const ps=painSwaps(state,4);
 if(ps.length!==1) throw new Error('replis mal regroupes : '+ps.length+' entrees');
 if(ps[0].id!==org) throw new Error('repli attribue au mauvais exercice : '+ps[0].id);
 if(ps[0].sw!==2||ps[0].n!==3) throw new Error('comptage faux : '+ps[0].sw+'/'+ps[0].n);
 view='prog'; render();
 if(!/Replis douleur/.test(html)) throw new Error('bloc replis absent de Progres');
 if(!new RegExp(DB[org].nom.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&')).test(html)) throw new Error('exercice d origine absent du bloc');
 if(!/>2<\\/b>\\/3 passages/.test(html)) throw new Error('ratio de replis non affiche');
 if(!/la douleur revient plus d/.test(html)) throw new Error('alerte de recurrence absente a 2 replis sur 3');
 console.log('replis OK : '+DB[org].nom+' 2/3 passages sur 4 semaines, alerte de recurrence levee');

 // 5. le bloc s efface quand aucun repli sur la fenetre
 await neuf();
 state.hist=[seance(ilY(1,1)),seance(ilY(1,3))];
 if(painSwaps(state,4).length) throw new Error('replis fantomes sans aucun repli');
 view='prog'; render();
 if(/Replis douleur/.test(html)) throw new Error('bloc replis affiche sans repli');
 console.log('replis OK : bloc absent quand la fenetre est propre');

 // 6. un repli hors fenetre ne compte plus
 await neuf();
 state.hist=[seance(ilY(9,1),[{id:fb,sets:[8,8],load:0,sw:true,from:org}])];
 if(painSwaps(state,4).length) throw new Error('un repli de 9 semaines compte encore');
 console.log('replis OK : fenetre glissante de 4 semaines respectee');

 // 7. dernieres seances depliables, contenu et tag de repli
 await neuf();
 state.hist=[seance(ilY(0,1),[{id:fb,sets:[9,8],load:0,sw:true,from:org}])];
 view='prog'; render();
 if(!/Dernières séances/.test(html)) throw new Error('bloc dernieres seances absent');
 const bloc=html.split('Dernières séances')[1].split('Assiduité')[0];
 if(!/<details><summary/.test(bloc)) throw new Error('les seances ne sont pas depliables');
 if(!/tag flame[^>]*>repli de /.test(bloc)) throw new Error('tag de repli absent du detail de seance');
 if(bloc.indexOf('9<i class="sl">/</i>8')<0) throw new Error('series absentes du detail de seance');
 console.log('historique OK : seances depliables, series et repli visibles');

 // 8. ordre des cartes de Progres
 await neuf();
 state.hist=[seance(ilY(1,1)),seance(ilY(0,1))];
 view='prog'; render();
 const ordre=['Dernières séances','Assiduité','Couverture musculaire','Temps d\\'entraînement','Repères par exercice','Badges'];
 let pos=-1;
 ordre.forEach(t=>{ const p=html.indexOf(t);
   if(p<0) throw new Error('carte absente de Progres : '+t);
   if(p<pos) throw new Error('carte hors ordre dans Progres : '+t);
   pos=p; });
 console.log('progres OK : ordre '+ordre.join(' > '));

 // 9. badges : fermes, seuls les obtenus ; ouverts, toute la collection
 await neuf();
 state.badges=['s1'];
 view='prog'; render();
 const bd=html.split('<details class="card" data-k="prog-badges"><summary><span class="ttl">Badges')[1];
 if(!bd) throw new Error('carte badges non repliable');
 const sum=bd.split('</summary>')[0], corps=bd.split('</summary>')[1];
 if(!new RegExp('1\\\\/'+BADGES.length).test(sum)) throw new Error('compteur de badges absent de l en-tete');
 if(!/badgechip/.test(sum)) throw new Error('les badges obtenus ne sont pas dans l en-tete ferme');
 if((sum.match(/badgechip/g)||[]).length!==1) throw new Error('l en-tete ferme montre des badges non obtenus');
 if((corps.match(/class="badge/g)||[]).length!==BADGES.length) throw new Error('la carte ouverte ne montre pas tous les badges');
 console.log('badges OK : 1 pastille fermee, '+BADGES.length+' badges ouverts');

 // 10. reglages : toutes les cartes repliables portent leur valeur courante
 await neuf();
 state.lastExport=null;
 view='set'; render();
 const attendus=[['Données','jamais exportée'],['Objectif hebdomadaire','4 jours'],['Séries par exercice','4 séries'],
   ['Échauffement','Aucun'],['Module cardio','Désactivé'],
   ['Étirements de fin de séance','Désactivés'],['Transition','15 s'],
   ['Entretien','Progression active'],['Thème','Auto']];
 pos=-1;
 attendus.forEach(([t,v])=>{
   const bloc='<span class="ttl">'+t+'</span><span class="val">'+v+'</span>';
   const p=html.indexOf(bloc);
   if(p<0) throw new Error('carte de reglage sans sa valeur : '+t+' (attendu '+v+')');
   if(p<pos) throw new Error('carte de reglage hors ordre : '+t);
   pos=p; });
 if(html.indexOf('<span class="ttl">Matériel</span>')<html.indexOf('<span class="ttl">Entretien</span>'))
   throw new Error('Materiel n est pas apres Entretien');
 if(html.indexOf('<span class="ttl">Thème</span>')<html.indexOf('<span class="ttl">Matériel</span>'))
   throw new Error('Theme n est pas apres Materiel');
 console.log('reglages OK : 11 cartes repliables, valeurs en en-tete, ordre Donnees > Objectif > Duree ... Materiel > Theme');

 // 11. horodatage du dernier export
 await neuf();
 if(lastExportLabel()!=='jamais exportée') throw new Error('etat initial d export incorrect');
 markExport();
 if(!state.lastExport) throw new Error('export non horodate');
 if(lastExportLabel()!=='aujourd\\'hui') throw new Error('libelle du jour incorrect : '+lastExportLabel());
 state.lastExport=new Date(Date.now()-3*864e5).toISOString();
 if(lastExportLabel()!=='il y a 3 j') throw new Error('libelle a 3 jours incorrect : '+lastExportLabel());
 view='set'; render();
 if(!/<span class="val">il y a 3 j<\\/span>/.test(html)) throw new Error('date d export absente de l en-tete');
 console.log('export OK : jamais / aujourd hui / il y a 3 j, visible carte fermee');

 // 12. bibliotheque : vignettes, verrous integres, une ligne par exercice
 await neuf();
 view='lib'; render();
 const nLignes=(html.match(/class="exorow/g)||[]).length;
 if(nLignes!==Object.keys(DB).length) throw new Error('lignes de bibliotheque : '+nLignes+' pour '+Object.keys(DB).length+' exercices');
 if(!/class="search"/.test(html)) throw new Error('barre de recherche absente');
 const verrouille=Object.keys(DB).filter(id=>isLocked(id))[0];
 if(verrouille){
   if(!/lockedrow/.test(html)) throw new Error('ligne verrouillee non stylee');
   /* la condition porte un jeton {n} substitue au rendu : on compare a la
      forme rendue, jamais au gabarit */
   if(!new RegExp('↳ '+lockCond(DB[verrouille]).slice(0,12).replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&')).test(html))
     throw new Error('condition de deblocage absente de la ligne');
 }
 console.log('bibliotheque OK : '+nLignes+' lignes a vignette, verrous integres, recherche presente');

 // 13. recherche : nom, muscle, insensible aux accents, groupes vides masques
 libFilter('trac');
 let n=(html.match(/class="exorow/g)||[]).length;
 const attTrac=Object.keys(DB).filter(id=>/trac/i.test(DB[id].nom.normalize('NFD').replace(/[\\u0300-\\u036f]/g,''))).length;
 if(n!==attTrac) throw new Error('recherche « trac » : '+n+' au lieu de '+attTrac);
 if(/<h3>Jambes<\\/h3>/.test(html)) throw new Error('groupe vide non masque');
 libFilter('EPAULE');
 const nEp=(html.match(/class="exorow/g)||[]).length;
 if(!nEp) throw new Error('recherche insensible aux accents et a la casse en echec');
 libFilter('zzzz');
 if(!/Aucun exercice ne correspond/.test(html)) throw new Error('message vide absent');
 if((html.match(/class="exorow/g)||[]).length) throw new Error('lignes affichees malgre une recherche vide');
 libClear();
 if((html.match(/class="exorow/g)||[]).length!==Object.keys(DB).length) throw new Error('effacement de la recherche inoperant');
 go('lib');
 if(libQ!=='') throw new Error('la recherche survit a un changement d onglet');
 console.log('recherche OK : '+attTrac+' tractions, '+nEp+' resultats sur « EPAULE », vide gere, remise a zero a l entree');

 // 14. toutes les vues repondent encore
 await neuf();
 state.hist=[seance(ilY(1,1),[{id:fb,sets:[8,8],load:0,sw:true,from:org}]),seance(ilY(0,1))];
 ['home','lib','prog','set'].forEach(v=>{view=v;render();});
 Object.keys(DB).forEach(id=>showFiche(id));
 console.log('vues OK : accueil, bibliotheque, progres, reglages et '+Object.keys(DB).length+' fiches');
 console.log('TESTS V1.5 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
