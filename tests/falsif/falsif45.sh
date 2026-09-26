#!/bin/bash
# Banc de falsification du lot v2.18 : premiere paire constatee au raccord,
# puis escalier du squat, portes de verrou au palier joue et fiche.
# Chaque mutation defait une decision du lot ; test45 doit tomber sur chacune.
# Une mutation qui survit designe une assertion qui ne prouve rien. Le banc
# neutralise aussi des sections de la suite, sur une copie, pour prouver que
# les sections aval mordent seules : la section 1 compare la liste entiere et
# ferait tomber toute mutation de contenu a elle seule. Chaque
# mutation est appliquee par remplacement exact, et le banc s arrete si le
# motif ne mord pas : un motif qui ne mord pas se lirait sinon comme une survie.
set -e
cd "$(dirname "$0")"
cp app1.js .d1 ; cp app3.js .d3 ; cp app4.js .d4 ; cp app5.js .d5 ; cp app6.js .d6 ; cp app7.js .d7 ; cp app8.js .d8 ; cp test45.js .t45
restaure(){ cp .d1 app1.js; cp .d3 app3.js; cp .d4 app4.js; cp .d5 app5.js; cp .d6 app6.js; cp .d7 app7.js; cp .d8 app8.js; cp .t45 test45.js; }
mut(){ python3 - "$1" "$2" "$3" << 'PY'
import sys
p,old,new=sys.argv[1:4]
s=open(p,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE dans',p,':',old[:60]); sys.exit(1)
open(p,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test45.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}
L="const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol'];"
sans1(){ mut test45.js " // 1. le contenu livre : deux paires, pas une de plus" $' // 1. neutralisee par le banc\n if(0)'; }
sans2(){ mut test45.js " // 2. regle du successeur, derivee du catalogue" $' // 2. neutralisee par le banc\n if(0)'; }
sans4(){ mut test45.js " // 4. le cas du 15 septembre, sur l etat reel exporte ce jour-la" $' // 4. neutralisee par le banc\n if(0)'; }

# ---- contenu ----
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=[];"
essai "liste revenue vide"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol'];"
essai "successeur oublie"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral-jambe-levee>developpe-sol'];"
essai "paire constatee remplacee par son seul successeur"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol','planche>developpe-sol'];"
essai "paire ajoutee par analogie"
mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>pompes-poignees'];"
essai "successeur nomme devant un autre pousse"

# ---- contenu, section 1 neutralisee : les sections aval mordent seules ----
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=[];"
essai "liste revenue vide, sans la section 1"
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol'];"
essai "successeur oublie, sans la section 1"
sans1; sans2; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol'];"
essai "successeur oublie, sans les sections 1 et 2"
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral-jambe-levee>developpe-sol'];"
essai "paire constatee remplacee par son seul successeur, sans la section 1"
sans1; sans2; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral-jambe-levee>developpe-sol'];"
essai "paire constatee remplacee par son seul successeur, sans les sections 1 et 2"
sans1; sans4; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol','bird-dog>developpe-sol'];"
essai "paire ajoutee par analogie, sans successeur, sans les sections 1 et 4"
sans1; mut app3.js "$L" "const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>pompes-poignees'];"
essai "successeur nomme devant un autre pousse, sans la section 1"

# ---- generalisation du mecanisme ----
mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[1]===b); }"
essai "tout gainage devant le developpe pause"
mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[0]===a); }"
essai "le gainage lateral pause devant tout pousse"
sans4; mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[1]===b); }"
essai "tout gainage devant le developpe pause, sans la section 4"
sans4; mut app5.js "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }" "function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.some(x=>x.split('>')[0]===a); }"
essai "le gainage lateral pause devant tout pousse, sans la section 4"
mut app3.js "const PAUSE_TOUR=60;" "const PAUSE_TOUR=90;"
essai "pause portee a 90 s"

# ---- fiche ----
mut app3.js "la version genoux compte pleinement. <b>Épaules :</b> pousse le sol avec l\\'avant-bras et garde l\\'épaule loin de l\\'oreille, sans t\\'affaisser dedans. La version genoux allège aussi l\\'épaule. <b>Respiration" "la version genoux compte pleinement. <b>Respiration"
essai "ligne Epaules retiree du gainage lateral"
mut app3.js "bascule le bassin. <b>Épaules :</b> même appui que la version au sol, pousse le sol avec l\\'avant-bras et garde l\\'épaule loin de l\\'oreille, sans t\\'affaisser dedans. <b>Respiration" "bascule le bassin. <b>Respiration"
essai "ligne Epaules retiree de la jambe levee"
mut app3.js " La version genoux allège aussi l\\'épaule. <b>Respiration" " <b>Respiration"
essai "repli genoux muet sur l epaule"

# ---- textes ----
mut app8.js "Sur certains enchaînements que tu as signalés," "Sur certains enchaînements que vous avez signalés,"
essai "vouvoiement revenu dans Reglages"
mut app6.js "'Tu as signalé une gêne d\\'épaule sur cet enchaînement, et la pause est posée sur lui seul. '+" "'C\\'est la seule adjacence où l\\'alternance ne repose rien, le gainage et le poussé pouvant se disputer l\\'épaule. '+"
essai "message de pause revenu a la regle inconditionnelle"
mut app6.js "'Sans elle, la première série du tour suivant se fait sur une épaule déjà fatiguée," "'Une minute, c\\'est ce qu\\'il faut. Sans elle, la première série du tour suivant se fait sur une épaule déjà fatiguée,"
essai "message qui chiffre un besoin"

# ---- escalier du squat, portes au palier joue, fiche (sections 9 a 17) ----
# Table de mutations en Python : les motifs portent des apostrophes echappees
# du code source, illisibles en arguments shell.
mutx(){ python3 - "$1" << 'PY'
import sys
T={
 'porte_charge_apres':('app4.js',"    const j=p.setsLoad;","    const j=p.load;"),
 'charge_jouee_non_ecrite':('app4.js',"  if(e.mode==='load'||e.mode==='fixed') p.setsLoad=p.load||0;\n",""),
 'kbTop_au_dernier_cran':('app4.js',"    if(lk.loadTop) x=L.length?L[L.length-1]:null;","    if(lk.loadTop||lk.kbTop) x=L.length?L[L.length-1]:null;"),
 'portes_nouvelles_ignorees':('app4.js',"if(ok&&(e.lock.loadTop||e.lock.kbTop||e.lock.rungTop)) ok=gatePalier(e).ok;","if(ok&&e.lock.loadTop) ok=gatePalier(e).ok;"),
 'porte_ouverte_sans_palier':('app4.js',"ok:!!x&&j!=null&&j>=x.v-0.001","ok:!!x&&(j==null||j>=x.v-0.001)"),
 'rungTop_assise_courante':('app4.js',"top=(s&&s.L.length)?s.L[s.L.length-1][0]:null, j=p.setsRung;","top=(s&&s.L.length)?s.L[s.L.length-1][0]:null, j=p.assise;"),
 'montee_assise_sans_cible_basse':('app4.js',"p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;","p.assise=nr[0]; p.range=[nr[1],nr[2]]; state.loadUps++; montee=true; p.grace=true;"),
 'montee_assise_sans_grace':('app4.js',"p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;","p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true;"),
 'descente_assise_muette':('app4.js',"if(r.i>0){ const pr=e.assise.ladder[r.i-1];","if(false){ const pr=e.assise.ladder[r.i-1];"),
 'sens_lu_sur_la_valeur':('app7.js',"if(rs) return rungOf(e,p[rs.k]).i>rungOf(e,pre[rs.k]).i;","if(rs) return rungOf(e,p[rs.k]).v>rungOf(e,pre[rs.k]).v;"),
 'palierUp_inverse':('app7.js',"  if(e.assise) return b<a;","  if(e.assise) return b>a;"),
 'assise_non_historisee':('app7.js',"    if(DB[id]&&DB[id].assise) it.assise=assiseOf(id,pre[k]);\n",""),
 'assise_historisee_apres':('app7.js',"it.assise=assiseOf(id,pre[k]);","it.assise=assiseOf(id,state.perf[id]);"),
 'tenir_ce_palier_oublie_assise':('app7.js',"  if(DB[c.id].assise){ if(c.prev.assise!=null) p.assise=c.prev.assise; else delete p.assise; }\n",""),
 'ecran_sans_assise':('app6.js',"(e.assise?'<div class=\"pv\"><b class=\"num\">'+assiseOf(id,p)+' cm</b><span>Assise</span></div>':'')+","''+"),
 'fiche_niveau_du_jour':('app7.js',"setsHtml(p.sets)+esc(playedLabel(id,p))+","setsHtml(p.sets)+(e.bnd&&p.band?', '+bandLabel(p.band):(p.load?' à '+loadLabelFor(id,p.load):''))+"),
 'niveau_joue_courant':('app6.js',"  const src=it||{load:p.load,band:p.band,tenue:tenueOf(id,p),assise:assiseOf(id,p)};","  const src={load:p.load,band:p.band,tenue:tenueOf(id,p),assise:assiseOf(id,p)};"),
 'niveau_joue_avec_replis':('app6.js',"  const pass=exoPassages(id).filter(x=>!x.repl);\n  const it=pass.length?pass[pass.length-1].it:null;\n  const src=","  const pass=exoPassages(id);\n  const it=pass.length?pass[pass.length-1].it:null;\n  const src="),
 'lestes_sur_echelle_kb_seules':('app1.js',"steps=seules?[0]:cuffSteps(g,limbs)","steps=cuffSteps(g,limbs)"),
 'goblet_reste_dans_KB_NEXT':('app3.js',"const KB_NEXT=['squat-une-jambe-chaise-leste','rdl-kettlebell','kb-swings','rowing-kettlebell'];","const KB_NEXT=['goblet-squat','squat-une-jambe-chaise-leste','rdl-kettlebell','kb-swings','rowing-kettlebell'];"),
 'marche_goblet_ancienne':('app3.js'," 'goblet-squat':'le squat sur une jambe vers la chaise prend le relais',"," 'goblet-squat':'sac lesté porté devant, jamais dans le dos',"),
 'marche_fentes_ancienne':('app3.js'," 'fentes-arriere-lestee':'squat bulgare avec haltères, en repartant vers 5 kg par main ; l\\'outil ne le suit pas encore'"," 'fentes-arriere-lestee':'sac lesté porté devant, ou fentes bulgares plus tard'"),
 'substitut_leste_absent':('app3.js',"2:['squat-une-jambe-chaise'],",""),
 'SUBS_non_decale':('app3.js',"legs:{0:['box-squat'],2:['squat-une-jambe-chaise'],4:['fentes-arriere'],6:['pont-fessier'],9:['hip-thrust-une-jambe'],11:['mollets-debout'],13:['mollets-une-jambe'],14:['step-ups-bas'],15:['rdl-elastique']}","legs:{0:['box-squat'],2:['fentes-arriere'],4:['pont-fessier'],7:['hip-thrust-une-jambe'],9:['mollets-debout'],11:['mollets-une-jambe'],12:['step-ups-bas'],13:['rdl-elastique']}"),
 'SCHEMA_core_decale':('app3.js',"core:['gainage antérieur','gainage antérieur instable','coordination croisée','gainage latéral',\n       'gainage latéral chargé','anti-extension','anti-rotation']","core:['gainage antérieur','gainage antérieur instable','gainage latéral','anti-extension',\n       'coordination croisée','gainage latéral chargé','anti-rotation']"),
 'echelons_en_fin_de_vivier':('app3.js',"pool:['goblet-squat','squat-une-jambe-chaise','squat-une-jambe-chaise-leste','fentes-arriere',","pool:['goblet-squat','fentes-arriere',"),
 'crans_de_2_5_cm':('app3.js',"assise:{ladder:[[50,8,15],[40,8,15]]},","assise:{ladder:[[50,8,15],[47.5,8,15],[45,8,15],[42.5,8,15],[40,8,15]]},"),
 'verrou_entree_au_dernier_cran':('app3.js',"sans lestes',need:15,minSets:2,kbTop:true}","sans lestes',need:15,minSets:2,loadTop:true}"),
 'repli_leste_sans_charge':('app3.js',"<b>Respiration :</b> souffle en remontant, ne bloque pas.',\n fb:'box-squat'};\n\n/* --- v1.17","<b>Respiration :</b> souffle en remontant, ne bloque pas.',\n fb:'squat-une-jambe-chaise'};\n\n/* --- v1.17"),
 'consigne_chaise_absente':('app3.js',"<b>Chaise :</b> un siège qui ne roule ni ne pivote, ou calé contre un mur ou un meuble ; toujours le même, repéré aux mêmes hauteurs. ",""),
 'verrou_sans_palier_affiche':('app7.js',"      if(gp) etat+=gp.joue?","      if(false) etat+=gp.joue?"),
}
k=sys.argv[1]
f,old,new=T[k]
s=open(f,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE',k,'dans',f,':',s.count(old)); sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
for k in porte_charge_apres charge_jouee_non_ecrite kbTop_au_dernier_cran portes_nouvelles_ignorees porte_ouverte_sans_palier \
         rungTop_assise_courante montee_assise_sans_cible_basse montee_assise_sans_grace descente_assise_muette \
         sens_lu_sur_la_valeur palierUp_inverse assise_non_historisee assise_historisee_apres tenir_ce_palier_oublie_assise \
         ecran_sans_assise fiche_niveau_du_jour niveau_joue_courant niveau_joue_avec_replis lestes_sur_echelle_kb_seules \
         goblet_reste_dans_KB_NEXT marche_goblet_ancienne marche_fentes_ancienne substitut_leste_absent SUBS_non_decale \
         SCHEMA_core_decale echelons_en_fin_de_vivier crans_de_2_5_cm verrou_entree_au_dernier_cran repli_leste_sans_charge \
         consigne_chaise_absente verrou_sans_palier_affiche; do
  mutx "$k"
  essai "$k"
done
# sections 9 et 10 neutralisees : les sections de comportement mordent seules
for k in echelons_en_fin_de_vivier substitut_leste_absent verrou_entree_au_dernier_cran repli_leste_sans_charge; do
  mut test45.js " // 9. catalogue, tables par position" $' // 9. neutralisee par le banc\n if(0)'
  mutx "$k"
  essai "$k, sans la section 9"
done

restaure
rm -f .d1 .d3 .d4 .d5 .d6 .d7 .d8 .t45
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
node test45.js > /dev/null && echo "reference restauree, test45 passe"
