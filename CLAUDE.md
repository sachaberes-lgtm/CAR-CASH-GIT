# CAR-CASH-GIT — à lire avant tout (Sacha et Léo, toutes les sessions)

Le jeu web vit dans `VERSION PRINCIPALE/` : un seul fichier, `index.html`. Son guide complet est `VERSION PRINCIPALE/CLAUDE.md`, à lire
avant d'y toucher. `ROBLOX/` est un autre jeu, le portage Roblox : un commit ROBLOX ne change pas le jeu web.

## LA VERSION DE RÉFÉRENCE (2026-10-01, Léo : « toutes les discussions où j'évoque une version récente, je parle de celle-là — et qu'on soit à jour avec ça, sans tout casser, parce que la dernière fois ça a tout cassé »)
- Quand Léo (ou Sacha) dit « la version récente », « la nouvelle version », « la dernière », « celle de ce soir » ou « la bonne », il parle
  du JEU WEB DE `main`, dossier `VERSION PRINCIPALE/`. C'est celui que Vercel publie à chaque push sur `main` :
  **https://car-cash-git.vercel.app/jouer/**
- **Son socle figé, c'est l'étiquette git `jeu-reference-2026-10-01`** (commit `c02c75a`). Léo y a joué et l'a validée le 2026-10-01 au soir.
  Tout ce qui vient après sur `main` doit être bâti DESSUS : on ne repart JAMAIS d'avant.
- **Ce qui n'est PAS la référence** (ne jamais en repartir, ne jamais les fusionner par-dessus `main`) :
  · les vieilles branches : `version-leolei-2026`, `version-fusion-2026-09`, `fusion*`, `dev`, `v3-*`, `paris`, `campagne-nuages`, `appstore-backlog`… ;
  · `gh-pages` : GitHub Pages, arrêtée au 03/09 ;
  · le dossier `version-leolei-2026/` à la racine : l'archive de la branche de Léo, 28/09 ;
  · `AUTRE VERSION/` : l'édition PC, gelée depuis le 25/09 ;
  · toute copie locale, tout zip, tout lien githack figé sur un vieux commit.
- **Pour savoir quelle version tourne** : ouvrir ⚙ RÉGLAGES et lire la ligne du bas, « VERSION xxxxxxx ». Sur l'ordi, elle est aussi sous
  le téléphone. C'est le commit publié par Vercel ; une copie locale affiche « VERSION LOCALE ».
  ⚠ Ce numéro change aussi quand seul ROBLOX a bougé : le jeu web est alors identique. Pour voir si le JEU a changé depuis la référence,
  lancer `git log --oneline jeu-reference-2026-10-01..origin/main -- "VERSION PRINCIPALE"`.
- **Ce que contient la référence**, pour la reconnaître :
  · le menu de SACHA par défaut (`?menu=leo` = celui de Léo), posé sur l'écran titre v3 : la caisse tombe dans un ciel de cumulus et
    on tourne la caméra autour d'elle au doigt ;
  · les niveaux NUAGES (nuages v8) → VILLE → PARIS → ORBITE → ORAGE → MINUIT EN VILLE → PLUIE DE SATELLITES ;
  · NITROOO et son DRAGON DE PAPIER (v7), la DARK TRIAD en noir ;
  · LA LOI DU RÉSERVOIR : plus de nitro infinie, et la chaîne d'aura qui se ferme ;
  · la pose déboguée et le bord sans « clic » (le correctif de Léo, porté) ;
  · sur l'ordi, l'iPhone 13 Pro de Sacha couché (844 × 390), avec son boîtier, son encoche et le bouton PORTRAIT ;
  · la MISE À JOUR TOUTE SEULE et le numéro de version dans les réglages.
- **SANS TOUT CASSER** — la règle de chaque session, avant de pousser :
  1. Partir de `origin/main` À JOUR : `git fetch origin main`, puis `git merge origin/main`. Jamais d'une vieille branche, jamais d'une copie locale.
  2. Sur `main`, on FUSIONNE. Jamais de `push --force`, de `reset` ni de revert du travail de l'autre ; dans un conflit, on garde les deux.
  3. Avant chaque push, le jeu doit démarrer SANS ERREUR et la partie se lancer (menu → JOUER → course) : sur téléphone couché ET
     debout, et dans le cadre de l'ordi.
  4. Ne jamais rebasculer un choix tranché (menu de Sacha par défaut, réglages de jeu validés…) sans l'accord de Sacha ET de Léo.
  5. Si une publication casse le jeu :
     - **le rendre tout de suite** : Vercel → Deployments → la publication de `c02c75a` (ou du dernier commit qui marchait) → « Instant
       Rollback » ou « Promote » ;
     - **trouver ce qui a cassé** : `git diff jeu-reference-2026-10-01 origin/main -- "VERSION PRINCIPALE"` ;
     - **réparer sur `main`** par un NOUVEAU commit.
- **Changer de référence** : seulement quand Léo ou Sacha le demande. On pose une nouvelle étiquette `jeu-reference-AAAA-MM-JJ` (une
  étiquette ne se déplace pas) et on met à jour ce paragraphe ainsi que celui de `VERSION PRINCIPALE/CLAUDE.md`.
