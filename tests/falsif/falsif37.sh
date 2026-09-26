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
