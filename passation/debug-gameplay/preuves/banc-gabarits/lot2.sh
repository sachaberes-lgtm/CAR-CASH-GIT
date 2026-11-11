#!/bin/bash
# usage: lot2.sh <args de gab.cjs> : verrou, lance, rend (profil temporaire propre)
V=/Users/sachaberes/cash-car/verrou-banc.sh
$V prendre debug-gameplay-gabarits
trap '$V rendre' EXIT
cd "$(dirname "$0")"
node gab.cjs "$@" --prof /private/tmp/cc-gab-prof
