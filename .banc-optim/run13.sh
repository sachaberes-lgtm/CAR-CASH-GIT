#!/bin/bash
# run13.sh : reprise du banc de base sur le 13 Pro seulement (A2 puis la course chaude), sans le verrou commun (accord de Sacha, 25/10).
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
cd /Users/sachaberes/cash-car/optim-mobile/.banc-optim && node chef.mjs file-base.json 37
echo "$(date +%H:%M:%S) chef 13 Pro terminé"
