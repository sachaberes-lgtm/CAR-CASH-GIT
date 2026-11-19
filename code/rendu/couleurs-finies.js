/* ===== LES COULEURS FINIES (2026-11-19, finition des maps : « des maps un peu ternes la nuit ou quand il pleut… des fois c'est trop rouge, des fois trop
   éblouissant, les lumières ; objectif Apple Store : les couleurs vraiment belles, bien équilibrées, pas d'éblouissement ») =====
   LA MER DE NUAGES et LA VILLE (CRYPTO CITY de nuit), les deux maps au tirage du téléphone hors des lots grotte, espace, Jade et canyon — les deux étalons de Sacha :
   main légère, seulement ce que la MESURE montre fautif (outils/banc-finition-couleurs/mesure.py : luminance, chroma, % brûlé, % rouge-orange vif, par tiers).
   Posé APRÈS la chute (chute-menu.js réécrit `sat`/`con`/`fog` des nuages au chargement) : des retouches eqApplique (equilibre-maps.js) sur les ambiances de
   COURSE, ambiance par ambiance — que des NOMBRES, zéro programme, zéro texture. La ville en hérite dans ses trois teintes (vtBio copie l'ambiance finie).
   `?sans=couleursfinies` = l'image d'avant au bit près. */
const COULEURS_FINIES=!/[?&]sans=([^&]*,)?couleursfinies(,|&|$)/.test(location.search);
/* MESURÉ AVANT (banc du lot, ?tel=1, 844×390, graines 3 et 11, au pas 120 ; L/C 0-255 ; « bas » = le tiers bas de l'image : la route) — rien de brûlé nulle part
   (0 % > 245), pas de rouge-orange vif hors de la caisse : les défauts sont des TERNES. */
const CF_RETOUCHES={
  nuagesMatinCC:{sat:1.05,chr:.15},                       /* C 29,7 : le plus gris du jeu avec le midi — un souffle de couleur, l'air reste clair */
  nuagesMidiCC:{sat:1.05,chr:.15},                        /* C 34-36 */
  nuagesNuit:{expo:1.08,lum:1.06,rtK:1.35,lev:[.002,.002,.010],sat:1.06}, /* la route NOIRE : 29-49 % de pixels noirs dans le tiers bas (L 29-35) — la route
                                                             s'éclaire (rtK 0,45 → 0,61), un plancher indigo dans les ombres, le ciel violet garde sa nuit */
  nuagesPluie:{sat:1.12,chr:.28},                         /* C 35,5, route C 27 (grise) : l'averse reprend ses couleurs — ciel rose, nuages bleutés */
  tempete:{sat:1.04,chr:.12}};                            /* l'orage des nuages (C 53-56) : un cran seulement */
/* LA TEINTE JAUNE DE LA VILLE (VTEINTES.jaune, ville-nuit.js) : un air brun de sodium — C 38-45 contre 71-78 pour la teinte verte, haut de l'image L 32 / C 34,
   8 % de noirs. Son ambiance d'orage est créée ICI, au chargement (vtBio la crée à son premier emploi, d'après l'ambiance finie : aucune passe ne la touche plus
   après ce morceau), puis retouchée : l'or plutôt que le brun. La violette (rose, « intouchable ») et la verte ne bougent pas. */
const CF_TEINTES={jaune:{villeOrage:{sat:1.06,chr:.15,expo:1.05}}};
if(COULEURS_FINIES){
  for(const k in CF_RETOUCHES)if(BIOMES[k])eqApplique(BIOMES[k],CF_RETOUCHES[k]);
  for(const te in CF_TEINTES)for(const n in CF_TEINTES[te]){const k=vtBio(n,te);if(k!==n&&BIOMES[k])eqApplique(BIOMES[k],CF_TEINTES[te][n]);}}
