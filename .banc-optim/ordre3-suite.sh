#!/bin/bash
# ordre3-suite.sh : installe CC BANC v904 (?mob_g30=1), puis G30 (le 30 dès le départ, par le paramètre), B1 (leviers coupés), A2 (v904 par défaut). 12 min de repos, déverrouillé, batterie <= 36,5 °C avant chaque séance.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
APP=$B/app-banc/dd/Build/Products/Release-iphoneos/App.app
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
deverrouille(){ for i in $(seq 1 720); do if xcrun devicectl device info lockState --device $D 2>&1 | grep -q "passcodeRequired: false"; then return 0; fi; [ "$i" = 1 ] && log "le 13 Pro est verrouillé : j'attends"; sleep 30; done; log "ÉCHEC : verrouillé 6 h"; return 1; }
frais(){ for i in $(seq 1 60); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : batterie > 36,5 °C pendant 30 min"; return 1; }
lance(){ deverrouille || exit 1; frais || exit 1; log "séance $1"; rm -f res-app/$3.json; node chefv.mjs $2 99; log "séance $1 finie"; }
cd $B
for i in $(seq 1 90); do pgrep -f "prepare-banc.sh" >/dev/null || break; sleep 5; done
grep -q "mob_g30" "$APP/public/index.html" || { log "ÉCHEC : l'app v904 n'est pas construite"; exit 1; }
deverrouille || exit 1
r=$(xcrun devicectl device install app --device $D "$APP" 2>&1); echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation :"; echo "$r" | tail -4 | cut -c1-200; exit 1; }
log "CC BANC v904 installée"
sleep 420
lance "G30 : ?mob_g30=1" file-v904G30.json valS904G30
for n in B1 A2; do sleep 720; lance "ABBA $n" file-abba-$n.json valABBA-$n; done
log "ABBA terminé"
