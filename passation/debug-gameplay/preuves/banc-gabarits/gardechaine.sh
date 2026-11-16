#!/bin/bash
cd "$(dirname "$0")"
rm -f gardechaine.fini
./garde.sh garde-off-tot --khr 0 --jouer tot > garde-off-tot.out 2>&1
./garde.sh garde-off-tard --khr 0 --jouer tard > garde-off-tard.out 2>&1
./garde.sh garde-on-tot --khr 1 --jouer tot > garde-on-tot.out 2>&1
./garde.sh garde-on-tard --khr 1 --jouer tard > garde-on-tard.out 2>&1
echo FINI > gardechaine.fini
