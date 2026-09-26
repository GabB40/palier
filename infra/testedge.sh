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
