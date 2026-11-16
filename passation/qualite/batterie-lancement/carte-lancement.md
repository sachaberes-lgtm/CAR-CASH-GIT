VITESSE DE LANCEMENT (iOS) : rapport en lecture seule (worktree /Users/sachaberes/cash-car/qualite, branche qualite-appareil b241a7d51). Je n'ai rien modifié, rien committé, et je n'ai lancé ni navigateur ni build.

## 0. À corriger d'abord : `demarrage-vite` est DÉJÀ fusionnée
La note de mémoire qui la dit « pas fusionnée » est périmée. Voici ce que j'ai vérifié :
- `git log origin/main..origin/demarrage-vite` est vide, et `merge-base --is-ancestor` le confirme : la branche est dans main ET dans HEAD.
- Fusion sur main par 701174953, le 13/11 à 02:37, sous le titre « Fusion origin/demarrage-vite… cache v1543 ». Elle est aussi entrée dans ios-ultime v1544 (PLAN-ULTIME.md:393).
- `git merge-tree --write-tree HEAD origin/demarrage-vite` rend d6036b0f8, exactement l'arbre de HEAD. Il n'y a donc rien à fusionner et aucun conflit.
- Après elle, d'autres correctifs du démarrage sont aussi dans HEAD :
  - bb0572eb1 : Crypto City n'est plus compilée sous le serpent quand elle est hors du tirage ;
  - 2a45f9692 : la sonde du serpent n'enrobe plus le WebGL dans l'app App Store.

**Ce que la branche apporte** (passation/DEMARRAGE-VITE.md) :
- **Le chargement dense sous le serpent** (code/interface/vignette-moteur.js:423-440) :
  - `DENSE_MS=28` et `DENSE_RENDU=1000` : le menu n'est dessiné qu'une image par seconde ;
  - les 31 paliers de moteur se lient ensemble (`denseMoteur`, l.426) ;
  - les tôles se découpent pendant les attentes de liaison ;
  - la 1re piste est bâtie en tranches de 28 ms au lieu de 6-8 ms ;
  - interrupteur : `?sans=dense`.
- **Les photos de caisses seulement quand elles sont en vue** (`PHOTO_VUE`, vignette-moteur.js:526 ; interrupteur `?sans=photovue`).
- **Au banc (processeur ralenti ×4)**, « prêt » passe de 28,6-30 s (plafond) à 12,1-15,9 s.

**Ses risques** :
- Mesuré au banc seulement. Aucun chrono propre sur le 13 Pro après la fusion : aucun rapport ne donne de « prêt en … » plus récent que le build 79 (23,6 s, téléphone en CRITICAL).
- Inconnue : sur Metal, la liaison groupée des ~100 programmes se fait peut-être en file. Dans ce cas il n'y a pas de gain, mais pas de perte non plus.

## 1. La chronologie aujourd'hui (13 Pro, cache Metal chaud)
Sources : passation/ios-ultime/CRASH-CHARGEMENT.md §4 et le code.
- Lecture du script : 0,8-1 s.
- Puis le travail sous le serpent jusqu'à « prêt », environ 13 s. Cela vient de `INTRO_APRES=1` sur téléphone (code/rendu/soleil-planete.js:598), une décision de Sacha du 8/11 : « rallonge le chargement s'il le faut ».
- Puis 0,4 s de pause avant le film (`INTRO_DRAIN`, code/moteur/intro-161.js:1022).
- Puis le film : environ 4 s jusqu'au logo (`TL`, intro-161.js:54-57, ×0,8 si la leçon est faite), puis le toucher, puis 1,45 s de casse (l.58).
- Total jusqu'au menu jouable : environ 18-20 s.
- À froid (1er lancement après l'installation d'un build) : environ 26 s de compilation Metal (iPhone 15 de Léo).

Ce qui bloque « prêt » est listé dans `introPrete()` (intro-161.js:1023-1037), dans cet ordre : chauffe-intro → étapes → lier → chauffe (~176-236 programmes, plus les 31 moteurs) → tôles → départ d'avance → lit → coup-appui.

**Déjà fait, à ne pas refaire :**
- les sons à la demande (VERSION PRINCIPALE/sfx.js:77-115) ;
- la banque de sons coupée en deux (outils/scinde-banque.cjs) ;
- pas de service worker dans l'app (preparer-www.js:8, natif.js:75-78) ;
- l'écran de lancement retiré au DOMContentLoaded (natif.js:204-206) ;
- le serpent natif, dessiné par iOS hors de la page ;
- l'empreinte des photos gravée dans l'app (preparer-www.js:119-127) : les photos ne sont plus refaites à chaque build ;
- la liaison KHR parallèle (`lierPret`) ;
- l'économie d'énergie connue avant la 1re ligne du jeu (`__ccEco`, JeuViewController.swift:23).

Côté qualite-appareil, rien n'alourdit le lancement du 13 Pro :
- integ.md dit « même nombre de programmes que sans profil » ;
- la classe 1 a nMax=N2, donc pas d'ombres PCFSoft ni de halo à 5 étages.

## 2. Les propositions, classées gain/risque

**P1. Mesurer d'abord où partent les 13 s sur le téléphone** (gain direct : 0, mais c'est ce qui permet de choisir la suite ; risque : nul)
- Problème : `introPoll` (intro-161.js:1055-1062) n'écrit « attend X » que toutes les 5 s. On ne sait donc pas combien dure chaque étape.
- Proposition : écrire dans la boîte noire l'instant où chaque étape de `introPrete` se libère. Une seule ligne au « prêt », par exemple « étapes 1,2 · lier 3,0 · chauffe 9,8 · tôles 10,4 · départ 12,9 ». Y ajouter `dbgDense()` et `renderer.info.programs.length`.
- Preuve sans téléphone : le banc `outils/banc-demarrage/lancement.cjs --cpu 4` doit montrer la ligne, avec 0 erreur.
- Sur le téléphone : `outils/banc-perf/boite-noire.sh`, ligne `chargement`. Comparer 3 lancements à froid et 3 à chaud, téléphone en nominal et **débranché**. Le memo banc-de-chaleur rappelle que la charge chauffe le téléphone, et la chaleur allonge le lancement.

**P2. Le script du jeu en fichier dans l'app, par défaut** (gain : environ 250 ms à chaque relancement ; risque : très faible)
- C'est déjà codé : `--jeu-fichier` (app-ios/preparer-www.js:321-327). Il a été mesuré sur le build 17 : DCL de 935 ms à 660-694 ms, grâce au cache de bytecode de WebKit (passation/PASSE3-P4.md).
- Mais l'option n'est passée nulle part :
  - app-ios/package.json:8 (`sync`, utilisé par archiver.sh:14) ;
  - app-ios/publier-maj.js:44 (les mises à jour en direct).
  - Le www/ actuel a bien le script en ligne (index.html de 6,5 Mo, pas de jeu.*.js).
- À changer : ajouter `--jeu-fichier` aux deux endroits, sinon une mise à jour en direct remettrait le script en ligne.
- Preuve sans téléphone : `node app-ios/preparer-www.js --essai --jeu-fichier`. La relecture `garde-demarrage` passe déjà dans le script.
- Sur le téléphone : ligne `chargement | jeu fichier · origine→DCL …` au 2e lancement, comparée au build d'avant.

**P3. Retirer les programmes en double** (gain : peut-être 1-4 s à froid, 0,5-2 s à chaud ; risque : faible si l'image reste identique au pixel, mais demande de l'effort)
- Estimation : 26 s pour ~176 programmes à froid, soit ~0,1-0,15 s par programme. Chaque programme évité est autant de moins sous le serpent.
- Le nombre est monté de 182 à 236 au build 80 (PLAN-ULTIME.md:379).
- Méthode : un banc Chrome qui regroupe `renderer.info.programs` par source de shader. On cherche les jumeaux qui ne diffèrent que par un define ou une clé (`customProgramCacheKey`, `onBeforeCompile`, fog, toneMapped).
- Hors maps : les maps sont interdites, les programmes qui en viennent ne se touchent pas.
- Preuve sans téléphone : le nombre de programmes avant/après, et des photos identiques (outils/banc-qualite).
- Sur le téléphone : `dbgChauffe().programmes` et la durée de « chauffe » (P1).

**P4. Garder les tôles d'un lancement à l'autre** (gain : jusqu'à 1-2 s sur « prêt », selon P1 ; risque : moyen, à cause de la mémoire et des versions)
- `chauffeApres` (vignette-moteur.js:606-615) découpe à chaque lancement 9 tôles par CSG : perleTraits ×2, japChauffe ×5, rondesChauffe ×2. Au banc ×4, une tôle peut prendre jusqu'à 2 s.
- Idée : les ranger dans IndexedDB comme les photos (`PHDB`, gameplay/frole-contrats.js:327-329), avec la même empreinte `CC_PHOTOS`.
- À faire seulement si P1 montre que « tôles » est la dernière étape à se libérer.
- Preuve sans téléphone : au banc, 2e lancement sans l'étape « tôles », et une géométrie identique (comparer les sommets).

**P5. La 2e moitié des sons après le menu** (gain : 100-300 ms de moins sous le serpent, estimé pour l'analyse d'un script de 6 Mo ; risque : faible à moyen)
- Aujourd'hui, `sons-banque-2.js` (6 Mo de base64) est chargé 500 ms après `load` (sfx.js:146-153). WebKit n'a pas `requestIdleCallback`, donc c'est le `setTimeout` qui joue : il tombe en plein chargement dense.
- Proposition : sur téléphone, le charger à `cc:revele`.
- Risque : une course lancée dans la seconde qui suit le menu aurait des sons absents. Ils sont déjà décodés à la demande, donc le pire est un son tardif ou muet.
- Preuve sans téléphone : au banc, `--suite 1`, puis `CCSON.etat()` (`tard`, `perdus`).
- Sur le téléphone : la ligne `chargement` et les trous mesurés par le guet.

**P6. Le film plus court au relancement** (gain : 1-3 s à chaque lancement ; risque technique : nul ; c'est une décision de DA, donc pour Sacha)
- Le film n'est que du temps ajouté après « prêt » : K=0,8 si la leçon est faite (intro-161.js:52-53).
- Existe déjà : un toucher pendant le 1.61 saute au logo (`sauterAuLogo`, l.845-849). Sacha peut l'essayer tout de suite.
- Proposition : à partir du 2e lancement, K=0,6, ou aller droit au logo.
- Mesure : la ligne `intro` de la boîte noire.

**P7. Ne plus faire attendre le film pour le départ d'avance** (gain : 0,5-3 s sur « prêt » ; risque : moyen, car cela revient sur la règle de Sacha du 8/11 « pas de latence au menu »)
- Ce sont les lignes « depart-avance » de `introPrete` (intro-161.js:1029-1030).
- Le départ serait bâti au menu, en 3-6 ms par image, comme avant le 13/11. Le risque : la tâche de ~400 ms que le banc voyait dans les premières secondes du menu peut revenir.
- À faire seulement si P1 montre que c'est la dernière étape à se libérer.

**P8. Du JOUER à la course : la grotte** (gain : jusqu'à environ 15 s de voile évitées ; risque : moyen, car le tirage de la map change de moment)
- Le Worker creuse la grotte pendant 13,1 s sur le 13 Pro. Il démarre au menu ou à l'écran de fin, si bien qu'un JOUER ou REJOUER rapide garde le voile jusqu'à 20 s (`departAttend`, vignette-moteur.js:396-402). Au banc : 15,7-16,1 s.
- Proposition : tirer la map suivante et lancer son Worker au DÉBUT de la course, dans moteur/depart-avance.js. Le Worker lui-même est dans maps/, qui est interdit, mais il n'a pas besoin d'être touché.
- C'est une décision pour Sacha et Léo, à cause du moment du tirage.
- Sur le téléphone : la ligne de la boîte noire `attente | départ attendu N ms (…) · map …` existe déjà. Il faut la compter avant de décider.

**À écarter ou laisser de côté :**
- **Le service worker** : déjà absent de l'app.
- **`loggingBehavior:"debug"`** (capacitor.config.json) : sans effet en Release.
- **Le mode économie d'énergie** : la vue web est alors à 30 i/s, mais les tranches denses de 28 ms tiennent dans 33 ms, donc presque rien n'est perdu.
- **Le pivot pendant l'intro** (506 ms) : verrouiller le portrait en natif, cas rare.
- **La chaleur pendant la charge** : c'est elle qui allonge le plus le lancement quand Sacha joue branché. On ne peut rien y faire côté code de lancement ; c'est une affaire du gouverneur et du sujet batterie.

## Ordre conseillé
1. P1 (mesurer) et P2 (le plus rentable pour le moins de risque) tout de suite.
2. Puis P3, qui pèse aussi sur chaque 1er lancement après une mise à jour de l'App Store.
3. P4, P5 et P7 seulement si P1 désigne leur étape.
4. P6 et P8 sont à décider par Sacha.