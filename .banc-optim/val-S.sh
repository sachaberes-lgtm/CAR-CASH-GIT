#!/bin/bash
# val-S.sh : séance continue de 7 min (rejouer à chaque mort), sans gouverneur puis avec, séparées par 12 min de repos. Le 13 Pro seul.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
frais(){ for i in $(seq 1 50); do t=$(temp); { [ "$i" = 1 ] || [ $((i % 6)) = 0 ]; } && log "attente de fraîcheur, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=36.5)}' && { log "départ à $t °C"; return 0; }; sleep 30; done; log "ÉCHEC : la batterie n'est pas repassée sous 36,5 °C en 25 min"; return 1; }
cd $B
python3 - <<'PY'
import json;q=json.load(open("file-val-S.json"));json.dump([q[0]],open("file-val-S-N.json","w"));json.dump([q[1]],open("file-val-S-G.json","w"))
PY
frais || exit 1
log "séance S-N : sans gouverneur, 7 min continues"
node chefv.mjs file-val-S-N.json 99
log "séance S-N finie. Repos de 12 min"
sleep 720
frais || exit 1
log "séance S-G : avec le gouverneur, 7 min continues"
node chefv.mjs file-val-S-G.json 99
log "séances terminées"
