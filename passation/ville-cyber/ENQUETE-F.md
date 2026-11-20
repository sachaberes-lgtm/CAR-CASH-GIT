# Lot F : l'enquête. Ce qui fait l'image du 3/11 (20/11/2026)

Je n'ai écrit aucun code du jeu, rien commité. Les bancs sont dans `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-f/enquete/` (appelé `enquete/`) :
- `page-f3.cjs` : Chrome muet ; photos « flou du jeu » (-f) et « nettes » (-n) ; audit par appel ;
- `norm.cjs` : appels et triangles PAR IMAGE ;
- `image-stats.py` : L*, part de noirs, part de rose, netteté par bande ;
- `decor.cjs` et `tours-analyse.cjs` : le vrai `buildVoxCity` en Node.

Passes Chrome (verrou « ville-cyber-f », rendu à chaque fois, profils supprimés) :
- 16:05 → 16:07 : téléphone 844×390 ;
- 16:07 → 16:10 : 390×844 et ordinateur 1280×720.

Les passes de 15:xx de l'enquête interrompue sont gardées dans `enquete/chrome/{tel,pc,pc2,ab,nsw}`.

Conditions de toutes les courses : ville violette sous l'orage ; 3/11 lancé par `dbgAudit('aller',…)` ; aujourd'hui graines 1506 (844) et 1509 (390) ; `dbgAuto(1,0,{nit:0})`, 125-250 km/h ; HUD caché.

Planches :
- `planches/enquete-f-tel-844.jpg` : 3/11 | aujourd'hui | + flou V2 | + flou V2 + `equilibre=0` + `autoroute=0`, six moments ;
- `planches/enquete-f-pc-390-envers.jpg` : ordinateur, puis 390×844, puis les « immeubles à l'envers » du 3/11.

## En bref : ce n'est PAS d'abord le décor
Par ordre d'importance à l'œil :
1. **Le flou de vitesse est cassé depuis le 17/11 (bug, pas une décision).** C'est lui qui « noie » les tours.
2. **La route et l'air sont plus clairs et plus roses.** Cela vient de deux demandes de Sacha : l'équilibre des maps (06/11) et l'autoroute vivante (13/11).
3. **Le décor du 3/11 avait plus de tours au pied relevé et plus de murs des deux côtés.** L'écart est réel, mais il ne coûte presque rien.

Le reste ne compte pas :
- l'écart de budget annoncé (130 appels, 350-450 k triangles) est **un artefact de mesure** ;
- la caméra est la même.

## 1. Le budget, par image (audit par appel)
L'audit écoute deux `requestAnimationFrame`. Il voit donc 2 images à 60 i/s, et 1 seule quand le téléphone est en cadence 30.
- Le 3/11 tournait à 60 i/s : `toursLoin`, `neonsLoin` et `villeRais1` y sont dessinés **2 fois** par audit.
- Aujourd'hui, en 15:xx, ils étaient dessinés 1 fois.
- **Les 244-261 appels et 620-740 k triangles du contrôle D comptaient donc deux images.**

`norm.cjs` divise par le nombre d'images vues. Résultats par image, en moyenne :

| | 3/11 | aujourd'hui | aujourd'hui + recette (flou V2, `equilibre=0`, `autoroute=0`) |
|---|---|---|---|
| tél 844×390 (deux passes) | 130 / 369 k ; 131 / 299 k | 109 / 268 k ; 113 / 288 k | 104 / 279 k |
| tél 390×844 (deux passes) | 123 / 267 k ; 115 / 181 k | 106 / 239 k | 99 / 243 k |
| ordinateur 1280×720 (`poste=max`) | 150 / 513 k | 128 / 436 k | 124 / 372 k |
| programmes | 226-236 | 146-176 | 146-169, **0 compilé en course** |

D'où vient l'écart réel au téléphone (844, 3/11 → aujourd'hui, appels / triangles) :

| poste | 3/11 | aujourd'hui |
|---|---|---|
| route | 27 / 296 k | 33 / 200 k |
| ombres | 29 appels | 13 appels |
| pluie | 10 appels | 2 appels |
| **tours** | **6 appels / 28 k** | **6 appels / 17 k** |
| néons | 2 / 6 k | 2 / 4 k |

**Les tours pèsent 11 k triangles d'écart et 0 appel.**

Sur l'ordinateur, l'image d'aujourd'hui est déjà plus lourde que le 3/11 en route (457 k), mais pas en tours (23 k contre 42 k).

## 2. Les tours
**En Node** (`buildVoxCity` réel, graines 1-12, palier 0 ; entre parenthèses, sous ALLEGE) :

| | 3/11 | aujourd'hui |
|---|---|---|
| tours par route | 967 (652) | 776 (501) |
| hauteur médiane | 375 m (417) | 328 m (374) |
| murs des deux côtés à moins de 100 m | 77 % (74) | 59 % (53) |
| 1er rang (300 m devant, à moins de 120 m) | 8,9 tours (7,4) | 6,5 tours (5,3) |
| **tours « pendues »** (pied 40-300 m au-dessus d'une route) | **21,3 (17,8)** | **11,2 (8,3)** |
| route sous une pendue | 15,2 % | 11,9 % |

Au palier 10 : 20,0 pendues contre 14,1.
- Les ancres n'y sont pour rien : avec `?sans=villeancres`, on a 808 tours et 11,2 pendues.
- **La cause exacte de l'écart n'est pas isolée.** Elle peut venir de la route, des scènes (`vsBloque`), d'AIRZ ou des volumes SP9.

**À l'écran** (rayons, image nette), part du haut de l'image couverte par des façades :

| | 3/11 | aujourd'hui |
|---|---|---|
| tél 844 | 43-49 % | 49-53 % |
| tél 390 | 28-29 % | 33-38 % |
| ordinateur | 60 % | 54 % |

**Au téléphone, il y a déjà autant de façades à l'écran qu'au 3/11.** Ce qui manque, c'est de les voir nettes et sombres.

## 3. La lumière et le flou : ce qui a changé, et pourquoi
Mesures sur les photos « flou du jeu » (`image-stats.py`), en 844 :

| | netteté du haut | route (L*, noirs) | rose en haut |
|---|---|---|---|
| 3/11 | 16,9-19,6 | L* 12-20, noirs 52-75 % | 3-6 % |
| aujourd'hui | **8,4-8,5** (21 en net) | **L* 25, noirs 7-12 %** | **14-17 %** |
| + flou V2 seul | 20,0 | L* 27, noirs 6 % | 13 % |
| + recette | 18,0 | **L* 12, noirs 74 %** | 12 % |

Au 390 : route L* 22, noirs 50 % au 3/11 ; L* 32, noirs 13 % aujourd'hui ; L* 24, noirs 42 % avec la recette.
À l'ordinateur : netteté 26 (3/11), 17 (aujourd'hui), 23 (recette) ; route L* 15, 26, 21.

**a. LE FLOU V2 PERDU, un bug.**
- `rendu/triptyque-bloom.js:118` : le commit **3df790c92 (17/11, « Voiles au tiers »)** a changé la déclaration de base en `uniform float uSafe,uRn,uSfx;`.
- Or `FLOU_R` (l.276-281, « le flou de vitesse propre » du 14/10 : zone nette autour de la caisse, force en carré, tunnel 0,30) cherche `uniform float uSafe,uRn;`. `flouFS` ne trouve plus ce texte et **renonce sans rien dire**.
- Le jeu a donc repris le flou brut d'avant le 14/10 : partout, linéaire, tunnel 0,55. Je l'ai vérifié en comparant le shader final du 3/11 et celui d'aujourd'hui.
- **Le même motif casse `NET_NITRO2`** (l.308, `u1`) : « le cœur des rubans hors du flou », fait sur demande de Sacha le 14/11. Il ne s'applique plus non plus.
- Remis dans la page au banc (5 remplacements sur 5) : même nombre d'appels et de triangles, les tours à fenêtres reviennent (colonne 3 de la planche).
- ⚠ Fichier réservé. Une session « ctl-flouvitesse » tenait le verrou du banc cet après-midi : lui en parler.

**b. L'ÉQUILIBRE DES MAPS — ⚠ DEMANDE DE SACHA** (06/11 : « trop de maps sont sombres et ternes »).
- `rendu/equilibre-maps.js:41`, `villeOrage:{expo:1.12, lev, vigK:.38, lum:1.12, rtK:1.2}` (30099a2af, 05/11).
- Mesuré : expo de base 0,721 → 0,808 ; vignette 0,48 → 0,228 (la valeur de 0,228 n'est pas élucidée) ; ombres relevées.
- Avec `equilibre=0` seul : route L* 18, noirs 54 %.

**c. L'AUTOROUTE VIVANTE — ⚠ DEMANDE DE SACHA** (13/11 : « ma préférée c'est la C »).
- `rendu/autoroute.js`, cf1c78809, caractère « Miami » en ville.
- Peinture claire, poteaux et rails : environ +8 L* sur la route.
- Avec `equilibre=0` et `autoroute=0` : route L* 10-13, noirs 74-82 %, soit **le noir mouillé du 3/11**. On a aussi 9 appels de moins.

**d. Pas isolés** : les phares en feux de route sur la nappe (866853825 et 68d6eded5, 11/11, sans demande citée).

**Inchangés :**
- la caméra : hauteur 2,5-2,9 m, distance 4,3-5,1 m, fov 90 (844) et 112-118 (390), mêmes tangages. **Le « caméra plus basse » du lot D n'est pas confirmé** ;
- la brume : 220 / 2 200 m, même couleur ;
- `villePied` et `uPiedC` (au caractère près).

**Écarts du gouverneur au banc** (qualité par appareil, réservé) : DPR 1,5 → 1,25, halo à 5 → 3 étages. C'est mineur et non jugé.

## 4. L'ordinateur
- L'écart y est **le même en nature** : flou brut (netteté 17 contre 26), route claire (L* 26 contre 15), rose.
- Il y a un peu moins de façades qu'au 3/11 (54 % contre 60 %).
- **Le budget n'y est pas une contrainte** : 128 appels / 436 k aujourd'hui, contre 150 / 513 k au 3/11.
- Ce que Sacha a revu sur son Mac le 19/11 (le 3/11) avait donc le flou V2 et la route noire. La ville d'aujourd'hui, sur l'ordinateur, n'y ressemble pas encore.

## 5. Les « immeubles à l'envers, transparents »
Les photos nettes du 3/11 (planche 2, en bas) montrent de **grandes plaques violettes unies dans le haut de l'image**, sans fenêtres en bas et avec des fenêtres plus haut. Ce sont les tours au **pied relevé** :
- elles sont posées pour l'étage du haut ;
- `tourLibre` relève leur pied à `p.y+44` au-dessus de l'étage du bas (`jade-balade.js:60`, identique à aa160 l.57) ;
- `villePied` (`ville-v3.js:112`, identique) les noie sur 280 m dans la couleur de la brume. **On croit voir à travers.**

S'y ajoute la **route mouillée et sombre** du 3/11, où les néons se reflètent en traits verticaux. C'est l'autre « à l'envers ».

Le lot D refaisait exactement le premier mécanisme. **Toutes ses photos ont été prises après le 17/11, sous le flou brut**, qui file justement le haut de l'image, là où sont les pendues. Son « effet invisible » est donc **à rejuger avec le flou V2**.

## 6. LA RECETTE, classée
| # | quoi | où | coût | téléphone |
|---|---|---|---|---|
| 1 | **Rendre le flou V2 et `NET_NITRO2`** : faire suivre `uSfx` aux motifs de `FLOU_R[0]` et de `u1` | `rendu/triptyque-bloom.js:276` et `:308` (casse : 3df790c92) | 0 appel, 0 triangle, 0 programme en course | ✔ tient. **Fichier réservé : hors lot F**, à faire par le propriétaire du rendu, sur toutes les maps |
| 2 | **La route noire et mouillée, l'air violet sombre, en ville à étages seulement** (sous `VILLE_ETAGES`) : l'équivalent d'`equilibre=0` (expo 0,72, vignette 0,48, ombres d'avant) et une peinture d'autoroute sobre en ville | une entrée ville dans `equilibre-maps.js` (pas réservé) ; la peinture dans `autoroute.js` (`AR_CARTES`, réservé) | 0 appel ; `autoroute=0` = −9 appels, −8 k | ✔ tient. **⚠ Défait deux demandes de Sacha : à lui demander d'abord** |
| 3 | **Plus de tours au pied relevé et plus de murs des deux côtés**, comme au 3/11 : 21 pendues par route au lieu de 11, murs à moins de 100 m sur 77 % au lieu de 59 %, 1er rang à 8,9. Reprendre le canyon d'`aa160d07f:code/maps/jade-balade.js` l.27-200 (`ROWS` l.166, le pied `min(yLo,yN)−330−vr·120`, la forêt du large) **sur la route à étages**, après avoir isolé la cause (scènes, AIRZ, SP9) ; ou rejuger le lot D (`refuses/lot-d.diff`) une fois le 1 fait | `jade-balade.js` l.120-133 et 188, sous `VILLE_ETAGES` | tours : +11 k triangles par image au 3/11, 0 appel | ✔ tient (le plafond est 283 k +10 %, soit +28 k) |
| 4 | La pluie d'orage (10 appels au 3/11 contre 2-3) | non regardé | +8 appels | à mesurer |

**Ce qui ne tient PAS au téléphone et n'apporte rien à l'œil :**
- les 300 k triangles de route du 3/11 (sa route lointaine) ;
- ses 29 appels d'ombres ;
- sa cadence de 60 i/s.

Il ne faut pas les reprendre.

**Ordre conseillé :** d'abord 1, puis une planche à Sacha (3/11 contre aujourd'hui + 1, et aujourd'hui + 1 + 2), puis 3 si l'œil le demande encore.

## Pas vérifié
- La cause Node exacte des tours en moins (scènes, AIRZ, SP9 ou route).
- Les paliers 10 et 20 en Chrome.
- Le nitro.
- L'iPhone réel.
- La vitrée et Crypto City (rien n'y a été touché).
- La vignette mesurée à 0,228 : d'où elle vient.
- L'effet des phares seuls.
- Mes photos ne sont pas à la même abscisse entre le 3/11 et aujourd'hui : ce ne sont pas les mêmes routes. Les comparaisons sont des moyennes de 5 à 11 moments par course.
