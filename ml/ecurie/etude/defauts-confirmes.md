# Les defauts confirmes dans ml/bot, ml/labo, ml/reel et les documents

> Trouves par 4 relecteurs (Opus), chacun conteste par un sceptique qui a relu le code. 24/11/2026.

## 1. [grave] Le bac fermé laisse passer le hasard, l'horloge et même le jeu tout entier

`ml/bot/piloter.js:42` · relecture : justesse

charger() crée `M=Object.create(Math)` avec `M.random=undefined`, mais le prototype de M est le VRAI Math de l'hôte. Le contexte vm garde aussi les objets natifs (Date). J'ai vérifié avec un script jetable qui recopie les lignes 41-44 (scratchpad/relecture-bot/t.js) : `typeof Date` vaut 'function', `Date.now()` répond, `Object.getPrototypeOf(Math).random()` rend un vrai nombre au hasard, et `Object.getPrototypeOf(Math).constructor.constructor('return process')()` rend `process`. C'est une sortie complète du bac, puisque l'interdiction `codeGeneration` ne vaut que pour le contexte du cerveau, pas pour la Function de l'hôte. Même voie par `mem` (un `{}` de l'hôte, piloter.js:64) et par `vue`, qui est fabriquée DANS le contexte du jeu (yeux.js:36, appelée par J.g.sandbox). Avec `vue.constructor.constructor('coinsGot=5000')()`, un cerveau écrirait directement dans le jeu. Je ne l'ai pas exécuté sur le simulateur, je l'ai seulement déduit en lisant. Scénario : un cerveau écrit par l'API (le commentaire ligne 38 dit qu'ils passeront par ici) appelle Date.now() ou le vrai random. « Même graine = même course » tombe, et la note ne se rejoue plus. Pire : il triche sur les pièces et le palier, et ses chiffres partent dans l'écurie du matchmaking.

**Correction proposee.** Ne pas passer d'objet de l'hôte ni du jeu au cerveau. Construire Math dans le contexte (`vm.runInContext('const M={};for(const k of Object.getOwnPropertyNames(Math))if(k!=="random")M[k]=Math[k];globalThis.Math=M;delete globalThis.Date;')`). Remettre la vue au cerveau sous forme de copie JSON (`JSON.parse(JSON.stringify(vue))` évaluée dans le contexte du cerveau), et faire de même pour `mem`. Il vaut mieux encore lancer les cerveaux non fiables dans un processus à part (fork) sans droits.

*Le sceptique :* Le défaut est réel, mais seulement en partie. L'horloge passe bel et bien ; la sortie du bac et la triche sont des risques que le code accepte noir sur blanc.

Vérifié dans le code et avec un petit script jetable sur le seul vm de Node, sans lancer le simulateur (C:/Users/sacha/AppData/Local/Temp/claude/4f408c433e043674/f88f31c3-bb0b-46a7-81da-0268005df0f8/scratchpad/bac-ferme). J'ai recopié ml/bot/piloter.js:42-43. Résultat : `typeof Date` vaut 'function' et `Date.now()` renvoie l'heure de l'ordinateur. `Object.getPrototypeOf(Math).random()` renvoie un vrai nombre au hasard. `Object.getPrototypeOf(Math).constructor.constructor("return process")()` renvoie bien `process`. Seul `Function("...")` est refusé dans le contexte du cerveau.

1) L'HORLOGE (réel, et c'est ce qui compte). L'en-tête promet « ni horloge, ni hasard … même graine = même course » (piloter.js:8-9, et :36 « sans horloge »). Or un nouveau contexte vm garde son propre `Date`, branché sur l'heure de l'ordinateur. Personne ne le remplace : le simulateur remplace bien Date par une horloge de jeu (ml/reel/sim-env-reel.js:73-74, 116), mais charger() ne le fait pas. Il ne faut aucune ruse pour s'en servir : c'est le cas du « programme maladroit » que le bac doit justement arrêter (piloter.js:37-38). Le cas est plausible. Un cerveau écrit par l'API, à qui l'on a retiré Math.random, peut se servir de `Date.now()` pour mettre de l'irrégularité « humaine » dans ses gestes ou pour compter un délai. Rien ne refuse un tel code : labo.js:79 vérifie seulement la présence de `module.exports`.

Ce que ça casse :
- La même graine ne donne plus la même course.
- La note de noter.js change d'un essai à l'autre.
- garder.js:20-21 relance le cerveau et voit que l'empreinte ne correspond plus : la course est alors refusée.
- Le rejeu par les touches (rejouer) marche toujours, car il ne relance pas le cerveau. Sur ce point, « la note ne se rejoue plus » est exagéré.

2) LE VRAI HASARD par le prototype de Math, et la sortie vers `process` ou vers le jeu par `vue` ou `mem`. C'est exact techniquement : je l'ai vérifié pour Math → process. La voie `vue.constructor.constructor(...)` dans le contexte du jeu, je ne l'ai pas exécutée. Mais il faut l'écrire exprès. Or le commentaire de piloter.js:37 dit clairement « Ce n'est pas un coffre-fort : c'est un garde-fou contre un programme maladroit ». Ce point est donc un choix assumé, pas un défaut caché. Il ne fausse pas non plus le hasard du jeu : le jeu a son propre Math, à graine (sim-env-reel.js:116).

Correction la plus simple pour le point 1 : avant de charger le cerveau, mettre dans son contexte un `Date` absent ou figé. Par exemple `delete globalThis.Date` lancé avec vm.runInContext, ou un Date qui renvoie l'horloge du jeu. Une façon de faire mieux : construire Math dans le contexte, en recopiant tout sauf random, au lieu de `Object.create(Math)` de l'hôte. Le processus séparé ne vaut la peine que si l'on veut aussi se protéger d'un cerveau qui triche exprès.

## 2. [grave] Après une seconde chance, le palier et les pièces viennent de la fin, après la perte d'un palier

`ml/bot/mesures.js:42` · relecture : justesse

mesures() calcule `pieces` et `palier` à partir de `fin.pieces` (coinsGot à la fin). Or, à la reprise, le jeu retire un palier et remet les pièces au seuil de ce palier : seconde-chance.js:188, `engTier-CHANCE.moteurPerte` (moteurPerte:1, ligne 91), puis `coinsGot=ENGINE_TIERS[engTier].coins`. etalon.js:43 recolle avec `fin` = celle du 2e morceau. Résultat : le palier record d'une partie avec seconde chance est sous-estimé, d'un palier au plus, quand le joueur ne regagne pas ce qu'il a perdu. pieces_min est faux lui aussi. Cas réel dans l'étalon : la partie de 548,8 s avait 4044 pièces avant la mort et finit notée 3923. Les pièces vraiment ramassées font 4044 + (3923 − 3680) = 4287. Le palier 28 tient ici par chance (seuil 3910), mais c'est la clé du matchmaking : un joueur mort au palier 20 qui roule peu après sa reprise est classé 19.

**Correction proposee.** Dans colle(), garder `piecesMax=max(a.fin.pieces, b.fin.pieces)` et le cumul des événements 'piece' (`ev.filter(e=>e[1]==='piece').reduce(+e[2])`). Dans mesures(), calculer le palier sur le maximum atteint et pieces_min sur la somme des événements 'piece'. Les deux valent aussi pour les bots, qui n'ont pas de seconde chance.

*Le sceptique :* Le défaut est réel : je l'ai vérifié dans le code, sans lancer le simulateur.

1) Le palier est calculé sur les pièces de la fin. ml/bot/mesures.js:42 prend `pieces:fin.pieces|0`, calcule `pieces_min` à partir de `fin.pieces` et `palier:palierDe(fin.pieces|0)`. Aucun maximum n'est gardé.

2) Ce chiffre de fin vient directement du jeu. code/moteur/enregistreur-jeu.js:49 écrit `fin.pieces = coinsGot|0`.

3) La reprise retire un palier. code/gameplay/seconde-chance.js:91 fixe `moteurPerte:1`. La ligne 188 fait `engTier=Math.max(0,engTier-CHANCE.moteurPerte);coinsGot=ENGINE_TIERS[engTier].coins`. Après une seconde chance, `coinsGot` repart donc au seuil du palier inférieur.

4) Le recollage garde la fin du second morceau. ml/bot/etalon.js:43 fait `fin:Object.assign({},b.fin,…)`. Le commentaire de la ligne 37 reconnaît d'ailleurs la baisse : « la reprise en reprend (4044 → 3923 vu le 23/11) ».

Conséquence : si le joueur ne regagne pas le palier perdu, sa partie est classée un palier trop bas (jamais plus d'un). Cette échelle sert de clé au matchmaking. `pieces_min` est faux dans toutes les parties avec seconde chance, et `barre()` reprend le même chiffre (som('pieces'), ligne 69).

La correction proposée tient. L'événement 'piece' existe : enregistreur-jeu.js:82 enregistre `['piece', delta, s, lat]`. Il compte les gains et jamais la perte, donc leur somme donne les pièces vraiment ramassées. Les bots ne sont pas touchés tant qu'ils n'ont pas de seconde chance.

Ce que je n'ai pas pu vérifier :
- le contenu des fichiers de l'étalon (le cas 4044 → 3923 → palier 28 vient du relecteur et du commentaire d'etalon.js:37) ;
- si le compteur `_coins` de l'enregistreur repart bien de la valeur `coinsGot` au début du second morceau. S'il repartait de 0, le premier événement 'piece' du second morceau compterait les pièces en double.

## 3. [grave] Le bac du cerveau laisse passer la vraie horloge, le vrai hasard et le processus

`ml/bot/piloter.js:42` · relecture : determinisme

Le contrat (piloter.js:8-9) promet « ni horloge, ni hasard », mais le bac ne fait que masquer Math.random sur une copie de Math. Je l'ai vérifié avec un script jetable qui reproduit exactement charger() (vm.createContext({Math:M}) avec codeGeneration strings:false) : `Date.now()` marche, parce que vm fournit ses propres objets de base, Date compris. `Object.getPrototypeOf(Math).random` rend le vrai Math.random de Node, sans graine. Et `memoire.constructor.constructor("return process")()` rend `process`, parce que vue et mémoire sont des objets du processus hôte, dont le Function n'a pas la restriction du bac. Exemple concret : un cerveau écrit par l'API qui fait `if(Date.now()%2)` ou `Object.getPrototypeOf(Math).random()<.1` rend la même graine non répétable. Rejouer.js la déclare DIFFÉRENTE et garder.js la refuse, sans que rien n'en dise la cause.

**Correction proposee.** Dans le contexte du cerveau : poser `Date` à une classe dont now() et le constructeur sans argument lèvent une erreur (ou rendent l'heure virtuelle) ; construire `Math` comme un objet simple (copie des fonctions sauf random), pas avec Object.create(Math). Passer vue et mémoire DANS le contexte : vue sérialisée en JSON puis `JSON.parse` exécuté dans le contexte, mémoire créée par `vm.runInContext('({})',ctx)`. Rejeter un cerveau dont la source contient `Date`, `getPrototypeOf` ou `constructor`, avec un contrôle dans verifier.js.

*Le sceptique :* Le défaut est réel, mais seulement pour une partie de ce qu'affirme le relecteur, et il pèse peu. Je n'ai exécuté aucun script et je n'ai rien modifié.

Ce qui est vérifié dans le code :
- ml/bot/piloter.js:42-43 fait `M=Object.create(Math); M.random=undefined`, puis `vm.createContext({module, exports, Math:M, console}, {codeGeneration:{strings:false, wasm:false}})`. Rien ne remplace `Date`.
- Or un contexte vm reçoit ses propres objets de base, `Date` compris. `Date.now()` et `new Date()` y donnent donc l'heure réelle. C'est un comportement connu de Node que je n'ai pas exécuté ici.
- Le contrat dit pourtant le contraire, à deux endroits : piloter.js:8-9 (« ni horloge, ni hasard ») et piloter.js:36 (« sans horloge ni hasard »).
- Rien ne contrôle la source d'un cerveau. labo/labo.js:79 vérifie seulement la présence de `module.exports`. inscrire.js ne regarde que `nom`. Une recherche de `Date`, `getPrototypeOf` et `constructor` dans ml/bot et ml/labo ne trouve aucune garde.
- La graine du jeu (reel/sim-env-reel.js:16, SEED_CODE) remplace `Math.random` dans le bac du jeu, pas celui de Node. `Object.getPrototypeOf(M).random` rend donc bien le hasard de Node, sans graine.

Conséquence concrète, la partie réelle du défaut : un cerveau « maladroit » peut utiliser l'heure, par exemple `Date.now()` pour minuter un geste. Il n'a pas besoin de le faire, puisque `vue.t` et `vue.image` existent (piloter.js:73). Dans ce cas, rien ne casse et il ne se passe aucune panne, contrairement à `Math.random`, qui lève une erreur, compte comme panne et se voit. La course devient simplement non répétable. Plus tard, garder.js:21 refuse la course (« empreinte ≠ ») et rejouer.js la déclare DIFFÉRENTE, sans dire pourquoi. C'est exactement le risque que le bac prétend fermer (piloter.js:37, « garde-fou contre un programme maladroit »).

Ce qui est surestimé :
- `Object.getPrototypeOf(Math).random` et `memoire.constructor.constructor("return process")()` sont des évasions volontaires, pas des maladresses.
- Le code les exclut lui-même : piloter.js:37 dit « Ce n'est pas un coffre-fort ».
- Ces deux points ne sont donc pas des défauts au sens du contrat affiché.

Gravité : faible. Il n'y a ni corruption ni faux résultat silencieux dans la note. Le seul effet est une course qu'on ne peut pas rejouer, détectée plus tard sans sa cause.

La correction utile et suffisante : poser dans le contexte un `Date` virtuel, ou qui lève une erreur, et construire `Math` comme un objet simple au lieu d'`Object.create(Math)`. Le reste de la correction proposée (vue et mémoire créées dans le contexte, refus des sources contenant `constructor`) relève du coffre-fort, que le code dit explicitement ne pas être.

Non vérifié : je n'ai lancé aucun bac pour confirmer à l'exécution. Je ne sais pas non plus si un cerveau existant (labo/cerveaux/c0001-reference.js) ou la consigne donnée à l'API mentionne l'interdiction de `Date`.

## 4. [grave] Le nouvel objectif (une écurie de bots par palier, du palier 1 au palier 30) et le travail du dernier commit n'apparaissent dans aucun document

`passation/BOTS-ML.md:3` · relecture : docs

Le commit b5735be4e (24/11, 18:48) ajoute le palier de chaque partie (mesures.js:8-15, 42, 71), `--regime allege` (piloter.js:24-30, noter.js:31, inscrire.js:37 et 46, rejouer.js:18, garder.js, projection/page.html:57), `inscrire.js --note`, les modèles « …-abonnement » sans coût (labo.js sansCout) et discerner.js. Aucun des quatre documents n'a été mis à jour. BOTS-ML.md ne dit jamais « palier » au sens du matchmaking : il ne parle que du « premier palier de moteur » (l.291). Le tableau de l'étalon (l.115-125) n'a pas les lignes palier médian 11,5 et record 28 que contient pourtant results/etalon.json (barre.paliers = 1,1,4,5,5,8,11,12,14,15,16,21,22,28). La section 7, point 6 (l.292-295), présente encore le régime allégé comme une décision à prendre plus tard (« `?allege=1`, toutes les notes à refaire »), alors que l'option est déjà codée partout. Le tableau des fichiers de ml/bot/README.md (l.8-18) n'a pas discerner.js. Conséquence : un nouvel agent qui reprend le travail ne sait pas que l'objectif a changé, il refait l'outil du palier ou du régime, ou il note dans le mauvais régime.

**Correction proposee.** Dans BOTS-ML.md, ajouter une section « Objectif du 24/11 : un bot par palier, de 1 à 30, que l'on ne distingue pas d'un joueur », avec la définition du palier (ENGINE_TIERS, code/gameplay/pickups-fruits.js ; mesures.js palierDe), les paliers de l'étalon et ceux de la référence. Marquer le point 7.6 « outil prêt : noter.js --regime allege », la décision de Sacha restant à prendre. Ajouter discerner.js au tableau et aux commandes de ml/bot/README.md. Ajouter --regime et --note au bloc de commandes de ml/labo/README.md.

*Le sceptique :* Défaut réel : je n'ai pas réussi à le réfuter. Vérifications faites :
1) `git show --stat b5735be4e` : le commit touche 13 fichiers, tous dans ml/bot et ml/labo (discerner.js, mesures.js, noter.js, piloter.js, inscrire.js, labo.js, rejouer.js, garder.js, projection/page.html, results/*). Aucun fichier .md ne change. Le message du commit annonce pourtant le palier, `--regime allege`, `inscrire --note`, les modèles « …-abonnement » et discerner.js.
2) passation/BOTS-ML.md ne dit jamais « matchmaking », ni « un bot par palier », ni ENGINE_TIERS. « Palier » n'y apparaît qu'à la l.291 (« premier palier de moteur au départ »). La seule « écurie » est à la l.58 : « une écurie de pilotes = des niveaux de difficulté », à l'étape 6, par styles (prudent, flambeur, voltigeur), pas par palier de 1 à 30. Le nouvel objectif n'est donc écrit nulle part.
3) Le tableau de l'étalon (BOTS-ML.md:115-125) n'a pas de ligne pour le palier médian ni pour le record.
4) La section 7, point 6 (BOTS-ML.md:292-295), présente toujours le passage en allégé comme une option future (« `?allege=1`, toutes les notes à refaire »), sans dire que `--regime allege` existe déjà.
5) `grep discerner|regime|--note` dans ml/bot/README.md ne trouve rien, ni discerner.js, ni --regime, ni --note. Dans ml/labo/README.md, il trouve seulement la l.171, sur `&regime=` de la page de projection : pas l'option `--regime` de noter, inscrire ou rejouer, et pas `--note`.

Pas vérifié : le contenu exact de results/etalon.json (barre.paliers = 1…28, médiane 11,5), ni les numéros de ligne cités dans le code (mesures.js:8-15, piloter.js:24-30, etc.). Ces points n'affectent pas le constat. La conséquence est réelle : un agent qui reprend le travail à partir des documents ne voit ni l'objectif « un bot par palier », ni les outils déjà prêts. La décision de Sacha sur le régime reste à prendre, mais le document doit dire que l'outil existe.

## 5. [grave] `node noter.js` ne reproduit pas la note de référence documentée, et l'écrase en silence

`ml/bot/README.md:23` · relecture : docs

Le README présente `node noter.js` comme « la référence sur 20 graines ». Or noter.js:31 prend --tmax 180 par défaut, alors que la note documentée (BOTS-ML.md l.85 : « 300 s au plus » ; results/note-reference.json : tmax 300) a été faite à 300 s. La sortie par défaut est results/note-<nom>.json, donc note-reference.json. Scénario : un agent lance la commande du README pour « revérifier la référence ». Les courses sont coupées à 180 s, la survie et le palier record sont plafonnés plus bas, et le fichier de référence est remplacé par une note qui ne se compare plus. Toutes les comparaisons de etalon.js passent ensuite sur cette note. Même piège pour autopsie.js : tmax 180 par défaut (autopsie.js:14) et ouvrir() sans régime (autopsie.js:13). L'autopsie d'une mort après 180 s ou d'un bot noté en allégé ne montre donc pas la course notée.

**Correction proposee.** Dans le README, écrire `node noter.js --tmax 300` (et `--regime allege` quand ce sera la règle), ou bien aligner le défaut de noter.js sur 300 comme inscrire.js:21. Dire que la commande écrase results/note-<nom>.json et conseiller --sortie pour un essai. Ajouter --tmax et --regime à autopsie.js, ou documenter cette limite.

*Le sceptique :* Le défaut est réel. Je l'ai vérifié en lisant le code, sans rien lancer.

1. ml/bot/README.md:23 présente `node noter.js` sans option comme « la référence sur 20 graines ». La ligne 24 montre bien `--tmax 300`, mais seulement pour `mon-cerveau.js`.
2. Sans argument, noter.js note reference.js (noter.js:30) avec `TMAX=+opt('tmax',180)` (noter.js:31). Le nom vient du fichier (noter.js:36), donc `nom` vaut « reference ». La sortie par défaut est donc results/note-reference.json (noter.js:54), écrasée par writeFileSync sans avertissement (noter.js:57).
3. La note de référence existante a été faite à 300 s : results/note-reference.json contient `"tmax": 300`, et passation/BOTS-ML.md:85 dit « 300 s au plus ». La commande du README la remplace donc par une note coupée à 180 s. La survie médiane documentée est de 143 s, et une partie des courses dépasse 180 s. Elles seraient coupées, ce qui baisse la survie et le palier record.
4. etalon.js:70 lit tous les results/note-*.json pour ses comparaisons. Il affiche n.tmax (lignes 76 et 79) mais compare quand même. La note dégradée serait donc utilisée en silence.
5. Pour autopsie.js, la partie est vraie aussi : tmax vaut 180 par défaut (autopsie.js:14). Selon le relecteur, ouvrir() y est appelé sans régime (autopsie.js:13) ; je n'ai pas lu cette ligne. noter.js, lui, passe le régime (noter.js:22).

Ce qui atténue le défaut : le fichier est suivi par git, donc on peut le récupérer, et le tmax est écrit dans la note. Mais le piège de la commande documentée reste réel.

Non vérifié : je n'ai pas lancé le simulateur, donc je ne sais pas combien de courses de référence dépassent 180 s. Je n'ai pas non plus lu inscrire.js:21.

## 6. [moyen] La durée des humains compte l'explosion, celle des bots non

`ml/bot/mesures.js:20` · relecture : justesse

Côté bot, la course s'arrête à la première décision qui voit `mode==='boom'` (piloter.js:72), et `__JR.fin()` ferme la partie à cet instant. Côté humain, l'enregistreur continue tant que `started&&!gameOver` (enregistreur-jeu.js:59). Or gameOver ne tombe qu'à endGame, au moins 1,8 s de jeu après la mort (mort.js:446, premiere-fois.js:94-98). Comme jrT est en temps de montre, c'est plus long sur un téléphone qui rame. Pendant ce temps, des échantillons m=3 s'ajoutent. mesures() prend `duree=fin.t` : la survie humaine est gonflée d'environ 2 s par mort (deux fois pour une partie recollée). Les échantillons de l'explosion entrent aussi dans les dénominateurs de air_pct, nitro_pct et kmh_moyen. Scénario : on compare la survie médiane bot/humain pour placer un bot à un niveau, et chaque partie humaine courte (54 à 67 s pour les paliers 4-5) a 3 % de temps en trop.

**Correction proposee.** Dans mesures(), quand un événement 'mort' existe, prendre son instant comme fin (`duree=min(fin.t, t du dernier 'mort')`). Ignorer les échantillons après la mort (m===3) pour les pourcentages et la vitesse moyenne. Dans colle(), décaler le 2e morceau de l'instant de la mort et non de a.fin.t.

*Le sceptique :* Le défaut est réel : j'ai vérifié chaque point en lisant le code, sans rien exécuter.

**Côté bot, la course s'arrête à l'explosion.**
- yeux.js:37 : `fini=!!(gameOver||mode==='boom')`.
- piloter.js:72 : la boucle sort à la première décision qui voit `vue.fini`, donc au plus 6 images (0,1 s) après l'explosion.
- piloter.js:87 : ensuite `__JR.fin()` appelle `jrEvMort` puis `jrFinit`, et `fin.t` est pris à cet instant (enregistreur-jeu.js:49).

**Côté humain, l'enregistrement continue pendant l'explosion.**
- enregistreur-jeu.js:59-60 : `jrImage` continue tant que `started&&!gameOver`. `mode==='boom'` n'arrête pas l'enregistrement.
- enregistreur-jeu.js:77 : `jrSuit` note l'événement 'mort' au passage en boom.
- enregistreur-jeu.js:88 : il ajoute ensuite des échantillons avec m=3.
- La partie ne se ferme qu'au tour où gameOver est vrai.
- gameOver ne tombe qu'à `endGame`, appelé dans boucle-3-physique.js:622 quand `boomT>1.8` ou après `BOOM_REEL_MS=2000` ms d'horloge réelle (premiere-fois.js:93-101).
- La durée enregistrée compte donc environ 1,8 à 2 s d'explosion. C'est plafonné à environ 2 s, sauf si la page saute ou se fige.

**Rien ne corrige ce décalage plus loin.**
- mesures.js:20 : `duree=fin.t`.
- air_pct (ligne 45), kmh_moyen (ligne 53) et nitro_pct (ligne 54) divisent par `E.length`, qui contient les échantillons m=3 de l'explosion.
- etalon.js:29-32 (`finVraie`) ne recoupe que les pauses, pas l'explosion.
- etalon.js:38-43 (`colle`) décale le 2e morceau de `a.fin.t`, qui contient déjà l'explosion. Une partie recollée compte donc ce surplus deux fois.

**Conséquence.** La survie médiane de l'étalon est gonflée d'environ 2 s par mort par rapport aux bots (barre(), mesures.js:67). Cela fait environ 3 % sur les parties courtes des paliers bas : un biais systématique dans la comparaison bot/humain. La correction proposée, couper à l'instant de l'événement 'mort', est faisable : cet événement existe dans les deux enregistrements.

**Non vérifié.** Le surplus réel mesuré dans les fichiers de ml/bot/etalon/ (je n'ai rien exécuté), et le cas de la seconde chance automatique (`CHANCE.auto`).

## 7. [moyen] Les raccourcis ne se comptent pas comme dans le jeu (filet compté, portail oublié)

`ml/bot/mesures.js:31` · relecture : justesse

Le jeu ne paie un RACCOURCI que si la pose n'est pas dans le FILET de son virage (demi-tour.js:590 : `fl9=filetDe(FLOW.s0,s); if(fl9) filetRattrape(...) else if(gagne>=60) flowRaccourci`). Il compte aussi le raccourci VERS LE PORTAIL, fait en vol sans pose (portail-passage.js:80). mesures() compte toute pose de gain ≥ 60 m, filet compris, et rejette le vol vers le portail : la pose arrive sur la route suivante, donc `g(a,'r')!==g(b,'r')` (ligne 31). En plus, il refait le calcul avec des positions échantillonnées 10 fois par seconde (à 100 m/s, jusqu'à ~10 m d'écart), au lieu de FLOW.p0 et fallPos. Scénario : un joueur qui coupe vers les portails a 0 raccourci dans la mesure alors que le jeu lui en paie, et un bot posé dans les filets en a plein. La mesure « raccourcis par minute », qui sert à départager humain et bot, est biaisée.

**Correction proposee.** Faire écrire au jeu un événement 'raccourci' (gain) dans l'enregistreur, ou exclure les poses dans un filet et ajouter le cas du portail (vol fermé par un événement 'route' : gain = L−80−s0 − distance). Le plus simple et le plus fidèle : compter la hausse de `runStats.gaps` et de l'appel à flowRaccourci, comme pour 'figure_payee'.

*Le sceptique :* Le défaut est réel. Je l'ai vérifié en lisant le code, sans rien lancer.

1) Le filet. Dans le jeu, code/gameplay/demi-tour.js:590 calcule `fl9=filetDe(FLOW.s0,s)`. Si la pose tombe dans un filet, le jeu appelle `filetRattrape` et ne paie pas de raccourci ; `flowRaccourci` n'est appelé que dans le `else if(gagne>=60)`. ml/bot/mesures.js:31-32 compte tout vol posé sur la même route avec un gain d'au moins 60 m (RACC, ligne 7) et ne vérifie jamais le filet. Les filets existent sur les vraies pistes : ils sont remplis dans code/moteur/depart-avance.js:216-221 et testés dans code/rendu/portails.js:240. Leur zone est large (de sN0−160 à sN1+260). Une pose « rattrapée » d'au moins 60 m compte donc comme un raccourci dans la mesure.

2) Le portail. code/gameplay/portail-passage.js:80 paie `flowRaccourci` quand on passe le portail en vol, avec gain = (L−80−FLOW.s0) − distance volée. L'enregistreur (code/moteur/enregistreur-jeu.js:69 et 76) écrit l'événement 'route' quand la piste change, puis 'pose' plus tard, sur la nouvelle route. La ligne 31 de mesures.js écarte ce vol par `g(a,'r')!==g(b,'r')`, donc la mesure ne le compte jamais.

3) Les positions. La mesure prend la distance volée entre des échantillons pris au plus près en temps (fonction `ici`, ligne 29). Le jeu utilise FLOW.p0 et fallPos. Cet écart est mineur à côté des deux autres.

Conséquence : `raccourcis`, `raccourcis_m` et `raccourcis_min` (lignes 52 et 74) ne disent pas ce que le jeu paie. Un joueur qui coupe vers les portails est sous-compté. Celui qui se pose dans les filets est sur-compté.

Ce que je n'ai pas vérifié : l'ampleur réelle de l'écart sur les parties de l'étalon (je n'ai pas lancé le simulateur), ni si un autre script se sert de cette mesure pour départager humain et bot. Le défaut existe dans le code dans tous les cas.

## 8. [moyen] L'autopsie (et verifier) ignore le régime : elle ne rejoue pas la course notée en allégé

`ml/bot/autopsie.js:13` · relecture : justesse

noter.js accepte `--regime allege` (ligne 31) et passe `ouvrir({regime})` (ligne 22). autopsie.js appelle `ouvrir()` sans option (ligne 13), donc toujours au MAX, et n'a pas d'option --regime. verifier.js fait de même (ligne 19). Selon piloter.js:24-26, le régime change le tirage des maps (Crypto City). La même graine donne donc une AUTRE course. Scénario : une note faite en allégé, le régime des vrais joueurs de l'étalon, montre une mort à la graine 910037. L'autopsie de cette graine raconte une course différente (autre map, autre fin), et on corrige le cerveau sur un faux diagnostic.

**Correction proposee.** Ajouter `--regime` à autopsie.js (et à verifier.js) et le passer à ouvrir({regime:opt('regime','max')}). Afficher aussi le régime dans l'en-tête du récit.

*Le sceptique :* Le défaut est réel pour autopsie.js. J'ai lu le code, rien exécuté.

1. Ce qui est vérifié dans le code :
   - ml/bot/autopsie.js:13 appelle `const J=ouvrir(),C=charger(fichier);` sans aucune option. L'usage écrit aux lignes 5 à 7 ne propose pas de `--regime`.
   - ml/bot/piloter.js:27-31 : `ouvrir(o)` se rabat sur `regime='max'` quand on ne lui passe rien. Seul `regime:'allege'` ajoute `&allege=1` à l'URL du jeu.
   - ml/bot/noter.js:13, 22 et 31 : noter.js accepte `--regime allege` et le passe à chaque processus enfant (`ouvrir({regime:m.regime})`).
   - Les outils du labo transmettent déjà le régime de la course notée : ml/labo/garder.js:20 et ml/labo/rejouer.js:18 font `ouvrir({regime:...jeu.regime})`, et ml/labo/inscrire.js:37 et 46 l'enregistrent. Seul autopsie.js est en retard.
   - L'effet sur la course est confirmé dans le jeu. code/maps/niveaux.js:58 contient `SF_HORS={... crypto:ALLEGE&&!/[?&](carte|niveau)=crypto\b/.test(location.search) ...}` : en allégé, Crypto City sort du tirage des maps. Sans `--carte`, autopsie.js laisse la graine tirer la map (lignes 14-15). La même graine peut donc donner une autre suite de maps, donc une autre course et une autre mort que celle de la note en allégé. C'est exactement le scénario du relecteur.

2. Ce qui atténue sans annuler :
   - On peut contourner en partie avec `--carte`, mais `ALLEGE` change aussi d'autres choses dans le jeu (densité, décor), donc ce n'est pas un vrai remède.
   - La note actuelle (ml/bot/results/note-reference.json) n'a pas de champ « regime », donc elle a été faite au maximum. Le défaut ne mord que sur les notes en allégé, qui sont pourtant le régime des vrais joueurs de l'étalon (piloter.js:24-26).

3. Le cas de verifier.js est plus faible. Sa ligne 19 appelle `ouvrir()` sans option dans les deux processus. La comparaison « même graine = même course » reste cohérente avec elle-même. La seule conséquence est que le contrat n'est jamais vérifié en allégé : c'est un manque, pas un faux diagnostic.

4. Non vérifié : je n'ai pas exécuté le simulateur pour voir une graine précise (par exemple 910037) changer de map entre les deux régimes. La conclusion vient uniquement de la lecture du code.

Correction proposée, juste : ajouter `--regime` à autopsie.js, passer `ouvrir({regime:opt('regime','max')})` et afficher le régime dans l'en-tête du récit.

## 9. [moyen] Les plages HTTP (Range) ne marchent jamais : la regex cherche la lettre d

`ml/labo/projection.js:44` · relecture : labo

plage=/^bytes=(d*)-(d*)$/ : `d*` signifie « des lettres d », pas des chiffres (il faudrait \d*). Un navigateur envoie « bytes=0- » ou « bytes=123456- » : la regex echoue, plage=null, le serveur repond 200 avec le fichier entier. Le correctif annonce dans le commentaire (« le saut a 38 s revenait a 0 ») n'est donc pas actif : les films ouverts depuis /labo/arbre.html ou /labo/videos/... ne se deplacent toujours pas dans Chrome, qui exige des reponses 206.

**Correction proposee.** /^bytes=(\d*)-(\d*)$/

*Le sceptique :* Défaut confirmé. Les octets de ml/labo/projection.js:44 ont été relus avec od -c : la regex contient bien `/^bytes=(d*)-(d*)$/`, sans barre oblique inverse. Ce n'est pas un artefact d'affichage. Elle ne reconnaît donc que des « d » littéraux. Pour « bytes=0- » ou « bytes=123456- », exec() renvoie null, la branche 206 de la ligne 46 n'est jamais prise et le serveur répond 200 avec le fichier entier (ligne 49). Le seul en-tête qui passe est « bytes=- », et la condition `plage[1]||plage[2]` est alors fausse. Cet en-tête annonce pourtant 'Accept-Ranges: bytes', mais aucune requête avec plage n'est jamais servie en 206. Le chemin est bien actif pour les films : ligne 148, `/labo/` appelle statique(L.RACINE, …, null, req) avec req. La correction proposée, `/^bytes=(\d*)-(\d*)$/`, est la bonne. Point non vérifié, car je n'ai ouvert aucun navigateur : le comportement exact de Chrome. Sans réponse 206, Chrome ne permet en général pas de se déplacer dans une vidéo, ce qui va dans le sens du symptôme décrit dans le commentaire de la ligne 45.

## 10. [moyen] La course sans ecran en cache n'est jamais refaite quand le jeu change

`ml/labo/projection.js:59` · relecture : labo

frais() ne compare la date de tampon/serie-<course>.json qu'a celle du rejeu et de piloter.js, pas a la version du jeu. Puis l.62 rend null si j.jeu.sha differe du jeu actuel. Scenario : on ouvre une projection pendant que index.html est sur une autre branche/worktree ou en cours d'assemblage (empreinte X) ; la serie est ecrite avec X. On revient a la bonne version (empreinte du rejeu) : frais() est vrai, rien n'est rejoue, l.62 rend null pour toujours → « la course sans ecran n'a pas pu etre rejouee » a chaque projection, jusqu'a ce qu'on touche le rejeu ou piloter.js. Meme chose pour /__hasard (recalage impossible).

**Correction proposee.** Mettre j.jeu.sha===L.versionJeu().sha dans frais() (relire la serie et la refaire si l'empreinte differe), ou nommer le fichier avec l'empreinte du jeu : serie-<course>-<sha>.json.

*Le sceptique :* Le défaut est réel. Je l'ai vérifié en lisant le code, sans rien exécuter. Sa portée est limitée : il ne touche que l'outil de labo, et un effacement manuel suffit à le contourner. Le jeu n'est pas concerné.

1. ml/labo/projection.js:59. frais() regarde seulement si tampon/serie-<course>.json existe et si sa date est postérieure à celle du rejeu et de ml/bot/piloter.js. Il ne regarde jamais l'empreinte du jeu.

2. ml/labo/rejouer.js:15 et :19. rejouer.js --serie écrit la série sans condition, avec jeu = L.versionJeu() au moment où il tourne. L'empreinte vient de ml/labo/labo.js:45-47 : c'est le sha de index.html + figures.js. Il ne refuse pas d'écrire quand cette empreinte diffère de celle du rejeu : il le signale seulement dans son affichage (l.21 et l.26). Si index.html était sur une autre version X à ce moment-là, la série est donc gardée avec l'empreinte X.

3. projection.js:62. Au retour sur la bonne version, j.jeu.sha vaut X alors que l'empreinte actuelle est différente. sansEcran rend null, et comme frais() reste vrai, la course n'est jamais rejouée. Le blocage dure tant que le rejeu ou piloter.js n'ont pas été modifiés, ou que le fichier du tampon n'a pas été effacé.

4. Rien en amont n'empêche d'arriver dans cette situation. Les deux appels de sansEcran, compare() (l.66) et /__hasard (l.127), ne vérifient pas l'empreinte avant de déclencher le rejeu. La page d'accueil (l.112-115) masque bien les liens quand l'empreinte du rejeu diffère de celle du jeu actuel. Mais c'est seulement de l'affichage : une URL /projection?rejeu=… ouverte directement, un onglet déjà ouvert ou un /__hasard appelé pendant un changement de branche ou un assemblage peuvent tous lancer le rejeu sur la version X.

Conséquence : chaque projection répond « la course sans ecran n'a pas pu etre rejouee », et /__hasard répond 404, donc le navigateur ne peut pas être recalé. La correction proposée par le relecteur est la bonne : ajouter la comparaison d'empreinte dans frais(), ou mettre l'empreinte dans le nom du fichier du tampon.

Ce que je n'ai pas vérifié : je n'ai pas lancé le serveur ni rejoué de course pour voir le défaut se produire. La conclusion repose uniquement sur la lecture du code.

## 11. [moyen] Nom de course non nettoye dans des chemins ecrits (traversee de dossiers, appelable par n'importe quelle page web)

`ml/labo/projection.js:81` · relecture : labo

rejeuDe() nettoie le nom pour TROUVER le rejeu, mais sansEcran() construit 'serie-'+nom+'.json' (l.59) et compare() 'projection-'+R.rejeu+'.json' (l.81) avec le nom BRUT venu de l'URL (/__hasard?f=) ou du corps POST (/__resultat). Exemple : f="c0001/../../../-g910000" se nettoie en c0001-g910000 (existe) mais le fichier s'ecrit en ml/-g910000.json (hors du tampon), et rejouer.js --serie y ecrit aussi. /__hasard est un GET et /__resultat un POST text/plain : une page web quelconque ouverte dans le meme navigateur peut les declencher sur 127.0.0.1 (CSRF), lancer un rejeu de 1-2 min de CPU et ecrire du JSON (dont le champ hasard, choisi par l'appelant) dans les dossiers parents. Accessoirement statique() et module9() verifient f.startsWith(racine) sans separateur final : un dossier voisin dont le nom commence pareil (ex. ml/labo-xxx) passerait.

**Correction proposee.** Nettoyer une fois a l'entree (const nom=String(f).replace(/[^a-z0-9-]/gi,'')) et n'utiliser que ce nom partout ; verifier path.relative(racine,f) sans '..' (ou startsWith(racine+path.sep)) ; refuser les POST sans Content-Type application/json ou avec un Origin different.

*Le sceptique :* J'ai lu le code et le défaut est bien réel, mais sa portée est plus étroite que ce que dit le relecteur.

**Ce qui est confirmé**
- `ml/labo/projection.js:52` : `rejeuDe()` nettoie le nom avec `/[^a-z0-9-]/gi`, mais seulement pour trouver le fichier de rejeu.
- Le nom non nettoyé est ensuite utilisé pour écrire :
  - `projection.js:59` construit `path.join(L.D.tampon,'serie-'+nom+'.json')` ;
  - `projection.js:60` passe ce chemin à `rejouer.js --serie`, qui l'écrit à `ml/labo/rejouer.js:19` (`fs.writeFileSync(serie, …)`) ;
  - `projection.js:81` écrit `'projection-'+R.rejeu+…+'.json'`.
- `path.join` résout les `..` sur la chaîne elle-même, même si `serie-c0001` n'existe pas comme dossier. Le tampon vaut `RACINE/tampon` (`ml/labo/labo.js:22`). Les rejeux existent bien : `ml/labo/rejeux/c0001-g910592.json`, etc.
- Exemple : `f = "c0001-g910592/../../../"` se nettoie en `c0001-g910592`, qui existe. Le fichier s'écrit alors en `<grand-parent de ml/labo>/.json`, hors du tampon. Avec plus de `../`, on remonte où l'on veut.
- Les entrées sont accessibles par simple requête :
  - `/__hasard` est un GET (`projection.js:127`) ;
  - `/__resultat` lit le corps d'un POST avec `JSON.parse`, sans regarder ni Content-Type ni Origin (`projection.js:128`).
  Un POST text/plain venant d'une autre page web n'est donc pas bloqué. L'écoute sur 127.0.0.1 (`projection.js:151`) n'empêche pas cette attaque CSRF venue du navigateur.
- `compare()` recopie dans le fichier écrit des champs fournis par l'appelant : `hasard`, `film`, `mode`, `duree_s` (`projection.js:72-80`).
- Chaque appel lance un nouveau processus de rejeu (`spawnSync`, `projection.js:60`), donc du calcul gratuit pour l'attaquant.

**Ce qui limite la portée**
- Le nom du fichier écrit est contraint. Une fois nettoyé, le nom complet doit être celui d'un rejeu existant. On ne peut donc écrire que des fichiers `.json` dont le nom est la fin d'un nom de rejeu (par exemple `.json`, `910592.json`, `-g910592.json`). Écraser `package.json` ou un fichier choisi librement n'est pas possible.
- Le serveur ne tourne que quand Sacha le lance à la main (outil de labo local).
- Il n'y a pas d'exécution de code : seulement des fichiers JSON écrits ailleurs, et du temps de CPU.

**Point secondaire**
`statique()` (l.42) et `module9()` (l.36) comparent avec `startsWith(racine)` sans séparateur final. En théorie, un dossier voisin comme `ml/labo-xxx` passerait le contrôle. Je n'ai pas vérifié qu'un tel dossier existe ; il semble que non.

Je n'ai rien exécuté, conformément à la consigne : tout ceci vient de la lecture du code. La correction proposée (nettoyer le nom une seule fois à l'entrée, contrôler avec `path.relative` ou `racine+path.sep`, refuser les POST sans en-tête JSON ou d'une autre origine) est adaptée.

## 12. [moyen] Le rejeu de garder.js oublie la map et la meteo imposees : la course n'est pas la meme

`ml/labo/garder.js:20` · relecture : labo

Quand la generation est close (tampon vide), garder.js rejoue avec course(J,C,graine,{tmax:ligne.tmax}) sans carte ni meteo. Or inscrire.js passe --carte/--meteo a noter.js (inscrire.js:37), qui les donne a course() (noter.js:23) ; piloter.course ne force la map que si o.carte est donne (piloter.js:62). Pour tout candidat note avec --carte, le rejeu tire une autre map depuis la graine, l'empreinte differe et garder.js refuse toujours (« la course rejouee n'est pas celle du journal »). La map n'est pas dans la ligne du journal (resumeCourse ne garde que fin.carte et cartes), il faut donc la ranger.

**Correction proposee.** Inscrire carte/meteo dans la ligne du journal (ils sont dans partie.bot.carte/meteo au moment d'inscrire) et les passer a course() : {tmax, carte:ligne.carte, meteo:ligne.meteo}.

*Le sceptique :* Le défaut est réel : je n'ai pas réussi à le réfuter. Il ne se produit que pour un candidat noté avec --carte (ou --meteo). Vérifié en lisant le code, sans rien exécuter.

1) La map imposée part bien jusqu'à la course. inscrire.js:37 transmet carte, meteo, coeurs et regime à noter.js. noter.js:23 appelle course(J,C,m.graine,{carte:m.carte,meteo:m.meteo,tmax:m.tmax}). Dans piloter.js:62, J.lancer(graine, o.carte?{carte:o.carte,meteo:o.meteo}:{}) n'impose la map que si o.carte est donné ; sinon c'est la graine qui la tire (piloter.js:57 et noter.js:9 : « sans --carte, la graine tire aussi la map »).

2) La map n'est pas rangée dans la ligne du journal. L'objet commun (inscrire.js:46) ne contient ni carte ni meteo, alors que noter.js les écrit dans sa sortie (noter.js:57). La ligne créée par labo.js:91-93 n'a ni carte ni meteo. resumeCourse (labo.js:59-67) ne garde que cartes (les maps traversées) et fin.carte, et garder.js ne lit ni l'un ni l'autre.

3) Le rejeu se fait sans map imposée. Quand la course n'est plus au tampon (clore.js:5 : « le tampon de la generation se vide »), garder.js:20 rejoue avec course(J,C,graine,{tmax:ligne.tmax}). La map est alors tirée par la graine, la course diffère, et l'empreinte (le hachage des vues) aussi. garder.js:21 refuse donc à chaque fois avec « la course rejouee n'est pas celle du journal ». Sauf coïncidence de tirage, qui n'est pas garantie : J.lancer avec ou sans options n'emprunte pas le même chemin.

4) Le reste du labo gère déjà ce cas, ce qui confirme que garder.js est le seul à l'oublier. labo.garder écrit carte et meteo dans le rejeu (labo.js:128, depuis partie.bot, que remplit piloter.js:89). rejouer.js:18 et projection/page.html:69 les réutilisent.

Conséquence limitée : sans --carte, aucun problème, et les rejeux actuels ont carte:null. Sans conséquence aussi tant que la génération est ouverte (garder.js:15, la course sort du tampon). Mais pour toute course notée sur une map imposée et close, garder.js ne peut jamais rien garder. La correction proposée tient : ranger carte et meteo dans la ligne du journal (N.carte et N.meteo sont dans la note, noter.js:57) et les passer à course() dans garder.js:20.

Non vérifié : je n'ai pas exécuté le simulateur. L'écart d'empreinte se déduit du code, il n'a pas été observé. Je n'ai pas non plus regardé si le journal actuel contient un candidat noté avec --carte.

## 13. [moyen] --note inscrit une note sans verifier qu'elle vient de ce code ni de cette version du jeu

`ml/labo/inscrire.js:40` · relecture : labo

Avec --note, la note deja faite est inscrite telle quelle avec `source` = le fichier donne en ligne de commande, sans comparer N.cerveau (le nom ecrit par noter.js, noter.js:57) au nom du fichier, ni l'empreinte du code. Et `jeu` (l.46) prend sha/commit de versionJeu() AU MOMENT de l'inscription, seule la chaine version vient de la note. Scenario : la boucle note v1, l'agent modifie le cerveau, puis inscrit avec --note ancienne.json → le journal associe la note de v1 au code de v2 ; ou le jeu a ete reassemble entre la note et l'inscription → les rejeux portent une empreinte du jeu qui n'a pas produit les courses, et garder.js/rejouer.js les declarent DIFFERENTS sans raison visible.

**Correction proposee.** Faire ecrire par noter.js le sha1 du code et l'empreinte du jeu (index.html+figures.js) dans la sortie, et refuser --note si l'un ou l'autre ne correspond pas a sha(source) / versionJeu().sha.

*Le sceptique :* Le défaut est réel. Je l'ai vérifié en lisant le code, sans rien exécuter.

1. ml/labo/inscrire.js:40-41 : avec --note, le script lit le JSON et vérifie une seule chose, la présence de N.parties.
   - Il ne compare N.cerveau (écrit par noter.js:57, le nom du module renvoyé par l'enfant, noter.js:24 et 43) ni au fichier donné, ni à son nom, ni à C.nom.
   - Il ne compare pas non plus N.jeu (la chaîne cashcar-vNNN) à jeu.version.
   - Le commentaire de la l.38 dit « pour ce meme code », mais rien ne l'impose.

2. inscrire.js:22 et 46 : `jeu` vient de L.versionJeu() au moment de l'inscription (labo.js:45-47 : sha de index.html+figures.js et commit). Seul `version` est remplacé par N.jeu. La ligne du journal peut donc mêler la version de la note avec le sha et le commit d'aujourd'hui.

3. labo.js:87-92 (inscrire) : l'empreinte `sha` est calculée sur `source`, le fichier tel qu'il est au moment de l'inscription. Il n'y a aucun lien avec le code qui a réellement produit les courses.

4. labo.js:127 (garder) : chaque rejeu reçoit `jeu:ligne.jeu`. Ensuite :
   - garder.js:18 refuse si jeu.sha diffère ;
   - rejouer.js:21-26 et projection.js:62 et 112-115 comparent ce sha.
   Si le jeu a été réassemblé entre la note et l'inscription, ces outils compareront les rejeux au mauvais jeu. Les rejeux peuvent alors être déclarés DIFFERENTS, ou au contraire « même jeu » à tort.

Je n'ai trouvé aucune garde ailleurs : ni dans labo.inscrire (labo.js:75-97), ni dans la documentation. L'option --note n'apparaît dans aucun autre fichier de ml/ ou de passation/.

Ce que je n'ai pas pu vérifier : si la boucle de génération appelle réellement --note avec un fichier périmé. Mais le chemin existe, et le seul garde-fou est le commentaire de la l.38. La correction proposée tient debout : noter.js écrit le sha du code et versionJeu().sha dans la note, et inscrire.js les compare avec --note.

## 14. [moyen] On peut inscrire un candidat dans une generation deja close : ses courses restent au tampon pour toujours

`ml/labo/labo.js:75` · relecture : labo

inscrire() ne regarde pas journal/generations.jsonl. Un candidat inscrit (par un agent en retard, ou par erreur de --generation) apres clore.js pour la meme etape/generation : clore() refuse ensuite de reclore (l.154), donc son tampon n'est jamais trie ni vide, il ne peut jamais etre champion, et `node labo.js` affiche quand meme la generation comme « close » avec un champion choisi sans lui. Meme effet pour la course d'inscription concurrente d'un clore.js lance en parallele.

**Correction proposee.** Dans inscrire(), refuser si lire(F.generations) contient deja {etape, generation} (message : « generation close, passer a la suivante »).

*Le sceptique :* Le défaut est réel : je n'ai trouvé aucune garde, ni dans labo.js ni dans inscrire.js. Vérifié en lisant le code, sans rien exécuter.

1. **inscrire() ne regarde pas les générations closes.** labo.js:75-99 lit seulement F.cerveaux (l.76), jamais F.generations. Ensuite il écrit le tampon (l.95) et ajoute la ligne au journal (l.96) sans autre contrôle.
2. **inscrire.js ne vérifie rien non plus.** Ses contrôles préalables (inscrire.js:26-32) portent seulement sur la présence de --etape, --generation, --modele, --raison et du coût. Il appelle ensuite L.inscrire (l.53) sans regarder si la génération est close.
3. **clore() refuse de reclore.** labo.js:154 lève « generation deja close » dès qu'une ligne {etape, generation} existe dans generations.jsonl, et clore.js:14 transmet cette erreur.
4. **Le tampon du retardataire n'est jamais vidé ni trié.** Le tampon n'est vidé qu'à la fin de clore(), et seulement pour les candidats lus à ce moment-là (l.155 et l.175). Rien d'autre dans ml/labo ne supprime tampon/<id>.json.gz : ma recherche de « clore » et « generations » dans les fichiers .js de ml/labo ne montre aucun autre nettoyeur.
5. **Il ne peut jamais être champion.** Le champion est choisi dans clore() parmi la liste L de l.155, figée au moment de la clôture.
6. **`node labo.js` l'affiche quand même comme close.** L'affichage (l.192-194) regroupe les candidats du journal par {etape, generation}. Il trouve la ligne de generations.jsonl et écrit « close, champion … » en comptant le retardataire parmi les candidats, mais le champion a été choisi sans lui. Le compteur « candidat(s) au tampon » (l.191) le compte aussi pour toujours.

**Cas en parallèle :** une inscription qui se termine pendant que clore.js tourne peut écrire au journal juste après la lecture de l.155. Le résultat est le même.

**Ce que je n'ai pas vérifié :**
- Si un humain ou un agent fait vraiment ce mauvais appel en pratique.
- Le contenu actuel de journal/generations.jsonl et de cerveaux.jsonl.

La conséquence reste modérée : l'outil n'oriente rien, et le tampon est hors de git. Mais la correction proposée est juste : refuser dans inscrire() quand lire(F.generations) contient déjà {etape, generation}. L'idéal serait de le vérifier aussi tôt dans inscrire.js, avant de jouer les courses, pour ne pas perdre 10 minutes de note. Cela ne couvre pas entièrement le cas en parallèle.

## 15. [moyen] Les courses abandonnées ou avec des décisions coupées entrent dans la note

`ml/bot/noter.js:52` · relecture : determinisme

barre(ok.map(r=>r.partie)) prend toutes les courses qui ont rendu un message. Une course abandonnée à la 3e panne (piloter.js:75, cause 'panne') compte donc avec sa durée tronquée dans survie_mediane, palier_median et argent_min. Une course avec 1 ou 2 décisions coupées, que l'on sait non répétable, compte aussi. Seul inscrire.js:59 avertit, et après coup. De plus, decide() (piloter.js:53) compte comme « panne » N'IMPORTE QUELLE exception du cerveau, pas seulement le dépassement de temps. Exemple : un cerveau qui fait `vue.route[0]` en vol, où route n'existe pas, lève une TypeError déterministe. La course est abandonnée au 3e vol et classée « panne ». Le commentaire de la ligne 75 l'attribue à « l'ordinateur à genoux », ce qui mélange un bug du cerveau et la charge du PC.

**Correction proposee.** Dans decide(), séparer `e.code==='ERR_SCRIPT_EXECUTION_TIMEOUT'` (panne de machine : rejouer la graine plus tard) des autres exceptions (faute du cerveau : la compter à part, ne pas parler de charge). Dans noter.js, calculer la note seulement sur les courses avec pannes===0 et cause!=='panne', mettre les autres dans `echecs` avec leur raison, et sortir avec un code d'erreur s'il y en a.

*Le sceptique :* Le défaut est réel. Je l'ai vérifié en lisant le code et un résultat déjà produit, sans lancer le simulateur.

1) Les courses abandonnées entrent dans la note
- `noter.js:50-52` garde toutes les courses qui ont rendu un message (`ok=R.filter(Boolean)`) et calcule `barre(ok.map(r=>r.partie))`. Aucune course n'est écartée pour cause de panne ou de décisions coupées.
- `piloter.js:75` abandonne la course à la 3e panne. `piloter.js:88` lui donne alors la cause `'panne'`, avec sa durée tronquée.
- `mesures.js:60-77` (`barre`) ne filtre pas non plus. Une course abandonnée pèse donc dans `survie_mediane_s`, `palier_median`, `argent_min` et `pieces_min`, comme une course normale.
- `inscrire.js:58-59` ne fait qu'afficher un avertissement, après coup.
- `noter.js:58` remplit `echecs` avec `NG-ok.length`, c'est-à-dire seulement les processus qui n'ont rien rendu. Les courses en panne n'y sont pas.

2) La preuve dans les données : `ml/bot/results/note-reference-allege.json`
Ce fichier (non suivi par git) est le bot de référence en régime allégé, celui qui sert d'étalon pour l'échelle des paliers.
- Sa note, lignes 15 et 32-36, compte `"parties": 15`, dont `"causes": {... "panne": 4}`.
- Les 4 courses concernées ont `pannes:3` et `cause:"panne"` (lignes 386-391, 497-502, 553-558 et 608-613).
- Les 4 parties tronquées sont donc incluses dans la médiane de survie (153,1 s) et dans les paliers. Ce sont les chiffres sur lesquels doit se caler l'écurie de bots par niveau.

3) Toute exception du cerveau compte comme une panne
`piloter.js:53` attrape n'importe quelle exception de `decide()` et l'ajoute à `this.pannes++`. Le dépassement de temps n'est pas distingué des autres erreurs :
- une TypeError déterministe venant d'un bug du cerveau ;
- la charge du PC.

Le commentaire de la ligne 75 dit pourtant « l'ordinateur à genoux ». Je n'ai pas vérifié le code exact que lève le dépassement de temps de `vm`. La correction proposée suppose `ERR_SCRIPT_EXECUTION_TIMEOUT`, c'est donc à contrôler avant de s'en servir.

Ce que je n'ai pas vérifié
- Je n'ai pas lancé le simulateur, comme demandé.
- Je n'ai pas cherché pourquoi les 4 graines sont tombées en panne : charge du PC ou exception du cerveau.

## 16. [moyen] Une même note peut mêler deux versions du jeu sous une seule étiquette

`ml/bot/noter.js:43` · relecture : determinisme

Chaque enfant relit VERSION PRINCIPALE/index.html au moment où il est lancé (sim-env-reel.js:19), puis sw.js pour l'étiquette (piloter.js:32). noter.js garde le `jeu` du DERNIER message reçu et ne vérifie pas que tous les enfants ont le même. inscrire.js:22 prend l'empreinte (sha d'index.html et de figures.js) AVANT les ~10 minutes de note. D'autres agents travaillent dans le même dépôt. Exemple : si l'un d'eux relance `node code/assembler.cjs` pendant la note, les graines 1 à 8 tournent sur l'ancien jeu, les suivantes sur le nouveau, et toute la ligne porte l'empreinte de l'ancien. garder.js et rejouer.js déclarent alors DIFFERENT des courses qui étaient justes, ou passent un écart sous silence.

**Correction proposee.** Calculer le sha d'index.html et de figures.js DANS chaque enfant, sur le texte réellement chargé (le faire rendre par loadGame), le renvoyer dans le message et refuser la note si les sha diffèrent entre courses. Mieux : que le parent lise index.html une fois et passe le texte (ou un chemin vers une copie figée dans le tampon) à chaque enfant.

*Le sceptique :* Défaut réel. J'ai vérifié le code sans lancer le simulateur.

1) Chaque enfant relit le jeu sur le disque au moment où il est lancé. noter.js:41 crée un nouveau processus par course (fork) ; dans ce processus, ouvrir() relit VERSION PRINCIPALE/index.html (ml/reel/sim-env-reel.js:19) et sw.js (ml/bot/piloter.js:32). Les courses partent en relais : K à la fois au début, puis chaque course qui finit en lance une autre (noter.js:46 et 63). Une note de 20 graines lit donc index.html 20 fois, étalées sur toute sa durée.

2) Rien ne vérifie que toutes les courses ont tourné sur le même jeu. noter.js:43 écrase la variable jeu à chaque message (jeu=m.jeu), et noter.js:57 écrit seulement la dernière valeur. De plus, cette valeur n'est que le numéro cashcar-vNNN lu dans sw.js, pas une empreinte d'index.html. Les messages des enfants ne portent aucun sha (noter.js:24).

3) L'empreinte qui fait foi est prise avant la note. inscrire.js:22 appelle L.versionJeu(), qui calcule le sha d'index.html + figures.js (labo.js:45-47), puis lance noter.js (inscrire.js:42). inscrire.js:46 colle ensuite ce sha d'avant la note au numéro de version de la dernière course (version:N.jeu). Avec --note (inscrire.js:40), c'est pire : le sha est pris au moment de l'inscription, qui peut venir longtemps après la note.

4) labo.inscrire et labo.valider (labo.js:75-104) recopient c.jeu tel quel, sans aucun contrôle.

5) Les conséquences annoncées sont confirmées. garder.js:18 accepte de rejouer dès que le sha du jeu actuel égale celui de la ligne. Si le jeu a changé en cours de note, il rejoue sur l'ancien jeu les courses jouées sur le nouveau, et garder.js:21 refuse alors des courses justes (empreinte différente). rejouer.js:20-21 annonce DIFFERENT avec memeJeu=true : il accuse un écart de jeu qui n'en est pas un.

Le scénario est plausible : d'autres agents travaillent dans le même dépôt, et `node code/assembler.cjs` réécrit index.html (voir CLAUDE.md). Je n'ai pas reproduit le problème en exécutant le code, comme la consigne le demandait.

La correction proposée est raisonnable : que chaque enfant renvoie le sha de ce qu'il a vraiment chargé, et refuser la note si deux courses diffèrent. On peut aussi faire lire index.html une seule fois par le parent, figé dans une copie. Un simple contrôle dans noter.js ne suffirait pas : il faut aussi qu'inscrire.js prenne le sha renvoyé par la note au lieu de celui de L.versionJeu() calculé à part.

## 17. [moyen] La limite de 180 s plafonne le palier mesuré : l'échelle 1 à 30 ne peut pas se remplir

`ml/bot/noter.js:31` · relecture : determinisme

Par défaut TMAX=180 et course() s'arrête à N=tmax×60 (piloter.js:61), avec la cause 'temps'. Le palier se compte sur les pièces ramassées (mesures.js:42, palierDe(fin.pieces)). Le bot de référence, à ~930 pièces en ~143 s de survie médiane, ramasse ~6,5 pièces/s. Le palier 28 (3910 pièces) demande ~10 minutes de course, que les humains peuvent faire et le bot non. Les courses coupées à 180 s sont comptées comme des morts à 180 s dans survie_mediane et dans palier_record : les notes hautes sont censurées, pas mesurées. Si l'on monte tmax, l'enregistreur ne garde que les 6000 derniers échantillons (code/moteur/enregistreur-jeu.js:90, 10 min). mesures() additionne la distance sur ces échantillons (mesures.js:35), mais divise par la durée complète (fin.t). distance_m_min et les autres taux calculés sur les échantillons sont alors sous-estimés dans les longues parties, humaines comme bot.

**Correction proposee.** Pour classer par palier : pas de tmax (ou un tmax de l'ordre de 15 à 20 min), et séparer les courses 'temps' (censurées) dans barre() : palier_record_censure, nombre de courses coupées. Dans mesures(), calculer les taux avec la durée couverte par les échantillons (E[E.length-1].t - E[0].t) et non fin.t, ou faire grandir JREC dans le simulateur.

*Le sceptique :* Défaut réel, vérifié dans le code. Le simulateur n'a pas été lancé, comme demandé.

1) Le plafond est confirmé. noter.js:31 met TMAX à 180 par défaut. piloter.js:61 arrête la course à N=tmax×60 images, et piloter.js:88 marque alors la fin avec la cause 'temps'. Le palier se calcule sur les pièces ramassées (mesures.js:42, palierDe(fin.pieces)). palier_record est le maximum des paliers des courses (mesures.js:71), et survie_mediane_s est la médiane de duree_s = fin.t (mesures.js:20 et 67). Une course coupée compte donc comme une partie de 180 s, sans que rien ne la distingue des autres : barre() ne compte les causes que dans `causes`. Ordres de grandeur : les humains ramassent 390 à 480 pièces par minute (results/etalon.json : 416,2 ; etalon-sacha.json : 393,2). En 180 s, même à 480 pièces par minute, on arrive à environ 1440 pièces, soit le palier 15 environ. Le palier 28 (3910 pièces) demande environ 8 à 10 minutes. Avec le réglage par défaut, un bot ne peut donc jamais être classé au-dessus d'environ 15, alors que l'objectif va de 1 à 30. Le README (ml/bot/README.md:160) et etalon.js:79 signalent seulement que la survie est plafonnée. Ils ne disent rien du palier. On peut passer --tmax plus grand, mais rien ne le dit, et la valeur par défaut fausse le classement.

2) La limite de l'enregistreur est confirmée. code/moteur/enregistreur-jeu.js:90 retire l'échantillon le plus ancien au-delà de 6000. Avec un pas de 0,1 s (ligne 17, PAS:.1), cela fait 600 s. Ce même enregistreur tourne dans le simulateur (piloter.js:18-21, jrSuit). distance_m est la somme calculée sur E (mesures.js:35), mais elle est divisée par la durée totale (fin.t, mesures.js:20) et par som('duree_s') dans barre (mesures.js:75). Au-delà de 10 minutes, distance_m_min est donc sous-estimé. Les raccourcis aussi : ici() ne retrouve plus les vols du début, mesures.js:29-32. Les pourcentages (air_pct, nitro_pct, kmh moyen), eux, restent justes, puisqu'ils sont calculés en proportion des échantillons. Les pièces et le palier viennent de fin et ne sont pas touchés. Ce second point ne compte qu'au-delà de 600 s, donc seulement si l'on monte tmax. Pour les parties humaines actuelles, il est probablement sans effet : le record au palier 28 représente environ 8 minutes. Je n'ai pas vérifié la durée exacte de chaque partie de l'étalon.

Conclusion : le premier point est réel et bloquant pour une échelle de 1 à 30. Le second est réel mais secondaire. La correction proposée tient : un tmax plus long, une colonne « coupée » ou censurée dans barre(), et des taux calculés sur la durée réellement couverte par les échantillons.

## 18. [moyen] L'attribution des fichiers de l'étalon par date est fausse

`ml/bot/etalon/LISEZ-MOI.md:4` · relecture : docs

Le LISEZ-MOI dit : « Sacha (au clavier, fichiers du 23/11) et Léo (au doigt, sur téléphone, fichiers à partir du 24/11) ». Or cashcar-parties-2026-11-24-1213.json contient 6 parties toutes jouées au clavier (vérifié avec mesures.js) et figure dans results/etalon-sacha.json (champ fichiers). Seul cashcar-parties-2026-11-24-11-05.json est à Léo. Aucun fichier n'indique quel export appartient à quel joueur. Scénario : un agent qui refait la barre de Léo avec la règle du LISEZ-MOI (`node etalon.js <fichiers du 24/11> --nom=Leo`) mélange 4 parties de Léo et 6 de Sacha. Pour un matchmaking par joueur, c'est faux.

**Correction proposee.** Remplacer la règle par date par la liste nominative des fichiers (Sacha : 2026-11-23-1950, 2026-11-23-2020, 2026-11-24-1213 ; Léo : 2026-11-24-11-05), ou ranger les fichiers dans etalon/sacha/ et etalon/leo/. Signaler que 1213 contient aussi les 3 parties de 2020 (doublons écartés).

*Le sceptique :* J'ai essayé de réfuter le défaut sans y arriver : il est réel, mais il ne touche que la documentation, pas le code. Je n'ai rien exécuté hormis la lecture des JSON avec node -e, et je n'ai rien modifié.

1. **La règle par date.** ml/bot/etalon/LISEZ-MOI.md:4-5 dit : Sacha = « fichiers du 23/11 », Léo = « fichiers à partir du 24/11 ».

2. **Ce que montrent les résultats.** ml/bot/results/etalon-sacha.json, champ « fichiers », contient cashcar-parties-2026-11-23-1950.json, ...-2026-11-23-2020.json et ...-2026-11-24-1213.json, soit 10 parties. ml/bot/results/etalon-leo.json ne contient que ...-2026-11-24-11-05.json, soit 4 parties.

3. **Les comptes concordent avec ce partage.** ml/bot/README.md:152 et passation/BOTS-ML.md:6 et :113 parlent de « 10 au clavier (Sacha), 4 au doigt (Léo) ». Le fichier 1213, daté du 24/11, appartient donc bien à Sacha, et la règle par date le range à tort chez Léo.

4. **Le contenu de 1213.** Il compte 6 parties, dont 3 copies exactes de celles de 2020 : mêmes champs « debut » (2026-11-23T20:15:37.841Z, 20:18:18.327Z, 20:19:17.673Z) et mêmes événements. Les 3 autres datent du 24/11 à 12:05, 12:06 et 12:10. Leurs écrans (782x844 portrait et 844x486 paysage) ne ressemblent pas à celui des parties de Léo (393x654 portrait, de 10:44 à 11:00). Le dédoublonnage annoncé dans ml/bot/README.md:148 explique pourquoi Sacha a 10 parties et non 13.

5. **Aucune trace du joueur.** Les clés de premier niveau des exports sont format, exporte, ver et parties : rien ne désigne le joueur. Seul « clavier » (etalon.js:62) distingue la main, pas la personne.

6. **Conséquence.** La commande donnée au LISEZ-MOI:5, `node ../etalon.js <ses fichiers> --nom=Leo`, appliquée à « tous les fichiers du 24/11 », prendrait 11-05 et 1213. Elle ajouterait aux 4 parties de Léo les 3 parties de Sacha du 24/11 et 3 de ses parties de 2020, dont certaines peuvent être écartées par les filtres. La barre de Léo serait fausse, alors que le matchmaking par niveau en dépend.

**Non vérifié.** Je n'ai pas lancé mesures.js pour confirmer que les 3 nouvelles parties de 1213 ont été jouées au clavier. La conclusion repose sur etalon-sacha.json et sur les comptes 10/4 de la documentation.

**Correction qui tient.** Lister les fichiers par joueur dans le LISEZ-MOI (Sacha : 1950, 2020, 1213 ; Léo : 11-05) et signaler que 1213 reprend les 3 parties de 2020. Autre solution : un dossier par joueur.

## 19. [moyen] La réserve sur la partie qui pèse dans l'argent par minute désigne la mauvaise partie et donne un chiffre faux

`passation/BOTS-ML.md:128` · relecture : docs

Le document dit : « une partie de 400 s à 324 000 d'argent pèse lourd dans l'argent par minute (20 597 sans elle) ». Dans results/etalon.json, la plus lourde est celle de 548,8 s à 451 871, palier 28. Recalculé sur etalon.json : 20 464/min sans la partie de 400 s (et non 20 597), 18 080 sans celle de 548,8 s, 10 089 sans les deux. Ces deux parties sont aussi les seules avec une seconde chance (chances = 1). Le palier record 28 de l'étalon et le palier 22 viennent donc de parties recollées après une seconde chance, que le bot n'a pas. Pour l'échelle de matchmaking, le haut de la barre humaine (paliers 22 et 28) repose sur 2 parties à seconde chance.

**Correction proposee.** Corriger : « deux parties à seconde chance (548,8 s / 451 871, palier 28 ; 400 s / 324 419, palier 22) font l'essentiel de l'argent : 10 089/min sans elles ». Ajouter que le record de palier humain dépend de la seconde chance, et noter le palier record sans ces deux parties (21, celui de Léo).

*Le sceptique :* Le défaut est réel : je l'ai vérifié en lisant ml/bot/results/etalon.json (14 parties, calcul fait dans Node, sans lancer le simulateur).

1. La phrase visée est bien dans passation/BOTS-ML.md:128 : « une partie de 400 s à 324 000 d'argent pèse lourd dans l'argent par minute (20 597 sans elle) ». Les lignes 111 à 117 donnent la barre sur 14 parties, dont l'argent par minute à 25 013. Ce chiffre correspond exactement à la somme de l'argent divisée par la somme des minutes sur les 14 parties. La réserve se mesure donc sur ce même étalon.

2. Recalcul sur etalon.json :
- sans la partie de 400 s (324 419, palier 22) : 20 464 par minute, et non 20 597 ;
- sans la partie de 548,8 s (451 871, palier 28) : 18 080 par minute ;
- sans les deux : 10 089 par minute.

La partie qui pèse le plus est donc celle de 548,8 s, pas celle de 400 s. Le 20 597 vient sans doute d'une version plus ancienne de l'étalon (commit f1719eca5, 12 parties). Je ne l'ai pas vérifié.

3. Ces deux parties sont les seules avec `chances: 1`. Ce sont donc des morceaux recollés après une seconde chance (ml/bot/etalon.js:26-28 et :43). Leur argent continue au-delà de la mort, alors que le bot n'a pas de seconde chance. Sans elles, le palier record de l'étalon est 21 : la partie de 263,4 s au doigt (`clavier: false`, celle de Léo).

La phrase actuelle désigne donc la mauvaise partie et donne un chiffre périmé. La correction proposée (10 089 par minute sans les deux ; palier record 21 sans les secondes chances) est juste.

Non vérifié : l'origine exacte du 20 597.

## 20. [moyen] `60aa15e` et `ccdca9b` présentés comme des versions retrouvables, mais ce ne sont pas des commits

`passation/BOTS-ML.md:129` · relecture : docs

Le document écrit « parties en `60aa15e` et `ccdca9b`, bot en `cashcar-v1627`, écarts non vérifiés ». Ces valeurs viennent du champ `ver` de l'enregistreur (enregistreur-jeu.js:37), qui vaut CC_VER = les 7 premiers caractères de l'EMPREINTE des fichiers publiés (code/page/tete.html:90 et 94 ; vercel-build.sh:86 et 95), pas un commit. `git cat-file -t 60aa15e` et `git cat-file -t ccdca9b` répondent « Not a valid object name » dans ce dépôt. Un agent qui voudrait vérifier les écarts ou rejouer dans la version des joueurs ne peut pas faire de `git checkout`. Il faut retrouver le commit dans version.json du déploiement Vercel (champ commit). De plus, `cashcar-v1627` (sw.js) et ces empreintes ne sont pas sur la même échelle : on ne peut pas dire si la version du bot est l'une des deux.

**Correction proposee.** Écrire que ce sont des empreintes du jeu publié (CC_VER) et expliquer comment retrouver le commit (version.json du déploiement de cette date, ou recalcul de l'empreinte à un commit donné). Ajouter à piloter.js / noter.js l'empreinte calculée de la même façon, pour que bot et joueurs portent la même étiquette.

*Le sceptique :* J'ai vérifié chaque point dans le code, et le défaut est réel mais mineur : c'est une imprécision de documentation, sans effet sur le jeu ni sur les mesures.

**Ce qui est confirmé**
- **Origine des deux valeurs.** Elles viennent du champ `ver:CC_VER` posé dans `code/moteur/enregistreur-jeu.js:37`.
- **`CC_VER` n'est pas un commit.** `code/page/tete.html:94` le définit comme `CC_BUILD.slice(0,7)`. `vercel-build.sh` remplace `__CC_BUILD__` par `$JEU` (ligne 93 du script). `$JEU` est le sha1 des fichiers publiés dans jouer/ (ligne 86). Le commit `$SHA` ne va que dans `version.json` (ligne 95). Le commentaire des lignes 80-84 le dit aussi : « L'EMPREINTE DU JEU, PLUS LE COMMIT ».
- **Ce ne sont pas des objets git.** `git cat-file -t 60aa15e` et `git cat-file -t ccdca9b` répondent tous deux « fatal: Not a valid object name ».
- **Deux échelles différentes.** `cashcar-v1627` est le numéro de cache de sw.js (cité aussi en `passation/BOTS-ML.md:85`). On ne peut pas le comparer à une empreinte. La phrase « trois versions du jeu se côtoient » (BOTS-ML.md:129) n'est donc pas établie : le bot tourne peut-être sur la même version que l'une des deux séries de parties.
- **Pas d'explication dans le document.** BOTS-ML.md:129-130 ne dit nulle part que ce sont des empreintes. Les lignes 169 et 266 parlent de « commit et empreinte », ce qui pousse à prendre ces deux valeurs pour des commits. Un agent qui tenterait un `git checkout` échouerait.

**Ce qui le rend mineur**
- Le document ne prétend pas que ces versions sont retrouvables, et il écrit lui-même « écarts non vérifiés ».

**Non vérifié**
- Je n'ai pas cherché quel commit correspond à chacune des deux empreintes. Il faudrait lire `version.json` des déploiements Vercel, ou recalculer l'empreinte commit par commit.
- Je n'ai pas lu piloter.js ni noter.js pour voir quelle étiquette de version ils posent. La seconde correction proposée (leur ajouter l'empreinte) reste donc à juger.

## 21. [moyen] `inscrire.js --valider` et la projection ne reprennent pas, ou pas entièrement, le régime du candidat

`ml/labo/README.md:25` · relecture : docs

`node inscrire.js --valider c0012` (README l.25) relit la ligne du journal (inscrire.js:19), mais ne transmet --regime à noter.js que s'il est tapé à la main (inscrire.js:37). Un candidat noté en allégé est donc validé au régime maximum, avec Crypto City au tirage. Le journal (inscrire.js:46) range alors cette validation sous regime 'max' sans aucun avertissement : la note de validation ne se compare pas à la note d'entraînement. Pour la projection, le README (l.171) affirme que la page charge le jeu avec `&poste=3`, le régime du simulateur. Mais pour un rejeu noté en allégé, page.html:57-58 envoie `&allege=1` seul, sans `&poste=3`. Le navigateur garde alors le POSTE jugé sur ce PC, alors que le simulateur avait POSTE.r = 3 avec ALLEGE (soleil-planete.js:607 et 613). Je n'ai pas vérifié si ce POSTE différent change la course. Le README ne dit rien de ce cas.

**Correction proposee.** Dans inscrire.js, prendre par défaut le régime de ligne0.jeu.regime quand --valider est donné. Dans page.html, envoyer `&allege=1&poste=3` pour un rejeu allégé. Documenter les deux points dans ml/labo/README.md.

*Le sceptique :* Le défaut est réel pour `--valider`. Le volet projection est bien moins sûr.

1) `--valider` (vérifié dans le code) : `ml/labo/inscrire.js:19` relit la ligne du candidat (`ligne0`), mais n'en reprend que `ligne0.code`. Le régime n'est transmis à `noter.js` que s'il est tapé à la main (`inscrire.js:37`, boucle sur `coeurs`, `carte`, `meteo`, `regime`). Sans `--regime`, `noter.js` joue au maximum (`ml/bot/noter.js:31`, `opt('regime','max')`), donc avec Crypto City au tirage. `ml/bot/piloter.js:29-30` n'ajoute `&allege=1` qu'en régime `allege`. La validation est enregistrée avec `regime: N.regime||'max'` (`inscrire.js:46`), puis écrite telle quelle par `labo.js:101-104` (`valider`). Ni `valider` ni `inscrire.js` ne compare ce régime à celui du candidat. Un candidat noté en allégé est donc validé en silence dans une autre version du jeu : une autre map au tirage, et des pièces valant 0,75 fois leur valeur d'après le commentaire de `page.html:53-54`. Sa note de validation ne se compare plus à sa note d'entraînement.
Limite : `journal/cerveaux.jsonl` ne contient aujourd'hui aucun champ `regime` (grep vide) et `validations.jsonl` n'existe pas encore. Le défaut est donc latent : il n'a encore faussé aucune donnée, mais il frappera dès qu'un candidat sera noté en allégé.

2) Projection (non tranché, probablement sans grand effet) : le constat est juste. `page.html:57-58` envoie `&allege=1` sans `&poste=3` pour un rejeu allégé. Le simulateur, lui, a `POSTE.r=3` avec `ALLEGE` vrai, parce qu'il n'a pas de puce à juger (`soleil-planete.js:600-613`). Mais sur ce PC (puce intégrée, r=2), `P.pal=[0,1,2,2][r]` donne le même palier 2, et `ALLEGE` est vrai des deux côtés. Je n'ai pas trouvé que `POSTE.r` change la course elle-même, et je n'ai pas exécuté de projection pour le vérifier. Sur un poste jugé r ≤ 1, le palier changerait. Le commentaire de `page.html:56` affirme d'ailleurs que `?allege=1` est « exactement ce que le simulateur a chargé », ce qui n'est vrai que pour le paramètre d'URL, pas pour le `POSTE` qui en découle.

## 22. [moyen] « Il tourne au régime MAXIMUM, quel que soit le PC » n'est plus vrai

`ml/reel/README.md:79` · relecture : docs

Le README de ml/reel affirme que le simulateur est toujours au maximum. Depuis b5735be4e, piloter.js:29-30 charge le jeu avec `&allege=1` quand regime = 'allege'. Dans ce cas ALLEGE est vrai (soleil-planete.js:613) et Crypto City sort du tirage (maps/niveaux.js, SF_HORS.crypto = ALLEGE…). Un agent qui lit ce README croit le simulateur incapable de jouer dans le régime des joueurs, et risque d'écrire une seconde fois cette option.

**Correction proposee.** Écrire : « Par défaut, régime maximum. `--regime allege` (noter.js, inscrire.js ; ouvrir({regime:'allege'}) dans piloter.js) charge le jeu avec ?allege=1 : version allégée, sans Crypto City. Le POSTE reste à 3. Ce que l'allégé change d'autre n'est pas mesuré. »

*Le sceptique :* Le défaut est réel. Il ne touche que la documentation : aucun code n'est faux. Vérifié dans le code, sans lancer le simulateur.

1. ml/reel/README.md:79 dit « Il tourne au régime MAXIMUM du jeu, quel que soit le PC (POSTE.r = 3, ALLEGE = false) ». Les lignes 80-81 ajoutent que Crypto City est à son tirage. Le README ne parle nulle part d'une option allégée : une recherche de allege et regime n'y trouve que les lignes 79 et 82.

2. L'option existe pourtant :
- ml/bot/piloter.js:29-30 : `regime=o.regime==='allege'?'allege':'max'`, puis `creer({query:(regime==='allege'?'&allege=1':'')+...})`. Les lignes 24-26 le documentent en commentaire.
- ml/reel/jeu-reel.js:109 ajoute bien opts.query à la requête du jeu.
- Elle est exposée par noter.js:12 et 31 (`--regime allege|max`, max par défaut) et transmise par ml/labo/inscrire.js:37. Elle est relue par labo/garder.js:20 et labo/rejouer.js:18 (`ouvrir({regime:...})`).

3. Avec ?allege=1, le jeu est bien en allégé :
- code/rendu/soleil-planete.js:573 : la regex `[?&](tel|mobile|allege)=[01]` fait sortir le juge plus tôt avec le P de départ de la ligne 569, donc `r:3` et `allege:false`. POSTE reste à 3, comme le dit la correction.
- soleil-planete.js:613 : `ALLEGE` devient vrai grâce à `/[?&](tel|mobile|allege)=1/`. Le « ALLEGE = false » du README est donc faux dans ce régime.

4. La retraite de Crypto City en allégé, je l'ai reprise du README (lignes 80-81) et de passation/BOTS-ML.md:292. Je n'ai pas relu SF_HORS dans maps/niveaux.js.

5. passation/BOTS-ML.md:292-295 (question ouverte 6) n'est pas à jour non plus. Il présente « le simulateur passe en allégé (?allege=1) » comme une piste à décider, alors que c'est déjà fait depuis b5735be4e.

Sur la conséquence : la phrase reste vraie par défaut, et le « quel que soit le PC » aussi. Mais elle se présente comme une limite du simulateur, sans dire que l'option existe. Un agent qui lit le README ou BOTS-ML risque donc de la recoder ou de croire les notes impossibles dans le régime des joueurs. La correction proposée est exacte, sous réserve de vérifier le point de SF_HORS. On peut aussi mettre à jour la question 6 de BOTS-ML.md.

## 23. [mineur] Au-delà de 6000 échantillons (10 min), raccourcis et distance deviennent faux

`ml/bot/mesures.js:29` · relecture : justesse

L'enregistreur supprime le début de `ech` au-delà de 6000 échantillons (enregistreur-jeu.js:90), mais garde tous les événements. Pour un vol plus ancien que le premier échantillon restant, `ici(v.t)` rend E[0] pour le décollage ET souvent pour la pose. La distance volée vaut alors 0, et le gain vaut s1−s0 entier : tout vol de plus de 60 m de piste devient un « raccourci ». distance_m ne couvre que les 10 dernières minutes, alors que duree_s couvre tout. Ce n'est pas encore arrivé dans l'étalon (aucun morceau ne dépasse 600 s), mais ça arrivera pour les meilleurs joueurs (paliers 28-30) et pour les bots si tmax > 600.

**Correction proposee.** Dans ici(), rendre null si |t − t de l'échantillon| > 0,3 s (et ne pas compter ce vol). Signaler dans mesures() une partie tronquée (E[0].t > 1) et calculer la distance seulement sur la fenêtre couverte, ou la ramener à la minute sur cette fenêtre.

*Le sceptique :* Le défaut est réel, mais il ne se déclenche pas encore : aucune partie de l'étalon ne dépasse 600 s, d'après le relecteur, ce que je n'ai pas recompté moi-même. Je l'ai vérifié en lisant le code, sans rien exécuter.

1) La coupe existe bien. Dans code/moteur/enregistreur-jeu.js:86-90, un échantillon est pris tous les JREC.PAS (10 par seconde), puis la ligne 90 fait `if(c.ech.length>6000)c.ech.splice(0,1);`. Les événements (jrEv, lignes 75-84) ne sont jamais coupés.

2) Ce que rend ici() pour un instant antérieur au premier échantillon gardé (ml/bot/mesures.js:29). Au premier échantillon E[0], l'écart vaut E[0].t − t et E[0] devient le meilleur. Dès l'échantillon suivant, l'écart grandit et son t dépasse t+0,3, donc la boucle s'arrête : ici() rend E[0]. Pour un vol entièrement antérieur à E[0], le décollage et la pose tombent donc sur le même échantillon. Le test de route de la ligne 31 passe forcément (g(a,'r')===g(b,'r')) et la distance en ligne droite (Math.hypot) vaut 0. Le gain vaut alors s1−s0 entier (ligne 32), et tout vol qui avance de 60 m de piste ou plus (RACC=60, ligne 7) compte comme raccourci. Ces vols sont dans `vols`, car `ev` est complet (lignes 24-27). raccourcis, raccourcis_m et raccourci_max_m sont donc gonflés. Un vol qui commence avant E[0] et se pose après est aussi faussé, avec un point de départ décalé.

3) La distance : la ligne 35 ne somme que les E restants, donc les 10 dernières minutes. barre() la divise par la durée totale (fin.t, ligne 20 ; distance_m_min, ligne 75), ce qui sous-estime distance_m_min. air_pct, kmh_moyen, nitro_pct et drift_pct ne portent eux aussi que sur cette fenêtre, sans fausser l'échelle.

4) Quand ça arrivera. Les bots passent par le même enregistreur. ml/bot/piloter.js:61 fixe tmax à 180 par défaut : c'est sans risque à 180, mais faux dès que tmax > 600. Pour les vrais joueurs, une partie de plus de 10 min est plausible pour les paliers 28 à 30, où il faut environ 3910 à 4385 pièces, alors que le bot de référence en fait environ 930 en 143 s. C'est justement l'échelle de matchmaking visée. etalon.js:41 recolle les morceaux par concat, mais chaque morceau a déjà été coupé à 6000.

Ce que je n'ai pas vérifié : les durées réelles des 14 parties de l'étalon, et le réglage précis de JREC.PAS (le commentaire de la ligne 85 dit 10 échantillons par seconde). La correction proposée est raisonnable : ici() rend null si l'écart dépasse 0,3 s, et mesures() signale une partie tronquée.

## 24. [mineur] Une mort dans les 5 dernières images est notée 'temps'

`ml/bot/piloter.js:85` · relecture : justesse

`vivant=!(vue&&vue.fini)` utilise la vue de la DERNIÈRE décision. Si la caisse meurt entre cette décision et la fin de la boucle (`fr<N`, au plus 5 images), `vue.fini` reste faux. Pourtant `__JR.fin()` écrit l'événement 'mort' (mode==='boom', ligne 21), puis la ligne 88 écrase `fin.cause` par 'temps'. Il en va de même dans rejouer() (lignes 152-155). La partie contient alors une mort ET une fin « temps » : cause et compte des morts en vol se contredisent. C'est rare (un cas sur 1800 images par course à tmax).

**Correction proposee.** Relire le mode après la boucle (`vivant=Y.modeDe(J)!=='boom'`) ou tester l'événement 'mort' dans partie.ev avant d'écraser la cause.

*Le sceptique :* Le défaut est réel, mais il est rare et ses effets sont limités. Je l'ai vérifié en lisant le code, sans rien exécuter.

1. Le cerveau ne regarde que toutes les 6 images : `HUMAIN.decision` vaut 6 (ml/bot/doigts.js:14). Dans course(), le jeu n'est regardé qu'à ces images-là (ml/bot/piloter.js:69-72). Avec tmax=180, N vaut 10800, un multiple de 6. La dernière vue est donc prise à l'image N-6, puis les images N-6 à N-1 tournent sans être regardées (lignes 80-83). Ensuite la boucle sort, car `fr<N` devient faux.

2. `vue.fini` vaut `!!(gameOver||mode==='boom')` (ml/bot/yeux.js:37). Si la caisse passe en 'boom' pendant ces 5 dernières images, la vue gardée date d'avant la mort. Elle a `fini=false`, donc `vivant` vaut true à la ligne 85.

3. `__JR.fin()` (piloter.js:21) relit l'état réel du jeu : `if(mode==='boom'||gameOver)jrEvMort(c,now)`. L'événement 'mort' est donc bien écrit dans la partie. Puis la ligne 88 remplace `partie.fin.cause` par 'temps' (ou 'panne').

4. Les mesures lisent les deux informations séparément. La cause sert à `cause:fin.cause` puis au comptage `causes` (ml/bot/mesures.js:38 et 63-64). L'événement 'mort' ferme le vol avec `mort:e[2]` (mesures.js:27). Une même partie peut donc compter une mort en vol tout en ayant la cause « temps » : c'est la contradiction annoncée.

5. Le même schéma se répète dans rejouer() : la vue n'est relue qu'aux images de décision (ligne 141), puis viennent `vivant=!(vue&&vue.fini)` (ligne 152) et `partie.fin.cause='temps'` (ligne 155). Les deux fonctions se trompent de la même façon. L'empreinte d'un rejeu reste donc cohérente avec sa course : le défaut n'est pas là.

Ce qui limite l'effet : il faut avoir survécu jusqu'à moins de 5 images de tmax, puis mourir précisément dans cette fenêtre. Seules quelques parties sur une série sont touchées. La durée change peu (moins d'un douzième de seconde). En revanche, la cause de fin et le taux « mort contre temps » sont faussés pour ces parties. Ces chiffres comptent pour classer un bot par niveau.

La correction proposée suffit : relire `Y.modeDe(J)` ou `gameOver` après la boucle, ou chercher un événement 'mort' dans la partie avant de remplacer la cause.

Ce que je n'ai pas vérifié : le contenu de jrEvMort et de jrFinit dans le code du jeu, en particulier si jrFinit pose lui-même `fin.cause` à partir de mortCause. Cela ne change pas la conclusion, puisque la ligne 88 écrase la cause dans tous les cas. Je n'ai pas non plus mesuré combien de parties sont touchées en pratique, puisque la consigne interdit de lancer le simulateur.

## 25. [mineur] La verification « avant de jouer 10 minutes » laisse passer des valeurs que le journal refuse apres

`ml/labo/inscrire.js:28` · relecture : labo

La pre-verification ne controle que la presence de --generation et la longueur de --raison. labo.inscrire() refuse ensuite (apres les 20 courses) une generation non entiere (parseInt('x')=NaN, labo.js:81) et un nom qui ne commence pas par lettre/chiffre : le nom vient de `nom:'...'` dans le code puis tout caractere hors [a-z0-9-] devient '-' (l.53), donc un nom « _essai » ou « élan » donne « -essai »/« -lan », refuse par la regex de labo.js:78. La note est alors perdue : le fichier temporaire a deja ete supprime (l.44) et le message dit seulement « inscription refusee ».

**Correction proposee.** Faire les memes tests (Number.isInteger(parseInt(...)), nom nettoye conforme a /^[a-z0-9][a-z0-9-]*$/i, parents connus) avant de lancer noter.js, et ne supprimer tmp qu'apres une inscription reussie.

*Le sceptique :* Le défaut est réel ; je l'ai vérifié en lisant le code, sans rien exécuter.

1. La pré-vérification (ml/labo/inscrire.js:26-32) contrôle seulement que --etape, --generation et --modele sont présents, que --raison fait au moins 12 caractères et que --entree/--sortie sont là pour un modèle payant. Le commentaire de la ligne 25 annonce pourtant « la meme verification que le journal ». Trois tests de labo.inscrire() n'y sont pas faits :
   - le nom : `/^[a-z0-9][a-z0-9-]*$/i`, labo.js:78 ;
   - la génération entière : `Number.isInteger(c.generation)`, labo.js:81 ;
   - les parents connus : labo.js:84.

2. Le nom vient de `nom:'...'` dans le code du cerveau (inscrire.js:52) ; la regex accepte tout caractère sauf les guillemets. Ensuite `nom.replace(/[^a-z0-9-]/gi,'-')` (l.53) transforme « _essai » en « -essai » et « élan » en « -lan » (é n'est pas dans a-z, même avec /i). Les deux sont refusés par labo.js:78, qui exige une lettre ou un chiffre en premier. De même, `--generation x` donne `parseInt` = NaN (l.53), refusé à labo.js:81. Un `--parents c9999` inconnu passe aussi la pré-vérification et n'est refusé qu'à labo.js:84.

3. L'ordre aggrave le problème. noter.js joue toutes les courses (l.42), puis le fichier temporaire est lu et supprimé (`fs.unlinkSync(tmp)`, l.44), avant l'appel à L.inscrire (l.53). Le refus lève une exception, attrapée l.57, qui affiche seulement « inscription refusee : … » et sort. La note est perdue. L'option --note (l.40), qui permet de réinscrire sans rejouer, ne peut pas servir : le fichier n'existe plus.

Conséquence : une faute de saisie ou un nom de cerveau mal choisi fait perdre toute la note, soit 20 courses (environ 10 minutes). Rien n'est corrompu, puisque rien n'est écrit au journal ni dans cerveaux/. Le défaut reste réel, et la correction proposée est la bonne : mêmes tests avant noter.js, et suppression de tmp seulement après une inscription réussie.

## 26. [mineur] Un seul rejeu illisible fait tomber la page d'accueil de la salle de projection

`ml/labo/projection.js:108` · relecture : labo

accueil() fait JSON.parse sur chaque rejeux/*.json sans try (contrairement a arbre.js:27). Un rejeu en cours d'ecriture par clore.js/garder.js (writeFileSync non atomique) ou abime donne une erreur 500 sur « / », donc plus aucun lien de projection. Dans le meme esprit, /__film (l.137) accepte un paquet dont la taille annoncee depasse la fin du corps : subarray le tronque sans rien dire et le .webm contient une image VP9 coupee.

**Correction proposee.** Envelopper chaque JSON.parse dans try/catch et sauter le fichier (en le signalant) ; dans /__film, refuser le corps si o+16+l>d.length.

*Le sceptique :* Je n'ai pas pu réfuter le défaut principal. Il est réel mais de faible gravité. Il touche un outil local du labo et ne change rien au jeu.

Ce que montre le code :
- **projection.js:108** : `accueil()` fait `JSON.parse(fs.readFileSync(...))` sur chaque `rejeux/*.json`, sans aucun try. L'erreur remonte jusqu'au catch général du serveur (**projection.js:150**), qui répond une erreur 500 sur « / ». La page d'accueil entière tombe donc, et avec elle tous les liens « voir / filmer », dès qu'un seul fichier est illisible.
- **arbre.js:27** lit les mêmes fichiers avec `try{JSON.parse(...)}catch(e){return null;}` puis `.filter(Boolean)`. Le cas « rejeu illisible » est donc déjà prévu ailleurs dans le labo. **labo.js:124** le prévoit aussi (`deja=null` si le fichier est illisible). Projection est le seul endroit où il ne l'est pas.
- **labo.js:132** écrit le rejeu par `fs.writeFileSync(fr, JSON.stringify(rejeu,null,1))` directement sur le fichier final. Il n'y a ni fichier temporaire ni `renameSync`. Un fichier tronqué est donc possible si le processus est tué pendant l'écriture, et un fichier à moitié écrit peut être lu pendant celle-ci.

Ce qui limite la gravité :
- L'écriture d'un rejeu est un petit JSON écrit en quelques millisecondes. Tomber dessus en chargeant « / » au mauvais moment est très peu probable, et un simple rechargement règle alors le problème.
- Le cas qui dure vraiment, c'est un fichier abîmé (processus tué en pleine écriture). Il bloque alors la page jusqu'à ce qu'on supprime ou répare le fichier à la main.
- Un rejeu lisible mais auquel il manque un champ ferait aussi tomber la page, et le try proposé ne le couvrirait pas : `r.cerveau.id`, `r.fin.t` et `r.pourquoi.map` (lignes 112-113) sont lus sans garde.

Sur la partie `/__film` (**projection.js:137**), c'est exact dans les faits : si `o+16+l > d.length`, `subarray` rend un paquet plus court sans rien signaler. Mais le corps vient uniquement de la page de projection du labo, servie en local sur 127.0.0.1. Il faudrait un envoi coupé ou une erreur de la page pour que cela arrive, et je n'ai pas vérifié page.html. Cette partie est donc plutôt théorique : au pire, la dernière image du film serait coupée.

La correction proposée (try/catch avec saut du fichier, comme dans arbre.js:27, et refus du corps si `o+16+l > d.length`) est cohérente avec le reste du labo.

Ce que je n'ai pas vérifié : je n'ai rien exécuté. Je n'ai pas lu garder.js en détail ; je suppose qu'il passe par `L.garder` / labo.js:132, mais je ne l'ai pas confirmé. Je n'ai pas lu projection/page.html, qui fabrique les paquets du film.

## 27. [mineur] Le palier du bot de référence n'est écrit nulle part, et il diffère du « palier 11 » annoncé

`ml/bot/results/note-reference.json:1` · relecture : docs

note-reference.json date du 23/11, avant que mesures.js ne calcule le palier. Il n'a ni palier_median, ni palier_record, ni palier par course : etalon.js n'affiche donc aucun palier pour la référence. Je l'ai recalculé depuis le champ pieces de ses 20 courses avec palierDe (mesures.js:15), sans relancer le simulateur : paliers 4 4 4 4 6 6 7 8 9 10 10 11 12 12 13 15 16 18 18 20, donc médiane 10 et record 20. Le « ≈ palier 11 (≈ 930 pièces) » vient de la moyenne des pièces (390,5/min × 47,5 min / 20 ≈ 927), pas de la médiane. Ces courses sont aussi coupées à 300 s au régime maximum, alors que les joueurs vont jusqu'à 548,8 s en allégé.

**Correction proposee.** Renoter la référence avec --tmax 300 et le régime choisi (ou au moins réécrire sa barre avec mesures.barre), et noter dans BOTS-ML.md : palier médian 10, record 20, plafonné par tmax.

*Le sceptique :* Je l'ai vérifié en lisant le code, sans lancer le simulateur. Le défaut est réel, même si une partie de l'explication est fausse.

**Ce qui est vrai :**
1. `ml/bot/results/note-reference.json` est daté du 23/11 (`date` "2026-11-23T18:43:22Z", ligne 2) et a `tmax: 300`. Il ne contient aucun champ `palier`, `palier_median` ni `palier_record`. Une recherche du mot « palier » dans le fichier ne trouve rien.
2. Le palier n'est calculé que depuis le 24/11 : `palierDe` (`ml/bot/mesures.js:15`), `palier` par partie (`mesures.js:42`), `palier_median`, `palier_record` et `paliers` (`mesures.js:71`), et la ligne affichée (`mesures.js:94`).
3. J'ai recalculé à la main avec les seuils `SEUILS` (`mesures.js:13`), à partir du champ `pieces` des 20 courses. Les pièces triées sont : 163 165 192 195 371 397 410 605 716 780 815 914 1025 1083 1169 1494 1667 2014 2072 2294. Elles donnent exactement les paliers du relecteur : 4 4 4 4 6 6 7 8 9 10 10 11 12 12 13 15 16 18 18 20.
   - La médiane, au sens de `med` (`mesures.js:62`, moyenne des 10e et 11e valeurs), vaut (10+10)/2 = 10.
   - Le record vaut 20.
   - La moyenne des pièces vaut 18541/20 = 927, et `palierDe(927)` = 11. Le « palier 11, environ 930 pièces » vient donc bien de la moyenne, pas de la médiane.
4. Les courses de la référence sont coupées à 300 s (`tmax: 300`). Le record de 20 est donc un plancher, pas un vrai record.

**Ce qui est faux ou exagéré :**
- `ml/bot/etalon.js` n'affiche jamais la référence. Il ne lit que les parties des joueurs (`etalon.js:13`, 61 et 64), donc l'argument « etalon.js n'affiche aucun palier pour la référence » ne tient pas.
- Le chiffre « palier 11 » ne figure ni dans `passation/BOTS-ML.md` ni dans `ml/bot/README.md` : je n'y ai trouvé ni « palier 11 » ni « 930 ». Il vient seulement du texte de la consigne.
- Je n'ai pas vérifié le chiffre de 548,8 s en allégé pour les joueurs.

**Conclusion :** le palier de la référence n'est écrit dans aucun résultat. Le chiffre qui circule (11, tiré de la moyenne) diffère de la médiane réelle (10), et le record (20) est plafonné par `tmax`. C'est une vraie conséquence pour une échelle de matchmaking qui repose sur le palier record. En revanche, le correctif ne concerne qu'un résultat et la documentation, pas le code.

## 28. [mineur] Le juge « humain ou bot » ne compte pas les parties comme l'étalon, et son verdict repose sur 4 courses triées

`ml/bot/discerner.js:19` · relecture : docs

discerner.js lit les parties humaines avec partiesDe sans recoller les secondes chances, et écarte les parties de moins de 20 s (l.78-81 du fichier, à partir de `const HUM=`). etalon.js, lui, recolle les secondes chances (etalon.js:24-57) et n'écarte que les parties de moins de 10 s. D'où 11 parties « clavier » dans results/discerner-reference-4-courses.json contre 10 parties de Sacha dans etalon-sacha.json. L'en-tête du fichier annonce pourtant « 14 parties de 2 joueurs ». Côté bot, la seule source est ml/labo/trajectoires : les 4 courses que clore.js a gardées parce qu'elles sont extrêmes (meilleure, plus courte, plus long vol, 2 figures en un vol). L'AUC de 0,97 citée dans le message du commit n'est donc pas mesurée sur un échantillon représentatif du bot. Rien de tout cela n'est écrit dans un README.

**Correction proposee.** Faire lire les parties humaines par la même fonction qu'etalon.js (recollage compris), juger le bot sur une note complète (`noter.js --parties`, 20 graines), et documenter discerner.js avec ces limites dans ml/bot/README.md.

*Le sceptique :* J'ai relu le code et les résultats, sans lancer le simulateur. Le défaut est réel pour la lecture des parties humaines. Le côté bot est surtout un problème d'échantillon et de documentation, pas un bug de l'outil.

**1. Les parties humaines ne sont pas comptées comme dans l'étalon : confirmé.**
- `ml/bot/discerner.js:78-81` lit les fichiers de `ml/bot/etalon/` avec `partiesDe` (l.17), écarte les parties de moins de 20 s (`c.fin.t<20`, l.79) et ne dédoublonne que par `debut` + `fin.t`. Il ne recolle pas les secondes chances et n'applique pas `finVraie` (la fin ramenée à l'instant de la pause).
- `ml/bot/etalon.js` fait les deux : `finVraie` aux l.29-32, recollage par `suite` et `colle` aux l.33-43 et 55-57. Il n'écarte que les parties de moins de 10 s (l.58).
- Les fichiers le confirment. `results/discerner-reference-4-courses.json` donne `humains.parties: 11` au clavier. `results/etalon-sacha.json` en compte 10. `results/etalon.json` en compte 14, dont 10 au clavier.
- La partie en trop vient très probablement d'une reprise par seconde chance comptée à part. Cela fausse la mesure « décollages » et quelques autres, et la fin réelle d'une partie quittée depuis la pause n'est pas corrigée.
- L'en-tête (l.15) annonce « 14 parties de 2 joueurs ». C'est le total de l'étalon, pas ce que le juge lit au clavier.

**2. Le bot est jugé sur 4 courses triées : confirmé.**
- Le fichier de résultat a `bot.sources: ["trajectoires"]` et `parties: 4`. `ml/labo/trajectoires/` contient 4 courses `c0001-*.json.gz`. La 5e, `e1-g000-toutes`, est exclue par le filtre `/toutes/` de la l.28.
- `ml/labo/clore.js:8` dit garder des courses extrêmes : la meilleure, la plus courte, la pire, le plus long vol, le plus de figures en un vol, le plus gros raccourci.
- L'AUC de 0,97 du commit b5735be4e est donc mesurée sur un échantillon non représentatif.
- L'outil lui-même accepte une note `noter.js --parties` (l.26). La limite est dans l'usage qui a été fait et dans le message du commit, pas dans le code.

**3. Rien n'est documenté.** `discerner` n'apparaît dans aucun `.md` de `ml/` ni dans `passation/BOTS-ML.md`.

**Portée.** Le verdict « discernable » sur le bot de référence tient sans doute quand même : l'écart de nitro (19 % contre 63 %) est énorme. Mais ce juge doit valider l'indiscernabilité des bots de l'écurie, palier par palier. Une base humaine comptée autrement que l'étalon, avec des morceaux de partie non recollés, biaise justement les cas serrés.

**Non vérifié.** Je n'ai pas identifié quelle partie précise fait 11 au lieu de 10, ni chiffré l'effet sur l'AUC : il faudrait lancer le script, ce qui m'était interdit.
