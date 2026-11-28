# Les mesures A et C de l'étude « avant le bord » : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu en texte libre ; l'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l'agent. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `avant-le-bord-mesures` (wf_a240473e-422), lancée par la session principale (Claude Fable).
- Agents : 2, tous du modèle claude-opus-5-5.
- Durée : 48 min ; jetons consommés par les agents : 549 424 (0,55 millions) ; appels d'outils : 121.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. mesureur : rejoue les 40 courses en gardant le volant, le virage et la vitesse, et joue 16 courses de ville neuves (phase « Mesurer »)
2. relecteur et rédacteur : refait les comptes avec son propre code et écrit le résultat dans l'étude (phase « Relire »)

## 1. mesurer A et C

*Rôle : mesureur : rejoue les 40 courses en gardant le volant, le virage et la vitesse, et joue 16 courses de ville neuves. Phase : Mesurer.*

RAPPORT DU MESUREUR, « avant le bord » (28/11/2026). Aucun fichier hors de ml/ecurie/etude/avant-le-bord/mesures/ n'a été modifié, rien n'a été commité, et jamais plus de 2 courses n'ont tourné à la fois.

##### En bref

- **La preuve tient.** Les 40 courses rejouées sont identiques à la mesure d'avant (40 sur 40), et le diagnostic ne change aucune course (4 sur 4).
- **Le palier monte avec les pièces ramassées**, donc avec la distance. Il ne dépend ni du temps ni de l'argent.
- **Vitesse ou palier : le signal de vitesse vient du palier et du pouvoir VITESSE ×2.** À palier égal, la vitesse ne sépare pas de façon prouvée.
- **La vitesse sûre du virage ne sépare pas.** La caisse ne la dépasse presque jamais.
- **Le volant, le frein et le virage ne séparent pas** les morts des posés.
- **La prédiction de la ville est RÉFUTÉE** sur les 16 courses neuves (rapport 1,08).

##### 0. Le palier (lu dans le code, aucune course)

**Comment il monte.**
- Le palier, c'est `engTier`. `addCoins` le monte dès que `coinsGot` passe un seuil de `ENGINE_TIERS` (`code/economie/achat-carte-moteur.js` l.231-243, `engineFor` ; seuils dans `code/gameplay/pickups-fruits.js` l.557 et suivantes).
- Une pièce ramassée donne 1 (`code/gameplay/ramassage.js` l.174). Une figure réussie en donne 2 à 18 (`figures-route.js` l.64, `demi-tour.js` l.574).
- Les pièces sont posées le long de la piste, à une abscisse `s` (`pouvoirs-grisants.js` l.455, `place(sp,…)`). Leurs motifs s'allongent quand le moteur monte (l.443).
- Le bot compte de la même façon : `palierDe(pieces)` (`ml/bot/mesures.js` l.10-17).
- Le palier monte donc avec la **distance parcourue et les pièces prises**. Il ne dépend ni du temps ni de l'argent.
- Une seule perte possible : la seconde chance retire un palier (`seconde-chance.js` l.188).

**Ce que le palier change à la vitesse.**
- `maxSp` et `acc9` valent `maxKmh/3.6 × lateMul × push` du palier (`code/moteur/boucle-1.js` l.181-183).
- La poussée de la nitro vaut 30 × `push` (`boucle-2-conduite.js` l.45).
- `lateMul` = `engLate(engTier)` : +3,5 % par palier au-delà du 8e, plafonné à +50 % (`camera.js` l.316-317).
- Les virages de chaque piste grandissent avec le palier + 2 au moment où elle est construite (`lvPiste`, `camera.js` l.321).
- **`vitMult` n'est pas le palier** : c'est `1 + pwrSpdK`, le pouvoir VITESSE ×2, plafonné à 2,6 (`portail-passage.js` l.70, `boucle-1.js` l.190). Il ne vaut pas 1 dans 211 vues au sol sur 31 923.

**Les deux questions.**
- **Un pilote plus rapide monte-t-il plus tôt ?** Oui, en temps : plus de km par seconde, donc plus de pièces par seconde. Au km, non.
- **Couper la nitro fait-il perdre du palier mécaniquement ?** Non. Mais à durée fixe (180 s ici, 900 s pour F), un pilote plus lent finit plus bas, sauf s'il survit plus longtemps.
- Sur les traces, la vitesse monte de 4 à 9 m/s par palier selon la carte (`analyse.txt`, a).

##### 1. L'outil et la preuve

**Ce que garde l'outil.** C'est une copie de `course-diag.js` et `pilote-diag.js` dans `mesures/`. À chaque vue au sol, il garde :
- le volant appliqué, `vue.volant` (le `steer` du jeu) ;
- le volant demandé (voir plus bas) ;
- la nitro demandée (`O.nitro`) et le manche ;
- `lacetRoute`, `lacetMax`, `vitMult` (noms exacts de `yeux.js`) ;
- le virage des yeux (`vSure`, `vSureDrift`, `rayon`, `angle`, `marge` = vSure − v, `braquage`), `rayonMin`, et le virage à 8 distances devant ;
- `tenue`, `lat`, la vitesse, `s` ;
- le palier complet (n, élan, vmax, poussée), les pièces, les pouvoirs, le drift, l'attente de la main ;
- l'image. L'en-tête garde aussi le journal des touches, d'où la flèche tenue à chaque vue.

**Un champ n'existe pas : le volant demandé.** Le pilote ne donne qu'une `ligne` : seules 740 vues sur 31 923 portent un volant chiffré. Je le recalcule avec la loi de `doigts.js` (`traduire`) sur la vue de la décision. C'est une approximation : la main à profil le recalcule à chaque image sur un état retardé (`doigts.js` l.401).

**Une différence avec l'outil d'avant :** l'hôte ne demande plus les 3 lois « retour » en plus.

**La preuve** (`sorties/preuve.json`).
- **Avec et sans diagnostic : 4 sur 4 IDENTIQUES** (canyon 3970511, grotte 3970548, ville 3970585, jade 3970622). Comparés : empreinte de course, de vues, de touches, palier, durée, cause, pièces.
- **Contre la mesure d'avant : 40 sur 40 IDENTIQUES**, sur les mêmes champs.
- Le texte du pilote a pourtant changé (`modele.js` réécrit au commit d30db9519 ; sha 3c12b7c0… au lieu de 59d824ad…). La conduite n'a pas changé.

##### Effectifs

- 37 courses distinctes (les doublons libre 3970400, 3970585 et 3970659 sont retirés).
- 158 décollages subis sur décor avec une vue au sol juste avant : **23 morts, 135 posés**. Un vol coupé par la limite de temps est retiré.
- Par carte (morts / posés) : canyon 8/18, grotte 8/28, jade 4/69, ville 3/20.
- À 1,5 s avant le décollage, il y a une vue au sol pour 18 morts et 93 posés.

##### a. Vitesse ou palier

Rang moyen des morts parmi les posés de leur strate (0,5 = hasard) ; p par permutation à l'intérieur des strates.

| à 1,5 s avant | rang | p | effectifs (morts / posés) |
|---|---|---|---|
| vitesse, à carte égale | 0,80 | 0,0003 | 18 / 93 |
| palier, à carte égale | 0,71 | 0,003 | 18 / 93 |
| **vitesse, à carte ET palier égaux** | 0,67 | **0,09** | 18 / 37, 12 strates |
| résidu de la vitesse sur le palier | 0,67 | 0,018 | 18 / 93 |
| v / vmax du palier | 0,64 | 0,033 | 18 / 93 |
| **v / vSure** | 0,59 | **0,15** | 15 / 87 |
| besoin de volant (\|lacetRoute\| / lacetMax) | 0,42 | 0,84 | 18 / 93 |

**À carte et palier égaux, la vitesse ne sépare pas de façon prouvée** :
- p = 0,12 à 2 s, 0,09 à 1,5 s, 0,14 à 1 s ;
- seulement p = 0,023 à 0,6 s, sur 14 morts et 49 posés.

**Une fois les courses au pouvoir VITESSE retirées** (19 morts, 129 posés), p vaut 0,16 à 0,34 (`complements.txt`). Le signal de vitesse vient donc surtout du palier et du pouvoir VITESSE.

**La vitesse sûre ne sépare pas.** C'était la grandeur nommée par l'étude :
- sur 24 952 vues au sol avec un virage proche, v / vSure vaut 0,27 en médiane et 0,72 à 99 % ; il dépasse 1 dans 39 vues seulement ;
- **un seul mort** passe vSure dans les 3 s avant ;
- la médiane à 1,5 s vaut 0,38 chez les morts et 0,33 chez les posés ;
- le besoin de volant atteint 1 dans 16 vues sur 29 156 : même au plus serré, la caisse peut suivre la route.

Les morts ne sont pas des virages pris au-dessus de la vitesse sûre.

##### b. Le volant, dans la dernière seconde

Comptes en morts / posés. Signe : vers l'intérieur = à l'opposé du bord de sortie.

- **Volant appliqué, à la dernière vue au sol :**
  - à fond vers l'intérieur : 12 / 76 ;
  - vers l'intérieur, pas à fond : 7 / 27 ;
  - ne braque pas : 3 / 20 ;
  - vers le bord : 1 / 12.
- **Volant appliqué, 0,5 à 1 s avant :** vers le bord 11 à 12 sur 23 morts, contre 49 à 52 posés.
- **Volant demandé, à la dernière vue :** à fond vers l'intérieur 16 / 98.
- **Flèche tenue à la dernière vue :** vers l'intérieur 18 / 98.

Morts et posés ont le même profil. Dans la moitié des cas, la caisse est emportée malgré un volant à fond vers l'intérieur. **Le volant ne sépare pas.**

##### c. Le frein

- Dans les 2 s avant les décollages mortels, 180 vues sur 384 (47 %) ont un volant appliqué sous 0,35. Chez les posés : 888 sur 2 031 (44 %).
- **6 morts sur 19** ont au moins 0,5 s continues de frein possible entre 2 s et 0,6 s avant. Chez les posés : 33 sur 104.
- Plus longue suite de frein possible, mort par mort, en secondes (une valeur par mort ; 0 pour les morts sans vue au sol entre 2 s et 0,6 s) : 0 / 0,9 / 0,3 / 0,2 / 0,2 / 0,4 / 0,4 / 0 / 0,5 / 0,9 / 0,2 / 0,9 / 0,3 / 0,3 / 0,1 / 0 / 0 / 0,2 / 0 / 0,4 / 0,2 / 0,7 / 1,2.
- Le pilote ne demande jamais le frein : manche au sol 0 fois.

##### d. Le virage

- **Entrée de virage** (courbure ×1,5 entre 1,5 s avant et la dernière demi-seconde) : 7 morts sur 18, contre 24 posés sur 93. Fisher p = 0,20.
- Courbure médiane chez les morts : 1,15 puis 2,90 par km. Chez les posés : 3,86 puis 2,63.
- **Côté de sortie :**

| | extérieur | intérieur | route droite |
|---|---|---|---|
| morts | 7 | 3 | 8 |
| posés | 36 | 19 | 38 |

Pas de séparation.

##### e. La ville (`ville.txt` ; prédiction écrite avant dans `prediction-ville.md`)

**Les 16 courses neuves seules : RÉFUTÉE.** Côté bordé, 8 morts sur 34 sorties ; côté ouvert, 5 morts sur 23. Rapport 1,08, Fisher p = 0,57. Les mi-bordées font 0 mort sur 7.

| 16 courses neuves | bordé | ouvert | jugement |
|---|---|---|---|
| vrais raccourcis | 6 / 28 | 4 / 17 | RÉFUTÉE (rapport 0,91) |
| sorties du dessous | 2 / 6 | 1 / 6 | INDÉCISE |

- **Les 8 courses d'avant, rejouées :** on retrouve exactement l'ancien compte, 5/11 contre 0/11.
- **L'ensemble** (qui ne juge rien) : 13/45 contre 5/34, rapport 1,96, p = 0,11 : INDÉCISE.

##### f. Ce que personne n'avait demandé

**1. Le pouvoir VITESSE ×2 tue.** Au moins une vue des 2 s avant le décollage a `vitMult` > 1 :
- pour 4 morts sur 23, contre 6 posés sur 135 (p = 0,04, trouvé après coup) ;
- les 4 morts : grotte 3970400 (119 → 243 m/s en 0,5 s), grotte 3970437, jade 3970585 (370 m/s), ville 3970511 ;
- le pilote vise tous les orbes, celui de vitesse compris (`modele.js` l.150-154).

**2. Le balancement.** Entre 3 s et 0,6 s avant, la caisse parcourt la route d'un bord à l'autre (écart latéral). À carte et palier égaux : rang 0,78, p = 0,008 (18 morts / 37 posés). C'est une grandeur trouvée en fouillant, à confirmer. La trace de grotte 3970400 montre une oscillation qui grandit avec le retard de la main.

**3. En ville, presque toutes les morts sont choisies.** Sur les 16 courses neuves, 13 morts sur 15 sont des sorties voulues : 13 sorties voulues sur 64 tuent (20 %), quel que soit le côté. Le levier est `raccCartes_ville` = 0 (la greffe en cours sur le Ryzen).

##### Ce que cela change

- **`plafOn` (ralentir) :** n'est pas soutenu. La vitesse au-delà du palier n'est pas prouvée nocive, et la vitesse sûre n'est jamais dépassée. Ralentir coûte aussi du palier par seconde. Seule la vague B (`nitroDecor` à 0 / 0,5 / 1,5) peut encore le trancher.
- **Le frein :** n'est pas un levier. Des fenêtres de frein existent, mais aussi souvent avant un posé (33/104) qu'avant une mort (6/19) : une règle ne saurait pas viser.
- **`ouvertOn` :** réfuté sur des graines neuves. À abandonner.
- **L'idée inverse (aller plus vite sur décor) :** rien ne montre que la vitesse propre tue, hors pouvoir ×2. Le bras `nitroDecor` 1,5 vaut d'être joué. Une piste non mesurée, qui changerait l'époque : ne pas viser l'orbe VITESSE sur décor.

##### Ce que je n'ai pas pu savoir

- Le volant demandé exact que la main calcule à chaque image : je n'ai qu'une approximation à la vue de la décision.
- Ce que ferait un vrai freinage : il n'a jamais été joué.
- Si le balancement est une cause ou un symptôme.
- Le modèle de puissance de la ville est grossier.

##### Fichiers (tous dans C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/avant-le-bord/mesures/)

- Outils : `course-diag.js`, `pilote-diag.js`, `mesurer.js`, `analyser.js`, `complements.js`, `ville.js`, `puissance-ville.js`
- `prediction-ville.md`
- Dans `sorties/` :
  - `preuve.json`
  - `analyse.txt`, `analyse.json`
  - `complements.txt`
  - `ville.txt`, `ville.json`
  - `puissance-ville.txt`
  - les journaux `mesure-anciennes.log`, `mesure-preuve.log`, `mesure-ville.log`
  - `lignes/` : 60 courses, en `.json` et `.jsonl.gz`

## 2. relire et ecrire

*Rôle : relecteur et rédacteur : refait les comptes avec son propre code et écrit le résultat dans l'étude. Phase : Relire.*

RELECTURE ADVERSE ET RÉDACTION, mesures A et C (« avant le bord », 28/11/2026). Aucune course jouée par moi. Rien n'a été modifié hors de `ml/ecurie/etude/avant-le-bord/` : j'ai seulement ajouté `mesures/relecteur/` et modifié le LISEZ-MOI. Rien n'est commité. Le § 9 n'a pas été touché.

##### Ce que j'ai écrit
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md` :
  - le point 8 de « En une minute » est réécrit ;
  - le § 10 reçoit un second tableau, pour les fichiers de `mesures/` ;
  - un nouveau § 11, « Les mesures A et C (28/11/2026) », de 11.1 à 11.11, qui finit par « Ce que la session principale doit trancher ».
- `.../mesures/relecteur/preuve.js` → `relecteur/sorties/preuve-relue.txt`
- `.../mesures/relecteur/recompte.js` → `relecteur/sorties/recompte.txt`, `recompte.json`
  - Ce code est écrit à part : il ne reprend ni `analyser.js` ni `volsDe`.
  - Il choisit autrement la vue « à x s avant » : la dernière vue au sol avant ce recul, et non la plus proche.

##### Ce qui tient
- **La preuve, et plus fort que ce qu'a montré le mesureur.**
  - Les 40 résultats sont identiques sur tous leurs champs (29, le journal ev compris).
  - **Les 40 014 vues sont identiques une par une**, sur tous les champs de l'ancien diagnostic (hors les rayons « retour », que l'ancien hôte demandait en plus).
  - Avec et sans diagnostic : 4 courses sur 4 identiques.
  - Les 56 fichiers `.json` collent à l'en-tête de leur trace.
  - Les traces d'avant sont celles commitées en d30db9519, sans changement depuis.
- **La prédiction de la ville a bien été écrite avant.**
  - `prediction-ville.md` a été créé et modifié une seule fois, à 16:00:41. Le premier résultat d'une ville neuve date de 16:25:11.
  - Limite : seule la date du disque le prouve, le fichier n'est pas commité.
  - Les 16 graines n'apparaissent nulle part ailleurs dans `ml/`.
- **Les effectifs** : 37 courses, 158 décollages subis sur décor, **23 morts et 135 posés**. Par carte (morts / posés) : canyon 8/18, grotte 8/28, jade 4/69, ville 3/20. Un vol coupé par la fin est retiré.
- **Le palier vient des pièces** (lignes du code relues) :
  - `addCoins`, l.236-241 ; une pièce = 1 (`ramassage` l.174) ; une figure = 2 à 18 ;
  - perte seulement par la seconde chance (l.188) ; `vitMult` est le pouvoir ×2 (`portail-passage` l.70) ;
  - les autres appels à `addCoins` sont des outils de test.
- **v / vSure** :
  - 39 vues au-dessus de vSure sur 24 952 ;
  - **1 mort sur 23** la dépasse (canyon 3970585, 1,05 à 0,6 s avant) ;
  - à 1,5 s, rang 0,59, p 0,15 (15 morts / 87 posés).
- **Le volant** : recompté à l'identique.
  - À la dernière vue, à fond vers l'intérieur : 12 morts sur 23, 76 posés sur 135 (p 0,88).
  - 1 s avant, vers le bord : 12 sur 19 contre 49 sur 95.
  - Le signe est vérifié (`doigts.js` l.31-32 et l.203).
- **Le frein** : recompté à l'identique.
  - Volant sous 0,35 dans les 2 s avant : 180 vues sur 384 chez les morts, 888 sur 2 031 chez les posés.
  - Au moins 0,5 s de suite : 6 morts sur 19, 33 posés sur 104. Au-dessus de 120 m/s : 5 contre 29.
  - Aucun manche demandé.
- **La ville** : recodée depuis le seul texte de la prédiction, mêmes nombres.
  - 16 courses neuves : bordé 8 morts sur 34, ouvert 5 sur 23. **RÉFUTÉE** (rapport 1,08, p 0,57).
  - Les 8 courses d'avant redonnent 5/11 contre 0/11.
  - L'ensemble des 24 courses : 13/45 contre 5/34, p 0,11.
  - Les 16 neuves font 15 morts, dont 13 sur une sortie voulue (13 sur 64 sorties voulues).
- **Aucun doublon caché** (0 sur 15). Toutes les morts ont une vue au sol à 0,15 s avant.

##### Ce qui tombe ou est corrigé
- **« Le signal de vitesse vient du palier et du pouvoir VITESSE » : ce n'est pas montré.**
  - À carte et palier égaux (1,5 s), la vitesse a un rang de 0,67, p 0,09 (18 morts / 37 posés).
  - Mais à carte et tranche de 30 s de course égales, c'est **le palier qui ne sépare plus** : rang 0,43 à 0,54 (p 0,42 à 1,5 s, 13 morts / 40 posés).
  - La vitesse garde alors un rang de 0,61 à 0,68 (p 0,06 à 0,17).
  - Ma version : vitesse et palier restent **non séparés**.
- **Les 23 morts sont toutes le dernier vol de leur course.** Comparer une mort aux posés de sa propre course est donc biaisé d'avance. Comparer à toute la carte reste valable si le risque par décollage est constant.
- **Le balancement (p 0,008) n'est pas prouvé.**
  - C'est la meilleure de 3 façons de le mesurer (les autres : p 0,07 et 0,41).
  - Sur les 27 grandeurs du mesureur autres que la vitesse et le palier seuls, le hasard trouve un aussi bon séparateur **4 à 6 fois sur 100** (deux graines de tirage).
  - La phrase sur l'oscillation de grotte 3970400 n'a aucun fichier.
- **Le pouvoir VITESSE** : 4 morts sur 23 contre 6 posés sur 135, p 0,04. Trouvé après coup, sur environ 80 découpages regardés : non prouvé.
- **Deux corrections de détail** :
  - `acc9` vaut accel × late × (1 + 0,6 × (push − 1)), pas « × push » ;
  - grotte 3970400 va de 119 à 226 m/s entre 1,5 s et 1 s avant (244 m/s à la dernière vue), pas « 119 → 243 m/s en 0,5 s ».

##### Ce que je n'ai pas recompté ou pas pu savoir
- Non recomptés : la flèche tenue (18 / 98) et le § d (le virage). Ce sont les chiffres du mesureur seul.
- Le volant demandé reste une approximation.
- Aucun vrai freinage n'a été joué.
- Le test de famille mélange les morts dans chaque carte : pour les grandeurs prises à palier égal, ce n'est qu'une approximation du hasard.

##### Ce que la session principale doit trancher (tel qu'écrit à la fin du § 11)
1. `ouvertOn` : la prédiction écrite avant est réfutée (8 morts sur 34 sorties bordées, 5 sur 23 ouvertes). L'abandonner, ou payer une autre mesure ?
2. `plafOn` : rien ne le soutient (vitesse sûre presque jamais dépassée, vitesse non séparée du palier). L'abandonner tout de suite, ou attendre la vague B ?
3. La vague B : garder les trois bras `nitroDecor` (0 ; 0,5 ; 1,5), ou seulement ceux qui rapprochent des joueurs ?
4. Le pouvoir VITESSE et le balancement, trouvés en fouillant : les confirmer sur des courses neuves, prédiction écrite avant, ou les laisser ?
5. Le frein, jamais joué : vaut-il une mesure qui le joue (donc un gène et une époque nouvelle), ou est-il abandonné ?
