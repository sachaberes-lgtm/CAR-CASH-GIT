# LOT 3 « MENUS FROIDS » (15/11, branche qa/menusfroids)

Plan : `passation/qualite/batterie-lancement/PLAN.md` (lot 3) et `carte-batterie-menus.md` (P1, P2b).
Fichiers du jeu touchés : `code/moteur/cadence.js`, `code/css/interface-opti.css` (§5). Outil ajouté : `outils/banc-menus/s-menusfroids.cjs`
(le scénario de preuve, pour que la mesure se refasse ; aucun fichier du jeu).
Seulement sur téléphone profilé (`TEL_NATIF` et `PRF.on`) : l'ordinateur et les iPhone hors profil ne passent jamais dans ce code
(vérifié au banc WebKit sans `?appareil=` : `dbgCouverte().prf=false`, rien ne se pose).

## (a) La scène couverte : 2 i/s sous un écran opaque — `?sans=couverte`
- `couvTick` (appelé en tête de `hcSaute`, à chaque image d'écran) : un écran est « couvrant » seulement après lecture du STYLE CALCULÉ
  (écran et parents visibles, opacité 1, pas déplacé, rectangle = tout l'écran ; pour #overlay : `::before` à opacité 1, fixe).
  Les fondus d'entrée sont donc finis avant que la cadence baisse.
- Écrans retenus : RÉGLAGES, MODES, boutique de la coque (`#overlay[data-ecran=set|modes|shop]`), PROFIL (#prof), PLAQUE (#plq), SÉRIE (#serieW).
- **CONFIDENTIALITÉ exclue** : fond à .97, la scène passe à 3 % (photo : écart de 8 niveaux sur tout l'écran).
- Levée : dès que la clé d'état change (data-ecran, classes de body / du garage / des feuilles, PLQ, SERIEW, M2REV, GBQ, tuto…) — l'image suivante
  repart à la cadence normale ; aussi pendant `transUI`, le volet, GAR.go/sw, page cachée. Au banc : 80 ms après `mGo('home')`, `couvert=false`, `hc=false` (60 i/s de transition).
- En pause, RÉGLAGES de la pause : 2 i/s tout de suite au lieu de 10 (même chemin que la pause froide).

## (b) La veille des boucles — `?sans=veille`
- Au menu (`!started || garageOn`), 20 s sans geste ni changement d'état : chaque élément dont TOUTES les animations CSS (lui + ::before/::after)
  sont des boucles infinies prend `.ccVeilleP` (`animation-play-state:paused`, jamais `animation:none`). Un élément qui a aussi une animation qui
  finit (entrée, annonce) n'est jamais gelé.
- Réveil, avant la peinture suivante : touchstart / pointerdown / keydown / wheel, retour au premier plan, changement d'état, ou une classe / un style
  qui change sur un élément gelé ou un parent (MutationObserver). Chaque boucle repart d'où elle était.
- Jamais pendant : transition, série, missions, révélation, achat (SPOP on/attend), auto-école, lancement, en course, écran de mort.

## Vérifié (banc Chrome muet 390×844 et 844×390, `?tel=1&appareil=iPhone14,2`, et WebKit de Playwright)
Images rendues par seconde (`renderer.info.render.frame`, ~9,5 rendus par image de boucle au banc), sur 3 s :

| écran | avec | `?sans=couverte,veille` |
|---|---|---|
| accueil (témoin) | 142 | 143 |
| réglages | 19 | 142 |
| modes | 19 | 142 |
| boutique coque | 25-30 (photos des caisses comprises) | 142 |
| profil | 18 | 195 |
| plaque | 18 | 195 |
| série | 18 | 135 |
| confidentialité (exclue) | 159 | 159 |

Photos animations figées, toile de la scène visible contre cachée (`*-vis` / `*-cache`), debout et couché :
réglages, modes, plaque, série couché : IDENTIQUES au pixel. Boutique coque couché, profil couché, série debout : 3 à 99 000 pixels à 1-2 niveaux,
en lignes de la trame `--matrice` (bruit de rastérisation : le même écart existe entre deux photos visibles, `vis2`) ; le fond `--fondEcran` est
opaque (`--k0` #07050f), la scène ne peut pas y passer. Accueil : écart 248 (témoin : le test voit bien la scène). Confidentialité : écart 8 → exclue.

Veille (`dbgVeille()`) : accueil 7 boucles en cours → 0 à 23 s (les 7 reflets `.lg`) ; garage 12 → 2 (10 éléments : JOUER, PROFIL, BOUTIQUE, œil,
icônes) ; au premier toucher `on=false`, 12/12 en cours. Exclusion missions active. WebKit : même comportement.
Temps libre du fil principal (WebKit headless, tours de MessageChannel sur 4 s, Mac chargé à ~4,5) : accueil 5 s → 25 s : +22 % et +19 % avec la veille,
−2 % et 0 % sans. Réglages couverts : chiffres trop bruités pour conclure (le WebGL de ce WebKit dessine peu).
Retour de MISSIONS au garage, deux fois (dont une après 22 s de veille au garage) : #gvMis opacité 1, visible, 94×56 (debout) / 106×48 (couché), aucune animation figée.
Aucune erreur de page (`dbgErreurs` : seulement les lignes `profil` et `chargement`).

## Non vérifié
- Rien sur un vrai iPhone (ni WebKit iOS, ni compositeur iOS).
- RÉGLAGES ouverts depuis la pause (`setPauseOuvre`) : le chemin est celui de la pause froide, pas passé au banc.
- La veille n'a été regardée que sur l'accueil et le garage ; boutique 3D et inventaire : seulement par la règle (exclue pendant un glissé).

## À mesurer sur le 13 Pro
- `outils/banc-chaleur/essai.sh` 5 min dans RÉGLAGES puis 5 min sur l'accueil, A/B `?sans=couverte,veille`, budget thermique à la fin.
- Débranché : lignes `energie` de phase menu, 15 min par variante.
- À l'œil : sortir de RÉGLAGES / PROFIL / SÉRIE ne doit montrer aucune image figée de la scène ; après 20 s sans toucher l'accueil, le premier
  toucher relance les reflets sans saut.
