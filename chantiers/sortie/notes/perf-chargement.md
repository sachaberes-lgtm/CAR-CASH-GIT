# perf-chargement — le démarrage, les à-coups, la compatibilité iOS 15 (passe de sortie, 2026-10-13)

Branche `sortie2/perf-chargement` · copie `$R/wt/perf-chargement` · bancs `$R/banc/perf-chargement/` · captures `$R/shots/perf-chargement/`

## Bancs (permanents, dans `$R/banc/perf-chargement/`)
- `gz-serveur.cjs <racine> <port>` : serveur statique AVEC gzip (comme Vercel) — index.html 5,4 Mo → 1,9 Mo au fil ; sons-banque.js 3,5 → 2,26 Mo.
  Lancé sur :8217 (sert ma copie).
- `outils.cjs` : ouvre un Chrome (même sémaphore que lib.cjs) avec réseau simulé (`net:'4g'` = 9 Mbit/s, 85 ms ; `'4glent'` = 1,6 Mbit/s, 150 ms)
  posé AVANT la navigation, et une SONDE injectée au tout début de la page : chaque image (rAF), les longues tâches, les étapes du jeu
  (`__gameReady`, `__intro` 'attente' → 'joue' → null, splash dans le DOM, DOMContentLoaded, load), chaque `linkProgram` (programme de la
  puce), l'attente au verdict de lien (`getProgramParameter` > 1 ms) et chaque envoi de texture (`texImage2D`…).
- `demarrage.cjs [--profil] [--tag x] [--cpu 4] [--net 4g|non] [--port 8217]` : le démarrage chronométré + profil par phase.
- `ios15.cjs <dossier>` : le crible iOS 15 (API JS et CSS absentes de Safari 15.x), fichier:ligne + extrait.

## Mesures
(en cours)

## Compatibilité iOS 15 (iPhone 7 = iOS 15.8 au plus)
(en cours)

## Service worker / mise à jour
(en cours)

## POUR LES AUTRES
(en cours)
