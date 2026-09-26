// Lot v2.20 : repere sonore des tenues chronometrees. Un clic discret toutes
// les 5 s pendant planche et gainage lateral, actif par defaut, coupable dans
// la card Sons, qui se tait sous l approche et la cible et continue apres la
// cible. Repere pur : la mesure ne change pas.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
/* chaque oscillateur retient sa frequence et le pic de gain que son
   enveloppe atteint : beep monte a 0,5, tone au gain demande */
const oscs=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),
  AudioContext:function(){ return {currentTime:0,destination:{},state:'running',
    createOscillator:()=>{const o={frequency:{value:0},peak:0,connect(g){g.osc=o;},start(){},stop(){}};oscs.push(o);return o;},
    createGain:()=>{const g={gain:{setValueAtTime(){},exponentialRampToValueAtTime(v){ if(g.osc&&v>g.osc.peak) g.osc.peak=v; }},connect(){}};return g;}};}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
let ticks=[];
const vraiClear=global.clearInterval;
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ if(t&&t.f) ticks=ticks.filter(x=>x!==t); else if(t) vraiClear(t); };
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
/* ce qui a sonne a chaque seconde de tenue : 'r' repere, 'a' approche,
   'c' cible, '' rien. Un beep emet deux oscillateurs, un tone un seul. */
global.parSeconde=n=>{ const out=[];
  for(let i=0;i<n;i++){ const k=oscs.length; tic(1); const nv=oscs.slice(k);
    const f=nv.map(o=>o.frequency.value);
    const j=f.join('/');
    out.push(j===''?'':j==='1200/1200'?'c':j==='700/700'?'a':j===String(global.REPFREQ)?'r':'?'+j); }
  return out; };
global.oscs=oscs;
const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState();
   domicile(); state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=0; };
 /* une etape de tenue, reaffectee a l exercice voulu, mesure vierge */
 const tenue=async(id,cible)=>{ await neuf(); startSession(); let g=0;
   while(g++<400){ const s=cur.steps[cur.i];
     if(s&&s.k==='set'&&DB[s.id].mode==='time') break;
     if(s&&s.k==='set'){ const e=DB[s.id];
       if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; }
       else if(e.cadence){ holdInit(s,e); s.sides=[8,8]; s.side=1; s.done=true; s.val=8; }
       else s.val=8;
       validateSet(); }
     else nextStep(); }
   const st=cur.steps[cur.i];
   if(!st||DB[st.id].mode!=='time') throw new Error('aucune tenue dans la seance');
   st.id=id; st.key=id; delete st.sides; delete st.side; delete st.val; delete st.done;
   perfOf(id).target=cible; holdInit(st,DB[id]); renderSession(); oscs.length=0; return st; };
 const attendu=(n,cible,pas)=>{ const out=[];
   for(let v=1;v<=n;v++){ const k=preBipKind(v,cible);
     out.push(k===2?'c':k===1?'a':(pas&&v%pas===0)?'r':''); } return out; };
 const cmp=(a,b,msg)=>{ if(a.join(',')!==b.join(',')) throw new Error(msg+' : attendu '+b.join(',')+' obtenu '+a.join(',')); };

 global.REPFREQ=REPERE.freq;
 // 1. constantes et porte
 if(REPERE.pas!==5) throw new Error('le pas du repere doit valoir celui des tenues, 5 s');
 if(!(REPERE.gain>0&&REPERE.gain<.45)) throw new Error('le repere doit jouer plus bas que les autres sons');
 if([700,950,1150,1200].indexOf(REPERE.freq)>=0) throw new Error('le repere doit avoir son propre timbre');
 if(!(REPERE.dur<=.06)) throw new Error('le repere doit etre bref');
 await neuf();
 if(!repereOn()) throw new Error('le repere doit etre actif par defaut');
 if('repere' in defaultState()) throw new Error('la cle absente vaut vrai, comme les sons : pas de cle dans l etat neuf');
 state.repere=false; if(repereOn()) throw new Error('state.repere=false doit couper le repere');
 console.log('constantes OK : pas 5 s, gain sous 0,45, timbre propre, bref, actif par defaut sans cle');

 // 2. planche a 45 : repere aux multiples de 5, approche et cible inchangees, et ca continue
 let st=await tenue('planche',45);
 toggleChrono();
 let got=parSeconde(56);
 cmp(got,attendu(56,45,5),'sequence a cible 45');
 if(got.filter(x=>x==='r').length!==9) throw new Error('7 reperes avant l approche et 2 apres la cible attendus');
 if(got[39]!=='a'||got[44]!=='c'||got[49]!=='r'||got[54]!=='r') throw new Error('approche a 40, cible a 45, reperes a 50 et 55');
 const reps=oscs.filter(o=>o.frequency.value===REPERE.freq);
 if(!reps.length||reps.some(o=>Math.abs(o.peak-REPERE.gain)>1e-9)) throw new Error('le repere doit sonner au gain REPERE.gain');
 if(oscs.filter(o=>o.frequency.value===700).some(o=>o.peak!==.5)) throw new Error('l approche garde le volume de beep');
 toggleChrono();
 if(st.sides[0]!==56) throw new Error('la mesure reste la seconde du Stop, pas le dernier repere : '+st.sides[0]);
 console.log('planche 45 OK : reperes 5 a 35, approche 40-44, cible 45, reperes 50 et 55, gain propre, mesure intacte');

 // 3. cible courte, et cible hors du pas
 st=await tenue('planche',20); toggleChrono();
 cmp(parSeconde(26),attendu(26,20,5),'sequence a cible 20');
 st=await tenue('planche',5); toggleChrono();
 cmp(parSeconde(11),attendu(11,5,5),'sequence a cible 5');
 st=await tenue('planche',33); toggleChrono();
 got=parSeconde(36);
 cmp(got,attendu(36,33,5),'sequence a cible 33');
 if(got[29]!=='a') throw new Error('sous l approche, le repere se tait');
 console.log('cibles OK : 20, 5 et 33, l approche et la cible gagnent toujours');

 // 4. tenue par cote : le second cote repart de zero
 st=await tenue('gainage-lateral',15);
 if(st.sides.length!==2) throw new Error('gainage lateral : deux cotes');
 toggleChrono(); cmp(parSeconde(17),attendu(17,15,5),'premier cote');
 toggleChrono(); toggleChrono(); oscs.length=0;
 cmp(parSeconde(12),attendu(12,15,5),'second cote');
 console.log('par cote OK : le repere repart a zero au second cote');

 // 5. coupe, et sous le son global coupe
 st=await tenue('planche',45); state.repere=false; toggleChrono();
 cmp(parSeconde(46),attendu(46,45,0),'repere coupe');
 st=await tenue('planche',45); state.sound=false; toggleChrono();
 got=parSeconde(46);
 if(oscs.length) throw new Error('son global coupe : rien ne sonne, repere compris');
 console.log('interrupteurs OK : repere coupe sans toucher a l approche, son global coupe tout');

 // 6. perimetre : le repere n appartient qu aux tenues chronometrees
 const code=src;
 const usages=(code.match(/REPERE\\.freq/g)||[]).length;
 if(usages!==1) throw new Error('un seul point d emission du repere attendu, trouve '+usages);
 const i=code.indexOf('REPERE.freq'), fn=code.lastIndexOf('function ',i);
 if(code.slice(fn,fn+16)!=='function runHold') throw new Error('le repere doit vivre dans runHold');
 await neuf(); state.stretch=true; startSession(); let g=0;
 while(g++<600&&!(cur.steps[cur.i]&&cur.steps[cur.i].cool)){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let k=0;k<s.sides.length;k++) s.sides[k]=30; s.done=true; }
     else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; }
     else if(e.cadence){ holdInit(s,e); s.sides=[8,8]; s.side=1; s.done=true; s.val=8; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
 if(!cur.steps[cur.i]||!cur.steps[cur.i].cool) throw new Error('aucun etirement atteint');
 renderSession(); oscs.length=0; toggleStretch(); tic(40);
 if(oscs.some(o=>o.frequency.value===REPERE.freq)) throw new Error('pas de repere sur les etirements');
 console.log('perimetre OK : un seul point d emission, dans runHold, rien sur les etirements');

 // 7. reglages : ligne, en-tete, bascule persistee par le vrai chemin d entree
 await neuf(); delete state.prep; view='set'; render();
 if(html.indexOf('<span class="ttl">Sons</span><span class="val">Activés · décompte 5 s · repère 5 s</span>')<0) throw new Error('en-tete de la card Sons');
 if(!/setRepere\\(false\\)/.test(html)||!/Repère activé/.test(html)) throw new Error('bascule du repere absente');
 setRepere(false);
 if(html.indexOf('<span class="val">Activés · décompte 5 s</span>')<0) throw new Error('repere coupe : en-tete sans repere');
 state=null; await loadState();
 if(repereOn()) throw new Error('le reglage doit survivre au rechargement');
 setRepere(true); state=null; await loadState();
 if(!repereOn()) throw new Error('reactivation perdue au rechargement');
 console.log('reglages OK : en-tete, bascule, aller-retour par le stockage');

 // 8. aucune migration : une sauvegarde sans cle garde le repere actif
 await neuf(); const vieux=JSON.parse(JSON.stringify(state)); delete vieux.repere;
 localStorage._m={}; localStorage.setItem('palier-state-v2',JSON.stringify(vieux)); state=null; await loadState();
 if(!repereOn()||('repere' in state)) throw new Error('une sauvegarde anterieure garde le repere actif, sans cle creee');
 console.log('migration OK : aucune, la cle absente vaut vrai');
 console.log('TESTS REPERE DES TENUES V2.20 OK');
})().catch(e=>{ console.error('ECHEC: '+e.message); process.exit(1); });
`;
eval(src+T);
