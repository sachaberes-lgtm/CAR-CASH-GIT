#!/bin/sh
# Construit une copie de TEST hors du dépôt (Studio pose un verrou à côté du fichier ouvert).
#   sh ROBLOX/outils/banc.sh [indice de caisse à forcer]
#   NIVEAU=ville sh ROBLOX/outils/banc.sh        (force le niveau de toutes les zones : ville, espace, orage, nuit, hard)
set -e
cd "$(dirname "$0")/.."
T="${CASHCAR_BANC:-$TEMP/cashcar-banc}"; mkdir -p "$T"
C=src/ReplicatedStorage/CashCar/Config.luau
cp "$C" "$T/Config.sauve"
if [ -n "$1" ]; then sed -i "s/^Config.CAISSE_TEST = nil :: number?/Config.CAISSE_TEST = $1 :: number?/" "$C"; fi
if [ -n "$LANGUE" ]; then sed -i "s/^Config.LANGUE_TEST = nil :: string?/Config.LANGUE_TEST = \"$LANGUE\" :: string?/" "$C"; fi
if [ -n "$NIVEAU" ]; then sed -i "s/^Config.NIVEAU_TEST = nil :: string?/Config.NIVEAU_TEST = \"$NIVEAU\" :: string?/" "$C"; fi
# (la copie de test embarque le banc à distance : outils/distant.py la pilote sans qu'on clique dans Studio)
node construire.js --distant "$T/CashCarTest.rbxlx" >/dev/null || { cp "$T/Config.sauve" "$C"; exit 1; }
cp "$T/Config.sauve" "$C"
echo "$T/CashCarTest.rbxlx"
