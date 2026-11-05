# PASSE PERF MOBILE 2 — état au 5/11/2026 (branche `perf-mobile-2026-11`, base main 846460c6, cache v1117)
Référence : `docs/superpowers/plans/2026-11-04-optimisation-mobile.md` (tâches, contraintes §1, outils §3). Rien n'est poussé ; la fusion dans main attend le OUI de Sacha.

> **Cible = l'app iOS ; A3 et A2.f (cache Vercel) hors cible.** ⚠ `origin/main` a avancé de 266 commits depuis 846460c6 et contient déjà une partie d'A1 (serpent de chargement, ciel lié en doux) et son propre `jeu.<hash>.js` immuable (≈ A3) : `git merge origin/main` dans cette branche donne 7 conflits (vignette-moteur.js, ciel2.js, vercel.json, vercel-build.sh, garde-demarrage.cjs, index.html, sw.js) — essayé et abandonné le 5/11 ; à REPRENDRE : repartir de main, ne rejouer que A1.c (tranches) et A1.d (niveau neuf), A3 est dépassée.

## Fusionné
- **T0 — banc** : `garde-perf.py --palier N --tel --json`, `demarrage.py` (touche dès 0,5 s : film lancé / `cc:revele` / menu / gel PRESENTS), `compare.cjs` (tolérances 2 appels / 2 %), `relais.py` + `?perf=1&relais=` (vrai téléphone).
  Bases : `outils/banc-perf/mesures/2026-11-04-base-p0/p1/p2.json`, `-demarrage-p0.json` (lecture des compteurs à instant fixe ; `?pistegraine` fixe aussi les pistes d'avance).
  ⚠ Reproductibilité d'un banc à l'autre : seules nuages, ville, jade tiennent ±2 / ±2 % ; les 8 autres maps = décor non graîné → capture A/B au pixel en plus (voir `mesures/LISEZMOI.txt`).
  Démarrage à froid p0 ×4 (charge ~7) : menu touchable 18,9 s, film lancé 9,3 s, 41 tâches > 50 ms, ScriptDuration 14,0 s, gel caché par PRESENTS 0,5 s.
- **A3 — cache HTTP** : jetons sha au build, règles immuables `vercel.json`, garde. Preuve : 2e lancement = 0 requête réseau sur les 11 fichiers (en-têtes simulés en local).
- **A1 — démarrage** (6 commits, À PRENDRE EN ENTIER) : chauffe du niveau neuf en tranches sous le voile du JOUER (pire image du JOUER p0 867 → 233 ms, médiane ~350 → ~150) ; menu 507 images/10 s contre 531 avant.
  Interrupteurs `?chauffeniveau=0` `?lierboule=0` `?tranche=0` `?cielchauffe=tete`. NON FAIT : vérification p2 (capture au pixel + dbgCout) et preuve que la simulation n'avance pas sous le voile retenu (≤ 700 ms) ; liaison sous la boule non jugée (ne se voit que sur Metal à froid → iPhone).
- **B1** (banc `jouer.py`, `dbgPick`) et **C1** (`hud-profil.py`) : CLOS SANS OBJET, mesurés (départ d'avance pris 16/16, `newTrack` 20-99 ms ; HUD ~1,6 ms/s).

## Non fait
- **Fumée après A1** : `jade:midi` p0 = 1 compilation en course (base : 0) ; A/B avec A1 coupé IMPOSSIBLE (charge 200 : portail non franchi en 80 s, 15 compilations) → NON TRANCHÉ, à refaire machine calme.
- **C2** : close sans gain (égalité des collisions non prouvée, changement annulé), NON FUSIONNÉE. **App iOS** : construction Xcode non faite (commit WIP + merge dans ios-capacitor refusés par l'autorisation ; construire depuis `integ/app-ios` après rebase sur main). **13 Pro** : relais prêt (`python3 outils/banc-perf/relais.py`, URL dans son journal), aucune donnée reçue → à faire (Sacha touche l'écran).
- Restent, plan comme référence : **A2** (chargement sous la boule, après A1), **B2** (portail jade), **B3** (autres portails), **C3** (nommer les maillages puis budgets p0), **C4** (passes/lectures), **C5** (gouverneur thermique), **D1** (mémoire), **E1** (CSS publié).
- Avant de fusionner dans main : garde-perf p0 ET p2 avant/après enchaînés, machine calme (charge < 8 ; elle était à 200-330 le 5/11), fumée couché/debout (JOUER, REJOUER, portail), `cd app-ios && npm run sync` sans « motif introuvable ».
