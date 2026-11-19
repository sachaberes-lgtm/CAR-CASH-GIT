# LOT J — Crypto City de jour revient au téléphone, retravaillée (nuit du 2026-11-18)

> **LECTURE RETENUE (reprise du 19/11).** Sacha : « non on la met aussi dans la version mobile il faut qu'elle soit au meme niveau que la map jour », puis « enfait il fzut que ca soit la meme map mais juste le soleil qui change ».
> Crypto City de JOUR et Crypto City de NUIT sont **LA MÊME MAP** : même générateur de route, mêmes immeubles, mêmes géantes de verre, mêmes décors, même densité, mêmes scènes. **Seuls le soleil et la lumière changent** : ciel, soleil, brume, lumière ambiante et directionnelle, exposition, teintes des palettes, éclat des néons et des fenêtres. Le jour entre sous cette forme dans le tirage du téléphone ET de l'ordinateur.
> Les §§ 1 à « tour 2 » ci-dessous décrivent l'ANCIEN jour (la carte `crypto`, une autre ville) : ils sont remplacés par la section « Reprise du 19/11, passe 1 », à la fin.

Demande de Sacha : « remets les maps Crypto City jour […] et tu remets les lumières jour […] retravaille-les pour qu'elles soient au même niveau que la nuit ».
Interrupteur : **`?sans=cryptojour`** = le jeu d'avant (le tirage ET le rendu). Rien n'est commité. `index.html` est assemblé et les gardes sont vertes.

## 1. L'enquête : où était le jour ?

**Le jour n'a pas été perdu dans une fusion.** Il est toujours dans le code : c'est la carte `crypto` de `SF_CARTES` (niveaux.js), avec trois météos : matin `cryptoMatin` (poids 1), midi `bullrun` (1,3) et soir `cryptoSoir` (1,2). Ses ambiances sont dans `etalonnage-da.js`, `continuite.js` et `equilibre-maps.js`. Ses tours de verre (`CRYPTO_VERRE`) sont dans `cryptocity.js`, ses objets (pièces ₿, diamants, dirigeables, fusées, lune ₿) dans `cryptocity-taureau.js`, et les géantes de verre dans `ville-verre.js`.

Ce qui l'a sorti du jeu sur téléphone, c'est un **retrait voulu**, pas un accident :

- **045144987, 24/10, v883** : « Crypto City hors du tirage sur téléphone ». C'était la demande de Sacha, notée dans le code : « supprime la map crypto city de téléphone ». Le retrait passe par `SF_HORS.crypto = ALLEGE && !?carte=crypto`. La raison n'est pas écrite. C'était la semaine des mesures de chauffe de l'iPhone (mémoire `iphone-chauffe-et-maps`). Le jour de Crypto City coûte plus cher que la nuit (voir § 4) : c'est probablement la raison, mais **ce n'est pas prouvé**.
- **d60dc3baf, 25/10, v897** : le retrait ne vise plus que le vrai téléphone (ALLEGE / TEL_NATIF). **L'ordinateur a toujours tiré le jour**, sauf un PC lent qui bascule en ALLEGE.
- **bb0572eb1, 13/11** : sur téléphone, ses matières ne se compilent plus au menu, puisqu'elle est hors du tirage.
- Les retouches du jour ont continué ensuite, toutes sur le code actuel :
  - 17def0103 (03/11) : le nom CRYPTO CITY, jour et nuit ;
  - 71f57f577 / f96118036 (03/11) : le béton du jour ;
  - 1e61f80ca (05/11) : une seule ville, avec les géantes de verre dans les deux ;
  - 05/11 : taureau et bougies retirés à la demande de Sacha.

  Les poids des trois météos n'ont pas bougé depuis le découpage (5ea7ee4c6, 19/10). Il n'y avait donc rien à reprendre d'une vieille branche.
- La map **`ville`** (la nuit) n'est pas touchée : elle reste toujours la nuit (orage, trois teintes), conformément à la décision de Sacha du 16/10.

**Ce que le jeu d'aujourd'hui tire vraiment au JOUER, mesuré.** Le banc a tourné dans le vrai jeu en `?tel=1`, en appelant `sfTire` 600 fois à la suite, avec la mémoire des 3 dernières maps simulée et un générateur de hasard à graine fixe :

- `SF_HORS.crypto = true` ;
- CRYPTO CITY (`cryptoville`) sort 106 fois sur 600 ;
- **100 % de ces sorties sont `ville:orage` (la nuit). Le jour sort 0 fois.**

## 2. Le tirage après

Le changement tient en une ligne de `niveaux.js` : `crypto: ALLEGE && !CRYPTO_JOUR && …`. `CRYPTO_JOUR` est faux avec `?sans=cryptojour`.

Mêmes 600 tirages, même graine, en `?tel=1` :

| | avant | après | après `?sans=cryptojour` |
|---|---|---|---|
| SF_HORS.crypto | true | **false** | true |
| CRYPTO CITY (sur 600) | 106 | 104 | 106 |
| — nuit `ville:orage` | 106 (100 %) | 54 (52 %) | 106 |
| — jour (matin / midi / soir) | 0 | **50 (48 %) : 17 / 20 / 13** | 0 |
| les autres maps | canyon 60, jade 104, espace 106, nuages 113, grotte 111 | 60 / 110 / 109 / 107 / 110 | identiques à l'avant |
| empreinte de la suite tirée | 455497590 | −1529622199 | **455497590 (au bit près)** |

- Le jour et la nuit sont à égalité au sein de Crypto City : 3,5 contre 3,5, la règle du 25/10 déjà en vigueur sur l'ordinateur.
- Crypto City garde sa place unique au tirage (`SF_FUSION`). Les autres maps ne changent pas de fréquence.
- Au démarrage, `cryptoChauffe` compile de nouveau les matières du jour au menu (`vignette-moteur.js`). C'est ce qui donne 0 compilation en course (voir § 4).

## 3. Le jour retravaillé : planches et jugement

Un nouveau morceau, **`code/maps/cryptocity-jour.js`**, est inscrit dans `ORDRE.txt` après `rendu/lumiere-design.js`. Il est posé en dernier, après l'équilibre des maps et le plan de feu. Il ne contient **que des valeurs d'ambiance** : ciel reflété par le verre (jZen / jMid / jHor), brume de chaleur (fog / fogCj / fogIn, fogN), soleil et hémisphère, contre-jour, étalonnage (expo, con, sat, sh, hi, bloomS, vignette), béton de la route (rtK, rtT) et dégradé env.

- **Midi, « le soleil dur »** : azur profond, verre bleu en haut et or au pied, ombres bleues, brume dorée repoussée, béton bleu ardoise, bloom réduit pour ne plus délaver.
- **Matin, rose et or** : ombres lavande, brume rose dorée, contre-jour rose.
- **Soir, l'heure dorée** : ciel violet puis orange, ombres prune, contre-jour rose.

Le tout est gardé par `if (CRYPTO_JOUR)`, ce qui rend l'avant au bit près.

**Preuve du `?sans=cryptojour`.** La signature JSON des ambiances (bullrun, cryptoMatin, cryptoSoir, villeOrage, vitreMidi) a la même longueur dans l'arbre « avant » et dans « après `?sans=cryptojour` » (10 932 contre 10 929 caractères). Les 3 caractères d'écart sont le champ de contrôle `cj` (`"absent"` contre `false`). Le brouillard et l'exposition du midi sont identiques ([.9,.88,.8], .88).

Planches (JPEG ≤ 250 Ko, graine 3, abscisses 20 / 50 / 80 % de la piste, caméra 40 m derrière et 18 m au-dessus de la route, `?tel=1`) :

- `planches/jour-retrouve-tel-quel-844x390.jpg` : le jour **tel qu'il était** (midi, matin, soir) et la nuit, aux mêmes graines et abscisses.
- `planches/jour-passes-{midi,matin,soir}-844x390.jpg` : les passes, dans l'ordre AVANT / A (2e passe) / B (variante plus dure, appliquée à chaud au même endroit) / NUIT. B donnait un béton **noir** : rejetée. A a été gardée puis corrigée en 3e passe : béton remonté à rtK .84 / .76 et teinté ardoise, ciel du midi plus profond.
- `planches/jour-nuit-844x390.jpg` : **le jour final** (midi, matin, soir) contre la nuit, mêmes graines et mêmes parts.
- `planches/jour-nuit-390x844.jpg` : en portrait, avant midi, après midi, après matin, nuit.
- `planches/jour-avant-apres-midi-844x390.jpg` : midi tel quel contre midi final, et la graine 8 (midi final contre nuit verte).

**Jugement, en regardant les planches :**

- Le jour retravaillé est **nettement plus beau que le jour retrouvé**. Avant, c'était une ville crème et grise sous une brume blanche, avec un béton gris clair qui prenait la moitié de l'image. Maintenant : azur et or francs, vraies ombres colorées, verre qui renvoie deux couleurs.
- **Le soir est au niveau de la nuit.** Le matin s'en approche.
- **Le midi n'y est pas tout à fait**, surtout en portrait, où le béton occupe 60 % de l'écran. La nuit vit des reflets néon mouillés sur la route et de ses milliers de fenêtres allumées. Le jour n'a pas d'équivalent sans toucher aux shaders : reflets du soleil sur le béton, éclats sur les vitres plus forts, bandes de brume de chaleur. Ce serait un programme modifié, donc hors de « que des valeurs ». Je ne l'ai pas fait cette nuit.

## 4. Les comptes `renderer.info` en `?tel=1`

Mesure : une vraie image du composer, toutes passes comprises (`info.autoReset` coupé le temps d'une image), aux mêmes vues.

| graine 3, 844 × 390, s = 20 / 50 / 80 % | appels | triangles (k) | géométries | textures | programmes |
|---|---|---|---|---|---|
| jour **avant**, midi | 102 / 88 / 71 | 299 / 249 / 153 | 544 | 125 | 164 |
| jour **retravaillé**, midi | 111 / 97 / 71 · 103 / 89 / 70 (deux passages) | 303 / 253 / 153 · 302 / 252 / 148 | 544-548 | 125 | 164 |
| jour retravaillé, matin / soir | 103 / 89 / 71 · 102 / 88 / 69 | 302 / 252 / 153 · 302 / 252 / 150 | 544-548 | 125 | 164 |
| **nuit** (ville orage violet) | 91 / 75 / 51 | 332 / 215 / 100 | 526 | 121 | 154 |
| 390 × 844 : jour avant / retravaillé / nuit (s = 20) | 91 / 92 / 66 | 277 / 280 / 239 | 550 | 125 / 125 / 121 | 164 / 164 / 154 |
| graine 8, s = 35 / 65 : jour retravaillé / nuit | 112 / 129 contre 60 / 81 | 201 / 302 contre 193 / 231 | 581 / 553 | 125 / 121 | 164 / 154 |

- **Retravaillé contre avant : rien en plus.** Ce ne sont que des valeurs. Programmes, textures et géométries sont égaux. Les écarts d'appels (±9) et de triangles (±4 k) se retrouvent entre deux passages du même arbre : ce sont les objets animés du ciel (fusées, feux, pièces), pas la retouche.
- **⚠ Le jour de Crypto City coûte plus que la nuit, et ce n'est pas nouveau.** C'est le jour tel qu'il existait, et sans doute la raison du retrait du 24/10. En moyenne : **+10 à +50 appels**, 10 programmes de plus (164 contre 154, tous compilés au menu), 4 textures de plus, des triangles du même ordre (graine 3 : moins au début, plus à la fin). Je ne l'ai **pas** allégé : retirer des objets du jour sur ALLEGE change l'image, c'est une décision pour Sacha (voir § 6).
- **Programmes compilés en course : 0.** Deux courses ont été suivies toutes les 2 s : `info.programs.length` est resté à 164 de bout en bout, y compris au passage vers la map suivante.

## 5. Courses complètes de jour, sans erreur

- **crypto:midi, graine 5** : 7 404 m roulés au pilote automatique en 72 s jusqu'au portail, puis passage à `grotte:matin`. 0 mort, **0 erreur console** (console.error et exceptions), programmes à 164 tout du long.
- **crypto:soir, graine 7** : 7 465 m jusqu'au portail, puis `grotte:matin`. 0 mort, **0 erreur console**, 164 programmes.
- Les 15 chargements photo (jour, nuit, portrait, paysage) : 0 erreur console.

## 6. Ce qui N'EST PAS vérifié, et les décisions pour Sacha

**Pas vérifié :**

- **Rien n'a tourné sur un vrai iPhone.** Ni la chauffe, ni les i/s du jour de Crypto City. Il a été retiré le 24/10 sans doute pour son poids : le premier essai sur le téléphone doit regarder les i/s à chaud.
- Le temps de démarrage : `cryptoChauffe` recompile au menu, sur téléphone, les 10 programmes du jour.
- Les photos sont prises **à l'arrêt**, avec le HUD encore visible : mon masque ne l'a pas caché. On y voit encore un reste de flou de vitesse.
- Le jour n'a été jugé qu'à deux graines (3 et 8) et en course à deux autres (5 et 7, sans photos).
- Le passage de portail jour vers nuit dans Crypto City n'a pas été regardé.
- L'ordinateur hérite aussi du jour retravaillé, puisqu'il tirait déjà le jour : c'est voulu, mais **non photographié en `?tel=0`**.
- Les mêmes ambiances servent aux missions « météos » (`m2Meteo`), qui comptent maintenant aussi le jour sur téléphone. C'est attendu, non testé.

**Décisions pour Sacha :**

1. **Garder le jour tel qu'il coûte, ou l'alléger sur ALLEGE** (+10 à +50 appels et +10 programmes par rapport à la nuit). Les pistes à mesurer, image par image (`audit-image-par-appel.js`) : moins de dirigeables, de fusées ou de feux au palier du téléphone, la couronne de l'horizon (`PAL.B.cryptoHor`), les reflets.
2. **Le poids jour / nuit** dans Crypto City : aujourd'hui 50 / 50, comme sur l'ordinateur.
3. **Le midi en portrait** reste en dessous de la nuit. L'étape suivante coûterait un shader (éclat du soleil sur le béton et le verre). Je ne l'ai pas fait.

**Fichiers touchés** (rien de commité, `sw.js` non touché, aucune route ni autre map touchée) :

- `code/maps/niveaux.js` : `CRYPTO_JOUR` et la condition de `SF_HORS.crypto` ;
- `code/maps/cryptocity-jour.js` (nouveau) ;
- `code/ORDRE.txt` ;
- `VERSION PRINCIPALE/index.html` (assemblé) ;
- ce fichier et `planches/`.

**Gardes vertes** : garde-demarrage, garde-allege, garde-charte, `assembler --verifier`.

**Empreintes inchangées** (`empreinte.cjs graines=1-12`) :

| map | p0 | p10 |
|---|---|---|
| ville | d63b36e2af8b | fb378a8c6756 |
| crypto | 5447610bd8f2 | eae97981f833 |
| nuages | 469d52aff855 | 2e1661d8fe93 |
| espace | 9c99fae61d38 | ea2d9e750351 |

La vitrée casse aussi dans la référence (`VIT_SOL is not defined`, déjà là avant ce lot).

**Bancs** : `<scratchpad>/lot-j/banc-j.cjs`. C'est un serveur qui sert les deux arbres et injecte `__ev`, avec un seul Chrome muet, sous verrou. Trois prises de moins de 8 minutes chacune. L'attente du verrou a été d'environ 5 h pour la première prise.

---

## Après le contrôle, tour 1 (2026-11-19, vers 13 h 50)

Ce qui suit remplace les §§ 2 et 4 là où ils se contredisent. Rien n'est commité. `index.html` est assemblé (348 morceaux) et les gardes sont vertes : garde-demarrage, garde-allege, garde-charte et `assembler --verifier`. Les empreintes `graines=1-12` n'ont pas bougé (ville d63b36e2af8b / fb378a8c6756, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351). Chaque nom n'est déclaré qu'une fois, et `IS_MOBILE` n'apparaît pas.

Quatre prises sous verrou (`ville-cyber-j`) : 12:18 → 12:22, 12:37 → 12:44, 12:46 → 12:51, 13:43 → 13:45. Chrome était muet, son profil a été supprimé et le verrou rendu à chaque fois. Bancs : `<scratchpad>/lot-j/t2/` (banc-t2.cjs, jobs1 à jobs4, p1 à p4).

### Défaut 1 (bloquant) : le coût monte pour toute partie. CORRIGÉ pour les autres parties, réduit pour le jour.

**Reproduit.** Avec `SF_HORS.crypto` à faux, `cryptoChauffe` recompilait les matières du jour au menu pour toutes les parties.

**Corrigé** (`niveaux.js` et `cryptocity-jour.js`) :

- `SF_HORS.crypto` **reste vrai sur téléphone**, comme avant le lot. La chauffe du menu, les portails et les missions ne changent donc pas.
- Le jour sort seulement **au départ d'une partie**, par `sfTireDepart`. Quand le tirage du départ donne la nuit de Crypto City (`ville`), il la change en jour une fois sur deux (`CJ.part`). La météo du jour est tirée à ses poids.
- Les matières du jour se compilent **seulement quand le jour est tiré** (`cjChauffe`), hors course : au tirage d'avance du menu ou de l'écran de fin, ou sous le voile du JOUER.
- Trois appels changent (`sfTire` → `sfTireDepart`) : le JOUER (`zones-caisses.js`), le tirage d'avance (`depart-avance.js`) et la zone 0 de `lvlChoisir` (`continuite.js`). Le portail (`zn > 0`) garde `sfTire` et ne mène jamais au jour. Rien n'y compile en course.
- Sur l'ordinateur, `SF_HORS.crypto` est faux et `sfTireDepart` revient à `sfTire` : aucun hasard n'est consommé en plus, donc le tirage du PC ne change pas.

**Mesuré** (`?tel=1`) :

| | programmes | textures | géométries |
|---|---|---|---|
| menu, référence | 155 | 116 | 514 |
| menu, lot J | **155** | **116** | 516 |
| course de nuit, ville:orage graine 11 | 154 | 123 | 549-519 (= référence) |

- Quand le jour est tiré au menu, `cjChauffe` fait passer les programmes de 152 à 162. La course reste ensuite à **167 programmes du premier au dernier relevé** dans trois courses complètes jusqu'au portail : midi graine 5, matin graine 6, soir graine 7. Les portails ont mené vers grotte, jade et espace. **0 erreur console.** Donc 0 compilation en course.
- **Tirage** : 300 départs et 600 portails, hasard à graine 4242 (`tir-*`).

  | | jour au départ | nuit (ville:orage) au départ | jour aux portails | empreinte de la suite |
  |---|---|---|---|---|
  | référence | 0 | 55 | 0 | −1305267158 |
  | lot J | 26 | 28 | **0** | 626067742 |
  | lot J `?sans=cryptojour` | 0 | 55 | 0 | **−1305267158** |

  Le hachage `BIOMES` de `?sans=cryptojour` est **identique à la référence** (1747857425). Ce tirage et ces valeurs sont donc au bit près. `m2Cartes()` est identique dans les trois cas.

**Le jour coûte toujours plus d'appels que la nuit. NON résolu entièrement, je l'écris franchement.**

- J'ai audité appel par appel (graines 6, 8 et 11) ce qui coûte en plus le jour.
- Les décors du ciel propres au jour sont maintenant **allégés sur ALLEGE seulement** (`CJ_LEGER`) : plus de feux d'artifice, ni de fumée des fusées, ni de lune ₿, ni de diamants. Il reste 1 fusée en vol sur 3 et 1 dirigeable sur 2. La pluie d'argent, les pièces géantes (le JACKPOT) et l'AVERSE d'un NOUVEL ATH restent.
- Le reste de l'écart vient de **la ville elle-même**. Le béton et les maquettes de la scène sont plus nombreux sur la piste de Crypto City (`MeshBasic` +7 à +14 appels, shaders de groupe +8 à +10). Ce sont des pièces posées par la génération de la ville (ville-scenes.js), à laquelle je n'ai pas le droit de toucher.
- Appels moyens et maximum, sur 6 graines (3, 4, 6, 8, 11, 12) × 3 vues :

  | | moyenne | maximum |
  |---|---|---|
  | nuit | 70 | 97 |
  | jour du tour 1 | 81 | 122 |
  | **jour du tour 2** | **78** | **119** |

- Le jour **d'avant le lot**, à la même graine 11, faisait 77 / 68 / 72 appels ; le tour 2 en fait 73 / 66 / 69. Le jour coûte donc **moins que le jour d'avant**, mais environ **+11 % d'appels de plus que la nuit** en moyenne.
- Triangles moyens : jour 218 k, nuit 188 k. Maximum : jour 312 k, nuit 332 k.
- Une partie de jour garde **10 programmes, 2 à 4 textures et environ 40 géométries de plus** qu'une partie de nuit. Ce sont les matières propres du jour (tours de verre, pièces, dirigeables, horizon), compilées hors course.
- **Pour aller sous la nuit**, il faudrait retirer des bâtiments ou des scènes de Crypto City de jour sur téléphone : c'est une décision pour Sacha (§ Décisions).

### Défaut 2 (bloquant) : le jour n'est pas au niveau de la nuit. AMÉLIORÉ, pas au niveau partout.

Tout ce qui suit est fait de valeurs ou d'uniformes déjà compilés : **0 programme de plus.** Chaque essai a été photographié à la même vue que l'actuel, puis retenu ou rejeté.

- **La route renvoie le ciel le jour** (`CJ_ROUTE`). Le béton du jour était presque mat (`GLACE.crypto` à 0,5). Il devient une dalle polie : `uGlace` vaut 0,8 à 0,85 et `uSheen` 0,3 à 0,34, par heure. En rasant, il renvoie l'azur et la bande d'or du midi, le rose du matin, l'orange sous le violet du soir. Le reflet du soleil reste exclu (la traînée refusée le 26/09). En portrait, la route n'est plus un aplat ardoise : `tour2-midi-route-air`, colonnes 1 et 2.
- **L'air du lointain prend la couleur de l'ombre de l'heure, et le contre-jour garde l'or :**
  - midi : azur `[.60,.74,.94]` ;
  - matin : lavande ;
  - soir : prune.

  Les tours proches du midi ne sont plus crème délavé : elles passent au bleu. C'est l'essai « azur », retenu contre « acier », qui était plus froid et plus gris.
- **Soir** : soleil d'or rose à 1,3 (il était orange à 1,75) et contre-jour rose. La façade au soleil retrouve ses fenêtres au lieu d'un aplat orange : `tour2-soir-variantes`, colonne 2, « doux », retenu. Les essais « rose » et « rose2 » lavaient tout en rose : rejetés.

Ce qui reste en dessous de la nuit, honnêtement :

- **Le soir en portrait** reste dominé par l'orange et le rose, et les pièces orange s'y lisent encore moyennement.
- **Le midi** est beau en vue dégagée (graine 11, s20), mais une tour proche en plein soleil reste claire.
- La nuit a ses néons et ses milliers de fenêtres. Le jour n'a pas d'équivalent sans nouveau shader : éclats du soleil sur les vitres, bandes de chaleur. Ce serait des programmes en plus, donc hors de la règle de coût. Je ne l'ai pas fait.

Les valeurs du soir « doux » ont été jugées sur la retouche à chaud (`dbgCryptoJour`), au même endroit. Elles n'ont pas été rephotographiées une fois écrites dans le morceau : le verrou était trop disputé (50 minutes d'attente pour la 4e prise).

Planches (`passation/ville-cyber/planches/`, JPEG ≤ 250 Ko) :

- `tour2-jour-nuit-pc-844x390.jpg` : midi, matin et soir de la graine 11 contre la nuit, puis l'ordinateur en `?tel=0` (midi avant, midi après, soir) ;
- `tour2-portrait-390x844.jpg` : graine 4, midi, soir et nuit ;
- `tour2-midi-route-air-844x390.jpg` : midi actuel, sans route polie, air « azur », air « acier », et la nuit ;
- `tour2-soir-variantes.jpg` : actuel, « doux » (retenu), « rose », « rose2 ».

Les vues sont prises à l'arrêt, avec le flou de vitesse coupé. Les variantes à s60 sortent floues : c'est un défaut du banc (pause et reprise), pas du jeu.

### Défaut 3 (mineur) : la part de la nuit s'effondre. CORRIGÉ.

Les portails ne mènent qu'à la nuit, et seul le départ peut changer la nuit en jour. Sur 300 parties : 26 départs de jour contre 28 de nuit, plus 109 nuits sur 600 portails. **La nuit reste la plus fréquente de Crypto City**, environ 5 contre 1 sur toutes les zones jouées.

### Défaut 4 (mineur) : les missions météo changent. CORRIGÉ.

`SF_HORS.crypto` reste vrai sur téléphone, donc `m2Cartes` et `m2Meteo` sont inchangés (vérifié : même liste dans les trois arbres).

### Défaut 5 (mineur) : l'ordinateur change d'image sans photo. PHOTOGRAPHIÉ.

En `?tel=0`, graine 11 : midi avant, midi après, soir après. C'est la dernière rangée de `tour2-jour-nuit-pc`. L'ordinateur prend l'air azur, la route polie et le soir doux. Son tirage ne change pas, et `CJ_LEGER` ne s'y applique pas (ALLEGE seulement). Comptes PC, graine 11 : 164 programmes, 125 à 127 textures, avant comme après. 0 erreur.

### Non vérifié

- Aucun vrai iPhone : ni chauffe, ni i/s du jour, ni temps de compilation de `cjChauffe` au menu (10 programmes).
- Le passage d'un portail du jour vers la nuit de Crypto City **n'existe plus** : le portail ne peut pas mener à la même ville, et il ne mène jamais au jour.
- La vignette du garage quand le tirage d'avance annonce le jour de Crypto City sur téléphone n'a pas été regardée. La course qui suit, elle, a été vérifiée.
- Le tirage au vrai bouton JOUER sur plusieurs parties n'a pas été testé. J'ai appelé `sfTireDepart` directement, plus trois courses par le tirage d'avance (`SF.prochain`).
- Les valeurs finales du soir n'ont pas été rephotographiées une fois écrites (voir plus haut).

### Décisions pour Sacha

1. **Le jour de Crypto City coûte encore environ 11 % d'appels de plus que sa nuit sur téléphone**, et il porte 10 programmes de plus. C'est moins que le jour d'avant. Pour descendre sous la nuit, il faudrait **moins de bâtiments ou de scènes dans Crypto City de jour sur téléphone** : c'est une image différente, et ça touche la génération de la ville. Autre levier : baisser `CJ.part` (aujourd'hui 0,5) pour que le jour sorte plus rarement.
2. Garder ou rendre sur téléphone ce que `CJ_LEGER` retire : feux d'artifice, fumée, lune ₿, diamants, 2 fusées sur 3 et 1 dirigeable sur 2. Tout se règle par `dbgCryptoJour({leger:{…}})`.
3. Le niveau de la nuit demanderait un shader de jour : éclats du soleil sur les vitres, chaleur. Ce seraient des programmes en plus, donc à décider.

**Fichiers touchés** : `code/maps/niveaux.js` (`CRYPTO_JOUR` seul, la ligne `SF_HORS` est d'origine), `code/maps/cryptocity-jour.js`, `code/maps/continuite.js`, `code/moteur/depart-avance.js` et `code/gameplay/zones-caisses.js` (une ligne chacun : `sfTireDepart`), `code/ORDRE.txt`, `VERSION PRINCIPALE/index.html` (assemblé). Pas de `sw.js`, aucune route, aucune autre map.

---

## Après le contrôle, tour 2 (2026-11-19, vers 16 h 20)

Ce qui suit remplace les §§ 4 et « tour 1 » là où ils se contredisent. Rien n'est commité. `index.html` est assemblé (348 morceaux) et les gardes sont vertes : garde-demarrage (21 scripts), garde-allege, garde-charte et `assembler --verifier`. Les empreintes `graines=1-12` sont intactes : ville d63b36e2af8b / fb378a8c6756, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351. Aucune route, aucune autre map et aucun fichier de rendu réservé n'ont été touchés. `sw.js` non plus. Ce tour ne touche que `code/maps/cryptocity-jour.js` (plus l'assemblage).

Cinq prises sous verrou (`ville-cyber-j`) : 15:03 → 15:08, 15:17 → 15:26, 15:30 → 15:32, 15:56 → 15:58 et 16:15 → 16:18. Chrome était muet, son profil a été supprimé et le verrou rendu à chaque prise. Bancs : `<scratchpad>/lot-j/t3/`. On y trouve `banc-j3.cjs` (le banc du contrôleur, plus un audit appel par appel par vue et les clés des programmes), `mk*.py`, `jobs1` à `jobs5`, `p1` à `p5` et les planches.

### Défaut 1 (bloquant) : un programme compilé au portail, 171 au lieu de 164. CORRIGÉ.

**Cause.** Le tirage d'avance (`prebDepCible`) est appelé dès les premières images. `cjChauffe` compilait alors les matières du jour avant que la scène du menu soit posée. Ça donnait des programmes pour un état qui ne revient jamais, puis le bon programme, compilé en course au portail.

**Correction.** Le tirage ne fait plus que retenir le jour (`CJ.voulu`). La chauffe part à l'un de ces deux moments, tous deux hors course :

- quand la chauffe du menu a fini (`CHAUFFE_R.fait`), ce qui couvre le menu et l'écran de fin ;
- au plus tard quand la piste du jour se bâtit (`lvlChoisir`, enveloppé : le départ d'avance ou le voile du JOUER).

Sur ALLEGE, les feux d'artifice, la lune ₿ et la fumée, que `CJ_LEGER` cache, ne sont plus compilés.

**Mesuré** (`?tel=1`, prébâti actif, jour tiré à `__gameReady` comme le contrôleur) :

| course | programmes au départ → après le portail | programmes nouveaux après le relevé du départ |
|---|---|---|
| lot, crypto:midi g9 → grotte:matin | **164 → 164** | **0** |
| référence `?carte=crypto` midi g9 → grotte:matin | 164 → 164 | 0 |
| lot, crypto:soir g2 → espace:matin (prise 5, valeurs finales) | **164 → 164** | **0** |
| lot, jour tiré à **l'écran de fin** (grotte, mort, REJOUER → crypto:midi) | 154 → 162 à l'écran de fin (`quand: 'fin'`), puis 162 sur 5,7 km | **0** |

- Au tirage de `__gameReady`, 0 programme est compilé : le contrôleur en mesurait 14.
- 0 erreur console dans toutes les courses et sur tous les chargements.
- La chauffe à l'écran de fin, dans l'état de la map précédente, a donc été vérifiée. Ce chemin n'avait pas été couvert jusqu'ici.

### Défaut 2 (bloquant) : le jour coûte plus que la nuit sur téléphone. RÉDUIT, PAS SOUS LA NUIT. Décision pour Sacha.

- **Programmes : 164 de jour (= le jour de référence) contre 154 de nuit.** Les 10 de plus sont les matières propres du jour (tours de verre, réclames, pièces géantes, pluie, horizon). Ils sont compilés hors course, et seulement dans une session qui a tiré le jour. Une session sans jour reste à 154.
- **Ce qui coûte, audité appel par appel** : 11 vues de jour et 9 de nuit, graines 2, 3, 4, 9 et 10, 844×390, `?tel=1`.

  | moyenne par image | appels | triangles | dont décor : appels / triangles | dont route : appels / triangles |
  |---|---|---|---|---|
  | jour | 83,5 | 240 k | 45,5 / 81 k | 24,5 / 151 k |
  | nuit | 67,1 | 187 k | 34,8 / 51 k | 21,0 / 131 k |

  - L'écart du décor tient surtout à trois choses. Le soleil et ses halos font environ 4 appels de sprites (la nuit d'orage n'en a pas). L'horizon et les ciels font environ 3,5 appels de shaders. Les objets propres à Crypto City (tours de verre, tours lointaines, réclames, pièces géantes, pluie) font environ 7 appels, contre 5 pour leurs équivalents de nuit.
  - L'écart de la route vient des tracés de Crypto City. À la graine 9, s50, on voit beaucoup de route : 44 appels et 294 k triangles de route sur 129 et 408 k au total. Je n'y touche pas : règle du lot.
- **Fait ce tour** : la pluie d'argent de fond est réduite à moitié sur ALLEGE hors averse (`CJ_LEGER.pluie` = 0,5). Elle passe de 2 appels et ~23 k triangles à 2 appels et ~11 k triangles. Un NOUVEL ATH ou le JACKPOT la rendent entière.
- **Pour descendre sous la nuit**, il faudrait retirer le soleil, les réclames, les pièces géantes ou la couronne d'horizon du jour sur téléphone, c'est-à-dire l'identité même du bull run. Je ne l'ai pas fait. Les leviers sont prêts dans `dbgCryptoJour({leger:{…}, part})`. `CJ.part` (0,5) règle la fréquence du jour.

### Défaut 3 (bloquant) : le jour n'est pas au niveau de la nuit. AMÉLIORÉ là où c'était le plus faible. À juger par Sacha.

- **Le mur crème du midi, c'était la TOUR BLANCHE** (une sur cinq) : une résille de céramique autour de baies étroites, en plein soleil. Le jour seulement, dans le même programme, j'ai changé deux choses :
  - la tour blanche ouvre ses baies, et la vitre renvoie l'azur et l'or ;
  - sa céramique passe d'un crème cru à un blanc d'acier bleuté, et les montants des autres tours prennent un froid léger.

  Pour le coût : le programme `toursCrypto3j` remplace `toursCrypto3`, il ne s'ajoute pas (164 programmes). Le réglage passe par un uniform, `uCj9` : jour × `LVL.crypto`, éteint par `uNuit9`.
  - Planche `tour3-midi-portrait-verre-390x844` : le mur crème qui remplissait la moitié haute du portrait devient une façade de verre quadrillée bleue.
  - Planche `tour3-midi-verre-route-844x390` : en paysage, colonne 1 sans la retouche, colonne 2 avec.
- **Le soir.** Les aplats roses venaient de `jMid` (le milieu du ciel, rose [.88,.42,.40]). Il colore le ciel, la couronne des tours lointaines (`crhMat`) et le haut du verre. Il passe au violet [.42,.22,.50], avec `jZen` [.12,.08,.34] et une brume [.46,.28,.52]. Résultat : un ciel violet sur une bande d'or, et des silhouettes violettes au lieu d'aplats roses.
  - Planche `tour3-soir-variantes-844x390` : actuel, S3, S4 (retenu).
  - Planches `tour3-final-*` : les valeurs **écrites**, rephotographiées à la 5e prise.
  - Les variantes qui ne jouaient que sur la brume (S1, S2, prise 3) ne changeaient presque rien : rejetées.
- **La route** : un reflet du ciel plus fort (`uGlace` à 1,6) ne se voit presque pas à la hauteur de caméra du banc. J'ai gardé 0,85. L'eau (`uWet`) reste exclue.
- **Ce qui reste en dessous de la nuit, honnêtement :**
  - à la graine 9 s20, un grand pan sable : c'est la route d'une spirale vue de dessous, en plein soleil, et non une tour ;
  - le matin reste lavande et gris, sans changement ce tour ;
  - le jour n'a toujours pas d'équivalent aux flaques de néon.

### Défaut 4 (mineur) : la nuit recule au départ.

Simulation de 200 parties, graine 9001. Au départ : 14 jours et 18 nuits dans le lot, contre 36 nuits dans la référence. Aucun jour aux portails. C'est réglable par `CJ.part`, à Sacha de choisir.

### Défaut 5 (mineur) : le chemin de l'ordinateur n'est vérifié qu'en lisant le code.

- **Simulé, pas réel.** Dans le vrai jeu, j'ai mis `SF_HORS.crypto` à faux, comme sur un PC, et passé 200 parties par `sfTire` puis par `sfTireDepart`. Les deux empreintes sont identiques : −1545073449 et −1545073449. Sur PC, `sfTireDepart` est donc exactement `sfTire` et ne consomme pas de hasard en plus.
- **Le vrai `?tel=0` en mode bureau** (sans émulation mobile) n'a pas démarré dans ce Chrome sans fenêtre : « pas prêt » à 150 s. Il reste NON vérifié au rendu. Le PC prend le verre et le soir retouchés : la règle « un seul code » s'applique.

### `?sans=cryptojour`, au bit près (prise 5)

200 parties, hasard à graine 9001 :

| | empreinte du tirage | BIOMES | m2Cartes | programmes au tirage |
|---|---|---|---|---|
| référence | −2124556106 | 1747857425 | 1178376582 | 0 → 0 |
| lot | −1216173577 | −580591462 | 1178376582 | 0 → 0 |
| lot `?sans=cryptojour` | **−2124556106** | **1747857425** | 1178376582 | 0 → 0 |

Toutes les enveloppes de ce tour (`lvlChoisir`, `cryptoMatTours`, `plaTick`) sont posées sous `if(CRYPTO_JOUR)`, ou sous `CRYPTO_JOUR&&ALLEGE`.

### Non vérifié

- Aucun vrai iPhone : ni chauffe, ni i/s, ni temps de `cjChauffe` à l'écran de fin (8 programmes compilés là).
- L'ordinateur en vrai `?tel=0` (voir défaut 5).
- Le passage du jour au portail à l'ordinateur, où le jour vient aussi des portails.
- Le matin en portrait et en paysage n'a été regardé qu'à la graine 10.

### Décisions pour Sacha

1. **Le surcoût du jour sur téléphone** : +10 programmes, compilés hors course, et environ +16 appels et +50 k triangles par image en moyenne par rapport à la nuit. Le décor y compte pour +11 appels, la route de Crypto City pour le reste. Trois choix :
   - l'accepter ;
   - baisser `CJ.part` ;
   - retirer des pièces d'identité du jour sur téléphone (soleil, réclames, pièces géantes, couronne).
2. **La part jour / nuit** au départ : `CJ.part` = 0,5.
3. **Le jugement de l'image** : planches `tour3-*`.

---

## Reprise du 19/11, passe 1 (vers 19 h 10) — le jour = la carte de la nuit sous un autre soleil

Lecture retenue : voir l'encadré en tête. Rien n'est commité. `index.html` est assemblé (`--depuis-morceaux`, 349 morceaux), gardes vertes (garde-demarrage 21 scripts, garde-allege, garde-charte, `assembler --verifier`). Empreintes `graines=1-12` intactes : ville 17b89297a6b8 / 9dc6766ea34f, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351. Aucune génération de route, aucune autre map, aucun fichier de rendu réservé, pas de `sw.js`.

Le code du tour 3 (tirage `sfTireDepart`, `cjChauffe`, `CJ_LEGER`, tour blanche `toursCrypto3j`…) est **retiré** : il servait l'ancienne carte `crypto`, devenue inutile. `continuite.js`, `depart-avance.js` et `zones-caisses.js` sont revenus à l'identique de HEAD. Restent : `niveaux.js` (`CRYPTO_JOUR`, `SF_HORS.crypto`), `cryptocity-jour.js` (réécrit) et `ORDRE.txt`.

### Les faits : en quoi l'ancien jour (`crypto`) n'était pas la nuit (`ville`)

Aujourd'hui (HEAD), au tirage, `SF_FUSION` (continuite.js:186) réunit DEUX cartes sous CRYPTO CITY : la nuit `ville:orage` (niveaux.js, `SF_CARTES.ville`) et le jour `crypto` (matin `cryptoMatin`, midi `bullrun`, soir `cryptoSoir`), dont le niveau est `NIV_CRYPTO` (jade-1.js:23, `crypto:1`). Le drapeau `crypto:1` change, hors lumière :

| quoi | où | effet |
|---|---|---|
| le **générateur de tracés** | ville-entree.js:82 (`MC` = 'crypto' au lieu de 'ville') | une autre route (empreinte crypto 5447610bd8f2 contre ville 17b89297a6b8) |
| les modules route-ville (lot A) et les cadres de néon (lot C) | ville-cyber.js:33, ville-scenes.js:424 | nuit seulement |
| le décor tiré | jade-balade.js:40 (`villeDecoTire(…,'crypto')`) | une autre palette / densité de décor |
| **d'autres tours** | jade-balade.js:181 (`cryptoTour`), :295 (structure), :208 / :224 (`cryptoReserve`) | d'autres immeubles, ailleurs |
| d'autres **matières de tours** | jade-balade.js:333 / :335 (`cryptoMatTours`, `cryptoMatToursLoin`, cryptocity.js:138 / :149), :340 (`cryptoMatPub`, cryptocity.js:211) | des programmes en plus |
| les objets du bull run | jade-balade.js:117 (`cryptoPlace`), :344 (`cryptoBatit`, cryptocity-taureau.js:52) ; cryptocity.js:38 (`cryptoOn`) → pluie d'argent (pluie-argent.js:118), fusées / feux / lune (cryptocity-taureau.js:151) | pièces géantes, diamants, dirigeables… |
| la couronne d'horizon | cryptocity-embellie.js:18 / :60 (`PAL.B.cryptoHor`, 110 tours) | appels et triangles |
| la mer de nuages sous la ville | continuite.js:253 (`merA` vrai pour `c.crypto`) | la nuit n'en a pas |
| les rais de projecteur | jade-balade.js:345 | nuit seulement |
| les pièces ₿, le verre de jour, la route de jour, l'accent, les clés de mort | jade-2.js:381, ville-verre.js:73, ville-nuit.js:214, depart-avance.js:318, mort.js:236 | |

C'est de là que venaient les **+10 programmes, +4 textures, ~+40 géométries et ~+16 % de triangles** du jour refusé : ce n'était pas la même ville.

### Ce qui a été fait

- **Le jour = trois météos de la carte `ville`** (`SF_CARTES.ville.m.matin / midi / soir`, ambiances `cjMatin`, `cjMidi`, `cjSoir`). Le niveau est celui de la nuit (`SF_NIV.ville`, **sans** `crypto` ni `vitre`) : même générateur, même graine, mêmes tours, mêmes géantes de verre, mêmes modules, mêmes cadres, mêmes scènes.
- **Ce qui change, seulement** : l'ambiance (ciel, soleil, brume, hémisphère, contre-jour, étalonnage), pas de pluie ni d'orage, pas de teinte néon de nuit (violet / vert / jaune), les façades en jour (`CITY.uJ`, déjà là), le verre des géantes qui renvoie le ciel (la branche de jour de `villeVerreTick`, prêtée le temps d'un appel), la route sèche et polie (`uGlace`, `uSheen`, `uTeinte` : uniformes déjà compilés), pas de lueur violette au pied des tours (`CITY.uPied`).
- **La carte `crypto` sort du tirage partout** (`SF_HORS.crypto = (ALLEGE || CRYPTO_JOUR) && !?carte=crypto`). Elle reste dans le code, intacte, jouable par `?carte=crypto`.
- **`?sans=cryptojour`** : rien de `cryptocity-jour.js` ne s'exécute, et `SF_HORS.crypto` reprend sa forme d'avant.
- Matin et soir retravaillés à partir de deux variantes chacun, photographiées aux mêmes vues (g13, g14) : matin « mB » (soleil bas doré, brume pêche, fogN 1300) retenu contre « mA » (trop proche du midi) ; soir « sB » (couchant orange et or sous un zénith bleu nuit) retenu contre « sA » (plus rose). Le midi est celui du tour 3, inchangé.

### A. Même map (graines 13, 14, 2, 7 ; `?tel=1`)

État lu dans le vrai jeu après la construction (`CITY.fam[*].M` = les matrices de TOUTES les tours, avant le tri près / loin ; la liste des géométries de `CITY.root` ; les points de la route) :

| graine | route (hachage, points) | tours | matrices des tours | géométries | nuit / matin / midi / soir |
|---|---|---|---|---|---|
| 13 | −1782735158, 6389 | 1082 | −1738270431 | −691760189 (10 objets) | **identiques ×4** (+ référence propre et `?sans=cryptojour` : identiques) |
| 14 | −680679214, 6911 | 2057 | 790677447 | −691760152 | identiques ×4 (6 cadres de néon partout) |
| 2 | 716799244, 6780 | 1600 | −356179852 | −691760152 | identiques ×4 |
| 7 | −1511691508, 6248 | 1380 | 1717307284 | −691760189 | identiques ×4 |

- En Node (le vrai `genCtrl`, `outils/banc-routes/charge.cjs`, graines 1-20, p0 et p10) : nuit, matin, midi et soir donnent les mêmes points de contrôle et les mêmes modules (p0 a867e02444d6, 6688 points ; p10 3cfb3eb63c63, 4992 points).
- ⚠ Un premier hachage des `InstancedMesh` de la ville différait entre jour et nuit (graine 14, portrait 13) : c'est le **tri près / loin** des tours (`villeRefait` / `villePousse`), qui suit la distance de la brume (fogN différent par heure). Les matrices de départ (`F.M`) sont identiques : ce n'est pas une autre ville.
- Photos : `planches/reprise1-jour-nuit-844x390.jpg` et `-390x844.jpg` : mêmes tours, mêmes passerelles, mêmes réclames aux mêmes places.

### B. Coût (`?tel=1`, une image du composer, toutes passes)

Le banc rend parfois une image « double » (appels et triangles ×2 environ, ex. 67 / 203 k contre 137 / 406 k à la même vue) : ça arrive de jour comme de nuit, dans la référence aussi. Les valeurs basses se comparent entre elles.

| 844×390, s25 / s55 / s85 | appels | triangles (k) | programmes | textures |
|---|---|---|---|---|
| g13 nuit (lot) · référence · `?sans` | 141*/119/49 · 71/120/49 · 70/119/49 | 333*/273/82 · 168/275/82 · 165/273/81 | 154 | 121 |
| g13 midi · matin · soir | 69/125/53 · 69/125/53 · 138*/125/53 | 165/273/81 | 154 | 121 |
| g14 nuit | 129*/74/60 | 341*/193/191 | 154 | 121 |
| g14 midi · matin · soir | 71/72/60 · 63/72/60 · 71/72/60 | 170/190/189 | 154 | 121 |
| g2 nuit | 68/75/84 | 203/172/239 | 154 | 121 |
| g2 midi · matin · soir | 137*/74/89 · 67/66/89 · 67/66/89 | 203/172/236 | 154 | 121 |
| g7 nuit | 187*/78/105 | 462*/211/234 | 154 | 121 |
| g7 midi · matin · soir | 180*/75/49 · 90/75/49 · 180*/75/49 | 231/212/116 | 154 | 121 |
| **390×844**, g14 s30 / s60 : nuit · matin · midi · soir | 59/55 · 58/54 · 58/54 · 58/54 | 162/151 partout | 154 | 121 |
| 390×844, g13 s30 : nuit · midi | 68-69 · 67 (150* une fois) | 164-167 · 164 | 154 | 121 |

(* image double du banc.) Géométries : 514 à 546, de jour comme de nuit, d'un chargement à l'autre.

- **Programmes : 154 de jour = 154 de nuit. Textures : 121 = 121.** (L'ancien jour : 164 et 125, mesuré ici à g13 midi `?carte=crypto` sur la référence : 145*/90/83 appels, 360*/257/267 k triangles.)
- **Triangles : égaux** à ±3 k. **Appels : égaux, ou +4 à +6** (g13 s55 : 125 contre 119-120). Audit appel par appel (g13 s55) : la liste est la même ligne pour ligne, sauf **+7 sprites** (le soleil et ses halos : 8 contre 1, 0 triangle) et **−1 `LineSegments`** (l'éclair de l'orage). Sur g7 s85 et g2, le jour fait moins que la nuit (pas de pluie).
- **Courses de jour, prébâti coupé, `?carte=ville&meteo=…`** : midi g13 → portail → nuages:matin ; soir g14 → jade:matin ; matin g2 → nuages:nuit. **154 programmes du premier au dernier relevé (32 à 37 relevés), 0 programme nouveau** (clés comparées), **0 erreur console**, 0 mort. Les 40 chargements photo : 0 erreur.
- Rien à chauffer au menu : le jour n'a aucune matière à lui (`cjChauffe` n'existe plus).

### C. Image (planches `reprise1-*`, jugées par moi, sévèrement)

- **Midi** : azur franc, bande d'or à l'horizon, verre des géantes bleu, route ardoise lisible. Le plus réussi.
- **Matin** : soleil bas doré, brume pêche, tours au soleil cuivrées, route brun-gris lisible. Plus de lavande délavée en paysage ; il en reste un peu au zénith en portrait (jMid .66/.62/.82).
- **Soir** : couchant orange et or sous un violet. Identité franche, mais **trop saturé** à certaines vues : la route devient un aplat orange (g14 s85, g7 s85) et les tours proches rouge-orange. À baisser (sat, con) si Sacha le trouve criard.
- Les trois heures se distinguent au premier coup d'œil, et c'est clairement la même ville que la nuit.
- **Ce que le jour n'a pas** : les liserés néon roses de la route et les flaques mouillées de la nuit (le jour a un filet d'or). Les fenêtres des tours lointaines se lisent à midi et au matin, peu au soir. Les pièces se lisent (orange sur ardoise ou bleu) ; au soir, sur fond orange, moins bien.
- Les photos sont à l'arrêt, HUD visible, avec le flou de vitesse du pilote.

### D. `?sans=cryptojour` = le jeu d'avant

| 200 parties (1 départ + 2 portails), hasard graine 4243, `?tel=1` | empreinte du tirage | BIOMES | SF_CARTES | m2Cartes |
|---|---|---|---|---|
| référence propre (HEAD assemblé) | −1558140413 | 1747857425 | −69475444 | 1178376582 |
| lot | 1011681169 | −134387568 | −526369708 | 1178376582 |
| lot `?sans=cryptojour` | **−1558140413** | **1747857425** | **−69475444** | 1178376582 |

La nuit g13 : référence 71/120/49 appels, `?sans` 70/119/49, 154 programmes, 121 textures, même état de ville (hachages ci-dessus). `index.html` contre la référence propre : seule la ligne `SF_HORS` change, plus le nouveau morceau et `CRYPTO_JOUR`.

### E. Tirage sur 600 (200 parties × 3 zones, même hasard)

| | Crypto City | nuit `ville:orage` | matin | midi | soir | canyon / espace / grotte / jade / nuages |
|---|---|---|---|---|---|---|
| téléphone avant | 113 | 113 | 0 | 0 | 0 | 46 / 110 / 110 / 105 / 116 |
| ordinateur avant (`SF_HORS.crypto` faux) | 114 | 64 | 9 (`crypto`) | 18 (`crypto`) | 23 (`crypto`) | 58 / 114 / 106 / 103 / 105 |
| **lot, téléphone = ordinateur** | 113 | 61 | 16 | 21 | 15 | 48 / 105 / 111 / 110 / 113 |

- Crypto City garde sa place (une map au tirage) ; les autres maps restent dans le bruit du hasard. Au sein de Crypto City, `CJ.part` = 0,5 donne les mêmes poids qu'avant sur l'ordinateur (orage 3,5 ; matin 1, midi 1,3, soir 1,2). `dbgCryptoJour({part:x})` le règle (0 : jamais de jour).
- Le jour sort **au départ ET aux portails** : il n'a plus rien à compiler, donc plus besoin de le limiter au départ.
- Le tirage de l'ordinateur et celui du téléphone sont maintenant **le même** (empreintes égales en simulant `SF_HORS.crypto` faux).

### Décisions pour Sacha

1. **L'ordinateur perd l'ancien jour de Crypto City** (la carte `crypto` : ses tours d'or et de verre, ses pièces géantes, ses diamants, ses dirigeables, ses fusées, sa pluie d'argent, sa couronne d'horizon, sa mer de nuages, sa route à elle). Il gagne le jour de la vraie ville. C'est la conséquence directe de « la même map, juste le soleil qui change ». La carte reste dans le code (`?carte=crypto`) ; `?sans=cryptojour` rend tout.
2. **La part de la nuit** dans Crypto City passe de 100 % à ~54 % sur téléphone (`CJ.part` = 0,5, comme l'ordinateur depuis le 25/10).
3. **Les missions météo** (`m2Meteo`) : sur téléphone, Crypto City compte 4 météos au lieu d'une ; sur l'ordinateur, ses météos de jour s'appellent `ville:matin…` au lieu de `crypto:matin…`, donc la progression déjà faite sur l'ancien jour ne compte plus. Non testé en jeu.
4. **Le soir** : garder ce couchant franc ou l'adoucir.

### Ce qui N'EST PAS vérifié

- Aucun vrai iPhone (chauffe, i/s). Comme le jour coûte ce que coûte la nuit, le risque est celui de la nuit.
- Le vrai `?tel=0` (ordinateur en mode bureau) : non photographié, le banc reste en émulation mobile.
- Le passage d'un portail VERS le jour (les trois courses partent du jour) ; les programmes sont les mêmes que la nuit, donc rien à compiler, mais pas vu.
- Le premier JOUER qui tire naturellement le jour (les courses imposent la carte par l'URL).
- La musique : le jour joue celle de la carte `ville` (la nuit). Non écouté (banc muet).
- Les missions météo en jeu (décision 3).
- Le soir (aplats orange) à d'autres graines que 13, 14, 2, 7.

Bancs : `<scratchpad>/lot-j2/` (`banc.cjs`, `mk*.py`, `var.py`, `planche.py`, `pl2.py`, `empreinte-jn.cjs`, `p1` à `p6`). Six prises sous verrou (`ville-cyber-j`) : 17:34 → 17:41, 17:42 → 17:44, 17:45 → 17:48, 17:54 → 17:57, 19:00 → 19:03, 19:03 → 19:08 (la 1re perdue : référence sans ses fichiers, état lu hors de `__ev`, corrigé). Chrome muet (`--mute-audio`, sfx, mus, vox coupés), profil supprimé et verrou rendu à chaque prise. Environ 1 h d'attente du verrou (sept sessions en file).
