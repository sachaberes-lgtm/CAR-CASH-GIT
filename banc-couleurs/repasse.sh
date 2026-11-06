#!/bin/sh
# REPASSE : rephotographie seulement quelques couples pour chaque piste, et les fusionne dans img-<piste>/ etal-<piste>/ (puis planche).
# sh banc-couleurs/repasse.sh "espace:matin canyon:soir" A B
PY=/Library/Developer/CommandLineTools/usr/bin/python3
cd "$(dirname "$0")/.." || exit 1
C="$1"; shift
for p in "$@"; do
  rm -rf "banc-couleurs/r$p"; mkdir -p "banc-couleurs/r$p"
  OUT="banc-couleurs/r$p" PARAMS="&equilibre=$p" TEMPS='[8,11]' nice -n 15 $PY banc-couleurs/photos2.py $C > "banc-couleurs/photos-r$p.log" 2>&1
  cp banc-couleurs/r$p/img/*.jpg "banc-couleurs/img-$p/"; cp banc-couleurs/r$p/etal/*.json "banc-couleurs/etal-$p/"
  echo "piste $p : repassé $(ls banc-couleurs/r$p/img/*.jpg | wc -l) couples"
done
$PY banc-couleurs/planche.py
