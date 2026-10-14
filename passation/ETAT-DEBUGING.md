# ÉTAT — session DEBUGING (PC de Sacha) — 14/10, 16 h 50

## Rôle
Chasse aux bugs (zone : collisions, pas de temps 30/60/120, machine à états, mort-relance, pause, cycle de vie, rotation JS, portails,
sauvegarde, génération de piste, premier lancement, lecture du tactile, pouvoirs/minuteurs, audio iOS, langues, économie/missions)
+ GARDE DE MAIN (relire chaque poussée sur origin/main, Léo en priorité ; défaut chez une autre session → une ligne à elle + PILOTAGE).
Ordres : PILOTAGE. Règles : passation/DEBUGGING.md (Mac) toujours valables, sauf « jamais main » → poussée au verrou cc-push.lock.

## Poussé sur main (v386)
- Carnets POP : un joueur au carnet 10-12 à la mise à jour ne garde plus les coches de l'ancien carnet (remise à zéro unique, `mis.pop`).
- Record d'une partie borné à 1e30 dans san (code importé « 1e999 »).
- iPhone : sauvegarde locale ILLISIBLE → le miroir natif est lu et restauré (avant : écrasé par une sauvegarde vierge = perte totale).
- LA RAIE retirée : 2,5 M$ rendus une fois + toast « LA RAIE EST PARTIE : … REMBOURSÉS » (`SAVE.remb`). REQUIN/COMÈTE : vendues
  en euros seulement (StoreKit jamais actif) → rien à rendre. ⚠ Qui a ouvert main entre ~14 h et cette poussée a déjà perdu LA RAIE
  sans trace (sortie de `owned` à 0 $) : irrécupérable automatiquement.
Preuves node : passation/preuves/preuve-{carnets-pop,raie,miroir-illisible}.cjs `<corrigé> [ancien]` (ancien KO, corrigé OK).
Bouchon `SANS_CARRIERE:false` ajouté aux 4 preuves de sauvegarde (le bloc SANS_CARRIERE d'IDEE vit dans la zone qu'elles exécutent).

## Vérifié en jeu (banc, Chrome muet, 30 i/s forcés, au doigt) — tout OK, 0 erreur JS
Fumée couché + debout ; rotation avant le 1er toucher ; mort NITRO tenue → 0 PSSHT pendant l'explosion et au REJOUER (témoin 1 PSSHT) ;
portail + mort dans les 2 images d'attente → écran de mort ; message LA RAIE à l'écran.
Établis en lecture : qNetDefaut, chauffeDivers sous try, clés FR/EN, __offGar, touchcancel/blur (pas de doigt fantôme), minuteurs
de pouvoirs remis à zéro. Balayage des 11 221 commentaires // : seul code avalé = FLOW.poseA (corrigé dans boutique-pop, à venir).

## Garde de main — relu
T9 (8c01287) · GRAPHISME 18d585e (palette : pack seulement via shopPaye, secrètes gardées contre le doublon) · IDEE a34aa1d
(SANS_CARRIERE / SANS_FACILE : coupé pas arraché, trophées gagnés rendus APRÈS SAVE.load). Rien à signaler.
Pré-relu, pas encore poussé : figures3 (GAMEPLAY), boutique-pop, optimisation, foret, canyon.

## Outils
Bancs : scratchpad de la session (fumee.cjs, enjeu.cjs) sur C:\Users\sacha\cc-banc\lib.cjs (file commune, CC_QUI=DEBUGING).
⚠ Worktree CCG-debug-integration : .git/config dit autocrlf=false mais les worktrees anciens sont en CRLF → repasser en LF avant commit.

## Suite
1. Garde de main sur chaque poussée (figures v2, auto-école v2, forêt, canyon : les plus risquées).
2. Ramassage ≥ 1 100 km/h EN JEU (poser des pièces à la main) — prouvé en node seulement.
3. Premier lancement d'un joueur NEUF sans FACILE (nouveau parcours JOUER → auto-école v2) une fois boutique-pop poussée.
4. Bug son « boutique + nitro » : non reproduit, attend les réponses de Sacha (quel son, quand, quel appareil).
