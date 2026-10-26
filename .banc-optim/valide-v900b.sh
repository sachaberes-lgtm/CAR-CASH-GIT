#!/bin/bash
# valide-v900b.sh : attend le déverrouillage du 13 Pro, installe CC BANC v900 (A1+A2+A3+A4), puis (1) la séance continue de 7 min avec tout activé, (2) les comptes de triangles en A/B.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
APP=$B/app-banc/dd/Build/Products/Release-iphoneos/App.app
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 50); do t=$(temp); { [ "$i" = 1 ] || [ $((i % 6)) = 0 ]; } && log "attente de fraîcheur, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 36,5 °C en 25 min"; return 1; }
cd $B
[ -d "$APP" ] || { log "ÉCHEC : l'app v900 n'est pas construite"; exit 1; }
grep -q "mobrSondeOk" "$APP/public/index.html" || { log "ÉCHEC : l'app construite n'est pas la v900"; exit 1; }
log "j'attends le déverrouillage du 13 Pro (20 min au plus)"
ok=0; for i in $(seq 1 120); do out=$(xcrun devicectl device info ddiServices --device $D 2>&1); if ! echo "$out" | grep -q "kAMDMobileImageMounterDeviceLocked\|ERROR"; then ok=1; break; fi; sleep 10; done
[ $ok = 1 ] || { log "ÉCHEC : le 13 Pro est resté verrouillé ou déconnecté"; exit 1; }
log "13 Pro prêt"
r=$(xcrun devicectl device install app --device $D "$APP" 2>&1); echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation :"; echo "$r" | tail -4 | cut -c1-200; exit 1; }
log "CC BANC v900 installée"
frais || exit 1
log "séance continue v900 : tout activé, 7 min"
node chefv.mjs file-val-S900.json 99
log "séance v900 finie. Repos de 12 min"
sleep 720
frais || exit 1
log "comptes de triangles A/B"
node chefv.mjs file-geo.json 99
log "comptes terminés"
