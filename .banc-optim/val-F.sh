#!/bin/bash
# val-F.sh : après la série G, deux courses avec la dose forcée à 170 (mode 30 du gouverneur) dans les mêmes conditions de chaleur.
export PYMOBILEDEVICE3_UDID=00008110-000621041468401E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
cd $B
while pgrep -f "chefv.mjs file-val-G" >/dev/null; do sleep 5; done
echo "$(date +%H:%M:%S) série G finie : courses forcées F"
node chefv.mjs file-val-F.json 37
echo "$(date +%H:%M:%S) validation F terminée"
