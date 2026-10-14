# ÉTAT — session IDEE (2026-10-14, 16 h 45)

## Fait et poussé
- main a34aa1d : CARRIÈRE coupée (`SANS_CARRIERE`, `?carriere=1`) + MODE FACILE coupé (`SANS_FACILE`, `?facile=1`).
  Détail : « PLUS DE CARRIÈRE + PLUS DE MODE FACILE » en tête de `VERSION PRINCIPALE/JOURNAL.md`.
- La carrière d'avant : branche `garde/carriere` (= 3ca83ec). Branche de travail : `sans-carriere-assemblage` (= main).
- Recopié dans Téléchargements ; fumée commune OK couché + debout.

## Envoyé à PILOTAGE (idées, déjà réparties)
- Tour 1 : Game Center, demande de note, partage, événements rares tirés de la carrière, récompense quotidienne,
  écran de fin court (stats à zéro), 1er lancement direct, RÉGLAGES collé au logo, descriptions des 2 caisses.
- Tour 2 (concurrents) : seconde chance, cadeau toutes les X h, améliorer sa caisse, missions → multiplicateur à vie,
  tirage de fin de partie, carte du jour.

## À faire (ordre de PILOTAGE)
1. LE FINAL SPIN (ordre de Sacha, quiz 14 h 50) : machine à sous façon Jetpack Joyride, jetons rares sur la route (0-3 par
   partie, souvent 0), pas de jeton = pas de machine ; après la SECONDE CHANCE de GENERAL ; `?spin=0`.
   Envoyer la SPEC à SON, INTERFACE (PAUSE-FIN), GRAPHISME, GAMEPLAY, GENERAL AVANT de coder. Rien n'est commencé.
2. Testeur QA entre deux vagues : `scratchpad/qa.js` (4 formats, FR/EN, textes rognés, touches qui se chevauchent).

## Outils (scratchpad de la session, non versionné)
- Banc : passer par `C:/Users/sacha/cc-banc/lib.cjs` (`_verrou.prend/rend`) ou `fumee.cjs` ; jamais de verrou maison.
- Piège : la copie de travail peut repasser en CRLF → `git diff --stat` avant chaque commit (repasser en LF en binaire).
- Piège : la ligne `CACHE` de sw.js est en conflit à chaque fusion → repartir de celle de main, +1, commentaire en tête.
