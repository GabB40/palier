# CloudShell

CloudShell s'ouvre et reste en **`us-east-1` (N. Virginia)** : son répertoire personnel est
propre à chaque région, et le clone y vit. La région visée par chaque commande AWS est portée par
son option `--region`, ou par le script lui-même. Ne jamais changer la région de la session.

## Mise en place, une fois

Chaque étape se joue dans CloudShell ouvert en `us-east-1`, sauf l'étape 2, sur GitHub.

1. **CloudShell `us-east-1`.** Clé de déploiement propre au dépôt :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/palier_deploy -N "" -C "cloudshell-palier"
cat ~/.ssh/palier_deploy.pub
```

2. **GitHub.** Dépôt `palier`, Settings, Deploy keys, Add deploy key : coller la clé publique,
   **sans** cocher Allow write access. CloudShell lit, il ne pousse jamais.

3. **CloudShell `us-east-1`.** Hôte SSH dédié, puis test :

```bash
cat >> ~/.ssh/config << 'EOF2'
Host github-palier
  HostName github.com
  User git
  IdentityFile ~/.ssh/palier_deploy
  IdentitiesOnly yes
EOF2
chmod 600 ~/.ssh/config
ssh -T github-palier
```

   À la première connexion, l'empreinte ED25519 affichée se compare à celle publiée par GitHub
   (page « GitHub's SSH key fingerprints ») avant de répondre `yes`. Attendu : un message
   d'authentification réussie qui nomme le dépôt.

4. **CloudShell `us-east-1`.** Clone, puis comparaison des fichiers déjà présents :

```bash
git clone github-palier:GabB40/palier.git ~/palier
cd ~ && for f in palier-edge.yaml palier-backend.yaml deploy.sh cle.sh testedge.sh; do
  [ -f "$f" ] && { cmp -s "$f" "palier/infra/$f" && echo "$f identique" || echo "$f DIFFERENT"; }
done
[ -f index.html ] && { cmp -s index.html palier/dist/index.html && echo "index.html identique" || echo "index.html DIFFERENT"; }
```

   Un fichier `DIFFERENT` s'examine avant d'aller plus loin : le dépôt doit être ce qui tourne.

5. **CloudShell `us-east-1`.** Les anciennes copies quittent la racine, sans être supprimées :

```bash
mkdir -p ~/avant-depot && mv ~/palier-edge.yaml ~/palier-backend.yaml ~/deploy.sh ~/cle.sh \
  ~/testedge.sh ~/index.html ~/avant-depot/ 2>/dev/null; ls ~/avant-depot
```

6. **CloudShell `us-east-1`.** Premier déploiement depuis le clone, du fichier déjà servi : il
   éprouve le chemin complet sans rien changer en ligne.

```bash
cd ~/palier && ./infra/deploy.sh dist/index.html
```

   Attendu : `OK : https://palier.s1t3.link sert la v2.24`.

## Entretien

CloudShell efface le répertoire personnel d'une région après 120 jours sans session : refaire
alors les étapes 1 à 4, la clé de déploiement perdue se retire côté GitHub.
