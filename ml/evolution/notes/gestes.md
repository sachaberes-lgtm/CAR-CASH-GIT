# Note « gestes » (27/11/2026) : cinq gestes des joueurs, éteints à la naissance, que la sélection peut allumer

Pour l'intégrateur : ce qui a changé, les formats nouveaux, le texte à mettre dans le README pour Sacha, ce qui reste à faire.
Rien n'est commité. Le jeu, `ml/bot/`, `ml/reel/`, `ml/labo/` et le témoin `ml/ecurie/pilote-voltige.js` ne sont pas touchés.
Source des gestes : `ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md` (« l.N » = sa ligne N), remarques des vérificateurs comprises.

## Ce qui a changé

| Fichier | Changement |
|---|---|
| `genome.js` | 21 gènes de plus **en fin de `BORNES`** (`GESTES` : 6 drapeaux à 0, 15 réglages) : 107 gènes, 79 réels. Format du génome **v:2** (`VERSION`). Nouveau `migrer(genome)`. `valider` migre **en place** un génome v:1 conforme avant de le contrôler. `copier`, `croiser`, `reparer` écrivent v:2. `shaGenome` garde l'ancien identifiant tant que les 21 gènes sont à leur naissance. `ecrirePilote` écrit les 21 clés dans `REGLAGES`, après `volMieux`. Exporte en plus `migrer`, `VERSION`, `GESTES`, `CLES_V1`. |
| `modele.js` | Les cinq gestes, chacun gardé par son drapeau (`R.lacheOn`, `R.slalomOn`, `R.coupOn`, `R.relacheOn`, `R.suitOn`). `RETOURS_DEMANDES` = les lois « retour » envoyées aux yeux : `R.retours`, plus les deux lois du coup si `coupOn`. Le contrôle des rayons compte sur `RETOURS_DEMANDES.length`. Le choix du départ saute `retour<i>` pour `i >= R.retours.length` (no-op sans le coup). |
| `tests/genome.test.js` | Les comptes (107, 79, 26 drapeaux), le dénominateur de `distance`, la ligne `REGLAGES` attendue du témoin. |
| `tests/identite.test.js` | Option `--travailleurs N` (4 par défaut, comme avant). Rien d'autre. |
| `tests/gestes.test.js` | Nouveau. Sans course : 7 contrôles, environ 1 s. Avec `--courses` : 21 courses de 120 s, 2 à la fois, environ 13 min sur ce PC chargé (`--pilotes temoin,coup,…` pour n'en jouer qu'une partie, `--json f` pour garder les résultats). |
| `config.json` | **Pas touché** : la table des gènes vit dans genome.js. |

**Nouvelle époque des courses.** `modele.js` fait partie de l'époque (`commun.FICHIERS_EPOQUE`) : au prochain lancement, la population change d'époque. C'est voulu. Les notes repartent de zéro, les courses sont rejouées, **les pilotes restent**. Le contrôle d'identité est refait (genome.js a aussi changé, donc l'empreinte `identite` aussi).

## Le format v:2 et la migration

```json
{ "v": 2,
  "A": { "marge": 10, "…": "… les 86 gènes de v:1, dans le même ordre …", "bRien": 1,
         "lacheOn": 0, "lacheAvant": 0.35,
         "slalomOn": 0, "slalomCap": 0.35, "slalomDemi": 0.45, "slalomH": 3,
         "coupOn": 0, "coupDepuis": 0.6, "coupEcart": 0.7, "coupDuree": 0.15, "coupPoseMin": 0.8, "coupAxe": 0.35, "coupAir": 0.8,
         "coupJauge": 0.35, "coupPerte": 10, "coupDecor": 0,
         "relacheOn": 0, "relacheT": 0.25,
         "suitOn": 0, "suitDerive": 0.3, "suitMarge": 0.25 },
  "WV": ["… 222 …"], "WS": ["… 90 …"] }
```

- `migrer(g)` : si `g.v===1` et que `A` porte exactement les 86 clés de v:1 dans leur ordre, il ajoute les 21 gènes à leur naissance (drapeaux à 0) et met `v:2`, **en place**. Les 86 valeurs et les têtes ne bougent pas. Un autre génome est rendu tel quel, et `valider` dit son défaut (un v:1 abîmé n'est pas « réparé » en silence).
- `valider` appelle `migrer` en premier. C'est là que tout se joue : `evoluer.charger` valide chaque vivant de population.json juste après l'avoir lu. Tous les vivants sont donc v:2 en mémoire, et population.json est réécrit en v:2 au prochain `ecrirePop`. **Je n'ai pas touché evoluer.js** (pas mon fichier) : je conseille à l'intégrateur d'y appeler `Gn.migrer(v.genome)` en clair avant `valider`, puis de rendre `valider` pur.
- **L'identifiant ne change pas.** `shaGenome` d'un génome dont les 21 gènes sont tous à leur naissance = le sha1 de `{v:1, A:(les 86 premiers), WV, WS}`, c'est-à-dire l'ancien. Dès qu'un geste ou un réglage de geste s'écarte de sa naissance : le sha1 du génome v:2 entier. Les deux formes ne se confondent pas, parce que `v` diffère. Conséquences : le témoin garde son id (`19e3767cc346` ici). Aucune alerte « pilote-voltige.js ne donne plus le génome du témoin ». `dejaVus`, `champion.id`, `temoin` et les journaux restent justes.
- Test (`gestes.test.js`, g2) : un mutant de `tests/etat-exemple/population.json` (`c1b0f3a8ca1a`, ses 12 gènes complétés aux 86 de v:1, puisque l'exemple n'en porte que 12 et des têtes vides) se lit. Ses valeurs sont gardées, les gestes sont à leur naissance, son id est égal à celui que donne le genome.js d'avant. En plus, 200 mutants écrits par **le genome.js d'avant lui-même** (relu par `git show HEAD:ml/evolution/genome.js`, copié dans `essais/gestes/`) : tous valides, mêmes identifiants, et chacun redonne un enfant valide. Quand HEAD portera les gestes, ce second test se saute tout seul (il le dit).

## La mutation allume-t-elle les drapeaux ?

Oui : les drapeaux des gestes passent par la règle commune (`pDrapeau` = **0,03** par drapeau et par enfant, un `rng.suivant()` chacun, dans l'ordre de BORNES). Mesuré sur 20 000 mutations du témoin : 2,9 à 3,2 % des enfants allument un geste donné. Avec 6 naissances par génération, environ **17 % des générations** ont au moins un enfant qui essaie un geste donné, donc chaque geste est essayé à peu près toutes les 6 générations, dès la phase A. **Je ne propose pas de monter ce taux.** 3 % suffit pour que les gestes soient essayés souvent. Le monter pour ces cinq-là demanderait une probabilité par gène, et chaque enfant porte déjà environ 0,8 bascule de drapeau sur les 26. Si l'on veut le faire un jour sans casser la reprise : un champ `p` dans la borne, lu à la place de `pDrapeau`, en gardant **un seul** `rng.suivant()` par drapeau, dans le même ordre (le nombre de tirages ne change pas).

Le croisement mélange aussi les drapeaux, gène par gène.

À savoir :
- les 15 réglages entrent dans l'urne des mutations des réels (64 → 79). Environ 19 % des mutations de réels tombent donc sur un réglage de geste éteint, qui ne change pas la conduite. Un enfant dont **seules** de telles mutations ont eu lieu conduit comme son parent (de l'ordre de 4 % des enfants), mais il est rejoué quand même : son texte diffère, au moins par l'id dans l'en-tête du bloc. C'est un petit coût de calcul. En échange, le réglage dérive librement tant que le geste est éteint ;
- `distance` divise maintenant par 107 et non plus par 86. La diversité affichée baisse de 20 % pour une même population, à comparer à `alarmeDistance` 0,05.

## Les cinq gestes

Règle commune : drapeau à 0, le code du geste ne s'exécute pas, ses réglages ne sont pas lus, et la mémoire du pilote ne reçoit aucun champ de plus.
Testé deux fois : (g4), drapeaux éteints et réglages poussés à leurs bornes, mêmes décisions sur les vues de l'inventaire ; (c1), même course au bit près, voir les essais.

### 1. Les mains lâchées avant le contact (enquête 2, verdict « à essayer »)
**Pour Sacha :** juste avant de retomber sur la route, le bot lâche le volant, comme les joueurs, au lieu de braquer jusqu'au contact (ce qui le faisait glisser en se posant).
- `lacheOn` (drapeau, 0) ; `lacheAvant` [0,15 ; 0,5], naissance **0,35** s.
- Bornes : 0,35, l.115 ; la main obéit 0,11 à 0,38 s plus tard (l.93), d'où le minimum ; les joueurs ont |volant| 0,00 dans les 0,5 s avant la pose (l.104), d'où le maximum.
- Code : à chaque vue à radar, l'instant du contact = `v.t + t` du rayon de la façon tenue, s'il annonce une pose **sur la dalle** (pas une lèvre, pas dessous : précision du vérificateur, l.119). Le volant est mis à 0 si ce contact est à `lacheAvant` s ou moins, et seulement pour `versRoute` / `versRoutePlane` (pas les plongeons `viser`, l.115).

### 2. Le slalom demandé par le pilote (enquête 3, « à essayer »)
**Pour Sacha :** sur la route, le bot fait de petits zigzags rapides, un côté puis l'autre, comme les joueurs, au lieu de grands balancements lents.
- `slalomOn` (0) ; `slalomCap` [0,2 ; 0,5], naissance **0,35** rad ; `slalomDemi` [0,38 ; 0,65], naissance **0,45** s (0,42 avant la relecture) ; `slalomH` [0,9 ; 3,5], naissance **3** s.
- Bornes : 0,35 et 0,42 proposés, l.235 ; essais à 0,3 et 0,4 rad (l.194, l.216) ; « ne pas descendre sous 0,38 » (l.237) ; l'aller des joueurs va de 0,55 à 0,65 s (l.201). L'horizon 3 vient de la proposition 1 (l.221), « toujours avec » le slalom (l.235). Essais de 0,45 à 3 (l.215). 0,9 est l'horizon d'aujourd'hui. Le vérificateur demande 0,45 au moins pour la demi-période (l.239, « garder slalomDemi à 0,45 au moins ») : **la relecture a mis la naissance à 0,45** (les remarques des vérificateurs corrigent les propositions) ; la borne basse reste 0,38, mesurée par l'enquête (l.216 : 0,4 rad et 0,38 s donnent un aller de 0,70).
- Code : le bloc `capZ` de l.229-234, recopié. L'horizon `slalomH` est dans le même bloc, avec la même condition (précision l.225 et l.239) : ni route qui lâche, ni couloir, ni glisse, ni rebond, et virage doux `u<0,5`. Hors de ce bloc : l'horizon 0,9 et aucun cap alterné.

### 3. Le coup de nitro vu, version serrée (enquête 4, « à essayer »)
**Pour Sacha :** en l'air, le bot donne de petits coups de nitro brefs, comme les joueurs, mais seulement quand ses yeux lui montrent que le coup le pose encore bien sur la route.
- `coupOn` (0) ; `coupDepuis` [0,35 ; 1,2] **0,6** s ; `coupEcart` [0,5 ; 1,5] **0,7** s ; `coupDuree` [0,1 ; 0,3] **0,15** s ; `coupPoseMin` [0,5 ; 1,5] **0,8** s ; `coupAxe` [0,2 ; 0,5] **0,35** rad ; `coupAir` [0,4 ; 1,5] **0,8** s ; `coupJauge` [0,2 ; 0,6] **0,35** ; `coupPerte` [0 ; 60] **10** m ; `coupDecor` (drapeau, **0**). Au plus 3 coups par vol (figé, l.317).
- Bornes : toutes les naissances sont celles de l.317 (`coupDepuis` .6 « au lieu de .35 », `coupDecor:0`). Le jeu ne donne rien à un coup à moins de 0,5 s du précédent (l.305). Les joueurs : un coup de 0,21 s (la moitié tiennent un seul échantillon de 0,108 s), un toutes les 0,80 s (l.301), le premier à 0,80 s de vol (l.308), le dernier 0,42 s avant la pose (l.303). 0,35 rad = le seuil d'une pose de travers (l.12). « Un coup coûte 0,12 » (faire-coup.js). **`coupPerte` n'est pas mesuré** : l.321 demande « retour1.gain >= retour0.gain − petit seuil », et 10 m est mon choix.
- Code : le bloc de `etude-nitro-vol/faire-coup.js`, recopié, avec la précision l.321 (le gain). Les deux lois (`LOI_PILOTE` sans coup, puis avec `coup:.2`) sont demandées aux yeux **après** la loi « retour » du pilote si `retourOn` : leurs rayons sont `retour<b>` et `retour<b+1>`, avec `b = R.retours.length`, et ne deviennent jamais des façons. Rien ne change dans les yeux : yeux.js accepte 4 lois et le paramètre `coup`.

### 4. Le relâché après le décollage (enquête 4, « à essayer »)
**Pour Sacha :** quand le bot décolle nitro allumée, il la garde un quart de seconde avant de la lâcher, comme les joueurs. Ça lui permet de redonner un vrai coup juste après.
- `relacheOn` (0) ; `relacheT` [0,12 ; 0,45], naissance **0,25** s.
- Bornes : 0,25, l.334 ; les joueurs relâchent à 0,17 / 0,29 / 0,43 s (l.308), et le vérificateur trouve 0,23 (0,12 / 0,42) (l.359).
- Code : `decide` note la dernière vue au sol qui demandait la nitro (`m.tNitroSol`, d'après la précision l.338 : une mémoire posée au sol). Au décollage, `m.nitroDecol` = cette vue a moins de 0,35 s, puisque la main met 0,2 s à obéir (voir les essais). En vol, tant que `vol.t < relacheT`, la nitro reste demandée si la façon ne la demande pas déjà (`plane`, `viserPlane` : rien ne change). La fenêtre de 0,35 s est figée, pas un gène.

### 5. Au sol après la pose, la ligne suit la caisse (enquête 1, proposition 4)
**Pour Sacha :** quand le bot retombe en glissant, il laisse la voiture finir sa glisse au lieu de la ramener de force au point où elle a touché. Il contre-braque donc moins et moins longtemps, comme les joueurs.
- `suitOn` (0) ; `suitDerive` [0,1 ; 0,6], naissance **0,3** s ; `suitMarge` [0 ; 0,5], naissance **0,25** s.
- Bornes : l.52 donne `R.derive` (0,3 dans pilote-voltige) et la fenêtre `R.derive+.25 (0,55 s)`. Les joueurs contre-braquent de +0,1 à +0,7 s (l.9). Le bot contre-braque encore à +1 s (l.15). Un gène à part plutôt que `derive` : `derive` sert aussi à `vaut()`, et un réglage de geste éteint ne doit rien changer.
- Code : comme l.52. À la première vue au sol après un vol, `m.tPose`. Pendant `suitDerive + suitMarge` s, la ligne est mise chaque vue à `lat + vitesse·sin(cap)·max(0, suitDerive − depuis)`, avant son glissement vers la cible. En vol, `ensuite:{ligne:L}` : L = la lat de la pose annoncée par le rayon tenu + vitesse·sin(axe)·suitDerive, bornée à ±(demi − marge). Sans pose annoncée (ou dessous) : `{ligne:0}`, comme avant.

## Les essais

Le PC était chargé : une vraie évolution tournait à côté, avec 4 courses à la fois. J'ai joué 2 courses à la fois au plus, et jamais deux essais ensemble. Les sorties brutes sont dans `essais/gestes/` (ignoré par git) : `sortie-courses-b.txt`, `sortie-relache.txt`, `sortie-identite.txt`, et les `.json`.

**L'identité au bit près (modele.js final) :**
- `node ml/evolution/tests/identite.test.js --travailleurs 2` : **OK, 6 passés, 0 raté** (347 s). Le témoin fabriqué rejoue pilote-voltige sur 910000, 910037 et 910074 (45 s, mêmes trois empreintes). Il y a 7 vols en tout. W2 rayon, W2 sol et retourOn changent toujours la course, sans erreur. Contrôle des rayons sur les vrais yeux : 69 vues, 0 erreur.
- `node ml/evolution/identite.js --travailleurs 2 --config config-essai.json` (avant le dernier réglage du geste 4, qui ne touche que du code gardé par `relacheOn`) : IDENTIQUE sur les 3 graines.
- (c1) de `gestes.test.js` : drapeaux à 0 et les 15 réglages poussés à leurs bornes (et `coupDecor` à 1). La course est **identique au témoin** sur 910037 et 910074, 120 s, avec les trois empreintes.

**Chaque geste allumé** (`node ml/evolution/tests/gestes.test.js --courses`, 120 s par course). Le chiffre vient des ordres du pilote, vue par vue, comparé au témoin sur la même graine :

| Geste | Graines | Course | Erreurs / YEUX CHANGES | Le chiffre (geste contre témoin) |
|---|---|---|---|---|
| 1. mains lâchées | 910037, 910074 | différente sur les 2 | 0 / 0 | vues de vol à 0,35 s ou moins de la pose, volant demandé à 0 : **100 %** contre 12,5 % ; **73 %** contre 33 % |
| 2. slalom | 910037, 910074 | différente sur les 2 | 0 / 0 | changements de côté de la ligne demandée par seconde de sol : **1,34** contre 1,12 ; **1,82** contre 0,93. L'aller des mesures : **0,86** s contre 0,93 ; **0,80** s contre 1,00 (joueurs 0,58) |
| 3. coup de nitro | 910000, 910074, 910222, 910259 | différente sur les 4 | 0 / 0 | coups brefs (1 ou 2 vues de nitro) en vol : **2 en tout contre 0** (910000 : 1 sur 2 vols longs ; 910222 : 1 sur 4 ; 0 sur les deux autres) |
| 4. relâché | 910000, 910074, 910222, 910259 | différente sur les 4 | 0 / 0 | temps de vol de la première vue sans nitro, vols décollés nitro tenue : **0,30 / 0,25 / 0,30 / 0,28 s** contre 0 / 0,05 / 0,05 / 0,08 (joueurs 0,29) |
| 5. la ligne suit | 910037, 910074 | différente sur les 2 | 0 / 0 | dans les 0,55 s après une pose, ligne demandée du côté où la caisse glisse : **58 %** contre 28 % ; **85 %** contre 22 % |

**Le temps de décision** (`cerveau_ms_moy`, moyenne par course, PC chargé) : témoin 0,88 ms ; mains lâchées 0,82 ; slalom 0,84 ; coup 0,97 (×1,09 du témoin, deux courses à 1,02 et 1,00 ms) ; relâché 0,87 ; la ligne suit 0,81. Hors course, sur les vues de l'inventaire : 0,52 à 0,63 ms par décision, tous gestes allumés compris. Le pilote se charge dans le bac pour chaque geste, et tous ensemble. Son texte, commentaires retirés, ne contient ni `require`, ni `Math.random`, ni `Date`, ni `eval`, ni `Function`. **À savoir** : le témoin lui-même est déjà à 0,8-0,96 ms sur ce PC chargé (0,4 ms annoncé ailleurs, au repos). Le coup ajoute environ 9 %, parce qu'il lit deux rayons de plus à chaque vue de vol. Les deux lois de plus coûtent surtout aux **yeux** (deux trajectoires de plus à chaque vue de vol), et ce temps-là n'est pas compté dans `cerveau_ms_moy` : le débit des courses avec le coup allumé baissera un peu.

**Deux corrections faites pendant les essais :**
- Le relâché lisait d'abord la nitro de la **dernière** vue au sol. Elle n'y est jamais : le pilote coupe la nitro au bord, et la caisse décolle pourtant nitro allumée, parce que l'ordre met 0,2 s à partir. Le premier essai donnait la même course que le témoin sur les 2 graines. Maintenant, la nitro compte comme tenue au décollage si une vue au sol l'a demandée dans les 0,35 s d'avant (`< .35` et pas `<= .3` : 12,4 − 12,1 vaut 0,3000…07 en virgule flottante, et la graine 910222 ratait le geste pour ça).
- Le coup est **rare**. Sur 910037 (grotte, puis jade) il ne peut pas jouer (`coupDecor` 0). Ailleurs, la règle serrée exige la façon `versRoute` sans réacteur, deux rayons qui se posent propres sur la dalle à 0,8 s et plus, assez d'air, de jauge et de gain. Sur 910074, 9 vues remplissent les conditions vues de dehors, mais le pilote y tenait `versRoutePlane` (réacteur déjà allumé). D'où 4 graines hors décor pour le juger, et un critère « en tout » (2 coups contre 0) plutôt que « sur chaque graine ». L'essai de l'enquête (moins serré) passait de 0,80 à 1,06 coup par vol. La version serrée en donne moins, comme prévu par le vérificateur.

## Ce qui n'est pas testé, ou pas fait

- **Aucun geste n'est jugé.** Deux courses de 120 s par geste montrent qu'il agit et ne plante pas. Elles ne disent rien de sa valeur : c'est le travail de la sélection (et des lots de 24 × 300 s que les vérificateurs demandaient, l.238, l.320).
- Le contrôle d'identité complet en vraie évolution (`evoluer.js`) n'a pas tourné : interdit ici. `identite.js` et `identite.test.js` ont tourné (voir les essais).
- Relancés après la retouche finale, et passés : genome (14/14), gestes (7/7 sans course, et les essais en course ci-dessus), identite (6/6, à 2 courses à la fois), commun, graines, note, tableau, lanceurs, generation, robustesse ; `genome.js --essai-reparer 10000` : OK. **Pas relancés** : `courses.test.js` et `evoluer.test.js` (lents, ils lancent des courses à 4 à la fois). Ma retouche ne touche ni l'ordonnanceur ni le maître, mais une nouvelle époque change les clés.
- Le coup n'a donné que 2 coups brefs en 4 × 120 s. Qu'il fasse ce qu'il dit est montré, mais sur peu de cas.
- `arbre.js` compare les gènes d'un enfant et de son parent par `BORNES`. Un génome **v:1 lu dans `morts.jsonl`** (non migré : seuls les vivants passent par `valider`) n'a pas les 21 clés, donc un enfant v:2 né d'un parent mort v:1 affiche 21 différences « undefined → naissance ». C'est cosmétique. À corriger côté arbre/histoire/tableau en appelant `Gn.migrer` sur les génomes relus des journaux (pas mes fichiers).
- `evoluer.js` `diffGenomes` et `mutesDepuisTemoin` sont justes (les vivants sont migrés au chargement).
- INTERFACES.md à mettre à jour par l'intégrateur : § 2.3 (86 → 107, CONTINUS 79, `migrer`, `VERSION`, `valider` migre en place) ; § 3.2 (`"v": 2`) ; § 4.1 (le tableau des 21 gènes ci-dessus et le total : 79 réels + 26 drapeaux + `dessousDecor` + `figMax` = 107) ; § 5.1 (l'exemple de bloc : les 21 clés après `volMieux`) ; § 5.7 (le contrôle compte `RETOURS_DEMANDES`).

## Texte pour le README (pour Sacha)

À mettre dans « Savoir où ça en est », ou dans une petite section « Les gestes » :

> **Les gestes des joueurs.** Le 27/11, on a donné aux pilotes cinq gestes que les vrais joueurs font et que le bot ne faisait pas :
> lâcher le volant juste avant de retomber, zigzaguer par petits coups rapides, donner de petits coups de nitro en l'air,
> garder la nitro un quart de seconde après le décollage, et laisser la voiture finir sa glisse quand elle retombe.
> À la naissance, ces gestes sont **éteints** : les pilotes conduisent comme avant. De temps en temps, un nouveau-né en allume un, au hasard.
> S'il fait mieux, il reste et transmet son geste ; sinon, il est renvoyé comme les autres. On ne sait pas encore si ces gestes sont bons :
> c'est la sélection qui le dira. Dans le tableau, un champion qui a un geste allumé le montre dans « ce qui a changé » (par exemple `coupOn 0→1`).
>
> Ce changement commence une **nouvelle époque** (un trait pointillé sur les courbes) : les notes repartent de zéro, les pilotes restent.

## Ce qui reste à faire

1. L'intégrateur : `Gn.migrer` en clair dans `evoluer.charger`, puis `valider` pur ; `migrer` sur les génomes relus par arbre.js, histoire.js et tableau.js ; INTERFACES.md (liste ci-dessus).
2. Relancer `courses.test.js` et `evoluer.test.js` (lents) quand les cœurs sont libres.
3. Regarder dans quelques jours, dans le tableau ou dans `generations.jsonl` (`naissances[].mutes`), si des enfants à geste allumé survivent. Si un geste n'est jamais gardé après 50 générations, ce n'est pas un échec de la sélection : c'est une réponse.

## La relecture (27/11/2026, second agent)

Tout a été refait à la main, sans croire le rapport. 2 courses à la fois au plus, un essai à la fois, rien sur l'évolution qui tourne.

**1. L'identité au bit près, drapeaux à 0 — tient.**
- `node ml/evolution/tests/identite.test.js --travailleurs 2` relancé : **OK, 6 passés, 0 raté** (341 s) ; IDENTIQUE sur 910000, 910037, 910074 (les trois empreintes), 7 vols ; W2 rayon, W2 sol et retourOn changent la course sans erreur ; contrôle des rayons sur les vrais yeux : 69 vues, 0 erreur.
- Le texte du pilote fabriqué avant (`git show HEAD:ml/evolution/modele.js` + le genome.js d'avant) et après, comparé ligne à ligne : hors des blocs gardés par un drapeau, seuls changent la ligne `REGLAGES` (21 clés de plus, lues seulement sous leur drapeau), `RETOURS_DEMANDES` (le même tableau que `R.retours` quand le coup est éteint), `(zActif?R.slalomH:.9)*vit` et `zActif?capVoulu+capZ:capVoulu` (zActif faux : les mêmes opérations flottantes, dans le même ordre), et le `continue` du choix du départ (il ne saute que des rayons `retour<i>` que les yeux ne rendent pas sans le coup). Aucun calcul ni champ de mémoire hors garde.
- Courses longues : pilote-voltige contre le témoin fabriqué **et** contre le pilote « inerte » (drapeaux à 0, les 15 réglages et `coupDecor` poussés à leurs bornes), tmax 300 s, sur 6 graines (910111, 930000, 910074, 910222, 910259, 910000) : **IDENTIQUE partout**, les trois empreintes. Attention : aucune de ces courses n'atteint 300 s, le pilote meurt avant (97 à 150 s, 61 vols en tout). C'est donc 755 s de jeu identique, pas 2 × 300 s.

**2. Chaque geste.** Les cinq blocs suivent PROPOSITIONS.md et les corrections des vérificateurs (lâcher seulement pour une pose sur la dalle, pas lèvre ni dessous ; horizon du slalom dans le même bloc que capZ, avec u<0,5 ; coup avec coupDepuis 0,6, coupDecor 0 et le seuil de gain ; relâché pas pour plane/viserPlane ; ligne qui suit comme l.52). Le bloc du coup est la copie fidèle de `etude-nitro-vol/faire-coup.js`. Deux défauts trouvés et corrigés :
- **slalomDemi naissait à 0,42**, alors que le vérificateur écrit « garder slalomDemi à 0,45 au moins » (l.239). Naissance mise à **0,45** (borne basse gardée à 0,38, mesurée l.216). Le témoin garde son identifiant (ses gestes sont à leur naissance). Test : (g1), et la ligne `REGLAGES` attendue de genome.test.js.
- **Le coup et le relâché ensemble** (la combinaison que le vérificateur juge la plus utile, l.337) : le coup partait pendant que le relâché tenait déjà la nitro. Il ne donnait rien en jeu (le jeu ne donne le coup qu'au ré-appui), comptait pour un des 3 coups du vol, et `coupEcart` bloquait le vrai coup qui suivait. Correction dans le bloc gardé par `coupOn` : pas de coup si la nitro est déjà demandée à cette vue, ni à la vue d'avant (`m.nitroAvant`, remis à faux au décollage). Test : (r1), une suite de vues sol puis vol : nitro `true, false, true, true, false` (avant : `true, true, false, false, …`, le coup gâché).
- Rejoué après les corrections (`gestes.test.js --courses --pilotes temoin,slalom,coup`, 120 s) : slalom, course différente sur les 2 graines, 0 erreur, changements de côté 1,27 contre 1,12 et 1,53 contre 0,93 (aller 0,90 contre 0,93, 0,81 contre 1,00) ; coup, 4 graines différentes, 0 erreur, 2 coups brefs contre 0 ; temps de décision coup ×1,055, slalom ×0,98. Les trois autres gestes n'ont pas été rejoués en course (leur code n'a pas changé).
- Un réglage dont le drapeau est éteint ne change rien : voir le pilote « inerte » ci-dessus (6 graines, longues) et (g4).

**3. La migration et la validation.** (g2) refait : l'exemple de tests/etat-exemple et 200 mutants écrits par l'ancien genome.js se lisent, mêmes identifiants. Nouveau (r2) : 200 croisements d'un v:1 et d'un v:2 donnent des v:2 conformes (les gènes des gestes viennent du v:2 ou de leur naissance, 94 / 106 pour coupOn) ; `valider` refuse lacheAvant 0,9, slalomOn 2, coupPerte non arrondi ; `reparer` les ramène.

**4. La mutation.** Nouveau (r3) : 10 000 naissances simulées sans course (population de 20, croisement 3 fois sur 10, phase A, `pDrapeau` 0,03). Part des naissances où le parent avait le geste éteint et l'enfant l'allume : **lacheOn 3,31 %, slalomOn 3,86 %, coupOn 3,25 %, relacheOn 3,36 %, suitOn 3,34 %** (coupDecor 2,89 %). Depuis le témoin seul : 2,9 à 3,3 % par geste, 14,2 % des enfants allument au moins un des cinq. Même graine = mêmes enfants, et une reprise à mi-chemin (état du hasard relu) aussi. Je ne propose pas de monter le taux : avec 6 naissances par génération, chaque geste est essayé environ une génération sur cinq.

**5. Les tests.** genome 14/14, gestes 10/10 sans course (13/13 avec les courses jouées), generation 12/12, tableau 69/69, `genome.js --essai-reparer 10000` OK. evoluer.test.js : voir plus bas (une copie à 2 courses à la fois, puisque l'original en impose 4).

**Ce qui reste (pour l'intégrateur), en plus de la liste ci-dessus :**
- Un enfant dont seules des réglages de gestes éteints ont muté conduit comme son parent mais est rejoué (environ 4 % des enfants). Si l'on veut l'éviter : tirer les réels hors des réglages d'un geste éteint, ou donner à un tel enfant les notes de son parent. Pas fait : ça touche evoluer.js ou la règle de mutation, et la dérive libre des réglages éteints est aussi un choix défendable.
- Le README : dans le texte pour Sacha ci-dessus, rien ne change.

**evoluer.test.js, étapes a, e, t** (une copie à 2 courses à la fois, `essais/relecture-gestes/evoluer-2.test.js`, état `essais/relecture-gestes/etat`, config-essai.json) : **TOUT PASSE** (1 349 s). Au premier lancement, le contrôle d'identité du maître passe (IDENTIQUE sur les 3 graines) et le témoin garde l'identifiant `19e3767cc346`. Trois générations, un renvoi chacune, jamais le témoin ni le champion ; tableau.js et etat.js tournent. Le tableau lève l'alerte « population trop semblable (distance 0.037) » : c'est le dénominateur 107 au lieu de 86, prévu plus haut, sur une population de 4. **À l'intégrateur de décider** : baisser `alarmeDistance` (0,05 × 86/107 ≈ 0,04) ou calculer la distance sur les 86 gènes plus les gènes des gestes allumés. Étapes bd, c, f, g non rejouées.
