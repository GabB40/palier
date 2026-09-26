/* test17 : repos alterne reglable, fourchettes de duree annoncees par Reglages,
   et survie des cards repliables au re-rendu. Le faux DOM porte ici un etat
   d ouverture par card, sans quoi le mecanisme ne serait pas observable. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollY:0,scrollTo:(x,y)=>{global.window.scrollY=y;},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
/* cards du dernier rendu : recreees a chaque ecriture, comme le fait le
   navigateur, avec l etat declare dans le HTML */
const cards={};
function rebuild(h){
  Object.keys(cards).forEach(k=>delete cards[k]);
  const re=/<details([^>]*)>/g; let m;
  while((m=re.exec(h))!==null){
    const attrs=m[1], k=/data-k="([^"]+)"/.exec(attrs);
    if(!k) continue;
    cards[k[1]]={key:k[1],open:/\sopen(\s|>|$)/.test(attrs+' '),getAttribute(n){return n==='data-k'?this.key:null}};
  }
}
let cls={};
const mk=cap=>({set innerHTML(v){if(cap){html=v;rebuild(v);}},get innerHTML(){return cap?html:''},
  classList:{add(c){cls[c]=true},remove(c){delete cls[c]}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
global.document={
  querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),
  querySelectorAll:s=>Object.keys(cards).map(k=>cards[k]),
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.__cards=()=>cards;
global.__cls=()=>cls;
const T=`
(async()=>{
 const neuf=async()=>{ localStorage._m={}; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile(); state.prep=5; };
 const C=__cards();
 await neuf();

 // 1. le repos alterne est un reglage, avec un repli pour les sauvegardes anterieures
 if(defaultState().trans!==15) throw new Error('le defaut doit rester la transition de 15 s');
 if(transSec()!==15) throw new Error('transSec doit lire le defaut');
 delete state.trans;
 if(transSec()!==TRANSITION) throw new Error('une sauvegarde sans le champ doit retomber sur le defaut');
 state.trans=999;
 if(transSec()!==TRANSITION) throw new Error('une valeur hors choix doit retomber sur le defaut');
 setTrans(5);
 if(state.trans!==5||transSec()!==5) throw new Error('setTrans doit poser la valeur');
 if(TRANS_CHOICES[0]!==5) throw new Error('plancher a 5 s : l ecran de repos annonce l exercice suivant');
 if(TRANS_CHOICES[TRANS_CHOICES.length-1]!==30) throw new Error('plafond a 30 s : on est en alterne');
 console.log('repos alterne OK : reglable de '+TRANS_CHOICES[0]+' a '+TRANS_CHOICES[TRANS_CHOICES.length-1]+' s, repli sur '+TRANSITION+' s');

 // 2. il agit sur la seance construite et sur le total annonce
state.rounds=3; state.warm='complet'; state.cardio=false; state.stretch=true;
 setTrans(15); const p15=planParts(buildSession());
 setTrans(5);  const p5=planParts(buildSession());
 /* v2.10 : seuls les repos non-pause suivent le reglage, les raccords de tour
    portent une constante hors selecteur */
 const nRest=buildSession().steps.filter(x=>x.k==='rest'&&!x.pause).length;
 if(p15.trans-p5.trans!==nRest*10) throw new Error('le poste Transitions doit suivre le reglage');
 if(p15.total-p5.total!==nRest*10) throw new Error('le total doit suivre le reglage');
 if(p15.exos!==p5.exos) throw new Error('le repos ne doit pas toucher au poste Exercices');
 console.log('effet OK : '+nRest+' repos, '+Math.round((p15.total-p5.total)/60*10)/10+' min entre 5 et 15 s');

 // 3. Reglages annonce une fourchette, pas une moyenne, et exclut les verrouilles
 setTrans(15);
 const sp=sessionSpan(3,false,'complet');
 if(!(sp.min<sp.max)) throw new Error('une fourchette doit avoir deux bornes distinctes');
 /* les bornes encadrent tous les tirages reellement possibles */
 const pools=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(id=>!isLocked(id)));
 let lo=Infinity, hi=0;
 for(let a=0;a<pools[0].length;a++)for(let b=0;b<pools[1].length;b++)
 for(let c=0;c<pools[2].length;c++)for(let d=0;d<pools[3].length;d++){
   SLOT_ORDER.forEach((s,i)=>{ state.slotIdx[s]=[a,b,c,d][i]; });
   const t=planParts(buildSession()).total;
   if(t<lo) lo=t; if(t>hi) hi=t;
 }
 SLOT_ORDER.forEach(s=>state.slotIdx[s]=0);
 if(sp.min!==Math.round(lo/60)) throw new Error('borne basse fausse : '+sp.min+' contre '+Math.round(lo/60));
 if(sp.max!==Math.round(hi/60)) throw new Error('borne haute fausse : '+sp.max+' contre '+Math.round(hi/60));
 /* un exercice verrouille ne peut pas etre tire : il ne doit pas peser sur le chiffre */
 /* v2.10 : mesure en secondes, et non sur la minute arrondie. La propriete
    testee est qu un verrou pese sur le chiffre. Elle tenait toujours, mais
    l arrondi la masquait des que la pause de raccord decalait le total de
    90 s : 879 et 864 s tombaient sur 15 et 14 min, 969 et 954 tombent tous
    deux sur 16. Rien d applicatif n avait change, l instrument manquait de
    resolution. On mesure donc au bon endroit, et on verifie en plus que la
    fourchette annoncee suit toujours l enumeration. */
 const brut=()=>{ const ps=SLOT_ORDER.map(x=>SLOTS[x].pool.filter(id=>!isLocked(id)));
   let l=Infinity,h=0; const ix=[0,0,0,0];
   (function w(i){ if(i===4){ SLOT_ORDER.forEach((x,k)=>state.slotIdx[x]=ix[k]);
       const t=planParts(buildSession()).total; if(t<l)l=t; if(t>h)h=t; return; }
     for(let a=0;a<ps[i].length;a++){ ix[i]=a; w(i+1); } })(0);
   SLOT_ORDER.forEach(x=>state.slotIdx[x]=0); return {lo:l,hi:h}; };
 const avant=brut();
 state.unlocked['tractions-strictes-supination']=true;
 const apres=brut();
 if(avant.lo===apres.lo&&avant.hi===apres.hi) throw new Error('deverrouiller un exercice doit changer la fourchette');
 const sp2=sessionSpan(3,false,'complet');
 if(sp2.min!==Math.round(apres.lo/60)||sp2.max!==Math.round(apres.hi/60)) throw new Error('la fourchette annoncee doit suivre le deverrouillage');
 delete state.unlocked['tractions-strictes-supination'];
 console.log('fourchette OK : bornes exactes sur '+pools.reduce((a,p)=>a*p.length,1)+' tirages, verrouilles exclus');

 // 4. la phrase suit les options au lieu de les affirmer
 if(partsLabel('complet',false,true)!=='échauffement complet et étirements compris') throw new Error('libelle faux : echauffement complet et etirements');
 if(partsLabel('court',true,true)!=='échauffement court, cardio et étirements compris') throw new Error('libelle faux : trois postes');
 if(partsLabel('aucun',false,true)!=='sans échauffement, étirements compris') throw new Error('libelle faux : sans echauffement');
 if(partsLabel('aucun',false,false)!=='exercices seuls') throw new Error('libelle faux : rien d autre que les exercices');
 state.warm='aucun'; state.stretch=false; state.cardio=false;
 view='set'; render();
 if(!/exercices seuls/.test(html)) throw new Error('Reglages doit dire ce qu il compte vraiment');
 if(/échauffement et étirements compris/.test(html)) throw new Error('la phrase fixe doit avoir disparu');
 state.warm='complet'; state.stretch=true;
 console.log('libelle OK : compose depuis les options, jamais affirme d avance');

 // 5. les cards repliables survivent au re-rendu, dans les deux sens
 await neuf();
 view='home'; render();
 if(!C['home-contenu']) throw new Error('la card Contenu doit porter une cle');
 if(C['home-contenu'].open) throw new Error('la card Contenu est fermee par defaut : son en-tete est un resume');
 if(!C['home-detail'].open) throw new Error('le detail de seance est ouvert par defaut');
 C['home-contenu'].open=true;          /* l utilisateur l ouvre */
 setDayWarm('court');                  /* et clique une option dedans : render() */
 if(!C['home-contenu'].open) throw new Error('la card Contenu se referme au clic sur une de ses options');
 setRounds(4);
 if(!C['home-contenu'].open) throw new Error('la card Contenu se referme au changement de volume');
 C['home-detail'].open=false; render();
 if(C['home-detail'].open) throw new Error('une card ouverte par defaut doit pouvoir rester fermee');
 /* l ouverture est ecrite dans le HTML, pas corrigee apres coup : sans cela le
    document sortirait trop court le temps d une image et le defilement sauterait */
 if(!/data-k="home-contenu" open/.test(html)) throw new Error('la card ouverte doit sortir ouverte du rendu');
 if(/data-k="home-detail" open/.test(html)) throw new Error('la card fermee doit sortir fermee du rendu');
 console.log('accueil OK : Contenu reste ouverte pendant qu on la manipule, detail refermable');

 // 6. meme chose dans Reglages, sans qu une card en entraine une autre
 clearDay(); view='set'; render();
 const ouvertes=Object.keys(C).filter(k=>C[k].open);
 if(ouvertes.length) throw new Error('toutes les cards de Reglages sont fermees en arrivant : '+ouvertes.join(','));
 C['set-échauffement'].open=true; C['set-séries-par-exercice'].open=true;
 setWarm('court');
 if(!C['set-échauffement'].open) throw new Error('la card Echauffement se referme au clic sur une de ses options');
 if(!C['set-séries-par-exercice'].open) throw new Error('une card voisine ouverte ne doit pas se refermer');
 if(C['set-module-cardio'].open) throw new Error('une card fermee ne doit pas s ouvrir toute seule');
 /* l etat ne traverse pas les vues : les cles de l ancienne page ne
    correspondent a rien dans la nouvelle, donc tout repart ferme */
 go('home'); go('set');
 if(Object.keys(C).filter(k=>C[k].open).length) throw new Error('en revenant sur Reglages tout doit etre referme');
 console.log('reglages OK : chaque card garde son etat au rendu, rien ne persiste entre les vues');

 // 7. le defilement survit au rendu, mais pas a un changement de vue
 view='home'; render();
 window.scrollY=420;
 setRounds(2);
 if(window.scrollY!==420) throw new Error('le defilement doit etre conserve au rendu, obtenu '+window.scrollY);
 go('set');
 if(window.scrollY!==0) throw new Error('un changement de vue doit remonter en haut');
 console.log('defilement OK : conserve au rendu, remis en haut au changement de vue');

 // 8. l animation d apparition ne joue qu a l arrivee sur un ecran
 const K=__cls();
 go('home'); go('set');
 if(!K.enter) throw new Error('arriver sur un ecran doit animer les cards');
 setWarm('court');
 if(K.enter) throw new Error('rafraichir le meme ecran ne doit rien animer');
 setGoal(1);
 if(K.enter) throw new Error('un second clic sur le meme ecran ne doit rien animer non plus');
 go('home');
 if(!K.enter) throw new Error('changer de vue doit animer de nouveau');
 setRounds(3);
 if(K.enter) throw new Error('un ajustement sur l accueil ne doit rien animer');
 /* la fiche est un ecran a part entiere, la seance change d ecran a chaque etape */
 showFiche(SLOTS.push.pool[0],'home');
 if(!K.enter) throw new Error('ouvrir une fiche est une arrivee');
 showFiche(SLOTS.push.pool[0],'home');
 if(K.enter) throw new Error('reafficher la meme fiche n en est pas une');
 console.log('animation OK : jouee a l arrivee, muette au rafraichissement');

 // 9. rien n est stocke : un rechargement repart de l etat par defaut
 if('cards' in defaultState()||'openCards' in defaultState()) throw new Error('l ouverture des cards ne doit rien ecrire dans l etat');
 console.log('portee OK : memoire vive du rendu uniquement, rien dans la sauvegarde');

 console.log('TESTS REPOS ET CARDS V1.14 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
