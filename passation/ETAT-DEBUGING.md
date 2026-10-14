# ÉTAT — session DEBUGING (PC de Sacha) — 14/10, 18 h 50

## Rôle
Chasse aux bugs (collisions, pas de temps 30/60/120, machine à états, mort-relance, pause, cycle de vie, rotation JS, portails, sauvegarde,
premier lancement, lecture du tactile, pouvoirs/minuteurs, audio iOS, langues, économie/missions) + GARDE DE MAIN (relire chaque poussée ;
défaut chez une autre session → une ligne à elle + PILOTAGE ; FIGURES/COMBOS → GENERAL). Ordres : PILOTAGE. Poussée au verrou cc-push.lock.

## Poussé sur main aujourd'hui
- v386 : carnets POP remis à zéro une fois · record borné 1e30 · miroir natif lu si la sauvegarde locale est illisible · LA RAIE remboursée
  2,5 M$ + toast (REQUIN/COMÈTE : euros seulement, rien à rendre ; ⚠ qui a ouvert main entre ~14 h et 16 h 50 a perdu LA RAIE sans trace).
- v398 : SECONDE CHANCE — plus de débit si un volet est déjà en route (payé, resté sur l'écran de mort, ligne du Top 10 retirée).
- Preuves node : passation/preuves/preuve-{carnets-pop,raie,miroir-illisible,sauvegarde}.cjs `<corrigé> [ancien]` ; bouchons SANS_CARRIERE et
  CHANCE/chanceBase ajoutés (nouveaux globaux dans la zone `const SAVE={`…`if(BALADE)` que les preuves exécutent).

## Passe mobile (ordre de Sacha) — vérifié au banc tactile, UA iPhone, encoche simulée, 0 erreur JS
Debout 390×844 ET couché 844×390 : accueil → JOUER (2,2-3,1 s) → vol → pose → mort → REJOUER → mort → ⌂ → GARAGE → retour → RÉGLAGES : tout OK.
30 i/s forcés : rotation avant le 1er toucher, mort NITRO tenue (0 PSSHT), portail + mort dans les 2 images → écran de mort : OK.

## Reste, du plus gênant au moins gênant
1. À VÉRIFIER SUR iPHONE (le banc ne sait pas défiler au toucher simulé) : RÉGLAGES debout fait 1 153 px pour 844 → POUCE HAUT, VIBRATIONS,
   ENTRER UN CODE sont sous le bas de l'écran ; la liste défile à la molette et par programme, et le code laisse passer le toucher dans
   #overlay (aucun preventDefault, touch-action auto) — il faut juste confirmer au doigt que la liste défile.
2. ⌂ / REJOUER touchés dans les toutes premières ms de l'écran de mort sont ignorés (garde d'entrée) : un 2e toucher passe. Voulu a priori.
3. Cibles < 44 px au garage : OFFRES ÉPHÉMÈRES (38 debout, 34 couché), onglets INVENTAIRE · MISSIONS · BOUTIQUE couché (40). Zone INTERFACE.
4. FORÊT NOIRE (FORET injoignable, signalé à PILOTAGE) : `foretVide` ne remet pas `FORET.loup.on/roc` → le loup-garou peut réapparaître
   quelques secondes à l'ancienne place au portail suivant. Correctif : `FORET.loup.on=false;FORET.loup.roc=null;` dans foretVide.
5. Saccades / lenteur iPhone : zone OPTIMISATION (relevé ?perf=1 livré).

## Garde de main — relu, RAS sauf ci-dessus
T9 · GRAPHISME (palette) · IDEE (sans carrière / sans facile) · OPTIMISATION vague 1 (worker DOGE, gabarits jade, toBlob, lensTick) ·
SECONDE CHANCE (1 bug, corrigé v398) · FIGURES v2 (1 bug, corrigé par GAMEPLAY fdf37d4) · auto-école v2 · FORÊT NOIRE (1 mineur, point 4).

## Outils
Bancs (scratchpad de la session) : fumee.cjs (CONTROLE=1, RAIE=55), enjeu.cjs (30 i/s), iphone.cjs (parcours tactile), defile.cjs —
tous sur C:/Users/sacha/cc-banc/lib.cjs (file commune, CC_QUI=DEBUGING). ⚠ Worktree CCG-debug-integration : repasser en LF avant commit.

## Suite
Garde de main sur chaque poussée ; ramassage ≥ 1 100 km/h en jeu (node seulement) ; bug son « boutique + nitro » non reproduit (attend Sacha).
