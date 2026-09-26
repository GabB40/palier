#!/bin/bash
# Banc de falsification du second volet de la v2.12 : dette v1.15 et texte
# « Comment ca marche ». Chaque mutation defait une decision du lot ; test39
# doit tomber sur chacune. Une mutation qui survit designe une assertion qui
# ne prouve rien.
set -e
cd "$(dirname "$0")"
cp app3.js .c3 ; cp app4.js .c4 ; cp app5.js .c5 ; cp app7.js .c7 ; cp app8.js .c8 ; cp app9.js .c9
restaure(){ cp .c3 app3.js; cp .c4 app4.js; cp .c5 app5.js; cp .c7 app7.js; cp .c8 app8.js; cp .c9 app9.js; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  if node test39.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- le verrou a porte de bande ----
sed -i "s/ok=L.length>0\&\&!!p.setsBand\&\&p.setsBand===L\[L.length-1\];/ok=L.length>0\&\&p.band===L[L.length-1];/" app4.js
essai "porte de bande relue sur le barreau courant au lieu du barreau joue"

sed -i "s/if(e.bnd) p.setsBand=p.band||null;//" app4.js
essai "barreau joue jamais ecrit"

sed -i "s/  p.sets=sets.slice(); p.date=new Date().toISOString();\n//" app4.js
sed -i "s/if(e.bnd) p.setsBand=p.band||null;/if(e.bnd\&\&!light\&\&!unqual) p.setsBand=p.band||null;/" app4.js
essai "barreau joue traite comme une action au lieu d une information"

sed -i "s/ok=L.length>0\&\&!!p.setsBand\&\&p.setsBand===L\[L.length-1\];/ok=L.length>0;/" app4.js
essai "conjonction de barreau supprimee : le verrou s ouvre a n importe quel barreau"

sed -i "s/let ok=(p.sets||\[\]).filter(x=>x>=e.lock.need).length>=k;/let ok=(p.best||0)>=e.lock.need;/" app4.js
essai "retour au maximum historique pour tous les verrous"

sed -i "s/    delete q.bandBest;//" app4.js
essai "cle morte conservee a la migration"

# ---- la correction ----
sed -i "s/    if(av!==ap) holdApres\[id\]={v:ap,at:p.holdAt||null};//" app7.js
essai "gestes manuels posterieurs de nouveau effaces en silence"

sed -i "s/    if(estMontee(avantCor\[id\],p,e)) undone.push('Montée annulée sur '+e.nom);//" app7.js
essai "montee defaite non annoncee"

sed -i "s/undone.push('Montée annulée sur '+e.nom);/msgs.push('Montée annulée sur '+e.nom);/" app7.js
essai "annulation melangee aux messages de progression"

sed -i "s/function undoneHtml(L,align){\n  if(!L||!L.length) return '';/function undoneHtml(L,align){/" app7.js
sed -i "s/  if(!L||!L.length) return '';/  L=L||[];/" app7.js
essai "bloc d annulation rendu meme quand rien n est defait"

sed -i "s/'<div class=\"tag flame\" style=\"display:block;margin:6px '+(align==='left'?'0':'auto')+';max-width:fit-content\">'/'<div class=\"tag ok\" style=\"display:block;margin:6px '+(align==='left'?'0':'auto')+';max-width:fit-content\">'/" app7.js
essai "annulation rendue comme une reussite"

# ---- la charge courante ----
sed -i "s/if(e.mode==='fixed') return loadLabelFor(id,(p\&\&p.load)||e.load0);/if(e.mode==='fixed') return fmtKg(e.load0);/" app9.js
essai "retour a la charge de depart du catalogue"

# ---- le texte ----
sed -i "s/function commentHtml(ouvert){/function commentHtml(ouvert){ ouvert=false;/" app5.js
essai "developpements replies aussi dans Reglages"

sed -i "s/  if(state.intro===false) return '';/  return '';/" app5.js
essai "bloc d introduction jamais rendu sur l accueil"

sed -i "s/function closeIntro(){ state.intro=false; save(); render(); }/function closeIntro(){ render(); }/" app5.js
essai "bouton qui ne retire rien"

sed -i "s/  if(f) return '';//" app7.js
sed -i "s/(f?'<div class=\"muted small\"><b>Fin de série<\/b> · '+f+'<\/div>':'')/'<div class=\"muted small\"><b>Fin de série<\/b> · '+(f||'')+'<\/div>'/" app7.js
essai "critere propre annonce sur les fiches qui n en ont pas"

sed -i "s/ fin:'la hanche qui descend./ vig2:'la hanche qui descend./" app3.js
essai "une fiche perd son critere de fin de serie"

rm -f .c3 .c4 .c5 .c7 .c8 .c9
echo "FALSIFICATION 39 TERMINEE"
