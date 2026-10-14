# BRIEF COMMUN — LA REFONTE « NAVIGATION 7 » DE L'INTERFACE DE CASH CAR (14/10/2026, session INTERFACE sur le PC de Sacha)

## L'ordre de Sacha (13 h 20, mot pour mot, il prime sur tout)
« Chaque écran où il y a des boutons doit être complètement revu à zéro, refonte et amélioration de chaque écran. Pour chaque bouton tu dois te
demander si c'est vraiment le meilleur moyen, le plus pro, le plus magnifique. Il faut que chaque bouton, tu te demandes si c'est au bon
endroit. Le garage, il y a plein de boutons au mauvais endroit, plein de fonctionnalités répétées, c'est pas assez clair. Il faut que ça soit
beaucoup plus simple. Dans le même esprit, mais beaucoup plus simple d'accéder à tous les trucs, beaucoup plus clair pour les enfants, pour
tout le monde. Là, c'est trop éparpillé partout. Tu peux prendre des libertés. Il faut que ça soit parfait, sortable sur l'App Store demain. »

## La nouvelle structure (la même sur tous les écrans de menu) — `html.nav7`
- EN HAUT, ce qu'on LIT : le TITRE de l'onglet à gauche (pixel 16, à `left:var(--n7TitreX)`, `top:var(--n7TitreY)`, 48 de haut — à la place du ◀) ;
  l'ARGENT et l'AURA à droite dans UNE pastille globale `#n7Bank` (posée par NAV). **Les écrans ne montrent plus leurs propres compteurs.**
- AU MILIEU : la scène 3D et le contenu de l'onglet ; le contenu commence à `var(--n7Haut)` et s'arrête à `var(--n7Res)` du bas.
- EN BAS, ce qu'on TOUCHE : UNE plaque d'or de DÉCISION (JOUER, ACHETER…), TOUJOURS AU MÊME ENDROIT, puis la BARRE d'onglets `#n7Bar`
  (posée par NAV) : ACCUEIL · GARAGE · MISSIONS · BOUTIQUE (14 h 10, Sacha : l'onglet garde le nom MISSIONS ; les « DÉFIS » sont les défis secrets de la palette ; le MODE FACILE est retiré du jeu, interrupteur SANS_FACILE posé par IDEE).
- ⚠ 14 h : Sacha a fait RETIRER LA CARRIÈRE du jeu (une autre session pose l'interrupteur SANS_CARRIERE ; `?carriere=1` la rend). Plus d'onglet CARRIÈRE, ne
  crée aucun lien vers elle. L'AUTO-ÉCOLE (`tuto*`, `#coach`, `<style id="ecoleV2">`) est refaite par la session GENERAL : n'y touche pas. GAMEPLAY ajoute
  3 boutons de figure en vol dans le HUD (`#tFig`, `<style id="figuresV2">`) : n'y touche pas.
- Un ONGLET n'a PAS de ◀ (la barre est le retour). Une SOUS-PAGE (les réglages, l'œil) a son ◀ en haut à gauche
  (48×48 à `sL+16`, `sT+8`) et revient à son onglet.
- La plaque de décision de TON écran se place avec les variables du socle (déjà dans le fichier, bloc `<style id="nav7">`) :
  `left:var(--n7DecL); right:var(--n7DecR); bottom:var(--n7DecB); height:var(--n7DecH); width:var(--n7DecW)` en `position:fixed`
  (debout : pleine largeur, 64 de haut, au-dessus de la barre ; couché : 268×48 au bout de la barre, à droite — `--n7DecL:auto`).
- Toute règle neuve s'écrit sous `html.nav7 …` (donc `?nav=0` rend la charte 6 d'avant, et `?ui=5` l'ancienne interface : à garder intacts).
- Pour parler à la barre sans dépendre de son code : `document.dispatchEvent(new CustomEvent('n7:va',{detail:{onglet:'shop',cat:'peinture'}}))`
  (onglets : `home`, `garage`, `defis`, `shop` ; `cat` facultatif). NAV écoute cet événement. Pour savoir si la barre est montrée :
  `html.n7on`. Tant que NAV n'a pas livré, tu peux simuler la barre au banc en ajoutant un faux bandeau de 56 px en bas.

## Qui fait quoi (chacun SA zone, sinon conflits de fusion dans le même fichier de 5,5 Mo)
- **NAV (le chef, pas toi)** : `#n7Bar`, `#n7Bank`, la fonction d'aller d'un onglet à l'autre, l'ACCUEIL (`#mHome`, `accC6`), le routeur
  (`mGo`, `mFill`, `mHit`, `garAccueil`, `mTap('play'|'garage'|'carr'|'mis'|'shop'|'set')`), le bloc `<style id="nav7">`, les drapeaux du `<head>`.
  **Ne touche pas à ces endroits.** Si tu as besoin de quelque chose d'eux, écris-le dans ton rapport final.
- **GARAGE** · **BOUTIQUE** · **PAUSE-RÉGLAGES-FIN** · **MISSIONS** : un agent chacun, dans son worktree et sa branche `ui7/<zone>`.

## Le style : la charte 6 « ENCRE · BLANC · OR » est la MATIÈRE (on ne la change pas, on structure avec)
Lis `passation/INTERFACE.md` §3 (règles) et `passation/accord.md` §2 (les 10 lignes de jetons) dans ton worktree. En bref :
hauteurs 48 · 64 · 32 ; UN toucher (translateY(4px), tranche 4→0, 90 ms linear) ; durées 90/200/100 ms, une courbe `var(--c6-courbe)` ;
texte système 11 · 13 · 15 (600 lire, 800 nommer, capitales .04em), pixel 16 · 24 · 32 seulement pour titres/noms/décision/gros chiffres ;
AUCUN texte < 11 px ; marges 16 + zone sûre (`--sT --sB --sL --sR`) ; écarts 8 (même groupe) / 12 (empilées) / 16 (groupes) ;
états : actif = face blanche, choisi = filet blanc 4 px, en cours = filet or 4 px ; UNE seule plaque d'or par écran ;
pas de dégradé, pas de lueur, pas de `backdrop-filter`, pas de coin arrondi ; cibles ≥ 44 px, 8 px d'écart ; navigation par icône seule
interdite sauf ⏸ ◀ ✕ ; la police pixel n'a pas de capitales accentuées → un mot accentué en capitales s'écrit en police système.
Variables du socle : `--c6-e0…e4` (encre), `--c6-b0 --c6-g1 --c6-g2` (blanc/gris), `--c6-or --c6-orT --c6-orE`, `--c6-cash` (vert = argent),
`--c6-aura` (violet = aura), `--c6-rouge` ; `--c6-h` (48), `--c6-vite` (90 ms)… (lis le début de `<style id="charte6">`, ~l. 7120-7200).

## INTOUCHABLES
- La scène 3D de Léo (atelier du garage, salle blanche de la boutique, bras robots, pinces, plateau, hologrammes des missions) : l'interface se
  pose DESSUS, on ne modifie ni les maillages, ni les lumières, ni les caméras. Le BURN-OUT (`burn*`, `BURN*`, `DON*`) : `sh garde-burnout.sh`
  (à la racine du worktree) doit dire OK avant chaque commit.
- Aucun chemin de paiement (`shopPaye` refuse : ça reste comme ça). Rien dans `sw.js`, `CLAUDE.md`, `ROBLOX/`, `AUTRE VERSION/`, `app-ios/`.
- Retirés par Sacha, à ne jamais réintroduire : le chinois (`I18N_ZH`, `LANG==='zh'`), POKI (`html.poki`, `POKI`), CRYPTOCITY.
  Contrôle : `grep -c "I18N_ZH\|LANG==='zh'\|html\.c6\.poki\|html\.poki" "VERSION PRINCIPALE/index.html"` → 0.

## Le fichier
`VERSION PRINCIPALE/index.html` (~5,5 Mo, ~53 000 lignes, fins de ligne **CRLF**). **Ne le lis JAMAIS en entier** : `grep -n` puis lecture de
plages (Read avec offset/limit). Tout le script est dans une IIFE (l. ~9000-52800) : aucune fonction n'est sur `window` (sauf `window.dbg*`,
`__mGo`, `__panBascule`). Édite avec l'outil Edit (il garde les CRLF) ; un script Python lit/écrit en BINAIRE et écrit via fichier temporaire +
`os.replace` (un agent a déjà vidé le fichier avec un `open(p,'w')` qui a planté). Les textes : `TR('…')` + une ligne
`Object.assign(I18N,{'FRANÇAIS':'ENGLISH'});` posée À CÔTÉ de ton code (pas dans la grande table, pour éviter les conflits). Les mots de
l'interface en capitales FR + EN doivent tenir dans les deux langues. Le piège du `//` : un commentaire ajouté en milieu de ligne avale la
suite de la ligne (le fichier a des lignes très longues) → toujours `/* … */`.
La carte de l'interface (écrans, fonctions, lignes, doublons) : `C:\Users\sacha\AppData\Local\Temp\claude\C--Users-sacha-Desktop-CAR-CRASH\c7056fd2-b558-4236-bdfd-914b0904d02b\scratchpad\CARTE-UI.md`
(les numéros de ligne datent d'avant le socle nav7 : +30 lignes environ après la l. 48).

## Le banc (PC de Sacha — il joue sur la même machine)
- **UN SEUL Chrome de banc à la fois sur toute la machine, toujours muet.** Utilise UNIQUEMENT la bibliothèque
  `C:\Users\sacha\AppData\Local\Temp\claude\C--Users-sacha-Desktop-CAR-CRASH\c7056fd2-b558-4236-bdfd-914b0904d02b\scratchpad\banc\lib.cjs`
  (`require` par chemin absolu) : elle prend le verrou de la machine (`C:\Users\sacha\cc-banc.lock`), lance Chrome avec `--mute-audio`,
  simule l'encoche de l'iPhone, et rend le verrou à `B.ferme()`. Jamais `puppeteer.launch` à toi, jamais de boucle qui relance des bancs.
- Ton serveur : `node <scratchpad>\srv.cjs "<ton worktree>\VERSION PRINCIPALE" <ton port>` en arrière-plan, puis `CC_PORT=<port>`,
  `CC_OUT=<dossier de captures à toi>`, `CC_QUI=<ta zone>` à chaque banc. Le chargement prend ~50 s : **regroupe** tes vérifications dans
  UNE ouverture (plusieurs formats = plusieurs `B.ouvre` dans le même script, un après l'autre). Vise 3 à 5 ouvertures en tout.
- Exemples prêts : `banc\tour.cjs` et `banc\tour2.cjs` (accueil, réglages, carrière, missions, offres, garage, JOUER → FACILE → auto-école →
  pause → réglages → QUITTER → fin), `banc\planche.cjs` (planche-contact de captures). `s.releve(nom)` liste chaque bouton visible (taille,
  < 44, recouvert) et les textes < 11 px. Lis `lib.cjs` (100 lignes) avant de commencer.
- Les captures AVANT de tous les écrans : `scratchpad\shots\tour0\` (debout390-fr-* et couche844-fr-*), planches `scratchpad\shots\planche-*.jpg`.
- Formats à vérifier : 390×844 et 375×667 debout, 844×390 couché ; FR et EN (`lang:'en'`). Regarde TES captures (outil Read sur le .jpg).
- Le PC n'a ni `~/cash-car/ui` ni `pilotage/` : les chemins de ce genre cités dans les vieux documents sont ceux du Mac.

## Git
- Ton worktree et ta branche sont créés ; base commune `2582b10` (le socle nav7). Un commit PAR correctif, en français, qui dit ce qui change
  pour le joueur, terminé par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Avant chaque commit : syntaxe
  (`node <scratchpad>\syntaxe.cjs "VERSION PRINCIPALE/index.html"` → 0 erreur), `sh garde-burnout.sh` → OK, le grep chinois/POKI → 0.
- Pousse ta branche après chaque lot : `git push origin ui7/<zone>`. **Jamais `main`, jamais `--force`, jamais `git stash` nu.** Pas de fusion
  d'une autre branche.

## Ton rapport final (court, en français)
Les commits (hash + une ligne), ce qui a changé pour le joueur écran par écran, les captures APRÈS (chemins) debout + couché, ce que tu n'as pas
pu faire, et ce dont tu as besoin de NAV (noms de fonctions à appeler, événements écoutés).
