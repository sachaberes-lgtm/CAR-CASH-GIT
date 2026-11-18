#!/bin/sh
# Une passe A/B sous le verrou commun : avant (?sans=transitions) puis après (défaut), chacun dans son Chrome, 12 min au plus en tout.
#   sh outils/banc-transitions/passe.sh <étiquette> [tours] [args en plus…]
#   → outils/banc-transitions/mesures/<étiquette>-avant.json et -apres.json
cd "$(dirname "$0")/../.." || exit 2
E="$1";T="${2:-2}";shift;shift
M=outils/banc-transitions/mesures
~/cash-car/verrou-banc.sh prendre "auteur-transitions"
timeout 340 python3 outils/banc-transitions/transitions.py --tours "$T" --qs "&sans=transitions" --json "$M/$E-avant.json" "$@"
timeout 340 python3 outils/banc-transitions/transitions.py --tours "$T" --json "$M/$E-apres.json" "$@"
if grep -q " auteur-transitions\$" /private/tmp/cashcar-banc.lock/qui 2>/dev/null;then ~/cash-car/verrou-banc.sh rendre;else echo "verrou déjà repris par un autre : pas rendu";fi
