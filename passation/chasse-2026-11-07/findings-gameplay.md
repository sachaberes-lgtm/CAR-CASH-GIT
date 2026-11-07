# Chasse — boucle / gameplay (agent Opus, 2026-11-07)

Bilan : 0 BLOQUANT confirmé, 0 MAJEUR nouveau, 3 MINEURS nouveaux. Audit du 11-05 : GP-01, GP-02, GP-05 restent ouverts.

Fichiers lus : moteur/cadence.js et boucle-1.js en entier ; boucle-2 (l.1-30, 100-210), boucle-3 (l.375-450, 540-652), boucle-5 (le try), boucle-6 (l.70-135, 260-315) ; piste-prebati.js (l.185-367) ; depart-avance.js (l.26-100) ; gameplay/mort.js (explode, boomDetone), seconde-chance.js (resetGame, endGame, start, chanceSafe/Tick/Protege, visibilitychange), demi-tour.js (glace, rattrapage, dmtCoupe, dmtSigne), impact.js (impPrep, impMur, impCoupPart/Tick), portail-passage.js (portailPasse, PORTV), figures-route.js (frFin, RAILS), gravite-orbite.js, frenesie.js (ralentiDt) ; maps/niveaux.js (l.30-131), continuite.js (sfTire, sfImpose), murs-slide.js (l.21-64) ; suivis par grep : init.js (togglePause, visibilitychange), traces-pneus.js (newTrack0), jus-echelle.js (respawn), vignette-moteur.js (chargementTick, departAttend), mobile-tactile.js (QUITTER, syncJeu, filets tactiles), bouton-nitro-gains.js (loopWarn) ; diff -w de tout code/moteur + code/gameplay depuis 58f8ea26.

⚠ Lecture NON intégrale (voir C).

## A. Audit du 11-05 : état des ID de ma section
| ID | état | preuve (fichier:ligne) |
|---|---|---|
| GP-01 | OUVERT (en partie atténué) | `boucle-6-hud.js:125` : toujours un seul try pour la simulation et le HUD. Ajouté depuis : la boîte noire `__ccNote`, et un filet qui remet à 0 vA/vL/lat/psi non finis et appelle `endGame()` si `s` n'est pas fini. Une exception qui se répète avec un état FINI fige toujours la caisse sans mort. Pire cas : en `mode==='boom'`, avant `boucle-3-physique.js:607`, l'explosion ne finit jamais et la pause est refusée (`init.js:356`). Pas de compteur d'erreurs consécutives. |
| GP-02 | OUVERT | `boucle-1.js:21` `Math.min((now-last)/1000,.05)` : ni sous-pas, ni `rawMs` pour les chronos, sauf `mortsTick` (`boucle-1.js:170`). Preuve `chasse/gameplay/preuve-gp02-dt.cjs` : 15 i/s → monde ×0,75, 10 s de pouvoir = 13,3 s réelles ; 10 i/s → ×0,5. Ne joue que sous 20 i/s (CAD cale à 30 avant). |
| GP-03 | CORRIGÉ | `figures-route.js:67-68` |
| GP-04 | CORRIGÉ (contourné) | `seconde-chance.js:182` `chanceSafe()` appelé par `chanceRepart` (l.157) et `chanceProtege` (l.194). `safeS` n'est écrit que sur une dalle à plat (`boucle-2-conduite.js:132`). |
| GP-05 | OUVERT | `boucle-6-hud.js:125` : rien sur `fallPos`/`fallVel`/`carGroup.position`. La mort arrive quand même (`airDepasse`, `boucle-3-physique.js:580`). |
| GP-06/07/10/29 | CORRIGÉ | `seconde-chance.js:390-391` |
| GP-08 | NON VÉRIFIABLE | CSS de `#msg` sur téléphone |
| GP-09 | OUVERT | `traces-pneus.js:91-129` : `newTrack0` ne remet ni `POSE_F`, ni `hopY/hopV`, ni `frCoupe()` |
| GP-11 | OUVERT | `boucle-1.js:223` : `chanceTick` dans la porte de simulation ; en pause `carGroup.visible` reste figé, y compris à `false`. |
| GP-12 | OUVERT | `boucle-6-hud.js:310-311` : `prebTick` avant `cadFin`, compte dans `CAD.w`. |
| GP-25 | OUVERT (bénin) | `cadence.js:51` |
| GP-13 | CORRIGÉ | `boucle-1.js:212` |
| GP-14 | NON VÉRIFIABLE | |
| GP-15/16/18/20/24/27/28/32/36 | NON VÉRIFIABLE | GP-31 (`DN.gx`) : remis à 1 hors vol (`dunes-2.js:241`). |
| GP-19 | OUVERT | `murs-slide.js:52` : sous bouclier, `impMur` arme `IMP.frais` puis `explode` sort aussitôt (`mort.js:263`) ; caisse plaquée au mur sans perdre de vitesse ; impact armé 250 ms réutilisable. |
| GP-22 | CORRIGÉ | `mobile-tactile.js:50-53` |
| GP-17/21/30/35 | OUVERT | `passation/RAPPORT-JURY-OPUS.md:84` « PAS FAIT » |
| GP-38 | OUVERT | `piste-prebati.js:210-226` |
| GP-40 | CORRIGÉ | `bouton-nitro-gains.js:261-262` |
| DIR-09 | CORRIGÉ (D7) | `figures-route.js:77-81` : 3 s de rails |

## B. Nouveaux défauts

### GP-N01 · MINEUR · « MAUVAIS SENS » reste affiché après QUITTER/pause
- Où : `code/gameplay/seconde-chance.js:483` (`endGame`) et `code/gameplay/demi-tour.js:244-291` (`dmtSigne`, CSS injecté l.247-255).
- Quoi : pause pendant un demi-tour (≈1 s ; jusqu'à 14 s sur le verglas), puis QUITTER. Le panneau rouge `#dmtSigne` (fixed, z-index 40) reste par-dessus l'écran de fin puis au garage, jusqu'au prochain `resetGame`. Visible aussi par-dessus la feuille de pause.
- Raisonnement : QUITTER (`mobile-tactile.js:398`, `desktop-banc.js:44`) → `endGame()`, qui n'appelle ni `dmtCoupe` ni `respawn`. Le CSS ne masque le panneau que sous `body.ebOn/.ftOn`.
- Preuve : `'body.ebOn #dmtSigne,body.ftOn #dmtSigne{visibility:hidden!important}'` (demi-tour.js:255) ; `dmtCoupe` appelée par explode, respawn, newTrack0, startFall, resetGame, jamais par endGame.
- Correction proposée : `try{dmtCoupe();}catch(e){}` en tête d'`endGame`, et/ou `body:not(.play) #dmtSigne{display:none}`.
- Confiance : haute.

### GP-N02 · MINEUR · Exception pendant l'explosion : écran bloqué, pause refusée
- Où : `boucle-6-hud.js:125` (catch), `boucle-3-physique.js:607`, `init.js:356`.
- Quoi : pire cas de GP-01. Une exception répétée en `mode==='boom'` avant la l.607 empêche `endGame`. Écran figé sur la boule de feu, pause refusée, il faut recharger.
- Preuve : `if(boomT>1.8&&!gameOver)endGame();` (boucle-3-physique.js:607, dans le try) ; `if(mode==='boom'&&!paused)return;` (init.js:356).
- Correction proposée : dans le catch, `if(started&&!gameOver&&mode==='boom'&&boomT>1.8)endGame();` + compteur : 30 images en erreur de suite → `explode('vide')` hors 'boom', `endGame()` en 'boom'.
- Confiance : moyenne (aucun déclencheur concret trouvé).

### GP-N03 · MINEUR · Portail franchi pendant une figure de route ou une pose
- Où : `code/rendu/traces-pneus.js:91-129` (`newTrack0`).
- Quoi : `newTrack0` coupe le demi-tour mais pas la figure de route (`FR`/`frCoupe`), ni `POSE_F`/`hopY`, ni le slide. Une figure lancée à la bouche du portail se finit et se paie sur la piste neuve.
- Preuve : l.125-127 vs `respawn` (`jus-echelle.js:316-322`).
- Correction proposée : à côté de `dmtCoupe()` : `POSE_F=null;hopY=0;hopV=0;try{frCoupe();slideRaz();}catch(e){}`.
- Confiance : moyenne.

Vérifié sans défaut : filets clavier/tactile (`blur`, `visibilitychange`, `touchcancel`, `syncJeu`) ; `endGame` gardé contre le double appel ; portail gardé `mode!=='boom'`, payé une fois (`PORTV.paye`) ; délais bornés (`chargementTick` 15 s, `departAttend` 20 s, `rejoueAttend` 12 s) ; divisions par `dt` gardées ; `sfTire` ne tire jamais deux fois la même map ; pause : `slowT` vidé, sons coupés ; `ralentiDt` remis à zéro hors course.

## C. Ce que je n'ai pas pu vérifier
- Non lus : `boucle-3-physique.js` l.1-375 (vol et pose), `boucle-4-effets.js`, `camera.js`, `figures-physique.js`, `pose-verdict.js`, `vol-equilibre.js`, la majeure partie de `frenesie.js`, `evenements-rares.js`, `zones-caisses.js`, `fruits-*`, `pickups-fruits.js`, `sensations-flow.js`, `route-sans-haut.js`, `tryLand` (`demi-tour.js:308+`).
- GP-14/15/16/18/20/24/27/28/32/36 non retrouvés un par un.
- Remarqué en passant : seuils de pièces des paliers moteur passés de 5/12/21 à 60/125/200 (diff `pickups-fruits.js` du 11-05). À confirmer par l'agent économie.
