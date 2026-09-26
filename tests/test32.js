// Lot v2.6 : series deja faites aujourd hui sur la vignette de l ecran de
// repos, et pose unique de next / nextKey par relinkRests.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; };
 /* on joue le chemin reel : une serie chiffree se valide a sa cible, une tenue
    recoit ses mesures par holdInit puis se valide. Rien n est ecrit a la main
    dans cur.log, sans quoi la suite fabriquerait son sujet. */
 const jouer=()=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   const e=DB[st.id];
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else if(e.mode==='stretch'){ skipSet(); return true; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 /* la vignette d un repos, base64 de l illustration retire */
 const vign=s=>restHtml(s).split('class="nextexo"')[1].split('</div>')[0].replace(/src="[^"]*"/g,'src=""');
 /* invariant central : ce que la vignette montre est exactement ce que le
    journal contient pour le pas de travail suivant, et exactement ce que la
    pastille de l ecran de serie montre pour ce meme pas. */
 const controle=(ou)=>{
   let vus=0, avec=0;
   cur.steps.forEach((s,i)=>{
     if(s.k!=='rest') return;
     vus++;
     const nx=nextWork(cur.steps,i);
     if(!nx) throw new Error(ou+' : un repos sans pas de travail suivant');
     if(s.next!==nx.id) throw new Error(ou+' : next divergent du pas suivant');
     if(s.nextKey!==(nx.key||nx.id)) throw new Error(ou+' : nextKey divergent de la cle du pas suivant');
     const attendu=cur.log[nx.key||nx.id]||[];
     const v=vign(s);
     if(!attendu.length){
       if(v.indexOf('class="jour"')>=0) throw new Error(ou+' : rien de fait aujourd hui, la vignette ne doit rien porter');
       return;
     }
     avec++;
     if(v.indexOf('class="jour"')<0) throw new Error(ou+' : series du jour absentes de la vignette');
     if(v.indexOf(setsHtml(attendu))<0) throw new Error(ou+' : liste attendue '+attendu.join('/')+', vignette '+v);
     if(v.indexOf("Aujourd'hui")<0) throw new Error(ou+' : le libelle doit etre celui de l ecran de serie');
     if(nx.k==='set'&&setHtml(nx).indexOf(setsHtml(attendu))<0) throw new Error(ou+' : les deux ecrans doivent porter la meme liste');
   });
   return {vus:vus,avec:avec};
 };

 /* ---------- 1. rien avant le premier passage, puis la liste croit ---------- */
 await neuf(4);
 startSession();
 const r0=cur.steps.filter(s=>s.k==='rest');
 if(r0.length!==15) throw new Error('quinze transitions attendues a quatre series, '+r0.length);
 const c=controle('au lancement');
 if(c.avec!==0) throw new Error('aucune serie faite au lancement, aucune vignette ne doit porter de liste');
 const par=cur.exos.length;
 /* deroule pas a pas : ce qui compte est ce que l ecran montre au moment ou on
    le traverse, pas ce que la liste dirait apres coup. Les trois premieres
    transitions precedent un exercice jamais joue du jour, toutes les autres un
    exercice deja joue : 4R-4 vignettes chargees sur 4R-1 transitions. */
 let nus=0, charges=0, maxVal=0, garde=0;
 /* on s arrete avant la derniere etape : endSession est asynchrone et sa
    resolution tomberait apres le rechargement d etat de la section suivante */
 while(cur.i<cur.steps.length-1&&garde++<200){
   const st=cur.steps[cur.i];
   if(st.k==='rest'){
     const attendu=cur.log[st.nextKey]||[];
     const v=vign(st);
     if(attendu.length){ charges++; maxVal=Math.max(maxVal,attendu.length);
       if(v.indexOf(setsHtml(attendu))<0) throw new Error('liste absente de la vignette traversee'); }
     else { nus++;
       if(v.indexOf('class="jour"')>=0) throw new Error('vignette chargee avant le premier passage du jour'); }
     controle('transition '+(nus+charges));
   }
   if(!jouer()) break;
 }
 if(nus!==3) throw new Error('trois transitions nues attendues au premier tour, '+nus);
 if(charges!==12) throw new Error('douze transitions chargees attendues a quatre series, '+charges);
 /* trois valeurs au maximum : le volume plafonne a quatre series */
 if(maxVal!==3) throw new Error('au plus trois valeurs sur une vignette, vu '+maxVal);
 console.log('vignette OK : '+nus+' transitions nues puis '+charges+' chargees, liste identique a la pastille de l ecran de serie, '+maxVal+' valeurs au plus');

 /* ---------- 2. la cle lue est nextKey, jamais l identifiant ---------- */
 await neuf(3);
 startSession();
 /* on cherche un emplacement chiffre qui porte un repli realisable */
 let cible=null;
 cur.exos.forEach(id=>{ if(!cible&&fbOf(id)&&DB[id].mode!=='time'&&DB[id].mode!=='stretch') cible=id; });
 if(!cible) throw new Error('aucun exercice chiffre avec repli dans ce tirage');
 const fb=fbOf(cible);
 /* un tour complet pour remplir le journal de l origine */
 for(let k=0;k<par*2;k++) jouer();
 const iOrig=cur.steps.findIndex(s=>s.k==='rest'&&s.next===cible);
 if(iOrig<0) throw new Error('aucun repos n annonce l exercice cible');
 const listeOrig=(cur.log[cible]||[]).slice();
 if(!listeOrig.length) throw new Error('le journal de l origine doit etre rempli');
 if(vign(cur.steps[iOrig]).indexOf(setsHtml(listeOrig))<0) throw new Error('la vignette doit porter les series de l origine');
 /* bascule sur le repli : la vignette suit, et n a plus rien a montrer tant
    qu aucune serie n a ete jouee sous la cle « origine>repli » */
 cur.i=cur.steps.findIndex((s,i)=>i>iOrig&&s.k==='set'&&s.id===cible);
 if(cur.i<0) throw new Error('aucune serie a venir sur l exercice cible');
 swapPain();
 const iRep=cur.steps.findIndex(s=>s.k==='rest'&&s.next===fb);
 if(iRep<0) throw new Error('aucun repos n annonce le repli');
 if(cur.steps[iRep].nextKey!==cible+'>'+fb) throw new Error('nextKey doit porter la cle de repli');
 const vRep=vign(cur.steps[iRep]);
 if(vRep.indexOf('class="jour"')>=0) throw new Error('aucune serie sous la cle de repli : la vignette doit rester nue');
 if(vRep.indexOf(setsHtml(listeOrig))>=0) throw new Error('la vignette ne doit pas montrer les series de l origine sous le repli');
 /* une serie jouee sur le repli remplit sa propre cle */
 jouer();
 const listeRep=(cur.log[cible+'>'+fb]||[]).slice();
 if(!listeRep.length) throw new Error('le journal du repli doit etre rempli');
 const iRep2=cur.steps.findIndex(s=>s.k==='rest'&&s.next===fb);
 if(iRep2>=0&&vign(cur.steps[iRep2]).indexOf(setsHtml(listeRep))<0) throw new Error('la vignette doit porter les series du repli');
 controle('sous repli');
 /* retour a l origine : on retrouve la liste de l origine, celle du repli reste au journal */
 revertSwap();
 const iRet=cur.steps.findIndex(s=>s.k==='rest'&&s.next===cible);
 if(iRet>=0){
   if(cur.steps[iRet].nextKey!==cible) throw new Error('nextKey doit revenir a l identifiant');
   if(vign(cur.steps[iRet]).indexOf(setsHtml(cur.log[cible]))<0) throw new Error('la vignette doit revenir aux series de l origine');
 }
 controle('apres retour');
 console.log('cle OK : la vignette lit nextKey, le repli ne montre pas les series de l origine et inversement');

 /* ---------- 3. next et nextKey ont un seul point de pose ---------- */
 await neuf(3);
 startSession();
 controle('construction');
 /* changement de volume : les transitions recomposees portent les deux champs */
 for(let k=0;k<par+1;k++) jouer();
 setSessionRounds(4);
 if(cur.steps.filter(s=>s.k==='rest').length!==15) throw new Error('quinze transitions apres montee a quatre');
 controle('apres changement de volume');
 setSessionRounds(2);
 controle('apres descente de volume');
 /* aucun repos ne survit sans ses deux champs, et le dernier pas n est pas un repos */
 cur.steps.forEach(s=>{ if(s.k==='rest'&&(!s.next||!s.nextKey)) throw new Error('un repos sans next ou sans nextKey'); });
 if(cur.steps[cur.steps.length-1].k==='rest') throw new Error('pas de transition apres la derniere serie');
 /* la pose se fait dans relinkRests et nulle part ailleurs : on efface les deux
    champs et un seul appel les restitue tous */
 cur.steps.forEach(s=>{ if(s.k==='rest'){ delete s.next; delete s.nextKey; } });
 relinkRests();
 controle('apres relink seul');
 console.log('pose OK : construction, changement de volume et relink donnent les memes next et nextKey');

 /* ---------- 4. seance allegee : la vignette lit le journal, elle ne calcule rien ---------- */
 await neuf(3);
 lightMode=true;
 startSession();
 if(!cur.light) throw new Error('la seance doit etre allegee');
 for(let k=0;k<par*2;k++) jouer();
 const c4=controle('seance allegee');
 if(!c4.avec) throw new Error('la seance allegee doit charger des vignettes comme les autres');
 /* la substitution du mode allege ecrit une cle « origine>repli » : la vignette
    la suit sans avoir a connaitre le mode */
 cur.steps.forEach((s,i)=>{ if(s.k!=='rest') return;
   const nx=nextWork(cur.steps,i);
   if(nx.swapped&&s.nextKey.indexOf('>')<0) throw new Error('une substitution doit porter une cle composee'); });
 lightMode=false;
 console.log('allegee OK : '+c4.avec+' vignettes chargees sur '+c4.vus+' transitions, cles de substitution suivies');

 /* ---------- 5. la vignette n a pas gagne de prescription ---------- */
 await neuf(3);
 startSession();
 for(let k=0;k<par*2;k++) jouer();
 cur.steps.forEach((s,i)=>{ if(s.k!=='rest') return;
   const v=vign(s);
   if(/ kg|élastique|Cible|Fourchette|Dernière fois/.test(v)) throw new Error('la vignette ne prescrit pas : '+v);
   if(/onclick/.test(v)) throw new Error('la vignette reste inerte');
   const nx=nextWork(cur.steps,i), p=perfFor(nx.id,!!nx.light), e=DB[nx.id];
   /* la cible ne doit pas apparaitre comme telle : on la cherche isolee dans le
      bloc, hors de la liste du journal */
   const sansListe=v.replace(/<b class="num">[^<]*(<i class="sl">\\/<\\/i>[^<]*)*<\\/b>/g,'');
   if(e.reps&&new RegExp('>'+(p.target||rangeOf(p,e)[0])+'<').test(sansListe)) throw new Error('la cible ne doit pas figurer sur l ecran de repos');
 });
 console.log('frontiere OK : la vignette annonce, elle ne prescrit toujours pas');

 console.log('TESTS LOT V2.6 OK');
})();
`;
eval(src+T);
