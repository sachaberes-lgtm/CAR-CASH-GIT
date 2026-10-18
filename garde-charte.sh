#!/bin/sh
# LA GARDE DE LA CHARTE (2026-10-14, Sacha, via PILOTAGE : « le logo de l'accueil est intouchable, la police pixel reste, la charte 6 ne
# redevient pas le défaut »). Même esprit que garde-burnout.sh : une version qui casse l'un des trois points n'est PAS publiée.
#   (a) LE LOGO de l'accueil (celui de 92cb2bb) : HTML (`class="lg …"`), CSS (`.lg`, `.lg.gold`, `.lg.grad`, `::before`, `::after`,
#       lgShine, `.mTitle .lg`) — l'EMPREINTE (sha1) de ces lignes est figée ci-dessous ;
#   (b) LA POLICE PIXEL : `--pix:'Press Start 2P'`, son @font-face + le fichier woff2, et au moins SEUIL emplois de var(--pix) ;
#   (c) (retiré le 2026-10-18, allègement : la charte 6 n'existe plus dans le code — plus rien à garder de ce côté) ;
#   (d) UNE SEULE POLICE (2026-10-15, Sacha : « il faut pas que je te le répète ») : le filet CSS `<style id="policeUnique">` (tout élément en
#       var(--pix)!important) et le filet des canvas `UNE_POLICE` (tout ctx.font réécrit en Press Start 2P) doivent rester.
# Usage : sh garde-charte.sh [fichier]            (par défaut : VERSION PRINCIPALE/index.html)
#         sh garde-charte.sh --empreinte [fichier]  (imprime l'empreinte courante du logo et le compte de var(--pix))
# Appelée par vercel-build.sh juste après garde-burnout.sh, et par la procédure de poussée (CLAUDE.md du jeu).
# Pour publier quand même (on a VRAIMENT décidé de changer le logo — avec Sacha) : GARDE_CHARTE=0 dans les variables de Vercel,
# ou mettre EMPREINTE_LOGO / SEUIL_PIX à jour dans le même commit (sh garde-charte.sh --empreinte).
EMPREINTE_LOGO="ae275166afc3d44114a5756a655871e8a321a3dc"
SEUIL_PIX=135
MODE=""
[ "$1" = "--empreinte" ] && { MODE="emp"; shift; }
F="${1:-VERSION PRINCIPALE/index.html}"
[ "$MODE" != "emp" ] && [ "${GARDE_CHARTE:-1}" = "0" ] && { echo "garde de la charte : désactivée (GARDE_CHARTE=0)"; exit 0; }
[ -f "$F" ] || { echo "garde de la charte : $F introuvable"; exit 1; }
# Les lignes du logo : balises HTML, blocs CSS dont le sélecteur COMMENCE par .lg (jusqu'à l'accolade fermante), .mTitle .lg, lgShine.
LOGO=$(tr -d '\r' < "$F" | awk '
  BEGIN{in_b=0}
  { l=$0
    if(in_b){ print l; o=gsub(/\{/,"{",l); c=gsub(/\}/,"}",l); d+=o-c; if(d<=0)in_b=0; next }
    if(l ~ /class="lg (gold|grad)" data-t="(CASH|CAR)"/ || l ~ /\.mTitle \.lg/){ print l; next }
    if(l ~ /^[ \t]*(\.lg[.:, {]|@keyframes lgShine)/){ print l; t=l; o=gsub(/\{/,"{",t); c=gsub(/\}/,"}",t); d=o-c; if(d>0)in_b=1; next }
  }')
EMP=$(printf '%s\n' "$LOGO" | sha1sum | cut -c1-40)
NB=$(printf '%s\n' "$LOGO" | wc -l | tr -d ' ')
PIX=$(grep -o 'var(--pix)' "$F" | wc -l | tr -d ' ')
if [ "$MODE" = "emp" ]; then echo "EMPREINTE_LOGO=\"$EMP\"  ($NB lignes)"; echo "var(--pix) : $PIX emplois (seuil = $((PIX*9/10)))"; exit 0; fi
PROBLEMES=""
if [ "$EMP" != "$EMPREINTE_LOGO" ]; then
  PROBLEMES="$PROBLEMES
    · LE LOGO a changé (empreinte $EMP, attendue $EMPREINTE_LOGO, $NB lignes extraites)"
fi
grep -qF -e "--pix:'Press Start 2P'" "$F" || PROBLEMES="$PROBLEMES
    · --pix:'Press Start 2P' a disparu du :root"
grep -qF "font-family:'Press Start 2P'" "$F" && grep -qF "pressstart2p.woff2" "$F" || PROBLEMES="$PROBLEMES
    · le @font-face de Press Start 2P (pressstart2p.woff2) a disparu"
[ -f "$(dirname "$F")/assets/fonts/pressstart2p.woff2" ] || PROBLEMES="$PROBLEMES
    · le fichier assets/fonts/pressstart2p.woff2 est introuvable"
[ "$PIX" -ge "$SEUIL_PIX" ] || PROBLEMES="$PROBLEMES
    · trop peu d'emplois de var(--pix) : $PIX (seuil $SEUIL_PIX)"
grep -qF '<style id="policeUnique">' "$F" && grep -qF '*,*::before,*::after{font-family:var(--pix)!important}' "$F" || PROBLEMES="$PROBLEMES
    · le filet CSS d'UNE SEULE POLICE (<style id=\"policeUnique\">, *{font-family:var(--pix)!important}) a disparu"
grep -qF 'function UNE_POLICE(' "$F" && grep -qF 'function apresPolice(' "$F" || PROBLEMES="$PROBLEMES
    · le filet des canvas d'UNE SEULE POLICE (UNE_POLICE, apresPolice) a disparu"
if [ -n "$PROBLEMES" ]; then
  echo "
  ✋ LA CHARTE EST CASSÉE dans $F :$PROBLEMES
  Le logo de l'accueil est INTOUCHABLE (92cb2bb), la police pixel reste — et c'est la SEULE police du jeu.
  Remettre : git checkout <dernier bon commit> -- \"VERSION PRINCIPALE/index.html\" (ou refusionner en gardant ces blocs).
  Si le changement est VOULU (décidé avec Sacha) : sh garde-charte.sh --empreinte, puis mettre à jour EMPREINTE_LOGO / SEUIL_PIX ici.
"
  exit 1
fi
echo "garde de la charte : OK"
