# La ville du 3/11 (aa160d07f) : enquête et plan (19/11)

## Contrôle des deux enquêtes, puis LE PLAN

Je n'ai rien écrit dans le dépôt, rien commité, lancé aucun Chrome. J'ai relu moi-même les passages décisifs avec `git show aa160d07f:…`, et HEAD.

### 1. Ce que j'ai vérifié : c'est juste
- **Le module parking du 3/11** (`aa160d07f:code/maps/ville-entree.js:258`) : `mParking` fait 400-460° à 1,8-2,1 rP, avec une pente de −9 %. Il est dans le paquet `MCJ` de la ville (l.270) : `[mAngles,mBretelle,tSlalom,tCorde]+[mCarrefourS,mPont,mParking]`. Confirmé.
- **La rampe d'entrée du 3/11** (l.315-317) : avec des modules, l'entrée vaut `{droite:260,rampe:320,chute:160}`, et la rampe tourne de 48-62°. Confirmé. `VILLE_ENTREE_R` (420/520/220) ne sert que sans module.
- **La respiration du 3/11** (l.378) : 50-90 m, 16-36° de virage, −(8-16)·LV de descente. Confirmé.
- **Le garde-fou d'enroulement à HEAD** (`ville-entree.js:138-141`) : 170° de cap cumulé sur 1 500 m. Confirmé.
- **Le malus à HEAD** : `routeRecoupe` est à la l.683. Le malus de la ville est écrit deux fois : dans `genCtrl` l.703 (`id==='ville'||'crypto'`) et dans `genCtrlG` l.710. Confirmé.
- **La ville vitrée** passe par `id='ville'` (l.701 et 707) : elle est donc touchée par tout changement de `routeRecoupe` qui n'est pas gardé par `!c.vitre`. Confirmé.
- **Le décor** :
  - `tourLibre` (`jade-balade.js:60-66`) relève le pied à `p.y+44` ou abaisse le toit à `p.y-60`, et refuse la tour s'il reste moins de 40 m. Confirmé.
  - Le 1er rang est forcé au-dessus de la route, `t=max(t,yN+30+VS_H·120)` (l.129). Confirmé.
  - AIRZ (l.133). Confirmé.
  - `ancPres` appelle `vsBloque` (l.120). Confirmé.
  - Dans `buildVoxCity`, `VS` désigne la ville **vitrée au sol** (l.35), pas les scènes. En ville, la branche `tourLibre` s'applique donc bien.
- **Les interrupteurs existants** : `villeame`, `villecalme`, `villespirale` et `villeportails` sont dans `ville-scenes.js:14-42` ; `villemodules`, `villehasard` et `villeracc` dans `ville-entree.js:34-46`.
- **Les lots A et B** sont chacun contrôlés au bit près :
  - avec `?sans=villecyber` (lot A) et avec `?sans=villehall` (lot B), la ville a pour empreinte p0 `d63b36e2af8b` et p10 `fb378a8c6756` ;
  - crypto `5447610bd8f2` / `eae97981f833`, nuages et espace sont égaux à la référence (`CONTROLE-A.md:9,64`, `CONTROLE-B.md:13-16,103-106`).
- **Le lot C** n'a **pas de contrôle adverse** (`.lots/c/passation/ville-cyber/` ne contient que `LOT-C.md`).

### 2. Ce qui est faux, ou pas prouvé
1. **« enclavé » n'est pas la même chose que « des tours au-dessus de nous ».** C'est un indicateur calculé sur la route seule.
   - Le banc décor dit qu'au palier 0, HEAD superpose autant que le 3/11 (19,5 % contre 19,0 %), avec seulement deux fois moins d'air entre les étages.
   - L'écart réel est donc l'**air entre les étages**, qui fait 110 tours refusées contre 61, plus que la quantité de recoupements.
   - Le tableau de la route mélange les paliers 0, 10 et 20 : à HEAD, la grande spirale (`VSPI`) n'existe qu'au palier 0 (l.356, `engTier<10`). Les chiffres sont à relire **par palier**.
2. **Les pentes ne sont pas des pentes vues en jeu.**
   - Le banc donne 17-18 % au 3/11 et 10 % à HEAD.
   - Le commit 97891272d annonce 9,3 → 13,3 % « dans le vrai jeu ».
   - Les deux bancs mesurent les points de contrôle, avant les lissages ou sur une reconstitution. On ne peut s'en servir **que pour comparer**, jamais comme objectif absolu.
3. **« Les réglages ne suffisent pas »** : c'est mesuré sur un seul jeu de retouches. C'est convaincant, mais ça n'interdit pas l'option 2. Personne ne l'a prototypée.
4. **La pente max de 55 % attribuée à la rampe d'entrée n'est pas localisée.** Il faut la localiser avant de la borner : elle peut aussi venir d'un `mPont`, qui replonge à 13 % sur un rayon court.
5. **Le passage de 60 à 46 % d'enclavé** est attribué à la spirale serrée et aux respirations retirées par cbac2acaa. C'est une estimation par voisinage, **pas une mesure**.
6. **Risque que les enquêtes taisent : cbac2acaa a élargi la spirale à la suite d'une plainte** (« spirales trop serrées »).
   - Remettre 400-460° à 1,8 rP, c'est rouvrir cette plainte. Voir la question 2 pour Sacha.
7. **`VS.scenes` entre aussi dans le `MCJ` de Crypto City** (`ville-entree.js:453`, déjà noté par le jury).
   - Le nouveau paquet ne doit **jamais** modifier `VS.scenes` lui-même. Il doit construire un tableau neuf, sous la garde `MC==='ville' && !c.vitre`.
8. **La vitrée n'est pas mesurable en Node** (`VIT_SOL is not defined` dans le chargeur, `CONTROLE-B.md:17`). Sa preuve passe par Chrome, sous le verrou, ou par une correction du chargeur.

### 3. LE PLAN

**Le principe** : un interrupteur **`VILLE_ETAGES`**. Avec **`?sans=villeetages`**, on retrouve la ville d'aujourd'hui **avec les lots A, B et C fusionnés**, au bit près.

L'interrupteur est actif seulement si `MC==='ville' && !c.crypto && !c.vitre`. Il se définit dans `ville-scenes.js`, sous la même forme que `VILLE_CALME`.

**Ordre d'exécution**

**Étape 0 : socle (pas de nouveau code de route).**
- Fusionner A et B sur la branche, tels quels : leurs contrôles sont verts.
- Faire le contrôle adverse de C, puis le fusionner.
- Prendre les références sur ce socle :
  - `empreinte.cjs graines=1-12` pour la ville, crypto, nuages et espace ;
  - le `ctl.cjs` du contrôle B (75 graines × p0/10/20, l'entrée jouée) ;
  - une empreinte de la vitrée en Chrome.
- Ces références deviennent ce que `?sans=villeetages` doit rendre.

**Étape 1 : la référence du 3/11, pour l'œil de Sacha (lot R, petit).**
- `?ville=0311` : le `genCtrl` et `buildVoxCity` d'aa160 portés tels quels, derrière ce drapeau, en carte ville seulement (c'est l'option 4).
- Ce n'est pas un produit, c'est l'étalon : la comparaison chiffrée et la photo se font contre lui.
- Un auteur et un contrôle. Le contrôle prouve que sans le paramètre, rien ne bouge.

**Étape 2 : lot E, la route à étages** (`ville-entree.js`, dans `genCtrl1`, plus le malus dans `genCtrl` l.703 **et** `genCtrlG` l.710, à l'identique).

Ce qu'on rétablit quand l'interrupteur est actif :
- **le moteur du 3/11** : la boucle motifs (poids `VILLE_WM`), la respiration (50-90 m, 16-36°, descente de −(8-16)·LV), un module tous les 0,3-0,55 km × LV × `kMC`, et `adoucirPentes(VILLE_PENTE)`. **Aucune liaison qui monte.**
- **l'entrée du 3/11** : 260 / 320 / 160, en virage de 48-62°.
- **le `PLN` sans le garde-fou de 170°** : le garde-fou est porté à 450°, et `spiDefait` s'applique aux modules d'étage.
- **le paquet** : un tableau **neuf** qui contient :
  - les modules du 3/11 (`mAngles`, `mBretelle`, `tSlalom`, `tCorde`, `mCarrefourS`, `mPont`, `mParking` à 400-460°, ou à la valeur que Sacha choisira) ;
  - plus les scènes de `VS` ;
  - plus `VS.cyber.liste` (lot A) ;
  - plus `vSaut` / `vPetit`, déposés dans `MODMARK` / `FILETMARK` comme aujourd'hui.

Ce qu'on garde :
- `vsDevers`, `vsReserve` / `vsBatir`, les ancres ;
- `vsCroise` (plancher de 50 m, +40 sous 14 m) ;
- `vsMalusTenue` ;
- le refus du saut tête en bas.

Ce qu'on change, **pour la ville seulement** :
- `routeRecoupe` ne compte plus que les empilements **à moins de 80 m de hauteur** (aujourd'hui : moins de 150 m) ;
- `vsMalusBoucle` exempte `mParking`, `mBretelle` et les scènes `spi`.

Interdits :
- aucun tirage `rf` / `rnd` ajouté sur le chemin de la ville d'aujourd'hui ;
- aucune écriture dans `VS.scenes`.

**Étape 3 : lot D, le décor des étages** (`jade-balade.js`, `ville-v3.js`, `ville-scenes.js`).
- **D1, les tours pendues** (option A du décor) : des tours sans marque SP9, pied à yN+60 (palier 0) ou yN+90 (palier ≥10), toit à yN+300-700, hasard `VS_H` sans tirage `vr`. Elles :
  - passent par `tourLibre`, `ancPres` et `vsBloque` ;
  - sont exclues d'AIRZ, des lèvres et des crêtes ;
  - sont prises sur le budget `BUD`, et moitié moins nombreuses sous `ALLEGE` (**jamais `IS_MOBILE`**).
- **D2, le fondu violet** pour les tours de scène au-dessus de la route : un fondu court de 60-120 m depuis l'arête basse, dans `villePiedSP`. Les plafonds de couloir restent SP9.
- **D3 (option D du décor)** : là où un étage passe au-dessus, le 1er rang forcé (l.129) laisse `tourLibre` relever le pied au lieu de rabattre le toit.
- La correction des trous du 1er rang (+5 sur `lat`, `JURY.md:10`) : seulement si la mesure Node la confirme.
- Le lot D est gardé par `VILLE_ETAGES` : il ne joue que sur la route à étages.

**Étape 4 : finition, ensemble.**
- Régler les longueurs : les lots A et B doivent avoir leur place dans `LONG` et dans le paquet ; `vcPaquet` met une carte route-ville en tête.
- Bump de `sw.js`, `assembler --verifier`, compilation des `<script>` (`vm.Script`).

**Chaque lot a un auteur et un contrôle adverse**, dans `.lots/<x>`, sous `verrou-banc.sh` pour Chrome, avec 4 agents au plus.

### 4. Ce que deviennent les lots A, B et C
- **A (slalom des tours, piqué, montagnes russes)** : **réutilisable tel quel.**
  - Il s'accroche à `MCJ` via `VS.cyber.liste`, hors de `VS.scenes`, sous `MC==='ville'`. Le lot E n'a qu'à l'ajouter dans le paquet neuf.
  - **À adapter** : `vcPaquet` (la carte route-ville en tête) se repose sur le paquet neuf, et son dévers `nul` doit tenir sur une route plus pentue.
  - **À re-mesurer** : `vsAirOk` et `vcFrole`, parce que la route du dessus est plus proche.
- **B (l'immeuble traversé)** : **tel quel.**
  - Il est lié à `VS.entree()` et à l'ouverture. Or l'entrée change sous l'interrupteur (260 / 320 / 160 en virage) : il faut vérifier que la porte se pose encore sur la nouvelle rampe.
  - **À adapter** : ses volumes SP9 au-dessus de la route reçoivent le fondu D2, sauf les plafonds de couloir.
- **C (cadres de néon par moments)** : **tel quel une fois contrôlé.** Il est indépendant de la forme de la route ; sa règle « par moments » est à re-mesurer sur la route à étages.
- **Rien n'est à refaire.** Seule la « TRANCHÉE » du lot A n'a pas été faite, et la route à étages la rend moins utile : à ne pas faire.

### 5. Les preuves à exiger (chaque lot, avant la fusion)
1. **Le bit près** :
   - `SEARCH='?sans=villeetages' node outils/banc-routes/empreinte.cjs graines=1-12`, plus `ctl.cjs` (75 graines × 0/10/20, avec l'entrée) : égaux aux références de l'étape 0 ;
   - **sans** le drapeau : crypto `5447610bd8f2` / `eae97981f833`, nuages et espace inchangés ;
   - la vitrée inchangée (en Chrome, ou chargeur Node corrigé).
2. **Graines 1-20 et 101-160 × paliers 0, 10 et 20**, avec des chiffres **par palier**, comparés à `?ville=0311` et au socle :
   - enclavé : objectif ≥ 50 % ;
   - part de route sous un pied relevé : ≥ 25 % au palier 0 et ≥ 15 % au palier 10 ;
   - tours au pied relevé par route : ≥ 20 au palier 0 ;
   - tours refusées : ≤ celles du 3/11 ;
   - total de virage ≥ 4 tours ;
   - pente en comparaison seulement, et **mesurée en jeu**.
3. **Hauteur libre sous chaque recoupement** :
   - minimum ≥ 60 m sur la route ordinaire et sur les modules d'étage ;
   - 0 croisement sous 50 m (`vsCroise=0`), 0 frôlement sous 14 m ;
   - écart médian avec la route du dessus ≥ 150 m.
4. **Aucun trou, aucune collision** :
   - `dbgVilleAudit` : `dans=0` et `frole=0` ;
   - 0 tour dans AIRZ ;
   - le banc de vol / `ville-sauts-page.js` : 0 mort au pilote auto sur 6 graines neuves, sauts compris ;
   - les tours pendues à ≥ 60 / 90 m au-dessus de toute trajectoire de vol.
5. **La charte** : tenue R1-R2 avec un 90e percentile **< 8,5 s** (il était à 8,6 s au 3/11) ; pente d'un segment ≤ 40,5 % (localiser la valeur de 55 % d'abord) ; `garde-charte.sh` et `garde-allege.sh` verts.
6. **Le coût**, en `?tel=1` et sur ordi, mesuré avec `renderer.info` (appels et triangles) :
   - ≤ 114 appels / 282 k triangles sur téléphone, à ±5 % ;
   - 0 appel, matière ou programme en plus ;
   - le temps de `buildVoxCity` et du tirage meilleur-de-N (le paquet plus gros) : `genCtrlG` doit rester en tranches.
7. **L'œil** : une planche photo des graines 1-6 au palier 0 et au palier 10, `?ville=0311` contre `villeetages`, avec le son coupé. Sacha tranche.

### 6. Les risques
- **La spirale serrée** rouvre la plainte de cbac2acaa (question 2).
- **La tenue de cap** est à la limite au 3/11 : sans garde-fou de 170°, R1 peut sauter. Il faut une borne plus haute, pas aucune borne.
- **Plus d'étages, c'est plus de rabats et de refus de tours.** Si l'air reste sous 150 m, l'effet ne revient pas : le décor dépend de la route.
- **Le paquet plus gros change l'ordre des tirages** : toute la ville change sous l'interrupteur (c'est voulu). Et le **malus est écrit deux fois** (l.703 et l.710) : une divergence entre les deux casse le pré-bâti.
- **La vitrée et Crypto City** : une garde oubliée les change en silence.
- **Le surremplissage sur iPhone** quand les tours pendues couvrent le haut de l'écran : garde `ALLEGE` et mesure.

### 7. Les questions pour Sacha (fermées)
1. On te montre d'abord la vraie ville du 3/11 (`?ville=0311`) à côté de la nouvelle, avant de tout coder ? (oui / non)
2. La descente du parking redevient la spirale **serrée** du 3/11 (400-460°), alors qu'elle avait été élargie le 5/11 parce que « trop serrée » ? (serrée / large)
3. Dans la ville à étages, on garde les sauts et les raccourcis (LE SAUT, LE GRAND SAUT) ? (oui / non)

### 8. Ce que je n'ai pas vérifié
- Je n'ai relancé aucun banc. Les chiffres viennent des deux enquêtes, et ceux de la section 5 sont des seuils à tenir, pas des mesures.
- Je n'ai pas vu l'image en jeu.
- Je n'ai pas lu en entier le code des lots A, B et C (seulement leurs rapports et contrôles), ni le `.lots/j`, qui touche à Crypto City de jour et pourrait toucher aux empreintes crypto.

Fichiers clés :
- `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-entree.js` (l.138-141, 356-358, 683, 700-710)
- `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/jade-balade.js` (l.35, 60-66, 115-133)
- `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/code/maps/ville-scenes.js` (l.14-42, 355-365)
- `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/.lots/a/passation/ville-cyber/CONTROLE-A.md`
- `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/.lots/b/passation/ville-cyber/CONTROLE-B.md`
- `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59/.lots/c/passation/ville-cyber/LOT-C.md`

---

RAPPORT : LE DÉCOR DE LA VILLE, aa160d07f (3/11) comparé à HEAD (lecture seule, aucun Chrome lancé)

## (1) D'où venait l'effet « immeubles à l'envers, transparents, violets »

Ce n'était pas un objet dessiné exprès. L'effet naissait de trois règles mises ensemble.

a) **Les tours sont bâties le long de la route, étage par étage.** `buildVoxCity` (aa160d07f, code/maps/jade-balade.js:27-200) pose chaque tour par rapport au tronçon qu'elle borde (yN = l'altitude de ce tronçon), pas sur une grille au sol. Le commentaire l.160-165 le dit : « la piste de la ville descend en SPIRALE… plusieurs étages de route se superposent… Les autres étages de route, `tourLibre` s'en charge. »
- Le canyon a trois rangs de chaque côté : `ROWS=[[28,40,.9],[100,60,.7],[190,130,.5]]` (l.166). Les tours sont espacées d'un pas SN de 54 m (66 m sur ALLEGE), mesurent 16-42 m de côté, et le budget est de 2300 volumes (1300 sur ALLEGE).
- Hauteur : `t = yN-50 + 290·vr^0,75·(0,55+0,45k)`, avec +160 m une fois sur cinq (l.~112).
- Pied : `b = min(yLo,yN) - 330 - vr·120`. Une tour fait au plus 1000 m.
- Les retraits sont des volumes emboîtés qui partent tous du pied (« la brume se lit pareil sur tous »).
- La forêt va de 330 à 2100 m. Sa hauteur est `t = yN-230+vr²·470` et son pied reste sous toutes les routes à moins de 360 m. **Mesuré : elle n'a jamais le pied relevé.** L'effet vient donc seulement du canyon.

b) **La règle d'or `tourLibre`** (aa l.57-63, à l'identique à HEAD jade-balade.js:60). Pour chaque point de route à moins de `hd+ROAD_HALF+24` m de l'axe de la tour, et entre b-40 et t+60 en hauteur :
- si la route passe au-dessus du milieu de la tour, le toit est abaissé à `p.y-60` ;
- sinon le pied est relevé à `p.y+44`.

Une tour bâtie pour l'étage du haut, sous laquelle repasse l'étage du bas, garde donc sa hauteur. Son pied se met à **flotter 44 m au-dessus de la route du bas**, à moins de ~80-110 m de son axe horizontalement, parfois juste au-dessus.

c) **Le shader du pied, `villePied`** (aa ville-v3.js:109-120). Après le brouillard de three, la couleur est mélangée vers `fogColor + uPiedC·uPied·(1-smoothstep(0,160,vB9))` avec le poids `mb = smoothstep(10,280,vB9)`. Ici `vB9 = (position.y+.5)·scale.y` est la hauteur au-dessus du pied du volume (vertex, aa l.~175).
- `uPiedC = (0,16 ; 0,04 ; 0,2)` est violet (ville-v3.js:79). Il est remappé par la teinte de la ville (vtPose, ville-nuit.js:51).
- Vu d'en dessous, les 280 premiers mètres d'une tour suspendue passent du violet de brume, presque la couleur du ciel (donc on croit voir à travers), aux fenêtres pleines vers le haut.
- On lit ainsi une tour qui se dissout par le bas, plus nette en montant : elle paraît **à l'envers, transparente et violette**. Comme ces pieds relevés tombent sur les tronçons où la route repasse sous la spirale, ils forment des **voûtes d'immeubles**, le « tunnel conceptuel ».
- Les tuyaux et les lames, qui descendent le long des façades (l.~140), se noient de la même façon.

## (2) Ce que le décor fait autrement à HEAD

**Le shader est intact.**
- `villePied` est identique au caractère près (ville-v3.js:109-120). Le diff aa160d07f→HEAD ne touche que la clé de programme `toursV6`→`toursV7`, le `vSP9` et des outils de banc.
- `uPiedC` est inchangé (l.79). `uPied` vaut 1 en ville et **0 à Crypto City** (jade-balade.js:82, depuis le 5/11).
- `villeMatToursLoin` garde `villePied` (ville-v3.js:308).
- **Nouveau : `villePiedSP`** (ville-v3.js:122, utilisé l.240). Un volume marqué « sans pied » (`vSP9`, bleu+4 dans la couleur d'instance, jade-balade.js:304) ne se noie plus du tout.
- Dans ville-nuit.js et ville-embellie.js, je ne trouve aucun changement de teinte ou de brume de la ville (diff : contiMap, bords, rais). Je n'ai pas vérifié en jeu les distances du brouillard.

**Différences, avec leur effet sur le rendu :**

1. **La route : beaucoup moins d'étages superposés avec de l'air entre eux. Cause principale, et ce n'est pas le décor.**
   Mesuré avec un banc Node que j'ai écrit : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/mesure-pieds.cjs` et `ecarts.cjs`. Il tourne sur le vrai genCtrl, la courbe centripète, le canyon simulé avec le même `tourLibre` et la même forêt. Graines 1-12.

   | | aa160d07f, palier 0 | HEAD, palier 0 | aa160d07f, palier 10 | HEAD, palier 10 |
   |---|---|---|---|---|
   | Dénivelé de la route (max-min) | 1300 m | 699 m | 1780 m | 752 m |
   | Pente nette | 17,9 % | 10,3 % | 18,3 % | 9,5 % |
   | Part de route avec un autre étage à moins de 90 m et 44-400 m plus haut ou plus bas | 19,0 % | 19,5 % (la grande spirale VILLE_SPIRALE) | 9,0 % | 4,1 % |
   | Écart au-dessus, médiane | 183 m | 127 m | 392 m | 52 m |
   | Écart au-dessus, part sous 150 m | 38 % | 57 % | 27 % | 78 % |
   | **Tours du canyon au pied relevé, par route** | **26,6** | **11,9** | **18,9** | **2,9** |
   | Tours refusées (plus de place entre deux étages) | 61 | 110 | 34 | 104 |
   | Toits rabattus sous une route | 2 | 13 | 0,4 | 14,5 |
   | Part de route qui roule sous un pied relevé (≤160 m, pied 40-250 m au-dessus) | 27 % | 18 % | 16 % | 7 % |

   Lecture : à palier 0, la route se superpose autant qu'avant, mais avec deux fois moins d'air entre les étages. Les tours n'y tiennent plus (40 m minimum entre pied relevé et toit rabattu) : elles sont refusées au lieu d'être suspendues. À palier 10, l'effet a presque disparu.
   Commits : e1c64a63e (malus de recoupement), cbac2acaa / 5188a4d21 (phrase de rythme), 9756ac05d / 82c70b0db (ville calme, puis grande spirale à palier 0 seulement).

2. **Le 1er rang est forcé au-dessus de la route** : `t=max(t,yN+30+VS_H·120)`, jade-balade.js:129. Les rangs sont rapprochés : `[[24,16,.95],[84,50,.75],[176,120,.55]]`, l.188.
   - Bon pour le canyon.
   - Mais plus de toits viennent buter sous l'étage du dessus (rabat de 2 à 13 par route) et plus de tours sont refusées.
   - Affaiblit un peu l'effet : une tour rabattue a un toit sous la route, pas un pied au-dessus.

3. **AIRZ** (97891272d, jade-balade.js:133) : sous l'air des sauts, les toits sont abaissés à a.y-60 ou la tour est supprimée. C'est nécessaire pour le vol. Cela retire localement des tours au-dessus de la route d'en bas, juste là où la route se superpose (les raccourcis).

4. **`vsReserve`, `vsBloque`, `ancPres`** (jade-balade.js:116-120, ville-scenes.js:272 et 356) : aucune tour ordinaire dans l'emprise d'une scène ni d'une géante d'ancre. La marge des scènes est de 14 m, celle des tours ordinaires de 24 m (`MS`, ville-scenes.js:273). `vsLibre` (l.257) refuse tout volume de scène qui approche une route.
   - Neutre pour la sécurité, mais cela remplace des tours « organiques » par des décors de scène.

5. **Les volumes de scène qui passent au-dessus de la route sont marqués « sans pied » (SP9)** : halls, tours sur rue, ponts, plafonds de couloir (vol(…, sp=true), ville-scenes.js:362).
   - Ils sont dessinés **pleins jusqu'à leur arête basse, sans violet ni fondu**.
   - C'est justement là où l'on passe aujourd'hui sous des immeubles (le tunnel de Guangzhou, les ouvrages) : on voit un plafond net au lieu d'une tour qui se dissout.
   - **C'est la différence de rendu qui affaiblit le plus l'effet dans les moments « enclavés » actuels.**

6. **44a5de54c** retire les cadres de néon autour de la route (VILLE_SANS_CADRES, ville-scenes.js). Sans rapport avec l'effet d'aa160 : il ne passait pas par des néons.

7. **Matières :** fenêtres, GTA et néons sont inchangés en ville. Crypto City a changé (cryptoMatTours, uPied=0).

## (3) Le coût

- **Rendu de la ville : 5 appels pour tout le décor, à aa160 comme à HEAD.** Familles tours, néons et circulation, chacune en près et loin (ville-v3.js en-tête « passe perf »). Les scènes s'ajoutent dans les familles existantes (0 appel de plus, ville-scenes.js:11-12).
- **Budget du canyon :** 2300 volumes, 1300 sur ALLEGE, identique.
- **HEAD avant la ville calme** (passation/MAPS-PRO-VILLE.md:76-78) :
  - buildVoxCity : 24-109 ms, 392-1048 tours, 1193-3621 volumes ;
  - une image : ordi 76-186 appels / 173-721 k triangles, téléphone 67-125 appels / 118-333 k triangles.
- **Après** (MAPS-PRO-VILLE.md:346-351, toute l'image) :
  - ville ordi : 216 appels, 765 k triangles ;
  - ville téléphone : 114 appels, 282 k triangles (-26 %).
- **Je n'ai trouvé aucun relevé chiffré à la date d'aa160d07f.** Par la simulation : environ 500 tours de canyon et 520 de forêt par route à palier 0, à aa160 comme à HEAD (460 / 523). Le volume de décor est donc comparable : l'écart vient de **où** les tours sont posées, pas de combien il y en a.

## (4) Les options pour retrouver ce décor sans perdre les corrections

Les corrections à garder : plus rien ne flotte (enseignes, réclames, lames adossées), rien dans la route.

**A. Les « tours pendues », faites exprès (décor seul). Celle que je recommande.**
- **Fichiers :** code/maps/jade-balade.js (une passe après le canyon, avant vsBatir) ou ville-scenes.js (une scène « voûte » réservée par vsReserve, bâtie par vsBatir).
- **Principe :** sur les tronçons sans autre étage, poser 2 à 6 tours à cheval sur la route ou en surplomb, à lat de 0 à 40 m.
  - Pied à yN + 60 à 90 m (60 plutôt que 44 : plus de marge en vol), toit à yN + 300 à 700 m, retraits emboîtés comme avant.
  - Elles **ne sont pas marquées SP9** : leurs pieds se noient en violet par `villePied`, à l'identique d'aa160.
  - Hasard `VS_H` né de la place : aucun tirage `vr` décalé, la ville d'à côté ne bouge pas.
  - Passées par `tourLibre`, `ancPres`/`vsBloque`, et exclues des AIRZ, des lèvres de saut et des crêtes.
- **Les corrections tiennent :** rien ne touche le couloir de conduite, l'audit `dbgVilleAudit` mesure `dans`/`frole` de 0,3 à 12 m. Ces tours ne sont pas des enseignes, la règle « flotte » ne les concerne pas.
- **Risque :**
  - collisions en vol (tout volume est mortel). À mesurer avec le banc de vol / ville-sauts-page.js ; plafond conseillé de 60 m au palier 0 et de 90 m au palier ≥ 10 ;
  - surremplissage sur iPhone quand une tour couvre le haut de l'écran : le shader des fenêtres tourne sur tous ces pixels, la branche du pied seulement sous 280 m.
- **Coût :** 0 appel de plus (familles existantes), environ 3 volumes par tour, pris sur BUD.
  - Garde **ALLEGE** : moitié moins de voûtes et pied à 280 m maximum (déjà le cas).
  - Aucun branchement sur IS_MOBILE.

**B. Rendre le fondu violet aux volumes de scène qui passent au-dessus de la route (SP9 partiel).**
- **Fichiers :** ville-v3.js:122 (`villePiedSP`) et ville-scenes.js:362.
- **Principe :** au lieu de `vPd9=1e5` (aucun fondu), donner aux tours sur hall, aux ouvrages et aux murs du tunnel un fondu court, par exemple vB9 mesuré depuis leur arête basse sur 60-120 m.
- **Coût :** nul, c'est le même programme.
- **Risque :** les plafonds de couloir deviennent brumeux. Les garder SP9 et ne libérer que les tours au-dessus de la route.
- **Va avec A :** c'est ce qui fait que les passages sous immeubles d'aujourd'hui ressemblent à ceux d'aa160.

**C. Rendre de l'air entre les étages (côté route, pas ma part, mais l'effet en dépend).**
- Un écart vertical d'au moins 150-200 m entre étages superposés (aujourd'hui la médiane est de 127 m au palier 0 et de 52 m au palier 10), ou une pente nette plus forte.
- Sinon `tourLibre` refuse les tours au lieu de les suspendre (110 refusées contre 61).
- **Fichiers :** ville-entree.js (genCtrl1) et route-rythme.js (malus de recoupement d'e1c64a63e).
- **Risque :** les raccourcis et la charte R6 ; à arbitrer par l'agent de la route.

**D. Assouplir le 1er rang forcé au-dessus de la route (jade-balade.js:129)** là où un autre étage passe au-dessus, pour laisser `tourLibre` relever le pied au lieu de rabattre le toit. Faible coût, faible gain.

**Recommandation : A + B tout de suite.** Ce sont des changements de décor seul, à 0 appel de plus, sous la garde ALLEGE, qui ne touchent pas la route. Ensuite C, si la route peut garder de l'air entre les étages. A recrée le mécanisme d'aa160, la tour suspendue noyée en violet par le pied, sans dépendre du repli de la route. B rend le même traitement aux passages sous immeubles des scènes, qui sont aujourd'hui des plafonds pleins.

## Ce que je n'ai pas pu vérifier

- **Aucune image en jeu** (pas de Chrome). L'explication visuelle vient du code ; je ne l'ai pas confirmée par photo.
- **Mon banc ne reproduit pas toute la ville de HEAD.** Pour la route d'aa160 il charge seulement ville-entree.js et route-sans-haut.js d'aa160, avec une allure de longueur de 1. Côté décor, ni AIRZ, ni scènes/vsBloque, ni ancres, ni ville vitrée : les chiffres de HEAD réels sont donc probablement plus bas encore.
- **Les pentes du banc ne correspondent pas à celles annoncées.** Il mesure 17,9 % contre 10,3 % de pente nette, alors que le commit 97891272d annonce 9,3 → 13,3 % « dans le vrai jeu ». Ma reconstitution d'aa160 ne vaut que pour comparer, pas comme mesure absolue.
- Je n'ai pas lu les lots A, B et C (.lots/a|b|c) : il n'y a pas encore de rapports LOT-*.md dans passation/ville-cyber/.
- Je n'ai pas vérifié la distance du brouillard de la ville à chaque date.

Fichiers clés : code/maps/jade-balade.js (60, 115-134, 188, 304), code/maps/ville-v3.js (79, 109-122, 240, 308), code/maps/ville-scenes.js (257, 272-273, 356, 362), passation/MAPS-PRO-VILLE.md (76-78, 346-351). Les bancs sont dans `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/` (mesure-pieds.cjs, ecarts.cjs, old/ avec la route d'aa160 extraite).

---

## LA ROUTE DE LA VILLE : le 3/11 (aa160d07f), ce qui l'a tuée, ce qu'il faut garder, comment la retrouver

Je n'ai rien écrit dans le dépôt, rien commité, lancé aucun Chrome. Les bancs Node sont dans le scratchpad :
- `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/route/mesure2.cjs` : charge les VRAIS morceaux d'un commit (copiés par `git show` dans `route/c/<commit>/`), avec le prélude de `outils/banc-routes/charge.cjs`.
- `attrib.cjs` (quel module passe sous quel module) et `juge.cjs` (la charte de HEAD appliquée aux routes du 3/11), dans le même dossier.

Le banc tourne sur la carte ville, graines 1-20, paliers 0, 10 et 20 (60 routes par ligne), avec la longueur visée du jeu (`DUREE_ALLURE.ville = 1`). Il donne, au point près, le même résultat que `charge.cjs` sur HEAD.

**Ce que mesurent les colonnes du tableau du (2)**
- **enclavé** : la part de la route qui a, à moins de 330 m en plan, un autre morceau de route plus haut de 60 m ou plus. C'est la largeur du canyon de `ville-v3.js`. C'est le meilleur indicateur Node de « des tours du haut au-dessus de nous ».
- **sous** : la part de la route qui passe sous un autre morceau de route (à moins de 60 m en plan, et à plus de 150 m d'écart sur la route).
- **h min** : la hauteur libre du croisement le plus bas.

### (1) La route de la ville au 3/11 (aa160d07f, `code/maps/ville-entree.js`, une seule fonction `genCtrl`)

- **Pas de meilleur-de-N.** Un seul tirage, aucune note, aucun malus. Aucun garde-fou de cap : le `PLN` « boucle » (28 % des routes) enroulait même la route exprès (l. 114-118).
- **L'entrée** : `VILLE_ENTREE_R` (l. 10). Une droite surélevée de 260 m, puis une rampe de 320 m qui plonge de 160 m (× LV) en virage de 48-62° (l. 315-317).
- **Les modules de la ville** : un tous les 0,3-0,55 km × LV × `kMC` (l. 324-325), tirés dans le paquet `MCJ` (l. 270) :
  - `mAngles` (3-4 coins de 80-95°, −5 %) ;
  - `mBretelle` (200-250° à 2-2,4 rP, −7 %) ;
  - `tSlalom`, `tCorde` ;
  - `mCarrefourS` ;
  - `mPont` (monte de 9 %, tablier, replonge de 13 %) ;
  - `mParking` (l. 258) : la spirale de 400-460° à 1,8-2,1 rP qui descend de 9 %. Au palier 0, rP = 61 m, donc environ 68 m de descente par tour.
- **Entre les modules** : les 13 motifs, avec les poids `VILLE_WM` (l. 39). Puis une respiration qui descend à environ 15 % : `(8-16)·LV` m sur 50-90 m (l. 378).
- **La pente** : `adoucirPentes(ctrl,VILLE_PENTE)` (l. 390 ; `VILLE_PENTE={seuil:.30,garde:.35}`, `route-sans-haut.js:476`) ne comprime que ce qui dépasse 30 %. **Aucune montée nulle part.**
- **Mesures** :
  - longueur médiane 9,6 km, chute médiane **1 650 m**, pente moyenne **17,4 %** (12-24 %) ;
  - **4,8 tours** de virage cumulé, enroulement maximal 1,24 tour (jusqu'à 2,7) ;
  - **enclavé : 60 %** de la route (de 27 % à 84 %) ;
  - sous : 5,3 % ; 48 routes sur 60 se croisent ;
  - hauteur libre du croisement le plus bas : médiane 144 m, **jamais sous 58 m** ;
  - écart avec la route du dessus : médiane **191 m**, 90e percentile 759 m ;
  - 69 % des passages dessous sont faits par des modules (surtout la spirale et la bretelle), 31 % par la route ordinaire qui se replie.
- **Ce qui faisait les recoupements** : la combinaison d'une **descente continue et forte**, de **beaucoup de virages sans borne de cap** (la route revient le long de son propre passage, plus haut), et des modules qui s'enroulent (parking, bretelle).
- **Côté décor**, `tourLibre` (`jade-balade.js:60`, toujours là aujourd'hui) relève le pied des tours au-dessus de la route basse, et `villePied` (`ville-v3.js:109`) les noie dans la brume violette.
- Jugée par la charte d'aujourd'hui (`juge.cjs`), la route du 3/11 est presque conforme :
  - tenue de cap à 30° : médiane 5,9 s, 90e percentile 8,6 s, maximum 12 s (le malus part à 8,5 s) ;
  - tenue à 8° : 2,1 s (malus à partir de 4,3 s) ;
  - `vsCroise` à **0 sur les 60 routes** : aucun croisement sous 50 m ;
  - pente maximale d'un segment de contrôle : 55 % (aujourd'hui 40,5 %). Elle vient probablement de la rampe d'entrée ; je ne l'ai pas localisée.

### (2) Commit par commit (même banc, mêmes 60 routes)

| commit | pente | chute | tours | enclavé | sous | h min |
|---|---|---|---|---|---|---|
| aa160d07f (3/11) | 17,4 % | 1 650 m | 4,8 | **60 %** | 5,3 % | 144 m |
| cbac2acaa (5/11) | 15,8 % | 1 548 m | 4,0 | 46 % | 3,0 % | 120 m |
| bc5b0dc65 | 15,8 % | | 4,2 | 48 % | 4,7 % | 116 m |
| 79675e483 | 16,2 % | | 4,3 | 48 % | 4,2 % | 116 m |
| **5188a4d21 (7/11)** | **9,0 %** | **682 m** | 3,5 | **17 %** | 1,8 % | **7 m** |
| da2d329b8 (e1c64a63 + correctif HCAP) | 8,7 % | | 3,3 | 22 % | 3,1 % | 7 m |
| 746a4fe96 (9/11) | 10,0 % | | 3,3 | 32 % | 3,1 % | 115 m |
| 97891272d (11/11) | 13,2 % | 1 119 m | 3,4 | 42 % | 3,0 % | 39 m |
| 88c33c907 (ancres) | 13,5 % | | 3,7 | 43 % | 3,2 % | 51 m |
| 1967acb8d (scènes) | 10,8 % | 866 m | 3,7 | 33 % | 4,2 % | 23 m |
| 55bf4ac98 (R13) | 10,8 % | | 2,9 | 27 % | 3,4 % | 25 m |
| 1e450ecdf | 10,0 % | | 2,9 | 26 % | 4,0 % | 57 m |
| 9756ac05d (ville calme) | 9,5 % | | 3,1 | 22 % | 1,7 % | 49 m |
| 82c70b0db / 44a5de54c / **HEAD** | 10,0 % | 783 m | 3,1 | **27 %** | 1,8 % | 51 m |

Ce que chaque refonte a fait, lu dans le code :
- **cbac2acaa** (`genCtrl` devient `genCtrl1` plus un meilleur-de-N noté) :
  - `mParking` passe de 400-460° à 1,8-2,1 rP à **330-390° à 2,4-2,8 rP** (« spirales trop serrées ») ;
  - la respiration passe de 50-90 m tournant de 16-36° à 1,2-2,8 s tournant de 8-20° ;
  - la note écarte les « spirales subies ».
  - Enclavé : −14 points.
- **bc5b0dc65** : la rampe d'entrée tourne de 72-92°, le parking est déclaré.
- **5188a4d21, le vrai coup.** La « phrase de rythme » remplace les 13 motifs et les respirations pour la ville, Crypto City et la vitrée. La pente vient de `dyk=.12` pour les virages et de `.048` pour les souffles. Le paquet `MCJ` du 3/11 n'est plus le squelette : un climax unique (`mRondPoint`), dessiné à plat. Résultat : la pente tombe de 16 à 9 %, l'enclavé de 48 à 17 %, et le rond-point recoupe son entrée à 5-11 m.
- **e1c64a63e** (+ da2d329b8) : le **garde-fou d'enroulement** (au plus 170° de cap cumulé sur 1 500 m dès qu'un `PLN` existe, `ville-entree.js:137-141`), plus `routeRecoupe` (l. 683). Ce dernier coûte 0,03 par mètre de route qui a, plus de 300 m plus loin, un morceau parallèle (cap à 29° près) à moins de 90 m en plan et **moins de 150 m en hauteur**. Il tue exactement l'empilement en étages de 60 à 150 m. L'enroulement médian passe de 1,11 à 0,91 tour.
- **746a4fe96** : le rond-point descend de 14 %, la hauteur libre minimale remonte de 7 à 115 m.
- **97891272d** : la « descente des villes » (`dyk` passe à `.26` sous `VRAC`), LE SAUT et LE GRAND SAUT, les tours rabattues sous le vol. La pente remonte à 13 %, l'enclavé à 42 %.
- **1967acb8d / 55bf4ac98, la ville qui se visite** (`VAME`) : la route devient une phrase de scènes (`vsModules`, `ville-scenes.js:50`).
  - Les liaisons alternent des montées de 2-4 % et des descentes de 12-20 % (l. 69-73) ; les souffles sont 40 % de montées à 4 % et 60 % de descentes à 10 % (l. 75-77).
  - Des scènes montent : la crête +11 %, le phare +7 % en ville calme.
  - S'y ajoutent `vsCroise`, `vsMalusTenue`, `vsMalusRac` et, plus tard, `vsMalusBoucle` (au-delà de 220° du même côté).
  - La pente retombe à 10,8 %, l'enclavé à 33 % puis 27 %, et le total de virage à 2,9 tours.
- **9756ac05d (ville calme)** : grands moments à 175-205° au lieu de boucles, plus `vsMalusBoucle` (`ville-scenes.js:171`). Enclavé à 22 %.
- **82c70b0db** rend la grande spirale au seul palier 0 (`VSPI`, 320-340° à 12 %) : enclavé à 25 %.
- **44a5de54c** : rien sur la route, à 0,1 près.
- **Aujourd'hui, les passages dessous sont presque tous voulus** (`attrib.cjs` sur HEAD) : 60 % sont des sauts ou grands sauts, 29 % le rond-point ou la spirale. La route qui se replie toute seule ne fait plus que 55 points sur 34 628 (472 sur 38 217 au 3/11). L'écart médian avec la route du dessus est **62 m**, contre 191 m au 3/11.

**Conclusion du (2).** Ce qui a tué les passages sous la ville :
1. surtout 5188a4d21 : la phrase à pente douce, qui monte aussi ;
2. puis le duo garde-fou de cap plus `routeRecoupe` à 150 m (e1c64a63) ;
3. puis `VAME` et la ville calme, avec leurs scènes qui montent, moins de virage et `vsMalusBoucle`.

### (3) Ce que la route d'aujourd'hui a de mieux, à garder

- **Aucun croisement trop bas sur une route ordinaire** : `vsCroise` (`ville-scenes.js:188`) donne 6 par croisement sous 50 m et +40 si deux routes se frôlent à moins de 14 m (R10). À noter : le 3/11 ne croisait de toute façon jamais sous 58 m au banc. Le vrai défaut de l'époque était le rond-point plat de 5188a4d21, qui n'existe pas au 3/11.
- **Les raccourcis voulus** (LE SAUT et LE GRAND SAUT, 97891272d) et leurs exemptions dans les malus (`m.fig==='saut'|'grandsaut'|spi`). Au 3/11, aucun saut ne survivait (c'est mesuré dans le commentaire de 97891272d).
- **Le saut refusé tête en bas** (fa31fd5ff) et les tours rabattues sous le vol (`FILETMARK.air`).
- **La tenue de cap** R1-R2 (`vsMalusTenue`, l. 168) : au 3/11, le 90e percentile frôlait déjà le seuil.
- **Le dévers** `vsDevers`, les ancres et `vsReserve` / `vsBatir` : une scène réserve son emprise, il n'y a plus de route à travers un immeuble. C'est le socle des lots A, B et C.
- **HCAP déclaré** (`ville-entree.js:60`) : sans lui, plus aucune route ne se générait.
- **genCtrlG en tranches** (26cf267b4, `ville-entree.js:706-712`) et le pré-bâti par tranches (`moteur/piste-prebati.js`). Attention : le malus de la ville est écrit **deux fois**, dans `genCtrl` (l. 703) et dans `genCtrlG` (l. 712). Toute option doit toucher les deux de la même façon.
- **Les routes uniques** (`gameplay/route-uniques.js`) : aujourd'hui elles ne s'appliquent **pas** à la ville. `ruDeja` n'est appelé que pour l'espace et Jade ; c'est le lot U prévu.

### (4) Les options, de la moins à la plus invasive

**Fait vérifié avant de choisir : changer les réglages ne suffit pas.**
- J'ai modifié des copies de HEAD (dans le scratchpad, pas dans le dépôt) : liaisons à 18-26 %, souffle à 16 %, garde-fou porté à 330°, `routeRecoupe` ramené à 80 m de hauteur.
- Résultat : **pente 10,6 %, enclavé 26-28 %**, presque pareil qu'aujourd'hui. Les scènes de `VAME` imposent la forme (montées, 3,1 tours de virage).

**Option 0 : rien à coder, une comparaison tout de suite pour Sacha**
- `?gen=ancien` sur HEAD donne une ville à 16,4 % de pente et **44 % d'enclavé** (`routeRecoupe` reste actif, donc « sous » est à 0 en médiane).
- `?sans=villeame` donne 13,4 % de pente et 42 % d'enclavé.
- Les deux sont globaux : ils changent aussi les nuages, l'orbite, Crypto City et la vitrée dans cette partie. C'est un outil de comparaison, pas une solution.

**Option 1 : réglages dans `VAME`** (pente des liaisons et souffles, garde-fou, seuil de `routeRecoupe`)
- Fichiers : `ville-scenes.js` (l. 69-77) et `ville-entree.js` (l. 141, 683-698).
- Risque faible, mais **mesuré inefficace** (+1 point d'enclavé).
- Piège : `VS` (liaison, souffle, scènes) sert aussi à Crypto City (`MCJ` de crypto = `VS.scenes.concat(...)`, l. 453). Il faudrait passer un drapeau `MC==='ville'` dans le contexte `G`.

**Option 2 : ajouter à `VAME` des modules d'étage**
- Exemples : une grande spirale qui descend à 12-15 % à tous les paliers (la `VSPI` de `sSpirale`, `ville-scenes.js:96`, aujourd'hui réservée au palier 0) ; une « épingle repliée » à −15 % dont la sortie repasse 90-150 m sous l'entrée.
- Il faut aussi les exempter de `routeRecoupe`, `vsMalusBoucle` et du garde-fou (comme `spi`).
- C'est compatible avec les lots A, B et C (même patron de scène).
- Mais la pente et le virage restent ceux de la phrase. Je m'attends à ce que « sous » remonte et que l'enclavé ne remonte que peu ; **je ne l'ai pas mesuré.**

**Option 3 (recommandée) : le squelette du 3/11, décoré par aujourd'hui, pour la seule carte ville**
- Un interrupteur `VILLE_ETAGES` (`?sans=villeetages` rend l'avant au bit près), gardé `MC==='ville'`. Dans `genCtrl1`, quand il est actif :
  - **le moteur du 3/11** : la boucle motifs, respirations et module tous les 0,3-0,55 km × LV, avec la pente `VILLE_PENTE` (environ 17 %), aucune montée de liaison, la rampe d'entrée, et `PLN` sans garde-fou de 170° (ou porté à 400° ou plus) ;
  - **le paquet** = les modules du 3/11 (`mParking` à ses valeurs de l'époque, 400-460° ; `mBretelle`, `mAngles`, `mCarrefourS`, `mPont`, `tSlalom`, `tCorde`) **plus** les scènes de `VS` **plus** les modules du lot A (`vcModules`) **plus** les raccourcis `vSaut` et `vPetit`, déposés comme aujourd'hui dans `MODMARK` et `FILETMARK` ;
  - **garder** `vsDevers`, `vsReserve` / `vsBatir`, `vsCroise` (plancher de hauteur libre de 46 à 60 m) et `vsMalusTenue` ;
  - **remplacer**, pour la ville seulement, `routeRecoupe` par une version qui ne compte que les empilements à moins de 80 m de hauteur, et sortir `vsMalusBoucle` du jeu, ou exempter les modules d'étage.
- Fichiers : `ville-entree.js` (`genCtrl1`, plus le malus dans `genCtrl` l. 703 **et** `genCtrlG` l. 712) et `ville-scenes.js` (les malus).
- **Risques** :
  - la tenue : au 3/11, le 90e percentile était à 8,6 s pour un seuil de 8,5 s ;
  - la pente maximale (55 % au 3/11 contre 40,5 % aujourd'hui) : borner la rampe ;
  - les tours relevées en masse par `tourLibre` : coût de construction et trous dans la trame, **non mesuré** ;
  - la taille de `MCJ`, qui change l'ordre des tirages : la ville change forcément, d'où l'interrupteur.
- **Lots A, B et C** : compatibles. Ils s'accrochent à `VS` et `MCJ` sous `MC==='ville'`, et le lot B à `VS.entree()` et l'ouverture. Il faut leur réserver une place dans le paquet et dans `LONG`.
- **Crypto City et la vitrée** : chaque garde doit tester `MC==='ville'`, et dans `genCtrl` / `genCtrlG` `!c.crypto && !c.vitre`. La vitrée passe par le malus avec `id==='ville'` (commentaire de la l. 703), donc changer `routeRecoupe` sans cette garde la changerait. Preuve à faire avec `node outils/banc-routes/empreinte.cjs graines=1-12` : crypto doit rester `5447610bd8f2` / `eae97981f833`. Je n'ai pas vu d'empreinte de référence pour la vitrée dans le journal : en prendre une avant de toucher.
- Au banc, la version la plus proche que j'ai pu simuler (HEAD avec `?gen=ancien`, garde-fou à 330° et recoupement à 80 m) donne 15,9 % de pente, **46 % d'enclavé** et une hauteur libre minimale de 65 m. Il manque encore les 14 points perdus par cbac2acaa (spirale du parking et respirations du 3/11). D'où, dans l'option 3, la reprise des valeurs du 3/11 et pas de celles du 5/11.

**Option 4 : porter tel quel le générateur du 3/11 derrière un drapeau** (`?ville=0311`)
- Fidélité maximale (60 % d'enclavé), mais on perd `VAME` (scènes, dévers, raccourcis, charte) et les lots A, B et C ne s'appliquent plus.
- C'est une impasse comme produit. Comme référence pour une comparaison avec Sacha, c'est utile et rapide.

**Recommandation : l'option 3.** Montrer d'abord l'option 0 (ou l'option 4) à Sacha pour valider que c'est bien cette géométrie-là qui lui manque. Pour la ville, l'objectif chiffré serait : enclavé ≥ 50 %, pente 15-17 %, ≥ 4 tours de virage, hauteur libre ≥ 46-60 m, R1 tenue, empreintes crypto inchangées.

### Ce que je n'ai pas pu vérifier
- Rien dans le vrai jeu ni à l'œil.
  - Le banc mesure la route (les points de contrôle), pas les tours. Que l'enclavé corresponde à « des immeubles au-dessus de nous » dépend de `tourLibre` et `buildVoxCity`, que je n'ai pas mesurés.
  - L'impression de « tunnel » vient aussi de la ville du 3/11 (`ville-v3.js` : canyon de 55-330 m, pied à −50 m), qui n'est pas ma part.
- Les noms des modules du 3/11 manquent dans `MODMARK` (pas de `fig`), d'où « modules / liaisons » au lieu des noms.
- Il n'y a pas de mesure pour la vitrée : `charge.cjs` n'a pas de carte vitrée. Crypto City n'a pas été rejouée sur les prototypes.
- Les options 2 et 3 n'ont pas été prototypées dans leur forme finale. Leurs chiffres sont des estimations par voisinage (`?gen=ancien` plus les retouches).
- La durée du tirage avec un paquet plus gros et la tranche de malus sur iPhone n'ont pas été mesurées.
