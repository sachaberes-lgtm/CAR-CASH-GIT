# La sortie préparée : ce que les yeux voient au décollage, et ce qui arrive ensuite (28/11/2026)

Étude de mesure, sans aucun changement du pilote ni du jeu. Écrite pour quelqu'un qui ne lit pas le code.
Branche `genes-v4` (commit `7f85efb38`). Rien n'est modifié dans `ml/evolution`, `ml/bot`, `ml/reel`, `code/` : tout est dans ce dossier.

## 1. La question

Le lot « gènes v4 » a écrit une règle, `sortieOn` : sur une map à décor (grotte, ville, jade, canyon), quand la voiture va sortir par le bord,
si les yeux disent que « lâcher tout » (rien) et « revenir vers la route » (versRoute) finissent contre le décor, mais que « planer » (plane) se pose,
alors garder la nitro et planer. En 13 vraies courses, cette règle n'a **jamais** servi. Une autre, `rienOn` (lâcher le volant en vol quand c'est
plus droit), presque jamais. Avant de réécrire ces règles, on mesure : **que voient vraiment les yeux au moment où la voiture quitte la route,
et que devient le vol ?**

## 2. Ce que le pilote sait à l'instant de quitter la route (lu dans `modele.js` et `ml/bot/yeux.js`)

1. **`vue.tenue`** : les yeux font rouler la voiture 3 s « au mieux » (une conduite idéale qui tient la route) ; ils rendent « ça tient » ou « le bord dans `t` s, de ce côté ».
2. **`vue.sorties.bord`** n'existe que si cette tenue annonce le bord **à moins de 1,5 s** : trois rayons, `rien`, `versRoute`, `plane`, joués depuis le point de décollage simulé jusqu'au bout de l'air.
3. Chaque rayon rend une **issue** : pose (dans combien de temps, de quel angle, « propre » si l'angle fait moins de 55° et sur la dalle, ou dessous), lèvre, portail, choc (avec le décor touché), air ou fond (la chute), libre (encore en l'air à l'horizon).
4. Ces rayons partent de la route roulée « au mieux » et avec la nitro telle qu'elle est à cet instant, pas de la trajectoire que le pilote suit vraiment.
5. **c0025 ne lit pas ces trois rayons** : quand la route lâche, il vise le côté opposé, coupe la nitro (`m.nitro` faux dès que `tenue.tient` est faux), et c'est tout.
6. Les sorties à gauche et à droite (`sorties.gauche`, `.droite`, plus les rayons « viser ») n'existent que s'il les demande : pour un raccourci (sortie voulue).
7. La jauge (nitro + réserve), la vitesse, le dessous, la glisse, le rebond, la carte (à décor ou non) sont dans la vue.
8. Au décollage, la façon du vol est celle du raccourci engagé (vol **voulu**), sinon **`versRoute`** (vol **subi**).
9. En vol, le radar rejoue dix façons (tenu, rien, gauche, droite, cabre, pique, plane, planeCabre, versRoute, versRoutePlane ; plus viser et viserPlane s'il y a une cible) ; celles qui ne changent pas de commande vont jusqu'au bout de l'air.
10. La bascule : tant que la façon tenue se pose (ou lèvre, portail) on la garde ; sinon, après 0,35 s (ou si la mort est à moins d'1 s), on prend la façon dont le rayon vaut le plus de 10 points de mieux.

## 3. La mesure

- **Le pilote de diagnostic** (`pilote-diag.js`) : le texte du pilote né du génome c0025 (v:4, tout à la naissance, id `19e3767cc346`), plus quelques
  lignes qui recopient l'état interne du pilote (la façon tenue, le vol voulu, le raccourci engagé) dans un champ de l'ordre que l'hôte retire.
  L'hôte (`course-diag.js`) demande en plus aux yeux la loi « fidèle » et les deux lois de secours du lot v4, et les retire de la vue avant que le pilote la lise.
- **La preuve qu'il ne change rien** (`sorties/preuve.json`) : même course, au caractère près (empreinte de la course, des vues, des touches, palier,
  durée, cause, pièces), avec et sans diagnostic, sur **3 courses et 2 graines** : grotte tenue 3970400 (`c51ab14fd94f`), sans carte 3970400, jade tenue 3970437
  (180 s pleins, `d52937d0bf45`, 767 pièces) : **IDENTIQUE** trois fois.
- **Les courses** (`mesurer.js`) : grotte, ville, jade, canyon en **carte tenue** (la même map à chaque portail), 8 graines chacune, et 8 courses sans
  carte imposée ; 180 s au plus, 2 à la fois. Graines : celles de l'essai du banc v2, **3 963 000 + 37·i, i = 200 à 207** (3 970 400 à 3 970 659),
  hors des plages réservées. **40 courses, 66,7 min de course, 252 décollages** (185 subis, tous par le bord ; 67 voulus). 0 erreur, 0 panne.
  3 décollages de moins de 0,1 s (aucune vue en vol) échappent à la mesure (252 vus sur 255 dans les événements du jeu). Aucune seconde chance prise.
- **Les tableaux** (`analyser.js`, rejouable sans course depuis `sorties/lignes/*.jsonl.gz`) : `sorties/decollages.txt` et `.json`.

## 4. Ce qu'on a vu

### a. Où la voiture décolle et meurt (décollages subis par le bord)

| map | subis | morts | part | causes | mort après (médiane) |
|---|---|---|---|---|---|
| canyon | 33 | 10 | 30 % | paroi 8, canyon 2 | 0,15 s |
| grotte | 37 | 9 | 24 % | roche 9 | 0,55 s |
| ville | 23 | 3 | 13 % | tour 2, air 1 | 1,95 s |
| jade | 74 | 4 | 5 % | vide 2, air 1, pic 1 | 5,95 s |
| nuages, espace | 18 | 1 | | air 1 | |

Les sorties **voulues** tuent surtout en ville : 5 morts sur 22 raccourcis (ailleurs 1 sur 45). Au canyon et à la grotte, la mort arrive presque toujours
dans la seconde (14 morts sur 19).

**Le bord est vu très tard.** La première vue qui annonce le bord arrive 0,3 s avant le décollage en médiane (0,2 s pour 10 % des vols, 0,6 s pour 90 %).
À la dernière vue au sol, le bord est à 0,05 s. Les rayons du bord existent 0,3 s avant le décollage pour 130 vols sur 185, à 0,7 s pour **13**, à 1,2 s pour **1**.
La main met environ 0,2 s à obéir : **un ordre donné sur ces rayons arrive le plus souvent quand la voiture est déjà en l'air.**
Aucun des 252 décollages ne part avec la nitro demandée à la dernière vue au sol.

### b. Les yeux sont-ils fiables ?

Le rayon `versRoute` du bord (la façon que le pilote prend vraiment), comparé à ce qui est arrivé :

| annonce du rayon | vols | posés | ... sans aucune bascule en vol |
|---|---|---|---|
| pose propre | 93 | 87 (94 %) | 76 sur 80 (95 %) |
| pose de travers, lèvre, portail | 31 | 31 | 18 sur 18 |
| choc | 29 | 12 (41 %) | **1 sur 16** |
| air ou fond | 26 | 22 (85 %) | (toutes ont basculé) |

« Pose propre » est juste 19 fois sur 20 ; « choc », quand le pilote ne change rien, est juste 15 fois sur 16. Les 12 « chocs » qui se posent quand même
sont des vols où la bascule a trouvé mieux en l'air. « Air ou fond » est pessimiste : 22 sur 26 se posent après une bascule.
Seul `versRoute` peut être vérifié : le pilote ne décolle jamais en `rien` ni en `plane`, la justesse de ces deux rayons du bord **reste inconnue**.

### c. Les 27 décollages subis mortels : que disaient les rayons du bord ?

| rien | versRoute | plane | mortels | posés (pour comparer) |
|---|---|---|---|---|
| choc | choc | choc | **16** | 11 |
| choc | pose propre | choc | 6 | 32 |
| air | air | air | 3 | 16 |
| air, air, choc / air, choc, air | | | 2 | 3 |

**Dans aucun des 27, `rien` ou `plane` n'annonçait une pose ou la lèvre.** Il n'y avait pas d'issue annoncée que le pilote n'a pas prise.
Dans 6, `versRoute` annonçait une pose propre et la voiture est morte quand même (canyon 1, grotte 3, ville 2) : les yeux se trompaient.
En vol, un seul vol mortel a vu une autre façon longue promettre une pose alors que la sienne ne sauvait pas. La condition des secours (`secoursOn`)
est vraie dans les 27 ; un secours se posait proprement dans 1 (S1) et 4 (S2) d'entre eux. Elle est vraie aussi dans 45 vols qui se sont posés.

### d, e. Les règles candidates, comptées sur ces décollages

Garde commune (celle du contrat) : map à décor, bord à moins de 0,7 s, jauge > 0,5, ni dessous, ni glisse, ni rebond, pas de raccourci engagé.
120 des 167 décollages subis sur décor la passent (34 sont exclus par la jauge).

| règle | décollages touchés | par course de 180 s | mortels touchés | non mortels touchés |
|---|---|---|---|---|
| R1, le contrat (rien choc, versRoute choc, plane se pose) | 0 | 0 | 0 | 0 |
| R2, plane se pose propre et versRoute non | 2 (grotte) | 0,09 | 0 | 2 |
| R3, plane se pose et versRoute finit en choc | 0 | 0 | 0 | 0 |
| R4, le meilleur rayon du bord s'il bat versRoute | 4 (grotte 2, jade 2) | 0,18 | 0 | 4 |
| R5, la nitro seule au décollage | 120 | 5,4 (de 3,4 sans carte à 7,1 à la jade tenue) | 20 | 99 (dont 63 où versRoute annonçait déjà une pose propre) |

R5 partirait aussi sur 60 vues au sol où la voiture ne décolle finalement pas dans la demi-seconde (448 vues en tout). Sa première vue utile est à 0,3 s du
décollage en médiane (87 sur 120 à 0,25 s ou plus) : la nitro aurait le temps d'arriver dans environ trois cas sur quatre.

### f. `rienOn` : lâcher le volant en vol

879 vues où « rien » se pose proprement et la façon tenue se pose aussi. L'écart (angle de la façon tenue moins angle de « rien », en radians) : 5 % : −0,53 ;
25 % : −0,13 ; médiane 0 ; 75 % : +0,02 ; 95 % : +0,31. « Rien » est plus droit 255 fois, plus tordu 367 fois, pareil 257 fois.
Sous la garde de la règle (loi de retour tenue depuis plus de 0,35 s), 662 vues :

| `rienEcart` | vues qui passent | par course de 180 s | la règle entière partirait (deux vues de suite, une fois par vol) |
|---|---|---|---|
| 0,02 | 144 | 6,5 | 30 fois en 40 courses |
| 0,05 | 116 | 5,2 | 27 |
| 0,1 | 90 | 4,1 | 21 |
| 0,2 (la naissance) | 46 | 2,1 | 10 |

### g. Le compteur `loiFidele.suit`

3 163 vues en `versRoute` ; le compteur d'aujourd'hui en compte 1 979 (63 %). L'écart de volant entre la loi des yeux et celle du pilote : médiane 0,08 ;
75 % : 0,32 ; 90 % : 0,58. 1 216 vues à 0,005 près (l'arrondi), mais **1 905 (60 %) au-delà de 0,01**, 1 497 (47 %) au-delà de 0,1, 1 148 (36 %) au-delà de 0,2.
Le manche ne diffère que 3 fois. **L'explication « les yeux arrondissent au centième » ne tient pas** : l'arrondi seul ne fait jamais plus de 0,005.
Un seuil de 0,01 retire exactement l'arrondi et ne change presque rien (60 % au lieu de 63 %) : les deux lois diffèrent vraiment.

## 5. Ce qu'on peut conclure

- **La sortie préparée par les rayons du bord ne peut presque rien sauver chez c0025 tel qu'il est.** Aux 27 morts, aucun autre rayon du bord n'annonçait de salut.
  Les règles qui changent de façon (R1 à R4) touchent 0 à 4 décollages sur 185, tous non mortels. `sortieOn` est muet parce que la situation qu'il attend n'arrive pas.
- Le bord est vu trop tard (0,3 s avant, la main met 0,2 s) : la fenêtre `sortieT` de 0,7 s n'est presque jamais remplie.
- **La seule règle qui touche beaucoup de décollages est la nitro seule (R5)** : 5,4 par course de 180 s, dont 20 mortels sur 27. On ne sait pas si elle sauve ou tue : les rayons n'ont pas été joués avec la nitro allumée.
- Les yeux sont fiables sur la façon que le pilote joue (pose propre : 94 % de poses ; choc sans bascule : 15 morts sur 16). Les morts viennent de situations sans issue vue, plus que d'une issue ignorée.
- `rienOn` peut partir bien plus souvent avec un `rienEcart` plus petit (10 fois en 40 courses à 0,2 ; 30 à 0,02), mais « rien » est plus tordu que la façon tenue un peu plus souvent qu'il n'est plus droit.
- `loiFidele.suit` mesure de vraies différences (60 % des vues), pas un arrondi.

## 6. Ce qu'on ne peut pas conclure

- Rien sur le **palier** : aucune règle n'a été jouée ; les comptes disent combien de fois une règle agirait, pas ce qu'elle rapporterait.
- Ce qu'auraient donné `rien` ou `plane` au décollage : le pilote ne les prend jamais, leurs rayons du bord ne sont pas vérifiés.
- Un seul pilote (c0025), 8 graines par map, des maps tenues (la grotte trois fois de suite n'est pas une course tirée) ; 27 morts subies en tout : les parts par map sont des ordres de grandeur.
- Les rayons du bord partent d'une conduite « au mieux » et pas de la trajectoire du pilote ; cet écart n'est pas mesuré ici.

## 7. Les fichiers

| fichier | rôle |
|---|---|
| `pilote-diag.js` | le texte de c0025, avec ou sans les lignes de diagnostic |
| `course-diag.js` | une course (comme `ml/evolution/enfant.js`), qui garde chaque vue |
| `mesurer.js` | les 40 courses, 2 à la fois, la preuve, puis l'analyse (reprise : une course faite n'est pas rejouée) |
| `analyser.js` | les tableaux, sans course |
| `sorties/lignes/` | le résultat de chaque course (`.json`) et ses vues (`.jsonl.gz`, 2,3 Mo en tout) |
| `sorties/preuve.json` | avec et sans diagnostic : identique |
| `sorties/decollages.txt`, `.json` | les tableaux, et chaque décollage avec ses rayons |
| `sorties/mesure.log` | le journal des courses |

Refaire : `node mesurer.js` dans ce dossier (environ 25 min sur ce PC, 2 courses à la fois), ou `node analyser.js` pour les tableaux seuls.

## 8. Relecture (28/11/2026, un relecteur adverse)

Le relecteur a tout refait avec son propre script, `relecture.js` (sans reprendre le code d'`analyser.js`). Ce script trouve les vols dans les
**événements du jeu** (décollage, pose, mort, écrits par l'enregistreur du jeu), pas dans les trous entre les vues. Il ne joue aucune course :
il relit `sorties/lignes/*.jsonl.gz`. Ses tableaux sont dans `sorties/relecture.txt` et `sorties/relecture.json`.

### 8.1 La preuve : elle tient
- Le relecteur a rejoué lui-même une graine que la preuve n'avait pas : **canyon tenue 3970474**, avec et sans diagnostic (`sorties/relecture/`).
  Les deux courses ont les mêmes empreintes de course, de vues et de touches (`b616b900546f`, `a2615c2a90c1`, `73f1d1763677`), le même palier (5),
  la même durée (64,6 s), la même cause (paroi) et les mêmes pièces (233). Les vues gardées sont identiques, au caractère près, à celles de la mesure.
- **Une correction.** Sur les « 3 courses » de la preuve, deux sont une seule et même course : grotte tenue 3970400 et sans carte 3970400 ont la
  même empreinte, parce que la course sans carte tire elle aussi la grotte et meurt avant le premier portail. La preuve portait donc sur
  2 courses différentes. Avec celle du relecteur, on en a 3.

### 8.2 Les biais cherchés
- **Trois courses sont comptées deux fois.** Les courses sans carte 3970400, 3970585 et 3970659 commencent par la même map que la course tenue de
  la même graine (grotte, canyon, canyon) et meurent avant le premier portail. Ce sont donc les mêmes courses. 9 décollages et 3 morts sont comptés
  deux fois. Sans ces doublons, il reste **180 décollages subis distincts et 24 morts subies distinctes** (et non 185 et 27). Parmi ces 24 morts,
  13 sont choc/choc/choc (et non 16).
- **Le classement « subi par le bord » tient.** Les 255 décollages du jeu sont tous classés « bord » par le jeu : il n'y a ni tremplin ni saut
  sur ces maps. Les sorties voulues sont reconnues au raccourci engagé : on en trouve 67, autant que le mesureur.
  En revanche, **38 décollages subis sont des sorties en chaîne** : la voiture se pose puis repart moins de 0,5 s après. 6 des 27 morts en font partie.
- **Une mort mal attribuée.** En grotte tenue 3970511, la voiture se pose à 67,13 s, rebondit hors de la route à 67,20 s et meurt à 67,42 s.
  Entre ces deux instants, il n'y a aucune vue au sol. `analyser.js` compte donc un seul vol, de 64,5 s à la mort. Il l'attribue au décollage
  de 64,5 s et lui donne les rayons de ce décollage-là, qui annonçaient une pose propre. La vraie combinaison n'est pas connue, faute de vue.
  Résultat : les « 6 morts où versRoute annonçait une pose propre » sont en fait **5**.
- **Le temps de la dernière vue au sol est comparable d'un vol à l'autre.** Elle tombe entre 0 et 0,1 s avant le décollage (médiane 0,05 s,
  jamais plus de 0,1 s). La route lâche toujours à cette vue, avec `tn.t` à 0,05 s en médiane.
  Un piège du jeu : une vue prise à l'image même du décollage est déjà une vue en vol.
- **Les vols très courts gonflent la fiabilité des yeux.** 85 vols posés sur 160 durent moins de 0,5 s ou montent à moins de 3 m : ce sont des
  bosses au bord. Si l'on retire les bosses et les chaînes :
  - « pose propre » se pose 45 fois sur 50 (**90 %**, et non 94 %) ;
  - « choc » meurt 15 fois sur 20 (75 %, bascules comprises).
  « Choc sans bascule » reste juste 15 fois sur 16.
- **Les morts tardives.** Les morts au bout de 6 s (jade, nuages, ville « air ») sont des vols qui ne retrouvent jamais la route. Chacune est bien
  rattachée au décollage qui la précède (vérifié par les événements). Mais les rayons du bord, lus 0,05 s avant de partir, n'en disent presque rien.

### 8.3 Les tableaux refaits (b, c, e)
| affirmation du mesureur | recompté | verdict |
|---|---|---|
| b. versRoute « pose propre » : 87 posés sur 93 | 88 sur 93 (une mort ôtée : le rebond de grotte 3970511) ; 45 sur 50 hors bosses et chaînes | tient, en plus faible |
| b. « choc » sans bascule : 15 morts sur 16 | 15 sur 16 | tient |
| b. « air ou fond » : 22 posés sur 26 | 22 sur 26 | tient |
| c. choc/choc/choc 16, choc/pose/choc 6, air×3 3 | 16, **5**, 3 (sans doublons : 13, 5, 3) ; 1 mort sans vue au sol | corrigé |
| c. aucun mortel où rien ou plane sauvait | 0 sur 24 à la dernière vue. Aux vues plus anciennes (jusqu'à 1 s avant), 2 morts avaient vu une issue, mais par les trois façons à la fois (canyon 3970548 0,25 s avant : pose propre, pose propre, lèvre ; grotte 3970437 0,42 s avant) : la situation s'est dégradée, il n'y avait pas d'issue ignorée | tient |
| e. R1 0, R2 2, R3 0, R4 4 | 0, 2, 0, 4 (les 4 de R4 se posent) | tient |
| e. R5 : 120 décollages, 20 mortels, 99 non mortels | 121, 19, 101 ; sans doublons **115, 17, 97**, 5,2 par course de 180 s | tient |
| a. mort après (médiane) : grotte 0,55 s | **0,26 s** d'après les événements ; canyon 0,24 s | corrigé |
| f. `rienEcart` 0,2 : « 46 vues, 2,1 par course » | ce sont des vues, pas des déclenchements : la règle part **10 fois en 40 courses (0,48 par course de 180 s)**. De plus, 0,02 et 0,05 sont hors des bornes du gène (0,1 à 0,4) | précisé |
| g. loiFidele.suit : 63 % ; 60 % au-delà de 0,01 | 63 % ; 60 % (35 vues avec une figure en cours mises à part) | tient |
| aucun décollage avec la nitro demandée à la dernière vue au sol | 0 sur 253 | tient |

### 8.4 Ce que les yeux auraient changé
On regarde les 115 décollages distincts qui passent la garde, dont 17 mortels.
- **Au bord.** `plane` (planer, nitro dès l'envol) finit contre le décor dans **57 vols posés où `versRoute` se posait**, et il ne sauve aucun
  des 17 mortels. Le vol « plane » du contrat serait donc plus dangereux que ce que fait le pilote aujourd'hui.
- **À la première vue en vol** (0,05 à 0,1 s plus tard), on compare `versRoutePlane` (la même loi que `versRoute`, nitro tenue) à `versRoute` :
  - il sauve **1 mortel** que `versRoute` ne sauvait pas ;
  - il en perd 2 posés ;
  - il est pareil dans 89 cas.
- **En vol, sur tout le vol**, un rayon (l'un des dix, ou un secours) se pose proprement alors que la façon tenue ne sauve pas dans 4 morts sur 27.
  La même chose arrive dans 25 à 41 vols qui se sont posés.

### 8.5 La proposition
**Pour la sortie préparée, c'est une impasse : aucune règle fondée sur les rayons du bord ne peut sauver une part qui compte des morts de c0025.**
- Les yeux ne voient aucune issue à 24 morts distinctes sur 24, à la dernière vue au sol.
- Le bord n'est annoncé que 0,28 s avant le décollage (médiane), alors que la main met 0,2 s à obéir.
- La seule commande que les rayons du bord ne jouent pas, la nitro dans la loi « vers la route », change une mort sur 17 d'après les yeux.
- Les morts du canyon et de la grotte sont décidées avant que le bord soit annoncé : 13 choc/choc/choc dès la première annonce. Le levier est
  donc au sol, avant le bord (la ligne, la marge, la vitesse sur les maps à décor), pas à la sortie.

**Ce qu'il faut faire :**
1. Écrire l'impasse : « la sortie préparée par les rayons du bord est muette par construction ».
2. **Laisser `sortieOn` éteint et ne pas le mettre au banc.**

**Si l'on tient à un gène qui ne soit pas muet**, voici la seule réécriture qui ne casse rien d'après les yeux, le dernier recours nitro.

*En une phrase :* sur une map à décor, quand la route lâche dans moins de `sortieT` s, que la jauge dépasse `sortieJauge`, et que le rayon
`versRoute` du bord finit en choc, on garde la nitro jusqu'au décollage et le vol part en `versRoutePlane` au lieu de `versRoute`.

*En pseudo-code (noms de `modele.js`) :*
```
au sol, a la place du bloc § 3.1 :
  if(R.sortieOn>0){ let ok=false;
    if(decor && !m.sortie && lache && !v.dessous && !v.glisse && !v.rebond && tn.t!=null && tn.t<R.sortieT && jauge>R.sortieJauge){
      const B=v.sorties&&v.sorties.bord, Y=B&&Array.isArray(B.rayons)?B.rayons:null, vr=Y&&Y.find(r=>r&&r.m==='versRoute');
      ok=!!(vr && vr.issue==='choc'); }
    if(ok){ m.nitro=true; m.planeBord=v.t; } else m.planeBord=null; }
en vol, au decollage (enVol, !m.facon) :
  if(R.sortieOn>0){ if(!m.voulu && m.planeBord!=null && v.t-m.planeBord<.35){ m.facon='versRoutePlane'; m.choix=true; } m.planeBord=null; }
```
(Les compteurs `sortieOn`, `sortieOn.vol` et `sortieOn.pose` restent aux mêmes places.)

*Sur ces données* (sans doublons) :
- elle partirait sur **19 décollages**, soit **0,85 par course de 180 s** : 11 mortels et 8 qui se sont posés ;
- elle partirait aussi sur 74 vues au sol, dont 3 sans décollage dans les 0,55 s ;
- elle n'est pas muette, parce qu'elle ne demande qu'une chose que les yeux voient souvent : `versRoute` du bord finit en choc
  (24 vols subis distincts sur 180) ;
- **le risque est faible** : les vols touchés sont ceux que les yeux donnent déjà pour morts (« choc » sans bascule : juste 15 fois sur 16) ;
- **le gain attendu est minuscule** : à la première vue en vol, `versRoutePlane` se pose dans **1 seul** des 11 mortels, et dans 2 des 8 posés
  où `versRoute` ne se posait pas.

*Ce qu'on ne sait pas :*
- Les rayons du bord ne jouent pas `versRoutePlane`, et les rayons en vol partent avec la nitro déjà coupée. La nitro tenue dès l'envol n'est donc
  jouée par aucun rayon.
- Une règle qui change un décollage mortel ne le sauve pas forcément.
- Le banc ne voit qu'environ 1,1 palier à 96 graines. Un gain de l'ordre d'une mort sur 24 ne s'y verra pas. Seul le banc le dirait, et il ne le peut pas ici.

**`rienEcart` (naissance) : les chiffres ne soutiennent aucun changement.**
- Sous la garde, « rien » est plus droit que la façon tenue 162 fois, et plus tordu 297 fois. Rien ne dit qu'il pose mieux.
- La règle n'est pas muette : à 0,2, elle part 10 fois en 40 courses (0,48 par course de 180 s).
- À 0,1, la borne basse du gène, elle partirait 17 fois (0,81 par course de 180 s). C'est seulement utile pour qu'un bras du banc la voie plus
  souvent. Attention : changer une naissance peut changer l'identifiant des génomes, à vérifier avant.

**Le compteur `loiFidele.suit` : un seuil de 0,01 sur le volant (le manche toujours exact) se justifie.** Il ne retire que les écarts d'arrondi :
on passe de 63 % des vues comptées à 60 %. Les deux lois diffèrent vraiment : la médiane de l'écart est de 0,08.

### 8.6 Les fichiers de la relecture
| fichier | rôle |
|---|---|
| `relecture.js` | le recomptage indépendant, sans course (`node relecture.js`) |
| `sorties/relecture.txt`, `.json` | ses tableaux et chaque décollage (événements) |
| `sorties/relecture/canyon-3970474-diag0.json`, `-diag1.json`, `-diag1.jsonl.gz` | la preuve rejouée par le relecteur |

## 9. Ce que l'on en fait (28/11/2026, décision de la session principale, appliquée dans `ml/evolution`)

**L'impasse est écrite** : la sortie préparée par les rayons du bord est muette par construction chez c0025. Les yeux ne voient aucune issue aux 24 morts
subies distinctes ; le bord n'est annoncé que 0,28 s avant le décollage (médiane), quand la main met 0,2 s à obéir ; et partir en « plane » au bord se
serait crashé dans 57 vols qui se sont posés. Partir en « plane » n'est donc pas seulement inutile : ce serait nuisible.

**Ce qui reste vrai et mesurable** : aucun des 253 décollages ne part nitro allumée sur ces maps, alors que le banc des gènes
(`ml/ecurie/etude/banc-des-genes/`, branche `bots-ecurie`) montre que la nitro au décollage est la seconde source d'écart aux vrais joueurs (15 % des vols
chez le pilote, 63 % chez les joueurs) et que `bordOn` (la même chose sur les maps **sans** décor) rapproche sûrement des joueurs sans perdre de palier.

**La règle réécrite.** `sortieOn` garde son nom, ses bornes et sa naissance (éteint ; `sortieT` 0,7 dans [0,3 ; 1,2], `sortieJauge` 0,5 dans [0,2 ; 1]) :
aucun identifiant de génome ne change (c0025 `19e3767cc346`, c0101 `f70ddcb5a565`). Elle devient **« la nitro au décollage sur les maps à décor »**,
le pendant exact de `bordOn` : sur une map à décor, quand la route lâche dans moins de `sortieT` s, que la caisse n'est ni dessous, ni en glisse, ni en
rebond, qu'aucun raccourci n'est engagé et que la jauge dépasse `sortieJauge`, le pilote garde la nitro jusqu'au décollage. Il ne lit plus **aucun rayon
du bord** et ne change plus **la façon du vol** : le vol part en « vers la route », comme sans le gène. Les trois compteurs gardent leurs noms :
`sortieOn` = la règle a allumé la nitro au sol (à chaque vue où elle agit, comme `bordOn`) ; `sortieOn.vol` = un vol subi parti moins de 0,35 s après
l'annonce ; `sortieOn.pose` = la première vue au sol après ce vol, sans trou. `(vol − pose) / vol` est la part de ces décollages qui finissent mal :
une mesure secondaire, jamais un critère. Le détail : `ml/evolution/notes/genes-v4.md`, l'amendement du 28/11 (il remplace le § 3.1).

**Ce n'est pas la proposition du relecteur (§ 8.5), et pourquoi.** Le relecteur proposait de laisser `sortieOn` éteint, ou, à défaut, un dernier recours
(`versRoute` du bord au choc → vol en `versRoutePlane`), qui ne toucherait que 0,85 décollage par course pour un gain « minuscule ». La décision prend une
autre voie : la règle **R5** du § 4 e (la nitro seule, la façon ne change pas), la seule qui touche beaucoup de décollages : **115 décollages subis distincts
sur 180, 5,2 par course de 180 s, dont 17 des 24 mortels** (§ 8.3 ; `sorties/relecture.txt`, ligne « R5 (distincts) »). Son but premier n'est pas de sauver des
morts (personne ne sait si elle en sauve ou en ajoute) : c'est l'écart aux joueurs (63 vols sur 100 nitro allumée chez eux, 0 sur 253 ici : `sorties/relecture.json`, champ `S.nitro` des décollages),
que `bordOn` a déjà réduit sur les maps sans décor.

**Ce qu'on ne sait pas.** La nitro tenue dès l'envol n'est jouée par aucun rayon du bord, et les rayons en vol partent avec la nitro déjà coupée (§ 8.5) :
personne n'a vu ce que devient le vol. Sur une map à décor, la nitro peut aussi **tuer plus vite** : à la grotte et au canyon, la paroi est à quelques
mètres, et un vol qui part plus vite et plus loin peut la toucher plus tôt. Seul le banc le dira (le palier, la note, et les morts « décor » :
roche, paroi, pic), sur des graines neuves.

**Les deux autres points de la mesure.** `rienOn` et `rienEcart` ne changent pas (« rien » est plus souvent plus tordu que plus droit ; la règle part
0,48 fois par course de 180 s : c'est le banc qui dira). Le compteur `loiFidele.suit` ne compte plus que si le volant suivi s'écarte de plus de 0,01 de
celui de « vers la route », ou si le manche diffère : le seuil retire l'arrondi des yeux (jamais plus de 0,005) et rien d'autre (63 % des vues → 60 %).

**Ce qui a été contrôlé** (`ml/evolution/notes/LIVRAISON-GENES-V4.md`, § 2 quater) : éteinte, la règle réécrite ne change aucune décision (510 300
décisions sur des vues de vraies courses) ; allumée, elle agit dans 7 de 8 courses de 120 s, sans erreur ni panne, et la part des vols partis nitro
allumée monte là où elle est mesurée (par exemple jade 0,17 → 0,63). Huit courses ne disent rien du palier.

**La piste notée pour plus tard** (pas dans ce lot) : le levier est **au sol, avant le bord**. Les morts du canyon et de la grotte sont décidées avant que
le bord soit annoncé (13 choc / choc / choc dès la première annonce) : la ligne, la marge, la vitesse sur les maps à décor. Et les raccourcis voulus tuent
en ville (5 morts sur 22, contre 1 sur 45 ailleurs).
