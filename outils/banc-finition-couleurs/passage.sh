#!/bin/sh
# UN PASSAGE DU BANC DU LOT COULEURS SOUS LE VERROU COMMUN (2026-11-19, finition des maps).
#   sh outils/banc-finition-couleurs/passage.sh <journal> <arguments de photos.cjs…>
# Prend le verrou « finition-couleurs » (attend son tour), lance photos.cjs (qui ferme SON Chrome et ses serveurs), tue ce Node s'il reste,
# ne rend le verrou que s'il le porte encore, puis laisse 40 s aux autres.
V=/Users/sachaberes/cash-car/verrou-banc.sh
J="$1"; shift
D=$(cd "$(dirname "$0")" && pwd)
"$V" prendre "finition-couleurs" || exit 1
PN=""
nettoie() {
  [ -n "$PN" ] && kill "$PN" 2>/dev/null
  if grep -q "finition-couleurs" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then "$V" rendre; fi
  sleep 40
}
trap nettoie EXIT INT TERM
echo "=== pris à $(date +%H:%M:%S)" >> "$J"
node "$D/photos.cjs" "$@" >> "$J" 2>&1 &
PN=$!
wait "$PN"
PN=""
echo "=== fini à $(date +%H:%M:%S)" >> "$J"
