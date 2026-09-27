/* ============ PICTOGRAMMES DE REPLI ============ */
/* Numero de version. Il vivait dans imgdata.js, que le script de
   regeneration de la banque reecrit entierement : la premiere regeneration
   l aurait efface sans bruit. Il doit rester APRES le marqueur de section,
   sinon le decoupage des sources le range dans imgdata.js. */
const VERSION='2.26';
function limb(a,b,c){return '<path class="st" d="M'+a[0]+' '+a[1]+' L'+b[0]+' '+b[1]+(c?' L'+c[0]+' '+c[1]:'')+'"/>';}
function propSvg(p){
  const A=p.at;
  if(p.t==='kb') return '<circle class="propf" cx="'+A[0]+'" cy="'+(A[1]+7)+'" r="6"/><path class="prop" d="M'+(A[0]-5)+' '+(A[1]+3)+' Q'+A[0]+' '+(A[1]-4)+' '+(A[0]+5)+' '+(A[1]+3)+'"/>';
  if(p.t==='db') return '<path class="prop" d="M'+(A[0]-6)+' '+A[1]+' L'+(A[0]+6)+' '+A[1]+'"/><circle class="propf" cx="'+(A[0]-6)+'" cy="'+A[1]+'" r="3.5"/><circle class="propf" cx="'+(A[0]+6)+'" cy="'+A[1]+'" r="3.5"/>';
  if(p.t==='band') return '<path class="band" d="M'+A[0]+' '+A[1]+' L'+p.to[0]+' '+p.to[1]+'"/>';
  if(p.t==='bar') return '<path class="prop" d="M'+A[0]+' '+A[1]+' L'+p.to[0]+' '+p.to[1]+'"/>';
  if(p.t==='box') return '<rect class="prop" x="'+A[0]+'" y="'+A[1]+'" width="'+p.w+'" height="'+p.h+'" rx="2"/>';
  return '';
}
function poseSvg(p){
  let s='<circle class="hd" cx="'+p.hd[0]+'" cy="'+p.hd[1]+'" r="6"/>'+limb(p.nk,p.hp);
  if(p.kf)s+=limb(p.hp,p.kf,p.ff);
  if(p.kb)s+=limb(p.hp,p.kb,p.fb);
  if(p.ea)s+=limb(p.nk,p.ea,p.ha);
  if(p.eb)s+=limb(p.nk,p.eb,p.hb);
  (p.props||[]).forEach(pr=>{s+=propSvg(pr);});
  return s;
}
function figSvg(fig){
  if(!fig) return '<svg class="fig" viewBox="0 0 120 100"></svg>';
  const g=fig.gnd!==false?'<path class="gnd" d="M6 93 L114 93"/>':'';
  return '<svg class="fig" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+g+
    '<g class="p1">'+poseSvg(fig.a)+'</g><g class="p2">'+poseSvg(fig.b||fig.a)+'</g></svg>';
}
function figFor(id,fig,label){
  if(typeof IMG!=='undefined'&&IMG[id])
    return '<div class="figbox illus"><img src="'+IMG[id]+'" alt="'+esc(label||id)+'" loading="lazy" onclick="zoomFig(\''+id+'\')"></div>';
  return '<div class="figbox">'+figSvg(fig)+'</div>';
}
function zoomFig(id){
  const d=document.createElement('div');
  d.className='lightbox'; d.innerHTML='<img src="'+IMG[id]+'" alt="">';
  d.onclick=()=>d.remove(); document.body.appendChild(d);
}

/* ============ MATERIEL ET ECHELLE DE CHARGE ============ */
/* inventaire par defaut : 2 barres de 2 kg, disques en nombre total,
   capacite de 5 disques par extremite (securite manchon), bandes et lestes */
/* Ressources declarables (v2.0). Neuf entrees. Le critere n est plus le
   transport mais l exigence : le mobilier n est pas declare tant que l exercice
   se contente de n importe quel objet, chaise, mur, tapis, appui sureleve pour
   un etirement. Il le devient des que l exercice exige une garantie que le
   mobilier courant n offre pas. La marche basse entre a ce titre en v2.0 : le
   step-up bas demande un appui stable sous le poids du corps a vingt
   centimetres, ce qu un logement de plain-pied ou une chambre d hotel ne
   fournissent pas forcement, la ou l etirement des ischios se contente de tout
   ce qui est sureleve et garde donc son mobilier suppose.
   Les poignees de pompes ne sont pas une ressource : elles ne changent pas ce
   que l exercice sollicite, seulement le confort du poignet.
   La presence des elastiques se derive des niveaux declares plutot que de
   porter son propre interrupteur : une structure au lieu de deux. Les lestes
   ne figurent pas ici, ils n ouvrent aucun exercice, ils allongent seulement
   l echelle des exercices a kettlebell. */
const RES_ORDER=['hal','kb','elast','ancrage','barre','sangles','ballon','step','stepbas'];
const RES_LBL={hal:'Haltères réglables',kb:'Kettlebell',elast:'Élastiques',
  ancrage:'Ancrage de porte',barre:'Barre de traction',sangles:'Sangles de suspension',
  ballon:'Swiss ball',step:'Marchepied',stepbas:'Marche basse'};
/* precision affichee sous le libelle, la ou le nom seul ne suffit pas a savoir
   si on possede la chose */
const RES_SUB={step:'hauteur sous le genou',stepbas:'environ 20 cm, stable'};
const DEFAULT_GEAR={bar:2,bars:2,maxPerEnd:5,plates:{'0.5':4,'1':12,'2':4,'1.25':4},
  bands:{jaune:'jaune',rouge:'rouge',noir:'noir',violet:'violet',vert:'vert',n6:''},
  cuffs:{'1':1,'2':1},kbs:{'10':1},
  res:{hal:1,kb:1,elast:1,cuff:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1}};
/* Inventaire neuf (v2.0). Il ne sert qu au premier lancement : DEFAULT_GEAR
   garde ses deux autres emplois, valeur de repli des fonctions et cible de
   migration des anciennes sauvegardes, qui viennent forcement d un domicile ou
   tout etait suppose present. Vider DEFAULT_GEAR ferait migrer ces sauvegardes
   vers un inventaire vide et bornerait toutes leurs prescriptions.
   La barre, son nombre et la capacite du manchon decrivent la mecanique d un
   haltere et non un inventaire : c est l interrupteur hal qui porte l absence. */
const EMPTY_GEAR={bar:2,bars:2,maxPerEnd:5,plates:{'0.5':0,'1':0,'2':0,'1.25':0},
  bands:{},cuffs:{},kbs:{},res:{}};
function aRes(k,gear){
  const g=gear||state.gear;
  if(k==='elast') return !!(g.res||{}).elast&&ownedBands(g).length>0;
  if(k==='kb') return !!(g.res||{}).kb&&kbOwned(g).length>0;
  /* Cle entierement derivee (v2.5), sans interrupteur a elle. Les deux cles
     ci-dessus croisent un drapeau declare et un inventaire ; celle-ci n a pas
     de drapeau parce qu elle ne decrit aucun objet a posseder. Le sac a dos
     n est pas une ressource : il est toujours sous la main, meme registre que
     la chaise, et l exercice n exige de lui aucune garantie que l ordinaire
     n offre pas. Ce que l exercice exige, c est du POIDS a mettre dedans, d ou
     qu il vienne. Un profil qui ne declare qu une kettlebell de 10 kg tient
     donc le premier barreau : c est le defaut qu un NEEDS en halteres aurait
     eu. */
  if(k==='masse') return masseMobilisable(g)>=PAS_SAC;
  return !!((g.res||DEFAULT_GEAR.res)[k]);
}
/* Poids proposes a la declaration (v2.0). Deux listes fermees : on choisit dans
   un menu, on ne saisit pas un nombre. Les disques couvrent ce qui se trouve
   sur le marche pour des halteres courts ; au-dela de 10 kg le disque ne tient
   plus sur un manchon d haltere. Les paires de lestes restent les trois
   declarees, le lot kettlebell apportera les plafonds par exercice avant
   d ouvrir cette liste. */
const PLATE_W=['0.5','1','1.25','2','2.5','5','7.5','10'];
const CUFF_W=['0.5','1','2'];
/* Poids de kettlebell proposes (v2.1). Liste fermee, meme motif que les
   disques : on choisit, on ne saisit pas. Un poids entre a UN exemplaire,
   contrairement aux disques qui entrent a quatre : une kettlebell est un objet
   entier, un exemplaire de plus ne change rien a l echelle. */
const KB_W=['8','10','12','14','16','20'];
function kbOwned(gear){
  const g=gear||DEFAULT_GEAR, k=g.kbs||{};
  return KB_W.filter(w=>k[w]).map(parseFloat).sort((a,b)=>a-b);
}
/* Seuil du micro-palier (v2.1). La regle est additive : elle intercale un
   barreau la ou le saut symetrique depasse ce seuil, et ne retire jamais un
   barreau existant. Balayage de 5 a 45 % : toute valeur entre 13 et 33 %
   produit exactement la meme echelle, la forme du bas d echelle decidant seule.
   20 % est au milieu de ce plateau, il n y a donc rien a calibrer finement. */
const MICRO_SEUIL=0.20;
function loadLadder(gear){ return ladderBuild(gear).all; }
/* Echelle de progression (v2.0) : les seuls montages symetriques, c est-a-dire
   les memes disques des deux cotes. Motif mesure : l echelle complete est
   l union de deux familles, les montages symetriques et le micro-palier d un
   disque sur une extremite, et le tri de leur union fabrique des ecarts de
   0,25 kg qui ne sont le pas de personne. Exemple releve sur l inventaire
   reel : 6 kg est 2 + 2x2 des deux cotes, 6,25 kg est 5 kg plus un disque de
   1,25 sur une seule extremite. Deux montages sans rapport dont les totaux se
   croisent.
   Le cliquet de la double progression ramene la cible au bas de fourchette a
   chaque montee, quel que soit le saut : le prix en repetitions est fixe et le
   gain en charge ne l est pas. Mesure sur le developpe au sol, fourchette
   8-12 : un saut de 6 a 6,25 kg gagne 4,2 % de charge et coute 30,6 % de
   tonnage, un saut de 6 a 7 kg gagne 16,7 % et coute 22,2 %. Le petit palier
   est donc strictement mauvais, meme cout et moins de gain. Cumul mesure sur
   le moteur reel, developpe tire une seance sur trois : quarante-cinq semaines
   pour aller de 6 a 10 kg contre trente sur les seuls montages symetriques.
   Le critere retenu est physique et non un seuil pose : les memes disques des
   deux cotes. Un seuil en pourcentage ferait l inverse de ce qu il faut, les
   ecarts relatifs devant se resserrer quand la charge monte, et reintroduirait
   les collisions au passage.
   L echelle complete reste en service la ou le geste est ponctuel et humain :
   ajustement manuel en seance, reduction de 20 % de la seance allegee, bornage
   materiel. Le cliquet automatique, montee comme filet de securite, vit sur
   l echelle de progression. */
function loadLadderProg(gear){ return ladderBuild(gear).prog; }
let _ladderMemo={};
function ladderBuild(gear){
  const g=gear||DEFAULT_GEAR, cap=g.maxPerEnd||5;
  const key=JSON.stringify([g.bar,g.bars,cap,g.plates]);
  if(_ladderMemo[key]) return _ladderMemo[key];
  const types=Object.keys(g.plates).map(parseFloat).filter(w=>w>0&&g.plates[w]>0).sort((a,b)=>a-b);
  const perDb={};
  types.forEach(w=>{ perDb[w]=Math.floor(g.plates[w]/g.bars); });
  /* Ecart tolere entre les deux manchons d un meme haltere (v2.1). La v1.2
     avait tranche le principe, « un seul disque supplementaire sur une
     extremite, desequilibre negligeable sur une charge tenue au centre de la
     main » ; ce qui manquait etait la grandeur. Le critere etait une procedure,
     symetrique plus un disque, et non une grandeur physique, si bien que
     l echelle livrait 3,25 kg, qui demande 1,25 kg d ecart, et refusait 3,5 kg,
     qui n en demande que 0,5. Le critere devient l ecart lui-meme, borne au
     plus petit disque declare : il derive de l inventaire et ne se pose pas. */
  const D=types.length?types[0]:0;
  const all=new Map(), sym=new Set();
  (function walk(i,a,b,na,nb){
    if(i===types.length){
      const t=Math.round((g.bar+a+b)*100)/100, d=Math.round(Math.abs(a-b)*100)/100;
      if(d<0.001) sym.add(t);
      if(d<=D+0.001&&(!all.has(t)||all.get(t)>d)) all.set(t,d);
      return;
    }
    const w=types[i], n=perDb[w];
    for(let x=0;x<=n&&na+x<=cap;x++)
      for(let y=0;x+y<=n&&nb+y<=cap;y++) walk(i+1,a+w*x,b+w*y,na+x,nb+y);
  })(0,0,0,0,0);
  const A=[...all.keys()].sort((x,y)=>x-y), S=[...sym].sort((x,y)=>x-y);
  const out={all:A,sym:S,prog:microProg(S,A)};
  _ladderMemo[key]=out;
  return out;
}
/* Micro-palier additif (v2.1). Constat mesure : le probleme ne mord que sur
   2 vers 3, plus 50 %, et 3 vers 4, plus 33 %, les elevations laterales
   demarrant a 2 kg ; au-dela l echelle symetrique est deja a 12,5 % et moins.
   La metrique de tonnage qui a justifie l echelle symetrique en v2.0 est
   aveugle a la faisabilite du saut par repetition, c est la raison nouvelle.
   La regle AJOUTE et ne retire jamais : au-dessus de 4 kg l echelle de
   progression est identique a celle de la v2.0, verifie par comparaison
   stricte. Un seul intercalaire par intervalle, le plus proche du milieu
   geometrique, pour que les deux moities du saut se ressemblent. */
function microProg(S,A){
  const out=[];
  S.forEach((v,i)=>{
    out.push(v);
    const nx=S[i+1];
    if(nx===undefined||nx/v-1<=MICRO_SEUIL) return;
    const mid=A.filter(x=>x>v+0.001&&x<nx-0.001);
    if(!mid.length) return;
    const cible=Math.sqrt(v*nx);
    let best=mid[0];
    mid.forEach(x=>{ if(Math.abs(x-cible)<Math.abs(best-cible)) best=x; });
    out.push(best);
  });
  return out;
}
/* echelle mono-haltere : une seule barre, tout le stock de disques */
function loadLadderMono(gear){
  const g=gear||DEFAULT_GEAR;
  return loadLadder(Object.assign({},g,{bars:1}));
}
function loadLadderMonoProg(gear){
  const g=gear||DEFAULT_GEAR;
  return loadLadderProg(Object.assign({},g,{bars:1}));
}
/* ============ BANDES ELASTIQUES : echelle ordinale ============ */
/* Un niveau porte sa fourchette de tension comme libelle principal (v2.0) : il
   est un cran de tension, la couleur n est que ce qu on pose dessus. Les cinq
   premieres cles restent celles de la v1.2, elles sont ecrites dans perf et
   dans l historique. La sixieme est une extension au sommet, et sa cle est
   opaque a dessein : avec la realisation par couleur, la nommer « bleu »
   inviterait la confusion entre la cle du niveau et la couleur qui le tient. */
const BANDS=[
 {id:'jaune',lbs:'5 à 15 lbs'},
 {id:'rouge',lbs:'15 à 35 lbs'},
 {id:'noir',lbs:'25 à 65 lbs'},
 {id:'violet',lbs:'35 à 85 lbs'},
 {id:'vert',lbs:'50 à 125 lbs'},
 {id:'n6',lbs:'125 à 170 lbs'}
];
/* Nuancier ferme (v2.0). La realisation d un niveau est une couleur choisie
   ici, jamais une chaine saisie : on tape une pastille, on ne saisit rien, ce
   qui supprime du meme geste le nommage libre et le piege de la chaine vide.
   La cle est stockee, le libelle porte l accord, le code sert la pastille.
   Pas de nuances foncees : illisibles en pastille sur mobile, et le doublon
   couvre deja le cas des deux bandes de meme couleur. La realisation restant
   une chaine, ajouter une couleur plus tard coute zero migration.
   Les cinq premieres cles sont exactement les realisations que la migration
   pose par defaut sur une sauvegarde v1.18, donc un inventaire domicile ne
   migre pas deux fois. */
const PAL=[['rose','rose','#E85D8A'],['rouge','rouge','#C0392B'],['orange','orange','#E67E22'],
 ['jaune','jaune','#E2B93B'],['vert','verte','#2E8B57'],['bleu','bleue','#2E6FD8'],
 ['violet','violette','#7D4FB0'],['noir','noire','#3A3A40'],['blanc','blanche','#F5F5F2'],
 ['gris','grise','#8A949E'],['marron','marron','#8B5A2B'],['beige','beige','#D9C7A7']];
function coulOK(c){ return PAL.some(x=>x[0]===c); }
function coulLbl(c){ for(const x of PAL) if(x[0]===c) return x[1]; return c||''; }
function coulHex(c){ for(const x of PAL) if(x[0]===c) return x[2]; return null; }
/* NIVEAUX ET REALISATIONS (v2.0). Un niveau est une cle stable, jamais un rang :
   sa position dans l echelle depend de l inventaire, son identite non. Chaque
   profil declare la REALISATION du niveau, c est-a-dire l objet concret qui le
   tient ici : la bande rouge a domicile, la bleue de Marc ailleurs. Une
   realisation vide signifie que ce profil ne tient pas ce niveau.
   La realisation remplace la carte de presence de la v1.18, une structure au
   lieu de deux : la presence se lit comme une realisation non vide. */
function ownedBands(gear){const g=gear||DEFAULT_GEAR;return BANDS.filter(b=>(g.bands||{})[b.id]).map(b=>b.id);}
function bandReal(id,gear){
  const g=gear||(typeof state!=='undefined'?state.gear:DEFAULT_GEAR);
  const v=(g.bands||{})[id];
  return (typeof v==='string'&&v)?v:(v?id:'');
}
/* Ordre de difficulte d un exercice a bande, du plus facile au plus dur,
   independant de tout inventaire : resistance = jaune -> vert (bnd0 ajoute le
   barreau 'aucune' en bas), assistance = vert -> jaune (moins d aide = plus
   dur). L ordre appartient a l echelle, jamais a l inventaire : c est lui qui
   permet de comparer deux barreaux quand l un des deux n est pas disponible.
   Le pseudo-barreau 'aucune' est structurel, genere selon le drapeau de
   l exercice, jamais membre de l inventaire. */
function bandOrder(e){
  const ids=BANDS.map(b=>b.id);
  if(e.bnd==='ass') return ids.reverse();
  return (e.bnd0?['aucune']:[]).concat(ids);
}
/* echelle realisable ici : l ordre de l exercice, filtre par l inventaire */
function bandLadder(e,gear){
  const own=ownedBands(gear);
  return bandOrder(e).filter(b=>b==='aucune'||own.indexOf(b)>=0);
}
/* Bornage a la lecture. Le niveau prescrit est le niveau disponible le plus
   difficile qui ne depasse pas le niveau canonique : le bornage ne durcit
   jamais. Le comparateur porte sur la difficulte et jamais sur la raideur,
   d ou la lecture de l ordre de l echelle plutot que de la couleur : pour une
   bande d assistance, plus difficile signifie plus faible.
   Cas ou tout le disponible est plus dur : on rend le plus facile disponible et
   on leve le drapeau up. C est exactement ce que la v1.18 ecrivait dans perf,
   qui devient ici une lecture, donc reversible. */
function bandBorne(e,cur,gear){
  const L=bandLadder(e,gear);
  if(!L.length) return {band:null,up:false,cut:false};
  if(L.indexOf(cur)>=0) return {band:cur,up:false,cut:false};
  const O=bandOrder(e), r=O.indexOf(cur);
  if(r<0) return {band:L[0],up:false,cut:true};
  let best=null;
  for(const b of L) if(O.indexOf(b)<=r) best=b;
  if(best!=null) return {band:best,up:false,cut:true};
  return {band:L[0],up:true,cut:false};
}
function bandInfo(id){for(const b of BANDS) if(b.id===id) return b; return null;}
/* Fourchette de tension d un niveau : sa seule identite stable d un profil a
   l autre, puisque la realisation, elle, change de main. */
function bandRange(id){const b=bandInfo(id);return b?b.lbs:'';}
/* Rang affiche d un niveau, 1 pour le plus faible. Il ne sert qu a desambiguer
   un doublon de couleur : la position dans l echelle depend de l inventaire,
   l identite du niveau non. */
function bandRang(id){for(let i=0;i<BANDS.length;i++) if(BANDS[i].id===id) return i+1; return 0;}
/* Deux niveaux tenus par la meme couleur dans le profil actif : cas reel d un
   jeu etranger a deux bleues de tensions differentes. Le doublon est autorise,
   il est seulement leve a l affichage, et seulement quand il est effectif ici. */
function bandDouble(id,gear){
  const r=bandReal(id,gear); if(!r) return false;
  return BANDS.filter(b=>bandReal(b.id,gear)===r).length>1;
}
/* Le libelle nomme la realisation du profil actif et non la cle du niveau :
   c est ce que l utilisateur a sous la main qu il faut lui dire. Sans
   realisation, on retombe sur la fourchette de tension, qui est vraie partout. */
function bandNom(id,gear){
  if(id==='aucune') return '';
  const r=bandReal(id,gear);
  if(!r) return bandRange(id);
  return coulLbl(r)+(bandDouble(id,gear)?', niveau '+bandRang(id):'');
}
function bandLabel(id){
  if(id==='aucune') return 'sans bande';
  return 'bande '+bandNom(id);
}
/* La pastille porte la couleur de la realisation. Le liseré n est pas
   decoratif : sans lui la blanche disparait en theme clair et la noire en
   theme sombre. */
function bandDot(id){
  const h=coulHex(bandReal(id));
  return h?'<i class="bdot" style="background:'+h+'"></i>':'';
}
function nextBandFor(e,cur,gear,dir){
  const L=bandLadder(e,gear); if(!L.length) return null;
  const i=L.indexOf(cur);
  if(i<0) return L[0];
  const j=i+dir; return (j>=0&&j<L.length)?L[j]:null;
}
/* ============ LESTES SCRATCHABLES ============ */
/* Increments possibles en kg selon les paires possedees, 0 inclus, croissants
   (v2.0). Les lestes se superposent sur un meme membre : l echelle est donc
   l ensemble des sommes de sous-ensembles des paires declarees, dedoublonne.
   La v1.2 enumerait les trois cas d un inventaire a deux paires ; la troisieme
   paire de 0,5 kg en produirait sept, et une quatrieme quinze. */
/* Les lestes portent un drapeau de presence depuis la v2.1, sur le modele de
   hal : il masque sans detruire, donc le relever restitue exactement les
   paires declarees et il n y a rien a memoriser. */
function aCuff(gear){
  const g=gear||DEFAULT_GEAR;
  return !!(g.res||{}).cuff&&CUFF_W.some(w=>(g.cuffs||{})[w]);
}
function cuffSteps(gear,limbs){
  const g=gear||DEFAULT_GEAR, c=aCuff(g)?(g.cuffs||{}):{};
  const w=CUFF_W.filter(k=>c[k]).map(parseFloat);
  let S=[0];
  w.forEach(x=>{ S=S.concat(S.map(v=>Math.round((v+x)*100)/100)); });
  return [...new Set(S)].sort((a,b)=>a-b).map(v=>Math.round(v*limbs*100)/100);
}
/* Masse mobilisable dans un sac a dos (v2.5). Somme tout ce que l inventaire
   declare de pesant, sans distinguer la forme : un disque, une barre, une
   kettlebell et une paire de lestes sont du poids une fois dans le sac. Chaque
   famille reste soumise a son propre drapeau de presence, meme discipline
   qu aRes : masquer les halteres masque leurs disques ici aussi.
   Sert a trois choses et une seule fonction les porte : decider si la position
   est servie, engendrer les barreaux, fixer le plafond. Aucune constante de
   plafond a maintenir, il monte tout seul quand du materiel est declare. */
function masseMobilisable(gear){
  const g=gear||DEFAULT_GEAR;
  let m=0;
  if((g.res||{}).hal){
    const P=g.plates||{};
    PLATE_W.forEach(w=>{ if(P[w]) m+=parseFloat(w)*P[w]; });
    m+=(g.bars||0)*(g.bar||0);
  }
  if((g.res||{}).kb){ const K=g.kbs||{}; KB_W.forEach(w=>{ if(K[w]) m+=parseFloat(w)*K[w]; }); }
  if(aCuff(g)){ const C=g.cuffs||{}; CUFF_W.forEach(w=>{ if(C[w]) m+=parseFloat(w)*C[w]*2; }); }
  return Math.round(m*100)/100;
}
/* Pas de l echelle du sac (v2.5). Dix kilos, et le nombre n est pas pose au
   hasard : un barreau doit valoir au moins dix pour cent de ce que porte le
   mollet, et ce mollet porte le poids du corps. Dix kilos est le plus petit
   nombre rond qui satisfait la regle de 65 a 90 kg de poids de corps, que le
   mollet travaille seul ou a deux, la charge et la base doublant ensemble.
   Un pas de cinq a ete mesure par la methode du carnet, celle qui a ecarte le
   micro-palier des halteres en v2.1 : le cliquet ramene la cible au bas de
   fourchette a chaque montee, donc le prix en repetitions est fixe et le gain
   en charge ne l est pas. Sur une jambe, fourchette 8-15, poids de corps 78 kg,
   un saut de 10 a 15 kg gagne 5,7 % de charge et coute 43,6 % de tonnage, un
   saut de 10 a 20 kg gagne 11,4 % et coute 40,6 %. Meme verdict qu au
   developpe au sol : le petit palier coute plus et rapporte moitie moins. */
const PAS_SAC=10;
/* Exercices dont la charge se porte dans le sac plutot qu en main. Le choix du
   sac contre la kettlebell tenue est un choix d epaule avant d etre un choix
   de prehension : quinze repetitions par cote avec vingt kilos au bout d un
   bras tirent sur la gleno-humerale, et les deux mains restent libres pour
   l equilibre sur une jambe au bord d une marche. */
const SAC_EX=['mollets-debout-leste','mollets-une-jambe-leste'];
/* Echelle de la charge posee sur les hanches (v2.13). Meme pas que le sac, dix
   kilos, et pour la meme methode : le cliquet ramene la cible au bas de
   fourchette a chaque montee, donc le prix en repetitions est fixe et le gain
   en charge ne l est pas. Un pas de cinq rendrait +10,6 % de charge pour le
   meme prix la ou dix en rendent +33 %.
   Le plafond est une CONSTANTE, seul endroit du catalogue ou la masse declaree
   ne decide pas seule, et il porte deux raisons distinctes selon la fiche.
   Sur pont-fessier-leste il est structurel : avec la charge posee sur le
   bassin, +30 kg vaut deja le pont sur une jambe et +40 passe au-dessus, donc
   au-dela de 20 l escalier cesserait d etre monotone et la marche suivante
   deviendrait un doublon puis une regression. Le dernier barreau est celui qui
   reste strictement sous la marche suivante.
   Sur hip-thrust-une-jambe-leste, dernier maillon, il n est que montage : une
   charge improvisee sur le bassin cesse d etre stable bien avant d etre
   insuffisante. C est le seul des deux qui pourra bouger un jour.
   Dix kilos sur le bassin ne valent pas dix kilos de poids de corps : ce qui
   monte au poids du corps le fait d une demi-amplitude, le tronc pivotant sur
   les epaules et la cuisse sur le genou, quand la charge posee sur les hanches
   monte de l amplitude entiere. Elle compte donc double, +33 % de resistance
   pour dix kilos, et c est ce calcul qui a ramene l escalier de quatre
   barreaux a deux. */
const HANCHES_EX=['pont-fessier-leste','hip-thrust-une-jambe-leste'];
const PAS_HANCHES=10, CAP_HANCHES=20;
/* Echelle numerique des exercices a charge fixe (v2.1, multi-kettlebells).
   Regle des totaux ambigus : les lestes ne comblent que l intervalle jusqu a
   la kettlebell possedee suivante, et prolongent librement au-dela de la plus
   lourde. Un total est donc toujours tenu par UN montage, celui qui emploie la
   kettlebell la plus lourde disponible : c est le montage le plus simple, le
   moins d objets, et sur un swing le moins de scratchs sur un segment en
   mouvement. Mesure sur 8/10/12/14/16/20 avec les trois paires : l union brute
   donne 20 totaux dont 14 ambigus, la regle donne 20 barreaux sans un seul
   doublon, avec des ecarts relatifs decroissants de 12,5 a 3,8 %. Controle de
   non-regression : avec la seule kettlebell de 10, l echelle reste 10 a 17. */
function fixedLadder(id,gear){
  const g=gear||DEFAULT_GEAR;
  /* Echelle du sac (v2.5) : des multiples du pas, bornes par la masse declaree.
     Elle ne passe pas par les montages kettlebell plus lestes, qui resserrent
     leurs ecarts a mesure que la charge monte parce que l engin y EST la
     charge. Ici l engin s ajoute au poids du corps : dix kilos valent onze pour
     cent sur un mollet, un kilo en vaut un et trois dixiemes. Meme echelle,
     sens dix fois plus petit, donc echelle differente. */
  if(SAC_EX.indexOf(id)>=0){
    const m=masseMobilisable(g), out=[];
    for(let v=PAS_SAC;v<=m+0.001;v+=PAS_SAC) out.push({v:v,lbl:'sac '+fmtNum(v)+' kg'});
    return out;
  }
  /* Echelle des hanches (v2.13), meme forme que celle du sac, bornee en plus
     par une constante. L inventaire continue de borner par le bas : qui ne
     declare que dix kilos n a qu un barreau, et le verrou loadTop lit cette
     echelle-la, donc il exige dix et non vingt. Passer par fixedCap aurait
     produit un verrou inatteignable : checkUnlocks lit le dernier barreau de
     fixedLadder sans appliquer le plafond, quand applyProgress le respecte
     pour monter. */
  if(HANCHES_EX.indexOf(id)>=0){
    const top=Math.min(masseMobilisable(g),CAP_HANCHES), out=[];
    for(let v=PAS_HANCHES;v<=top+0.001;v+=PAS_HANCHES) out.push({v:v,lbl:fmtNum(v)+' kg sur les hanches'});
    return out;
  }
  const limbs=(id==='rowing-kettlebell')?1:2;
  /* v2.18 : kbSeules, l echelle ne garde que les kettlebells declarees, sans
     lestes. Premier usage, le squat sur une jambe leste : deux kilos de lestes
     y valent environ 3 % de la charge sur la jambe, et Gabriel a refuse ces
     barreaux pour cet exercice. La marche suivante est la kettlebell plus
     lourde a declarer, que KB_NEXT compose deja. */
  const seules=typeof DB!=='undefined'&&!!(DB[id]&&DB[id].kbSeules);
  const KB=kbOwned(g), steps=seules?[0]:cuffSteps(g,limbs), out=[];
  const lbl=(k,a)=>a?('KB '+fmtNum(k)+' kg + leste'+(limbs>1?'s':'')+' '+fmtNum(a)+' kg'):('KB '+fmtNum(k)+' kg');
  KB.forEach((k,i)=>{
    const nx=KB[i+1];
    steps.forEach(a=>{
      const v=Math.round((k+a)*100)/100;
      if(nx===undefined||v<nx-0.001) out.push({v:v,lbl:lbl(k,a)});
    });
  });
  if(id==='rowing-kettlebell'){
    /* Le segment haltere ne prend le relais qu au-dessus de tout ce que les
       kettlebells savent faire : tant qu un poids superieur existe, la charge
       reste sur la kettlebell, qui est le geste de l exercice. */
    const top=out.length?out[out.length-1].v:0;
    const mono=loadLadderMonoProg(g).filter(v=>v>top+0.01);
    mono.forEach(v=>out.push({v:v,lbl:'haltère '+fmtNum(v)+' kg'}));
    if(mono.length){
      const m=mono[mono.length-1];
      cuffSteps(g,1).slice(1).forEach(a=>out.push({v:Math.round((m+a)*100)/100,lbl:'haltère '+fmtNum(m)+' kg + leste '+fmtNum(a)+' kg'}));
    }
  }
  return out;
}
/* Plafond de charge par exercice (v2.1). La litterature ne donne pas de
   nombre pour le swing : elle donne une regle de forme, la charge cesse de
   monter quand la charniere se degrade en squat, ce que l outil ne peut pas
   mesurer. Un chiffre en kilos serait pose et non source. Le plafond est donc
   derive : on ne lance pas en balistique plus lourd qu on ne tient en
   controle sur le meme schema moteur, et c est deja le souleve roumain qui
   ouvre le verrou des swings. Il monte tout seul, sans constante a maintenir. */
const FIXED_CAP={'kb-swings':'rdl-kettlebell'};
function fixedCap(id){
  const src=FIXED_CAP[id];
  if(!src||typeof state==='undefined'||!state||!state.perf||!state.perf[src]) return null;
  const v=state.perf[src].load;
  return (typeof v==='number'&&v>0)?v:null;
}
/* Meme bornage que pour les bandes, sur une echelle numerique : la charge
   prescrite est la plus lourde disponible qui ne depasse pas la charge
   canonique. Si tout le disponible est plus lourd, on rend la plus legere et on
   leve up. Vaut pour les deux echelles chargees, halteres et charge fixe. */
function loadBorne(id,cur,gear){
  const e=(typeof DB!=='undefined')?DB[id]:null;
  const L=(e&&e.mode==='fixed')?fixedLadder(id,gear).map(x=>x.v):loadLadder(gear);
  if(!L.length) return {load:cur,up:false,cut:false};
  let best=null;
  for(const v of L) if(v<=cur+0.01) best=v;
  if(best!=null) return {load:best,up:false,cut:Math.abs(best-cur)>0.01};
  return {load:L[0],up:true,cut:false};
}
function loadLabelFor(id,v){
  const e=DB[id];
  if(e&&e.mode==='fixed'){
    const L=fixedLadder(id,typeof state!=='undefined'&&state?state.gear:null);
    for(const x of L) if(Math.abs(x.v-v)<0.01) return x.lbl;
  }
  return fmtKg(v);
}
/* ajustement manuel : echelle complete, le geste est ponctuel et humain */
function nextLoad(cur,gear,dir){ return stepIn(loadLadder(gear),cur,dir); }
/* cliquet automatique, montee comme filet de securite : echelle de progression */
function nextLoadProg(cur,gear,dir){ return stepIn(loadLadderProg(gear),cur,dir); }
function stepIn(L,cur,dir){
  if(dir>0){ for(const v of L) if(v>cur+0.01) return v; return cur; }
  for(let i=L.length-1;i>=0;i--) if(L[i]<cur-0.01) return L[i];
  return cur;
}
/* Un seul formateur de nombre pour toute l application : la virgule est le
   separateur decimal en francais, et six points d affichage la produisaient a
   la main. fmtKg lui ajoute l unite. */
function fmtNum(v){return (Math.round(v*100)/100).toString().replace('.',',');}
function fmtKg(v){return fmtNum(v)+' kg';}
