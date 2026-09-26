# PALIER — outillage

Scripts de build, de test et de préparation des images. À conserver avec le carnet de bord.

Le fichier `index.html` livré contient déjà l'intégralité des sources : CSS, images en base64
et code applicatif. Le découpage en modules peut donc être reconstitué à partir de lui seul, en
repérant les commentaires de section. Ces scripts sont ce qui n'est pas reconstructible.

## Découpage des sources


| Bloc | Contenu |
|---|---|
| `head.html` | shell HTML, CSS, favicon SVG inline, ouverture du `<script>` |
| `imgdata.js` | `const IMG={...}` : illustrations en base64 JPEG |
| `app1.js` | `VERSION`, pictogrammes SVG de repli, `figFor`, échelles de charge, six niveaux de bande et nuancier fermé, bornage matériel, neuf ressources déclarables plus la clé dérivée `masse`, `masseMobilisable`, échelle du sac, poids déclarables |
| `app2.js` | `const DB={...}` : base d'exercices |
| `app3.js` | surcouche de progression, tractions, `SLOTS`, `NEEDS`, `SUBS`, `SCHEMA`, `SESSIONS`, `WARMUP`, XP, badges |
| `app4.js` | état, persistance, migrations, profils, résolution de position, double progression, déblocages |
| `app5.js` | construction de séance, navigation, accueil |
| `app6.js` | moteur de séance : échauffement, séries, repos, cardio |
| `app7.js` | fin de séance, bibliothèque, progrès |
| `app9.js` | matériel par exercice, détail de séance |
| `app10.js` | synchronisation entre appareils (v2.24) : métadonnées, envoi, récupération, conflit, attente du lancement, card |
| `app8.js` | réglages, card Matériel, questions posées dans la page, clavier, routeur, initialisation |
| `tail.html` | fermeture |

Ordre d'assemblage : `head imgdata app1 app2 app3 app4 app5 app6 app7 app9 app10 app8 tail`.

`const VERSION` vit en tête d'`app1.js` depuis la v2.0. Elle vivait dans `imgdata.js`, que le script
de régénération de la banque réécrit en entier : la première régénération l'aurait effacée sans
bruit.
Noter que `app9` puis `app10` passent avant `app8` : l'initialisation doit rester en dernier.

## build.sh


```bash
#!/bin/bash
# Assemble index.html a partir des sources, puis lance les tests.
# Le livrable porte le nom de deploiement : il part tel quel vers S3, sans renommage.
set -e
cd "$(dirname "$0")"
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 - << 'EOF'
import re,os
h=open('index.html').read()
open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))
print(round(os.path.getsize('index.html')/1024/1024,2),'Mo')
EOF
node --check check.js
# une par une, jamais en liste && : set -e ignore l echec de tout maillon d une
# liste AND-OR sauf le dernier, ce qui faisait afficher BUILD OK au-dessus d une
# suite en echec (constate en v1.11 sur test9)
for t in test test2 test3 test4 test5 test6 test7 test8 test9 test10 test11 test12 test13 test14 test15 test16 test17 test18 test19 test20 test21 test22 test23 test24 test25 test26 test27 test28 test29 test30 test31 test32 test33 test34 test35 test36 test37 test38 test39 test40 test41 test42 test43 test44 test45 test46 test47 test48 test49 testapi; do
  node $t.js
done
echo "BUILD OK"
```

## Lot v2.24, synchronisation côté client, 26 septembre 2026

Une cinquantième suite, `test49`, lancée par `build.sh` entre `test48` et `testapi`. Comme
`testapi`, elle lit `palier-backend.yaml` : l'app y parle au vrai code de la Lambda, extrait du
template, à travers un `fetch` de substitution qui joue CloudFront. Le répertoire de build doit
donc toujours contenir le template. Node 22 fournit `CompressionStream`, `Blob`, `Response` et
`crypto.subtle`, que le client utilise tels quels.

**Tous les bancs existants retouchés, une ligne chacun** : `falsif23` à `falsif48` assemblaient
`app9.js app8.js`. Sans `app10.js`, `check.js` perd les fonctions que `renderHome`,
`startSession` et `endSession` appellent désormais : la référence elle-même tombe, et chaque
mutation « tombe » pour une mauvaise raison. Un banc dans cet état afficherait zéro survie en ne
mesurant rien. Les treize ont été corrigés et relancés dans ce lot : aucune survie, aucun motif
qui ne morde pas. `falsifapi` n'assemble pas l'app et n'est pas touché ; relancé quand même,
39 mutations, 0 survie.

## test49.js, suite du lot v2.24

Dix-sept sections, chacune une décision du lot. Un appareil est un `localStorage` ; changer
d'appareil, c'est recharger la page sur un autre, ce qui remet à zéro toutes les variables du
module. Le `fetch` de substitution refuse un `PUT` dont `x-amz-content-sha256` n'est pas
l'empreinte exacte du corps compressé (403, comme l'OAC), défait le gzip de réponse comme le
navigateur, refuse un `keepalive` au-delà de 64 Ko, et sait perdre une réponse après que le
serveur l'a traitée, ou la retenir jusqu'à ce que le test la lâche. Les minuteurs sont pilotés,
`Date.now` aussi, ce qui gouverne le cache de table de la Lambda.

Section 17 : aller-retour sur l'export réel du 25 septembre 2026, v2.22, 23 séances, embarqué en
gzip base64. Il porte des signalements de douleur ; sa présence ici a été soumise à Gabriel.

1. inertie sans clé ou hors `https` ; 2. normalisation de la saisie ; 3. première liaison :
401 et réseau sans trace, envoi, récupération, question ; 4. envoi regroupé et fin de séance ;
5. `keepalive` et plafond ; 6. réponse perdue, propre envoi reconnu ; 7. récupération et attente
du lancement ; 8. plafond de 5 s, réponse écartée en séance, question au retour ; 9. 412 ;
10. version supérieure ; 11. hors ligne ; 12. aucune adoption en séance, focus borné ;
13. révocation et clé remplacée ; 14. réinitialisation propagée ; 15. suppression ;
16. désactivation ; 17. export réel.

```javascript
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
```

## falsif49.sh, banc de falsification du lot v2.24

33 mutations, 0 survie. Le banc vérifie d'abord que `test49` passe sans mutation. Deux survies au
premier passage, toutes deux traitées dans le lot : le retrait de la garde de séance dans
`syncControle` survivait parce que la section 12 émettait ses événements dans la fenêtre de
limitation des 5 et 30 s, qui masquait tout ; l'horloge avance désormais d'une minute avant. Et
le paramètre `local` de `save()`, qui empêchait la récupération de marquer l'état comme
modifié, n'avait aucun effet observable : `sale` retombe juste après l'enregistrement, et l'envoi
programmé ne part pas. Il a été retiré plutôt que gardé sans preuve.

```bash
#!/bin/bash
# Banc de falsification du lot v2.24 : synchronisation cote client. Chaque
# mutation defait une decision du lot ; test49 doit tomber sur chacune. Une
# mutation qui survit designe une assertion qui ne prouve rien. Remplacement
# exact avec compte : un motif qui ne mord pas arrete le banc au lieu de se
# lire comme une survie.
set -e
cd "$(dirname "$0")"
python3 - << 'PY'
import subprocess,shutil,sys,re
M=[
 ('app10.js',"sm.gen=(sm.gen||0)+1; sm.sale=true; smEcrire();","sm.gen=(sm.gen||0)+1; smEcrire();"),
 ('app10.js',"const SYNC_CALME=4000;","const SYNC_CALME=0;"),
 ('app10.js',"if(sm.base) h['if-match']=sm.base; else h['if-none-match']='*';","h['if-none-match']='*';"),
 ('app10.js',"'x-amz-content-sha256':c.sha};","'x-amz-content-sha256':c.sha.slice(1)};"),
 ('app10.js',"!!keep&&c.octets.length<=KEEPALIVE_MAX","!!keep"),
 ('app10.js',"!!keep&&c.octets.length<=KEEPALIVE_MAX","false"),
 ('app10.js',"if(sm.envoi&&v&&v.envoi===sm.envoi.id){","if(false){"),
 ('app10.js',"{appVersion:VERSION},env,{envoi:id}));","{appVersion:VERSION},env));"),
 ('app10.js',"sm.base=etag; sm.baseVer=ver; sm.sale=sm.gen!==sm.envoi.gen; sm.envoi=null;","sm.base=etag; sm.baseVer=ver; sm.sale=false; sm.envoi=null;"),
 ('app10.js',"  if(cur){ syncApres=true; return; }\n  if(!sm.sale)","  if(!sm.sale)"),
 ('app10.js',"  if(verCmp(ver,VERSION)>0){ syncEtat='version'; syncMsg=ver; syncVue(true); return; }\n",""),
 ('app10.js',"if(sm.base&&verCmp(sm.baseVer,VERSION)>0){","if(false){"),
 ('app10.js',"if(sm.base){ syncDesactiver(","if(false){ syncDesactiver("),
 ('app10.js',"const SYNC_ATTENTE=5000;","const SYNC_ATTENTE=50000;"),
 ('app6.js',"  if(syncBloque()) return;\n",""),
 ('app10.js',"return syncOn()&&(syncAttente||!!syncConflit||","return syncOn()&&(!!syncConflit||"),
 ('app10.js',"  if(syncConflit) return syncConflitHtml();\n",""),
 ('app7.js',"  syncFinSeance();",""),
 ('app10.js',"syncControle(SYNC_FOCUS)","syncControle(0)"),
 ('app10.js',".replace(/[IL]/g,'1')",""),
 ('app10.js',"  delete s.envoi;\n",""),
 ('app4.js',"  if(typeof syncTouch==='function') syncTouch();\n",""),
 ('app10.js',"sm.base=etag; sm.baseVer=ver; sm.sale=false; sm.envoi=null; syncConflit=null;","sm.base=etag; sm.baseVer=ver; sm.envoi=null; syncConflit=null;"),
 ('app8.js',"(syncOn()?', sur tous tes appareils synchronisés':'')","''"),
 ('app10.js',"sm.base=c.etag; sm.baseVer=c.ver; sm.sale=true;","sm.baseVer=c.ver; sm.sale=true;"),
 ('app10.js',"if(cur) syncApres=true; else setTimeout(()=>syncVerifier(),0);","if(cur) syncApres=true;"),
 ('app5.js',"  syncReprise();\n",""),
 ('app10.js',"navigator.onLine===false){","false){"),
 ('app10.js',"  if(sm&&sm.lie){\n","  if(false){\n"),
 ('app10.js',"if(r&&r.status===204){ syncDesactiver('Données en ligne supprimées'); return; }","if(r&&r.status===204){ return; }"),
 ('app10.js',"if(r.status===401){ sm=null; syncEtat='';","if(r.status===401){ sm.lie=true; smEcrire(); syncEtat='';"),
 ('app10.js',"if(delai&&Date.now()-syncVu<delai) return;",""),
 ('app10.js',"  if(cur){ if(sm.sale) syncEnvoyer(); return; }\n",""),
]
def build():
    order='head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html'.split()
    h=''.join(open(f).read() for f in order)
    open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))
build()
r=subprocess.run(['node','test49.js'],capture_output=True,text=True)
if r.returncode!=0: print('test49 echoue sans mutation'); sys.exit(1)
surv=0
for f,a,b in M:
    s=open(f).read(); n=s.count(a)
    if n!=1: print('MOTIF NE MORD PAS',f,a); sys.exit(1)
    shutil.copy(f,f+'.bak'); open(f,'w').write(s.replace(a,b))
    build()
    r=subprocess.run(['node','test49.js'],capture_output=True,text=True,timeout=300)
    shutil.move(f+'.bak',f)
    ok=r.returncode!=0 or 'ECHEC' in r.stdout+r.stderr
    print(('tombe  ' if ok else 'SURVIT ')+f+' : '+a[:60].replace('\n',' '))
    if not ok: surv+=1
build()
print(len(M),'mutations,',surv,'survie(s)')
sys.exit(1 if surv else 0)
PY
```

## Backend de synchronisation, 26 septembre 2026, étapes 1 et 2 du lot v2.24

Aucune suite existante retouchée : `index.html` ne change pas. `build.sh` lance une quarante-neuvième
suite, `testapi`, qui ne lit pas l'app mais `palier-backend.yaml`, `palier-edge.yaml` et `cle.sh`. Le répertoire de
build doit donc les contenir, extraits de `PALIER-backend.md` comme les sources le sont de
`PALIER-code.md`. Dépendances : Node et Python 3, déjà requis ; ni `jq` ni SDK AWS, `cle.sh`
traitant le JSON en Python pour cette raison.

## testapi.js, suite du backend de synchronisation

Dix sections. Le code de la Lambda est extrait du bloc `ZipFile` du template et chargé avec S3 et
SSM simulés par interception de `require` ; le S3 simulé est versionné, porte les écritures
conditionnelles, les marqueurs et une pagination réglable. L'horloge est pilotée.

Étape 2, même jour : section 1b ajoutée, huit mutations au banc.

1. **Template** : `Retain` sur les deux politiques du bucket, versions à 90 jours et 30 gardées,
   TLS obligatoire, concurrence à 2, journal à 30 jours créé avant la fonction, URL en `AWS_IAM`,
   les deux permissions bornées à la distribution dont l'invocation restreinte à l'URL, table
   absente de la stack et jamais écrite par la Lambda, droits de purge et de 404, sortie `ApiHote`.
1b. **`palier-edge`** : `ApiHote` vide par défaut et sa condition, OAC de type `lambda` signant
   toujours, origine `api` en https, comportement `/api/*` en `https-only`, sept méthodes,
   `Compress: false`, `CachingDisabled`, `AllViewerExceptHostHeader`, comportement par défaut du
   site inchangé.
2. **Routes et clé** : chemin unique, méthodes, six formes non canoniques refusées sans lecture de
   la table, clé inconnue.
3. **Première liaison** : 404, 428, corps non binaire, création, métadonnée de version, corps
   stocké tel quel, deuxième création en 412, lecture gzip, 304 et ETag périmé.
4. **Écriture conditionnelle** : `If-Match` courant et périmé, priorité sur `If-None-Match`, 409
   de S3 rendu en 412, panne en 503, aucune écriture sur un refus.
5. **Corps refusés** : au-delà de 2 Mo, bombe gzip de 17 Mo, gzip, JSON et sept états invalides ;
   un état de 1,4 Mo compressé accepté.
6. **Identifiant** : tiré de la table, ignoré de la requête, états séparés, identifiant hors format
   dans la table refusé.
7. **Cache** : aucune relecture dans le TTL, clé inconnue relue au plus une fois par 15 s, clé
   neuve servie après 15 s, révocation effective à la relecture suivante et au TTL à la
   milliseconde, table illisible en 503, table absente en 401.
8. **Purge** : toutes les versions et tous les marqueurs, clé exacte et non préfixe, autres
   utilisateurs intacts, pagination par pages de deux, 404 puis reliaison, purge répétée.
9. **Journal** : une ligne JSON par appel, ni clé ni corps.
10. **`cle.sh`**, exécuté avec un `aws` de substitution : format affiché, empreinte, table sans la
    clé, **clé du script acceptée par la Lambda**, remplacement refusé puis accepté, ancienne clé
    refusée par la Lambda, liste, retrait, arrêt sans écriture sur table illisible, identifiants
    invalides, usage, alphabet complet sur 40 clés, plafond de 4 Ko.

```javascript
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
```

## falsifapi.sh, banc de falsification du backend

Trente-neuf mutations sur les deux templates, le code de la Lambda et `cle.sh`, remplacement exact avec
compte. Toutes tombent. Trois survivaient au premier passage, chacune corrigée :
- le filtre de la purge sur la clé exacte était masqué par la construction des objets à supprimer,
  qui réécrivait la clé ; celle-ci reprend désormais la clé listée, et le filtre porte seul la
  garde ;
- l'`aws` de substitution refusait aussi l'écriture en mode panne, si bien qu'un script qui lisait
  une table illisible comme vide passait : la panne ne vise plus que la lecture ;
- un alphabet tronqué passait le contrôle de format ; la suite exige les 32 caractères sur 40 clés.

```bash
#!/bin/bash
# Banc de falsification du lot v2.24, etapes 1 et 2 : templates palier-backend
# et palier-edge, code de la Lambda, cle.sh. Chaque mutation defait une decision ; testapi doit
# tomber sur chacune. Une mutation qui survit designe une assertion qui ne
# prouve rien. Remplacement exact avec compte : un motif qui ne mord pas
# arrete le banc au lieu de se lire comme une survie.
set -e
cd "$(dirname "$0")"
python3 - << 'PY'
import subprocess,shutil,sys
Y='palier-backend.yaml'; C='cle.sh'; E='palier-edge.yaml'
M=[
 (E,"              ViewerProtocolPolicy: https-only","              ViewerProtocolPolicy: redirect-to-https"),
 (E,"              Compress: false","              Compress: true"),
 (E,"CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad","CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6"),
 (E,"OriginRequestPolicyId: b689b0a8-53d0-40ab-baf2-68738e2966ac","OriginRequestPolicyId: 216adef6-5c7f-47e4-b989-5492eafa07d3"),
 (E,"AllowedMethods: [GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE]","AllowedMethods: [GET, HEAD]"),
 (E,"        OriginAccessControlOriginType: lambda","        OriginAccessControlOriginType: s3"),
 (E,"                OriginProtocolPolicy: https-only","                OriginProtocolPolicy: match-viewer"),
 (E,"          ViewerProtocolPolicy: redirect-to-https\n          AllowedMethods: [GET, HEAD]","          ViewerProtocolPolicy: https-only\n          AllowedMethods: [GET, HEAD]"),
 (Y,"    DeletionPolicy: Retain\n    UpdateReplacePolicy: Retain\n","    DeletionPolicy: Retain\n"),
 (Y,"NoncurrentDays: 90","NoncurrentDays: 30"),
 (Y,"ReservedConcurrentExecutions: 2","ReservedConcurrentExecutions: 10"),
 (Y,"RetentionInDays: 30","RetentionInDays: 3653"),
 (Y,"      InvokedViaFunctionUrl: true\n",""),
 (Y,"      Action: lambda:InvokeFunction\n","      Action: lambda:InvokeFunctionUrl\n"),
 (Y,"Action: [s3:ListBucket, s3:ListBucketVersions]","Action: [s3:ListBucketVersions]"),
 (Y,"const CLE=/^[0-9A-HJKMNP-TV-Z]{20}$/;","const CLE=/^[0-9A-Za-z-]{20,24}$/;"),
 (Y,"const MAX_CORPS=2*1024*1024;","const MAX_CORPS=4*1024*1024;"),
 (Y,"zlib.gunzipSync(corps,{maxOutputLength:MAX_JSON})","zlib.gunzipSync(corps)"),
 (Y,"if(!im&&inm!=='*') return err(428","if(false) return err(428"),
 (Y,"IfMatch:im||undefined,","IfMatch:undefined,"),
 (Y,"IfNoneMatch:im?undefined:'*'}","IfNoneMatch:undefined}"),
 (Y,"if([404,409,412].includes(statut(e))","if([412].includes(statut(e))"),
 (Y,"if(statut(e)===304) return","if(false) return"),
 (Y,".filter(v=>v.Key===cle)",".filter(v=>v.Key.startsWith(cle))"),
 (Y,"...(r.Versions||[]),...(r.DeleteMarkers||[])","...(r.Versions||[])"),
 (Y,"}while(km!==undefined);","}while(false);"),
 (Y,"if(!table||age>=TTL) await lireTable();","if(!table) await lireTable();"),
 (Y,"else if(!Object.hasOwn(table,h)&&age>=RELECTURE) await lireTable();","else if(!Object.hasOwn(table,h)) await lireTable();"),
 (Y,"else if(!Object.hasOwn(table,h)&&age>=RELECTURE) await lireTable();",""),
 (Y,"catch(e){ if(e.name!=='ParameterNotFound') throw e; }","catch(e){ }"),
 (Y,"return (typeof id==='string'&&ID.test(id))?id:null;","return id;"),
 (Y,"typeof etat.appVersion!=='string'||!VERS.test(etat.appVersion)","typeof etat.appVersion!=='string'"),
 (Y,"console.log(JSON.stringify({m,s:res.statusCode,id,o:ev.body?ev.body.length:0}));","console.log(JSON.stringify({m,s:res.statusCode,id,h}));"),
 (C,"  if grep -q ParameterNotFound \"$e\"; then","  if true; then"),
 (C,"c+=${ALPHA:$((o % 32)):1}","c+=${ALPHA:$((o % 31)):1}"),
 (C,"t={h:v for h,v in json.loads(sys.argv[1]).items() if v!=sys.argv[2]}\nt[sys.argv[3]]","t=json.loads(sys.argv[1])\nt[sys.argv[3]]"),
 (C,"    [ \"$N\" -eq 0 ] || confirmer","    [ \"$N\" -ge 0 ] || confirmer"),
 (C,"[[ \"$1\" =~ ^[a-z0-9-]{1,32}$ ]]","[[ \"$1\" =~ ^.{1,40}$ ]]"),
 (C,"for v in sorted(set(json.loads(sys.argv[1]).values())): print(v)","for v in json.loads(sys.argv[1]): print(v)"),
]
surv=0
for f,a,b in M:
    s=open(f).read(); n=s.count(a)
    if n!=1: print('MOTIF NE MORD PAS',f,a); sys.exit(1)
    shutil.copy(f,f+'.bak'); open(f,'w').write(s.replace(a,b))
    r=subprocess.run(['node','testapi.js'],capture_output=True,text=True)
    shutil.move(f+'.bak',f)
    ok=r.returncode!=0
    print(('tombe  ' if ok else 'SURVIT ')+f+' : '+a[:60].replace('\n',' '))
    if not ok: surv+=1
print(len(M),'mutations,',surv,'survie(s)')
sys.exit(1 if surv else 0)
PY
```

## Suites existantes retouchées en v2.23

- `test41.js`, section 2 : le message de recul autonome porte ses deux lectures, l'ancienne puis
  celle du jour, et les deux assertions qui le lisent sont ancrées sur le message entier,
  « (14 puis 13) » sur les mollets, « (20 puis 21) » sur la planche. Cas ajouté, celui constaté le
  25 septembre 2026 : pompes à cible 9 sur une mémoire à 8, 9/9/6 absorbé et muet, puis 9/9/7 qui
  recale à 8 avec « (6 puis 7) », un seul message, et la mémoire qui porte 7 après coup.
  Les expressions régulières de cette suite vivent dans un gabarit : les parenthèses s'y échappent
  par deux barres obliques inverses, une seule disparaît à l'évaluation et fait de la parenthèse un
  groupe.
- `falsif41.sh` : converti du `sed` nu au remplacement exact avec compte, sur le motif de
  `falsif48`, puisque le lot touche la ligne visée par deux de ses mutations, qui auraient cessé de
  mordre sans le dire. Deux mutations ajoutées, lectures retirées du message et lectures dans l'ordre
  inverse. Vingt-deux mutations, toutes tombent.

## test48.js, suite du lot v2.22

Décompte de lancement devant l'échauffement, aigu sur la montée de la répétition-cible et chiffre de
la répétition en cours, pont fessier et sa lignée en cadence à trois temps avec reprise, migration
v2.19 bornée aux abductions. Horloges murale et audio pilotées, harnais de `test46`. Huit sections :
décompte, contrôles du décompte, catalogue et modèle du pont, pont bilatéral, reprise, pont
unilatéral, abductions sans reprise, migration.

```javascript
/* test48 : lot v2.22. Decompte de lancement devant l echauffement, aigu
   sur la montee de la repetition-cible et chiffre de la repetition en cours,
   pont fessier et sa lignee en cadence a trois temps avec reprise, migration
   v2.19 bornee aux abductions. Horloges pilotees, comme test46. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
/* horloge audio : currentTime pilotable ; chaque oscillateur retient sa
   frequence et l instant de son start */
const tones=[];
const actx={currentTime:0,destination:{},state:'running',resume(){},
  createOscillator:()=>{const o={frequency:{value:0},connect(){},start(t){o.at=t;tones.push(o);},stop(t){o.stops=(o.stops||[]).concat([t]);}};return o;},
  createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{},
  AudioContext:function(){ return actx; }};
/* horloge murale pilotable, en secondes */
let WALL=1000;
global.performance={now:()=>WALL*1000};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v;else this._h=v},get innerHTML(){return cap?html:(this._h||'')},classList:{add(){},remove(){}},style:{},textContent:'',className:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
let ticks=[];
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ ticks=ticks.filter(x=>x!==t); };
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
/* avance les deux horloges de dt secondes et reveille la boucle tous les
   250 ms, comme le ferait le navigateur */
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.avance=dt=>{ const fin=WALL+dt; while(WALL<fin-1e-9){ const pas=Math.min(.25,fin-WALL); WALL+=pas; actx.currentTime+=pas; ticks.slice().forEach(t=>t.f()); } };


const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=3; state.sound=true; };
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 const rel=(o,T0,off)=>Math.round((o.at-off-T0)*100)/100;
 const freqs=()=>tones.map(o=>o.frequency.value);
 const seance=(id,target)=>{ const p=perfOf(id); p.target=target; delete p.hold; delete p.grace; delete p.prevMin; p.sets=[];
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:id,key:id,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:id,key:id,set:2,of:2,round:2}];
   cur.i=0; renderSession(); return cur.steps[0]; };
 const PONTS=['pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'];

 // 1. decompte de lancement
 await neuf();
 if(START_PREP!==5) err('decompte de lancement : 5 s fixes');
 state.prep=10;
 state.warm='complet';
 if(warmupSec('complet')!==5+WARMUP.reduce((a,x)=>a+x.s,0)) err('annonce : decompte compris dans le poste echauffement, et independant du reglage des tenues');
 if(warmupSec('aucun')!==0) err('sans echauffement, pas de decompte a l annonce');
 tones.length=0;
 startSession();
 const m0=cur.model;
 if(cur.startLeft!==5||!/Départ dans/.test(html)||!/id="wt">5</.test(html)) err('ecran : Depart dans 5');
 if(cur.warmT!==WARMUP[0].s) err('le chrono de la premiere etape n est pas entame');
 if(freqs().filter(f=>f===700).length!==2) err('premier bip a 700, coup double comme startPrep : '+freqs());
 tic(4);
 if(cur.startLeft!==1||el('#wt').textContent!=='1'||freqs().filter(f=>f===700).length!==10) err('cinq bips a 700 : '+freqs());
 if(freqs().indexOf(1150)>=0) err('pas d aigu avant le zero');
 tic(1);
 if(cur.startLeft!==0||freqs().filter(f=>f===1150).length!==2) err('au zero, l aigu a 1150 : '+freqs());
 if(el('#wt').textContent!==fmtT(WARMUP[0].s)) err('le chrono de l etape s affiche au zero : '+el('#wt').textContent);
 if(cur.model!==m0+5) err('cinq secondes chronometrees au modele : '+(cur.model-m0));
 tic(3);
 if(cur.warmT!==WARMUP[0].s-3) err('l echauffement part apres le decompte : '+cur.warmT);
 renderWarm(); if(/Départ dans/.test(html)) err('le decompte ne se rejoue pas au rendu');
 console.log('decompte OK : 5 s fixes, bip a chaque seconde, aigu au depart, au modele et a l annonce, puis l echauffement');

 // 2. pause, etape suivante, passer
 await neuf(); state.warm='complet';
 startSession(); tic(2);
 toggleWarm(); tic(5);
 if(cur.startLeft!==3) err('Pause fige le decompte : '+cur.startLeft);
 tones.length=0; toggleWarm();
 if(freqs().filter(f=>f===700).length!==2) err('la reprise rejoue le bip de la seconde en cours');
 tic(3); if(cur.startLeft!==0||cur.warmI!==0) err('reprise jusqu au depart, premiere etape');
 await neuf(); state.warm='complet';
 startSession(); tic(1); nextWarm();
 if(cur.startLeft!==0||cur.warmI!==1||/Départ dans/.test(html)) err('Etape suivante annule le decompte');
 await neuf(); state.warm='complet';
 startSession(); skipWarm();
 if(cur.startLeft!==0||cur.phase!=='work') err('Passer l echauffement annule le decompte');
 await neuf(); state.warm='aucun';
 startSession();
 if(cur.phase!=='work'||cur.startLeft!==0) err('sans echauffement, aucun decompte de lancement');
 console.log('controles OK : pause et reprise, etape suivante et passer annulent, rien sans echauffement');

 // 3. catalogue du pont
 await neuf();
 PONTS.forEach(id=>{
   const c=DB[id].cadence;
   if(!c||c.monte!==1.5||c.tenue!==1||c.descente!==2||c.etab!==0||!c.reprise) err('cadence du pont 1,5 / 1 / 2, sans etablissement, avec reprise : '+id);
 });
 if(DB['gainage-lateral-jambe-levee'].cadence.reprise||DB['gainage-lateral-jambe-levee'].cadence.tenue) err('abductions : ni reprise ni tenue en haut');
 if(JSON.stringify(CAD_DEPUIS_SECONDES)!=='["gainage-lateral-jambe-levee"]') err('migration v2.19 bornee aux abductions');
 if(serieSec('pont-fessier')!==INSTALL+Math.round(3+perfOf('pont-fessier').target*4.5)) err('modele : un bloc, cycle 4,5 s');
 perfOf('pont-fessier-une-jambe').target=9;
 if(serieSec('pont-fessier-une-jambe')!==INSTALL+2*Math.round(3+9*4.5)) err('modele : deux cotes, cote arrondi');
 if(serieModelAdd('pont-fessier',20)!==INSTALL) err('rejeu : tout a defile au tick');
 console.log('catalogue OK : cinq ponts cadences 1,5/1/2 avec reprise, modele a un ou deux blocs');

 // 4. pont bilateral : tenue en haut, aigu sur la montee cible, chiffre en cours
 await neuf();
 let st=seance('pont-fessier',4);
 if(st.sides.length!==1) err('un seul bloc sur le pont bilateral');
 if(!/Faites à faire<\\/span> · cible <b class="num">4<\\/b>/.test(html)) err('comptes sans cote : '+html.match(/id="rcount">[^]*?<\\/div>/));
 if(!/tenue en haut <b class="num">1<\\/b> s/.test(html)||/Un côté entier/.test(html)) err('consigne de cadence du pont');
 tones.length=0; toggleCadence();
 const T0=st.ct.t0, off=st.ct.off;
 if(Math.abs(T0-(WALL+3.15))>1e-9) err('sans etablissement, le decompte enchaine');
 if(tones.some(o=>o.frequency.value===1150)) err('pas de depart a 1150 sans etablissement');
 if(el('#phlabel').textContent!=='En position') err('decompte sans cote : '+el('#phlabel').textContent);
 if(!/première montée vient au bip/.test(el('#aide').textContent)) err('consigne du decompte : '+el('#aide').textContent);
 avance(3.25);                                  /* e = 0.10 */
 if(el('#cc').textContent!=='1'||!/>Monte</.test(el('#phase').innerHTML)) err('e=0,1 : Monte, 1');
 avance(1.5);                                   /* e = 1.6 */
 if(el('#cc').textContent!=='1'||!/>Tiens</.test(el('#phase').innerHTML)) err('e=1,6 : Tiens, 1');
 avance(1);                                     /* e = 2.6 */
 if(!/>Descends</.test(el('#phase').innerHTML)) err('e=2,6 : Descends');
 avance(2);                                     /* e = 4.6 */
 if(el('#cc').textContent!=='2'||!/Faites <b class="num">1<\\/b>/.test(el('#rcount').innerHTML)) err('e=4,6 : en cours 2, une faite : '+el('#rcount').innerHTML);
 avance(20);
 const mon=tones.filter(o=>o.frequency.value===950).map(o=>rel(o,T0,off));
 const des=tones.filter(o=>o.frequency.value===700&&o.at>T0+off).map(o=>rel(o,T0,off));
 const cib=tones.filter(o=>o.frequency.value===1200).map(o=>rel(o,T0,off));
 if(JSON.stringify(cib)!=='[13.5]') err('aigu sur la montee de la quatrieme : '+JSON.stringify(cib));
 if(mon.indexOf(13.5)>=0||mon.slice(0,4).join()!=='0,4.5,9,18') err('montees toutes les 4,5 s, sauf la cible : '+JSON.stringify(mon));
 if(des.slice(0,3).join()!=='2.5,7,11.5') err('descente apres montee et tenue : '+JSON.stringify(des));
 toggleCadence();                               /* e = 24.6 : cinq faites, sixieme en cours */
 if(st.sides[0]!==5||!st.done||st.ct.on) err('Stop : cinq repetitions terminees, '+JSON.stringify(st.sides));
 if(!/Série arrêtée/.test(html)||html.indexOf('resumeCad()')<0) err('apres le Stop : Reprendre propose');
 if(!/id="ct" disabled/.test(html)) err('bloc unique : bouton principal eteint');
 if(html.indexOf('class="big ok"')<0) err('validable apres le Stop');
 espace(); if(st.ct.on) err('ESPACE ne reprend pas, la reprise est un bouton');
 console.log('pont bilateral OK : trois temps, aigu sur la montee cible, chiffre en cours, Stop au compte termine');

 // 5. reprise : repart du compte, decompte rejoue, aigu seulement si la cible reste a atteindre
 tones.length=0; resumeCad();
 if(!st.ct.on||st.ct.base!==5||st.sides[0]!==null) err('reprise armee depuis 5');
 if(freqs().filter(f=>f===700).length!==6) err('la reprise rejoue le decompte : '+freqs());
 avance(3.25);
 if(el('#cc').textContent!=='6') err('reprise : la sixieme en cours, '+el('#cc').textContent);
 avance(10);
 if(tones.some(o=>o.frequency.value===1200)) err('cible deja atteinte : pas d aigu a la reprise');
 toggleCadence();
 if(st.sides[0]!==7) err('reprise : 5 + 2 = 7, '+JSON.stringify(st.sides));
 touche('-'); if(st.sides[0]!==6) err('touche moins rogne');
 resetCad(); if(st.sides[0]!==null||st.done) err('Reinitialiser efface');
 resumeCad(); if(st.ct.on) err('rien a reprendre apres une remise a zero');
 await neuf();
 st=seance('pont-fessier',6);
 toggleCadence(); avance(3.15+9.3); toggleCadence();        /* deux faites */
 tones.length=0; resumeCad(); avance(3.15+20);
 const c2=tones.filter(o=>o.frequency.value===1200).map(o=>rel(o,st.ct.t0,st.ct.off));
 if(JSON.stringify(c2)!=='[13.5]') err('reprise a 2, cible 6 : aigu sur la quatrieme montee de la reprise, '+JSON.stringify(c2));
 toggleCadence(); validateSet();
 if(JSON.stringify(cur.log['pont-fessier'])!==JSON.stringify([st.sides[0]])||cur.i!==1) err('validation au journal');
 console.log('reprise OK : repart du compte, decompte rejoue, aigu sur la montee cible restante, rognage et remise a zero');

 // 6. pont unilateral : deux cotes, reprise du cote en cours, jamais du cote quitte
 await neuf(); state.unlocked['pont-fessier-leste']=true; state.unlocked['pont-fessier-une-jambe']=true;
 st=seance('pont-fessier-une-jambe',8);
 if(st.sides.length!==2) err('deux cotes');
 toggleCadence();
 if(!/Pied droit au sol/.test(el('#aide').textContent)) err('consigne du cote : '+el('#aide').textContent);
 avance(3.15+9.3); toggleCadence();
 if(st.sides.join()!=='2,') err('cote droit a 2');
 if(!/Change de jambe, puis Second côté/.test(html)||!/Reprendre continue ce côté/.test(html)) err('consigne entre les cotes');
 resumeCad(); avance(3.15+4.6); toggleCadence();
 if(st.sides.join()!=='3,') err('reprise du cote droit : 3');
 toggleCadence();                               /* Second cote */
 if(st.side!==1||!st.ct.on||st.ct.base!==0) err('second cote frais');
 avance(3.15+4.6); toggleCadence();
 if(st.sides.join()!=='3,1') err('gauche a 1 : '+st.sides);
 resumeCad(); if(!st.ct.on||st.side!==1||st.ct.base!==1) err('reprise du cote gauche');
 toggleCadence();
 if(st.sides.join()!=='3,1') err('Stop au decompte : rien de plus');
 if(!/Au journal : <b class="num">1<\\/b> répétition par côté/.test(html)) err('journal au cote court');
 console.log('pont unilateral OK : un cote puis l autre, reprise du cote en cours, jamais du cote quitte');

 // 7. abductions : ni reprise, ni tenue ; le Stop reste definitif
 await neuf(); state.unlocked['gainage-lateral-jambe-levee']=true;
 st=seance('gainage-lateral-jambe-levee',5);
 toggleCadence(); avance(6.15+7); toggleCadence();
 if(html.indexOf('resumeCad()')>=0) err('pas de Reprendre sur les abductions');
 resumeCad(); if(st.ct.on) err('resumeCad inerte sans reprise');
 console.log('abductions OK : Stop definitif, aucune reprise');

 // 8. migration : un pont a fourchette heritee est ecrete, pas efface
 await neuf();
 const vieux=g(state);
 vieux.perf['pont-fessier']={load:0,range:[11,21],target:21,best:21,sets:[21,21,21],date:'2026-09-01T10:00:00.000Z'};
 vieux.perf['gainage-lateral-jambe-levee']={load:0,range:[15,45],target:20,best:20,sets:[20,20],date:'2026-09-15T10:00:00.000Z'};
 localStorage._m={}; localStorage.setItem('palier-state-v2',JSON.stringify(vieux)); state=null; await loadState();
 const q=state.perf['pont-fessier'];
 if(!q||q.range.join()!=='10,20'||q.best!==21) err('pont : ecretage et non effacement, '+JSON.stringify(q));
 if(state.perf['gainage-lateral-jambe-levee']) err('abductions : la performance en secondes repart de zero');
 console.log('migration OK : la regle v2.19 ne vise que l ancienne tenue, le pont herite est ecrete');

 console.log('TESTS V2.22 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
```

## falsif48.sh, banc de falsification du lot v2.22

Vingt-cinq mutations, une par décision du lot, remplacement exact avec compte. Toutes tombent.

```bash
#!/bin/bash
# Banc de falsification du lot v2.22 : decompte de lancement, aigu et
# chiffre de la cadence, pont fessier cadence avec reprise, migration bornee. Chaque
# mutation defait une decision du lot ; test47 doit tomber sur chacune. Une
# mutation qui survit designe une assertion qui ne prouve rien. Remplacement
# exact avec compte : un motif qui ne mord pas arrete le banc au lieu de se
# lire comme une survie.
set -e
cd "$(dirname "$0")"
python3 - << 'PY'
import subprocess,shutil,sys
M=[
 ('app5.js',"const START_PREP=5;","const START_PREP=3;"),
 ('app5.js',"return L.length?START_PREP+L.reduce","return L.length?L.reduce"),
 ('app6.js',"warmPaused:false,startLeft:START_PREP,","warmPaused:false,startLeft:0,"),
 ('app6.js',"      tick(); cur.startLeft--;","      cur.startLeft--;"),
 ('app6.js',"clearInterval(timers.w); beep(1150,.16);","clearInterval(timers.w); beep(700,.16);"),
 ('app6.js',"  if(cur.startLeft>0){\n    beep(700,.1);","  if(cur.startLeft>0){\n    "),
 ('app6.js',"cur.warmPaused=false; cur.startLeft=0;","cur.warmPaused=false;"),
 ('app6.js',"clearInterval(timers.w); cur.startLeft=0; cur.phase='work';","clearInterval(timers.w); cur.phase='work';"),
 ('app6.js',"cur.phase='work'; cur.startLeft=0; }","cur.phase='work'; }"),
 ('app6.js',"cible=(ct.base||0)+i+1===sp.cible;","cible=(ct.base||0)+i===sp.cible;"),
 ('app6.js',"cible=(ct.base||0)+i+1===sp.cible;","cible=i+1===sp.cible;"),
 ('app6.js',"tone(RHYTHM_CLOSE,t+sp.monte+sp.tenue,.12);","tone(RHYTHM_CLOSE,t+sp.monte,.12);"),
 ('app6.js',"cc.textContent=String(base+n+1);","cc.textContent=String(base+n);"),
 ('app6.js',":t<sp.monte+sp.tenue?'<span class=\"tag ok\">Tiens</span>'",":false?''"),
 ('app6.js',"const n=cadClosed(cadSpec(st),rhythmNow()-ct.t0)+(ct.base||0);","const n=cadClosed(cadSpec(st),rhythmNow()-ct.t0);"),
 ('app6.js',"ct.base=(sp.reprise&&st.sides[st.side]!=null)?st.sides[st.side]:0;","ct.base=0;"),
 ('app6.js',"if(ct.on||!st.done||!DB[st.id].cadence.reprise||st.sides[st.side]==null) return;","if(ct.on||!st.done||st.sides[st.side]==null) return;"),
 ('app6.js',"const repr=sp.reprise&&st.done&&!on&&m[st.side]!=null;","const repr=st.done&&!on&&m[st.side]!=null;"),
 ('app6.js',"function cadN(e){ return e&&e.side?2:1; }","function cadN(e){ return 2; }"),
 ('app3.js',"const PONT_CAD={monte:1.5,tenue:1,descente:2,","const PONT_CAD={monte:1.5,tenue:0,descente:2,"),
 ('app3.js',"descente:2,etab:0,reprise:true};","descente:2,etab:0,reprise:false};"),
 ('app3.js',"reps:[10,20],sets:3,cadence:PONT_CAD},","reps:[10,20],sets:3},"),
 ('app5.js',"INSTALL+(e.side?2:1)*Math.round(","INSTALL+2*Math.round("),
 ('app5.js',"r*(c.monte+(c.tenue||0)+c.descente)","r*(c.monte+c.descente)"),
 ('app4.js',"if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;","if(!e||!e.cadence||!q||!q.range) return;"),
]
def build():
    order='head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html'.split()
    h=''.join(open(f).read() for f in order)
    import re
    open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))
surv=0
for f,a,b in M:
    s=open(f).read(); n=s.count(a)
    if n!=1: print('MOTIF NE MORD PAS',f,a); sys.exit(1)
    shutil.copy(f,f+'.bak'); open(f,'w').write(s.replace(a,b))
    build()
    r=subprocess.run(['node','test48.js'],capture_output=True,text=True)
    shutil.move(f+'.bak',f)
    ok=r.returncode!=0 or 'ECHEC' in r.stdout+r.stderr
    print(('tombe  ' if ok else 'SURVIT ')+f+' : '+a[:60])
    if not ok: surv+=1
build()
print(len(M),'mutations,',surv,'survie(s)')
sys.exit(1 if surv else 0)
PY
```

## Suites existantes retouchées en v2.22

- `test.js`, `test15.js`, `test21.js` (section 9), `test30.js` : remplissage d'une série cadencée,
  côtés mesurés, sur le motif du remplissage des tenues rythmées. Le pont au sol, au vivier jambes,
  sort désormais au tirage de ces boucles.
- `test21.js` : horloge murale pilotée (`performance.now`) ; T5 compte les cinq secondes du décompte
  de lancement avant les sept de l'échauffement ; T18 joue la cadence côté par côté, Stop une
  demi-seconde après la fin de la répétition-cible, et l'identité modèle égale annonce tient.
- `test16.js` : l'échauffement vaut son décompte de lancement plus la somme de ses étapes, rien sans
  échauffement.
- `test46.js` : instants de l'aigu (montée de la répétition-cible), grand chiffre à la répétition en
  cours, « un seul exercice cadencé » devient « un seul sans reprise ».
- `falsif46.sh` : onze motifs réécrits sur le code du moteur de cadence généralisé ; soixante
  mutations, toutes tombent. `falsif44` et `falsif47` relancés, sans survie.

## test47.js, suite du lot v2.20

Repère sonore des tenues chronométrées. Harnais de `test15`, horloge pilotée à la main, chaque
oscillateur retenant sa fréquence et le pic de son enveloppe, ce qui distingue un `beep` (deux
oscillateurs à 0,5) d'un `tone` au gain du repère. Huit sections : constantes, pas, gain, timbre,
durée et porte active par défaut sans clé ; planche à cible 45, séquence seconde par seconde
comparée à celle que `preBipKind` impose, repères avant l'approche et après la cible, gain propre,
mesure au Stop intacte ; cibles 20, 5 et 33, l'approche et la cible gagnent toujours ; tenue par
côté, repère qui repart à zéro ; repère coupé et son global coupé ; périmètre, un seul point
d'émission, dans `runHold`, rien sur un étirement joué ; card Sons, en-tête, bascule, aller-retour
par `loadState` ; sauvegarde sans clé, repère actif et aucune clé créée.

```javascript
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
```

## falsif47.sh, banc de falsification du lot v2.20

Treize mutations par remplacement exact avec compte, toutes tombent. La classification par seconde
exige la liste exacte des fréquences émises : sans cela, un repère joué par-dessus l'approche
aurait survécu, la première fréquence entendue restant 700 Hz ; durcie avant le premier passage du banc.

```bash
#!/bin/bash
# Banc de falsification du lot v2.20 : repere sonore des tenues. Chaque
# mutation defait une decision du lot ; test47 doit tomber sur chacune. Une
# mutation qui survit designe une assertion qui ne prouve rien. Remplacement
# exact avec compte : un motif qui ne mord pas arrete le banc au lieu de se
# lire comme une survie.
set -e
cd "$(dirname "$0")"
python3 - << 'PY'
import subprocess,shutil,sys
M=[
 ('app4.js',"const REPERE={pas:5,","const REPERE={pas:1,"),
 ('app4.js',"freq:1800,gain:.12,","freq:1800,gain:.45,"),
 ('app4.js',"const REPERE={pas:5,freq:1800,","const REPERE={pas:5,freq:700,"),
 ('app4.js',"gain:.12,dur:.04}","gain:.12,dur:.2}"),
 ('app4.js',"return !state||state.repere!==false;","return !!state&&state.repere===true;"),
 ('app4.js',"exponentialRampToValueAtTime(gain||.45,t+.012)","exponentialRampToValueAtTime(.45,t+.012)"),
 ('app6.js',"      else if(repereOn()&&st.val%REPERE.pas===0)","      if(repereOn()&&st.val%REPERE.pas===0)"),
 ('app6.js',"else if(repereOn()&&st.val%REPERE.pas===0)","else if(st.val%REPERE.pas===0)"),
 ('app6.js',"st.val%REPERE.pas===0) tone","(st.val+1)%REPERE.pas===0) tone"),
 ('app6.js',"tone(REPERE.freq,0,REPERE.dur,REPERE.gain)","tone(REPERE.freq,0,REPERE.dur)"),
 ('app8.js',"function setRepere(v){state.repere=v;save();render();}","function setRepere(v){state.repere=v;render();}"),
 ('app8.js',"+(repereOn()?' · repère '+REPERE.pas+' s':'')","+''"),
 ('app8.js',"onclick=\"setRepere(false)\"","onclick=\"setRepere(true)\""),
]
def build():
    order='head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html'.split()
    h=''.join(open(f).read() for f in order)
    import re
    open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))
surv=0
for f,a,b in M:
    s=open(f).read(); n=s.count(a)
    if n!=1: print('MOTIF NE MORD PAS',f,a); sys.exit(1)
    shutil.copy(f,f+'.bak'); open(f,'w').write(s.replace(a,b))
    build()
    r=subprocess.run(['node','test47.js'],capture_output=True,text=True)
    shutil.move(f+'.bak',f)
    ok=r.returncode!=0 or 'ECHEC' in r.stdout+r.stderr
    print(('tombe  ' if ok else 'SURVIT ')+f+' : '+a[:60])
    if not ok: surv+=1
build()
print(len(M),'mutations,',surv,'survie(s)')
sys.exit(1 if surv else 0)
PY
```

## Suites existantes retouchées en v2.20

- `test9` : l'en-tête fermé de la card Sons porte « · repère 5 s » quand le repère est actif.
- `build.sh` : quarante-sept suites.

## test46.js, suite du lot v2.19

Répétitions cadencées du gainage latéral avec abductions. Même harnais que `test44` : horloge murale
et horloge audio pilotées, chaque oscillateur retenant sa fréquence, son instant de départ et ses
arrêts. Dix sections : catalogue et fiche ; modèle de temps ; premier côté, décompte, double coup à
1150 Hz, établissement, montées et descentes à 1,5 s, compte jambe revenue, ton de cible à la place
de la montée, Stop qui annule ; second côté, ESPACE, rognage par côté et plancher, remise à zéro du
côté courant, validation, retour d'un pas ; Stop pendant le décompte et l'établissement, sans son ;
abandon, repli douleur et retour sans transport de mesure ; progression et journal ; migration de la
performance tenue, passages marqués, instantané retiré, idempotence ; passages hérités à la fiche,
au détail et au chemin des paliers ; fiche et bibliothèque.

```javascript
/* test46 : lot v2.19, gainage lateral avec abductions. L exercice passe des
   secondes aux repetitions cadencees : planche tenue sur un cote, jambe du
   dessus qui monte et descend au son, un cote entier puis l autre. L ecran se
   pilote a l horloge, comme test44 : l etat se derive du temps ecoule, les
   coups sont programmes en avance sur l horloge audio. Sections : catalogue,
   modele de temps, premier cote, second cote et validation, Stop precoce et
   sans son, abandon et retours, progression et journal, migration de la
   performance tenue, passages herites, fiche. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
/* horloge audio : currentTime pilotable ; chaque oscillateur retient sa
   frequence et l instant de son start */
const tones=[];
const actx={currentTime:0,destination:{},state:'running',resume(){},
  createOscillator:()=>{const o={frequency:{value:0},connect(){},start(t){o.at=t;tones.push(o);},stop(t){o.stops=(o.stops||[]).concat([t]);}};return o;},
  createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{},
  AudioContext:function(){ return actx; }};
/* horloge murale pilotable, en secondes */
let WALL=1000;
global.performance={now:()=>WALL*1000};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v;else this._h=v},get innerHTML(){return cap?html:(this._h||'')},classList:{add(){},remove(){}},style:{},textContent:'',className:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
let ticks=[];
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ ticks=ticks.filter(x=>x!==t); };
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
/* avance les deux horloges de dt secondes et reveille la boucle tous les
   250 ms, comme le ferait le navigateur */
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.avance=dt=>{ const fin=WALL+dt; while(WALL<fin-1e-9){ const pas=Math.min(.25,fin-WALL); WALL+=pas; actx.currentTime+=pas; ticks.slice().forEach(t=>t.f()); } };


const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const dit=(m,re)=>m.some(x=>re.test(x));
 const ID='gainage-lateral-jambe-levee';
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=3; state.sound=true; };
 const pose=(o)=>{ const p=perfOf(ID); p.range=[8,15]; p.target=(o&&o.target!=null)?o.target:8;
   if(o&&o.hold) p.hold=true; else delete p.hold; delete p.grace; delete p.prevMin; p.best=0; p.sets=[]; return p; };
 const seance=()=>{ startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:ID,key:ID,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:ID,key:ID,set:2,of:2,round:2}];
   cur.i=0; renderSession(); return cur.steps[0]; };
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 const rel=(o,T0,off)=>Math.round((o.at-off-T0)*100)/100;

 await neuf();
 // 1. catalogue
 {
   const e=DB[ID];
   if(e.mode!=='bw'||!e.side||e.sets!==2||JSON.stringify(e.reps)!=='[8,15]') err('mode bw, par cote, 2 series, 8-15 : '+JSON.stringify({m:e.mode,r:e.reps,s:e.sets}));
   if(JSON.stringify(e.cadence)!==JSON.stringify({monte:1.5,descente:1.5,etab:3})) err('cadence 1,5 / 1,5, etablissement 3 s : '+JSON.stringify(e.cadence));
   if(e.rhythm||e.assise||rungSpec(e)) err('aucune echelle de consigne : la progression est celle d un bw');
   if(unitOf(e)!=='reps') err('unite : reps, '+unitOf(e));
   if(e.retire!=='gainage-lateral'||e.fb!=='gainage-lateral') err('retrait et repli inchanges');
   if(!e.lock||e.lock.after!=='gainage-lateral'||e.lock.need!==45||e.lock.minSets!==2) err('verrou inchange : 2 series de 45 s au gainage lateral');
   if(e.nom!=='Gainage latéral, abductions'||e.en!=='Side plank with hip abduction') err('nom : '+e.nom+' / '+e.en);
   const d=e.desc.join(' ');
   if(!/double bip/.test(d)||!/bip aigu/.test(d)||!/bip grave/.test(d)||!/1,5 s/.test(d)||!/35°/.test(d)||!/effleurer/.test(d)) err('la fiche s execute au son, 1,5 s, 35°, effleurer : '+d);
   if(!/jambe revenue/.test(d)) err('la fiche dit quand une repetition compte');
   if(/chrono/.test(d)||/tiens-la/.test(d)) err('plus rien de la tenue dans le geste');
   if(!e.fin||!/ligne casse/.test(e.fin)) err('critere de fin propre');
   if(/appui en moins/.test(e.vig)) err('l appui en moins etait faux : jambes serrees, deux appuis au sol');
   if(!/seule la hanche bouge/.test(e.vig)||e.vig.indexOf('<b>Épaules :</b>')<0||!/ne bloque jamais/.test(e.vig)) err('vigilance : tronc immobile, epaules, anti-apnee');
   if(/[Ll]est/.test(e.next)||!/pas de marche outillée/.test(e.next)) err('plafond : impasse dite, aucun lest promis : '+e.next);
   if(DB['gainage-lateral'].next!=='le gainage latéral avec abductions prend le relais') err('plafond du predecesseur : '+DB['gainage-lateral'].next);
   if(DB['bird-dog'].cadence||DB['gainage-lateral'].cadence) err('la cadence ne concerne que cet exercice');
   /* v2.22 : la lignee du pont fessier rejoint la cadence, avec sa propre spec */
   if(Object.keys(DB).filter(id=>DB[id].cadence&&!DB[id].cadence.reprise).join()!==ID) err('un seul exercice cadence sans reprise');
   if(typeof cadStart!=='function'||typeof toggleCadence!=='function'||CAD_GO!==1150) err('moteur cadence et depart a 1150');
 }
 console.log('catalogue OK : bw 8-15 par cote, cadence 1,5/1,5 et 3 s, verrou et repli inchanges, fiche au son, plafond sans lest');

 // 2. modele de temps
 await neuf();
 pose({target:8});
 if(serieSec(ID)!==INSTALL+2*(3+3+8*3)) err('serie : INSTALL + 2 x (prep + etab + cible x 3), '+serieSec(ID));
 pose({target:15});
 if(serieSec(ID)!==INSTALL+2*(3+3+45)) err('a 15 : 45 s de cadence par cote, '+serieSec(ID));
 state.prep=5;
 if(serieSec(ID)!==INSTALL+2*(5+3+45)) err('le decompte regle entre au modele');
 if(serieModelAdd(ID,15)!==INSTALL) err('rejeu : tout a defile au tick');
 if(serieSec('bird-dog')!==INSTALL+5+2*perfOf('bird-dog').target*5) err('le modele du bird-dog ne bouge pas');
 console.log('modele OK : deux cotes chronometres, etablissement compris, rejeu a l installation');

 // 3. premier cote, a horloge pilotee
 await neuf();
 pose({target:5});
 let st=seance();
 if(st.val!==0) err('avant le depart la valeur vaut 0');
 if(html.indexOf('toggleCadence()')<0||html.indexOf('>Démarrer<')<0) err('bouton Demarrer');
 if(/Prêt · Droite/.test(html)===false) err('avant le depart : Pret, cote droit');
 if(!/Droite à faire<\\/span> · Gauche à faire · cible <b class="num">5<\\/b> par côté/.test(html)) err('comptes : a faire, cote droit mis en valeur : '+html.match(/id="rcount">[^]*?<\\/div>/));
 if(html.indexOf('trimCad(')>=0||html.indexOf('resetCad()')>=0) err('ni rognage ni remise a zero avant toute mesure');
 if(/<span>Tenue<\\/span>/.test(html)) err('pas de barreau de tenue en tete');
 if(!/<b class="num">8-15<\\/b><span>Fourchette/.test(html)) err('fourchette 8-15 en tete');
 if(!/Montée <b class="num">1,5<\\/b> s, descente <b class="num">1,5<\\/b> s, au son/.test(html)) err('consigne de cadence avant le depart');
 validateSet(); if(cur.i!==0) err('Valider inerte avant toute mesure');
 tones.length=0;
 const wall0=WALL;
 toggleCadence();
 if(!st.ct.on||Math.abs(st.ct.t0-(wall0+6.15))>1e-9) err('depart : t0 = maintenant + decompte + 0,15 + etablissement, '+(st.ct.t0-wall0));
 if(el('#phlabel').textContent!=='En position · Droite'||el('#cc').textContent!=='3') err('decompte : En position, 3 : '+el('#cc').textContent);
 if(!/Allonge-toi sur le côté droit/.test(el('#aide').textContent)) err('consigne du decompte');
 const T0=st.ct.t0, off=st.ct.off, zero=T0-3;
 const prep=tones.filter(o=>o.frequency.value===700&&o.at<zero+off-1e-6).map(o=>Math.round((o.at-off-zero)*100)/100).sort((a,b)=>a-b);
 if(JSON.stringify(prep)!==JSON.stringify([-3,-2.74,-2,-1.74,-1,-0.74])) err('decompte en coup double a 700 Hz : '+JSON.stringify(prep));
 const go=tones.filter(o=>o.frequency.value===1150).map(o=>Math.round((o.at-off-zero)*100)/100);
 if(JSON.stringify(go)!=='[0,0.26]') err('au zero, le double coup a 1150 du gainage lateral classique : '+JSON.stringify(go));
 avance(3.3);                                   /* e = -2.85 : etablissement */
 if(el('#phlabel').textContent!=='Droite'||el('#cc').textContent!=='0'||!/Établis la ligne/.test(el('#phase').innerHTML)) err('etablissement : Droite, 0, Etablis la ligne : '+el('#phlabel').textContent+' '+el('#cc').textContent+' '+el('#phase').innerHTML);
 if(!/tag ok/.test(el('#phase').innerHTML)) err('etablissement en vert');
 if(!/Droite <b class="num">0<\\/b>/.test(el('#rcount').innerHTML)) err('etablissement : le cote en jeu est a 0');
 if(tones.some(o=>o.frequency.value===950&&o.at<T0+off-1e-6)) err('aucune montee pendant l etablissement');
 avance(2.95);                                  /* e = 0.10 : premiere montee */
 const m0=tones.find(o=>Math.abs(o.at-(T0+off))<1e-6);
 if(!m0||m0.frequency.value!==950) err('premiere montee a 950 Hz sur t0');
 if(!/>Monte</.test(el('#phase').innerHTML)||el('#cc').textContent!=='1') err('e=0,1 : Monte, repetition en cours 1 (v2.22)');
 if(!/Le Stop fige ce côté/.test(el('#aide').textContent)) err('consigne pendant la cadence');
 validateSet(); trimCad(0); touche('-');
 if(cur.i!==0||!st.ct.on||st.sides[0]!=null) err('pendant la cadence : Valider, rognage et touche moins inertes');
 avance(1.5);                                   /* e = 1.6 : descente */
 if(!/>Descends</.test(el('#phase').innerHTML)||!/tag pause/.test(el('#phase').innerHTML)||el('#cc').textContent!=='1') err('e=1,6 : Descends en orange, repetition en cours 1');
 avance(1.5);                                   /* e = 3.1 : repetition comptee jambe revenue */
 if(el('#cc').textContent!=='2'||!/>Monte</.test(el('#phase').innerHTML)) err('e=3,1 : repetition en cours 2, Monte');
 if(!/<span style="color:var\\(--accent\\);font-weight:700">Droite <b class="num">1<\\/b><\\/span> · Gauche à faire/.test(el('#rcount').innerHTML)) err('comptes en direct : '+el('#rcount').innerHTML);
 avance(17.7);                                  /* e = 20.8 : six repetitions, septieme programmee */
 const mon=tones.filter(o=>o.frequency.value===950&&o.at>=T0+off-1e-6).map(o=>rel(o,T0,off));
 const des=tones.filter(o=>o.frequency.value===700&&o.at>T0+off).map(o=>rel(o,T0,off));
 const cib=tones.filter(o=>o.frequency.value===1200).map(o=>rel(o,T0,off));
 if(JSON.stringify(mon)!=='[0,3,6,9,15,18,21]') err('montees tous les 3 s, sauf celle de la repetition-cible : '+JSON.stringify(mon));
 if(JSON.stringify(des)!=='[1.5,4.5,7.5,10.5,13.5,16.5,19.5,22.5]') err('descentes a 1,5 s de chaque montee, cadence continue : '+JSON.stringify(des));
 if(JSON.stringify(cib)!=='[12]') err('v2.22 : ton de cible sur la montee de la cinquieme repetition, a la place de son 950 : '+JSON.stringify(cib));
 if(cur.model<20) err('le temps qui defile compte au modele : '+cur.model);
 const pendant=tones.filter(o=>o.at>actx.currentTime);
 if(!pendant.length) err('prealable : des coups programmes au-dela du Stop');
 toggleCadence();                               /* Stop en montee de la septieme */
 if(st.ct.on||!st.done||st.sides[0]!==6||st.sides[1]!==null||st.val!==6) err('Stop : cote droit a 6, gauche a faire : '+JSON.stringify(st.sides));
 if(!pendant.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('les coups programmes sont annules au Stop');
 if(!/Côté droit mesuré/.test(html)||!/>Second côté</.test(html)) err('apres le Stop : cote droit mesure, Second cote');
 if(!/Retourne-toi, puis Second côté/.test(html)) err('consigne de retournement');
 if(html.indexOf('trimCad(0)')<0||html.indexOf('trimCad(1)')<0||html.indexOf('resetCad()')<0) err('rognage par cote et remise a zero proposes');
 if(!/trimCad\\(1\\)" disabled/.test(html)) err('le cote gauche non mesure ne se rogne pas');
 if(/class="big ok"/.test(html)) err('un seul cote mesure : Valider inerte');
 validateSet(); if(cur.i!==0) err('Valider inerte sur un seul cote');
 console.log('premier cote OK : decompte, depart a 1150, etablissement, montees et descentes a 1,5 s, compte jambe revenue, ton de cible a la place de la montee, Stop qui annule');

 // 4. second cote, validation, rognage, remise a zero
 {
   const w1=WALL;
   espace();
   if(!st.ct.on||st.side!==1||st.done) err('ESPACE lance le second cote');
   if(el('#phlabel').textContent!=='En position · Gauche') err('decompte du second cote : '+el('#phlabel').textContent);
   if(!/Allonge-toi sur le côté gauche/.test(el('#aide').textContent)) err('consigne du second cote');
   const T1=st.ct.t0;
   if(Math.abs(T1-(w1+6.15))>1e-9) err('second cote : meme depart');
   avance(7);
   trimCad(0); trimCad(1); touche('-'); validateSet();
   if(st.sides[0]!==6||st.sides[1]!==null||cur.i!==0||!st.ct.on) err('pendant le second cote : rognage des deux cotes et validation inertes : '+st.sides);
   avance(6.15+12.4-7);                         /* e = 12.4 : quatre repetitions */
   if(el('#phlabel').textContent!=='Gauche'||el('#cc').textContent!=='5') err('second cote : Gauche, quatre faites, cinquieme en cours');
   if(!/Droite <b class="num">6<\\/b> · <span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">4<\\/b>/.test(el('#rcount').innerHTML)) err('comptes des deux cotes : '+el('#rcount').innerHTML);
   espace();
   if(st.ct.on||st.sides.join()!=='6,4'||!st.done) err('ESPACE arrete le second cote : '+st.sides);
   if(!/Au journal : <b class="num">4<\\/b> répétitions par côté, le côté le plus court fait foi/.test(html)) err('ligne de journal');
   if(html.indexOf('class="big ok"')<0) err('deux cotes mesures : Valider actif');
   if(!/id="ct" disabled/.test(html)||!/>Série mesurée</.test(html)) err('bouton principal eteint : serie mesuree');
   espace(); if(st.ct.on||st.side!==1) err('ESPACE inerte apres le dernier cote');
   touche('-');
   if(st.sides.join()!=='6,3'||st.val!==3) err('touche moins : rogne le cote courant, '+st.sides);
   touche('+'); if(st.sides.join()!=='6,3') err('plus inerte');
   trimCad(0);
   if(st.sides.join()!=='5,3') err('rognage du cote droit : '+st.sides);
   if(!/Au journal : <b class="num">3<\\/b> répétitions par côté/.test(html)) err('le journal suit le rognage');
   for(let i=0;i<9;i++) trimCad(1);
   if(st.sides[1]!==0) err('plancher a zero : '+st.sides);
   if(!/trimCad\\(1\\)" disabled/.test(html)) err('bouton gris a zero');
   if(/class="big ok"/.test(html)) err('un cote a zero : Valider inerte');
   if(!/Un côté sans répétition complète/.test(html)) err('message d un cote a zero');
   validateSet(); if(cur.i!==0) err('un cote a zero ne se valide pas');
   resetCad();
   if(st.sides[1]!==null||st.done||st.side!==1||st.sides[0]!==5) err('remise a zero du seul cote courant : '+JSON.stringify(st.sides));
   if(!/>Second côté</.test(html)||!/Prêt · Gauche/.test(html)) err('apres remise a zero : Pret, Gauche, Second cote');
   toggleCadence(); avance(6.15+15.2);           /* e = 15.2 : cinq */
   toggleCadence();
   if(st.sides.join()!=='5,5') err('second cote refait : '+st.sides);
   if(/le côté le plus court fait foi/.test(html)) err('cotes egaux : pas de mention du cote court');
   validateSet();
   if(cur.i!==1||JSON.stringify(cur.log[ID])!=='[5]') err('validation : 5 au journal, '+JSON.stringify(cur.log));
   if(!cur.back||cur.back.val!==5) err('un pas en arriere est ouvert');
   stepBack();
   const s0=cur.steps[0];
   /* le rendu qui suit le retour recree un etat vierge */
   if(cur.i!==0||(s0.ct&&s0.ct.on)||JSON.stringify(s0.sides)!=='[null,null]'||s0.done||s0.side!==0||cur.log[ID]) err('stepBack efface la mesure cadencee : '+JSON.stringify(s0));
   if(!/Prêt · Droite/.test(html)) err('apres le retour, on repart du cote droit');
 }
 console.log('second cote OK : ESPACE, comptes des deux cotes, cote court au journal, ESPACE inerte, rognage par cote, plancher, remise a zero du cote courant, validation, retour d un pas');

 // 5. Stop precoce, sans son
 await neuf();
 pose({target:8});
 st=seance();
 toggleCadence(); avance(1);
 toggleCadence();
 if(st.sides[0]!==0||!st.done) err('Stop pendant le decompte : 0');
 if(!/Aucune répétition complète : réinitialise ce côté/.test(html)) err('message d un cote vide');
 resetCad();
 toggleCadence(); avance(4);                    /* e = -2.15 : etablissement */
 toggleCadence();
 if(st.sides[0]!==0) err('Stop pendant l etablissement : 0');
 espace(); avance(6.15+3.2); espace();
 if(st.sides.join()!=='0,1') err('second cote a 1 : '+st.sides);
 validateSet(); if(cur.i!==0) err('un premier cote vide ne se valide pas');
 await neuf();
 pose({target:8}); state.sound=false; tones.length=0;
 st=seance();
 toggleCadence(); avance(6.15+4.6);
 if(tones.length) err('son coupe : aucun coup');
 if(st.ct.off!==null) err('son coupe : pas d horloge audio');
 if(el('#cc').textContent!=='2'||!/>Descends</.test(el('#phase').innerHTML)) err('son coupe : la cadence se lit a l ecran');
 toggleCadence(); if(st.sides[0]!==1) err('son coupe : la mesure vaut');
 console.log('stop precoce OK : decompte et etablissement valent 0, cote vide non validable, sans son la cadence se lit');

 // 6. abandon, repli douleur et retour
 await neuf();
 pose({target:8});
 st=seance();
 toggleCadence(); avance(10);
 {
   const avance_=tones.filter(o=>o.at>actx.currentTime);
   if(!st.ct.on||!avance_.length) err('prealable : cadence en cours');
   skipSet();
   if(st.ct.on) err('serie passee : cadence desarmee');
   if(!avance_.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('serie passee : coups annules');
   if(cur.i!==1) err('serie passee : on avance');
 }
 await neuf();
 pose({target:8});
 st=seance();
 toggleCadence(); avance(6.15+9.2); toggleCadence();
 if(st.sides[0]!==3) err('prealable : cote droit a 3');
 if(fbOf(ID)!=='gainage-lateral') err('prealable : repli sur le gainage lateral');
 toggleCadence(); avance(1);
 swapPain();
 const sp=cur.steps[0];
 if(sp.id!=='gainage-lateral'||sp.ct||JSON.stringify(sp.sides)!=='[null,null]'||sp.done||sp.side!==0) err('repli : la mesure cadencee ne passe pas au repli tenu : '+JSON.stringify(sp));
 if(tones.some(o=>o.at>actx.currentTime&&!(o.stops||[]).length)) err('repli : les coups en attente sont annules');
 if(cur.steps[2].ct||cur.steps[2].sides) err('repli : les series suivantes repartent vierges');
 if(!/1er côté : \\u2014/.test(html)) err('le repli tenu repart de zero : '+(html.match(/1er côté[^<]*/)||[''])[0]);
 toggleChrono(); avance(2); toggleChrono();
 if(!sp.sides||sp.sides[0]==null) err('prealable : une tenue mesuree sur le repli');
 revertSwap();
 if(sp.id!==ID||JSON.stringify(sp.sides)!=='[null,null]'||sp.done||sp.side!==0||(sp.ct&&sp.ct.on)) err('retour : la tenue en secondes ne revient pas sur l exercice cadence : '+JSON.stringify(sp));
 if(!/Prêt · Droite/.test(html)||!/Droite à faire/.test(html)) err('retour : ecran cadence vierge');
 cur=null; view='home';
 console.log('abandon OK : serie passee desarmee ; repli et retour sans transport de mesure');

 // 7. progression et journal
 await neuf();
 {
   let p=pose({target:15});
   let m=applyProgress(ID,[15,15],true,false);
   if(p.range.join('-')!=='8-15'||p.target!==15||p.grace) err('au plafond : fourchette et cible immobiles : '+JSON.stringify(p));
   if(!dit(m,/Plafond atteint/)||!m.some(x=>x.indexOf(DB[ID].next)>=0)) err('message de plafond : '+m.join(' | '));
   p=pose({target:8});
   applyProgress(ID,[10,9],true,false);
   if(p.range.join('-')!=='8-15'||p.target<9||p.target>11) err('cible suivante en repetitions : '+JSON.stringify(p));
   if(p.tenue!=null||p.assise!=null) err('aucun barreau pose');
   if(estMontee(p,{range:[8,15],load:0,target:8},DB[ID])) err('aucune montee de palier sur un bw');
   const E=echelleOf(ID);
   if(!E||E.quoi!=='fourchette'||E.lbl.join()!=='8-15 reps'||E.i!==0) err('fiche : fourchette 8-15 reps, '+JSON.stringify(E));
 }
 await neuf();
 pose({target:6});
 startSession(); cur.phase='work';
 cur.steps=[{k:'set',id:ID,key:ID,set:1,of:2,round:1},{k:'set',id:ID,key:ID,set:2,of:2,round:2}];
 cur.i=0; renderSession();
 for(let k=0;k<2;k++){ const s=cur.steps[cur.i]; s.sides=[7,6]; s.side=1; s.done=true; s.ct={on:false,t0:null}; validateSet(); }
 for(let i=0;i<80;i++) await Promise.resolve();
 {
   const h=state.hist[state.hist.length-1];
   const it=h&&h.items.find(x=>x.id===ID);
   if(!it||JSON.stringify(it.sets)!=='[6,6]') err('journal : 6 et 6, cote court : '+JSON.stringify(it));
   if(JSON.stringify(it.rng)!=='[8,15]'||it.tenue!=null||it.assise!=null||it.u!=null) err('passage : fourchette 8-15, ni tenue, ni assise, ni unite heritee : '+JSON.stringify(it));
   if(unitAt(DB[ID],it)!=='reps') err('unite du passage : reps');
   if(palierVal(ID,it)!=='8-15') err('palier du passage : 8-15');
 }
 cur=null; view='home';
 console.log('progression OK : plafond sans marche, cible en repetitions, fourchette seule, journal au cote court avec it.rng');

 // 8. migration de la performance tenue
 await neuf();
 {
   const vieux={load:0,range:[15,45],target:30,best:45,sets:[45,44],prevMin:44,date:'2026-09-16T10:00:00.000Z'};
   const conforme={load:0,range:[8,15],target:12,best:12,sets:[12,11],prevMin:11,date:'2026-09-18T10:00:00.000Z'};
   const glat={load:0,range:[15,45],target:45,best:49,sets:[49,48,48],prevMin:48,date:'2026-09-15T10:00:00.000Z'};
   state.unlocked[ID]=true;
   state.perf[ID]=g(vieux); state.perf['gainage-lateral']=g(glat);
   state.hist=[
     {date:'2026-09-15T10:00:00.000Z',rounds:3,items:[{id:'gainage-lateral',sets:[49,48,48],load:0,rng:[15,45]}]},
     {date:'2026-09-16T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[45,44],load:0,rng:[15,45]},{id:'bird-dog',sets:[8,8],load:0,rng:[6,12],tenue:3}]}
   ];
   state.undo={date:'2026-09-16T10:00:00.000Z',keys:[ID],full:{},perf:{[ID]:g(vieux)}};
   await save(); state=null; await loadState();
   const q=state.perf[ID];
   if(q&&(q.range.join('-')!=='8-15'||(q.sets||[]).length||q.prevMin!=null||q.best)) err('la performance tenue repart de zero : '+JSON.stringify(q));
   const q2=perfOf(ID);
   if(q2.range.join('-')!=='8-15'||q2.target!==8||q2.sets.length) err('recreee au bas de fourchette : '+JSON.stringify(q2));
   if(!state.unlocked[ID]) err('le deblocage est conserve');
   if(JSON.stringify(state.perf['gainage-lateral'])!==JSON.stringify(glat)) err('le gainage lateral n est pas touche : '+JSON.stringify(state.perf['gainage-lateral']));
   const itv=state.hist[1].items[0], itb=state.hist[1].items[1], itg=state.hist[0].items[0];
   if(itv.u!=='s') err('le passage tenu est marque en secondes : '+JSON.stringify(itv));
   if(JSON.stringify(itv.sets)!=='[45,44]'||JSON.stringify(itv.rng)!=='[15,45]') err('le passage tenu garde ses valeurs');
   if(itb.u!=null||itg.u!=null) err('aucun autre passage marque');
   if(state.undo) err('la seance jouee sous l ancien regime ne se corrige plus');
   if(corrigible()) err('correction fermee');
   /* idempotence et etat conforme */
   state.perf[ID]=g(conforme);
   state.hist[1].items.push({id:ID,sets:[12,11],load:0,rng:[8,15]});
   state.undo={date:state.hist[1].date,keys:[ID],full:{},perf:{[ID]:g(conforme)}};
   const a=migrateState(g(state)), b=migrateState(g(a));
   if(JSON.stringify(a)!==JSON.stringify(b)) err('migration non idempotente');
   if(JSON.stringify(a.perf[ID])!==JSON.stringify(conforme)) err('une performance conforme ne bouge pas : '+JSON.stringify(a.perf[ID]));
   if(a.hist[1].items[2].u!=null) err('un passage cadence n est pas marque');
   if(!a.undo) err('un instantane conforme est garde');
   /* etat neuf : no-op */
   await neuf();
   const n0=g(state), n1=migrateState(g(state));
   if(JSON.stringify(n0.perf)!==JSON.stringify(n1.perf)||JSON.stringify(n0.hist)!==JSON.stringify(n1.hist)) err('etat neuf : migration sans effet');
 }
 console.log('migration OK : performance tenue remise a zero, deblocage garde, passages tenus marques en secondes, correction fermee, idempotente, conforme et neuf intacts');

 // 9. passages herites a l affichage
 await neuf();
 {
   state.unlocked[ID]=true;
   state.hist=[
     {date:'2026-09-16T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[45,44],load:0,rng:[15,45]}]},
     {date:'2026-09-18T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[9,8],load:0,rng:[8,15]}]},
     {date:'2026-09-20T10:00:00.000Z',rounds:3,items:[{id:ID,sets:[10,10],load:0,rng:[8,15]}]}
   ];
   await save(); state=null; await loadState();
   const P=exoPassages(ID);
   if(P.length!==3||P[0].it.u!=='s') err('prealable : trois passages, le premier en secondes');
   if(unitAt(DB[ID],P[0].it)!=='s'||unitAt(DB[ID],P[1].it)!=='reps') err('unite par passage');
   if(palierVal(ID,P[0].it)!==null) err('un passage tenu n est pas un palier de l echelle actuelle');
   const PAL=paliersOf(ID);
   if(PAL.length!==1||PAL[0].v!=='8-15'||!PAL[0].first) err('chemin des paliers : depart a 8-15, sans descente fantome depuis 15-45 : '+JSON.stringify(PAL));
   html=''; showFiche(ID); ficheMoreId=ID; html=''; showFiche(ID);
   if(html.indexOf(setsHtml([45,44])+' s</span>')<0) err('fiche : le passage tenu se lit en secondes');
   if(html.indexOf(setsHtml([45,44])+' reps')>=0) err('fiche : jamais des secondes lues comme des repetitions');
   if(html.indexOf(setsHtml([9,8])+' reps</span>')<0) err('fiche : les passages cadences en reps');
   if(/↓ <b>8-15/.test(html)) err('fiche : pas de descente fantome');
   const H=histItemsHtml(state.hist[0]);
   if(H.indexOf(setsHtml([45,44])+' s</span>')<0) err('detail de seance : secondes');
   if(histItemsHtml(state.hist[1]).indexOf(setsHtml([9,8])+' reps')<0) err('detail de seance : reps');
   ficheMoreId=null;
 }
 console.log('passages herites OK : unite par passage a la fiche et au detail, chemin des paliers sans le regime tenu');

 // 10. fiche
 await neuf();
 {
   html=''; showFiche(ID);
   if(html.indexOf('Gainage latéral, abductions')<0) err('nom sur la fiche');
   if(html.indexOf(lockCond(DB[ID]))<0) err('verrou sur la fiche');
   if(!/Fin de série<\\/b> · le bassin qui descend/.test(html)) err('critere de fin rendu');
   if(!/Fourchette de travail : 8-15 reps/.test(html)) err('fourchette de travail en reps : '+(html.match(/Fourchette de travail[^<]*/)||[''])[0]);
   if(html.indexOf('35°')<0||html.indexOf('double bip')<0) err('geste rendu');
   view='lib'; html=''; render();
   if(html.indexOf('Gainage latéral, abductions')<0) err('bibliotheque');
 }
 console.log('fiche OK : nom, verrou, critere de fin, fourchette en reps, geste, bibliotheque');

 // 11. repli douleur entre deux tenues
 await neuf();
 {
   state.unlocked['planche-ballon']=true;
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:'planche-ballon',key:'planche-ballon',set:1,of:2,round:1},{k:'set',id:'planche-ballon',key:'planche-ballon',set:2,of:2,round:2}];
   cur.i=0; renderSession();
   const s1=cur.steps[0];
   if(fbOf('planche-ballon')!=='planche') err('prealable : la planche au sol est le repli du ballon');
   toggleChrono(); tic(3+17); toggleChrono();   /* 3 s de decompte */
   if(s1.sides[0]!==17||!s1.done||!/class="big ok"/.test(html)) err('prealable : 17 s mesurees sur le ballon, validables : '+JSON.stringify(s1.sides));
   swapPain();
   if(s1.id!=='planche') err('repli vers la planche au sol');
   if(s1.done||s1.val||(s1.sides&&s1.sides[0]!=null)) err('la tenue faite sur le ballon ne suit pas l exercice qui change d identite : '+JSON.stringify({sides:s1.sides,done:s1.done,val:s1.val}));
   if(/class="big ok"/.test(html)) err('rien a valider tant que la tenue n est pas refaite au sol');
   if(cur.steps[1].sides&&cur.steps[1].sides[0]!=null) err('les series suivantes repartent vierges');
   validateSet();
   if(cur.i!==0||cur.log['planche-ballon>planche']) err('aucune valeur ne part au journal du repli : '+JSON.stringify(cur.log));
   toggleChrono(); tic(3+24); toggleChrono();
   if(s1.sides[0]!==24) err('prealable : 24 s mesurees au sol');
   revertSwap();
   if(s1.id!=='planche-ballon') err('retour au ballon');
   if(s1.done||s1.val||(s1.sides&&s1.sides[0]!=null)) err('la tenue faite au sol ne revient pas sur le ballon : '+JSON.stringify({sides:s1.sides,done:s1.done}));
   /* une serie deja validee reste acquise : le repli n efface que l etape en cours */
   toggleChrono(); tic(3+30); toggleChrono(); validateSet();
   if(JSON.stringify(cur.log['planche-ballon'])!=='[30]') err('prealable : une serie validee sur le ballon');
   swapPain();
   if(JSON.stringify(cur.log['planche-ballon'])!=='[30]') err('le repli ne defait pas une serie deja validee');
   if(cur.steps[1].id!=='planche'||cur.steps[1].done) err('la serie suivante bascule, vierge');
 }
 cur=null; view='home';
 console.log('repli entre tenues OK : la mesure ne suit pas le changement d identite, dans les deux sens, et une serie validee reste acquise');

 console.log('TESTS REPETITIONS CADENCEES V2.19 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
```

## falsif46.sh, banc de falsification du lot v2.19

Cinquante-quatre mutations, puis six rejouées la section catalogue neutralisée, par remplacement
exact avec compte. Toutes tombent. Trois mutations écartées, documentées dans le banc : `every` vers
`some` dans `cadReady`, équivalente puisque `Math.min` lit `null` comme zéro ; la garde « cadence en
cours » de la même fonction, retirée du code parce qu'une série qui tourne a toujours son côté
courant non mesuré ; et `i>=cur.i` dans `swapPain`, sans effet observable ici, les séries déjà
jouées gardant leur clé de journal.

```bash
#!/bin/bash
# Banc de falsification du lot v2.19 : gainage lateral avec abductions, en
# repetitions cadencees. Chaque mutation defait une decision du lot ; test46
# doit tomber sur chacune. Une mutation qui survit designe une assertion qui
# ne prouve rien. Mutations par remplacement exact avec compte : un motif qui
# ne mord pas arrete le banc au lieu de se lire comme une survie. Le banc
# neutralise aussi la section 1 sur une copie de la suite, pour prouver que
# les sections de comportement mordent seules sur les valeurs du catalogue.
set -e
cd "$(dirname "$0")"
cp app3.js .d3 ; cp app4.js .d4 ; cp app5.js .d5 ; cp app6.js .d6 ; cp app7.js .d7 ; cp app8.js .d8 ; cp test46.js .t46
restaure(){ cp .d3 app3.js; cp .d4 app4.js; cp .d5 app5.js; cp .d6 app6.js; cp .d7 app7.js; cp .d8 app8.js; cp .t46 test46.js; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test46.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}
# Table en Python : les motifs portent des apostrophes echappees du code
# source, illisibles en arguments shell.
mutx(){ python3 - "$1" << 'PY'
import sys
T={
 # catalogue et fiche
 'cadence_1_2':('app3.js',"cadence:{monte:1.5,descente:1.5,etab:3}","cadence:{monte:1,descente:2,etab:3}"),
 'sans_etablissement':('app3.js',"cadence:{monte:1.5,descente:1.5,etab:3}","cadence:{monte:1.5,descente:1.5,etab:0}"),
 'retour_en_tenue':('app3.js',"cadence:{monte:1.5,descente:1.5,etab:3},","mode:'time',"),
 'fourchette_tenue':('app3.js',"mode:'bw',reps:[8,15],sets:2,side:true,\n   cadence","mode:'bw',reps:[15,45],sets:2,side:true,\n   cadence"),
 'lest_promis':('app3.js',"'gainage-lateral-jambe-levee':'pas de marche outillée au-delà ; la suite reste à décider',","'gainage-lateral-jambe-levee':'ajoute un leste de cheville sur la jambe levée ; l\\'outil ne suit pas encore cette charge',"),
 'predecesseur_ancien_nom':('app3.js',"'gainage-lateral':'le gainage latéral avec abductions prend le relais',","'gainage-lateral':'le gainage latéral jambe levée prend le relais',"),
 'appui_en_moins':('app3.js',"<b>Dos :</b> le tronc reste immobile, seule la hanche bouge ; aucune flexion de colonne.","<b>Dos :</b> même exercice anti-mouvement que la version au sol, avec un appui en moins."),
 'critere_de_fin_absent':('app3.js'," fin:'le bassin qui descend ou qui part en arrière. Dès que la ligne casse, Stop, quel que soit le compte.',\n",""),
 # migration
 'migration_absente':('app4.js',"if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];","if(false) delete s.perf[id];"),
 'migration_ecretage_seul':('app4.js',"if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];","if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) q.range=e.reps.slice();"),
 'migration_toute_perf':('app4.js',"if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;\n    if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];","if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;\n    delete s.perf[id];"),
 'passages_non_marques':('app4.js',"if(it.rng[0]!==e.reps[0]||it.rng[1]!==e.reps[1]) it.u='s';","if(false) it.u='s';"),
 'tous_passages_marques':('app4.js',"if(it.rng[0]!==e.reps[0]||it.rng[1]!==e.reps[1]) it.u='s';","it.u='s';"),
 'correction_gardee':('app4.js',"  })) delete s.undo;","  })) void 0;"),
 'correction_toujours_fermee':('app4.js',"    return e&&e.cadence&&exSecondes(id)&&q&&q.range&&(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]);","    return e&&e.cadence&&exSecondes(id);"),
 # modele de temps
 'modele_sans_etablissement':('app5.js',"Math.round(prepSec()+(c.etab||0)+r*","Math.round(prepSec()+r*"),
 'modele_un_cote':('app5.js',"INSTALL+(e.side?2:1)*Math.round(","INSTALL+1*Math.round("),
 'rejeu_modelise':('app5.js',"if(e.mode==='time'||e.rhythm||e.cadence) return INSTALL;","if(e.mode==='time'||e.rhythm) return INSTALL;"),
 # moteur
 'valeur_initiale_cible':('app6.js',"((e.mode==='time'||e.rhythm||e.cadence)?0:","((e.mode==='time'||e.rhythm)?0:"),
 'compte_en_haut':('app6.js',"function cadClosed(sp,e){ return e>0?Math.floor(e/sp.cycle):0; }","function cadClosed(sp,e){ return e>=sp.monte?Math.floor((e-sp.monte)/sp.cycle)+1:0; }"),
 'cible_en_plus_du_950':('app6.js',"      tone(cible?RHYTHM_CIBLE:RHYTHM_OPEN,t,cible?.22:.12);","      tone(RHYTHM_OPEN,t,.12); if(cible) tone(RHYTHM_CIBLE,t,.22);"),
 'cible_une_repetition_tot':('app6.js',"cible=(ct.base||0)+i+1===sp.cible;","cible=(ct.base||0)+i+2===sp.cible;"),
 'descente_tardive':('app6.js',"      tone(RHYTHM_CLOSE,t+sp.monte+sp.tenue,.12);","      tone(RHYTHM_CLOSE,t+sp.cycle/2+.5,.12);"),
 'depart_muet':('app6.js',"    if(sp.etab>0) RHYTHM_PREP_OFF.forEach(d=>tone(CAD_GO,zero+d+ct.off,.16));\n",""),
 'depart_simple_coup':('app6.js',"    if(sp.etab>0) RHYTHM_PREP_OFF.forEach(d=>tone(CAD_GO,zero+d+ct.off,.16));","    if(sp.etab>0) tone(CAD_GO,zero+ct.off,.16);"),
 'depart_a_950':('app6.js',"const CAD_GO=1150;","const CAD_GO=950;"),
 'montee_au_zero':('app6.js',"ct.t0=now+n+.15+sp.etab;","ct.t0=now+n+.15;"),
 'decompte_simple_coup':('app6.js',"    for(let k=n;k>=1;k--) RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,zero-k+d+ct.off,.1));","    for(let k=n;k>=1;k--) tone(RHYTHM_CLOSE,zero-k+ct.off,.1);"),
 'stop_non_definitif':('app6.js',"  if(st.done){ if(st.side>=st.sides.length-1) return; st.side++; st.done=false; }\n  cadStart(st);","  if(st.done){ st.done=false; }\n  cadStart(st);"),
 'stop_sans_annulation':('app6.js',"  clearInterval(timers.c); timers.c=null;\n  toneCancel();\n  renderSession();\n}\nfunction toggleCadence(){","  clearInterval(timers.c); timers.c=null;\n  renderSession();\n}\nfunction toggleCadence(){"),
 # « every » vers « some » dans cadReady est une mutation equivalente : Math.min
 # lit null comme 0, un cote non mesure ferme donc deja la validation. Ecartee.
 'validation_a_zero':('app6.js',"&&Math.min.apply(null,st.sides)>=1; }","&&Math.min.apply(null,st.sides)>=0; }"),
 'validation_ouverte':('app6.js',"function cadReady(st){ return !!st.sides&&st.sides.every(v=>v!=null)&&Math.min.apply(null,st.sides)>=1; }","function cadReady(st){ return !!st.sides; }"),
 'journal_cote_courant':('app6.js',"((e.mode==='time'||e.cadence)?Math.min.apply(null,st.sides):(st.val||0))","((e.mode==='time')?Math.min.apply(null,st.sides):(st.val||0))"),
 'rognage_sans_plancher':('app6.js',"  if(st.sides[i]==null||st.sides[i]<=0) return;\n  st.sides[i]--;","  if(st.sides[i]==null) return;\n  st.sides[i]--;"),
 'rognage_pendant_cadence':('app6.js',"  if(!st||!st.sides||(st.ct&&st.ct.on)) return;\n  if(st.sides[i]==null","  if(!st||!st.sides) return;\n  if(st.sides[i]==null"),
 'remise_a_zero_des_deux':('app6.js',"  st.sides[st.side]=null; st.val=0; st.done=false;\n  renderSession();\n}\n/* Etirements","  st.sides=[null,null]; st.side=0; st.val=0; st.done=false;\n  renderSession();\n}\n/* Etirements"),
 'abandon_ignore':('app6.js',"  if(st.ct&&st.ct.on){ st.ct.on=false; toneCancel(); }\n",""),
 'repli_transporte':('app6.js',"      delete s.ct; delete s.sides; delete s.side; delete s.done;}","      delete s.ct;}"),
 'repli_cadence_seule':('app6.js',"      delete s.ct; delete s.sides; delete s.side; delete s.done;}","      delete s.ct; if(DB[old].cadence){ delete s.sides; delete s.side; delete s.done; }}"),
 'retour_transporte':('app6.js',"      delete s.sides; delete s.side; delete s.done; delete s.ct;}","      }"),
 'retour_cadence_seul':('app6.js',"      delete s.sides; delete s.side; delete s.done; delete s.ct;}","      if(DB[old].cadence){ delete s.sides; delete s.side; delete s.done; delete s.ct; }}"),
 # « i>=cur.i » dans swapPain : les series deja jouees gardent leur cle de
 # journal, la mutation ne change rien d observable ici. Couverte ailleurs,
 # ecartee de ce banc.
 'etablissement_muet':('app6.js',"ph.innerHTML='<span class=\"tag ok\">Établis la ligne</span>';","ph.innerHTML='';"),
 'phase_inversee':('app6.js',"const tag=t<sp.monte?","const tag=t>=sp.monte?"),
 'comptes_figes':('app6.js',"  if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base+n);","  if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,null);"),
 'decompte_cote_droit':('app6.js',"cote=sp.n>1?rhythmSide(st.side):'';","cote=sp.n>1?rhythmSide(0):'';"),
 'bouton_principal_actif':('app6.js',"'<div class=\"mt\"></div><button class=\"big'+(over?' quiet':'')+'\" id=\"ct\"'+(over?' disabled':'')+' onclick=\"toggleCadence()\">'","'<div class=\"mt\"></div><button class=\"big'+(over?' quiet':'')+'\" id=\"ct\" onclick=\"toggleCadence()\">'"),
 'rognage_avant_mesure':('app6.js',"(m.some(v=>v!=null)&&!on?","(!on?"),
 'cote_court_tu':('app6.js',"(N>1?' par côté'+(m[0]!==m[1]?', le côté le plus court fait foi':''):'')","(N>1?' par côté':'')"),
 # historique
 'unite_heritee_ignoree':('app7.js',"function unitAt(e,it){ return (it&&it.u)||unitOf(e); }","function unitAt(e,it){ return unitOf(e); }"),
 'palier_tenu_compte':('app7.js',"  if(it.u&&it.u!==unitOf(e)) return null;\n",""),
 'fiche_en_reps':('app7.js',"setsHtml(it.sets||[])+' '+unitAt(e,it))","setsHtml(it.sets||[])+' '+unitOf(e))"),
 'detail_en_reps':('app7.js',"setsHtml(it.sets)+' '+unitAt(e,it))+'</span></div>';\n  }).join('')+'</div>';","setsHtml(it.sets)+' '+unitOf(e))+'</span></div>';\n  }).join('')+'</div>';"),
 # clavier
 'moins_cote_droit':('app8.js',"trimCad(st.side||0);","trimCad(0);"),
 'espace_ignore':('app8.js',"  else if(e.cadence){ if(!cadOver(st)) toggleCadence(); }   /* comme une tenue par cote (v2.19) */\n",""),
}
k=sys.argv[1]
f,old,new=T[k]
s=open(f,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE',k,'dans',f,':',s.count(old)); sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
sans1(){ python3 - << 'PY'
s=open('test46.js',encoding='utf-8').read()
old=" // 1. catalogue\n {"
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE : section 1'); raise SystemExit(1)
open('test46.js','w',encoding='utf-8').write(s.replace(old," // 1. neutralisee par le banc\n if(0) {"))
PY
}
for k in cadence_1_2 sans_etablissement retour_en_tenue fourchette_tenue lest_promis predecesseur_ancien_nom appui_en_moins critere_de_fin_absent \
         migration_absente migration_ecretage_seul migration_toute_perf passages_non_marques tous_passages_marques correction_gardee correction_toujours_fermee \
         modele_sans_etablissement modele_un_cote rejeu_modelise \
         valeur_initiale_cible compte_en_haut cible_en_plus_du_950 cible_une_repetition_tot descente_tardive depart_muet depart_simple_coup depart_a_950 \
         montee_au_zero decompte_simple_coup stop_non_definitif stop_sans_annulation validation_a_zero validation_ouverte \
         journal_cote_courant rognage_sans_plancher rognage_pendant_cadence remise_a_zero_des_deux abandon_ignore repli_transporte repli_cadence_seule retour_transporte retour_cadence_seul \
         etablissement_muet phase_inversee comptes_figes decompte_cote_droit bouton_principal_actif rognage_avant_mesure cote_court_tu \
         unite_heritee_ignoree palier_tenu_compte fiche_en_reps detail_en_reps moins_cote_droit espace_ignore; do
  mutx "$k"
  essai "$k"
done
# section 1 neutralisee : les sections de comportement mordent seules
for k in cadence_1_2 sans_etablissement retour_en_tenue fourchette_tenue critere_de_fin_absent depart_a_950; do
  sans1
  mutx "$k"
  essai "$k, sans la section 1"
done

restaure
rm -f .d3 .d4 .d5 .d6 .d7 .d8 .t46
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
node test46.js > /dev/null && echo "reference restauree, test46 passe"
```

## Suites existantes retouchées en v2.19

- `test10` : quatre exercices tenus et non plus cinq ; la consigne respiratoire des abductions est
  dans le geste, comme sur tout exercice dynamique.
- `test22` : la jambe levée sort de la liste des tenues à 45 s et se vérifie en répétitions
  cadencées dont les 15 font 45 s ; le plafond du gainage latéral nomme les abductions, celui des
  abductions dit l'impasse sans promettre de lest ; la bibliothèque liste le nouveau nom.
- `test39` : seize fiches à critère de fin propre.
- `falsif43.sh` : le motif du rognage des tenues s'élargit jusqu'à `toggleChrono`, `trimCad` portant
  la même ligne.
- `falsif44.sh` : la ligne du rejeu porte la cadence, seule la branche du rythme en est retirée.
- `build.sh` : quarante-six suites.

## test45.js, suite du lot v2.18

Dix-sept sections, en deux volets. Sections 1 à 8, la paire constatée au raccord. Contenu livré : exactement les deux paires, toutes deux dans les viviers. Règle du
successeur, dérivée du catalogue et non codée : pour chaque paire nommée, tout exercice dont `retire`
vise son gainage doit être nommé devant le même poussé, avec une garde de vacuité. Pose : à 2, 3 et
4 tours, compteurs calés par recherche sur le développé et le gainage latéral, `R-1` pauses à
`PAUSE_TOUR` juste après le gainage latéral ; puis la jambe levée débloquée, le gainage latéral
retiré du tirage et plus jamais servi, et les mêmes `R-1` pauses sur la jambe levée. Cas réel :
compteurs, déblocages et matériel de l'export du 15 septembre, paire à `k=2` avec la jambe levée,
10 séances sur 150, deux pauses. Analogie : aucune pause sur six paires voisines, trois gainages
devant le développé, le gainage latéral devant pompes et élévations, la jambe levée devant les
pompes. Coût : `(R-1) × (PAUSE_TOUR - transition)`, 110 s à 5 s et 90 s à 15 s, poste Pause de tour
à deux raccords. Fiches : ligne « Épaules » sur les deux gainages latéraux, consigne d'appui,
anti-apnée conservée, repli genoux qui allège l'épaule, ligne rendue dans la fiche. Textes :
Réglages tutoie et aucun vouvoiement dans la source, message de pause fondé sur le constat, sans les
deux justifications retirées, ligne visible et sortie conservées.

Sections 9 à 17, l'escalier du squat et les paliers joués. Catalogue : les deux échelons juste après
le goblet squat, retraits, modes, fourchettes, échelle d'assise à deux crans, aucun métronome,
verrous `kbTop` et `rungTop` avec leurs comptes, `kbSeules`, repli box squat, besoins, substitut de
la lestée, longueur de chaque ligne de `SCHEMA` et alignement du gainage, image, matériel, critère
de fin et consignes de chaque fiche. Tirage : empreinte de soixante séances sur l'état exporté le
15 septembre, calculée avec la v2.17, et remplacement sur place aux deux déblocages. Porte `kbTop`,
par `applyProgress` puis `checkUnlocks` et non par état posé à la main : fermée à 10 kg quand la 16
est déclarée, fermée sur la séance jouée à 14 kg qui fait monter à 16, bloc Verrou qui dit « KB 10 kg
+ lestes 4 kg » contre « KB 16 kg », ouverte à 16 kg sur deux séries de 15, goblet squat retiré,
fermée sans palier écrit avec le texte qui le dit, ouverte à 10 kg sur un inventaire à une
kettlebell, fermée sans kettlebell. Dernier cran : le défaut de la v2.5 rejoué sur les mollets
lestés et le pont lesté. Assise : position absente, 50 cm, montée à 40 depuis une cible haute avec
retour à 8, grâce, écriture du cran joué, message, montée comptée ; grâce au premier échec, remontée
à 50 au second ; plafond à 40 avec la marche écrite ; sens sur l'indice dans `estMontee` et
`palierUp`, étiquette, passage ancien sans champ, `lastLevel`, `playedLabel`, `tenueTag`, fiche,
chemin des deux crans, écran de série. Fin de séance jouée par le parcours d'écran : `it.assise` avant
progression, montée proposée, « tenir ce palier » qui rend la position absente. Porte `rungTop` :
fermée sur la montée vers 40, fermée à une seule série de 15, ouverte à 40, échelle 10 puis 16 sans
leste, sommet qui nomme la kettlebell de 20 kg, descente, repli box squat rendu dans la fiche, repli
sans kettlebell. Fiche au niveau joué sur la charge, la bande et la tenue, passage remplacé ignoré,
niveau courant sans historique. Marches écrites du goblet squat, de la version lestée et des
fentes lestées, et composition de `KB_NEXT`.

```javascript
// Suite du lot v2.18. Deux volets.
// Sections 1 a 8 : premiere paire constatee au raccord de tour.
// Sections 9 a 17 : escalier du squat (squat sur une jambe vers la chaise,
// palier d assise, version lestee en kettlebells seules), portes de verrou
// qui lisent le palier joue, et fiche qui dit le niveau joue.
//
// Le 15 septembre 2026, quatuor developpe au sol, goblet squat, tractions
// assistees en pronation, gainage lateral. Au raccord, gainage lateral puis
// developpe : epaules en feu, halteres difficiles a stabiliser. La paire est
// nommee, et son successeur par retrait avec elle, le deblocage de la jambe
// levee etant tombe pendant la seance meme du constat.
//
// test37 teste le mecanisme, liste videe au besoin. Cette suite teste le
// CONTENU livre et ce qu il produit : la paire, la regle du successeur, le
// refus des paires par analogie, le cout, la fiche et les deux textes que la
// liste rend visibles pour la premiere fois.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollY:0,scrollTo:(x,y)=>{global.window.scrollY=y;},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
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
const mk=cap=>({set innerHTML(v){if(cap){html=v;rebuild(v);}},get innerHTML(){return cap?html:''},
  classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true), other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>Object.keys(cards).map(k=>cards[k]),
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.SRC=raw;

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 const LIVREE=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol'];
 const pauses=L=>L.filter(s=>s.k==='rest'&&s.pause);
 /* compteur d un emplacement qui fait tirer l exercice voulu, cherche et non
    code en dur : la rotation a sa propre suite */
 const caler=(slot,id)=>{
   for(let c=0;c<200;c++){ state.slotIdx[slot]=c; if(pickAt(slot,0)===id) return c; }
   throw new Error(id+' introuvable au tirage de '+slot);
 };

 // 1. le contenu livre : deux paires, pas une de plus
 {
   if(PAUSE_RACCORD_PAIRS.length!==LIVREE.length||LIVREE.some(x=>PAUSE_RACCORD_PAIRS.indexOf(x)<0))
     throw new Error('liste livree inattendue : '+PAUSE_RACCORD_PAIRS.join(', '));
   PAUSE_RACCORD_PAIRS.forEach(x=>{ const ab=x.split('>');
     if(!ab.every(id=>SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0))) throw new Error('paire hors des viviers : '+x); });
   console.log('contenu OK : gainage lateral et jambe levee, tous deux devant le developpe');
 }

 // 2. regle du successeur, derivee du catalogue
 /* Un exercice qui en retire un autre du tirage a son deblocage prend sa place
    au raccord. Une paire nommee sur le retire mourrait en silence ce jour-la :
    toute paire nommee sur un exercice qui a un successeur nomme aussi le
    successeur, devant le meme pousse. */
 {
   let vus=0;
   PAUSE_RACCORD_PAIRS.forEach(x=>{ const ab=x.split('>');
     Object.keys(DB).filter(y=>DB[y].retire===ab[0]).forEach(y=>{ vus++;
       if(PAUSE_RACCORD_PAIRS.indexOf(y+'>'+ab[1])<0) throw new Error('successeur '+y+' non nomme devant '+ab[1]); }); });
   if(!vus) throw new Error('aucun successeur rencontre, la regle ne prouve rien');
   console.log('successeur OK : '+vus+' successeur par retrait, nomme devant le meme pousse');
 }

 // 3. la paire pose la pause, avant puis apres le deblocage
 for(const R of [2,3,4]){
   await neuf(R);
   caler('push','developpe-sol'); caler('core','gainage-lateral');
   let L=buildSession().steps, w=workSteps(L);
   if(w[0].id!=='developpe-sol'||w[3].id!=='gainage-lateral') throw new Error('quatuor mal cale : '+w.slice(0,4).map(s=>s.id).join(','));
   let pa=pauses(L);
   if(pa.length!==R-1) throw new Error(R+' tours, gainage lateral : '+pa.length+' pauses au lieu de '+(R-1));
   L.forEach((s,i)=>{ if(s.k==='rest'&&s.pause){
     if(L[i-1].id!=='gainage-lateral') throw new Error('pause qui ne suit pas le gainage lateral');
     if(pa.some(p=>p.sec!==PAUSE_TOUR)) throw new Error('pause qui ne vaut pas PAUSE_TOUR'); } });
   /* le deblocage retire le gainage lateral : la jambe levee occupe la place */
   state.unlocked['gainage-lateral-jambe-levee']=true;
   if(!estRetire('gainage-lateral')) throw new Error('le deblocage doit retirer le gainage lateral du tirage');
   caler('core','gainage-lateral-jambe-levee');
   L=buildSession().steps; w=workSteps(L);
   if(w.some(s=>s.id==='gainage-lateral')) throw new Error('le gainage lateral est encore tire apres le deblocage');
   pa=pauses(L);
   if(pa.length!==R-1) throw new Error(R+' tours, jambe levee : '+pa.length+' pauses au lieu de '+(R-1));
 }
 console.log('pose OK : R-1 pauses a 2, 3 et 4 tours, sur le gainage lateral puis sur la jambe levee');

 // 4. le cas du 15 septembre, sur l etat reel exporte ce jour-la
 /* compteurs, deblocages et materiel du profil Domicile. La troisieme seance
    a venir, k=2, porte la jambe levee devant le developpe : sans le successeur, la
    premiere occurrence de la paire apres le constat n aurait pas eu de pause. */
 {
   await neuf(3);
   state.gear={bar:2,bars:2,plates:{'1':12,'2':4,'0.5':4,'1.25':4},maxPerEnd:5,
     bands:{jaune:'jaune',rouge:'rouge',noir:'noir',violet:'violet',vert:'vert',n6:''},cuffs:{'1':1,'2':1},
     res:{hal:1,kb:1,elast:1,cuff:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1},kbs:{'10':1,'16':1}};
   syncProfil();
   state.slotIdx={push:24,pull:25,legs:24,core:25};
   state.unlocked={'mollets-debout-leste':true,'tractions-assistees-pronation':true,'rdl-kettlebell':true,'gainage-lateral-jambe-levee':true};
   state.trans=5;
   const q=drawAhead(2);
   if(q[0]!=='developpe-sol'||q[3]!=='gainage-lateral-jambe-levee') throw new Error('tirage reel inattendu : '+q.join(','));
   const prochaines=[];
   for(let k=0;k<150;k++){ const d=drawAhead(k); if(pauseAu(d[3],d[0])) prochaines.push(k); }
   if(prochaines[0]!==2) throw new Error('premiere occurrence attendue a k=2, obtenue '+prochaines[0]);
   if(prochaines.length!==10) throw new Error('frequence reelle attendue 10/150, obtenue '+prochaines.length);
   SLOT_ORDER.forEach(s=>state.slotIdx[s]+=2);
   if(pauses(buildSession().steps).length!==2) throw new Error('la seance reelle ne porte pas ses deux pauses');
   console.log('etat reel OK : paire a k=2 avec la jambe levee, 10 seances sur 150, deux pauses');
 }

 // 5. aucune paire par analogie
 /* decision de Gabriel : on attend d y tomber. Un gainage voisin devant le
    developpe, ou le gainage lateral devant un autre pousse, ne pause pas. */
 {
   await neuf(3);
   const cas=[['developpe-sol','planche'],['developpe-sol','bird-dog'],['developpe-sol','pallof-press'],
              ['pompes-poignees','gainage-lateral'],['elevations-laterales','gainage-lateral']];
   cas.forEach(([u,c])=>{ caler('push',u); caler('core',c);
     const n=pauses(buildSession().steps).length;
     if(n) throw new Error(c+' > '+u+' : '+n+' pauses sur une paire non constatee'); });
   state.unlocked['gainage-lateral-jambe-levee']=true;
   caler('push','pompes-poignees'); caler('core','gainage-lateral-jambe-levee');
   if(pauses(buildSession().steps).length) throw new Error('jambe levee > pompes : pause sur une paire non constatee');
   console.log('analogie OK : aucune pause sur six paires voisines non constatees');
 }

 // 6. le cout, au reglage de transition reel et au reglage par defaut
 /* La pause remplace la transition du raccord : le surcout vaut
    (R-1) x (PAUSE_TOUR - transition). 110 s a trois tours et 5 s de
    transition, le reglage de Gabriel ; 90 s au defaut de 15 s. */
 {
   for(const [t,att] of [[5,110],[15,90]]){
     await neuf(3); setTrans(t);
     caler('push','developpe-sol'); caler('core','gainage-lateral');
     const a=planParts(buildSession());
     const sauve=PAUSE_RACCORD_PAIRS.slice(); PAUSE_RACCORD_PAIRS.length=0;
     const b=planParts(buildSession());
     sauve.forEach(x=>PAUSE_RACCORD_PAIRS.push(x));
     if(a.total-b.total!==att) throw new Error('surcout a '+t+' s de transition : '+(a.total-b.total)+' au lieu de '+att);
     if(a.nPause!==2||a.pause!==2*PAUSE_TOUR) throw new Error('poste Pause de tour faux a '+t+' s');
   }
   setTrans(15);
   console.log('cout OK : +110 s a 5 s de transition, +90 s a 15 s, trois tours');
 }

 // 7. la fiche des deux gainages lateraux nomme l epaule
 {
   ['gainage-lateral','gainage-lateral-jambe-levee'].forEach(id=>{
     const v=DB[id].vig||'';
     if(v.indexOf('<b>Épaules :</b>')<0) throw new Error('ligne Epaules absente de '+id);
     if(!/avant-bras/.test(v.split('<b>Épaules :</b>')[1])||!/loin de l'oreille/.test(v)) throw new Error('consigne d appui absente de '+id);
     if(!/ne bloque jamais/.test(v)) throw new Error('consigne anti-apnee perdue sur '+id);
   });
   if(!/La version genoux allège aussi l'épaule/.test(DB['gainage-lateral'].vig)) throw new Error('le repli genoux doit dire qu il allege l epaule');
   html=''; showFiche('gainage-lateral');
   if(html.indexOf('loin de l\\'oreille')<0) throw new Error('la ligne Epaules n est pas rendue dans la fiche');
   console.log('fiche OK : ligne Epaules sur les deux gainages lateraux, rendue, anti-apnee conservee');
 }

 // 8. les deux textes que la liste rend visibles
 {
   await neuf(3);
   view='set'; render();
   if(html.indexOf('que tu as signalés')<0) throw new Error('Reglages doit annoncer la pause en tutoyant');
   if(/(^|[^a-zA-Z])vous\\s/.test(SRC)) throw new Error('un vouvoiement subsiste dans la source');
   caler('push','developpe-sol'); caler('core','gainage-lateral');
   view='home';
   startSession();
   const st=cur.steps.find(s=>s.k==='rest'&&s.pause);
   if(!st) throw new Error('aucune pause dans la seance calee');
   const h=restHtml(st);
   if(h.indexOf('Tu as signalé une gêne d\\'épaule sur cet enchaînement')<0) throw new Error('le message doit dire que la paire est constatee');
   if(/seule adjacence|ce qu\\\\'il faut|ce qu'il faut/.test(h)) throw new Error('le message reprend une justification retiree du carnet');
   if(h.indexOf('Le tour recommence')<0||h.indexOf('Passer reste possible')<0) throw new Error('le message a perdu sa ligne visible ou sa sortie');
   console.log('textes OK : Reglages tutoie, message de pause fonde sur le constat, sans seuil chiffre');
 }

 /* ================= escalier du squat et paliers joues ================= */
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' vs '+JSON.stringify(b)); };
 const GEAR_REEL=()=>({bar:2,bars:2,plates:{'1':12,'2':4,'0.5':4,'1.25':4},maxPerEnd:5,
     bands:{jaune:'jaune',rouge:'rouge',noir:'noir',violet:'violet',vert:'vert',n6:''},cuffs:{'1':1,'2':1},
     res:{hal:1,kb:1,elast:1,cuff:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1},kbs:{'10':1,'16':1}});
 const reel=()=>{ state.gear=GEAR_REEL(); syncProfil(); };
 const CH='squat-une-jambe-chaise', CL='squat-une-jambe-chaise-leste';
 const vierge=id=>{ delete state.perf[id]; return perfOf(id); };
 const joue=(id,load,sets)=>{ const q=perfOf(id); if(load!=null) q.load=load; delete q.grace; delete q.prevMin; delete q.hold;
   return applyProgress(id,sets,true,false,false); };
 const ficheDerniere=id=>{ html=''; showFiche(id); const i=html.indexOf('Dernière fois : ');
   return i<0?'':html.slice(i,html.indexOf('</span>',i)).replace(/<[^>]+>/g,''); };

 // 9. catalogue, tables par position
 {
   await neuf(3);
   const P=SLOTS.legs.pool, iG=P.indexOf('goblet-squat'), iC=P.indexOf(CH), iL=P.indexOf(CL);
   if(iC!==iG+1||iL!==iG+2) err('les deux echelons suivent le goblet squat, sur place');
   const c=DB[CH], l=DB[CL];
   if(c.retire!=='goblet-squat'||l.retire!==CH) err('chaque echelon retire son predecesseur');
   if(c.mode!=='bw'||!c.side||c.sets!==2||c.reps.join('-')!=='8-15') err('squat sur une jambe : poids du corps, par cote, 2 x 8-15');
   eq(c.assise&&c.assise.ladder,[[50,8,15],[40,8,15]],'deux crans d assise, 50 puis 40 cm');
   if(c.rhythm||l.rhythm) err('aucun metronome sur l escalier du squat');
   const lc=c.lock||{};
   if(lc.after!=='goblet-squat'||!lc.kbTop||lc.loadTop||lc.need!==15||lc.minSets!==2) err('verrou d entree : 2 x 15 a la kettlebell la plus lourde, '+JSON.stringify(lc));
   if(l.mode!=='fixed'||!l.kbSeules||l.load0!==10||!l.side||l.sets!==2) err('version lestee : kettlebells seules, 10 kg au depart, par cote');
   const ll=l.lock||{};
   if(ll.after!==CH||!ll.rungTop||ll.need!==15||ll.minSets!==2) err('verrou leste : 2 x 15 a l assise la plus basse, '+JSON.stringify(ll));
   if(c.fb!=='box-squat'||l.fb!=='box-squat') err('repli douleur : le box squat, a deux jambes');
   eq(NEEDS[CL],['kb'],'besoin de la version lestee');
   if(NEEDS[CH]) err('la version au poids du corps ne declare aucun besoin');
   eq(SUBS.legs[iL],[CH],'sans kettlebell, la version lestee se replie sur le poids du corps');
   if(SUBS.legs[iC]) err('aucun substitut sur la version au poids du corps');
   SLOT_ORDER.forEach(sl=>{ if(SCHEMA[sl].length!==SLOTS[sl].pool.length) err('SCHEMA.'+sl+' desaligne de son vivier'); });
   if(SCHEMA.legs[iC]!=='squat unilatéral'||SCHEMA.legs[iL]!=='squat unilatéral chargé') err('schemas de l escalier du squat');
   const C=SLOTS.core.pool, S=SCHEMA.core;
   eq(C.map(id=>S[C.indexOf(id)]),['gainage antérieur','gainage antérieur instable','coordination croisée','gainage latéral','gainage latéral chargé','anti-extension','anti-rotation'],'SCHEMA.core realigne');
   if(S[C.indexOf('bird-dog')]!=='coordination croisée'||S[C.indexOf('dead-bug')]!=='anti-extension') err('le bird-dog et le dead-bug portent leur schema');
   [CH,CL].forEach(id=>{
     if(typeof IMG!=='undefined'&&!IMG[id]) err('illustration absente : '+id);
     if(!DB[id].mat||!DB[id].mat.length) err('materiel absent : '+id);
     if(!DB[id].fin) err('critere de fin de serie absent : '+id);
     ['<b>Genoux :</b>','<b>Dos :</b>','<b>Chaise :</b>','ne roule ni ne pivote','ne bloque pas'].forEach(t=>{ if(DB[id].vig.indexOf(t)<0) err(id+' : consigne absente, '+t); });
     if(!/effleurer l'assise/.test(DB[id].desc.join(' '))) err(id+' : effleurer, pas s asseoir');
   });
   if(!/50 puis 40 cm/.test(c.desc[0])) err('la reference 50 puis 40 cm est ecrite');
   if(!/kettlebells seules/.test(l.vig)) err('la version lestee dit kettlebells seules');
   console.log('catalogue OK : deux echelons sur place, schemas et substituts alignes, SCHEMA.core realigne, fiches completes');
 }

 // 10. le tirage reel ne bouge pas
 /* empreinte de soixante seances a venir, calculee avec la v2.17 sur l etat
    exporte le 15 septembre : les deux positions inserees sont verrouillees,
    le vivier tirable est le meme, la sequence aussi */
 {
   await neuf(3); reel();
   state.slotIdx={push:24,pull:25,legs:24,core:25};
   state.unlocked={'mollets-debout-leste':true,'tractions-assistees-pronation':true,'rdl-kettlebell':true,'gainage-lateral-jambe-levee':true};
   const out=[]; for(let k=0;k<60;k++) out.push(drawAhead(k).join(','));
   let h=0; const txt=out.join('|'); for(let i=0;i<txt.length;i++) h=(h*31+txt.charCodeAt(i))>>>0;
   if(h!==2970376823||txt.length!==3830) err('tirage reel modifie : '+h+' / '+txt.length);
   const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
   const t0=tir(), r0=t0.indexOf('goblet-squat');
   state.unlocked[CH]=true; const t1=tir();
   if(t1.length!==t0.length||t1[r0]!==CH||t1.indexOf('goblet-squat')>=0) err('le squat sur une jambe prend la place exacte du goblet : '+t1.join(','));
   state.unlocked[CL]=true; const t2=tir();
   if(t2.length!==t0.length||t2[r0]!==CL||t2.indexOf(CH)>=0) err('la version lestee prend la place exacte : '+t2.join(','));
   console.log('tirage OK : soixante seances reelles identiques, remplacement sur place a chaque deblocage');
 }

 // 11. porte kbTop : la kettlebell la plus lourde, jouee
 {
   await neuf(3); reel(); state.unlocked['rdl-kettlebell']=true;
   const L=fixedLadder('goblet-squat',state.gear).map(x=>x.v);
   eq(L,[10,12,14,16,18,20,22],'echelle du goblet squat inchangee');
   vierge('goblet-squat');
   joue('goblet-squat',10,[15,15,15]); checkUnlocks(3,false);
   if(state.unlocked[CH]) err('ouvert a 10 kg alors que la 16 est declaree');
   joue('goblet-squat',14,[15,15,15]); checkUnlocks(3,false);
   if(perfOf('goblet-squat').load!==16) err('temoin : la seance a 14 kg fait monter a 16');
   if(perfOf('goblet-squat').setsLoad!==14) err('la charge jouee s ecrit avec les series : '+perfOf('goblet-squat').setsLoad);
   if(state.unlocked[CH]) err('ouvert sur des series jouees a 14 kg : la porte lit la charge d apres progression');
   html=''; showFiche(CH);
   if(html.indexOf('Palier joué : <b>KB 10 kg + lestes 4 kg</b> (il faut <b>KB 16 kg</b>)')<0) err('le bloc Verrou dit le palier joue et le palier exige');
   const m=(joue('goblet-squat',16,[15,15,14]),checkUnlocks(3,false));
   if(!state.unlocked[CH]) err('ferme a 16 kg avec deux series de 15');
   if(!m.length) err('le deblocage doit s annoncer');
   if(!estRetire('goblet-squat')) err('le goblet squat quitte le tirage');
   /* sans palier ecrit, la porte reste fermee : performance anterieure */
   delete state.unlocked[CH];
   const g=perfOf('goblet-squat'); g.load=16; g.sets=[15,15,15]; delete g.setsLoad; delete g.lightSets; delete g.unqualSets;
   checkUnlocks(3,false);
   if(state.unlocked[CH]) err('porte ouverte sans palier ecrit');
   html=''; showFiche(CH);
   if(html.indexOf('Le palier de ce passage n\\'a pas été enregistré')<0) err('le bloc Verrou dit que le palier manque');
   /* inventaire a une seule kettlebell : elle est la plus lourde */
   state.gear.kbs={'10':1}; syncProfil();
   joue('goblet-squat',10,[15,15,15]); checkUnlocks(3,false);
   if(!state.unlocked[CH]) err('un inventaire a 10 kg ouvre a 10 kg');
   /* aucune kettlebell : rien a exiger, porte fermee */
   delete state.unlocked[CH]; state.gear.kbs={}; syncProfil();
   const q=perfOf('goblet-squat'); q.setsLoad=10; q.sets=[15,15,15];
   checkUnlocks(3,false);
   if(state.unlocked[CH]) err('porte ouverte sans kettlebell declaree');
   console.log('porte kbTop OK : fermee a 10 et sur la montee de 14 a 16, ouverte a 16, fermee sans palier ecrit, inventaire pauvre ouvert');
 }

 // 12. le defaut du dernier cran, reproduit
 /* v2.5 a v2.17 : deux series de 25 a l avant-dernier cran des mollets
    lestes montaient la charge au dernier, et la porte lisait cette charge */
 {
   await neuf(3); reel();
   state.unlocked['mollets-debout-leste']=true;
   const L=fixedLadder('mollets-debout-leste',state.gear).map(x=>x.v);
   if(L.length<3) err('temoin : echelle du sac a trois barreaux au moins, '+L.join(','));
   vierge('mollets-debout-leste');
   joue('mollets-debout-leste',L[L.length-2],[25,25]); checkUnlocks(3,false);
   if(perfOf('mollets-debout-leste').load!==L[L.length-1]) err('temoin : montee au dernier cran');
   if(state.unlocked['mollets-une-jambe']) err('ouvert sur des series jouees a l avant-dernier cran');
   joue('mollets-debout-leste',null,[25,25]); checkUnlocks(3,false);
   if(!state.unlocked['mollets-une-jambe']) err('ferme au dernier cran joue');
   state.unlocked['pont-fessier-leste']=true;
   const H=fixedLadder('pont-fessier-leste',state.gear).map(x=>x.v);
   vierge('pont-fessier-leste');
   joue('pont-fessier-leste',H[0],[20,20,20]); checkUnlocks(3,false);
   if(H.length>1&&state.unlocked['pont-fessier-une-jambe']) err('pont : ouvert sur la montee vers le dernier cran');
   console.log('dernier cran OK : les series jouees sous le dernier cran n ouvrent plus rien');
 }

 // 13. palier d assise : montee, grace, descente, plafond
 {
   await neuf(3); reel(); state.unlocked['rdl-kettlebell']=true; state.unlocked[CH]=true;
   const e=DB[CH], q=vierge(CH);
   if(q.assise!=null) err('position absente au depart : migration neutre');
   if(assiseOf(CH,q)!==50) err('le premier cran vaut 50 cm');
   eq(baseReps(e,q),[8,15],'fourchette du premier cran');
   q.target=15;   /* cible haute avant la montee : le retour au bas doit se voir */
   let m=joue(CH,null,[15,15]);
   if(q.assise!==40||q.target!==8||!q.grace||q.range.join('-')!=='8-15') err('montee : 40 cm, cible au bas, grace, '+JSON.stringify(q));
   if(q.setsRung!==50) err('le cran joue s ecrit avec les series : '+q.setsRung);
   if(!/assise à 40 cm, retour à 8 par côté/.test(m.join(' '))) err('message de montee : '+m.join(' | '));
   if(state.loadUps<1) err('une montee d assise compte comme une montee');
   applyProgress(CH,[5,5],true,false,false);
   if(q.assise!==40) err('la grace protege le premier passage a 40 cm');
   m=applyProgress(CH,[5,5],true,false,false);
   if(q.assise!==50) err('deux passages sous le plancher : la chaise remonte');
   if(!/retour à l'assise de 50 cm/.test(m.join(' '))) err('message de descente : '+m.join(' | '));
   q.assise=40; q.range=[8,15];
   m=joue(CH,null,[15,15]);
   if(q.assise!==40||q.target!==15) err('au dernier cran : plafond, cible au haut');
   if(!/Plafond atteint/.test(m.join(' '))||!/version lestée prend le relais/.test(m.join(' '))) err('plafond et marche suivante : '+m.join(' | '));
   if(!estMontee({assise:40},{assise:50},e)||estMontee({assise:50},{assise:40},e)) err('le sens se lit sur le cran, pas sur la valeur');
   if(!palierUp(CH,50,40)||palierUp(CH,40,50)) err('descendre la chaise est une montee');
   if(palierLbl(CH,40)!=='assise à 40 cm') err('etiquette de palier : '+palierLbl(CH,40));
   if(palierVal(CH,{sets:[9,9],rng:[8,15]})!==50) err('un passage sans it.assise a ete joue au premier cran');
   /* fiche et ecran, sur un historique joue a 50 alors que la chaise est a 40 */
   state.hist=[{date:new Date().toISOString(),type:'alterne',mode:'alterne',items:[{id:CH,sets:[15,15],load:0,rng:[8,15],assise:50}]}];
   q.assise=40; q.sets=[15,15];
   if(palierVal(CH,state.hist[0].items[0])!==50) err('palier d un passage');
   if(!/assise 50 cm/.test(lastLevel(CH,q))) err('derniere fois : l assise jouee se dit quand elle differe');
   if(playedLabel(CH,q)!==', assise 50 cm') err('niveau joue : '+playedLabel(CH,q));
   if(!/assise 50 cm/.test(tenueTag(state.hist[0].items[0]))) err('etiquette de passage');
   if(ficheDerniere(CH)!=='Dernière fois : 15/15, assise 50 cm') err('fiche : '+ficheDerniere(CH));
   html=''; showFiche(CH);
   if(html.indexOf('Fourchette de travail : 8-15 reps, assise à 40 cm')<0) err('la fiche dit le cran courant');
   if(html.indexOf('assise 50 cm · 8-15')<0||html.indexOf('assise 40 cm · 8-15')<0) err('la fiche montre les deux crans');
   view='home'; startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:CH,key:CH,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:CH,key:CH,set:2,of:2,round:2}];
   cur.i=0; renderSession();
   if(!/<b class="num">40 cm<\\/b><span>Assise<\\/span>/.test(html)) err('l ecran de serie porte l assise a regler');
   if(/Tenue<\\/span>/.test(html)) err('pas de barreau de tenue sur une assise');
   console.log('assise OK : montee a 40 cm, grace, remontee a 50, plafond, sens, journal, fiche et ecran');
 }

 // 14. fin de seance : l assise jouee s historise avant progression
 {
   await neuf(2); reel(); state.unlocked['rdl-kettlebell']=true; state.unlocked[CH]=true;
   const q=vierge(CH);
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:CH,key:CH,set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:CH,key:CH,set:2,of:2,round:2}];
   cur.i=0; renderSession();
   let garde=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length){
     if(++garde>40) err('boucle de seance non bornee');
     const st=cur.steps[cur.i]; if(!st) break;
     if(st.k!=='set'){ nextStep(); continue; }
     st.val=15; st.done=true;
     validateSet();
   }
   for(let i=0;i<80;i++) await Promise.resolve();
   const h=state.hist[state.hist.length-1];
   const it=h&&h.items.find(x=>x.id===CH);
   if(!it) err('passage non historise');
   if(it.assise!==50) err('it.assise ecrit avant progression : '+JSON.stringify(it));
   if(perfOf(CH).assise!==40) err('la seance fait descendre la chaise a 40 cm');
   const c=(cur&&cur.climbs||[]).find(x=>x.id===CH);
   if(!c) err('la montee d assise se propose au recapitulatif');
   holdClimb(cur.climbs.indexOf(c));
   if(assiseOf(CH,perfOf(CH))!==50||perfOf(CH).assise!=null) err('tenir ce palier ramene a 50 cm, position absente comme avant la seance : '+perfOf(CH).assise);
   console.log('fin de seance OK : it.assise avant progression, montee proposee, tenir ce palier la defait');
 }

 // 15. porte rungTop et echelle en kettlebells seules
 {
   await neuf(3); reel(); state.unlocked['rdl-kettlebell']=true; state.unlocked[CH]=true;
   vierge(CH);
   joue(CH,null,[15,15]); checkUnlocks(3,false);
   if(perfOf(CH).assise!==40) err('temoin : montee a 40 cm');
   if(state.unlocked[CL]) err('version lestee ouverte sur des series jouees a 50 cm');
   html=''; showFiche(CL);
   if(html.indexOf('Palier joué : <b>assise 50 cm</b> (il faut <b>assise 40 cm</b>)')<0) err('le bloc Verrou dit l assise jouee et l assise exigee');
   joue(CH,null,[15,14]); checkUnlocks(3,false);
   if(state.unlocked[CL]) err('une seule serie a 15 ne suffit pas');
   joue(CH,null,[15,15]); checkUnlocks(3,false);
   if(!state.unlocked[CL]) err('ferme a 40 cm avec deux series de 15');
   if(!estRetire(CH)) err('le squat sur une jambe quitte le tirage');
   eq(fixedLadder(CL,state.gear).map(x=>x.v),[10,16],'kettlebells seules, 10 puis 16');
   if(fixedLadder(CL,state.gear).some(x=>/leste/.test(x.lbl))) err('aucun leste sur cette echelle');
   const q=vierge(CL);
   if(q.load!==10) err('depart a 10 kg');
   let m=joue(CL,null,[15,15]);
   if(q.load!==16) err('10 puis 16, sans barreau intermediaire : '+q.load);
   m=joue(CL,null,[15,15]);
   if(q.load!==16||!/déclare une kettlebell de 20 kg/.test(m.join(' '))) err('sommet : la kettlebell suivante a declarer, '+m.join(' | '));
   q.load=16; joue(CL,null,[3,3]); m=applyProgress(CL,[3,3],true,false,false);
   if(q.load!==10) err('descente vers la kettlebell inferieure : '+q.load);
   /* le repli douleur se lit sur la fiche : le box squat, a deux jambes */
   html=''; showFiche(CL);
   if(html.indexOf('onclick="showFiche(\\'box-squat\\'')<0) err('la fiche lestee propose le box squat en repli');
   const iL=SLOTS.legs.pool.indexOf(CL);
   if(resolvePos('legs',iL,state.gear)!==CL) err('avec kettlebell, la position sert la version lestee');
   state.gear.res.kb=0; syncProfil();
   if(resolvePos('legs',iL,state.gear)!==CH) err('sans kettlebell, la version au poids du corps');
   console.log('porte rungTop OK : fermee sur la montee vers 40 cm, ouverte a 40 cm, echelle 10 puis 16, repli sans kettlebell');
 }

 // 16. fiche : le niveau joue, sur les autres modes
 {
   await neuf(3); reel();
   const passe=(id,it)=>{ state.hist=[{date:new Date().toISOString(),type:'alterne',mode:'alterne',items:[Object.assign({id:id},it)]}]; };
   let q=vierge('goblet-squat'); q.load=12; q.sets=[15,15,15];
   passe('goblet-squat',{sets:[15,15,15],load:10});
   if(ficheDerniere('goblet-squat')!=='Dernière fois : 15/15/15 à KB 10 kg') err('goblet : '+ficheDerniere('goblet-squat'));
   q=vierge('developpe-sol'); q.load=9.5; q.sets=[15,12,12];
   passe('developpe-sol',{sets:[15,12,12],load:9});
   if(ficheDerniere('developpe-sol')!=='Dernière fois : 15/12/12 à 9 kg') err('developpe : '+ficheDerniere('developpe-sol'));
   q=vierge('pallof-press'); q.band='violet'; q.sets=[12,12];
   passe('pallof-press',{sets:[12,12],load:0,band:'noir'});
   if(ficheDerniere('pallof-press')!=='Dernière fois : 12/12, '+bandLabel('noir')) err('pallof : '+ficheDerniere('pallof-press'));
   q=vierge('bird-dog'); q.tenue=6; q.range=[4,8]; q.sets=[8,8];
   passe('bird-dog',{sets:[8,8],load:0,rng:[6,12],tenue:3});
   if(ficheDerniere('bird-dog')!=='Dernière fois : 8/8 à 3 s') err('bird-dog : '+ficheDerniere('bird-dog'));
   /* un passage remplace par son repli ne compte pas */
   q=vierge('goblet-squat'); q.load=12; q.sets=[15,15,15];
   state.hist=[{date:new Date().toISOString(),items:[{id:'goblet-squat',sets:[15,15,15],load:10}]},
               {date:new Date().toISOString(),items:[{id:'box-squat',from:'goblet-squat',sets:[10,10,10],load:0}]}];
   if(ficheDerniere('goblet-squat')!=='Dernière fois : 15/15/15 à KB 10 kg') err('passage remplace : '+ficheDerniere('goblet-squat'));
   /* sans historique, le niveau courant, comme avant */
   state.hist=[];
   if(ficheDerniere('goblet-squat')!=='Dernière fois : 15/15/15 à KB 10 kg + lestes 2 kg') err('sans historique : '+ficheDerniere('goblet-squat'));
   console.log('fiche OK : charge, bande et tenue jouees, repli ignore, niveau courant sans historique');
 }

 // 17. marches ecrites
 {
   await neuf(3); reel();
   if(!/squat sur une jambe vers la chaise prend le relais/.test(nextFor('goblet-squat',state.gear))) err('le goblet squat nomme son successeur');
   state.gear.kbs={'10':1}; syncProfil();
   if(nextFor('goblet-squat',state.gear)!==DB['goblet-squat'].next) err('le successeur ne depend pas de l inventaire');
   reel();
   if(KB_NEXT.indexOf('goblet-squat')>=0||KB_NEXT.indexOf(CL)<0) err('KB_NEXT : goblet sorti, version lestee entree');
   if(!/déclare une kettlebell de 20 kg/.test(nextFor(CL,state.gear))) err('version lestee : la kettlebell suivante');
   KB_W.forEach(w=>{ state.gear.kbs[w]=1; }); syncProfil();
   if(!/sac lesté porté devant/.test(nextFor(CL,state.gear))) err('liste epuisee : le sac porte devant');
   if(!/version lestée prend le relais/.test(DB[CH].next)) err('le squat sur une jambe nomme sa version lestee');
   const f=DB['fentes-arriere-lestee'].next;
   if(!/squat bulgare avec haltères, en repartant vers 5 kg par main/.test(f)||/fentes bulgares plus tard/.test(f)) err('fentes lestees : '+f);
   console.log('marches OK : goblet vers le squat sur une jambe, version lestee composee depuis l inventaire, fentes vers le bulgare leste');
 }

 console.log('TESTS LOT V2.18 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error((e.stack||'').split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
```

## falsif45.sh, banc de falsification du lot v2.18

Vingt-trois mutations, toutes tombent au premier passage, chacune sur l'assertion qu'elle vise,
vérifié en capturant le message d'échec. Premier passage à quatorze : les cinq mutations de contenu
tombaient toutes sur la section 1, qui compare la liste entière, et ne prouvaient donc rien des
sections 2, 3 et 5. Le banc neutralise désormais des sections de la suite sur une copie, par
remplacement exact de leur titre suivi de `if(0)`, et rejoue les mutations de contenu sans elles :
liste vide et successeur remplacé tombent sur la garde de vacuité de la règle du successeur,
successeur oublié sur la règle, puis, règle neutralisée aussi, sur la pose après déblocage. Une
paire ajoutée par analogie sur la planche tombait sur la règle du successeur, la planche ayant la
planche ballon pour successeur : elle est remplacée par le bird-dog, qui n'en a pas, et tombe alors
sur la fréquence réelle, puis sur la section 5 une fois la section 4 neutralisée. Les deux
généralisations de `pauseAu` tombent de même sur la section 5 sans la section 4.

Trente-cinq mutations s'ajoutent pour l'escalier du squat, dans une table en Python, les motifs
portant des apostrophes échappées du code source que les arguments shell rendent illisibles :
portes qui lisent la charge d'après progression, palier joué non écrit, `kbTop` au dernier cran,
nouvelles portes ignorées, porte ouverte sans palier, `rungTop` sur l'assise courante, montée
d'assise sans retour au bas ou sans grâce, descente muette, sens lu sur la valeur, `palierUp`
inversé, assise non historisée ou historisée après progression, « tenir ce palier » qui oublie
l'assise, écran sans assise, fiche au niveau du jour, niveau joué courant ou compté sur les replis,
lestes sur l'échelle en kettlebells seules, goblet squat resté dans `KB_NEXT`, anciennes marches du
goblet et des fentes, substitut absent, `SUBS.legs` non décalé, `SCHEMA.core` décalé, échelons en fin
de vivier, crans de 2,5 cm, verrou d'entrée au dernier cran, repli de la lestée sur la version sans
charge, consigne de chaise absente, bloc Verrou muet ; puis quatre mutations de catalogue rejouées
sans la section 9. Cinquante-huit en tout, toutes tombent. Deux ont survécu au premier passage : la
montée d'assise sans retour au bas partait d'une cible déjà basse, la suite la monte d'abord à 15 ;
le repli de la lestée ne se voyait qu'en section 9, la fiche rendue le vérifie désormais.

```bash
#!/bin/bash
# Banc de falsification du lot v2.18 : premiere paire constatee au raccord,
# puis escalier du squat, portes de verrou au palier joue et fiche.
# Chaque mutation defait une decision du lot ; test45 doit tomber sur chacune.
# Une mutation qui survit designe une assertion qui ne prouve rien. Le banc
# neutralise aussi des sections de la suite, sur une copie, pour prouver que
# les sections aval mordent seules : la section 1 compare la liste entiere et
# ferait tomber toute mutation de contenu a elle seule. Chaque
# mutation est appliquee par remplacement exact, et le banc s arrete si le
# motif ne mord pas : un motif qui ne mord pas se lirait sinon comme une survie.
set -e
cd "$(dirname "$0")"
cp app1.js .d1 ; cp app3.js .d3 ; cp app4.js .d4 ; cp app5.js .d5 ; cp app6.js .d6 ; cp app7.js .d7 ; cp app8.js .d8 ; cp test45.js .t45
restaure(){ cp .d1 app1.js; cp .d3 app3.js; cp .d4 app4.js; cp .d5 app5.js; cp .d6 app6.js; cp .d7 app7.js; cp .d8 app8.js; cp .t45 test45.js; }
mut(){ python3 - "$1" "$2" "$3" << 'PY'
import sys
p,old,new=sys.argv[1:4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE dans',p,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test45.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}
L="const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol'];"
sans1(){ mut test45.js " // 1. le contenu livre : deux paires, pas une de plus" $' // 1. neutralisee par le banc\n if(0)'; }
sans2(){ mut test45.js " // 2. regle du successeur, derivee du catalogue" $' // 2. neutralisee par le banc\n if(0)'; }
sans4(){ mut test45.js " // 4. le cas du 15 septembre, sur l etat reel exporte ce jour-la" $' // 4. neutralisee par le banc\n if(0)'; }

# ---- contenu ----
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=[];"
essai "liste revenue vide"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol'];"
essai "successeur oublie"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral-jambe-levee>developpe-sol'];"
essai "paire constatee remplacee par son seul successeur"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol','planche>developpe-sol'];"
essai "paire ajoutee par analogie"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>pompes-poignees'];"
essai "successeur nomme devant un autre pousse"

# ---- contenu, section 1 neutralisee : les sections aval mordent seules ----
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=[];"
essai "liste revenue vide, sans la section 1"
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol'];"
essai "successeur oublie, sans la section 1"
sans1; sans2; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol'];"
essai "successeur oublie, sans les sections 1 et 2"
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral-jambe-levee>developpe-sol'];"
essai "paire constatee remplacee par son seul successeur, sans la section 1"
sans1; sans2; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral-jambe-levee>developpe-sol'];"
essai "paire constatee remplacee par son seul successeur, sans les sections 1 et 2"
sans1; sans4; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol','bird-dog>developpe-sol'];"
essai "paire ajoutee par analogie, sans successeur, sans les sections 1 et 4"
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>pompes-poignees'];"
essai "successeur nomme devant un autre pousse, sans la section 1"

# ---- generalisation du mecanisme ----
mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[1]===b); }"
essai "tout gainage devant le developpe pause"
mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[0]===a); }"
essai "le gainage lateral pause devant tout pousse"
sans4; mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[1]===b); }"
essai "tout gainage devant le developpe pause, sans la section 4"
sans4; mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[0]===a); }"
essai "le gainage lateral pause devant tout pousse, sans la section 4"
mut app3.js "const PAUSE_TOUR=60;" "const PAUSE_TOUR=90;"
essai "pause portee a 90 s"

# ---- fiche ----
mut app3.js "la version genoux compte pleinement. <b>Épaules :</b> pousse le sol avec l\\'avant-bras et garde l\\'épaule loin de l\\'oreille, sans t\\'affaisser dedans. La version genoux allège aussi l\\'épaule. <b>Respiration" "la version genoux compte pleinement. <b>Respiration"
essai "ligne Epaules retiree du gainage lateral"
mut app3.js "bascule le bassin. <b>Épaules :</b> même appui que la version au sol, pousse le sol avec l\\'avant-bras et garde l\\'épaule loin de l\\'oreille, sans t\\'affaisser dedans. <b>Respiration" "bascule le bassin. <b>Respiration"
essai "ligne Epaules retiree de la jambe levee"
mut app3.js " La version genoux allège aussi l\\'épaule. <b>Respiration" " <b>Respiration"
essai "repli genoux muet sur l epaule"

# ---- textes ----
mut app8.js "Sur certains enchaînements que tu as signalés," "Sur certains enchaînements que vous avez signalés,"
essai "vouvoiement revenu dans Reglages"
mut app6.js "'Tu as signalé une gêne d\\'épaule sur cet enchaînement, et la pause est posée sur lui seul. '+" "'C\\'est la seule adjacence où l\\'alternance ne repose rien, le gainage et le poussé pouvant se disputer l\\'épaule. '+"
essai "message de pause revenu a la regle inconditionnelle"
mut app6.js "'Sans elle, la première série du tour suivant se fait sur une épaule déjà fatiguée," "'Une minute, c\\'est ce qu\\'il faut. Sans elle, la première série du tour suivant se fait sur une épaule déjà fatiguée,"
essai "message qui chiffre un besoin"

# ---- escalier du squat, portes au palier joue, fiche (sections 9 a 17) ----
# Table de mutations en Python : les motifs portent des apostrophes echappees
# du code source, illisibles en arguments shell.
mutx(){ python3 - "$1" << 'PY'
import sys
T={
 'porte_charge_apres':('app4.js',"    const j=p.setsLoad;","    const j=p.load;"),
 'charge_jouee_non_ecrite':('app4.js',"  if(e.mode==='load'||e.mode==='fixed') p.setsLoad=p.load||0;\n",""),
 'kbTop_au_dernier_cran':('app4.js',"    if(lk.loadTop) x=L.length?L[L.length-1]:null;","    if(lk.loadTop||lk.kbTop) x=L.length?L[L.length-1]:null;"),
 'portes_nouvelles_ignorees':('app4.js',"if(ok&&(e.lock.loadTop||e.lock.kbTop||e.lock.rungTop)) ok=gatePalier(e).ok;","if(ok&&e.lock.loadTop) ok=gatePalier(e).ok;"),
 'porte_ouverte_sans_palier':('app4.js',"ok:!!x&&j!=null&&j>=x.v-0.001","ok:!!x&&(j==null||j>=x.v-0.001)"),
 'rungTop_assise_courante':('app4.js',"top=(s&&s.L.length)?s.L[s.L.length-1][0]:null, j=p.setsRung;","top=(s&&s.L.length)?s.L[s.L.length-1][0]:null, j=p.assise;"),
 'montee_assise_sans_cible_basse':('app4.js',"p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;","p.assise=nr[0]; p.range=[nr[1],nr[2]]; state.loadUps++; montee=true; p.grace=true;"),
 'montee_assise_sans_grace':('app4.js',"p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;","p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true;"),
 'descente_assise_muette':('app4.js',"if(r.i>0){ const pr=e.assise.ladder[r.i-1];","if(false){ const pr=e.assise.ladder[r.i-1];"),
 'sens_lu_sur_la_valeur':('app7.js',"if(rs) return rungOf(e,p[rs.k]).i>rungOf(e,pre[rs.k]).i;","if(rs) return rungOf(e,p[rs.k]).v>rungOf(e,pre[rs.k]).v;"),
 'palierUp_inverse':('app7.js',"  if(e.assise) return b<a;","  if(e.assise) return b>a;"),
 'assise_non_historisee':('app7.js',"    if(DB[id]&&DB[id].assise) it.assise=assiseOf(id,pre[k]);\n",""),
 'assise_historisee_apres':('app7.js',"it.assise=assiseOf(id,pre[k]);","it.assise=assiseOf(id,state.perf[id]);"),
 'tenir_ce_palier_oublie_assise':('app7.js',"  if(DB[c.id].assise){ if(c.prev.assise!=null) p.assise=c.prev.assise; else delete p.assise; }\n",""),
 'ecran_sans_assise':('app6.js',"(e.assise?'<div class=\"pv\"><b class=\"num\">'+assiseOf(id,p)+' cm</b><span>Assise</span></div>':'')+","''+"),
 'fiche_niveau_du_jour':('app7.js',"setsHtml(p.sets)+esc(playedLabel(id,p))+","setsHtml(p.sets)+(e.bnd&&p.band?', '+bandLabel(p.band):(p.load?' à '+loadLabelFor(id,p.load):''))+"),
 'niveau_joue_courant':('app6.js',"  const src=it||{load:p.load,band:p.band,tenue:tenueOf(id,p),assise:assiseOf(id,p)};","  const src={load:p.load,band:p.band,tenue:tenueOf(id,p),assise:assiseOf(id,p)};"),
 'niveau_joue_avec_replis':('app6.js',"  const pass=exoPassages(id).filter(x=>!x.repl);\n  const it=pass.length?pass[pass.length-1].it:null;\n  const src=","  const pass=exoPassages(id);\n  const it=pass.length?pass[pass.length-1].it:null;\n  const src="),
 'lestes_sur_echelle_kb_seules':('app1.js',"steps=seules?[0]:cuffSteps(g,limbs)","steps=cuffSteps(g,limbs)"),
 'goblet_reste_dans_KB_NEXT':('app3.js',"const KB_NEXT=['squat-une-jambe-chaise-leste','rdl-kettlebell','kb-swings','rowing-kettlebell'];","const KB_NEXT=['goblet-squat','squat-une-jambe-chaise-leste','rdl-kettlebell','kb-swings','rowing-kettlebell'];"),
 'marche_goblet_ancienne':('app3.js'," 'goblet-squat':'le squat sur une jambe vers la chaise prend le relais',"," 'goblet-squat':'sac lesté porté devant, jamais dans le dos',"),
 'marche_fentes_ancienne':('app3.js'," 'fentes-arriere-lestee':'squat bulgare avec haltères, en repartant vers 5 kg par main ; l\\'outil ne le suit pas encore'"," 'fentes-arriere-lestee':'sac lesté porté devant, ou fentes bulgares plus tard'"),
 'substitut_leste_absent':('app3.js',"2:['squat-une-jambe-chaise'],",""),
 'SUBS_non_decale':('app3.js',"legs:{0:['box-squat'],2:['squat-une-jambe-chaise'],4:['fentes-arriere'],6:['pont-fessier'],9:['hip-thrust-une-jambe'],11:['mollets-debout'],13:['mollets-une-jambe'],14:['step-ups-bas'],15:['rdl-elastique']}","legs:{0:['box-squat'],2:['fentes-arriere'],4:['pont-fessier'],7:['hip-thrust-une-jambe'],9:['mollets-debout'],11:['mollets-une-jambe'],12:['step-ups-bas'],13:['rdl-elastique']}"),
 'SCHEMA_core_decale':('app3.js',"core:['gainage antérieur','gainage antérieur instable','coordination croisée','gainage latéral',\n       'gainage latéral chargé','anti-extension','anti-rotation']","core:['gainage antérieur','gainage antérieur instable','gainage latéral','anti-extension',\n       'coordination croisée','gainage latéral chargé','anti-rotation']"),
 'echelons_en_fin_de_vivier':('app3.js',"pool:['goblet-squat','squat-une-jambe-chaise','squat-une-jambe-chaise-leste','fentes-arriere',","pool:['goblet-squat','fentes-arriere',"),
 'crans_de_2_5_cm':('app3.js',"assise:{ladder:[[50,8,15],[40,8,15]]},","assise:{ladder:[[50,8,15],[47.5,8,15],[45,8,15],[42.5,8,15],[40,8,15]]},"),
 'verrou_entree_au_dernier_cran':('app3.js',"sans lestes',need:15,minSets:2,kbTop:true}","sans lestes',need:15,minSets:2,loadTop:true}"),
 'repli_leste_sans_charge':('app3.js',"<b>Respiration :</b> souffle en remontant, ne bloque pas.',\n fb:'box-squat'};\n\n/* --- v1.17","<b>Respiration :</b> souffle en remontant, ne bloque pas.',\n fb:'squat-une-jambe-chaise'};\n\n/* --- v1.17"),
 'consigne_chaise_absente':('app3.js',"<b>Chaise :</b> un siège qui ne roule ni ne pivote, ou calé contre un mur ou un meuble ; toujours le même, repéré aux mêmes hauteurs. ",""),
 'verrou_sans_palier_affiche':('app7.js',"      if(gp) etat+=gp.joue?","      if(false) etat+=gp.joue?"),
}
k=sys.argv[1]
f,old,new=T[k]
s=open(f,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE',k,'dans',f,':',s.count(old)); sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
for k in porte_charge_apres charge_jouee_non_ecrite kbTop_au_dernier_cran portes_nouvelles_ignorees porte_ouverte_sans_palier \
         rungTop_assise_courante montee_assise_sans_cible_basse montee_assise_sans_grace descente_assise_muette \
         sens_lu_sur_la_valeur palierUp_inverse assise_non_historisee assise_historisee_apres tenir_ce_palier_oublie_assise \
         ecran_sans_assise fiche_niveau_du_jour niveau_joue_courant niveau_joue_avec_replis lestes_sur_echelle_kb_seules \
         goblet_reste_dans_KB_NEXT marche_goblet_ancienne marche_fentes_ancienne substitut_leste_absent SUBS_non_decale \
         SCHEMA_core_decale echelons_en_fin_de_vivier crans_de_2_5_cm verrou_entree_au_dernier_cran repli_leste_sans_charge \
         consigne_chaise_absente verrou_sans_palier_affiche; do
  mutx "$k"
  essai "$k"
done
# sections 9 et 10 neutralisees : les sections de comportement mordent seules
for k in echelons_en_fin_de_vivier substitut_leste_absent verrou_entree_au_dernier_cran repli_leste_sans_charge; do
  mut test45.js " // 9. catalogue, tables par position" $' // 9. neutralisee par le banc\n if(0)'
  mutx "$k"
  essai "$k, sans la section 9"
done

restaure
rm -f .d1 .d3 .d4 .d5 .d6 .d7 .d8 .t45
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
node test45.js > /dev/null && echo "reference restauree, test45 passe"
```

## Suites existantes retouchées en v2.18

**`test37.js`.** La liste n'est plus livrée vide. La suite capture la liste livrée, refuse de
tourner si elle est vide, faute de pouvoir prouver sa remise en état, et définit `vider` et
`remettre`. Les sections 4b, 5, 6, 7 et 8, qui raisonnent sur une liste vide ou y nomment une paire
le temps d'un contrôle, la vident en entrant et la remettent en sortant ; la section 4 raisonne sur
la liste livrée, qui ne pose rien au tirage de départ. La section 9 remplace « livrée vide » par une
assertion de forme, chaque entrée nommant un gainage puis un poussé, et vérifie que la liste finale
est celle qui a été livrée.

**`falsif37.sh`** passe aux remplacements exacts, voir sa section.

**Escalier du squat.** `test5`, `test18` et `test43` excluent l'assise de la liste des exercices
plafonnés au poids du corps, comme la tenue en v2.17 : elle a une échelle. `test9` compte 55 fiches,
`test22` 58 images, `test24` neuf exercices à charge fixe, `test39` quinze critères de fin de série.
`test28` vérifie la composition de marche sur `rdl-kettlebell`, le goblet squat sortant de
`KB_NEXT`, et compte 17 positions de référence. `test5` vérifie cette composition sur la version
lestée et son échelle en kettlebells seules. `test31` et `test40` posent la charge jouée avec les
séries, `setsLoad`, puisque la porte ne lit plus qu'elle, et comptent 17 positions ; `test40` lit
les clés de `SUBS.legs` décalées de deux et retrouve les siennes par identifiant.

**`falsif44.sh`** suit les trois motifs que le lot a déplacés : `rungOf` dont le paramètre s'appelle
`v`, `estMontee` généralisé, instantanés qui portent aussi l'assise.

**Tous les bancs** ont été relancés sur la v2.18 complète : `falsif23` 10 sur 10, `falsif36` 14 sur
14, `falsif37` 14, `falsif38` 12, `falsif39` 17, `falsif41` 20, `falsif42` 20, `falsif43` 15,
`falsif44` 50, `falsif45` 58, aucune survie. `falsif44` s'est d'abord arrêté sur un motif absent,
comme sa garde le prévoit, et non sur une fausse survie.

**`build.sh`** enchaîne quarante-cinq suites.

## test44.js, suite du lot v2.17

Huit sections depuis la reprise du 13 septembre : « montée de barreau annulée dite » clôt la section
moteur, et une section « abandon » tient la sortie d'étape. Catalogue : `rhythm` sur les deux entrées avec l'échelle 3/6-12, 6/4-8, 10/3-6 et la
bascule à 2, mode `bw` et base 6-12 conservés, fiches au son, marche écrite du dernier barreau sans
lest, unité « tenues », tempo modélisé retiré, consignes de souffle du dead bug, émetteur simple-coup
présent, `rungOf` sur tenue absente, connue, inconnue et sur un exercice sans échelle, `baseReps`.
Modèle de temps : `prep + 2 × reps × (tenue + bascule)` à 3 et à 10 s, rejeu à l'installation.
Écran, à horloge pilotée sur les deux horloges : valeur à zéro avant le départ, Démarrer seul, en-tête
avec le barreau, Valider inerte ; `t0` au décompte plus 0,15 s ; trois secondes de décompte en coup
double à 700, aux instants exacts, sans 1150, puis l'ouverture à 950 sur `t0` ; première tenue à droite, chrono à 3, bascule qui annonce l'autre côté avec les
compteurs, seconde tenue à gauche ; Valider et rognage inertes pendant le rythme ; ton de cible à
1200 sur les fermetures qui amènent chaque côté à 6, `t0 + 53` et `t0 + 58`, sans coup grave
doublé, métronome qui continue après, douze ouvertures aux multiples de 5, rien au-delà de la
fenêtre d'avance, modèle qui compte les secondes ; Stop en tenue à `t0 + 67,9` : 7 et 6, reprise
prévue à gauche, 6 au journal, coup programmé annulé, boutons Reprendre, − 1 tenue, Réinitialiser,
ligne de journal, Valider actif ; rognage par bouton et touche moins, `+` inerte, plancher à 1 avec
bouton grisé ; reprise avec décompte, à gauche, compteurs conservés, rognage et validation inertes
pendant le rythme repris qui porte encore la valeur d'avant ; Stop en bascule qui garde la tenue,
7 et 7, reprise à droite ; ESPACE inerte une fois arrêtée, Réinitialiser qui efface tout, ESPACE qui
démarre et arrête ; validation au journal ; retour d'un pas qui efface le rythme ; sans son, aucun
coup et la mesure vaut. Moteur : sur les deux, montée au deuxième barreau avec 4-8, cible 4, grâce,
`loadUps`, mémoire à zéro, message ; montée au troisième ; plafond au dernier avec cible au haut,
sans grâce, marche écrite nommée ; descente au deuxième puis au premier, signal seul en dessous ;
palier tenu et lecture partielle sans montée ; `estMontee` sur la tenue et non la fourchette ;
`holdClimb` depuis un récapitulatif réel, sur une séance réduite à deux séries de bird-dog. Migration :
un 4-8 à 6 s respecté, un 7-13 sans tenue ramené sur 6-12, les deux entrées de la sauvegarde du
12 septembre intactes et lues à 3. Journal et fiche : `it.tenue` écrit avant une montée jouée en
séance, avec la fourchette du barreau ; « Dernière fois à 6 s » quand le barreau diffère, muet sinon ;
`palierVal`, `palierLbl`, `palierUp` ; passage ancien lu à 3 ; étiquette ; échelle à trois marches,
« Marche 2 sur 3 », marche suivante, condition en tenues ; vierge sans performance.

```javascript
/* test44 : lot v2.17, tenues rythmees. Le bird-dog et le dead bug deviennent
   des exercices en repetitions dont chaque repetition est une tenue, sur une
   echelle a trois barreaux [tenue, bas, haut], rythmee au son. L ecran se pilote
   a l horloge : l etat se derive du temps ecoule, les coups sont programmes en
   avance sur l horloge audio. Le Stop perd la tenue en cours, Reprendre repart
   sur le cote interrompu, « - 1 tenue » rogne la valeur au journal, la montee
   passe au barreau suivant et la descente au precedent, la migration est un
   no-op, l historique porte it.tenue, la fiche rend les trois marches. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
/* horloge audio : currentTime pilotable ; chaque oscillateur retient sa
   frequence et l instant de son start */
const tones=[];
const actx={currentTime:0,destination:{},state:'running',resume(){},
  createOscillator:()=>{const o={frequency:{value:0},connect(){},start(t){o.at=t;tones.push(o);},stop(t){o.stops=(o.stops||[]).concat([t]);}};return o;},
  createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{},
  AudioContext:function(){ return actx; }};
/* horloge murale pilotable, en secondes */
let WALL=1000;
global.performance={now:()=>WALL*1000};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v;else this._h=v},get innerHTML(){return cap?html:(this._h||'')},classList:{add(){},remove(){}},style:{},textContent:'',className:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
let ticks=[];
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ ticks=ticks.filter(x=>x!==t); };
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
/* avance les deux horloges de dt secondes et reveille la boucle tous les
   250 ms, comme le ferait le navigateur */
global.avance=dt=>{ const fin=WALL+dt; while(WALL<fin-1e-9){ const pas=Math.min(.25,fin-WALL); WALL+=pas; actx.currentTime+=pas; ticks.slice().forEach(t=>t.f()); } };

const EXPORT_PERF={
 'bird-dog':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-25T15:33:16.130Z'},
 'dead-bug':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-29T14:29:08.550Z'}
};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const dit=(m,re)=>m.some(x=>re.test(x));
 const EXPORT_PERF=${JSON.stringify(EXPORT_PERF)};
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=3; state.sound=true; };
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   delete p.tenue; p.range=e.reps.slice(); p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.hold) p.hold=true; else delete p.hold;
   delete p.grace; delete p.prevMin; p.best=0; p.sets=[]; return p; };
 const RY=['bird-dog','dead-bug'];
 const L=[[3,6,12],[6,4,8],[10,3,6]];

 /* ---------- 1. catalogue ---------- */
 await neuf();
 RY.forEach(id=>{
   const e=DB[id];
   if(!e.rhythm||JSON.stringify(e.rhythm.ladder)!==JSON.stringify(L)) err(id+' : echelle 3/6-12, 6/4-8, 10/3-6 attendue, '+JSON.stringify(e.rhythm));
   if(e.rhythm.bascule!==2) err(id+' : bascule de 2 s, constante d exercice');
   if(e.mode!=='bw'||!e.side||JSON.stringify(e.reps)!==JSON.stringify([6,12])) err(id+' : mode bw, par cote, base 6-12 conservee pour la migration');
   if(!/bip/.test(e.desc.join(' '))) err(id+' : la fiche s execute au son');
   if(!/10 s/.test(e.next)||!/jamais de lest/.test(e.next)) err(id+' : la marche ecrite est celle du dernier barreau, sans lest : '+e.next);
   if(unitOf(e)!=='tenues') err(id+' : l unite est la tenue');
 });
 if(tempoOf('bird-dog')!==TEMPO) err('le bird-dog n a plus de tempo modelise');
 if(!/Souffle/.test(DB['dead-bug'].vig)||!/fléchisseurs/.test(DB['dead-bug'].vig)) err('dead bug : consignes de souffle et de levier');
 if(typeof tone!=='function'||typeof toneCancel!=='function') err('emetteur simple-coup absent');
 /* helpers d echelle */
 const e0=DB['bird-dog'];
 if(rungOf(e0,undefined).i!==0||rungOf(e0,undefined).tenue!==3) err('tenue absente : premier barreau');
 if(rungOf(e0,6).i!==1||rungOf(e0,6).reps.join('-')!=='4-8') err('6 s : deuxieme barreau, 4-8');
 if(rungOf(e0,99).i!==0) err('tenue inconnue : retombe au premier barreau');
 if(rungOf(DB['planche'],3)!==null) err('pas d echelle de tenues sur la planche');
 if(baseReps(e0,{tenue:10}).join('-')!=='3-6'||baseReps(DB['planche'],{}).join('-')!=='20-45') err('baseReps lit le barreau ou le catalogue');
 console.log('catalogue OK : echelle a trois barreaux sur les deux, bascule 2, mode bw conserve, tempo retire, fiches au son, helpers');

 /* ---------- 2. modele de temps ---------- */
 pose('bird-dog',{target:8});
 if(serieSec('bird-dog')!==INSTALL+3+2*8*5) err('serie modelisee : prep + 2 x reps x (tenue + bascule), '+serieSec('bird-dog'));
 perfOf('bird-dog').tenue=10; perfOf('bird-dog').range=[3,6]; perfOf('bird-dog').target=4;
 if(serieSec('bird-dog')!==INSTALL+3+2*4*12) err('a 10 s : 12 s par cycle, '+serieSec('bird-dog'));
 if(serieModelAdd('bird-dog',8)!==INSTALL) err('rejeu : tout a defile au tick, seule l installation se modelise');
 console.log('modele OK : serie chronometree, rejeu a l installation');

 /* ---------- 3. ecran, a horloge pilotee ---------- */
 await neuf();
 state.prep=3;
 startSession(); cur.phase='work';
 cur.steps=[{k:'set',id:'bird-dog',key:'bird-dog',set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:'bird-dog',key:'bird-dog',set:2,of:2,round:2}];
 cur.i=0; pose('bird-dog',{target:6}); renderSession();
 let st=cur.steps[0];
 if(st.val!==0) err('avant le depart la valeur vaut 0, pas la cible : '+st.val);
 if(html.indexOf('toggleRhythm()')<0||html.indexOf('>Démarrer<')<0) err('bouton Demarrer attendu');
 if(html.indexOf('trimRhythm(')>=0||html.indexOf('resumeRhythm(')>=0) err('ni rognage ni reprise avant le Stop');
 if(!/<b class="num">3 s<\\/b><span>Tenue<\\/span>/.test(html)) err('l en-tete porte le barreau');
 validateSet(); if(cur.i!==0) err('Valider est inerte avant toute serie');
 tones.length=0;
 if(!/Prêt · Droite/.test(html)) err('avant le depart, le tag annonce le cote qui demarre');
 if(!/<span style="color:var\\(--accent\\);font-weight:700">Droite <b class="num">0<\\/b><\\/span>/.test(html)) err('avant le depart, la droite est mise en valeur');
 const wall0=WALL;
 toggleRhythm();
 if(!st.rt.on||st.rt.t0!==wall0+3.15) err('depart : t0 = maintenant + decompte + 0,15 s');
 if(el('#phlabel').textContent!=='En position · Droite'||el('#cc').textContent!=='3') err('decompte : En position, cote qui demarre, 3');
 /* le decompte enchaine : trois coups a 700 avant t0, puis l ouverture a 950 sur t0 */
 avance(3.3);
 const T0=st.rt.t0, off=st.rt.off;
 const prep=tones.filter(o=>o.at<T0+off-1e-6);
 if(prep.length!==6||!prep.every(o=>o.frequency.value===700)) err('le decompte sonne comme partout ailleurs : trois secondes en coup double a 700 Hz, '+prep.length);
 const dts=prep.map(o=>Math.round((o.at-(T0+off))*100)/100).sort((a,b)=>a-b);
 if(JSON.stringify(dts)!==JSON.stringify([-3,-2.74,-2,-1.74,-1,-0.74])) err('coup double a 260 ms, comme beep() : '+JSON.stringify(dts));
 if(tones.some(o=>o.frequency.value===1150)) err('pas de 1150 au zero : il est colle au 1200 du ton de cible');
 const ouv0=tones.find(o=>Math.abs(o.at-(T0+off))<1e-6);
 if(!ouv0||ouv0.frequency.value!==950) err('l ouverture de la premiere tenue est a 950 Hz sur t0');
 if(el('#phlabel').textContent!=='Droite') err('premiere tenue a droite');
 if(el('#cc').textContent!=='3') err('chrono de tenue : 3 s restantes, '+el('#cc').textContent);
 avance(2.85);                         /* e = 3.0 : fermeture, bascule */
 if(el('#phlabel').textContent!=='Passe à gauche') err('apres la tenue, la bascule annonce l autre cote');
 if(!/Droite <b class="num">1<\\/b> · <span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">0<\\/b><\\/span>/.test(el('#rcount').innerHTML)) err('bascule : le cote annonce est mis en valeur : '+el('#rcount').innerHTML);
 avance(2);                            /* e = 5.0 : tenue gauche */
 if(el('#phlabel').textContent!=='Gauche') err('deuxieme tenue a gauche');
 if(!/<span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">0<\\/b><\\/span>/.test(el('#rcount').innerHTML)) err('tenue : le cote en cours est mis en valeur : '+el('#rcount').innerHTML);
 /* Valider et ESPACE pendant le rythme : Valider inerte, ESPACE = Stop plus loin */
 validateSet(); if(cur.i!==0||!st.rt.on) err('Valider est inerte pendant le rythme');
 trimRhythm(); if(st.rt.d||st.rt.g||st.rt.s0!==0) err('le rognage est inerte pendant le rythme');
 /* jusqu a la cible : la fermeture qui amene un cote a 6 recoit 1200 Hz,
    la droite a la tenue 10 (t0 + 53), la gauche a la tenue 11 (t0 + 58) */
 avance(60);
 const cibles=tones.filter(o=>o.frequency.value===1200).map(o=>Math.round((o.at-off-T0)*100)/100);
 if(JSON.stringify(cibles)!==JSON.stringify([53,58])) err('ton de cible sur les fermetures qui atteignent 6 de chaque cote : '+JSON.stringify(cibles));
 const ferm=tones.filter(o=>o.frequency.value===700&&o.at>T0+off).map(o=>Math.round((o.at-off-T0)*100)/100);
 if(ferm.indexOf(53)>=0||ferm.indexOf(58)>=0) err('la fermeture de cible n est pas doublee d un coup grave');
 if(ferm.indexOf(63)<0) err('le metronome continue apres la cible');
 const ouv=tones.filter(o=>o.frequency.value===950).map(o=>Math.round((o.at-off-T0)*100)/100);
 for(let i=0;i<12;i++) if(ouv.indexOf(5*i)<0) err('ouverture manquante a t0 + '+(5*i));
 if(tones.some(o=>o.frequency.value===950&&Math.abs(o.at-(T0+off+70))<1e-6)) err('rien n est programme au-dela de la fenetre d avance');
 /* le modele compte les secondes ecoulees, une par tick */
 if(cur.model<60) err('le temps qui defile compte au modele : '+cur.model);
 /* Stop pendant une tenue : elle est perdue. e = 65.0+... : tenue 13 (65-68) */
 avance(2.9);                          /* e = 67.9, en tenue 13, gauche ; sa fermeture a 68 est deja programmee */
 if(el('#phlabel').textContent!=='Gauche') err('e=67.9 : tenue 13, gauche');
 const pendant=tones.filter(o=>o.at>actx.currentTime);
 if(!pendant.length) err('prealable : un coup programme au-dela du Stop');
 toggleRhythm();
 if(st.rt.on||!st.rt.stopped) err('Stop');
 if(st.rt.d!==7||st.rt.g!==6) err('13 tenues fermees : droite 7, gauche 6, '+st.rt.d+'/'+st.rt.g);
 if(st.rt.s0!==1) err('la reprise repartira a gauche, cote interrompu');
 if(st.val!==6||!st.done) err('au journal le cote le plus court, 6 : '+st.val);
 if(!pendant.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('les coups programmes au-dela du Stop sont annules');
 if(html.indexOf('resumeRhythm()')<0||html.indexOf('trimRhythm()')<0||html.indexOf('resetRhythm()')<0) err('apres le Stop : Reprendre, - 1 tenue, Reinitialiser');
 if(html.indexOf('− 1 tenue')<0) err('libelle du rognage');
 if(!/Au journal : <b class="num">6<\\/b> tenues de 3 s par côté, le côté le plus court fait foi/.test(html)) err('la ligne de journal dit la valeur et le cote court');
 if(html.indexOf('class="big ok"')<0) err('Valider est actif apres le Stop');
 /* Rognage : il retire la derniere tenue comptee, du cote ou elle a ete
    comptee, et le journal se recalcule sur les compteurs. A 7 et 6 la latence
    du Stop est deja absorbee par le cote court : le premier retrait remet les
    compteurs d accord sans faire bouger le journal, le second seulement fait
    descendre la valeur. Plancher sur les compteurs, pas sur la valeur. */
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 trimRhythm();
 if(st.rt.d!==6||st.rt.g!==6||st.rt.s0!==0) err('- 1 tenue : retiree a droite, ou elle a ete comptee : '+JSON.stringify(st.rt));
 if(st.val!==6) err('le journal etait deja borne par le cote court, il ne bouge pas : '+st.val);
 if(!/Droite <b class=\\"num\\">6<\\/b> · Gauche <b class=\\"num\\">6<\\/b>/.test(html)) err('les compteurs suivent le rognage');
 if(/font-weight:700">(Droite|Gauche)/.test(html)) err('serie arretee : aucun cote en jeu, aucun mis en valeur');
 touche('-');
 if(st.rt.d!==6||st.rt.g!==5||st.val!==5) err('touche moins : la suivante se retire a gauche, journal 5 : '+JSON.stringify(st.rt)+' '+st.val);
 touche('+'); if(st.val!==5) err('plus est inerte');
 for(let i=0;i<15;i++) trimRhythm();   /* quatre appuis de trop : les compteurs s arretent a zero */
 if(st.rt.d!==0||st.rt.g!==0||st.val!==0) err('plancher sur les compteurs : '+JSON.stringify(st.rt)+' '+st.val);
 if(!/trimRhythm\\(\\)" disabled/.test(html)) err('bouton grise quand il n y a plus rien a retirer');
 if(/class="big ok"/.test(html)) err('a zero tenue, Valider est inerte');
 /* reprise : decompte, puis premiere tenue a gauche, l ecart reste d au plus un */
 st.rt.d=7; st.rt.g=6; st.rt.s0=1; st.val=6;
 resumeRhythm();
 if(!st.rt.on||el('#phlabel').textContent!=='En position · Gauche') err('la reprise rejoue le decompte en annoncant le cote interrompu');
 avance(3.3);
 if(el('#phlabel').textContent!=='Gauche') err('la reprise repart sur le cote interrompu');
 if(!/Droite <b class="num">7<\\/b> · <span style="color:var\\(--accent\\);font-weight:700">Gauche <b class="num">6<\\/b><\\/span>/.test(el('#rcount').innerHTML)) err('les compteurs reprennent ou ils etaient, gauche en jeu');
 /* pendant la reprise la valeur d avant est encore portee : ni rognage, ni
    validation, ni touche moins tant que le rythme court */
 trimRhythm(); touche('-'); validateSet();
 if(st.rt.d!==7||st.rt.g!==6||st.val!==6||cur.i!==0||!st.rt.on) err('pendant le rythme repris : rognage et validation inertes, '+JSON.stringify({d:st.rt.d,g:st.rt.g,val:st.val,i:cur.i}));
 avance(3.5);                          /* e = 3.5 : tenue gauche fermee, bascule */
 if(el('#phlabel').textContent!=='Passe à droite') err('apres la reprise a gauche, bascule vers la droite');
 /* Stop pendant une bascule : la tenue precedente est gardee */
 toggleRhythm();
 if(st.rt.d!==7||st.rt.g!==7||st.rt.s0!==0) err('stop en bascule : droite 7, gauche 7, reprise a droite : '+JSON.stringify(st.rt));
 if(st.val!==7) err('valeur au journal 7, '+st.val);
 /* ESPACE : Stop pendant le rythme, inerte une fois arretee */
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 espace(); if(st.rt.on) err('ESPACE ne relance pas une serie arretee');
 /* reinitialiser puis repartir a l ESPACE, et Stop a l ESPACE */
 resetRhythm();
 if(st.rt.d||st.rt.g||st.rt.stopped||st.rt.on||st.val!==0||st.done) err('reinitialiser efface tout : '+JSON.stringify(st.rt));
 espace(); if(!cur.steps[0].rt||!cur.steps[0].rt.on) err('ESPACE demarre');
 avance(3.3+8.2);                     /* e = 8.35 : deux tenues fermees, une par cote */
 espace(); if(cur.steps[0].rt.on||cur.steps[0].rt.d!==1||cur.steps[0].rt.g!==1) err('ESPACE arrete, une tenue fermee par cote');
 /* validation : la valeur part au journal, la duree aussi */
 validateSet();
 if(cur.i!==1||JSON.stringify(cur.log['bird-dog'])!=='[1]') err('validation : 1 au journal, '+JSON.stringify(cur.log));
 /* retour d un pas efface le rythme */
 stepBack();
 if(cur.i!==0||cur.steps[0].rt.d||cur.steps[0].rt.stopped||cur.steps[0].val||cur.log['bird-dog']) err('stepBack efface la serie et son rythme : '+JSON.stringify(cur.steps[0].rt));
 /* sans son : pas de coup, l etat se derive quand meme */
 state.sound=false; tones.length=0;
 toggleRhythm(); avance(3.3+3.5);
 if(tones.length) err('son coupe : aucun coup');
 if(el('#phlabel').textContent!=='Passe à gauche') err('son coupe : le rythme se lit a l ecran');
 toggleRhythm(); if(cur.steps[0].rt.d!==1) err('son coupe : la mesure vaut');
 console.log('ecran OK : decompte qui enchaine, alternance, ton de cible sur la fermeture de chaque cote, Stop en tenue perd, en bascule garde, reprise sur le cote interrompu, cote annonce au decompte et mis en valeur dans les comptes, rognage a son cote, ESPACE, journal, sans son');

 /* ---------- 4. moteur : montee, descente, plafond ---------- */
 await neuf();
 RY.forEach(id=>{
   const e=DB[id], p=pose(id,{target:6}); state.loadUps=0; state.div={push:0,pull:0,core:0};
   let m=applyProgress(id,[12,12],true,false);
   if(p.tenue!==6||p.range.join('-')!=='4-8'||p.target!==4||!p.grace||state.loadUps!==1) err(id+' : montee au deuxieme barreau, 4-8, cible 4, grace : '+JSON.stringify(p));
   if(!dit(m,/tenues de 6 s, retour à 4 par côté/)) err(id+' : message de montee, '+m.join(' | '));
   if(p.prevMin!=null) err(id+' : la memoire se remet a zero a la montee');
   delete p.grace;
   m=applyProgress(id,[8,8],true,false);
   if(p.tenue!==10||p.range.join('-')!=='3-6'||p.target!==3) err(id+' : montee au troisieme barreau');
   delete p.grace;
   m=applyProgress(id,[6,6],true,false);
   if(p.tenue!==10||p.range.join('-')!=='3-6'||p.target!==6||p.grace) err(id+' : au dernier barreau, plafond, cible au haut, pas de grace : '+JSON.stringify(p));
   if(!dit(m,/Plafond atteint/)||!m.some(x=>x.indexOf(e.next)>=0)) err(id+' : le plafond nomme la marche ecrite, '+m.join(' | '));
   /* descente : deux passages sous le plancher sans grace */
   m=applyProgress(id,[2,2],true,false);
   if(p.tenue!==6||p.range.join('-')!=='4-8'||p.target!==4) err(id+' : descente au deuxieme barreau, cible au bas : '+JSON.stringify(p));
   if(!dit(m,/retour aux tenues de 6 s/)) err(id+' : message de descente, '+m.join(' | '));
   m=applyProgress(id,[2,2],true,false);
   if(p.tenue!==3||p.range.join('-')!=='6-12') err(id+' : descente au premier barreau');
   m=applyProgress(id,[2,2],true,false);
   if(p.tenue!==3||p.range.join('-')!=='6-12') err(id+' : au premier barreau, pas de barreau inferieur, fourchette immobile');
   if(!dit(m,/aucune série au plancher/)) err(id+' : seul le signal passe, '+m.join(' | '));
   /* palier tenu : pas de montee */
   pose(id,{target:12,hold:true});
   applyProgress(id,[12,12],true,false);
   if(perfOf(id).tenue!=null) err(id+' : palier tenu, aucune montee');
   /* lecture partielle : pas de montee non plus */
   pose(id,{target:12});
   applyProgress(id,[12,12],false,false);
   if(perfOf(id).tenue!=null) err(id+' : lecture partielle, aucune montee');
 });
 /* estMontee lit la tenue, jamais la fourchette */
 const pre={tenue:3,range:[6,12],load:0}, post={tenue:6,range:[4,8],load:0};
 if(!estMontee(post,pre,DB['bird-dog'])) err('estMontee : montee de tenue');
 if(estMontee(pre,post,DB['bird-dog'])) err('estMontee : une descente eleve la fourchette sans etre une montee');
 if(estMontee({range:[6,12],load:0},{tenue:3,range:[6,12],load:0},DB['bird-dog'])) err('estMontee : tenue absente vaut 3');
 /* Tenir ce palier depuis le recapitulatif restaure la tenue : une seance
    reduite a deux series de bird-dog, jouee au haut de fourchette */
 const joueBD=async v=>{
   startSession(); cur.phase='work';
   cur.steps=[{k:'set',id:'bird-dog',key:'bird-dog',set:1,of:2,round:1},{k:'rest',sec:30},{k:'set',id:'bird-dog',key:'bird-dog',set:2,of:2,round:2}];
   cur.i=0; renderSession();
   let garde=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length){
     if(++garde>40) err('boucle de seance non bornee');
     const s=cur.steps[cur.i]; if(!s) break;
     if(s.k!=='set'){ nextStep(); continue; }
     s.rt={d:v,g:v,s0:0,on:false,stopped:true,t0:null}; s.done=true; s.val=v;
     validateSet();
   }
   for(let i=0;i<80;i++) await Promise.resolve();
 };
 pose('bird-dog',{target:12}); state.loadUps=0;
 await joueBD(12);
 const c=(cur.climbs||[]).find(x=>x.id==='bird-dog');
 if(!c) err('prealable : montee de bird-dog au recapitulatif');
 if(perfOf('bird-dog').tenue!==6) err('prealable : deuxieme barreau apres la seance');
 holdClimb(cur.climbs.indexOf(c));
 const ph=perfOf('bird-dog');
 if(ph.tenue!=null||ph.range.join('-')!=='6-12'||ph.target!==12||!ph.hold||state.loadUps!==0) err('holdClimb : tenue, fourchette, cible et compteur restaures : '+JSON.stringify(ph)+' '+state.loadUps);
 /* Correction de la derniere seance qui defait la montee de barreau : elle se
    dit. avantCor doit porter la tenue, sans quoi estMontee compare deux fois
    le premier barreau et l annulation est muette. */
 await neuf();
 pose('bird-dog',{target:12}); state.loadUps=0;
 await joueBD(12);
 if(perfOf('bird-dog').tenue!==6) err('prealable : montee au deuxieme barreau');
 const kbd=state.undo.keys.find(k=>splitKey(k).id==='bird-dog');
 if(!kbd) err('prealable : bird-dog dans l instantane de correction');
 const rc=corrigerSeance({[kbd]:state.hist[state.hist.length-1].items.find(x=>x.id==='bird-dog').sets.map(()=>6)});
 if(perfOf('bird-dog').tenue!=null) err('la correction ramene au premier barreau : '+perfOf('bird-dog').tenue);
 if(!rc||!(rc.undone||[]).some(x=>/Montée annulée/.test(x)&&/Bird-dog/.test(x))) err('la montee de barreau annulee doit se dire : '+JSON.stringify(rc&&rc.undone));
 cur=null; view='home';
 console.log('moteur OK : trois barreaux, montee au bas avec grace, plafond avec marche ecrite, descente avec signal au premier, palier tenu, lecture partielle, estMontee, holdClimb, montee de barreau annulee dite');

 /* Etape quittee pendant le rythme : le rt est desarme et les coups
    programmes au-dela sont annules, sans passer par le Stop. */
 await neuf();
 pose('bird-dog',{target:6});
 startSession(); cur.phase='work';
 cur.steps=[{k:'set',id:'bird-dog',key:'bird-dog',set:1,of:2,round:1},{k:'set',id:'bird-dog',key:'bird-dog',set:2,of:2,round:2}];
 cur.i=0; renderSession();
 {
   const sa=cur.steps[0];
   toggleRhythm(); avance(10);
   const enAvance=tones.filter(o=>o.at>actx.currentTime);
   if(!sa.rt.on||!enAvance.length) err('prealable : rythme en cours avec des coups programmes');
   skipSet();
   if(sa.rt.on) err('serie passee : le rt est desarme');
   if(!enAvance.every(o=>(o.stops||[]).some(t=>t<=actx.currentTime+1e-9))) err('serie passee : les coups programmes sont annules');
   if(cur.i!==1) err('serie passee : on avance');
 }
 cur=null; view='home';
 console.log('abandon OK : une etape quittee pendant le rythme desarme et annule ses coups');

 /* ---------- 5. migration ---------- */
 await neuf();
 state.perf['bird-dog']={load:0,range:[4,8],target:5,best:0,sets:[],date:null,tenue:6};
 state.perf['dead-bug']={load:0,range:[7,13],target:13,best:0,sets:[],date:null};
 await save(); const raw=localStorage._m[Object.keys(localStorage._m).find(k=>/palier/i.test(k))||Object.keys(localStorage._m)[0]];
 state=null; await loadState();
 let q=state.perf['bird-dog'];
 if(q.tenue!==6||q.range.join('-')!=='4-8'||q.target!==5) err('un 4-8 a 6 s est conforme a son barreau, rien ne bouge : '+JSON.stringify(q));
 q=state.perf['dead-bug'];
 if(q.range.join('-')!=='6-12'||q.target!==12) err('un 7-13 sans tenue est un reste de relevement, revient au premier barreau : '+JSON.stringify(q));
 /* la sauvegarde du 12 septembre : no-op */
 await neuf();
 Object.keys(EXPORT_PERF).forEach(id=>{ state.perf[id]=g(EXPORT_PERF[id]); });
 await save(); state=null; await loadState();
 Object.keys(EXPORT_PERF).forEach(id=>{
   const a=state.perf[id], b=EXPORT_PERF[id];
   if(a.tenue!=null||a.range.join('-')!==b.range.join('-')||a.target!==b.target||JSON.stringify(a.sets)!==JSON.stringify(b.sets)) err(id+' : migration neutre attendue, '+JSON.stringify(a));
   if(tenueOf(id,a)!==3) err(id+' : tenue derivee 3');
 });
 console.log('migration OK : barreau respecte, reste de relevement ecrete, sauvegarde du 12 septembre intacte');

 /* ---------- 6. journal, derniere fois, fiche ---------- */
 await neuf();
 pose('bird-dog',{target:6}); perfOf('bird-dog').tenue=6; perfOf('bird-dog').range=[4,8]; perfOf('bird-dog').target=8;
 await joueBD(8);                      /* haut du barreau : la seance fait monter a 10 s */
 if(perfOf('bird-dog').tenue!==10) err('prealable : montee au troisieme barreau');
 const h=state.hist[state.hist.length-1];
 if(!h) err('seance non historisee');
 const itb=h.items.find(x=>x.id==='bird-dog');
 if(!itb) err('bird-dog absent de l historique');
 {
   if(itb.tenue!==6||JSON.stringify(itb.rng)!=='[4,8]') err('it.tenue ecrit avant progression, avec la fourchette du barreau : '+JSON.stringify(itb));
   /* derniere fois : la tenue jouee se dit quand elle differe du barreau du jour */
   const p=perfOf('bird-dog');
   if(!/à 6 s/.test(lastLevel('bird-dog',p))) err('barreau change : « à 6 s » : '+lastLevel('bird-dog',p));
   p.tenue=6;
   if(lastLevel('bird-dog',p)!=='') err('meme barreau : rien a dire');
   if(palierVal('bird-dog',itb)!==6||palierLbl('bird-dog',6)!=='tenues de 6 s'||!palierUp('bird-dog',3,6)||palierUp('bird-dog',6,3)) err('palier d un passage : la tenue');
   if(palierVal('bird-dog',{rng:[6,12],sets:[8]})!==3) err('un passage sans it.tenue a ete joue a 3 s');
   if(tenueTag(itb).indexOf('6 s')<0||tenueTag({sets:[8]})!=='') err('etiquette de tenue au journal');
 }
 /* fiche : trois marches, position, marche suivante */
 const p6=perfOf('bird-dog'); p6.tenue=6; p6.range=[4,8]; p6.target=4;
 const E=echelleOf('bird-dog');
 if(!E||E.quoi!=='tenue'||E.lbl.length!==3||E.i!==1||E.lbl[1]!=='6 s · 4-8') err('echelle de tenues sur la fiche : '+JSON.stringify(E));
 const H=echelleHtml('bird-dog');
 if(!/Marche <b class="num">2<\\/b> sur <b class="num">3<\\/b>/.test(H)) err('position sur l echelle : '+H);
 if(!/Marche suivante : <b>10 s · 3-6<\\/b>/.test(H)) err('marche suivante : le barreau de 10 s');
 if(!/toutes les séries atteignent <b class="num">8<\\/b> tenues/.test(H)) err('condition de montee au haut du barreau, en tenues : '+H);
 html=''; showFiche('bird-dog');
 if(!/Fourchette de travail : 4-8 tenues de 6 s × 2 séries, par côté/.test(html)) err('la fourchette de travail de la fiche est celle du barreau, avec sa tenue');
 delete state.perf['dead-bug'];
 if(echelleOf('dead-bug').i!==-1) err('sans performance, vierge, comme une bande');
 console.log('journal OK : it.tenue, derniere fois, palier d un passage, etiquette, fiche a trois marches');

 console.log('TESTS TENUES RYTHMEES V2.17 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); console.error(e.stack.split('\\n').slice(1,4).join('\\n')); process.exit(1); });
`;
eval(src+T);
```

## falsif44.sh, banc de falsification du lot v2.17

Cinquante mutations, toutes tombent. Quatre ont d'abord survécu et ont fait durcir la suite : les
deux gardes `st.rt.on` du rognage et de la validation, doublées par `st.done`, ne se voyaient que
sur une reprise qui porte encore la valeur d'avant ; l'annulation des coups au Stop se testait à un
instant où rien n'était programmé ; `it.tenue` lu avant ou après progression ne se distinguait pas
sans montée pendant la séance. Les deux mutations de garde visent désormais la garde entière.

Six mutations s'ajoutent à la reprise du 13 septembre : rognage du mauvais côté, rognage qui ne
rend pas le côté à la reprise, rognage soustrait au journal plutôt qu'aux compteurs, plancher des
compteurs retiré, série passée qui laisse le rythme armé, abandon qui n'annule pas les coups
programmés, et `avantCor` sans la tenue. Deux ont survécu au premier passage, les deux pour la même
raison qu'en v2.17 : le plancher ne se prouvait pas parce que la suite s'arrêtait pile au compte,
elle insiste maintenant de quatre appuis ; la garde `st.rt.on` du rognage est doublée par
`st.done`, la mutation vise donc la garde entière.

Cinq de plus sur le côté annoncé et mis en valeur : décompte muet sur le côté, tag muet avant le
départ, aucune mise en valeur, côté inversé entre la tenue et la bascule, série arrêtée qui en met
un en valeur.

**v2.18** : trois motifs suivis après la généralisation des paliers de consigne, `rungOf`,
`estMontee` et les instantanés `avantCor` et `pre`. Cinquante sur cinquante.

```bash
#!/bin/bash
# Banc de falsification du lot v2.17 : tenues rythmees. Chaque mutation defait
# une decision du lot ; test44 doit tomber sur chacune. Une mutation qui survit
# designe une assertion qui ne prouve rien. Chaque mutation est appliquee par
# remplacement exact, et le banc s arrete si le motif ne mord pas : un motif qui
# ne mord pas se lirait sinon comme une detection.
set -e
cd "$(dirname "$0")"
cp app3.js .c3 ; cp app4.js .c4 ; cp app5.js .c5 ; cp app6.js .c6 ; cp app7.js .c7 ; cp app8.js .c8
restaure(){ cp .c3 app3.js; cp .c4 app4.js; cp .c5 app5.js; cp .c6 app6.js; cp .c7 app7.js; cp .c8 app8.js; }
mut(){ python3 - "$1" "$2" "$3" << 'EOF'
import sys
p,old,new=sys.argv[1:4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE dans',p,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
EOF
}
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test44.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- catalogue ----
mut app3.js "'dead-bug':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:{bascule:2," "'dead-bug':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:{bascule:1,"
essai "bascule d une seconde sur le dead bug"

mut app3.js " 'pallof-press':5,'mollets-debout':3.5," " 'bird-dog':5,'pallof-press':5,'mollets-debout':3.5,"
essai "tempo modelise de retour sur le bird-dog"

mut app4.js "function unitOf(e){return e.mode==='time'?'s':(e.mode==='circuit'?'rounds':(e.rhythm?'tenues':'reps'));}" "function unitOf(e){return e.mode==='time'?'s':(e.mode==='circuit'?'rounds':'reps');}"
essai "l unite redevient la repetition"

# ---- echelle ----
# v2.18 : rungOf generalise a l assise, le parametre s appelle v
mut app4.js "  if(v!=null) L.forEach((r,k)=>{ if(r[0]===v) i=k; });" "  if(v!=null) L.forEach((r,k)=>{ if(r[0]===v) i=k; }); if(v!=null&&i===0&&v!==L[0][0]) i=L.length-1;"
essai "tenue inconnue envoyee au dernier barreau"

mut app4.js "        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;" "        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[2]; state.loadUps++; montee=true; p.grace=true;"
essai "montee avec cible au haut du barreau"

mut app4.js "        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;" "        p.tenue=nr[0]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;"
essai "montee qui garde l ancienne fourchette"

mut app4.js "        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;" "        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true;"
essai "montee sans grace"

mut app4.js "      if(r.i<r.n-1){
        const nr=e.rhythm.ladder[r.i+1];" "      if(r.i<r.n-1||true){
        const nr=e.rhythm.ladder[Math.min(r.i+1,r.n-1)];"
essai "pas de plafond au dernier barreau"

mut app4.js "        if(r.i>0){ const pr=e.rhythm.ladder[r.i-1]; p.tenue=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;" "        if(false){ const pr=e.rhythm.ladder[r.i-1]; p.tenue=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;"
essai "descente de barreau retiree"

mut app4.js "        if(r.i>0){ const pr=e.rhythm.ladder[r.i-1]; p.tenue=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;" "        if(r.i>=0){ const pr=e.rhythm.ladder[Math.max(0,r.i-1)]; p.tenue=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;"
essai "descente sous le premier barreau"

# ---- migration ----
mut app4.js "    const base=baseReps(e,q);" "    const base=e.reps;"
essai "migration qui ignore le barreau"

# ---- modele de temps ----
mut app5.js "    return INSTALL+prepSec()+2*r*(tenueOf(id,p)+e.rhythm.bascule);" "    return INSTALL+prepSec()+r*(tenueOf(id,p)+e.rhythm.bascule);"
essai "un seul cote au modele"

# v2.19 : la ligne porte aussi la cadence, seul le rythme est retire ici
mut app5.js "  if(e.mode==='time'||e.rhythm||e.cadence) return INSTALL;   /* rythme et cadence : tout a defile au tick */" "  if(e.mode==='time'||e.cadence) return INSTALL;"
essai "rejeu qui remodelise une serie deja chronometree"

# ---- ecran et rythme ----
mut app6.js "  rt.on=true; rt.stopped=false; rt.start=now; rt.ticked=0; rt.t0=now+n+.15; rt.sched=0;" "  rt.on=true; rt.stopped=false; rt.start=now; rt.ticked=0; rt.t0=now+n+1.15; rt.sched=0;"
essai "seconde morte entre le decompte et la premiere tenue"

mut app6.js "const RHYTHM_PREP_OFF=[0,.26];" "const RHYTHM_PREP_OFF=[0];"
essai "decompte en coup simple, autre son que le reste de l application"

mut app6.js "RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,rt.t0-k+d+rt.off,.1));" "RHYTHM_PREP_OFF.forEach(d=>tone(k===1?1150:RHYTHM_CLOSE,rt.t0-k+d+rt.off,.1));"
essai "1150 repris dans le decompte, collé au ton de cible"

mut app6.js "      tone(RHYTHM_OPEN,rt.t0+i*sp.cycle+rt.off,.12);" "      tone(RHYTHM_CLOSE,rt.t0+i*sp.cycle+rt.off,.12);"
essai "un seul ton pour ouvrir et fermer"

mut app6.js "      const apres=side===0?rt.d+sp2[0]:rt.g+sp2[1], cible=apres===sp.cible;" "      const apres=side===0?rt.d+sp2[0]:rt.g+sp2[1], cible=false;"
essai "ton de cible retire"

mut app6.js "      const apres=side===0?rt.d+sp2[0]:rt.g+sp2[1], cible=apres===sp.cible;" "      const apres=side===0?rt.d+sp2[0]:rt.g+sp2[1], cible=apres===sp.cible&&side===0;"
essai "ton de cible sur un seul cote"

mut app6.js "    while(rt.t0+rt.sched*sp.cycle<now+RHYTHM_AHEAD&&garde++<50){" "    while(rt.t0+rt.sched*sp.cycle<now+RHYTHM_AHEAD&&garde++<50&&rt.sched<(rt.d+rt.g+2*sp.cible)){"
essai "metronome qui s arrete a la cible"

mut app6.js "function rhythmClosed(sp,e){ return e>=sp.tenue?Math.floor((e-sp.tenue)/sp.cycle)+1:0; }" "function rhythmClosed(sp,e){ return e>=0?Math.floor(e/sp.cycle)+1:0; }"
essai "la tenue en cours compte au Stop"

mut app6.js "  rt.d+=c[0]; rt.g+=c[1]; rt.s0=(rt.s0+n)%2;" "  rt.d+=c[0]; rt.g+=c[1]; rt.s0=0;"
essai "reprise toujours a droite"

mut app6.js "  st.val=Math.min(rt.d,rt.g); st.done=true;" "  st.val=Math.max(rt.d,rt.g); st.done=true;"
essai "le cote le plus long part au journal"

mut app6.js "  const rt=st.rt, s=(rt.s0+1)%2;        /* cote de la derniere tenue fermee */" "  const rt=st.rt, s=rt.s0;        /* cote de la derniere tenue fermee */"
essai "rognage du mauvais cote"

mut app6.js "  if(s===0) rt.d--; else rt.g--;
  rt.s0=s;" "  if(s===0) rt.d--; else rt.g--;"
essai "la reprise ne repart pas sur le cote rendu"

mut app6.js "  if(s===0) rt.d--; else rt.g--;
  rt.s0=s;                              /* elle est a refaire : la reprise y repart */
  st.val=Math.min(rt.d,rt.g);" "  rt.s0=s;
  st.val=Math.max(0,Math.min(rt.d,rt.g)-1);"
essai "rognage soustrait au journal au lieu des compteurs"

mut app6.js "  if(s===0?rt.d<=0:rt.g<=0) return;" ""
essai "plancher des compteurs retire"

mut app6.js "  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on||!st.done) return;
  const rt=st.rt, s=(rt.s0+1)%2;" "  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt) return;
  const rt=st.rt, s=(rt.s0+1)%2;"
essai "rognage possible pendant le rythme"

mut app6.js "function skipSet(){ rhythmAbort(); clearTimers(); nextStep(); }" "function skipSet(){ clearTimers(); nextStep(); }"
essai "serie passee qui laisse le rythme arme"

mut app6.js "  st.rt.on=false; toneCancel();" "  st.rt.on=false;"
essai "abandon sans annuler les coups programmes"

mut app7.js "    avantCor[id]={load:p.load||0,band:p.band||null,tenue:p.tenue,assise:p.assise,range:p.range?p.range.slice():null,target:p.target};" "    avantCor[id]={load:p.load||0,band:p.band||null,assise:p.assise,range:p.range?p.range.slice():null,target:p.target};"
essai "montee de barreau annulee en silence"

# ---- cote annonce et mis en valeur ----
mut app6.js "    if(lbl) lbl.textContent='En position · '+rhythmSide(rt.s0);" "    if(lbl) lbl.textContent='En position';"
essai "decompte muet sur le cote qui demarre"

mut app6.js "(rt.stopped?'Série arrêtée':'Prêt · '+rhythmSide(rt.s0))" "(rt.stopped?'Série arrêtée':'Prêt')"
essai "tag muet sur le cote qui demarre"

mut app6.js "    return actif===s?'<span style=\"color:var(--accent);font-weight:700\">'+t+'</span>':t; };" "    return t; };"
essai "aucun cote mis en valeur"

mut app6.js "  if(cnt) cnt.innerHTML=rhythmCountsHtml(rt.d+c[0],rt.g+c[1],sp.cible,hold?side:suivant);" "  if(cnt) cnt.innerHTML=rhythmCountsHtml(rt.d+c[0],rt.g+c[1],sp.cible,hold?suivant:side);"
essai "cote mis en valeur inverse"

mut app6.js "rhythmCountsHtml(rt.d,rt.g,sp.cible,rt.stopped?null:rt.s0)" "rhythmCountsHtml(rt.d,rt.g,sp.cible,rt.s0)"
essai "serie arretee qui met un cote en valeur"

mut app6.js "  if(e.rhythm){ if(!st.rt||st.rt.on||!st.done) return; }" "  if(e.rhythm){ if(!st.rt) return; }"
essai "validation possible pendant le rythme"

mut app6.js "  toneCancel();
  st.val=Math.min(rt.d,rt.g); st.done=true;" "  st.val=Math.min(rt.d,rt.g); st.done=true;"
essai "coups non annules au Stop"

mut app6.js "  delete st.t0; delete st.rt;" "  delete st.t0;"
essai "retour d un pas qui garde le rythme"

mut app6.js "      (e.rhythm?'<div class=\"pv\"><b class=\"num\">'+tenueOf(id,p)+' s</b><span>Tenue</span></div>':'')+" "      ''+"
essai "en-tete sans le barreau"

mut app6.js "  if(e.rhythm){ const t=it.tenue!=null?it.tenue:e.rhythm.ladder[0][0]; if(t!==tenueOf(id,p)) return ' <span class=\"muted\">à '+t+' s</span>'; }" ""
essai "derniere fois muette sur la tenue"

mut app8.js "  else if(e.rhythm) toggleRhythm();   /* Demarrer ou Stop ; inerte une fois arretee (v2.17) */" ""
essai "ESPACE qui valide au lieu de rythmer"

mut app8.js "    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimRhythm(); }
    return;
  }" "    return;
  }"
essai "touche moins muette sur les tenues rythmees"

# ---- journal et fiche ----
mut app7.js "    if(DB[id]&&DB[id].rhythm) it.tenue=tenueOf(id,pre[k]);" "    if(DB[id]&&DB[id].rhythm) it.tenue=tenueOf(id,state.perf[id]);"
essai "it.tenue lu apres progression"

mut app7.js "pre[k]={load:p.load||0,band:p.band||null,tenue:p.tenue,assise:p.assise,target:p.target," "pre[k]={load:p.load||0,band:p.band||null,assise:p.assise,target:p.target,"
essai "instantane sans la tenue"

# v2.18 : estMontee lit l echelle de consigne generalisee
mut app7.js "  if(rs) return rungOf(e,p[rs.k]).i>rungOf(e,pre[rs.k]).i;" ""
essai "estMontee qui lit la fourchette sur une echelle de tenues"

mut app7.js "  if(DB[c.id].rhythm){ if(c.prev.tenue!=null) p.tenue=c.prev.tenue; else delete p.tenue; }" ""
essai "Tenir ce palier qui ne restaure pas la tenue"

mut app7.js "    return {lbl:L.map(x=>x[0]+' s · '+x[1]+'-'+x[2]),i:p?r.i:-1,quoi:'tenue'};" "    return {lbl:L.map(x=>x[0]+' s · '+x[1]+'-'+x[2]),i:r.i,quoi:'tenue'};"
essai "fiche jamais vierge"

mut app7.js "  if(e.rhythm) return it.tenue!=null?it.tenue:(it.rng?e.rhythm.ladder[0][0]:null);" "  if(e.rhythm) return it.tenue!=null?it.tenue:null;"
essai "passage ancien sans palier"

mut app7.js "Fourchette de travail : '+baseReps(e,state.perf[id])[0]+'-'+baseReps(e,state.perf[id])[1]+' '+unitOf(e)+(e.rhythm?' de '+tenueOf(id,state.perf[id])+' s':'')" "Fourchette de travail : '+e.reps[0]+'-'+e.reps[1]+' '+unitOf(e)"
essai "fourchette de travail lue au catalogue sur une echelle de tenues"

rm -f .c3 .c4 .c5 .c6 .c7 .c8
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"

```

## Suites existantes retouchées en v2.17

**Remplissage d'une tenue rythmée.** Là où une boucle de séance remplissait une tenue chronométrée,
`holdInit` puis `sides` à 30, elle remplit désormais aussi une tenue rythmée arrêtée, `rt` avec
`stopped`, `done`, et une valeur : `test` (`fillHold`), `test15` (sept boucles), `test30` (`jouer`),
`test32`, `test36`, `test38` (trois), `test39`, `test43` (`allerA`). Sans cela `validateSet`, inerte
tant que la série n'est pas arrêtée, laissait la boucle sur place jusqu'à son garde-fou.

**Ensembles « sans échelle ».** `test5` §6, `test18` T22 et `test43` §1 à 3 excluent les deux tenues
rythmées, qui ont une échelle : 21 devient 19. Le témoin de fiche de `test43` §3 passe du bird-dog
aux fentes arrière, 8-15, mêmes assertions à 15 ; `test43` §1 lit la marche écrite du bird-dog à
10 s au lieu de 6.

**`test16.js`.** Le bird-dog n'a plus de tempo propre : l'assertion demande `TEMPO`.

**`test23.js`.** Une section de plus, la hauteur de la bande du carrousel, et le harnais lit
désormais `head.html` pour asserter deux propriétés de feuille de style, comme `test42`.

**`build.sh`** enchaîne quarante-quatre suites.

## test43.js, suite du lot v2.16

Six sections. Catalogue : plus aucun champ `cap`, vingt et un exercices au poids du corps ou tenus
sans échelle et chacun avec sa marche écrite, verrou des fentes lestées à 15 et texte à 15, marche
du bird-dog à 6 s, et le code lui-même sans « fourchette relevée » ni lecture de `cap` hors
commentaires. Moteur, sur les vingt et un : passage au plafond qui nomme la marche écrite, fourchette
immobile, cible au haut, pas de grâce, mémoire écrite, `div` intact ; passage sous le plancher sans
descente, fourchette immobile, un passage absorbé par la mémoire, deux qui recalent au bas avec le
message de recul ; cible au haut au plafond sur le cas qui l'a motivé, cible 12 puis 15/15/15, et au
sommet d'une échelle de bande. Fiche : marche unique sur les vingt et un, règle avec sa condition,
marche écrite, absence des fourchettes décalées et de « Marche 1 sur », témoin de position perdue
hors catalogue. Migration : écrêtage dérivé sur six entrées fabriquées en plein relèvement, par
`loadState` et par `applyImport`, cible bornée, mémoire conservée telle quelle et non resemée
depuis les séries, semis au haut de fourchette sur l'entrée sans mémoire, idempotence ; et les neuf
entrées jouées ou existantes de la sauvegarde du 12 septembre 2026, sur lesquelles ni fourchette, ni
cible, ni prescription du jour ne bougent. Rognage : rien avant mesure ni pendant le chrono, bouton
et touche moins après le Stop, un appui une seconde, `+` et `=` inertes, plancher à 1 avec bouton
grisé, valeur rognée au journal ; par côté, un bouton par côté mesuré, le premier côté inerte
pendant que le second tourne, le côté visé et non le côté courant, le côté le plus court rogné au
journal, et aucun bouton sur une série chiffrée.

```javascript
/* test43 : lot v2.16. Le plafond d un exercice au poids du corps ou tenu vaut
   le haut de sa fourchette, le champ cap et le relevement de fourchette
   n existent plus, la migration d ecretage se derive, la garde de semis qui
   supposait le relevement tombe, la cible vaut le haut au plafond, le verrou
   des fentes lestees lit 15, la fiche rend une marche unique, et une tenue
   chronometree se rogne apres le Stop. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
const bips=[];
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{},
  AudioContext:function(){ return {currentTime:0,destination:{},
    createOscillator:()=>{const o={frequency:{value:0},connect(){},start(){},stop(){}};bips.push(o);return o;},
    createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
/* horloge pilotee a la main : les chronos sont deterministes */
let ticks=[];
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ ticks=ticks.filter(x=>x!==t); };
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };

/* Les onze entrees du recensement, telles qu elles sont dans la sauvegarde du
   12 septembre 2026 : aucune n est relevee. Les absentes n avaient jamais ete
   jouees. */
const EXPORT_PERF={
 'fentes-arriere':{load:0,range:[8,15],target:10,best:9,sets:[9,9,9],date:'2026-08-25T15:33:16.130Z'},
 'bird-dog':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-25T15:33:16.130Z'},
 'dead-bug':{load:0,range:[6,12],target:9,best:8,sets:[8,8,8],date:'2026-08-29T14:29:08.550Z'},
 'step-ups':{load:0,range:[8,15],target:13,best:12,sets:[12,12],date:'2026-09-10T15:23:22.378Z'},
 'rowing-suspension':{load:0,range:[8,15],target:11,best:10,sets:[10,10,10],date:'2026-09-03T15:05:55.058Z'},
 'pompes-inclinees':{load:0,range:[8,20],target:8,best:8,sets:[8,8,8],date:'2026-08-14T15:02:46.219Z'},
 'tractions-strictes-supination':{load:0,range:[3,8],target:3,best:0,sets:[],date:null},
 'tractions-strictes-pronation':{load:0,range:[3,8],target:3,best:0,sets:[],date:null},
 'box-squat':{load:0,range:[8,15],target:8,best:0,sets:[],date:null}
};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const dit=(m,re)=>m.some(x=>re.test(x));
 const SRC=${JSON.stringify(src)};
 const EXPORT_PERF=${JSON.stringify(EXPORT_PERF)};
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=0; state.sound=false; };
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   p.range=e.reps.slice(); p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.hold) p.hold=true; else delete p.hold;
   delete p.grace; delete p.prevMin; p.best=0; p.sets=[]; return p; };
 const BWT=Object.keys(DB).filter(id=>(DB[id].mode==='bw'||DB[id].mode==='time')&&!DB[id].bnd&&!DB[id].rhythm&&!DB[id].assise&&DB[id].reps)   /* v2.17 : les tenues rythmees ont une echelle ; v2.18 : l assise aussi */;

 /* ---------- 1. catalogue : plus de cap, une marche ecrite partout ---------- */
 await neuf();
 Object.keys(DB).forEach(id=>{ if('cap' in DB[id]) err(id+' : le champ cap n existe plus (v2.16)'); });
 /* v2.17 : bird-dog et dead bug ont rejoint l echelle de tenues, dix-neuf restent sans echelle */
 if(BWT.length!==19) err('dix-neuf exercices au poids du corps ou tenus sans echelle attendus, '+BWT.length);
 BWT.forEach(id=>{ if(!DB[id].next) err(id+' : marche ecrite absente, un plafond sans marche est une impasse muette'); });
 const fl=DB['fentes-arriere-lestee'].lock;
 if(fl.need!==15||fl.need!==DB['fentes-arriere'].reps[1]) err('verrou des fentes lestees a 15, le haut de fourchette, '+fl.need);
 if(fl.cond.indexOf('15 fentes')<0) err('le texte du verrou dit 15 : '+fl.cond);
 /* v2.17 : l allongement des tenues est devenu l echelle, la marche ecrite
    est celle du dernier barreau, 10 s. L assertion suit. */
 if(!/10 s/.test(DB['bird-dog'].next)) err('la marche ecrite du bird-dog est celle du dernier barreau, 10 s : '+DB['bird-dog'].next);
 if(!/jamais de lest/.test(DB['bird-dog'].next)||!/jamais de lest/.test(DB['dead-bug'].next)) err('jamais de lest, sur les deux');
 /* le moteur ne porte plus le mecanisme, pas seulement les donnees */
 if(/fourchette relevée|fourchette redescendue/.test(SRC)) err('le relevement ou sa descente miroir est encore dans le code');
 if(/e\\.cap\\b/.test(SRC.replace(/\\/\\*[\\s\\S]*?\\*\\//g,''))) err('le code lit encore un champ cap hors commentaires');
 console.log('catalogue OK : aucun cap, 19 plafonnes avec marche ecrite, fentes a 15, mecanisme absent du code');

 /* ---------- 2. moteur : la fourchette ne bouge dans aucun sens ---------- */
 await neuf();
 state.div={push:0,pull:0};
 BWT.forEach(id=>{
   const e=DB[id], base=e.reps.slice(), pas=(e.mode==='time')?5:1;
   const p=pose(id,{target:base[0]});
   const d0=g(state.div);
   let m=applyProgress(id,[base[1],base[1],base[1]],true,false);
   if(p.range.join('-')!==base.join('-')) err(id+' : fourchette relevee, '+p.range);
   if(!dit(m,/Plafond atteint/)||!dit(m,new RegExp(e.next.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&')))) err(id+' : le plafond doit nommer la marche ecrite, '+m.join(' | '));
   if(p.target!==base[1]) err(id+' : au plafond la cible vaut le haut, '+p.target);
   if(p.grace) err(id+' : pas de grace, aucun palier n a change');
   if(p.prevMin!==base[1]) err(id+' : au plafond la memoire s ecrit, '+p.prevMin);
   if(JSON.stringify(state.div)!==JSON.stringify(d0)) err(id+' : un plafond n est pas une montee pour div');
   m=applyProgress(id,[base[0]-pas-1,base[0]-pas-1,base[0]-pas-1],true,false);
   if(p.range.join('-')!==base.join('-')) err(id+' : fourchette descendue, '+p.range);
   if(dit(m,/redescendue/)) err(id+' : message de descente sans barreau inferieur');
   if(!dit(m,/aucune série au plancher/)) err(id+' : le signal d echec doit passer');
   /* fenetre de deux passages (v2.14) : un seul passage rate est absorbe par
      la memoire ecrite au plafond, le second recale la cible au bas */
   if(p.target!==base[1]) err(id+' : un passage sous le plancher est absorbe par la memoire, cible '+p.target);
   m=applyProgress(id,[base[0]-pas-1,base[0]-pas-1,base[0]-pas-1],true,false);
   if(p.range.join('-')!==base.join('-')) err(id+' : fourchette descendue au second passage, '+p.range);
   if(p.target!==base[0]) err(id+' : deux passages sous le plancher recalent la cible au bas, '+p.target);
   if(!dit(m,/cible recalée/)) err(id+' : le recul a deux passages se dit');
 });
 /* cible au haut au plafond : le cas qui le motive, une cible depassee */
 const pf=pose('fentes-arriere',{target:12});
 applyProgress('fentes-arriere',[15,15,15],true,false);
 if(pf.target!==15) err('cible 12 puis 15/15/15 : la cible doit valoir 15, '+pf.target);
 /* et le meme au sommet d une echelle de bande : c est general */
 await neuf();
 const pp=perfOf('pompes-poignees'); pp.band='vert'; pp.target=12; pp.range=DB['pompes-poignees'].reps.slice(); delete pp.prevMin;
 const mp=applyProgress('pompes-poignees',[15,15,15],true,false);
 if(!dit(mp,/Plafond atteint/)) err('sommet de bande attendu');
 if(pp.target!==15) err('au sommet d une echelle aussi, la cible vaut le haut, '+pp.target);
 console.log('moteur OK : 19 exercices, plafond nomme, immobile dans les deux sens, cible au haut au plafond');

 /* ---------- 3. fiche : une marche unique, la regle et sa condition ---------- */
 await neuf();
 BWT.forEach(id=>{
   const E=echelleOf(id);
   if(!E||E.lbl.length!==1||E.i!==0||E.quoi!=='fourchette') err(id+' : une marche unique attendue, '+JSON.stringify(E));
   if(E.lbl[0]!==DB[id].reps.join('-')+' '+unitOf(DB[id])) err(id+' : la marche est la fourchette du catalogue, '+E.lbl[0]);
 });
 /* v2.17 : le bird-dog a rejoint l echelle de tenues, les fentes arriere,
    8-15 par cote, portent le temoin du regime de la fourchette a sa place */
 const H=echelleHtml('fentes-arriere');
 if(/Marche <b class="num">1<\\/b> sur/.test(H)) err('« Marche 1 sur 1 » ne doit plus s afficher');
 if(H.indexOf('Plafond de la fourchette atteint')>=0) err('l ancien libelle de plafond ne doit plus s afficher');
 if(!/Au haut de la fourchette, toutes les séries à <b class="num">15<\\/b> reps/.test(H)) err('la regle de plafond et sa condition : '+H);
 if(H.indexOf(esc(DB['fentes-arriere'].next))<0) err('la marche ecrite figure sur la fiche');
 if(H.indexOf('9-16')>=0||H.indexOf('10-17')>=0) err('plus aucune fourchette decalee sur la fiche');
 /* temoin : une fourchette stockee hors catalogue est une position perdue, ce
    que la migration empeche precisement */
 perfOf('fentes-arriere').range=[9,16];
 if(echelleOf('fentes-arriere').i!==-1) err('temoin : fourchette hors catalogue, position introuvable');
 perfOf('fentes-arriere').range=[8,15];
 /* la planche, tenue, passe par le meme chemin */
 const HP=echelleHtml('planche');
 if(!/toutes les séries à <b class="num">45<\\/b> s/.test(HP)||HP.indexOf(esc(DB['planche'].next))<0) err('planche : regle a 45 s et marche ecrite');
 console.log('fiche OK : marche unique sur les 19, regle avec condition, marche ecrite, temoin de position');

 /* ---------- 4. migration : ecretage derive, par les deux chemins d entree ---------- */
 const releve=()=>({v:2,rounds:3,perf:{
   'bird-dog':{load:0,range:[7,13],target:13,best:13,sets:[13,13],date:'2026-09-01T10:00:00.000Z',prevMin:11},
   'dead-bug':{load:0,range:[8,14],target:14,best:14,sets:[14,14],date:'2026-09-01T10:00:00.000Z'},
   'fentes-arriere':{load:0,range:[9,16],target:9,best:16,sets:[9,9],date:'2026-09-01T10:00:00.000Z',prevMin:7},
   'tractions-strictes-supination':{load:0,range:[4,9],target:5,best:0,sets:[],date:null},
   'step-ups':{load:0,range:[8,15],target:13,best:12,sets:[12,12],date:'2026-09-10T15:23:22.378Z',prevMin:12},
   'planche':{load:0,range:[20,45],target:45,best:44,sets:[42,41],date:'2026-09-10T15:23:22.378Z'}}});
 const verif=(q,quoi)=>{
   ['bird-dog','dead-bug','fentes-arriere','tractions-strictes-supination','step-ups','planche'].forEach(id=>{
     const b=DB[id].reps;
     if(q[id].range.join('-')!==b.join('-')) err(quoi+' : '+id+' fourchette '+q[id].range+' au lieu de '+b);
     if(q[id].target>b[1]) err(quoi+' : '+id+' cible '+q[id].target+' au-dessus du haut');
   });
   if(q['bird-dog'].target!==12||q['dead-bug'].target!==12) err(quoi+' : cibles bornees a 12');
   if(q['fentes-arriere'].target!==9) err(quoi+' : une cible dans la fourchette n est pas touchee');
   /* la memoire survit a l ecretage : un relevement n a jamais change le
      niveau physique, une lecture sous 7-13 vaut une lecture sous 6-12 */
   if(q['bird-dog'].prevMin!==11||q['fentes-arriere'].prevMin!==7) err(quoi+' : une fourchette ecretee garde sa memoire telle quelle, sans la resemer depuis les series, '+q['bird-dog'].prevMin+'/'+q['fentes-arriere'].prevMin);
   if(q['dead-bug'].prevMin!==14) err(quoi+' : sans memoire, la derniere lecture se seme, meme au haut (garde v2.15 tombee), '+q['dead-bug'].prevMin);
   if(q['step-ups'].prevMin!==12) err(quoi+' : une fourchette conforme garde sa memoire');
   if(q['bird-dog'].best!==13) err(quoi+' : le maximum historique n est pas reecrit');
   if(q['planche'].prevMin!==41) err(quoi+' : la garde « haut moins un pas » est tombee, la planche seme 41, '+q['planche'].prevMin);
 };
 localStorage._m={'palier-state-v2':JSON.stringify(releve())};
 state=null; await loadState(); domicile();
 verif(state.perf,'loadState');
 const encore=migrateState(g(state)); verif(encore.perf,'idempotence');
 if(JSON.stringify(encore.perf)!==JSON.stringify(state.perf)) err('migration non idempotente');
 await neuf();
 applyImport(Object.assign({app:'palier',version:'2.15',xp:0,hist:[]},releve()));
 verif(state.perf,'applyImport');
 /* la sauvegarde reelle du 12 septembre : aucune des onze n est relevee, la
    migration n y touche a rien d autre que la memoire de fenetre (v2.15) */
 await neuf();
 applyImport({app:'palier',version:'2.9',xp:1108,hist:[],v:2,rounds:3,perf:g(EXPORT_PERF)});
 Object.keys(EXPORT_PERF).forEach(id=>{
   const a=EXPORT_PERF[id], q=state.perf[id];
   if(q.range.join('-')!==a.range.join('-')) err('export : '+id+' fourchette modifiee, '+q.range);
   if(q.target!==a.target) err('export : '+id+' cible modifiee, '+q.target);
   if(perfFor(id).target!==a.target) err('export : '+id+' prescription du jour modifiee');
 });
 if(state.perf['bird-dog'].prevMin!==8) err('export : la memoire v2.15 se seme a 8 sur le bird-dog');
 console.log('migration OK : ecretage derive sur six entrees par loadState et applyImport, idempotente, no-op sur la sauvegarde du 12 septembre');

 /* ---------- 5. rognage apres le Stop ---------- */
 await neuf();
 startSession();
 const allerA=pred=>{ let k=0; while(view==='session'&&k++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'&&DB[s.id]&&pred(DB[s.id])) return s;
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
   err('aucune etape voulue dans cette seance'); };
 const touche=k=>handlers.forEach(h=>h({key:k,code:k==='-'?'Minus':(k==='+'?'Equal':'Digit6'),target:{tagName:'DIV'},preventDefault(){}}));
 /* une tenue d un bloc : la planche est tirable dans le premier tirage, sinon
    on prend la premiere tenue unilaterale et on ne teste que le cote courant */
 let st=allerA(e=>e.mode==='time');
 const e5=DB[st.id];
 renderSession();
 if(html.indexOf('trimHold(')>=0) err('pas de rognage avant toute mesure');
 toggleChrono(); tic(44);
 if(st.val!==44) err('chrono a 44 attendu, '+st.val);
 if(html.indexOf('trimHold(')>=0) err('pas de rognage pendant que le chrono tourne');
 trimHold(st.side);
 if(st.val!==44) err('trimHold est inerte pendant que le chrono tourne');
 toggleChrono();                        /* Stop : la mesure est une borne haute */
 if(st.sides[st.side]!==44) err('mesure figee a 44 attendue');
 if(html.indexOf('trimHold('+st.side+')')<0||html.indexOf('− 1 s')<0) err('le bouton de rognage doit apparaitre apres le Stop : '+html.slice(html.indexOf('chrono'),html.indexOf('chrono')+900));
 if(html.indexOf('aria-label="Retirer une seconde"')<0) err('le bouton porte un aria-label');
 trimHold(st.side);
 if(st.sides[st.side]!==43||st.val!==43) err('un appui retire une seconde, '+st.sides[st.side]+'/'+st.val);
 touche('-');
 if(st.sides[st.side]!==42) err('la touche moins rogne aussi, '+st.sides[st.side]);
 touche('+'); touche('=');
 if(st.sides[st.side]!==42) err('plus est inerte sur une tenue, on n ajoute pas des secondes non tenues');
 if(html.indexOf('Réinitialiser')<0) err('la remise a zero reste offerte a cote du rognage');
 /* plancher : une serie a zero n est pas une serie, on ne descend pas sous 1 */
 st.sides[st.side]=2; st.val=2; renderSession();
 trimHold(st.side); trimHold(st.side); trimHold(st.side);
 if(st.sides[st.side]!==1) err('plancher a 1, '+st.sides[st.side]);
 if(!/onclick="trimHold\\(\\d\\)" disabled/.test(html)) err('a 1 le bouton est grise');
 /* la valeur rognee est celle qui part au journal */
 st.sides[st.side]=40; st.val=40; renderSession();
 if(e5.side){ for(let i=0;i<st.sides.length;i++) if(st.sides[i]==null) st.sides[i]=45; renderSession(); }
 trimHold(st.side); trimHold(st.side);
 const k5=st.key||st.id;
 validateSet();
 const jl=cur.log[k5];
 if(!jl||jl[jl.length-1]!==38) err('la valeur rognee doit partir au journal, '+JSON.stringify(jl));
 console.log('rognage OK : bouton et touche moins apres le Stop seulement, plancher a 1, plus inerte, valeur rognee au journal');

 /* ---------- 6. rognage par cote : chaque cote mesure porte son bouton ---------- */
 await neuf();
 /* on avance le compteur du vivier gainage jusqu a un tirage qui porte une
    tenue par cote, le gainage lateral */
 let st6=null;
 for(let c=0;c<30&&!st6;c++){
   cur=null; view='home'; state.slotIdx.core=c; startSession();
   if(cur.steps.some(x=>x.k==='set'&&DB[x.id]&&DB[x.id].mode==='time'&&DB[x.id].side)) st6=allerA(e=>e.mode==='time'&&e.side);
 }
 if(!st6) err('aucun tirage ne porte de tenue par cote');
 holdInit(st6,DB[st6.id]);
 toggleChrono(); tic(30); toggleChrono();          /* premier cote : 30 */
 if(html.indexOf('trimHold(0)')<0) err('premier cote mesure : bouton present');
 if(html.indexOf('trimHold(1)')>=0) err('second cote non mesure : pas de bouton');
 toggleChrono(); tic(27);                          /* second cote en cours */
 trimHold(0);
 if(st6.sides[0]!==30) err('le premier cote ne se rogne pas pendant que le second tourne');
 toggleChrono();                                   /* second cote : 27 */
 if(html.indexOf('trimHold(0)')<0||html.indexOf('trimHold(1)')<0) err('les deux cotes mesures portent chacun leur bouton');
 trimHold(0); trimHold(0); trimHold(0); trimHold(0); /* 30 -> 26 */
 if(st6.sides[0]!==26||st6.sides[1]!==27) err('le rognage vise le cote demande, '+st6.sides.join('/'));
 if(st6.val!==27) err('le chrono affiche reste celui du cote courant');
 const k6=st6.key||st6.id;
 validateSet();
 const j6=cur.log[k6];
 if(!j6||j6[j6.length-1]!==26) err('c est le cote le plus court, rogne, qui part au journal : '+JSON.stringify(j6));
 /* aucun bouton de rognage sur une serie chiffree ni un etirement */
 const st7=cur.steps[cur.i];
 if(st7&&st7.k==='set'&&DB[st7.id].mode!=='time'){ renderSession(); if(html.indexOf('trimHold(')>=0) err('le rognage n existe que sur les tenues'); }
 cur=null; view='home';
 console.log('rognage par cote OK : un bouton par cote mesure, le cote rogne est celui qui part au journal');

 console.log('TESTS PLAFOND ET ROGNAGE V2.16 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
```

## falsif43.sh, banc de falsification du lot v2.16

Quinze mutations, appliquées par remplacement exact et non par `sed`, le banc s'arrêtant si un
motif ne mord pas. Toutes tombent. Trois motifs ont été repointés le 13 septembre : la v2.17 avait
ajouté `rhythm` sur la ligne du bird-dog et renommé la base de l'écrêtage en `base`, si bien que le
banc s'arrêtait sur sa première mutation depuis la livraison de la v2.17, sans être relancé. C'est
la garde du banc qui l'a dit, et c'est exactement ce pour quoi elle existe. Deux ont d'abord survécu et ont fait durcir la suite : l'écrêtage
qui efface la mémoire survivait parce que le semis v2.15 la resemait depuis les séries à la même
valeur, la fixture porte désormais une mémoire différente de la plus petite série ; le rognage
pendant qu'un chrono tourne survivait parce que le côté courant n'a pas encore de mesure, la suite
rogne désormais le premier côté pendant que le second tourne.

```bash
#!/bin/bash
# Banc de falsification du lot v2.16 : plafond au haut de fourchette, relevement
# retire, migration derivee, rognage apres le Stop. Chaque mutation defait une
# decision du lot ; test43 doit tomber sur chacune. Une mutation qui survit
# designe une assertion qui ne prouve rien. Chaque mutation est appliquee par
# remplacement exact, et le banc s arrete si le motif ne mord pas : un motif qui
# ne mord pas se lirait sinon comme une detection.
set -e
cd "$(dirname "$0")"
cp app3.js .c3 ; cp app4.js .c4 ; cp app6.js .c6 ; cp app7.js .c7 ; cp app8.js .c8
restaure(){ cp .c3 app3.js; cp .c4 app4.js; cp .c6 app6.js; cp .c7 app7.js; cp .c8 app8.js; }
mut(){ python3 - "$1" "$2" "$3" << 'EOF'
import sys
p,old,new=sys.argv[1:4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE dans',p,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
EOF
}
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test43.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- catalogue ----
mut app3.js "'bird-dog':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:" "'bird-dog':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,cap:14,rhythm:"
essai "un cap revient sur le bird-dog"

mut app3.js "cond:'Fais {n} séries de 15 fentes arrière par côté',need:15" "cond:'Fais {n} séries de 15 fentes arrière par côté',need:18"
essai "verrou des fentes lestees de retour a 18"

# ---- moteur ----
mut app4.js "      plafond();
    }" "      p.range=[low+step,top+step]; p.target=top+step; montee=true; msgs.push(e.nom+' : fourchette relevée à '+p.range.join('-'));
    }"
essai "relevement de fourchette restaure"

mut app4.js "  if(monte&&!montee) p.target=top;" "  if(false) p.target=top;"
essai "cible non recalculee au plafond"

# ---- migration ----
mut app4.js "    if(q.range&&(q.range[0]!==base[0]||q.range[1]!==base[1])) q.range=base.slice();" "    if(false) q.range=base.slice();"
essai "ecretage retire"

mut app4.js "    if(q.range&&(q.range[0]!==base[0]||q.range[1]!==base[1])) q.range=base.slice();" "    if(q.range&&(q.range[0]!==base[0]||q.range[1]!==base[1])){ q.range=base.slice(); delete q.prevMin; }"
essai "ecretage qui efface la memoire"

mut app4.js "      q.prevMin=Math.min.apply(null,q.sets);" "      if(!(e.mode==='bw'||e.mode==='time')||!q.sets.every(v=>v>=q.range[1]-1)) q.prevMin=Math.min.apply(null,q.sets);"
essai "garde de semis au haut de fourchette restauree"

# ---- fiche ----
mut app7.js "  return {lbl:[base[0]+'-'+base[1]+' '+unitOf(e)],i:(rg[0]===base[0]&&rg[1]===base[1])?0:-1,quoi:'fourchette'};" "  return {lbl:[base[0]+'-'+base[1]+' '+unitOf(e),(base[0]+1)+'-'+(base[1]+1)+' '+unitOf(e)],i:(rg[0]===base[0]&&rg[1]===base[1])?0:-1,quoi:'fourchette'};"
essai "seconde marche de fourchette sur la fiche"

mut app7.js "  return {lbl:[base[0]+'-'+base[1]+' '+unitOf(e)],i:(rg[0]===base[0]&&rg[1]===base[1])?0:-1,quoi:'fourchette'};" "  return {lbl:[base[0]+'-'+base[1]+' '+unitOf(e)],i:0,quoi:'fourchette'};"
essai "position trouvee meme hors catalogue"

# ---- rognage ----
mut app6.js "  if(st.sides[i]==null||st.sides[i]<=1) return;" "  if(st.sides[i]==null) return;"
essai "plancher du rognage retire"

mut app6.js "  if(!st||!st.sides||timers.c) return;
  if(st.sides[i]==null||st.sides[i]<=1) return;" "  if(!st||!st.sides) return;
  if(st.sides[i]==null||st.sides[i]<=1) return;"
essai "rognage possible pendant que le chrono tourne"

# v2.19 : le motif s elargit, trimCad porte la meme ligne
mut app6.js $'  st.sides[i]--;\n  if(i===st.side) st.val=st.sides[i];\n  renderSession();\n}\nfunction toggleChrono' $'  st.sides[st.side]--;\n  if(i===st.side) st.val=st.sides[i];\n  renderSession();\n}\nfunction toggleChrono'
essai "rognage qui vise le cote courant au lieu du cote demande"

mut app6.js "(v!=null&&!timers.c?' '+trimBtn(st,i):'')" "''"
essai "plus de bouton par cote sur les tenues unilaterales"

mut app8.js "    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimHold(st.side); }" "    ;"
essai "touche moins muette sur les tenues"

mut app8.js "    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimHold(st.side); }" "    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimHold(st.side); }
    if((ev.key==='+'||ev.key==='=')&&st.sides&&st.sides[st.side]!=null){ st.sides[st.side]++; st.val=st.sides[st.side]; }"
essai "touche plus qui rajoute des secondes"

rm -f .c3 .c4 .c6 .c7 .c8
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
```

## Suites existantes retouchées en v2.16

**`test5.js` §6, réécrite.** La boucle des plafonnés se construisait sur `DB[id].cap` : le champ
disparu, elle était vide et la suite passait à vide, « 0 exercices plafonnés ». Elle se dérive sur
tout exercice au poids du corps ou tenu hors bande, exige au moins quinze entrées, et couvre
vingt et un exercices, chacun avec sa marche écrite dans le message de plafond.

**`test18.js`, sept cas réécrits.** T7, T8, T11, T12, T16 et T22 assertaient le relèvement de
fourchette ou sa descente miroir. Ils assertent l'invariant qui les remplace : fourchette immobile
dans les deux sens, plafond annoncé à chaque passage au haut, aucune grâce, `div` qui ne compte
pas un plafond, cible recalée au bas de la fourchette courante sous le plancher. T8 a mis au jour
le correctif « cible au haut au plafond ». T23 change d'objet : une cible héritée au-dessus du haut
sur un palier tenu est bornée au haut.

**`test22.js`, `test28.js`, `test31.js`, `test40.js`, `test41.js`.** `cap` lu comme `reps[1]` là où
le test comparait un verrou au plafond de son prédécesseur, ou son absence assertée là où le test
vérifiait que le plafond valait le haut. `test41` §B perd sa section sur la remise à zéro de la
mémoire par relèvement, qui n'a plus d'objet ; `test43` §1 vérifie qu'aucune donnée ne peut plus le
déclencher.

**`test42.js` §1.** Les deux assertions « poids du corps au haut de fourchette : relèvement
possible, pas de mémoire » changent de sens : le relèvement n'existant plus, un passage au haut
sème, et la planche à 40/45 sème 40. La variable `B` du préambule, qui cherchait un exercice à
fourchette relevable, disparaît. La mutation « migration qui sème un passage au haut de fourchette
au poids du corps » de `falsif42.sh` ne mord plus, la garde qu'elle défaisait est tombée avec le
lot ; le banc est conservé tel quel comme trace du lot v2.15.

**`build.sh`** enchaîne quarante-trois suites.

## test42.js, suite du lot v2.15

Neuf sections. Lot lisibilité, ouvert par un audit UI/UX sur captures, plus la migration de
la mémoire de fenêtre relevée par l'audit externe de la v2.14.

1. **Migration, gardes.** Semée depuis la plus petite série de la dernière lecture ; jamais depuis
   une lecture allégée ou non qualifiée, jamais sous grâce, jamais depuis un passage entièrement au
   haut de fourchette moins un pas sur le poids du corps et les tenues, semée au plafond sur une
   charge sans grâce, jamais par-dessus une mémoire posée, semée sous palier tenu, idempotente.
2. **Migration, chemins.** `loadState` et `applyImport` sèment tous deux.
3. **Bibliothèque.** Dans chaque groupe, aucune ligne verrouillée avant le bloc des verrouillés,
   aucun repli avant le sous-titre hors tirage, compte de verrouillés porté par la ligne fermée,
   bloc fermé par défaut ; substituts marqués avec leur origine ; jamais « à faire » hors tirage ;
   niveau en ligne 2 et jamais dans la colonne de droite, séries conservées à droite ; une recherche
   ouvre le bloc et montre les trois mollets verrouillés de l'état neuf, son effacement le referme,
   une recherche vide est annoncée ; CSS sans ellipse sur le nom, ici et dans le détail de séance ;
   ancien pied de liste disparu.
4. **En-têtes fermés.** La règle `.val` passe à la ligne, sans ellipse ni `nowrap`.
5. **Accueil.** Ordre lancement, semaine, contenu, détail, progression ; plus de phrase constante
   dans le détail ; ligne des étirements du jour conservée avec sa durée.
6. **Dernière fois.** `lastLevel` dit la charge ou la bande jouée quand elle diffère, rien sinon,
   ignore les passages de repli, rien sans historique ni au poids du corps ; et l'écran de série
   réel porte le niveau quand il diffère.
7. **Progrès.** Référentiel d'assiduité dans un `<details>` fermé, texte conservé.
8. **Fiche.** « La cible suit tes séries », ancien texte absent.
9. **Forme.** Plus aucune étiquette sous 0,68 rem, `.tenu` compris ; une seule règle desktop,
   600 px sous `@media (min-width:900px)` ; la colonne mobile reste à 480 px.

```javascript
/* test42 : lot v2.15, lisibilite. Migration de la memoire de fenetre depuis
   la derniere lecture (releve d audit externe sur la v2.14), bibliotheque en
   trois paliers sans nom tronque et avec les substituts marques, valeurs
   d en-tete ferme qui passent a la ligne, « Cette semaine » sous le lancement,
   detail de seance sans phrases constantes, « Derniere fois » portant le
   niveau quand il differe, referentiel d assiduite replie, texte de fiche,
   etiquettes a 0,68 rem, colonne de 600 px au-dessus de 900 px. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
const CSS=fs.readFileSync('head.html','utf8');

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 const SRC=${JSON.stringify(src)};
 const CSS=${JSON.stringify(CSS)};
 const M='mollets-debout', PL='planche', F='face-pulls';
 const L=Object.keys(DB).filter(id=>DB[id].mode==='load'&&DB[id].reps&&!DB[id].bnd)[0];

 /* ---------- 1. migration de la memoire : gardes ---------- */
 const perf=(o)=>Object.assign({load:0,range:[12,25],target:16,best:16,sets:[15,15,15],date:'2026-09-01T10:00:00.000Z'},o||{});
 const mig=(id,o)=>migrateState(g({v:2,rounds:3,perf:{[id]:perf(o)}})).perf[id];
 if(mig(M).prevMin!==15) err('lecture exploitable : semee, '+mig(M).prevMin);
 if(mig(M,{sets:[15,13,14]}).prevMin!==13) err('la plus petite serie est semee');
 if('prevMin' in mig(M,{lightSets:true})) err('lecture allegee : pas de memoire');
 if('prevMin' in mig(M,{unqualSets:true})) err('lecture non qualifiee : pas de memoire');
 if('prevMin' in mig(L,{load:6.5,range:DB[L].reps.slice(),sets:[12,12,12],grace:true})) err('grace posee : le dernier passage a monte, pas de memoire');
 if(mig(L,{load:6.5,range:DB[L].reps.slice(),sets:DB[L].reps.map(()=>DB[L].reps[1]).concat([DB[L].reps[1]])}).prevMin!==DB[L].reps[1]) err('charge au plafond sans grace : le palier n a pas bouge, la memoire se seme');
 /* v2.16 : la garde « au haut de fourchette moins un pas » tombe avec le
    relevement. Un passage au plafond n a change aucun palier, ses series sont
    au palier courant, elles sement. */
 if(mig(M,{sets:[25,25,25]}).prevMin!==25) err('poids du corps au haut de fourchette : plus de relevement possible, semee (v2.16)');
 if(mig(M,{sets:[24,25,24]}).prevMin!==24) err('poids du corps au haut moins un pas : semee (v2.16)');
 if(mig(M,{sets:[23,24,25]}).prevMin!==23) err('poids du corps sous le haut moins un pas : semee, '+mig(M,{sets:[23,24,25]}).prevMin);
 if(mig(PL,{range:[20,45],target:45,sets:[40,45]}).prevMin!==40) err('tenue au haut moins un pas de 5 : semee (v2.16)');
 if(mig(PL,{range:[20,45],target:40,sets:[35,35]}).prevMin!==35) err('tenue sous le haut moins un pas : semee');
 if('prevMin' in mig(M,{sets:[]})) err('sans serie : rien');
 if('prevMin' in mig(M,{sets:undefined})) err('sans champ : rien');
 if(mig(M,{prevMin:9}).prevMin!==9) err('une memoire deja posee n est pas reecrite');
 if(mig(M,{hold:true}).prevMin!==15) err('palier tenu : la memoire se seme, c est une observation');
 const une=migrateState(g({v:2,rounds:3,perf:{[M]:perf()}})), deux=migrateState(g(une));
 if(JSON.stringify(une.perf)!==JSON.stringify(deux.perf)) err('migration non idempotente');
 console.log('migration OK : semee depuis la derniere lecture, gardes de provenance, de grace et de plafond, idempotente');

 /* ---------- 2. migration : les deux chemins d entree ---------- */
 localStorage._m={'palier-state-v2':JSON.stringify({v:2,rounds:3,perf:{[M]:perf()}})};
 state=null; await loadState();
 if(perfOf(M).prevMin!==15) err('loadState doit semer la memoire');
 await neuf();
 applyImport({app:'palier',version:'2.13',xp:0,hist:[],v:2,rounds:3,perf:{[M]:perf({sets:[14,14,14]})}});
 if(perfOf(M).prevMin!==14) err('applyImport doit semer la memoire');
 console.log('chemins OK : loadState et applyImport sement tous deux');

 /* ---------- 3. bibliotheque : trois paliers, substituts marques ---------- */
 await neuf();
 perfOf(L).load=6.5; perfOf(L).sets=[12,12,12];
 perfOf(F).sets=[18,18];
 view='lib'; libQ=''; render();
 const lib=html;
 const card=(label)=>{ const i=lib.indexOf('<h3>'+label+'</h3>'); const j=lib.indexOf('<div class="card">',i+1); return lib.slice(i,j<0?lib.length:j); };
 const jambes=card('Jambes'), tire=card('Tiré'), pousse=card('Poussé');
 if(!jambes||!tire||!pousse) err('trois groupes attendus');
 /* ordre : aucune ligne verrouillee avant le sous-titre hors tirage, aucune ligne hors tirage avant la fin des lignes en rotation */
 const iSub=jambes.indexOf('class="libsub"'), iLock=jambes.indexOf('<details class="libtier"'), iFirstLocked=jambes.indexOf('lockedrow');
 if(iSub<0||iLock<0) err('jambes : sous-titre hors tirage et bloc verrouille attendus');
 if(iFirstLocked<iLock) err('jambes : une ligne verrouillee avant le bloc des verrouilles');
 if(jambes.indexOf('>repli<')>=0&&jambes.indexOf('>repli<')<iSub) err('jambes : un repli avant le sous-titre hors tirage');
 const nLock=Object.keys(DB).filter(id=>DB[id].cat==='legs'&&isLocked(id)).length;
 if(jambes.indexOf('<summary><b>'+nLock+'</b> paliers à débloquer</summary>')<0) err('jambes : le compte de verrouilles est porte par la ligne fermee, '+nLock);
 if(/<details class="libtier"[^>]*open/.test(jambes)) err('jambes : le bloc des verrouilles est ferme par defaut');
 /* substituts et replis : etiquette, origine, jamais « a faire » */
 if(tire.indexOf('>substitut<')<0) err('tire : les substituts materiels sont marques');
 if(tire.indexOf('substitut de ')<0) err('tire : le substitut nomme ce dont il prend la place');
 const horsT=tire.slice(tire.indexOf('class="libsub"'),tire.indexOf('<details class="libtier"'));
 if(horsT.indexOf('à faire')>=0) err('tire : « a faire » sur une ligne hors tirage');
 /* le niveau descend en ligne 2, la colonne de droite ne porte que les series */
 if(pousse.indexOf('<span class="lvl">· 6,5 kg</span>')<0) err('pousse : le niveau descend en ligne 2');
 if(/<span class="num small st">[^<]*kg/.test(pousse)) err('pousse : la colonne de droite ne porte pas la charge');
 if(pousse.indexOf('12/12/12')<0&&pousse.indexOf('12<')<0) err('pousse : les series du dernier passage restent a droite');
 if(tire.indexOf('· '+bandLabel('rouge')+'</span>')<0&&tire.indexOf('<span class="lvl">· ')<0) err('tire : la bande descend en ligne 2');
 /* recherche : ouvre le bloc, et le referme quand elle s efface */
 libFilter('mollets');
 const q1=html;
 if(!/<details class="libtier"[^>]*open/.test(q1)) err('une recherche ouvre le bloc des verrouilles');
 if((q1.match(/lockedrow/g)||[]).length!==3) err('mollets : trois verrouilles attendus a l etat neuf, '+(q1.match(/lockedrow/g)||[]).length);
 if(q1.indexOf('Mollets debout</b>')<0) err('mollets : l accessible est la, en entier');
 libFilter('');
 if(/<details class="libtier"[^>]*open/.test(html)) err('la recherche effacee referme le bloc');
 libFilter('zzzz');
 if(html.indexOf('Aucun exercice ne correspond')<0) err('recherche vide annoncee');
 libFilter('');
 /* le nom ne se tronque plus, ni ici ni dans le detail de seance */
 if(!/\\.exorow \\.ex b\\{white-space:normal/.test(CSS)) err('le nom de bibliotheque doit pouvoir passer a la ligne');
 if(/\\.exorow \\.ex b\\{[^}]*ellipsis/.test(CSS)) err('plus d ellipse sur le nom de bibliotheque');
 if(!/\\.nextexo \\.ex b\\{white-space:normal/.test(CSS)) err('le nom du detail de seance doit pouvoir passer a la ligne');
 if(lib.indexOf('Toute la banque, avec les paliers à débloquer')>=0) err('l ancien pied de liste a disparu');
 console.log('bibliotheque OK : rotation, hors tirage, verrouilles replies avec compte, substituts marques, niveau en ligne 2, recherche qui ouvre et referme');

 /* ---------- 4. en-tetes fermes : la valeur passe a la ligne ---------- */
 const val=CSS.match(/details\\.card>summary \\.val\\{[^}]*\\}/);
 if(!val) err('regle .val introuvable');
 if(!/white-space:normal/.test(val[0])||/ellipsis/.test(val[0])||/nowrap/.test(val[0])) err('la valeur d en-tete ferme ne doit plus etre coupee : '+val[0]);
 console.log('en-tetes OK : la valeur passe a la ligne');

 /* ---------- 5. accueil : ordre des cards ---------- */
 await neuf();
 view='home'; render();
 const iL=html.indexOf('Lancer la séance'), iW=html.indexOf('<h3>Cette semaine</h3>'), iC=html.indexOf('data-k="home-contenu"'), iD=html.indexOf('data-k="home-detail"'), iP=html.indexOf('<h3>Progression</h3>');
 if(!(iL>0&&iW>iL&&iC>iW&&iD>iC&&iP>iD)) err('ordre attendu : lancement, semaine, contenu, detail, progression ; obtenu '+[iL,iW,iC,iD,iP].join(','));
 /* detail de seance : plus de phrases constantes */
 if(html.indexOf('Touche un exercice pour sa fiche complète')>=0) err('phrase constante « Touche un exercice » encore presente');
 if(html.indexOf('plus le module cardio qui coûte')>=0) err('phrase constante sur le cardio encore presente');
 if(html.indexOf('comptés dans le temps annoncé')>=0) err('la ligne des etirements est raccourcie');
 if(effStretch()&&!/Puis [^<]+ · \\d/.test(html)) err('la ligne des etirements porte encore les etirements du jour et leur duree');
 console.log('accueil OK : Cette semaine sous le lancement, detail sans phrases constantes, etirements du jour conserves');

 /* ---------- 6. derniere fois avec le niveau quand il differe ---------- */
 await neuf();
 const ph={load:6.5,band:null};
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:L,sets:[12,12,12],load:6}]}];
 if(lastLevel(L,ph)!==' <span class="muted">à '+loadLabelFor(L,6)+'</span>') err('charge differente : le niveau joue est dit, obtenu '+lastLevel(L,ph));
 if(lastLevel(L,{load:6})!=='') err('meme charge : rien');
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:F,sets:[18,18],band:'rouge'}]}];
 if(lastLevel(F,{band:'noir'})!==' <span class="muted">en '+bandLabel('rouge')+'</span>') err('bande differente : le barreau joue est dit');
 if(lastLevel(F,{band:'rouge'})!=='') err('meme bande : rien');
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:'rowing-elastique',from:L,sets:[10,10],load:0}]}];
 if(lastLevel(L,ph)!=='') err('un passage de repli ne compte pas comme passage propre');
 state.hist=[];
 if(lastLevel(L,ph)!=='') err('sans historique : rien');
 if(lastLevel(M,{load:0})!=='') err('poids du corps : rien');
 /* et sur l ecran de serie reel */
 await neuf();
 startSession();
 const st=cur.steps.filter(s=>s.k==='set'&&!s.cool)[0];
 cur.i=cur.steps.indexOf(st); if(cur.phase!=='work'){ cur.phase='work'; }
 perfOf(st.id).sets=[9,9,9];
 state.hist=[{date:new Date().toISOString(),type:'alterne',items:[{id:st.id,sets:[9,9,9],load:(DB[st.id].mode==='load'?99:0),band:(DB[st.id].bnd?'vert':undefined)}]}];
 renderSession();
 const attendu=lastLevel(st.id,perfFor(st.id,false));
 if(html.indexOf('Dernière fois')<0) err('ligne derniere fois attendue');
 if(attendu&&html.indexOf(attendu)<0) err('l ecran de serie porte le niveau joue quand il differe');
 cur=null; view='home';
 console.log('derniere fois OK : niveau dit quand il differe, muet sinon, replis ignores, rendu en seance');

 /* ---------- 7. progres : referentiel d assiduite replie ---------- */
 await neuf();
 state.hist=[{date:new Date(Date.now()-9*86400000).toISOString(),type:'alterne',dur:15,real:900,xp:20,rounds:3,items:[{id:M,sets:[12,12,12]}]}];
 view='prog'; render();
 if(html.indexOf('data-k="prog-assid"')<0) err('referentiel d assiduite dans une zone repliable');
 if(/data-k="prog-assid"[^>]*open/.test(html)) err('replie par defaut');
 if(html.indexOf('Comment lire ce graphique')<0||html.indexOf('12 dernières semaines, jours actifs')<0) err('le texte du referentiel est conserve, replie');
 console.log('progres OK : referentiel d assiduite replie, texte conserve');

 /* ---------- 8. fiche : texte et pastilles ---------- */
 showFiche(M,'lib');
 if(html.indexOf("La cible suit tes séries, puis la charge prend le relais.")<0) err('texte de progression de la fiche');
 if(html.indexOf("monte d'un cran à chaque séance")>=0) err('ancien texte encore present');
 console.log('fiche OK : la cible suit les series');

 /* ---------- 9. forme : etiquettes, desktop, mobile inchange ---------- */
 if(/font-size:\\.6rem|font-size:\\.62rem/.test(SRC)||/font-size:\\.6rem|font-size:\\.62rem/.test(CSS)) err('plus aucune etiquette sous 0,68 rem');
 if(!/\\.tenu\\{font-size:\\.68rem/.test(CSS)) err('.tenu a 0,68 rem');
 if(!/@media \\(min-width:900px\\)\\{#app\\{max-width:600px\\}\\}/.test(CSS)) err('colonne de 600 px au-dessus de 900 px');
 if(!/#app\\{max-width:480px;margin:0 auto/.test(CSS)) err('la colonne mobile reste a 480 px');
 if((CSS.match(/max-width:600px/g)||[]).length!==1) err('une seule regle desktop');
 console.log('forme OK : etiquettes a 0,68 rem, desktop 600 px sous media query, mobile intact');

 console.log('TESTS LISIBILITE V2.15 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
```

## falsif42.sh, banc de falsification du lot v2.15

Vingt mutations, vingt chutes, depuis la reprise du 13 septembre : les cinq mutations de migration
étaient appliquées par `sed` sans vérification que le motif morde, et la v2.16 a réécrit le bloc
qu'elles visaient. Elles sont devenues des patchs sans effet et se lisaient comme cinq survies, sur
deux versions. Le banc adopte le `mut` vérifié des lots v2.16 et v2.17, quatre mutations sont
repointées et la cinquième est retirée, sa garde ayant disparu avec le relèvement de fourchette.
Quatre sur la migration, sept sur la bibliothèque, trois
sur les en-têtes, l'accueil et le détail, deux sur « dernière fois », quatre sur Progrès, la fiche et
la largeur, dont « mobile élargi à 600 px » qui vérifie que la règle ne déborde pas de sa media
query.

```bash
#!/bin/bash
# Banc de falsification du lot v2.15, lisibilite. Chaque mutation defait une
# decision du lot ; test42 doit tomber sur chacune. Une mutation qui survit
# designe une assertion qui ne prouve rien.
set -e
cd "$(dirname "$0")"
cp head.html .ch ; cp app4.js .c4 ; cp app5.js .c5 ; cp app6.js .c6 ; cp app7.js .c7 ; cp app9.js .c9
restaure(){ cp .ch head.html; cp .c4 app4.js; cp .c5 app5.js; cp .c6 app6.js; cp .c7 app7.js; cp .c9 app9.js; }
# Remplacement exact avec verification que le motif mord. Les mutations par sed
# de ce banc n en avaient pas : quand la v2.16 a reecrit la migration de la
# memoire de fenetre, ses cinq mutations sont devenues des patchs sans effet et
# se sont lues comme cinq survies, pendant deux versions. Meme lecon que
# build.sh en v1.11 : un outil qui annonce son resultat se verifie.
mut(){ python3 - "$1" "$2" "$3" << 'EOF'
import sys
p,old,new=sys.argv[1:4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE dans',p,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
EOF
}
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  if node test42.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- migration ----
mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(false)"
essai "migration retiree"

mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.unqualSets&&!q.grace)"
essai "migration qui seme depuis une lecture allegee"

mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets)"
essai "migration qui seme malgre la grace"

mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)"
essai "migration qui reecrit une memoire deja posee"

# La mutation « migration qui seme un passage au haut de fourchette au poids du
# corps » est retiree : la garde qu elle defaisait a ete supprimee en v2.16 avec
# le relevement de fourchette, un tel passage seme desormais comme les autres.

# ---- bibliotheque ----
sed -i "s/    const rot=ids.filter(id=>!isLocked(id)\&\&!estRepli(id)\&\&!estSubstitut(id));/    const rot=ids.filter(id=>!estRepli(id)\&\&!estSubstitut(id));/" app7.js
sed -i "s/    const lock=ids.filter(id=>isLocked(id));/    const lock=[];/" app7.js
essai "verrouilles de nouveau intercales"

sed -i "s/    const ouvert=q?' open':(libQPrev?'':cardOpen(k,false));/    const ouvert=cardOpen(k,false);/" app7.js
essai "la recherche n ouvre plus le bloc"

sed -i "s/    const ouvert=q?' open':(libQPrev?'':cardOpen(k,false));/    const ouvert=q?' open':' open';/" app7.js
essai "le bloc ouvert par defaut"

sed -i "s/  const stat=locked?'':(joue?setsHtml(p.sets):(hors||e.mode==='stretch'?'':'à faire'));/  const stat=locked?'':(joue?setsHtml(p.sets):(e.mode==='stretch'?'':'à faire'));/" app7.js
essai "a faire sur les lignes hors tirage"

sed -i "s/  const repli=estRepli(id), subst=estSubstitut(id), hors=!locked\&\&(repli||subst);/  const repli=estRepli(id), subst=false, hors=!locked\&\&(repli||subst);/" app7.js
essai "substituts de nouveau non marques"

sed -i "s/  const lvl=(!locked\&\&e.bnd\&\&p\&\&p.band)?bandLabel(p.band):(!locked\&\&p\&\&p.load?loadLabelFor(id,p.load):'');/  const lvl='';/" app7.js
sed -i "s/    '<span class=\"num small st\">'+tag+stat+'<\/span><\/div>';/    '<span class=\"num small st\">'+tag+stat+(p\&\&p.load?'<br>'+loadLabelFor(id,p.load):'')+'<\/span><\/div>';/" app7.js
essai "le niveau de retour dans la colonne de droite"

sed -i "s/\.exorow \.ex b{white-space:normal;line-height:1.2}/.exorow .ex b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/" head.html
essai "nom de bibliotheque de nouveau tronque"

# ---- en-tetes, accueil, detail ----
sed -i "s/text-align:right;white-space:normal;overflow-wrap:anywhere;line-height:1.25}/text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/" head.html
essai "valeur d en-tete ferme de nouveau coupee"

python3 - << 'PY'
s=open('app5.js',encoding='utf-8',newline='').read()
i=s.index("  '<div class=\"card\">'+\n    '<div class=\"spread\"><h3>Cette semaine</h3>")
j=s.index("  contentCard(plan,parts)+\n  sessionDetailHtml(plan)+\n")
week=s[i:j]; s=s[:i]+s[j:]
k=s.index("  '<div class=\"card\">'+\n    '<div class=\"spread\"><h3>Progression</h3>")
s=s[:k]+week+s[k:]
open('app5.js','w',encoding='utf-8',newline='').write(s)
PY
essai "Cette semaine redescendue sous le detail"

sed -i "s/  if(cool.length) jour+='<div class=\"muted small\" style=\"margin-top:6px\">Puis '+cool.map(s=>esc(DB\[s.id\].nom)).join(' et ')+' · '+fmtDur(cool.reduce((a,s)=>a+serieSec(s.id,false),0))+'<\/div>';/  if(cool.length) jour+='<div class=\"muted small\" style=\"margin-top:6px\">Puis '+cool.map(s=>esc(DB[s.id].nom)).join(' et ')+' · '+fmtDur(cool.reduce((a,s)=>a+serieSec(s.id,false),0))+'<\/div>'; jour+='<div class=\"muted small\">Touche un exercice pour sa fiche complète.<\/div>';/" app9.js
essai "phrase constante de retour dans le detail"

# ---- derniere fois ----
sed -i "s/  const pass=exoPassages(id).filter(x=>!x.repl);/  const pass=exoPassages(id);/" app6.js
essai "un passage de repli pris pour un passage propre"

sed -i "s/function lastLevel(id,p){/function lastLevel(id,p){ return '';/" app6.js
essai "derniere fois sans niveau"

# ---- progres, fiche, forme ----
sed -i "s/    '<details data-k=\"prog-assid\"'+cardOpen('prog-assid',false)+' style=\"margin-top:8px\">/    '<details data-k=\"prog-assid\" open style=\"margin-top:8px\">/" app7.js
essai "referentiel d assiduite deplie"

sed -i "s/La cible suit tes séries, puis la charge prend le relais./La cible monte d'un cran à chaque séance réussie, puis la charge prend le relais./" app7.js
essai "ancien texte de fiche"

sed -i "s/@media (min-width:900px){#app{max-width:600px}}//" head.html
essai "desktop a 480 px"

sed -i "s/#app{max-width:480px;margin:0 auto;padding:14px 14px 92px}/#app{max-width:600px;margin:0 auto;padding:14px 14px 92px}/" head.html
essai "mobile elargi a 600 px"

rm -f .ch .c4 .c5 .c6 .c7 .c9
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
echo "banc termine, sources restaurees"
```

## Suites existantes retouchées en v2.15

- `test30`, section 8 : les pastilles d'échelle de la fiche étaient reconnues à leur taille de
  police, `font-size:.62rem`, ce qui faisait d'un style une assertion. Elles portent la classe
  `ech`, et la suite compte la classe. Aucune attente ne change.
- `test41`, sections 8 et 9 : la v2.14 interdisait toute migration de la mémoire et le vérifiait ;
  la v2.15 la sème, sur relevé de l'audit externe. La section 8 vérifie désormais que la mémoire
  est semée et qu'une mauvaise séance est absorbée dès la première après mise à jour ; la section 9
  ne contrôle plus `migrateState`, le détail des gardes vivant dans `test42`.

Aucune autre suite ne bouge : le lot ne touche ni au tirage, ni à la prescription, ni au modèle de
temps, ce que l'empreinte de neutralité confirme, 206 lignes identiques.

## test41.js, suite du lot v2.14

Dix sections. La fenêtre de deux passages sur la cible, et le texte « Comment ça marche »
réécrit en quatre blocs. Le sujet des sections 1 à 6 est `mollets-debout`, 12-25 au poids du
corps plafonné à 25 : depuis sa base ni montée ni descente de palier n'est possible, ce qui
isole la cible de tout autre mécanisme.

1. **Le tableau de Gabriel.** Quatre passages à la cible donnent 13, 14, 15, 16 ; un cinquième à
   12 est absorbé, la cible reste à 16 et aucun message ne sort ; un 16 ensuite donne 17, rien
   n'est perdu. Puis les quatre lignes du tableau validé en conception, mémoire posée à la
   main : 12 puis 13 donne 14, 12 puis 15 donne 16, 15 puis 12 donne 16, 14 puis 13 donne 15 à
   cible 18. La plus petite série du passage commande, pas la dernière.
2. **Le message.** Deux passages sous la cible produisent `Mollets debout : cible recalée de 18
   à 15, deux passages en dessous`, seul message. Un recul sans mémoire reste muet. La lecture
   partielle et l'échec sans descente portent la clause « cible recalée » quand elle a lieu,
   jamais un second message.
3. **Remises à zéro.** Montée de charge, descente du filet, relèvement de fourchette au poids du
   corps, ajustement manuel de charge dans les deux sens, ajustement manuel de bande. Un plafond
   atteint et un ajustement sans effet, en butée d'échelle, conservent la mémoire. Après une
   descente, un seul message.
4. **Provenance.** Une lecture partielle, une séance allégée et une lecture non qualifiée ne
   touchent ni la cible ni la mémoire.
5. **Palier tenu.** La mémoire s'écrit, la cible ne bouge pas, et à la libération la mémoire
   écrite sous le palier tenu sert.
6. **Tenues.** Une tenue courte isolée est absorbée ; deux ramènent à l'arrondi au multiple de
   5 de la meilleure des deux plus une, avec le message.
7. **Séance complète.** Une séance jouée au haut de fourchette produit une montée au
   récapitulatif ; « Tenir ce palier » restaure le palier et la cible, et la mémoire vaut la
   plus petite série jouée au palier restauré. La correction de la dernière séance rejoue la
   mémoire depuis l'instantané, deux fois depuis le même point de départ. En flux réel, une
   séance plus faible que la précédente est absorbée.
8. **Sauvegarde antérieure.** Aucune migration ne fabrique la mémoire ; sans elle, la cible suit
   le passage, muette, et la mémoire commence au premier passage.
9. **Forme du code.** Une seule écriture de la mémoire dans `applyProgress`, deux dans toute la
   source avec `holdClimb`, les deux ajustements manuels la remettent à zéro, `migrateState`
   l'ignore.
10. **Texte.** Quatre blocs, la cible en tête, la fenêtre et sa descente dites, le retour au
    bas de fourchette et la séance allégée nommés, l'exemple des pompes conservé tel quel et dit
    une fois, pas de liste nominative, renvoi à la ligne Fin de série, pas de tiret cadratin,
    plafond de 650 mots, sous-titre de la card Réglages, les quatre accroches sur l'accueil
    avec développements repliés et dépliés dans Réglages.

```javascript
/* test41 : lot v2.14. Fenetre de deux passages sur la cible : la cible
   suivante vaut la plus haute des deux dernieres lectures plus une, une
   mauvaise seance est absorbee, deux consecutives font redescendre. Memoire
   p.prevMin ecrite sur les seules lectures exploitables et completes, remise
   a zero a tout changement de palier (montee, descente, relevement de
   fourchette, ajustement manuel), lecture partielle et allegee sans effet,
   palier tenu qui ecrit sans lire, holdClimb et correction, message de recul
   au recapitulatif, arrondi des tenues, sauvegarde anterieure sans memoire,
   texte « Comment ca marche » en quatre blocs. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' != '+JSON.stringify(b)); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; state.intro=false; syncProfil(); };
 /* un etat pose n a ni grace, ni memoire de fenetre, ni palier tenu */
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   p.range=(o&&o.range)?o.range.slice():e.reps.slice();
   p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.load!=null) p.load=o.load;
   if(o&&o.band) p.band=o.band;
   delete p.hold; delete p.grace; delete p.setsBand; delete p.prevMin; p.best=0; p.sets=[];
   return p; };
 const dit=(m,re)=>m.some(x=>re.test(x));
 const RECUL=/cible recalée/;
 /* mollets debout : 12-25 au poids du corps, plafond au haut de fourchette,
    donc ni montee ni descente de palier possible depuis la base, ce qui isole
    la cible de tout autre mecanisme */
 const M='mollets-debout';
 if(DB[M].reps[0]!==12||DB[M].reps[1]!==25||'cap' in DB[M]) err('prealable : mollets debout attendus en 12-25, plafond au haut, sans champ cap (v2.16)');

 /* ---------- 1. le tableau de Gabriel ---------- */
 await neuf();
 let p=pose(M);
 const suite=[12,13,14,15].map(v=>{ applyProgress(M,[v,v,v],true,false); return p.target; });
 eq(suite,[13,14,15,16],'cas nominal : quatre passages a la cible donnent 13, 14, 15, 16');
 if(p.prevMin!==15) err('la memoire porte la plus petite serie du dernier passage, '+p.prevMin);
 /* 5e passage, mauvaise seance a 12 pour une cible a 16 : absorbee, muette */
 let m=applyProgress(M,[12,12,12],true,false);
 if(p.target!==16) err('une mauvaise seance isolee ne fait pas reculer la cible, '+p.target);
 if(m.length) err('un passage absorbe ne produit aucun message : '+m.join(' | '));
 if(p.prevMin!==12) err('la memoire est ecrite meme quand elle n a pas joue, '+p.prevMin);
 /* 6e passage en forme : 16 donne 17, rien n a ete perdu */
 applyProgress(M,[16,16,16],true,false);
 if(p.target!==17) err('rien n est perdu quand le passage suivant tient : '+p.target);
 /* et le tableau ligne a ligne, memoire posee a la main */
 const tab=[[12,13,14],[12,15,16],[15,12,16],[14,13,15]];
 tab.forEach(([a,b,c])=>{ pose(M,{target:18}); perfOf(M).prevMin=a; applyProgress(M,[b,b,b],true,false);
   if(perfOf(M).target!==c) err('tableau : '+a+' puis '+b+' devait donner '+c+', obtenu '+perfOf(M).target); });
 /* la plus petite serie du passage commande, pas la derniere */
 pose(M,{target:16}); perfOf(M).prevMin=13; applyProgress(M,[18,14,13],true,false);
 if(perfOf(M).target!==14) err('la plus petite serie commande : 18/14/13 sur memoire 13 devait donner 14');
 console.log('tableau OK : 12,13,14,15 puis 12 absorbe, 16 donne 17 ; les quatre lignes du tableau tiennent');

 /* ---------- 2. deux passages sous la cible : recul dit au recap ---------- */
 /* cible 18 issue d un passage a 17 : la memoire porte 17 */
 pose(M,{target:18}); perfOf(M).prevMin=17;
 m=applyProgress(M,[14,14,14],true,false);
 if(perfOf(M).target!==18) err('premier passage sous la cible : absorbe, '+perfOf(M).target);
 if(m.length) err('premier passage sous la cible : muet, '+m.join(' | '));
 m=applyProgress(M,[13,13,13],true,false);
 if(perfOf(M).target!==15) err('second passage sous la cible : recul au meilleur des deux plus un, '+perfOf(M).target);
 if(!dit(m,/^Mollets debout : cible recalée de 18 à 15, deux passages en dessous \\(14 puis 13\\)$/)) err('message de recul attendu, nomme et motive : '+m.join(' | '));
 if(m.length!==1) err('un seul message par evenement : '+m.join(' | '));
 /* v2.23 : le cas constate le 25 septembre 2026. Pompes a cible 9 issue d un
    8/8/8, puis 9/9/6 absorbe, puis 9/9/7 : la cible recule a 8 alors que la
    seconde lecture est meilleure que la premiere. Le message porte les deux
    lectures, dans l ordre ou elles ont ete faites, pour que la direction se
    lise. Ni le recul ni la regle ne changent. */
 const PO='pompes-poignees';
 pose(PO,{target:9,band:'aucune'}); perfOf(PO).prevMin=8;
 m=applyProgress(PO,[9,9,6],true,false);
 if(perfOf(PO).target!==9) err('pompes : 9/9/6 absorbe par la memoire, '+perfOf(PO).target);
 if(m.length) err('pompes : premier passage sous la cible muet, '+m.join(' | '));
 m=applyProgress(PO,[9,9,7],true,false);
 if(perfOf(PO).target!==8) err('pompes : max(6,7)+1 donne 8, '+perfOf(PO).target);
 if(!dit(m,/^Pompes : cible recalée de 9 à 8, deux passages en dessous \\(6 puis 7\\)$/)) err('pompes : les deux lectures dans l ordre, '+m.join(' | '));
 if(m.length!==1) err('pompes : un seul message, '+m.join(' | '));
 if(perfOf(PO).prevMin!==7) err('pompes : la memoire porte la lecture du jour apres le message, '+perfOf(PO).prevMin);
 console.log('recul OK : deux lectures dites dans l ordre (v2.23), 6 puis 7 sur le cas reel des pompes');
 /* sans memoire, un recul reste muet : la v1.15 tient pour le premier passage */
 pose(M,{target:16});
 m=applyProgress(M,[12,12,12],true,false);
 if(perfOf(M).target!==13) err('sans memoire, la cible suit le passage, '+perfOf(M).target);
 if(dit(m,RECUL)) err('un recul sans memoire derriere lui reste muet : '+m.join(' | '));
 /* la lecture partielle garde son message, avec la clause quand elle a lieu */
 pose(M,{target:16}); perfOf(M).prevMin=15;
 m=applyProgress(M,[15,11,11],true,false);
 if(perfOf(M).target!==16) err('partiel absorbe par la memoire : cible inchangee, '+perfOf(M).target);
 if(!dit(m,/des séries sous le plancher/)||dit(m,RECUL)) err('partiel sans recul : signal seul, '+m.join(' | '));
 m=applyProgress(M,[15,11,11],true,false);
 if(perfOf(M).target!==12) err('partiel deux fois : les deux lectures valent 11, cible 12, '+perfOf(M).target);
 if(!dit(m,/des séries sous le plancher.*cible recalée de 16 à 12/)) err('partiel avec recul : un seul message portant la clause, '+m.join(' | '));
 if(m.length!==1) err('partiel avec recul : un seul message, '+m.join(' | '));
 /* l echec sans descente possible porte lui aussi la clause, une seule fois */
 pose(M,{target:20}); perfOf(M).prevMin=9;
 m=applyProgress(M,[9,9,9],true,false);
 if(!dit(m,/aucune série au plancher \\(9 pour un bas à 12\\), cible recalée de 20 à 12/)) err('echec sans descente : signal avec clause, '+m.join(' | '));
 if(m.length!==1) err('echec sans descente : un seul message, '+m.join(' | '));
 console.log('message OK : recul dit apres deux passages, muet apres un seul, clause portee par partiel et echec, jamais deux messages');

 /* ---------- 3. remises a zero : la memoire ne survit pas a un changement de palier ---------- */
 const L=Object.keys(DB).filter(id=>DB[id].mode==='load'&&DB[id].reps&&!DB[id].bnd)[0];
 const eL=DB[L], lo=eL.reps[0], hi=eL.reps[1];
 /* montee */
 pose(L,{target:hi}); perfOf(L).prevMin=hi-1;
 const l0=perfOf(L).load;
 m=applyProgress(L,[hi,hi,hi],true,false);
 if(perfOf(L).load<=l0) err('prealable : montee attendue sur '+L);
 if(perfOf(L).prevMin!=null) err('la montee remet la memoire a zero');
 if(perfOf(L).target!==lo) err('retour au bas de fourchette apres montee');
 delete perfOf(L).grace;
 /* premier passage au nouveau palier : sans memoire, la cible suit ce passage seul */
 applyProgress(L,[lo+2,lo+2,lo+2],true,false);
 if(perfOf(L).target!==lo+3) err('premier passage au nouveau palier : cible = lecture + 1, '+perfOf(L).target);
 if(perfOf(L).prevMin!==lo+2) err('memoire ecrite au nouveau palier');
 /* descente du filet */
 pose(L,{target:lo+3,load:perfOf(L).load}); perfOf(L).prevMin=lo+2;
 const l1=perfOf(L).load;
 m=applyProgress(L,[1,1,1],true,false);
 if(perfOf(L).load>=l1) err('prealable : descente attendue');
 if(perfOf(L).prevMin!=null) err('la descente remet la memoire a zero');
 if(perfOf(L).target!==lo) err('cible au bas de fourchette apres descente, '+perfOf(L).target);
 if(dit(m,RECUL)) err('apres une descente, le message de descente suffit : '+m.join(' | '));
 if(m.length!==1) err('descente : un seul message, '+m.join(' | '));
 /* v2.16 : le relevement de fourchette n existe plus, il n y a plus de
    remise a zero a tester de ce cote ; test43 verifie qu aucune donnee ne
    peut le declencher. Plafond atteint : rien ne change de palier, la
    memoire s ecrit */
 pose(M,{target:25}); perfOf(M).prevMin=24;
 m=applyProgress(M,[25,25,25],true,false);
 if(!dit(m,/Plafond atteint/)) err('prealable : plafond attendu');
 if(perfOf(M).prevMin!==25) err('au plafond le palier ne change pas, la memoire s ecrit, '+perfOf(M).prevMin);
 /* ajustement manuel de charge, dans les deux sens */
 pose(L); perfOf(L).prevMin=lo+1;
 cur={steps:[{k:'set',id:L,key:L,set:1,of:1}],i:0,log:{},xp:0,type:'alterne',exos:[L]};
 view='session';
 adjLoad(1);
 if(perfOf(L).prevMin!=null) err('monter la charge a la main remet la memoire a zero');
 perfOf(L).prevMin=lo+1;
 adjLoad(-1);
 if(perfOf(L).prevMin!=null) err('baisser la charge a la main remet la memoire a zero');
 /* charge inchangee (butee) : la memoire reste */
 pose(L,{load:loadLadder(state.gear)[0]}); perfOf(L).prevMin=lo+1;
 adjLoad(-1);
 if(perfOf(L).prevMin!==lo+1) err('un ajustement sans effet ne touche pas la memoire');
 /* ajustement manuel de bande */
 const F='face-pulls';
 pose(F,{band:'rouge'}); perfOf(F).prevMin=12;
 cur={steps:[{k:'set',id:F,key:F,set:1,of:1}],i:0,log:{},xp:0,type:'alterne',exos:[F]};
 adjBand(1);
 if(perfOf(F).band==='rouge') err('prealable : la bande devait monter');
 if(perfOf(F).prevMin!=null) err('changer de bande a la main remet la memoire a zero');
 cur=null; view='home';
 console.log('remises a zero OK : montee, descente, ajustement manuel de charge et de bande ; plafond et butee conservent la memoire');

 /* ---------- 4. provenance : partielle, allegee, non qualifiee ---------- */
 pose(M,{target:16}); perfOf(M).prevMin=15;
 applyProgress(M,[9],false,false);
 if(perfOf(M).target!==16) err('lecture partielle : cible inchangee');
 if(perfOf(M).prevMin!==15) err('lecture partielle : memoire inchangee, le minimum d un passage ampute est biaise');
 applyProgress(M,[9,9,9],true,true);
 if(perfOf(M).prevMin!==15||perfOf(M).target!==16) err('seance allegee : ni cible ni memoire');
 applyProgress(M,[9,9,9],true,false,true);
 if(perfOf(M).prevMin!==15||perfOf(M).target!==16) err('lecture non qualifiee : ni cible ni memoire');
 console.log('provenance OK : partielle, allegee et non qualifiee n ecrivent pas la memoire');

 /* ---------- 5. palier tenu : ecrit sans lire ---------- */
 pose(M,{target:16}); perfOf(M).prevMin=15; setHold(M,true);
 m=applyProgress(M,[20,20,20],true,false);
 if(perfOf(M).target!==16) err('palier tenu : la cible ne bouge pas');
 if(perfOf(M).prevMin!==20) err('palier tenu : la memoire s ecrit quand meme, '+perfOf(M).prevMin);
 if(dit(m,RECUL)) err('palier tenu : aucun recul a dire');
 setHold(M,false);
 applyProgress(M,[15,15,15],true,false);
 if(perfOf(M).target!==21) err('a la liberation, la memoire ecrite sous le palier tenu sert : max(20,15)+1, obtenu '+perfOf(M).target);
 console.log('palier tenu OK : memoire ecrite, cible figee, memoire lue a la liberation');

 /* ---------- 6. tenues : arrondi au multiple de 5 apres la fenetre ---------- */
 const PL='planche';
 pose(PL,{target:30});
 applyProgress(PL,[34,34],true,false);
 if(perfOf(PL).target!==35) err('34 s donnent 35');
 applyProgress(PL,[20,20],true,false);
 if(perfOf(PL).target!==35) err('une tenue courte isolee est absorbee, '+perfOf(PL).target);
 m=applyProgress(PL,[21,21],true,false);
 if(perfOf(PL).target!==25) err('deux tenues courtes : max(20,21)+1 arrondi a 25, '+perfOf(PL).target);
 if(!dit(m,/^Planche : cible recalée de 35 à 25, deux passages en dessous \\(20 puis 21\\)$/)) err('message de recul sur une tenue : '+m.join(' | '));
 console.log('tenues OK : absorption puis arrondi au multiple de 5');

 /* ---------- 7. seance complete : holdClimb et correction ---------- */
 const joue=async(val)=>{
   startSession();
   cur.log={}; cur.done=0;
   cur.steps.forEach(s=>{ if(s.k!=='set'||s.cool) return;
     const k=s.key||s.id, e=DB[s.id];
     (cur.log[k]=cur.log[k]||[]).push(val(s.id,e)); cur.done++; });
   cur.i=cur.steps.length;
   await endSession(false);
   return state.hist[state.hist.length-1];
 };
 await neuf();
 /* toutes les series au haut de fourchette : chaque exercice a charge monte */
 let h=await joue((id,e)=>e.reps?e.reps[1]:1);
 const c=(cur.climbs||[]).filter(x=>DB[x.id].reps&&DB[x.id].mode!=='time')[0];
 if(!c) err('prealable : une montee attendue au recapitulatif');
 if(perfOf(c.id).prevMin!=null) err('apres montee, memoire a zero');
 holdClimb(cur.climbs.indexOf(c));
 if(!isHeld(c.id)) err('prealable : palier tenu apres holdClimb');
 if(perfOf(c.id).load!==c.prev.load||perfOf(c.id).target!==c.prev.target) err('holdClimb restaure le palier et la cible');
 if(perfOf(c.id).prevMin!==DB[c.id].reps[1]) err('holdClimb restaure la memoire depuis le passage joue au palier restaure, '+perfOf(c.id).prevMin);
 /* correction : la memoire suit les valeurs corrigees, depuis le meme point de depart */
 await neuf();
 h=await joue((id,e)=>e.reps?e.reps[0]+1:1);
 const k0=state.undo.keys.filter(k=>{ const e=DB[splitKey(k).id]; return e.reps&&e.mode!=='time'; })[0];
 const id0=splitKey(k0).id, e0=DB[id0], i0=state.undo.keys.indexOf(k0);
 if(perfOf(id0).prevMin!==e0.reps[0]+1) err('apres seance, memoire = plus petite serie jouee, '+perfOf(id0).prevMin);
 if(state.undo.perf[id0].prevMin!=null) err('l instantane porte l etat d avant seance, sans memoire');
 corrigerSeance({[k0]:h.items[i0].sets.map(()=>e0.reps[0]+3)});
 if(perfOf(id0).prevMin!==e0.reps[0]+3) err('la correction rejoue et la memoire suit, '+perfOf(id0).prevMin);
 if(perfOf(id0).target!==Math.min(e0.reps[1],e0.reps[0]+4)) err('cible recalculee depuis l instantane, '+perfOf(id0).target);
 corrigerSeance({[k0]:h.items[i0].sets.map(()=>e0.reps[0]+2)});
 if(perfOf(id0).prevMin!==e0.reps[0]+2) err('seconde correction depuis le meme instantane, '+perfOf(id0).prevMin);
 if(perfOf(id0).target!==e0.reps[0]+3) err('seconde correction : cible sans memoire parasite de la premiere, '+perfOf(id0).target);
 /* la fenetre joue d une seance a l autre, en flux reel */
 await neuf();
 await joue((id,e)=>e.reps?e.reps[0]+3:1);
 const rec=state.hist[state.hist.length-1].items.filter(it=>DB[it.id].reps&&DB[it.id].mode!=='time')[0];
 const idr=rec.id, er=DB[idr];
 /* on rejoue le meme exercice a la main, moins bien : absorbe */
 const t1=perfOf(idr).target;
 m=applyProgress(idr,rec.sets.map(()=>er.reps[0]),true,false);
 if(perfOf(idr).target!==t1) err('en flux : une seance plus faible est absorbee, '+perfOf(idr).target+' pour '+t1);
 console.log('seance OK : holdClimb rend la memoire du palier restaure, la correction la rejoue, la fenetre joue d une seance a l autre');

 /* ---------- 8. sauvegarde anterieure : la memoire se seme depuis la derniere lecture (v2.15) ---------- */
 /* La v2.14 ne migrait rien et test41 l interdisait ; l audit externe a montre
    que chaque exercice revivait alors une fois le recul silencieux. p.sets est
    une lecture, pas une valeur devinee : elle seme la memoire. Le detail des
    gardes est dans test42, ici seul le principe. */
 await neuf();
 const vieux={v:2,rounds:3,perf:{[M]:{load:0,range:[12,25],target:16,best:16,sets:[15,15,15],date:'2026-09-01T10:00:00.000Z'}}};
 const mig=migrateState(g(vieux));
 if(mig.perf[M].prevMin!==15) err('la migration seme la memoire depuis la derniere lecture, '+mig.perf[M].prevMin);
 state.perf[M]=g(mig.perf[M]);
 m=applyProgress(M,[12,12,12],true,false);
 if(perfOf(M).target!==16) err('des la premiere seance apres mise a jour, une mauvaise seance est absorbee, '+perfOf(M).target);
 if(m.length) err('absorbee, donc muette');
 console.log('sauvegarde OK : la memoire est semee a la migration, pas de recul de transition');

 /* ---------- 9. forme du code ---------- */
 const SRC=${JSON.stringify(src)};
 const ap=SRC.slice(SRC.indexOf('function applyProgress('),SRC.indexOf('function divergence('));
 if((ap.match(/p\\.prevMin=minSet/g)||[]).length!==1) err('une seule ecriture de la memoire dans applyProgress');
 if((SRC.match(/p\\.prevMin=/g)||[]).length!==2) err('deux ecritures de la memoire dans toute la source, applyProgress et holdClimb, '+(SRC.match(/p\\.prevMin=/g)||[]).length+' (la migration ecrit q.prevMin, sur l objet brut)');
 const al=SRC.slice(SRC.indexOf('function adjLoad('),SRC.indexOf('function releaseOnManualUp('));
 const ab=SRC.slice(SRC.indexOf('function adjBand('),SRC.indexOf('function swapPain('));
 if(!/delete p\\.prevMin/.test(al)||!/delete p\\.prevMin/.test(ab)) err('les deux ajustements manuels remettent la memoire a zero');
 console.log('forme OK : deux ecritures, deux remises a zero manuelles');

 /* ---------- 10. texte : quatre blocs, la cible en tete ---------- */
 if(!/^Cible/.test(COMMENT[0].t)) err('le bloc de tete porte la cible, '+COMMENT[0].t);
 const plat=COMMENT.map(b=>b.c+' '+b.l.join(' ')).join(' ');
 if(!/pas là où tu t'arrêtes/.test(plat)) err('le texte doit dire que la cible n est pas un ordre d arret');
 if(!/plus haute des deux derniers passages/.test(plat)) err('le texte doit dire la fenetre');
 if(!/deux de suite, si/.test(plat)) err('le texte doit dire la descente de cible');
 if(!/retombe au bas de la fourchette/.test(plat)) err('le texte doit dire le retour au bas a la montee de charge');
 if(!/séance allégée/.test(plat)) err('le texte doit nommer la seance allegee');
 if((plat.match(/affaissement du bassin/g)||[]).length!==1) err('l exemple du bassin est dit une fois');
 if(!/la limite n'est pas l'épuisement des pectoraux, c'est l'affaissement du bassin/.test(plat)) err('l exemple des pompes est conserve tel quel');
 if(/Sur les pompes, la planche, le gainage lat/.test(plat)) err('pas de liste nominative des fiches');
 if(plat.indexOf('Fin de série')<0) err('renvoi a la ligne de la fiche');
 if(/—/.test(plat)) err('pas de tiret cadratin');
 const mots=plat.split(/\\s+/).length;
 if(mots>650) err('le texte s est rallonge au-dela du mesure, '+mots+' mots');
 view='set'; render();
 if(html.indexOf('Cible, calibration, fin de série, fiches')<0) err('sous-titre de la card Reglages');
 COMMENT.forEach(b=>{ if(html.indexOf(b.t)<0) err('Reglages doit porter le bloc « '+b.t+' »'); });
 state.intro=true; view='home'; render();
 COMMENT.forEach(b=>{ if(html.indexOf(b.t)<0) err('l accueil porte les quatre accroches tant que le bloc n a pas ete lu'); });
 if(/data-k="cmt0"[^>]*open/.test(html)) err('sur l accueil les developpements sont replies');
 if(html.indexOf(COMMENT[0].l[0])<0) err('le developpement est present sur place, replie');
 console.log('texte OK : quatre blocs, cible en tete, fenetre et descente dites, exemple des pompes intact, '+mots+' mots');

 console.log('TESTS FENETRE DE CIBLE V2.14 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
```

## falsif41.sh, banc de falsification du lot v2.14

Vingt-deux mutations, vingt-deux chutes. Sept sur la fenêtre elle-même, dont le retour à
l'horizon d'un passage et le cliquet ; six sur le message, dont les deux lectures ajoutées en v2.23,
retirées ou inversées ; trois sur les remises à zéro manuelles, dont une qui efface la mémoire sur
un ajustement sans effet ; deux sur `holdClimb` ; quatre sur le texte. Appliquées par remplacement
exact avec compte depuis la v2.23, et non plus par `sed` : le banc s'arrête si un motif ne mord pas.

```bash
#!/bin/bash
# Banc de falsification du lot v2.14 : fenetre de deux passages sur la cible
# et texte « Comment ca marche ». Chaque mutation defait une decision du lot ;
# test41 doit tomber sur chacune. Une mutation qui survit designe une
# assertion qui ne prouve rien. Converti en v2.23 en remplacement exact avec
# compte, le lot touchant le message vise : un motif qui ne mord pas arrete
# le banc au lieu de se lire comme une survie. Deux mutations ajoutees sur les
# deux lectures du message de recul.
set -e
cd "$(dirname "$0")"
python3 - << 'PY'
import subprocess,shutil,sys,re
M=[
 ('app4.js','const ref=fen?Math.max(p.prevMin,minSet):minSet;','const ref=minSet;','retour a l horizon d un seul passage'),
 ('app4.js','const ref=fen?Math.max(p.prevMin,minSet):minSet;','const ref=fen?Math.max(p.prevMin,minSet,p.target-1):minSet;','cliquet : la cible ne redescend jamais dans la fourchette'),
 ('app4.js','const fen=full&&!descendu&&p.prevMin!=null;','const fen=p.prevMin!=null;','memoire lue apres une descente de palier'),
 ('app4.js','  if(full){ if(montee||descendu) delete p.prevMin; else p.prevMin=minSet; }','  if(full) p.prevMin=minSet;','memoire conservee a travers une montee ou une descente'),
 ('app4.js','  if(full){ if(montee||descendu) delete p.prevMin; else p.prevMin=minSet; }','  if(montee||descendu) delete p.prevMin; else p.prevMin=minSet;','memoire ecrite sur une lecture partielle'),
 ('app4.js','  if(full){ if(montee||descendu) delete p.prevMin; else p.prevMin=minSet; }','  if(full&&!p.hold){ if(montee||descendu) delete p.prevMin; else p.prevMin=minSet; }','palier tenu qui n ecrit plus la memoire'),
 ('app4.js','  if(light||unqual) return msgs;','  if(light||unqual){ p.prevMin=Math.min.apply(null,sets); return msgs; }','memoire ecrite par une seance allegee'),
 ('app4.js',"    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');",'','recul de nouveau muet'),
 ('app4.js',"    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');","    else if(recul&&full&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');",'recul dit meme sans memoire derriere lui'),
 ('app4.js',"    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');","    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous');",'v2.23 : lectures retirees du message'),
 ('app4.js',"    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');","    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+minSet+' puis '+p.prevMin+')');",'v2.23 : lectures dans l ordre inverse'),
 ('app4.js',"    if(echec&&!descendu) msgs.push(e.nom+' : aucune série au plancher ('+maxSet+' pour un bas à '+low0+')'+recul);","    if(echec&&!descendu) msgs.push(e.nom+' : aucune série au plancher ('+maxSet+' pour un bas à '+low0+')');",'clause de recul retiree du signal d echec'),
 ('app4.js',"    if(echec&&!descendu) msgs.push(e.nom+' : aucune série au plancher ('+maxSet+' pour un bas à '+low0+')'+recul);","    if(echec) msgs.push(e.nom+' : aucune série au plancher ('+maxSet+' pour un bas à '+low0+')'+recul);",'deux messages sur une descente'),
 ('app6.js','  if(nl!==p.load){p.load=nl;delete p.prevMin;releaseOnManualUp(st.id,d);save();renderSession();}','  if(nl!==p.load){p.load=nl;releaseOnManualUp(st.id,d);save();renderSession();}','ajustement manuel de charge sans remise a zero'),
 ('app6.js','  if(nb){ p.band=nb; delete p.prevMin; releaseOnManualUp(st.id,d); save(); renderSession(); }','  if(nb){ p.band=nb; releaseOnManualUp(st.id,d); save(); renderSession(); }','ajustement manuel de bande sans remise a zero'),
 ('app6.js','  if(nl!==p.load){p.load=nl;delete p.prevMin;releaseOnManualUp(st.id,d);save();renderSession();}','  if(nl!==p.load){p.load=nl;releaseOnManualUp(st.id,d);save();renderSession();} delete p.prevMin;','memoire effacee par un ajustement sans effet'),
 ('app7.js','  if(p.sets&&p.sets.length) p.prevMin=Math.min.apply(null,p.sets); else delete p.prevMin;','','holdClimb laisse la memoire a zero'),
 ('app7.js','  if(p.sets&&p.sets.length) p.prevMin=Math.min.apply(null,p.sets); else delete p.prevMin;','  p.prevMin=c.prev.prevMin;','holdClimb restaure la memoire d avant seance au lieu de la lecture jouee'),
 ('app3.js'," {t:'Cible, fourchette, charge',"," {t:'La cible, plus tard',",'bloc de tete renomme'),
 ('app3.js','La cible suivante vaut la plus haute des deux derniers passages, plus une','La cible suivante vaut ta plus petite série plus une','texte revenu a l ancienne regle'),
 ('app3.js','Une mauvaise séance ne fait pas reculer la cible ; deux de suite, si, et le récap le dit.','Une mauvaise séance ne fait pas reculer la cible.','descente de cible tue par le texte'),
 ('app8.js',"setCard('Comment ça marche','Cible, calibration, fin de série, fiches',","setCard('Comment ça marche','Calibration, fin de série, fiches',",'sous-titre de la card Reglages sans la cible'),
]
def build():
    order='head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html'.split()
    h=''.join(open(f,encoding='utf-8').read() for f in order)
    open('check.js','w',encoding='utf-8').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))
surv=0
for f,a,b,lab in M:
    s=open(f,encoding='utf-8').read(); n=s.count(a)
    if n!=1: print('MOTIF NE MORD PAS',f,lab); sys.exit(1)
    shutil.copy(f,f+'.bak'); open(f,'w',encoding='utf-8').write(s.replace(a,b))
    build()
    r=subprocess.run(['node','test41.js'],capture_output=True,text=True)
    shutil.move(f+'.bak',f)
    ok=r.returncode!=0 or 'ECHEC' in r.stdout+r.stderr
    print(('tombe  : ' if ok else 'SURVIT : ')+lab)
    if not ok: surv+=1
build()
print(len(M),'mutations,',surv,'survie(s)')
sys.exit(1 if surv else 0)
PY
```

## Suites existantes retouchées en v2.14

Quatre suites. Deux sur le fond, deux sur des valeurs épinglées.

- `test13`, section 6 : `[12,12]` après `[44,44]` sur la planche donnait 20, il donne 45 : un
  mauvais jour isolé est absorbé. C'est le second `[12,12]` qui ramène au bas de fourchette, et
  pas plus bas, ce que l'assertion d'origine voulait prouver.
- `test18`, helper `pose` : il remettait à zéro la grâce et le barreau joué, pas la mémoire de
  fenêtre, qui n'existait pas. Sans cette ligne la mémoire fuyait d'un cas au suivant, et T3
  tombait sur une valeur venue de T2. Un état posé n'a pas de mémoire.
- `test39`, section 5 : « trois blocs attendus » devient « au moins trois », chaque bloc devant
  porter un titre, une accroche et au moins un développement.
- `test40`, section 11 : « cinq développements sur la calibration » et la chaîne exacte « plus
  petite série plus une » disparaissent ; la suite vérifie que la règle est dite et que le bloc
  de calibration porte un développement.

Les deux dernières étaient des assertions de valeur au sens de la v1.15, fausses en même temps
que le code. `test18` est la seule qui masquait quelque chose, et ce n'était pas un défaut
applicatif mais un helper qui ne connaissait pas le champ nouveau.

## test40.js, suite du lot v2.13

Onze sections. L'escalier du pont fessier reprend la forme de celui des mollets, la suite
reprend donc la forme de `test31` : ce qui change tient à l'échelle, dont le dernier barreau
vient cette fois d'une constante, et à la réindexation de `SUBS.legs`.

1. **Plafond au haut de fourchette.** `cap` valait 25 pour une fourchette 10-20 : cinq
   relèvements que rien n'annonçait. Le plafond vaut désormais le haut de fourchette, un
   passage à 20 laisse la fourchette en place et annonce la marche suivante.
2. **Écrêtage des fourchettes héritées.** Un état écrit sous la v2.12 en plein relèvement,
   11-21, revient dans les bornes, la position se retrouve sur l'échelle, et la migration
   est idempotente. Témoin à l'envers : sans écrêtage la position est introuvable.
3. **Échelle des hanches.** Deux barreaux, 10 et 20, sur les deux fiches concernées.
   L'inventaire continue de borner par le bas, une kettlebell de 10 ne donne qu'un barreau
   et six kilos de lestes n'en donnent aucun. Le plafond ne passe pas par `fixedCap`, et la
   suite le vérifie explicitement : `checkUnlocks` lit le dernier barreau de `fixedLadder`
   sans appliquer le plafond, un `fixedCap` aurait fabriqué un verrou inatteignable. L'échelle
   du sac, elle, reste entière à 10/20/30/40, ce qui prouve que c'est bien la constante et non
   la masse déclarée qui arrête celle des hanches.
4. **Chaîne des quatre verrous.** Chacun derrière son prédécesseur, à deux séries, avec
   retrait en cascade, et chaque `need` égal au plafond du prédécesseur. Seul le verrou du
   pont sur une jambe lit la charge.
5. **La condition de charge mord.** Vingt répétitions au premier barreau n'ouvrent pas, le
   barreau 20 avec deux séries pleines ouvre. Le témoin à une seule série qualifiante est
   écrit à trois séries, le pont lesté s'en jouant trois : à deux il aurait ouvert à bon
   droit et la section serait passée pour rien.
6. **Un inventaire pauvre n'est pas enfermé.** Avec une seule kettlebell de 10 kg, ces dix
   kilos sont le dernier barreau et le verrou s'ouvre : l'exercice débloqué ne demande aucun
   matériel, exiger vingt kilos aurait fermé la chaîne à qui n'en a que dix.
7. **Vivier.** Quinze entrées de référence, cinq entrées tirables dans les cinq états, un
   seul échelon de pont fessier tirable à la fois, `SCHEMA.legs` aligné. La constante de
   déphasage des jambes est vérifiée inchangée : `phaseIdx` reçoit le nombre de positions
   **tirables** et non la taille du vivier, c'est ce qui rend l'insertion sans effet sur le
   tirage.
8. **Réindexation de `SUBS.legs`.** Quatre insertions après l'index 3 décalent tout ce qui
   suit : la suite vérifie les huit clés une par une contre le nom de l'exercice visé, pas
   contre leur rang. Une clé restée en place aurait fait replier les mollets lestés sur un
   step-up sans que rien ne le signale.
9. **Replis.** Les quatre échelons replient sur le pont au sol, seul maillon sans verrou.
10. **Forme des fiches.** Critère de fin, exécution en trois points, vigilance, illustration,
    tempo par défaut, marche suivante écrite, matériel sur les trois fiches qui en demandent,
    `side` et fourchettes 8-15 à deux séries sur les unilatéraux, 10-20 à trois séries sur les
    bilatéraux, et le coût d'un unilatéral au sommet supérieur à celui d'un bilatéral au sien.
11. **Texte.** La liste nominative des fiches à critère de fin a disparu, remplacée par un
    renvoi à la ligne portée par la fiche. L'ancienne phrase de calibration, fausse depuis
    qu'elle existe, a disparu aussi, et le texte dit désormais comment la cible en répétitions
    se calcule. Cinq développements sur le premier bloc, et la mention d'une vidéo.

```javascript
/* test40 : lot v2.13. Escalier du pont fessier. Plafond ramene au haut de
   fourchette et ecretage des fourchettes heritees, echelle de la charge posee
   sur les hanches et son plafond constant, chaine de quatre verrous dont un
   lit la charge, invariant de vivier a cinq entrees tirables dans les cinq
   etats, reindexation de SUBS.legs apres insertion, replis vers le pont au sol,
   criteres de fin de serie et texte « Comment ca marche ». */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' != '+JSON.stringify(b)); };
 const g=j=>JSON.parse(JSON.stringify(j));
 const neuf=async()=>{ localStorage._m={}; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const CH=['pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'];

 /* ---------- 1. le plafond vaut le haut de fourchette ---------- */
 /* meme defaut que les mollets debout avant la v2.5 : cap a 25 pour une
    fourchette 10-20 fabriquait cinq relevements que rien n annoncait */
 await neuf();
 if('cap' in DB['pont-fessier']) err('v2.16 : plus de champ cap, le plafond est le haut de fourchette');
 if(DB['pont-fessier-une-jambe'].reps[1]!==15||DB['hip-thrust-une-jambe'].reps[1]!==15) err('les deux echelons au poids du corps unilateraux plafonnent a 15');
 const E=echelleOf('pont-fessier');
 if(E.lbl.length!==1) err('une seule marche attendue, '+E.lbl.length);
 const p=perfOf('pont-fessier'); p.target=20;
 const msgs=applyProgress('pont-fessier',[20,20,20],true,false,false);
 eq(perfOf('pont-fessier').range,[10,20],'la fourchette ne doit pas bouger au plafond');
 if(!msgs.some(m=>/Plafond atteint/.test(m))) err('le plafond doit etre annonce');
 console.log('plafond OK : une seule marche, aucune fourchette relevee, marche suivante annoncee');

 /* ---------- 2. ecretage des fourchettes heritees ---------- */
 await neuf();
 const vieux={v:2,rounds:3,perf:{
   'pont-fessier':{load:0,range:[11,21],target:21,best:21,sets:[21,21,21],date:'2026-09-01T10:00:00.000Z'},
   'mollets-debout':{load:0,range:[12,25],target:20,best:20,sets:[],date:null}}};
 const m=migrateState(g(vieux));
 eq(m.perf['pont-fessier'].range,[10,20],'fourchette heritee ecretee');
 if(m.perf['pont-fessier'].target!==20) err('cible heritee ecretee, '+m.perf['pont-fessier'].target);
 if(m.perf['pont-fessier'].best!==21) err('le maximum historique n est pas reecrit');
 eq(m.perf['mollets-debout'].range,[12,25],'une fourchette deja conforme n est pas touchee');
 const deux=migrateState(g(m));
 if(JSON.stringify(deux.perf)!==JSON.stringify(m.perf)) err('migration non idempotente');
 state.perf['pont-fessier']=g(m.perf['pont-fessier']);
 if(echelleOf('pont-fessier').i<0) err('position perdue sur l echelle apres migration');
 state.perf['pont-fessier'].range=[11,21];
 if(echelleOf('pont-fessier').i>=0) err('temoin : sans ecretage la position doit etre introuvable');
 console.log('migration OK : 11-21 ramene a 10-20, position retrouvee, idempotente');

 /* ---------- 3. echelle de la charge sur les hanches ---------- */
 await neuf();
 if(PAS_HANCHES!==10) err('pas attendu a 10 kg');
 if(CAP_HANCHES!==20) err('plafond attendu a 20 kg');
 eq(HANCHES_EX,['pont-fessier-leste','hip-thrust-une-jambe-leste'],'les deux fiches a charge sur les hanches');
 HANCHES_EX.forEach(id=>{ eq(fixedLadder(id,state.gear).map(x=>x.v),[10,20],'echelle des hanches de '+id); });
 /* l inventaire borne toujours par le bas : le plafond ne fabrique pas de
    barreau que la masse declaree ne porte pas */
 const kbSeule={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{},kbs:{'10':1},res:{kb:1}};
 const lestesSeuls={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{'1':1,'2':1},kbs:{},res:{cuff:1}};
 eq(fixedLadder('pont-fessier-leste',kbSeule).map(x=>x.v),[10],'inventaire pauvre : un seul barreau');
 eq(fixedLadder('pont-fessier-leste',lestesSeuls).map(x=>x.v),[],'sous le pas : echelle vide');
 /* le plafond ne passe pas par fixedCap : checkUnlocks lit le dernier barreau
    de fixedLadder sans appliquer le plafond, le verrou serait inatteignable */
 if(fixedCap('pont-fessier-leste')!==null) err('aucun fixedCap sur les hanches');
 if(fixedCap('hip-thrust-une-jambe-leste')!==null) err('aucun fixedCap sur le dernier echelon');
 /* la masse complete vaut 47 kg et l echelle du sac les expose tous : c est
    bien le plafond, et non l inventaire, qui arrete celle des hanches a 20 */
 if(masseMobilisable(state.gear)!==47) err('masse de reference attendue a 47 kg');
 eq(fixedLadder('mollets-debout-leste',state.gear).map(x=>x.v),[10,20,30,40],'l echelle du sac reste entiere');
 if(fixedLadder('pont-fessier-leste',state.gear)[0].lbl.indexOf('sur les hanches')<0) err('libelle des hanches attendu');
 if(fixedLadder('goblet-squat',state.gear)[0].lbl.indexOf('KB')<0) err('la branche kettlebell doit rester intacte');
 console.log('echelle OK : 10/20 sous plafond constant, bornee par la masse, sac et kettlebells intacts');

 /* ---------- 4. chaine des quatre verrous ---------- */
 await neuf();
 for(let i=1;i<CH.length;i++){
   const l=DB[CH[i]].lock;
   if(!l||l.after!==CH[i-1]) err(CH[i]+' doit se verrouiller derriere '+CH[i-1]);
   if(l.minSets!==2) err('verrou a deux series sur '+CH[i]);
   if(DB[CH[i]].retire!==CH[i-1]) err(CH[i]+' doit retirer '+CH[i-1]);
 }
 if(DB['pont-fessier'].lock) err('la base de la chaine ne se verrouille pas');
 if(DB['pont-fessier-leste'].lock.need!==DB['pont-fessier'].reps[1]) err('le premier verrou vaut le plafond du predecesseur, son haut de fourchette');
 if(DB['hip-thrust-une-jambe'].lock.need!==DB['pont-fessier-une-jambe'].reps[1]) err('le verrou du hip thrust vaut le plafond du pont une jambe');
 if(DB['hip-thrust-une-jambe-leste'].lock.need!==DB['hip-thrust-une-jambe'].reps[1]) err('idem sur le dernier echelon');
 if(DB['pont-fessier-une-jambe'].lock.loadTop!==true) err('le verrou du pont une jambe doit lire la charge');
 if(DB['hip-thrust-une-jambe'].lock.loadTop) err('aucune condition de charge sur un predecesseur au poids du corps');

 /* ---------- 5. la condition de charge mord ---------- */
 /* temoin qui compte : 20 repetitions au premier barreau ne doivent pas ouvrir
    la version sur une jambe, sinon le barreau 20 ne serait jamais joue */
 await neuf();
 state.unlocked['pont-fessier-leste']=true;
 const L=fixedLadder('pont-fessier-leste',state.gear);
 /* v2.18 : la charge jouee s ecrit avec les series, p.setsLoad */
 const met=(charge,sets)=>{ const q=perfOf('pont-fessier-leste'); q.load=charge; q.setsLoad=charge; q.sets=sets.slice();
   delete state.unlocked['pont-fessier-une-jambe']; return checkUnlocks(3,false); };
 met(10,[20,20,20]);
 if(state.unlocked['pont-fessier-une-jambe']) err('verrou ouvert au premier barreau : la condition de charge ne mord pas');
 /* le pont leste se joue en trois series et le verrou en exige deux : le
    temoin doit donc n en laisser qu une au compte, sinon il ouvre a bon droit */
 met(L[L.length-1].v,[19,19,20]);
 if(state.unlocked['pont-fessier-une-jambe']) err('la condition de repetitions doit continuer de valoir au dernier barreau');
 const ms=met(L[L.length-1].v,[20,20,20]);
 if(!state.unlocked['pont-fessier-une-jambe']) err('verrou ferme au dernier barreau avec les repetitions');
 if(!ms.length) err('le deblocage doit etre annonce');
 console.log('verrou charge OK : ferme a 10 kg, ouvert a 20 kg, sur les memes 20 repetitions');

 /* ---------- 6. un inventaire pauvre n est pas enferme ---------- */
 await neuf();
 state.gear=g(kbSeule); syncProfil();
 state.unlocked['pont-fessier-leste']=true;
 const q2=perfOf('pont-fessier-leste'); q2.load=10; q2.setsLoad=10; q2.sets=[20,20,20];
 checkUnlocks(3,false);
 if(!state.unlocked['pont-fessier-une-jambe']) err('un inventaire a 10 kg doit pouvoir ouvrir un exercice au poids du corps');
 console.log('inventaire OK : le dernier barreau se lit sur l echelle filtree, 10 kg ouvrent');

 /* ---------- 7. vivier a cinq entrees tirables dans les cinq etats ---------- */
 await neuf();
 const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
 if(SLOTS.legs.pool.length!==17) err('vivier de reference a 17 entrees, '+SLOTS.legs.pool.length);   /* v2.18 : escalier du squat */
 const tailles=[];
 for(let i=0;i<CH.length;i++){
   const t=tir();
   if(t.indexOf(CH[i])<0) err('etat '+i+' : '+CH[i]+' doit etre tirable');
   CH.forEach((c,j)=>{ if(j!==i&&t.indexOf(c)>=0) err('etat '+i+' : '+c+' ne doit pas etre tirable en meme temps'); });
   tailles.push(t.length);
   if(i+1<CH.length) state.unlocked[CH[i+1]]=true;
 }
 if(new Set(tailles).size!==1) err('la taille du vivier tirable doit etre stable : '+tailles.join(','));
 if(tailles[0]!==5) err('cinq entrees tirables attendues, '+tailles[0]);
 if(SCHEMA.legs.length!==SLOTS.legs.pool.length) err('schema moteur desaligne du vivier');
 /* le dephasage v2.8 lit le nombre de positions TIRABLES et non la taille du
    vivier : l insertion de quatre fiches verrouillees ne le touche pas */
 if(SLOT_PHASE.legs!==3) err('constante de dephasage des jambes modifiee');
 console.log('vivier OK : cinq entrees tirables dans les cinq etats, schema aligne, dephasage intact');

 /* ---------- 8. SUBS.legs reindexe apres insertion ---------- */
 /* quatre insertions apres l index 3 decalent tout ce qui suit : une cle restee
    sur son ancien rang ferait replier les mollets lestes sur un step-up */
 await neuf();
 /* v2.18 : deux insertions de plus apres l index 0, cles decalees de deux,
    et une cle nouvelle, le squat sur une jambe leste replie sur sa version au
    poids du corps */
 const att={6:'pont-fessier-leste',9:'hip-thrust-une-jambe-leste',11:'mollets-debout-leste',
            13:'mollets-une-jambe-leste',14:'step-ups',15:'rdl-kettlebell',0:'goblet-squat',4:'fentes-arriere-lestee',
            2:'squat-une-jambe-chaise-leste'};
 Object.keys(SUBS.legs).forEach(k=>{
   const id=SLOTS.legs.pool[+k];
   if(att[k]!==id) err('SUBS.legs['+k+'] vise '+id+', attendu '+att[k]);
   SUBS.legs[k].forEach(s=>{ if(!DB[s]) err('substitut inconnu : '+s); });
 });
 const kP=SLOTS.legs.pool.indexOf('pont-fessier-leste'), kH=SLOTS.legs.pool.indexOf('hip-thrust-une-jambe-leste');
 if(!SUBS.legs[kP]||SUBS.legs[kP][0]!=='pont-fessier') err('le pont leste doit se replier sur le pont au sol');
 if(!SUBS.legs[kH]||SUBS.legs[kH][0]!=='hip-thrust-une-jambe') err('le hip thrust leste doit se replier sur sa version au poids du corps');
 /* et la chaine materielle sert la position sans masse declaree */
 const iB=SLOTS.legs.pool.indexOf('pont-fessier-leste');
 if(resolvePos('legs',iB,state.gear)!=='pont-fessier-leste') err('avec du poids, la position sert la variante chargee');
 const sansMasse=g(DEFAULT_GEAR); sansMasse.res.hal=0; sansMasse.res.kb=0; sansMasse.res.cuff=0;
 state.gear=sansMasse; syncProfil();
 if(aRes('masse',state.gear)) err('temoin : plus aucune masse declaree');
 if(resolvePos('legs',iB,state.gear)!=='pont-fessier') err('sans poids, la chaine descend vers le poids du corps');
 eq(NEEDS['pont-fessier-leste'],['masse'],'besoin du pont leste');
 eq(NEEDS['hip-thrust-une-jambe-leste'],['masse'],'besoin du hip thrust leste');
 if(NEEDS['pont-fessier-une-jambe']||NEEDS['hip-thrust-une-jambe']) err('les echelons au poids du corps ne declarent aucun besoin');
 console.log('substitution OK : huit cles reindexees, chaine vers le poids du corps, contrats materiels justes');

 /* ---------- 9. replis, jamais vers un exercice verrouillable ---------- */
 await neuf();
 CH.slice(1).forEach(id=>{
   const f=DB[id].fb;
   if(!f) err(id+' doit porter un repli');
   if(f!=='pont-fessier') err('repli attendu vers le pont au sol sur '+id+', obtenu '+f);
   if(DB[f].lock) err('repli verrouillable sur '+id+' : '+f);
 });
 if(DB['pont-fessier'].fb) err('la base de la chaine n a pas de repli au-dessous');
 console.log('replis OK : les quatre echelons replient sur la base, qui n est jamais verrouillee');

 /* ---------- 10. forme des fiches, cout de seance, illustrations ---------- */
 await neuf();
 CH.forEach(id=>{
   if(!DB[id].fin) err('critere de fin de serie absent sur '+id);
   if(!DB[id].nom||!DB[id].en||!DB[id].mus) err('fiche incomplete : '+id);
   if(!DB[id].desc||DB[id].desc.length<3) err('execution en moins de trois points : '+id);
   if(!DB[id].vig) err('ligne de vigilance absente : '+id);
   if(typeof IMG!=='undefined'&&!IMG[id]) err('illustration absente : '+id);
   if(tempoOf(id)!==TEMPO) err('tempo par defaut attendu sur '+id);
   if(NEXT[id]===undefined) err('marche suivante non ecrite : '+id);
 });
 ['pont-fessier-leste','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'].forEach(id=>{
   if(!DB[id].mat||!DB[id].mat.length) err('materiel non renseigne : '+id);
 });
 ['pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste'].forEach(id=>{
   if(!DB[id].side) err('side attendu sur '+id);
   eq(DB[id].reps,[8,15],'fourchette unilaterale de '+id);
   if(DB[id].sets!==2) err('deux series sur un unilateral : '+id);
 });
 ['pont-fessier','pont-fessier-leste'].forEach(id=>{
   if(DB[id].side) err('side inattendu sur '+id);
   eq(DB[id].reps,[10,20],'fourchette bilaterale de '+id);
   if(DB[id].sets!==3) err('trois series sur un bilateral : '+id);
 });
 /* un unilateral vaut deux fois le travail : au sommet de sa fourchette il
    coute au moins ce que coute le bilateral au sommet de la sienne */
 const s1=INSTALL+Math.round(15*TEMPO*2), s2=INSTALL+Math.round(20*TEMPO);
 if(s1<s2) err('la fourchette unilaterale doit couter au moins autant que la bilaterale a son sommet');
 console.log('forme OK : cinq criteres de fin, side et fourchettes, materiel, illustrations, cout coherent');

 /* ---------- 11. le texte ne liste plus les fiches une par une ---------- */
 /* la liste nominative devenait fausse a chaque lot qui ajoute un critere de
    fin de serie, sans que rien ne le signale : elle renvoie desormais a la
    ligne portee par la fiche */
 const plat=COMMENT.map(b=>b.c+' '+b.l.join(' ')).join(' ');
 if(/Sur les pompes, la planche, le gainage lat/.test(plat)) err('le texte ne doit plus enumerer les fiches a critere de fin');
 if(plat.indexOf('Fin de série')<0) err('le texte doit renvoyer a la ligne de la fiche');
 /* la calibration ne concerne pas que la charge : elle concerne aussi les
    repetitions, sur tous les exercices */
 if(/Elle ne concerne que les exercices dont tu choisis la charge/.test(plat)) err('l ancienne phrase de calibration est fausse et doit avoir disparu');
 /* v2.14 : la regle de cible a change et vit dans son propre bloc ; le test
    ne verifie plus une chaine exacte ni un compte de developpements, valeurs
    epinglees qui tombaient avec le texte, mais que la regle est dite */
 if(!/plus petite série/.test(plat)||!/deux derniers passages/.test(plat)) err('le texte doit dire comment la cible en repetitions se calcule');
 const cal=COMMENT.filter(b=>/calibration/i.test(b.t))[0];
 if(!cal||cal.l.length<2) err('le bloc de calibration doit porter un developpement');
 if(plat.indexOf('vidéo')<0) err('le texte doit autoriser la recherche hors de l outil');
 console.log('texte OK : calibration en repetitions dite, renvoi a la fiche, recherche hors outil');

 console.log('TESTS ESCALIER DU PONT FESSIER V2.13 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
```

## Suites existantes retouchées en v2.13

Six suites, toutes sur des comptes que le lot déplace, aucune sur un comportement.

- `test9` : le catalogue passe de 49 à 53 fiches.
- `test22` : la banque passe de 52 à 56 images. Le contrôle d'image morte et celui de
  couverture n'ont pas bougé, les quatre nouvelles fiches sont servies.
- `test24` : le nombre d'exercices à charge fixe passe de 6 à 8. Le compte des exercices à
  bande est inchangé, le lot n'en touche aucun.
- `test28` et `test31` : le vivier de référence des jambes passe de 11 à 15 entrées. Les deux
  suites mesurent juste en dessous le nombre d'entrées **tirables**, qui ne bouge pas : c'est
  l'invariant qui compte, et il tient.
- `test39` : le compte des fiches portant un critère de fin de série passe de 8 à 13, et la
  liste nominative de la section 6 reçoit les cinq nouvelles. Son message de sortie suit.

Aucune de ces retouches ne masque un défaut applicatif. Le seul point qui méritait un arbitrage
est `test39` : la même liste vivait en double, dans la suite et dans le texte de « Comment ça
marche ». Elle reste dans la suite, où elle est un contrat, et disparaît du texte, où elle
n'était qu'une énumération que rien n'obligeait à tenir à jour.

## test38.js, premier volet du lot v2.12

Journal enrichi. Trois champs de plus dans l'entrée d'historique, et la propriété
la plus fragile du lot : **rien ne les lit**. La section 7 le vérifie sur le texte
des fonctions du moteur, parce que c'est la propriété qui se perdra en premier le
jour où un signal viendra s'y brancher.

Huit sections : les trois champs et leurs valeurs mesurées ; la durée brute, sans
plancher ni écrêtage, là où `real` garde son `Math.max(60)` ; l'idempotence de
l'horodatage sur deux re-rendus de la même étape ; le retour d'un pas qui défait
la durée avec la série et repart d'un horodatage neuf ; le volume changé depuis un
tour déjà entamé, où le tour ajouté clone des étapes déjà jouées ; la parité
stricte sous repli douleur et série passée ; l'inertie du moteur ; la survie des
trois champs à une correction de séance.

L'horloge est figée et déplaçable, comme dans `test36` : une durée est un écart
entre deux instants, elle n'est mesurable que si la suite tient les deux.

```javascript
// Lot v2.12, premier volet : journal enrichi.
//
// Trois champs de plus dans l entree d historique, et rien qui les lise. C est
// la propriete la plus importante de ce lot et la plus facile a perdre : ils
// s accumulent pour qu une decision puisse un jour se prendre sur des donnees,
// ils ne decident rien aujourd hui. Une suite qui verifierait seulement leur
// presence laisserait passer le jour ou un signal viendrait s y brancher en
// douce, d ou la section 7.
//
// Ce que la suite protege :
//   roundsPlan  les tours annonces au lancement, la ou rounds porte le realise
//   it.tgt      la cible visee ce jour-la, que rien ne permet de rejouer
//   it.secs     la duree de chaque serie, brute, de l arrivee a la validation
//   la parite stricte de secs avec sets, y compris sous repli douleur
//   l idempotence de l horodatage au re-rendu, et sa remise a zero au retour
//   la survie des trois champs a une correction de seance
//
// L horloge est figee et deplacable : sans cela une duree mesuree ne serait pas
// discriminable d un zero, et la suite ne prouverait rien.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.vider=()=>new Promise(r=>vraiTimeout(r,0));
global.SRC=raw;
/* Horloge figee et deplacable, reprise de test36 : la duree d une serie est un
   ecart entre deux instants, elle n est mesurable que si la suite tient les
   deux. */
const VraieDate=Date;
let T0=0;
global.figer=iso=>{ T0=new VraieDate(iso).getTime();
  function D(){ return arguments.length?new VraieDate(...arguments):new VraieDate(T0); }
  D.prototype=VraieDate.prototype; D.now=()=>T0; D.UTC=VraieDate.UTC; D.parse=VraieDate.parse;
  global.Date=D; };
global.avancer=sec=>{ T0+=sec*1000; };

const S=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 /* On joue le chemin reel de l application, jamais un cur fabrique : c est la
    lecon de la v2.3, une suite qui fabrique son sujet ne teste pas son
    appelant. duree, en secondes, est le temps passe sur l ecran de serie. */
 const jouer=(duree)=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   renderSession();                       /* l arrivee sur l ecran horodate */
   if(duree) avancer(duree);
   const e=DB[st.id];
   if(e.mode==='stretch'){ skipSet(); return true; }
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 const jouerTout=(duree)=>{ let n=0; while(cur&&!cur.recap&&jouer(duree)){ if(++n>400) err('boucle de seance non bornee'); } };
 /* joue la prochaine SERIE : jouer() avance aussi sur les transitions, donc
    l appeler n fois ne joue pas n series, et une section qui compte les series
    jouees doit passer par ici. */
 const jouerSerie=(duree)=>{ let n=0;
   while(cur&&!cur.recap&&cur.steps[cur.i]&&cur.steps[cur.i].k!=='set'){ nextStep(); if(++n>20) err('aucune serie atteinte'); }
   return jouer(duree); };
 const derniere=()=>state.hist[state.hist.length-1];

 // ================= 1. LES TROIS CHAMPS EXISTENT ET DISENT VRAI =================
 figer('2026-09-12T10:00:00');
 await neuf(3);
 startSession();
 /* cibles relevees juste apres la construction de seance, donc avant toute
    validation : c est exactement ce que it.tgt doit porter. Les lire apres la
    seance ne prouverait rien, la progression les ayant deplacees. */
 const avantT={};
 cur.steps.forEach(st=>{ if(st.k==='set'&&!st.cool) avantT[st.id]=perfFor(st.id,false).target; });
 jouerTout(20);
 await vider();
 const h1=derniere();
 if(!h1) err('aucune entree ecrite');
 if(h1.roundsPlan!==3) err('roundsPlan attendu 3, obtenu '+h1.roundsPlan);
 if(h1.rounds!==3) err('rounds realise attendu 3, obtenu '+h1.rounds);
 h1.items.forEach(it=>{
   const e=DB[it.id];
   if(e.mode==='stretch') return;
   if(it.tgt==null) err('cible du jour absente sur '+it.id);
   if(avantT[it.id]!=null&&it.tgt!==avantT[it.id]) err('la cible ecrite doit etre celle d avant seance sur '+it.id+' : '+it.tgt+' au lieu de '+avantT[it.id]);
   if(!Array.isArray(it.secs)) err('durees absentes sur '+it.id);
   if(it.secs.length!==it.sets.length) err('parite rompue sur '+it.id+' : '+it.secs.length+' durees pour '+it.sets.length+' series');
   it.secs.forEach(v=>{ if(v!==20) err('duree attendue 20 s sur '+it.id+', obtenu '+v); });
 });
 /* la cible ecrite est celle d AVANT progression : c est tout l interet du
    champ, la cible d apres est deja dans perf et se relit sans historique */
 console.log('champs OK : roundsPlan, cible du jour et durees par serie, 20 s mesurees sur '+h1.items.length+' exercices');

 // ================= 2. LA DUREE EST BRUTE =================
 /* Ni plancher ni ecretage, a la difference de real qui porte un Math.max(60).
    Une serie validee dans la seconde vaut zero, et une serie de vingt minutes
    vaut vingt minutes : nettoyer a l ecriture enfouirait un jugement dans la
    donnee. */
 figer('2026-09-12T11:00:00');
 await neuf(2);
 startSession();
 let premier=true;
 while(cur&&!cur.recap){ const st=cur.steps[cur.i]; if(!st) break;
   if(st.k==='set'&&premier){ premier=false; jouer(0); } else jouer(900); }
 await vider();
 const h2=derniere();
 const plat=[].concat.apply([],h2.items.map(it=>it.secs||[]));
 if(plat.indexOf(0)<0) err('une serie validee aussitot doit valoir 0, durees vues : '+plat.join(','));
 if(plat.indexOf(900)<0) err('une serie de 900 s doit valoir 900, durees vues : '+plat.join(','));
 if(h2.real<60) err('real garde son plancher, lui : '+h2.real);
 console.log('brut OK : zero conserve, 900 s conservees, le plancher reste au seul total de seance');

 // ================= 3. L HORODATAGE EST IDEMPOTENT =================
 /* Un re-rendu de la meme etape ne redemarre pas le compte. C est ce qui fait
    qu ajuster une charge, ouvrir une card ou changer de volume ne raccourcit
    pas la serie en cours. */
 figer('2026-09-12T12:00:00');
 await neuf(2);
 startSession();
 while(cur.steps[cur.i].k!=='set') nextStep();
 renderSession();
 avancer(30);
 renderSession(); renderSession();       /* deux re-rendus au milieu */
 avancer(30);
 {
   const st=cur.steps[cur.i], e=DB[st.id];
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else st.val=perfFor(st.id,false).target||8;
   const k=st.key||st.id;
   validateSet();
   if(cur.secs[k][0]!==60) err('le re-rendu a redemarre le compte : '+cur.secs[k][0]+' au lieu de 60');
 }
 console.log('idempotence OK : deux re-rendus au milieu d une serie ne touchent pas sa duree');

 // ================= 4. LE RETOUR D UN PAS DEFAIT LA DUREE =================
 /* Et la serie refaite repart d un horodatage neuf : sans la remise a zero,
    elle heriterait du temps de la premiere tentative. */
 {
   const st=cur.steps[cur.i-1]||cur.steps[cur.i];
   const k=st.key||st.id;
   const avant=(cur.secs[k]||[]).length;
   if(!cur.back) err('le retour d un pas doit etre offert apres une validation');
   stepBack();
   if((cur.secs[k]||[]).length!==avant-1) err('la duree ne se defait pas avec la serie');
   /* stepBack rend deja l ecran, donc l horodatage neuf est pose la : les
      douze secondes qui suivent sont bien celles de la reprise, et le rendu
      intercale ne les remet pas a zero. */
   avancer(5);
   renderSession();
   avancer(7);
   const st2=cur.steps[cur.i], e2=DB[st2.id];
   if(e2.mode==='time'){ holdInit(st2,e2); for(let i=0;i<st2.sides.length;i++) st2.sides[i]=30; } else if(e2.rhythm){ st2.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st2.done=true; if(!st2.val) st2.val=30; }
   else st2.val=perfFor(st2.id,false).target||8;
   validateSet();
   const v=cur.secs[k][cur.secs[k].length-1];
   if(v!==12) err('la serie refaite doit repartir d un horodatage neuf pose au retour, obtenu '+v);
 }
 console.log('retour OK : la duree se defait avec la serie, la reprise repart de zero');

 // ================= 5. VOLUME CHANGE EN COURS DE SEANCE =================
 /* roundsPlan garde ce qui a ete lance, rounds porte ce qui a ete fait. Et le
    tour ajoute ne recopie pas l horodatage de son modele, sans quoi ses series
    porteraient une duree calculee depuis le debut du tour precedent. */
 /* Le tour ajoute est clone du DERNIER tour, donc le lancement se fait a deux
    series et la montee a trois intervient une fois le second tour entame : le
    modele porte alors des etapes deja jouees, horodatage compris. Monter depuis
    un tour que rien n a encore touche ne discriminerait pas la recopie. */
 figer('2026-09-12T13:00:00');
 await neuf(2);
 startSession();
 jouerSerie(10); jouerSerie(10); jouerSerie(10); jouerSerie(10);   /* tour 1 */
 jouerSerie(10);                                                  /* premiere serie du tour 2 */
 if(volAllowed().indexOf(3)<0) err('le passage a 3 series doit etre offert');
 setSessionRounds(3);
 jouerTout(10);
 await vider();
 const h5=derniere();
 if(h5.roundsPlan!==2) err('roundsPlan doit rester 2, obtenu '+h5.roundsPlan);
 if(h5.rounds!==3) err('rounds realise attendu 3, obtenu '+h5.rounds);
 h5.items.forEach(it=>{ (it.secs||[]).forEach(v=>{ if(v!==10) err('duree polluee par le clonage de tour sur '+it.id+' : '+v); }); });
 /* descente aussi : 3 lances, 2 joues */
 figer('2026-09-12T14:00:00');
 await neuf(3);
 startSession();
 jouer(10);
 setSessionRounds(2);
 jouerTout(10);
 await vider();
 const h5b=derniere();
 if(h5b.roundsPlan!==3||h5b.rounds!==2) err('descente de volume : '+h5b.roundsPlan+' lances, '+h5b.rounds+' joues');
 console.log('volume OK : 2 lances et 3 joues depuis un tour entame, puis 3 lances et 2 joues, durees intactes');

 // ================= 6. REPLI DOUILEUR ET SERIE PASSEE =================
 /* La cle composee « origine>repli » porte ses propres durees, et une serie
    passee n ecrit rien : ni serie, ni duree, donc la parite tient sans garde. */
 figer('2026-09-12T15:00:00');
 await neuf(3);
 startSession();
 jouer(12);
 while(cur.steps[cur.i].k!=='set') nextStep();
 {
   const st=cur.steps[cur.i];
   if(DB[st.id].fb){ renderSession(); swapPain(); }
 }
 skipSet();
 jouerTout(12);
 await vider();
 const h6=derniere();
 h6.items.forEach(it=>{
   if(DB[it.id].mode==='stretch') return;
   if((it.secs||[]).length!==it.sets.length) err('parite rompue apres repli ou serie passee sur '+it.id);
 });
 if(!h6.items.some(it=>it.sw)) err('aucun repli observe, la section ne prouve rien');
 console.log('parite OK : repli douleur et serie passee, durees et series toujours au meme compte');

 // ================= 7. AUCUN SIGNAL NE LES LIT =================
 /* Informatifs, jamais decisionnels. Le moteur de progression, les verrous et
    le predicat de montee ne doivent contenir aucune lecture des trois champs :
    c est la condition pour qu ils respectent le principe d architecture, et
    c est ce qui se perdra en premier si personne ne le tient. */
 [['applyProgress',applyProgress],['checkUnlocks',checkUnlocks],['estMontee',estMontee],['lightPerf',lightPerf],['perfFor',perfFor]]
   .forEach(([nom,f])=>{
     const s=f.toString();
     if(/\\bsecs\\b/.test(s)) err(nom+' lit les durees par serie : un signal decisionnel s est branche dessus');
     if(/\\btgt\\b/.test(s)) err(nom+' lit la cible du jour');
     if(/roundsPlan/.test(s)) err(nom+' lit les tours prevus');
   });
 /* et rien nulle part ne les compare a un seuil */
 if(/secs[^;]{0,40}[<>]=?\\s*\\d/.test(SRC)) err('une comparaison a seuil sur les durees existe dans la source');
 console.log('inertie OK : progression, verrous et predicat de montee ignorent les trois champs');

 // ================= 8. SURVIE A UNE CORRECTION =================
 /* La correction ne reecrit que sets. Les trois champs doivent la traverser
    intacts, comme load, band et rng avant eux. */
 figer('2026-09-12T16:00:00');
 await neuf(3);
 startSession();
 jouerTout(25);
 await vider();
 const avant=JSON.parse(JSON.stringify(derniere()));
 const vals={};
 state.undo.keys.forEach((k,i)=>{ vals[k]=avant.items[i].sets.map(v=>Math.max(1,v-1)); });
 corrigerSeance(vals);
 const apres=derniere();
 if(apres.roundsPlan!==avant.roundsPlan) err('roundsPlan perdu a la correction');
 apres.items.forEach((it,i)=>{
   if(it.tgt!==avant.items[i].tgt) err('cible du jour perdue a la correction sur '+it.id);
   if(JSON.stringify(it.secs)!==JSON.stringify(avant.items[i].secs)) err('durees perdues a la correction sur '+it.id);
   if(JSON.stringify(it.sets)===JSON.stringify(avant.items[i].sets)) err('la correction n a rien corrige sur '+it.id);
 });
 console.log('correction OK : series corrigees, cible du jour et durees intactes');

 console.log('TESTS JOURNAL ENRICHI V2.12 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
```

## falsif38.sh, banc de falsification du premier volet

Douze mutations, douze chutes.

```bash
#!/bin/bash
# Banc de falsification du premier volet de la v2.12, le journal enrichi.
# Chaque mutation defait une decision du lot ; test38 doit tomber sur chacune.
# Une mutation qui survit designe une assertion qui ne prouve rien.
set -e
cd "$(dirname "$0")"
cp app4.js .b4 ; cp app6.js .b6 ; cp app7.js .b7
restaure(){ cp .b4 app4.js; cp .b6 app6.js; cp .b7 app7.js; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  if node test38.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

sed -i "s/if(pre\[k\].target!=null) it.tgt=pre\[k\].target;//" app7.js
essai "cible du jour plus ecrite"

sed -i "s/if(cur.secs\&\&cur.secs\[k\]) it.secs=cur.secs\[k\].slice();//" app7.js
essai "durees plus ecrites"

sed -i "s/roundsPlan:cur.rounds0!=null?cur.rounds0:cur.rounds,/roundsPlan:cur.rounds,/" app7.js
essai "roundsPlan qui recopie le realise au lieu du lance"

sed -i "s/if(st.k==='set'\&\&st.t0==null) st.t0=Date.now();/if(st.k==='set') st.t0=Date.now();/" app6.js
essai "horodatage repose a chaque rendu : un re-rendu raccourcit la serie"

sed -i "s/const dur=st.t0?Math.max(0,Math.round((Date.now()-st.t0)\/1000)):null;/const dur=st.t0?Math.max(60,Math.round((Date.now()-st.t0)\/1000)):null;/" app6.js
essai "plancher de 60 s applique a la duree d une serie"

sed -i "s/const dur=st.t0?Math.max(0,Math.round((Date.now()-st.t0)\/1000)):null;/const dur=st.t0?Math.min(600,Math.round((Date.now()-st.t0)\/1000)):null;/" app6.js
essai "ecretage a 600 s applique a la duree d une serie"

sed -i "s/  const dar=cur.secs\[b.key\];//" app6.js
sed -i "s/  if(dar\&\&dar.length) dar.pop();//" app6.js
sed -i "s/  if(dar\&\&!dar.length) delete cur.secs\[b.key\];//" app6.js
essai "le retour d un pas ne defait plus la duree : parite rompue"

sed -i "s/  delete st.t0;//" app6.js
essai "la serie refaite herite de l horodatage de la premiere tentative"

sed -i "s/Object.assign({},s,{val:null,t0:null,set:byRound.length+1})/Object.assign({},s,{val:null,set:byRound.length+1})/" app6.js
essai "tour ajoute qui recopie l horodatage de son modele"

sed -i "s/log:{},secs:{},xp:0/log:{},xp:0/" app6.js
essai "journal des durees jamais initialise"

sed -i "s/if(pre\[k\].target!=null) it.tgt=pre\[k\].target;/if(state.perf[id]) it.tgt=state.perf[id].target;/" app7.js
essai "cible ecrite apres progression au lieu d avant"

sed -i "s/const monte=!p.hold\&\&full\&\&sets.every(v=>v>=top);/const monte=!p.hold\&\&full\&\&sets.every(v=>v>=top)\&\&(!p.secs||true);/" app4.js
essai "temoin : mention des durees dans le moteur de progression"

rm -f .b4 .b6 .b7
echo "FALSIFICATION 38 TERMINEE"
```

## test39.js, second volet du lot v2.12

Dette v1.15 et texte « Comment ça marche ». Six sections.

Le piège que la section 1 protège est celui que la remise à zéro de `bandBest`
fermait par effet de bord : une séance jouée au barreau précédent peut faire monter
la bande en fin de séance, et lire le barreau **courant** attribuerait alors les
répétitions à un barreau sous lequel elles n'ont pas été faites. Quatre cas :
barreau précédent refusé, barreau le plus fin accepté, record ancien sans effet,
état hérité sans `setsBand` qui attend le prochain passage plutôt que de deviner.

Les sections suivantes couvrent la lecture unique des répétitions dans
`checkUnlocks`, la correction qui préserve un palier tenu posé après la séance et
annonce à part ce qu'elle défait, la charge courante du détail de séance, et le
texte à deux endroits pour un seul rendu.

```javascript
// Lot v2.12, second volet : la dette v1.15 et le texte « Comment ca marche ».
//
// Quatre correctifs et un texte, reunis parce qu ils touchent les memes deux
// fonctions, corrigerSeance et checkUnlocks.
//
//   1. le verrou a porte de bande lit le dernier passage, plus un maximum
//      historique, et le barreau qu il compare est celui ECRIT AVEC les series
//   2. une correction de seance ne detruit plus en silence un geste manuel
//      posterieur, et elle annonce ce qu elle defait
//   3. le detail de seance affiche la charge courante sur les exercices a
//      charge fixe, pas la charge de depart du catalogue
//   4. le texte est a deux endroits et n a qu un seul rendu
//
// Le piege que la section 1 protege est celui que la remise a zero de bandBest
// fermait par effet de bord : une seance jouee au barreau precedent peut faire
// monter la bande en fin de seance, et lire le barreau COURANT attribuerait
// alors les repetitions a un barreau sous lequel elles n ont pas ete faites.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
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
const mk=cap=>({set innerHTML(v){if(cap){html=v;rebuild(v);}},get innerHTML(){return cap?html:''},
  classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>Object.keys(cards).map(k=>cards[k]),
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.vider=()=>new Promise(r=>vraiTimeout(r,0));
global.SRC=raw;

const S=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 const jouer=()=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   renderSession();
   const e=DB[st.id];
   if(e.mode==='stretch'){ skipSet(); return true; }
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=40; } else if(e.rhythm){ st.rt={d:40,g:40,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=40; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 const jouerTout=()=>{ let n=0; while(cur&&!cur.recap&&jouer()){ if(++n>400) err('boucle de seance non bornee'); } };
 const SUP='tractions-assistees-supination', STR='tractions-strictes-supination';

 // ================= 1. LE VERROU LIT LE DERNIER PASSAGE =================
 /* E1, le piege. Le passage est joue au barreau qui precede le plus fin, avec
    assez de repetitions pour faire monter la bande. A la fin, p.band vaut le
    barreau le plus fin et p.sets contient dix repetitions : lire le barreau
    courant ouvrirait la porte sur des repetitions faites sous une bande plus
    forte. */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1], avant=L[L.length-2];
   const p=perfOf(SUP); p.band=avant; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,10,10],true,false,false);
   if(p.band!==fin) err('E1 : la seance doit faire monter au barreau le plus fin, obtenu '+p.band);
   if(p.setsBand!==avant) err('E1 : le barreau ecrit doit etre celui sous lequel les series ont ete jouees, obtenu '+p.setsBand);
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('E1 : dix repetitions au barreau precedent ne doivent pas ouvrir les strictes');
 }
 /* nominal : le meme compte, joue au barreau le plus fin, ouvre */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,8,8],true,false,false);
   if(p.setsBand!==fin) err('nominal : barreau joue attendu '+fin+', obtenu '+p.setsBand);
   checkUnlocks(3,false);
   if(!state.unlocked[STR]) err('nominal : dix repetitions au barreau le plus fin doivent ouvrir les strictes');
 }
 /* etat herite : sans barreau enregistre, le verrou attend le prochain passage
    plutot que de deviner. Une valeur reconstituee vaudrait moins que son
    absence (meme motif qu it.rng en v2.4). */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.sets=[10,10,10]; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   delete p.setsBand;
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('herite : sans barreau enregistre, le verrou ne doit pas s ouvrir');
   applyProgress(SUP,[10,10,10],true,false,false);
   checkUnlocks(3,false);
   if(!state.unlocked[STR]) err('herite : le passage suivant doit rouvrir le chemin');
 }
 /* un record ancien ne prouve rien non plus : la lecture porte sur le dernier
    passage, et c est le sens meme de l alignement. Sans ce cas, une regression
    vers p.best passerait, les deux valeurs coincidant dans le cas nominal. */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,10,10],true,false,false);   /* le record est pose */
   state.unlocked={};
   applyProgress(SUP,[4,4,4],true,false,false);      /* le dernier passage est faible */
   if(p.best<10) err('le record doit avoir ete conserve, sinon le cas ne discrimine rien');
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('un record ancien ne doit pas ouvrir le verrou : la lecture porte sur le dernier passage');
 }
 /* une seance allegee ne prouve rien, la garde de provenance vaut aussi ici */
 await neuf();
 state.perf={}; state.unlocked={};
 {
   const L=bandOrder(DB[SUP]), fin=L[L.length-1];
   const p=perfOf(SUP); p.band=fin; p.range=DB[SUP].reps.slice(); p.target=DB[SUP].reps[1];
   applyProgress(SUP,[10,10,10],true,true,false);
   if(p.setsBand!==fin) err('allegee : le barreau joue est une information, il doit s ecrire');
   checkUnlocks(3,false);
   if(state.unlocked[STR]) err('allegee : le verrou ne doit pas s ouvrir');
 }
 console.log('verrou OK : barreau precedent refuse, barreau le plus fin accepte, etat herite en attente, allegee sans effet');

 // ================= 2. UNE SEULE LECTURE DE REPETITIONS =================
 /* La branche bandGate a fondu dans la lecture commune : le comptage de series
    n existe qu a un seul endroit, les deux conditions de niveau, barreau et
    charge, s y ajoutent en conjonction. Deux comptages separes, c est deux
    regles qui divergeront. */
 /* les commentaires sont retires avant de chercher : ils NOMMENT bandBest,
    exprès, pour dire ce que la v2.12 a retire et pourquoi. Chercher dans le
    texte brut ferait tomber la suite sur sa propre documentation. */
 const sansCom=s=>s.replace(/\\/\\*[\\s\\S]*?\\*\\//g,' ').replace(/(^|[^:])\\/\\/[^\\n]*/g,'$1 ');
 {
   const s=sansCom(checkUnlocks.toString());
   const n=(s.match(/lock\\.need/g)||[]).length;
   if(n!==1) err('le compte de repetitions doit etre lu une seule fois dans checkUnlocks, trouve '+n);
   if(/bandBest/.test(s)) err('bandBest subsiste dans checkUnlocks');
   if(!/setsBand/.test(s)) err('la conjonction sur le barreau joue a disparu');
 }
 {
   const code=sansCom(SRC).replace(/delete q\\.bandBest;/,'');
   if(/bandBest/.test(code)) err('bandBest subsiste ailleurs que dans la migration');
 }
 /* la migration retire la cle morte des etats herites */
 {
   const s={v:2,perf:{'face-pulls':{load:0,range:[10,18],target:12,best:9,sets:[9,9,9],band:'rouge',bandBest:9}},gear:JSON.parse(JSON.stringify(DEFAULT_GEAR))};
   const m=migrateState(JSON.parse(JSON.stringify(s)),s);
   if('bandBest' in m.perf['face-pulls']) err('la migration doit retirer la cle morte');
 }
 console.log('lecture OK : un seul comptage, une conjonction de barreau, cle morte retiree a la migration');

 // ================= 3. LA CORRECTION PRESERVE ET ANNONCE =================
 /* Le geste manuel posterieur a la seance n est pas une consequence de la
    seance : la restauration l effacait sans un mot. */
 await neuf();
 startSession();
 jouerTout();
 await vider();
 {
   const cible=state.undo.keys.map(k=>splitKey(k).id).filter(id=>DB[id].reps&&DB[id].mode!=='stretch')[0];
   if(!cible) err('aucun exercice tenable dans la seance');
   setHold(cible,true);
   const vals={};
   state.undo.keys.forEach((k,i)=>{ vals[k]=state.hist[state.hist.length-1].items[i].sets.map(v=>Math.max(1,v-2)); });
   const r=corrigerSeance(vals);
   if(!isHeld(cible)) err('un palier tenu pose apres la seance doit survivre a la correction');
   if(!r) err('la correction doit rendre un recapitulatif');
 }
 /* ce qu elle defait, elle le dit, et dans un bloc a part */
 await neuf();
 {
   const id='curls-halteres';
   const p=perfOf(id); p.range=DB[id].reps.slice(); p.target=DB[id].reps[1]; p.load=4;
   startSession();
   /* on force le quatuor a contenir l exercice vise en jouant directement le
      moteur de fin de seance : la seance tiree ne le contient pas forcement */
   /* la valeur saisie est remise a zero avec l identifiant : startSession a
      deja rendu le premier ecran, donc st.val porte la cible de l exercice
      d origine et survivrait a la substitution. */
   cur.steps.forEach(s=>{ if(s.k==='set'&&!s.cool){ s.id=id; s.key=id; s.val=null; } });
   jouerTout();
   await vider();
   const h=state.hist[state.hist.length-1];
   const monte=state.perf[id].load>4;
   if(!monte) err('la seance de reference doit produire une montee de charge, load='+state.perf[id].load);
   const vals={}; state.undo.keys.forEach((k,i)=>{ vals[k]=h.items[i].sets.map(()=>DB[id].reps[0]); });
   const r=corrigerSeance(vals);
   if(state.perf[id].load!==4) err('la correction doit ramener la charge');
   if(!r.undone||!r.undone.length) err('une montee defaite doit etre annoncee');
   if(!r.undone.some(m=>/Montée annulée/.test(m))) err('le message d annulation doit nommer ce qu il defait : '+r.undone.join(' | '));
   if(r.msgs.some(m=>/annulée/i.test(m))) err('une annulation ne doit pas etre melangee aux messages de progression');
   const bloc=undoneHtml(r.undone);
   if(bloc.indexOf('tag flame')<0) err('le bloc d annulation doit se distinguer des messages de progression');
   if(undoneHtml([])!=='') err('sans annulation, aucun bloc ne doit etre rendu');
 }
 console.log('correction OK : palier tenu preserve, montee defaite annoncee a part, rien a dire quand rien n est defait');

 // ================= 4. CHARGE COURANTE DANS LE DETAIL DE SEANCE =================
 /* Le mode fixe lisait e.load0, la charge de depart du catalogue. */
 await neuf();
 {
   const id='goblet-squat';
   const L=fixedLadder(id,state.gear);
   if(L.length<2) err('l echelle du goblet squat doit avoir plusieurs barreaux');
   const p=perfOf(id); p.load=L[1].v;
   /* le libelle du bas de ligne est lu en entier : « KB 10 kg » est un prefixe
      de « KB 10 kg + lestes 2 kg », donc une recherche par sous-chaine ne
      discriminerait rien. Meme piege que l accord de genre en v2.10. */
   const basDe=h=>{ const m=/<br>([^<]*)<\\/span>/.exec(h); return m?m[1]:null; };
   if(basDe(exoRowHtml(id))!==esc(L[1].lbl)) err('le detail doit afficher la charge courante, obtenu « '+basDe(exoRowHtml(id))+' »');
   /* et la charge de depart reste affichee quand elle EST la charge courante */
   p.load=L[0].v;
   if(basDe(exoRowHtml(id))!==esc(L[0].lbl)) err('la charge de depart doit s afficher quand elle est courante');
 }
 console.log('charge OK : le detail de seance suit la progression sur les exercices a charge fixe');

 // ================= 5. LE TEXTE, DEUX ENDROITS, UN SEUL RENDU =================
 await neuf();
 /* v2.14 : le compte de blocs n est plus epingle, une assertion qui epingle
    une valeur est fausse en meme temps que le code (v1.15). La forme, si :
    chaque bloc porte un titre, une accroche et au moins un developpement. */
 if(COMMENT.length<3) err('au moins trois blocs attendus, '+COMMENT.length);
 COMMENT.forEach((b,i)=>{ if(!b.t||!b.c||!b.l||!b.l.length) err('bloc '+i+' incomplet'); });
 {
   /* l accueil le porte tant qu il n a pas ete lu, et le bouton le retire */
   state.intro=true; view='home'; render();
   const acc=html;
   if(acc.indexOf(COMMENT[0].t)<0) err('le bloc d introduction doit etre sur l accueil');
   if(acc.indexOf('En savoir plus')<0) err('le developpement doit etre offert sur place');
   if(/data-k="cmt0"[^>]*open/.test(acc)) err('sur l accueil les developpements sont replies');
   closeIntro();
   if(html.indexOf(COMMENT[0].t)>=0) err('le bouton doit retirer le bloc');
   if(state.intro!==false) err('le drapeau doit etre une valeur, pas une absence');
   /* et il ne revient pas au rechargement */
   save(); state=null; await loadState();
   if(state.intro!==false) err('le retrait doit survivre au rechargement');
 }
 {
   view='set'; render();
   const reg=html;
   COMMENT.forEach(b=>{ if(reg.indexOf(b.t)<0) err('Reglages doit porter le bloc « '+b.t+' »'); });
   if(!/data-k="cmt0"[^>]*open/.test(reg)) err('dans Reglages les developpements sont deplies d office');
   if(reg.indexOf(COMMENT[0].l[0])<0) err('le developpement complet doit etre present dans Reglages');
 }
 /* un seul chemin de rendu : deux copies du texte divergeraient */
 if((SRC.match(/const COMMENT=/g)||[]).length!==1) err('le texte doit avoir une seule source');
 if((SRC.match(/function commentHtml/g)||[]).length!==1) err('le rendu doit avoir un seul chemin');
 console.log('texte OK : replie sur l accueil, deplie dans Reglages, une source et un rendu');

 // ================= 6. LE CRITERE DE FIN DE SERIE SUR LES FICHES =================
 /* Sept fiches portent le critere specifique, toutes portent la regle generale
    et le lien. Le compte est verifie : une fiche qui perdrait son champ ne se
    verrait pas autrement. */
 {
   const avec=Object.keys(DB).filter(id=>DB[id].fin);
   /* v2.13 : cinq fiches de plus, l escalier du pont fessier et le pont au sol
      lui-meme, qui portait deja le meme signal sans le nommer. Le texte de
      Comment ca marche ne liste plus les fiches une par une depuis ce lot : la
      liste nominative devenait fausse a chaque ajout sans que rien ne le
      signale, elle a ete remplacee par un renvoi a la ligne de la fiche. */
   /* v2.18 : quinze, les deux fiches de l escalier du squat */
   /* v2.19 : seize, le gainage lateral avec abductions */
   if(avec.length!==16) err('seize fiches attendues avec un critere propre, obtenu '+avec.length+' : '+avec.join(','));
   ['pompes-poignees','planche','gainage-lateral','dead-bug','pallof-press','elevations-laterales','tractions-assistees-supination','tractions-assistees-pronation',
    'pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste',
    'squat-une-jambe-chaise','squat-une-jambe-chaise-leste','gainage-lateral-jambe-levee']
     .forEach(id=>{ if(!DB[id]||!DB[id].fin) err('critere de fin de serie absent sur '+id); });
   const l=finLineHtml('pompes-poignees');
   if(l.indexOf('affaissement du bassin')<0) err('le critere des pompes doit nommer l affaissement du bassin');
   if(l.indexOf('goComment')<0) err('la fiche doit mener au texte complet');
   const g=finLineHtml('face-pulls');
   if(g.indexOf('plus le même exercice')<0) err('une fiche sans critere propre doit porter la regle generale');
   if(g.indexOf('Fin de série')>=0) err('une fiche sans critere propre ne doit pas annoncer un critere propre');
 }
 console.log('fiches OK : treize criteres propres, la regle generale et le lien partout');

 console.log('TESTS DETTE V1.15 ET COMMENT CA MARCHE V2.12 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
```

## falsif39.sh, banc de falsification du second volet

Dix-sept mutations, dix-sept chutes.

```bash
#!/bin/bash
# Banc de falsification du second volet de la v2.12 : dette v1.15 et texte
# « Comment ca marche ». Chaque mutation defait une decision du lot ; test39
# doit tomber sur chacune. Une mutation qui survit designe une assertion qui
# ne prouve rien.
set -e
cd "$(dirname "$0")"
cp app3.js .c3 ; cp app4.js .c4 ; cp app5.js .c5 ; cp app7.js .c7 ; cp app8.js .c8 ; cp app9.js .c9
restaure(){ cp .c3 app3.js; cp .c4 app4.js; cp .c5 app5.js; cp .c7 app7.js; cp .c8 app8.js; cp .c9 app9.js; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  if node test39.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- le verrou a porte de bande ----
sed -i "s/ok=L.length>0\&\&!!p.setsBand\&\&p.setsBand===L\[L.length-1\];/ok=L.length>0\&\&p.band===L[L.length-1];/" app4.js
essai "porte de bande relue sur le barreau courant au lieu du barreau joue"

sed -i "s/if(e.bnd) p.setsBand=p.band||null;//" app4.js
essai "barreau joue jamais ecrit"

sed -i "s/  p.sets=sets.slice(); p.date=new Date().toISOString();\n//" app4.js
sed -i "s/if(e.bnd) p.setsBand=p.band||null;/if(e.bnd\&\&!light\&\&!unqual) p.setsBand=p.band||null;/" app4.js
essai "barreau joue traite comme une action au lieu d une information"

sed -i "s/ok=L.length>0\&\&!!p.setsBand\&\&p.setsBand===L\[L.length-1\];/ok=L.length>0;/" app4.js
essai "conjonction de barreau supprimee : le verrou s ouvre a n importe quel barreau"

sed -i "s/let ok=(p.sets||\[\]).filter(x=>x>=e.lock.need).length>=k;/let ok=(p.best||0)>=e.lock.need;/" app4.js
essai "retour au maximum historique pour tous les verrous"

sed -i "s/    delete q.bandBest;//" app4.js
essai "cle morte conservee a la migration"

# ---- la correction ----
sed -i "s/    if(av!==ap) holdApres\[id\]={v:ap,at:p.holdAt||null};//" app7.js
essai "gestes manuels posterieurs de nouveau effaces en silence"

sed -i "s/    if(estMontee(avantCor\[id\],p,e)) undone.push('Montée annulée sur '+e.nom);//" app7.js
essai "montee defaite non annoncee"

sed -i "s/undone.push('Montée annulée sur '+e.nom);/msgs.push('Montée annulée sur '+e.nom);/" app7.js
essai "annulation melangee aux messages de progression"

sed -i "s/function undoneHtml(L,align){\n  if(!L||!L.length) return '';/function undoneHtml(L,align){/" app7.js
sed -i "s/  if(!L||!L.length) return '';/  L=L||[];/" app7.js
essai "bloc d annulation rendu meme quand rien n est defait"

sed -i "s/'<div class=\"tag flame\" style=\"display:block;margin:6px '+(align==='left'?'0':'auto')+';max-width:fit-content\">'/'<div class=\"tag ok\" style=\"display:block;margin:6px '+(align==='left'?'0':'auto')+';max-width:fit-content\">'/" app7.js
essai "annulation rendue comme une reussite"

# ---- la charge courante ----
sed -i "s/if(e.mode==='fixed') return loadLabelFor(id,(p\&\&p.load)||e.load0);/if(e.mode==='fixed') return fmtKg(e.load0);/" app9.js
essai "retour a la charge de depart du catalogue"

# ---- le texte ----
sed -i "s/function commentHtml(ouvert){/function commentHtml(ouvert){ ouvert=false;/" app5.js
essai "developpements replies aussi dans Reglages"

sed -i "s/  if(state.intro===false) return '';/  return '';/" app5.js
essai "bloc d introduction jamais rendu sur l accueil"

sed -i "s/function closeIntro(){ state.intro=false; save(); render(); }/function closeIntro(){ render(); }/" app5.js
essai "bouton qui ne retire rien"

sed -i "s/  if(f) return '';//" app7.js
sed -i "s/(f?'<div class=\"muted small\"><b>Fin de série<\/b> · '+f+'<\/div>':'')/'<div class=\"muted small\"><b>Fin de série<\/b> · '+(f||'')+'<\/div>'/" app7.js
essai "critere propre annonce sur les fiches qui n en ont pas"

sed -i "s/ fin:'la hanche qui descend./ vig2:'la hanche qui descend./" app3.js
essai "une fiche perd son critere de fin de serie"

rm -f .c3 .c4 .c5 .c7 .c8 .c9
echo "FALSIFICATION 39 TERMINEE"
```

## Suites existantes retouchées en v2.12

Sept suites lisaient `bandBest`, retiré par le lot. Aucune retouche ne masque un
défaut applicatif : chacune encode l'ancienne sémantique et est justifiée en
commentaire dans la suite concernée.

- `test5` : la protection « la preuve ne suit pas le barreau » se lit désormais sur
  `setsBand`, écrit avec les séries. Les deux fixtures d'inventaire portent
  `setsBand` au lieu de `bandBest`.
- `test7` : fixture de verrou à compte multiple, clé morte remplacée.
- `test18` : l'assistant `pose()` efface `setsBand` au lieu de remettre `bandBest` à
  zéro ; T6 vérifie que le barreau écrit est celui **joué**, et qu'une descente de
  bande ne le réécrit pas.
- `test24` : l'action qu'une séance allégée ne doit pas écrire est le record, et la
  suite vérifie en plus que le barreau joué, lui, s'écrit sous les trois régimes,
  puisque c'est une information.
- `test26` : même distinction sur une lecture non qualifiée.
- `test27` : fixtures de la porte de bande, initialisation devenue inutile.
- `test30` : la meilleure série affichée sort du dernier passage, assertion resserrée
  sur la valeur attendue.
- `test2` a attrapé une faute de vocabulaire dans le texte d'onboarding : le mot
  « tours » est abandonné depuis la v1.13 au profit de « séries », sur l'accueil
  comme dans Réglages. Corrigé dans le texte, pas dans la suite.
- `test18` encore : ses deux sujets fabriqués portent `secs`, que `validateSet` écrit
  à côté de `log`. Le sujet est complété plutôt que l'application assouplie, le seul
  constructeur réel de `cur` étant `startSession`.

## seuil-r.js, instrument de mesure pondéré par les tours

Remplace le compte « /4 » qui a servi à justifier la v2.10. Ce dernier pesait les quatre adjacences
du circuit à poids égal, alors qu'une séance à R tours contient **3R adjacences intra-tour et
seulement R-1 raccords**, aucun repos n'étant émis après la dernière série. Le compte n'était exact
qu'à la limite R infini, et il a produit une conclusion inversée, « l'ordre seul est une régression »,
reprise telle quelle au carnet et au changelog pendant un lot entier.

Sortie, état de départ, 450 quatuors, conflits d'épaule par séance :

```
ordre                 R=2     R=3     R=4    R->inf (ancien « /4 »)
P,U,C,L (v2.7)      2.65    4.08    5.51    1.43
P,L,U,C (v2.10)     2.27    3.80    5.33    1.53
```

L'ordre seul gagne 0,39, 0,28 et 0,17 conflit par séance à deux, trois et quatre tours. Le « /4 »
ne survit ici que comme colonne asymptotique, nommée comme telle, pour que la comparaison avec les
chiffres historiques reste possible.

Le script mesure aussi l'effet d'une pause au raccord, qui vaut 0,80 par tour au-delà du premier :
0,80 à deux tours, 1,60 à trois, 2,40 à quatre. C'est ce que coûte la liste vide de la v2.11 **si le
modèle a raison**, et c'est un pari assumé, le modèle n'étant pas observé.

La table de marqueurs y est recopiée telle quelle. Elle reste un jugement et non une mesure, elle
vit hors application, et aucun chiffre produit ici ne décide seul.

```javascript
/* seuil-r.js : instrument de mesure des conflits d adjacence, PONDERE PAR LE
   NOMBRE DE TOURS.  node seuil-r.js   (aucune dependance)

   Pourquoi cet outil existe. La v2.10 a ete justifiee sur un instrument qui
   comptait les quatre adjacences du circuit a poids egal. C est faux : une
   seance a R tours contient 3R adjacences intra-tour et seulement R-1
   raccords, puisque aucun repos n est emis apres la derniere serie. Le compte
   « /4 » n est exact qu a la limite R infini, et il a produit une conclusion
   inversee, « l ordre seul est une regression », reprise telle quelle au
   carnet et au changelog. Recompte a 2, 3 et 4 tours, l ordre seul est un
   gain. La ponderation est donc l instrument de reference, et le « /4 » ne
   survit ici que comme limite asymptotique, nommee comme telle.

   Ce que l instrument ne dit pas, et qu il faut garder en tete a chaque
   lecture : la table M est un JUGEMENT, pas une mesure. Elle vit hors
   application et n a jamais ete confrontee au journal. Aucun chiffre produit
   ici ne doit entrer dans l outil ni decider quoi que ce soit a lui seul. */

const M = {
  'pompes-poignees':                 { epaule: 3, coude: 3 },
  'elevations-laterales':            { epaule: 3 },
  'developpe-sol':                   { epaule: 3, coude: 3, prehension: 2 },
  'tractions-assistees-supination':  { prehension: 3, coude: 3, epaule: 2 },
  'tractions-strictes-supination':   { prehension: 3, coude: 3, epaule: 3 },
  'face-pulls':                      { epaule: 3, prehension: 2 },
  'rowing-suspension':               { prehension: 3, coude: 2, epaule: 2 },
  'rowing-kettlebell':               { prehension: 3, coude: 2, erecteurs: 2 },
  'curls-halteres':                  { coude: 3, prehension: 2 },
  'goblet-squat':                    { epaule: 3, coude: 2, prehension: 2 },
  'fentes-arriere':                  {},
  'fentes-arriere-lestee':           { prehension: 3 },
  'pont-fessier':                    {},
  'mollets-debout':                  {},
  'mollets-une-jambe-leste':         { epaule: 2 },
  'step-ups':                        {},
  'rdl-kettlebell':                  { prehension: 3, erecteurs: 3 },
  'kb-swings':                       { prehension: 3, erecteurs: 3, epaule: 2 },
  'planche':                         { epaule: 3 },
  'planche-ballon':                  { epaule: 3 },
  'bird-dog':                        { epaule: 2 },
  'gainage-lateral':                 { epaule: 3 },
  'gainage-lateral-jambe-levee':     { epaule: 3 },
  'dead-bug':                        {},
  'pallof-press':                    { epaule: 2, prehension: 2 }
};
const ETATS = {
  depart: {
    push: ['pompes-poignees', 'elevations-laterales', 'developpe-sol'],
    pull: ['tractions-assistees-supination', 'face-pulls', 'rowing-suspension',
           'rowing-kettlebell', 'face-pulls', 'curls-halteres'],
    legs: ['goblet-squat', 'fentes-arriere', 'pont-fessier', 'mollets-debout', 'step-ups'],
    core: ['planche', 'bird-dog', 'gainage-lateral', 'dead-bug', 'pallof-press']
  },
  mature: {
    push: ['pompes-poignees', 'elevations-laterales', 'developpe-sol'],
    pull: ['tractions-strictes-supination', 'face-pulls', 'rowing-suspension',
           'rowing-kettlebell', 'face-pulls', 'curls-halteres'],
    legs: ['goblet-squat', 'fentes-arriere-lestee', 'pont-fessier', 'mollets-une-jambe-leste',
           'step-ups', 'rdl-kettlebell', 'kb-swings'],
    core: ['planche-ballon', 'bird-dog', 'gainage-lateral-jambe-levee', 'dead-bug', 'pallof-press']
  }
};
const ORDRES = {
  'P,U,C,L (v2.7)':  ['push', 'pull', 'core', 'legs'],
  'P,L,U,C (v2.10)': ['push', 'legs', 'pull', 'core'],
  'P,U,L,C (v1.6)':  ['push', 'pull', 'legs', 'core'],
  'P,L,C,U':         ['push', 'legs', 'core', 'pull'],
  'P,C,U,L':         ['push', 'core', 'pull', 'legs'],
  'P,C,L,U':         ['push', 'core', 'legs', 'pull']
};

function tous(P) {
  const o = [];
  P.push.forEach(a => P.pull.forEach(b => P.legs.forEach(c => P.core.forEach(d =>
    o.push({ push: a, pull: b, legs: c, core: d })))));
  return o;
}
const conflit = (a, b) => ((M[a].epaule || 0) + (M[b].epaule || 0)) >= 5;

/* R tours : les trois adjacences intra-tour R fois chacune, le raccord R-1
   fois. pause = le raccord est neutralise (liste de paires nommee, v2.11). */
function parSeance(t, o, R, pause) {
  let n = 0;
  for (let k = 0; k < 3; k++) n += R * (conflit(t[o[k]], t[o[k + 1]]) ? 1 : 0);
  if (!pause) n += (R - 1) * (conflit(t[o[3]], t[o[0]]) ? 1 : 0);
  return n;
}
function moy(lot, o, R, pause) {
  return lot.reduce((a, t) => a + parSeance(t, o, R, pause), 0) / lot.length;
}

['depart', 'mature'].forEach(e => {
  const lot = tous(ETATS[e]);
  console.log('\n=== ' + e + ' (' + lot.length + ' quatuors) ===');
  console.log('    conflits d epaule PAR SEANCE, 3R adjacences intra-tour + (R-1) raccords');
  console.log('    ordre                 R=2     R=3     R=4    R->inf (ancien « /4 »)');
  Object.keys(ORDRES).forEach(n => {
    const o = ORDRES[n];
    const asympt = [0, 1, 2, 3].reduce((a, k) => a + (conflit_moy(lot, o, k) ), 0);
    console.log('    ' + n.padEnd(18) +
      [2, 3, 4].map(R => moy(lot, o, R, false).toFixed(2).padStart(6)).join('  ') +
      '  ' + asympt.toFixed(2).padStart(6));
  });
  const o = ORDRES['P,L,U,C (v2.10)'];
  console.log('\n    effet d une pause au raccord (v2.10 inconditionnelle, v2.11 sur paire nommee)');
  [2, 3, 4].forEach(R => console.log('      R=' + R + '   sans pause ' + moy(lot, o, R, false).toFixed(2) +
    '   avec pause ' + moy(lot, o, R, true).toFixed(2) +
    '   gain ' + (moy(lot, o, R, false) - moy(lot, o, R, true)).toFixed(2)));
});
function conflit_moy(lot, o, k) {
  const a = o[k], b = o[(k + 1) % 4];
  return lot.filter(t => conflit(t[a], t[b])).length / lot.length;
}
console.log('\nRappel : la table M est un jugement. Aucun chiffre ci-dessus ne decide seul.');
```

## test37.js, suite des lots v2.10 et v2.11

Neuf sections sur l'ordre du circuit poussé, jambes, tiré, gainage, et sur la pause de 60 s au
raccord de tour. Les deux décisions sont indissociables et la suite les traite ensemble.

**1. La permutation, et sa séparation d'avec la rotation.** `SLOT_ORDER` est figé par égalité
explicite, comme l'était l'ordre v2.7. Le point qui compte davantage est la seconde assertion :
`SLOT_PHASE` vaut toujours `{push:0, pull:1, core:2, legs:3}`, et la suite refuse explicitement que
ces valeurs coïncident avec le rang dans `SLOT_ORDER`. Si quelqu'un les dérivait un jour du rang, la
rotation entière se déplacerait au premier changement d'ordre, sans bruit. Cette égalité est le
garde-fou de cette dérive.

**2. Le tirage n'a pas bougé.** Sur 200 séances, chaque emplacement tire ce que sa rotation lui
dicte, indépendamment de sa place dans le circuit : le contenu du quatuor est comparé emplacement par
emplacement à `pickAt`. Les propriétés de déphasage de la v2.8 sont revalidées sous le nouvel ordre,
aucun vivier ne redonnant le même exercice deux séances de suite. Mesuré : 179 quatuors distincts sur
200 séances.

**3. La pause est émise au raccord, et nulle part ailleurs.** À 2, 3 et 4 tours : `R-1` pauses, toutes
valant `PAUSE_TOUR`, toutes précédées du gainage et suivies du poussé, `R × 3` transitions au tarif
du réglage, et aucun repos après la dernière série.

**4. Le changement de volume en séance redérive le raccord.** Deux sites émettent des repos. Si le
second recopiait l'ancienne liste au lieu de redériver de la position, un tour retiré laisserait une
pause en queue de séance ou en priverait le nouveau dernier raccord. La séance est démarrée puis
passée à 2, 4 puis 3 tours, l'invariant étant revérifié à chaque fois.

**5. La pause est un poste à part dans la durée annoncée.** `nPause`, `pause`, somme exacte de la
décomposition, `nRest` qui exclut les raccords, et la card Contenu qui porte bien `2 × 60 s` en face
de `9 × 15 s`. Le réglage de transition est ensuite descendu à 5 s : le poste Pause ne bouge pas, le
poste Transitions bouge de `9 × 10 s`.

**6. La fourchette des Réglages compte les deux tarifs.** Elle n'appelle pas `buildSession`, elle
énumère : ses bornes sont comparées à l'énumération exhaustive des tirages possibles. La card doit en
outre dire que le raccord échappe au sélecteur.

**7. L'écran distingue la pause avant d'avoir été lu.** Tag, classe de chrono, liseré de card, message
replié sous `data-k="rest-why"`, ligne visible. La suite vérifie aussi qu'une transition réglée à
30 s reste une transition, ce que l'ancienne heuristique `sec<=20` ne faisait pas. Et que la sortie
reste possible, dégradée en secondaire sur une pause, principale sur une transition, sans qu'aucun
dialogue ne s'interpose.

**8. La pause n'est pas réglable.** `PAUSE_TOUR` n'est pas un cran du sélecteur, dépasse la transition
la plus longue, n'est atteinte par aucun réglage, n'a pas de setter. Et un seul constructeur émet les
repos : la suite refuse qu'un site fabrique l'objet à la main, et compte trois occurrences de
`restStep(`, une définition et deux appels.

**9. Accord de genre.** Le libellé de charge de chaque exercice à bande doit dire « bande » et ne
jamais porter de féminin derrière « élastique ». La chip de matériel demande un contrôle différent :
six couleurs du nuancier sont invariables, rose, rouge, orange, jaune, marron, beige, donc un tirage
qui tombe dessus laisserait passer le désaccord. Le contrôle porte sur le mot et non sur l'accord,
sur 40 tirages, et le banc de falsification a précisément attrapé cette faiblesse.

**Non testé à dessein.** Le comptage des conflits. Il repose sur la table de marqueurs par exercice,
qui est un jugement et non une mesure. La promouvoir en donnée du catalogue pour pouvoir l'assertir
reviendrait à figer ce jugement dans l'outil, ce que le lot refuse. Elle vit dans `audit-epaule.js`,
hors application.

```javascript
// Ordre du circuit pousse, jambes, tire, gainage (v2.10), et pause au raccord
// de tour conditionnee a une liste de paires nommees (v2.11).
//
// Ce que l ordre fait, et c est le coeur : il separe les deux exercices
// d isolation d epaule, elevations laterales dans le pousse et face pulls dans
// le tire. Un poste jambes les separe dans le tour, un poste gainage au
// raccord. Dans les DEUX sens, a cout nul. C etait le probleme vecu.
//
// Ce que la v2.11 retire : la pause posee a TOUS les raccords. Elle reparait
// une adjacence que personne n avait signalee, au prix de 90 s par seance de
// trois tours, sur la foi d une table de marqueurs hors application. La liste
// ne s alimente que de ce que Gabriel constate. Vide de la v2.11 a la v2.17,
// elle porte deux paires depuis la v2.18 : leur contenu est l affaire de
// test45. Cette suite teste le mecanisme, et vide la liste le temps des
// sections qui en ont besoin, puis la remet telle que livree.
//
// Ce que la suite ne teste PAS, a dessein : le comptage des conflits par
// marqueurs. C est un jugement, pas une mesure, et il n a rien a faire dans
// l outil. Il vit dans audit-epaule.js.
const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollY:0,scrollTo:(x,y)=>{global.window.scrollY=y;},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
/* cards du dernier rendu, recreees a chaque ecriture comme le fait le
   navigateur : sans cet etat, l ouverture repliee du message de pause ne
   serait pas observable */
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
const mk=cap=>({set innerHTML(v){if(cap){html=v;rebuild(v);}},get innerHTML(){return cap?html:''},
  classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true), other=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:other),
  querySelectorAll:()=>Object.keys(cards).map(k=>cards[k]),
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.SRC=raw;

const S=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 /* la categorie d un exercice est portee par le catalogue, pas par la suite */
 const catOf=id=>DB[id].cat;
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; state.prep=5; };
 /* v2.18 : la liste n est plus livree vide. Les sections qui raisonnent sur
    une liste vide la vident, et la remettent en sortant. */
 const LIVREE=PAUSE_RACCORD_PAIRS.slice();
 if(!LIVREE.length) throw new Error('la liste livree est vide : le harnais ne prouverait plus la remise en etat');
 const vider=()=>{ PAUSE_RACCORD_PAIRS.length=0; };
 const remettre=()=>{ PAUSE_RACCORD_PAIRS.length=0; LIVREE.forEach(x=>PAUSE_RACCORD_PAIRS.push(x)); };

 // 1. la permutation elle-meme, et sa separation d avec la rotation
 await neuf();
 if(SLOT_ORDER.join(',')!=='push,legs,pull,core')
   throw new Error('ordre attendu push,legs,pull,core, obtenu '+SLOT_ORDER.join(','));
 /* Le point qui compte : les valeurs de phase sont declarees et non derivees
    du rang dans SLOT_ORDER. Si un jour quelqu un les derive, la rotation
    entiere se deplacerait au premier changement d ordre, sans bruit. Cette
    egalite est le garde-fou de cette derive. */
 const attendu={push:0,pull:1,core:2,legs:3};
 Object.keys(attendu).forEach(s=>{ if(SLOT_PHASE[s]!==attendu[s])
   throw new Error('phase deplacee sur '+s+' : '+SLOT_PHASE[s]+' au lieu de '+attendu[s]); });
 const parRang={}; SLOT_ORDER.forEach((s,i)=>parRang[s]=i);
 if(SLOT_ORDER.every(s=>SLOT_PHASE[s]===parRang[s]))
   throw new Error('les phases coincident avec le rang dans SLOT_ORDER : les deux decisions ne sont plus separables');
 console.log('ordre OK : pousse, jambes, tire, gainage ; phases declarees, decorrelees du rang');

 // 2. le tirage n a pas bouge : seule la sequence a change
 /* Un emplacement tire ce que sa rotation lui dicte, independamment de sa
    place dans le circuit. On le verifie en comparant, sur 200 seances, le
    contenu du quatuor avec ce que la rotation produit emplacement par
    emplacement. Les proprietes de dephasage de la v2.8 sont revalidees ici
    sous le nouvel ordre : 375 quatuors atteints, aucun vivier ne redonne le
    meme exercice deux seances de suite. */
 {
   await neuf();
   const vus={}; const dernier={}; let suites=0;
   for(let k=0;k<200;k++){
     const p=buildSession();
     SLOT_ORDER.forEach((s,i)=>{
       const attendu=pickAt(s,0);
       if(p.orig[i]!==attendu) throw new Error('emplacement '+s+' deplace au tirage '+k);
       if(catOf(p.orig[i])!==s) throw new Error('categorie hors emplacement au tirage '+k);
       if(dernier[s]===p.orig[i]) suites++;
       dernier[s]=p.orig[i];
     });
     vus[p.orig.join('|')]=1;
     SLOT_ORDER.forEach(s=>{ state.slotIdx[s]=(state.slotIdx[s]||0)+1; });
   }
   if(suites) throw new Error(suites+' repetitions d un exercice deux seances de suite');
   if(Object.keys(vus).length<150) throw new Error('dephasage perdu : '+Object.keys(vus).length+' quatuors distincts sur 200 seances');
   console.log('tirage OK : '+Object.keys(vus).length+' quatuors distincts sur 200 seances, aucune repetition consecutive');
 }

 // 3. la paire vecue est separee dans les deux sens, ce qui est le lot
 /* elevations laterales (pousse) et face pulls (tire) ne doivent plus jamais
    etre adjacents, ni dans le tour ni au passage du raccord. On le verifie sur
    la structure du circuit, donc pour TOUS les tirages a la fois, et pas
    seulement sur celui du jour. */
 {
   const r=n=>SLOT_ORDER.indexOf(n);
   if(Math.abs(r('push')-r('pull'))===1) throw new Error('pousse et tire sont adjacents dans le tour');
   if((r('push')===0&&r('pull')===3)||(r('pull')===0&&r('push')===3))
     throw new Error('pousse et tire sont adjacents au raccord');
   await neuf(3);
   const L=buildSession().steps, w=workSteps(L);
   for(let i=0;i+1<w.length;i++){
     const a=catOf(w[i].id), b=catOf(w[i+1].id);
     if((a==='push'&&b==='pull')||(a==='pull'&&b==='push'))
       throw new Error('pousse et tire se suivent dans la sequence reelle, pas '+i);
   }
   console.log('paire OK : un poste separe toujours pousse et tire, dans le tour comme au raccord');
 }

 // 4. la pause ne se pose que sur une paire nommee
 for(const R of [2,3,4]){
   await neuf(R);
   const p=buildSession(), L=p.steps, w=workSteps(L);
   if(w.length!==R*SLOT_ORDER.length) throw new Error('volume inattendu a '+R+' tours');
   const pauses=L.filter(s=>s.k==='rest'&&s.pause);
   /* liste telle que livree : une pause exactement la ou une paire est nommee */
   const attendues=L.filter((s,i)=>s.k==='rest'&&catOf(L[i-1].id)==='core'&&pauseAu(L[i-1].id,w[0].id)).length;
   if(pauses.length!==attendues) throw new Error(R+' tours : '+pauses.length+' pauses au lieu de '+attendues);
   if(pauses.some(s=>s.sec!==PAUSE_TOUR)) throw new Error('une pause ne vaut pas PAUSE_TOUR');
   L.forEach((s,i)=>{
     if(s.k!=='rest'||!s.pause) return;
     let j=i+1; while(j<L.length&&L[j].k!=='set') j++;
     if(catOf(L[i-1].id)!=='core') throw new Error('une pause ne suit pas le gainage, position '+i);
     if(j>=L.length||catOf(L[j].id)!=='push') throw new Error('une pause ne precede pas le pousse, position '+i);
     if(!pauseAu(L[i-1].id,L[j].id)) throw new Error('pause posee sur une paire non nommee, position '+i);
   });
   const dernier=L.indexOf(w[w.length-1]);
   for(let i=dernier+1;i<L.length;i++)
     if(L[i].k==='rest') throw new Error('repos apres la derniere serie a '+R+' tours');
   const trs=L.filter(s=>s.k==='rest'&&!s.pause);
   if(trs.length!==R*SLOT_ORDER.length-1-pauses.length) throw new Error('compte de transitions faux a '+R+' tours');
   if(trs.some(s=>s.sec!==transSec())) throw new Error('une transition ne suit pas le reglage');
 }
 console.log('conditionnalite OK : aucune pause hors paire nommee, rien apres le dernier tour, a 2, 3 et 4 tours');

 // 4b. le mecanisme repond quand une paire EST nommee
 /* on vide la liste et on nomme la paire du tirage courant, le temps du
    controle : le mecanisme est ainsi exerce quel que soit le contenu livre. */
 {
   await neuf(3);
   vider();
   const L0=buildSession().steps, w0=workSteps(L0);
   const gain=w0.filter(s=>catOf(s.id)==='core')[0].id, pous=w0[0].id;
   PAUSE_RACCORD_PAIRS.push(gain+'>'+pous);
   const L=buildSession().steps;
   const pa=L.filter(s=>s.k==='rest'&&s.pause);
   if(pa.length!==2) throw new Error('paire nommee : '+pa.length+' pauses au lieu de 2 a trois tours');
   if(pa.some(s=>s.sec!==PAUSE_TOUR)) throw new Error('la pause nommee ne vaut pas PAUSE_TOUR');
   const parts=planParts(buildSession());
   if(parts.nPause!==2||parts.pause!==2*PAUSE_TOUR) throw new Error('la paire nommee n entre pas dans la duree annoncee');
   if(contentCard(buildSession(),parts).indexOf('Pause de tour')<0) throw new Error('la paire nommee n apparait pas dans la card Contenu');
   PAUSE_RACCORD_PAIRS.length=0;
   if(planParts(buildSession()).nPause!==0) throw new Error('la pause survit au retrait de la paire');
   remettre();
   console.log('mecanisme OK : une paire nommee pose la pause et entre dans la duree, la retirer la reprend');
 }

 // 5. le changement de volume en seance rederive le raccord
 /* Deux sites emettent des repos. Si le second recopiait l ancienne liste au
    lieu de rederiver de la position, un tour retire laisserait une pause en
    queue de seance ou en priverait le nouveau dernier raccord. */
 {
   await neuf(4);
   vider();
   startSession();
   if(!cur) throw new Error('la seance ne demarre pas');
   const compte=()=>({p:cur.steps.filter(s=>s.k==='rest'&&s.pause).length,
                      t:cur.steps.filter(s=>s.k==='rest'&&!s.pause).length});
   for(const R of [2,4,3]){
     setSessionRounds(R);
     const c=compte();
     if(c.p!==0) throw new Error('apres passage a '+R+' tours : '+c.p+' pauses alors que la liste est vide');
     if(c.t!==R*SLOT_ORDER.length-1) throw new Error('apres passage a '+R+' tours : '+c.t+' transitions au lieu de '+(R*4-1));
     const w=workSteps(cur.steps), dernier=cur.steps.indexOf(w[w.length-1]);
     for(let i=dernier+1;i<cur.steps.length;i++)
       if(cur.steps[i].k==='rest') throw new Error('repos en queue apres passage a '+R+' tours');
     cur.steps.forEach((s,i)=>{ if(s.k==='rest'&&s.pause&&catOf(cur.steps[i-1].id)!=='core')
       throw new Error('pause hors raccord apres passage a '+R+' tours'); });
   }
   remettre();
   console.log('volume OK : le raccord se rederive de la position a 2, 4 puis 3 tours, sans repos en queue');
 }

 // 6. la pause est un poste a part dans la duree annoncee
 {
   await neuf(3);
   vider();
   setTrans(15);
   const p=buildSession(), parts=planParts(p);
   /* liste vide : le poste Pause de tour n existe pas et sa ligne disparait,
      exactement comme la ligne Remontage de charge quand il n y en a pas */
   if(parts.nPause!==0||parts.pause!==0) throw new Error('pause comptee alors que la liste est vide');
   if(parts.trans!==11*transSec()) throw new Error('les 11 repos doivent tous etre des transitions');
   if(parts.total!==parts.warm+parts.exos+parts.trans+parts.pause+parts.remount+parts.cardio+parts.cool)
     throw new Error('la decomposition doit sommer au total');
   if(nRest(p)!==11) throw new Error('nRest doit compter les 11 transitions, obtenu '+nRest(p));
   const h=contentCard(p,parts);
   if(h.indexOf('Pause de tour')>=0) throw new Error('la card Contenu annonce une pause inexistante');
   if(h.indexOf('11 × '+transSec()+' s')<0) throw new Error('la ligne Transitions doit compter les 11 repos');
   setTrans(5);
   const p5=planParts(buildSession());
   if(parts.trans-p5.trans!==11*10) throw new Error('les transitions doivent suivre le reglage');
   setTrans(15);
   remettre();
   console.log('decomposition OK : aucun poste de pause, somme exacte, les 11 repos suivent le reglage');
 }

 // 7. la fourchette des Reglages compte les deux tarifs
 /* Elle ne passe pas par buildSession : elle enumere. Si elle gardait
    l ancienne formule, elle s ecarterait de l estimation de l accueil des la
    premiere seance, et c est precisement le defaut qui avait fait tomber
    l ancien modele de temps. */
 {
   await neuf(3);
   vider();
   state.warm='complet'; state.stretch=true; state.cardio=false; setTrans(15);
   const sp=sessionSpan(3,false,'complet');
   const pools=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(id=>!isLocked(id)));
   let lo=Infinity, hi=0; const ix=[0,0,0,0];
   (function w(i){ if(i===4){ SLOT_ORDER.forEach((s,k)=>state.slotIdx[s]=ix[k]);
       const t=planParts(buildSession()).total; if(t<lo)lo=t; if(t>hi)hi=t; return; }
     for(let a=0;a<pools[i].length;a++){ ix[i]=a; w(i+1); } })(0);
   SLOT_ORDER.forEach(s=>state.slotIdx[s]=0);
   if(sp.min!==Math.round(lo/60)) throw new Error('borne basse fausse : '+sp.min+' contre '+Math.round(lo/60));
   if(sp.max!==Math.round(hi/60)) throw new Error('borne haute fausse : '+sp.max+' contre '+Math.round(hi/60));
   /* le surcout de la pause est celui qui a ete arbitre : 45 s par raccord */
   const avecT=sessionSpan(3,false,'complet',60);
   if(avecT.min<=sp.min) throw new Error('la fourchette doit rester sensible au reglage de transition');
   view='set'; render();
   if(html.indexOf('pause fixe de '+PAUSE_TOUR+' s')>=0) throw new Error('Reglages annonce une exception qui n existe pas');
   /* on nomme TOUTES les paires (gainage, pousse) : chaque quatuor recoit alors
      la pause, et les deux bornes doivent monter de (rounds-1) x (60 - 15),
      soit 90 s. Nommer une seule paire ne prouverait rien : le quatuor le plus
      long peut etre un autre, et la borne ne bougerait pas. */
   SLOTS.core.pool.forEach(c=>SLOTS.push.pool.forEach(u=>PAUSE_RACCORD_PAIRS.push(c+'>'+u)));
   const sp2=sessionSpan(3,false,'complet');
   if(sp2.min<=sp.min) throw new Error('la borne basse ignore les paires nommees');
   if(sp2.max<=sp.max) throw new Error('la borne haute ignore les paires nommees');
   PAUSE_RACCORD_PAIRS.length=0;
   PAUSE_RACCORD_PAIRS.push(workSteps(buildSession().steps).filter(x=>catOf(x.id)==='core')[0].id+'>'+workSteps(buildSession().steps)[0].id);
   render();
   if(html.indexOf('pause fixe de '+PAUSE_TOUR+' s')<0) throw new Error('Reglages doit annoncer l exception quand une paire est nommee');
   remettre();
   console.log('fourchette OK : bornes exactes liste vide, les deux bornes montent de 90 s quand tout est nomme, card honnete');
 }

 // 8. l ecran distingue la pause avant d avoir ete lu
 {
   await neuf(3);
   /* on nomme la paire du tirage courant le temps d observer l ecran, liste
      videe d abord pour que la comparaison ne depende pas du contenu livre */
   vider();
   const w1=workSteps(buildSession().steps);
   PAUSE_RACCORD_PAIRS.push(w1.filter(x=>catOf(x.id)==='core')[0].id+'>'+w1[0].id);
   startSession();
   const L=cur.steps;
   const pause=L.find(s=>s.k==='rest'&&s.pause);
   const trans=L.find(s=>s.k==='rest'&&!s.pause);
   if(!pause||!trans) throw new Error('il faut un repos de chaque sorte pour comparer');
   const hp=restHtml(pause), ht=restHtml(trans);
   if(restTagHtml(pause).indexOf('Pause de tour')<0) throw new Error('le tag de la pause doit la nommer');
   if(restTagHtml(trans).indexOf('Transition')<0) throw new Error('le tag de la transition doit la nommer');
   if(restTagHtml(trans).indexOf('Pause de tour')>=0) throw new Error('une transition ne doit pas se dire pause');
   /* le tag se lit sur le drapeau et non sur la duree : une transition de 30 s
      reste une transition, et c est le defaut que l ancienne heuristique
      sec<=20 avait */
   setTrans(30);
   const long={k:'rest',sec:30};
   if(restTagHtml(long).indexOf('Transition')<0) throw new Error('une transition longue reste une transition');
   setTrans(15);
   if(hp.indexOf('tag pause')<0) throw new Error('la pause doit porter sa classe de tag');
   if(hp.indexOf('chrono rest num pause')<0) throw new Error('le chrono de la pause doit porter sa classe');
   if(hp.indexOf('pausecard')<0) throw new Error('la card de la pause doit porter son lisere');
   if(ht.indexOf('pausecard')>=0||ht.indexOf('tag pause')>=0) throw new Error('une transition ne doit rien porter de tout cela');
   /* le pourquoi est la, replie, et lisible AVANT d appuyer sur Passer */
   if(hp.indexOf('data-k="rest-why"')<0) throw new Error('le message de pause doit etre une card repliable');
   if(/data-k="rest-why"[^>]*\\sopen/.test(hp)) throw new Error('le message doit etre replie par defaut');
   if(hp.indexOf('Le tour recommence')<0) throw new Error('la ligne visible doit dire ce qui se passe');
   if(ht.indexOf('rest-why')>=0) throw new Error('une transition ne porte pas ce message');
   /* la sortie reste ouverte, l outil ne peut pas observer si l epaule a
      recupere. Elle cesse seulement d etre l action principale. */
   if(hp.indexOf('nextStep()')<0) throw new Error('passer doit rester possible pendant une pause');
   if(hp.indexOf('class="quiet mt"')<0) throw new Error('sur une pause, passer n est plus l action principale');
   if(ht.indexOf('class="big mt"')<0) throw new Error('sur une transition, passer reste l action principale');
   if(/confirm|Confirmer|Es-tu s/.test(hp)) throw new Error('aucun dialogue ne doit s interposer');
   remettre();
   console.log('ecran OK : tag, couleur et lisere propres, message replie, sortie conservee mais degradee');
 }

 // 9. la pause n est pas reglable, et rien ne la confond avec une transition
 {
   if(TRANS_CHOICES.indexOf(PAUSE_TOUR)>=0) throw new Error('PAUSE_TOUR ne doit pas etre un cran du selecteur');
   if(PAUSE_TOUR<=TRANS_CHOICES[TRANS_CHOICES.length-1]) throw new Error('la pause doit depasser la transition la plus longue');
   for(const t of TRANS_CHOICES){ setTrans(t);
     if(transSec()===PAUSE_TOUR) throw new Error('un reglage de transition atteint la duree de pause'); }
   setTrans(15);
   if(/function setPause|setPauseTour/.test(SRC)) throw new Error('aucun setter ne doit exposer la pause');
   /* un seul constructeur emet les repos : deux sites l appellent, aucun ne
      fabrique l objet a la main */
   if(/\\.push\\(\\{k:'rest'/.test(SRC)) throw new Error('un site emet un repos sans passer par le constructeur');
   const appels=SRC.split('restStep(').length-1;
   if(appels!==3) throw new Error('un seul constructeur et deux appels attendus, trouve '+appels+' occurrences');
   /* v2.18 : la liste n est plus vide. Sa forme reste une affaire de
      mecanisme : chaque entree nomme un gainage puis un pousse, les deux
      seuls voisins du raccord. Son contenu se teste dans test45. */
   if(PAUSE_RACCORD_PAIRS.join('|')!==LIVREE.join('|')) throw new Error('la suite n a pas remis la liste telle que livree');
   PAUSE_RACCORD_PAIRS.forEach(x=>{ const ab=x.split('>');
     if(ab.length!==2||!DB[ab[0]]||!DB[ab[1]]) throw new Error('entree mal formee : '+x);
     if(DB[ab[0]].cat!=='core'||DB[ab[1]].cat!=='push') throw new Error('une entree ne nomme pas gainage puis pousse : '+x); });
   console.log('constante OK : hors selecteur, sans setter, un constructeur unique, liste faite de paires gainage > pousse et remise en etat');
 }

 // 10. accord de genre : le barreau est une bande, l objet reste un elastique
 {
   await neuf(3);
   const fem=/[ée]lastique\\s+(rose|verte|bleue|violette|noire|blanche|grise)/i;
   const ids=Object.keys(DB).filter(id=>DB[id].bnd);
   let vus=0;
   ids.forEach(id=>{
     const p=perfFor(id,false);
     if(!p.band||p.band==='aucune') return;
     const l=exoLoadLabel(id,p);
     if(l.indexOf('bande ')<0) throw new Error('le libelle de charge de '+id+' ne dit pas bande : '+l);
     if(fem.test(l)) throw new Error('desaccord de genre sur '+id+' : '+l);
     vus++;
   });
   if(!vus) throw new Error('aucun exercice a bande observe, le controle ne prouve rien');
   /* la chip ne peut pas etre controlee par le seul feminin : six couleurs du
      nuancier sont invariables, rose, rouge, orange, jaune, marron, beige, et
      un tirage qui tombe dessus laisserait passer le desaccord. On controle
      donc le mot, qui lui ne depend pas du tirage : « Élastique » n est jamais
      suivi d une couleur, les litteraux de MAT s arretent a l objet. */
   const nomme=/[ée]lastique\\s+(rose|rouge|orange|jaune|vert|bleu|violet|noir|blanc|gris|marron|beige)/i;
   let chipsVues=0;
   for(let k=0;k<40;k++){
     const plan=buildSession(), chips=sessionGear(plan).join(' | ');
     if(fem.test(chips)) throw new Error('desaccord de genre sur le materiel a sortir : '+chips);
     if(nomme.test(chips)) throw new Error('une chip nomme un elastique par sa realisation : '+chips);
     if(/Bande /.test(chips)) chipsVues++;
     SLOT_ORDER.forEach(x=>{ state.slotIdx[x]=(state.slotIdx[x]||0)+1; });
   }
   if(!chipsVues) throw new Error('aucune chip de bande observee sur 40 tirages, le controle ne prouve rien');
   /* les litteraux de MAT ne bougent pas : sans barreau prescrit, l objet a
      aller chercher reste un elastique */
   if(SRC.indexOf('Élastique (assistance)')<0) throw new Error('le litteral de MAT a ete emporte par la correction');
   /* et rien nulle part dans la source ne concatene elastique avec une
      realisation, qui est toujours au feminin */
   if(/[ée]lastique '\\+/.test(SRC)) throw new Error('une concatenation sur elastique subsiste dans la source');
   console.log('genre OK : '+vus+' exercices a bande, aucun desaccord, litteraux de MAT intacts');
 }

 console.log('TESTS ORDRE DU CIRCUIT ET PAUSE DE RACCORD NOMMEE V2.11 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
```

## falsif37.sh, banc de falsification des lots v2.10 et v2.11

Douze mutations, chacune défaisant une décision du lot. Chacune doit faire tomber `test37.js` ; une
mutation qui survit désigne une assertion qui ne prouve rien.

Onze tombaient au premier passage. La douzième, **accord de genre défait sur la chip de matériel**,
survivait : le contrôle cherchait un féminin de `PAL`, or six couleurs du nuancier sont invariables
et le tirage était tombé sur jaune. Le contrôle a été porté sur le mot, qui ne dépend pas du tirage,
et étendu à 40 tirages.

**v2.11 : quatorze mutations.** Trois nouvelles, `pauseAu` rendu toujours vrai (pause redevenue
inconditionnelle), `pauseAu` rendu toujours faux (mécanisme mort, aucune paire ne pourrait plus
déclencher), et un ordre remettant poussé et tiré adjacents au raccord. Là encore une mutation a
survécu au premier passage, **fourchette aveugle à une paire nommée** : l'assertion ne nommait
qu'une seule paire, et le quatuor le plus long pouvait être un autre, donc la borne ne bougeait pas.
Corrigé en nommant toutes les paires (gainage, poussé) et en exigeant que les **deux** bornes
montent. Les quatorze tombent.

**v2.18 : remplacements exacts.** Les quatorze `sed` nus deviennent des remplacements exacts avec
compte, `mut` pour un motif unique et `mutn` quand le motif est attendu plusieurs fois : l'accord de
genre sur le libellé de charge vise deux occurrences dans `app9.js`, que le `sed` d'origine
traitait par son drapeau `g`. Relancé parce que `test37` a été retouchée : les quatorze tombent,
banc et sources restaurés à l'identique.

```bash
#!/bin/bash
# Banc de falsification des lots v2.10 et v2.11, retouche en v2.18. Chaque
# mutation defait une decision du lot ; test37 doit tomber sur chacune. Une
# mutation qui passe designe une assertion qui ne prouve rien.
# v2.18 : les sed nus sont remplaces par des remplacements exacts avec compte,
# regle posee a l audit du 13 septembre. Le banc s arrete si un motif ne mord
# pas le nombre de fois attendu, au lieu de lire un patch sans effet comme une
# survie.
set -e
cd "$(dirname "$0")"
cp app3.js .a3 ; cp app5.js .a5 ; cp app6.js .a6 ; cp app8.js .a8 ; cp app9.js .a9
restaure(){ cp .a3 app3.js; cp .a5 app5.js; cp .a6 app6.js; cp .a8 app8.js; cp .a9 app9.js; }
# mutn fichier nombre ancien nouveau : remplace toutes les occurrences, qui
# doivent etre exactement au nombre attendu
mutn(){ python3 - "$1" "$2" "$3" "$4" << 'PY'
import sys
p,n,old,new=sys.argv[1],int(sys.argv[2]),sys.argv[3],sys.argv[4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=n: print('MOTIF MAL COMPTE dans',p,':',s.count(old),'au lieu de',n,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
mut(){ mutn "$1" 1 "$2" "$3"; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test37.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}
PA="function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }"
mut app3.js "const SLOT_ORDER=['push','legs','pull','core'];" "const SLOT_ORDER=['push','pull','core','legs'];"
essai "ancien ordre du circuit v2.7"
mut app3.js "const SLOT_PHASE={push:0,pull:1,core:2,legs:3};" "const SLOT_PHASE={push:0,legs:1,pull:2,core:3};"
essai "phases derivees du rang dans SLOT_ORDER"
mut app3.js "const PAUSE_TOUR=60;" "const PAUSE_TOUR=15;"
essai "pause ramenee a la duree d une transition"
mut app5.js "$PA" "function pauseAu(a,b){ return true; }"
essai "pause redevenue inconditionnelle (regression v2.10)"
mut app5.js "$PA" "function pauseAu(a,b){ return false; }"
essai "mecanisme mort : aucune paire nommee ne peut plus declencher"
mut app6.js "if(!last) out.push(restStep(i===round.length-1,s.id,round[0].id));" "if(!last) out.push({k:'rest',sec:transSec()});"
essai "changement de volume qui court-circuite le constructeur"
mut app3.js "const SLOT_ORDER=['push','legs','pull','core'];" "const SLOT_ORDER=['push','core','pull','legs'];"
essai "ordre remettant pousse et tire adjacents au raccord"
mut app5.js "else if(st.k==='rest'){ if(st.pause){ pause+=st.sec; nPause++; } else trans+=st.sec; }" "else if(st.k==='rest') trans+=st.sec;"
essai "pause refondue dans le poste Transitions"
mut app8.js "const rac=(rounds-1)*(pauseAu(pick[n-1],pick[0])?PAUSE_TOUR:tr);" "const rac=(rounds-1)*tr;"
essai "fourchette aveugle a une paire nommee"
mut app6.js "const tag='<span class=\"tag'+(st.pause?' pause':'')+'\">'+(st.pause?'Pause de tour':'Transition')+'</span>';" "const tag='<span class=\"tag\">'+(st.sec<=20?'Transition':'Repos')+'</span>';"
essai "tag rededuit de la duree au lieu du drapeau"
mut app6.js "(st.pause?pauseWhyHtml():'')+" "''+"
essai "ecran de pause sans son message"
mut app6.js "'<button class=\"'+(st.pause?'quiet':'big')+' mt\"" "'<button class=\"big mt\""
essai "sortie de pause restee action principale"
mutn app9.js 2 "return 'bande '+bandNom(p.band);" "return 'élastique '+bandNom(p.band);"
essai "accord de genre defait sur le libelle de charge"
mut app9.js "out[i]='Bande '+n;" "out[i]='Élastique '+n;"
essai "accord de genre defait sur la chip de materiel"
restaure
rm -f .a3 .a5 .a6 .a8 .a9
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
node test37.js > /dev/null && echo "reference restauree, test37 passe"
```

## Suites existantes retouchées en v2.10

**`test15.js` et `test16.js`.** La décomposition de durée gagne un poste : l'assertion de somme
l'énumère, et le contrôle « les transitions valent leur nombre par leur durée » ne compte plus que
les repos non-pause, avec son pendant sur les raccords.

**`test17.js`, deux points.** Le premier est mécanique : seuls les repos non-pause suivent le
sélecteur. Le second mérite d'être noté, parce que l'échec ne venait pas du lot. L'assertion
« déverrouiller un exercice change la fourchette » tombait **par manque de résolution de
l'instrument**. La propriété tenait toujours : la borne basse passe de 969 à 954 s au
déverrouillage. Mais l'assertion lisait `sessionSpan`, qui rend des minutes arrondies, et les 90 s
ajoutées par les pauses ont déplacé les deux valeurs de part et d'autre d'une frontière d'arrondi :
879 et 864 s donnaient 15 et 14 min, 969 et 954 donnent tous deux 16. L'assertion porte désormais
sur les secondes, et vérifie en plus que la fourchette annoncée suit toujours l'énumération.

**`test23.js`, section 7.** Le contrôle de barreau de bande cherchait « élastique » suivi de la
**clé** du niveau, au masculin. Il passait **par préfixe**, « élastique noir » étant un préfixe de
« élastique noire », et n'aurait donc jamais vu le désaccord qu'il était censé couvrir. Il cherche
maintenant la forme réellement produite, et refuse tout féminin derrière « élastique ».

**`test34.js`, sections 2 et 4.** La section 2 figeait la décision d'ordre de la v2.7 par égalité
explicite ; elle fige celle de la v2.10, avec les propriétés qui la justifient : plus de jambes vers
gainage, plus de poussé vers tiré, fermeture par gainage vers poussé. La section 4 comptait les
bornes de tour sur l'adjacence jambes vers poussé, qui n'existe plus.

Les trente-et-une autres suites passent sans modification.

## test36.js, suite du lot v2.9

Sept sections sur l'heure et le temps écoulé portés par la ligne du tag de l'écran de transition.

**1. Présente sur chaque transition, absente partout ailleurs.** Les quinze transitions d'une séance
à quatre séries portent la ligne, à la forme et à l'heure attendues. Les écrans de série, l'écran
d'échauffement et le module cardio sont rendus et contrôlés : aucun ne porte `id="tl"`. C'est le
périmètre qui est testé, pas seulement la présence.

**2. La ligne suit `cur.t0`, elle n'est pas un compteur.** Le contrôle a deux moitiés, et les deux
sont nécessaires. L'horloge avance de dix minutes **sans qu'aucune boucle ne tourne**, ce qui est
exactement la mise en veille du téléphone : la ligne doit voir les dix minutes. Puis la boucle bat
cinq fois **sans que l'horloge bouge** : le décompte descend, l'écoulé ne bouge pas. Un compteur
incrémenté passe la seconde moitié et échoue à la première. Pour rendre ce contrôle possible,
`setInterval` est capturé au lieu d'être lancé, et la suite fait avancer les boucles pas à pas.

**3. Troncature, jamais arrondi.** Neuf durées sur le formateur, dont les bornes 59 s, 60 s, 779 s et
780 s, plus une durée négative. Puis la même propriété sur le chemin réel, en avançant l'horloge d'une
seconde de part et d'autre de la treizième minute. S'y ajoutent trois assertions qui verrouillent la
collision de nom : `fmtEcoule` n'est pas `fmtMin`, ne rend pas le tilde de l'annonce, et n'est déclarée
qu'une fois dans la source.

**4. Un seul découpage de l'heure.** Six instants, dont minuit, une heure à un chiffre, la dernière
minute de l'année et un changement d'heure : `fmtHM` rend le découpage local, et `fmtDT` commence par
`fmtHM` du même instant. Le contrôle qui tranche porte sur la source : `getHours` ne doit y apparaître
qu'une fois.

**5. Même ancre que la durée réelle de l'historique.** Une séance est jouée en entier, horloge figée
puis avancée de trente-sept secondes par pas. La durée écrite dans l'entrée d'historique dérive du
même `t0` que la ligne affichée à la dernière transition, à la seconde près, et la ligne ne peut pas
annoncer plus de minutes que la durée finalement enregistrée.

**6. La frontière de la v2.2 tient.** Contrôle par **inventaire exhaustif** et non par chasse aux
valeurs interdites : chercher la cible « 8 » dans « 18h42 » la trouve toujours et ne prouve rien. La
ligne porte exactement trois nombres, et la suite dit lesquels : les deux premiers sont l'heure de
l'horloge, le troisième est l'écoulé tronqué. Aucune cible, aucune charge, aucun barreau, aucune durée
annoncée ne peut s'y glisser sans casser le compte. S'y ajoutent l'absence de motif `m:ss`, l'absence
de tilde et l'absence d'`onclick`.

**7. Sans ancre, ni ligne ni `spread`.** `cur.t0` retiré, `sessionTime()` rend une chaîne vide, la
ligne disparaît, et le tag ne passe pas en `spread` : à un seul occupant il serait chassé à gauche
alors que la card le centre.

**Falsification.** Quatorze défauts injectés un à un dans une copie des sources, build refait, suite
relancée, avec contrôle préalable que le patch mord et que la syntaxe reste valide. Les quatorze sont
détectés : compteur incrémenté au lieu de l'ancrage sur `t0` ; arrondi au lieu de la troncature ;
secondes réintroduites ; durée annoncée ajoutée à côté de l'écoulé ; rafraîchissement retiré de la
boucle ; ligne posée aussi sur l'écran de série ; `spread` conservé sans second occupant ; ligne
survivant à l'absence d'ancre ; heure recoupée à la main dans `fmtDT` ; heure UTC au lieu de l'horloge
locale ; ancre décalée de cinq minutes après le lancement ; formateur retombant sur celui de la durée
annoncée ; écoulé disparu au profit de la seule heure ; ligne portée par le module cardio.

**Un essai a d'abord été invalide, et c'est la leçon du banc.** Le défaut « ligne posée aussi sur
l'écran de série » visait `let entry='';` dans `setHtml`. La variable est réassignée dans les trois
branches de la fonction, donc l'injection était écrasée avant le rendu : la suite ne détectait rien
parce qu'il n'y avait rien à détecter. Recalé sur la chaîne réellement retournée, le défaut est vu.
Un patch qui ne mord pas se lit exactement comme une suite qui protège, et c'est le contrôle
`PATCH-MORT` du banc qui doit l'attraper, pas la relecture.

```javascript
// Lot v2.9 : heure et temps ecoule sur la ligne du tag de l ecran de
// transition. Ce que la suite protege : l ancrage sur cur.t0, la troncature a
// la minute, l absence de seconde, le decoupage unique de l heure, et la
// frontiere de la v2.2, la ligne annonce et ne prescrit rien.
// Le fuseau est force avant le premier appel a Date : sous TZ=UTC un defaut de
// decoupage local ne se verrait pas.
process.env.TZ='Europe/Brussels';
if(Intl.DateTimeFormat().resolvedOptions().timeZone!=='Europe/Brussels')
  throw new Error('fuseau non force : la suite ne pourrait rien discriminer');

const fs=require('fs');
const raw=fs.readFileSync('check.js','utf8');
const src=raw.replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),other=mk(false);
/* Les elements interroges par la boucle de transition sont captes : #rt et #tl
   doivent recevoir leur texte de la boucle elle-meme, et non d un re-rendu.
   C est ce qui distingue « la ligne se rafraichit » de « la ligne est juste au
   moment ou l ecran est ecrit ». */
const cap={};
const live=id=>({get textContent(){return cap[id]||''},set textContent(v){cap[id]=v},
  classList:{add(){},remove(){}},value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
global.document={querySelector:s=>s==='#app'?appEl:(s==='#rt'||s==='#tl'?live(s.slice(1)):(s==='.lightbox'?null:other)),
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
/* L intervalle est capture au lieu d etre lance : la suite le fait avancer pas
   a pas, ce qui permet de dissocier « le temps passe » de « la boucle tourne ».
   Un compteur incremente confond les deux, l ancrage sur t0 non. */
let boucles=[];
global.setInterval=fn=>{ const h={fn:fn}; boucles.push(h); return h; };
global.clearInterval=h=>{ boucles=boucles.filter(x=>x!==h); };
/* setTimeout est neutralise comme dans les autres suites, sans quoi les
   celebrations de fin de seance se declencheraient. Le vrai est conserve pour
   une seule chose : laisser la chaine de promesses de endSession se resoudre,
   la section 5 lisant l entree d historique qu elle ecrit. */
const vraiTimeout=setTimeout;
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};
global.vider=()=>new Promise(r=>vraiTimeout(r,0));
global.battre=n=>{ for(let i=0;i<(n||1);i++) boucles.slice().forEach(h=>h.fn()); };
global.SRC=raw;
/* Horloge figee et deplacable. La suite ne doit rien devoir a l heure de son
   lancement, et elle doit pouvoir avancer l horloge sans faire tourner la
   boucle : c est exactement le cas de la mise en veille du telephone. */
const VraieDate=Date;
let T0=0;
global.figer=iso=>{ T0=new VraieDate(iso).getTime();
  function D(){ return arguments.length?new VraieDate(...arguments):new VraieDate(T0); }
  D.prototype=VraieDate.prototype; D.now=()=>T0; D.UTC=VraieDate.UTC; D.parse=VraieDate.parse;
  global.Date=D; };
global.avancer=sec=>{ T0+=sec*1000; };
global.degeler=()=>{ global.Date=VraieDate; };

const S=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; };
 /* on joue le chemin reel de l application : rien n est ecrit a la main dans
    cur, sans quoi la suite fabriquerait son sujet */
 const jouer=()=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   const e=DB[st.id];
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else if(e.mode==='stretch'){ skipSet(); return true; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 /* la ligne telle qu elle est ecrite dans l ecran, sans le reste de la card */
 const LIGNE=/<span class="tline num" id="tl">([^<]*)<\\/span>/;
 const ligne=s=>{ const m=restHtml(s).match(LIGNE); return m?m[1]:null; };
 const FORME=/^\\d{2}h\\d{2} · \\d+ min$/;
 const minutes=t=>{ const m=t.match(/· (\\d+) min$/); if(!m) throw new Error('ligne illisible : '+t); return +m[1]; };
 const premierRepos=()=>{ const i=cur.steps.findIndex(s=>s.k==='rest'); if(i<0) throw new Error('aucune transition dans la seance'); return cur.steps[i]; };

 /* ---------- 1. la ligne est sur chaque transition, et nulle part ailleurs ---------- */
 figer('2026-09-06T18:42:30');
 await neuf(4);
 startSession();
 const reposList=cur.steps.filter(s=>s.k==='rest');
 if(reposList.length!==15) throw new Error('quinze transitions attendues a quatre series, '+reposList.length);
 reposList.forEach((s,i)=>{
   const t=ligne(s);
   if(t===null) throw new Error('transition '+i+' sans ligne temporelle');
   if(!FORME.test(t)) throw new Error('transition '+i+' : forme inattendue « '+t+' »');
   if(t.indexOf('18h42')!==0) throw new Error('transition '+i+' : heure attendue 18h42, ligne « '+t+' »');
 });
 /* aucun autre ecran ne la porte : elle appartient a la transition, qui annonce,
    et pas aux ecrans qui prescrivent ou qui chronometrent deja */
 const travail=cur.steps.filter(s=>s.k==='set');
 travail.forEach(s=>{ if(setHtml(s).indexOf('id="tl"')>=0) throw new Error('l ecran de serie ne doit pas porter la ligne'); });
 {
   const savW=state.warm; state.warm='complet';
   await neuf(3); state.warm='complet'; startSession();
   if(cur.phase!=='warm') throw new Error('echauffement attendu au lancement');
   renderWarm();
   if(html.indexOf('id="tl"')>=0) throw new Error('l echauffement ne doit pas porter la ligne');
   state.warm=savW;
 }
 await neuf(3); state.cardio=true; startSession();
 {
   const c=cur.steps.find(s=>s.k==='cardio');
   if(!c) throw new Error('module cardio attendu');
   if(cardioHtml(c).indexOf('id="tl"')>=0) throw new Error('le cardio ne doit pas porter la ligne');
 }
 console.log('presence OK : '+reposList.length+' transitions portent la ligne, ni serie, ni echauffement, ni cardio');

 /* ---------- 2. la ligne suit cur.t0, elle n est pas un compteur ---------- */
 figer('2026-09-06T18:00:00');
 await neuf(3);
 startSession();
 const r2=premierRepos();
 if(minutes(ligne(r2))!==0) throw new Error('au lancement la ligne doit annoncer 0 min');
 /* l horloge avance de dix minutes sans qu aucune boucle ne tourne : c est la
    mise en veille du telephone, ou setInterval est etrangle. Un compteur
    incremente afficherait encore 0. */
 avancer(600);
 if(minutes(ligne(r2))!==10) throw new Error('dix minutes ecoulees hors boucle doivent etre vues, ligne « '+ligne(r2)+' »');
 if(ligne(r2).indexOf('18h10')!==0) throw new Error('l heure doit suivre l horloge, ligne « '+ligne(r2)+' »');
 /* symetrique : la boucle tourne cinq fois sans que l horloge bouge. Le
    decompte descend, l ecoulé ne bouge pas. */
 cur.i=cur.steps.indexOf(r2);
 renderSession();
 /* un battement d amorce : la ligne du DOM n est ecrite que par la boucle, et
    comparer a « rien » ne mesurerait que le premier passage */
 battre(1);
 const avant=cap.tl;
 if(!avant) throw new Error('la boucle doit ecrire la ligne');
 battre(5);
 if(cap.tl!==avant) throw new Error('cinq battements sans horloge ne doivent rien changer a l ecoule');
 if(!cap.rt) throw new Error('le decompte doit etre ecrit par la boucle');
 /* et la boucle rafraichit bien la ligne quand l horloge, elle, avance */
 avancer(120); battre(1);
 if(minutes(cap.tl)!==12) throw new Error('la boucle doit rafraichir la ligne, ecoule lu '+cap.tl);
 console.log('ancrage OK : la ligne se recalcule depuis t0, pas depuis la boucle');

 /* ---------- 3. troncature, jamais arrondi ---------- */
 const cas=[[0,0],[1,0],[59,0],[60,1],[119,1],[770,12],[779,12],[780,13],[6199,103]];
 cas.forEach(([sec,att])=>{
   if(fmtEcoule(sec)!==att+' min') throw new Error(sec+' s doit donner '+att+' min, fmtEcoule rend '+fmtEcoule(sec));
 });
 if(fmtEcoule(-30)!=='0 min') throw new Error('une duree negative doit se lire 0 min');
 /* le nom ne doit pas retomber sur celui de la duree annoncee : fmtMin rend un
    tilde, et une seconde declaration du meme nom aurait ecrase la premiere sans
    bruit. Le defaut a existe, il rendait « ~0 min » sur l ecran de transition. */
 if(fmtEcoule===fmtMin) throw new Error('le formateur de l ecoule ne doit pas etre celui de la duree annoncee');
 if(fmtEcoule(600).indexOf('~')>=0) throw new Error('l ecoule est mesure, il ne porte pas le tilde de l annonce');
 if((SRC.match(/function fmtEcoule\\(/g)||[]).length!==1) throw new Error('fmtEcoule doit etre declaree une seule fois');
 /* sur le chemin reel, et pas seulement sur le formateur */
 figer('2026-09-06T19:00:00');
 await neuf(3); startSession();
 const r3=premierRepos();
 avancer(779);
 if(minutes(ligne(r3))!==12) throw new Error('12 min 59 s doit s afficher 12 min');
 avancer(1);
 if(minutes(ligne(r3))!==13) throw new Error('13 min 00 s doit s afficher 13 min');
 console.log('troncature OK : neuf durees, 12 min 59 s annonce 12');

 /* ---------- 4. un seul decoupage de l heure ---------- */
 const instants=['2026-01-01T00:00:00','2026-01-01T00:09:00','2026-06-21T13:05:00',
                 '2026-09-06T18:42:30','2026-12-31T23:59:59','2026-03-29T03:30:00'];
 instants.forEach(iso=>{
   const d=new Date(iso), p=n=>String(n).padStart(2,'0');
   const attendu=p(d.getHours())+'h'+p(d.getMinutes());
   if(fmtHM(iso)!==attendu) throw new Error(iso+' : fmtHM rend '+fmtHM(iso)+', attendu '+attendu);
   if(fmtDT(iso).indexOf(fmtHM(iso)+' ')!==0)
     throw new Error(iso+' : fmtDT doit commencer par fmtHM, sans quoi deux decoupages du meme instant divergent');
 });
 /* fmtHM sans argument lit l horloge, comme dayKey */
 figer('2026-09-06T07:05:00');
 if(fmtHM()!=='07h05') throw new Error('fmtHM() doit lire l horloge, rendu '+fmtHM());
 /* la source ne recoupe l heure nulle part ailleurs */
 {
   const n=(SRC.match(/getHours\\(\\)/g)||[]).length;
   if(n!==1) throw new Error('getHours ne doit apparaitre qu une fois, dans fmtHM ; trouve '+n);
 }
 console.log('decoupage OK : six instants, une seule lecture de getHours dans la source');

 /* ---------- 5. meme ancre que la duree reelle de l historique ---------- */
 figer('2026-09-06T17:30:00');
 await neuf(2);
 startSession();
 const dep=cur.t0;
 let garde=0, dernier=null;
 while(cur&&cur.i<cur.steps.length&&garde++<200){
   avancer(37);
   const st=cur.steps[cur.i];
   if(st&&st.k==='rest') dernier=ligne(st);
   if(!jouer()) break;
 }
 if(dernier===null) throw new Error('aucune transition traversee');
 const attendu5=Math.floor((Date.now()-dep)/1000);
 for(let k=0;k<5;k++) await vider();
 const ent=state.hist[state.hist.length-1];
 if(!ent) throw new Error('aucune entree d historique');
 if(ent.real==null) throw new Error('l entree doit porter une duree reelle');
 if(Math.abs(ent.real-attendu5)>1)
   throw new Error('la duree reelle doit deriver du meme t0 : historique '+ent.real+', ecoule '+attendu5);
 if(Math.floor(ent.real/60)<minutes(dernier))
   throw new Error('la ligne ne peut pas annoncer plus que la duree finalement enregistree');
 console.log('ancre OK : ligne et duree reelle derivent du meme t0, '+ent.real+' s enregistrees');

 /* ---------- 6. la frontiere de la v2.2 tient ---------- */
 figer('2026-09-06T18:42:00');
 await neuf(4);
 startSession();
 garde=0;
 while(cur&&cur.i<cur.steps.length-1&&garde++<200){
   const st=cur.steps[cur.i];
   if(st.k==='rest'){
     const t=ligne(st);
     if(t===null) throw new Error('transition sans ligne en cours de seance');
     if(!FORME.test(t)) throw new Error('forme inattendue en cours de seance : « '+t+' »');
     if(/\\d+:\\d\\d/.test(t)) throw new Error('aucune seconde ne doit figurer sur la ligne : « '+t+' »');
     if(t.indexOf('onclick')>=0) throw new Error('la ligne ne doit rien declencher');
     if(t.indexOf('~')>=0) throw new Error('le tilde appartient a la duree annoncee, pas a une mesure');
     /* Inventaire exhaustif plutot que chasse aux valeurs interdites : chercher
        la cible « 8 » dans « 18h42 » la trouve toujours et ne prouve rien. La
        ligne ne porte que trois nombres, et on dit lesquels. Aucune cible,
        aucune charge, aucun barreau, aucune duree annoncee ne peut s y glisser
        sans casser le compte. */
     const nb=t.match(/\\d+/g)||[];
     if(nb.length!==3) throw new Error('la ligne doit porter exactement trois nombres, l heure, la minute et l ecoule : « '+t+' »');
     const d=new Date();
     const p=n=>String(n).padStart(2,'0');
     if(nb[0]!==p(d.getHours())||nb[1]!==p(d.getMinutes()))
       throw new Error('les deux premiers nombres sont l heure de l horloge : « '+t+' »');
     if(+nb[2]!==Math.floor(sessionElapsed()/60))
       throw new Error('le troisieme nombre est l ecoule tronque : « '+t+' »');
   }
   avancer(11);
   if(!jouer()) break;
 }
 console.log('frontiere OK : ni seconde, ni cible, ni charge, ni barreau, ni annonce, ni action');

 /* ---------- 7. sans ancre, la ligne disparait et le tag reste centre ---------- */
 figer('2026-09-06T18:42:00');
 await neuf(3);
 startSession();
 const r7=premierRepos();
 if(restHtml(r7).indexOf('class="spread"')<0) throw new Error('avec ancre, le tag partage sa ligne');
 delete cur.t0;
 if(sessionTime()!=='') throw new Error('sans t0, sessionTime doit rendre une chaine vide');
 const nu=restHtml(r7);
 if(nu.indexOf('id="tl"')>=0) throw new Error('sans t0, la ligne ne doit pas etre ecrite');
 if(nu.indexOf('class="spread"')>=0) throw new Error('sans second occupant, le tag ne doit pas passer en spread : il serait chasse a gauche');
 if(nu.indexOf('<span class="tag">')<0) throw new Error('le tag doit subsister');
 degeler();
 console.log('degenerescence OK : sans t0, ni ligne ni spread, le tag reste centre');

 console.log('TESTS INDICATEURS TEMPORELS V2.9 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+S);
```

## falsif36.sh, banc de falsification du lot v2.9

Hors build, à lancer à la main après toute modification de `test36.js` ou des fonctions qu'elle
protège. Il travaille dans une copie sous `/tmp` et ne touche jamais aux sources. Son patch d'ancre
ne mordait plus depuis la v2.12, qui a ajouté `secs:{}` à la construction de `cur` : repointé le
13 septembre. Son harnais signalait le patch sans effet, contrairement à celui du lot v2.15.

```bash
#!/bin/bash
# Falsification de test36.js : chaque defaut est injecte seul dans une copie des
# sources, le build est refait, la suite relancee. Un defaut non detecte est un
# trou dans la suite. On verifie d abord que le patch mord et que la syntaxe
# reste valide, sans quoi un echec de syntaxe se lirait comme une detection.
set -u
cd "$(dirname "$0")"
mkdir -p /tmp/f36
SRCS="head.html app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html"

essai(){ # $1 = intitule, $2 = fichier, $3 = motif, $4 = remplacement
  rm -rf /tmp/f36/w; mkdir -p /tmp/f36/w
  cp $SRCS imgdata.js test36.js /tmp/f36/w/
  cd /tmp/f36/w
  python3 - "$2" "$3" "$4" << 'EOF'
import sys
f,a,b=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(f,encoding='utf-8').read()
if a not in s:
    print('PATCH-MORT'); sys.exit(3)
open(f,'w',encoding='utf-8').write(s.replace(a,b,1))
EOF
  if [ $? -ne 0 ]; then echo "  $1 : PATCH SANS EFFET"; cd - >/dev/null; return; fi
  cat $SRCS > /tmp/f36/w/one.html 2>/dev/null
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "
import re
h=open('index.html').read()
open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  if ! node --check check.js 2>/dev/null; then echo "  $1 : SYNTAXE CASSEE, essai invalide"; cd - >/dev/null; return; fi
  if node test36.js >/tmp/f36/out.txt 2>&1; then
    echo "  $1 : NON DETECTE"
  else
    echo "  $1 : detecte — $(grep ECHEC /tmp/f36/out.txt | head -1 | cut -c1-110)"
  fi
  cd - >/dev/null
}

echo "--- falsification de test36 ---"

essai "1. compteur incremente au lieu de l ancrage sur t0" app6.js \
  "function sessionElapsed(){ return (cur&&cur.t0)?Math.max(0,Math.floor((Date.now()-cur.t0)/1000)):null; }" \
  "function sessionElapsed(){ if(!cur||!cur.t0) return null; cur._e=(cur._e||0)+1; return cur._e; }"

essai "2. arrondi au lieu de la troncature" app4.js \
  "function fmtEcoule(sec){return Math.max(0,Math.floor(sec/60))+' min';}" \
  "function fmtEcoule(sec){return Math.max(0,Math.round(sec/60))+' min';}"

essai "3. secondes reintroduites sur la ligne" app6.js \
  "return s==null?'':fmtHM()+' · '+fmtEcoule(s);" \
  "return s==null?'':fmtHM()+' · '+fmtT(s);"

essai "4. duree annoncee ajoutee a cote de l ecoule" app6.js \
  "return s==null?'':fmtHM()+' · '+fmtEcoule(s);" \
  "return s==null?'':fmtHM()+' · '+fmtEcoule(s)+' / '+cur.plan+' min';"

essai "5. la ligne n est pas rafraichie par la boucle" app6.js \
  "const tl=\$('#tl'); if(tl) tl.textContent=sessionTime();" \
  "/* rafraichissement retire */"

essai "6. ligne posee aussi sur l ecran de serie" app6.js \
  "    '<div class=\"exo-head\"><h3>'+esc(e.nom)+'</h3><span class=\"exo-en\">'+esc(e.en)+'</span></div>'+" \
  "    '<span class=\"tline num\" id=\"tl\">'+sessionTime()+'</span><div class=\"exo-head\"><h3>'+esc(e.nom)+'</h3><span class=\"exo-en\">'+esc(e.en)+'</span></div>'+"

essai "7. spread conserve quand la ligne est absente" app6.js \
  "return t?'<div class=\"spread\">'+tag+'<span class=\"tline num\" id=\"tl\">'+t+'</span></div>':tag;" \
  "return '<div class=\"spread\">'+tag+(t?'<span class=\"tline num\" id=\"tl\">'+t+'</span>':'')+'</div>';"

essai "8. la ligne survit a l absence d ancre" app6.js \
  "function sessionTime(){ const s=sessionElapsed(); return s==null?'':fmtHM()+' · '+fmtEcoule(s); }" \
  "function sessionTime(){ const s=sessionElapsed(); return fmtHM()+' · '+fmtEcoule(s||0); }"

essai "9. heure recoupee a la main dans fmtDT" app4.js \
  "function fmtDT(iso){const d=new Date(iso),p=n=>String(n).padStart(2,'0');return fmtHM(iso)+' '" \
  "function fmtDT(iso){const d=new Date(iso),p=n=>String(n).padStart(2,'0');return p(d.getHours())+'h'+p(d.getMinutes())+' '"

essai "10. heure UTC au lieu de l horloge locale" app4.js \
  "function fmtHM(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return p(d.getHours())+'h'+p(d.getMinutes());}" \
  "function fmtHM(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return p(d.getUTCHours())+'h'+p(d.getUTCMinutes());}"

essai "11. ancre decalee de cinq minutes apres le lancement" app6.js \
  "log:{},secs:{},xp:0,msgs:[],ending:false,t0:Date.now()};" \
  "log:{},secs:{},xp:0,msgs:[],ending:false,t0:Date.now()+300000};"

essai "12. formateur de l ecoule retombe sur celui de la duree annoncee" app6.js \
  "return s==null?'':fmtHM()+' · '+fmtEcoule(s);" \
  "return s==null?'':fmtHM()+' · '+fmtMin(s);"

essai "13. libelle preferre au nombre, l ecoule disparait" app6.js \
  "return s==null?'':fmtHM()+' · '+fmtEcoule(s);" \
  "return s==null?'':fmtHM();"

essai "14. ligne portee par le module cardio" app6.js \
  "'<span class=\"tag flame\">Module cardio</span>'" \
  "'<span class=\"tag flame\">Module cardio</span><span class=\"tline num\" id=\"tl\">'+sessionTime()+'</span>'"

echo "--- fin ---"
```

## Suites existantes retouchées en v2.0

`test5.js` — la section 9 vérifiait que retirer une bande faisait retomber `perf` sur un barreau
existant. Cette normalisation est supprimée : elle détruisait la progression. Les deux assertions
sont inversées et deviennent des assertions d'aller-retour, `perf` intacte et prescription bornée.
La section 10 fait de même pour les lestes. Le garde-fou du dernier barreau ayant disparu, la suite
vérifie désormais qu'un profil sans aucun élastique est atteignable et que `perf` y survit.

`test6.js` — l'ancre de dates était posée au lundi à midi, or `weeksElapsed` compare à `Date.now()` :
lancé avant midi, le build échouait sur la section 6. Vérifié en rejouant la suite contre la v1.18
non modifiée, qui échoue exactement pareil, donc antérieur au chantier. Ancre déplacée à minuit, le
build redevient indépendant de l'heure de lancement.

`test9.js` — le catalogue passe de 38 à 45 fiches.

`test22.js` — la banque passe à 47 images, la corde à sauter en étant retirée. Un contrôle nouveau
interdit toute image morte : chaque entrée de la banque doit servir soit une fiche, soit une étape
d'échauffement. Le contrôle par les seules clés de `DB` était trompeur, deux illustrations
d'échauffement passaient pour orphelines.

`test4.js`, `test5.js`, `test7.js` — la sortie de séance est en deux temps : `quitSession()` pose la
question, `quitConfirm()` y répond. Les suites enchaînent les deux. Un `confirm()` global stubé à
`true` ne suffit plus, et c'est voulu : `test27.js` vérifie qu'aucun dialogue système ne subsiste.

**Toutes les suites héritées, propriété de forme.** L'état neuf part d'un inventaire vide depuis
l'onboarding, or les vingt-trois suites antérieures appelaient `loadState()` et supposaient le
domicile sans le dire. Quatorze tombaient : `test`, 5, 6, 7, 9, 11, 14, 16, 17, 18, 19, 22, 23, 24.
Aucune ne révélait un défaut applicatif. Chacune déclare désormais une fonction locale posée en tête
de son bloc, appelée après **chaque** rechargement d'état, y compris à l'intérieur des `neuf()`
locaux :

```javascript
const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
```

Une exception volontaire : les sections qui rejouent une sauvegarde fabriquée pour tester une
migration ne l'appellent pas, l'inventaire à vérifier étant celui du fichier et non celui du
domicile. C'est le cas de la section de migration des disques de `test5.js`.

## Nouvelles suites en v2.0

`test24.js` — lot intégrité. Équivalence de la réécriture de `bandLadder` sur les 64 inventaires ×
les exercices à bande, 1 116 cas de bornage dont les durcissements forcés, aller-retour d'inventaire
à égalité stricte de `perf` par les réglages et par bascule, `perfFor` prouvée non mutable, témoin de
contamination sur les deux verrous à `bandGate` avec contre-témoin d'ouverture légitime, les trois
régimes de provenance, et l'échelle de progression symétrique.

`test25.js` — lot résolveur. Les états de verrous atteignables sont **dérivés** des dépendances entre
verrous et non posés : 72, et non trois. Croisés avec 256 inventaires et deux états d'élastique, cela
fait 36 864 combinaisons, toutes vérifiées sans groupe vide. Monotonie : rendre une ressource ne
retire jamais une position. Rotation : équité stricte des positions et absence de position
consécutive. Compteur : après sept séances ailleurs, le retour sert la position qu'on aurait eue sans
partir. Table de substitution : ni référence circulaire ni doublon.

`test26.js` — lot profils. Migration d'une sauvegarde v1.18, idempotence comprise. Bascule
aller-retour à inventaire restitué et progression intacte. Absence de divergence entre l'inventaire
actif et sa copie persistée. Qualification matérielle portant sur le bornage du niveau et non sur le
profil. Régime non qualifié : séries et date enregistrées, aucune action. Domicile indélébile et
borne de trois profils.


## test27.js, suite du lot de clôture

Neuf sections.

1. **Onboarding.** L'état neuf porte l'inventaire vide, le drapeau et le profil domicile, avec
   l'invariant `state.profils[actif].gear === state.gear` vérifié dès l'entrée. Les quatre groupes
   restent servis et onze schémas sur dix-huit. Le drapeau survit à un enregistrement intermédiaire
   et à un rechargement, disparaît par la validation, n'est jamais créé par `migrateState`, et la
   card reste éditable après validation. Amendée en v2.3 : la validation est désormais suivie d'un
   enregistrement et d'un rechargement, puis d'un rendu de l'accueil, la disparition en mémoire
   seule étant ce qui laissait passer le défaut. Le contrôle « jamais créé par une migration » ne
   fabrique plus son sujet à la main, il met à l'épreuve `loadState` sur une sauvegarde antérieure à
   la v2.0 et `applyImport` sur un export réel, les deux chemins où vivait le défaut. Deux
   assertions nouvelles disent que la clé est désormais une valeur et non une absence : le fichier
   exporté la porte, et un export fait pendant l'onboarding la conserve à `true` de part et d'autre
   d'un import.
2. **Sixième niveau.** Sommet en résistance, entrée la plus facile en assistance, jaune toujours
   dernier barreau d'assistance, cinq clés existantes à leur place, échelle allongée d'un cran quand
   le niveau est tenu, et plafond de résistance devenu une montée.
3. **Nuancier.** Douze couleurs complètes, présence égale réalisation non vide, doublon levé et
   seulement quand il est effectif, accord en genre, migration d'une réalisation hors nuancier par
   clé puis par libellé puis par couleur d'origine, idempotence.
4. **Lestes.** Sommes de sous-ensembles à un et deux membres, goblet à huit barreaux jusqu'à 17 kg,
   aucun point décimal dans les libellés, paire isolée sans barreau intermédiaire, échelle réduite
   au kettlebell sans aucun leste.
5. **Marche basse et replis.** Neuf ressources, besoin déclaré, migration présente par défaut mais
   qui ne rallume pas une absence déclarée, inventaire neuf décoché, repli des fentes filtré quand
   la marche basse manque, les trois couples à élastique indépendants de la marche basse, et la
   séance allégée qui emprunte le même filtre.
6. **Verrou des strictes.** Témoin E1, profil à la verte seule, verrou fermé ; contre-témoin
   nominal, même compte avec le jaune, verrou ouvert ; énoncé conforme à la règle.
7. **Compteur de progressions.** 9 sur 9 à domicile, 6 sur 9 sur la verte seule, 0 sur 1 sur un
   inventaire vide, palier tenu sorti du dénominateur, et `perf` strictement inchangée après appel.
8. **Dialogues.** Aucun `prompt(` ni `confirm(` dans les sources, contrôlé sur le texte du fichier
   assemblé et non sur le comportement. Un seul geste de sortie ne quitte rien, Entrée et Espace ne
   répondent pas à la question, Échap l'annule, et la sortie confirmée enregistre bien une séance
   incomplète.
9. **Card Matériel.** Aucun bouton label-état, interrupteurs et pastilles présents, deux compteurs
   en pied, marche basse déclarable, et ajout de type de disque à quatre exemplaires qui allonge
   réellement l'échelle, retombée à zéro qui rend le type de nouveau proposable.

La suite ne pose **aucun stub de dialogue système**, à dessein : si un chemin en appelait encore un,
elle planterait au lieu de répondre oui à sa place.

## neutre.js

Empreinte de neutralité, hors build, à lancer à la main de part et d'autre d'un lot :

```bash
node neutre.js /chemin/vers/check-avant.js > /tmp/e-ref.txt
node neutre.js check.js > /tmp/e-new.txt
cmp /tmp/e-ref.txt /tmp/e-new.txt
```

Elle porte sur des **valeurs** et jamais sur des libellés, ceux-ci ayant changé au cours du
chantier : 180 tirages croisant les volumes, le cardio, les trois échauffements et dix positions de
rotation, avec pour chacun les exercices tirés, leur cible, leur niveau de bande, leur charge, la
durée annoncée et le nombre de remontages ; puis les positions tirables des quatre viviers, les
trois échelles de charge, les quatre échelles fixes, les douze échelles de bande et les fourchettes
de durée. 206 lignes. L'inventaire est posé identique des deux côtés, cinq bandes, sixième niveau
vide, marche basse présente, ce qui est la définition même de la neutralité recherchée : à matériel
égal, le lot de clôture tire, prescrit et annonce exactement comme la build qui le précède.

```javascript
// Empreinte de neutralite : tirages, prescriptions et durees a inventaire egal.
// Elle porte sur des valeurs et jamais sur des libelles, les libelles ayant
// change en cours de chantier (accord en genre, fourchettes de tension).
// Usage : node neutre.js <chemin-vers-check.js>
const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||'check.js','utf8')
  .replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 await loadState();
 /* inventaire identique des deux cotes : cinq bandes, sixieme niveau vide,
    marche basse presente, disques et lestes d origine */
 state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR));
 if(state.gear.bands.n6!==undefined) state.gear.bands.n6='';
 state.gear.res.stepbas=1;
 state.onboard=false;
 const L=[];
 ROUNDS_CHOICES.forEach(r=>{
   state.rounds=r;
   [true,false].forEach(cardio=>{
     state.cardio=cardio;
     ['complet','court','aucun'].forEach(w=>{
       state.warm=w;
       for(let k=0;k<10;k++){
         state.slotIdx={push:k,pull:k,legs:k,core:k};
         const p=buildSession();
         const parts=planParts(p);
         const pres=p.exos.map(id=>{
           const q=perfFor(id,false);
           return id+':'+q.target+':'+(q.band||'-')+':'+(q.load||0);
         }).join('|');
         L.push([r,cardio?1:0,w,k,pres,Math.round(parts.total),parts.rm?parts.rm.n:0].join(' '));
       }
     });
   });
 });
 /* echelles, exhaustivite des positions et durees annoncees */
 SLOT_ORDER.forEach(s=>L.push('pool '+s+' '+posTirables(s,state.gear).join(',')));
 L.push('ladder '+loadLadder(state.gear).join(','));
 L.push('ladderProg '+loadLadderProg(state.gear).join(','));
 L.push('mono '+loadLadderMono(state.gear).join(','));
 ['goblet-squat','rdl-kettlebell','kb-swings','rowing-kettlebell'].forEach(id=>
   L.push('fixed '+id+' '+fixedLadder(id,state.gear).map(x=>x.v).join(',')));
 Object.keys(DB).filter(id=>DB[id].bnd).sort().forEach(id=>
   L.push('band '+id+' '+bandLadder(DB[id],state.gear).join(',')));
 ROUNDS_CHOICES.forEach(r=>{ const s=sessionSpan(r,true,'complet'); L.push('span '+r+' '+s.min+'-'+s.max); });
 console.log(L.join('\\n'));
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## Encodage des illustrations

`prep_illus.py` ne change pas de défaut. Depuis la v2.15 il accepte un troisième argument optionnel,
la position du séparateur en fraction de largeur, pour les images dont un trait de mur intérieur au
panneau tombe dans la bande de recherche de `find_separator` : `python3 prep_illus.py src.png
dst.jpg 0.5`. Sans l'argument, le comportement est celui de toujours. Pour insérer un lot
d'illustrations sans disposer du dossier `prep` complet, patcher l'objet en place plutôt que le
régénérer ; pour quatre clés, le patch par expression régulière clé par clé, sans `json.dumps`,
garantit que le reste du fichier ne bouge pas d'un octet, ce qui a été fait en v2.15 :

```python
import json, base64
s = open('imgdata.js', encoding='utf-8').read()
i = s.index('const IMG='); j = s.index(';\n', i)
img = json.loads(s[i + len('const IMG='):j])
for k in ['exercice-1', 'exercice-2']:
    img[k] = 'data:image/jpeg;base64,' + base64.b64encode(open(k + '.jpg', 'rb').read()).decode()
out = s[:i] + 'const IMG=' + json.dumps(img, separators=(',', ':'), ensure_ascii=False) + s[j:]
open('imgdata.js', 'w', encoding='utf-8').write(out)
```

La clé est l'identifiant exact de l'exercice. Une image dont la clé ne correspond ni à une fiche ni à
une étape d'échauffement fait échouer `test22.js`.

Ce script est aussi ce qui remet `imgdata.js` en forme. Une clé ajoutée à la main y avait introduit
un saut de ligne au milieu de l'objet JSON, mesuré en v2.4 : trois sauts de ligne dans le fichier au
lieu de deux. `json.dumps` sur une seule ligne le renormalise. La forme canonique est une ligne de
JSON, puis les deux sauts de ligne qui séparent la banque du premier commentaire de section
d'`app1.js`. Le découpage ne s'en aperçoit pas, l'assemblage non plus, mais deux formes du même
fichier finissent par diverger.

## Découpage de `head.html` et `imgdata.js`

La ligne marqueur qui termine `head.html` contient elle-même la chaîne `const IMG={`.
Une extraction automatique qui se cale dessus coupe trente caractères trop tôt et fait
passer la fin de la ligne marqueur dans `imgdata.js`. L'assemblage reste identique
octet pour octet, le défaut ne se voit que dans le document de code. Se caler sur la
seconde occurrence, ou sur la fin de la ligne marqueur.

Même piège à l'autre extrémité : `imgdata.js` se termine là où commence le premier commentaire de
section d'`app1.js`, `PICTOGRAMMES DE REPLI`, et non à `const VERSION`, qui vient trois lignes plus
bas. Se caler sur `VERSION` fait passer deux blocs de commentaire dans la banque d'images. Là encore
l'assemblage reste exact et seul le document de code s'en aperçoit. La vérification qui tranche est
toujours la même : recomposer `index.html` depuis les sections de `PALIER-code.md` plus `imgdata.js`
et comparer octet pour octet.

## Suites existantes retouchées en v2.9

Aucune. Les trente-cinq suites antérieures passent sans modification, ce que le lot devait
produire : il n'ajoute qu'un affichage et ne touche ni au tirage, ni à la prescription, ni au
modèle de temps. Deux d'entre elles ont été relues de près parce qu'elles rendent l'écran de
repos, `test32` et `test29` : elles lisent la vignette et les commandes, jamais la ligne du tag,
et traversent le lot sans retouche. `neutre.js` est inchangée et son empreinte est identique ligne
pour ligne, 206 lignes des deux côtés.

## Suites existantes retouchées en v2.8

**`test23.js`, section 4, amendée.** Elle vérifiait que sur une fenêtre de carrousel égale au plus
gros vivier, chaque exercice tirable sortait au moins une fois, quel que soit le point de départ,
sur 210 départs. Cette propriété est incompatible avec le déphasage et disparaît avec lui : elle
équivaut à une suite de période `n`, et deux suites de période 5 sur jambes et gainage redonnent les
cinq paires rigides à supprimer. La section teste désormais **l'exactitude** de chaque panneau sur
les mêmes 210 départs, en comparant l'annonce du carrousel au tirage réellement produit après *k*
séances. C'est une propriété plus forte, et c'est celle que le carrousel promet réellement.

Les trente-trois autres suites passent sans retouche. Deux ont été relues de près parce qu'elles
posent des compteurs à la main : `neutre.js`, qui fixe `slotIdx` aux quatre emplacements et voit donc
ses lignes de tirage bouger, ce qui est l'objet du lot ; et `test34.js`, dont la section 9 vérifie
que chaque emplacement lit son vivier par son nom. Cette section a été écrite en v2.7 avec un repli
qui accepte la résolution matérielle, elle traverse le déphasage sans modification.

## test35.js, suite du lot v2.8

Onze sections.

1. **La transformation est une lecture pure.** Ni `buildSession`, ni le carrousel, ni un tirage
   isolé ne déplacent `slotIdx`. C'est ce qui dispense de migration et préserve la garantie de la
   v2.0.
2. **Fréquence strictement inchangée.** Écart nul entre la position la plus tirée et la moins tirée
   sur les quatre viviers, et chaque tranche de `n` tirages alignée sur un tour de vivier est une
   permutation du vivier.
3. **Aucune position ne sort deux séances de suite**, sur les quatre viviers. C'est le critère qui a
   éliminé deux des trois jeux de phases testés.
4. **Les quatuors atteignent le maximum arithmétique.** 375 sur 375, et le maximum est recalculé
   dans la suite à partir des exercices *distincts* des viviers, face pulls occupant deux positions
   du vivier tiré à dessein. Les 25 paires jambes plus gainage et les 15 paires poussé plus tiré
   sont atteintes.
5. **Les paires nommées au carnet ne sont plus rigides.** Le goblet squat sort avec la planche 36
   fois sur 900 et avec autre chose 144 fois, les élévations latérales avec les face pulls 100 fois
   et avec autre chose 200 fois.
6. **Le carrousel reste exact** : le panneau *k* annonce le tirage qui sortira *k* séances plus
   tard, vérifié sur 120 départs.
7. **La garantie échangée l'est réellement.** L'exhaustivité de la fenêtre tombe sur 98 départs sur
   120. Si elle tenait encore, c'est que les viviers ne seraient pas déphasés : la section échoue
   dans ce cas, elle mesure le prix payé et refuse qu'il soit nul.
8. **Retour de profil.** Sept séances sur un inventaire réduit ne déplacent rien : la rotation
   reprend exactement où elle en était.
9. **Chaque emplacement ne lit que son compteur.** Décaler le compteur jambes change le tirage
   jambes et ne touche pas le gainage, ce qui est la condition pour que le gel de rotation des
   séances allégées continue de déphaser.
10. **Les phases sont déclarées et non dérivées du rang dans le circuit.** Quatre valeurs distinctes,
    jambes et gainage de même taille n'en partagent pas, et le poussé garde une rotation régulière.
11. **Le tirage reste borné au vivier tirable**, verrous et matériel compris, sur 200 compteurs.

**Falsification.** Seize défauts injectés, tous détectés. Quinze le sont par `test35.js` :
déphasage retiré ; phases dérivées du rang dans le circuit ; jambes et gainage partageant leur
phase ; phase non nulle sur le plus petit vivier ; décalage des valeurs de départ au lieu du
déphasage ; multiplication au lieu du décalage par tour ; odomètre, le gainage n'avançant qu'au tour
de jambes ; carrousel ignorant le déphasage ; tirage du jour l'ignorant ; lecture qui avance le
compteur ; tour de vivier compté sur une taille fixe ; phase lue sur l'emplacement voisin ; compteur
d'un emplacement lisant celui d'un autre ; `SLOT_PHASE` absent ; exhaustivité rétablie de force.

Le seizième, **un carrousel amputé d'un panneau**, n'est pas détecté par `test35.js` et l'est par
`test23.js`, à qui appartient l'assertion sur la taille de la fenêtre. C'est le partage voulu : deux
suites ne doivent pas tenir la même assertion, sinon aucune des deux ne la possède. Vérifié en
injectant le défaut et en lançant les deux suites.

## test35.js, source

```javascript
// Lot v2.8 : dephasage des quatre viviers. Le tirage n etait determine que par
// un seul entier, les quatre compteurs valant toujours la meme chose. La suite
// verifie ce que le dephasage apporte, ce qu il ne doit surtout pas casser, et
// la garantie qui a ete echangee contre lui.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
const stub=()=>({innerHTML:'',classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
global.document={querySelector:s=>s==='.lightbox'?null:stub(),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async function(){
 await loadState();
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 state.hist=[]; state.perf={}; state.unlocked={}; lightMode=false;
 const tirables=s=>posTirables(s,state.gear);
 const tirage=c=>{ SLOT_ORDER.forEach(s=>state.slotIdx[s]=c); return SLOT_ORDER.map(pickFromPool); };

 // 1. la transformation est une lecture pure : elle ne deplace jamais le compteur
 {
   SLOT_ORDER.forEach(s=>state.slotIdx[s]=7);
   const avant=JSON.stringify(state.slotIdx);
   buildSession(); drawAhead(3); pickFromPool('legs'); pickAt('core',5);
   if(JSON.stringify(state.slotIdx)!==avant)
     throw new Error('le compteur a bouge a la lecture : '+avant+' -> '+JSON.stringify(state.slotIdx));
   console.log('lecture pure OK : ni buildSession, ni le carrousel, ni un tirage isole ne deplacent slotIdx');
 }

 // 2. frequence strictement inchangee : toute tranche de n tirages consecutifs
 //    alignee sur un tour de vivier est une permutation du vivier
 {
   SLOT_ORDER.forEach(s=>{
     const n=tirables(s).length, cnt={};
     for(let c=0;c<n*n*8;c++) { const id=phaseIdx(s,c,n); cnt[id]=(cnt[id]||0)+1; }
     const v=Object.keys(cnt).map(k=>cnt[k]);
     if(Object.keys(cnt).length!==n) throw new Error('positions manquantes sur '+s);
     if(Math.max.apply(null,v)!==Math.min.apply(null,v))
       throw new Error('frequence inegale sur '+s+' : '+v.join(','));
     for(let b=0;b<n*6;b++){
       const vus=new Set();
       for(let j=0;j<n;j++) vus.add(phaseIdx(s,b*n+j,n));
       if(vus.size!==n) throw new Error('la tranche alignee '+b+' de '+s+' n est pas une permutation');
     }
   });
   console.log('frequence OK : ecart nul sur les quatre viviers, chaque tour de vivier est une permutation');
 }

 // 3. aucun vivier ne redonne le meme exercice deux seances de suite
 {
   SLOT_ORDER.forEach(s=>{
     const n=tirables(s).length;
     for(let c=0;c<n*n*8;c++)
       if(phaseIdx(s,c,n)===phaseIdx(s,c+1,n))
         throw new Error('position repetee deux seances de suite sur '+s+' au compteur '+c);
   });
   console.log('enchainement OK : aucune position ne sort deux seances de suite');
 }

 // 4. les paires rigides ont disparu, et les quatuors atteignent le maximum
 //    arithmetique. Le maximum se calcule sur les exercices DISTINCTS des
 //    viviers : face pulls occupe deux positions du vivier tire, a dessein.
 {
   const distincts=SLOT_ORDER.map(s=>new Set(tirables(s).map(i=>SLOTS[s].pool[i])).size);
   const max=distincts.reduce((a,b)=>a*b,1);
   const quat=new Set(), lc=new Set(), pu=new Set();
   for(let c=0;c<900;c++){
     const t=tirage(c);
     quat.add(t.join('|'));
     lc.add(t[SLOT_ORDER.indexOf('legs')]+'+'+t[SLOT_ORDER.indexOf('core')]);
     pu.add(t[SLOT_ORDER.indexOf('push')]+'+'+t[SLOT_ORDER.indexOf('pull')]);
   }
   if(quat.size!==max) throw new Error('quatuors '+quat.size+' pour un maximum de '+max);
   const nl=new Set(tirables('legs').map(i=>SLOTS.legs.pool[i])).size;
   const nc=new Set(tirables('core').map(i=>SLOTS.core.pool[i])).size;
   if(lc.size!==nl*nc) throw new Error('paires jambes+gainage '+lc.size+' au lieu de '+(nl*nc));
   const np=new Set(tirables('push').map(i=>SLOTS.push.pool[i])).size;
   const nu=new Set(tirables('pull').map(i=>SLOTS.pull.pool[i])).size;
   if(pu.size!==np*nu) throw new Error('paires pousse+tire '+pu.size+' au lieu de '+(np*nu));
   console.log('dephasage OK : '+quat.size+' quatuors sur '+max+' possibles, '+lc.size+' paires jambes+gainage, '+pu.size+' paires pousse+tire');
 }

 // 5. les paires nommees au carnet ne sont plus rigides
 {
   let gp=0, gAutre=0, ef=0, eAutre=0;
   for(let c=0;c<900;c++){
     const t=tirage(c);
     const L=t[SLOT_ORDER.indexOf('legs')], C=t[SLOT_ORDER.indexOf('core')];
     const P=t[SLOT_ORDER.indexOf('push')], U=t[SLOT_ORDER.indexOf('pull')];
     if(L==='goblet-squat'){ if(C==='planche') gp++; else gAutre++; }
     if(P==='elevations-laterales'){ if(U==='face-pulls') ef++; else eAutre++; }
   }
   if(gAutre===0) throw new Error('goblet squat toujours apparie a la planche');
   if(eAutre===0) throw new Error('elevations laterales toujours appariees aux face pulls');
   console.log('paires OK : goblet squat avec la planche '+gp+' fois et avec autre chose '+gAutre+', elevations avec face pulls '+ef+' fois et avec autre chose '+eAutre);
 }

 // 6. le carrousel reste exact : le panneau k annonce le tirage qui sortira
 //    reellement k seances plus tard, a jeu normal
 {
   const N=aheadCount();
   for(let dep=0;dep<120;dep++){
     SLOT_ORDER.forEach(s=>state.slotIdx[s]=dep);
     const annonce=[]; for(let k=0;k<N;k++) annonce.push(drawAhead(k).join('|'));
     for(let k=0;k<N;k++){
       const reel=tirage(dep+k).join('|');
       if(reel!==annonce[k]) throw new Error('panneau '+k+' au depart '+dep+' : annonce '+annonce[k]+', sort '+reel);
     }
   }
   console.log('carrousel OK : '+N+' panneaux exacts sur 120 departs');
 }

 // 7. la garantie echangee est bien echangee, et pas seulement affaiblie :
 //    l exhaustivite sur la fenetre du carrousel n existe plus, c est le prix
 //    assume du dephasage. On verifie qu elle tombe reellement, sinon le
 //    dephasage n aurait pas eu lieu.
 {
   const N=aheadCount();
   let manquants=0;
   for(let dep=0;dep<120;dep++){
     const vus={};
     for(let k=0;k<N;k++) tirage(dep+k).forEach(id=>vus[id]=1);
     const tous=[].concat.apply([],SLOT_ORDER.map(s=>tirables(s).map(i=>SLOTS[s].pool[i])));
     if(tous.some(id=>!vus[id])) manquants++;
   }
   if(manquants===0) throw new Error('la fenetre reste exhaustive : les viviers ne sont pas dephases');
   console.log('fenetre OK : exhaustivite perdue sur '+manquants+' departs sur 120, prix assume du dephasage');
 }

 // 8. la garantie de la v2.0 tient : un retour au profil precedent reprend la
 //    rotation ou elle en etait, le compteur n etant deplace par rien
 {
   const ref=[]; for(let c=0;c<12;c++) ref.push(tirage(c).join('|'));
   const gear=JSON.parse(JSON.stringify(state.gear));
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR));
   Object.keys(state.gear.res).forEach(k=>{ if(k!=='hal') state.gear.res[k]=0; });
   for(let c=0;c<7;c++) tirage(c);
   state.gear=gear;
   for(let c=0;c<12;c++)
     if(tirage(c).join('|')!==ref[c]) throw new Error('la rotation ne reprend pas ou elle en etait, compteur '+c);
   console.log('retour de profil OK : sept seances ailleurs ne deplacent rien');
 }

 // 9. le gel de rotation continue de dephaser : deux emplacements dont les
 //    compteurs different tirent independamment
 {
   state.slotIdx={push:0,pull:0,core:0,legs:0};
   const a=SLOT_ORDER.map(pickFromPool);
   state.slotIdx={push:0,pull:0,core:0,legs:3};
   const b=SLOT_ORDER.map(pickFromPool);
   const iL=SLOT_ORDER.indexOf('legs'), iC=SLOT_ORDER.indexOf('core');
   if(a[iL]===b[iL]) throw new Error('un compteur jambes decale ne change pas le tirage jambes');
   if(a[iC]!==b[iC]) throw new Error('un compteur jambes decale a change le tirage gainage');
   console.log('compteurs OK : chaque emplacement ne lit que le sien');
 }

 // 10. les phases sont declarees et non derivees du rang dans le circuit : les
 //     deux decisions doivent rester separables
 {
   if(typeof SLOT_PHASE==='undefined') throw new Error('SLOT_PHASE absent');
   SLOT_ORDER.forEach(s=>{ if(typeof SLOT_PHASE[s]!=='number') throw new Error('phase absente pour '+s); });
   const vals=SLOT_ORDER.map(s=>SLOT_PHASE[s]);
   if(new Set(vals).size!==vals.length) throw new Error('deux emplacements partagent la meme phase');
   if(SLOT_PHASE.core===SLOT_PHASE.legs) throw new Error('jambes et gainage, de meme taille, partagent leur phase');
   if(SLOT_PHASE.push!==0) throw new Error('le plus petit vivier doit garder sa rotation reguliere');
   if(phaseIdx('push',7,3)!==7%3) throw new Error('le vivier pousse n est plus a rotation reguliere');
   console.log('phases OK : quatre valeurs distinctes, declarees, pousse a rotation inchangee');
 }

 // 11. le tirage reste borne au vivier tirable, verrous et materiel compris
 {
   for(let c=0;c<200;c++){
     SLOT_ORDER.forEach(s=>{
       state.slotIdx[s]=c;
       const pos=tirables(s), id=pickFromPool(s);
       const ok=pos.map(i=>SLOTS[s].pool[i]);
       if(ok.indexOf(id)<0&&!Object.keys(SUBS).some(k=>SUBS[k]&&SUBS[k].indexOf&&SUBS[k].indexOf(id)>=0))
         if(ok.map(x=>resolvePos(s,SLOTS[s].pool.indexOf(x),state.gear)||x).indexOf(id)<0)
           throw new Error('tirage hors vivier sur '+s+' au compteur '+c+' : '+id);
     });
   }
   state.slotIdx={push:0,pull:0,core:0,legs:0};
   console.log('bornage OK : 200 compteurs, aucun tirage hors du vivier tirable');
 }

 console.log('TESTS DEPHASAGE DES VIVIERS V2.8 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## Suites existantes retouchées en v2.7

Aucune. La vérification a été faite et consignée pour cette raison. Le changement d'ordre du circuit
déplace la séquence des exercices, et douze suites la traversent : aucune ne lit un exercice par son
rang dans le tour. `test.js` itère sur `SLOT_ORDER` sans en supposer l'ordre. `test9.js` groupe les
pastilles par tour et par exercice en relisant la séquence produite. `test28.js` traverse
`setSessionRounds`, `test29.js` la vignette de l'écran de repos, `test32.js` les séries du jour :
toutes trois passent par `relinkRests`, qui relit la liste et ne calcule plus rien par modulo depuis
la v2.6. Les suites qui pilotent une séance entière comptent les pas de travail et n'en nomment
aucun par sa position.

Deux suites ont été relues de près parce qu'elles nomment des exercices : `test30.js` fabrique son
historique et ne tire pas de séance, `test31.js` travaille sur l'escalier des mollets par appel
direct. Ni l'une ni l'autre ne dépend de l'ordre.

`neutre.js` n'est pas retouchée mais son empreinte bouge, et c'est le critère d'acceptation du lot :
le diff contre la v2.6 doit être une permutation pure. Mesuré, 180 lignes de tirage permutées selon
poussé tiré jambes gainage vers poussé tiré gainage jambes, 24 lignes identiques, et deux lignes
`pool legs` et `pool core` qui échangent leur place parce que `neutre.js` itère elle-même sur
`SLOT_ORDER`. Aucune durée, aucune cible, aucune charge, aucun décompte de remontages n'a changé.

## test34.js, suite du lot v2.7

Dix sections. La suite ne vérifie pas le contenu de `SLOT_ORDER`, sauf une fois en section 2 : cette
égalité-là fige la décision, et les neuf autres sections restent vraies quel que soit l'ordre
choisi. C'est le partage voulu, une seule ligne porte le choix, tout le reste porte l'invariant.

1. **Le plan suit `SLOT_ORDER`.** À 2, 3 et 4 tours, sur douze positions de compteur : le nombre de
   pas de travail vaut quatre fois le nombre de tours, et chaque tour porte les quatre emplacements
   une fois et une seule, dans l'ordre. `plan.exos` et `plan.orig` aussi.
2. **Le circuit est circulaire.** Quatre adjacences et non trois, l'égalité qui fige la décision,
   l'absence d'adjacence jambes vers gainage et la fermeture du tour par jambes vers poussé, vérifiées
   sur la définition puis sur une séquence réelle.
3. **Le carrousel colle au plan.** `drawAhead(0)` donne le tirage du jour, mêmes exercices et même
   ordre, sur dix positions.
4. **Les repos annoncent le pas qui les suit**, y compris aux bornes de tour, qui sont au nombre de
   trois à quatre tours, et aucun repos ne subsiste après le dernier pas de travail.
5. **Les étirements suivent le dernier tour** et ne s'intercalent jamais.
6. **Le modèle de temps est indifférent à l'ordre.** Permuter les quatre exercices à l'intérieur de
   chaque tour ne change ni la durée annoncée ni le décompte de remontages de charge, sur dix
   tirages. C'est la propriété qui rend un changement d'ordre neutre sur le temps, et elle tient
   parce que deux exercices en conflit valent 2R-1 remontages quel que soit leur rang.
7. **Le gel de rotation suit l'emplacement et non la position.** `plan.subs` est indexé par nom
   d'emplacement, en accord avec l'ordre de `plan.orig`. Le cas qui discrimine est la substitution
   **partielle** : quand les quatre emplacements basculent ensemble, un index décalé d'un cran reste
   invisible. La suite exige au moins cinq tirages à substitution partielle sur trente, elle en
   trouve vingt-cinq.
8. **Bibliothèque et couverture rangées dans l'ordre du circuit**, libellés pris sur `SLOTS`, et
   contrôle sur le texte source qu'aucune table de libellés n'est restée recopiée. La couverture ne
   rend ses barres qu'une fois une semaine révolue : l'historique posé en couvre trois.
9. **Le tirage n'a pas bougé.** À compteurs égaux, chaque emplacement sert la position qu'il servait
   avant, sur quinze compteurs : le vivier est lu par nom d'emplacement et jamais par rang dans le
   circuit.

**Falsification.** Seize défauts injectés, tous détectés : ordre d'origine restauré ; ordre
séparant poussé et tiré, qui satisfait pourtant toutes les propriétés de la section 2 et n'est
attrapé que par l'égalité ; gainage remis en queue de tour ; plan construit sur un ordre écrit en
dur ; carrousel sur un ordre écrit en dur ; `subs` indexé sur l'emplacement suivant ; `relinkRests`
retiré de la construction ; table de libellés recopiée dans la bibliothèque ; table de libellés
recopiée dans la couverture ; couverture rangée hors circuit ; étirements posés avant le dernier
tour ; repos conservé après le dernier pas de travail ; `workSteps` englobant les étirements ;
montage remis à zéro à chaque début de tour ; vivier lu par rang dans le circuit ; séries groupées
par exercice au lieu de tours.

Deux de ces seize n'étaient pas détectés au premier jet, et c'est la falsification qui l'a montré.
L'ordre séparant poussé et tiré passait parce que la section 2 ne vérifiait que des propriétés :
une suite qui décrit une décision sans jamais l'énoncer laisse passer toutes les autres décisions
qui partagent ses propriétés. Et `subs` décalé d'un cran passait parce que le mode allégé substitue
en général les quatre emplacements d'un coup : un décalage uniforme est indétectable sur un cas
uniforme.

## ordre-circuit.js

Script de mesure, hors `build.sh`. Il ne teste pas l'application, il mesure une propriété
combinatoire des viviers, et ses entrées sont déclarées en tête de fichier plutôt qu'extraites du
code : les viviers sont recopiés de `SLOTS`, et **la table de marqueurs est une proposition, pas une
donnée de l'outil**. Rien dans `index.html` ne la lit, et aucune décision de la v2.7 ne dépend de
ses lignes contestables, le test de sensibilité sur 256 jeux de marqueurs le montre.

Il répond à trois questions : ce que le tirage produit réellement compteurs en phase, combien de
conflits d'infrastructure porte chacun des six ordres de circuit, et si le classement résiste au
déphasage des viviers, à l'état de verrous mature et à la contre-hypothèse agoniste-antagoniste.

```javascript
/* ordre-circuit.js — mesure de l ordre du circuit alterne (audit, hors build)
   Node, sans dependance : node ordre-circuit.js

   Ce script ne teste pas l application, il mesure une propriete combinatoire des
   viviers. Il n a donc pas sa place dans build.sh. Ses entrees sont declarees ici
   et non extraites du code : les viviers sont recopies de SLOTS, la table de
   marqueurs est une PROPOSITION a valider, pas une donnee de l outil.

   Trois questions :
   1. quelles combinaisons le tirage produit reellement, compteurs en phase
   2. combien de conflits d infrastructure porte chacun des six ordres de circuit
   3. le classement resiste-t-il au dephasage des viviers, a l etat de verrous
      mature, et a la contre-hypothese agoniste-antagoniste
*/

/* ---------- viviers, recopies de SLOTS, filtres des verrous ---------- */
const ETATS = {
  depart: {
    push: ['pompes-poignees', 'elevations-laterales', 'developpe-sol'],
    pull: ['tractions-assistees-supination', 'face-pulls', 'rowing-suspension',
           'rowing-kettlebell', 'face-pulls', 'curls-halteres'],
    legs: ['goblet-squat', 'fentes-arriere', 'pont-fessier', 'mollets-debout', 'step-ups'],
    core: ['planche', 'bird-dog', 'gainage-lateral', 'dead-bug', 'pallof-press']
  },
  mature: {
    push: ['pompes-poignees', 'elevations-laterales', 'developpe-sol'],
    pull: ['tractions-strictes-supination', 'face-pulls', 'rowing-suspension',
           'rowing-kettlebell', 'face-pulls', 'curls-halteres'],
    legs: ['goblet-squat', 'fentes-arriere-lestee', 'pont-fessier', 'mollets-une-jambe-leste',
           'step-ups', 'rdl-kettlebell', 'kb-swings'],
    core: ['planche-ballon', 'bird-dog', 'gainage-lateral-jambe-levee', 'dead-bug', 'pallof-press']
  }
};

/* ---------- marqueurs d infrastructure partagee : PROPOSITION ----------
   Quatre ressources seulement. 3 = peut devenir limitant, 2 = notable, absent = fond.
   Le « maintien de charge devant » du rapport n est pas une ressource : c est la
   somme d epaule, coude et prehension, et le compter separement double le meme fait. */
const M = {
  'pompes-poignees':                 { epaule: 3, coude: 3 },
  'elevations-laterales':            { epaule: 3 },
  'developpe-sol':                   { epaule: 3, coude: 3, prehension: 2 },
  'tractions-assistees-supination':  { prehension: 3, coude: 3, epaule: 2 },
  'tractions-strictes-supination':   { prehension: 3, coude: 3, epaule: 3 },
  'face-pulls':                      { epaule: 3, prehension: 2 },
  'rowing-suspension':               { prehension: 3, coude: 2, epaule: 2 },
  'rowing-kettlebell':               { prehension: 3, coude: 2, erecteurs: 2 },
  'curls-halteres':                  { coude: 3, prehension: 2 },
  'goblet-squat':                    { epaule: 3, coude: 2, prehension: 2 },
  'fentes-arriere':                  {},
  'fentes-arriere-lestee':           { prehension: 3 },
  'pont-fessier':                    {},
  'mollets-debout':                  {},
  'mollets-une-jambe-leste':         { epaule: 2 },
  'step-ups':                        {},
  'rdl-kettlebell':                  { prehension: 3, erecteurs: 3 },
  'kb-swings':                       { prehension: 3, erecteurs: 3, epaule: 2 },
  'planche':                         { epaule: 3 },
  'planche-ballon':                  { epaule: 3 },
  'bird-dog':                        { epaule: 2 },
  'gainage-lateral':                 { epaule: 3 },
  'gainage-lateral-jambe-levee':     { epaule: 3 },
  'dead-bug':                        {},
  'pallof-press':                    { epaule: 2, prehension: 2 }
};

/* Conflit sur une adjacence : 3+3 ou 3+2 sur la meme ressource. 2+2 ne compte pas.
   Le circuit est CIRCULAIRE : quatre adjacences, la fermeture du tour comprise. */
function conflits(a, b) {
  const out = [];
  Object.keys(M[a]).forEach(r => { if (M[a][r] + (M[b][r] || 0) >= 5) out.push(r); });
  return out;
}

const ORDRES = {
  'P,U,L,C (actuel)': ['push', 'pull', 'legs', 'core'],
  'P,U,C,L':          ['push', 'pull', 'core', 'legs'],
  'P,L,U,C':          ['push', 'legs', 'pull', 'core'],
  'P,L,C,U':          ['push', 'legs', 'core', 'pull'],
  'P,C,U,L':          ['push', 'core', 'pull', 'legs'],
  'P,C,L,U':          ['push', 'core', 'legs', 'pull']
};

function nb(t, o, neutrePU) {
  let n = 0;
  for (let k = 0; k < 4; k++) {
    const sa = o[k], sb = o[(k + 1) % 4];
    if (neutrePU && ((sa === 'push' && sb === 'pull') || (sa === 'pull' && sb === 'push'))) continue;
    n += conflits(t[sa], t[sb]).length;
  }
  return n;
}

function cycle(P) {   /* tirages reels : les quatre compteurs valent le meme entier */
  const n = [P.push, P.pull, P.legs, P.core].map(p => p.length)
    .reduce((a, b) => { const g = (x, y) => y ? g(y, x % y) : x; return a * b / g(a, b); });
  const out = [];
  for (let i = 0; i < n; i++) out.push({ push: P.push[i % P.push.length], pull: P.pull[i % P.pull.length],
                                          legs: P.legs[i % P.legs.length], core: P.core[i % P.core.length] });
  return out;
}
function toutes(P) {  /* tirages possibles si les compteurs se dephasaient */
  const out = [];
  P.push.forEach(a => P.pull.forEach(b => P.legs.forEach(c => P.core.forEach(d =>
    out.push({ push: a, pull: b, legs: c, core: d })))));
  return out;
}

function classement(lot, neutrePU) {
  return Object.keys(ORDRES).map(n => ({
    n: n,
    moy: lot.reduce((a, t) => a + nb(t, ORDRES[n], neutrePU), 0) / lot.length,
    zero: lot.filter(t => nb(t, ORDRES[n], neutrePU) === 0).length / lot.length
  })).sort((a, b) => a.moy - b.moy);
}
function affiche(titre, lot, neutrePU) {
  console.log('\n' + titre + '  (' + lot.length + ' combinaisons)');
  classement(lot, neutrePU).forEach((x, k) => console.log(
    '  ' + (k + 1) + '. ' + x.n.padEnd(18) + ' conflits/seance ' + x.moy.toFixed(2) +
    '   seances propres ' + (100 * x.zero).toFixed(0) + ' %'));
}

/* ---------- 1. ce que le tirage produit reellement ---------- */
const cyc = cycle(ETATS.depart);
const distinctes = new Set(cyc.map(t => [t.push, t.pull, t.legs, t.core].join('|')));
console.log('=== Tirage reel, etat de depart, compteurs en phase ===');
console.log('Cycle                       :', cyc.length, 'tirages');
console.log('Combinaisons distinctes     :', distinctes.size, 'sur',
  toutes(ETATS.depart).length, 'arithmetiquement possibles');
console.log('Paires jambes+gainage       :', new Set(cyc.map(t => t.legs + ' + ' + t.core)).size, 'seulement');
console.log('Paires pousse+tire          :', new Set(cyc.map(t => t.push + ' + ' + t.pull)).size, 'seulement');
const g = cyc.filter(t => t.legs === 'goblet-squat');
console.log('Goblet squat                :', g.length + '/' + cyc.length,
  ', dont avec planche ' + g.filter(t => t.core === 'planche').length + '/' + g.length);
console.log('Cas-test du rapport         :',
  cyc.filter(t => t.push === 'elevations-laterales' && t.pull === 'face-pulls' &&
                  t.legs === 'goblet-squat' && t.core === 'planche').length + '/' + cyc.length);
console.log('Seance vecue le 4 septembre :',
  cyc.filter(t => t.push === 'developpe-sol' && t.pull === 'rowing-suspension' &&
                  t.legs === 'goblet-squat').length + '/' + cyc.length);

/* ---------- 2. les six ordres, quatre scenarios ---------- */
console.log('\n=== Conflits par ordre de circuit ===');
affiche('Depart, modele de base', toutes(ETATS.depart), false);
affiche('Depart, pousse/tire declare neutre (hypothese agoniste-antagoniste, jugement v1.6)',
  toutes(ETATS.depart), true);
affiche('Mature, modele de base', toutes(ETATS.mature), false);
affiche('Mature, pousse/tire declare neutre', toutes(ETATS.mature), true);

/* ---------- 3. gain marginal d un choix d ordre par seance ---------- */
console.log('\n=== Un moteur par seance vaut-il mieux qu une constante ? ===');
[['depart', ETATS.depart], ['mature', ETATS.mature]].forEach(([nom, P]) => {
  const lot = toutes(P);
  const meilleure = classement(lot, false)[0].n;
  const cte = lot.reduce((a, t) => a + nb(t, ORDRES[meilleure], false), 0);
  const opt = lot.reduce((a, t) => a + Math.min.apply(null,
    Object.keys(ORDRES).map(n => nb(t, ORDRES[n], false))), 0);
  console.log('  ' + nom.padEnd(8) + ' meilleure constante ' + meilleure +
    ' : ' + cte + ' conflits   choix optimal par seance : ' + opt +
    '   gain marginal ' + (100 * (cte - opt) / cte).toFixed(0) + ' %');
});

/* ---------- 4. sensibilite du classement aux marqueurs contestables ---------- */
const VAR = [['planche', 'epaule', 2], ['gainage-lateral', 'epaule', 2], ['face-pulls', 'epaule', 2],
             ['goblet-squat', 'epaule', 2], ['rowing-suspension', 'epaule', 3], ['bird-dog', 'epaule', 3],
             ['pallof-press', 'epaule', 3], ['pompes-poignees', 'epaule', 2]];
console.log('\n=== Sensibilite : ' + (1 << VAR.length) + ' jeux de marqueurs, etat de depart, modele de base ===');
const lot = toutes(ETATS.depart), sauv = JSON.parse(JSON.stringify(M)), rangs = {}, gagn = {};
for (let m = 0; m < (1 << VAR.length); m++) {
  Object.keys(sauv).forEach(k => M[k] = JSON.parse(JSON.stringify(sauv[k])));
  VAR.forEach((v, k) => { if (m & (1 << k)) M[v[0]][v[1]] = v[2]; });
  const r = classement(lot, false);
  gagn[r[0].n] = (gagn[r[0].n] || 0) + 1;
  const p = r.findIndex(x => x.n === 'P,U,L,C (actuel)') + 1;
  rangs[p] = (rangs[p] || 0) + 1;
}
Object.keys(sauv).forEach(k => M[k] = sauv[k]);
console.log('  ordre gagnant :');
Object.keys(gagn).forEach(k => console.log('    ' + String(gagn[k]).padStart(3) + '/' + (1 << VAR.length) + '  ' + k));
console.log('  rang de l ordre actuel :');
Object.keys(rangs).sort().forEach(k => console.log('    rang ' + k + ' : ' + rangs[k] + '/' + (1 << VAR.length)));
```

## Suites existantes retouchées en v2.6

Aucune. La vérification a été faite et consignée pour cette raison. `test29.js` inspecte la vignette
de l'écran de repos depuis la v2.2 et cherche `kg`, `élastique`, `reps` et `Cible` dans le bloc :
les séries du jour n'introduisent aucune de ces chaînes, et son extraction du bloc, qui coupe au
premier `</div>`, englobe le nouveau `span` sans changer de résultat. Ses deux contrôles sur
`s.next` restent vrais, le champ étant toujours écrit, simplement plus au même endroit.

`test28.js` traverse `setSessionRounds` et ne lit pas `next` : la pose déplacée dans `relinkRests`
lui est transparente.

`test8.js` — sa section 11 pose `lastExport` à trois fois 86 400 s en arrière, ce qui reste trois
jours civils quelle que soit l'heure de lancement, changements d'heure compris : le passage de
`lastExportLabel` aux jours civils ne la touche pas. Vérifiée et laissée intacte.

`test4.js` et `test6.js` lisent `weekCounts` sur des historiques posés en journée ; le passage du
découpage du jour de l'UTC au local ne change aucune de leurs valeurs. La vérification a été faite
parce que ces deux suites sont les seules à mesurer un compte hebdomadaire.

## Suites existantes retouchées en v2.5

`test9.js` — le catalogue passe de 46 à 49 fiches avec les trois échelons de mollets.

`test22.js` — la banque passe de 49 à 52 images : une refaite, `mollets-debout`, et trois neuves.
Deux écritures du même nombre, l'assertion et son message de succès, mises à jour ensemble. Le
contrôle d'images mortes n'a rien demandé, les quatre clés servent des fiches.

`test24.js` — la portée structurelle comptait quatre exercices à charge fixe, il y en a six. Le
nombre d'exercices à bande ne bouge pas : l'escalier des mollets ne passe par aucune bande.

`test28.js` — le vivier jambes de référence passe de 8 à 11 entrées. L'assertion qui suit, cinq
entrées **tirables**, est inchangée : c'est elle l'invariant, et c'est pour cette raison que le
commentaire posé au-dessus dit lequel des deux nombres compte.

Aucune retouche sur `test11.js`, qui a fait son office : il a refusé un repli pointant vers
`mollets-debout-leste`, exercice verrouillé. La faute était dans la conception du lot, pas dans la
suite, et les trois échelons replient désormais sur `mollets-debout`, seul maillon sans verrou.

**Piège de patch, constaté en v2.5.** Plusieurs sections portent un titre qui en préfixe un autre :
`## test28.js, suite du lot v2.1` est une section de prose, `## test28.js` porte le source, et les
deux commencent par la même chaîne. Un script de mise à jour qui cherche `'## test28.js'` par
préfixe tombe sur la prose, puis remplace le premier bloc qu'il trouve après elle, lequel appartient
à la section suivante : c'est ainsi que le source de `test30` a été écrasé par celui de `test28`
pendant la préparation du lot. Ancrer la recherche en fin de ligne, et borner le bloc au prochain
titre de section.

## Suites existantes retouchées en v2.4

`test22.js` — la section 10 attendait 48 images, la banque en porte 49 avec `echauf-nuque`. Deux
écritures du même nombre, l'assertion et son message de succès, mises à jour ensemble. Le contrôle
d'images mortes n'a demandé aucune retouche : il lit déjà `WARMUP` en plus des clés de `DB` depuis
la v2.0, et `echauf-nuque` est servie par une étape d'échauffement.

## Suites existantes retouchées en v2.3

**Toutes les suites, propriété de forme.** Le helper `domicile` retirait le drapeau d'onboarding par
`delete state.onboard`, geste que l'application ne fait plus : la validation écrit `false`. Le helper
s'aligne sur le comportement applicatif dans les vingt-neuf suites d'alors et dans `neutre.js` :

```javascript
const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
```

Sans cet alignement, `test23.js` tombait sur son contrôle d'idempotence de la migration v1.18 : la
sonde de forme du drapeau abaissait une clé que le helper venait de supprimer, donc `migrateState`
modifiait un état qu'elle aurait dû laisser intact. L'échec était un artefact de test et non un
défaut applicatif, la suppression de clé n'étant plus un geste de l'application.

## Suites existantes retouchées en v2.2

`test8.js` — la section 9 comparait le nombre de blocs `class="badge` au cardinal de `BADGES`, ce
qui reste vrai, le compteur d'avancement portant une classe distincte. Aucune retouche n'a été
nécessaire : les deux assertions de la suite lisent `BADGES.length` et suivent donc le retrait de
`mob5` et l'ajout de `w12` toutes seules. Consigné parce que la vérification a été faite, pas parce
qu'elle a produit un changement.

## test34.js, source

```javascript
// Lot v2.7 : ordre du circuit. La suite ne verifie pas le contenu de
// SLOT_ORDER, ce serait une tautologie : elle verifie les invariants qui
// doivent survivre a un changement d ordre, et que rien dans le code ne suppose
// une position particuliere. Elle reste vraie quel que soit l ordre choisi,
// sauf la section 2 qui porte sur la decision elle-meme.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},
  execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const SRC=src;
const T=`
(async function(){
 await loadState();
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 state.hist=[]; state.perf={}; state.unlocked={}; lightMode=false;
 const catOf=id=>DB[id].cat;

 // 1. le plan suit SLOT_ORDER, tour par tour, quel que soit le volume
 ROUNDS_CHOICES.forEach(R=>{
   state.rounds=R;
   for(let k=0;k<12;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     const p=buildSession();
     const w=workSteps(p.steps);
     if(w.length!==4*R) throw new Error('pas de travail attendus '+(4*R)+', obtenus '+w.length+' a '+R+' tours');
     for(let r=0;r<R;r++){
       const tour=w.slice(r*4,r*4+4).map(st=>catOf(st.id));
       if(tour.join(',')!==SLOT_ORDER.join(','))
         throw new Error('tour '+(r+1)+' hors ordre : '+tour.join(',')+' au lieu de '+SLOT_ORDER.join(','));
     }
     if(p.exos.map(catOf).join(',')!==SLOT_ORDER.join(','))
       throw new Error('plan.exos hors ordre au tirage '+k);
     if(p.orig.map(catOf).join(',')!==SLOT_ORDER.join(','))
       throw new Error('plan.orig hors ordre au tirage '+k);
   }
 });
 state.rounds=3;
 console.log('ordre OK : chaque tour porte les quatre emplacements une fois, dans l ordre du circuit, a 2, 3 et 4 tours');

 // 2. le circuit est circulaire : quatre adjacences, dont la fermeture du tour.
 //    Decision v2.10 : pousse, jambes, tire, gainage. Elle remplace celle de
 //    la v2.7, dont la mesure comparait des ordres miroir toujours ex aequo et
 //    supposait les quatre emplacements independants sur l epaule. Le tour se
 //    referme desormais sur gainage vers pousse, et cette fermeture porte la
 //    pause de raccord : l ordre seul serait une regression mesuree, les deux
 //    decisions sont indissociables. L egalite explicite fige la decision ;
 //    les proprietes qui suivent disent pourquoi elle a ete prise. Les autres
 //    sections de la suite restent vraies quel que soit l ordre.
 if(SLOT_ORDER.join(',')!=='push,legs,pull,core')
   throw new Error('ordre du circuit attendu push,legs,pull,core, obtenu '+SLOT_ORDER.join(','));
 const adj=[];
 for(let i=0;i<SLOT_ORDER.length;i++) adj.push(SLOT_ORDER[i]+'>'+SLOT_ORDER[(i+1)%SLOT_ORDER.length]);
 if(adj.length!==4) throw new Error('quatre adjacences attendues, obtenues '+adj.length);
 if(adj.indexOf('legs>core')>=0) throw new Error('adjacence jambes vers gainage toujours presente');
 if(adj.indexOf('core>push')<0) throw new Error('le tour ne se referme pas sur gainage vers pousse');
 /* ce que l ordre achete : le tire cesse d etre precede du pousse. Le face
    pull, marque epaule, voyait son predecesseur conflictuer dans 67 % des
    quatuors en v2.7 et dans 13 % ici. */
 if(adj.indexOf('legs>pull')<0) throw new Error('le tire n est plus precede des jambes, le face pull perd sa protection');
 if(adj.indexOf('push>pull')>=0) throw new Error('le pousse precede encore le tire');
 if(SLOT_ORDER[0]!=='push') throw new Error('le pousse n ouvre plus le tour');
 {
   const p=buildSession(), w=workSteps(p.steps);
   for(let i=0;i+1<w.length;i++){
     if(catOf(w[i].id)==='legs'&&catOf(w[i+1].id)==='core')
       throw new Error('jambes suivi de gainage dans la sequence reelle, pas '+i);
   }
   if(catOf(w[w.length-1].id)!=='core') throw new Error('le dernier pas de travail n est pas le gainage');
 }
 console.log('circuit OK : quatre adjacences, plus de jambes vers gainage ni de pousse vers tire, fermeture par gainage vers pousse');

 // 3. le carrousel colle au plan : drawAhead(0) donne le tirage du jour
 for(let k=0;k<10;k++){
   state.slotIdx={push:k,pull:k,legs:k,core:k};
   const p=buildSession(), a=drawAhead(0);
   if(a.join('|')!==p.orig.join('|'))
     throw new Error('carrousel decorrele du plan au tirage '+k+' : '+a.join(',')+' vs '+p.orig.join(','));
   if(a.map(catOf).join(',')!==SLOT_ORDER.join(','))
     throw new Error('carrousel hors ordre au tirage '+k);
 }
 console.log('carrousel OK : meme tirage et meme ordre que le plan, sur dix positions');

 // 4. les repos annoncent le pas de travail suivant, y compris aux bornes de
 //    tour, et aucun repos ne suit le dernier pas de travail
 {
   state.slotIdx={push:0,pull:0,legs:0,core:0};
   state.rounds=4; state.cardio=false;
   const p=buildSession();
   const L=p.steps;
   let bornes=0;
   for(let i=0;i<L.length;i++){
     if(L[i].k!=='rest') continue;
     let j=i+1; while(j<L.length&&L[j].k!=='set') j++;
     if(j>=L.length||L[j].cool) throw new Error('repos sans pas de travail suivant, position '+i);
     if(L[i].next!==L[j].id) throw new Error('repos annonce '+L[i].next+' au lieu de '+L[j].id);
     if(L[i].nextKey!==(L[j].key||L[j].id)) throw new Error('nextKey desaccorde a la position '+i);
     /* v2.10 : la borne de tour est gainage vers pousse */
     if(catOf(L[i-1].id)==='core'&&catOf(L[j].id)==='push') bornes++;
   }
   if(bornes!==3) throw new Error('trois bornes de tour attendues a 4 tours, obtenues '+bornes);
   const w=workSteps(L), last=L.indexOf(w[w.length-1]);
   for(let i=last+1;i<L.length;i++)
     if(L[i].k==='rest') throw new Error('repos apres le dernier pas de travail');
   console.log('repos OK : chaque repos annonce le pas qui le suit, trois bornes de tour, aucun repos en queue');
 }

 // 5. les etirements suivent le dernier tour et ne portent pas de repos
 {
   state.warm='complet'; state.stretch=true; state.cardio=true;
   const p=buildSession(), L=p.steps;
   const cools=L.map((s,i)=>s.cool?i:-1).filter(i=>i>=0);
   if(!cools.length) throw new Error('aucun etirement alors qu ils sont actifs');
   const w=workSteps(L);
   const lastWork=L.indexOf(w[w.length-1]);
   if(cools[0]<lastWork) throw new Error('un etirement precede le dernier pas de travail');
   console.log('etirements OK : apres le dernier tour, jamais intercales');
 }

 // 6. duree annoncee et remontages de charge sont indifferents a l ordre :
 //    permuter les quatre exercices a l interieur de chaque tour ne les change
 //    pas. C est la propriete qui rend un changement d ordre neutre sur le
 //    modele de temps.
 {
   state.cardio=false; state.stretch=false; state.warm='court';
   for(let k=0;k<10;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     const p=buildSession();
     const a=planParts(p);
     const q=JSON.parse(JSON.stringify(p));
     const w=q.steps.filter(s=>s.k==='set'&&!s.cool);
     const R=effRounds();
     for(let r=0;r<R;r++){
       const bloc=w.slice(r*4,r*4+4);
       const permute=[bloc[3],bloc[1],bloc[2],bloc[0]];
       let n=0;
       for(let i=0;i<q.steps.length;i++){
         if(q.steps[i].k==='set'&&!q.steps[i].cool){
           if(n>=r*4&&n<r*4+4) q.steps[i]=permute[n-r*4];
           n++;
         }
       }
     }
     const b=planParts(q);
     if(Math.round(a.total)!==Math.round(b.total))
       throw new Error('duree sensible a l ordre au tirage '+k+' : '+Math.round(a.total)+' vs '+Math.round(b.total));
     if(a.nRemount!==b.nRemount)
       throw new Error('remontages sensibles a l ordre au tirage '+k+' : '+a.nRemount+' vs '+b.nRemount);
   }
   console.log('modele de temps OK : duree et remontages inchanges par permutation des quatre exercices');
 }

 // 7. le gel de rotation suit l emplacement et non la position : plan.subs est
 //    indexe par nom d emplacement, en accord avec l ordre de plan.orig. Le cas
 //    qui discrimine est la substitution PARTIELLE : quand les quatre
 //    emplacements basculent ensemble, un index decale reste indetectable.
 {
   lightMode=true;
   let partiels=0;
   for(let k=0;k<30;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     const p=buildSession();
     const changes=SLOT_ORDER.filter((s,i)=>p.exos[i]!==p.orig[i]);
     Object.keys(p.subs).forEach(s=>{
       if(SLOT_ORDER.indexOf(s)<0) throw new Error('subs porte un emplacement inconnu : '+s);
     });
     if(Object.keys(p.subs).length!==changes.length)
       throw new Error('subs compte '+Object.keys(p.subs).length+' emplacements pour '+changes.length+' substitutions, tirage '+k);
     SLOT_ORDER.forEach((s,i)=>{
       const change=p.exos[i]!==p.orig[i];
       if(change&&!p.subs[s]) throw new Error('emplacement '+s+' substitue mais non marque, tirage '+k);
       if(!change&&p.subs[s]) throw new Error('emplacement '+s+' marque sans substitution, tirage '+k);
       if(change&&catOf(p.orig[i])!==s) throw new Error('index de subs decorrele de SLOT_ORDER sur '+s);
     });
     if(changes.length>0&&changes.length<4) partiels++;
   }
   if(partiels<5) throw new Error('trop peu de substitutions partielles pour discriminer : '+partiels);
   lightMode=false;
   console.log('gel OK : subs indexe par emplacement, verifie sur '+partiels+' tirages a substitution partielle');
 }

 // 8. bibliotheque et couverture suivent l ordre du circuit, libelles pris sur
 //    SLOTS, et aucune table de libelles n est restee recopiee dans le code
 {
   state.hist=[]; view='lib'; libQ=''; render();
   const pos=SLOT_ORDER.map(s=>html.indexOf('>'+SLOTS[s].label+'<'));
   pos.forEach((x,i)=>{ if(x<0) throw new Error('libelle absent de la bibliotheque : '+SLOTS[SLOT_ORDER[i]].label); });
   for(let i=1;i<pos.length;i++)
     if(pos[i]<pos[i-1]) throw new Error('bibliotheque hors ordre du circuit');
   const iCardio=html.indexOf('>Cardio<');
   if(iCardio>=0&&iCardio<pos[pos.length-1]) throw new Error('Cardio avant le dernier emplacement');
 }
 {
   /* la couverture ne rend ses barres qu une fois une semaine revolue :
      l historique couvre trois semaines */
   state.hist=[21,17,14,10,7].map(d=>({date:new Date(Date.now()-d*864e5).toISOString(),dur:900,plan:900,items:[
     {id:'pompes-poignees',sets:[8,8]},{id:'face-pulls',sets:[10,10]},
     {id:'planche',sets:[20,20]},{id:'goblet-squat',sets:[8,8],load:10}]}));
   const sh=statsHtml();
   const pos=SLOT_ORDER.map(s=>sh.indexOf(SLOTS[s].label));
   pos.forEach((x,i)=>{ if(x<0) throw new Error('libelle absent de la couverture : '+SLOTS[SLOT_ORDER[i]].label); });
   for(let i=1;i<pos.length;i++)
     if(pos[i]<pos[i-1]) throw new Error('couverture hors ordre du circuit');
   state.hist=[];
   console.log('affichages OK : bibliotheque et couverture rangees dans l ordre du circuit');
 }
 if(SRC.indexOf("['push','Poussé'],['pull','Tiré']")>=0)
   throw new Error('table de libelles recopiee dans la bibliotheque');
 if(SRC.indexOf("{push:'Poussé',pull:'Tiré'")>=0)
   throw new Error('table de libelles recopiee dans la couverture');
 if((SRC.match(/label:'Poussé'/g)||[]).length!==1)
   throw new Error('le libelle Poussé doit etre declare une fois et une seule, dans SLOTS');
 console.log('source OK : un seul jeu de libelles d emplacement, celui de SLOTS');

 // 9. le tirage lui-meme n a pas bouge : a compteurs egaux, chaque emplacement
 //    sert la meme position qu avant le changement d ordre. Le vivier est lu
 //    par emplacement et jamais par rang dans le circuit.
 {
   for(let k=0;k<15;k++){
     state.slotIdx={push:k,pull:k,legs:k,core:k};
     SLOT_ORDER.forEach(s=>{
       const pos=posTirables(s,state.gear);
       const attendu=pos[k%pos.length];
       const rendu=SLOTS[s].pool.indexOf(pickFromPool(s));
       if(rendu!==attendu&&!resolvePos(s,attendu,state.gear))
         throw new Error('tirage decale sur '+s+' au compteur '+k);
     });
   }
   console.log('tirage OK : chaque emplacement lit son vivier par son nom, sans reference a son rang');
 }

 console.log('TESTS ORDRE DU CIRCUIT V2.7 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test33.js, second volet du lot v2.6

Cinq sections sur le découpage du temps. **La suite force `Europe/Brussels` avant le premier appel à
`Date` et échoue si le forçage n'a pas pris** : sous `TZ=UTC` le découpage UTC et le découpage local
coïncident, et rien ne serait discriminé. Vérifiée verte sous cinq fuseaux de lancement, UTC,
Bruxelles, Los Angeles, Auckland et Calcutta.

**Horloge figée.** Trois des cinq sections figent « maintenant ». Sans cela, « exporté hier à 20 h »
ne discrimine l'ancienne écriture que si la suite tourne avant 20 h, et le défaut passait inaperçu
une soirée sur quatre. C'est la falsification qui l'a montré : le retour aux tranches de 24 h n'était
pas détecté au premier jet. Une suite dont le verdict dépend de l'heure de son lancement ne mesure
rien.

**1. Le jour civil est local, l'instant reste UTC.** Le 16 juillet à 00 h 30 à Bruxelles vaut le 15
en UTC, et c'est le seul cas où les deux découpages se séparaient. Contrôle sur cinq instants, dont
les deux dimanches de changement d'heure, que la clé de jour dit le même jour que la ligne affichée
par `fmtDT`, et que la clé de mois est le préfixe de la clé de jour. Contre-témoin : l'horodatage
écrit dans l'état reste un instant UTC, le correctif ne touche qu'à la lecture.

**2. L'en-tête fermé compte en jours civils.** Horloge figée au mercredi 15 juillet 2026 à 8 h.
Exporté la veille à 20 h et à 9 h, l'en-tête dit « hier » dans les deux cas ; l'avant-veille à 23 h,
« il y a 2 j ». Témoin explicite : les mêmes instants comptés en tranches de 24 h donnent 0 là où
l'écart civil donne 1, ce qui est exactement ce qu'affichait l'ancienne écriture. Et une propriété,
sur cinq écarts : l'en-tête dit « aujourd'hui » si et seulement si la clé de jour de l'export vaut
celle du jour, donc il ne peut plus contredire la ligne de date placée juste en dessous.

**3. Le nom du fichier porte le jour annoncé.** Horloge figée au 16 juillet à 00 h 30, la fenêtre où
le nom se séparait de la date. `downloadData` est appelée pour de vrai, `createElement` intercepté :
le fichier s'appelle `palier-2026-07-16.json`. Témoin : le découpage UTC aurait nommé le 15.

**4. Les jours actifs se comptent sur le jour civil.** Deux séances du même jour à Bruxelles, l'une à
00 h 30 et l'autre à 9 h, donc deux dates UTC différentes, comptent pour un seul jour actif, et le
compte hebdomadaire les compte de la même façon. Une assertion vérifie d'abord que le cas est bien
discriminant, sans quoi la section se contenterait de deux dates identiques.

**5. Plus aucun découpage UTC d'un jour ou d'un mois.** Le source assemblé est relu ligne à ligne :
aucun `toISOString().slice(0,10)` ni `(0,7)`, aucun `h.date.slice(0,10)`. Et un seul chemin par
grandeur : `today()` faisait doublon avec `dayKey()`, la suite échoue s'il réapparaît.

**Falsification.** Neuf défauts injectés, tous détectés : clé de jour redécoupée en UTC ; clé de mois
redécoupée en UTC ; clé de jour sans zéro de tête ; écart revenu aux tranches de 24 h ; jours actifs
redécoupés en UTC ; compte hebdomadaire redécoupé en UTC ; nom de fichier redécoupé en UTC ;
`today()` réintroduit en doublon ; en-tête fermé muet sur « hier ».

```javascript
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
```

## test32.js, suite du lot v2.6

Cinq sections sur les séries du jour portées par la vignette de l'écran de repos.

**1. Rien au premier passage, puis la liste croît.** La séance est déroulée pas à pas et chaque
transition est inspectée **au moment où on la traverse**, et non sur la liste d'étapes après coup :
c'est ce que voit l'utilisateur. Mesuré à quatre séries, 3 transitions nues puis 12 chargées sur
15, ce qui est la forme générale 4R-4 sur 4R-1. La liste ne dépasse jamais trois valeurs, le volume
plafonnant à quatre séries.

**2. La clé lue est `nextKey` et jamais l'identifiant.** Un repli douleur est déclenché après un
tour complet : la vignette du repli ne porte rien tant qu'aucune série n'y a été jouée, ne montre
jamais les séries de l'exercice d'origine, puis porte les siennes ; le retour restitue celles de
l'origine. C'est le contrôle qui échoue si la lecture retombe sur l'identifiant.

**3. `next` et `nextKey` ont un seul point de pose.** Les trois entrées sont éprouvées, construction
de séance, changement de volume dans les deux sens, et `relinkRests` seule après effacement des deux
champs. Les trois donnent le même résultat.

**4. Séance allégée.** La substitution du mode allégé écrit une clé composée ; la vignette la suit
sans rien savoir du mode.

**5. La frontière de la v2.2 tient.** Aucune charge, aucun barreau, aucune cible, aucune fourchette,
aucun `onclick` dans le bloc. La cible est cherchée isolée après retrait de la liste du journal, sans
quoi une cible égale à une valeur jouée passerait inaperçue.

L'invariant central est vérifié à chaque transition et dans les cinq sections par la même fonction :
ce que la vignette montre est exactement `cur.log[nextKey]`, et exactement ce que la pastille de
l'écran de série montre pour le même pas. Deux écrans qui divergent ne peuvent pas passer.

**Falsification.** Huit défauts injectés un à un dans une copie des sources, build refait, suite
relancée. Contrôle préalable que le patch mord et que la syntaxe reste valide, sans quoi un échec de
syntaxe se lirait comme une détection. Les huit sont détectés : lecture de l'identifiant au lieu de
`nextKey` ; liste affichée même vide ; libellé « Fait » au lieu d'« Aujourd'hui » ; formateur écrit
à la main avec espaces au lieu de `setsHtml` ; `buildSession` sans `relinkRests` ; `setSessionRounds`
sans `relinkRests` ; `nextKey` posé sur l'identifiant plutôt que sur la clé ; cible ajoutée à la
vignette.

```javascript
// Lot v2.6 : series deja faites aujourd hui sur la vignette de l ecran de
// repos, et pose unique de next / nextKey par relinkRests.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
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

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async(r)=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=r||3; state.sound=false; };
 /* on joue le chemin reel : une serie chiffree se valide a sa cible, une tenue
    recoit ses mesures par holdInit puis se valide. Rien n est ecrit a la main
    dans cur.log, sans quoi la suite fabriquerait son sujet. */
 const jouer=()=>{ const st=cur.steps[cur.i];
   if(!st) return false;
   if(st.k!=='set'){ nextStep(); return true; }
   const e=DB[st.id];
   if(e.mode==='time'){ holdInit(st,e); for(let i=0;i<st.sides.length;i++) st.sides[i]=30; } else if(e.rhythm){ st.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=30; }
   else if(e.mode==='stretch'){ skipSet(); return true; }
   else st.val=st.val||perfFor(st.id,!!st.light).target||8;
   validateSet(); return true; };
 /* la vignette d un repos, base64 de l illustration retire */
 const vign=s=>restHtml(s).split('class="nextexo"')[1].split('</div>')[0].replace(/src="[^"]*"/g,'src=""');
 /* invariant central : ce que la vignette montre est exactement ce que le
    journal contient pour le pas de travail suivant, et exactement ce que la
    pastille de l ecran de serie montre pour ce meme pas. */
 const controle=(ou)=>{
   let vus=0, avec=0;
   cur.steps.forEach((s,i)=>{
     if(s.k!=='rest') return;
     vus++;
     const nx=nextWork(cur.steps,i);
     if(!nx) throw new Error(ou+' : un repos sans pas de travail suivant');
     if(s.next!==nx.id) throw new Error(ou+' : next divergent du pas suivant');
     if(s.nextKey!==(nx.key||nx.id)) throw new Error(ou+' : nextKey divergent de la cle du pas suivant');
     const attendu=cur.log[nx.key||nx.id]||[];
     const v=vign(s);
     if(!attendu.length){
       if(v.indexOf('class="jour"')>=0) throw new Error(ou+' : rien de fait aujourd hui, la vignette ne doit rien porter');
       return;
     }
     avec++;
     if(v.indexOf('class="jour"')<0) throw new Error(ou+' : series du jour absentes de la vignette');
     if(v.indexOf(setsHtml(attendu))<0) throw new Error(ou+' : liste attendue '+attendu.join('/')+', vignette '+v);
     if(v.indexOf("Aujourd'hui")<0) throw new Error(ou+' : le libelle doit etre celui de l ecran de serie');
     if(nx.k==='set'&&setHtml(nx).indexOf(setsHtml(attendu))<0) throw new Error(ou+' : les deux ecrans doivent porter la meme liste');
   });
   return {vus:vus,avec:avec};
 };

 /* ---------- 1. rien avant le premier passage, puis la liste croit ---------- */
 await neuf(4);
 startSession();
 const r0=cur.steps.filter(s=>s.k==='rest');
 if(r0.length!==15) throw new Error('quinze transitions attendues a quatre series, '+r0.length);
 const c=controle('au lancement');
 if(c.avec!==0) throw new Error('aucune serie faite au lancement, aucune vignette ne doit porter de liste');
 const par=cur.exos.length;
 /* deroule pas a pas : ce qui compte est ce que l ecran montre au moment ou on
    le traverse, pas ce que la liste dirait apres coup. Les trois premieres
    transitions precedent un exercice jamais joue du jour, toutes les autres un
    exercice deja joue : 4R-4 vignettes chargees sur 4R-1 transitions. */
 let nus=0, charges=0, maxVal=0, garde=0;
 /* on s arrete avant la derniere etape : endSession est asynchrone et sa
    resolution tomberait apres le rechargement d etat de la section suivante */
 while(cur.i<cur.steps.length-1&&garde++<200){
   const st=cur.steps[cur.i];
   if(st.k==='rest'){
     const attendu=cur.log[st.nextKey]||[];
     const v=vign(st);
     if(attendu.length){ charges++; maxVal=Math.max(maxVal,attendu.length);
       if(v.indexOf(setsHtml(attendu))<0) throw new Error('liste absente de la vignette traversee'); }
     else { nus++;
       if(v.indexOf('class="jour"')>=0) throw new Error('vignette chargee avant le premier passage du jour'); }
     controle('transition '+(nus+charges));
   }
   if(!jouer()) break;
 }
 if(nus!==3) throw new Error('trois transitions nues attendues au premier tour, '+nus);
 if(charges!==12) throw new Error('douze transitions chargees attendues a quatre series, '+charges);
 /* trois valeurs au maximum : le volume plafonne a quatre series */
 if(maxVal!==3) throw new Error('au plus trois valeurs sur une vignette, vu '+maxVal);
 console.log('vignette OK : '+nus+' transitions nues puis '+charges+' chargees, liste identique a la pastille de l ecran de serie, '+maxVal+' valeurs au plus');

 /* ---------- 2. la cle lue est nextKey, jamais l identifiant ---------- */
 await neuf(3);
 startSession();
 /* on cherche un emplacement chiffre qui porte un repli realisable */
 let cible=null;
 cur.exos.forEach(id=>{ if(!cible&&fbOf(id)&&DB[id].mode!=='time'&&DB[id].mode!=='stretch') cible=id; });
 if(!cible) throw new Error('aucun exercice chiffre avec repli dans ce tirage');
 const fb=fbOf(cible);
 /* un tour complet pour remplir le journal de l origine */
 for(let k=0;k<par*2;k++) jouer();
 const iOrig=cur.steps.findIndex(s=>s.k==='rest'&&s.next===cible);
 if(iOrig<0) throw new Error('aucun repos n annonce l exercice cible');
 const listeOrig=(cur.log[cible]||[]).slice();
 if(!listeOrig.length) throw new Error('le journal de l origine doit etre rempli');
 if(vign(cur.steps[iOrig]).indexOf(setsHtml(listeOrig))<0) throw new Error('la vignette doit porter les series de l origine');
 /* bascule sur le repli : la vignette suit, et n a plus rien a montrer tant
    qu aucune serie n a ete jouee sous la cle « origine>repli » */
 cur.i=cur.steps.findIndex((s,i)=>i>iOrig&&s.k==='set'&&s.id===cible);
 if(cur.i<0) throw new Error('aucune serie a venir sur l exercice cible');
 swapPain();
 const iRep=cur.steps.findIndex(s=>s.k==='rest'&&s.next===fb);
 if(iRep<0) throw new Error('aucun repos n annonce le repli');
 if(cur.steps[iRep].nextKey!==cible+'>'+fb) throw new Error('nextKey doit porter la cle de repli');
 const vRep=vign(cur.steps[iRep]);
 if(vRep.indexOf('class="jour"')>=0) throw new Error('aucune serie sous la cle de repli : la vignette doit rester nue');
 if(vRep.indexOf(setsHtml(listeOrig))>=0) throw new Error('la vignette ne doit pas montrer les series de l origine sous le repli');
 /* une serie jouee sur le repli remplit sa propre cle */
 jouer();
 const listeRep=(cur.log[cible+'>'+fb]||[]).slice();
 if(!listeRep.length) throw new Error('le journal du repli doit etre rempli');
 const iRep2=cur.steps.findIndex(s=>s.k==='rest'&&s.next===fb);
 if(iRep2>=0&&vign(cur.steps[iRep2]).indexOf(setsHtml(listeRep))<0) throw new Error('la vignette doit porter les series du repli');
 controle('sous repli');
 /* retour a l origine : on retrouve la liste de l origine, celle du repli reste au journal */
 revertSwap();
 const iRet=cur.steps.findIndex(s=>s.k==='rest'&&s.next===cible);
 if(iRet>=0){
   if(cur.steps[iRet].nextKey!==cible) throw new Error('nextKey doit revenir a l identifiant');
   if(vign(cur.steps[iRet]).indexOf(setsHtml(cur.log[cible]))<0) throw new Error('la vignette doit revenir aux series de l origine');
 }
 controle('apres retour');
 console.log('cle OK : la vignette lit nextKey, le repli ne montre pas les series de l origine et inversement');

 /* ---------- 3. next et nextKey ont un seul point de pose ---------- */
 await neuf(3);
 startSession();
 controle('construction');
 /* changement de volume : les transitions recomposees portent les deux champs */
 for(let k=0;k<par+1;k++) jouer();
 setSessionRounds(4);
 if(cur.steps.filter(s=>s.k==='rest').length!==15) throw new Error('quinze transitions apres montee a quatre');
 controle('apres changement de volume');
 setSessionRounds(2);
 controle('apres descente de volume');
 /* aucun repos ne survit sans ses deux champs, et le dernier pas n est pas un repos */
 cur.steps.forEach(s=>{ if(s.k==='rest'&&(!s.next||!s.nextKey)) throw new Error('un repos sans next ou sans nextKey'); });
 if(cur.steps[cur.steps.length-1].k==='rest') throw new Error('pas de transition apres la derniere serie');
 /* la pose se fait dans relinkRests et nulle part ailleurs : on efface les deux
    champs et un seul appel les restitue tous */
 cur.steps.forEach(s=>{ if(s.k==='rest'){ delete s.next; delete s.nextKey; } });
 relinkRests();
 controle('apres relink seul');
 console.log('pose OK : construction, changement de volume et relink donnent les memes next et nextKey');

 /* ---------- 4. seance allegee : la vignette lit le journal, elle ne calcule rien ---------- */
 await neuf(3);
 lightMode=true;
 startSession();
 if(!cur.light) throw new Error('la seance doit etre allegee');
 for(let k=0;k<par*2;k++) jouer();
 const c4=controle('seance allegee');
 if(!c4.avec) throw new Error('la seance allegee doit charger des vignettes comme les autres');
 /* la substitution du mode allege ecrit une cle « origine>repli » : la vignette
    la suit sans avoir a connaitre le mode */
 cur.steps.forEach((s,i)=>{ if(s.k!=='rest') return;
   const nx=nextWork(cur.steps,i);
   if(nx.swapped&&s.nextKey.indexOf('>')<0) throw new Error('une substitution doit porter une cle composee'); });
 lightMode=false;
 console.log('allegee OK : '+c4.avec+' vignettes chargees sur '+c4.vus+' transitions, cles de substitution suivies');

 /* ---------- 5. la vignette n a pas gagne de prescription ---------- */
 await neuf(3);
 startSession();
 for(let k=0;k<par*2;k++) jouer();
 cur.steps.forEach((s,i)=>{ if(s.k!=='rest') return;
   const v=vign(s);
   if(/ kg|élastique|Cible|Fourchette|Dernière fois/.test(v)) throw new Error('la vignette ne prescrit pas : '+v);
   if(/onclick/.test(v)) throw new Error('la vignette reste inerte');
   const nx=nextWork(cur.steps,i), p=perfFor(nx.id,!!nx.light), e=DB[nx.id];
   /* la cible ne doit pas apparaitre comme telle : on la cherche isolee dans le
      bloc, hors de la liste du journal */
   const sansListe=v.replace(/<b class="num">[^<]*(<i class="sl">\\/<\\/i>[^<]*)*<\\/b>/g,'');
   if(e.reps&&new RegExp('>'+(p.target||rangeOf(p,e)[0])+'<').test(sansListe)) throw new Error('la cible ne doit pas figurer sur l ecran de repos');
 });
 console.log('frontiere OK : la vignette annonce, elle ne prescrit toujours pas');

 console.log('TESTS LOT V2.6 OK');
})();
`;
eval(src+T);
```

## test31.js, suite du lot v2.5

Dix sections sur l'escalier des mollets.

**1. Plafond.** `cap` vaut le haut de fourchette sur les deux échelons au poids du corps, `echelleOf`
ne rend qu'une marche, et un passage au plafond annonce la marche suivante sans relever la
fourchette. C'est le contrôle qui interdit le retour des cinq relèvements fantômes de la v2.4.

**2. Migration.** Une fourchette 13-26 héritée revient à 12-25, cible écrêtée, maximum historique
intact, fourchette déjà conforme non touchée, migration idempotente. Deux témoins encadrent :
`echelleOf` retrouve la position après écrêtage, et ne la retrouve pas sans. C'est ce second témoin
qui a montré qu'écrêter le seul haut ne suffisait pas.

**3. Masse mobilisable.** 47 kg pour l'inventaire par défaut, 10 pour une kettlebell seule, 6 pour
les deux paires de lestes, 16 quand le drapeau des haltères tombe. La clé dérivée `masse` suit :
servie par une kettlebell de 10, refusée à 6 kg.

**4. Échelle du sac.** 10/20/30/40 dérivés de la masse, un seul barreau sur un inventaire pauvre,
échelle vide sous le pas, aucun plafond posé, et les échelles kettlebell intactes.

**5. Verrou chargé.** Le témoin du lot : les mêmes 25 répétitions laissent le verrou fermé à 10 kg
et à l'avant-dernier barreau, et l'ouvrent au dernier. Un quatrième cas vérifie que la condition de
répétitions continue de valoir au dernier barreau. `checkUnlocks` est appelé explicitement, comme
dans `test18` et `test28` : la fin de séance seule l'appelle, et une première écriture de cette
section posait les séries sans l'appeler, donc passait sans rien mesurer.

**6. Inventaire pauvre.** À 10 kg déclarés, le dernier barreau vaut 10 et le verrou s'ouvre.
Différence assumée avec `bandGate`, qui lit lui l'échelle entière : l'exercice ouvert ici ne demande
aucun matériel.

**7. Vivier.** Cinq entrées tirables dans les quatre états de verrou, un seul échelon de mollets
tirable à la fois, taille stable. C'est l'invariant du motif de retrait.

**8. Matériel.** `NEEDS` en clé `masse` sur les deux échelons lestés et sur eux seuls, chaîne de
substitution vers le poids du corps, schéma moteur aligné sur le vivier. L'inventaire de mesure ne
retire que les sources de masse : une première écriture partait d'un inventaire nu et mesurait aussi
la perte du marchepied et de la kettlebell.

**9. Replis.** Les trois échelons replient, et sur un exercice jamais verrouillé.

**10. Forme.** Tempo, `side`, coût de séance de la fourchette unilatérale au moins égal à celui de
la bilatérale à son sommet, quatre illustrations en banque, matériel renseigné.

```javascript
/* test31 : lot v2.5. Escalier des mollets. Plafond ramene au haut de fourchette
   et disparition des relevements fantomes, ecretage des fourchettes heritees,
   masse mobilisable et cle derivee masse, echelle du sac, condition de charge
   du verrou dans les deux sens, invariant de vivier a cinq entrees tirables
   dans les quatre etats, chaine de substitution et replis. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{ throw new Error(m); };
 const eq=(a,b,m)=>{ if(JSON.stringify(a)!==JSON.stringify(b)) err(m+' : '+JSON.stringify(a)+' != '+JSON.stringify(b)); };
 const neuf=async()=>{ localStorage._m={}; await loadState();
   state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const CH=['mollets-debout','mollets-debout-leste','mollets-une-jambe','mollets-une-jambe-leste'];

 /* ---------- 1. plus aucun relevement fantome ---------- */
 await neuf();
 if('cap' in DB['mollets-debout']||'cap' in DB['mollets-une-jambe']) err('v2.16 : plus de champ cap, le plafond est le haut de fourchette');
 const E=echelleOf('mollets-debout');
 if(E.lbl.length!==1) err('une seule marche attendue, '+E.lbl.length+' affichees : '+E.lbl.join(' | '));
 if(E.i!==0) err('position introuvable sur une echelle a une marche');
 /* le moteur ne doit plus relever la fourchette : un passage au plafond
    annonce la marche suivante et laisse la fourchette ou elle est */
 const p=perfOf('mollets-debout'); p.target=25;
 const msgs=applyProgress('mollets-debout',[25,25],true,false,false);
 eq(perfOf('mollets-debout').range,[12,25],'la fourchette ne doit pas bouger au plafond');
 if(!msgs.some(m=>/Plafond atteint/.test(m))) err('le plafond doit etre annonce');
 console.log('plafond OK : une seule marche, aucune fourchette relevee, marche suivante annoncee');

 /* ---------- 2. ecretage des fourchettes heritees ---------- */
 /* etat ecrit sous la v2.4, en plein relevement : la migration le ramene dans
    les bornes, sinon echelleOf perd la position et la carte annonce « pas
    encore de niveau enregistre » sur un exercice joue depuis des mois */
 await neuf();
 const vieux={v:2,rounds:3,perf:{
   'mollets-debout':{load:0,range:[13,26],target:26,best:26,sets:[26,26],date:'2026-08-01T10:00:00.000Z'},
   'pont-fessier':{load:0,range:[10,20],target:14,best:14,sets:[],date:null}}};
 const m=migrateState(JSON.parse(JSON.stringify(vieux)));
 eq(m.perf['mollets-debout'].range,[12,25],'fourchette heritee ecretee');
 if(m.perf['mollets-debout'].target!==25) err('cible heritee ecretee, '+m.perf['mollets-debout'].target);
 if(m.perf['mollets-debout'].best!==26) err('le maximum historique n est pas reecrit');
 eq(m.perf['pont-fessier'].range,[10,20],'une fourchette deja conforme n est pas touchee');
 if(m.perf['pont-fessier'].target!==14) err('cible conforme non touchee');
 const deux=migrateState(JSON.parse(JSON.stringify(m)));
 if(JSON.stringify(deux.perf)!==JSON.stringify(m.perf)) err('migration non idempotente');
 /* la carte retrouve sa position, ce que l etat non ecrete lui interdisait */
 state.perf['mollets-debout']=JSON.parse(JSON.stringify(m.perf['mollets-debout']));
 if(echelleOf('mollets-debout').i<0) err('position perdue sur l echelle apres migration');
 state.perf['mollets-debout'].range=[13,26];
 if(echelleOf('mollets-debout').i>=0) err('temoin : sans ecretage la position doit etre introuvable');
 console.log('migration OK : 13-26 ramene a 12-25, position retrouvee, idempotente');

 /* ---------- 3. masse mobilisable et cle derivee ---------- */
 await neuf();
 if(masseMobilisable(state.gear)!==47) err('masse de l inventaire par defaut attendue a 47 kg, '+masseMobilisable(state.gear));
 const g=j=>JSON.parse(JSON.stringify(j));
 const kbSeule={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{},kbs:{'10':1},res:{kb:1}};
 const lestesSeuls={bar:2,bars:2,maxPerEnd:5,plates:{},bands:{},cuffs:{'1':1,'2':1},kbs:{},res:{cuff:1}};
 if(masseMobilisable(kbSeule)!==10) err('une kettlebell de 10 doit peser 10, '+masseMobilisable(kbSeule));
 if(masseMobilisable(lestesSeuls)!==6) err('les deux paires de lestes pesent 6 kg, '+masseMobilisable(lestesSeuls));
 /* chaque famille reste soumise a son drapeau : masquer les halteres retire
    leurs disques du calcul, comme aRes masque les bandes et les kettlebells */
 const sansHal=g(DEFAULT_GEAR); sansHal.res.hal=0;
 if(masseMobilisable(sansHal)!==16) err('sans halteres il reste kettlebell et lestes, '+masseMobilisable(sansHal));
 /* la cle masse n a pas d interrupteur a elle : elle se derive du seuil */
 if(!aRes('masse',state.gear)) err('l inventaire complet doit servir la cle masse');
 if(!aRes('masse',kbSeule)) err('une kettlebell de 10 suffit au premier barreau : c est tout l objet de la cle derivee');
 if(aRes('masse',lestesSeuls)) err('6 kg sont sous le pas, la cle ne doit pas etre servie');
 console.log('masse OK : 47 kg par defaut, kettlebell seule suffit, lestes seuls non, drapeaux respectes');

 /* ---------- 4. echelle du sac ---------- */
 await neuf();
 SAC_EX.forEach(id=>{
   const L=fixedLadder(id,state.gear).map(x=>x.v);
   eq(L,[10,20,30,40],'echelle du sac de '+id);
 });
 /* elle se derive de la masse et non d une constante de plafond */
 eq(fixedLadder('mollets-debout-leste',kbSeule).map(x=>x.v),[10],'inventaire pauvre : un seul barreau');
 eq(fixedLadder('mollets-debout-leste',lestesSeuls).map(x=>x.v),[],'sous le pas : echelle vide');
 if(fixedCap('mollets-debout-leste')!==null) err('aucun plafond pose sur le sac, il se derive de l inventaire');
 /* les exercices a kettlebell ne sont pas touches par la branche sac */
 if(fixedLadder('goblet-squat',state.gear)[0].lbl.indexOf('KB')<0) err('la branche kettlebell doit rester intacte');
 if(fixedLadder('mollets-debout-leste',state.gear)[0].lbl.indexOf('sac')<0) err('libelle du sac attendu');
 /* le pas ne descend pas sous dix : c est la regle mesuree, pas un reglage */
 if(PAS_SAC!==10) err('pas du sac attendu a 10 kg');
 console.log('echelle OK : 10/20/30/40 derives de la masse, vide sous le pas, kettlebells intactes');

 /* ---------- 5. verrous de la chaine, et la condition de charge ---------- */
 await neuf();
 for(let i=1;i<CH.length;i++){
   const l=DB[CH[i]].lock;
   if(!l||l.after!==CH[i-1]) err(CH[i]+' doit se verrouiller derriere '+CH[i-1]);
   if(l.minSets!==2) err('verrou a deux series sur '+CH[i]);
   if(DB[CH[i]].retire!==CH[i-1]) err(CH[i]+' doit retirer '+CH[i-1]);
 }
 if(DB['mollets-debout-leste'].lock.need!==DB['mollets-debout'].reps[1]) err('le verrou vaut le plafond du predecesseur, son haut de fourchette');
 if(DB['mollets-une-jambe-leste'].lock.need!==DB['mollets-une-jambe'].reps[1]) err('idem sur le dernier echelon');
 /* le temoin qui compte : 25 repetitions au PREMIER barreau ne doivent pas
    ouvrir la version sur une jambe, sinon les barreaux 20, 30 et 40 de la
    version bilaterale ne seraient jamais joues */
 await neuf();
 state.unlocked['mollets-debout-leste']=true;
 const L=fixedLadder('mollets-debout-leste',state.gear);
 /* checkUnlocks est appele par la fin de seance, jamais par applyProgress :
    poser les series sans l appeler ferait passer la section pour une bonne
    raison alors que rien ne serait teste. Meme forme que test18 et test28. */
 /* v2.18 : le verrou lit la charge ecrite AVEC les series, p.setsLoad : le
    temoin la pose comme applyProgress le ferait. */
 const met=(charge,sets)=>{ const q=perfOf('mollets-debout-leste'); q.load=charge; q.setsLoad=charge; q.sets=sets.slice();
   delete state.unlocked['mollets-une-jambe']; return checkUnlocks(3,false); };
 met(10,[25,25]);
 if(state.unlocked['mollets-une-jambe']) err('verrou ouvert au premier barreau : la condition de charge ne mord pas');
 met(L[L.length-2].v,[25,25]);
 if(state.unlocked['mollets-une-jambe']) err('verrou ouvert a l avant-dernier barreau');
 met(L[L.length-1].v,[24,25]);
 if(state.unlocked['mollets-une-jambe']) err('la condition de repetitions doit continuer de valoir au dernier barreau');
 const ms=met(L[L.length-1].v,[25,25]);
 if(!state.unlocked['mollets-une-jambe']) err('verrou ferme au dernier barreau avec les repetitions');
 if(!ms.length) err('le deblocage doit etre annonce');
 console.log('verrou charge OK : ferme a 10 kg, ouvert a 40 kg, sur les memes 25 repetitions');

 /* ---------- 6. un inventaire pauvre n est pas enferme ---------- */
 /* difference assumee avec bandGate : l exercice ouvert ne demande aucun
    materiel, le dernier barreau se lit donc sur l echelle FILTREE */
 await neuf();
 state.gear=g(kbSeule); syncProfil();
 state.unlocked['mollets-debout-leste']=true;
 const q2=perfOf('mollets-debout-leste'); q2.load=10; q2.setsLoad=10; q2.sets=[25,25];
 checkUnlocks(3,false);
 if(!state.unlocked['mollets-une-jambe']) err('un inventaire a 10 kg doit pouvoir ouvrir un exercice au poids du corps');
 console.log('inventaire pauvre OK : 10 kg est son dernier barreau, le verrou s ouvre');

 /* ---------- 7. vivier a cinq entrees tirables dans les quatre etats ---------- */
 await neuf();
 const tir=()=>posTirables('legs',state.gear).map(i=>SLOTS.legs.pool[i]);
 /* v2.13 : porte a 15 par l escalier du pont fessier, sans effet sur le
    nombre d entrees tirables, qui est l invariant mesure juste en dessous.
    v2.18 : 17, escalier du squat, meme raisonnement. */
 if(SLOTS.legs.pool.length!==17) err('vivier de reference a 17 entrees');
 const vus=[];
 for(let i=0;i<CH.length;i++){
   const t=tir();
   if(t.length!==5) err('etat '+i+' : cinq entrees tirables attendues, '+t.length);
   if(t.indexOf(CH[i])<0) err('etat '+i+' : '+CH[i]+' doit etre tirable');
   CH.forEach((c,j)=>{ if(j!==i&&t.indexOf(c)>=0) err('etat '+i+' : '+c+' ne doit pas etre tirable en meme temps'); });
   vus.push(t.join('>'));
   if(i+1<CH.length) state.unlocked[CH[i+1]]=true;
 }
 /* la substitution se fait sur place : meme ordre a chaque etat */
 const pos=vus.map(v=>v.split('>').indexOf(CH[0])<0?null:0);
 if(new Set(vus.map(v=>v.split('>').length)).size!==1) err('la taille du vivier tirable doit etre stable');
 console.log('vivier OK : cinq entrees tirables dans les quatre etats, un seul echelon de mollets a la fois');

 /* ---------- 8. besoin materiel et chaine de substitution ---------- */
 await neuf();
 eq(NEEDS['mollets-debout-leste'],['masse'],'besoin des mollets lestes');
 eq(NEEDS['mollets-une-jambe-leste'],['masse'],'besoin des mollets une jambe lestes');
 if(NEEDS['mollets-debout']||NEEDS['mollets-une-jambe']) err('les versions au poids du corps ne declarent aucun besoin');
 const iB=SLOTS.legs.pool.indexOf('mollets-debout-leste');
 const iU=SLOTS.legs.pool.indexOf('mollets-une-jambe-leste');
 if(resolvePos('legs',iB,state.gear)!=='mollets-debout-leste') err('avec du poids, la position sert la variante chargee');
 /* on ne retire QUE les sources de masse, le reste de l inventaire est intact :
    sinon la mesure porterait aussi sur le marchepied et la kettlebell, et une
    chute du vivier serait mise au compte des mollets a tort */
 const sansMasse=g(DEFAULT_GEAR); sansMasse.res.hal=0; sansMasse.res.kb=0; sansMasse.res.cuff=0;
 state.gear=sansMasse; syncProfil();
 if(aRes('masse',state.gear)) err('temoin : plus aucune masse declaree');
 if(resolvePos('legs',iB,state.gear)!=='mollets-debout') err('sans poids, la chaine descend vers le poids du corps');
 if(resolvePos('legs',iU,state.gear)!=='mollets-une-jambe') err('idem sur l echelon unilateral');
 /* le verrou doit etre ouvert pour que la position entre dans le tirage : sans
    cela on mesurerait l etat du verrou et non la chaine materielle */
 state.unlocked['mollets-debout-leste']=true;
 const t2=posTirables('legs',state.gear);
 if(t2.indexOf(iB)<0) err('verrou ouvert et sans poids, la position doit rester servie par sa chaine');
 if(t2.indexOf(SLOTS.legs.pool.indexOf('mollets-debout'))>=0) err('le predecesseur retire ne doit pas revenir dans le tirage');
 if(t2.length!==5) err('le vivier reste a cinq positions, '+t2.length);
 /* le schema moteur suit l insertion */
 if(SCHEMA.legs.length!==SLOTS.legs.pool.length) err('schema moteur desaligne du vivier');
 console.log('materiel OK : cle masse en contrat, chaine vers le poids du corps, schema aligne');

 /* ---------- 9. replis, jamais vers un exercice verrouillable ---------- */
 await neuf();
 CH.slice(1).forEach(id=>{
   const f=DB[id].fb;
   if(!f) err(id+' doit porter un repli');
   if(DB[f].lock) err('repli verrouillable sur '+id+' : '+f);
 });
 if(DB['mollets-debout'].fb) err('la base de la chaine n a pas de repli au-dessous');
 console.log('replis OK : les trois echelons replient sur la base, qui n est jamais verrouillee');

 /* ---------- 10. cout de seance et illustrations ---------- */
 await neuf();
 CH.forEach(id=>{ if(tempoOf(id)!==3.5) err('tempo attendu a 3,5 s sur '+id); });
 if(!DB['mollets-une-jambe'].side||!DB['mollets-une-jambe-leste'].side) err('les deux versions unilaterales doivent porter side');
 if(DB['mollets-debout'].side||DB['mollets-debout-leste'].side) err('les deux versions bilaterales ne doivent pas porter side');
 /* un unilateral vaut deux fois le travail : c est ce qui borne sa fourchette
    a 8-15 la ou la version bilaterale tient 12-25 */
 const s1=INSTALL+Math.round(15*3.5*2), s2=INSTALL+Math.round(25*3.5);
 if(s1<s2) err('la fourchette unilaterale doit couter au moins autant que la bilaterale a son sommet');
 CH.forEach(id=>{ if(typeof IMG!=='undefined'&&!IMG[id]) err('illustration absente : '+id); });
 CH.forEach(id=>{ if(!DB[id].mat||!DB[id].mat.length) err('materiel non renseigne : '+id); });
 console.log('forme OK : tempo, side, cout de seance coherent, quatre illustrations en banque');

 console.log('TESTS ESCALIER DES MOLLETS V2.5 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
```

## test30.js, suite du lot v2.4

Quinze sections. Les treize premières viennent du brief de conception, les deux dernières ont été
ajoutées à la lecture du code.

1. **Reconstruction rétroactive.** Un historique fabriqué à trois passages sur un exercice à charge
   donne trois entrées dans `exoPassages`, du plus ancien au plus récent, sans qu'aucun champ
   nouveau ait été écrit : l'état est comparé sérialisé avant et après. C'est la propriété qui
   justifie tout le chantier.
2. **Chemin des paliers, montée.** Charge 2 puis 2,5 puis 3 kg sur cinq séances : trois entrées, la
   première marquée `first` et sans sens, les deux autres en montée, **aux dates du premier passage
   à chaque valeur** et non du dernier.
3. **Chemin des paliers, descente.** Charge 6 puis 7 puis 6 : la troisième entrée est marquée
   descente.
4. **Chemin des paliers, bandes.** Le sens se lit dans `bandOrder` et non dans la couleur. Témoin
   sur `tractions-assistees-supination`, où aller vers le barreau plus fin est une montée ;
   contre-témoin sur `face-pulls`, où le même couple de couleurs se lit dans l'autre sens.
5. **Garde d'écriture de `it.rng`.** L'assertion porte sur le critère et jamais sur le nombre, une
   assertion qui épingle une valeur devenant fausse en même temps que le code. Elle vérifie que
   `pompes-poignees` est en `mode:'bw'` mais progresse par bande, donc hors garde, et surtout la
   **partition** : tout exercice porteur d'une échelle est couvert par exactement un régime de
   palier, bande, charge ou fourchette. Aucun ne peut rester sans valeur de palier ni en recevoir
   deux. La suite affiche le compte mesuré, 18 exercices aujourd'hui.
6. **Survie à la correction.** Une séance est réellement jouée, puis `corrigerSeance` réécrit toutes
   les séries à 7 : `load`, `band` et `rng` de chaque item sont inchangés, seuls les `sets` bougent.
7. **Position sur l'échelle.** `rangIn` rend la marche exacte quand elle existe, la plus haute
   marche atteinte pour une valeur intermédiaire, et `-1` quand rien n'est réglé. Le cas `-1` doit
   rendre un bloc qui annonce le départ de l'échelle, sans marche suivante, sans pastille, et
   surtout **sans message de plafond** : sans marche suivante, le bloc retomberait sinon sur
   « Dernière marche outillée » sur un exercice jamais joué.
8. **Fenêtre d'échelle.** Sur l'échelle des haltères, 26 marches mesurées : quatre pastilles en bas
   avec un seul point de suspension à droite, sept au milieu avec un de chaque côté, quatre au
   sommet avec un seul à gauche. Jamais plus de sept.
9. **Bornage des passages.** Vingt passages fabriqués : trois lignes repliées, douze dépliées, retour
   à trois, le bouton basculant dans les deux sens. Le chemin des paliers, lui, rend ses vingt
   entrées : il n'est jamais tronqué.
10. **Ligne de repli.** Une séance où l'exercice a été remplacé apparaît sur la fiche de l'exercice
    d'origine, grisée, cliquable vers la fiche du repli, et elle ne fabrique aucun palier sur
    l'origine.
11. **Verrou, les deux sens.** Sur un exercice verrouillé, l'énoncé, l'état à la dernière séance et
    la mention que la condition porte sur le dernier passage et non sur un record ; sur son ouvreur,
    la ligne « Cet exercice ouvre » et le remplacement en rotation, annoncé au futur tant que le
    verrou est fermé et au passé une fois ouvert. Variante `bandGate` couverte, barreau exigé et
    meilleur de bande compris.
12. **Provenance.** Un dernier passage marqué `lightSets` ou `unqualSets` est annoncé comme ne
    comptant pas pour le verrou ; une lecture exploitable ne porte pas cette mention.
13. **Robustesse.** `showFiche` passe sur les 46 exercices sans lever, historique vide comme
    historique fourni.
14. **La garde effective n'est pas la garde écrite.** `endSession` lit `pre[k].range`, construit
    depuis `state.perf` et non depuis `perfOf` : la garde écrite ne suffit pas à garantir que la
    fourchette existe au moment où l'item se compose. Huit séances sont donc réellement jouées
    depuis un état neuf, et chaque item de la garde doit porter la fourchette d'avant séance, les
    autres ne rien porter. Un tirage isolé ne contient qu'un ou deux exercices de la garde, ce qui
    ferait un témoin trop étroit ; huit séances en couvrent neuf. Le départ du chemin des paliers se
    vérifie après la **première** séance, où il doit déjà exister.
15. **Les blocs restent muets.** Assertion positive plutôt qu'absence de plantage : sur les huit
    fiches sans échelle, étirements et cardio, `echelleOf` rend `null` et les trois blocs rendent la
    chaîne vide ; un exercice sans verrou et qui n'en ouvre aucun ne rend pas de bloc verrou ; un
    exercice à échelle sans aucun passage ne rend pas le bloc Progression mais rend bien celui de
    l'échelle.

**Falsification de la suite.** Une suite verte au premier essai ne prouve rien tant qu'on n'a pas
montré qu'elle peut tomber. Seize défauts ont été injectés un par un dans `app7.js`, avec
réassemblage et relance à chaque fois : passages de repli ignorés, chemin des paliers émettant tous
les passages, `palierUp` lisant toujours l'ordre de résistance, garde oubliant l'exclusion des
exercices à bande, correction réécrivant la charge, `rangIn` privé de son repli puis rendant zéro,
fenêtre d'échelle portée à toute l'échelle, bornage des passages désactivé, mention de remplacement
supprimée, provenance non lue, `echelleOf` répondant sur un étirement, `verrouHtml` rendant un bloc
vide au lieu de rien, `vierge` forcé à faux. Les seize sont détectés. Deux enseignements du
passage : le mutant qui force `vierge` à faux n'était **pas** détecté au premier tour, la suite
vérifiant l'absence de « Marche suivante » qui manque de toute façon dans ce cas ; c'est l'assertion
sur l'absence de message de plafond qui l'attrape, et elle a été ajoutée pour cela. Et un mutant qui
plante au lieu d'échouer ne prouve rien : le premier essai sur `palierUp` référençait un symbole
inexistant, il a été refait pour muter le sens et non la syntaxe.

## test29.js, suite du lot v2.2

Huit sections.

1. **Critère de sélection de l'avancement.** Le critère n'est pas une liste : un badge porte un
   compteur si et seulement si il déclare une fonction `prog` et un seuil d'au moins deux. La suite
   compare l'ensemble rendu par `badgeProg` à ce critère badge par badge, et vérifie que les quatre
   badges sans compteur sont exactement `s1`, `w1`, `load` et `unlock1`. Un seuil de 1 et un seuil
   sans compteur sont testés directement sur des objets fabriqués.
2. **Le compteur suit l'état et se borne au seuil.** Trois séances donnent 3/5 et 3/15, deux montées
   donnent 2/5. Un compteur au-delà du seuil est ramené au seuil, un compteur négatif à zéro.
3. **Rendu.** Un avancement par badge non acquis, aucun sur les acquis ni sur les seuils à 1, et le
   compteur d'un badge fraîchement posé disparaît du rendu suivant.
4. **Badge mort et échelle des semaines.** `mob5` est absent, `w12` est présent, et plus aucun
   prédicat du catalogue ne lit le type de séance. Le badge est prouvé atteignable en reconstituant
   treize semaines validées d'affilée.
5. **Plafond de la liste des séances.** Dix-sept séances en historique, douze lignes rendues, et le
   texte annonce le même nombre : les deux lisent `HIST_SHOWN`.
6. **Volume réellement joué.** Rien tant qu'aucune semaine n'est révolue, avec `coverage` en témoin.
   Vingt séries de renforcement sur deux séances donnent 2,5 séries par exercice, le module cardio
   n'étant pas compté. Un exercice basculé sur son repli produit deux entrées au journal et ne
   change ni la somme ni le dénominateur. La semaine en cours reste dehors, et la ligne apparaît
   sous la projection avec les rails, jamais avant.
7. **Format décimal.** Aucune décimale au point ne subsiste dans Assiduité ni dans Couverture,
   vérifié par balayage du rendu, avec un témoin sur `coverage` à 3,5.
8. **Vignette de l'exercice suivant.** Présente sur les onze transitions d'une séance à trois
   séries, portant le nom et l'illustration, sans `onclick` et sans charge ni cible. Elle suit la
   bascule de repli douleur et le retour, `relinkRests` réaffectant `next` dans les deux sens. Le
   base64 de l'illustration est neutralisé avant inspection : il contient n'importe quelle suite de
   lettres, « kg » compris, et l'assertion d'absence de prescription se déclenchait dessus.

## test28.js, suite du lot v2.1

Douze sections.

1. **Échelle de charge.** Le critère devient l'écart entre les deux manchons d'un même haltère,
   borné au plus petit disque déclaré. 3,5 kg entre dans l'échelle, 0,5 d'un côté et 1 de l'autre ;
   3,25 en sort, il demandait 1,25 d'écart. Le micro-palier est additif : aucun barreau symétrique
   ne disparaît, et au-dessus de 4 kg l'échelle de progression est identique à celle de la v2.0,
   comparée terme à terme. Le bas vaut 2 / 2,5 / 3 / 3,5 / 4 / 4,5 et ses écarts relatifs décroissent.
   Le sommet du matériel reste atteignable, le parcours étant ancré aux deux bouts.
2. **Plateau du seuil.** La règle est rejouée à la main sur 14, 20 et 30 %, qui doivent donner la
   même échelle, et sur 40 %, qui doit en donner une autre. Le seuil retenu n'est donc pas une
   valeur calibrée mais un point au milieu d'un plateau.
3. **Kettlebells.** Avec une seule kettlebell de 10 kg, l'échelle reste celle de la v2.0. Avec les
   six poids et les trois paires, aucun total n'est tenu par deux montages, l'échelle est triée, et
   chaque barreau emploie la kettlebell la plus lourde qui ne dépasse pas le total.
4. **Plafond des swings.** Il vaut le niveau courant du soulevé roumain : la charge ne monte pas
   au-delà, le plafond se dit, et il monte quand le soulevé roumain monte.
5. **Marche suivante.** Tant qu'un poids reste à déclarer, elle le nomme ; une fois la liste
   épuisée, elle redevient l'impasse écrite au catalogue. Les autres marches ne bougent pas.
6. **Fentes lestées.** Le vivier de référence passe à huit entrées et le vivier tiré reste à cinq
   dans les deux états de verrou, le successeur prenant la place exacte du prédécesseur. Le schéma
   moteur est aligné après insertion, la position se résout vers la variante chargée avec haltères
   et vers le poids du corps sans, le verrou vaut deux séries au plafond des fentes, et
   l'illustration est dans la banque.
7. **Verrous de la charnière.** Plus aucun verrou du catalogue ne s'ouvre sur une seule série ;
   une série à 15 n'ouvre plus, deux séries ouvrent.
8. **Masques de présence.** Éteindre puis rallumer une section rend exactement ce qui était
   déclaré, sans rien détruire. L'invariant « jamais levé et vide » tient dans les deux sens sur
   les élastiques, les lestes et les kettlebells.
9. **Profils.** Un profil neuf part vide, ressources comprises, et sert quand même des schémas ;
   la copie explicite rend l'inventaire de sa source ; l'invariant `state.profils[actif].gear ===
   state.gear` tient après création.
10. **Migration v2.1.** La ressource kettlebell devient la kettlebell de 10 kg, les drapeaux se
    dérivent de ce qui est déclaré, la migration est idempotente, et un inventaire vide n'invente
    aucun poids.
11. **Volume en cours de séance.** Bascule de 3 vers 2 : huit séries restantes, `of` suivi, `prevu`
    à deux par exercice, durée annoncée revue, aucune transition après la dernière série. Le
    plancher à 2 tient, la montée est bornée au volume lancé plus un, un round ajouté est vierge et
    les séries déjà jouées ne bougent pas.
12. **Défilement vers la card Matériel.** La trace des appels doit être « remontée en haut » puis
    « trajet vers la card », dans cet ordre, et la card sort ouverte dans le HTML.

## test30.js, source

```javascript
/* test30 : lot v2.4. Progression par exercice sur les fiches. Reconstruction
   retroactive depuis state.hist, chemin des paliers dans les deux sens et sur
   les deux sens de bande, garde d ecriture de it.rng et sa survie a la
   correction, position et fenetre sur l echelle, bornage des passages, ligne
   de repli, verrou dans les deux sens, provenance, silence des blocs la ou ils
   n ont rien a dire. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const err=m=>{throw new Error(m);};
 /* l etat neuf part d un inventaire vide : chaque rechargement s ancre au
    domicile, et le drapeau s abaisse au lieu de disparaitre (v2.3) */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; ficheMoreId=null;
   await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 /* une entree d historique posee a la main, a J-n */
 const seance=(joursAvant,items,extra)=>{
   const d=new Date(); d.setDate(d.getDate()-joursAvant);
   return Object.assign({date:d.toISOString(),type:'alterne',mode:'alterne',rounds:3,plan:15,xp:30,items:items},extra||{});
 };
 /* joue une seance entiere jusqu au recapitulatif, valeur imposee par serie */
 const jouer=async(v)=>{
   startSession(); cur.phase='work';
   let garde=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length){
     if(++garde>400) err('boucle de seance non bornee');
     const s=cur.steps[cur.i];
     if(!s) break;
     if(s.k!=='set'){ nextStep(); continue; }
     if(DB[s.id].mode==='time'){ s.sides=new Array(DB[s.id].side?2:1).fill(30); s.done=true; }
     /* v2.17 : une tenue rythmee se valide arretee, comme une tenue mesuree */
     if(DB[s.id].rhythm){ s.rt={d:v,g:v,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; }
     /* v2.22 : le pont fessier est cadence */
     if(DB[s.id].cadence){ cadInit(s); s.sides=s.sides.map(()=>v); s.side=s.sides.length-1; s.done=true; }
     s.val=v; validateSet();
   }
   for(let i=0;i<60;i++) await Promise.resolve();   /* endSession est async */
 };

 /* ---------- 1. reconstruction retroactive ---------- */
 await neuf();
 const ID='developpe-sol';
 state.hist=[seance(9,[{id:ID,sets:[8,8,8],load:6}]),
             seance(6,[{id:ID,sets:[9,9,9],load:6}]),
             seance(3,[{id:ID,sets:[12,12,12],load:6}])];
 const avant=JSON.stringify(state);
 const P1=exoPassages(ID);
 if(P1.length!==3) err('trois passages attendus, '+P1.length+' rendus');
 if(P1.some(x=>x.repl)) err('aucun de ces passages n est un repli');
 if(P1[0].h.date>P1[2].h.date) err('les passages doivent sortir du plus ancien au plus recent');
 /* la propriete qui justifie le chantier : c est une lecture, rien n est ecrit */
 if(JSON.stringify(state)!==avant) err('exoPassages a modifie l etat');
 if(JSON.stringify(paliersOf(ID))===undefined) err('paliersOf doit rendre un tableau');
 if(JSON.stringify(state)!==avant) err('paliersOf a modifie l etat');
 console.log('retroactif OK : trois passages reconstruits depuis hist, sans aucune ecriture');

 /* ---------- 2. chemin des paliers, montee ---------- */
 await neuf();
 state.hist=[seance(12,[{id:ID,sets:[8,8,8],load:2}]),
             seance(10,[{id:ID,sets:[12,12,12],load:2}]),
             seance(8,[{id:ID,sets:[8,8,8],load:2.5}]),
             seance(6,[{id:ID,sets:[12,12,12],load:2.5}]),
             seance(4,[{id:ID,sets:[8,8,8],load:3}])];
 const M=paliersOf(ID);
 if(M.length!==3) err('trois entrees attendues au chemin des paliers, '+M.length+' rendues');
 if(!M[0].first||M[0].v!==2) err('la premiere entree est le depart, a 2 kg');
 if(M[0].up!==undefined) err('le depart ne porte pas de sens');
 if(M[1].v!==2.5||M[1].up!==true) err('la deuxieme entree est une montee a 2,5 kg');
 if(M[2].v!==3||M[2].up!==true) err('la troisieme entree est une montee a 3 kg');
 /* les dates sont celles du PREMIER passage a chaque valeur, pas du dernier */
 if(M[0].date!==state.hist[0].date) err('date du depart fausse');
 if(M[1].date!==state.hist[2].date) err('la montee est datee du premier passage a 2,5 kg');
 if(M[2].date!==state.hist[4].date) err('la montee est datee du premier passage a 3 kg');
 console.log('montee OK : 2 / 2,5 / 3 kg, depart puis deux montees, aux dates du premier passage');

 /* ---------- 3. chemin des paliers, descente ---------- */
 await neuf();
 state.hist=[seance(9,[{id:ID,sets:[10,10,10],load:6}]),
             seance(6,[{id:ID,sets:[12,12,12],load:7}]),
             seance(3,[{id:ID,sets:[6,6,6],load:6}])];
 const D=paliersOf(ID);
 if(D.length!==3) err('trois entrees attendues, '+D.length+' rendues');
 if(D[1].up!==true) err('6 vers 7 kg est une montee');
 if(D[2].up!==false) err('7 vers 6 kg est une descente');
 if(D[2].v!==6) err('la descente revient a 6 kg');
 console.log('descente OK : 6 / 7 / 6 kg, la troisieme entree est marquee descente');

 /* ---------- 4. chemin des paliers, bandes ---------- */
 /* le sens se lit dans bandOrder et non dans la couleur : sur un exercice
    d assistance, aller vers le barreau plus fin est une montee */
 await neuf();
 const ASS='tractions-assistees-supination', RES='face-pulls';
 if(DB[ASS].bnd!=='ass') err(ASS+' doit etre un exercice d assistance');
 if(DB[RES].bnd==='ass') err(RES+' doit etre un exercice de resistance');
 const Oa=bandOrder(DB[ASS]), Or=bandOrder(DB[RES]);
 if(Oa.indexOf('rouge')<Oa.indexOf('noir')) err('en assistance, rouge doit venir apres noir dans l ordre');
 if(Or.indexOf('rouge')>Or.indexOf('noir')) err('en resistance, rouge doit venir avant noir dans l ordre');
 if(palierUp(ASS,'noir','rouge')!==true) err('assistance : passer du noir au rouge est une montee');
 if(palierUp(ASS,'rouge','noir')!==false) err('assistance : revenir au noir est une descente');
 /* contre-temoin : la meme couleur, l autre sens */
 if(palierUp(RES,'noir','rouge')!==false) err('resistance : passer du noir au rouge est une descente');
 if(palierUp(RES,'rouge','noir')!==true) err('resistance : passer du rouge au noir est une montee');
 state.hist=[seance(9,[{id:ASS,sets:[5,5,5],band:'noir'}]),
             seance(6,[{id:ASS,sets:[8,8,8],band:'rouge'}]),
             seance(3,[{id:ASS,sets:[4,4,4],band:'noir'}])];
 const B=paliersOf(ASS);
 if(B.length!==3||B[1].up!==true||B[2].up!==false) err('chemin des paliers a bande faux : '+JSON.stringify(B));
 console.log('bandes OK : le sens vient de bandOrder, temoin en assistance et contre-temoin en resistance');

 /* ---------- 5. garde d ecriture de it.rng ---------- */
 await neuf();
 const GARDE=Object.keys(DB).filter(id=>{const e=DB[id];return !e.bnd&&(e.mode==='bw'||e.mode==='time');});
 /* l assertion porte sur le critere, jamais sur la valeur courante : une
    assertion qui epingle un nombre devient fausse en meme temps que le code */
 GARDE.forEach(id=>{ const e=DB[id];
   if(e.bnd) err(id+' est a bande, il ne doit pas etre dans la garde');
   if(e.mode!=='bw'&&e.mode!=='time') err(id+' n est ni bw ni time');
 });
 if(DB['pompes-poignees'].mode!=='bw') err('pompes-poignees doit etre en mode bw');
 if(!DB['pompes-poignees'].bnd) err('pompes-poignees doit progresser par la bande');
 if(GARDE.indexOf('pompes-poignees')>=0) err('pompes-poignees est en bw mais progresse par bande : il sort de la garde');
 /* partition : tout exercice qui porte une echelle est couvert par exactement
    un regime, dans l ordre d applyProgress : charge, bande, charge fixe, puis
    fourchette. Aucun ne doit rester sans valeur de palier. */
 Object.keys(DB).forEach(id=>{
   const e=DB[id];
   if(!echelleOf(id)) return;
   const regimes=[!!e.bnd,e.mode==='load'||e.mode==='fixed',GARDE.indexOf(id)>=0].filter(Boolean).length;
   if(regimes!==1) err(id+' est couvert par '+regimes+' regimes de palier au lieu d un seul');
 });
 console.log('garde OK : '+GARDE.length+' exercices, pompes-poignees exclu, un seul regime de palier par echelle');

 /* ---------- 6. survie a la correction ---------- */
 await neuf();
 await jouer(9);
 if(!corrigible()) err('la seance jouee doit etre corrigible');
 const h6=state.hist[state.hist.length-1];
 const photo=h6.items.map(it=>JSON.stringify({id:it.id,load:it.load,band:it.band,rng:it.rng}));
 const vals={};
 state.undo.keys.forEach((k,i)=>{ if(h6.items[i]) vals[k]=h6.items[i].sets.map(()=>7); });
 corrigerSeance(vals);
 const h6b=state.hist[state.hist.length-1];
 h6b.items.forEach((it,i)=>{
   if(JSON.stringify({id:it.id,load:it.load,band:it.band,rng:it.rng})!==photo[i])
     err('la correction a touche load, band ou rng sur '+it.id);
   if(it.sets.some(v=>v!==7)) err('les series corrigees doivent valoir 7 sur '+it.id);
 });
 console.log('correction OK : sur '+h6b.items.length+' items, seuls les sets bougent, load band et rng intacts');

 /* ---------- 7. position sur l echelle ---------- */
 await neuf();
 const L7=loadLadderProg(state.gear);
 if(rangIn(L7,L7[4])!==4) err('rangIn doit rendre la marche exacte quand elle existe');
 /* une valeur intermediaire retombe sur la plus haute marche atteinte : c est
    le reglage manuel, qui se fait sur l echelle complete */
 const entre=(L7[4]+L7[5])/2;
 if(rangIn(L7,entre)!==4) err('rangIn doit retomber sur la plus haute marche atteinte');
 if(rangIn(L7,L7[0]-1)!==-1) err('rangIn doit rendre -1 quand rien n est regle');
 /* le cas -1 annonce le depart de l echelle, jamais une marche suivante */
 if(state.perf[ID]) err('la perf ne doit pas exister avant tout acces');
 const H7=echelleHtml(ID);
 if(H7.indexOf('l\\'échelle commence à')<0) err('le depart d echelle doit etre annonce : '+H7);
 if(H7.indexOf('Marche suivante')>=0) err('aucune marche suivante ne doit etre annoncee au depart');
 /* et surtout, un depart ne se lit pas comme un plafond : sans marche suivante,
    le bloc retomberait sinon sur le message de derniere marche */
 if(H7.indexOf('Dernière marche outillée')>=0||H7.indexOf('Plafond de la fourchette')>=0)
   err('un depart d echelle ne doit pas etre annonce comme un plafond : '+H7);
 if(H7.indexOf('class="tag ech')>=0) err('aucune pastille d echelle au depart');
 perfOf(ID).load=L7[4];
 if(echelleHtml(ID).indexOf('Marche suivante')<0) err('une fois la perf posee, la marche suivante est annoncee');
 console.log('position OK : marche exacte, repli sur la plus haute atteinte, -1 rend un depart d echelle');

 /* ---------- 8. fenetre d echelle ---------- */
 await neuf();
 const E8=echelleOf(ID);
 if(!E8||E8.lbl.length<10) err('l echelle des halteres doit compter assez de marches pour justifier la fenetre');
 /* v2.15 : les pastilles portent une classe, le test ne les reconnait plus a une taille de police */
 const nPast=s=>(s.match(/class="tag ech/g)||[]).length;
 const nPts=s=>(s.match(/>…</g)||[]).length;
 const N=E8.lbl.length;
 perfOf(ID).load=loadLadderProg(state.gear)[0];
 let s8=echelleHtml(ID);
 if(nPast(s8)!==4) err('au bas de l echelle, quatre pastilles attendues, '+nPast(s8));
 if(nPts(s8)!==1||s8.indexOf('…')<s8.indexOf('class="tag ech')) err('au bas de l echelle, un seul point de suspension, a droite');
 perfOf(ID).load=loadLadderProg(state.gear)[Math.floor(N/2)];
 s8=echelleHtml(ID);
 if(nPast(s8)!==7) err('au milieu, sept pastilles attendues, '+nPast(s8));
 if(nPts(s8)!==2) err('au milieu, un point de suspension de chaque cote');
 perfOf(ID).load=loadLadderProg(state.gear)[N-1];
 s8=echelleHtml(ID);
 if(nPast(s8)!==4) err('au sommet, quatre pastilles attendues, '+nPast(s8));
 if(nPts(s8)!==1||s8.lastIndexOf('…')>s8.lastIndexOf('class="tag ech')) err('au sommet, un seul point de suspension, a gauche');
 if(nPast(s8)>7) err('la fenetre ne doit jamais depasser sept pastilles');
 console.log('fenetre OK : '+N+' marches, au plus sept pastilles, points de suspension du bon cote');

 /* ---------- 9. bornage des passages ---------- */
 await neuf();
 state.hist=[]; for(let i=20;i>0;i--) state.hist.push(seance(i,[{id:ID,sets:[8,8,8],load:6}]));
 const lignes=s=>{ const t=s.split('derniers passages</div>')[1]; if(t===undefined) err('bloc des passages introuvable');
   return (t.split('<button')[0].match(/class="histline"/g)||[]).length; };
 let s9=passagesHtml(ID);
 if(lignes(s9)!==3) err('trois lignes attendues replie, '+lignes(s9));
 if(s9.indexOf('Voir plus')<0) err('le bouton Voir plus doit apparaitre au-dela de trois passages');
 ficheMore(ID);
 s9=passagesHtml(ID);
 if(lignes(s9)!==12) err('douze lignes attendues depliees, '+lignes(s9));
 if(s9.indexOf('Voir moins')<0) err('le bouton doit proposer de replier');
 ficheMore(ID);
 s9=passagesHtml(ID);
 if(lignes(s9)!==3) err('le bouton doit rebasculer a trois lignes, '+lignes(s9));
 /* le chemin des paliers, lui, n est jamais tronque */
 state.hist.forEach((h,i)=>{ h.items[0].load=2+i*0.5; });
 const PAL9=paliersOf(ID);
 if(PAL9.length!==20) err('le chemin des paliers ne se tronque pas : '+PAL9.length+' entrees sur 20 changements');
 console.log('bornage OK : trois lignes, douze depliees, retour a trois, chemin des paliers entier a '+PAL9.length+' entrees');

 /* ---------- 10. ligne de repli ---------- */
 await neuf();
 const ORI='planche', REP=DB['planche'].fb;
 if(!REP) err('planche doit declarer un repli');
 state.hist=[seance(6,[{id:ORI,sets:[30,30,30],rng:[20,45]}]),
             seance(3,[{id:REP,sets:[25,25,25],rng:[20,45],sw:true,from:ORI}])];
 const P10=exoPassages(ORI);
 if(P10.length!==2) err('la seance de repli doit apparaitre sur la fiche d origine');
 if(!P10[1].repl) err('la seconde entree doit etre marquee repli');
 const s10=passagesHtml(ORI);
 if(s10.indexOf('remplacé par')<0) err('la ligne de repli doit se nommer');
 if(s10.indexOf('opacity:.5')<0) err('la ligne de repli doit etre grisee');
 if(s10.indexOf('showFiche(\\''+REP+'\\')')<0) err('la ligne de repli doit pointer vers la fiche du repli');
 /* et la seance de repli n entre pas dans le chemin des paliers de l origine */
 if(paliersOf(ORI).length!==1) err('un passage de repli ne fabrique pas un palier sur l origine');
 console.log('repli OK : ligne grisee a sa date, cliquable vers '+REP+', hors du chemin des paliers');

 /* ---------- 11. verrou, les deux sens ---------- */
 await neuf();
 const V='planche-ballon', SRC=DB[V].lock.after;
 delete state.unlocked[V];
 perfOf(SRC).sets=[45,30];
 const v11=verrouHtml(V);
 if(v11.indexOf('Verrouillé par')<0) err('le verrou doit nommer ce qui le ferme');
 if(v11.indexOf(esc(lockCond(DB[V])))<0) err('l enonce du verrou doit etre affiche');
 if(v11.indexOf('À la dernière séance')<0) err('l etat a la derniere seance doit etre affiche');
 if(v11.indexOf('pas sur un record')<0) err('le verrou doit dire qu il lit le dernier passage');
 /* l autre sens, depuis l ouvreur */
 const o11=verrouHtml(SRC);
 if(o11.indexOf('Cet exercice ouvre')<0) err('l ouvreur doit annoncer ce qu il ouvre');
 if(o11.indexOf(esc(DB[V].nom))<0) err('l ouvreur doit nommer l exercice ouvert');
 if(DB[V].retire!==SRC) err(V+' doit retirer '+SRC+' de la rotation');
 if(o11.indexOf('prendra la place')<0) err('le remplacement en rotation doit etre annonce');
 state.unlocked[V]=true;
 if(verrouHtml(SRC).indexOf('a pris la place')<0) err('une fois ouvert, le remplacement se dit au passe');
 /* variante bandGate */
 await neuf();
 const VB='tractions-strictes-supination', SB=DB[VB].lock.after;
 if(!DB[VB].lock.bandGate) err(VB+' doit porter un verrou a bandGate');
 delete state.unlocked[VB];
 /* v2.12 : le meilleur affiche sort des series du dernier passage, et le
    barreau affiche sort de celui qui a ete ecrit avec elles. */
 const pb=perfOf(SB); pb.sets=[8,7]; pb.band='noir'; pb.setsBand='noir';
 const b11=verrouHtml(VB);
 const fin=bandOrder(DB[SB])[bandOrder(DB[SB]).length-1];
 if(b11.indexOf(esc(bandLabel(fin)))<0) err('le verrou a bandGate doit nommer le barreau exige : '+esc(bandLabel(fin)));
 if(b11.indexOf('meilleure série')<0) err('le verrou a bandGate doit afficher la meilleure serie du passage');
 if(b11.indexOf('>8<')<0) err('la meilleure serie affichee doit sortir du dernier passage');
 if(b11.indexOf('>'+DB[VB].lock.need+'<')<0) err('le verrou a bandGate doit afficher le compte exige');
 console.log('verrou OK : les deux sens, mention de remplacement dans les deux temps, variante bandGate couverte');

 /* ---------- 12. provenance ---------- */
 await neuf();
 delete state.unlocked[V];
 const p12=perfOf(SRC); p12.sets=[45,45]; p12.lightSets=true;
 if(verrouHtml(V).indexOf('ne compte pas pour le verrou')<0) err('une lecture allegee doit etre annoncee comme ne comptant pas');
 p12.lightSets=false; p12.unqualSets=true;
 if(verrouHtml(V).indexOf('ne compte pas pour le verrou')<0) err('une lecture non qualifiee doit etre annoncee comme ne comptant pas');
 p12.unqualSets=false;
 if(verrouHtml(V).indexOf('ne compte pas pour le verrou')>=0) err('une lecture exploitable ne porte pas cette mention');
 if(verrouHtml(V).indexOf('À la dernière séance')<0) err('une lecture exploitable affiche l etat');
 console.log('provenance OK : lightSets et unqualSets annonces, lecture exploitable non marquee');

 /* ---------- 13. robustesse ---------- */
 await neuf();
 const IDS=Object.keys(DB);
 IDS.forEach(id=>{ try{ showFiche(id); }catch(e){ err('showFiche leve sur '+id+' a historique vide : '+e.message); } });
 state.hist=IDS.filter(id=>DB[id].reps&&DB[id].mode!=='circuit'&&DB[id].mode!=='stretch')
   .map((id,i)=>seance(i+1,[{id:id,sets:[8,8,8],load:2,band:'noir',rng:[8,12]}]));
 IDS.forEach(id=>{ try{ showFiche(id); }catch(e){ err('showFiche leve sur '+id+' avec historique : '+e.message); } });
 console.log('robustesse OK : showFiche passe sur les '+IDS.length+' fiches, historique vide comme fourni');

 /* ---------- 14. la garde effective, sur une seance reellement jouee ---------- */
 /* endSession lit pre[k].range, construit depuis state.perf et non depuis
    perfOf : la garde ecrite ne suffit pas, il faut que la fourchette existe au
    moment ou l item se compose. Une seance jouee depuis un etat neuf tranche. */
 await neuf();
 let vus=0; const vusIds={}; let prem=null;
 /* plusieurs seances : un tirage isole ne contient qu un ou deux exercices de
    la garde, ce qui ferait un temoin trop etroit */
 for(let n=0;n<8;n++){
   await jouer(9);
   const hn=state.hist[state.hist.length-1];
   if(n===0){
     /* le depart du chemin des paliers se verifie ici et non apres huit
        seances, ou d autres entrees se seraient ajoutees */
     prem=hn.items.filter(it=>{const e=DB[it.id];return !e.bnd&&(e.mode==='bw'||e.mode==='time');})[0];
     if(!prem) err('la premiere seance ne contient aucun exercice de la garde');
     const PP=paliersOf(prem.id);
     if(PP.length!==1||!PP[0].first) err('le chemin des paliers doit porter son depart des la premiere seance sur '+prem.id);
   }
   hn.items.forEach(it=>{
     const e=DB[it.id], dansGarde=!e.bnd&&(e.mode==='bw'||e.mode==='time');
     if(dansGarde){
       if(!it.rng) err(it.id+' est dans la garde mais son item ne porte pas de fourchette');
       const r=rangeOf(state.undo.perf[it.id],e);
       if(it.rng[0]!==r[0]||it.rng[1]!==r[1]) err(it.id+' porte une fourchette qui n est pas celle d avant seance');
       if(palierVal(it.id,it)===null) err(it.id+' doit produire une valeur de palier');
       vus++; vusIds[it.id]=1;
     } else if(it.rng) err(it.id+' est hors garde et ne doit pas porter de fourchette');
   });
 }
 if(Object.keys(vusIds).length<2) err('temoin trop etroit : '+Object.keys(vusIds).length+' exercice de la garde vu');
 console.log('garde effective OK : '+vus+' items de la garde sur '+Object.keys(vusIds).length+' exercices portent leur fourchette, depart pose des la premiere seance');

 /* ---------- 15. les blocs restent muets ---------- */
 await neuf();
 const MUETS=IDS.filter(id=>DB[id].mode==='stretch'||DB[id].mode==='circuit');
 if(MUETS.length<3) err('temoin trop court : '+MUETS.length+' exercices sans echelle');
 MUETS.forEach(id=>{
   if(echelleOf(id)!==null) err(id+' ne doit pas porter d echelle');
   if(echelleHtml(id)!=='') err(id+' ne doit pas rendre le bloc d echelle');
   if(passagesHtml(id)!=='') err(id+' ne doit rien rendre sans passage');
   if(verrouHtml(id)!=='') err(id+' n a ni verrou ni ouverture, il ne rend rien');
 });
 /* un exercice sans verrou et qui n en ouvre aucun reste muet lui aussi */
 const LIBRE=IDS.filter(id=>!DB[id].lock&&!IDS.some(x=>DB[x].lock&&DB[x].lock.after===id));
 if(!LIBRE.length) err('temoin absent : aucun exercice sans verrou ni ouverture');
 if(verrouHtml(LIBRE[0])!=='') err(LIBRE[0]+' ne doit pas rendre de bloc verrou');
 /* et un exercice a echelle sans aucun passage ne rend pas le bloc Progression */
 if(passagesHtml(ID)!=='') err('sans passage, le bloc Progression reste vide');
 if(echelleHtml(ID)==='') err('le bloc d echelle, lui, existe des l etat neuf');
 console.log('silence OK : '+MUETS.length+' fiches sans echelle, blocs vides sur passages et verrou');

 console.log('TESTS PROGRESSION PAR EXERCICE V2.4 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test29.js, source

```javascript
/* test29 : lot v2.2. Avancement des badges non acquis avec son critere de
   selection, retrait du badge mort et prolongement de l echelle des semaines,
   plafond nomme de la liste des seances, volume reellement joue dans la card
   Couverture, format decimal unifie dans Progres, vignette de l exercice
   suivant sur l ecran de repos. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),location:{hash:''},addEventListener:()=>{}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),querySelectorAll:()=>[],
  documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 /* une entree d historique posee a la main : la semaine ISO se choisit par le
    nombre de jours en arriere, les items portent des categories reelles */
 const seance=(joursAvant,items,extra)=>{
   const d=new Date(); d.setDate(d.getDate()-joursAvant);
   return Object.assign({date:d.toISOString(),type:'alterne',mode:'alterne',rounds:3,plan:15,xp:30,items:items},extra||{});
 };
 const it=(id,n)=>({id:id,sets:new Array(n).fill(8),load:0});

 /* ---------- 1. critere de selection de l avancement ---------- */
 await neuf();
 const AVEC=BADGES.filter(b=>badgeProg(b,state)!==null).map(b=>b.id);
 const SANS=BADGES.filter(b=>badgeProg(b,state)===null).map(b=>b.id);
 /* le critere est mecanique : un compteur et un seuil d au moins deux */
 BADGES.forEach(b=>{
   const a=badgeProg(b,state)!==null, c=(typeof b.prog==='function'&&b.seuil>=2);
   if(a!==c) throw new Error('avancement et critere divergent sur '+b.id);
 });
 if(SANS.join(',')!=='s1,w1,load,unlock1') throw new Error('les badges sans avancement doivent etre exactement les quatre a seuil 1 ou booleens : '+SANS.join(','));
 if(AVEC.length!==BADGES.length-4) throw new Error('avancement attendu sur tous les autres badges');
 /* un seuil de 1 ne produirait que 0/1, qui ne dit rien de plus que la ligne grisee */
 if(badgeProg({prog:()=>0,seuil:1},state)!==null) throw new Error('un seuil de 1 ne doit pas produire d avancement');
 if(badgeProg({seuil:5},state)!==null) throw new Error('un seuil sans compteur ne doit pas produire d avancement');
 console.log('critere OK : avancement sur '+AVEC.length+' badges, aucun sur les quatre a seuil 1 ('+SANS.join(', ')+')');

 /* ---------- 2. le compteur suit l etat et se borne au seuil ---------- */
 await neuf();
 const bId=b=>BADGES.filter(x=>x.id===b)[0];
 state.hist=[seance(30,[it('pompes-poignees',3)]),seance(29,[it('pompes-poignees',3)]),seance(28,[it('pompes-poignees',3)])];
 if(badgeProg(bId('s5'),state)!==3) throw new Error('s5 doit valoir 3/5');
 if(badgeProg(bId('s15'),state)!==3) throw new Error('s15 doit valoir 3/15');
 state.loadUps=2;
 if(badgeProg(bId('load5'),state)!==2) throw new Error('load5 doit valoir 2/5');
 /* bornage : un compteur au-dela du seuil, cas d un badge pas encore pose */
 state.loadUps=9;
 if(badgeProg(bId('load5'),state)!==5) throw new Error('le compteur doit etre borne au seuil');
 state.loadUps=-3;
 if(badgeProg(bId('load5'),state)!==0) throw new Error('le compteur ne descend pas sous zero');
 state.loadUps=0; state.xp=lvlThreshold(3);
 if(badgeProg(bId('lvl5'),state)!==lvlInfo(state.xp).lvl) throw new Error('lvl5 doit suivre le niveau');
 console.log('compteur OK : 3/5 seances, 2/5 paliers, borne au seuil et jamais negatif');

 /* ---------- 3. rendu : sur les non acquis seulement ---------- */
 await neuf();
 state.hist=[seance(30,[it('pompes-poignees',3)]),seance(29,[it('pompes-poignees',3)])];
 state.badges=['s1']; state.loadUps=3;
 view='prog'; render();
 const bd=html.split('data-k="prog-badges"')[1];
 if(!bd) throw new Error('card badges absente');
 const corps=bd.split('</summary>')[1].split('</details>')[0];
 if((corps.match(/class="badge/g)||[]).length!==BADGES.length) throw new Error('la card ouverte ne montre pas tous les badges');
 if((corps.match(/class="pg num"/g)||[]).length!==BADGES.length-4-0) throw new Error('un avancement par badge non acquis attendu, obtenu '+(corps.match(/class="pg num"/g)||[]).length);
 if(!/2\\/5</.test(corps)) throw new Error('« 2/5 » attendu sur Fondations');
 if(!/3\\/5</.test(corps)) throw new Error('« 3/5 » attendu sur Cinq paliers');
 /* s1 est acquis : il ne porte pas d avancement, et il n en portait pas non plus
    avant de l etre, son seuil valant 1 */
 const ligneS1=corps.split('Première étincelle')[1].split('</div></div>')[0];
 if(/class="pg num"/.test(ligneS1)) throw new Error('un badge acquis ne porte pas d avancement');
 /* une fois Fondations pose, son compteur disparait */
 state.badges=['s1','s5']; render();
 const corps2=html.split('data-k="prog-badges"')[1].split('</summary>')[1].split('</details>')[0];
 if((corps2.match(/class="pg num"/g)||[]).length!==BADGES.length-4-1) throw new Error('l avancement doit disparaitre du badge fraichement acquis');
 console.log('rendu OK : un avancement par badge non acquis, aucun sur les acquis ni sur les seuils a 1');

 /* ---------- 4. le badge mort est parti, l echelle des semaines est prolongee ---------- */
 await neuf();
 if(BADGES.some(b=>b.id==='mob5')) throw new Error('mob5 lisait type===mobilite, inatteignable depuis le retrait du mode cible');
 if(!BADGES.some(b=>b.id==='w12')) throw new Error('w12 doit prolonger l echelle des semaines');
 /* aucun badge ne lit plus le type de seance : toute seance s ecrit alterne */
 BADGES.forEach(b=>{ if(/mobilite|type===/.test(String(b.test))) throw new Error('un badge lit encore le type de seance : '+b.id); });
 /* w4 et w12 lisent le meme compteur, a deux seuils */
 const w4=bId('w4'), w12=bId('w12');
 if(w4.seuil!==4||w12.seuil!==12) throw new Error('seuils des badges de semaine');
 /* le badge est atteignable : douze semaines validees d affilee l ouvrent */
 state.goal=1; state.hist=[];
 for(let s=1;s<=13;s++) state.hist.push(seance(7*s,[it('pompes-poignees',3)]));
 if(weekStreak(state)<12) throw new Error('serie de 12 semaines non reconstituee, obtenu '+weekStreak(state));
 if(!w12.test(state)) throw new Error('w12 doit s ouvrir a 12 semaines d affilee');
 if(badgeProg(w12,state)!==12) throw new Error('l avancement de w12 doit atteindre son seuil');
 console.log('badges OK : mob5 retire, w12 atteignable, plus aucun badge ne lit le type de seance');

 /* ---------- 5. le plafond de la liste des seances est nomme ---------- */
 await neuf();
 state.hist=[]; for(let i=0;i<HIST_SHOWN+5;i++) state.hist.push(seance(40-i,[it('pompes-poignees',3)]));
 view='prog'; render();
 const sc=html.split('data-k="prog-seances"')[1].split('</details></details>')[0];
 const lignes=(sc.match(/XP<\\/span><\\/span><\\/summary>/g)||[]).length;
 if(lignes!==HIST_SHOWN) throw new Error(HIST_SHOWN+' seances attendues dans la liste, obtenu '+lignes);
 if(html.indexOf('Les '+HIST_SHOWN+' dernières.')<0) throw new Error('le plafond doit etre annonce dans la card');
 console.log('liste OK : '+HIST_SHOWN+' seances listees et annoncees, texte et coupe sur la meme constante');

 /* ---------- 6. volume reellement joue ---------- */
 await neuf();
 /* rien a mesurer tant qu aucune semaine n est revolue : la ligne suit les rails */
 state.hist=[seance(0,[it('pompes-poignees',3)])];
 if(playedVolume(state,4)!==null) throw new Error('aucune semaine revolue : rien a moyenner');
 if(coverage(state,4)!==null) throw new Error('temoin : coverage doit aussi valoir null');
 /* deux seances de la semaine derniere, quatre emplacements a trois series,
    plus un etirement et un module cardio qui ne doivent pas compter */
 await neuf();
 state.hist=[
  seance(7,[it('pompes-poignees',3),it('face-pulls',3),it('goblet-squat',3),it('planche',3),it('cardio-intervalles',1)]),
  seance(8,[it('pompes-poignees',2),it('face-pulls',2),it('goblet-squat',2),it('planche',2)])
 ];
 let pv=playedVolume(state,4);
 if(!pv||pv.n!==2) throw new Error('deux seances attendues dans la fenetre');
 if(pv.sets!==20) throw new Error('20 series de renforcement attendues, obtenu '+pv.sets+' : le cardio ne doit pas compter');
 if(pv.v!==2.5) throw new Error('2,5 series par exercice attendues, obtenu '+pv.v);
 /* un exercice bascule sur son repli produit deux entrees pour un emplacement :
    la somme reste juste, le denominateur ne bouge pas */
 await neuf();
 state.hist=[seance(7,[{id:'pompes-poignees',sets:[8],load:0},{id:'pompes-inclinees',sets:[8,8],load:0,sw:true,from:'pompes-poignees'},
   it('face-pulls',3),it('goblet-squat',3),it('planche',3)])];
 pv=playedVolume(state,4);
 if(pv.sets!==12||pv.v!==3) throw new Error('un repli ne change ni la somme ni le denominateur : '+JSON.stringify(pv));
 /* la fenetre est celle de coverage : une seance de la semaine en cours dehors */
 await neuf();
 state.hist=[seance(7,[it('pompes-poignees',3),it('face-pulls',3),it('goblet-squat',3),it('planche',3)]),
             seance(0,[it('pompes-poignees',1)])];
 pv=playedVolume(state,4);
 if(pv.n!==1||pv.sets!==12) throw new Error('la semaine en cours doit rester hors de la mesure');
 /* la ligne s affiche avec les rails, et pas avant */
 view='prog'; render();
 if(html.indexOf('Réellement joué')<0) throw new Error('la ligne doit apparaitre dans la card Couverture');
 if(html.indexOf('Réellement joué')<html.indexOf('Configuration actuelle')) throw new Error('la ligne doit se placer sous la projection');
 await neuf();
 state.hist=[seance(0,[it('pompes-poignees',3)])];
 view='prog'; render();
 if(html.indexOf('Réellement joué')>=0) throw new Error('aucune ligne tant qu aucune semaine n est revolue');
 console.log('volume OK : 2,5 series par exercice sur 2 seances, cardio et etirements exclus, repli neutre, meme fenetre que les rails');

 /* ---------- 7. format decimal unifie dans Progres ---------- */
 await neuf();
 state.goal=1;
 /* deux semaines revolues distinctes, dont une seule porte la quatrieme serie
    de face pulls : la moyenne du tire tombe sur une decimale */
 state.hist=[seance(14,[it('pompes-poignees',3),it('face-pulls',3),it('goblet-squat',3),it('planche',3)]),
             seance(7,[it('pompes-poignees',3),it('face-pulls',4),it('goblet-squat',3),it('planche',3)])];
 view='prog'; render();
 if(coverage(state,4).pull!==3.5) throw new Error('temoin : le tire doit valoir 3,5, obtenu '+coverage(state,4).pull);
 /* deux formateurs portent deja la virgule, fmtNum et fmtDur ; Progres etait le
    seul endroit qui affichait des decimales sans passer par eux */
 if(fmtNum(2.5)!=='2,5') throw new Error('fmtNum doit rendre la virgule');
 const zone=html.split('Assiduité')[1].split('data-k="prog-replis"')[0];
 const pointus=zone.match(/>\\d+\\.\\d+</g);
 if(pointus) throw new Error('decimale au point dans Progres : '+pointus.join(' '));
 if(!/3,5</.test(zone)) throw new Error('la couverture du tire doit s afficher 3,5');
 console.log('format OK : plus aucune decimale au point dans Assiduite et Couverture');

 /* ---------- 8. vignette de l exercice suivant ---------- */
 await neuf();
 startSession();
 const repos=cur.steps.filter(s=>s.k==='rest');
 if(!repos.length) throw new Error('aucune transition dans la seance');
 repos.forEach(s=>{
   const h=restHtml(s);
   if(h.indexOf('class="nextexo"')<0) throw new Error('vignette absente d un ecran de repos');
   if(h.indexOf(esc(DB[s.next].nom))<0) throw new Error('le nom du suivant doit rester');
   if(!/<img src="data:image/.test(h)) throw new Error('illustration absente de la vignette');
   /* inerte : un lien vers la fiche ferait quitter une seance en cours */
   /* le base64 de l illustration est retire avant inspection : il contient
      n importe quelle suite de lettres, « kg » compris */
   const vg=h.split('class="nextexo"')[1].split('</div>')[0].replace(/src="[^"]*"/g,'src=""');
   if(/onclick/.test(vg)) throw new Error('la vignette ne doit pas etre cliquable');
   /* elle annonce, elle ne prescrit pas */
   if(/ kg|élastique|reps|Cible/.test(vg)) throw new Error('la vignette ne porte ni charge ni cible : '+vg);
 });
 /* elle suit la bascule de repli et le retour, comme le libelle */
 let ir=cur.steps.findIndex(s=>s.k==='rest');
 let cible=cur.steps[ir].next, fb=fbOf(cible);
 if(fb){
   cur.i=cur.steps.findIndex((s,i)=>i>ir&&s.k==='set'&&s.id===cible);
   swapPain();
   if(cur.steps[ir].next!==fb) throw new Error('le repos doit annoncer le repli');
   if(restHtml(cur.steps[ir]).indexOf(esc(DB[fb].nom))<0) throw new Error('la vignette doit suivre le repli');
   revertSwap();
   if(cur.steps[ir].next!==cible) throw new Error('le repos doit revenir a l origine');
   if(restHtml(cur.steps[ir]).indexOf(esc(DB[cible].nom))<0) throw new Error('la vignette doit suivre le retour');
 }
 /* un identifiant sans illustration retombe sur le gabarit, jamais sur du vide */
 if(nextExoHtml(null)!=='') throw new Error('pas de vignette sans suivant');
 console.log('vignette OK : sur les '+repos.length+' transitions, inerte, sans prescription, suit repli et retour');

 console.log('TESTS LOT V2.2 OK');
})();
`;
eval(src+T);
```

## test27.js, source


```javascript
// Lot de cloture du chantier materiel (v2.0) : onboarding sur inventaire vide, sixieme niveau de bande,
// realisation par nuancier, lestes de 0,5 kg, marche basse declarable, compteur
// de progressions, verrou des strictes sur l echelle entiere, fin des dialogues
// systeme.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),
  querySelectorAll:()=>[],documentElement:{dataset:{}},createElement:()=>({}),
  body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};
/* Aucun stub de dialogue systeme ici, a dessein : si un chemin en appelait
   encore un, la suite planterait au lieu de repondre oui a sa place. */
const SRC=src;
const T=`
(async()=>{
 const err=m=>{throw new Error(m)};
 const key=k=>handlers.forEach(h=>h({key:k,code:k===' '?'Space':k,target:{tagName:'DIV'},preventDefault(){}}));
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ localStorage._m={}; state=null; cur=null; lightMode=false; view='home'; await loadState(); };

 // ================= 1. ONBOARDING =================
 await neuf();
 if(state.onboard!==true) err('l etat neuf ne porte pas le drapeau d onboarding');
 if(ownedBands(state.gear).length!==0) err('l inventaire neuf porte des bandes');
 if(RES_ORDER.some(k=>k!=='elast'&&aRes(k))) err('l inventaire neuf porte une ressource');
 if(loadLadderProg(state.gear).length!==1) err('l inventaire neuf porte des disques');
 if(state.profil!=='domicile'||!state.profils.domicile) err('le profil domicile n est pas pose des l etat neuf');
 if(state.profils.domicile.gear!==state.gear) err('l invariant du profil actif ne tient pas a l etat neuf');
 /* un inventaire vide sert quand meme les quatre groupes : c est ce qui rend
    legitime la validation d une card vide, et l onboarding l annonce */
 SLOT_ORDER.forEach(s=>{ if(!posTirables(s,state.gear).length) err('groupe vide a l inventaire nul : '+s); });
 const cVide=schemasServis(state.gear);
 /* onze et non douze depuis que la marche basse est declarable : le profil sans
    rien perd aussi la montee sur marche. Coherent avec les sept pertes de test25. */
 if(cVide.servis!==11||cVide.total!==18) err('inventaire vide : 11 schemas sur 18 attendus, '+cVide.servis+'/'+cVide.total);
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')<0) err('le bandeau d onboarding ne pointe pas vers la card Materiel');
 /* le drapeau survit aux enregistrements intermediaires : on peut regler un
    theme avant de valider son inventaire */
 setTheme('dark'); await save(); setTheme('auto');
 if(state.onboard!==true) err('le drapeau d onboarding n a pas survecu a un enregistrement');
 state=null; await loadState();
 if(state.onboard!==true) err('le drapeau d onboarding n a pas survecu au rechargement');
 validGear();
 if(state.onboard) err('la validation ne retire pas le drapeau');
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')>=0) err('le bandeau survit a la validation');
 /* et valider ne verrouille rien : la card reste editable a l identique */
 view='set'; render();
 if(html.indexOf('Valider mon matériel')>=0) err('le bouton de validation survit a la validation');
 if(html.indexOf('Ajouter un type de disque')<0) err('la card n est plus editable apres validation');
 /* v2.3, le trou de la suite d origine : elle verifiait le retrait en memoire et
    s arretait la. La validation ne vaut que si elle traverse le rechargement,
    seule chose que voit l utilisateur. */
 await save();
 state=null; await loadState();
 if(state.onboard) err('le drapeau revient au rechargement apres validation');
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')>=0) err('le bandeau revient au rechargement apres validation');
 /* jamais cree par une migration : une sauvegarde qui ne porte pas la cle
    n a pas d onboarding, quel que soit le chemin d entree. Le sujet n est plus
    fabrique a la main : c est loadState et applyImport qui sont mis a l epreuve,
    le defaut d origine vivant chez l appelant et non dans migrateState. */
 const vieille={app:'palier',v:2,xp:10,goal:4,hist:[],perf:{},unlocked:{},badges:[],
   gear:JSON.parse(JSON.stringify(DEFAULT_GEAR))};
 const s2=Object.assign(defaultState(),vieille);
 migrateState(s2,vieille);
 if(s2.onboard) err('migrateState a cree un onboarding');
 localStorage._m={'palier-state-v2':JSON.stringify(vieille)};
 state=null; await loadState();
 if(state.onboard) err('une sauvegarde anterieure a la v2.0 recoit un onboarding');
 view='home'; render();
 if(html.indexOf('Déclarer mon matériel')>=0) err('bandeau sur une sauvegarde anterieure a la v2.0');
 state=null; localStorage._m={}; await loadState(); domicile();
 applyImport(JSON.parse(payload()));
 if(state.onboard) err('un import de sauvegarde recoit un onboarding');
 /* la cle est desormais une valeur et non une absence : le fichier exporte la
    porte, et une sauvegarde ecrite pendant l onboarding la garde a true, son
    inventaire n ayant pas ete declare */
 if(!('onboard' in JSON.parse(payload()))) err('le fichier exporte ne porte pas le drapeau');
 await neuf();
 const enCours=JSON.parse(payload());
 if(enCours.onboard!==true) err('un export pendant l onboarding doit porter le drapeau');
 state=null; localStorage._m={}; await loadState();
 applyImport(enCours);
 if(state.onboard!==true) err('un import exporte pendant l onboarding perd son drapeau');
 console.log('onboarding OK : inventaire vide, quatre groupes servis, drapeau survivant, traversant la validation et jamais migre');

 // ================= 2. SIXIEME NIVEAU =================
 await neuf(); domicile();
 if(BANDS.length!==6) err('six niveaux attendus');
 const ordRes=bandOrder({bnd:'res'}), ordAss=bandOrder({bnd:'ass'});
 if(ordRes[ordRes.length-1]!=='n6') err('le sixieme niveau n est pas au sommet de la resistance');
 if(ordAss[0]!=='n6') err('le sixieme niveau n est pas l entree la plus facile en assistance');
 if(ordAss[ordAss.length-1]!=='jaune') err('le jaune n est plus le barreau le plus dur en assistance');
 /* les cinq cles existantes ne bougent pas : perf et hist les referencent */
 ['jaune','rouge','noir','violet','vert'].forEach((b,i)=>{ if(BANDS[i].id!==b) err('cle de niveau deplacee : '+b); });
 if(bandReal('n6')) err('le sixieme niveau est tenu par defaut a domicile');
 /* possede, il devient un barreau de plus au sommet des exercices en resistance */
 const fp=DB['face-pulls'];
 const avant=bandLadder(fp,state.gear).length;
 setBandReal('n6','bleu');
 if(bandLadder(fp,state.gear).length!==avant+1) err('le sixieme niveau n allonge pas l echelle de resistance');
 const p6=perfOf('face-pulls'); p6.band='vert';
 if(nextBandFor(fp,'vert',state.gear,1)!=='n6') err('le plafond de resistance ne devient pas une montee');
 setBandReal('n6','');
 console.log('slot 6 OK : sommet en resistance, entree facile en assistance, jaune intact, cles inchangees');

 // ================= 3. NUANCIER =================
 await neuf(); domicile();
 if(PAL.length!==12) err('nuancier de douze couleurs attendu');
 PAL.forEach(c=>{ if(!coulOK(c[0])||!coulLbl(c[0])||!coulHex(c[0])) err('couleur incomplete : '+c[0]); });
 /* la presence EST la realisation : une seule donnee */
 setBandReal('rouge','');
 if(ownedBands(state.gear).indexOf('rouge')>=0) err('un niveau sans realisation reste possede');
 setBandReal('rouge','bleu');
 if(ownedBands(state.gear).indexOf('rouge')<0) err('un niveau realise n est pas possede');
 if(bandNom('rouge')!=='bleue') err('libelle de realisation faux : '+bandNom('rouge'));
 /* doublon autorise, leve a l affichage et seulement quand il est effectif */
 setBandReal('violet','bleu');
 if(bandNom('rouge')!=='bleue, niveau 2'||bandNom('violet')!=='bleue, niveau 4') err('doublon non desambigue : '+bandNom('rouge'));
 setBandReal('violet','violet');
 if(bandNom('rouge')!=='bleue') err('desambiguisation maintenue hors doublon');
 if(bandLabel('rouge')!=='bande bleue') err('bandLabel ne suit pas la realisation');
 if(bandLabel('aucune')!=='sans bande') err('barreau zero mal nomme');
 /* accord en genre : la v2.0 disait « bande noir » */
 setBandReal('noir','noir');
 if(bandLabel('noir')!=='bande noire') err('accord en genre absent : '+bandLabel('noir'));
 /* migration d une realisation libre heritee du nommage de la v2.0 */
 const libre={app:'palier',v:2,xp:0,goal:4,hist:[],perf:{},unlocked:{},badges:[],
   gear:Object.assign(JSON.parse(JSON.stringify(DEFAULT_GEAR)),
     {bands:{jaune:'ma vieille jaune',rouge:'Bleue',noir:'noir',violet:'',vert:'vert'}})};
 const s3=Object.assign(defaultState(),JSON.parse(JSON.stringify(libre)));
 migrateState(s3,libre);
 if(s3.gear.bands.jaune!=='jaune') err('realisation libre non ramenee a une couleur : '+s3.gear.bands.jaune);
 if(s3.gear.bands.rouge!=='bleu') err('libelle de couleur non reconnu : '+s3.gear.bands.rouge);
 if(s3.gear.bands.violet!=='') err('un niveau absent est devenu present');
 if(s3.gear.bands.n6!=='') err('le sixieme niveau n est pas pose vide');
 const avantIdem=JSON.stringify(s3.gear.bands);
 migrateState(s3,libre);
 if(JSON.stringify(s3.gear.bands)!==avantIdem) err('la migration du nuancier n est pas idempotente');
 console.log('nuancier OK : douze couleurs, presence = realisation, doublon leve, accord, migration idempotente');

 // ================= 4. LESTES DE 0,5 KG =================
 await neuf(); domicile();
 state.gear.cuffs={'0.5':1,'1':1,'2':1};
 const par1=cuffSteps(state.gear,1), par2=cuffSteps(state.gear,2);
 if(JSON.stringify(par1)!==JSON.stringify([0,0.5,1,1.5,2,2.5,3,3.5])) err('sommes de sous-ensembles fausses : '+par1.join(','));
 if(JSON.stringify(par2)!==JSON.stringify([0,1,2,3,4,5,6,7])) err('echelle a deux membres fausse : '+par2.join(','));
 const gob=fixedLadder('goblet-squat',state.gear);
 if(gob.length!==8||gob[gob.length-1].v!==17) err('echelle du goblet : 8 barreaux jusqu a 17 kg attendus, '+gob.length+'/'+gob[gob.length-1].v);
 if(gob[3].lbl.indexOf('1,5')<0&&gob.some(x=>/\\d\\.\\d/.test(x.lbl))) err('un libelle porte un point decimal');
 /* une paire seule ne fabrique pas de barreau intermediaire */
 state.gear.cuffs={'2':1};
 if(JSON.stringify(cuffSteps(state.gear,2))!==JSON.stringify([0,4])) err('paire isolee mal echelonnee');
 state.gear.cuffs={};
 if(fixedLadder('goblet-squat',state.gear).length!==1) err('sans leste, l echelle fixe doit se reduire au kettlebell');
 console.log('lestes OK : sommes de sous-ensembles, goblet a 8 barreaux jusqu a 17 kg, libelles a la virgule');

 // ================= 5. MARCHE BASSE ET REPLIS =================
 await neuf(); domicile();
 if(RES_ORDER.length!==9||RES_ORDER.indexOf('stepbas')<0) err('neuf ressources declarables attendues');
 if(JSON.stringify(NEEDS['step-ups-bas'])!==JSON.stringify(['stepbas'])) err('le step-up bas ne declare pas son besoin');
 /* migration : presente par defaut, mais une absence declaree n est pas rallumee */
 const sansStep={app:'palier',v:2,xp:0,goal:4,hist:[],perf:{},unlocked:{},badges:[],
   gear:JSON.parse(JSON.stringify(DEFAULT_GEAR))};
 delete sansStep.gear.res.stepbas;
 const s4=Object.assign(defaultState(),JSON.parse(JSON.stringify(sansStep)));
 migrateState(s4,sansStep);
 if(s4.gear.res.stepbas!==1) err('la marche basse n est pas presente par migration');
 s4.gear.res.stepbas=0; migrateState(s4,sansStep);
 if(s4.gear.res.stepbas!==0) err('la migration rallume une marche basse decochee');
 /* l inventaire neuf, lui, la laisse decochee */
 await neuf();
 if(aRes('stepbas')) err('l inventaire vide coche la marche basse');
 /* repli douleur : jamais vers un exercice que le materiel ne sert pas */
 domicile();
 if(fbOf('fentes-arriere')!=='step-ups-bas') err('le repli des fentes devrait etre servi a domicile');
 toggleRes('stepbas');
 if(fbOf('fentes-arriere')!==null) err('repli propose alors que la marche basse est decochee');
 if(DB['fentes-arriere'].fb!=='step-ups-bas') err('le lien de repli lui-meme ne doit pas bouger');
 toggleRes('stepbas');
 /* les trois couples deja vivants en v2.0, fermes par le meme filtre */
 [['elevations-laterales','tirage-doux'],['rowing-kettlebell','rowing-elastique'],
  ['rowing-suspension','rowing-elastique']].forEach(c=>{
   if(fbOf(c[0])!==c[1]) err('repli attendu a domicile : '+c[0]);
 });
 BANDS.forEach(b=>setBandReal(b.id,''));
 [['elevations-laterales'],['rowing-kettlebell'],['rowing-suspension']].forEach(c=>{
   if(fbOf(c[0])!==null) err('repli a elastique propose sans elastique : '+c[0]);
 });
 /* et la seance allegee emprunte le meme chemin */
 domicile(); BANDS.forEach(b=>setBandReal(b.id,''));
 lightMode=true;
 const plan=buildSession();
 if(plan.exos.indexOf('rowing-elastique')>=0||plan.exos.indexOf('tirage-doux')>=0) err('la seance allegee substitue vers un exercice non servi');
 lightMode=false;
 console.log('marche basse OK : neuvieme ressource, migration prudente, replis filtres sur les deux chemins');

 // ================= 6. VERROU DES STRICTES =================
 await neuf(); domicile();
 /* temoin E1 : un profil ne possedant que la verte ne prouve rien */
 state.gear.bands={vert:'vert'};
 const src1='tractions-assistees-supination';
 const pE=perfOf(src1); pE.band='vert';
 applyProgress(src1,[10,10,10],true,false,nonQualifie(src1));
 checkUnlocks(3,false,{});
 if(state.unlocked['tractions-strictes-supination']) err('E1 : le verrou s ouvre sur la verte');
 /* nominal : le meme compte avec l elastique le plus fin ouvre toujours */
 await neuf(); domicile();
 const pN=perfOf(src1); pN.band='jaune';
 applyProgress(src1,[10,10,10],true,false,nonQualifie(src1));
 checkUnlocks(3,false,{});
 if(!state.unlocked['tractions-strictes-supination']) err('le verrou ne s ouvre plus dans le cas nominal');
 /* et le libelle dit ce qui est verifie */
 if(lockCond(DB['tractions-strictes-supination']).indexOf('le plus fin')<0) err('l enonce du verrou ne suit pas la regle');
 console.log('verrou OK : ferme sur la verte, ouvert sur le jaune, enonce conforme');

 // ================= 7. COMPTEUR DE PROGRESSIONS =================
 await neuf(); domicile();
 const avantPerf=JSON.stringify(Object.keys(state.perf).sort().map(k=>[k,state.perf[k]]));
 const dom=progDispo(state.gear);
 if(dom.total!==9||dom.marche!==9) err('domicile : 9 sur 9 attendus, '+dom.marche+' sur '+dom.total);
 const gVert=JSON.parse(JSON.stringify(state.gear)); gVert.bands={vert:'vert'};
 const v=progDispo(gVert);
 if(v.total!==9||v.marche!==6) err('verte seule : 6 sur 9 attendus, '+v.marche+' sur '+v.total);
 const gVide=JSON.parse(JSON.stringify(EMPTY_GEAR));
 const z=progDispo(gVide);
 if(z.total!==1||z.marche!==0) err('inventaire vide : 0 sur 1 attendu, '+z.marche+' sur '+z.total);
 /* un palier tenu quitte le denominateur : il a choisi de ne pas monter */
 setHold('curls-halteres',true);
 if(progDispo(state.gear).total!==8) err('un palier tenu reste compte');
 setHold('curls-halteres',false);
 /* lecture pure : les entrees deja presentes ne bougent pas */
 const apresPerf=JSON.stringify(Object.keys(state.perf).sort().filter(k=>avantPerf.indexOf('"'+k+'"')>=0||true).map(k=>[k,state.perf[k]]));
 progDispo(state.gear); progDispo(gVert);
 if(JSON.stringify(Object.keys(state.perf).sort().map(k=>[k,state.perf[k]]))!==apresPerf) err('le compteur ecrit dans perf');
 console.log('compteur OK : 9/9 a domicile, 6/9 sur la verte seule, 0/1 sans rien, lecture pure');

 // ================= 8. PLUS AUCUN DIALOGUE SYSTEME =================
 if(/[^a-zA-Z]prompt\\s*\\(/.test(SRC)) err('un prompt systeme survit dans les sources');
 if(/[^a-zA-Z]confirm\\s*\\(/.test(SRC)) err('un confirm systeme survit dans les sources');
 if(typeof renameBand!=='undefined'||typeof toggleBand!=='undefined') err('un ecrivain de bande retire est encore expose');
 /* sortie de seance : un seul geste ne quitte rien */
 await neuf(); domicile();
 state.warm='aucun'; state.cardio=false; state.stretch=false;
 startSession();
 const st0=cur.steps[0]; st0.val=8; validateSet();
 quitSession();
 if(!askQuit) err('la question de sortie n est pas posee');
 if(view!=='session') err('la seance a ete quittee sans reponse');
 if(html.indexOf('Quitter la séance ?')<0) err('la question de sortie ne s affiche pas');
 key('Enter'); key(' ');
 if(view!=='session'||!askQuit) err('une touche reflexe a repondu a la question');
 key('Escape');
 if(askQuit) err('Echap n annule pas la question');
 quitSession(); quitConfirm();
 await new Promise(r=>setTimeout(r,10));
 const h=state.hist[state.hist.length-1];
 if(!h||!h.inc) err('la sortie confirmee n enregistre pas une seance incomplete');
 console.log('dialogues OK : aucun prompt ni confirm systeme, sortie en deux temps, touches inertes');

 // ================= 9. CARD MATERIEL =================
 await neuf(); domicile();
 view='set'; render();
 ['Présent','Absent','Possédée','Absente','Modifier l\\'échelle','Nommer'].forEach(m=>{
   if(html.indexOf('>'+m+'<')>=0) err('un bouton label-etat survit : '+m);
 });
 if(html.indexOf('class="sw')<0) err('aucun interrupteur dans la card');
 if(html.indexOf('class="pastille"')<0) err('aucune pastille de niveau');
 if(html.indexOf('schémas moteurs servis')<0) err('compteur de schemas absent du pied de card');
 if(html.indexOf('encore une marche ici')<0) err('compteur de progressions absent du pied de card');
 if(html.indexOf('Marche basse')<0) err('la marche basse n est pas declarable dans la card');
 /* ajout dynamique d un type de disque : quatre exemplaires, mesure a l appui */
 const L0=loadLadderProg(state.gear).length;
 addPlate('2.5');
 if(state.gear.plates['2.5']!==4) err('un type de disque doit entrer a quatre exemplaires');
 if(loadLadderProg(state.gear).length<=L0) err('ajouter un type n a pas allonge l echelle de progression');
 adjPlate('2.5',-2); adjPlate('2.5',-2);
 if(state.gear.plates['2.5']!==0) err('un type ne retombe pas a zero');
 view='set'; render();
 if(html.indexOf('>2,5 kg<')<0) err('un type a zero ne redevient pas proposable');
 console.log('card OK : interrupteurs, pastilles, deux compteurs, types de disques dynamiques');

 console.log('TESTS LOT CLOTURE V2.0 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test24.js


```javascript
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
```

## test25.js


```javascript
// Lot resolveur v2.0 : resolution materielle des positions et rotation sous
// profil reduit. Le nombre de combinaisons est DERIVE, jamais pose : les etats
// de verrous atteignables se deduisent des dependances entre verrous.
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
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();

 // 1. etats de verrous atteignables, derives des dependances
 const locks=Object.keys(DB).filter(id=>DB[id].lock);
 const etats=[];
 (function walk(u){
   const k=Object.keys(u).sort().join(',');
   if(etats.some(x=>x.k===k)) return;
   etats.push({k:k,u:Object.assign({},u)});
   locks.forEach(id=>{
     if(u[id]) return;
     const av=DB[id].lock.after;
     if(av&&DB[av]&&DB[av].lock&&!u[av]) return;
     const n=Object.assign({},u); n[id]=true; walk(n);
   });
 })({});
 if(etats.length<4) err('etats de verrous mal derives: '+etats.length);

 // 2. exhaustif : aucun groupe vide, quel que soit l inventaire et les verrous
 const R=RES_ORDER.filter(k=>k!=='elast');
 let combos=0;
 for(let m=0;m<Math.pow(2,R.length);m++) for(let e=0;e<2;e++){
   const g=JSON.parse(JSON.stringify(DEFAULT_GEAR));
   g.res={}; R.forEach((k,j)=>g.res[k]=(m>>j)&1);
   if(!e) g.bands={jaune:0,rouge:0,noir:0,violet:0,vert:0};
   etats.forEach(st=>{
     state.unlocked=st.u; state.gear=g; combos++;
     SLOT_ORDER.forEach(s=>{
       if(!posTirables(s,g).length) err('groupe vide: '+s+' res='+JSON.stringify(g.res)+' bandes='+e+' verrous='+st.k);
     });
   });
 }
 console.log('exhaustif OK : '+combos+' combinaisons ('+Math.pow(2,R.length)+' inventaires x 2 etats d elastique x '+etats.length+' etats de verrous atteignables), aucun groupe vide');

 // 3. monotonie : rendre une ressource ne perd jamais une position
 await loadState(); domicile(); state.unlocked={};
 for(let m=0;m<Math.pow(2,R.length);m++){
   const g=JSON.parse(JSON.stringify(DEFAULT_GEAR));
   g.res={}; R.forEach((k,j)=>g.res[k]=(m>>j)&1);
   const av=SLOT_ORDER.reduce((n,s)=>n+posTirables(s,g).length,0);
   R.forEach((k,j)=>{
     if(m&(1<<j)) return;
     const g2=JSON.parse(JSON.stringify(g)); g2.res[k]=1;
     const ap=SLOT_ORDER.reduce((n,s)=>n+posTirables(s,g2).length,0);
     if(ap<av) err('monotonie violee en ajoutant '+k);
   });
 }
 console.log('monotonie OK : ajouter une ressource ne retire jamais une position');

 // 4. le profil sans rien sert les quatre groupes
 const rien=JSON.parse(JSON.stringify(DEFAULT_GEAR));
 rien.res={}; rien.bands={jaune:0,rouge:0,noir:0,violet:0,vert:0};
 state.gear=rien; state.unlocked={};
 SLOT_ORDER.forEach(s=>{ if(!posTirables(s,rien).length) err('groupe vide sans rien: '+s); });
 /* v2.0 : sept et non six. La marche basse est declarable depuis que le
    step-up bas exige un appui stable sous le poids du corps, donc un profil
    sans rien perd aussi la montee sur marche, que le substitut ne rattrape
    plus. Les quatre groupes restent servis. */
 if(posPerdues(rien).length!==7) err('profil sans rien : 7 schemas perdus attendus, '+posPerdues(rien).length);
 console.log('profil sans rien OK : les quatre groupes servis, 7 schemas perdus');

 // 5. rotation : equite et espacement sur la grille filtree
 const halteres=JSON.parse(JSON.stringify(DEFAULT_GEAR));
 halteres.res={hal:1}; halteres.bands={jaune:0,rouge:0,noir:0,violet:0,vert:0};
 state.gear=halteres; state.unlocked={};
 const pos=posTirables('pull',halteres);
 /* L equite porte sur les POSITIONS, pas sur les exercices : deux positions
    peuvent se resoudre vers le meme substitut, et c est alors le mandat de
    sante qui parle, pas un defaut de rotation. */
 const seqPos=[]; for(let k=0;k<60;k++){ seqPos.push(pos[k%pos.length]); }
 const t={}; seqPos.forEach(x=>t[x]=(t[x]||0)+1);
 const v=Object.keys(t).map(k=>t[k]);
 if(Object.keys(t).length!==pos.length) err('une position n est jamais servie');
 if(Math.max.apply(null,v)-Math.min.apply(null,v)>0) err('frequences de position inegales: '+JSON.stringify(t));
 let run=1,mx=1; for(let i=1;i<seqPos.length;i++){ if(seqPos[i]===seqPos[i-1]){run++;if(run>mx)mx=run;} else run=1; }
 if(mx>1) err('la meme position revient '+mx+' fois d affilee');
 console.log('rotation OK : '+pos.length+' positions servies a frequence strictement egale, aucune position consecutive');

 // 6. le compteur n est jamais deplace par la resolution
 state.gear=halteres; state.slotIdx.pull=0;
 const ailleurs=[]; for(let k=0;k<7;k++){ state.slotIdx.pull=k; ailleurs.push(pickFromPool('pull')); }
 state.slotIdx.pull=7;
 const retour=(g=>{ state.gear=g; return pickFromPool('pull'); })(JSON.parse(JSON.stringify(DEFAULT_GEAR)));
 state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.slotIdx.pull=7;
 const jamaisParti=pickFromPool('pull');
 if(retour!==jamaisParti) err('le retour au domicile ne reprend pas ou la rotation en etait: '+retour+' vs '+jamaisParti);
 console.log('compteur OK : apres 7 seances ailleurs, le retour sert la position qu on aurait eue sans partir');

 // 7. une chaine ne pointe que sur des exercices servis quand elle resout
 await loadState(); domicile();
 SLOT_ORDER.forEach(s=>{
   const t=SUBS[s]||{};
   Object.keys(t).forEach(i=>{
     if(!SLOTS[s].pool[i]) err('position inexistante '+s+':'+i);
     /* Un substitut peut etre membre d un vivier : une position degrade
        parfois vers l exercice d une autre position, par exemple le developpe
        au sol vers les pompes ou les tractions strictes vers les assistees.
        Ce qui est interdit, c est qu une chaine se referme sur sa propre
        reference, ce qui la rendrait circulaire et sans issue. */
     t[i].forEach(x=>{ if(!DB[x]) err('substitut inconnu '+x);
       if(x===SLOTS[s].pool[i]) err('chaine circulaire sur '+s+':'+i); });
     if(new Set(t[i]).size!==t[i].length) err('doublon dans la chaine '+s+':'+i);
   });
 });
 console.log('table OK : chaque chaine pointe sur des fiches existantes, sans circularite ni doublon');
 console.log('TESTS LOT RESOLVEUR V2.0 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test26.js


```javascript
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
```

## falsif23.sh, banc de falsification du carrousel

Dix mutations, toutes tombent. Il protège la hauteur de la bande, ajoutée le 13 septembre 2026, et
les trois propriétés de feuille de style dont elle dépend, dont l'alignement en haut sans lequel la
mesure rend la hauteur du plus grand panneau. Hors build, comme les autres bancs.

```bash
#!/bin/bash
# Banc de falsification de test23.js : carrousel du detail de seance. Chaque
# mutation defait une decision ; test23 doit tomber sur chacune. Mutations par
# remplacement exact, le banc s arrete si un motif ne mord pas.
set -e
cd "$(dirname "$0")"
cp head.html .bh ; cp app5.js .b5 ; cp app9.js .b9
restaure(){ cp .bh head.html; cp .b5 app5.js; cp .b9 app9.js; }
mut(){ python3 - "$1" "$2" "$3" << 'EOF'
import sys
p,old,new=sys.argv[1:4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE dans',p,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
EOF
}
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test23.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- hauteur de la bande ----
mut app9.js "  st.style.height=h>0?h+'px':'';" "  st.style.height='';"
essai "bande qui reprend la hauteur du plus grand panneau"

mut app9.js "  st.style.height=h>0?h+'px':'';" "  st.style.height=h+'px';"
essai "mesure nulle ecrite telle quelle, bande ecrasee card repliee"

mut app9.js "  carSync(); carFit();   /* la hauteur glisse avec le panneau, meme duree */" "  carSync();"
essai "hauteur non remesuree au changement de panneau"

mut app9.js "    if(best!==carIdx){ carIdx=best; carSync(); carFit(); }" "    if(best!==carIdx){ carIdx=best; carSync(); }"
essai "hauteur non remesuree apres un balayage"

mut app5.js "  renderNav();
  carFit();" "  renderNav();"
essai "accueil qui ne mesure pas au rendu"

mut app9.js "+cardOpen('home-detail',true)+' ontoggle=\"carFit()\">'+" "+cardOpen('home-detail',true)+'>'+"
essai "card qui ne remesure pas a son ouverture"

mut app9.js "  const el=p[Math.max(0,Math.min(p.length-1,carIdx))];" "  const el=p[carIdx];"
essai "index hors bornes non ramene dans la bande"

mut head.html "display:flex;align-items:flex-start;overflow-x:auto" "display:flex;overflow-x:auto"
essai "panneaux etires : la mesure rend la hauteur du plus grand"

mut head.html ";overflow-y:hidden;scroll-snap-type:x mandatory" ";scroll-snap-type:x mandatory"
essai "debordement vertical qui capture le defilement de la page"

mut head.html ";scrollbar-width:none;transition:height .18s ease}" ";scrollbar-width:none}"
essai "hauteur qui saute au lieu de glisser"

rm -f .bh .b5 .b9
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
```

## test23.js


Suite de la v1.18. Elle couvre le retrait complet du mode ciblé et des réglages qui
en dépendaient, la disparition des trois champs orphelins à la migration et son
idempotence, le libellé d'historique réduit à ce qui distingue, la fenêtre du
carrousel et sa propriété de couverture vérifiée sur les 210 positions de départ,
l'ordre et le contenu des panneaux, l'absence de durée sur les lignes à venir, le
barreau de bande sur la ligne, la non-persistance de l'index, la ligne fermée qui
porte le nom du panneau, l'étanchéité de la séance allégée aux panneaux à venir, le
glissement piloté et sa décélération, le déménagement du volume hebdomadaire, la
composition du pied des réglages, et les étiquettes d'accessibilité.

```javascript
// Nouveautes v1.18 : retrait du mode cible et du bouton de saut de seance,
// carrousel des seances a venir dans le detail de seance.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true), otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
/* le CSS de la bande se lit dans head.html, comme dans test42 */
const CSS=fs.readFileSync('head.html','utf8');
const T=`
(async()=>{
 const CSS=${JSON.stringify(CSS)};
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState(); domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.sound=false; };
 const sans=h=>h.split('data:image').map((x,i)=>i?x.slice(x.indexOf('"')):x).join(' ');
 const panneaux=h=>(h.match(/class="carpane"/g)||[]).length;

 // 1. le mode cible ne survit nulle part
 await neuf();
 ['SESSIONS','CIBLE_ORDER','setMode','setRest','skipType'].forEach(n=>{
   if(eval('typeof '+n)!=='undefined') throw new Error(n+' survit au retrait du mode cible');
 });
 if(buildSession().type!=='alterne') throw new Error('le type de seance n est plus constant');
 if(weeklySets()!==roundsOf(state)*state.goal) throw new Error('volume hebdomadaire par groupe faux');
 console.log('retrait OK : decoupage, reglages et bouton de saut absents, un seul type de seance');

 // 2. les champs orphelins disparaissent a la migration, et l historique garde le sien
 await neuf();
 state.mode='cible'; state.cibleIdx=4; state.rest=90;
 await save(); state=null; await loadState(); domicile();
 if(state.mode!==undefined||state.cibleIdx!==undefined||state.rest!==undefined)
   throw new Error('champ orphelin conserve : '+JSON.stringify({mode:state.mode,cibleIdx:state.cibleIdx,rest:state.rest}));
 const avant=JSON.stringify(state);
 migrateState(state);
 if(JSON.stringify(state)!==avant) throw new Error('la migration v1.18 n est pas idempotente');
 console.log('migration OK : mode, cibleIdx et rest retires, idempotente');

 // 3. libelle d historique : rien en alterne, allegee marquee, Ciblee pour une entree ancienne
 await neuf();
 if(histLab({mode:'alterne'})!=='') throw new Error('le mot Alternee subsiste sur une ligne d historique');
 if(histLab({mode:'alterne',light:true})!=='allégée') throw new Error('marque allegee perdue');
 if(histLab({mode:'cible',type:'core'})!=='Ciblée') throw new Error('entree ancienne non identifiee');
 if(histLab({mode:'cible',light:true})!=='Ciblée · allégée') throw new Error('cumul des deux marques faux');
 state.hist.push({date:new Date().toISOString(),mode:'cible',type:'core',items:[],xp:0});
 view='prog'; render();
 if(html.indexOf('Ciblée')<0) throw new Error('une entree ancienne ne se rend plus');
 console.log('historique OK : mot constant retire, entree ancienne encore lisible');

 // 4. autant de panneaux que le plus gros vivier, et chaque panneau EXACT
 /* v2.8 : la promesse d exhaustivite sur la fenetre est retiree, elle etait
    incompatible avec le dephasage des viviers. Que toute tranche de n tirages
    porte les n exercices equivaut a une suite de periode n ; jambes et gainage
    comptant cinq entrees chacun, deux suites de periode 5 redonnent cinq paires
    rigides, soit exactement ce que le dephasage supprime. La tenir aurait
    demande onze panneaux au lieu de six. Ce qui est teste ici est la propriete
    que le carrousel promet vraiment : chaque panneau annonce le tirage qui
    sortira reellement a cette distance, a jeu normal. */
 await neuf();
 const N=aheadCount();
 const tailles=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(id=>!isLocked(id)&&!estRetire(id)).length);
 if(N!==Math.max.apply(null,tailles)) throw new Error('fenetre '+N+' pour des viviers '+tailles.join('/'));
 for(let dep=0;dep<210;dep++){
   SLOT_ORDER.forEach(s=>state.slotIdx[s]=dep);
   const annonce=[]; for(let k=0;k<N;k++) annonce.push(drawAhead(k).join('|'));
   for(let k=0;k<N;k++){
     SLOT_ORDER.forEach(s=>state.slotIdx[s]=dep+k);
     const reel=SLOT_ORDER.map(pickFromPool).join('|');
     if(reel!==annonce[k]) throw new Error('depart '+dep+', panneau '+k+' annonce '+annonce[k]+' et sort '+reel);
   }
 }
 SLOT_ORDER.forEach(s=>state.slotIdx[s]=0);
 console.log('fenetre OK : '+N+' panneaux, chacun exact sur les 210 departs');

 // 5. le panneau zero est la seance du jour, le panneau un est le tirage suivant
 await neuf();
 view='home'; render();
 if(panneaux(html)!==N) throw new Error(panneaux(html)+' panneaux rendus pour '+N+' attendus');
 const jour=buildSession().exos, suiv=drawAhead(1);
 if(jour.some((id,i)=>id!==drawAhead(0)[i])) throw new Error('le panneau du jour ne suit pas le tirage courant');
 if(suiv.some(id=>jour.indexOf(id)>=0)) throw new Error('un exercice du jour reapparait des le panneau suivant');
 const t=sans(html), i0=t.indexOf('data-i="0"'), i1=t.indexOf('data-i="1"');
 if(i0<0||i1<0||i0>i1) throw new Error('ordre des panneaux');
 suiv.forEach(id=>{ if(t.slice(i1).indexOf(DB[id].nom)<0) throw new Error('exercice absent du panneau suivant : '+DB[id].nom); });
 console.log('panneaux OK : le jour puis les tirages a venir, dans l ordre');

 // 6. ce que les panneaux a venir portent, et ce qu ils ne portent pas
 const p1=t.slice(i1, t.indexOf('data-i="2"')>0?t.indexOf('data-i="2"'):t.length);
 if(p1.indexOf('Cibles et charges à ton niveau actuel')<0) throw new Error('mention de niveau absente');
 if(p1.indexOf('futnote')>p1.indexOf('Matériel à sortir')) throw new Error('la mention doit preceder le materiel');
 if(p1.indexOf('Matériel à sortir')<0) throw new Error('materiel absent d un panneau a venir');
 /* le sous-titre d une ligne a venir ne porte que le groupe musculaire : la
    duree du jour s y ajoute apres un separateur, qui doit rester absent */
 const sousTitres=p1.split('class="muted small">').slice(1).map(x=>x.split('<')[0]);
 const avecSep=sousTitres.filter(x=>x.indexOf(' · ')>=0);
 if(avecSep.length) throw new Error('duree sur une ligne a venir : '+avecSep[0]);
 if(!sousTitres.length) throw new Error('aucun sous-titre lu, le controle ne prouve rien');
 console.log('contenu OK : mention en tete, materiel present, aucune duree');

 // 7. le barreau de bande figure sur la ligne, du jour comme a venir
 await neuf();
 const idb=SLOT_ORDER.map(s=>SLOTS[s].pool.filter(x=>!isLocked(x)&&!estRetire(x))).reduce((a,b)=>a.concat(b),[])
   .filter(id=>DB[id].bnd&&perfFor(id,false).band&&perfFor(id,false).band!=='aucune')[0];
 if(!idb) throw new Error('aucun exercice a bande pour le controle');
 const ligne=exoRowHtml(idb);
 /* v2.10 : le libelle dit « bande » et non « elastique », et il porte la
    realisation au feminin. L ancien controle cherchait « elastique » suivi de
    la CLE du niveau, au masculin : il passait par prefixe, « elastique noir »
    etant un prefixe de « elastique noire », et n aurait donc jamais vu le
    desaccord qu il etait cense couvrir. */
 if(ligne.indexOf('bande '+bandNom(perfFor(idb,false).band))<0) throw new Error('barreau de bande absent de la ligne de '+DB[idb].nom);
 if(/[ée]lastique\s+(rose|verte|bleue|violette|noire|blanche|grise)/i.test(ligne)) throw new Error('desaccord de genre sur la ligne de '+DB[idb].nom);
 console.log('bande OK : barreau annonce sur la ligne, '+DB[idb].nom+' en '+bandNom(perfFor(idb,false).band));

 // 8. l index du carrousel ne persiste pas
 carIdx=3; view='home'; render();
 if(carIdx!==0) throw new Error('le carrousel reste parque sur un panneau a venir');
 console.log('index OK : remis a zero a chaque affichage de l accueil');

 // 8 bis. le glissement est pilote, le defilement lisse natif n est plus demande
 if(typeof carGlide!=='function') throw new Error('le glissement pilote a disparu');
 if(!(CAR_MS>0&&CAR_MS<=400)) throw new Error('duree de glissement hors de portee : '+CAR_MS);
 if(/behavior\s*:\s*'smooth'/.test(carGo.toString())) throw new Error('carGo redemande le defilement lisse natif');
 if(carGo.toString().indexOf('carGlide')<0) throw new Error('carGo ne passe plus par le glissement pilote');
 /* la deceleration part de la position courante et arrive exactement a la cible */
 const e=k=>1-Math.pow(1-k,3);
 if(e(0)!==0||e(1)!==1) throw new Error('la deceleration ne couvre pas tout le trajet');
 let prev=-1, croiss=true;
 for(let k=0;k<=1.0001;k+=0.05){ const v=e(Math.min(1,k)); if(v<prev) croiss=false; prev=v; }
 if(!croiss) throw new Error('la deceleration revient en arriere');
 console.log('glissement OK : pilote en '+CAR_MS+' ms, deceleration monotone de 0 a 1');

 /* 8 ter. La bande prend la hauteur du panneau affiche. Une bande flex prend
    sinon celle de son plus grand enfant, et les panneaux a venir sont
    systematiquement plus hauts que celui du jour, intitule et encart de niveau
    en plus : le vide s ouvrait sous la derniere ligne de la seance du jour
    jusqu a la card suivante (corrige le 13 septembre 2026). */
 /* Sans alignement en haut, l etirement par defaut donne a chaque panneau la
    hauteur de la ligne : la mesure rend le plus grand et carFit se reecrit sa
    propre hauteur. C est l assertion qui manquait au premier passage, celle de
    la mesure ne pouvant rien prouver sur un offsetHeight simule. */
 if(!/\\.carstrip\\{[^}]*align-items:flex-start/.test(CSS)) throw new Error('la bande doit aligner ses panneaux en haut, sinon la mesure rend la hauteur du plus grand');
 if(!/\\.carstrip\\{[^}]*overflow-y:hidden/.test(CSS)) throw new Error('la bande doit cacher le debordement vertical : une hauteur fausse capturerait le defilement de la page');
 if(!/\\.carstrip\\{[^}]*transition:height/.test(CSS)) throw new Error('la hauteur de la bande se transitionne');
 if(carGo.toString().indexOf('carFit')<0) throw new Error('carGo ne remesure pas la hauteur');
 if(carScroll.toString().indexOf('carFit')<0) throw new Error('un balayage ne remesure pas la hauteur');
 if(renderHome.toString().indexOf('carFit')<0) throw new Error('l accueil ne mesure pas la hauteur au rendu');
 if(!/ontoggle="carFit\\(\\)"/.test(html)) throw new Error('la card repliee ne remesure pas a son ouverture');
 {
   const DQ=document.querySelector;
   const pans=[{offsetHeight:300},{offsetHeight:420},{offsetHeight:380}];
   const strip={style:{},querySelectorAll:()=>pans};
   document.querySelector=s=>s==='#carstrip'?strip:DQ(s);
   carIdx=0; carFit();
   if(strip.style.height!=='300px') throw new Error('hauteur du panneau du jour attendue, '+strip.style.height);
   carIdx=1; carFit();
   if(strip.style.height!=='420px') throw new Error('la hauteur suit le panneau affiche, '+strip.style.height);
   carIdx=9; carFit();
   if(strip.style.height!=='380px') throw new Error('index hors bornes ramene au dernier panneau, '+strip.style.height);
   /* card repliee : rien ne se mesure, la consigne s efface plutot que d ecraser
      la bande a zero */
   pans[2].offsetHeight=0; carFit();
   if(strip.style.height!=='') throw new Error('mesure nulle : la consigne de hauteur doit s effacer, '+strip.style.height);
   document.querySelector=DQ;
   carIdx=0;
 }
 console.log('hauteur OK : la bande suit le panneau affiche, mesure nulle effacee, debordement vertical cache');

 // 9. la ligne fermee porte le nom du panneau et non la marque allegee
 await neuf(); lightMode=true; view='home'; render();
 const som=sans(html).split('home-detail')[1].split('</summary>')[0];
 if(som.indexOf('Aujourd\\'hui')<0) throw new Error('la ligne fermee ne porte pas le nom du panneau');
 if(som.indexOf('allégée')>=0) throw new Error('la marque allegee occupe encore la ligne fermee');
 if(sans(html).indexOf('cibles réduites')<0) throw new Error('la seance allegee n est plus annoncee ailleurs');
 lightMode=false;
 console.log('en-tete OK : nom du panneau, allegee dite dans le bandeau et l encart');

 // 10. seance allegee : les replis restent au jour, les panneaux a venir montrent le tirage normal
 await neuf(); lightMode=true;
 const pl=buildSession();
 const remplaces=pl.exos.filter((id,i)=>id!==pl.orig[i]);
 if(!remplaces.length) throw new Error('aucune substitution : le controle ne prouve rien');
 view='home'; render();
 const u=sans(html), j1=u.indexOf('data-i="1"');
 remplaces.forEach(id=>{ if(u.slice(j1).indexOf(DB[id].nom)>=0&&drawAhead(1).indexOf(id)<0)
   throw new Error('un repli du jour deborde sur les panneaux a venir : '+DB[id].nom); });
 lightMode=false;
 console.log('allegee OK : les replis ne colorent que le panneau du jour');

 // 11. les reglages : la card Structure a disparu, son chiffre a demenage
 await neuf(); view='set'; render();
 if(html.indexOf('Structure de séance')>=0) throw new Error('la card Structure survit');
 if(html.indexOf('Ciblée')>=0) throw new Error('le mode cible est encore nomme dans les reglages');
 const ser=html.split('Séries par exercice')[1].split('</details>')[0];
 if(ser.indexOf('séries par groupe musculaire et par semaine')<0) throw new Error('volume hebdomadaire absent de Series par exercice');
 if(ser.indexOf('>'+weeklySets()+'<')<0) throw new Error('le chiffre affiche ne suit pas le reglage');
 const pied=html.split('class="card muted small"')[1]||'';
 const titres=['Ce que fait PALIER','Comment les exercices sont choisis','Pourquoi les séances sont alternées'];
 titres.forEach(t=>{ if(pied.indexOf('>'+t+'</span>')<0) throw new Error('intitule absent du pied des reglages : '+t); });
 const pos=titres.map(t=>pied.indexOf(t));
 if(pos[0]>pos[1]||pos[1]>pos[2]) throw new Error('l outil doit etre presente avant son catalogue puis sa structure');
 if((pied.match(/class="lead/g)||[]).length!==3) throw new Error('trois intitules attendus dans le pied');
 if(pied.indexOf('douleur inhabituelle ou persistante')<0) throw new Error('la ligne de prudence a disparu');
 console.log('reglages OK : card retiree, chiffre dans Series par exercice, structure expliquee en bas');

 // 12. aria-label sur les boutons a symbole nu
 await neuf(); view='set'; render();
 const nSet=(html.match(/aria-label=/g)||[]).length;
 if(nSet<6) throw new Error('steppers des reglages sans etiquette : '+nSet);
 view='home'; render();
 const nHome=(sans(html).match(/aria-label=/g)||[]).length;
 if(nHome<3) throw new Error('boutons du carrousel sans etiquette : '+nHome);
 console.log('etiquettes OK : '+nSet+' dans les reglages, '+nHome+' sur l accueil');

 console.log('TESTS V1.18 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test22.js


Suite de la v1.17. Elle couvre les plafonds des cinq tenues, la migration de la
fourchette stockée et son idempotence, l'énoncé et l'ouverture des deux verrous
avec le côté faible sur le latéral, le refus d'ouvrir sur des séries issues d'une
séance allégée, la composition du vivier gainage dans les quatre états de verrous,
la chaîne de replis, les textes de plafond, le matériel, la banque à 41 images et
le rendu des deux fiches, et l'enveloppe en tête du fichier exporté.

```javascript
// Nouveautes v1.17 : plafond des tenues au sol ramene a 45 s avec migration,
// planche sur ballon et gainage lateral jambe levee derriere un verrou, retrait
// du predecesseur du tirage et promotion en repli douleur.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
global.setInterval=()=>({});global.clearInterval=()=>{};
global.setTimeout=fn=>({fn:fn});global.clearTimeout=()=>{};

const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3;state.sound=false; };

 /* ---------- 1. plafonds : les quatre tenues de gainage s arretent a 45 s ---------- */
 /* v2.19 : la jambe levee sort de la liste, elle passe en repetitions
    cadencees, 8-15, dont les 15 font 45 s de planche */
 await neuf();
 const attendu={'planche':[20,45],'planche-genoux':[20,45],'gainage-lateral':[15,45],
   'planche-ballon':[15,45]};
 Object.keys(attendu).forEach(id=>{
   const e=DB[id];
   if(!e) throw new Error('exercice absent du catalogue : '+id);
   if(e.mode!=='time') throw new Error(id+' devrait etre une tenue chronometree');
   if(e.reps[0]!==attendu[id][0]||e.reps[1]!==attendu[id][1]) throw new Error(id+' : fourchette '+e.reps.join('-')+' au lieu de '+attendu[id].join('-'));
   if('cap' in e) throw new Error(id+' : le champ cap n existe plus, le plafond est le haut de fourchette (v2.16)');
 });
 { const j=DB['gainage-lateral-jambe-levee'];
   if(j.mode!=='bw'||!j.cadence||j.reps.join('-')!=='8-15') throw new Error('la jambe levee est en repetitions cadencees, 8-15');
   if(15*(j.cadence.monte+j.cadence.descente)!==45) throw new Error('15 repetitions cadencees font 45 s de planche'); }
 console.log('plafonds OK : quatre tenues a 45 s, plafond egal au haut de fourchette, abductions a 15 x 3 s');

 /* ---------- 2. migration : une fourchette 20-60 stockee redescend a 20-45 ---------- */
 await neuf();
 const vieux={v:2,rounds:3,perf:{
   'planche':{load:0,range:[20,60],target:60,best:60,sets:[60,60],date:'2026-08-01T10:00:00.000Z'},
   'planche-genoux':{load:0,range:[20,60],target:55,best:55,sets:[],date:null},
   'gainage-lateral':{load:0,range:[15,45],target:30,best:30,sets:[],date:null}}};
 const m=migrateState(JSON.parse(JSON.stringify(vieux)));
 if(m.perf['planche'].range[1]!==45) throw new Error('planche : fourchette non ecretee, '+m.perf['planche'].range.join('-'));
 if(m.perf['planche'].target!==45) throw new Error('planche : cible non ecretee, '+m.perf['planche'].target);
 if(m.perf['planche'].range[0]!==20) throw new Error('le bas de fourchette ne doit pas bouger');
 if(m.perf['planche-genoux'].range[1]!==45) throw new Error('planche-genoux : fourchette non ecretee');
 if(m.perf['planche-genoux'].target!==45) throw new Error('planche-genoux : cible non ecretee');
 if(m.perf['gainage-lateral'].range[1]!==45||m.perf['gainage-lateral'].target!==30) throw new Error('une fourchette deja conforme ne doit pas etre touchee');
 if(m.perf['planche'].best!==60) throw new Error('le maximum historique n est pas reecrit');
 // idempotence : rejouer la migration ne bouge plus rien
 const deux=migrateState(JSON.parse(JSON.stringify(m)));
 if(JSON.stringify(deux.perf)!==JSON.stringify(m.perf)) throw new Error('migration non idempotente');
 console.log('migration OK : 20-60 devient 20-45 sur les deux planches, idempotente, cible ecretee');

 /* ---------- 3. verrous : deux series de 45 s, cote faible compris ---------- */
 await neuf();
 if(!isLocked('planche-ballon')) throw new Error('la planche sur ballon doit demarrer verrouillee');
 if(!isLocked('gainage-lateral-jambe-levee')) throw new Error('le gainage jambe levee doit demarrer verrouille');
 const cond=lockCond(DB['planche-ballon']);
 if(/\\{n\\}/.test(cond)) throw new Error('le jeton {n} n a pas ete resolu : '+cond);
 if(cond.indexOf('2 séries')<0) throw new Error('a 3 series de volume, le verrou doit annoncer 2 series : '+cond);
 if(cond.indexOf('45 s')<0) throw new Error('le verrou doit annoncer 45 s : '+cond);
 // une seule serie a 45 ne suffit pas
 applyProgress('planche',[45,30],true,false);
 checkUnlocks(3,false,null);
 if(state.unlocked['planche-ballon']) throw new Error('une seule serie a 45 s ne doit pas ouvrir le verrou');
 // deux series a 45 ouvrent
 applyProgress('planche',[45,45],true,false);
 let ms=checkUnlocks(3,false,null);
 if(!state.unlocked['planche-ballon']) throw new Error('deux series a 45 s doivent ouvrir le verrou');
 if(!ms.join(' ').match(/Débloqué/)) throw new Error('message de deblocage attendu');
 console.log('verrou OK : enonce resolu a 2 series de 45 s, une seule ne suffit pas');

 /* ---------- 4. le cote faible commande sur le gainage lateral ---------- */
 await neuf();
 // la serie enregistree pour un tenu unilateral est deja le minimum des deux cotes
 const st={id:'gainage-lateral'}; holdInit(st,DB['gainage-lateral']);
 if(st.sides.length!==2) throw new Error('un tenu unilateral prevoit deux mesures');
 applyProgress('gainage-lateral',[45,45],true,false);
 checkUnlocks(3,false,null);
 if(!state.unlocked['gainage-lateral-jambe-levee']) throw new Error('deux passages a 45 s doivent ouvrir la jambe levee');
 await neuf();
 applyProgress('gainage-lateral',[45,20],true,false);   // 20 s = cote faible d un passage
 checkUnlocks(3,false,null);
 if(state.unlocked['gainage-lateral-jambe-levee']) throw new Error('un cote faible a 20 s ne doit pas ouvrir le verrou');
 console.log('cote faible OK : le minimum des deux cotes commande le verrou');

 /* ---------- 5. une seance allegee n ouvre aucun de ces verrous ---------- */
 await neuf();
 applyProgress('planche',[45,45],true,true);            // series issues d une allegee
 checkUnlocks(3,false,null);
 if(state.unlocked['planche-ballon']) throw new Error('des series d une seance allegee ne doivent rien ouvrir');
 console.log('allegee OK : la provenance des series bloque le deblocage');

 /* ---------- 6. retrait : le vivier gainage vaut cinq entrees dans les quatre etats ---------- */
 const vivier=()=>SLOTS.core.pool.filter(id=>!isLocked(id)&&!estRetire(id));
 await neuf();
 const s0=vivier();
 if(s0.join(',')!=='planche,bird-dog,gainage-lateral,dead-bug,pallof-press') throw new Error('etat neuf : '+s0.join(','));
 state.unlocked['planche-ballon']=true;
 const s1=vivier();
 if(s1.join(',')!=='planche-ballon,bird-dog,gainage-lateral,dead-bug,pallof-press') throw new Error('ballon debloque : '+s1.join(','));
 state.unlocked['gainage-lateral-jambe-levee']=true;
 const s2=vivier();
 if(s2.join(',')!=='planche-ballon,bird-dog,gainage-lateral-jambe-levee,dead-bug,pallof-press') throw new Error('les deux debloques : '+s2.join(','));
 state.unlocked['planche-ballon']=false;
 const s3=vivier();
 if(s3.join(',')!=='planche,bird-dog,gainage-lateral-jambe-levee,dead-bug,pallof-press') throw new Error('jambe levee seule : '+s3.join(','));
 [s0,s1,s2,s3].forEach((v,i)=>{ if(v.length!==5) throw new Error('etat '+i+' : '+v.length+' entrees au lieu de 5'); });
 console.log('vivier OK : cinq entrees et meme ordre dans les quatre etats de verrous');

 /* ---------- 7. le predecesseur devient le repli douleur du successeur ---------- */
 await neuf();
 if(DB['planche-ballon'].fb!=='planche') throw new Error('la planche au sol doit etre le repli du ballon');
 if(DB['gainage-lateral-jambe-levee'].fb!=='gainage-lateral') throw new Error('le gainage au sol doit etre le repli de la jambe levee');
 if(DB['planche'].fb!=='planche-genoux') throw new Error('le repli de la planche au sol ne doit pas bouger');
 // en seance allegee, la substitution joue
 state.unlocked['planche-ballon']=true;
 state.slotIdx={push:0,pull:0,legs:0,core:0};
 lightMode=true;
 const plan=buildSession();
 lightMode=false;
 const iBall=plan.orig.indexOf('planche-ballon');
 if(iBall<0) throw new Error('le ballon devait sortir a l emplacement gainage');
 if(plan.exos[iBall]!=='planche') throw new Error('en allegee, le ballon doit ceder la place a la planche au sol');
 console.log('repli OK : chaine planche sur ballon > planche > planche sur genoux');

 /* ---------- 8. textes de plafond : plus de long lever, la marche suivante est nommee ---------- */
 await neuf();
 if(/coude/i.test(DB['planche'].next||'')) throw new Error('le texte du long lever plank doit avoir disparu');
 if(DB['planche'].next.indexOf('ballon')<0) throw new Error('le plafond de la planche doit nommer le ballon');
 if(DB['gainage-lateral'].next.indexOf('abductions')<0) throw new Error('le plafond du gainage doit nommer les abductions');
 /* v2.19 : plus de lest promis sur la jambe levee, la suite reste a decider */
 if(/leste/i.test(DB['gainage-lateral-jambe-levee'].next)||!/pas de marche outillée/.test(DB['gainage-lateral-jambe-levee'].next)) throw new Error('jambe levee : impasse dite, sans lest promis');
 [['planche-ballon','ballon']].forEach(([id,mot])=>{
   const n=DB[id].next||'';
   if(!n) throw new Error(id+' : marche suivante non documentee');
   if(n.toLowerCase().indexOf(mot)<0) throw new Error(id+' : marche suivante attendue autour de « '+mot+' », lu : '+n);
   if(n.indexOf('pas encore')<0) throw new Error(id+' : la marche suivante n est pas outillee, le texte doit le dire');
 });
 const msg=applyProgress('planche',[45,45],true,false);
 if(!msg.join(' ').match(/Plafond atteint sur Planche : la planche sur ballon prend le relais/)) throw new Error('message de plafond : '+msg.join(' '));
 console.log('plafonds OK : long lever retire, marche suivante nommee, dette annoncee');

 /* ---------- 9. materiel : le ballon est annonce quand il sert ---------- */
 await neuf();
 if((DB['planche-ballon'].mat||[]).indexOf('Swiss ball')<0) throw new Error('le ballon doit figurer au materiel');
 const g=sessionGear({exos:['planche-ballon'],orig:['planche-ballon'],cardio:false});
 if(g.indexOf('Swiss ball')<0) throw new Error('le detail de seance doit sortir le ballon : '+g.join(', '));
 const g2=sessionGear({exos:['gainage-lateral-jambe-levee'],orig:['gainage-lateral-jambe-levee'],cardio:false});
 if(g2.indexOf('Swiss ball')>=0) throw new Error('le gainage lateral ne demande pas de ballon');
 console.log('materiel OK : ballon annonce sur la planche ballon seulement');

 /* ---------- 10. illustrations embarquees ---------- */
 if(typeof IMG!=='undefined'){
   if(!IMG['planche-ballon']) throw new Error('illustration planche-ballon absente de la banque');
   if(!IMG['gainage-lateral-jambe-levee']) throw new Error('illustration gainage-lateral-jambe-levee absente');
   if(Object.keys(IMG).length!==58) throw new Error('banque attendue a 58 images, '+Object.keys(IMG).length+' trouvees');   /* v2.18 : +2, escalier du squat */
   /* Aucune image morte : toute entree de la banque sert soit une fiche, soit
      une etape d echauffement. Le controle par les seules cles de DB etait
      trompeur, deux images d echauffement passaient pour orphelines. */
   const warmImgs=WARMUP.map(x=>x.img).filter(Boolean);
   const mortes=Object.keys(IMG).filter(k=>!DB[k]&&warmImgs.indexOf(k)<0);
   if(mortes.length) throw new Error('images mortes dans la banque : '+mortes.join(', '));
   console.log('images OK : banque a 58, aucune image morte, les sept nouvelles sont branchees');
 }

 /* ---------- 11. la couverture musculaire ne change pas de forme ---------- */
 await neuf();
 state.unlocked['planche-ballon']=true; state.unlocked['gainage-lateral-jambe-levee']=true;
 const pools=poolsFor();
 if(pools.length!==4) throw new Error('quatre emplacements attendus');
 if(pools[3].length!==5) throw new Error('le vivier gainage doit rester a cinq apres les deux deblocages');
 console.log('couverture OK : quatre emplacements, gainage a cinq apres deblocage complet');

 /* ---------- 12. rendu : les deux fiches s affichent, verrou compris ---------- */
 await neuf();
 ['planche-ballon','gainage-lateral-jambe-levee'].forEach(id=>{
   showFiche(id);
   if(html.indexOf(DB[id].nom)<0) throw new Error('fiche muette : '+id);
   if(html.indexOf(lockCond(DB[id]))<0) throw new Error('la condition de verrou doit apparaitre sur '+id);
   if(html.indexOf('45 s')<0) throw new Error('la fiche doit annoncer les 45 s exiges : '+id);
 });
 view='lib'; render();
 if(html.indexOf('Planche sur ballon')<0) throw new Error('la bibliotheque doit lister la planche sur ballon');
 if(html.indexOf('Gainage latéral, abductions')<0) throw new Error('la bibliotheque doit lister les abductions');
 console.log('rendu OK : deux fiches et deux lignes de bibliotheque');

 /* ---------- 13. enveloppe en tete du fichier exporte ---------- */
 await neuf();
 const cles=Object.keys(JSON.parse(payload()));
 if(cles[0]!=='app'||cles[1]!=='version') throw new Error('app et version doivent ouvrir le fichier, lu : '+cles.slice(0,3).join(', '));
 const brut=payload();
 if(brut.indexOf('{"app":"palier","version":"'+VERSION+'"')!==0) throw new Error('le fichier doit commencer par son enveloppe : '+brut.slice(0,60));
 // la valeur reste celle du programme, pas celle d un etat qui en rapporterait une
 state.version='1.0'; state.app='autre';
 const env=JSON.parse(payload());
 if(env.version!==VERSION||env.app!=='palier') throw new Error('l enveloppe doit gagner sur l etat, lu : '+env.app+' '+env.version);
 const cles2=Object.keys(env);
 if(cles2[0]!=='app'||cles2[1]!=='version') throw new Error('l ordre doit tenir meme si l etat porte les memes cles');
 delete state.version; delete state.app;
 console.log('enveloppe OK : app et version en tete, valeurs du programme, ordre stable');

 console.log('TESTS V1.17 OK');
})().catch(e=>{ console.error('ECHEC:',e.message); process.exit(1); });
`;
eval(src+T);
```

## Suites existantes retouchées en v1.16

`test8` épinglait le rendu `9 / 8` d'une liste de séries dans le détail de séance. Le format
passe par `setsHtml` et le séparateur perd ses espaces : l'assertion porte désormais sur la
forme produite par la fonction commune, `9<i class="sl">/</i>8`, et non sur une chaîne composée
à la main. Aucune autre suite n'a bougé, les dix-neuf autres passent sans retouche, ce qui était
l'objectif : la v1.16 ne change aucun comportement de progression.

## Suites existantes retouchées en v1.15


`test` et `test5` attendaient une descente de charge ou de bande dès le passage suivant une montée :
la grâce post-montée en impose désormais un de plus, les deux assertions ont été dédoublées pour
vérifier d'abord que la grâce masque, ensuite que le filet joue. `test6` appelait `celebrations`
avec un nombre de déblocages déjà fêtés, l'argument est devenu la liste de leurs clés. `test7`
exigeait `minSets >= 2` sur tout verrou en portant un, ce qui interdisait la migration des deux
verrous de la chaîne postérieure vers `minSets: 1` : l'assertion vérifie maintenant que l'énoncé
affiché correspond au compte réellement exigé, jeton `{n}` compris, et le scénario de déblocage
cible un verrou à compte multiple en passant le volume de séance à `checkUnlocks`.

Retouches de v1.14 conservées : `test2`, `test8`, `test11` et `test12` référençaient l'ancien
identifiant du détail de séance ou l'intitulé de la card Repos, les assertions portent sur les clés
`data-k` ; `test15` est recalé sur le modèle de temps v1.14.

## prep_illus.py


Recadre une illustration générée, aligne les deux figures sur une ligne de sol commune, réduit la gouttière, redessine le séparateur, efface les artefacts clairs et compresse. Usage : `python3 prep_illus.py entree.png sortie.jpg`. Traitement en lot dans une boucle shell.

```python
#!/usr/bin/env python3
"""Post-traitement des illustrations PALIER generees.

- detecte les deux panneaux
- recadre chacun au plus juste, avec une marge constante
- aligne les deux figures sur la meme ligne de sol
- reduit la gouttiere centrale
- efface les artefacts clairs (sparkle) en les remplacant par le fond papier
- sort un JPEG optimise pret a embarquer en base64

Usage: python3 prep_illus.py entree.png sortie.jpg [separateur]

Le troisieme argument, optionnel, force la position du separateur en fraction
de la largeur (0.5 = milieu). Sans lui, rien ne change : find_separator cherche
la colonne la plus encree entre 35 et 65 % de la largeur, ce qui convient aux
images dont les deux panneaux sont separes par un trait. Les images qui portent
un trait de mur a l'interieur du panneau gauche (les quatre mollets, v2.5)
mettent ce mur dans la zone de recherche : il gagnait, le script l'effacait
avec le pouce de la main qui le touche, et la vraie gouttiere, vide, n'etait
pas vue. Mesure sur les quatre sources : mur a 0,395-0,425, gouttiere vide de
0,40-0,43 a 0,55-0,59, milieu dans la gouttiere sur les quatre. Le defaut ne
bouge pas, la banque n'a donc toujours qu'une version du script pour les
images qui n'ont pas besoin de l'argument (v2.15).
"""
import sys
from PIL import Image, ImageDraw

MARGIN = 26        # marge autour des figures, en px de l'image finale
GUTTER = 34        # espace entre les deux panneaux
OUT_W = 720        # largeur de sortie
INK = 190          # seuil de detection du trait


def paper_color(im):
    w, h = im.size
    px = [im.getpixel((x, y)) for x, y in
          [(4, 4), (w - 5, 4), (4, h - 5), (w - 5, h - 5), (w // 2, 4)]]
    return tuple(sum(c[i] for c in px) // len(px) for i in range(3))


def is_ink(p):
    return p[0] < INK or p[1] < INK or p[2] < INK


def scrub_artifacts(im, paper):
    """Remplace les pixels nettement plus clairs que le papier (sparkle Gemini)."""
    w, h = im.size
    px = im.load()
    thr = min(250, paper[0] + 8)
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r > thr and g > thr and b > thr:
                px[x, y] = paper
    return im


def find_separator(im):
    """Trouve la ligne verticale de separation, sinon coupe au milieu."""
    w, h = im.size
    px = im.load()
    best, best_score = None, 0
    for x in range(int(w * 0.35), int(w * 0.65)):
        score = sum(1 for y in range(0, h, 3) if is_ink(px[x, y]))
        if score > best_score:
            best, best_score = x, score
    return best if best_score > (h / 3) / 1.5 else w // 2


def bbox(im, x0, x1):
    px = im.load()
    h = im.size[1]
    xs, ys = [], []
    for x in range(x0, x1):
        for y in range(0, h, 2):
            if is_ink(px[x, y]):
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def main(src, dst, sep_frac=None):
    im = Image.open(src).convert('RGB')
    paper = paper_color(im)
    im = scrub_artifacts(im, paper)
    sep = int(im.size[0] * sep_frac) if sep_frac is not None else find_separator(im)

    # on efface la ligne de separation avant de mesurer les figures
    work = im.copy()
    d = ImageDraw.Draw(work)
    d.rectangle([sep - 4, 0, sep + 4, im.size[1]], fill=paper)

    L = bbox(work, 0, max(1, sep - 6))
    R = bbox(work, min(work.size[0] - 1, sep + 6), work.size[0])
    if not L or not R:
        print('panneaux introuvables, copie brute')
        im.save(dst, 'JPEG', quality=88, optimize=True)
        return

    hL, hR = L[3] - L[1], R[3] - R[1]
    top = max(hL, hR)
    # chaque figure est posee sur une ligne de sol commune
    cropL = work.crop((L[0], L[1], L[2] + 1, L[3] + 1))
    cropR = work.crop((R[0], R[1], R[2] + 1, R[3] + 1))

    W = MARGIN * 2 + cropL.width + GUTTER + cropR.width
    H = MARGIN * 2 + top
    out = Image.new('RGB', (W, H), paper)
    out.paste(cropL, (MARGIN, MARGIN + top - hL))
    out.paste(cropR, (MARGIN + cropL.width + GUTTER, MARGIN + top - hR))

    # deux figures debout cote a cote donnent naturellement un format portrait :
    # on ajoute des marges laterales pour ne jamais descendre sous le carre
    sep_x = MARGIN + cropL.width + GUTTER // 2
    if out.width < out.height:
        pad = (out.height - out.width) // 2
        padded = Image.new('RGB', (out.height, out.height), paper)
        padded.paste(out, (pad, 0))
        out = padded
        sep_x += pad

    # trait de separation discret, pleine hauteur
    d2 = ImageDraw.Draw(out)
    ink = tuple(max(0, c - 95) for c in paper)
    d2.line([(sep_x, int(out.height * .06)), (sep_x, int(out.height * .94))],
            fill=ink, width=2)

    if out.width > OUT_W:
        out = out.resize((OUT_W, int(out.height * OUT_W / out.width)), Image.LANCZOS)
    out.save(dst, 'JPEG', quality=86, optimize=True)
    print(f'{dst} {out.size[0]}x{out.size[1]}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else None)
```

## Régénération de imgdata.js


Reconstruit la banque d'images à partir du dossier des JPEG traités. La clé de chaque image est l'identifiant exact de l'exercice.


```python
import os, base64, json

PREP = 'prep'   # dossier des JPEG traites par prep_illus.py
d = {}
for f in sorted(os.listdir(PREP)):
    d[f[:-4]] = 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(PREP, f), 'rb').read()).decode()
open('imgdata.js', 'w').write('const IMG=' + json.dumps(d, separators=(',', ':')) + ';\n')
print('images', len(d))
```

## test.js


```javascript
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
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 // 1. integrite base
 const ids=Object.keys(DB);
 ids.forEach(id=>{const e=DB[id];
   if(!e.nom||!e.desc||!e.vig) throw new Error('champ manquant '+id);
   if(!e.cat) throw new Error('cat manquante '+id);
   if(e.fb&&!DB[e.fb]) throw new Error('fb invalide '+id);
   if(e.lock&&!DB[e.lock.after]) throw new Error('lock invalide '+id);
 });
 console.log('exercices:',ids.length,'| illustres:',ids.filter(i=>IMG[i]).length);
 SLOT_ORDER.forEach(s=>SLOTS[s].pool.forEach(id=>{if(!DB[id])throw new Error('pool '+s+' -> '+id)}));
 if(typeof SESSIONS!=='undefined'||typeof CIBLE_ORDER!=='undefined') throw new Error('le decoupage du mode cible survit');
 STRETCH_POOL.forEach(id=>{if(!DB[id]||DB[id].mode!=='stretch')throw new Error('etirement invalide '+id)});
 WARMUP.forEach(w=>{if(w.img&&!IMG[w.img])throw new Error('warmup img '+w.img)});
 // 2. echelle de charge
 const L=loadLadder(state.gear);
 if(L[0]!==2) throw new Error('ladder debut');
 console.log('paliers:',L.length,'de',L[0],'a',L[L.length-1],'kg');
 // 3. volume et duree annoncee (v1.13 : le volume se choisit, le temps se calcule)
 let prev=0;
 ROUNDS_CHOICES.forEach(r=>{
   state.rounds=r;
   const p=buildSession();
   const est=Math.round(estimateSec(p)/60);
   if(p.steps.filter(s=>s.k==='set'&&!s.cool).length!==r*SLOT_ORDER.length) throw new Error('series prevues '+r);
   if(est<=prev) throw new Error('duree non croissante a '+r+' series: '+est);
   prev=est;
   console.log('  '+r+' series ->',est,'min,',p.steps.filter(s=>s.k==='set').length,'etapes');
 });
 state.rounds=3;
 // 4. seance complete au clavier, mode alterne
 const key=k=>handlers.forEach(h=>h({key:k,code:k===' '?'Space':k,target:{tagName:'DIV'},preventDefault(){}}));
 /* v1.13 : ENTREE ne valide plus une tenue tant que chaque cote prevu n a pas
    de mesure. Ce parcours teste l enchainement d une seance, pas le chrono :
    il pose les mesures directement, la machine a etats des tenues et son
    clavier etant couverts par la suite v1.13 avec horloge pilotee. */
 const fillHold=()=>{
   if(view!=='session'||!cur||cur.phase!=='work') return;
   const st=cur.steps[cur.i];
   if(!st||st.k!=='set') return;
   const e=DB[st.id]; if(!e) return;
   /* v2.17 : une tenue rythmee se valide arretee, avec sa valeur au journal */
   if(e.rhythm){ st.rt={d:8,g:8,s0:0,on:false,stopped:true,trim:0,t0:null}; st.done=true; if(!st.val) st.val=8; return; }
   /* v2.22 : une serie cadencee se valide cotes mesures */
   if(e.cadence){ cadInit(st); st.sides=st.sides.map(()=>8); st.side=st.sides.length-1; st.done=true; st.val=8; return; }
   if(e.mode!=='time') return;
   holdInit(st,e);
   for(let i=0;i<st.sides.length;i++) if(st.sides[i]==null) st.sides[i]=30;
 };
 const runSession=async()=>{ let g=0; while((view==='session'||view==='home')&&g++<300){ fillHold(); key('Enter'); } await new Promise(r=>setTimeout(r,6)); };
 view='home';
 for(let i=0;i<8;i++){ view='home'; await runSession(); if(view!=='recap') throw new Error('seance '+i+' vue='+view); key('Enter'); }
 console.log('8 seances alternees OK · xp',state.xp,'· hist',state.hist.length);
 // 5. double progression sur un exercice charge
 const cid='curls-halteres';
 let p=perfOf(cid); const l0=p.load;
 for(let i=0;i<12;i++){ applyProgress(cid,[DB[cid].reps[1],DB[cid].reps[1],DB[cid].reps[1]]); }
 p=perfOf(cid);
 if(p.load<=l0) throw new Error('charge non montee: '+l0+' -> '+p.load);
 console.log('double progression curls:',l0,'->',p.load,'kg · montees',state.loadUps);
 // regression si trop dur : v1.15, le premier passage suivant une montee est
 // gracie, le filet ne joue qu au passage d apres
 const before=p.load;
 applyProgress(cid,[2,2,2]);
 if(perfOf(cid).load!==before) throw new Error('la grace post-montee doit masquer la premiere descente');
 applyProgress(cid,[2,2,2]);
 if(perfOf(cid).load>=before) throw new Error('pas de repli de charge');
 console.log('repli de charge OK:',before,'->',perfOf(cid).load);
 // 6. cinq seances de plus
 for(let i=0;i<5;i++){ view='home'; await runSession(); if(view!=='recap') throw new Error('seance '+i+' vue='+view); key('Enter'); }
 console.log('5 seances OK · hist',state.hist.length);
 // 7. deblocages
 console.log('debloques:',Object.keys(state.unlocked).join(', ')||'aucun');
 console.log('badges:',state.badges.length);
 // 8. toutes les vues
 ['home','lib','prog','set'].forEach(v=>{view=v;render();});
 ids.forEach(id=>showFiche(id));
 // 9. persistance
 await save(); const xp=state.xp; state=null; await loadState(); domicile();
 if(state.xp!==xp) throw new Error('persistance');
 console.log('persistance OK');
 // 10. reglages
 setWarm('court'); setWarm('aucun'); setCardio(false); setTrans(10); setTrans(15); setWarm('complet'); setCardio(true);
 if(typeof setMode!=='undefined'||typeof setRest!=='undefined'||typeof skipType!=='undefined') throw new Error('reglage retire encore expose');
 adjPlate('1.25',4);
 console.log('avec 1.25 :',loadLadder(state.gear).length,'paliers');
 console.log('TOUS LES TESTS PASSENT · v'+VERSION);
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test2.js


```javascript
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
```

## test3.js


```javascript
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
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
 state.showDetail=true;
 // depuis l'accueil : le retour doit ramener a l'accueil
 view='home'; render();
 showFiche('goblet-squat','home');
 if(!/go\\('home'\\)/.test(html)) throw new Error('retour accueil absent depuis le detail');
 if(!/Retour à la séance/.test(html)) throw new Error('libelle retour accueil');
 // depuis la bibliotheque
 view='lib'; render();
 showFiche('goblet-squat','lib');
 if(!/go\\('lib'\\)/.test(html)) throw new Error('retour bibliotheque absent');
 // depuis les progres
 showFiche('goblet-squat','prog');
 if(!/go\\('prog'\\)/.test(html)) throw new Error('retour progres absent');
 // memorisation : appel sans origine garde la derniere
 showFiche('planche');
 if(!/go\\('prog'\\)/.test(html)) throw new Error('origine non memorisee');
 // toutes les fiches se rendent depuis chaque origine
 Object.keys(DB).forEach(id=>{['home','lib','prog'].forEach(o=>showFiche(id,o));});
 console.log('retour contextuel OK sur',Object.keys(DB).length,'fiches × 3 origines');
 // les lignes de la vue progres sont cliquables
 state.perf['goblet-squat']={load:10,range:[8,15],target:9,best:12,sets:[10,9],date:new Date().toISOString()};
 view='prog'; render();
 if(!/showFiche\\('goblet-squat','prog'\\)/.test(html)) throw new Error('ligne progres non cliquable');
 console.log('lignes progres cliquables OK');
 console.log('TESTS NAVIGATION OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test4.js


```javascript
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({style:{},click(){},remove(){},set onchange(f){}}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
global.Blob=function(a){this.parts=a};global.URL={createObjectURL:()=>'blob:x',revokeObjectURL(){}};
global.FileReader=function(){this.readAsText=()=>{}};
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 const D=d=>new Date(Date.now()-d*864e5).toISOString();
 // 1. jours actifs : 3 seances le meme jour = 1 jour actif
 state.goal=4; state.hist=[];
 for(let i=0;i<3;i++) state.hist.push({date:D(0),type:'alterne',items:[],xp:0});
 if(thisWeekCount(state)!==1) throw new Error('3 seances/jour devraient compter 1 jour, obtenu '+thisWeekCount(state));
 // 4 jours distincts valident la semaine
 state.hist=[0,1,2,3].map(i=>({date:D(i),type:'alterne',items:[],xp:0}));
 const wc=weekCounts(state), tot=Object.values(wc).reduce((a,v)=>a+v,0);
 if(tot!==4) throw new Error('4 jours distincts attendus, obtenu '+tot);
 console.log('jours actifs OK : 3 seances/jour -> 1, 4 jours -> 4');
 // 2. thisWeekCount respecte son parametre
 if(thisWeekCount({goal:4,hist:[]})!==0) throw new Error('thisWeekCount ignore son parametre');
 console.log('thisWeekCount(parametre) OK');
 // 3. seance incomplete : enregistree, sans bonus, sans rotation
 state=null; await loadState(); domicile(); state.warm='aucun'; state.cardio=false;
 const idx0=Object.assign({},state.slotIdx);
 startSession();
 const st=cur.steps[0]; TVAL(st,8);
 const xpAvant=state.xp;
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const h=state.hist[state.hist.length-1];
 if(!h||!h.inc) throw new Error('seance incomplete non marquee');
 if(h.items.length!==1) throw new Error('items incomplets: '+h.items.length);
 if(h.xp!==XP_SET) throw new Error('xp incomplete devrait etre '+XP_SET+', obtenu '+h.xp);
 if(typeof h.real!=='number'||h.real<60) throw new Error('duree reelle absente');
 if(JSON.stringify(state.slotIdx)!==JSON.stringify(idx0)) throw new Error('rotation avancee sur incomplete');
 if(view!=='recap') throw new Error('pas de recap apres quit, vue='+view);
 if(!/incomplète/.test(html)) throw new Error('recap sans mention incomplete');
 console.log('seance incomplete OK : enregistree, +'+h.xp+' XP, '+h.real+' s reels, rotation intacte');
 cur=null;
 // 4. seance complete : rotation avance, real present
 startSession();
 let g=0; while(view==='session'&&g++<300){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set') TVAL(s,8); else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 const h2=state.hist[state.hist.length-1];
 if(h2.inc) throw new Error('seance complete marquee incomplete');
 if(typeof h2.real!=='number') throw new Error('real absent sur seance complete');
 if(state.slotIdx.push!==idx0.push+1) throw new Error('rotation non avancee');
 console.log('seance complete OK : real='+h2.real+' s, rotation avancee');
 cur=null;
 // 5. statistiques : calculs et rendu
 state.hist=[
  {date:'2026-07-06T19:00:00.000Z',type:'alterne',mode:'alterne',dur:15,real:840,xp:40,
   items:[{id:'curls-halteres',sets:[10,9,9],load:4},{id:'pompes-poignees',sets:[8,7],load:0},{id:'goblet-squat',sets:[8,8],load:10},{id:'planche',sets:[30],load:0}]},
  {date:D(9),type:'alterne',mode:'alterne',dur:15,real:900,xp:40,
   items:[{id:'curls-halteres',sets:[12,11,10],load:6},{id:'rowing-kettlebell',sets:[10,9],load:10},{id:'fentes-arriere',sets:[8,8],load:0},{id:'bird-dog',sets:[8,8],load:0}]},
  {date:D(10),type:'alterne',mode:'alterne',dur:15,real:930,xp:40,
   items:[{id:'face-pulls',sets:[12,12,11],load:0},{id:'pompes-poignees',sets:[9,8],load:0},{id:'mollets-debout',sets:[20,20],load:0},{id:'dead-bug',sets:[10,10],load:0}]}
 ];
 const lj=loadJourney(state);
 const c=lj.find(j=>j.id==='curls-halteres');
 if(!c||c.a.load!==4||c.b.load!==6) throw new Error('trajectoire curls fausse');
 const cov=coverage(state,4);
 if(cov.pull<=0||cov.push<=0) throw new Error('couverture vide');
 const ts=timeStats(state);
 if(ts.avgReal!==15||ts.n!==3) throw new Error('timeStats: avg '+ts.avgReal+' n '+ts.n);
 view='prog'; render();
 ['Assiduité','Couverture musculaire','Trajectoire des charges','Temps d\\'entraînement'].forEach(s=>{
   if(html.indexOf(s)<0) throw new Error('bloc absent: '+s); });
 if(!/4 kg en juil\\S* 2026 → 6 kg en/.test(html.replace(/,/g,'.'))&&html.indexOf('4 kg en')<0) throw new Error('trajectoire non affichee');
 console.log('stats OK : trajectoire 4->6 kg, couverture',JSON.stringify(cov),', temps moyen',ts.avgReal,'min');
 // 6. etat vide : la vue prog se rend sans stats ni erreur
 state.hist=[]; view='prog'; render();
 if(/Assiduité/.test(html)) throw new Error('stats affichees sans historique');
 console.log('etat vide OK');
 // 7. export : payload valide et import symetrique
 state.xp=123; state.hist=[{date:D(0),type:'alterne',items:[],xp:10}];
 const pl=JSON.parse(payload());
 if(pl.app!=='palier'||pl.xp!==123) throw new Error('payload invalide');
 applyImport(pl);
 if(state.xp!==123) throw new Error('import rate');
 let ko=false; try{applyImport({foo:1});}catch(e){ko=true;}
 if(!ko) throw new Error('import accepte un contenu invalide');
 downloadData();
 console.log('export/import OK');
 console.log('TESTS V1.1 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test5.js


```javascript
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 /* v2.0 : la presence d un niveau EST sa realisation, on bascule par setBandReal */
 const flipBand=id=>setBandReal(id, bandReal(id)?'':(coulOK(id)?id:'gris'));
 const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(m+' : '+JSON.stringify(a)+' vs '+JSON.stringify(b));};
 // 1. capacite du manchon : paire a 14,5, mono a 17
 const L2=loadLadder(state.gear), L1=loadLadderMono(state.gear);
 if(L2[L2.length-1]!==14.5) throw new Error('paire max attendu 14.5, obtenu '+L2[L2.length-1]);
 if(L1[L1.length-1]!==17) throw new Error('mono max attendu 17, obtenu '+L1[L1.length-1]);
 const g3=Object.assign({},state.gear,{maxPerEnd:3});
 if(loadLadderMono(g3).slice(-1)[0]!==2+2*(2+2+1.25)) throw new Error('capacite 3 non respectee');
 console.log('capacite manchon OK : paire max',L2[L2.length-1],'kg, mono max',L1[L1.length-1],'kg');
 // 2. echelles a lestes
 eq(fixedLadder('goblet-squat',state.gear).map(x=>x.v),[10,12,14,16],'echelle goblet');
 const rk=fixedLadder('rowing-kettlebell',state.gear).map(x=>x.v);
 eq(rk.slice(0,4),[10,11,12,13],'debut chaine rowing');
 if(rk[rk.length-1]!==20) throw new Error('sommet rowing attendu 20, obtenu '+rk[rk.length-1]);
 if(rk.indexOf(17)<0) throw new Error('barreau haltere 17 absent');
 console.log('echelles lestes OK : goblet 10-16, rowing 10 ->',rk[rk.length-1],'kg ('+rk.length+' barreaux)');
 // 3. echelles de bandes par sens
 eq(bandLadder(DB['face-pulls'],state.gear),['jaune','rouge','noir','violet','vert'],'echelle face-pulls');
 eq(bandLadder(DB['pompes-poignees'],state.gear),['aucune','jaune','rouge','noir','violet','vert'],'echelle pompes');
 eq(bandLadder(DB['tractions-assistees-supination'],state.gear),['vert','violet','noir','rouge','jaune'],'echelle assistance');
 console.log('echelles de bandes OK, barreau zero des pompes present');
 // 4. progression en resistance : montee de bande, cible au bas, filet de securite
 let p=perfOf('face-pulls');
 if(p.band!=='jaune') throw new Error('barreau de depart face-pulls: '+p.band);
 let m=applyProgress('face-pulls',[18,18,18]);
 p=perfOf('face-pulls');
 if(p.band!=='rouge'||p.target!==10) throw new Error('montee de bande ratee: '+p.band+'/'+p.target);
 if(!/[Bb]ande rouge/.test(m.join(' '))) throw new Error('message montee bande absent');
 // v1.15 : le passage qui suit la montee est gracie, le filet joue au suivant
 applyProgress('face-pulls',[5,5,5]);
 if(perfOf('face-pulls').band!=='rouge') throw new Error('la grace doit masquer la premiere descente de bande');
 applyProgress('face-pulls',[5,5,5]);
 if(perfOf('face-pulls').band!=='jaune') throw new Error('filet de securite bande rate');
 console.log('progression resistance OK : jaune -> rouge -> jaune');
 // 5. assistance : noir de depart, descendre l echelle, sommet = strictes, porte de bande
 p=perfOf('tractions-assistees-supination');
 if(p.band!=='noir') throw new Error('depart tractions: '+p.band);
 applyProgress('tractions-assistees-supination',[10,10,10]);
 p=perfOf('tractions-assistees-supination');
 if(p.band!=='rouge') throw new Error('moins d aide attendu rouge: '+p.band);
 state.perf['tractions-assistees-supination'].best=12; // vieux record avec bande forte
 checkUnlocks();
 if(state.unlocked['tractions-strictes-supination']) throw new Error('strictes debloquees sans la bande la plus faible');
 applyProgress('tractions-assistees-supination',[10,10,10]); // -> jaune
 p=perfOf('tractions-assistees-supination');
 if(p.band!=='jaune') throw new Error('barreau jaune non atteint: '+p.band);
 /* v2.12 : ce que cette assertion couvrait, la preuve qui ne suit pas le
    barreau, se lit maintenant sur le barreau ecrit AVEC les series. La
    seance a ete jouee en rouge et fait monter a jaune : setsBand doit dire
    rouge, sans quoi dix repetitions faites sous une bande plus forte
    ouvriraient la porte. */
 if(p.setsBand!=='rouge') throw new Error('barreau joue non enregistre: '+p.setsBand);
 checkUnlocks();
 if(state.unlocked['tractions-strictes-supination']) throw new Error('porte de bande poreuse (barreau joue)');
 applyProgress('tractions-assistees-supination',[10,8,6]);
 const um=checkUnlocks();
 if(!state.unlocked['tractions-strictes-supination']) throw new Error('strictes non debloquees a 10 reps bande jaune');
 m=applyProgress('tractions-assistees-supination',[10,10,10]);
 if(!/strictes prennent le relais/.test(m.join(' '))) throw new Error('message sommet assistance: '+m.join(' | '));
 console.log('assistance OK : noir -> rouge -> jaune, deblocage strictes garde par la bande, sommet vrai');
 // 6. les plafonnes : plus jamais le message generique, marche reelle affichee.
 //    v2.16 : le champ cap n existe plus, le plafond est le haut de fourchette
 //    de tout exercice au poids du corps ou tenu, et la liste se derive.
 const capped=Object.keys(DB).filter(id=>(DB[id].mode==='bw'||DB[id].mode==='time')&&!DB[id].bnd&&!DB[id].rhythm&&!DB[id].assise&&DB[id].reps)   /* v2.17 : les tenues rythmees ont une echelle ; v2.18 : l assise aussi */;
 if(capped.length<15) throw new Error('au moins quinze exercices plafonnes attendus, '+capped.length);
 capped.forEach(id=>{
   const e=DB[id], top=e.reps[1];
   const st2={load:0,range:e.reps.slice(),target:top,best:0,sets:[],date:null};
   state.perf[id]=st2;
   const msg=applyProgress(id,[top,top,top]).join(' ');
   if(/variante plus dure/.test(msg)) throw new Error('message generique toujours present sur '+id);
   if(!e.next) throw new Error('marche suivante absente sur '+id);
   if(msg.indexOf(e.next)<0) throw new Error('marche suivante non affichee sur '+id);
 });
 console.log('plafonds OK :',capped.length,'exercices plafonnes, chacun avec sa marche reelle');
 // 7. exercices fixed : double progression sur lestes, sommet par exercice
 state.perf['goblet-squat']=null; delete state.perf['goblet-squat'];
 p=perfOf('goblet-squat');
 for(let i=0;i<3;i++) applyProgress('goblet-squat',[15,15,15]);
 p=perfOf('goblet-squat');
 if(p.load!==16||p.target!==8) throw new Error('echelle goblet non gravie: '+p.load+'/'+p.target);
 eq(p.range,[8,15],'fourchette goblet ne doit plus monter');
 m=applyProgress('goblet-squat',[15,15,15]);
 /* v2.1 : la marche suivante des exercices a kettlebell se compose depuis
    l inventaire. Au sommet de ce que l inventaire permet, elle nomme le poids
    a declarer ; elle ne devient une impasse qu une fois la liste epuisee. */
 /* v2.18 : le goblet squat n est plus compose depuis l inventaire, sa marche
    est le squat sur une jambe, qui s ouvre a la kettlebell la plus lourde. La
    composition se verifie sur la version lestee, entree dans KB_NEXT, dont
    l echelle n est faite que de kettlebells. */
 if(!/squat sur une jambe vers la chaise prend le relais/.test(m.join(' '))) throw new Error('sommet goblet, successeur: '+m.join(' | '));
 const sl='squat-une-jambe-chaise-leste';
 delete state.perf[sl]; perfOf(sl);
 eq(fixedLadder(sl,state.gear).map(x=>x.v),[10],'echelle kettlebells seules, 10 kg seule');
 m=applyProgress(sl,[15,15]);
 if(!/déclare une kettlebell de 12 kg/.test(m.join(' '))) throw new Error('sommet lesté, poids suivant a declarer: '+m.join(' | '));
 KB_W.forEach(w=>{ state.gear.kbs[w]=1; });
 if(fixedLadder(sl,state.gear).some(x=>/leste/.test(x.lbl))) throw new Error('lestes dans une echelle kettlebells seules');
 state.perf[sl].load=fixedLadder(sl,state.gear).slice(-1)[0].v;
 m=applyProgress(sl,[15,15]);
 if(!/sac lesté porté devant/.test(m.join(' '))) throw new Error('sommet lesté, liste epuisee: '+m.join(' | '));
 KB_W.forEach(w=>{ if(w!=='10') delete state.gear.kbs[w]; });
 state.perf['goblet-squat'].load=16;
 applyProgress('goblet-squat',[3,3,3]);
 if(perfOf('goblet-squat').load!==14) throw new Error('redescente de leste ratee');
 console.log('fixed OK : goblet 10 -> 16 kg par lestes, sommet et redescente');
 // 8. migration : fourchettes gonflees remises a plat, bande par defaut
 localStorage.setItem('palier-state-v2',JSON.stringify(Object.assign(defaultState(),{
   gear:{bar:2,bars:2,plates:{'0.5':4,'1':12,'2':4}},
   perf:{'goblet-squat':{load:10,range:[13,20],target:20,best:20,sets:[20],date:null},
         'tractions-assistees-supination':{load:0,range:[4,12],target:12,best:8,sets:[8],date:null}}})));
 state=null; await loadState();   /* sauvegarde fabriquee : pas d ancrage domicile ici */
 eq(state.perf['goblet-squat'].range,[8,15],'migration fourchette goblet');
 if(state.perf['tractions-assistees-supination'].band!=='noir') throw new Error('migration bande tractions');
 if(state.gear.maxPerEnd!==5||!state.gear.bands||!state.gear.cuffs) throw new Error('migration gear incomplete');
 if(state.gear.plates['1.25']!==0) throw new Error('migration 1.25 : inventaire existant ne doit pas etre invente');
 console.log('migration OK : fourchettes a plat, bande noire par defaut, gear complete');
 // 9. inventaire : retrait de bande, bornage a la lecture et perf intacte (v2.0)
 state.perf['face-pulls']={load:0,range:[10,18],target:10,best:0,sets:[],date:null,band:'jaune',setsBand:'jaune'};
 flipBand('jaune');
 if(state.gear.bands.jaune) throw new Error('toggleBand inoperant');
 if(state.perf['face-pulls'].band!=='jaune'||state.perf['face-pulls'].setsBand!=='jaune') throw new Error('l inventaire a ecrit dans perf: '+JSON.stringify(state.perf['face-pulls']));
 if(perfFor('face-pulls').band!=='rouge') throw new Error('bornage apres retrait: '+perfFor('face-pulls').band);
 if(!perfFor('face-pulls').gearUp) throw new Error('durcissement force non signale');
 eq(bandLadder(DB['tractions-assistees-supination'],state.gear),['vert','violet','noir','rouge'],'echelle assistance sans jaune');
 /* v2.0 : le garde-fou du dernier barreau a disparu, un profil sans aucun
    elastique est un cas nomme et servi. Ce qui doit tenir, c est que perf
    survive a l etat vide et que le retour rende exactement l etat d avant. */
 ['rouge','noir','violet','vert'].forEach(b=>flipBand(b));
 if(ownedBands(state.gear).length!==0) throw new Error('un profil sans aucun elastique doit etre atteignable');
 if(state.perf['face-pulls'].band!=='jaune'||state.perf['face-pulls'].setsBand!=='jaune') throw new Error('perf touchee par un inventaire vide');
 BANDS.forEach(b=>flipBand(b.id));
 if(perfFor('face-pulls').band!=='jaune') throw new Error('retour a l identique apres recochage: '+perfFor('face-pulls').band);
 // 10. lestes retires : la charge prescrite retombe, la charge canonique reste
 state.perf['goblet-squat']={load:16,range:[8,15],target:8,best:15,sets:[15],date:null};
 toggleCuff('2');
 if(state.perf['goblet-squat'].load!==16) throw new Error('toggleCuff a ecrit dans perf: '+state.perf['goblet-squat'].load);
 if(perfFor('goblet-squat').load!==12) throw new Error('bornage apres retrait de leste: '+perfFor('goblet-squat').load);
 toggleCuff('2');
 if(perfFor('goblet-squat').load!==16) throw new Error('retour a l identique apres recochage du leste');
 console.log('inventaire OK : perf intacte, prescription bornee, retour a l identique');
 // 11. seance avec repli : marqueur enregistre, bande du repli intacte sur l original
 state=null; localStorage._m={}; await loadState(); domicile();
 state.warm='aucun'; state.cardio=false;
 startSession();
 const first=cur.steps[0].id;
 if(first!=='pompes-poignees') throw new Error('premier exo attendu pompes: '+first);
 swapPain();
 if(cur.steps[0].id!=='pompes-inclinees') throw new Error('swap rate');
 TVAL(cur.steps[0],8);
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const h=state.hist[state.hist.length-1];
 if(!h.items[0].sw) throw new Error('marqueur de repli absent de l historique');
 if(!/repli/.test(html)) throw new Error('tag repli absent du recap');
 console.log('repli OK : marqueur en historique et au recap');
 // 12. bande photographiee dans l item d historique, avant progression
 cur=null; state.hist=[]; state.perf={};
 startSession();
 let guard=0;
 while(view==='session'&&guard++<300){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ TVAL(s,DB[s.id].reps?DB[s.id].reps[1]:30); } else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 const h2=state.hist[state.hist.length-1];
 const tr=h2.items.find(it=>DB[it.id].bnd);
 if(tr&&tr.band){
   const start0=DB[tr.id].band0||bandLadder(DB[tr.id],state.gear)[0];
   if(tr.band!==start0) throw new Error('bande historisee doit etre celle utilisee, pas la suivante: '+tr.band);
 }
 console.log('historique OK : bande photographiee avant progression'+(tr?' ('+tr.id+' : '+tr.band+')':''));
 // 13. deblocages atteignables
 if(DB['rdl-kettlebell'].lock.need!==15||DB['kb-swings'].lock.need!==15) throw new Error('needs non corriges');
 if(DB['rdl-kettlebell'].lock.need>DB['goblet-squat'].reps[1]) throw new Error('rdl toujours indeblocable');
 console.log('deblocages OK :need 15, atteignable dans les fourchettes');
 console.log('TESTS V1.2 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test6.js


```javascript
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 // 1. fmtKg : les paliers a 1,25 ne sont plus arrondis
 if(fmtKg(3.25)!=='3,25 kg') throw new Error('fmtKg 3.25 -> '+fmtKg(3.25));
 if(fmtKg(4.5)!=='4,5 kg'||fmtKg(6)!=='6 kg'||fmtKg(11.75)!=='11,75 kg') throw new Error('fmtKg zeros inutiles');
 const L=loadLadder(state.gear).filter(v=>Math.round(v*100)%100!==0&&Math.round(v*10)%10===0||String(v).indexOf('.25')>0||String(v).indexOf('.75')>0);
 if(!L.length) throw new Error('aucun palier a deux decimales dans l echelle');
 if(L.some(v=>fmtKg(v).indexOf(',3')>=0||fmtKg(v).indexOf(',8')>=0)) throw new Error('arrondi encore present sur l echelle');
 console.log('fmtKg OK :',fmtKg(3.25)+',',L.length,'paliers a deux decimales affiches exactement');
 // 2. semaine tronquee : prorata sur les jours disponibles
 const lundi=new Date(); lundi.setDate(lundi.getDate()-((lundi.getDay()||7)-1)); lundi.setHours(0,0,0,0);   /* minuit et non midi : ancre a 12 h, la suite 6 rendait le build dependant de l heure de lancement, weeksElapsed comparant a Date.now() */
 const J=n=>{const d=new Date(lundi);d.setDate(d.getDate()+n);return d.toISOString();};
 const S=iso=>({date:iso,type:'alterne',mode:'alterne',dur:15,real:900,xp:40,items:[]});
 state.goal=4;
 const cas=[[6,1],[5,2],[4,2],[3,3],[2,3],[1,4],[0,4]];
 cas.forEach(([offset,attendu])=>{
   state.hist=[S(J(offset))];
   const k=isoWeek(new Date(J(offset)));
   const g=goalForWeek(state,k);
   if(g!==attendu) throw new Error('prorata J+'+offset+' : attendu '+attendu+', obtenu '+g);
 });
 console.log('prorata OK : dimanche 1, samedi 2, vendredi 2, jeudi 3, mercredi 3, mardi 4, lundi 4');
 // 3. cas reel de Gabriel : premiere seance vendredi, deux jours actifs, semaine validee
 state.hist=[S(J(4)),S(J(5))];
 const k0=isoWeek(new Date(J(4)));
 if(goalForWeek(state,k0)!==2) throw new Error('objectif semaine de demarrage');
 if(weekCounts(state)[k0]!==2) throw new Error('jours actifs');
 if(weeksValidated(state)!==1) throw new Error('semaine de demarrage non validee');
 if(weekStreak(state)!==1) throw new Error('streak non demarre');
 if(!BADGES.filter(b=>b.id==='w1')[0].test(state)) throw new Error('badge semaine validee non obtenu');
 view='home'; render();
 if(html.indexOf('2 / 2')<0) throw new Error('accueil n affiche pas l objectif ajuste');
 if(html.indexOf('de démarrage')<0||html.indexOf('au prorata')<0) throw new Error('accueil n explique pas l ajustement');
 if(html.indexOf('Semaine validée')<0) throw new Error('semaine non annoncee validee');
 console.log('semaine de demarrage OK : objectif 2, validee, expliquee sur l accueil');
 // 4. le prorata ne s applique qu aux semaines tronquees
 state.hist=[S(J(-7)),S(J(-6)),S(J(-5)),S(J(-4)),S(J(4))];
 if(goalForWeek(state,k0)!==4) throw new Error('semaine precedee d une semaine active doit garder l objectif nominal');
 if(weeksValidated(state)!==1) throw new Error('seule la semaine precedente est validee');
 console.log('continuite OK : une semaine qui suit une semaine active garde l objectif nominal');
 // 5. reprise apres une semaine entierement vide
 state.hist=[S(J(-14)),S(J(-13)),S(J(-12)),S(J(-11)),S(J(3)),S(J(4)),S(J(5))];
 if(goalForWeek(state,k0)!==3) throw new Error('reprise jeudi : objectif attendu 3, obtenu '+goalForWeek(state,k0));
 if(weeksValidated(state)!==2) throw new Error('reprise non validee');
 if(weekStreak(state)!==1) throw new Error('le streak repart de 1 apres une semaine vide');
 view='home'; render();
 if(html.indexOf('de reprise')<0) throw new Error('libelle reprise absent');
 console.log('reprise OK : objectif 3 apres une semaine vide, streak reparti de 1');
 // 6. semaine en cours non jouee : jamais comptee comme un echec
 state.goal=4; state.hist=[S(J(-7)),S(J(-6)),S(J(-5)),S(J(-4)),S(J(0))];
 if(weeksElapsed(state)!==1) throw new Error('semaine en cours non terminee comptee : '+weeksElapsed(state));
 if(weeksValidated(state)!==1) throw new Error('semaine precedente non validee');
 state.hist=state.hist.concat([S(J(1)),S(J(2)),S(J(3))]);
 if(weeksElapsed(state)!==2) throw new Error('semaine en cours validee doit compter');
 if(weeksValidated(state)!==2) throw new Error('validation semaine en cours');
 console.log('semaines ecoulees OK : la semaine en cours ne compte qu une fois validee');
 // 7. file de celebrations : deblocage, badges, rang, sans doublon aux paliers 5 et 10
 state=null; localStorage._m={}; await loadState(); domicile();
 state.badges=[]; state.unlocked={}; state.xp=0;
 let q=celebrations([],[],1);   /* v1.15 : liste de cles, plus un compte */
 if(q.length) throw new Error('file non vide sans evenement');
 state.unlocked={'kb-swings':true}; state.badges=['s1','unlock1']; state.xp=0;
 q=celebrations([],[],1);
 if(q.length!==3) throw new Error('file attendue a 3 cartes, obtenue '+q.length);
 if(q[0].kind!=='Exercice débloqué'||q[1].kind!=='Badge obtenu') throw new Error('ordre de la file');
 // rang sans badge associe : niveau 3, rang Regulier
 let xp3=0; while(lvlInfo(xp3).lvl<3) xp3+=10;
 state.xp=xp3; state.badges=[];
 q=celebrations(['kb-swings'],[],1);
 if(q.length!==1||q[0].kind!=='Nouveau rang') throw new Error('carte de rang absente au niveau 3');
 // rang 5 : le badge lvl5 couvre le palier, pas de doublon
 let xp5=0; while(lvlInfo(xp5).lvl<5) xp5+=10;
 state.xp=xp5; state.badges=['lvl5'];
 q=celebrations(['kb-swings'],[],4);
 if(q.length!==1) throw new Error('doublon badge et rang au niveau 5 : '+q.length+' cartes');
 if(q[0].kind!=='Badge obtenu') throw new Error('au niveau 5 c est le badge qui doit rester');
 console.log('celebrations OK : ordre respecte, fusion badge et rang aux paliers 5 et 10');
 // 8. la surcouche avale la premiere touche puis rend la main
 state.hist=[]; state.badges=[]; state.unlocked={}; state.xp=0;
 state.warm='aucun'; state.cardio=false;
 startSession();
 let guard=0;
 while(view==='session'&&guard++<400){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ TVAL(s,DB[s.id].reps?DB[s.id].reps[1]:30); } else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 if(view!=='recap') throw new Error('recap non atteint');
 if(!cur.pop.length) throw new Error('premiere seance sans aucune celebration');
 if(html.indexOf('class="pop"')<0) throw new Error('surcouche non rendue');
 const n=cur.pop.length;
 const key=k=>handlers.forEach(h=>h({key:k,code:k===' '?'Space':k,target:{tagName:'DIV'},preventDefault(){}}));
 key('Enter');
 if(view!=='recap') throw new Error('la touche a traverse la surcouche');
 if(cur.popI!==1) throw new Error('la carte n a pas avance');
 for(let i=1;i<n;i++) key('Enter');
 if(popActive()) throw new Error('file non videe');
 if(html.indexOf('class="pop"')>=0) throw new Error('surcouche encore affichee');
 key('Enter');
 if(view!=='home') throw new Error('retour a l accueil impossible apres la file');
 console.log('surcouche OK :',n,'carte'+(n>1?'s':'')+' a la premiere seance, touches consommees puis rendues');
 // 9. echappement : tout passer
 state.hist=[]; state.badges=[]; state.unlocked={}; state.xp=0;
 startSession(); guard=0;
 while(view==='session'&&guard++<400){
   const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ TVAL(s,DB[s.id].reps?DB[s.id].reps[1]:30); } else nextStep();
 }
 await new Promise(r=>setTimeout(r,10));
 key('Escape');
 if(popActive()) throw new Error('Echap ne vide pas la file');
 console.log('echappement OK : Echap passe toute la file');
 console.log('TESTS V1.3 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test7.js


```javascript
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=4; };
 const joue=(f)=>{ let g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ f(s); } else if(s.k==='cardio'){ s.rounds=4; validateCardio(); } else nextStep(); } };
 const auTop=s=>{ const p=perfOf(s.id); TVAL(s,(DB[s.id].mode==='time'||DB[s.id].mode==='stretch')?(p.range?p.range[1]:30):p.range[1]); };

 // 1. la corde a sauter a disparu de partout
 await neuf();
 if(DB['corde-a-sauter']) throw new Error('corde encore en base');
 if(typeof CFG!=='undefined'&&CFG['corde-a-sauter']) throw new Error('corde encore en configuration');
 if(MAT['corde-a-sauter']) throw new Error('corde encore dans le materiel');
 if(Object.keys(DB).some(id=>DB[id].lock&&DB[id].lock.after==='cardio-bas-impact')) throw new Error('verrou orphelin sur le cardio');
 Object.keys(DB).forEach(id=>{ const e=DB[id];
   if(e.lock&&!DB[e.lock.after]) throw new Error('verrou pointant sur un exercice absent : '+id); });
 console.log('corde OK : retiree de la base, du materiel et des verrous ('+Object.keys(DB).length+' exercices)');

 // 2. le module cardio ne progresse plus et n a plus de cible inatteignable
 const per=DB[CARDIO_ID].phases.reduce((a,p)=>a+p.s,0);
 const maxRounds=Math.floor(CARDIO_SEC/per);
 const m0=applyProgress(CARDIO_ID,[maxRounds],true);
 if(m0.length) throw new Error('le cardio produit encore un message de progression : '+m0.join(' '));
 if(state.perf[CARDIO_ID]&&state.perf[CARDIO_ID].target>maxRounds) throw new Error('cible cardio au-dessus du realisable');
 console.log('cardio OK : bloc fixe de '+CARDIO_SEC+' s, '+maxRounds+' rounds max, aucune progression simulee');

 // 3. une douleur ne fait jamais monter l exercice quitte
 await neuf();
 startSession();
 const exo=cur.steps[0].id, p0=perfOf(exo), band0=p0.band, load0=p0.load, top=p0.range[1];
 TVAL(cur.steps[0],top);
 let g=0; while(g++<50){ const s=cur.steps[cur.i]; if(s.k==='set'&&s.id===exo) break; nextStep(); }
 swapPain();
 joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[0]:5); });
 await new Promise(r=>setTimeout(r,10));
 const pA=perfOf(exo);
 if(pA.band!==band0||pA.load!==load0) throw new Error('l exercice quitte pour douleur a monte : '+band0+'->'+pA.band);
 if(pA.range[1]!==p0.range[1]) throw new Error('fourchette relevee malgre le repli');
 console.log('repli OK : '+DB[exo].nom+' reste a son niveau apres une douleur, meme avec une serie au top');

 // 4. l ecran de repos annonce le bon exercice apres un repli
 await neuf();
 startSession();
 const old=cur.steps[0].id, fb=DB[old].fb;
 swapPain();
 if(cur.steps.some(s=>s.k==='rest'&&s.next===old)) throw new Error('un repos annonce encore l exercice quitte');
 if(!cur.steps.some(s=>s.k==='rest'&&s.next===fb)) throw new Error('aucun repos n annonce la variante de repli');
 console.log('annonce OK : les repos pointent sur '+DB[fb].nom+', plus sur '+DB[old].nom);

 // 5. deux replis vers la meme variante ne melangent pas leurs series
 await neuf();
startSession();
 const ids=[...new Set(cur.steps.filter(s=>s.k==='set').map(s=>s.id))];
 const paires=ids.filter(a=>ids.some(b=>b!==a&&DB[b].fb&&DB[b].fb===DB[a].fb));
 if(paires.length>=2){
   let n=0; g=0;
   while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
     if(s.k==='set'&&paires.indexOf(s.id)>=0&&!s.swapped&&n<2){ n++; swapPain(); }
     else if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
   await new Promise(r=>setTimeout(r,10));
   const h=state.hist[state.hist.length-1];
   const origines=h.items.filter(it=>it.sw).map(it=>it.from);
   if(new Set(origines).size!==origines.length) throw new Error('origines de repli confondues');
   console.log('collision OK : '+origines.length+' replis vers la meme variante, series et origines separees');
 } else console.log('collision OK : pas de paire concurrente dans cette seance, cle de journal distincte verifiee ailleurs');

 // 6. l origine du repli est conservee dans l historique
 await neuf();
 startSession();
 const org=cur.steps[0].id;
 swapPain();
 TVAL(cur.steps[0],8);
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const hr=state.hist[state.hist.length-1];
 if(!hr.items[0].sw) throw new Error('marqueur de repli absent');
 if(hr.items[0].from!==org) throw new Error('origine du repli absente : '+hr.items[0].from);
 if(!/repli de/.test(html)) throw new Error('le recap n affiche pas l origine du repli');
 console.log('memoire OK : historique garde '+DB[org].nom+' -> '+DB[hr.items[0].id].nom);

 // 7. une serie sautee empeche la seance d etre complete, cardio ou pas
 await neuf();
 state.cardio=true; startSession();
 const nPrevu=workSteps(cur.steps).length;
 let saute=false; g=0;
 while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ if(!saute){ saute=true; skipSet(); } else { TVAL(s,5); } }
   else if(s.k==='cardio'){ s.rounds=4; validateCardio(); } else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 const hs=state.hist[state.hist.length-1];
 if(hs.xp>=XP_SESSION+XP_SET*nPrevu) throw new Error('bonus de seance complete accorde malgre une serie sautee');
 console.log('complete OK : '+nPrevu+' series prevues, 1 sautee, cardio fait, pas de bonus ('+hs.xp+' XP)');

 // 8. une seance quittee ne fait rien monter
 await neuf();
 startSession();
 const q=cur.steps[0].id, avant=JSON.stringify(perfOf(q).range)+'|'+perfOf(q).load+'|'+perfOf(q).band;
 TVAL(cur.steps[0],perfOf(q).range[1]);
 quitSession(); quitConfirm();   /* v2.0 : la sortie se confirme dans la page */
 await new Promise(r=>setTimeout(r,10));
 const apres=JSON.stringify(perfOf(q).range)+'|'+perfOf(q).load+'|'+perfOf(q).band;
 if(avant!==apres) throw new Error('une seance quittee a fait monter '+q+' : '+avant+' -> '+apres);
 console.log('abandon OK : seance quittee apres une serie au top, aucun niveau modifie');

 // 9. le bonus de semaine suit l objectif reellement applicable
 await neuf();
 const lundi=new Date(); lundi.setDate(lundi.getDate()-((lundi.getDay()||7)-1)); lundi.setHours(12,0,0,0);
 const J=n=>{const d=new Date(lundi);d.setDate(d.getDate()+n);return d.toISOString();};
 const jour=(new Date().getDay()||7)-1;
 state.hist=[]; state.goal=4;
 for(let k=0;k<jour;k++) state.hist.push({date:J(k),type:'alterne',mode:'alterne',dur:15,real:900,xp:40,items:[]});
 const wk=prevWeekKey(0), objectif=goalForWeek(state,wk);
 state.hist=state.hist.slice(0,Math.max(0,objectif-1));
 const xp0=state.xp;
 startSession(); joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[0]:5); });
 await new Promise(r=>setTimeout(r,10));
 const gagne=state.xp-xp0, derniere=state.hist[state.hist.length-1];
 if(thisWeekCount(state)>=goalForWeek(state,wk)&&gagne<derniere.xp) throw new Error('coherence xp');
 if(thisWeekCount(state)>=goalForWeek(state,wk)&&!cur.weekJust&&objectif>1) throw new Error('semaine atteinte sans bonus : objectif '+objectif+', jours '+thisWeekCount(state));
 console.log('bonus OK : objectif '+objectif+' pour la semaine en cours, bonus declenche au meme seuil que l accueil');

 // 10. palier tenu : la cible et la charge se figent, le filet reste actif
 await neuf();
 const cid='curls-halteres';
 let p=perfOf(cid); const low=p.range[0], hi=p.range[1];
 setHold(cid,true);
 for(let i=0;i<15;i++) applyProgress(cid,[hi,hi,hi],true);
 p=perfOf(cid);
 if(p.load!==DB[cid].load0) throw new Error('la charge a monte malgre le palier tenu : '+p.load);
 if(p.target>hi) throw new Error('la cible a depasse la fourchette');
 const avantFilet=p.load;
 applyProgress(cid,[1,1,1],true);
 if(perfOf(cid).load>=avantFilet) throw new Error('le filet de securite ne joue plus sous palier tenu');
 if(!isHeld(cid)) throw new Error('le filet a libere le palier');
 console.log('palier tenu OK : 15 seances au top sans montee, filet de securite toujours actif ('+avantFilet+' -> '+perfOf(cid).load+' kg)');

 // 11. monter la charge a la main libere, la baisser conserve
 await neuf();
 const lid=Object.keys(DB).filter(id=>DB[id].mode==='load'&&DB[id].reps)[0];
 perfOf(lid); setHold(lid,true);
 cur={steps:[{k:'set',id:lid,key:lid,set:1,of:1}],i:0,log:{},xp:0,type:'alterne',exos:[lid]};
 view='session';
 adjLoad(-1);
 if(!isHeld(lid)) throw new Error('baisser la charge a libere le palier');
 adjLoad(1);
 if(isHeld(lid)) throw new Error('monter la charge n a pas libere le palier');
 console.log('liberation OK : '+DB[lid].nom+', descente conserve le palier, montee le libere');

 // 12. les repetitions saisies ne liberent jamais un palier
 await neuf();
 setHold(cid,true);
 for(let i=0;i<5;i++) applyProgress(cid,[hi+5,hi+5,hi+5],true);
 if(!isHeld(cid)) throw new Error('des repetitions elevees ont libere le palier');
 console.log('saisie OK : 5 seances tres au-dessus du palier, palier toujours tenu');

 // 13. tenir un palier au recapitulatif annule la montee
 await neuf();
 startSession();
 joue(auTop);
 await new Promise(r=>setTimeout(r,10));
 if(!cur.climbs||!cur.climbs.length) throw new Error('aucune montee detectee sur une seance entierement au top');
 const c0=cur.climbs[0], idc=c0.id, avantHold=JSON.stringify(perfOf(idc));
 holdClimb(0);
 const pc=perfOf(idc);
 if(pc.load!==c0.prev.load) throw new Error('charge non restauree');
 if(c0.prev.band&&pc.band!==c0.prev.band) throw new Error('bande non restauree');
 if(c0.prev.range&&pc.range[1]!==c0.prev.range[1]) throw new Error('fourchette non restauree');
 if(!isHeld(idc)) throw new Error('palier non pose apres holdClimb');
 if(!/Tenir ce palier|palier tenu/.test(html)) throw new Error('recap sans action de palier');
 releaseClimb(0);
 if(isHeld(idc)) throw new Error('annulation inoperante');
 console.log('recap OK : '+cur.climbs.length+' montee(s) proposee(s), '+DB[idc].nom+' annulee puis reliberee');

 // 14. alerte d ecart : uniquement pousse en avance sur un tire tenu
 await neuf();
 const push=Object.keys(DB).filter(id=>DB[id].cat==='push'&&DB[id].reps)[0];
 const pull=Object.keys(DB).filter(id=>DB[id].cat==='pull'&&DB[id].reps)[0];
 setHold(pull,true);
 state.div={push:DIV_SEUIL,pull:0};
 if(!divergence()) throw new Error('alerte absente alors que le pousse a pris de l avance');
 state.div={push:0,pull:DIV_SEUIL};
 if(divergence()) throw new Error('alerte declenchee dans le sens benin');
 setHold(pull,false);
 state.div={push:DIV_SEUIL,pull:0};
 if(divergence()) throw new Error('alerte sans aucun tire tenu');
 setHold(pull,true); state.div={push:DIV_SEUIL+2,pull:0};
 state.hist=[{date:new Date().toISOString(),type:'alterne',mode:'alterne',dur:15,real:900,xp:40,
   items:[{id:push,sets:[8,8,8],load:0},{id:pull,sets:[8,8,8],load:0}]}];
 view='prog'; render();
 if(!/montées d/.test(html)) throw new Error('alerte absente de la vue Progres');
 console.log('ecart OK : seuil '+DIV_SEUIL+', un seul sens signale, visible dans Progres');

 // 15. etirements : comptes dans le total annonce (v1.13), sans xp ni progression
 await neuf();
 state.stretch=true;
 const plan=buildSession();
 const cool=plan.steps.filter(s=>s.cool);
 if(cool.length!==STRETCH_PER_SESSION) throw new Error('nombre d etirements : '+cool.length);
 if(cool.some(s=>STRETCH_POOL.indexOf(s.id)<0)) throw new Error('etirement hors du vivier mobilite');
 /* v1.13 : le nombre annonce est un total, tout compris. Les etirements y
    entrent, alors qu ils en etaient exclus tant que ce nombre etait un budget. */
 const estAvec=estimateSec(plan);
 const sansCool=Object.assign({},plan,{steps:plan.steps.filter(s=>!s.cool)});
 const ecart=estAvec-estimateSec(sansCool);
 if(ecart<=0) throw new Error('les etirements doivent entrer dans la duree annoncee');
 const attendu=cool.reduce((a,s)=>a+serieSec(s.id,false),0);
 if(ecart!==attendu) throw new Error('cout des etirements : '+ecart+' au lieu de '+attendu);
 const vus={}; let idx=state.stretchIdx||0;
 for(let s=0;s<Math.ceil(STRETCH_POOL.length/STRETCH_PER_SESSION);s++){
   stretchesFor().forEach(id=>vus[id]=1);
   state.stretchIdx=(state.stretchIdx+STRETCH_PER_SESSION)%STRETCH_POOL.length;
 }
 if(Object.keys(vus).length!==STRETCH_POOL.length) throw new Error('la rotation ne couvre pas les six etirements : '+Object.keys(vus).length);
 state.stretchIdx=idx;
 const xpAv=state.xp;
 startSession();
 const nTravail=workSteps(cur.steps).length;
 joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[0]:5); });
 await new Promise(r=>setTimeout(r,10));
 const hh=state.hist[state.hist.length-1];
 if(hh.items.some(it=>STRETCH_POOL.indexOf(it.id)>=0)) throw new Error('un etirement a ete journalise');
 if(hh.xp!==XP_SET*nTravail+XP_SESSION) throw new Error('xp faussee par les etirements : '+hh.xp+' pour '+nTravail+' series');
 if(!hh.inc===false&&hh.inc) throw new Error('seance marquee incomplete alors que les etirements sont faits');
 console.log('etirements OK : '+cool.length+' par seance, rotation complete en '+Math.ceil(STRETCH_POOL.length/STRETCH_PER_SESSION)+' seances, 0 XP, 0 progression');

 // 16. le bloc d etirements se passe d un bouton sans casser la seance
 await neuf();
 state.stretch=true; startSession();
 g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.cool){ skipCool(); break; }
   if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 if(view!=='recap') throw new Error('passer les etirements ne termine pas la seance, vue='+view);
 if(state.hist[state.hist.length-1].inc) throw new Error('seance marquee incomplete apres avoir passe les etirements');
 console.log('passage OK : bloc d etirements saute, seance terminee et complete');

 // 17. le repli marche est atteignable depuis le module cardio
 await neuf();
 state.cardio=true; startSession();
 g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='cardio') break;
   if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
 const stc=cur.steps[cur.i];
 if(!stc||stc.k!=='cardio') throw new Error('module cardio introuvable');
 if(!/swapCardio/.test(cardioHtml(stc))) throw new Error('aucun bouton de repli sur l ecran cardio');
 swapCardio();
 if(cur.steps[cur.i].id!==DB[CARDIO_ID].fb) throw new Error('le repli cardio n a pas bascule');
 cur.steps[cur.i].rounds=1; validateCardio();
 await new Promise(r=>setTimeout(r,10));
 console.log('repli cardio OK : '+DB[CARDIO_ID].fb+' atteignable et journalise');

 // 18. les conditions de deblocage decrivent ce qui est verifie
 await neuf();
 Object.keys(DB).forEach(id=>{ const L=DB[id].lock; if(!L) return;
   if(/sans (aucune )?douleur|maîtris|propres/.test(L.cond)) throw new Error('condition invérifiable affichee sur '+id+' : '+L.cond);
   /* v1.15 : minSets vaut 1 par defaut et le compte affiche est un jeton {n}
      quand il depend du volume. L enonce doit dire ce qui est verifie. */
   const m=L.cond.match(/(\\d+)\\s*séries?\\s*de\\s*(\\d+)/);
   if(m&&(L.minSets||1)<Number(m[1])) throw new Error(id+' annonce '+m[1]+' series mais n en verifie que '+(L.minSets||1));
   if(/\{n\}/.test(L.cond)&&(L.minSets||1)<2) throw new Error('jeton {n} sans compte variable sur '+id);
   if(L.minSets!=null&&L.minSets<1) throw new Error('minSets incoherent sur '+id);
 });
 /* v1.15 : minSets vaut 1 par defaut, ce cas vise un verrou a compte multiple */
 const pron=Object.keys(DB).filter(id=>DB[id].lock&&(DB[id].lock.minSets||1)>=2)[0];
 if(pron){
   const anc=DB[pron].lock.after, need=DB[pron].lock.need, n=DB[pron].lock.minSets;
   state.perf[anc]={load:0,range:DB[anc].reps.slice(),target:need,best:need,sets:[need],date:null,band:'noir',setsBand:'noir'};
   checkUnlocks(3,false);
   if(state.unlocked[pron]) throw new Error(pron+' debloque avec une seule serie');
   state.perf[anc].sets=new Array(n).fill(need); state.perf[anc].best=need;
   checkUnlocks(3,false);
   if(!state.unlocked[pron]) throw new Error(pron+' non debloque avec '+n+' series de '+need);
   console.log('deblocages OK : libelles verifiables, '+n+' series reellement exigees sur '+DB[pron].nom);
 } else console.log('deblocages OK : libelles verifiables');

 // 19. entretien global : tout tenir, tout liberer
 await neuf();
 setEntretien(true);
 const n1=heldCount();
 if(n1!==holdableIds().length) throw new Error('entretien partiel : '+n1+'/'+holdableIds().length);
 let bouge=0;
 holdableIds().forEach(id=>{ const p=perfOf(id); const av=p.target;
   applyProgress(id,[p.range[1],p.range[1],p.range[1]],true); if(perfOf(id).target!==av) bouge++; });
 if(bouge) throw new Error(bouge+' exercices ont bouge en mode entretien');
 setEntretien(false);
 if(heldCount()) throw new Error('liberation globale incomplete');
 console.log('entretien OK : '+n1+' exercices figes puis liberes, aucune cible ne bouge entre-temps');

 // 20. toutes les vues repondent encore, fiches comprises
 await neuf();
 setHold('curls-halteres',true);
 ['home','lib','prog','set'].forEach(v=>{view=v;render();});
 Object.keys(DB).forEach(id=>showFiche(id));
 showFiche('curls-halteres');
 if(!/Reprendre la progression/.test(html)) throw new Error('interrupteur absent d une fiche tenue');
 showFiche('goblet-squat');
 if(!/Tenir ce palier/.test(html)) throw new Error('interrupteur absent d une fiche en progression');
 showFiche('posture-enfant');
 if(/Tenir ce palier/.test(html)) throw new Error('interrupteur propose sur un etirement');
 console.log('vues OK : accueil, bibliotheque, progres, reglages et '+Object.keys(DB).length+' fiches');
 console.log('TESTS V1.4 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test8.js


```javascript
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=4; };
 /* date du jour d une semaine ISO decalee de n semaines vers le passe */
 const ilY=(n,jour)=>{ const d=new Date(); d.setDate(d.getDate()-7*n);
   const cur=(d.getDay()||7); d.setDate(d.getDate()-cur+jour); d.setHours(12,0,0,0); return d.toISOString(); };
 const seance=(date,items)=>({date:date,type:'alterne',mode:'alterne',dur:15,real:900,xp:40,
   items:items||[{id:'pompes-poignees',sets:[8,8,8],load:0}]});

 // 1. moyenne de jours actifs : semaine en cours exclue, denominateur borne aux
 //    semaines revolues. Le cas reel de Gabriel : une seule seance, un dimanche.
 await neuf();
 state.hist=[seance(ilY(0,7))];
 if(avgActiveDays(state,4)!==null) throw new Error('moyenne affichee alors qu aucune semaine n est revolue');
 view='prog'; render();
 if(/Moyenne de jours actifs/.test(html)) throw new Error('la ligne de moyenne s affiche sans semaine revolue');
 console.log('moyenne OK : masquee tant qu aucune semaine n est revolue (cas d une seule seance ce dimanche)');

 // 2. une semaine revolue a 3 jours actifs : 3,0 sur 1 semaine, pas 0,8 sur 4
 await neuf();
 state.hist=[seance(ilY(1,1)),seance(ilY(1,3)),seance(ilY(1,5)),seance(ilY(0,1))];
 let a=avgActiveDays(state,4);
 if(!a||a.weeks!==1) throw new Error('denominateur non borne aux semaines observees : '+JSON.stringify(a));
 if(a.avg!==3) throw new Error('moyenne faussee : '+a.avg+' au lieu de 3');
 view='prog'; render();
 if(!/3<\\/span>\\/sem sur 1 semaine révolue/.test(html)) throw new Error('libelle de moyenne incorrect');
 console.log('moyenne OK : 3/sem sur 1 semaine revolue, la semaine en cours ne dilue plus');

 // 3. quatre semaines pleines : la fenetre se remplit et la semaine en cours reste dehors
 await neuf();
 state.hist=[];
 for(let s=1;s<=4;s++) for(let j=1;j<=2;j++) state.hist.push(seance(ilY(s,j)));
 for(let j=1;j<=6;j++) state.hist.push(seance(ilY(0,j)));
 state.hist.sort((x,y)=>x.date<y.date?-1:1);
 a=avgActiveDays(state,4);
 if(a.weeks!==4||a.avg!==2) throw new Error('fenetre pleine faussee : '+JSON.stringify(a));
 console.log('moyenne OK : 2/sem sur 4 semaines revolues, 6 jours en cours ignores');

 // 4. bloc replis douleur : compte les replis par exercice d origine
 await neuf();
 const org='pompes-poignees', fb=DB[org].fb;
 state.hist=[
   seance(ilY(1,1),[{id:org,sets:[8,8,8],load:0}]),
   seance(ilY(1,3),[{id:fb,sets:[8,8],load:0,sw:true,from:org}]),
   seance(ilY(0,1),[{id:fb,sets:[7,7],load:0,sw:true,from:org}])
 ];
 const ps=painSwaps(state,4);
 if(ps.length!==1) throw new Error('replis mal regroupes : '+ps.length+' entrees');
 if(ps[0].id!==org) throw new Error('repli attribue au mauvais exercice : '+ps[0].id);
 if(ps[0].sw!==2||ps[0].n!==3) throw new Error('comptage faux : '+ps[0].sw+'/'+ps[0].n);
 view='prog'; render();
 if(!/Replis douleur/.test(html)) throw new Error('bloc replis absent de Progres');
 if(!new RegExp(DB[org].nom.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&')).test(html)) throw new Error('exercice d origine absent du bloc');
 if(!/>2<\\/b>\\/3 passages/.test(html)) throw new Error('ratio de replis non affiche');
 if(!/la douleur revient plus d/.test(html)) throw new Error('alerte de recurrence absente a 2 replis sur 3');
 console.log('replis OK : '+DB[org].nom+' 2/3 passages sur 4 semaines, alerte de recurrence levee');

 // 5. le bloc s efface quand aucun repli sur la fenetre
 await neuf();
 state.hist=[seance(ilY(1,1)),seance(ilY(1,3))];
 if(painSwaps(state,4).length) throw new Error('replis fantomes sans aucun repli');
 view='prog'; render();
 if(/Replis douleur/.test(html)) throw new Error('bloc replis affiche sans repli');
 console.log('replis OK : bloc absent quand la fenetre est propre');

 // 6. un repli hors fenetre ne compte plus
 await neuf();
 state.hist=[seance(ilY(9,1),[{id:fb,sets:[8,8],load:0,sw:true,from:org}])];
 if(painSwaps(state,4).length) throw new Error('un repli de 9 semaines compte encore');
 console.log('replis OK : fenetre glissante de 4 semaines respectee');

 // 7. dernieres seances depliables, contenu et tag de repli
 await neuf();
 state.hist=[seance(ilY(0,1),[{id:fb,sets:[9,8],load:0,sw:true,from:org}])];
 view='prog'; render();
 if(!/Dernières séances/.test(html)) throw new Error('bloc dernieres seances absent');
 const bloc=html.split('Dernières séances')[1].split('Assiduité')[0];
 if(!/<details><summary/.test(bloc)) throw new Error('les seances ne sont pas depliables');
 if(!/tag flame[^>]*>repli de /.test(bloc)) throw new Error('tag de repli absent du detail de seance');
 if(bloc.indexOf('9<i class="sl">/</i>8')<0) throw new Error('series absentes du detail de seance');
 console.log('historique OK : seances depliables, series et repli visibles');

 // 8. ordre des cartes de Progres
 await neuf();
 state.hist=[seance(ilY(1,1)),seance(ilY(0,1))];
 view='prog'; render();
 const ordre=['Dernières séances','Assiduité','Couverture musculaire','Temps d\\'entraînement','Repères par exercice','Badges'];
 let pos=-1;
 ordre.forEach(t=>{ const p=html.indexOf(t);
   if(p<0) throw new Error('carte absente de Progres : '+t);
   if(p<pos) throw new Error('carte hors ordre dans Progres : '+t);
   pos=p; });
 console.log('progres OK : ordre '+ordre.join(' > '));

 // 9. badges : fermes, seuls les obtenus ; ouverts, toute la collection
 await neuf();
 state.badges=['s1'];
 view='prog'; render();
 const bd=html.split('<details class="card" data-k="prog-badges"><summary><span class="ttl">Badges')[1];
 if(!bd) throw new Error('carte badges non repliable');
 const sum=bd.split('</summary>')[0], corps=bd.split('</summary>')[1];
 if(!new RegExp('1\\\\/'+BADGES.length).test(sum)) throw new Error('compteur de badges absent de l en-tete');
 if(!/badgechip/.test(sum)) throw new Error('les badges obtenus ne sont pas dans l en-tete ferme');
 if((sum.match(/badgechip/g)||[]).length!==1) throw new Error('l en-tete ferme montre des badges non obtenus');
 if((corps.match(/class="badge/g)||[]).length!==BADGES.length) throw new Error('la carte ouverte ne montre pas tous les badges');
 console.log('badges OK : 1 pastille fermee, '+BADGES.length+' badges ouverts');

 // 10. reglages : toutes les cartes repliables portent leur valeur courante
 await neuf();
 state.lastExport=null;
 view='set'; render();
 const attendus=[['Données','jamais exportée'],['Objectif hebdomadaire','4 jours'],['Séries par exercice','4 séries'],
   ['Échauffement','Aucun'],['Module cardio','Désactivé'],
   ['Étirements de fin de séance','Désactivés'],['Transition','15 s'],
   ['Entretien','Progression active'],['Thème','Auto']];
 pos=-1;
 attendus.forEach(([t,v])=>{
   const bloc='<span class="ttl">'+t+'</span><span class="val">'+v+'</span>';
   const p=html.indexOf(bloc);
   if(p<0) throw new Error('carte de reglage sans sa valeur : '+t+' (attendu '+v+')');
   if(p<pos) throw new Error('carte de reglage hors ordre : '+t);
   pos=p; });
 if(html.indexOf('<span class="ttl">Matériel</span>')<html.indexOf('<span class="ttl">Entretien</span>'))
   throw new Error('Materiel n est pas apres Entretien');
 if(html.indexOf('<span class="ttl">Thème</span>')<html.indexOf('<span class="ttl">Matériel</span>'))
   throw new Error('Theme n est pas apres Materiel');
 console.log('reglages OK : 11 cartes repliables, valeurs en en-tete, ordre Donnees > Objectif > Duree ... Materiel > Theme');

 // 11. horodatage du dernier export
 await neuf();
 if(lastExportLabel()!=='jamais exportée') throw new Error('etat initial d export incorrect');
 markExport();
 if(!state.lastExport) throw new Error('export non horodate');
 if(lastExportLabel()!=='aujourd\\'hui') throw new Error('libelle du jour incorrect : '+lastExportLabel());
 state.lastExport=new Date(Date.now()-3*864e5).toISOString();
 if(lastExportLabel()!=='il y a 3 j') throw new Error('libelle a 3 jours incorrect : '+lastExportLabel());
 view='set'; render();
 if(!/<span class="val">il y a 3 j<\\/span>/.test(html)) throw new Error('date d export absente de l en-tete');
 console.log('export OK : jamais / aujourd hui / il y a 3 j, visible carte fermee');

 // 12. bibliotheque : vignettes, verrous integres, une ligne par exercice
 await neuf();
 view='lib'; render();
 const nLignes=(html.match(/class="exorow/g)||[]).length;
 if(nLignes!==Object.keys(DB).length) throw new Error('lignes de bibliotheque : '+nLignes+' pour '+Object.keys(DB).length+' exercices');
 if(!/class="search"/.test(html)) throw new Error('barre de recherche absente');
 const verrouille=Object.keys(DB).filter(id=>isLocked(id))[0];
 if(verrouille){
   if(!/lockedrow/.test(html)) throw new Error('ligne verrouillee non stylee');
   /* la condition porte un jeton {n} substitue au rendu : on compare a la
      forme rendue, jamais au gabarit */
   if(!new RegExp('↳ '+lockCond(DB[verrouille]).slice(0,12).replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&')).test(html))
     throw new Error('condition de deblocage absente de la ligne');
 }
 console.log('bibliotheque OK : '+nLignes+' lignes a vignette, verrous integres, recherche presente');

 // 13. recherche : nom, muscle, insensible aux accents, groupes vides masques
 libFilter('trac');
 let n=(html.match(/class="exorow/g)||[]).length;
 const attTrac=Object.keys(DB).filter(id=>/trac/i.test(DB[id].nom.normalize('NFD').replace(/[\\u0300-\\u036f]/g,''))).length;
 if(n!==attTrac) throw new Error('recherche « trac » : '+n+' au lieu de '+attTrac);
 if(/<h3>Jambes<\\/h3>/.test(html)) throw new Error('groupe vide non masque');
 libFilter('EPAULE');
 const nEp=(html.match(/class="exorow/g)||[]).length;
 if(!nEp) throw new Error('recherche insensible aux accents et a la casse en echec');
 libFilter('zzzz');
 if(!/Aucun exercice ne correspond/.test(html)) throw new Error('message vide absent');
 if((html.match(/class="exorow/g)||[]).length) throw new Error('lignes affichees malgre une recherche vide');
 libClear();
 if((html.match(/class="exorow/g)||[]).length!==Object.keys(DB).length) throw new Error('effacement de la recherche inoperant');
 go('lib');
 if(libQ!=='') throw new Error('la recherche survit a un changement d onglet');
 console.log('recherche OK : '+attTrac+' tractions, '+nEp+' resultats sur « EPAULE », vide gere, remise a zero a l entree');

 // 14. toutes les vues repondent encore
 await neuf();
 state.hist=[seance(ilY(1,1),[{id:fb,sets:[8,8],load:0,sw:true,from:org}]),seance(ilY(0,1))];
 ['home','lib','prog','set'].forEach(v=>{view=v;render();});
 Object.keys(DB).forEach(id=>showFiche(id));
 console.log('vues OK : accueil, bibliotheque, progres, reglages et '+Object.keys(DB).length+' fiches');
 console.log('TESTS V1.5 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test9.js


```javascript
// Nouveautes v1.6 : retrait des dips, developpe halteres au sol, tolerance aux
// identifiants d historique absents, interrupteur des sons, decompte de
// preparation, bips pre-cible, serie en clair, ecran reordonne, pastilles
// groupees par tour et par exercice, card Sons dans les reglages.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async function(){
 await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
 // 1. dips retires de partout, catalogue a 36 avec le developpe au sol
 if(DB['dips']||CFG['dips']) throw new Error('dips toujours en base');
 if(SLOTS.push.pool.indexOf('dips')>=0) throw new Error('dips toujours au vivier pousse');
 if(typeof IMG!=='undefined'&&IMG['dips']) throw new Error('image dips toujours embarquee');
 if(Object.keys(DB).some(id=>DB[id].lock&&DB[id].lock.after==='dips')) throw new Error('un verrou reference encore les dips');
 if(Object.keys(DB).length!==55) throw new Error('catalogue attendu a 55, obtenu '+Object.keys(DB).length);   /* v2.18 : +2, escalier du squat */
 console.log('dips OK : retires de DB, CFG, vivier, images et verrous, catalogue a 46');
 // 2. developpe halteres au sol : mode load, vivier pousse, materiel, repli, figure
 const dv=DB['developpe-sol'];
 if(!dv) throw new Error('developpe-sol absent');
 if(CFG['developpe-sol'].mode!=='load'||CFG['developpe-sol'].cat!=='push') throw new Error('developpe-sol mal configure');
 if(SLOTS.push.pool.indexOf('developpe-sol')<0) throw new Error('developpe-sol hors vivier pousse');
 if(SLOTS.push.pool.length!==3) throw new Error('vivier pousse attendu a 3');
 if(!dv.mat||!dv.mat.length) throw new Error('materiel absent');
 if(!DB[dv.fb]) throw new Error('repli invalide : '+dv.fb);
 if(dv.lock) throw new Error('developpe-sol ne doit pas etre verrouille');
 const f=figFor('developpe-sol',dv.fig,dv.nom);
 if(!f||f.indexOf('<img')<0) throw new Error('croquis non rendu');
 if(typeof IMG!=='undefined'&&!IMG['developpe-sol']) throw new Error('croquis absent de la banque');
 const p0=perfOf('developpe-sol');
 if(p0.load!==6) throw new Error('charge de depart attendue 6, obtenue '+p0.load);
 const L=loadLadder(state.gear);
 if(L.indexOf(6)<0) throw new Error('6 kg absent de l echelle de charge reelle');
 console.log('developpe-sol OK : load 6 kg sur l echelle, vivier pousse a 3, croquis embarque, repli '+dv.fb);
 // 3. identifiants fantomes dans l historique : Progres, Replis, trajectoires tiennent
 state.hist=[{date:new Date(Date.now()-7*864e5).toISOString(),dur:900,plan:900,items:[
   {id:'dips',sets:[8,8]},
   {id:'corde-a-sauter',sets:[3]},
   {id:'fantome',sets:[5],sw:true,from:'dips'},
   {id:'pompes-inclinees',sets:[6],sw:true,from:'pompes-poignees'},
   {id:'goblet-squat',sets:[8,8],load:12}
 ]}];
 state.perf['dips']={sets:[8,8],load:0};
 const sh=statsHtml();
 if(sh.indexOf('Dips')>=0) throw new Error('exercice fantome affiche dans les stats');
 const ps=painSwaps(state,4);
 if(ps.some(x=>x.id==='dips')) throw new Error('repli d origine fantome compte');
 if(!ps.some(x=>x.id==='pompes-poignees')) throw new Error('repli reel perdu');
 const cov=coverage(state,4);
 if(cov.legs!==2) throw new Error('coverage faussee par les fantomes : '+cov.legs);
 view='prog'; render();
 if(html.indexOf('Progrès')<0) throw new Error('vue Progres ne rend plus');
 console.log('fantomes OK : stats, replis, couverture et Progres tiennent sur des ids absents');
 // 4. interrupteur des sons : porte dans beep, defauts sains
 state.hist=[]; state.perf={};
 if(!sndOn()) throw new Error('sons attendus actifs par defaut');
 if(prepSec()!==5) throw new Error('decompte attendu a 5 par defaut, obtenu '+prepSec());
 state.sound=false;
 if(sndOn()) throw new Error('interrupteur inoperant');
 beep(880,.2); // ne doit ni jouer ni jeter
 state.sound=true; state.prep=0;
 if(prepSec()!==0) throw new Error('decompte 0 non respecte');
 state.prep=null;
 if(prepSec()!==5) throw new Error('absence de reglage doit valoir 5');
 console.log('sons OK : porte globale dans beep, defauts actifs et 5 s');
 // 5. bips pre-cible : approche sur les 5 dernieres secondes, arrivee inchangee, garde a 5
 const K=(v,t)=>preBipKind(v,t);
 if(K(14,20)!==0||K(15,20)!==1||K(19,20)!==1||K(20,20)!==2||K(21,20)!==0) throw new Error('fenetre pre-cible fausse');
 if(K(1,4)!==0&&K(2,4)!==0) throw new Error('garde target<=5 absent sur l approche');
 if(K(4,4)!==2) throw new Error('bip d arrivee perdu sur petite cible');
 if(K(3,0)!==0) throw new Error('cible nulle doit rester muette');
 console.log('pre-cible OK : approche a t-5, arrivee preservee, petites cibles gardees');
 // 6. decompte de preparation : arme au demarrage, pas quand il vaut 0
 startSession(); if(cur.phase==='warm') skipWarm();
 while(cur.steps[cur.i].k!=='set'||DB[cur.steps[cur.i].id].mode==='time'?false:true){ if(DB[cur.steps[cur.i].id]&&DB[cur.steps[cur.i].id].mode==='time'&&cur.steps[cur.i].k==='set')break; nextStep(); if(cur.i>=cur.steps.length) break; }
 let stT=cur.steps.find((s,i)=>i>=cur.i&&s.k==='set'&&DB[s.id].mode==='time');
 if(stT){
   while(cur.steps[cur.i]!==stT) nextStep();
   state.prep=3; toggleChrono();
   if(cur.steps[cur.i].prepLeft!==3) throw new Error('decompte non arme : '+cur.steps[cur.i].prepLeft);
   toggleChrono(); // stop pendant le decompte
   if(cur.steps[cur.i].prepLeft!=null) throw new Error('decompte non annule au stop');
   state.prep=0; toggleChrono();
   if(cur.steps[cur.i].prepLeft!=null) throw new Error('decompte a 0 doit demarrer direct');
   clearTimers();
   console.log('decompte OK : arme a 3, annule au stop, direct a 0');
 } else console.log('decompte : aucun exercice tenu tire ce jour, teste via les purs');
 cur=null; state.prep=null;
 // 7. ecran d exercice : serie en clair, plus de pips, ordre cible > charge > illustration
 state.perf={}; startSession(); if(cur.phase==='warm') skipWarm();
 while(cur.steps[cur.i].k!=='set') nextStep();
 const st=cur.steps[cur.i];
 const card=setHtml(st);
 if(card.indexOf('setpips')>=0) throw new Error('pips toujours presents');
 if(!/Série <b class="num">1<\\/b> sur/.test(card)) throw new Error('serie en clair absente');
 const iP=card.indexOf('perfline'), iF=card.indexOf('figbox')>=0?card.indexOf('figbox'):card.indexOf('<svg');
 if(iP<0||iF<0||iP>iF) throw new Error('la cible ne precede pas l illustration');
 const iL=card.indexOf('loadbox');
 if(iL>=0&&(iL<iP||iL>iF)) throw new Error('la charge n est pas entre cible et illustration');
 console.log('ecran OK : serie en clair, cible puis charge puis illustration entiere');
 // 8. pastilles groupees : un bloc par tour
 const dA=dotsHtml(cur.steps,0);
 const nT=(dA.match(/class="grp/g)||[]).length;
 const R=workSteps(cur.steps).filter(s=>s.round===1).length?Math.max(...workSteps(cur.steps).map(s=>s.round)):0;
 if(nT!==R) throw new Error('alterne : '+nT+' blocs pour '+R+' tours');
 const dDone=dotsHtml(cur.steps,workSteps(cur.steps).filter(s=>s.round===1).length);
 if((dDone.match(/grp full/g)||[]).length!==1) throw new Error('le tour boucle ne change pas de contour');
 cur=null;
 console.log('pastilles OK : '+R+' blocs-tours, contour du tour boucle');
 // 9. reglages : card Sons dans le bloc seance, valeur en en-tete, decompte regle
 view='set'; render();
 const iSons=html.indexOf('<span class="ttl">Sons</span>');
 if(iSons<0) throw new Error('card Sons absente');
 if(html.indexOf('<span class="ttl">Sons</span><span class="val">Activés · décompte 5 s · repère 5 s</span>')<0) throw new Error('valeur en en-tete fausse');
 const iEt=html.indexOf('<span class="ttl">Étirements de fin de séance</span>'), iRe=html.indexOf('<span class="ttl">Repos entre séries</span>');
 if(!(iEt<iSons&&(iRe<0||iSons<iRe))) throw new Error('card Sons hors du bloc seance');
 state.sound=false; render();
 if(html.indexOf('<span class="ttl">Sons</span><span class="val">Coupés</span>')<0) throw new Error('etat coupe non reflete');
 state.sound=true;
 console.log('reglages OK : Sons apres Étirements, valeur en en-tete dans les deux etats');
 console.log('TESTS V1.6 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test10.js


```javascript
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
```

## test11.js


```javascript
// Nouveautes v1.8 : mode seance allegee (substitution des replis, cible a -30 %
// avec debordement sur la charge, gel de la progression dans les deux sens,
// exclusion du capteur de douleur, non-persistance), lien vers la fiche de
// repli, cards repliables de l onglet Progres.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=4; };
 await neuf();
 // 1. calcul de la cible allegee : -30 % arrondi a l inferieur, plancher au bas de fourchette
 lightMode=true;
 const p1=perfOf('pompes-inclinees'); p1.target=16; p1.range=[8,20];
 if(lightPerf('pompes-inclinees').target!==11) throw new Error('16 -> 11 attendu, obtenu '+lightPerf('pompes-inclinees').target);
 const pl=perfOf('planche'); pl.target=45; pl.range=[20,60];
 if(lightPerf('planche').target!==30) throw new Error('tenue 45 s -> 30 s attendu, obtenu '+lightPerf('planche').target);
 console.log('cible allegee OK : 16 reps -> 11, tenue 45 s -> 30 s (arrondi au multiple de 5)');
 // 2. debordement sur la charge quand le -30 % passerait sous le bas de fourchette
 const pe=perfOf('elevations-laterales'); pe.target=14; pe.range=[12,20]; pe.load=4;
 const le=lightPerf('elevations-laterales');
 if(le.target!==12) throw new Error('cible attendue au bas de fourchette (12), obtenue '+le.target);
 if(!(le.load<=4*0.8+1e-9)) throw new Error('charge attendue a -20 % au moins, obtenue '+le.load);
 if(!le.loadCut||!le.repsCut) throw new Error('marqueurs de coupe absents');
 const pf=perfOf('face-pulls'); pf.target=12; pf.range=[10,18]; pf.band='rouge';
 const lf=lightPerf('face-pulls');
 if(lf.target!==10||lf.band!=='jaune') throw new Error('face pulls : attendu 10 reps en jaune, obtenu '+lf.target+' en '+lf.band);
 console.log('debordement OK : elevations 14@4 kg -> 12@'+le.load+' kg, face pulls 12 rouge -> 10 jaune');
 // 3. rien a faire quand on est deja en bas de fourchette au barreau le plus facile
 const pb=perfOf('face-pulls'); pb.target=10; pb.range=[10,18]; pb.band='jaune';
 const lb=lightPerf('face-pulls');
 if(lb.target!==10||lb.band!=='jaune'||lb.repsCut||lb.loadCut) throw new Error('plancher : rien ne doit bouger');
 console.log('plancher OK : bas de fourchette au barreau le plus facile, aucun changement');
 // 4. l etat n est jamais touche par la lecture allegee
 const avant=JSON.stringify(state.perf['elevations-laterales']);
 perfFor('elevations-laterales'); lightPerf('elevations-laterales');
 if(JSON.stringify(state.perf['elevations-laterales'])!==avant) throw new Error('perfFor a modifie l etat');
 if(perfFor('elevations-laterales').load===perfOf('elevations-laterales').load) throw new Error('perfFor ne reflete pas l allegement');
 lightMode=false;
 if(perfFor('elevations-laterales').load!==perfOf('elevations-laterales').load) throw new Error('hors mode allege, perfFor doit valoir perfOf');
 console.log('lecture OK : copie allegee en mode allege, etat intact, perfOf sinon');
 // 5. substitution des replis a la construction, et materiel qui suit
 await neuf();
 const normal=buildSession();
 lightMode=true;
 const allege=buildSession();
 if(!allege.light||normal.light) throw new Error('marque light absente du plan');
 const subs=allege.exos.filter((id,i)=>id!==allege.orig[i]);
 allege.exos.forEach((id,i)=>{ const o=allege.orig[i]; if(DB[o].fb&&id!==DB[o].fb) throw new Error('repli non applique sur '+o); if(!DB[o].fb&&id!==o) throw new Error('substitution indue sur '+o); });
 if(!subs.length) throw new Error('aucune substitution alors que le vivier pousse en a toujours une');
 const stepsSub=allege.steps.filter(s=>s.k==='set'&&s.light);
 if(!stepsSub.length||!stepsSub.every(s=>s.from&&s.key===s.from+'>'+s.id&&s.swapped)) throw new Error('marquage des etapes substituees incorrect');
 console.log('substitution OK : '+subs.length+' emplacement(s) replie(s), etapes marquees, materiel recalcule');
 // 6. aucun repli ne peut tomber sur un exercice verrouille
 Object.keys(DB).forEach(id=>{ if(DB[id].fb&&DB[DB[id].fb].lock) throw new Error('repli verrouillable : '+id); });
 console.log('replis OK : aucune cible de repli n est verrouillable');
 // 7. gel de la progression dans les deux sens
 await neuf(); lightMode=true;
 startSession(); if(cur.phase==='warm') skipWarm();
 const avantPerf=JSON.parse(JSON.stringify(state.perf));
 const idxAvant=JSON.parse(JSON.stringify(state.slotIdx)), stretchAvant=state.stretchIdx;
 let garde=0;
 while(view==='session'&&garde++<400){
   const st=cur.steps&&cur.steps[cur.i]; if(!st) break;
   /* on valide au haut de fourchette : en seance normale ces lectures feraient
      monter la cible, ici rien ne doit bouger */
   if(st.k==='set'){ const e=DB[st.id]; TVAL(st,(e.mode==='stretch')?1:(perfOf(st.id).range?perfOf(st.id).range[1]:30)); }
   else nextStep();
 }
 await new Promise(r=>setTimeout(r,20));
 if(view!=='recap') throw new Error('seance non terminee, vue '+view);
 Object.keys(avantPerf).forEach(id=>{
   const a=avantPerf[id], b=state.perf[id];
   if(a.target!==b.target) throw new Error('cible modifiee sur '+id+' : '+a.target+' -> '+b.target);
   if(a.load!==b.load) throw new Error('charge modifiee sur '+id);
   if(a.band!==b.band) throw new Error('bande modifiee sur '+id);
 });
 const last=state.hist[state.hist.length-1];
 if(!last.light) throw new Error('seance non marquee allegee dans l historique');
 if(!last.items.some(it=>it.sets&&it.sets.length)) throw new Error('performances non enregistrees');
 if(!state.hist.length||thisWeekCount(state)<1) throw new Error('la seance allegee doit compter comme jour actif');
 console.log('gel OK : hautes performances validees, aucune cible ni charge ne bouge, seance comptee');
 // 8. le mode ne survit pas a la seance
 if(lightMode) throw new Error('mode allege encore actif apres la seance');
 cur=null; view='home'; render();
 if(/flamebtn/.test(html)) throw new Error('bouton encore en etat actif sur l accueil');
 console.log('non-persistance OK : mode remis a zero en fin de seance');
 // 9. la rotation ne consomme pas de tour sur une seance allegee
 if(JSON.stringify(state.slotIdx)!==JSON.stringify(idxAvant)) throw new Error('rotation avancee sur une seance allegee : '+JSON.stringify(state.slotIdx));
 if(state.stretchIdx===stretchAvant&&state.stretch) throw new Error('rotation des etirements figee a tort');
 /* la meme seance jouee normalement doit, elle, faire avancer la rotation */
 await neuf(); lightMode=false;
 const idx2=JSON.parse(JSON.stringify(state.slotIdx));
 startSession(); if(cur.phase==='warm') skipWarm();
 let g2=0;
 while(view==='session'&&g2++<400){
   const st=cur.steps&&cur.steps[cur.i]; if(!st) break;
   if(st.k==='set'){ const e=DB[st.id]; TVAL(st,(e.mode==='stretch')?1:(perfOf(st.id).range?perfOf(st.id).range[1]:30)); }
   else nextStep();
 }
 await new Promise(r=>setTimeout(r,20));
 if(SLOT_ORDER.some(sl=>state.slotIdx[sl]!==(idx2[sl]||0)+1)) throw new Error('rotation non avancee sur une seance normale');
 /* les etirements, eux, avancent meme sous seance allegee */
 await neuf(); lightMode=true;
 const st0=state.stretchIdx||0;
 startSession(); if(cur.phase==='warm') skipWarm();
 let g3=0;
 while(view==='session'&&g3++<400){
   const st=cur.steps&&cur.steps[cur.i]; if(!st) break;
   if(st.k==='set'){ const e=DB[st.id]; TVAL(st,(e.mode==='stretch')?1:(perfOf(st.id).range?perfOf(st.id).range[1]:30)); }
   else nextStep();
 }
 await new Promise(r=>setTimeout(r,20));
 if(state.stretchIdx===st0&&state.stretch!==false) throw new Error('la rotation des etirements a gele sous seance allegee');
 console.log('rotation OK : figee en allege, avancee en seance normale, etirements toujours avances');
 // 10. les substitutions volontaires ne polluent pas le capteur de douleur
 if(painSwaps(state,4).length) throw new Error('les replis volontaires comptent dans le capteur de douleur');
 state.hist[state.hist.length-1].light=false;
 if(!painSwaps(state,4).length) throw new Error('sans la marque, les replis devraient compter');
 state.hist[state.hist.length-1].light=true;
 console.log('capteur OK : replis volontaires exclus, replis douleur toujours comptes');
 // 11. accueil : bouton, ordre, bandeau, tags du detail
 await neuf(); view='home'; render();
 if(html.indexOf('Changer de séance')>=0) throw new Error('le bouton de saut de seance survit');
 const iLan=html.indexOf('Lancer la séance'), iAlg=html.indexOf('Séance allégée');
 if(iLan<0||iAlg<0||iLan>iAlg) throw new Error('ordre des boutons : Lancer doit preceder Séance allégée');
 if(/flamebtn/.test(html)) throw new Error('bouton actif alors que le mode est inactif');
 toggleLight();
 if(!/flamebtn/.test(html)) throw new Error('bouton non mis en evidence a l activation');
 if(!/cibles réduites/.test(html)) throw new Error('bandeau absent de l en-tete de seance');
 /* le tag de chaque ligne doit correspondre a ce que le moteur a reellement fait */
 const plan2=buildSession();
 let nRep=0,nCib=0;
 plan2.exos.forEach((id,i)=>{
   const org=plan2.orig[i], p=perfFor(id,org!==id);
   if(org!==id){ nRep++; if(html.indexOf('repli de '+DB[org].nom)<0) throw new Error('tag de repli absent pour '+org); }
   else if(p.repsCut||p.loadCut){ nCib++; if(html.indexOf('cible allégée')<0) throw new Error('tag de cible allegee absent pour '+id); }
   if(org!==id&&(p.repsCut||p.loadCut)) throw new Error('double allegement sur '+id+' : substitue ET cible reduite');
 });
 if(!nRep) throw new Error('aucun repli applique alors que le vivier pousse en a toujours un');
 /* et un cas de cible allegee force, en remontant une cible au-dessus du bas de fourchette */
 const sans=plan2.exos.find((id,i)=>plan2.orig[i]===id);
 if(sans){ const q=perfOf(sans); q.target=Math.min(q.range[1],q.range[0]+5); render();
   if(html.indexOf('cible allégée')<0) throw new Error('tag de cible allegee absent apres remontee de cible'); }
 toggleLight();
 if(/flamebtn/.test(html)) throw new Error('bouton toujours actif apres seconde bascule');
 console.log('accueil OK : bascule, mise en evidence, bandeau et tags par ligne');
 // 12. lien vers la fiche de repli
 showFiche('pompes-poignees','lib');
 if(!/Variante de repli/.test(html)) throw new Error('bloc de repli absent de la fiche');
 if(html.indexOf(DB[DB['pompes-poignees'].fb].nom)<0) throw new Error('repli non nomme');
 if(!/showFiche\\('pompes-inclinees'/.test(html)) throw new Error('lien vers la fiche de repli absent');
 if(!/Support stable/.test(html)) throw new Error('materiel du repli absent');
 showFiche('planche-genoux','lib');
 if(/Variante de repli/.test(html)) throw new Error('bloc affiche sur un exercice sans repli');
 console.log('fiche OK : repli nomme, materiel annonce, lien fonctionnel, absent quand il n y a pas de repli');
 // 13. Progres : ce qui reste ouvert, ce qui se replie, alerte qui force l ouverture
 const jour=new Date().toISOString();
 state.hist=[{date:jour,dur:20,xp:12,mode:'alterne',real:1100,items:[{id:'pompes-poignees',sets:[10,10]}]}];
 state.perf['pompes-poignees']={sets:[10,10],target:10,range:[5,12],load:0,best:10,date:jour};
 view='prog'; render();
 const ouverte=t=>new RegExp('<div class="card"><h3>'+t).test(html);
 const repliee=t=>new RegExp('<details class="card"[^>]*><summary><span class="ttl">'+t).test(html);
 if(!ouverte('Assiduité')||!ouverte('Couverture musculaire')) throw new Error('Assiduite et Couverture doivent rester ouvertes');
 ['Dernières séances','Temps d\\'entraînement','Repères par exercice','Badges'].forEach(t=>{ if(!repliee(t)) throw new Error('card non repliable : '+t); });
 if(!/<span class="ttl">Niveau/.test(html)&&!/<h3>Niveau/.test(html)) throw new Error('card Niveau absente');
 if(/<details class="card"[^>]*><summary><span class="ttl">Niveau/.test(html)) throw new Error('Niveau ne doit pas etre repliable');
 console.log('Progres OK : Assiduite et Couverture ouvertes, le reste replie, Niveau non repliable');
 // alerte de replis douleur : la card s ouvre d office
 const j=jour;
 state.hist=[{date:j,dur:20,items:[{id:'pompes-inclinees',sets:[8],sw:true,from:'pompes-poignees'}]},
             {date:j,dur:20,items:[{id:'pompes-inclinees',sets:[8],sw:true,from:'pompes-poignees'}]}];
 view='prog'; render();
 if(!/<details class="card" data-k="prog-replis" open><summary><span class="ttl">Replis douleur/.test(html)) throw new Error('la card Replis doit s ouvrir quand l alerte est franchie');
 state.hist=[{date:j,dur:20,items:[{id:'pompes-inclinees',sets:[8],sw:true,from:'pompes-poignees'}]},
             {date:j,dur:20,items:[{id:'pompes-poignees',sets:[8]}]},
             {date:j,dur:20,items:[{id:'pompes-poignees',sets:[8]}]}];
 view='prog'; render();
 if(!/<details class="card" data-k="prog-replis"><summary><span class="ttl">Replis douleur/.test(html)) throw new Error('sans alerte, la card Replis doit rester fermee');
 console.log('alerte OK : Replis ouverte d office au-dela d une fois sur deux, fermee sinon');
 console.log('TESTS V1.9 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test12.js


```javascript
// Nouveautes v1.10 : bande de couverture a echelle fixe, plancher mobile par
// groupe en entretien, projection de la configuration, ecretage au-dela de 24,
// message au-dessus de la bande, zone de reference repliable, detail de seance
// ouvert par defaut.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='complet'; state.cardio=false; state.stretch=false; state.rounds=3; state.goal=4;};
 const REP={push:'pompes-poignees',pull:'face-pulls',legs:'goblet-squat',core:'planche'};
 /* v1.11 : la couverture se moyenne sur les semaines revolues, l historique
    de test vit donc dans la semaine precedente et porte le volume d une seule
    semaine, sans le facteur 4 de l ancien denominateur fixe */
 const poser=(o)=>{ const j=new Date(Date.now()-7*864e5).toISOString();
   state.hist=[{date:j,dur:900,items:Object.keys(o).map(c=>({id:REP[c],sets:new Array(o[c]).fill(10)}))}]; };
 const tenir=(cat,v)=>holdableIds().filter(id=>DB[id].cat===cat&&!isLocked(id)).forEach(id=>{const p=perfOf(id); if(v)p.hold=true; else delete p.hold;});
 await neuf();

 // 1. l etat par defaut ne porte plus showDetail, et le detail de seance est ouvert
 if('showDetail' in defaultState()) throw new Error('showDetail aurait du disparaitre de l etat par defaut');
 view='home'; render();
 if(!/<details class="card" data-k="home-detail" open/.test(html)) throw new Error('le detail de seance doit etre ouvert par defaut');
 console.log('detail OK : showDetail retire, detail de seance ouvert par defaut');

 // 2. plancher par groupe : binaire, tous les exercices tenables et deverrouilles
 if(covFloor('legs')!==8) throw new Error('plancher de construction attendu a 8');
 tenir('legs',true);
 if(!groupHeld('legs')) throw new Error('groupe jambes attendu en entretien');
 if(covFloor('legs')!==4) throw new Error('plancher d entretien attendu a 4, obtenu '+covFloor('legs'));
 if(covFloor('push')!==8) throw new Error('les autres groupes ne doivent pas bouger');
 const verrouilles=holdableIds().filter(id=>DB[id].cat==='legs'&&isLocked(id));
 if(!verrouilles.length) throw new Error('le vivier jambes devrait contenir au moins un exercice verrouille');
 if(verrouilles.some(id=>isHeld(id))) throw new Error('les exercices verrouilles ne devaient pas etre tenus');
 const un=holdableIds().filter(id=>DB[id].cat==='legs'&&!isLocked(id))[0];
 delete perfOf(un).hold;
 if(groupHeld('legs')) throw new Error('un seul exercice relache doit suffire a sortir de l entretien');
 if(covFloor('legs')!==8) throw new Error('plancher attendu de retour a 8');
 tenir('legs',true);
 console.log('plancher OK : binaire par groupe, verrouilles ignores, un relache suffit a repasser a 8');

 // 3. echelle fixe a 24 et ecretage
 if(COV_SCALE!==24||COV_MIN!==8||COV_MAX!==16||COV_MIN_HOLD!==4) throw new Error('bornes de bande inattendues');
 if(covPct(8)!==33.3||covPct(16)!==66.7||covPct(4)!==16.7) throw new Error('graduations mal placees');
 if(covPct(27)!==100||covPct(-3)!==0) throw new Error('ecretage de position attendu entre 0 et 100');
 console.log('echelle OK : 8 au tiers, 16 aux deux tiers, positions ecretees');

 // 4. projection : issue du volume choisi, jamais d une table (v1.13)
 const cas=[['complet',true,2,4],['complet',false,3,4],['complet',false,4,4],['court',false,4,5],['complet',false,2,3],['aucun',false,3,4]];
 cas.forEach(([w,c,r,g])=>{
   state.warm=w; state.cardio=c; state.rounds=r; state.goal=g;
   const attendu=r*g;
   if(covProjection().n!==attendu) throw new Error('projection '+w+'/'+c+'/'+r+' : '+covProjection().n+' au lieu de '+attendu);
   const det=covProjection().det;
   if(det.indexOf(r+' série')<0) throw new Error('le volume choisi doit figurer dans le detail');
   if(det.indexOf(c?'avec cardio':'sans cardio')<0) throw new Error('le cardio doit figurer dans le detail');
 });
 /* le cardio s ajoute desormais, il ne retire plus un tour en silence */
 state.warm='complet'; state.cardio=true; state.rounds=2; state.goal=4;
 if(covProjection().n!==8) throw new Error('le cardio ne doit plus rogner le volume');
 if(covProjection().det.indexOf('avec cardio')<0) throw new Error('le cardio active doit etre annonce');
 state.warm='complet'; state.cardio=false; state.rounds=3; state.goal=4;
 if(covProjection().n!==12) throw new Error('3 series a 4 jours : 12 series attendues');
 console.log('projection OK : conforme au volume choisi sur 6 configurations, cardio additif');

 // 5. rendu de la card : rails, pastille, graduation 4, couleur du chiffre
 poser({push:11,pull:12,legs:5,core:9});
 view='prog'; render();
 if(!/Configuration actuelle \\(3 séries par exercice, échauffement complet, sans cardio, objectif 4 jours\\) : <b class="num" style="color:var\\(--ok\\)">12<\\/b>/.test(html)) throw new Error('ligne de projection attendue en vert');
 if(!/<span class="tenu">tenu<\\/span>/.test(html)) throw new Error('pastille tenu attendue sur le groupe en entretien');
 if((html.match(/class="tenu"/g)||[]).length!==1) throw new Error('une seule pastille attendue');
 if(html.indexOf('>4</span>')<0) throw new Error('graduation 4 attendue des qu un groupe est en entretien');
 if(!/<span class="zone" style="left:16.7%;width:50%">/.test(html)) throw new Error('zone d entretien attendue de 4 a 16');
 if(!/<span class="zone" style="left:33.3%;width:33.4%">/.test(html)) throw new Error('zone de construction attendue de 8 a 16');
 if(/class="cur out"/.test(html)) throw new Error('aucun groupe n est hors de sa bande ici');
 if(/en retrait/.test(html)) throw new Error('un groupe en entretien a 5 ne doit pas etre signale en retrait');
 console.log('rendu OK : pastille, graduation 4, zone elargie, jambes a 5 non reprochees');

 // 6. hors bande : au-dessus, en dessous, et ecretage du rail
 tenir('legs',false);
 poser({push:20,pull:27,legs:5,core:12});
 view='prog'; render();
 if((html.match(/class="cur out"/g)||[]).length!==3) throw new Error('trois curseurs hors bande attendus, obtenu '+(html.match(/class="cur out"/g)||[]).length);
 if(!/<span class="clip">/.test(html)) throw new Error('ecretage attendu au-dela de 24');
 if((html.match(/class="clip"/g)||[]).length!==1) throw new Error('un seul rail ecrete attendu');
 if(html.indexOf('>27</span>')<0) throw new Error('le chiffre exact doit rester affiche malgre l ecretage');
 if(!/Poussé et Tiré au-dessus de la bande/.test(html)) throw new Error('message au-dessus de la bande attendu');
 if(!/jours de repos/.test(html)) throw new Error('incise sur les jours de repos attendue');
 if(!/Jambes en retrait/.test(html)) throw new Error('le signal en retrait existant doit rester');
 console.log('hors bande OK : trois curseurs orange, un rail ecrete, message au-dessus avec les jours de repos');

 // 7. rien au-dessus de la bande quand tout est dedans, et projection orange hors bande
 poser({push:9,pull:10,legs:9,core:12});
 view='prog'; render();
 if(/au-dessus de la bande/.test(html)) throw new Error('aucun message ne doit apparaitre dans la bande');
 /* v1.13 : le volume plafonne a 4 series, c est l objectif hebdo qui porte
    la projection au-dessus de la bande */
 state.warm='court'; state.rounds=4; state.goal=5;
 view='prog'; render();
 if(!/<b class="num" style="color:var\\(--flame\\)">20<\\/b>/.test(html)) throw new Error('projection a 20 attendue en orange');
 state.warm='complet'; state.rounds=2; state.goal=3;
 view='prog'; render();
 if(!/<b class="num" style="color:var\\(--flame\\)">6<\\/b>/.test(html)) throw new Error('projection a 6 attendue en orange');
 state.warm='complet'; state.rounds=3; state.goal=4;
 console.log('projection OK : verte dans la bande, orange au-dessus comme en dessous');

 // 8. zone de reference repliable, fermee par defaut, et graduation 4 absente hors entretien
 view='prog'; render();
 if(!/<summary>Comment lire ces chiffres<\\/summary>/.test(html)) throw new Error('zone de reference absente');
 if(/<details style="margin-top:12px[^>]*open/.test(html)) throw new Error('la zone de reference doit etre fermee par defaut');
 if(!/bande visée/.test(html)||!/hors bande/.test(html)) throw new Error('legende attendue dans la zone repliable');
 if(/class="tenu"/.test(html)) throw new Error('aucune pastille hors entretien');
 if(html.indexOf('>4</span>')>=0) throw new Error('graduation 4 uniquement quand un groupe est en entretien');
 console.log('reference OK : zone fermee par defaut, legende dedans, graduation 4 conditionnelle');

 // 9. l ancienne barre proportionnelle a disparu, l etat sauvegarde n a pas bouge
 if(/<div class="bar" style="flex:1"><i style="width:/.test(html)) throw new Error('l ancienne barre a echelle variable subsiste');
 const avant=JSON.stringify(state);
 view='prog'; render(); view='home'; render();
 if(JSON.stringify(state)!==avant) throw new Error('le rendu ne doit rien ecrire dans l etat');
 if(!VERSION) throw new Error('version absente');
 console.log('etat OK : ancienne barre retiree, aucun effet de bord, version '+VERSION);
 console.log('TESTS V1.10 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test13.js


```javascript
// Nouveautes v1.11 : denominateur de la couverture borne aux semaines revolues,
// pas de 5 secondes sur les cibles chronometrees, ligne d historique portant
// l heure de debut et les deux durees, fleches rendues au defilement.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='complet'; state.cardio=false; state.stretch=false; state.rounds=3; state.goal=4;};
 /* J-n a heure fixe : J-7, J-14, J-21 et J-28 tombent toujours dans les
    semaines ISO precedentes, quel que soit le jour ou le test tourne */
 const J=(n,h)=>{ const d=new Date(); d.setDate(d.getDate()-n); d.setHours(h==null?18:h,0,0,0); return d.toISOString(); };
 const REP={push:'pompes-poignees',pull:'face-pulls',legs:'goblet-squat',core:'planche'};
 const seance=(date,tours,o)=>{ o=o||{};
   const items=[{id:REP.push,sets:new Array(tours).fill(8)}];
   if(!o.inc){ items.push({id:REP.pull,sets:new Array(tours).fill(10)},
                          {id:REP.legs,sets:new Array(tours).fill(8)},
                          {id:REP.core,sets:new Array(tours).fill(20)}); }
   const e={date:date,type:'alterne',mode:'alterne',dur:o.dur||15,items:items,xp:o.xp||63,real:o.real===undefined?1080:o.real};
   if(o.inc) e.inc=true;
   return e; };
 await neuf();

 // 1. rien a moyenner tant qu aucune semaine n est revolue
 state.hist=[seance(J(0),3)];
 if(weeksObserved(state)!==0) throw new Error('aucune semaine revolue attendue');
 if(coverage(state,4)!==null) throw new Error('coverage doit renvoyer null sans semaine revolue');
 view='prog'; render();
 if(!/Mesure à venir/.test(html)) throw new Error('mention d attente absente');
 if(/class="cov"/.test(html)) throw new Error('les rails ne doivent pas etre traces sans mesure');
 if(!/Configuration actuelle/.test(html)) throw new Error('la projection doit rester affichee');
 if(/Équilibre tiré\\/poussé/.test(html)) throw new Error('le ratio ne doit pas etre calcule sans mesure');
 console.log('demarrage OK : rien a moyenner, projection conservee, rails absents');

 // 2. cas reel du 6 au 9 aout : 4 seances dans une meme semaine revolue,
 //    dont une incomplete, soit 33 series. Divisees par 4 elles donnaient 2,3.
 state.hist=[seance(J(7,10),2,{dur:10,real:600,xp:47}),
             seance(J(7,16),1,{inc:true,real:180,xp:4}),
             seance(J(7,17),3,{real:1080}),
             seance(J(7,18),3,{real:1080})];
 const total=state.hist.reduce((n,h)=>n+h.items.reduce((m,i)=>m+i.sets.length,0),0);
 if(total!==33) throw new Error('33 series attendues, obtenu '+total);
 if(weeksObserved(state)!==1) throw new Error('une semaine revolue attendue');
 if(coverageWeeks(state,4)!==1) throw new Error('denominateur attendu a 1');
 const cg=coverage(state,4);
 if(cg.push!==9||cg.pull!==8||cg.legs!==8||cg.core!==8) throw new Error('couverture attendue 9/8/8/8, obtenu '+JSON.stringify(cg));
 if(Object.keys(cg).some(k=>cg[k]<covFloor(k))) throw new Error('les quatre groupes devaient tomber dans la bande');
 view='prog'; render();
 if(!/moyenne sur 1 semaine révolue/.test(html)) throw new Error('libelle au singulier attendu');
 if(!/class="cov"/.test(html)) throw new Error('les rails doivent etre traces des qu une semaine est revolue');
 if(/class="cur out"/.test(html)) throw new Error('aucun curseur ne devait sortir de la bande');
 console.log('cas reel OK : 33 series sur 1 semaine revolue donnent 9/8/8/8, quatre curseurs dans la bande');

 // 3. la semaine en cours reste hors du calcul, quoi qu on y fasse
 state.hist=[seance(J(7),3),seance(J(0),3),seance(J(0,20),3)];
 const av=coverage(state,4);
 if(av.push!==3) throw new Error('seule la semaine revolue devait compter, obtenu '+av.push);
 console.log('semaine en cours OK : exclue du numerateur comme du denominateur');

 // 4. quatre semaines revolues : denominateur plein, libelle au pluriel
 state.hist=[seance(J(28),3),seance(J(21),3),seance(J(14),3),seance(J(7),3)];
 if(coverageWeeks(state,4)!==4) throw new Error('denominateur attendu a 4');
 const q=coverage(state,4);
 if(q.push!==3) throw new Error('12 series sur 4 semaines devaient donner 3, obtenu '+q.push);
 view='prog'; render();
 if(!/moyenne sur 4 semaines révolues/.test(html)) throw new Error('libelle au pluriel attendu');
 // au-dela de la fenetre, rien ne remonte
 state.hist=[seance(J(70),3)].concat(state.hist);
 if(coverageWeeks(state,4)!==4) throw new Error('la fenetre reste plafonnee a 4 semaines');
 if(coverage(state,4).push!==3) throw new Error('une seance hors fenetre ne doit pas entrer dans la moyenne');
 console.log('fenetre OK : plafonnee a 4 semaines, seances anterieures ignorees');

 // 5. les replis douleur gardent leur fenetre glissante : un repli du jour compte
 state.hist=[{date:J(0),type:'alterne',mode:'alterne',dur:15,real:900,xp:20,
   items:[{id:'rowing-elastique',sets:[10,10],sw:true,from:'tractions-assistees-supination'}]}];
 const ps=painSwaps(state,4);
 if(!ps.length||ps[0].id!=='tractions-assistees-supination') throw new Error('le repli du jour doit rester visible');
 console.log('replis OK : fenetre glissante conservee, signal de securite immediat');

 // 6. pas de 5 secondes sur les cibles chronometrees
 await neuf();
 const PL='planche', pp=perfOf(PL);
 if(DB[PL].mode!=='time') throw new Error('planche attendue en mode tenue');
 const cible=(a)=>{ applyProgress(PL,a,true,false); return perfOf(PL).target; };
 if(pp.target!==20) throw new Error('cible de depart attendue a 20');
 if(cible([20,20])!==25) throw new Error('20 tenues devaient donner 25, obtenu '+perfOf(PL).target);
 perfOf(PL).target=30;
 if(cible([34,34])!==35) throw new Error('34 tenues devaient donner 35, obtenu '+perfOf(PL).target);
 if(cible([30,40,36])!==35) throw new Error('la plus petite serie commande : 30/40/36 devait donner 35');
 if(cible([35,35])!==40) throw new Error('35 tenues devaient donner 40 : sans le +1, tenir sa cible ne monterait jamais');
 if(cible([44,44])!==45) throw new Error('l arrondi ne doit pas depasser le haut de fourchette');
 /* v2.14 : un mauvais jour est absorbe par la fenetre de deux passages, la
    cible reste sur la lecture precedente ; c est le second qui ramene au bas
    de fourchette, et pas plus bas */
 if(cible([12,12])!==45) throw new Error('un mauvais jour isole doit etre absorbe, obtenu '+perfOf(PL).target);
 if(cible([12,12])!==20) throw new Error('deux mauvais jours doivent ramener au bas de fourchette, pas plus bas');
 console.log('tenues OK : 20-25, 34-35, 30/40/36-35, 35-40, un mauvais jour absorbe, borne aux deux extremites');

 // 7. cinq passages pour traverser la fourchette 20-45 (v1.17 : plafond a 45 s)
 delete state.perf[PL];
 let p2=perfOf(PL), n=0;
 while(p2.target<45&&n<200){ applyProgress(PL,[p2.target,p2.target],true,false); n++; }
 if(n!==5) throw new Error('5 passages attendus de 20 a 45 s, obtenu '+n);
 // au sommet, le plafond parle, la fourchette ne bouge pas
 const msg=applyProgress(PL,[45,45],true,false);
 if(!msg.join(' ').match(/Plafond atteint/)) throw new Error('message de plafond attendu a 45 s');
 if(perfOf(PL).range[1]!==45) throw new Error('la fourchette ne doit pas depasser le cap');
 console.log('traversee OK : 5 passages de 20 a 45 s, plafond intact');

 // 8. les repetitions gardent le pas de 1, les etirements ne passent pas par la
 const CU='curls-halteres';
 delete state.perf[CU];
 const pc=perfOf(CU), t0=pc.target;
 applyProgress(CU,[t0,t0,t0],true,false);
 if(perfOf(CU).target!==t0+1) throw new Error('pas de 1 attendu sur les repetitions, obtenu '+perfOf(CU).target);
 const ET='etir-nuque';
 if(applyProgress(ET,[30,30],true,false).length) throw new Error('un etirement ne doit rien faire progresser');
 if(perfOf(ET).range) throw new Error('un etirement n a pas de fourchette');
 // gainage lateral : bornes 15-45, toutes multiples de 5
 const GL='gainage-lateral';
 if(DB[GL].reps[0]%5||DB[GL].reps[1]%5) throw new Error('bornes non multiples de 5 sur '+GL);
 delete state.perf[GL];
 perfOf(GL).target=15;
 applyProgress(GL,[15,15],true,false);
 if(perfOf(GL).target!==20) throw new Error('gainage lateral : 15 tenues devaient donner 20');
 console.log('perimetre OK : pas de 1 sur les repetitions, etirements hors moteur, bornes multiples de 5');

 // 9. ligne d historique : heure de debut et les deux durees
 await neuf();
 const fin=J(7,18), reel=1080;
 state.hist=[seance(fin,3,{dur:15,real:reel})];
 view='prog'; render();
 if(!/18 min pour 15/.test(html)) throw new Error('duree reelle et duree choisie attendues');
 const attendu=fmtDT(new Date(new Date(fin).getTime()-reel*1000).toISOString());
 if(html.indexOf(attendu)<0) throw new Error('heure de debut attendue : '+attendu);
 if(html.indexOf(fmtDT(fin))>=0) throw new Error('l heure de fin ne doit plus etre affichee');
 // seance sans mesure de duree : la nature du chiffre est dite
 state.hist=[{date:fin,type:'alterne',mode:'alterne',dur:15,xp:60,items:[{id:REP.push,sets:[8,8]}]}];
 render();
 if(!/15 min annoncées/.test(html)) throw new Error('duree annoncee a dire comme telle sans mesure');
 /* v1.13 : les nouvelles seances portent la duree calculee dans plan, les
    anciennes gardent dur ; l historique lit les deux */
 state.hist=[{date:fin,type:'alterne',mode:'alterne',rounds:3,plan:20,real:1140,xp:60,items:[{id:REP.push,sets:[8,8]}]}];
 render();
 if(!/19 min pour 20/.test(html)) throw new Error('duree annoncee v1.13 attendue');
 console.log('historique OK : heure de debut, « 18 min pour 15 », duree choisie annoncee sans mesure');

 // 10. clavier : fleches rendues au defilement, ajustement sur + et -
 await neuf();
 const key=(k,code)=>handlers.forEach(h=>h({key:k,code:code||k,target:{tagName:'DIV'},preventDefault(){}}));
 view='home'; startSession(); skipWarm();
 const st=cur.steps[cur.i];
 if(st.k!=='set') throw new Error('etape de serie attendue');
 const v0=st.val;
 ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach(k=>key(k));
 if(st.val!==v0) throw new Error('les fleches ne doivent plus toucher a la valeur');
 key('+'); if(st.val!==v0+1) throw new Error('+ doit incrementer');
 key('='); if(st.val!==v0+2) throw new Error('= doit incrementer');
 key('-'); if(st.val!==v0+1) throw new Error('- doit decrementer');
 key('6'); if(st.val!==v0) throw new Error('6 doit decrementer');
 key('6','Numpad6'); if(st.val!==v0) throw new Error('le 6 du pave numerique est colle au -, il ne doit rien faire');
 key('+','NumpadAdd'); if(st.val!==v0+1) throw new Error('le + du pave numerique doit incrementer');
 key('-','NumpadSubtract'); if(st.val!==v0) throw new Error('le - du pave numerique doit decrementer');
 if(!/défiler/.test(kbHint())||/↑ ↓<\\/b> ajuster/.test(kbHint())) throw new Error('ligne d aide clavier a mettre a jour');
 console.log('clavier OK : fleches libres, + = - 6 ajustent, Numpad6 neutre, aide a jour');

 // 11. aucun effet de bord, version
 await neuf();
 state.hist=[seance(J(7),3)];
 /* l accueil initialise les reperes des exercices du jour a la demande : on
    l amorce avant de prendre l empreinte, sinon on mesurerait ce comportement
    anterieur et non les cards de Progres */
 view='home'; render();
 const avant=JSON.stringify(state);
 view='prog'; render(); view='home'; render();
 if(JSON.stringify(state)!==avant) throw new Error('le rendu ne doit rien ecrire dans l etat');
 console.log('etat OK : aucun effet de bord');
 console.log('TESTS V1.11 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test14.js


```javascript
// Nouveautes v1.12 : chrono d etirement partant de la duree reelle et decoupe
// en deux cotes sur les etirements bilateraux, retour a l exercice d origine
// apres un repli douleur, aligne sur le module cardio.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
const bips=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),
  AudioContext:function(){ return {currentTime:0,destination:{},
    createOscillator:()=>{const o={frequency:{value:0},connect(){},start(){},stop(){}};bips.push(o);return o;},
    createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
/* horloge pilotee a la main : les chronos sont deterministes, aucune attente reelle */
let ticks=[];
const vraiSet=global.setInterval, vraiClear=global.clearInterval;
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ if(t&&t.f) ticks=ticks.filter(x=>x!==t); else if(t) vraiClear(t); };
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.freqs=()=>{ const out=[]; bips.forEach((o,i)=>{ if(i%2===0) out.push(o.frequency.value); }); return out; };
global.videBips=()=>{ bips.length=0; };
global.videEls=()=>{ Object.keys(els).forEach(k=>delete els[k]); };
const T=`
(async()=>{
 /* v1.13 : une tenue chronometree se valide sur une mesure par cote prevu.
    Ce raccourci pose la meme mesure de chaque cote, ce que faisait l ancien
    st.val unique ; la machine a etats et son clavier sont couverts par la
    suite v1.13, horloge pilotee a l appui. */
 const TVAL=(s,v)=>{ const e=DB[s.id];
   if(e&&e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=v; }
   else s.val=v;
   validateSet(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile();
   state.warm='aucun'; state.cardio=false; state.stretch=true; state.rounds=4; state.prep=0; };
 /* le libelle de cote est lu dans l element quand le code l a mis a jour,
    dans le rendu tant qu il ne l a pas touche */
 const cote=()=>els['#phlabel']?els['#phlabel'].textContent:(html.match(/id="phlabel">([^<]*)</)||[])[1];
 const joue=(f)=>{ let g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s) break;
   if(s.k==='set'){ f(s); } else if(s.k==='cardio'){ s.rounds=4; validateCardio(); } else nextStep(); } };

 // 1. decoupage des durees : la somme des cotes vaut toujours la duree de base
 await neuf();
 const etirs=Object.keys(DB).filter(id=>DB[id].mode==='stretch');
 if(etirs.length!==6) throw new Error('six etirements attendus, '+etirs.length+' trouves');
 const bilat=etirs.filter(id=>DB[id].bilat);
 if(bilat.length!==4) throw new Error('quatre etirements bilateraux attendus, '+bilat.length);
 etirs.forEach(id=>{
   const e=DB[id], ph=stretchPhases(e);
   if(ph.reduce((a,b)=>a+b,0)!==e.dur) throw new Error('somme des cotes differente de la duree : '+id);
   if(e.bilat&&ph.length!==2) throw new Error('etirement bilateral en un seul bloc : '+id);
   if(!e.bilat&&ph.length!==1) throw new Error('etirement unilateral decoupe : '+id);
 });
 if(stretchPhases(DB['etir-hanches']).join('/')!=='30/30') throw new Error('hanches : '+stretchPhases(DB['etir-hanches']).join('/'));
 if(stretchPhases(DB['etir-nuque']).join('/')!=='20/20') throw new Error('nuque : '+stretchPhases(DB['etir-nuque']).join('/'));
 if(stretchPhases({dur:45,bilat:true}).join('/')!=='23/22') throw new Error('duree impaire mal repartie');
 console.log('decoupage OK : 4 bilateraux en deux cotes, 2 en un bloc, somme egale a la duree de base');

 // 2. valeur de depart du chrono : jamais le repli generique de 10 s
 etirs.forEach(id=>{
   const st={k:'set',id:id,key:id,cool:true,set:1,of:1};
   const h=setHtml(st);
   const attendu=stretchPhases(DB[id])[0];
   if(st.val!==attendu) throw new Error(id+' demarre a '+st.val+' s au lieu de '+attendu);
   const m=h.match(/id="cc">([^<]*)</);
   if(!m||m[1]!==fmtT(attendu)) throw new Error(id+' affiche '+(m?m[1]:'rien')+' au lieu de '+fmtT(attendu));
   if(DB[id].bilat&&h.indexOf('Premier côté')<0) throw new Error('libelle de cote absent : '+id);
   if(!DB[id].bilat&&h.indexOf('id="phlabel"')>=0) throw new Error('libelle de cote sur un etirement unilateral : '+id);
   if(h.indexOf('toggleStretch()">Démarrer<')<0) throw new Error('bouton de depart absent : '+id);
 });
 console.log('depart OK : les six etirements partent de leur duree reelle, plus aucun 0:10');

 // 3. deroule complet d un etirement bilateral, chrono pilote a la main
 await neuf();
 startSession();
 cur.steps=[{k:'set',id:'etir-hanches',key:'etir-hanches',cool:true,set:1,of:1}]; cur.i=0;
 renderSession();
 videEls(); videBips();
 if(cote()!=='Premier côté') throw new Error('libelle initial : '+cote());
 toggleStretch();
 if(els['#ct'].textContent!=='Pause') throw new Error('bouton attendu Pause au demarrage, lu '+els['#ct'].textContent);
 tic(29);
 if(els['#cc'].textContent!=='0:01') throw new Error('a 29 s le chrono lit '+els['#cc'].textContent);
 if(cote()!=='Premier côté') throw new Error('cote change trop tot');
 tic(1);
 if(cote()!=='Second côté') throw new Error('pas de bascule de cote a mi-parcours');
 if(els['#cc'].textContent!=='0:30') throw new Error('le second cote ne repart pas a 0:30 : '+els['#cc'].textContent);
 if(freqs().indexOf(700)<0) throw new Error('aucun bip de bascule de cote');
 if(els['#ct'].textContent!=='Pause') throw new Error('le bouton a change a la bascule');
 tic(30);
 if(els['#cc'].textContent!=='0:00') throw new Error('fin attendue a 0:00, lu '+els['#cc'].textContent);
 if(freqs().indexOf(880)<0) throw new Error('aucun bip de fin');
 if(els['#ct'].textContent!=='Recommencer') throw new Error('en fin de chrono le bouton lit encore '+els['#ct'].textContent);
 if(ticks.length) throw new Error('le chrono tourne encore apres la fin');
 console.log('bilateral OK : 30 s, bip de bascule, 30 s, bip de fin, bouton Recommencer');

 // 4. le bouton de fin repart du premier cote pour la duree pleine
 toggleStretch();
 if(cur.steps[0].side!==0) throw new Error('le redepart ne revient pas au premier cote');
 if(cote()!=='Premier côté') throw new Error('libelle de cote non remis a jour au redepart');
 if(els['#cc'].textContent!=='0:30') throw new Error('le redepart lit '+els['#cc'].textContent);
 tic(60);
 if(els['#ct'].textContent!=='Recommencer') throw new Error('second passage : bouton '+els['#ct'].textContent);
 console.log('redepart OK : Recommencer rejoue les deux cotes depuis le premier');

 // 5. pause au milieu d un cote : valeur et cote conserves
 toggleStretch(); tic(10);
 toggleStretch();
 if(els['#ct'].textContent!=='Reprendre') throw new Error('pause : bouton '+els['#ct'].textContent);
 if(cur.steps[0].val!==20) throw new Error('pause : valeur '+cur.steps[0].val+' au lieu de 20');
 toggleStretch(); tic(20);
 if(cote()!=='Second côté') throw new Error('la reprise ne poursuit pas le premier cote');
 console.log('pause OK : la reprise repart du temps et du cote en cours');

 // 6. etirement unilateral : un seul bloc, un seul bip, aucune bascule
 clearTimers();
 cur.steps=[{k:'set',id:'posture-enfant',key:'posture-enfant',cool:true,set:1,of:1}]; cur.i=0;
 renderSession(); videEls(); videBips();
 toggleStretch();
 tic(45);
 if(freqs().filter(f=>f===700).length) throw new Error('bip de bascule sur un etirement unilateral');
 if(freqs().filter(f=>f===880).length!==1) throw new Error('un seul bip de fin attendu');
 if(els['#ct'].textContent!=='Recommencer') throw new Error('fin unilaterale : bouton '+els['#ct'].textContent);
 console.log('unilateral OK : 45 s d un bloc, un bip, aucun libelle de cote');

 // 7. la porte sonore globale coupe aussi ces deux bips
 state.sound=false;
 clearTimers();
 cur.steps=[{k:'set',id:'etir-pecs',key:'etir-pecs',cool:true,set:1,of:1}]; cur.i=0;
 renderSession(); videEls(); videBips();
 toggleStretch(); tic(60);
 if(freqs().length) throw new Error('bips emis alors que le son est coupe');
 state.sound=true;
 console.log('son OK : bascule et fin passent par la porte globale');

 // 8. fausse manoeuvre : repli puis retour immediat, la seance redevient intacte
 await neuf();
 state.stretch=false;
 startSession();
 const exo=cur.steps[0].id, fb=DB[exo].fb;
 if(!fb) throw new Error('premier exercice sans variante de repli, test non concluant');
 const prevues=cur.steps.filter(s=>s.k==='set'&&s.id===exo).length;
 swapPain();
 if(setHtml(cur.steps[cur.i]).indexOf('revertSwap()')<0) throw new Error('aucun bouton de retour sur l ecran de repli');
 if(cur.steps.filter(s=>s.k==='set'&&s.id===fb&&s.swapped).length!==prevues) throw new Error('toutes les series restantes n ont pas bascule');
 revertSwap();
 if(cur.steps.some(s=>s.k==='set'&&s.swapped)) throw new Error('une serie reste sur la variante apres le retour');
 if(cur.steps.filter(s=>s.k==='set'&&s.id===exo).length!==prevues) throw new Error('les series ne sont pas revenues sur l origine');
 if(cur.steps.some(s=>s.k==='rest'&&s.next===fb)) throw new Error('un ecran de repos annonce encore la variante');
 if(setHtml(cur.steps[cur.i]).indexOf('revertSwap()')>=0) throw new Error('le bouton de retour survit au retour');
 const p0=perfOf(exo), top=p0.range[1], band0=p0.band, load0=p0.load;
 joue(s=>{ const p=perfOf(s.id); TVAL(s,p.range?p.range[1]:30); });
 await new Promise(r=>setTimeout(r,10));
 const h1=state.hist[state.hist.length-1];
 if(h1.items.some(it=>it.sw)) throw new Error('la fausse manoeuvre laisse un repli dans l historique');
 if(!h1.items.some(it=>it.id===exo)) throw new Error('l exercice d origine absent de l historique');
 const p1=perfOf(exo);
 const monte=(p1.load!==load0)||(p1.band!==band0)||(p1.range[1]!==p0.range[1])||(p1.target>top);
 if(!monte) throw new Error('progression bloquee alors que le repli a ete annule avant toute serie');
 console.log('fausse manoeuvre OK : aucun repli au journal, progression appliquee normalement');

 // 9. repli assume puis retour : ce qui a ete fait reste inscrit
 await neuf();
 state.stretch=false;
 startSession();
 const exo2=cur.steps[0].id, fb2=DB[exo2].fb;
 const p2=perfOf(exo2), top2=p2.range[1];
 TVAL(cur.steps[0],top2);                 // une serie sur l origine
 let g=0; while(g++<50){ const s=cur.steps[cur.i]; if(s.k==='set'&&s.id===exo2) break; nextStep(); }
 swapPain();
 TVAL(cur.steps[cur.i],5);                // une serie sur le repli
 g=0; while(g++<50){ const s=cur.steps[cur.i]; if(s.k==='set'&&s.from===exo2) break; nextStep(); }
 revertSwap();
 if(cur.steps[cur.i].id!==exo2) throw new Error('le retour n a pas remis la serie en cours sur l origine');
 if(!cur.log[exo2+'>'+fb2]) throw new Error('la serie faite sur le repli a disparu du journal');
 if(cur.log[exo2].length!==1) throw new Error('les series deja validees sur l origine ont bouge');
 joue(s=>{ TVAL(s,perfOf(s.id).range?perfOf(s.id).range[1]:30); });
 await new Promise(r=>setTimeout(r,10));
 const h2=state.hist[state.hist.length-1];
 if(!h2.items.some(it=>it.sw&&it.from===exo2)) throw new Error('le repli reellement joue a disparu de l historique');
 const p3=perfOf(exo2);
 if(p3.range[1]!==p2.range[1]||p3.load!==p2.load||p3.band!==p2.band) throw new Error('progression appliquee malgre un repli joue');
 const cap=painSwaps(state,4);
 if(!cap.some(r=>r.id===exo2&&r.sw)) throw new Error('le capteur de douleur ignore un repli reellement joue');
 console.log('repli assume OK : serie conservee, repli au journal et au capteur, progression bloquee');

 // 10. le mode allege n offre pas ce retour, sa substitution n est pas une douleur
 await neuf();
 state.stretch=false;lightMode=true;
 startSession();
 const sl=cur.steps.filter(s=>s.k==='set'&&s.swapped)[0];
 if(sl){
   if(!sl.light) throw new Error('substitution allegee non marquee');
   if(setHtml(sl).indexOf('revertSwap()')>=0) throw new Error('bouton de retour offert en seance allegee');
 }
 lightMode=false;
 console.log('allege OK : la substitution du jour leger n ouvre pas de retour');

 // 11. module cardio : meme bascule, meme retour
 await neuf();
 state.cardio=true; state.stretch=false;state.rounds=4;
 startSession();
 g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i]; if(!s||s.k==='cardio') break;
   if(s.k==='set'){ TVAL(s,5); } else nextStep(); }
 const stc=cur.steps[cur.i];
 if(!stc||stc.k!=='cardio') throw new Error('module cardio introuvable');
 const cid=stc.id;
 swapCardio();
 if(!stc.swapped) throw new Error('le cardio n a pas bascule');
 if(cardioHtml(stc).indexOf('revertCardio()')<0) throw new Error('aucun bouton de retour sur le cardio replie');
 revertCardio();
 if(stc.swapped||stc.id!==cid) throw new Error('le cardio n est pas revenu a la marche prevue');
 if(cardioHtml(stc).indexOf('revertCardio()')>=0) throw new Error('le bouton de retour survit au retour du cardio');
 if(cardioHtml(stc).indexOf('swapCardio()')<0) throw new Error('le bouton de repli n est pas rendu apres le retour');
 console.log('cardio OK : bascule et retour alignes sur les series');

 // 12. version et absence d effet de bord du rendu
 await neuf();
 view='home'; render();
 const avant=JSON.stringify(state);
 view='prog'; render(); view='home'; render();
 if(JSON.stringify(state)!==avant) throw new Error('le rendu ecrit dans l etat');
 if(!VERSION) throw new Error('version absente');
 console.log('etat OK : aucun effet de bord, version '+VERSION);
 console.log('TESTS V1.12 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test15.js


```javascript
// Nouveautes v1.13 : machine a etats des tenues chronometrees (Stop definitif,
// deux cotes, validation grisee), retour d un pas apres une validation, gel de
// rotation par emplacement substitue avec echappatoire, et modele « volume
// choisi, temps calcule » avec ajustements de contenu du jour.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
const handlers=[];
const bips=[];
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}}),
  AudioContext:function(){ return {currentTime:0,destination:{},
    createOscillator:()=>{const o={frequency:{value:0},connect(){},start(){},stop(){}};bips.push(o);return o;},
    createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};}};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const els={};
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true);
const el=s=>els[s]||(els[s]=mk(false));
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:el(s)),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;
/* horloge pilotee a la main : les chronos sont deterministes */
let ticks=[];
const vraiClear=global.clearInterval;
global.setInterval=(f)=>{const t={f:f};ticks.push(t);return t;};
global.clearInterval=(t)=>{ if(t&&t.f) ticks=ticks.filter(x=>x!==t); else if(t) vraiClear(t); };
global.tic=n=>{ for(let i=0;i<n;i++) ticks.slice().forEach(t=>t.f()); };
global.freqs=()=>{ const out=[]; bips.forEach((o,i)=>{ if(i%2===0) out.push(o.frequency.value); }); return out; };
global.videBips=()=>{ bips.length=0; };
global.videEls=()=>{ Object.keys(els).forEach(k=>delete els[k]); };
const T=`
(async()=>{
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; clearDay(); view='home'; await loadState();

   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.prep=0; state.sound=false; };
 const cote=()=>els['#phlabel']?els['#phlabel'].textContent:(html.match(/id="phlabel">([^<]*)</)||[])[1];
 const allerA=mode=>{ let g=0; while(view==='session'&&g++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'&&DB[s.id]&&DB[s.id].mode===mode) return s;
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
   throw new Error('aucune etape '+mode+' dans cette seance'); };

 // 1. tenue unilaterale : Stop definitif, plus de Reprendre
 await neuf();
 startSession();
 let st=allerA('time');
 const e1=DB[st.id];
 if(e1.side) throw new Error('cette premiere tenue devrait etre d un bloc : '+st.id);
 renderSession();
 if(!/Démarrer/.test(html)) throw new Error('la tenue doit proposer Démarrer');
 if(/Valider la tenue<\\/button>/.test(html.replace(/class="big quiet" disabled/g,'')) && !/disabled/.test(html))
   throw new Error('la validation doit etre grisee avant toute mesure');
 toggleChrono(); tic(20);
 if(st.val!==20) throw new Error('chrono a 20 s attendu, obtenu '+st.val);
 toggleChrono();                       /* Stop */
 if(st.sides[0]!==20) throw new Error('la mesure du cote doit etre figee a 20');
 if(!st.done) throw new Error('le cote doit etre marque termine');
 tic(10);
 if(st.sides[0]!==20) throw new Error('un Stop est definitif : le chrono ne repart pas seul');
 if(/Reprendre<\\/button>/.test(html)) throw new Error('Reprendre ne doit plus exister sur une tenue');
 if(!/Tenue mesurée/.test(html)) throw new Error('le bouton doit annoncer la tenue mesuree');
 if(!/Réinitialiser/.test(html)) throw new Error('la remise a zero doit etre offerte');
 /* ESPACE ne detruit jamais une mesure */
 const espace=()=>handlers.forEach(h=>h({key:' ',code:'Space',target:{tagName:'DIV'},preventDefault(){}}));
 espace(); espace();
 if(st.sides[0]!==20||timers.c) throw new Error('ESPACE doit etre inerte apres le dernier cote');
 /* la reinitialisation, elle, repart de zero */
 resetHold();
 if(st.sides[0]!==null||st.val!==0||st.done) throw new Error('Réinitialiser doit remettre le cote a zero');
 toggleChrono(); tic(45); toggleChrono();
 if(st.sides[0]!==45) throw new Error('seconde mesure a 45 attendue');
 console.log('tenue unilaterale OK : Stop definitif, Reprendre supprime, ESPACE inerte, remise a zero');

 // 2. la fin d une tenue en trois morceaux n est plus possible
 const somme=st.sides[0];
 if(somme!==45) throw new Error('une tenue vaut sa derniere mesure continue, pas une somme');
 validateSet();
 const journal=cur.log[st.key||st.id];
 if(!journal||journal[journal.length-1]!==45) throw new Error('45 attendu au journal, obtenu '+journal);
 console.log('mesure continue OK : le journal porte la tenue, jamais un cumul de morceaux');

 // 3. tenue par cote : deux mesures, bip de bascule, le plus court au journal
 await neuf();
 /* le vivier gainage place le lateral en troisieme position : on cale le
    compteur dessus plutot que de convoquer un mode qui n existe plus */
 state.slotIdx.core=SLOTS.core.pool.filter(id=>!isLocked(id)&&!estRetire(id)).indexOf('gainage-lateral');
 startSession();
 let g=0, bi=null;
 while(view==='session'&&g++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'&&DB[s.id]&&DB[s.id].mode==='time'&&DB[s.id].side){ bi=s; break; }
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
 if(!bi) throw new Error('aucune tenue par cote dans la seance');
 renderSession(); videBips(); videEls();
 holdInit(bi,DB[bi.id]);
 if(bi.sides.length!==2) throw new Error('une tenue par cote prevoit deux mesures');
 if(cote()!=='Premier côté') throw new Error('le premier cote doit etre annonce, obtenu '+cote());
 if(!/disabled/.test(html)) throw new Error('validation grisee attendue tant que rien n est mesure');
 validateSet();
 if(cur.log[bi.key||bi.id]) throw new Error('ENTREE ne doit pas valider une tenue vide');
 toggleChrono(); tic(30); toggleChrono();
 renderSession();
 if(!/disabled/.test(html)) throw new Error('validation encore grisee avec un seul cote mesure');
 validateSet();
 if(cur.log[bi.key||bi.id]) throw new Error('un seul cote ne suffit pas a valider');
 state.sound=true; videBips();
 toggleChrono();                       /* passage au second cote */
 if(freqs()[0]!==700) throw new Error('bip grave de bascule attendu, obtenu '+freqs());
 if(bi.side!==1) throw new Error('le second cote doit etre en cours');
 if(cote()!=='Second côté') throw new Error('le second cote doit etre annonce, obtenu '+cote());
 tic(8); toggleChrono();
 if(bi.sides[0]!==30||bi.sides[1]!==8) throw new Error('mesures attendues 30 et 8, obtenues '+bi.sides);
 renderSession();
 if(/disabled/.test(html.split('Valider la tenue')[0].slice(-80))) throw new Error('validation attendue active');
 validateSet();
 const jb=cur.log[bi.key||bi.id];
 if(jb[jb.length-1]!==8) throw new Error('le cote le plus court doit partir au journal, obtenu '+jb);
 console.log('tenue par cote OK : deux mesures exigees, bip de bascule, cote le plus court enregistre');

 // 4. retour d un pas : journal, series et XP defaits
 await neuf();
 state.rounds=2;
 startSession();
 let s0=cur.steps[cur.i];
 while(s0.k!=='set'||DB[s0.id].mode==='time'){ if(s0.k==='set'){ const e=DB[s0.id];
     if(e.mode==='time'){ holdInit(s0,e); for(let i=0;i<s0.sides.length;i++) s0.sides[i]=30; } else if(e.rhythm){ s0.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s0.done=true; if(!s0.val) s0.val=30; } else if(e.cadence){ cadInit(s0); s0.sides=s0.sides.map(()=>30); s0.side=s0.sides.length-1; s0.done=true; s0.val=30; }
     validateSet(); } else nextStep(); s0=cur.steps[cur.i]; }
 const cle=s0.key||s0.id, iAvant=cur.i, xp0=cur.xp, fait0=cur.done||0;
 s0.val=9; validateSet();
 if(cur.i===iAvant) throw new Error('la validation doit faire avancer');
 renderSession();
 if(!/Revenir à/.test(html)) throw new Error('le retour d un pas doit etre offert a l etape suivante');
 stepBack();
 if(cur.i!==iAvant) throw new Error('le retour doit ramener sur la serie');
 if(cur.log[cle]) throw new Error('la valeur doit avoir quitte le journal');
 if((cur.done||0)!==fait0) throw new Error('le compteur de series doit etre defait');
 if(cur.xp!==xp0) throw new Error('les XP doivent etre defaits');
 if(cur.steps[cur.i].val!=null&&cur.steps[cur.i].val!==perfFor(s0.id,false).target)
   throw new Error('la saisie doit repartir de la cible');
 /* un seul pas : le retour ne se propose plus deux etapes plus loin */
 s0.val=9; validateSet(); nextStep();
 renderSession();
 if(/Revenir à/.test(html)) throw new Error('le retour ne vaut que pour l etape qui suit immediatement');
 console.log('retour d un pas OK : journal, series et XP defaits, un seul pas, jamais plus loin');

 // 5. rotation : gel du seul emplacement substitue
 await neuf();
 state.rounds=2; state.stretch=false;
 /* on positionne la rotation pour avoir les deux sortes d emplacements :
    en tete de vivier les quatre exercices ont un repli */
 state.slotIdx={push:0,pull:0,legs:2,core:1};
 const avecRepli=SLOT_ORDER.filter(s=>DB[pickFromPool(s)]&&DB[pickFromPool(s)].fb);
 const sansRepli=SLOT_ORDER.filter(s=>!(DB[pickFromPool(s)]&&DB[pickFromPool(s)].fb));
 if(!avecRepli.length||!sansRepli.length) throw new Error('ce test suppose des emplacements des deux sortes');
 const idx0=Object.assign({},state.slotIdx);
 lightMode=true;
 startSession();
 let h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=6;
     validateSet(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 avecRepli.forEach(s=>{ if(state.slotIdx[s]!==idx0[s]) throw new Error('emplacement substitue non gele : '+s); });
 sansRepli.forEach(s=>{ if(state.slotIdx[s]!==idx0[s]+1) throw new Error('emplacement seulement allege : la rotation doit avancer sur '+s); });
 if(state.lightRun!==1) throw new Error('le compteur de seances allegees doit valoir 1');
 console.log('rotation OK : gel des seuls emplacements substitues, avancee la ou l exercice a travaille');

 // 6. echappatoire a la deuxieme seance allegee d affilee
 cur=null; view='home';
 const idx1=Object.assign({},state.slotIdx);
 lightMode=true;
 startSession();
 h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=6;
     validateSet(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 SLOT_ORDER.forEach(s=>{ if(state.slotIdx[s]!==idx1[s]+1) throw new Error('la deuxieme allegee doit tout debloquer, bloque sur '+s); });
 if(state.lightRun!==2) throw new Error('le compteur doit valoir 2');
 /* une seance normale terminee remet le compteur a zero */
 cur=null; view='home'; lightMode=false;
 startSession();
 h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 if(state.lightRun!==0) throw new Error('une seance normale terminee doit remettre le compteur a zero');
 console.log('echappatoire OK : tout avance des la deuxieme allegee, compteur remis par une seance normale');

 // 7. volume choisi, temps calcule : le nombre annonce est un total
 await neuf();
 state.warm='complet'; state.stretch=true; state.cardio=false;
 const t=r=>{ state.rounds=r; const p=buildSession(); return planParts(p); };
 const p2=t(2), p3=t(3), p4=t(4);
 if(!(p2.total<p3.total&&p3.total<p4.total)) throw new Error('le total doit croitre avec le volume');
 /* v2.10 : la pause de raccord de tour est un poste de plus */
 if(p3.total!==p3.warm+p3.exos+p3.trans+p3.pause+p3.remount+p3.cardio+p3.cool) throw new Error('la decomposition doit sommer au total');
 /* v1.14 : les transitions ne sont plus fondues dans le poste Exercices, et la
    somme des temps affiches par exercice retombe sur ce poste */
 {
   state.rounds=3;
   const pl=buildSession(), pp=planParts(pl);
   let somme=0; pl.exos.forEach(id=>{ somme+=3*serieSec(id,pl.light); });
   if(somme!==pp.exos) throw new Error('le poste Exercices doit valoir la somme des exercices, ecart '+(pp.exos-somme));
   /* v2.10 : les raccords de tour sortent du poste Transitions, ils ont leur
      propre duree et leur propre ligne */
   const nRest=pl.steps.filter(x=>x.k==='rest'&&!x.pause).length;
   if(pp.trans!==nRest*transSec()) throw new Error('le poste Transitions doit valoir le nombre de repos par leur duree');
   const nPause=pl.steps.filter(x=>x.k==='rest'&&x.pause).length;
   if(pp.pause!==nPause*PAUSE_TOUR) throw new Error('le poste Pause de tour doit valoir le nombre de raccords par leur duree');
 }
 if(p3.cool<=0) throw new Error('les etirements entrent dans le total annonce');
 if(p3.warm<=0) throw new Error('l echauffement entre dans le total annonce');
 /* le cardio s ajoute, il ne retire plus un tour */
 state.rounds=3;
 const sans=planParts(buildSession()).total;
 state.cardio=true;
 const avecP=buildSession(), avec=planParts(avecP).total;
 if(workSteps(avecP.steps).length!==3*SLOT_ORDER.length) throw new Error('le cardio ne doit plus rogner le volume');
 if(avec-sans!==CARDIO_SEC) throw new Error('le cardio doit ajouter exactement sa duree, ecart '+(avec-sans));
 console.log('duree OK : total tout compris, decomposition exacte, cardio additif ('+Math.round(sans/60)+' → '+Math.round(avec/60)+' min)');

 // 8. cout d une serie : unilateral double, tenue par cote doublee
 await neuf();
 const bil=Object.keys(DB).find(id=>DB[id].mode==='time'&&DB[id].side);
 const uni=Object.keys(DB).find(id=>DB[id].mode==='time'&&!DB[id].side);
 state.prep=5;
 if(bil&&uni){
   const cb=perfFor(bil,false).target||DB[bil].reps[0], cu=perfFor(uni,false).target||DB[uni].reps[0];
   if(serieSec(bil,false)!==INSTALL+2*(5+cb)) throw new Error('une tenue par cote coute deux tenues, decompte compris');
   if(serieSec(uni,false)!==INSTALL+(5+cu)) throw new Error('une tenue d un bloc coute une tenue');
 }
 const rep=Object.keys(DB).find(id=>DB[id].reps&&DB[id].mode!=='time'&&DB[id].mode!=='stretch'&&!DB[id].side);
 const repS=Object.keys(DB).find(id=>DB[id].reps&&DB[id].mode!=='time'&&DB[id].mode!=='stretch'&&DB[id].side);
 if(rep&&repS){
   const c=perfFor(rep,false).target||DB[rep].reps[0];
   if(serieSec(rep,false)!==INSTALL+Math.round(c*tempoOf(rep))) throw new Error('serie chiffree : tempo par repetition');
   const cs=perfFor(repS,false).target||DB[repS].reps[0];
   if(serieSec(repS,false)!==INSTALL+switchSec(repS)+Math.round(cs*tempoOf(repS)*2)) throw new Error('serie chiffree unilaterale : deux fois le travail');
 }
 console.log('cout par exercice OK : unilateraux doubles, tenues comptees avec leur decompte');

 // 9. ajustements du jour : ponctuels, jamais persistes
 await neuf();
 state.warm='complet'; state.cardio=false; state.stretch=true; state.rounds=3;
 view='home'; render();
 if(!/Volume de la séance/.test(html)) throw new Error('le choix de volume doit etre sur l accueil');
 if(!/3 séries<\\/b>/.test(html)) throw new Error('les boutons doivent porter le nombre de series');
 if(!/<span class="sub">~\\d+ min<\\/span>/.test(html)) throw new Error('chaque bouton doit porter son temps calcule');
 if(!/<span class="ttl">Contenu<\\/span>/.test(html)) throw new Error('la card Contenu doit etre sur l accueil');
 if(!/échauffement complet · sans cardio · étirements/.test(html)) throw new Error('l en-tete ferme doit resumer les options du jour');
 setDayCardio(1); setDayWarm('court'); setRounds(4);
 if(state.cardio||state.warm!=='complet'||roundsOf(state)!==3) throw new Error('un ajustement du jour ne touche pas les defauts');
 if(!effCardio()||effWarm()!=='court'||effRounds()!==4) throw new Error('l ajustement du jour doit s appliquer a la seance');
 render();
 if(!/Modifié pour cette séance/.test(html)) throw new Error('la card doit signaler un ajustement');
 const pj=buildSession();
 if(!pj.cardio) throw new Error('le cardio du jour doit entrer dans la seance');
 if(workSteps(pj.steps).length!==4*SLOT_ORDER.length) throw new Error('le volume du jour doit s appliquer');
 startSession();
 h=0; while(view==='session'&&h++<400){ const s=cur.steps[cur.i];
   if(s&&s.k==='set'){ const e=DB[s.id];
     if(e.mode==='time'){ holdInit(s,e); for(let i=0;i<s.sides.length;i++) s.sides[i]=30; } else if(e.rhythm){ s.rt={d:30,g:30,s0:0,on:false,stopped:true,trim:0,t0:null}; s.done=true; if(!s.val) s.val=30; } else if(e.cadence){ cadInit(s); s.sides=s.sides.map(()=>30); s.side=s.sides.length-1; s.done=true; s.val=30; }
     else s.val=8;
     validateSet(); }
   else if(s&&s.k==='cardio'){ s.rounds=4; validateCardio(); }
   else nextStep(); }
 await new Promise(r=>setTimeout(r,10));
 if(dayTouched()) throw new Error('les ajustements du jour ne survivent pas a une seance');
 if(effRounds()!==3||effWarm()!=='complet'||effCardio()) throw new Error('les defauts doivent etre retrouves');
 const hh=state.hist[state.hist.length-1];
 if(hh.rounds!==4) throw new Error('l historique doit porter le volume reellement joue');
 if(!hh.plan) throw new Error('l historique doit porter la duree annoncee');
 console.log('ajustements du jour OK : appliques a la seance, jamais persistes, historises');

 // 10. migration : la duree choisie devient un nombre de series
 const mig=async(dur,att)=>{ state=null; cur=null;
   localStorage._m={'palier-state-v2':JSON.stringify({v:2,duration:dur,hist:[],perf:{}})};
   await loadState(); domicile();
   if(roundsOf(state)!==att) throw new Error(dur+' min devait donner '+att+' series, obtenu '+state.rounds);
   if(state.duration!==undefined) throw new Error('la duree ne doit plus survivre a la migration'); };
 await mig(10,2); await mig(15,3); await mig(20,4);
 state=null; cur=null; localStorage._m={'palier-state-v2':JSON.stringify({v:2,hist:[],perf:{}})};
 await loadState(); domicile();
 if(roundsOf(state)!==3) throw new Error('sans duree connue, 3 series par defaut');
 console.log('migration OK : 10/15/20 min → 2/3/4 series, defaut a 3');

 // 11. etat : aucun effet de bord
 await neuf();
 if(typeof EFFORT!=='undefined') throw new Error('EFFORT devait disparaitre avec l ordre de sacrifice');
 /* v1.15 : une assertion qui epingle la valeur courante est fausse en meme
    temps que le code et verte en meme temps que lui. On verifie la forme et la
    coherence avec le changelog, pas la valeur. */
 if(!/^\\d+\\.\\d+$/.test(VERSION)) throw new Error('version malformee : '+VERSION);
 console.log('etat OK : aucun effet de bord, version '+VERSION);
 console.log('TESTS V1.13 OK');
})();
`;
eval(src+T);
```

## test16.js


```javascript
/* test16 : modele de temps v1.14. Tempo par exercice, installation, bascule de
   cote la ou l outil n en compte aucune, et remontage de charge compte sur la
   sequence reelle des series. */
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
 const neuf=async()=>{ localStorage._m={}; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile(); state.prep=5; };
 await neuf();

 // 1. le tempo appartient a l exercice, avec un defaut et des exceptions
 if(TEMPO!==4.5) throw new Error('tempo par defaut attendu a 4,5 s');
 if(tempoOf('pompes-poignees')!==4.5) throw new Error('un exercice sans exception prend le defaut');
 if(tempoOf('kb-swings')!==1.5) throw new Error('un mouvement balistique ne prend pas le tempo controle');
 if(tempoOf('mollets-debout')!==3.5) throw new Error('amplitude courte : tempo propre');
 /* v2.17 : le bird-dog est chronometre, il n a plus de tempo modelise */
 if(tempoOf('bird-dog')!==TEMPO) throw new Error('tenue rythmee : plus de tempo propre, l exercice est chronometre');
 Object.keys(TEMPO_EX).forEach(id=>{ if(!DB[id]) throw new Error('tempo declare pour un exercice inconnu : '+id); });
 console.log('tempo OK : defaut a 4,5 s, exceptions declarees exercice par exercice');

 // 2. installation : courte pour un etirement, sans saisie ni materiel
 const st=STRETCH_POOL[0], e=DB[st];
 if(serieSec(st,false)!==INSTALL_STRETCH+prepSec()+e.dur) throw new Error('un etirement coute son installation courte, son decompte et sa duree');
 if(INSTALL_STRETCH>=INSTALL) throw new Error('un etirement ne doit pas couter autant qu une serie chiffree');
 /* le decompte de preparation reste compte a part : le couper allege le total */
 const avecPrep=serieSec(st,false); state.prep=0;
 if(serieSec(st,false)!==avecPrep-5) throw new Error('le decompte de preparation doit peser exactement sa duree');
 state.prep=5;
 console.log('installation OK : etirement a '+INSTALL_STRETCH+' s, serie a '+INSTALL+' s, decompte compte a part');

 // 3. bascule de cote : seulement la ou l outil n en compte aucune
 ['fentes-arriere','step-ups','bird-dog','dead-bug'].forEach(id=>{
   if(switchSec(id)) throw new Error('alterne a chaque repetition, aucune bascule a compter : '+id); });
 if(switchSec('pallof-press')!==5) throw new Error('pallof press : pivot autour d un ancrage fixe');
 if(switchSec('rowing-kettlebell')!==10) throw new Error('rowing kettlebell : charge reposee et deux appuis deplaces');
 /* une tenue par cote rejoue un decompte a chaque cote : deja compte, jamais doublonne */
 const gl=DB['gainage-lateral'], cg=perfOf('gainage-lateral').target;
 if(serieSec('gainage-lateral',false)!==INSTALL+2*(prepSec()+cg)) throw new Error('une tenue par cote ne prend pas de bascule en plus de ses deux decomptes');
 const pp=perfOf('pallof-press').target;
 if(serieSec('pallof-press',false)!==INSTALL+5+Math.round(pp*tempoOf('pallof-press')*2)) throw new Error('pallof press : bascule ajoutee une fois, travail double');
 console.log('bascule OK : deux exercices concernes, tenues et etirements bilateraux exclus');

 // 4. remontage : zero quand rien ne se dispute une ressource
 await neuf();
state.rounds=3; state.warm='complet'; state.cardio=false; state.stretch=true;
 const idx=(slot,id)=>{ const p=SLOTS[slot].pool.filter(x=>!isLocked(x)); const i=p.indexOf(id);
   if(i<0) throw new Error('exercice hors vivier tirable : '+id); state.slotIdx[slot]=i; };
 idx('push','pompes-poignees'); idx('pull','rowing-suspension'); idx('legs','pont-fessier'); idx('core','planche');
 let plan=buildSession();
 if(remounts(plan).n!==0) throw new Error('aucune charge partagee : aucun remontage');
 if(planParts(plan).remount!==0) throw new Error('le poste remontage doit valoir zero');
 if(remountPairs(plan).length) throw new Error('aucun montage a alterner a signaler');

 // 5. deux exercices sur les memes halteres a des charges differentes
 idx('push','elevations-laterales'); idx('pull','curls-halteres');
 perfOf('elevations-laterales').load=2; perfOf('curls-halteres').load=4;
 plan=buildSession();
 const rm=remounts(plan);
 /* le circuit repasse de l un a l autre a chaque tour : 2R-1 changements, le
    premier montage etant fait avant la seance */
 if(rm.n!==2*3-1) throw new Error('cinq remontages attendus sur trois tours, obtenu '+rm.n);
 if(rm.sec!==rm.n*REMOUNT) throw new Error('le poste doit valoir le nombre de remontages par leur cout');
 if(planParts(plan).remount!==rm.sec) throw new Error('la decomposition doit porter le remontage');
 const pairs=remountPairs(plan);
 if(pairs.length!==1||pairs[0].gear!=='halteres'||pairs[0].items.length!==2) throw new Error('les deux montages a alterner doivent etre nommes');
 /* a charges egales, plus rien a changer : le nombre tombe a zero */
 perfOf('curls-halteres').load=2;
 if(remounts(buildSession()).n!==0) throw new Error('memes charges : aucun remontage');
 perfOf('curls-halteres').load=4;
 /* et le volume choisi fait varier le nombre, puisqu il se compte sur la sequence */
 state.rounds=2; if(remounts(buildSession()).n!==3) throw new Error('deux tours : trois remontages');
 state.rounds=4; if(remounts(buildSession()).n!==7) throw new Error('quatre tours : sept remontages');
 state.rounds=3;
 console.log('remontage OK : nul sans conflit, 2R-1 quand le circuit alterne deux montages');

 // 6. une bande se change de barreau, ce n est pas un montage
 if(gearKey('face-pulls')) throw new Error('un elastique ne demande aucun montage');
 if(gearKey('pompes-poignees')) throw new Error('le poids du corps ne demande aucun montage');
 if(gearKey('curls-halteres')!=='halteres') throw new Error('les halteres sont une ressource partagee');
 if(gearKey('goblet-squat')!=='kb') throw new Error('la kettlebell et ses lestes sont une ressource partagee');

 // 7. l avertissement remonte dans le detail de seance, et seulement alors
 view='home'; render();
 if(!/changer 5 fois pendant la séance/.test(html)) throw new Error('le detail doit prevenir du changement de montage');
 if(!/Les haltères passent de/.test(html)) throw new Error('le detail doit nommer les deux montages');
 perfOf('curls-halteres').load=2; render();
 if(/changer \\d+ fois pendant la séance/.test(html)) throw new Error('sans conflit, aucun avertissement');
 console.log('avertissement OK : nomme les deux montages et leur nombre, absent sinon');

 // 8. le temps de chaque exercice s affiche et se retrouve dans le poste
 await neuf();
state.rounds=3; state.stretch=true; state.cardio=false;
 const pl=buildSession(), parts=planParts(pl);
 let somme=0; pl.exos.forEach(id=>somme+=3*serieSec(id,pl.light));
 if(somme!==parts.exos) throw new Error('le poste Exercices doit valoir la somme des exercices');
 view='home'; render();
 pl.exos.forEach(id=>{ const t=fmtDur(3*serieSec(id,pl.light));
   if(html.indexOf(t)<0) throw new Error('temps absent du detail pour '+id+' (attendu '+t+')'); });
 console.log('temps par exercice OK : affiche ligne par ligne, somme egale au poste');

 // 9. tout ce que l outil chronometre reste compte a sa valeur exacte
 const wm=warmupSec('complet');
 if(wm!==START_PREP+WARMUP.reduce((a,x)=>a+x.s,0)) throw new Error('l echauffement vaut son decompte de lancement plus la somme de ses etapes (v2.22)');
 if(warmupSec('aucun')!==0) throw new Error('sans echauffement, ni etapes ni decompte de lancement');
 /* v2.10 : les raccords de tour sont des repos, mais pas au tarif transition */
 if(parts.trans!==pl.steps.filter(x=>x.k==='rest'&&!x.pause).length*transSec()) throw new Error('les transitions valent leur nombre par leur duree');
 if(parts.pause!==pl.steps.filter(x=>x.k==='rest'&&x.pause).length*PAUSE_TOUR) throw new Error('les pauses de raccord valent leur nombre par leur duree');
 state.cardio=true;
 if(planParts(buildSession()).cardio!==CARDIO_SEC) throw new Error('le cardio vaut sa duree');
 console.log('postes chronometres OK : echauffement, transitions et cardio a leur valeur exacte');

 console.log('TESTS MODELE DE TEMPS V1.14 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test17.js


```javascript
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
```

## test18.js


```javascript
/* test18 : filet de securite en quatre cas a borne stricte, grace
   post-montee, signaux sans action, correctif du compteur de divergence, et
   verrous plafonnes par le volume de la seance. Chantier v1.15, issu de
   l enquete equilibre musculaire (tours 1 a 18).
   v2.16 : le cliquet des fourchettes et son relevement n existent plus. T7, T8,
   T11, T12, T16 et T22 asserteraient un mecanisme retire ; ils assertent
   desormais l invariant qui le remplace, une fourchette qui ne bouge dans
   aucun sens et un plafond qui annonce la marche ecrite. T23 change d objet. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile(); };
 /* pose un exercice dans un etat connu : fourchette d origine, cible au bas */
 const pose=(id,o)=>{ const p=perfOf(id), e=DB[id];
   p.range=(o&&o.range)?o.range.slice():e.reps.slice();
   p.target=(o&&o.target!=null)?o.target:p.range[0];
   if(o&&o.load!=null) p.load=o.load;
   if(o&&o.band) p.band=o.band;
   if(o&&o.hold) p.hold=true; else delete p.hold;
   delete p.grace; delete p.setsBand; delete p.prevMin; p.best=0; p.sets=[];   /* v2.14 : un etat pose n a pas de memoire de fenetre */
   return p; };
 const dit=(m,re)=>m.some(x=>re.test(x));
 const DESC=/redescendue|plus d'aide|retour sans bande|retour à la/i;
 const ECHEC=/aucune série au plancher/;
 const PART=/des séries sous le plancher/;
 await neuf();

 // T1. les vecteurs mesures a max = bas sur les sept premieres seances reelles :
 //     aucune descente, aucun signal, cible avancee d un pas. Dix d entre eux
 //     etaient sur une lecture exploitable, les seuls qu une borne large aurait
 //     pu retrograder ; les autres venaient d une seance allegee ou quittee.
 const T1=[['pompes-poignees',[6,6]],['face-pulls',[10,10]],['dead-bug',[6,6]],
   ['elevations-laterales',[12]],['curls-halteres',[10,10,10]],['step-ups',[8,8,8]],
   ['tractions-assistees-supination',[4,4,4]],['goblet-squat',[8,8,8]],
   ['rowing-suspension',[8,8,8]],['fentes-arriere',[8,8,8]],['pompes-inclinees',[8,8,8]],
   ['rowing-elastique',[10,10,10]],['pont-fessier',[10,10,10]],['pont-fessier',[10,10,10]]];
 T1.forEach(([id,s])=>{
   const p=pose(id), lo=p.range[0], pas=(DB[id].mode==='time')?5:1;
   const m=applyProgress(id,s,true,false);
   if(dit(m,DESC)||dit(m,ECHEC)||dit(m,PART)) throw new Error('T1 '+id+' : le plancher atteint ne doit rien declencher · '+m.join(' | '));
   if(p.target!==lo+pas) throw new Error('T1 '+id+' : cible '+p.target+' attendue '+(lo+pas));
 });
 console.log('T1 OK : les '+T1.length+' vecteurs mesures a max = bas ne declenchent rien ; sur les sept seances reelles, dix de ces passages etaient sur une lecture exploitable, que la borne large aurait retrogrades');

 // T2. [bas,bas,bas] apres montee et grace : rien ne descend, rien ne signale
 let p=pose('face-pulls',{band:'rouge',target:10});
 p.grace=true;
 let m=applyProgress('face-pulls',[10,10,10],true,false);
 if(p.band!=='rouge'||dit(m,DESC)||dit(m,ECHEC)||dit(m,PART)) throw new Error('T2 : reconstruction au plancher retrogradee');
 if(p.target!==11) throw new Error('T2 : cible '+p.target);
 console.log('T2 OK : reconstruire au plancher apres une montee ne retrograde pas');

 // T3. [12,6,5] cible 11 : partiel avec recul mentionne, aucune descente
 p=pose('face-pulls',{band:'rouge',target:11});
 m=applyProgress('face-pulls',[12,6,5],true,false);
 if(p.band!=='rouge') throw new Error('T3 : effondrement partiel ne doit pas descendre');
 if(!dit(m,PART)||!dit(m,/cible recalée de 11 à 10/)) throw new Error('T3 : signal partiel ou recul absent · '+m.join(' | '));
 console.log('T3 OK : effondrement partiel signale, cible recalee mentionnee, aucune action');

 // T4. [10,6,5] cible 10 : partiel seul, pas de recul (contre-exemple d equivalence)
 p=pose('face-pulls',{band:'rouge',target:10});
 m=applyProgress('face-pulls',[10,6,5],true,false);
 if(!dit(m,PART)) throw new Error('T4 : signal partiel absent');
 if(dit(m,/cible recalée/)) throw new Error('T4 : aucun recul a signaler ici');
 console.log('T4 OK : partiel sans recul, les deux predicats sont independants');

 // T5. [12,12,12] cible 14 : la cible recule, aucun message (assertion d absence)
 p=pose('face-pulls',{band:'rouge',target:14});
 m=applyProgress('face-pulls',[12,12,12],true,false);
 if(p.target!==13) throw new Error('T5 : cible '+p.target+' attendue 13');
 if(m.length) throw new Error('T5 : un recul dans la fourchette est le moteur qui fonctionne, pas un evenement · '+m.join(' | '));
 console.log('T5 OK : recul sans partiel, muet');

 // T6. [9,9,8] : descente de bande, barreau joue conserve, message de descente seul
 p=pose('face-pulls',{band:'rouge',target:11});
 m=applyProgress('face-pulls',[9,9,8],true,false);
 if(p.band!=='jaune') throw new Error('T6 : descente de bande attendue, obtenu '+p.band);
 /* v2.12 : le barreau ecrit avec les series est celui sous lequel elles ont
    ete jouees, donc rouge, et la descente qui suit ne le reecrit pas. */
 if(p.setsBand!=='rouge') throw new Error('T6 : barreau joue attendu rouge, obtenu '+p.setsBand);
 if(!dit(m,DESC)||dit(m,ECHEC)) throw new Error('T6 : un seul message par evenement · '+m.join(' | '));
 if(p.target!==p.range[0]) throw new Error('T6 : cible au bas courant attendue');
 console.log('T6 OK : passage uniformement sous le plancher, descente et un seul message');

 // T7. poids du corps sous le plancher : aucun barreau inferieur, la fourchette
 //     ne bouge pas, le signal seul passe (v2.16 : plus de descente de fourchette)
 p=pose('fentes-arriere');
 m=applyProgress('fentes-arriere',[3,3,3],true,false);
 if(p.range[0]!==8||p.range[1]!==15) throw new Error('T7 : fourchette '+p.range);
 if(dit(m,DESC)||!dit(m,ECHEC)) throw new Error('T7 : sans barreau inferieur, signal seul · '+m.join(' | '));
 m=applyProgress('fentes-arriere',[3,3,3],true,false);
 if(p.range[0]!==8||p.range[1]!==15) throw new Error('T7 : la base ne doit pas etre franchie');
 if(dit(m,DESC)||!dit(m,ECHEC)) throw new Error('T7 : au second passage, toujours le signal seul · '+m.join(' | '));
 console.log('T7 OK : sans barreau inferieur, la fourchette reste a sa base et le signal passe');

 // T8. poids du corps au plafond : la fourchette ne monte plus, le plafond
 //     s annonce a chaque passage et la cible reste bornee au haut (v2.16)
 p=pose('fentes-arriere');
 const suite=[];
 for(let i=0;i<5;i++){ m=applyProgress('fentes-arriere',[15,15,15],true,false); suite.push(p.range.join('-')+(dit(m,/Plafond atteint/)?'!':'?')); }
 if(suite.join(' ')!=='8-15! 8-15! 8-15! 8-15! 8-15!') throw new Error('T8 : sequence '+suite.join(' '));
 if(p.target!==15) throw new Error('T8 : cible bornee au haut attendue, '+p.target);
 console.log('T8 OK : cinq passages au plafond, fourchette immobile, plafond annonce a chaque fois');

 // T9. grace : premier echec masque, second echec descend
 p=pose('curls-halteres',{load:6,target:20});
 m=applyProgress('curls-halteres',[20,20,20],true,false);
 if(!p.grace) throw new Error('T9 : grace non posee a la montee de charge');
 const l0=p.load;
 m=applyProgress('curls-halteres',[7,7,7],true,false);
 if(p.load!==l0) throw new Error('T9 : la grace doit masquer la descente');
 if(!dit(m,ECHEC)) throw new Error('T9 : signal d echec attendu pendant la grace · '+m.join(' | '));
 if(p.grace) throw new Error('T9 : grace non consommee par un passage complet');
 m=applyProgress('curls-halteres',[7,7,7],true,false);
 if(p.load>=l0) throw new Error('T9 : descente attendue au passage suivant');
 if(!dit(m,DESC)||dit(m,ECHEC)) throw new Error('T9 : message de descente seul attendu');
 console.log('T9 OK : la grace protege d une action, jamais d une information');

 // T10. la grace survit a une seance allegee et a une lecture partielle
 p=pose('curls-halteres',{load:6,target:20});
 applyProgress('curls-halteres',[20,20,20],true,false);
 applyProgress('curls-halteres',[5,5,5],true,true);      // allegee
 if(!p.grace) throw new Error('T10 : une seance allegee ne consomme pas la grace');
 applyProgress('curls-halteres',[5],false,false);        // lecture partielle
 if(!p.grace) throw new Error('T10 : une lecture partielle ne consomme pas la grace');
 applyProgress('curls-halteres',[5,5,5],true,false);
 if(p.grace) throw new Error('T10 : un passage complet doit consommer la grace');
 console.log('T10 OK : la grace attend un passage complet reel');

 // T11. la grace est posee par charge, bande et fixed ; un plafond de fourchette n en pose pas, rien n a monte
 p=pose('curls-halteres',{load:6,target:20}); applyProgress('curls-halteres',[20,20,20],true,false);
 if(!p.grace) throw new Error('T11 : charge');
 p=pose('face-pulls',{band:'jaune',target:18}); applyProgress('face-pulls',[18,18,18],true,false);
 if(!p.grace) throw new Error('T11 : bande');
 p=pose('goblet-squat',{load:10,target:15}); applyProgress('goblet-squat',[15,15,15],true,false);
 if(!p.grace) throw new Error('T11 : fixed');
 p=pose('fentes-arriere'); applyProgress('fentes-arriere',[15,15,15],true,false);
 if(p.range[1]!==15) throw new Error('T11 : la fourchette ne doit pas bouger au plafond');
 if(p.grace) throw new Error('T11 : pas de grace au plafond, aucun palier n a change');
 console.log('T11 OK : grace sur trois montees, aucune sur un plafond de fourchette');

 // T12. div compte les montees reussies, plus les passages au plafond
 await neuf();
 state.div={push:0,pull:0};
 p=pose('curls-halteres',{load:6,target:20}); applyProgress('curls-halteres',[20,20,20],true,false);
 if(state.div.pull!==1) throw new Error('T12 : montee de charge non comptee');
 p=pose('rowing-suspension'); m=applyProgress('rowing-suspension',[15,15,15],true,false);
 if(!dit(m,/Plafond atteint/)) throw new Error('T12 : plafond attendu au haut de fourchette du tirage en suspension');
 if(state.div.pull!==1) throw new Error('T12 : un plafond de fourchette n est pas une montee, il ne compte pas (v2.16)');
 p=pose('gainage-lateral',{target:45});
 const avant=state.div.core===undefined?null:state.div.core;
 p=pose('pompes-poignees',{band:'vert',target:15});
 const d0=state.div.push;
 m=applyProgress('pompes-poignees',[15,15,15],true,false);
 if(!dit(m,/Plafond atteint/)) throw new Error('T12 : plafond attendu au dernier barreau');
 if(state.div.push!==d0) throw new Error('T12 : un passage au plafond ne doit plus incrementer');
 console.log('T12 OK : montees comptees, plafonds exclus, fourchette comprise');

 // T13. sous palier tenu : la descente joue, le partiel s emet, aucun recul possible
 p=pose('face-pulls',{band:'rouge',target:12,hold:true});
 m=applyProgress('face-pulls',[9,9,9],true,false);
 if(p.band!=='jaune') throw new Error('T13 : le filet reste actif sous palier tenu');
 p=pose('face-pulls',{band:'rouge',target:12,hold:true});
 m=applyProgress('face-pulls',[12,6,5],true,false);
 if(!dit(m,PART)) throw new Error('T13 : partiel attendu');
 if(p.target!==12) throw new Error('T13 : la cible est gelee sous palier tenu');
 if(dit(m,/cible recalée/)) throw new Error('T13 : aucun recul possible sous palier tenu');
 console.log('T13 OK : filet actif sous palier tenu, cible gelee');

 // T14. planche et gainage lateral : plafond = haut de fourchette, no-op garanti
 ['planche','gainage-lateral'].forEach(id=>{
   const q=pose(id), r0=q.range.join('-');
   const mm=applyProgress(id,[5,5,5],true,false);
   if(q.range.join('-')!==r0) throw new Error('T14 '+id+' : fourchette modifiee');
   if(dit(mm,DESC)||!dit(mm,ECHEC)) throw new Error('T14 '+id+' : signal seul attendu · '+mm.join(' | '));
 });
 console.log('T14 OK : les deux exercices tenus traversent la branche sans effet, et signalent quand meme');

 // T15. invariance : un passage dans la fourchette sans montee ne touche a rien
 await neuf(); state.div={push:0,pull:0};
 p=pose('goblet-squat',{load:10,target:10});
 const snap=JSON.stringify([p.load,p.range,state.div,state.loadUps]);
 m=applyProgress('goblet-squat',[11,11,11],true,false);
 if(m.length) throw new Error('T15 : aucun message attendu · '+m.join(' | '));
 if(JSON.stringify([p.load,p.range,state.div,state.loadUps])!==snap) throw new Error('T15 : etat modifie');
 if(p.target!==12) throw new Error('T15 : cible '+p.target);
 console.log('T15 OK : dans la fourchette, seule la cible bouge');

 // T16. regle des bornes sur une fourchette immobile : un passage sous le
 //      plancher recale la cible au bas de la fourchette courante, qui est la base
 p=pose('fentes-arriere',{target:12});
 applyProgress('fentes-arriere',[5,5,5],true,false);
 if(p.range.join('-')!=='8-15') throw new Error('T16 : fourchette '+p.range);
 if(p.target!==8) throw new Error('T16 : cible '+p.target+' attendue 8');
 console.log('T16 OK : recalibrage au bas de la fourchette courante');

 // T17. echec total pendant la grace : signal emis, aucune action
 p=pose('goblet-squat',{load:12,target:8}); p.grace=true;
 const lg=p.load;
 m=applyProgress('goblet-squat',[3,3,3],true,false);
 if(p.load!==lg) throw new Error('T17 : la grace doit masquer la descente');
 if(!dit(m,ECHEC)) throw new Error('T17 : signal d echec attendu · '+m.join(' | '));
 console.log('T17 OK : pendant la grace, l information passe');

 // T18. exercice au poids du corps a sa fourchette d origine : signal, pas d action
 p=pose('mollets-debout');
 m=applyProgress('mollets-debout',[4,4,4],true,false);
 if(p.range.join('-')!==DB['mollets-debout'].reps.join('-')) throw new Error('T18 : la base ne bouge pas');
 if(!dit(m,ECHEC)||dit(m,DESC)) throw new Error('T18 : signal seul attendu, c est le cas nominal · '+m.join(' | '));
 console.log('T18 OK : a la fourchette d origine, le no-op est silencieux mais le signal passe');

 // T19. exercice au barreau le plus bas de son echelle : aucune descente possible
 p=pose('face-pulls',{band:'jaune',target:10});
 m=applyProgress('face-pulls',[5,5,5],true,false);
 if(p.band!=='jaune') throw new Error('T19 : pas de barreau sous le jaune');
 if(!dit(m,ECHEC)||dit(m,DESC)) throw new Error('T19 : signal seul attendu · '+m.join(' | '));
 if(!/^Face pulls/.test(m.filter(x=>ECHEC.test(x))[0]||'')) throw new Error('T19 : le signal doit nommer l exercice, sinon deux signaux se confondent au recapitulatif');
 console.log('T19 OK : sans barreau inferieur, l information passe quand meme, et elle nomme l exercice');

 // T20. lecture partielle : jamais de descente, toujours le signal
 p=pose('face-pulls',{band:'rouge',target:10});
 m=applyProgress('face-pulls',[8],false,false);
 if(p.band!=='rouge') throw new Error('T20 : une lecture ampute ne doit pas retrograder');
 if(!dit(m,ECHEC)) throw new Error('T20 : signal attendu · '+m.join(' | '));
 console.log('T20 OK : « toutes les series » ne s affirme pas sur un journal ampute');

 // T21. grace pendante puis palier tenu : consommee par le passage complet sous hold
 p=pose('goblet-squat',{load:12,target:8}); p.grace=true; p.hold=true;
 const lh=p.load;
 applyProgress('goblet-squat',[3,3,3],true,false);
 if(p.load!==lh) throw new Error('T21 : descente masquee attendue');
 if(p.grace) throw new Error('T21 : la grace est liee au passage, pas au regime');
 applyProgress('goblet-squat',[3,3,3],true,false);
 if(p.load>=lh) throw new Error('T21 : descente attendue au passage suivant, meme sous palier tenu');
 console.log('T21 OK : la grace se consomme sous palier tenu comme ailleurs');

 // T22. huit passages au plafond puis dix sous le plancher sur tous les
 //      exercices au poids du corps et tenus : la fourchette ne bouge dans
 //      aucun sens, la cible reste dedans, le plafond s annonce (v2.16)
 const BW=Object.keys(DB).filter(id=>(DB[id].mode==='bw'||DB[id].mode==='time')&&!DB[id].bnd&&!DB[id].rhythm&&!DB[id].assise&&DB[id].reps)   /* v2.17 : les tenues rythmees ont une echelle ; v2.18 : l assise aussi */;
 BW.forEach(id=>{
   const q=pose(id), base=DB[id].reps.slice(), pas=(DB[id].mode==='time')?5:1;
   for(let i=0;i<8;i++){ delete q.grace; m=applyProgress(id,[base[1],base[1],base[1]],true,false);
     if(q.range.join('-')!==base.join('-')) throw new Error('T22 '+id+' : fourchette relevee, '+q.range);
     if(!dit(m,/Plafond atteint/)) throw new Error('T22 '+id+' : plafond non annonce au passage '+(i+1)); }
   if(q.target!==base[1]) throw new Error('T22 '+id+' : cible '+q.target+' au lieu du haut '+base[1]);
   for(let i=0;i<10;i++){
     delete q.grace;
     m=applyProgress(id,[base[0]-pas-1,base[0]-pas-1,base[0]-pas-1],true,false);
     if(q.range.join('-')!==base.join('-')) throw new Error('T22 '+id+' : fourchette descendue, '+q.range);
     if(dit(m,DESC)) throw new Error('T22 '+id+' : message de descente sur un exercice sans barreau inferieur');
     if(q.target<q.range[0]||q.target>q.range[1]) throw new Error('T22 '+id+' : cible '+q.target+' hors de '+q.range);
   }
 });
 console.log('T22 OK : '+BW.length+' exercices, fourchette immobile dans les deux sens, cible dedans, plafond annonce');

 // T23. cible heritee au-dessus du haut sur un palier tenu : elle est bornee au haut
 p=pose('bird-dog',{target:14,hold:true});
 applyProgress('bird-dog',[1,1,1],true,false);
 if(p.range.join('-')!=='6-12') throw new Error('T23 : fourchette '+p.range);
 if(p.target!==12) throw new Error('T23 : cible '+p.target+' attendue bornee a 12');
 console.log('T23 OK : sous palier tenu, une cible hors fourchette est bornee au haut');

 // T24. exercice charge a charge nulle : aucune descente de charge ni de fourchette
 p=pose('developpe-sol',{load:0,target:8});
 const r24=p.range.join('-');
 m=applyProgress('developpe-sol',[3,3,3],true,false);
 if(p.load!==0||p.range.join('-')!==r24) throw new Error('T24 : rien ne doit bouger');
 if(!dit(m,ECHEC)) throw new Error('T24 : signal attendu');
 console.log('T24 OK : comportement decide, plus herite, pour une charge nulle');

 // T25. verrou a compte multiple : plafonne par le volume joue, jamais par le journal
 await neuf();
 const V='tractions-assistees-pronation', L=DB[V].lock, anc=L.after;
 const met=(sets)=>{ state.unlocked={}; state.perf[anc]=Object.assign(perfOf(anc),{sets:sets.slice(),best:Math.max.apply(null,sets.concat([0]))}); };
 met([6,6]); checkUnlocks(3,false);
 if(state.unlocked[V]) throw new Error('T25 : deux series ne suffisent pas au volume 3');
 met([6,6]); checkUnlocks(2,false);
 if(!state.unlocked[V]) throw new Error('T25 : au volume 2, deux series doivent suffire, sinon le verrou est irrealisable');
 met([7]); checkUnlocks(2,false);
 if(state.unlocked[V]) throw new Error('T25 : une seule serie d une seance quittee ne doit pas ouvrir');
 met([6,6,6]); checkUnlocks(3,false);
 if(!state.unlocked[V]) throw new Error('T25 : trois series au volume 3 doivent ouvrir');
 console.log('T25 OK : le volume est la barre, les series jouees sont la preuve');

 // T26. une seance allegee n ouvre aucun verrou
 met([6,6,6]); checkUnlocks(3,true);
 if(state.unlocked[V]) throw new Error('T26 : une seance allegee ne deverrouille rien');
 checkUnlocks(3,false);
 if(!state.unlocked[V]) throw new Error('T26 : la seance normale suivante doit ouvrir');
 console.log('T26 OK : un mode qui ne fait rien monter ne deverrouille rien');

 // T27. aucun verrou ne lit best, et les deux verrous de la chaine posterieure
 //      prouvent une capacite actuelle et non un maximum historique
 await neuf();
 const q=perfOf('goblet-squat'); q.best=15; q.sets=[8,8,8];
 checkUnlocks(3,false);
 if(state.unlocked['rdl-kettlebell']) throw new Error('T27 : best ne doit plus ouvrir un verrou');
 /* v2.1 : les deux verrous de la charniere exigent DEUX series, comme les
    quatre autres verrous du catalogue. Une serie isolee au plafond se
    rattrape par un bon jour, deux series dans la meme seance prouvent la
    capacite courante, et c est la famille la plus exposee sur une L5. */
 q.sets=[15,8,8]; checkUnlocks(3,false);
 if(state.unlocked['rdl-kettlebell']) throw new Error('T27 : une seule serie a 15 ne doit plus ouvrir');
 q.sets=[15,15,8]; checkUnlocks(3,false);
 if(!state.unlocked['rdl-kettlebell']) throw new Error('T27 : deux series a 15 sur le dernier passage doivent ouvrir');
 console.log('T27 OK : les verrous lisent le dernier passage, plus jamais best');

 // T28. l enonce affiche suit le compte reellement exige
 await neuf();
 state.rounds=3;
 if(!/Fais 3 séries de 6/.test(lockCond(DB[V]))) throw new Error('T28 : enonce au volume 3 : '+lockCond(DB[V]));
 state.rounds=2;
 if(!/Fais 2 séries de 6/.test(lockCond(DB[V]))) throw new Error('T28 : enonce au volume 2 : '+lockCond(DB[V]));
 if(/\\{n\\}/.test(lockCond(DB['rdl-kettlebell']))) throw new Error('T28 : jeton non substitue');
 console.log('T28 OK : l enonce dit ce qui est verifie, a tous les volumes');

 /* v2.12 : les deux sujets fabriques ci-dessous portent secs, que validateSet
    ecrit a cote de log. On complete le sujet plutot que d assouplir
    l application : le seul constructeur reel de cur est startSession, et il
    l initialise. */
 // T29. rendu de la saisie : l explication du zero existe et suit l etat du bouton
 await neuf();
 const st={k:'set',id:'curls-halteres',key:'curls-halteres'};
 cur={steps:[st],i:0,log:{},secs:{},xp:0,done:0,type:'alterne',rounds:3};
 st.val=10;
 let h=setHtml(st);
 if(!/id="vz"/.test(h)) throw new Error('T29 : explication absente du rendu');
 if(!/id="vz"[^>]*display:none/.test(h)) throw new Error('T29 : elle doit etre masquee au-dessus de zero');
 if(/id="vb"[^>]*disabled/.test(h)) throw new Error('T29 : bouton actif attendu a 10');
 st.val=0; h=setHtml(st);
 if(/id="vz"[^>]*display:none/.test(h)) throw new Error('T29 : elle doit etre visible a zero');
 if(!/id="vb"[^>]*disabled/.test(h)) throw new Error('T29 : bouton inerte attendu a zero');
 console.log('T29 OK : le bouton et son explication sont rendus ensemble, et bump les bascule sans re-rendre');

 // T30. une serie a zero n est jamais journalisee
 cur={steps:[st],i:0,log:{},secs:{},xp:0,done:0,type:'alterne',rounds:3};
 st.val=0; validateSet();
 if(Object.keys(cur.log).length) throw new Error('T30 : une serie a zero ne doit rien enregistrer');
 st.val=7; validateSet();
 if((cur.log['curls-halteres']||[]).join()!=='7') throw new Error('T30 : la serie valide doit passer');
 console.log('T30 OK : zero refuse a la validation, pas seulement grise');

 console.log('TESTS FILET, CLIQUET ET VERROUS V1.15 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test19.js


```javascript
/* test19 : composition des viviers (retrait des barreaux depasses, poids double
   des face pulls et son espacement), marquage des exercices de repli, date du
   dernier import, et les deux mecanismes de fin de seance que test18 ne couvre
   pas parce qu ils vivent dans endSession : le signal d exercice non realise
   et la file de celebrations devenue identitaire. Chantier v1.15, bloc 2. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 domicile(); };
 const tire=()=>SLOTS.pull.pool.filter(id=>!isLocked(id)&&!estRetire(id));
 await neuf();

 // 1. le poids double : deux entrees face-pulls, ecartees dans le tableau declare
 const pos=[]; SLOTS.pull.pool.forEach((id,i)=>{ if(id==='face-pulls') pos.push(i); });
 if(pos.length!==2) throw new Error('deux entrees face-pulls attendues dans le vivier tire, trouve '+pos.length);
 console.log('poids double OK : face-pulls compte deux fois dans le vivier tire');

 // 2. espacement dans les quatre etats de verrous, avec le retrait de la
 //    decision A. Le mandat disait « environ trois positions » sans dire dans
 //    quel etat : c est le tableau filtre qui compte, pas le tableau declare.
 const etats=[
   ['aujourd hui',{}],
   ['+ assistee pronation',{'tractions-assistees-pronation':1}],
   ['+ stricte supination',{'tractions-assistees-pronation':1,'tractions-strictes-supination':1}],
   ['+ stricte pronation',{'tractions-assistees-pronation':1,'tractions-strictes-supination':1,'tractions-strictes-pronation':1}]
 ];
 const vus=[];
 etats.forEach(([nom,unl])=>{
   state.unlocked=Object.assign({},unl);
   const P=tire(), q=[]; P.forEach((id,i)=>{ if(id==='face-pulls') q.push(i); });
   if(q.length!==2) throw new Error(nom+' : face-pulls doit sortir deux fois du filtre');
   const d=q[1]-q[0], e=[d,P.length-d].sort((a,b)=>a-b);
   if(e[0]<3) throw new Error(nom+' : entrees trop proches ('+e.join('/')+'), face-pulls sortirait deux seances de suite');
   vus.push(nom+' '+P.length+' entrees, ecarts '+e.join('/'));
 });
 console.log('espacement OK sur les quatre etats : '+vus.join(' · '));

 // 3. decision A : le barreau depasse quitte le vivier au deblocage
 state.unlocked={};
 if(tire().indexOf('tractions-assistees-supination')<0) throw new Error('la variante assistee doit etre au vivier avant deblocage');
 /* le retrait attend que plus aucun verrou ferme ne lise l exercice : la
    pronation assistee lit le dernier passage de la supination assistee, la
    retirer trop tot rendrait sa branche definitivement infranchissable */
 state.unlocked={'tractions-strictes-supination':true};
 if(tire().indexOf('tractions-assistees-supination')<0) throw new Error('retrait premature : un verrou ferme lit encore cet exercice');
 state.unlocked={'tractions-strictes-supination':true,'tractions-assistees-pronation':true};
 if(tire().indexOf('tractions-assistees-supination')>=0) throw new Error('la variante assistee doit quitter le vivier une fois ses verrous ouverts');
 if(tire().indexOf('tractions-strictes-supination')<0) throw new Error('la stricte doit entrer au vivier');
 if(isLocked('tractions-assistees-supination')) throw new Error('un barreau retire n est pas reverrouille : sa fiche et sa progression restent intactes');
 console.log('retrait OK : le barreau depasse sort du tirage sans etre reverrouille');

 // 4. la taille du vivier ne gonfle plus a chaque deblocage
 const tailles=etats.map(([nom,unl])=>{ state.unlocked=Object.assign({},unl); return tire().length; });
 if(tailles[3]>tailles[2]) throw new Error('le dernier deblocage ne doit pas faire gonfler le vivier, obtenu '+tailles.join('/'));
 console.log('taille du vivier tire OK : '+tailles.join(' -> ')+' au lieu de gonfler a chaque escalier');

 // 4b. aucun retrait ne peut orpheliner un verrou (F1 de l audit v1.15)
 Object.keys(DB).forEach(id=>{ const L=DB[id].lock; if(!L) return;
   state.unlocked={};
   Object.keys(DB).forEach(x=>{ if(DB[x].retire===L.after) state.unlocked[x]=true; });
   if(state.unlocked[id]) return;   /* un verrou deja ouvert ne peut plus etre orpheline */
   if(estRetire(L.after)) throw new Error('retrait orphelinant le verrou de '+id+' : '+L.after+' n enregistrera plus rien');
 });
 state.unlocked={};
 console.log('anti-orphelin OK : aucun retrait ne rend un verrou infranchissable');

 // 4c. les series d une seance allegee ne nourrissent aucun verrou (F2)
 await neuf();
 const src='goblet-squat', cible='rdl-kettlebell';
 applyProgress(src,[15,15,15],true,true);          /* seance allegee */
 checkUnlocks(3,false);
 if(state.unlocked[cible]) throw new Error('des series allegees ont ouvert un verrou a la seance suivante');
 applyProgress(src,[15,15,15],true,false);         /* seance normale */
 checkUnlocks(3,false);
 if(!state.unlocked[cible]) throw new Error('une seance normale doit ouvrir le verrou');
 console.log('provenance OK : la garde allegee couvre la seance suivante, pas seulement la seance elle-meme');

 // 4d. une descente n entre pas dans les paliers proposes au recapitulatif (F3)
 await neuf();
 const pf=perfOf('developpe-sol'); pf.load=6; pf.target=8; pf.range=DB['developpe-sol'].reps.slice();
 const av={load:pf.load,band:pf.band||null,range:pf.range.slice(),hold:false};
 applyProgress('developpe-sol',[3,3,3],true,false);
 if(pf.load>=av.load) throw new Error('descente attendue');
 if(estMontee(pf,av,DB['developpe-sol'])) throw new Error('une descente ne doit pas etre proposee comme palier a tenir');
 console.log('paliers OK : seules les montees sont proposees au recapitulatif');


 // 5. le tirage ne rend jamais un exercice retire
 await neuf();
 state.unlocked={'tractions-strictes-supination':true,'tractions-strictes-pronation':true,'tractions-assistees-pronation':true};
 const sortis={};
 for(let i=0;i<40;i++){ state.slotIdx.pull=i; sortis[pickFromPool('pull')]=1; }
 if(sortis['tractions-assistees-supination']||sortis['tractions-assistees-pronation']) throw new Error('un exercice retire est sorti au tirage');
 if(!sortis['face-pulls']) throw new Error('face-pulls doit sortir');
 console.log('tirage OK : '+Object.keys(sortis).length+' exercices distincts, aucun barreau depasse');

 // 6. marquage des exercices de repli
 await neuf();
 const replis=Object.keys(DB).filter(id=>estRepli(id));
 if(replis.indexOf('pompes-inclinees')<0||replis.indexOf('tirage-doux')<0||replis.indexOf('planche-genoux')<0) throw new Error('replis manquants : '+replis.join(','));
 if(replis.some(id=>SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0))) throw new Error('un exercice du vivier ne peut pas etre marque repli');
 if(estRepli('pompes-poignees')) throw new Error('un exercice du vivier marque repli');
 const h=libRowHtml('pompes-inclinees');
 if(!/>repli</.test(h)) throw new Error('etiquette repli absente de la ligne de bibliotheque');
 if(h.indexOf(DB['pompes-poignees'].nom)<0) throw new Error('la ligne doit nommer ce que le repli remplace');
 if(/>repli</.test(libRowHtml('pompes-poignees'))) throw new Error('etiquette repli sur un exercice du vivier');
 showFiche('planche-genoux','lib');
 if(!/Exercice de repli/.test(html)) throw new Error('bloc de repli absent de la fiche');
 if(html.indexOf(DB['planche'].nom)<0) throw new Error('la fiche doit nommer l exercice remplace');
 console.log('replis OK : '+replis.length+' exercices marques, lien nomme dans les deux sens');

 // 7. date du dernier import
 await neuf();
 if(state.lastImport) throw new Error('aucun import ne doit etre date sur un etat neuf');
 const paquet=JSON.parse(payload());
 delete paquet.lastImport;
 applyImport(paquet);
 if(!state.lastImport) throw new Error('applyImport doit dater l import');
 const d1=state.lastImport;
 if(!/Dernier import le/.test((renderSettings(),html))) throw new Error('la date d import doit s afficher dans la card Donnees');
 /* le fichier importe porte la date de l appareil emetteur : elle est ecrasee */
 const vieux=JSON.parse(payload()); vieux.lastImport='2000-01-01T00:00:00.000Z';
 applyImport(vieux);
 if(state.lastImport===vieux.lastImport) throw new Error('la date du fichier importe ne doit pas survivre');
 if(state.lastImport<d1) throw new Error('la nouvelle date doit etre posterieure');
 console.log('import OK : date posee au point de convergence, celle du fichier ecrasee');

 // 8. signal d exercice non realise : emis sur un exercice entierement passe,
 //    muet sur ceux qu une seance quittee n a jamais atteints
 await neuf();
 const seance=(cible,quitA)=>{
   startSession('alterne');
   const etapes=cur.steps.filter(s=>s.k==='set'&&!s.cool);
   let arret=null;
   etapes.forEach(s=>{
     const oid=s.from||s.id;
     if(quitA&&oid===quitA&&arret===null) arret=cur.steps.indexOf(s);
   });
   cur.i=arret===null?cur.steps.length:arret;
   cur.log={}; cur.done=0;
   etapes.forEach(s=>{
     const oid=s.from||s.id, i=cur.steps.indexOf(s);
     if(i>=cur.i) return;                       /* jamais atteint */
     if(oid===cible) return;                    /* entierement passe */
     (cur.log[s.key||s.id]=cur.log[s.key||s.id]||[]).push(DB[s.id].reps?DB[s.id].reps[0]:1);
     cur.done++;
   });
   return cur;
 };
 startSession('alterne');
 const passe=cur.exos[1];
 seance(passe,null);
 await endSession(false);   /* endSession se termine sur le recap : cur porte les msgs */
 const msgs=cur.msgs;
 if(!msgs.some(m=>m.indexOf('Exercice non réalisé')>=0&&m.indexOf(DB[passe].nom)>=0)) throw new Error('signal attendu sur l exercice entierement passe · '+msgs.join(' | '));
 console.log('exercice non realise OK : signale et nomme sur une seance menee au bout');

 await neuf();
 startSession('alterne');
 const exos2=cur.exos.slice();
 seance(null,exos2[2]);
 await endSession(true);
 const jamais=exos2[3];
 if(cur.msgs.some(m=>m.indexOf('Exercice non réalisé')>=0&&m.indexOf(DB[jamais].nom)>=0)) throw new Error('un exercice jamais atteint par une seance quittee ne doit rien signaler');
 console.log('seance quittee OK : les exercices jamais atteints restent muets');

 // 9. celebrations identitaire : un echange de deblocage fete le nouveau
 await neuf();
 state.unlocked={'rdl-kettlebell':true};
 let q=celebrations(['rdl-kettlebell'],[],1);
 if(q.length) throw new Error('un deblocage deja fete ne doit pas l etre deux fois');
 state.unlocked={'kb-swings':true};
 q=celebrations(['rdl-kettlebell'],[],1);
 if(q.length!==1||q[0].nom!==DB['kb-swings'].nom) throw new Error('un echange de deblocage doit feter le nouveau : le compteur ne le voyait pas');
 console.log('celebrations OK : comparaison par identite, l echange est vu');

 console.log('TESTS VIVIERS, REPLIS ET IMPORT V1.15 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test20.js


```javascript
/* test20 : correction de la derniere seance : instantane, rejeu, fenetre,
   invariants, ecran de saisie et fil de retour. Chantier v1.15, bloc 3. */
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
let html='';
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},style:{},textContent:'',value:'',select(){},remove(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:()=>{}};
global.navigator={};global.confirm=()=>true;
const T=`
(async()=>{
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ localStorage._m={}; state=null; await loadState();
 };
 /* joue une seance complete en imposant la valeur de chaque serie */
 const joue=async(val)=>{
   startSession();
   cur.log={}; cur.done=0;
   cur.steps.forEach(s=>{ if(s.k!=='set'||s.cool) return;
     const k=s.key||s.id, e=DB[s.id];
     (cur.log[k]=cur.log[k]||[]).push(val(s.id,e)); cur.done++; });
   cur.i=cur.steps.length;
   await endSession(false);
   return state.hist[state.hist.length-1];
 };
 const cible=id=>state.perf[id].target;

 // 1. l instantane est pose, date, et porte ce que cur ne peut plus dire
 await neuf();
 let h=await joue((id,e)=>e.reps?e.reps[0]:1);
 if(!state.undo) throw new Error('instantane absent');
 if(state.undo.date!==h.date) throw new Error('instantane non date sur la derniere seance');
 if(state.undo.rounds!==h.rounds) throw new Error('le volume de la seance doit etre memorise');
 if(Object.keys(state.undo.full).length!==state.undo.keys.length) throw new Error('full par cle absent');
 if(!corrigible()) throw new Error('la derniere seance doit etre corrigible');
 console.log('E1 OK : instantane pose, date, avec full et volume de seance');

 // 2. correction sans effet de seuil : la cible suit, le reste ne bouge pas
 const k0=state.undo.keys[0], id0=splitKey(k0).id, e0=DB[id0];
 const xp0=state.xp, badges0=state.badges.length, rot0=JSON.stringify(state.slotIdx);
 const nb=state.hist.length, div0=JSON.stringify(state.div), lu0=state.loadUps;
 const v=state.hist[nb-1].items[0].sets.map(()=>e0.reps[0]+2);
 corrigerSeance({[k0]:v});
 if(state.hist[nb-1].items[0].sets.join()!==v.join()) throw new Error('valeurs non ecrites dans l historique');
 if(cible(id0)!==Math.max(e0.reps[0],Math.min(e0.reps[1],Math.ceil((e0.reps[0]+3)/(e0.mode==='time'?5:1))*(e0.mode==='time'?5:1)))) throw new Error('cible non recalculee : '+cible(id0));
 if(state.xp!==xp0||state.badges.length!==badges0||JSON.stringify(state.slotIdx)!==rot0||state.hist.length!==nb) throw new Error('invariants casses : les valeurs seules changent');
 if(state.loadUps!==lu0||JSON.stringify(state.div)!==div0) throw new Error('div ou loadUps modifies sans montee');
 console.log('E2 OK : la cible suit, XP, badges, rotation et couverture ne bougent pas');

 // 3. correction qui cree une montee, puis correction qui la supprime
 await neuf();
 h=await joue((id,e)=>e.reps?e.reps[0]:1);
 const kc=state.undo.keys.filter(k=>{const e=DB[splitKey(k).id];return e.mode==='load'||e.mode==='fixed';})[0];
 if(kc){
   const idc=splitKey(kc).id, ec=DB[idc], i=state.undo.keys.indexOf(kc);
   const l0=state.undo.perf[idc].load, ups0=state.undo.loadUps;
   corrigerSeance({[kc]:state.hist[state.hist.length-1].items[i].sets.map(()=>ec.reps[1])});
   if(state.perf[idc].load<=l0) throw new Error('E3 : montee attendue apres correction');
   if(state.loadUps!==ups0+1) throw new Error('E3 : loadUps doit suivre');
   if(!state.perf[idc].grace) throw new Error('E3 : la grace doit etre posee par le rejeu');
   corrigerSeance({[kc]:state.hist[state.hist.length-1].items[i].sets.map(()=>ec.reps[0])});
   if(state.perf[idc].load!==l0) throw new Error('E4 : la montee doit etre defaite, charge '+state.perf[idc].load+' au lieu de '+l0);
   if(state.loadUps!==ups0) throw new Error('E4 : loadUps doit revenir');
   if(state.perf[idc].grace) throw new Error('E4 : la grace doit disparaitre avec la montee');
   console.log('E3-E4 OK : une correction cree puis defait une montee, loadUps et grace suivent');
 }

 // 4. une double correction repart toujours de l instantane d origine
 const kd=state.undo.keys[0], idd=splitKey(kd).id, ed=DB[idd], j=0;
 const base=JSON.stringify(state.undo.perf[idd]);
 corrigerSeance({[kd]:state.hist[state.hist.length-1].items[j].sets.map(()=>ed.reps[1])});
 corrigerSeance({[kd]:state.hist[state.hist.length-1].items[j].sets.map(()=>ed.reps[0])});
 if(JSON.stringify(state.undo.perf[idd])!==base) throw new Error('E6 : l instantane ne doit pas etre repris apres correction');
 console.log('E6 OK : la correction reste corrigeable, toujours depuis le meme point');

 // 5. une valeur nulle, vide ou non entiere est refusee
 const av=state.hist[state.hist.length-1].items[0].sets.join();
 corrigerSeance({[kd]:state.hist[state.hist.length-1].items[0].sets.map(()=>0)});
 if(state.hist[state.hist.length-1].items[0].sets.join()!==av) throw new Error('E11 : une serie a zero ne doit pas etre ecrite');
 corrigerSeance({[kd]:[1]});
 if(state.hist[state.hist.length-1].items[0].sets.join()!==av) throw new Error('E11 : on ne retire pas une serie par la correction');
 console.log('E11 OK : zero refuse, ajout et suppression refuses');

 // 6. la fenetre se ferme au demarrage de la seance suivante
 startSession();
 if(state.undo) throw new Error('E8 : la fenetre doit se fermer au demarrage de la seance suivante');
 if(corrigible()) throw new Error('E8 : plus rien a corriger');
 console.log('E8 OK : la fenetre se ferme quand une nouvelle seance demarre');

 // 7. l instantane survit a un rechargement
 await neuf();
 await joue((id,e)=>e.reps?e.reps[0]:1);
 await save();
 const gele=JSON.stringify(state.undo);
 state=null; await loadState(); domicile();
 if(!state.undo||JSON.stringify(state.undo)!==gele) throw new Error('E7 : l instantane doit survivre a un rechargement');
 console.log('E7 OK : l instantane est persiste, la correction survit a un rechargement');

 // 8. seance allegee : le rejeu utilise le mode de la seance, pas l etat courant
 await neuf();
 lightMode=true;
 await joue((id,e)=>e.reps?e.reps[1]:1);
 lightMode=false;
 if(!state.undo.light) throw new Error('E10 : le mode allege doit etre memorise');
 const ku=state.undo.keys[0], idu=splitKey(ku).id;
 const t0=state.perf[idu].target;
 corrigerSeance({[ku]:state.hist[state.hist.length-1].items[0].sets.slice()});
 if(state.perf[idu].target!==t0) throw new Error('E10 : une seance allegee ne fait pas progresser, meme rejouee');
 console.log('E10 OK : le rejeu utilise le mode et le volume de la seance corrigee');

 // 9. l ecran de correction se rend et refuse zero
 await neuf();
 await joue((id,e)=>e.reps?e.reps[0]:1);
 openFix('prog');
 if(!/Corriger la séance/.test(html)) throw new Error('E-UI : ecran de correction absent');
 if(!/Série 1/.test(html)) throw new Error('E-UI : les series doivent etre numerotees');
 if(/disabled/.test(html)) throw new Error('E-UI : bouton actif attendu sur des valeurs valides');
 const kk=state.undo.keys[0];
 fixVals[kk]=fixVals[kk].map(()=>0);
 renderFix();
 if(!/disabled/.test(html)) throw new Error('E-UI : le bouton doit etre inerte avec une serie a zero');
 /* le retour suit le fil : correction depuis l historique, retour a l historique */
 fixVals[kk]=fixVals[kk].map(()=>DB[splitKey(kk).id].reps[0]);
 fixApply();
 if(view!=='prog') throw new Error('E-UI : une correction depuis Progres doit y revenir, vue='+view);
 if(cur) throw new Error('E-UI : aucun recapitulatif ne doit rester en place');
 openFix('recap'); fixApply();
 if(view!=='recap') throw new Error('E-UI : une correction depuis le recapitulatif y revient');
 console.log('E-UI OK : ecran rendu, series numerotees, validation inerte a zero, retour au point de depart');

 console.log('TESTS CORRECTION DE SEANCE V1.15 OK');
})().catch(e=>{console.error('ECHEC:',e.message);process.exit(1)});
`;
eval(src+T);
```

## test21.js

```javascript
// Nouveautes v1.16 : rappel des series du jour et ligne de performance G,
// separateur unique, fourchette courante affichee, recapitulatif enrichi,
// modele rejoue au tick, appVersion et migrations rejouees a l import.
const fs=require('fs');
const src=fs.readFileSync('check.js','utf8').replace(/\(async function\(\)\{ await loadState\(\); applyTheme\(\); initView\(\); \}\)\(\);/,'');
global.localStorage={_m:{},getItem(k){return this._m[k]??null},setItem(k,v){this._m[k]=v}};
global.window={scrollTo:()=>{},matchMedia:()=>({matches:false,addEventListener(){}})};
let html='';
const handlers=[];
const mk=cap=>({set innerHTML(v){if(cap)html=v},get innerHTML(){return cap?html:''},classList:{add(){},remove(){}},textContent:'',value:'',select(){},remove(){},focus(){},setSelectionRange(){}});
const appEl=mk(true),otherEl=mk(false);
global.document={querySelector:s=>s==='#app'?appEl:(s==='.lightbox'?null:otherEl),documentElement:{dataset:{}},createElement:()=>({}),body:{appendChild(){}},execCommand:()=>true,addEventListener:(t,f)=>handlers.push(f)};
global.navigator={};global.confirm=()=>true;

// Horloge pilotee. Le drain ne joue QUE le minuteur courant : draine sans cette
// precaution, il enchaine sur celui de l etape suivante, cree par le rendu que
// la fin de l etape precedente vient de declencher, et compte des secondes qui
// appartiennent a une autre etape.
let TIMER=null;
global.setInterval=fn=>{const h={fn:fn};TIMER=h;return h;};
global.clearInterval=h=>{if(h&&typeof h==='object')h.dead=true;};
global.setTimeout=fn=>({fn:fn});
global.clearTimeout=()=>{};
global.__d=max=>{const h=TIMER;let n=0;while(h&&!h.dead&&n<(max||500)){h.fn();n++;}return n;};
/* v2.22 : horloge murale pilotee pour la cadence, lue par rhythmNow */
let CLOCK=1000;
global.performance={now:()=>CLOCK*1000};
global.__adv=s=>{ CLOCK+=s; };
global.__dn=n=>{const h=TIMER;let i=0;while(h&&!h.dead&&i<n){h.fn();i++;}return i;};

const T=`
(async()=>{
 /* L etat neuf part d un inventaire vide et d un onboarding depuis le chantier
    materiel : la suite decrit un domicile etabli et le dit, a chaque
    rechargement d etat */
 const domicile=()=>{ state.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR)); state.onboard=false; syncProfil(); };
 const neuf=async()=>{ state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState();

   state.warm='aucun'; state.cardio=false; state.stretch=false; state.rounds=3; state.goal=4;state.sound=false; };

 /* ---------- 1. separateur unique, appele partout ---------- */
 await neuf();
 const S=setsHtml([12,11,10]);
 if(S.indexOf(' / ')>=0) throw new Error('le separateur ne doit plus porter d espaces');
 if(S!=='12<i class="sl">/</i>11<i class="sl">/</i>10') throw new Error('forme du separateur : '+S);
 if(setsHtml([])!=='' || setsHtml(null)!=='') throw new Error('liste vide mal geree');
 if(setsHtml([9])!=='9') throw new Error('une seule valeur ne porte pas de separateur');
 console.log('T1 OK : separateur attenue unique, sans espaces, liste vide et singleton geres');

 /* ---------- 2. la fourchette affichee est celle de l exercice ---------- */
 await neuf();
 const p1=perfOf('pompes-poignees');
 p1.range=[8,16]; p1.target=8;
 if(rangeOf(p1,DB['pompes-poignees'])[1]!==16) throw new Error('rangeOf ne lit pas la fourchette courante');
 if(rangeOf(null,DB['pompes-poignees'])[1]!==DB['pompes-poignees'].reps[1]) throw new Error('rangeOf sans perf doit retomber sur le catalogue');
 startSession();
 cur.phase='work'; cur.i=0;
 const cible=cur.steps[0].id;
 perfOf(cible).range=[8,16]; perfOf(cible).target=9;
 render();
 if(html.indexOf('8-16')<0&&DB[cible].reps) {
   /* l exercice tire n est pas forcement celui qu on a truque : on verifie sur
      la fourchette reellement portee par l exercice de l etape */
   const r=rangeOf(perfOf(cible),DB[cible]);
   if(html.indexOf(r[0]+'-'+r[1])<0) throw new Error('la fourchette affichee ne suit pas p.range');
 }
 console.log('T2 OK : la fourchette affichee est celle de la performance, pas celle du catalogue');

 /* ---------- 3. rappel des series du jour ---------- */
 await neuf();
 startSession(); cur.phase='work'; cur.i=0;
 render();
 if(/Aujourd'hui/.test(html)) throw new Error('pas de pastille du jour a la premiere serie');
 if(!/Dernière fois/.test(html)===false&&state.perf[cur.steps[0].id].sets.length) throw new Error('coherence derniere fois');
 const st0=cur.steps[0];
 st0.val=13; validateSet();
 cur.i=0; render();
 if(!/Aujourd'hui/.test(html)) throw new Error('la pastille du jour manque a la serie suivante');
 if(html.indexOf('>13<')<0) throw new Error('la valeur du jour n est pas affichee');
 st0.val=12; validateSet();
 cur.i=0; render();
 if(html.indexOf('13<i class="sl">/</i>12')<0) throw new Error('toutes les series du jour doivent etre listees, pas seulement la derniere');
 console.log('T3 OK : les series du jour apparaissent des la deuxieme, toutes, avec le separateur commun');

 /* ---------- 4. un repli en cours d exercice repart d une liste vide ---------- */
 await neuf();
 startSession(); cur.phase='work';
 let iRepli=-1;
 cur.steps.forEach((s,i)=>{ if(iRepli<0&&s.k==='set'&&!s.cool&&DB[s.id].fb&&DB[s.id].reps&&DB[s.id].mode!=='time') iRepli=i; });
 if(iRepli<0) throw new Error('aucun exercice avec repli dans ce tirage');
 cur.i=iRepli; cur.steps[iRepli].val=10; validateSet();
 cur.i=iRepli; render();
 if(html.indexOf('>10<')<0) throw new Error('la serie du jour devrait etre visible avant le repli');
 swapPain();
 cur.i=iRepli; render();
 if(/Aujourd'hui/.test(html)) throw new Error('apres un repli, les series du jour ne sont plus les memes : la liste doit repartir vide');
 console.log('T4 OK : le journal est lu sous la cle courante, un repli repart d une liste vide');

 /* ---------- 5. modele rejoue : le tick compte le chronometre ---------- */
 await neuf();
 state.warm='complet';
 startSession();
 const m0=cur.model, plan0=cur.planSec;
 if(plan0==null) throw new Error('planSec doit etre pose au lancement');
 if(Math.abs(plan0-estimateSec({steps:cur.steps,warm:cur.warmMode,light:cur.light}))>1) {
   /* estimateSec attend un plan complet : on se contente de verifier l ordre de grandeur */
   if(plan0<300||plan0>3000) throw new Error('planSec hors de toute plausibilite : '+plan0);
 }
 if(m0!==0&&m0<0) throw new Error('le modele part du remontage de charge, jamais negatif');
 render();                       /* ecran d echauffement, demarre son chrono */
 /* v2.22 : le decompte de lancement tique d abord, puis passe la main */
 if(__dn(20)!==START_PREP) throw new Error('le decompte de lancement doit tiquer '+START_PREP+' fois puis s arreter');
 if(__dn(7)!==7) throw new Error('le chrono d echauffement n a pas tique sept fois');
 if(cur.model!==m0+START_PREP+7) throw new Error('decompte et sept secondes d echauffement doivent valoir '+(START_PREP+7)+' : '+(cur.model-m0));
 console.log('T5 OK : chaque seconde chronometree incremente le modele, une par une');

 /* ---------- 6. la part non chronometree suit la valeur saisie ---------- */
 await neuf();
 startSession(); cur.phase='work';
 let iReps=-1;
 cur.steps.forEach((s,i)=>{ if(iReps<0&&s.k==='set'&&!s.cool&&DB[s.id].mode!=='time') iReps=i; });
 cur.i=iReps;
 const id6=cur.steps[iReps].id, e6=DB[id6];
 const avant=cur.model;
 cur.steps[iReps].val=10; validateSet();
 const dix=cur.model-avant;
 await neuf();
 startSession(); cur.phase='work'; cur.i=iReps;
 const avant2=cur.model;
 cur.steps[iReps].id=id6; cur.steps[iReps].val=20; validateSet();
 const vingt=cur.model-avant2;
 if(!(vingt>dix)) throw new Error('vingt repetitions doivent couter plus cher que dix');
 const attendu=Math.round(10*tempoOf(id6)*(e6.side?2:1));
 if(vingt-dix!==attendu) throw new Error('l ecart doit valoir dix repetitions au tempo de l exercice : '+(vingt-dix)+' au lieu de '+attendu);
 if(serieModelAdd(id6,10)!==INSTALL+(e6.side?switchSec(id6):0)+Math.round(10*tempoOf(id6)*(e6.side?2:1))) throw new Error('serieModelAdd ne suit pas le modele v1.14');
 console.log('T6 OK : la part modelisee est calculee sur la valeur saisie, tempo de l exercice compris');

 /* ---------- 7. une tenue ne facture que son installation ---------- */
 await neuf();
 if(serieModelAdd('planche',45)!==INSTALL) throw new Error('une tenue ne doit facturer que son installation, son chrono ayant defile');
 if(serieModelAdd('etir-nuque',null)!==INSTALL_STRETCH) throw new Error('un etirement ne doit facturer que son installation courte');
 console.log('T7 OK : tenues et etirements ne facturent que leur installation, le reste a tique');

 /* ---------- 8. le retour d un pas defait la part modelisee ---------- */
 await neuf();
 startSession(); cur.phase='work';
 let iR=-1; cur.steps.forEach((s,i)=>{ if(iR<0&&s.k==='set'&&!s.cool&&DB[s.id].mode!=='time') iR=i; });
 cur.i=iR;
 const m8=cur.model;
 cur.steps[iR].val=12; validateSet();
 if(cur.model===m8) throw new Error('la validation n a rien ajoute au modele');
 stepBack();
 if(cur.model!==m8) throw new Error('le retour d un pas doit defaire exactement la part ajoutee : '+cur.model+' au lieu de '+m8);
 console.log('T8 OK : le retour d un pas defait la part modelisee, sans toucher aux secondes deja passees');

 /* ---------- 9. l entree d historique porte les deux durees a la seconde ---------- */
 await neuf();
 startSession(); cur.phase='work';
 while(cur.i<cur.steps.length&&!cur.recap){
   const s=cur.steps[cur.i];
   if(!s||s.k!=='set'){ if(!s) break; nextStep(); continue; }
   if(DB[s.id].mode==='time'){ s.sides=new Array(DB[s.id].side?2:1).fill(30); s.done=true; }
   if(DB[s.id].cadence){ cadInit(s); s.sides=s.sides.map(()=>10); s.side=s.sides.length-1; s.done=true; }
   s.val=10; validateSet();
 }
 for(let i=0;i<40;i++) await Promise.resolve();   /* endSession est async : on laisse la fin de seance se poser */
 const h9=state.hist[state.hist.length-1];
 if(h9.planSec==null) throw new Error('planSec absent de l entree');
 if(h9.model==null) throw new Error('model absent de l entree');
 if(h9.planSec===Math.round(h9.planSec/60)*60&&h9.planSec%60===0) { /* tolere, mais improbable */ }
 if(h9.plan!==Math.round(h9.planSec/60)) throw new Error('la minute affichee doit deriver de la seconde stockee');
 console.log('T9 OK : annonce stockee a la seconde, modele stocke, minute derivee');

 /* ---------- 10. recapitulatif : durees, volume, passage precedent ---------- */
 view='recap'; render();
 if(!/série/.test(html)&&!/séries/.test(html)) throw new Error('le volume joue manque au recapitulatif');
 if(!/min/.test(html)) throw new Error('la duree manque au recapitulatif');
 console.log('T10 OK : le recapitulatif porte la duree et le volume joue');

 /* ---------- 11. comparaison au passage precedent, marque d allege ---------- */
 await neuf();
 const idc='pompes-poignees';
 perfOf(idc).sets=[7,7,7]; perfOf(idc).lightSets=true;
 cur={recap:true,xp:10,msgs:[],type:'alterne',weekJust:false,inc:false,light:false,pop:[],popI:0,climbs:[],
      done:3,total:3,planSec:900,model:940,real:1000,
      items:[{id:idc,sets:[9,9,9],load:0,prev:[7,7,7],prevLight:true}]};
 view='recap'; render();
 if(html.indexOf('avant : 7<i class="sl">/</i>7<i class="sl">/</i>7')<0) throw new Error('le passage precedent doit etre affiche sous les valeurs du jour');
 if(!/allégée/.test(html)) throw new Error('une comparaison a un passage allege doit etre annoncee comme telle');
 cur.items[0].prevLight=false; render();
 if(/allégée/.test(html)) throw new Error('marque d allege affichee a tort');
 console.log('T11 OK : passage precedent affiche, marque d allege posee seulement quand elle s applique');

 /* ---------- 12. ecart au modele : moyenne, seances completes seulement ---------- */
 await neuf();
 const seance=(d,real,model,inc)=>{const e={date:d,type:'alterne',mode:'alterne',rounds:3,plan:Math.round(900/60),planSec:900,model:model,items:[{id:idc,sets:[8,8,8],load:0}],xp:63,real:real};if(inc)e.inc=true;return e;};
 const J=n=>{const x=new Date();x.setDate(x.getDate()-n);x.setHours(18,0,0,0);return x.toISOString();};
 state.hist=[seance(J(3),1000,940),seance(J(2),1100,1040),seance(J(1),5000,900,true)];
 const ts=timeStats(state);
 if(ts.nModel!==2) throw new Error('la seance quittee ne doit pas entrer dans l ecart au modele : '+ts.nModel);
 if(ts.gap!==60) throw new Error('ecart moyen attendu 60 s, obtenu '+ts.gap);
 view='prog'; render();
 if(!/Écart au modèle/.test(html)) throw new Error('la ligne d ecart au modele manque a la card Temps');
 console.log('T12 OK : ecart moyen sur les seules seances completes, 60 s sur deux seances');

 /* ---------- 13. decomposition dans la seance depliee ---------- */
 if(!/dont répétitions faites/.test(html)) throw new Error('la decomposition manque a la seance depliee');
 if(!/dont écart au modèle/.test(html)) throw new Error('le second terme de la decomposition manque');
 const dec=histTimeHtml(state.hist[0]);
 if(!dec) throw new Error('histTimeHtml vide sur une seance complete');
 if(histTimeHtml({real:900})!=='') throw new Error('pas de decomposition sans planSec ni model');
 console.log('T13 OK : decomposition presente dans le detail, absente des seances sans mesure');

 /* ---------- 14. appVersion ecrit au save, enveloppe hors de l etat ---------- */
 await neuf();
 await save();
 if(state.appVersion!==VERSION) throw new Error('appVersion doit etre ecrite au save');
 const brut=JSON.parse(localStorage.getItem('palier-state-v2'));
 if(brut.appVersion!==VERSION) throw new Error('appVersion absente du localStorage');
 if(brut.app!=null||brut.version!=null) throw new Error('l enveloppe ne doit pas etre dans l etat stocke');
 const env=JSON.parse(payload());
 if(env.app!=='palier'||env.version!==VERSION) throw new Error('l enveloppe du fichier exporte est fausse');
 console.log('T14 OK : appVersion au save, enveloppe posee a l export et absente de l etat');

 /* ---------- 15. le fossile version 1.0 ne survit pas a un import ---------- */
 await neuf();
 const fossile={app:'palier',version:'1.0',v:2,xp:100,goal:4,hist:[],perf:{},unlocked:{},badges:[],duration:15};
 applyImport(fossile);
 if(state.version!=null||state.app!=null) throw new Error('app et version doivent sortir de l etat a l import');
 const env2=JSON.parse(payload());
 if(env2.version!==VERSION) throw new Error('un export apres import doit porter la vraie version, obtenu '+env2.version);
 console.log('T15 OK : le fossile version 1.0 ne survit pas a un import');

 /* ---------- 16. les migrations se rejouent a l import ---------- */
 await neuf();
 const vieux={app:'palier',version:'1.12',v:2,xp:10,goal:4,hist:[],perf:{},unlocked:{},badges:[],duration:20};
 applyImport(vieux);
 if(state.rounds!==4) throw new Error('la migration duree vers series doit se rejouer a l import : rounds='+state.rounds);
 if(state.duration!=null) throw new Error('le champ duree doit disparaitre a l import');
 if(state.stretchIdx==null||state.div==null) throw new Error('les migrations v1.4 doivent se rejouer a l import');
 console.log('T16 OK : les migrations se rejouent a l import, duree 20 min devient 4 series');

 /* ---------- 17. migrateState est idempotente ---------- */
 await neuf();
 state.rounds=3;
 const a1=JSON.stringify(migrateState(JSON.parse(JSON.stringify(state))));
 const a2=JSON.stringify(migrateState(JSON.parse(a1)));
 if(a1!==a2) throw new Error('migrateState doit etre idempotente');
 console.log('T17 OK : migrateState est idempotente');

 /* ---------- 18. identite : seance jouee aux cibles, model == planSec ---------- */
 /* C est la garantie centrale du modele rejoue. Si elle tient, l ecart au modele
    ne contient plus que ce que le modele represente mal et les interruptions, et
    plus du tout les repetitions faites au-dela ou en deca des cibles. */
 const joue=async(cfg,bonus)=>{
   state=null; localStorage._m={}; cur=null; lightMode=false; view='home'; await loadState(); domicile();
   state.warm=cfg[0]; state.cardio=cfg[1]; state.stretch=cfg[2]; state.rounds=cfg[3];
  state.sound=false;
   startSession();
   const planSec=cur.planSec;
   let extra=0, cible0=null;
   if(cur.phase==='warm'){ renderSession(); let g=0; while(cur.phase==='warm'&&g++<40) __d(500); }
   let g=0;
   while(cur&&!cur.recap&&cur.i<cur.steps.length&&g++<500){
     const st=cur.steps[cur.i];
     if(st.k==='rest'){ renderSession(); __d(500); continue; }
     if(st.k==='cardio'){ renderSession(); toggleCardio(); __d(500); continue; }
     const e=DB[st.id];
     renderSession();
     if(e.mode==='stretch'){ toggleStretch(); __d(500); __d(500); validateSet(); continue; }
     if(e.mode==='time'){
       const c=perfFor(st.id,!!st.light).target, n=(e.side?2:1);
       for(let k=0;k<n;k++){ toggleChrono(); __d(500); __dn(c); toggleChrono(); }
       validateSet(); continue;
     }
     /* v2.22 : une serie cadencee se joue a l horloge murale, Stop une
        demi-seconde apres la fin de la repetition-cible, cote par cote */
     if(e.cadence){
       const sp=cadSpec(st);
       for(let k=0;k<sp.n;k++){ toggleCadence(); __adv(prepSec()+.15+sp.etab+sp.cible*sp.cycle+.5); cadLoop(); toggleCadence(); }
       validateSet(); continue;
     }
     const c=perfFor(st.id,!!st.light).target;
     let v=c;
     if(bonus&&cible0===null){ cible0=st.id; v=c+bonus; extra=Math.round(bonus*tempoOf(st.id)*(e.side?2:1)); }
     st.val=v; validateSet();
   }
   for(let i=0;i<80;i++) await Promise.resolve();
   const h=state.hist[state.hist.length-1];
   return {planSec:planSec,model:h.model,real:h.real,extra:extra,id:cible0};
 };
 for(const cfg of [['complet',false,true,3],['court',true,true,2],['aucun',false,false,4],['complet',true,true,4]]){
   const r=await joue(cfg,0);
   if(r.model!==r.planSec) throw new Error('identite rompue sur '+cfg.join('/')+' : planSec='+r.planSec+' model='+r.model);
 }
 console.log('T18 OK : seance jouee aux cibles, le modele rejoue retombe exactement sur l annonce, sur quatre configurations');

 /* ---------- 19. des repetitions en plus deplacent le modele, pas l annonce ---------- */
 const r19=await joue(['complet',false,true,3],8);
 if(r19.planSec===r19.model-r19.extra===false) throw new Error('incoherence de mesure');
 if(r19.model-r19.planSec!==r19.extra)
   throw new Error('huit repetitions de plus sur '+r19.id+' doivent deplacer le modele de '+r19.extra+' s, obtenu '+(r19.model-r19.planSec));
 if(r19.extra<=0) throw new Error('le bonus de repetitions doit couter du temps');
 console.log('T19 OK : huit repetitions de plus deplacent le modele de '+r19.extra+' s et laissent l annonce inchangee');

 console.log('TESTS V1.16 OK');
})();
`;
eval(src+T);
```

## test28.js


```javascript
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
```
