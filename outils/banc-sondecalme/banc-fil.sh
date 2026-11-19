#!/bin/sh
# LE BANC DU FIL PRINCIPAL (2026-11-18, lot sondecalme) — sur le Mac, sans Chrome ni téléphone.
# Recopie la VRAIE classe SondeNatif de JeuViewController.swift (seuls `private` et l'appel à la vue web sont réécrits), la compile en -Onone
# (comme l'app Debug de compiler.sh), et fait tourner sur le fil principal un « top d'image » à 33 ms pendant N s :
#   · mode main : l'ancien battement (« go » : sentinelle sur .main chaque seconde) ;
#   · mode fond : le nouveau (« go:fond » : file d'arrière-plan, sentinelle 1 battement sur 5, petit bloc sur .main).
# Sortie : pour chaque mode, le temps pris SUR LE FIL PRINCIPAL par battement, les tops en retard (> 8 ms, > 33 ms) et ce que la page recevrait.
#   · mode rien : aucune sonde (le bruit de la machine, saturée ou non).
# Usage : sh outils/banc-sondecalme/banc-fil.sh [secondes=12] [tours=1]   (les modes alternent : rien, main, fond, rien, main…)
set -e
ICI=$(cd "$(dirname "$0")" && pwd); RAC=$(cd "$ICI/../.." && pwd)
T=${TMPDIR:-/tmp}/banc-sondecalme.$$; mkdir -p "$T"; trap 'rm -rf "$T"' EXIT
python3 - "$RAC/app-ios/ios/App/App/JeuViewController.swift" "$T/sonde.swift" <<'PY'
import sys
s=open(sys.argv[1]).read()
i=s.index('final class SondeNatif'); j=s.index('/// LA VUE WEB MORTE')
c=s[i:j].replace('private func','func').replace('private var','var').replace('private let','let')
c=c.replace('self?.vue?.evaluateJavaScript(','sortie(').replace('vue?.evaluateJavaScript(','sortie(')
open(sys.argv[2],'w').write('import Foundation\nimport WebKit\n'+c)
PY
cp "$ICI/fil-main.swift" "$T/main.swift"
xcrun swiftc -Onone -o "$T/banc" "$T/sonde.swift" "$T/main.swift" 2>/dev/null
for k in $(seq 1 "${2:-1}"); do for m in rien main fond; do "$T/banc" $m "${1:-12}" | head -1; done; done
