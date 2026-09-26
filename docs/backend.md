# PALIER : backend et hébergement

Infra de `https://palier.s1t3.link`, reconstructible depuis ce document et `infra/`. Le code de
l'app vit dans `src/` ; ici, tout ce qui vit hors d'`index.html`. Toutes les commandes se lancent
depuis CloudShell, **région `us-east-1`**, à la racine du clone du dépôt : le répertoire personnel
de CloudShell est propre à chaque région, et c'est là que vit le clone (`docs/howto/cloudshell.md`).
Chaque commande porte sa région explicitement.

## Découpage

| Stack | Région | Contenu | État |
|---|---|---|---|
| `palier-edge` | `us-east-1` | bucket du site `palier-site-727646498837`, OAC, ACL WAF `palier-waf`, distribution, enregistrements A et AAAA ; OAC `palier-api-…`, origine Lambda et comportement `/api/*` | en service depuis le 25 septembre 2026, `/api/*` depuis le 26 septembre |
| `palier-ci` | `us-east-1` | rôle `palier-ci-deploiement`, assumé en OIDC par GitHub Actions sur tag `v*`, droits calés sur `deploy.sh` | en service depuis le 27 septembre 2026, premier tag `v2.25`, ADR-0002 |
| `palier-backend` | `eu-west-3` | bucket d'état `palier-etat-727646498837`, Lambda `palier-etat` et sa Function URL, journal | en service depuis le 26 septembre 2026 ; client v2.24 |

`palier-edge` est en `us-east-1` parce qu'une ACL WAF de portée CloudFront ne se crée que là. Le
backend reste en `eu-west-3` : les données des utilisateurs restent en Europe.

**Hors stack, jamais supprimés** : le certificat ACM `65d9a470…` (`us-east-1`), passé en
paramètre ; la zone `s1t3.link`, qui porte d'autres sites ; l'enregistrement CNAME
`_93d0b4…acm-validations.aws`, qui sert au renouvellement du certificat. En `eu-west-3`, le
paramètre SSM `/palier/utilisateurs`, table des clés, que seul `cle.sh` écrit : une ressource de
stack aurait vu sa valeur réécrite à la première mise à jour. Le bucket d'état survit à la
suppression de la stack (`Retain`) et se supprime à la main. Global, le fournisseur OIDC
`token.actions.githubusercontent.com`, unique par compte : créé à la main le 5 juillet 2026 pour le
rôle `cv-deploy-github` du dépôt `cv-2026`, partagé depuis avec `palier-ci`.

Budget de garde à 1 $ par mois avec alerte, hors stack, inchangé.

## Forfait CloudFront gratuit

La distribution est abonnée au forfait CloudFront gratuit : WAF, protection DDoS et DNS inclus,
aucun dépassement facturé. L'ancienne distribution l'était aussi ; le carnet la disait « sans WAF »,
à tort. Contraintes constatées :

- une ACL est obligatoire, propre à la distribution, et ne peut pas être retirée tant que le
  forfait est actif ;
- **aucune règle ne peut porter sur un motif** : `ByteMatch` et regex sont refusés à l'abonnement
  (« configuration not available in this tier: byte match »). Une règle ne se limite donc pas à un
  chemin ;
- le passage de règles gérées en comptage (`RuleActionOverrides`) est accepté ;
- seules les politiques de cache et de requête gérées par AWS sont admises ;
- 5 comportements de cache et 5 règles WAF au plus ;
- 3 forfaits gratuits par compte, tous pris ;
- l'abonnement se fait à la console, CloudFormation ne le gère pas ;
- un forfait gratuit s'annule immédiatement, section Billing de la distribution, Manage plan,
  Cancel plan ; une distribution sous forfait ne se supprime qu'après cette annulation.

**ACL `palier-waf`, quatre règles.** Les trois jeux gérés de l'ancienne ACL, réputation IP, règles
communes, entrées malveillantes connues, sur tout le site. Les sept règles qui inspectent le corps
des requêtes y passent en comptage. Le site ne reçoit que des GET, sans corps, donc on n'y perd
rien. L'API du lot B recevra un corps compressé en gzip, que le WAF ne décompresse pas : ces règles
bloqueraient au-delà de 8 Ko ou sur un motif trouvé par hasard dans des octets compressés. La
protection de l'API est la clé vérifiée par la Lambda, la limite de taille et la concurrence
plafonnée. Quatrième règle, une limitation de débit à 300 requêtes par 5 minutes et par IP, sur
tout le site faute de pouvoir la limiter à `/api/`. Une ouverture de l'app fait une ou deux
requêtes.

## Mesuré après la bascule, 25 septembre 2026

`HTTP/2 200`, `content-type: text/html; charset=utf-8`, `cache-control: no-cache`,
`content-encoding: br`, 2 912 583 octets reçus pour un fichier de 4 186 053. Deux passages
successifs : `Miss` puis `RefreshHit`, CloudFront revalidant auprès du bucket comme `no-cache` le
demande. L'ancien hébergement ne posait aucun `Cache-Control`, contrairement à ce que disait le
carnet : les navigateurs appliquaient un cache heuristique.

Mesurer la compression en GET : `curl -I` fait une requête HEAD, qui n'a pas renvoyé
`content-encoding`.

## Mise à jour de l'app et de l'infra

Procédures dans `docs/howto/deploiement.md` : un tag `v*` pour l'app, `./infra/deploy.sh
dist/index.html` en secours,
`aws cloudformation deploy` sur `infra/palier-edge.yaml` ou `infra/palier-backend.yaml` pour
l'infra, retour arrière compris. Règles à retenir : toujours passer les trois paramètres de
`palier-edge` explicitement, **ne jamais redéployer avec `AttacherWaf=non`**, et vérifier toute
nouvelle règle WAF contre les contraintes du forfait avant de l'écrire.

## Synchronisation : mise en place

Depuis la racine du clone dans CloudShell `us-east-1` ; chaque commande porte
`--region eu-west-3`. Journal de la mise en place du 26 septembre 2026, chemins mis à jour à la
migration vers le dépôt : la rejouer ne sert qu'à une reconstruction.

**0. Prérequis, concurrence du compte.** La concurrence réservée à 2 échoue si le compte est au
plancher des comptes récents :

```bash
aws lambda get-account-settings --region eu-west-3 --query AccountLimit
```

`ConcurrentExecutions` à 10 : demander un relèvement du quota avant de déployer. C'était le cas du
compte : relevé à 1 000 le 26 septembre 2026, par un cas de support ouvert automatiquement.

```bash
aws service-quotas request-service-quota-increase --region eu-west-3 \
  --service-code lambda --quota-code L-B99A9384 --desired-value 1000
```

**1. Stack.** Pas d'`ImportValue` entre régions : l'identifiant de la distribution se lit dans les
sorties de `palier-edge` et se passe en paramètre. Pas de cycle, la distribution existant déjà.

```bash
D=$(aws cloudformation describe-stacks --region us-east-1 --stack-name palier-edge \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
aws cloudformation deploy --region eu-west-3 --stack-name palier-backend \
  --template-file infra/palier-backend.yaml --capabilities CAPABILITY_IAM \
  --parameter-overrides DistributionId=$D
```

Même commande pour toute mise à jour.

**2. Première clé.** `./infra/cle.sh nouvelle gabriel`. La clé ne s'affiche qu'une
fois et n'est écrite nulle part ; l'envoyer par e-mail comme convenu.

**3. Vérifications, avant l'étape 2.** L'URL appelée en direct, sans signature, doit répondre 403 :

```bash
H=$(aws cloudformation describe-stacks --region eu-west-3 --stack-name palier-backend \
  --query "Stacks[0].Outputs[?OutputKey=='ApiHote'].OutputValue" --output text)
curl -s -o /dev/null -w '%{http_code}\n' "https://$H/api/state"
```

Puis la Lambda invoquée directement avec la clé, qui éprouve les droits SSM et S3 réels. Attendu :
`statusCode` 404, rien en ligne. Un 503 désigne un droit manquant, le journal
`/aws/lambda/palier-etat` nomme l'erreur ; un 401, une clé mal recopiée.

```bash
read -rs -p "cle : " K; echo; K=${K//-/}
aws lambda invoke --region eu-west-3 --function-name palier-etat \
  --cli-binary-format raw-in-base64-out \
  --payload "{\"rawPath\":\"/api/state\",\"requestContext\":{\"http\":{\"method\":\"GET\"}},\"headers\":{\"x-palier-key\":\"$K\"}}" \
  /tmp/r.json >/dev/null && cat /tmp/r.json; echo; unset K; rm -f /tmp/r.json
```

Déploiement du 26 septembre 2026 : 403 en direct, 404 `absent` à l'invocation.

**4. Comportement `/api/*` de `palier-edge`.** Mise à jour de la stack avec `ApiHote`, commande de
la section « Mise à jour de l'infra ». Puis, propagation faite, `./infra/testedge.sh` : quatorze
vérifications de bout en bout à travers la distribution, clé saisie masquée. Il refuse de tourner
si un état est déjà en ligne pour la clé, car il finit par le purger, et purge l'état de test
même en cas d'échec en cours de route. Ses 304 et 412 prouvent que CloudFront transmet les
en-têtes conditionnels ; son 403 sur un `PUT` sans `x-amz-content-sha256`, que le client devra
porter l'empreinte du corps. Déploiement du 26 septembre 2026 : quatorze vérifications vertes,
ETag fort de bout en bout.

**5. Client, v2.24.** Les étapes 0 à 4 sont faites une fois pour toutes, le 26 septembre 2026 :
pour mettre le client en service, seule cette étape se joue. Rien ne change côté infra :
`./infra/deploy.sh dist/index.html` depuis CloudShell `us-east-1`, comme toute version. Le client, `src/app10.js`, est
éprouvé par `test49`, qui le fait parler au code de la Lambda extrait d'`infra/palier-backend.yaml`. Mise en
service, dans cet ordre :

1. Export du jour sur l'appareil principal, par précaution.
2. Sur cet appareil, Réglages > Synchronisation, saisie de la clé : rien en ligne, l'état part.
   En-tête attendu « à l'instant ».
3. Sur chaque autre appareil, la clé **avant toute séance** : rien en local, l'état revient.
   S'il a déjà ses propres séances, la page pose la question.
4. Journal `/aws/lambda/palier-etat` en `eu-west-3` : une ligne par appel, `GET` en 304 à chaque
   ouverture, `PUT` en 200 après chaque enregistrement regroupé.

Mise en service du 26 septembre 2026 : synchronisation activée sur le PC, récupération vérifiée
sur un second appareil.

`testedge.sh` refuse désormais de tourner avec la clé `gabriel`, un état étant en ligne : pour le
relancer, une clé de test créée par `cle.sh nouvelle test` puis retirée.

## Clés

Procédures dans `docs/howto/cles.md`.

## API

Contrat arrêté et motivé dans le carnet, section 5, bloc « Synchronisation entre appareils ».
Route unique `/api/state` ; `x-palier-key` sous forme canonique, 20 caractères de Crockford sans
tiret.

| Méthode | Conditions | Réponses |
|---|---|---|
| `GET` | `If-None-Match` facultatif | 200 gzip, `ETag`, `x-palier-version` ; 304 ; 404 |
| `PUT` | `If-Match: <etag>` ou `If-None-Match: *`, corps gzip binaire | 200 et `ETag` ; 400 ; 412 ; 413 ; 428 |
| `DELETE` | aucune | 204, toutes versions purgées |

Communes : 401 clé inconnue ou mal formée, 404 autre chemin, 405 autre méthode, 503 panne de S3 ou
de SSM. Journal : une ligne JSON par appel, méthode, statut, identifiant, taille ; jamais la clé
ni le corps.

## Migration du 25 septembre 2026, telle qu'elle s'est déroulée

Hébergement fait à la main remplacé par la stack, même domaine, donc mêmes données locales sur
tous les appareils. Journal pour une prochaine reconstruction :

1. Inventaire en lecture seule de l'existant. Trois écarts au carnet : WAF présent sous forfait
   gratuit, aucun `Cache-Control` sur `index.html`, classe de prix `PriceClass_All` et non NA+EU.
2. Stack créée sans alias ni WAF, app déposée, testée sur `d….cloudfront.net`, origine différente
   donc stockage vide.
3. Forfait gratuit de l'ancienne distribution annulé : immédiat, elle est passée à l'usage.
4. Son ACL `CreatedByCloudFront-c91a7875`, facturée à l'usage hors forfait, a été détachée ; elle
   avait disparu de la console WAF au moment de la supprimer.
5. Alias retiré de l'ancienne distribution, enregistrement A manuel supprimé, stack mise à jour
   avec alias et ACL. La première ACL portait des `ByteMatch` limitant deux règles à tout sauf
   `/api/` et une à `/api/` seul ; l'abonnement les a refusés. ACL réécrite sans motif, stack
   remise à jour, abonnement accepté, ACL `palier-waf` conservée par la console.
6. `deploy.sh` en vérification, progression présente sur le PC.
7. Nettoyage : ancienne distribution `E77C6V1YT2W2O` désactivée et supprimée, ancien OAC
   `E13WLIF4SJO8L0` supprimé, ancien bucket `palier.s1t3.link` vidé, versions comprises, puis
   supprimé.

## Fichiers

| Fichier | Rôle |
|---|---|
| `infra/palier-edge.yaml` | stack `palier-edge`, `us-east-1` |
| `infra/palier-backend.yaml` | stack `palier-backend`, `eu-west-3`, code de la Lambda en ligne |
| `infra/palier-ci.yaml` | stack `palier-ci`, `us-east-1`, rôle de déploiement |
| `infra/deploy.sh` | dépôt de l'app, invalidation, vérification de la version servie |
| `infra/cle.sh` | clés de synchronisation, table SSM en `eu-west-3` |
| `infra/testedge.sh` | vérification de bout en bout de l'API à travers CloudFront |

`testapi` lit les deux templates et exécute `cle.sh` ; `test49` lit `palier-backend.yaml`.
`build.sh` les recopie dans `build/` avant les suites. Les commentaires d'usage de `deploy.sh`
disent encore `./deploy.sh`, lot de migration mécanique : depuis la racine, c'est
`./infra/deploy.sh dist/index.html`.
