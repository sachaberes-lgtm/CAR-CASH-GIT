# Chasse — gameplay, seconde passe (agent Opus, 2026-11-07)

Bilan : 0 BLOQUANT, 0 MAJEUR, 3 MINEURS (confiance moyenne/basse). Aucune exception déterministe qui figerait la caisse. Remises à zéro en place pour resetGame, endGame, respawn, chanceRepart. Scripts : chasse/gameplay2/ (scope.cjs, strip.cjs).

Fichiers lus : boucle-3-physique.js l.1-375, boucle-4-effets.js, boucle-2-conduite.js l.30-135 et 210-fin, boucle-6-hud.js l.1-70 et 118-260, camera.js, figures-physique.js, pose-verdict.js, vol-equilibre.js, frenesie.js, frole-contrats.js l.1-111, evenements-rares.js (événements), zones-caisses.js, fruits-auras.js, fruits-nouveaux.js (survol), pickups-fruits.js (géométrie), pouvoirs-orbes.js, pouvoirs-grisants.js, ramassage.js l.53-135, sensations-flow.js, route-sans-haut.js, boost-depart.js, ligne-parfaite.js, pluie-caisse.js, demi-tour.js l.308-555, seconde-chance.js l.120-200 et 352-560, figures.js l.160-346.

## A. Audit GP-14/15/16/18/20/24/27/28/32/36 (libellés déduits, audit-gameplay.md introuvable)
| ID | état | preuve |
|---|---|---|
| GP-14 lissages dépendants du dt | OUVERT | `lisse60` (vol-equilibre.js:107) utilisé seulement vol-equilibre.js:97-100, ramassage.js:117/120. Restent en `Math.min(1,dt*k)` : boucle-3:21, :43, :200, :245, :197 ; boucle-4:55, 69, 100, 117 |
| GP-15 vitMult | CORRIGÉ (probable) | portail-passage.js:70 |
| GP-16 EVT_ON | OUVERT (décision) | evenements-rares.js:25 `?evt=1` seulement |
| GP-18 s négatif | OUVERT | boucle-2-conduite.js:125 sans borne, vA jusqu'à −16 (l.53) ; `safeS=s` négatif l.132 ; pas d'exception |
| GP-20 touchcancel pad | CORRIGÉ (probable) | mobile-tactile.js:50, 52, 53, 33, 79/84 |
| GP-24 départ d'avance vs seconde chance | OUVERT (probable) | seconde-chance.js:158 `engTier=Math.max(0,engTier-CHANCE.moteurPerte)` ignore vdepPal (pickups-fruits.js:573) |
| GP-27 DN.gx | CORRIGÉ | dunes-2.js:241 |
| GP-28 double pénalité | À CONFIRMER | chanceRepart ne retire plus d'argent (l.137) |
| GP-32 deux comptes 3-2-1 | À CONFIRMER | seconde-chance.js:168-176 attend la pause ; mobile-tactile.js:350 non vérifié |
| GP-36 nitroBlue | CORRIGÉ | seconde-chance.js:153, :370, :484 |

## B. Nouveaux défauts

### GP2-N01 · MINEUR · AIR MAX qui expire en vol efface la durée du vol
- Où : boucle-1.js:168 ; effet dans demi-tour.js:404-407 et 506 (tryLand).
- Quoi : raisin/AIR MAX fini en l'air → `fallT=0;fallTR=0`. fallT sert aux paiements : pose < 0,7 s plus tard → verdict (PARFAIT, MONSTRE, sfaPose) sauté, perte à la pose calculée sur un vol « court » ; 0,1 s sans pose possible.
- Preuve : `if(pwrAirT>0){pwrAirT-=dt*pwrAirK();if(pwrAirT<=0){pwrAirT=0;…if(mode==='fall'){fallT=0;fallTR=0;airFlash=.6;}}}`
- Correction proposée : ne remettre que `fallTR=0`.
- Confiance : moyenne.

### GP2-N02 · MINEUR · `Corps.empile` peut produire un élan NaN
- Où : figures.js:207 (Corps.empile), :244-245 (Corps.pas).
- Quoi : `rem=m.tours*6.2832+PHY.eps-m.th` ≤ 0 si dépassement > tours+1 → `m.acc` négatif/Infinity → `Math.sqrt(2*m.acc*rm2)` NaN → quaternion de la caisse NaN, caméra suit. Le filet NaN de boucle-6:125 ne couvre pas le vol (= GP-05).
- Correction proposée : `rem=Math.max(.3,rem)` avant m.acc ; dans pas : `if(!(m.acc>0))m.acc=…`.
- Confiance : basse.

### GP2-N03 · MINEUR · dbgGenBilan1 : ReferenceError `genParis` (piste-prebati.js:95, crochet de banc). Retirer la branche.

## C. Identifiants non déclarés (acorn, vraies portées)
Aucun dans le domaine. Globales du navigateur et de scripts externes : FIG (gardé `window.FIG&&`), POUCE_JEU, MUSBUS, apresPolice (debut-corps.html:52), EDITION, CASHCAR_BUILD, CC_BUILD, CC_PHOTOS, CC_VER, CCSON (à vérifier typeof : non fait), adBreak/adConfig (try sous ADS.on), DOL_*/SINGE_*/singe*/mkDauphin/vitrailPrepare (creatures/*.js), dbg* (banc). Vraiment non déclaré : `genParis`.

## D. États non remis à zéro
| état | remis par | manquant à |
|---|---|---|
| FLOW.lv / FREN.tr / FREN.k | flowReset (mort.js:274), runxReset, frenFin(true) endGame:489 | QUITTER : FLOW.lv reste à 4 jusqu'au resetGame ; sans effet visible |
| pwr*T | resetGame:383, endGame:510 | portail : gardés (voulu) |
| fallT en vol | — | remis à 0 à la fin d'AIR MAX (GP2-N01) |
| CAMV/shake/FX2.corps | resetGame:390 | chanceRepart : sans effet |
| POSE_F/hopY/frCoupe/DMT | respawn | newTrack0 (1er agent) |
| GH (caisse-nuage) | fantomePrepare, campStop | GH.line figé si la piste change (zones-caisses.js:202) ; inerte (EVT_ON éteint) |
| VOLR.on | volrSuit | état au portail non vérifié |
| safeS négatif | — | GP-18 |
| engTier sous le départ d'avance après seconde chance | — | GP-24 |

## E. Non vérifié
Libellés exacts GP-14..36 ; aucune exécution ; fruits-nouveaux/pickups-fruits survolés ; evenements-rares.js après l.120 ; boucle-6-hud.js l.70-118 ; GP-32 ; TDZ ; typeof des globales CC_* ; figures lancées pile à la mort.
