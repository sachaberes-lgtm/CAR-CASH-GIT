#!/bin/bash
# suite-v901.sh : attend la fin des comptes de triangles, installe CC BANC v901 (déclenchement du gouverneur au premier signe de lenteur), puis une séance continue de 7 min (dose remise à 0 au départ).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
APP=$B/app-banc/dd/Build/Products/Release-iphoneos/App.app
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
while pgrep -f "chefv.mjs file-geo" >/dev/null; do sleep 5; done
log "comptes finis. J'attends la construction de la v901"
for i in $(seq 1 60); do grep -q "mobReactif" "$APP/public/index.html" 2>/dev/null && ! pgrep -f "prepare-banc.sh" >/dev/null && break; sleep 10; done
grep -q "mobReactif" "$APP/public/index.html" || { log "ÉCHEC : l'app v901 n'est pas construite"; exit 1; }
r=$(xcrun devicectl device install app --device $D "$APP" 2>&1); echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation :"; echo "$r" | tail -4 | cut -c1-200; exit 1; }
log "CC BANC v901 installée"
for i in $(seq 1 20); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=37.0)}' && break; sleep 30; done
log "départ à $(temp) °C"
log "séance continue v901 : déclenchement au premier signe de lenteur, 7 min"
node chefv.mjs file-val-S901.json 99
log "séance v901 finie"
