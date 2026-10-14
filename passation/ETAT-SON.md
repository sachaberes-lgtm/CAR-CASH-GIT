# ÉTAT — SON (14/10, ~17 h 10, PC de Sacha) — passation avant de vider le fil
Lire aussi `passation/SON.md` (la passation du Mac : mission, règles, décisions de Léo, tests) — toujours valable.

## OÙ
- Worktree : `C:\Users\sacha\Documents\GitHub\CCG-son-integration`, branche `son-integration` = origin/main **6f1b542** (cache v390).
- Chef : session PILOTAGE (messages SEULEMENT pour « POUSSÉ <sha> » ou blocage ; 1 agent sonnet effort low/medium, sans banc dedans).
- Pousser sur main : fumée commune AVANT le verrou (`CC_QUI=SON node C:\Users\sacha\cc-banc\fumee.cjs "<worktree>\VERSION PRINCIPALE"`),
  puis `mkdir C:\Users\sacha\cc-push.lock` (+ owner.txt) → fetch + merge origin/main → syntaxe (`node passation/preuves/syntaxe.cjs`)
  + `sh garde-burnout.sh` → sw.js cache +1 → `git push origin son-integration:main` → `git archive HEAD | tar -x -C
  "/c/Users/sacha/Downloads/CAR-CASH-GIT-main/CAR-CASH-GIT-main"` → rendre le verrou → « POUSSÉ » à PILOTAGE. Nouvelle fumée seulement si conflit.
- Banc : UNE bibliothèque `C:\Users\sacha\cc-banc\lib.cjs` (file équitable, 2 créneaux, Chrome muet) ; crochet `dbgMusAp()` pour la musique.

## FAIT AUJOURD'HUI SUR LE PC (tout est sur main 6f1b542)
- Curseur MUSIQUE : 1,4 s de musique au relâcher (`musApercu`, bloc `MUSAP` de musicTick) — au ciel niveau garage, en pause le morceau
  repart puis se rendort. Banc muet OK.
- Sons cuits : `singe.troupe`, `caisse.atchoum`, `aura.moyenne` ; matières de tour des FIGURES v2 `fig.tonneau` / `fig.toupie` / `fig.salto`
  (branchées par GAMEPLAY : `figMat(mm.a)` dans figPose, repli `fig.vrille`). Banque `?v=17`.
- Banque sans les 4 sons du BOUCLIER ; `cuire.js` : liste `RETIRES` + filtre qui n'échappe plus deux fois un point.
- POSE DIVINE = tchak une quinte plus haut. Figure finie `fig_*` = `fig.maillon` (plus la vrille rejouée).
- Ciel : iPhone sans MUS_WA → lobby muet au ciel (comme la boutique) ; SON coupé → pas de MUS_CIEL. Sourdine de l'atelier réappliquée
  aux boucles nées en boutique (`bqAtelierSourdine`).
- Relu sans défaut : barre d'onglets d'INTERFACE (ui7/nav) et ui-integration (un geste = un son, 'onglet' partout).

## SUITE (par priorité)
1. Écoute iPhone MUS_WA par Sacha : PILOTAGE a les 5 lignes ; si KO → `localStorage.cc_muswa='0'` / `MUS_WA_ON=false`.
2. À l'oreille : niveau des matières de tour (vol −8 dans figPose) ; figJet consomme `echSt()` toutes les 0,28 s pendant le tenu
   (GAMEPLAY lui donne son propre compteur si ça monte trop haut).
3. Relire les sons des prochains écrans d'INTERFACE quand elle envoie un SHA (un geste = un son, même son pour le même geste).
4. Idées en attente (ajouts = à PROPOSER, pas à faire) : habillages POP muets ; LE DOGE muet (zone voitures gelée).
5. Mineurs connus : écran de fin (5 sons proches, composés exprès — à l'oreille seulement) ; `pose.parfait` sans variation de série.

## PIÈGES
- `//` en milieu de ligne avale la suite (mes scripts) → `/* */`. Commit par hunks : `git diff -U0` + `git apply --cached --unidiff-zero`.
- Un banc arrêté (TaskStop) peut laisser SON verrou : vérifier owner.txt + pid mort avant de le rendre.
- Ne jamais tuer un processus d'une autre session.
