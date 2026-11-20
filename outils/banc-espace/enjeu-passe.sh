#!/bin/bash
# UNE PASSE DU BANC « ENJEU » SOUS LE VERROU COMMUN : prendre, lancer (coupée à 11 min 30), tuer son Chrome, rendre seulement si le verrou porte encore « espace-debug ».
#   outils/banc-espace/enjeu-passe.sh <dossier de sortie> [arguments de enjeu-course.cjs…]
cd "$(dirname "$0")/../.." || exit 1
OUT="$1"; shift
if grep -q "espace-debug" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then echo "$$ $(date +%s) espace-debug" > /private/tmp/cashcar-banc.lock/qui; echo "verrou gardé"; else ~/cash-car/verrou-banc.sh prendre "espace-debug"; fi
mkdir -p "$OUT"
node outils/banc-espace/enjeu-course.cjs --out "$OUT" "$@" > "$OUT/journal.txt" 2>&1 &
N=$!
( sleep 690; kill -TERM $N 2>/dev/null; sleep 5; kill -9 $N 2>/dev/null ) &
G=$!
wait $N; echo "code $?" >> "$OUT/journal.txt"
kill $G 2>/dev/null
P=$(grep -o 'chrome pid [0-9]*' "$OUT/journal.txt" | awk '{print $3}')
[ -n "$P" ] && kill -9 -"$P" 2>/dev/null
if grep -q "espace-debug" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à nous : $(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)"; fi
echo "passe finie $OUT"
