# ALLÈGEMENT — LOT C (interface), 18/10/2026

Branche `al-interface` (base 024675ba). `index.html` : 7 660 148 → 7 227 247 octets (**−432 901**, −5,7 %) ; fumée OK (couché + debout, 0 erreur JS). Le jeu par défaut ne
change pas — banc AVANT/APRÈS (couché + debout ; accueil, bienvenue, garage, boutique, un rayon, réglages, pause, fin) :
logo 0 pixel de différence ; DOM figé 0 pixel sauf ce qui bouge tout seul (nom projeté sur la caisse, photos des ailes animées,
map tirée au hasard de la fin) ; styles calculés identiques élément par élément (mêmes exceptions). L'écran MISSIONS n'a pas été
atteint par le banc (le toucher n'a pas trouvé la porte).

## Ce qui est parti (octets d'index.html)
- **19 · la charte 6** noir et blanc (−184 k) : ses neuf feuilles (`charte6`, `c6-accueil` … `c6-transitions`), `?ui=6`, `accC6`, la
  boutique `bqC6` (`bqEtatC6` → `bqManque`, `bqRetourC6`, `bqVaOffres`, `bqOffreAuto`), l'en-tête du hub `#gC6Tete`, `#gC6Vide`,
  `#spInvite`, la fenêtre en cartes de CHOISIS TON MODE, les libellés courts. Les règles VIVANTES qui logeaient dans ses feuilles
  (question de bienvenue, page RÉGLAGES, ◀ des missions, `.hNxC6`, TOUS LES RÉGLAGES) sont dans `<style id="pagesPixel">`, à la même
  place, sans le `html:not(.c6)` de tête. `garde-charte.sh` : contrôle (c) retiré, nouvelle empreinte du logo (seule la ligne
  `html.c6 :is(#spTitle,…) .lg.grad` en sort ; logo identique au pixel, prouvé au banc).
- **26 · le cadre UX 8 du garage** `?ux8g=1` (−30 k) : la feuille `ux8-garage`, ses missions, `ux8Bati`/`ux8Tick` et son minuteur 120 ms.
- **24 · le menu de Léo** `?menu=leo` (−89 k) : la vitrine (`garVitrine`, jauges `gvJauges`/`gve*`, vignettes `gvVignette`, tiroir
  `gvNivs`), le boulon 3D, `#gMenu` (`garMenuMaj`/`garMenuSuit`), sa constellation des missions (corps de `gmRender`/`gmSuit`).
  `HUB` vaut `true` (la carrière le lit encore). Gardés : `ATELIER_V0`, `garAtelierLibre`/`garVueLeo`, `bankMaxMaj`.
- **25 · les missions v1** `?missions=v1` (−62 k) : `CARNETS`, la file, les pastilles, `#mMis`/`misRender`, `objRender` (→ `objRenderV2`),
  `misFin`, `MIS0`, `gmRenderS`, `misFocusMaj`, `dbgMissionsV1`, `MISSIONS_V2` et ses ~35 tests. Gardés : `SAVE.d.mis` (lu par
  `carStat('carnet')` et `m2MigreV2`), le cadeau des carnets POP (`CARNETS_POP` + `popCarnets` + `misPop`, appelé UNE fois par `m2Etat`
  avant la migration — `passation/preuves/preuve-carnets-pop.cjs` adaptée : PREUVE OK), `ecoRond` (le cadeau CADO), `misTick` réduit
  au temps et à la nitro de la partie.
- **35 · la jauge d'aura** `?jauge=1` (−13 k) : `#ajCourse`, `ajGain`/`ajLance`/`ajSerre`, la boucle des cellules, `dbgJaugeAura`.
  Reste `#ajVols` (les éclairs de NITRO) ; `volg*`/`nbPrend` intouchés. Les positions FLOW/AURA du HUD allégé ne passent plus par
  `html.sansJauge` (même cascade, vérifiée règle à règle).
- **40 + 43 · la prairie** `?bq=herbe` et **la salle blanche** sans marches ni rotonde (`SANS_MARCHES`, `SANS_PILIERS`) (−10 k).
- **51 · l'ancienne boutique** (−6 k) : `gMystere`, `bqEphemeres`, `bqSemaine`, `garGlitch`, `cosmVu`. Gardés : `palDonne`/`palPossede`.
- **54 · les styles orphelins** (−25 k) : 66 noms qu'aucun HTML ni aucune CHAÎNE du code ne pose + 16 `@keyframes` sans appel
  (outil : un nom est vivant s'il est posé par le HTML ou écrit nu dans une chaîne ; fabriqué = une chaîne concaténée en donne le début
  et le reste est un mot du code). Gardés car fabriqués : `f-*`, `r-legendaire`/`r-infini`, `m2F-*`, `c-trainee`. `.carrAct` laissé
  au lot carrière. `.ivT u .ivNum` est parti : aucun code ne pose `ivNum`.
- **55 · les styles écrasés** (−14 k) : 396 déclarations prouvées mortes (même propriété plus loin, sélecteur identique, même @media,
  même importance). Écartés par prudence (~3 k) : replis dans une même règle, préfixes, valeurs récentes, `!important` d'un seul côté.

## Ce qui reste, et pourquoi
- `html:not(.c6)` ×210, `:not(.ux8g)` ×37, `:not(.vitrine)` ×257 dans les feuilles vivantes (~6 Ko) : les ôter BAISSE la spécificité
  (risque de cascade) — à faire règle par règle avec un banc des styles calculés.
- `carrVueC6` et les `HUB` de la carrière (lot carrière) ; `fxArgent` (devenu mort : seul l'ancien `misTick` l'appelait — zone du son).
- Les éléments cachés des pastilles v1 (`.mMisPips`, `.ghPips`, `.gvPips`, masqués par `html.misV2`) ; le socle 3D des missions de Léo
  (caché) ; `#gVig` (opacité 0 sans la vitrine).
- I18N : les mots de la vitrine (`NIVEAUX ACCOMPLIS`…), `CHOISIS UNE OFFRE`, `TOUCHE POUR JOUER`, `Tes caisses apparaîtront ici` sont
  encore dans les tables (zone commune).

## Outils retouchés
`outils/eco-debut-modele.cjs`, `outils/jour-modele.cjs` (sans carnets : plus de primes de carnet dans le modèle) ;
`passation/preuves/preuve-carnets-pop.cjs` (lit `CARNETS_POP`/`misPop`, bouchon `m2Vierge`) ; hors dépôt : `cc-banc/film.cjs`,
`cc-banc/chance.cjs` (le garage par défaut au lieu de `#ux8…`).
