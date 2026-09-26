// Lot v2.24, etapes 1 et 2 : stack palier-backend, cle.sh, comportement /api/*
// de palier-edge. Le code de la Lambda
// est extrait du template, S3 et SSM sont simules en interceptant require.
// cle.sh tourne pour de vrai, avec un aws de substitution en tete du PATH :
// la cle qu il affiche doit ouvrir l API, ce qui prouve que le script et la
// Lambda calculent la meme empreinte.
const fs=require('fs'), os=require('os'), path=require('path');
const zlib=require('zlib'), crypto=require('crypto'), Module=require('module');
const {execFileSync,spawnSync}=require('child_process');
const ok=(c,m)=>{ if(!c) throw new Error(m); };
const tpl=fs.readFileSync('palier-backend.yaml','utf8');

/* ---------- 1. decisions portees par le template ---------- */
{
  const bloc=nom=>{ const i=tpl.indexOf('\n  '+nom+':\n'); ok(i>=0,'ressource absente : '+nom);
    const j=tpl.slice(i+1).search(/\n  [A-Za-z]+:\n/); return tpl.slice(i+1,j<0?undefined:i+1+j); };
  const b=bloc('BucketEtat');
  ok(/DeletionPolicy: Retain/.test(b)&&/UpdateReplacePolicy: Retain/.test(b),'bucket : Retain sur les deux politiques');
  ok(/BucketName: !Sub palier-etat-\$\{AWS::AccountId\}/.test(b),'bucket : nom');
  ok(/Status: Enabled/.test(b)&&/NoncurrentDays: 90/.test(b)&&/NewerNoncurrentVersions: 30/.test(b),'bucket : versions 90 jours, 30 gardees');
  ok(/BlockPublicPolicy: true/.test(b),'bucket : acces public bloque');
  ok(/aws:SecureTransport: 'false'/.test(bloc('PolitiqueBucketEtat')),'bucket : TLS obligatoire');
  const f=bloc('FonctionApi');
  ok(/ReservedConcurrentExecutions: 2\n/.test(f),'concurrence reservee a 2');
  ok(/Runtime: nodejs24\.x/.test(f)&&/Architectures: \[arm64\]/.test(f),'runtime');
  ok(/RetentionInDays: 30/.test(bloc('JournalApi'))&&/DependsOn: JournalApi/.test(f),'journal a retention bornee, cree avant la fonction');
  ok(/AuthType: AWS_IAM/.test(bloc('UrlApi')),'URL en AWS_IAM');
  const pu=bloc('PermissionUrl'), pi=bloc('PermissionInvocation');
  ok(/Action: lambda:InvokeFunctionUrl/.test(pu)&&/Principal: cloudfront\.amazonaws\.com/.test(pu),'permission URL');
  ok(/Action: lambda:InvokeFunction\n/.test(pi)&&/InvokedViaFunctionUrl: true/.test(pi),'permission d invocation restreinte a l URL');
  for(const p of [pu,pi]) ok(/distribution\/\$\{DistributionId\}/.test(p),'permission bornee a la distribution');
  ok(!/AWS::SSM::Parameter/.test(tpl),'la table ne doit pas etre une ressource de la stack');
  ok(/ssm:GetParameter\n/.test(tpl)&&!/ssm:PutParameter/.test(tpl),'la Lambda lit la table, ne l ecrit pas');
  ok(/s3:ListBucket, s3:ListBucketVersions/.test(tpl)&&/s3:DeleteObjectVersion/.test(tpl),'droits de purge et de 404');
  ok(/ApiHote:\n\s+Value: !Select \[2, !Split \['\/', !GetAtt UrlApi\.FunctionUrl\]\]/.test(tpl),'sortie ApiHote : hote seul');
  console.log('T1 OK : template, retention, concurrence, permissions, table hors stack');
}
/* ---------- 1b. palier-edge : origine et comportement /api/* ---------- */
{
  const e=fs.readFileSync('palier-edge.yaml','utf8');
  ok(/\n  ApiHote:\n    Type: String\n    Default: ''\n/.test(e)&&/AvecApi: !Not \[!Equals \[!Ref ApiHote, ''\]\]/.test(e),'ApiHote vide par defaut, condition AvecApi');
  const oac=e.slice(e.indexOf('\n  OacApi:'),e.indexOf('\n  AclWaf:'));
  ok(/Condition: AvecApi/.test(oac)&&/OriginAccessControlOriginType: lambda/.test(oac)&&/SigningBehavior: always/.test(oac)&&/SigningProtocol: sigv4/.test(oac),'OAC lambda signant toujours');
  const o=e.slice(e.indexOf('            - AvecApi\n            - Id: api'));
  ok(/DomainName: !Ref ApiHote/.test(o)&&/OriginAccessControlId: !GetAtt OacApi\.Id/.test(o)&&/OriginProtocolPolicy: https-only/.test(o),'origine api : hote, OAC, https');
  const i=e.indexOf('CacheBehaviors: !If'); ok(i>0,'comportement /api/* absent');
  const c=e.slice(i,e.indexOf('- !Ref AWS::NoValue',i));
  ok(/- AvecApi\n/.test(c)&&/PathPattern: \/api\/\*\n/.test(c)&&/TargetOriginId: api\n/.test(c),'comportement /api/* vers l origine api');
  ok(/ViewerProtocolPolicy: https-only\n/.test(c),'https-only : une redirection perdrait le corps d un PUT');
  ok(/AllowedMethods: \[GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE\]/.test(c),'sept methodes');
  ok(/Compress: false\n/.test(c),'Compress a false : ETag fort');
  ok(/CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad\n/.test(c),'CachingDisabled');
  ok(/OriginRequestPolicyId: b689b0a8-53d0-40ab-baf2-68738e2966ac\n/.test(c),'AllViewerExceptHostHeader');
  const d=e.slice(e.indexOf('DefaultCacheBehavior:'),i);
  ok(/TargetOriginId: site/.test(d)&&/ViewerProtocolPolicy: redirect-to-https/.test(d)&&/Compress: true/.test(d)&&/658327ea-f89d-4fab-a63d-7e88639e58f6/.test(d),'comportement par defaut du site inchange');
  console.log('T1b OK : palier-edge, OAC lambda, origine api, /api/* en https seul, sans cache ni compression');
}

/* ---------- simulateurs ---------- */
const lignes=tpl.split('\n'); const z=lignes.findIndex(l=>/^\s+ZipFile: \|$/.test(l));
ok(z>0,'ZipFile introuvable');
const ind=lignes[z].search(/\S/)+2; const code=[];
for(let i=z+1;i<lignes.length;i++){ const l=lignes[i]; if(l.trim()===''){code.push('');continue;} if(l.search(/\S/)<ind) break; code.push(l.slice(ind)); }

const err=(name,st)=>Object.assign(new Error(name),{name,$metadata:{httpStatusCode:st}});
const S3={objs:{},n:0,page:1000,panne:null,appels:[]};
function versions(k){ return S3.objs[k]||(S3.objs[k]=[]); }
function courant(k){ const v=versions(k); const c=v[v.length-1]; return c&&!c.marqueur?c:null; }
const S3cmd={
  GetObjectCommand(i){ const c=courant(i.Key); if(!c) throw err('NoSuchKey',404);
    if(i.IfNoneMatch&&i.IfNoneMatch===c.etag) throw err('NotModified',304);
    return {ETag:c.etag,Metadata:c.meta,Body:{transformToByteArray:async()=>new Uint8Array(c.body)}}; },
  PutObjectCommand(i){ if(S3.panne){ const p=S3.panne; S3.panne=null; throw p; }
    const c=courant(i.Key);
    if(i.IfMatch!==undefined){ if(!c) throw err('NoSuchKey',404); if(c.etag!==i.IfMatch) throw err('PreconditionFailed',412); }
    if(i.IfNoneMatch==='*'&&c) throw err('PreconditionFailed',412);
    const etag='"'+crypto.createHash('md5').update(i.Body).digest('hex')+(++S3.n)+'"';
    versions(i.Key).push({vid:String(S3.n).padStart(6,'0'),etag,body:Buffer.from(i.Body),meta:i.Metadata,ce:i.ContentEncoding});
    return {ETag:etag}; },
  ListObjectVersionsCommand(i){
    const tout=[];
    for(const k of Object.keys(S3.objs).sort()) for(const v of [...S3.objs[k]].reverse()) if(k.startsWith(i.Prefix)) tout.push({k,v});
    let d=0; if(i.KeyMarker!==undefined) d=tout.findIndex(e=>e.k===i.KeyMarker&&e.v.vid===i.VersionIdMarker)+1;
    const p=tout.slice(d,d+S3.page), tr=d+S3.page<tout.length, der=p[p.length-1];
    return {IsTruncated:tr,NextKeyMarker:tr?der.k:undefined,NextVersionIdMarker:tr?der.v.vid:undefined,
      Versions:p.filter(e=>!e.v.marqueur).map(e=>({Key:e.k,VersionId:e.v.vid})),
      DeleteMarkers:p.filter(e=>e.v.marqueur).map(e=>({Key:e.k,VersionId:e.v.vid}))}; },
  DeleteObjectsCommand(i){ for(const o of i.Delete.Objects){ const v=versions(o.Key); const j=v.findIndex(x=>x.vid===o.VersionId); if(j>=0) v.splice(j,1); } return {Errors:[]}; }
};
const SSM={val:undefined,lectures:0,panne:null};
const fabrique=table=>{ const m={}; for(const n of Object.keys(table)) m[n]=class{constructor(i){this.input=i;this.nom=n;}}; return m; };
const s3mod=fabrique(S3cmd); s3mod.S3Client=class{ async send(c){ S3.appels.push(c.nom); return S3cmd[c.nom](c.input); } };
const ssmmod={GetParameterCommand:class{constructor(i){this.input=i;}},
  SSMClient:class{ async send(c){ SSM.lectures++; if(SSM.panne) throw SSM.panne;
    if(SSM.val===undefined) throw err('ParameterNotFound',400); return {Parameter:{Value:SSM.val}}; } }};
const charge0=Module._load;
Module._load=function(r,...a){ if(r==='@aws-sdk/client-s3') return s3mod; if(r==='@aws-sdk/client-ssm') return ssmmod; return charge0.call(this,r,...a); };
process.env.BUCKET='palier-etat-test'; process.env.TABLE='/palier/utilisateurs';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'palierapi-'));
fs.writeFileSync(path.join(tmp,'index.js'),code.join('\n'));
let maintenant=1e12; const now0=Date.now; Date.now=()=>maintenant;
const journal=[]; const log0=console.log; console.log=(...a)=>journal.push(a.join(' '));
const {handler}=require(path.join(tmp,'index.js'));
console.log=log0;

const ALPHA='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const cleAlea=()=>Array.from(crypto.randomBytes(20),o=>ALPHA[o%32]).join('');
const sha=c=>crypto.createHash('sha256').update(c).digest('hex');
const gz=o=>zlib.gzipSync(Buffer.from(typeof o==='string'?o:JSON.stringify(o)));
async function appel(m,cle,opt={}){
  const h=Object.assign({},opt.h||{}); if(cle!==null) h['x-palier-key']=cle;
  const ev={rawPath:opt.chemin||'/api/state',rawQueryString:opt.qs||'',requestContext:{http:{method:m}},headers:h};
  if(opt.corps!==undefined){ ev.body=opt.brut?opt.corps:Buffer.from(opt.corps).toString('base64'); ev.isBase64Encoded=!opt.brut; }
  console.log=(...a)=>journal.push(a.join(' '));
  try{ return await handler(ev); } finally{ console.log=log0; }
}
const K1=cleAlea(), K2=cleAlea();
const etatA={appVersion:'2.24',hist:[{d:'2026-09-26'}]};

(async()=>{
try{
/* ---------- 2. routes, methodes, format de cle ---------- */
{
  SSM.val=JSON.stringify({[sha(K1)]:'gabriel',[sha(K2)]:'frere'});
  ok((await appel('GET',K1,{chemin:'/api/autre'})).statusCode===404,'route inconnue : 404');
  ok((await appel('POST',K1)).statusCode===405,'POST : 405');
  ok((await appel('OPTIONS',K1)).statusCode===405,'OPTIONS : 405');
  ok((await appel('GET',null)).statusCode===401,'sans cle : 401');
  const l0=SSM.lectures;
  for(const c of [K1.toLowerCase(),K1.slice(0,5)+'-'+K1.slice(5),K1.slice(1),K1+'0','I'+K1.slice(1),'U'+K1.slice(1)])
    ok((await appel('GET',c)).statusCode===401,'forme non canonique acceptee : '+c);
  ok(SSM.lectures===l0,'une cle mal formee ne doit pas lire la table');
  ok((await appel('GET',cleAlea())).statusCode===401,'cle inconnue : 401');
  console.log('T2 OK : route unique, methodes, forme canonique seule, 401 sans lecture de table');
}
/* ---------- 3. premiere liaison, lecture, 304 ---------- */
let E1;
{
  ok((await appel('GET',K1)).statusCode===404,'rien en ligne : 404');
  ok((await appel('PUT',K1,{corps:gz(etatA)})).statusCode===428,'PUT sans condition : 428');
  ok((await appel('PUT',K1,{corps:gz(etatA),brut:true,h:{'if-none-match':'*'}})).statusCode===400,'corps non binaire : 400');
  const r=await appel('PUT',K1,{corps:gz(etatA),h:{'if-none-match':'*'}});
  ok(r.statusCode===200&&r.headers.etag&&JSON.parse(r.body).etag===r.headers.etag,'creation : 200 et ETag');
  E1=r.headers.etag;
  const v=courant('state/gabriel.json');
  ok(v&&v.meta.appversion==='2.24'&&v.ce==='gzip','objet : state/<id>.json, version en metadonnee, gzip');
  ok(Buffer.compare(v.body,gz(etatA))===0,'le corps est stocke tel quel, sans recompression');
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-none-match':'*'}})).statusCode===412,'deuxieme creation : 412');
  const g=await appel('GET',K1);
  ok(g.statusCode===200&&g.isBase64Encoded&&g.headers['content-encoding']==='gzip'&&g.headers.etag===E1,'lecture : 200, gzip, ETag');
  ok(g.headers['x-palier-version']==='2.24'&&g.headers['cache-control']==='no-store','lecture : version et no-store');
  ok(JSON.stringify(JSON.parse(zlib.gunzipSync(Buffer.from(g.body,'base64'))))===JSON.stringify(etatA),'lecture : etat intact');
  const n=await appel('GET',K1,{h:{'if-none-match':E1}});
  ok(n.statusCode===304&&n.body===''&&n.headers.etag===E1,'ETag inchange : 304 sans corps');
  ok((await appel('GET',K1,{h:{'if-none-match':'"autre"'}})).statusCode===200,'ETag perime : 200');
  console.log('T3 OK : premiere liaison, 428, lecture gzip, 304');
}
/* ---------- 4. ecriture conditionnelle ---------- */
{
  const r=await appel('PUT',K1,{corps:gz({appVersion:'2.24',hist:[1,2]}),h:{'if-match':E1}});
  ok(r.statusCode===200&&r.headers.etag!==E1,'If-Match courant : 200, nouvel ETag');
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-match':E1}})).statusCode===412,'If-Match perime : 412');
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-match':E1,'if-none-match':'*'}})).statusCode===412,'If-Match prime sur If-None-Match');
  S3.panne=err('ConditionalRequestConflict',409);
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-match':r.headers.etag}})).statusCode===412,'409 S3 : 412 au client');
  S3.panne=err('InternalError',500);
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-match':r.headers.etag}})).statusCode===503,'panne S3 : 503');
  ok(courant('state/gabriel.json').etag===r.headers.etag,'aucune ecriture sur un refus');
  console.log('T4 OK : If-Match, 412 sur ETag perime et sur conflit S3, 503 sur panne');
}
/* ---------- 5. corps refuses ---------- */
{
  const E=courant('state/gabriel.json').etag, h={'if-match':E};
  ok((await appel('PUT',K1,{corps:crypto.randomBytes(2*1024*1024+1),h})).statusCode===413,'corps au-dela de 2 Mo : 413');
  const bombe=zlib.gzipSync(Buffer.alloc(17*1024*1024,32)); ok(bombe.length<100000,'bombe mal formee');
  ok((await appel('PUT',K1,{corps:bombe,h})).statusCode===413,'bombe gzip : 413');
  ok((await appel('PUT',K1,{corps:Buffer.from('pas du gzip'),h})).statusCode===400,'gzip invalide : 400');
  ok((await appel('PUT',K1,{corps:gz('{pas du json'),h})).statusCode===400,'json invalide : 400');
  for(const o of ['[1]','null','"x"',{hist:[]},{appVersion:2.24},{appVersion:'2.24;x'},{appVersion:''}])
    ok((await appel('PUT',K1,{corps:gz(o),h})).statusCode===400,'etat invalide accepte : '+JSON.stringify(o));
  const gros={appVersion:'2.24',pad:crypto.randomBytes(1400000).toString('hex')};
  const gg=gz(gros); ok(gg.length>1.3e6&&gg.length<2*1024*1024,'etat de taille limite mal forme : '+gg.length);
  ok((await appel('PUT',K1,{corps:gg,h})).statusCode===200,'etat proche de 2 Mo : accepte');
  console.log('T5 OK : 413 au-dela de 2 Mo et sur bombe, 400 sur gzip, json ou etat invalide');
}
/* ---------- 6. identifiant tire de la table seule ---------- */
{
  ok((await appel('GET',K2)).statusCode===404,'frere : rien en ligne');
  ok((await appel('GET',K2,{qs:'id=gabriel',h:{'x-palier-id':'gabriel'}})).statusCode===404,'identifiant de la requete ignore');
  ok((await appel('PUT',K2,{corps:gz(etatA),h:{'if-none-match':'*'}})).statusCode===200,'frere : creation');
  ok(courant('state/frere.json')&&courant('state/gabriel.json').body.length>1e6,'etats separes');
  const K3=cleAlea(); maintenant+=15000;
  SSM.val=JSON.stringify(Object.assign(JSON.parse(SSM.val),{[sha(K3)]:'../gabriel'}));
  ok((await appel('GET',K3)).statusCode===401,'identifiant hors format dans la table : 401');
  console.log('T6 OK : identifiant de la table, jamais de la requete, etats separes');
}
/* ---------- 7. cache de la table ---------- */
{
  maintenant+=300000; await appel('GET',K1); const l=SSM.lectures;
  for(let i=0;i<50;i++) await appel('GET',K1);
  ok(SSM.lectures===l,'cle connue dans le TTL : aucune relecture');
  maintenant+=5000; await appel('GET',cleAlea()); await appel('GET',cleAlea());
  ok(SSM.lectures===l,'cle inconnue avant 15 s : pas de relecture');
  const t=JSON.parse(SSM.val); delete t[sha(K2)]; SSM.val=JSON.stringify(t);
  ok((await appel('GET',K2)).statusCode===200&&SSM.lectures===l,'cle revoquee : encore servie dans le TTL, borne annoncee');
  const K4=cleAlea(); t[sha(K4)]='ami'; SSM.val=JSON.stringify(t);
  ok((await appel('GET',K4)).statusCode===401,'cle neuve avant 15 s : pas encore vue');
  maintenant+=10000;
  ok((await appel('GET',K4)).statusCode===404&&SSM.lectures===l+1,'cle neuve apres 15 s : une relecture, puis servie');
  ok((await appel('GET',cleAlea())).statusCode===401&&SSM.lectures===l+1,'relecture bornee a une par 15 s');
  ok((await appel('GET',K2)).statusCode===401,'cle revoquee : refusee des la relecture suivante');
  const t2=JSON.parse(SSM.val); delete t2[sha(K4)]; SSM.val=JSON.stringify(t2); maintenant+=299999;
  ok((await appel('GET',K4)).statusCode===404,'cle revoquee : servie juste avant le TTL');
  maintenant+=1;
  ok((await appel('GET',K4)).statusCode===401,'cle revoquee : refusee au TTL');
  maintenant+=300000; SSM.panne=err('ThrottlingException',400);
  ok((await appel('GET',K1)).statusCode===503,'table illisible : 503, jamais une ancienne table au-dela du TTL');
  SSM.panne=null; const sv=SSM.val; SSM.val=undefined; maintenant+=300000;
  ok((await appel('GET',K1)).statusCode===401,'table absente : tout le monde refuse, sans panne');
  SSM.val=sv; maintenant+=300000;
  console.log('T7 OK : cache 5 min, relecture a 15 s sur cle inconnue, revocation bornee, pannes');
}
/* ---------- 8. purge ---------- */
{
  S3.page=2;
  const k='state/gabriel.json';
  versions(k).push({vid:'900000',marqueur:true});
  versions(k).push({vid:'900001',etag:'"x"',body:gz(etatA),meta:{appversion:'2.24'}});
  versions('state/gabriel.json.old').push({vid:'900002',etag:'"y"',body:gz(etatA),meta:{}});
  const avant=versions(k).length; ok(avant>=5,'jeu de purge trop petit');
  const d=await appel('DELETE',K1);
  ok(d.statusCode===204&&d.body==='','purge : 204');
  ok(versions(k).length===0,'purge : versions et marqueurs de state/gabriel.json tous supprimes');
  ok(versions('state/gabriel.json.old').length===1,'purge : cle exacte, pas le prefixe');
  ok(courant('state/frere.json'),'purge : les autres utilisateurs intacts');
  ok(S3.appels.filter(a=>a==='ListObjectVersionsCommand').length>2,'pagination non exercee');
  ok((await appel('GET',K1)).statusCode===404,'apres purge : 404');
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-match':'"x"'}})).statusCode===412,'If-Match sur objet purge : 412');
  ok((await appel('PUT',K1,{corps:gz(etatA),h:{'if-none-match':'*'}})).statusCode===200,'apres purge : nouvelle liaison');
  ok((await appel('DELETE',K1)).statusCode===204&&(await appel('DELETE',K1)).statusCode===204,'purge repetee sans erreur');
  S3.page=1000;
  console.log('T8 OK : purge de toutes les versions, cle exacte, pagination, reliaison');
}
/* ---------- 9. journal ---------- */
{
  ok(journal.length>50,'journal vide');
  for(const l of journal){ for(const c of [K1,K2]) ok(!l.includes(c),'cle dans le journal');
    ok(l.length<300,'corps dans le journal ?'); JSON.parse(l); }
  ok(journal.some(l=>/"s":413/.test(l)&&/"id":"gabriel"/.test(l)),'journal : statut et identifiant');
  console.log('T9 OK : journal une ligne JSON par appel, ni cle ni corps');
}
/* ---------- 10. cle.sh ---------- */
{
  const bin=fs.mkdtempSync(path.join(os.tmpdir(),'palieraws-')), f=path.join(bin,'table'), puts=path.join(bin,'puts');
  fs.writeFileSync(path.join(bin,'aws'),`#!/bin/bash
v=""; while [ $# -gt 0 ]; do [ "$1" = --value ] && v=$2; shift; done
if [ "$AWS_MODE" = refus ] && [ -z "$v" ]; then echo "An error occurred (AccessDeniedException) when calling the GetParameter operation" >&2; exit 254; fi
if [ -z "$v" ]; then [ -f ${f} ] || { echo "An error occurred (ParameterNotFound) when calling the GetParameter operation" >&2; exit 254; }; cat ${f}; echo; exit 0; fi
printf '%s' "$v" > ${f}; echo x >> ${puts}
`,{mode:0o755});
  const cle=(args,entree,mode)=>spawnSync('bash',['cle.sh',...args],{input:entree||'',encoding:'utf8',
    env:Object.assign({},process.env,{PATH:bin+':'+process.env.PATH,AWS_MODE:mode||''})});
  const table=()=>JSON.parse(fs.readFileSync(f,'utf8'));
  const nput=()=>fs.existsSync(puts)?fs.readFileSync(puts,'utf8').split('\n').filter(Boolean).length:0;
  let r=cle(['nouvelle','gabriel']);
  ok(r.status===0,'nouvelle : '+r.stderr);
  const m=r.stdout.match(/cle\s+: ([0-9A-HJKMNP-TV-Z]{5})-([0-9A-HJKMNP-TV-Z]{5})-([0-9A-HJKMNP-TV-Z]{5})-([0-9A-HJKMNP-TV-Z]{5})\n/);
  ok(m,'cle affichee en 4 groupes de 5 : '+r.stdout);
  const C1=m.slice(1).join('');
  ok(r.stdout.includes('empreinte   : '+sha(C1)),'empreinte affichee = SHA-256 de la forme canonique');
  ok(JSON.stringify(table())===JSON.stringify({[sha(C1)]:'gabriel'}),'table creee avec une entree');
  ok(!fs.readFileSync(f,'utf8').includes(C1),'la cle ne doit pas etre dans la table');
  // bout en bout : la cle du script ouvre l API
  SSM.val=fs.readFileSync(f,'utf8'); maintenant+=300000;
  ok((await appel('GET',C1)).statusCode===404,'cle du script refusee par la Lambda');
  ok(cle(['nouvelle','frere']).status===0&&Object.keys(table()).length===2,'deuxieme utilisateur');
  const t0=fs.readFileSync(f,'utf8');
  r=cle(['nouvelle','gabriel'],'n\n');
  ok(r.status!==0&&fs.readFileSync(f,'utf8')===t0,'remplacement refuse : table inchangee');
  r=cle(['nouvelle','gabriel'],'o\n'); ok(r.status===0,'remplacement');
  const C2=r.stdout.match(/cle\s+: (\S+)\n/)[1].replace(/-/g,'');
  const t=table(); ok(C2!==C1&&t[sha(C2)]==='gabriel'&&!t[sha(C1)]&&Object.values(t).includes('frere'),'remplacement : ancienne cle retiree, frere conserve');
  SSM.val=JSON.stringify(t); maintenant+=300000;
  ok((await appel('GET',C1)).statusCode===401&&(await appel('GET',C2)).statusCode===404,'Lambda : ancienne cle refusee, nouvelle servie');
  r=cle(['liste']); ok(r.status===0&&r.stdout==='frere\ngabriel\n','liste : identifiants tries, sans empreinte');
  ok(cle(['retirer','frere'],'o\n').status===0&&!Object.values(table()).includes('frere'),'retirer');
  ok(cle(['retirer','frere'],'o\n').status!==0,'retirer un absent : echec');
  const p=nput(), t1=fs.readFileSync(f,'utf8');
  r=cle(['nouvelle','ami'],'',"refus");
  ok(r.status!==0&&nput()===p&&fs.readFileSync(f,'utf8')===t1,'table illisible : arret sans ecriture');
  for(const id of ['Gab','a b','../x','x'.repeat(33),''])
    ok(cle(['nouvelle',id]).status===2,'identifiant invalide accepte : '+id);
  ok(cle([]).status===2&&cle(['liste','x']).status===2,'usage');
  // 800 caracteres : un caractere absent a une chance sur trois milliards
  // si le tirage est uniforme, et une certitude si l alphabet est tronque
  const vus=new Set(), car=new Set();
  for(let i=0;i<40;i++){ const x=cle(['nouvelle','t'+i]).stdout.match(/cle\s+: (\S+)/)[1]; ok(!vus.has(x),'cle repetee'); vus.add(x); for(const c of x.replace(/-/g,'')) car.add(c); }
  ok(car.size===32,'alphabet incomplet sur 40 cles : '+car.size);
  const plein={}; for(let i=0;i<60;i++) plein[crypto.randomBytes(32).toString('hex')]='u'+i;
  fs.writeFileSync(f,JSON.stringify(plein)); const q=nput();
  ok(cle(['nouvelle','ami']).status===1&&nput()===q,'table au-dela de 4 Ko : refus sans ecriture');
  fs.rmSync(bin,{recursive:true,force:true});
  console.log('T10 OK : cle.sh, format, empreinte commune avec la Lambda, remplacement, retrait, arret sur table illisible');
}
fs.rmSync(tmp,{recursive:true,force:true});
Date.now=now0;
console.log('TESTS API OK');
}catch(e){ console.log=log0; console.error(e.message); process.exit(1); }
})();
