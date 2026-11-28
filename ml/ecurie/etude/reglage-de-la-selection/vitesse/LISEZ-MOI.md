# Vitesse : où part le temps d'une course, et comment en jouer plus par heure (27/11/2026)

## En une minute

La question : la sélection naturelle ne peut pas aller plus vite que les courses qu'elle joue (une génération = 312 courses), alors où part le temps d'une course, et peut-on en jouer deux fois plus par heure sans changer un seul résultat ?
La réponse : environ un quart du temps d'une course passe avant que la voiture roule (ouvrir le jeu, bâtir la première piste), et presque tout le reste passe dans la boucle du jeu lui-même ; le pilote (son « cerveau ») ne prend que 2 % du temps et ses yeux 5 à 6 %.
Le chiffre qui tranche : une seule fonction du jeu, celle qui peint le ciel reflété sur la carrosserie (`envCielCalc`), prend 11 % d'une course courte (85 s de jeu), soit environ 3 à 6 % du temps d'une génération entière (corrigé à la relecture : voir « Relecture »), alors que dans le simulateur personne ne voit ce dessin ; remplacée par un dessin noir, deux courses sur deux redonnent exactement la même course au bit près.
Je recommande de faire ce remplacement, en même temps que le prochain changement d'époque déjà prévu (l'arrivée du génome v:2 sur le Ryzen en change une de toute façon), après une preuve sur 24 courses connues ; puis de lancer les courses les plus longues en premier, ce qui est gratuit.
Les accélérations qui ne changent aucun résultat font gagner environ 9 % (14 % si l'on rend exact « plusieurs courses par processus », ce qui n'est pas le cas aujourd'hui ; l'étude disait 13 % et 24 %, corrigés à la relecture) : on n'atteint pas « deux fois plus » sans changer le jeu ou les yeux ; ce facteur deux viendra du Ryzen lui-même.
Ce que je ne sais pas : le gain du ciel n'est mesuré que sur deux courses du témoin, et le PC était plein pendant les mesures, donc les temps absolus sont plus lents que d'habitude (les parts en %, elles, concordent entre les mesures directes et les données).

## Ce qui a été lu, ce qui a été joué

- **Les données réelles** (en lecture seule) : `C:\Users\sacha\code\CASH-CAR-evolution-essai\ml\evolution\etat\`, **copiées le 27/11 à 23:16:43** dans `donnees/` (567 lignes dans `courses-2026-48.jsonl` : 240 d'entraînement et 40 de coffre pour la génération 0, 287 de la génération 1 en cours ; `generations.jsonl` 1 ligne ; `population.json` ; `sortie.log` 554 lignes ; le texte du témoin `pilotes/9830f1c4e6fd.js`). Rien n'a été lancé ni écrit dans ce dossier.
- **Quatre courses jouées**, une à la fois, toutes du témoin `19e3767cc346`, tmax 120, sur deux graines du coffre déjà jouées par la vraie évolution (le PC faisait tourner en même temps la vraie évolution à 4 courses à la fois : charge processeur 99 % au départ) :

| course | graine | ce qui a changé | fichier |
|---|---|---|---|
| 1 | 990000 | rien ; profil CPU (`node --cpu-prof`) | `profils/course1-*` |
| 2 | 990000 | rien ; minuteries du jeu chronométrées (sans effet sur la course) | `profils/course2-reference.json` |
| 3 | 990000 | `--sans-ciel` (le ciel reflété remplacé par des faces noires) | `profils/course3-sans-ciel.json` |
| 4 | 990740 | `--sans-ciel` ; profil CPU | `profils/course4-*` |

**Les quatre courses redonnent les trois empreintes de la vraie évolution** (`empreinte`, `empreinteVues`, `empreinteTouches` : `f5f205bdbdf4 / f5fec56f495e / a089132e9b69` pour 990000, `ef0c699d0392 / b7a4e520da88 / 4a26f72f8041` pour 990740). C'est le contrôle de la méthode : la course chronométrée est bien celle que la sélection a jouée, et le profileur ni le chronométrage ne la changent.

## Méthode

1. `analyser-donnees.js` : sur les 567 lignes, le temps de boucle (`ms`, que `ml/bot/piloter.js` mesure **seulement autour de la boucle**, ni le processus ni le chargement) contre la durée de jeu (`survie_s`) ; le coût **fixe** (tout ce qui n'est pas dans `ms`) déduit des fenêtres où les 4 travailleurs sont pleins : 4 × durée de la fenêtre = somme des (fixe + boucle) ; la part du cerveau (`cerveau_ms_moy` × 10 décisions par seconde) ; les courses en double. Contrôle du script : une droite exacte redonne ses coefficients.
2. `chronometrer.js` : le même travail que `ml/evolution/enfant.js` (`jouer`), mêmes fonctions, même ordre, avec l'heure de chaque étape et les comptes des yeux (`bilan.yeux`). `analyser-profil.js` découpe un profil CPU par famille de code et par étape (contrôle : la somme des temps propres redonne la durée du profil, écart −0,09 % et −0,03 %).
3. `fonctions-cheres.js` : lit le texte des fonctions chaudes dans `VERSION PRINCIPALE/index.html` pour savoir si elles tirent au hasard (contrôle : une fonction qui contient `Math.random` en clair sort « tire »). Le jeu tire **tout** du même générateur : une fonction qui tire ne peut pas être sautée sans décaler toutes les routes.
4. `compilation.js` : compile seulement (sans l'exécuter) le script du jeu, avec et sans cache de code V8. Aucune course.
5. `estimer-gains.js` : rassemble tout en gains par génération. `preuve-identite.js` : l'outil de preuve proposé (seul son mode `--a-sec` a tourné).

## Résultats

### 1. Le temps d'une course en fonction de sa durée de jeu (données réelles, 4 à la fois sur le Xeon)

`boucle_s = −10,26 + 0,608 × survie_s` (R² 0,80, n 567) : une droite à ordonnée négative, parce que les courses longues vont moins vite (elles traversent des maps plus lourdes). En moyenne **1,89 s de jeu par seconde de calcul**.

| survie | courses | survie moy. | boucle moy. | × temps réel |
|---|---|---|---|---|
| 0–15 s | 4 | 13,6 s | 5,6 s | 2,45 |
| 15–30 s | 54 | 21,6 s | 9,2 s | 2,35 |
| 30–60 s | 70 | 45,8 s | 17,3 s | 2,64 |
| 60–120 s | 163 | 94 s | 47 s | 2,00 |
| 120–240 s | 220 | 168,7 s | 88,9 s | 1,90 |
| 240–900 s | 56 | 298,3 s | 178 s | 1,68 |

**Le coût fixe** (processus neuf, chargement du jeu, première piste, mesures), d'après les fenêtres pleines :

| fenêtre | courses | par course et par travailleur | dont boucle | coût fixe |
|---|---|---|---|---|
| génération 1 (en cours, pas de fin de génération) | 287 | 110,6 s | 83,6 s | 25,4 à 26,9 s (24 %) |
| génération 0 après la reprise (fin de lot comprise) | 218 | 75,6 s | 55,8 s | au plus 19,8 s (26 %) |
| coffre | 40 | 75,4 s | 53,4 s | au plus 22 s |

La génération 1 tourne plus lentement que la 0 (110,6 s par course contre 75,6) : le PC était plus chargé le soir (autres études, un test) et les courses plus longues. Au rythme de la génération 1, **une génération de 312 courses prend 143,8 min (130 courses/h)** ; le tableau de bord disait 191 courses/h pour la génération 0.

**Les courses très courtes** : il n'y en a presque pas (4 sous 15 s, 58 sous 30 s sur 567). Une course de 15 à 30 s est faite à 74 % de coût fixe, mais toutes les courses de moins de 30 s ensemble ne prennent que **3,8 %** du temps des travailleurs. Le coût fixe pèse surtout parce qu'il est payé par **toutes** les courses : 24 à 28 % du temps total.

### 2. Une course, étape par étape (mesure directe, une course seule)

| étape | course 2 (990000, 85,3 s de jeu) | course 4 (990740, 107,7 s, sans ciel) |
|---|---|---|
| démarrage de node, require du bot | 0,12 s | 0,13 s |
| **ouvrir le jeu** (lire 13 Mo, compiler, chauffe, photo de l'état propre) | **6,7 s** | **5,2 s** |
| charger le pilote dans son bac | 0,02 s | 0,02 s |
| **mise en piste** (`J.lancer` : remise, `resetGame`, la première piste bâtie) | **5,0 s** | **4,5 s** (le relief du canyon) |
| la boucle de course | 30,9 s | 48,5 s |
| mesures et résultat | 0,01 s | 0,01 s |
| **total** | **42,7 s** | **58,3 s** |
| part fixe | 27,9 % | 16,8 % |

~~La part fixe mesurée seule (28 % pour la course 2) concorde avec celle tirée des données (24 à 26 %).~~ (Relecture) Les deux parts ne se comparent pas : 28 % est la part d'une course courte, 24 à 26 % celle de la génération moyenne. En secondes, la mesure directe explique 11,8 s de hors-boucle ; les données en donnent 26,2 s en moyenne, 16,2 s en médiane, 9,5 s pour les 10 % les plus rapides (`relecture/cout-fixe-par-course.txt`, course par course). Environ la moitié du hors-boucle moyen n'est pas expliquée par cette mesure.

**Les familles de code** (profil CPU, temps propre, course 1 / course 4) : le jeu (`index.html`) 77,9 % / 78,9 % ; natif (JSON, vm, regex) 7,7 % / 3,2 % ; le simulateur 5,0 % / 4,8 % ; three.js 3,8 % / 8,2 % ; le pilote dans son bac 1,1 % / 0,7 % ; le ramasse-miettes **0,4 % / 1,3 %**.

**En temps inclus** (la fonction et ce qu'elle appelle), course 1 / course 4 :

| quoi | course 1 | course 4 |
|---|---|---|
| `loop` (une image du jeu) | 67,6 % | 74,9 % |
| **les yeux** (`__YEUX`, 10 vues par seconde) | **5,9 %** | **5,0 %** |
| **le cerveau** (`decide`) | **2,2 %** | **1,7 %** |
| `resetGame` / bâtir la piste (mise en piste) | 10,8 % | 7,3 % |
| `loadGame` (le faux navigateur) | 5,8 % | 3,2 % |
| **`envCielCalc`** (le ciel reflété) | **11,3 %** | 1,9 % (la chauffe seule : le reste remplacé) |
| `nfeuPas` (la flamme de nitro) | 10,2 % | 9,0 % |
| minuteries du jeu (`tick`) | 0,1 % (62 ms chronométrées) | 0,2 % |

Les yeux : 740 vues au sol et 114 en vol (course 1), 2,9 ms par vue en moyenne, 1 136 images intégrées par vue en vol ; au canyon une vue en vol coûte 42 ms (course 4), mais il n'y en a que 45. Le cerveau : 1,05 ms par décision (données : médiane 1,10 ms, **2,4 %** des boucles sur les 567 courses).

**Les fonctions les plus chères** (temps propre, course 1) : `envCielCalc` 11,1 %, `loop` 10,8 %, `nfeuPas` 8,6 %, `J.image` 4,4 % (le simulateur : ce ne sont **pas** les minuteries, chronométrées à 62 ms ; non expliqué), `ventDessine` 3,5 %, `updateMoneyRain` 3,1 %, `pickupsTick` 3,0 %. Course 4 (canyon) : `loop`, `nfeuPas`, puis le relief du canyon et les voxels de la jade (`contour`, `cyMondeCalc`, `jadeGeoCompacte`…), bâtis en route.

Ce que `fonctions-cheres.txt` lit dans leur texte : **`envCielCalc` ne tire pas au hasard, n'appelle aucune fonction du jeu et ne rend que ses six faces** (des octets qui ne vont qu'à un faux canevas) ; `nfeuPas`, `updateMoneyRain`, `sillageStep`, `nuPouTick` tirent eux-mêmes ; `ventDessine` et `pickupsTick` appellent des fonctions qui tirent.

### 3. Les accélérations

#### (a) Celles qui ne changent aucun résultat

| | changement | gain sur une course | gain sur une génération (143,8 min) | preuve | coût |
|---|---|---|---|---|---|
| A1 | le ciel reflété (`envCielCalc`) remplacé par des faces noires dans le simulateur | ~~9,3 % (5,8 à 12,8)~~ **3,3 à 5,8 %** de la génération (relecture) | ~~13,3 min~~ **5 à 8 min** | 2 courses sur 2 identiques au bit près (déjà fait) ; à faire : 24 courses connues | une nouvelle époque des courses (fichier du simulateur) |
| A2 | un processus joue plusieurs courses à la suite (ouvrir payé une fois) | ~~12,4 % (9,0 à 15,8)~~ **4,7 à 6,1 %** mesuré (plus, peut-être, si le hors-boucle inexpliqué vient du chargement : non mesuré) | ~~17,8 min~~ **7 à 9 min** | **aujourd'hui FAUX** : `ml/reel/README.md` (25/11) mesure que l'espace et la grotte s'écartent dans un même processus | réparer l'état qui reste d'abord ; nouvelle époque |
| A3 | ne pas rejouer un enfant dont seuls des gènes inertes ont changé | ~~3,8 % (1,9 à 3,8)~~ **~0,1 %** (relecture : le clone observé n'est pas de ce type) | ~~5,5 min~~ **~0,1 min** | gène par gène, par lecture de `modele.js` | nouvelle époque (`modele.js`) ; piège : les lignes portent l'`id` du premier pilote |
| A4 | cache de code V8 pour le script du jeu | ~~0,6 %~~ **0,2 %** de la génération (au plus ~0,7 supposé) | ~~0,9 min~~ **0,3 min** | la compilation ne change pas la sémantique ; empreintes | nouvelle époque (`sim-env-reel.js`) ; 2,7 Mo de cache |
| A5 | lancer les courses les plus longues d'abord | 0,2 % mesuré sur le Xeon, jusqu'à ~3 % supposé sur 12–16 travailleurs | 0,3 min | l'ordre de lancement ne change aucune course (un processus neuf chacune) | **aucune époque** (`evoluer.js` n'en fait pas partie) |
| — | options de mémoire de node | ramasse-miettes 0,4 à 1,3 % | rien | — | à ne pas faire |
| — | « préchauffer » le processus suivant pendant une course | 0 sur un PC plein : le chargement reste du calcul | rien | — | à ne pas faire |

Cumulés (estimer-gains.js) : ~~sans A2, −13,4 % : 124,4 min par génération, 150 courses/h au lieu de 130 ; avec A2 rendu exact, −24,2 % : 109,1 min, 172 courses/h.~~ (Relecture, `relecture/gains-rapportes.txt`) **sans A2, −8,6 % : 131,4 min par génération, 142 courses/h au lieu de 130 ; avec A2 rendu exact, −13,5 % : 124,3 min, 151 courses/h.** **Deux fois plus (−50 %) n'est pas atteignable sans changer les courses.**

**Comment prouver chacune** (la règle : les trois empreintes identiques sur N courses déjà connues, dans des processus neufs) :
- A1, A4 : `node preuve-identite.js --lignes <copie de courses-*.jsonl> --pilotes <copie de etat/pilotes> --n 24 --options "--sans-ciel"` choisit une course par cause de fin (8 causes dans les données, donc des maps différentes), puis les plus longues ; exiger 24/24, puis `ml/bot/verifier.js` (le contrat du simulateur). Coût : 30 min à 1 h de calcul sur le Xeon, une course à la fois (3 827 s de jeu). Pour la version réelle (le remplacement fait dans le simulateur, avant la chauffe), refaire la même preuve avec le code réel et non avec `chronometrer.js`.
- A2 : `chronometrer.js --deux` (écrit, pas lancé) sur les 7 maps, puis la même preuve, chaque course étant la k-ième de son processus ; à garder ensuite en contrôle permanent (une course sur 20 rejouée dans un processus neuf).
- A3 : pour chaque gène, la liste des drapeaux sans lesquels il n'est pas lu ; un test qui fabrique un enfant ne différant que par ces gènes et vérifie que son texte de pilote est identique à celui du parent.
- A5 : rien à prouver sur les courses ; vérifier que `courir` rend toujours les lignes dans l'ordre des tâches.

#### (b) Celles qui changeraient les résultats — listées, PAS recommandées

Elles changent le pilote, les yeux ou le jeu, donc l'époque **et la nature de la course** : Sacha doit être prévenu avant, et un autre PC qui note un champion doit avoir les mêmes yeux.

| changement | ce qu'il pourrait gagner (mesuré) | pourquoi il change les résultats |
|---|---|---|
| moins de rayons, moins d'images par rayon | **5 à 6 % au plus** (les yeux entiers) | le pilote voit autre chose ; le gain est trop petit pour valoir une époque |
| décider moins souvent que 10 fois par seconde | ≤ 8 % (yeux + cerveau) | les vrais joueurs ne réagissent pas plus lentement ; autre conduite |
| pas de temps plus gros (30 images/s au lieu de 60) | jusqu'à ~35 % (la boucle fait 68 à 75 % du temps) | une autre physique que celle des joueurs : contraire au but « qu'on ne distingue pas d'un vrai joueur » |
| couper les effets visuels qui tirent au hasard (flamme de nitro, pluie de billets, vent, sillages) | ~15 à 19 % (temps propres additionnés, course 1) | ils tirent dans le même générateur que la route : toutes les routes changent, et le rejeu dans un vrai navigateur s'écarte |
| tmax plus court, ou couper les courses « perdues d'avance » | variable | le palier mesuré est plafonné ; la note change |
| moins de graines par génération | proportionnel | la note devient plus bruitée (voir l'étude du bruit) |

### 4. Les courses jouées pour rien (données réelles)

- **Une même clé jouée deux fois : 0.** Le cache fait son travail.
- **Une course identique au bit près à celle d'un autre pilote sur la même graine : 50 sur 567 (8,8 %)**, mais surtout des courses courtes (survie médiane 47,4 s, 33 sur 50 sous 60 s) où le changement du mutant n'a pas encore servi : **3,8 % du temps de boucle**. On ne peut pas les éviter avant de les jouer.
- **Un enfant qui conduit exactement comme son parent : 1 naissance sur 6 de la génération 1** : `9627905cd5bb` (mutation de `figTemps` et `bVersRoutePlane`) = son parent `3032bf8184f5` sur 11 graines sur 11, soit 12 courses sur 312 (3,8 %). ~~comme l'estimait INTERFACES.md § 9.5. C'est ce que A3 viserait.~~ (Relecture) Ce n'est PAS ce que A3 viserait : `bVersRoutePlane` est lu sans drapeau gardien (`ml/evolution/modele.js`, `prime`, lignes 321 et 400) ; la mutation n'a simplement changé aucune décision sur 11 graines, ce qu'on ne peut savoir qu'après avoir joué. Et INTERFACES.md § 9.5 dit « ~4 % des enfants » (des réglages de gestes éteints, génome v:2), pas 4 % des courses.
- Le contrôle : une graine où la même `empreinte` de course va avec des touches différentes (l'empreinte de course ne hache que l'état grossier aux décisions) ; c'est pourquoi les doubles sont comptés sur les **trois** empreintes ensemble.

## Les propositions de changement (écrites, non faites)

1. **A1 — `ml/reel/jeu-reel.js`, fonction `creer`**, juste après `const g=(opts.charge||loadGame)(...)` et avant `ev('(start(),1)')`, seulement si `!opts.charge` (le vrai navigateur de la salle de projection garde son ciel) : `ev('envCielCalc=function(stops,s1,s2,sunHalo,sd,T,ECL,S){const O=[];for(let f=0;f<6;f++)O.push(new Uint8ClampedArray(S*S*4));return O;}')`, avec un commentaire de section daté. **Gain attendu : ~~6 à 13 % par course, ~13 min par génération~~ 3,3 à 5,8 % d'une génération, 5 à 8 min sur le Xeon (relecture). Coût : une nouvelle époque des courses** (les notes repartent de zéro, les pilotes restent) — à grouper avec celle du génome v:2. **On saura si c'était vrai** : 24/24 empreintes identiques avec `preuve-identite.js`, `verifier.js` passe, puis le débit du tableau de bord (courses/h) sur la première génération. ~~Vérifier d'abord qu'un appel n'a pas lieu pendant `loadGame` lui-même (sinon le remplacer dans `sim-env-reel.js`, après `vm.runInContext(code2,…)` : non vérifié).~~ (Relecture, `relecture/appelants-ciel.js`) Dans les deux profils, aucun appel n'a lieu dans `loadGame` : celui de la chauffe vient de `creer → attendPiste → J.image → loop → chargementTick → … → bioGo → paintEnv`, donc après `loadGame` ; l'endroit proposé l'atteint.
2. **A5 — `ml/evolution/evoluer.js`, fonction `courir`** : appeler `ctx.ord.demander([t])` dans l'ordre des durées attendues décroissantes (la survie moyenne du pilote dans `ctx.lignes`, celle du parent pour un nouveau-né), mais ranger les promesses à l'index d'origine, pour que `L` garde l'ordre des tâches. **Gain : 0,2 % sur le Xeon, jusqu'à ~3 % supposé sur le Ryzen avec 12 à 16 travailleurs. Coût : quelques lignes, aucune époque. On saura** en comparant le temps inoccupé de fin de génération (dernières lignes de `sortie.log`) avant et après.
3. **A3 — `ml/evolution/modele.js`, `ecrirePilote`** : écrire un gène dont le drapeau gardien est éteint à sa valeur de naissance, pour que deux génomes qui conduisent forcément pareil donnent le même texte, donc le même `shaPilote` et un passage par le cache. À ne faire qu'après la liste des gènes gardés et une vérification de la manière dont `note.js` rattache une ligne à un pilote (une ligne du cache porte l'`id` du pilote qui l'a jouée). ~~Gain ≤ 4 %. Confiance moyenne.~~ (Relecture) Gain ~0,1 % (≈ 0,24 enfant inerte par génération d'après § 9.5, 12 courses chacun, plus ses générations suivantes tant que le parent vit : non mesuré). Ne vaut pas une époque à lui seul.
4. **A2** : pas de proposition de code tant que l'écart de l'espace et de la grotte (`ml/reel/README.md`, 25/11) n'est pas trouvé ; c'est le plus gros gain exact possible (~12 %), mais c'est un chantier.
5. **A4 — `ml/reel/sim-env-reel.js`, `loadGame`** : un `vm.Script` avec `cachedData` lu d'un fichier gardé à côté (refait si `jeu_sha` change). 0,6 % mesuré : à ne faire que si l'on touche ce fichier pour autre chose.

## Les limites

- **Le PC était plein** pendant les 4 courses (la vraie évolution à 4 courses à la fois plus un test ; 99 % au départ) : les temps absolus mesurés seuls sont plus lents qu'à vide (la boucle de la course 990000 a pris 30,9 s seule, contre 26,7 s dans la vraie évolution à 19h52). Les **parts** en % sont ce qui compte, et la part fixe concorde (28 % seule, 24 à 26 % dans les données).
- **Deux graines, un seul pilote** (le témoin) pour les profils : les parts changent avec les maps (le canyon et la jade bâtissent beaucoup en route). Le gain du ciel dépend du nombre de ciels peints par course (3 dans chacune des deux courses : la chauffe, la mise en piste, un changement de map) ; une course plus longue en peint sans doute plus, ce n'est pas mesuré.
- La preuve de A1 tient sur 2 courses, pas 24, et a été faite en remplaçant la fonction **après** la chauffe ; la proposition la remplace **avant**.
- Le coût fixe tiré des données suppose les 4 travailleurs toujours occupés dans la fenêtre ; la fenêtre de la génération 1 a 4 courses en cours à sa fin (d'où la fourchette 25,4 à 26,9 s).
- On suppose qu'une part mesurée seule reste la même à 4 à la fois (vérifié seulement pour la part fixe).
- `J.image` (4,4 % en temps propre) n'est pas expliqué : ce ne sont pas les minuteries.
- Les gains supposés sur le Ryzen (A5 sur 12 à 16 travailleurs) ne sont pas mesurés : le Ryzen n'a pas encore tourné.

## Comment refaire

Depuis ce dossier (`ml/ecurie/etude/reglage-de-la-selection/vitesse/`), un seul processus à la fois :

```
node analyser-donnees.js                 # resultats-donnees.txt / .json (quelques secondes, aucune course)
node fonctions-cheres.js > fonctions-cheres.txt
node compilation.js                      # profils/compilation.json (compile le jeu sans l'exécuter, ~2 s)
# les 4 courses (chacune ~40-60 s sur le Xeon chargé) :
node --cpu-prof --cpu-prof-dir=profils --cpu-prof-name=course1-990000-profil.cpuprofile chronometrer.js donnees/pilotes/9830f1c4e6fd.js 990000 120 > profils/course1-profil.json
node chronometrer.js donnees/pilotes/9830f1c4e6fd.js 990000 120 --minuteries > profils/course2-reference.json
node chronometrer.js donnees/pilotes/9830f1c4e6fd.js 990000 120 --minuteries --sans-ciel > profils/course3-sans-ciel.json
node --cpu-prof --cpu-prof-dir=profils --cpu-prof-name=course4-990740-sans-ciel-profil.cpuprofile chronometrer.js donnees/pilotes/9830f1c4e6fd.js 990740 120 --sans-ciel > profils/course4-sans-ciel-profil.json
node analyser-profil.js profils/course1-990000-profil.cpuprofile profils/course1-profil.json > profils/course1-lecture.txt
node analyser-profil.js profils/course4-990740-sans-ciel-profil.cpuprofile profils/course4-sans-ciel-profil.json > profils/course4-lecture.txt
node estimer-gains.js > gains.txt        # le tableau des gains (gains.json)
# la preuve proposée (NON lancée ici) :
node preuve-identite.js --lignes donnees/courses-2026-48.jsonl --pilotes donnees/pilotes --n 24 --options "--sans-ciel" --a-sec
```

(Les lignes `mur_ms=…` à la fin des fichiers `profils/course*.json` sont le temps mesuré de l'extérieur, par le shell.)

## Les fichiers

| fichier | ce qu'il contient |
|---|---|
| `analyser-donnees.js` → `resultats-donnees.txt`, `.json` | §§ 1, 3, 4 et 5 depuis les données réelles |
| `chronometrer.js` | une course chronométrée étape par étape (options `--minuteries`, `--sans-ciel`, `--deux`) |
| `analyser-profil.js` → `profils/course*-lecture.txt` | les familles de code, les étapes, les fonctions chères |
| `fonctions-cheres.js` → `fonctions-cheres.txt` | qui tire au hasard parmi les fonctions chères |
| `compilation.js` → `profils/compilation.json` | le cache de code V8 |
| `estimer-gains.js` → `gains.txt`, `gains.json` | le gain de chaque accélération sur une génération |
| `preuve-identite.js` | l'outil de preuve proposé (N courses connues, trois empreintes) |
| `profils/*.cpuprofile` | les deux profils CPU (s'ouvrent dans Chrome DevTools, onglet Performance) |
| `donnees/` | la copie figée du 27/11, 23:16:43 |
| `relecture/` | les scripts et sorties de la relecture (voir ci-dessous) |

## Relecture (27/11/2026, un second agent, chargé de chercher à réfuter)

**Refait à l'identique** : `analyser-donnees.js` et `estimer-gains.js` relancés redonnent leurs fichiers au bit près ; `fonctions-cheres.js` redonne `fonctions-cheres.txt` ; `preuve-identite.js --a-sec` redonne 24 courses, 8 causes, 3 827 s de jeu. Les empreintes des graines 990000 et 990740 dans `donnees/courses-2026-48.jsonl` sont bien celles des quatre courses jouées (la vraie évolution les a jouées en tmax 900, l'étude en tmax 120 : sans effet ici, les deux courses finissent avant 120 s).

**Refait par un chemin indépendant** (`relecture/cout-fixe-par-course.js`) : la file de `ml/evolution/courses.js` est FIFO à 4 places et relancée à chaque fin de course, et `evoluer.js` pose les tâches « pour chaque graine, pour chaque vivant ». On peut donc dater le départ de chaque course de la génération 1 (la k-ième part à la (k−4)-ième fin) et en tirer son hors-boucle **course par course** (contrôle : aucune valeur négative sur 287). La moyenne redonne celle de l'étude, **26,2 s** (part hors boucle 23,9 %). Mais la médiane est de **16,2 s**, les 10 % les plus rapides sont sous **9,5 s**, et les courses de plus de 240 s de jeu ont 37,5 s de hors-boucle.

**Ce qui était faux, et ce qui est corrigé dans le texte ci-dessus** :
1. **Les gains de A1, A2 et A4 étaient rapportés à une course courte.** `estimer-gains.js` divise les secondes gagnées par la durée totale de la course 2 (42,7 s) ou 4 (58,3 s), puis applique ce pourcentage à une génération dont la course moyenne occupe un travailleur 110,6 s (142,8 s de jeu en moyenne). Or ouvrir (A2) et la compilation (A4) se paient une fois par course, quelle que soit sa durée. Le ciel (A1), lui, se paie à la chauffe, à la mise en piste, puis une fois par nouveau ciel rencontré en route (1 appel en route en 85 s de jeu, 1 en 108 s). En secondes rapportées à la course moyenne (`relecture/gains-rapportes.txt`) : A1 **3,3 à 5,8 %** au lieu de 9,3 %, A2 **4,7 à 6,1 %** au lieu de 12,4 %, A4 **0,2 %** au lieu de 0,6 %. Les cumuls passent de −13,4 % / −24,2 % à **−8,6 % / −13,5 %**. La conclusion « deux fois plus n'est pas atteignable sans changer les courses » en sort renforcée.
2. **« La part fixe mesurée de deux façons concorde » : non.** Les 28 % portent sur une course de 85 s de jeu et les 24 à 26 % sur la course moyenne. En secondes, la mesure directe (11,8 s) explique moins de la moitié du hors-boucle moyen des données (26,2 s). Le reste (la charge du PC à 4 courses plus les autres travaux, la fin de course, le processus) n'est pas mesuré. A2 pourrait donc gagner un peu plus que les 6 % mesurés, mais ce n'est pas établi.
3. **A3 : le clone observé n'est pas un « gène inerte ».** `9627905cd5bb` a muté `figTemps` et `bVersRoutePlane`, et `bVersRoutePlane` est lu sans drapeau gardien dans le choix d'une façon en vol (`modele.js`, `prime`, l. 321 et 400). A3 (écrire à leur valeur de naissance les gènes dont le drapeau est éteint) n'aurait donc pas rendu ce clone identique au texte de son parent. INTERFACES.md § 9.5 dit « ~4 % des enfants », c'est-à-dire environ 0,24 enfant par génération de 6 naissances, et non 4 % des courses. Le gain de A3 est d'environ **0,1 %**, pas 3,8 %.
4. **Doute levé** (`relecture/appelants-ciel.js`) : dans les deux profils, aucun appel à `envCielCalc` n'a lieu pendant `loadGame`. L'appel de la chauffe vient de `creer → attendPiste → loop → … → bioGo → paintEnv`, donc l'endroit proposé pour A1 (après `loadGame`, avant `start()`) l'atteint.

**Ce qui tient** : la décomposition d'une course, la part du cerveau (2,4 %, refaite) et celle des yeux (5 à 6 %), le point chaud `envCielCalc` (fonction pure, sans hasard, 2 courses sur 2 identiques), le classement « à ne pas faire » des accélérations (b), les doubles (50 sur 567, 3,8 % du temps de boucle), et aucune clé jouée deux fois.

**Pas refait** : aucune course n'a été jouée à la relecture. Le gain de A5 sur le Xeon (0,2 %) repose sur une seule fin de génération : une course de 300 s de jeu (environ 200 s de travailleur) lancée en dernier laisserait jusqu'à 3 travailleurs vides pendant environ 200 s, soit au plus environ 600 s sur 4 × 8 630 s, c'est-à-dire environ 1,7 % sur le Xeon aussi (estimation, non mesurée). Le chiffre de A5 est donc incertain dans les deux sens.

Pour refaire : `node relecture/cout-fixe-par-course.js`, `node relecture/gains-rapportes.js`, `node relecture/appelants-ciel.js profils/course1-990000-profil.cpuprofile` (quelques secondes chacun, aucune course).
