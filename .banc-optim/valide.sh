#!/bin/bash
# valide.sh : v898 sur le 13 Pro. Construit et installe CC BANC, série N (?mob_gouv=0), long repos, série G (gouverneur), 25/10. Sans verrou commun (accord de Sacha).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
temp(){ perl -e 'alarm 30; exec @ARGV' $B/venv/bin/pymobiledevice3 diagnostics battery single </dev/null 2>/dev/null | grep '"Temperature"' | tr -dc '0-9' | awk '{printf "%.1f", $1/100}'; }
cd $B
log "construction et installation de CC BANC (jeu v898)"
out=$(/bin/zsh ./prepare-banc.sh "/Users/sachaberes/cash-car/mobile-perf/VERSION PRINCIPALE" 2>&1 | tail -8)
echo "$out" | cut -c1-200
echo "$out" | grep -q "jeu b4179370" || { log "ÉCHEC : le jeu embarqué n'est pas b4179370"; exit 1; }
echo "$out" | grep -q "App installed" || { log "ÉCHEC : installation sur le 13 Pro"; exit 1; }
log "installée. Batterie $(temp) °C. Série N : sans gouverneur"
node chefv.mjs file-val-N.json 37
log "série N finie. Long repos : 12 min au moins, puis batterie sous 34,5 °C (15 min au plus)"
sleep 720
for i in $(seq 1 30); do t=$(temp); log "repos, batterie $t °C"; [ -n "$t" ] && awk -v t="$t" 'BEGIN{exit !(t<=34.5)}' && break; sleep 30; done
log "série G : avec le gouverneur"
node chefv.mjs file-val-G.json 37
log "validation terminée"
