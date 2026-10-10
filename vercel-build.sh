#!/bin/sh
# Construction du site Vercel (appelée par vercel.json — une buildCommand ne peut pas dépasser 256 caractères).
#   /jouer/ = la VERSION PRINCIPALE du jeu (sans les notes internes)
#   /demo/  = l'ancienne démo du 4 septembre
#   /       = redirigée vers /jouer/ (voir "redirects" dans vercel.json)
set -e
# (2026-10-07, Léo) LA GARDE DU BURN-OUT : une version sans le burn-out du garage n'est PAS publiée — la construction échoue, le site
# garde la version d'avant (voir garde-burnout.sh, « LE BURN-OUT EST À LÉO » dans CLAUDE.md ; GARDE_BURNOUT=0 la coupe).
sh garde-burnout.sh
rm -rf .vercel-static
mkdir -p .vercel-static
cp -R demo/cash-car-demo .vercel-static/demo
cp demo/cash-car-demo/og.jpg .vercel-static/og.jpg
cp -R "VERSION PRINCIPALE" .vercel-static/jouer
rm -f .vercel-static/jouer/CLAUDE.md .vercel-static/jouer/README.md .vercel-static/jouer/JOUER.bat
# (2026-10-07, campagne de debug avant publication) les OUTILS de travail ne partent plus en ligne : le banc d écoute (sons.html), l atelier
# du son (recettes, scripts) — le jeu n en charge aucun (l atelier des nuages reste : ?nuages=1 le charge en ligne).
rm -rf .vercel-static/jouer/atelier-son .vercel-static/jouer/sons.html
# (2026-10-11) la page des niveaux (maps-ciel.html + son dossier : photos, serveur qui écrit sur le disque) reste un outil LOCAL
rm -rf .vercel-static/jouer/maps-ciel.html .vercel-static/jouer/maps-ciel
# LA MÊME VERSION POUR TOUT LE MONDE (2026-10-01, Léo) : le commit publié est gravé dans le jeu (jeton __CC_BUILD__ de
# index.html) et posé dans version.json ; le jeu compare les deux et se recharge tout seul s'il est en retard.
# ⚠ (2026-10-03, Léo : « le jeu coupe bizarrement la musique ») L'EMPREINTE DU JEU, PLUS LE COMMIT : graver le commit faisait croire à une
# nouvelle version à CHAQUE push — 23 publications sur 25 ce jour-là ne touchaient que ROBLOX/ — et tous les joueurs au menu ou à l'écran
# de mort étaient RECHARGÉS toutes les quelques minutes (la musique coupée net, puis un autre son du lobby tiré au hasard). On grave
# maintenant l'EMPREINTE des fichiers du jeu publiés (jouer/, jetons intacts, sans les notes) : elle ne change que si le JEU change. Le
# commit reste noté dans version.json (« commit »), pour retrouver d'où vient une publication.
SHA="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || date +%s)}"
JEU=$(cd .vercel-static/jouer && find . -type f ! -name version.json -print0 | LC_ALL=C sort -z | xargs -0 sha1sum | sha1sum | cut -c1-40)
[ -n "$JEU" ] || JEU="$SHA"
sed "s/__CC_BUILD__/$JEU/" .vercel-static/jouer/index.html > .vercel-static/jouer/index.tmp && mv .vercel-static/jouer/index.tmp .vercel-static/jouer/index.html
printf '{"v":"%s","commit":"%s"}\n' "$JEU" "$SHA" > .vercel-static/jouer/version.json
