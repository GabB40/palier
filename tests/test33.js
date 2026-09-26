// Lot v2.6, second volet : un instant se stocke en UTC, un jour civil se lit
// sur l horloge locale. Cle de jour, cle de mois, ecart en jours civils.
// Le fuseau est force avant le premier appel a Date : sous TZ=UTC le decoupage
// UTC et le decoupage local coincident, et la suite ne discriminerait rien.
process.env.TZ='Europe/Brussels';
if(Intl.DateTimeFormat().resolvedOptions().timeZone!=='Europe/Brussels')
  throw new Error('fuseau non force : la suite ne pourrait rien discriminer');
if(new Date('2026-07-15T22:30:00Z').getDate()!==16)
  throw new Error('le fuseau force n est pas applique aux Date');

const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.SRC=raw;
/* Horloge figee. Sans elle, « exporte hier a 20 h » ne discrimine l ancienne
   ecriture que si la suite tourne avant 20 h : le defaut passait inapercu une
   soiree sur quatre. Une suite dont le verdict depend de l heure de son
   lancement ne mesure rien. */
const VraieDate=Date;
global.figer=iso=>{ const t=new VraieDate(iso).getTime();
  function D(){ return arguments.length?new VraieDate(...arguments):new VraieDate(t); }
  D.prototype=VraieDate.prototype; D.now=()=>t; D.UTC=VraieDate.UTC; D.parse=VraieDate.parse;
  global.Date=D; };
global.degeler=()=>{ global.Date=VraieDate; };

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile(); };
 /* un instant construit sur des composantes locales : c est ainsi que
    l utilisateur vit sa journee, et la nuit d ete est un vrai cas d usage
    puisque l export n est pas borne a la plage d entrainement */
 const loc=(y,m,d,h,mi)=>new Date(y,m-1,d,h,mi||0,0,0);

 /* ---------- 1. le jour civil est local, l instant reste UTC ---------- */
 await neuf();
 /* 16 juillet 00h30 a Bruxelles vaut le 15 en UTC : c est le cas qui separe
    les deux decoupages, et le seul ou l ancienne ecriture se voyait */
 const nuit=loc(2026,7,16,0,30);
 if(nuit.toISOString().slice(0,10)!=='2026-07-15') throw new Error('cas de nuit mal construit');
 if(dayKey(nuit)!=='2026-07-16') throw new Error('la cle de jour doit suivre l horloge locale : '+dayKey(nuit));
 if(monthKey(loc(2026,8,1,0,30))!=='2026-08') throw new Error('la cle de mois doit suivre l horloge locale');
 /* elle dit le meme jour que la ligne affichee : c est l invariant qui compte,
    le nom du fichier telecharge et la date annoncee sont la meme grandeur */
 [nuit,loc(2026,1,1,0,10),loc(2026,12,31,23,50),loc(2026,3,29,3,30),loc(2026,10,25,2,30)].forEach(d=>{
   const k=dayKey(d), a=fmtDT(d.toISOString()).slice(6);       /* JJ/MM/AA */
   if(a!==k.slice(8)+'/'+k.slice(5,7)+'/'+k.slice(2,4)) throw new Error('cle de jour et date affichee divergent sur '+d.toISOString());
   if(monthKey(d)!==k.slice(0,7)) throw new Error('cle de mois et cle de jour divergent sur '+d.toISOString());
 });
 /* et elle ne touche pas au stockage : ce qui est ecrit reste un instant UTC */
 markExport();
 if(!/^\\d{4}-\\d{2}-\\d{2}T.*Z$/.test(state.lastExport)) throw new Error('l horodatage stocke doit rester un instant UTC');
 console.log('cle de jour OK : locale, accordee a la date affichee, changements d heure compris, stockage UTC intact');

 /* ---------- 2. l en-tete ferme compte en jours civils ---------- */
 await neuf();
 if(lastExportLabel()!=='jamais exportée') throw new Error('etat initial d export incorrect');
 /* mercredi 15 juillet 2026, 8 h du matin a Bruxelles : l heure de lecture est
    figee, sans quoi « hier a 20 h » cesse de discriminer passe 20 h */
 figer(loc(2026,7,15,8,0).toISOString());
 const jourDe=(dj,h)=>loc(2026,7,15-dj,h,0).toISOString();
 /* le cas qui a motive le lot : exporte hier a 20 h, lu ce matin. L ancienne
    ecriture repondait « aujourd hui » si moins de 24 h s etaient ecoulees,
    au-dessus d une ligne qui affichait bien la veille. */
 state.lastExport=jourDe(1,20);
 if(lastExportLabel()!=='hier') throw new Error('un export de la veille se dit « hier », obtenu : '+lastExportLabel());
 state.lastExport=jourDe(1,9);
 if(lastExportLabel()!=='hier') throw new Error('la veille reste hier quelle que soit l heure');
 state.lastExport=jourDe(2,23);
 if(lastExportLabel()!=='il y a 2 j') throw new Error('l avant-veille se dit « il y a 2 j », obtenu : '+lastExportLabel());
 state.lastExport=jourDe(0,0);
 if(lastExportLabel()!=='aujourd\\'hui') throw new Error('le jour meme se dit « aujourd hui »');
 /* l en-tete et la ligne de date ne peuvent plus se contredire */
 [0,1,2,5,30].forEach(dj=>{
   state.lastExport=jourDe(dj,20);
   const lab=lastExportLabel(), memeJour=(dayKey(state.lastExport)===dayKey());
   if(memeJour!==(lab==='aujourd\\'hui')) throw new Error('en-tete et ligne de date se contredisent a '+dj+' j');
 });
 /* temoin : les memes instants comptes en tranches de 24 h donnent autre chose.
    C est ce qu affichait l ancienne ecriture, et ce que la suite doit refuser. */
 const tranches=iso=>Math.floor((Date.now()-new Date(iso).getTime())/864e5);
 if(tranches(jourDe(1,20))!==0) throw new Error('le temoin de 24 h doit bien donner 0 sur « hier a 20 h »');
 if(dayGap(jourDe(1,20))!==1) throw new Error('l ecart civil doit donner 1 la ou les tranches donnent 0');
 degeler();
 console.log('en-tete OK : jours civils et non tranches de 24 h, jamais en contradiction avec la date affichee');

 /* ---------- 3. le nom du fichier porte le jour annonce ---------- */
 await neuf();
 /* 16 juillet 00h30 : c est la seule fenetre ou le nom de fichier se separait
    de la date annoncee, entre minuit et deux heures du matin l ete */
 figer(loc(2026,7,16,0,30).toISOString());
 let nom='';
 const vraiCreate=document.createElement;
 document.createElement=()=>({set download(v){nom=v},get download(){return nom},href:'',click(){},remove(){},setAttribute(){}});
 global.Blob=function(){};
 global.URL={createObjectURL:()=>'blob:x',revokeObjectURL:()=>{}};
 downloadData();
 document.createElement=vraiCreate;
 if(nom!=='palier-2026-07-16.json') throw new Error('nom de fichier inattendu : '+nom);
 /* la date annoncee sur la card et le nom du fichier sont la meme grandeur */
 const affichee=fmtDT(state.lastExport||new Date().toISOString()).slice(6);
 if(nom.indexOf('2026-07-16')<0||affichee!=='16/07/26') throw new Error('nom de fichier et date annoncee divergent : '+nom+' / '+affichee);
 /* temoin : le decoupage UTC aurait nomme le fichier de la veille */
 if(new Date().toISOString().slice(0,10)!=='2026-07-15') throw new Error('le temoin UTC doit bien donner la veille');
 degeler();
 console.log('fichier OK : '+nom+' a 00h30 le 16, la ou le decoupage UTC nommait le 15');

 /* ---------- 4. les jours actifs se comptent sur le jour civil ---------- */
 await neuf();
 const seance=(d)=>({date:d.toISOString(),type:'alterne',mode:'alterne',rounds:3,plan:15,xp:30,real:1800,
   items:[{id:'pompes-poignees',sets:[8,8,8],load:0}]});
 /* deux seances du meme jour civil comptent pour une, y compris quand l une
    tombe apres minuit UTC et l autre avant */
 figer(loc(2026,7,16,21,0).toISOString());
 const j=loc(2026,7,16,9,0);
 const jNuit=loc(2026,7,16,0,30);   /* la veille en UTC, le meme jour a Bruxelles */
 if(jNuit.toISOString().slice(0,10)===j.toISOString().slice(0,10)) throw new Error('cas de nuit non discriminant');
 state.hist=[seance(jNuit),seance(j)];
 const ja=activeDays(state);
 if(ja.length!==1) throw new Error('deux seances du meme jour civil comptent pour une, obtenu '+ja.join(', '));
 if(ja[0]!==dayKey(j)) throw new Error('le jour actif doit porter la cle du jour civil : '+ja[0]);
 const wc=weekCounts(state);
 if(wc[isoWeek(j)]!==1) throw new Error('le compte hebdomadaire doit suivre le meme decoupage, obtenu '+wc[isoWeek(j)]);
 /* la semaine ISO et le jour actif lisent le meme instant de la meme facon :
    une seance ne peut pas etre comptee dans une semaine et dans un autre jour */
 state.hist.forEach(h=>{
   if(isoWeek(new Date(h.date))!==isoWeek(new Date(dayKey(h.date)+'T12:00:00')))
     throw new Error('semaine et jour civil divergent sur '+h.date);
 });
 degeler();
 console.log('jours actifs OK : un seul decoupage pour le jour et pour la semaine, seance de nuit comprise');

 /* ---------- 5. plus aucun decoupage UTC d un jour ou d un mois ---------- */
 const fautes=[];
 SRC.split('\\n').forEach((l,i)=>{
   if(/toISOString\\(\\)\\.slice\\(0,\\s*(10|7)\\)/.test(l)) fautes.push((i+1)+' : '+l.trim());
   if(/\\.date\\.slice\\(0,\\s*(10|7)\\)/.test(l)) fautes.push((i+1)+' : '+l.trim());
 });
 if(fautes.length) throw new Error('decoupage UTC d un jour ou d un mois subsistant :\\n  '+fautes.join('\\n  '));
 /* et un seul chemin pour chaque grandeur */
 if(typeof today!=='undefined') throw new Error('today() faisait doublon avec dayKey() et doit avoir disparu');
 if(typeof dayKey!=='function'||typeof monthKey!=='function'||typeof dayGap!=='function')
   throw new Error('les trois formateurs de date doivent exister');
 console.log('forme OK : aucun decoupage UTC residuel, un seul formateur par grandeur');

 console.log('TESTS TEMPS LOCAL V2.6 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
