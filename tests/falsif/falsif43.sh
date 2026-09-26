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
