#!/bin/bash
# run15.sh : le banc de base sur l'iPhone 15 (port 8932), en parallèle du 13 Pro. Le verrou commun est tenu par base2.sh.
export PYMOBILEDEVICE3_UDID=00008120-000E494C34BBA01E
B=/Users/sachaberes/cash-car/optim-mobile/.banc-optim
cd $B && node chef15.mjs file-base15.json 37
echo "$(date +%H:%M:%S) chef 15 terminé"
