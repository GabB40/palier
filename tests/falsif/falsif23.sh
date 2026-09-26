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
