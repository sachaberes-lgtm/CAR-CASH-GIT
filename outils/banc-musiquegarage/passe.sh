#!/bin/bash
# Une passe du banc de la musique du garage sous le verrou commun, plusieurs jeux d'affilée (un verrou pour tous). Rend SON verrou seulement.
#   sh outils/banc-musiquegarage/passe.sh <dossier de sortie> <dossier des profils> "<nom=dossier VERSION PRINCIPALE> ..." [options de garage.cjs]
D="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$1"; PROF="$2"; LISTE="$3"; shift 3; mkdir -p "$OUT" "$PROF"
QUI="auteur-musiquegarage"
~/cash-car/verrou-banc.sh prendre "$QUI"
rendre() { if grep -qs "$QUI" /private/tmp/cashcar-banc.lock*/qui; then ~/cash-car/verrou-banc.sh rendre; fi; rm -rf "$PROF"/banc-mg-prof-* 2>/dev/null; }
trap rendre EXIT
cd "$D"
for X in $LISTE; do N="${X%%=*}"; J="${X#*=}"
  echo "== $N $(date +%T)"
  node outils/banc-musiquegarage/garage.cjs --jeu "$J" --prof "$PROF" "$@" > "$OUT/$N.txt" 2>&1
  echo "   fini $(date +%T)"
done
