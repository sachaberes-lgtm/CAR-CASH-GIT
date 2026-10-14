# INTERFACE — PASSATION (écrite le 14/10 à 2 h 30 ; de quoi reprendre dans une discussion neuve)

## Les ordres de Sacha (dans le fil INTERFACE)
- « Refonte totale de l'interface, ça fait trop IA. Que tous les boutons soient mieux, les écrans plus cohérents, pas de boutons au mauvais
  endroit, pas de boutons qui se répètent, pas de trucs inutiles ; belles transitions ; le plus clair, le plus simple, le plus agréable.
  Tu peux changer complètement des systèmes. » Puis : « mets-toi en pause en attendant les ordres de pilotage » → j'obéis à PILOTAGE
  (`pilotage/REGLES.md`, `pilotage/BUDGET.md`).
- Rien n'est poussé sur `main` sans son accord. Toujours finir une livraison par un lien de test cliquable.

## Le chantier
- `~/cash-car/ui/` : `integ/` = worktree de `ui-integration` (serveur 8500) ; `wt/<zone>/` = worktrees `ui/<zone>` (accueil 8501, pages 8502,
  carriere-missions 8503, garage 8504, boutique 8505 GELÉE, hud 8506, pause-fin 8507) ; `BRIEF.md` = charte + règles des agents (§0 = règles
  de la nuit) ; `banc/lib.cjs` (verrou `banc/tour` = 1 navigateur à la fois pour la session), `banc/tour.cjs`, `tour2.cjs` (tour des écrans),
  `banc/fusion.sh <zone>` (fusionne `ui/<zone>` dans `ui-integration` + syntaxe + garde), `banc/lint-c6.cjs <index.html>` (contrôle
  statique de la charte), `banc/serveurs.sh` (relance les serveurs) ; `shots/avant/` (l'ancien), `shots/socle1/` (socle seul) ; `notes/<zone>.md`.

## La charte 6 — ENCRE · BLANC · OR
- Diagnostic : cinq langages visuels ; la laque néon (violet, magenta/cyan/or, penché, lueurs, dégradés) = le cliché « IA ». Référence = la
  boutique blanche de Léo. Règles : à plat, droit, encre/blanc, UN or par écran (la décision), vert/violet/rouge sur des chiffres seulement,
  filets de 2 px, pixel droit sans chasse, retour ◀ en haut à gauche (`.c6Tete` / `.c6Ret`), l'or en bas à droite, rien en double.
- Code : `<style id="charte6">` (socle + composants) puis un bloc `<style id="c6-<zone>">` par zone, après `passeMobile` de Léo ; toutes les
  règles préfixées `html.c6` (classe posée dans le <head> ; `?ui=5` = l'ancienne interface). Les anciennes feuilles restent dessous.
- Décisions de rangement (à faire valider par Sacha, certaines touchent des choix de Léo) : MISSIONS et « OFFRES ÉPHÉMÈRES » quittent le hub
  du garage ; l'œil = petite touche près du nom de la caisse ; OFFRES et RÉGLAGES quittent l'écran de fin ; HOME en mot → ◀.
- HUD : périmètre réduit (veille de sortie) : chiffres, tailles, ordre INTOUCHÉS ; seulement ⏸, plaquette de pouvoir, bandeaux d'annonce,
  consigne du volant. Pas de `:has()`, pas de JS.

## État au moment de la passation
- `ui-integration` = `be08a7d` (assemblage T0 fusionné) : socle, composants, blocs vides, transitions (`c6-transitions`, NON vérifiées à l'écran).
- Vague 1 en vol (3 agents Opus, effort high, 30 min) : accueil (`ui/accueil`), hud (`ui/hud`), fin = écran `#mDead` (`ui/pause-fin`).
- `ui/pages` : un brouillon des réglages (commit « en cours »), à reprendre.

## Suite (plafond : 2 agents, sonnet par défaut, UN Opus à la fois ; un tour du chef par fin de vague)
1. À chaque fin de vague : `sh ui/banc/fusion.sh <zone>` pour chaque zone rendue, `node ui/banc/lint-c6.cjs`, réécrire `pilotage/etat/INTERFACE.md`,
   lancer la vague suivante. Plus de nouvelle vague 10 min avant un train (T1 3 h 45, T2 5 h 15, T3 6 h 45).
2. Vague 2 : garage (hub : DOM 7607-7665, JS `gAtelier` 44201, `#gRappel` 44297, `#gRang1` 44333, `gVueSeule` 44323, CSS `hubGarage` 6068-6952)
   + réglages (`#mSet` 7886, reprendre `ui/pages`). Vague 3 : pause (`#tPanel` 7967, CSS 2662-2695) + carrière/missions (`#carr` 7765, `#gMis` 7594).
   Puis : offres, splash/fenêtre/toast, une relecture à l'œil neuf (sonnet) sur un tour complet des écrans, planches avant/après pour Sacha.
3. Livraison finale à Sacha : lien http://localhost:8500/index.html (+ `?ui=5`), la liste de ce qui a été retiré/déplacé.
