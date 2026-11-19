#!/bin/bash
# Une passe du banc sous le verrou commun : avec le lot, puis ?sans=voituredabord. Rend SON verrou seulement, même en cas d'échec.
#   sh outils/banc-voituredabord/passe.sh <dossier de sortie> [options de vda.cjs, ex. --mode ql --effondre 8 --t1 70]
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="${1:-/tmp/banc-vda}"; shift; PLUS="$@"; mkdir -p "$OUT"
QUI="auteur-voituredabord"
~/cash-car/verrou-banc.sh prendre "$QUI"
MOI=$(awk '{print $1}' /private/tmp/cashcar-banc.lock/qui 2>/dev/null)
rendre() { if grep -q "$QUI" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à moi : rien rendu"; fi; }
trap rendre EXIT
cd "$D"
for E in avec sans; do
  echo "== $E $(date +%T)"
  ( node outils/banc-voituredabord/vda.cjs --essai $E --out "$OUT" $PLUS > "$OUT/$E.json" 2> "$OUT/$E.err" ) &
  P=$!; ( sleep 330; kill $P 2>/dev/null ) & G=$!
  wait $P; kill $G 2>/dev/null
  echo "   fini $(date +%T) : $(wc -c < "$OUT/$E.json") octets"
done
