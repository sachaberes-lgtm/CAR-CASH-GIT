#!/bin/sh
# LE TOUR 2 DE LA FINITION DE JADE (2026-11-18, après le contrôle adverse) : passages sous le verrou commun, chacun < 8 min.
#   Les « avant » sont ceux du contrôle (mêmes réglages : --pas 120, sans nitro, ?tel=1, DPR 3), copiés dans <O>/prises.
#   sh outils/banc-finition-jade/tour2.sh 1   les « après » couchés (graines 3, 17) et debout (graines 3, 11) des six temps + sans=jadefini (orage, nuit)
#   sh outils/banc-finition-jade/tour2.sh 2   la reprise après le 2e réglage (nuit, matin, midi, pluie) + l'astre (soir, nuit, matin, graine 11, avant et après)
D=$(cd "$(dirname "$0")" && pwd)
AV="/Users/sachaberes/cash-car/finition-lots/avant/VERSION PRINCIPALE"
AP="/Users/sachaberes/cash-car/finition-lots/jade/VERSION PRINCIPALE"
O=/Users/sachaberes/cash-car/game/.claude/worktrees/finition-maps-dee281/passation/photos/finition-maps/jade/tour2
J=$O/journal.txt
if [ "$1" = 1 ]; then
  M="soir nuit matin midi pluie orage"
  S=""; for g in 3 17; do for m in $M; do S="$S ap@8631@$m@$g"; done; done
  for g in 3 11; do for m in $M; do S="$S apP@8631@$m@$g"; done; done
  S="$S sa@8631@orage@17@sans=jadefini sa@8631@nuit@17@sans=jadefini"
  sh "$D/passage.sh" "$J" --out "$O/prises" --pas 120 --apres "$AP" $S
else
  M="nuit matin midi pluie"
  S=""; for g in 3 17; do for m in $M; do S="$S ap@8631@$m@$g"; done; done
  for g in 3 11; do for m in $M; do S="$S apP@8631@$m@$g"; done; done
  for m in soir nuit matin; do S="$S av@8630@$m@11 ap@8631@$m@11"; done
  sh "$D/passage.sh" "$J" --out "$O/prises" --pas 120 --astre 1 --avant "$AV" --apres "$AP" $S   # un seul passage (~7 min) : l'astre est pris sur chaque scène couchée
fi
