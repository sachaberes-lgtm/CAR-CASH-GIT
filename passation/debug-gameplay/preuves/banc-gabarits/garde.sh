#!/bin/bash
# usage: garde.sh <tag> --khr 0|1 --jouer tot|tard : profil NEUF, verrou, un seul Chrome
V=/Users/sachaberes/cash-car/verrou-banc.sh
cd "$(dirname "$0")"
TAG=$1; shift
$V prendre debug-gameplay-gabarits
trap '$V rendre; rm -rf /private/tmp/cc-gab-prof-neuf' EXIT
rm -rf /private/tmp/cc-gab-prof-neuf
node scen.cjs --scen garde --map nuages --tag $TAG --prof /private/tmp/cc-gab-prof-neuf "$@"
