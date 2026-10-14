# CASH CAR — LA CHASSE AUX BUGS AVANT SORTIE (2026-10-14) — RÈGLES DES AGENTS DE LA SESSION DEBUGGING

Sacha (créateur du jeu, avec Léo) : « Va chercher TOUS les bugs, surtout sur la version MOBILE : il faut que sur mobile ce soit
irréprochable, aucun bug, aucun truc de collision. Le jeu sort demain, niveau top de l'App Store. »
Le cap de la nuit : **la version APP STORE (iPhone)**. `D=/Users/sachaberes/cash-car/debug` (dossier permanent).

## Le jeu
- Un seul fichier : `$D/integ/VERSION PRINCIPALE/index.html` — 5,4 Mo, ~52 000 lignes, Three.js. D'abord le CSS et le HTML, puis UN grand
  `<script>` (une seule portée : toutes les fonctions se voient entre elles). C'est la copie de RÉFÉRENCE de la session :
  **aucun agent ne la modifie**. Les numéros de ligne des rapports sont ceux de CE fichier.
- ⚠ Ne JAMAIS `cat` le fichier ni le lire en entier (quelques lignes font > 5 000 caractères). Outil Read avec `offset`/`limit`
  (≤ 350 lignes à la fois). Pour trouver une fonction : `grep -n -w 'nom' $D/carte/fonctions.tsv` (l'index « ligne ⇥ nom » de toutes
  les fonctions : instantané) plutôt qu'un grep sur les 5 Mo ; pour une autre recherche :
  `grep -n 'motif' "$D/integ/VERSION PRINCIPALE/index.html" | cut -c1-240`.
- Le guide du jeu : `$D/integ/VERSION PRINCIPALE/CLAUDE.md` (800 Ko). NE PAS le lire : `grep -n 'mot-clé' … | cut -c1-300` pour savoir
  si un comportement est VOULU. Dans le code, un commentaire daté qui cite Sacha ou Léo = une décision, pas un bug.
- Où tourne le jeu : **iPhone** — WKWebView sous Capacitor (l'app App Store, iPhone seulement ; le testeur d'Apple peut l'ouvrir sur
  un iPad en fenêtre iPhone) et Safari iOS ; téléphone COUCHÉ 844×390 (référence) et DEBOUT 390×844 ; plus petit : iPhone 7/8/SE
  667×375 (iOS 15.8). Écrans 60 Hz et 120 Hz (ProMotion), vieux téléphones à 30 i/s. Tout se joue AU DOIGT (multi-touch).
- JOUER = le mode classique AU HASARD (`classiqueJouer` : une map et une météo tirées à chaque départ et à chaque portail : nuages,
  ville, jade, espace). Les crochets `window.dbg*` sont des outils de banc, pas des bugs.

## Ce qu'on cherche : des VRAIS bugs, que le joueur — et d'abord le TESTEUR D'APPLE — peut rencontrer
- **S1 bloquant** — exception JS en jeu, écran figé ou noir, partie impossible à lancer/relancer, joueur COINCÉ sur un écran (impasse
  sans bouton), sauvegarde perdue/corrompue, argent faux, plantage mémoire.
- **S2 majeur** — collision fausse (mort injuste, on passe au travers, ramassage raté ou compté deux fois), toucher perdu ou doigt
  fantôme (commande restée collée), état incohérent après pause / arrière-plan / rotation / appel entrant, effet ou minuteur qui ne
  s'arrête pas, son muet ou doublé sur iOS, comportement différent à 30/60/120 i/s.
- **S3 mineur** — défaut visible sans conséquence.
Ce qui N'EST PAS un bug : le style du code, les refactorisations, les micro-optimisations, les choix documentés, l'équilibrage et les
sensations (**le gameplay est VERROUILLÉ** : réglages de conduite, vitesses, prix, difficulté), les `dbg*`, l'édition POKI, le clavier.

**Pas de scénario, pas de bug.** Chaque trouvaille dit : l'ÉTAT du jeu, le GESTE du joueur (ou l'événement), le RÉSULTAT faux qu'il
voit — avec les lignes exactes, et pourquoi les gardes déjà présentes ne l'empêchent pas (tu les as cherchées : appelants, `try/catch`,
tests en amont). Un « ça pourrait » sans chemin concret ne se rapporte pas. Mieux vaut 2 bugs sûrs que 10 soupçons.

## Les zones (six sessions travaillent cette nuit sur le même fichier ; PILOTAGE répartit)
- **À NOUS (on corrige)** : collisions, physique / pas de temps 30-60-120, machine à états du jeu, mort-relance, pause, cycle de vie
  (arrière-plan, verrouillage, appel), rotation (la logique JS), portails et enchaînement des niveaux, sauvegarde, génération de piste,
  premier lancement / auto-école, LECTURE du tactile (toucher perdu, doigt fantôme, double tap), pouvoirs et minuteurs, et les bugs
  d'audio iOS, de langues, d'économie / missions / carrière.
- **HORS ZONE (on NOTE, verdict HORS_ZONE, on ne corrige pas)** : le CSS et le HTML des écrans (INTERFACE) ; le rendu, les couleurs,
  les shaders (GRAPHISME) ; les crans de qualité, le coût par image, la mémoire, Safari 15 (OPTIMISATION) ; `app-ios/` (APP STORE) ;
  les SENSATIONS — constantes et courbes du volant tactile `TCTL`, du braquage, de la caméra, de la difficulté (GAMEPLAY).
- **GELÉ POUR TOUS** : la BOUTIQUE 3D (`garBq*`, `bq*`, `GBQ`) et les modèles des VOITURES — Léo y travaille en direct cette nuit.
- **INTOUCHABLE** : le BURN-OUT de Léo (`BURN`, `DON`, `burnPart`, `burnGeste`, `burnDerape`, `burnCubes`, `BURN_TENU`, `BURN_FS_FUM`,
  tout ce qui commence par burn/don). On ne supprime AUCUNE fonctionnalité. Ne touche pas : `sw.js`, les `CLAUDE.md`, les autres dossiers.

## La machine et les tokens (elle a REDÉMARRÉ cette nuit sous la charge : on travaille léger)
- AUCUN navigateur, aucun serveur, aucune commande lourde. Mission COURTE : 20 à 30 minutes, une zone, un livrable.
- Aucune commande git hors de TA copie privée. Jamais de `git push`, jamais de `git stash`.
- ÉCRIS SUR LE DISQUE AU FIL DE L'EAU : chasseur → `$D/trouvailles/<ton-id>.json` dès la 1re trouvaille ; correcteur →
  `$D/verdicts/<ton-id>.json` et UN COMMIT PAR CORRECTIF, tout de suite.

## Pour ceux qui CORRIGENT (seulement si ta mission le dit)
- Ta copie privée : `sh $D/banc/copie.sh <ton-id>` → affiche `COPIE=` et `JEU=` (un mini-dépôt git isolé qui ne contient que
  `VERSION PRINCIPALE/index.html`, identique à la référence). Tu ne modifies QUE ce fichier-là.
- AVANT de corriger : `grep -n "<fonction>" $D/journal-correctifs.tsv` (le journal COMMUN des six sessions) — si la fonction y est déjà,
  lis la ligne : même bug → verdict DOUBLON ; autre correctif au même endroit → fais le tien le plus petit possible et signale-le.
- Correctif CHIRURGICAL : le plus petit changement qui répare. Pas de reformatage, pas de réindentation, pas de renommage, pas de
  déplacement de bloc, pas de « tant que j'y suis ». Un commentaire en français, daté, qui dit POURQUOI :
  `// (2026-10-14, chasse aux bugs) …`. Style du code autour (dense, français).
- Après CHAQUE correctif : `node $D/banc/syntaxe.cjs "<JEU>"` → « erreurs de syntaxe: 0 » ;
  `sh $D/integ/garde-burnout.sh "<JEU>"` → OK ; puis
  `git -C "<COPIE>" commit -qam "Zone : ce qui est réparé (chasse aux bugs)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"` ;
  puis `printf 'debug:%s\t%s\t%s\t%s\n' "<ton-id>" "<fonction>" "<lignes de la référence>" "<titre court>" >> $D/journal-correctifs.tsv`.
- Relis ton diff (`git -C "<COPIE>" show HEAD`) : il ne contient QUE le correctif.
- Tu ne corriges PAS (verdict CONFIRME_NON_CORRIGE + proposition écrite) si : le correctif change le gameplay, l'équilibrage ou les
  sensations, touche au burn-out ou à une zone gelée, demande plus d'une trentaine de lignes, ou si tu n'es pas CERTAIN de ne rien
  casser. Un bug laissé et bien décrit vaut mieux qu'une régression la veille de la sortie.
