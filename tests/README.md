# Suites et bancs

`./build.sh` recopie ce dossier à plat dans `build/` avec `src/`, `infra/` et `tools/`, puis lance
les cinquante suites une par une. Toute suite lit `check.js`, le script extrait de l'`index.html`
assemblé, dans le répertoire courant, sous un DOM simulé.

**Conventions communes.** L'état neuf part d'un inventaire vide : chaque suite ancre son
inventaire au domicile après chaque rechargement d'état. `test14`, `test15` et les suites de
chronos pilotent l'horloge et capturent les fréquences émises. `test49` et `testapi` lisent
`palier-backend.yaml`, `testapi` lit aussi `palier-edge.yaml` et exécute `cle.sh`. Une suite
nouvelle ou modifiée met sa ligne à jour ici, dans le même lot.

## Suites

| Suite | Lot | Objet |
|---|---|---|
| `test` | | intégrité et parcours complets |
| `test2` | | matériel par exercice et détail de séance |
| `test3` | | navigation |
| `test4` | v1.1 | nouveautés v1.1 |
| `test5` | v1.2 | capacité des manchons, échelles mono, lestes et bandes, porte de bande, messages de plafond, migration |
| `test6` | v1.3 | charges à deux décimales, semaines tronquées, continuité, célébrations |
| `test7` | v1.4 | montée exigeant un exercice mené à terme, palier tenu, filet de sécurité, écart poussé/tiré |
| `test8` | v1.5 | moyennes bornées aux semaines révolues, replis, cards repliables, bibliothèque |
| `test9` | v1.6 | retrait des dips, développé au sol, sons, décompte, écran d'exercice réordonné |
| `test10` | v1.7 | consignes respiratoires du catalogue et de l'échauffement |
| `test11` | v1.8 | séance allégée, substitution, gel de la progression |
| `test12` | v1.10 | couverture à échelle fixe, plancher mobile, projection de la configuration |
| `test13` | v1.11 | dénominateur de couverture, pas de 5 s, ligne d'historique, flèches |
| `test14` | v1.12 | chronos d'étirement, retour après repli douleur, cardio |
| `test15` | v1.13 | machine à états des tenues, retour d'un pas, gel par emplacement, volume choisi |
| `test16` | v1.14 | modèle de temps : tempo, installation, bascule de côté, remontages |
| `test17` | v1.14 | repos alterné, fourchettes de durée, survie des cards au re-rendu |
| `test18` | v1.15 | filet de sécurité en quatre cas, grâce post-montée, verrous plafonnés |
| `test19` | v1.15 | composition des viviers, replis marqués, fins de séance |
| `test20` | v1.15 | correction de la dernière séance : instantané, rejeu, fenêtre ; boutons Annuler et Corriger discrets (v2.25) |
| `test21` | v1.16 | séries du jour, performance, récapitulatif, migrations rejouées à l'import |
| `test22` | v1.17 | plafond des tenues au sol à 45 s, verrous de la planche sur ballon |
| `test23` | v1.18 | retrait du mode cible et du saut de séance, carrousel |
| `test24` | v2.0 | intégrité : l'inventaire borne à la lecture, jamais `perf` |
| `test25` | v2.0 | résolveur de positions, rotation sous profil réduit |
| `test26` | v2.0 | profils, réalisations de niveaux, qualification matérielle |
| `test27` | v2.0 | clôture du chantier matériel, onboarding, sixième bande |
| `test28` | v2.1 | écart de manchons, micro-palier, kettlebells, fentes lestées, profil neuf vide |
| `test29` | v2.2 | avancement des badges, plafond nommé des listes, volume joué |
| `test30` | v2.4 | progression par exercice sur les fiches |
| `test31` | v2.5 | escalier des mollets |
| `test32` | v2.6 | séries du jour sur l'écran de repos, `relinkRests` |
| `test33` | v2.6 | instant en UTC, jour civil sur l'horloge locale |
| `test34` | v2.7 | invariants de l'ordre du circuit |
| `test35` | v2.8 | déphasage des quatre viviers |
| `test36` | v2.9 | heure et temps écoulé sur la ligne de transition |
| `test37` | v2.10, v2.11 | ordre poussé, jambes, tiré, gainage ; pause au raccord nommée |
| `test38` | v2.12 | journal enrichi |
| `test39` | v2.12 | dette v1.15 et texte « Comment ça marche » |
| `test40` | v2.13 | escalier du pont fessier |
| `test41` | v2.14 | fenêtre de deux passages sur la cible, texte en quatre blocs |
| `test42` | v2.15 | lisibilité, migration de la mémoire de fenêtre |
| `test43` | v2.16 | plafond au haut de fourchette, rognage des tenues |
| `test44` | v2.17 | tenues rythmées : bird-dog et dead bug |
| `test45` | v2.18 | paire constatée au raccord, escalier du squat, portes au palier joué |
| `test46` | v2.19 | répétitions cadencées du gainage latéral avec abductions |
| `test47` | v2.20 | repère sonore des tenues |
| `test48` | v2.22 | décompte de lancement, aigu et chiffre de la cadence, pont cadencé |
| `test49` | v2.24 | synchronisation côté client contre le code de la Lambda, export réel embarqué |
| `testapi` | v2.24 | backend : templates, Lambda sur S3 et SSM simulés, `cle.sh` exécuté |

`test49` embarque l'export réel du 25 septembre 2026, signalements de douleur compris : avant
toute publication du dépôt, le remplacer par un état synthétique de même taille.

## Bancs de falsification

Chaque banc défait une décision de son lot par mutation ; la suite visée doit tomber sur chacune.
Hors `build.sh`, à relancer dans tout lot qui change le code visé. Mutations par remplacement
exact avec compte : un motif qui ne mord pas arrête le banc.

```bash
./build.sh
for b in build/falsif*.sh; do bash "$b" > "${b%.sh}.log" 2>&1; echo "$b $?"; done
grep -l 'NON DETECTE\|SURVIT \|SANS EFFET\|NE MORD PAS\|SYNTAXE CASSEE' build/falsif*.log
```

Le second `grep` doit rester muet : `falsif36` sort à 0 même sur une mutation non détectée.

Mutations comptées sur les journaux du 26 septembre 2026, toutes tombées :

| Banc | Suite | Mutations |
|---|---|---|
| `falsif23` | `test23` | 10 |
| `falsif36` | `test36` | 14 |
| `falsif37` | `test37` | 14 |
| `falsif38` | `test38` | 12 |
| `falsif39` | `test39` | 17 |
| `falsif41` | `test41` | 22 |
| `falsif42` | `test42` | 20 |
| `falsif43` | `test43` | 15 |
| `falsif44` | `test44` | 50 |
| `falsif45` | `test45` | 58, sections neutralisées comprises |
| `falsif46` | `test46` | 60, section neutralisée comprise |
| `falsif47` | `test47` | 13 |
| `falsif48` | `test48` | 25 |
| `falsif49` | `test49` | 33 |
| `falsifapi` | `testapi` | 39 |

Historique des suites et des bancs jusqu'à la v2.24 : `PALIER-outillage.md`, premier commit du
dépôt.
