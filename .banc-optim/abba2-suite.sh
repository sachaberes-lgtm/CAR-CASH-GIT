#!/bin/bash
# abba2-suite.sh : après fin-suite.sh, d'abord F = séance entière CALÉE SUR 30 DÈS LA 1re SECONDE (dose forcée à 200), puis le test croisé A (v903 par défaut) / B (leviers coupés) / B / A. 12 min de repos et batterie <= 36,5 °C avant chaque séance.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 60); do t=$(temp); [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 36,5 °C en 30 min"; return 1; }
cd $B
sleep 30
while pgrep -f "fin-suite.sh" >/dev/null || pgrep -f "chefv.mjs" >/dev/null; do sleep 10; done
log "fin-suite terminée. Repos de 12 min avant la séance calée sur 30"
sleep 720
frais || exit 1
log "séance F : calée sur 30 dès la 1re seconde"
node chefv.mjs file-v903F.json 99
log "séance F finie"
for n in A1 B1 B2 A2; do
  sleep 720
  frais || exit 1
  log "séance ABBA $n"
  node chefv.mjs file-abba-$n.json 99
  log "séance $n finie"
done
log "ABBA terminé"
