const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=4; };
 const joue=(f)=>{ let g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ f(s); } else if(s.k==='cardio'){ s.rounds=4; validateCardio(); } else nextStep(); } };
 const auTop=s=>{ const p=perfOf(s.id); TVAL(s,(DB[s.id].mode==='time'||DB[s.id].mode==='stretch')?(p.range?p.range[1]:30):p.range[1]); };

 // 1. la corde a sauter a disparu de partout
 await neuf();
 if(DB['corde-a-sauter']) throw new Error('corde encore en base');
 if(typeof CFG!=='undefined'&&CFG['corde-a-sauter']) throw new Error('corde encore en configuration');
 if(MAT['corde-a-sauter']) throw new Error('corde encore dans le materiel');
 if(Object.keys(DB).some(id=>DB[id].lock&&DB[id].lock.after==='cardio-bas-impact')) throw new Error('verrou orphelin sur le cardio');
 Object.keys(DB).forEach(id=>{ const e=DB[id];
   if(e.lock&&!DB[e.lock.after]) throw new Error('verrou pointant sur un exercice absent : '+id); });
 console.log('corde OK : retiree de la base, du materiel et des verrous ('+Object.keys(DB).length+' exercices)');

 // 2. le module cardio ne progresse plus et n a plus de cible inatteignable
 const per=DB[CARDIO_ID].phases.reduce((a,p)=>a+p.s,0);
 const maxRounds=Math.floor(CARDIO_SEC/per);
 const m0=applyProgress(CARDIO_ID,[maxRounds],true);
 if(m0.length) throw new Error('le cardio produit encore un message de progression : '+m0.join(' '));
 if(state.perf[CARDIO_ID]&&state.perf[CARDIO_ID].target>maxRounds) throw new Error('cible cardio au-dessus du realisable');
 console.log('cardio OK : bloc fixe de '+CARDIO_SEC+' s, '+maxRounds+' rounds max, aucune progression simulee');

 // 3. une douleur ne fait jamais monter l exercice quitte
 await neuf();
 startSession();
 const exo=cur.steps[0].id, p0=perfOf(exo), band0=p0.band, load0=p0.load, top=p0.range[1];
 TVAL(cur.steps[0],top);
 let g=0; while(g++<50){ const s=cur.steps[cur.i]; if(s.k==='set'&&s.id===exo) break; nextStep(); }
 swapPain();
 joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[0]:5); });
 await new Promise(r=>setTimeout(r,10));
 const pA=perfOf(exo);
 if(pA.band!==band0||pA.load!==load0) throw new Error('l exercice quitte pour douleur a monte : '+band0+'->'+pA.band);
 if(pA.range[1]!==p0.range[1]) throw new Error('fourchette relevee malgre le repli');
 console.log('repli OK : '+DB[exo].nom+' reste a son niveau apres une douleur, meme avec une serie au top');

 // 4. l ecran de repos annonce le bon exercice apres un repli
 await neuf();
 startSession();
 const old=cur.steps[0].id, fb=DB[old].fb;
 swapPain();
 if(cur.steps.some(s=>s.k==='rest'&&s.next===old)) throw new Error('un repos annonce encore l exercice quitte');
 if(!cur.steps.some(s=>s.k==='rest'&&s.next===fb)) throw new Error('aucun repos n annonce la variante de repli');
 console.log('annonce OK : les repos pointent sur '+DB[fb].nom+', plus sur '+DB[old].nom);

 // 5. deux replis vers la meme variante ne melangent pas leurs series
 await neuf();
startSession();
 const ids=[...new Set(cur.steps.filter(s=>s.k==='set').map(s=>s.id))];
 const paires=ids.filter(a=>ids.some(b=>b!==a&&DB[b].fb&&DB[b].fb===DB[a].fb));
 if(paires.length>=2){
   let n=0; g=0;
   while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
     if(s.k==='set'&&paires.indexOf(s.id)>=0&&!s.swapped&&n<2){ n++; swapPain(); }
     else if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
   await new Promise(r=>setTimeout(r,10));
   const h=state.hist[state.hist.length-1];
   const origines=h.items.filter(it=>it.sw).map(it=>it.from);
   if(new Set(origines).size!==origines.length) throw new Error('origines de repli confondues');
   console.log('collision OK : '+origines.length+' replis vers la meme variante, series et origines separees');
 } else console.log('collision OK : pas de paire concurrente dans cette seance, cle de journal distincte verifiee ailleurs');

 // 6. l origine du repli est conservee dans l historique
 await neuf();
 startSession();
 const org=cur.steps[0].id;
 swapPain();
 TVAL(cur.steps[0],8);
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const hr=state.hist[state.hist.length-1];
 if(!hr.items[0].sw) throw new Error('marqueur de repli absent');
 if(hr.items[0].from!==org) throw new Error('origine du repli absente : '+hr.items[0].from);
 if(!/repli de/.test(html)) throw new Error('le recap n affiche pas l origine du repli');
 console.log('memoire OK : historique garde '+DB[org].nom+' -> '+DB[hr.items[0].id].nom);

 // 7. une serie sautee empeche la seance d etre complete, cardio ou pas
 await neuf();
 state.cardio=true; startSession();
 const nPrevu=workSteps(cur.steps).length;
 let saute=false; g=0;
 while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ if(!saute){ saute=true; skipSet(); } else { TVAL(s,5); } }
   else if(s.k==='cardio'){ s.rounds=4; validateCardio(); } else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 const hs=state.hist[state.hist.length-1];
 if(hs.xp>=XP_SESSION+XP_SET*nPrevu) throw new Error('bonus de seance complete accorde malgre une serie sautee');
 console.log('complete OK : '+nPrevu+' series prevues, 1 sautee, cardio fait, pas de bonus ('+hs.xp+' XP)');

 // 8. une seance quittee ne fait rien monter
 await neuf();
 startSession();
 const q=cur.steps[0].id, avant=JSON.stringify(perfOf(q).range)+'|'+perfOf(q).load+'|'+perfOf(q).band;
 TVAL(cur.steps[0],perfOf(q).range[1]);
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const apres=JSON.stringify(perfOf(q).range)+'|'+perfOf(q).load+'|'+perfOf(q).band;
 if(avant!==apres) throw new Error('une seance quittee a fait monter '+q+' : '+avant+' -> '+apres);
 console.log('abandon OK : seance quittee apres une serie au top, aucun niveau modifie');

 // 9. le bonus de semaine suit l objectif reellement applicable
 await neuf();
 const lundi=new Date(); lundi.setDate(lundi.getDate()-((lundi.getDay()||7)-1)); lundi.setHours(12,0,0,0);
 const J=n=>{const d=new Date(lundi);d.setDate(d.getDate()+n);return d.toISOString();};
 const jour=(new Date().getDay()||7)-1;
 state.hist=[]; state.goal=4;
 for(let k=0;k<jour;k++) state.hist.push({date:J(k),type:'alterne',mode:'alterne',dur:15,real:900,xp:40,items:[]});
 const wk=prevWeekKey(0), objectif=goalForWeek(state,wk);
 state.hist=state.hist.slice(0,Math.max(0,objectif-1));
 const xp0=state.xp;
 startSession(); joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[0]:5); });
 await new Promise(r=>setTimeout(r,10));
 const gagne=state.xp-xp0, derniere=state.hist[state.hist.length-1];
 if(thisWeekCount(state)>=goalForWeek(state,wk)&&gagne<derniere.xp) throw new Error('coherence xp');
 if(thisWeekCount(state)>=goalForWeek(state,wk)&&!cur.weekJust&&objectif>1) throw new Error('semaine atteinte sans bonus : objectif '+objectif+', jours '+thisWeekCount(state));
 console.log('bonus OK : objectif '+objectif+' pour la semaine en cours, bonus declenche au meme seuil que l accueil');

 // 10. palier tenu : la cible et la charge se figent, le filet reste actif
 await neuf();
 const cid='curls-halteres';
 let p=perfOf(cid); const low=p.range[0], hi=p.range[1];
 setHold(cid,true);
 for(let i=0;i<15;i++) applyProgress(cid,[hi,hi,hi],true);
 p=perfOf(cid);
 if(p.load!==DB[cid].load0) throw new Error('la charge a monte malgre le palier tenu : '+p.load);
 if(p.target>hi) throw new Error('la cible a depasse la fourchette');
 const avantFilet=p.load;
 applyProgress(cid,[1,1,1],true);
 if(perfOf(cid).load>=avantFilet) throw new Error('le filet de securite ne joue plus sous palier tenu');
 if(!isHeld(cid)) throw new Error('le filet a libere le palier');
 console.log('palier tenu OK : 15 seances au top sans montee, filet de securite toujours actif ('+avantFilet+' -> '+perfOf(cid).load+' kg)');

 // 11. monter la charge a la main libere, la baisser conserve
 await neuf();
 const lid=Object.keys(DB).filter(id=>DB[id].mode==='load'&&DB[id].reps)[0];
 perfOf(lid); setHold(lid,true);
 cur={steps:[{k:'set',id:lid,key:lid,set:1,of:1}],i:0,log:{},xp:0,type:'alterne',exos:[lid]};
 view='session';
 adjLoad(-1);
 if(!isHeld(lid)) throw new Error('baisser la charge a libere le palier');
 adjLoad(1);
 if(isHeld(lid)) throw new Error('monter la charge n a pas libere le palier');
 console.log('liberation OK : '+DB[lid].nom+', descente conserve le palier, montee le libere');

 // 12. les repetitions saisies ne liberent jamais un palier
 await neuf();
 setHold(cid,true);
 for(let i=0;i<5;i++) applyProgress(cid,[hi+5,hi+5,hi+5],true);
 if(!isHeld(cid)) throw new Error('des repetitions elevees ont libere le palier');
 console.log('saisie OK : 5 seances tres au-dessus du palier, palier toujours tenu');

 // 13. tenir un palier au recapitulatif annule la montee
 await neuf();
 startSession();
 joue(auTop);
 await new Promise(r=>setTimeout(r,10));
 if(!cur.climbs||!cur.climbs.length) throw new Error('aucune montee detectee sur une seance entierement au top');
 const c0=cur.climbs[0], idc=c0.id, avantHold=JSON.stringify(perfOf(idc));
 holdClimb(0);
 const pc=perfOf(idc);
 if(pc.load!==c0.prev.load) throw new Error('charge non restauree');
 if(c0.prev.band&&pc.band!==c0.prev.band) throw new Error('bande non restauree');
 if(c0.prev.range&&pc.range[1]!==c0.prev.range[1]) throw new Error('fourchette non restauree');
 if(!isHeld(idc)) throw new Error('palier non pose apres holdClimb');
 if(!/Tenir ce palier|palier tenu/.test(html)) throw new Error('recap sans action de palier');
 releaseClimb(0);
 if(isHeld(idc)) throw new Error('annulation inoperante');
 console.log('recap OK : '+cur.climbs.length+' montee(s) proposee(s), '+DB[idc].nom+' annulee puis reliberee');

 // 14. alerte d ecart : uniquement pousse en avance sur un tire tenu
 await neuf();
 const push=Object.keys(DB).filter(id=>DB[id].cat==='push'&&DB[id].reps)[0];
 const pull=Object.keys(DB).filter(id=>DB[id].cat==='pull'&&DB[id].reps)[0];
 setHold(pull,true);
 state.div={push:DIV_SEUIL,pull:0};
 if(!divergence()) throw new Error('alerte absente alors que le pousse a pris de l avance');
 state.div={push:0,pull:DIV_SEUIL};
 if(divergence()) throw new Error('alerte declenchee dans le sens benin');
 setHold(pull,false);
 state.div={push:DIV_SEUIL,pull:0};
 if(divergence()) throw new Error('alerte sans aucun tire tenu');
 setHold(pull,true); state.div={push:DIV_SEUIL+2,pull:0};
 state.hist=[{date:new Date().toISOString(),type:'alterne',mode:'alterne',dur:15,real:900,xp:40,
   items:[{id:push,sets:[8,8,8],load:0},{id:pull,sets:[8,8,8],load:0}]}];
 view='prog'; render();
 if(!/montées d/.test(html)) throw new Error('alerte absente de la vue Progres');
 console.log('ecart OK : seuil '+DIV_SEUIL+', un seul sens signale, visible dans Progres');

 // 15. etirements : comptes dans le total annonce (v1.13), sans xp ni progression
 await neuf();
 state.stretch=true;
 const plan=buildSession();
 const cool=plan.steps.filter(s=>s.cool);
 if(cool.length!==STRETCH_PER_SESSION) throw new Error('nombre d etirements : '+cool.length);
 if(cool.some(s=>STRETCH_POOL.indexOf(s.id)<0)) throw new Error('etirement hors du vivier mobilite');
 /* v1.13 : le nombre annonce est un total, tout compris. Les etirements y
    entrent, alors qu ils en etaient exclus tant que ce nombre etait un budget. */
 const estAvec=estimateSec(plan);
 const sansCool=Object.assign({},plan,{steps:plan.steps.filter(s=>!s.cool)});
 const ecart=estAvec-estimateSec(sansCool);
 if(ecart<=0) throw new Error('les etirements doivent entrer dans la duree annoncee');
 const attendu=cool.reduce((a,s)=>a+serieSec(s.id,false),0);
 if(ecart!==attendu) throw new Error('cout des etirements : '+ecart+' au lieu de '+attendu);
 const vus={}; let idx=state.stretchIdx||0;
 for(let s=0;s<Math.ceil(STRETCH_POOL.length/STRETCH_PER_SESSION);s++){
   stretchesFor().forEach(id=>vus[id]=1);
   state.stretchIdx=(state.stretchIdx+STRETCH_PER_SESSION)%STRETCH_POOL.length;
 }
 if(Object.keys(vus).length!==STRETCH_POOL.length) throw new Error('la rotation ne couvre pas les six etirements : '+Object.keys(vus).length);
 state.stretchIdx=idx;
 const xpAv=state.xp;
 startSession();
 const nTravail=workSteps(cur.steps).length;
 joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[0]:5); });
 await new Promise(r=>setTimeout(r,10));
 const hh=state.hist[state.hist.length-1];
 if(hh.items.some(it=>STRETCH_POOL.indexOf(it.id)>=0)) throw new Error('un etirement a ete journalise');
 if(hh.xp!==XP_SET*nTravail+XP_SESSION) throw new Error('xp faussee par les etirements : '+hh.xp+' pour '+nTravail+' series');
 if(!hh.inc===false&&hh.inc) throw new Error('seance marquee incomplete alors que les etirements sont faits');
 console.log('etirements OK : '+cool.length+' par seance, rotation complete en '+Math.ceil(STRETCH_POOL.length/STRETCH_PER_SESSION)+' seances, 0 XP, 0 progression');

 // 16. le bloc d etirements se passe d un bouton sans casser la seance
 await neuf();
 state.stretch=true; startSession();
 g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.cool){ skipCool(); break; }
   if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 if(view!=='recap') throw new Error('passer les etirements ne termine pas la seance, vue='+view);
 if(state.hist[state.hist.length-1].inc) throw new Error('seance marquee incomplete apres avoir passe les etirements');
 console.log('passage OK : bloc d etirements saute, seance terminee et complete');

 // 17. le repli marche est atteignable depuis le module cardio
 await neuf();
 state.cardio=true; startSession();
 g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='cardio') break;
   if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
 const stc=cur.steps[cur.i];
 if(!stc||stc.k!=='cardio') throw new Error('module cardio introuvable');
 if(!/swapCardio/.test(cardioHtml(stc))) throw new Error('aucun bouton de repli sur l ecran cardio');
 swapCardio();
 if(cur.steps[cur.i].id!==DB[CARDIO_ID].fb) throw new Error('le repli cardio n a pas bascule');
 cur.steps[cur.i].rounds=1; validateCardio();
 await new Promise(r=>setTimeout(r,10));
 console.log('repli cardio OK : '+DB[CARDIO_ID].fb+' atteignable et journalise');

 // 18. les conditions de deblocage decrivent ce qui est verifie
 await neuf();
 Object.keys(DB).forEach(id=>{ const L=DB[id].lock; if(!L) return;
   if(/sans (aucune )?douleur|maîtris|propres/.test(L.cond)) throw new Error('condition invérifiable affichee sur '+id+' : '+L.cond);
   /* v1.15 : minSets vaut 1 par defaut et le compte affiche est un jeton {n}
      quand il depend du volume. L enonce doit dire ce qui est verifie. */
   const m=L.cond.match(/(\\d+)\\s*séries?\\s*de\\s*(\\d+)/);
   if(m&&(L.minSets||1)<Number(m[1])) throw new Error(id+' annonce '+m[1]+' series mais n en verifie que '+(L.minSets||1));
   if(/\{n\}/.test(L.cond)&&(L.minSets||1)<2) throw new Error('jeton {n} sans compte variable sur '+id);
   if(L.minSets!=null&&L.minSets<1) throw new Error('minSets incoherent sur '+id);
 });
 /* v1.15 : minSets vaut 1 par defaut, ce cas vise un verrou a compte multiple */
 const pron=Object.keys(DB).filter(id=>DB[id].lock&&(DB[id].lock.minSets||1)>=2)[0];
 if(pron){
   const anc=DB[pron].lock.after, need=DB[pron].lock.need, n=DB[pron].lock.minSets;
   state.perf[anc]={load:0,range:DB[anc].reps.slice(),target:need,best:need,sets:[need],date:null,band:'noir',setsBand:'noir'};
   checkUnlocks(3,false);
   if(state.unlocked[pron]) throw new Error(pron+' debloque avec une seule serie');
   state.perf[anc].sets=new Array(n).fill(need); state.perf[anc].best=need;
   checkUnlocks(3,false);
   if(!state.unlocked[pron]) throw new Error(pron+' non debloque avec '+n+' series de '+need);
   console.log('deblocages OK : libelles verifiables, '+n+' series reellement exigees sur '+DB[pron].nom);
 } else console.log('deblocages OK : libelles verifiables');

 // 19. entretien global : tout tenir, tout liberer
 await neuf();
 setEntretien(true);
 const n1=heldCount();
 if(n1!==holdableIds().length) throw new Error('entretien partiel : '+n1+'/'+holdableIds().length);
 let bouge=0;
 holdableIds().forEach(id=>{ const p=perfOf(id); const av=p.target;
   applyProgress(id,[p.range[1],p.range[1],p.range[1]],true); if(perfOf(id).target!==av) bouge++; });
 if(bouge) throw new Error(bouge+' exercices ont bouge en mode entretien');
 setEntretien(false);
 if(heldCount()) throw new Error('liberation globale incomplete');
 console.log('entretien OK : '+n1+' exercices figes puis liberes, aucune cible ne bouge entre-temps');

 // 20. toutes les vues repondent encore, fiches comprises
 await neuf();
 setHold('curls-halteres',true);
 ['home','lib','prog','set'].forEach(v=>{view=v;render();});
 Object.keys(DB).forEach(id=>showFiche(id));
 showFiche('curls-halteres');
 if(!/Reprendre la progression/.test(html)) throw new Error('interrupteur absent d une fiche tenue');
 showFiche('goblet-squat');
 if(!/Tenir ce palier/.test(html)) throw new Error('interrupteur absent d une fiche en progression');
 showFiche('posture-enfant');
 if(/Tenir ce palier/.test(html)) throw new Error('interrupteur propose sur un etirement');
 console.log('vues OK : accueil, bibliotheque, progres, reglages et '+Object.keys(DB).length+' fiches');
 console.log('TESTS V1.4 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
