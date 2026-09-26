#!/bin/bash
# Banc de falsification du lot v2.15, lisibilite. Chaque mutation defait une
# decision du lot ; test42 doit tomber sur chacune. Une mutation qui survit
# designe une assertion qui ne prouve rien.
set -e
cd "$(dirname "$0")"
cp head.html .ch ; cp app4.js .c4 ; cp app5.js .c5 ; cp app6.js .c6 ; cp app7.js .c7 ; cp app9.js .c9
restaure(){ cp .ch head.html; cp .c4 app4.js; cp .c5 app5.js; cp .c6 app6.js; cp .c7 app7.js; cp .c9 app9.js; }
# Remplacement exact avec verification que le motif mord. Les mutations par sed
# de ce banc n en avaient pas : quand la v2.16 a reecrit la migration de la
# memoire de fenetre, ses cinq mutations sont devenues des patchs sans effet et
# se sont lues comme cinq survies, pendant deux versions. Meme lecon que
# build.sh en v1.11 : un outil qui annonce son resultat se verifie.
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
  if node test42.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}

# ---- migration ----
mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(false)"
essai "migration retiree"

mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.unqualSets&&!q.grace)"
essai "migration qui seme depuis une lecture allegee"

mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets)"
essai "migration qui seme malgre la grace"

mut app4.js "    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)" "    if(q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)"
essai "migration qui reecrit une memoire deja posee"

# La mutation « migration qui seme un passage au haut de fourchette au poids du
# corps » est retiree : la garde qu elle defaisait a ete supprimee en v2.16 avec
# le relevement de fourchette, un tel passage seme desormais comme les autres.

# ---- bibliotheque ----
sed -i "s/    const rot=ids.filter(id=>!isLocked(id)\&\&!estRepli(id)\&\&!estSubstitut(id));/    const rot=ids.filter(id=>!estRepli(id)\&\&!estSubstitut(id));/" app7.js
sed -i "s/    const lock=ids.filter(id=>isLocked(id));/    const lock=[];/" app7.js
essai "verrouilles de nouveau intercales"

sed -i "s/    const ouvert=q?' open':(libQPrev?'':cardOpen(k,false));/    const ouvert=cardOpen(k,false);/" app7.js
essai "la recherche n ouvre plus le bloc"

sed -i "s/    const ouvert=q?' open':(libQPrev?'':cardOpen(k,false));/    const ouvert=q?' open':' open';/" app7.js
essai "le bloc ouvert par defaut"

sed -i "s/  const stat=locked?'':(joue?setsHtml(p.sets):(hors||e.mode==='stretch'?'':'à faire'));/  const stat=locked?'':(joue?setsHtml(p.sets):(e.mode==='stretch'?'':'à faire'));/" app7.js
essai "a faire sur les lignes hors tirage"

sed -i "s/  const repli=estRepli(id), subst=estSubstitut(id), hors=!locked\&\&(repli||subst);/  const repli=estRepli(id), subst=false, hors=!locked\&\&(repli||subst);/" app7.js
essai "substituts de nouveau non marques"

sed -i "s/  const lvl=(!locked\&\&e.bnd\&\&p\&\&p.band)?bandLabel(p.band):(!locked\&\&p\&\&p.load?loadLabelFor(id,p.load):'');/  const lvl='';/" app7.js
sed -i "s/    '<span class=\"num small st\">'+tag+stat+'<\/span><\/div>';/    '<span class=\"num small st\">'+tag+stat+(p\&\&p.load?'<br>'+loadLabelFor(id,p.load):'')+'<\/span><\/div>';/" app7.js
essai "le niveau de retour dans la colonne de droite"

sed -i "s/\.exorow \.ex b{white-space:normal;line-height:1.2}/.exorow .ex b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/" head.html
essai "nom de bibliotheque de nouveau tronque"

# ---- en-tetes, accueil, detail ----
sed -i "s/text-align:right;white-space:normal;overflow-wrap:anywhere;line-height:1.25}/text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/" head.html
essai "valeur d en-tete ferme de nouveau coupee"

python3 - << 'PY'
s=open('app5.js',encoding='utf-8',newline='').read()
i=s.index("  '<div class=\"card\">'+\n    '<div class=\"spread\"><h3>Cette semaine</h3>")
j=s.index("  contentCard(plan,parts)+\n  sessionDetailHtml(plan)+\n")
week=s[i:j]; s=s[:i]+s[j:]
k=s.index("  '<div class=\"card\">'+\n    '<div class=\"spread\"><h3>Progression</h3>")
s=s[:k]+week+s[k:]
open('app5.js','w',encoding='utf-8',newline='').write(s)
PY
essai "Cette semaine redescendue sous le detail"

sed -i "s/  if(cool.length) jour+='<div class=\"muted small\" style=\"margin-top:6px\">Puis '+cool.map(s=>esc(DB\[s.id\].nom)).join(' et ')+' · '+fmtDur(cool.reduce((a,s)=>a+serieSec(s.id,false),0))+'<\/div>';/  if(cool.length) jour+='<div class=\"muted small\" style=\"margin-top:6px\">Puis '+cool.map(s=>esc(DB[s.id].nom)).join(' et ')+' · '+fmtDur(cool.reduce((a,s)=>a+serieSec(s.id,false),0))+'<\/div>'; jour+='<div class=\"muted small\">Touche un exercice pour sa fiche complète.<\/div>';/" app9.js
essai "phrase constante de retour dans le detail"

# ---- derniere fois ----
sed -i "s/  const pass=exoPassages(id).filter(x=>!x.repl);/  const pass=exoPassages(id);/" app6.js
essai "un passage de repli pris pour un passage propre"

sed -i "s/function lastLevel(id,p){/function lastLevel(id,p){ return '';/" app6.js
essai "derniere fois sans niveau"

# ---- progres, fiche, forme ----
sed -i "s/    '<details data-k=\"prog-assid\"'+cardOpen('prog-assid',false)+' style=\"margin-top:8px\">/    '<details data-k=\"prog-assid\" open style=\"margin-top:8px\">/" app7.js
essai "referentiel d assiduite deplie"

sed -i "s/La cible suit tes séries, puis la charge prend le relais./La cible monte d'un cran à chaque séance réussie, puis la charge prend le relais./" app7.js
essai "ancien texte de fiche"

sed -i "s/@media (min-width:900px){#app{max-width:600px}}//" head.html
essai "desktop a 480 px"

sed -i "s/#app{max-width:480px;margin:0 auto;padding:14px 14px 92px}/#app{max-width:600px;margin:0 auto;padding:14px 14px 92px}/" head.html
essai "mobile elargi a 600 px"

rm -f .ch .c4 .c5 .c6 .c7 .c9
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
echo "banc termine, sources restaurees"
