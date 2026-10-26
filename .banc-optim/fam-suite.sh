#!/bin/bash
# fam-suite.sh : appels de dessin par famille, au niveau 9 de la ville (réglages par défaut), relevé en six morceaux.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
cd $B
sleep 20
while pgrep -f "appels-suite.sh" >/dev/null || pgrep -f "chefv.mjs file-appels.json" >/dev/null; do sleep 5; done
log "appels de A2 finis. Relevé par famille"
node chefv.mjs file-appels2.json 99
log "familles terminées"
