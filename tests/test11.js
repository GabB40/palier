// Nouveautes v1.8 : mode seance allegee (substitution des replis, cible a -30 %
// avec debordement sur la charge, gel de la progression dans les deux sens,
// exclusion du capteur de douleur, non-persistance), lien vers la fiche de
// repli, cards repliables de l onglet Progres.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=4; };
 await neuf();
 // 1. calcul de la cible allegee : -30 % arrondi a l inferieur, plancher au bas de fourchette
 lightMode=true;
 const p1=perfOf('pompes-inclinees'); p1.target=16; p1.range=[8,20];
 if(lightPerf('pompes-inclinees').target!==11) throw new Error('16 -> 11 attendu, obtenu '+lightPerf('pompes-inclinees').target);
 const pl=perfOf('planche'); pl.target=45; pl.range=[20,60];
 if(lightPerf('planche').target!==30) throw new Error('tenue 45 s -> 30 s attendu, obtenu '+lightPerf('planche').target);
 console.log('cible allegee OK : 16 reps -> 11, tenue 45 s -> 30 s (arrondi au multiple de 5)');
 // 2. debordement sur la charge quand le -30 % passerait sous le bas de fourchette
 const pe=perfOf('elevations-laterales'); pe.target=14; pe.range=[12,20]; pe.load=4;
 const le=lightPerf('elevations-laterales');
 if(le.target!==12) throw new Error('cible attendue au bas de fourchette (12), obtenue '+le.target);
 if(!(le.load<=4*0.8+1e-9)) throw new Error('charge attendue a -20 % au moins, obtenue '+le.load);
 if(!le.loadCut||!le.repsCut) throw new Error('marqueurs de coupe absents');
 const pf=perfOf('face-pulls'); pf.target=12; pf.range=[10,18]; pf.band='rouge';
 const lf=lightPerf('face-pulls');
 if(lf.target!==10||lf.band!=='jaune') throw new Error('face pulls : attendu 10 reps en jaune, obtenu '+lf.target+' en '+lf.band);
 console.log('debordement OK : elevations 14@4 kg -> 12@'+le.load+' kg, face pulls 12 rouge -> 10 jaune');
 // 3. rien a faire quand on est deja en bas de fourchette au barreau le plus facile
 const pb=perfOf('face-pulls'); pb.target=10; pb.range=[10,18]; pb.band='jaune';
 const lb=lightPerf('face-pulls');
 if(lb.target!==10||lb.band!=='jaune'||lb.repsCut||lb.loadCut) throw new Error('plancher : rien ne doit bouger');
 console.log('plancher OK : bas de fourchette au barreau le plus facile, aucun changement');
 // 4. l etat n est jamais touche par la lecture allegee
 const avant=JSON.stringify(state.perf['elevations-laterales']);
 perfFor('elevations-laterales'); lightPerf('elevations-laterales');
 if(JSON.stringify(state.perf['elevations-laterales'])!==avant) throw new Error('perfFor a modifie l etat');
 if(perfFor('elevations-laterales').load===perfOf('elevations-laterales').load) throw new Error('perfFor ne reflete pas l allegement');
 lightMode=false;
 if(perfFor('elevations-laterales').load!==perfOf('elevations-laterales').load) throw new Error('hors mode allege, perfFor doit valoir perfOf');
 console.log('lecture OK : copie allegee en mode allege, etat intact, perfOf sinon');
 // 5. substitution des replis a la construction, et materiel qui suit
 await neuf();
 const normal=buildSession();
 lightMode=true;
 const allege=buildSession();
 if(!allege.light||normal.light) throw new Error('marque light absente du plan');
 const subs=allege.exos.filter((id,i)=>id!==allege.orig[i]);
 allege.exos.forEach((id,i)=>{ const o=allege.orig[i]; if(DB[o].fb&&id!==DB[o].fb) throw new Error('repli non applique sur '+o); if(!DB[o].fb&&id!==o) throw new Error('substitution indue sur '+o); });
 if(!subs.length) throw new Error('aucune substitution alors que le vivier pousse en a toujours une');
 const stepsSub=allege.steps.filter(s=>s.k==='set'&&s.light);
 if(!stepsSub.length||!stepsSub.every(s=>s.from&&s.key===s.from+'>'+s.id&&s.swapped)) throw new Error('marquage des etapes substituees incorrect');
 console.log('substitution OK : '+subs.length+' emplacement(s) replie(s), etapes marquees, materiel recalcule');
 // 6. aucun repli ne peut tomber sur un exercice verrouille
 Object.keys(DB).forEach(id=>{ if(DB[id].fb&&DB[DB[id].fb].lock) throw new Error('repli verrouillable : '+id); });
 console.log('replis OK : aucune cible de repli n est verrouillable');
 // 7. gel de la progression dans les deux sens
 await neuf(); lightMode=true;
 startSession(); if(cur.phase==='warm') skipWarm();
 const avantPerf=JSON.parse(JSON.stringify(state.perf));
 const idxAvant=JSON.parse(JSON.stringify(state.slotIdx)), stretchAvant=state.stretchIdx;
 let garde=0;
 while(view==='session'&&garde++<400){
   const st=cur.steps&&cur.steps[cur.i]; if(!st) break;
   /* on valide au haut de fourchette : en seance normale ces lectures feraient
      monter la cible, ici rien ne doit bouger */
   if(st.k==='set'){ const e=DB[st.id]; TVAL(st,(e.mode==='stretch')?1:(perfOf(st.id).range?perfOf(st.id).range[1]:30)); }
   else nextStep();
 }
 await new Promise(r=>setTimeout(r,20));
 if(view!=='recap') throw new Error('seance non terminee, vue '+view);
 Object.keys(avantPerf).forEach(id=>{
   const a=avantPerf[id], b=state.perf[id];
   if(a.target!==b.target) throw new Error('cible modifiee sur '+id+' : '+a.target+' -> '+b.target);
   if(a.load!==b.load) throw new Error('charge modifiee sur '+id);
   if(a.band!==b.band) throw new Error('bande modifiee sur '+id);
 });
 const last=state.hist[state.hist.length-1];
 if(!last.light) throw new Error('seance non marquee allegee dans l historique');
 if(!last.items.some(it=>it.sets&&it.sets.length)) throw new Error('performances non enregistrees');
 if(!state.hist.length||thisWeekCount(state)<1) throw new Error('la seance allegee doit compter comme jour actif');
 console.log('gel OK : hautes performances validees, aucune cible ni charge ne bouge, seance comptee');
 // 8. le mode ne survit pas a la seance
 if(lightMode) throw new Error('mode allege encore actif apres la seance');
 cur=null; view='home'; render();
 if(/flamebtn/.test(html)) throw new Error('bouton encore en etat actif sur l accueil');
 console.log('non-persistance OK : mode remis a zero en fin de seance');
 // 9. la rotation ne consomme pas de tour sur une seance allegee
 if(JSON.stringify(state.slotIdx)!==JSON.stringify(idxAvant)) throw new Error('rotation avancee sur une seance allegee : '+JSON.stringify(state.slotIdx));
 if(state.stretchIdx===stretchAvant&&state.stretch) throw new Error('rotation des etirements figee a tort');
 /* la meme seance jouee normalement doit, elle, faire avancer la rotation */
 await neuf(); lightMode=false;
 const idx2=JSON.parse(JSON.stringify(state.slotIdx));
 startSession(); if(cur.phase==='warm') skipWarm();
 let g2=0;
 while(view==='session'&&g2++<400){
   const st=cur.steps&&cur.steps[cur.i]; if(!st) break;
   if(st.k==='set'){ const e=DB[st.id]; TVAL(st,(e.mode==='stretch')?1:(perfOf(st.id).range?perfOf(st.id).range[1]:30)); }
   else nextStep();
 }
 await new Promise(r=>setTimeout(r,20));
 if(SLOT_ORDER.some(sl=>state.slotIdx[sl]!==(idx2[sl]||0)+1)) throw new Error('rotation non avancee sur une seance normale');
 /* les etirements, eux, avancent meme sous seance allegee */
 await neuf(); lightMode=true;
 const st0=state.stretchIdx||0;
 startSession(); if(cur.phase==='warm') skipWarm();
 let g3=0;
 while(view==='session'&&g3++<400){
   const st=cur.steps&&cur.steps[cur.i]; if(!st) break;
   if(st.k==='set'){ const e=DB[st.id]; TVAL(st,(e.mode==='stretch')?1:(perfOf(st.id).range?perfOf(st.id).range[1]:30)); }
   else nextStep();
 }
 await new Promise(r=>setTimeout(r,20));
 if(state.stretchIdx===st0&&state.stretch!==false) throw new Error('la rotation des etirements a gele sous seance allegee');
 console.log('rotation OK : figee en allege, avancee en seance normale, etirements toujours avances');
 // 10. les substitutions volontaires ne polluent pas le capteur de douleur
 if(painSwaps(state,4).length) throw new Error('les replis volontaires comptent dans le capteur de douleur');
 state.hist[state.hist.length-1].light=false;
 if(!painSwaps(state,4).length) throw new Error('sans la marque, les replis devraient compter');
 state.hist[state.hist.length-1].light=true;
 console.log('capteur OK : replis volontaires exclus, replis douleur toujours comptes');
 // 11. accueil : bouton, ordre, bandeau, tags du detail
 await neuf(); view='home'; render();
 if(html.indexOf('Changer de séance')>=0) throw new Error('le bouton de saut de seance survit');
 const iLan=html.indexOf('Lancer la séance'), iAlg=html.indexOf('Séance allégée');
 if(iLan<0||iAlg<0||iLan>iAlg) throw new Error('ordre des boutons : Lancer doit preceder Séance allégée');
 if(/flamebtn/.test(html)) throw new Error('bouton actif alors que le mode est inactif');
 toggleLight();
 if(!/flamebtn/.test(html)) throw new Error('bouton non mis en evidence a l activation');
 if(!/cibles réduites/.test(html)) throw new Error('bandeau absent de l en-tete de seance');
 /* le tag de chaque ligne doit correspondre a ce que le moteur a reellement fait */
 const plan2=buildSession();
 let nRep=0,nCib=0;
 plan2.exos.forEach((id,i)=>{
   const org=plan2.orig[i], p=perfFor(id,org!==id);
   if(org!==id){ nRep++; if(html.indexOf('repli de '+DB[org].nom)<0) throw new Error('tag de repli absent pour '+org); }
   else if(p.repsCut||p.loadCut){ nCib++; if(html.indexOf('cible allégée')<0) throw new Error('tag de cible allegee absent pour '+id); }
   if(org!==id&&(p.repsCut||p.loadCut)) throw new Error('double allegement sur '+id+' : substitue ET cible reduite');
 });
 if(!nRep) throw new Error('aucun repli applique alors que le vivier pousse en a toujours un');
 /* et un cas de cible allegee force, en remontant une cible au-dessus du bas de fourchette */
 const sans=plan2.exos.find((id,i)=>plan2.orig[i]===id);
 if(sans){ const q=perfOf(sans); q.target=Math.min(q.range[1],q.range[0]+5); render();
   if(html.indexOf('cible allégée')<0) throw new Error('tag de cible allegee absent apres remontee de cible'); }
 toggleLight();
 if(/flamebtn/.test(html)) throw new Error('bouton toujours actif apres seconde bascule');
 console.log('accueil OK : bascule, mise en evidence, bandeau et tags par ligne');
 // 12. lien vers la fiche de repli
 showFiche('pompes-poignees','lib');
 if(!/Variante de repli/.test(html)) throw new Error('bloc de repli absent de la fiche');
 if(html.indexOf(DB[DB['pompes-poignees'].fb].nom)<0) throw new Error('repli non nomme');
 if(!/showFiche\\('pompes-inclinees'/.test(html)) throw new Error('lien vers la fiche de repli absent');
 if(!/Support stable/.test(html)) throw new Error('materiel du repli absent');
 showFiche('planche-genoux','lib');
 if(/Variante de repli/.test(html)) throw new Error('bloc affiche sur un exercice sans repli');
 console.log('fiche OK : repli nomme, materiel annonce, lien fonctionnel, absent quand il n y a pas de repli');
 // 13. Progres : ce qui reste ouvert, ce qui se replie, alerte qui force l ouverture
 const jour=new Date().toISOString();
 state.hist=[{date:jour,dur:20,xp:12,mode:'alterne',real:1100,items:[{id:'pompes-poignees',sets:[10,10]}]}];
 state.perf['pompes-poignees']={sets:[10,10],target:10,range:[5,12],load:0,best:10,date:jour};
 view='prog'; render();
 const ouverte=t=>new RegExp('<div class="card"><h3>'+t).test(html);
 const repliee=t=>new RegExp('<details class="card"[^>]*><summary><span class="ttl">'+t).test(html);
 if(!ouverte('Assiduité')||!ouverte('Couverture musculaire')) throw new Error('Assiduite et Couverture doivent rester ouvertes');
 ['Dernières séances','Temps d\\'entraînement','Repères par exercice','Badges'].forEach(t=>{ if(!repliee(t)) throw new Error('card non repliable : '+t); });
 if(!/<span class="ttl">Niveau/.test(html)&&!/<h3>Niveau/.test(html)) throw new Error('card Niveau absente');
 if(/<details class="card"[^>]*><summary><span class="ttl">Niveau/.test(html)) throw new Error('Niveau ne doit pas etre repliable');
 console.log('Progres OK : Assiduite et Couverture ouvertes, le reste replie, Niveau non repliable');
 // alerte de replis douleur : la card s ouvre d office
 const j=jour;
 state.hist=[{date:j,dur:20,items:[{id:'pompes-inclinees',sets:[8],sw:true,from:'pompes-poignees'}]},
             {date:j,dur:20,items:[{id:'pompes-inclinees',sets:[8],sw:true,from:'pompes-poignees'}]}];
 view='prog'; render();
 if(!/<details class="card" data-k="prog-replis" open><summary><span class="ttl">Replis douleur/.test(html)) throw new Error('la card Replis doit s ouvrir quand l alerte est franchie');
 state.hist=[{date:j,dur:20,items:[{id:'pompes-inclinees',sets:[8],sw:true,from:'pompes-poignees'}]},
             {date:j,dur:20,items:[{id:'pompes-poignees',sets:[8]}]},
             {date:j,dur:20,items:[{id:'pompes-poignees',sets:[8]}]}];
 view='prog'; render();
 if(!/<details class="card" data-k="prog-replis"><summary><span class="ttl">Replis douleur/.test(html)) throw new Error('sans alerte, la card Replis doit rester fermee');
 console.log('alerte OK : Replis ouverte d office au-dela d une fois sur deux, fermee sinon');
 console.log('TESTS V1.9 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
