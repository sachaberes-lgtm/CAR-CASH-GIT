CONTRÔLE ADVERSE du lot ombre-image (qa/ombre-image, a7121632b, poussé et identique à origin)

Ce que j'ai fait : relu le diff réel contre qualite-appareil (3 fichiers de code), reconstruit dans node les programmes de la loupe (main, qualite-appareil, branche, toutes variantes), appliqué le remplacement de l'ombre sur le three r128 du dépôt, assemblé une copie avec --depuis-morceaux et contrôlé la syntaxe du grand script.

VÉRIFIÉ, TIENT DEBOUT
- (2) Hors profil, la loupe est identique à origin/main. J'ai reconstruit le programme avec RB, AR et TE faux : 2 604 caractères, égal au caractère près, aussi avec ?loupe=tout. Les uniformes en plus dans LOUPE.U (uS*, uAr, uTr) ne sont pas dans le programme : aucun effet. Le chemin de rendu hors profil ne fait qu'en plus lire et remettre uTrame (qui existe toujours, triptyque-bloom.js:222) et poser uTr.x=0 : aucun effet. Sur l'ordinateur, LOUPE.ok est faux et PRF.on aussi, donc OMBRE_PCF9 et l'effacement tardif rendent la main avant de toucher à quoi que ce soit.
- (3) Les interrupteurs :
  - ?sans=loupearete : le programme est égal, au caractère près, à celui de qualite-appareil (rubans compris).
  - ?sans=ombrepcf : le morceau de shader de three reste intact.
  - La trame à l'écran et l'effacement tardif sont éteints par défaut.
  - ?loupearete=0 : le programme AR reste compilé, mais l'image donne le même résultat, à la précision près.
- (7) GLSL, ombre : la regex attrape exactement 1 bloc dans r128 (getShadow seulement, pas getPointShadow). Les poids [1-g,1,g]² × 0,25 font bien 1. L'intégration de la boîte de 2 texels est juste. La portée est la même (±1,5 texel), les biais aussi. Il n'y a pas de `$` dans les chaînes de remplacement. La variante de banc se ferme correctement.
- (7) GLSL, loupe : la loupe ne marche qu'en WebGL2 (W2_POST) et l'ombre PCF9 est gardée par isWebGL2, donc WebGL1 n'est jamais concerné. Les branches dépendent d'un uniforme, il n'y a pas de dérivées, textureLod est hors condition non uniforme, il n'y a pas de nouvelle division. Le PCFSoft de r128 lit bien 16 texels : le « 28 » était faux.
- (4) Ordre de déclaration : rnProfil est hissée (triptyque-bloom l'appelle déjà au chargement). RNET n'est lu qu'au rendu d'une course, jamais au chargement. Rien n'est compilé avant le remplacement de l'ombre : aucun render ni compile dans icones-fenetre, scene-ciel, soleil-planete ou palier-appareil.
- (5) Assemblage de la copie : « index.html et les 330 morceaux sont d'accord ». Le grand script (10,6 Mo) passe le contrôle de syntaxe. Le seul échec vient de ma regex (une balise <script> dans un commentaire, même résultat sur qualite-appareil).
- (6) Fichiers touchés : aucun fichier interdit. Le lot ne touche que rendu/loupe-caisse.js, rendu/soleil-planete.js et rendu/triptyque-bloom.js, plus outils/ et passation/. index.html et sw.js ne sont pas commités.
- (8) Allocations : aucune par image dans le chemin par défaut. dbgLoupe({compte}) et la cible 8 bits de te:0 ne servent qu'au banc.

DÉFAUTS CONFIRMÉS
1. MINEUR – rendu/loupe-caisse.js:187, `if(LOUPE.rb&&RNET.long)try{loupeRubans(...)}`
   - Scénario : au banc, dbgRubans({long:0}) (rubans-nets.js:125) passe RNET.long à faux à chaud. loupeRubans n'est plus appelée, donc uSn reste à 1 et les capsules de la dernière image restent reconstruites, figées à l'écran. dbgLoupe().segRubans et pxRubans restent faux aussi. Avant ce lot, loupeRubans tournait toujours et remettait uSn à 0 d'elle-même. L'A/B de la loupe le long des rubans (lot 3) sur la même image est cassé.
   - Correction : `if(LOUPE.rb)try{loupeRubans(LOUPE.U);}catch(e){LOUPE.U.uSn.value=0;}` (la fonction gère déjà RNET.long à faux).
2. MINEUR – rendu/triptyque-bloom.js:355-358 (effacement tardif, éteint par défaut)
   - Quand il est allumé, chaque image crée une fermeture (sc.onBeforeRender=function…) et un tableau ([…ATTACHMENT]). C'est contraire à la règle « aucune allocation par image ».
   - Correction : créer l'enveloppe une seule fois à l'installation (elle lit `ob` dans une variable rafraîchie) et pré-allouer les deux tableaux d'attachement.
   - Le commentaire « même image attendue au bit près » est contredit par la mesure du rapport (Jade N2 : 62 px à ≤3/255).
3. MINEUR – rendu/soleil-planete.js:463-464
   - Le commentaire dit encore « N1 : AUCUNE valeur de cette ligne n'est lue », alors que loupeArete:0 y est maintenant lu à chaque image.
   - Correction : corriger le commentaire.
4. MINEUR – rendu/loupe-caisse.js:119, nom masqué
   - `const AR` (bloc de la loupe) masque le global `AR` de rendu/autoroute.js:32. Aucun bug aujourd'hui : rien dans ce bloc ne vise l'autoroute. Mais c'est exactement le piège « drapeau global masqué par un const local ».
   - Correction : renommer (LAR par exemple).
5. MINEUR – rendu/triptyque-bloom.js:23, ombre PCF9 invisible au diagnostic
   - Si la regex ne trouve pas son bloc, ou en cas d'exception, OMBRE_PCF9 vaut faux sans un mot. dbgGfx (nettete-qualite.js:298) et habillages-accueil.js:202 affichent toujours « PCF ».
   - Conséquence : sur le 13 Pro, on ne peut pas savoir si l'A/B ?sans=ombrepcf compare vraiment deux filtres.
   - Correction : ajouter OMBRE_PCF9 au filtre affiché par dbgGfx et à la ligne « profil » de la boîte noire.

ACTIVÉ PAR DÉFAUT SANS MESURE SUR TÉLÉPHONE (signalé par l'agent, mais à trancher explicitement)
6. SÉRIEUX (décision de l'intégrateur)
   - La reconstruction des arêtes est ALLUMÉE par défaut en N2-N4 (PRF.T.n : loupeArete:1). En N2, cela touche la classe 1 en HAUTE (le 13 Pro de Sacha) et la classe 2 en BASSE (son réglage par défaut).
   - Coût : les lectures de texture de la passe pleine résolution d'écran sont multipliées par 2,1 à 2,7 (4 texelFetch par pixel au lieu d'1 lecture filtrée). Le coût en ms et la chaleur ne sont pas mesurés. Le passage à critical en N2 est un risque réel.
   - En N4, la loupe se retire souvent d'elle-même (kq < 1,12) : la clé y est presque sans effet.
   - Ma recommandation : loupeArete:0 en N2 jusqu'à la mesure sur 9 min, ou accord explicite de Sacha.
7. À SIGNALER, risque faible
   - L'ombre PCF9 est allumée par défaut pour toute la classe 1, en N1 comme en N2 : elle change donc l'image par défaut du 13 Pro. Coût non mesuré, mais 9 lectures au lieu de 17 : probablement neutre ou en gain.
   - Le programme AR est aussi compilé en N1. Il ne lit rien de plus, mais calcule textureSize et la position du texel pour chaque pixel (quelques opérations).

DOUTES (non réfutés, non prouvés)
- La différence vue sur l'ordinateur (18 sources de shader en plus et caisse à x≈−114 contre 0,1 sur main) ne vient pas de ce lot : sur l'ordinateur, LOUPE.ok et PRF.on sont faux et aucun bloc du lot ne s'exécute. Elle vise donc qualite-appareil lui-même, et l'intégrateur doit comparer qualite-appareil et main sur l'ordinateur avant toute fusion vers main.
- Trame à l'écran : la cible demi-flottante est choisie une seule fois, sur le type de composer.renderTarget1 au chargement. C'est cohérent tant que la cible de la scène ne change pas de type. Éteinte par défaut, donc sans enjeu.
- Effacement tardif : l'effacement se fait maintenant par background.render (setClear(clearColor) remis à neuf) au lieu de renderer.clear sur l'état GL courant. Une couleur de fond différente est possible si quelqu'un a laissé un autre clearColor. Éteint par défaut. La profondeur de la toile (boucle-6-hud.js) n'est pas invalidée, comme l'agent l'a annoncé.
- Je n'ai pas pu compiler le GLSL, faute d'outil de validation sur la machine. Je l'ai relu ligne à ligne sur les sources reconstruites : je ne vois pas d'erreur, mais il n'est pas compilé.

VERDICT : fusionnable après corrections. Les corrections 1 et 3 à 5 sont triviales et la 2 vise du code éteint. La 6 est une décision à prendre avant de livrer sur main : éteindre loupeArete en N2 ou obtenir l'accord de Sacha. Le défaut n0 est réellement corrigé : la loupe hors profil est identique à main au caractère près.

Fichiers de contrôle (scratchpad) :
- /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/fsx.cjs (reconstruction et comparaison des programmes de la loupe)
- /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/fsx2.cjs
- /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/pcf.cjs (morceau d'ombre remplacé sur r128)
- /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/fs_ar_te_rb.glsl (variante complète de la loupe)
- /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/copie/ (copie assemblée)