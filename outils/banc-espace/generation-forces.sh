#!/bin/sh
# node séquentiel : un tirage forcé après l'autre (usage : generation-forces.sh cle val1 val2 … ; paliers/n par PAL, N)
cd "$(dirname "$0")/../.."
k=$1; shift
for v in "$@"; do node outils/banc-espace/generation-crible.cjs "search=?orb$k=$v" paliers=${PAL:-0,10,20,27} n=${N:-45} rodage=10 sortie=passation/espace-debug/data/force-$k-$v.jsonl 2>>passation/espace-debug/data/forces.log; done
echo fini $k >> passation/espace-debug/data/forces.log
