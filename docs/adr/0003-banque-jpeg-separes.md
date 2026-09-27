# ADR-0003 : la banque d'images vit en JPEG séparés, `imgdata.js` est fabriqué au build

- **Date** : 2026-09-27
- **Statut** : accepté
- **Remplace** : ADR-0001, point 6 ; `tools/README.md`, section « Banque d'images, `src/imgdata.js` »,
  et ses deux scripts d'insertion et de régénération

## Contexte

La banque d'images n'existait que sous forme d'une ligne JSON de 3 697 490 octets,
`src/imgdata.js`, modifiable par script seulement, où aucune image n'était lisible, comparable ou
remplaçable comme fichier. Fréquence : à chaque ajout ou remplacement d'illustration, 58 images
à ce jour.

Mesuré sur l'archive du 27 septembre 2026, v2.25 :

- régénéré depuis son propre contenu, JSON compact, `ensure_ascii=False`, `;\n\n` final, le
  fichier se redonne octet pour octet ;
- 58 images, préfixe unique `data:image/jpeg;base64`, aller-retour base64 exact, 2 771 080
  octets de JPEG, toutes ouvertes par `FFD8FF` et fermées par `FFD9`, clés toutes ASCII ;
- l'ordre des clés n'est reproduit par aucun tri, ni par clé, ni par nom de fichier `<id>.jpg`
  (seules les douze premières clés suivent ce second tri) : c'est l'ordre d'ajout ;
- l'ordre n'a aucun effet fonctionnel : l'app ne fait que des accès `IMG[id]` (`app1`, `app6`,
  `app7`, `app9`), `test22` compte les clés et cherche les orphelines.

## Décision

Tranchée par Claude, Gabriel lui ayant laissé les sept points de conception le 27 septembre 2026.

1. Une illustration par fichier, `src/img/<id>.jpg`, sortie de `prep_illus.py` telle quelle.
   L'identifiant est le nom de fichier sans extension, égal à la clé dans `DB` ou à `img` d'une
   étape de `WARMUP`.
2. L'ordre des clés est porté par un manifeste, `src/img/ordre.txt`, un identifiant par ligne,
   en LF, saut de ligne final compris. Un ajout se fait en fin de fichier.
3. `tools/imgdata.py`, en Python, fabrique `build/imgdata.js`. `build.sh` le lance après la copie
   à plat et avant l'assemblage : `python3 tools/imgdata.py src/img build/imgdata.js`. Sortie :
   `const IMG=`, `json.dumps(d, separators=(',', ':'), ensure_ascii=False)`, `;\n\n`, écrite en
   binaire. Refus, sortie 1, sans rien écrire : manifeste absent, vide, sans saut de ligne final
   ou avec une ligne vide ; identifiant hors `^[a-z0-9]+(-[a-z0-9]+)*$`, ce qui attrape un CR ;
   doublon ; ligne sans fichier ; fichier absent du manifeste ; toute entrée autre qu'un `.jpg` ou
   le manifeste ; JPEG sans `FFD8FF` en tête ou `FFD9` en fin ; cible déjà présente.
4. `src/imgdata.js` sort du dépôt (`git rm`). Les JPEG sont la seule source. `dist/index.html`
   reste commité : retour arrière inchangé.
5. `build.sh` ne recopie plus que `src/*.html src/*.js` : son ancien motif `src/*` aurait fait un
   `cp -p` sur le dossier `src/img`, qui échoue sous `set -e`.
6. Banc `falsifimg.sh`, seizième, sur le générateur : témoin intact identique au build, chaque
   refus défait, permutation du manifeste qui doit changer la sortie.
7. Garde d'identité dans `bancs.yml`, après le build, la même qu'au déploiement : un push sans tag
   éprouve la reproduction sur machine neutre.
8. `.gitattributes` inchangé : `*.jpg binary` y figure depuis la migration, le manifeste est en LF
   par `* text=auto eol=lf`.

## Écartés

- **Trier les clés**, par identifiant ou par nom de fichier. Sans effet fonctionnel, mais
  `dist/index.html` changeait sans que `VERSION` change : le fichier commité et le fichier servi
  auraient porté tous deux v2.25 avec des octets différents jusqu'au tag suivant, et la preuve du
  lot passait d'un `cmp` à une comparaison structurelle.
- **Préfixe d'ordre dans les noms** (`07-dead-bug.jpg`) : le nom de fichier cesse d'être
  l'identifiant, convention du carnet section 3.
- **Ordre par date de fichier** : Git ne conserve pas les dates.
- **`src/imgdata.js` régénéré et suivi par Git** : deux sources de la même banque, et un fichier
  suivi réécrit par chaque build.
- **Générateur en heredoc dans `build.sh`** : ses refus n'auraient pas pu être éprouvés par un
  banc sans reconstruire tout le build.
- **Dossier `img/` à la racine** : les images sont une source de l'app, `src/` les porte.

## Conséquences

- **Extraction initiale** par un script à usage unique, non commité : 58 JPEG et le manifeste
  dans l'ordre d'origine. Trois preuves : SHA-256 de chaque fichier écrit égal à celui du base64
  décodé, 0 écart ; sortie du générateur identique à l'ancien `src/imgdata.js` selon `cmp` ;
  `./build.sh` après retrait, 205 s, cinquante suites vertes, `dist/index.html` identique à celui
  de l'archive d'entrée, 4 210 036 octets.
- Seize bancs relancés depuis `build/`, 161 s, tous sortis à 0, `grep` des motifs de survie muet ;
  `falsifimg` : 16 mutations, 0 survie. Les quinze anciens bancs réassemblent depuis
  `build/imgdata.js`, qui existe toujours, et restent inchangés.
- **Un `src/imgdata.js` qui survit à l'extraction**, parce qu'une extraction ne supprime rien et
  que le `git rm` a été oublié, serait recopié dans `build/` : le générateur refuse alors d'écrire
  et le build s'arrête. Éprouvé : sortie 1, `dist/index.html` intouché.
- **Vérifié sur runner le 27 septembre 2026** : push du lot sur `main`, job `bancs` vert en
  4 min 3 s, build, garde d'identité et seize bancs compris. Le `dist/index.html` commité est
  reproduit depuis `src/img/` sur une machine neutre : JPEG intacts et manifeste en LF après
  checkout, sans quoi le générateur ou la garde aurait échoué.
- `test22` inchangée : elle lit `IMG` dans `check.js`, une clé orpheline y échoue comme avant.
- Ajouter, remplacer ou retirer une illustration change `dist/index.html`, donc la version.
  Procédure dans `tools/README.md`.
- **Envoi S3 en plusieurs parties (ADR-0002)** : relu, sans objet. `dist/index.html` est
  identique, 4 210 036 octets contre 8 388 608 pour 8 Mio.
- `bancs.yml` touché : `actionlint` avec `shellcheck`, vert.
- Aucune instruction de Gabriel contestée.
