/* ============ SEANCE ============ */
function startSession(){
  /* v2.24 : le clavier passe aussi par ici, la garde ne vit pas sur le bouton */
  if(syncBloque()) return;
  /* la fenetre de correction se ferme au demarrage de la seance suivante :
     c est ce qui implemente « on corrige la derniere seance, pas les autres » */
  delete state.undo;
  const plan=buildSession();
  /* Modele rejoue (v1.16). planSec est l annonce, a la seconde : elle etait
     stockee arrondie a la minute, soit trente secondes de bruit sur un
     parametre d installation qui en pese cent trente. model part du remontage
     de charge, seul poste modelise qu aucun evenement de seance ne produira, et
     s incremente ensuite : d un tick a chaque seconde chronometree, et de la
     part non chronometree a chaque serie validee. */
  const parts=planParts(plan);
  cur={type:plan.type,exos:plan.exos,steps:plan.steps,i:0,phase:'warm',warmI:0,warmT:null,warmPaused:false,startLeft:START_PREP,
       warmMode:plan.warm,light:plan.light,subs:plan.subs,rounds:effRounds(),rounds0:effRounds(),
       plan:Math.round(parts.total/60),planSec:parts.total,model:parts.remount,
       log:{},secs:{},xp:0,msgs:[],ending:false,t0:Date.now()};
  if(!warmupList(plan.warm).length){ cur.phase='work'; cur.startLeft=0; }
  go('session');
}
/* Une seconde chronometree, quelle qu elle soit : echauffement, decompte de
   preparation, tenue, etirement, transition, cardio. Appelee dans les six
   boucles a la seconde, elle donne au modele rejoue la valeur exacte de tout ce
   que l outil mesure, sans rien reconstituer et sans cas particulier : une
   pause ne tique pas, un chrono arrete non plus, un etirement saute pas
   davantage. Ce qui reste hors du compte est exactement ce que la v1.14 avait
   isole comme modelisable. */
function tick(){ if(cur) cur.model=(cur.model||0)+1; }
/* Sortie de seance en deux temps (v2.0). Le dialogue systeme disparait comme
   les autres : la question est posee dans la page, elle nomme sa consequence,
   et elle s annule.
   Elle sert aussi le retour arriere du navigateur : applyHash remet deja
   l entree d historique en place AVANT d appeler cette fonction, donc la
   fleche seule ne quitte jamais rien, et rien ne change a cette mecanique du
   fait que la question ne bloque plus le fil.
   Le drapeau est ponctuel et ne va pas dans l etat. Tant qu il est leve, les
   touches de seance sont inertes et Echap annule : une touche pressee par
   reflexe ne decide de rien (v1.13). */
let askQuit=false;
function quitSession(){
  if(!cur) return;
  askQuit=true; renderSession();
  try{ window.scrollTo(0,0); }catch(e){}
}
function quitCancel(){ askQuit=false; renderSession(); }
function quitConfirm(){
  askQuit=false;
  const logged=cur&&cur.log&&Object.keys(cur.log).length;
  if(!logged){ rhythmAbort(); cur=null; lightMode=false; clearDay(); go('home'); return; }
  cur.ending=true; endSession(true);
}
function quitAskHtml(){
  if(!askQuit) return '';
  const logged=cur&&cur.log&&Object.keys(cur.log).length;
  return '<div class="card" style="border-left:4px solid var(--flame)"><b>Quitter la séance ?</b>'+
    '<div class="muted small mt">'+(logged
      ?'Les séries déjà validées seront enregistrées, la séance sera marquée incomplète et la rotation n\'avancera pas.'
      :'Rien ne sera compté : aucune série n\'a encore été validée.')+'</div>'+
    '<div class="seg mt"><button class="danger" onclick="quitConfirm()">Quitter</button>'+
    '<button class="quiet" onclick="quitCancel()">Continuer la séance</button></div></div>';
}
/* pastilles regroupees selon la logique du mode : un bloc par tour en
   alterne (chaque serie porte round), un bloc par exercice en cible. Le
   contour du bloc passe au vert quand toutes ses series sont faites. */
function dotsHtml(steps,done){
  const ws=workSteps(steps);
  let h='',buf='',key=null,full=true;
  const flush=()=>{ if(buf) h+='<span class="grp'+(full?' full':'')+'">'+buf+'</span>'; buf=''; full=true; };
  ws.forEach((s,i)=>{
    const k=(s.round!=null)?('r'+s.round):('e'+s.id);
    if(k!==key){ flush(); key=k; }
    buf+='<i class="'+(i<done?'done':(i===done?'on':''))+'"></i>';
    if(i>=done) full=false;
  });
  flush();
  return h;
}
function renderSession(){
  screenEnter('session/'+(cur?cur.i:0));
  if(cur.phase==='warm') return renderWarm();
  const st=cur.steps[cur.i];
  if(!st) return;
  /* Duree par serie (v2.12). L horodatage se pose ici, a l arrivee sur l etape,
     parce que c est le seul point que tous les chemins traversent : etape
     suivante, serie passee, retour d un pas, changement de volume. La garde sur
     l absence rend le rendu idempotent, un re-rendu de la meme etape ne
     redemarrant pas le compte : ajuster une charge ou ouvrir une card ne doit
     pas raccourcir la serie. Ce que l intervalle mesure est assume : de
     l arrivee sur l ecran a la validation, installation comprise, soit
     exactement ce que le modele de temps represente pour cette serie. */
  if(st.k==='set'&&st.t0==null) st.t0=Date.now();
  const done=workSteps(cur.steps.slice(0,cur.i)).length;
  const dots=dotsHtml(cur.steps,done);
  let body;
  if(st.k==='rest') body=restHtml(st);
  else if(st.k==='cardio') body=cardioHtml(st);
  else body=setHtml(st);
  $('#app').innerHTML=
    '<div class="spread" style="margin-bottom:10px"><h2>Séance alternée</h2>'+
    '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="quitSession()">Quitter</button></div>'+
    quitAskHtml()+
    '<div class="dots">'+dots+'</div>'+body;
  renderNav();
  if(st.k==='rest') startRest(st);
  if(st.k==='cardio') initCardio(st);
}

/* --- echauffement sur un seul ecran --- */
function renderWarm(){
  const L=warmupList();
  const w=L[cur.warmI];
  if(cur.warmT==null) cur.warmT=w.s;
  const dep=cur.startLeft>0;
  $('#app').innerHTML='<div class="spread" style="margin-bottom:10px"><h2>Échauffement</h2>'+
    '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="quitSession()">Quitter</button></div>'+
    quitAskHtml()+
    '<div class="card">'+
      L.map((it,i)=>'<div class="wu-item '+(i<cur.warmI?'done':(i===cur.warmI?'on':''))+'">'+
        (i<cur.warmI?'✓':(i===cur.warmI?'▸':'·'))+' '+esc(it.l)+'<span class="t">'+it.s+'s</span></div>').join('')+
      (w.img&&typeof IMG!=='undefined'&&IMG[w.img]?'<div class="figbox illus mt"><img src="'+IMG[w.img]+'" alt="'+esc(w.l)+'" loading="lazy" onclick="zoomFig(\''+w.img+'\')"></div>':'')+
      '<div class="muted small mt">'+esc(w.d)+'</div>'+
      (dep?'<div class="center mt"><span class="tag" id="wdep">Départ dans</span></div>':'')+
      '<div class="chrono num" id="wt">'+(dep?String(cur.startLeft):fmtT(cur.warmT))+'</div>'+
      '<div class="seg"><button class="quiet" onclick="toggleWarm()" id="wpause">'+(cur.warmPaused?'Reprendre':'Pause')+'</button>'+
      '<button class="quiet" onclick="nextWarm()">Étape suivante</button></div>'+
      '<button class="ghost big mt" onclick="skipWarm()">Passer l\'échauffement</button>'+
      kbHint()+
    '</div>';
  renderNav(); startWarmTimer();
}
/* v2.22 : decompte de lancement. Le chrono de l echauffement partait a
   l instant du clic sur « Lancer la seance ». Cinq secondes fixes, sans
   reglage, decision de Gabriel ; les sons sont ceux de startPrep, un bip a
   700 Hz a chaque seconde puis 1150 Hz au depart. Seulement devant
   l echauffement : sans lui, le premier ecran est une serie sans chrono ou
   une tenue qui a son propre decompte. Pause le fige, la reprise rejoue le bip
   de la seconde en cours ; Etape suivante et Passer l echauffement l annulent. */
function startWarmTimer(){
  clearInterval(timers.w);
  if(cur.warmPaused) return;
  if(cur.startLeft>0){
    beep(700,.1);
    timers.w=setInterval(()=>{
      tick(); cur.startLeft--;
      const el=$('#wt'); if(!el){clearInterval(timers.w);return;}
      if(cur.startLeft>0){ el.textContent=String(cur.startLeft); beep(700,.1); return; }
      clearInterval(timers.w); beep(1150,.16);
      const d=$('#wdep'); if(d&&d.parentNode) d.parentNode.remove();
      el.textContent=fmtT(cur.warmT);
      startWarmTimer();
    },1000);
    return;
  }
  timers.w=setInterval(()=>{
    tick(); cur.warmT--;
    const el=$('#wt'); if(!el){clearInterval(timers.w);return;}
    el.textContent=fmtT(cur.warmT);
    if(cur.warmT<=0){clearInterval(timers.w);beep(880,.18);nextWarm();}
  },1000);
}
function toggleWarm(){cur.warmPaused=!cur.warmPaused;const b=$('#wpause');if(b)b.textContent=cur.warmPaused?'Reprendre':'Pause';if(cur.warmPaused)clearInterval(timers.w);else startWarmTimer();}
function nextWarm(){
  clearInterval(timers.w);
  cur.warmI++; cur.warmT=null; cur.warmPaused=false; cur.startLeft=0;
  if(cur.warmI>=warmupList().length) skipWarm(); else renderWarm();
}
function skipWarm(){ clearInterval(timers.w); cur.startLeft=0; cur.phase='work'; renderSession(); }

/* v2.15 : la ligne « Derniere fois » porte le niveau quand il differe de
   celui du jour. Apres une montee, l ecran disait « Cible 8 · Derniere fois
   12/12/12 » sans dire pourquoi : la charge avait monte, la cible etait
   retombee au bas de fourchette, et rien ne reliait les deux. Le niveau joue
   se lit sur le dernier passage propre de l historique, it.load et it.band,
   ecrits avant progression depuis la v1.2 : aucun etat nouveau, meme famille
   que la fenetre de cible, la cible bouge, l ecran dit d ou. Rien quand le
   niveau est le meme, la ligne reste du contexte (v1.16). */
function lastLevel(id,p){
  const e=DB[id]; if(!e) return '';
  const pass=exoPassages(id).filter(x=>!x.repl);
  const it=pass.length?pass[pass.length-1].it:null; if(!it) return '';
  if(e.bnd){ if(it.band&&p.band&&it.band!==p.band) return ' <span class="muted">en '+esc(bandLabel(it.band))+'</span>'; return ''; }
  if((e.mode==='load'||e.mode==='fixed')&&it.load!=null&&p.load!=null&&Math.abs(it.load-p.load)>0.01) return ' <span class="muted">à '+esc(loadLabelFor(id,it.load))+'</span>';
  /* v2.17 : la tenue jouee, quand elle differe du barreau du jour. Un passage
     anterieur a it.tenue a ete joue au premier barreau par construction. */
  if(e.rhythm){ const t=it.tenue!=null?it.tenue:e.rhythm.ladder[0][0]; if(t!==tenueOf(id,p)) return ' <span class="muted">à '+t+' s</span>'; }
  /* v2.18 : l assise jouee, quand elle differe du barreau du jour */
  if(e.assise){ const a=it.assise!=null?it.assise:e.assise.ladder[0][0]; if(a!==assiseOf(id,p)) return ' <span class="muted">assise '+a+' cm</span>'; }
  return '';
}
/* Niveau sous lequel le dernier passage a ete joue, en texte, toujours dit
   (v2.18) : la fiche l accolait au niveau du jour. Meme source que
   lastLevel ; sans passage dans l historique, le niveau courant, comme
   avant. */
function playedLabel(id,p){
  const e=DB[id]; if(!e) return '';
  const pass=exoPassages(id).filter(x=>!x.repl);
  const it=pass.length?pass[pass.length-1].it:null;
  const src=it||{load:p.load,band:p.band,tenue:tenueOf(id,p),assise:assiseOf(id,p)};
  if(e.bnd) return src.band?', '+bandLabel(src.band):'';
  if(e.mode==='load'||e.mode==='fixed') return src.load?' à '+loadLabelFor(id,src.load):'';
  if(e.rhythm){ const t=src.tenue!=null?src.tenue:e.rhythm.ladder[0][0]; return ' à '+t+' s'; }
  if(e.assise){ const a=src.assise!=null?src.assise:e.assise.ladder[0][0]; return ', assise '+a+' cm'; }
  return '';
}
/* --- une serie --- */
function setHtml(st){
  const id=st.id, e=DB[id], p=perfFor(id,!!st.light);
  const prev=(p.sets&&p.sets.length)?p.sets:null;
  /* Series deja faites aujourd hui sur cet exercice (v1.16). En mode alterne
     elles sont separees par trois autres exercices, donc personne ne s en
     souvient a la serie suivante. Toute la liste et pas seulement la derniere :
     le moteur lit le minimum du passage pour la cible suivante et exige toutes
     les series en haut de fourchette pour la montee, la serie qui decide n est
     donc pas forcement la derniere. Le journal est lu sous la cle courante,
     donc un repli douleur en cours d exercice repart d une liste vide, ce qui
     est exact : ce ne sont plus les memes series. */
  const jour=(cur&&cur.log&&cur.log[st.key||st.id])||null;
  /* un etirement n a ni fourchette ni cible : son chrono part de sa duree de
     base, pas du repli generique de fin de ligne (v1.12) */
  if(st.val==null) st.val=((e.mode==='time'||e.rhythm||e.cadence)?0:(e.mode==='stretch'?stretchPhases(e)[0]:(p.target||(e.reps?e.reps[0]:10))));
  if(e.mode==='stretch'&&st.side==null) st.side=0;
  let entry='';
  if(e.mode==='stretch'){
    entry=(e.bilat?'<div class="center"><span class="tag" id="phlabel">'+stretchSideLabel(st.side)+'</span></div>':'')+
      '<div class="chrono num" id="cc">'+fmtT(st.val)+'</div>'+
      '<button class="big" id="ct" onclick="toggleStretch()">'+(st.lbl||'Démarrer')+'</button>'+
      '<div class="mt"></div><button class="big ok" onclick="validateSet()">Fait</button>';
  } else if(e.rhythm){
    /* Tenue rythmee (v2.17) : cote, chrono de la tenue, deux compteurs, Stop.
       Le Stop est la seule entree pendant le rythme, l ecran se regarde de
       biais depuis le sol. Apres le Stop, plus rien n est chronometre et on a
       le temps de choisir : reprendre, rogner, valider, recommencer. */
    const rt=rhythmInit(st), sp=rhythmSpec(st), v=st.val||0, ready=!!st.done&&!rt.on&&v>=1;
    const petit='class="quiet" style="padding:6px 12px;font-size:.8rem"';
    entry='<div class="center"><span class="tag" id="phlabel">'+(rt.on?'…':(rt.stopped?'Série arrêtée':'Prêt · '+rhythmSide(rt.s0)))+'</span></div>'+
      '<div class="chrono num" id="cc">'+(rt.on?'':(rt.stopped?String(v):'—'))+'</div>'+
      '<div class="muted small center" id="rcount">'+rhythmCountsHtml(rt.d,rt.g,sp.cible,rt.stopped?null:rt.s0)+'</div>'+
      (rt.on?'<div class="mt"></div><button class="big" id="ct" onclick="toggleRhythm()">Stop</button>'
        :rt.stopped?'<div class="center" style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
            '<button '+petit+' onclick="resumeRhythm()">Reprendre</button>'+
            '<button '+petit+' onclick="trimRhythm()"'+(rt.d+rt.g<1?' disabled':'')+' aria-label="Retirer une tenue">− 1 tenue</button>'+
            '<button '+petit+' onclick="resetRhythm()">Réinitialiser</button></div>'
        :'<div class="mt"></div><button class="big" id="ct" onclick="toggleRhythm()">Démarrer</button>')+
      '<div class="mt"></div><button class="big '+(ready?'ok':'quiet')+'"'+(ready?'':' disabled')+' onclick="validateSet()">Valider la série</button>'+
      '<div class="muted small center" style="margin-top:6px">'+
        (ready?'Au journal : <b class="num">'+v+'</b> tenue'+(v>1?'s':'')+' de '+sp.tenue+' s par côté'+(rt.d!==rt.g?', le côté le plus court fait foi':'')+'.'
          :rt.on?'Le Stop arrête la série ; la tenue en cours ne compte pas.'
          :rt.stopped?'Aucune tenue complète : reprends, ou passe la série.'
          :'Tenues de <b class="num">'+sp.tenue+' s</b> par côté, bascule de '+sp.bascule+' s, au son.')+'</div>';
  } else if(e.cadence){
    /* Repetitions cadencees (v2.19) : le deroule des tenues par cote, pas
       celui du bird-dog. Un cote entier puis l autre, rognage et remise a zero
       par cote, validation sur chaque cote. Stop definitif par cote sur les
       abductions, reprise sur le pont (v2.22). Le grand chiffre est la
       repetition en cours pendant la cadence, le compte du cote apres le Stop. */
    const ct=cadInit(st), sp=cadSpec(st), on=ct.on, over=cadOver(st), ready=cadReady(st), N=sp.n;
    const m=st.sides, mn=ready?Math.min.apply(null,m):0;
    const actif=(on||!st.done)?st.side:(st.side<N-1?st.side+1:null);
    const petit='class="quiet" style="padding:6px 12px;font-size:.8rem"';
    const mesure=N>1?(st.side?'Côté gauche':'Côté droit')+' mesuré':'Série arrêtée';
    const repr=sp.reprise&&st.done&&!on&&m[st.side]!=null;
    entry='<div class="center"><span class="tag" id="phlabel">'+(on?'…':(st.done?mesure:'Prêt'+(N>1?' · '+rhythmSide(st.side):'')))+'</span></div>'+
      '<div class="chrono num" id="cc">'+(on?'':(st.done?String(m[st.side]):'0'))+'</div>'+
      '<div class="center" id="phase" style="min-height:1.6rem"></div>'+
      '<div class="muted small center" id="rcount">'+cadCountsHtml(m,sp.cible,actif,null)+'</div>'+
      '<div class="mt"></div><button class="big'+(over?' quiet':'')+'" id="ct"'+(over?' disabled':'')+' onclick="toggleCadence()">'+cadLbl(st)+'</button>'+
      (m.some(v=>v!=null)&&!on?'<div class="center" style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
        (repr?'<button '+petit+' onclick="resumeCad()">Reprendre</button>':'')+
        m.map((v,i)=>'<button '+petit+' onclick="trimCad('+i+')"'+(v==null||v<=0?' disabled':'')+' aria-label="Retirer une répétition'+(N>1?' côté '+rhythmSide(i).toLowerCase():'')+'">− 1 rép'+(N>1?' '+rhythmSide(i).toLowerCase():'')+'</button>').join('')+
        '<button '+petit+' onclick="resetCad()"'+(st.done?'':' disabled')+'>Réinitialiser'+(N>1?' ce côté':'')+'</button></div>':'')+
      '<div class="mt"></div><button class="big '+(ready?'ok':'quiet')+'"'+(ready?'':' disabled')+' onclick="validateSet()">Valider la série</button>'+
      '<div class="muted small center" id="aide" style="margin-top:6px">'+
        (on?''
          :ready?'Au journal : <b class="num">'+mn+'</b> répétition'+(mn>1?'s':'')+(N>1?' par côté'+(m[0]!==m[1]?', le côté le plus court fait foi':''):'')+'.'
          :over?(N>1?'Un côté sans répétition complète : ':'Aucune répétition complète : ')+(sp.reprise?'reprends, réinitialise, ':'réinitialise'+(N>1?' ce côté':'')+', ')+'ou passe la série.'
          :st.done&&m[st.side]<1?'Aucune répétition complète : '+(sp.reprise?'reprends, ou ':'')+'réinitialise ce côté avant de passer au suivant.'
          :st.done?cadChange(e)+(sp.reprise?' Reprendre continue ce côté.':' Le Stop est définitif pour ce côté : pour le refaire, réinitialise-le.')
          :'Montée <b class="num">'+fmtNum(sp.monte)+'</b> s'+(sp.tenue?', tenue en haut <b class="num">'+fmtNum(sp.tenue)+'</b> s':'')+', descente <b class="num">'+fmtNum(sp.descente)+'</b> s, au son.'+(N>1?' Un côté entier, puis l\'autre.':''))+'</div>';
  } else if(e.mode==='time'){
    holdInit(st,e);
    const n=st.sides.length, ready=holdReady(st);
    entry=(n>1?'<div class="center"><span class="tag" id="phlabel">'+stretchSideLabel(st.side)+'</span></div>':'')+
      '<div class="chrono num" id="cc">'+fmtT(st.val)+'</div>'+
      '<button class="big'+(holdOver(st)?' quiet':'')+'" id="ct"'+(holdOver(st)?' disabled':'')+' onclick="toggleChrono()">'+holdLbl(st)+'</button>'+
      (n>1?'<div class="muted small center" style="margin-top:6px">'+holdRecap(st)+'</div>':'')+
      (st.done?'<div class="center" style="margin-top:8px;display:flex;gap:8px;justify-content:center">'+
        (n>1?'':trimBtn(st,0))+
        '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="resetHold()">Réinitialiser '+(n>1?'ce côté':'')+'</button></div>':'')+
      '<div class="mt"></div><button class="big '+(ready?'ok':'quiet')+'"'+(ready?'':' disabled')+' onclick="validateSet()">Valider la tenue</button>'+
      (ready?'':'<div class="muted small center" style="margin-top:6px">'+(n>1?'Les deux côtés doivent être mesurés : travailler d\'un seul côté renforcerait un déséquilibre.':'Lance le chrono avant de valider.')+'</div>');
  } else {
    /* v1.15 : une serie validee a zero repetition n est pas une serie, et
       « Passer » couvre deja le cas. Le bouton est inerte a zero, comme il
       l est deja sur une tenue non mesuree, et la correction d une seance
       refuse la meme valeur : ce que l application ne produit pas, elle n a
       pas a savoir le re-saisir. */
    entry='<div class="stepper mt"><button onclick="bump(-1)" aria-label="Retirer un">−</button><div class="val num" id="vv">'+st.val+'</div><button onclick="bump(1)" aria-label="Ajouter un">+</button></div>'+
      (e.side?'<div class="muted small center" style="margin-top:6px">Répétitions par côté</div>':'')+
      '<button class="big ok mt'+(st.val<1?' quiet':'')+'" id="vb"'+(st.val<1?' disabled':'')+' onclick="validateSet()">Valider la série</button>'+
      '<div class="muted small center" id="vz" style="margin-top:6px'+(st.val<1?'':';display:none')+'">Une série à zéro n\'est pas une série : utilise Passer.</div>';
  }
  let loadLine='';
  /* en seance allegee la charge est imposee et gelee : pas de reglage, sinon
     le + repartirait de la charge reelle et non de la charge allegee */
  if(p.light&&(e.mode==='load'||e.mode==='fixed'||e.bnd))
    loadLine='<div class="loadbox light"><div class="lv" style="font-size:.92rem">'+
      (e.bnd?bandDot(p.band)+esc(bandLabel(p.band))+(e.bnd==='ass'?' (aide)':''):esc(loadLabelFor(id,p.load)))+'</div></div>'+
      '<div class="center muted small" style="margin-top:4px">Charge allégée, figée pour cette séance</div>';
  else if(e.mode==='load')
    loadLine='<div class="loadbox"><button onclick="adjLoad(-1)" aria-label="Charge inférieure">−</button><div class="lv">'+fmtKg(p.load)+'</div><button onclick="adjLoad(1)" aria-label="Charge supérieure">+</button></div>';
  else if(e.mode==='fixed')
    loadLine='<div class="loadbox"><button onclick="adjLoad(-1)" aria-label="Charge inférieure">−</button><div class="lv" style="font-size:.92rem">'+esc(loadLabelFor(id,p.load))+'</div><button onclick="adjLoad(1)" aria-label="Charge supérieure">+</button></div>';
  else if(e.bnd)
    loadLine='<div class="loadbox"><button onclick="adjBand(-1)" aria-label="Barreau précédent">−</button><div class="lv" style="font-size:.92rem">'+bandDot(p.band)+esc(bandLabel(p.band))+(e.bnd==='ass'?' (aide)':'')+'</div><button onclick="adjBand(1)" aria-label="Barreau suivant">+</button></div>'+
      '<div class="center muted small" style="margin-top:4px">'+(e.bnd==='ass'?'+ = moins d\'aide, plus dur · − = plus d\'aide':'+ = bande plus forte · − = plus faible')+'</div>';
  const held=!!p.hold;
  const holdLine=(e.reps&&!st.cool&&!p.light)
    ? '<div class="spread" style="margin-top:8px"><span class="muted small">'+(held?'Palier tenu : la cible ne monte plus':'Progression active')+'</span>'+
      '<button class="quiet" style="padding:4px 12px;font-size:.75rem" onclick="toggleHold(\''+id+'\')">'+(held?'Reprendre la progression':'Tenir ce palier')+'</button></div>'
    : '';
  if(st.cool) return '<div class="card">'+
    '<span class="tag">Étirement de fin de séance</span>'+
    '<div class="exo-head" style="margin-top:8px"><h3>'+esc(e.nom)+'</h3><span class="exo-en">'+esc(e.en)+'</span></div>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    '<div class="mt">'+figFor(id,e.fig,e.nom)+'</div>'+
    '<details><summary>Exécution</summary><ol class="steps-list">'+e.desc.map(d=>'<li>'+d+'</li>').join('')+'</ol></details>'+
    '<div class="vig">⚠ '+e.vig+'</div>'+
    entry+
    backLine()+
    '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="skipCool()">Passer les étirements</button></div>'+
    kbHint()+
  '</div>';
  /* ordre v1.6 : on lit sa cible, on regle sa charge, puis l illustration,
     entiere a toutes les series. La serie en clair remplace les pips. */
  return '<div class="card">'+
    '<div class="exo-head"><h3>'+esc(e.nom)+'</h3><span class="exo-en">'+esc(e.en)+'</span></div>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    (st.swapped?'<div class="tag flame" style="margin-top:8px">'+(st.light?'Séance allégée : variante de repli':'Variante de repli')+'</div>'
      :(p.light&&(p.repsCut||p.loadCut)?'<div class="tag flame" style="margin-top:8px">Séance allégée : cible réduite</div>':''))+
    '<div class="muted small center" style="margin-top:6px">Série <b class="num">'+st.set+'</b> sur <b class="num">'+st.of+'</b></div>'+
    /* la fourchette affichee est celle de l exercice, p.range, lue par
       rangeOf comme partout (v1.16). Elle ne bouge plus depuis la v2.16, le
       relevement de fourchette ayant disparu, mais le moteur la lit toujours
       la et non au catalogue : un seul chemin. */
    '<div class="perfline">'+
      (e.reps?'<div class="pv cible"><b class="num">'+(p.target||rangeOf(p,e)[0])+'</b><span>Cible</span></div>':'')+
      (e.reps?'<div class="pv"><b class="num">'+rangeOf(p,e)[0]+'-'+rangeOf(p,e)[1]+'</b><span>Fourchette</span></div>':'')+
      /* v2.17 : le barreau de l echelle de tenues, a cote de la fourchette qui
         en depend, la ou la charge et la bande ont leur ligne plus bas */
      (e.rhythm?'<div class="pv"><b class="num">'+tenueOf(id,p)+' s</b><span>Tenue</span></div>':'')+
      /* v2.18 : la hauteur d assise a regler, au meme endroit */
      (e.assise?'<div class="pv"><b class="num">'+assiseOf(id,p)+' cm</b><span>Assise</span></div>':'')+
      ((jour&&jour.length)?'<div class="pv list today"><b class="num">'+setsHtml(jour)+'</b><span>Aujourd\'hui</span></div>':'')+
    '</div>'+
    (prev?'<div class="lastline">Dernière fois <b class="num">'+setsHtml(prev)+'</b>'+lastLevel(id,p)+'</div>':'')+
    loadLine+
    '<div class="mt">'+figFor(id,e.fig,e.nom)+'</div>'+
    '<details><summary>Exécution</summary><ol class="steps-list">'+e.desc.map(d=>'<li>'+d+'</li>').join('')+'</ol></details>'+
    '<div class="vig">⚠ '+e.vig+'</div>'+
    holdLine+
    entry+
    ((!st.swapped&&fbOf(id))?'<button class="danger big mt" onclick="swapPain()">Douleur aujourd\'hui → variante de repli</button>':'')+
    revertLine(st)+
    volSegHtml()+
    '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="skipSet()">Passer</button></div>'+
    kbHint()+
  '</div>';
}
function bump(d){
  const st=cur.steps[cur.i];
  st.val=Math.max(0,(st.val||0)+d);
  const el=$('#vv'); if(el) el.textContent=st.val;
  /* le compteur se rafraichit sans re-rendre la carte : le bouton et son
     explication doivent donc etre bascules a la main, ils ne repassent pas
     par setHtml */
  const b=$('#vb'); if(b){ b.disabled=st.val<1; if(st.val<1) b.classList.add('quiet'); else b.classList.remove('quiet'); }
  const z=$('#vz'); if(z&&z.style) z.style.display=st.val<1?'':'none';
}
function adjLoad(d){
  const st=cur.steps[cur.i], e=DB[st.id], p=perfOf(st.id);
  let nl=p.load;
  if(e.mode==='fixed'){
    const L=fixedLadder(st.id,state.gear);
    if(d>0){ for(const x of L) if(x.v>p.load+0.01){ nl=x.v; break; } }
    else { for(let i=L.length-1;i>=0;i--) if(L[i].v<p.load-0.01){ nl=L[i].v; break; } }
  } else nl=nextLoad(p.load,state.gear,d);
  if(nl!==p.load){p.load=nl;delete p.prevMin;releaseOnManualUp(st.id,d);save();renderSession();}
  else flash(d>0?'Charge maximale disponible avec ton matériel':'Charge minimale');
}
/* Un ajustement manuel change le palier : la memoire de la fenetre de cible
   (v2.14) est faite a l ancien, elle tombe dans les deux sens. Effet assume :
   un ajustement par megarde suivi d un retour dans la meme seance la perd,
   cout un passage. */
/* monter la charge ou la bande a la main vaut « je repars en avant » et libere
   le palier tenu. Descendre le conserve : baisser n est jamais un signal de reprise. */
function releaseOnManualUp(id,d){
  if(d>0&&state.perf[id]&&state.perf[id].hold){ setHold(id,false); flash('Palier libéré : la progression reprend'); }
}
function toggleHold(id){
  const held=isHeld(id);
  setHold(id,!held);
  save();
  flash(held?'Progression reprise sur cet exercice':'Palier tenu : la cible ne montera plus');
  if(view==='session') renderSession(); else render();
}
/* ajustement manuel de la bande, meme logique que les reps : le choix persiste.
   + va toujours vers le plus dur, quel que soit le sens de l exercice */
function adjBand(d){
  const st=cur.steps[cur.i], e=DB[st.id], p=perfOf(st.id);
  const nb=nextBandFor(e,p.band,state.gear,d);
  if(nb){ p.band=nb; delete p.prevMin; releaseOnManualUp(st.id,d); save(); renderSession(); }
  else flash(d>0?'Barreau le plus dur de ton échelle':'Barreau le plus facile');
}
/* Repli douleur : toutes les series restantes de l exercice basculent sur la
   variante protectrice. Les series deja validees ne bougent pas : elles ont
   ete faites sur l exercice d origine, et le journal les a deja inscrites sous
   sa cle. Les series du repli sont journalisees sous une cle propre
   « origine>repli » : deux exercices repliant vers la meme variante ne
   melangent pas leurs series, et l historique garde d ou vient le repli. */
function swapPain(){
  const st=cur.steps[cur.i], fb=fbOf(st.id);
  if(!fb) return;
  const old=st.id, key=old+'>'+fb;
  rhythmAbort();   /* avant la boucle : elle supprime le rt que toneCancel suppose encore la */
  cur.steps.forEach((s,i)=>{
    /* delete s.rt comme dans stepBack : le rythme appartient au couple etape
       plus exercice, il ne suit pas l etape qui change d identite. Aucun des
       deux exercices rythmes n a de repli aujourd hui, la garde est donc sans
       objet et c est exactement pourquoi elle s ecrit : elle tient par
       construction plutot que par l absence de champ fb. */
    /* v2.19 : la mesure non plus. Elle vivait dans st.val pour les repetitions,
       remis a null ici depuis toujours, et dans st.sides et st.done pour les
       tenues, que personne ne remettait a zero : une tenue de 17 s faite sur la
       planche sur ballon arrivait mesuree et validable sur la planche au sol,
       et partait au journal sous elle. Une mesure appartient au couple etape
       plus exercice, au meme titre que le rythme : elle ne suit pas l etape qui
       change d identite, dans aucun mode. Pour garder une tenue finie, il faut
       la valider avant de signaler la douleur. */
    if(i>=cur.i&&s.k==='set'&&s.id===old&&!s.cool){s.id=fb;s.key=key;s.swapped=true;s.from=old;s.val=null;delete s.rt;
      delete s.ct; delete s.sides; delete s.side; delete s.done;}
  });
  relinkRests();
  clearTimers(); flash('On protège, on ne renonce pas.'); renderSession();
}
/* Retour a l exercice d origine (v1.12). Il existe pour la fausse manoeuvre,
   non pour renegocier la douleur : discret, il ne defait rien de ce qui a ete
   fait. Si aucune serie n a ete validee sur le repli, aucune cle « origine>repli »
   n existe et la seance redevient exactement ce qu elle etait. Si une serie y a
   ete faite, elle reste au journal, le repli reste compte dans le capteur de
   douleur, et la progression reste bloquee sur l exercice : le repli a bien eu
   lieu. Le mode allege n est pas un repli douleur et n offre pas ce retour. */
function revertSwap(){
  const st=cur.steps[cur.i], old=st.from;
  if(!st.swapped||st.light||!old||!DB[old]) return;
  cur.steps.forEach((s,i)=>{
    /* v2.19 : meme regle au retour, voir swapPain */
    if(i>=cur.i&&s.k==='set'&&s.from===old&&!s.cool){s.id=old;s.key=old;delete s.swapped;delete s.from;s.val=null;
      delete s.sides; delete s.side; delete s.done; delete s.ct;}
  });
  relinkRests();
  clearTimers(); flash('Retour à '+DB[old].nom); renderSession();
}
/* Premiere etape de travail apres l index i. Extraite de relinkRests en v2.6 :
   l ecran de repos a besoin du pas lui-meme et pas seulement de son
   identifiant, la cle du journal etant st.key des qu un repli est en cours. */
function nextWork(steps,i){
  for(let j=i+1;j<steps.length;j++){
    const s=steps[j];
    if(s.k==='set'||s.k==='cardio') return s;
  }
  return null;
}
/* Apres toute bascule ou tout retour, chaque ecran de repos annonce l exercice
   qui le suit reellement : on relit la sequence plutot que de substituer un
   identifiant, ce qui reste juste quel que soit le sens du changement.
   Elle prend la liste en parametre depuis la v2.6, pour que la construction de
   seance et le changement de volume l appellent au lieu de poser next a la
   main : trois ecritures dispersees du meme champ devenaient trois occasions
   de diverger, il n en reste qu une. */
function relinkRests(steps){
  const L=steps||cur.steps;
  for(let i=0;i<L.length;i++){
    if(L[i].k!=='rest') continue;
    const n=nextWork(L,i);
    L[i].next=n?n.id:null;
    L[i].nextKey=n?(n.key||n.id):null;
  }
}
/* ligne de retour commune aux series et au module cardio */
function revertLine(st){
  if(!st.swapped||st.light||!st.from||!DB[st.from]) return '';
  const fn=(st.k==='cardio')?'revertCardio()':'revertSwap()';
  return '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="'+fn+'">Revenir à '+esc(DB[st.from].nom)+'</button></div>';
}
/* meme geste pendant le module cardio : la marche continue remplace le bas impact */
function swapCardio(){
  const st=cur.steps[cur.i], fb=fbOf(st.id);
  if(!fb||st.swapped) return;
  clearTimers();
  st.id=fb; st.swapped=true; st.from=CARDIO_ID;
  flash('On protège, on ne renonce pas.'); renderSession();
}
/* retour du module cardio, aligne sur celui des series (v1.12) */
function revertCardio(){
  const st=cur.steps[cur.i], old=st.from;
  if(!st.swapped||st.light||!old||!DB[old]) return;
  clearTimers();
  st.id=old; delete st.swapped; delete st.from;
  flash('Retour à '+DB[old].nom); renderSession();
}
function skipSet(){ rhythmAbort(); clearTimers(); nextStep(); }
function validateSet(){
  const st=cur.steps[cur.i], e=DB[st.id];
  /* les etirements de fin ne comptent ni en XP, ni en series, ni en progression */
  if(st.cool){ clearInterval(timers.c); timers.c=null; cur.model=(cur.model||0)+serieModelAdd(st.id,null); nextStep(); return; }
  /* une tenue ne se valide pas sur une mesure absente ou a moitie faite :
     l ecran grise le bouton, ENTREE dit la meme chose (v1.13) */
  if(e.mode==='time'){ holdInit(st,e); if(!holdReady(st)) return; }
  /* une tenue rythmee ne se valide qu arretee et avec au moins une tenue
     complete des deux cotes : l ecran grise le bouton, ENTREE dit la meme
     chose (v2.17) */
  if(e.rhythm){ if(!st.rt||st.rt.on||!st.done) return; }
  /* une serie cadencee, sur ses deux cotes mesures et au moins une
     repetition de chaque (v2.19) */
  if(e.cadence){ cadInit(st); if(!cadReady(st)) return; }
  clearInterval(timers.c); timers.c=null;
  const v=(e.mode==='stretch')?1
        :((e.mode==='time'||e.cadence)?Math.min.apply(null,st.sides):(st.val||0));
  if(e.mode!=='stretch'&&v<1) return;   /* v1.15 : pas de serie a zero, tenues comprises */
  (cur.log[st.key||st.id]=cur.log[st.key||st.id]||[]).push(v);
  /* La duree se range sous la meme cle et au meme instant que la serie : la
     parite des deux tableaux est vraie par construction, et une serie passee
     n ecrivant rien dans le journal n ecrit rien ici non plus. */
  const dur=st.t0?Math.max(0,Math.round((Date.now()-st.t0)/1000)):null;
  (cur.secs[st.key||st.id]=cur.secs[st.key||st.id]||[]).push(dur);
  cur.done=(cur.done||0)+1;
  cur.xp+=XP_SET;
  const ma=serieModelAdd(st.id,v);
  cur.model=(cur.model||0)+ma;
  /* un pas en arriere reste ouvert depuis l etape qui suit immediatement :
     une pression unique qui inscrit quelque chose merite un retour (v1.13) */
  cur.back={i:cur.i,from:cur.i+1,key:st.key||st.id,val:v,model:ma};
  nextStep();
}
/* Retour d un pas. Rien n est persiste en cours de seance, le journal, le
   compteur de series et les XP se defont donc entierement. Un seul pas, et
   seulement depuis l etape qui suit la serie validee. */
/* ============ CHANGEMENT DE VOLUME EN COURS DE SEANCE (v2.1) ============
   L entree « ajustement du nombre de series en cours de seance » etait ecartee
   au carnet pour deux raisons mecaniques, et les bornes posees ici les ferment
   toutes les deux. Le plancher a 2 rend inatteignable prevu=1, donc le chemin
   « une seule serie = montee » ferme en v1.4 ne se rouvre pas. Et la serie en
   plus, bornee a une seule, ne dilue pas une montee acquise : le volume du
   passage est fixe AVANT que la derniere serie soit jouee, donc le passage est
   juge entier, exactement comme s il avait ete lance a ce volume. L entree
   ecartee visait un ajustement retroactif, ce n est pas ce qui est fait ici.
   Rien de plus n est necessaire : prevu se derive des etapes, donc « seance
   complete », la couverture et les verrous suivent d eux-memes. */
function volAllowed(){
  if(!cur||cur.phase!=='work') return [];
  const st=cur.steps[cur.i];
  if(!st||(st.k!=='set'&&st.k!=='rest')||st.cool) return [];
  const en=roundOf(cur.i);      /* round entame : on ne descend jamais dessous */
  return ROUNDS_CHOICES.filter(r=>r>=Math.max(2,en)&&r<=Math.min(4,cur.rounds0+1));
}
/* round auquel appartient l etape courante, transitions comprises */
function roundOf(i){
  for(let k=i;k>=0;k--){ const s=cur.steps[k]; if(s.k==='set'&&!s.cool) return s.round||1; }
  return 1;
}
function volSegHtml(){
  const L=volAllowed();
  if(L.length<2) return '';
  return '<div class="center" style="margin-top:10px"><div class="muted small">Séries par exercice</div>'+
    '<div class="seg roundseg" style="margin-top:6px">'+L.map(r=>
      '<button class="'+(r===cur.rounds?'':'quiet')+'" onclick="setSessionRounds('+r+')">'+r+'</button>').join('')+'</div></div>';
}
function setSessionRounds(R){
  if(!cur||volAllowed().indexOf(R)<0||R===cur.rounds) return;
  const st=cur.steps[cur.i];
  /* coupe : tout ce qui suit le circuit, cardio et etirements, ne bouge pas */
  let cut=cur.steps.length;
  for(let k=0;k<cur.steps.length;k++){ const s=cur.steps[k]; if(s.k==='cardio'||(s.k==='set'&&s.cool)){ cut=k; break; } }
  const queue=cur.steps.slice(cut);
  const byRound=[];
  cur.steps.slice(0,cut).forEach(s=>{ if(s.k==='set'&&!s.cool){ const r=(s.round||1)-1; (byRound[r]=byRound[r]||[]).push(s); } });
  const modele=byRound[byRound.length-1]||[];
  while(byRound.length<R){
    /* un round ajoute reprend les memes exercices, valeurs remises a zero :
       une serie non jouee ne porte rien */
    byRound.push(modele.map(s=>Object.assign({},s,{val:null,t0:null,set:byRound.length+1})));
  }
  byRound.length=R;
  const out=[];
  byRound.forEach((round,r)=>round.forEach((s,i)=>{
    s.set=r+1; s.of=R; s.round=r+1;
    out.push(s);
    const last=(r===R-1&&i===round.length-1);
    /* v2.10 : meme constructeur qu a la construction de seance. Un tour retire
       ou ajoute deplace le raccord, qui se rederive donc de la position et
       n est jamais recopie de l ancienne liste. */
    if(!last) out.push(restStep(i===round.length-1,s.id,round[0].id));
  }));
  cur.steps=out.concat(queue);
  relinkRests();
  cur.rounds=R;
  const j=cur.steps.indexOf(st);
  cur.i=(j>=0)?j:Math.min(cur.i,cur.steps.length-1);
  cur.back=null;      /* le pas en arriere designait une etape d une autre liste */
  /* la duree annoncee suit le volume, sans quoi le recapitulatif comparerait
     le reel a une annonce perimee */
  const parts=planParts({steps:cur.steps,warm:cur.warmMode,light:cur.light,exos:cur.exos});
  cur.plan=Math.round(parts.total/60); cur.planSec=parts.total; cur.model=parts.remount;
  flash(R+' séries par exercice');
  render();
}
function backLine(){
  if(!cur||!cur.back||cur.back.from!==cur.i) return '';
  const st=cur.steps[cur.back.i]; if(!st) return '';
  const nom=DB[st.id]?DB[st.id].nom:'l\'exercice';
  return '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="stepBack()">Revenir à '+esc(nom)+'</button></div>';
}
function stepBack(){
  if(!cur||!cur.back||cur.back.from!==cur.i) return;
  const b=cur.back, st=cur.steps[b.i];
  const arr=cur.log[b.key];
  if(arr&&arr.length) arr.pop();
  if(arr&&!arr.length) delete cur.log[b.key];
  const dar=cur.secs[b.key];
  if(dar&&dar.length) dar.pop();
  if(dar&&!dar.length) delete cur.secs[b.key];
  cur.done=Math.max(0,(cur.done||0)-1);
  cur.xp=Math.max(0,cur.xp-XP_SET);
  /* la part modelisee se defait avec la serie : les secondes deja comptees au
     tick, elles, restent, puisqu elles ont bien ete passees */
  cur.model=Math.max(0,(cur.model||0)-(b.model||0));
  clearTimers();
  st.val=null; delete st.sides; delete st.side; delete st.done; delete st.lbl; delete st.prepLeft;
  delete st.t0; delete st.rt; delete st.ct;
  cur.i=b.i; cur.back=null;
  flash('Série annulée : '+(DB[st.id]?DB[st.id].nom:''));
  renderSession();
}
function skipCool(){
  clearTimers();
  while(cur.i<cur.steps.length&&cur.steps[cur.i].cool) cur.i++;
  if(cur.i>=cur.steps.length){ if(!cur.ending){cur.ending=true;endSession();} }
  else renderSession();
}
/* bips des cinq secondes precedant la cible d un exercice tenu : le chrono
   compte vers le haut. 0 = rien, 1 = bip grave d approche, 2 = bip d arrivee
   (inchange). Le garde target>5 ne concerne que l approche. */
function preBipKind(val,target){
  if(!target) return 0;
  if(val===target) return 2;
  if(target>5&&val>=target-5&&val<target) return 1;
  return 0;
}
/* decompte de preparation avant tout chrono (exercices tenus et etirements),
   rejoue a chaque pression de Demarrer ou Reprendre : reprendre, c est se
   remettre en position. Bip a chaque seconde, plus aigu au depart. 0 = direct. */
function startPrep(runLbl,then){
  const n=prepSec();
  if(n<=0){ then(); return; }
  let left=n;
  cur.steps[cur.i].prepLeft=left;
  const bt=$('#ct'); if(bt) bt.textContent=runLbl;
  const el=$('#cc'); if(el) el.textContent=String(left);
  beep(700,.1);
  timers.c=setInterval(()=>{
    tick(); left--;
    cur.steps[cur.i].prepLeft=left;
    const e2=$('#cc'); if(!e2){clearInterval(timers.c);return;}
    if(left>0){ e2.textContent=String(left); beep(700,.1); }
    else { clearInterval(timers.c); timers.c=null; delete cur.steps[cur.i].prepLeft; beep(1150,.16); then(); }
  },1000);
}
/* Tenues chronometrees (v1.13). « Reprendre » disparait : un Stop est definitif.
   Il permettait d atteindre 45 s en trois morceaux de 15, alors que la
   fourchette mesure une tenue continue ; l outil ne disait pas quelle lecture
   il attendait. Pour refaire, on reinitialise et on repart de zero.
   Un exercice par cote est deux tenues completes : la validation exige une
   mesure de chaque cote, et c est le cote le plus court qui part au journal,
   pour que l asymetrie soit visible plutot que masquee.
   ESPACE ne detruit jamais une mesure : une fois le dernier cote arrete, il
   est inerte, et la remise a zero est un bouton, jamais une touche. */
function holdInit(st,e){
  if(!st.sides) st.sides=new Array((e||DB[st.id]).side?2:1).fill(null);
  if(st.side==null) st.side=0;
  if(st.val==null) st.val=0;
}
function holdOver(st){ return !!st.done&&st.side>=st.sides.length-1; }
function holdReady(st){ return st.sides&&st.sides.every(v=>v!=null); }
function holdLbl(st){
  if(timers.c) return 'Stop';
  if(!st.done) return st.side>0?'Second côté':'Démarrer';
  return st.side<st.sides.length-1?'Second côté':'Tenue mesurée';
}
function holdRecap(st){
  return st.sides.map((v,i)=>(i?'2e':'1er')+' côté : '+(v==null?'—':fmtT(v))+(v!=null&&!timers.c?' '+trimBtn(st,i):'')).join(' · ');
}
/* Rogner une tenue mesuree (v2.16). Le chrono tourne jusqu a ESPACE, et entre
   la fin reelle de la tenue et l appui il se passe couramment plusieurs
   secondes, jusqu a huit constatees sur un gainage lateral : la mesure est une
   borne haute. Le bouton retire les secondes qu on n a pas tenues, une par
   appui, jamais il n en ajoute, et jamais sous 1 puisqu une serie a zero n est
   pas une serie. Une declaration qui ne peut que baisser la valeur ne cree
   aucune incitation, c est ce qui la distingue des champs declaratifs ecartes
   au carnet. Le Stop reste definitif, on rogne, on ne reprend pas ; ESPACE ne
   touche pas a la mesure, le rognage est un bouton et la touche moins. Sur
   une tenue par cote chaque cote mesure porte son bouton, la correction se
   fait sur l ecran de validation, avant que le cote le plus court parte au
   journal. Inerte pendant qu un chrono tourne : on ne rogne pas une mesure
   qui n est pas finie. */
function trimBtn(st,i){
  const v=st.sides&&st.sides[i];
  return '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="trimHold('+i+')"'+(v==null||v<=1||timers.c?' disabled':'')+' aria-label="Retirer une seconde">− 1 s</button>';
}
function trimHold(i){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.sides||timers.c) return;
  if(st.sides[i]==null||st.sides[i]<=1) return;
  st.sides[i]--;
  if(i===st.side) st.val=st.sides[i];
  renderSession();
}
function toggleChrono(){
  const st=cur.steps[cur.i], e=DB[st.id];
  holdInit(st,e);
  if(timers.c){                       /* Stop : la mesure du cote est figee */
    clearInterval(timers.c); timers.c=null; delete st.prepLeft;
    st.sides[st.side]=st.val||0; st.done=true;
    renderSession(); return;
  }
  if(st.done){                        /* passage au cote suivant */
    if(st.side>=st.sides.length-1) return;
    st.side++; st.done=false; st.val=0;
    beep(700,.22);
    renderSession();
    runHold(st); return;
  }
  runHold(st);
}
function runHold(st){
  startPrep('Stop',()=>{
    const b=$('#ct'); if(b) b.textContent='Stop';
    const el=$('#cc'); if(el) el.textContent=fmtT(st.val||0);
    timers.c=setInterval(()=>{
      tick(); st.val=(st.val||0)+1;
      const e2=$('#cc'); if(!e2){clearInterval(timers.c);return;}
      e2.textContent=fmtT(st.val);
      const p=perfFor(st.id,!!st.light), k=preBipKind(st.val,p.target||0);
      if(k===2) beep(1200,.22); else if(k===1) beep(700,.12);
      else if(repereOn()&&st.val%REPERE.pas===0) tone(REPERE.freq,0,REPERE.dur,REPERE.gain);
    },1000);
  });
}
function resetHold(){
  const st=cur.steps[cur.i];
  if(!st||!st.sides||timers.c||!st.done) return;
  st.sides[st.side]=null; st.val=0; st.done=false;
  renderSession();
}
/* ============ TENUES RYTHMEES (v2.17) ============
   Bird-dog et dead bug. Une serie est une suite de tenues alternees, droite
   puis gauche, chacune de la duree du barreau courant et suivie d une bascule
   de 2 s. L outil rythme la serie au son : un coup a l ouverture de chaque
   tenue, un coup grave a sa fermeture, le ton de cible sur la fermeture qui
   amene un cote a sa cible, et le metronome continue jusqu au Stop, la cible
   est ce qu on vise, pas la ou l on s arrete. Le decompte de preparation
   enchaine directement sur la premiere ouverture : son zero EST le premier
   coup, sinon une seconde morte s installe avant le rythme.
   DEUX HORLOGES. L etat (compteurs, phase, cote) se derive du temps ecoule sur
   l horloge murale, rien n est accumule par tick : une boucle qui se reveille
   en retard ne perd rien, et une suite de test pilote le temps a la main. Les
   coups, eux, sont programmes en avance sur l horloge audio, seule capable de
   sonner a l instant voulu quel que soit le reveil du timer ; le decalage
   entre les deux horloges est releve au depart, une fois. Sans son, mode
   degrade assume : le rythme se lit a l ecran.
   STOP, REPRENDRE, ROGNER. Le Stop est la seule entree pendant le rythme, et
   la tenue en cours ne compte pas. Il n est pas definitif comme sur une tenue
   chronometree : la-bas la continuite EST la mesure et 45 s en trois morceaux
   de 15 ne mesurent rien (v1.13) ; ici la mesure est chaque tenue, intacte
   quelle que soit la pause avant elle, et la serie n est que leur somme. Une
   interruption ne detruit donc pas la serie : Reprendre rejoue le decompte et
   repart sur le cote qui etait en cours, l ecart entre cotes reste d au plus
   un. Le rognage « - 1 tenue » est l analogue du « - 1 s » (v2.16) : entre la
   fermeture reelle et la main qui atteint le telephone au sol il se passe des
   secondes, qui a 3 s de tenue valent une tenue comptee de trop ; une
   declaration qui ne peut que baisser ne cree aucune incitation. Le cote le
   plus court part au journal (v1.13). */
const RHYTHM_TICK=250, RHYTHM_AHEAD=.35;
const RHYTHM_OPEN=950, RHYTHM_CLOSE=700, RHYTHM_CIBLE=1200;
const RHYTHM_PREP_OFF=[0,.26];        /* coup double du decompte, comme beep() */
function rhythmNow(){ return (typeof performance!=='undefined'&&performance.now)?performance.now()/1000:Date.now()/1000; }
function rhythmInit(st){
  if(!st.rt) st.rt={d:0,g:0,s0:0,on:false,stopped:false,t0:null};
  return st.rt;
}
function rhythmSpec(st){
  const e=DB[st.id], p=perfFor(st.id,!!st.light), r=rungOf(e,p.tenue);
  return {tenue:r.tenue,bascule:e.rhythm.bascule,cycle:r.tenue+e.rhythm.bascule,cible:p.target||r.reps[0]};
}
/* Repartition de n tenues fermees entre droite et gauche quand la premiere a
   ete jouee du cote s0 (0 droite, 1 gauche) : [droite, gauche]. */
function rhythmSplit(n,s0){ const a=Math.ceil(n/2), b=Math.floor(n/2); return s0===0?[a,b]:[b,a]; }
/* Tenues fermees a l instant e (secondes depuis la premiere ouverture). */
function rhythmClosed(sp,e){ return e>=sp.tenue?Math.floor((e-sp.tenue)/sp.cycle)+1:0; }
function rhythmSide(s){ return s?'Gauche':'Droite'; }
/* Le cote mis en valeur est celui qui est en jeu ou qui vient immediatement :
   celui qui demarre avant le depart et pendant le decompte, celui de la tenue
   en cours, celui qu annonce la bascule. Une serie arretee n en met aucun, rien
   ne vient tant qu on n a pas repris. La ligne est en muted, l accent suffit
   donc a la lecture de biais depuis le sol, sans ajouter de classe. */
function rhythmCountsHtml(d,g,cible,actif){
  const cote=(s,v)=>{ const t=rhythmSide(s)+' <b class="num">'+v+'</b>';
    return actif===s?'<span style="color:var(--accent);font-weight:700">'+t+'</span>':t; };
  return cote(0,d)+' · '+cote(1,g)+' · cible <b class="num">'+cible+'</b> par côté';
}
function rhythmStart(st){
  const rt=rhythmInit(st), sp=rhythmSpec(st), n=prepSec(), now=rhythmNow();
  rt.on=true; rt.stopped=false; rt.start=now; rt.ticked=0; rt.t0=now+n+.15; rt.sched=0;
  st.done=false;
  const ctx=sndOn()?audioCtx():null;
  rt.off=ctx?(ctx.currentTime-now):null;
  if(ctx&&ctx.state==='suspended'&&ctx.resume){ try{ ctx.resume(); }catch(e){} }
  /* Le decompte sonne comme partout ailleurs : coup double a 260 ms, le meme
     que beep(700,.1). L emission simple ne vaut que dans le rythme, ou le
     second coup tomberait au dixieme d une tenue de 3 s ; le decompte, lui,
     est avant le rythme et espace d une seconde, rien ne s y brouille. Le zero
     du decompte est l ouverture de la premiere tenue, a 950 : la montee de
     hauteur par rapport au tick est conservee, et 1150 n est pas repris parce
     qu il est colle au 1200 du ton de cible, la premiere tenue sonnerait comme
     une cible atteinte. Pas de vibration : derriere la porte des sons elle ne
     sert jamais de repli, le telephone est au sol sur ces deux exercices, et
     elle ne s ordonnance pas sur l horloge audio. */
  if(rt.off!=null) for(let k=n;k>=1;k--) RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,rt.t0-k+d+rt.off,.1));
  clearInterval(timers.c);
  timers.c=setInterval(rhythmLoop,RHYTHM_TICK);
  renderSession();
  rhythmLoop();
}
function rhythmLoop(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.rt||!st.rt.on){ if(timers.c){ clearInterval(timers.c); timers.c=null; } return; }
  const rt=st.rt, sp=rhythmSpec(st), now=rhythmNow();
  /* le modele compte les secondes ecoulees, une fois chacune */
  const sec=Math.floor(now-rt.start); while(rt.ticked<sec){ tick(); rt.ticked++; }
  /* coups a venir dans la fenetre d avance */
  if(rt.off!=null){
    let garde=0;
    while(rt.t0+rt.sched*sp.cycle<now+RHYTHM_AHEAD&&garde++<50){
      const i=rt.sched, side=(rt.s0+i)%2, sp2=rhythmSplit(i+1,rt.s0);
      const apres=side===0?rt.d+sp2[0]:rt.g+sp2[1], cible=apres===sp.cible;
      tone(RHYTHM_OPEN,rt.t0+i*sp.cycle+rt.off,.12);
      tone(cible?RHYTHM_CIBLE:RHYTHM_CLOSE,rt.t0+i*sp.cycle+sp.tenue+rt.off,cible?.22:.12);
      rt.sched++;
    }
  }
  rhythmPaint(st,sp,now-rt.t0);
}
function rhythmPaint(st,sp,e){
  const rt=st.rt, lbl=$('#phlabel'), cc=$('#cc'), cnt=$('#rcount');
  if(!cc) return;
  if(e<0){
    if(lbl) lbl.textContent='En position · '+rhythmSide(rt.s0);
    /* borne au decompte regle : les 0,15 s d avance du depart afficheraient
       un 4 sur un decompte de 3 */
    cc.textContent=String(Math.max(1,Math.min(prepSec()||1,Math.ceil(-e)))); cc.className='chrono num';
    return;
  }
  const i=Math.floor(e/sp.cycle), ph=e-i*sp.cycle, hold=ph<sp.tenue, side=(rt.s0+i)%2;
  const c=rhythmSplit(rhythmClosed(sp,e),rt.s0);
  const suivant=(rt.s0+i+1)%2;
  if(hold){ if(lbl) lbl.textContent=rhythmSide(side); cc.textContent=String(Math.max(1,Math.ceil(sp.tenue-ph))); cc.className='chrono num'; }
  else { if(lbl) lbl.textContent='Passe à '+(suivant?'gauche':'droite'); cc.textContent='·'; cc.className='chrono num rest pause'; }
  if(cnt) cnt.innerHTML=rhythmCountsHtml(rt.d+c[0],rt.g+c[1],sp.cible,hold?side:suivant);
}
function rhythmStop(st){
  const rt=st.rt; if(!rt||!rt.on) return;
  const sp=rhythmSpec(st), e=rhythmNow()-rt.t0, n=rhythmClosed(sp,e), c=rhythmSplit(n,rt.s0);
  rt.d+=c[0]; rt.g+=c[1]; rt.s0=(rt.s0+n)%2;
  rt.on=false; rt.stopped=true; rt.t0=null;
  clearInterval(timers.c); timers.c=null;
  toneCancel();
  st.val=Math.min(rt.d,rt.g); st.done=true;
  renderSession();
}
function toggleRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!DB[st.id]||!DB[st.id].rhythm) return;
  const rt=rhythmInit(st);
  if(rt.on) rhythmStop(st); else if(!rt.stopped) rhythmStart(st);
}
/* Etape quittee pendant le rythme, sans passer par le Stop : la serie est
   abandonnee et rien ne part au journal, mais les coups deja programmes sur
   l horloge audio sonneraient apres le depart et le rt resterait arme, avec un
   t0 qui vieillit. Appele partout ou l on quitte une etape en cours. */
function rhythmAbort(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st) return;
  /* v2.19 : meme abandon pour une serie cadencee en cours */
  if(st.ct&&st.ct.on){ st.ct.on=false; toneCancel(); }
  if(!st.rt||!st.rt.on) return;
  st.rt.on=false; toneCancel();
}
function resumeRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on||!st.rt.stopped) return;
  rhythmStart(st);
}
/* Le rognage retire la DERNIERE tenue comptee, du cote ou elle a ete comptee,
   et la valeur au journal se recalcule sur les compteurs. Il ne se soustrait
   pas a la valeur : quand les deux cotes different d une tenue, la latence du
   Stop est deja absorbee par le cote le plus court, et retrancher au journal
   enlevait une tenue qui avait ete tenue. Cas releve par Gabriel : six par
   cote, Stop tardif, droite a sept ; le journal disait deja six et « - 1 tenue »
   le faisait tomber a cinq, en laissant les compteurs a 7 et 6. Retiree la ou
   elle a ete comptee, la tenue laisse compteurs et journal d accord, et la
   reprise repart sur le cote rendu. Plancher : les compteurs, qui ne passent
   pas sous zero ; la valeur au journal peut donc revenir a zero, etat que le
   Stop apres une seule tenue produit deja et que l ecran sait dire. */
function trimRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on||!st.done) return;
  const rt=st.rt, s=(rt.s0+1)%2;        /* cote de la derniere tenue fermee */
  if(s===0?rt.d<=0:rt.g<=0) return;
  if(s===0) rt.d--; else rt.g--;
  rt.s0=s;                              /* elle est a refaire : la reprise y repart */
  st.val=Math.min(rt.d,rt.g);
  renderSession();
}
function resetRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on) return;
  delete st.rt; st.val=0; delete st.done;
  renderSession();
}
/* ============ REPETITIONS CADENCEES (v2.19) ============
   Gainage lateral avec abductions. Une serie est une planche tenue sur un
   cote pendant laquelle la jambe du dessus monte et descend au son, puis la
   meme chose de l autre cote. Moteur a part du rythme des tenues : celui-ci
   alterne les cotes a chaque repetition, ce qui est impossible ici, changer
   de cote c est se retourner. Il en partage les briques, les deux horloges,
   l emetteur simple-coup, les frequences et le decompte a coup double.
   DEROULE. Decompte allonge sur le cote, avant-bras pose ; a son zero, le
   double coup a 1150 Hz du gainage lateral classique, puisque c en est un :
   le bassin se decolle. Suivent etab secondes de planche jambes serrees, la
   ligne a stabiliser avant de charger la jambe, puis la cadence. Au bird-dog
   le decompte enchaine directement parce que la position de depart est un
   repos ; ici elle exige un mouvement. Le 1150, ecarte en v2.17 parce qu il
   est colle au ton de cible, ne s y confond pas ici : double coup, au depart,
   suivi de secondes de silence, quand la cible est un coup simple en fin de
   serie.
   COMPTE. Une repetition compte a la fin de sa descente, jambe revenue : la
   descente freinee est la moitie de l exercice, une jambe qui retombe ne doit
   pas compter. Coup a 950 au debut de chaque montee, coup a 700 au debut de
   chaque descente. Le ton de cible sonne donc a la fin de la repetition qui
   amene le cote a sa cible, a la place du 950 qui ouvre la suivante, et la
   cadence continue jusqu au Stop. Valeurs retenues par Gabriel sur maquette,
   15 et 17 septembre 2026 : 1,5 s de montee et 1,5 s de descente, la montee
   en 1 s etant jugee violente, 3 s d etablissement.
   STOP. Definitif pour le cote, comme sur une tenue (v1.13) : la planche est
   continue et la reprendre en deux morceaux retirerait le gainage que le
   mouvement de la jambe met a l epreuve. Un Stop accidentel se corrige par
   « Reinitialiser ce cote ». Chaque cote mesure porte son « - 1 rep », pour la
   latence du Stop ; plancher a zero, la validation exigeant une repetition
   de chaque cote. Le cote le plus court part au journal. */
const CAD_GO=1150;
/* v2.22, trois changements, un par retour de Gabriel.
   AIGU. Il sonnait a la place du 950 de la montee qui suit la repetition-
   cible : le cycle est continu, la fin d une descente et le debut de la
   montee suivante sont le meme instant, donc l aigu tombait sur l elevation
   d apres. Au bird-dog la bascule separe les deux evenements, ici rien. Il
   remplace desormais le 950 de la montee de la repetition-cible : « celle-ci
   est la bonne ». Le credit au Stop ne change pas, fin de descente, le plus
   robuste a la latence : un Stop n importe ou dans la repetition suivante
   enregistre le bon compte.
   CHIFFRE. Le grand chiffre porte la repetition en cours, 1 des la premiere
   montee ; la ligne des comptes porte les repetitions terminees, ce que le
   Stop enregistre.
   GENERALISATION. Le pont fessier et sa lignee passent au son : sur le dos,
   l ecran ne se voit pas, critere deja ecrit pour bird-dog et dead bug. D ou
   un cote ou deux selon e.side, une tenue en haut (tenue, silence entre le
   sommet et le 700), un etablissement optionnel, et la reprise du bird-dog
   (reprise) : un pont n a rien de continu, une pause en bas est un repos.
   Sur les abductions le Stop reste definitif, la planche est continue. */
function cadN(e){ return e&&e.side?2:1; }
function cadInit(st){
  const n=cadN(DB[st.id]);
  if(!st.sides||st.sides.length!==n) st.sides=new Array(n).fill(null);
  if(st.side==null) st.side=0;
  if(!st.ct) st.ct={on:false,t0:null};
  return st.ct;
}
function cadSpec(st){
  const e=DB[st.id], p=perfFor(st.id,!!st.light), c=e.cadence, tenue=c.tenue||0;
  return {monte:c.monte,tenue:tenue,descente:c.descente,etab:c.etab||0,cycle:c.monte+tenue+c.descente,
          reprise:!!c.reprise,n:cadN(e),cible:p.target||rangeOf(p,e)[0]};
}
/* Repetitions completes a l instant e, en secondes depuis la premiere montee. */
function cadClosed(sp,e){ return e>0?Math.floor(e/sp.cycle):0; }
/* Pas de garde sur la cadence en cours : un cote ne demarre que non mesure,
   frais, remis a zero, second ou repris, donc une serie qui tourne a toujours
   un cote a null. */
function cadReady(st){ return !!st.sides&&st.sides.every(v=>v!=null)&&Math.min.apply(null,st.sides)>=1; }
function cadOver(st){ return !!st.done&&st.side>=st.sides.length-1; }
function cadLbl(st){
  if(st.ct&&st.ct.on) return 'Stop';
  if(!st.done) return st.side>0?'Second côté':'Démarrer';
  return st.side<st.sides.length-1?'Second côté':'Série mesurée';
}
/* Ce qui se lit pendant le decompte, et ce qui se fait entre deux cotes,
   depend du geste : se retourner sur le flanc, ou changer de jambe. */
function cadPose(e,side){
  if(e.cadence.etab) return 'Allonge-toi sur le côté '+(side?'gauche':'droit')+', avant-bras posé. Au double bip, décolle le bassin.';
  return (cadN(e)>1?'Pied '+(side?'gauche':'droit')+' au sol, l\'autre jambe tendue. ':'')+'La première montée vient au bip.';
}
function cadChange(e){ return e.cadence.etab?'Retourne-toi, puis Second côté.':'Change de jambe, puis Second côté.'; }
/* Ligne des comptes : un cote non mesure est « a faire », pas zero. Le cote
   mis en valeur est celui qui tourne ou qui vient. Sans cotes, le compte seul. */
function cadCountsHtml(m,cible,actif,live){
  const val=s=>{ const v=(live!=null&&s===actif)?live:m[s]; return v==null?'à faire':'<b class="num">'+v+'</b>'; };
  if(m.length<2){
    const t='Faites '+val(0);
    return (actif===0?'<span style="color:var(--accent);font-weight:700">'+t+'</span>':t)+' · cible <b class="num">'+cible+'</b>';
  }
  const cote=s=>{
    const t=rhythmSide(s)+' '+val(s);
    return actif===s?'<span style="color:var(--accent);font-weight:700">'+t+'</span>':t;
  };
  return cote(0)+' · '+cote(1)+' · cible <b class="num">'+cible+'</b> par côté';
}
function cadStart(st){
  const ct=cadInit(st), sp=cadSpec(st), n=prepSec(), now=rhythmNow();
  /* base : les repetitions deja comptees sur ce cote, non nulles seulement sur
     une reprise. La cadence repart d elles, et l aigu ne sonne que si la cible
     n est pas deja atteinte. */
  ct.base=(sp.reprise&&st.sides[st.side]!=null)?st.sides[st.side]:0;
  st.sides[st.side]=null;
  ct.on=true; ct.start=now; ct.ticked=0; ct.t0=now+n+.15+sp.etab; ct.sched=0;
  st.done=false; st.val=0;
  const ctx=sndOn()?audioCtx():null;
  ct.off=ctx?(ctx.currentTime-now):null;
  if(ctx&&ctx.state==='suspended'&&ctx.resume){ try{ ctx.resume(); }catch(e){} }
  const zero=ct.t0-sp.etab;
  if(ct.off!=null){
    for(let k=n;k>=1;k--) RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,zero-k+d+ct.off,.1));
    if(sp.etab>0) RHYTHM_PREP_OFF.forEach(d=>tone(CAD_GO,zero+d+ct.off,.16));
  }
  clearInterval(timers.c);
  timers.c=setInterval(cadLoop,RHYTHM_TICK);
  renderSession();
  cadLoop();
}
function cadLoop(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.ct||!st.ct.on){ if(timers.c){ clearInterval(timers.c); timers.c=null; } return; }
  const ct=st.ct, sp=cadSpec(st), now=rhythmNow();
  const sec=Math.floor(now-ct.start); while(ct.ticked<sec){ tick(); ct.ticked++; }
  if(ct.off!=null){
    let garde=0;
    while(ct.t0+ct.sched*sp.cycle<now+RHYTHM_AHEAD&&garde++<50){
      /* la montee i ouvre la repetition base+i+1 : l aigu sur celle qui vaut
         la cible, a la place de son 950 */
      const i=ct.sched, t=ct.t0+i*sp.cycle+ct.off, cible=(ct.base||0)+i+1===sp.cible;
      tone(cible?RHYTHM_CIBLE:RHYTHM_OPEN,t,cible?.22:.12);
      tone(RHYTHM_CLOSE,t+sp.monte+sp.tenue,.12);
      ct.sched++;
    }
  }
  cadPaint(st,sp,now-ct.t0);
}
function cadPaint(st,sp,e){
  const lbl=$('#phlabel'), cc=$('#cc'), ph=$('#phase'), cnt=$('#rcount'), aide=$('#aide');
  if(!cc) return;
  const E=DB[st.id], base=(st.ct&&st.ct.base)||0, cote=sp.n>1?rhythmSide(st.side):'';
  cc.className='chrono num';
  if(e<-sp.etab){
    if(lbl) lbl.textContent='En position'+(cote?' · '+cote:'');
    cc.textContent=String(Math.max(1,Math.min(prepSec()||1,Math.ceil(-e-sp.etab))));
    if(ph) ph.innerHTML='';
    if(aide) aide.textContent=cadPose(E,st.side);
    if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base||null);
    return;
  }
  if(lbl) lbl.textContent=cote||'En cours';
  if(e<0){
    cc.textContent='0';
    if(ph) ph.innerHTML='<span class="tag ok">Établis la ligne</span>';
    if(aide) aide.textContent='Bassin décollé, jambes serrées. La première montée vient au bip aigu.';
    if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base);
    return;
  }
  const n=cadClosed(sp,e), t=e-n*sp.cycle;
  cc.textContent=String(base+n+1);
  const tag=t<sp.monte?'<span class="tag">Monte</span>'
    :t<sp.monte+sp.tenue?'<span class="tag ok">Tiens</span>'
    :'<span class="tag pause">Descends</span>';
  if(ph) ph.innerHTML=tag;
  if(aide) aide.textContent=sp.reprise?'Le Stop arrête ce côté ; la répétition en cours ne compte pas, tu pourras reprendre.'
    :'Le Stop fige ce côté ; la répétition en cours ne compte pas.';
  if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base+n);
}
function cadStop(st){
  const ct=st.ct; if(!ct||!ct.on) return;
  const n=cadClosed(cadSpec(st),rhythmNow()-ct.t0)+(ct.base||0);
  st.sides[st.side]=n; st.val=n; st.done=true;
  ct.on=false; ct.t0=null; ct.base=0;
  clearInterval(timers.c); timers.c=null;
  toneCancel();
  renderSession();
}
function toggleCadence(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!DB[st.id]||!DB[st.id].cadence) return;
  const ct=cadInit(st);
  if(ct.on){ cadStop(st); return; }
  if(st.done){ if(st.side>=st.sides.length-1) return; st.side++; st.done=false; }
  cadStart(st);
}
/* Reprise (v2.22), sur le seul exercice qui la declare : le cote arrete
   repart de son compte, decompte rejoue, comme le bird-dog. Jamais sur un cote
   deja quitte : Second côté ferme le premier. */
function resumeCad(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!DB[st.id]||!DB[st.id].cadence) return;
  const ct=cadInit(st);
  if(ct.on||!st.done||!DB[st.id].cadence.reprise||st.sides[st.side]==null) return;
  st.done=false;
  cadStart(st);
}
function trimCad(i){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.sides||(st.ct&&st.ct.on)) return;
  if(st.sides[i]==null||st.sides[i]<=0) return;
  st.sides[i]--;
  if(i===st.side) st.val=st.sides[i];
  renderSession();
}
function resetCad(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.sides||(st.ct&&st.ct.on)||!st.done) return;
  st.sides[st.side]=null; st.val=0; st.done=false;
  renderSession();
}
/* Etirements bilateraux : deux blocs enchaines plutot qu un seul, sur le motif
   du module cardio. Le chrono affiche le temps du cote en cours, un bip grave
   annonce la bascule, un bip aigu la fin. Le premier bloc est arrondi au
   superieur pour que la somme fasse exactement la duree de base, quelle que
   soit sa parite. Les etirements non bilateraux gardent un bloc unique. */
function stretchPhases(e){
  const d=e.dur||45;
  if(!e.bilat) return [d];
  const a=Math.ceil(d/2);
  return [a,d-a];
}
function stretchSideLabel(i){ return i?'Second côté':'Premier côté'; }
function setStretchLbl(st,v){ st.lbl=v; const b=$('#ct'); if(b) b.textContent=v; }
function toggleStretch(){
  const st=cur.steps[cur.i], e=DB[st.id], ph=stretchPhases(e);
  if(timers.c){clearInterval(timers.c);timers.c=null;delete st.prepLeft;setStretchLbl(st,'Reprendre');const el=$('#cc');if(el)el.textContent=fmtT(st.val||0);return;}
  /* chrono expire : on repart du premier cote pour la duree pleine */
  if(!st.val||st.val<=0){
    if(st.side>=ph.length-1){ st.side=0; const l=$('#phlabel'); if(l&&e.bilat) l.textContent=stretchSideLabel(0); }
    st.val=ph[st.side];
  }
  startPrep('Pause',()=>{
    setStretchLbl(st,'Pause');
    const el=$('#cc'); if(el) el.textContent=fmtT(st.val);
    timers.c=setInterval(()=>{
      tick(); st.val--;
      const e2=$('#cc'); if(!e2){clearInterval(timers.c);return;}
      e2.textContent=fmtT(st.val);
      if(st.val<=0&&st.side<ph.length-1){
        st.side++; st.val=ph[st.side];
        beep(700,.2);
        const l=$('#phlabel'); if(l) l.textContent=stretchSideLabel(st.side);
        e2.textContent=fmtT(st.val);
      }
      else if(st.val<=0){clearInterval(timers.c);timers.c=null;beep(880,.22);setStretchLbl(st,'Recommencer');}
    },1000);
  });
}

/* --- repos --- */
/* L exercice suivant etait annonce en texte seul. La vignette dit en un coup
   d oeil ce que la phrase demande de lire, et c est deja le role qu elle tient
   dans le detail de seance et dans la bibliotheque, avec la meme empreinte de
   74 par 52 (v2.2). Elle est inerte : un lien vers la fiche ferait quitter la
   seance depuis un ecran dont le chrono continue de tourner.
   Elle ne porte ni cible ni charge. L ecran de repos annonce ce qui vient,
   l ecran de serie prescrit, et il arrive quinze secondes plus tard ; deux
   ecrans qui prescrivent la meme chose finiraient par diverger.
   Elle porte en revanche les series deja faites aujourd hui sur cet exercice
   (v2.6). Ce sont une annonce et non une prescription, donc du bon cote de la
   ligne tracee ici meme, et rien ne s y recalcule : le journal est un fait.
   La cle lue est nextKey et jamais l identifiant, car des qu un repli douleur
   est en cours le journal s ecrit sous « origine>repli » ; lire l identifiant
   afficherait les series de l exercice d origine sous la vignette du repli.
   Rien avant le premier passage du jour : la derniere fois est un contexte
   d une autre nature, elle reste sur l ecran de serie. Meme vocabulaire que
   la pastille de cet ecran, jusqu au libelle et au formateur de liste. */
function nextExoHtml(id,key){
  const e=id?DB[id]:null;
  if(!e) return '';
  const jour=(key&&cur&&cur.log&&cur.log[key])||null;
  return '<div class="nextexo">'+
    (typeof IMG!=='undefined'&&IMG[id]?'<img src="'+IMG[id]+'" alt="" loading="lazy">':'<span class="thumbph"></span>')+
    '<span class="ex"><span class="muted small">Ensuite</span><b>'+esc(e.nom)+'</b>'+
    '<span class="muted small">'+esc(e.mus)+'</span></span>'+
    ((jour&&jour.length)?'<span class="jour"><b class="num">'+setsHtml(jour)+'</b><span>Aujourd\'hui</span></span>':'')+
    '</div>';
}
/* Temps ecoule depuis le lancement de la seance (v2.9). Recalcule depuis
   cur.t0 a chaque lecture, et jamais incremente : setInterval est etrangle
   quand l ecran du telephone s eteint, et un compteur incremente mentirait
   apres une poche. C est aussi l ancre de « real » dans l historique, donc les
   deux nombres ne peuvent pas s ecarter d une seconde. */
function sessionElapsed(){ return (cur&&cur.t0)?Math.max(0,Math.floor((Date.now()-cur.t0)/1000)):null; }
/* Heure et temps ecoule, dans cet ordre. Le h et le min font l etiquette :
   deux nombres nus se seraient confondus. */
function sessionTime(){ const s=sessionElapsed(); return s==null?'':fmtHM()+' · '+fmtEcoule(s); }
/* La ligne du tag n existait qu au singulier. Elle ne passe en spread que
   lorsqu elle a deux occupants : sans t0, un spread a un seul element chasserait
   le tag a gauche alors que la card le centre. */
/* v2.10 : le tag se lit sur le drapeau de l etape et non plus sur sa duree.
   L heuristique sec<=20 appelait « Repos » une transition reglee a 30 s, et
   elle aurait appele « Repos » la pause de raccord : deux choses differentes
   sous un meme mot, faute d un fait a lire. Il y en a un maintenant. */
function restTagHtml(st){
  const tag='<span class="tag'+(st.pause?' pause':'')+'">'+(st.pause?'Pause de tour':'Transition')+'</span>';
  const t=sessionTime();
  return t?'<div class="spread">'+tag+'<span class="tline num" id="tl">'+t+'</span></div>':tag;
}
/* v2.18 : le texte date de la pause inconditionnelle de la v2.10. Il disait le
   raccord « seule adjacence ou l alternance ne repose rien », et une minute
   « ce qu il faut » : le carnet a retire les deux affirmations en v2.11, la
   duree etant un choix de cout et non un seuil. La pause etant desormais posee
   sur des paires constatees, le texte le dit, sans chiffrer un besoin.
   Le pourquoi de la pause, replie. Il se lit avant d appuyer sur Passer et non
   apres : une confirmation en deux temps est exclue, il n y a plus aucun
   dialogue nulle part, et l outil ne peut pas observer si l epaule a recupere.
   L ouverture passe par cardOpen, donc elle survit a un changement de volume
   pendant la pause. */
function pauseWhyHtml(){
  return '<div class="pausemsg"><b>Le tour recommence.</b></div>'+
    '<details class="msec plat" data-k="rest-why"'+cardOpen('rest-why',false)+'>'+
    '<summary>Pourquoi cette pause est plus longue</summary>'+
    '<div class="mdet muted small">Le circuit boucle : le dernier exercice d\'un tour précède le premier du tour suivant. '+
    'Tu as signalé une gêne d\'épaule sur cet enchaînement, et la pause est posée sur lui seul. '+
    'Sans elle, la première série du tour suivant se fait sur une épaule déjà fatiguée, et la comparaison qui décide des montées de charge se fait entre deux états différents. '+
    'Passer reste possible, le chrono n\'est pas un ordre.</div></details>';
}
/* Sur une transition, partir tot est normal et le bouton est l action
   principale. Sur une pause, partir tot la defait : l ecran n a plus d action
   principale, ce qui est exactement ce qu il prescrit. Le bouton reste, au
   meme endroit et sous le meme nom, degrade en secondaire. */
function restHtml(st){
  const n=st.next?DB[st.next]:null;
  return '<div class="card center'+(st.pause?' pausecard':'')+'">'+
    restTagHtml(st)+
    '<div class="chrono rest num'+(st.pause?' pause':'')+'" id="rt">'+fmtT(st.sec)+'</div>'+
    (st.pause?pauseWhyHtml():'')+
    (n?nextExoHtml(st.next,st.nextKey):'')+
    '<button class="'+(st.pause?'quiet':'big')+' mt" style="width:100%" onclick="nextStep()">Passer au suivant</button>'+
    '<div class="mt"></div><button class="quiet" style="width:100%" onclick="addRest(15)">+15 s</button>'+
    volSegHtml()+
    backLine()+
    kbHint()+
  '</div>';
}
function startRest(st){
  clearInterval(timers.r);
  if(st.left==null) st.left=st.sec;
  timers.r=setInterval(()=>{
    tick(); st.left--;
    const el=$('#rt'); if(!el){clearInterval(timers.r);return;}
    el.textContent=fmtT(st.left);
    const tl=$('#tl'); if(tl) tl.textContent=sessionTime();
    if(st.left<=0){clearInterval(timers.r);beep(950,.2);nextStep();}
  },1000);
}
function addRest(s){const st=cur.steps[cur.i];st.left=(st.left||st.sec)+s;const el=$('#rt');if(el)el.textContent=fmtT(st.left);}

/* --- module cardio --- */
function cardioHtml(st){
  const e=DB[st.id];
  return '<div class="card center">'+
    '<span class="tag flame">Module cardio</span>'+
    '<h3 style="margin-top:10px">'+esc(e.nom)+'</h3>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    '<div class="mt">'+figFor(st.id,e.fig,e.nom)+'</div>'+
    '<div class="center"><span class="tag" id="phlabel"></span></div>'+
    '<div class="chrono num" id="cc">--</div>'+
    '<div class="center muted small num" id="rnd"></div>'+
    '<button class="big" id="ct" onclick="toggleCardio()">Démarrer</button>'+
    '<div class="mt"></div><button class="big ok" onclick="validateCardio()">Terminer</button>'+
    ((!st.swapped&&fbOf(st.id))?'<button class="danger big mt" onclick="swapCardio()">Douleur aujourd\'hui → variante de repli</button>':'')+
    (st.swapped?'<div class="tag flame mt">Variante de repli</div>':'')+
    revertLine(st)+
    backLine()+
    '<div class="vig">⚠ '+e.vig+'</div>'+kbHint()+
  '</div>';
}
function initCardio(st){
  const e=DB[st.id];
  st.rounds=0;st.ph=0;st.pt=e.phases[0].s;st.elapsed=0;
  const L=$('#phlabel'),C=$('#cc'),R=$('#rnd');
  if(L)L.textContent=e.phases[0].l; if(C)C.textContent=fmtT(st.pt); if(R)R.textContent='Round 1';
}
function toggleCardio(){
  const st=cur.steps[cur.i], e=DB[st.id];
  if(timers.c){clearInterval(timers.c);timers.c=null;$('#ct').textContent='Reprendre';return;}
  $('#ct').textContent='Pause';
  timers.c=setInterval(()=>{
    tick(); st.pt--; st.elapsed++;
    const C=$('#cc'); if(!C){clearInterval(timers.c);return;}
    if(st.pt<=0){
      beep(st.ph===e.phases.length-1?1200:700,.2);
      st.ph++;
      if(st.ph>=e.phases.length){st.ph=0;st.rounds++;}
      st.pt=e.phases[st.ph].s;
      $('#phlabel').textContent=e.phases[st.ph].l;
      $('#rnd').textContent='Round '+(st.rounds+1);
    }
    C.textContent=fmtT(st.pt);
    if(st.elapsed>=CARDIO_SEC){clearInterval(timers.c);timers.c=null;beep(1200,.25);validateCardio();}
  },1000);
}
function validateCardio(){
  const st=cur.steps[cur.i];
  clearInterval(timers.c);timers.c=null;
  const key=st.swapped?(st.from+'>'+st.id):st.id;
  (cur.log[key]=cur.log[key]||[]).push(st.rounds||0);
  cur.xp+=XP_SET;
  nextStep();
}
function nextStep(){
  clearTimers();
  cur.i++;
  if(cur.i>=cur.steps.length){ if(!cur.ending){cur.ending=true;endSession();} }
  else renderSession();
}

