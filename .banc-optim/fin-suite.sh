#!/bin/bash
# fin-suite.sh : après la séance par défaut v903, une séance avec la QUALITÉ FIGÉE au cran maximal (le plancher de l'échelle), puis la fabrication de CC JEU.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
sleep 45
while pgrep -f "suite-v903D.sh" >/dev/null || pgrep -f "chefv.mjs file-v903D" >/dev/null || pgrep -f "chefv.mjs file-v903.json" >/dev/null; do sleep 5; done
log "séance par défaut finie. Fraîcheur avant la séance qualité maximale"
for i in $(seq 1 24); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=37.0)}' && break; sleep 30; done
log "départ à $(temp) °C"
node chefv.mjs file-v903Q.json 99
log "séance qualité maximale finie. Construction de CC JEU"
/bin/zsh ./prepare-jeu.sh "/Users/sachaberes/cash-car/mobile-perf/VERSION PRINCIPALE" 2>&1 | tail -6 | cut -c1-200
log "CC JEU prête"
