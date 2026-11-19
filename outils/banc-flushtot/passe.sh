#!/bin/bash
# Une passe du banc flushtot sous le verrou commun (moins de 12 min ; le banc s'arrête seul à 11,5 min). Ne rend que SON verrou.
cd "$(dirname "$0")/../.."
~/cash-car/verrou-banc.sh prendre "auteur-flushtot"
date; df -h /System/Volumes/Data | tail -1
python3 outils/banc-flushtot/banc.py 2>&1 || echo "banc rc=$?"
if grep -q "auteur-flushtot" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then ~/cash-car/verrou-banc.sh rendre; else echo "verrou plus à moi : pas rendu"; fi
date
