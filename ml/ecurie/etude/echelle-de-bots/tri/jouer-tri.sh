#!/bin/sh
# Les 40 courses du test B, UNE A LA FOIS (le PC porte une vague du banc). Reprise : une course deja ecrite n'est pas rejouee.
# usage (depuis la racine du depot) : sh ml/ecurie/etude/echelle-de-bots/tri/jouer-tri.sh
T=ml/ecurie/etude/echelle-de-bots/tri
for g in 3000037 3000111 3000222 3000259 3000333 3000370 3000444 3000592 3000666 3000703 3000740 3000777 3000851 3000925 3000962 3000999 3001073 3001184 3001295 3001554 3001665 3001702 3001813 3001850 3001887 3001924 3001961 3001998 3002109 3002146 3002294 3002331 3002368 3002479 3002516 3002553 3002590 3002664 3002701 3002775; do
  f=$T/parties-banc/$g.json.gz
  if [ -f "$f" ]; then continue; fi
  node $T/course-tri.js --graine $g --pilote banc --sortie "$f" 2>>$T/sorties/err.txt >> $T/sorties/courses-banc.jsonl || echo "{\"graine\":$g,\"echec\":1}" >> $T/sorties/courses-banc.jsonl
  echo "$(date +%H:%M:%S) $g fini"
done
echo FIN
