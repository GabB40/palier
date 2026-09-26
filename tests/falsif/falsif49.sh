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
