#!/bin/sh
# Vérifie la branche courante SANS toucher à VERSION PRINCIPALE/index.html (un banc peut le servir) : assemble code/ dans une copie
# (dossier temporaire : VERSION PRINCIPALE en liens, index.html neuf), puis les gardes du démarrage, de l'allègement et de la charte.
set -e
cd "$(dirname "$0")/../.."
T=$(mktemp -d "${TMPDIR:-/tmp}/verif-branche-XXXX")
mkdir -p "$T/VERSION PRINCIPALE"; ln -s "$PWD/outils" "$T/outils"
cp -R code "$T/code"
for f in "VERSION PRINCIPALE"/*; do b=$(basename "$f"); [ "$b" = index.html ] || ln -s "$PWD/$f" "$T/VERSION PRINCIPALE/$b"; done
cp "VERSION PRINCIPALE/index.html" "$T/VERSION PRINCIPALE/index.html"
( cd "$T" && node code/assembler.cjs --depuis-morceaux | tail -1 && node outils/garde-demarrage.cjs "$T/VERSION PRINCIPALE" | tail -1 )
sh garde-allege.sh | tail -1; sh garde-charte.sh | tail -1
rm -rf "$T"
