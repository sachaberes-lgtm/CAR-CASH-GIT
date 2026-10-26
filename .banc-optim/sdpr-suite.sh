#!/bin/bash
# sdpr-suite.sh : après le banc de géométrie, une séance continue de 7 min avec la résolution figée à 1,0 (au lieu de 1,5) pour séparer remplissage de la puce et processeur.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
sleep 30
while pgrep -f "geoC-suite.sh" >/dev/null || pgrep -f "chefv.mjs file-geoC" >/dev/null; do sleep 5; done
log "géométrie finie. J'attends la fraîcheur (37,0 °C, 12 min au plus)"
for i in $(seq 1 24); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=37.0)}' && break; sleep 30; done
log "départ à $(temp) °C"
log "séance continue, résolution figée à 1,0"
node chefv.mjs file-val-Sdpr.json 99
log "séance dpr finie"
