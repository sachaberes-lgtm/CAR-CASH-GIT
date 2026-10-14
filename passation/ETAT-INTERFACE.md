# ÉTAT DE LA SESSION INTERFACE (PC) — 14/10, 16 h 50 — à lire avant de reprendre

## VERDICT DE SACHA (16 h 40, via PILOTAGE) — il prime sur tout ce qui suit
« Je voulais pas changer le logo ; le travail fait pour l'interface est bâclé ; j'aime pas du tout ce délire en noir et blanc ; c'était très clair
qu'on avait une charte graphique avec une police pixel ; surtout ne modifie pas le logo. » → la charte 6 (ENCRE · BLANC · OR) est REJETÉE ; PILOTAGE
rebascule la ligne 48 (c6 seulement avec `?ui=6`, défaut = l'ancienne interface pixel). GEL : rien de c6 ni de `ui7/*` sur main.
MISSION SUIVANTE (PILOTAGE) : garder la SIMPLIFICATION (moins d'écrans, plus de doublons, ordre de Sacha 13 h 20) mais avec les COULEURS de la charte
validée (LAQUE · OR · NÉON, v4/v5, police pixel), et ne RIEN pousser sans captures validées par Sacha. Ne jamais toucher au logo.

## Ordres de Sacha qui n'existent QUE sous `html.c6` (ils disparaissent avec la rebascule — à reporter dans l'interface par défaut)
- `auraSansNom()` : plus aucun nom de rang d'aura, le chiffre seul (l. ~30583, 37923, 40500, 48275).
- Plus de blocs « ? BIENTÔT » dans le garage (`gMystere`, l. ~44295) ; OFFRES = l'onglet de la boutique, plus d'écran rose (`gOffresPage`, `bqVaOffres`, l. ~44373, 49492, 53190).
- Boutique : « IL TE MANQUE » avant le toucher (`bqEtatC6`), ◀ en haut à gauche (`bqRetourC6`), colonne CETTE SEMAINE en cartes entières, offre essayée d'office (l. ~46858-46919).
- L'œil posé dans la fiche (l. ~44571) ; « TOUCHE POUR JOUER » au splash (l. ~52208) ; TOUS LES RÉGLAGES depuis la pause (`setPauseOuvre` exige c6, l. ~52967) ;
  record seulement s'il bat un record > 0 (l. ~53049) ; libellés MOTEUR / frénésie / POUCE HAUT courts ; pastilles muettes (l. ~53121) ; CHOISIS TON MODE en cartes
  (`facChoix`, mais le MODE FACILE est retiré : IDEE, SANS_FACILE) ; carrière refaite (`carrVueC6`, mais la carrière est retirée : SANS_CARRIERE).
- Tout le CSS des blocs `<style id="charte6">` et `c6-*` (aucun texte < 11 px, cibles 44, ◀ en haut à gauche, hub du garage sans MISSIONS/OFFRES…).

## Ce qui est fait (rien sur main ; tout sous `html.nav7`, qui exige `html.c6` → inactif par défaut après la rebascule)
- `ui7/nav` (8feba8a + main) : barre d'onglets ACCUEIL · GARAGE · MISSIONS · BOUTIQUE (`#n7Bar`, `n7Va`, `n7Tick`, `window.dbgNav`), argent + aura en
  haut à droite (`#n7Bank`), accueil réduit à RÉGLAGES · logo · caisse · JOUER, ligne du CADEAU (`#n7Cadeau`). Vu au banc debout + couché, 0 erreur.
- `ui7/garage` f32cf21 : GARAGE = « mes caisses » directement (plus de hub). `ui7/defis` (3 commits) : écran MISSIONS en grandes cartes, mot MISSION partout.
- `ui7/boutique` 85ce41a et `ui7/pause` 7e4358d : travail INTERROMPU (limite du compte, 15 h 20), jamais vu au banc.
- `ui7/integ` (cette branche) = nav + missions + garage + main 18d585e. Captures avant/après : `passation/interface-nav7/*.jpg`.
- Docs de travail : `passation/interface-nav7/` — CARTE-UI.md (tous les écrans, fonctions, doublons), BRIEF-NAV7.md, SPEC-PALETTE.md, BRIEF-HUD.md.
- Décisions de Sacha reçues : onglet = MISSIONS (« DÉFI » = défis secrets de la palette seulement) ; carrière et MODE FACILE retirés ; offres honnêtes
  (POP-TART sans « ÉDITION LIMITÉE » ni minuteur, quitte la vitrine une fois acheté ; jamais de fausse urgence) ; SECONDE CHANCE et CADEAU toutes les ~6 h validés.

## Contrats en cours avec les autres sessions
- GAMEPLAY : `cadeauEtat()` → {pret, dansMs, jour} / `cadeauOuvre()` → la ligne `#n7Cadeau` sur l'accueil (une seule ligne, pas d'écran).
- GENERAL : `chanceEtat()` → {ok, prix, reste} / `chanceJoue()` ; événement `cc:chance` → plaque `#mChance` (encre) au-dessus de REJOUER sur l'écran de fin.
- GRAPHISME : LA PALETTE (couche sur main 18d585e) → écran dans PEINTURES de la boutique, 4 sections de 2 × 5 cases ≥ 44 px (SPEC-PALETTE.md).
- Bugs à reprendre : boutique, ACHETER vise l'objet d'AVANT (bras 0,71 s) ; fin de partie courte (stats à zéro) ; PARTAGER (navigator.share) ;
  les 2 caisses de l'ex-carrière : descriptions à réécrire pour un achat ; HUD encore violet (`#speedFx`, `#pwrFx`), « MOY » et « $×1 » en 8 px.

## Outils (PC) — C:\Users\sacha\cc-banc\
`lib.cjs` (banc commun : file équitable `cc-banc.file`, passe-droit `cc-banc.prio`, 2 créneaux, plafond 8 min, Chrome muet), `fumee.cjs` (LA fumée d'avant
poussée, réparée 16 h 30 : FUMÉE OK sur main 8c01287), `srv.cjs`, `lf.py` (fins de ligne : le blob est LF), `syntaxe.cjs`, `planche.cjs`.
Worktrees : `CCG-ui7-{nav,garage,boutique,pause,defis,integ}`, `CCG-ui-integration` (socle 2582b10 local), `CCG-main-fumee` (détaché, jetable).
