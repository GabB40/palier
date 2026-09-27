# ADR-0001 : PALIER vit dans un dépôt Git privé

- **Date** : 2026-09-26
- **Statut** : accepté ; point 4, chemin de déploiement, et « Suite prévue » modifiés par ADR-0002 ;
  point 6 réalisé par ADR-0003
- **Remplace** : carnet, section 6, règles de session et de livraison citées en fin de document

## Contexte

Cinq .md dans un projet Claude, dont deux, `PALIER-code.md` et `PALIER-outillage.md`, portaient
1,4 Mo de code dans des blocs, et un contrôle de reconstruction qui les extrayait à chaque
livraison. L'historique ne vivait que dans le changelog, l'infra se téléversait depuis les blocs de
`PALIER-backend.md`.

## Décision

1. Dépôt GitHub privé `palier` : l'export réel de `test49` contient des données de santé.
2. Arborescence : `README.md`, `build.sh`, `src/`, `infra/`, `tests/`, `tests/falsif/`, `tools/`,
   `docs/` (carnet découpé, ADR, changelog, backend sans listings, how-to), `dist/index.html`.
3. `build.sh` recopie tout à plat dans `build/`, ignoré, avant les suites : suites et bancs
   inchangés d'un octet. Il n'écrit `dist/index.html` que si les cinquante suites passent.
   Les bancs se lancent depuis `build/`.
4. `dist/index.html` est commité ; déploiement par `git pull` puis
   `./infra/deploy.sh dist/index.html` depuis CloudShell `us-east-1`.
5. Carnet découpé par section sans réécriture ; toute nouvelle décision en ADR ; une ancienne
   décision migre ici quand un lot la touche.
6. `imgdata.js` gardé tel quel ; JPEG séparés dans un lot ultérieur, après preuve octet pour
   octet.
7. Restructuration mécanique : aucun nom ni découpage de code ne change.
8. `PALIER-code.md` et `PALIER-outillage.md` disparaissent. Le contrôle de reconstruction devient :
   archive en entrée plus modifications égale archive en sortie (carnet, `06-methode.md`).
   L'état d'avant, les cinq .md du projet et `index.html` v2.24, est le premier commit du dépôt ;
   le second le remplace par l'arbre. Rien n'est perdu :
   `git show $(git rev-list --max-parents=0 HEAD):PALIER-outillage.md`.
9. Projet Claude réduit à ses instructions : l'archive du dépôt se joint en début de session.
10. La prose de l'ancien `PALIER-outillage.md` se partage selon sa nature. La référence courante,
   objet de chaque suite, banc et outil et leur usage, va dans `tests/README.md` et
   `tools/README.md`, rédigés à neuf, nombres remesurés ; une suite, un banc ou un outil ajouté ou
   modifié y met sa ligne à jour dans le même lot. L'historique reste dans le premier commit ;
   désormais celui d'un lot va au changelog, sa justification en ADR. Les pièges de l'extraction
   depuis les .md disparaissent avec elle.

Mise en œuvre, constatée pendant le lot : `.gitattributes` en `eol=lf`, sans quoi `core.autocrlf`
sous Windows casse l'identité octet pour octet de `dist/index.html` ; bits d'exécution portés par
l'index (`git add --chmod=+x`) ; CloudShell lit le dépôt par une clé de déploiement en lecture
seule et ne pousse jamais.

## Conséquences

- Mesuré à la migration : `dist/index.html` identique octet pour octet à la v2.24 en ligne,
  4 209 744 octets ; cinquante suites vertes ; **quinze** bancs et non quatorze (treize hérités,
  `falsif49`, `falsifapi`), aucune survie, aucun motif qui ne morde pas.
- Certains bancs sortent à 0 malgré une mutation non détectée : leur journal se lit, pas seulement
  leur code de sortie (`README.md`).
- Les README de `tests/` et `tools/` rouilleront comme les compteurs de `PALIER-code.md` s'ils ne
  sont pas tenus dans le lot : la règle est au carnet, `06-methode.md`.

## Suite prévue

CI/CD : un tag `v*` déclenche build, tests et déploiement par GitHub Actions avec un rôle IAM en
OIDC aux droits minimaux ; `dist/` passe alors dans `.gitignore`. L'infra reste manuelle.

## Carnet : chemins mis à jour

- `README.md` : gratuit ; détail dans PALIER-backend.md).
- `README.md` : Documents du projet : ce carnet (décisions, contraintes, architecture, conventions), …
- `03-architecture.md` : Tout le détail, contraintes du forfait comprises, vit dans PALIER-backend.md.
- `03-architecture.md` : Les suites des lots récents ne sont pas détaillées ici, elles le sont dans … (désormais `tests/README.md`)
- `03-architecture.md` : palier-edge.yaml et cle.sh, extraits de PALIER-backend.md.
- `05-etat-courant.md` : **L'historique des versions ne vit plus ici** : il est dans PALIER-changelog.md.
- `05-etat-courant.md` : embarqué dans test49*, donc dans PALIER-outillage.md,
- `06-methode.md` : créer l'entrée correspondante dans PALIER-changelog.md,

## Carnet, section 6 : règles remplacées, texte d'origine

- Joindre `index.html` en pièce jointe au premier message de toute session de modification :
  les sources s'en extraient, le projet ne contient que les .md (la banque d'images ne tient pas
  dans le contexte). Claude reconstitue, modifie, réassemble, teste et livre le HTML opérationnel
- **Contenu exact de l'archive livrée, six fichiers à plat, rien d'autre :**
  1. `PALIER-carnet-de-bord.md` à jour
  2. `PALIER-changelog.md` à jour
  3. `PALIER-code.md` à jour, en-tête de version et compteurs lignes/octets de chaque section
     recalculés
  4. `PALIER-outillage.md` à jour
  5. `PALIER-backend.md` à jour, depuis le 25 septembre 2026 : template, `deploy.sh`, procédures
  6. `index.html` réassemblé et testé

  Pas de sources nues, pas de dossier `docs/`, pas de fragments ni de patches à recoller : Gabriel
  remplace les cinq .md du projet et déploie le HTML, c'est tout. Le template et les scripts
  d'infra se téléversent dans CloudShell depuis les blocs de `PALIER-backend.md`, qui en est la
  source. Livré autrement le 11 septembre
  2026, sous forme de sources plus patches, et à refaire entièrement.

- **Contrôle obligatoire avant de livrer**, parce que les .md sont la source de vérité et qu'un
  document faux est pire qu'un document manquant : extraire les sources des seules sections de
  `PALIER-code.md`, y ajouter `imgdata.js`, extraire les suites des seules sections de
  `PALIER-outillage.md`, extraire `palier-backend.yaml`, `palier-edge.yaml` et `cle.sh` de
  `PALIER-backend.md`, que `testapi` lit, lancer `build.sh` dans un répertoire vierge, et vérifier que l'`index.html`
  produit est identique octet pour octet à celui qui est livré. Si ce contrôle ne passe pas, les .md
  ne reconstruisent pas l'outil et l'archive n'est pas livrable. Pour `PALIER-backend.md` :
  extraire les templates et les scripts de leurs blocs, puis `cfn-lint` sur chaque template et
  `bash -n` sur chaque script ; le code de la Lambda, lui, est éprouvé par `testapi`.

- Après livraison : Gabriel déploie par `./deploy.sh index.html` depuis CloudShell `us-east-1`,
  et remplace les .md du projet par les versions mises à jour fournies par Claude
