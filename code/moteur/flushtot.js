/* ===== L'IMAGE ENVOYÉE TÔT À LA PUCE (2026-11-18, lot flushtot — Sacha, build 121 branché + économie + chaud : « injouable, beaucoup de freeze ») =====
   Mesuré cette nuit (boîte de vol vol-1118-0416) : le vrai coût d'une image (du début de loop au moment où la puce a fini) vaut 23 ms en médiane, 36 au p90, contre un top
   d'écran toutes les 33 ms. Il ENCHAÎNE ~11 ms de JS et ~12 ms de puce. Or, après le rendu (composer.render), la boucle fait encore 1 à 2 ms de travail qui ne touche pas
   l'image de cette passe : copies, pré-bâti (prebTick 0,4-1,5 ms), boîte de vol, HUD calme, cadFin. Tant que ce travail tourne, les commandes de l'image peuvent attendre
   dans le tampon de WebGL : WebKit ne les remet à la puce qu'à la fin du rappel. Ici, un `gl.flush()` juste après le rendu : la puce commence 1 à 2 ms plus tôt.
   RIEN NE BOUGE dans l'ordre de la boucle : tout ce qui suit le rendu y était déjà (la fiche demandait de l'y ranger, c'était fait). Un flush ne change aucun pixel
   (il ne fait qu'envoyer ; la toile n'est présentée qu'à la fin du rappel, les copies d'après le rendu lisent le même tampon). Aucun appel de dessin en plus.
   Seulement sous ALLEGE (vrai téléphone, ou ?tel=1) : l'ordinateur reste exactement comme avant.
   `?sans=flushtot` = comme avant (aucun flush, rien de noté) ; hors ALLEGE, pareil. `?flushtot=ab` : une course sur deux avec, une sans (boîte de vol : champ `flt` de chaque course, 1 = avec).
   Chaque course de la boîte de vol porte `flt` (0 ou 1) : outils/banc-flushtot/lire-ab.py compare les deux. `dbgFlushtot()` : l'état ; dbgFlushtot({on:0|1}) bascule,
   dbgFlushtot({fige:1}) fige la simulation (le banc photo : la boucle continue de dessiner la même image). */
const FLUSHT={on:false,ab:false,n:0,c:null,coupe:false};
try{FLUSHT.coupe=/[?&]sans=[^&]*flushtot/.test(location.search)||!ALLEGE;FLUSHT.on=!FLUSHT.coupe;FLUSHT.ab=FLUSHT.on&&/[?&]flushtot=ab\b/.test(location.search);}catch(e){FLUSHT.on=false;}
function flushTot(){ /* juste après le rendu de l'image (boucle-6-hud.js) */
  if(FLUSHT.coupe)return;
  if(BV.on&&BV.c!==FLUSHT.c){FLUSHT.c=BV.c;if(BV.c){if(FLUSHT.ab&&BV.c.flt===undefined)FLUSHT.on=!FLUSHT.on;BV.c.flt=FLUSHT.on?1:0;}} /* une course neuve de la boîte de vol : en A/B, on alterne ; on note l'état */
  if(!FLUSHT.on)return;
  try{renderer.getContext().flush();FLUSHT.n++;}catch(e){FLUSHT.on=false;}}
window.dbgFlushtot=function(o){o=o||{};if(o.on!=null&&!FLUSHT.coupe)FLUSHT.on=!!o.on;if(o.fige!=null)BANC_FIGE=!!o.fige;
  return {on:FLUSHT.on,ab:FLUSHT.ab,coupe:FLUSHT.coupe,allege:ALLEGE,n:FLUSHT.n,fige:BANC_FIGE};};
