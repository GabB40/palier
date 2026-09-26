/* ============ MATERIEL PAR EXERCICE ============ */
const MAT={
 'pompes-poignees':['Poignées de pompes si tu en as','Tapis'],
 'pompes-inclinees':['Support stable (table, plan de travail)'],
 'developpe-sol':['2 haltères'],
 'elevations-laterales':['2 haltères'],
 'face-pulls':['Élastique','Ancrage de porte à hauteur de visage'],
 'tirage-doux':['Élastique','Ancrage de porte'],
 'rowing-elastique':['Élastique','Tapis'],
 'rowing-kettlebell':['Kettlebell','Chaise ou banc'],
 'rowing-suspension':['Barre de traction','Sangles de suspension'],
 'gainage-lateral':['Tapis'],
 'pont-fessier':['Tapis'],
 'pont-fessier-leste':['Tapis','Kettlebell, sac à dos chargé ou disques','Serviette pliée'],
 'pont-fessier-une-jambe':['Tapis'],
 'hip-thrust-une-jambe':['Assise stable à hauteur de genou (canapé, lit, banc), calée contre un mur'],
 'hip-thrust-une-jambe-leste':['Assise stable à hauteur de genou (canapé, lit, banc), calée contre un mur','Kettlebell, sac à dos chargé ou disques','Serviette pliée'],
 'curls-halteres':['2 haltères'],
 'goblet-squat':['Kettlebell'],
 'box-squat':['Chaise'],
 'squat-une-jambe-chaise':['Chaise stable, réglable ou à deux hauteurs repérées (50 et 40 cm), qui ne roule ni ne pivote ou calée contre un mur'],
 'squat-une-jambe-chaise-leste':['Chaise stable à 40 cm, qui ne roule ni ne pivote ou calée contre un mur','Kettlebell'],
 'fentes-arriere':[],
 'fentes-arriere-lestee':['2 haltères'],
 'step-ups':['Marchepied (hauteur sous le genou)'],
 'step-ups-bas':['Marche basse ou première marche d\'escalier'],
 'retraction-scapulaire':['Tapis'],
 'ecartement-elastique':['Élastique'],
 'tirage-vertical-elastique':['Élastique','Ancrage de porte en hauteur'],
 'elevations-laterales-elastique':['Élastique'],
 'curls-elastique':['Élastique'],
 'rdl-elastique':['Élastique'],
 'mollets-debout':['Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'mollets-debout-leste':['Sac à dos','De quoi le charger : disques, kettlebell, bouteilles','Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'mollets-une-jambe':['Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'mollets-une-jambe-leste':['Sac à dos','De quoi le charger : disques, kettlebell, bouteilles','Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'rdl-kettlebell':['Kettlebell'],
 'kb-swings':['Kettlebell'],
 'bird-dog':['Tapis'],
 'dead-bug':['Tapis'],
 'pallof-press':['Élastique','Ancrage de porte à hauteur de poitrine'],
 'planche':['Tapis'],
 'planche-ballon':['Swiss ball','Tapis'],
 'gainage-lateral-jambe-levee':['Tapis'],
 'planche-genoux':['Tapis'],
 'cardio-bas-impact':[],
 'marche-continue':[],
 'tractions-assistees-supination':['Barre de traction','Élastique (assistance)'],
 'tractions-assistees-pronation':['Barre de traction','Élastique (assistance)'],
 'tractions-strictes-supination':['Barre de traction'],
 'tractions-strictes-pronation':['Barre de traction'],
 'etir-nuque':[],'etir-pecs':['Chambranle de porte'],'chat-vache':['Tapis'],
 'etir-hanches':['Tapis ou coussin'],'etir-ischios':['Marche basse'],'posture-enfant':['Tapis']
};
Object.keys(MAT).forEach(id=>{ if(DB[id]) DB[id].mat=MAT[id]; });

function sessionGear(plan){
  const out=[];
  const add=x=>{ if(x&&out.indexOf(x)<0) out.push(x); };
  plan.exos.forEach((id,i)=>{
    (DB[id].mat||[]).forEach(add);
    const e=DB[id], p=perfFor(id,plan.orig?plan.orig[i]!==id:false);
    if(e.mode==='load') out[out.indexOf('2 haltères')]='2 haltères chargés à '+fmtKg(p.load);
    if(e.mode==='fixed'&&p.load>10.01){
      const i=out.indexOf('Kettlebell'), lbl=loadLabelFor(id,p.load);
      if(i>=0) out[i]=lbl.charAt(0).toUpperCase()+lbl.slice(1);
    }
    /* la chip nomme ce qu il faut aller chercher, donc la realisation du profil
       et jamais la cle du niveau : « Bande bleue » et non « Bande n6 ».
       v2.10, accord de genre : PAL stocke le libelle de couleur au feminin,
       « elastique » est masculin. Les cinq concatenations disent « bande ».
       Les litteraux de MAT ne bougent pas : ils nomment l objet a aller
       chercher quand aucun barreau n est prescrit. L objet est un elastique,
       le barreau est une bande. */
    if(e.bnd&&p.band){
      const n=bandNom(p.band);
      if(e.bnd==='ass'){ const i=out.indexOf('Élastique (assistance)'); if(i>=0) out[i]='Bande '+n+' (assistance)'; }
      else if(p.band!=='aucune'){
        const i=out.indexOf('Élastique');
        if(i>=0) out[i]='Bande '+n;
        else add('Bande '+n+(id==='pompes-poignees'?' (dans le dos)':''));
      }
    }
  });
  if(plan.cardio) (DB[CARDIO_ID].mat||[]).forEach(add);
  return out;
}
/* Ligne d exercice, commune au panneau du jour et aux panneaux a venir. Le
   barreau de bande figure desormais sur la ligne : il etait dans les chips de
   materiel seulement, donc absent la ou on lit l exercice. */
/* v2.12 : la charge affichee est la charge COURANTE, sur tous les modes. Le
   mode fixe lisait e.load0, la charge de depart du catalogue : un goblet squat
   monte a 14 kg s affichait a 10 sur l accueil et sur tous les panneaux du
   carrousel, c est-a-dire exactement la card qui sert a preparer le materiel.
   Le libelle vient de l echelle, qui nomme le montage, kettlebell et lestes :
   la liste du materiel a sortir ne suffit pas a monter la charge. */
function exoLoadLabel(id,p){
  const e=DB[id];
  if(e.mode==='load') return fmtKg(p.load);
  if(e.mode==='fixed') return loadLabelFor(id,(p&&p.load)||e.load0);
  if(e.bnd==='ass'&&p.band) return 'bande '+bandNom(p.band);
  if(e.bnd==='res'&&p.band&&p.band!=='aucune') return 'bande '+bandNom(p.band);
  return '';
}
function exoRowHtml(id,opt){
  const o=opt||{}, e=DB[id], p=o.perf||perfFor(id,false);
  const cible=e.mode==='stretch'?'':(p.target||(p.range?p.range[0]:''))+' '+unitOf(e)+(e.side?' / côté':'');
  const bas=exoLoadLabel(id,p);
  const sous=esc(e.mus)+(o.dur?' · '+o.dur:'');
  return '<div class="exorow" onclick="showFiche(\''+id+'\',\'home\')">'+
    (typeof IMG!=='undefined'&&IMG[id]?'<img src="'+IMG[id]+'" alt="" loading="lazy">':'<span class="thumbph"></span>')+
    '<span class="ex"><b>'+esc(e.nom)+'</b>'+(o.tag||'')+'<span class="muted small">'+sous+'</span></span>'+
    '<span class="num small" style="text-align:right">'+cible+(bas?'<br>'+bas:'')+'</span></div>';
}
function gearListHtml(gear){
  return '<div class="muted small mt"><b>Matériel à sortir</b></div>'+
    '<div class="matlist">'+(gear.length?gear.map(g=>'<span class="chip">'+esc(g)+'</span>').join(''):'<span class="chip">Rien, poids du corps seul</span>')+'</div>';
}
/* Le materiel a sortir ne suffit pas quand deux exercices se disputent la meme
   ressource : il faudra changer le montage en cours de seance. Sur un panneau a
   venir, le nombre de changements n est pas dit, il depend du volume qui sera
   choisi ce jour-la. */
function remountHtml(exos,n){
  const rm=remountPairs({exos:exos});
  if(!rm.length) return '';
  return '<div class="vig" style="margin-top:10px">'+rm.map(g=>
    (g.gear==='halteres'?'Les haltères passent de ':'La kettlebell passe de ')+
    g.items.map(x=>fmtKg(x.load)+' ('+esc(DB[x.id].nom)+')').join(' à ')).join('. ')+
    (n?'. À changer '+n+' fois pendant la séance, compté dans le temps annoncé.':'.')+'</div>';
}
/* v1.18 : le detail de seance devient un carrousel. Premier panneau, la seance
   du jour, inchange. Suivants, les tirages a venir : les exercices, le materiel
   et le niveau actuel, sans duree, le volume de ces seances n etant pas encore
   choisi. Le nom du panneau courant occupe la ligne fermee de la card, ou la
   marque « allegee » figurait : celle-ci est deja dite deux fois, dans le
   bandeau de l accueil et dans l encart en tete du panneau du jour. */
function sessionDetailHtml(plan){
  const nSets=workSteps(plan.steps).length/SLOT_ORDER.length;
  const cool=plan.steps.filter(s=>s.cool);
  let jour=
    (plan.light?'<div class="vig" style="margin-top:10px">Séance allégée : les exercices qui ont une variante de repli sont remplacés, les autres voient leur cible réduite de 30 % sans descendre sous le bas de fourchette. Rien ne montera ni ne descendra à l\'issue de cette séance.</div>':'')+
    gearListHtml(sessionGear(plan));
  plan.exos.forEach((id,i)=>{
    const org=plan.orig?plan.orig[i]:id, p=perfFor(id,org!==id);
    const tag=!plan.light?'':(org!==id
      ? '<span class="tag flame" style="font-size:.68rem">repli de '+esc(DB[org].nom)+'</span>'
      : (p.repsCut||p.loadCut?'<span class="tag flame" style="font-size:.68rem">cible allégée</span>':''));
    jour+=exoRowHtml(id,{perf:p,tag:tag,dur:fmtDur(nSets*serieSec(id,plan.light))});
  });
  /* v2.15 : deux phrases constantes retirees d ici, « N series par exercice,
     plus le module cardio... » et « Touche un exercice pour sa fiche
     complete » : une information constante affichee a chaque lancement
     devient du bruit, motif qui a deja ecarte le resume de volume sur
     l accueil. La card de lancement porte deja le volume et les options. La
     ligne des etirements reste, raccourcie : elle porte une valeur qui change,
     les etirements du jour. */
  if(cool.length) jour+='<div class="muted small" style="margin-top:6px">Puis '+cool.map(s=>esc(DB[s.id].nom)).join(' et ')+' · '+fmtDur(cool.reduce((a,s)=>a+serieSec(s.id,false),0))+'</div>';
  jour+=remountHtml(plan.exos,remounts(plan).n);

  const N=aheadCount(), lbl=k=>k===0?'Aujourd\'hui':(k===1?'Séance suivante':'Dans '+k+' séances');
  let panes='<section class="carpane" data-i="0">'+jour+'</section>';
  for(let k=1;k<N;k++){
    const exos=drawAhead(k);
    panes+='<section class="carpane" data-i="'+k+'"><div class="futbody">'+
      '<div class="futhead">'+lbl(k)+'</div>'+
      '<div class="futnote">Cibles et charges à ton niveau actuel, avant séance du jour</div>'+
      gearListHtml(sessionGear({exos:exos,orig:exos,cardio:false}))+
      exos.map(id=>exoRowHtml(id)).join('')+
      remountHtml(exos,0)+
      '</div></section>';
  }
  /* ontoggle apres l attribut d ouverture : trois suites lisent la sequence
     `data-k="home-detail" open` pour dire si la card sort ouverte ou fermee. */
  return '<details class="card" data-k="home-detail"'+cardOpen('home-detail',true)+' ontoggle="carFit()">'+
    '<summary><span class="ttl">Détail de la séance</span><span class="val" id="carlbl">'+lbl(0)+'</span></summary>'+
    '<div class="carnav">'+
      '<button class="quiet cbtn off" id="carfirst" aria-label="Revenir à la séance du jour" onclick="carGo(0)">&laquo;</button>'+
      '<button class="quiet cbtn" id="carprev" aria-label="Séance précédente" onclick="carGo(carIdx-1)">&lsaquo;</button>'+
      '<div class="cdots" id="cardots">'+Array.from({length:N},(x,k)=>'<i class="'+(k?'':'on')+'"></i>').join('')+'</div>'+
      '<button class="quiet cbtn" id="carnext" aria-label="Séance suivante" onclick="carGo(carIdx+1)">&rsaquo;</button>'+
    '</div>'+
    '<div class="carstrip" id="carstrip" onscroll="carScroll()">'+panes+'</div>'+
  '</details>';
}
/* L index du carrousel ne va pas dans l etat : il repart a zero a chaque
   affichage de l accueil, sinon on y revient parque sur une seance a venir. */
let carIdx=0, carT=null, carAnim=0;
/* Duree du glissement d un panneau a l autre. Le defilement lisse natif, qui
   servait jusqu ici, ne se regle pas : le navigateur calcule sa duree depuis la
   distance, et un panneau fait toute la largeur du conteneur. Il en resultait
   pres d une demi-seconde pendant laquelle deux panneaux etaient visibles cote
   a cote, ce qui se lisait comme un remplacement lent et non comme une page
   tournee. Le mouvement est donc pilote ici, court et en deceleration. */
const CAR_MS=200;
function carGlide(st,to,ms){
  const from=st.scrollLeft, dx=to-from;
  if(!dx) return;
  const id=++carAnim;
  let t0=null;
  /* l accroche se bat avec une position ecrite image par image : on la coupe
     le temps du mouvement et on la remet a l arrivee */
  st.style.scrollSnapType='none';
  const step=t=>{
    if(id!==carAnim) return;
    if(t0===null) t0=t;
    const k=Math.min(1,(t-t0)/ms);
    st.scrollLeft=from+dx*(1-Math.pow(1-k,3));
    if(k<1) requestAnimationFrame(step);
    else st.style.scrollSnapType='';
  };
  requestAnimationFrame(step);
}
function carPanes(){ const st=$('#carstrip'); return st&&st.querySelectorAll?st.querySelectorAll('.carpane'):[]; }
/* Hauteur de la bande (defaut v1.18 corrige le 13 septembre 2026). Une bande
   flex prend la hauteur de son plus grand enfant, et les panneaux a venir sont
   systematiquement plus hauts que celui du jour : intitule, encart de niveau et
   marge de la barre valent une soixantaine de pixels que le panneau du jour n a
   pas. Le vide s ouvrait donc sous la derniere ligne de la seance du jour,
   jusqu a la card suivante, et il grandissait avec le plus grand des tirages a
   venir. La hauteur suit desormais le panneau affiche. Elle se mesure, elle ne
   se calcule pas : les vignettes ont une taille fixe en CSS, la mesure est
   stable avant meme leur decodage. Elle depend en revanche de
   `align-items:flex-start` sur la bande : sans lui, l alignement par defaut
   etire chaque panneau a la hauteur de la ligne, et un panneau interroge rend
   la hauteur du plus grand, celle-la meme qu on cherche a corriger. La premiere
   ecriture de carFit n avait pas cette propriete et se reecrivait sa propre
   hauteur, sans rien changer a l ecran. Une mesure nulle, card repliee, efface la
   consigne plutot que d ecraser la bande a zero, et `overflow-y:hidden` garantit
   qu une hauteur fausse ne capture jamais le defilement vertical de la page. */
function carFit(){
  const st=$('#carstrip'), p=carPanes();
  if(!st||!st.style||!p.length) return;
  const el=p[Math.max(0,Math.min(p.length-1,carIdx))];
  const h=el&&el.offsetHeight;
  st.style.height=h>0?h+'px':'';
}
function carSync(){
  const p=carPanes(), n=p.length; if(!n) return;
  carIdx=Math.max(0,Math.min(n-1,carIdx));
  const lab=$('#carlbl'); if(lab) lab.textContent=carIdx===0?'Aujourd\'hui':(carIdx===1?'Séance suivante':'Dans '+carIdx+' séances');
  const d=$('#cardots'); if(d&&d.children) for(let i=0;i<d.children.length;i++) d.children[i].className=(i===carIdx?'on':'');
  const f=$('#carfirst'); if(f) f.className='quiet cbtn'+(carIdx?'':' off');
}
function carGo(i){
  const p=carPanes(), n=p.length; if(!n) return;
  carIdx=Math.max(0,Math.min(n-1,i));
  const st=$('#carstrip'), to=p[carIdx].offsetLeft;
  if(st&&st.style&&typeof requestAnimationFrame==='function') carGlide(st,to,CAR_MS);
  else if(st&&typeof st.scrollLeft==='number') st.scrollLeft=to;
  carSync(); carFit();   /* la hauteur glisse avec le panneau, meme duree */
}
function carScroll(){
  const st=$('#carstrip'), p=carPanes(); if(!st||!p.length) return;
  clearTimeout(carT);
  carT=setTimeout(()=>{
    let best=0, d=Infinity;
    for(let i=0;i<p.length;i++){ const v=Math.abs(p[i].offsetLeft-st.scrollLeft); if(v<d){ d=v; best=i; } }
    if(best!==carIdx){ carIdx=best; carSync(); carFit(); }
  },60);
}
/* Ouvert par defaut depuis la v1.10 : la ligne fermee ne porte aucune valeur,
   contrairement a la regle des cards repliables, donc l etat ferme n etait pas
   un resume utile mais une information cachee. Son ouverture survit au rendu
   par le mecanisme commun des cards repliables (v1.14), qui a remplace le
   drapeau dedie. */
/* Bascule ponctuelle du mode allege : jamais un reglage, jamais persiste,
   remis a zero en fin de seance comme a l abandon. */
function toggleLight(){ lightMode=!lightMode; render(); }

