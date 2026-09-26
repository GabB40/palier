# Déploiement

Toujours dans CloudShell ouvert en **`us-east-1`**, à la racine du clone (`~/palier`). La région
de chaque commande est dans la commande ou dans le script ; la session ne change jamais de région.

## App

**CloudShell `us-east-1` ; `deploy.sh` vise `us-east-1`.**

```bash
cd ~/palier && git pull --ff-only && ./infra/deploy.sh dist/index.html
```

`--ff-only` refuse tout état local divergent : on ne modifie rien dans CloudShell. Le script
dépose le fichier avec `Cache-Control: no-cache`, invalide `/index.html` et `/`, attend la fin de
l'invalidation, vérifie que l'URL publique sert la `VERSION` du fichier, et sort en échec sinon.

**Retour arrière, CloudShell `us-east-1`.** Une version précédente se redépose depuis l'historique
Git :

```bash
cd ~/palier && git log --oneline -- dist/index.html
git show <commit>:dist/index.html > /tmp/index.html && ./infra/deploy.sh /tmp/index.html
```

Le bucket est aussi versionné, 30 jours et au moins 10 versions.

## Infra, stack `palier-edge`

**CloudShell `us-east-1` ; lecture en `eu-west-3`, déploiement en `us-east-1`.**

```bash
cd ~/palier && git pull --ff-only
H=$(aws cloudformation describe-stacks --region eu-west-3 --stack-name palier-backend \
  --query "Stacks[0].Outputs[?OutputKey=='ApiHote'].OutputValue" --output text)
echo "$H"
aws cloudformation deploy --region us-east-1 --stack-name palier-edge \
  --template-file infra/palier-edge.yaml \
  --parameter-overrides AttacherAlias=oui AttacherWaf=oui ApiHote=$H
```

Le `echo` doit afficher un hôte en `.lambda-url.eu-west-3.on.aws`. Toujours passer les trois
paramètres ; `ApiHote` vide retire `/api/*` et coupe la synchronisation. **Ne jamais redéployer
avec `AttacherWaf=non`** : le forfait interdit le retrait de l'ACL. Contraintes du forfait dans
`docs/backend.md`.

## Infra, stack `palier-backend`

**CloudShell `us-east-1` ; lecture en `us-east-1`, déploiement en `eu-west-3`.**

```bash
cd ~/palier && git pull --ff-only
D=$(aws cloudformation describe-stacks --region us-east-1 --stack-name palier-edge \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
aws cloudformation deploy --region eu-west-3 --stack-name palier-backend \
  --template-file infra/palier-backend.yaml --capabilities CAPABILITY_IAM \
  --parameter-overrides DistributionId=$D
```
