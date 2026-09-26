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
