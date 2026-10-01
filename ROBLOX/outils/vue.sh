#!/bin/sh
# Photographie la VUE 3D de la copie de test (sans la mettre devant) : sh ROBLOX/outils/vue.sh <sortie.png> [largeur]
# (le cadre de la vue dans la fenêtre de Studio, panneaux à leur place par défaut : à retoucher si on les déplace)
cd "$(dirname "$0")"
powershell -NoProfile -ExecutionPolicy Bypass -File studio-photo.ps1 "$(cygpath -w "$1")" 0.114 0.1245 0.927 0.817 "${2:-1100}"
