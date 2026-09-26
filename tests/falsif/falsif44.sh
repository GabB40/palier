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

