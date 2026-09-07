#!/usr/bin/env bash
# CASH CAR — harnais de validation (T0)
# usage : check.sh <chemin>   (répertoire contenant index.html, ou contenant www/index.html)
# Six contrôles (a-f), PASS/FAIL par ligne, code de sortie non nul si au moins un échec.
set -u

if [ -z "${1:-}" ]; then
  echo "usage: check.sh <chemin>" >&2
  exit 2
fi

ROOT="$(cd "$1" 2>/dev/null && pwd)" || { echo "FAIL: chemin introuvable — $1"; exit 2; }

if [ -f "$ROOT/index.html" ]; then
  WEB="$ROOT"
elif [ -f "$ROOT/www/index.html" ]; then
  WEB="$ROOT/www"
else
  echo "FAIL: aucun index.html trouvé sous $ROOT (ni à la racine, ni dans www/)"
  exit 2
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$DIR/check.js" "$WEB"
