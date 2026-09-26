// Empreinte de neutralite : tirages, prescriptions et durees a inventaire egal.
// Elle porte sur des valeurs et jamais sur des libelles, les libelles ayant
// change en cours de chantier (accord en genre, fourchettes de tension).
// Usage : node neutre.js <chemin-vers-check.js>
const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||'check.js','utf8')
  .replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 await loadState();
 /* inventaire identique des deux cotes : cinq bandes, sixieme niveau vide,
    marche basse presente, disques et lestes d origine */
 state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR));
 if(state.gear.bands.n6!==undefined) state.gear.bands.n6='';
 state.gear.res.stepbas=1;
 state.onboard=false;
 const L=[];
 ROUNDS_CHOICES.forEach(r=>{
   state.rounds=r;
   [true,false].forEach(cardio=>{
     state.cardio=cardio;
     ['complet','court','aucun'].forEach(w=>{
       state.warm=w;
       for(let k=0;k<10;k++){
         state.slotIdx={push:k,pull:k,legs:k,core:k};
         const p=buildSession();
         const parts=planParts(p);
         const pres=p.exos.map(id=>{
           const q=perfFor(id,false);
           return id+':'+q.target+':'+(q.band||'-')+':'+(q.load||0);
         }).join('|');
         L.push([r,cardio?1:0,w,k,pres,Math.round(parts.total),parts.rm?parts.rm.n:0].join(' '));
       }
     });
   });
 });
 /* echelles, exhaustivite des positions et durees annoncees */
 SLOT_ORDER.forEach(s=>L.push('pool '+s+' '+posTirables(s,state.gear).join(',')));
 L.push('ladder '+loadLadder(state.gear).join(','));
 L.push('ladderProg '+loadLadderProg(state.gear).join(','));
 L.push('mono '+loadLadderMono(state.gear).join(','));
 ['goblet-squat','rdl-kettlebell','kb-swings','rowing-kettlebell'].forEach(id=>
   L.push('fixed '+id+' '+fixedLadder(id,state.gear).map(x=>x.v).join(',')));
 Object.keys(DB).filter(id=>DB[id].bnd).sort().forEach(id=>
   L.push('band '+id+' '+bandLadder(DB[id],state.gear).join(',')));
 ROUNDS_CHOICES.forEach(r=>{ const s=sessionSpan(r,true,'complet'); L.push('span '+r+' '+s.min+'-'+s.max); });
 console.log(L.join('\\n'));
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
