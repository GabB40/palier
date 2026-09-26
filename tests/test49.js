/* test49 : lot v2.24, synchronisation cote client. L app parle au vrai code
   de la Lambda, extrait du template comme dans testapi, a travers un fetch de
   substitution qui joue CloudFront : signature OAC refusee sans empreinte
   exacte du corps compresse, gzip de reponse defait comme le ferait le
   navigateur, plafond keepalive de 64 Ko. S3 et SSM simules. Horloge et
   minuteurs pilotes. Un appareil est un localStorage ; changer d appareil,
   c est recharger la page sur un autre. */
const fs=require('fs'), os=require('os'), path=require('path');
const zlib=require('zlib'), ncrypto=require('crypto'), Module=require('module');

/* ---------- Lambda, S3 et SSM simules (repris de testapi) ---------- */
const tpl=fs.readFileSync('palier-backend.yaml','utf8');
const lignes=tpl.split('\n'); const z=lignes.findIndex(l=>/^\s+ZipFile: \|$/.test(l));
if(z<0) throw new Error('ZipFile introuvable');
const ind=lignes[z].search(/\S/)+2; const code=[];
for(let i=z+1;i<lignes.length;i++){ const l=lignes[i]; if(l.trim()===''){code.push('');continue;} if(l.search(/\S/)<ind) break; code.push(l.slice(ind)); }
const serr=(name,st)=>Object.assign(new Error(name),{name,$metadata:{httpStatusCode:st}});
const S3={objs:{},n:0};
function versions(k){ return S3.objs[k]||(S3.objs[k]=[]); }
function courant(k){ const v=versions(k); const c=v[v.length-1]; return c&&!c.marqueur?c:null; }
const S3cmd={
  GetObjectCommand(i){ const c=courant(i.Key); if(!c) throw serr('NoSuchKey',404);
    if(i.IfNoneMatch&&i.IfNoneMatch===c.etag) throw serr('NotModified',304);
    return {ETag:c.etag,Metadata:c.meta,Body:{transformToByteArray:async()=>new Uint8Array(c.body)}}; },
  PutObjectCommand(i){ const c=courant(i.Key);
    if(i.IfMatch!==undefined){ if(!c) throw serr('NoSuchKey',404); if(c.etag!==i.IfMatch) throw serr('PreconditionFailed',412); }
    if(i.IfNoneMatch==='*'&&c) throw serr('PreconditionFailed',412);
    const etag='"'+ncrypto.createHash('md5').update(i.Body).digest('hex')+(++S3.n)+'"';
    versions(i.Key).push({vid:String(S3.n).padStart(6,'0'),etag,body:Buffer.from(i.Body),meta:i.Metadata});
    return {ETag:etag}; },
  ListObjectVersionsCommand(i){
    const v=[]; for(const k of Object.keys(S3.objs)) if(k.startsWith(i.Prefix)) for(const x of S3.objs[k]) v.push({Key:k,VersionId:x.vid});
    return {IsTruncated:false,Versions:v,DeleteMarkers:[]}; },
  DeleteObjectsCommand(i){ for(const o of i.Delete.Objects){ const v=versions(o.Key); const j=v.findIndex(x=>x.vid===o.VersionId); if(j>=0) v.splice(j,1); } return {Errors:[]}; }
};
const SSM={val:undefined};
const fabrique=t=>{ const m={}; for(const n of Object.keys(t)) m[n]=class{constructor(i){this.input=i;this.nom=n;}}; return m; };
const s3mod=fabrique(S3cmd); s3mod.S3Client=class{ async send(c){ return S3cmd[c.nom](c.input); } };
const ssmmod={GetParameterCommand:class{constructor(i){this.input=i;}},
  SSMClient:class{ async send(){ if(SSM.val===undefined) throw serr('ParameterNotFound',400); return {Parameter:{Value:SSM.val}}; } }};
const charge0=Module._load;
Module._load=function(r,...a){ if(r==='@aws-sdk/client-s3') return s3mod; if(r==='@aws-sdk/client-ssm') return ssmmod; return charge0.call(this,r,...a); };
process.env.BUCKET='palier-etat-test'; process.env.TABLE='/palier/utilisateurs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'palier49-'));
fs.writeFileSync(path.join(tmp,'index.js'),code.join('\n'));
let NOW=1e12; Date.now=()=>NOW;
const log0=console.log; console.log=()=>{};
const {handler}=require(path.join(tmp,'index.js'));
console.log=log0;
const ALPHA='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const cleAlea=()=>Array.from(ncrypto.randomBytes(20),o=>ALPHA[o%32]).join('');
const sha=c=>ncrypto.createHash('sha256').update(c).digest('hex');
const K1=cleAlea(), K2=cleAlea(), K3=cleAlea();
SSM.val=JSON.stringify({[sha(K1)]:'gabriel',[sha(K2)]:'frere'});
/* export reel du 25 septembre 2026, v2.22, 23 seances : 16 247 octets, 3 137 en
   gzip. Sert l aller-retour de la section 17. */
const REEL='H4sIAAAAAAACA+1bS4+kOBL+L5zJlG3MK4+zM4eRZqXRTO8edlQHMpPKYooChkd1j1r13zfCgG3AvLKzDyutGnVSTmMH8fjii4D8akVFYZ2sIkqTuLRs6z0uqyTPYIgdGcMB68Rs6wtMoq7n2dYtj1Lr5NhW/RK/xTAvauoc5pV5k12r9psyyuCMEtv6HJVvMOeSvxVpXMO0S1Rek9w6PUdpFdtWVZdxfXmxTnXZwJ9pHl3/VXTX3uKotE5frTN+gAzwWYmTIo3quMKvKMyEAWaduG2Roys+6ZHhyYdtvUVffo3Ln7KrdXLxeiHgV+vPqMlQ8vZTiH7Dv9tP28ryBHZsP0ABSY6in/oToSPxN37AbA/OLdjt0jw/S6mEUBRGy1bSF9QajL6exUecRlUtzvAqcRJllzJCOai41bI9q6LsluISYjRN0TQ4XMeFPDlHVbvX67ndn4ivqIejMJxn5xzULpWeZHWpTFCU+XMCwlnX/C25JClqoB0Ti8lROM9yNOaPat7/TfQQE6GRqjSvf75+wS+LpoKIYAGosUlBJhZCZMS3qh275LgvCz9k9IjLQKtVXGHs/gMiEQRnEIlpcnupf2tAIIina/KuVvf6xVGolwTv9A8wNlgNQ58w70CCA/E+UffEQ1jr6Hvhf0CV9d+FCPq0jkthmbf8Ohy4NmUbv0kdv1Vi2eSKEAMYEFeHIk9uWQzqQnlr/N6zvac29EHMD7ub/hxd4gOKqM2EVSkxzH3LUzB7dbjG57yptfmeTU1rX+Poejg3tzkZnlrA4z5eMdZJ8InyE3dPbnCkrrtHJ+5EJ3Eav0c12Kw6YMCUUaorhjIpE5MyobsKR3VDjORLC50zgronwk80PBISfFdBHZtyODRxe1VfmjKtDi9ih3hsSt2aXF6C8XJoCm1yYMM/gx0LjLbnQwErLy1NWmCRcNLr0nOkMknomlQYClsziLsj99m3qXDW/33b171PChs1FyFtf7eQVi+tCSKIc9ASrFY1RZIJw6j1uA3/DOsJsJSr3fIzxMyh+quJ6jlNU03VKYDfS6xmOsQWxzRsNLVSwg1qpRTVykJIDEfnWz3zGr/HaV4U8aHK0+GNhFI2T95HmX9OshvorSrirBrobc7LnuMMctkB8B4oUrw+/5yU18M1v+kWHs6cKsrxA5OiuAhhduLekdHwIf4HkJEmQwcc3QiMf+4J2XMpUv7Yd8fqFLky+auJN0Vhn8Qn23SrvcZ1ncbnGNKT8r88qw/PmOAETZ3dRPl3BIFxi3u40q5xbTz4sj0Y67LnLL5SD70YD3r0fbrNOBpLxoiCncI9QOFtAoqpGucVpof4w1TsUBsPtqhiRqlJq5C1yInRk+MefR48TqsrGYzPZjAjEaG2OOZTzBo1Af8SxyZ2ghnCX1ZmYMpfjHbK5PxI3HtdlNGtoItxxWyNtmzC3dAONagmCzxgwRdnqAAbCTQGIV2VeLe/xxehTd4qRkBBQBTnYsykZucT9VDNlB/DYKfPMumz/E7KfBcODLxXAwEzLZjHjAktCGwnMFFpTb8BFjSdegNHOrHvmQCBuZgDHXZyfahB3Ht9mO0EBEZscWwFBD7raCNAmGMTc1EwZRPBPJvQXDgMNRd2mUIKYqpqmI8uTDyEXTe8W8tkM1KMA9M7uvtrBv2imeyFFaC5CJzNXpzZnNqcr6oYK2yp4tCVKva4Y1Jx2LFeEhxdl9yb2YJ9hYX/wMLCteHfamExm/E8WxybMt4mHye+qwxAiTIApdNsGB6IKDs4OfHgSOjdMO3tpRaBTdWtOMswMvTVOQwxZMYx+JTZTaiRuk9bcuSsVU34HXItPVJPYQvlRr07oopxsYvEfe9ex/c2Y8sYJsItLMRUr5iUOJMgx4RwKUeC+rgzAJh+KwBQDnuZvD30A6V0AvRaKj3wTUrvuz+uc4TYeJzSZ9FmUkV+I9p4M9XOEG3MPj13bdcfnsGqA8RtHS8UBdQMRKGn4iEMJAwFoWcwDCVoGOYAJTk6fngvCgX38JmtKLSNyUz9GhPnrFPfCV4mAAKsJ1Lj3JcaD10T/lDAHx8yNDJIJ9wfCu3pr0LvG/KwocGyhC3CKvWtBn/B+ZeufgYG4mE0TXokQ9BTNDH/stzLG6p1siUwRGDiPDRtOYC8u1hatx2l6hZ92wU2ofnFlOhOori9Aa/1FrFiKBf0Pdt3bJ8+zXCFwNPgk8iiI/T95UYP+I8ryjvn5JCjH3oP8p/w7qI6nGqTEmZ7vu15q3mqbX65GqT1qzG5WtAuRp8WMbso812d524fLrfhBLtETJd5lpKHNg/gmDoD3A2X7sxdpRFQMMWUzNiMR1DqK49gGntkDjd5gXjuAxUSYUfP8x/kBTvyKxaIC1X/JCCAYjiuzVapy7DwRIlG0ADKh2iFqn53CseGpbviD77ah4snCto+0wzj28IV5pLM1A+8AH3Zd2ZIlaOhAtRw2oMLYvABRgQScNDS0SHuY3wAq8jdT9sGgMCnIQykHOGVP632HVZ4b780UZkCNO2hDZY5BFY9euEzphH9wo6SObTdcAA705QwL22fFeKsidu3UIbhQLG2Ai+hdA4QHL1lwl3FsBkLTM7ABJGjJxIeGXkQrdjRax13UCSSq8iFGwq4HegRZeySTJpdCl6JRlCoilUASdAkGJj6T5uqK0PD3OBlKqO5ELT+wIFHyeHwZ/R2hr9AO7u9OdASp2OHIBjxn+ZawVRv8mit4NBUdmG30j8RcAr3yPay+1mnIPuyhL8nSwDiMqxFN9ZEE1dRBEIDXTCeC/ZbgYgxF5k+IZxgD+QTbrvO00LraNRI3Y4PQBgI+k445wqIr9IVmNZSpT5eUcTls3jBZmQbGFKyRBm+P4TSCG+MylvcOuQ5rnp5BoZcd7CxhaEWfv9nknWpta5+GNXha+nbJC9vY6qX1+/l9Se53kCbvJPDwYmPTsA1eTsSIKV1B9J2Vf6Qs0jJkKX0ogVDVaK3tLJRd+IT68LhBb/IPaRw+LZVz0ZM+pH0o5MCGUgrBQ9N7GVdELk1voVkZgRSEK4EAR9luqUwv7aCMGJiEOsMR2mEa1JRhi/OTR4wKQuReQsxaSE6eSC1/mhNiYCvro1ojck24+2p3J6Y8sa6RpQEQBIVSZmJc/a99m4X+K1BeHNQFQpjTaLgHoEuiydlCUyYvBl45OscKnr7ISWti+96Dp8MGIVkWLEoIZmMI+aZniSsP2ORIjAPRJDpYouxiBmVw03KUdAxttOocSIlEX0SzVrDON7nOYOeVxBOPEd0PH4Xq7RdD9WW2xJCElTakmPQxVvsd44iGEFk0MHdYBbfsHffKVpvgg8bwZosnsIzjcBuUcYsnBkQzVg2DBFtQNFnAnngGowYIF7jaTsEYAho4y6MUQZ3S75TXZvFltoQ2HiA+a5OykPW4Btlhu0zADm1t7x9dfdyR5zZL1cIoveA1YYVmZby9AAOhl4bGFiJVsKt20gjJvjbCKBwsYzdSefZ7LYDr5ECBd8IJ4EJTSbvBW7KSGQHxhnfjjzPpR/068tLVB/eoxkKd59PvQhKWD1uwaS6vCT5YxYs8qpuyvgQZ89RVj9kyeVG8IbKQeHEpGu8jhHDymFcLegYMhC1qsvkUq8XOY6te6OzRxtyi2Vl7N6hvKZ76XWwvurr+VBhfFaPWlA9fdqQMA3r9Y+q1mFnCjVdWXa4xVnefNlUnbENnm5sgxjVNeGsdF8+XuCO/QK/yHcKFttg36H6WWIrRNN+/8OnDVyBulugS5GgRd2PafKqZWHxJkvzy2t8xSXNZm4ff66AXTtpHKHt6KKV2iljzXWjhhvvHP0cXW+Yav6wKgp2+Iz/Va7VdbpggHfnONbeo5hCxZz31LXw4e5L/vnHuI4SKSqm6J++FLn4wdzI7hxZe+iIp11RUfx7/ONQvPbnt8G1UIRxBG5OsAjjRDwvbbJrjtp+jf8WNzBtX850HQd9Q1m8wX08Ny0cTppt7U0tmVWvk9sRVRX2mAI+3hiXd+bWdoYLO/qqWPV1z5i7H13qb9rc3zYMzQWqt6cNN20bejNtw/sRUUU85aa3a9bLNgU6/I5OBzF1OtQDqvWuy3yno3+YNSTke9oM4ZSIG9Phcncj+HgUQsz/THTw6+z/URBtMqApZuToQtN8M92Xuud1Q8rWYuBjPcF/fPwX+2hI4Hc/AAA=';
const K5=cleAlea();

/* serveur appele directement : l autre appareil, ou l administrateur */
async function serveur(m,cle,h,corps){
  const ev={rawPath:'/api/state',requestContext:{http:{method:m}},headers:Object.assign({'x-palier-key':cle},h||{})};
  if(corps){ ev.body=Buffer.from(corps).toString('base64'); ev.isBase64Encoded=true; }
  console.log=()=>{}; try{ return await handler(ev); } finally{ console.log=log0; }
}
async function distant(cle){
  const r=await serveur('GET',cle);
  if(r.statusCode!==200) return {statut:r.statusCode};
  return {statut:200,etag:r.headers.etag,v:JSON.parse(zlib.gunzipSync(Buffer.from(r.body,'base64')))};
}
async function poser(cle,obj){
  const d=await distant(cle);
  return serveur('PUT',cle,d.statut===200?{'if-match':d.etag}:{'if-none-match':'*'},zlib.gzipSync(JSON.stringify(obj)));
}

/* ---------- fetch : CloudFront, OAC, navigateur ---------- */
const NET={ok:true,appels:[],perdre:false,porte:null};
global.fetch=async(url,o)=>{
  const h={}; for(const k of Object.keys(o.headers||{})) h[k.toLowerCase()]=o.headers[k];
  const corps=o.body?Buffer.from(o.body):null;
  const a={m:o.method,h,keep:!!o.keepalive,taille:corps?corps.length:0,url};
  NET.appels.push(a);
  if(!NET.ok) throw new TypeError('Failed to fetch');
  if(o.keepalive&&corps&&corps.length>65536) throw new TypeError('keepalive : quota depasse');
  if(url!=='/api/state') throw new Error('url inattendue '+url);
  if(o.cache!=='no-store') throw new Error('cache no-store attendu');
  if(NET.porte){ const p=NET.porte;
    await new Promise((res,rej)=>{ p.then(res);
      if(o.signal) o.signal.addEventListener('abort',()=>rej(Object.assign(new Error('abort'),{name:'AbortError'}))); }); }
  let res;
  if(o.method==='PUT'&&(!h['x-amz-content-sha256']||h['x-amz-content-sha256']!==sha(corps))) res={statusCode:403,headers:{},body:''};
  else{
    const ev={rawPath:'/api/state',requestContext:{http:{method:o.method}},headers:h};
    if(corps){ ev.body=corps.toString('base64'); ev.isBase64Encoded=true; }
    console.log=()=>{}; try{ res=await handler(ev); } finally{ console.log=log0; }
  }
  if(NET.perdre){ NET.perdre=false; throw new TypeError('reponse perdue'); }
  a.statut=res.statusCode;
  let b=res.body?(res.isBase64Encoded?Buffer.from(res.body,'base64'):Buffer.from(res.body)):null;
  const rh=Object.assign({},res.headers||{});
  if(rh['content-encoding']==='gzip'&&b){ b=zlib.gunzipSync(b); delete rh['content-encoding']; }
  const vide=[204,304].includes(res.statusCode);
  return new Response(vide?null:b,{status:res.statusCode,headers:rh});
};

/* ---------- DOM, minuteurs ---------- */
const ecoutes={}; const on=(t,f)=>(ecoutes[t]=ecoutes[t]||[]).push(f);
const emet=t=>(ecoutes[t]||[]).slice().forEach(f=>f({key:'',target:{tagName:'DIV'},preventDefault(){}}));
let recharge=0;
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),
  location:{hash:'',protocol:'https:',reload(){recharge++;}},addEventListener:on};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=String(v)}};
let html=''; const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v;else this._h=v},get innerHTML(){return cap?html:(this._h||'')},classList:{add(){},remove(){}},style:{},textContent:'',className:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true); const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],visibilityState:'visible',
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:on};
global.navigator={onLine:true};
const vraiST=setTimeout;
let TM=[];
global.setTimeout=(f,ms)=>{ const t={at:NOW+(ms||0),f}; TM.push(t); return t; };
global.clearTimeout=t=>{ TM=TM.filter(x=>x!==t); };
global.setInterval=()=>({}); global.clearInterval=()=>{};
/* la compression passe par le pool de fils de Node : quelques tours de boucle
   ne suffisent pas, on laisse aussi passer un peu de temps reel */
const flushM=async()=>{ for(let i=0;i<6;i++){ await new Promise(r=>setImmediate(r)); await new Promise(r=>vraiST(r,2)); } };
const calme=async()=>{ for(let k=0;k<100;k++){ await flushM(); const d=TM.filter(t=>t.at<=NOW).sort((a,b)=>a.at-b.at);
  if(!d.length) return; d.forEach(t=>{ TM=TM.filter(x=>x!==t); t.f(); }); } throw new Error('minuteurs sans fin'); };
const avance=async ms=>{ const fin=NOW+ms; for(;;){ await calme(); const n=TM.filter(t=>t.at<=fin).sort((a,b)=>a.at-b.at)[0]; if(!n) break; NOW=n.at; } NOW=fin; await calme(); };

const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const flashs=[]; const flash0=flash; flash=(m,ms)=>{ flashs.push(m); flash0(m,ms); };
 const dernierFlash=()=>flashs[flashs.length-1]||'';
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const appareils={};
 /* rechargement de page sur un appareil : son stockage, un script neuf */
 const page=async nom=>{
   localStorage._m=appareils[nom]=appareils[nom]||{};
   state=null; cur=null; view='home'; uiAsk=null; lightMode=false; clearDay();
   sm=null; syncEtat=''; syncMsg=''; syncConflit=null; syncAttente=false; syncApres=false;
   syncCorps=null; syncPrep=null; syncEnvoi=null; syncRelance=false; syncVerif=null;
   syncMin=null; syncMinAttente=null; syncVu=0; TM=[];
   await loadState(); if(!state.hist.length&&state.onboard) domicile();
   initView(); await calme();
 };
 const seanceFictive=async n=>{ for(let i=0;i<n;i++){ state.hist.push({date:new Date(Date.UTC(2026,8,1+i,17)).toISOString(),type:'alterne',mode:'alterne',rounds:3,items:[],xp:10}); state.sessionCount++; } await save(); };
 const joue=async()=>{
   startSession(); if(!cur) err('seance non lancee');
   cur.log={}; cur.done=0;
   cur.steps.forEach(s=>{ if(s.k!=='set'||s.cool) return; const k=s.key||s.id, e=DB[s.id];
     (cur.log[k]=cur.log[k]||[]).push(e.reps?e.reps[0]:1); cur.done++; });
   cur.i=cur.steps.length;
   await endSession(false); await calme();
 };
 const retourAccueil=async()=>{ cur=null; go('home'); await calme(); };
 const appels=m=>NET.appels.filter(a=>!m||a.m===m);
 const raz=()=>{ NET.appels=[]; };
 const activer=async cle=>{ view='set'; render(); document.querySelector('#synccle').value=cle; await syncActiver(); await calme(); };
 const meta=()=>JSON.parse(localStorage._m['palier-sync-v1']||'null');
 const lance=()=>html.indexOf('onclick="startSession()">Lancer la séance')>=0;

 // 1. sans cle : rien ne touche au reseau
 await page('A');
 if(appels().length) err('sans cle : aucun appel au demarrage');
 await seanceFictive(2); await avance(10000);
 if(appels().length) err('sans cle : aucun appel apres enregistrement');
 if(!lance()||syncBloque()) err('sans cle : lancement libre');
 view='set'; render();
 if(html.indexOf('data-k="set-synchronisation"')<0||html.indexOf('>Désactivée<')<0) err('card presente, desactivee');
 if(html.indexOf('Gabriel, qui administre le service, peut les lire')<0||html.indexOf('signalements de douleur')<0) err('ligne d hebergement');
 if(html.indexOf('Aucun téléchargement enregistré sur cet appareil')>=0) err('mention « sur cet appareil » retiree des exports');
 window.location.protocol='http:'; render();
 if(syncDispo()||html.indexOf('Indisponible ici')<0) err('hors https : indisponible');
 window.location.protocol='https:';
 console.log('inertie OK : sans cle ni https, aucun appel, lancement libre');

 // 2. normalisation de la saisie
 const K=${JSON.stringify(K1)};
 const tiret=K.slice(0,5)+'-'+K.slice(5,10)+' '+K.slice(10,15)+'-'+K.slice(15);
 if(cleNorm(tiret.toLowerCase())!==K) err('casse, tirets, espaces');
 const conf=K.replace(/1/g,'l').replace(/0/g,'o');
 if(cleNorm(conf)!==K) err('confusions l et o');
 if(cleNorm('i'+K.slice(1))!=='1'+K.slice(1)) err('I vers 1');
 if(cleNorm(K.slice(1))!==null||cleNorm('U'+K.slice(1))!==null) err('longueur et U refuses');
 raz(); await activer('ABC');
 if(appels().length||dernierFlash().indexOf('Clé invalide')<0) err('cle mal formee : ni appel ni enregistrement');
 console.log('saisie OK : casse, tirets, espaces, I L O, forme invalide refusee sans appel');

 // 3. premiere liaison
 raz(); await activer(${JSON.stringify(K3)});
 if(sm||meta()||dernierFlash()!=='Clé inconnue') err('cle inconnue : rien enregistre');
 if(appels('GET').length!==1||appels('GET')[0].h['x-palier-key']!==${JSON.stringify(K3)}) err('cle envoyee sous forme canonique');
 raz(); NET.ok=false; await activer(tiret);
 if(sm||meta()||dernierFlash().indexOf('Pas de réseau')<0) err('hors reseau : cle non enregistree');
 NET.ok=true;
 // A a deux seances, rien en ligne : envoi
 raz(); await activer(tiret);
 const put=appels('PUT');
 if(put.length!==1||put[0].h['if-none-match']!=='*'||put[0].statut!==200) err('rien en ligne : un PUT If-None-Match *');
 if(!meta()||!meta().base||meta().sale||meta().cle!==K) err('meta : base posee, rien en attente');
 let d=await distant(K);
 if(d.v.hist.length!==2||d.v.app!=='palier'||d.v.appVersion!==VERSION) err('etat en ligne : export complet');
 if(JSON.stringify(d.v).indexOf(K)>=0||payload().indexOf(K)>=0||localStorage._m[SKEY].indexOf(K)>=0) err('cle absente de l objet en ligne, de l export et de l etat');
 if(!d.v.envoi||d.v.envoi.length!==16) err('identifiant d envoi dans le corps');
 view='set'; render();
 if(html.indexOf('Supprimer mes données en ligne')<0||html.indexOf('Désactiver')<0) err('card active : deux boutons');
 // B vierge : recuperation
 await page('B'); raz(); await activer(K);
 await avance(5000);
 if(appels('PUT').length||state.hist.length!==2||meta().base!==d.etag||meta().sale) err('rien en local : recuperation sans envoi');
 if(state.lastImport) err('recuperation : lastImport intact');
 if(state.envoi!==undefined) err('recuperation : identifiant d envoi retire de l etat');
 if(dernierFlash().indexOf('Progression récupérée')<0) err('recuperation annoncee');
 // C avec ses propres seances : question
 await page('C'); await seanceFictive(1); raz(); await activer(K);
 if(!syncConflit||appels('PUT').length) err('les deux existent : question, aucun envoi');
 go('home'); await calme();
 if(lance()||html.indexOf('Garder cet appareil')<0||html.indexOf('Prendre la version en ligne')<0) err('conflit : les choix remplacent le bouton');
 if(html.indexOf('1 séance, dernière le')<0||html.indexOf('2 séances, dernière le')<0) err('conflit : derniere seance de chaque cote');
 startSession(); if(cur) err('conflit : lancement refuse, clavier compris');
 await syncPrendre(); await calme();
 if(syncConflit||state.hist.length!==2||meta().sale||!lance()) err('prendre : etat en ligne adopte');
 console.log('liaison OK : 401 et reseau sans trace, envoi si rien en ligne, recuperation si rien en local, question sinon');

 // 4. envoi regroupe, empreinte, et fin de seance immediate
 raz(); await page('A');
 if(appels('GET').length!==1||appels('GET')[0].h['if-none-match']!==meta().base) err('ouverture : GET conditionnel sur la base');
 raz(); setGoal(1); setGoal(1); setGoal(-1); await avance(3000);
 if(appels('PUT').length) err('regroupe : rien avant 4 s de calme');
 await avance(1500);
 let p=appels('PUT');
 if(p.length!==1||p[0].statut!==200||p[0].h['if-match']===undefined||p[0].keep) err('regroupe : un seul PUT If-Match');
 if(p[0].h['content-type']!=='application/octet-stream') err('corps binaire');
 d=await distant(K); if(d.v.goal!==state.goal) err('dernier etat envoye');
 raz(); await joue();
 p=appels('PUT');
 if(p.length!==1||p[0].statut!==200) err('fin de seance : envoi sans attendre le regroupement');
 d=await distant(K); if(d.v.hist.length!==3) err('fin de seance : seance en ligne');
 await retourAccueil();
 console.log('envoi OK : regroupe a 4 s, If-Match, empreinte acceptee par l OAC, fin de seance immediate');

 // 5. arriere-plan : keepalive avec le corps deja pret
 raz(); setGoal(1); await flushM();
 document.visibilityState='hidden'; emet('visibilitychange'); await calme(); document.visibilityState='visible';
 p=appels('PUT');
 if(p.length!==1||!p[0].keep||p[0].statut!==200) err('arriere-plan : PUT keepalive immediat');
 await avance(5000); if(appels('PUT').length!==1) err('arriere-plan : pas de second envoi');
 raz(); state.bruit=Array.from({length:12000},()=>Math.random().toString(36).slice(2)).join(''); await save(); await flushM();
 emet('pagehide'); await calme();
 p=appels('PUT');
 if(p.length!==1||p[0].keep||p[0].taille<=65536||p[0].statut!==200) err('au-dela de 64 Ko : envoi normal, jamais un keepalive refuse');
 delete state.bruit; await save(); await avance(5000);
 console.log('arriere-plan OK : keepalive immediat, envoi normal au-dela du plafond');

 // 6. reponse perdue : on reconnait son propre envoi
 raz(); setGoal(1); await flushM(); NET.perdre=true;
 emet('pagehide'); await calme();
 if(!meta().sale||!meta().envoi) err('reponse perdue : envoi note, modification toujours en attente');
 d=await distant(K); if(d.v.goal!==state.goal||d.v.envoi!==meta().envoi.id) err('reponse perdue : l envoi a pourtant abouti');
 raz(); await page('A');
 if(syncConflit||meta().sale||meta().base!==d.etag||appels('PUT').length) err('rechargement : son propre envoi reconnu, pas de faux conflit');
 raz(); setGoal(-1); await flushM(); NET.perdre=true; emet('pagehide'); await calme();
 setGoal(1); await flushM();   // modifie apres l envoi perdu
 const g1=state.goal;
 raz(); await page('A');
 p=appels('PUT');
 if(syncConflit||p.length!==1||p[0].statut!==200) err('envoi perdu puis modifie : reconnu, puis renvoye');
 d=await distant(K); if(d.v.goal!==g1) err('envoi perdu puis modifie : etat final en ligne');
 console.log('reponse perdue OK : propre envoi reconnu a la relecture, modification ulterieure renvoyee');

 // 7. recuperation automatique et attente du lancement
 await page('B');
 if(state.hist.length!==3||state.goal!==g1) err('B : recupere l etat de A a l ouverture');
 await page('A'); await joue(); await retourAccueil();
 NET.porte=new Promise(r=>{ NET.lache=r; });
 await page('B');
 if(lance()||html.indexOf('Synchronisation…')<0) err('attente : le bouton cede la place');
 startSession(); if(cur) err('attente : lancement refuse');
 NET.lache(); NET.porte=null; await calme();
 if(!lance()||state.hist.length!==4) err('attente levee, etat recupere');
 console.log('recuperation OK : a l ouverture, bouton en attente puis rendu');

 // 8. attente plafonnee a 5 s, reponse ecartee pendant la seance
 await page('A'); await joue(); await retourAccueil();
 NET.porte=new Promise(r=>{ NET.lache=r; });
 await page('B');
 await avance(4900); if(lance()) err('plafond : encore en attente a 4,9 s');
 await avance(200); if(!lance()) err('plafond : bouton rendu a 5 s');
 const avant=state.hist.length;
 startSession(); if(!cur) err('plafond : la seance part sans la synchronisation');
 NET.lache(); NET.porte=null; await calme();
 if(state.hist.length!==avant||!syncApres) err('reponse arrivee en seance : rien n est adopte');
 cur.log={}; cur.done=0; cur.steps.forEach(s=>{ if(s.k!=='set'||s.cool) return; const k=s.key||s.id, e=DB[s.id]; (cur.log[k]=cur.log[k]||[]).push(e.reps?e.reps[0]:1); cur.done++; });
 cur.i=cur.steps.length; await endSession(false); await calme();
 if(syncConflit) err('recap : pas de question pendant le recapitulatif');
 await retourAccueil();
 if(!syncConflit||lance()) err('retour a l accueil : divergence posee en question');
 syncGarder(); await calme();
 d=await distant(K);
 if(syncConflit||meta().sale||d.v.hist.length!==avant+1||d.etag!==meta().base) err('garder : cet appareil remplace l etat en ligne');
 console.log('plafond OK : 5 s puis lancement libre, reponse ecartee en seance, question au retour, garder');

 // 9. 412 : un autre appareil a ecrit entre-temps
 await page('A');
 if(state.hist.length!==avant+1) err('A recupere le choix de B');
 d=await distant(K); const autre=Object.assign({},d.v,{goal:7,envoi:'autreappareil'}); await poser(K,autre);
 raz(); setGoal(-1); await avance(5000);
 if(appels('PUT')[0].statut!==412||!syncConflit) err('412 puis relecture : question');
 await page('A');
 if(!syncConflit) err('conflit recalcule au rechargement');
 await syncPrendre(); await calme();
 if(state.goal!==7||meta().sale) err('prendre apres 412');
 console.log('conflit OK : 412, relecture, question, recalculee au rechargement');

 // 10. version superieure en ligne
 d=await distant(K); await poser(K,Object.assign({},d.v,{appVersion:'9.0',envoi:'futur'}));
 await page('A'); raz();
 if(syncEtat!=='version'||state.goal!==7) err('version superieure : ni recuperation');
 if(lance()||html.indexOf('Recharger')<0||html.indexOf('v9.0')<0) err('version superieure : rechargement propose a la place du lancement');
 setGoal(-1); await avance(5000);
 if(appels('PUT').length) err('version superieure : ni envoi');
 syncRecharger(); if(recharge!==1) err('bouton recharger');
 d=await distant(K); await poser(K,Object.assign({},d.v,{appVersion:VERSION,envoi:'retour'}));
 await page('A');
 syncConflit=null; sm.baseVer='9.0'; sm.sale=true; raz(); await syncEnvoyer();
 if(appels('PUT').length||syncEtat!=='version') err('base de version superieure : envoi refuse');
 await page('A'); if(syncConflit) await syncPrendre(); await calme();
 console.log('version OK : ni recuperation ni envoi, rechargement demande');

 // 11. hors ligne, puis retour du reseau
 navigator.onLine=false; NET.ok=false; raz();
 await page('A');
 if(appels().length||!lance()||syncEtat!=='hors') err('hors ligne declare : ni attente ni appel');
 setGoal(1); await avance(5000);
 if(!meta().sale) err('hors ligne : modification en attente, persistee');
 view='set'; render(); if(html.indexOf('>Hors ligne<')<0) err('hors ligne : en-tete');
 navigator.onLine=true; NET.ok=true; raz(); view='home'; emet('online'); await calme();
 p=appels('PUT');
 if(appels('GET').length!==1||p.length!==1||p[0].statut!==200||meta().sale) err('retour du reseau : relecture 304 puis envoi');
 console.log('hors ligne OK : aucune attente, envoi differe au retour du reseau');

 // 12. jamais de recuperation pendant une seance
 d=await distant(K); await poser(K,Object.assign({},d.v,{goal:2,envoi:'x'}));
 startSession(); const g0=state.goal; raz(); NOW+=60000;
 document.visibilityState='visible'; emet('visibilitychange'); emet('focus'); emet('online'); await calme();
 if(appels('GET').length||state.goal!==g0) err('en seance : aucune relecture, aucune adoption');
 cur=null; go('home'); NOW+=60000; emet('focus'); await calme();
 if(state.goal!==2) err('hors seance : recuperation au focus');
 raz(); emet('focus'); NOW+=20000; emet('focus'); await calme();
 if(appels('GET').length) err('focus : une verification par 30 s au plus');
 NOW+=11000; emet('focus'); await calme();
 if(appels('GET').length!==1) err('focus : verification apres 30 s');
 console.log('seance OK : aucune adoption en seance, focus borne a une verification par 30 s');

 // 13. cle revoquee puis remplacee, meme identifiant
 SSM.val=JSON.stringify({[sha(${JSON.stringify(K2)})]:'frere'}); NOW+=300001;
 raz(); setGoal(1); await avance(5000);
 if(syncEtat!=='refus'||!meta().sale) err('cle revoquee : refus, modification gardee');
 view='set'; render(); if(html.indexOf('Clé refusée')<0||html.indexOf('Remplacer la clé')<0) err('cle revoquee : saisie proposee');
 raz(); setGoal(1); await avance(5000); if(appels('PUT').length) err('cle revoquee : plus d envoi');
 const K4=${JSON.stringify(cleAlea())};
 SSM.val=JSON.stringify({[sha(${JSON.stringify(K2)})]:'frere',[sha(K4)]:'gabriel'}); NOW+=16000;
 raz(); document.querySelector('#synccle').value=K4; await syncActiver(); await calme();
 if(syncEtat||meta().sale||meta().cle!==K4||appels('PUT').length!==1||appels('PUT')[0].h['if-match']===undefined) err('cle remplacee : base conservee, attente envoyee');
 d=await distant(K4); if(d.v.goal!==state.goal) err('cle remplacee : meme objet en ligne');
 console.log('revocation OK : refus sans perte, nouvelle cle sur le meme identifiant');

 // 14. reinitialisation propagee, texte le dit
 view='set'; uiAsk='reset'; render();
 if(html.indexOf('sur tous tes appareils synchronisés')<0) err('reinitialisation : propagation annoncee');
 raz(); await resetAll(); await avance(5000);
 d=await distant(K4); if(d.v.hist.length!==0||appels('PUT').length!==1) err('reinitialisation propagee');
 await page('B');
 if(syncEtat!=='refus') err('B porte encore la cle revoquee');
 document.querySelector('#synccle').value=K4; await syncActiver(); await calme();
 if(state.hist.length!==0) err('B : reinitialisation recuperee avec la nouvelle cle');
 console.log('reinitialisation OK : propagee, et dite');

 // 15. suppression depuis A, B se desactive a sa prochaine ouverture
 await page('A'); view='set'; uiAsk='syncdel'; render();
 if(html.indexOf('Toutes les versions sont effacées')<0) err('suppression : confirmation');
 raz(); await syncSupprimerOK(); await calme();
 if(appels('DELETE').length!==1||sm||meta()||(await distant(K4)).statut!==404) err('suppression : DELETE, synchro desactivee ici');
 if(!state.hist) err('suppression : etat local garde');
 raz(); setGoal(1); await avance(5000); if(appels().length) err('desactivee : plus aucun appel');
 raz(); await page('B');
 if(sm||dernierFlash().indexOf('Données en ligne supprimées')<0||appels('PUT').length) err('404 apres liaison : desactivation, jamais de renvoi');
 if((await distant(K4)).statut!==404) err('404 apres liaison : la suppression tient');
 console.log('suppression OK : purge, desactivation ici, et ailleurs a la prochaine ouverture');

 // 16. desactiver
 await page('A'); await activer(K4);
 if(!sm||!sm.lie) err('reactivation');
 view='set'; uiAsk='syncoff'; render();
 if(html.indexOf('Désactiver sur cet appareil ?')<0) err('desactivation : question');
 const h0=state.hist.length; syncDesactiverOK(); await calme();
 if(sm||meta()||state.hist.length!==h0) err('desactiver : cle oubliee, etat garde');
 if((await distant(K4)).statut!==200) err('desactiver : l etat en ligne reste');
 console.log('desactivation OK : cle oubliee ici, rien d efface');

 // 17. aller-retour sur l export reel : migrations jouees a la recuperation
 SSM.val=JSON.stringify({[sha(${JSON.stringify(K5)})]:'reel'}); NOW+=300001;
 const reel=JSON.parse(zlib.gunzipSync(Buffer.from(REEL,'base64')).toString());
 await page('D'); applyImport(JSON.parse(JSON.stringify(reel))); await save();
 const attendu=JSON.parse(payload());
 raz(); await activer(${JSON.stringify(K5)});
 if(appels('PUT').length!==1||appels('PUT')[0].taille>6000) err('export reel : un envoi, quelques Ko');
 await page('E'); await activer(${JSON.stringify(K5)});
 const recu=JSON.parse(payload());
 for(const k of ['hist','perf','unlocked','badges','slotIdx','profils','gear','xp','sessionCount','undo'])
   if(JSON.stringify(recu[k])!==JSON.stringify(attendu[k])) err('export reel : '+k+' differe apres l aller-retour');
 /* lastImport voyage avec l etat, comme lastExport : la recuperation ne le
    pose pas, elle garde celui de l appareil qui a importe */
 if(recu.lastImport!==attendu.lastImport||recu.envoi!==undefined) err('export reel : lastImport de l appareil d origine, pas d envoi dans l etat');
 d=await distant(${JSON.stringify(K5)});
 if(d.v.appVersion!==VERSION) err('export reel : relu par la v2.24, renvoye en v2.24');
 console.log('aller-retour OK : export reel v2.22, 23 seances, identique apres envoi et recuperation');

 console.log('TESTS V2.24 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
