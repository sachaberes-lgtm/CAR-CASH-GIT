# LE FLOU DE VITESSE : passation (lot « flouvitesse », 19-20/11)

Branche `qa/flouvitesse` (partie de `origin/qualite-appareil` 684569a6c), worktree `~/cash-car/lots-nuit/flouvitesse`. Interrupteur : `?sans=flouvitesse` = l'avant (tout le lot).
Demande de Sacha (18/11) : « sur les côtés, quand on va vite, il y a un effet de flou, notamment avec le nitro […] Si ça marche pour l'optimisation, on peut faire un flou un peu plus stylé. Là, il est un peu moche. […] Si c'est un bug, corrige-le. »

## 1. C'était AUSSI un bug (corrigé)
Le commit « Voiles au tiers » (3df790c92) a changé la ligne `uniform float uSafe,uRn;` du shader final en `uSafe,uRn,uSfx;`. Deux retouches cherchaient l'ancienne ligne et se sont
éteintes sans bruit (leur règle : « une ligne retouchée ailleurs : on ne touche à rien ») :
- `FLOU_R` (le flou V2 du 10/11) : le jeu rendait le flou V1 du 30/09. En croisière rapide (uSpeed 0,2) tout le tour de l'image filait fort (nuages baveux : planche « vitesse haute »),
  tunnel plus fort, et entre uSpeed 0,004 et ~0,05 le shader floutait alors que `flouMips` (seuil de la courbe V2) ne fabriquait pas les mips ;
- `NET_NITRO2` (le cœur des rubans net au nitro, 14/11) : éteint aussi.
Correction : la ligne est coupée en deux (`uniform float uSfx;uniform float uSafe,uRn;`), même déclaration ; les deux retouches la retrouvent. `code/rendu/triptyque-bloom.js`.
Pas d'autre bug vu au banc : la série en course (6 s croisière, 3 s nitro, 3 s après) monte et redescend sans palier ni reste collé (uSpeed 0 → 0,2 en ~3 s ; nitro 0,37 → 1 ; après : 0,98 → 0,2 en 3 s) ;
la caisse ne prend pas de flou (zoom caisse : écart moyen après/avant ≤ 0,04/255).

## 2. Le flou en stries (même fichier, section « LE FLOU DE VITESSE EN STRIES »)
- STRIES : la longueur du filé varie avec l'angle autour de la caisse (deux ondes, 640 et 1035 par tour, pseudo-angle sans atan) : les bords se rayent dans le sens de la fuite au lieu d'un voile ;
  rien ne change le long d'un rayon, l'image ne grésille pas. Calculé seulement là où le flou joue (amt > 0).
- PRISES PONDÉRÉES : la plus proche pèse ~1,4, la plus lointaine ~0,6 (moyenne gardée).
- Téléphone (FLOU_MIPS) : pré-flou des mips d'un demi-niveau plus fin, et UNE PRISE DE MOINS (5 lectures au lieu de 6, `FLOU_PRISES`, `?prises9=6` = six).
- Rien ne bouge pour le disque net de la caisse, le rayon de départ ni la courbe de vitesse : montée douce, nitro bien plus marqué que la croisière.
- Réglages : uniforme `uFz` = (force 0,9, stries 640, pente des poids 0,5, biais de mip −0,5). Banc : `dbgFlouStyle({on:0|1, z:[…]})`.
- Ordinateur : stries et poids aussi, 8 prises inchangées, pas de mips. Pas mesuré sur un PC.

## 3. Preuves (banc `outils/banc-flouvitesse/flou.cjs`, Chrome sans fenêtre muet sous verrou, iPhone 13 Pro émulé 844×390 DPR 3, ?tel=1&appareil=iPhone14,2, carte nuages)
Planches avant/après HORS dépôt (scratchpad de la session, peut être vidé) :
`/private/tmp/claude-501/-Users-sachaberes-cash-car-qualite/f73d43a5-a4c1-4f2f-92ad-78d3cc403908/scratchpad/flouvitesse/planches/planche-vitesse-haute.jpg` et `planche-nitro.jpg`
(avant = programme V1 sans stries ni cœur des rubans, rendu sur la même page et la même image figée ; les PNG bruts sont dans `…/flouvitesse/p10/`).
- Comptes : 3 passes actives dans les trois états, 148 programmes dans les trois états, aucune cible ajoutée. Processeur : rien de plus par image (tout est fait au chargement).
- Lectures de texture par pixel flouté (téléphone) : filé 6 → 5 ; le cœur des rubans revenu (NET_NITRO2) en ajoute 1 : au total 6 contre 6 dans l'avant buggé.
- Temps de puce de la passe finale seule (dbgGpu-like, 30 rendus par chronomètre, 20 tours alternés, médianes), Mac chargé (2 bancs en même temps) :
  après − avant = +0,04 à +0,35 ms sur ~2,3-2,7 ms selon les passes (moyenne ≈ +0,15 ms) ; le même programme mesuré deux fois dans un tour diffère de 0,02 à 0,15 ms.
  Les variantes sans stries, sans poids, sans biais de mip, sans la branche ne sont pas plus rapides : l'écart restant n'est attribuable à aucune pièce.
  **Donc : égalité de coût NON prouvée au chronomètre du Mac** (écart du même ordre que le bruit, plutôt positif). Lectures et passes : égales ou moins.

## Non vérifié
- Le vrai iPhone (ni image, ni temps). Le PC (stries avec 8 prises). Les autres cartes que nuages. La planche est une image figée, pas une vidéo : le rendu en mouvement est à regarder.
- Si Sacha trouve les stries trop marquées : `uFz.x` (0,9) plus bas ; trop « dents de scie » sur les nuages : `uFz.y` plus haut.
