# D'où viennent les pièces des joueurs : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu en texte libre ; l'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l'agent. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `pieces-des-joueurs` (wf_ea0019dc-1c9), lancée par la session principale (Claude Fable).
- Agents : 4, 3 du modèle claude-opus-5-5, 1 du modèle claude-fable-5-2 (le modèle de chaque agent est écrit à son rôle, plus bas).
- Durée : 28 min ; jetons consommés par les agents : 854 686 (0,85 millions) ; appels d'outils : 154.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. compteur des joueurs : décompose les pièces des 14 parties de joueurs enregistrées (phase « Compter »)
2. compteur du bot : décompose de la même façon les pièces de 20 parties du pilote c0025 (phase « Compter »)
3. concepteur des leviers : dit d'où vient l'écart et par quels réglages le combler (phase « Concevoir »)
4. relecteur et rédacteur : refait les comptes, attaque les conclusions et écrit l'étude (phase « Relire »)

## 1. compter:joueurs

*Rôle : compteur des joueurs : décompose les pièces des 14 parties de joueurs enregistrées. Phase : Compter. Modèle : claude-opus-5-5.*

#### Compteur des joueurs : d'où viennent les pièces

Aucune course n'a été jouée et aucun test lancé. Rien n'est commité. J'ai écrit trois scripts en lecture seule et leurs sorties, tous dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\echelle-de-bots\pieces\compteur-joueurs\` :
- `decompose.js` produit `sortie.txt` et `sortie.json` ;
- `raccourcis.js` produit `raccourcis.txt`.

Pour refaire : `node ml/ecurie/etude/echelle-de-bots/pieces/compteur-joueurs/decompose.js`, depuis la racine du dépôt.

##### 0. Ce qui fait monter coinsGot (lu dans code/)

Il n'y a que deux appels en jeu :
- **une pièce ramassée vaut +1** (`gameplay/ramassage.js:174`). L'aimant passe par le même chemin, donc ses pièces ne se distinguent pas ;
- **une figure encaissée vaut de 2 à 18** : à la pose d'un vol (`demi-tour.js:574`) ou en figure de route (`figures-route.js:64`).

Ce qui ne donne aucune pièce de moteur :
- frénésie, flow, combo, contrats, raccourcis, billets et fruits : ils ne multiplient que l'argent (`money`) ;
- la seconde chance retire un palier (`seconde-chance.js:188`) ;
- le départ boosté pose 40 pièces (`final-spin.js:482`) : on ne le voit dans aucune partie.

Les « bonus » de la question ne font donc pas le palier.

**Méthode.** L'enregistreur émet un événement `piece` à chaque hausse de coinsGot dans une image. Une `figure_payee` tombe dans la même image que les pièces de sa figure (`enregistreur-jeu.js:82-84`). D'où le tri :
- une pièce à l'instant d'une `figure_payee` compte comme pièce de figure. Une pièce de route prise dans la même image y est comptée avec, soit 1 à 2 pièces de trop par figure (moins de 1 % du total) ;
- une `figure_payee` à 0,25 s ou moins d'une pose est une figure de vol ; sinon c'est une figure de route ;
- 6 figures payées sur 205 n'ont aucune pièce dans leur image : non expliqué.

**Comparaison.** Pour c0025, j'utilise les 20 courses enregistrées avec le même enregistreur, dans `ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json` (le fichier que l'étude « avant le bord » § 4 lit comme c0025).
- Elles donnent 248 pièces/min ; le banc (96 courses « depart ») en donne 227.
- Autre lot, autres graines : l'écart de niveau joueurs / bot est un peu sous-estimé ici.

##### 1. Partie par partie (extrait ; tableau complet dans sortie.txt § 1)

| | palier | durée s | pièces/min | % figures | km/min | pièces de route/km | % air | portails |
|---|---|---|---|---|---|---|---|---|
| joueurs (12 parties de plus de 50 s) | 4 à 28 | 52 à 545 | **229 à 596** | 4 à 25 | 7,3 à 16,8 | 21 à 64 | 7 à 42 | 0 à 13 |
| c0025 (20 courses) | 2 à 14 | 20 à 279 | **90 à 353** | 0 à 19 | 5,3 à 8,1 | 16 à 51 | 5 à 40 | 0 à 4 |

- Aucun bot ne dépasse 8,1 km/min. Neuf parties de joueurs sur douze le dépassent.
- La seconde chance reprend 255 et 364 pièces aux parties P22 et P28.

##### 2. Minute par minute

Les taux sont les totaux divisés par les minutes vécues dans chaque fenêtre.

| fenêtre | parties (J / B) | pièces/min J / B | route au sol | route en l'air | figures de vol | figures de route | km/min J / B | route/km J / B | % air J / B | vols/min J / B | nitro % J / B | km/h au sol J / B |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| min 1 | 14 / 20 | 245 / 188 | 228 / 176 | 5 / 3 | 11 / 9 | 1 / 0 | 6,98 / 6,10 | 33 / 29 | 16 / 14 | 3,9 / 3,7 | 72 / 58 | 405 / 375 |
| min 2 | 11 / 18 | 392 / 249 | 318 / 224 | 30 / 11 | 40 / 14 | 3 / 0 | 8,76 / 7,26 | 40 / 32 | 25 / 20 | 6,9 / 5,1 | 67 / 52 | 503 / 455 |
| min 3 | 9 / 11 | 529 / 286 | 456 / 238 | 26 / 21 | 39 / 27 | 8 / 0 | 10,67 / 7,55 | 45 / 34 | 30 / 38 | 8,5 / 8,8 | 53 / 44 | 598 / 497 |
| min 4+ | 5 / 4 | 610 / 466 | 499 / 395 | 59 / 41 | 48 / 30 | 4 / 0 | 17,51 / 8,92 | 32 / 49 | 45 / 38 | 12,7 / 11,9 | 50 / 43 | 920 / 553 |
| tout | 14 / 20 | 437 / 248 | 369 / 221 | 31 / 12 | 33 / 15 | 4 / 0 | 11,18 / 6,98 | 36 / 33 | 29 / 22 | 8,0 / 5,7 | 61 / 53 | 581 / 432 |

Les figures, en détail (raccourcis.txt) :
- figures payées par minute : joueurs 5,0, c0025 2,4 ;
- pièces par figure : 7,6 contre 6,4 ;
- figures par vol : 0,47 à 0,94 chez les joueurs, 0,1 à 0,67 chez c0025 ;
- figures de 10 pièces ou plus : 28 % des figures des joueurs, 13 % chez c0025 ;
- c0025 ne fait **aucune** figure de route.

##### 3. La recette d'un joueur : sur 100 pièces

| fenêtre | route au sol | route en l'air | figures de vol | figures de route | autre |
|---|---|---|---|---|---|
| min 1 | 93 | 2 | 4 | 1 | 0 |
| min 2 | 81 | 8 | 10 | 1 | 0 |
| min 3 | 86 | 5 | 7 | 1 | 0 |
| min 4 et au-delà | 82 | 10 | 8 | 1 | 0 |
| **c0025, toutes minutes** | 89 | 5 | 6 | 0 | 0 |

- Les deux joueurs ont presque la même recette : clavier 85/6/9/0, doigt 84/9/5/2.
- **Le mélange des sources est presque le même chez le bot.** L'écart n'est pas dans la recette : il est dans le volume.

##### 4. D'où vient l'écart (bootstrap sur les parties, 4 000 tirages, IC à 95 %)

| rapport joueurs / c0025 | toutes minutes | minute 1 | après 60 s |
|---|---|---|---|
| pièces/min | **1,76** [1,47 ; 2,07] | 1,30 [0,99 ; 1,64] | 1,79 [1,55 ; 2,22] |
| km/min | **1,60** [1,23 ; 1,95] | 1,14 [1,06 ; 1,23] | 1,72 [1,29 ; 2,09] |
| pièces de route par km | **1,07** [0,86 ; 1,44] | 1,14 [0,86 ; 1,45] | 1,02 [0,80 ; 1,48] |
| pièces de figure par minute | 2,42 [1,81 ; 3,33] | 1,40 [0,70 ; 2,66] | 2,40 [1,77 ; 3,55] |
| vols/min | 1,40 [1,06 ; 1,78] | 1,05 | 1,38 |
| part du temps en l'air | 1,30 [0,93 ; 1,70] | 1,10 | 1,25 |

**Le partage de l'écart, toutes minutes** (189 pièces/min) :
- figures : 22 pièces/min, environ 12 % ;
- pièces de route : 167 pièces/min, que j'ai partagées entre km et densité par le logarithme :
  - **les km/min portent environ 77 %** de l'écart total ;
  - la densité au km environ 11 %, et son intervalle contient 1 : elle n'est pas démontrée.

**D'où viennent les km de plus** (`raccourcis.txt`, mêmes règles que `mesures.js`) :
- les raccourcis gagnent 1 749 m/min chez les joueurs contre 606 chez c0025, soit environ 27 % des 4,2 km/min d'écart ;
- les joueurs font 2,79 raccourcis/min, c0025 0,93 ;
- le reste vient de la vitesse au sol : 581 contre 432 km/h, avec plus de nitro (61 contre 53 %).

**L'enchaînement.** À la minute 1, l'écart est faible : ×1,3, et à la limite du significatif. Il se creuse ensuite.
- Les joueurs passent le premier portail plus tôt : médiane 62 s contre 83 s (11 parties sur 14 contre 16 sur 20).
- Ils montent de palier plus vite, et le palier donne la vitesse.
- C'est cohérent avec une boucle « plus de km, donc plus de pièces, donc un palier plus haut, donc plus de km ». **Elle n'est pas démontrée comme cause** : aucune expérience ne la teste.

##### 5. L'effet du palier lui-même : vitesse ou densité ?

| palier courant | minutes J / B | km/min J / B | route/km J / B | route/min J / B |
|---|---|---|---|---|
| 1-4 | 12,3 / 22,0 | 6,95 / 6,25 | 29 / 29 | 203 / 183 |
| 5-8 | 9,4 / 18,4 | 8,69 / 7,25 | 40 / 34 | 347 / 245 |
| 9-12 | 6,4 / 5,6 | 10,76 / 8,30 | 53 / 41 | 575 / 341 |
| 13-30 | 12,7 / 1,3 | 17,34 / 9,63 | 31 / 46 | 541 / 444 |

**Chez les joueurs, du palier 1-4 au palier 9-12** : les pièces de route par minute sont multipliées par 2,8, soit **km ×1,55 et densité ×1,83, à parts à peu près égales**.

**La densité suit les portails franchis** (joueurs 30, 40, 50, 49 pièces/km aux portails 0 à 3 ; c0025 28, 37, 34, 50), comme le dit `economie.md`. Mais palier et portails montent ensemble : je ne peux pas séparer les deux.

**Au-dessus du palier 13**, chez les joueurs :
- les km continuent de monter (17 km/min, 920 km/h au sol) ;
- la densité retombe à 31/km : 45 % du temps se passe en l'air, avec des raccourcis ;
- le débit plafonne vers 540 à 610 pièces/min ;
- ce chiffre repose sur 6 parties, dont 2 longues du joueur au clavier.

**À palier égal, les joueurs ramassent déjà plus** :
- ×1,11 au palier 1-4 (tout par les km) ;
- ×1,42 au palier 5-8 (km ×1,20, densité ×1,18) ;
- ×1,69 au palier 9-12 (km ×1,30, densité ×1,29).

Pour le bot au-dessus de 13 : seulement 1,3 minute de course, donc inutilisable.

##### 6. Ce qui ne se démontre pas

- **14 parties de 2 joueurs habitués.** Après 3 minutes, il ne reste que 5 parties de joueurs et 4 courses de c0025.
- **Pièces de route et pièces d'aimant ne se séparent pas** : l'enregistreur ne note pas les pouvoirs.
- **Les raccourcis ne sont pas tous vus.** Les poses dans un filet ne sont pas exclues (`mesures.js`), ce qui vaut pour les deux.
- **Les km sont l'avancée le long de la route.** Un raccourci y compte en partie.
- **Un écart non expliqué avec la théorie.** Ramassé, on mesure 28 à 53 pièces/km ; `economie.md` annonce une densité offerte de 55 à 240/km. Si c'est la part prise ou une erreur de la formule : **on ne sait pas**.
- **Versions du jeu différentes.** Les joueurs ont joué deux autres versions, en allégé, avec LA HONTE ; le bot joue cashcar-v1627.
- **La cause.** Le sens de la boucle palier → vitesse → pièces est une lecture, pas une mesure.

**En une phrase.** C0025 ramasse comme un joueur par kilomètre et dans les mêmes proportions de sources ; il fait environ 1,6 fois moins de kilomètres par minute (moins vite au sol, moins de nitro, trois fois moins de mètres gagnés en raccourcis) et deux fois moins de figures payées ; l'écart est petit à la minute 1 et se creuse avec le palier.

## 2. compter:bot

*Rôle : compteur du bot : décompose de la même façon les pièces de 20 parties du pilote c0025. Phase : Compter. Modèle : claude-opus-5-5.*

#### Compteur du bot : d'où viennent les pièces de c0025, face aux joueurs

Aucune course n'a été jouée et aucun test lancé ; rien n'est commité. J'ai écrit deux scripts en lecture seule, avec leurs sorties, dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\echelle-de-bots\pieces\compteur-bot\` : `decomposer.js` → `sortie-decomposer.txt` et `causes.js` → `sortie-causes.txt`. Pour les refaire : `node <script>` depuis la racine du dépôt.

**Sources.**
- **Joueurs** : `ml/bot/etalon`, lus par `partiesJoueurs` et `finVraie`, soit 14 parties et 40,8 min.
- **c0025** : `ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json`, 20 parties complètes enregistrées par le jeu (`cashcar-jeurec-1`), 47,3 min, `cashcar-v1627`. Il s'agit de pilote-voltige (cerveau `c3e8b819…`). Le banc des gènes trouve la même empreinte pour « voltige » et pour « depart » (c0025) sur les graines 3000000 et 3000037. Je le traite donc comme c0025. C'est une identité vue sur 2 courses seulement.
- **Ce que les autres sources n'ont pas.** Les 96 lignes « depart » du banc et les 40 traces vue par vue ne gardent aucun événement `piece`. Ces traces n'ont que `decol`, `pose` et `mort`, plus le palier. Elles servent aux parties (4) et (1c), pas à la répartition par source.

##### 0. Ce qui fait bouger `coinsGot` dans le code

Le palier ne monte que par `addCoins` (`code/economie/achat-carte-moteur.js:236`), et seulement par deux voies :
- **Une pièce ramassée = +1** (`gameplay/ramassage.js:174`). Le multiplicateur de récolte du combo (`mult`) s'applique à l'argent, pas aux pièces.
- **Une pose payée = 2 à 18 pièces**, calculé par `round(2+q/6)` (`figures-route.js:64`, `demi-tour.js:574`). La valeur `q` est multipliée par le niveau du flow (×(1+0,5·lv)) et par la frénésie (×2), avec un plafond à 18.

Les bonus n'apportent donc **aucune pièce en propre**. Frénésie et flow ne font que grossir une pose payée. L'aimant élargit la portée du ramassage (3,8 + 0,5·mag), mais ce n'est pas enregistré : son effet, **on ne le sait pas**. Les raccourcis ne paient aucune pièce.

Une pose sans figure de la main peut être payée : on voit une `pose` à 0 figure suivie d'un `figure_payee`. Ce qui remplit la chaîne n'est pas lu ici.

##### 1. Par source (définitions de `mesures.js`)

Les trois sources :
- **figure** : le gain enregistré à l'instant d'un `figure_payee` ;
- **en l'air** : un gain entre un `decol` et sa `pose` ou sa `mort` ;
- **route** : le reste.

Les intervalles sont à 95 %, par tirage des parties.

| | joueurs (14) | c0025 (20) | joueurs, parties de 120 à 300 s (7) | c0025, parties de 120 à 300 s (11) |
|---|---|---|---|---|
| pièces par minute | **436** [371–480] | **248** [218–276] | 452 [365–522] | 265 [234–295] |
| route par minute | 369 (84,5 %) | 221 (89,0 %) | 381 | 233 |
| en l'air par minute | 31 (7,0 %) | 12 (4,9 %) | 31 | 15 |
| figures par minute | 37 (8,5 %) | 15 (6,2 %) | 40 | 17 |
| poses payées par minute | 5,0 | 2,4 | 5,1 | 2,8 |
| pièces par pose payée | 7,4 | 6,3 | 7,9 | 6,2 |
| vols par minute | 8,0 | 5,7 | 6,9 | 6,3 |
| poses payées par vol | 0,63 | 0,42 | 0,74 | 0,44 |
| figures de la main par minute | 2,18 | 0,66 | | |
| raccourcis par minute (m gagnés par minute) | 2,79 (1 749) | 0,93 (607) | | |

**À durée égale, l'écart est de 187 pièces par minute** (452 contre 265). Il se répartit ainsi :
- **route : −148, soit 79 %** ;
- figures : −23, soit 12 % ;
- en l'air : −16, soit 8 %.

Le banc trouve 226,6 pièces par minute pour c0025 sur 96 courses, contre 248 ici, sur d'autres graines : c'est compatible.

**Les 40 traces** (180 s au plus, map imposée) : 255 décollages, 220 poses, et 28 poses seulement portent au moins une figure de la main (13 %). Cela fait **0,15 figure par pose**.

##### 2. Par cause mécanique

###### Minute par minute

Lecture de chaque case : joueurs / c0025.

| tranche | parties vivantes | km par minute | pièces de route par km | total par minute | en l'air % | vols par minute | nitro % | km/h au sol |
|---|---|---|---|---|---|---|---|---|
| 0–60 s | 14 / 20 | 7,0 / 6,1 | 32,6 / 28,8 | 244 / 187 | 16 / 14 | 3,9 / 3,7 | 71 / 58 | 405 / 374 |
| 60–120 s | 11 / 18 | 8,8 / 7,3 | 36,3 / 30,9 | 391 / 249 | 25 / 20 | 6,9 / 5,1 | 67 / 52 | 503 / 455 |
| 120–180 s | 9 / 11 | 10,7 / 7,6 | 42,8 / 31,5 | 529 / 286 | 30 / 38 | 8,5 / 8,8 | 53 / 44 | 598 / 497 |
| 180 s et au-delà | 5 / 4 | 17,5 / 8,9 | 28,5 / 44,3 | 609 / 466 | 45 / 38 | 12,7 / 11,9 | 50 / 43 | 920 / 553 |

###### Au même palier moteur

Le palier de chaque échantillon est refait depuis la somme des événements `piece`.

| paliers | minutes J / c0025 | km/h au sol | km par minute | pièces de route par km | route par minute | nitro % |
|---|---|---|---|---|---|---|
| 4–6 | 7,8 / 18,0 | 467 / 449 | 8,2 / 7,2 | 35,1 / 28,4 | 288 / 204 | 67 / 53 |
| 7–9 | 6,6 / 9,3 | 527 / 489 | 9,2 / 7,4 | 39,7 / 35,8 | 364 / 266 | 63 / 44 |
| 10–12 | 4,7 / 2,9 | 624 / 529 | 11,0 / 8,3 | 50,4 / 42,2 | 555 / 351 | 59 / 43 |

**Même au même palier, la route rapporte 1,4 fois plus aux joueurs**, à parts à peu près égales :
- ils vont plus vite : 1,14 à 1,33 fois plus de km par minute, avec plus de nitro ;
- ils prennent plus de pièces par km : 1,11 à 1,24 fois plus.

###### Le surplus de pièces par km vient surtout de la route où l'on se trouve

| route | pièces par km, joueurs | pièces par km, c0025 | km parcourus J / c0025 |
|---|---|---|---|
| route 0 | 30,2 | 28,1 | 86 / 161 |
| route 1 | 39,5 | 37,3 | 86 / 88 |
| route 2 | 50,0 | 33,8 | 50 / 52 |

- **La densité monte d'une route à l'autre.** Je l'ai lu dans les pièces par km des enregistrements, pas dans le code.
- **Sur la même route, c0025 prend environ 93 à 95 % de ce que prennent les joueurs** (routes 0 et 1).
- **Il arrive plus tard aux portails** : le premier à 83 s en médiane (16 parties sur 20) contre 62 s (11 sur 14) ; le deuxième à 134 s contre 120 s ; le troisième est atteint par 2 parties sur 20, contre 7 sur 14.
- Les raccourcis des joueurs (1,75 km de piste sautée par minute, contre 0,61) les y amènent aussi plus tôt.

**Le visé latéral** : les joueurs prennent 14,7 % de leurs pièces au sol à 18 m ou plus du centre de la route, c0025 9,0 %. C'est cohérent avec la marge de c0025 (voir 3).

Sur les paliers 13 et plus, c0025 n'a que 1,9 min : **aucune conclusion** n'en sort.

##### 3. Ce que le pilote fait pour les pièces

###### Ce que les yeux montrent (`ml/bot/yeux.js:88-94`)

`piecesDevant` ne contient que les pièces :
- de la même face de la route ;
- non prises ;
- **qui ne sont pas des pièces aériennes (`p.air`)** ;
- situées de 4 à 325 m devant.

Elles sont regroupées par tranches de 25 m, avec un côté moyen et un nombre par tranche. Deux files de part et d'autre de la route donnent donc un côté moyen au milieu. **En vol, la vue ne donne aucune pièce.**

**Les pièces en l'air ne sont jamais vues ni visées** : ses 4,9 % viennent par hasard.

###### Comment il choisit (`modele.js:143-158`, `aRamasser`, puis `auSol` l.221-238)

1. Il vise d'abord un objet de la ligne parfaite (fruit) à moins de `ligneLoin`, s'il est plus proche que les pièces ou s'il arrive dans 1,2 s.
2. Ensuite un orbe à moins de 220 m.
3. Sinon, la **première** tranche de pièces qui remplit trois conditions :
   - elle est à moins de `piecesLoin` ;
   - elle est à au moins max(15 ; `avance`·vitesse), soit environ 39 m à 130 m/s ;
   - son côté vaut au plus demi-route − `marge`, soit 18 m (13 m dans un couloir), et elle est atteignable en glissant : écart < (d − 0,25 v)·`glisse`·0,85.

Ensuite, la place dans le virage l'emporte sur la cible (au-delà de `braqueDoux`), et les flaques la déplacent. Les pièces trop proches, trop au bord ou trop en travers ne sont jamais des cibles. Aucun gène d'« avidité » n'échange de la sécurité contre des pièces.

###### Les gènes de c0025

c0025 est le témoin : ses gènes ont leur valeur de naissance (`ml/evolution/genome.js` l.33-52 ; l'empreinte est identique à pilote-voltige).

| gène | valeur | bornes |
|---|---|---|
| `piecesLoin` | 180 | 60–350 |
| `avance` | 0,3 | 0,1–0,8 |
| `glisse` | 0,12 | 0,04–0,3 |
| `marge` | 10 | 3–20 |
| `margeCouloir` | 15 | 5–25 |
| `bandeDecor` | 99 | 10–99 |
| `ligneLoin` | 320 | 100–500 |
| `braqueDoux` | 0,15 | 0–0,5 |
| `braqueFort` | 0,5 | 0,2–1 |

**Les figures (l.592-601)** : seulement dans un vol voulu, ou au-dessus de `figHaut` (15 ; bornes 0–60) hors des maps à décor. Les autres conditions :
- au plus `figMax` 2 par vol ;
- une pose propre annoncée à au moins `figTemps` 1,5 s ;
- une jauge d'au moins `figJauge` 0,4 ;
- au moins `figEcart` 0,55 s entre deux gestes et au moins `figDepuis` 0,4 s de vol.

L'en-tête du pilote le dit : « pas de risque gratuit : ni saut, ni figure ».

##### 4. Les bras du banc

Pièces (le sommet) par minute de course, chaque bras apparié à « depart » sur les mêmes 96 graines ; intervalle à 95 % par tirage des graines.

| bras | pièces par minute | écart à depart [IC 95 %] |
|---|---|---|
| depart (c0025) | 226,6 | — |
| lacheOn | 238,0 | +11,5 [−6,5 ; 30,3] |
| suitOn | 237,6 | +11,1 [−4,1 ; 26,1] |
| bordOn | 235,0 | +8,5 [−4,1 ; 21,1] |
| largeOn | 232,3 | +5,7 [0,0 ; 15,1] |
| c0101 | 232,0 | +5,4 [−11,9 ; 23,2] |
| c0026, fuirVite, relacheOn | 229 à 229,5 | +2,3 à +2,9, intervalles qui contiennent 0 |
| coupOn | 225,7 | −0,9 [−9,3 ; 8,1] |
| libreOn | 223,3 | −3,2 [−9,5 ; 2,6] |
| **slalomOn** | **196,8** | **−29,7 [−42,7 ; −17,0]** |
| **gestes5** | **187,6** | **−39,0 [−52,4 ; −26,9]** |

**Aucun bras ne relève nettement le débit.** largeOn est à la limite de zéro, et ce bras est testé parmi douze. Seuls deux bras le changent, et ils le **baissent** : slalomOn et gestes5. Leurs figures par minute montent (0,92 et 0,96 contre 0,65), sans compenser.

##### La recette de c0025 : sur 100 pièces

| source | c0025 (20 parties, 47 min) | joueurs (14 parties, 41 min) |
|---|---|---|
| pièces de la route | **89** | 84,5 |
| poses payées (figures) | **6** | 8,5 |
| pièces prises en l'air | **5** | 7 |
| bonus (frénésie, flow, combo, aimant, raccourcis) | **0** en propre : ils ne font que grossir une pose payée, ou rien | 0 |

##### Ce qui se démontre, et ce qui ne se démontre pas

- **Démontré**, à l'intervalle près, sur ces lots : le manque vient d'abord de la route (79 %), ensuite des figures (12 %) et de l'air (8 %).
- **Mécanique de la route** : c0025 roule moins vite (moins de nitro, km/h au sol plus bas au même palier), passe les portails plus tard, et reste donc plus longtemps sur les routes peu denses. Sur une même route, il ne perd qu'environ 5 à 7 % au visé. Ce sont des **indices** : 2 joueurs habitués, 14 parties, deux versions du jeu.
- **Ce qu'on ne sait pas** :
  - combien de pièces la route **offre**, donc si le visé est vraiment le levier ou si ce sont la vitesse et la progression ;
  - que la densité suive les portails dans le code (non lu) ;
  - l'effet de l'aimant et des pouvoirs ;
  - ce qui remplit la chaîne d'une pose payée sans figure ;
  - tout ce qui se passe au-dessus du palier 12.


## 3. concevoir:leviers

*Rôle : concepteur des leviers : dit d'où vient l'écart et par quels réglages le combler. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### Concepteur des leviers : d'où vient l'écart de pièces, et par quoi le combler

Aucune course, aucun test, rien de commité. Trois scripts en lecture seule et leurs sorties, dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\echelle-de-bots\pieces\concepteur-leviers\` : `ecart.js` (→ `sortie-ecart.txt` ; avec `--avant 180` → `sortie-ecart-avant-180.txt`), `nitro.js` (→ `sortie-nitro.txt`), `vise.js` (→ `sortie-vise.txt`). Mêmes lots que les compteurs : 14 parties de joueurs (40,8 min), 20 parties de c0025 (47,3 min, `note-voltige4-t900.json`).

##### 0. Une correction aux deux compteurs

« c0025 ramasse comme un joueur par kilomètre » est faux. Ils divisent par tous les km, y compris ceux avancés en vol, où aucune pièce n'est posée (`economie.md`). Les joueurs avancent 4,6 km/min en vol, c0025 1,6.

**Par km roulé au sol, les joueurs prennent 56,4 pièces, c0025 41,2 : ×1,37 [1,20 ; 1,61].** La vitesse au sol ne fait que ×1,34 [1,12 ; 1,54], et ×1,14 sur les 180 premières secondes.

##### 1. Le tableau de l'écart

Route au sol = part du temps au sol × km de sol par minute de sol × pièces par km de sol, partagé par logarithme. « À palier égal » et « à zone égale » : les joueurs ramenés au mélange de c0025. Intervalles à 95 % par tirage des parties.

| cause | joueurs / c0025 | toutes minutes | coupé à 180 s |
|---|---|---|---|
| pièces par km de sol, à zone égale (le visé) | ×1,13 [1,00 ; 1,28] | +35 (18 % [0 ; 40]) | +41 (31 % [5 ; 49]) |
| pièces par km de sol, mélange des zones (portails passés plus tôt) | ×1,21 | +56 (30 %) | +39 (29 %) |
| vitesse au sol, à palier égal | ×1,10 [1,05 ; 1,15] | +28 (15 % [7 ; 26]) | +18 (14 % [7 ; 23]) |
| vitesse au sol, mélange des paliers (conséquence) | ×1,21 | +56 (30 %) | +14 (11 %) |
| part du temps au sol | 71 % / 78 % | −26 (−14 %) | −4 (−3 %) |
| pièces de route prises en vol | 29 / 11 par min | +18 (9 %) | +9 (6 %) |
| figures payées | 37 / 15 par min | +22 (12 % [7 ; 21]) | +17 (13 % [5 ; 25]) |
| **total** | 437 / 248 (à 180 s : 363 / 229) | **188** | **134** |

La somme est exacte par construction. Ce qui reste inexpliqué est à l'intérieur de deux lignes :

- **Le visé.** L'écart à zone égale se loge en zone 1, au-delà de 12 m de l'axe : 20,2 pièces/km contre 8,3. Il est faible en zones 0 et 2. Cela tient sur 53 et 69 km : un indice. Ce que la route offre n'est pas mesuré.
- **La vitesse à palier égal.** Nitro au sol 73 % contre 62 %. Mais donner à c0025 la part de nitro des joueurs n'ajoute que 3 à 8 km/h sur 20 à 40 d'écart (calcul statique). Même nitro allumée, les joueurs vont plus vite (482 contre 462 km/h aux paliers 4-6). Le reste (niveau de flow, élan) n'est pas enregistré : **on ne sait pas**.

Le « mélange des paliers » est la boucle plus deux parties longues : ce n'est pas un levier.

##### 2. Les leviers

###### A. Passer les portails plus tôt : les raccourcis (environ 30 %)

- Zone 0 traversée en 62 s contre 83 s (11 et 16 zones). Les joueurs y sautent 16 % de la longueur, c0025 6 %.
- **54 % des mètres gagnés par les joueurs le sont sur jade, grotte et canyon, où c0025 a `raccCartes_*` = 0** : 939 m/min contre 105. Grotte : 4,5 raccourcis/min contre 0,55.
- Sur les maps ouvertes l'écart est faible (ville 3,1 contre 2,1 ; nuages 3,4 contre 2,4).

**Gène existant, greffable** (interrupteurs) :
```
{"raccCartes_grotte":1,"raccJumeau_grotte":1}
{"raccCartes_canyon":1,"raccJumeau_canyon":1}
{"raccCartes_jade":1}
```
**Risque : c'est ce que le pilote ne peut pas faire avec ses yeux.** `pilote-voltige.js` l.65 dit pourquoi ces maps sont fermées : à la grotte, 4 sorties engagées sur 4 finissent dans la roche alors que le rayon annonçait une pose ; à la jade, 3 plongeons sur 4 finissent mal (12 courses, 26/11). `raccJumeau` est la seule garde existante ; son effet sur ces maps n'est pas mesuré.

La greffe `raccCartes_ville:0` en cours sur le Ryzen va à l'inverse : elle retire 2 427 m/min.

###### B. Le visé (18 à 31 %, borne basse proche de 0)

- **Gènes existants, réels donc non greffables** : `marge` 10 [3–20] (plafonne à 18 m de l'axe, 13 en couloir), `piecesLoin` 180 [60–350], `avance` 0,3 [0,1–0,8], `glisse` 0,12 [0,04–0,3], `braqueDoux` 0,15 et `braqueFort` 0,5 (la place dans le virage écrase la cible). La sélection peut les muter ; un bras du banc peut les poser.
- **Risque** : rouler plus près du bord. Toutes les morts sur décor sortent par le côté (« avant le bord »).
- **Règle nouvelle, seulement si `marge` ne suffit pas** : `fileOn` (interrupteur, 0 à la naissance) et `fileVue` (réel 100–300, gardé par `fileOn`). Dans `aRamasser`, au lieu de la première tranche atteignable de `v.piecesDevant`, prendre celle qui ouvre la plus grosse suite : somme des `n` des tranches à moins de `fileVue` m, atteignables de proche en proche (|Δlat| < Δd × `glisse` × 0,85). Éteinte : rien n'est lu. Compteur : `tic('fileOn')` quand la tranche choisie n'est pas la première. Je n'ai pas mesuré que la règle actuelle perd des pièces.

###### C. La nitro au sol (14 %, dont la nitro n'explique qu'une part)

Où c0025 la coupe, sur les 40 traces (53 min de sol), `sortie-nitro.txt` :

| raison | part du temps de sol |
|---|---|
| nitro demandée | 70 % |
| jauge qu'il attend de voir remonter à 0,45 | 10 % |
| travers, rebond, près du bord | 10 % |
| règle du virage | 6 % |

- Dans la seconde qui suit une pose : nitro 79 % chez les joueurs, 35 % chez c0025 ; la cause première est le cap au-delà de `capMax` (20 % de cette seconde).
- En virage fort : 72 % contre 45 %.
- **Gènes existants, réels** : `capMax` 0,35 [0,1–0,8], `jaugeAllume` 0,45 [0,2–1,2], `jaugeCoupe` 0,25 [0–0,8], `braqueNitro` 0,7 [0,2–1,2]. Aucune greffe possible.
- **Risque** : nitro de travers après la pose, donc ressortir aussitôt.

###### D. Les figures (12 %) : en dernier

- Poses avec une figure de la main : 1,15/min contre 0,40. Poses sans figure payées : 52 % contre 42 %.
- Greffable : `{"figMax":3}` (entier, 2 chez c0025).
- Au banc d'étude, `slalomOn` et `gestes5` montent les figures et font perdre 30 à 39 pièces/min.
- Les figures de route (3,6 pièces/min chez les joueurs, 0 chez c0025) : aucun geste du pilote ne les fait.

##### 3. Ce que E voit

`node ml/bot/ressemblance.js <note> --humains tous`, 18 parties de plus de 60 s :

| mesure | z |
|---|---|
| nitro au décollage | −4,39 |
| raccourcis par minute | −1,22 |
| nitro au sol | −1,21 |
| vols par minute | −1,03 |
| figures lancées | −0,80 |
| vitesse des deux premières minutes | −0,50 |

Avec `zoneMorte` = 1 (`note.js`), raccourcis et nitro au sol ne pèsent que 0,2 chacun ; vitesse et figures ne pèsent rien.

**E ne voit pas** les pièces par km de sol, l'heure du premier portail, la vitesse après 2 minutes, les poses payées. Le palier de F voit les pièces, mais mêlées à la survie (63 % de la variance).

**Oui, il faut une mesure de débit à durée égale** : les pièces ramassées dans les fenêtres 0–60 s et 60–120 s (joueurs : 245 et 392 par minute, 14 et 11 parties). Elle ne se recalcule pas sur le cache du Ryzen, dont les lignes n'ont pas les événements `piece`. Elle ouvre une époque : à poser avec la fusion v4, pas avant.

##### 4. La première expérience au banc v2

Quand le PC est libre : une vague au numéro suivant (le 1 est pris), témoin c0025, `tmax` 900, `carte` null, plan 24/24/192, alpha 0,05. Trois bras à ajouter à `bras.json` (je n'y ai pas touché) :

| bras | gènes | prédiction écrite avant |
|---|---|---|
| `vise-large` | `marge` 5 | +10 à +25 pièces/min ; plus de sorties par le côté |
| `nitro-pose` | `capMax` 0,6, `jaugeAllume` 0,25, `jaugeCoupe` 0,1 | nitro au sol de 0,62 à 0,70 ou plus ; +5 à +15 pièces/min |
| `racc-fermes` | les cinq interrupteurs du § A | raccourcis de 0,9 à 1,5/min ou plus ; **palier en baisse**, par les morts roche et paroi |

Les valeurs réelles sont mon choix, pas une mesure.

- **Critère** : « palier », sens haut, pour les trois (le banc n'a pas de critère de débit).
- **Garde écrite dans la question** : un bras n'est candidat que si, sur toutes ses graines, le débit (pièces ÷ survie, apparié au témoin) monte d'au moins 15/min avec un intervalle hors de 0, si la survie médiane ne perd pas plus de 10 % et si E ne monte pas de plus de 0,05.
- **Sensibilité** : à 192 graines le palier ne voit qu'environ un palier. Le débit apparié voit environ ±15/min à 96 graines (banc d'étude). Un critère « débit » dans `criteres.js`, lu sur `pieces` et `survie_s` déjà dans les lignes, serait le bon ; je n'ai pas vérifié qu'il n'ouvre pas d'époque.

##### 5. Ce qui me ferait abandonner

- Aucun bras ne monte le débit de 15/min à 192 graines : les gènes existants ne portent pas l'écart.
- `racc-fermes` fait mourir (morts roche, paroi, pic ×1,5 ou survie −15 %) : la moitié des mètres sautés par les joueurs reste hors de portée de ces yeux. La ligne « portails plus tôt » ne se comble alors pas, et il faut travailler les rayons du bord à la grotte et à la jade, donc une époque.
- `vise-large` gagne des pièces et perd autant de survie : le levier coûte ce qu'il rapporte en palier.
- D'autres parties de joueurs effacent l'écart par km de sol : il tient à 2 habitués, et son intervalle touche 1,00.

**Le verdict dur.** Environ 30 % de l'écart est une conséquence (paliers), pas un levier. Environ 30 % passe par des raccourcis que les yeux annoncent faux sur trois maps. Le reste (visé, nitro, figures : 45 à 60 % selon la fenêtre) est réglable par des gènes existants, presque tous réels, donc hors des greffes. Aucun de ces effets n'est démontré.

## 4. relire et ecrire

*Rôle : relecteur et rédacteur : refait les comptes, attaque les conclusions et écrit l'étude. Phase : Relire. Modèle : claude-opus-5-5.*

RELECTEUR ADVERSE + REDACTEUR : fini. Aucune course jouée, aucun test lancé, rien de commité. J'ai écrit seulement dans ml/ecurie/etude/echelle-de-bots/pieces/ :
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\echelle-de-bots\pieces\LISEZ-MOI.md (le texte pour le jury) ;
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\echelle-de-bots\pieces\relecteur\recompte.js, qui produit sortie-recompte.txt. Une seule fonction pour les deux lots : contrôles, filtres, palier refait avec la reprise, palier égal, zone égale, bootstrap 2 000 tirages. Environ 2 min de calcul ;
- relecteur\genes.js, qui produit sortie-genes.txt : BORNES, lireGreffes, puis reparer et valider sur les bras proposés ;
- relecteur\survol.js : affichage seulement.

Lots comparés : joueurs ml/bot/etalon (14 parties, 40,8 min) ; c0025 ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json (20 parties, 47,3 min, régime allégé, LA HONTE).

CE QUI TIENT
- **Mêmes définitions.** Les trois scripts des autres agents appliquent chacun la même fonction aux deux lots, et mon script aussi : l'écart n'est pas un artefact de définition. Leurs chiffres et les miens se recoupent à 1 pièce/min près.
- **Somme des sources.** Elle fait le total au pièce près dans 34 parties sur 34. La somme des gains égale fin.pieces partout, sauf dans les parties à seconde chance, où la différence est exactement ce qui a été repris.
- **Pièces de figure mêlées.** Les images de figure qui contiennent une pièce de route sont rares : 1 chez les joueurs, 2 chez c0025.
- **Mêmes proportions.** Environ 80 % route, 10 % en l'air et 10 % figures dans les deux lots ; les bonus ne font pas le palier.
- **L'écart à durée égale** : ×1,58 [1,33 ; 1,84] avec chaque partie coupée à 180 s.
- **L'écart à palier égal** : ×1,36 [1,25 ; 1,57], ce qui confirme le « ×1,4 au même palier » du compteur du bot.
- **Minute 1** : ×1,30 [1,00 ; 1,61], écart non démontré.
- **Le tableau du concepteur**, retrouvé à 1 pièce près :
  - densité par km de sol ×1,37 [1,20 ; 1,60] ;
  - à zone égale ×1,13 [1,01 ; 1,28] ;
  - vitesse de sol à palier égal ×1,10 [1,06 ; 1,14] ;
  - figures 12 % de l'écart [7 ; 21].
- **Les gènes des leviers** existent avec exactement les bornes citées. fileOn et fileVue n'existent pas, ce que le concepteur disait.
- **Les greffes acceptées par lireGreffes** : {"raccCartes_grotte":1,"raccJumeau_grotte":1}, {"raccCartes_canyon":1,"raccJumeau_canyon":1}, {"raccCartes_jade":1} et {"figMax":3}. Les réels (marge, capMax…) sont refusés.
- **Les trois bras du banc** (vise-large, nitro-pose, racc-fermes) passent reparer et valider.
- **Aucun critère de débit au banc** : les types sont palier, F, E, mesure, causes, survie et vols, et aucune des 15 mesures de E n'est un débit.

CE QUI TOMBE
1. **« C0025 ramasse comme un joueur par km » et « 77 % par les km »** (compteur des joueurs). Ces chiffres comptent aussi les km avancés en vol. Par km de sol, la densité est ×1,37, et c'est démontré.
2. **Les secondes chances ne sont pas qu'une affaire de joueurs.** Le lot c0025 en a 2 aussi (251 et 236 pièces reprises). Sans aucune seconde chance, l'écart grandit : ×1,85.
3. **Le palier refait par la somme des gains** (compteurs) surestime d'environ un cran après une reprise. Je l'ai refait comme le jeu le tient.
4. **« Sur la même route il prend 93 à 95 % »** (compteur du bot) est trop optimiste : à zone égale, par km de sol, c'est environ 89 % [78 ; 99].
5. **« Les raccourcis portent environ 30 % »** (concepteur). Cela correspond à toute la part « mélange des zones ».
   - En zone 0, les joueurs traversent ×1,24 plus vite ; les raccourcis expliquent ×1,12 de ce gain (16 % de la longueur sautée contre 6 %), soit environ la moitié.
   - Les raccourcis portent donc environ 15 % de l'écart. C'est un ordre de grandeur, calculé sur des médianes de 11 et 16 zones.
   - En zone 1, c0025 n'est pas plus lent que les joueurs.
6. **Ce que règle vise-large (marge 5).** `marge` fixe `max` (modele.js l.223), qui sert aussi au plancher de la ligne dans les virages (l.234). Baisser marge rapproche du bord la ligne des virages, pas seulement les pièces visées.
7. **fileOn ne corrige pas le côté moyen.** Une tranche de 25 m ne garde qu'un côté moyen (yeux.js) : deux files donnent une cible au milieu. fileOn, telle qu'écrite, ne touche pas à ce défaut. Que ce défaut coûte des pièces n'est pas mesuré.

LE TABLEAU DE L'ÉCART FINAL (pièces/min ; la somme est exacte par construction)

| cause | J / B | toutes minutes | coupé à 180 s |
|---|---|---|---|
| densité de sol à zone égale (le visé, peut-être) | ×1,13 [1,01 ; 1,28] | +35 (18 %) | +41 (31 %) |
| densité de sol, mélange des zones (portails plus tôt ; environ la moitié par les raccourcis) | ×1,21 | +56 (30 %) | +39 (29 %) |
| vitesse au sol à palier égal | ×1,10 [1,06 ; 1,14] | +28 (15 %) | +18 (14 %) |
| vitesse au sol, mélange des paliers (conséquence) | ×1,22 | +56 (30 %) | +14 (11 %) |
| part du temps au sol | 71 % / 78 % | −26 (−14 %) | −4 (−3 %) |
| route prise en l'air | 31 / 12 | +19 (10 %) | +9 (7 %) |
| figures | 37 / 15 | +22 (12 %) | +17 (13 %) |
| **total** | 437 / 248 (à 180 s : 363 / 229) | **188** | **134** |

CE QUI NE SE DÉMONTRE PAS
- 14 parties de 2 habitués seulement ; après 180 s, il reste 5 parties de joueurs et 4 de c0025.
- La version du jeu : les empreintes des joueurs ne sont pas des commits, et c0025 tourne dans le simulateur. Que les pièces soient posées de la même façon n'est pas vérifié.
- La part offerte : on mesure 32 à 67 pièces ramassées par km de sol, alors que la formule annonce 55 à 240 offertes. On ne sait pas d'où vient la différence.
- Zone et palier ne se séparent pas (à palier égal, la densité est ×1,16 [1,05 ; 1,36]).
- L'aimant et les pouvoirs ne sont pas enregistrés.
- La boucle « plus vite, portails plus tôt, plus de pièces, moteur plus haut » est une lecture, pas une mesure.

CE QUE LA SESSION PRINCIPALE DOIT TRANCHER (les cinq lignes du LISEZ-MOI)
1. Mesure-t-on d'abord un levier « portails plus tôt » (raccourcis sur les maps fermées, au risque connu des morts roche et pic) ou « visé » (à l'intervalle presque nul) ?
2. Ajoute-t-on au banc un critère de débit (pièces ÷ survie, apparié), puisqu'aucun critère actuel ne le voit et que le palier ne voit qu'environ un cran à 192 graines ?
3. Un bras `marge` doit-il être jugé aussi sur les sorties par le côté en virage, puisque ce gène règle la ligne des virages ?
4. Faut-il vérifier que les joueurs et le simulateur ont la même pose de pièces avant de prendre l'écart par km comme une cible ?
5. La note de la sélection doit-elle, un jour, voir un débit à durée égale (fenêtres 0-60 et 60-120 s), avec la fusion v4 qui ouvre de toute façon une époque ?
