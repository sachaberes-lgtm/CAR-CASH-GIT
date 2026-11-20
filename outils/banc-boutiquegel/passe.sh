#!/bin/bash
# Une passe du banc du gel de la boutique sous le verrou commun. Rend SON verrou seulement, même en cas d'échec.
#   sh outils/banc-boutiquegel/passe.sh <dossier de sortie> <dossier parent des profils> "<essai:lieu> ..." [options de gel.cjs]
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$1"; PROF="$2"; LISTE="$3"; shift 3; PLUS="$@"; mkdir -p "$OUT" "$PROF"
QUI="auteur-boutiquegel"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() { if grep -q "$QUI" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à moi : rien rendu"; fi; rm -rf "$PROF"/banc-bg-prof-* 2>/dev/null; }
trap rendre EXIT
cd "$D"
n=0
for X in $LISTE; do
  n=$((n+1)); E="${X%%:*}"; L="${X##*:}"
  echo "== $n $E $L $(date +%T)"
  ( node outils/banc-boutiquegel/gel.cjs --essai $E --lieu $L --prof "$PROF" --out "$OUT/img" $PLUS > "$OUT/$n-$E-$L.json" 2> "$OUT/$n-$E-$L.err" ) &
  P=$!; ( sleep 150; kill $P 2>/dev/null ) & G=$!
  wait $P; kill $G 2>/dev/null
  echo "   fini $(date +%T) : $(wc -c < "$OUT/$n-$E-$L.json") octets"
done
