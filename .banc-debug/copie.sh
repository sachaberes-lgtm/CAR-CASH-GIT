#!/bin/sh
# copie.sh <dossier-dest> : une copie de test du jeu au commit de base c7b96b44 — index.html COPIÉ (à patcher), le reste en liens symboliques (LECTURE SEULE)
SRC="/Users/sachaberes/cash-car/debug-maps/VERSION PRINCIPALE"
D="$1"; [ -z "$D" ] && { echo "usage: copie.sh <dest>"; exit 1; }
mkdir -p "$D"
for f in "$SRC"/*; do n=$(basename "$f"); [ "$n" = index.html ] && continue; [ -e "$D/$n" ] || ln -s "$f" "$D/$n"; done
git -C /Users/sachaberes/cash-car/debug-maps show c7b96b44:"VERSION PRINCIPALE/index.html" > "$D/index.html"
echo "copie prête : $D (index.html de c7b96b44, $(wc -l < "$D/index.html") lignes)"
