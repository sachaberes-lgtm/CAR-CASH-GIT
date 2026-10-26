#!/bin/bash
# geoC-suite.sh : après la séance v901, le banc de géométrie CONTRÔLÉ (mêmes cartes dans le même ordre, cran de qualité fixé à 0), interrupteurs A2 coupés puis actifs.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
cd $B
sleep 20
while pgrep -f "suite-v901.sh" >/dev/null || pgrep -f "chefv.mjs file-val-S901" >/dev/null; do sleep 5; done
log "séance v901 finie. Banc de géométrie contrôlé"
node chefv.mjs file-geoC.json 99
log "géométrie contrôlée terminée"
