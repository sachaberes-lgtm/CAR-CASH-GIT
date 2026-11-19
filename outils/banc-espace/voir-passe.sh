#!/bin/bash
# UNE PASSE DU BANC « VOIR » SOUS LE VERROU COMMUN : prendre, lancer (coupée à 11 min 30), tuer son Chrome, rendre seulement si le verrou porte encore « espace-debug ».
#   outils/banc-espace/voir-passe.sh <dossier de sortie> [arguments de voir-course.cjs…]
cd "$(dirname "$0")/../.." || exit 1
OUT="$1"; shift
mkdir -p "$OUT"
echo "attente du verrou $(date)" > "$OUT/journal.txt"
~/cash-car/verrou-banc.sh prendre "espace-debug voir" >> "$OUT/journal.txt" 2>&1
echo "verrou pris $(date)" >> "$OUT/journal.txt"
node outils/banc-espace/voir-course.cjs --out "$OUT" "$@" >> "$OUT/journal.txt" 2>&1 &
N=$!
( sleep 690; kill -TERM $N 2>/dev/null; sleep 5; kill -9 $N 2>/dev/null ) &
G=$!
wait $N; echo "code $?" >> "$OUT/journal.txt"
kill $G 2>/dev/null
P=$(grep -o 'chrome pid [0-9]*' "$OUT/journal.txt" | tail -1 | awk '{print $3}')
[ -n "$P" ] && kill -9 -"$P" 2>/dev/null
if grep -q "espace-debug voir" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre >> "$OUT/journal.txt"; else echo "verrou plus à nous : $(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)" >> "$OUT/journal.txt"; fi
echo "passe finie $OUT $(date)" >> "$OUT/journal.txt"
