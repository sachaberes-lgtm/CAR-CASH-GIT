#!/bin/bash
# lancer.sh <sortie> <arguments de banc-modules.py…> — sous le VERROU COMMUN des bancs (un seul Chrome sur le Mac). À lancer en arrière-plan.
# Le verrou n'est rendu que s'il porte bien « finition-modules » ; le Chrome et le serveur de CE banc sont tués par leur groupe (banc-modules.py, et ici en secours).
V=/Users/sachaberes/cash-car/verrou-banc.sh
PY=/Library/Developer/CommandLineTools/usr/bin/python3
SORTIE="$1"; shift
mkdir -p "$SORTIE"
nettoie(){
  if [ -f "$SORTIE/pids" ]; then for p in $(cat "$SORTIE/pids"); do kill -9 -- -"$p" 2>/dev/null; done; rm -f "$SORTIE/pids"; fi
  if grep -q "finition-modules" /private/tmp/cashcar-banc.lock/qui 2>/dev/null; then "$V" rendre; fi
  sleep 40
}
"$V" prendre "finition-modules" || exit 1
trap nettoie EXIT
echo "=== banc pris à $(date +%H:%M:%S)"
"$PY" "$(dirname "$0")/banc-modules.py" --sortie "$SORTIE" --ports 8650 9650 "$@"
echo "=== banc fini à $(date +%H:%M:%S)"
