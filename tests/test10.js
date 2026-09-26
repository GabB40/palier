// Nouveaute v1.7 : consignes respiratoires tissees dans le catalogue et
// l echauffement. Aucun champ ni affichage nouveau : le test verifie la
// couverture, le placement (vig pour les tenues, desc pour le reste) et
// l absence de doublon.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
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
 const RESP=/souffl|Souffl|respir|Respir|inspire|Inspire/;
 const ids=Object.keys(DB);
 // 1. couverture : chaque exercice porte une consigne respiratoire
 const nus=ids.filter(id=>{const e=DB[id];return !RESP.test((e.desc||[]).join(' ')+' '+(e.vig||''));});
 if(nus.length) throw new Error('exercices sans consigne respiratoire : '+nus.join(', '));
 console.log('couverture OK : '+ids.length+' exercices portent une consigne respiratoire');
 // 2. tenues : la consigne anti-apnee est en vig, visible sans deplier
 const tenues=ids.filter(id=>CFG[id]&&CFG[id].mode==='time');
 /* v2.19 : quatre, le gainage lateral jambe levee passe en repetitions cadencees */
if(tenues.length!==4) throw new Error('4 exercices tenus attendus, '+tenues.length+' trouves');
 tenues.forEach(id=>{
   if(!/ne bloque jamais/.test(DB[id].vig||'')) throw new Error('consigne anti-apnee absente de la vigilance : '+id);
   if(RESP.test((DB[id].desc||[]).join(' '))) throw new Error('consigne respiratoire dupliquee en desc : '+id);
 });
 console.log('tenues OK : anti-apnee en vigilance sur '+tenues.map(i=>DB[i].nom).join(', ')+', sans doublon en desc');
 // 3. dynamique : expiration a l effort, jamais de blocage recommande
 const dyn=ids.filter(id=>CFG[id]&&['bw','load','fixed','band'].indexOf(CFG[id].mode)>=0);
 dyn.forEach(id=>{
   const t=(DB[id].desc||[]).join(' ');
   if(!RESP.test(t)) throw new Error('consigne respiratoire absente de la desc : '+id);
 });
 if(ids.some(id=>/bloque ta respiration|bloque la respiration|apn[ée]e conseill/i.test((DB[id].desc||[]).join(' ')+(DB[id].vig||''))))
   throw new Error('une fiche recommande le blocage respiratoire');
 console.log('dynamique OK : '+dyn.length+' fiches avec expiration a l effort, aucun blocage recommande');
 // 4. etirements : expiration allongee
 const etir=ids.filter(id=>CFG[id]&&CFG[id].mode==='stretch');
 etir.forEach(id=>{ if(!RESP.test((DB[id].desc||[]).join(' '))) throw new Error('etirement sans consigne : '+id); });
 console.log('etirements OK : '+etir.length+' fiches avec expiration accompagnant le relachement');
 // 5. echauffement : les cinq etapes, y compris le chat-vache corrige
 WARMUP.forEach(w=>{ if(!RESP.test(w.d)) throw new Error('etape d echauffement sans consigne : '+w.l); });
 const cv=WARMUP.find(w=>w.img==='chat-vache');
 if(!/souffle en arrondissant/i.test(cv.d)||!/inspire en creusant/i.test(cv.d))
   throw new Error('chat-vache : le sens de la respiration n est pas explicite');
 console.log('echauffement OK : '+WARMUP.length+' etapes, chat-vache explicite (souffle en arrondissant)');
 // 6. rendu : la consigne arrive bien dans la fiche et dans l ecran de seance
 showFiche('pompes-poignees','lib');
 if(!RESP.test(html)) throw new Error('consigne absente de la fiche rendue');
 state.warm='aucun'; state.cardio=false; state.stretch=false;
 startSession(); if(cur.phase==='warm') skipWarm();
 while(cur.steps[cur.i].k!=='set') nextStep();
 if(!RESP.test(setHtml(cur.steps[cur.i]))) throw new Error('consigne absente de l ecran de seance');
 cur=null;
 console.log('rendu OK : consigne presente dans la fiche et sur l ecran d exercice');
 // 7. aucun champ nouveau : l etat sauvegarde est inchange
 const p=JSON.parse(payload());
 if('breath' in p||'respiration' in p) throw new Error('un champ d etat a ete ajoute');
 if(typeof p.version!=='string'||!p.version) throw new Error('version absente du fichier exporte : '+p.version);
 console.log('etat OK : aucun champ nouveau, version '+p.version);
 console.log('TESTS V1.7 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
