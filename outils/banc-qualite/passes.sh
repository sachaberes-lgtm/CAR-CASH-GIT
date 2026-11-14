#!/bin/sh
# Les 4 passes du banc des niveaux (nuages jour / jade nuit × couché / debout) ; le verrou du Mac est pris et rendu à CHAQUE passe (jamais > 15 min).
#   sh outils/banc-qualite/passes.sh <dossier de prises>
OUT="$1"; ICI="$(cd "$(dirname "$0")" && pwd)"
for p in "nuages:couche:midi" "nuages:debout:midi" "jade:couche:nuit" "jade:debout:nuit"; do
  c="${p%%:*}"; r="${p#*:}"; f="${r%%:*}"; m="${r#*:}"
  sh ~/cash-car/verrou-banc.sh prendre "planches"
  node "$ICI/niveaux.cjs" --vitesse 1 --out "$OUT" --carte "$c" --fmt "$f" ${m:+--meteo $m}
  sh ~/cash-car/verrou-banc.sh rendre
done
