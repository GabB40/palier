# Git

## Création du dépôt, une fois

1. GitHub, New repository : nom `palier`, **Private**, sans README, sans `.gitignore`, sans
   licence : le premier commit apporte tout.
2. Premier commit, l'état d'avant : dans un dossier vide `palier`, les cinq .md du projet Claude
   (`PALIER-carnet-de-bord.md`, `PALIER-changelog.md`, `PALIER-code.md`, `PALIER-outillage.md`,
   `PALIER-backend.md`) et l'`index.html` v2.24, tels quels. Puis :

```bash
git init -b main
git config core.autocrlf false
git add .
git commit -m "<premier message livré>"
```

3. Second commit, la migration. Retirer les six fichiers :

```bash
git rm -q PALIER-*.md index.html
```

   Extraire l'archive livrée à la racine, puis :

```bash
git add .
git add --chmod=+x -- '*.sh'
git ls-files -s build.sh infra/deploy.sh      # 100755 attendu
git ls-files --eol dist/index.html            # i/lf attendu
git commit -m "<second message livré>"
git remote add origin git@github.com:GabB40/palier.git
git push -u origin main
```

`core.autocrlf false` garde le premier commit octet pour octet ; `.gitattributes`, présent dès le
second, fixe ensuite les fins de ligne à LF. Sans lui, `core.autocrlf` sous Windows convertit en CRLF et `dist/index.html` n'est plus celui
qui a été testé. `--chmod=+x` porte le bit d'exécution dans l'index, Windows ne le portant pas :
sans lui, `./infra/deploy.sh` est refusé dans CloudShell.

## Session de travail avec Claude

1. Archive d'entrée, depuis la racine, état commité seulement :

```bash
git archive --format=zip -o palier.zip HEAD
```

2. La joindre au premier message. Claude livre l'arbre complet à la structure du dépôt.
3. Extraire l'archive livrée à la racine en écrasant. Une extraction ne supprime rien : jouer les
   `git rm` annoncés dans le relevé.
4. `git status` : la liste doit être celle du relevé, ni plus ni moins.
5. Commit en une phrase, push, puis déploiement (`docs/howto/deploiement.md`).
