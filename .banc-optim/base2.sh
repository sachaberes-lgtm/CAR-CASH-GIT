#!/bin/bash
# base2.sh : reprise du banc 13 Pro avec deux iPhone branchés (le chef lisait la batterie sans préciser lequel). Les scénarios déjà faits sont sautés.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
V=/Users/sachaberes/cash-car/verrou-banc.sh
L=/private/tmp/cashcar-banc.lock
log(){ echo "$(date +%H:%M:%S) $*"; }
$V prendre "perf mobile : base v897 sur le 13 Pro (reprise)"
( while true; do sleep 300; echo "$$ $(date +%s) perf mobile base" > $L/qui; done ) & HB=$!
trap 'kill $HB 2>/dev/null; $V rendre' EXIT
cd $B && node chef.mjs file-base.json 37
log "chef 13 Pro terminé"
