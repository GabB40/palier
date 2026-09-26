# PALIER : backend et hébergement

Infra de `https://palier.s1t3.link`, reconstructible depuis ce document. Le code de l'app vit dans
`PALIER-code.md` ; ici, tout ce qui vit hors d'`index.html`. Toutes les commandes se lancent depuis
CloudShell, **région `us-east-1`** : le répertoire personnel de CloudShell est propre à chaque
région, et c'est là que vivent `palier-edge.yaml`, `deploy.sh` et le dernier `index.html`. Chaque
commande porte sa région explicitement.

## Découpage

| Stack | Région | Contenu | État |
|---|---|---|---|
| `palier-edge` | `us-east-1` | bucket du site `palier-site-727646498837`, OAC, ACL WAF `palier-waf`, distribution, enregistrements A et AAAA ; OAC `palier-api-…`, origine Lambda et comportement `/api/*` | en service depuis le 25 septembre 2026, `/api/*` depuis le 26 septembre |
| `palier-backend` | `eu-west-3` | bucket d'état `palier-etat-727646498837`, Lambda `palier-etat` et sa Function URL, journal | en service depuis le 26 septembre 2026 ; client v2.24 |

`palier-edge` est en `us-east-1` parce qu'une ACL WAF de portée CloudFront ne se crée que là. Le
backend reste en `eu-west-3` : les données des utilisateurs restent en Europe.

**Hors stack, jamais supprimés** : le certificat ACM `65d9a470…` (`us-east-1`), passé en
paramètre ; la zone `s1t3.link`, qui porte d'autres sites ; l'enregistrement CNAME
`_93d0b4…acm-validations.aws`, qui sert au renouvellement du certificat. En `eu-west-3`, le
paramètre SSM `/palier/utilisateurs`, table des clés, que seul `cle.sh` écrit : une ressource de
stack aurait vu sa valeur réécrite à la première mise à jour. Le bucket d'état survit à la
suppression de la stack (`Retain`) et se supprime à la main.

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

## Mise à jour de l'app

`index.html` et `deploy.sh` téléversés dans CloudShell `us-east-1` :

```bash
chmod +x deploy.sh && ./deploy.sh index.html
```

Le script dépose le fichier avec `Cache-Control: no-cache`, invalide `/index.html` et `/`, attend
la fin de l'invalidation, puis vérifie que l'URL publique sert la `VERSION` du fichier déposé. Il
sort en échec sinon, et refuse un fichier qui ne porte pas de `VERSION`.

Retour arrière : le bucket est versionné, 30 jours et au moins 10 versions, et une version
précédente se redépose avec `deploy.sh`.

## Mise à jour de l'infra

```bash
H=$(aws cloudformation describe-stacks --region eu-west-3 --stack-name palier-backend \
  --query "Stacks[0].Outputs[?OutputKey=='ApiHote'].OutputValue" --output text)
echo "$H"
aws cloudformation deploy --region us-east-1 --stack-name palier-edge \
  --template-file palier-edge.yaml \
  --parameter-overrides AttacherAlias=oui AttacherWaf=oui ApiHote=$H
```

Toujours passer les trois paramètres explicitement ; `ApiHote` vide retire le comportement `/api/*`
et coupe la synchronisation. Le `echo` doit afficher un hôte en `.lambda-url.eu-west-3.on.aws`. **Ne jamais redéployer avec `AttacherWaf=non`** :
le forfait interdit le retrait de l'ACL. Toute nouvelle règle WAF se vérifie contre la liste des
contraintes du forfait avant d'être écrite, pas à l'abonnement.

Les deux paramètres à `non` ne servent qu'à une reconstruction complète : ils permettent de créer
la stack et de la tester sur le domaine `cloudfront.net` avant d'y attacher l'alias et l'ACL.

## Synchronisation : mise en place

`palier-backend.yaml`, `cle.sh` et `testedge.sh` téléversés dans CloudShell `us-east-1`, à côté de
`palier-edge.yaml` ; chaque commande porte `--region eu-west-3`.

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
  --template-file palier-backend.yaml --capabilities CAPABILITY_IAM \
  --parameter-overrides DistributionId=$D
```

Même commande pour toute mise à jour.

**2. Première clé.** `chmod +x cle.sh && ./cle.sh nouvelle gabriel`. La clé ne s'affiche qu'une
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
la section « Mise à jour de l'infra ». Puis, propagation faite, `./testedge.sh` : quatorze
vérifications de bout en bout à travers la distribution, clé saisie masquée. Il refuse de tourner
si un état est déjà en ligne pour la clé, car il finit par le purger, et purge l'état de test
même en cas d'échec en cours de route. Ses 304 et 412 prouvent que CloudFront transmet les
en-têtes conditionnels ; son 403 sur un `PUT` sans `x-amz-content-sha256`, que le client devra
porter l'empreinte du corps. Déploiement du 26 septembre 2026 : quatorze vérifications vertes,
ETag fort de bout en bout.

**5. Client, v2.24.** Les étapes 0 à 4 sont faites une fois pour toutes, le 26 septembre 2026 :
pour mettre le client en service, seule cette étape se joue. Rien ne change côté infra :
`./deploy.sh index.html` depuis CloudShell `us-east-1`, comme toute version. Le client, `app10.js`, est décrit dans `PALIER-code.md` et
éprouvé par `test49`, qui le fait parler au code de la Lambda extrait de ce document. Mise en
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

```bash
./cle.sh nouvelle <id>   # cle neuve ; remplace et revoque celle de <id>, apres confirmation
./cle.sh retirer <id>    # revocation sans remplacement ; les donnees en ligne restent
./cle.sh liste           # identifiants, jamais les empreintes
```

Identifiant en `[a-z0-9-]`, 1 à 32 caractères : il devient le nom de l'objet `state/<id>.json`.
Une clé neuve sert sous 15 s, une révocation prend effet sous 5 minutes. Perte de clé : `nouvelle`
sur le même identifiant, les données suivent. Supprimer les données d'un utilisateur sans son
appareil : purger toutes les versions de son objet, pas un simple `aws s3 rm`, qui poserait un
marqueur et laisserait l'historique 90 jours.

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

## palier-edge.yaml

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: >-
  PALIER, hebergement : bucket du site, OAC, ACL WAF, distribution CloudFront,
  enregistrements DNS. A deployer en us-east-1 (ACL de portee CLOUDFRONT).
  Le certificat ACM et la zone Route 53 vivent hors de la stack.

Parameters:
  NomDomaine:
    Type: String
    Default: palier.s1t3.link
  NomZone:
    Type: String
    Default: s1t3.link.
    Description: Zone Route 53 existante, point final compris.
  CertificatArn:
    Type: String
    Default: arn:aws:acm:us-east-1:727646498837:certificate/65d9a470-5ab8-4dbe-b350-1bec77457dc7
  AttacherAlias:
    Type: String
    AllowedValues: [oui, non]
    Default: non
    Description: >-
      non pendant le test sur le domaine cloudfront.net ; oui a la bascule,
      une fois l alias retire de l ancienne distribution et son enregistrement supprime.
  AttacherWaf:
    Type: String
    AllowedValues: [oui, non]
    Default: non
    Description: >-
      non pendant le test, l ACL se facturant a l usage hors forfait ;
      oui a la bascule, juste avant l abonnement au forfait gratuit.
  ApiHote:
    Type: String
    Default: ''
    AllowedPattern: '^$|^[a-z0-9]+\.lambda-url\.[a-z0-9-]+\.on\.aws$'
    Description: >-
      Sortie ApiHote de palier-backend, hote seul. Vide : pas de comportement
      /api/*, la distribution reste celle du site seul.

Conditions:
  AvecAlias: !Equals [!Ref AttacherAlias, oui]
  AvecWaf: !Equals [!Ref AttacherWaf, oui]
  AvecApi: !Not [!Equals [!Ref ApiHote, '']]

Resources:

  BucketSite:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub palier-site-${AWS::AccountId}
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerEnforced
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      # versioning : retour a la version precedente d index.html en cas de
      # depot rate ; les anciennes versions ne s accumulent pas
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: anciennes-versions
            Status: Enabled
            NoncurrentVersionExpiration:
              NoncurrentDays: 30
              NewerNoncurrentVersions: 10

  PolitiqueBucketSite:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref BucketSite
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: LectureParLaDistributionSeule
            Effect: Allow
            Principal:
              Service: cloudfront.amazonaws.com
            Action: s3:GetObject
            Resource: !Sub ${BucketSite.Arn}/*
            Condition:
              StringEquals:
                AWS:SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${Distribution}

  OacSite:
    Type: AWS::CloudFront::OriginAccessControl
    Properties:
      OriginAccessControlConfig:
        Name: !Sub palier-site-${AWS::AccountId}
        OriginAccessControlOriginType: s3
        SigningBehavior: always
        SigningProtocol: sigv4

  # Forfait gratuit : ni ByteMatch ni regex, donc aucune regle limitee a
  # /api/. Le site ne recoit que des GET, sans corps ; seule l API en porte un,
  # en gzip, binaire, que le WAF ne decompresse pas. Les regles qui inspectent
  # le corps passent donc en comptage partout : elles ne protegeaient rien sur
  # le site, et sur l API elles bloqueraient au-dela de 8 Ko ou au hasard d un
  # motif trouve dans des octets compresses. La protection de l API est la cle
  # verifiee par la Lambda, la limite de taille et la concurrence plafonnee.
  OacApi:
    Type: AWS::CloudFront::OriginAccessControl
    Condition: AvecApi
    Properties:
      OriginAccessControlConfig:
        Name: !Sub palier-api-${AWS::AccountId}
        OriginAccessControlOriginType: lambda
        SigningBehavior: always
        SigningProtocol: sigv4

  AclWaf:
    Type: AWS::WAFv2::WebACL
    Condition: AvecWaf
    Properties:
      Name: palier-waf
      Scope: CLOUDFRONT
      DefaultAction:
        Allow: {}
      VisibilityConfig:
        SampledRequestsEnabled: true
        CloudWatchMetricsEnabled: true
        MetricName: palier-waf
      Rules:
        - Name: reputation-ip
          Priority: 0
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesAmazonIpReputationList
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: reputation-ip
        - Name: regles-communes
          Priority: 1
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesCommonRuleSet
              RuleActionOverrides:
                - Name: SizeRestrictions_BODY
                  ActionToUse: {Count: {}}
                - Name: CrossSiteScripting_BODY
                  ActionToUse: {Count: {}}
                - Name: GenericLFI_BODY
                  ActionToUse: {Count: {}}
                - Name: GenericRFI_BODY
                  ActionToUse: {Count: {}}
                - Name: EC2MetaDataSSRF_BODY
                  ActionToUse: {Count: {}}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: regles-communes
        - Name: entrees-connues
          Priority: 2
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesKnownBadInputsRuleSet
              RuleActionOverrides:
                - Name: Log4JRCE_BODY
                  ActionToUse: {Count: {}}
                - Name: JavaDeserializationRCE_BODY
                  ActionToUse: {Count: {}}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: entrees-connues
        # sur tout le site, faute de pouvoir la limiter a /api/ : une
        # ouverture de l app fait une ou deux requetes, 300 en 5 minutes ne
        # gene aucun usage et ralentit toute tentative sur les cles
        - Name: debit
          Priority: 3
          Action:
            Block: {}
          Statement:
            RateBasedStatement:
              Limit: 300
              EvaluationWindowSec: 300
              AggregateKeyType: IP
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: debit

  Distribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Comment: PALIER
        Enabled: true
        DefaultRootObject: index.html
        HttpVersion: http2and3
        IPV6Enabled: true
        PriceClass: PriceClass_All
        Aliases: !If [AvecAlias, [!Ref NomDomaine], !Ref AWS::NoValue]
        ViewerCertificate: !If
          - AvecAlias
          - AcmCertificateArn: !Ref CertificatArn
            SslSupportMethod: sni-only
            MinimumProtocolVersion: TLSv1.2_2021
          - CloudFrontDefaultCertificate: true
        WebACLId: !If [AvecWaf, !GetAtt AclWaf.Arn, !Ref AWS::NoValue]
        Origins:
          - Id: site
            DomainName: !GetAtt BucketSite.RegionalDomainName
            OriginAccessControlId: !GetAtt OacSite.Id
            S3OriginConfig:
              OriginAccessIdentity: ''
          - !If
            - AvecApi
            - Id: api
              DomainName: !Ref ApiHote
              OriginAccessControlId: !GetAtt OacApi.Id
              CustomOriginConfig:
                OriginProtocolPolicy: https-only
                OriginSSLProtocols: [TLSv1.2]
            - !Ref AWS::NoValue
        DefaultCacheBehavior:
          TargetOriginId: site
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [GET, HEAD]
          CachedMethods: [GET, HEAD]
          Compress: true
          # Managed-CachingOptimized, politique geree : le forfait gratuit
          # n admet pas de politique personnalisee
          CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6
        # https-only et non redirect : une redirection perdrait le corps d un PUT.
        # Sept methodes : CloudFront n admet pas de sous-ensemble avec PUT, la
        # Lambda repond 405 au-dela de GET, PUT, DELETE. Compress a false : une
        # reponse recompressee verrait son ETag affaibli en W/. Politiques
        # gerees CachingDisabled et AllViewerExceptHostHeader : aucun cache, tous
        # les en-tetes transmis sauf Host, que la Function URL refuserait.
        CacheBehaviors: !If
          - AvecApi
          - - PathPattern: /api/*
              TargetOriginId: api
              ViewerProtocolPolicy: https-only
              AllowedMethods: [GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE]
              CachedMethods: [GET, HEAD]
              Compress: false
              CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
              OriginRequestPolicyId: b689b0a8-53d0-40ab-baf2-68738e2966ac
          - !Ref AWS::NoValue

  # Z2FDTNDATAQYW2 : zone hebergee fixe de CloudFront pour les alias
  DnsIpv4:
    Type: AWS::Route53::RecordSet
    Condition: AvecAlias
    Properties:
      HostedZoneName: !Ref NomZone
      Name: !Ref NomDomaine
      Type: A
      AliasTarget:
        DNSName: !GetAtt Distribution.DomainName
        HostedZoneId: Z2FDTNDATAQYW2
        EvaluateTargetHealth: false

  # absent de l hebergement manuel alors que la distribution sert l IPv6
  DnsIpv6:
    Type: AWS::Route53::RecordSet
    Condition: AvecAlias
    Properties:
      HostedZoneName: !Ref NomZone
      Name: !Ref NomDomaine
      Type: AAAA
      AliasTarget:
        DNSName: !GetAtt Distribution.DomainName
        HostedZoneId: Z2FDTNDATAQYW2
        EvaluateTargetHealth: false

Outputs:
  BucketSite:
    Value: !Ref BucketSite
  DistributionId:
    Value: !Ref Distribution
  DomaineCloudFront:
    Value: !GetAtt Distribution.DomainName
  UrlSite:
    Value: !If [AvecAlias, !Sub 'https://${NomDomaine}', !Sub 'https://${Distribution.DomainName}']
  AclWafArn:
    Condition: AvecWaf
    Value: !GetAtt AclWaf.Arn
```

## deploy.sh

```bash
#!/bin/bash
# Depose index.html sur l hebergement de la stack palier-edge, invalide le
# cache, puis verifie que la version servie est celle deposee.
# Usage, depuis CloudShell : ./deploy.sh [fichier]   (defaut : index.html)
set -euo pipefail
STACK=${STACK:-palier-edge}
REGION=us-east-1
F=${1:-index.html}

[ -f "$F" ] || { echo "fichier absent : $F"; exit 1; }
V=$(grep -o "const VERSION='[^']*'" "$F" | head -1 | cut -d"'" -f2 || true)
[ -n "$V" ] || { echo "VERSION introuvable dans $F : ce n est pas un index.html de PALIER"; exit 1; }

# 2>/dev/null || true : sous set -e, un describe-stacks en echec arretait le
# script sur l erreur brute d AWS avant le test qui suit
sortie(){ aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text 2>/dev/null || true; }
B=$(sortie BucketSite); D=$(sortie DistributionId); U=$(sortie UrlSite)
[ -n "$B" ] && [ "$B" != "None" ] || { echo "stack $STACK introuvable en $REGION"; exit 1; }

echo "v$V -> s3://$B ($U)"
# no-cache : le navigateur revalide a chaque ouverture au lieu d appliquer un
# cache heuristique, et un client perime ne survit pas a un depot
aws s3 cp "$F" "s3://$B/index.html" --region "$REGION" \
  --cache-control "no-cache" --content-type "text/html; charset=utf-8" --only-show-errors

I=$(aws cloudfront create-invalidation --distribution-id "$D" --paths "/index.html" "/" \
  --query Invalidation.Id --output text)
echo "invalidation $I en cours"
aws cloudfront wait invalidation-completed --distribution-id "$D" --id "$I"

S=$(curl -fsS "$U/" | grep -o "const VERSION='[^']*'" | head -1 | cut -d"'" -f2 || true)
if [ "$S" = "$V" ]; then echo "OK : $U sert la v$S"
else echo "ECHEC : $U sert la v${S:-?}, attendu v$V"; exit 1; fi
```

## palier-backend.yaml

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: >-
  PALIER, synchronisation : bucket d etat, Lambda et sa Function URL, derriere
  la distribution de palier-edge. A deployer en eu-west-3 : les donnees des
  utilisateurs restent en Europe. La table des cles vit hors de la stack, dans
  SSM, ecrite par cle.sh.

Parameters:
  DistributionId:
    Type: String
    AllowedPattern: '^E[A-Z0-9]+$'
    Description: Sortie DistributionId de palier-edge, seule autorisee a appeler l URL.
  NomTable:
    Type: String
    Default: /palier/utilisateurs
    AllowedPattern: '^/[A-Za-z0-9/_.-]+$'
    Description: >-
      Parametre SSM empreinte -> identifiant. Hors stack : une mise a jour de la
      ressource reecrirait sa valeur et effacerait les cles.

Resources:

  # Retain sur les deux politiques : UpdateReplacePolicy protege aussi d un
  # remplacement de la ressource, que DeletionPolicy seule ne couvre pas
  BucketEtat:
    Type: AWS::S3::Bucket
    DeletionPolicy: Retain
    UpdateReplacePolicy: Retain
    Properties:
      BucketName: !Sub palier-etat-${AWS::AccountId}
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerEnforced
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      VersioningConfiguration:
        Status: Enabled
      # 90 jours ET plus de 30 versions plus recentes : tout reste au moins
      # 90 jours, le 30 est un plancher. La suppression demandee par
      # l utilisateur purge toutes les versions, voir la Lambda.
      LifecycleConfiguration:
        Rules:
          - Id: anciennes-versions
            Status: Enabled
            NoncurrentVersionExpiration:
              NoncurrentDays: 90
              NewerNoncurrentVersions: 30

  PolitiqueBucketEtat:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref BucketEtat
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: TlsObligatoire
            Effect: Deny
            Principal: '*'
            Action: 's3:*'
            Resource:
              - !GetAtt BucketEtat.Arn
              - !Sub ${BucketEtat.Arn}/*
            Condition:
              Bool:
                aws:SecureTransport: 'false'

  # sans ressource declaree, le groupe est cree au premier appel et garde
  # ses journaux indefiniment
  JournalApi:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /aws/lambda/palier-etat
      RetentionInDays: 30

  RoleApi:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: palier-etat
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: [logs:CreateLogStream, logs:PutLogEvents]
                Resource: !Sub ${JournalApi.Arn}:*
              - Effect: Allow
                Action: [s3:GetObject, s3:PutObject, s3:DeleteObjectVersion]
                Resource: !Sub ${BucketEtat.Arn}/state/*
              # ListBucket : sans lui, un objet absent repond 403 et non 404,
              # et la premiere liaison ne distingue plus rien en ligne d un refus
              - Effect: Allow
                Action: [s3:ListBucket, s3:ListBucketVersions]
                Resource: !GetAtt BucketEtat.Arn
              - Effect: Allow
                Action: ssm:GetParameter
                Resource: !Sub arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter${NomTable}

  FonctionApi:
    Type: AWS::Lambda::Function
    DependsOn: JournalApi
    Properties:
      FunctionName: palier-etat
      Runtime: nodejs24.x
      Architectures: [arm64]
      Handler: index.handler
      MemorySize: 256
      Timeout: 10
      ReservedConcurrentExecutions: 2
      Role: !GetAtt RoleApi.Arn
      Environment:
        Variables:
          BUCKET: !Ref BucketEtat
          TABLE: !Ref NomTable
      Code:
        # CommonJS : le code inline n admet pas les modules ES
        ZipFile: |
          'use strict';
          // PALIER, API d etat : GET, PUT, DELETE sur /api/state.
          // L identifiant vient de la table SSM, jamais de la requete. La cle
          // arrive sous sa forme canonique, le client seul normalise.
          const {S3Client,GetObjectCommand,PutObjectCommand,ListObjectVersionsCommand,DeleteObjectsCommand}=require('@aws-sdk/client-s3');
          const {SSMClient,GetParameterCommand}=require('@aws-sdk/client-ssm');
          const zlib=require('zlib');
          const crypto=require('crypto');

          const BUCKET=process.env.BUCKET, TABLE=process.env.TABLE;
          const MAX_CORPS=2*1024*1024;   // corps compresse
          const MAX_JSON=16*1024*1024;   // decompresse : garde contre une bombe gzip
          const TTL=300000;              // borne le delai d une revocation
          const RELECTURE=15000;         // une cle neuve sert sans attendre le TTL
          const CLE=/^[0-9A-HJKMNP-TV-Z]{20}$/;
          const ID=/^[a-z0-9-]{1,32}$/;
          const VERS=/^[0-9]+(\.[0-9]+)*$/;
          const s3=new S3Client({}), ssm=new SSMClient({});
          let table=null, luLe=0;

          async function lireTable(){
            let v='{}';
            try{ v=(await ssm.send(new GetParameterCommand({Name:TABLE}))).Parameter.Value; }
            catch(e){ if(e.name!=='ParameterNotFound') throw e; }
            const t=JSON.parse(v);
            table=(t&&typeof t==='object'&&!Array.isArray(t))?t:{};
            luLe=Date.now();
          }

          async function identifiant(cle){
            if(typeof cle!=='string'||!CLE.test(cle)) return null;
            const h=crypto.createHash('sha256').update(cle).digest('hex');
            const age=Date.now()-luLe;
            if(!table||age>=TTL) await lireTable();
            else if(!Object.hasOwn(table,h)&&age>=RELECTURE) await lireTable();
            const id=Object.hasOwn(table,h)?table[h]:null;
            return (typeof id==='string'&&ID.test(id))?id:null;
          }

          const statut=e=>e&&e.$metadata&&e.$metadata.httpStatusCode;
          function rep(code,corps,ent){
            return {statusCode:code,
              headers:Object.assign({'cache-control':'no-store','content-type':'application/json'},ent||{}),
              body:corps===undefined?'':JSON.stringify(corps)};
          }
          const err=(code,motif)=>rep(code,{erreur:motif});

          async function lire(cle,h){
            const inm=h['if-none-match'];
            let r;
            try{ r=await s3.send(new GetObjectCommand({Bucket:BUCKET,Key:cle,IfNoneMatch:inm||undefined})); }
            catch(e){
              if(statut(e)===304) return {statusCode:304,headers:{'cache-control':'no-store',etag:inm},body:''};
              if(e.name==='NoSuchKey'||statut(e)===404) return err(404,'absent');
              throw e;
            }
            const b=Buffer.from(await r.Body.transformToByteArray());
            return {statusCode:200,isBase64Encoded:true,body:b.toString('base64'),
              headers:{'cache-control':'no-store','content-type':'application/json','content-encoding':'gzip',
                etag:r.ETag,'x-palier-version':(r.Metadata&&r.Metadata.appversion)||''}};
          }

          async function ecrire(cle,h,ev){
            const im=h['if-match'], inm=h['if-none-match'];
            if(!im&&inm!=='*') return err(428,'if-match ou if-none-match requis');
            if(!ev.isBase64Encoded) return err(400,'corps binaire attendu');
            const corps=Buffer.from(ev.body||'','base64');
            if(corps.length>MAX_CORPS) return err(413,'corps trop grand');
            let etat;
            try{ etat=JSON.parse(zlib.gunzipSync(corps,{maxOutputLength:MAX_JSON}).toString('utf8')); }
            catch(e){ return e.code==='ERR_BUFFER_TOO_LARGE'?err(413,'etat trop grand'):err(400,'gzip ou json invalide'); }
            if(!etat||typeof etat!=='object'||Array.isArray(etat)||typeof etat.appVersion!=='string'||!VERS.test(etat.appVersion))
              return err(400,'etat invalide');
            let r;
            try{
              r=await s3.send(new PutObjectCommand({Bucket:BUCKET,Key:cle,Body:corps,
                ContentType:'application/json',ContentEncoding:'gzip',Metadata:{appversion:etat.appVersion},
                IfMatch:im||undefined,IfNoneMatch:im?undefined:'*'}));
            }catch(e){
              // 412 : ETag perime ; 409 : ecriture concurrente ; 404 : objet
              // supprime entre-temps. Dans les trois cas le client relit.
              if([404,409,412].includes(statut(e))||e.name==='NoSuchKey') return err(412,'etat en ligne modifie');
              throw e;
            }
            return rep(200,{etag:r.ETag},{etag:r.ETag});
          }

          // purge toutes les versions et tous les marqueurs : un simple
          // DeleteObject laisserait l historique 90 jours
          async function purger(cle){
            let km, vm, n=0;
            do{
              const r=await s3.send(new ListObjectVersionsCommand({Bucket:BUCKET,Prefix:cle,KeyMarker:km,VersionIdMarker:vm}));
              const obj=[...(r.Versions||[]),...(r.DeleteMarkers||[])]
                .filter(v=>v.Key===cle).map(v=>({Key:v.Key,VersionId:v.VersionId}));
              if(obj.length){
                const d=await s3.send(new DeleteObjectsCommand({Bucket:BUCKET,Delete:{Objects:obj,Quiet:true}}));
                if(d.Errors&&d.Errors.length) throw new Error('purge incomplete : '+d.Errors[0].Code);
                n+=obj.length;
              }
              km=r.IsTruncated?r.NextKeyMarker:undefined; vm=r.IsTruncated?r.NextVersionIdMarker:undefined;
            }while(km!==undefined);
            return n;
          }

          exports.handler=async ev=>{
            const m=ev.requestContext&&ev.requestContext.http&&ev.requestContext.http.method;
            const h=ev.headers||{};
            let id=null, res;
            try{
              if(ev.rawPath!=='/api/state') res=err(404,'route inconnue');
              else if(!['GET','PUT','DELETE'].includes(m)) res=err(405,'methode');
              else if(!(id=await identifiant(h['x-palier-key']))) res=err(401,'cle inconnue');
              else{
                const cle='state/'+id+'.json';
                if(m==='GET') res=await lire(cle,h);
                else if(m==='PUT') res=await ecrire(cle,h,ev);
                else { await purger(cle); res={statusCode:204,headers:{'cache-control':'no-store'},body:''}; }
              }
            }catch(e){
              console.log(JSON.stringify({m,id,erreur:e.name||String(e)}));
              return err(503,'indisponible');
            }
            // jamais la cle ni le corps dans le journal
            console.log(JSON.stringify({m,s:res.statusCode,id,o:ev.body?ev.body.length:0}));
            return res;
          };

  UrlApi:
    Type: AWS::Lambda::Url
    Properties:
      TargetFunctionArn: !GetAtt FonctionApi.Arn
      AuthType: AWS_IAM
      InvokeMode: BUFFERED

  # depuis octobre 2025, une Function URL neuve exige les deux actions ; la
  # seconde est restreinte aux appels par l URL
  PermissionUrl:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !GetAtt FonctionApi.Arn
      Action: lambda:InvokeFunctionUrl
      FunctionUrlAuthType: AWS_IAM
      Principal: cloudfront.amazonaws.com
      SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${DistributionId}

  PermissionInvocation:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !GetAtt FonctionApi.Arn
      Action: lambda:InvokeFunction
      InvokedViaFunctionUrl: true
      Principal: cloudfront.amazonaws.com
      SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${DistributionId}

Outputs:
  BucketEtat:
    Value: !Ref BucketEtat
  Fonction:
    Value: !Ref FonctionApi
  # hote seul, sans https:// ni / final : ce qu attend l origine de palier-edge
  ApiHote:
    Value: !Select [2, !Split ['/', !GetAtt UrlApi.FunctionUrl]]
```

## cle.sh

```bash
#!/bin/bash
# Cles de synchronisation de PALIER. La table empreinte -> identifiant vit dans
# un parametre SSM hors stack ; la cle n est affichee qu une fois et n est
# ecrite nulle part.
# Usage, depuis CloudShell :
#   ./cle.sh nouvelle <id>   cle neuve ; remplace et revoque celle de <id>
#   ./cle.sh retirer <id>    revoque sans remplacement
#   ./cle.sh liste           identifiants, jamais les empreintes
set -euo pipefail
REGION=eu-west-3
TABLE=${TABLE:-/palier/utilisateurs}
ALPHA=0123456789ABCDEFGHJKMNPQRSTVWXYZ

usage(){ echo "usage : $0 nouvelle <id> | retirer <id> | liste" >&2; exit 2; }

# Parametre absent : table vide. Toute autre erreur arrete le script : la
# lire comme vide puis la reecrire effacerait les autres cles.
lire(){
  local e s
  e=$(mktemp)
  if s=$(aws ssm get-parameter --region "$REGION" --name "$TABLE" \
         --query Parameter.Value --output text 2>"$e"); then
    rm -f "$e"; printf '%s' "$s"; return 0
  fi
  if grep -q ParameterNotFound "$e"; then rm -f "$e"; printf '{}'; return 0; fi
  cat "$e" >&2; rm -f "$e"; return 1
}

ecrire(){
  [ "$(printf '%s' "$1" | wc -c)" -le 4096 ] || { echo "table au-dela de 4 Ko" >&2; exit 1; }
  aws ssm put-parameter --region "$REGION" --name "$TABLE" --type String \
    --tier Standard --overwrite --value "$1" >/dev/null
}

# json en Python, present dans CloudShell comme dans l environnement de build
js(){ python3 -c "$1" "${@:2}"; }

confirmer(){ local r; read -r -p "$1 [o/N] " r; [ "$r" = o ] || { echo "abandon"; exit 1; }; }

verifier_id(){ [[ "$1" =~ ^[a-z0-9-]{1,32}$ ]] || { echo "identifiant : [a-z0-9-], 1 a 32 caracteres" >&2; exit 2; }; }

# 20 octets, 5 bits de poids faible de chacun : 256 est multiple de 32, donc
# chaque caractere est equiprobable. 100 bits.
generer(){
  local o c=''
  for o in $(od -An -tu1 -N20 /dev/urandom); do c+=${ALPHA:$((o % 32)):1}; done
  printf '%s' "$c"
}

cmd=${1:-}
case "$cmd" in
  nouvelle)
    [ $# -eq 2 ] || usage; ID=$2; verifier_id "$ID"
    T=$(lire)
    N=$(js 'import json,sys;print(sum(1 for v in json.loads(sys.argv[1]).values() if v==sys.argv[2]))' "$T" "$ID")
    [ "$N" -eq 0 ] || confirmer "$ID a deja une cle, elle sera revoquee. Continuer ?"
    C=$(generer)
    H=$(printf '%s' "$C" | sha256sum | cut -d' ' -f1)
    T2=$(js 'import json,sys
t={h:v for h,v in json.loads(sys.argv[1]).items() if v!=sys.argv[2]}
t[sys.argv[3]]=sys.argv[2]
print(json.dumps(t,separators=(",",":"),sort_keys=True))' "$T" "$ID" "$H")
    ecrire "$T2"
    echo "identifiant : $ID"
    echo "empreinte   : $H"
    echo "cle         : ${C:0:5}-${C:5:5}-${C:10:5}-${C:15:5}"
    echo "Valable sous 15 s ; une ancienne cle cesse de servir sous 5 min."
    ;;
  retirer)
    [ $# -eq 2 ] || usage; ID=$2; verifier_id "$ID"
    T=$(lire)
    N=$(js 'import json,sys;print(sum(1 for v in json.loads(sys.argv[1]).values() if v==sys.argv[2]))' "$T" "$ID")
    [ "$N" -gt 0 ] || { echo "$ID n a pas de cle"; exit 1; }
    confirmer "Revoquer la cle de $ID ? Ses donnees en ligne restent."
    T2=$(js 'import json,sys
t={h:v for h,v in json.loads(sys.argv[1]).items() if v!=sys.argv[2]}
print(json.dumps(t,separators=(",",":"),sort_keys=True))' "$T" "$ID")
    ecrire "$T2"
    echo "$ID revoque, effectif sous 5 min"
    ;;
  liste)
    [ $# -eq 1 ] || usage
    T=$(lire)
    js 'import json,sys
for v in sorted(set(json.loads(sys.argv[1]).values())): print(v)' "$T"
    ;;
  *) usage ;;
esac
```

## testedge.sh

```bash
#!/bin/bash
# Verification de bout en bout de l API a travers CloudFront : OAC, en-tetes
# conditionnels transmis, corps intact, https seul. Refuse de tourner si un
# etat est deja en ligne pour cette cle : il finit par le purger.
# Usage, depuis CloudShell : ./testedge.sh [hote]   (defaut palier.s1t3.link)
set -uo pipefail
HOTE=${1:-palier.s1t3.link}
U="https://$HOTE/api/state"
T=$(mktemp -d)
cree=0
K=''

nettoyer(){
  # un echec en cours de route ne doit pas laisser d etat de test en ligne
  if [ "$cree" = 1 ]; then
    curl -s -o /dev/null -X DELETE -H "x-palier-key: $K" "$U"
    echo "etat de test purge"
  fi
  rm -rf "$T"
}
trap nettoyer EXIT

read -rs -p "cle : " K; echo
K=$(printf '%s' "$K" | tr -d ' -' | tr 'a-z' 'A-Z')

n=0; echecs=0
verif(){
  n=$((n+1))
  if [ "$3" = "$2" ]; then printf 'ok     %-44s %s\n' "$1" "$3"
  else printf 'ECHEC  %-44s attendu %s, obtenu %s\n' "$1" "$2" "$3"; echecs=$((echecs+1)); fi
}
req(){ curl -s -o "$T/corps" -D "$T/ent" -w '%{http_code}' "$@"; }
entete(){ grep -i "^$1:" "$T/ent" | head -1 | cut -d' ' -f2- | tr -d '\r'; }

printf '{"appVersion":"0.0","origine":"testedge"}' | gzip -n > "$T/etat.gz"
SHA=$(sha256sum "$T/etat.gz" | cut -d' ' -f1)
put(){ req -X PUT -H "x-palier-key: $K" -H 'content-type: application/octet-stream' "$@" --data-binary @"$T/etat.gz" "$U"; }

verif "GET sans cle" 401 "$(req "$U")"
s=$(req -H "x-palier-key: $K" "$U")
case "$s" in
  404) verif "GET, rien en ligne" 404 "$s" ;;
  200) echo "un etat est en ligne pour cette cle : arret, le test le detruirait"; exit 1 ;;
  *)   verif "GET avec cle" 404 "$s"; echo "arret"; exit 1 ;;
esac

s=$(put -H 'if-none-match: *' -H "x-amz-content-sha256: $SHA")
verif "PUT creation" 200 "$s"
[ "$s" = 200 ] && cree=1
E=$(entete etag)
[ -n "$E" ] || { echo "pas d ETag : arret"; exit 1; }

# sans empreinte du corps, la signature OAC doit echouer avant la Lambda
verif "PUT sans x-amz-content-sha256" 403 "$(put -H "if-match: $E")"

verif "GET apres creation" 200 "$(req -H "x-palier-key: $K" "$U")"
verif "  ETag inchange" "$E" "$(entete etag)"
verif "  x-palier-version" 0.0 "$(entete x-palier-version)"
verif "  corps gzip intact" identique "$(cmp -s "$T/corps" "$T/etat.gz" && echo identique || echo different)"
verif "GET If-None-Match courant" 304 "$(req -H "x-palier-key: $K" -H "if-none-match: $E" "$U")"
verif "PUT If-Match faux" 412 "$(put -H 'if-match: "faux"' -H "x-amz-content-sha256: $SHA")"
verif "PUT If-Match courant" 200 "$(put -H "if-match: $E" -H "x-amz-content-sha256: $SHA")"
s=$(req -X DELETE -H "x-palier-key: $K" "$U")
verif "DELETE" 204 "$s"
[ "$s" = 204 ] && cree=0
verif "GET apres purge" 404 "$(req -H "x-palier-key: $K" "$U")"
verif "http refuse" 403 "$(curl -s -o /dev/null -w '%{http_code}' "http://$HOTE/api/state")"

echo "$n verifications, $echecs echec(s)"
[ "$echecs" = 0 ]
```
