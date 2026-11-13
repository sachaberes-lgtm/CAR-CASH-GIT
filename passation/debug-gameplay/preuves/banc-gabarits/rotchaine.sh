#!/bin/bash
cd "$(dirname "$0")"
for m in espace ville crypto vitree jade canyon grotte volcan nuages; do
  rm -f rot-$m.jsonl rot-$m.log
  ./un.sh --scen rot --map $m --meteo matin --tag rot-$m > rot-$m.out 2>&1
done
echo FINI > rotchaine.fini
