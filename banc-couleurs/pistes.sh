#!/bin/sh
# Photographie TOUS les couples pour chaque piste donnée (A B …), puis remesure et refait la planche. Lancer depuis ~/cash-car/couleurs.
# sh banc-couleurs/pistes.sh A B
PY=/Library/Developer/CommandLineTools/usr/bin/python3
cd "$(dirname "$0")/.." || exit 1
for p in "$@"; do
  rm -rf "banc-couleurs/p$p"; mkdir -p "banc-couleurs/p$p"
  OUT="banc-couleurs/p$p" PARAMS="&equilibre=$p" TEMPS='[8,11]' nice -n 15 $PY banc-couleurs/photos2.py --tout banquise:midi banquise:soir banquise:nuit banquise:neige > "banc-couleurs/photos-$p.log" 2>&1
  rm -rf "banc-couleurs/img-$p" "banc-couleurs/etal-$p"; mv "banc-couleurs/p$p/img" "banc-couleurs/img-$p"; mv "banc-couleurs/p$p/etal" "banc-couleurs/etal-$p"
  nice -n 15 $PY banc-couleurs/mesure2.py "banc-couleurs/img-$p" "banc-couleurs/etal-$p"
  echo "piste $p : $(ls banc-couleurs/img-$p/*.jpg | wc -l) photos"
done
$PY banc-couleurs/planche.py
