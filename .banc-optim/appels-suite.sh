#!/bin/bash
# appels-suite.sh : après les comptes par carte, les appels de dessin PAR FAMILLE au niveau 9 de la ville, interrupteurs A2 actifs puis coupés.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
cd $B
sleep 60
while pgrep -f "maps-suite.sh" >/dev/null || pgrep -f "chefv.mjs file-geoM" >/dev/null; do sleep 5; done
log "comptes par carte finis. Appels par famille"
node chefv.mjs file-appels.json 99
log "appels terminés"
