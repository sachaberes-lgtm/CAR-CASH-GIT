#!/bin/sh
# Les PLANCHES du banc des niveaux : pour chaque (carte, orientation) trouvée dans <prises>, trois planches côte à côte N1 · N2 · N3 · N4 · témoin (?sans=profil) :
#   <carte>-<fmt>-jeu.jpg (image entière, ×0,4) · -caisse.jpg (zoom ×2 sur la caisse) · -trainees.jpg (zoom ×2 sur les traînées), en pixels d'écran (DPR 3).
#   sh outils/banc-qualite/planches.sh <prises> <sortie>
P="$1"; O="$2"; mkdir -p "$O"; ICI="$(cd "$(dirname "$0")/../banc-finition" && pwd)"
for f in "$P"/N1-*-jeu.png; do
  b="$(basename "$f" -jeu.png)"; b="${b#N1-}"
  for kind in jeu:3:.4 caisse:3:2 trainees:2:2; do
    k="${kind%%:*}"; r="${kind#*:}"; col="${r%%:*}"; z="${r#*:}"
    python3 "$ICI/planche.py" "$O/$b-$k.jpg" --col "$col" --zoom "$z" --q 82 \
      "N1 BASSE (14,2)=$P/N1-$b-$k.png" "N2 HAUTE (14,2)=$P/N2-$b-$k.png" "N3 HAUTE (15,4)=$P/N3-$b-$k.png" "N4 HAUTE (18,1)=$P/N4-$b-$k.png" "temoin sans profil=$P/T-$b-$k.png"
  done
done
