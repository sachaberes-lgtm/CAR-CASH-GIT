#!/bin/bash
# maps-suite.sh : après la séance à résolution figée, les comptes de triangles et d'appels CARTE PAR CARTE (premier niveau de chaque carte, cran de qualité 0), interrupteurs A2 coupés puis actifs.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
cd $B
sleep 40
while pgrep -f "sdpr-suite.sh" >/dev/null || pgrep -f "chefv.mjs file-val-Sdpr" >/dev/null; do sleep 5; done
log "séance dpr finie. Comptes carte par carte"
node chefv.mjs file-geoM.json 99
log "comptes par carte terminés"
