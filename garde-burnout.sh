#!/bin/sh
# LA GARDE DU BURN-OUT DE LÉO (2026-10-07, Léo : « quand Sacha fait des trucs qui suppriment mes changements, code un truc qui bloque ;
# remets mon burn-out »). Vérifie que le BURN-OUT du garage est toujours dans le jeu web. Sans lui :
#   · Vercel REFUSE de publier (vercel-build.sh l'appelle en premier) : le site garde la version d'avant, rien n'est perdu ;
#   · sur l'ordi de Léo, le crochet git pre-push refuse de pousser sur main (même liste de repères).
# Usage : sh garde-burnout.sh [fichier]   (par défaut : VERSION PRINCIPALE/index.html)
# Pour publier quand même (on a VRAIMENT décidé de changer le burn-out, avec Léo) : GARDE_BURNOUT=0 dans les variables de Vercel,
# ou mettre la liste ci-dessous à jour dans le même commit.
F="${1:-VERSION PRINCIPALE/index.html}"
[ "${GARDE_BURNOUT:-1}" = "0" ] && { echo "garde du burn-out : désactivée (GARDE_BURNOUT=0)"; exit 0; }
[ -f "$F" ] || { echo "garde du burn-out : $F introuvable"; exit 1; }
MANQUE=""
for M in 'function burnPart(' 'function burnGeste(' 'function burnDyn(' 'function burnCubes(' 'const BURN_TENU=' 'const DON={'; do
  grep -qF "$M" "$F" || MANQUE="$MANQUE
    · $M"
done
if [ -n "$MANQUE" ]; then
  echo "
  ✋ LE BURN-OUT DE LÉO A DISPARU de $F — il manque :$MANQUE
  Ce commit a supprimé ou écrasé le burn-out du garage (doigt tenu 0,8 s sur la caisse, fumée en cubes, donut au doigt).
  Le remettre : git checkout <dernier commit qui l'avait> -- \"VERSION PRINCIPALE/index.html\" (ou refusionner en gardant ce bloc),
  et en parler à Léo avant de le changer. Voir « LE BURN-OUT EST À LÉO » dans CLAUDE.md.
"
  exit 1
fi
echo "garde du burn-out : OK"
