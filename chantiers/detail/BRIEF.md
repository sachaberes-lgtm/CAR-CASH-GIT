# CASH CAR — LA PASSE « DÉTAIL » (2026-10-14) — RÈGLES COMMUNES À TOUS LES AGENTS

Sacha (créateur du jeu, avec Léo) : « Il y a 4 sessions qui tournent dans le code du jeu. Je veux que tu t'occupes de TOUT CE QU'ELLES NE FONT PAS.
Partout où elles ne regardent pas, tu observes. Pour chaque endroit, pour chaque code, pour chaque écran, pour chaque passe du jeu, tu te poses la
question : est-ce que je peux améliorer ça, oui ou non — et tu améliores si tu peux. Tu es LE DÉTAIL : tu dois me rendre un travail PARFAIT.
Le jeu sort demain (niveau top de l'App Store). »

## Les 4 autres sessions (LEURS zones — tu n'y touches PAS)
- **GRAPHISME** : tout le rendu — maps, météos, `BIOMES`, `bioApply`, `daPose`, `ACESShader`, shaders, matières, lumières, étalonnage, ciel du titre, garage et boutique 3D.
- **INTERFACE** : tout le CSS, le HTML des écrans, les menus, les boutons, le HUD, les transitions entre écrans, la disposition.
- **OPTIMISATION** : la fluidité mobile / iPhone 7 — crans de qualité (`QUAL_*`, `QL`, DPR), coût de l'image, chauffe, mémoire, temps de chargement.
- **DEBUGGING** : les bugs de jeu (collisions, physique, parcours, tactile) — elle relit tout le fichier par tranches.
Chacune a une centaine d'agents sur LE MÊME FICHIER (`index.html`). Tout ce que tu changes sera fusionné avec leur travail : **moins tu touches
de lignes existantes, mieux c'est**. Si tu trouves un problème dans leur zone : note-le (`POUR LES AUTRES` dans tes notes), ne le corrige pas.

## ⚠ COMMITE SOUVENT (deux passes précédentes ont TOUT perdu, coupées par la limite d'usage)
**Un commit après CHAQUE amélioration qui marche.** Tes notes `$D/notes/<ton-nom>.md` : au fil de l'eau, pas à la fin.
Tes scripts : `$D/banc/<ton-nom>/` (permanent). JAMAIS de travail dans /tmp. Vise un 1er résultat livrable en 30-45 minutes : d'abord ce qui compte le plus.

## Le jeu
- `D=/Users/sachaberes/cash-car/detail`. Ta copie git : `$D/wt/<ton-nom>` (branche `detail/<ton-nom>`), déjà prête. Travaille UNIQUEMENT dedans.
- Un seul fichier de jeu : `<ta copie>/VERSION PRINCIPALE/index.html` — 5,4 Mo, 52 000 lignes, Three.js, tout dans une IIFE.
  ⚠ certaines lignes font > 5 000 caractères : ne JAMAIS `cat` le fichier ni le lire en entier ; `grep -n … | cut -c1-300`,
  `sed -n 'A,Bp' | cut -c1-600`, ou Read avec offset/limit. Cherche par nom de fonction / id / commentaire daté.
- LA CARTE DU CODE : `$D/CARTE.md` — LIS-LA d'abord.
- Le guide : `VERSION PRINCIPALE/CLAUDE.md` (800 Ko : l'historique des décisions de Sacha et Léo, sections datées, les plus récentes en haut).
  NE PAS le lire en entier : `grep -n '^## ' CLAUDE.md | cut -c1-200`, puis seulement les sections de TA zone. Ce qui y est tranché par
  Sacha/Léo fait foi : tu peux améliorer, pas trahir l'intention ni rebasculer un choix (ex. « PLUS AUCUNE VOIX », « LE GAMEPLAY EST VERROUILLÉ »).
- Les fonctions du jeu sont privées ; seules les `window.dbg*` sont accessibles de l'extérieur (`grep -o 'window\.dbg[A-Za-z0-9_]*' index.html | sort -u`).

## ⚠ LA MACHINE EST SATURÉE (charge > 400, ~100 Chrome ouverts par les autres sessions, 12 Go de disque libres)
- Travaille d'abord SANS navigateur : lecture du code, `node` (extraire une fonction pure et la tester dans `vm`), `python3`, `afinfo`/`afconvert` (audio).
  Pas de ffmpeg/sox sur cette machine.
- Syntaxe après CHAQUE modif de index.html : `node $D/banc/syntaxe.cjs "$D/wt/<nom>/VERSION PRINCIPALE/index.html"` → 0 erreur (≈ 5 s).
- Garde de Léo : `cd $D/wt/<nom> && sh garde-burnout.sh` → OK.
- Le navigateur (Chrome sans fenêtre, banc `$D/banc/lib.cjs`, 130 lignes, LIS-LE) : **au plus 2 ouvertures dans toute ta mission**, à la fin, pour
  PROUVER que le jeu démarre encore (menu → JOUER → course, 0 erreur JS) et vérifier tes changements en un seul passage. Sémaphore : 2 navigateurs
  pour toute la passe (tu attends ton tour, parfois plusieurs minutes ; une ouverture coûte 1-3 min). Toujours `await s.ferme(); process.exit(0)`,
  lancé en arrière-plan avec un fichier de log. Ton serveur (s'il t'en faut un) : `sh $D/banc/prepare.sh <ton-nom> <ton-port>` le relance.
- Ne télécharge rien, n'installe rien (pas de npm install, pas de brew).

## Règles git (ABSOLUES)
- Commits fréquents, en français, style du dépôt : « Zone : ce qui change (passe détail) », terminés par la ligne
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- JAMAIS : push, merge, rebase, reset --hard, `git stash`, toucher à `main` ou à une autre copie, supprimer une branche.
- Ne touche PAS : la ligne `const CACHE = 'cashcar-v…'` de `sw.js` (l'intégrateur l'incrémente), les `CLAUDE.md` (tes notes vont dans `$D/notes/<ton-nom>.md`).

## Ce qui est INTOUCHABLE
- Le BURN-OUT du garage (Léo : tout ce qui commence par `burn`/`BURN`/`DON`).
- Le GAMEPLAY VERROUILLÉ par Sacha le 2026-10-09 : la conduite, la physique, les collisions, la caméra, la difficulté, la génération de la piste.
- Les créations signées de Léo (boutique 3D, dauphins, vitrail, singes, Soleil de Jade, CRYPTOCITY, dragon, voitures) : on ne retire rien, on ne change pas leur forme.
- Les CHOIX TRANCHÉS (lis les sections datées de ta zone dans CLAUDE.md avant de changer un comportement). Dans le doute : PROPOSITION dans tes notes, pas dans le code.

## Comment travailler « au détail »
1. INVENTAIRE : liste TOUT ce que ta zone contient (chaque fonction, chaque fichier, chaque réglage, chaque texte) dans tes notes.
2. Pour CHAQUE ligne de l'inventaire, pose la question : « est-ce que je peux améliorer ça, oui ou non ? » et écris la réponse (oui → quoi ; non → pourquoi c'est déjà bon).
3. Trie : d'abord ce qu'un joueur SENT (ou ce qui peut casser la sortie de demain), ensuite le reste.
4. Corrige de façon CHIRURGICALE : pas de reformatage, pas de réindentation, pas de déplacement de blocs, pas de renommage global. AJOUTE plutôt que réécrire.
   Commentaires en français, datés « (2026-10-14, passe détail) », qui disent POURQUOI.
5. PROUVE chaque changement (un test node, une mesure, un diff de sortie). Pas de « mieux » sans preuve. Un essai qui n'améliore pas : retire-le.
6. N'invente pas de fonctionnalités : on PEAUFINE ce qui existe. Une idée plus grosse = PROPOSITION dans tes notes.

## À rendre
1. Des commits sur ta branche `detail/<ton-nom>` (`git status` propre à la fin).
2. `$D/notes/<ton-nom>.md` : l'inventaire avec oui/non, ce que tu as changé (fonctions/clés, pourquoi, la preuve), ce qui reste, les PROPOSITIONS
   à trancher par Sacha/Léo, et « POUR LES AUTRES » (ce que tu as vu dans les zones des 4 autres sessions).
3. Ton dernier message : un rapport court en français (≤ 30 lignes) : fait / prouvé / reste / zones du fichier touchées (noms de fonctions) pour l'intégrateur.

## AJOUT (1 h 45) — LE JOURNAL COMMUN DES CORRECTIFS (accord avec la session DEBUGGING)
La session DEBUGGING corrige aussi des bugs dans tout le fichier, y compris parfois dans nos zones (thèmes : audio-ios, langues, economie,
missions-carriere, app-ios-appstore, maj-reseau). Pour ne pas corriger deux fois la même ligne :
- AVANT de modifier une fonction du grand script : `grep -i '<nom de la fonction>' /Users/sachaberes/cash-car/debug/journal-correctifs.tsv`
  (une ligne par correctif DÉJÀ commité chez eux : agent, fonction, lignes de la référence ad62cfa, titre). Si elle y est : ne refais pas le
  même correctif ; lis le leur (`/Users/sachaberes/cash-car/debug/verdicts/`), et note-le dans tes notes.
- APRÈS chacun de tes commits qui touche une fonction du grand script, ajoute ta ligne :
  `printf 'detail:<ton-nom>\t<fonction>\t<lignes>\t<titre>\n' >> /Users/sachaberes/cash-car/debug/journal-correctifs.tsv`
- Leurs trouvailles vérifiées mais NON corrigées dans ta zone (verdict `CONFIRME_NON_CORRIGE`) sont pour toi :
  `grep -l 'CONFIRME_NON_CORRIGE' /Users/sachaberes/cash-car/debug/verdicts/*.json 2>/dev/null` puis lis celles de ta zone.

## ⚠ CHANGEMENT DE CAP (1 h 50, Sacha) : « LÀ ON SE FOCUS QUE SUR LA VERSION APPLE STORE »
La seule cible de cette nuit est L'APP iOS (iPhone, Capacitor 8 / WKWebView, `app-ios/` sur la branche `ios-capacitor` ; son `www/` est une copie
de `VERSION PRINCIPALE/` + `natif/natif.js`). Conséquences pour TOUS les agents :
- On ne travaille plus pour le site Vercel, la PWA, le service worker, l'édition Poki/CrazyGames/itch, l'ordi (cadre « colonne », clavier, souris),
  les outils locaux de Léo, la démo. Ce qui était en cours là-dessus : on commite ce qui est FINI et prouvé, on note l'état, on arrête.
- Chaque question devient : « qu'est-ce que le JOUEUR SUR IPHONE (et le TESTEUR D'APPLE) voit, entend, touche — dans l'app ? ».
  L'app : pas de réseau nécessaire, pas de pub, pas de clavier, écran tactile, debout ET couché, encoche / îlot / barre d'accueil,
  interrupteur silencieux, appels entrants, passage en arrière-plan, iPhone 7 (iOS 15) jusqu'aux plus récents.
- Les correctifs du JEU se font toujours dans `VERSION PRINCIPALE/index.html` (branches parties de main) ; ceux de l'emballage natif dans
  `app-ios/` (agent « app-ios » seul). Lecture seule pour comprendre l'app : `/Users/sachaberes/cash-car/ios-capacitor/app-ios/`
  (`LISEZ-MOI.md`, `natif/natif.js`, `preparer-www.js`, `capacitor.config.json`).
