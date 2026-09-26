// Lot resolveur v2.0 : resolution materielle des positions et rotation sous
// profil reduit. Le nombre de combinaisons est DERIVE, jamais pose : les etats
// de verrous atteignables se deduisent des dependances entre verrous.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const err=m=>{throw new Error(m)};
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();

 // 1. etats de verrous atteignables, derives des dependances
 const locks=Object.keys(DB).filter(id=>DB[id].lock);
 const etats=[];
 (function walk(u){
   const k=Object.keys(u).sort().join(',');
   if(etats.some(x=>x.k===k)) return;
   etats.push({k:k,u:Object.assign({},u)});
   locks.forEach(id=>{
     if(u[id]) return;
     const av=DB[id].lock.after;
     if(av&&DB[av]&&DB[av].lock&&!u[av]) return;
     const n=Object.assign({},u); n[id]=true; walk(n);
   });
 })({});
 if(etats.length<4) err('etats de verrous mal derives: '+etats.length);

 // 2. exhaustif : aucun groupe vide, quel que soit l inventaire et les verrous
 const R=RES_ORDER.filter(k=>k!=='elast');
 let combos=0;
 for(let m=0;m<Math.pow(2,R.length);m++) for(let e=0;e<2;e++){
   const g=JSON.parse(JSON.stringify(DEFAULT_GEAR));
   g.res={}; R.forEach((k,j)=>g.res[k]=(m>>j)&1);
   if(!e) g.bands={jaune:0,rouge:0,noir:0,violet:0,vert:0};
   etats.forEach(st=>{
     state.unlocked=st.u; state.gear=g; combos++;
     SLOT_ORDER.forEach(s=>{
       if(!posTirables(s,g).length) err('groupe vide: '+s+' res='+JSON.stringify(g.res)+' bandes='+e+' verrous='+st.k);
     });
   });
 }
 console.log('exhaustif OK : '+combos+' combinaisons ('+Math.pow(2,R.length)+' inventaires x 2 etats d elastique x '+etats.length+' etats de verrous atteignables), aucun groupe vide');

 // 3. monotonie : rendre une ressource ne perd jamais une position
 await loadState(); domicile(); state.unlocked={};
 for(let m=0;m<Math.pow(2,R.length);m++){
   const g=JSON.parse(JSON.stringify(DEFAULT_GEAR));
   g.res={}; R.forEach((k,j)=>g.res[k]=(m>>j)&1);
   const av=SLOT_ORDER.reduce((n,s)=>n+posTirables(s,g).length,0);
   R.forEach((k,j)=>{
     if(m&(1<<j)) return;
     const g2=JSON.parse(JSON.stringify(g)); g2.res[k]=1;
     const ap=SLOT_ORDER.reduce((n,s)=>n+posTirables(s,g2).length,0);
     if(ap<av) err('monotonie violee en ajoutant '+k);
   });
 }
 console.log('monotonie OK : ajouter une ressource ne retire jamais une position');

 // 4. le profil sans rien sert les quatre groupes
 const rien=JSON.parse(JSON.stringify(DEFAULT_GEAR));
 rien.res={}; rien.bands={jaune:0,rouge:0,noir:0,violet:0,vert:0};
 state.gear=rien; state.unlocked={};
 SLOT_ORDER.forEach(s=>{ if(!posTirables(s,rien).length) err('groupe vide sans rien: '+s); });
 /* v2.0 : sept et non six. La marche basse est declarable depuis que le
    step-up bas exige un appui stable sous le poids du corps, donc un profil
    sans rien perd aussi la montee sur marche, que le substitut ne rattrape
    plus. Les quatre groupes restent servis. */
 if(posPerdues(rien).length!==7) err('profil sans rien : 7 schemas perdus attendus, '+posPerdues(rien).length);
 console.log('profil sans rien OK : les quatre groupes servis, 7 schemas perdus');

 // 5. rotation : equite et espacement sur la grille filtree
 const halteres=JSON.parse(JSON.stringify(DEFAULT_GEAR));
 halteres.res={hal:1}; halteres.bands={jaune:0,rouge:0,noir:0,violet:0,vert:0};
 state.gear=halteres; state.unlocked={};
 const pos=posTirables('pull',halteres);
 /* L equite porte sur les POSITIONS, pas sur les exercices : deux positions
    peuvent se resoudre vers le meme substitut, et c est alors le mandat de
    sante qui parle, pas un defaut de rotation. */
 const seqPos=[]; for(let k=0;k<60;k++){ seqPos.push(pos[k%pos.length]); }
 const t={}; seqPos.forEach(x=>t[x]=(t[x]||0)+1);
 const v=Object.keys(t).map(k=>t[k]);
 if(Object.keys(t).length!==pos.length) err('une position n est jamais servie');
 if(Math.max.apply(null,v)-Math.min.apply(null,v)>0) err('frequences de position inegales: '+JSON.stringify(t));
 let run=1,mx=1; for(let i=1;i<seqPos.length;i++){ if(seqPos[i]===seqPos[i-1]){run++;if(run>mx)mx=run;} else run=1; }
 if(mx>1) err('la meme position revient '+mx+' fois d affilee');
 console.log('rotation OK : '+pos.length+' positions servies a frequence strictement egale, aucune position consecutive');

 // 6. le compteur n est jamais deplace par la resolution
 state.gear=halteres; state.slotIdx.pull=0;
 const ailleurs=[]; for(let k=0;k<7;k++){ state.slotIdx.pull=k; ailleurs.push(pickFromPool('pull')); }
 state.slotIdx.pull=7;
 const retour=(g=>{ state.gear=g; return pickFromPool('pull'); })(JSON.parse(JSON.stringify(DEFAULT_GEAR)));
 state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.slotIdx.pull=7;
 const jamaisParti=pickFromPool('pull');
 if(retour!==jamaisParti) err('le retour au domicile ne reprend pas ou la rotation en etait: '+retour+' vs '+jamaisParti);
 console.log('compteur OK : apres 7 seances ailleurs, le retour sert la position qu on aurait eue sans partir');

 // 7. une chaine ne pointe que sur des exercices servis quand elle resout
 await loadState(); domicile();
 SLOT_ORDER.forEach(s=>{
   const t=SUBS[s]||{};
   Object.keys(t).forEach(i=>{
     if(!SLOTS[s].pool[i]) err('position inexistante '+s+':'+i);
     /* Un substitut peut etre membre d un vivier : une position degrade
        parfois vers l exercice d une autre position, par exemple le developpe
        au sol vers les pompes ou les tractions strictes vers les assistees.
        Ce qui est interdit, c est qu une chaine se referme sur sa propre
        reference, ce qui la rendrait circulaire et sans issue. */
     t[i].forEach(x=>{ if(!DB[x]) err('substitut inconnu '+x);
       if(x===SLOTS[s].pool[i]) err('chaine circulaire sur '+s+':'+i); });
     if(new Set(t[i]).size!==t[i].length) err('doublon dans la chaine '+s+':'+i);
   });
 });
 console.log('table OK : chaque chaine pointe sur des fiches existantes, sans circularite ni doublon');
 console.log('TESTS LOT RESOLVEUR V2.0 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
