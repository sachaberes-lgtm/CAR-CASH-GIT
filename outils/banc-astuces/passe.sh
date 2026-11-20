#!/bin/sh
# une passe sous le verrou commun : $1 = qui, puis les commandes node à enchaîner (séparées par ;;)
cd "$(dirname "$0")/../.."
~/cash-car/verrou-banc.sh prendre "$1" >/dev/null || exit 1; shift
for cmd in "$@"; do sh -c "$cmd"; done
~/cash-car/verrou-banc.sh rendre >/dev/null
echo PASSE-FINIE
