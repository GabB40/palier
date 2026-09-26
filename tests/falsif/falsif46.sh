#!/bin/bash
# Banc de falsification du lot v2.19 : gainage lateral avec abductions, en
# repetitions cadencees. Chaque mutation defait une decision du lot ; test46
# doit tomber sur chacune. Une mutation qui survit designe une assertion qui
# ne prouve rien. Mutations par remplacement exact avec compte : un motif qui
# ne mord pas arrete le banc au lieu de se lire comme une survie. Le banc
# neutralise aussi la section 1 sur une copie de la suite, pour prouver que
# les sections de comportement mordent seules sur les valeurs du catalogue.
set -e
cd "$(dirname "$0")"
cp app3.js .d3 ; cp app4.js .d4 ; cp app5.js .d5 ; cp app6.js .d6 ; cp app7.js .d7 ; cp app8.js .d8 ; cp test46.js .t46
restaure(){ cp .d3 app3.js; cp .d4 app4.js; cp .d5 app5.js; cp .d6 app6.js; cp .d7 app7.js; cp .d8 app8.js; cp .t46 test46.js; }
essai(){
  cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
  python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
  node --check check.js
  if node test46.js > /dev/null 2>&1; then echo "SURVIT : $1"; else echo "tombe  : $1"; fi
  restaure
}
# Table en Python : les motifs portent des apostrophes echappees du code
# source, illisibles en arguments shell.
mutx(){ python3 - "$1" << 'PY'
import sys
T={
 # catalogue et fiche
 'cadence_1_2':('app3.js',"cadence:{monte:1.5,descente:1.5,etab:3}","cadence:{monte:1,descente:2,etab:3}"),
 'sans_etablissement':('app3.js',"cadence:{monte:1.5,descente:1.5,etab:3}","cadence:{monte:1.5,descente:1.5,etab:0}"),
 'retour_en_tenue':('app3.js',"cadence:{monte:1.5,descente:1.5,etab:3},","mode:'time',"),
 'fourchette_tenue':('app3.js',"mode:'bw',reps:[8,15],sets:2,side:true,\n   cadence","mode:'bw',reps:[15,45],sets:2,side:true,\n   cadence"),
 'lest_promis':('app3.js',"'gainage-lateral-jambe-levee':'pas de marche outillée au-delà ; la suite reste à décider',","'gainage-lateral-jambe-levee':'ajoute un leste de cheville sur la jambe levée ; l\\'outil ne suit pas encore cette charge',"),
 'predecesseur_ancien_nom':('app3.js',"'gainage-lateral':'le gainage latéral avec abductions prend le relais',","'gainage-lateral':'le gainage latéral jambe levée prend le relais',"),
 'appui_en_moins':('app3.js',"<b>Dos :</b> le tronc reste immobile, seule la hanche bouge ; aucune flexion de colonne.","<b>Dos :</b> même exercice anti-mouvement que la version au sol, avec un appui en moins."),
 'critere_de_fin_absent':('app3.js'," fin:'le bassin qui descend ou qui part en arrière. Dès que la ligne casse, Stop, quel que soit le compte.',\n",""),
 # migration
 'migration_absente':('app4.js',"if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];","if(false) delete s.perf[id];"),
 'migration_ecretage_seul':('app4.js',"if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];","if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) q.range=e.reps.slice();"),
 'migration_toute_perf':('app4.js',"if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;\n    if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];","if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;\n    delete s.perf[id];"),
 'passages_non_marques':('app4.js',"if(it.rng[0]!==e.reps[0]||it.rng[1]!==e.reps[1]) it.u='s';","if(false) it.u='s';"),
 'tous_passages_marques':('app4.js',"if(it.rng[0]!==e.reps[0]||it.rng[1]!==e.reps[1]) it.u='s';","it.u='s';"),
 'correction_gardee':('app4.js',"  })) delete s.undo;","  })) void 0;"),
 'correction_toujours_fermee':('app4.js',"    return e&&e.cadence&&exSecondes(id)&&q&&q.range&&(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]);","    return e&&e.cadence&&exSecondes(id);"),
 # modele de temps
 'modele_sans_etablissement':('app5.js',"Math.round(prepSec()+(c.etab||0)+r*","Math.round(prepSec()+r*"),
 'modele_un_cote':('app5.js',"INSTALL+(e.side?2:1)*Math.round(","INSTALL+1*Math.round("),
 'rejeu_modelise':('app5.js',"if(e.mode==='time'||e.rhythm||e.cadence) return INSTALL;","if(e.mode==='time'||e.rhythm) return INSTALL;"),
 # moteur
 'valeur_initiale_cible':('app6.js',"((e.mode==='time'||e.rhythm||e.cadence)?0:","((e.mode==='time'||e.rhythm)?0:"),
 'compte_en_haut':('app6.js',"function cadClosed(sp,e){ return e>0?Math.floor(e/sp.cycle):0; }","function cadClosed(sp,e){ return e>=sp.monte?Math.floor((e-sp.monte)/sp.cycle)+1:0; }"),
 'cible_en_plus_du_950':('app6.js',"      tone(cible?RHYTHM_CIBLE:RHYTHM_OPEN,t,cible?.22:.12);","      tone(RHYTHM_OPEN,t,.12); if(cible) tone(RHYTHM_CIBLE,t,.22);"),
 'cible_une_repetition_tot':('app6.js',"cible=(ct.base||0)+i+1===sp.cible;","cible=(ct.base||0)+i+2===sp.cible;"),
 'descente_tardive':('app6.js',"      tone(RHYTHM_CLOSE,t+sp.monte+sp.tenue,.12);","      tone(RHYTHM_CLOSE,t+sp.cycle/2+.5,.12);"),
 'depart_muet':('app6.js',"    if(sp.etab>0) RHYTHM_PREP_OFF.forEach(d=>tone(CAD_GO,zero+d+ct.off,.16));\n",""),
 'depart_simple_coup':('app6.js',"    if(sp.etab>0) RHYTHM_PREP_OFF.forEach(d=>tone(CAD_GO,zero+d+ct.off,.16));","    if(sp.etab>0) tone(CAD_GO,zero+ct.off,.16);"),
 'depart_a_950':('app6.js',"const CAD_GO=1150;","const CAD_GO=950;"),
 'montee_au_zero':('app6.js',"ct.t0=now+n+.15+sp.etab;","ct.t0=now+n+.15;"),
 'decompte_simple_coup':('app6.js',"    for(let k=n;k>=1;k--) RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,zero-k+d+ct.off,.1));","    for(let k=n;k>=1;k--) tone(RHYTHM_CLOSE,zero-k+ct.off,.1);"),
 'stop_non_definitif':('app6.js',"  if(st.done){ if(st.side>=st.sides.length-1) return; st.side++; st.done=false; }\n  cadStart(st);","  if(st.done){ st.done=false; }\n  cadStart(st);"),
 'stop_sans_annulation':('app6.js',"  clearInterval(timers.c); timers.c=null;\n  toneCancel();\n  renderSession();\n}\nfunction toggleCadence(){","  clearInterval(timers.c); timers.c=null;\n  renderSession();\n}\nfunction toggleCadence(){"),
 # « every » vers « some » dans cadReady est une mutation equivalente : Math.min
 # lit null comme 0, un cote non mesure ferme donc deja la validation. Ecartee.
 'validation_a_zero':('app6.js',"&&Math.min.apply(null,st.sides)>=1; }","&&Math.min.apply(null,st.sides)>=0; }"),
 'validation_ouverte':('app6.js',"function cadReady(st){ return !!st.sides&&st.sides.every(v=>v!=null)&&Math.min.apply(null,st.sides)>=1; }","function cadReady(st){ return !!st.sides; }"),
 'journal_cote_courant':('app6.js',"((e.mode==='time'||e.cadence)?Math.min.apply(null,st.sides):(st.val||0))","((e.mode==='time')?Math.min.apply(null,st.sides):(st.val||0))"),
 'rognage_sans_plancher':('app6.js',"  if(st.sides[i]==null||st.sides[i]<=0) return;\n  st.sides[i]--;","  if(st.sides[i]==null) return;\n  st.sides[i]--;"),
 'rognage_pendant_cadence':('app6.js',"  if(!st||!st.sides||(st.ct&&st.ct.on)) return;\n  if(st.sides[i]==null","  if(!st||!st.sides) return;\n  if(st.sides[i]==null"),
 'remise_a_zero_des_deux':('app6.js',"  st.sides[st.side]=null; st.val=0; st.done=false;\n  renderSession();\n}\n/* Etirements","  st.sides=[null,null]; st.side=0; st.val=0; st.done=false;\n  renderSession();\n}\n/* Etirements"),
 'abandon_ignore':('app6.js',"  if(st.ct&&st.ct.on){ st.ct.on=false; toneCancel(); }\n",""),
 'repli_transporte':('app6.js',"      delete s.ct; delete s.sides; delete s.side; delete s.done;}","      delete s.ct;}"),
 'repli_cadence_seule':('app6.js',"      delete s.ct; delete s.sides; delete s.side; delete s.done;}","      delete s.ct; if(DB[old].cadence){ delete s.sides; delete s.side; delete s.done; }}"),
 'retour_transporte':('app6.js',"      delete s.sides; delete s.side; delete s.done; delete s.ct;}","      }"),
 'retour_cadence_seul':('app6.js',"      delete s.sides; delete s.side; delete s.done; delete s.ct;}","      if(DB[old].cadence){ delete s.sides; delete s.side; delete s.done; delete s.ct; }}"),
 # « i>=cur.i » dans swapPain : les series deja jouees gardent leur cle de
 # journal, la mutation ne change rien d observable ici. Couverte ailleurs,
 # ecartee de ce banc.
 'etablissement_muet':('app6.js',"ph.innerHTML='<span class=\"tag ok\">Établis la ligne</span>';","ph.innerHTML='';"),
 'phase_inversee':('app6.js',"const tag=t<sp.monte?","const tag=t>=sp.monte?"),
 'comptes_figes':('app6.js',"  if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base+n);","  if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,null);"),
 'decompte_cote_droit':('app6.js',"cote=sp.n>1?rhythmSide(st.side):'';","cote=sp.n>1?rhythmSide(0):'';"),
 'bouton_principal_actif':('app6.js',"'<div class=\"mt\"></div><button class=\"big'+(over?' quiet':'')+'\" id=\"ct\"'+(over?' disabled':'')+' onclick=\"toggleCadence()\">'","'<div class=\"mt\"></div><button class=\"big'+(over?' quiet':'')+'\" id=\"ct\" onclick=\"toggleCadence()\">'"),
 'rognage_avant_mesure':('app6.js',"(m.some(v=>v!=null)&&!on?","(!on?"),
 'cote_court_tu':('app6.js',"(N>1?' par côté'+(m[0]!==m[1]?', le côté le plus court fait foi':''):'')","(N>1?' par côté':'')"),
 # historique
 'unite_heritee_ignoree':('app7.js',"function unitAt(e,it){ return (it&&it.u)||unitOf(e); }","function unitAt(e,it){ return unitOf(e); }"),
 'palier_tenu_compte':('app7.js',"  if(it.u&&it.u!==unitOf(e)) return null;\n",""),
 'fiche_en_reps':('app7.js',"setsHtml(it.sets||[])+' '+unitAt(e,it))","setsHtml(it.sets||[])+' '+unitOf(e))"),
 'detail_en_reps':('app7.js',"setsHtml(it.sets)+' '+unitAt(e,it))+'</span></div>';\n  }).join('')+'</div>';","setsHtml(it.sets)+' '+unitOf(e))+'</span></div>';\n  }).join('')+'</div>';"),
 # clavier
 'moins_cote_droit':('app8.js',"trimCad(st.side||0);","trimCad(0);"),
 'espace_ignore':('app8.js',"  else if(e.cadence){ if(!cadOver(st)) toggleCadence(); }   /* comme une tenue par cote (v2.19) */\n",""),
}
k=sys.argv[1]
f,old,new=T[k]
s=open(f,encoding='utf-8').read()
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE',k,'dans',f,':',s.count(old)); sys.exit(1)
open(f,'w',encoding='utf-8').write(s.replace(old,new))
PY
}
sans1(){ python3 - << 'PY'
s=open('test46.js',encoding='utf-8').read()
old=" // 1. catalogue\n {"
if s.count(old)!=1: print('MOTIF ABSENT OU MULTIPLE : section 1'); raise SystemExit(1)
open('test46.js','w',encoding='utf-8').write(s.replace(old," // 1. neutralisee par le banc\n if(0) {"))
PY
}
for k in cadence_1_2 sans_etablissement retour_en_tenue fourchette_tenue lest_promis predecesseur_ancien_nom appui_en_moins critere_de_fin_absent \
         migration_absente migration_ecretage_seul migration_toute_perf passages_non_marques tous_passages_marques correction_gardee correction_toujours_fermee \
         modele_sans_etablissement modele_un_cote rejeu_modelise \
         valeur_initiale_cible compte_en_haut cible_en_plus_du_950 cible_une_repetition_tot descente_tardive depart_muet depart_simple_coup depart_a_950 \
         montee_au_zero decompte_simple_coup stop_non_definitif stop_sans_annulation validation_a_zero validation_ouverte \
         journal_cote_courant rognage_sans_plancher rognage_pendant_cadence remise_a_zero_des_deux abandon_ignore repli_transporte repli_cadence_seule retour_transporte retour_cadence_seul \
         etablissement_muet phase_inversee comptes_figes decompte_cote_droit bouton_principal_actif rognage_avant_mesure cote_court_tu \
         unite_heritee_ignoree palier_tenu_compte fiche_en_reps detail_en_reps moins_cote_droit espace_ignore; do
  mutx "$k"
  essai "$k"
done
# section 1 neutralisee : les sections de comportement mordent seules
for k in cadence_1_2 sans_etablissement retour_en_tenue fourchette_tenue critere_de_fin_absent depart_a_950; do
  sans1
  mutx "$k"
  essai "$k, sans la section 1"
done

restaure
rm -f .d3 .d4 .d5 .d6 .d7 .d8 .t46
cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html
python3 -c "import re;h=open('index.html').read();open('check.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
node test46.js > /dev/null && echo "reference restauree, test46 passe"
