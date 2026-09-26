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
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 state.showDetail=true;
 // depuis l'accueil : le retour doit ramener a l'accueil
 view='home'; render();
 showFiche('goblet-squat','home');
 if(!/go\\('home'\\)/.test(html)) throw new Error('retour accueil absent depuis le detail');
 if(!/Retour à la séance/.test(html)) throw new Error('libelle retour accueil');
 // depuis la bibliotheque
 view='lib'; render();
 showFiche('goblet-squat','lib');
 if(!/go\\('lib'\\)/.test(html)) throw new Error('retour bibliotheque absent');
 // depuis les progres
 showFiche('goblet-squat','prog');
 if(!/go\\('prog'\\)/.test(html)) throw new Error('retour progres absent');
 // memorisation : appel sans origine garde la derniere
 showFiche('planche');
 if(!/go\\('prog'\\)/.test(html)) throw new Error('origine non memorisee');
 // toutes les fiches se rendent depuis chaque origine
 Object.keys(DB).forEach(id=>{['home','lib','prog'].forEach(o=>showFiche(id,o));});
 console.log('retour contextuel OK sur',Object.keys(DB).length,'fiches × 3 origines');
 // les lignes de la vue progres sont cliquables
 state.perf['goblet-squat']={load:10,range:[8,15],target:9,best:12,sets:[10,9],date:new Date().toISOString()};
 view='prog'; render();
 if(!/showFiche\\('goblet-squat','prog'\\)/.test(html)) throw new Error('ligne progres non cliquable');
 console.log('lignes progres cliquables OK');
 console.log('TESTS NAVIGATION OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
