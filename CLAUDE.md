# CAR-CASH-GIT — à lire avant tout (Sacha et Léo, toutes les sessions)

Le jeu web vit dans `VERSION PRINCIPALE/` : un seul fichier, `index.html`. Son GUIDE est `VERSION PRINCIPALE/CLAUDE.md`, à lire
avant d'y toucher ; le détail de chaque chantier est dans `VERSION PRINCIPALE/JOURNAL.md` (l'ancien CLAUDE.md, depuis le 14/10). `ROBLOX/` est un autre jeu, le portage Roblox : un commit ROBLOX ne change pas le jeu web.
**L'édition POKI** (2026-10-04) n'est pas un autre jeu : c'est `VERSION PRINCIPALE` sans missions, carrière ni boutique, avec le SDK de
Poki. `node poki-construire.js [crazy|itch]` en tire `POKI/`+`POKI.zip`, `CRAZY/`+`CRAZY.zip` (CrazyGames) ou `ITCH/`+`ITCH.zip` (itch.io, sans kit) — ignorés par git, à refaire après chaque changement du jeu ; `?poki=1` (`?crazy=1`)
la montre sur n'importe quelle copie. Le détail : « L'ÉDITION POKI » dans `VERSION PRINCIPALE/JOURNAL.md`.

## ⚠ LE BURN-OUT EST À LÉO (2026-10-07, Léo : « quand Sacha fait des trucs qui suppriment mes changements, code un truc qui bloque ; remets mon burn-out »)
- Le BURN-OUT du garage (doigt tenu 0,8 s sur la caisse : le PREMIER burn-out — fumée en gros pixels, dérapage au ressort —, donut au doigt, cubes
  blancs — `BURN`, `DON`, `burnPart`, `burnGeste`, `burnDerape`, `burnCubes`, `BURN_TENU`, `BURN_FS_FUM`…) est le travail de LÉO. **On ne le supprime pas, on ne le remplace pas, on
  ne l'écrase pas en fusionnant une vieille copie.** Pour le changer : demander à Léo d'abord. En cas de conflit de fusion dans ce bloc,
  garder la version de `main` (celle de Léo).
- **DEUX GARDES** : (1) `garde-burnout.sh` (racine) — appelé en premier par `vercel-build.sh` : une version sans le burn-out n'est PAS
  publiée, la construction Vercel échoue et le site garde la version d'avant (rien n'est perdu ; `GARDE_BURNOUT=0` dans les variables de
  Vercel la coupe). (2) sur l'ordi de Léo, le crochet `pre-push` du dépôt (partagé par tous les worktrees `CAR-*`) refuse une poussée sur
  `main` sans le burn-out (`git push --no-verify` pour passer outre). Vérifier à la main : `sh garde-burnout.sh`.
- **LA GARDE DE LA CHARTE** (2026-10-14, Sacha) : `garde-charte.sh` (racine), appelée par `vercel-build.sh` juste après `garde-burnout.sh`. Elle refuse
  quand (a) le LOGO de l'accueil change (empreinte sha1 des lignes `.lg`/`.mTitle .lg`/balises `class="lg …"`, celui de `92cb2bb`), (b) la police pixel
  disparaît (`--pix:'Press Start 2P'`, @font-face, woff2, ou moins de 90 % des emplois `var(--pix)` d'aujourd'hui) ; la charte 6 (noir et blanc) est retirée du code le
  18/10 (allègement), son contrôle aussi. `GARDE_CHARTE=0` la coupe. Changement VOULU du logo : `sh garde-charte.sh --empreinte`, puis mettre
  `EMPREINTE_LOGO` à jour dans le même commit. Vérifier à la main : `sh garde-charte.sh`.

## LA VERSION DE RÉFÉRENCE (2026-10-01, Léo : « toutes les discussions où j'évoque une version récente, je parle de celle-là — et qu'on soit à jour avec ça, sans tout casser, parce que la dernière fois ça a tout cassé »)
- Quand Léo (ou Sacha) dit « la version récente », « la nouvelle version », « la dernière », « celle de ce soir » ou « la bonne », il parle
  du JEU WEB DE `main`, dossier `VERSION PRINCIPALE/`. C'est celui que Vercel publie à chaque push sur `main` :
  **https://car-cash-git.vercel.app/jouer/**
- **Son socle figé, c'est le commit `c02c75a`** (`c02c75a20910bd8c2b3aa0596886b3e17cee4a79`), qu'on appelle `jeu-reference-2026-10-01`.
  Léo y a joué et l'a validé le 2026-10-01 au soir.
  ⚠ L'étiquette git de ce nom n'existe que si quelqu'un l'a posée depuis un ordi : la session cloud n'a pas le droit de pousser
  une étiquette (refus 403). Pour la poser : `git tag -a jeu-reference-2026-10-01 c02c75a -m "reference"`, puis
  `git push origin jeu-reference-2026-10-01`. Dans les commandes ci-dessous, `c02c75a` marche dans tous les cas.
  Tout ce qui vient après sur `main` doit être bâti DESSUS : on ne repart JAMAIS d'avant.
- **Ce qui n'est PAS la référence** (ne jamais en repartir, ne jamais les fusionner par-dessus `main`) :
  · les vieilles branches : `version-leolei-2026`, `version-fusion-2026-09`, `fusion*`, `dev`, `v3-*`, `paris`, `campagne-nuages`, `appstore-backlog`… ;
  · `gh-pages` : GitHub Pages, arrêtée au 03/09 ;
  · les dossiers `version-leolei-2026/` (l'archive de la branche de Léo, 28/09) et `AUTRE VERSION/` (l'édition PC, gelée depuis le
    25/09) : RETIRÉS du dépôt le 2026-10-18 (Sacha, allègement) ; ils restent dans l'historique git, étiquette `avant-allegement-2026-10-18`.
    `node synchro-versions.js` refabrique l'édition PC en local si besoin (ignorée par git) ;
  · toute copie locale, tout zip, tout lien githack figé sur un vieux commit.
- **Pour savoir quelle version tourne** : ouvrir ⚙ RÉGLAGES et lire la ligne du bas, « VERSION xxxxxxx ». Sur l'ordi, elle est aussi sous
  le téléphone. Depuis le 2026-10-03 au soir, c'est l'EMPREINTE DU JEU publié (les fichiers de `VERSION PRINCIPALE/`), plus le commit :
  elle ne change QUE si le jeu web change — un push qui ne touche que ROBLOX ou les notes laisse le même numéro (et ne recharge plus les
  joueurs : c'était la musique « coupée bizarrement »). Le commit publié se lit dans `…/jouer/version.json` (« commit »). Une copie locale
  affiche « VERSION LOCALE ». Pour voir si le JEU a changé depuis la référence, lancer
  `git log --oneline c02c75a..origin/main -- "VERSION PRINCIPALE"`.
- **Ce que contient la référence**, pour la reconnaître :
  · le menu de SACHA par défaut (`?menu=leo` = celui de Léo), posé sur l'écran titre v3 : la caisse tombe dans un ciel de cumulus et
    on tourne la caméra autour d'elle au doigt ;
  · les niveaux NUAGES (nuages v8) → VILLE → PARIS → ORBITE → ORAGE → MINUIT EN VILLE → PLUIE DE SATELLITES ;
  · NITROOO et son DRAGON DE PAPIER (v7), la DARK TRIAD en noir ;
  · LA LOI DU RÉSERVOIR : plus de nitro infinie, et la chaîne d'aura qui se ferme ;
  · la pose déboguée et le bord sans « clic » (le correctif de Léo, porté) ;
  · sur l'ordi, l'écran du téléphone couché (844 × 390) et le bouton PORTRAIT ;
- **Ajouté depuis, sur `main` (2026-10-03, Léo)** — à garder : sur l'ordi l'écran NU par défaut (sans boîtier ni encoche, mais avec les
  MARGES de l'iPhone : les boutons à la même place ; `?encoche=1` = le boîtier du 13 Pro) ; l'ATELIER DES NUAGES (`?nuages=1`) ; l'écran
  titre au regard presque à niveau, qui ne tourne qu'à l'horizontale, la caisse qu'on TAPOTE et son modelé ; les trois musiques du lobby
  (TEMPLE DE JADE retiré) ; le soir, le numéro de version = l'EMPREINTE du jeu (plus de rechargement à chaque push : c'était la
  musique « coupée bizarrement ») et le tempo qui suivait la voiture retiré (il DISTORDAIT, mesuré). Le détail : `VERSION PRINCIPALE/JOURNAL.md`.
  · (2026-10-03, Sacha) DEBOUT, la comète de NITROOO ne voile plus l'écran : le dragon n'est plus « transparent » (le paysage ne bouge pas).
  · la MISE À JOUR TOUTE SEULE et le numéro de version dans les réglages.
  · (2026-10-04, Léo, d'abord sur sa copie de test) LE DÉPART EN MUSIQUE : le lobby s'efface pendant le piqué et la musique de course
    part TOUT DE SUITE, pendant le boost, en fondu de 0,6 s (`DEPMUS`) — le son de transition `depart.envol` a été RETIRÉ (Léo).
  · (2026-10-04, Léo) la MÉLODIE de la phrase du nitro s'éteint de nouveau (un `//` avalait son extinction depuis le 3/10 :
    une nappe d'orgue sous les « ding » — c'était l'intrus).
  · (2026-10-04, Léo) LA VILLE DÈS L'ENTRÉE (le portail ne débouche plus sur un ciel vide : seul le 1er rang de tours passe sous la route
    surélevée) et GLASSY PLUCKS, la musique de toutes les villes.
  · (2026-10-04, Léo) le FEU EN CUBES : des flammes en cubes de pixels qui viennent des quatre bords de l'ouverture
    (`FEU_CUBES`), un brasier orange au centre ; et LA PORTE v2 — la porte fermée de Sacha est GARDÉE (Léo l'avait enlevée puis l'a
    fait remettre), mais redessinée : caissons en laque indigo, CASH CAR en or, hublots qui laissent voir le feu.
  · (2026-10-10, Léo) EN VOL, POUCE EN HAUT = LA CAISSE MONTE par défaut (réglage « POUCE HAUT EN VOL » : MONTE ; les anciennes
    sauvegardes basculées une fois, PLONGE reste au choix ; le clavier ne change pas). Détail : « EN VOL, POUCE EN HAUT » dans `VERSION PRINCIPALE/JOURNAL.md`.
  · (2026-10-13, Sacha) JOUER = LE MODE CLASSIQUE AU HASARD : à chaque départ et à chaque portail, une MAP (nuages, ville, jade,
    orbite) et une MÉTÉO (matin, midi, soir, nuit, pluie, orage ; l'orbite sans nuages, pluie ni orage) tirées au hasard. Le SOLEIL DE
    JADE direct (le JOUER de Léo du 12/10) = `?play=jade`. Détail : le commentaire « LE MODE CLASSIQUE AU HASARD » au-dessus de `const SF` dans `index.html`.
  · (2026-10-17, Sacha) LES LUMIÈRES DE LA CAISSE v2 : la nuit, les phares projettent un vrai faisceau sur la route, les feux arrière, le feu du nitro, la
    flamme du moteur et les traînées éclairent le bitume (sous la pluie, chaque feu s'y étire en traînée), la lueur des feux allume la poupe et la lunette ;
    calculé dans le shader de la route, sans lumière three de plus. (l'interrupteur `?sans=lumieres` est retiré depuis le 18/10.) Détail : `VERSION PRINCIPALE/JOURNAL.md`.
  · (2026-10-16, Sacha) LA VILLE EST TOUJOURS LA NUIT : plus de ville de jour au JOUER ; la map de base (la pluie au néon) en quatre TEINTES tirées au
    hasard (violet = la base, vert, jaune, bleu) et quatre temps (pluie, nuit, brouillard, orage). (`?sans=villenuit` et les villes de jour sont retirés depuis le 18/10.) Détail : `VERSION PRINCIPALE/JOURNAL.md`.
  · (2026-10-18, Sacha) LA VILLE, NÉON ET VERRE : la ville et la ville vitrée FUSIONNENT — la ville au néon garde tout (nuit, teintes, enseignes,
    réclames, pluie) et ses tours les plus hautes deviennent, pour une part, les géantes de verre de la VILLE VITRÉE (formes, biseaux, mur-rideau, bureaux
    allumés), en néon. La ville vitrée n'est plus tirée au JOUER (`?vitree=1` la remet, `?carte=vitree` la joue telle quelle). Détail : `VERSION PRINCIPALE/JOURNAL.md`.
  · (2026-10-19, Sacha, Léo prévenu) LE GARAGE QUI PREND TOUT L'ÉCRAN : le ⚙ RÉGLAGES (masqué par Léo le 9/10) revient à côté du trophée ; couché,
    l'ŒIL le rejoint et VITESSE · les portes (BOUTIQUE toujours deux fois plus large) passent dans une colonne à droite, ACCUEIL + JOUER en bas ;
    debout, VITESSE et les portes montent sous le nom. `?garage=leo` = le garage d'avant, au pixel. Détail : `VERSION PRINCIPALE/JOURNAL.md`.
- **SANS TOUT CASSER** — la règle de chaque session, avant de pousser :
  1. Partir de `origin/main` À JOUR : `git fetch origin main`, puis `git merge origin/main`. Jamais d'une vieille branche, jamais d'une copie locale.
  2. Sur `main`, on FUSIONNE. Jamais de `push --force`, de `reset` ni de revert du travail de l'autre ; dans un conflit, on garde les deux.
  3. Avant chaque push, le jeu doit démarrer SANS ERREUR et la partie se lancer (menu → JOUER → course) : sur téléphone couché ET
     debout, et dans le cadre de l'ordi.
  4. Ne jamais rebasculer un choix tranché (menu de Sacha par défaut, réglages de jeu validés…) sans l'accord de Sacha ET de Léo.
  5. Si une publication casse le jeu :
     - **le rendre tout de suite** : Vercel → Deployments → la publication de `c02c75a` (ou du dernier commit qui marchait) → « Instant
       Rollback » ou « Promote » ;
     - **trouver ce qui a cassé** : `git diff c02c75a origin/main -- "VERSION PRINCIPALE"` ;
     - **réparer sur `main`** par un NOUVEAU commit.
- **Changer de référence** : seulement quand Léo ou Sacha le demande. On note le nouveau commit et son nom `jeu-reference-AAAA-MM-JJ`
  (une étiquette ne se déplace pas) dans ce paragraphe ET dans celui de `VERSION PRINCIPALE/JOURNAL.md`.
