#!/bin/bash
# Plusieurs passes du banc à la suite SOUS UN SEUL VERROU (la file d'attente du Mac est longue) : une ligne d'arguments par passe, sur l'entrée standard.
#   printf '%s\n' "--out d --passes r30,tel" "--out d --patch outils/banc-vibration/essai-hoquet.cjs --tag essai" | sh outils/banc-vibration/passes.sh
cd "$(dirname "$0")/../.." || exit 1
~/cash-car/verrou-banc.sh prendre "vib-cadence" || exit 1
while IFS= read -r ligne; do [ -z "$ligne" ] && continue; echo "=== $ligne"; eval "node outils/banc-vibration/cadence.cjs $ligne" 2>&1 | grep -v "^écrit.*pannes" | tail -14; echo "$(date +%s) vib-cadence" > /dev/null; done
grep -q "vib-cadence" /private/tmp/cashcar-banc.lock/qui 2>/dev/null && ~/cash-car/verrou-banc.sh rendre
