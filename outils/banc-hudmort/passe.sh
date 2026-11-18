#!/bin/bash
# Une passe du banc des morts SOUS LE VERROU COMMUN (un seul Chrome de banc sur le Mac). Même verrou que ~/cash-car/verrou-banc.sh
# (mkdir atomique, qui = « pid date nom », repris après 15 min), regardé toutes les 2 s au lieu de 15. Rend le verrou même si le banc
# échoue, et seulement s'il est encore à nous.
#   sh outils/banc-hudmort/passe.sh "<nom du verrou>" <arguments de morts.cjs…>
#   VARIANTES="defaut sans=hudmort" OUT=dossier sh outils/banc-hudmort/passe.sh "<nom>" <arguments…>  → une course de morts.cjs par variante,
#   dans OUT/<variante>, sous le même verrou (avant / après dans la même prise)
NOM="$1"; shift
D="$(cd "$(dirname "$0")" && pwd)"
L=/private/tmp/cashcar-banc.lock
while true; do
  if mkdir "$L" 2>/dev/null; then echo "$$ $(date +%s) $NOM" > "$L/qui"; echo "verrou pris par $NOM"; break; fi
  t=$(awk '{print $2}' "$L/qui" 2>/dev/null); now=$(date +%s)
  if [ -n "$t" ] && [ $((now - t)) -gt 900 ]; then echo "verrou abandonné ($(cat "$L/qui" 2>/dev/null)), repris"; rm -rf "$L"; continue; fi
  sleep 2
done
MOI="$(cat "$L/qui" 2>/dev/null)"
RC=0
if [ -n "$VARIANTES" ]; then
  for v in $VARIANTES; do
    if [ "$v" = "defaut" ]; then node "$D/morts.cjs" --out "$OUT/$v" "$@" || RC=$?; else node "$D/morts.cjs" --out "$OUT/$v" --q "$v" "$@" || RC=$?; fi
  done
else
  node "$D/morts.cjs" "$@"; RC=$?
fi
if [ "$(cat "$L/qui" 2>/dev/null)" = "$MOI" ]; then rm -rf "$L"; echo "verrou rendu"; else echo "verrou plus à nous : on n'y touche pas"; fi
exit $RC
