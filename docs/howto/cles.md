# Clés de synchronisation

**CloudShell `us-east-1`, à la racine du clone ; `cle.sh` vise lui-même `eu-west-3`**, où vit le
paramètre SSM `/palier/utilisateurs`. La session ne change pas de région.

```bash
cd ~/palier
./infra/cle.sh nouvelle <id>   # cle neuve ; remplace et revoque celle de <id>, apres confirmation
./infra/cle.sh retirer <id>    # revocation sans remplacement ; les donnees en ligne restent
./infra/cle.sh liste           # identifiants, jamais les empreintes
```

Identifiant en `[a-z0-9-]`, 1 à 32 caractères : il devient le nom de l'objet `state/<id>.json`.
La clé ne s'affiche qu'une fois et n'est écrite nulle part. Une clé neuve sert sous 15 s, une
révocation prend effet sous 5 minutes. Perte de clé : `nouvelle` sur le même identifiant, les
données suivent. Supprimer les données d'un utilisateur sans son appareil : purger toutes les
versions de son objet, pas un simple `aws s3 rm`, qui poserait un marqueur et laisserait
l'historique 90 jours.

`./infra/testedge.sh` refuse de tourner avec la clé `gabriel`, un état étant en ligne : le
relancer avec une clé `test` créée par `cle.sh nouvelle test`, puis retirée.
