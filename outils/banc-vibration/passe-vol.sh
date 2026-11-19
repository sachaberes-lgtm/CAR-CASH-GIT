#!/bin/bash
# UNE PASSE du banc des vibrations : prend le verrou du Mac, joue chaque ligne du fichier de scénarios (les arguments de vol.cjs ou sol.cjs), rend le verrou s'il est à nous.
#   outils/banc-vibration/passe-vol.sh <qui> <dossier de sortie> <fichier de scénarios : une ligne = "vol.cjs --carte jade --dt r60,tel …">
QUI="$1"; OUT="$2"; SC="$3"; ICI="$(cd "$(dirname "$0")" && pwd)"
~/cash-car/verrou-banc.sh prendre "$QUI" || exit 1
while IFS= read -r l; do [ -z "$l" ] && continue; case "$l" in \#*) continue;; esac
  echo "=== $l"; eval "node \"$ICI\"/$l --out \"$OUT\"" 2>&1 | tail -12
  grep -q " $QUI$" /private/tmp/cashcar-banc.lock/qui 2>/dev/null && echo "$$ $(date +%s) $QUI" > /private/tmp/cashcar-banc.lock/qui # (le verrou se périme à 15 min : on le rafraîchit entre deux scénarios)
done < "$SC"
if grep -q " $QUI\$" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "le verrou n'est plus à nous : $(cat /private/tmp/cashcar-banc.lock/qui 2>/dev/null)"; fi
