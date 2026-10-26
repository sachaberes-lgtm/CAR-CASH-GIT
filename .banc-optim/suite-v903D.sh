#!/bin/bash
# suite-v903D.sh : après la séance en régime chaud, la même séance de 7 min avec les RÉGLAGES PAR DÉFAUT de la v903 (état réel livrable).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
sleep 30
while pgrep -f "suite-v903.sh" >/dev/null || pgrep -f "chefv.mjs file-v903.json" >/dev/null; do sleep 5; done
log "séance chaude et familles finies. Fraîcheur avant la séance par défaut"
for i in $(seq 1 24); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=37.0)}' && break; sleep 30; done
log "départ à $(temp) °C"
node chefv.mjs file-v903D.json 99
log "séance par défaut finie"
