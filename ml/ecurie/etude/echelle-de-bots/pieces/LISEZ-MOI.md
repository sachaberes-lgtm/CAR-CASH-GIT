# D'où viennent les pièces : pourquoi c0025 ramasse moitié moins que les joueurs (28/11/2026)

Étude de lecture, sans aucune course ni aucun test. Écrite pour quelqu'un qui ne lit pas le code.
Branche `bots-ecurie`. Rien n'est modifié hors de ce dossier.
Quatre agents : deux compteurs (les joueurs, le bot), un concepteur des leviers, un relecteur adverse qui a refait les comptes avec ses propres scripts.
Quand le relecteur trouve autre chose qu'un compteur ou que le concepteur, **c'est sa version qui est écrite ici, et c'est dit**. Ce texte ne décide rien.

Le fait de départ (`../LISEZ-MOI.md` § 3.2 et § 11.2) : c0025 meurt à peu près aussi tôt que les joueurs, mais ramasse moitié moins de pièces par minute.
Or le palier, ce sont les pièces. D'où vient l'écart ?

## En une minute

1. **Les lots.** Joueurs : 14 parties de 2 habitués, 40,8 min (`ml/bot/etalon`). c0025 : 20 parties, 47,3 min (`ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json`).
   Les deux sont enregistrés par le même enregistreur du jeu, en allégé, avec LA HONTE. Le banc des gènes (96 courses de c0025) ne garde pas les pièces une par une.
2. **L'écart mesuré : 437 contre 248 pièces par minute, ×1,76 [1,46 ; 2,06]** (`relecteur/sortie-recompte.txt` § 2 et § 5).
3. **Ce n'est pas un artefact de comptage.** La même fonction découpe les deux lots. Les sources font le total au pièce près dans les 34 parties.
4. **L'écart tient à durée égale** : ×1,58 [1,33 ; 1,84] quand on coupe chaque partie à 180 s. **Il tient à palier égal** : ×1,36 [1,25 ; 1,57].
   **Il ne repose pas sur les secondes chances** : sans elles, ×1,85.
5. **La recette est presque la même** : environ 80 % route, 10 % en l'air, 10 % figures dans les deux lots. Le manque est dans le volume.
6. **Le manque vient d'abord de la route au sol** (79 % de l'écart). Les figures font 12 %, les pièces prises en l'air 10 %. Les « bonus » (frénésie, flow, combo) ne donnent aucune pièce de palier.
7. **Une phrase des compteurs tombe** : « c0025 ramasse comme un joueur par kilomètre ». Elle compte les km avancés en vol, où rien ne se ramasse au sol.
   **Par km roulé au sol, les joueurs prennent 56 pièces, c0025 41 : ×1,37 [1,20 ; 1,60].**
8. **Ce qui fait les 37 % de plus par km de sol** : environ 60 % viennent de ce que les joueurs arrivent plus tôt aux portails, où la route est plus riche.
   Le reste, ×1,13 [1,01 ; 1,28] à zone égale, peut être le visé. Sa borne basse touche presque 1.
9. **Les leviers proposés existent dans le génome**, avec les bornes dites. Mais **seuls les interrupteurs de raccourcis et `figMax` se greffent**.
   Les réglages du visé et de la nitro sont des réels : ils ne passent que par un bras du banc ou par la mutation.
10. **Deux corrections au concepteur.** Les raccourcis ne portent pas « environ 30 % » de l'écart : plutôt la moitié de la part « portails plus tôt », environ 15 %.
    Et `marge` ne règle pas seulement le visé : elle règle aussi la ligne dans les virages.

## 1. Ce qui fait monter le palier

Lu dans le code par les trois agents et le relecteur.

- **Une pièce ramassée vaut +1** (`code/gameplay/ramassage.js:174`, `addCoins(1)`). Une pièce de 2 € compte 1 pour le palier ; elle ne vaut double qu'en argent.
- **Une pose payée vaut 2 à 18** (`code/gameplay/demi-tour.js:574`, `code/gameplay/figures-route.js:64`).
- **Rien d'autre en course.** Frénésie, flow et combo multiplient l'argent ou grossissent une pose payée. Contrats, billets, raccourcis et fruits ne donnent aucune pièce de palier.
- **La seconde chance retire un palier** (`code/gameplay/seconde-chance.js:188`).
- **La densité de pièces suit les portails franchis** (`runStats.zones`), pas la map : environ 55, 97, 141, 188 puis 240 pièces offertes par km (`../../economie.md` l.66).
  Les portails ne sont pas remis à zéro par la seconde chance.
- **L'aimant passif** élargit la prise à partir de `ENG_CAP.aimant` = 15 (`code/gameplay/pickups-fruits.js:592`, `ramassage.js` l.102). Il ne joue qu'au-dessus du palier 15 :
  il fait partie de « l'effet du palier », pas d'une différence de conduite.

## 2. Le recomptage : les définitions sont-elles les mêmes ?

Source : `relecteur/recompte.js` → `relecteur/sortie-recompte.txt`. Une seule fonction découpe chaque partie, pour les deux lots :
- **figure** : le gain enregistré à l'instant exact d'un `figure_payee` (même image du jeu) ;
- **en l'air** : un gain entre un `decol` et sa `pose` ou sa `mort` ;
- **route au sol** : le reste.

**Les trois scripts des autres agents** appliquent eux aussi une même fonction aux deux lots (`compteur-joueurs/decompose.js`, `compteur-bot/decomposer.js`,
`concepteur-leviers/ecart.js`). L'écart n'est donc pas né d'une définition différente. Leurs chiffres et les miens se recoupent à 1 pièce/min près.

**Les contrôles** (§ 1 de la sortie, partie par partie) :

| contrôle | joueurs (14) | c0025 (20) |
|---|---|---|
| sources = somme des gains | 14 sur 14, au pièce près | 20 sur 20 |
| somme des gains = pièces à la fin | 12 sur 14 ; les 2 autres ont une seconde chance (364 et 255 pièces reprises) | 18 sur 20 ; **les 2 autres aussi** (251 et 236 reprises) |
| pièces après le dernier échantillon | 0 | 0 |
| figures payées sans pièce dans l'image | 6 | 2 |
| images de figure à plus de 18 pièces par figure (une pièce de route mêlée) | 1 | 2 |

- **Les compteurs ne parlent que des secondes chances des joueurs. Le lot de c0025 en a deux aussi.**
- Une pièce reprise par la seconde chance a bien été ramassée : elle compte dans le débit. Elle ne compte pas pour le palier.
- **Les compteurs refaisaient le palier en sommant tous les gains.** Après une reprise, cela surestime le palier d'environ un cran. J'ai refait le palier comme le jeu le tient :
  à la reprise, on repart des pièces du second morceau.

## 3. L'écart, sous plusieurs angles

Source : `relecteur/sortie-recompte.txt` § 2, § 3, § 5. Pièces par minute vécue dans le filtre. Intervalles à 95 % par tirage des parties (2 000 tirages).

| filtre | parties J / B | pièces/min J / B | rapport [IC 95 %] | dont route au sol | dont en l'air | dont figures |
|---|---|---|---|---|---|---|
| tout | 14 / 20 | 437 / 248 | **×1,76** [1,46 ; 2,06] | 79 % | 10 % | 12 % |
| sans aucune partie à seconde chance | 12 / 18 | 422 / 228 | ×1,85 [1,47 ; 2,23] | 78 % | 10 % | 12 % |
| chaque partie coupée à 180 s | 14 / 20 | 363 / 229 | **×1,58** [1,33 ; 1,84] | 81 % | 7 % | 13 % |
| minute 1 (0-60 s) | 14 / 20 | 245 / 188 | ×1,30 [1,00 ; 1,61] | 91 % | 3 % | 6 % |
| 60-180 s | 11 / 18 | | ×1,73 [1,42 ; 2,09] | | | |
| parties de plus de 180 s, coupées à 180 s | 5 / 4 | 372 / 252 | ×1,47 | 86 % | 8 % | 6 % |
| à palier égal (palier exact, poids = minutes de c0025) | | 339 / 248 | **×1,36** [1,25 ; 1,57] | | | |
| à palier égal, coupé à 180 s | | 319 / 229 | ×1,39 [1,26 ; 1,63] | | | |

**Ce qu'on en tire.**
- **Durée égale** : l'écart baisse de ×1,76 à ×1,58, il ne disparaît pas. La queue des 2 parties longues des joueurs (396 et 545 s) n'en fait qu'une petite part :
  sans elles, ×1,70 (§ 4 de la sortie).
- **Palier égal** : les joueurs ont un moteur plus haut, donc une caisse plus rapide. Une fois ce moteur égalisé, il reste ×1,36. **Environ la moitié de l'écart** (en logarithme)
  n'est donc pas « l'effet du palier ». L'autre moitié l'est, mais c'est en partie une conséquence de l'écart lui-même (plus de pièces, donc un palier plus haut).
- **Minute 1** : l'écart est petit (×1,30) et son intervalle touche 1,00. Il se creuse ensuite.
- **Sans une partie** : aucune partie de joueur ne porte l'écart seule (de ×1,68 à ×1,75 quand on en retire une).

## 4. Le tableau de l'écart final

La route au sol se décompose en trois facteurs : la part du temps passé au sol, les km de sol par minute de sol, les pièces par km de sol.
Le partage se fait par logarithme. La somme fait l'écart exactement. Sources : `relecteur/sortie-recompte.txt` § 6 et § 7 ; les deux colonnes de droite viennent aussi de
`concepteur-leviers/sortie-ecart.txt` et `sortie-ecart-avant-180.txt`, que je retrouve.

| cause | joueurs / c0025 | toutes minutes | coupé à 180 s |
|---|---|---|---|
| pièces par km de sol, **à zone égale** (le visé, peut-être) | ×1,13 [1,01 ; 1,28] | +35 (18 %) | +41 (31 %) |
| pièces par km de sol, **mélange des zones** (portails passés plus tôt) | ×1,21 | +56 (30 %) | +39 (29 %) |
| vitesse au sol, **à palier égal** | ×1,10 [1,06 ; 1,14] | +28 (15 %) | +18 (14 %) |
| vitesse au sol, **mélange des paliers** | ×1,22 | +56 (30 %) | +14 (11 %) |
| part du temps au sol (les joueurs volent plus : cela leur coûte) | 71 % / 78 % | −26 (−14 %) | −4 (−3 %) |
| pièces de route prises en l'air | 31 / 12 par min | +19 (10 %) | +9 (7 %) |
| figures (poses payées) | 37 / 15 par min | +22 (12 % [7 ; 21]) | +17 (13 % [5 ; 24]) |
| **total** | 437 / 248 ; à 180 s 363 / 229 | **188** | **134** |

**Lecture pour le jury.**
- Coupé à 180 s, **60 % de l'écart est dans les pièces par km de sol**. La moitié de ces 60 % vient de ce que les joueurs sont plus tôt sur une route plus riche.
- La vitesse au sol à moteur égal ne fait que 14 %. Le moteur plus haut des joueurs (le mélange des paliers) n'en fait que 11 % avant 180 s, et 30 % sur toute la durée :
  c'est surtout la queue des parties longues.
- **Ce qui est démontré** : à zone égale l'intervalle exclut 1 de justesse (1,01) ; à palier égal la vitesse l'exclut nettement (1,06).
- **Le mélange des zones et des paliers est une conséquence**, pas une cause première : on y arrive plus tôt parce qu'on avance plus vite et qu'on ramasse plus.

**D'où vient l'arrivée plus tôt aux portails** (`concepteur-leviers/sortie-ecart.txt` § 9 ; 11 zones finies chez les joueurs, 16 chez c0025) :
- la zone 0 est traversée en 62 s contre 83 s, soit 8,30 contre 6,69 km/min, ×1,24 ;
- les raccourcis y sautent 16 % de la longueur chez les joueurs, 6 % chez c0025. À eux seuls, cela fait ×1,12 ;
- **les raccourcis portent donc environ la moitié de la traversée plus rapide** (ln 1,12 / ln 1,24 ≈ 0,53). La vitesse au sol porte l'autre moitié.
- En zone 1, c0025 n'est pas plus lent (48 s contre 61 s, 10 et 9 zones finies) : l'avance des joueurs se fait en zone 0.

**Ma version diffère du concepteur ici** : il écrit que les raccourcis portent « environ 30 % » de l'écart. C'est toute la part « mélange des zones ».
Les raccourcis n'en portent qu'environ la moitié, **environ 15 % de l'écart**. Et 54 % des mètres gagnés par les joueurs le sont sur les trois maps fermées à c0025 :
une greffe n'atteint donc qu'une partie de ces 15 %. Calcul sur des médianes de 11 et 16 zones : un ordre de grandeur, pas une mesure.

**Ma version diffère des compteurs ici** : ils divisent les pièces de route par tous les km, vol compris. Les joueurs avancent environ 4,6 km par minute en vol, c0025 1,6
(raccourcis et vols). Cela fait « ×1,07 par km, densité pas démontrée » et « 77 % par les km ». Par km de sol, la densité est ×1,37 [1,20 ; 1,60] : démontrée.
Les deux découpages sont exacts en arithmétique ; seul le second sépare ce qui se ramasse de ce qui avance sans rien ramasser.

## 5. Les leviers, contrôlés

Source : `relecteur/genes.js` → `relecteur/sortie-genes.txt` (lecture de `ml/evolution/genome.js` BORNES, génome v4, 129 gènes ; `ml/evolution/greffes.js` `lireGreffes` ;
`genome.js` `reparer` et `valider`).

| levier | gènes | existent, bornes du concepteur | greffe (`lireGreffes`) | bras du banc (`reparer`, `valider`) |
|---|---|---|---|---|
| A. raccourcis sur grotte, canyon, jade | `raccCartes_grotte`, `raccJumeau_grotte`, `raccCartes_canyon`, `raccJumeau_canyon`, `raccCartes_jade` | oui, drapeaux 0-1, à 0 à la naissance (`raccJumeau_jade` est déjà à 1) | **acceptée** (les trois ensembles) | survit |
| B. le visé | `marge` 3-20 (10), `piecesLoin` 60-350 (180), `avance` 0,1-0,8 (0,3), `glisse` 0,04-0,3 (0,12), `braqueDoux` 0-0,5 (0,15), `braqueFort` 0,2-1 (0,5) | oui, bornes exactes | **refusée** : ce sont des réels | `marge` 5 survit |
| B'. la règle `fileOn` / `fileVue` | — | **n'existent pas** (règle nouvelle, une époque) | — | — |
| C. la nitro au sol | `capMax` 0,1-0,8 (0,35), `jaugeAllume` 0,2-1,2 (0,45), `jaugeCoupe` 0-0,8 (0,25), `braqueNitro` 0,2-1,2 (0,7) | oui, bornes exactes | refusée : réels | `capMax` 0,6, `jaugeAllume` 0,25, `jaugeCoupe` 0,1 survivent |
| D. les figures | `figMax` 0-5 (2) | oui, entier | **`{"figMax":3}` acceptée** | — |

**Les règles lisent-elles des champs réels ?**
- `aRamasser` (`ml/evolution/modele.js` l.143-158) lit `v.piecesDevant` : `d`, `lat`, `n`, `latC`, faits par `ml/bot/yeux.js` l.88-94. La règle `fileOn` lirait donc des champs qui existent.
- **Mais une tranche de 25 m ne garde qu'un côté moyen** (`t.l/t.n`). Deux files de part et d'autre donnent une cible au milieu, où il n'y a rien. `fileOn`, telle qu'écrite,
  somme les `n` des tranches sans toucher à cette moyenne : **elle ne corrige pas ce défaut-là**. Que ce défaut coûte des pièces : non mesuré.
- **`marge` ne règle pas que le visé.** Elle fixe `max` (`modele.js` l.223), qui sert aussi au plancher de la ligne dans les virages (l.234 : `max*(-1+1.5*u)`).
  Baisser `marge` rapproche du bord **la ligne des virages**, pas seulement les pièces visées. Le risque « plus de sorties par le côté » du concepteur est donc plus large qu'il ne l'écrit.
- **Le banc n'a pas de critère de débit** : ses critères sont palier, F, E, une des 15 mesures de ressemblance, les causes, la survie, les vols (`ml/evolution/banc/criteres.js` l.17).
  Aucune des 15 mesures n'est un débit de pièces (`ml/bot/ressemblance.js` l.28-33). Le constat du concepteur est juste.
- **Un écart d'identité** : les 20 parties lues sont celles de `pilote-voltige.js`, les bras du banc partent du témoin de `ml/evolution/modele.js`.
  Le compteur du bot les dit identiques sur 2 graines seulement. La ligne de `marge` est la même dans les deux fichiers (`pilote-voltige.js` l.174, `modele.js` l.223) ;
  les autres n'ont pas été comparées.

## 6. Ce qui tient, ce qui tombe

| affirmation | qui | verdict du relecteur |
|---|---|---|
| L'écart n'est pas une affaire de définitions | trois scripts | **tient** : une même fonction pour les deux lots, partout |
| Les sources font le total | compteurs | **tient**, au pièce près (34 parties sur 34) |
| La seconde chance est une affaire de joueurs | compteurs (implicite) | **tombe** : c0025 en a 2 aussi. L'écart grandit sans elles (×1,85) |
| Le palier refait par la somme des gains | compteurs | **à corriger** : il surestime d'environ un cran après une reprise ; refait ici |
| La recette est la même, le manque est dans le volume | deux compteurs | **tient** (≈ 80/10/10 dans les deux lots) |
| Les bonus ne font pas le palier | tous | **tient** (§ 1) |
| « Il ramasse comme un joueur par km » ; « 77 % par les km » | compteur des joueurs | **tombe** : par km de sol, ×1,37 [1,20 ; 1,60] |
| « Sur la même route, il prend 93 à 95 % » | compteur du bot | **trop optimiste** : à zone égale, par km de sol, 1/1,13 ≈ 89 % [78 ; 99] |
| « À palier égal, la route rapporte 1,4 fois plus » | compteur du bot | **tient** : ×1,36 [1,25 ; 1,57] en tout |
| L'écart tient à durée égale | tous | **tient** : ×1,58 [1,33 ; 1,84] à 180 s ; à la minute 1, ×1,30, non démontré |
| Le tableau de l'écart du concepteur | concepteur | **tient** en chiffres ; je le retrouve à 1 pièce près |
| Les raccourcis portent « environ 30 % » | concepteur | **tombe** : environ la moitié de cette part, ≈ 15 % ; un ordre de grandeur |
| Les gènes des leviers existent, bornes dites | concepteur | **tient** ; `fileOn` et `fileVue` n'existent pas (il le dit) |
| Les greffes proposées | concepteur | **tient** : `raccCartes_*`, `raccJumeau_*` et `figMax` passent `lireGreffes` ; les réels n'y passent pas |
| `vise-large` (`marge` 5) touche le visé | concepteur | **incomplet** : il touche aussi la ligne des virages |
| Le banc n'a pas de critère de débit | concepteur | **tient** |

## 7. Ce qu'on ne sait pas

- **Qui sont les joueurs.** 14 parties de 2 habitués. Après 180 s, il reste 5 parties de joueurs et 4 de c0025. Aucun débutant.
- **La version du jeu.** Les joueurs ont joué deux empreintes (`60aa15e`, `ccdca9b`) qui ne sont pas des commits (`../../defauts-confirmes.md` § 20) ; c0025 joue `cashcar-v1627`
  dans le simulateur (`relief-canyon`). Que la pose des pièces soit la même : **non vérifié**. Le dernier commit de `code/gameplay`, `code/maps` ou `code/economie` sur cette
  branche date du 21/11, avant les parties des joueurs (23-24/11) : un indice, pas une preuve.
- **Ce que la route offre.** On mesure 32 à 67 pièces par km de sol ramassées ; la formule annonce 55 à 240 offertes. Que la formule compte les deux faces de la dalle,
  ou autre chose : **on ne sait pas**. Donc la part prise, joueur ou bot, n'est pas connue.
- **Zone ou palier.** La densité monte avec les portails et le palier monte en même temps. À zone égale ×1,13, à palier égal ×1,16 [1,05 ; 1,36] : les deux ne se séparent pas.
- **L'aimant et les pouvoirs.** L'enregistreur ne note pas les pouvoirs ramassés. La pièce attirée et la pièce visée ne se distinguent pas.
- **La cause.** La boucle « plus vite, plus tôt aux portails, plus de pièces, moteur plus haut, plus vite » est une lecture. Aucune expérience ne la teste.
- **Le visé à zone égale** repose sur 53 et 69 km de sol en zone 1, et son intervalle commence à 1,01.
- **Au-dessus du palier 12** : 1,4 minute de c0025. Rien n'en sort.

## 8. Les fichiers

Tous en lecture seule. Refaire : `node <script>` depuis la racine du dépôt (chemins relatifs, jamais `/c/…` sous Git Bash).

| fichier | rôle | qui |
|---|---|---|
| `compteur-joueurs/decompose.js` → `sortie.txt`, `sortie.json` ; `raccourcis.js` → `raccourcis.txt` | les joueurs, partie par partie et minute par minute | compteur des joueurs |
| `compteur-bot/decomposer.js` → `sortie-decomposer.txt` ; `causes.js` → `sortie-causes.txt` | c0025 par source, par palier, par route ; les bras du banc | compteur du bot |
| `concepteur-leviers/ecart.js` → `sortie-ecart.txt` (`--avant 180` → `sortie-ecart-avant-180.txt`) ; `nitro.js` → `sortie-nitro.txt` ; `vise.js` → `sortie-vise.txt` | le tableau de l'écart, la nitro, le visé | concepteur |
| `relecteur/recompte.js` → `sortie-recompte.txt` | le recomptage : contrôles, filtres, palier égal, zone égale, intervalles (environ 2 min de calcul) | relecteur |
| `relecteur/genes.js` → `sortie-genes.txt` | les gènes des leviers, les greffes, les bras | relecteur |
| `relecteur/survol.js` (affiche seulement) | versions, voitures, sommes des gains de chaque partie | relecteur |

## Ce que la session principale doit trancher

1. Mesure-t-on d'abord un levier « portails plus tôt » (raccourcis sur les maps fermées, au risque connu des morts roche et pic) ou « visé » (à l'intervalle presque nul) ?
2. Ajoute-t-on au banc un critère de débit (pièces ÷ survie, apparié), puisqu'aucun critère actuel ne le voit et que le palier ne voit qu'environ un cran à 192 graines ?
3. Un bras `marge` doit-il être jugé aussi sur les sorties par le côté en virage, puisque ce gène règle la ligne des virages ?
4. Faut-il vérifier que les joueurs et le simulateur ont la même pose de pièces avant de prendre l'écart par km comme une cible ?
5. La note de la sélection doit-elle, un jour, voir un débit à durée égale (fenêtres 0-60 et 60-120 s), avec la fusion v4 qui ouvre de toute façon une époque ?

## Ce que l'on en fait

*Décision de la session principale, le 28/11/2026 au soir.*

**1. Il n'y a pas un levier, il y en a cinq petits, et tous vont dans le sens des joueurs** : viser un peu mieux (×1,13 à zone égale), arriver plus tôt
aux portails (raccourcis et vitesse), rouler un peu plus vite au sol à moteur égal (×1,10), poser plus de figures (37 contre 15 pièces par minute), ramasser
plus en l'air. Aucun ne demande une règle nouvelle : les gènes existent. On ne code donc rien dans le pilote ; on mesure les réglages.

**2. Le banc reçoit un critère de débit** (pièces ramassées par minute de survie, apparié graine par graine), parce qu'aucun critère d'aujourd'hui ne voit
cet écart et que le palier ne voit qu'environ un cran à 192 graines. Il est écrit sur une branche à part pendant que la vague 1 tourne, et fusionné après elle.

**3. La vague 2 du banc, après la vague 1**, cinq bras contre c0025, jugés sur le débit, avec la survie et les morts lues en face : la nitro au sol
(`capMax`, `jaugeAllume`, `jaugeCoupe`), le visé (`marge` 5, jugé aussi sur les sorties par le côté, puisque ce gène règle la ligne des virages), les
raccourcis ouverts sur la grotte, le canyon et la jade, `figMax` 3, et `nitroDecor` 1,5 (la question laissée par `../../avant-le-bord/` : aller plus vite
sur décor tue-t-il plus ?). Les critères seront écrits dans la vague avant de jouer.

**4. La sélection du Ryzen essaie dès maintenant ce qui se greffe** : quatre ensembles de plus dans le cycle des greffes (`figMax` 3 ; les raccourcis de la
jade ; ceux de la grotte ; ceux du canyon). Elle les juge sur sa note, 12 graines à la fois : c'est une loterie lente, le banc reste la mesure.

**5. Ce qui n'est pas fait** : la règle `fileOn` (elle ne corrige pas le défaut qu'elle vise, et rien ne dit que ce défaut coûte des pièces) ; vérifier que
le jeu des joueurs et le simulateur posent les pièces de la même façon (les parties des joueurs ne gardent pas la graine : il faudrait l'enregistreur
enrichi, question posée à Sacha) ; mettre un débit dans la note de la sélection (une seule fois, quand le banc aura dit ce qui compte).

**6. Ce que cela veut dire pour l'échelle.** Si ces réglages rendent à c0025 le débit d'un joueur, il aura à survie égale le palier d'un joueur (médiane
vers 11 au lieu de 7) en lui ressemblant davantage. C'est une hypothèse : la boucle « plus vite, portails plus tôt, plus de pièces » n'a été testée par
aucune expérience (§ 7).
