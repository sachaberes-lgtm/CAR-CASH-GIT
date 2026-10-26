#!/bin/bash
# f2-suite.sh : REFAIT la séance F (calée sur 30 dès la 1re seconde) après le test croisé, avec l'app qui garde l'écran allumé.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
sleep 60
while pgrep -f "abba3-suite.sh" >/dev/null || pgrep -f "chefv.mjs" >/dev/null; do sleep 15; done
log "test croisé fini. Repos de 12 min avant F"
sleep 720
for i in $(seq 1 720); do xcrun devicectl device info lockState --device $D 2>&1 | grep -q "passcodeRequired: false" && break; [ "$i" = 1 ] && log "le 13 Pro est verrouillé : j'attends"; sleep 30; done
for i in $(seq 1 60); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && break; sleep 30; done
log "départ à $(temp) °C. Séance F"
rm -f res-app/valS903F.json
node chefv.mjs file-v903F.json 99
log "séance F refaite finie"
