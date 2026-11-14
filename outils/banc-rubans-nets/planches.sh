#!/bin/bash
# LES PLANCHES AVANT/APRÈS du banc des rubans nets (2026-11-14) : pour chaque prise <tag>-v<vitesse> trouvée dans <prises>,
#   · <tag>-v<v>-zoom.jpg : les 5 étapes (avant · A · A+B · A+B+C · A+B+C+D) recadrées sur la caisse et ses rubans, en pixels d'écran ;
#   · <tag>-v<v>-jeu.jpg  : l'image entière avant / après tout / zones de la loupe (magenta).
#   sh outils/banc-rubans-nets/planches.sh <prises> <sortie>
P="$1"; O="$2"; mkdir -p "$O"; ICI="$(cd "$(dirname "$0")/../banc-finition" && pwd)"
for f in "$P"/*-0avant-zoom.png; do
  b="$(basename "$f" -0avant-zoom.png)"
  python3 "$ICI/planche.py" "$O/$b-zoom.jpg" --col 5 --q 88 \
    "avant=$P/$b-0avant-zoom.png" "A profil=$P/$b-1A-zoom.png" "A+B plancher=$P/$b-2AB-zoom.png" "A+B+C masque=$P/$b-3ABC-zoom.png" "A+B+C+D loupe=$P/$b-4ABCD-zoom.png"
  python3 "$ICI/planche.py" "$O/$b-jeu.jpg" --col 3 --q 80 --zoom .5 \
    "avant=$P/$b-0avant-jeu.png" "apres (A+B+C+D)=$P/$b-4ABCD-jeu.png" "zones de la loupe=$P/$b-5zones-jeu.png"
done
