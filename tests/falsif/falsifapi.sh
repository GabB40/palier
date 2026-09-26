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
