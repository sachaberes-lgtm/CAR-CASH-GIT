#!/bin/sh
# LA GARDE DE L'ALLÈGEMENT (2026-10-25, Sacha : « sur Vercel/PC la version MAXIMUM, sur téléphone la version optimisée — que j'aie pas à te le redire »).
# `IS_MOBILE` est vrai AUSSI sur l'ordinateur (il joue l'édition 'mobile' dans son cadre de téléphone : FORCE_TEL). Un allègement de rendu ou de contenu gardé par
# `IS_MOBILE` dégrade donc le PC — c'est arrivé le 24/10 (forêt, dunes, Crypto City, Jade, satellites). Tout ce qui retire de l'image se garde sur `ALLEGE` (vrai
# téléphone ou `?tel=1`, défini dans rendu/soleil-planete.js) ou sur `TEL_NATIF`. `IS_MOBILE` reste réservé à l'INTERFACE (tactile, disposition, cadre).
# Cette garde REFUSE la publication si `IS_MOBILE` apparaît hors des fichiers d'interface ci-dessous (ou plus de fois que prévu dans les deux fichiers de définition).
#   sh garde-allege.sh            contrôle code/   ·   GARDE_ALLEGE=0 la coupe (on a VRAIMENT décidé d'alléger le PC — avec Sacha)
# Appelée par vercel-build.sh après garde-charte.sh.
[ "${GARDE_ALLEGE:-1}" = "0" ] && { echo "garde de l'allègement : désactivée (GARDE_ALLEGE=0)"; exit 0; }
[ -d code ] || { echo "garde de l'allègement : dossier code/ introuvable"; exit 1; }
# fichiers d'INTERFACE : IS_MOBILE y est légitime (tactile, boutons, disposition)
LIBRES="code/moteur/mobile-tactile.js code/moteur/desktop-banc.js code/moteur/init.js code/moteur/intro-161.js code/gameplay/boost-depart.js code/interface/habillages-accueil.js"
# fichiers de DÉFINITION / de palier : un nombre MAXIMUM d'occurrences (la définition, son explication, le palier de l'ordi)
MAX_soleil_planete=5
MAX_palier_appareil=4
BAD=0
for f in $(grep -rlE 'IS_MOBILE' code); do
  case " $LIBRES " in *" $f "*) continue;; esac
  n=$(grep -o 'IS_MOBILE' "$f" | wc -l | tr -d ' ')
  case "$f" in
    code/rendu/soleil-planete.js) max=$MAX_soleil_planete;;
    code/rendu/palier-appareil.js) max=$MAX_palier_appareil;;
    *) max=0;;
  esac
  if [ "$n" -gt "$max" ]; then
    echo "✘ garde de l'allègement : $f utilise IS_MOBILE ($n fois, $max permises) — c'est vrai aussi sur PC. Un allègement du rendu se garde sur ALLEGE (ou TEL_NATIF)."
    grep -nE 'IS_MOBILE' "$f" | cut -c1-160 | head -5
    BAD=1
  fi
done
[ "$BAD" = "1" ] && exit 1
echo "garde de l'allègement : ✔ aucun allègement du rendu ne tient à IS_MOBILE (le PC garde le maximum)"
exit 0
