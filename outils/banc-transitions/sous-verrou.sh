#!/bin/sh
# Lance une commande sous le verrou commun des bancs (un seul Chrome de banc sur le Mac), et ne rend QUE son verrou.
#   sh outils/banc-transitions/sous-verrou.sh "<nom>" commande args…
N="$1";shift
~/cash-car/verrou-banc.sh prendre "$N"
"$@";R=$?
if grep -q " $N\$" /private/tmp/cashcar-banc.lock*/qui 2>/dev/null;then ~/cash-car/verrou-banc.sh rendre;else echo "verrou déjà repris par un autre : pas rendu";fi
exit $R
