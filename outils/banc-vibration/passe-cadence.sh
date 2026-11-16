#!/bin/bash
# Une passe du banc des vibrations SOUS LE VERROU du Mac : attend son tour, lance cadence.cjs avec les arguments donnés, rend le verrou seulement si c'est le sien.
#   sh outils/banc-vibration/passe-cadence.sh --out <dossier> --passes r30,tel …
cd "$(dirname "$0")/../.." || exit 1
~/cash-car/verrou-banc.sh prendre "vib-cadence" || exit 1
node outils/banc-vibration/cadence.cjs "$@" 2>&1 | tail -25
grep -q "vib-cadence" /private/tmp/cashcar-banc.lock/qui 2>/dev/null && ~/cash-car/verrou-banc.sh rendre
