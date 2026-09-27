# PALIER — journal des versions

Historique des changements entre deux versions. Ce fichier trace **ce qui a changé et quand**.
Il ne contient ni décision de conception ni justification de fond : celles-ci vivent dans
`docs/carnet/`, qui reste la source de vérité, et dans `docs/adr/`. Le code, les suites, les bancs
et l'infra vivent dans l'arbre du dépôt, décrit par `README.md`.

Convention : version la plus récente en tête. Chaque entrée est regroupée en **Retiré**,
**Corrigé**, **Ajouté**, dans cet ordre, avec une raison courte quand elle n'est pas évidente.
Une entrée est créée à chaque incrément de version, au moment de la livraison du HTML.

Les dates antérieures au 8 août 2026 n'ont pas été consignées à l'époque et sont approximatives.

---

## Banque d'images en JPEG séparés, 27 septembre 2026, sans changement de version

**Les 58 illustrations vivent en fichiers, `imgdata.js` est fabriqué au build.** `dist/index.html`
identique octet pour octet, aucun effet sur l'app. Décision, preuves et écartés dans
`docs/adr/0003-banque-jpeg-separes.md`.

### Retiré

- `src/imgdata.js`, désormais fabriqué dans `build/`.
- Les deux scripts d'insertion et de régénération de `tools/README.md`, et le piège du saut de
  ligne final qu'ils portaient.
- Deux restes ouverts, par décision de Gabriel : la faille des douze tenues avec une pause au
  milieu, ni traitée ni journalisée (ADR-0004), et l'écran qui s'éteint pendant une série longue,
  sans objet sur PC (ADR-0005).

### Ajouté

- `src/img/`, 58 JPEG et le manifeste `ordre.txt`, qui porte l'ordre des clés.
- `tools/imgdata.py`, lancé par `build.sh`, qui refuse toute incohérence entre manifeste et
  fichiers, et tout `imgdata.js` déjà présent dans `build/`.
- `tests/falsif/falsifimg.sh`, seizième banc, 16 mutations.
- Garde d'identité dans `.github/workflows/bancs.yml`, après le build.

---

## CI/CD, 27 septembre 2026, sans changement de version

**Une version se déploie par un tag `v*`.** GitHub Actions construit, passe les cinquante suites,
vérifie l'identité du build, la version et l'appartenance à `main`, puis lance `deploy.sh` avec un
rôle OIDC aux droits minimaux. Décision, gardes et écartés dans `docs/adr/0002-deploiement-par-tag.md`.
Mis en service par le tag `v2.25`, qui a redéposé les octets déjà servis, en 3 min 43 s.

### Retiré

- L'intention de passer `dist/` dans `.gitignore` (README, ADR-0001) : `dist/index.html` reste
  commité, la CI le reproduit avant tout dépôt.

### Corrigé

- Confiance du rôle `palier-ci-deploiement` : le premier tag, `v2.25`, a été refusé à l'étape des
  identifiants, gardes vertes et rien de déposé. Le dépôt, créé après le 15 juillet 2026, reçoit
  de GitHub un `sub` au format immuable, `repo:GabB40@49393475/palier@1389785465:…`, relevé dans
  CloudTrail.

### Ajouté

- `.github/workflows/deploiement.yml`, sur tag `v*` : build, gardes d'identité, de version et
  d'atteignabilité depuis `main`, dépôt par `infra/deploy.sh` inchangé.
- `.github/workflows/bancs.yml`, sur push vers `main` et à la demande : quinze bancs, journaux lus,
  échec visible sans conditionner le déploiement.
- `infra/palier-ci.yaml`, stack `palier-ci` en `us-east-1` : rôle `palier-ci-deploiement`, confiance
  sur les tags `v*` du dépôt, fournisseur OIDC existant hors stack.
- `docs/howto/deploiement.md` : déploiement par tag, dépôt manuel en secours, mise en place de
  `palier-ci`. `docs/howto/git.md`, `docs/backend.md`, `README.md`, `tests/README.md`, carnet
  sections 3 et 6 : chemins et procédure mis à jour.

---

## v2.25, 26 septembre 2026

Premier lot sous le dépôt Git.

### Corrigé

- « Une valeur est fausse ? Corriger » du récapitulatif et « Annuler » de l'écran de correction
  s'affichaient en boutons pleins : ils portaient `clr`, stylée seulement sous `.search`. Nouvelle
  classe `button.discret`, sans fond ni contour, texte gris ; `clr` ne sert plus qu'au ✕ de la
  recherche. `test20` vérifie les deux boutons et la règle non scopée.

### Ajouté

- `docs/howto/git.md` : ligne de tête sur PowerShell, blocs de commandes étiquetés `powershell`.

---

## Dépôt Git, 26 septembre 2026, sans changement de version

**PALIER passe d'un projet de cinq .md à un dépôt GitHub privé.** `dist/index.html` est identique
octet pour octet à la v2.24 en ligne. Décisions et règles remplacées dans
`docs/adr/0001-depot-git.md`.

### Retiré

- `PALIER-code.md`, `PALIER-outillage.md` et le contrôle de reconstruction depuis les .md : le
  code vit dans `src/`, les suites dans `tests/`, les bancs dans `tests/falsif/`, les outils dans
  `tools/`, l'infra dans `infra/`. Les cinq .md et `index.html` v2.24 restent dans le premier
  commit du dépôt.

### Ajouté

- `build.sh` à la racine : copie à plat dans `build/`, cinquante suites, puis `dist/index.html`,
  écrit seulement si toutes passent. Suites et bancs inchangés d'un octet.
- `docs/carnet/`, le carnet découpé par section sans réécriture, hors chemins et règles de
  livraison ; `docs/adr/` avec modèle et ADR-0001 ; `docs/howto/` pour Git, CloudShell,
  déploiement et clés ; `docs/backend.md` sans les listings, qui sont dans `infra/`.
- `tests/README.md` et `tools/README.md` : objet et usage de chaque suite, banc et outil, nombres
  de mutations relevés sur les journaux.
- `.gitattributes` (`eol=lf`) et bits d'exécution des scripts portés par l'index Git.

Cinquante suites vertes depuis la nouvelle structure ; les quinze bancs relancés depuis `build/`,
aucune survie, aucun motif qui ne morde pas.

---

## v2.24, 26 septembre 2026

**Synchronisation entre appareils, étape 3 du lot B : le client.** En déplacement, la progression
ne suivait que si l'on avait emporté une sauvegarde du jour. Détail et motifs dans la section 5 du
carnet, bloc « Synchronisation entre appareils ».

### Corrigé

- **Card Données** : « Aucun téléchargement enregistré sur cet appareil » devient « Aucun
  téléchargement enregistré », la date d'export voyageant désormais avec l'état.

### Ajouté

- **`app10.js`, card Réglages > Synchronisation** : saisie de la clé, ligne d'hébergement qui
  nomme l'accès administrateur, « Désactiver », « Supprimer mes données en ligne », état et
  dernière synchronisation en en-tête.
- **Envoi** regroupé 4 s après le dernier enregistrement, immédiat en fin de séance, en
  `keepalive` au passage en arrière-plan, différé hors ligne. Corps gzip préparé dès
  l'enregistrement, `If-Match` sur la base, refus vers une version en ligne supérieure.
- **Récupération automatique** à l'ouverture, au retour au premier plan et au focus de fenêtre,
  jamais pendant une séance, jugée sur l'ETag.
- **Reconnaissance de son propre envoi** par un identifiant porté dans le corps : une réponse
  perdue ne produit plus de faux conflit.
- **Lancement de séance** : il attend la synchronisation 5 s au plus. Un conflit, avec la dernière
  séance de chaque côté, ou une version plus récente en ligne, avec « Recharger », prennent la
  place du bouton.
- **« Tout réinitialiser »** le dit quand la synchronisation est active : l'effacement vaut pour
  tous les appareils.
- `test49`, cinquantième suite, contre le code de la Lambda, avec aller-retour sur l'export réel
  du 25 septembre. `falsif49`, 33 mutations, toutes tombent.

`app10.js` nouveau ; `app4.js`, `app5.js`, `app6.js`, `app7.js`, `app8.js` pour les points
d'accroche ; `app1.js` pour la version ; `build.sh` pour l'ordre et la suite. Cinquante suites
vertes. Les treize bancs `falsif23` à `falsif48` assemblaient sans `app10.js`, ce qui les aurait
fait tomber sur chaque mutation sans rien mesurer : ordre corrigé, tous relancés, aucune survie.
`falsifapi` relancé, 39 mutations, toutes tombent. Empreinte de neutralité identique. Rien à
déployer côté infra.

---

## Backend de synchronisation, 26 septembre 2026, sans changement de version

**Étapes 1 et 2 du lot B, v2.24.** Stack `palier-backend` et `cle.sh` déployés et vérifiés, quota
de concurrence du compte relevé de 10 à 1 000, clé `gabriel` créée. Comportement `/api/*` de
`palier-edge` déployé, `testedge.sh` vert sur ses quatorze vérifications. `index.html` ne change pas d'un octet. Contrat de l'API et trois arbitrages dans le carnet, section 5 ;
template, procédure et script dans `PALIER-backend.md`.

### Ajouté

- `palier-backend.yaml` : bucket `palier-etat-727646498837` versionné en `Retain`, Lambda
  `palier-etat` en Node.js 24 sur arm64 à concurrence 2, Function URL en `AWS_IAM` et ses deux
  permissions pour la distribution, journal à 30 jours.
- `cle.sh` : clés de 100 bits en Crockford, table empreinte vers identifiant dans SSM, hors stack.
- `palier-edge.yaml` : OAC Lambda, origine `api` et comportement `/api/*`, sous condition
  d'`ApiHote`.
- `testedge.sh` : quatorze vérifications de bout en bout à travers la distribution.
- `testapi.js`, quarante-neuvième suite, et `falsifapi.sh`, 39 mutations, toutes tombent.
- Carnet, section 5 : purge de toutes les versions à la suppression, table hors stack, script qui
  écrit la table.

## Hébergement, 25 septembre 2026, sans changement de version

**L'hébergement fait à la main devient une stack CloudFormation**, première étape de la
synchronisation entre appareils. `index.html` ne change pas d'un octet. Détail et motifs dans
`PALIER-backend.md`, nouveau document du projet.

### Retiré

- Distribution `E77C6V1YT2W2O`, son OAC, son ACL et le bucket `palier.s1t3.link`.

### Corrigé

- **`Cache-Control: no-cache` réellement posé sur `index.html`**, par `deploy.sh`. Le carnet
  l'annonçait, l'objet n'en portait aucun.
- **Carnet, section 3** : forfait CloudFront gratuit avec WAF, et non « WAF désactivé » ; classe
  de prix `PriceClass_All`. **Section 5** : le motif des exports quotidiens, mal attribué.

### Ajouté

- Stack `palier-edge` en `us-east-1` : bucket `palier-site-727646498837` versionné, OAC, ACL
  `palier-waf` à quatre règles, distribution en HTTP/2 et 3, enregistrements A et AAAA, AAAA
  absent jusqu'ici.
- `deploy.sh` : dépôt, invalidation, vérification de la version servie.
- `PALIER-backend.md`, et une livraison à six fichiers.
- Conception de la synchronisation, lot B, consignée en section 5 du carnet.

## v2.23, 25 septembre 2026

**Le message de recul de cible se lisait comme une régression après une remontée.** Constaté par
Gabriel sur ses pompes du 25 septembre. Détail et motifs dans la section 2 du carnet, « Le message
de recul dit ses deux lectures ».

### Corrigé

- **Recul de cible, récapitulatif de fin de séance** : le message autonome porte les deux lectures
  qui l'ont produit, l'ancienne puis celle du jour, « Pompes : cible recalée de 9 à 8, deux passages
  en dessous (6 puis 7) ». La règle de la fenêtre ne change pas.

`app4.js`, `app1.js` pour la version. Quarante-huit suites vertes, `test41` retouchée avec le cas
réel des pompes. `falsif41` converti en remplacement exact avec compte, 22 mutations, toutes
tombent. Empreinte de neutralité identique.

---

## v2.22, 22 septembre 2026

**Trois retours de Gabriel après la séance du 22 septembre.** Détail et motifs dans la section 2 du
carnet, « Cadence : l'aigu sur la montée-cible, le pont au son, un décompte au lancement ».

### Corrigé

- **Cadence, ton de cible** : il remplace désormais le 950 de la montée de la répétition-cible, et
  non celui de la montée qui la suit. Le cycle sans pause faisait coïncider fin de descente et début
  de la montée suivante, l'aigu tombait sur l'élévation d'après. Le crédit au Stop reste en fin de
  descente.
- **Cadence, grand chiffre** : il porte la répétition en cours pendant le mouvement, la ligne des
  comptes les répétitions terminées.
- **Migration v2.19 bornée** à `CAD_DEPUIS_SECONDES`, les abductions seules. Sans cela, un pont à
  fourchette héritée aurait vu sa performance effacée au lieu d'écrêtée, dès son passage en cadence.

### Ajouté

- **Pont fessier, pont lesté, pont sur une jambe, hip thrust sur une jambe et sa version lestée en
  répétitions cadencées** : `PONT_CAD`, montée 1,5 s, tenue en haut 1 s, descente 2 s, sans
  établissement, avec reprise. Tag « Tiens » pendant la tenue. Valeurs non éprouvées sur maquette.
- **Moteur de cadence** : un bloc ou deux côtés selon `e.side`, phase de tenue, reprise
  (`resumeCad`) sur les exercices qui la déclarent, consignes de position et de changement de côté
  par geste. Le modèle de temps arrondit chaque côté à la seconde.
- **Décompte de lancement** : 5 s fixes (`START_PREP`) devant l'échauffement, bip à 700 Hz chaque
  seconde, 1150 Hz au départ. Compté au modèle et au poste échauffement de l'annonce, +5 s.

`app3.js`, `app4.js`, `app5.js`, `app6.js`, `app1.js` pour la version. Quarante-huit suites vertes,
`test48` nouvelle ; `test`, `test15`, `test16`, `test21`, `test30` et `test46` retouchées.
`falsif48`, 25 mutations, toutes tombent ; `falsif46` réparé sur le code réécrit, 60 mutations,
toutes tombent ; `falsif44` et `falsif47` relancés, sans survie. Empreinte de neutralité : seules les
durées annoncées bougent.

---

## v2.21, 20 septembre 2026

**Le message de montée de bande nommait un placement faux.** Constaté par Gabriel sur sa montée de
face pulls du 20 septembre. Détail et motifs dans la section 2 du carnet, « Un message de
progression nomme le palier, pas le montage ».

### Corrigé

- **Montée de bande, récapitulatif de fin de séance** : le message ne porte plus « dans le dos ».
  La chaîne était concaténée à tous les exercices à bande de résistance, et n'est vraie que des
  pompes aux poignées ; les face pulls, ancrés à hauteur de visage, annonçaient une bande dans le
  dos. Le placement reste sur la puce de matériel d'`app9.js`, conditionné à l'exercice, où il se
  lit avant la séance et non après. Le sens descendant, qui n'en portait pas, est inchangé : les
  deux sens sont désormais symétriques.
- **Branche morte retirée avec** : le cas « bande devenue aucune » du même message, que `bandLabel`
  traite déjà, et qu'une montée ne peut pas atteindre.

Une ligne d'`app4.js`, aucun autre module touché, aucune migration. Quarante-sept suites vertes.
Messages vérifiés en exécution sur face pulls, pompes aux deux barreaux, pallof press, tractions
assistées et une descente.

---

## v2.20, 18 septembre 2026

**Repère sonore pendant les tenues chronométrées.** Un clic discret toutes les 5 s pendant la
planche, la planche sur ballon, la planche sur genoux et le gainage latéral, pour savoir où l'on en
est sans voir l'écran. Demande de Gabriel, sur la planche du 18 septembre. Réglages retenus sur
maquette HTML publiée, aux valeurs proposées. Détail et motifs dans la section 2 du carnet,
« Repère sonore des tenues chronométrées ».

### Ajouté

- **Le repère** : 1800 Hz, 40 ms, gain 0,12 contre 0,45 pour les autres sons, un coup simple à
  chaque multiple de 5 s écoulées. Il se tait sous l'approche et la cible, qui gardent leurs sons,
  et continue après la cible jusqu'au Stop. Repart à zéro sur le second côté.
- **Card Sons** : bascule « Repère activé » ou « Repère coupé », actif par défaut, et « · repère
  5 s » dans l'en-tête fermé. Derrière l'interrupteur global des sons.
- **`tone()`** prend un gain optionnel, 0,45 par défaut : appels existants inchangés.
- **`test47`** et **`falsif47.sh`**, treize mutations, toutes tombent.

Aucune migration : la clé absente vaut vrai, comme `state.sound`. Empreinte de neutralité identique
à la v2.19 sur ses 206 lignes. `test9` retouchée pour l'en-tête de la card Sons.

---

## v2.19, 17 septembre 2026

**Le gainage latéral jambe levée devient le gainage latéral avec abductions**, en répétitions
cadencées au son : planche tenue sur un côté, jambe du dessus montée en 1,5 s et redescendue en
1,5 s, un côté entier puis l'autre, 8-15 par côté. C'est la forme étudiée par Boren et al. 2011 ;
la jambe tenue ne l'est nulle part. Conception discutée le 15 septembre, validée sur maquette HTML
publiée, réglages retenus par Gabriel le 17 septembre. Détail et motifs dans la section 2 du carnet,
« Gainage latéral avec abductions : répétitions cadencées ».

### Retiré

- **La jambe tenue** : `mode:'time'` et 15-45 s sur `gainage-lateral-jambe-levee`.
- **Le lest de cheville comme marche écrite**, et avec lui la dette « aucune échelle de charge sur
  `mode:'time'` ». Le lest charge la hanche, presque pas le tronc ; la suite reste à décider.

### Corrigé

- **Fiche** : « avec un appui en moins » était faux, jambes serrées la position n'a que deux appuis
  au sol. Même correction, datée, sur le paragraphe v1.17 du carnet.
- **Carnet, section 5** : quarante-trois suites annoncées, quarante-cinq réelles en v2.18.
- **Repli douleur et retour : la mesure de l'étape est effacée, dans tous les modes.** Une tenue de
  17 s faite sur la planche sur ballon arrivait mesurée et validable sur la planche au sol, et
  serait partie au journal sous elle : `st.val` était remis à zéro, `st.sides` et `st.done` non.
  Deux paires concernées, ballon vers sol et sol vers genoux, dans les deux sens. Une série déjà
  validée reste acquise.
- **`falsif43.sh`** et **`falsif44.sh`** : deux motifs élargis ou suivis, le lot ayant dupliqué une
  ligne de rognage et étendu la ligne du rejeu. Leur garde les avait arrêtés.

### Ajouté

- **`cadence:{monte:1.5,descente:1.5,etab:3}`** sur `gainage-lateral-jambe-levee`, mode `bw`,
  8-15, 2 séries, par côté. Verrou, retrait, repli, vivier, illustration et paire de raccord
  inchangés.
- **Moteur de répétitions cadencées** dans `app6.js` : décompte, double coup à 1150 Hz au zéro,
  3 s d'établissement de la ligne, 950 Hz par montée, 700 Hz par descente, répétition comptée jambe
  revenue, ton de cible à la place de la montée suivante, cadence jusqu'au Stop. Stop définitif par
  côté, « Second côté », « − 1 rép » par côté avec plancher à zéro, « Réinitialiser ce côté »,
  validation sur les deux côtés, côté le plus court au journal. ESPACE et « - » au clavier.
  `rhythmAbort` et le retour d'un pas désarment la cadence.
- **Modèle de temps** : `INSTALL + 2 × (prep + étab + cible × cycle)` ; rejeu à l'installation.
- **Fiche** : nom « Gainage latéral, abductions », geste au son, course d'environ 35°, souffle en
  montant, critère de fin propre, texte de plafond « pas de marche outillée au-delà ; la suite reste
  à décider ». Le plafond du gainage latéral nomme les abductions.
- **Migration** : performance d'un exercice cadencé hors de sa fourchette de base remise à zéro,
  déblocage conservé ; passages joués en secondes marqués `it.u = 's'` ; instantané de correction
  qui porterait une performance en secondes retiré.
- **`unitAt`** : unité d'un passage à la fiche et au détail de séance ; `palierVal` ignore un
  passage joué sous un autre régime.
- **`test46.js`**, dix sections : catalogue, modèle de temps, premier côté et second côté à horloge
  pilotée, Stop précoce et sans son, abandon, repli et retour, progression et journal, migration,
  passages hérités, fiche, repli douleur entre deux tenues. **`falsif46.sh`**, 60 mutations, toutes
  tombent, dont six rejouées la section catalogue neutralisée ; trois mutations écartées et
  documentées, dont une a fait retirer une garde inutile de `cadReady`.
- **Suites retouchées** : `test10` (quatre tenues), `test22` (tenues, textes de plafond, nom en
  bibliothèque), `test39` (seize critères de fin).
- **`build.sh`** enchaîne quarante-six suites.

### Consigné au carnet, sans changement de code

- Littérature : Boren et al. 2011, réplication à 35°, Oranchuk 2019 ; aucune comparaison directe
  jambe tenue et jambe mobile trouvée.
- Lest contesté par Gabriel, marche suivante renvoyée à une discussion dédiée.
- Tous les bancs relancés, `falsif23` et `falsif36` à `falsif46` : aucune survie, aucun motif
  manquant après retouche.
- Empreinte de neutralité identique à la v2.18, 206 lignes.

---

## v2.18, 15 septembre 2026

Deux volets. **Première paire constatée au raccord de tour** : gainage latéral puis développé au
sol, le 15 septembre, épaules en feu, haltères difficiles à stabiliser. **Escalier du squat** : le
goblet squat ouvre à 16 kg le squat sur une jambe vers la chaise, dont la hauteur d'assise est un
palier, puis sa version lestée. Détail et motifs dans la section 2 du carnet, « Première paire
constatée » et « Escalier du squat, et la porte qui lit le palier joué ».

### Corrigé

- **Message de l'écran de pause.** Il datait de la pause inconditionnelle de la v2.10 et affirmait
  deux choses retirées du carnet en v2.11, le raccord « seule adjacence » sans repos et une minute
  « ce qu'il faut ». Il dit désormais que la pause porte sur un enchaînement signalé. Jamais affiché
  jusqu'ici, la liste étant vide.
- **Réglages vouvoyait** sur la ligne qui annonce la pause, seule occurrence de l'application, elle
  aussi jamais affichée jusqu'ici : tutoiement.
- **Carnet** : en-tête resté à v2.16 sous une section 5 en v2.17, et section 3 annonçant
  quarante-trois suites au lieu de quarante-quatre.
- **Verrou « au dernier cran de charge »** (v2.5) : il lisait la charge après la progression de fin
  de séance. Deux séries de 25 à l'avant-dernier cran des mollets lestés montaient la charge au
  dernier et ouvraient les mollets sur une jambe. Même défaut sur le pont fessier sur une jambe. Les
  portes lisent désormais le palier écrit avec les séries.
- **Fiche, « Dernière fois »** : accolait aux séries le niveau du jour, déjà monté. Elle dit le
  niveau joué, lu sur le dernier passage propre de l'historique : charge, bande, tenue ou assise.
- **`SCHEMA.core`** décalé par rapport à son vivier : libellés de perte faux, sans effet visible.
- **`falsif37.sh`** applique ses quatorze mutations par remplacement exact avec compte, et non plus
  par `sed` nu. Toutes tombent.

### Ajouté

- **`PAUSE_RACCORD_PAIRS`** : `gainage-lateral>developpe-sol`, et son successeur par retrait
  `gainage-lateral-jambe-levee>developpe-sol`, débloqué pendant la séance du constat. Pause de 60 s
  au raccord sur ces seules séances, 1 sur 15 au tirage réel, +110 s à trois séries au réglage de
  5 s de transition.
- **Ligne « Épaules »** sur les fiches du gainage latéral et du gainage latéral jambe levée.
- **`squat-une-jambe-chaise`**, au poids du corps, 8-15 par côté, 2 séries, assise à 50 puis 40 cm.
  Verrou : 2 séries de 15 au goblet squat avec la kettlebell la plus lourde, sans lestes. Retire le
  goblet squat. Repli douleur : box squat.
- **`squat-une-jambe-chaise-leste`**, à 40 cm, kettlebell tenue devant, échelle en kettlebells
  seules. Verrou : 2 séries de 15 par côté à 40 cm. Retire la version au poids du corps, s'y replie
  sans kettlebell. Repli douleur : box squat.
- **Palier d'assise** : la mécanique des tenues généralisée (`rungSpec`, `rungLbl`, `assiseOf`),
  `p.assise` et `it.assise`, montée, grâce, descente, « tenir ce palier », chemin des paliers,
  écran de série et fiche.
- **Palier joué** : `p.setsLoad` et `p.setsRung`, écrits avec les séries. `gatePalier` porte les
  trois portes `loadTop`, `kbTop` (nouvelle) et `rungTop` (nouvelle), et le bloc Verrou les dit.
- **`kbSeules`** : échelle d'un exercice à charge fixe limitée aux kettlebells déclarées.
- **Marches écrites** : le goblet squat passe le relais au squat sur une jambe et sort de
  `KB_NEXT`, où entre la version lestée ; fentes lestées vers le squat bulgare avec haltères, en
  repartant vers 5 kg par main.
- **Deux illustrations**, banque à 58 images, catalogue à 55 fiches.
- **`test45.js`**, dix-sept sections : les huit de la paire constatée, puis catalogue et tables par
  position, empreinte du tirage réel sur soixante séances, portes `kbTop`, dernier cran et
  `rungTop`, palier d'assise, fin de séance, fiche au niveau joué, marches écrites.
  **`falsif45.sh`**, 58 mutations, toutes tombent ; le banc neutralise des sections de la suite sur
  une copie pour prouver que les sections aval mordent seules.
- **Suites retouchées** : `test37` (liste de paires non vide), `test5`, `test18` et `test43`
  (l'assise est une échelle), `test9`, `test22`, `test24`, `test39` (dénombrements), `test28`
  (composition de marche vérifiée sur un membre restant de `KB_NEXT`, vivier à 17), `test31` et
  `test40` (palier joué posé avec les séries, vivier à 17, `SUBS.legs` décalé).
  **`falsif44.sh`** suit les trois motifs que le lot a déplacés.
- **`build.sh`** enchaîne quarante-cinq suites.

### Consigné au carnet, sans changement de code

- Fréquence de la paire groupée dans le temps, et non uniforme.
- Journal non discriminant : la même forme 15, 12, 12 existe le 21 août derrière un pallof press.
- Table de marqueurs sans tractions en pronation, états départ et mature dépassés.
- Kettlebell de 16 kg depuis le 14 septembre : section 1 corrigée, et la question du montage du
  goblet squat ne porte plus que sur deux barreaux, 12 et 14 kg, gardés par Gabriel.
- Fauteuil de bureau réglable, 40 à 50 cm, calé pour le squat sur une jambe.
- Propositions écartées : crans d'assise de 2,5 cm, escalier en trois fiches, séances hybrides,
  pistol complet, bulgare derrière le goblet squat, fente en déficit, verrou à 22 kg.
- `falsif38`, `39`, `41` et `42` encore en `sed` nu, tous relancés, aucune survie.

---

## v2.17 — 13 septembre 2026

**Le bird-dog et le dead bug deviennent des tenues rythmées.** La tenue de chaque répétition est le
palier de l'exercice, sur une échelle à trois barreaux par côté, 3 s sur 6-12, 6 s sur 4-8, 10 s
sur 3-6, et l'outil rythme la série au son : un coup à l'ouverture de chaque tenue, un coup grave
à sa fermeture, le ton de cible sur la fermeture qui amène un côté à sa cible, bascule de 2 s entre
deux tenues, et le métronome continue jusqu'au Stop. Le compte devient observé et le temps
chronométré. Conception arrêtée en v2.16, validée sur maquette HTML autonome avant écriture.
Migration neutre : le premier barreau est la consigne d'avant, `p.tenue` absent vaut 3, et sur la
sauvegarde du 12 septembre ni fourchette, ni cible, ni mémoire ne bougent.

**Le Stop n'est pas définitif sur une tenue rythmée.** Sur une tenue chronométrée la continuité est
la mesure (v1.13) ; ici la mesure est chaque tenue, intacte quelle que soit la pause avant elle, et
la série n'est que leur somme. Reprendre rejoue le décompte et repart sur le côté interrompu.

### Retiré

- **Le tempo modélisé du bird-dog** dans `TEMPO_EX` : l'exercice est chronométré, `prep + 2 ×
  reps × (tenue + bascule)`, et au premier barreau 3 + 2 = 5 s vaut exactement l'ancien tempo. Le
  dead bug n'en avait pas.
- **La saisie numérique** sur les deux exercices : le Stop est la seule entrée pendant le rythme,
  la tenue en cours au moment du Stop ne compte pas, les côtés alternent, écart d'au plus un, le
  côté le plus court part au journal (v1.13).

### Corrigé

- **Marches écrites des deux exercices** : celle du dernier barreau, 10 s, que McGill n'allonge pas.
  Bird-dog, tracer des carrés d'au plus trente centimètres avec la main et le pied tendus ; dead
  bug, une résistance tenue à deux mains, jambes seules en mouvement. « Allonge chaque tenue à
  6 s » (v2.16) est devenu l'échelle elle-même.
- **`estMontee` sur une échelle de tenues** lit la tenue et jamais la fourchette : une descente de
  barreau élève la fourchette (4-8 vers 6-12) et aurait été célébrée comme une montée.
- **Instantanés d'avant progression** (fin de séance et correction) : ils portent `tenue`. Sans
  cela `it.tenue` valait toujours 3 au journal et « Tenir ce palier » ne restaurait pas le barreau.
  Trouvé par `test44` avant livraison. `avantCor`, le troisième instantané, celui qui dit ce que la
  correction défait, le porte aussi : `estMontee` y comparait deux fois le premier barreau et une
  montée de barreau annulée ne se disait jamais, là où le commentaire d'à côté pose qu'une
  annulation muette est pire qu'une annulation.

### Ajouté

- **`rhythm:{bascule,ladder}`** sur les deux entrées de `CFG`, le mode reste `bw` : un exercice en
  répétitions dont chaque répétition est une tenue, la progression se lit en répétitions et
  l'échelle joue le rôle de la bande. `rungOf`, `tenueOf`, `baseReps` ; `unitOf` rend « tenues ».
- **Cinquième branche de montée et de descente dans `applyProgress`** : barreau suivant, fourchette
  du barreau, cible au bas, grâce, `loadUps` ; plafond au dernier barreau avec la marche écrite ;
  descente au barreau précédent, signal seul au premier, cible recalée au bas par `nextTarget`
  comme après une descente de charge. Seule écriture de `p.range` depuis la v2.16, et un vrai
  changement de palier.
- **Migration d'écrêtage consciente du barreau** : la base d'une tenue rythmée est la fourchette
  de son barreau, un 4-8 joué à 6 s n'est pas ramené sur 6-12 ; un 7-13 sans tenue reste un reste
  de relèvement et revient au premier barreau.
- **Émetteur simple-coup `tone(freq, at, dur)`** à côté de `beep()`, qui joue chaque ton deux fois à
  260 ms d'écart : sur une tenue de 3 s le second coup tombait au dixième de la tenue. Un coup par
  événement, programmé à un instant précis de l'horloge audio, sans vibration ; `toneCancel` au
  Stop. Tons 950 ouverture, 700 fermeture, 1200 cible, dans la palette existante. Le décompte de
  préparation, lui, garde le coup double à 260 ms de `beep()` : il est avant le rythme, espacé
  d'une seconde, rien ne s'y brouille, et c'est le son de la mise en place partout ailleurs.
- **`rhythmAbort`**, appelé par `skipSet`, `endSession`, la sortie de séance sans rien de
  journalisé et le repli douleur : une étape quittée sans passer par le Stop désarme le rythme et
  annule les coups déjà programmés, qui sonnaient sinon après le départ. Le repli douleur supprime
  en outre le `rt` de l'étape qui change d'identité, comme le retour d'un pas le fait déjà : le
  rythme appartient au couple étape plus exercice. Aucun des deux exercices rythmés n'a de repli
  aujourd'hui, la garde tient donc par construction et non par l'absence d'un champ `fb`.
- **Moteur `rhythmStart / rhythmLoop / rhythmPaint / rhythmStop`** : l'état (compteurs, phase,
  côté) se dérive du temps écoulé sur l'horloge murale, rien n'est accumulé par tick ; les coups sont
  programmés 350 ms en avance sur l'horloge audio, décalage relevé au départ. Le décompte de
  préparation enchaîne directement sur la première ouverture. Sans son, le rythme se lit à l'écran.
- **Écran de série** : en-tête Cible, Fourchette, **Tenue** ; côté en grand, chrono de la tenue,
  bascule en couleur de pause, « Droite n · Gauche m · cible c par côté », Stop. Le côté qui est en
  jeu ou qui vient immédiatement est nommé et mis en valeur : le tag l'annonce avant le départ
  (« Prêt · Droite ») et pendant le décompte (« En position · Gauche » sur une reprise, où il donne
  le côté interrompu), et la ligne des comptes le porte en accent, celui de la tenue en cours ou
  celui qu'annonce la bascule. Une série arrêtée n'en met aucun en valeur, rien ne vient tant qu'on
  n'a pas repris. Après le Stop :
  Reprendre, « − 1 tenue », Réinitialiser, Valider, et la ligne « Au journal : n tenues de t s par
  côté, le côté le plus court fait foi ». ESPACE démarre et arrête, inerte une fois arrêtée ;
  touche `-` rogne ; `+` inerte ; Valider inerte pendant le rythme et à zéro.
- **Rognage « − 1 tenue »**, analogue du « − 1 s » (v2.16) : entre la fermeture réelle et la main
  qui atteint le téléphone au sol il se passe des secondes, qui à 3 s de tenue valent une tenue de
  trop. Il retire la **dernière tenue comptée, du côté où elle a été comptée**, et la valeur au
  journal se recalcule sur les compteurs ; la reprise repart sur le côté rendu. Il ne se soustrait
  pas à la valeur : quand les côtés diffèrent d'une tenue, la latence du Stop est déjà absorbée par
  le côté le plus court, et retrancher au journal enlevait une tenue qui avait été tenue. Plancher
  sur les compteurs, qui ne passent pas sous zéro ; inerte pendant le rythme.
- **Journal** : `it.tenue` écrit avant progression comme `it.load`, étiquette « 6 s » sur les lignes
  de journal et de détail, « Dernière fois à 6 s » quand le barreau du jour diffère, palier d'un
  passage égal à sa tenue, passage antérieur au champ lu au premier barreau.
- **Fiche « Où j'en suis »** : trois marches « 3 s · 6-12 », « 6 s · 4-8 », « 10 s · 3-6 », position,
  marche suivante, condition de montée en tenues ; vierge sans performance, comme une bande.
- **Fiches** : exécution au son sur les deux ; dead bug, consignes de souffle par barreau et du
  levier si les fléchisseurs de hanche brûlent avant le ventre.
- **`test44.js`**, huit sections dont un écran à horloge pilotée, et **`falsif44.sh`**, 50 mutations
  qui tombent toutes.

### Suites retouchées

- `test`, `test15`, `test30`, `test32`, `test36`, `test38`, `test39`, `test43` : là où une boucle de
  séance remplissait une tenue chronométrée, elle remplit une tenue rythmée arrêtée, et sa valeur.
- `test5`, `test18`, `test43` : les ensembles « au poids du corps ou tenus sans échelle » excluent
  les deux tenues rythmées, 21 devient 19 ; le témoin de fiche de `test43` passe du bird-dog aux
  fentes arrière ; `test43` lit la marche écrite du bird-dog à 10 s.
- `test16` : le bird-dog n'a plus de tempo propre.
- `falsif43` : trois motifs repointés. La v2.17 avait ajouté `rhythm` sur la ligne du bird-dog et
  renommé la base de l'écrêtage, le banc s'arrêtait donc sur sa première mutation sans jamais être
  relancé. Sa propre garde l'a dit dès qu'on l'a lancé.
- `falsif42` : les cinq mutations de migration étaient appliquées par `sed` sans vérifier que le
  motif morde, et la v2.16 avait réécrit le bloc visé. Cinq patchs sans effet lus comme cinq
  survies, sur deux versions. Le banc passe au `mut` vérifié, quatre mutations sont repointées et
  la cinquième retirée, sa garde ayant disparu avec le relèvement de fourchette.
- `falsif36` : patch d'ancre repointé, mort depuis l'ajout de `secs:{}` en v2.12.
- `PALIER-code.md` : compteurs de lignes et d'octets recalculés et comparés aux fichiers. Sept
  sections sur onze étaient fausses, `app6.js` de 169 lignes. Récidive du cas v2.12 consigné au
  carnet.

### Corrigé, hors tenues rythmées

- **Le vide sous le détail de séance.** La bande du carrousel (v1.18) est un conteneur flex : elle
  prenait la hauteur de son plus grand panneau, et les panneaux à venir sont systématiquement plus
  hauts que celui du jour, intitulé et encart de niveau en plus. Une soixantaine de pixels de vide
  s'ouvraient sous la dernière ligne de la séance du jour, jusqu'à la card Progression, et le vide
  grandissait avec le plus grand des tirages à venir. La hauteur suit désormais le panneau affiché,
  mesurée et non calculée, glissée en 0,18 s avec le panneau ; `overflow-y:hidden` garantit qu'une
  hauteur fausse ne capture jamais le défilement vertical de la page, et une mesure nulle, card
  repliée, efface la consigne au lieu d'écraser la bande à zéro. `carFit`, appelé au rendu de
  l'accueil, au changement de panneau, après un balayage, à l'ouverture de la card et au
  redimensionnement de la fenêtre. Signalé par Gabriel, défaut présent depuis la v1.18.
  La mesure repose sur `align-items:flex-start` sur la bande : l'alignement par défaut étire chaque
  panneau à la hauteur de la ligne, et un panneau interrogé rend alors la hauteur du plus grand,
  celle-là même qu'on corrige. La première écriture n'avait pas cette propriété et se réécrivait sa
  propre hauteur, sans rien changer à l'écran ; corrigé sur un second signalement de Gabriel.
- **`test23`** gagne une section sur la hauteur et lit la feuille de style, et **`falsif23.sh`**
  arrive, dix mutations qui tombent toutes.

### Consigné au carnet, sans changement de code

- La littérature ne prescrit aucune durée de transition ; la bascule reste à 2 s sur l'argument
  corporel du carnet. Elle dit en revanche que la progression se fait en répétitions et non en
  durée : l'échelle est une rampe d'entrée vers le format de McGill, à 10 s.
- Écran qui s'éteint sur une série de deux minutes : `wakeLock`, à examiner.
- **La vibration est derrière la porte des sons** dans `beep()`, partout dans l'application : elle ne
  peut donc pas servir de mode dégradé, elle ne fait que doubler un son déjà audible. À trancher
  dans un lot propre, en la sortant de la porte ou en la retirant.
- Successeurs de plafond, carrés et résistance, restent des marches écrites.

---

## v2.16 — 13 septembre 2026

**Le plafond d'un exercice au poids du corps ou tenu vaut le haut de sa fourchette.** Ouvert par
un constat de Gabriel sur la fiche du bird-dog, « Marche 1 sur 3 » avec 6-12, 7-13 puis 8-14 :
le moteur « relevait » la fourchette d'un pas à chaque passage au plafond tant qu'un champ `cap`
le permettait, du +1 linéaire habillé en fourchette, que le carnet avait déjà nommé relèvements
fantômes en v2.5 et v2.13 sans le généraliser. Onze entrées étaient encore dans ce cas, 39
marches que personne n'avait choisies. Le champ, le mécanisme et son miroir de descente
disparaissent. Empreinte de neutralité identique à la v2.15 : rien ne se tire, ne se prescrit ni
ne s'annonce autrement, et sur la sauvegarde du 12 septembre aucune fourchette n'était relevée,
la migration y est un no-op.

**Une tenue chronométrée se rogne après le Stop.** Entre la fin réelle de la tenue et l'appui sur
ESPACE il se passe couramment plusieurs secondes, jusqu'à huit constatées sur un gainage latéral.
La mesure est une borne haute : un bouton « − 1 s » par côté mesuré, et la touche moins, retirent
ce qui n'a pas été tenu. Jamais dans l'autre sens.

### Retiré

- **Le champ `cap`** sur les 21 entrées au poids du corps ou tenues : 19 dans `CFG`, les deux
  tractions strictes. Il ne portait plus qu'une copie du haut de fourchette, ou un nombre
  au-dessus. Le plafond est `reps[1]`, et la marche est celle écrite dans `NEXT`, successeur
  derrière verrou ou consigne manuelle. Une assertion de forme interdit le retour du champ.
- **Le relèvement de fourchette** dans `applyProgress` et **sa descente miroir** (« cliquet
  levé », v1.15) : la fourchette d'un exercice sans échelle ne bouge plus dans aucun sens, seul le
  signal passe. Un relèvement comptait en outre comme une montée dans `state.div` ; seul le
  tirage en suspension était concerné côté tiré.
- **L'échelle de fourchettes décalées d'`echelleOf`** et son cas `open` : une fourchette n'a
  qu'une marche. La fiche n'affiche plus « Marche 1 sur N » sur ces exercices ; le libellé de
  plafond, « Plafond de la fourchette atteint », affiché même à la première séance, devient une
  règle avec sa condition : « Au haut de la fourchette, toutes les séries à 12 reps sur une séance
  complète : » suivi de la marche écrite.
- **La liste en dur de l'écrêtage de migration**, `['planche','planche-genoux','mollets-debout',
  'pont-fessier']` : l'écrêtage se dérive sur tout exercice au poids du corps ou tenu hors bande,
  fourchette entière ramenée à la base, cible bornée. La mémoire de fenêtre n'est pas touchée :
  un relèvement n'a jamais changé le niveau physique de l'exercice.
- **La garde de semis « au haut de fourchette moins un pas »** (v2.15) sur le poids du corps et
  les tenues : elle supposait qu'un tel passage avait pu relever la fourchette. Un passage au
  plafond sème désormais comme les autres.

### Corrigé

- **Verrou des fentes lestées à 15 par côté, plus 18.** Le 18 écrit en v2.1 comme « le plafond
  des fentes, qui vaut déjà 18 » n'avait été choisi par personne : c'était le cap fantôme, hérité
  et lu comme un fait. Même défaut que « plafond du matériel actuel » corrigé en v2.1.
- **Au plafond, la cible vaut le haut.** Quand toutes les séries atteignaient le haut sans
  qu'aucun palier ne bouge, sommet d'échelle ou fourchette sans échelle, la cible n'était pas
  recalculée : une cible à 12 restait à 12 après un 15/15/15 et ne se rattrapait qu'au passage
  suivant par la mémoire de fenêtre. Trouvé par T8 réécrit, corrigé en un test général.
- **Marche écrite du bird-dog** : « marque une pause de 3 s » était déjà la consigne de sa fiche
  (« tiens 2-3 s »), ce n'était pas une marche. Elle dit « allonge chaque tenue à 6 s ». Dead bug
  inchangé, sa fiche ne prescrit pas de pause.

### Ajouté

- **Rognage après le Stop sur les tenues chronométrées** : bouton « − 1 s » à côté de
  « Réinitialiser » sur une tenue d'un bloc, un bouton par côté mesuré dans le récapitulatif des
  côtés sur une tenue par côté ; touche `-` (et `6` hors pavé numérique) sur le côté courant ;
  `+` inerte ; pas de 1 s, plancher à 1 ; inerte pendant qu'un chrono tourne ; la valeur rognée
  est celle qui part au journal, côté le plus court compris. `trimHold`, `trimBtn`.
- **`test43.js`**, six sections, et **`falsif43.sh`**, quinze mutations qui tombent toutes.

### Suites retouchées

- `test5` §6 : la boucle des plafonnés lisait `cap` ; devenue vide, elle était verte à vide. Elle
  se dérive et couvre 21 exercices, chacun avec sa marche écrite.
- `test18` : T7, T8, T11, T12, T16, T22 assertaient le mécanisme retiré, ils assertent
  l'invariant qui le remplace ; T23 change d'objet, cible héritée hors fourchette sous palier
  tenu.
- `test22`, `test28`, `test31`, `test40`, `test41` : `cap` lu comme `reps[1]`, ou son absence
  assertée. `test41` §B perd sa section sur la remise à zéro par relèvement.
- `test42` §1 : les deux gardes « relèvement possible, pas de mémoire » changent de sens, le
  passage au haut sème.

### Consigné au carnet, sans changement de code

- **`p.range`** est désormais, pour tout exercice, une copie constante de la fourchette du
  catalogue : dette nommée, à retirer dans un lot propre.
- **Tenues rythmées** pour le bird-dog et le dead bug, conception arrêtée, lot suivant.
- **`rowing-suspension-leste`**, file d'attente.

---

## v2.15 — 12 septembre 2026

**Lot lisibilité, ouvert par un audit UI/UX sur captures.** Un constat de Gabriel sur la
bibliothèque, les verrouillés intercalés dans les accessibles, puis un audit de toute
l'application en Chromium headless sur un état fabriqué de 14 séances, mobile et PC, clair et
sombre. Neuf points relevés, huit livrés ici, le neuvième, le desktop, tranché sur maquettes.
Empreinte de neutralité identique à la v2.14 : rien ne se tire, ne se prescrit ni ne s'annonce
autrement.

**La mémoire de la fenêtre de cible est semée à la migration.** Relevé de l'audit externe de la
v2.14 : sans migration, chaque exercice revivait une fois le recul silencieux que le lot
supprimait, sur plusieurs semaines de transition. `p.sets` n'est pas une valeur devinée, c'est la
dernière lecture enregistrée avec ses marqueurs : elle sème `prevMin`, sous gardes.

### Corrigé

- **Les quatre illustrations de mollets avaient la main coupée contre le mur**, panneau gauche.
  `prep_illus.py` prenait le trait de mur du panneau pour le séparateur, l'effaçait avec le pouce,
  et laissait le fragment mesuré en v2.5. Troisième argument optionnel du script, position du
  séparateur en fraction de largeur, défaut inchangé ; les quatre sources fournies par Gabriel
  repassées avec `0.5`. Banque toujours à 56 images, même table de quantification.

- **Bibliothèque : dix noms tronqués sur mobile**, dont « Tractions assisté… » deux fois de suite,
  supination et pronation indiscernables. La colonne de droite portait les séries et le niveau,
  « KB 10 kg + lestes 2 kg » à lui seul. Le niveau descend en ligne 2, le nom passe à la ligne et
  ne se coupe plus jamais.
- **Bibliothèque : les substituts matériels n'étaient pas marqués**, contrairement à ce que le
  carnet affirmait depuis la v2.0. Six fiches apparaissaient en « à faire » alors qu'elles ne
  sortent jamais à domicile. Marquées, avec leur origine, et sans « à faire », comme les replis.
- **Valeurs d'en-tête fermé coupées** sur les trois onglets (« échauffement complet · card… »,
  « 1 h 7 min c… », « Cible, calibr… ») : elles passent à la ligne.
- **Détail de séance : noms d'exercice tronqués** (« Développé haltères a… ») : à la ligne.
- **Écran de série après une montée** : « Cible 8 · Dernière fois 12/12/12 » sans dire que la
  charge avait monté. La ligne porte le niveau joué quand il diffère du jour, « à 6 kg »,
  « en bande rouge », lu sur l'historique.
- **Texte de fiche** « La cible monte d'un cran à chaque séance réussie », inexact depuis la
  v1.0 : « La cible suit tes séries, puis la charge prend le relais. »
- **Étiquettes à 0,6 rem**, soit 9,6 px, sous le plancher de lisibilité mobile : 0,68 rem. Les
  pastilles d'échelle de la fiche portent une classe, `test30` ne les reconnaît plus à une
  taille de police.

### Retiré

- **Deux phrases constantes du détail de séance**, « N séries par exercice, plus le module cardio
  qui coûte environ une série… » et « Touche un exercice pour sa fiche complète », affichées à
  chaque lancement : bruit, par le motif qui avait écarté le résumé de volume sur l'accueil. La
  ligne des étirements du jour reste, raccourcie.
- **Le référentiel d'assiduité déplié en permanence** sous l'histogramme : replié derrière
  « Comment lire ce graphique », comme sur Couverture (v1.10).

### Ajouté

- **Bibliothèque en trois paliers de lecture par groupe** : en rotation, hors tirage (replis et
  substituts sous un sous-titre), puis « N paliers à débloquer » dans un bloc replié dont la
  ligne fermée porte le compte. Une recherche ouvre le bloc, son effacement le referme.
- **« Cette semaine » sous le bouton de lancement**, avant Contenu et Détail : mesurée à 1 300 px
  du haut sur mobile, l'instrument de l'habitude était le dernier à se lire. L'ordre seul change.
- **Colonne de 600 px au-dessus de 900 px de large.** Sur PC la colonne de téléphone laissait les
  deux tiers de l'écran vides. Trois variantes maquettées et capturées : rien, 600 px, deux
  colonnes ; Gabriel a tranché pour 600 px. Le mobile ne change pas.
- **Migration de `prevMin`** depuis `p.sets` : jamais depuis une lecture allégée ou non qualifiée,
  jamais sous grâce (le dernier passage a monté le palier), jamais depuis un passage entièrement
  au haut de fourchette moins un pas sur le poids du corps et les tenues (un relèvement ne laisse
  pas de grâce), jamais par-dessus une mémoire posée. Sur les deux chemins d'entrée.
- **`test42.js`**, neuf sections, et **`falsif42.sh`**, vingt et une mutations qui tombent toutes.
  `test41` §8 et §9 changent de sens, la migration est vérifiée au lieu d'être interdite.

### Consigné au carnet, sans changement de code

- **Dents de scie** : 14, 11, 14, 11 fige la cible à 15, jamais atteinte, sans message. Prix de
  la fenêtre, à traiter par l'instrument de stagnation.
- **Asymétrie cible-filet**, deux passages contre un : délibérée, les deux erreurs n'ayant pas le
  même coût sur une L5 malformée.

---

## v2.14 — 12 septembre 2026

**La cible a une mémoire de deux passages.** Elle valait la plus petite série du dernier
passage plus une : une mauvaise séance à 12 sur une cible à 16 la recalait à 13, sans un mot,
et un seul jour hors forme effaçait l'ancre. Elle vaut désormais la plus haute des deux
dernières lectures au palier courant, plus une. Une mauvaise séance est absorbée, deux
consécutives font redescendre, et le recul se dit au récapitulatif. Sur l'exemple qui a
ouvert le lot, 12, 13, 14, 15 puis une séance à 12 : la cible reste à 16, et un 16 la
séance d'après donne 17. La montée de charge, le filet de sécurité, les XP et les verrous ne
lisent pas la cible et ne bougent pas. Empreinte de neutralité identique à la v2.13 sur ses
206 lignes : à état égal, rien ne se tire, ne se prescrit ni ne s'annonce autrement.

**Le texte « Comment ça marche » est réécrit en quatre blocs.** La règle de cible, mécanisme
permanent, vivait sous « La calibration, au début », qui est une phase, et rien ne disait ce
qu'est une cible ; c'est ce qui a fait lire la cible comme la courbe de progression. Un bloc de
tête le dit, et les trois blocs existants passent de 552 à 380 mots.

### Corrigé

- **Le texte de la v2.12 racontait le mécanisme à moitié** : la cible qui monte, jamais la
  cible qui retombe au bas de fourchette quand la charge monte, ni le filet, ni la séance
  allégée. Et « ce qui n'avance que d'un cran par passage, c'est le haut de la fourchette »
  n'était vrai que sur les rares exercices au poids du corps dont la fourchette bouge encore.
- **Redites** : l'échec technique était énoncé trois fois dans le bloc de fin de série,
  l'exemple du bassin deux fois. L'exemple des pompes est conservé mot pour mot.
- **L'en-tête du carnet annonçait v2.12** alors que le code et le changelog étaient en v2.13.
- **Deux assertions épinglaient des valeurs**, contre la règle de la v1.15 : `test39` exigeait
  trois blocs, `test40` cinq développements et la chaîne exacte de l'ancienne règle. Elles
  passent en assertions de forme.

### Ajouté

- **`p.prevMin`**, la plus petite série du passage exploitable précédent au palier courant.
  Écrite sur toute lecture exploitable et complète, palier tenu compris ; jamais sur une
  lecture partielle, allégée ou non qualifiée ; remise à zéro à toute montée, descente,
  relèvement de fourchette et ajustement manuel de charge ou de bande. Absente, pas de
  mémoire : aucune migration, une sauvegarde antérieure commence sa mémoire au premier passage.
- **Le recul de cible se dit au récapitulatif**, `Exo : cible recalée de 18 à 15, deux passages
  en dessous`, seulement quand la fenêtre a joué. Un recul sans mémoire derrière lui reste muet,
  la v1.15 tient pour lui. Un seul message par événement : la clause « cible recalée » s'ajoute
  aux signaux existants de lecture partielle et d'échec sans descente, jamais un second message.
- **« Tenir ce palier »** recalcule la mémoire depuis le passage joué au palier restauré.
- **Bloc « Cible, fourchette, charge »** en tête du texte, sous-titre de la card Réglages
  « Cible, calibration, fin de série, fiches ». Il solde le point « contrat d'effort » de la
  file d'attente : la cible est ce qu'on vise, pas là où on s'arrête.
- **`test41.js`**, dix sections, et **`falsif41.sh`**, vingt mutations qui tombent toutes. Deux
  suites existantes retouchées sur le fond : `test13` (un mauvais jour isolé est absorbé, c'est
  le second qui ramène au bas de fourchette) et le helper `pose` de `test18` (un état posé n'a
  pas de mémoire ; sans ça elle fuyait d'un cas au suivant).

### Écarté

- **Le cliquet**, une cible qui ne redescend jamais dans la fourchette. Elle ment après toute
  vraie régression, et garder 16 après un 12 exige de savoir que c'était une mauvaise journée,
  ce que l'outil n'observe pas : c'est le RPE déclaratif abandonné.
- **Le message sur un recul sans mémoire**, premier passage après un ajustement manuel ou sur
  une sauvegarde antérieure : un seul passage derrière lui, pas un événement.

---

## v2.13 — 12 septembre 2026

**Le pont fessier cesse d'être une impasse.** Deuxième des deux culs-de-sac recensés en
v2.5 : le plafond valait 25 pour une fourchette 10-20, cinq relèvements fantômes, et la
marche écrite, passer sur une jambe, doublait la charge d'un coup. L'escalier en compte
désormais sept positions, sur quatre fiches nouvelles.

Deux barreaux lestés suffisent là où les mollets en demandaient quatre. La raison est un
calcul repris à zéro : une charge posée sur le bassin monte de l'amplitude entière, quand
le poids du corps n'en monte que la moitié, le tronc pivotant sur les épaules et la cuisse
sur le genou. Dix kilos sur les hanches valent donc vingt kilos de poids de corps, +33 %
de résistance et non +13 %. Le premier chiffrage, qui ajoutait le lest comme du poids de
corps, était faux et faisait croire qu'il fallait monter à 40 kg.

### Corrigé

- **Le texte de la calibration était faux depuis qu'il existe.** Il annonçait qu'elle ne
  concernait que les exercices à charge choisie, et que les autres avançaient d'un cran à
  la fois. La cible en répétitions vaut la plus petite série plus une, sur tous les
  exercices : douze pompes quand la cible en demandait six fixent la suivante à treize.
  Ce qui n'avance que d'un cran par passage, c'est le haut de la fourchette.
- **Le plafond du pont fessier** passe de 25 à 20, le haut de sa fourchette. Les
  fourchettes héritées au-dessus sont écrêtées à la migration, comme celles des mollets
  debout en v2.5.
- **La liste nominative des exercices à critère de fin de série** disparaît du texte
  « Comment ça marche ». Elle devenait fausse à chaque lot qui ajoute une fiche, sans que
  rien ne le signale. Le texte renvoie à la ligne Fin de série portée par la fiche.
- **`pont-fessier` portait le même signal d'arrêt que ses successeurs sans le nommer.**
  Il reçoit son critère de fin, ce qui porte le compte de 8 à 13 fiches.

### Ajouté

- **Quatre fiches** : `pont-fessier-leste`, `pont-fessier-une-jambe`, `hip-thrust-une-jambe`,
  `hip-thrust-une-jambe-leste`. Chacune retire son prédécesseur du tirage à son déblocage,
  les quatre replient sur le pont au sol, seul maillon sans verrou. Sauts obtenus en
  résistance par jambe : +33 %, +25 %, +21 %, +50 %, +33 %, +25 %.
- **Une échelle de charge posée sur les hanches**, même pas de 10 kg que celle du sac,
  bornée par la masse déclarée et par une constante à 20 kg. Deux raisons distinctes selon
  la fiche : sur le pont lesté, au-delà de 20 l'escalier cesserait d'être monotone, +30
  valant déjà le pont sur une jambe ; sur le hip thrust lesté, dernier maillon, c'est le
  montage qui ne tient pas, une charge improvisée sur le bassin cessant d'être stable bien
  avant d'être insuffisante.
- **Un verrou qui lit la charge** sur le passage au pont sur une jambe, comme celui des
  mollets, et pour le même motif : sans lui il s'ouvrirait dès 20 répétitions à 10 kg et le
  barreau 20 ne serait jamais joué. Le dernier barreau se lit sur l'échelle filtrée par
  l'inventaire, une kettlebell de 10 kg suffit donc à ouvrir la suite.
- **Le texte dit qu'on peut se renseigner hors de l'outil**, vidéo ou site d'entraînement,
  pour un mouvement jamais vu exécuter.
- **Quatre illustrations**, banque à 56 images.
- **`test40.js`**, onze sections. Six suites existantes recalées sur des comptes déplacés :
  `test9`, `test22`, `test24`, `test28`, `test31`, `test39`.

### Écarté

- **`pont-fessier-une-jambe-leste`**, cinquième fiche. À +10 kg elle rendrait +33 % puis ne
  laisserait que +12 % au hip thrust : deux barreaux collés au prix d'une fiche, d'une
  illustration et d'une traversée de fourchette. Reste l'intermédiaire à insérer si l'entrée
  dans le hip thrust se révèle trop raide à l'usage.
- **Le pied surélevé** comme échelon. Il vaut environ +45 %, le même ordre que le hip thrust
  et pour la même raison, l'amplitude : un doublon moins stable. Il vit dans la fiche.

---

## v2.12 — 12 septembre 2026

**Le journal se met à enregistrer ce qu'il ne savait pas dire, et quatre dettes de la
v1.15 sont soldées.** Lot ouvert par la revue des chantiers prêts : ce sont les seuls
qui ne demandaient aucune observation nouvelle, l'outil n'ayant pas encore été joué
sur l'ordre de circuit de la v2.10.

Trois champs de plus dans l'entrée d'historique, et **rien qui les lise**. Ils
s'accumulent pour qu'une décision puisse un jour se prendre sur des données ; ce
qu'on en fera se décidera alors, pas maintenant. C'est la condition pour qu'ils
respectent le principe d'architecture : informatifs, jamais décisionnels.

### Retiré

- **`bandBest`**, maximum historique des répétitions au barreau courant, remis à zéro
  au changement de barreau, lu par les deux verrous à porte de bande. C'était la
  dernière lecture d'un maximum historique dans un verrou, alors que la v1.15 avait
  chassé `best` des déblocages avec cet argument exact : un verrou prouve une capacité
  actuelle. La clé est retirée des états hérités à la migration.
- **La branche `bandGate` de `checkUnlocks`.** Elle portait son propre comptage de
  répétitions, en face de celui de tous les autres verrous. Deux comptages, c'est deux
  règles qui divergeront.
- **La remise à zéro du meilleur de bande** dans `holdClimb` et dans l'ajustement
  manuel de bande, sans objet désormais.

### Corrigé

- **La correction de séance détruisait en silence les gestes manuels postérieurs.**
  Elle restaure l'instantané d'avant séance puis rejoue, ce qui effaçait un palier tenu
  posé depuis le récapitulatif, la fiche ou le mode entretien. Ces gestes sont relevés
  avant la restauration et reposés après le rejeu : la séance s'est bien jouée sous
  l'état d'avant, la décision de l'utilisateur, elle, est postérieure et lui survit.
- **La correction n'annonçait jamais ce qu'elle défait.** Elle affichait les messages
  de progression recalculés, et rien sur les montées et les déblocages qui
  disparaissaient. Un bloc distinct les nomme, au récapitulatif comme dans l'onglet
  Progrès. Distinct et non mêlé : un message d'annulation au milieu de messages de
  progression se lit comme une progression.
- **Le détail de séance affichait la charge de départ sur les exercices à charge
  fixe.** `exoLoadLabel` lisait `e.load0`, la valeur du catalogue : un goblet squat monté
  à 14 kg s'affichait à 10 sur l'accueil et sur tous les panneaux du carrousel,
  c'est-à-dire exactement la card qui sert à préparer le matériel. Il lit la charge
  courante, et passe par le libellé de l'échelle, qui nomme le montage.
- **Le texte du verrou à porte de bande disait « à la dernière séance » alors que le
  nombre affiché était un maximum historique.** Il est vrai maintenant.
- **Trois compteurs faux dans `PALIER-code.md`** : `app7.js` était annoncé à 1177 lignes
  et 74711 octets pour 1184 et 75198 réels. Tous les compteurs du document sont
  recalculés.
- **Trois comptes de suites différents dans le carnet**, 35, 36 et 37, pour 37 réelles
  avant ce lot. Mesuré sur `build.sh`, pas recopié.

### Ajouté

- **`entry.roundsPlan`**, les tours annoncés au lancement, à côté de `rounds` qui porte
  le réalisé. Les deux divergent depuis que le volume se change en cours de séance
  (v2.1), et c'est cet écart qui est informatif. `cur.rounds0` existait déjà, il bornait
  le sélecteur de volume : il n'y avait qu'à l'écrire.
- **`it.tgt`**, la cible visée ce jour-là, relevée dans l'instantané pris avant
  progression. L'historique portait les séries faites sans le nombre qu'elles visaient,
  si bien qu'aucun instrument ne pouvait dire d'une cible qu'elle n'a pas bougé depuis
  n passages. Un rejeu a posteriori divergerait : la montée dépend de `full`, de la grâce
  et du palier tenu, dont aucun n'est historisé.
- **`it.secs`**, la durée de chaque série en secondes, de l'arrivée sur l'écran à la
  validation. Brute : ni plancher, ni écrêtage, ni nettoyage, à la différence de `real`
  qui porte un `Math.max(60)`. Une série de huit secondes est une information, et
  nettoyer à l'écriture enfouirait un jugement dans la donnée. La borne basse est ce
  que l'outil observe vraiment, et c'est aussi ce que le modèle de temps représente.
- **`p.setsBand`**, le barreau sous lequel les séries ont été jouées, écrit avec elles
  et avant toute progression. Il remplace `bandBest` et ferme le trou que sa remise à
  zéro fermait par effet de bord : une séance jouée au barreau précédent peut faire
  monter la bande en fin de séance, et lire le barreau courant attribuerait alors les
  répétitions à un barreau sous lequel elles n'ont pas été faites. Aucune
  reconstitution pour les états hérités : le verrou attend le prochain passage, et la
  fiche le dit.
- **Le critère de fin de série**, champ `fin` sur sept fiches, plus la règle générale et
  un lien vers le texte complet sur toutes. Sept, parce que c'est là que l'échec
  technique arrive avant l'échec musculaire ; la répéter partout la ferait lire nulle
  part.
- **« Comment ça marche »**, un seul texte en trois blocs, chacun portant son
  développement replié sur place : la calibration, la fin de série, la règle d'or. Il
  s'affiche sur l'accueil tant qu'il n'a pas été lu, un bouton le retire définitivement,
  et la section de Réglages le garde déplié pour le relire. Un seul rendu sert les deux
  endroits.
- **`state.intro`**, drapeau du bloc d'accueil. Une valeur, jamais une absence (v2.3),
  posée à `true` par `defaultState` : une sauvegarde antérieure le reçoit, ce qui est
  voulu, le texte est nouveau pour elle aussi. Aucun code de migration.
- **`test38.js` et `test39.js`**, trente-huitième et trente-neuvième suites, avec
  **`falsif38.sh`** (douze mutations) et **`falsif39.sh`** (dix-sept mutations). Chacune
  fait tomber sa suite.

### Suites existantes retouchées

Sept suites lisaient `bandBest`. Deux d'entre elles gagnent une assertion au lieu d'en
perdre une : `test24` et `test26` vérifient désormais que le barreau joué s'écrit même
sous une provenance inexploitable, puisque c'est une information et non une action.
`test18` voit ses deux sujets fabriqués complétés d'un `secs`, le sujet étant complété
plutôt que l'application assouplie.

Deux suites ont attrapé des fautes avant livraison. `test2` a refusé le mot « tours »
dans le texte d'onboarding, vocabulaire abandonné en v1.13 au profit de « séries » ;
corrigé dans le texte. `test18` a refusé un `cur` fabriqué sans `secs`, ce qui est
exactement le défaut de méthode nommé en v2.3.

L'empreinte de neutralité est identique à celle de la v2.11 : ni les tirages, ni les
prescriptions, ni les durées annoncées ne bougent.

---

## v2.11 — 11 septembre 2026

**La pause de raccord cesse d'être posée partout.** Elle ne se pose plus que sur les enchaînements
que Gabriel a nommés, et la liste est livrée vide. L'ordre du circuit de la v2.10 ne bouge pas : c'est
lui qui résout le problème, et il le résout seul.

Le problème d'origine n'était pas « l'épaule », c'était **une paire** : élévations latérales, dans le
vivier poussé, puis face pulls, dans le vivier tiré. Deux exercices d'isolation d'épaule que l'ancien
ordre rendait adjacents, avec 25 s entre eux. L'ordre poussé, jambes, tiré, gainage les sépare par un
poste dans le tour et par un poste au raccord, donc **dans les deux sens**, ce qui porte l'intervalle
réel à 52 à 112 s selon l'exercice intercalé. À coût nul, sur toutes les séances, avec un ordre
constant.

La pause de la v2.10 réparait autre chose : une adjacence gainage vers poussé qui n'a **jamais été
signalée par personne**, déduite d'une table de marqueurs par exercice qui est un jugement, vit hors
application, et n'a jamais été confrontée au journal. Elle coûtait 90 s par séance de trois tours dans
un format dont la raison d'être, écrite au carnet, est de supprimer le temps mort et non de le subir.
Et elle contredisait le principe d'architecture du carnet : l'outil décide sur ce qu'il observe.

Séance à trois séries, échauffement complet et étirements : **15 min**, contre 16,2 en v2.10 et 14,7
en v2.9. La contrainte de 10 à 20 minutes est de nouveau tenue.

### Retiré

- **La pause inconditionnelle.** `restStep` exige désormais, en plus d'être au raccord, que la paire
  gainage vers poussé figure dans `PAUSE_RACCORD_PAIRS`.
- **La phrase de la card Réglages** qui annonçait une exception permanente au sélecteur. Elle
  n'apparaît que si une paire est nommée.

### Corrigé

Quatre affirmations fausses écrites en v2.10, toutes reprises au carnet et au changelog.

- **« L'ordre seul est une régression mesurée. »** L'instrument comptait les quatre adjacences du
  circuit à poids égal, alors qu'une séance à R tours contient 3R adjacences intra-tour et seulement
  **R-1** raccords, aucun repos n'étant émis après la dernière série. Le compte n'était exact qu'à la
  limite R infini. Recompté : l'ordre seul **gagne** 0,39 conflit par séance à deux tours, 0,28 à
  trois, 0,17 à quatre. La mesure ne réfutait rien, elle comptait mal. C'est exactement le défaut de
  rapport que la session du 10 septembre avait corrigé sur la v2.7, reproduit dans le lot qui le
  corrigeait.
- **L'entrée « livrer l'ordre seul, réfuté par la mesure »** du tableau des abandons. Retirée : c'est
  la solution livrée.
- **« 90 s donneraient 100 s, au-dessus de la bande. »** Rien ne se dégrade à se reposer plus
  longtemps que le minimum, sauf le temps. Le seul argument recevable contre 90 s est le coût, et il
  suffisait. La justification par plafond de bande est retirée.
- **Le critère de révision de la constante**, « si la première série de poussé des tours 2 et 3 passe
  sous celle du tour 1 ». Elle passera sous celle du tour 1 quoi qu'il arrive, par fatigue cumulée.
  Ce critère ne peut rien attribuer. Remplacé au carnet par le ressenti, qui est la seule source que
  l'outil n'a pas.

### Ajouté

- **`PAUSE_RACCORD_PAIRS`**, liste de chaînes `'id-gainage>id-poussé'`, vide. Une entrée est un
  enchaînement constaté, pas un enchaînement déduit. Elle a le même statut que `SLOT_ORDER` : une
  décision écrite dans le code, sans table, sans migration, sans donnée persistée. Le faux dilemme de
  la v2.10, table de jugement promue au catalogue ou rien, n'existait pas.
- **`pauseAu(a, b)`**, prédicat unique lu par `restStep` et par `sessionSpan`, pour que la durée
  annoncée et la séance construite ne puissent pas diverger.
- **`seuil-r.js`**, instrument de mesure pondéré par le nombre de tours, qui remplace le compte
  « /4 ». Ce dernier n'y survit que comme limite asymptotique, nommée comme telle.

### Conservé de la v2.10

Toute l'infrastructure, parce qu'elle était bonne et qu'elle est testée : `restStep` constructeur
unique, drapeau `pause` porté par l'étape et jamais redéduit de sa durée, écran de pause distinct
avec son message replié, ligne conditionnelle **Pause de tour** dans la card Contenu, postes `pause`
et `nPause` dans `planParts`, et l'accord de genre sur le barreau de bande.

`test37.js` passe de neuf à onze sections. Deux sont nouvelles : la paire poussé/tiré ne doit être
adjacente **dans aucun sens**, propriété vérifiée sur la structure du circuit et donc pour tous les
tirages à la fois ; et le mécanisme de pause doit répondre quand une paire est nommée, sans quoi le
lot livrerait du code mort non exercé. `falsif37.sh` passe à quatorze mutations, dont « pause
redevenue inconditionnelle » et « ordre remettant poussé et tiré adjacents ».

---

## v2.10 — 11 septembre 2026

Ordre du circuit **poussé, jambes, tiré, gainage**, et **pause de 60 s au raccord de tour**. Les deux
ne font qu'une décision : l'ordre seul est une régression mesurée, la pause seule laisserait le face
pull derrière le poussé. Lot ouvert par la session d'audit du 10 septembre, qui a trouvé deux
défauts dans la mesure d'ordre de la v2.7, un défaut de rapport et une prémisse fausse.

Le défaut de rapport : les six ordres forment trois paires miroir, `conflits(a,b)` étant symétrique,
donc l'ordre v2.7 n'était **jamais meilleur seul**, toujours à égalité avec son miroir. Le
« meilleur des six » était un ex æquo parmi trois structures. La prémisse fausse : les quatre
emplacements ne sont pas indépendants sur l'épaule. Mesuré sur 450 quatuors, au moins un poste
marqué épaule 3 dans 100 % des cas, deux ou plus dans 68 %, moyenne 1,93 sur 4.

Ce que l'ordre achète : le tiré cesse d'être précédé du poussé, et le prédécesseur du face pull
passe de 67 % de quatuors en conflit à 13 %. Ce qu'il coûte : une adjacence gainage vers poussé à
80 %, et un total qui monte de 1,43 à 1,53 conflit par séance. La pause au raccord ramène ce total à
0,73.

Coût en temps, transition à 15 s : **+45 s par raccord**, soit +1,5 min à trois séries et +2,25 min
à quatre. Il y a `R-1` raccords dans une séance, le dernier tour n'en portant pas : aucun poussé ne
lui succède.

Écarté, et noté au carnet : livrer le changement d'ordre seul en décidant la pause plus tard sur le
journal ; une pause conditionnelle à la composition du quatuor, qui exigerait de promouvoir la table
de marqueurs d'épaule en donnée du catalogue alors qu'elle est un jugement ; une pause réglable, dont
le cran bas rouvrirait la régression qu'elle répare ; une pause après le dernier tour, qui n'aurait
rien à protéger.

### Retiré

- **L'heuristique de durée qui nommait l'écran de repos.** `restTagHtml` lisait `sec<=20` pour
  choisir entre « Transition » et « Repos ». Elle appelait déjà « Repos » une transition réglée à
  30 s, et elle aurait appelé « Repos » la pause de raccord : deux choses différentes sous un même
  mot, faute d'un fait à lire. Le tag se lit désormais sur le drapeau `pause` porté par l'étape.
- **L'ancien contrôle de barreau de bande de `test23`.** Il cherchait « élastique » suivi de la
  **clé** du niveau, au masculin. Il passait par préfixe, « élastique noir » étant un préfixe de
  « élastique noire », et n'aurait donc jamais vu le désaccord qu'il était censé couvrir.

### Corrigé

- **Accord de genre sur le barreau de bande.** `PAL` stocke le libellé de couleur au féminin,
  « élastique » est masculin : l'outil écrivait « élastique noire ». Les **cinq** concaténations
  d'`app9.js` disent « bande », qui accorde. Les littéraux de `MAT` ne bougent pas : sans barreau
  prescrit, l'objet à aller chercher reste un élastique. L'objet est un élastique, le barreau est une
  bande.
- **La fourchette de durée des Réglages.** `sessionSpan` comptait `rounds × 4 - 1` repos à un tarif
  unique. Elle compte `rounds × 3` transitions et `rounds - 1` raccords. Sans quoi elle se serait
  écartée de l'estimation de l'accueil dès la première séance, ce qui est exactement le défaut qui
  avait fait tomber l'ancien modèle de temps.
- **Le poids annoncé d'un palier de 5 s dans la card Transition.** Il valait `(rounds × 4 - 1) × 5`
  et vaut `rounds × 3 × 5` : le raccord échappe au sélecteur, il ne doit pas peser dans son effet.
- **Une assertion de `test17` qui manquait de résolution.** « Déverrouiller un exercice change la
  fourchette » tombait sur l'arrondi à la minute, pas sur une régression : la borne basse passe bien
  de 969 à 954 s au déverrouillage, mais 879 et 864 s donnaient 15 et 14 min quand 969 et 954 donnent
  tous deux 16. L'assertion porte sur les secondes, et vérifie en plus que la fourchette annoncée
  suit toujours l'énumération.

### Ajouté

- **`const PAUSE_TOUR=60`**, dans `app3.js` à côté de `TRANSITION`. Constante et non réglable : la
  pause remplace la transition au raccord, puis vient l'installation modélisée à 10 s, donc
  l'intervalle réel vaut environ 70 s, dans la bande de 60 à 95 s où la littérature situe la
  récupération de l'épaule. 90 s donneraient 100 s, au-dessus de la bande, pour le double du
  surcoût.
- **`restStep(raccord)`**, constructeur unique des étapes de repos. Deux sites émettent des repos, la
  construction de séance et le changement de volume en cours de séance ; la règle vit à un seul
  endroit, sans quoi les deux divergeraient comme l'avaient fait les trois écritures de `next` avant
  la v2.6. `test37.js` vérifie qu'aucun site ne fabrique l'objet à la main.
- **Les postes `pause` et `nPause` dans `planParts`**, et une ligne conditionnelle **Pause de tour**
  dans la card Contenu, sur le modèle de la ligne Remontage de charge. Le total était déjà juste, tous
  les repos y étant sommés ; ce qui aurait menti, c'est le libellé de la ligne Transitions.
- **`pauseWhyHtml()`**, message replié sur l'écran de pause, sous `cardOpen` donc survivant à un
  changement de volume pendant la pause. Il se lit **avant** d'appuyer sur Passer et non après : une
  confirmation en deux temps est exclue, il n'y a plus aucun dialogue nulle part, et l'outil ne peut
  pas observer si l'épaule a récupéré.
- **Les règles `.tag.pause`, `.chrono.rest.pause`, `.pausecard`, `.pausemsg`.** La pause doit se
  distinguer d'une transition avant d'avoir été lue : même écran, même place, autre registre de
  couleur. Le liseré porte la distinction, le chrono la confirme. `.tag.pause` partage la règle de
  `.tag.flame` mais pas son animation.
- **La sortie de pause dégradée en secondaire.** Sur une transition, partir tôt est normal et le
  bouton est l'action principale ; sur une pause, partir tôt la défait. L'écran n'a plus d'action
  principale, ce qui est exactement ce qu'il prescrit. Le bouton reste, au même endroit et sous le
  même nom.
- **`test37.js`**, trente-septième suite, neuf sections, et **`falsif37.sh`**, banc de douze
  mutations dont chacune doit faire tomber la suite.

### Suites existantes retouchées

`test15`, `test16` et `test17` pour le poste de durée supplémentaire et pour la résolution de la
fourchette, `test23` pour l'accord de genre, `test34` pour la décision d'ordre qui remplace celle de
la v2.7. Aucune retouche ne masque un défaut applicatif ; chacune est justifiée en commentaire dans
la suite concernée.

---

## v2.9 — 6 septembre 2026

Deux indicateurs temporels sur l'écran de transition : l'heure et le temps écoulé depuis le lancement
de la séance, sur la ligne du tag, restée vide à droite jusqu'ici. Lot d'affichage pur, ouvert par une
demande de Gabriel et non par la file d'attente, qu'il ne consomme pas. **L'empreinte de neutralité
est identique ligne pour ligne** : aucun tirage, aucune cible, aucune charge, aucun barreau, aucune
durée annoncée et aucun décompte de remontage ne bouge.

Le temps écoulé est affiché **à la minute**, tronqué. La formulation d'origine parlait d'un chrono ;
l'écran porte déjà un décompte à la seconde, et deux nombres qui défilent à la même cadence en sens
inverse ne se distinguent plus. Écarté également, l'affichage de la durée annoncée à côté de
l'écoulé.

### Retiré

- **La lecture directe de l'heure dans `fmtDT`.** `getHours` et `getMinutes` y étaient découpés à la
  main. La ligne de transition l'aurait fait une seconde fois, et deux découpages du même instant
  finissent par diverger, comme les clés de jour avant la v2.6. `fmtHM` découpe seule, `fmtDT` passe
  par elle, et `test36.js` vérifie que `getHours` n'apparaît qu'une fois dans toute la source.

### Corrigé

- **Le compte de suites annoncé dans le carnet.** La section 5 disait trente-trois depuis la v2.6 et
  n'avait pas suivi les lots v2.7 et v2.8. Elle dit trente-six, mesuré sur `build.sh`.
- **Une collision de nom qui n'a jamais atteint la production.** Le formateur de l'écoulé s'appelait
  d'abord `fmtMin` ; le nom était déjà pris dans `app5.js` par la durée **annoncée** au tilde. La
  dernière déclaration assemblée gagne, et l'écran rendait `18h42 · ~0 min`, c'est-à-dire l'annonce à
  la place de la mesure. Aucune erreur, aucun avertissement, un rendu plausible. Pris par la première
  exécution de `test36.js`. Le formateur s'appelle `fmtEcoule` et porte le nom de sa grandeur.

### Ajouté

- **`fmtHM(x)`**, heure de l'horloge locale au format `18h42`, seul point de découpage de l'heure d'un
  instant.
- **`fmtEcoule(sec)`**, durée en minutes entières, tronquée et jamais arrondie : à 12 min 50 s l'écran
  annonce 12, sans quoi l'indicateur revendiquerait du temps qui n'a pas été passé.
- **`sessionElapsed()` et `sessionTime()`**, recalculés depuis `cur.t0` à chaque lecture et jamais
  incrémentés. `setInterval` est étranglé quand l'écran du téléphone s'éteint ; un compteur
  incrémenté aurait menti après une poche. `cur.t0` est déjà l'ancre de `real` à l'enregistrement,
  donc la ligne en séance et la durée réelle de l'historique ne peuvent pas s'écarter d'une seconde.
- **`restTagHtml(st)`**, qui ne fait passer la ligne du tag en `spread` que lorsqu'elle a deux
  occupants. Sans `t0`, un `spread` à un seul élément chasserait le tag à gauche alors que la card le
  centre.
- **La règle `.tline`**, couleur atténuée, corps réduit, chiffres tabulaires par `.num` : sans eux la
  ligne se déplacerait à chaque minute franchie.
- **Le rafraîchissement de la ligne dans la boucle de transition**, à côté de celui du décompte.
- **`test36.js`**, sept sections. Falsifiée par quatorze défauts injectés, les quatorze détectés. Un
  quinzième essai a été écarté comme invalide : le patch visait `let entry='';` dans `setHtml`, or la
  variable est réassignée dans les trois branches, donc l'injection était écrasée avant le rendu. Un
  défaut qui ne mord pas se lit comme une détection s'il n'est pas contrôlé.

Périmètre : les transitions seules. L'écran de série prescrit et son pavé passe déjà sous le pli ;
l'échauffement, le cardio et les étirements portent chacun leur propre chronomètre.

---

## v2.8 — 6 septembre 2026

Déphasage des quatre viviers, le plus ancien chantier de la file d'attente. Le tirage était
déterminé par un seul entier, les quatre compteurs valant toujours la même chose : **25 combinaisons
distinctes sur 375 possibles**, et des paires rigides, goblet squat toujours avec planche,
élévations latérales toujours avec face pulls, mollets debout toujours avec dead bug. Les 375
combinaisons sont désormais atteintes, soit le maximum arithmétique, sans qu'aucune fréquence ni
aucune prescription ne bouge.

Cette version emporte aussi la **v2.7, construite et vérifiée mais jamais déployée** : l'ordre du
circuit y passait de poussé, tiré, jambes, gainage à poussé, tiré, gainage, jambes. Les deux
chantiers restent des entrées distinctes du journal, le carnet interdisant de greffer le déphasage
sur un autre lot, mais un seul `index.html` est parti en production.

### Retiré

- **La promesse d'exhaustivité du carrousel.** La fenêtre valait autant de panneaux que le plus gros
  vivier, et chaque exercice tirable y figurait au moins une fois quel que soit le point de départ.
  Cette promesse et le déphasage sont mathématiquement exclusifs : que toute tranche glissante de
  `n` tirages porte les `n` exercices équivaut à une suite de période `n`, et deux suites de période
  5 sur jambes et gainage redonnent les cinq paires rigides à supprimer. Mesuré, les tenir ensemble
  aurait demandé onze panneaux au lieu de six. La fenêtre promet désormais l'exactitude, propriété
  plus forte et seule réellement consommée : chaque panneau annonce le tirage qui sortira à cette
  distance.
- **Le lien implicite entre l'ordre du circuit et la rotation.** Les phases sont déclarées dans
  `SLOT_PHASE` et non dérivées du rang dans `SLOT_ORDER`, pour qu'un futur changement d'ordre ne
  déplace pas silencieusement le tirage.

### Corrigé

- **`test23.js`, section 4.** Elle vérifiait l'exhaustivité de la fenêtre du carrousel sur 210
  départs. Elle vérifie désormais l'exactitude de chaque panneau sur les mêmes 210 départs, en
  comparant l'annonce au tirage réellement produit après *k* séances.

### Ajouté

- **`phaseIdx`, décalage d'un cran par tour de vivier accompli**, propre à l'emplacement, appliqué
  en lecture seule dans `pickFromPool` et dans `pickAt`. Le compteur n'est jamais touché : aucune
  migration, et la garantie de la v2.0 tient, un retour au profil précédent reprend la rotation où
  elle en était. Chaque tranche de `n` tirages alignée sur un tour de vivier reste une permutation
  du vivier, donc la fréquence de chaque exercice est strictement inchangée, mesurée à écart nul.
- **`SLOT_PHASE`**, valeurs 0, 1, 2, 3 sur poussé, tiré, gainage, jambes, retenues sur mesure parmi
  trois jeux : le seul qui atteigne les 375 quatuors et dont aucun vivier ne redonne le même
  exercice deux séances de suite. Zéro sur le poussé laisse intacte la rotation du plus petit
  vivier.
- **`test35.js`**, onze sections. Falsifiée par seize défauts injectés, quinze détectés par elle et
  le seizième par `test23.js`, à qui appartient l'assertion sur la taille de la fenêtre.

Sur l'empreinte de neutralité : les 26 lignes structurelles sont identiques, 90 des 180 lignes de
tirage changent, et **aucun exercice ne voit sa cible, sa bande ou sa charge bouger**. Seul
l'appariement des exercices dans la séance est différent, ce qui est exactement l'objet du lot.

---

## v2.7 — 6 septembre 2026

**Version non déployée : son contenu est parti en production dans la v2.8.** Un seul volet : l'ordre du circuit. La séance passe de poussé, tiré, jambes, gainage à **poussé,
tiré, gainage, jambes**. Lot d'exécution pure : ni la sélection, ni la rotation, ni les fréquences,
ni les verrous, ni le modèle de temps ne bougent. L'empreinte de neutralité le confirme, **180
lignes permutées et rien d'autre** : mêmes exercices, mêmes cibles, mêmes charges, mêmes durées
annoncées, mêmes décomptes de remontages.

Origine : une séance où le goblet squat, troisième poste, devenait dur à tenir après un développé
au sol puis un tirage en suspension. L'audit de la v1.6 traitait les transitions comme une file de
trois ; le circuit en compte quatre, le dernier exercice d'un tour précédant le premier du suivant.

### Retiré

- **L'adjacence jambes vers gainage.** C'était l'une des deux interférences relevées à l'audit de la
  v1.6, soulevé roumain ou swings avant une planche ou un gainage latéral. Elle n'existe plus dans
  aucun tour.
- **Deux tables de libellés d'emplacement recopiées**, dans la bibliothèque et dans la couverture
  musculaire. Trois tables à tenir accordées pour quatre libellés, dont deux figeaient un ordre que
  `SLOT_ORDER` ne commande plus. Les libellés viennent maintenant de `SLOTS`, l'ordre de
  `SLOT_ORDER`. `test34.js` vérifie qu'il n'en reste qu'un jeu dans les sources.

### Corrigé

- **La raison d'origine de la structure alternée, au carnet.** Elle y était présentée comme un
  bénéfice annexe, « l'alternance sert aussi de repos », alors que c'est le mécanisme même du choix :
  un muscle demande 60 à 90 s entre deux séries, quatre exercices sur des groupes différents paient
  cette pause par le travail des trois autres, et la séance ne contient aucun temps mort. Le volume
  hebdomadaire mesuré en v1.18 est la conséquence de ce choix, pas sa cause. Correction de document,
  sans effet sur le code.

### Ajouté

- **Ordre du circuit poussé, tiré, gainage, jambes.** Retenu sur mesure et non sur avis : comptage
  des conflits d'infrastructure des six ordres possibles, sur toutes les combinaisons des viviers,
  dans deux états de verrous et sous deux hypothèses sur l'enchaînement poussé vers tiré. L'ordre
  d'origine sortait cinquième sur six dans le modèle de base, et le restait sur 254 des 256 jeux de
  marqueurs testés. Celui-ci n'est derrière lui dans aucun des quatre scénarios et il est premier
  dans trois. Il referme le tour par jambes vers poussé, la transition la plus propre du catalogue.
- **`test34.js`**, dix sections. Elle ne teste pas le contenu de `SLOT_ORDER` sauf une fois, pour
  figer la décision : tout le reste vérifie que rien dans le code ne suppose une position
  particulière. Falsifiée par seize défauts injectés, tous détectés.
- **`ordre-circuit.js`** à l'outillage, script de mesure hors `build.sh`, avec sa table de
  marqueurs et ses hypothèses déclarées.

---

## v2.6 — 1er septembre 2026

Deux volets. Les séries du jour sur l'écran de repos : la vignette de l'exercice qui vient porte
désormais ce qui a déjà été fait sur lui pendant la séance. Et le découpage du temps, qui réduisait
un instant à un jour en UTC là où tout le reste lisait l'horloge locale. Lot d'affichage et de
lecture : l'empreinte de neutralité est **identique sur les 206 lignes**, tirages, cibles, charges,
durées annoncées et remontages compris.

### Retiré

- **Deux des trois écritures de `next` sur les pas de repos.** La construction de séance et le
  changement de volume le posaient chacun à la main, en calculant l'exercice suivant par un modulo
  sur la liste des emplacements ; `relinkRests` le recalculait ensuite en relisant la séquence. Trois
  chemins pour un seul champ. Les deux premiers appellent maintenant le troisième.

### Ajouté

- **Les séries déjà faites du jour sur la vignette de l'écran de repos**, à droite du nom, dans le
  vocabulaire exact de la pastille de l'écran de série : même vert, même corps, même libellé
  « Aujourd'hui », même formateur de liste. Rien avant le premier passage du jour. Trois valeurs au
  maximum, le volume plafonnant à quatre séries. Mesuré à quatre séries, trois transitions nues au
  premier tour puis douze chargées sur quinze.
- **`nextKey` sur les pas de repos**, à côté de `next`. Le journal s'indexe sur `st.key`, qui vaut
  « origine>repli » pendant un repli douleur : sans ce champ, la vignette du repli aurait montré les
  séries de l'exercice d'origine.
- **`nextWork(steps,i)`**, extraite de `relinkRests`, qui rend le pas de travail suivant et non son
  identifiant. `relinkRests` prend la liste en paramètre et pose les deux champs, seule.
- **`test32.js`**, cinq sections. L'invariant central est vérifié à chaque transition traversée : ce
  que la vignette montre est exactement `cur.log[nextKey]`, et exactement ce que la pastille de
  l'écran de série montre pour le même pas. Falsifiée par huit défauts injectés, tous détectés.

- **Trois formateurs de date**, `dayKey`, `monthKey` et `dayGap`, qui découpent un instant en jour ou
  en mois sur l'horloge de l'appareil et calculent un écart en jours civils. Six points d'appel
  convertis : nom du fichier téléchargé, en-tête fermé de la card Données, jours actifs, compte
  hebdomadaire, cumul mensuel de temps.
- **`test33.js`**, cinq sections. Elle force `Europe/Brussels` avant le premier appel à `Date` et
  échoue si le forçage n'a pas pris, sans quoi elle ne discriminerait rien sous `TZ=UTC` ; trois de
  ses sections figent l'horloge. Falsifiée par neuf défauts injectés, tous détectés.

### Corrigé

- **Le nom du fichier téléchargé n'était pas dans le même fuseau que la date annoncée.** Il venait de
  `today()`, une coupe UTC, quand la card affichait l'heure locale. Entre minuit et deux heures du
  matin l'été, une heure l'hiver, le fichier portait la veille pendant que la card annonçait le jour
  même. Mesuré : export à 00 h 30 le 16 juillet, fichier `palier-2026-07-15.json`, card « le
  16/07/26 ».
- **L'en-tête fermé de la card Données comptait en tranches de 86 400 s et non en jours civils.** Un
  export fait la veille à 20 h se lisait « aujourd'hui » le lendemain matin à 8 h, au-dessus d'une
  ligne qui affichait la veille. Le défaut mordait sur l'usage même que la card sert, vérifier d'un
  coup d'oeil que la sauvegarde du jour est faite.
- **`weekCounts` découpait le même instant de deux façons sur la même ligne**, la semaine ISO par les
  accesseurs locaux et la clé du jour par une coupe UTC. Même correction sur `activeDays` et sur le
  cumul mensuel de temps. Sans effet sur des séances jouées entre 8 h et 20 h, où les deux découpages
  coïncident à Bruxelles.

### Non retenu

- **La cible de répétitions sur l'écran de repos**, demandée en même temps que les séries du jour.
  L'argument matériel est du côté de la charge, écartée en v2.2 : porter la moitié faible de la
  prescription en retenant la moitié forte aurait été incohérent. Deux mesures achèvent : 34 % des
  emplacements tirés sont unilatéraux, où un nombre nu ment d'un facteur deux, et 10 % sont des
  tenues, où il est ambigu entre répétitions et secondes.
- **La dernière fois quand rien n'a été fait du jour.** Arbitrage tranché par Gabriel : la vignette
  ne porte que le jour, elle reste nue avant le premier passage.

---

## v2.5 — 30 août 2026

Escalier des mollets. Un exercice qui plafonnait sans marche suivante devient une chaîne de quatre
échelons, et le verrou apprend à lire une charge. L'empreinte de neutralité diverge sur **une seule
ligne des 206**, le décalage d'index de `step-ups` dans le vivier jambes : à verrous fermés, les
cinq exercices tirés, leurs cibles, leurs charges, les durées annoncées et les remontages sont
identiques à la v2.4.

### Retiré

- **Les cinq relèvements de fourchette des mollets debout.** Le plafond était à 30 pour une
  fourchette 12-25, ce qui fabriquait 12-25, 13-26, 14-27, 15-28, 16-29, 17-30, soit six marches
  affichées dont cinq n'étaient une progression pour personne. Ce n'était pas une décision prise sur
  les mollets, c'était le seul levier qui restait au moteur faute d'échelle branchée. Le plafond
  vaut désormais le haut de fourchette, comme la planche et le gainage latéral.
- **La marche suivante écrite en v1.2**, « passe sur une jambe, puis un haltère en main côté
  travaillant ». Elle est outillée, elle n'a plus à être une phrase.

### Corrigé

- **L'écrêtage de fourchette à la migration ne ramenait que le haut.** Une fourchette 13-26 héritée
  devenait 13-25, que l'échelle ne reconnaît pas davantage que 13-26 puisqu'elle n'a qu'une marche.
  Un relèvement fait monter les deux bornes ensemble, donc les deux doivent redescendre : la
  fourchette revient entière à sa base. Sans effet sur les deux planches, dont l'ancien écrêtage
  donnait déjà le même résultat.
- **La fiche des mollets debout décrivait un geste au sol**, « talons au sol », et sa ligne de
  vigilance disait « simple et sans risque ». Elle décrit maintenant l'avant-pied sur l'arête d'une
  marche et la descente du talon sous ce niveau, avec la hauteur utile et son critère de calibrage.

### Ajouté

- **Quatre échelons de mollets**, chacun retirant son prédécesseur, donc **cinq entrées tirables**
  dans le vivier jambes quel que soit l'état des verrous : `mollets-debout` 12-25, plafond 25 ;
  `mollets-debout-leste` 12-25 sur l'échelle du sac ; `mollets-une-jambe` 8-15, plafond 15 ;
  `mollets-une-jambe-leste` 8-15 sur la même échelle. Trois fiches, trois verrous, trois entrées
  dans `SLOTS`, `SCHEMA`, `MAT`, deux dans `NEEDS` et `SUBS`.
- **`masseMobilisable`**, qui somme disques, barres, kettlebells et lestes, chaque famille restant
  soumise à son drapeau de présence. Une fonction, trois emplois : décider si la position est
  servie, engendrer les barreaux, fixer le plafond.
- **La clé de ressource dérivée `masse`**, sans interrupteur à elle et sans entrée dans l'inventaire.
  Le sac à dos n'est pas déclaré, il est toujours sous la main ; ce que l'exercice exige, c'est du
  poids à mettre dedans, d'où qu'il vienne. Une kettlebell de 10 kg suffit donc au premier barreau,
  ce qu'un besoin en haltères aurait interdit.
- **L'échelle du sac**, des multiples de 10 kg bornés par la masse déclarée. 10/20/30/40 pour
  l'inventaire courant, un seul barreau à 10 kg déclarés, vide en dessous. Aucun plafond posé.
- **Une condition de charge sur les verrous**, champ `loadTop`. Un verrou ne savait lire qu'un
  compte de répétitions, si bien qu'un successeur posé derrière un exercice à charge s'ouvrait au
  premier barreau et retirait son prédécesseur avant qu'il ait servi. La charge exigée est le
  dernier barreau de l'échelle **disponible**, à l'inverse de `bandGate` qui lit l'échelle entière :
  l'exercice ouvert ici ne demande aucun matériel, un seuil absolu y enfermerait un inventaire
  pauvre dans un état dont il ne pourrait plus sortir.
- **Trois illustrations neuves et une refaite**, banque de 49 à 52 images.
- **`test31.js`**, dix sections. Catalogue de 46 à 49 fiches, 31 suites au build.

### Non fait, et pourquoi

- **Le sac à dos ne devient pas une ressource déclarable.** Le critère du carnet ne retient une
  ressource que si l'exercice exige une garantie que le mobilier courant n'offre pas. Un sac est
  toujours disponible, même registre que la chaise.
- **La marche n'est ni une ressource ni un exercice séparé.** L'outil ne suit l'amplitude nulle
  part, ni la profondeur de squat ni celle des pompes, et la marche suivante du tirage en suspension
  est déjà une amplitude non outillée. Elle vit dans la fiche. La chaîne `SUBS` résout une position
  qui ne peut pas être servie, pas une exécution dégradée : sans rebord les mollets se font quand
  même, sans marchepied un step-up ne se fait pas du tout.

---

## v2.4 — 30 août 2026

Lot double : deux illustrations de nuque, et la progression par exercice sur les fiches. Le moteur
n'est pas touché, l'empreinte de neutralité est identique à la v2.3 sur ses 206 lignes, donc à
inventaire égal le tirage, les prescriptions, les durées annoncées et les remontages ne bougent pas.

### Corrigé

- **L'étape d'échauffement partageait son illustration avec l'étirement de nuque.** Les deux gestes
  n'ont rien de commun, balayage continu du menton d'une épaule à l'autre d'un côté, inclinaison
  latérale tenue 20 s de l'autre. Le titre disait « rotations », la consigne décrivait des
  demi-cercles, et le geste a été mal exécuté pendant des semaines : quand l'illustration contredit
  le texte, c'est l'illustration qui est lue. Illustration dédiée `echauf-nuque`, nouvelle clé.
- **Le libellé de l'étape est passé de « Rotations de nuque très douces » à « Demi-cercles de
  nuque ».** Une rotation de nuque désigne habituellement le fait de tourner la tête pour regarder
  par-dessus l'épaule, ce qui n'est pas le geste demandé. Corriger l'image sans corriger le mot
  aurait laissé la moitié du piège en place. La durée et la consigne ne bougent pas.
- **L'ancienne `etir-nuque` n'illustrait pas non plus son propre exercice** : personnage debout,
  tête droite, haltère en main, probablement dérivé du champ `mus:'Cou, trapèzes'` lu comme des
  haussements d'épaules. Elle est remplacée, la clé reste la même.
- **La consigne de l'étirement passe en version assistée.** Le texte promettait déjà une « traction
  très douce », or une traction suppose une main et le seul poids de la tête ne tire presque rien.
  L'assistance résout une incohérence préexistante, elle n'ajoute pas une exigence ; la ligne de
  vigilance couvrait déjà le risque.
- **Deux numéros de version faux dans les commentaires d'`app7.js`**, l'en-tête du bloc et la note
  sur `it.rng`, tous deux datés v2.2 alors que le code entre en v2.4.
- **`imgdata.js` était revenu à deux lignes** : l'insertion à la main de la nouvelle clé avait
  introduit un saut de ligne au milieu de l'objet JSON. Le script d'insertion documenté le
  renormalise, la banque redevient une seule ligne suivie de ses deux sauts de ligne.

### Ajouté

- **Trois blocs repliés sur la fiche exercice**, tous en lecture pure sur `state.hist`.
  *Où j'en suis* : barreau courant, position chiffrée sur l'échelle, marche suivante et sa condition
  de déclenchement écrite dans les termes exacts d'`applyProgress`. La fenêtre montre trois marches
  de chaque côté et non l'échelle entière : celle des haltères en compte 26, les afficher toutes
  noyait la position qu'elles servaient à montrer.
  *Progression* : le chemin des paliers, entier et jamais tronqué, montées et descentes distinguées,
  puis les passages, trois visibles et douze au maximum via un bouton. Les passages portent leurs
  marqueurs, allégée, quittée, partielle. Les séances où l'exercice a été remplacé par son repli
  apparaissent en ligne grisée cliquable à leur date.
  *Verrou* : les deux sens, ce qui bloque l'exercice avec l'état à la dernière séance, variante
  `bandGate` comprise, et ce qu'il ouvre, avec la mention du remplacement en rotation.
- **`it.rng`, seul champ ajouté au modèle de données.** La fourchette des dix-huit exercices dont le
  palier est la fourchette n'était écrite nulle part et n'est pas rejouable a posteriori, la montée
  dépendant de `full`, de la grâce post-montée et du palier tenu, dont aucun n'est historisé.
  Écriture conditionnée à `!e.bnd && (mode bw ou time)`, les autres ayant déjà `load` ou `band`.
  Conséquence assumée : pour ces exercices le chemin des paliers démarre à la première séance
  suivant la mise à jour, sans reconstitution, et un message le dit sur les fiches concernées.
- **`test30.js`, trentième suite**, quinze sections. Ajoutée à la boucle de `build.sh`.
- **Banque à 49 images.** Les deux nouvelles sont passées par `prep_illus.py` comme le reste :
  720 px de large, qualité 86, table de quantification identique aux 47 autres.

---

## v2.3 — 28 août 2026

Correctif isolé, remonté par le test local : le bandeau de bienvenue revenait à chaque
rafraîchissement de page malgré la validation du matériel. Le moteur n'est pas touché, l'empreinte
de neutralité est identique à la v2.2 sur ses 206 lignes.

### Corrigé

- **Le drapeau d'onboarding ne survivait pas à un rechargement.** `validGear()` retirait la clé par
  `delete`, or `loadState` et `applyImport` reconstruisent l'état par `Object.assign(defaultState(),
  objet_lu)` et `defaultState` pose le drapeau à `true` : une clé supprimée est indiscernable d'une
  clé jamais écrite, donc le `true` gagnait à chaque lecture. La validation écrit désormais `false`,
  et une sonde de forme dans `migrateState` abaisse le drapeau quand l'objet brut ne le porte pas.
  Mesuré avant correction sur les quatre situations, bandeau présent dans les quatre : rechargement
  après validation, sauvegarde antérieure à la v2.0, import d'un export réalisé après validation, et
  état neuf où il est légitime. Après correction, bandeau présent sur le seul état neuf.
- **Un import de sauvegarde recevait un onboarding**, en contradiction avec la règle écrite en v2.0.
  Même cause, même correctif. Une sauvegarde exportée pendant l'onboarding conserve en revanche son
  drapeau à `true`, ce qui est le comportement voulu : son inventaire n'a pas été déclaré.
- **La section 1 de `test27.js` manquait le défaut de deux façons.** Elle vérifiait le retrait du
  drapeau en mémoire sans jamais relire l'état, et son contrôle « jamais créé par une migration »
  fabriquait son sujet à la main avec le `delete` que `loadState` ne fait pas. Elle joue désormais un
  aller-retour par le stockage après validation, met `loadState` et `applyImport` à l'épreuve sur une
  sauvegarde ancienne et sur un export réel, et vérifie les deux sens du drapeau à l'export.
  Témoin joué : la suite amendée tombe sur la build non corrigée.
- **Le helper `domicile` des vingt-neuf suites et de `neutre.js`** retirait le drapeau par `delete`,
  geste que l'application ne fait plus. Aligné sur `state.onboard=false`. Sans cet alignement,
  `test23.js` tombait sur son contrôle d'idempotence de la migration v1.18, artefact de test et non
  défaut applicatif.

---

## v2.2 — 28 août 2026

Lot d'affichage, ouvert par quatre retours de test local et par un audit externe. Le moteur n'est
pas touché : l'empreinte de neutralité est identique à la v2.1 sur ses 206 lignes, donc à inventaire
égal le tirage, les prescriptions, les durées annoncées et les remontages ne bougent pas.

### Retiré

- **Le badge `mob5` « Souplesse assumée ».** Son prédicat lisait `type==='mobilite'`, or toute
  séance s'écrit `type:'alterne'` depuis le retrait du mode ciblé en v1.18. Il était inatteignable
  et pesait quand même dans le dénominateur affiché.

### Corrigé

- **Le plafond de la liste des dernières séances était muet.** Douze séances étaient listées sans
  que rien ne le dise. La card l'annonce, et le texte comme la coupe lisent `HIST_SHOWN`.
- **Le format décimal de Progrès.** Deux formateurs portent déjà la virgule, `fmtNum` et `fmtDur` ;
  trois points d'affichage les contournaient et rendaient un point, les rails de couverture, la
  moyenne de jours actifs et le ratio tiré/poussé.
- **Les annotations de taille de `PALIER-code.md`** étaient périmées sur les huit blocs qui en
  portaient. Le document est régénéré depuis les sources et le round-trip est vérifié dans les deux
  sens.

### Ajouté

- **Avancement des badges non acquis**, « 3/5 » à côté de la ligne grisée. Le critère de sélection
  est mécanique : un badge porte un compteur s'il déclare une fonction `prog` et un seuil d'au moins
  deux. Huit badges sur douze en portent ; les quatre autres sont à seuil 1 ou à prédicat booléen,
  où « 0/1 » ne dirait rien de plus que la ligne grisée. Le compteur est borné au seuil dans les
  deux sens et disparaît dès le badge posé.
- **Badge `w12` « Trimestre tenu »**, douze semaines validées d'affilée. Il prolonge l'échelle des
  semaines, qui s'arrêtait à un mois quand celle des séances va jusqu'à quarante.
- **Volume réellement joué** dans la card Couverture, sous la projection et dans la même fenêtre de
  semaines révolues. La projection nomme deux facteurs, les séries par exercice et les jours
  actifs ; le second est mesuré dans Assiduité, le premier ne l'était nulle part.
- **Vignette de l'exercice suivant sur l'écran de repos**, même empreinte que le détail de séance
  et la bibliothèque. Inerte, sans charge ni cible, et elle suit le repli douleur et le retour.
- **`test29.js`**, vingt-neuvième suite, huit sections.

---

## v2.1 — 26 août 2026

Retours du test local de la v2.0, plus quatre chantiers de la file d'attente livrés ensemble :
kettlebells multi-poids, fentes arrière lestées, micro-paliers du bas d'échelle haltères et
changement de volume en cours de séance. La v2.0 n'ayant jamais été déployée, la v2.1 est ce qui
part en production.

### Retiré

- **Le barreau de 3,25 kg** quitte l'échelle complète des haltères. Il demandait 1,25 kg d'écart
  entre les deux manchons, au-delà de ce que le nouveau critère tolère. C'est le seul barreau perdu.
- **Les verrous à une seule série.** Le soulevé roumain et les swings étaient les deux derniers du
  catalogue à s'ouvrir sur une série isolée.
- **L'interrupteur de la kettlebell dans le bloc plat** de la card Matériel, remplacé par une
  section à part entière.
- **La copie automatique de l'inventaire** à la création d'un profil.
- **La mention « Pompes sur poignées »**, l'exercice reprenant son nom de « Pompes ».

### Corrigé

- **Onboarding → card Matériel.** Le mécanisme existait déjà mais `go()` remontait en haut de page
  après son propre rendu, annulant le trajet déclenché depuis `renderSettings`. Le trajet passe
  désormais après. La card s'ouvrait bien, elle n'était simplement pas atteinte.
- **Les poignées de pompes** étaient le seul libellé de « matériel à sortir » de tout le catalogue
  qui ne renvoyait ni à une ressource déclarable ni au mobilier supposé présent. Elles deviennent
  explicitement facultatives, la fiche mentionnant les mains au sol en premier.
- **La marche suivante des exercices à kettlebell** était écrite comme un fait, « plafond du
  matériel actuel », alors que le matériel est déclaré depuis la v2.0. Elle se compose maintenant
  depuis l'inventaire et ne redevient une impasse qu'une fois la liste des poids épuisée.
- **Deux assertions héritées** épinglaient une forme périmée : `test8` comparait au gabarit d'un
  énoncé de verrou plutôt qu'à sa forme rendue, `test18` épinglait l'ouverture à une seule série.

### Ajouté

- **Kettlebells multi-poids**, liste fermée à 8, 10, 12, 14, 16 et 20 kg, un exemplaire à l'ajout.
  Les lestes ne comblent que l'intervalle jusqu'à la kettlebell possédée suivante et prolongent
  librement au-delà de la plus lourde : chaque total est tenu par un seul montage, toujours la
  kettlebell la plus lourde disponible. Avec la seule kettlebell de 10 kg, l'échelle est inchangée.
- **Plafond de charge dérivé** pour les swings, égal au niveau courant du soulevé roumain.
- **Fentes arrière lestées**, successeur des fentes au poids du corps sur le motif de l'escalier de
  gainage : le successeur retire son prédécesseur du tirage, le vivier jambes garde cinq entrées
  tirables dans les deux états de verrou. Verrou à deux séries de 18 par côté, chaîne de
  substitution vers le poids du corps sans haltères, illustration, banque à 48 images, catalogue
  à 46 fiches.
- **Micro-paliers du bas d'échelle.** L'échelle de progression gagne 2,5 et 3,5 kg et reste
  identique au-dessus de 4 kg. Le critère de montage devient l'écart entre les deux manchons, borné
  au plus petit disque déclaré.
- **Changement de volume en cours de séance**, plancher à deux séries, montée bornée au volume
  lancé plus une. Les étapes restantes sont recomposées, la durée annoncée et le volume prévu
  suivent, les séries déjà jouées ne bougent pas.
- **Interrupteur de présence sur les quatre sections** de la card Matériel. Il masque sans
  détruire : l'éteindre puis le rallumer rend exactement ce qui était déclaré. Il ne s'affiche pas
  sur une section vide, et déclarer ou retirer le dernier élément le lève ou le baisse.
- **Profil neuf vide**, avec copie explicite d'un profil existant proposée à la création.
- **`test28.js`**, vingt-huitième suite, douze sections.

---

## v2.0 — 25 août 2026

Chantier matériel : l'outil cesse de supposer qu'on s'entraîne toujours au même endroit. Quatre lots,
intégrité des données, catalogue, résolveur, profils, puis un lot de clôture qui rend l'inventaire
déclarable et lisible. Rien de tout cela n'a été déployé avant la clôture : la version reste 2.0,
les corrections apportées au cours du chantier ne sont pas des régressions d'une version publiée.

### Intégrité des données

**Retiré**
- `normalizeBands`, et la boucle d'écriture de `toggleCuff` sur `perf`. L'inventaire n'écrit plus
  jamais dans la progression.

**Corrigé**
- Deux pertes de données définitives. Décocher puis recocher une bande ou une paire de lestes
  faisait perdre son barreau et son meilleur de bande à l'exercice, sans retour possible. Mesuré
  avec témoin sur trois états : quatre exercices sur dix touchés sur la sauvegarde du 22 août.
- Le meilleur de bande et le record étaient écrits pendant une séance allégée, et la branche
  `bandGate` de `checkUnlocks` lisait le meilleur de bande sans garde de provenance là où la
  branche normale en avait une. Conséquence mesurée avec témoin : les deux verrous de tractions
  strictes s'ouvraient sur des répétitions faites avec plus d'assistance.

**Corrigé (hors brief, raison nouvelle relevée en cours de chantier)**
- Les montées de charge d'haltères empruntaient des paliers de 0,25 kg qui sont des collisions
  entre deux familles de montage et non des paliers décidés. Le cliquet monte désormais sur les
  seuls montages symétriques. Mesuré : de 6 à 10 kg au développé au sol, quarante-cinq semaines
  deviennent trente ; les écarts relatifs se resserrent de 12,5 % à 3,8 % au lieu d'osciller.

**Ajouté**
- `loadLadderProg`, `loadLadderMonoProg` et `nextLoadProg`. `ladderBuild` produit les deux échelles
  d'un seul parcours. L'ajustement manuel et la réduction de la séance allégée gardent l'échelle
  complète.
- Bornage matériel à la lecture. `bandOrder` porte l'ordre de difficulté, indépendant de tout
  inventaire ; `bandLadder` en est le filtre ; `bandBorne` et `loadBorne` rendent le niveau
  disponible le plus difficile qui ne dépasse pas le niveau canonique.
- `gearPerf` et `prescLoad`. `perfFor` rend désormais toujours une copie bornée, y compris hors
  mode allégé, et l'allègement se calcule sur la vue bornée. Le matériel à sortir et le comptage
  des remontages lisent la charge réellement montable.
- Troisième régime de provenance, marqueur `unqualSets` sur le modèle de `lightSets`. Les gardes
  sont appliquées après les branches de `checkUnlocks`, et les écritures de record et de meilleur
  de bande sont passées sous la sortie de régime d'`applyProgress`.
- `test24.js`, suite du lot intégrité : équivalence de la réécriture d'échelle sur 64 inventaires,
  1 116 cas de bornage vérifiés, aller-retour d'inventaire à égalité stricte de `perf`, témoin de
  contamination, et preuve que les verrous s'ouvrent toujours quand ils le doivent.

**Vérifié**
- Neutralité sous inventaire unique : empreinte canonique de 270 tirages, trois états de verrous
  croisés avec trois volumes, prescriptions, durées annoncées, remontages, matériel à sortir et
  panneaux à venir, identique au caractère près à la v1.18. Tenue à chaque étape du chantier.

### Catalogue

**Ajouté**
- Six substituts matériels illustrés : rétraction d'omoplates au sol, écartement à l'élastique,
  tirage vertical à l'élastique, élévations latérales à l'élastique, curls à l'élastique, soulevé de
  terre roumain à l'élastique. Ils vivent hors des viviers, sans verrou ni retrait.
- `step-ups-bas`, la version basse ré-cléfée, désormais repli douleur des step-ups et des fentes
  arrière, et substitut matériel de la position montée sur marche.
- Consigne commune de position portée par les neuf exercices à bande, via une constante unique et
  un drapeau. La rétraction d'omoplates en est exclue : elle n'utilise aucun élastique.
- Table de substitution `SUBS`, indexée par position et non par identifiant, et carte `SCHEMA` des
  schémas moteurs. Lien inverse « substitut de » dans la fiche et la bibliothèque.

**Modifié**
- Fiche des step-ups réécrite pour le marchepied à hauteur de genou. Elle annonçait encore une
  marche basse et se décrivait comme un repli genoux, ce qui est faux depuis le changement de
  matériel. Nouvelle vigilance sur la triche par poussée du pied resté au sol.
- Banque d'images : sept entrées nouvelles, la corde à sauter retirée, 47 au total.

### Résolution matérielle

**Ajouté**
- Neuf ressources déclarables, une table `NEEDS` des besoins par exercice, et le résolveur de
  position : quand l'exercice de référence n'est pas servi, la position descend sa chaîne jusqu'au
  premier substitut réalisable, sans état, recalculé à chaque tirage.
- Rotation étendue : la grille des positions est filtrée par les verrous, les retraits et la
  résolution, et le compteur indexe la grille filtrée sans jamais être déplacé par elle.

**Vérifié**
- 36 864 combinaisons, soit 256 inventaires × 2 états d'élastique × 72 états de verrous atteignables,
  ce dernier nombre étant dérivé des dépendances entre verrous et non posé. Aucun groupe vide.
  Monotonie tenue : rendre une ressource ne retire jamais une position.
- Le profil sans rien perd sept schémas et sert les quatre groupes.

### Profils

**Ajouté**
- Deux à trois profils nommés, dont le domicile qui ne se supprime pas. Bascule manuelle, aucune
  expiration automatique. Bandeau permanent hors du domicile avec retour à un geste et liste repliée
  des schémas non servis.
- Réalisation de niveau par profil : le niveau porte une clé stable, le profil déclare l'objet
  concret qui le tient. Les libellés nomment ce que l'utilisateur a sous la main.
- Éditeur d'inventaire avec les neuf ressources et le compte calculé des schémas perdus.
- Troisième régime de provenance appliqué : une lecture bornée par le matériel enregistre ses séries
  et sa date, et ne fait rien d'autre.

**Retiré**
- Le garde-fou « au moins une bande ». Il n'existait que parce que l'inventaire détruisait la
  progression. Un profil sans aucun élastique est un cas nommé et servi.
- Les poignées de pompes comme ressource : elles ne changent pas ce que l'exercice sollicite.

### Onboarding et card Matériel

**Retiré**
- Les trois `prompt()` et les cinq `confirm()` du système. Nommer un profil passe par un champ dans
  la page, lu au clic et jamais au rendu ; supprimer un profil, tout réinitialiser et quitter une
  séance passent par une question à deux temps qui nomme sa conséquence. La réinitialisation posait
  deux dialogues enchaînés, elle n'en pose plus qu'un : répéter la question ne protège de rien,
  c'est la formulation de la conséquence qui protège.
- Tous les boutons dont l'état est un mot, « Présent », « Absent », « Possédée », ainsi que le mode
  « Modifier l'échelle » et le bouton « Nommer ».

**Ajouté**
- `EMPTY_GEAR` et le drapeau `onboard`. L'état neuf part d'un inventaire vide, et le bandeau
  d'accueil, conditionné à l'historique vide depuis la v1.18, l'est désormais au drapeau. Il n'est
  jamais créé par une migration : un import de sauvegarde n'a pas d'onboarding. Il survit aux
  enregistrements intermédiaires et au rechargement, et disparaît par le bouton « Valider mon
  matériel », qui ne verrouille rien. Une carte vide est validable, un inventaire nul servant les
  quatre groupes et onze schémas moteurs sur dix-huit.
- Card Matériel refondue. Chip du profil en tête, une section repliable par ressource avec le
  chevron des autres cards, interrupteurs, pastilles de couleur et couples moins-plus alignés dans
  une seule colonne de contrôles. Trois composants CSS nouveaux, tous de 42 px de large pour que la
  colonne reste régulière du haut en bas.
- Ajout dynamique de types de disques, menu fermé de huit poids de 0,5 à 10 kg, seuls les types
  absents étant proposés. Un type entre à quatre exemplaires : mesuré, à deux il ne produit aucun
  montage symétrique et laisse l'échelle de progression inchangée à 23 paliers, là où quatre la
  portent à 30. Un type retombé à zéro quitte la liste et redevient proposable.
- Compteur de progressions disponibles en pied de card, à côté du compte de schémas servis qui
  quitte la card Profil actif pour le rejoindre. Parmi les exercices tirables dont l'échelle dépend
  du matériel, paliers tenus exclus, ceux qui ont un barreau au-dessus de leur niveau canonique et
  dont la prescription n'est pas bornée. Mesuré : 9 sur 9 à domicile, 6 sur 9 sous un profil à la
  verte seule, 0 sur 1 sur un inventaire vide.
- Ancre de navigation : le bandeau d'onboarding ouvre la card Matériel et défile jusqu'à elle.

### Échelle de niveaux

**Ajouté**
- Sixième niveau d'élastique, fourchette 125 à 170 lbs, clé opaque `n6`. Les cinq clés existantes ne
  bougent pas, `perf` et `hist` continuent de les référencer. En résistance il ajoute un barreau au
  sommet, en assistance une entrée plus facile en bas de difficulté. Le verrou des tractions
  strictes n'est pas touché : le jaune reste par construction le dernier barreau de l'échelle
  d'assistance.
- Nuancier fermé de douze couleurs. La réalisation d'un niveau se choisit sur une pastille au lieu
  de se saisir au clavier, ce qui supprime d'un même geste le nommage libre et le piège de la chaîne
  vide. Doublon de couleur autorisé entre niveaux d'un même profil, levé à l'affichage quand il est
  effectif : « bande bleue, niveau 4 ».
- `bandNom`, `bandRang`, `bandDouble` et `bandRange`. Le libellé principal d'un niveau devient sa
  fourchette de tension, le numéro et la couleur passant en secondaire.

**Corrigé**
- Six points affichaient la clé du niveau en clair au lieu de la réalisation : message de montée en
  résistance, matériel à sortir en trois endroits, ligne d'exercice du carrousel, trajectoire des
  charges. La trajectoire porte désormais la fourchette de tension, seule identité stable d'un
  niveau d'un profil à l'autre.
- Les clés de niveau étant masculines, les libellés produisaient « bande noir ». Le nuancier porte
  la forme accordée.
- La pastille de prescription peignait la couleur du niveau et non celle de la réalisation, et son
  liseré était trop pâle pour faire tenir une blanche en thème clair et une noire en thème sombre.

### Matériel déclarable

**Ajouté**
- Troisième paire de lestes, 0,5 kg. `cuffSteps` se généralise aux sommes de sous-ensembles des
  paires possédées : 0 à 3,5 kg par membre à inventaire complet, 0 à 7 kg par pas de 1 sur deux
  membres. Goblet squat, soulevé roumain et swings passent de 4 à 8 barreaux, sommet de 16 à 17 kg.
  Conséquence assumée : le cliquet devient deux fois plus fin sur ces trois exercices.
- Marche basse, neuvième ressource déclarable, `NEEDS['step-ups-bas']`. Le critère de déclaration
  n'est plus le transport mais l'exigence : le step-up bas demande un appui stable sous le poids du
  corps, là où l'étirement des ischios se contente de tout ce qui est surélevé. Présente par défaut
  pour toute sauvegarde existante, décochée à l'inventaire neuf, et la sonde de migration distingue
  le champ absent du champ à zéro pour ne pas rallumer une absence déclarée.
- `fmtNum`, formateur unique de nombre. Les libellés des échelles fixes concaténaient la valeur
  brute et auraient affiché « lestes 1.5 kg ».

**Corrigé**
- Le chemin des replis douleur, antérieur au résolveur, ne consultait pas l'inventaire. Trois
  couples étaient déjà dans ce cas indépendamment de la marche basse : les élévations latérales
  repliaient vers le tirage doux, le rowing kettlebell et le tirage en suspension vers le rowing
  élastique, tous trois à élastique. Sans élastique, le geste de protection proposait un exercice
  impossible. `fbOf` filtre les deux chemins qui lisent `fb`, le bouton de douleur et la
  substitution de la séance allégée.
- La branche `bandGate` de `checkUnlocks` lisait le dernier barreau de l'échelle filtrée par
  l'inventaire actif, règle 4 du brief non tenue par la première écriture du chantier. Témoin
  mesuré : sous un profil ne possédant que la verte, dix répétitions avec l'assistance maximale
  ouvraient les deux verrous. Elle lit désormais l'échelle entière, et l'énoncé affiché dit « ton
  élastique le plus fin ».

### Divers

**Corrigé**
- `test6.js` ancrait ses dates au lundi à midi alors que `weeksElapsed` compare à `Date.now()` :
  lancé avant midi, le build échouait. Défaut antérieur au chantier, reproduit sur la v1.18 non
  modifiée. Ancre déplacée à minuit.
- `const VERSION` vivait dans `imgdata.js`, que le script de régénération de la banque réécrit en
  entier : la première régénération l'aurait effacée sans bruit. Elle passe en tête d'`app1.js`.

**Ajouté**
- Quatre suites de tests, `test24.js` intégrité, `test25.js` résolveur, `test26.js` profils,
  `test27.js` clôture. Le build en enchaîne vingt-sept.
- `neutre.js`, empreinte de neutralité hors build : 206 relevés de tirages, prescriptions, durées
  annoncées, remontages et échelles, à inventaire égal, comparés d'une étape du chantier à l'autre.

**Modifié**
- Les vingt-trois suites héritées partaient de `defaultState`, donc d'un inventaire vide une fois
  l'onboarding posé : quatorze tombaient. Aucune ne révélait un défaut applicatif, toutes
  supposaient implicitement le domicile sans le dire. Elles l'ancrent désormais explicitement à
  chaque rechargement d'état, sauf les sections qui rejouent une sauvegarde fabriquée.

---

## v1.18 — 22 août 2026

Version qui retire un mode et ouvre la rotation. Le mode ciblé livrait trois séries par groupe et
par semaine à un objectif de quatre séances, là où l'alterné en livre douze, sur une table figée de
douze exercices qui ignorait tout ce que le catalogue a gagné depuis, sans filtre de retrait, sans
cardio ni étirements. Il n'avait jamais été utilisé. Le bouton « Changer de séance » partait avec :
mesuré, son usage neutre ne produisait qu'un déphasage sans valeur, et son seul usage efficace,
sauter systématiquement un exercice, affamait des exercices d'autres viviers sans qu'aucun
instrument ne le voie. En échange, le détail de séance devient un carrousel : la séance du jour,
puis les tirages à venir.

**Retiré**

- **Le mode ciblé**, en entier : `SESSIONS`, `CIBLE_ORDER`, `setMode`, la card Réglages « Structure
  de séance », la branche ciblée de `buildSession`, de `sessionSpan`, de `weeklySets` et de
  `covProjection`, et l'en-tête de séance qui nommait le groupe. `STRETCH_POOL` en dérivait, il est
  désormais posé en clair : le retrait aurait sinon emporté les étirements de fin de séance.
- **Le bouton « Changer de séance »** et sa fonction `skipType`.
- **Le réglage de repos chronométré** et sa fonction `setRest` : `state.rest` ne servait qu'aux
  séries d'un même exercice du mode ciblé. La card Repos devient la card Transition et ne porte
  plus que le temps inerte du circuit alterné.
- **Trois champs d'état devenus orphelins**, supprimés à la migration comme le fossile
  `version: '1.0'` de la v1.16 : `mode`, `cibleIdx`, `rest`. Les entrées d'historique gardent en
  revanche leur `mode`, qui dit sous quel régime elles ont été jouées.
- **Le mot « Alternée » sur chaque ligne de l'historique.** Avec un mode unique, il devient
  constant, donc du bruit. La ligne ne porte plus que ce qui distingue : « allégée » le cas
  échéant, et « Ciblée » pour une entrée ancienne relue depuis un fichier importé.

**Ajouté**

- **Carrousel dans le détail de séance.** Premier panneau, la séance du jour, inchangé. Suivants,
  les tirages à venir : intitulé, niveau actuel, matériel à sortir, exercices et remontage de
  charge. Autant de panneaux que le plus gros vivier, ce qui garantit que chaque exercice tirable
  figure au moins une fois dans la fenêtre, vérifié sur les 210 positions de départ possibles.
- **`drawAhead`, `pickAt` et `aheadCount`** : lecture seule de la rotation à n séances d'ici, sans
  repli ni ajustement du jour.
- **Encart de niveau** sur chaque panneau à venir, en tête et non en pied : « Cibles et charges à
  ton niveau actuel, avant séance du jour ». Géométrie de `vig`, couleur neutre, pour ne pas se
  confondre avec l'encart de remontage qui le suit parfois.
- **Jeton de couleur `--rail`** dans les deux thèmes, `#A8B9CD` en clair et `#405669` en sombre. Il
  sert à la barre latérale des panneaux à venir et au filet de l'encart de niveau : dans les deux
  cas il signifie « ceci concerne une séance à venir ».
- **Le barreau de bande sur la ligne d'exercice**, du panneau du jour comme des suivants. Il
  n'était que dans les chips de matériel, donc absent de l'endroit où l'on lit l'exercice.
- **Le volume hebdomadaire par groupe dans la card Séries par exercice**, où il se recalcule seul,
  et l'argument de la structure alternée dans la card du bas des réglages : les deux moitiés de la
  card Structure supprimée, chacune là où elle a un sens.
- **La card du bas des réglages réécrite en trois blocs intitulés** : ce que fait PALIER, comment
  les exercices sont choisis, pourquoi les séances sont alternées, puis la ligne de prudence et la
  version en gras. Elle ne présentait l'outil ni par ce qu'il fait ni par ce qu'il vise, elle
  ouvrait sur une décharge de responsabilité et une liste de contraintes physiques. Les contraintes
  y sont désormais un critère de sélection du catalogue, énoncé après la valeur, et non un
  préambule. Classe `lead` pour les intitulés, en couleur d'encre sur un corps gris.
- **Onze `aria-label`** : trois sur les boutons du carrousel, huit sur les steppers existants, qui
  n'avaient aucune étiquette. Pas de `title` : l'application n'en a jamais eu, et un survol n'existe
  pas sur écran tactile.
- **`test23.js`**, douze contrôles sur le retrait, la migration, la fenêtre du carrousel, le contenu
  des panneaux et les étiquettes.

**Corrigé**

- **La transition d'un panneau du carrousel au suivant.** Elle reposait sur le défilement lissé natif
  du navigateur, dont la durée n'est pas réglable : elle se calcule depuis la distance parcourue, et
  un panneau fait toute la largeur du conteneur. Il en résultait près d'une demi-seconde pendant
  laquelle deux panneaux étaient visibles côte à côte, ce qui se lisait comme un remplacement lent et
  non comme une page tournée. Le mouvement est désormais piloté, 200 ms en décélération cubique,
  l'accroche de défilement étant coupée le temps du trajet puis rendue à l'arrivée. Le balayage
  tactile n'est pas touché, il reste au navigateur.
- **`test2.js`** cherchait le mot « tours » dans le HTML de l'accueil. Avec vingt-quatre vignettes
  au lieu de quatre, la chaîne apparaît par hasard dans du base64 : la recherche se fait désormais
  hors données d'image.
- **La coupe entre `head.html` et `imgdata.js`** dans le document de code. La ligne marqueur
  `/* IMGDATA — const IMG={...} inséré ici */` contient `const IMG={`, sur lequel l'extraction
  automatique se calait : trente caractères de la ligne marqueur passaient dans `imgdata.js`. Sans
  effet sur le livrable assemblé, mais le bloc `head.html` du document était tronqué.

---

## v1.17 — 19 août 2026

Version qui ferme le cul-de-sac du gainage. Planche et gainage latéral avaient un plafond égal à
leur haut de fourchette : leur cible ne montait jamais au-delà, et aucune marche suivante n'était
outillée. La v1.15 avait constaté l'impasse sans la traiter, la v1.16 l'avait tranchée sur le
papier. Deux successeurs isométriques sont construits, chacun derrière un verrou, chacun retirant
son prédécesseur du tirage. Le plafond des tenues au sol descend en même temps de 60 à 45 s : une
tenue plus longue n'ajoute pas de stimulus, elle ajoute de la durée de séance, et le levier de
progression devient la variante, pas la seconde de plus.

**Retiré**

- **Le long lever plank comme marche suivante de la planche.** Le texte de plafond disait « avance
  les coudes de quelques centimètres ». Le repère anatomique règle bien la mesurabilité, mais
  l'avancée des coudes augmente la flexion d'épaule sur des épaules douloureuses. Écarté en v1.16
  avec sa raison, le texte disparaît ici.
- **Le plafond de 60 s sur planche et planche sur genoux.** Ramené à 45 s, avec migration de la
  fourchette et de la cible stockées : la copie dans `perf` est écrite une fois à la création de
  l'exercice et ne se corrige pas seule.
- **Les pictogrammes vectoriels de repli prévus pour les deux nouveaux exercices**, et avec eux la
  forme ballon dans `propSvg`. Le plan les prévoyait tant que les illustrations n'existaient pas.
  Elles existent, `figFor` ne retombera jamais dessus, et les trois exercices déjà ajoutés par
  `app3.js` n'en portent pas non plus. Du code mort n'est pas une fonctionnalité.

**Ajouté**

- **Planche sur ballon** (`planche-ballon`), tenue de 15 à 45 s, avant-bras sur un swiss ball
  gonflé ferme. Verrouillée derrière deux séries de 45 s en planche au sol. L'instabilité remplace
  le levier : aucune flexion de colonne ajoutée.
- **Gainage latéral, jambe levée** (`gainage-lateral-jambe-levee`), tenue de 15 à 45 s par côté.
  Verrouillé derrière deux séries de 45 s en gainage latéral. Les tenues unilatérales enregistrent
  déjà le minimum des deux côtés, le verrou lit donc le côté faible sans mécanisme supplémentaire.
- **Retrait du prédécesseur du tirage** au déblocage de son successeur, par le champ `retire`
  existant depuis la v1.15, et **promotion du prédécesseur en repli douleur** du successeur. Chaque
  successeur est placé juste après son prédécesseur dans le vivier gainage : le vivier filtré vaut
  cinq entrées dans les quatre états de verrous, dans le même ordre. La substitution se fait sur
  place, l'intervalle entre deux passages de gainage ne bouge pas.
- **Deux textes de plafond pour les nouvelles marches**, stir the pot pour le ballon et leste de
  cheville pour la jambe levée, chacun disant explicitement que l'outil ne suit pas encore cette
  variante. Aucune échelle de charge n'est branchée sur `mode:'time'` : c'est la dette identifiée
  en v1.16, elle reste entière.
- **Les deux illustrations**, générées et post-traitées au format de la banque, qui passe de 39 à
  41 images. Contrôles à la réception : papier et orange conformes aux images existantes, ligne du
  corps droite à 4,8 px d'écart-type sur la planche sur ballon contre 3,8 px sur la planche au sol,
  écartement de la jambe levée mesuré à 33° au-dessus de l'horizontale, et corrélation entre
  panneaux nettement meilleure en direct qu'en miroir sur les deux images.
- **L'enveloppe `app` et `version` en tête du fichier exporté.** Elle était en fin de fichier parce
  que `Object.assign` copie dans l'ordre d'insertion et que la v1.16 l'avait déplacée après l'état,
  pour qu'une clé `version` traînant dans l'état n'écrase plus la vraie. Elle est désormais posée
  deux fois, avant l'état pour la position et après lui pour la valeur : les deux champs qu'on veut
  lire en premier ouvrent le fichier, sans rien perdre de la protection contre le fossile
  « version 1.0 ».
- **`test22.js`**, vingt-deuxième suite : plafonds, migration et son idempotence, énoncé et
  ouverture des deux verrous, côté faible, refus d'ouvrir sur une séance allégée, composition du
  vivier dans les quatre états, chaîne de replis, textes de plafond, matériel, banque à 41 images
  rendu des deux fiches et enveloppe en tête du fichier exporté.

---

## v1.16 — 18 août 2026

Version de mesure et de retour, sans aucun changement de comportement de progression. Elle répond
à trois demandes d'usage après les premières séances en v1.15 : ne plus avoir à se souvenir de ce
qu'on vient de faire d'une série à l'autre, avoir un récapitulatif qui dise autre chose que des XP,
et pouvoir enfin étalonner la constante d'installation. Cette dernière imposait un instrument qui
n'existait pas : la durée annoncée est calculée sur les cibles, donc la comparer au temps réel
mélange ce que le modèle représente mal avec les répétitions faites au-delà ou en deçà des cibles.
Vingt-deux mollets au lieu de quatorze déplacent le total de 84 secondes, soit 70 % de la constante
qu'on cherche à fixer.

**Retiré**

- **Les espaces autour du slash dans les listes de séries.** Ils coûtaient six caractères sur une
  liste de quatre valeurs sans rien séparer que le contraste ne sépare mieux. Le séparateur est
  désormais atténué et porte une micro-marge de `.12em`.
- **Les clés `app` et `version` de l'état.** Elles appartiennent à l'enveloppe du fichier exporté,
  pas aux données. `applyImport` les y faisait entrer, où elles écrasaient ensuite la vraie version
  à chaque export, `payload` assignant l'état par-dessus l'enveloppe.
- **Le style en ligne `font-size:1rem` de la pastille Dernière fois.** Remplacé par une classe, sans
  quoi la pastille suivante aurait rejoué le même défaut.

**Corrigé**

- **Le décalage de la pastille Dernière fois.** La taille de police était posée en style en ligne
  sans `line-height`, donc la boîte de ligne était plus courte que celle des deux autres pastilles ;
  les pastilles étant alignées par le haut, la valeur et son libellé remontaient tous les deux
  d'environ 5 px. Corrigé par une hauteur de boîte fixe en rem et un calage des libellés par le bas.
  Les deux propriétés sont nécessaires, l'une seule ne suffit pas.
- **La fourchette affichée sur l'écran de série.** Elle lisait `e.reps`, la fourchette du catalogue,
  alors que le cliquet de la v1.15 fait monter et descendre `p.range`. `applyProgress` pouvait donc
  annoncer « fourchette relevée à 8-16 » sur un écran qui continuait d'afficher 6-15. Un accesseur
  `rangeOf` remet la fourchette de la performance partout.
- **Le format des listes de séries, incohérent avec lui-même.** Six points d'affichage la
  produisaient à la main, quatre avec espaces et deux sans. Tous passent par `setsHtml`.
- **Le champ `version` des exports, faux depuis quinze versions.** Un export d'époque v1.0
  réimporté avait gravé `version:'1.0'` dans l'état, et tous les exports suivants le
  reproduisaient. L'enveloppe est désormais assignée après l'état, et la clé est retirée à la
  migration.
- **`applyImport` ne rejouait aucune migration.** Une sauvegarde ancienne réimportée revenait avec
  ses valeurs d'origine sans que rien ne le dise ; une sauvegarde antérieure à la v1.13 aurait perdu
  définitivement la conversion des durées en séries. Les migrations sont extraites dans
  `migrateState`, appelée par `loadState` et par `applyImport`.
- **L'annonce de durée stockée arrondie à la minute.** Trente secondes de bruit par séance sur un
  paramètre d'installation qui en pèse cent trente. `planSec` est stocké à la seconde, l'affichage
  reste à la minute.

**Ajouté**

- **Rappel des séries du jour en séance.** Une pastille « Aujourd'hui » apparaît dès la deuxième
  série et porte toutes les séries déjà faites, pas seulement la dernière : le moteur lit le
  minimum du passage pour la cible suivante et exige toutes les séries en haut de fourchette pour
  la montée, la série qui décide n'est donc pas forcément la dernière. En mode alterné, trois
  autres exercices séparent deux séries du même exercice.
- **La ligne Dernière fois descend sous les pastilles.** Jamais plus de trois pastilles, donc jamais
  de casse de ligne, et la hiérarchie de la cible et de la fourchette reste intacte.
- **Durée et volume au récapitulatif.** « 21 min pour 19 annoncées · 11 séries sur 12 ». Le tag
  « incomplète » disait qu'il manquait quelque chose sans dire combien.
- **Comparaison au passage précédent, exercice par exercice, au récapitulatif.** En gris sous les
  valeurs du jour, avec une marque explicite si ce passage était une séance allégée, ses cibles
  ayant été réduites de 30 %.
- **Modèle rejoué sur les valeurs saisies.** Chacune des six boucles à la seconde incrémente un
  compteur, et la part non chronométrée s'ajoute à la validation de chaque série, calculée sur la
  valeur saisie et non sur la cible. Stocké dans l'entrée d'historique.
- **Décomposition des durées dans la séance dépliée.** Annoncé, réel, écart, puis les deux termes
  qui le composent : ce que les répétitions ont ajouté, et ce que le modèle ne représente pas.
- **Écart moyen au modèle dans Progrès > Temps**, borné aux séances menées à leur terme.
- **`appVersion` écrite à chaque sauvegarde.** Les migrations futures se liront sur un numéro au
  lieu de se deviner à la forme des données.
- **`test21.js`**, vingt et unième suite, dont deux tests de bout en bout qui rejouent une séance
  complète en pilotant les six chronos.

---

## v1.15 — 18 août 2026

Version issue d'une enquête sur l'équilibre musculaire, menée en dix-huit tours de contre-audit
croisé. La question de départ portait sur le risque de développer un groupe plus qu'un autre. La
réponse est que le volume par schéma moteur est garanti par construction et n'a pas besoin d'être
surveillé, mais que l'enquête a mis au jour, chemin faisant, deux défauts du moteur de progression
sans rapport avec l'équilibre, et un seul déséquilibre réel : la fréquence des face pulls, qui
diminuait à mesure que les tractions se débloquaient.

**Retiré**

- **La constante `bas − 2` du filet de sécurité.** Elle laissait une bande morte de deux
  répétitions dans laquelle on pouvait rester indéfiniment sous sa propre fourchette sans que rien
  ne descende ni ne le signale. Elle disparaît sans remplacement, le critère devient un prédicat.
- **La lecture de `best` par les déblocages.** `best` est un maximum historique que l'outil ne sait
  pas corriger, et dont une valeur fausse a été constatée en usage réel. Les deux verrous de la
  chaîne postérieure lisent désormais le dernier passage.
- **Le comptage des passages au plafond dans le capteur de divergence.** Un exercice bloqué au
  dernier barreau incrémentait `state.div` à chaque passage, `monte && msgs.length` étant vrai même
  quand la montée échouait.

**Corrigé**

- **Le cliquet des fourchettes relevées**, sur neuf exercices au poids du corps. Une fourchette
  montée d'un cran de trop ne redescendait par aucun chemin, ni automatique ni manuel, le palier
  tenu figeant la cible sans rendre la fourchette. Elle redescend d'un pas, plancher à la
  fourchette d'origine, miroir exact de la montée.
- **Un verrou irréalisable au volume de 2 séries.** La pronation assistée exigeait trois séries de
  six, condition arithmétiquement impossible avec deux séries jouées. Le compte exigé est plafonné
  par le volume de la séance, et l'énoncé affiché suit par un jeton.
- **La file de célébrations comparait des nombres.** Un déblocage échangé contre un autre laissait
  le compte inchangé et le nouveau n'était jamais fêté. Elle compare des clés, comme le chemin des
  badges le faisait déjà.
- **Une séance allégée pouvait ouvrir un verrou.** Quatre des cinq sources de verrou ont une
  variante de repli et sont remplacées en allégé ; le soulevé roumain n'en a pas, il est joué à
  charge réduite, et son compte de répétitions alimentait le verrou du swing.
- **Les messages de progression ne nommaient pas l'exercice.** Deux messages de même forme dans un
  récapitulatif étaient indiscernables.
- **Une série pouvait être validée à zéro répétition.** Le bouton est inerte à zéro, « Passer »
  couvre déjà le cas.

**Ajouté**

- **Filet de sécurité en quatre cas à borne stricte.** Le critère se déplace de la série vers le
  passage : `[15, 15, 7]` descendait et ne descend plus, `[9, 9, 9]` ne descendait pas et descend.
  Ni assouplissement ni durcissement. Mesure décisive sur les sept premières séances réelles :
  quinze passages avec le maximum exactement au plancher, dont **dix sur une lecture exploitable**,
  les seules qu'une borne large aurait pu rétrograder ; les cinq autres relèvent d'une séance
  allégée ou quittée, qu'aucune borne n'aurait touchées. Et zéro passage sous le plancher, sur
  aucune lecture.
- **Grâce post-montée.** Le premier passage suivant une montée de barreau ne peut pas déclencher de
  descente. Elle n'est pas posée sur la fourchette relevée, où la cible monte au nouveau haut et non
  au nouveau bas : il n'y a pas de choc d'adaptation.
- **Deux signaux sans action.** « Aucune série au plancher » et « des séries sous le plancher »,
  émis même quand la descente est empêchée par la grâce, par une lecture partielle ou par l'absence
  de barreau inférieur. L'information passe toujours, l'action est conditionnée.
- **Signal d'exercice non réalisé.** Sans lui, « je n'ai pas réussi une seule répétition » ne
  laissait aucune trace : un exercice sans série validée n'a pas de clé dans le journal.
- **Retrait des barreaux dépassés du vivier.** Une traction assistée quitte le tirage quand sa
  stricte est débloquée, par un champ explicite sur l'exercice qui remplace. Le vivier tiré cesse de
  gonfler à chaque escalier, 6 → 7 → 7 → 7 au lieu de 5 → 6 → 7 → 8. Le barreau retiré n'est pas
  reverrouillé, sa fiche et sa progression restent intactes.
- **Poids double des face pulls dans le vivier tiré.** Une seconde entrée, placée pour donner des
  écarts de trois à quatre séances dans les quatre états de verrous. Rapport avant sur arrière
  d'épaule ramené de 1,33 à 0,78.
- **Correction de la dernière séance.** Valeurs de séries uniquement, tant qu'aucune autre séance
  n'a démarré. Un instantané pris avant la progression est restauré puis rejoué, avec le volume et
  le mode de la séance corrigée. Le nombre de séries étant invariant, les XP, badges de séance,
  rotation, couverture et jours actifs ne bougent pas.
- **Marquage des exercices de repli dans la bibliothèque.** Six exercices ne sortent jamais au
  tirage et s'affichaient comme les autres. Le lien existait dans un sens, la fiche d'origine nomme
  son repli ; il manquait en sens inverse.
- **Date du dernier import** dans la card Données, symétrique de celle du dernier téléchargement.
- **Trois suites de tests**, `test18` à `test20`, soit vingt suites au total, plus les cas de non-régression issus de l'audit.

**Corrigé après audit contradictoire**

Une relecture menée dans une conversation neuve, sans historique, a rejoué le moteur sur des
scénarios adverses et trouvé neuf défauts, dont un bloquant. Corrigés avant livraison :

- **Le livrable se déclarait v1.14.** La constante de version et l'assertion qui la vérifiait
  devaient être mises à jour ensemble, elles étaient donc fausses et vertes ensemble. L'assertion
  porte désormais sur la forme.
- **Un retrait pouvait orpheliner un verrou.** Débloquer la traction stricte supination retirait la
  variante assistée du tirage, dont le verrou de la pronation lit le dernier passage : la branche
  pronation devenait définitivement infranchissable. Le retrait attend que plus aucun verrou fermé
  ne lise l'exercice.
- **La garde des séances allégées ne couvrait que la séance elle-même.** Les séries d'une séance
  allégée étaient enregistrées et relues par le verrou de la séance normale suivante, ouvrant le
  swing sur des répétitions faites à charge réduite. La provenance est marquée sur la performance.
- **Une descente était proposée comme palier à tenir.** L'accepter restaurait la charge d'avant
  descente, annulant le filet, et décrémentait le compteur de montées sans qu'aucune montée n'ait eu
  lieu. Seules les montées entrent désormais dans la liste.
- **L'instantané de correction ne photographiait pas les badges**, alors qu'il restaure `loadUps` et
  `unlocked`, que trois badges testent.
- **Le plafond des verrous lisait le volume alterné en mode ciblé**, où chaque exercice joue son
  propre nombre de séries. Il lit le nombre de séries prévues pour l'exercice source.
- **Les fourchettes de durée de Réglages ne filtraient pas les barreaux retirés.**
- **Une tenue pouvait être validée à zéro seconde**, alors que l'écran de correction refuse le zéro.
- Code mort retiré dans le rejeu de correction.

**Construit puis retiré**

Le joker de rattrapage, cinquième exercice proposé quand un exercice dépasse la taille de son
vivier sans sortir, a été écrit, testé, puis retiré avant livraison. Le contrôle sur données réelles
l'a vu proposer un exercice déjà présent dans la séance ; le correctif suivant a montré qu'il
comptait des séances là où il fallait compter des avancées de rotation ; la simulation sur 200
séances a montré qu'il se proposait 21 fois, dont 16 sur des exercices fraîchement débloqués qui
n'étaient pas en retard mais n'existaient pas encore. Le seul décrochage réel est le redécoupage du
modulo à un changement de composition de vivier, il se résorbe seul en un cycle. Versé au backlog
avec cette analyse.

**Retouche de données au déploiement**

La séance du 14 août portait 46/68/50 sur le gainage latéral, valeurs jamais réalisées. Remplacées
par 15/15/14, estimation et non mesure, ce qui ramène `best` de 68 à 32. Trois entrées de `perf`
incohérentes avec leurs séries, séquelles de corrections manuelles du JSON, ont été recalculées :
planche cible 35, rowing kettlebell cible 11, pallof press 10/10/10 et cible 11.

---

## v1.14 — 15 août 2026

Version issue de quatre retours d'usage sur la v1.13, dont deux ont fait tomber une analyse fausse
du coût d'une série. Le montage des charges ne se fait pas pendant la séance mais avant, et un
étirement ne demande aucun réglage : la constante unique de 22 s facturait donc un geste qui
n'existe pas. En remontant le fil, le tempo s'est révélé sous-évalué de 30 à 50 % par rapport aux
consignes que les fiches donnent elles-mêmes. Le modèle de temps est refondu en postes qui disent
chacun ce qu'ils sont, à niveau annoncé quasi inchangé.

**Retiré**

- **La constante unique de manipulation, 22 s par série.** Ce n'était pas un calcul mais un solde,
  le reste d'une mesure de 18 minutes réparti à parts égales. Elle facturait un réglage de charge à
  des étirements et à onze exercices sur vingt-trois qui n'en demandent aucun.
- **Le drapeau d'ouverture du détail de séance et sa fonction**, remplacés par le mécanisme commun
  des cards repliables.
- **Les moyennes de durée dans Réglages**, remplacées par des fourchettes.
- **La note « hors du temps de séance annoncé » sur l'écran d'étirement**, plutôt que corrigée. Elle
  répondait à une question qui ne se pose plus, le total étant annoncé avant de lancer, et sa
  seconde moitié est déjà dite par l'écran lui-même et par la card Réglages où les étirements
  s'activent. Une ligne lue quatre cents fois par an qui ne fait rien décider est du bruit.

**Corrigé**

- **Les cards repliables se refermaient au clic sur une de leurs options.** Chaque bouton de réglage
  ou d'ajustement appelle le rendu, qui réécrit toute la page : la card se refermait au moment
  précis où l'on manipulait ce qu'elle contient. Toutes les vues sont concernées, accueil, réglages
  et statistiques. L'état d'ouverture est relevé avant le rendu et chaque card écrit le sien au
  moment où elle s'écrit. Rien n'est stocké : il ne survit ni au changement de vue ni au
  rechargement.
- **La page semblait se rafraîchir à chaque clic sur une option.** Les cards portaient une animation
  d'apparition, opacité nulle et remontée de huit pixels sur 350 ms. Une animation CSS se rejoue à
  chaque création de l'élément, et le rendu recrée tout le DOM : toutes les cards de la page se
  réanimaient donc à chaque bouton pressé. L'animation est désormais conditionnée à une arrivée sur
  un écran, chaque écran annonçant sa clé en entrant. En séance la clé porte le numéro d'étape :
  passer d'une série à la suivante s'anime, ajuster une charge sur la même série non.
  Deux correctifs annexes posés en chemin sur des causes qui n'étaient pas les bonnes, mais qui
  restent justes : l'attribut d'ouverture des cards est écrit directement dans le HTML plutôt que
  rétabli après le rendu, ce qui évite que le document existe trop court le temps d'une image, et la
  position de défilement est mémorisée puis restaurée autour du rendu, un changement de vue
  continuant de remonter en haut.
- **Le tempo d'une répétition, 3 s, contredisait les consignes de l'outil.** Les fiches demandent de
  monter en 2 s et de redescendre lentement en 2 à 3 s, soit 4 à 5 s. Le tempo devient un attribut
  de l'exercice, 4,5 s par défaut, avec des exceptions déclarées : 5 s pour les tractions, le
  bird-dog et le pallof press, 3,5 s pour les mollets debout, 1,5 s pour les swings.
- **Réglages annonçait une durée plus basse que l'accueil pour le même volume.** La moyenne portait
  sur tous les exercices des viviers, exercices verrouillés compris, alors qu'ils ne peuvent pas
  être tirés : 43 s d'écart à 3 séries, toujours dans le même sens.
- **La phrase « échauffement et étirements compris » restait vraie même options coupées.** Le
  chiffre suivait les réglages, pas le texte. La liste des postes inclus se compose désormais depuis
  l'état.
- **Quatre textes datant du modèle par durée.** Le message de bienvenue parlait de choisir sa durée,
  et trois textes annonçaient les étirements comme étant en dehors du temps de séance, ce que la
  v1.13 avait cessé d'être vrai.

**Ajouté**

- **Modèle de temps en quatre postes calculés.** Tout ce que l'outil chronomètre compte à sa valeur
  exacte. Se modélisent seulement le tempo, l'installation d'une série (10 s, 5 s pour un
  étirement qui ne demande ni saisie ni matériel), la bascule de côté et le remontage de charge.
- **Bascule de côté sur les deux seuls exercices qui en imposent une.** 5 s pour le pallof press,
  qui pivote autour d'un ancrage fixe, 10 s pour le rowing kettlebell, qui repose la charge et
  déplace ses deux appuis. Les tenues par côté rejouent déjà un décompte à chaque côté, les
  étirements bilatéraux enchaînent seuls au bip, et fentes, bird-dog et dead bug alternent à chaque
  répétition.
- **Remontage de charge compté sur la séquence réelle.** Deux exercices qui se disputent les
  haltères ou la kettlebell à des charges différentes imposent un changement à chaque passage de
  l'un à l'autre, soit 2R-1 remontages, à 25 s. Nul dans 83 % des tirages. Le premier montage est
  exclu : il se prépare avant la séance.
- **Avertissement de remontage dans le détail de séance**, nommant les deux montages et le nombre de
  changements. La liste du matériel ne suffisait pas à préparer une séance qui change de charge en
  cours de route.
- **Temps de chaque exercice dans le détail de séance**, et ligne Transitions distincte du poste
  Exercices dans la décomposition, avec une ligne Remontage qui n'apparaît que lorsqu'il y en a. Les
  postes s'affichent au dixième de minute pour que le total se retrouve.
- **Repos du mode alterné réglable**, 5, 10, 15, 20 ou 30 s, défaut inchangé à 15 s. Le plancher
  reste à 5 s parce que l'écran de repos annonce l'exercice suivant. La card Repos porte désormais
  les deux modes.
- **Fourchettes de durée dans Réglages**, calculées en balayant les tirages réellement possibles,
  remontages compris.
- **Deux suites de tests**, test16 sur le modèle de temps et test17 sur le repos réglable, les
  fourchettes et la survie des cards au rendu, portant l'ensemble à 17 suites.

---

## v1.13 — 14 août 2026

Version de conception, issue de trois retours d'usage sur la v1.12 : une tenue chronométrée dont
le bouton permettait des lectures que la fourchette ne mesure pas, une pression sur ENTRÉE qui
enregistrait une série non faite sans recours, et un chiffre de durée qui annonçait 15 minutes
pour une séance de 18. Le troisième a mené à une inversion de la décision fondatrice de l'outil :
ce n'est plus la durée qui est choisie et le contenu qui s'ajuste, c'est le volume qui est choisi
et le temps qui est calculé.

**Retiré**

- **« Reprendre » sur les tenues chronométrées.** Un Stop est définitif. Le bouton permettait
  d'atteindre 45 secondes en trois morceaux de 15, alors que la fourchette 20-60 mesure une tenue
  continue : l'outil n'indiquait pas quelle lecture il attendait. Pour refaire, on réinitialise et
  on repart de zéro.
- **L'ordre de sacrifice.** Le cardio sautait en premier, l'échauffement se raccourcissait ensuite,
  pour tenir un budget de temps. Ce budget n'existe plus : les options s'ajoutent au total annoncé
  au lieu de rogner le volume. Activer le cardio coûtait un quart des séries sans que rien ne le
  dise.
- **La constante `EFFORT`.** Une série ne coûte pas le même temps selon l'exercice : un unilatéral
  vaut deux fois le travail, une tenue vaut sa cible plus le décompte de préparation. Un coût
  unique se trompait de quatre à cinq minutes selon le tirage du jour.
- **La durée choisie**, remplacée par un nombre de séries. La correspondance de migration reprend
  exactement ce que l'ancien calcul produisait sans cardio : 10 → 2 séries, 15 → 3, 20 → 4.
  Personne ne voit son volume changer à la mise à jour.

**Corrigé**

- **ENTRÉE ne valide plus une tenue sans mesure.** La valeur d'une tenue partait de zéro et une
  pression sur ENTRÉE au lieu d'ESPACE l'enregistrait telle quelle, ramenant la cible au bas de la
  fourchette. Le bouton est grisé et la touche est inerte dans le même état : l'écran et le clavier
  disent la même chose.
- **La rotation n'est plus gelée en bloc par une séance allégée.** Elle avance là où l'exercice
  prévu a effectivement travaillé, elle gèle là où il a été remplacé par un repli. La couverture
  musculaire compte déjà pleinement les séries d'une séance allégée : les compter pour rien dans la
  rotation contredisait la mesure de l'outil, et faisait refaire deux fois de suite les exercices
  qui n'avaient pas été substitués.
- **Le nombre annoncé est un total, tout compris.** Il excluait les étirements et sous-évaluait le
  coût d'une série d'un tiers. Échauffement, cardio et étirements y entrent désormais.

**Ajouté**

- **Tenues chronométrées par côté.** Une tenue unilatérale se mesure en deux temps : premier côté,
  bip grave de bascule, second côté. La validation exige une mesure de chaque côté prévu, un
  travail d'un seul côté renforçant un déséquilibre plutôt que de produire la moitié du bénéfice.
  C'est le côté le plus court qui part au journal, pour que l'asymétrie soit visible.
- **Bouton « Réinitialiser »** sur une tenue arrêtée et non validée, qui relance le côté en cours
  à zéro. ESPACE ne détruit jamais une mesure : après le dernier côté, la touche est inerte.
- **Retour d'un pas après une validation.** Un bouton « Revenir à [exercice] » sur l'étape qui suit
  immédiatement une série validée défait le journal, le compteur de séries et les XP, et ramène sur
  l'exercice. Un seul pas, jamais depuis les étapes ultérieures ni depuis le récapitulatif.
- **Échappatoire au gel de rotation.** Dès la deuxième séance allégée d'affilée, tout avance. Sans
  elle, le vivier poussé, dont les trois exercices ont un repli, serait verrouillé pour toute la
  durée d'une période douloureuse. Le compteur repart à zéro dès qu'une séance normale est
  terminée ; une séance quittée ne compte pas.
- **Choix du volume sur l'accueil**, en 2, 3 ou 4 séries par exercice, chaque bouton portant le
  temps calculé du jour. Le bouton porte ce qui est contrôlé, la ligne dessous ce que cela coûte :
  aucun des deux ne peut mentir.
- **Card Contenu sur l'accueil**, repliée par défaut, dont l'en-tête fermé résume les options du
  jour. Ouverte, elle donne la décomposition chiffrée poste par poste et permet d'ajuster
  échauffement, cardio et étirements pour la séance qui vient. Ces ajustements sont ponctuels et ne
  survivent jamais à une séance, comme le mode allégé ; les valeurs par défaut restent dans
  Réglages.
- **Card « Séries par exercice »** dans Réglages, à la place de « Durée par défaut », avec la durée
  moyenne de chaque option calculée sur l'ensemble des exercices. L'accueil connaît le tirage du
  jour et affine ce chiffre.
- **L'historique enregistre le volume joué et la durée annoncée** au lieu de la durée choisie. Les
  anciennes séances restent lisibles.
- **Quinzième suite de tests**, sur la machine à états des tenues, le retour d'un pas, la rotation
  par emplacement substitué, le modèle de durée et la migration.

**Calibrage**

Le coût d'une série est modélisé par un temps de manipulation de 22 secondes et un tempo de
3 secondes par répétition, rétro-calé sur les deux séances propres de la v1.11 mesurées à 18
minutes. Le tirage moyen à 3 séries annonce 18 minutes. Ces deux paramètres restent à confirmer
sur trois ou quatre séances propres jouées en v1.13, la machine à états des tenues ayant elle-même
changé la durée d'un exercice par côté.

---

## v1.12 — 12 août 2026

Version de correction, issue de deux retours d'usage sur la v1.11 : un repli douleur sans retour
possible, et un chrono d'étirement au comportement incompréhensible. Le second cachait un défaut
plus large que le symptôme signalé, et a ouvert une amélioration des étirements bilatéraux.

**Corrigé**

- **Le chrono d'un étirement part de sa durée réelle.** Il partait de 10 secondes sur les six
  étirements, quelle que soit la durée inscrite en base. La ligne d'initialisation de la valeur
  d'une série est générique : elle prend la cible, sinon le bas de la fourchette, sinon 10. Un
  étirement n'a ni cible ni fourchette, donc c'était le littéral de fin de ligne qui s'appliquait.
  La durée de base n'était lue nulle part au premier passage.
- **Le bouton dit ce qu'il fait en fin de compte à rebours.** Il restait sur « Pause » une fois le
  chrono à zéro, et un appui relançait la durée réelle de l'exercice, seul endroit où elle était
  utilisée : le compteur semblait changer de valeur tout seul, 10 secondes au départ puis 60 à la
  reprise. Il affiche désormais « Recommencer », et c'est bien ce qu'il fait.
- **Le repli douleur ne touche plus les séries déjà validées.** Il rebasculait tout l'exercice,
  y compris les séries faites avant la douleur, qui avaient pourtant bien été faites sur
  l'exercice d'origine.
- **Les écrans de repos sont relus, plus corrigés par substitution.** Ils sont recalculés en
  balayant la suite de la séance, ce qui reste juste quel que soit le sens du changement.

**Ajouté**

- **Retour à l'exercice d'origine après un repli douleur**, en permanence, sur les séries comme
  sur le module cardio. Le bouton existe pour la fausse manœuvre et ne défait rien de ce qui a été
  fait : une série jouée sur la variante reste au journal, reste comptée dans le capteur de
  douleur et continue de bloquer la progression de l'exercice. Sans série jouée, la séance
  redevient exactement ce qu'elle était. Absent en séance allégée, dont la substitution n'est pas
  une douleur.
- **Étirements bilatéraux découpés en deux côtés**, sur le motif du module cardio : le chrono
  affiche le temps du côté en cours, un bip grave annonce la bascule, un bip aigu la fin, un
  libellé indique quel côté travailler. Concerne la nuque, les pectoraux, les fléchisseurs de
  hanche et les ischios ; le chat-vache et la posture de l'enfant gardent un bloc unique. Les
  durées en base ne changent pas, elles encodaient déjà le total des deux côtés.
- **Quatorzième suite de tests**, sur le chrono d'étirement et l'aller-retour du repli. Aucun de
  ces deux chemins n'était couvert, ce qui explique que les défauts soient passés.

---

## v1.11 — 11 août 2026

Version de correction, issue de deux questions posées devant la card Couverture : pourquoi les
chiffres du démarrage étaient si bas, et comment la progression décide de monter. La première a
révélé un défaut, la seconde une lenteur non voulue sur les seuls exercices chronométrés. Deux
corrections d'ergonomie s'y sont ajoutées, et une du script de build.

**Retiré**

- **Les quatre flèches ne modifient plus la valeur d'une série.** Elles n'étaient capturées que
  dans un cas, une série chiffrée en pleine séance, c'est-à-dire exactement l'écran le plus long
  et le seul où le pavé de saisie passe sous le pli : on ajustait une valeur invisible sans
  pouvoir descendre la voir. Elles sont rendues au défilement de la page, partout.
- L'horodatage de fin dans la ligne d'historique, remplacé par l'heure de début.

**Corrigé**

- **Le dénominateur de la couverture musculaire est borné aux semaines révolues.** Il valait 4 en
  dur : le travail réel était divisé par des semaines pendant lesquelles l'outil n'existait pas
  encore. Trente-trois séries faites en une seule semaine s'affichaient 2,3 séries par groupe, sous
  la bande sur les quatre rails, alors que la semaine vécue était dedans. C'est le défaut corrigé
  en v1.5 sur la moyenne de jours actifs, resté ici. La fenêtre passe des vingt-huit derniers jours
  glissants aux semaines ISO révolues, la semaine en cours restant dehors. Le libellé annonce le
  nombre de semaines réellement moyennées.
- **Les cibles chronométrées progressent par pas de 5 secondes.** Elles montaient d'une seconde par
  passage, alors que le pas de 5 s existait déjà dans le code sans être appliqué à la cible : la
  planche demandait 40 passages pour aller de 20 à 60 s, soit environ un an au rythme de rotation
  réel, là où les autres exercices franchissent leur fourchette en 8 à 14 passages. La règle reste
  celle des répétitions, plus petite série réalisée plus 1, avec un arrondi au multiple du pas.
  Huit passages désormais. Les répétitions gardent leur pas de 1, les étirements et l'échauffement
  ne passent pas par ce moteur.
- **La durée d'une séance porte les deux chiffres**, réel puis choisi, au format « 18 min pour 15 ».
  Le même format désignait jusqu'ici deux grandeurs différentes : le temps réel mesuré, ou la durée
  choisie quand la mesure manquait. Sans mesure, la ligne annonce désormais « 15 min prévues ».
- **`build.sh` n'annonce plus `BUILD OK` au-dessus d'une suite en échec.** Les tests étaient
  chaînés par `&&`, et `set -e` ignore l'échec de tout maillon d'une liste AND-OR sauf le dernier :
  le script poursuivait jusqu'au message final. Ils sont lancés un par un dans une boucle.

**Ajouté**

- **Ajustement d'une série au clavier sur `+` et `-`**, pris dans leurs deux états de touche pour
  rester accessibles sans Maj sur un clavier français : `=` et `+` montent, `6` et `-` descendent.
  Le pavé numérique fonctionne sans réglage. Son `6` est exclu, il est collé au `-`.
- **Mention d'attente dans la card Couverture** tant qu'aucune semaine n'est révolue : les rails,
  le ratio tiré/poussé et les alertes de bande sont masqués, la projection de configuration reste.
- **Ligne d'aide clavier** réécrite, elle annonce le défilement.
- **`test13.js`**, treizième suite : semaines révolues et cas réel du 6 au 9 août, semaine en cours
  exclue, fenêtre plafonnée, fenêtre glissante conservée sur les replis douleur, arrondi des tenues
  aux deux extrémités de la fourchette, traversée en 8 passages, périmètre du pas, ligne
  d'historique, touches d'ajustement et flèches libérées, absence d'effet de bord.
- Trois suites existantes amendées : `test4`, `test9` et `test12` dataient leurs historiques du jour
  même et divisaient par quatre semaines. `test4` était de surcroît instable selon le jour où il
  tournait. L'assertion de version quitte `test12` pour ne vivre que dans la suite courante.

---

## v1.10 — 11 août 2026

Version issue d'une discussion sur la bande de volume 8-16, reprise à froid après une session
précédente qui l'avait laissée ouverte. Un seul écran change réellement, la couverture musculaire,
mais son instrument de lecture est refait.

**Retiré**

- **`showDetail`** disparaît de l'état par défaut. Le champ était orphelin depuis la v1.8, il
  n'était plus lu nulle part. Les sauvegardes existantes qui le portent restent importables.
- La barre proportionnelle de la couverture musculaire, dont l'échelle valait `max(8, plus grande
  valeur)` : elle bougeait d'une semaine à l'autre et ne permettait pas de voir où tombaient 8
  et 16, c'est-à-dire précisément ce qu'elle était censée montrer.
- La mention « Cible : 8 à 16 » en tête de la card, la bande étant désormais dessinée et graduée.

**Corrigé**

- **Le détail de la séance est ouvert par défaut** sur l'accueil. Fermé, son en-tête ne portait
  aucune valeur, contrairement à la règle qui justifie les cards repliables : l'état fermé n'était
  pas un résumé utile mais une information cachée. Il reste refermable, en mémoire vive.
- L'alerte « en retrait » d'un groupe utilise désormais le plancher applicable à ce groupe, donc
  elle ne se déclenche plus sur un groupe volontairement en entretien.

**Ajouté**

- **Échelle fixe commune aux quatre groupes, de 0 à 24**, avec la bande visée dessinée entre ses
  deux bornes et graduée. 8 tombe au tiers, 16 aux deux tiers, la bande occupe le tiers central.
  Au-delà de 24, le rail est écrêté en hachures et le chiffre exact reste affiché à côté.
- **Plancher mobile par groupe.** Un groupe dont tous les exercices tenables et déverrouillés sont
  en palier tenu n'est plus en construction : son plancher passe de 8 à 4, il porte une pastille
  « tenu » et la graduation 4 apparaît. Le plafond de 16 ne bouge pas.
- **Projection de la configuration** en tête de card : durée, échauffement et cardio réellement
  joués, nombre de tours, objectif hebdomadaire, et le nombre de séries par groupe et par semaine
  qui en découle. Toujours calculée par `planFor` via `weeklySets`, jamais depuis une table. Le
  chiffre est vert dans la bande, orange en dehors.
- **Message au-dessus de la bande**, avec une incise sur les jours de repos que le volume ne mesure
  pas. Rien de nouveau en dessous : la barre passait déjà en orange, et l'injonction en dessous
  pousse au surentraînement.
- **Zone « Comment lire ces chiffres »**, repliable et fermée par défaut, contenant la légende des
  couleurs et le référentiel : sens de la bande, raison du plancher abaissé, rappel que le volume
  ne mesure pas la récupération, comportement de l'écrêtage. Ce qui décrit l'état reste dehors, ce
  qui explique le vocabulaire rentre.
- Paire de variables CSS `--band`, une par thème, et liseré couleur card autour du curseur, sans
  lequel le vert sur vert perd son contraste là où il annonce justement que tout va bien.
- `test12.js`, 9 blocs.

**Notes de déploiement**

- Aucun champ d'état nouveau, aucune migration. Une sauvegarde v1.9 se réimporte telle quelle.
- La ligne marqueur `/* IMGDATA … */` est désormais conservée telle quelle dans la section
  `head.html` de `PALIER-code.md` au lieu d'être remplacée : le round-trip depuis ce document
  perdait 47 octets.

---

## v1.9 — 10 août 2026

Correctif de cohérence sur la séance allégée livrée en v1.8, trouvé par une question plutôt que par
un test : que devenait la séance normale qu'on n'avait pas faite ?

**Corrigé**

- **Une séance allégée ne consomme plus de tour de rotation.** Elle avançait `slotIdx` et
  `cibleIdx` comme une séance normale, donc l'exercice remplacé ne revenait qu'au cycle suivant du
  vivier : deux séances de retard sur le poussé, **sept sur le tiré**, et un bloc entier sauté en
  mode ciblé. Désormais la séance suivante repropose exactement ce qui était prévu. Cohérent avec le
  gel de progression déjà en place : rien n'a avancé, rien ne doit avancer.
- La rotation des étirements continue d'avancer : ils ont été faits tels quels, sans allègement.
- Un repli douleur ponctuel dans une séance normale ne fige toujours rien, les trois autres
  emplacements ayant travaillé normalement. La distinction est le point du correctif.

**Notes de déploiement**

- Aucun champ nouveau, aucune migration.

---

## v1.8 — 10 août 2026

Version issue d'un cas d'usage précis : courbatures partout au lendemain d'une séance intense, avec
le choix entre une séance amoindrie et rien du tout. L'outil ne proposait rien entre les deux, et
les variantes de repli restaient invisibles tant que la douleur n'était pas là.

**Ajouté**

- **Séance allégée**, bascule ponctuelle depuis l'accueil, à droite, « Changer de séance » passant
  à gauche. Trois effets décidés ensemble : substitution par la variante de repli là où elle existe
  (12 exercices sur 36, viviers poussé 3/3, tiré 5/8, jambes 2/7, gainage 1/5) ; ailleurs, cible
  réduite de 30 % arrondie à l'inférieur, jamais sous le bas de fourchette, le débordement étant
  encaissé par la charge (au moins 20 % de moins sur l'échelle continue des haltères, un barreau sur
  les échelles ordinales que sont les bandes et le kettlebell) ; gel de la progression dans les deux
  sens sur toute la séance, rien ne monte et le filet de sécurité ne joue pas.
- La substitution est faite à la construction de la séance et nulle part ailleurs, donc le matériel
  à sortir, le résumé de l'accueil et l'estimation de durée en découlent sans que rien d'autre ait à
  connaître le mode.
- Un exercice substitué ne reçoit **pas** la baisse de cible en plus : la substitution est
  l'allègement. Défaut de conception attrapé par le test, pas par la relecture.
- **La séance allégée compte normalement** : jour actif, semaine, XP, badges. C'est tout son intérêt.
  Elle est marquée `light` dans l'historique, ce qui l'exclut du bloc Replis douleur : sans cette
  marque, deux jours légers par mois déclencheraient l'alerte kiné à tort.
- Le mode ne persiste jamais : perdu au rechargement, remis à zéro en fin de séance comme à
  l'abandon. Il n'est pas un réglage.
- Signalement visuel : bouton orange à l'état actif, bandeau dans le détail, tag « repli de X » ou
  « cible allégée » par ligne, mention sur l'écran d'exercice, ligne dédiée au récapitulatif, suffixe
  « allégée » dans l'historique.
- **Variante de repli nommée dans la fiche**, avec son matériel et un lien vers sa propre fiche.
  Jusque-là le repli n'existait qu'au moment de la douleur, sur un bouton qui ne le nommait pas :
  impossible de savoir à l'avance vers quoi on bascule ni quoi préparer.
- `test11.js`, 12 blocs.

**Modifié**

- **Détail de la séance** devient une card repliable, ce qui libère la place du bouton. Son
  ouverture est mémorisée en mémoire vive seulement : elle doit survivre au rendu déclenché par la
  bascule du mode allégé, sinon le détail se refermerait juste au moment où l'on veut en voir
  l'effet, mais elle ne survit pas au rechargement.
- **Onglet Progrès** : Niveau non repliable, Assiduité et Couverture restent ouvertes, Dernières
  séances, Temps, Trajectoire, Repères et Badges se replient avec leur valeur en en-tête. Replis
  douleur se replie aussi, **mais s'ouvre d'office quand le seuil d'alerte est franchi** : c'est la
  seule card de l'onglet qui porte un avertissement, et un avertissement replié n'avertit personne.
  Tout replier a été écarté : Progrès est une destination qu'on ouvre exprès, pas un tableau de bord
  qu'on croise.

**Notes de déploiement**

- Aucun champ de réglage nouveau. `state.showDetail` devient orphelin dans les sauvegardes
  existantes, sans effet ni migration. Les entrées d'historique gagnent un `light` optionnel, dont
  l'absence vaut séance normale.

---

## v1.7 — 9 août 2026

Version de contenu, sans changement de moteur ni d'interface. Elle comble un trou signalé après
usage : l'outil décidait de tout sauf de la respiration, alors qu'elle fait partie de l'exécution
au même titre que le tempo ou l'amplitude.

**Ajouté**

- **Consignes respiratoires sur les 36 exercices et les 5 étapes d'échauffement**, tissées dans les
  textes existants plutôt qu'affichées dans un champ dédié : l'écran de séance venait d'être
  réordonné pour sa lisibilité, une ligne permanente de plus l'aurait alourdi. Quatre règles :
  expiration sur la phase d'effort en dynamique, écrite dans la description qui décrit déjà cette
  phase ; consigne anti-apnée en **vigilance** pour les trois exercices tenus, donc visible sans
  déplier, parce que l'apnée en isométrie est le seul cas réellement problématique et que le risque
  grandit à mesure que la cible s'allonge ; expiration allongée sur les étirements, qui est ce qui
  fait céder le muscle ; une mention par étape d'échauffement.
- Cas particuliers assumés : les swings reçoivent une expiration sèche par projection, le dead bug
  une expiration sur l'extension (c'est elle qui garde les côtes basses et le dos plaqué), le
  pallof press l'interdiction de bloquer pendant les deux secondes de tenue. Les deux fiches cardio
  ne reçoivent rien, elles parlaient déjà de respiration ample et une consigne par répétition n'a
  pas de sens sur du continu. Aucune mention de manœuvre de Valsalva : le matériel la rend hors
  sujet et elle est contre-indiquée pour ce dos.
- `test10.js`, 7 blocs : couverture des 36 fiches, placement en vigilance pour les tenues et
  absence de doublon en description, expiration à l'effort sur les 25 fiches dynamiques, absence de
  toute recommandation de blocage, étirements, échauffement avec vérification du sens de la
  respiration sur le chat-vache, présence de la consigne dans la fiche rendue et sur l'écran
  d'exercice, et invariance de l'état sauvegardé.

**Notes de déploiement**

- Aucun champ d'état, aucune migration, aucun changement de format d'export. Une sauvegarde v1.6
  se réimporte telle quelle.

---

## v1.6 — 9 août 2026

Version issue du premier retour d'usage en conditions réelles (une séance en v1.5) et de la
revue du vivier poussé. Deux fils : le catalogue (retrait des dips, entrée du développé haltères
au sol) et l'écran de séance (préparation sonore, lecture, repérage dans la séance).

**Retiré**

- **Dips** : fiche, configuration, verrou, vivier poussé, illustration. Le recrutement se
  superpose aux pompes à plus de 90 %, et la seule spécificité réelle, l'amplitude en extension
  d'épaule, est précisément ce que la contrainte d'épaule interdit : exécutés en sécurité
  (arrêt à 90°), ils n'apportent plus rien. Même logique que la corde à sauter en v1.4 : une
  contrainte physique dure qui vide l'exercice de sa valeur. Le catalogue reste à 36 exercices
  avec l'ajout ci-dessous.
- **Pastilles de série dans la card d'exercice** (`setpips`), remplacées par la série en clair.

**Corrigé**

- Rien.

**Ajouté**

- **Développé haltères au sol** au vivier poussé, mode `load`, double progression sur l'échelle
  fine jusqu'à 14,5 kg par main, départ à 6 kg. Seul exercice du vivier poussé en progression de
  charge. Le sol arrête les coudes, l'humérus ne passe jamais derrière le tronc. La fiche décrit
  l'entrée et la sortie de position haltères sur les cuisses (bascule d'un bloc), pour ne pas
  protéger l'épaule en exposant le dos. Croquis crayon livré avec la version.
- **Décompte de préparation** avant tout chrono d'exercice tenu ou d'étirement : 0, 3, 5 ou
  10 secondes (défaut 5), un bip par seconde, plus aigu au départ. Rejoué à chaque Reprendre :
  reprendre, c'est se remettre en position. Réglable dans les réglages uniquement, jamais en
  séance.
- **Bips d'approche de la cible** sur un exercice tenu : les cinq secondes précédant la cible
  bipent en grave, le bip d'arrivée existant ne change pas. Garde sur les cibles de 5 s ou moins.
- **Interrupteur global des sons**, porte unique dans la fonction d'émission : échauffement,
  repos, cible, décompte, phases et fin du cardio, célébrations, tout se coupe d'un coup.
- **Card « Sons »** dans les réglages, après Étirements, valeur en en-tête fermé
  (« Activés · décompte 5 s »).
- **Série en clair** sur l'écran d'exercice : « Série 2 sur 3 », en tour courant sur les tours
  en alterné.
- **Pastilles de séance regroupées** selon la logique du mode : un bloc par tour en alterné, un
  bloc par exercice en ciblé, contour vert quand le bloc est bouclé.
- **Écran d'exercice réordonné** : cible / fourchette / dernière fois juste sous le nom, charge
  immédiatement après, illustration ensuite, entière à toutes les séries. On lit sa cible, on
  règle sa charge. Le contrôle « palier tenu » descend sous la vigilance.
- `test9.js`, 9 blocs : catalogue, tolérance aux identifiants d'historique absents (vérifiée par
  un test dédié plutôt que par lecture : les gardes posés au retrait de la corde couvraient déjà
  le cas), sons, décompte, fenêtre pré-cible, écran, pastilles, réglages.

**Notes de déploiement**

- `state.sound` et `state.prep` sont des champs nouveaux, absents des sauvegardes existantes.
  Aucune migration : l'absence vaut « sons activés » et « décompte 5 s ».
- Les états sauvegardés qui contiennent des dips dans `perf`, `unlocked` ou l'historique restent
  valides : tout le rendu ignore les identifiants absents du catalogue (testé).

---

## v1.5 — 9 août 2026

Version issue d'un audit UI/UX de toutes les vues hors séance, mené sur deux mesures : coût de
scroll pour atteindre l'information la plus demandée, coût d'interaction pour l'action la plus
fréquente. Les écrans de séance en sont exclus par principe : toute interaction supplémentaire y
est interdite. L'audit a conclu à trois vues à retoucher (Réglages, Progrès, Exercices) et deux à
laisser telles quelles (Accueil, fiche exercice) : y appliquer le motif repliable aurait ajouté un
clic là où l'œil veut parcourir.

**Corrigé**

- **Moyenne de jours actifs** : elle divisait par la fenêtre nominale (4 ou 12 semaines) et
  incluait la semaine en cours. Une seule séance un dimanche affichait « 0.3/sem sur 4 semaines »,
  alors qu'aucune semaine n'était encore terminée. Deux règles, une seule raison, ne moyenner que
  sur des semaines réellement observées et réellement terminées : la semaine en cours est exclue
  (l'inclure faisait plonger la moyenne chaque lundi matin, même pour un utilisateur établi), et le
  dénominateur est borné aux semaines révolues depuis la première séance. La ligne disparaît tant
  qu'aucune semaine n'est révolue : il n'y a alors rien à moyenner. Même logique que
  `weeksElapsed`, qui excluait déjà la semaine en cours non validée.
- Accord de « semaines validées » : le pluriel de l'adjectif suivait le compteur de semaines
  validées au lieu du nombre de semaines écoulées, d'où « 0/3 semaines validée ».

**Ajouté**

- **Bloc « Replis douleur »** dans Progrès, fenêtre glissante de 4 semaines, aligné sur celle de
  la couverture musculaire. Compté par exercice d'origine (« Pompes sur poignées : 2/7 passages »),
  avec les variantes vers lesquelles le repli a mené. Les données existaient depuis la v1.1
  (`sw` et `from` en historique, journal sous clé `origine>repli`) mais n'étaient visibles qu'une
  fois, sur l'écran de récapitulatif. Un repli isolé est un mauvais jour, c'est la répétition qui
  est un signal : alerte quand la douleur revient plus d'une fois sur deux, avec renvoi vers un
  avis kiné plutôt que vers un repli de plus. Le bloc s'efface quand la fenêtre est propre.
- **Dernières séances dépliables** : chaque ligne s'ouvre sur le contenu de la séance, même rendu
  qu'au récapitulatif, tags de repli compris. La liste était une impasse, aucune ligne ne menait
  nulle part.
- **Cards repliables** (`<details class="card">`, clavier et accessibilité natifs, aucun état JS,
  fermées par défaut, état non persisté). La ligne fermée porte **la valeur courante**, pas
  seulement le titre : « Repos entre séries · 60 s », « Matériel · jusqu'à 14,5 kg · 5 bandes ·
  2 lestes ». L'état complet de la configuration se lit sans un clic, on n'ouvre que pour modifier
  ou relire une justification.
- **Réglages réordonnés** par fréquence d'usage : Données, Objectif hebdomadaire, Durée, puis le
  bloc qui façonne le contenu de la séance (Structure, Échauffement, Cardio, Étirements), puis
  Repos (mode ciblé seulement, hors défaut), Entretien (interrupteur pour dans plusieurs mois),
  Matériel et Thème en fin, disclaimer inchangé.
- **Date du dernier export** dans l'en-tête fermé de la card Données (« jamais exportée »,
  « aujourd'hui », « hier », « il y a 3 j »). Écrite sur le téléchargement comme sur la copie,
  après coup, donc absente du fichier exporté lui-même.
- **Progrès réordonné** : Niveau, Dernières séances, Assiduité, Couverture musculaire, Replis
  douleur, Temps d'entraînement, Trajectoire des charges, Repères par exercice, Badges. Le bloc
  Replis est collé à la couverture, dont l'alerte dit littéralement « vérifie les replis ».
- **Card Badges repliable** : fermée, seuls les badges obtenus, en pastilles compactes avec le
  compteur (4/12) ; ouverte, la collection complète avec les descriptions. L'état fermé est un
  résumé utile, pas un titre mort.
- **Onglet Exercices refondu** : liste dense à vignettes (mêmes miniatures que le détail de séance,
  recadrage `cover` 74×52), une ligne par exercice, verrous intégrés (cadenas à la place de
  l'image, condition de déblocage à la place des muscles, ligne estompée) au lieu d'une ligne
  supplémentaire en décalé. Le tag « palier tenu » passe dans la colonne de statut pour ne pas
  tronquer les noms longs.
- **Barre de recherche** dans Exercices : filtrage instantané sur nom français, nom anglais et
  muscles, insensible aux accents et à la casse, groupes vides masqués, message explicite quand
  rien ne correspond, remise à zéro à chaque entrée dans l'onglet. Trois lettres suffisent presque
  toujours sur 36 exercices. Pas de chips de filtrage par groupe en plus : la recherche et les
  sections couvrent déjà les deux modes d'accès.
- `test8.js` : 14 blocs sur les nouveautés (moyenne masquée puis bornée, fenêtre pleine, comptage
  et fenêtre des replis, séances dépliables, ordre des cartes de Progrès et de Réglages, valeurs
  en en-tête, horodatage d'export, lignes de bibliothèque, recherche). Le premier jet de
  `weeksObserved` renvoyait 52 au lieu de 0 quand la première séance tombait dans la semaine en
  cours, c'est-à-dire exactement le cas de test signalé ; la suite l'a attrapé avant livraison.

---

## v1.4 — 9 août 2026

Version issue d'un audit externe et de son contre-audit. Point de départ notable : les six suites
de tests existantes passaient toutes sur la version où la progression après douleur était cassée.

**Retiré**

- Corde à sauter, entièrement : fiche, configuration de progression, liste de matériel, verrou.
  Contrainte matérielle définitive (pas la hauteur sous plafond), et les séances cardio intenses
  vivront hors de l'outil. Le catalogue passe de 37 à 36 exercices.
- Toute la mécanique de sélection et de déblocage du module cardio, devenue sans objet : la corde
  en était le seul contenu verrouillé. `cardioId` retournait `CARDIO_ID` dans ses deux branches,
  et le seuil de 12 rounds était arithmétiquement hors d'atteinte (4 minutes de rounds d'une minute
  plafonnent à 4 rounds).
- Progression du module cardio : il devient un bloc de durée fixe, sans cible ni fourchette.

**Corrigé**

- **Une montée exige désormais un exercice mené à son terme** : toutes les séries prévues validées,
  aucune sautée, aucun repli douleur, séance non quittée. Auparavant, une seule série au haut de
  fourchette suivie d'une douleur suffisait à faire monter la charge ou la bande de l'exercice
  abandonné, c'est-à-dire à rendre plus dur l'exercice qui venait de faire mal. Le filet de
  sécurité reste actif dans tous les cas, y compris sur une séance partielle.
- Les écrans de repos annoncent le bon exercice après un repli. Ils continuaient d'annoncer
  l'exercice quitté pendant tout le reste de la séance.
- Les séries d'un repli sont journalisées sous une clé `origine>repli`. Deux exercices repliant
  vers la même variante (élévations et face pulls vers le tirage doux, tractions assistées et
  tirage en suspension vers le rowing élastique) ne fusionnent plus leurs séries.
- L'historique et le récapitulatif retiennent **d'où vient** un repli, pas seulement qu'il a eu lieu.
- Une séance n'est plus comptée complète si une série a été sautée. Le module cardio, journalisé
  comme une entrée, comblait le trou et déclenchait le bonus de fin de séance.
- Le bonus hebdomadaire utilise `goalForWeek` comme le reste de l'application, au lieu de
  `state.goal`. Sur une semaine de démarrage, l'accueil annonçait la semaine validée pendant que
  le bonus restait bloqué jusqu'à l'objectif plein.
- Les conditions de déblocage décrivent ce qui est réellement vérifié : plus de « sans aucune
  douleur d'épaule » ni de « propres et sans douleur » là où seul un nombre de répétitions est
  mesuré. Principe retenu : corriger le texte, pas construire un vérificateur de douleur pour
  honorer une phrase.
- Là où une condition annonce plusieurs séries, elles sont maintenant exigées (`minSets`) : les
  trois séries de six en supination avant la pronation.
- Le repli marche du module cardio, déclaré en base mais sans bouton pour l'atteindre, est devenu
  accessible depuis l'écran cardio.

**Ajouté**

- **Palier tenu.** Fige la cible, la charge, la bande et la fourchette d'un exercice. Le volume de
  travail ne change pas, le filet de sécurité continue d'alléger en cas de décrochage. Deux
  interrupteurs, sur la fiche et sur l'écran de série, plus une action « tenir ce palier » au
  récapitulatif au moment d'une montée, qui l'annule et fige au niveau de la séance qui vient
  d'avoir lieu, annulable dans la foulée. Monter la charge ou la bande à la main libère le palier,
  la baisser le conserve. Les répétitions saisies ne libèrent jamais rien : ce sont des données,
  pas des commandes. Aucune remarque si le palier est dépassé.
- Réglage **entretien** : tient ou libère tous les exercices d'un coup.
- **Alerte d'écart tiré/poussé** dans Progrès, à côté du ratio existant. Un seul sens signalé, le
  défavorable aux épaules : poussé en avance d'au moins 3 montées sur un tiré tenu. Le compteur
  repart à zéro à chaque changement de palier. Jamais en séance ni au récapitulatif.
- **Étirements de fin de séance alternée** : deux en rotation sur les six, environ 2 minutes, hors
  du budget de temps, sans XP ni effet sur la progression, passables d'un bouton, désactivables
  dans les réglages. En mode alterné la mobilité n'était jamais rencontrée.
- `test7.js`, septième suite, 20 cas. Rôle explicite : vérifier que le moteur ne contredit pas les
  textes affichés.

## v1.3 — 8 août 2026

**Corrigé**

- Affichage exact des charges à deux décimales : les paliers à 1,25 kg s'affichaient arrondis à
  3,3 au lieu de 3,25.
- Ratio des semaines validées calculé sur les seules semaines terminées.

**Ajouté**

- Objectif au prorata sur les semaines de démarrage et de reprise, avec mention explicite sur
  l'accueil et dans les réglages.
- Surcouche animée de célébration des déblocages, badges et paliers de rang.

## v1.2 — début août 2026

**Corrigé**

- Déblocages recalibrés sur une série et non sur un total : `best` mesure la meilleure série, les
  anciens seuils (36, 30) étaient inatteignables. Dips, soulevé roumain et swings à une série de 15.
- Photographie de la bande réellement utilisée dans l'item d'historique, avant progression.

**Ajouté**

- Bandes élastiques en échelle ordinale, avec sens propre à chaque exercice (résistance ou
  assistance) et ajustement persistant en séance.
- Exercices à charge fixe mécanisés par les lestes : goblet, soulevé roumain et swings de 10 à
  16 kg, chaîne rowing de 10 à 20 kg.
- Capacité du manchon (5 disques par extrémité, réglable) et échelle mono-haltère.
- Marche suivante réelle des 15 exercices plafonnés, au lieu d'un message générique.
- Tractions strictes gardées par la bande la plus faible de l'inventaire.
- Marqueur de repli dans l'historique et le récapitulatif.
- Trajectoire des bandes et des charges fixes dans les statistiques.
- Inventaire bandes et lestes dans les réglages, avec consigne d'inspection des bandes TPE.
- Navigation par hash (retour arrière du navigateur et de la souris).
- Migration automatique de l'état v1.1 : fourchettes des exercices à échelle remises à plat, bande
  noire par défaut aux tractions, inventaire complété.

## v1.1 — début août 2026

**Corrigé**

- Paramètre ignoré de `thisWeekCount`.

**Ajouté**

- Objectif hebdomadaire compté en jours actifs : plusieurs séances le même jour comptent pour un.
- Séances incomplètes enregistrées, sans bonus de fin ni avancement de la rotation.
- Durée réelle de séance mesurée par horodatage.
- Statistiques dans Progrès : assiduité, histogramme sur 12 semaines, temps d'entraînement,
  trajectoire des charges, couverture musculaire avec ratio tiré/poussé.
- Export par téléchargement de fichier et import par sélecteur, repli copier-coller conservé.
- Illustration `rowing-suspension` remplacée (inclinaison à 30° mesurée) et fiche corrigée.
- Mise en ligne sur `palier.s1t3.link` (S3 eu-west-3, CloudFront, Route 53).

## v1.0 — début août 2026

Première version livrée et vérifiée.

- Structures de séance alternée et ciblée, durée adaptative.
- Double progression en répétitions puis en charge.
- 4 variantes de tractions.
- Échauffement sur écran unique.
- Module cardio optionnel.
- Détail de séance avec matériel consolidé.
- Navigation clavier, retour contextuel, thèmes clair, sombre et automatique.
- Export et import de la progression.
- XP, niveaux, rangs, badges, déblocages.
