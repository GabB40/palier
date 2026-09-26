const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
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
 /* v2.0 : la presence d un niveau EST sa realisation, on bascule par setBandReal */
 const flipBand=id=>setBandReal(id, bandReal(id)?'':(coulOK(id)?id:'gris'));
 const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(m+' : '+JSON.stringify(a)+' vs '+JSON.stringify(b));};
 // 1. capacite du manchon : paire a 14,5, mono a 17
 const L2=loadLadder(state.gear), L1=loadLadderMono(state.gear);
 if(L2[L2.length-1]!==14.5) throw new Error('paire max attendu 14.5, obtenu '+L2[L2.length-1]);
 if(L1[L1.length-1]!==17) throw new Error('mono max attendu 17, obtenu '+L1[L1.length-1]);
 const g3=Object.assign({},state.gear,{maxPerEnd:3});
 if(loadLadderMono(g3).slice(-1)[0]!==2+2*(2+2+1.25)) throw new Error('capacite 3 non respectee');
 console.log('capacite manchon OK : paire max',L2[L2.length-1],'kg, mono max',L1[L1.length-1],'kg');
 // 2. echelles a lestes
 eq(fixedLadder('goblet-squat',state.gear).map(x=>x.v),[10,12,14,16],'echelle goblet');
 const rk=fixedLadder('rowing-kettlebell',state.gear).map(x=>x.v);
 eq(rk.slice(0,4),[10,11,12,13],'debut chaine rowing');
 if(rk[rk.length-1]!==20) throw new Error('sommet rowing attendu 20, obtenu '+rk[rk.length-1]);
 if(rk.indexOf(17)<0) throw new Error('barreau haltere 17 absent');
 console.log('echelles lestes OK : goblet 10-16, rowing 10 ->',rk[rk.length-1],'kg ('+rk.length+' barreaux)');
 // 3. echelles de bandes par sens
 eq(bandLadder(DB['face-pulls'],state.gear),['jaune','rouge','noir','violet','vert'],'echelle face-pulls');
 eq(bandLadder(DB['pompes-poignees'],state.gear),['aucune','jaune','rouge','noir','violet','vert'],'echelle pompes');
 eq(bandLadder(DB['tractions-assistees-supination'],state.gear),['vert','violet','noir','rouge','jaune'],'echelle assistance');
 console.log('echelles de bandes OK, barreau zero des pompes present');
 // 4. progression en resistance : montee de bande, cible au bas, filet de securite
 let p=perfOf('face-pulls');
 if(p.band!=='jaune') throw new Error('barreau de depart face-pulls: '+p.band);
 let m=applyProgress('face-pulls',[18,18,18]);
 p=perfOf('face-pulls');
 if(p.band!=='rouge'||p.target!==10) throw new Error('montee de bande ratee: '+p.band+'/'+p.target);
 if(!/[Bb]ande rouge/.test(m.join(' '))) throw new Error('message montee bande absent');
 // v1.15 : le passage qui suit la montee est gracie, le filet joue au suivant
 applyProgress('face-pulls',[5,5,5]);
 if(perfOf('face-pulls').band!=='rouge') throw new Error('la grace doit masquer la premiere descente de bande');
 applyProgress('face-pulls',[5,5,5]);
 if(perfOf('face-pulls').band!=='jaune') throw new Error('filet de securite bande rate');
 console.log('progression resistance OK : jaune -> rouge -> jaune');
 // 5. assistance : noir de depart, descendre l echelle, sommet = strictes, porte de bande
 p=perfOf('tractions-assistees-supination');
 if(p.band!=='noir') throw new Error('depart tractions: '+p.band);
 applyProgress('tractions-assistees-supination',[10,10,10]);
 p=perfOf('tractions-assistees-supination');
 if(p.band!=='rouge') throw new Error('moins d aide attendu rouge: '+p.band);
 state.perf['tractions-assistees-supination'].best=12; // vieux record avec bande forte
 checkUnlocks();
 if(state.unlocked['tractions-strictes-supination']) throw new Error('strictes debloquees sans la bande la plus faible');
 applyProgress('tractions-assistees-supination',[10,10,10]); // -> jaune
 p=perfOf('tractions-assistees-supination');
 if(p.band!=='jaune') throw new Error('barreau jaune non atteint: '+p.band);
 /* v2.12 : ce que cette assertion couvrait, la preuve qui ne suit pas le
    barreau, se lit maintenant sur le barreau ecrit AVEC les series. La
    seance a ete jouee en rouge et fait monter a jaune : setsBand doit dire
    rouge, sans quoi dix repetitions faites sous une bande plus forte
    ouvriraient la porte. */
 if(p.setsBand!=='rouge') throw new Error('barreau joue non enregistre: '+p.setsBand);
 checkUnlocks();
 if(state.unlocked['tractions-strictes-supination']) throw new Error('porte de bande poreuse (barreau joue)');
 applyProgress('tractions-assistees-supination',[10,8,6]);
 const um=checkUnlocks();
 if(!state.unlocked['tractions-strictes-supination']) throw new Error('strictes non debloquees a 10 reps bande jaune');
 m=applyProgress('tractions-assistees-supination',[10,10,10]);
 if(!/strictes prennent le relais/.test(m.join(' '))) throw new Error('message sommet assistance: '+m.join(' | '));
 console.log('assistance OK : noir -> rouge -> jaune, deblocage strictes garde par la bande, sommet vrai');
 // 6. les plafonnes : plus jamais le message generique, marche reelle affichee.
 //    v2.16 : le champ cap n existe plus, le plafond est le haut de fourchette
 //    de tout exercice au poids du corps ou tenu, et la liste se derive.
 const capped=Object.keys(DB).filter(id=>(DB[id].mode==='bw'||DB[id].mode==='time')&&!DB[id].bnd&&!DB[id].rhythm&&!DB[id].assise&&DB[id].reps)   /* v2.17 : les tenues rythmees ont une echelle ; v2.18 : l assise aussi */;
 if(capped.length<15) throw new Error('au moins quinze exercices plafonnes attendus, '+capped.length);
 capped.forEach(id=>{
   const e=DB[id], top=e.reps[1];
   const st2={load:0,range:e.reps.slice(),target:top,best:0,sets:[],date:null};
   state.perf[id]=st2;
   const msg=applyProgress(id,[top,top,top]).join(' ');
   if(/variante plus dure/.test(msg)) throw new Error('message generique toujours present sur '+id);
   if(!e.next) throw new Error('marche suivante absente sur '+id);
   if(msg.indexOf(e.next)<0) throw new Error('marche suivante non affichee sur '+id);
 });
 console.log('plafonds OK :',capped.length,'exercices plafonnes, chacun avec sa marche reelle');
 // 7. exercices fixed : double progression sur lestes, sommet par exercice
 state.perf['goblet-squat']=null; delete state.perf['goblet-squat'];
 p=perfOf('goblet-squat');
 for(let i=0;i<3;i++) applyProgress('goblet-squat',[15,15,15]);
 p=perfOf('goblet-squat');
 if(p.load!==16||p.target!==8) throw new Error('echelle goblet non gravie: '+p.load+'/'+p.target);
 eq(p.range,[8,15],'fourchette goblet ne doit plus monter');
 m=applyProgress('goblet-squat',[15,15,15]);
 /* v2.1 : la marche suivante des exercices a kettlebell se compose depuis
    l inventaire. Au sommet de ce que l inventaire permet, elle nomme le poids
    a declarer ; elle ne devient une impasse qu une fois la liste epuisee. */
 /* v2.18 : le goblet squat n est plus compose depuis l inventaire, sa marche
    est le squat sur une jambe, qui s ouvre a la kettlebell la plus lourde. La
    composition se verifie sur la version lestee, entree dans KB_NEXT, dont
    l echelle n est faite que de kettlebells. */
 if(!/squat sur une jambe vers la chaise prend le relais/.test(m.join(' '))) throw new Error('sommet goblet, successeur: '+m.join(' | '));
 const sl='squat-une-jambe-chaise-leste';
 delete state.perf[sl]; perfOf(sl);
 eq(fixedLadder(sl,state.gear).map(x=>x.v),[10],'echelle kettlebells seules, 10 kg seule');
 m=applyProgress(sl,[15,15]);
 if(!/déclare une kettlebell de 12 kg/.test(m.join(' '))) throw new Error('sommet lesté, poids suivant a declarer: '+m.join(' | '));
 KB_W.forEach(w=>{ state.gear.kbs[w]=1; });
 if(fixedLadder(sl,state.gear).some(x=>/leste/.test(x.lbl))) throw new Error('lestes dans une echelle kettlebells seules');
 state.perf[sl].load=fixedLadder(sl,state.gear).slice(-1)[0].v;
 m=applyProgress(sl,[15,15]);
 if(!/sac lesté porté devant/.test(m.join(' '))) throw new Error('sommet lesté, liste epuisee: '+m.join(' | '));
 KB_W.forEach(w=>{ if(w!=='10') delete state.gear.kbs[w]; });
 state.perf['goblet-squat'].load=16;
 applyProgress('goblet-squat',[3,3,3]);
 if(perfOf('goblet-squat').load!==14) throw new Error('redescente de leste ratee');
 console.log('fixed OK : goblet 10 -> 16 kg par lestes, sommet et redescente');
 // 8. migration : fourchettes gonflees remises a plat, bande par defaut
 localStorage.setItem('palier-state-v2',JSON.stringify(Object.assign(defaultState(),{
   gear:{bar:2,bars:2,plates:{'0.5':4,'1':12,'2':4}},
   perf:{'goblet-squat':{load:10,range:[13,20],target:20,best:20,sets:[20],date:null},
         'tractions-assistees-supination':{load:0,range:[4,12],target:12,best:8,sets:[8],date:null}}})));
 state=null; await loadState();   /* sauvegarde fabriquee : pas d ancrage domicile ici */
 eq(state.perf['goblet-squat'].range,[8,15],'migration fourchette goblet');
 if(state.perf['tractions-assistees-supination'].band!=='noir') throw new Error('migration bande tractions');
 if(state.gear.maxPerEnd!==5||!state.gear.bands||!state.gear.cuffs) throw new Error('migration gear incomplete');
 if(state.gear.plates['1.25']!==0) throw new Error('migration 1.25 : inventaire existant ne doit pas etre invente');
 console.log('migration OK : fourchettes a plat, bande noire par defaut, gear complete');
 // 9. inventaire : retrait de bande, bornage a la lecture et perf intacte (v2.0)
 state.perf['face-pulls']={load:0,range:[10,18],target:10,best:0,sets:[],date:null,band:'jaune',setsBand:'jaune'};
 flipBand('jaune');
 if(state.gear.bands.jaune) throw new Error('toggleBand inoperant');
 if(state.perf['face-pulls'].band!=='jaune'||state.perf['face-pulls'].setsBand!=='jaune') throw new Error('l inventaire a ecrit dans perf: '+JSON.stringify(state.perf['face-pulls']));
 if(perfFor('face-pulls').band!=='rouge') throw new Error('bornage apres retrait: '+perfFor('face-pulls').band);
 if(!perfFor('face-pulls').gearUp) throw new Error('durcissement force non signale');
 eq(bandLadder(DB['tractions-assistees-supination'],state.gear),['vert','violet','noir','rouge'],'echelle assistance sans jaune');
 /* v2.0 : le garde-fou du dernier barreau a disparu, un profil sans aucun
    elastique est un cas nomme et servi. Ce qui doit tenir, c est que perf
    survive a l etat vide et que le retour rende exactement l etat d avant. */
 ['rouge','noir','violet','vert'].forEach(b=>flipBand(b));
 if(ownedBands(state.gear).length!==0) throw new Error('un profil sans aucun elastique doit etre atteignable');
 if(state.perf['face-pulls'].band!=='jaune'||state.perf['face-pulls'].setsBand!=='jaune') throw new Error('perf touchee par un inventaire vide');
 BANDS.forEach(b=>flipBand(b.id));
 if(perfFor('face-pulls').band!=='jaune') throw new Error('retour a l identique apres recochage: '+perfFor('face-pulls').band);
 // 10. lestes retires : la charge prescrite retombe, la charge canonique reste
 state.perf['goblet-squat']={load:16,range:[8,15],target:8,best:15,sets:[15],date:null};
 toggleCuff('2');
 if(state.perf['goblet-squat'].load!==16) throw new Error('toggleCuff a ecrit dans perf: '+state.perf['goblet-squat'].load);
 if(perfFor('goblet-squat').load!==12) throw new Error('bornage apres retrait de leste: '+perfFor('goblet-squat').load);
 toggleCuff('2');
 if(perfFor('goblet-squat').load!==16) throw new Error('retour a l identique apres recochage du leste');
 console.log('inventaire OK : perf intacte, prescription bornee, retour a l identique');
 // 11. seance avec repli : marqueur enregistre, bande du repli intacte sur l original
 state=null; localStorage._m={}; await loadState(); domicile();
 state.warm='aucun'; state.cardio=false;
 startSession();
 const first=cur.steps[0].id;
 if(first!=='pompes-poignees') throw new Error('premier exo attendu pompes: '+first);
 swapPain();
 if(cur.steps[0].id!=='pompes-inclinees') throw new Error('swap rate');
 TVAL(cur.steps[0],8);
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const h=state.hist[state.hist.length-1];
 if(!h.items[0].sw) throw new Error('marqueur de repli absent de l historique');
 if(!/repli/.test(html)) throw new Error('tag repli absent du recap');
 console.log('repli OK : marqueur en historique et au recap');
 // 12. bande photographiee dans l item d historique, avant progression
 cur=null; state.hist=[]; state.perf={};
 startSession();
 let guard=0;
 while(view==='session'&&guard++<300){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ TVAL(s,DB[s.id].reps?DB[s.id].reps[1]:30); } else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 const h2=state.hist[state.hist.length-1];
 const tr=h2.items.find(it=>DB[it.id].bnd);
 if(tr&&tr.band){
   const start0=DB[tr.id].band0||bandLadder(DB[tr.id],state.gear)[0];
   if(tr.band!==start0) throw new Error('bande historisee doit etre celle utilisee, pas la suivante: '+tr.band);
 }
 console.log('historique OK : bande photographiee avant progression'+(tr?' ('+tr.id+' : '+tr.band+')':''));
 // 13. deblocages atteignables
 if(DB['rdl-kettlebell'].lock.need!==15||DB['kb-swings'].lock.need!==15) throw new Error('needs non corriges');
 if(DB['rdl-kettlebell'].lock.need>DB['goblet-squat'].reps[1]) throw new Error('rdl toujours indeblocable');
 console.log('deblocages OK :need 15, atteignable dans les fourchettes');
 console.log('TESTS V1.2 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
