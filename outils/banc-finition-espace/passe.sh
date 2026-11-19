#!/bin/bash
# passe.sh <sortie> <arguments de banc.py…> — UN passage de banc sous le VERROU COMMUN (finition-espace) ; à lancer en arrière-plan.
V=/Users/sachaberes/cash-car/verrou-banc.sh; Q=/private/tmp/cashcar-banc.lock/qui
PY=/Library/Developer/CommandLineTools/usr/bin/python3; ICI="$(cd "$(dirname "$0")" && pwd)"
SORTIE="$1"; shift; mkdir -p "$SORTIE"
"$V" prendre "finition-espace" || exit 1
nettoie(){ if [ -f "$SORTIE/_pids" ]; then for p in $(cat "$SORTIE/_pids"); do kill -9 -- -"$p" 2>/dev/null; done; rm -f "$SORTIE/_pids"; fi
  [ -n "$BP" ] && kill -9 -- -"$BP" 2>/dev/null
  rm -rf "$SORTIE/_profil" "$SORTIE/_serve"
  if grep -q "finition-espace" "$Q" 2>/dev/null; then "$V" rendre; fi; sleep 40; }
export TMPDIR="$SORTIE/_profil"; mkdir -p "$TMPDIR"
trap nettoie EXIT
echo "=== banc pris à $(date +%H:%M:%S)"
set -m
"$PY" "$ICI/banc.py" --sortie "$SORTIE" "$@" &
BP=$!; wait $BP
echo "=== banc fini à $(date +%H:%M:%S)"
