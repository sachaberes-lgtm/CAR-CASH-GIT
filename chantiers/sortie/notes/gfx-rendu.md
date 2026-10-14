# gfx-rendu — la TECHNIQUE de l'image au cran FULL (passe de sortie, 2026-10-13)

Agent : gfx-rendu · branche `sortie2/gfx-rendu` · copie `$R/wt/gfx-rendu` · captures `$R/shots/gfx-rendu/` · bancs `$R/banc/gfx-rendu/`.

## Zone
Le COMMENT ça rend (post-traitement ACES/bloom/FXAA/tramage, matières des caisses, bitume, brume, liseré, ombres de contact),
au cran FULL (QL.k = 0) seulement. Pas les couleurs d'ambiance (da-couleur), pas les particules (particules), pas le coût du cran bas (perf-iphone7).

## Règle que je m'impose
Tout ajout = un uniforme à 0 hors du cran FULL (QL.k > 0, LOW, REDUCED_MOTION) → au cran bas l'image et le coût sont ceux d'avant.
Aucune passe plein écran nouvelle. Zéro programme compilé en course. A/B à chaud par `dbgGfx({...})` sur la MÊME image figée.

## Journal
- (en cours) inventaire + captures AVANT.

## POUR LES AUTRES
- (rien encore)
