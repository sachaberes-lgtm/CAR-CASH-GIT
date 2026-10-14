# ÉTAT DE LA SESSION INTERFACE (PC) — 14/10, 20 h 15

## Où on en est (sur main)
- 196e487 (v402) puis c03f0e97 (v407) : la passe UX 8 sur l'interface PIXEL (charte v4/v5 laque · or · néon, police pixel, logo intact —
  `garde-charte.sh` OK). Branche de travail : `ux8` (worktree `Documents/GitHub/CCG-ux8`). Planches : `C:\Users\sacha\cc-banc\films\`
  (`AVANT-APRES-couche.jpg`, `planche-ux8b-couche.jpg`, `planche-ux8b-debout.jpg`, films `ux8b-*/transitions-*.mp4` + ralenti).
- Ce qui a changé : accueil (MISSIONS pleine largeur, GARAGE · OFFRES · RÉGLAGES avec libellé) ; garage ET boutique (fond blanc gardé, ordre
  direct de Sacha 17 h 30) au MÊME cadre : ◀ · argent · nom/rareté/ÉQUIPÉE/œil · [MON GARAGE | BOUTIQUE] · onglets · cartes · lingot JOUER/ACHETER
  (`<style id="ux8-garage">`, JS `ux8Bati`/`ux8Tick` — miroir de `#gStrip`/`.bqRail`/`#gBqBtn`) ; l'œil a une sortie ; pause (REPRENDRE or,
  QUITTER isolé, TOUS LES RÉGLAGES), fenêtre QUITTER (CONTINUER or), réglages ordonnés (un seul ENTRER UN CODE), fin sans OFFRES/RÉGLAGES,
  missions lisibles ; SECONDE CHANCE câblée (`#mChance`, suit l'offre de GENERAL) ; balayage pixel doré dans `ecranWipe` ; voile du PORTAIL
  animé par le compositeur (`#portV`, plus d'image figée : 551 ms mesurés sur le jade).
- Décisions de Sacha remises hors c6 (agent JS) : pas de nom de rang d'aura, pas de « BIENTÔT », record seulement > 0, MISSION au lieu de
  « défi », Pop-Tart honnête, achat qui vise l'objet touché (`bqEssaie`).
- Blocs CSS : `ux8-menus`, `ux8-garage`, `ux8-partie`, `ux8-mouvement` (après `sansFacile`), tous sous `html:not(.c6)`.

## Verdicts de Sacha à ne jamais oublier
Charte 6 noir et blanc REJETÉE (`?ui=6` seulement) ; police pixel ; LOGO intouchable ; garder les écrans garage ET fond blanc (boutique) ;
onglet MISSIONS (« défi » = défis secrets de la palette) ; carrière et MODE FACILE retirés ; aucune fausse urgence.

## La suite, par priorité
1. Le JOUER : mesuré au banc (`cc-banc\jouer.cjs`, accueil ET garage) — la construction (390-640 ms au PC) tombe DÉJÀ sous le balayage pixel doré
   d'`ecranWipe` : aucune image de jeu figée. Seul défaut restant : le voile couvert est IMMOBILE pendant la construction → idée : faire
   apparaître le motif animé par le compositeur du portail (`#portV`) sous le balayage tant que `cc:construction` 'chauffe' n'est pas passé.
   La branche `ux8-g` (voile dans `garageRender`/`chuteRender`, fin du départ 3D de Léo) n'est PAS poussée : chemin jamais atteint au banc.
2. LA PALETTE (40 couleurs, couche de GRAPHISME sur main) dans l'onglet PEINTURE de la boutique : `SPEC-PALETTE.md` (ui7/integ, passation/interface-nav7).
3. Boutique debout : le « 1.61 » 3D de la salle blanche passe derrière le nom de la caisse.
4. Le cadeau de l'accueil : c'est GAMEPLAY qui pose sa ligne (`cadeauEtat`/`cadeauOuvre`), au-dessus de MISSIONS, icône pièce.
5. HUD de course (`BRIEF-HUD.md`) : violet de `#speedFx`/`#pwrFx`, « MOY »/« $×1 » en 8 px, montants en décimales, boutons de figure de GAMEPLAY.

## Outils — C:\Users\sacha\cc-banc\
`lib.cjs` (file équitable, passe-droit `cc-banc.prio`, 2 créneaux, plafond 8 min), `fumee.cjs` (LA fumée d'avant poussée), `film.cjs`
(transitions filmées + vraies captures), `portail.cjs` (`dbgClassique('jade','midi')` + `dbgPortail(300)`), `chance.cjs`, `srv.cjs`,
`syntaxe.cjs`, `planche.cjs`, `lf.py`. Briefs : `BRIEF-UX8.md`, `SPEC-GARAGE.md`, `BRIEF-TRANSITIONS.md`, `TRANSITIONS-INVENTAIRE.md`.
