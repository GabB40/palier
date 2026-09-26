# Outils

Hors `build.sh`, lancés à la main. `build.sh` les recopie dans `build/`, où ils trouvent
`check.js`. Un outil nouveau ou modifié met sa ligne à jour ici, dans le même lot.

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

## Banque d'images, `src/imgdata.js`

Forme canonique : une ligne `const IMG={...};` en JSON, clés égales aux identifiants d'exercice,
puis deux sauts de ligne. `VERSION` vit dans `app1.js` et non ici, parce que la régénération
réécrit ce fichier en entier. Une clé qui ne sert ni une fiche ni une étape d'échauffement fait
échouer `test22`.

Insertion ou remplacement de quelques images, sans toucher au reste :

```python
import json, base64
s = open('imgdata.js', encoding='utf-8').read()
i = s.index('const IMG='); j = s.index(';\n', i)
img = json.loads(s[i + len('const IMG='):j])
for k in ['exercice-1', 'exercice-2']:
    img[k] = 'data:image/jpeg;base64,' + base64.b64encode(open(k + '.jpg', 'rb').read()).decode()
out = s[:i] + 'const IMG=' + json.dumps(img, separators=(',', ':'), ensure_ascii=False) + s[j:]
open('imgdata.js', 'w', encoding='utf-8').write(out)
```

Régénération complète depuis un dossier de JPEG traités ; ce script réécrit `imgdata.js` et
deviendra un outil du lot JPEG séparés :

```python
import os, base64, json
PREP = 'prep'
d = {}
for f in sorted(os.listdir(PREP)):
    d[f[:-4]] = 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(PREP, f), 'rb').read()).decode()
open('imgdata.js', 'w').write('const IMG=' + json.dumps(d, separators=(',', ':')) + ';\n')
print('images', len(d))
```

Attention : la régénération écrit un seul saut de ligne final là où la forme canonique en porte
deux ; elle se vérifie octet pour octet avant d'être adoptée.
