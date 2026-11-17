# Routes uniques : le diagnostic AVANT (Jade et l'orbite), 17/11

**La plainte.** Sacha : « la map prend toujours la même direction, on voit toujours les mêmes modules, Jade commence toujours par une boucle, une grande descente et une autre boucle ».

**Le code mesuré.** Le commit `88a648892`, c'est-à-dire le code d'AVANT la refonte. L'outil lit ce commit avec `git show`, pas le worktree, qui est en cours de réécriture. On mesure 200 graines (1-200), aux paliers 0 et 10, sur quatre variantes :

- Jade par défaut ;
- Jade avec `?jade=avatar` ;
- l'orbite par défaut ;
- l'orbite avec `?espace=voyages`.

Les deux drapeaux sont ÉTEINTS dans le jeu.

**Ce qui est mesuré et ce qui est lu.** Tous les chiffres des tableaux sont mesurés par l'outil, avec les vrais générateurs chargés dans un vm Node. Les causes (§3) sont lues dans le code, avec fichier:ligne au commit `88a648892`. Les chiffres de §2 les confirment.

## 0. L'outil (il resservira APRÈS la refonte)

```
node outils/banc-routes/uniques/mesure.cjs carte=jade|espace [search='?jade=avatar'] [graines=1-200] [paliers=0,10] [ref=<commit>] [out=…] [etiquette=apres] [nom=…] [chaine=1] [seuils=100,200,300]
node outils/banc-routes/uniques/planche.cjs fichier=<…-mesure.json> [paliers=0,10] [parties=1-12] [km=0]
```

- **`routes.cjs`** : le chargeur. Pour Jade, c'est le chemin du jeu : `pisteRoute → genJadeG → genJadeAG`, rejoué d'un trait par `genJadeA(mulberry32(g), g)`. Pour l'orbite, c'est le prélude de `charge.cjs` recopié : `genCtrl → genCtrl1` (meilleur-de-6), puis `pisteTordPropre`. On obtient la route roulée finale, avec les MODMARK recalées.
  - Sans `ref`, il lit le worktree. Il prend `route-uniques.js` et `jade-uniques.js` s'ils existent. Le prélude ne redéclare pas `JADE_U` si un fichier chargé le déclare.
- **Le repère** : l'origine est au 1er point. z suit le cap initial (sur les 60 premiers mètres), x va du côté où le cap croît. Le cap est déroulé (non replié) et la pente donnée en degrés.
- **La mémoire de l'orbite** : `ORB_PIOCHE` (les modules de la route d'avant) est ENCHAÎNÉE de graine en graine, comme dans le jeu. `chaine=0` repart à zéro à chaque route.
- **Le temps** : 45 à 210 ms par route. Une variante, soit 2 × 200 routes plus la matrice de 19 900 paires, prend 25 à 80 s. Les quatre variantes et les 16 planches prennent environ 6 min.
- **Les sorties** :
  - `avant/<carte>-<variante>-mesure.json` (tout) et `-resume.txt` (les tableaux) ;
  - `avant/<carte>-<variante>-p<palier>-faisceau.png` : les 200 tracés de dessus (même échelle en x et en z) et de profil, une couleur par 1er module ;
  - `avant/…-12parties.png` : les graines 1-12, avec le tracé, le profil et les modules dans l'ordre, chacun de sa couleur.

## 1. La graine : elle est bien neuve à chaque partie (lu dans le code)

**En jeu normal, la graine est tirée au hasard à chaque route.**

- `newTrack` tire `sd=(Math.random()*1e9)|0` (`rendu/traces-pneus.js:104`).
- La piste bâtie d'avance (le portail) tire aussi `PREB.sd=(Math.random()*1e9)|0` (`moteur/piste-prebati.js:379`) et garde SA graine (`traces-pneus.js:109`).
- Les niveaux du mode classique sont faits par `sfNiveau`, qui pose `graine:0` : « une piste neuve à chaque fois (la jade comprise) » (`maps/continuite.js:176`).

`?pistegraine=n` fige la graine, pour le banc seulement.

**Il y a une exception : `?map=jade` (BALADE) et `?niveau=jade` (JADE_JEU).**

- `lvlChoisir` rend alors `NIV_JADE` (`continuite.js:231`), dont `graine` vaut `0x51ADE` en dur (`maps/jade-1.js:19`).
- `traces-pneus.js:110` applique cette graine (`if(niv&&niv.graine)sd=niv.graine`).
- **Toutes les parties y ont donc LA MÊME route.** Ce n'est pas le JOUER par défaut (classiqueJouer), mais quiconque teste par `?map=jade` voit toujours la même vallée.

**Jade : la graine elle-même sert de dé à la structure.**

- `genJadeAG` (`jade-alleluia.js:76`) pose `fam=gr&1` (parité) et `rot=(gr>>>1)%4`. Deux bits de la graine choisissent la famille et la rotation des scènes.
- C'est uniforme quand la graine est au hasard. Mesuré : fam0 = fam1 = 100 sur 200, et chacune des 4 rotations à 25 %.

**L'essai gagnant retenu (`JADE_AMEMO`, `jade-alleluia.js:82`) n'est pas en cause.** Sa clé contient `g0` (le 1er tirage de la graine), le palier, etc. : une graine neuve ne retombe jamais sur une route gardée.

**L'orbite a une mémoire entre les routes.**

- `ORB_PIOCHE.der` (`orbite-modules.js:42`, posée par `orbPioche()` à `ville-entree.js:696-697`) : les modules de la route d'avant ne reviennent que si rien d'autre ne tient.
- `ORB_PIOCHE.voyDer` : on ne tire pas deux fois de suite le même voyage.
- C'est la seule « anti-répétition » qui existe avant la refonte. Elle n'agit que sur 1 ou 2 temps forts (§3B).

**Conclusion : la graine n'est PAS la cause.** Les routes se ressemblent parce que le générateur écrit le même squelette quelle que soit la graine.

## 2. Les chiffres (mesurés, 200 graines par case)

Définitions des colonnes :

- **cap ±** : l'écart-type du cap cumulé à l'abscisse donnée.
- **faisceau** : la largeur p5-p95 du latéral x.
- **y ±** : l'écart-type de l'altitude.
- **RMS paires** : la distance 3D médiane entre deux routes sur les 1,5 premiers km. « miroir » compte une route et son symétrique gauche/droite comme la même route.
- **formes < 200 m** : le nombre de groupes de tracés (1,5 km) qui diffèrent de moins de 200 m RMS, en regroupement « chef de file ».
- **têtes / suites** : le nombre de suites distinctes des 3 premiers modules, puis de la route entière, sur 200 routes.

### Jade par défaut (le jeu)

| | palier 0 | palier 10 |
|---|---|---|
| longueur (cible × …) | 7,99 km (× 1,49) | 11,0 km (× 1,58) |
| cap ± à 300 / 500 / 1000 m | 24° / 33° / 67° | **2° / 26° / 89°** |
| y ± à 300 / 500 / 1000 m | **0,1 / 13 / 94 m** | **0 / 0 / 1,1 m** |
| faisceau à 500 m / 1 km / 3 km | 252 / 821 / 2271 m | 117 / 816 / 1788 m |
| RMS paires 1,5 km méd (miroir) | 345 m (268) | 313 m (**150**) |
| formes < 200 m (miroir) | 17 (12) | **4 (2)** |
| 1er module | 8 scènes à 12,5 % chacune, toujours à **312 m ± 0** | **une BOUCLE à 100 %** (puits 28, spirale 28, stade 23, colimaçon 22 %), à **669 m ± 0** |
| rang 2 / 3 / 4 / 5 | boucle 100 % / envers-couloir 100 % / **balcon 100 %** / boucle 100 % | envers-couloir 100 % / **balcon 100 %** / boucle 100 % / — |
| têtes de 3 / suites distinctes | 16 / 16 | **4 / 4** |
| modules par route, catalogue vu | 5 ; 15/15 | 4 ; **7/15** (jamais : plongée, îlots, chas, mur, tours, cascade, russes, voûte) |
| ouverture : pente ± jusqu'à 300 m | 0 à 0,9° (écrite) | 0° jusqu'à 600 m (écrite) |

### Jade `?jade=avatar` (éteint)

| | palier 0 | palier 10 |
|---|---|---|
| cap ± à 300 / 500 / 1000 m | 37° / 42° / 64° | **2° / 26°** / 77° |
| y ± à 500 m | 46 m | **0 m** |
| RMS paires (miroir) | 416 m (315) | 299 m (196) |
| formes < 200 m (miroir) | 34 (21) | 7 (4) |
| 1er module | 13 scènes, la plus fréquente 13 % | grands sauts : cirque 22, passe 19, corniche 18, ange 14, lacets 13 % (≈ 86 % sont un « R ») |
| têtes de 3 / suites | 136 / 182 | 71 / 111 |
| catalogue vu | 27/32 (jamais : spirale, stade, colimaçon, puits, lacets) | **11/32** |

### L'orbite par défaut (le jeu)

| | palier 0 | palier 10 |
|---|---|---|
| longueur | 8,97 km [8,91-9,26] | 11,49 km [11,48-11,50] |
| cap ± à 300 / 1000 / 3000 m | 39° / 59° / 129° | **3,7° / 8,6° / 64°** |
| faisceau à 300 m / 1 km | 96 / 377 m | **3 / 669 m** |
| pente (ouverture) | −32 ± 3° dès le portail | idem |
| RMS paires (miroir) | 247 m (174) | 278 m (**72**) |
| formes < 200 m (miroir) | 6 (**3**) | 2 (**1**) |
| 1er module | surbaissé 23, plongeant 21, fronde 20 % (= 64 % « change de face ») | cascade 33, faille 31 % (= 64 % « vol ») |
| rangs 3-5 | sret 46 / lacet 69 / rentrée 73 % | **rentrée 95 % puis plongée 95 %** |
| têtes de 3 / suites | 64 / 71 | **19 / 19** |
| présence | rentrée 100 %, plongée 100 %, lacet 83 % | rentrée 100, plongée 100 ; jamais : torsade, bobsleigh, ceinture, faille à l'envers |
| catalogue vu | 13/14 | 9/14 |
| direction | cap final déroulé ± 346°, amplitude méd 459° | ± 324°, amplitude 389° |

### L'orbite `?espace=voyages` (éteint)

| | palier 0 | palier 10 |
|---|---|---|
| RMS paires (miroir) | 267 m (170) | 166 m (**70**) |
| formes < 200 m (miroir) | 6 (2) | 2 (**1**) |
| 1er module | dévers inversé 22 %, spirale 11 %… | **le géant du voyage à 100 %** (nébuleuse 28, astéroïde 28, roue 23, lune 22 %) |
| suite | (rang 4 : lacet 78 %) | géant > **faille 87 %** > rentrée 89 % > plongée 89 % |
| têtes de 3 / suites | 92 / 98 | **9 / 9** |
| catalogue vu | 21/24 | **9/24** (jamais : les 6 tracés neufs bosses, piqué, balancier, dévers inversé, marches, spirale, ni torsade, sret, surbaissé, plongeant, fronde…) |

### Ce qui saute aux yeux

**Jade, palier 10.** Les 200 routes ont exactement le même squelette : BOUCLE (669 m) > envers > BALCON (le climax, puis un piqué à 49-52°) > BOUCLE. Il n'existe que 4 suites distinctes. Jusqu'à 1 km, le profil d'altitude est identique au mètre près (± 1,1 m), et les 600 premiers mètres sont écrits à l'identique.

C'est la plainte mot pour mot, dès le palier 6 :

- au palier 0, la route commence par une scène A au hasard (312 m), puis BOUCLE > envers > BALCON > BOUCLE ;
- la route « boucle, grande descente, boucle » commence donc partout au rang 2.

Voir `avant/jade-defaut-p10-12parties.png`.

**L'orbite.**

- L'ouverture est une droite de 300 m, puis un demi-S de 50-65° qui revient sur l'axe. Le tracé forme une « tulipe » symétrique dans `espace-defaut-p10-faisceau.png`.
- La pente est constante (~ −28 à −32°) sur toute la route.
- Au palier 10, il n'y a qu'**une forme** (au miroir près) sur 1,5 km.
- La route se termine toujours par rentrée > plongée.

## 3. Les causes, dans le code (lu ; fichier:ligne au commit `88a648892`)

### 3A. Jade

**1. LE PAQUET : la suite des scènes est écrite d'avance, quatre rôles sur cinq places, et le hasard ne choisit que la DÉCLINAISON de chaque rôle.** `jade-alleluia.js:204-206` :

```js
const F9=JA_FAM[fam&1],…,autres=a4.slice(rot|0).concat(a4.slice(0,rot|0)),racs=mel(F9.rac.slice());
let file=(LC>=34*vT?[autres[0]]:[]).concat([racs[0],F9.env]);const apres=[racs[1]],plus=LC>=34*vT?autres.slice(1):[];
```

Puis `:217-220` :

```
for(nom of file) suite(…) ; if(!climax) suite('balcon',{climax}) ; for(nom of apres) suite(nom) ; for(nom of plus) …
```

La route vaut donc toujours **[A?] → raccourci n° 1 → l'envers de la famille → balcon (climax) → raccourci n° 2 → [B s'il reste de la place]**.

- Les deux familles sont dans `JA_FAM` (`:44`). Chaque famille a 2 raccourcis, 1 envers et 4 « autres ».
- Le climax est toujours `balcon` (`clx9='balcon'`, `:207`).

**2. LES « RACCOURCIS » SONT LES BOUCLES.** `raccourci()` (`:125-137`) dessine une lèvre, puis LA CHUTE à 30° (`:127`), puis un arc de **360° − 18°** (`arcP(Rp,sg*(2*PI-18*rd),…)`) autour d'une tour, d'une île ou de trois tours. Le stade en fait deux demi-tours.

- Les 4 raccourcis (spirale, stade, colimaçon, puits) sont tous une boucle.
- Chaque route en a exactement deux, de part et d'autre du climax.

**3. « LA GRANDE DESCENTE », C'EST LE BALCON.** `balcon()` (`:170-…`) : un grand virage presque à plat, puis `crete(-(49+r()*4)*rd,…)` et `va(1,3-1,6 s,…)`, soit un piqué de 49-53°. Il vient toujours au rang 3 (palier ≥ 6) ou 4 (paliers 0-5). Mesuré : balcon 100 %.

**4. POURQUOI ÇA COMMENCE PAR LA BOUCLE AUX PALIERS RAPIDES.** La scène A n'est posée que si `LC>=34*vT` (`:206`).

- `LC` (longueurCible) vaut `(45−25k)·vP·élan·0,85`, et `vT` vaut `vP·élan`. La condition devient donc `0,85·(45−25k) ≥ 34`, soit `k ≤ 0,2`, soit **palier ≤ 5**.
- À partir du palier 6, `file=[racs[0],env]` : la 1re scène est une boucle.
- Avec `?jade=avatar`, les trames privées de « O » commencent par « R », un grand saut : `if(!ouverture&&(t==='O'||t==='F'))continue;` (`jade-avatar.js:64`, trames `:41`).

**5. L'OUVERTURE EST ÉCRITE.** `:213-214` :

```js
va(Math.max(2*vP,200),(r()-.5)*8*rd,0,{n:4});  va(.8*vT,±(20+r()*15)*rd,-16*rd);
```

- C'est 200 m à plat (palier 0) ou 316 m (palier 10), puis 0,8 s à −16°.
- La seule part de hasard est ±4° de cap et 20-35° de virage.
- Mesuré : la pente a un écart-type ≤ 0,9° jusqu'à 300 m (palier 0) et de 0° jusqu'à 600 m (palier 10).

**6. LES SCÈNES SONT ENFERMÉES PAR FAMILLE ET PAR ROTATION.** `fam=gr&1` et `rot=(gr>>>1)%4` (`:76`).

- La scène A est `autres[rot]`, donc 1 scène sur 4 de la famille.
- Aux paliers ≥ 6, A et B disparaissent : 8 des 15 scènes ne sont **jamais** jouées (mesuré 7/15).
- Les 17 scènes des verbes (`JAV_CLES`) dorment derrière `?jade=avatar` (`jade-avatar.js:27`).

**7. LA DIRECTION.** Ce n'est PAS un rappel vers un axe.

- La boussole (`:112`) vise un cap qui tourne de ±95-150° toutes les 4,5-6,5 s.
- Le garde-fou (`:115`) force un virage de 70-100° si 6 s tiennent dans 60°.
- Le cap initial est tiré sur 360° (`phi=r()*6.2832`, `:89`).
- Mesuré : le cap final déroulé fait ±586°, et la direction de la fin vue du départ ±84°. En direction absolue, Jade ne prend donc pas toujours le même chemin. Ce qui se répète, c'est la **forme** (le squelette et les boucles) et le **profil**.

**8. LE MEILLEUR-DE-10 NE CHOISIT PAS LA FORME.** La structure est fixée avant les essais. Les 10 essais (`:76-82`) ne changent que la géométrie fine.

- La note (`:291`) n'atteint jamais le seuil d'arrêt `≤ 0,6` : sa moyenne mesurée est de 3,4 (palier 0) et 4,9 (palier 10), surtout parce que `|lon−LC|/LC·3` pèse ~1,5-2 avec des routes 49-68 % trop longues. Les 10 essais tournent donc toujours.
- L'essai gagnant est réparti à peu près uniformément de 0 à 9 : la sélection ne biaise pas vers un type.

### 3B. L'orbite

**1. LA PHRASE EST FIXE.** `ville-entree.js:538` force le genre `ORBITE` (`G9=EV3?'ORBITE':G0`). Une route vaut toujours :

> ouverture (une droite, puis un demi-S de 50-65° : `:569`) → temps forts → climax → **rentrée → plongée**

- La rentrée et la plongée sont dans `climax()` (`orbite-modules.js:155-160`), donc toujours jouées. Mesuré : rentrée 100 %, plongée 100 %.
- Sur les routes ≥ 90 s de croisière (paliers 0 à ~6), le climax est le S retourné ou la grande torsade, une fois sur deux (`:156-158`), ou la faille à l'envers en VERTIGE (`:155`, `CXE` à `:65`). Il est suivi du lacet (`:159`).

**2. LES TEMPS FORTS SONT CONTRAINTS PAR RANG.** Dans `tire()` (`:148-151`) :

- `faceI` (`:149`) impose que le 1er (ou le 2e) temps fort soit un module qui « change de face » : `ORB_FACE9={surbaisse,fronde,plongeant}`, plus `sret`.
- `volI` impose un module de vol (faille ou cascade) au 1er ou au 2e (`volD`, `:147`).
- `ORB_VIR` limite la route à une seule faille ou cascade.
- Mesuré au palier 0 : rang 1 = surbaissé, plongeant ou fronde dans 64 % des cas ; rang 2 = faille ou cascade dans 65 %.
- Au palier 10, la route n'a que **deux** temps forts (11,5 km, mais la rentrée et la plongée prennent la fin). Ce sont presque toujours {un module de vol, un module qui change de face}, d'où seulement 19 suites distinctes.

**3. LA DIRECTION D'ENSEMBLE : UN AXE QUI TOURNE EN SPIRALE, ET DES VIRAGES BORNÉS À CET AXE.**

- `phiAx=phi` (`ville-entree.js:134`), avec `startPhi=0` toujours (`genCtrl(rnd,new THREE.Vector3(0,0,0),0)`, `moteur/depart-avance.js:110`). **L'orbite part donc toujours plein +z dans le monde**, alors que Jade tire son cap sur 360°.
- La spirale : `sAx=±1`, `TOT_AX=(180+rnd·120)°`, remappé par ORB_FACE, plus 60° (VIR) et 55° (KM), soit **345-455°** sur la route (`:406`). `derAx` avance avec la part de route (`:553`, `:569`).
- `K.dev()` mesure l'écart du cap à cet axe. `cote()` (`orbite-modules.js:67`) ramène vers l'axe dès que `|dev|>ORB5.cap=72°`, et `borne()` interdit de finir un virage à plus de `capMax=140°` (`route-sans-haut.js:130`).
- La route est donc **une grande spirale de sens ±1** sur laquelle les modules ondulent. Au miroir près, il n'y en a qu'une (formes < 200 m : 3 au palier 0, 1 au palier 10).
- `?espace=voyages` remplace la spirale par une silhouette (spirale, S, zigzag, vague ou crochet : `orbite-voyages.js:47`), mais la règle de l'axe reste la même.

**4. LA PENTE EST LA MÊME PARTOUT.** `ORB5.desc=.5` (tangente 26,6°) × l'humeur (0,9 à 1,16, `orbite-modules.js:45-49`), tenue par pisteTord. Mesuré : −32 ± 3° dès le portail, et un profil presque linéaire (planche « profil »).

**5. `?espace=voyages` FORCE LE GÉANT EN 1er.** `orbVoyForce` (`orbite-voyages.js:124-126`) :

```js
if(!VOY||!VOY.fortG||VOY.fortFait||nFort<VOY.fortAt)return null; … return VOY.fortG;
```

avec `fortAt:0` (`orbVoyEtat`, `:35-45`). Sur une route de moins de 90 s, le géant est le 1er temps fort à 100 %, et le 2e est la faille à 87 %. Les poids des voyages (`VOY_LISTE`, `:17-22`) ne s'expriment qu'au palier 0.

**6. LE MEILLEUR-DE-6 (`rythmeMeilleur`, `route-rythme.js:161`) DANS UNE SEULE HUMEUR.** `ORB_PIOCHE.hum` est tiré au 1er essai et vaut pour les six (`orbite-modules.js:65`, remis à zéro à `ville-entree.js:696`).

- La sélection se fait par `rythmeNote` (virages par minute, droites, spirales, coudes, pente).
- L'essai gagnant est réparti de 0 à 5. Le meilleur-de-6 n'est pas la cause principale.

## 4. Les contraintes dures à garder dans le nouveau tirage (lu)

### Jade (`jadeAGenG`, `jade-alleluia.js`, commit 88a648892)

La note de l'essai (`:291`) est la somme des termes suivants. La pire note perd ; on s'arrête à `≤ 0,6`, sur 10 essais au plus (`JADE_A.essais`).

| terme | règle |
|---|---|
| `croisDur·0,2` | deux passages à plus de 350 m d'écart d'abscisse, à moins de 2·RH + 26 m en plan, doivent avoir ≥ 45 m d'écart en hauteur |
| `confl·1,2` | un décor (tour ou île) d'une scène ne touche pas la route d'une autre |
| `|lon−LC|/LC·3` | la longueur visée `longueurCible`. Aujourd'hui dépassée de 49-68 % : ce terme vaut à lui seul ~1,5-2 |
| `t30` ≤ 8 s, `t8` ≤ 3,6 s | la tangente 3D tenue dans un cône de 30° et de 8° (R1 et R2 : « pas plus de 10 s dans une même direction ») |
| roulis | max ≤ 50°/s, p95 ≤ 30°/s (R3 ; tout roulis écrit suit `rp`, au plus 1,11 × la moyenne) |
| envers | 8-20 % de la route, ≤ 8,8 s d'affilée |
| `dMin` ≥ 20 m | jamais deux passages à moins de 20 m |
| raccourcis | `racOk` ≥ 2 et `racRob` ≥ 1 : le vrai saut (VEQ_K.saut × SPD, pesanteur 23-28) se pose sur la sortie-tremplin, à 3 vitesses (R6). Ce sont précisément les deux BOUCLES : les remplacer demande un autre porteur de saut, sinon la note prend +4 à +11 |

Les règles de construction :

- **La géométrie** : `rayonPalier` donne `rP = 40 + 0,3·vP` ; les liaisons font 2,6-3,6 rP et les boucles 1,85-2,05 rP. Une crête s'arrondit à `0,85·vT²/23` (`crete`). Les liaisons plongent à 24-32°, le plongeon à 50-56°, le balcon à 49-53°.
- **Le cap** : la boussole et le garde-fou, en plus des contrôles.
- **L'envers** : jamais deux scènes à l'envers de suite (`JA_ENVERS`).
- **La fin** : 2,2 s droites (`fin9`) ; on n'ajoute de scènes que si `lon < LC − fin9 − 7·vT`.
- **Ce qui est écrit pour le reste du jeu** : MODMARK `{i0,i1,nom,fig,climax,rac}`, lues par les fils d'or, la caméra, le juge et le climax. `ZC`, les zones calmes du balcon. `JADE.bankN`, les normales de `TORD.N`.
- **Le décor** : `D` (tours, îles, pics), posé par scène, avec `jadeCouloirVol` (rien dans le couloir du vol).

### L'orbite (`genCtrl1` et `orbModules`)

- **Le cap** : `ORB5.cap = 72°` (rappel vers l'axe) et `capMax = 140°` (aucun demi-tour) (`route-sans-haut.js:130`). `SENS` : au-delà de 2,5 s du même côté, le virage suivant change de côté (jamais plus de ~9 s du même côté).
- **L'envers** : le budget `ORB_ENVMAX = 0,22` de la durée réelle (`ORB_ENVS`). Jamais deux grands tours de dalle d'affilée (`ORB_LOURD`). Au plus 2 fois le même module par route (R5).
- **Les modules imposés** : une seule faille ou cascade (`ORB_VIR`). Un module de vol au 1er ou au 2e temps fort, ou bien le lacet promis (`volLac`, `LACV`). Un virage qui change de face tôt (`faceI`).
- **La place** : `place(duree(k))` avec `ORB_DR` / `ORB_DD`. La réserve du climax est `reserve()` (climax + rentrée + plongée + lacet).
- **Les seuils de longueur** : ≥ 90 s (LONG : climax à l'envers puis lacet) ; < 44 s (pas de cascade, une torsade permise).
- **Les rayons** : `Rt(dur,a,mn)` n'est jamais sous `mn·rP`, et à toute vitesse `rP ≥ 0,62 ×` la croisière.
- **Les couchers** : à vitesse régulière (`cvTrap`, `ORB_K = 0,22`), ≤ ~33°/s.
- **pisteTord** : la descente D2 (`ORB5.desc × humeur`), les normales et MODMARK recalées sur la route roulée. La note de rythme du meilleur-de-6 vient de `rythmeNote` (`route-rythme.js:138`).

## 5. Ce qui m'a surpris

- **Jade au palier 10 n'a que 4 routes possibles** (au tirage du raccourci près). Son profil est identique au mètre près sur le 1er km, et 8 des 15 scènes n'y apparaissent jamais.
- **Les routes de Jade sont 49 % (palier 0) à 58-68 % (palier 10, avatar) plus longues que `longueurCible`.** La note n'est donc jamais sous 3, et les 10 essais tournent toujours (100-200 ms).
- **`?map=jade` et `?niveau=jade` jouent toujours la même route** (`NIV_JADE.graine = 0x51ADE`).
- **L'orbite part toujours plein +z dans le monde** (startPhi = 0), et son ouverture est la même tulipe.
- **Les humeurs (VOL, RUBAN, VERTIGE, CHUTE) ne changent ni la forme ni l'ordre** : elles ne modulent que des poids et la pente (± 3°).
- **`?espace=voyages` réduit la variété au palier 10** : 9 suites contre 19 sans le drapeau, parce que le géant est forcé en 1er.
- **Le worktree a changé pendant la mesure** : la refonte en cours, `route-uniques.js` et `jade-uniques.js`. D'où `ref=88a648892`.
  - ⚠ Pour la refonte : le worktree utilise `JADE_U` comme un DRAPEAU, dans `jade-avatar.js:27` (`JADE_AV=JADE_U||…`) et dans `jade-alleluia.js` (`U=JADE_U&&!JADE_A.force?jadeUPlan(…)`). Or `JADE_U` est déjà l'objet des uniformes de Jade (`const JADE_U={uSunDir:…}`, `jade-1.js:26`, utilisé par `jade-2.js`).
  - Dans le jeu assemblé, ce « drapeau » est donc TOUJOURS vrai, et `?sans=uniques` ne l'éteindra pas.
  - Au banc Node, le prélude de verbes-node.cjs (et le mien) pose aussi `JADE_U={uTime:…}`, vrai lui aussi.
