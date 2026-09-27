/* ============ FIN DE SEANCE ============ */
/* une cle de journal est soit un identifiant d exercice, soit « origine>repli » */
function splitKey(k){ const i=k.indexOf('>'); return i<0?{id:k,from:null}:{id:k.slice(i+1),from:k.slice(0,i)}; }
async function endSession(inc){
  rhythmAbort(); clearTimers();
  const msgs=[];
  /* v1.15 : la liste des cles debloquees, pas leur nombre. La correction de la
     derniere seance peut retirer un deblocage, un compteur croissant ne sait
     pas le voir : un echange d un deblocage contre un autre laissait le compte
     inchange et le nouveau n etait jamais fete. Aligne sur le chemin badges,
     deja identitaire. */
  const unlockedBefore=Object.keys(state.unlocked).slice(), badgesBefore=state.badges.slice(), lvlBefore=lvlInfo(state.xp).lvl;
  /* series prevues par exercice : une lecture n est exploitable que si l exercice
     a ete mene a son terme, sans serie sautee et sans repli douleur */
  const prevu={};
  cur.steps.forEach(s=>{ if(s.k==='set'&&!s.cool) prevu[s.from||s.id]=(prevu[s.from||s.id]||0)+1; });
  /* photographie des charges et bandes reellement utilisees, avant que la progression ne les fasse evoluer */
  const pre={}, keys=Object.keys(cur.log);
  /* sets et lightSets s ajoutent en v1.16 : le recapitulatif compare les valeurs
     du jour a celles du passage precedent, et applyProgress ecrase p.sets juste
     apres. La marque d allege est indispensable, une comparaison a un passage
     dont les cibles etaient reduites de 30 % mentirait sans le dire. */
  keys.forEach(k=>{ const id=splitKey(k).id, p=state.perf[id]||{}; pre[k]={load:p.load||0,band:p.band||null,tenue:p.tenue,assise:p.assise,target:p.target,range:p.range?p.range.slice():null,hold:!!p.hold,sets:(p.sets||[]).slice(),lightSets:!!p.lightSets}; });
  /* Instantané de correction (v1.15). Le motif « photographier avant,
     restaurer depuis le récapitulatif » existait déjà pour défaire une montée
     seule (holdClimb) : ici il couvre la séance entière. On ne peut pas
     reconstituer après coup ce que cur porte encore, cur.steps et cur.log
     disparaissant avec le récapitulatif : full par clé et volume de séance
     sont donc mémorisés, pas recalculés. Portée : valeurs de séries
     uniquement, donc XP, badges, rotation, couverture et jours actifs sont
     invariants et n'entrent pas dans l'instantané. */
  const undo={keys:keys.slice(),full:{},prevu:JSON.parse(JSON.stringify(prevu)),
              light:!!cur.light,rounds:cur.rounds,perf:{},badges:state.badges.slice(),
              div:JSON.parse(JSON.stringify(state.div||{push:0,pull:0})),
              loadUps:state.loadUps||0,
              unlocked:JSON.parse(JSON.stringify(state.unlocked||{}))};
  keys.forEach(k=>{ const id=splitKey(k).id; undo.perf[id]=JSON.parse(JSON.stringify(state.perf[id]||{})); });
  const climbs=[];
  keys.forEach(k=>{
    const {id,from}=splitKey(k);
    const full=!inc&&!from&&cur.log[k].length>=(prevu[id]||0);
    undo.full[k]=full;
    /* la qualification se releve AVANT l ecriture, et se range dans
       l instantane d annulation : rejouer doit rejouer le meme regime */
    const nq=nonQualifie(id);
    undo.unqual=undo.unqual||{}; undo.unqual[k]=nq;
    const m=applyProgress(id,cur.log[k],full,!!cur.light,nq);
    m.forEach(x=>msgs.push(x));
    const p=state.perf[id];
    const monte=estMontee(p,pre[k],DB[id]);
    if(monte) climbs.push({id:id,msg:m[0],prev:pre[k]});
  });
  const items=keys.map(k=>{
    const {id,from}=splitKey(k);
    const it={id:id,sets:cur.log[k],load:pre[k].load};
    if(DB[id]&&DB[id].bnd&&pre[k].band) it.band=pre[k].band;
    /* v2.4 : la fourchette n est pas rejouable a posteriori, elle s ecrit ici.
       Les autres modes ont deja load ou band, rien a doubler. */
    if(DB[id]&&!DB[id].bnd&&(DB[id].mode==='bw'||DB[id].mode==='time')&&pre[k].range) it.rng=pre[k].range.slice();
    /* v2.17 : la tenue sous laquelle les series ont ete jouees, ecrite avant
       progression comme it.load, depuis l instantane d avant seance. */
    if(DB[id]&&DB[id].rhythm) it.tenue=tenueOf(id,pre[k]);
    /* v2.18 : l assise sous laquelle les series ont ete jouees, meme regle. */
    if(DB[id]&&DB[id].assise) it.assise=assiseOf(id,pre[k]);
    /* v2.12, journal enrichi. Deux champs de plus, pour la meme raison que
       it.rng : ce qui n est pas rejouable s ecrit au moment ou il est vrai.
       it.tgt, la cible visee ce jour-la. Elle n etait nulle part : l historique
       portait les series faites sans le nombre qu elles visaient, si bien qu on
       ne pouvait pas dire d une cible qu elle n a pas bouge depuis n passages.
       Un rejeu a posteriori divergerait, la montee dependant de full, de la
       grace et du palier tenu, dont aucun n est historise.
       it.secs, la duree de chaque serie en secondes, de l arrivee sur l ecran a
       la validation. Brute : ni plancher, ni ecretage, ni nettoyage. Une serie
       de huit secondes est une information, pas un artefact, et nettoyer a
       l ecriture enfouirait un jugement dans la donnee.
       Aucun signal ne les lit aujourd hui : ils s accumulent, ce qu on en fera
       se decidera sur des donnees et non sur une intention. */
    if(pre[k].target!=null) it.tgt=pre[k].target;
    if(cur.secs&&cur.secs[k]) it.secs=cur.secs[k].slice();
    if(from){ it.sw=true; it.from=from; }
    return it;
  });
  /* seance complete = toutes les series prevues validees. Le module cardio ne
     comble plus une serie sautee : il n est pas une serie. */
  const complete=!inc&&(cur.done||0)>=workSteps(cur.steps).length;
  let xp=cur.xp+(complete?XP_SESSION:0);
  const wkNow=prevWeekKey(0), goalNow=goalForWeek(state,wkNow);
  const wasValid=thisWeekCount(state)>=goalNow;
  /* rounds porte le nombre de tours REALISE, roundsPlan celui annonce au
     lancement. Les deux divergent depuis que le volume se change en cours de
     seance (v2.1), et c est cet ecart qui est informatif : l un dit ce qui a
     ete fait, l autre ce qui avait ete vise. cur.rounds0 existait deja, il
     bornait le selecteur de volume ; il n y avait qu a l ecrire. */
  const entry={date:new Date().toISOString(),type:'alterne',mode:'alterne',rounds:cur.rounds,roundsPlan:cur.rounds0!=null?cur.rounds0:cur.rounds,plan:cur.plan,items:items,xp:xp,
               planSec:cur.planSec!=null?Math.round(cur.planSec):null,
               model:cur.model!=null?Math.round(cur.model):null,
               real:cur.t0?Math.max(60,Math.round((Date.now()-cur.t0)/1000)):null};
  if(inc) entry.inc=true;
  /* marque de seance allegee : elle sert au recapitulatif, a l historique, et
     surtout a exclure ces replis volontaires du capteur de douleur */
  if(cur.light) entry.light=true;
  state.hist.push(entry);
  undo.date=entry.date; state.undo=undo;   /* purgé au démarrage de la séance suivante */
  const weekJust=!wasValid&&thisWeekCount(state)>=goalForWeek(state,wkNow);
  if(weekJust) xp+=XP_WEEK;
  state.xp+=xp;
  state.sessionCount++;
  if(!inc){
    /* Rotation (v1.13). La regle v1.9 gelait toute la rotation des qu une
       seance etait allegee. Elle est trop large : la couverture musculaire
       compte deja pleinement les series d une seance allegee, les compter
       pour rien dans la rotation contredit la mesure de l outil. La ligne
       juste se lit exercice par exercice : la rotation avance la ou l exercice
       prevu a effectivement travaille, elle gele la ou il a ete remplace par
       un repli, car celui-la n a rien enregistre. Le gel suit la substitution,
       pas le mode. Sur le vivier pousse, dont les trois exercices ont un repli,
       cela reviendrait a un gel permanent en periode douloureuse : des la
       deuxieme seance allegee d affilee, tout avance. Le compteur repart a zero
       des qu une seance normale est terminee ; une seance quittee ne compte
       pas, ce bloc etant deja sous !inc. Les etirements, eux, ont ete faits
       tels quels : leur rotation n a jamais gele. */
    const run=state.lightRun||0, libre=!cur.light||run>=1;
    SLOT_ORDER.forEach(s=>{
      const gele=!libre&&cur.subs&&cur.subs[s];
      if(!gele) state.slotIdx[s]=(state.slotIdx[s]||0)+1;
    });
    state.lightRun=cur.light?run+1:0;
    state.stretchIdx=((state.stretchIdx||0)+STRETCH_PER_SESSION)%STRETCH_POOL.length;
  }
  /* Exercice entierement passe (v1.15). Sans cette ligne, « je n ai pas reussi
     une seule repetition » ne laisse aucune trace : le zero n est plus
     saisissable et un exercice sans serie validee n a pas de cle dans le
     journal, donc applyProgress n est jamais appele pour lui. Signal sans
     action, comme sur les lectures partielles. Le curseur final distingue le
     passe du jamais atteint : un exercice passe a toutes ses etapes derriere
     lui, un exercice d une seance quittee en a au moins une devant. Un
     exercice remplace par son repli est realise, pas non realise. */
  const vus={}; keys.forEach(k=>{ const sk=splitKey(k); vus[sk.id]=1; if(sk.from) vus[sk.from]=1; });
  const derniere={};
  cur.steps.forEach((s,i)=>{ if(s.k==='set'&&!s.cool){ const oid=s.from||s.id; derniere[oid]=Math.max(derniere[oid]==null?-1:derniere[oid],i); } });
  Object.keys(derniere).forEach(oid=>{
    if(vus[oid]||derniere[oid]>=cur.i||!DB[oid]) return;
    msgs.push('Exercice non réalisé : '+DB[oid].nom);
  });
  checkUnlocks(cur.rounds,!!cur.light,prevu).forEach(m=>msgs.push(m));
  checkBadges().forEach(m=>msgs.push(m));
  await save();
  syncFinSeance();   /* v2.24 : envoi immediat, sans regroupement */
  const pop=celebrations(unlockedBefore,badgesBefore,lvlBefore);
  /* items du recapitulatif : meme tableau que l historique, augmente du passage
     precedent. La copie evite de grossir la sauvegarde d une donnee que
     l historique porte deja dans l entree d avant. */
  const vue=items.map((it,i)=>Object.assign({},it,{prev:pre[keys[i]].sets,prevLight:pre[keys[i]].lightSets}));
  cur={recap:true,xp:xp,msgs:msgs,items:vue,type:cur.type,weekJust:weekJust,inc:!!inc,light:!!entry.light,pop:pop,popI:0,climbs:climbs,
       done:cur.done||0,total:workSteps(cur.steps).length,
       planSec:entry.planSec,model:entry.model,real:entry.real};
  lightMode=false;   /* le mode ne survit jamais a une seance */
  clearDay();        /* ni les ajustements de contenu du jour (v1.13) */
  go('recap');
}
/* « Tenir ce palier » au recapitulatif : annule la montee qui vient d etre
   decidee, remet l exercice au niveau ou il etait pendant la seance, et fige.
   Rien n a encore ete travaille au nouveau niveau, il n y a donc rien a perdre. */
function holdClimb(i){
  const c=cur&&cur.climbs&&cur.climbs[i];
  if(!c||c.done) return;
  const p=perfOf(c.id);
  p.load=c.prev.load;
  if(c.prev.band) p.band=c.prev.band;
  if(DB[c.id].rhythm){ if(c.prev.tenue!=null) p.tenue=c.prev.tenue; else delete p.tenue; }
  if(DB[c.id].assise){ if(c.prev.assise!=null) p.assise=c.prev.assise; else delete p.assise; }
  if(c.prev.range) p.range=c.prev.range.slice();
  if(c.prev.target!=null) p.target=c.prev.target;
  /* La montee annulee avait remis la memoire de la fenetre a zero (v2.14). Le
     passage a ete joue au palier que l on restaure, sa lecture y vaut donc :
     elle se relit sur p.sets, que applyProgress vient d ecrire, et non sur
     l instantane, qui porte la lecture d avant. */
  if(p.sets&&p.sets.length) p.prevMin=Math.min.apply(null,p.sets); else delete p.prevMin;
  if(state.loadUps>0&&(DB[c.id].mode==='load'||DB[c.id].mode==='fixed'||DB[c.id].bnd||DB[c.id].rhythm||DB[c.id].assise)) state.loadUps--;
  setHold(c.id,true);
  c.done=true;
  save();
  flash('Palier tenu sur '+DB[c.id].nom);
  renderRecap();
}
/* file d evenements celebres : deblocages, badges, puis passage de rang.
   Fusion : aux niveaux 5 et 10 un badge designe deja le rang, on ne montre
   que le badge pour ne pas feter deux fois le meme evenement. */
function celebrations(unlockedBefore,badgesBefore,lvlBefore){
  const q=[];
  Object.keys(state.unlocked).filter(id=>unlockedBefore.indexOf(id)<0).forEach(id=>{
    if(DB[id]) q.push({ico:'🔓',kind:'Exercice débloqué',nom:DB[id].nom,d:DB[id].mus});
  });
  const nouveaux=state.badges.filter(b=>badgesBefore.indexOf(b)<0)
    .map(id=>BADGES.filter(b=>b.id===id)[0]).filter(Boolean);
  nouveaux.forEach(b=>q.push({ico:b.ico,kind:'Badge obtenu',nom:b.nom,d:b.d}));
  const lvl=lvlInfo(state.xp).lvl, r0=rankLevel(lvlBefore), r1=rankLevel(lvl);
  if(r1>r0&&!nouveaux.some(b=>b.rank===r1)) q.push({ico:'🏅',kind:'Nouveau rang',nom:rankOf(lvl),d:'Niveau '+lvl+' atteint'});
  return q;
}
/* revenir sur un palier tenu par megarde : on relibere, sans restaurer la
   montee annulee. La progression reprendra normalement a la prochaine seance. */
function releaseClimb(i){
  const c=cur&&cur.climbs&&cur.climbs[i];
  if(!c||!c.done) return;
  setHold(c.id,false);
  c.done=false;
  save();
  flash('Progression reprise sur '+DB[c.id].nom);
  renderRecap();
}
function popHtml(){
  if(!cur||!cur.pop||cur.popI>=cur.pop.length) return '';
  const e=cur.pop[cur.popI], n=cur.pop.length;
  return '<div class="pop" onclick="popNext()"><div class="card">'+
    '<span class="ico">'+e.ico+'</span>'+
    '<div class="kind mt">'+esc(e.kind)+'</div>'+
    '<div class="nom">'+esc(e.nom)+'</div>'+
    '<div class="muted small" style="margin-top:6px">'+esc(e.d)+'</div>'+
    (n>1?'<div class="q">'+(cur.popI+1)+' / '+n+'</div>':'')+
    (n>3?'<button class="quiet mt" style="padding:6px 14px;font-size:.8rem" onclick="event.stopPropagation();popSkip()">Tout passer</button>':'')+
  '</div></div>';
}
function popNext(){
  if(!cur||!cur.pop) return;
  clearTimeout(timers.pop);
  cur.popI++;
  renderRecap();
}
function popSkip(){ if(!cur||!cur.pop) return; clearTimeout(timers.pop); cur.popI=cur.pop.length; renderRecap(); }
/* Une descente changeait la charge, la bande ou la fourchette comme une montee :
   le recapitulatif proposait donc « Tenir ce palier » sur un repli du filet, et
   l accepter restaurait la charge d avant descente, annulant le filet, tout en
   decrementant loadUps sans qu aucune montee ait eu lieu. Le sens compte, pas le
   changement. Le cliquet leve de la v1.15 a elargi le probleme a la fourchette. */
function estMontee(p,pre,e){
  if(!pre) return false;
  if((p.load||0)>(pre.load||0)) return true;
  if(p.band!==pre.band&&e&&e.bnd){
    const L=bandLadder(e,state.gear), a=L.indexOf(pre.band), b=L.indexOf(p.band);
    if(a>=0&&b>a) return true;
  }
  /* Echelle de tenues (v2.17) : le sens se lit sur la tenue, jamais sur la
     fourchette, qui descend a une montee et remonte a une descente. */
  /* v2.18 : meme lecture sur l echelle d assise, ou monter fait baisser la
     valeur. L indice seul porte le sens. */
  const rs=rungSpec(e);
  if(rs) return rungOf(e,p[rs.k]).i>rungOf(e,pre[rs.k]).i;
  if(pre.range&&p.range&&p.range[1]>pre.range[1]) return true;
  return false;
}
/* ============ CORRECTION DE LA DERNIERE SEANCE ============ */
/* On corrige apres, parce qu on ne peut pas corriger pendant. Portee : valeurs
   de series uniquement, ni ajout ni suppression, donc le nombre de series est
   invariant et les XP, badges de seance, rotation et couverture ne bougent
   pas. La correction restaure l instantane pris avant la progression puis
   rejoue : rien n est defait champ par champ, ce qui evite d oublier une
   dependance. L instantane n est pas repris apres coup, la correction reste
   donc corrigeable autant de fois que voulu, toujours depuis le meme point. */
function corrigible(){
  const u=state.undo, h=state.hist[state.hist.length-1];
  return !!(u&&h&&u.date===h.date);
}
function corrigerSeance(vals){
  if(!corrigible()) return null;
  const u=state.undo, h=state.hist[state.hist.length-1];
  /* v2.12. Deux releves pris AVANT la restauration, donc sur l etat tel qu il
     est au moment ou l on corrige, seance et gestes manuels compris.
     avantCor sert a dire ce que la correction defait : un niveau qui recule
     n est annonce nulle part aujourd hui, seuls les messages recalcules
     s affichent, et une annulation muette est pire qu une annulation.
     holdApres sert a ne pas detruire ce qui n est pas une consequence de la
     seance : un palier tenu pose ou libere apres coup, depuis le recapitulatif,
     la fiche ou le mode entretien, est une decision de l utilisateur. La
     restauration l effacait sans un mot. Il se repose APRES le rejeu, jamais
     avant : la seance s est bien jouee sous l etat d avant. */
  const avantCor={}, holdApres={};
  Object.keys(u.perf).forEach(id=>{
    const p=state.perf[id]; if(!p) return;
    avantCor[id]={load:p.load||0,band:p.band||null,tenue:p.tenue,assise:p.assise,range:p.range?p.range.slice():null,target:p.target};
    const av=!!(u.perf[id]&&u.perf[id].hold), ap=!!p.hold;
    if(av!==ap) holdApres[id]={v:ap,at:p.holdAt||null};
  });
  const avantUnlCor=Object.keys(state.unlocked||{});
  /* 1. restauration de l etat d avant seance */
  Object.keys(u.perf).forEach(id=>{ state.perf[id]=JSON.parse(JSON.stringify(u.perf[id])); });
  state.div=JSON.parse(JSON.stringify(u.div));
  state.loadUps=u.loadUps;
  /* loadUps et unlocked sont restaures, or ce sont exactement ce que testent les
     badges load, load5 et unlock1 : sans eux, Progres affichait « 0 montees de
     charge » a cote du badge qui les celebre. */
  if(u.badges) state.badges=u.badges.slice();
  const avantUnl=Object.keys(state.unlocked).slice();
  const avantBadges=state.badges.slice(), avantLvl=lvlInfo(state.xp).lvl;
  state.unlocked=JSON.parse(JSON.stringify(u.unlocked));
  /* 2. ecriture des valeurs corrigees dans l historique */
  u.keys.forEach((k,i)=>{
    const v=vals&&vals[k];
    if(!v||!h.items[i]) return;
    if(v.length!==h.items[i].sets.length) return;      /* ni ajout ni suppression */
    if(v.some(x=>!(x>=1)||x!==Math.round(x))) return;  /* entiers superieurs a zero */
    h.items[i].sets=v.slice();
  });
  /* 3. rejeu, avec le volume et le mode de la seance corrigee */
  const msgs=[], climbs=[];
  u.keys.forEach((k,i)=>{
    const id=splitKey(k).id, it=h.items[i];
    if(!it) return;
    const p0=state.perf[id]||{};
    const pre={load:p0.load||0,band:p0.band||null,tenue:p0.tenue,assise:p0.assise,target:p0.target,range:p0.range?p0.range.slice():null,hold:!!p0.hold};
    const m=applyProgress(id,it.sets,u.full[k],u.light,u.unqual&&u.unqual[k]);
    m.forEach(x=>msgs.push(x));
    const p=state.perf[id];
    const monte=estMontee(p,pre,DB[id]);
    if(monte) climbs.push({id:id,msg:m[0],prev:pre});
  });
  /* les gestes manuels posterieurs a la seance reviennent ici, entre le rejeu
     et les verrous : un palier tenu repose fige de nouveau la cible, et
     checkUnlocks doit voir l etat definitif et non un etat intermediaire */
  Object.keys(holdApres).forEach(id=>{
    const p=state.perf[id]; if(!p) return;
    if(holdApres[id].v){ p.hold=true; p.holdAt=holdApres[id].at||new Date().toISOString(); }
    else { delete p.hold; delete p.holdAt; }
  });
  checkUnlocks(u.rounds,u.light,u.prevu).forEach(m=>msgs.push(m));
  checkBadges().forEach(m=>msgs.push(m));
  /* Ce que la correction defait, dit a part. Un message d annulation melange a
     des messages de progression se lit comme une progression : le recapitulatif
     et l onglet Progres le portent donc dans un bloc a eux. estMontee compare
     l etat d avant correction a celui d apres, dans ce sens : vrai signifie que
     le niveau etait plus haut avant, donc que la correction l a ramene. */
  const undone=[];
  Object.keys(avantCor).forEach(id=>{
    const p=state.perf[id], e=DB[id];
    if(!p||!e) return;
    if(estMontee(avantCor[id],p,e)) undone.push('Montée annulée sur '+e.nom);
  });
  avantUnlCor.forEach(id=>{ if(!state.unlocked[id]&&DB[id]) undone.push('Déblocage annulé : '+DB[id].nom); });
  const pop=celebrations(avantUnl,avantBadges,avantLvl);
  cur={recap:true,xp:h.xp,msgs:msgs,items:h.items,type:h.type,weekJust:false,inc:!!h.inc,light:!!h.light,
       pop:pop,popI:0,climbs:climbs,corrige:true,undone:undone};
  save(); return cur;
}
/* Ecran de correction : les series de la derniere seance en steppers, le meme
   geste qu en seance. Zero refuse, comme a la saisie. */
let fixVals=null, fixFrom='recap', fixNote=null;
function openFix(from){
  if(!corrigible()) return;
  const h=state.hist[state.hist.length-1];
  fixFrom=from||'recap';
  fixVals={}; state.undo.keys.forEach((k,i)=>{ if(h.items[i]) fixVals[k]=h.items[i].sets.slice(); });
  go('fix');
}
function fixBump(ki,si,d){
  const k=state.undo.keys[ki];
  fixVals[k][si]=Math.max(0,(fixVals[k][si]||0)+d);
  renderFix();
}
function fixClose(){ fixVals=null; if(fixFrom==='prog'){ cur=null; go('prog'); } else go('recap'); }
function fixApply(){
  if(Object.keys(fixVals).some(k=>fixVals[k].some(v=>!(v>=1)))) return;
  const r=corrigerSeance(fixVals);
  fixVals=null;
  if(fixFrom==='prog'){
    /* on revient d ou l on vient : la correction depuis l historique ne doit
       pas rejeter sur un recapitulatif dont on n avait pas le fil. Les
       messages de progression recalcules seraient perdus, ils sont donc
       repris une fois en tete de l onglet. */
    fixNote={msgs:(r&&r.msgs)?r.msgs.slice():[],undone:(r&&r.undone)?r.undone.slice():[]};
    cur=null; go('prog');
  } else go('recap');
}
function renderFix(){
  screenEnter('fix');
  const h=state.hist[state.hist.length-1], u=state.undo;
  const invalide=Object.keys(fixVals||{}).some(k=>fixVals[k].some(v=>!(v>=1)));
  $('#app').innerHTML='<div class="card">'+
    '<h2>Corriger la séance</h2>'+
    '<div class="muted small">'+fmtDT(h.date)+'</div>'+
    '<div class="muted small mt">Seules les valeurs se corrigent : on ne peut ni ajouter ni retirer une série. La progression, les paliers et les déblocages sont recalculés à partir de l\'état d\'avant séance.</div>'+
    u.keys.map((k,ki)=>{
      const it=h.items[ki]; if(!it) return '';
      const e=DB[it.id], vals=fixVals[k]||[], un=unitOf(e);
      return '<div class="mt"><div class="spread"><b>'+esc(e.nom)+'</b>'+
        (it.band?'<span class="muted small">'+bandDot(it.band)+esc(bandLabel(it.band))+'</span>'
                :(it.load?'<span class="muted small num">'+esc(loadLabelFor(it.id,it.load))+'</span>':tenueTag(it)))+'</div>'+
        vals.map((v,si)=>{
          const orig=it.sets[si], chg=(v!==orig);
          return '<div class="histline"><span>Série '+(si+1)+
            (chg?' <span class="muted small">était '+orig+'</span>':'')+'</span>'+
            '<span class="row"><button class="quiet" style="padding:4px 12px" onclick="fixBump('+ki+','+si+',-1)" aria-label="Retirer un">−</button>'+
            '<b class="num"'+(v<1?' style="color:var(--warn)"':(chg?' style="color:var(--accent)"':''))+'>'+v+'</b>'+
            '<span class="muted small">'+esc(un)+'</span>'+
            '<button class="quiet" style="padding:4px 12px" onclick="fixBump('+ki+','+si+',1)" aria-label="Ajouter un">+</button></span></div>';
        }).join('')+'</div>';
    }).join('')+
    (invalide?'<div class="muted small mt">Une série à zéro n\'est pas une série : remonte-la avant de valider.</div>':'')+
    '<button class="big ok mt'+(invalide?' quiet':'')+'"'+(invalide?' disabled':'')+' onclick="fixApply()">Valider la correction</button>'+
    '<button class="discret mt" style="width:100%" onclick="fixClose()">Annuler</button>'+
  '</div>';
  renderNav();
}
function popActive(){ return view==='recap'&&cur&&cur.pop&&cur.popI<cur.pop.length; }
/* Duree et volume au recapitulatif. L ecart au modele n est pas ici : sur une
   seance isolee il contient surtout les interruptions, dont le carnet dit
   depuis la v1.13 qu elles relevent de l utilisateur et non du modele. Un
   nombre bruite avec l allure d une mesure invite a le sur-lire. Il est donc
   dans le detail de la seance et en moyenne dans Progres > Temps. */
function recapTimeHtml(){
  const r=cur.real, a=cur.plan!=null?cur.plan:(cur.planSec!=null?Math.round(cur.planSec/60):null);
  const t=[];
  if(r) t.push('<span class="num">'+Math.round(r/60)+'</span> min'+(a?' pour <span class="num">'+a+'</span> annoncées':''));
  else if(a) t.push('<span class="num">'+a+'</span> min annoncées');
  if(cur.total) t.push('<span class="num">'+cur.done+'</span> série'+(cur.done>1?'s':'')+' sur <span class="num">'+cur.total+'</span>');
  return t.length?'<div class="muted small" style="margin-top:4px">'+t.join(' · ')+'</div>':'';
}
/* Bloc de ce qu une correction defait. Meme texte au recapitulatif et dans
   l onglet Progres, un seul chemin pour ne pas les laisser diverger. */
function undoneHtml(L,align){
  if(!L||!L.length) return '';
  return '<div class="mt" style="text-align:'+(align||'center')+'">'+
    L.map(m=>'<div class="tag flame" style="display:block;margin:6px '+(align==='left'?'0':'auto')+';max-width:fit-content">'+esc(m)+'</div>').join('')+
    '<div class="muted small" style="margin-top:6px">Les valeurs corrigées ne justifient plus ces montées : l\'état repart de celui d\'avant séance. Un palier tenu posé après la séance, lui, est conservé.</div></div>';
}
function renderRecap(){
  screenEnter('recap');
  const li=lvlInfo(state.xp);
  $('#app').innerHTML='<div class="card center">'+
    (cur.inc?'<span class="tag flame">Séance incomplète, enregistrée quand même</span>':'<span class="tag ok">Séance terminée</span>')+
    (cur.light?'<div class="tag flame mt">Séance allégée : elle compte pour la semaine, aucune cible ne bouge</div>':'')+
    '<div class="recap-xp mt">+'+cur.xp+' XP</div>'+
    (cur.weekJust?'<div class="tag flame mt">🎉 Semaine validée : +'+XP_WEEK+' XP inclus</div>':'')+
    '<div class="bar mt"><i style="width:'+li.pct+'%"></i></div>'+
    '<div class="muted small" style="margin-top:6px">Niveau '+li.lvl+' · '+rankOf(li.lvl)+'</div>'+
    /* Une duree affichee dit laquelle (v1.11), et le recapitulatif est le seul
       endroit ou la promesse se confronte a chaud. Le volume joue l accompagne :
       le tag « incomplete » disait qu il manquait quelque chose sans dire
       combien, alors que c est ce qui explique une seance courte. */
    recapTimeHtml()+
    (cur.msgs.length?'<div class="mt">'+cur.msgs.map(m=>'<div class="tag ok" style="display:block;margin:6px auto;max-width:fit-content">'+esc(m)+'</div>').join('')+'</div>':'')+
    undoneHtml(cur.undone)+
    ((cur.climbs&&cur.climbs.length)?'<div class="mt" style="text-align:left">'+cur.climbs.map((c,i)=>
      '<div class="spread" style="margin-top:8px"><span class="muted small">'+esc(DB[c.id].nom)+(c.done?' · palier tenu':'')+'</span>'+
      (c.done?'<button class="quiet" style="padding:4px 12px;font-size:.75rem" onclick="releaseClimb('+i+')">Annuler</button>'
             :'<button class="quiet" style="padding:4px 12px;font-size:.75rem" onclick="holdClimb('+i+')">Tenir ce palier</button>')+'</div>').join('')+
      '<div class="muted small" style="margin-top:6px">Tenir un palier annule la montée et fige le niveau. Tu peux le libérer à tout moment depuis la fiche de l\'exercice.</div></div>':'')+
    '<div class="mt" style="text-align:left">'+cur.items.map(it=>{
      const e=DB[it.id];
      /* le passage precedent sous les valeurs du jour : c est la comparaison
         que le recapitulatif ne donnait pas, alors qu il est le seul ecran ou
         les deux nombres existent au meme instant. Une comparaison a un
         passage allege est annoncee comme telle, ses cibles ayant ete reduites. */
      const cmp=(e.mode!=='stretch'&&it.prev&&it.prev.length)
        ? '<div class="muted small" style="text-align:right;margin-top:-6px;padding-bottom:8px;border-bottom:1px solid var(--line)">avant : '+setsHtml(it.prev)+(it.prevLight?' <span class="tag flame" style="font-size:.68rem">allégée</span>':'')+'</div>'
        : '';
      return '<div class="histline"'+(cmp?' style="border-bottom:none;padding-bottom:2px"':'')+'><span>'+esc(e.nom)+
        (it.sw?' <span class="tag flame" style="font-size:.68rem">repli'+(it.from&&DB[it.from]?' de '+esc(DB[it.from].nom):'')+'</span>':'')+
        (it.band?' <span class="muted small">'+bandDot(it.band)+esc(bandLabel(it.band))+'</span>':(it.load?' <span class="muted small num">'+esc(loadLabelFor(it.id,it.load))+'</span>':tenueTag(it)))+'</span><span class="num">'+
        (e.mode==='stretch'?'✓':setsHtml(it.sets)+' '+unitOf(e))+'</span></div>'+cmp;
    }).join('')+'</div>'+
    '<button class="big mt" onclick="cur=null;go(\'home\')">Retour à l\'accueil</button>'+
    /* la correction est une sortie de route, pas le scenario nominal : elle
       reste discrete sous le bouton principal */
    (corrigible()?'<button class="discret mt" style="width:100%" onclick="openFix(\'recap\')">Une valeur est fausse ? Corriger</button>':'')+
  '</div>'+popHtml();
  renderNav();
  if(popActive()){
    beep(1180,.14);
    clearTimeout(timers.pop);
    timers.pop=setTimeout(popNext,2200);
  }
}

/* ============ BIBLIOTHEQUE ============ */
/* comparaison insensible aux accents et a la casse : trois lettres suffisent
   presque toujours sur 36 exercices */
function noAcc(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
let libQ='';
function libFilter(v){ libQ=v||''; renderLib(true); }
function libClear(){
  libQ=''; renderLib();
  const i=$('#libq'); if(i) i.focus();
}
/* v2.15 : trois paliers de lecture par groupe et plus aucun nom tronque.
   Mesure sur l etat reel en 390 px : dix noms coupes par des points de
   suspension, dont « Tractions assisté… » deux fois de suite, supination et
   pronation indiscernables, parce que la colonne de droite portait les series
   ET le niveau (« KB 10 kg + lestes 2 kg », vingt-deux caracteres). Sur un
   ecran qui sert a trouver un exercice (v1.5), le nom est la seule information
   qui ne doit jamais etre coupee : il passe a la ligne, et le niveau descend
   en ligne 2 apres les muscles. Les substituts materiels n etaient pas marques
   dans la liste, contrairement a ce que le carnet affirmait depuis la v2.0 ;
   ils le sont, comme les replis, et ni les uns ni les autres ne portent
   « a faire », qui invitait a faire quelque chose qui ne vient jamais seul. */
function libRowHtml(id){
  const e=DB[id],locked=isLocked(id),p=state.perf[id];
  const repli=estRepli(id), subst=estSubstitut(id), hors=!locked&&(repli||subst);
  const joue=p&&p.sets&&p.sets.length;
  const stat=locked?'':(joue?setsHtml(p.sets):(hors||e.mode==='stretch'?'':'à faire'));
  const lvl=(!locked&&e.bnd&&p&&p.band)?bandLabel(p.band):(!locked&&p&&p.load?loadLabelFor(id,p.load):'');
  const origine=repli?replieDe(id):(subst?substitutDe(id):[]);
  const sub=locked?'↳ '+esc(lockCond(e))
    :(hors?'↳ '+(repli?'repli':'substitut')+' de '+esc(origine.map(x=>DB[x].nom).join(', ')):esc(e.mus)+(lvl?' <span class="lvl">· '+lvl+'</span>':''));
  /* le palier tenu est un statut : il va a droite, sinon il tronque le nom */
  const tag=(p&&p.hold)?'<span class="tag" style="font-size:.68rem">palier tenu</span><br>'
    :(hors?'<span class="tag" style="font-size:.68rem">'+(repli?'repli':'substitut')+'</span>'+(stat?'<br>':''):'');
  return '<div class="exorow'+(locked?' lockedrow':'')+'" onclick="showFiche(\''+id+'\',\'lib\')">'+
    (locked?'<span class="thumbph lockph">🔒</span>'
           :(typeof IMG!=='undefined'&&IMG[id]?'<img src="'+IMG[id]+'" alt="" loading="lazy">':'<span class="thumbph"></span>'))+
    '<span class="ex"><b>'+esc(e.nom)+'</b>'+
    '<span class="muted small">'+sub+'</span></span>'+
    '<span class="num small st">'+tag+stat+'</span></div>';
}
let libQPrev='';
function renderLib(keepFocus){
  screenEnter('lib');
  /* v2.7 : les quatre emplacements sont listes dans l ordre du circuit et leurs
     libelles viennent de SLOTS. Ils etaient recopies ici et une troisieme fois
     dans statsHtml : trois tables a tenir accordees, dont deux figeaient un
     ordre que SLOT_ORDER ne commande plus. Cardio et mobilite ne sont pas des
     emplacements, ils restent en queue. */
  const groups=SLOT_ORDER.map(s=>[s,SLOTS[s].label]).concat([['cardio','Cardio'],['mob','Mobilité']]);
  const q=noAcc(libQ.trim());
  const match=id=>{
    if(!q) return true;
    const e=DB[id];
    return noAcc(e.nom).includes(q)||noAcc(e.en).includes(q)||noAcc(e.mus).includes(q);
  };
  let html='<h2 style="margin-bottom:10px">Exercices</h2>'+
    '<div class="search"><span class="muted">🔎</span>'+
    '<input id="libq" type="text" inputmode="search" placeholder="Rechercher : nom, muscle…" value="'+esc(libQ)+'" oninput="libFilter(this.value)">'+
    (libQ?'<button class="clr" onclick="libClear()" aria-label="Effacer">✕</button>':'')+'</div>';
  let n=0;
  groups.forEach(([cat,label])=>{
    const ids=Object.keys(DB).filter(id=>DB[id].cat===cat&&match(id));
    if(!ids.length) return;
    n+=ids.length;
    /* Trois paliers de lecture (v2.15) : ce qui sort au tirage, ce qui attend
       une douleur ou un materiel manquant, ce qui attend un deblocage. L ordre
       du catalogue est conserve a l interieur de chacun, donc l escalier se lit
       dans le bloc des verrouilles, ferme par defaut et dont la ligne fermee
       porte le compte, sur le motif des cards de reglages. Une recherche
       l ouvre ; quand la recherche s efface, il se referme, sinon une recherche
       laisserait tous les blocs ouverts derriere elle. */
    const rot=ids.filter(id=>!isLocked(id)&&!estRepli(id)&&!estSubstitut(id));
    const hors=ids.filter(id=>!isLocked(id)&&(estRepli(id)||estSubstitut(id)));
    const lock=ids.filter(id=>isLocked(id));
    const k='lib-lock-'+cat;
    const ouvert=q?' open':(libQPrev?'':cardOpen(k,false));
    html+='<div class="card"><h3>'+label+'</h3>'+rot.map(libRowHtml).join('')+
      (hors.length?'<div class="libsub">Hors tirage · douleur ou matériel</div>'+hors.map(libRowHtml).join(''):'')+
      (lock.length?'<details class="libtier" data-k="'+k+'"'+ouvert+'><summary><b>'+lock.length+'</b> '+(lock.length>1?'paliers':'palier')+' à débloquer</summary>'+lock.map(libRowHtml).join('')+'</details>':'')+
      '</div>';
  });
  libQPrev=q;
  if(!n) html+='<div class="card muted small">Aucun exercice ne correspond à « '+esc(libQ)+' ».</div>';
  else if(!q) html+='<div class="muted small center" style="margin-bottom:12px">Toute la banque. Touche un exercice pour sa fiche.</div>';
  $('#app').innerHTML=html; renderNav();
  if(keepFocus){
    const i=$('#libq');
    if(i&&i.focus){ i.focus(); if(i.setSelectionRange) try{ i.setSelectionRange(libQ.length,libQ.length); }catch(x){} }
  }
}
let ficheFrom='lib';
/* ============ PROGRESSION PAR EXERCICE (v2.4) ============ */
/* La fiche disait ou en etait l exercice aujourd hui, jamais d ou il venait ni
   ou il allait. Trois lectures manquaient : sa position sur son echelle, les
   paliers deja franchis et leur date, l etat de son verrou dans les deux sens.
   Tout se reconstruit depuis state.hist, qui porte deja par passage la charge
   et le barreau d avant seance : c est une lecture, retroactive sur les
   seances deja jouees, sans nouveau modele de donnees.
   Une seule exception, assumee : la fourchette des exercices au poids du corps
   et des tenues n etait ecrite nulle part, et n est pas rejouable a posteriori
   puisque la montee depend de full, de la grace et du palier tenu, qui ne sont
   pas historises. D ou it.rng, ecrit a partir de la v2.4 pour ces deux modes
   seulement, les autres ayant deja load ou band. Leur chemin des paliers
   demarre donc a la premiere seance suivant la mise a jour : rien n est
   reconstitue, une date inventee vaudrait moins que son absence. */

/* Passages d un exercice, du plus ancien au plus recent. Deux natures : le
   passage propre, et le passage ou l exercice a ete remplace par son repli, qui
   est enregistre sous l identifiant du repli. Sans cette seconde lecture la
   fiche laisse un trou aux dates concernees et se lit comme une absence
   d entrainement, alors que la seance a eu lieu. */
function exoPassages(id){
  const out=[];
  (state.hist||[]).forEach(h=>{
    (h.items||[]).forEach(it=>{
      if(it.id===id) out.push({h:h,it:it,repl:false});
      else if(it.from===id) out.push({h:h,it:it,repl:true});
    });
  });
  return out;
}
/* Valeur de palier d un passage, dans l unite propre au mode. Renvoie null
   quand le passage ne la porte pas : les passages anterieurs a it.rng, et les
   modes qui n ont pas d echelle. */
function palierVal(id,it){
  const e=DB[id]; if(!e||!it) return null;
  /* v2.19 : un passage joue sous un autre regime n est pas un palier de
     l echelle actuelle */
  if(it.u&&it.u!==unitOf(e)) return null;
  if(e.bnd) return it.band||null;
  if(e.mode==='load'||e.mode==='fixed') return (it.load||0);
  /* v2.17 : sur une echelle de tenues le palier est la tenue ; un passage
     anterieur au champ a ete joue au premier barreau par construction. */
  if(e.rhythm) return it.tenue!=null?it.tenue:(it.rng?e.rhythm.ladder[0][0]:null);
  if(e.assise) return it.assise!=null?it.assise:(it.rng?e.assise.ladder[0][0]:null);
  if(e.mode==='bw'||e.mode==='time') return it.rng?it.rng.join('-'):null;
  return null;
}
/* Unite d un passage (v2.19) : celle de l exercice, sauf quand le passage a
   ete joue sous un autre regime et le dit, it.u, pose par la migration. */
function unitAt(e,it){ return (it&&it.u)||unitOf(e); }
/* Etiquette de tenue d un passage, la ou charge et bande ont la leur (v2.17). */
function tenueTag(it){
  if(it&&it.tenue!=null) return ' <span class="muted small num">'+it.tenue+' s</span>';
  if(it&&it.assise!=null) return ' <span class="muted small num">assise '+it.assise+' cm</span>';
  return '';
}
function palierLbl(id,v){
  const e=DB[id];
  if(v==null||!e) return '';
  if(e.bnd) return bandLabel(v);
  if(e.mode==='load'||e.mode==='fixed') return v>0?loadLabelFor(id,v):'poids du corps';
  if(e.rhythm) return 'tenues de '+v+' s';
  if(e.assise) return 'assise à '+v+' cm';
  return String(v)+' '+unitOf(e);
}
/* Sens d un changement de palier. Sur les bandes il se lit dans l ordre de
   l echelle et non dans la couleur : bandOrder porte deja l inversion des
   bandes d assistance, ou progresser signifie moins d aide. */
function palierUp(id,a,b){
  const e=DB[id];
  if(e.bnd){ const O=bandOrder(e); return O.indexOf(b)>O.indexOf(a); }
  if(e.rhythm) return b>a;
  if(e.assise) return b<a;
  if(e.mode==='bw'||e.mode==='time') return parseInt(String(b).split('-')[1],10)>parseInt(String(a).split('-')[1],10);
  return b>a;
}
/* Chemin des paliers : uniquement les changements, dates. Jamais tronque, il
   est rare par nature, une dizaine d entrees par an au plus. C est lui qui
   porte l arc de progression, ce qui autorise a borner les passages. */
function paliersOf(id){
  const out=[]; let prev=null;
  exoPassages(id).forEach(x=>{
    if(x.repl) return;
    const v=palierVal(id,x.it);
    if(v==null) return;
    if(prev===null){ out.push({v:v,date:x.h.date,first:true}); prev=v; return; }
    if(v!==prev){ out.push({v:v,date:x.h.date,up:palierUp(id,prev,v)}); prev=v; }
  });
  return out;
}
/* Echelle de l exercice et position courante, une forme unique pour les quatre
   regimes. Depuis la v2.16 le regime de la fourchette n a qu une marche : le
   haut de fourchette est le plafond, et la suite est la marche ecrite dans
   NEXT. L echelle de fourchettes decalees, 6-12 puis 7-13 puis 8-14, qui
   affichait « Marche 1 sur 3 » pour un escalier que personne n avait dessine,
   est partie avec le relevement. La position vaut -1 quand la fourchette
   stockee n est pas celle du catalogue : c est le temoin que la migration
   d ecretage a manque un etat, pas un cas de fonctionnement. */
/* Position sur une echelle numerique : la marche exacte, ou a defaut la plus
   haute marche atteinte. Le repli couvre le reglage manuel, qui se fait sur
   l echelle complete quand l echelle de progression est plus lache. Renvoie -1
   quand rien n a encore ete regle : c est un depart, pas une anomalie. */
function rangIn(L,cur){
  let i=-1;
  L.forEach((v,k)=>{ if(Math.abs(v-cur)<0.01) i=k; });
  if(i<0) for(let k=0;k<L.length;k++) if(L[k]<=cur+0.01) i=k;
  return i;
}
function echelleOf(id){
  const e=DB[id], p=state.perf[id];
  if(!e||!e.reps||e.cat==='cardio'||e.mode==='circuit'||e.mode==='stretch') return null;
  const g=state.gear;
  if(e.mode==='load'){
    const L=loadLadderProg(g), cur=(p&&p.load)||0;
    return {lbl:L.map(v=>loadLabelFor(id,v)),i:rangIn(L,cur),quoi:'charge'};
  }
  if(e.bnd){
    const L=bandLadder(e,g);
    return {lbl:L.map(b=>bandLabel(b)),i:L.indexOf(p&&p.band),quoi:'barreau'};
  }
  if(e.mode==='fixed'){
    const fc=fixedCap(id), L=fixedLadder(id,g).filter(x=>fc==null||x.v<=fc+0.01), cur=(p&&p.load)||0;
    return {lbl:L.map(x=>x.lbl),i:rangIn(L.map(x=>x.v),cur),quoi:'charge',cap:fc!=null};
  }
  /* Echelle de tenues (v2.17) : trois marches, chacune avec sa fourchette.
     Sans performance enregistree l exercice est vierge, comme sur une bande,
     bien que sa position soit connue par construction. */
  if(e.rhythm){
    const L=e.rhythm.ladder, r=rungOf(e,p&&p.tenue);
    return {lbl:L.map(x=>x[0]+' s · '+x[1]+'-'+x[2]),i:p?r.i:-1,quoi:'tenue'};
  }
  if(e.assise){
    const L=e.assise.ladder, r=rungOf(e,p&&p.assise);
    return {lbl:L.map(x=>'assise '+x[0]+' cm · '+x[1]+'-'+x[2]),i:p?r.i:-1,quoi:'assise'};
  }
  const base=e.reps, rg=rangeOf(p,e);
  return {lbl:[base[0]+'-'+base[1]+' '+unitOf(e)],i:(rg[0]===base[0]&&rg[1]===base[1])?0:-1,quoi:'fourchette'};
}
/* Bloc 1 : ou j en suis. Position, marche suivante, et la condition qui la
   declenche, ecrite dans les termes exacts de applyProgress. */
function echelleHtml(id){
  const e=DB[id], p=state.perf[id], E=echelleOf(id);
  if(!E) return '';
  const rg=rangeOf(p,e), top=rg[1], held=!!(p&&p.hold);
  const suiv=(E.i>=0&&E.i<E.lbl.length-1)?E.lbl[E.i+1]:null;
  const vierge=E.i<0;   /* depart : la position dit deja ou commence l echelle */
  /* Une fourchette n a qu une marche (v2.16) : « Marche 1 sur 1 » ne dirait
     rien, la ligne de position est reservee aux echelles. */
  const pos=E.i<0?'<div class="muted small">Pas encore de niveau enregistré : l\'échelle commence à <b>'+esc(E.lbl[0]||'')+'</b>.</div>'
    :(E.quoi==='fourchette'?'':'<div class="muted small">Marche <b class="num">'+(E.i+1)+'</b> sur <b class="num">'+E.lbl.length+'</b>'+(E.cap?', plafond dérivé du soulevé roumain':'')+'</div>');
  /* Fenetre autour de la marche courante. Sur l echelle des halteres, vingt-six
     marches en pastilles noient la position qu elles sont censees montrer : on
     en garde trois de chaque cote, les extremites restant lisibles par le
     compteur au-dessus. */
  const W=3, deb=Math.max(0,E.i-W), fin=Math.min(E.lbl.length,E.i+W+1);
  const echelle=(E.i<0||E.lbl.length<2)?'':'<div class="mt" style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">'+
    (deb>0?'<span class="muted small">…</span>':'')+
    E.lbl.slice(deb,fin).map((l,k)=>'<span class="tag ech'+(deb+k===E.i?' ok':'')+'" style="font-size:.68rem;'+(deb+k>E.i?'opacity:.45':'')+'">'+esc(l)+'</span>').join('')+
    (fin<E.lbl.length?'<span class="muted small">…</span>':'')+'</div>';
  /* Sur une fourchette, le plafond n est pas un etat atteint mais une regle :
     la ligne dit ce qui se passe au haut de fourchette, et a quelle condition,
     dans les termes exacts d applyProgress. */
  const plafond=E.quoi==='fourchette'?'Au haut de la fourchette, toutes les séries à <b class="num">'+top+'</b> '+unitOf(e)+' sur une séance complète :':'Dernière marche outillée.';
  return '<details class="mt" data-k="fiche-echelle"'+cardOpen('fiche-echelle',false)+'>'+
    '<summary>Où j\'en suis</summary>'+
    '<div class="mt"><span class="tag ok">'+esc(E.i>=0?E.lbl[E.i]:palierLbl(id,e.bnd?(p&&p.band):(p&&p.load)))+'</span></div>'+
    pos+echelle+
    (vierge?'':(suiv?'<div class="muted small mt">Marche suivante : <b>'+esc(suiv)+'</b></div>':
          '<div class="muted small mt">'+plafond+(nextFor(id,state.gear)?' '+esc(nextFor(id,state.gear)):'')+'</div>'))+
    (vierge?'':held?'<div class="muted small mt">Palier tenu : la progression est figée, la marche suivante ne se déclenchera pas tant que tu ne l\'auras pas relâchée.</div>'
         :(suiv?'<div class="muted small mt">Elle se déclenche quand toutes les séries atteignent <b class="num">'+top+'</b> '+unitOf(e)+' sur une séance complète.</div>':''))+
  '</details>';
}
/* Bloc 2 : deux registres. Le chemin des paliers, entier, porte l arc ; les
   passages, bornes a douze dont trois visibles, portent le detail recent. Sans
   le premier, borner le second effacerait le debut de l histoire. */
function passagesHtml(id){
  const e=DB[id], P=exoPassages(id), PAL=paliersOf(id);
  if(!P.length) return '';
  const rec=P.slice().reverse(), plus=(ficheMoreId===id), vus=rec.slice(0,plus?12:3);
  const ligne=x=>{
    const h=x.h, it=x.it;
    if(x.repl) return '<div class="histline" style="opacity:.5;cursor:pointer" onclick="showFiche(\''+it.id+'\')">'+
      '<span class="muted small">'+esc(fmtDT(h.date))+' · remplacé par '+esc((DB[it.id]||{}).nom||it.id)+'</span><span class="muted">›</span></div>';
    const tags=[];
    if(h.light) tags.push('allégée');
    if(h.inc) tags.push('quittée');
    else if(h.rounds&&it.sets&&it.sets.length<h.rounds) tags.push('partielle');
    const charge=e.bnd&&it.band?bandDot(it.band)+esc(bandLabel(it.band)):(it.load?esc(loadLabelFor(id,it.load)):((it.tenue!=null?it.tenue+' s'+(it.rng?' · ':''):'')+(it.assise!=null?'assise '+it.assise+' cm'+(it.rng?' · ':''):'')+(it.rng?esc(it.rng.join('-')):'')));
    return '<div class="histline"><span class="muted small">'+esc(fmtDT(h.date))+
      (charge?' · <span class="num">'+charge+'</span>':'')+
      tags.map(t=>' <span class="tag flame" style="font-size:.68rem">'+t+'</span>').join('')+
      '</span><span class="num small">'+(e.mode==='stretch'?'✓':setsHtml(it.sets||[])+' '+unitAt(e,it))+'</span></div>';
  };
  const chemin=PAL.length>1?'<div class="muted small mt">Chemin des paliers</div>'+
    PAL.map(x=>'<div class="histline"><span>'+(x.first?'<span class="muted small">départ</span>':(x.up?'⚖️':'↓'))+
      ' <b>'+esc(palierLbl(id,x.v))+'</b></span><span class="muted small">'+esc(fmtDT(x.date).slice(6))+'</span></div>').join('')
    :'';
  const manque=!e.bnd&&(e.mode==='bw'||e.mode==='time')&&PAL.length<=1&&P.length>1
    ? '<div class="muted small mt">Le chemin des paliers de cet exercice se remplit à partir des séances jouées depuis la mise à jour : les fourchettes des passages antérieurs n\'ont pas été enregistrées.</div>' : '';
  return '<details class="mt" data-k="fiche-passages"'+cardOpen('fiche-passages',false)+'>'+
    '<summary>Progression</summary>'+
    chemin+manque+
    '<div class="muted small mt">'+(plus?'Douze derniers passages':'Trois derniers passages')+'</div>'+
    vus.map(ligne).join('')+
    (rec.length>3?'<button class="quiet" style="margin-top:8px;padding:6px 14px;font-size:.8rem" onclick="ficheMore(\''+id+'\')">'+
      (plus?'Voir moins':'Voir plus')+'</button>':'')+
  '</details>';
}
/* Bloc 3 : le verrou, dans les deux sens. L etat affiche est celui de la
   derniere seance et non un maximum historique, parce que c est ce que lit
   checkUnlocks : une barre de progression reculerait apres un passage moyen et
   se lirait comme une perte alors que rien n est perdu. */
function verrouHtml(id){
  const e=DB[id], parts=[];
  if(e.lock&&!state.unlocked[id]){
    const src=DB[e.lock.after], p=state.perf[e.lock.after];
    let etat;
    if(!p||!p.sets||!p.sets.length) etat='Aucun passage enregistré sur '+esc(src?src.nom:e.lock.after)+' pour l\'instant.';
    else if(p.lightSets||p.unqualSets) etat='Le dernier passage sur '+esc(src.nom)+' était en séance allégée ou avec un matériel non conforme : il ne compte pas pour le verrou.';
    else if(e.lock.bandGate&&src&&src.bnd){
      const L=bandOrder(src), dernier=L[L.length-1];
      /* v2.12 : les deux nombres sortent du dernier passage, barreau compris.
         Le texte disait deja « à la dernière séance » alors que le meilleur lu
         etait un maximum historique au barreau : il est vrai maintenant. */
      const meilleure=Math.max.apply(null,(p.sets||[]).concat([0]));
      etat='À la dernière séance : barreau '+esc(bandLabel(p.setsBand||p.band))+' (il faut '+esc(bandLabel(dernier))+')'+
           ', meilleure série <b class="num">'+meilleure+'</b> (il faut <b class="num">'+e.lock.need+'</b>).'+
           (p.setsBand?'':' Le barreau de ce passage n\'a pas été enregistré : il le sera à la prochaine séance.');
    } else {
      const k=Math.min(e.lock.minSets||1,effRounds()), n=(p.sets||[]).filter(v=>v>=e.lock.need).length;
      etat='À la dernière séance : <b class="num">'+n+'</b> série'+(n>1?'s':'')+' à '+e.lock.need+'+ sur les <b class="num">'+k+'</b> demandées ('+setsHtml(p.sets)+').';
      /* v2.18 : une porte de palier se dit avec le palier joue et le palier
         exige, que la seule ligne de series ne montrait pas */
      const gp=gatePalier(e);
      if(gp) etat+=gp.joue?' Palier joué : <b>'+esc(gp.joue)+'</b> (il faut <b>'+esc(gp.exige||'?')+'</b>).'
                          :' Le palier de ce passage n\'a pas été enregistré : il le sera à la prochaine séance.';
    }
    parts.push('<div class="muted small">Verrouillé par <b>'+esc(src?src.nom:e.lock.after)+'</b></div>'+
      '<div class="mt"><span class="tag lock">🔒 '+esc(lockCond(e))+'</span></div>'+
      '<div class="muted small mt">'+etat+'</div>'+
      '<div class="muted small mt">La condition se relit à chaque séance : elle porte sur le dernier passage, pas sur un record.</div>');
  }
  const ouvre=Object.keys(DB).filter(x=>DB[x].lock&&DB[x].lock.after===id);
  if(ouvre.length) parts.push('<div class="'+(parts.length?'mt':'')+'" style="'+(parts.length?'border-top:1px solid var(--line);padding-top:10px':'')+'">'+
    '<div class="muted small">Cet exercice ouvre</div>'+
    ouvre.map(x=>{
      const ouvert=!!state.unlocked[x];
      return '<div class="histline" style="cursor:pointer;border:none;padding:6px 0" onclick="showFiche(\''+x+'\')">'+
      '<span><b>'+esc(DB[x].nom)+'</b>'+(ouvert?' <span class="tag ok" style="font-size:.68rem">ouvert</span>':'')+
      '<div class="muted small">'+esc(lockCond(DB[x]))+'</div>'+
      (DB[x].retire===id?'<div class="muted small">'+(ouvert?'Il a pris la place de cet exercice dans la rotation.':'Il prendra la place de cet exercice dans la rotation.')+'</div>':'')+
      '</span><span class="muted">›</span></div>';
    }).join('')+'</div>');
  if(!parts.length) return '';
  return '<details class="mt" data-k="fiche-verrou"'+cardOpen('fiche-verrou',false)+'>'+
    '<summary>Verrou</summary>'+parts.join('')+'</details>';
}
let ficheMoreId=null;
function ficheMore(id){ openCards=cardsOpen(); ficheMoreId=(ficheMoreId===id)?null:id; showFiche(id); }
function showFiche(id,from){
  screenEnter('fiche/'+id);
  if(from) ficheFrom=from;
  setHash('fiche/'+id);
  const e=DB[id],p=state.perf[id],locked=isLocked(id);
  if(ficheMoreId&&ficheMoreId!==id) ficheMoreId=null;
  const back={home:'← Retour à la séance',lib:'← Retour aux exercices',prog:'← Retour aux progrès'}[ficheFrom]||'← Retour';
  $('#app').innerHTML='<button class="quiet" style="margin-bottom:10px;padding:8px 14px" onclick="go(\''+ficheFrom+'\')">'+back+'</button>'+
  '<div class="card">'+
    '<div class="exo-head"><h3>'+esc(e.nom)+'</h3><span class="exo-en">'+esc(e.en)+'</span></div>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    (locked?'<div class="tag lock" style="margin-top:8px">🔒 '+esc(lockCond(e))+'</div>':'')+
    /* sens inverse du bloc « Variante de repli » ci-dessous, qui nomme le repli
       d un exercice : celui-ci dit de qui l exercice courant est le repli */
    (estRepli(id)?'<div class="muted small mt">Exercice de repli : il ne sort pas au tirage. Il remplace '+esc(replieDe(id).map(x=>DB[x].nom).join(', '))+' en cas de douleur ou de séance allégée.</div>':'')+
    (estSubstitut(id)?'<div class="muted small mt">Substitut de '+esc(substitutDe(id).map(x=>DB[x].nom).join(', '))+' : il ne sort pas au tirage, il prend la place quand le matériel manque.</div>':'')+
    '<div class="mt">'+figFor(id,e.fig,e.nom)+'</div>'+
    '<details data-k="fiche-exec"'+cardOpen('fiche-exec',true)+'><summary>Exécution</summary><ol class="steps-list">'+e.desc.map(d=>'<li>'+d+'</li>').join('')+'</ol></details>'+
    '<div class="vig">⚠ '+e.vig+'</div>'+
    (e.pos?'<div class="muted small mt" style="border-left:3px solid var(--rail);padding-left:10px">'+esc(BAND_POS)+'</div>':'')+
    /* v2.17 : sur une echelle de tenues la fourchette est celle du barreau, et
       le barreau se dit ; ailleurs celle du catalogue, comme avant */
    (e.reps?'<div class="muted small mt">Fourchette de travail : '+baseReps(e,state.perf[id])[0]+'-'+baseReps(e,state.perf[id])[1]+' '+unitOf(e)+(e.rhythm?' de '+tenueOf(id,state.perf[id])+' s':'')+(e.assise?', assise à '+assiseOf(id,state.perf[id])+' cm':'')+' × '+(e.sets||3)+' séries'+(e.side?', par côté':'')+'</div>':'')+
    (e.bnd&&p&&p.band?'<div class="muted small">Barreau actuel : '+bandDot(p.band)+bandLabel(p.band)+(e.bnd==='ass'?' (assistance : progresser = descendre l\'échelle)':' (résistance : progresser = monter l\'échelle)')+'</div>':'')+
    /* v2.18 : le niveau est celui sous lequel ces series ont ete jouees, lu
       comme sur l ecran de serie. La fiche accolait le niveau du jour, deja
       monte en fin de seance : « 15/15/15 à KB 10 kg + lestes 2 kg » pour
       trois series faites a 10 kg. */
    (p&&p.sets&&p.sets.length?'<div class="mt"><span class="tag ok">Dernière fois : '+setsHtml(p.sets)+esc(playedLabel(id,p))+'</span></div>':'')+
    (finLineHtml(id))+
    (fbLineHtml(id))+
    (holdBoxHtml(id))+
    (echelleHtml(id))+
    (passagesHtml(id))+
    (verrouHtml(id))+
  '</div>';
  renderNav();
}
/* Critere de fin de serie sur la fiche (v2.12). Il ne vit pas dans vig, qui
   nomme ce qui est en jeu sur le corps, ni dans desc, qui decrit le geste :
   c est une regle d arret, et elle merite sa ligne. Le champ n existe que la ou
   l echec technique arrive avant l echec musculaire, vingt et une fiches
   depuis la v2.26 (ADR-0006) ; ailleurs la
   regle generale de la section de Reglages suffit, et la repeter partout la
   ferait lire nulle part. Le lien mene au texte complet, une seule source. */
function finLineHtml(id){
  const f=DB[id]&&DB[id].fin;
  return '<div class="mt" style="border-top:1px solid var(--line);padding-top:10px">'+
    (f?'<div class="muted small"><b>Fin de série</b> · '+f+'</div>':'')+
    '<div class="muted small'+(f?' mt':'')+'">Une série se termine quand la répétition suivante ne serait plus le même exercice. '+
    '<a href="#set" onclick="goComment();return false;">Comment ça marche</a></div></div>';
}
/* La variante de repli n existait qu au moment de la douleur, sur un bouton qui
   ne la nommait pas : impossible de savoir a l avance vers quoi on bascule ni
   quel materiel il faudrait. La fiche la nomme et y mene, materiel compris. */
function fbLineHtml(id){
  const fb=DB[id]&&DB[id].fb;
  if(!fb||!DB[fb]) return '';
  return '<div class="mt" style="border-top:1px solid var(--line);padding-top:10px">'+
    '<div class="muted small">Variante de repli, en cas de douleur ou de séance allégée</div>'+
    '<div class="histline" style="cursor:pointer;border:none;padding:6px 0" onclick="showFiche(\''+fb+'\',\''+ficheFrom+'\')">'+
    '<span><b>'+esc(DB[fb].nom)+'</b><div class="muted small">'+esc((DB[fb].mat||['Poids du corps']).join(' · '))+'</div></span>'+
    '<span class="muted">›</span></div></div>';
}
/* interrupteur de palier tenu, disponible a froid depuis la fiche */
function holdBoxHtml(id){
  const e=DB[id];
  if(!e.reps||isLocked(id)||e.cat==='cardio'||e.mode==='stretch') return '';
  const p=state.perf[id], held=!!(p&&p.hold);
  return '<div class="mt" style="border-top:1px solid var(--line);padding-top:10px">'+
    '<div class="spread"><b class="small">'+(held?'Palier tenu':'Progression active')+'</b>'+
    '<button class="quiet" style="padding:6px 14px;font-size:.8rem" onclick="toggleHold(\''+id+'\')">'+(held?'Reprendre la progression':'Tenir ce palier')+'</button></div>'+
    '<div class="muted small" style="margin-top:6px">'+(held
      ? 'Niveau figé'+(p&&p.holdAt?' depuis le '+fmtDT(p.holdAt).slice(6):'')+'. La cible ne monte plus, la charge non plus. Si tu redescends nettement, l\'outil allège quand même : le filet de sécurité reste actif. Monter la charge à la main libère le palier.'
      : 'La cible suit tes séries, puis la charge prend le relais. Tenir le palier fige le niveau atteint, sans rien changer au volume de travail.')+'</div>'+
  '</div>';
}

/* ============ STATISTIQUES ============ */
function activeDays(st){
  const d={}; st.hist.forEach(h=>d[dayKey(h.date)]=1);
  return Object.keys(d).sort();
}
/* Moyenne de jours actifs par semaine.
   Deux regles, pour la meme raison : ne moyenner que sur des semaines
   reellement observees et reellement terminees.
   - la semaine en cours est exclue (elle est entamee, pas jouee : l inclure
     ferait plonger la moyenne chaque lundi matin) ;
   - le denominateur est borne au nombre de semaines revolues depuis la
     premiere seance, sinon on divise par des semaines ou l outil n existait
     pas (1 jour actif la premiere semaine donnait 0,3/sem sur 4).
   Renvoie null tant qu aucune semaine revolue n existe : il n y a alors rien
   a moyenner et la ligne n est pas affichee. */
function weeksObserved(st){
  if(!st.hist.length) return 0;
  const first=isoWeek(new Date(st.hist[0].date));
  if(first===prevWeekKey(0)) return 0;
  for(let i=1;i<=520;i++) if(prevWeekKey(i)===first) return i;
  return 52;
}
function avgActiveDays(st,weeks){
  const obs=Math.min(weeks,weeksObserved(st));
  if(!obs) return null;
  let n=0; const wc=weekCounts(st);
  for(let i=1;i<=obs;i++) n+=wc[prevWeekKey(i)]||0;
  return {avg:Math.round(n/obs*10)/10,weeks:obs};
}
/* replis douleur par exercice d origine sur une fenetre glissante :
   c est la repetition qui est un signal, pas un repli isole */
function painSwaps(st,weeks){
  const cutoff=Date.now()-weeks*7*864e5, m={};
  st.hist.forEach(h=>{
    if(new Date(h.date).getTime()<cutoff) return;
    /* les substitutions d une seance allegee sont volontaires : les compter
       ici noierait le signal de douleur et declencherait l alerte a tort */
    if(h.light) return;
    (h.items||[]).forEach(it=>{
      const org=it.sw&&it.from?it.from:it.id;
      if(!DB[org]) return;
      const e=m[org]||(m[org]={n:0,sw:0,to:{}});
      e.n++;
      if(it.sw&&it.from){ e.sw++; e.to[it.id]=(e.to[it.id]||0)+1; }
    });
  });
  return Object.keys(m).filter(id=>m[id].sw>0)
    .map(id=>({id:id,sw:m[id].sw,n:m[id].n,to:m[id].to}))
    .sort((a,b)=>b.sw-a.sw||b.n-a.n);
}
/* semaines terminees depuis la premiere seance : la semaine en cours n est
   comptee que si elle est deja validee, sinon elle serait affichee comme un
   deficit du lundi au dimanche alors qu elle n est pas jouee */
function weeksElapsed(st){
  if(!st.hist.length) return 0;
  const first=new Date(st.hist[0].date);
  const n=Math.max(1,Math.floor((Date.now()-first.getTime())/(7*864e5))+1);
  const cur=prevWeekKey(0);
  const done=(weekCounts(st)[cur]||0)>=goalForWeek(st,cur);
  return Math.max(0,n-(done?0:1));
}
function weeksValidated(st){
  const wc=weekCounts(st); let n=0;
  Object.keys(wc).forEach(k=>{ if(wc[k]>=goalForWeek(st,k)) n++; });
  return n;
}
function timeStats(st){
  const now=Date.now(), week=prevWeekKey(0), month=monthKey();
  let wSec=0,mSec=0,sumReal=0,sumPlan=0,nReal=0,sumGap=0,nModel=0;
  st.hist.forEach(h=>{
    if(!h.real) return;
    if(isoWeek(new Date(h.date))===week) wSec+=h.real;
    if(monthKey(h.date)===month) mSec+=h.real;
    sumReal+=h.real; sumPlan+=(h.plan!=null?h.plan:(h.dur||0))*60; nReal++;
    /* Ecart au modele rejoue (v1.16) : le seul chiffre sur lequel la constante
       d installation se recale. Il n a de sens qu en moyenne, une seance isolee
       etant dominee par ses interruptions, et seules les seances menees a leur
       terme comptent : sur une seance quittee, le temps reel s arrete au milieu
       d une etape que le modele, lui, ne compte pas du tout. */
    if(h.model&&!h.inc){ sumGap+=h.real-h.model; nModel++; }
  });
  return {week:wSec,month:mSec,avgReal:nReal?Math.round(sumReal/nReal/60):0,
          avgPlan:nReal?Math.round(sumPlan/nReal/60):0,n:nReal,
          gap:nModel?Math.round(sumGap/nModel):0,nModel:nModel};
}
function bandJourney(st){
  const first={}, last={};
  st.hist.forEach(h=>(h.items||[]).forEach(it=>{
    const e=DB[it.id]; if(!e||!e.bnd||!it.band) return;
    if(!first[it.id]) first[it.id]={band:it.band,date:h.date};
    last[it.id]={band:it.band,date:h.date};
  }));
  return Object.keys(first).filter(id=>first[id].band!==last[id].band).map(id=>({id:id,a:first[id],b:last[id]}));
}
function loadJourney(st){
  const first={},last={};
  st.hist.forEach(h=>(h.items||[]).forEach(it=>{
    const e=DB[it.id]; if(!e||(e.mode!=='load'&&e.mode!=='fixed')||!it.load) return;
    if(!first[it.id]) first[it.id]={load:it.load,date:h.date};
    last[it.id]={load:it.load,date:h.date};
  }));
  return Object.keys(first).map(id=>({id:id,a:first[id],b:last[id]}));
}
/* Couverture musculaire : series par semaine et par groupe.
   Meme regle que la moyenne de jours actifs, appliquee ici en v1.11 : on ne
   moyenne que sur des semaines observees et terminees. Le denominateur fixe a
   4 divisait le travail reel par des semaines ou l outil n existait pas encore
   (33 series faites en une semaine s affichaient 2,3 series par groupe, sous
   la bande sur les quatre rails, alors que la semaine vecue etait dans la
   bande). La fenetre passe donc des 28 derniers jours glissants aux semaines
   ISO revolues, la semaine en cours restant dehors : entamee n est pas jouee,
   et l inclure ferait plonger la mesure chaque lundi matin.
   Renvoie null tant qu aucune semaine n est revolue : il n y a alors rien a
   moyenner, et la card affiche sa projection sans rails.
   Les replis douleur gardent leur fenetre glissante de 4 semaines : ce sont
   des frequences, pas une moyenne, et un signal de securite doit reagir des la
   seance du jour. */
function coverage(st,weeks){
  const obs=Math.min(weeks,weeksObserved(st));
  if(!obs) return null;
  const keep={}; for(let i=1;i<=obs;i++) keep[prevWeekKey(i)]=1;
  const cats={push:0,pull:0,legs:0,core:0};
  st.hist.forEach(h=>{
    if(!keep[isoWeek(new Date(h.date))]) return;
    (h.items||[]).forEach(it=>{
      const e=DB[it.id];
      if(e&&cats[e.cat]!=null) cats[e.cat]+=it.sets.length;
    });
  });
  const o={}; Object.keys(cats).forEach(k=>o[k]=Math.round(cats[k]/obs*10)/10);
  return o;
}
/* nombre de semaines reellement moyennees, pour le libelle de la card */
function coverageWeeks(st,weeks){ return Math.min(weeks,weeksObserved(st)); }
/* Volume reellement joue par exercice (v2.2). La projection de la card nomme
   deux facteurs, les series par exercice et les jours actifs ; la couverture
   mesuree est a peu pres leur produit. Le second facteur est mesure dans
   Assiduite, le premier ne l etait nulle part, alors que c est lui qui bouge
   depuis que le volume se change en cours de seance et que les seances
   quittees existent. Meme fenetre que coverage, meme regle des semaines
   revolues : la ligne apparait et disparait avec les rails.
   Le denominateur est le nombre d emplacements et non le nombre d exercices
   distincts joues : un exercice bascule sur son repli en cours de seance
   produit deux entrees au journal pour un seul emplacement, et la somme des
   series reste juste. Les etirements n entrent jamais au journal et le module
   cardio n a pas de categorie de vivier : ni l un ni l autre n est compte. */
function playedVolume(st,weeks){
  const obs=Math.min(weeks,weeksObserved(st));
  if(!obs) return null;
  const keep={}; for(let i=1;i<=obs;i++) keep[prevWeekKey(i)]=1;
  let sets=0,n=0;
  st.hist.forEach(h=>{
    if(!keep[isoWeek(new Date(h.date))]) return;
    n++;
    (h.items||[]).forEach(it=>{
      const e=DB[it.id];
      if(e&&SLOT_ORDER.indexOf(e.cat)>=0) sets+=it.sets.length;
    });
  });
  if(!n) return null;
  return {v:Math.round(sets/n/SLOT_ORDER.length*10)/10,n:n,sets:sets};
}
function fmtMoisAn(iso){
  const M=['janv','févr','mars','avril','mai','juin','juil','août','sept','oct','nov','déc'];
  const d=new Date(iso); return M[d.getMonth()]+' '+d.getFullYear();
}
function fmtH(sec){
  const h=Math.floor(sec/3600), m=Math.round(sec%3600/60);
  return h?h+' h '+(m?m+' min':''):m+' min';
}
function histoWeeksSvg(st){
  const wc=weekCounts(st), N=12, bw=18, gap=6, H=56;
  let bars='';
  for(let i=N-1;i>=0;i--){
    const k=prevWeekKey(i), v=wc[k]||0, x=(N-1-i)*(bw+gap);
    const g=goalForWeek(st,k);
    const h=Math.round(Math.min(1,v/Math.max(g,v||1))* (H-14));
    const ok=v>=g;
    bars+='<rect x="'+x+'" y="'+(H-12-h)+'" width="'+bw+'" height="'+Math.max(2,h)+'" rx="3" fill="'+(ok?'var(--ok)':(v>0?'var(--accent)':'var(--line)'))+'"/>'+
      '<text x="'+(x+bw/2)+'" y="'+(H-2)+'" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="var(--mono)">'+(v||'')+'</text>';
  }
  return '<svg viewBox="0 0 '+(N*(bw+gap)-gap)+' '+H+'" style="width:100%;height:auto" aria-hidden="true">'+bars+'</svg>';
}
/* ============ COUVERTURE : BANDE ET ECHELLE (v1.10) ============
   Le plancher depend de l objectif poursuivi, le plafond n en depend pas :
   au-dela de 16 series par semaine la fatigue est la meme qu on construise ou
   non, donc seule la borne basse bouge. Un groupe dont tous les exercices
   tenables et deverrouilles sont tenus n est plus en construction, son
   plancher tombe a 4. Regle binaire par groupe et non au prorata : un prorata
   produirait un plancher fractionnaire illisible, et un exercice qui progresse
   encore construit encore son groupe.
   Echelle fixe a 24 : 8 tombe au tiers, 16 aux deux tiers, la bande occupe le
   tiers central. Une echelle adaptative deformerait la bande d une semaine a
   l autre, ce qui est precisement ce qu on vient corriger. Au-dela, ecretage :
   le chiffre exact reste ecrit a cote du rail. */
const COV_MIN=8, COV_MIN_HOLD=4, COV_MAX=16, COV_SCALE=24;
function groupHeld(cat){
  const ids=holdableIds().filter(id=>DB[id].cat===cat&&!isLocked(id));
  return ids.length>0&&ids.every(id=>isHeld(id));
}
function covFloor(cat){ return groupHeld(cat)?COV_MIN_HOLD:COV_MIN; }
function covPct(v){ return Math.round(Math.max(0,Math.min(1,v/COV_SCALE))*1000)/10; }
/* graduation alignee sur le rail : 96 px de nom + 8 de gouttiere a gauche,
   26 px de valeur + 8 de gouttiere a droite */
function covGrad(v){ return 'calc(104px + (100% - 138px) * '+(Math.round(v/COV_SCALE*1000)/1000)+')'; }
/* Projection : ce que la configuration produit, par opposition aux barres qui
   disent ce qui a ete fait. Toujours calculee par planFor via weeklySets,
   jamais depuis une table. */
function covProjection(){
  /* v1.13 : la projection part du volume choisi, pas d une duree dont on
     deduisait le nombre de tours. Le cardio ne rogne plus rien. */
  const r=roundsOf(state);
  const W={complet:'échauffement complet',court:'échauffement court',aucun:'sans échauffement'};
  return {n:weeklySets(),
    det:r+' série'+(r>1?'s':'')+' par exercice, '+W[state.warm]+', '+(state.cardio?'avec cardio':'sans cardio')+', objectif '+state.goal+' jour'+(state.goal>1?'s':'')};
}
function statsHtml(){
  const days=activeDays(state);
  if(!days.length) return '';
  const ts=timeStats(state), cov=coverage(state,4), lj=loadJourney(state);
  const wEl=weeksElapsed(state), wOk=weeksValidated(state);
  /* v2.7 : libelles derives de SLOTS et ordre pris sur SLOT_ORDER, comme dans
     la bibliotheque. La table recopiee ici figeait l ancien ordre du circuit. */
  const CAT_LABEL={}; SLOT_ORDER.forEach(s=>CAT_LABEL[s]=SLOTS[s].label);
  /* les quatre groupes existent independamment de la mesure : tant qu aucune
     semaine n est revolue, cov vaut null et seule la projection s affiche */
  const CATS=SLOT_ORDER.slice(), covW=coverageWeeks(state,4);
  const held={}; CATS.forEach(k=>held[k]=groupHeld(k));
  const heldGrp=CATS.filter(k=>held[k]);
  const covTop=cov?Math.max.apply(null,CATS.map(k=>cov[k])):0;
  const weak=cov?CATS.filter(k=>cov[k]<covFloor(k)&&cov[k]<covTop*0.6):[];
  const over=cov?CATS.filter(k=>cov[k]>COV_MAX):[];
  const proj=covProjection(), projFloor=heldGrp.length===CATS.length?COV_MIN_HOLD:COV_MIN;
  const projOk=proj.n>=projFloor&&proj.n<=COV_MAX;
  const a4=avgActiveDays(state,4), a12=avgActiveDays(state,12), pv=playedVolume(state,4);
  let h='<div class="card"><h3>Assiduité</h3>'+
    '<div class="muted small mt">Première séance le <b>'+fmtDT(state.hist[0].date).slice(6)+'</b> · <span class="num">'+days.length+'</span> jour'+(days.length>1?'s':'')+' actif'+(days.length>1?'s':'')+
    (wEl>0?' · <span class="num">'+wOk+'</span>/<span class="num">'+wEl+'</span> semaine'+(wEl>1?'s':'')+' validée'+(wEl>1?'s':''):' · première semaine en cours')+'</div>'+
    (a4?'<div class="muted small mt">Moyenne de jours actifs : <span class="num">'+fmtNum(a4.avg)+'</span>/sem sur '+a4.weeks+' semaine'+(a4.weeks>1?'s':'')+' révolue'+(a4.weeks>1?'s':'')+
        (a12&&a12.weeks>a4.weeks?' · <span class="num">'+fmtNum(a12.avg)+'</span>/sem sur '+a12.weeks:'')+'</div>':'')+
    '<div class="mt">'+histoWeeksSvg(state)+'</div>'+
    /* v2.15 : le referentiel se replie, l etat reste dehors (v1.10), comme sur
       la card Couverture. Trois phrases d explication depliees en permanence
       sous l histogramme etaient la seule exception. */
    '<details data-k="prog-assid"'+cardOpen('prog-assid',false)+' style="margin-top:8px"><summary class="muted small">Comment lire ce graphique</summary>'+
    '<div class="muted small mt">12 dernières semaines, jours actifs. Vert : objectif de la semaine atteint. Une semaine de démarrage ou de reprise a un objectif réduit au prorata des jours disponibles.</div></details></div>';
  h+='<div class="card"><h3>Couverture musculaire</h3>'+
    '<div class="muted small mt">'+(cov
      ?'Séries par semaine et par groupe, moyenne sur '+covW+' semaine'+(covW>1?'s':'')+' révolue'+(covW>1?'s':'')+'.'
      :'Séries par semaine et par groupe.')+'</div>'+
    '<div class="muted small mt">Configuration actuelle ('+proj.det+') : <b class="num" style="color:var('+(projOk?'--ok':'--flame')+')">'+proj.n+'</b> séries par groupe et par semaine.</div>'+
    (pv?'<div class="muted small mt">Réellement joué : <b class="num">'+fmtNum(pv.v)+'</b> série'+(pv.v>1?'s':'')+' par exercice, sur '+pv.n+' séance'+(pv.n>1?'s':'')+'.</div>':'');
  if(!cov) h+='<div class="muted small mt">Mesure à venir : elle démarre à la fin de ta première semaine complète.</div>';
  if(cov){
  h+='<div class="covgrad">'+(heldGrp.length?'<span style="left:'+covGrad(COV_MIN_HOLD)+'">'+COV_MIN_HOLD+'</span>':'')+
      '<span style="left:'+covGrad(COV_MIN)+'">'+COV_MIN+'</span>'+
      '<span style="left:'+covGrad(COV_MAX)+'">'+COV_MAX+'</span>'+
      '<span class="end">'+COV_SCALE+'</span></div>';
  CATS.forEach(k=>{
    const v=cov[k], fl=covFloor(k), out=v<fl||v>COV_MAX;
    h+='<div class="cov"><span class="cn"><span>'+CAT_LABEL[k]+'</span>'+(held[k]?'<span class="tenu">tenu</span>':'')+'</span>'+
       '<div class="rail"><span class="zone" style="left:'+covPct(fl)+'%;width:'+(Math.round((covPct(COV_MAX)-covPct(fl))*10)/10)+'%"></span>'+
       (v>COV_SCALE?'<span class="clip"></span>':'')+
       '<span class="cur'+(out?' out':'')+'" style="left:'+covPct(v)+'%"></span></div>'+
       '<span class="num cv">'+fmtNum(v)+'</span></div>';
  });
  if(weak.length) h+='<div class="vig">⚠ '+weak.map(k=>CAT_LABEL[k]).join(' et ')+' en retrait par rapport au reste : vérifie les replis et les séries passées.</div>';
  if(over.length) h+='<div class="vig">⚠ '+over.map(k=>CAT_LABEL[k]).join(' et ')+' au-dessus de la bande. Au-delà de '+COV_MAX+' séries par semaine, le rendement plafonne et la récupération devient le facteur limitant. Regarde aussi tes jours de repos : le volume ne les mesure pas.</div>';
  if(heldGrp.length) h+='<div class="muted small mt"><b>'+heldGrp.map(k=>CAT_LABEL[k]).join(' et ')+'</b> : tous les exercices du groupe sont en palier tenu, donc en entretien. Plancher ramené de '+COV_MIN+' à '+COV_MIN_HOLD+', maintenir demande bien moins que construire.</div>';
  const ratio=cov.pull&&cov.push?Math.round(cov.pull/cov.push*10)/10:null;
  if(ratio!=null) h+='<div class="muted small mt">Équilibre tiré/poussé : <span class="num">'+fmtNum(ratio)+'</span>'+(ratio<0.9?' · le tiré devrait au moins égaler le poussé pour tes épaules':'')+'</div>';
  }
  const div=divergence();
  if(div) h+='<div class="vig">⚠ Le poussé a pris <span class="num">'+div+'</span> montées d\'avance sur un tiré que tu tiens. Pour tes épaules, le tiré doit au moins suivre : libère le palier du tiré, ou tiens aussi le poussé le temps que l\'écart se referme.</div>';
  const nTenus=heldCount();
  if(nTenus) h+='<div class="muted small mt"><span class="num">'+nTenus+'</span> exercice'+(nTenus>1?'s':'')+' sur '+holdableIds().length+' en palier tenu. Le volume ne bouge pas, seule l\'intensité cesse de monter.</div>';
  /* Le referentiel se replie, l etat reste dehors : ce qui explique le
     vocabulaire n a besoin d etre lu qu une fois, ce qui decrit la semaine
     doit rester sous les yeux. Ferme par defaut, l etat des cards n etant
     pas persiste, une zone ouverte par defaut se rouvrirait a chaque visite
     et ne ferait jamais gagner un scroll. */
  h+='<details data-k="prog-lecture"'+cardOpen('prog-lecture',false)+' style="margin-top:12px;border-top:1px solid var(--line);padding-top:8px"><summary>Comment lire ces chiffres</summary>'+
    '<div class="muted small mt" style="display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center">'+
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:18px;height:8px;background:var(--band);border-radius:2px"></span>bande visée</span>'+
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:3px;height:13px;background:var(--flame);border-radius:2px"></span>hors bande</span>'+
    '</div>'+
    '<div class="muted small mt">De '+COV_MIN+' à '+COV_MAX+' séries par semaine et par groupe : c\'est la bande où le volume construit. En dessous, la progression ralentit sans disparaître. Au-dessus, le rendement plafonne et la récupération devient le facteur limitant.</div>'+
    '<div class="muted small mt">Un groupe dont tous les exercices sont en palier tenu passe en entretien : son plancher tombe à '+COV_MIN_HOLD+', parce que maintenir demande bien moins que construire, à condition de garder l\'intensité. C\'est exactement ce que fige le palier tenu. Le plafond de '+COV_MAX+' ne bouge pas : au-delà, la fatigue est la même que l\'on construise ou non.</div>'+
    '<div class="muted small mt">Le volume ne mesure pas la récupération. Six séances courtes et trois séances espacées peuvent donner le même total pour un effet très différent.</div>'+
    '<div class="muted small mt">L\'échelle s\'arrête à '+COV_SCALE+'. Au-delà, le rail est écrêté en hachures, le chiffre affiché reste exact.</div>'+
    '</details>';
  h+='</div>';
  const ps=painSwaps(state,4);
  if(ps.length){
    /* seule card de l onglet qui porte un avertissement : fermee par defaut,
       mais ouverte d office des que le seuil d alerte est franchi, un
       avertissement replie n avertissant personne */
    const alerte=ps.filter(p=>p.sw>=2&&p.sw*2>=p.n);
    const nSw=ps.reduce((a,p)=>a+p.sw,0);
    h+='<details class="card" data-k="prog-replis"'+cardOpen('prog-replis',alerte.length>0)+'><summary><span class="ttl">Replis douleur</span>'+
      '<span class="val'+(alerte.length?' flameval':'')+'">'+nSw+' sur 4 sem.</span></summary>'+
      '<div class="muted small mt">Sur les 4 dernières semaines, par exercice d\'origine. Un repli isolé est un mauvais jour, une répétition est un signal. Les séances allégées volontaires ne comptent pas ici.</div>';
    ps.forEach(p=>{
      const vers=Object.keys(p.to).sort((a,b)=>p.to[b]-p.to[a]).map(id=>DB[id]?DB[id].nom:id);
      h+='<div class="histline" style="cursor:pointer" onclick="showFiche(\''+p.id+'\',\'prog\')">'+
        '<span>'+esc(DB[p.id].nom)+'<div class="muted small">→ '+esc(vers.join(', '))+'</div></span>'+
        '<span class="num small" style="text-align:right"><b>'+p.sw+'</b>/'+p.n+' passage'+(p.n>1?'s':'')+'</span></div>';
    });
    if(alerte.length) h+='<div class="vig">⚠ '+esc(alerte.map(p=>DB[p.id].nom).join(', '))+' : la douleur revient plus d\'une fois sur deux. Un avis kiné sur ce mouvement vaut mieux qu\'un repli de plus.</div>';
    h+='</details>';
  }
  h+='<details class="card" data-k="prog-temps"'+cardOpen('prog-temps',false)+'><summary><span class="ttl">Temps d\'entraînement</span><span class="val">'+(ts.n?fmtH(ts.month)+' ce mois':'à mesurer')+'</span></summary>';
  if(ts.n){
    h+='<div class="muted small mt">Cette semaine : <b class="num">'+fmtH(ts.week)+'</b> · ce mois : <b class="num">'+fmtH(ts.month)+'</b></div>'+
       '<div class="muted small mt">Durée moyenne réelle : <span class="num">'+ts.avgReal+' min</span> pour <span class="num">'+ts.avgPlan+' min</span> annoncées, sur '+ts.n+' séance'+(ts.n>1?'s':'')+' mesurée'+(ts.n>1?'s':'')+'</div>'+
       /* La duree annoncee est calculee sur les cibles. Comparer le reel a
          l annonce melange donc deux causes : ce que le modele represente mal,
          et les repetitions faites au-dela ou en deca de la cible. Le modele
          rejoue reprend le meme calcul sur les valeurs saisies : l ecart qui
          reste ne contient plus que la premiere cause et les interruptions.
          C est le seul chiffre sur lequel la constante d installation se recale,
          et il ne vaut qu en moyenne. */
       (ts.nModel?'<div class="muted small mt">Écart au modèle : <span class="num">'+(ts.gap<0?'−':'+')+fmtDur(Math.abs(ts.gap))+'</span> par séance, sur '+ts.nModel+' séance'+(ts.nModel>1?'s':'')+' complète'+(ts.nModel>1?'s':'')+'. Le modèle est rejoué sur les répétitions réellement faites, donc cet écart ne contient plus les séries plus longues ou plus courtes que prévu.</div>':'');
  } else h+='<div class="muted small mt">Mesuré à partir de maintenant : les séances antérieures à la v1.1 n\'ont pas de durée réelle.</div>';
  h+='</details>';
  const bj=bandJourney(state);
  if(lj.length||bj.length){
    h+='<details class="card" data-k="prog-charges"'+cardOpen('prog-charges',false)+'><summary><span class="ttl">Trajectoire des charges</span><span class="val">'+(lj.length+bj.length)+' exercice'+(lj.length+bj.length>1?'s':'')+'</span></summary>';
    lj.forEach(j=>{
      h+='<div class="histline"><span>'+esc(DB[j.id].nom)+'</span><span class="num small">'+
        (j.a.load===j.b.load?fmtKg(j.a.load)+' depuis '+fmtMoisAn(j.a.date)
         :fmtKg(j.a.load)+' en '+fmtMoisAn(j.a.date)+' → '+fmtKg(j.b.load)+' en '+fmtMoisAn(j.b.date))+'</span></div>';
    });
    bj.forEach(j=>{
      h+='<div class="histline"><span>'+esc(DB[j.id].nom)+'</span><span class="num small">'+
        bandDot(j.a.band)+esc(bandRange(j.a.band)||j.a.band)+' en '+fmtMoisAn(j.a.date)+' → '+bandDot(j.b.band)+esc(bandRange(j.b.band)||j.b.band)+' en '+fmtMoisAn(j.b.date)+'</span></div>';
    });
    h+='</details>';
  }
  return h;
}

/* ============ PROGRES ============ */
/* Nombre de seances listees. Le plafond est juste, quatre seances par semaine
   en font plus de deux cents par an, mais rien ne le disait : la ligne
   d introduction le porte desormais, et les deux lisent la meme constante,
   sans quoi le texte et la coupe divergeraient un jour (v2.2). */
const HIST_SHOWN=12;
function renderProg(){
  screenEnter('prog');
  const li=lvlInfo(state.xp),ws=weekStreak(state);
  const ids=Object.keys(state.perf).filter(id=>DB[id]&&state.perf[id].sets&&state.perf[id].sets.length);
  /* retour d une correction faite depuis l historique : les messages de
     progression recalcules sont montres une fois, puis oublies */
  const note=fixNote; fixNote=null;
  let html='<h2 style="margin-bottom:12px">Progrès</h2>'+
  (note?'<div class="card"><div class="spread"><b>Séance corrigée</b></div>'+
     undoneHtml(note.undone,'left')+
     (note.msgs.length?note.msgs.map(m=>'<div class="tag ok" style="display:block;margin:6px 0;max-width:fit-content">'+esc(m)+'</div>').join('')
                 :(note.undone.length?'':'<div class="muted small mt">Progression recalculée, rien ne change de palier.</div>'))+'</div>':'')+
  '<div class="card"><div class="spread"><h3>Niveau <span class="num">'+li.lvl+'</span> · '+rankOf(li.lvl)+'</h3><span class="muted small num">'+state.xp+' XP</span></div>'+
  '<div class="bar mt"><i style="width:'+li.pct+'%"></i></div>'+
  '<div class="spread mt"><span class="muted small">'+state.hist.length+' séances · '+state.loadUps+' montées de charge</span>'+(ws>0?'<span class="tag flame">🔥 '+ws+' sem.</span>':'')+'</div></div>';
  if(state.hist.length){
    const der=state.hist[state.hist.length-1];
    const derLab=[histLab(der),fmtDT(der.date).slice(6)].filter(Boolean).join(' · ');
    html+='<details class="card" data-k="prog-seances"'+cardOpen('prog-seances',false)+'><summary><span class="ttl">Dernières séances</span>'+
      '<span class="val">'+esc(derLab)+'</span></summary>'+
      '<div class="muted small mt">Les '+HIST_SHOWN+' dernières. Touche une séance pour voir son contenu.</div>';
    [...state.hist].reverse().slice(0,HIST_SHOWN).forEach(h=>{
      const lab=histLab(h);
      /* Deux ambiguites levees en v1.11. La duree affichee etait le temps reel
         mesure, mais retombait silencieusement sur la duree choisie pour les
         seances sans mesure : meme format, deux grandeurs. Elle porte
         desormais les deux, systematiquement. Et l horodatage etait l heure de
         fin, posee a l enregistrement : on affiche l heure de debut, deduite
         de la duree reelle, c est celle qu on cherche en relisant son
         historique. La date de rattachement reste celle de fin, sans cas
         limite dans la plage d entrainement de 8 h a 20 h. */
      const ann=(h.plan!=null?h.plan:h.dur);
      const dmin=h.real?(Math.round(h.real/60)+' min'+(ann?' pour '+ann:''))
                       :(ann?ann+' min annoncées':'');
      const debut=h.real?new Date(new Date(h.date).getTime()-h.real*1000).toISOString():h.date;
      html+='<details><summary style="color:var(--ink);font-weight:400"><span class="histline" style="border:none;padding:6px 0;display:inline-flex;width:calc(100% - 20px);vertical-align:middle">'+
        '<span>'+(lab?esc(lab)+' ':'')+(h.inc?'<span class="tag flame" style="font-size:.68rem">incomplète</span> ':'')+'<span class="muted small">'+dmin+'</span></span>'+
        '<span class="muted small num">'+fmtDT(debut)+' · +'+h.xp+' XP</span></span></summary>'+
        histTimeHtml(h)+
        histItemsHtml(h)+
        /* la correction ne s offre que sur la derniere seance, tant qu aucune
           autre n a demarre : c est la fenetre que l instantane materialise */
        (corrigible()&&h.date===state.hist[state.hist.length-1].date
          ?'<button class="quiet mt" style="padding:6px 14px;font-size:.8rem" onclick="openFix(\'prog\')">Corriger cette séance</button>':'')+
        '</details>';
    });
    html+='</details>';
  }
  html+=statsHtml();
  html+='<details class="card" data-k="prog-reperes"'+cardOpen('prog-reperes',false)+'><summary><span class="ttl">Repères par exercice</span><span class="val">'+ids.length+' exercice'+(ids.length>1?'s':'')+'</span></summary>';
  if(!ids.length) html+='<div class="muted small mt">Tes repères apparaîtront ici après ta première séance.</div>';
  ids.forEach(id=>{
    const e=DB[id],p=state.perf[id];
    html+='<div class="histline" style="cursor:pointer" onclick="showFiche(\''+id+'\',\'prog\')"><span>'+esc(e.nom)+'</span><span class="num small">'+setsHtml(p.sets)+' '+unitOf(e)+(e.bnd&&p.band?' · '+bandLabel(p.band):(p.load?' · '+loadLabelFor(id,p.load):''))+'</span></div>';
  });
  html+='</details>';
  html+=badgesCardHtml();
  $('#app').innerHTML=html; renderNav();
}
/* Decomposition des durees d une seance, dans le detail deplie seulement (v1.16).
   La ligne fermee garde « 21 min pour 19 », qui tient en largeur. Ici il y a la
   place de dire de quoi l ecart est fait, et c est le seul endroit ou le detail
   se justifie : on y vient expres, apres coup, quand une seance a surpris.
   L identite est exacte : reel moins annonce vaut ce que les repetitions ont
   ajoute plus ce que le modele ne represente pas. */
/* v1.18 : le mode etant unique, ecrire « Alternee » sur chaque ligne serait un
   mot constant, donc du bruit. Le libelle ne porte plus que ce qui distingue :
   une seance allegee, et « Ciblee » pour une entree ancienne relue depuis un
   fichier importe, cas ou le mot dit encore quelque chose. */
function histLab(h){
  const p=[];
  if(h.mode&&h.mode!=='alterne') p.push('Ciblée');
  if(h.light) p.push('allégée');
  return p.join(' · ');
}
function histTimeHtml(h){
  if(!h.real||h.planSec==null||h.model==null) return '';
  const dR=h.real-h.planSec, dReps=h.model-h.planSec, dMod=h.real-h.model;
  const sg=v=>(v<0?'−':'+')+fmtDur(Math.abs(v));
  return '<div class="muted small mt" style="border-left:3px solid var(--line);padding-left:10px">'+
    'Annoncé <b class="num">'+fmtDur(h.planSec)+'</b>, réel <b class="num">'+fmtDur(h.real)+'</b> · écart <b class="num">'+sg(dR)+'</b>'+
    '<div style="margin-top:4px">dont répétitions faites au-delà ou en deçà des cibles : <b class="num">'+sg(dReps)+'</b></div>'+
    '<div>dont écart au modèle'+(h.inc?' (séance quittée, non exploitable)':'')+' : <b class="num">'+sg(dMod)+'</b></div>'+
  '</div>';
}
/* contenu d une seance : meme rendu qu au recapitulatif, tags de repli compris */
function histItemsHtml(h){
  if(!h.items||!h.items.length) return '<div class="muted small mt">Aucune série enregistrée.</div>';
  return '<div class="mt">'+h.items.map(it=>{
    const e=DB[it.id]; if(!e) return '';
    return '<div class="histline"><span>'+esc(e.nom)+
      (it.sw?' <span class="tag flame" style="font-size:.68rem">repli'+(it.from&&DB[it.from]?' de '+esc(DB[it.from].nom):'')+'</span>':'')+
      (it.band?' <span class="muted small">'+bandDot(it.band)+esc(bandLabel(it.band))+'</span>':(it.load?' <span class="muted small num">'+esc(loadLabelFor(it.id,it.load))+'</span>':tenueTag(it)))+
      '</span><span class="num small">'+(e.mode==='stretch'?'✓':setsHtml(it.sets)+' '+unitAt(e,it))+'</span></div>';
  }).join('')+'</div>';
}
/* fermee : les badges obtenus en rangee ; ouverte : toute la collection */
function badgesCardHtml(){
  const on=BADGES.filter(b=>state.badges.includes(b.id));
  return '<details class="card" data-k="prog-badges"'+cardOpen('prog-badges',false)+'><summary><span class="ttl">Badges</span><span class="val">'+on.length+'/'+BADGES.length+'</span>'+
    (on.length?'<span class="badgerow">'+on.map(b=>'<span class="badgechip">'+b.ico+' '+esc(b.nom)+'</span>').join('')+'</span>'
              :'<span class="badgerow"><span class="muted small">Le premier badge tombe à la fin de ta première séance.</span></span>')+
    '</summary>'+
    '<div class="mt">'+BADGES.map(b=>{
      const got=state.badges.includes(b.id);
      /* l avancement ne s affiche que sur un badge non acquis : une fois pose,
         « 12/5 » n informe plus de rien */
      const n=got?null:badgeProg(b,state);
      return '<div class="badge'+(got?'':' off')+'"><span class="ico">'+b.ico+'</span><div><b>'+esc(b.nom)+'</b><div class="small muted">'+esc(b.d)+'</div></div>'+
        (n==null?'':'<span class="pg num">'+n+'/'+b.seuil+'</span>')+'</div>';
    }).join('')+'</div></details>';
}

