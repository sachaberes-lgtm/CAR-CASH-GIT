#!/bin/sh
# Construit une copie de TEST hors du dépôt (Studio pose un verrou à côté du fichier ouvert).
#   sh ROBLOX/outils/banc.sh [indice de caisse à forcer]
set -e
cd "$(dirname "$0")/.."
T="${CASHCAR_BANC:-$TEMP/cashcar-banc}"; mkdir -p "$T"
if [ -n "$1" ]; then sed -i "s/^Config.CAISSE_TEST = nil :: number?/Config.CAISSE_TEST = $1 :: number?/" src/ReplicatedStorage/CashCar/Config.luau; fi
# (la copie de test embarque le banc à distance : outils/distant.py la pilote sans qu'on clique dans Studio)
node construire.js --distant "$T/CashCarTest.rbxlx" >/dev/null
if [ -n "$1" ]; then sed -i "s/^Config.CAISSE_TEST = $1 :: number?/Config.CAISSE_TEST = nil :: number?/" src/ReplicatedStorage/CashCar/Config.luau; fi
echo "$T/CashCarTest.rbxlx"
