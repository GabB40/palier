## 6. Manière de travailler

**Écarts aux instructions.** Tout relevé de session porte cette section en tête, vide ou non. Une
instruction directe de Gabriel est une **contrainte du lot** : une séance de conception peut la
contester par écrit, elle ne peut pas la remplacer. Un relevé contenant un renversement d'instruction
ne porte pas « validé pour implémentation », il porte « à arbitrer », et c'est Gabriel qui tranche.

Motif, septembre 2026. Gabriel avait demandé à cinq reprises que la pause longue ne s'applique
qu'aux enchaînements qui en ont besoin. Le relevé du 10 septembre a renversé cette instruction à
l'intérieur d'une section titrée « validé pour implémentation », avec un motif, en la reportant à
une « optimisation ultérieure » sans déclencheur ni date. Le changelog puis le carnet l'ont reprise
telle quelle. La conversation d'implémentation a été fidèle à un contrat qui contredisait la
consigne, et n'avait aucun moyen de le savoir. Le défaut n'est pas dans l'exécution, il est dans le
fait qu'un renversement d'instruction ait pu être enfoui dans un document marqué validé. Trois lots
et deux audits externes ont été nécessaires pour le rattraper.

**Le problème d'origine s'écrit en une phrase en tête du relevé**, avec sa fréquence mesurée sur le
tirage réel et non sur des quatuors équiprobables. Le 10 septembre, il n'y figurait pas ; on y
trouvait « l'épaule est la ressource limitante », qui est déjà une généralisation, et c'est cette
généralisation qui a produit une pause à 100 % pour une paire à 11 %.

**Le ressenti prime sur le journal.** Position de Gabriel, septembre 2026. Le journal dit ce qui a
été fait, pas ce qui a été senti, et c'est le senti qui décide de ce qu'il faut réparer. Un
instrument de mesure sert à vérifier une hypothèse, jamais à en fabriquer une.

- Discuter et valider les décisions de conception avant d'écrire du code
- À chaque incrément de version : créer l'entrée correspondante dans `docs/changelog.md`, mettre à jour l'état courant de la section 5, et ne pas y réintroduire d'historique
- Réponses en français, denses, sans préambule
- Pushback honnête attendu, y compris sur les demandes de l'utilisateur
- Vérifier plutôt que juger à l'œil : mesurer dans les images, tester le code, chiffrer les durées
- Un bloc de remplacements multiples écrit au fur et à mesure, ou vérifie après coup sur le fichier :
  une assertion qui échoue en fin de bloc annule toutes les écritures du bloc, et annoncer son succès
  depuis l'intérieur du bloc fait croire le travail fait (cas survenu en v1.8 sur deux cards de
  Progrès, rattrapé par un test de rendu)
- Un outil qui annonce son propre succès doit être vérifié comme le reste : `build.sh` chaînait
  ses suites par `&&` et affichait `BUILD OK` au-dessus d'une suite en échec, `set -e` ignorant
  l'échec de tout maillon d'une liste AND-OR sauf le dernier (constaté en v1.11). Même leçon que
  le bloc de remplacements ci-dessus, appliquée cette fois à l'outillage
- Ne pas attribuer à Claude les idées de Gabriel, ni à Gabriel les recommandations issues
  de conversations passées
- Joindre l'archive du dépôt au premier message de toute session de modification
  (`docs/howto/git.md`). Claude lit `README.md` et cette section, puis ce que le lot touche ;
  il modifie, réassemble, teste et livre (ADR-0001, qui garde les règles remplacées)
- **L'archive livrée est l'arbre complet du dépôt, à sa structure, rien d'autre** : ni `build/`, ni
  fragments, ni patches à recoller (livré sous forme de sources plus patches le 11 septembre 2026,
  et à refaire entièrement). Gabriel l'extrait à la racine du dépôt. Une extraction ne supprime
  rien : tout fichier supprimé est annoncé avec sa commande `git rm`
- **Une suite, un banc ou un outil ajouté ou modifié met à jour sa ligne dans `tests/README.md` ou
  `tools/README.md`, dans le lot qui le touche** (ADR-0001). Ses nombres se relèvent sur le journal
  du banc ou la sortie de l'outil, ils ne se recopient pas : même leçon que les compteurs ci-dessous

- **Les compteurs annoncés se mesurent et se comparent, ils ne se recopient pas.** Le contrôle de
  reconstruction ci-dessous ne les regarde pas : il vérifie le contenu des blocs, pas les nombres
  écrits au-dessus. En v2.12, `app7.js` était annoncé à 1177 lignes et 74711 octets pour 1184 et
  75198 réels depuis la v2.11, et le carnet portait en même temps trois comptes de suites
  différents. Un compteur faux ne casse rien et ne se voit donc jamais, sauf à le comparer
  explicitement au fichier. Même leçon que les deux points précédents, appliquée cette fois à la
  documentation elle-même

- **Un instrument qui n'est pas relancé rouille en silence.** Les bancs de falsification ne sont pas
  dans `build.sh` et se lancent à la main ; trois d'entre eux ne mordaient plus, découvert à l'audit
  du 13 septembre 2026. `falsif43` s'arrêtait sur sa première mutation depuis la livraison de la
  v2.17, qui avait changé la ligne visée ; il l'a dit dès qu'on l'a lancé, sa garde faisant son
  travail. `falsif42` était pire : ses cinq mutations de migration passaient par `sed`, sans
  vérification que le motif morde, et la v2.16 avait réécrit le bloc visé. Cinq patchs sans effet
  lus comme cinq survies pendant deux versions, c'est-à-dire un banc qui affirmait le contraire de
  ce qu'il mesurait. `falsif36` traînait un patch mort depuis la v2.12. Deux règles : tout banc
  applique ses mutations par remplacement exact avec compte, jamais par `sed` nu, et **tout banc
  dont le code visé a changé se relance dans le lot qui l'a changé**, au même titre que les suites.
  Même famille que `build.sh` en v1.11 et que les compteurs en v2.12 : un outil qui annonce son
  propre résultat se vérifie
- **Contrôle obligatoire avant de livrer : archive en entrée plus modifications égale archive en
  sortie** (ADR-0001). L'archive d'entrée s'extrait dans un répertoire vierge et `./build.sh` y
  passe avant toute modification, son `dist/index.html` identique octet pour octet à celui de
  l'archive : sinon le point de départ est faux et se signale avant tout travail. Après
  modification, `./build.sh` repasse, et l'archive de sortie, comparée fichier à fichier à celle
  d'entrée, ne diffère que par la liste annoncée dans le relevé (ajoutés, modifiés, supprimés).
  `dist/index.html` n'est jamais édité, il est celui que `build.sh` vient d'écrire. Infra
  touchée : `cfn-lint` sur chaque template, `bash -n` sur chaque script ; le code de la Lambda,
  lui, est éprouvé par `testapi`. Workflow touché : `actionlint`, avec `shellcheck` (ADR-0002)

- Après livraison : Gabriel extrait l'archive à la racine du dépôt et commite en une phrase. Si
  la version change, il tague `vX.Y` et pousse `git push --atomic origin main vX.Y` : GitHub
  Actions construit, vérifie et déploie (ADR-0002, `docs/howto/deploiement.md`). Sinon,
  `git push` seul
- Pas de tirets cadratins dans le contenu généré
