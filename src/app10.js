/* ============ SYNCHRONISATION (v2.24) ============
   Hybride, local d abord. Sans cle, rien ici ne touche au reseau et l app se
   comporte exactement comme avant, export et import compris. Avec une cle,
   l etat entier part vers /api/state apres chaque enregistrement et revient a
   l ouverture quand l etat en ligne a change. Contrat de l API : carnet,
   section 5, et PALIER-backend.md.
   Pas de fusion : perf, slotIdx, unlocked et prevMin sont le produit sequentiel
   du moteur. Deux etats qui ont avance chacun de leur cote se departagent par
   une question, jamais par un melange.
   Les metadonnees vivent sous leur propre cle, hors de l etat : ni la cle ni
   l ETag ne passent dans un export ou dans l objet en ligne. Elles sont ecrites
   a chaque changement et lues une seule fois, au demarrage : les relire avant
   chaque echange ferait qu un second onglet reprenne la base du premier et
   ecrase son envoi sans conflit, alors qu avec sa propre base il recoit un 412
   et pose la question, ce qui est juste. */
const SYNC_KEY='palier-sync-v1', SYNC_URL='/api/state';
const SYNC_CALME=4000;      /* envoi regroupe : 4 s sans nouvel enregistrement */
const SYNC_ATTENTE=5000;    /* le lancement attend la synchronisation 5 s au plus */
const SYNC_DELAI=10000;     /* abandon d une requete */
const SYNC_REVOIR=5000;     /* retour au premier plan : pas deux verifications en 5 s */
const SYNC_FOCUS=30000;     /* focus de fenetre, sur ordinateur : une par 30 s */
const KEEPALIVE_MAX=65536;  /* plafond des requetes keepalive du navigateur */
const CLE_RE=/^[0-9A-HJKMNP-TV-Z]{20}$/;
/* sm : {cle, lie, base, baseVer, sale, gen, envoi:{id,gen}, derniere}
   base, baseVer : ETag et version de l etat en ligne dont le local descend
   sale          : modifie localement depuis base
   gen           : compteur d enregistrements, pour savoir si un envoi est a jour
   envoi         : dernier PUT tente ; son identifiant voyage dans le corps, ce
                   qui permet de reconnaitre son propre envoi quand la reponse
                   s est perdue (telephone verrouille juste apres la seance)
   lie           : la cle a ete acceptee une fois ; avant, rien n est ecrit */
let sm=null;
let syncEtat='', syncMsg='';     /* '', hors, indispo, refus, version, erreur */
let syncConflit=null;            /* {etat,etag,ver} : jamais persiste, recalcule */
let syncAttente=false;           /* le bouton de lancement attend */
let syncApres=false;             /* une verification est due au retour a l accueil */
let syncCorps=null, syncPrep=null, syncEnvoi=null, syncRelance=false, syncVerif=null;
let syncMin=null, syncMinAttente=null, syncVu=0, syncEcoute=false;

function syncDispo(){
  return typeof window!=='undefined'&&!!window.location&&window.location.protocol==='https:'&&
    typeof fetch==='function'&&typeof CompressionStream==='function'&&typeof Blob==='function'&&
    typeof Response==='function'&&typeof crypto!=='undefined'&&!!crypto&&!!crypto.subtle;
}
function syncOn(){ return !!(sm&&sm.cle&&sm.lie)&&syncDispo(); }
/* Saisie tolerante, forme canonique seule vers le serveur : casse, tirets,
   espaces, et les confusions I, L vers 1, O vers 0 du base32 de Crockford. */
function cleNorm(s){
  const c=String(s||'').toUpperCase().replace(/[\s-]+/g,'').replace(/[IL]/g,'1').replace(/O/g,'0');
  return CLE_RE.test(c)?c:null;
}
function verCmp(a,b){
  const x=String(a||'0').split('.').map(Number), y=String(b||'0').split('.').map(Number);
  for(let i=0;i<Math.max(x.length,y.length);i++){ const d=(x[i]||0)-(y[i]||0); if(d) return d>0?1:-1; }
  return 0;
}
async function smLire(){
  try{ const v=await store.get(SYNC_KEY); const o=v?JSON.parse(v):null; sm=(o&&o.cle&&o.lie)?o:null; }
  catch(e){ sm=null; }
}
function smEcrire(){ return store.set(SYNC_KEY,JSON.stringify(sm&&sm.lie?sm:null)); }

/* ---------- corps : l export, plus la version et l identifiant d envoi ----------
   L objet en ligne reste un fichier importable. Le corps se prepare des
   l enregistrement : au passage en arriere-plan, le navigateur peut geler la
   page avant la fin d une compression lancee a ce moment-la. */
function syncHex(b){ return Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''); }
function syncId(){ const a=new Uint8Array(8); crypto.getRandomValues(a); return syncHex(a); }
async function syncCorpsDe(json){
  const flux=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const octets=new Uint8Array(await new Response(flux).arrayBuffer());
  return {octets,sha:syncHex(new Uint8Array(await crypto.subtle.digest('SHA-256',octets)))};
}
function syncPreparer(){
  const gen=sm.gen, id=syncId(), env={app:'palier',version:VERSION};
  /* appVersion explicite : un etat neuf jamais enregistre ne le porte pas, et
     le serveur refuse un etat sans version */
  const json=JSON.stringify(Object.assign({},env,state,{appVersion:VERSION},env,{envoi:id}));
  const p=syncCorpsDe(json).then(c=>{
    const r={gen,id,octets:c.octets,sha:c.sha};
    if(sm&&sm.gen===gen) syncCorps=r;
    return r;
  });
  syncPrep={gen,p};
  return p;
}
function syncCorpsCourant(){
  if(syncCorps&&syncCorps.gen===sm.gen) return Promise.resolve(syncCorps);
  if(syncPrep&&syncPrep.gen===sm.gen) return syncPrep.p;
  return syncPreparer();
}

/* ---------- appel ---------- */
async function syncAppel(m,h,corps,keep){
  const ac=typeof AbortController==='function'?new AbortController():null;
  const t=ac?setTimeout(()=>ac.abort(),SYNC_DELAI):null;
  try{
    const o={method:m,headers:Object.assign({'x-palier-key':sm.cle},h||{}),cache:'no-store'};
    if(corps) o.body=corps;
    if(keep) o.keepalive=true;
    if(ac) o.signal=ac.signal;
    return await fetch(SYNC_URL,o);
  }catch(e){ syncEtat='hors'; syncMsg=''; return null; }
  finally{ if(t) clearTimeout(t); }
}
function syncStatut(s){
  if(s===401){ syncEtat='refus'; syncMsg=''; }
  else if(s===429||s>=500){ syncEtat='indispo'; syncMsg=''; }
  else { syncEtat='erreur'; syncMsg=s===413?'état trop grand pour la synchronisation':'réponse '+s; }
  syncVue(true);
}
function syncOk(){ syncEtat=''; syncMsg=''; sm.derniere=new Date().toISOString(); smEcrire(); }

/* ---------- enregistrement local : marquer, preparer, regrouper ---------- */
function syncTouch(){
  if(!syncOn()) return;
  sm.gen=(sm.gen||0)+1; sm.sale=true; smEcrire();
  syncPreparer().catch(()=>{});
  clearTimeout(syncMin);
  syncMin=setTimeout(()=>{ syncMin=null; syncEnvoyer(); },SYNC_CALME);
  syncEntete();
}
/* fin de seance : envoi immediat, sans attendre le regroupement */
function syncFinSeance(){ if(syncOn()&&sm.sale) syncEnvoyer(); }

/* ---------- envoi ----------
   If-Match sur la base : l envoi ne remplace que l etat dont le local descend.
   Refuse vers une version en ligne superieure : l If-Match garantit qu on a vu
   l etat qu on remplace, donc sa version est baseVer. */
function syncEnvoyer(keep){
  if(!syncOn()||!sm.sale||syncConflit||syncEtat==='version'||syncEtat==='refus') return Promise.resolve();
  if(syncEnvoi){ syncRelance=true; return syncEnvoi; }
  if(sm.base&&verCmp(sm.baseVer,VERSION)>0){ syncEtat='version'; syncMsg=sm.baseVer; syncVue(true); return Promise.resolve(); }
  clearTimeout(syncMin); syncMin=null;
  syncEnvoi=(async()=>{
    let c;
    try{ c=await syncCorpsCourant(); }catch(e){ syncEtat='erreur'; syncMsg='compression impossible'; return; }
    if(!syncOn()) return;
    sm.envoi={id:c.id,gen:c.gen}; smEcrire();
    const h={'content-type':'application/octet-stream','x-amz-content-sha256':c.sha};
    if(sm.base) h['if-match']=sm.base; else h['if-none-match']='*';
    /* au-dela du plafond, un keepalive serait refuse d emblee : envoi normal,
       et si la page meurt avant, sale est persiste et l ouverture suivante
       rattrape l envoi */
    const r=await syncAppel('PUT',h,c.octets,!!keep&&c.octets.length<=KEEPALIVE_MAX);
    if(!r||!sm) return;
    if(r.status===200){
      let etag=r.headers.get('etag');
      if(!etag){ try{ etag=(await r.json()).etag; }catch(e){} }
      sm.base=etag; sm.baseVer=VERSION; sm.sale=sm.gen!==c.gen; sm.envoi=null;
      syncOk();
    } else if(r.status===412){
      sm.envoi=null; smEcrire();
      if(cur) syncApres=true; else setTimeout(()=>syncVerifier(),0);
    } else syncStatut(r.status);
  })().finally(()=>{
    syncEnvoi=null; syncEntete();
    if(syncRelance){ syncRelance=false; if(syncOn()&&sm.sale) syncEnvoyer(); }
  });
  return syncEnvoi;
}

/* ---------- verification ----------
   Jugee sur l ETag, jamais sur l horloge. La lecture peut se faire en seance ;
   l adoption jamais : une reponse qui arrive seance lancee est oubliee, et une
   verification neuve part au retour a l accueil. */
function syncVerifier(){
  if(!(sm&&sm.cle)||!syncDispo()) return Promise.resolve();
  if(syncVerif) return syncVerif;
  syncVerif=(async()=>{
    if(syncEnvoi) await syncEnvoi;
    if(!sm) return;
    const liaison=!sm.lie;
    const h={}; if(sm.base) h['if-none-match']=sm.base;
    const r=await syncAppel('GET',h);
    syncVu=Date.now();
    if(!sm) return;
    if(liaison){
      /* la cle n est enregistree qu une fois acceptee */
      if(!r){ sm=null; flash('Pas de réseau : clé non enregistrée, réessaie'); syncVue(true); return; }
      if(r.status===401){ sm=null; syncEtat=''; flash('Clé inconnue'); syncVue(true); return; }
      if(r.status===429||r.status>=500){ sm=null; syncEtat=''; flash('Service indisponible : réessaie dans un moment'); syncVue(true); return; }
      sm.lie=true; smEcrire(); flash('Synchronisation activée');
    }
    if(!r) { syncVue(false); return; }
    if(r.status===304){ syncOk(); syncVue(false); if(sm.sale) syncEnvoyer(); return; }
    if(r.status===404){
      if(sm.base){ syncDesactiver('Données en ligne supprimées : synchronisation désactivée sur cet appareil'); return; }
      /* rien en ligne : premier envoi, quel que soit l etat local */
      sm.sale=true; smEcrire(); syncVue(true); syncEnvoyer(); return;
    }
    if(r.status!==200){ syncStatut(r.status); return; }
    let v;
    try{ v=await r.json(); }catch(e){ syncEtat='erreur'; syncMsg='état en ligne illisible'; syncVue(true); return; }
    const etag=r.headers.get('etag');
    const ver=(v&&typeof v.appVersion==='string'&&v.appVersion)||r.headers.get('x-palier-version')||'';
    await syncRecu(v,etag,ver);
  })().finally(()=>{ syncVerif=null; syncFinAttente(); syncEntete(); });
  return syncVerif;
}
async function syncRecu(v,etag,ver){
  /* un client ancien ne connait pas les migrations d un etat plus recent :
     ni envoi, ni recuperation, rechargement demande */
  if(verCmp(ver,VERSION)>0){ syncEtat='version'; syncMsg=ver; syncVue(true); return; }
  /* son propre envoi, dont la reponse s est perdue */
  if(sm.envoi&&v&&v.envoi===sm.envoi.id){
    sm.base=etag; sm.baseVer=ver; sm.sale=sm.gen!==sm.envoi.gen; sm.envoi=null;
    syncOk(); syncVue(false);
    if(sm.sale) syncEnvoyer();
    return;
  }
  if(cur){ syncApres=true; return; }
  if(!sm.sale){ await syncAdopter(v,etag,ver); return; }
  syncConflit={etat:v,etag,ver}; syncVue(true);
}
/* Recuperation : memes gardes et memes migrations qu un import, sans toucher a
   lastImport. L enregistrement local passe par save(), qui marque l etat comme
   modifie ; sale retombe juste apres, et l envoi programme ne part donc pas. */
async function syncAdopter(v,etag,ver){
  if(!v||v.app!=='palier'||typeof v.xp!=='number'||!Array.isArray(v.hist)){
    syncEtat='erreur'; syncMsg='état en ligne invalide'; syncVue(true); return;
  }
  const s=Object.assign(defaultState(),v);
  delete s.envoi;
  migrateState(s,v);
  state=s;
  syncProfil();
  await save();
  sm.base=etag; sm.baseVer=ver; sm.sale=false; sm.envoi=null; syncConflit=null;
  syncOk();
  applyTheme();
  if(!cur) render();
  const h=state.hist, d=h.length?h[h.length-1].date:null;
  flash(d?'Progression récupérée : dernière séance le '+fmtDT(d).slice(6)+' à '+fmtHM(d):'Progression récupérée');
}

/* ---------- conflit : la question dans la page ---------- */
function syncGarder(){
  const c=syncConflit; if(!c||!syncOn()) return;
  /* on remplace exactement l etat qu on a vu ; hors ligne, l envoi attend */
  sm.base=c.etag; sm.baseVer=c.ver; sm.sale=true; syncConflit=null; smEcrire();
  syncVue(true);
  syncEnvoyer();
}
async function syncPrendre(){
  const c=syncConflit; if(!c||!syncOn()) return;
  syncConflit=null;
  await syncAdopter(c.etat,c.etag,c.ver);
}

/* ---------- lancement de seance ----------
   Il attend la verification 5 s au plus, puis part sans elle : la seance ne
   depend jamais du reseau au-dela. Un conflit ou une version plus recente
   remplacent le bouton, parce que lancer creerait une divergence de plus. */
function syncBloque(){ return syncOn()&&(syncAttente||!!syncConflit||syncEtat==='version'); }
function syncDebutAttente(){
  if(typeof navigator!=='undefined'&&navigator&&navigator.onLine===false){ syncEtat='hors'; syncEntete(); return false; }
  syncAttente=true;
  clearTimeout(syncMinAttente);
  syncMinAttente=setTimeout(()=>{ syncMinAttente=null; syncFinAttente(); },SYNC_ATTENTE);
  syncVue(true);
  return true;
}
function syncFinAttente(){
  if(!syncAttente) return;
  syncAttente=false; clearTimeout(syncMinAttente); syncMinAttente=null;
  syncVue(true);
}
function syncControle(delai){
  if(!syncOn()) return;
  if(cur){ if(sm.sale) syncEnvoyer(); return; }
  if(delai&&Date.now()-syncVu<delai) return;
  if(syncVerif) return;
  if(!syncDebutAttente()) return;
  syncVerifier();
}
/* appele au rendu de l accueil : une reponse ecartee pendant la seance */
function syncReprise(){
  if(!syncApres||cur||!syncOn()) return;
  syncApres=false;
  setTimeout(()=>syncControle(0),0);
}
function syncCache(){ if(syncOn()&&sm.sale) syncEnvoyer(true); }

/* ---------- affichage ---------- */
const SYNC_BLOC='<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px">';
function syncCote(s){
  const h=(s&&Array.isArray(s.hist))?s.hist:[], d=h.length?h[h.length-1].date:null;
  return h.length+' séance'+(h.length>1?'s':'')+(d?', dernière le '+fmtDT(d).slice(6)+' à '+fmtHM(d):'');
}
function syncConflitHtml(){
  return SYNC_BLOC+'<b class="small">Deux versions ont avancé chacune de leur côté</b>'+
    '<div class="muted small mt">Pas de fusion possible : choisis celle qui continue, l\'autre est remplacée.</div>'+
    '<div class="small mt"><b>Cet appareil</b> : '+syncCote(state)+'</div>'+
    '<div class="small"><b>En ligne</b> : '+syncCote(syncConflit.etat)+'</div>'+
    '<div class="seg mt"><button onclick="syncGarder()">Garder cet appareil</button>'+
    '<button class="ghost" onclick="syncPrendre()">Prendre la version en ligne</button></div></div>';
}
function syncVersionHtml(){
  return SYNC_BLOC+'<b class="small">Version plus récente en ligne</b>'+
    '<div class="muted small mt">Ta progression a été enregistrée par PALIER v'+esc(syncMsg)+', cette page est en v'+VERSION+
    '. Recharge la page pour passer à la nouvelle version : rien n\'est perdu.</div>'+
    '<button class="mt" onclick="syncRecharger()">Recharger</button></div>';
}
function syncRecharger(){ try{ window.location.reload(); }catch(e){} }
/* ce qui remplace le bouton de lancement, ou rien */
function syncLancement(){
  if(!syncOn()) return '';
  if(syncEtat==='version') return syncVersionHtml();
  if(syncConflit) return syncConflitHtml();
  if(syncAttente) return '<button class="big mt" disabled>Synchronisation…</button>';
  return '';
}
function syncIlya(iso){
  const m=Math.floor((Date.now()-new Date(iso).getTime())/60000);
  if(m<1) return 'à l\'instant';
  if(m<60) return 'il y a '+m+' min';
  if(m<24*60) return 'il y a '+Math.floor(m/60)+' h';
  const j=dayGap(iso);
  return j<=1?'hier':'il y a '+j+' j';
}
function syncLibelle(){
  if(!syncDispo()) return 'Indisponible ici';
  if(!sm||!sm.cle) return 'Désactivée';
  if(!sm.lie) return 'Vérification…';
  if(syncEtat==='refus') return 'Clé refusée';
  if(syncEtat==='version') return 'Mise à jour requise';
  if(syncConflit) return 'Conflit';
  if(syncEtat==='hors') return 'Hors ligne';
  if(syncEtat==='indispo') return 'Service indisponible';
  if(syncEtat==='erreur') return 'Erreur';
  if(sm.sale) return 'Envoi en attente';
  return sm.derniere?syncIlya(sm.derniere):'Activée';
}
function syncPhrase(){
  const d=sm.derniere?'Dernière synchronisation le '+fmtDT(sm.derniere).slice(6)+' à '+fmtHM(sm.derniere)+'.':'Pas encore synchronisé.';
  const x={hors:'Pas de réseau : les modifications partiront au retour de la connexion.',
    indispo:'Service momentanément indisponible : nouvel essai au prochain enregistrement ou au retour sur la page.',
    erreur:'Échec de la synchronisation'+(syncMsg?' : '+esc(syncMsg):'')+'.'}[syncEtat];
  return d+(x?' '+x:(sm.sale?' Modifications en attente d\'envoi.':''));
}
function syncSaisie(bouton){
  return '<div class="mt"><input id="synccle" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" '+
    'placeholder="XXXXX-XXXXX-XXXXX-XXXXX" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:var(--mono)">'+
    '<button class="mt" onclick="syncActiver()">'+bouton+'</button></div>';
}
function syncCard(){
  const info='<div class="muted small mt">Garde la même progression sur plusieurs appareils. Tes données, signalements de douleur compris, '+
    'sont stockées chez AWS à Paris, chiffrées au repos et transmises en HTTPS. Ta clé y donne accès, et Gabriel, qui administre le service, peut les lire.</div>';
  let b;
  if(!syncDispo()) b='<div class="muted small mt">Disponible seulement sur palier.s1t3.link, dans un navigateur récent.</div>';
  else if(!sm||!sm.cle) b=syncSaisie('Activer')+
    '<div class="muted small mt">Saisis la clé avant la première séance sur un nouvel appareil : une séance jouée sans elle part d\'un état vide et ne se rattache pas.</div>';
  else if(!sm.lie) b='<div class="muted small mt">Vérification de la clé…</div>';
  else if(syncEtat==='refus') b='<div class="muted small mt">Clé refusée : elle a été révoquée ou remplacée. Saisis la nouvelle, tes modifications en attente partiront avec elle.</div>'+
    syncSaisie('Remplacer la clé')+syncBoutons();
  else b='<div id="syncetat" class="muted small mt">'+syncPhrase()+'</div>'+
    (syncEtat==='version'?syncVersionHtml():'')+(syncConflit?syncConflitHtml():'')+syncBoutons();
  return setCard('Synchronisation',syncLibelle(),info+b);
}
function syncBoutons(){
  if(uiAsk==='syncoff') return SYNC_BLOC+'<b class="small">Désactiver sur cet appareil ?</b>'+
    '<div class="muted small mt">Ta progression reste ici et en ligne. Garde ta clé : elle sera redemandée pour réactiver.'+
    (sm.sale?' Les modifications pas encore envoyées resteront sur cet appareil seulement.':'')+'</div>'+
    '<div class="seg mt"><button onclick="syncDesactiverOK()">Désactiver</button><button class="quiet" onclick="uiAskSet(\'syncoff\')">Annuler</button></div></div>';
  if(uiAsk==='syncdel') return SYNC_BLOC+'<b class="small">Supprimer tes données en ligne ?</b>'+
    '<div class="muted small mt">Toutes les versions sont effacées, définitivement. Cet appareil garde sa progression et la synchronisation s\'y désactive ; les autres appareils la désactiveront à leur prochaine connexion.</div>'+
    '<div class="seg mt"><button class="danger" onclick="syncSupprimerOK()">Supprimer</button><button class="quiet" onclick="uiAskSet(\'syncdel\')">Annuler</button></div></div>';
  return '<div class="seg mt"><button class="ghost" onclick="uiAskSet(\'syncoff\')">Désactiver</button>'+
    '<button class="danger" onclick="uiAskSet(\'syncdel\')">Supprimer mes données en ligne</button></div>';
}
/* Un changement de structure redessine l accueil ou les reglages ; un simple
   changement d etat ne touche que l en-tete et la phrase de la card, pour ne
   pas vider un champ en cours de saisie. */
function syncVue(structure){
  if(typeof document==='undefined') return;
  if(structure&&!cur&&(view==='home'||view==='set')){ render(); return; }
  syncEntete();
}
function syncEntete(){
  if(typeof document==='undefined'||view!=='set') return;
  try{
    const e=document.querySelector('details[data-k="set-synchronisation"] .val'); if(e) e.textContent=syncLibelle();
    const p=document.querySelector('#syncetat'); if(p&&sm&&sm.lie) p.innerHTML=syncPhrase();
  }catch(e){}
}

/* ---------- actions de la card ---------- */
async function syncActiver(){
  if(!syncDispo()) return;
  const el=document.querySelector('#synccle'), c=cleNorm(el&&el.value);
  if(!c){ flash('Clé invalide : 20 caractères attendus'); return; }
  if(sm&&sm.lie){
    /* cle remplacee, meme identifiant : la base et les modifications en
       attente restent valables */
    sm.cle=c; syncEtat=''; smEcrire(); syncVue(true);
    await syncVerifier(); return;
  }
  /* premiere liaison : rien en ligne, envoi ; rien en local, recuperation ;
     les deux, la question. sale porte « quelque chose en local ». */
  sm={cle:c,lie:false,gen:0,sale:state.hist.length>0};
  syncEtat=''; syncConflit=null; syncVue(true);
  await syncVerifier();
}
function syncDesactiver(msg){
  sm=null; smEcrire();
  syncEtat=''; syncMsg=''; syncConflit=null; syncApres=false; syncCorps=null; syncPrep=null;
  clearTimeout(syncMin); syncMin=null;
  syncAttente=false; clearTimeout(syncMinAttente); syncMinAttente=null;
  syncVue(true);
  if(msg) flash(msg);
}
function syncDesactiverOK(){ uiAsk=null; syncDesactiver('Synchronisation désactivée sur cet appareil'); }
async function syncSupprimerOK(){
  uiAsk=null;
  if(!syncOn()) return;
  const r=await syncAppel('DELETE');
  if(r&&r.status===204){ syncDesactiver('Données en ligne supprimées'); return; }
  if(r) syncStatut(r.status); else syncVue(true);
  flash('Suppression impossible : '+(r?'réponse '+r.status:'pas de réseau'));
}

/* ---------- demarrage et evenements ---------- */
function syncDemarrer(){
  if(!syncDispo()) return;
  if(!syncEcoute){
    syncEcoute=true;
    try{
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='hidden') syncCache(); else syncControle(SYNC_REVOIR);
      });
      window.addEventListener('pagehide',syncCache);
      window.addEventListener('focus',()=>syncControle(SYNC_FOCUS));
      window.addEventListener('online',()=>syncControle(0));
    }catch(e){}
  }
  return smLire().then(()=>{ syncEntete(); syncControle(0); });
}
if(typeof window!=='undefined'){
  Object.assign(window,{syncActiver,syncGarder,syncPrendre,syncDesactiverOK,syncSupprimerOK,syncRecharger});
}
