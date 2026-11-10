#!/bin/bash
# usage: lot.sh <args de gab.cjs>  (prend le verrou, attend la charge < 40, lance, rend le verrou)
V=/Users/sachaberes/cash-car/verrou-banc.sh
$V prendre debug-gameplay-gabarits
trap '$V rendre' EXIT
while [ "$(uptime | awk -F'load averages?: ' '{print $2}' | awk -F'[ ,]+' '{print int($1)}')" -gt 40 ]; do sleep 20; done
cd "$(dirname "$0")"
node gab.cjs "$@"
