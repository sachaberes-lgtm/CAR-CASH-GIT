#!/bin/bash
# valide-v900.sh : attend la fin des séances S (val-S.sh), installe CC BANC v900 (A1+A2+A3+A4), puis le banc des comptes de triangles (A/B de la géométrie).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
APP=$B/app-banc/dd/Build/Products/Release-iphoneos/App.app
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 50); do t=$(temp); { [ "$i" = 1 ] || [ $((i % 6)) = 0 ]; } && log "attente de fraîcheur, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 36,5 °C en 25 min"; return 1; }
cd $B
log "j'attends la fin des séances S"
while pgrep -f "bash ./val-S.sh" >/dev/null; do sleep 15; done
log "séances S finies"
grep -q "d507660d\|df0bc319" /dev/null; [ -d "$APP" ] || { log "ÉCHEC : l'app v900 n'est pas construite"; exit 1; }
grep -c "MOBR_SONDE\|mobrSondeOk" "$APP/public/index.html" | grep -qv '^0$' || { log "ÉCHEC : l'app construite n'est pas la v900"; exit 1; }
r=$(xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 "$APP" 2>&1); echo "$r" | grep -qi "installed" || { log "ÉCHEC de l'installation :"; echo "$r" | tail -4 | cut -c1-200; exit 1; }
log "CC BANC v900 installée"
frais || exit 1
node chefv.mjs file-geo.json 99
log "comptes terminés"
