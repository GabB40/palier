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
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 // 1. fmtKg : les paliers a 1,25 ne sont plus arrondis
 if(fmtKg(3.25)!=='3,25 kg') throw new Error('fmtKg 3.25 -> '+fmtKg(3.25));
 if(fmtKg(4.5)!=='4,5 kg'||fmtKg(6)!=='6 kg'||fmtKg(11.75)!=='11,75 kg') throw new Error('fmtKg zeros inutiles');
 const L=loadLadder(state.gear).filter(v=>Math.round(v*100)%100!==0&&Math.round(v*10)%10===0||String(v).indexOf('.25')>0||String(v).indexOf('.75')>0);
 if(!L.length) throw new Error('aucun palier a deux decimales dans l echelle');
 if(L.some(v=>fmtKg(v).indexOf(',3')>=0||fmtKg(v).indexOf(',8')>=0)) throw new Error('arrondi encore present sur l echelle');
 console.log('fmtKg OK :',fmtKg(3.25)+',',L.length,'paliers a deux decimales affiches exactement');
 // 2. semaine tronquee : prorata sur les jours disponibles
 const lundi=new Date(); lundi.setDate(lundi.getDate()-((lundi.getDay()||7)-1)); lundi.setHours(0,0,0,0);   /* minuit et non midi : ancre a 12 h, la suite 6 rendait le build dependant de l heure de lancement, weeksElapsed comparant a Date.now() */
 const J=n=>{const d=new Date(lundi);d.setDate(d.getDate()+n);return d.toISOString();};
 const S=iso=>({date:iso,type:'alterne',mode:'alterne',dur:15,real:900,xp:40,items:[]});
 state.goal=4;
 const cas=[[6,1],[5,2],[4,2],[3,3],[2,3],[1,4],[0,4]];
 cas.forEach(([offset,attendu])=>{
   state.hist=[S(J(offset))];
   const k=isoWeek(new Date(J(offset)));
   const g=goalForWeek(state,k);
   if(g!==attendu) throw new Error('prorata J+'+offset+' : attendu '+attendu+', obtenu '+g);
 });
 console.log('prorata OK : dimanche 1, samedi 2, vendredi 2, jeudi 3, mercredi 3, mardi 4, lundi 4');
 // 3. cas reel de Gabriel : premiere seance vendredi, deux jours actifs, semaine validee
 state.hist=[S(J(4)),S(J(5))];
 const k0=isoWeek(new Date(J(4)));
 if(goalForWeek(state,k0)!==2) throw new Error('objectif semaine de demarrage');
 if(weekCounts(state)[k0]!==2) throw new Error('jours actifs');
 if(weeksValidated(state)!==1) throw new Error('semaine de demarrage non validee');
 if(weekStreak(state)!==1) throw new Error('streak non demarre');
 if(!BADGES.filter(b=>b.id==='w1')[0].test(state)) throw new Error('badge semaine validee non obtenu');
 view='home'; render();
 if(html.indexOf('2 / 2')<0) throw new Error('accueil n affiche pas l objectif ajuste');
 if(html.indexOf('de démarrage')<0||html.indexOf('au prorata')<0) throw new Error('accueil n explique pas l ajustement');
 if(html.indexOf('Semaine validée')<0) throw new Error('semaine non annoncee validee');
 console.log('semaine de demarrage OK : objectif 2, validee, expliquee sur l accueil');
 // 4. le prorata ne s applique qu aux semaines tronquees
 state.hist=[S(J(-7)),S(J(-6)),S(J(-5)),S(J(-4)),S(J(4))];
 if(goalForWeek(state,k0)!==4) throw new Error('semaine precedee d une semaine active doit garder l objectif nominal');
 if(weeksValidated(state)!==1) throw new Error('seule la semaine precedente est validee');
 console.log('continuite OK : une semaine qui suit une semaine active garde l objectif nominal');
 // 5. reprise apres une semaine entierement vide
 state.hist=[S(J(-14)),S(J(-13)),S(J(-12)),S(J(-11)),S(J(3)),S(J(4)),S(J(5))];
 if(goalForWeek(state,k0)!==3) throw new Error('reprise jeudi : objectif attendu 3, obtenu '+goalForWeek(state,k0));
 if(weeksValidated(state)!==2) throw new Error('reprise non validee');
 if(weekStreak(state)!==1) throw new Error('le streak repart de 1 apres une semaine vide');
 view='home'; render();
 if(html.indexOf('de reprise')<0) throw new Error('libelle reprise absent');
 console.log('reprise OK : objectif 3 apres une semaine vide, streak reparti de 1');
 // 6. semaine en cours non jouee : jamais comptee comme un echec
 state.goal=4; state.hist=[S(J(-7)),S(J(-6)),S(J(-5)),S(J(-4)),S(J(0))];
 if(weeksElapsed(state)!==1) throw new Error('semaine en cours non terminee comptee : '+weeksElapsed(state));
 if(weeksValidated(state)!==1) throw new Error('semaine precedente non validee');
 state.hist=state.hist.concat([S(J(1)),S(J(2)),S(J(3))]);
 if(weeksElapsed(state)!==2) throw new Error('semaine en cours validee doit compter');
 if(weeksValidated(state)!==2) throw new Error('validation semaine en cours');
 console.log('semaines ecoulees OK : la semaine en cours ne compte qu une fois validee');
 // 7. file de celebrations : deblocage, badges, rang, sans doublon aux paliers 5 et 10
 state=null; localStorage._m={}; await loadState(); domicile();
 state.badges=[]; state.unlocked={}; state.xp=0;
 let q=celebrations([],[],1);   /* v1.15 : liste de cles, plus un compte */
 if(q.length) throw new Error('file non vide sans evenement');
 state.unlocked={'kb-swings':true}; state.badges=['s1','unlock1']; state.xp=0;
 q=celebrations([],[],1);
 if(q.length!==3) throw new Error('file attendue a 3 cartes, obtenue '+q.length);
 if(q[0].kind!=='Exercice débloqué'||q[1].kind!=='Badge obtenu') throw new Error('ordre de la file');
 // rang sans badge associe : niveau 3, rang Regulier
 let xp3=0; while(lvlInfo(xp3).lvl<3) xp3+=10;
 state.xp=xp3; state.badges=[];
 q=celebrations(['kb-swings'],[],1);
 if(q.length!==1||q[0].kind!=='Nouveau rang') throw new Error('carte de rang absente au niveau 3');
 // rang 5 : le badge lvl5 couvre le palier, pas de doublon
 let xp5=0; while(lvlInfo(xp5).lvl<5) xp5+=10;
 state.xp=xp5; state.badges=['lvl5'];
 q=celebrations(['kb-swings'],[],4);
 if(q.length!==1) throw new Error('doublon badge et rang au niveau 5 : '+q.length+' cartes');
 if(q[0].kind!=='Badge obtenu') throw new Error('au niveau 5 c est le badge qui doit rester');
 console.log('celebrations OK : ordre respecte, fusion badge et rang aux paliers 5 et 10');
 // 8. la surcouche avale la premiere touche puis rend la main
 state.hist=[]; state.badges=[]; state.unlocked={}; state.xp=0;
 state.warm='aucun'; state.cardio=false;
 startSession();
 let guard=0;
 while(view==='session'&&guard++<400){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ TVAL(s,DB[s.id].reps?DB[s.id].reps[1]:30); } else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 if(view!=='recap') throw new Error('recap non atteint');
 if(!cur.pop.length) throw new Error('premiere seance sans aucune celebration');
 if(html.indexOf('class="pop"')<0) throw new Error('surcouche non rendue');
 const n=cur.pop.length;
 const key=k=>handlers.forEach(h=>h({key:k,code:k===' '?'Space':k,target:{tagName:'DIV'},preventDefault(){}}));
 key('Enter');
 if(view!=='recap') throw new Error('la touche a traverse la surcouche');
 if(cur.popI!==1) throw new Error('la carte n a pas avance');
 for(let i=1;i<n;i++) key('Enter');
 if(popActive()) throw new Error('file non videe');
 if(html.indexOf('class="pop"')>=0) throw new Error('surcouche encore affichee');
 key('Enter');
 if(view!=='home') throw new Error('retour a l accueil impossible apres la file');
 console.log('surcouche OK :',n,'carte'+(n>1?'s':'')+' a la premiere seance, touches consommees puis rendues');
 // 9. echappement : tout passer
 state.hist=[]; state.badges=[]; state.unlocked={}; state.xp=0;
 startSession(); guard=0;
 while(view==='session'&&guard++<400){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ TVAL(s,DB[s.id].reps?DB[s.id].reps[1]:30); } else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 key('Escape');
 if(popActive()) throw new Error('Echap ne vide pas la file');
 console.log('echappement OK : Echap passe toute la file');
 console.log('TESTS V1.3 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
