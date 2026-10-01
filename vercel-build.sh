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
# LA MÊME VERSION POUR TOUT LE MONDE (2026-10-01, Léo) : le commit publié est gravé dans le jeu (jeton __CC_BUILD__ de
# index.html) et posé dans version.json ; le jeu compare les deux et se recharge tout seul s'il est en retard.
SHA="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || date +%s)}"
sed "s/__CC_BUILD__/$SHA/" .vercel-static/jouer/index.html > .vercel-static/jouer/index.tmp && mv .vercel-static/jouer/index.tmp .vercel-static/jouer/index.html
printf '{"v":"%s"}\n' "$SHA" > .vercel-static/jouer/version.json
