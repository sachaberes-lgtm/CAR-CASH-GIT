# Banc de cadence (15 / 30 / 60 / 120 i/s) — état en cours

## Déjà fait (aucune mesure de jeu encore)
- Horloge pilotée : `preuves/banc-cadence/horloge.js` remplace `performance.now`, `Date.now`, `requestAnimationFrame` avant le chargement ; `__V.go()` fige le temps, `__V.tick(n, ms)` avance de `ms` exactement. Le rendu est neutralisé (`dbgScene().rdr.render`) en course : la mesure ne dépend pas de la charge du Mac.
- `preuves/banc-cadence/pilote.mjs` (Chrome sans fenêtre 9742, serveur 8842, muet, `?fps=0&tel=1&garde=1&intro=ancien&attente=0`), `lance.sh` (verrou commun + charge < 40), `lib.js` (départ identique à 60 i/s, puis cadence testée), scénarios `pilote-auto.js` (course au pilote auto 45 s) et `controle.js` (virage, freinage, départ arrêté, sauts, nitro, pouvoirs, flow, frénésie).
- Piège trouvé : `window.__gameReady` est vrai avant que les crochets `dbg*` existent ; le banc attend `typeof dbgJouer==='function'`.
- Code lu : `dt = min((now-last)/1000, .05)` (boucle-1.js:20, GP-02 confirmé par lecture : au-dessous de 20 i/s le temps de jeu ralentit) ; plafond 60 i/s `fpsSaute` (cadence.js) : un écran 120 Hz calcule à 60 ; cadence 30 : une image sur deux. Suspect à mesurer : `off.lerp(cibleOff, dt*16)` (boucle-3-physique.js ~l.200) = lissage d'Euler, retard dépendant de dt.

## Reste à faire
Mesures sur nuages, canyon, banquise, jade × 3 graines, puis tableau et écarts.
Remarque : j'ai, par erreur, exécuté `verrou-banc.sh rendre` une fois alors que le verrou appartenait peut-être à une autre session (« gabarits »).

## Reprise du 10/11 après libération du disque (aucune mesure de jeu non plus)
- Processus 76888/77346/Chrome 9742/serveur 8842 tués, verrou rendu, profils Chrome temporaires supprimés.
- Conditions de lancement jamais réunies : charge 160-190, `gab.cjs` (9741) et deux autres Chrome (9842, 9935) en même temps. Je n'ai pas relancé de lot (règle : gab.cjs absent, <= 2 ports, uptime < 60).
- Problème ouvert du pilote : après chargement (`__gameReady` vrai, fenêtre « complete »), `typeof dbgState` et `dbgJouer` restent « undefined » avec ma configuration (UA bureau, sans toucher/iPhone, horloge pilotée, `&tel=1&simu=1&fps=0`). Les crochets sont pourtant définis sans condition dans ciel2.js:284 (index.html:51780). Cause non trouvée : soit une exception avant cette ligne (pilote.mjs journalise désormais les exceptions : `EXC ...`), soit mon horloge (rAF remplacé). À tester d'abord : `NOHORL=1 node pilote.mjs diag.js nuages 1 60`. gab.cjs/course.cjs, eux, atteignent dbgState avec UA iPhone + `Emulation.setTouchEmulationEnabled` + sauvegarde plus riche : s'en inspirer.
- Commit servi à ce moment : 55b5a45e (PV-04).
- Théorie PG-01 déjà chiffrée dans preuves/preuve-pose-cadence.cjs (à confirmer par la mesure).
