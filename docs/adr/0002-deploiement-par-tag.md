# ADR-0002 : une version se déploie par un tag `v*`, GitHub Actions et un rôle OIDC

- **Date** : 2026-09-27
- **Statut** : accepté
- **Remplace** : carnet, section 6, règle « Après livraison » (texte d'origine en fin de document) ;
  ADR-0001, point 4 pour le chemin de déploiement, et « Suite prévue »

## Contexte

Chaque version en ligne passait par une étape manuelle dans CloudShell, `git pull` puis
`deploy.sh`, jouée avec les droits de la console, sans vérification liant le commit, la version
annoncée et le fichier servi. Fréquence : une fois par version. Aucun incident de dépôt n'est
relevé : le lot retire une étape manuelle et un droit trop large, il ne répare pas une panne.

## Décision

1. Un tag `v*` poussé déclenche `.github/workflows/deploiement.yml` : checkout, Node 22,
   `./build.sh`, trois gardes, identifiants AWS, puis `./infra/deploy.sh dist/index.html`,
   inchangé. Un seul chemin de dépôt pour la CI et le manuel.
2. Trois gardes, dans cet ordre, **avant** tout identifiant AWS :
   - **identité** : après le build, `git status --porcelain` est vide. Le `dist/index.html` commité
     est reproduit octet pour octet sur une machine neutre ;
   - **version** : le tag est exactement `v` suivi de la `VERSION` du fichier construit.
     Contrainte de Gabriel : un tag `v2.27` sur une v2.26 ne dépose rien ;
   - **atteignabilité** : le commit tagué est un ancêtre de `origin/main`. On pousse donc le tag
     avec `main`, jamais avant : `git push --atomic origin main vX.Y`.
3. Rôle `palier-ci-deploiement`, stack `palier-ci` (`infra/palier-ci.yaml`), déployée à la main
   depuis CloudShell `us-east-1`, hors de `palier-edge`. Confiance : `aud` égal à
   `sts.amazonaws.com`, `sub` en `StringLike` sur
   `repo:GabB40@49393475/palier@1389785465:ref:refs/tags/v*`. Le dépôt, créé après le 15 juillet
   2026, reçoit de GitHub le `sub` au format immuable, identifiants du propriétaire et du dépôt
   accolés aux noms : un nom recyclé ne peut plus émettre ce `sub`. Pas d'`environment:` dans le
   job, qui changerait le `sub`. Droits calés sur `deploy.sh` :
   `cloudformation:DescribeStacks` sur `palier-edge`, `s3:PutObject` sur
   `palier-site-727646498837/index.html` seul (bucket en AES256, aucun droit KMS),
   `cloudfront:CreateInvalidation` et `GetInvalidation` sur la distribution.
4. Le fournisseur OIDC `token.actions.githubusercontent.com` existait avant le lot : créé à la
   main le 5 juillet 2026, par root, pour le rôle `cv-deploy-github` du dépôt `cv-2026`, hors de
   toute stack en `us-east-1` et `eu-west-3`, audience `sts.amazonaws.com`. Unique par compte et
   partagé, il reste hors stack et ne se supprime jamais.
5. `dist/index.html` reste commité, arbitré par Gabriel le 27 septembre 2026. Retour arrière,
   contrôle d'archive et procédure de session sont inchangés.
6. Bancs : `.github/workflows/bancs.yml`, à chaque push sur `main` et à la demande. Il ne
   conditionne pas le déploiement ; il sort en échec si un banc sort non nul ou si un journal porte
   un motif de survie, `falsif36` sortant à 0 sur une mutation non détectée.
7. Actions épinglées par SHA de commit, version en commentaire ; `persist-credentials: false`.
   Workflow touché : `actionlint`, avec `shellcheck`, au contrôle avant livraison.
8. L'infra reste manuelle. CloudShell garde le dépôt manuel en secours et le retour arrière.

## Écartés

- **Rôle dans `palier-edge`** : ses redéploiements sont contraints par le forfait CloudFront, et
  le rôle n'a pas son cycle de vie.
- **Clés d'accès IAM en secret GitHub** : secret de long terme, à faire tourner, qui survit à tout
  job.
- **`dist/` en `.gitignore`**, intention écrite à l'ADR-0001 : on perdait la preuve de
  reproduction sur une machine neutre, et le retour arrière, le contrôle d'archive et la procédure
  de session étaient à réécrire, pour un gain de 4 Mo stockés en delta.
- **Paramètre de création du fournisseur** : il existe, et un paramètre pour reconstruire dans un
  autre compte est de trop.
- **Bancs bloquants dans le workflow de tag** : un banc qui ne mord plus dit qu'une suite est
  faible, pas que l'app est fausse.
- **`environment:` GitHub** : il change le `sub`, et ses règles de protection dépendent du plan sur
  un dépôt privé.
- **Redéploiement d'un ancien tag par `workflow_dispatch`** : un tag antérieur au lot ne porte pas
  le workflow. Le retour arrière reste dans CloudShell.

## Conséquences

- Mesuré le 27 septembre 2026, sur la machine de Claude, un cœur : build 201 s, quinze bancs
  159 s, tous à 0, grep muet. Sur runner, premier passage de `bancs`, build compris : 5 min 20 s,
  vert. Durée du job de déploiement à relever au premier tag réussi.
- **Premier tag, `v2.25`, refusé à l'étape des identifiants**, après les trois gardes vertes :
  rien n'a été déposé. La confiance attendait le `sub` à l'ancien format, par noms seuls, écrit
  sur le modèle de `cv-deploy-github`, dont le dépôt est antérieur au 15 juillet 2026. CloudTrail
  a donné le `sub` reçu ; la confiance le reprend. Douze `AccessDenied` pour un job :
  `configure-aws-credentials` réessaie avant d'abandonner. Leçon : lire le `sub` émis plutôt que
  le recopier d'un dépôt voisin.
- La confiance de `cv-deploy-github` porte sur `repo:GabB40/cv-2026:ref:refs/heads/main` seul :
  les workflows de `palier` ne peuvent pas l'assumer.
- Gardes éprouvées sur un dépôt de test, avant livraison :
  - v2.25 sur `main` passe les trois gardes ;
  - `v2.26`, `v2.25.1`, `V2.25`, `2.25` et `v2.2` échouent à la garde de version ;
  - un `dist/index.html` commité différent du build échoue à la garde d'identité ;
  - un commit hors de `main` échoue à la garde d'atteignabilité ;
  - l'étape des bancs passe sur les quinze bancs, et échoue sur deux bancs factices, l'un sorti
    à 3, l'autre sorti à 0 avec `SURVIT` au journal.

  Un tag poussé avant `main` échoue à tort : relancer le job une fois `main` poussé.
- **Risque WAF, à lire au premier tag.** Le `curl` final de `deploy.sh` passe par l'ACL depuis une
  IP de runner. S'il est bloqué, le fichier est déposé et le cache invalidé : le job rouge signifie
  « vérification impossible », pas « dépôt raté ». On vérifie alors depuis le poste.
- `aws s3 cp` passe en multipart au-delà de 8 Mio. `s3:PutObject` le couvre, mais pas
  `AbortMultipartUpload`, qui ne sert qu'en cas d'échec. À relire au lot des JPEG si la taille
  bouge.
- Premier tag : `v2.25` sur le commit de ce lot. Il redépose les octets déjà servis et éprouve le
  chemin complet sans rien changer en ligne.
- Les SHA épinglés ne suivent pas les versions des actions : une montée se fait à la main, dans un
  lot.

## Carnet, section 6 : règle remplacée, texte d'origine

- Après livraison : Gabriel extrait l'archive à la racine du dépôt, commite en une phrase et
  pousse ; puis, dans CloudShell `us-east-1`, `git pull --ff-only` et
  `./infra/deploy.sh dist/index.html` (`docs/howto/deploiement.md`)
