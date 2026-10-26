#!/bin/bash
# jeu-suite.sh : après la séance par défaut, fabrique et installe CC JEU (à jouer à la main).
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
log(){ echo "$(date +%H:%M:%S) $*"; }
cd $B
sleep 60
while pgrep -f "suite-v903D.sh" >/dev/null || pgrep -f "chefv.mjs file-v903" >/dev/null; do sleep 5; done
log "séances finies. Construction de CC JEU"
/bin/zsh ./prepare-jeu.sh "/Users/sachaberes/cash-car/mobile-perf/VERSION PRINCIPALE" 2>&1 | tail -6 | cut -c1-200
log "CC JEU prête"
