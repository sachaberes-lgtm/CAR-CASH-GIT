#!/bin/sh
# Construction du site Vercel (appelée par vercel.json — une buildCommand ne peut pas dépasser 256 caractères).
#   /jouer/ = la VERSION PRINCIPALE du jeu (sans les notes internes)
#   /demo/  = l'ancienne démo du 4 septembre
#   /       = redirigée vers /jouer/ (voir "redirects" dans vercel.json)
set -e
rm -rf .vercel-static
mkdir -p .vercel-static
cp -R demo/cash-car-demo .vercel-static/demo
cp demo/cash-car-demo/og.jpg .vercel-static/og.jpg
cp -R "VERSION PRINCIPALE" .vercel-static/jouer
rm -f .vercel-static/jouer/CLAUDE.md .vercel-static/jouer/README.md .vercel-static/jouer/JOUER.bat
