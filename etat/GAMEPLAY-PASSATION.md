# GAMEPLAY (passe SENSATIONS) — PASSATION (14/10, 2 h 30)
## Les ordres de Sacha (ce fil)
1. « Sur mobile le joystick n'est pas assez sensible, améliore UN PETIT PEU la sensibilité. »
2. « Sans changer radicalement le gameplay, en se focalisant sur le fun et les sensations, rajoute des petits détails : conduite, vol,
   animation, bumps, collisions, explosions, l'eau (entrée, sortie, flottaison)… jouissif sur mobile. » 3. « Mon ordi a surchargé, reprends molo. »
## Chantier
`~/cash-car/sensations/` · worktree `integ` · branche `sensations-integration` (= assemblage T0 `0c1ecee` + mes commits). LIRE `sensations/BRIEF.md`
(les lois : gameplay verrouillé, outils `SENS` / `sensCoup` / `sensHap` / `sensSecoue`, rejets, perf, sûreté), `sensations/SONS.md` (201 sons), `sensations/notes/*.md`.
Outils : `sh banc/copie.sh <id>` (copie privée d'agent), `sh banc/verifie.sh <id|integ>` (syntaxe + noms non déclarés + burn-out), `sh banc/integre.sh <id>`,
`node banc/volant-sim.cjs "<index.html>"` (banc du volant). Journal commun : `debug/journal-correctifs.tsv` (préfixe `gameplay`).
## FAIT (tout commité, VERIF OK, AUCUN test navigateur encore)
- `SENS` (`?sens=0` = le jeu d'avant) · VOLANT : braquage plein 46 px (54), haut 38 px, lissage pouce τ 30 ms, `?volant=NN` pour essayer ; drift inchangé (mesuré au banc node).
- Outils communs + `dbgSens()` · CHOCS AU SOL (pad, dos d'âne, retombée, plot, flaque, frôlé) · EAU (bouchon à flot, bouillon, creux du plongeon, caisse trempée)
- EXPLOSION (agent, relu) : débris qui gardent l'élan, rebonds sonores + étincelles, braises qui rebondissent, mort contre un pic.
## RESTE (un agent à la fois, 20 min, copie privée, je relis le diff puis `integre.sh`)
1. POSE + ENVOL — en cours (agent `pose`) : `tryLand` (touche9 / POSE_F, BUMP), `landBoom`, `poseParfaiteFx`, `startFall`, bloc 'fall' de `loop` (roues, vent `ventN`). Caméra de vol INTERDITE.
2. GLISSE : `driftTick`, power-slide (`driftYaw`, `glisse9`), `frondeLache`. 3. NITRO : `nitroAllume`, `nitroEteint`, `blowOff`, passages de rapport, `vpalTick`.
4. RAMASSAGE : `pickupsTick` (pièces, fruits, cristaux). 5. PASSAGES : `updateClouds` (dedans), `portailPasse`, `respawn`, départ.
6. CARROSSERIE au sol : bloc roulis / tangage / `susY` de `loop` (squat, plongée, roues avant qui braquent).
## AVANT LE TRAIN T1 (3 h 45)
UNE fumée par le sémaphore commun sur `sensations/integ` (servir `integ/VERSION PRINCIPALE`, `node ~/cash-car/debug/banc/fumee.cjs <port> couche,debout`), plus `?play=jade`.
À dire à Sacha à la fin : lien de test local + `?sens=0` pour comparer ; rien n'est poussé ; le ressenti n'a été jugé qu'à la lecture du code.
