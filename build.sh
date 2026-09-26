#!/bin/bash
# Assemble l app depuis src/, lance les cinquante suites, puis ecrit
# dist/index.html. Tout est recopie a plat dans build/ (ignore par git) : suites
# et bancs lisent leurs fichiers dans le repertoire courant et restent donc
# inchanges d un octet. dist/ n est ecrit que si toutes les suites passent.
# Bancs de falsification, a la main apres un build : bash build/falsifNN.sh
set -e
cd "$(dirname "$0")"
rm -rf build
mkdir build
# une collision de noms ecraserait un fichier sans bruit
for f in src/* infra/* tests/*.js tests/falsif/*.sh tools/*.js tools/*.py; do
  n=${f##*/}
  if [ -e "build/$n" ]; then echo "collision de noms dans build/ : $n"; exit 1; fi
  cp -p "$f" "build/$n"
done
cd build
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 - << 'EOF'
import re,os
h=open('index.html').read()
open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))
print(round(os.path.getsize('index.html')/1024/1024,2),'Mo')
EOF
node --check check.js
# une par une, jamais en liste && : set -e ignore l echec de tout maillon d une
# liste AND-OR sauf le dernier, ce qui faisait afficher BUILD OK au-dessus d une
# suite en echec (constate en v1.11 sur test9)
for t in test test2 test3 test4 test5 test6 test7 test8 test9 test10 test11 test12 test13 test14 test15 test16 test17 test18 test19 test20 test21 test22 test23 test24 test25 test26 test27 test28 test29 test30 test31 test32 test33 test34 test35 test36 test37 test38 test39 test40 test41 test42 test43 test44 test45 test46 test47 test48 test49 testapi; do
  node $t.js
done
cd ..
mkdir -p dist
cp build/index.html dist/index.html
echo "BUILD OK"
