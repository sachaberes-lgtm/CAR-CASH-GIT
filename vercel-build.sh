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
# (2026-10-25, Sacha : « sur PC la version maximum, sur téléphone l'optimisée — que j'aie pas à te le redire ») LA GARDE DE L'ALLÈGEMENT : un allègement du rendu gardé par
# IS_MOBILE (vrai aussi sur PC) n'est PAS publié (garde-allege.sh ; GARDE_ALLEGE=0 la coupe).
sh garde-allege.sh
rm -rf .vercel-static
mkdir -p .vercel-static
cp -R demo/cash-car-demo .vercel-static/demo
cp demo/cash-car-demo/og.jpg .vercel-static/og.jpg
cp -R "VERSION PRINCIPALE" .vercel-static/jouer
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
# (2026-10-16, Léo) LES VOITURES DU JEU (repertoire-voitures/ : la liste, la vue dans le jeu, son serveur) : outil LOCAL, même raison
rm -rf .vercel-static/jouer/repertoire-voitures
find .vercel-static/jouer -name '*.py' -delete
# (2026-10-14, pôle SON) L'ATELIER DE LA MUSIQUE reste un outil LOCAL (Léo : « pour toi ») : la page musique-moteur.html (elle fige les
# morceaux par le serveur de la page) et les sources des morceaux à paliers (paliers/*.html).
rm -f .vercel-static/jouer/musique-moteur.html .vercel-static/jouer/assets/audio/music/paliers/*.html
# (2026-10-18, Sacha : « ne plus publier la bibliothèque des sons ») LA BIBLIOTHÈQUE (bibliotheque.html) reste un outil LOCAL — et avec elle tout
# ce que SEULE elle lit : ses catalogues de boucles (boucles/, depart/, petites-musiques/, les *-donnees.js), le lobby du garage que le jeu ne joue
# plus (lobby/garage-*), GLISSE, le moteur French Touch et les mesures de goûts. Les fichiers restent dans le dépôt. Rien de ce que le jeu peut
# demander n'est touché : MENU_MUS (lobby/ciel-*), l'auto-école (lobby/chris-matin), les morts et l'argent (death/, fx/), Pouce bleu (le reste de direct/,
# musique-moteur.json, musique-paliers.js, rendus/). boucles/dark-triad.m4a RESTE : c'est le morceau de la frénésie (MUSIC_FREN.f, depuis le 24/10 — avant, le jeu le cherchait en .mp3 ailleurs).
rm -f .vercel-static/jouer/bibliotheque.html
rm -rf .vercel-static/jouer/assets/audio/music/depart .vercel-static/jouer/assets/audio/music/petites-musiques
find .vercel-static/jouer/assets/audio/music/boucles -type f ! -name dark-triad.m4a -delete 2>/dev/null || true
rm -f .vercel-static/jouer/assets/audio/music/lobby/menu-donnees.js .vercel-static/jouer/assets/audio/music/lobby/chris-donnees.js .vercel-static/jouer/assets/audio/music/lobby/garage-*.m4a
rm -f .vercel-static/jouer/assets/audio/music/direct/french-touch.html .vercel-static/jouer/assets/audio/music/direct/gouts-mesures.json .vercel-static/jouer/assets/audio/music/direct/musique-glisse.js
# …et ce qui dépend des musiques de POUCE BLEU (musique-moteur.json) est calculé à chaque build, avec la règle du jeu : les dossiers de paliers
# des morceaux rangés « bleu », les générateurs que les 👍 rejouent, les échantillons vrais/ du rejeu (outils/vrais-jeu.json, tant que sa preuve
# colle). AVANT publie-allege (l'empreinte de la preuve lit les fichiers tels que le dépôt les a).
# (2026-10-24, passe perf) LA BANQUE DE SONS EN DEUX MOITIÉS : le 1er lancement ne télécharge d'abord que les sons du début (0,8 Mo sur 7,7) ; le reste arrive
# après load (sfx.js, CCSON.ajoute). La copie publiée seulement ; en cas d'échec la banque reste entière (outils/scinde-banque.cjs, preuve octet pour octet).
node outils/scinde-banque.cjs .vercel-static/jouer || echo "⚠ scinde-banque : échec, la banque part entière"
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
# (2026-10-22, piste « démarrage ») L'EMPREINTE DES PHOTOS : les photos de caisses gardées par le navigateur (IndexedDB) étaient jetées à CHAQUE
# publication (leur signature portait l'empreinte du jeu entier) et refaites au garage : 3 à 4 s de fil principal à CPU ×4. On grave à part
# l'empreinte des SEULS fichiers qui changent l'image d'une photo : les caisses (voitures/), le rendu (rendu/), le studio et ses constantes
# de cadrage (photos-films.js, frole-contrats.js), la boucle des photos (atelier-ferme.js). ⚠ Un nouveau fichier qui change l'image d'une
# photo doit entrer dans cette liste, sinon ses photos restent périmées jusqu'à la prochaine publication qui touche un fichier listé.
PHOTOS=$(find code/voitures code/rendu code/interface/photos-films.js code/gameplay/frole-contrats.js code/interface/atelier-ferme.js -type f -print0 2>/dev/null | LC_ALL=C sort -z | xargs -0 sha1sum | sha1sum | cut -c1-40)
[ -n "$PHOTOS" ] || PHOTOS="$JEU"
sed "s/__CC_BUILD__/$JEU/;s/__CC_PHOTOS__/$PHOTOS/" .vercel-static/jouer/index.html > .vercel-static/jouer/index.tmp && mv .vercel-static/jouer/index.tmp .vercel-static/jouer/index.html
printf '{"v":"%s","commit":"%s"}\n' "$JEU" "$SHA" > .vercel-static/jouer/version.json
# (2026-10-14, Sacha : « publie ») LES DEUX PAGES QUE L'APP STORE EXIGE, à la racine du site : /confidentialite.html et /assistance.html
# (dossier pages-app/ ; leur source est app-ios/fiche/ sur la branche ios-capacitor). Rien du jeu n'en dépend.
cp pages-app/confidentialite.html pages-app/assistance.html .vercel-static/
# (2026-10-15 soir, Sacha : « branche les vraies pubs sur le site web avec Google AdSense ») /ads.txt à la RACINE du site, tiré de
# l'identifiant d'éditeur posé UNE fois dans le jeu (var CC_ADSENSE='ca-pub-…' dans le <head> de index.html, « LA RÉGIE ADSENSE »).
# Identifiant vide = pas de régie = pas d'ads.txt. f08c47fec0942fa0 = l'identifiant de Google dans le registre des vendeurs (TAG-ID).
PUBID=$(grep -o "var CC_ADSENSE='ca-pub-[0-9]*'" "VERSION PRINCIPALE/index.html" | head -1 | grep -o "pub-[0-9]*" || true)
if [ -n "$PUBID" ]; then printf 'google.com, %s, DIRECT, f08c47fec0942fa0\n' "$PUBID" > .vercel-static/ads.txt; fi
