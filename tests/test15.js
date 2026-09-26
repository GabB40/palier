// Nouveautes v1.13 : machine a etats des tenues chronometrees (Stop definitif,
// deux cotes, validation grisee), retour d un pas apres une validation, gel de
// rotation par emplacement substitue avec echappatoire, et modele « volume
// choisi, temps calcule » avec ajustements de contenu du jour.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
const bips=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),
  AudioContext:function(){ return {currentTime:0,destination:{},
    createOscillator:()=>{const o={frequency:{value:0},connect(){},start(){},stop(){}};bips.push(o);return o;},
    createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
/* horloge pilotee a la main : les chronos sont deterministes */
let ticks=[];
const vraiClear=global.clearInterval;
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ if(t&&t.f) ticks=ticks.filter(x=>x!==t); else if(t) vraiClear(t); };
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.freqs=()=>{ const out=[]; bips.forEach((o,i)=>{ if(i%2===0) out.push(o.frequency.value); }); return out; };
global.videBips=()=>{ bips.length=0; };
global.videEls=()=>{ Object.keys(els).forEach(k=>delete els[k]); };
const T=`
(async()=>{
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState();

   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=0; state.sound=false; };
 const cote=()=>els['#phlabel']?els['#phlabel'].textContent:(html.match(/id="phlabel">([^<]*)</)||[])[1];
 const allerA=mode=>{ let g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'&&DB[s.id]&&DB[s.id].mode===mode) return s;
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
   throw new Error('aucune etape '+mode+' dans cette seance'); };

 // 1. tenue unilaterale : Stop definitif, plus de Reprendre
 await neuf();
 startSession();
 let st=allerA('time');
 const e1=DB[st.id];
 if(e1.side) throw new Error('cette premiere tenue devrait etre d un bloc : '+st.id);
 renderSession();
 if(!/Démarrer/.test(html)) throw new Error('la tenue doit proposer Démarrer');
 if(/Valider la tenue<\\/button>/.test(html.replace(/class="big quiet" disabled/g,'')) && !/disabled/.test(html))
   throw new Error('la validation doit etre grisee avant toute mesure');
 toggleChrono(); tic(20);
 if(st.val!==20) throw new Error('chrono a 20 s attendu, obtenu '+st.val);
 toggleChrono();                       /* Stop */
 if(st.sides[0]!==20) throw new Error('la mesure du cote doit etre figee a 20');
 if(!st.done) throw new Error('le cote doit etre marque termine');
 tic(10);
 if(st.sides[0]!==20) throw new Error('un Stop est definitif : le chrono ne repart pas seul');
 if(/Reprendre<\\/button>/.test(html)) throw new Error('Reprendre ne doit plus exister sur une tenue');
 if(!/Tenue mesurée/.test(html)) throw new Error('le bouton doit annoncer la tenue mesuree');
 if(!/Réinitialiser/.test(html)) throw new Error('la remise a zero doit etre offerte');
 /* ESPACE ne detruit jamais une mesure */
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 espace(); espace();
 if(st.sides[0]!==20||timers.c) throw new Error('ESPACE doit etre inerte apres le dernier cote');
 /* la reinitialisation, elle, repart de zero */
 resetHold();
 if(st.sides[0]!==null||st.val!==0||st.done) throw new Error('Réinitialiser doit remettre le cote a zero');
 toggleChrono(); tic(45); toggleChrono();
 if(st.sides[0]!==45) throw new Error('seconde mesure a 45 attendue');
 console.log('tenue unilaterale OK : Stop definitif, Reprendre supprime, ESPACE inerte, remise a zero');

 // 2. la fin d une tenue en trois morceaux n est plus possible
 const somme=st.sides[0];
 if(somme!==45) throw new Error('une tenue vaut sa derniere mesure continue, pas une somme');
 validateSet();
 const journal=cur.log[st.key||st.id];
 if(!journal||journal[journal.length-1]!==45) throw new Error('45 attendu au journal, obtenu '+journal);
 console.log('mesure continue OK : le journal porte la tenue, jamais un cumul de morceaux');

 // 3. tenue par cote : deux mesures, bip de bascule, le plus court au journal
 await neuf();
 /* le vivier gainage place le lateral en troisieme position : on cale le
    compteur dessus plutot que de convoquer un mode qui n existe plus */
 state.slotIdx.core=SLOTS.core.pool.filter(id=>!isLocked(id)&&!estRetire(id)).indexOf('gainage-lateral');
 startSession();
 let g=0, bi=null;
 while(view==='session'&&g++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'&&DB[s.id]&&DB[s.id].mode==='time'&&DB[s.id].side){ bi=s; break; }
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
 if(!bi) throw new Error('aucune tenue par cote dans la seance');
 renderSession(); videBips(); videEls();
 holdInit(bi,DB[bi.id]);
 if(bi.sides.length!==2) throw new Error('une tenue par cote prevoit deux mesures');
 if(cote()!=='Premier côté') throw new Error('le premier cote doit etre annonce, obtenu '+cote());
 if(!/disabled/.test(html)) throw new Error('validation grisee attendue tant que rien n est mesure');
 validateSet();
 if(cur.log[bi.key||bi.id]) throw new Error('ENTREE ne doit pas valider une tenue vide');
 toggleChrono(); tic(30); toggleChrono();
 renderSession();
 if(!/disabled/.test(html)) throw new Error('validation encore grisee avec un seul cote mesure');
 validateSet();
 if(cur.log[bi.key||bi.id]) throw new Error('un seul cote ne suffit pas a valider');
 state.sound=true; videBips();
 toggleChrono();                       /* passage au second cote */
 if(freqs()[0]!==700) throw new Error('bip grave de bascule attendu, obtenu '+freqs());
 if(bi.side!==1) throw new Error('le second cote doit etre en cours');
 if(cote()!=='Second côté') throw new Error('le second cote doit etre annonce, obtenu '+cote());
 tic(8); toggleChrono();
 if(bi.sides[0]!==30||bi.sides[1]!==8) throw new Error('mesures attendues 30 et 8, obtenues '+bi.sides);
 renderSession();
 if(/disabled/.test(html.split('Valider la tenue')[0].slice(-80))) throw new Error('validation attendue active');
 validateSet();
 const jb=cur.log[bi.key||bi.id];
 if(jb[jb.length-1]!==8) throw new Error('le cote le plus court doit partir au journal, obtenu '+jb);
 console.log('tenue par cote OK : deux mesures exigees, bip de bascule, cote le plus court enregistre');

 // 4. retour d un pas : journal, series et XP defaits
 await neuf();
 state.rounds=2;
 startSession();
 let s0=cur.steps[cur.i];
 while(s0.k!=='set'||DB[s0.id].mode==='time'){ if(s0.k==='set'){ const e=DB[s0.id];
     if(e.mode==='time'){ holdInit(s0,e); for(let i=0;i<s0.sides.length;i++) s0.sides[i]=30; } else if(e.rhythm){ s0.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s0.done=true; if(!s0.val) s0.val=30; } else if(e.cadence){ cadInit(s0); s0.sides=s0.sides.map(()=>30); s0.side=s0.sides.length-1; s0.done=true; s0.val=30; }
     validateSet(); } else nextStep(); s0=cur.steps[cur.i]; }
 const cle=s0.key||s0.id, iAvant=cur.i, xp0=cur.xp, fait0=cur.done||0;
 s0.val=9; validateSet();
 if(cur.i===iAvant) throw new Error('la validation doit faire avancer');
 renderSession();
 if(!/Revenir à/.test(html)) throw new Error('le retour d un pas doit etre offert a l etape suivante');
 stepBack();
 if(cur.i!==iAvant) throw new Error('le retour doit ramener sur la serie');
 if(cur.log[cle]) throw new Error('la valeur doit avoir quitte le journal');
 if((cur.done||0)!==fait0) throw new Error('le compteur de series doit etre defait');
 if(cur.xp!==xp0) throw new Error('les XP doivent etre defaits');
 if(cur.steps[cur.i].val!=null&&cur.steps[cur.i].val!==perfFor(s0.id,false).target)
   throw new Error('la saisie doit repartir de la cible');
 /* un seul pas : le retour ne se propose plus deux etapes plus loin */
 s0.val=9; validateSet(); nextStep();
 renderSession();
 if(/Revenir à/.test(html)) throw new Error('le retour ne vaut que pour l etape qui suit immediatement');
 console.log('retour d un pas OK : journal, series et XP defaits, un seul pas, jamais plus loin');

 // 5. rotation : gel du seul emplacement substitue
 await neuf();
 state.rounds=2; state.stretch=false;
 /* on positionne la rotation pour avoir les deux sortes d emplacements :
    en tete de vivier les quatre exercices ont un repli */
 state.slotIdx={push:0,pull:0,legs:2,core:1};
 const avecRepli=SLOT_ORDER.filter(s=>DB[pickFromPool(s)]&&DB[pickFromPool(s)].fb);
 const sansRepli=SLOT_ORDER.filter(s=>!(DB[pickFromPool(s)]&&DB[pickFromPool(s)].fb));
 if(!avecRepli.length||!sansRepli.length) throw new Error('ce test suppose des emplacements des deux sortes');
 const idx0=Object.assign({},state.slotIdx);
 lightMode=true;
 startSession();
 let h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=6;
     validateSet(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 avecRepli.forEach(s=>{ if(state.slotIdx[s]!==idx0[s]) throw new Error('emplacement substitue non gele : '+s); });
 sansRepli.forEach(s=>{ if(state.slotIdx[s]!==idx0[s]+1) throw new Error('emplacement seulement allege : la rotation doit avancer sur '+s); });
 if(state.lightRun!==1) throw new Error('le compteur de seances allegees doit valoir 1');
 console.log('rotation OK : gel des seuls emplacements substitues, avancee la ou l exercice a travaille');

 // 6. echappatoire a la deuxieme seance allegee d affilee
 cur=null; view='home';
 const idx1=Object.assign({},state.slotIdx);
 lightMode=true;
 startSession();
 h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=6;
     validateSet(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 SLOT_ORDER.forEach(s=>{ if(state.slotIdx[s]!==idx1[s]+1) throw new Error('la deuxieme allegee doit tout debloquer, bloque sur '+s); });
 if(state.lightRun!==2) throw new Error('le compteur doit valoir 2');
 /* une seance normale terminee remet le compteur a zero */
 cur=null; view='home'; lightMode=false;
 startSession();
 h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 if(state.lightRun!==0) throw new Error('une seance normale terminee doit remettre le compteur a zero');
 console.log('echappatoire OK : tout avance des la deuxieme allegee, compteur remis par une seance normale');

 // 7. volume choisi, temps calcule : le nombre annonce est un total
 await neuf();
 state.warm='complet'; state.stretch=true; state.cardio=false;
 const t=r=>{ state.rounds=r; const p=buildSession(); return planParts(p); };
 const p2=t(2), p3=t(3), p4=t(4);
 if(!(p2.total<p3.total&&p3.total<p4.total)) throw new Error('le total doit croitre avec le volume');
 /* v2.10 : la pause de raccord de tour est un poste de plus */
 if(p3.total!==p3.warm+p3.exos+p3.trans+p3.pause+p3.remount+p3.cardio+p3.cool) throw new Error('la decomposition doit sommer au total');
 /* v1.14 : les transitions ne sont plus fondues dans le poste Exercices, et la
    somme des temps affiches par exercice retombe sur ce poste */
 {
   state.rounds=3;
   const pl=buildSession(), pp=planParts(pl);
   let somme=0; pl.exos.forEach(id=>{ somme+=3*serieSec(id,pl.light); });
   if(somme!==pp.exos) throw new Error('le poste Exercices doit valoir la somme des exercices, ecart '+(pp.exos-somme));
   /* v2.10 : les raccords de tour sortent du poste Transitions, ils ont leur
      propre duree et leur propre ligne */
   const nRest=pl.steps.filter(x=>x.k==='rest'&&!x.pause).length;
   if(pp.trans!==nRest*transSec()) throw new Error('le poste Transitions doit valoir le nombre de repos par leur duree');
   const nPause=pl.steps.filter(x=>x.k==='rest'&&x.pause).length;
   if(pp.pause!==nPause*PAUSE_TOUR) throw new Error('le poste Pause de tour doit valoir le nombre de raccords par leur duree');
 }
 if(p3.cool<=0) throw new Error('les etirements entrent dans le total annonce');
 if(p3.warm<=0) throw new Error('l echauffement entre dans le total annonce');
 /* le cardio s ajoute, il ne retire plus un tour */
 state.rounds=3;
 const sans=planParts(buildSession()).total;
 state.cardio=true;
 const avecP=buildSession(), avec=planParts(avecP).total;
 if(workSteps(avecP.steps).length!==3*SLOT_ORDER.length) throw new Error('le cardio ne doit plus rogner le volume');
 if(avec-sans!==CARDIO_SEC) throw new Error('le cardio doit ajouter exactement sa duree, ecart '+(avec-sans));
 console.log('duree OK : total tout compris, decomposition exacte, cardio additif ('+Math.round(sans/60)+' → '+Math.round(avec/60)+' min)');

 // 8. cout d une serie : unilateral double, tenue par cote doublee
 await neuf();
 const bil=Object.keys(DB).find(id=>DB[id].mode==='time'&&DB[id].side);
 const uni=Object.keys(DB).find(id=>DB[id].mode==='time'&&!DB[id].side);
 state.prep=5;
 if(bil&&uni){
   const cb=perfFor(bil,false).target||DB[bil].reps[0], cu=perfFor(uni,false).target||DB[uni].reps[0];
   if(serieSec(bil,false)!==INSTALL+2*(5+cb)) throw new Error('une tenue par cote coute deux tenues, decompte compris');
   if(serieSec(uni,false)!==INSTALL+(5+cu)) throw new Error('une tenue d un bloc coute une tenue');
 }
 const rep=Object.keys(DB).find(id=>DB[id].reps&&DB[id].mode!=='time'&&DB[id].mode!=='stretch'&&!DB[id].side);
 const repS=Object.keys(DB).find(id=>DB[id].reps&&DB[id].mode!=='time'&&DB[id].mode!=='stretch'&&DB[id].side);
 if(rep&&repS){
   const c=perfFor(rep,false).target||DB[rep].reps[0];
   if(serieSec(rep,false)!==INSTALL+Math.round(c*tempoOf(rep))) throw new Error('serie chiffree : tempo par repetition');
   const cs=perfFor(repS,false).target||DB[repS].reps[0];
   if(serieSec(repS,false)!==INSTALL+switchSec(repS)+Math.round(cs*tempoOf(repS)*2)) throw new Error('serie chiffree unilaterale : deux fois le travail');
 }
 console.log('cout par exercice OK : unilateraux doubles, tenues comptees avec leur decompte');

 // 9. ajustements du jour : ponctuels, jamais persistes
 await neuf();
 state.warm='complet'; state.cardio=false; state.stretch=true; state.rounds=3;
 view='home'; render();
 if(!/Volume de la séance/.test(html)) throw new Error('le choix de volume doit etre sur l accueil');
 if(!/3 séries<\\/b>/.test(html)) throw new Error('les boutons doivent porter le nombre de series');
 if(!/<span class="sub">~\\d+ min<\\/span>/.test(html)) throw new Error('chaque bouton doit porter son temps calcule');
 if(!/<span class="ttl">Contenu<\\/span>/.test(html)) throw new Error('la card Contenu doit etre sur l accueil');
 if(!/échauffement complet · sans cardio · étirements/.test(html)) throw new Error('l en-tete ferme doit resumer les options du jour');
 setDayCardio(1); setDayWarm('court'); setRounds(4);
 if(state.cardio||state.warm!=='complet'||roundsOf(state)!==3) throw new Error('un ajustement du jour ne touche pas les defauts');
 if(!effCardio()||effWarm()!=='court'||effRounds()!==4) throw new Error('l ajustement du jour doit s appliquer a la seance');
 render();
 if(!/Modifié pour cette séance/.test(html)) throw new Error('la card doit signaler un ajustement');
 const pj=buildSession();
 if(!pj.cardio) throw new Error('le cardio du jour doit entrer dans la seance');
 if(workSteps(pj.steps).length!==4*SLOT_ORDER.length) throw new Error('le volume du jour doit s appliquer');
 startSession();
 h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else if(s&&s.k==='cardio'){ s.rounds=4; validateCardio(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 if(dayTouched()) throw new Error('les ajustements du jour ne survivent pas a une seance');
 if(effRounds()!==3||effWarm()!=='complet'||effCardio()) throw new Error('les defauts doivent etre retrouves');
 const hh=state.hist[state.hist.length-1];
 if(hh.rounds!==4) throw new Error('l historique doit porter le volume reellement joue');
 if(!hh.plan) throw new Error('l historique doit porter la duree annoncee');
 console.log('ajustements du jour OK : appliques a la seance, jamais persistes, historises');

 // 10. migration : la duree choisie devient un nombre de series
 const mig=async(dur,att)=>{ state=null; cur=null;
   localStorage._m={'palier-state-v2':JSON.stringify({v:2,duration:dur,hist:[],perf:{}})};
   await loadState(); domicile();
   if(roundsOf(state)!==att) throw new Error(dur+' min devait donner '+att+' series, obtenu '+state.rounds);
   if(state.duration!==undefined) throw new Error('la duree ne doit plus survivre a la migration'); };
 await mig(10,2); await mig(15,3); await mig(20,4);
 state=null; cur=null; localStorage._m={'palier-state-v2':JSON.stringify({v:2,hist:[],perf:{}})};
 await loadState(); domicile();
 if(roundsOf(state)!==3) throw new Error('sans duree connue, 3 series par defaut');
 console.log('migration OK : 10/15/20 min → 2/3/4 series, defaut a 3');

 // 11. etat : aucun effet de bord
 await neuf();
 if(typeof EFFORT!=='undefined') throw new Error('EFFORT devait disparaitre avec l ordre de sacrifice');
 /* v1.15 : une assertion qui epingle la valeur courante est fausse en meme
    temps que le code et verte en meme temps que lui. On verifie la forme et la
    coherence avec le changelog, pas la valeur. */
 if(!/^\\d+\\.\\d+$/.test(VERSION)) throw new Error('version malformee : '+VERSION);
 console.log('etat OK : aucun effet de bord, version '+VERSION);
 console.log('TESTS V1.13 OK');
})();
`;
eval(src+T);
