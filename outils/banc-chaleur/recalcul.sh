#!/bin/sh
# BANC DE CHALEUR v3 — refait le résumé de TOUS les essais depuis une heure donnée (marques.txt), avec la version courante de resume.py :
#   sh recalcul.sh "2026-11-17 04:05" > recalcul.txt   → recalcul.jsonl à côté du journal (bilan.py recalcul.jsonl)
R=~/cash-car/ios-ultime-mesures/chaleur; ICI=$(cd "$(dirname "$0")" && pwd); DEPUIS=${1:-2026-11-17 04:05}
rm -f $R/recalcul.jsonl
awk -v d="$DEPUIS" '($1" "$2)>=d' $R/marques.txt | while read -r J H T NOM QS; do
  if [ "$T" = DEBUT ]; then N=$NOM; Q=$QS; H0="$J $H"
  elif [ "$T" = FIN ] && [ "$NOM" = "$N" ]; then ESSAIS_JSONL=$R/recalcul.jsonl /usr/bin/python3 $ICI/resume.py $R/journal.txt 0 $R/batterie.txt 0 "$H0" "$J $H" "$N" "$Q"; fi
done
