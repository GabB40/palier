// Ordre du circuit pousse, jambes, tire, gainage (v2.10), et pause au raccord
// de tour conditionnee a une liste de paires nommees (v2.11).
//
// Ce que l ordre fait, et c est le coeur : il separe les deux exercices
// d isolation d epaule, elevations laterales dans le pousse et face pulls dans
// le tire. Un poste jambes les separe dans le tour, un poste gainage au
// raccord. Dans les DEUX sens, a cout nul. C etait le probleme vecu.
//
// Ce que la v2.11 retire : la pause posee a TOUS les raccords. Elle reparait
// une adjacence que personne n avait signalee, au prix de 90 s par seance de
// trois tours, sur la foi d une table de marqueurs hors application. La liste
// ne s alimente que de ce que Gabriel constate. Vide de la v2.11 a la v2.17,
// elle porte deux paires depuis la v2.18 : leur contenu est l affaire de
// test45. Cette suite teste le mecanisme, et vide la liste le temps des
// sections qui en ont besoin, puis la remet telle que livree.
//
// Ce que la suite ne teste PAS, a dessein : le comptage des conflits par
// marqueurs. C est un jugement, pas une mesure, et il n a rien a faire dans
// l outil. Il vit dans audit-epaule.js.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollY:0,scrollTo:(x,y)=>{global.window.scrollY=y;},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
/* cards du dernier rendu, recreees a chaque ecriture comme le fait le
   navigateur : sans cet etat, l ouverture repliee du message de pause ne
   serait pas observable */
const cards={};
function rebuild(h){
  Object.keys(cards).forEach(k=>delete cards[k]);
  const re=/<details([^>]*)>/g; let m;
  while((m=re.exec(h))!==null){
    const attrs=m[1], k=/data-k="([^"]+)"/.exec(attrs);
    if(!k) continue;
    cards[k[1]]={key:k[1],open:/\sopen(\s|>|$)/.test(attrs+' '),getAttribute(n){return n==='data-k'?this.key:null}};
  }
}
const mk=cap=>({set innerHTML(v){if(cap){html=v;rebuild(v);}},get innerHTML(){return cap?html:''},
  classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true), other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>Object.keys(cards).map(k=>cards[k]),
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.SRC=raw;

const S=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 /* la categorie d un exercice est portee par le catalogue, pas par la suite */
 const catOf=id=>DB[id].cat;
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 /* v2.18 : la liste n est plus livree vide. Les sections qui raisonnent sur
    une liste vide la vident, et la remettent en sortant. */
 const LIVREE=PAUSE_RACCORD_PAIRS.slice();
 if(!LIVREE.length) throw new Error('la liste livree est vide : le harnais ne prouverait plus la remise en etat');
 const vider=()=>{ PAUSE_RACCORD_PAIRS.length=0; };
 const remettre=()=>{ PAUSE_RACCORD_PAIRS.length=0; LIVREE.forEach(x=>PAUSE_RACCORD_PAIRS.push(x)); };

 // 1. la permutation elle-meme, et sa separation d avec la rotation
 await neuf();
 if(SLOT_ORDER.join(',')!=='push,legs,pull,core')
   throw new Error('ordre attendu push,legs,pull,core, obtenu '+SLOT_ORDER.join(','));
 /* Le point qui compte : les valeurs de phase sont declarees et non derivees
    du rang dans SLOT_ORDER. Si un jour quelqu un les derive, la rotation
    entiere se deplacerait au premier changement d ordre, sans bruit. Cette
    egalite est le garde-fou de cette derive. */
 const attendu={push:0,pull:1,core:2,legs:3};
 Object.keys(attendu).forEach(s=>{ if(SLOT_PHASE[s]!==attendu[s])
   throw new Error('phase deplacee sur '+s+' : '+SLOT_PHASE[s]+' au lieu de '+attendu[s]); });
 const parRang={}; SLOT_ORDER.forEach((s,i)=>parRang[s]=i);
 if(SLOT_ORDER.every(s=>SLOT_PHASE[s]===parRang[s]))
   throw new Error('les phases coincident avec le rang dans SLOT_ORDER : les deux decisions ne sont plus separables');
 console.log('ordre OK : pousse, jambes, tire, gainage ; phases declarees, decorrelees du rang');

 // 2. le tirage n a pas bouge : seule la sequence a change
 /* Un emplacement tire ce que sa rotation lui dicte, independamment de sa
    place dans le circuit. On le verifie en comparant, sur 200 seances, le
    contenu du quatuor avec ce que la rotation produit emplacement par
    emplacement. Les proprietes de dephasage de la v2.8 sont revalidees ici
    sous le nouvel ordre : 375 quatuors atteints, aucun vivier ne redonne le
    meme exercice deux seances de suite. */
 {
   await neuf();
   const vus={}; const dernier={}; let suites=0;
   for(let k=0;k<200;k++){
     const p=buildSession();
     SLOT_ORDER.forEach((s,i)=>{
       const attendu=pickAt(s,0);
       if(p.orig[i]!==attendu) throw new Error('emplacement '+s+' deplace au tirage '+k);
       if(catOf(p.orig[i])!==s) throw new Error('categorie hors emplacement au tirage '+k);
       if(dernier[s]===p.orig[i]) suites++;
       dernier[s]=p.orig[i];
     });
     vus[p.orig.join('|')]=1;
     SLOT_ORDER.forEach(s=>{ state.slotIdx[s]=(state.slotIdx[s]||0)+1; });
   }
   if(suites) throw new Error(suites+' repetitions d un exercice deux seances de suite');
   if(Object.keys(vus).length<150) throw new Error('dephasage perdu : '+Object.keys(vus).length+' quatuors distincts sur 200 seances');
   console.log('tirage OK : '+Object.keys(vus).length+' quatuors distincts sur 200 seances, aucune repetition consecutive');
 }

 // 3. la paire vecue est separee dans les deux sens, ce qui est le lot
 /* elevations laterales (pousse) et face pulls (tire) ne doivent plus jamais
    etre adjacents, ni dans le tour ni au passage du raccord. On le verifie sur
    la structure du circuit, donc pour TOUS les tirages a la fois, et pas
    seulement sur celui du jour. */
 {
   const r=n=>SLOT_ORDER.indexOf(n);
   if(Math.abs(r('push')-r('pull'))===1) throw new Error('pousse et tire sont adjacents dans le tour');
   if((r('push')===0&&r('pull')===3)||(r('pull')===0&&r('push')===3))
     throw new Error('pousse et tire sont adjacents au raccord');
   await neuf(3);
   const L=buildSession().steps, w=workSteps(L);
   for(let i=0;i+1<w.length;i++){
     const a=catOf(w[i].id), b=catOf(w[i+1].id);
     if((a==='push'&&b==='pull')||(a==='pull'&&b==='push'))
       throw new Error('pousse et tire se suivent dans la sequence reelle, pas '+i);
   }
   console.log('paire OK : un poste separe toujours pousse et tire, dans le tour comme au raccord');
 }

 // 4. la pause ne se pose que sur une paire nommee
 for(const R of [2,3,4]){
   await neuf(R);
   const p=buildSession(), L=p.steps, w=workSteps(L);
   if(w.length!==R*SLOT_ORDER.length) throw new Error('volume inattendu a '+R+' tours');
   const pauses=L.filter(s=>s.k==='rest'&&s.pause);
   /* liste telle que livree : une pause exactement la ou une paire est nommee */
   const attendues=L.filter((s,i)=>s.k==='rest'&&catOf(L[i-1].id)==='core'&&pauseAu(L[i-1].id,w[0].id)).length;
   if(pauses.length!==attendues) throw new Error(R+' tours : '+pauses.length+' pauses au lieu de '+attendues);
   if(pauses.some(s=>s.sec!==PAUSE_TOUR)) throw new Error('une pause ne vaut pas PAUSE_TOUR');
   L.forEach((s,i)=>{
     if(s.k!=='rest'||!s.pause) return;
     let j=i+1; while(j<L.length&&L[j].k!=='set') j++;
     if(catOf(L[i-1].id)!=='core') throw new Error('une pause ne suit pas le gainage, position '+i);
     if(j>=L.length||catOf(L[j].id)!=='push') throw new Error('une pause ne precede pas le pousse, position '+i);
     if(!pauseAu(L[i-1].id,L[j].id)) throw new Error('pause posee sur une paire non nommee, position '+i);
   });
   const dernier=L.indexOf(w[w.length-1]);
   for(let i=dernier+1;i<L.length;i++)
     if(L[i].k==='rest') throw new Error('repos apres la derniere serie a '+R+' tours');
   const trs=L.filter(s=>s.k==='rest'&&!s.pause);
   if(trs.length!==R*SLOT_ORDER.length-1-pauses.length) throw new Error('compte de transitions faux a '+R+' tours');
   if(trs.some(s=>s.sec!==transSec())) throw new Error('une transition ne suit pas le reglage');
 }
 console.log('conditionnalite OK : aucune pause hors paire nommee, rien apres le dernier tour, a 2, 3 et 4 tours');

 // 4b. le mecanisme repond quand une paire EST nommee
 /* on vide la liste et on nomme la paire du tirage courant, le temps du
    controle : le mecanisme est ainsi exerce quel que soit le contenu livre. */
 {
   await neuf(3);
   vider();
   const L0=buildSession().steps, w0=workSteps(L0);
   const gain=w0.filter(s=>catOf(s.id)==='core')[0].id, pous=w0[0].id;
   PAUSE_RACCORD_PAIRS.push(gain+'>'+pous);
   const L=buildSession().steps;
   const pa=L.filter(s=>s.k==='rest'&&s.pause);
   if(pa.length!==2) throw new Error('paire nommee : '+pa.length+' pauses au lieu de 2 a trois tours');
   if(pa.some(s=>s.sec!==PAUSE_TOUR)) throw new Error('la pause nommee ne vaut pas PAUSE_TOUR');
   const parts=planParts(buildSession());
   if(parts.nPause!==2||parts.pause!==2*PAUSE_TOUR) throw new Error('la paire nommee n entre pas dans la duree annoncee');
   if(contentCard(buildSession(),parts).indexOf('Pause de tour')<0) throw new Error('la paire nommee n apparait pas dans la card Contenu');
   PAUSE_RACCORD_PAIRS.length=0;
   if(planParts(buildSession()).nPause!==0) throw new Error('la pause survit au retrait de la paire');
   remettre();
   console.log('mecanisme OK : une paire nommee pose la pause et entre dans la duree, la retirer la reprend');
 }

 // 5. le changement de volume en seance rederive le raccord
 /* Deux sites emettent des repos. Si le second recopiait l ancienne liste au
    lieu de rederiver de la position, un tour retire laisserait une pause en
    queue de seance ou en priverait le nouveau dernier raccord. */
 {
   await neuf(4);
   vider();
   startSession();
   if(!cur) throw new Error('la seance ne demarre pas');
   const compte=()=>({p:cur.steps.filter(s=>s.k==='rest'&&s.pause).length,
                      t:cur.steps.filter(s=>s.k==='rest'&&!s.pause).length});
   for(const R of [2,4,3]){
     setSessionRounds(R);
     const c=compte();
     if(c.p!==0) throw new Error('apres passage a '+R+' tours : '+c.p+' pauses alors que la liste est vide');
     if(c.t!==R*SLOT_ORDER.length-1) throw new Error('apres passage a '+R+' tours : '+c.t+' transitions au lieu de '+(R*4-1));
     const w=workSteps(cur.steps), dernier=cur.steps.indexOf(w[w.length-1]);
     for(let i=dernier+1;i<cur.steps.length;i++)
       if(cur.steps[i].k==='rest') throw new Error('repos en queue apres passage a '+R+' tours');
     cur.steps.forEach((s,i)=>{ if(s.k==='rest'&&s.pause&&catOf(cur.steps[i-1].id)!=='core')
       throw new Error('pause hors raccord apres passage a '+R+' tours'); });
   }
   remettre();
   console.log('volume OK : le raccord se rederive de la position a 2, 4 puis 3 tours, sans repos en queue');
 }

 // 6. la pause est un poste a part dans la duree annoncee
 {
   await neuf(3);
   vider();
   setTrans(15);
   const p=buildSession(), parts=planParts(p);
   /* liste vide : le poste Pause de tour n existe pas et sa ligne disparait,
      exactement comme la ligne Remontage de charge quand il n y en a pas */
   if(parts.nPause!==0||parts.pause!==0) throw new Error('pause comptee alors que la liste est vide');
   if(parts.trans!==11*transSec()) throw new Error('les 11 repos doivent tous etre des transitions');
   if(parts.total!==parts.warm+parts.exos+parts.trans+parts.pause+parts.remount+parts.cardio+parts.cool)
     throw new Error('la decomposition doit sommer au total');
   if(nRest(p)!==11) throw new Error('nRest doit compter les 11 transitions, obtenu '+nRest(p));
   const h=contentCard(p,parts);
   if(h.indexOf('Pause de tour')>=0) throw new Error('la card Contenu annonce une pause inexistante');
   if(h.indexOf('11 × '+transSec()+' s')<0) throw new Error('la ligne Transitions doit compter les 11 repos');
   setTrans(5);
   const p5=planParts(buildSession());
   if(parts.trans-p5.trans!==11*10) throw new Error('les transitions doivent suivre le reglage');
   setTrans(15);
   remettre();
   console.log('decomposition OK : aucun poste de pause, somme exacte, les 11 repos suivent le reglage');
 }

 // 7. la fourchette des Reglages compte les deux tarifs
 /* Elle ne passe pas par buildSession : elle enumere. Si elle gardait
    l ancienne formule, elle s ecarterait de l estimation de l accueil des la
    premiere seance, et c est precisement le defaut qui avait fait tomber
    l ancien modele de temps. */
 {
   await neuf(3);
   vider();
   state.warm='complet'; state.stretch=true; state.cardio=false; setTrans(15);
   const sp=sessionSpan(3,false,'complet');
   const pools=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(id=>!isLocked(id)));
   let lo=Infinity, hi=0; const ix=[0,0,0,0];
   (function w(i){ if(i===4){ SLOT_ORDER.forEach((s,k)=>state.slotIdx[s]=ix[k]);
       const t=planParts(buildSession()).total; if(t<lo)lo=t; if(t>hi)hi=t; return; }
     for(let a=0;a<pools[i].length;a++){ ix[i]=a; w(i+1); } })(0);
   SLOT_ORDER.forEach(s=>state.slotIdx[s]=0);
   if(sp.min!==Math.round(lo/60)) throw new Error('borne basse fausse : '+sp.min+' contre '+Math.round(lo/60));
   if(sp.max!==Math.round(hi/60)) throw new Error('borne haute fausse : '+sp.max+' contre '+Math.round(hi/60));
   /* le surcout de la pause est celui qui a ete arbitre : 45 s par raccord */
   const avecT=sessionSpan(3,false,'complet',60);
   if(avecT.min<=sp.min) throw new Error('la fourchette doit rester sensible au reglage de transition');
   view='set'; render();
   if(html.indexOf('pause fixe de '+PAUSE_TOUR+' s')>=0) throw new Error('Reglages annonce une exception qui n existe pas');
   /* on nomme TOUTES les paires (gainage, pousse) : chaque quatuor recoit alors
      la pause, et les deux bornes doivent monter de (rounds-1) x (60 - 15),
      soit 90 s. Nommer une seule paire ne prouverait rien : le quatuor le plus
      long peut etre un autre, et la borne ne bougerait pas. */
   SLOTS.core.pool.forEach(c=>SLOTS.push.pool.forEach(u=>PAUSE_RACCORD_PAIRS.push(c+'>'+u)));
   const sp2=sessionSpan(3,false,'complet');
   if(sp2.min<=sp.min) throw new Error('la borne basse ignore les paires nommees');
   if(sp2.max<=sp.max) throw new Error('la borne haute ignore les paires nommees');
   PAUSE_RACCORD_PAIRS.length=0;
   PAUSE_RACCORD_PAIRS.push(workSteps(buildSession().steps).filter(x=>catOf(x.id)==='core')[0].id+'>'+workSteps(buildSession().steps)[0].id);
   render();
   if(html.indexOf('pause fixe de '+PAUSE_TOUR+' s')<0) throw new Error('Reglages doit annoncer l exception quand une paire est nommee');
   remettre();
   console.log('fourchette OK : bornes exactes liste vide, les deux bornes montent de 90 s quand tout est nomme, card honnete');
 }

 // 8. l ecran distingue la pause avant d avoir ete lu
 {
   await neuf(3);
   /* on nomme la paire du tirage courant le temps d observer l ecran, liste
      videe d abord pour que la comparaison ne depende pas du contenu livre */
   vider();
   const w1=workSteps(buildSession().steps);
   PAUSE_RACCORD_PAIRS.push(w1.filter(x=>catOf(x.id)==='core')[0].id+'>'+w1[0].id);
   startSession();
   const L=cur.steps;
   const pause=L.find(s=>s.k==='rest'&&s.pause);
   const trans=L.find(s=>s.k==='rest'&&!s.pause);
   if(!pause||!trans) throw new Error('il faut un repos de chaque sorte pour comparer');
   const hp=restHtml(pause), ht=restHtml(trans);
   if(restTagHtml(pause).indexOf('Pause de tour')<0) throw new Error('le tag de la pause doit la nommer');
   if(restTagHtml(trans).indexOf('Transition')<0) throw new Error('le tag de la transition doit la nommer');
   if(restTagHtml(trans).indexOf('Pause de tour')>=0) throw new Error('une transition ne doit pas se dire pause');
   /* le tag se lit sur le drapeau et non sur la duree : une transition de 30 s
      reste une transition, et c est le defaut que l ancienne heuristique
      sec<=20 avait */
   setTrans(30);
   const long={k:'rest',sec:30};
   if(restTagHtml(long).indexOf('Transition')<0) throw new Error('une transition longue reste une transition');
   setTrans(15);
   if(hp.indexOf('tag pause')<0) throw new Error('la pause doit porter sa classe de tag');
   if(hp.indexOf('chrono rest num pause')<0) throw new Error('le chrono de la pause doit porter sa classe');
   if(hp.indexOf('pausecard')<0) throw new Error('la card de la pause doit porter son lisere');
   if(ht.indexOf('pausecard')>=0||ht.indexOf('tag pause')>=0) throw new Error('une transition ne doit rien porter de tout cela');
   /* le pourquoi est la, replie, et lisible AVANT d appuyer sur Passer */
   if(hp.indexOf('data-k="rest-why"')<0) throw new Error('le message de pause doit etre une card repliable');
   if(/data-k="rest-why"[^>]*\\sopen/.test(hp)) throw new Error('le message doit etre replie par defaut');
   if(hp.indexOf('Le tour recommence')<0) throw new Error('la ligne visible doit dire ce qui se passe');
   if(ht.indexOf('rest-why')>=0) throw new Error('une transition ne porte pas ce message');
   /* la sortie reste ouverte, l outil ne peut pas observer si l epaule a
      recupere. Elle cesse seulement d etre l action principale. */
   if(hp.indexOf('nextStep()')<0) throw new Error('passer doit rester possible pendant une pause');
   if(hp.indexOf('class="quiet mt"')<0) throw new Error('sur une pause, passer n est plus l action principale');
   if(ht.indexOf('class="big mt"')<0) throw new Error('sur une transition, passer reste l action principale');
   if(/confirm|Confirmer|Es-tu s/.test(hp)) throw new Error('aucun dialogue ne doit s interposer');
   remettre();
   console.log('ecran OK : tag, couleur et lisere propres, message replie, sortie conservee mais degradee');
 }

 // 9. la pause n est pas reglable, et rien ne la confond avec une transition
 {
   if(TRANS_CHOICES.indexOf(PAUSE_TOUR)>=0) throw new Error('PAUSE_TOUR ne doit pas etre un cran du selecteur');
   if(PAUSE_TOUR<=TRANS_CHOICES[TRANS_CHOICES.length-1]) throw new Error('la pause doit depasser la transition la plus longue');
   for(const t of TRANS_CHOICES){ setTrans(t);
     if(transSec()===PAUSE_TOUR) throw new Error('un reglage de transition atteint la duree de pause'); }
   setTrans(15);
   if(/function setPause|setPauseTour/.test(SRC)) throw new Error('aucun setter ne doit exposer la pause');
   /* un seul constructeur emet les repos : deux sites l appellent, aucun ne
      fabrique l objet a la main */
   if(/\\.push\\(\\{k:'rest'/.test(SRC)) throw new Error('un site emet un repos sans passer par le constructeur');
   const appels=SRC.split('restStep(').length-1;
   if(appels!==3) throw new Error('un seul constructeur et deux appels attendus, trouve '+appels+' occurrences');
   /* v2.18 : la liste n est plus vide. Sa forme reste une affaire de
      mecanisme : chaque entree nomme un gainage puis un pousse, les deux
      seuls voisins du raccord. Son contenu se teste dans test45. */
   if(PAUSE_RACCORD_PAIRS.join('|')!==LIVREE.join('|')) throw new Error('la suite n a pas remis la liste telle que livree');
   PAUSE_RACCORD_PAIRS.forEach(x=>{ const ab=x.split('>');
     if(ab.length!==2||!DB[ab[0]]||!DB[ab[1]]) throw new Error('entree mal formee : '+x);
     if(DB[ab[0]].cat!=='core'||DB[ab[1]].cat!=='push') throw new Error('une entree ne nomme pas gainage puis pousse : '+x); });
   console.log('constante OK : hors selecteur, sans setter, un constructeur unique, liste faite de paires gainage > pousse et remise en etat');
 }

 // 10. accord de genre : le barreau est une bande, l objet reste un elastique
 {
   await neuf(3);
   const fem=/[ée]lastique\\s+(rose|verte|bleue|violette|noire|blanche|grise)/i;
   const ids=Object.keys(DB).filter(id=>DB[id].bnd);
   let vus=0;
   ids.forEach(id=>{
     const p=perfFor(id,false);
     if(!p.band||p.band==='aucune') return;
     const l=exoLoadLabel(id,p);
     if(l.indexOf('bande ')<0) throw new Error('le libelle de charge de '+id+' ne dit pas bande : '+l);
     if(fem.test(l)) throw new Error('desaccord de genre sur '+id+' : '+l);
     vus++;
   });
   if(!vus) throw new Error('aucun exercice a bande observe, le controle ne prouve rien');
   /* la chip ne peut pas etre controlee par le seul feminin : six couleurs du
      nuancier sont invariables, rose, rouge, orange, jaune, marron, beige, et
      un tirage qui tombe dessus laisserait passer le desaccord. On controle
      donc le mot, qui lui ne depend pas du tirage : « Élastique » n est jamais
      suivi d une couleur, les litteraux de MAT s arretent a l objet. */
   const nomme=/[ée]lastique\\s+(rose|rouge|orange|jaune|vert|bleu|violet|noir|blanc|gris|marron|beige)/i;
   let chipsVues=0;
   for(let k=0;k<40;k++){
     const plan=buildSession(), chips=sessionGear(plan).join(' | ');
     if(fem.test(chips)) throw new Error('desaccord de genre sur le materiel a sortir : '+chips);
     if(nomme.test(chips)) throw new Error('une chip nomme un elastique par sa realisation : '+chips);
     if(/Bande /.test(chips)) chipsVues++;
     SLOT_ORDER.forEach(x=>{ state.slotIdx[x]=(state.slotIdx[x]||0)+1; });
   }
   if(!chipsVues) throw new Error('aucune chip de bande observee sur 40 tirages, le controle ne prouve rien');
   /* les litteraux de MAT ne bougent pas : sans barreau prescrit, l objet a
      aller chercher reste un elastique */
   if(SRC.indexOf('Élastique (assistance)')<0) throw new Error('le litteral de MAT a ete emporte par la correction');
   /* et rien nulle part dans la source ne concatene elastique avec une
      realisation, qui est toujours au feminin */
   if(/[ée]lastique '\\+/.test(SRC)) throw new Error('une concatenation sur elastique subsiste dans la source');
   console.log('genre OK : '+vus+' exercices a bande, aucun desaccord, litteraux de MAT intacts');
 }

 console.log('TESTS ORDRE DU CIRCUIT ET PAUSE DE RACCORD NOMMEE V2.11 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
