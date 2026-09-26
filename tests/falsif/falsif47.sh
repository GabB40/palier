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
