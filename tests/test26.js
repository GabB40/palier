// Lot profils v2.0 : bascule, realisations de niveaux, qualification materielle.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;global.prompt=()=>null;
const T=`
(async()=>{
 const err=m=>{throw new Error(m)};

 // 1. migration : une sauvegarde v1.18 arrive avec un domicile complet
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 const v118={app:'palier',version:'1.18',v:2,xp:10,goal:3,hist:[],
   gear:{bar:2,bars:2,maxPerEnd:5,plates:{'0.5':4,'1':12,'2':4,'1.25':4},
     bands:{jaune:1,rouge:1,noir:0,violet:1,vert:1},cuffs:{'1':1,'2':1}},
   perf:{'face-pulls':{load:0,range:[10,18],target:12,best:11,sets:[11,11,11],date:null,band:'violet',setsBand:'violet'}}};
 applyImport(JSON.parse(JSON.stringify(v118)));
 if(state.profil!=='domicile') err('profil domicile absent apres migration');
 if(!state.gear.res||!state.gear.res.barre) err('ressources absentes apres migration');
 if(state.gear.bands.jaune!=='jaune') err('realisation par defaut non posee : '+state.gear.bands.jaune);
 if(state.gear.bands.noir!=='') err('un niveau absent doit le rester : '+JSON.stringify(state.gear.bands.noir));
 if(ownedBands(state.gear).length!==4) err('inventaire de niveaux altere');
 // idempotence
 const un=JSON.stringify(state.gear);
 migrateState(state,state);
 if(JSON.stringify(state.gear)!==un) err('migration non idempotente');
 console.log('migration OK : domicile pose, ressources completes, realisations par defaut, idempotente');

 // 2. bascule aller-retour : inventaire restitue, progression intacte
 /* on compare les entrees deja presentes : un rendu peut en creer par
    initialisation, et l initialisation lit legitimement le profil actif */
 const cles=Object.keys(state.perf).sort();
 const snapPerf=()=>JSON.stringify(cles.map(k=>[k,state.perf[k]]));
 const gearDom=JSON.stringify(state.gear), perfDom=snapPerf();
 addProfil('Chez Marc');
 if(profilId()==='domicile') err('la bascule vers le nouveau profil n a pas eu lieu');
 state.gear.res={ancrage:1};
 state.gear.bands={jaune:'',rouge:'la bleue de Marc',noir:'',violet:'',vert:''};
 if(bandLabel('rouge')!=='bande la bleue de Marc') err('le libelle ne suit pas la realisation: '+bandLabel('rouge'));
 SLOT_ORDER.forEach(s=>{ if(!posTirables(s,state.gear).length) err('groupe vide chez Marc: '+s); });
 switchProfil('domicile');
 if(JSON.stringify(state.gear)!==gearDom) err('inventaire du domicile non restitue');
 if(snapPerf()!==perfDom) err('la bascule a touche la progression');
 if(bandLabel('rouge')!=='bande rouge') err('libelle non retrouve au retour');
 console.log('bascule OK : inventaire restitue a l identique, progression intacte, libelles suivant le profil');

 // 3. la sauvegarde ne porte jamais deux inventaires divergents
 switchProfil(Object.keys(state.profils).filter(k=>k!=='domicile')[0]);
 state.gear.res.ballon=1;
 await save();
 if(JSON.stringify(state.profils[profilId()].gear)!==JSON.stringify(state.gear)) err('sauvegarde divergente');
 switchProfil('domicile');
 console.log('sauvegarde OK : l inventaire du profil actif est rafraichi a chaque enregistrement');

 // 4. qualification materielle : par exercice, jamais par profil
 const marc=Object.keys(state.profils).filter(k=>k!=='domicile')[0];
 switchProfil(marc);
 state.gear.bands={jaune:'',rouge:'rouge',noir:'',violet:'',vert:''};
 state.gear.res={ancrage:1};
 // face-pulls canonique violet, seul rouge est tenu ici : borne donc non qualifie
 if(perfFor('face-pulls').band!=='rouge') err('bornage attendu vers rouge: '+perfFor('face-pulls').band);
 if(!nonQualifie('face-pulls')) err('une lecture bornee doit etre non qualifiee');
 // un exercice dont le barreau canonique est tenu reste qualifie
 state.gear.bands.violet='la violette de Marc';
 if(perfFor('face-pulls').band!=='violet') err('le barreau canonique doit etre servi');
 if(nonQualifie('face-pulls')) err('un barreau canonique disponible reste qualifie, meme hors domicile');
 // un exercice substitue progresse pour son propre compte
 if(nonQualifie('rowing-elastique')) err('un substitut joue a son propre niveau reste qualifie');
 console.log('qualification OK : elle porte sur le bornage du niveau, pas sur le profil');

 // 5. une lecture non qualifiee enregistre et ne fait rien d autre
 state.gear.bands={jaune:'',rouge:'rouge',noir:'',violet:'',vert:''};
 const p=state.perf['face-pulls'];
 const av={band:p.band,target:p.target,best:p.best};
 applyProgress('face-pulls',[18,18,18],true,false,nonQualifie('face-pulls'));
 if(JSON.stringify(p.sets)!=='[18,18,18]') err('l information ne s est pas enregistree');
 if(p.band!==av.band||p.target!==av.target||p.best!==av.best) err('une lecture non qualifiee a agi');
 /* v2.12 : le barreau joue est une information, il s ecrit meme ici, et il
    porte le barreau courant puisque la lecture n en change aucun. */
 if(p.setsBand!==av.band) err('barreau joue absent ou faux sous non-qualification');
 if(!p.unqualSets) err('marqueur de non-qualification absent');
 switchProfil('domicile');
 applyProgress('face-pulls',[15,15,15],true,false,nonQualifie('face-pulls'));
 if(state.perf['face-pulls'].unqualSets) err('marqueur non efface par une lecture qualifiee');
 console.log('regime OK : hors profil, series et date enregistrees, aucune action, marqueur pose puis efface');

 // 6. le domicile ne se supprime pas, et le nombre de profils est borne
 delProfil('domicile');
 if(!state.profils.domicile) err('le domicile a ete supprime');
 while(Object.keys(state.profils).length<PROFIL_MAX) addProfil('P'+Object.keys(state.profils).length);
 const n=Object.keys(state.profils).length;
 addProfil('un de trop');
 if(Object.keys(state.profils).length!==n) err('la borne de profils n est pas respectee');
 console.log('garde-fous OK : domicile indelebile, '+PROFIL_MAX+' profils au maximum');
 console.log('TESTS LOT PROFILS V2.0 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
