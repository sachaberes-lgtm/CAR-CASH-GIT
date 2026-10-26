#!/bin/bash
# valide3.sh : reprise de la validation v898 (CC BANC déjà installée). Attend le câble USB, même seuil de départ pour les deux séries (<= 36,5 °C : le téléphone au repos reste à 36,4-37 °C avec partage de connexion et charge).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 40); do t=$(temp); { [ "$i" = 1 ] || [ $((i % 6)) = 0 ]; } && log "attente de fraîcheur, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 36,5 °C en 20 min"; return 1; }
cd $B
log "j'attends le câble USB du 13 Pro (15 min au plus)"
ok=0; for i in $(seq 1 90); do $B/venv/bin/pymobiledevice3 usbmux list 2>/dev/null | grep -q 00008110-000621041468401E && { ok=1; break; }; sleep 10; done
[ $ok = 1 ] || { log "ÉCHEC : le 13 Pro n'est pas branché en USB"; exit 1; }
log "13 Pro branché"
frais || exit 1
log "série N : sans gouverneur"
node chefv.mjs file-val-N.json 37
log "série N finie. Repos de 12 min au moins"
sleep 720
frais || exit 1
log "série G : avec le gouverneur"
node chefv.mjs file-val-G.json 37
log "validation terminée"
