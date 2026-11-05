# DEBUG-TOTAL — passe de débogage ultra approfondie (2026-11-05, Fable/Opus, à la demande de Sacha)

Mission : « une session de debugging ultra approfondi qui servira pour la version mobile, PC et tout, qu'on puisse faire ce qu'on veut
du code sans jamais avoir de problème » — puis : « concentre-toi particulièrement sur le son et les musiques, on a souvent des soucis ».

- Branche `debug-total` (worktree `/Users/sachaberes/cash-car/debug-total`), partie d'`origin/main` ac6cc6cb (v1152).
- Serveur local : `.claude/launch.json` → `cashcar-debug-total` (port 8830, `VERSION PRINCIPALE/`).
- **Fumée du son en une commande** : `node outils/banc-son/fumee-son.mjs [--fois 5] [--course 30] [--url "&colonne=portrait"] [--w 390 --h 844] [--mobile]`
  (Chrome sans fenêtre, son muet mais contexte VIVANT, sauvegarde MUSIQUE+EFFETS+VOIX allumés ; sonde `outils/banc-son/sonde.js`).
  Accueil → JOUER → course → arrière-plan 3 s → retour → mort → REJOUER → course → mort → accueil ; VERT = un seul AudioContext,
  au plus une musique (jamais deux fois le même morceau), liaisons audio stables d'une course à l'autre, 0 erreur console, 0 promesse rejetée.

## Tableau des bugs

| id | zone | symptôme | cause racine | correctif | commit | preuve | plateformes | vrai iPhone ? |
|---|---|---|---|---|---|---|---|---|

## À vérifier sur un vrai iPhone

## Pièges pour les prochaines modifs

## Journal de session
