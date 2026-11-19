#!/bin/bash
# Toutes les passes du banc du menu au chaud sous UN verrou : tout (avec, sans), cout (A/B alterné), photo, pc (explore). Rend SON verrou seulement.
#   sh outils/banc-menuchaud/tout.sh <dossier de sortie> <dossier parent des profils>
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$1"; PROF="$2"; mkdir -p "$OUT" "$PROF"
QUI="auteur-menuchaud"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() { if grep -q "$QUI" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à moi : rien rendu"; fi; rm -rf "$PROF"/banc-mch-prof-* 2>/dev/null; }
trap rendre EXIT
cd "$D"
un() { N=$1; shift; echo "== $N $(date +%T)"; ( node outils/banc-menuchaud/menuchaud.cjs --out "$OUT" --prof "$PROF" "$@" > "$OUT/$N.json" 2> "$OUT/$N.err" ) & P=$!; ( sleep 300; kill $P 2>/dev/null ) & G=$!; wait $P; kill $G 2>/dev/null; echo "   fini $(date +%T) : $(wc -c < "$OUT/$N.json") octets"; }
un tout-avec --essai avec --mode tout
un tout-sans --essai sans --mode tout
un cout-avec --essai avec --mode cout --blocs 8
un photo-avec --essai avec --mode photo
un pc --essai pc --mode explore
