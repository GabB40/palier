// Lot v2.8 : dephasage des quatre viviers. Le tirage n etait determine que par
// un seul entier, les quatre compteurs valant toujours la meme chose. La suite
// verifie ce que le dephasage apporte, ce qu il ne doit surtout pas casser, et
// la garantie qui a ete echangee contre lui.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async function(){
 await loadState();
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 state.hist=[]; state.perf={}; state.unlocked={}; lightMode=false;
 const tirables=s=>posTirables(s,state.gear);
 const tirage=c=>{ SLOT_ORDER.forEach(s=>state.slotIdx[s]=c); return SLOT_ORDER.map(pickFromPool); };

 // 1. la transformation est une lecture pure : elle ne deplace jamais le compteur
 {
   SLOT_ORDER.forEach(s=>state.slotIdx[s]=7);
   const avant=JSON.stringify(state.slotIdx);
   buildSession(); drawAhead(3); pickFromPool('legs'); pickAt('core',5);
   if(JSON.stringify(state.slotIdx)!==avant)
     throw new Error('le compteur a bouge a la lecture : '+avant+' -> '+JSON.stringify(state.slotIdx));
   console.log('lecture pure OK : ni buildSession, ni le carrousel, ni un tirage isole ne deplacent slotIdx');
 }

 // 2. frequence strictement inchangee : toute tranche de n tirages consecutifs
 //    alignee sur un tour de vivier est une permutation du vivier
 {
   SLOT_ORDER.forEach(s=>{
     const n=tirables(s).length, cnt={};
     for(let c=0;c<n*n*8;c++) { const id=phaseIdx(s,c,n); cnt[id]=(cnt[id]||0)+1; }
     const v=Object.keys(cnt).map(k=>cnt[k]);
     if(Object.keys(cnt).length!==n) throw new Error('positions manquantes sur '+s);
     if(Math.max.apply(null,v)!==Math.min.apply(null,v))
       throw new Error('frequence inegale sur '+s+' : '+v.join(','));
     for(let b=0;b<n*6;b++){
       const vus=new Set();
       for(let j=0;j<n;j++) vus.add(phaseIdx(s,b*n+j,n));
       if(vus.size!==n) throw new Error('la tranche alignee '+b+' de '+s+' n est pas une permutation');
     }
   });
   console.log('frequence OK : ecart nul sur les quatre viviers, chaque tour de vivier est une permutation');
 }

 // 3. aucun vivier ne redonne le meme exercice deux seances de suite
 {
   SLOT_ORDER.forEach(s=>{
     const n=tirables(s).length;
     for(let c=0;c<n*n*8;c++)
       if(phaseIdx(s,c,n)===phaseIdx(s,c+1,n))
         throw new Error('position repetee deux seances de suite sur '+s+' au compteur '+c);
   });
   console.log('enchainement OK : aucune position ne sort deux seances de suite');
 }

 // 4. les paires rigides ont disparu, et les quatuors atteignent le maximum
 //    arithmetique. Le maximum se calcule sur les exercices DISTINCTS des
 //    viviers : face pulls occupe deux positions du vivier tire, a dessein.
 {
   const distincts=SLOT_ORDER.map(s=>new Set(tirables(s).map(i=>SLOTS[s].pool[i])).size);
   const max=distincts.reduce((a,b)=>a*b,1);
   const quat=new Set(), lc=new Set(), pu=new Set();
   for(let c=0;c<900;c++){
     const t=tirage(c);
     quat.add(t.join('|'));
     lc.add(t[SLOT_ORDER.indexOf('legs')]+'+'+t[SLOT_ORDER.indexOf('core')]);
     pu.add(t[SLOT_ORDER.indexOf('push')]+'+'+t[SLOT_ORDER.indexOf('pull')]);
   }
   if(quat.size!==max) throw new Error('quatuors '+quat.size+' pour un maximum de '+max);
   const nl=new Set(tirables('legs').map(i=>SLOTS.legs.pool[i])).size;
   const nc=new Set(tirables('core').map(i=>SLOTS.core.pool[i])).size;
   if(lc.size!==nl*nc) throw new Error('paires jambes+gainage '+lc.size+' au lieu de '+(nl*nc));
   const np=new Set(tirables('push').map(i=>SLOTS.push.pool[i])).size;
   const nu=new Set(tirables('pull').map(i=>SLOTS.pull.pool[i])).size;
   if(pu.size!==np*nu) throw new Error('paires pousse+tire '+pu.size+' au lieu de '+(np*nu));
   console.log('dephasage OK : '+quat.size+' quatuors sur '+max+' possibles, '+lc.size+' paires jambes+gainage, '+pu.size+' paires pousse+tire');
 }

 // 5. les paires nommees au carnet ne sont plus rigides
 {
   let gp=0, gAutre=0, ef=0, eAutre=0;
   for(let c=0;c<900;c++){
     const t=tirage(c);
     const L=t[SLOT_ORDER.indexOf('legs')], C=t[SLOT_ORDER.indexOf('core')];
     const P=t[SLOT_ORDER.indexOf('push')], U=t[SLOT_ORDER.indexOf('pull')];
     if(L==='goblet-squat'){ if(C==='planche') gp++; else gAutre++; }
     if(P==='elevations-laterales'){ if(U==='face-pulls') ef++; else eAutre++; }
   }
   if(gAutre===0) throw new Error('goblet squat toujours apparie a la planche');
   if(eAutre===0) throw new Error('elevations laterales toujours appariees aux face pulls');
   console.log('paires OK : goblet squat avec la planche '+gp+' fois et avec autre chose '+gAutre+', elevations avec face pulls '+ef+' fois et avec autre chose '+eAutre);
 }

 // 6. le carrousel reste exact : le panneau k annonce le tirage qui sortira
 //    reellement k seances plus tard, a jeu normal
 {
   const N=aheadCount();
   for(let dep=0;dep<120;dep++){
     SLOT_ORDER.forEach(s=>state.slotIdx[s]=dep);
     const annonce=[]; for(let k=0;k<N;k++) annonce.push(drawAhead(k).join('|'));
     for(let k=0;k<N;k++){
       const reel=tirage(dep+k).join('|');
       if(reel!==annonce[k]) throw new Error('panneau '+k+' au depart '+dep+' : annonce '+annonce[k]+', sort '+reel);
     }
   }
   console.log('carrousel OK : '+N+' panneaux exacts sur 120 departs');
 }

 // 7. la garantie echangee est bien echangee, et pas seulement affaiblie :
 //    l exhaustivite sur la fenetre du carrousel n existe plus, c est le prix
 //    assume du dephasage. On verifie qu elle tombe reellement, sinon le
 //    dephasage n aurait pas eu lieu.
 {
   const N=aheadCount();
   let manquants=0;
   for(let dep=0;dep<120;dep++){
     const vus={};
     for(let k=0;k<N;k++) tirage(dep+k).forEach(id=>vus[id]=1);
     const tous=[].concat.apply([],SLOT_ORDER.map(s=>tirables(s).map(i=>SLOTS[s].pool[i])));
     if(tous.some(id=>!vus[id])) manquants++;
   }
   if(manquants===0) throw new Error('la fenetre reste exhaustive : les viviers ne sont pas dephases');
   console.log('fenetre OK : exhaustivite perdue sur '+manquants+' departs sur 120, prix assume du dephasage');
 }

 // 8. la garantie de la v2.0 tient : un retour au profil precedent reprend la
 //    rotation ou elle en etait, le compteur n etant deplace par rien
 {
   const ref=[]; for(let c=0;c<12;c++) ref.push(tirage(c).join('|'));
   const gear=JSON.parse(JSON.stringify(state.gear));
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR));
   Object.keys(state.gear.res).forEach(k=>{ if(k!=='hal') state.gear.res[k]=0; });
   for(let c=0;c<7;c++) tirage(c);
   state.gear=gear;
   for(let c=0;c<12;c++)
     if(tirage(c).join('|')!==ref[c]) throw new Error('la rotation ne reprend pas ou elle en etait, compteur '+c);
   console.log('retour de profil OK : sept seances ailleurs ne deplacent rien');
 }

 // 9. le gel de rotation continue de dephaser : deux emplacements dont les
 //    compteurs different tirent independamment
 {
   state.slotIdx={push:0,pull:0,core:0,legs:0};
   const a=SLOT_ORDER.map(pickFromPool);
   state.slotIdx={push:0,pull:0,core:0,legs:3};
   const b=SLOT_ORDER.map(pickFromPool);
   const iL=SLOT_ORDER.indexOf('legs'), iC=SLOT_ORDER.indexOf('core');
   if(a[iL]===b[iL]) throw new Error('un compteur jambes decale ne change pas le tirage jambes');
   if(a[iC]!==b[iC]) throw new Error('un compteur jambes decale a change le tirage gainage');
   console.log('compteurs OK : chaque emplacement ne lit que le sien');
 }

 // 10. les phases sont declarees et non derivees du rang dans le circuit : les
 //     deux decisions doivent rester separables
 {
   if(typeof SLOT_PHASE==='undefined') throw new Error('SLOT_PHASE absent');
   SLOT_ORDER.forEach(s=>{ if(typeof SLOT_PHASE[s]!=='number') throw new Error('phase absente pour '+s); });
   const vals=SLOT_ORDER.map(s=>SLOT_PHASE[s]);
   if(new Set(vals).size!==vals.length) throw new Error('deux emplacements partagent la meme phase');
   if(SLOT_PHASE.core===SLOT_PHASE.legs) throw new Error('jambes et gainage, de meme taille, partagent leur phase');
   if(SLOT_PHASE.push!==0) throw new Error('le plus petit vivier doit garder sa rotation reguliere');
   if(phaseIdx('push',7,3)!==7%3) throw new Error('le vivier pousse n est plus a rotation reguliere');
   console.log('phases OK : quatre valeurs distinctes, declarees, pousse a rotation inchangee');
 }

 // 11. le tirage reste borne au vivier tirable, verrous et materiel compris
 {
   for(let c=0;c<200;c++){
     SLOT_ORDER.forEach(s=>{
       state.slotIdx[s]=c;
       const pos=tirables(s), id=pickFromPool(s);
       const ok=pos.map(i=>SLOTS[s].pool[i]);
       if(ok.indexOf(id)<0&&!Object.keys(SUBS).some(k=>SUBS[k]&&SUBS[k].indexOf&&SUBS[k].indexOf(id)>=0))
         if(ok.map(x=>resolvePos(s,SLOTS[s].pool.indexOf(x),state.gear)||x).indexOf(id)<0)
           throw new Error('tirage hors vivier sur '+s+' au compteur '+c+' : '+id);
     });
   }
   state.slotIdx={push:0,pull:0,core:0,legs:0};
   console.log('bornage OK : 200 compteurs, aucun tirage hors du vivier tirable');
 }

 console.log('TESTS DEPHASAGE DES VIVIERS V2.8 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
