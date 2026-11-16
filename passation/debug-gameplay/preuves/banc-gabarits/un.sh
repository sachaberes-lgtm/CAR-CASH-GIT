#!/bin/bash
# usage: un.sh <args de scen.cjs>  (verrou pris puis rendu, un seul Chrome)
V=/Users/sachaberes/cash-car/verrou-banc.sh
$V prendre debug-gameplay-gabarits
trap '$V rendre' EXIT
cd "$(dirname "$0")"
node scen.cjs "$@" --prof /private/tmp/cc-gab-prof
