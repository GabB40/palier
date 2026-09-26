// Suite du lot v2.18. Deux volets.
// Sections 1 a 8 : premiere paire constatee au raccord de tour.
// Sections 9 a 17 : escalier du squat (squat sur une jambe vers la chaise,
// palier d assise, version lestee en kettlebells seules), portes de verrou
// qui lisent le palier joue, et fiche qui dit le niveau joue.
//
// Le 15 septembre 2026, quatuor developpe au sol, goblet squat, tractions
// assistees en pronation, gainage lateral. Au raccord, gainage lateral puis
// developpe : epaules en feu, halteres difficiles a stabiliser. La paire est
// nommee, et son successeur par retrait avec elle, le deblocage de la jambe
// levee etant tombe pendant la seance meme du constat.
//
// test37 teste le mecanisme, liste videe au besoin. Cette suite teste le
// CONTENU livre et ce qu il produit : la paire, la regle du successeur, le
// refus des paires par analogie, le cout, la fiche et les deux textes que la
// liste rend visibles pour la premiere fois.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollY:0,scrollTo:(x,y)=>{global.window.scrollY=y;},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
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
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.SRC=raw;

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 const LIVREE=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol'];
 const pauses=L=>L.filter(s=>s.k==='rest'&&s.pause);
 /* compteur d un emplacement qui fait tirer l exercice voulu, cherche et non
    code en dur : la rotation a sa propre suite */
 const caler=(slot,id)=>{
   for(let c=0;c<200;c++){ state.slotIdx[slot]=c; if(pickAt(slot,0)===id) return c; }
   throw new Error(id+' introuvable au tirage de '+slot);
 };

 // 1. le contenu livre : deux paires, pas une de plus
 {
   if(PAUSE_RACCORD_PAIRS.length!==LIVREE.length||LIVREE.some(x=>PAUSE_RACCORD_PAIRS.indexOf(x)<0))
     throw new Error('liste livree inattendue : '+PAUSE_RACCORD_PAIRS.join(', '));
   PAUSE_RACCORD_PAIRS.forEach(x=>{ const ab=x.split('>');
     if(!ab.every(id=>SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0))) throw new Error('paire hors des viviers : '+x); });
   console.log('contenu OK : gainage lateral et jambe levee, tous deux devant le developpe');
 }

 // 2. regle du successeur, derivee du catalogue
 /* Un exercice qui en retire un autre du tirage a son deblocage prend sa place
    au raccord. Une paire nommee sur le retire mourrait en silence ce jour-la :
    toute paire nommee sur un exercice qui a un successeur nomme aussi le
    successeur, devant le meme pousse. */
 {
   let vus=0;
   PAUSE_RACCORD_PAIRS.forEach(x=>{ const ab=x.split('>');
     Object.keys(DB).filter(y=>DB[y].retire===ab[0]).forEach(y=>{ vus++;
       if(PAUSE_RACCORD_PAIRS.indexOf(y+'>'+ab[1])<0) throw new Error('successeur '+y+' non nomme devant '+ab[1]); }); });
   if(!vus) throw new Error('aucun successeur rencontre, la regle ne prouve rien');
   console.log('successeur OK : '+vus+' successeur par retrait, nomme devant le meme pousse');
 }

 // 3. la paire pose la pause, avant puis apres le deblocage
 for(const R of [2,3,4]){
   await neuf(R);
   caler('push','developpe-sol'); caler('core','gainage-lateral');
   let L=buildSession().steps, w=workSteps(L);
   if(w[0].id!=='developpe-sol'||w[3].id!=='gainage-lateral') throw new Error('quatuor mal cale : '+w.slice(0,4).map(s=>s.id).join(','));
   let pa=pauses(L);
   if(pa.length!==R-1) throw new Error(R+' tours, gainage lateral : '+pa.length+' pauses au lieu de '+(R-1));
   L.forEach((s,i)=>{ if(s.k==='rest'&&s.pause){
     if(L[i-1].id!=='gainage-lateral') throw new Error('pause qui ne suit pas le gainage lateral');
     if(pa.some(p=>p.sec!==PAUSE_TOUR)) throw new Error('pause qui ne vaut pas PAUSE_TOUR'); } });
   /* le deblocage retire le gainage lateral : la jambe levee occupe la place */
   state.unlocked['gainage-lateral-jambe-levee']=true;
   if(!estRetire('gainage-lateral')) throw new Error('le deblocage doit retirer le gainage lateral du tirage');
   caler('core','gainage-lateral-jambe-levee');
   L=buildSession().steps; w=workSteps(L);
   if(w.some(s=>s.id==='gainage-lateral')) throw new Error('le gainage lateral est encore tire apres le deblocage');
   pa=pauses(L);
   if(pa.length!==R-1) throw new Error(R+' tours, jambe levee : '+pa.length+' pauses au lieu de '+(R-1));
 }
 console.log('pose OK : R-1 pauses a 2, 3 et 4 tours, sur le gainage lateral puis sur la jambe levee');

 // 4. le cas du 15 septembre, sur l etat reel exporte ce jour-la
 /* compteurs, deblocages et materiel du profil Domicile. La troisieme seance
    a venir, k=2, porte la jambe levee devant le developpe : sans le successeur, la
    premiere occurrence de la paire apres le constat n aurait pas eu de pause. */
 {
   await neuf(3);
   state.gear={bar:2,bars:2,plates:{'1':12,'2':4,'0.5':4,'1.25':4},maxPerEnd:5,
     bands:{jaune:'jaune',rouge:'rouge',noir:'noir',violet:'violet',vert:'vert',n6:''},cuffs:{'1':1,'2':1},
     res:{hal:1,kb:1,elast:1,cuff:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1},kbs:{'10':1,'16':1}};
   syncProfil();
   state.slotIdx={push:24,pull:25,legs:24,core:25};
   state.unlocked={'mollets-debout-leste':true,'tractions-assistees-pronation':true,'rdl-kettlebell':true,'gainage-lateral-jambe-levee':true};
   state.trans=5;
   const q=drawAhead(2);
   if(q[0]!=='developpe-sol'||q[3]!=='gainage-lateral-jambe-levee') throw new Error('tirage reel inattendu : '+q.join(','));
   const prochaines=[];
   for(let k=0;k<150;k++){ const d=drawAhead(k); if(pauseAu(d[3],d[0])) prochaines.push(k); }
   if(prochaines[0]!==2) throw new Error('premiere occurrence attendue a k=2, obtenue '+prochaines[0]);
   if(prochaines.length!==10) throw new Error('frequence reelle attendue 10/150, obtenue '+prochaines.length);
   SLOT_ORDER.forEach(s=>state.slotIdx[s]+=2);
   if(pauses(buildSession().steps).length!==2) throw new Error('la seance reelle ne porte pas ses deux pauses');
   console.log('etat reel OK : paire a k=2 avec la jambe levee, 10 seances sur 150, deux pauses');
 }

 // 5. aucune paire par analogie
 /* decision de Gabriel : on attend d y tomber. Un gainage voisin devant le
    developpe, ou le gainage lateral devant un autre pousse, ne pause pas. */
 {
   await neuf(3);
   const cas=[['developpe-sol','planche'],['developpe-sol','bird-dog'],['developpe-sol','pallof-press'],
              ['pompes-poignees','gainage-lateral'],['elevations-laterales','gainage-lateral']];
   cas.forEach(([u,c])=>{ caler('push',u); caler('core',c);
     const n=pauses(buildSession().steps).length;
     if(n) throw new Error(c+' > '+u+' : '+n+' pauses sur une paire non constatee'); });
   state.unlocked['gainage-lateral-jambe-levee']=true;
   caler('push','pompes-poignees'); caler('core','gainage-lateral-jambe-levee');
   if(pauses(buildSession().steps).length) throw new Error('jambe levee > pompes : pause sur une paire non constatee');
   console.log('analogie OK : aucune pause sur six paires voisines non constatees');
 }

 // 6. le cout, au reglage de transition reel et au reglage par defaut
 /* La pause remplace la transition du raccord : le surcout vaut
    (R-1) x (PAUSE_TOUR - transition). 110 s a trois tours et 5 s de
    transition, le reglage de Gabriel ; 90 s au defaut de 15 s. */
 {
   for(const [t,att] of [[5,110],[15,90]]){
     await neuf(3); setTrans(t);
     caler('push','developpe-sol'); caler('core','gainage-lateral');
     const a=planParts(buildSession());
     const sauve=PAUSE_RACCORD_PAIRS.slice(); PAUSE_RACCORD_PAIRS.length=0;
     const b=planParts(buildSession());
     sauve.forEach(x=>PAUSE_RACCORD_PAIRS.push(x));
     if(a.total-b.total!==att) throw new Error('surcout a '+t+' s de transition : '+(a.total-b.total)+' au lieu de '+att);
     if(a.nPause!==2||a.pause!==2*PAUSE_TOUR) throw new Error('poste Pause de tour faux a '+t+' s');
   }
   setTrans(15);
   console.log('cout OK : +110 s a 5 s de transition, +90 s a 15 s, trois tours');
 }

 // 7. la fiche des deux gainages lateraux nomme l epaule
 {
   ['gainage-lateral','gainage-lateral-jambe-levee'].forEach(id=>{
     const v=DB[id].vig||'';
     if(v.indexOf('<b>Épaules :</b>')<0) throw new Error('ligne Epaules absente de '+id);
     if(!/avant-bras/.test(v.split('<b>Épaules :</b>')[1])||!/loin de l'oreille/.test(v)) throw new Error('consigne d appui absente de '+id);
     if(!/ne bloque jamais/.test(v)) throw new Error('consigne anti-apnee perdue sur '+id);
   });
   if(!/La version genoux allège aussi l'épaule/.test(DB['gainage-lateral'].vig)) throw new Error('le repli genoux doit dire qu il allege l epaule');
   html=''; showFiche('gainage-lateral');
   if(html.indexOf('loin de l\\'oreille')<0) throw new Error('la ligne Epaules n est pas rendue dans la fiche');
   console.log('fiche OK : ligne Epaules sur les deux gainages lateraux, rendue, anti-apnee conservee');
 }

 // 8. les deux textes que la liste rend visibles
 {
   await neuf(3);
   view='set'; render();
   if(html.indexOf('que tu as signalés')<0) throw new Error('Reglages doit annoncer la pause en tutoyant');
   if(/(^|[^a-zA-Z])vous\\s/.test(SRC)) throw new Error('un vouvoiement subsiste dans la source');
   caler('push','developpe-sol'); caler('core','gainage-lateral');
   view='home';
   startSession();
   const st=cur.steps.find(s=>s.k==='rest'&&s.pause);
   if(!st) throw new Error('aucune pause dans la seance calee');
   const h=restHtml(st);
   if(h.indexOf('Tu as signalé une gêne d\\'épaule sur cet enchaînement')<0) throw new Error('le message doit dire que la paire est constatee');
   if(/seule adjacence|ce qu\\\\'il faut|ce qu'il faut/.test(h)) throw new Error('le message reprend une justification retiree du carnet');
   if(h.indexOf('Le tour recommence')<0||h.indexOf('Passer reste possible')<0) throw new Error('le message a perdu sa ligne visible ou sa sortie');
   console.log('textes OK : Reglages tutoie, message de pause fonde sur le constat, sans seuil chiffre');
 }

 /* ================= escalier du squat et paliers joues ================= */
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' vs '+JSON.stringify(b)); };
 const GEAR_REEL=()=>({bar:2,bars:2,plates:{'1':12,'2':4,'0.5':4,'1.25':4},maxPerEnd:5,
     bands:{jaune:'jaune',rouge:'rouge',noir:'noir',violet:'violet',vert:'vert',n6:''},cuffs:{'1':1,'2':1},
     res:{hal:1,kb:1,elast:1,cuff:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1},kbs:{'10':1,'16':1}});
 const reel=()=>{ state.gear=GEAR_REEL(); syncProfil(); };
 const CH='squat-une-jambe-chaise', CL='squat-une-jambe-chaise-leste';
 const vierge=id=>{ delete state.perf[id]; return perfOf(id); };
 const joue=(id,load,sets)=>{ const q=perfOf(id); if(load!=null) q.load=load; delete q.grace; delete q.prevMin; delete q.hold;
   return applyProgress(id,sets,true,false,false); };
 const ficheDerniere=id=>{ html=''; showFiche(id); const i=html.indexOf('Dernière fois : ');
   return i<0?'':html.slice(i,html.indexOf('</span>',i)).replace(/<[^>]+>/g,''); };

 // 9. catalogue, tables par position
 {
   await neuf(3);
   const P=SLOTS.legs.pool, iG=P.indexOf('goblet-squat'), iC=P.indexOf(CH), iL=P.indexOf(CL);
   if(iC!==iG+1||iL!==iG+2) err('les deux echelons suivent le goblet squat, sur place');
   const c=DB[CH], l=DB[CL];
   if(c.retire!=='goblet-squat'||l.retire!==CH) err('chaque echelon retire son predecesseur');
   if(c.mode!=='bw'||!c.side||c.sets!==2||c.reps.join('-')!=='8-15') err('squat sur une jambe : poids du corps, par cote, 2 x 8-15');
   eq(c.assise&&c.assise.ladder,[[50,8,15],[40,8,15]],'deux crans d assise, 50 puis 40 cm');
   if(c.rhythm||l.rhythm) err('aucun metronome sur l escalier du squat');
   const lc=c.lock||{};
   if(lc.after!=='goblet-squat'||!lc.kbTop||lc.loadTop||lc.need!==15||lc.minSets!==2) err('verrou d entree : 2 x 15 a la kettlebell la plus lourde, '+JSON.stringify(lc));
   if(l.mode!=='fixed'||!l.kbSeules||l.load0!==10||!l.side||l.sets!==2) err('version lestee : kettlebells seules, 10 kg au depart, par cote');
   const ll=l.lock||{};
   if(ll.after!==CH||!ll.rungTop||ll.need!==15||ll.minSets!==2) err('verrou leste : 2 x 15 a l assise la plus basse, '+JSON.stringify(ll));
   if(c.fb!=='box-squat'||l.fb!=='box-squat') err('repli douleur : le box squat, a deux jambes');
   eq(NEEDS[CL],['kb'],'besoin de la version lestee');
   if(NEEDS[CH]) err('la version au poids du corps ne declare aucun besoin');
   eq(SUBS.legs[iL],[CH],'sans kettlebell, la version lestee se replie sur le poids du corps');
   if(SUBS.legs[iC]) err('aucun substitut sur la version au poids du corps');
   SLOT_ORDER.forEach(sl=>{ if(SCHEMA[sl].length!==SLOTS[sl].pool.length) err('SCHEMA.'+sl+' desaligne de son vivier'); });
   if(SCHEMA.legs[iC]!=='squat unilatéral'||SCHEMA.legs[iL]!=='squat unilatéral chargé') err('schemas de l escalier du squat');
   const C=SLOTS.core.pool, S=SCHEMA.core;
   eq(C.map(id=>S[C.indexOf(id)]),['gainage antérieur','gainage antérieur instable','coordination croisée','gainage latéral','gainage latéral chargé','anti-extension','anti-rotation'],'SCHEMA.core realigne');
   if(S[C.indexOf('bird-dog')]!=='coordination croisée'||S[C.indexOf('dead-bug')]!=='anti-extension') err('le bird-dog et le dead-bug portent leur schema');
   [CH,CL].forEach(id=>{
     if(typeof IMG!=='undefined'&&!IMG[id]) err('illustration absente : '+id);
     if(!DB[id].mat||!DB[id].mat.length) err('materiel absent : '+id);
     if(!DB[id].fin) err('critere de fin de serie absent : '+id);
     ['<b>Genoux :</b>','<b>Dos :</b>','<b>Chaise :</b>','ne roule ni ne pivote','ne bloque pas'].forEach(t=>{ if(DB[id].vig.indexOf(t)<0) err(id+' : consigne absente, '+t); });
     if(!/effleurer l'assise/.test(DB[id].desc.join(' '))) err(id+' : effleurer, pas s asseoir');
   });
   if(!/50 puis 40 cm/.test(c.desc[0])) err('la reference 50 puis 40 cm est ecrite');
   if(!/kettlebells seules/.test(l.vig)) err('la version lestee dit kettlebells seules');
   console.log('catalogue OK : deux echelons sur place, schemas et substituts alignes, SCHEMA.core realigne, fiches completes');
 }

 // 10. le tirage reel ne bouge pas
 /* empreinte de soixante seances a venir, calculee avec la v2.17 sur l etat
    exporte le 15 septembre : les deux positions inserees sont verrouillees,
    le vivier tirable est le meme, la sequence aussi */
 {
   await neuf(3); reel();
   state.slotIdx={push:24,pull:25,legs:24,core:25};
   state.unlocked={'mollets-debout-leste':true,'tractions-assistees-pronation':true,'rdl-kettlebell':true,'gainage-lateral-jambe-levee':true};
   const out=[]; for(let k=0;k<60;k++) out.push(drawAhead(k).join(','));
   let h=0; const txt=out.join('|'); for(let i=0;i<txt.length;i++) h=(h*31+txt.charCodeAt(i))>>>0;
   if(h!==2970376823||txt.length!==3830) err('tirage reel modifie : '+h+' / '+txt.length);
   const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
   const t0=tir(), r0=t0.indexOf('goblet-squat');
   state.unlocked[CH]=true; const t1=tir();
   if(t1.length!==t0.length||t1[r0]!==CH||t1.indexOf('goblet-squat')>=0) err('le squat sur une jambe prend la place exacte du goblet : '+t1.join(','));
   state.unlocked[CL]=true; const t2=tir();
   if(t2.length!==t0.length||t2[r0]!==CL||t2.indexOf(CH)>=0) err('la version lestee prend la place exacte : '+t2.join(','));
   console.log('tirage OK : soixante seances reelles identiques, remplacement sur place a chaque deblocage');
 }

 // 11. porte kbTop : la kettlebell la plus lourde, jouee
 {
   await neuf(3); reel(); state.unlocked['rdl-kettlebell']=true;
   const L=fixedLadder('goblet-squat',state.gear).map(x=>x.v);
   eq(L,[10,12,14,16,18,20,22],'echelle du goblet squat inchangee');
   vierge('goblet-squat');
   joue('goblet-squat',10,[15,15,15]); checkUnlocks(3,false);
   if(state.unlocked[CH]) err('ouvert a 10 kg alors que la 16 est declaree');
   joue('goblet-squat',14,[15,15,15]); checkUnlocks(3,false);
   if(perfOf('goblet-squat').load!==16) err('temoin : la seance a 14 kg fait monter a 16');
   if(perfOf('goblet-squat').setsLoad!==14) err('la charge jouee s ecrit avec les series : '+perfOf('goblet-squat').setsLoad);
   if(state.unlocked[CH]) err('ouvert sur des series jouees a 14 kg : la porte lit la charge d apres progression');
   html=''; showFiche(CH);
   if(html.indexOf('Palier joué : <b>KB 10 kg + lestes 4 kg</b> (il faut <b>KB 16 kg</b>)')<0) err('le bloc Verrou dit le palier joue et le palier exige');
   const m=(joue('goblet-squat',16,[15,15,14]),checkUnlocks(3,false));
   if(!state.unlocked[CH]) err('ferme a 16 kg avec deux series de 15');
   if(!m.length) err('le deblocage doit s annoncer');
   if(!estRetire('goblet-squat')) err('le goblet squat quitte le tirage');
   /* sans palier ecrit, la porte reste fermee : performance anterieure */
   delete state.unlocked[CH];
   const g=perfOf('goblet-squat'); g.load=16; g.sets=[15,15,15]; delete g.setsLoad; delete g.lightSets; delete g.unqualSets;
   checkUnlocks(3,false);
   if(state.unlocked[CH]) err('porte ouverte sans palier ecrit');
   html=''; showFiche(CH);
   if(html.indexOf('Le palier de ce passage n\\'a pas été enregistré')<0) err('le bloc Verrou dit que le palier manque');
   /* inventaire a une seule kettlebell : elle est la plus lourde */
   state.gear.kbs={'10':1}; syncProfil();
   joue('goblet-squat',10,[15,15,15]); checkUnlocks(3,false);
   if(!state.unlocked[CH]) err('un inventaire a 10 kg ouvre a 10 kg');
   /* aucune kettlebell : rien a exiger, porte fermee */
   delete state.unlocked[CH]; state.gear.kbs={}; syncProfil();
   const q=perfOf('goblet-squat'); q.setsLoad=10; q.sets=[15,15,15];
   checkUnlocks(3,false);
   if(state.unlocked[CH]) err('porte ouverte sans kettlebell declaree');
   console.log('porte kbTop OK : fermee a 10 et sur la montee de 14 a 16, ouverte a 16, fermee sans palier ecrit, inventaire pauvre ouvert');
 }

 // 12. le defaut du dernier cran, reproduit
 /* v2.5 a v2.17 : deux series de 25 a l avant-dernier cran des mollets
    lestes montaient la charge au dernier, et la porte lisait cette charge */
 {
   await neuf(3); reel();
   state.unlocked['mollets-debout-leste']=true;
   const L=fixedLadder('mollets-debout-leste',state.gear).map(x=>x.v);
   if(L.length<3) err('temoin : echelle du sac a trois barreaux au moins, '+L.join(','));
   vierge('mollets-debout-leste');
   joue('mollets-debout-leste',L[L.length-2],[25,25]); checkUnlocks(3,false);
   if(perfOf('mollets-debout-leste').load!==L[L.length-1]) err('temoin : montee au dernier cran');
   if(state.unlocked['mollets-une-jambe']) err('ouvert sur des series jouees a l avant-dernier cran');
   joue('mollets-debout-leste',null,[25,25]); checkUnlocks(3,false);
   if(!state.unlocked['mollets-une-jambe']) err('ferme au dernier cran joue');
   state.unlocked['pont-fessier-leste']=true;
   const H=fixedLadder('pont-fessier-leste',state.gear).map(x=>x.v);
   vierge('pont-fessier-leste');
   joue('pont-fessier-leste',H[0],[20,20,20]); checkUnlocks(3,false);
   if(H.length>1&&state.unlocked['pont-fessier-une-jambe']) err('pont : ouvert sur la montee vers le dernier cran');
   console.log('dernier cran OK : les series jouees sous le dernier cran n ouvrent plus rien');
 }

 // 13. palier d assise : montee, grace, descente, plafond
 {
   await neuf(3); reel(); state.unlocked['rdl-kettlebell']=true; state.unlocked[CH]=true;
   const e=DB[CH], q=vierge(CH);
   if(q.assise!=null) err('position absente au depart : migration neutre');
   if(assiseOf(CH,q)!==50) err('le premier cran vaut 50 cm');
   eq(baseReps(e,q),[8,15],'fourchette du premier cran');
   q.target=15;   /* cible haute avant la montee : le retour au bas doit se voir */
   let m=joue(CH,null,[15,15]);
   if(q.assise!==40||q.target!==8||!q.grace||q.range.join('-')!=='8-15') err('montee : 40 cm, cible au bas, grace, '+JSON.stringify(q));
   if(q.setsRung!==50) err('le cran joue s ecrit avec les series : '+q.setsRung);
   if(!/assise à 40 cm, retour à 8 par côté/.test(m.join(' '))) err('message de montee : '+m.join(' | '));
   if(state.loadUps<1) err('une montee d assise compte comme une montee');
   applyProgress(CH,[5,5],true,false,false);
   if(q.assise!==40) err('la grace protege le premier passage a 40 cm');
   m=applyProgress(CH,[5,5],true,false,false);
   if(q.assise!==50) err('deux passages sous le plancher : la chaise remonte');
   if(!/retour à l'assise de 50 cm/.test(m.join(' '))) err('message de descente : '+m.join(' | '));
   q.assise=40; q.range=[8,15];
   m=joue(CH,null,[15,15]);
   if(q.assise!==40||q.target!==15) err('au dernier cran : plafond, cible au haut');
   if(!/Plafond atteint/.test(m.join(' '))||!/version lestée prend le relais/.test(m.join(' '))) err('plafond et marche suivante : '+m.join(' | '));
   if(!estMontee({assise:40},{assise:50},e)||estMontee({assise:50},{assise:40},e)) err('le sens se lit sur le cran, pas sur la valeur');
   if(!palierUp(CH,50,40)||palierUp(CH,40,50)) err('descendre la chaise est une montee');
   if(palierLbl(CH,40)!=='assise à 40 cm') err('etiquette de palier : '+palierLbl(CH,40));
   if(palierVal(CH,{sets:[9,9],rng:[8,15]})!==50) err('un passage sans it.assise a ete joue au premier cran');
   /* fiche et ecran, sur un historique joue a 50 alors que la chaise est a 40 */
   state.hist=[{date:new Date().toISOString(),type:'alterne',mode:'alterne',items:[{id:CH,sets:[15,15],load:0,rng:[8,15],assise:50}]}];
   q.assise=40; q.sets=[15,15];
   if(palierVal(CH,state.hist[0].items[0])!==50) err('palier d un passage');
   if(!/assise 50 cm/.test(lastLevel(CH,q))) err('derniere fois : l assise jouee se dit quand elle differe');
   if(playedLabel(CH,q)!==', assise 50 cm') err('niveau joue : '+playedLabel(CH,q));
   if(!/assise 50 cm/.test(tenueTag(state.hist[0].items[0]))) err('etiquette de passage');
   if(ficheDerniere(CH)!=='Dernière fois : 15/15, assise 50 cm') err('fiche : '+ficheDerniere(CH));
   html=''; showFiche(CH);
   if(html.indexOf('Fourchette de travail : 8-15 reps, assise à 40 cm')<0) err('la fiche dit le cran courant');
   if(html.indexOf('assise 50 cm · 8-15')<0||html.indexOf('assise 40 cm · 8-15')<0) err('la fiche montre les deux crans');
   view='home'; startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:CH,key:CH,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:CH,key:CH,set:2,of:2,round:2}];
   cur.i=0; renderSession();
   if(!/<b class="num">40 cm<\\/b><span>Assise<\\/span>/.test(html)) err('l ecran de serie porte l assise a regler');
   if(/Tenue<\\/span>/.test(html)) err('pas de barreau de tenue sur une assise');
   console.log('assise OK : montee a 40 cm, grace, remontee a 50, plafond, sens, journal, fiche et ecran');
 }

 // 14. fin de seance : l assise jouee s historise avant progression
 {
   await neuf(2); reel(); state.unlocked['rdl-kettlebell']=true; state.unlocked[CH]=true;
   const q=vierge(CH);
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:CH,key:CH,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:CH,key:CH,set:2,of:2,round:2}];
   cur.i=0; renderSession();
   let garde=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length){
     if(++garde>40) err('boucle de seance non bornee');
     const st=cur.steps[cur.i]; if(!st) break;
     if(st.k!=='set'){ nextStep(); continue; }
     st.val=15; st.done=true;
     validateSet();
   }
   for(let i=0;i<80;i++) await Promise.resolve();
   const h=state.hist[state.hist.length-1];
   const it=h&&h.items.find(x=>x.id===CH);
   if(!it) err('passage non historise');
   if(it.assise!==50) err('it.assise ecrit avant progression : '+JSON.stringify(it));
   if(perfOf(CH).assise!==40) err('la seance fait descendre la chaise a 40 cm');
   const c=(cur&&cur.climbs||[]).find(x=>x.id===CH);
   if(!c) err('la montee d assise se propose au recapitulatif');
   holdClimb(cur.climbs.indexOf(c));
   if(assiseOf(CH,perfOf(CH))!==50||perfOf(CH).assise!=null) err('tenir ce palier ramene a 50 cm, position absente comme avant la seance : '+perfOf(CH).assise);
   console.log('fin de seance OK : it.assise avant progression, montee proposee, tenir ce palier la defait');
 }

 // 15. porte rungTop et echelle en kettlebells seules
 {
   await neuf(3); reel(); state.unlocked['rdl-kettlebell']=true; state.unlocked[CH]=true;
   vierge(CH);
   joue(CH,null,[15,15]); checkUnlocks(3,false);
   if(perfOf(CH).assise!==40) err('temoin : montee a 40 cm');
   if(state.unlocked[CL]) err('version lestee ouverte sur des series jouees a 50 cm');
   html=''; showFiche(CL);
   if(html.indexOf('Palier joué : <b>assise 50 cm</b> (il faut <b>assise 40 cm</b>)')<0) err('le bloc Verrou dit l assise jouee et l assise exigee');
   joue(CH,null,[15,14]); checkUnlocks(3,false);
   if(state.unlocked[CL]) err('une seule serie a 15 ne suffit pas');
   joue(CH,null,[15,15]); checkUnlocks(3,false);
   if(!state.unlocked[CL]) err('ferme a 40 cm avec deux series de 15');
   if(!estRetire(CH)) err('le squat sur une jambe quitte le tirage');
   eq(fixedLadder(CL,state.gear).map(x=>x.v),[10,16],'kettlebells seules, 10 puis 16');
   if(fixedLadder(CL,state.gear).some(x=>/leste/.test(x.lbl))) err('aucun leste sur cette echelle');
   const q=vierge(CL);
   if(q.load!==10) err('depart a 10 kg');
   let m=joue(CL,null,[15,15]);
   if(q.load!==16) err('10 puis 16, sans barreau intermediaire : '+q.load);
   m=joue(CL,null,[15,15]);
   if(q.load!==16||!/déclare une kettlebell de 20 kg/.test(m.join(' '))) err('sommet : la kettlebell suivante a declarer, '+m.join(' | '));
   q.load=16; joue(CL,null,[3,3]); m=applyProgress(CL,[3,3],true,false,false);
   if(q.load!==10) err('descente vers la kettlebell inferieure : '+q.load);
   /* le repli douleur se lit sur la fiche : le box squat, a deux jambes */
   html=''; showFiche(CL);
   if(html.indexOf('onclick="showFiche(\\'box-squat\\'')<0) err('la fiche lestee propose le box squat en repli');
   const iL=SLOTS.legs.pool.indexOf(CL);
   if(resolvePos('legs',iL,state.gear)!==CL) err('avec kettlebell, la position sert la version lestee');
   state.gear.res.kb=0; syncProfil();
   if(resolvePos('legs',iL,state.gear)!==CH) err('sans kettlebell, la version au poids du corps');
   console.log('porte rungTop OK : fermee sur la montee vers 40 cm, ouverte a 40 cm, echelle 10 puis 16, repli sans kettlebell');
 }

 // 16. fiche : le niveau joue, sur les autres modes
 {
   await neuf(3); reel();
   const passe=(id,it)=>{ state.hist=[{date:new Date().toISOString(),type:'alterne',mode:'alterne',items:[Object.assign({id:id},it)]}]; };
   let q=vierge('goblet-squat'); q.load=12; q.sets=[15,15,15];
   passe('goblet-squat',{sets:[15,15,15],load:10});
   if(ficheDerniere('goblet-squat')!=='Dernière fois : 15/15/15 à KB 10 kg') err('goblet : '+ficheDerniere('goblet-squat'));
   q=vierge('developpe-sol'); q.load=9.5; q.sets=[15,12,12];
   passe('developpe-sol',{sets:[15,12,12],load:9});
   if(ficheDerniere('developpe-sol')!=='Dernière fois : 15/12/12 à 9 kg') err('developpe : '+ficheDerniere('developpe-sol'));
   q=vierge('pallof-press'); q.band='violet'; q.sets=[12,12];
   passe('pallof-press',{sets:[12,12],load:0,band:'noir'});
   if(ficheDerniere('pallof-press')!=='Dernière fois : 12/12, '+bandLabel('noir')) err('pallof : '+ficheDerniere('pallof-press'));
   q=vierge('bird-dog'); q.tenue=6; q.range=[4,8]; q.sets=[8,8];
   passe('bird-dog',{sets:[8,8],load:0,rng:[6,12],tenue:3});
   if(ficheDerniere('bird-dog')!=='Dernière fois : 8/8 à 3 s') err('bird-dog : '+ficheDerniere('bird-dog'));
   /* un passage remplace par son repli ne compte pas */
   q=vierge('goblet-squat'); q.load=12; q.sets=[15,15,15];
   state.hist=[{date:new Date().toISOString(),items:[{id:'goblet-squat',sets:[15,15,15],load:10}]},
               {date:new Date().toISOString(),items:[{id:'box-squat',from:'goblet-squat',sets:[10,10,10],load:0}]}];
   if(ficheDerniere('goblet-squat')!=='Dernière fois : 15/15/15 à KB 10 kg') err('passage remplace : '+ficheDerniere('goblet-squat'));
   /* sans historique, le niveau courant, comme avant */
   state.hist=[];
   if(ficheDerniere('goblet-squat')!=='Dernière fois : 15/15/15 à KB 10 kg + lestes 2 kg') err('sans historique : '+ficheDerniere('goblet-squat'));
   console.log('fiche OK : charge, bande et tenue jouees, repli ignore, niveau courant sans historique');
 }

 // 17. marches ecrites
 {
   await neuf(3); reel();
   if(!/squat sur une jambe vers la chaise prend le relais/.test(nextFor('goblet-squat',state.gear))) err('le goblet squat nomme son successeur');
   state.gear.kbs={'10':1}; syncProfil();
   if(nextFor('goblet-squat',state.gear)!==DB['goblet-squat'].next) err('le successeur ne depend pas de l inventaire');
   reel();
   if(KB_NEXT.indexOf('goblet-squat')>=0||KB_NEXT.indexOf(CL)<0) err('KB_NEXT : goblet sorti, version lestee entree');
   if(!/déclare une kettlebell de 20 kg/.test(nextFor(CL,state.gear))) err('version lestee : la kettlebell suivante');
   KB_W.forEach(w=>{ state.gear.kbs[w]=1; }); syncProfil();
   if(!/sac lesté porté devant/.test(nextFor(CL,state.gear))) err('liste epuisee : le sac porte devant');
   if(!/version lestée prend le relais/.test(DB[CH].next)) err('le squat sur une jambe nomme sa version lestee');
   const f=DB['fentes-arriere-lestee'].next;
   if(!/squat bulgare avec haltères, en repartant vers 5 kg par main/.test(f)||/fentes bulgares plus tard/.test(f)) err('fentes lestees : '+f);
   console.log('marches OK : goblet vers le squat sur une jambe, version lestee composee depuis l inventaire, fentes vers le bulgare leste');
 }

 console.log('TESTS LOT V2.18 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error((e.stack||'').split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
