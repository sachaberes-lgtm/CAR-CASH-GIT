#!/bin/sh
# LE BANC DE LA CAISSE — LES TRAÎNÉES ACHETÉES PLUS NETTES, sur la MÊME image : boucle figée, horloge et hasard figés pendant le rendu, toile relue après
# quatre rendus (rendu.js). Le biais est un UNIFORME et l'anisotropie un réglage de la planche : on les règle à chaud, sans recompiler (une matière
# recompilée en pause ne dessine plus la traînée au banc). AVANT = {biais:0, aniso:1} (la lecture de TRX_FS) · APRÈS = {biais:-0.6, aniso:4} ·
# VÉRITÉ = avant, sans la loupe, à DPR 3 (un écran plein : ce que l'ordinateur montre).
#   sh outils/banc-caisse/trx.sh <dossier> "<traînées>" "<km/h visés>"   (un palier moteur de plus toutes les 120 images tant que la vitesse n'y est pas : dbgMoteur)
D=$(cd "$(dirname "$0")" && pwd); OUT=$1; mkdir -p "$OUT"
ev() { node "$D/ev.cjs" "$@"; }
for T in $2; do
  sh "$D/course.sh" >/dev/null
  ev "dbgTrx('$T');1" >/dev/null
  for V in $3; do
    K=$(ev "(async function(){var n=0;while(dbgState().vH<$V&&n<6000){if(n%120===0){try{dbgMoteur()}catch(e){}}for(var i=0;i<6;i++){try{dbgNitro(9,0)}catch(e){};dbgStep(1,33);}n+=6;await new Promise(function(r){setTimeout(r,20)});}for(var i=0;i<24;i++){try{dbgNitro(9,0)}catch(e){};dbgStep(1,33);}return Math.round(dbgState().vH)+' km/h, '+n+' pas, quads '+JSON.stringify(dbgTrx().quads)+', net '+JSON.stringify(dbgTrxNet())})()")
    echo "$T $V : $K"
    node "$D/pose.cjs" "$OUT/trx-$T-$V-avant.png" "dbgTrxNet({biais:0,aniso:1})" >/dev/null
    node "$D/pose.cjs" "$OUT/trx-$T-$V-apres.png" "dbgTrxNet({biais:-0.6,aniso:4})" >/dev/null
    node "$D/pose.cjs" "$OUT/trx-$T-$V-verite.png" "dbgTrxNet({biais:0,aniso:1});dbgLoupe({on:0});dbgDPR(3)" >/dev/null
    ev "dbgDPR(1.25);dbgLoupe({on:null});dbgTrxNet({biais:-0.6,aniso:4});1" >/dev/null
  done
done
