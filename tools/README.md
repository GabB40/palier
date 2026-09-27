# Outils

Hors `build.sh`, lancés à la main, sauf `imgdata.py`, que `build.sh` lance à chaque build.
`build.sh` les recopie dans `build/`, où ils trouvent `check.js`. Un outil nouveau ou modifié met sa ligne à jour ici, dans le même lot.

## `neutre.js`, empreinte de neutralité

Depuis `build/`, de part et d'autre d'un lot :

```bash
node neutre.js /chemin/vers/check-avant.js > /tmp/e-ref.txt
node neutre.js check.js > /tmp/e-new.txt
cmp /tmp/e-ref.txt /tmp/e-new.txt
```

Porte sur des valeurs, jamais sur des libellés : 180 tirages croisant volumes, cardio, trois
échauffements et dix positions de rotation (exercices, cible, bande, charge, durée annoncée,
remontages), puis viviers, échelles et fourchettes de durée, à inventaire identique des deux
côtés. 206 lignes à la v2.24. Un lot qui ne doit pas toucher au tirage, à la prescription ni au
modèle de temps la laisse identique.

## `seuil-r.js` et `ordre-circuit.js`, instruments de mesure

`node seuil-r.js` et `node ordre-circuit.js`, sans dépendance, n'importe où. Ils ne testent pas
l'application : ils mesurent des propriétés combinatoires de l'ordre du circuit, sur des entrées
recopiées en tête de fichier (viviers de `SLOTS`, table de marqueurs d'interférence). **La table de
marqueurs est un jugement, pas une mesure, et aucun chiffre produit ne décide seul.**

- `seuil-r.js` compte les conflits d'épaule par séance pondérés par le nombre de tours : 3R
  adjacences intra-tour et R-1 raccords, et non quatre adjacences à poids égal ; mesure aussi le
  gain d'une pause au raccord.
- `ordre-circuit.js` compte les conflits de chacun des six ordres de circuit, et la robustesse du
  classement au déphasage des viviers, à l'état mature et à la contre-hypothèse
  agoniste-antagoniste, avec un test de sensibilité sur 256 jeux de marqueurs.

## `prep_illus.py`, post-traitement des illustrations

```bash
python3 prep_illus.py entree.png sortie.jpg [separateur]
```

Recadre, aligne les deux figures sur un sol commun, réduit la gouttière, redessine le séparateur,
efface les artefacts clairs, compresse. `separateur`, fraction de la largeur, sert aux images dont
un trait de mur intérieur tombe dans la bande de recherche de `find_separator` (carnet,
`04-illustrations.md`) ; sans lui, le comportement est celui de toujours. Toute illustration passe
par ce script, sans exception.

## `imgdata.py`, banque d'images

```bash
python3 tools/imgdata.py src/img build/imgdata.js
```

Lancé par `build.sh`, jamais à la main hors banc (ADR-0003). `src/img/` porte une illustration par
exercice ou étape d'échauffement, `<id>.jpg`, et `ordre.txt`, un identifiant par ligne, en LF,
saut de ligne final compris. Le générateur écrit `const IMG=` suivi du JSON compact,
`ensure_ascii=False`, puis deux sauts de ligne, clés dans l'ordre du manifeste : aucun tri ne
reproduit l'ordre historique, et un tri changerait `dist/index.html`. `VERSION` vit dans
`app1.js`.

Il refuse, sortie 1, sans rien écrire : manifeste absent, vide, sans saut de ligne final ou avec
une ligne vide ; identifiant hors `[a-z0-9-]`, CR compris ; doublon ; ligne sans fichier ; fichier
absent du manifeste ; toute autre entrée qu'un `.jpg` ou le manifeste ; JPEG sans `FFD8FF` en tête
ou `FFD9` en fin ; cible déjà présente. Ce dernier refus attrape un `src/imgdata.js` survivant à
l'extraction d'une archive, que `build.sh` recopierait dans `build/`. Sortie mesurée au lot :
`imgdata.js : 58 images, 2771080 octets de JPEG`. Banc : `falsifimg`.

Une clé qui ne sert ni une fiche ni une étape d'échauffement fait échouer `test22`, qui compte
aussi la banque, 58 images.

- **Ajouter** : `python3 tools/prep_illus.py source.png src/img/<id>.jpg [separateur]`, ajouter
  `<id>` en fin de `src/img/ordre.txt`, brancher la fiche ou l'étape, ajuster le compte de
  `test22`, `./build.sh`.
- **Remplacer** : repasser la source par `prep_illus.py` sur `src/img/<id>.jpg`, `./build.sh`.
- **Retirer** : `git rm src/img/<id>.jpg`, retirer la ligne du manifeste, ajuster `test22`.

Dans les trois cas `dist/index.html` change : la version change.
