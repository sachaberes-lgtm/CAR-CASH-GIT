# LA GRANDE VITESSE (12/11, session `grande-vitesse`)

Sacha (build 73, vol 75) : « gros problème lors d'un changement de map au palier 17, il faut vraiment bosser sur la grande vitesse ».
Branche `grande-vitesse` (worktree `~/cash-car/grande-vitesse`, partie d'`origin/ios-ultime` f6e7d1544). Rien sur `main`, rien fusionné dans `ios-ultime`, aucun build.
Banc : serveur `cashcar-grande-vitesse` (port 8898, profileur JS autorisé), volet intégré 390×844, `?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0&pistegraine=777`.
Charge du Mac pendant les mesures : 2,9 à 4,6 (mesures de temps indicatives ; les comparaisons qui comptent sont des compteurs ou des parts du profil).

## 1. Le gel de 11 s au changement de map : TROUVÉ et CORRIGÉ

**Cause** (boîte noire : `gel | 11.2 s | … play figVol`, c'est-à-dire aucune image pendant 11,2 s, caisse EN VOL) :
`portPasseNiveau` (gameplay/portail-passage.js) construisait tout de suite quand la caisse franchit le portail en vol — l'attente sous le voile
(`prebRetient`) n'existait que pour le sol. Le pré-bâti de la grotte n'était pas fini (à grande vitesse il ne l'est presque jamais) ; `prebGraine` faisait
« le reste d'un trait » avec une tranche infinie, mais le creusement attend son travailleur (`'attente'`) : le travailleur refuse une tranche infinie
(`grotte | repli passage sans voile (tranche infinie)`) et la grotte se creusait **sur le fil principal**, d'un bloc. Sur un téléphone chaud, le creusement
prend 6 à 22 s : d'où les 11,2 s figées.

**Reproduit au banc** (grotte en préparation, travailleur en train de creuser, portail franchi en vol par `dbgPortailVol`) :

| | avant (`?sans=gvportail`) | après |
|---|---|---|
| pire image au passage | **944 ms** d'un bloc | **75-94 ms** |
| boîte noire | `grotte · repli passage sans voile (tranche infinie)` | `grotte · travailleur …` puis `portail · attente 3 205-4 946 ms sous le voile` |
| ce que voit le joueur | image figée | voile blanc + serpent noir animé (CSS), puis la grotte |
| même scène au sol | (déjà tenue sous le voile, image figée) | 4 066 ms sous le serpent, pire image 79 ms |

Correctifs (téléphone seulement : tout passe par `PREBFIN` = `TEL_NATIF` ; l'ordinateur ne change pas) :
- **En vol aussi**, le reste du pré-bâti se fait sous le voile ; la caisse est TENUE en l'air (`PORTV.vol`, branche à part dans boucle-3-physique : ni le vol, ni sa jauge, ni ses heurts ne courent ; `newTrack` la repose ensuite sur la route neuve, comme avant). `?sans=gvportail`
- L'attente ne coupe plus à 25 s **tant que le travailleur creuse** (`PREBF.voileTrav` = 60 s) : la couper menait au même repli sur le fil principal. `?sans=gvportail`
- **Une attente qui dure (> 0,4 s) montre le voile blanc du serpent** (`voileSerpent`, déjà dans le jeu pour les départs : règle de Sacha « noir sur blanc pour les transitions ») au lieu d'une image figée ; l'animation est du CSS, elle tourne même quand le script travaille. Retiré à la fin de l'attente, à l'abandon (mort) et au départ suivant (`PORTV.ser`). `?sans=gvportail`
- Sous le serpent, les tranches passent à 45 ms et la suivante part en tâche (`setTimeout`) au lieu d'attendre l'image (8 ms si le travailleur calcule). `?sans=gvvite`
- On n'attend que le travail que CE portail va prendre (règle de `prebGraine`). `?sans=gvportail`
- La boîte noire note chaque attente : `portail | attente N ms sous le voile | vol|sol · carte (· pas fini)`.

## 2. Ce qui grandit avec la vitesse — la liste chiffrée

### Sur le téléphone (boîte de vol du 12/11, toutes les courses : 13 Pro, QL 10)
- **État « serious »** (13 469 s de course) : coût GPU mesuré (barrière de la puce) **plat** : médiane 15-16 ms de 0 à 1 200 km/h. Travail JS ~4 ms même à 1 000 km/h (vol 67).
- **État « critical »** (5 011 secondes mesurées) : régression GPU = 13,0 ms **+ 1,76 ms par 100 km/h** + 4,05 ms par minute passée en critical (JS : 4,3 + 1,12/100 km/h + 2,86/min). R² 0,18 : très bruité, mais les deux effets existent. Vol 75 : 9-18 ms jusqu'à 213 s (≤ 790 km/h), puis 23-36 ms à 700 km/h dès 215 s — **le saut suit l'aggravation du bridage, pas la vitesse** ; la vitesse ajoute ensuite sa part (40-55 ms au-delà de 1 800 km/h).
- Le « travail » JS du vol suit le coût GPU à ~10 ms près : sur une puce bridée, les appels WebGL attendent la puce.

### Au banc (Mac, `?tel=1`, même course, moteur 0 puis moteur 19)
| mesure | moteur 0, 250-450 km/h | moteur 19, 800-1 500 km/h (chutes comprises) |
|---|---|---|
| fil principal occupé (profil 30 s) | 20,4 % | 15,4 % |
| appels de dessin | 81-187 | 69-203 |
| triangles | 150-690 k | 108-691 k |
| champ de la caméra | 104-127° | 88-125° |
| coût GPU (barrière, Mac) | 4-11 ms | 3,5-15 ms |
| surface des particules rastérisées (`dbgPtAire`) | 11 800 px (6 % de l'écran) | 14 700 px (7 %) |

Fonctions dont la part grandit avec la vitesse (points de % du fil, profil inclusif) : `drawSpeedLines`/`ventDessine` +0,41, `nxfTick` +0,39 et `nx3Tick` +0,35 (la nitro, plus tenue à grande vitesse), `jadeChuteTick` +0,33, `setMatrixAt`/`compose` +0,29 (instances), `flowTick` +0,26 — **moins de 2,5 points en tout**. Le pré-bâti (`prebTick`) baisse (−5,2 pts) parce qu'au Mac il finit plus tôt.

**Conclusion** : rien dans le jeu ne se génère ni ne se pose « par mètre » en course (la piste et le décor d'une map sont bâtis une fois, à l'avance). Ce qui
suit vraiment la vitesse :
1. **Le pré-bâti de la map suivante** : le même travail doit tenir dans une map qui dure moins de secondes (à 2 700 km/h, 13 à 25 s) ; sa tranche monte alors jusqu'à 16 ms par image (`prebTranche`). Au Mac c'est ~1,4 % du fil sur 42 s à haute vitesse (surtout `pisteRoute`/`normales9`) ; ×6-10 sur un téléphone chaud.
2. **La grotte grandit avec le palier moteur** (sa longueur suit l'échelle de la piste) : creusement au Mac 0,6-1,1 s au palier 0 (grille 4,9-5,7 Mo), **3,95 s au palier 19 (10,4 Mo)** ; attente sous le voile 9,9 s au palier 19 dans le pire cas (portail pris dès le début du creusement).
3. Côté GPU, la part propre à la vitesse (+1,76 ms/100 km/h en critical) **ne se voit pas au banc** : ni appels, ni triangles, ni champ, ni particules ne grossissent assez. Suspects restants (non mesurables sans le téléphone) : effets de nitro et de vent (plus tenus à grande vitesse), changements de map plus fréquents (liaison des programmes `prebLie`, envois de géométrie), bridage plus profond avec le temps.

## 3. Ce qui a été allégé (pré-bâti)
- **`pris`** (grtDecorsG, grottes-2.js) cherchait la salle en parcourant tous les échantillons à chaque appel : ~20 % du pré-bâti de la grotte au profil. Dichotomie, mêmes bornes, même tirage `fr()` : **1 000 000 de cas comparés, 0 différence** (la grotte est la même au bit près). `?sans=gvpris`
- **`prebTravaille`** : une horloge par pas au lieu de trois (la boucle et ses `performance.now()` pesaient ~1/3 du travail au profil). `?sans=gvhorloge`
- Pré-bâti de la grotte au Mac : 2,07 ms par tronçon avant, 1,29 après (deux grottes différentes : ordre de grandeur, pas une mesure stricte).
- **La grotte va d'abord à son travailleur** : tant que le creusement n'est pas parti, tranche de 10 ms (dans ce que l'image laisse) au lieu de 4 — le travailleur creuse ensuite en parallèle des tranches ordinaires. `?sans=gvgrotte`

Rien n'a touché la génération des routes (`toutes.mjs` non relancé : aucun fichier de génération modifié ; `pris` place les décors de la grotte, prouvé identique).

## 4. Les changements de map à 2 700 km/h : l'état
- **Plus aucun gel d'un bloc au portail** quand le pré-bâti n'est pas fini, au sol comme en vol : l'attente se fait sous le voile animé, le fil principal rend la main à chaque tâche (pire image 75-94 ms au banc au palier 0 ; une image de 612 ms au palier 19, dans l'installation de la grotte géante au passage — à surveiller, ×6-10 sur téléphone).
- **Prêt au portail à 2 700 km/h : NON pour la grotte sur un téléphone chaud.** Le pré-bâti part déjà dès l'entrée de la map d'avant (avance ×3 de `prebAvanceK`, maxée) ; au palier 17-20 le creusement seul dépasse la durée de la map d'avant (Mac 4 s ⇒ téléphone chaud estimé 25-40 s, contre 13-25 s de map). La course attendra donc sous le serpent ; cette attente peut durer **plusieurs dizaines de secondes** sur un téléphone critical (plafond 60 s, puis repli d'un bloc comme avant).
- Les autres maps (jade, ville, espace, nuages, canyon) : pré-bâti 0,2-0,5 s de calcul au Mac, prêtes au portail au banc à 1 100-1 450 km/h.

## 5. Ce qui reste, et pourquoi
1. **La grotte au palier 17-20** (le vrai reste) : pour qu'elle soit prête, il faut soit creuser **par morceaux pendant qu'on roule** (la caisse entre dès que les premières salles sont creusées ; le maillage est déjà servi par morceaux, `GRW_AVANCE`), soit **deux travailleurs** sur deux moitiés de route, soit commencer deux maps à l'avance. Chacune est un chantier de plus d'une session (creusement dans `grotte-travailleur.js` / `grottes-1.js`). Ne PAS raccourcir la grotte (ça changerait le jeu).
2. **À lire sur le téléphone** au prochain build qui contient cette branche : les lignes `portail | attente … ms sous le voile` (combien de temps, à quelle carte, en vol ou au sol) et `grotte | travailleur … ms de creusement` au palier 17-20. Si l'attente dépasse ~10 s, le point 1 devient prioritaire.
3. **Le coût GPU qui suit la vitesse en critical** : non reproduit au banc. Mesure à faire sur le téléphone : la même course à 1 500 km/h nitro tenue / nitro coupée (`?sans=` à créer) et vent coupé, pour isoler sa part.
4. L'image de 612 ms à l'installation de la grotte géante (palier 19) : profil à faire (`pisteInstalle`, `chauffeRendu`, envois de tampons).

## Bancs ajoutés (rien ne change au jeu)
- `dbgImmortel(true)` : toute mort est ignorée (chutes replacées) — pour rouler longtemps au pilote à grande vitesse.
- `dbgGrotteTrav().creuse` : le travailleur est en train de creuser (pour franchir le portail pile à ce moment-là).
- `dbgPtAire()` : surface des points rastérisés par réserve (un trait étiré = un carré de côté longueur + épaisseur).
- `dbgGrotteDecorHash()` : empreinte du décor de la grotte en place.
- Recette du test du portail (dans la page) : `dbgClassique('grotte')` → `dbgJadeAller(L-2500)` → attendre `dbgGrotteTrav().creuse` → `dbgPortailVol(0,0,25,0,0,-120)` ; mesurer le plus long trou entre deux minuteries de 5 ms.

## Commits
- `324530650` le portail franchi en vol n'est plus un gel (v1531)
- `d553013bc` pré-bâti de la grotte allégé, attente sous le voile plus courte (v1532)
- (ce commit) garde « le bon portail », ce document (v1533)
