#!/bin/bash
# Une passe du banc du donut sous le verrou commun (pris, banc, rendu — rendu seulement si c'est encore LE NÔTRE).
#   sh outils/banc-donut/passe.sh <sortie.json> <arguments de donut.cjs…>
ICI="$(cd "$(dirname "$0")" && pwd)"; OUT="$1"; shift
# le même verrou que verrou-banc.sh (mkdir atomique, « pid date qui » dans qui, abandonné après 15 min), regardé chaque seconde au lieu de 15
L=/private/tmp/cashcar-banc.lock
while true; do
  if mkdir "$L" 2>/dev/null; then echo "$$ $(date +%s) auteur-donut" > "$L/qui"; echo "verrou pris"; break; fi
  t=$(awk '{print $2}' "$L/qui" 2>/dev/null); now=$(date +%s)
  if [ -n "$t" ] && [ $((now - t)) -gt 900 ]; then rm -rf "$L"; continue; fi
  sleep 1
done
node "$ICI/donut.cjs" "$@" > "$OUT" 2> "$OUT.log"
q=$(awk '{print $3}' /private/tmp/cashcar-banc.lock/qui 2>/dev/null)
if [ "$q" = "auteur-donut" ]; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à nous ($q) : pas rendu"; fi
