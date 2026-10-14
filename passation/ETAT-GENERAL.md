# ÉTAT — session GENERAL (2026-10-14, fin de fil)

## Rôle
- Intégrateur des idées de Léo : relire ses commits quand il pousse, signaler à PILOTAGE, corriger ce qu'on me confie.
- Worktree : `C:\Users\sacha\Documents\GitHub\CCG-pop`, branche `boutique-pop`, poussée en `boutique-pop:main`.
- Protocole : fumée `CC_QUI=GENERAL node C:\Users\sacha\cc-banc\fumee.cjs "<VERSION PRINCIPALE>"` sur la branche fusionnée,
  puis `cc-push.lock` (merge, syntaxe, `sh garde-burnout.sh`, push, recopie via `git archive`), puis « POUSSÉ <sha> » à PILOTAGE.
  Cache sw.js = main + 1. Bancs : uniquement par `C:\Users\sacha\cc-banc\lib.cjs` (file, passe-droit, 2 créneaux).

## Livré dans cette poussée (cache v387)
- AUTO-ÉCOLE v2 : 6 étapes dont FIGURE (double-tap), carte animée, passée en charte 6 (bloc `ecoleV2`, `html.c6`).
  Banc couché FR et debout EN : 0 erreur, permis +500.
- Revue de Léo, points 7 (eau du Soleil de jade), 13 (billet ₿ sans CRYPTOCITY), 14 (FLOW.poseA avalé, nitro éteinte à endGame).
- Code cousin : ne débloque plus rien de payant en € (`carEuros`).
- SECONDE CHANCE (bloc `CHANCE`, section du JOURNAL) : moteur, prix, comptabilité, bouclier.
  Banc `scratchpad/pop/chance.js` : tout passe, 0 erreur.

## En attente des autres
- INTERFACE pose la plaque `#mChance` dans #mDead. Contrat : `chanceEtat()` → {ok, prix, reste}, `chanceJoue()`,
  l'événement `cc:chance` sur document. Sans plaque, l'offre existe mais ne se voit pas.
- IDEE (FINAL SPIN, machine à sous après la mort) : il passe APRÈS l'offre. Lui donner `chanceAttend()` (vrai tant que l'offre
  est à l'écran), `chanceRefuse()` et `cc:chance`. Sa spec n'est pas encore arrivée.
- GAMEPLAY : barème validé (k 0,5 → 0,8, moteur −1). Mon calcul : pour un bon joueur, −18 % / +25 % / +65 % de revenu par
  minute s'il survit 2 / 4 / 6 min de plus après la reprise. GAMEPLAY visait moins de +25 %. À lui renvoyer si besoin.

## Suite possible
- Auto-école dès le 1er toucher sur une installation neuve, et accord avec INTERFACE sur l'écran titre (idée PILOTAGE/IDEE).
- Relire les nouveaux commits de Léo à sa prochaine poussée.
- Scripts utiles (dans C:/Users/sacha/AppData/Local/Temp/claude/C--Users-sacha-Desktop-CAR-CRASH/52b9efb2-3c29-42df-8585-721be6ee2ebb/scratchpad/pop) : `tuto2.js` (banc auto-école), `chance.js` (banc seconde chance).
