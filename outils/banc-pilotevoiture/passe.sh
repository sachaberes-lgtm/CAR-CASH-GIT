#!/bin/bash
# (2026-11-19, lot pilotevoiture) UNE passe de banc sous le verrou commun, 9 min au plus, rend SON verrou seulement.
#   sh outils/banc-pilotevoiture/passe.sh <fichier de sortie> <commande node ...>
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$1"; shift; QUI="auteur-pilotevoiture-$$"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() { if grep -q "$QUI" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à moi : rien rendu"; fi; }
trap rendre EXIT
cd "$D"; echo "== $(date +%T) $*"
( "$@" > "$OUT" 2> "$OUT.err" ) & P=$!
( sleep 540; pkill -P $P 2>/dev/null; kill $P 2>/dev/null ) & G=$!
wait $P; kill $G 2>/dev/null
echo "   fini $(date +%T) : $(wc -c < "$OUT") octets"
