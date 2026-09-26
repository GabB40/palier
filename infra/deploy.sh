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
