#!/bin/sh
# Construction du site Vercel (appelée par vercel.json — une buildCommand ne peut pas dépasser 256 caractères).
#   /jouer/ = la VERSION PRINCIPALE du jeu (sans les notes internes)
#   /demo/  = l'ancienne démo du 4 septembre
#   /       = redirigée vers /jouer/ (voir "redirects" dans vercel.json)
set -e
# (2026-10-07, Léo) LA GARDE DU BURN-OUT : une version sans le burn-out du garage n'est PAS publiée — la construction échoue, le site
# garde la version d'avant (voir garde-burnout.sh, « LE BURN-OUT EST À LÉO » dans CLAUDE.md ; GARDE_BURNOUT=0 la coupe).
sh garde-burnout.sh
# (2026-10-14, Sacha) LA GARDE DE LA CHARTE : logo de l'accueil figé par empreinte, police pixel, charte 6 en opt-in (garde-charte.sh ;
# GARDE_CHARTE=0 la coupe).
sh garde-charte.sh
rm -rf .vercel-static
mkdir -p .vercel-static
cp -R demo/cash-car-demo .vercel-static/demo
cp demo/cash-car-demo/og.jpg .vercel-static/og.jpg
cp -R "VERSION PRINCIPALE" .vercel-static/jouer
# (2026-10-20, Sacha : « donne-moi juste un lien ») /enregistrer/ = la page d enregistrement des parties pour les bots (ml/train : train.html + ses
# vendor/assets, rien d autre). Lien : /enregistrer/?rec=1 — E demarre/arrete, chaque arret telecharge un demo-*.json (pas de serveur en ligne).
mkdir -p .vercel-static/enregistrer && cp ml/train/train.html .vercel-static/enregistrer/index.html && cp -R ml/train/vendor ml/train/assets .vercel-static/enregistrer/
rm -f .vercel-static/jouer/CLAUDE.md .vercel-static/jouer/JOURNAL.md .vercel-static/jouer/README.md .vercel-static/jouer/JOUER.bat
# (2026-10-07, campagne de debug avant publication) les OUTILS de travail ne partent plus en ligne : le banc d écoute (sons.html), l atelier
# du son (recettes, scripts) — le jeu n en charge aucun (l atelier des nuages reste : ?nuages=1 le charge en ligne).
rm -rf .vercel-static/jouer/atelier-son .vercel-static/jouer/sons.html
# (2026-10-11) la page des niveaux (maps-ciel.html + son dossier : photos, serveur qui écrit sur le disque) reste un outil LOCAL
rm -rf .vercel-static/jouer/maps-ciel.html .vercel-static/jouer/maps-ciel
# (2026-10-12) le SIMULATEUR LÉGER (simulateur.html + son dossier : serveur qui écrit sur le disque) reste un outil LOCAL
rm -rf .vercel-static/jouer/simulateur.html .vercel-static/jouer/simulateur
# (2026-10-12, passe qualité) les autres outils LOCAUX de Léo (servis par python en local, serveurs qui écrivent sur le disque) :
# la salle blanche, la boîte à dauphins, la boîte du singe — et aucun script Python ne part en ligne
rm -rf .vercel-static/jouer/salle-blanche.html .vercel-static/jouer/salle-blanche .vercel-static/jouer/boite-dauphins.html .vercel-static/jouer/boite-singe.html
# (2026-10-15, Léo) LE RÉPERTOIRE DES MAPS (repertoire-maps/ : la page, ses photos, son banc) reste un outil LOCAL — en ligne, il changerait
# l empreinte du jeu publié (tous les joueurs rechargés)
rm -rf .vercel-static/jouer/repertoire-maps
find .vercel-static/jouer -name '*.py' -delete
# (2026-10-14, pôle SON) L'ATELIER DE LA MUSIQUE reste un outil LOCAL (Léo : « pour toi ») : la page musique-moteur.html (elle fige les
# morceaux par le serveur de la page) et les sources des morceaux à paliers (paliers/*.html).
rm -f .vercel-static/jouer/musique-moteur.html .vercel-static/jouer/assets/audio/music/paliers/*.html
# (2026-10-18, Sacha : « ne plus publier la bibliothèque des sons ») LA BIBLIOTHÈQUE (bibliotheque.html) reste un outil LOCAL — et avec elle tout
# ce que SEULE elle lit : ses catalogues de boucles (boucles/, depart/, petites-musiques/, les *-donnees.js), le lobby du garage que le jeu ne joue
# plus (lobby/garage-*), GLISSE, le moteur French Touch et les mesures de goûts. Les fichiers restent dans le dépôt. Rien de ce que le jeu peut
# demander n'est touché : MENU_MUS (lobby/ciel-*), l'auto-école (lobby/chris-matin), les morts et l'argent (death/, fx/), Pouce bleu (le reste de direct/,
# musique-moteur.json, musique-paliers.js, rendus/). boucles/dark-triad.m4a RESTE : c'est le morceau de la frénésie (MUSIC_FREN le cherche en .mp3 ailleurs).
rm -f .vercel-static/jouer/bibliotheque.html
rm -rf .vercel-static/jouer/assets/audio/music/depart .vercel-static/jouer/assets/audio/music/petites-musiques
find .vercel-static/jouer/assets/audio/music/boucles -type f ! -name dark-triad.m4a -delete 2>/dev/null || true
rm -f .vercel-static/jouer/assets/audio/music/lobby/menu-donnees.js .vercel-static/jouer/assets/audio/music/lobby/chris-donnees.js .vercel-static/jouer/assets/audio/music/lobby/garage-*.m4a
rm -f .vercel-static/jouer/assets/audio/music/direct/french-touch.html .vercel-static/jouer/assets/audio/music/direct/gouts-mesures.json .vercel-static/jouer/assets/audio/music/direct/musique-glisse.js
# …et ce qui dépend des musiques de POUCE BLEU (musique-moteur.json) est calculé à chaque build, avec la règle du jeu : les dossiers de paliers
# des morceaux rangés « bleu », les générateurs que les 👍 rejouent, les échantillons vrais/ du rejeu (outils/vrais-jeu.json, tant que sa preuve
# colle). AVANT publie-allege (l'empreinte de la preuve lit les fichiers tels que le dépôt les a).
node outils/publie-audio.cjs .vercel-static/jouer || echo "⚠ publie-audio : échec, la copie part avec tous ses sons"
# (2026-10-18, Sacha : « retirer les commentaires de la copie mise en ligne » + « les outils de test dbg… ») LA COPIE ALLÉGÉE : la copie
# publiée perd ses commentaires (index.html 7,6 → 4,5 Mo, ≈ −1 Mo téléchargé par joueur) et les crochets window.dbgX que rien de publié
# n'appelle ; le SOURCE garde tout. Chaque fichier n'est réécrit que si ses jetons restent identiques (voir outils/publie-allege.cjs) ;
# en cas d'échec, la copie part telle quelle. AVANT l'empreinte : elle couvre donc ce qui est vraiment publié.
node outils/publie-allege.cjs .vercel-static/jouer || echo "⚠ publie-allege : échec, la copie part avec ses commentaires"
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
# (2026-10-14, Sacha : « publie ») LES DEUX PAGES QUE L'APP STORE EXIGE, à la racine du site : /confidentialite.html et /assistance.html
# (dossier pages-app/ ; leur source est app-ios/fiche/ sur la branche ios-capacitor). Rien du jeu n'en dépend.
cp pages-app/confidentialite.html pages-app/assistance.html .vercel-static/
# (2026-10-15 soir, Sacha : « branche les vraies pubs sur le site web avec Google AdSense ») /ads.txt à la RACINE du site, tiré de
# l'identifiant d'éditeur posé UNE fois dans le jeu (var CC_ADSENSE='ca-pub-…' dans le <head> de index.html, « LA RÉGIE ADSENSE »).
# Identifiant vide = pas de régie = pas d'ads.txt. f08c47fec0942fa0 = l'identifiant de Google dans le registre des vendeurs (TAG-ID).
PUBID=$(grep -o "var CC_ADSENSE='ca-pub-[0-9]*'" "VERSION PRINCIPALE/index.html" | head -1 | grep -o "pub-[0-9]*" || true)
if [ -n "$PUBID" ]; then printf 'google.com, %s, DIRECT, f08c47fec0942fa0\n' "$PUBID" > .vercel-static/ads.txt; fi
