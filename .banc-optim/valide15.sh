#!/bin/bash
# valide15.sh : la même validation v898 sur l'iPhone 15 (chef sur le port 8932). Construit l'app, attend câble + déverrouillage, installe, série N, repos, série G.
export PYMOBILEDEVICE3_UDID=00008120-000E494C34BBA01E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
D15=89BDAF29-5175-531E-92F8-DDF2B8C24D0F
APP=$B/app-banc/dd15/Build/Products/Release-iphoneos/App.app
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 40); do t=$(temp); { [ "$i" = 1 ] || [ $((i % 6)) = 0 ]; } && log "attente de fraîcheur, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie du 15 n'est pas repassée sous 36,5 °C en 20 min"; return 1; }
cd $B
log "construction de CC BANC v898 pour le 15"
out=$(/bin/zsh ./prepare-banc15.sh "/Users/sachaberes/cash-car/mobile-perf/VERSION PRINCIPALE" sans-installer 2>&1 | tail -6); echo "$out" | cut -c1-160
echo "$out" | grep -q "jeu b4179370" || { log "ÉCHEC : le jeu embarqué n'est pas b4179370"; exit 1; }
log "construite. J'attends le câble USB du 15, déverrouillé (15 min au plus)"
ok=0; for i in $(seq 1 90); do if $B/venv/bin/pymobiledevice3 usbmux list 2>/dev/null | grep -q 00008120-000E494C34BBA01E && ! xcrun devicectl device info lockState --device $D15 2>&1 | grep -q "passcodeRequired: true"; then ok=1; break; fi; sleep 10; done
[ $ok = 1 ] || { log "ÉCHEC : le 15 n'est pas branché et déverrouillé"; exit 1; }
log "15 branché"
r=$(xcrun devicectl device install app --device $D15 "$APP" 2>&1); echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation sur le 15 :"; echo "$r" | tail -5 | cut -c1-220; exit 1; }
log "CC BANC v898 installée sur le 15"
frais || exit 1
log "série N : sans gouverneur (15)"
node chefv15.mjs file-val15-N.json 37
log "série N finie. Repos de 12 min au moins"
sleep 720
frais || exit 1
log "série G : avec le gouverneur (15)"
node chefv15.mjs file-val15-G.json 37
log "validation 15 terminée"
