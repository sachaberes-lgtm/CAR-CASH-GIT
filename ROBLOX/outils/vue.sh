#!/bin/sh
# Photographie la VUE 3D de la copie de test (sans la mettre devant) : sh ROBLOX/outils/vue.sh <sortie.png> [largeur]
# (le cadre de la vue est cherché dans la fenêtre : voir vue.py)
cd "$(dirname "$0")"
python vue.py "$(cygpath -w "$1")" "${2:-1100}"
