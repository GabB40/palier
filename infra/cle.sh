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
