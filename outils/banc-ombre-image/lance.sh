#!/bin/sh
# Attend une place (au plus 3 Chrome de banc sur le Mac : on compte les Chrome PRINCIPAUX lancés avec --remote-debugging-port), puis lance le banc avec ses arguments.
# Ferme son Chrome à la fin (port CDP 9812 par défaut).
#   sh outils/banc-ombre-image/lance.sh <arguments de banc.cjs>
D=$(cd "$(dirname "$0")/../.." && pwd)
while [ "$(pgrep -f 'MacOS/Google Chrome --.*remote-debugging-port' | wc -l | tr -d ' ')" -ge 3 ]; do sleep 20; done
node "$D/outils/banc-ombre-image/banc.cjs" "$@"
R=$?
pkill -f "remote-debugging-port=9812" 2>/dev/null
exit $R
