const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
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
 const miss=Object.keys(DB).filter(id=>!DB[id].mat);
 if(miss.length) throw new Error('materiel manquant: '+miss.join(','));
 console.log('materiel renseigne pour',Object.keys(DB).length,'exercices');
 [10,15,20].forEach(d=>{ state.duration=d; const p=buildSession();
   console.log(d+' min ->',p.exos.map(i=>DB[i].nom).join(' | '));
   console.log('     materiel:',sessionGear(p).join(' + ')||'aucun');
 });
 for(let i=0;i<10;i++){ const p=buildSession(); sessionDetailHtml(p); SLOT_ORDER.forEach(s=>state.slotIdx[s]++); }
 console.log('detail rendu sur 10 rotations OK');
 view='home'; render();
 /* v1.18 : le carrousel place jusqu a 24 vignettes dans l accueil. Le mot
    cherche doit l etre dans le texte, pas dans du base64 ou il apparait par
    hasard. */
 const txt=h=>h.split('data:image').map((x,i)=>i?x.slice(x.indexOf('"')):x).join(' ');
 if(/tours/i.test(txt(html))) throw new Error('mot tours present sur accueil');
 if(!/Materiel|Matériel/.test(html)) throw new Error('bloc materiel absent du detail');
 if(!/exorow/.test(html)) throw new Error('lignes exercices absentes');
 if(!/<details class="card" data-k="home-detail" open/.test(html)) throw new Error('detail non ouvert alors qu il devrait l etre');
 view='set'; render();
 if(/ tours/i.test(txt(html))) throw new Error('mot tours present dans reglages');
 console.log('vocabulaire uniformise OK, detail present sur accueil');
 /* v1.8 : le detail est une card repliable, toujours rendue, jamais retiree du DOM.
    v1.14 : son ouverture n est plus portee par un drapeau mais par le mecanisme
    commun des cards repliables, verifie par test16. */
 view='home'; render();
 if(!/<details class="card" data-k="home-detail"/.test(html)) throw new Error('card detail absente');
 console.log('card detail toujours rendue OK');
 console.log('TESTS COMPLEMENTAIRES OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
