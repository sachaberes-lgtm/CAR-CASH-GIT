#!/bin/bash
# LE BANC DE LA FINITION DU CANYON (2026-11-18) : prend le verrou commun au nom « finition-canyon », lance le pilote (Chrome muet sur 8640/9640), rend le verrou s'il est
# bien à nous, puis attend 40 s. Usage : banc.sh <scenario.mjs> [cle=valeur …]   (WEB=<dossier servi> pour la référence « avant »)
D=$(cd "$(dirname "$0")" && pwd)
VB=/Users/sachaberes/cash-car/verrou-banc.sh; Q=/private/tmp/cashcar-banc.lock/qui
nettoie(){ [ -n "$NP" ] && kill -TERM "$NP" 2>/dev/null; sleep 2; [ -n "$NP" ] && kill -KILL "$NP" 2>/dev/null
  for p in $(lsof -tiTCP:${PS:-8640} -sTCP:LISTEN 2>/dev/null) $(lsof -tiTCP:${PC:-9640} -sTCP:LISTEN 2>/dev/null); do kill -TERM -$(ps -o pgid= -p $p | tr -d ' ') 2>/dev/null; done
  if grep -q "finition-canyon" "$Q" 2>/dev/null; then "$VB" rendre; fi; }
trap nettoie EXIT INT TERM
"$VB" prendre "finition-canyon"
echo "début $(date +%T)"
node "$D/pilote.mjs" "$@" & NP=$!
wait $NP; R=$?; NP=
echo "fin $(date +%T) code $R"
nettoie; trap - EXIT; sleep 40; exit $R
