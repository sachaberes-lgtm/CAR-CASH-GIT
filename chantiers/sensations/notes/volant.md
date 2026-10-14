# VOLANT — « on perd le joystick du doigt » (agent `volant`, passe SENSATIONS, 2026-10-14)

Copie : `sensations/wt/volant` (branche `travail`, base `sensations-integration` c21ec8e). Fichier : `VERSION PRINCIPALE/index.html`,
bloc du VOLANT (après `stUp` / `stEnd`, juste avant le « repli SOURIS »). Deux commits : `40f5cc1` (le pouce orphelin), `cf6c70e` (filet arrière-plan).
Gameplay : rien de touché (`stDown` / `stMove` / `stUp`, `VOLANT_PX`, `LOCK`, `LOCKU`, `DRIFT_PX`, `ARC_*` intacts ; 46 lignes AJOUTÉES, aucune ligne existante réécrite).

## Ce qui a été trouvé
**Le défaut, reproduit** : un doigt appartient pour toujours à l'élément où il s'est posé. Pendant ~0,3 s après REJOUER (et après le tout
premier JOUER), le VOLET `#wipe` couvre l'écran : un pouce posé à gauche à ce moment-là tombe sur le volet, pas sur `#tSteer`. Les écouteurs
du volant étant tous sur `#tSteer`, ce pouce n'est jamais le volant : pas d'anneau, braquage 0, tant qu'on ne le RELÈVE pas pour le reposer.
C'est exactement le geste d'un joueur pressé (mort → REJOUER → le pouce revient tout de suite à sa place). Le correctif du 09/10 (commit
`11c4441`, branche `fix-joystick-saut`) n'avait jamais été fusionné : le défaut était intact dans la base de la passe (et donc sur main).

**Le correctif (`40f5cc1`)** — portage de 11c4441, adapté :
- `stNote(e)` recopie la liste `touches` à chaque événement tactile (`stDoigts`) ; `stAdopte()` donne le volant, EN COURSE (ni pause, ni
  explosion, ni écran de fin), à un doigt posé dans le rectangle de `#tSteer` qui ne tient aucun bouton (`stLibre` : `.tbtn`, `#tNitroZone`,
  `#tSet`, `#modale`, `button`, `[data-a]`, `[data-m]`). Appelée au départ de la course (`cc:jeu`) et à chaque toucher / glissé.
- Le doigt adopté est suivi par son IDENTIFIANT sur `window` (capture). Les doigts nés SUR le volant gardent leurs écouteurs d'origine
  (le `touchmove` de `window` ne traite que `!sz.contains(t.target)`) : jamais deux `stMove` pour un même glissé.
- Différences avec 11c4441 : (a) purement en AJOUT (11c4441 réécrivait les écouteurs du volant) ; (b) pas d'adoption en PAUSE (le doigt y
  fait défiler la feuille) ; (c) `stIntrus` : un doigt posé pendant qu'un autre tient le volant (la paume, règle du 30/09) n'hérite jamais du
  volant — sans ça la paume l'aurait pris au lever du pouce et le pouce reposé aurait été ignoré ; (d) FILET dans `stNote` : si le doigt du
  volant n'est plus dans `touches`, `stUp()` (lever jamais annoncé → plus de braquage resté collé) ; (e) `tg.isConnected` (un doigt dont
  l'élément a quitté la page n'est pas adopté) ; (f) `button` dans `stLibre` (PASSER de l'auto-école).
- Même filet à la souris (cadre de l'ordi), dans un écouteur `mousemove` à part.

**Filet `cf6c70e`** : `visibilitychange` (appli à l'arrière-plan) → `stUp()` si le volant est tenu. Non reproduit sur téléphone ; prouvé au banc node.

## Les 7 cas
| cas | verdict | preuve |
|---|---|---|
| 1 identifiant | SAIN | code : `TCTL.id` du `touchstart` au `touchend`/`touchcancel`, jamais `touches[0]` pour suivre (le seul `changedTouches[0]` est à la POSE) ; node `volant-ev.cjs` : NITRO posée avant le pouce (1re de la liste) et levée avant lui → le pouce garde le volant ; identifiant recyclé pris |
| 2 sortie du rayon / de la zone | SAIN | la base FLOTTE déjà sur les deux axes (`stMove`) ; navigateur (AVANT) : pouce tiré jusqu'à x = 90 % (hors `#tSteer`) puis ramené : `act` reste vrai, 30 px de retour rendent déjà la main (st -1 → -0,30), 110 px = butée opposée ; tout en haut / tout en bas : tenu |
| 3 deuxième doigt | SAIN | node : NITRO posée / levée, paume posée / glissée / levée avant le pouce : braquage inchangé. ⚠ Au navigateur ces cas sont SANS VALEUR dans ma passe (le banc levait le mauvais doigt — corrigé depuis dans le script, non rejoué) |
| 4 REJOUER / 1er JOUER | DÉFAUT PROUVÉ → corrigé `40f5cc1` | navigateur AVANT : pouce posé 0 ms et 120 ms après REJOUER, 100 ms après le 1er JOUER (couché), 120 ms après REJOUER (debout) → « tombé sur DIV#wipe », `act=false st=0` après 70 px de glissé ET 1,5 s plus tard ; à 700 ms (volet parti) → pris. APRÈS : node seulement (pose sur `#wipe` → pris au départ) |
| 4 pause | SAIN | navigateur AVANT : pouce posé 150 et 600 ms après REPRENDRE (pendant le 3-2-1) tombe sur `#tSteer` → pris ; en pause, un doigt sur la feuille ne prend pas le volant |
| 4 rotation | SAIN | navigateur AVANT : couché → debout pouce tenu : `act` gardé, le braquage répond (st -0,612 pour 30 px, la valeur attendue), anneau sur la base |
| 4 touchcancel | SAIN (côté jeu) | navigateur AVANT : le volant se rend, l'appui suivant est pris. Après un touchcancel d'iOS le doigt resté posé n'envoie plus rien : il FAUT le relever, aucun code n'y peut rien |
| 4 saut / mort, pouce TENU | NON TRANCHÉ au navigateur | code : `syncJeu` remet `act=false` à la mort ; un pouce tenu jusqu'au REJOUER (tapé de l'autre main) restait orphelin ; node APRÈS : repris à `cc:jeu`. Le cas navigateur a échoué (banc, voir cas 3) |
| 5 bords | SAIN dans Chrome ; iOS NON PROUVÉ | navigateur AVANT : coin bas-gauche (3 px), tout en bas, bord gauche, tout en haut, x = 51 % : tous pris, butée atteinte. Reste le GESTE D'ACCUEIL d'iOS (voir plus bas) : invérifiable ici |
| 6 zone | SAIN | navigateur AVANT, grille de 6 px sur la moitié gauche : 4550/4550 points (couché, zone 0-456 px = 54 %) et 4653/4653 (debout, 0-203 px = 52 %) tombent dans `#tSteer` — aucun élément du HUD n'avale le toucher. Lu dans le code, non mesuré : la carte de l'auto-école `#coach.on` (pointer-events:auto, haut-centre, 340 px) mord sur la zone pendant la leçon → couverte par le correctif (node) |
| 7 navigateur | SAIN | `touch-action:none` et `user-select:none` mesurés sur `#tSteer`, `preventDefault` au toucher et au glissé, écouteurs `passive:false`, `gesturestart` / `contextmenu` / `dblclick` annulés, viewport `user-scalable=no` ; après tout le banc : scrollX/Y = 0, zoom = 1. (18 événements sur 187 étaient non annulables dans Chrome — sans effet sous `touch-action:none`) |

## Prouvé comment — et ce qui ne l'est PAS
- `banc/volant-doigts.cjs` (vrais doigts CDP, banc commun) : trace complète de la référence dans `notes/volant-banc-avant.txt`.
- `banc/volant-ev.cjs <fichier> [référence]` (sans navigateur : le vrai bloc du volant, tous ses écouteurs, sur un faux verre) :
  référence 13 OK / 7 KO, copie corrigée 21 OK / 0 KO, et 2400 glissés au hasard d'un doigt né sur le volant donnent les 13 valeurs de
  `TCTL` IDENTIQUES à la référence (le chemin normal n'a pas bougé). `banc/volant-sim.cjs` : sortie identique à la référence.
- ⚠ **LE CORRECTIF N'A PAS ÉTÉ VU TOURNER DANS UN NAVIGATEUR.** J'ai usé mes deux ouvertures : la 1re a planté en quelques secondes (bouton
  JOUER introuvable, aucun cas joué) ; la 2e a joué toute la référence (AVANT) puis a chargé ma copie depuis un dossier sans `vendor/` (ma
  copie privée ne contient qu'index.html) → écran RELANCER, rien de joué. Je n'en ai pas ouvert une 3e. Tout est prêt :
  `sh /Users/sachaberes/cash-car/sensations/banc/volant-verif.sh` (UNE ouverture, ~3 min ; monte un dossier léger avec les liens vers
  `vendor/` et `assets/`, étalonne le lever à deux doigts, rejoue les 7 cas). Attendu : tous les « 4a » et « 4d » en OK.
- Aucun essai sur un vrai iPhone.

## Vu et laissé (hors de mon terrain)
- **Le geste d'accueil d'iOS** (candidat sérieux, non prouvé) : téléphone couché, la barre d'accueil longe le bas de la moitié gauche. Un
  pouce posé tout en bas qui remonte (braquer, ou « pouce en haut » en vol) peut être pris par iOS pour le balayage d'accueil → touchcancel →
  le doigt est mort jusqu'à ce qu'on le relève. Dans l'app Capacitor, le remède est natif : `preferredScreenEdgesDeferringSystemGestures`
  (= `.all`) dans le contrôleur de vue (branche `ios-capacitor`) : il faut alors deux balayages pour sortir. Dans Safari, rien à faire.
- Reprise après pause sans bouger : un pouce parfaitement immobile posé pendant une pause n'est adopté qu'à son premier micro-mouvement
  (`togglePause` n'émet pas `cc:jeu`). Un vrai pouce bouge toujours ; je n'ai pas touché à `togglePause`.
- Aucun changement de RESSENTI proposé, donc pas de paramètre `?stick=` : la base suit déjà le pouce, la zone couvre déjà toute la moitié gauche.
