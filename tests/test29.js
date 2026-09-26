/* test29 : lot v2.2. Avancement des badges non acquis avec son critere de
   selection, retrait du badge mort et prolongement de l echelle des semaines,
   plafond nomme de la liste des seances, volume reellement joue dans la card
   Couverture, format decimal unifie dans Progres, vignette de l exercice
   suivant sur l ecran de repos. */
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
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 /* une entree d historique posee a la main : la semaine ISO se choisit par le
    nombre de jours en arriere, les items portent des categories reelles */
 const seance=(joursAvant,items,extra)=>{
   const d=new Date(); d.setDate(d.getDate()-joursAvant);
   return Object.assign({date:d.toISOString(),type:'alterne',mode:'alterne',rounds:3,plan:15,xp:30,items:items},extra||{});
 };
 const it=(id,n)=>({id:id,sets:new Array(n).fill(8),load:0});

 /* ---------- 1. critere de selection de l avancement ---------- */
 await neuf();
 const AVEC=BADGES.filter(b=>badgeProg(b,state)!==null).map(b=>b.id);
 const SANS=BADGES.filter(b=>badgeProg(b,state)===null).map(b=>b.id);
 /* le critere est mecanique : un compteur et un seuil d au moins deux */
 BADGES.forEach(b=>{
   const a=badgeProg(b,state)!==null, c=(typeof b.prog==='function'&&b.seuil>=2);
   if(a!==c) throw new Error('avancement et critere divergent sur '+b.id);
 });
 if(SANS.join(',')!=='s1,w1,load,unlock1') throw new Error('les badges sans avancement doivent etre exactement les quatre a seuil 1 ou booleens : '+SANS.join(','));
 if(AVEC.length!==BADGES.length-4) throw new Error('avancement attendu sur tous les autres badges');
 /* un seuil de 1 ne produirait que 0/1, qui ne dit rien de plus que la ligne grisee */
 if(badgeProg({prog:()=>0,seuil:1},state)!==null) throw new Error('un seuil de 1 ne doit pas produire d avancement');
 if(badgeProg({seuil:5},state)!==null) throw new Error('un seuil sans compteur ne doit pas produire d avancement');
 console.log('critere OK : avancement sur '+AVEC.length+' badges, aucun sur les quatre a seuil 1 ('+SANS.join(', ')+')');

 /* ---------- 2. le compteur suit l etat et se borne au seuil ---------- */
 await neuf();
 const bId=b=>BADGES.filter(x=>x.id===b)[0];
 state.hist=[seance(30,[it('pompes-poignees',3)]),seance(29,[it('pompes-poignees',3)]),seance(28,[it('pompes-poignees',3)])];
 if(badgeProg(bId('s5'),state)!==3) throw new Error('s5 doit valoir 3/5');
 if(badgeProg(bId('s15'),state)!==3) throw new Error('s15 doit valoir 3/15');
 state.loadUps=2;
 if(badgeProg(bId('load5'),state)!==2) throw new Error('load5 doit valoir 2/5');
 /* bornage : un compteur au-dela du seuil, cas d un badge pas encore pose */
 state.loadUps=9;
 if(badgeProg(bId('load5'),state)!==5) throw new Error('le compteur doit etre borne au seuil');
 state.loadUps=-3;
 if(badgeProg(bId('load5'),state)!==0) throw new Error('le compteur ne descend pas sous zero');
 state.loadUps=0; state.xp=lvlThreshold(3);
 if(badgeProg(bId('lvl5'),state)!==lvlInfo(state.xp).lvl) throw new Error('lvl5 doit suivre le niveau');
 console.log('compteur OK : 3/5 seances, 2/5 paliers, borne au seuil et jamais negatif');

 /* ---------- 3. rendu : sur les non acquis seulement ---------- */
 await neuf();
 state.hist=[seance(30,[it('pompes-poignees',3)]),seance(29,[it('pompes-poignees',3)])];
 state.badges=['s1']; state.loadUps=3;
 view='prog'; render();
 const bd=html.split('data-k="prog-badges"')[1];
 if(!bd) throw new Error('card badges absente');
 const corps=bd.split('</summary>')[1].split('</details>')[0];
 if((corps.match(/class="badge/g)||[]).length!==BADGES.length) throw new Error('la card ouverte ne montre pas tous les badges');
 if((corps.match(/class="pg num"/g)||[]).length!==BADGES.length-4-0) throw new Error('un avancement par badge non acquis attendu, obtenu '+(corps.match(/class="pg num"/g)||[]).length);
 if(!/2\\/5</.test(corps)) throw new Error('« 2/5 » attendu sur Fondations');
 if(!/3\\/5</.test(corps)) throw new Error('« 3/5 » attendu sur Cinq paliers');
 /* s1 est acquis : il ne porte pas d avancement, et il n en portait pas non plus
    avant de l etre, son seuil valant 1 */
 const ligneS1=corps.split('Première étincelle')[1].split('</div></div>')[0];
 if(/class="pg num"/.test(ligneS1)) throw new Error('un badge acquis ne porte pas d avancement');
 /* une fois Fondations pose, son compteur disparait */
 state.badges=['s1','s5']; render();
 const corps2=html.split('data-k="prog-badges"')[1].split('</summary>')[1].split('</details>')[0];
 if((corps2.match(/class="pg num"/g)||[]).length!==BADGES.length-4-1) throw new Error('l avancement doit disparaitre du badge fraichement acquis');
 console.log('rendu OK : un avancement par badge non acquis, aucun sur les acquis ni sur les seuils a 1');

 /* ---------- 4. le badge mort est parti, l echelle des semaines est prolongee ---------- */
 await neuf();
 if(BADGES.some(b=>b.id==='mob5')) throw new Error('mob5 lisait type===mobilite, inatteignable depuis le retrait du mode cible');
 if(!BADGES.some(b=>b.id==='w12')) throw new Error('w12 doit prolonger l echelle des semaines');
 /* aucun badge ne lit plus le type de seance : toute seance s ecrit alterne */
 BADGES.forEach(b=>{ if(/mobilite|type===/.test(String(b.test))) throw new Error('un badge lit encore le type de seance : '+b.id); });
 /* w4 et w12 lisent le meme compteur, a deux seuils */
 const w4=bId('w4'), w12=bId('w12');
 if(w4.seuil!==4||w12.seuil!==12) throw new Error('seuils des badges de semaine');
 /* le badge est atteignable : douze semaines validees d affilee l ouvrent */
 state.goal=1; state.hist=[];
 for(let s=1;s<=13;s++) state.hist.push(seance(7*s,[it('pompes-poignees',3)]));
 if(weekStreak(state)<12) throw new Error('serie de 12 semaines non reconstituee, obtenu '+weekStreak(state));
 if(!w12.test(state)) throw new Error('w12 doit s ouvrir a 12 semaines d affilee');
 if(badgeProg(w12,state)!==12) throw new Error('l avancement de w12 doit atteindre son seuil');
 console.log('badges OK : mob5 retire, w12 atteignable, plus aucun badge ne lit le type de seance');

 /* ---------- 5. le plafond de la liste des seances est nomme ---------- */
 await neuf();
 state.hist=[]; for(let i=0;i<HIST_SHOWN+5;i++) state.hist.push(seance(40-i,[it('pompes-poignees',3)]));
 view='prog'; render();
 const sc=html.split('data-k="prog-seances"')[1].split('</details></details>')[0];
 const lignes=(sc.match(/XP<\\/span><\\/span><\\/summary>/g)||[]).length;
 if(lignes!==HIST_SHOWN) throw new Error(HIST_SHOWN+' seances attendues dans la liste, obtenu '+lignes);
 if(html.indexOf('Les '+HIST_SHOWN+' dernières.')<0) throw new Error('le plafond doit etre annonce dans la card');
 console.log('liste OK : '+HIST_SHOWN+' seances listees et annoncees, texte et coupe sur la meme constante');

 /* ---------- 6. volume reellement joue ---------- */
 await neuf();
 /* rien a mesurer tant qu aucune semaine n est revolue : la ligne suit les rails */
 state.hist=[seance(0,[it('pompes-poignees',3)])];
 if(playedVolume(state,4)!==null) throw new Error('aucune semaine revolue : rien a moyenner');
 if(coverage(state,4)!==null) throw new Error('temoin : coverage doit aussi valoir null');
 /* deux seances de la semaine derniere, quatre emplacements a trois series,
    plus un etirement et un module cardio qui ne doivent pas compter */
 await neuf();
 state.hist=[
  seance(7,[it('pompes-poignees',3),it('face-pulls',3),it('goblet-squat',3),it('planche',3),it('cardio-intervalles',1)]),
  seance(8,[it('pompes-poignees',2),it('face-pulls',2),it('goblet-squat',2),it('planche',2)])
 ];
 let pv=playedVolume(state,4);
 if(!pv||pv.n!==2) throw new Error('deux seances attendues dans la fenetre');
 if(pv.sets!==20) throw new Error('20 series de renforcement attendues, obtenu '+pv.sets+' : le cardio ne doit pas compter');
 if(pv.v!==2.5) throw new Error('2,5 series par exercice attendues, obtenu '+pv.v);
 /* un exercice bascule sur son repli produit deux entrees pour un emplacement :
    la somme reste juste, le denominateur ne bouge pas */
 await neuf();
 state.hist=[seance(7,[{id:'pompes-poignees',sets:[8],load:0},{id:'pompes-inclinees',sets:[8,8],load:0,sw:true,from:'pompes-poignees'},
   it('face-pulls',3),it('goblet-squat',3),it('planche',3)])];
 pv=playedVolume(state,4);
 if(pv.sets!==12||pv.v!==3) throw new Error('un repli ne change ni la somme ni le denominateur : '+JSON.stringify(pv));
 /* la fenetre est celle de coverage : une seance de la semaine en cours dehors */
 await neuf();
 state.hist=[seance(7,[it('pompes-poignees',3),it('face-pulls',3),it('goblet-squat',3),it('planche',3)]),
             seance(0,[it('pompes-poignees',1)])];
 pv=playedVolume(state,4);
 if(pv.n!==1||pv.sets!==12) throw new Error('la semaine en cours doit rester hors de la mesure');
 /* la ligne s affiche avec les rails, et pas avant */
 view='prog'; render();
 if(html.indexOf('Réellement joué')<0) throw new Error('la ligne doit apparaitre dans la card Couverture');
 if(html.indexOf('Réellement joué')<html.indexOf('Configuration actuelle')) throw new Error('la ligne doit se placer sous la projection');
 await neuf();
 state.hist=[seance(0,[it('pompes-poignees',3)])];
 view='prog'; render();
 if(html.indexOf('Réellement joué')>=0) throw new Error('aucune ligne tant qu aucune semaine n est revolue');
 console.log('volume OK : 2,5 series par exercice sur 2 seances, cardio et etirements exclus, repli neutre, meme fenetre que les rails');

 /* ---------- 7. format decimal unifie dans Progres ---------- */
 await neuf();
 state.goal=1;
 /* deux semaines revolues distinctes, dont une seule porte la quatrieme serie
    de face pulls : la moyenne du tire tombe sur une decimale */
 state.hist=[seance(14,[it('pompes-poignees',3),it('face-pulls',3),it('goblet-squat',3),it('planche',3)]),
             seance(7,[it('pompes-poignees',3),it('face-pulls',4),it('goblet-squat',3),it('planche',3)])];
 view='prog'; render();
 if(coverage(state,4).pull!==3.5) throw new Error('temoin : le tire doit valoir 3,5, obtenu '+coverage(state,4).pull);
 /* deux formateurs portent deja la virgule, fmtNum et fmtDur ; Progres etait le
    seul endroit qui affichait des decimales sans passer par eux */
 if(fmtNum(2.5)!=='2,5') throw new Error('fmtNum doit rendre la virgule');
 const zone=html.split('Assiduité')[1].split('data-k="prog-replis"')[0];
 const pointus=zone.match(/>\\d+\\.\\d+</g);
 if(pointus) throw new Error('decimale au point dans Progres : '+pointus.join(' '));
 if(!/3,5</.test(zone)) throw new Error('la couverture du tire doit s afficher 3,5');
 console.log('format OK : plus aucune decimale au point dans Assiduite et Couverture');

 /* ---------- 8. vignette de l exercice suivant ---------- */
 await neuf();
 startSession();
 const repos=cur.steps.filter(s=>s.k==='rest');
 if(!repos.length) throw new Error('aucune transition dans la seance');
 repos.forEach(s=>{
   const h=restHtml(s);
   if(h.indexOf('class="nextexo"')<0) throw new Error('vignette absente d un ecran de repos');
   if(h.indexOf(esc(DB[s.next].nom))<0) throw new Error('le nom du suivant doit rester');
   if(!/<img src="data:image/.test(h)) throw new Error('illustration absente de la vignette');
   /* inerte : un lien vers la fiche ferait quitter une seance en cours */
   /* le base64 de l illustration est retire avant inspection : il contient
      n importe quelle suite de lettres, « kg » compris */
   const vg=h.split('class="nextexo"')[1].split('</div>')[0].replace(/src="[^"]*"/g,'src=""');
   if(/onclick/.test(vg)) throw new Error('la vignette ne doit pas etre cliquable');
   /* elle annonce, elle ne prescrit pas */
   if(/ kg|élastique|reps|Cible/.test(vg)) throw new Error('la vignette ne porte ni charge ni cible : '+vg);
 });
 /* elle suit la bascule de repli et le retour, comme le libelle */
 let ir=cur.steps.findIndex(s=>s.k==='rest');
 let cible=cur.steps[ir].next, fb=fbOf(cible);
 if(fb){
   cur.i=cur.steps.findIndex((s,i)=>i>ir&&s.k==='set'&&s.id===cible);
   swapPain();
   if(cur.steps[ir].next!==fb) throw new Error('le repos doit annoncer le repli');
   if(restHtml(cur.steps[ir]).indexOf(esc(DB[fb].nom))<0) throw new Error('la vignette doit suivre le repli');
   revertSwap();
   if(cur.steps[ir].next!==cible) throw new Error('le repos doit revenir a l origine');
   if(restHtml(cur.steps[ir]).indexOf(esc(DB[cible].nom))<0) throw new Error('la vignette doit suivre le retour');
 }
 /* un identifiant sans illustration retombe sur le gabarit, jamais sur du vide */
 if(nextExoHtml(null)!=='') throw new Error('pas de vignette sans suivant');
 console.log('vignette OK : sur les '+repos.length+' transitions, inerte, sans prescription, suit repli et retour');

 console.log('TESTS LOT V2.2 OK');
})();
`;
eval(src+T);
