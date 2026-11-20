#!/bin/sh
# Une passe A/B sous le verrou commun : avant (?sans=transitions) et après (défaut) ENTRELACÉS dans le même Chrome
# (tour pair = avant, tour impair = après, par dbgTransitions({on:…})), JOUER → MORT → REJOUER → MENU à chaque tour.
#   sh outils/banc-transitions/passe.sh <étiquette> [tours=10] [args en plus… ex. --portrait]
#   → outils/banc-transitions/mesures/<étiquette>.json
# (2e tour) plus de « timeout » (il n'existe pas sur ce Mac) : un chien de garde shell tue le banc après 540 s
# (le banc attrape SIGTERM et tue le groupe de processus de SON Chrome, efface son profil).
cd "$(dirname "$0")/../.." || exit 2
E="$1";T="${2:-10}";shift;[ $# -gt 0 ] && shift
M=outils/banc-transitions/mesures
mkdir -p "$M"
~/cash-car/verrou-banc.sh prendre "auteur-transitions"
python3 outils/banc-transitions/transitions.py --ab --tours "$T" --json "$M/$E.json" "$@" &
P=$!
( sleep 540; kill -TERM $P 2>/dev/null ) &
G=$!
wait $P;R=$?
pkill -P $G 2>/dev/null;kill $G 2>/dev/null
if grep -q " auteur-transitions\$" /private/tmp/cashcar-banc.lock*/qui 2>/dev/null;then ~/cash-car/verrou-banc.sh rendre;else echo "verrou déjà repris par un autre : pas rendu";fi
exit $R
