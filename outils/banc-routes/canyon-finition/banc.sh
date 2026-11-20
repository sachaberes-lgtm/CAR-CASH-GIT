#!/bin/bash
# LE BANC DE LA FINITION DU CANYON (2026-11-18) : prend le verrou commun au nom « finition-canyon », lance le pilote (Chrome muet sur 8640/9640), rend le verrou s'il est
# bien à nous, puis attend 40 s. Usage : banc.sh <scenario.mjs> [cle=valeur …]   (WEB=<dossier servi> pour la référence « avant »)
# (2026-11-20) Le verrou a DEUX places (verrou-banc.sh) ; notre groupe (finition des maps) n'en tient qu'une à la fois : on prend d'abord le mutex du groupe
# (/private/tmp/finition-maps-banc.mutex, abandonné au-delà de 25 min), puis une place. On rend NOTRE place (celle dont « qui » porte finition-canyon),
# jamais « verrou-banc.sh rendre », qui libère la plus ancienne, peut-être celle d'un autre.
D=$(cd "$(dirname "$0")" && pwd)
VB=/Users/sachaberes/cash-car/verrou-banc.sh; MX=/private/tmp/finition-maps-banc.mutex; MOI=0
rend_place(){ for L in /private/tmp/cashcar-banc.lock /private/tmp/cashcar-banc.lock.2; do grep -q "finition-canyon" "$L/qui" 2>/dev/null && rm -rf "$L"; done; }
nettoie(){ [ -n "$NP" ] && kill -TERM "$NP" 2>/dev/null; sleep 2; [ -n "$NP" ] && kill -KILL "$NP" 2>/dev/null
  for p in $(lsof -tiTCP:${PS:-8640} -sTCP:LISTEN 2>/dev/null) $(lsof -tiTCP:${PC:-9640} -sTCP:LISTEN 2>/dev/null); do kill -TERM -$(ps -o pgid= -p $p | tr -d ' ') 2>/dev/null; done
  rend_place; [ "$MOI" = 1 ] && rmdir "$MX" 2>/dev/null; MOI=0; }
trap nettoie EXIT INT TERM
until mkdir "$MX" 2>/dev/null; do
  t=$(stat -f %m "$MX" 2>/dev/null); [ -n "$t" ] && [ $(( $(date +%s) - t )) -gt 1500 ] && { echo "mutex abandonné, retiré"; rmdir "$MX" 2>/dev/null; continue; }
  sleep 20; done
MOI=1; echo "mutex du groupe pris $(date +%T)"
"$VB" prendre "finition-canyon"
echo "début $(date +%T)"
node "$D/pilote.mjs" "$@" & NP=$!
wait $NP; R=$?; NP=
echo "fin $(date +%T) code $R"
nettoie; trap - EXIT; sleep 40; exit $R
