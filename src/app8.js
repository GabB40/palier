/* ============ REGLAGES ============ */
/* Fourchette de duree d une option (v1.14). Reglages annonçait une moyenne sur
   tous les exercices des viviers, verrouilles compris, alors qu ils ne peuvent
   pas etre tires : le chiffre etait systematiquement bas et ne retombait pas
   sur celui de l accueil. Et une moyenne ne dit rien quand le cout d une serie
   va de 31 a 70 s selon l exercice. On balaie donc les tirages reellement
   possibles, remontages compris, et on annonce les deux bornes. Le cout de
   chaque exercice ne depend pas de la combinaison : on le calcule une fois. */
function poolsFor(){
  return SLOT_ORDER.map(s=>{
    const p=SLOTS[s].pool.filter(id=>!isLocked(id)&&!estRetire(id));   /* meme filtre que pickFromPool */
    return p.length?p:[SLOTS[s].pool[0]];
  });
}
function warmSecOf(warm){
  return warm==='aucun'?0:(warm==='court'?WARM_SHORT.reduce((a,i)=>a+WARMUP[i].s,0)
                                          :WARMUP.reduce((a,x)=>a+x.s,0));
}
function comboRemounts(pick,rounds){
  const last={}; let n=0;
  for(let r=0;r<rounds;r++) for(let i=0;i<pick.length;i++){
    const id=pick[i], k=gearKey(id); if(!k) continue;
    const c=prescLoad(id);
    if(last[k]!=null&&Math.abs(last[k]-c)>0.01) n++;
    last[k]=c;
  }
  return n;
}
function sessionSpan(rounds,cardio,warm,trans){
  const w=warmSecOf(warm), tr=(trans==null?transSec():trans);
  const pools=poolsFor(), n=pools.length;
  const cool=(state.stretch!==false)?stretchesFor().reduce((a,id)=>a+serieSec(id,false),0):0;
  /* Les rounds*n-1 repos d une seance ne sont pas tous au meme tarif :
     rounds-1 d entre eux sont des raccords de tour, le dernier n etant pas
     emis, et les rounds*(n-1) autres des transitions. Sans cette separation,
     la fourchette annoncee ici s ecarterait de l estimation de l accueil.
     v2.11 : le tarif du raccord depend de la paire, donc il se calcule dans
     l enumeration et non dans la base. Liste vide, les deux bornes retombent
     sur la formule d avant la v2.10, ce qui est le comportement voulu. */
  const base=w+rounds*(n-1)*tr+(cardio?CARDIO_SEC:0)+cool;
  const cost={};
  pools.forEach(p=>p.forEach(id=>{ if(cost[id]==null) cost[id]=serieSec(id,false); }));
  let lo=Infinity, hi=0;
  const pick=new Array(n);
  (function walk(i,sum){
    if(i===n){
      const rac=(rounds-1)*(pauseAu(pick[n-1],pick[0])?PAUSE_TOUR:tr);
      const sec=base+rac+rounds*sum+comboRemounts(pick,rounds)*REMOUNT;
      if(sec<lo) lo=sec;
      if(sec>hi) hi=sec;
      return;
    }
    pools[i].forEach(id=>{ pick[i]=id; walk(i+1,sum+cost[id]); });
  })(0,0);
  if(lo===Infinity) lo=hi=base;
  return {min:Math.round(lo/60),max:Math.round(hi/60),rounds:rounds};
}
/* libelle des postes reellement inclus dans le chiffre annonce : il suivait
   les options dans le calcul mais pas dans la phrase, qui parlait toujours
   d echauffement et d etirements compris (v1.14) */
function partsLabel(warm,cardio,stretch){
  const inc=[];
  if(warm==='complet') inc.push('échauffement complet');
  else if(warm==='court') inc.push('échauffement court');
  if(cardio) inc.push('cardio');
  if(stretch) inc.push('étirements');
  if(!inc.length) return 'exercices seuls';
  const s=inc.length>1?inc.slice(0,-1).join(', ')+' et '+inc[inc.length-1]:inc[0];
  return (warm==='aucun'?'sans échauffement, ':'')+s+' compris';
}
function spanLbl(s){ return s.min===s.max?s.min+' min':s.min+' à '+s.max+' min'; }
function weeklySets(){
  /* series hebdomadaires par groupe musculaire, a l objectif hebdo courant.
     La structure alternee garantit un exercice de chaque groupe a chaque
     seance : le volume par groupe est donc le volume par exercice. */
  return roundsOf(state)*state.goal;
}
/* Card de reglage repliable. Fermee, la ligne porte la valeur courante :
   l etat complet de la configuration se lit sans un seul clic, on n ouvre
   que pour modifier ou relire la justification. */
function setCard(titre,valeur,contenu){
  const k='set-'+titre.replace(/[^0-9A-Za-zÀ-ÿ]+/g,'-').toLowerCase();
  return '<details class="card" data-k="'+k+'"'+cardOpen(k,false)+'><summary><span class="ttl">'+titre+'</span><span class="val">'+valeur+'</span></summary>'+contenu+'</details>';
}
/* ============ CONTROLES DE LA CARD MATERIEL (v2.0) ============
   Plus aucun dialogue systeme et plus aucun bouton dont l etat est un mot.
   Un interrupteur porte la presence, une pastille porte la realisation d un
   niveau, un couple moins-plus porte un nombre. Tous vivent dans la meme
   colonne de droite, celle des controles : c est la position qui dit qu une
   chose se touche, pas une phrase d explication.
   Les questions ouvertes, nommer un profil, en supprimer un, tout remettre a
   zero, quitter une seance, passent par un etat ponctuel qui n entre jamais
   dans state : il ne survit ni au changement de vue ni au rechargement. */
let uiAsk=null;          /* question en cours : 'newprofil', 'delprofil', 'reset', 'syncoff', 'syncdel' */
function uiAskSet(k){ uiAsk=(uiAsk===k)?null:k; pfSrc=''; pfNom=''; render(); }
function uiVal(id){ const el=$('#'+id); return el?String(el.value||'').trim():''; }
function toggleRes(k){
  state.gear.res=state.gear.res||{};
  state.gear.res[k]=state.gear.res[k]?0:1;
  save(); render();
}
/* Un niveau tenu, c est une realisation non vide : choisir une couleur declare
   la presence, choisir « je n ai pas cette bande ici » la retire. Une seule
   donnee, donc aucun etat a memoriser pour un niveau absent. */
function setBandReal(id,c){
  state.gear.bands=state.gear.bands||{};
  state.gear.bands[id]=c||'';
  syncPresence('elast');
  bandPick=null;
  save(); render();
}
/* Invariant des sections a presence derivee (v2.1). L interrupteur de section
   est un masque non destructif, comme celui des halteres sur les disques : il
   cache sans effacer, donc le relever restitue exactement ce qui etait
   declare. Reste un etat qui mentirait, « leve et vide » : declarer quelque
   chose leve le drapeau, retirer le dernier element le baisse, et
   l interrupteur ne s affiche pas tant que la section est vide, puisqu il n y
   a rien a masquer. */
function syncPresence(k){
  state.gear.res=state.gear.res||{};
  const plein=k==='elast'?ownedBands(state.gear).length>0
    :k==='cuff'?CUFF_W.some(w=>(state.gear.cuffs||{})[w])
    :kbOwned(state.gear).length>0;
  state.gear.res[k]=plein?1:0;
}
let bandPick=null;
function toggleBandPick(id){ bandPick=(bandPick===id)?null:id; render(); }
/* Un type de disque entre a QUATRE exemplaires et non a deux. Mesure : le stock
   se divise par le nombre de barres puis par les deux extremites, si bien qu un
   type a deux exemplaires ne produit aucun montage symetrique et laisse
   l echelle de progression inchangee, 23 paliers. A quatre, elle passe a 30 et
   le sommet de 14,5 a 17,5 kg. Ajouter un type doit faire quelque chose. */
function addPlate(w){
  state.gear.plates=state.gear.plates||{};
  state.gear.plates[w]=(state.gear.plates[w]||0)+4;
  save(); render();
}
let pfSrc='';        /* source d inventaire choisie, ephemere comme uiAsk */
let pfNom='';        /* saisie reportee : choisir une source declenche un rendu */
/* Choisir une source est un clic, donc un rendu, donc la saisie serait perdue :
   on la releve avant et le champ se reecrit avec. Meme raison que la lecture
   au clic, jamais a la frappe. */
function pfPick(id){
  pfNom=uiVal('pfnom');
  pfSrc=(pfSrc===id)?'':id;
  render();
}
function newProfilOK(){
  const v=uiVal('pfnom')||pfNom;
  if(!v){ flash('Donne un nom à ce profil'); return; }
  const src=pfSrc; uiAsk=null; pfSrc=''; pfNom='';
  addProfil(v,src);
}
function renameProfilOK(){
  const v=uiVal('pfren');
  if(!v){ flash('Donne un nom à ce profil'); return; }
  uiAsk=null; renameProfil(profilId(),v);
}
function delProfilOK(){ const id=profilId(); uiAsk=null; delProfil(id); }
/* Ouvrir la card Materiel et s y rendre. L ouverture s ecrit dans le HTML au
   moment ou la card s ecrit (v1.14), donc on la pose avant le rendu ; le
   defilement, lui, ne peut avoir lieu qu apres, la card n existant pas encore. */
function goMateriel(){
  pendingCard='set-matériel';
  go('set');            /* rend la vue, PUIS remonte en haut */
  scrollToCard();       /* le trajet vers la card doit donc venir apres go() */
}
/* meme mecanique pour le lien que porte chaque fiche (v2.12) */
function goComment(){
  pendingCard='set-comment-ça-marche';
  go('set');
  scrollToCard();
}
let pendingCard=null;
function scrollToCard(){
  if(!pendingCard) return;
  const k=pendingCard; pendingCard=null;
  try{
    const el=document.querySelector('details[data-k="'+k+'"]');
    if(el&&el.scrollIntoView) el.scrollIntoView({block:'start'});
  }catch(e){}
}
/* ============ CARD MATERIEL (v2.0) ============
   Une section par ressource. Le switch porte la presence, le depliage porte le
   detail, le chevron est celui des autres cards de Reglages. La chip du profil
   est en tete : elle ferme le piege « je modifie l inventaire de chez Marc en
   croyant etre chez moi ». Les deux compteurs sont en pied, schemas servis et
   progressions disponibles.
   Le switch vit dans le summary et arrete la propagation : sans cela il
   deplierait la section qu il eteint. */
function swHtml(on,fn,lbl){
  return '<button class="sw'+(on?' on':'')+'" role="switch" aria-checked="'+(on?'true':'false')+'" aria-label="'+esc(lbl)+'"'+
    ' onclick="event.preventDefault();event.stopPropagation();'+fn+'"><i></i></button>';
}
function stepHtml(fn,val,lblM,lblP){
  return '<span class="row"><button class="quiet" style="padding:4px 10px" onclick="'+fn+'(-1)" aria-label="'+esc(lblM)+'">−</button>'+
    '<b class="num">'+val+'</b><button class="quiet" style="padding:4px 10px" onclick="'+fn+'(1)" aria-label="'+esc(lblP)+'">+</button></span>';
}
/* section repliable interne a la card : meme chevron, cle d ouverture propre */
function matSec(k,titre,sous,ctl,detail){
  return '<details class="msec" data-k="mat-'+k+'"'+cardOpen('mat-'+k,false)+'>'+
    '<summary><span class="mtit"><b>'+esc(titre)+'</b>'+(sous?'<span class="muted small">'+sous+'</span>':'')+'</span>'+
    (ctl||'')+'</summary>'+
    '<div class="mdet">'+detail+'</div></details>';
}
function resRow(k){
  return '<div class="histline"><span class="mtit"><b style="font-weight:400">'+esc(RES_LBL[k])+'</b>'+
    (RES_SUB[k]?'<span class="muted small">'+esc(RES_SUB[k])+'</span>':'')+'</span>'+
    swHtml(aRes(k),'toggleRes(\''+k+'\')',RES_LBL[k])+'</div>';
}
function halDetail(){
  const L=loadLadderProg(state.gear), A=loadLadder(state.gear);
  const rest=PLATE_W.filter(w=>!(state.gear.plates||{})[w]);
  let ecart=null;
  for(let i=1;i<L.length;i++){ const d=Math.round((L[i]-L[i-1])*100)/100; if(ecart==null||d<ecart) ecart=d; }
  return '<div class="histline"><span>Barres de '+fmtKg(state.gear.bar)+'</span><span class="num">× '+state.gear.bars+'</span></div>'+
    PLATE_W.filter(w=>(state.gear.plates||{})[w]).map(w=>
      '<div class="histline"><span>Disques de '+fmtNum(parseFloat(w))+' kg</span><span class="row">'+
      '<button class="quiet" style="padding:4px 10px" onclick="adjPlate(\''+w+'\',-2)" aria-label="Deux disques de moins">−</button>'+
      '<b class="num">'+state.gear.plates[w]+'</b>'+
      '<button class="quiet" style="padding:4px 10px" onclick="adjPlate(\''+w+'\',2)" aria-label="Deux disques de plus">+</button>'+
      '</span></div>').join('')+
    '<div class="histline"><span>Disques max par extrémité <span class="muted small">sécurité manchon</span></span>'+
    stepHtml('adjMaxEnd',(state.gear.maxPerEnd||5),'Un disque de moins par extrémité','Un disque de plus par extrémité')+'</div>'+
    (rest.length?'<div class="histline"><span class="muted small">Ajouter un type de disque</span><span class="chipline" style="justify-content:flex-end">'+
      rest.map(w=>'<button class="ghost" style="padding:4px 10px;font-size:.78rem" onclick="addPlate(\''+w+'\')">'+fmtNum(parseFloat(w))+' kg</button>').join('')+'</span></div>':'')+
    (L.length>1
      ? '<div class="muted small mt"><b>'+L.length+' paliers de progression</b>, de '+fmtKg(L[0])+' à '+fmtKg(L[L.length-1])+
        ', plus petit écart '+fmtKg(ecart)+'. Haltère seul, tout le stock : jusqu\'à '+fmtKg(loadLadderMono(state.gear).slice(-1)[0]||0)+'.</div>'+
        '<div class="muted small">L\'échelle complète, ajustement à la main et séance allégée, compte '+A.length+' paliers : elle admet un disque sur une seule extrémité, que le cliquet automatique n\'emprunte pas.</div>'
      : '<div class="muted small mt">Aucun disque déclaré : les barres seules donnent '+fmtKg(A[0]||0)+'.</div>');
}
function bandDetail(){
  return '<div class="muted small">Un niveau est un cran de tension. Tape la pastille pour dire quelle bande le tient ici.</div>'+
    BANDS.map(b=>{
      const r=bandReal(b.id), h=coulHex(r);
      return '<div class="histline"'+(r?'':' style="opacity:.55"')+'><span class="mtit"><b style="font-weight:400">'+esc(b.lbs)+'</b>'+
        '<span class="muted small">Niveau '+bandRang(b.id)+(r?' · bande '+esc(coulLbl(r)):' · non tenu ici')+'</span></span>'+
        '<button class="pastille" onclick="toggleBandPick(\''+b.id+'\')" aria-label="Bande du niveau '+bandRang(b.id)+'">'+
        '<i'+(h?' style="background:'+h+'"':' class="vide"')+'></i></button></div>'+
        (bandPick===b.id
          ? '<div class="nuancier">'+PAL.map(c=>'<button class="teinte" style="background:'+c[2]+'" onclick="setBandReal(\''+b.id+'\',\''+c[0]+'\')" aria-label="'+c[1]+'"></button>').join('')+
            '<div><button class="ghost" style="padding:5px 12px;font-size:.78rem;border-style:dashed" onclick="setBandReal(\''+b.id+'\',\'\')">Je n\'ai pas cette bande ici</button></div></div>'
          : '');
    }).join('')+
    (function(){
      const d=[];
      BANDS.forEach(b=>{ const r=bandReal(b.id); if(r&&bandDouble(b.id,state.gear)&&d.indexOf(r)<0) d.push(r); });
      return d.length?'<div class="muted small mt">Deux niveaux partagent la couleur '+esc(coulLbl(d[0]))+' : les prescriptions préciseront lequel, « bande '+esc(coulLbl(d[0]))+', niveau 4 ».</div>':'';
    })()+
    '<div class="muted small mt">En résistance, progresser monte l\'échelle ; en assistance aux tractions, progresser la descend. Chez quelqu\'un d\'autre, déclare sa bande sur le niveau dont la tension se rapproche le plus : c\'est ton jugement qui fait la correspondance, ta position par rapport à l\'ancrage règle le reste.</div>'+
    '<div class="muted small mt">Avant chaque séance de tractions : inspecter la bande tendue (micro-fissures, zones blanchies ou mates), jamais au-delà de 2,5 fois la longueur de repos, jamais d\'ancrage sur arête vive.</div>';
}
function kbDetail(){
  const owned=kbOwned(state.gear), rest=KB_W.filter(w=>!(state.gear.kbs||{})[w]);
  return owned.map(k=>'<div class="histline"><span>Kettlebell de '+fmtNum(k)+' kg</span>'+
      swHtml(true,'toggleKb(\''+k+'\')','Kettlebell de '+fmtNum(k)+' kg')+'</div>').join('')+
    (rest.length?'<div class="histline"><span class="muted small">Ajouter une kettlebell</span><span class="chipline" style="justify-content:flex-end">'+
      rest.map(w=>'<button class="ghost" style="padding:4px 10px;font-size:.78rem" onclick="addKb(\''+w+'\')">'+fmtNum(parseFloat(w))+' kg</button>').join('')+'</span></div>':'')+
    (owned.length
      ? '<div class="muted small mt">Goblet squat, soulevé roumain et swings : '+fixedLadder('goblet-squat',state.gear).length+' barreaux, de '+
        fmtKg(fixedLadder('goblet-squat',state.gear)[0].v)+' à '+fmtKg(fixedLadder('goblet-squat',state.gear).slice(-1)[0].v)+
        '. Les lestes ne comblent que l\'intervalle jusqu\'à la kettlebell suivante : à total égal, c\'est toujours la kettlebell la plus lourde qui est prescrite.</div>'
      : '<div class="muted small mt">Aucune kettlebell déclarée : les exercices qui en dépendent passent sur leur substitut.</div>');
}
function addKb(w){
  state.gear.kbs=state.gear.kbs||{};
  state.gear.kbs[w]=1;
  syncPresence('kb');
  save(); render();
}
function cuffDetail(){
  const s2=cuffSteps(state.gear,2).filter(v=>v>0);
  return CUFF_W.map(w=>'<div class="histline"><span>Paire de '+fmtNum(parseFloat(w))+' kg</span>'+
      swHtml(!!(state.gear.cuffs||{})[w],'toggleCuff(\''+w+'\')','Paire de '+w+' kg')+'</div>').join('')+
    (s2.length
      ? '<div class="muted small mt">Superposables sur un même membre : ils ajoutent '+s2.map(v=>fmtNum(v)).join(' · ')+' kg aux exercices à kettlebell, deux poignets comptés.</div>'
      : '<div class="muted small mt">Aucun leste déclaré : les exercices à kettlebell restent à 10 kg.</div>');
}
function matCardHtml(){
  const c=schemasServis(state.gear), pr=progDispo(state.gear), perdus=schemasPerdus(state.gear);
  const nb=BANDS.filter(b=>bandReal(b.id)).length;
  return '<div class="chipline" style="margin:2px 0 8px"><span class="chip prof">'+esc(profilNom())+'</span></div>'+
    '<div class="muted small">Ce que tu as ici. Le mobilier n\'est pas déclaré : chaise, mur et tapis sont supposés présents partout.</div>'+

    matSec('hal','Haltères réglables',
      aRes('hal')?(loadLadderProg(state.gear).length+' paliers · jusqu\'à '+fmtKg(loadLadderProg(state.gear).slice(-1)[0]||0)):'Absents',
      swHtml(aRes('hal'),'toggleRes(\'hal\')','Haltères réglables'), halDetail())+

    matSec('elast','Élastiques',
      nb?(aRes('elast')?nb+' niveau'+(nb>1?'x':'')+' tenu'+(nb>1?'s':'')+' sur '+BANDS.length:'Absents'):'Aucun niveau tenu ici',
      nb?swHtml(aRes('elast'),'toggleRes(\'elast\')','Élastiques'):'', bandDetail())+

    matSec('kb','Kettlebells',
      kbOwned(state.gear).length?(aRes('kb')?kbOwned(state.gear).map(k=>fmtNum(k)).join(' · ')+' kg':'Absentes'):'Aucune',
      kbOwned(state.gear).length?swHtml(aRes('kb'),'toggleRes(\'kb\')','Kettlebells'):'', kbDetail())+

    matSec('cuff','Lestes scratchables',
      (function(){const n=CUFF_W.filter(w=>(state.gear.cuffs||{})[w]).length;
        return n?(aCuff(state.gear)?n+' paire'+(n>1?'s':''):'Absents'):'Aucune';})(),
      CUFF_W.some(w=>(state.gear.cuffs||{})[w])?swHtml(aCuff(state.gear),'toggleRes(\'cuff\')','Lestes scratchables'):'', cuffDetail())+

    '<div class="msec plat">'+
    RES_ORDER.filter(k=>['hal','kb','elast'].indexOf(k)<0).map(resRow).join('')+
    '</div>'+

    (perdus.length
      ? '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px"><div class="small"><b>'+perdus.length+' schéma'+(perdus.length>1?'s':'')+' non servi'+(perdus.length>1?'s':'')+' avec cet inventaire.</b></div><div class="chipline">'+perdus.map(n=>'<span class="chip off">'+esc(n)+'</span>').join('')+'</div></div>'
      : '')+
    '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px">'+
      '<div class="small"><b>'+c.servis+' schémas moteurs servis sur '+c.total+'.</b></div>'+
      '<div class="small" style="margin-top:4px"><b>'+pr.marche+' exercice'+(pr.marche>1?'s':'')+' sur '+pr.total+' '+(pr.marche>1?'ont':'a')+' encore une marche ici.</b></div>'+
      '<div class="muted small" style="margin-top:2px">Parmi les exercices dont l\'échelle dépend du matériel, ceux qui ont un barreau au-dessus de leur niveau actuel.</div>'+
    '</div>'+
    (state.onboard
      ? '<button class="big mt" onclick="validGear()">Valider mon matériel</button>'+
        '<div class="muted small mt">Tu peux valider une carte vide : sans aucun matériel, l\'outil sert encore les quatre groupes musculaires à chaque séance, au poids du corps. Cette card reste modifiable à tout moment.</div>'
      : '');
}
/* La validation abaisse le drapeau d onboarding et rien d autre : elle ne
   verrouille pas la card, qui reste editable a l identique.
   Elle ecrit false au lieu de supprimer la cle (v2.3). La suppression etait
   sans effet au dela de la session : les deux chemins qui reconstruisent l etat
   partent de defaultState, ou le drapeau vaut true, et Object.assign n ecrase
   que les cles presentes dans la source. Une cle supprimee etant indiscernable
   d une cle jamais ecrite, le bandeau revenait a chaque rechargement. Le
   drapeau est desormais une valeur, jamais une absence. */
function validGear(){
  state.onboard=false;
  save(); render();
  flash('Matériel enregistré');
}

function renderSettings(){
  screenEnter('set');
  if(pendingCard) openCards[pendingCard]=true;
  const eA=sessionSpan(roundsOf(state),state.cardio,state.warm);
  const incl=partsLabel(state.warm,state.cardio,state.stretch!==false);
  const THEME={auto:'Auto',light:'Clair',dark:'Sombre'};
  const WARMLBL={complet:'Complet',court:'Court',aucun:'Aucun'};
  $('#app').innerHTML='<h2 style="margin-bottom:12px">Réglages</h2>'+

  setCard('Données',lastExportLabel(),
   '<div class="muted small mt">Sauvegarde automatique dans le navigateur, liée à ce fichier et ce navigateur. Télécharge une sauvegarde avant de changer de version, d\'emplacement ou d\'appareil.</div>'+
   (state.lastExport?'<div class="muted small mt">Dernier téléchargement le <b>'+fmtDT(state.lastExport).slice(6)+'</b>.</div>'
                    :'<div class="muted small mt">Aucun téléchargement enregistré.</div>')+
   (state.lastImport?'<div class="muted small">Dernier import le <b>'+fmtDT(state.lastImport).slice(6)+'</b>.</div>':'')+
   '<div class="seg mt"><button onclick="downloadData()">Télécharger</button><button class="ghost" onclick="importFile()">Importer un fichier</button></div>'+
   '<details data-k="set-io"'+cardOpen('set-io',false)+'><summary>Copier-coller (repli)</summary>'+
   '<textarea id="io" style="width:100%;margin-top:10px;font-family:var(--mono);font-size:.72rem;height:88px" placeholder="Exporter remplit ce champ · colle une sauvegarde ici puis Importer"></textarea>'+
   '<div class="seg mt"><button class="ghost" onclick="exportData()">Exporter</button><button class="ghost" onclick="importData()">Importer</button></div></details>'+
   (uiAsk==='reset'
     ? '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px"><b class="small">Tout effacer ?</b>'+
       '<div class="muted small mt">Séances, séries, charges, badges, inventaire et profils : tout repart à zéro, et c\'est définitif'+(syncOn()?', sur tous tes appareils synchronisés':'')+'. Télécharge une sauvegarde d\'abord si tu hésites.</div>'+
       '<div class="seg mt"><button class="danger" onclick="resetAll()">Tout effacer</button><button class="quiet" onclick="uiAskSet(\'reset\')">Annuler</button></div></div>'
     : '<button class="danger big mt" onclick="uiAskSet(\'reset\')">Tout réinitialiser</button>'))+

  syncCard()+

  setCard('Objectif hebdomadaire',state.goal+' jours',
   '<div class="stepper mt"><button onclick="setGoal(-1)" aria-label="Un jour de moins">−</button><div class="val num">'+state.goal+'</div><button onclick="setGoal(1)" aria-label="Un jour de plus">+</button></div>'+
   '<div class="muted small mt">Compté en jours actifs, du lundi au dimanche : deux séances le même jour comptent pour un. Mets le chiffre que tu tiendras une mauvaise semaine, pas une bonne.</div>'+
   '<div class="muted small mt">Une semaine de démarrage, ou de reprise après une semaine entièrement vide, ne laisse pas sept jours pour tenir le rythme : son objectif est ramené au prorata des jours disponibles, arrondi au supérieur. Une première séance le vendredi donne '+Math.max(1,Math.min(state.goal,Math.ceil(state.goal*3/7)))+' au lieu de '+state.goal+'.</div>')+

  setCard('Séries par exercice',roundsOf(state)+' séries',
   '<div class="seg mt">'+ROUNDS_CHOICES.map(r=>'<button class="'+(roundsOf(state)===r?'':'quiet')+'" onclick="setDefRounds('+r+')">'+r+' séries</button>').join('')+'</div>'+
   '<div class="muted small mt">'+ROUNDS_CHOICES.map(r=>r+' → '+spanLbl(sessionSpan(r,state.cardio,state.warm))).join(' · ')+', selon le tirage du jour, '+incl+'. L\'accueil connaît les exercices du jour et donne le chiffre exact.</div>'+
   '<div class="muted small mt">À '+roundsOf(state)+' série'+(roundsOf(state)>1?'s':'')+' et '+state.goal+' séance'+(state.goal>1?'s':'')+' par semaine, cela fait environ <span class="num">'+weeklySets()+'</span> séries par groupe musculaire et par semaine : la séance alternée contient un exercice de chaque groupe, donc le volume par exercice est le volume par groupe.</div>'+
   '<div class="muted small mt">Une séance courte compte autant qu\'une longue pour l\'objectif hebdomadaire. Mieux vaut 2 séries que rien.</div>')+

  setCard('Échauffement',WARMLBL[state.warm]||state.warm,
   '<div class="seg mt">'+[['complet','Complet'],['court','Court'],['aucun','Aucun']].map(w=>'<button class="'+(state.warm===w[0]?'':'quiet')+'" onclick="setWarm(\''+w[0]+'\')">'+w[1]+'</button>').join('')+'</div>'+
   '<div class="muted small mt">Vu ton cou et ton dos, le mode court reste préférable à aucun. Un bouton permet aussi de le passer ponctuellement en séance.</div>')+

  setCard('Module cardio',state.cardio?'Activé':'Désactivé',
   '<div class="seg mt"><button class="'+(state.cardio?'':'quiet')+'" onclick="setCardio(true)">Activé</button><button class="'+(state.cardio?'quiet':'')+'" onclick="setCardio(false)">Désactivé</button></div>'+
   '<div class="muted small mt">4 minutes en fin de séance alternée, jamais au début : faire le cardio après le renforcement préserve les gains de force. Sois lucide, 4 minutes quatre fois par semaine ne remplacent pas les 150 minutes hebdomadaires d\'activité modérée recommandées. Le vrai volume viendra de la marche, du vélo, des escaliers.</div>')+

  setCard('Étirements de fin de séance',state.stretch!==false?'Activés':'Désactivés',
   '<div class="seg mt"><button class="'+(state.stretch!==false?'':'quiet')+'" onclick="setStretch(true)">Activés</button><button class="'+(state.stretch!==false?'quiet':'')+'" onclick="setStretch(false)">Désactivés</button></div>'+
   '<div class="muted small mt">'+STRETCH_PER_SESSION+' étirements après la dernière série d\'une séance alternée, en rotation sur les '+STRETCH_POOL.length+' : tu les couvres tous en '+Math.ceil(STRETCH_POOL.length/STRETCH_PER_SESSION)+' séances. Environ 2 minutes, comptées dans le temps de séance annoncé, sans XP ni effet sur la progression, et un bouton pour passer le bloc. Ils compensent les heures assises sur les zones que le programme ménage : nuque, épaules, hanches.</div>'+
   (state.stretch!==false?'<div class="muted small mt">Prochaine séance : '+stretchesFor().map(id=>esc(DB[id].nom)).join(' · ')+'.</div>':''))+

  setCard('Sons',sndOn()?('Activés · décompte '+(prepSec()?prepSec()+' s':'sans')+(repereOn()?' · repère '+REPERE.pas+' s':'')):'Coupés',
   '<div class="seg mt"><button class="'+(sndOn()?'':'quiet')+'" onclick="setSound(true)">Activés</button><button class="'+(sndOn()?'quiet':'')+'" onclick="setSound(false)">Coupés</button></div>'+
   '<div class="muted small mt">Coupe tous les bips d\'un coup : échauffement, repos, repères, approche et arrivée de la cible, décompte de préparation, phases du cardio et célébrations.</div>'+
   '<div class="seg mt">'+[0,3,5,10].map(v=>'<button class="'+(prepSec()===v?'':'quiet')+'" onclick="setPrep('+v+')">'+(v?v+' s':'0')+'</button>').join('')+'</div>'+
   '<div class="muted small mt">Décompte de préparation avant chaque chrono d\'exercice tenu ou d\'étirement : le temps de se mettre en position avant que ça compte. Rejoué à chaque Reprendre. Un bip par seconde, plus aigu au départ. Les cinq dernières secondes avant la cible d\'une tenue bipent aussi, pour finir sans regarder l\'écran.</div>'+
   '<div class="seg mt"><button class="'+(repereOn()?'':'quiet')+'" onclick="setRepere(true)">Repère activé</button><button class="'+(repereOn()?'quiet':'')+'" onclick="setRepere(false)">Repère coupé</button></div>'+
   '<div class="muted small mt">Pendant les planches et le gainage latéral, un clic discret toutes les '+REPERE.pas+' s pour savoir où tu en es sans voir l\'écran. Il se tait quand l\'approche de la cible prend le relais.</div>')+

  setCard('Transition',transSec()+' s',
   '<div class="muted small mt">Temps inerte entre deux exercices du circuit. L\'alternance fait déjà office de repos, cette transition ne sert qu\'à souffler et à rejoindre l\'exercice suivant, que l\'écran annonce.</div>'+
   '<div class="seg mt">'+TRANS_CHOICES.map(t=>'<button class="'+(transSec()===t?'':'quiet')+'" onclick="setTrans('+t+')">'+t+' s</button>').join('')+'</div>'+
   (PAUSE_RACCORD_PAIRS.length?'<div class="muted small mt">Sur certains enchaînements que tu as signalés, le raccord de tour porte une pause fixe de '+PAUSE_TOUR+' s, hors de ce réglage.</div>':'')+
   '<div class="muted small mt">Sur une séance à '+roundsOf(state)+' séries, chaque palier de 5 s pèse environ '+
   fmtDur(roundsOf(state)*(SLOT_ORDER.length-1)*5)+' : '+
   [TRANS_CHOICES[0],TRANS_CHOICES[TRANS_CHOICES.length-1]].map(t=>t+' s → '+spanLbl(sessionSpan(roundsOf(state),state.cardio,state.warm,t))).join(' · ')+'.</div>'+
   '')+

  setCard('Entretien',heldCount()?heldCount()+'/'+holdableIds().length+' tenus':'Progression active',
   '<div class="seg mt"><button class="'+(heldCount()>=holdableIds().length&&holdableIds().length?'':'quiet')+'" onclick="setEntretien(true)">Tout tenir</button><button class="'+(heldCount()?'quiet':'')+'" onclick="setEntretien(false)">Tout laisser progresser</button></div>'+
   '<div class="muted small mt">Le jour où tu es satisfait de ton physique, tenir tous les paliers d\'un coup : les cibles et les charges se figent au niveau atteint, le volume de travail ne change pas, et maintenir demande bien moins que construire. Le filet de sécurité continue d\'alléger si tu décroches. Réversible à tout moment, exercice par exercice depuis les fiches.</div>'+
   (heldCount()?'<div class="muted small mt"><span class="num">'+heldCount()+'</span> exercice'+(heldCount()>1?'s':'')+' sur '+holdableIds().length+' en palier tenu.</div>':''))+

  setCard('Profil actif',profilNom(),
   '<div class="muted small mt">Un profil est un inventaire nommé. Le domicile ne se supprime pas. La bascule est manuelle et ne s\'éteint jamais toute seule : l\'outil n\'a aucun moyen de savoir que tu es rentré.</div>'+
   '<div class="seg mt">'+Object.keys(state.profils||{}).map(k=>
     '<button class="'+(k===profilId()?'':'quiet')+'" onclick="switchProfil(\''+k+'\')">'+esc(profilNom(k))+'</button>').join('')+
     (Object.keys(state.profils||{}).length<PROFIL_MAX?'<button class="quiet" onclick="uiAskSet(\'newprofil\')" aria-label="Nouveau profil">+</button>':'')+'</div>'+
   /* Champ inline plutot qu un dialogue systeme. La valeur n est lue qu au clic
      sur le bouton : le rendu reecrit la vue entiere, un rendu declenche a
      chaque frappe mangerait la saisie. */
   (uiAsk==='newprofil'
     ? '<div class="mt"><input id="pfnom" type="text" maxlength="24" placeholder="chez Marc, hôtel, salle" value="'+esc(pfNom)+'" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit">'+
       '<div class="chipline mt"><span class="muted small">Matériel de départ</span>'+
       '<button class="chip'+(pfSrc?' off':' prof')+'" onclick="pfPick(\'\')">Vide</button>'+
       Object.keys(state.profils||{}).map(k=>'<button class="chip'+(pfSrc===k?' prof':' off')+'" onclick="pfPick(\''+k+'\')">Copier '+esc(state.profils[k].nom)+'</button>').join('')+'</div>'+
       '<div class="seg mt"><button onclick="newProfilOK()">Créer le profil</button><button class="quiet" onclick="uiAskSet(\'newprofil\')">Annuler</button></div>'+
       '<div class="muted small mt">Un profil neuf part vide : on déclare ce qu\'on a sous la main, plutôt que de relire une liste venue d\'ailleurs. La copie reste là si l\'endroit ressemble à celui-ci.</div></div>'
     : '')+
   (horsDomicile()
     ? '<div class="row mt"><button class="ghost" style="padding:6px 14px;font-size:.8rem" onclick="uiAskSet(\'renprofil\')">Renommer</button>'+
       '<button class="danger" style="padding:6px 14px;font-size:.8rem" onclick="uiAskSet(\'delprofil\')">Supprimer</button></div>'+
       (uiAsk==='renprofil'
         ? '<div class="mt"><input id="pfren" type="text" maxlength="24" value="'+esc(profilNom())+'" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit">'+
           '<div class="seg mt"><button onclick="renameProfilOK()">Renommer</button><button class="quiet" onclick="uiAskSet(\'renprofil\')">Annuler</button></div></div>'
         : '')+
       (uiAsk==='delprofil'
         ? '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px"><b class="small">Supprimer « '+esc(profilNom())+' » ?</b>'+
           '<div class="muted small mt">L\'inventaire de ce profil est perdu. Ta progression, elle, n\'est pas touchée : elle n\'appartient à aucun profil.</div>'+
           '<div class="seg mt"><button class="danger" onclick="delProfilOK()">Supprimer</button><button class="quiet" onclick="uiAskSet(\'delprofil\')">Annuler</button></div></div>'
         : '')
     : ''))+

  setCard('Matériel',profilNom()+' · '+(function(){const c=schemasServis(state.gear);return c.servis+'/'+c.total+' schémas';})(),
   matCardHtml())+

  setCard('Thème',THEME[state.theme]||state.theme,
   '<div class="seg mt">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(t=>'<button class="'+(state.theme===t[0]?'':'quiet')+'" onclick="setTheme(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>')+

  setCard('Comment ça marche','Cible, calibration, fin de série, fiches',
   '<div class="muted small mt">'+commentHtml(true)+'</div>')+

  '<div class="card muted small">'+
  '<span class="lead">Ce que fait PALIER</span>'+
  '<div>Il compose la séance, annonce sa durée, la déroule chrono en main, fait monter les répétitions puis la charge, et ouvre la variante suivante quand la marche est acquise. Rien à décider avant de commencer, sinon le volume du jour.</div>'+
  '<span class="lead mt">Comment les exercices sont choisis</span>'+
  '<div>Chaque exercice est retenu pour ce qu\'il apporte et pour ce qu\'il ne met pas en cause : dos, cou, épaules, genoux. Pas de flexion lombaire chargée, gainage en isométrie, rien au-dessus de la tête, pas d\'impact. Une variante plus douce attend derrière la plupart d\'entre eux.</div>'+
  '<span class="lead mt">Pourquoi les séances sont alternées</span>'+
  '<div>Quatre exercices non concurrents, un par groupe musculaire, enchaînés série après série : chaque muscle récupère pendant que les autres travaillent, les quatre groupes sont vus à chaque séance, et c\'est ce qui donne sur la semaine le volume qui fait progresser, sans allonger la séance.</div>'+
  '<div class="mt">En cas de douleur inhabituelle ou persistante, consulte un professionnel de santé.</div>'+
  '<div class="ver">v'+VERSION+'</div></div>';
  renderNav();
}
function setTrans(t){state.trans=t;save();render();}
function setDefRounds(r){state.rounds=r;save();render();}
function setWarm(w){state.warm=w;save();render();}
function setCardio(v){state.cardio=v;save();render();}
function setStretch(v){state.stretch=v;save();render();}
function setSound(v){state.sound=v;save();render();}
function setPrep(v){state.prep=v;save();render();}
function setRepere(v){state.repere=v;save();render();}
/* exercices susceptibles de tenir un palier : ceux qui ont une fourchette */
function holdableIds(){ return Object.keys(DB).filter(id=>DB[id].reps&&DB[id].cat!=='cardio'&&DB[id].mode!=='stretch'); }
function setEntretien(v){
  holdableIds().forEach(id=>{ const p=perfOf(id); if(v){p.hold=true;p.holdAt=p.holdAt||new Date().toISOString();} else {delete p.hold;delete p.holdAt;} });
  state.div={push:0,pull:0};
  save(); render();
  flash(v?'Tous les paliers sont tenus':'Progression reprise partout');
}
function setGoal(d){state.goal=Math.min(7,Math.max(2,state.goal+d));save();render();}
function setTheme(t){state.theme=t;save();applyTheme();render();}
function adjPlate(w,d){
  state.gear.plates[w]=Math.max(0,(state.gear.plates[w]||0)+d);
  save();render();
}
function adjMaxEnd(d){
  state.gear.maxPerEnd=Math.max(1,Math.min(8,(state.gear.maxPerEnd||5)+d));
  save();render();
}
/* L INVENTAIRE NE MODIFIE JAMAIS LA PROGRESSION, IL BORNE A LA LECTURE (v2.0).
   La v1.18 normalisait perf a chaque changement d inventaire : decocher puis
   recocher une bande ou une paire de lestes faisait perdre definitivement son
   barreau et son meilleur de bande a l exercice, sans aucun moyen de revenir
   en arriere, la valeur d avant n etant stockee nulle part. Mesure sur la
   sauvegarde du 22 aout : quatre exercices sur dix perdaient leur etat par un
   simple aller-retour. Les deux boucles d ecriture sont supprimees ; le niveau
   canonique reste dans perf et gearPerf le borne a chaque lecture. */
/* Le garde-fou « au moins une bande » disparait ici (v2.0). Il n existait que
   parce que l inventaire detruisait la progression : il empechait d atteindre
   l etat ou plus aucun barreau n existe. Depuis que le bornage se fait a la
   lecture et que la resolution materielle substitue les positions, un profil
   sans aucun elastique est un cas nomme et servi, verifie par le test
   exhaustif : aucun groupe n y est vide. */
/* La bascule de presence d un niveau disparait en v2.0 : la realisation EST la
   presence, et setBandReal est le seul point d ecriture, cote nuancier comme
   cote « je n ai pas cette bande ici ». */
function toggleCuff(id){
  state.gear.cuffs=state.gear.cuffs||{};
  state.gear.cuffs[id]=state.gear.cuffs[id]?0:1;
  syncPresence('cuff');
  save(); render();
}
/* Une kettlebell entre a un exemplaire et sort par le meme interrupteur : le
   poids retire quitte la liste et redevient proposable au menu, exactement
   comme un type de disque retombe a zero. */
function toggleKb(w){
  state.gear.kbs=state.gear.kbs||{};
  if(state.gear.kbs[w]) delete state.gear.kbs[w]; else state.gear.kbs[w]=1;
  syncPresence('kb');
  save(); render();
}
/* L enveloppe est posee DEUX FOIS depuis la v1.17, avant l etat et apres lui.
   Object.assign copie les cles dans l ordre d insertion : la poser avant place
   app et version en tete du fichier, ce sont les deux champs qu on veut lire en
   premier en ouvrant un export. La reposer apres garde la protection de la
   v1.16 : dans l autre sens seul, une cle version presente dans l etat ecrasait
   la vraie, et c est ce qui gravait un « version 1.0 » fossile dans les exports
   pendant quinze versions. Les migrations retirent app et version de l etat a
   chaque entree, mais si une sauvegarde bricolee en rapportait, c est la valeur
   de l enveloppe qui doit gagner, pas celle du fichier lu. */
function payload(){
  const env={app:'palier',version:VERSION};
  return JSON.stringify(Object.assign({},env,state,env));
}
function applyImport(v){
  if(!v||v.app!=='palier'||typeof v.xp!=='number'||!Array.isArray(v.hist)) throw 0;
  state=Object.assign(defaultState(),v);
  /* Les migrations se rejouent ici depuis la v1.16. Elles ne vivaient que dans
     loadState, donc une sauvegarde ancienne reimportee revenait avec ses valeurs
     d origine sans que rien ne le dise : une sauvegarde anterieure a la v1.13
     aurait perdu definitivement la conversion des durees en series. Le second
     argument est l objet brut du fichier, certaines migrations devant distinguer
     un champ absent d un champ a zero. */
  migrateState(state,v);
  /* Date du dernier import, symetrique de markExport. Les quatre chemins
     d entree-sortie convergent ici, un seul point suffit. Le fichier importe
     porte le lastImport de l appareil qui l a exporte : il est ecrase juste
     apres, ce qui est le comportement voulu. */
  state.lastImport=new Date().toISOString();
}
function downloadData(){
  try{
    const blob=new Blob([payload()],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='palier-'+dayKey()+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>{try{URL.revokeObjectURL(a.href);}catch(e){}},3000);
    markExport();
    flash('Sauvegarde téléchargée');
  }catch(e){flash('Téléchargement bloqué ici : utilise le repli copier-coller');}
}
function importFile(){
  const i=document.createElement('input');
  i.type='file'; i.accept='.json,application/json';
  i.onchange=()=>{
    const f=i.files&&i.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=async()=>{
      try{ applyImport(JSON.parse(r.result)); await save(); applyTheme(); flash('Progression importée'); go('home'); }
      catch(e){ flash('Import impossible : fichier invalide'); }
    };
    r.readAsText(f);
  };
  i.click();
}
/* date du dernier export : la sauvegarde quotidienne se verifie d un coup d oeil,
   sans ouvrir la carte. Ecrite apres coup, donc absente du fichier exporte lui-meme. */
function markExport(){ state.lastExport=new Date().toISOString(); save(); if(view==='set') render(); }
function lastExportLabel(){
  if(!state.lastExport) return 'jamais exportée';
  const j=dayGap(state.lastExport);
  return j<=0?'aujourd\'hui':(j===1?'hier':'il y a '+j+' j');
}
function exportData(){
  const t=$('#io'); t.value=payload();
  t.select();
  try{document.execCommand('copy');flash('Sauvegarde copiée');}catch(e){flash('Copie le contenu du champ');}
  markExport();
}
async function importData(){
  try{
    applyImport(JSON.parse($('#io').value));
    await save();applyTheme();flash('Progression importée');go('home');
  }catch(e){flash('Import impossible : contenu invalide');}
}
/* Une seule question au lieu de deux dialogues enchaines (v2.0) : repeter la
   question ne protege de rien, c est la formulation de la consequence qui
   protege, et la reponse se donne dans la page. */
async function resetAll(){
  uiAsk=null;
  state=defaultState();
  await save();flash('Remise à zéro faite.');go('home');
}

/* ============ CLAVIER ============ */
function primaryAction(){
  if(view==='home'){ startSession(); return; }
  if(view==='recap'){ cur=null; go('home'); return; }
  if(view!=='session'||!cur) return;
  if(cur.phase==='warm'){ nextWarm(); return; }
  const st=cur.steps[cur.i]; if(!st) return;
  if(st.k==='rest') nextStep();
  else if(st.k==='cardio') validateCardio();
  else validateSet();   /* inerte sur une tenue incomplete : l ecran et la
                           touche disent la meme chose (v1.13) */
}
function spaceAction(){
  if(view!=='session'||!cur) return;
  if(cur.phase==='warm'){ toggleWarm(); return; }
  const st=cur.steps[cur.i]; if(!st) return;
  if(st.k==='rest'){ addRest(15); return; }
  if(st.k==='cardio'){ toggleCardio(); return; }
  const e=DB[st.id];
  /* ESPACE ne detruit jamais une mesure : une fois le dernier cote arrete, il
     ne fait plus rien, et la remise a zero reste un bouton (v1.13) */
  if(e.mode==='time'){ if(!holdOver(st)) toggleChrono(); }
  else if(e.rhythm) toggleRhythm();   /* Demarrer ou Stop ; inerte une fois arretee (v2.17) */
  else if(e.cadence){ if(!cadOver(st)) toggleCadence(); }   /* comme une tenue par cote (v2.19) */
  else if(e.mode==='stretch') toggleStretch();
  else validateSet();
}
document.addEventListener('keydown',ev=>{
  if(ev.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
  const lb=document.querySelector('.lightbox');
  if(lb&&(ev.key==='Escape'||ev.key===' '||ev.key==='Enter')){ev.preventDefault();lb.remove();return;}
  /* une celebration en cours consomme la touche : sans ca, la meme pression
     enchainerait l animation et le retour a l accueil */
  if(popActive()&&(ev.key==='Enter'||ev.key===' '||ev.code==='Space'||ev.key==='Escape')){
    ev.preventDefault(); if(ev.key==='Escape') popSkip(); else popNext(); return;
  }
  /* une question posee dans la page consomme les touches : Entree et Espace
     n y repondent pas, seul Echap annule. Une touche pressee par reflexe ne
     doit jamais decider d une sortie de seance (v1.13). */
  if(askQuit){
    if(ev.key==='Escape'||ev.key==='Enter'||ev.key===' '||ev.code==='Space'){ ev.preventDefault(); if(ev.key==='Escape') quitCancel(); }
    return;
  }
  if(ev.key==='Enter'){ev.preventDefault();primaryAction();return;}
  if(ev.key===' '||ev.code==='Space'){ev.preventDefault();spaceAction();return;}
  if(view!=='session'||!cur) return;
  if(ev.key==='Escape'){ev.preventDefault();quitSession();return;}
  if(cur.phase==='warm') return;
  const st=cur.steps[cur.i];
  if(!st||st.k!=='set') return;
  const e=DB[st.id];
  if(e.mode==='stretch') return;
  if(e.mode==='time'){
    /* v2.16 : sur une tenue arretee, « - » rogne la mesure du cote courant,
       comme le bouton. « + » reste inerte : on ne rajoute pas des secondes
       qu on n a pas tenues. ESPACE n est pas concerne, il ne touche jamais a
       une mesure (v1.13). */
    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimHold(st.side); }
    return;
  }
  if(e.cadence){
    /* v2.19 : « - » rogne une repetition du cote courant, comme sur une tenue
       par cote. Inerte pendant la cadence. */
    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimCad(st.side||0); }
    return;
  }
  if(e.rhythm){
    /* v2.17 : « - » rogne une tenue sur une serie arretee, comme le bouton.
       « + » et les autres touches restent inertes : rien ne s ajoute. */
    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimRhythm(); }
    return;
  }
  /* v1.11 : les quatre fleches sont rendues au defilement de la page. Elles
     n etaient capturees que dans un cas, une serie chiffree en pleine seance,
     c est-a-dire exactement l ecran le plus long (illustration entiere) et le
     seul ou le pave de saisie passe sous le pli : on modifiait une valeur
     invisible sans pouvoir descendre la voir. Ajuster passe sur + et -, pris
     dans leurs deux etats de touche pour rester accessibles sans Maj sur un
     clavier francais : « = » et « + » montent, « 6 » et « - » descendent.
     Le pave numerique produit deja « + » et « - ». Son « 6 » est exclu, il est
     colle au « - » : un appui a cote ferait baisser la valeur sans raison
     visible, d ou le test sur le code de touche physique. */
  if(ev.key==='+'||ev.key==='='){ev.preventDefault();bump(1);}
  if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ev.preventDefault();bump(-1);}
});

/* ============ ROUTEUR ============ */
/* Etat des cards repliables au re-rendu (v1.14). Chaque bouton de reglage ou
   d ajustement appelle render(), qui reecrit toute la page : sans cela une
   card se refermait au moment precis ou on manipulait ce qu elle contient.
   On releve les cards ouvertes avant, on retablit apres, dans les deux sens
   pour que le detail de seance, ouvert par defaut, reste refermable.
   Rien n est stocke : l etat ne survit ni au changement de vue, puisque les
   cles de l ancienne page ne correspondent a rien dans la nouvelle, ni au
   rechargement. Ferme reste donc le defaut a chaque arrivee sur un ecran, et
   la ligne fermee garde son role de resume. */
function cardsOpen(){
  const out={};
  if(typeof document==='undefined'||!document.querySelectorAll) return out;
  try{ document.querySelectorAll('details[data-k]').forEach(d=>{ out[d.getAttribute('data-k')]=d.open; }); }catch(e){}
  return out;
}
/* Attribut d ouverture d une card, a ecrire dans le HTML au moment ou la card
   s ecrit. Corriger l ouverture apres coup fonctionnait, mais faisait sortir
   le document trop court le temps d une image : le navigateur ramenait aussitot
   le defilement dans les nouvelles limites, et rouvrir la card ensuite lui
   rendait sa hauteur sans lui rendre sa position. D ou le petit saut visible a
   chaque clic sur une option. Ecrit directement, le document sort a la bonne
   hauteur du premier coup et rien ne bouge. */
function cardOpen(k,parDefaut){
  const v=openCards[k];
  return (v===undefined?!!parDefaut:v)?' open':'';
}
function render(){
  openCards=cardsOpen();
  const y=(typeof window!=='undefined'&&typeof window.scrollY==='number')?window.scrollY:null;
  ({home:renderHome,session:renderSession,recap:renderRecap,lib:renderLib,prog:renderProg,set:renderSettings,fix:renderFix}[view]||renderHome)();
  /* filet pour les rendus qui changent quand meme la hauteur : go() remonte en
     haut apres son propre rendu, ce comportement n est pas touche */
  if(y!==null&&y>0){ try{ window.scrollTo(0,y); }catch(e){} }
}
/* navigation par hash : #home #lib #prog #set #fiche/<id>, plus #session et
   #recap comme jalons. Le retour arriere en pleine seance declenche la
   confirmation de sortie existante ; refus = on reste en seance */
function applyHash(){
  const h=(hashOK()?window.location.hash:'').slice(1);
  if(view==='session'&&cur&&!cur.recap){
    if(h!=='session'){ setHash('session'); quitSession(); }
    return;
  }
  if(view==='recap'&&cur&&cur.recap&&h!=='recap'){ cur=null; go('home'); return; }
  if(h.indexOf('fiche/')===0){
    const id=h.slice(6);
    if(DB[id]){ showFiche(id); return; }
  }
  go(['home','lib','prog','set'].indexOf(h)>=0?h:'home');
}
function onHash(){
  if(navLock){ navLock=false; return; }
  applyHash();
}
function initView(){
  syncDemarrer();   /* v2.24 : inerte sans cle ou hors https */
  if(hashOK()){
    window.addEventListener('hashchange',onHash);
    /* une rotation change la hauteur des panneaux du carrousel, et la bande
       porte une hauteur mesuree : elle se remesure au lieu de rester fausse */
    window.addEventListener('resize',()=>{ if(view==='home') carFit(); });
    const h=(window.location.hash||'').slice(1);
    if(['lib','prog','set'].indexOf(h)>=0) view=h;
    else if(h.indexOf('fiche/')===0&&DB[h.slice(6)]){ view='lib'; render(); showFiche(h.slice(6),'lib'); return; }
  }
  render();
  setHash(view);
}
if(typeof window!=='undefined'){
  Object.assign(window,{go,startSession,quitSession,quitCancel,quitConfirm,goMateriel,validGear,
    uiAskSet,pfPick,newProfilOK,renameProfilOK,delProfilOK,setBandReal,toggleBandPick,addPlate,
    setDefRounds,setTrans,setWarm,setCardio,
    setGoal,setTheme,adjPlate,adjMaxEnd,toggleRes,toggleCuff,toggleKb,addKb,exportData,importData,downloadData,importFile,resetAll,showFiche,zoomFig,bump,adjLoad,adjBand,swapPain,skipSet,
    validateSet,toggleChrono,toggleStretch,toggleWarm,nextWarm,skipWarm,nextStep,addRest,toggleCardio,validateCardio,
    toggleLight,setSound,setPrep,toggleHold,skipCool,swapCardio,popNext,popSkip,
    revertSwap,revertCardio,setRounds,setSessionRounds,setDayWarm,setDayCardio,setDayStretch,resetHold,trimHold,stepBack,carGo,carScroll});
}
(async function(){ await loadState(); applyTheme(); initView(); })();
