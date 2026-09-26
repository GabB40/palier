## 3. Architecture technique

Fichier unique livré sous le nom `index.html`, environ 4,1 Mo, sans dépendance réseau
obligatoire : la synchronisation entre appareils est facultative, et le lancement d'une séance ne
l'attend jamais plus de 5 s (v2.24).
Le livrable porte directement son nom de déploiement : il part tel quel vers S3, sans renommage.
Structure interne, dans l'ordre d'assemblage :

| Bloc | Contenu |
|---|---|
| `head.html` | shell HTML, CSS complet, favicon SVG inline, ouverture du `<script>` |
| `imgdata.js` | `const IMG={...}` : toutes les illustrations en base64 JPEG |
| `app1.js` | pictogrammes SVG de repli, `figFor`, échelle de charge (`loadLadder`, `nextLoad`) |
| `app2.js` | `const DB={...}` : base d'exercices (nom, muscles, description, vigilance, figure SVG) |
| `app3.js` | `CFG` surcouche de progression, variantes de tractions, `SLOTS`, `STRETCH_POOL`, `WARMUP`, XP, rangs, badges |
| `app4.js` | état, persistance en cascade, moteur de double progression, déblocages |
| `app5.js` | construction de séance, navigation, écran d'accueil |
| `app6.js` | moteur de séance : échauffement, séries, repos, cardio |
| `app7.js` | fin de séance, bibliothèque, progrès |
| `app9.js` | matériel par exercice, détail de séance |
| `app10.js` | synchronisation entre appareils (v2.24) |
| `app8.js` | réglages, clavier, routeur, initialisation |
| `tail.html` | fermeture |

Assemblage : `cat head.html imgdata.js app1.js app2.js app3.js app4.js app5.js app6.js app7.js app9.js app10.js app8.js tail.html > index.html`

**Navigation** : routage par hash (`#home #lib #prog #set #fiche/<id>`, jalons `#session` et
`#recap`). Les flèches avant/arrière du navigateur ou de la souris pilotent les vues ; le retour
arrière en pleine séance déclenche la confirmation de sortie existante (refus = on reste en
séance, accord = séance incomplète enregistrée) ; retour depuis le récap = accueil. Les étapes
internes d'une séance ne poussent pas d'entrées d'historique.

**Persistance** : cascade `window.storage` puis `localStorage` puis mémoire seule. Clé `palier-state-v2`.
Le `localStorage` est lié à l'origine (`https://palier.s1t3.link`) : changer de domaine ou revenir
en `file://` exige un export/import. Export par téléchargement de fichier (`palier-AAAA-MM-JJ.json`),
import par sélecteur ; copier-coller conservé en repli.

**Synchronisation** (v2.24, `app10.js`) : métadonnées sous `palier-sync-v1`, hors de l'état,
donc absentes des exports et de l'objet en ligne. `save()` appelle `syncTouch`, inerte sans clé
ou hors `https`. Contrat de l'API et décisions dans la section 5.

**Hébergement** (depuis le 25 septembre 2026) : stack CloudFormation `palier-edge` en `us-east-1`,
bucket du site `palier-site-727646498837` privé et versionné, OAC, distribution CloudFront sous
forfait gratuit avec l'ACL WAF `palier-waf`, HTTP/2 et 3, IPv6, enregistrements A et AAAA. Le
certificat ACM et la zone `s1t3.link` restent hors de la stack. Mesuré : `Cache-Control: no-cache`
et compression Brotli, 2,9 Mo reçus pour 4,2. Coût : zéro. Mise à jour de l'app par `deploy.sh`
depuis CloudShell `us-east-1`, qui vérifie la version servie. Budget de garde à 1 $/mois avec
alerte. Tout le détail, contraintes du forfait comprises, vit dans `docs/backend.md`.

Jusqu'au 25 septembre, l'hébergement était fait à la main, et ce paragraphe le décrivait mal sur
trois points, relevés à l'inventaire avant migration : l'ancienne distribution était déjà sous
forfait gratuit avec un WAF, et non « WAF désactivé » ; `index.html` ne portait aucun
`Cache-Control`, les navigateurs lui appliquant un cache heuristique ; la classe de prix était
`PriceClass_All` et non NA+EU. Même leçon que les compteurs de la section 6 : une description
d'infra se vérifie sur l'infra, elle ne se recopie pas.

**Paliers de consigne** (v2.17, généralisés en v2.18) : une échelle `[valeur, bas, haut]` portée
par l'exercice, tenue (`e.rhythm`, `p.tenue`) ou hauteur d'assise (`e.assise`, `p.assise`).
`rungSpec`, `rungOf` et `rungLbl` la lisent ; position absente au premier barreau ; le sens se lit
sur l'indice. Tout ce qui chronomètre continue de tester `e.rhythm`, ou `e.cadence` depuis la v2.19.

**Répétitions cadencées** (v2.19, généralisées en v2.22) : `e.cadence`
`{monte, tenue, descente, etab, reprise}`, sans échelle, un bloc ou deux selon `e.side` ; `PONT_CAD`
commune à la lignée du pont, `CAD_DEPUIS_SECONDES` borne la migration v2.19. `resumeCad` pour la
reprise. Moteur
propre (`cadStart`, `cadLoop`, `cadPaint`, `cadStop`, `toggleCadence`, `trimCad`, `resetCad`),
qui partage avec le rythme les deux horloges, `tone`, `toneCancel`, les fréquences et le décompte.
Mesure dans `st.sides` et `st.side` comme une tenue par côté, état de cadence dans `st.ct`.
`rhythmAbort` désarme les deux. `unitAt(e,it)` donne l'unité d'un passage, `it.u` quand il a été
joué sous un autre régime.

**Palier joué** (v2.12 pour la bande, v2.18 pour la charge et la consigne) : `p.setsBand`,
`p.setsLoad`, `p.setsRung`, écrits avec `p.sets` avant toute progression. Les portes de verrou
`bandGate`, `loadTop`, `kbTop` et `rungTop` ne lisent qu'eux ; les écrans lisent l'historique.

**Conventions** :
- L'identifiant d'un exercice est la clé dans `DB`, le nom du fichier image (`<id>.png`) et la clé dans `IMG`
- Toute modification passe par les fichiers sources puis réassemblage, jamais par édition du HTML final
- Un script Python `prep_illus.py` recadre, aligne, nettoie et compresse les images générées

**Tests** : cinquante suites Node lancées par `build.sh` (`test.js` intégrité et parcours complets,
`test2.js` matériel et détail, `test3.js` navigation, `test4.js` nouveautés v1.1, `test5.js`
nouveautés v1.2 : capacité manchon, échelles mono/lestes/bandes dans les deux sens, porte de bande
des strictes, les 15 messages de plafond, migration, normalisation d'inventaire, marqueur de
repli, photographie de bande, `test6.js` nouveautés v1.3 : affichage des charges à deux décimales,
prorata des semaines tronquées sur les sept jours de démarrage possibles, cas réel de la première
semaine, continuité, reprise après semaine vide, semaine en cours, file de célébrations et fusion
des paliers, consommation des touches par la surcouche, `test7.js` nouveautés v1.4 : montée
exigeant un exercice mené à terme, annonce des repos après repli, palier tenu et filet de
sécurité, écart poussé/tiré, étirements hors budget, repli cardio, entretien global, `test8.js`
nouveautés v1.5 : moyenne masquée puis bornée aux semaines révolues, comptage et fenêtre des
replis, séances dépliables, ordre des cartes de Progrès et de Réglages, valeurs en en-tête,
horodatage d'export, lignes de bibliothèque à vignettes, recherche, `test9.js`
nouveautés v1.6 : catalogue sans dips avec développé au sol, tolérance aux identifiants
d'historique absents, porte sonore globale, décompte de préparation, fenêtre des bips pré-cible,
écran d'exercice réordonné avec série en clair, pastilles groupées, card Sons, `test10.js`
consignes respiratoires : couverture du catalogue, placement en vigilance pour les tenues, absence
de blocage recommandé, échauffement, rendu, invariance de l'état, `test11.js` séance allégée :
calcul de cible et débordement sur la charge, plancher, substitution, gel dans les deux sens,
non-persistance, rotation figée en allégé et avancée en normal, exclusion du capteur de douleur,
accueil, fiche de repli, cards de Progrès, `test12.js`
nouveautés v1.10 : plancher de bande binaire par groupe avec verrouillés ignorés, échelle fixe et
écrêtage, projection conforme à `planFor` sur six configurations dont le cardio sacrifié à
10 minutes, curseurs hors bande, message au-dessus, zone de référence fermée par défaut, détail de
séance ouvert par défaut, absence d'effet de bord sur l'état), `test13.js` nouveautés v1.11 :
dénominateur borné aux semaines révolues avec le cas réel du 6 au 9 août, semaine en cours exclue,
fenêtre plafonnée à quatre semaines, fenêtre glissante conservée sur les replis douleur, arrondi
des tenues aux deux extrémités de la fourchette, traversée en huit passages, pas de 1 conservé sur
les répétitions et étirements hors moteur, ligne d'historique, touches d'ajustement et flèches
libérées, `test14.js` nouveautés v1.12 : découpage des durées d'étirement et somme égale à la
durée de base, valeur de départ des six chronos, déroulé complet d'un bilatéral avec bascule de
côté et fin, redémarrage depuis le premier côté, pause conservant temps et côté, cas unilatéral
sans bascule, porte sonore globale sur les deux bips, repli annulé sans série jouée avec
progression appliquée, repli annulé après série jouée avec journal, capteur et blocage conservés,
séance allégée sans retour offert, cardio aligné, `test15.js` nouveautés v1.13 : Stop définitif et
disparition de « Reprendre », inertie d'ESPACE après le dernier côté, remise à zéro du côté en
cours, tenue par côté avec bip de bascule et enregistrement du côté le plus court, refus de valider
une mesure absente ou à moitié faite, retour d'un pas défaisant journal, séries et XP sans se
propager au-delà de l'étape suivante, gel de rotation sur les seuls emplacements substitués,
échappatoire à la deuxième allégée et remise à zéro du compteur, total tout compris et
décomposition exacte, cardio additif, coût d'une série par exercice, ajustements du jour appliqués
puis oubliés, migration de la durée choisie vers un nombre de séries. Elles s'exécutent hors
navigateur avec un DOM
simulé, `test14.js` et `test15.js` pilotant en plus l'horloge et capturant les fréquences émises
pour rendre les
chronos déterministes. À relancer après toute modification : `./build.sh` assemble puis enchaîne
les cinquante suites, une par une et jamais en liste `&&`, `set -e` ignorant l'échec de tout maillon
d'une liste AND-OR sauf le dernier.

Les suites des lots récents ne sont pas détaillées ici, elles le sont dans
`tests/README.md` : `test24` intégrité, `test25` résolveur, `test26` profils, `test27` clôture
du chantier matériel, `test28` lot v2.1, `test29` lot v2.2, `test30` progression par exercice,
`test31` escalier des mollets, `test32` séries du jour sur l'écran de repos, `test33` découpage local du temps, `test34` ordre du
circuit, `test35` déphasage des viviers, `test36` indicateurs temporels de la transition,
`test37` ordre du circuit et pause de raccord nommée, `test38` journal enrichi,
`test39` dette v1.15 et texte « Comment ça marche », `test40` escalier du pont fessier,
`test41` fenêtre de deux passages sur la cible et texte en quatre blocs, `test42` lot lisibilité,
`test43` plafond au haut de fourchette et rognage des tenues, `test44` tenues rythmées,
`test45` paire constatée au raccord et règle du successeur, escalier du squat, portes au palier
joué et fiche au niveau joué, `test46` répétitions cadencées du gainage latéral avec abductions, `test47` repère sonore des tenues, `test48` décompte de lancement, aigu et chiffre de la cadence, pont cadencé avec reprise,
`test49` synchronisation côté client, l'app parlant au code de la Lambda extrait de
`palier-backend.yaml`,
`test49` synchronisation côté client, contre le code de la Lambda, lit aussi `palier-backend.yaml`,
`testapi` backend de synchronisation : les deux templates, Lambda sur S3 et SSM simulés, `cle.sh`
réellement exécuté. Seule suite qui ne lit pas `index.html` : elle lit `palier-backend.yaml`,
`palier-edge.yaml` et `cle.sh`, que `build.sh` recopie depuis `infra/`.
Une propriété de forme les concerne toutes : l'état neuf partant d'un inventaire vide, chaque suite
ancre explicitement son inventaire au domicile après chaque rechargement d'état. Quatorze des
vingt-trois suites héritées tombaient sans cet ancrage, aucune ne révélant un défaut applicatif :
elles supposaient le domicile sans le dire.

