#!/bin/bash
# UNE PASSE DU BANC DES VIBRATIONS sous le verrou du Mac : prend le verrou, un essai court (fumée), puis chaque ligne du plan = une page (un Chrome à la fois), et rend le verrou (seulement le sien).
#   outils/banc-vibration/passe-sol.sh <dossier de sortie> <plan.txt>      une ligne du plan : <nom du relevé> <options de vib.cjs…>
#   ex. :  jade-tel --carte jade --prog tel:1600 --moteur 10
OUT="$1"; PLAN="$2"
ICI="$(cd "$(dirname "$0")" && pwd)"; mkdir -p "$OUT"
~/cash-car/verrou-banc.sh prendre "${QUI:-vib-sol}"
rendre() { case "$(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)" in *${QUI:-vib-sol}*) ~/cash-car/verrou-banc.sh rendre;; esac; }
trap rendre EXIT
echo "verrou pris $(date +%H:%M:%S)"
[ -n "$SANS_FUMEE" ] || node "$ICI/vib.cjs" --out "$OUT/fumee.json" --carte nuages --prog "tel:120" --moteur 2 || { echo "FUMÉE RATÉE"; exit 1; }
while read -r nom reste; do [ -z "$nom" ] && continue
  node "$ICI/vib.cjs" --out "$OUT/$nom.json" $reste || echo "ÉCHEC $nom"
  case "$(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)" in *${QUI:-vib-sol}*) echo "$$ $(date +%s) ${QUI:-vib-sol}" > /private/tmp/cashcar-banc.lock/qui;; esac
done < "$PLAN"
echo "FIN $(date +%H:%M:%S)"
