# realisme — ce qui distingue encore un bot d'un vrai joueur, et quoi ajouter

> Enquête du 26/11/2026 (une session Claude, sans appel payant). Jeu `cashcar-v1627`. Rien n'a été modifié hors de ce fichier et de
> `ml/ecurie/agents/tmp-enquete/` (mes outils et mes mesures). Aucune course nouvelle n'a été lancée : le pilote est mesuré sur sa note existante.

## En bref

1. **Le pilote actuel est reconnu à coup sûr.** Le juge du dépôt donne 0,974 (0,50 = pile ou face). Avec les mesures que j'ajoute, 0,989 — et il resterait 0,965 **même si** on corrigeait la nitro, les vols et les figures. Les trois défauts vus par Sacha sont vrais, mais ils ne sont pas les seuls.
2. **Ce qui saute aux yeux d'un spectateur, dans l'ordre** : (a) il roule **sous la route** 29 % du temps, par passages de 4 à 60 s (les joueurs au clavier : 3 %, 1,2 s) ; (b) il **tombe** de la route au lieu de **s'envoler** : nitro allumée au décollage 6 % des fois (joueurs 63 %), vols à 0 m de haut (joueurs 38 m) ; (c) **aucune figure** en 45 min (joueurs 2,8 par minute) ; (d) il passe les **portails en roulant** (16 % en vol, joueurs 56 %) ; (e) il **slalome deux fois trop lentement et deux fois trop large** (un aller toutes les 1,0 s sur 17 m, joueurs 0,55 s sur 9 m).
3. **Ce qui ne se voit que dans les chiffres** : nitro 29 % du temps (joueurs 60 %), 0,24 raccourci par minute (joueurs 3,5), 5,2 vols par minute (8,5), vitesse 10 à 25 % plus basse à palier égal, 327 pièces par minute (419).
4. **Ce qui trahit un compte entier** : ses parties se ressemblent trop (paliers 9 à 20, jamais de mort avant 44 s ; les joueurs : 1 à 28, une partie sur trois finie avant 70 s), il prend la seconde chance 7 fois sur 12 (joueurs 2 sur 14), il ne fait jamais de pause, il a toujours la même voiture et les deux figures du débutant.
5. **Des mécaniques du jeu qu'aucun bot ne connaît** : la frénésie (elle ne part qu'en posant une figure : un bot sans figure ne l'a jamais), le turbo de drift, la fronde en sortie de virage, le train de plaques, les trios de figures, la pause.
6. **Ce qui est déjà bon** : les coups de volant (100,5 par minute contre 101,6), la place sur la route, le temps près du bord, les rebonds sur la tranche, les rattrapages, le départ en vitesse.
7. **Le juge est trop aveugle** : il ne regarde ni le dessous, ni la nitro en vol, ni le rythme du slalom, ni la pose, ni rien du compte. Section 3 : seize mesures à lui ajouter.
8. **À faire en premier** : sortir du dessous ; s'envoler nitro allumée et monter ; tapoter la nitro en vol ; une à deux figures dans les vols de plus de 1,5 s ; viser le portail en vol ; puis la nitro au sol et le rythme du slalom.
9. **L'étalon a des trous** : 14 parties, 2 joueurs, aucun débutant, une seule voiture, deux figures, et l'enregistreur ne note ni la jauge de nitro, ni les touches ↑ ↓ au clavier, ni la frénésie, ni les fruits. Section 5 : 28 parties à enregistrer, et 8 lignes à ajouter à l'enregistreur **avant** de les jouer (décision de Sacha).
10. Tous les chiffres viennent de `ml/ecurie/agents/tmp-enquete/*.json`, refaits par les scripts du même dossier.

## D'où viennent les chiffres

| Lot | Parties | Durée | Source |
|---|---|---|---|
| Joueurs au clavier (Sacha) | 10 (8 de plus de 60 s) | 30,1 min | `ml/bot/etalon/*.json` |
| Joueurs au doigt (Léo) | 4 (3 de plus de 60 s) | 10,7 min | `ml/bot/etalon/cashcar-parties-2026-11-24-11-05.json` |
| Le pilote `ml/ecurie/pilote.js` | 12 courses de 600 s au plus | 45,4 min | `ml/ecurie/agents/tmp-voltige/note-pilote-v1.json` |

Mes fichiers, dans `ml/ecurie/agents/tmp-enquete/` : `inventaire.js` → `inventaire.json` (toutes les mesures) ; `details.js` → `details.json` (par minute, par map, dessous, poses, morts) ; `complements.js` → `complements.json` (décollage, vitesse par palier, départ) ; `tolerances.js` → `tolerances.json` (l'étendue entre parties des mesures du plan) ; `juge-etendu.js` → `juge-etendu.json` ; et les sorties des outils du dépôt : `discerner-pilote-v1-clavier.json`, `appuis-pilote-v1.json`, `voltige-*.json`. Pour refaire : `node ml/ecurie/agents/tmp-enquete/inventaire.js [une-autre-note.json]`, puis `details.js`, `complements.js`, `juge-etendu.js`.

**Comment lire les tableaux.** La valeur est celle du lot entier. Entre crochets : la plus petite et la plus grande valeur **d'une partie à l'autre** (parties de plus de 60 s) : c'est la dispersion des joueurs, et c'est d'elle que je tire les tolérances du plan d'action. Le bot joue au clavier : la colonne à viser est « clavier ». « Doigt » montre qu'un autre style existe.

## 1. et 2. L'inventaire des indices, avec leur mesure

Trois observateurs : **(a)** le spectateur qui voit la course ou le fantôme ; **(b)** celui qui lit les chiffres de fin et l'historique d'un compte ; **(c)** le juge qui a les enregistrements. La colonne « Qui » dit lequel s'en aperçoit en premier.

### 1.1 La trajectoire au sol

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Durée d'un aller du slalom (médiane) | **0,55 s** [0,55 – 0,65] | 0,67 s | **1,00 s** [0,93 – 1,05] | a |
| Largeur d'un aller (médiane) | **8,6 m** [5,7 – 10,9] | 11,3 m | **16,6 m** [13,9 – 19,6] | a |
| Changements de sens par seconde de sol | 1,24 [0,95 – 1,35] | 1,12 | 0,91 [0,85 – 0,99] | c |
| Ondulation (vitesse de côté ÷ vitesse) | 0,184 [0,162 – 0,200] | 0,191 | 0,251 [0,183 – 0,364] | c |
| Écart moyen au milieu (part de la demi-route) | 0,28 | 0,33 | 0,30 | — bon |
| Temps près du bord (plus de 80 %) | 4,2 % | 5,2 % | 4,1 % | — bon |
| Temps au centre (moins de 30 %) | 62 % | 51 % | 58 % | — bon |
| Placement dans les virages (+ = côté intérieur) | +0,079 [−0,06 – +0,17] | +0,094 | +0,020 [−0,01 – +0,05] | c, faible |
| Volant au repos (part du sol) | 44,5 % [33,6 – 51,5] | 46,2 % | 38,1 % [32,1 – 42,1] | c, faible |
| Volant à fond (part du sol) | 13,5 % [10,2 – 18,3] | 13,6 % | 17,0 % [13,1 – 19,9] | c, faible |
| Coups de volant par minute de sol | 101,6 | 88,8 (`README` § 3.8) | 100,5 | — bon |

Le pilote ondule **plus** que les joueurs, mais **plus lentement et plus large** : la caisse balance d'un bord à l'autre en une seconde, là où un joueur donne des petits coups nerveux deux fois plus serrés. C'est la mesure qui sépare le mieux les deux, toutes confondues (section 3). Les joueurs ne prennent presque pas la corde (+0,08) : inutile d'y travailler.

### 1.2 La vitesse et la nitro

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Nitro allumée, tout le temps | **60,4 %** [52,7 – 74,7] | 61,7 % | **28,7 %** [21,8 – 39,8] | a, c |
| Nitro allumée au sol | **75,8 %** [70,3 – 91,3] | 67,4 % | **31,6 %** [22,6 – 42,5] | a |
| Tenue de la nitro au sol : courte · médiane · longue | 0,32 · 1,22 · 4,23 s (max 27 s) | 0,11 · 0,55 · 4,28 s | 0,12 · 0,50 · 1,75 s (max 6,4 s) | c |
| Nitro allumée en vol | 29,5 % [26,7 – 42,6] | 34,7 % | 13,7 % | a |
| **Allumages de nitro par minute de vol** | **51,3** [34,4 – 85] | 17,8 | **7,4** [5,6 – 13,4] | a |
| Durée d'un allumage en vol (médiane) | 0,21 s | 0,11 s | 0,91 s | a |
| **Nitro allumée à l'instant du décollage** | **63,3 %** | 62,0 % | **6,4 %** | a |
| Vitesse au sol, paliers 4 à 6 | 481 km/h | 441 | 427 | b |
| Vitesse au sol, paliers 10 à 12 | 670 km/h | 564 | 530 | b |
| Vitesse au sol, paliers 16 à 20 | 942 km/h | 778 | 688 | b |
| Distance par minute | 12 136 m [7 284 – 16 839] | 8 444 m | 7 379 m [6 695 – 7 702] | b |
| Vitesse maximale d'une partie (affichée à la fin) | 239 à 3 624 km/h | 247 à 1 521 | 541 à 1 596 | b |

Deux gestes de joueur que le pilote n'a pas du tout : **sortir de la route réacteur allumé**, et **tapoter la nitro en vol** (un coup toutes les 1,2 s de vol, 0,2 s chacun : chaque allumage donne un coup de réacteur). Le pilote, lui, tient la nitro en vol par tenues d'une seconde, pour planer.

La nitro des joueurs **baisse au fil de la partie** ; celle du pilote est plate :

| Minute de jeu | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Nitro, clavier | 65 % | 68 % | 53 % | 54 % | 62 % | 43 % | 51 % |
| Nitro, pilote | 33 % | 26 % | 27 % | 29 % | 30 % | 28 % | — |
| En l'air, clavier | 21 % | 28 % | 38 % | 32 % | 43 % | 52 % | 60 % |
| En l'air, pilote | **3 %** | 11 % | 15 % | 26 % | 46 % | 45 % | — |
| Pièces par minute, clavier | 208 | 393 | 531 | 548 | 559 | 665 | 648 |
| Pièces par minute, pilote | 204 | 253 | 351 | 474 | 621 | 363 | — |

(Parties qui comptent : clavier 10, 6, 6, 3, 2, 2, 2 ; pilote 12, 11, 11, 8, 3, 3. Au-delà de la minute 4, une ou deux parties de joueur : indicatif.)

**Pas mesurable aujourd'hui** : la jauge vide (l'enregistreur ne note pas la jauge, seulement la flamme) ; la ligne parfaite fruits / plaques (aucun événement « fruit » ni « plaque »). À enregistrer : section 5.

### 1.3 Les vols

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Vols par minute | 8,5 [6,1 – 11,0] | 6,6 | 5,2 [3,1 – 6,9] | b, c |
| Part du temps en l'air | 33,3 % [22,0 – 41,6] | 17,3 % | 16,1 % [2,8 – 23,6] | b, c |
| Premier décollage de la partie (médiane) | 13,8 s | 40 s | 34,2 s | a |
| **Hauteur du vol : médiane · haute** | **38 · 147 m** | 7 · 44 m | **0 · 30 m** | a |
| Vols qui montent de plus de 10 m | 71,5 % | 40,8 % | 19,5 % | a |
| Vols qui montent de plus de 50 m | 40,6 % | 5,6 % | 5,5 % | a |
| Durée : courte · médiane · longue | 0,43 · 2,27 · 3,99 s | 0,37 · 1,33 · 2,88 s | 0,20 · 1,28 · 4,65 s | c |
| Vols de moins de 0,7 s | 14,1 % | 19,7 % | 28,4 % | c |
| Sortie du côté intérieur du virage | 49,2 % | 52,1 % | 44,1 % | c, faible |
| **Raccourcis par minute** | **3,49** [1,53 – 4,96] | 0,93 | **0,24** [0 – 0,92] | a, b |
| Part des poses qui sont un raccourci | 42,9 % | 14,9 % | 5,1 % | a |
| Piste gagnée par raccourci (médiane) | 413 m | 856 m | 228 m | a |
| **Portails passés en vol** | **55,6 %** (36 portails) | 20 % (10) | **16,1 %** (31) | a |
| Volant braqué en vol (part du vol) | 30,6 % | 40,1 % | 61,1 % | a |
| Temps passé sous la route (part du vol) | 17,4 % | 23,0 % | 35,0 % | a |
| **Pose : écart médian au milieu** | **0,38** de la demi-route | 0,56 | **0,80** | a |
| Poses au centre · poses près du bord | 39,6 % · 22,9 % | 29,9 % · 28,4 % | 18,0 % · 49,8 % | a |
| Poses qui paient des pièces | 66,9 % | 71,6 % | 49,3 % | b |
| Morts, en part des vols | 4,3 % | 5,6 % | 8,1 % | b |
| Rebonds sur la tranche par minute | 1,99 | 2,71 | 2,00 | — bon |
| Rattrapages par la lèvre par minute (approché) | 0,86 | 0,84 | 1,12 | — bon |
| Vols « perdus » puis posés par minute (approché) | 1,96 | 1,40 | 1,45 | — bon |
| Sorties en chaîne (redécolle moins de 1,5 s après la pose) | 42,6 % | 40,8 % | 44,1 % | — bon |

Le portrait : un joueur **décolle** (réacteur allumé, il monte à 40 m, il vole 2,3 s, il se pose au milieu, 400 m plus loin). Le pilote **déborde** (il glisse hors de la route sans réacteur, reste à hauteur de dalle ou dessous, braque à fond pour revenir, se pose au ras du bord). Les rebonds, les rattrapages et les sorties en chaîne sont, eux, déjà ceux d'un joueur.

**Les joueurs ne sautent jamais du milieu de la route** : les 15 décollages notés « saut » chez Sacha partent tous à 19 – 26 m du milieu, donc du bord (`complements.json`). Un bot qui ferait des sauts nitro en pleine route se verrait.

**Approché, pas exact** : « lèvre » = vol de moins d'une seconde reposé au bord du même côté ; « perdu puis posé » = plus de 0,6 s à plus de 10 m sous la route, puis une pose. Le jeu a ses propres compteurs (MIRACULÉ, RATTRAPÉ), que l'enregistreur ne note pas.

### 1.4 Les figures

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| **Figures lancées par minute** | **2,79** [0,35 – 7,44] | 0,47 | **0** | a, b |
| Parties sans aucune figure | 0 sur 8 | 2 sur 3 | 11 sur 11 | b |
| Vols avec figure | 17,6 % | 5,6 % | 0 % | a |
| …dans les vols de 1,5 à 3 s · de 3 s et plus | 19,7 % · 27,8 % | 0 % · 14,3 % | 0 % | a |
| Figures par vol à figure (au plus) | 1,87 (5) | 1,25 (2) | — | a |
| Vols à 1 · 2 · 3 · 4 · 5 figures | 20 · 16 · 5 · 3 · 1 | 3 · 1 · 0 · 0 · 0 | — | a |
| La première figure part après (médiane ; 8 sur 10 entre) | 0,56 s (0,15 et 1,39 s) | 0,07 s | — | a |
| Lesquelles | salto 60, tail whip 24 | tail whip 4, salto 1 | — | a |
| Figures lancées en roulant (sans vol) | 0 | 0 | 0 | — bon |
| Vols à figure finis par une mort | 2 sur 45 | 0 sur 4 | — | b |
| Vols à figure posés sans rien toucher (chute probable) | 2 sur 45 | 0 sur 4 | — | b |
| « Figures » payées par minute (le chiffre de fin de partie) | 5,08 [2,84 – 6,34] | 4,85 | 2,09 [0,37 – 2,78] | b |

Les joueurs font leurs figures **en vol, jamais sur la route** (alors que le geste `saut` des doigts passe justement par une figure sur la route). Une figure sur six vols au clavier, presque aucune au doigt : la dose est petite, et elle varie beaucoup d'une partie à l'autre (0,35 à 7,4 par minute). Le chiffre « figures » de fin de partie compte aussi les rebonds et les poses au centre : c'est pourquoi le pilote en a 2,09 sans en lancer une seule.

**Pas mesurable** : les chutes et les redressements (aucun événement), le verdict de la pose (PARFAIT, LOURD, RATÉE), les trios. Les joueurs n'avaient que deux figures : rien sur le choix parmi douze.

### 1.5 Le drift et le dessous de la dalle

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Drift, part du sol | 0,1 % | 15,8 % [12,2 – 17,8] | 0,1 % | a |
| Drifts par minute de sol · durée médiane | 0,4 · 0,10 s | 41,8 · 0,22 s | 0,2 · 0,12 s | a |
| Drifts trop courts pour payer (moins de 0,45 s) | — | 92,7 % | — | c |
| **Sous la dalle, part du sol** | **3,2 %** [0 – 5,2] | 15,0 % [0 – 33,2] | **28,8 %** [5,1 – 47,2] | a |
| Durée d'un passage dessous : médiane · long · le plus long | 1,2 · 4,1 · 4,5 s | 0,9 · 8,9 · 22,2 s | **4,0 · 20,3 · 59,9 s** | a |
| Dessous, par map (pilote) | — | — | espace 45 %, jade 41 %, nuages 36 %, canyon 12 %, grotte 11 %, ville 0,4 % | a |

**Le dessous est la trouvaille de l'enquête.** On n'y arrive qu'en s'y posant (100 % des entrées suivent une pose, pour tout le monde). Sacha en ressort en une seconde ; le pilote y reste — jusqu'à une minute, la caisse à l'envers. Sa « loi vers la route » le ramène à la dalle la plus proche, dessus ou dessous, et une fois dessous rien ne lui dit d'en sortir. (Le « 7 % » écrit dans les consignes est la moyenne de Sacha, 3 %, et de Léo, 15 %.)

Le drift de Léo est un demi-leurre : 42 par minute, mais 93 % trop courts pour donner un turbo. C'est son pouce qui descend en braquant, pas une technique. Un bot « au doigt » doit avoir ces drifts brefs et inutiles ; un bot au clavier n'en a pas.

### 1.6 Le ramassage

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Pièces par minute | 418,8 [240 – 490] | 485,9 | 327,2 [230 – 463] | b |
| Pièces par kilomètre | 34,5 [28,0 – 50,1] | 57,5 | 44,3 [32,6 – 61,1] | c |
| Part des pièces venues des poses | 11,6 % [4,4 – 25,3] | 7,1 % | 6,7 % [0,6 – 11,8] | c |
| Argent par minute | 28 475 | 16 435 | 12 374 | b |

Le pilote ramasse **plus** par kilomètre que Sacha (il suit le fil, Sacha coupe) et **moins** par minute (il roule moins vite). Le retard en pièces par minute est donc un retard de nitro, pas de ramassage : ne pas le « corriger » en ramassant mieux.

**Pas mesurable** : les pouvoirs pris, l'aimant, les fruits, les plaques, les séries de pièces complètes — aucun événement dans l'enregistrement.

### 1.7 Les erreurs, la mort, la seconde chance

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Durées des parties (s) | 12, 52, 63, 65, 153, 157, 170, 194, 396, 545 | 14, 130, 237, 262 | 44, 162, 166, 173, 230, 235, 236, 244, 245, 324, 328, 340 | b |
| Parties finies avant 70 s | **4 sur 10** | 1 sur 4 | **1 sur 12** | b |
| Paliers atteints | 1, 4, 5, 5, 8, 12, 14, 15, 22, 28 | 1, 11, 16, 21 | 5, 9, 10, 10, 11, 12, 13, 13, 13, 14, 18, 20 | b |
| Dispersion du palier (écart-type ÷ moyenne, parties de plus de 60 s) | 0,56 | 0,26 | 0,25 | b |
| Dispersion de la vitesse moyenne d'une partie à l'autre | 0,31 | 0,08 | 0,07 | b |
| Causes de mort | pic 3, paroi 3, air 2, glace 1, vide 1, roche 1, tour 1 | roche 2, vide 1, air 1 | paroi 6, tour 4, roche 4, vide 4, air 1 | b |
| Morts pour 10 min passées au canyon · en ville | 5,9 · 6,2 | — | **16,0 · 16,2** | b |
| Morts en vol | 11 sur 12 | 4 sur 4 | 19 sur 19 | — bon |
| Dernier vol avant la mort (médiane) | 1,7 s | 5,0 s | 1,0 s | c |
| **Parties avec seconde chance** | **2 sur 10** | 0 sur 4 | **7 sur 12** | b |
| Attente entre la mort et la reprise | 7,3 s et 10,6 s | — | 8 à 10 s (`README` § 3.5) | — bon |
| Attente avant de relancer une partie | 3 à 8 s (8 fois sur 12), 20 – 28 s (2), 8 et 26 min (2) | — | sans objet | b |
| Pauses pendant une partie | 0 | 0 | 0 | — |

Un vrai joueur **rate des parties** : une sur trois meurt dans la première minute (pic de la jade, air), et ses paliers vont de 1 à 28. Le pilote est régulier comme une horloge : pour un compte, c'est le signe le plus sûr. Il meurt trois fois plus qu'un joueur au canyon et en ville (par minute passée), et jamais sur un pic.

**Panique avant la mort : rien de mesurable.** Dans les 3 dernières secondes, le volant des joueurs est braqué 42 % du temps (40,5 % d'ordinaire, au sol), la nitro 34 % (ils la lâchent). Pas de coups de volant en rafale. Les hésitations et les sur-corrections ne se lisent pas à dix échantillons par seconde : il faudrait les vraies touches (section 5).

**La fatigue, l'échauffement d'une partie à l'autre** : impossible avec trois séances de 2 à 5 parties. Seul fait : dans une séance, les parties courtes et longues alternent sans ordre (paliers 15, 5, 28, 5, 14 puis 8, 4, 12).

### 1.8 Le départ et les portails

| Indice | Clavier | Doigt | Pilote | Qui |
|---|---|---|---|---|
| Premier coup de volant | **3,84 s** (1,5 à 5,4) | 4,3 s | **0,52 s** (0,3 à 0,6, une fois 5,7) | a |
| La caisse quitte l'axe de 2 m | 2,2 à 5,8 s | 4,4 à 5,5 s | **1,2 à 1,6 s** (10 fois sur 12) | a |
| Première nitro | 0,44 s (0,12 à 0,77 ; deux fois 3,1 s) | 0,77 s | 0,22 s (0,12 à 0,42) | c |
| Nitro des 5 premières secondes | 70,7 % | 63,1 % | 72,9 % | — bon |
| Vitesse à 3 s · à 5 s | 225 · 295 km/h | 224 · 283 | 223 · 277 | — bon |
| Nitro dans les 2 s avant un portail | 55,2 % | 62,9 % | 39,2 % | c |
| En vol dans les 2 s après un portail | 5,8 % | 6,7 % | 10,4 % | — bon |

Au départ, la première pièce arrive à 4,1 s pour tout le monde. Un joueur **attend, tout droit**, que la route commence ; le pilote braque dès la première demi-seconde, toujours au même instant. Le jeu donne 3 s d'élan gratuit au départ (`code/gameplay/boost-depart.js:132`) : il n'y a aucun geste à réussir.

### 1.9 La variété entre joueurs (clavier contre doigt)

Les deux seuls joueurs de l'étalon ne jouent pas pareil — c'est la preuve qu'il faut **plusieurs styles de bot**, pas un seul :

| | Sacha, clavier | Léo, doigt |
|---|---|---|
| Vols par minute · hauteur médiane | 8,5 · 38 m | 6,6 · 7 m |
| Raccourcis par minute | 3,5 | 0,9 |
| Figures par minute | 2,8 (surtout salto) | 0,5 (surtout tail whip) |
| Allumages de nitro par minute de vol | 51 | 18 |
| Drift, part du sol | 0,1 % | 15,8 % |
| Dessous, part du sol | 3,2 % | 15,0 % |
| Pièces par kilomètre | 34,5 | 57,5 |
| Portails passés en vol | 56 % | 20 % |
| Penche d'un côté de la route | non | à droite (+1,6 m, `etude/humains.md`) |

Le pilote ressemble aujourd'hui davantage à Léo qu'à Sacha (peu de vol, vols bas, il suit le fil) — mais il joue au clavier, sans le drift de Léo.

### 1.10 Ce que le jeu garde et montre d'un joueur

Lu dans le code ; rien de tout cela n'existe pour un bot aujourd'hui (le simulateur repart d'une sauvegarde neuve à chaque course).

- **L'écran de fin** (`code/moteur/mobile-tactile.js:821-912`) : l'argent, la cause de la mort, le palier atteint et son record, l'aura de la partie à côté de la moyenne et du record du joueur, la vitesse maximale.
- **Le Top 10** (`code/gameplay/boost-depart.js:313-360`) : un pseudo de 8 lettres et l'argent de la partie. Il est **local** au téléphone.
- **La sauvegarde** (`code/sauvegarde.js:17-44`) : le nombre de parties (`ex.runs`), le meilleur palier (`ex.eng`), les morts par cause, le temps de jeu total et la plus longue partie (`prof`), la série de jours (`jour`), la banque, les voitures et les figures possédées, les trois figures équipées (`figEq3`), le carnet des trios réussis (`combos`), le record de frénésie (`frenRec`), les missions réussies, le pseudo et la plaque.
- **Les figures** : 12 au catalogue (`VERSION PRINCIPALE/figures.js:21-32`), de 0 à 500 000 pièces ; un débutant a le tail whip et le salto ; trois emplacements (avant, arrière, côté).
- **Les missions** (`code/missions/table.js`) disent ce que le jeu pousse à faire : N figures en un saut, rester en l'air puis poser parfait, tenir la frénésie 15 s ou 60 s, 1 800 km/h, 12 min sans mourir — et des secrètes : mourir 200 fois, mourir dans les 3 premières secondes, rejouer 15 fois de suite.
- **Il n'y a ni fantôme, ni adversaire, ni matchmaking dans le jeu aujourd'hui** (rien trouvé dans `code/`). Ce qu'un joueur verra d'un bot — la course en direct, un fantôme, ou seulement un pseudo et un palier — n'est pas décidé. **C'est la première décision à prendre** : elle dit lesquels des indices « a » et « b » comptent vraiment.

Un compte de bot crédible doit donc être **cohérent** : une figure à 180 000 pièces suppose une banque qui a pu la payer ; un record au palier 25 suppose des dizaines de parties et des morts de toutes les causes ; la voiture ne peut pas être LA HONTE (la voiture de départ) après deux cents parties.

### 1.11 Les mécaniques du jeu que les bots ne connaissent pas

Lu dans le code du jeu. « Inconnu » = ni `ml/bot/yeux.js`, ni `ml/bot/doigts.js`, ni `ml/ecurie/pilote.js` n'en parlent (cherché par mot dans les trois).

| Mécanique | Ce que fait le joueur | Ce que ça donne | Se voit ? | Preuve |
|---|---|---|---|---|
| **La frénésie** | remplir le flow à 100 (elle s'arme, « POSE UNE FIGURE ! »), puis poser une figure | argent ×3, nitro deux fois plus longue | **oui** : « FRÉNÉSIE ! », éclair rouge, ralenti de 2,7 s, chrono | `code/gameplay/frenesie.js:26-27, 75-78, 104-118` |
| Le flow et ses fautes | rouler vite, varier les gestes ; pose lourde −6 ; pose ratée : retour à 0 | l'argent de ×1 à ×3 | oui (bande, étiquettes) | `code/gameplay/sensations-flow.js:285-341` |
| Le turbo de drift | tenir un drift 0,45 / 0,9 / 1,4 s et relâcher | nitro, flow, élan | oui (étincelles bleues, or, roses) | `sensations-flow.js:118-132` |
| La fronde, le virage serré | tenir un virage fort 0,9 s sans glisser | vitesse en sortie, nitro | un peu | `code/moteur/boucle-2-conduite.js:100-101`, `code/gameplay/aura-chaine.js:45-60` |
| Le train de plaques | prendre les plaques à la suite | une poussée de plus en plus forte (« BOOST ×2, ×3 ») | oui | `aura-chaine.js:63-70` |
| Les trios | trois figures dans un vol : un combo nommé d'après leurs axes | de l'aura ; un carnet dans la sauvegarde | oui (le nom s'affiche) | `code/gameplay/figures-physique.js:198-219` |
| La toupie de drift | décoller en plein drift | une figure gratuite | oui | `figures-physique.js:83, 127` |
| Le demi-tour | se poser à plus de 90° : verglas, « MAUVAIS SENS » | à rattraper | oui | `code/gameplay/demi-tour.js:6-48` |
| L'élan (momentum) | tenir sa ligne, gaz ouvert | puissance jusqu'à ×2,8 | non | `boucle-2-conduite.js:35-40` |
| La pause | touche P | — | oui | `code/son/curseurs.js:279` |
| Le glissé de figure, gaucher, vol inversé, inclinaison | réglages du téléphone | — | non | `code/moteur/mobile-tactile.js:27-30, 541-545` |

Le plus important : **la frénésie ne part qu'en posant une figure** (sauf en ville). Un bot sans figure ne l'aura donc jamais ; un joueur, lui, y passe. Elle se voit à l'écran, elle triple l'argent, elle a son record dans la sauvegarde — et **l'enregistreur ne la note pas** : on ne sait pas combien de temps les joueurs y passent.

## 3. Le juge mis à l'épreuve

`node ml/bot/discerner.js ml/ecurie/agents/tmp-voltige/note-pilote-v1.json --nom pilote-v1 --sortie ml/ecurie/agents/tmp-enquete/discerner-pilote-v1-clavier.json` — 10 parties de joueur (147 fenêtres de 10 s) contre 12 courses du pilote (241 fenêtres).

**AUC 0,974 — « DISCERNABLE À COUP SÛR ».** Le témoin (étiquettes mélangées) : 0,53. Contre les 14 parties, doigt compris : 0,970.

| Ce qui trahit, d'après le juge du dépôt | Distance aux joueurs (z) | Joueurs | Pilote |
|---|---|---|---|
| Ondulation ÷ vitesse | **+4,3** | 0,168 | 0,223 |
| Part du temps en l'air | −1,86 | 0,283 | 0,136 |
| Hauteur maximale | −1,80 | 56,7 m | 7,8 m |
| Part du temps nitro (la plus sûre prise seule : 0,895) | −1,51 | 0,631 | 0,288 |
| Durée moyenne d'un vol | −1,32 | 1,65 s | 0,80 s |
| Décollages par 10 s | −1,28 | 1,30 | 0,80 |
| Figures par 10 s | −1,20 | 0,37 | 0 |

**Ce que le juge ne regarde pas.** J'ai recopié sa méthode (mêmes fenêtres, même régression, une partie entière de côté à chaque tour) et ajouté seize mesures de l'inventaire (`juge-etendu.js`) :

| Jeu de mesures | AUC |
|---|---|
| Les 16 du juge actuel (recopiées) | 0,973 |
| Mes 16 nouvelles, seules | **0,989** |
| Les 32 ensemble | 0,988 |
| Les 16 actuelles **sans** l'air, les vols, la nitro, les figures | 0,821 |
| Mes nouvelles **sans** la nitro ni les figures | **0,965** |

La dernière ligne est la leçon : **un pilote qui corrigerait seulement la nitro, les vols et les figures tromperait à moitié le juge actuel (0,82) et pas du tout un juge plus curieux (0,965).** Les nouvelles mesures, de la plus bavarde à la moins bavarde (pouvoir de séparation = l'AUC de la mesure seule, ramenée entre 0,5 et 1) :

| Mesure à ajouter au juge | Sépare | z | Joueurs (σ d'une partie à l'autre) | Pilote |
|---|---|---|---|---|
| Nitro au sol (part du sol) | 0,937 | −1,66 | 0,714 (0,245) | 0,308 |
| **Durée d'un aller du slalom** | **0,926** | **+8,2** | 0,637 s (0,044) | 0,995 s |
| **Volant braqué en vol** | **0,919** | +3,7 | 0,251 (0,096) | 0,602 |
| Allumages de nitro par seconde de vol | 0,893 | −1,85 | 0,875 (0,405) | 0,125 |
| Largeur d'un aller du slalom | 0,754 | +3,9 | 0,332 (0,079) | 0,637 |
| Écart au milieu à la pose | 0,750 | +2,4 | 0,433 (0,116) | 0,710 |
| Part du vol en figure | 0,681 | −1,0 | 0,164 (0,159) | 0 |
| **Sous la dalle (part du sol)** | 0,680 | **+11,5** | 0,013 (0,023) | 0,273 |
| Pièces venues des poses | 0,661 | −0,8 | 5,25 par 10 s | 2,73 |
| Volant au repos | 0,648 | −0,7 | 0,502 | 0,382 |
| Vols de moins de 0,7 s | 0,633 | +3,1 | 0,080 (0,076) | 0,316 |
| Volant à fond | 0,627 | +1,1 | 0,119 | 0,174 |
| Part du vol sous la route | 0,607 | +0,8 | 0,143 | 0,236 |
| Placement dans les virages · point le plus bas du vol · pièces par 100 m | 0,53 à 0,64 | moins de 0,4 | — | ne séparent pas |

(Dans ce tableau la moyenne des joueurs est celle des **parties**, courtes comprises : elle diffère un peu des tableaux de la section 1, qui mettent tout le temps de jeu en commun.)

Le juge actuel compte bien les changements de côté, mais **par seconde de fenêtre, vols compris** : il trouve 0,95 contre 0,80 (z −0,17) et ne voit rien. La durée d'un aller, mesurée au sol seulement, voit tout.

**Ce qu'il faut ajouter à `ml/bot/discerner.js` pour en faire un adversaire sérieux** :

1. Les seize mesures ci-dessus (au moins les huit premières).
2. **Un juge « à l'instant »** : les 2 s autour de chaque décollage, de chaque pose, de chaque portail, et les 6 premières secondes. Un spectateur juge là-dessus, pas sur une moyenne de 10 s (nitro au décollage 63 % contre 6 % ; premier coup de volant 3,8 s contre 0,5 s).
3. **Un juge « du compte »** : sur 20 parties d'un même bot, la dispersion des paliers et des durées, la part des parties de moins de 70 s, la part des secondes chances, les causes de mort par map. Aujourd'hui rien ne regarde plus loin qu'une fenêtre.
4. **La forme au fil de la partie** : nitro, air et vitesse minute par minute (le tableau du § 1.2), et la vitesse à palier égal.
5. **Un témoin humain contre humain qui vaille** : aujourd'hui 10 parties ; le témoin s'écarte lui-même de 0,20 de 0,50. Tant qu'il n'y a pas 30 à 40 parties de 4 ou 5 joueurs, « indiscernable » ne peut pas être prouvé — seulement « discernable ».
6. **Un vrai spectateur** : rien ne remplace Sacha ou Léo devant dix films mêlés (5 de joueurs, 5 de bots, sans étiquette) dans la salle de projection. C'est le seul juge de l'observateur « a ».

## 4. Le plan d'action, du plus trahissant au moins trahissant

« Où » : **pilote** = `decide` de `ml/ecurie/pilote.js` ; **main** = le profil de `ml/bot/doigts.js` ; **yeux** = `ml/bot/yeux.js` ; **départ** = le garage et la sauvegarde de départ du simulateur (`ml/bot/piloter.js`, `ml/reel/jeu-reel.js`) ; **juge** = `ml/bot/mesures.js` et `discerner.js` ; **jeu** = une décision de Sacha. La cible est la valeur des joueurs au clavier ; la tolérance, l'étendue de leurs parties (les crochets de la section 1). Tout se relit par `node ml/ecurie/agents/tmp-enquete/inventaire.js <note>` (et `details.js`, `complements.js`).

### 4.1 Ce qui se voit à l'écran d'un spectateur

| # | Indice | Écart mesuré (joueurs → pilote) | Où ça se corrige | Difficulté | Réglé quand |
|---|---|---|---|---|---|
| 1 | Roule sous la dalle | 3,2 % du sol → 28,8 % ; passages de 1,2 s → 4 s (jusqu'à 60 s) | **pilote** : en vol, préférer une pose dessus (le radar donne `dessous`) ; une fois dessous, ressortir par le bord dans les 2 s | moyenne | dessous ≤ 5 % du sol par partie (0 à 5,2) ; passage médian ≤ 2 s, aucun de plus de 5 s |
| 2 | Tombe au lieu de s'envoler | nitro au décollage 63 % → 6 % ; hauteur médiane 38 m → 0 m ; montent de plus de 10 m : 72 % → 20 % | **pilote** : sortir exprès, nitro tenue, cabrer au départ ; **yeux** : dire si la sortie ouvre sur du vide ou sur une route | forte (c'est le chantier « sorties voulues » de la session principale) | nitro au décollage 44 à 78 % (les parties de Sacha) ; hauteur médiane 20 à 60 m (parties : 6 à 69) ; plus de 10 m : 38 à 85 % |
| 3 | Aucune figure | 2,79 par minute → 0 ; 17,6 % des vols → 0 % | **pilote** : dans un vol de plus de 1,5 s annoncé « pose », une figure 0,2 à 1,4 s après le décollage, une 2e une fois sur deux ; **départ** : le garage | moyenne (chantier en cours) | 1 à 5 par minute selon le bot (parties : 0,35 à 7,4) ; 5 à 39 % des vols d'une partie (18 % en tout) ; 1,5 à 2,2 par vol à figure ; jamais en roulant ; au plus 1 vol à figure sur 10 fini par une mort ou une chute |
| 4 | Portails passés en roulant | 55,6 % en vol → 16,1 % | **pilote** : à moins de 300 m du portail, sortir et le viser (rayon `portail` du radar) | moyenne | sur 20 parties, 40 à 75 % des portails en vol (une partie de Sacha : de 0 à 75 %, médiane 67 % ; 36 portails en tout : tolérance large) |
| 5 | Slalom lent et large | un aller : 0,55 s → 1,00 s ; 8,6 m → 16,6 m | **main** (suivi : retard, seuil des coups) et **pilote** (viser pièce par pièce, pas une ligne qui glisse) | forte (la main est fixée dans la boucle : `--main-libre`) | aller médian 0,55 à 0,65 s ; largeur 6 à 11 m ; ondulation ÷ vitesse 0,16 à 0,20 |
| 6 | Pas de coups de nitro en vol | 51 allumages par minute de vol → 7 ; 0,21 s → 0,91 s | **pilote** (les demander) et **main** (aujourd'hui la nitro n'est hachée qu'au sol) | moyenne | 35 à 85 par minute de vol ; allumage médian 0,15 à 0,3 s ; nitro en vol 25 à 45 % |
| 7 | Vole le volant braqué | 30,6 % du vol → 61,1 % | **pilote** : une fois le cap pris, lâcher (la loi `versRoute` braque à chaque vue) | moyenne | 24 à 36 % du vol (les parties de Sacha) |
| 8 | Se pose au ras du bord | écart médian 0,38 → 0,80 ; près du bord 23 % → 50 % | **pilote** : viser l'axe, pas « la route » ; noter une pose par son écart | moyenne | écart médian 0,26 à 0,72 par partie (0,38 en tout) ; centre 14 à 55 % (40 % en tout) ; bord 0 à 43 % (23 % en tout) |
| 9 | Nitro trop rare au sol | 75,8 % → 31,6 % ; tenue médiane 1,22 s → 0,50 s | **pilote** : la tenir par défaut, la lâcher avant le virage (aujourd'hui l'inverse) | moyenne — au prix de sorties en plus | 70 à 90 % du sol ; tenues 0,3 · 1,2 · 4,2 s ; et la baisse au fil de la partie (65 % la 1re minute, 35 à 50 % après la 5e) |
| 10 | Pas de raccourci | 3,49 par minute → 0,24 ; 43 % des poses → 5 % | **pilote** + **yeux** (`vue.troncons` existe, le pilote ne le lit pas) | forte (chantier en cours) | 1,5 à 5 par minute pour un bot « voltigeur » ; 0,5 à 1,3 pour un bot « prudent » (Léo : 0,93) ; gain médian 300 à 900 m |
| 11 | Départ trop vif, toujours pareil | premier coup de volant 3,8 s → 0,5 s ; quitte l'axe à 1,2 – 1,6 s | **pilote** : tout droit jusqu'à la première pièce (4,1 s), avec un délai tiré | facile | premier coup entre 1,5 et 5,5 s, différent à chaque course ; première nitro 0,1 à 0,8 s (une fois sur cinq : 3 s) |
| 12 | Premier vol tardif, première minute sans vol | premier décollage 13,8 s → 34,2 s ; en l'air la 1re minute 21 % → 3 % | suit des lignes 2 et 10 | — | premier décollage 6 à 50 s ; 9 à 31 % en l'air la 1re minute |
| 13 | Trop de vols ratés d'entrée | vols de moins de 0,7 s : 14 % → 28 % | suit de la ligne 2 (une sortie voulue ne retombe pas tout de suite) | — | 0 à 25 % des vols d'une partie (14 % en tout) |
| 14 | Jamais de frénésie | pas mesurable (pas enregistrée) | **jeu** (l'enregistrer), puis **yeux** (`armée`) et **pilote** (poser une figure quand elle est armée) | moyenne, après la ligne 3 | une fois enregistrée chez les joueurs : même part du temps, à ± leur dispersion |
| 15 | Jamais de drift (bot « au doigt » seulement) | Léo 15,8 % du sol, 42 par minute, 93 % de moins de 0,45 s | **main** modèle `doigt` : de courts drifts en braquant | facile, mais seulement utile si des bots jouent « au doigt » | 12 à 18 % du sol, durée médiane 0,2 s |

### 4.2 Ce qui ne se voit que dans les statistiques

| # | Indice | Écart mesuré | Où ça se corrige | Difficulté | Réglé quand |
|---|---|---|---|---|---|
| 16 | Parties trop régulières | paliers 9 à 20 (dispersion 0,25) contre 1 à 28 (0,56) ; parties de moins de 70 s : 8 % contre 36 % | **main** (erreurs du profil, encore jamais réglées) et **pilote** (prise de risque tirée par course) — étape D | moyenne | sur 20 parties : dispersion du palier 0,4 à 0,6 ; 20 à 40 % de parties de moins de 70 s, dont une de moins de 20 s |
| 17 | Seconde chance trop souvent | 58 % des parties contre 14 % | **main** : `chance.prend` de 1 à environ 0,3, palier 12 gardé | facile | 10 à 30 % des parties ; jamais sous le palier 12 |
| 18 | Vitesse basse à palier égal | paliers 10 – 12 : 670 → 530 km/h ; distance 12 136 → 7 379 m par minute | suit de la ligne 9 (la nitro) | — | à ± 10 % des joueurs par tranche de palier |
| 19 | Pièces par minute | 419 → 327 (mais 34,5 → 44,3 par km) | suit de la ligne 9 ; **ne pas** améliorer le ramassage | — | 400 à 490 par minute à partir de la 3e minute ; 28 à 50 par km |
| 20 | Vols trop rares | 8,5 par minute → 5,2 ; 33 % en l'air → 16 % | suit des lignes 2, 4, 10 | — | 6 à 11 par minute ; 22 à 42 % en l'air ; et la montée au fil de la partie (21 % → 50 %) |
| 21 | Meurt trop au canyon et en ville | 16 morts pour 10 min contre 6 | **pilote** | forte (connu : `PASSATION.md`) | 4 à 8 pour 10 min ; quelques morts « pic » sur la jade (joueurs : 3 sur 12) |
| 22 | Poses qui paient | 67 % → 49 % ; « figures » de fin de partie 5,08 → 2,09 par minute | suit des lignes 3 et 8 | — | 55 à 80 % ; 3 à 6,5 par minute |
| 23 | Nitro avant le portail | 55 % → 39 % | suit de la ligne 9 | — | 45 à 70 % |
| 24 | Le compte : voiture, figures, historique, heures, pseudo | rien n'existe (sauvegarde neuve à chaque course) | **départ** : une sauvegarde par bot, cohérente avec son palier ; puis l'étape F | moyenne ; ce qui est montré est une décision de Sacha | voiture, figures, banque, nombre de parties et morts par cause cohérents entre eux ; séances de 2 à 8 parties relancées en 3 à 8 s |
| 25 | La fiche de l'enregistrement | version « LOCALE », pas d'écran, même date pour toutes, premier échantillon à 0,02 s et 0,2 m (joueurs : 0 et 0) | `ml/bot/piloter.js` | facile, et seulement si les enregistrements sortent un jour | une fiche identique à celle d'un joueur |
| 26 | Le juge est aveugle | section 3 | **juge** | moyenne | les 16 mesures, le juge à l'instant, le juge du compte |

**L'ordre que je recommande** : 1 (le dessous : visible, isolé, sans risque) → 2, 6, 7, 8 ensemble (la façon de voler) → 3 (les figures : elles ouvrent la frénésie) → 4 → 11 et 17 (une demi-heure chacune) → 9 (la nitro au sol : elle remonte d'un coup la vitesse, les pièces et les vols, mais fera sortir plus souvent) → 5 (le slalom : il touche à la main, donc hors de la boucle) → 10 → 16 et 24 (étape D). Et la ligne 26 **en même temps que la ligne 1** : sans elle, la boucle ne verra aucun de ces progrès.

Attention à un piège de la boucle : elle note sur le **palier médian**. Presque toutes ces corrections coûtent du palier au début (voler tue, la nitro fait sortir). Il faudra noter « palier **et** ressemblance », sinon la boucle refusera chaque pas vers un vrai joueur.

### 4.3 Ce qui doit varier d'un bot à l'autre, et d'un palier à l'autre

**D'un bot à l'autre** (mesuré : Sacha et Léo sont deux styles ; et d'une partie à l'autre d'un même joueur) — chaque bot tire ses réglages une fois, dans ces plages :

| Trait | Plage | D'où |
|---|---|---|
| Goût du vol | 6 à 11 vols par minute, hauteur médiane 7 à 60 m | § 1.3 |
| Goût du raccourci | 0,5 à 5 par minute | § 1.3 |
| Goût des figures | 0,3 à 7 par minute ; une figure préférée ; un bot sur trois presque sans | § 1.4 |
| Nitro en vol | 18 à 85 allumages par minute de vol | § 1.2 |
| Tolérance au dessous | 0 à 15 % du sol | § 1.5 |
| Côté préféré de la route | 0 à ± 2 m | § 1.9 |
| Clavier ou doigt | le drift bref (0 ou 12 – 18 %), le slalom (0,55 ou 0,67 s) | § 1.1, 1.5 |
| Seconde chance | de « jamais » à « une fois sur trois » | § 1.7 |
| Départ | premier coup de volant de 1,5 à 5,5 s | § 1.8 |

Et **dans** un bot, d'une partie à l'autre : la dispersion mesurée chez Sacha (figures 0,35 à 7,4 par minute, vols 6,1 à 11,0, nitro 53 à 75 %). Un bot dont les douze parties donnent le même chiffre est un bot.

**D'un palier à l'autre.** Mesuré : dans une partie, le style change avec la vitesse — en l'air 21 % la 1re minute, 60 % à la 7e ; nitro 65 % puis 35 à 50 % ; vitesse de 390 à 1 200 km/h. Un bot du palier 5 ne joue donc que le début de cette courbe (peu de vol, beaucoup de nitro, 400 – 500 km/h), un bot du palier 25 la joue en entier. Ce qui doit suivre le palier du compte : la voiture, les figures possédées (de 0 à 500 000 pièces l'une), le nombre de parties, le temps de jeu.

**Non mesuré, à ne pas inventer** : ce qui distingue un joueur **faible** d'un joueur fort. Les parties courtes de l'étalon (paliers 1 à 5) sont des ratés de bons joueurs, pas des parties de débutant.

**Pour des débutants** — l'étalon n'en a aucun — il faut des parties de vrais débutants (section 5). En attendant, la seule hypothèse défendable est « le début de la courbe d'un bon joueur, avec plus d'erreurs » : moins de vol voulu, pas de raccourci, figures rares ou ratées, poses lourdes, morts bêtes dans la première minute, nitro tenue sans la doser, aucune seconde chance (elle demande d'avoir compris la plaque). Les lignes 1, 7, 8 et 11 du plan valent pour eux aussi ; je ne garantis rien d'autre.

## 5. Ce que Sacha devrait enregistrer

### D'abord, huit lignes à ajouter à l'enregistreur (décision de Sacha : cela change le jeu)

Sans elles, les nouvelles parties auront **les mêmes trous** que les quatorze premières. Tout se passe dans `code/moteur/enregistreur-jeu.js` ; l'enregistreur lit, il ne pose rien. Les anciennes parties restent lisibles.

| À ajouter | Pourquoi |
|---|---|
| Les touches ↑ ↓ au clavier (une colonne) | cabrer, piquer, freiner : invisibles chez Sacha aujourd'hui (les colonnes du pouce valent 0 au clavier) |
| La jauge de nitro et la réserve (une colonne) | la jauge vide, la gestion de la nitro, la ligne parfaite |
| Un événement à chaque fruit, plaque, pouvoir pris | la ligne parfaite, l'aimant, le train de plaques |
| Le verdict de chaque pose (parfait, lourd, ratée, raccourci et son gain, rattrapé, miraculé) | les raccourcis exacts (aujourd'hui approchés), la qualité de pose |
| La chute et le redressement d'une figure | les figures ratées |
| La frénésie (début, fin) et le niveau de flow | on ne sait pas combien de temps les joueurs y passent |
| Le turbo de drift relâché (et son palier) | le drift voulu contre le drift du pouce |
| La graine de la piste, et les figures équipées | rejouer la même route avec un bot ; le choix des figures |

Et si on veut mesurer les réflexes un jour (hésitations, sur-corrections, temps de réaction) : les **vraies touches à l'image près**, comme le journal des bots. Dix échantillons par seconde ne les montrent pas.

### Ensuite, 28 parties

Jouer **normalement**, sauf mention. Noter pour chaque fichier **qui** a joué et **sur quoi** (rien dans l'export ne le dit : `ml/bot/etalon/LISEZ-MOI.md`).

| # | Combien | Qui, comment | Pourquoi |
|---|---|---|---|
| 1 | 6 | Sacha, clavier, comme d'habitude | doubler l'étalon au clavier ; avoir enfin un témoin « joueur contre joueur » |
| 2 | 4 | Sacha, clavier, **voltige** : voler, enchaîner les figures, tous les raccourcis | le haut de la plage : temps en l'air, figures par vol, trios |
| 3 | 4 | Sacha, clavier, **prudent** : rester sur la route, pas de raccourci cherché | le bas de la plage : ce que fait un joueur qui ne veut pas voler (combien de sorties malgré lui ?) |
| 4 | 4 | Sacha, clavier, **trois autres figures équipées** (une par emplacement, dont une chère) | aujourd'hui : salto et tail whip seulement ; quelle figure, dans quelle direction, à quel moment |
| 5 | 6 | Léo, au doigt, sur téléphone — dont 2 **dans l'app iPhone** si possible | passer de 4 à 10 parties au doigt ; l'app a deux fois plus de pics sur la jade |
| 6 | 4 | **Un vrai débutant** (quelqu'un qui n'a jamais joué), ses 4 premières parties, sauvegarde neuve | le bas de l'échelle. Mieux qu'un bon joueur qui joue mal exprès : on ne sait pas imiter ce qu'on n'a jamais vu |
| 7 | si possible | un troisième joueur régulier, 4 parties | deux joueurs ne font pas « les joueurs » |

Dans les lots 1 et 2, pousser deux ou trois parties **au-delà de 6 minutes** : le haut de l'échelle (paliers 20 et plus) tient aujourd'hui sur deux parties.

**La limite de l'enregistreur** : il garde les **8 dernières parties, et 1,6 Mo au plus** (de longues parties : 6, parfois moins). **Exporter toutes les 4 ou 5 parties**, et après chaque très longue partie. Mode d'emploi : `ml/bot/README.md` § 5 — allumer une fois par `https://car-cash-git.vercel.app/jouer/?jeurec=1` (dans l'app : RÉGLAGES → 5 touchers sur la ligne de version → BOÎTE NOIRE → PARTIES → ALLUMER) ; exporter par PARTIES → PARTAGER ou COPIER ; déposer dans `ml/bot/etalon/` et ajouter le fichier à `LISEZ-MOI.md` et à `JOUEURS` dans `ml/bot/etalon.js`. Une partie présente dans deux exports n'est comptée qu'une fois.

## Non vérifié

- **Un seul pilote, une seule note** : 12 courses de 600 s de `pilote.js` tel qu'il était le 26/11 à 13 h (empreinte `ce942cc3…`). La session principale le modifie en ce moment ; ces chiffres sont ceux d'**avant** ses changements. Je n'ai lancé aucune course.
- **Les joueurs sont deux**, bons tous les deux : 10 parties de Sacha, 4 de Léo. Les « tolérances » sont l'étendue de 8 parties d'un seul joueur ; elles s'élargiront. Au-delà de la 4e minute, les chiffres par minute tiennent sur 1 à 3 parties.
- **Le juge étendu** est une copie de la méthode de `discerner.js`, écrite pour cette enquête : il n'a pas de témoin à étiquettes mélangées, et ses seize mesures nouvelles ont été choisies **après** avoir vu les écarts — son 0,989 est donc un peu flatté. Le classement des mesures, lui, tient.
- **Approchés** : les raccourcis (les poses dans le filet d'un virage sont comptées, le jeu ne les paie pas), les lèvres, les miraculés, les chutes de figure, le placement dans les virages (courbure lue sur des points espacés de 20 m).
- **Le code du jeu** a été lu par un agent de lecture, puis j'ai contrôlé moi-même : le catalogue des 12 figures, les deux figures du débutant, les trois emplacements, l'annonce de la frénésie armée, les champs `ex` et `prof` de la sauvegarde, la touche P, et l'absence de ces mécaniques dans `yeux.js`, `doigts.js` et `pilote.js`. Le reste des numéros de ligne du § 1.10 et du § 1.11 n'a pas été relu un par un. Le frôlé des plots semble éteint dans le jeu (aucun appel trouvé) : je ne l'ai pas compté.
- **Pas mesuré du tout**, faute d'enregistrement : la jauge vide, la ligne parfaite, les pouvoirs, l'aimant, les fruits, la frénésie et le flow, les chutes et les redressements, le manche au clavier (↑ ↓), le temps de réaction, les hésitations, la fatigue d'une partie à l'autre, l'effet de la voiture (toutes les parties sont en LA HONTE), le régime plein de l'app iPhone.
- **Le manche en vol** : le pilote tient ↑ 3,2 % et ↓ 6,7 % du vol (son journal de touches) ; le pouce de Léo est poussé vers le haut ou le bas 37 % du vol ; pour Sacha, rien n'est enregistré. Je n'en ai pas fait une ligne du plan.
- **Ce qu'un adversaire verra d'un bot** n'existe pas encore dans le jeu : le partage entre « se voit à l'écran » et « ne se voit que dans les chiffres » suppose que la course entière est montrée.
