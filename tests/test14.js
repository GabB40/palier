// Nouveautes v1.12 : chrono d etirement partant de la duree reelle et decoupe
// en deux cotes sur les etirements bilateraux, retour a l exercice d origine
// apres un repli douleur, aligne sur le module cardio.
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
/* horloge pilotee a la main : les chronos sont deterministes, aucune attente reelle */
let ticks=[];
const vraiSet=global.setInterval, vraiClear=global.clearInterval;
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ if(t&&t.f) ticks=ticks.filter(x=>x!==t); else if(t) vraiClear(t); };
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.freqs=()=>{ const out=[]; bips.forEach((o,i)=>{ if(i%2===0) out.push(o.frequency.value); }); return out; };
global.videBips=()=>{ bips.length=0; };
global.videEls=()=>{ Object.keys(els).forEach(k=>delete els[k]); };
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
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=true; state.rounds=4; state.prep=0; };
 /* le libelle de cote est lu dans l element quand le code l a mis a jour,
    dans le rendu tant qu il ne l a pas touche */
 const cote=()=>els['#phlabel']?els['#phlabel'].textContent:(html.match(/id="phlabel">([^<]*)</)||[])[1];
 const joue=(f)=>{ let g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ f(s); } else if(s.k==='cardio'){ s.rounds=4; validateCardio(); } else nextStep(); } };

 // 1. decoupage des durees : la somme des cotes vaut toujours la duree de base
 await neuf();
 const etirs=Object.keys(DB).filter(id=>DB[id].mode==='stretch');
 if(etirs.length!==6) throw new Error('six etirements attendus, '+etirs.length+' trouves');
 const bilat=etirs.filter(id=>DB[id].bilat);
 if(bilat.length!==4) throw new Error('quatre etirements bilateraux attendus, '+bilat.length);
 etirs.forEach(id=>{
   const e=DB[id], ph=stretchPhases(e);
   if(ph.reduce((a,b)=>a+b,0)!==e.dur) throw new Error('somme des cotes differente de la duree : '+id);
   if(e.bilat&&ph.length!==2) throw new Error('etirement bilateral en un seul bloc : '+id);
   if(!e.bilat&&ph.length!==1) throw new Error('etirement unilateral decoupe : '+id);
 });
 if(stretchPhases(DB['etir-hanches']).join('/')!=='30/30') throw new Error('hanches : '+stretchPhases(DB['etir-hanches']).join('/'));
 if(stretchPhases(DB['etir-nuque']).join('/')!=='20/20') throw new Error('nuque : '+stretchPhases(DB['etir-nuque']).join('/'));
 if(stretchPhases({dur:45,bilat:true}).join('/')!=='23/22') throw new Error('duree impaire mal repartie');
 console.log('decoupage OK : 4 bilateraux en deux cotes, 2 en un bloc, somme egale a la duree de base');

 // 2. valeur de depart du chrono : jamais le repli generique de 10 s
 etirs.forEach(id=>{
   const st={k:'set',id:id,key:id,cool:true,set:1,of:1};
   const h=setHtml(st);
   const attendu=stretchPhases(DB[id])[0];
   if(st.val!==attendu) throw new Error(id+' demarre a '+st.val+' s au lieu de '+attendu);
   const m=h.match(/id="cc">([^<]*)</);
   if(!m||m[1]!==fmtT(attendu)) throw new Error(id+' affiche '+(m?m[1]:'rien')+' au lieu de '+fmtT(attendu));
   if(DB[id].bilat&&h.indexOf('Premier côté')<0) throw new Error('libelle de cote absent : '+id);
   if(!DB[id].bilat&&h.indexOf('id="phlabel"')>=0) throw new Error('libelle de cote sur un etirement unilateral : '+id);
   if(h.indexOf('toggleStretch()">Démarrer<')<0) throw new Error('bouton de depart absent : '+id);
 });
 console.log('depart OK : les six etirements partent de leur duree reelle, plus aucun 0:10');

 // 3. deroule complet d un etirement bilateral, chrono pilote a la main
 await neuf();
 startSession();
 cur.steps=[{k:'set',id:'etir-hanches',key:'etir-hanches',cool:true,set:1,of:1}]; cur.i=0;
 renderSession();
 videEls(); videBips();
 if(cote()!=='Premier côté') throw new Error('libelle initial : '+cote());
 toggleStretch();
 if(els['#ct'].textContent!=='Pause') throw new Error('bouton attendu Pause au demarrage, lu '+els['#ct'].textContent);
 tic(29);
 if(els['#cc'].textContent!=='0:01') throw new Error('a 29 s le chrono lit '+els['#cc'].textContent);
 if(cote()!=='Premier côté') throw new Error('cote change trop tot');
 tic(1);
 if(cote()!=='Second côté') throw new Error('pas de bascule de cote a mi-parcours');
 if(els['#cc'].textContent!=='0:30') throw new Error('le second cote ne repart pas a 0:30 : '+els['#cc'].textContent);
 if(freqs().indexOf(700)<0) throw new Error('aucun bip de bascule de cote');
 if(els['#ct'].textContent!=='Pause') throw new Error('le bouton a change a la bascule');
 tic(30);
 if(els['#cc'].textContent!=='0:00') throw new Error('fin attendue a 0:00, lu '+els['#cc'].textContent);
 if(freqs().indexOf(880)<0) throw new Error('aucun bip de fin');
 if(els['#ct'].textContent!=='Recommencer') throw new Error('en fin de chrono le bouton lit encore '+els['#ct'].textContent);
 if(ticks.length) throw new Error('le chrono tourne encore apres la fin');
 console.log('bilateral OK : 30 s, bip de bascule, 30 s, bip de fin, bouton Recommencer');

 // 4. le bouton de fin repart du premier cote pour la duree pleine
 toggleStretch();
 if(cur.steps[0].side!==0) throw new Error('le redepart ne revient pas au premier cote');
 if(cote()!=='Premier côté') throw new Error('libelle de cote non remis a jour au redepart');
 if(els['#cc'].textContent!=='0:30') throw new Error('le redepart lit '+els['#cc'].textContent);
 tic(60);
 if(els['#ct'].textContent!=='Recommencer') throw new Error('second passage : bouton '+els['#ct'].textContent);
 console.log('redepart OK : Recommencer rejoue les deux cotes depuis le premier');

 // 5. pause au milieu d un cote : valeur et cote conserves
 toggleStretch(); tic(10);
 toggleStretch();
 if(els['#ct'].textContent!=='Reprendre') throw new Error('pause : bouton '+els['#ct'].textContent);
 if(cur.steps[0].val!==20) throw new Error('pause : valeur '+cur.steps[0].val+' au lieu de 20');
 toggleStretch(); tic(20);
 if(cote()!=='Second côté') throw new Error('la reprise ne poursuit pas le premier cote');
 console.log('pause OK : la reprise repart du temps et du cote en cours');

 // 6. etirement unilateral : un seul bloc, un seul bip, aucune bascule
 clearTimers();
 cur.steps=[{k:'set',id:'posture-enfant',key:'posture-enfant',cool:true,set:1,of:1}]; cur.i=0;
 renderSession(); videEls(); videBips();
 toggleStretch();
 tic(45);
 if(freqs().filter(f=>f===700).length) throw new Error('bip de bascule sur un etirement unilateral');
 if(freqs().filter(f=>f===880).length!==1) throw new Error('un seul bip de fin attendu');
 if(els['#ct'].textContent!=='Recommencer') throw new Error('fin unilaterale : bouton '+els['#ct'].textContent);
 console.log('unilateral OK : 45 s d un bloc, un bip, aucun libelle de cote');

 // 7. la porte sonore globale coupe aussi ces deux bips
 state.sound=false;
 clearTimers();
 cur.steps=[{k:'set',id:'etir-pecs',key:'etir-pecs',cool:true,set:1,of:1}]; cur.i=0;
 renderSession(); videEls(); videBips();
 toggleStretch(); tic(60);
 if(freqs().length) throw new Error('bips emis alors que le son est coupe');
 state.sound=true;
 console.log('son OK : bascule et fin passent par la porte globale');

 // 8. fausse manoeuvre : repli puis retour immediat, la seance redevient intacte
 await neuf();
 state.stretch=false;
 startSession();
 const exo=cur.steps[0].id, fb=DB[exo].fb;
 if(!fb) throw new Error('premier exercice sans variante de repli, test non concluant');
 const prevues=cur.steps.filter(s=>s.k==='set'&&s.id===exo).length;
 swapPain();
 if(setHtml(cur.steps[cur.i]).indexOf('revertSwap()')<0) throw new Error('aucun bouton de retour sur l ecran de repli');
 if(cur.steps.filter(s=>s.k==='set'&&s.id===fb&&s.swapped).length!==prevues) throw new Error('toutes les series restantes n ont pas bascule');
 revertSwap();
 if(cur.steps.some(s=>s.k==='set'&&s.swapped)) throw new Error('une serie reste sur la variante apres le retour');
 if(cur.steps.filter(s=>s.k==='set'&&s.id===exo).length!==prevues) throw new Error('les series ne sont pas revenues sur l origine');
 if(cur.steps.some(s=>s.k==='rest'&&s.next===fb)) throw new Error('un ecran de repos annonce encore la variante');
 if(setHtml(cur.steps[cur.i]).indexOf('revertSwap()')>=0) throw new Error('le bouton de retour survit au retour');
 const p0=perfOf(exo), top=p0.range[1], band0=p0.band, load0=p0.load;
 joue(s=>{ const p=perfOf(s.id); TVAL(s,p.range?p.range[1]:30); });
 await new Promise(r=>setTimeout(r,10));
 const h1=state.hist[state.hist.length-1];
 if(h1.items.some(it=>it.sw)) throw new Error('la fausse manoeuvre laisse un repli dans l historique');
 if(!h1.items.some(it=>it.id===exo)) throw new Error('l exercice d origine absent de l historique');
 const p1=perfOf(exo);
 const monte=(p1.load!==load0)||(p1.band!==band0)||(p1.range[1]!==p0.range[1])||(p1.target>top);
 if(!monte) throw new Error('progression bloquee alors que le repli a ete annule avant toute serie');
 console.log('fausse manoeuvre OK : aucun repli au journal, progression appliquee normalement');

 // 9. repli assume puis retour : ce qui a ete fait reste inscrit
 await neuf();
 state.stretch=false;
 startSession();
 const exo2=cur.steps[0].id, fb2=DB[exo2].fb;
 const p2=perfOf(exo2), top2=p2.range[1];
 TVAL(cur.steps[0],top2);                 // une serie sur l origine
 let g=0; while(g++<50){ const s=cur.steps[cur.i]; if(s.k==='set'&&s.id===exo2) break; nextStep(); }
 swapPain();
 TVAL(cur.steps[cur.i],5);                // une serie sur le repli
 g=0; while(g++<50){ const s=cur.steps[cur.i]; if(s.k==='set'&&s.from===exo2) break; nextStep(); }
 revertSwap();
 if(cur.steps[cur.i].id!==exo2) throw new Error('le retour n a pas remis la serie en cours sur l origine');
 if(!cur.log[exo2+'>'+fb2]) throw new Error('la serie faite sur le repli a disparu du journal');
 if(cur.log[exo2].length!==1) throw new Error('les series deja validees sur l origine ont bouge');
 joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[1]:30); });
 await new Promise(r=>setTimeout(r,10));
 const h2=state.hist[state.hist.length-1];
 if(!h2.items.some(it=>it.sw&&it.from===exo2)) throw new Error('le repli reellement joue a disparu de l historique');
 const p3=perfOf(exo2);
 if(p3.range[1]!==p2.range[1]||p3.load!==p2.load||p3.band!==p2.band) throw new Error('progression appliquee malgre un repli joue');
 const cap=painSwaps(state,4);
 if(!cap.some(r=>r.id===exo2&&r.sw)) throw new Error('le capteur de douleur ignore un repli reellement joue');
 console.log('repli assume OK : serie conservee, repli au journal et au capteur, progression bloquee');

 // 10. le mode allege n offre pas ce retour, sa substitution n est pas une douleur
 await neuf();
 state.stretch=false;lightMode=true;
 startSession();
 const sl=cur.steps.filter(s=>s.k==='set'&&s.swapped)[0];
 if(sl){
   if(!sl.light) throw new Error('substitution allegee non marquee');
   if(setHtml(sl).indexOf('revertSwap()')>=0) throw new Error('bouton de retour offert en seance allegee');
 }
 lightMode=false;
 console.log('allege OK : la substitution du jour leger n ouvre pas de retour');

 // 11. module cardio : meme bascule, meme retour
 await neuf();
 state.cardio=true; state.stretch=false;state.rounds=4;
 startSession();
 g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s||s.k==='cardio') break;
   if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
 const stc=cur.steps[cur.i];
 if(!stc||stc.k!=='cardio') throw new Error('module cardio introuvable');
 const cid=stc.id;
 swapCardio();
 if(!stc.swapped) throw new Error('le cardio n a pas bascule');
 if(cardioHtml(stc).indexOf('revertCardio()')<0) throw new Error('aucun bouton de retour sur le cardio replie');
 revertCardio();
 if(stc.swapped||stc.id!==cid) throw new Error('le cardio n est pas revenu a la marche prevue');
 if(cardioHtml(stc).indexOf('revertCardio()')>=0) throw new Error('le bouton de retour survit au retour du cardio');
 if(cardioHtml(stc).indexOf('swapCardio()')<0) throw new Error('le bouton de repli n est pas rendu apres le retour');
 console.log('cardio OK : bascule et retour alignes sur les series');

 // 12. version et absence d effet de bord du rendu
 await neuf();
 view='home'; render();
 const avant=JSON.stringify(state);
 view='prog'; render(); view='home'; render();
 if(JSON.stringify(state)!==avant) throw new Error('le rendu ecrit dans l etat');
 if(!VERSION) throw new Error('version absente');
 console.log('etat OK : aucun effet de bord, version '+VERSION);
 console.log('TESTS V1.12 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
