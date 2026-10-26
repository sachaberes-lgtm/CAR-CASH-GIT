#!/bin/bash
# valide2.sh : suite de valide.sh (CC BANC v898 déjà installée). Même départ pour les deux séries : batterie <= 34,5 °C.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 50); do t=$(temp); [ "$i" = 1 ] || [ $((i % 6)) = 0 ] && log "attente de fraîcheur, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=34.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 34,5 °C en 25 min"; return 1; }
cd $B
log "fraîcheur avant la série N"; frais || exit 1
log "série N : sans gouverneur"
node chefv.mjs file-val-N.json 37
log "série N finie. Repos de 12 min au moins"
sleep 720
log "fraîcheur avant la série G"; frais || exit 1
log "série G : avec le gouverneur"
node chefv.mjs file-val-G.json 37
log "validation terminée"
