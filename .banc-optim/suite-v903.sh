#!/bin/bash
# suite-v903.sh : construit (déjà lancé) puis installe CC BANC v903 ; séance de 7 min en régime chaud + ombre à 15 i/s (le maximum d'allègement), puis les appels de dessin par famille.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
APP=$B/app-banc/dd/Build/Products/Release-iphoneos/App.app
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
log "j'attends la construction de la v903"
for i in $(seq 1 90); do pgrep -f "prepare-banc.sh" >/dev/null || break; sleep 5; done
grep -q "mobhChaud" "$APP/public/index.html" || { log "ÉCHEC : l'app v903 n'est pas construite"; exit 1; }
ok=0; for i in $(seq 1 90); do out=$(xcrun devicectl device info ddiServices --device $D 2>&1); if ! echo "$out" | grep -q "kAMDMobileImageMounterDeviceLocked\|ERROR"; then ok=1; break; fi; sleep 10; done
[ $ok = 1 ] || { log "ÉCHEC : le 13 Pro est verrouillé ou déconnecté"; exit 1; }
r=$(xcrun devicectl device install app --device $D "$APP" 2>&1); echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation :"; echo "$r" | tail -4 | cut -c1-200; exit 1; }
log "CC BANC v903 installée"
for i in $(seq 1 24); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=37.0)}' && break; sleep 30; done
log "départ à $(temp) °C"
node chefv.mjs file-v903.json 99
log "v903 terminée"
