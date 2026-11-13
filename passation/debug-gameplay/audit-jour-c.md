# Audit du 10/11, lot C : joystick NITRO, double-tap au hasard, pouce, auto-école, garde de course, mémoire du canyon

Branche `debug-gameplay` après la fusion f8f44140 (main v1427). Lecture seule. Pas de navigateur (le banc `outils/banc-figures/joystick.cjs` demande Chrome, donc il a été lu, pas lancé).
Preuve en node : `passation/debug-gameplay/preuves/jc-joystick-ancre.cjs`. Elle extrait le VRAI `gliDn` / `gliMv` / `gliUp` de `code/moteur/mobile-tactile.js` et `figGDir` de `figures-physique.js`, puis les rejoue avec une horloge simulée.

## 1. Verdict par commit

| commit | sujet | verdict | ce qui a été vérifié |
|---|---|---|---|
| 75c434d1, 27bbdd1c, b8d0d6a5 | spec et plan | (référence) | Lus pour savoir ce qui est voulu : seuil de 38 px, réarmement à 40 %, une figure par poussée, remise à zéro à la pause, à la mort, à la seconde chance et au focus, et « au sol, le double-tap reste le saut nitro ». |
| 8907979b | NITRO devient un joystick | **DÉFAUT** (JC-03, JC-04, JC-05, JC-08) | La nitro reste tenue pendant la poussée : `keys.Space` n'est lâché que par `touchend` / `touchcancel` de `bindHold`, et le doigt reste attaché à l'élément où il s'est posé, même s'il en sort. `#tNitro` et `#tNitroZone` sont frères (pas emboîtés), donc il n'y a pas de `gliDn` en double. Une seule figure par poussée : `FJOY.arme` se réarme sous 15 px. Le temps est compté en ms (`performance.now`) et pas en images, donc 30 i/s et 60 i/s donnent le même comportement. `hap` est sous `try` et ne fait rien sans pont natif. Le seuil se mesure en px CSS dans le repère de l'écran : en portrait comme en paysage, « haut » est le haut de l'écran. Main gauche : les directions ne sont pas miroitées, ce qui est cohérent. Le compteur « par saut », la chaîne et le flow passent tous par `figLance`, comme pour le double-tap. |
| e092b8ef | remises à zéro, deux doigts | **SAIN** (note JC-06) | `fjoyRaz` est appelé dans `resetGame` (deux endroits), sur `blur` et sur `visibilitychange`. Une requête périmée est jetée par `DTAP.garde` (250 ms) dans `boucle-1.js:188`. Il manque le chemin `pause` de Capacitor (IOS-01, voir JC-06). La note « deux doigts » ne tient pas pour deux doigts sur NITRO (JC-07). |
| c0c66b21 | double-tap au hasard au sol, centre flottant | **DÉFAUT** (JC-01, JC-10) | Le centre flottant RÉARME le joystick alors que la poussée vient de partir. Prouvé en node, voir JC-01. Au sol, le double-tap ne mène plus jamais au saut nitro (JC-10). |
| 260e0b04 | banc du joystick | **SAIN** (lacunes) | Lu, pas lancé (Chrome interdit ici). Il ne couvre pas : poussée tenue puis retour au centre (JC-01), rotation pouce posé (JC-03), tap puis poussée (JC-04), deux doigts sur NITRO (JC-07). |
| 40b8d458 | double-tap au hasard adapté | **SAIN** | Le filtre de temps (`figDose ≥ figDMin`, même budget `figBudget`) est identique au refus de `figLance`, donc le tirage ne propose jamais une figure trop longue. Liste vide : `veqFigsAMoi` donne `['tailwhip']` par défaut, `FIG.tire` retombe sur le tail whip, et les id inconnus sont filtrés. `null` donne un refus propre en vol et un saut sans figure au saut nitro. Une seule candidate qui tourne déjà dans le même sens sert à empiler, borné par `IMPU.max`. `Math.random` comme partout. `FJOY.tireSaut` est consommé par `veqFigure` juste après `startFall` et remis à zéro par `fjoyRaz`. Pas de mort « pose ratée » de plus qu'avant : c'est le même budget que pour n'importe quelle figure en vol. |
| b12d86ba | le pouce (socle, pion, repères) | **SAIN côté jeu** (notes JC-07, JC-09) | Toutes les fonctions appelées existent (`sansAcc`, `figCourt`, `figRarH`, `figGNom`, `ALLEGE`, `REDUCED_MOTION`). Plus aucune référence à `figGVoit`, `figGlisseOn`, `#figGl`, `gliLibre` ni `mvFigG`. `#tJoy` est caché hors `body.play` et sous `body.dead`. `figJoyVoit` éteint le pion en pause, à la mort, ou quand la course est arrêtée. |
| bc382085 | auto-école, étape FIGURE | **SAIN** | Les deux gestes sont ouverts à l'étape 5 (`tutoFigOuverte`). La poussée en vol n'est pas stricte à l'auto-école (`strict:!TUTO.on`), donc elle prend l'emplacement côté (le tail whip offert). La validation se fait par `tutoPayees` ou par 3 essais au sol (`TUTO.sauts`, compté aussi par `figGJoue`). L'étape ne peut pas rester bloquée. |
| 136205b0 | garde de course | **DÉFAUT probable** (JC-02) | Suivi du chemin SANS `KHR_parallel_shader_compile` (`LIER.T`, iPhone) : un seul programme en vol, et chaque programme coûte au moins `LIER.c` (120 à 900 ms) plus une ou deux images. Un objet dont le programme est neuf n'est pas dessiné pendant tout ce temps, mais sa collision reste active. Il apparaît toujours à la fin : `lierPret` finit par lire, ou lit au bout de 8 s quoi qu'il arrive. Hors course, three n'est pas touché (les crochets ne sont posés qu'en course). Les lumières passent par l'intensité, pas par la visibilité (« jamais de recompilation »), donc il n'y a pas de recompilation de toute la scène en course. |
| 833694e0 | mémoire du canyon | **SAIN** | three r128 (`three.min.js`, `onGeometryDispose`) ne retire que les attributs que la géométrie porte encore. `instSegJette` vide `attributes` et `index` d'abord, donc les tampons du gabarit partagé restent. Le segment est d'abord retiré de `CY.grp`, donc jamais dessiné avec `geometry=null`. Ses tampons d'instances lui sont propres. La matière n'est pas libérée. Aucune collision ne lit les tableaux des segments. |

**Correctifs de débogage du jour (mêmes fichiers)** : tous intacts. IOS-01 (`mobile-tactile.js:561-562`), IOS-04 (`:445`), IOS-08 (`:299`), EE-02 (`seconde-chance.js:214`), EE-04 (`:419`) et H-02 à H-13 (`hud-fini.css`, `passe-textes.js`). EE-03 a été retiré dans la fusion : c'est juste pour `visibilitychange`, MAIS le chemin `pause` de Capacitor, dont IOS-01 existe justement parce que `visibilitychange` n'arrive pas, ne remet pas le joystick à zéro (JC-06, faible).

**Audit A (boule de feu)** : ses conclusions tiennent toujours (`bindHold` garde seul `keys.Space`, les écouteurs du glissé sont passifs). Une seule nuance : « pure décoration » n'est plus vrai pour le geste lui-même. Le même glissé lance maintenant des figures (`gliMv`), et la boule (`nx3Pouce`, ancre fixe, premier doigt gardé) et le joystick (ancre flottante, dernier doigt gardé) suivent chacun leur propre règle (JC-07).

## 2. Défauts, triés par gravité

### JC-01 (majeur) : tenir une poussée puis revenir au centre lance la figure de la direction OPPOSÉE. Confiance : SÛR (prouvé en node sur le vrai code)
- Commit c0c66b21. Fichier : `code/moteur/mobile-tactile.js:70` et `:74`.
- Scénario : en vol, le pouce sur NITRO (nitro tenue) pousse franchement vers le haut. Le salto de l'emplacement avant part et ça vibre. Le joueur garde le pouce en haut environ 1 s pendant que la figure tourne (le pouce tremble d'un pixel, comme un vrai pouce), puis il le ramène au centre sans le lever. Résultat : la figure de l'emplacement ARRIÈRE part aussi, avec une seconde vibration. Pareil si le pouce reste immobile 400 ms en haut puis revient. Le même problème existe pour ◄/► : un tail whip à gauche, puis un tail whip à droite au retour.
- Preuve (`node passation/debug-gameplay/preuves/jc-joystick-ancre.cjs`) : « haut tenu 1 s puis retour → u@80, d@1135 » ; « haut, immobile 450 ms, puis retour → u@80, d@735 » ; témoin « haut puis retour immédiat → u@80 » seulement.
- Cause : les deux règles de l'ancre flottante s'appliquent aussi quand la poussée vient de PARTIR (`FJOY.arme` faux). Quand le pouce n'a pas bougé depuis plus de 400 ms (`repos`), ou que le mouvement a commencé il y a plus de 700 ms (`lent`, `GLI.tq` posé à la sortie de la zone morte, jamais remis tant que le pouce reste à 40 px), l'ancre est déplacée sur le pouce déjà poussé ET `FJOY.arme=true`. Le retour vers le vrai centre devient alors une poussée franche dans l'autre sens.
- Correctif minimal : l'ancre ne flotte que si le joystick est armé. Après un tir, seul le retour près du centre d'origine réarme (ou le pouce levé).
```diff
-      if(n-GLI.tl>FJOY.repos&&(GLI.lx!==GLI.x0||GLI.ly!==GLI.y0)){GLI.x0=GLI.lx;GLI.y0=GLI.ly;GLI.tq=0;FJOY.arme=true;} // immobile : l'ancre rejoint le pouce
+      if(FJOY.arme&&n-GLI.tl>FJOY.repos&&(GLI.lx!==GLI.x0||GLI.ly!==GLI.y0)){GLI.x0=GLI.lx;GLI.y0=GLI.ly;GLI.tq=0;} // immobile : l'ancre rejoint le pouce (seulement armé : après un tir, le retour au centre ne doit pas devenir une poussée)
@@
-      else if(n-GLI.tq>FJOY.lent){GLI.x0=x;GLI.y0=y;GLI.tq=0;FJOY.arme=true;dx=0;dy=0;dist=0;} // trop lent pour une poussée : dérive absorbée
+      else if(FJOY.arme&&n-GLI.tq>FJOY.lent){GLI.x0=x;GLI.y0=y;GLI.tq=0;dx=0;dy=0;dist=0;} // trop lent pour une poussée : dérive absorbée (armé seulement)
```
  Le prix à payer : un pouce qui, après un tir, s'installe ailleurs sans repasser par le centre ne relance rien tant qu'il n'est pas levé. Il faut l'accepter, ou ajouter plus tard un réarmement « immobile 400 ms ET direction opposée interdite pendant 600 ms ». À ajouter au banc : le scénario « tenu 1 s puis retour ».

### JC-02 (majeur possible, iPhone) : avec le garde de course, sans KHR, un objet qui TUE peut rester invisible pendant plusieurs secondes, tout en restant solide. Confiance : PROBABLE (le mécanisme est sûr ; ce qui est visé et pendant combien de temps reste à mesurer sur iPhone)
- Commit 136205b0. Fichiers : `code/interface/vignette-moteur.js:259-262` (`lierAttend`), `:268-270` (`lierBudget`), `:315-331` (`lierPret`, chemin `!LIER.X`) ; `vendor/three.min.js` (renderBufferDirect qui saute l'objet).
- Scénario : un joueur neuf sur iPhone (Safari et WKWebView n'ont pas `KHR_parallel_shader_compile`, donc `LIER.T`), cache de shaders vide. Il passe le premier portail vers une map dont des matières naissent en course. GELS-SHADERS.md mesure 19 programmes nés d'un coup au portail jade, et 48 au pire. `prebLie` ne les prépare qu'en partie : sous le budget, un compile ne fait naître qu'UN programme et `jadeChauffeProgs` passe au morceau suivant. Le canyon, Crypto City, les pads, les pigeons et la voiture-fantôme ne sont jamais préparés. Chaque programme attend son tour : naissance, puis barrière (1 à 2 images), puis `LIER.c` ≥ 120 ms (jusqu'à 900), puis lecture. Le passage est sériel, car `lierBudget` refuse toute naissance tant que `LIER.att` n'est pas vide. Le 15e programme de la file s'affiche donc 2 à 4 s après le portail (plus si la lecture a attendu et que `LIER.c` est monté). Pendant ce temps, l'objet n'est pas dessiné, mais la collision (qui ne lit pas le dessin) le voit : à 60 m/s, le joueur meurt contre un obstacle ou un mur invisible, ou il roule sur une route ou une eau invisible. GELS-SHADERS.md §4 le reconnaît (« jusqu'à ~1 s par programme sans KHR sur machine lente »), mais rien ne regarde ce que l'objet invisible fait au jeu.
- Correctif minimal, qui borne l'invisibilité au lieu de la laisser ouverte : au-delà d'un délai, on dessine quand même et on accepte la lecture synchrone (un gel court plutôt qu'une mort injuste).
```diff
 function lierAttend(p){
-  if(p.__ccAtt===1){LIERC.sautes++;return false;}
+  if(p.__ccAtt===1){if(performance.now()-(p.__ccT||0)<LIERC.maxInvis){LIERC.sautes++;return false;}p.__ccAtt=0;LIERC.forces=(LIERC.forces|0)+1;} /* au-delà de maxInvis ms invisible, on dessine (gel court) : jamais un obstacle solide et invisible pendant des secondes */
```
  …avec `maxInvis:400` dans `LIERC` (à régler au banc ; le programme reste dans `LIER.att`, et sa lecture plus tard par `lierPret` ne coûte plus rien, puisque le dessin l'a déjà attendu). Une meilleure version, plus longue : ne garder sous le garde que le décor (`userData.decor`) et ne jamais cacher ce qui a une collision. À mesurer sur iPhone avec `dbgLier().garde.sautes` au premier portail.

### JC-03 (moyen) : tourner le téléphone avec le pouce sur NITRO lance une figure (ou une figure de route au sol). Confiance : PROBABLE (dépend du fait qu'iOS garde la touche vivante pendant la rotation, ce que suppose déjà IOS-08)
- Commit 8907979b (aggravé par c0c66b21). Fichier : `code/moteur/mobile-tactile.js:299` (seul le volant est rendu), `:68-77`.
- Scénario : en course, le pouce tient NITRO (boost) et le joueur fait pivoter le téléphone, portrait vers paysage. Au premier mouvement du pouce, `x - GLI.x0` compare des coordonnées des deux repères (par exemple 330,760 puis 770,330) : la distance dépasse largement le seuil, et la figure de la direction « ◄/►/▲/▼ » part aussitôt (prouvé en node : « pouce posé immobile, le téléphone tourne → r@900 »).
- Cause : `orientationchange` ne rend que le volant (IOS-08). L'ancre du joystick reste dans l'ancien repère, et la règle `repos` la déplace sur `GLI.lx`, qui est lui aussi dans l'ancien repère.
- Correctif minimal (même ligne qu'IOS-08) :
```diff
-    addEventListener('orientationchange',function(){ if(TCTL.act&&TCTL.id!=='souris')stUp(); });
+    addEventListener('orientationchange',function(){ if(TCTL.act&&TCTL.id!=='souris')stUp(); if(GLI.id&&GLI.id!=='souris'){GLI.x0=GLI.lx=NaN;GLI.req=null;FJOY.arme=true;} }); /* le joystick NITRO aussi : l'ancre se repose au prochain mouvement */
```
  et en tête de `gliMv` : `if(GLI.x0!==GLI.x0){GLI.x0=GLI.lx=x;GLI.y0=GLI.ly=y;GLI.tq=0;GLI.tl=performance.now();}`.

### JC-04 (moyen-faible) : un tap bref sur NITRO suivi d'une poussée donne DEUX figures. Confiance : PROBABLE
- Commit 8907979b. Fichiers : `code/gameplay/vol-equilibre.js:162` (`veqDoigt`), `code/moteur/mobile-tactile.js:77`, `code/moteur/boucle-1.js:188`.
- Scénario : en vol, le joueur donne un petit coup de boost (tap de moins de 300 ms), puis repose le pouce dans les 420 ms et pousse vers le haut. Le second `touchstart` est déjà un double-tap (`VEQ.dReq`), donc une figure AU HASARD part à l'image suivante. La poussée lance en plus la figure de l'emplacement avant. Au sol, c'est pareil : une figure de route au hasard, puis le geste au sol. `VEQ.dDn=0` dans `gliMv` n'empêche que le double-tap SUIVANT, pas celui qui est déjà parti.
- Correctif minimal : une poussée née du même appui qu'un double-tap ne tire pas.
```diff
-  const gliDn=function(id,x,y){GLI.id=id;…
+  const gliDn=function(id,x,y){GLI.dbl=VEQ.dReq||performance.now()-(VEQ.dReqT||0)<20;GLI.id=id;…
@@ gliMv
-      FJOY.arme=false;FJOY.dir=d;FJOY.vib++;GLI.req=d;GLI.reqT=performance.now();
+      FJOY.arme=false;FJOY.dir=d;if(GLI.dbl){figJoyVoit(null,dx,dy);return;}FJOY.vib++;GLI.req=d;GLI.reqT=performance.now();
```
  `bindHold` appelle `veqDoigt` avant les écouteurs du joystick sur le même élément, donc `VEQ.dReq` est déjà posé quand `gliDn` lit. L'autre choix (garder la poussée et annuler le double-tap) demande de retarder le double-tap au lâcher : c'est à décider avec Sacha.

### JC-05 (faible) : une poussée dans les 450 ms qui suivent la pose du pouce annule le coup de réacteur du boost. Confiance : PROBABLE (le code est sûr ; reste à savoir si c'est voulu)
- Commit 8907979b. Fichiers : `code/gameplay/figures-joystick.js:43` (`double:true`), `code/gameplay/figures-physique.js:170`.
- Scénario : en vol, le pouce se pose sur NITRO : le coup de réacteur part (`FLC`, `boucle-3-physique.js:322`, vitesse plus WHOOMP). Le joueur pousse aussitôt, ce qui est le geste normal du joystick (moins de 450 ms). `figLance` voit `o.double` et rend le coup : `fallVel` est multiplié par `FLC.k` < 1 et la nitro est rendue. Le boost tenu continue, mais l'élan de l'appui disparaît à chaque poussée rapide, après la flamme et la secousse déjà jouées.
- Cause : `figJoyOpts` a recopié `double:true`, qui vient de la règle « le double-tap n'est pas un boost ».
- Correctif minimal, si Sacha veut que le boost reste un boost : `figJoyOpts` → `o:{empile:true,strict:!TUTO.on,dx:…}` (sans `double`). Si c'est voulu (« pousser = figure, pas boost »), il suffit de l'écrire dans le commentaire.

### JC-06 (faible) : l'app iOS part en arrière-plan par le chemin `pause` de Capacitor (IOS-01) sans remettre le joystick à zéro. Confiance : PROBABLE
- Fusion f8f44140 (EE-03 retiré) avec e092b8ef. Fichier : `code/moteur/mobile-tactile.js:562` (`iosPose`).
- Scénario : pouce sur NITRO, le joueur verrouille le téléphone. Dans la WebView, seul `pause` arrive (c'est pour ça qu'IOS-01 existe), et ni `visibilitychange` ni `blur`. `GLI.id`, `TJ.tenu` et le pion allumé (`#tJoy.tenu`, z-index 66) restent tels quels jusqu'à la prochaine pose du pouce. Il n'y a pas de figure fantôme : `gliDn` réécrit l'identifiant et `DTAP.garde` jette la requête. C'est surtout visuel.
- Correctif minimal : `const iosPose=function(){try{fjoyRaz();}catch(e){}try{…panOpen(true);}catch(e){}};`.

### JC-07 (faible) : deux doigts sur NITRO : le second prend le joystick, puis le lever du second le laisse mort. Confiance : PROBABLE
- Commit 8907979b / e092b8ef. Fichier : `code/moteur/mobile-tactile.js:67` (`gliDn` réécrit `GLI.id` sans condition, contre le plan, Task 4 : « GLI.id n'est écrasé que si null »).
- Scénario : le pouce tient NITRO, un deuxième doigt (la paume, l'index) touche la zone NITRO (46vw × 190 px) puis se lève. Le joystick suivait le second doigt. Après son lever, `GLI.id=null` et le pouce, toujours posé et toujours en boost, ne pousse plus rien tant qu'il n'est pas levé. Au même moment, la boule de feu (`nx3Pouce`, qui garde le PREMIER doigt) suit le pouce : le dessin et la logique ne sont pas d'accord.
- Correctif minimal : `const gliDn=function(id,x,y){if(GLI.id!=null&&GLI.id!==id)return;…}`. `gliCoupe` et `fjoyRaz` libèrent déjà sur `touchcancel`, `blur` et la mort.

### JC-08 (faible) : la poussée vibre et le pion claque même quand rien ne part. Confiance : SÛR
- Commit 8907979b. Fichier : `code/moteur/mobile-tactile.js:76-80` contre `code/gameplay/figures-physique.js:301-307`.
- Scénario : auto-école à une étape autre que FIGURE, chute de mort (`mode` 'boom'), intro (`introD`), ou image gelée de plus de 250 ms juste après la poussée. `gliMv` ne vérifie que `started`, `gameOver` et `paused` : il fait vibrer (`hap(8)`), fait claquer le pion, puis `figGJoue` refuse sans bruit (`GLI.refus++`). Le joueur sent une figure « partie » qui ne part pas.
- Correctif minimal : dans `gliMv`, ajouter `||introD||mode!=='fall'&&mode!=='drive'||(TUTO.on&&!tutoFigOuverte())` à la garde `if(!d||!started||gameOver||paused)`.

### JC-09 (faible, performance) : chaque pose du pouce en course recalcule et range les repères (reflow synchrone). Confiance : DOUTEUX (à mesurer)
- Commit b12d86ba. Fichier : `code/gameplay/figures-joystick.js:106` (`figJoyLeg(true)` à chaque `TJ.tenu`), `:77-98`.
- `gliDn` appelle `figJoyVoit(null,0,0)`, qui appelle `figJoyLeg(true)`. Celui-ci réécrit 4 `textContent`, lit 4 `offsetWidth` (mise en page forcée de toute la page du HUD), lit `getBoundingClientRect`, puis cherche environ 10⁴ positions et fait un `dfs`, à CHAQUE appui sur NITRO en course, et à chaque décollage (`figJoyTick`). Sur un 13 Pro bridé à 30 i/s, cela peut coûter quelques ms par appui.
- Correctif minimal : `figJoyLeg(false)` à la pose, avec `innerWidth+'x'+innerHeight` ajouté à `cle` (les repères ne bougent que si les noms, le mode ou l'écran changent).

### JC-10 (note, à décider) : au sol, le double-tap ne fait plus jamais le saut nitro. Confiance : SÛR
- Commit c0c66b21. Fichier : `code/gameplay/vol-equilibre.js:170-171`.
- `frLance` reçoit toujours `{f:t9.f}` (le tirage ne rend `null` que sans aucune figure possédée). Il ne rend donc plus jamais `null`, et `veqSaut()` n'est plus atteint. Avant, un pouce dirigé vers un emplacement vide donnait le saut nitro. La spec (§2) disait « Au sol : le double-tap reste le saut nitro ». Le saut existe encore par le geste au sol (`gsol`, joystick vers l'avant). C'est voulu par le message du commit, mais c'est un écart à la spec : à confirmer avec Sacha.

### Remarques sans défaut
- Seuil au bord de l'écran (SE 375) : le seuil se compte à partir du point d'appui. Un pouce posé sur `#tNitroZone` à moins de 38 px du bord droit ou du bas ne peut pas atteindre ► ou ▼ : clientX ne dépasse pas l'écran, et l'ancre flottante ne recule pas. Sur le disque NITRO lui-même (centre à environ 70 px du bord), ça tient en portrait comme en paysage. Faible.
- Repères après une rotation en vol : `tjPlace` est relancé sur `resize`, qu'iOS envoie avec des dimensions périmées (voir `reflow`, qui attend 280 ms). Ils restent mal placés jusqu'à la prochaine pose du pouce. C'est visuel, et c'est à l'autre agent de le mesurer.
- `figTireAdapte` continue « le sens » d'une figure en cours (`run.s`) même quand la nouvelle tourne sur un autre axe (tonneau contre toupie : le signe n'a pas le même sens). C'est cosmétique.

## 3. Correctifs posés (soir du 10/11), un commit chacun, poussés sur origin/debug-gameplay
Tous dans `code/moteur/mobile-tactile.js` (+ index.html par `node code/assembler.cjs --depuis-morceaux`). Après chacun : assembleur d'accord, `syntaxe.cjs` (seul le script n° 5 échoue, comme avant), `non-declares.cjs` = 53 noms (inchangé).
Preuve : `node passation/debug-gameplay/preuves/jc-joystick-ancre.cjs` rejoue le vrai code (de `const gliDn` jusqu'au volant, écouteurs compris) AVANT (f8f44140) et APRÈS, 15 cas, 15 OK (sortie ≠ 0 au premier KO).

| id | commit | ce qui change | preuve (avant → après) |
|---|---|---|---|
| JC-01 | 71e48b44 | les règles `repos` / `lent` de l'ancre flottante ne jouent que joystick ARMÉ ; après un tir, seul le retour près du centre d'origine (ou le pouce levé) réarme | « haut tenu 1 s puis retour » u@80, d@1120 → u@80 ; « immobile 500 ms puis retour » u@80, d@720 → u@80 |
| JC-03 | 3e16f41c | `orientationchange` (doigt du joystick posé) : ancre à NaN, requête jetée ; le 1er mouvement repose l'ancre dans le nouveau repère sans rien lancer | « pouce posé, le téléphone tourne » r@900 → rien ; vraie poussée après la rotation → u@1080 |
| JC-04 | d22b1e26 | `GLI.dbl` : l'appui qui est le 2e d'un double-tap (`VEQ.dReq` posé dans le même événement par bindHold → veqDoigt) ne tire pas à la poussée — ni figure ni vibration ; il se réarme au retour vers le centre | u@280 → rien ; retour puis repoussée : u@280, u@580 → u@580 |
| JC-07 | a6b4aef1 | un nouveau doigt ne prend le joystick que si celui qui le tient n'est plus dans `e.touches` (un identifiant mort est toujours remplacé) | « 2e doigt posé puis levé, le pouce pousse » rien → u@380 ; identifiant mort : u@280 = u@280 |
| JC-06 | f4559e08 | `fjoyRaz()` en tête d'`iosPose` (pause de Capacitor) | lecture (pas d'événement `pause` dans le banc node) |
| JC-08 | 62770f60 | `gliMv` refuse aussi `introD`, `mode` ni 'fall' ni 'drive', auto-école hors étape FIGURE (les portes de `figGJoue`) : ni vibration ni claquement | auto-école hors FIGURE : vib 1, claque 1 → 0, 0 ; mode boom : idem ; témoin étape FIGURE en vol : u@80 inchangé |
Gestes normaux (témoins, identiques avant/après) : poser-pousser-lâcher (u@80, 1 vibration), poussée-retour-repoussée (u@80, u@380), tenir NITRO en roulant le pouce 2 s (rien), pouce immobile 600 ms puis poussée franche (l@672). Le double-tap seul ne passe pas par `gliMv` (inchangé).
Restes connus : JC-08 ne couvre pas la requête jetée par une image gelée > 250 ms (la vibration est partie à l'événement) ni le refus d'emplacement vide (il a son propre « tchk », voulu). JC-05, JC-09, JC-10 laissés à Sacha.

## 4. JC-02 approfondi (lecture seule — AUCUN code touché)

### (a) Ce qui peut être caché, et pourquoi c'est TOUTES les sessions sur iPhone, pas seulement un joueur neuf
- Le garde ne cache que les objets dont le programme NAÎT EN COURSE (`lierCourseRendu` : à l'entrée en course tout programme existant est rangé « lié », `LIER.hors`). Un programme se partage par clé (`lierBudget(cle)` laisse passer une clé connue) : une matière neuve dont le shader est déjà compilé n'est jamais cachée. Le cache disque des shaders ne change que la DURÉE de liaison, pas la naissance : un `WebGLProgram` naît à chaque session pour chaque variante non chauffée → sans KHR, chaque naissance cache ses objets au moins `LIER.c` (plancher 120 ms) + 1-2 images, même cache chaud.
- La 1re map : bâtie sous le voile (`departAttend`), dessinée HORS course → liée en synchrone → jamais cachée (route comprise).
- Les maps suivantes, d'après les chauffes du menu (`chauffeDivers`, vignette-moteur.js:523-551) :
  · VILLE (tours, panneaux) : `villeChauffe` (instances avec ET sans couleur, ligne-parfaite.js:4) — couverte ;
  · CANYON (relief, grès et roche double face) : `canyonChauffe` (« 0 programme en course ») — couvert pour le relief ; les monuments (`cyMonuMats`) non vérifiés ;
  · GROTTE (roche en blocs, un programme) : `grotteChauffe` — couverte, MAIS GELS-SHADERS.md a mesuré 4 programmes nés au 1er portail vers la grotte (501 ms) avant le garde : quelque chose de la grotte n'est pas chauffé ;
  · JADE (piliers, muraille, mer) : `jadeChauffeProgs(0..3)` (17 programmes) — MAIS mesuré « 4 588 ms + 1 635 ms à l'entrée en jade » avant le garde : la jade est la map la plus exposée (des variantes naissent quand même en course) ;
  · ORBITE (roches de Jupiter, satellites durs JB-02) : `orbiteChauffe` = `renderer.compile(scene)` avec tout l'orbite dans la scène — couvert si ces objets existent au moment de la chauffe ;
  · ce qui n'est JAMAIS chauffé (commentaire de piste-prebati.js:386) : la voiture-fantôme, ce qui naît au hasard (pigeons, traces, pads), et tout ce que la chauffe ne voit pas.
- Chauffe INACHEVÉE : `departAttend` lâche la course après 20 s au plus ; sur iPhone à froid la chauffe finit vers 27-29 s (mesure du dépôt). Un joueur qui tape JOUER tôt part avec des étapes de chauffe non faites → leurs programmes naissent en course.
- Effet secondaire : sous le budget (1 naissance par appel sans KHR), un `renderer.compile` de `prebLie` ne fait naître qu'UN programme par pas ; `jadeChauffeProgs` passe au morceau suivant sans savoir que les autres ont été refusés. La liaison d'avance est donc en grande partie inopérante sur iPhone.
- CE QUI NE PEUT PAS ÊTRE DIT SANS L'APPAREIL : la liste exacte des objets cachés. Elle se lit en course (voir « à mesurer »).

### (b) Combien de temps
- Par programme, sans KHR : naissance (image n) → barrière posée (n+1) → barrière passée → `LIER.c` ms → lecture. `LIER.c` ≥ max(120, 1,3 × durée d'une liaison mesurée au menu), ≤ 900, et ×1,5 à chaque lecture qui a attendu > 8 ms. Les programmes passent UN PAR UN (`lierBudget` refuse toute naissance tant que `LIER.att` n'est pas vide) → le k-ième objet en file attend ≈ k × (c + 50 à 70 ms à 30 i/s).
- Chiffres du dépôt : GELS-SHADERS.md §4 « jusqu'à ~1 s par programme sans KHR sur machine lente » ; pire cas `?chauffe=0` : 25 programmes nés en course (KHR caché) et 48 avec KHR. Avant le garde, 20 à 30 attentes de liaison par partie de 5 min, chauffe normale comprise (= autant de naissances en course).
- Ordres de grandeur : 4 programmes (portail grotte) → 0,8 à 4 s pour le dernier ; 10 à 20 (entrée en jade) → 2 à 20 s ; 25 → 5 à 25 s. Pendant ce temps l'objet est solide (aucune collision ne lit le dessin) et invisible.

### (c) Correctif proposé (le plus sûr qui ne ramène pas les gels) — NON posé : il ne tient pas en peu de lignes sans essai sur l'appareil
1. **La grâce du garde, au point de mort** (`explode`, gameplay/mort.js, juste après `chanceProtege`) : `if(lierGrace(cause)){IMP.frais=-1;return;}` — avec, dans vignette-moteur.js :
   `function lierGrace(c){if(!LIERC.on||!started||gameOver)return false;if(!LIER.att.length&&performance.now()-(LIERC.tRefus||0)>500)return false; /* rien de caché : strictement comme avant */ …parcourir scene : un Mesh/InstancedMesh opaque, visible, à moins de ~60 m de la caisse (sphère englobante en monde ; un InstancedMesh non segmenté, frustumCulled=false, compte comme proche), dont renderer.properties.get(material).currentProgram est absent ou porte __ccAtt===1 → vrai}` ; `LIERC.tRefus=performance.now()` dans `lierBudget` au refus. Le parcours ne coûte qu'à la mort, et seulement quand le garde tient quelque chose.
   ⚠ Le précédent existe AU SOL (le bouclier de la seconde chance ignore un choc : les appelants le supportent), PAS EN VOL : en vol `chanceProtege` replace la caisse (`chanceSafe` + `respawn`). Un choc de vol ignoré (roche, satellite, tour) laisserait la caisse continuer dans l'objet et `explode` serait rappelé à chaque image (le parcours avec) : il faut décider en vol « traverser » (et vérifier qu'aucun appelant ne la bloque) ou « replacer comme le bouclier ». Les CHUTES (bord de route invisible, cause 'vide' / 'air') ne sont pas couvertes : on ne sait pas, à ce point, si c'est la route qui manquait.
2. **Liaison prioritaire** (complément) : `lierPret` sans KHR lit `LIER.att[0]` (FIFO). Ranger en tête les programmes des objets proches de la caisse demande de remonter du programme à ses objets (un parcours de scène par image) : plus cher, à n'envisager qu'après mesure.
3. **Rendre la liaison d'avance utile sur iPhone** : que `prebLie` / `jadeChauffeProgs` sachent qu'un compile a été rogné (`LIERC.refusC` qui monte pendant le pas → refaire le même morceau au pas suivant) ; c'est le vrai remède (rien ne naît plus au portail), sans gel ajouté, mais à vérifier au banc `?lier=t`.
Ce qu'il ne faut PAS faire : borner l'invisibilité en forçant la lecture (mon diff du §2, JC-02) — c'est exactement le gel que 136205b0 a retiré.

### À mesurer sur un vrai iPhone (app, inspecteur Safari branché)
1. `dbgLier().garde` au menu puis 10 s après chaque portail : `temps` (doit être vrai : pas de KHR), `etalon`, `delai`, `nes`, `sautes`, `refus`, `refusCompile`, `blocMax` ; et `dbgLier().enCours` toutes les 250 ms à partir du portail → la durée réelle pendant laquelle quelque chose est caché.
2. Ce qui est caché, à l'instant : `(function(){const R=[];scene.traverse(o=>{if(!(o.isMesh)||!o.visible||!o.material)return;const M=[].concat(o.material);for(const m of M){const p=renderer.properties.get(m).currentProgram;if(!p||p.__ccAtt===1)R.push([o.name||o.type,m.type,p?p.name:'pas né',Math.round(o.getWorldPosition(new THREE.Vector3()).distanceTo(carGroup.position))]);}});return R;})()` lancé 0,5 / 1 / 2 / 4 s après chaque portail (jade, grotte, ville, canyon, orbite), JOUER tapé tôt (avant la fin de la chauffe) ET tard.
3. Les morts pendant cette fenêtre : `?cause=1` et noter la cause + la liste du point 2 au même instant.
4. Témoin : la même course avec `?garde=0` (les gels reviennent, rien n'est caché) pour comparer les causes de mort.
