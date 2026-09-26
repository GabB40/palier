// Nouveautes v1.11 : denominateur de la couverture borne aux semaines revolues,
// pas de 5 secondes sur les cibles chronometrees, ligne d historique portant
// l heure de debut et les deux durees, fleches rendues au defilement.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='complet'; state.cardio=false; state.stretch=false; state.rounds=3; state.goal=4;};
 /* J-n a heure fixe : J-7, J-14, J-21 et J-28 tombent toujours dans les
    semaines ISO precedentes, quel que soit le jour ou le test tourne */
 const J=(n,h)=>{ const d=new Date(); d.setDate(d.getDate()-n); d.setHours(h==null?18:h,0,0,0); return d.toISOString(); };
 const REP={push:'pompes-poignees',pull:'face-pulls',legs:'goblet-squat',core:'planche'};
 const seance=(date,tours,o)=>{ o=o||{};
   const items=[{id:REP.push,sets:new Array(tours).fill(8)}];
   if(!o.inc){ items.push({id:REP.pull,sets:new Array(tours).fill(10)},
                          {id:REP.legs,sets:new Array(tours).fill(8)},
                          {id:REP.core,sets:new Array(tours).fill(20)}); }
   const e={date:date,type:'alterne',mode:'alterne',dur:o.dur||15,items:items,xp:o.xp||63,real:o.real===undefined?1080:o.real};
   if(o.inc) e.inc=true;
   return e; };
 await neuf();

 // 1. rien a moyenner tant qu aucune semaine n est revolue
 state.hist=[seance(J(0),3)];
 if(weeksObserved(state)!==0) throw new Error('aucune semaine revolue attendue');
 if(coverage(state,4)!==null) throw new Error('coverage doit renvoyer null sans semaine revolue');
 view='prog'; render();
 if(!/Mesure à venir/.test(html)) throw new Error('mention d attente absente');
 if(/class="cov"/.test(html)) throw new Error('les rails ne doivent pas etre traces sans mesure');
 if(!/Configuration actuelle/.test(html)) throw new Error('la projection doit rester affichee');
 if(/Équilibre tiré\\/poussé/.test(html)) throw new Error('le ratio ne doit pas etre calcule sans mesure');
 console.log('demarrage OK : rien a moyenner, projection conservee, rails absents');

 // 2. cas reel du 6 au 9 aout : 4 seances dans une meme semaine revolue,
 //    dont une incomplete, soit 33 series. Divisees par 4 elles donnaient 2,3.
 state.hist=[seance(J(7,10),2,{dur:10,real:600,xp:47}),
             seance(J(7,16),1,{inc:true,real:180,xp:4}),
             seance(J(7,17),3,{real:1080}),
             seance(J(7,18),3,{real:1080})];
 const total=state.hist.reduce((n,h)=>n+h.items.reduce((m,i)=>m+i.sets.length,0),0);
 if(total!==33) throw new Error('33 series attendues, obtenu '+total);
 if(weeksObserved(state)!==1) throw new Error('une semaine revolue attendue');
 if(coverageWeeks(state,4)!==1) throw new Error('denominateur attendu a 1');
 const cg=coverage(state,4);
 if(cg.push!==9||cg.pull!==8||cg.legs!==8||cg.core!==8) throw new Error('couverture attendue 9/8/8/8, obtenu '+JSON.stringify(cg));
 if(Object.keys(cg).some(k=>cg[k]<covFloor(k))) throw new Error('les quatre groupes devaient tomber dans la bande');
 view='prog'; render();
 if(!/moyenne sur 1 semaine révolue/.test(html)) throw new Error('libelle au singulier attendu');
 if(!/class="cov"/.test(html)) throw new Error('les rails doivent etre traces des qu une semaine est revolue');
 if(/class="cur out"/.test(html)) throw new Error('aucun curseur ne devait sortir de la bande');
 console.log('cas reel OK : 33 series sur 1 semaine revolue donnent 9/8/8/8, quatre curseurs dans la bande');

 // 3. la semaine en cours reste hors du calcul, quoi qu on y fasse
 state.hist=[seance(J(7),3),seance(J(0),3),seance(J(0,20),3)];
 const av=coverage(state,4);
 if(av.push!==3) throw new Error('seule la semaine revolue devait compter, obtenu '+av.push);
 console.log('semaine en cours OK : exclue du numerateur comme du denominateur');

 // 4. quatre semaines revolues : denominateur plein, libelle au pluriel
 state.hist=[seance(J(28),3),seance(J(21),3),seance(J(14),3),seance(J(7),3)];
 if(coverageWeeks(state,4)!==4) throw new Error('denominateur attendu a 4');
 const q=coverage(state,4);
 if(q.push!==3) throw new Error('12 series sur 4 semaines devaient donner 3, obtenu '+q.push);
 view='prog'; render();
 if(!/moyenne sur 4 semaines révolues/.test(html)) throw new Error('libelle au pluriel attendu');
 // au-dela de la fenetre, rien ne remonte
 state.hist=[seance(J(70),3)].concat(state.hist);
 if(coverageWeeks(state,4)!==4) throw new Error('la fenetre reste plafonnee a 4 semaines');
 if(coverage(state,4).push!==3) throw new Error('une seance hors fenetre ne doit pas entrer dans la moyenne');
 console.log('fenetre OK : plafonnee a 4 semaines, seances anterieures ignorees');

 // 5. les replis douleur gardent leur fenetre glissante : un repli du jour compte
 state.hist=[{date:J(0),type:'alterne',mode:'alterne',dur:15,real:900,xp:20,
   items:[{id:'rowing-elastique',sets:[10,10],sw:true,from:'tractions-assistees-supination'}]}];
 const ps=painSwaps(state,4);
 if(!ps.length||ps[0].id!=='tractions-assistees-supination') throw new Error('le repli du jour doit rester visible');
 console.log('replis OK : fenetre glissante conservee, signal de securite immediat');

 // 6. pas de 5 secondes sur les cibles chronometrees
 await neuf();
 const PL='planche', pp=perfOf(PL);
 if(DB[PL].mode!=='time') throw new Error('planche attendue en mode tenue');
 const cible=(a)=>{ applyProgress(PL,a,true,false); return perfOf(PL).target; };
 if(pp.target!==20) throw new Error('cible de depart attendue a 20');
 if(cible([20,20])!==25) throw new Error('20 tenues devaient donner 25, obtenu '+perfOf(PL).target);
 perfOf(PL).target=30;
 if(cible([34,34])!==35) throw new Error('34 tenues devaient donner 35, obtenu '+perfOf(PL).target);
 if(cible([30,40,36])!==35) throw new Error('la plus petite serie commande : 30/40/36 devait donner 35');
 if(cible([35,35])!==40) throw new Error('35 tenues devaient donner 40 : sans le +1, tenir sa cible ne monterait jamais');
 if(cible([44,44])!==45) throw new Error('l arrondi ne doit pas depasser le haut de fourchette');
 /* v2.14 : un mauvais jour est absorbe par la fenetre de deux passages, la
    cible reste sur la lecture precedente ; c est le second qui ramene au bas
    de fourchette, et pas plus bas */
 if(cible([12,12])!==45) throw new Error('un mauvais jour isole doit etre absorbe, obtenu '+perfOf(PL).target);
 if(cible([12,12])!==20) throw new Error('deux mauvais jours doivent ramener au bas de fourchette, pas plus bas');
 console.log('tenues OK : 20-25, 34-35, 30/40/36-35, 35-40, un mauvais jour absorbe, borne aux deux extremites');

 // 7. cinq passages pour traverser la fourchette 20-45 (v1.17 : plafond a 45 s)
 delete state.perf[PL];
 let p2=perfOf(PL), n=0;
 while(p2.target<45&&n<200){ applyProgress(PL,[p2.target,p2.target],true,false); n++; }
 if(n!==5) throw new Error('5 passages attendus de 20 a 45 s, obtenu '+n);
 // au sommet, le plafond parle, la fourchette ne bouge pas
 const msg=applyProgress(PL,[45,45],true,false);
 if(!msg.join(' ').match(/Plafond atteint/)) throw new Error('message de plafond attendu a 45 s');
 if(perfOf(PL).range[1]!==45) throw new Error('la fourchette ne doit pas depasser le cap');
 console.log('traversee OK : 5 passages de 20 a 45 s, plafond intact');

 // 8. les repetitions gardent le pas de 1, les etirements ne passent pas par la
 const CU='curls-halteres';
 delete state.perf[CU];
 const pc=perfOf(CU), t0=pc.target;
 applyProgress(CU,[t0,t0,t0],true,false);
 if(perfOf(CU).target!==t0+1) throw new Error('pas de 1 attendu sur les repetitions, obtenu '+perfOf(CU).target);
 const ET='etir-nuque';
 if(applyProgress(ET,[30,30],true,false).length) throw new Error('un etirement ne doit rien faire progresser');
 if(perfOf(ET).range) throw new Error('un etirement n a pas de fourchette');
 // gainage lateral : bornes 15-45, toutes multiples de 5
 const GL='gainage-lateral';
 if(DB[GL].reps[0]%5||DB[GL].reps[1]%5) throw new Error('bornes non multiples de 5 sur '+GL);
 delete state.perf[GL];
 perfOf(GL).target=15;
 applyProgress(GL,[15,15],true,false);
 if(perfOf(GL).target!==20) throw new Error('gainage lateral : 15 tenues devaient donner 20');
 console.log('perimetre OK : pas de 1 sur les repetitions, etirements hors moteur, bornes multiples de 5');

 // 9. ligne d historique : heure de debut et les deux durees
 await neuf();
 const fin=J(7,18), reel=1080;
 state.hist=[seance(fin,3,{dur:15,real:reel})];
 view='prog'; render();
 if(!/18 min pour 15/.test(html)) throw new Error('duree reelle et duree choisie attendues');
 const attendu=fmtDT(new Date(new Date(fin).getTime()-reel*1000).toISOString());
 if(html.indexOf(attendu)<0) throw new Error('heure de debut attendue : '+attendu);
 if(html.indexOf(fmtDT(fin))>=0) throw new Error('l heure de fin ne doit plus etre affichee');
 // seance sans mesure de duree : la nature du chiffre est dite
 state.hist=[{date:fin,type:'alterne',mode:'alterne',dur:15,xp:60,items:[{id:REP.push,sets:[8,8]}]}];
 render();
 if(!/15 min annoncées/.test(html)) throw new Error('duree annoncee a dire comme telle sans mesure');
 /* v1.13 : les nouvelles seances portent la duree calculee dans plan, les
    anciennes gardent dur ; l historique lit les deux */
 state.hist=[{date:fin,type:'alterne',mode:'alterne',rounds:3,plan:20,real:1140,xp:60,items:[{id:REP.push,sets:[8,8]}]}];
 render();
 if(!/19 min pour 20/.test(html)) throw new Error('duree annoncee v1.13 attendue');
 console.log('historique OK : heure de debut, « 18 min pour 15 », duree choisie annoncee sans mesure');

 // 10. clavier : fleches rendues au defilement, ajustement sur + et -
 await neuf();
 const key=(k,code)=>handlers.forEach(h=>h({key:k,code:code||k,target:{tagName:'DIV'},preventDefault(){}}));
 view='home'; startSession(); skipWarm();
 const st=cur.steps[cur.i];
 if(st.k!=='set') throw new Error('etape de serie attendue');
 const v0=st.val;
 ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach(k=>key(k));
 if(st.val!==v0) throw new Error('les fleches ne doivent plus toucher a la valeur');
 key('+'); if(st.val!==v0+1) throw new Error('+ doit incrementer');
 key('='); if(st.val!==v0+2) throw new Error('= doit incrementer');
 key('-'); if(st.val!==v0+1) throw new Error('- doit decrementer');
 key('6'); if(st.val!==v0) throw new Error('6 doit decrementer');
 key('6','Numpad6'); if(st.val!==v0) throw new Error('le 6 du pave numerique est colle au -, il ne doit rien faire');
 key('+','NumpadAdd'); if(st.val!==v0+1) throw new Error('le + du pave numerique doit incrementer');
 key('-','NumpadSubtract'); if(st.val!==v0) throw new Error('le - du pave numerique doit decrementer');
 if(!/défiler/.test(kbHint())||/↑ ↓<\\/b> ajuster/.test(kbHint())) throw new Error('ligne d aide clavier a mettre a jour');
 console.log('clavier OK : fleches libres, + = - 6 ajustent, Numpad6 neutre, aide a jour');

 // 11. aucun effet de bord, version
 await neuf();
 state.hist=[seance(J(7),3)];
 /* l accueil initialise les reperes des exercices du jour a la demande : on
    l amorce avant de prendre l empreinte, sinon on mesurerait ce comportement
    anterieur et non les cards de Progres */
 view='home'; render();
 const avant=JSON.stringify(state);
 view='prog'; render(); view='home'; render();
 if(JSON.stringify(state)!==avant) throw new Error('le rendu ne doit rien ecrire dans l etat');
 console.log('etat OK : aucun effet de bord');
 console.log('TESTS V1.11 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
