#!/bin/bash
# Banc de falsification du premier volet de la v2.12, le journal enrichi.
# Chaque mutation defait une decision du lot ; test38 doit tomber sur chacune.
# Une mutation qui survit designe une assertion qui ne prouve rien.
set -e
cd "$(dirname "$0")"
cp app4.js .b4 ; cp app6.js .b6 ; cp app7.js .b7
restaure(){ cp .b4 app4.js; cp .b6 app6.js; cp .b7 app7.js; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  if node test38.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

sed -i "s/if(pre\[k\].target!=null) it.tgt=pre\[k\].target;//" app7.js
essai "cible du jour plus ecrite"

sed -i "s/if(cur.secs\&\&cur.secs\[k\]) it.secs=cur.secs\[k\].slice();//" app7.js
essai "durees plus ecrites"

sed -i "s/roundsPlan:cur.rounds0!=null?cur.rounds0:cur.rounds,/roundsPlan:cur.rounds,/" app7.js
essai "roundsPlan qui recopie le realise au lieu du lance"

sed -i "s/if(st.k==='set'\&\&st.t0==null) st.t0=Date.now();/if(st.k==='set') st.t0=Date.now();/" app6.js
essai "horodatage repose a chaque rendu : un re-rendu raccourcit la serie"

sed -i "s/const dur=st.t0?Math.max(0,Math.round((Date.now()-st.t0)\/1000)):null;/const dur=st.t0?Math.max(60,Math.round((Date.now()-st.t0)\/1000)):null;/" app6.js
essai "plancher de 60 s applique a la duree d une serie"

sed -i "s/const dur=st.t0?Math.max(0,Math.round((Date.now()-st.t0)\/1000)):null;/const dur=st.t0?Math.min(600,Math.round((Date.now()-st.t0)\/1000)):null;/" app6.js
essai "ecretage a 600 s applique a la duree d une serie"

sed -i "s/  const dar=cur.secs\[b.key\];//" app6.js
sed -i "s/  if(dar\&\&dar.length) dar.pop();//" app6.js
sed -i "s/  if(dar\&\&!dar.length) delete cur.secs\[b.key\];//" app6.js
essai "le retour d un pas ne defait plus la duree : parite rompue"

sed -i "s/  delete st.t0;//" app6.js
essai "la serie refaite herite de l horodatage de la premiere tentative"

sed -i "s/Object.assign({},s,{val:null,t0:null,set:byRound.length+1})/Object.assign({},s,{val:null,set:byRound.length+1})/" app6.js
essai "tour ajoute qui recopie l horodatage de son modele"

sed -i "s/log:{},secs:{},xp:0/log:{},xp:0/" app6.js
essai "journal des durees jamais initialise"

sed -i "s/if(pre\[k\].target!=null) it.tgt=pre\[k\].target;/if(state.perf[id]) it.tgt=state.perf[id].target;/" app7.js
essai "cible ecrite apres progression au lieu d avant"

sed -i "s/const monte=!p.hold\&\&full\&\&sets.every(v=>v>=top);/const monte=!p.hold\&\&full\&\&sets.every(v=>v>=top)\&\&(!p.secs||true);/" app4.js
essai "temoin : mention des durees dans le moteur de progression"

rm -f .b4 .b6 .b7
echo "FALSIFICATION 38 TERMINEE"
