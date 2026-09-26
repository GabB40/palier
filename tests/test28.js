// Lot v2.1 : echelle a ecart de manchons borne et micro-palier additif,
// kettlebells multi-poids, fentes arriere lestees, masques de presence,
// profil neuf vide, changement de volume en cours de seance, defilement
// vers la card Materiel.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const trace=[];
global.trace=trace;
global.window={scrollY:0,scrollTo:(x,y)=>{trace.push('top');},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={
  querySelector:s=>{
    if(s==='#app') return appEl;
    if(s==='.lightbox') return null;
    if(s.indexOf('details[data-k=')===0){ trace.push('card'); return {scrollIntoView:()=>{}}; }
    return other;
  },
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) throw new Error(m+' : '+JSON.stringify(a)+' vs '+JSON.stringify(b)); };

 /* ---------- 1. echelle : le critere devient l ecart entre manchons ---------- */
 await neuf();
 const ALL=loadLadder(state.gear), SYM=ladderBuild(state.gear).sym, PROG=loadLadderProg(state.gear);
 if(ALL.indexOf(3.5)<0) throw new Error('3,5 kg doit etre montable : 0,5 d un cote, 1 de l autre, ecart 0,5');
 if(ALL.indexOf(3.25)>=0) throw new Error('3,25 kg demande 1,25 d ecart entre manchons, il sort de l echelle');
 for(let i=1;i<ALL.length;i++) if(ALL[i]<=ALL[i-1]) throw new Error('echelle complete non triee');
 /* micro-palier ADDITIF : aucun barreau symetrique ne disparait */
 SYM.forEach(v=>{ if(PROG.indexOf(v)<0) throw new Error('le micro-palier a retire un barreau symetrique : '+v); });
 eq(PROG.filter(v=>v>=4),SYM.filter(v=>v>=4),'au-dessus de 4 kg l echelle de progression doit etre celle de la v2.0');
 eq(PROG.slice(0,6),[2,2.5,3,3.5,4,4.5],'bas d echelle attendu');
 /* decroissance monotone des ecarts relatifs sur le bas */
 for(let i=2;i<6;i++){
   const a=PROG[i-1]/PROG[i-2]-1, b=PROG[i]/PROG[i-1]-1;
   if(b>a+1e-9) throw new Error('ecart relatif non decroissant en bas d echelle');
 }
 if(PROG.slice(-1)[0]!==SYM.slice(-1)[0]) throw new Error('le sommet du materiel doit rester atteignable');
 console.log('echelle OK : ecart de manchons borne au plus petit disque, 3,5 gagne, 3,25 perdu, micro-palier additif');

 /* ---------- 2. le seuil du micro-palier a un large plateau ---------- */
 const S=ladderBuild(state.gear).sym, A=ladderBuild(state.gear).all;
 const ref=microProg(S,A).join(',');
 /* microProg lit la constante : on verifie que la valeur retenue est dans le
    plateau en rejouant la regle a la main sur des seuils voisins */
 const rejoue=seuil=>{ const out=[]; S.forEach((v,i)=>{ out.push(v); const nx=S[i+1];
   if(nx===undefined||nx/v-1<=seuil) return;
   const mid=A.filter(x=>x>v+0.001&&x<nx-0.001); if(!mid.length) return;
   const c=Math.sqrt(v*nx); let b=mid[0]; mid.forEach(x=>{ if(Math.abs(x-c)<Math.abs(b-c)) b=x; }); out.push(b); });
   return out.join(','); };
 [0.14,0.20,0.30].forEach(s=>{ if(rejoue(s)!==ref) throw new Error('le seuil '+s+' devrait donner la meme echelle : plateau annonce 13-33 %'); });
 if(rejoue(0.40)===ref) throw new Error('au-dela du plateau l echelle doit changer');
 console.log('seuil OK : 14, 20 et 30 % donnent la meme echelle, 40 % non');

 /* ---------- 3. kettlebells : totaux ambigus, doublons, non-regression ---------- */
 await neuf();
 eq(fixedLadder('goblet-squat',state.gear).map(x=>x.v),[10,12,14,16],'une seule kettlebell : echelle inchangee');
 KB_W.forEach(w=>{ state.gear.kbs[w]=1; });
 state.gear.cuffs={'0.5':1,'1':1,'2':1};
 const L=fixedLadder('goblet-squat',state.gear);
 if(new Set(L.map(x=>x.v)).size!==L.length) throw new Error('un total doit etre tenu par un seul montage');
 for(let i=1;i<L.length;i++) if(L[i].v<=L[i-1].v) throw new Error('echelle kettlebell non triee');
 L.forEach(x=>{ const kb=parseFloat(String(x.lbl).replace('KB ','')); 
   const sup=kbOwned(state.gear).filter(k=>k<=x.v+0.001).slice(-1)[0];
   if(Math.abs(kb-sup)>0.001) throw new Error('a total egal, la kettlebell la plus lourde doit etre prescrite : '+x.lbl); });
 if(L[0].v!==8||L.slice(-1)[0].v!==27) throw new Error('etendue attendue 8 a 27 : '+L[0].v+'-'+L.slice(-1)[0].v);
 console.log('kettlebells OK : '+L.length+' barreaux de 8 a 27 kg, aucun doublon, montage le plus simple');

 /* ---------- 4. plafond des swings derive du souleve roumain ---------- */
 await neuf();
 KB_W.forEach(w=>{ state.gear.kbs[w]=1; });
 state.unlocked['rdl-kettlebell']=true; state.unlocked['kb-swings']=true;
 perfOf('rdl-kettlebell').load=12;
 const sw=perfOf('kb-swings'); sw.load=10; sw.target=15; sw.range=[8,15];
 applyProgress('kb-swings',[15,15,15]);
 if(perfOf('kb-swings').load>12.001) throw new Error('le swing ne doit pas depasser le niveau du souleve roumain : '+perfOf('kb-swings').load);
 sw.load=12; sw.target=15;
 const m=applyProgress('kb-swings',[15,15,15]);
 if(perfOf('kb-swings').load!==12) throw new Error('au plafond derive, la charge ne bouge plus');
 if(!/Plafond atteint/.test(m.join(' '))) throw new Error('le plafond derive doit se dire : '+m.join(' | '));
 perfOf('rdl-kettlebell').load=16; sw.target=15;
 applyProgress('kb-swings',[15,15,15]);
 if(perfOf('kb-swings').load<=12) throw new Error('le plafond monte avec le souleve roumain');
 console.log('plafond OK : les swings plafonnent au niveau du souleve roumain, et le suivent');

 /* ---------- 5. marche suivante conditionnelle a l inventaire ---------- */
 await neuf();
 /* v2.18 : le goblet squat sort de KB_NEXT au profit du squat sur une jambe
    leste ; la composition se verifie sur un membre restant de la liste, et le
    goblet squat nomme son successeur quel que soit l inventaire. */
 if(!/déclare une kettlebell de 12 kg/.test(nextFor('rdl-kettlebell',state.gear))) throw new Error('la marche doit nommer le poids suivant a declarer');
 if(nextFor('goblet-squat',state.gear)!==DB['goblet-squat'].next) throw new Error('le goblet squat doit nommer son successeur');
 KB_W.forEach(w=>{ state.gear.kbs[w]=1; });
 if(/déclare une kettlebell/.test(nextFor('rdl-kettlebell',state.gear))) throw new Error('liste epuisee : la marche redevient une impasse nommee');
 if(nextFor('planche',state.gear)!==DB['planche'].next) throw new Error('les autres marches ne sont pas touchees');
 console.log('marche suivante OK : conditionnelle a l inventaire, impasse seulement une fois la liste epuisee');

 /* ---------- 6. fentes lestees : successeur, pas entree de plus ---------- */
 await neuf();
 const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
 /* v2.5 : trois echelons de mollets s inserent dans le meme vivier, tous
    successeurs qui retirent leur predecesseur. Le nombre d entrees de reference
    bouge donc, le nombre d entrees TIRABLES ne bouge pas : c est lui que la
    suite verifie ligne suivante, et c est l invariant qui compte. */
 /* v2.13 : quatre echelons de pont fessier de plus, meme raisonnement. */
 /* v2.18 : deux echelons de squat sur une jambe, meme raisonnement. */
 if(SLOTS.legs.pool.length!==17) throw new Error('vivier de reference attendu a 17 entrees');
 if(tir().length!==5) throw new Error('verrou ferme : cinq entrees tirables, '+tir().length);
 if(tir().indexOf('fentes-arriere')<0) throw new Error('verrou ferme : les fentes au poids du corps sont tirees');
 state.unlocked['fentes-arriere-lestee']=true;
 if(tir().length!==5) throw new Error('verrou ouvert : le vivier doit rester a cinq entrees, '+tir().length);
 if(tir().indexOf('fentes-arriere')>=0) throw new Error('le predecesseur doit quitter le tirage');
 if(tir().indexOf('fentes-arriere-lestee')<0) throw new Error('le successeur prend la place exacte');
 const iFente=SLOTS.legs.pool.indexOf('fentes-arriere-lestee');
 if(SCHEMA.legs[iFente]!=='fente chargée') throw new Error('schema moteur mal aligne apres insertion');
 if(resolvePos('legs',iFente,state.gear)!=='fentes-arriere-lestee') throw new Error('avec halteres, la position sert la variante chargee');
 state.gear.res.hal=0;
 if(resolvePos('legs',iFente,state.gear)!=='fentes-arriere') throw new Error('sans halteres, la chaine descend vers le poids du corps');
 if(posTirables('legs',state.gear).length!==5) throw new Error('sans halteres la position reste servie');
 eq(NEEDS['fentes-arriere-lestee'],['hal'],'besoin materiel des fentes lestees');
 if(DB['fentes-arriere-lestee'].lock.minSets!==2) throw new Error('verrou des fentes lestees a deux series');
 if(DB['fentes-arriere-lestee'].lock.need!==DB['fentes-arriere'].reps[1]) throw new Error('le verrou doit valoir le haut de fourchette des fentes au poids du corps (v2.16 : 15, plus 18)');
 if(typeof IMG!=='undefined'&&!IMG['fentes-arriere-lestee']) throw new Error('illustration des fentes lestees absente de la banque');
 console.log('fentes lestees OK : successeur qui retire son predecesseur, vivier a cinq dans les deux etats, chaine vers le poids du corps');

 /* ---------- 7. verrous de la charniere a deux series ---------- */
 await neuf();
 const nb1=Object.keys(DB).filter(id=>DB[id].lock&&(DB[id].lock.minSets||1)<2&&!DB[id].lock.bandGate);
 if(nb1.length) throw new Error('plus aucun verrou a une seule serie : '+nb1.join(', '));
 const g=perfOf('goblet-squat'); g.sets=[15,8,8]; checkUnlocks(3,false);
 if(state.unlocked['rdl-kettlebell']) throw new Error('une seule serie a 15 ne doit plus ouvrir la charniere');
 g.sets=[15,15,8]; checkUnlocks(3,false);
 if(!state.unlocked['rdl-kettlebell']) throw new Error('deux series a 15 doivent ouvrir');
 console.log('verrous OK : les six verrous du catalogue exigent au moins deux series');

 /* ---------- 8. masques de presence : ils cachent sans detruire ---------- */
 await neuf();
 const avant=JSON.stringify(state.gear.bands);
 toggleRes('elast');
 if(aRes('elast')) throw new Error('l interrupteur doit eteindre les elastiques');
 if(JSON.stringify(state.gear.bands)!==avant) throw new Error('le masque a detruit les realisations');
 toggleRes('elast');
 if(!aRes('elast')) throw new Error('le relever doit rendre exactement ce qui etait declare');
 const cuffAvant=JSON.stringify(state.gear.cuffs);
 toggleRes('cuff');
 if(aCuff(state.gear)) throw new Error('l interrupteur doit eteindre les lestes');
 eq(cuffSteps(state.gear,2),[0],'lestes eteints : aucun apport');
 toggleRes('cuff');
 eq(JSON.parse(cuffAvant),state.gear.cuffs,'les paires declarees sont intactes');
 /* invariant : jamais leve et vide */
 BANDS.forEach(b=>setBandReal(b.id,''));
 if(state.gear.res.elast) throw new Error('retirer le dernier niveau doit baisser le drapeau');
 setBandReal('vert','vert');
 if(!state.gear.res.elast) throw new Error('declarer un niveau doit lever le drapeau');
 CUFF_W.forEach(w=>{ if(state.gear.cuffs[w]) toggleCuff(w); });
 if(state.gear.res.cuff) throw new Error('plus aucune paire : le drapeau tombe');
 Object.keys(state.gear.kbs).forEach(w=>toggleKb(w));
 if(state.gear.res.kb) throw new Error('plus aucune kettlebell : le drapeau tombe');
 if(aRes('kb')) throw new Error('sans kettlebell declaree, la ressource n est pas servie');
 addKb('16');
 if(!state.gear.res.kb||!aRes('kb')) throw new Error('declarer une kettlebell leve le drapeau');
 console.log('masques OK : ils cachent sans detruire, et ne sont jamais leves a vide');

 /* ---------- 9. profil neuf vide, copie sur demande ---------- */
 await neuf();
 addProfil('hôtel');
 if(kbOwned(state.gear).length||ownedBands(state.gear).length||CUFF_W.some(w=>state.gear.cuffs[w]))
   throw new Error('un profil neuf part vide');
 if(Object.keys(state.gear.res||{}).some(k=>state.gear.res[k])) throw new Error('aucune ressource declaree sur un profil neuf');
 if(schemasServis(state.gear).servis<1) throw new Error('un inventaire vide sert quand meme des schemas');
 const dom=Object.keys(state.profils).filter(k=>state.profils[k].nom!=='hôtel')[0];
 addProfil('chez Marc',dom);
 eq(state.gear,state.profils[dom].gear,'la copie doit rendre l inventaire de la source');
 if(state.profils[state.profil].gear!==state.gear) throw new Error('invariant : gear est l inventaire du profil actif');
 console.log('profils OK : neuf vide par defaut, copie explicite fidele');

 /* ---------- 10. migration v2.1, idempotente ---------- */
 const vieux={v:2,rounds:3,gear:{bar:2,bars:2,maxPerEnd:5,plates:{'0.5':4,'1':12,'2':4,'1.25':4},
   bands:{jaune:'jaune',rouge:'rouge'},cuffs:{'1':1},res:{hal:1,kb:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1}},perf:{}};
 const mg=migrateState(JSON.parse(JSON.stringify(vieux)));
 eq(mg.gear.kbs,{'10':1},'la ressource kettlebell devient la kettlebell de 10 kg');
 if(mg.gear.res.elast!==1||mg.gear.res.cuff!==1) throw new Error('les drapeaux suivent ce qui est declare');
 const mg2=migrateState(JSON.parse(JSON.stringify(mg)));
 eq(mg2.gear,mg.gear,'migration non idempotente');
 const sansRien={v:2,rounds:3,gear:{bar:2,bars:2,plates:{'1':12},bands:{},cuffs:{},res:{}},perf:{}};
 const mg3=migrateState(JSON.parse(JSON.stringify(sansRien)));
 eq(mg3.gear.kbs,{},'sans ressource kettlebell declaree, aucun poids invente');
 if(mg3.gear.res.elast!==0||mg3.gear.res.cuff!==0) throw new Error('drapeaux a zero sur un inventaire vide');
 console.log('migration OK : kettlebell de 10 kg posee, drapeaux derives, idempotente');

 /* ---------- 11. volume en cours de seance ---------- */
 await neuf();
 startSession();
 const series=()=>cur.steps.filter(s=>s.k==='set'&&!s.cool);
 const prevuDe=()=>{ const p={}; cur.steps.forEach(s=>{ if(s.k==='set'&&!s.cool) p[s.from||s.id]=(p[s.from||s.id]||0)+1; }); return p; };
 if(series().length!==12) throw new Error('trois series par exercice au lancement');
 eq(volAllowed(),[2,3,4],'au premier round, les trois choix sont offerts');
 const annonce=cur.planSec;
 /* une tenue ne se valide pas sans mesure : on la passe, ce qui suffit ici,
    la section porte sur la recomposition des etapes et non sur le journal */
 const avancer=()=>{ const st=cur.steps[cur.i];
   if(st.k!=='set'){ nextStep(); return; }
   if(DB[st.id].mode==='time'){ skipSet(); return; }
   st.val=10; validateSet(); };
 for(let k=0;k<4;k++) avancer();
 setSessionRounds(2);
 if(series().length!==8) throw new Error('bascule vers 2 : huit series restantes, '+series().length);
 if(cur.rounds!==2) throw new Error('le volume de seance doit suivre');
 series().forEach(s=>{ if(s.of!==2) throw new Error('le libelle « serie x sur y » doit suivre'); });
 Object.keys(prevuDe()).forEach(id=>{ if(prevuDe()[id]!==2) throw new Error('prevu doit valoir 2 par exercice'); });
 if(cur.planSec>=annonce) throw new Error('la duree annoncee doit suivre le volume');
 if(cur.steps[cur.steps.length-1].k==='rest') throw new Error('pas de transition apres la derniere serie');
 /* on ne descend jamais sous le round entame, ni sous 2, ni au-dessus du lance + 1 */
 let garde=0;
 while(roundOf(cur.i)<2&&garde++<40){ if(!cur.steps[cur.i]) break; avancer(); }
 if(roundOf(cur.i)<2) throw new Error('deuxieme round non atteint : i='+cur.i+' k='+(cur.steps[cur.i]||{}).k+' phase='+cur.phase+' n='+cur.steps.length);
 if(volAllowed().indexOf(1)>=0) throw new Error('plancher a 2 series');
 if(volAllowed().indexOf(4)<0) throw new Error('lance a 3, on peut monter a 4');
 setSessionRounds(4);
 if(series().length!==16) throw new Error('montee a 4 : seize series');
 const ajoutees=series().filter(s=>s.round===4);
 if(ajoutees.length!==4||ajoutees.some(s=>s.val)) throw new Error('un round ajoute est vierge');
 if(series().filter(s=>s.round===1&&s.val===10).length!==3) throw new Error('les series deja jouees ne doivent pas bouger');
 console.log('volume OK : plancher a 2, une serie de plus au maximum, prevu et annonce suivis, series jouees intactes');

 /* ---------- 12. defilement vers la card Materiel ---------- */
 await neuf();
 state.onboard=true;
 trace.length=0;
 goMateriel();
 if(trace.join(',')!=='top,card') throw new Error('la card doit avoir le dernier mot sur le defilement : '+trace.join(','));
 if(!/data-k="set-mat/.test(html)) throw new Error('card Materiel absente de la vue Reglages');
 const i=html.indexOf('data-k="set-mat');
 if(html.slice(i,i+90).indexOf(' open')<0) throw new Error('la card doit sortir ouverte');
 console.log('onboarding OK : la card s ouvre et le trajet vers elle passe apres la remontee en haut');

 console.log('TESTS LOT V2.1 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
