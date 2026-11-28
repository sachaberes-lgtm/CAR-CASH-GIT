# Avant le bord : ce que le pilote pourrait faire au sol, avant de quitter la route (28/11/2026)

Étude de lecture, sans aucune course. Écrite pour quelqu'un qui ne lit pas le code.
Branche `bots-ecurie`. Rien n'est modifié dans `ml/evolution`, `ml/bot`, `ml/reel`, `code/` ni `VERSION PRINCIPALE/` : tout est dans ce dossier.
Neuf agents : trois lecteurs (les traces, le code, les joueurs et la ville), trois concepteurs (vitesse, ligne, libre), trois relecteurs adverses
(les chiffres, le code, le banc). Ce texte range leur travail. Il ne décide rien.

## En une minute

1. **La question.** L'étude d'avant (`../sortie-preparee/LISEZ-MOI.md`) a montré qu'au bord il est trop tard : le bord est annoncé 0,28 s avant le décollage,
   la main met 0,2 s. Sa piste : « le levier est au sol, avant le bord ». On a cherché ce levier dans les 40 courses déjà enregistrées.
2. **Toutes les sorties se font par le côté.** Aucun trou, aucune fin de route sous la caisse dans ces données (§ 2.1).
3. **Environ 17 morts sur 22 sont « évitables » au sens des yeux** : entre 0,6 et 3 s avant, les yeux disaient encore « la route tient ». Une seule était imposée (§ 2.1).
4. **Le seul signe qui tient, c'est la vitesse**, lue 1,5 à 2 s avant le décollage : les morts allaient plus vite que les décollages qui se sont posés,
   carte par carte (§ 2.2). Mais **on ne sait pas si c'est la vitesse elle-même ou le palier** : les deux vont ensemble et les relecteurs ne les séparent pas (p = 0,07).
5. **La ligne n'est pas le levier.** Le pilote ne demande pas d'aller vers le bord : la caisse y part seule dans la dernière demi-seconde (§ 2.3).
6. **Les joueurs vont plus vite que c0025, partent nitro allumée 5 fois plus souvent, et ne meurent pas plus par minute sur décor** (§ 4).
   Un bot qui ralentit pour moins mourir s'éloigne donc des joueurs.
7. **Trois propositions** (§ 5) : couper la nitro au-dessus d'une vitesse (`plafOn`), une garde au bord (`gardeOn`), ne sortir exprès que du côté ouvert en ville (`ouvertOn`).
   **Les relecteurs n'en laissent écrire aucune tout de suite** : `gardeOn` est à ne pas faire ; les deux autres sont à mesurer d'abord (§ 6, § 7).
8. **La dépense la plus utile n'est pas un gène** : rejouer les 40 courses en gardant le volant, le virage et la vitesse du jeu, environ 13 à 25 min (§ 8).
9. **Une question n'est pas technique et revient à Sacha** : un bot doit-il mourir sur décor comme un joueur (ce que E ne mesure pas), ou moins (ce que F récompense) ?

## 1. La question

Sur les maps à décor (canyon, grotte, ville, jade), c0025 meurt surtout juste après une sortie par le bord : canyon 30 % de ses décollages subis,
grotte 24 %, ville 13 %, jade 5 % (`../sortie-preparee/LISEZ-MOI.md`, § 4 a). Au moment du bord, les yeux ne voient aucune issue (§ 8.5 de l'étude d'avant).
**Que voyait-on, et que pouvait faire le pilote, une à trois secondes plus tôt, quand il roulait encore ?**

Les données : les 40 courses de 180 s de la mesure d'avant (8 graines par map en « carte tenue », plus 8 sans carte), gardées vue par vue dans
`../sortie-preparee/sorties/lignes/*.jsonl.gz`. Un seul pilote : c0025. Trois courses « sans carte » sont des doublons et sont retirées (§ 8.2 de l'étude d'avant).

**Le périmètre.**
- Lecteur des traces : 180 décollages subis distincts, dont 24 mortels. Sur décor : 160, dont **22 morts**, 137 posés, 1 coupé par la limite de temps
  (`lecteur-traces/sorties/avant-le-bord.txt`).
- Relecteur des chiffres : 179 subis, dont 24 mortels ; sur décor 161, dont 23 morts (`relecteur-chiffres/recompte.txt`).
  L'écart d'un décollage vient d'une vue prise à l'instant même du décollage, comptée ou non. Aucune conclusion n'en dépend (relecteur).
- À 0,6 s avant le décollage, il n'y a une vue au sol que pour 18 morts et 103 posés : les autres décollages suivent une pose de trop près.

## 2. Ce que disent les traces

Source : `lecteur-traces/avant-le-bord.js` et `complements.js`, sorties dans `lecteur-traces/sorties/`. Recompté sans leur code par
`relecteur-chiffres/recompte.js` et `recompte2.js`.

### 2.1 Évitable ou imposé

- Le jeu classe chaque décollage en « trou », « bord » ou « saut » (`code/moteur/enregistreur-jeu.js`, l.74). **Les 246 décollages distincts sont tous « bord ».**
  Au décollage, la caisse est entre 25,8 et 28 m du centre, pour une demi-route de 28 m.
- Définitions du lecteur :
  - **évitable** : à au moins une vue au sol entre 0,6 et 3 s avant, les yeux (`tenue`) disaient « la route tient 3 s en conduisant au mieux » ;
  - **imposé** : les yeux disaient « bord » à toutes ces vues ;
  - **sans sol** : aucune vue au sol à 0,6 s ou plus (la caisse se pose et repart aussitôt).

| maps à décor | morts | posés |
|---|---|---|
| évitable | **17** | 101 |
| imposé | **1** (canyon 3970659, bord annoncé 1 s avant) | 2 |
| sans sol à 0,6 s | 4 | 34 |

- Plus strict (« tient » à toutes les vues de 0,6 à 3 s) : 13 morts et 94 posés évitables.
- **Réserve.** `tenue` est une conduite idéale : vitesse constante, main sans retard. « Évitable » veut dire « évitable par une conduite idéale partie de cet état »,
  pas « évitable par c0025 ».

### 2.2 Morts contre posés : la vitesse

Le lecteur a comparé 36 grandeurs lues au sol (vitesse, nitro, place sur la route, cap, jauge, palier, ligne visée), à plusieurs reculs.

| grandeur | médiane morts / posés | seuil | p (Fisher) |
|---|---|---|---|
| vitesse 1,5 s avant | 148 / 132 m/s | > 143 | 0,001 |
| vitesse 1 s avant | 149 / 134 m/s | > 139 | 0,004 |
| nitro coupée 1 s avant | 50 % / 18 % | | 0,005 |
| distance au bord de sortie 0,6 s avant | 37 / 28 m | > 39 | 0,001 |
| cap vers le bord, jauge, palier, ligne visée | proches | | rien |

**Attention au hasard.** Quand on fouille beaucoup de grandeurs, on finit toujours par en trouver une qui semble séparer.
- Étiquettes « mort » mélangées au hasard : le meilleur séparateur trouvé par chance vaut autant que la vitesse.
  Lecteur : la vitesse (J = 0,44) ne dépasse pas le seuil du hasard (0,49). Relecteur, sur 35 grandeurs : **p = 0,16**, et p = 0,07 en mélangeant à l'intérieur de chaque carte.
- **Fouillées à l'aveugle, ces 22 morts ne prouvent aucun séparateur.** Le lecteur et le relecteur le disent tous les deux.

**Ce qui sauve la vitesse** : l'étude d'avant l'avait nommée *avant* de mesurer (avec la ligne et la marge). Testée seule, carte par carte :

| grandeur | rang moyen des morts dans leur carte (0,5 = hasard) | p | source |
|---|---|---|---|
| vitesse 2 s avant | 0,70 (lecteur) ; 0,79 (relecteur) | 0,0003 ; 0,0005 | `complements.txt` ; `recompte.txt` |
| vitesse 1,5 s avant | 0,71 ; 0,78 | 0,0005 ; 0,0005 | idem |
| vitesse 1 s avant | 0,69 ; 0,76 | 0,001 ; < 0,0005 | idem |
| nitro demandée 1 s avant | 0,38 (les morts l'ont moins) | 0,012 | `complements.txt` |
| marge 0,6 s avant | 0,63 | 0,04 | `complements.txt` |

Les deux calculs de rang ne sont pas faits de la même façon (le relecteur classe les morts parmi les posés de leur carte), d'où des valeurs différentes. Le sens est le même.
Ces p résistent à une correction pour 15 tests (relecteur).

Vitesse au-dessus de 143 m/s, 1,5 s avant (morts au-dessus / en dessous ; posés au-dessus / en dessous) :

| carte | morts | posés |
|---|---|---|
| canyon | 6 / 0 | 4 / 13 |
| grotte | 4 / 3 | 4 / 20 |
| ville | 2 / 1 | 3 / 8 (relecteur : 2 / 8) |
| jade | 1 / 0 | 20 / 23 (relecteur : 21 / 22) |

- Le seuil tient hors échantillon : choisi sur 7 graines et compté sur la 8e, il vaut 142,3 à 145,1 ; 27,9 % de morts au-dessus, 7,2 à 7,4 % en dessous
  (`concepteur-vitesse/plafond.txt` § 4, `relecteur-chiffres/recompte.txt`).
- 17 % des vues au sol sur décor dépassent 143 m/s (4 937 sur 29 156, `lecteur-traces/sorties/vues-rapides.txt`).

**Ce que le relecteur fait tomber : « ce n'est pas le palier ».** Le lecteur avait écrit que le palier ne sépare pas (rang 0,58, p = 0,13).
Le relecteur des chiffres montre que ce chiffre est lu à la dernière vue, sur 22 morts. Sur les 17 mêmes morts que la vitesse, à 1,5 s, **le palier sépare aussi**
(rang 0,73, p = 0,0035). Une fois le palier retiré, il reste à la vitesse un rang de 0,64, **p = 0,07 : non prouvé**.
Le concepteur « vitesse » trouve la même chose (0,61, p = 0,11, `plafond.txt` § 3). **La version retenue ici est celle du relecteur : on ne sait pas si
c'est la vitesse ou le palier qui tue.** La vitesse peut n'être que le reflet du jeu qui accélère avec le palier.

### 2.3 Le reste de ce qu'on lit

- **La nitro.** Au-dessus de 130 m/s, la nitro tenue ne fait que garder la vitesse (+0,1 m/s par seconde, 4 821 mesures). Coupée, la caisse perd environ 11 m/s par seconde
  (765 mesures, `relecteur-chiffres/recompte2.txt` ; `plafond.txt` § 10). À 2 s du décollage, 15 morts sur 17 ont la nitro allumée (`plafond.txt` § 7).
- **Le pilote coupe la nitro tard** : environ 1 s avant, quand le virage la refuse (`modele.js` l.282-296). C'est une déduction : la marge de vitesse du virage n'est pas dans les traces.
- **La ligne ne pousse pas dehors** (concepteur ligne, `ligne-placement/sorties/garde.txt`). Le cap que le pilote *demande* vers le bord vaut au plus 0,11 rad chez les morts (0,07 chez les posés).
  Le cap réel monte à 0,23 – 0,65 rad. La caisse part en 0,5 s, souvent alors que le pilote demande l'inverse (`ligne-placement/sorties/vues-avant.txt`).
- **Les morts viennent de l'autre côté de la route** : 0,6 s avant, ils sont à 37 m du bord de sortie et traversent toute la route.
  À la grotte, 5 morts sur 6 frôlent d'abord un bord, puis retraversent et sortent par l'autre (`concepteur-libre/qui-sort.txt`). Cela ressemble à un virage pris trop vite. Ce n'est pas prouvé.
- **Les endroits ne tuent pas deux fois** : une seule paire de morts à moins de 40 m sur la même carte, quand le hasard en donne environ 0,55 (`lecteur-traces/sorties/avant-le-bord.txt` § 3).
- **Le canyon tue loin** : ses 8 morts tombent à 6,7 km ou plus, entre 62 et 104 s de course, toutes pendant la première visite.
- **Le zigzag ne sépare pas** (p = 0,29 à carte égale).

### 2.4 Ce que les traces ne disent pas

- Le volant au sol (présent dans 752 vues sur 34 201 seulement), la suite de la route (`virage`, `vSure`), la vitesse du jeu (`vitMult`), le type de décor au point du décollage.
- **On ne sait donc pas** si les morts sont dans un virage, ni si le volant était déjà à fond.
- On ne sait pas si ralentir sauverait : aucune course n'a ralenti.

## 3. Ce que le code permet

Source : lecteur du code, `lecteur-code/sol-avant-bord.js` et `sol-avant-bord.json` (37 courses, doublons retirés).

### 3.1 Ce que fait c0025 au sol sur décor (`modele.js`, `auSol`)
- La ligne est bornée à 18 m du centre (l.223, `marge` 10 sur une demi-route de 28 m). `bandeDecor` vaut 99 : **rien dans la ligne ne dépend du décor**.
- Quand la route lâche, il vise 9 m de l'autre côté (l.241) et coupe la nitro (l.296).
- Le cap est borné à ±0,4 rad, en dur (l.279).
- `nitroDecor` vaut 1 : **la nitro se comporte comme sans décor**.
- Ni frein ni drift : `auSol` ne rend jamais de `manche`.
- Raccourcis interdits au canyon, à la grotte et à la jade, permis en ville.

### 3.2 Ce que les yeux offrent et que le pilote ne lit pas
- `virage.vSure` (la vitesse sûre du prochain virage), `rayon`, `route[i].trou`, `tenue.mortel`, les rayons de `sorties.bord`, le relief.
- Le décor lui-même (paroi, roche, tour) n'est pas dans la vue au sol.

### 3.3 Ce que les yeux ne donnent pas
- Une tenue jouée avec la vraie main du pilote (retard, coups de touche) et sa vraie ligne. Celle d'aujourd'hui conduit « au mieux » : quand elle sort quand même, c'est déjà perdu.
  Sur décor, 155 décollages sur 160 partent du côté annoncé dès la première annonce.
- Une tenue « en freinant ».
- La distance du décor de chaque côté, au sol.
- **Le coût** : changer `yeux.js` change l'époque (`FICHIERS_EPOQUE`, `ml/evolution/commun.js`). Toutes les courses en cache sont refusées,
  la sélection du Ryzen repart, le banc rejoue son bras « départ » (96 courses), la vague 1 en cours s'arrête.

### 3.4 Ce que la sélection peut déjà faire seule (gènes existants, `genome.js`)

| gène | bornes | c0025 | ce qu'il fait sur décor |
|---|---|---|---|
| `bandeDecor` | 10 – 99 | 99 | resserre la ligne vers le centre (sous 18) |
| `nitroDecor` | 0 – 1,5 | 1 | règle la nitro sur décor ; à 0, plus jamais de nitro sur décor |
| `raccCartes_ville` | 0 / 1 | 1 | interdit les raccourcis voulus en ville |

**Une règle neuve « ligne plus centrale » ou « moins de nitro sur décor » ne sert donc à rien** : les gènes existent.
Deux réserves : « réglable » ne veut pas dire « trouvé » (après 18 générations, le champion est toujours le témoin) ; en phase A, la tête de réseau SOL ne mute pas.

### 3.5 Ce qu'aucun gène ne peut atteindre
- **Le frein.** Il existe dans le jeu : ↓ au sol (`code/moteur/boucle-2-conduite.js` l.43), la main y accède par `manche: +1` (`ml/bot/doigts.js`).
  Mais si le volant dépasse 0,35 à bonne vitesse, ↓ devient un **drift** (`../conduite.md` l.58-60). Ordre de grandeur **calculé, non mesuré** : environ 16 m/s perdus par seconde.
  On ne sait pas combien de vues ont le volant sous 0,35 : les traces ne le gardent pas.
- Réagir avant l'annonce de `tenue`.
- La main ne peut pas : un volant progressif (elle tape des coups de 70 à 300 ms), réagir en moins de 120 ms, freiner en braquant sans drifter.

## 4. Ce que font les joueurs et la ville

Source : lecteur des joueurs, `joueurs-ville/*.js` et leurs `.json`. Joueurs : `ml/bot/etalon/*.json` (14 parties, 2 joueurs, 41 min).
c0025 : `ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json` (20 courses de 900 s au plus ; ce fichier n'est pas suivi par git).

### 4.1 Les joueurs meurent autant par minute sur décor

| map | morts pour 10 min, joueurs / c0025 | pour 100 km, joueurs / c0025 |
|---|---|---|
| canyon | 8,9 / 10,7 | 8,7 / 14,3 |
| grotte | 6,2 / 8,2 | 5,6 / 12,3 |
| ville | 4,1 / 6,9 | 4,2 / 11,3 |
| jade | 3,7 / 0 | 2,8 / 0 |
| **décor, total** | **5,3 / 5,5** | **4,6 / 8,0** |

- Par minute, pas d'écart (p = 0,53). Par km, c0025 meurt environ 1,7 fois plus (p = 0,11 : pas significatif).
  Ces deux p sont calculés dans une commande qui n'est pas gardée en fichier (lecteur joueurs).
- Petits nombres : 12 morts de joueurs sur décor, 2 à 4 par map.

### 4.2 Les joueurs vont plus vite et gardent la nitro

| | joueurs | c0025 |
|---|---|---|
| vitesse au sol, minute 0 → 3 de la partie | 405 → 699 km/h | 374 → 539 km/h |
| part des décollages par le bord nitro allumée (canyon, grotte, ville, jade) | 0,52 à 0,65 | 0,00 à 0,12 |
| place sur la route 1 s avant le décollage (part de la demi-route) | 0,21 à 0,38 | 0,27 à 0,33 |

`joueurs-ville/vitesse-et-km.json`, `par-map.json`. **Les joueurs vont 8 à 30 % plus vite, partent nitro allumée environ 5 fois plus souvent, et ne meurent pas plus par minute.**
Aucun des deux ne longe le bord. Limites : une seule voiture, d'autres versions du jeu, aucune intention connue.

### 4.3 Ce que mesure E
Aucune des 15 mesures de E (`ml/bot/ressemblance.js` l.29-33) ne porte sur la mort, sa map ou sa cause. Plusieurs portent sur la nitro et la vitesse.
Donc, sous F = palier − 4 E : **un bot qui meurt moins ne gagne rien en E**, et un bot qui ralentit ou coupe la nitro **perd** en E (c0025 est déjà sous les joueurs :
nitro au sol z −1,38, vols par minute z −1,80, d'après `node ml/bot/ressemblance.js` sur la grande note, cité par le concepteur vitesse).

### 4.4 La ville : les morts que le pilote choisit
Les « 5 morts sur 22 raccourcis » de l'étude d'avant mêlent deux choses (`joueurs-ville/ville-raccourcis.json`) :

| sorties voulues en ville | nombre | morts |
|---|---|---|
| vrais raccourcis | 17 | 2 (tous deux en « viserPlane ») |
| sorties du dessous (sous la dalle) | 5 | 3 |

- Pour les 2 raccourcis mortels, le radar promettait une pose aux trois vues : **les yeux se trompaient**.
- Pour les 3 sorties du dessous, la vue d'avant disait déjà « choc » : le pilote s'engage sur une seule vue et ne renonce jamais.
- La greffe `raccCartes_ville` = 0 (en cours sur le Ryzen) retire les 17 raccourcis (2 morts, 15 posés) et **ne touche pas** les 3 morts du dessous.
  Sur le Ryzen, génération 17 : greffe F 4,60 ± 0,90 (12 courses), témoin c0025 3,65 ± 0,64 (24 courses) ; **pas tranché**, pas sur les mêmes graines
  (`origin/evolution-ryzen`, `etat/generations.jsonl`). Elle va contre la ressemblance : en ville, les joueurs font 2,9 raccourcis par minute, c0025 2,08.
- Ce que dit le concepteur libre : « deux vues de suite » ou « renoncer » ne séparent pas. Sous la dalle les rayons clignotent (`concepteur-libre/voulus.txt`).
  Le lecteur des joueurs proposait la règle des deux vues : **le concepteur libre la mesure et la fait tomber**.

## 5. Les propositions

Chacune serait un gène éteint à la naissance (c0025 garde `19e3767cc346` et conduit au bit près), avec un compteur de déclenchements, dans un génome v:5.
**Toutes trois changent `modele.js` et `genome.js`, donc l'époque.** Aucune n'a été écrite dans `ml/evolution`.

### 5.1 `plafOn` : lever le pied sur décor (concepteur vitesse)

- **L'idée.** Sur une map à décor, au-dessus d'une vitesse, le pilote arrête la nitro, et ne la reprend qu'une fois ralenti. Aujourd'hui il la tient jusqu'à ce que le virage la refuse, trop tard.
- **La règle.** Dans `auSol`, juste après `m.nitro=` (l.296) : si `vit > plafV`, la nitro demandée est coupée ; elle revient sous `plafV − plafBande`. Pas pendant un raccourci. Aucun champ nouveau aux yeux.
- **Les gènes.** `plafOn` 0..2 (0 éteint ; 1 canyon, grotte, ville ; 2 jade aussi), `plafV` 120..190 m/s (145), `plafBande` 2..20 m/s (8).
  La jade est à part : elle a la moitié des vues rapides pour 1 mort.
- **Sur les traces** (`concepteur-vitesse/plafond.txt` § 5 et § 11) : à 143 m/s sans la jade, elle agit sur 9,7 % du sol de ces maps et touche 12 morts sur 17
  (10 pendant au moins 1 s) et 20 posés sur 57. **Plafond optimiste** : 11 morts deviendraient 3. Ces deux derniers chiffres **ne sont pas recomptés** par le relecteur.
- **Hors d'atteinte** : 9 morts sur décor (chaînes, longs vols, déjà lentes) et les 2 hors décor. Au palier 9, la caisse roule à 148 m/s nitro coupée : la règle n'y peut plus rien.
- **Ce qu'elle risque** : moins de vols (c0025 en manque déjà), moins de nitro, donc E plus mauvaise. Ordre de grandeur du concepteur : environ −0,2 sur F avant les vols perdus (non recompté).
- **Le plan du concepteur.** Ne pas l'écrire tout de suite. **Étape 0, sans code ni nouvelle époque** : un bras `nitroDecor` à 0 au canyon imposé, critère « morts paroi et canyon », garde « pas plus de 0,75 palier perdu ».
  Si retirer toute la nitro ne sauve pas, un plafond ne sauvera pas. Étape 1 seulement si l'étape 0 aide.
- **Ce qui le ferait abandonner** : l'étape 0 ne baisse pas les morts ; le compteur part sur moins de 10 % des graines ou plus du quart du sol ; le palier ou F cassés ;
  une trace avec `virage` montre que les morts ne dépassent pas la vitesse sûre ; Sacha veut un bot qui meurt comme les joueurs.

### 5.2 `gardeOn` : la garde au bord (concepteur ligne)

- **L'idée.** À chaque vue, le pilote calcule lui-même « à ce cap, dans combien de temps suis-je au bord ? », sans attendre l'annonce des yeux.
  Si c'est trop court : il ne demande plus de cap vers ce bord (niveau 1), ou contre-braque à fond et coupe la nitro (niveau 2).
- **Les gènes.** `gardeOn` 0..2, `gardeT` 0,3..1,2 s (0,5), `gardeM` 0..10 m (4). Aucun champ nouveau aux yeux.
- **Sur les traces** (`ligne-placement/sorties/garde.txt`, recompté par `relecteur-chiffres/recompte2.txt`) :
  - le niveau 1 ne fait presque rien : 0,7 % des vues, 3 morts sur 18, 0,5 m rabotés ;
  - le contre (niveau 2) est vrai avant les 21 morts qui ont du sol, mais il ne gagne que 0,15 à 0,25 s sur l'annonce des yeux ;
  - à `gardeT` 0,7, il tient depuis au moins 0,4 s chez 17 morts sur 22 **et chez 94 posés sur 137** ; il change la conduite sur 21 % des vues.
- **Le concepteur n'y croit qu'à moitié** : son résultat principal est que la ligne n'est pas le levier (§ 2.3).
- **Une seconde piste du concepteur, non chiffrée** : `avanceT`, l'horizon du cap d'avance, écrit en dur à 0,4 s (l.230). Rien ne la mesure sans `lacetRoute` dans les traces.

### 5.3 `ouvertOn` : ne sortir exprès que du côté ouvert (concepteur libre)

- **L'idée.** Avant de quitter la route exprès, le pilote regarde déjà de chaque côté. Si « tout lâcher » et « planer » finissent tous deux contre le décor, une tour borde ce côté.
  La règle : ne pas sortir exprès d'un côté bordé, attendre un côté ouvert.
- **La règle.** Elle lit `vue.sorties.gauche` et `.droite`, qui existent déjà quand le pilote prépare une sortie (`yeux.js` l.953, 1004-1005). Elle ne fait que refuser.
- **Les gènes.** `ouvertOn` 0..2 (1 les raccourcis ; 2 aussi les sorties du dessous), `ouvertT` 0,1..1,5 s (0,3).
- **Sur les traces** (`concepteur-libre/cote-borde.txt`, recompté par `relecteur-chiffres/recompte.txt`) :

| ville | sorties | morts |
|---|---|---|
| côté bordé | 11 | **5** |
| côté ouvert | 11 | **0** |

  Fisher p = 0,018. Hors ville, 9 sorties bordées, toutes posées : un coût pur.
- **Elle ne touche aucune des 24 morts subies** : elle vise 5 des 30 morts de la mesure (24 subies + 6 voulues).
- **Ce qu'on ne sait pas** : ce que fait la caisse après un refus (57 passages sous la dalle sur 57 finissent en décollage, `concepteur-libre/dessous.txt`) ;
  si « bordé » vaut hors ville ; si les rayons `rien` et `plane` de côté sont justes.
- **Le plan du concepteur.** D'abord rejouer la mesure : 16 courses de ville sur des graines neuves, prédiction écrite avant (« au moins trois fois plus de morts côté bordé »).
  Pas de gène si elle ne tient pas.

## 6. Ce que les relecteurs ont fait tomber

| ce qui était écrit | qui | ce qui reste |
|---|---|---|
| « Le palier ne compte pas » (lecteur traces) | relecteur chiffres | Faux sur le même ensemble : le palier sépare aussi (p = 0,0035). Vitesse moins palier : p = 0,07, non prouvé. |
| Un séparateur trouvé par la fouille | relecteurs chiffres, lecteur | Aucun ne bat le hasard (p = 0,16). Seule la vitesse, nommée d'avance, tient. |
| `plafOn` : « 0,8 à 2,4 décollages par minute sous 143 m/s, 28 à 31 % mortels au-dessus » | relecteur chiffres | Ces chiffres sont justes **pour toutes les cartes ensemble**, par tranche de vitesse lue 1,5 s avant (`plafond.txt` § 8). Carte par carte, à la dernière vue au sol, le relecteur trouve 1,9 à 3,4 sous 143 et 9 à 67 % mortels au-dessus (`recompte2.txt`). Le sens tient ; une seule fourchette ne vaut pas pour toutes les cartes. Le relecteur du code avait retrouvé les chiffres du concepteur : les deux ne mesurent pas la même chose. |
| `plafOn` étape 0 : « retirer toute la nitro » | relecteurs code et banc | `nitroDecor` à 0 interdit la nitro sur décor ; il ne teste pas « couper au-dessus de 143 ». Une réussite ne valide donc pas `plafOn` : seul l'abandon est sûr. Le départ et un raccourci « plane » demandent encore la nitro. |
| `plafOn` : critère « morts paroi et canyon » | relecteurs code et banc | Le banc compte toutes les morts de la partie et n'impose que la première map : il mesure aussi un déplacement de cause. Il faut lire `survie` et les autres causes en face, et ajouter une garde sur E. |
| `plafOn` : la bande de reprise | relecteur code | Couper la nitro change aussi le seuil de la vue suivante (l.287-290) : la reprise est plus dure que `plafBande` ne le dit. Un réglage caché, pas un bug. |
| `plafOn` : confirmation à 500-800 graines | relecteur banc | Impossible avec le banc tel qu'il est (192 graines au plus). |
| `gardeOn` : le contre aide | relecteur code | La main reçoit déjà un écart de cap de 0,4 à 1,6 rad/s vers l'intérieur. Si le volant est déjà à fond, le contre n'ajoute rien. C'est une déduction : `lacetMax` n'est pas dans les traces. |
| `gardeOn` : 96 graines pour 10 s de survie | relecteur banc | Ce chiffre vient de 8 courses non appariées coupées à 180 s. Sur 900 s, l'écart apparié vaut 88 s (`concepteur-vitesse/sigma-survie.txt`) : il faudrait environ **600 graines**. À 180 s, le critère devient « a passé le canyon » : un autre critère. |
| `gardeOn` : la condition cible les morts | les trois | Elle s'allume aussi souvent avant un décollage posé. |
| `ouvertOn` : « le niveau 1 n'agit qu'en ville » | relecteur code | Faux. Quand la sortie du dessous est refusée, le code passe par `raccourci()` (l.358-359), où le filtre agit dès le niveau 1, sur toutes les maps à décor. Il faudrait garder `!sortir` au niveau 1. Le filtre écarte aussi des rayons « portail » que le concepteur ne cite pas. |
| `ouvertOn` : p = 0,018 | relecteur chiffres | Le découpage est né sur les 3 morts du dessous, et au moins 6 découpages ont été regardés : de l'ordre de p = 0,2 en tout. Seule la partie non regardée confirme, et seule elle ne prouve rien (raccourcis : 2 morts sur 8 contre 0 sur 9, p = 0,21). Le concepteur l'écrivait lui-même. |
| « Les 5 morts sur 22 raccourcis » de l'étude d'avant | lecteur joueurs | 2 vrais raccourcis, 3 sorties du dessous. `raccCartes_ville` ne touche pas les 3. |
| La règle des deux vues pour la sortie du dessous (lecteur joueurs) | concepteur libre | Ne sépare pas : les rayons clignotent sous la dalle (`voulus.txt`). |
| Une règle « ligne plus centrale » ou « moins de nitro sur décor » | lecteur code | Inutile : `bandeDecor` et `nitroDecor` existent. |

## 7. Le classement des relecteurs

| rang | quoi | relecteur chiffres | relecteur code | relecteur banc |
|---|---|---|---|---|
| 1 | Ré-enregistrer les 40 courses avec volant, virage, `vitMult`, `lacetRoute`, `lacetMax` (pas un gène) | utile, tranche vitesse contre palier | n° 2 de son ordre | **n° 1** |
| 2 | `plafOn`, étape 0 seulement : `nitroDecor` au canyon imposé | à mesurer d'abord | **n° 1** ; lire `causes` et `survie` | à mesurer d'abord, deux bras (0 et 0,5), garde sur le palier **et** sur E |
| 3 | `ouvertOn` : rejouer 16 courses de ville, puis le gène au niveau 1 si l'écart tient | à mesurer d'abord | à mesurer, puis corriger le niveau 1 et le portail | à mesurer ; niveau 1 seulement, ou par carte ; attendre la greffe `raccCartes_ville` |
| 4 | `plafOn` écrit | pas avant l'étape 0 | pas avant l'étape 0 | pas avant l'étape 0 et le diagnostic |
| 5 | `gardeOn` | à ne pas faire en l'état | à ne pas faire | **à ne pas faire** |

Les trois relecteurs s'accordent sur un point : **aucun code v5 avant ces mesures**.

## 8. Ce qui reste à mesurer, et ce que cela coûterait

Rien de cela n'a tourné. Le PC est pris par la vague 1 du banc (`ml/evolution/banc/vagues/v001-confirmation-gestes`).

| mesure | ce qu'elle tranche | ce qu'il faut toucher | coût (ordre de grandeur) |
|---|---|---|---|
| **A. Ré-enregistrer les 40 courses** avec `vue.volant`, `virage` (`vSure`, `marge`), `vitMult`, `lacetRoute`, `lacetMax` | vitesse ou palier ? le volant est-il déjà à fond (`gardeOn`) ? combien de vues sous 0,35 de volant (le frein) ? les morts suivent-elles une entrée de virage (`avanceT`) ? | `../sortie-preparee/course-diag.js` (ou une copie ici) ; ni le pilote ni le jeu. Il faudrait reprouver « avec et sans diagnostic : identique » | 40 courses de 180 s au plus : environ 13 min de calcul d'après les en-têtes (concepteur ligne), 25 min à 2 courses à la fois d'après l'étude d'avant |
| **B. Étape 0 de `plafOn`** : canyon imposé, bras `nitroDecor` 0 et 0,5 contre c0025 | couper la nitro sur décor sauve-t-il au canyon ? | un bras de plus dans `ml/evolution/banc/bras.json` (aucun n'existe pour `nitroDecor` aujourd'hui ; vérifié par lecture). Pas de nouvelle époque : le gène existe. Que l'ajout d'un bras arrête ou non la vague 1 **n'est pas vérifié** : à faire après elle | 3 pilotes × 24 à 192 graines = 72 à 576 courses. Estimation du concepteur, non simulée : net vers 72 graines si la part de courses mortes au canyon passe de 0,9 à 0,6 ; vers 144 de 0,9 à 0,75 ; invisible en dessous |
| **C. Rejouer la ville** : 16 courses de ville tenue sur des graines neuves | le côté « bordé » tue-t-il vraiment plus (au moins 3 fois) ? | `course-diag.js`, comme A | environ 10 min (concepteur libre). La puissance de 16 courses pour un rapport de 3 **n'est pas calculée** (relecteur banc) |
| D. Une vague `ouvertOn` sur ville imposée | les morts « tour » baissent-elles sans que d'autres montent ? | le gène v5 écrit, nouvelle époque | plafond environ −0,37 mort « tour » par course : visible dès 24 à 50 graines au plafond, 50 à 100 à la moitié (concepteur libre, non simulé) |
| E. Une confirmation sur F (maps tirées) | le palier gagné vaut-il la ressemblance perdue ? | | un demi-palier demande 500 à 800 graines par bras : **hors de portée du banc** (192 au plus) |
| F. `gardeOn` sur la survie | | | environ 600 graines pour 10 s de survie (relecteur banc) : hors de portée |

Débit connu du banc : environ 180 courses de 900 s par heure (`../prochaines-idees/LISEZ-MOI.md`). Au canyon imposé, les courses meurent vers 86 s
(`ligne-placement/sorties/survies.txt`) : elles devraient aller plus vite, ce qui n'est pas mesuré.

**Ce qu'on ne sait pas du tout** : si ralentir sauve ; si le frein est possible (volant sous 0,35) ; ce que fait la caisse après une sortie refusée ;
si la vitesse tue ou n'est que le palier ; si le palier du jeu monte avec la distance ou avec le temps (couper la nitro pourrait le faire baisser mécaniquement).

## 9. Ce que l'on en fait

*Décision de la session principale, le 28/11/2026, après lecture des neuf rapports. Aucune course n'avait encore été jouée pour cette étude.*

**1. Aucun gène v5 n'est écrit maintenant.** Les trois relecteurs le disent et ils ont raison : la règle d'avant (la sortie préparée) est morte d'avoir été
écrite avant d'être mesurée. On mesure d'abord.

**2. `gardeOn` est abandonné.** La condition s'allume presque aussi souvent avant un décollage qui se pose (94 sur 137) qu'avant une mort (17 sur 22), et
il faudrait environ 600 graines pour voir son effet : hors de portée. Ce que le concepteur a trouvé en chemin reste : **la ligne n'est pas le levier**,
le pilote ne demande pas d'aller au bord.

**3. Le constat qui change le plus la suite n'est pas une règle : c0025 ne meurt pas plus qu'un joueur par minute sur décor, il va moins vite** (§ 4.1,
§ 4.2 ; petits nombres : 12 morts de joueurs). Ralentir (`plafOn`) irait donc contre la ressemblance, et peut-être contre le palier si le palier monte
avec la distance. La question à poser n'est plus seulement « comment mourir moins ? » mais aussi **« aller plus vite tue-t-il plus ? »**. Les deux se
mesurent avec un gène qui existe déjà, `nitroDecor`, sans nouvelle époque.

**4. Ce qu'on mesure, dans cet ordre.**
- **A et C tout de suite** (§ 8, environ 35 min à 2 courses à la fois, pendant que la vague 1 continue) : les 40 courses rejouées en gardant le volant, le
  virage, la vitesse du jeu ; et 16 courses de ville sur des graines neuves, la prédiction « au moins trois fois plus de morts côté bordé » écrite avant.
  En même temps, lire dans le code du jeu comment le palier monte (distance ou temps) : cela ne coûte aucune course.
- **B élargi, après la vague 1** : une vague du banc au canyon imposé, trois bras `nitroDecor` à 0, à 0,5 et à **1,5** contre c0025 (1). Si retirer la
  nitro ne sauve pas, `plafOn` est abandonné ; si en mettre plus ne tue pas plus, le pilote peut aller plus vite sur décor, comme les joueurs. Les critères
  seront écrits dans la vague avant de jouer (la survie, avec une garde sur le palier et sur E).
- **`ouvertOn`** : seulement si C confirme, et après le sort de la greffe `raccCartes_ville = 0` sur le Ryzen.
- **D, E, F** : pas maintenant (E et F sont hors de portée du banc).

**5. La question qui revient à Sacha** (elle ne bloque aucune de ces mesures) : sur les maps à décor, un bot doit-il mourir comme un joueur, ou moins ?
Aujourd'hui la note F récompense le palier et la ressemblance, et la ressemblance ne regarde pas les morts.

*La suite (les mesures A et C, puis ce qu'on en retient) sera ajoutée ici, à la suite.*

## 10. Les fichiers

Tous en lecture seule : ils relisent les traces de `../sortie-preparee/sorties/lignes/` (ou les fichiers cités) et n'écrivent que dans ce dossier.
Refaire : `node <script>` depuis la racine du dépôt (chemins relatifs, jamais `/c/…` sous Git Bash).

| fichier | rôle |
|---|---|
| `lecteur-traces/avant-le-bord.js` → `sorties/avant-le-bord.txt`, `.json` | le périmètre, évitable ou imposé, les grandeurs au sol, le hasard (§ 2) |
| `lecteur-traces/complements.js` → `sorties/complements.txt` | les permutations à carte égale |
| `lecteur-traces/vues-rapides.js` → `sorties/vues-rapides.txt` | la part des vues au-dessus de 143 m/s |
| `lecteur-code/sol-avant-bord.js` → `sol-avant-bord.json` | l'effet mesuré de la nitro, le côté de sortie, la vitesse avant le décollage (§ 3) |
| `joueurs-ville/par-map.js` → `par-map.json` | joueurs contre c0025, par map (§ 4) |
| `joueurs-ville/vitesse-et-km.js` → `vitesse-et-km.json` | la vitesse à temps égal, les morts par km |
| `joueurs-ville/raccourcis-par-map.js` → `raccourcis-par-map.json` | les raccourcis par minute |
| `joueurs-ville/ville-raccourcis.js` → `ville-raccourcis.json` | les sorties voulues de la ville, une par une |
| `concepteur-vitesse/plafond.js` → `plafond.txt`, `plafond.json` | `plafOn` rejoué sur les traces (§ 5.1) |
| `concepteur-vitesse/sigma-survie.js` → `sigma-survie.txt` | l'écart apparié de la survie (88 s) et du palier (4,0), lu sur le banc d'étude |
| `ligne-placement/garde.js` → `sorties/garde.txt`, `garde.json`, `garde-borne.json` | `gardeOn` rejoué ; le cap demandé contre le cap réel (§ 5.2) |
| `ligne-placement/vues-avant.js` → `sorties/vues-avant.txt` | les vues au sol avant chaque décollage, une par une |
| `ligne-placement/survies.js` → `sorties/survies.txt` | survie et cause des 32 courses à carte tenue |
| `concepteur-libre/cote-borde.js` → `cote-borde.txt`, `.json` | `ouvertOn` : côté bordé contre côté ouvert (§ 5.3) |
| `concepteur-libre/voulus.js` → `voulus.txt`, `.json` | les sorties voulues ; « deux vues » et « renoncer » |
| `concepteur-libre/dessous.js`, `dessous-promesse.js` → `.txt` | les passages sous la dalle |
| `concepteur-libre/qui-sort.js` → `qui-sort.txt` | de quel côté la caisse sort, une seconde avant |
| `relecteur-chiffres/recompte.js` → `recompte.txt` | le recomptage indépendant : périmètre, hasard, vitesse contre palier, côté bordé (§ 6) |
| `relecteur-chiffres/recompte2.js` → `recompte2.txt` | décollages par minute selon la vitesse, la nitro au-dessus de 130 m/s, le contre de `gardeOn` |

`sigma-survie.txt`, `sorties/survies.txt` et `sorties/vues-avant.txt` ont été écrits par le rédacteur, en relançant ces trois scripts (lecture seule) pour que leurs chiffres aient un fichier.
Aucun fichier n'a été supprimé : tous servent à une source citée ici.
