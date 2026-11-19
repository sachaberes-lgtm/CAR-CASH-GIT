#!/bin/bash
# RÔLE « etat » : lance un banc Chrome sous le verrou commun, et ne rend le verrou QUE s'il est à nous (jamais celui d'une autre session).
# outils/banc-espace/etat-lance.sh <sortie.json> <journal.log> [arguments du banc…]
OUT="$1"; LOG="$2"; shift 2
~/cash-car/verrou-banc.sh prendre "espace-debug etat" || exit 1
QUI=$(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)
cd "$(dirname "$0")/../.." || exit 1
node outils/banc-espace/etat-vivant.cjs --out "$OUT" "$@" > "$LOG" 2>&1
echo "code $?" >> "$LOG"
if [ "$(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)" = "$QUI" ]; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à nous : pas rendu" >> "$LOG"; fi
