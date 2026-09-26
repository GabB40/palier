// Lot integrite v2.0 : l inventaire ne modifie jamais perf, il borne a la
// lecture ; les trois regimes de provenance sont unifies et aucune branche ne
// peut oublier la garde. Temoins systematiques : chaque mesure est doublee
// d une sequence privee du geste incrimine.
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
 /* On compare les entrees deja presentes : le rendu peut en creer de nouvelles
    par initialisation, et l initialisation d un exercice jamais joue lit
    legitimement le profil actif. */
 let refKeys=[];
 const snap=()=>JSON.stringify(refKeys.map(k=>[k,state.perf[k]]));

 // 1. l echelle realisable est l ordre filtre : la reecriture de bandLadder
 //    est prouvee equivalente a la formule de la v1.18 sur tout l inventaire
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 /* v2.0 : la presence d un niveau EST sa realisation, on bascule par setBandReal */
 const flipBand=id=>setBandReal(id, bandReal(id)?'':(coulOK(id)?id:'gris'));
 const bandEx=Object.keys(DB).filter(id=>DB[id].bnd);
 const fixedEx=Object.keys(DB).filter(id=>DB[id].mode==='fixed');
 /* v2.13 : deux fiches a charge fixe de plus, l escalier du pont fessier. Le
    compte des exercices a bande ne bouge pas, le lot n en touche aucun. */
 /* v2.18 : une de plus, le squat sur une jambe leste. */
 if(bandEx.length!==12||fixedEx.length!==9) err('portee structurelle: '+bandEx.length+'/'+fixedEx.length);
 const ids=BANDS.map(b=>b.id);
 /* v2.0 : le nombre d inventaires est DERIVE de l echelle et non pose. Il passe
    de 32 a 64 avec le sixieme niveau, et suivra tout seul si l echelle bouge. */
 const NINV=Math.pow(2,ids.length);
 for(let m=0;m<NINV;m++){
   const g={bands:{}}; ids.forEach((b,i)=>g.bands[b]=(m>>i)&1);
   const own=ownedBands(g);
   bandEx.forEach(id=>{
     const e=DB[id];
     const ref=(e.bnd==='ass')?own.slice().reverse():(e.bnd0?['aucune']:[]).concat(own);
     const got=bandLadder(e,g);
     if(JSON.stringify(ref)!==JSON.stringify(got)) err('bandLadder diverge sur '+id+' m='+m);
     // l ordre complet contient toujours l echelle realisable, dans le meme ordre
     const O=bandOrder(e);
     if(JSON.stringify(got)!==JSON.stringify(O.filter(b=>got.indexOf(b)>=0))) err('ordre non respecte '+id);
   });
 }
 console.log('echelle OK : bandLadder est bandOrder filtre par l inventaire, '+NINV+' inventaires x '+bandEx.length+' exercices');

 // 2. le bornage ne durcit jamais, et rend le plus difficile disponible
 //    qui ne depasse pas le canonique
 let bornes=0, forces=0;
 bandEx.forEach(id=>{
   const e=DB[id], O=bandOrder(e);
   O.forEach(can=>{
     for(let m=1;m<NINV;m++){
       const g={bands:{}}; ids.forEach((b,i)=>g.bands[b]=(m>>i)&1);
       const L=bandLadder(e,g), r=bandBorne(e,can,g);
       if(!L.length) continue;
       if(L.indexOf(r.band)<0) err('barreau prescrit hors echelle: '+id+' '+r.band);
       const rc=O.indexOf(can), rp=O.indexOf(r.band);
       const dispo=L.filter(b=>O.indexOf(b)<=rc);
       if(dispo.length){
         if(r.up) err('durcissement annonce alors qu un barreau plus facile existe: '+id);
         if(rp>rc) err('le bornage a durci: '+id+' '+can+' -> '+r.band);
         const attendu=dispo[dispo.length-1];
         if(r.band!==attendu) err('bornage non maximal: '+id+' '+can+' -> '+r.band+' au lieu de '+attendu);
         bornes++;
       } else {
         if(!r.up) err('durcissement force non signale: '+id+' '+can);
         if(r.band!==L[0]) err('repli force doit rendre le plus facile disponible');
         forces++;
       }
     }
   });
 });
 console.log('bornage bandes OK : '+bornes+' cas bornes sans durcir, '+forces+' cas de durcissement force signales par gearUp');

 // 3. meme regle sur les echelles chargees
 [[{'1':1,'2':1},16],[{'1':1,'2':0},16],[{'1':0,'2':1},16],[{'1':0,'2':0},16]].forEach(c=>{
   state.gear.cuffs=c[0];
   const L=fixedLadder('goblet-squat',state.gear).map(x=>x.v);
   const r=loadBorne('goblet-squat',c[1],state.gear);
   let att=null; for(const v of L) if(v<=c[1]+0.01) att=v;
   if(r.load!==(att!=null?att:L[0])) err('bornage charge fixe: '+r.load);
   if(r.load>c[1]+0.01) err('le bornage de charge a durci');
 });
 state.gear.cuffs={'1':1,'2':1};
 console.log('bornage charges OK : la charge prescrite ne depasse jamais la charge canonique');

 // 4. aller-retour d inventaire : egalite stricte de perf, avec temoin
 await loadState(); domicile();
 bandEx.concat(fixedEx).forEach(id=>{
   const e=DB[id];
   for(let i=0;i<40;i++){ const p=perfOf(id), top=(p.range||e.reps||[0,0])[1]; applyProgress(id,[top,top,top],true,false); }
   const p=perfOf(id), top=(p.range||e.reps||[0,0])[1]; applyProgress(id,[top-1,top-1,top-1],true,false);
 });
 refKeys=Object.keys(state.perf).sort();
 const avant=snap();
 // temoin : rien touche
 if(snap()!==avant) err('temoin impur');
 // mesure : tout decoche puis recoche, par les commandes des reglages
 ids.slice(1).forEach(b=>{ if(state.gear.bands[b]) flipBand(b); });
 ids.slice(1).forEach(b=>{ if(!state.gear.bands[b]) flipBand(b); });
 ['1','2'].forEach(c=>{ if(state.gear.cuffs[c]) toggleCuff(c); });
 ['1','2'].forEach(c=>{ if(!state.gear.cuffs[c]) toggleCuff(c); });
 if(snap()!==avant) err('l inventaire a modifie perf par les reglages');
 // mesure : bascule vers un inventaire reduit hors garde-fou, puis retour
 const home={bands:Object.assign({},state.gear.bands),cuffs:Object.assign({},state.gear.cuffs)};
 state.gear.bands={jaune:0,rouge:1,noir:0,violet:0,vert:0}; state.gear.cuffs={'1':0,'2':0};
 bandEx.concat(fixedEx).forEach(id=>perfFor(id,false));   // on lit sous inventaire reduit
 state.gear.bands=home.bands; state.gear.cuffs=home.cuffs;
 if(snap()!==avant) err('la lecture sous inventaire reduit a modifie perf');
 console.log('aller-retour OK : perf strictement egale avant et apres, par les reglages et par bascule');

 // 5. perfFor est une lecture, jamais une poignee d ecriture
 const vue=perfFor('face-pulls',false);
 const gardeBand=state.perf['face-pulls'].band, gardeTarget=state.perf['face-pulls'].target;
 vue.band='vert'; vue.target=999;
 if(state.perf['face-pulls'].band!==gardeBand||state.perf['face-pulls'].target!==gardeTarget) err('perfFor rend l objet vivant');
 console.log('lecture OK : ecrire sur la vue rendue par perfFor ne touche pas l etat');

 // 6. temoin de contamination : la sequence allegee puis normale n ouvre plus
 //    le verrou a bandGate, et le verrou s ouvre toujours quand il le doit
 const gates=Object.keys(DB).filter(id=>DB[id].lock&&DB[id].lock.bandGate);
 if(gates.length!==2) err('portee bandGate: '+gates.length);
 const seq=async(avecAllegee,repsNormales)=>{
   await loadState(); domicile();
   state.perf={}; state.unlocked={}; state.rounds=3;
   ['tractions-assistees-supination','tractions-assistees-pronation'].forEach(id=>{
     const p=perfOf(id), L=bandLadder(DB[id],state.gear);
     p.band=L[L.length-1]; p.best=8; p.sets=[8,8,8]; p.range=DB[id].reps.slice(); p.target=8;
   });
   if(avecAllegee) ['tractions-assistees-supination','tractions-assistees-pronation'].forEach(id=>applyProgress(id,[10,10,10],true,true));
   ['tractions-assistees-supination','tractions-assistees-pronation'].forEach(id=>applyProgress(id,[repsNormales,repsNormales,repsNormales],true,false));
   checkUnlocks(3,false);
   return {ouverts:Object.keys(state.unlocked).sort(),
           bb:state.perf['tractions-assistees-supination'].best};
 };
 const mesure=await seq(true,7), temoin=await seq(false,7), legit=await seq(false,10);
 if(JSON.stringify(mesure.ouverts)!==JSON.stringify(temoin.ouverts)) err('la seance allegee ouvre encore un verrou: '+mesure.ouverts.join(','));
 /* v2.12 : le meilleur de bande n existe plus, l action que l allegee ne doit
    pas ecrire est le record. Le barreau joue, lui, est une information et
    s ecrit dans les trois regimes : c est verifie en section 7. */
 if(mesure.bb!==8||temoin.bb!==8) err('record ecrit en allegee: '+mesure.bb);
 gates.forEach(g=>{ if(temoin.ouverts.indexOf(g)>=0) err('verrou ouvert a tort: '+g);
                    if(legit.ouverts.indexOf(g)<0) err('verrou casse, il ne s ouvre plus legitimement: '+g); });
 console.log('contamination OK : allegee sans effet sur les deux verrous a bandGate, et les deux s ouvrent toujours a 10 repetitions');

 // 7. une information s enregistre toujours, une action exige les trois feux verts
 await loadState(); domicile(); state.perf={}; state.unlocked={};
 const p1=perfOf('face-pulls'); p1.band='rouge'; p1.best=5; p1.target=12;
 const t0=p1.target, r0=JSON.stringify(p1.range), l0=p1.load, u0=state.loadUps;
 [[true,false],[false,true],[true,true]].forEach(reg=>{
   applyProgress('face-pulls',[18,18,18],true,reg[0],reg[1]);
   const p=state.perf['face-pulls'];
   if(JSON.stringify(p.sets)!=='[18,18,18]'||!p.date) err('l information ne s est pas enregistree');
   if(p.best!==5) err('action ecrite sous provenance non exploitable');
   /* v2.12 : le barreau joue accompagne les series, il suit donc le meme
      regime qu elles et s ecrit meme sous une provenance inexploitable. */
   if(p.setsBand!=='rouge') err('le barreau joue doit s ecrire avec les series');
   if(p.target!==t0||JSON.stringify(p.range)!==r0||p.load!==l0||p.band!=='rouge') err('cible, fourchette ou niveau touches');
   if(p.grace) err('grace posee');
   if(state.loadUps!==u0) err('compteur de montees touche');
   if(!!p.lightSets!==reg[0]||!!p.unqualSets!==reg[1]) err('marqueurs de provenance mal poses');
   if(checkUnlocks(3,false).length) err('verrou ouvert sous provenance non exploitable');
 });
 // une lecture exploitable, sous le haut de fourchette pour ne pas declencher
 // la montee, qui changerait cible et barreau
 applyProgress('face-pulls',[15,15,15],true,false,false);
 const pf=state.perf['face-pulls'];
 if(pf.lightSets||pf.unqualSets) err('marqueurs non effaces par une lecture exploitable');
 if(pf.best!==15) err('lecture exploitable sans effet: '+pf.best);
 if(pf.target===t0) err('la cible n a pas bouge sur une lecture exploitable');
 console.log('provenance OK : series et date dans les trois regimes, tout le reste sous les trois feux verts');

 // 8. echelle de progression : les montages symetriques seuls (v2.0)
 await loadState(); domicile();
 const A=loadLadder(state.gear), P=loadLadderProg(state.gear);
 if(P.length>=A.length) err('l echelle de progression doit etre un sous-ensemble strict');
 P.forEach(v=>{ if(A.indexOf(v)<0) err('palier de progression absent de l echelle complete: '+v); });
 // aucun ecart de progression sous 0,5 kg : les collisions ont disparu
 for(let i=1;i<P.length;i++) if(P[i]-P[i-1]<0.5-1e-9) err('collision survivante: '+P[i-1]+' -> '+P[i]);
 // les ecarts relatifs se resserrent quand la charge monte, sauf au dernier palier
 let d=[]; for(let i=1;i<P.length;i++) d.push((P[i]-P[i-1])/P[i-1]);
 for(let i=1;i<d.length-1;i++) if(d[i]>d[i-1]+1e-9) err('ecart relatif croissant a l index '+i);
 // le cliquet automatique vit sur l echelle de progression, dans les deux sens
 state.perf={}; const pl=perfOf('developpe-sol'); pl.load=6.25; pl.target=pl.range[1];
 applyProgress('developpe-sol',[pl.range[1],pl.range[1],pl.range[1]],true,false);
 if(pl.load!==6.5) err('montee hors echelle de progression: '+pl.load);
 if(pl.target!==pl.range[0]) err('la cible ne redescend pas au bas de fourchette');
 // l ajustement manuel garde l echelle complete
 if(nextLoad(6.25,state.gear,1)!==6.5||nextLoad(6.5,state.gear,-1)!==6.25) err('l ajustement manuel a perdu le grain fin');
 if(nextLoadProg(6.5,state.gear,-1)!==6) err('le filet de securite doit rester sur l echelle de progression');
 // la seance allegee garde le grain fin
 state.perf={}; const pa=perfOf('developpe-sol'); pa.load=8; pa.target=pa.range[0];
 lightMode=true;
 const la=lightPerf('developpe-sol');
 lightMode=false;
 if(A.indexOf(la.load)<0) err('la reduction allegee doit lire l echelle complete');
 if(la.load>=8) err('la reduction allegee n a pas baisse la charge');
 console.log('echelle de progression OK : '+P.length+' paliers symetriques sur '+A.length+', pas de 0,5 kg minimum, cliquet et filet dessus, ajustement manuel et allegee sur l echelle complete');

 console.log('TESTS LOT INTEGRITE V2.0 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
