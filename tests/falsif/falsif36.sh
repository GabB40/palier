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
