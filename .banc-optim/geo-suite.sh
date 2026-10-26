#!/bin/bash
# geo-suite.sh : sans repos. Attend la fin de la séance v900 puis lance tout de suite les comptes de triangles A/B (indépendants de la chaleur).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
cd $B
while pgrep -f "chefv.mjs file-val-S900" >/dev/null; do sleep 5; done
log "séance v900 finie. Comptes de triangles A/B, sans repos"
node chefv.mjs file-geo.json 99
log "comptes terminés"
