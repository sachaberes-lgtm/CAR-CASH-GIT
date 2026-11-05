# Passes et lectures de la puce par image (C4, 2026-11-05)
Banc : `python3 outils/banc-perf/passes.py [paliers] [carte:météo …]` (iPhone émulé, CPU ×4, 5 s de course, `bindFramebuffer/readPixels/getBufferSubData/fenceSync/clientWaitSync` piégés). Moyennes sur TOUTES les images du navigateur (le jeu en dessine une sur deux : cadence 30) ; machine chargée → seuls les compteurs comptent.
Image dessinée au p0 : scène (composer) → ombre → [passe lisse du ciel] → scène → écran = 4 cibles distinctes (3 sans la passe lisse : canyon, jade, ville-nuit).

| map (p0) | fb distincts/image AVANT | APRÈS | lectures AVANT/APRÈS |
|---|---|---|---|
| nuages | 2,02 | 1,74 | 0 / 0 |
| ville (pluie) | 1,99 | 1,86 | 0 / 0 |
| forêt | 2,00 | 1,82 | 0 / 0 |
| canyon | 1,49 | 1,56 (bruit : pas de passe lisse) | 0 / 0 |
| p2 ville, forêt | 12,96 / 12,96 | 12,94 / 12,95 | 0 / 0 |
(p2 nuages/canyon APRÈS plus bas : la qualité adaptative a coupé des passes sous charge ; `PAL.b('cielImg')` vaut 1 au p2, branche identique à avant.)

Constats : **0 lecture synchrone par image** sur les 4 maps aux 2 paliers (la sonde `qlSonde*` n'est armée qu'en série de 5 images ; `readPixels` de `musique-frenesie.js:493/504` = `dbgPlanetLook`, outil de banc ; `dunes-2.js:505`, `canyon-mine.js:249`, `jade-vol.js:366/388`, `vignette-moteur.js` = chauffe/banc/écran d'attente).
Fait : passe lisse du ciel (`rendu/ciel2.js`, `PAL.B.cielImg=[2,1,1]`, `?cielimg=0`) une image sur deux au p0.
Reste (non touché) : ombre 1024 + scène composer + écran = 3 cibles incompressibles tant que ACES passe par le composer (couleurs intouchables) ; l'objectif « 2 passes » n'est donc atteint qu'avec le canyon (pas de passe lisse) hors écran final.
