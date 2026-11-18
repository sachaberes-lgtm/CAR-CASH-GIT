#!/bin/bash
# Une passe du banc du menu au chaud sous le verrou commun. Rend SON verrou seulement, même en cas d'échec.
#   sh outils/banc-menuchaud/passe.sh <dossier de sortie> <dossier parent des profils> "<essais>" [options de menuchaud.cjs]
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$1"; PROF="$2"; ESSAIS="$3"; shift 3; PLUS="$@"; mkdir -p "$OUT" "$PROF"
QUI="auteur-menuchaud"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() { if grep -q "$QUI" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à moi : rien rendu"; fi; rm -rf "$PROF"/banc-mch-prof-* 2>/dev/null; }
trap rendre EXIT
cd "$D"
for E in $ESSAIS; do
  echo "== $E $(date +%T)"
  ( node outils/banc-menuchaud/menuchaud.cjs --essai $E --out "$OUT" --prof "$PROF" $PLUS > "$OUT/$E.json" 2> "$OUT/$E.err" ) &
  P=$!; ( sleep 300; kill $P 2>/dev/null ) & G=$!
  wait $P; kill $G 2>/dev/null
  echo "   fini $(date +%T) : $(wc -c < "$OUT/$E.json") octets"
done
