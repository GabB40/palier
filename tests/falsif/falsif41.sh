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
