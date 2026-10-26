#!/bin/bash
# abba3-suite.sh : F (séance entière calée sur 30 dès la 1re seconde) puis A1 B1 B2 A2. ATTEND LE DÉVERROUILLAGE du 13 Pro avant chaque séance (6 h au plus), batterie <= 36,5 °C, 12 min de repos entre les séances.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
deverrouille(){ for i in $(seq 1 720); do if xcrun devicectl device info lockState --device $D 2>&1 | grep -q "passcodeRequired: false"; then return 0; fi; [ "$i" = 1 ] && log "le 13 Pro est verrouillé : j'attends"; sleep 30; done; log "ÉCHEC : le 13 Pro est resté verrouillé 6 h"; return 1; }
frais(){ for i in $(seq 1 60); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 36,5 °C en 30 min"; return 1; }
lance(){ deverrouille || exit 1; frais || exit 1; log "séance $1"; node chefv.mjs $2 99; log "séance $1 finie"; }
cd $B
lance "F : calée sur 30 dès la 1re seconde" file-v903F.json
for n in A1 B1 B2 A2; do sleep 720; lance "ABBA $n" file-abba-$n.json; done
log "ABBA terminé"
