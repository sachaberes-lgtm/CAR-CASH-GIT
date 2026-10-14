# BRIEF — LA PASSE D'ACCORD DU HUD DE COURSE (refonte navigation 7, après T9)

Lis d'abord `BRIEF-NAV7.md` (même dossier) : l'ordre de Sacha, les règles, le banc, git.

Le HUD de course est le seul écran où l'on touche à 300 km/h : il doit se lire d'un coup d'œil et ne jamais tromper le pouce.
Aujourd'hui (relevés au banc et par les autres sessions) :
- l'abréviation « MOY 400 » (aura moyenne) et « $×1 » en 8 px ; des montants en décimales (« $ 2,78 », « +$ 1,65 ») alors que le reste du jeu
  affiche des entiers (accueil, garage, fin) → un seul format d'argent (entiers au-dessus de $ 10, centimes seulement sous $ 1) ; aucun
  texte < 11 px ; « MOY » écrit en entier ou remplacé par une icône ;
- le HUD reste VIOLET (`#speedFx` l. ~251 : voile radial rgba(45,20,55,.55) ; `#pwrFx` l. ~1565) alors que toute l'interface a quitté le
  violet → les teintes de la charte 6 (encre, voile .45) ;
- la bannière de niveau `#lvlBan` (« EN ORBITE — MIDI ») en petit texte violet de 12 px au milieu de la route → pixel 16 ou système 15/800,
  blanc, posée hors de la route ;
- « GLISSE POUR TOURNER » (bloc 4 l. ~8151, et la règle de 29/09 l. ~4532) en 10 px → 13/800 ;
- l'anneau-fantôme du volant (rond pointillé) dessiné SUR le feu arrière de la caisse ;
- les 3 boutons de FIGURE de GAMEPLAY (`#tFig`, `.tFigB[data-s]`, `<style id="figuresV2">`, visibles seulement en vol sous
  `body.touch.play.figVol`) : plaque penchée (skewX), laque, nom court en 8 px — GAMEPLAY s'aligne sur la charte (52×52, encre --c6-e1, filet
  blanc 2 px, tranche 4 px, appui translateY(4px) 90 ms linear, icône SEULE, numéro 11 px ou rien) ; vérifie et finis l'accord par-dessus
  (zone tapable ≥ 44, les trois états `.on` `.boum` `.non` gardés, la place : couché une rangée à gauche de NITRO, debout au-dessus) ;
- NITRO `#tNitro` et ⏸ `#tGear` : même grammaire que le reste (le ⏸ est déjà 48×48, 90 ms).
INTOUCHABLES ici : l'auto-école (`#coach`, `#ecMain`, `tuto*`, `<style id="ecoleV2">` = session GENERAL) — lis sans modifier ; la physique et
les gestes (`TCTL`, `#tSteer`, `#tStick`, la logique de `#tFig` = GAMEPLAY) ; GENERAL cale sa main fantôme sur `#tSteer::after`, `#tStick`, `#tNitro` :
ne les déplace pas sans le dire dans ton rapport.
Vérifie au banc en course (JOUER → NORMAL, ou `window.dbgFacile`/`dbgCampagne` si utile ; un vol : sortir par le bord), debout 390×844 et 375×667,
couché 844×390 ; FR et EN ; captures à 2 s et 8 s de course, et en vol (figures visibles).
