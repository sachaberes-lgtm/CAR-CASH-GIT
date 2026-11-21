# Preuves finales — TÉLÉPHONE (`?tel=1`, 844×390) — ville de nuit, route à étages + décor du 3/11

21/11/2026, 16:00-16:56, vérificateur `ville-cyber-p1`. Je n'ai rien modifié dans le jeu : seulement ce rapport et 3 planches.

## Verdict
Le décor du lot F ne casse rien au téléphone.
- Aux paliers 0 et 10 (4 courses de 70 s avec le décor, 4 sans) : **aucune mort, aucune traversée de volume, aucune tour ni enseigne dans la route, 0 erreur de console, 0 programme compilé**.
- Coût moyen du décor : **+2 à +3 % d'appels et 0 à +5 % de triangles**.
- Au palier 20, le pilote automatique meurt souvent (5 à 7 fois en 4 courses). Mais **il meurt aux mêmes endroits avec et sans le décor**. Ces morts viennent de la route à ce palier, pas du décor (voir § 2).

## 1. Méthode
- **Pages :** worktree servi en lecture seule (port 8971), Chrome sans fenêtre `--mute-audio`, profil et port à moi, tous supprimés à la fin. Le son était coupé dans la sauvegarde lue par le jeu (sfx, mus et vox à `false`, vérifié dans chaque course).
- **Verrou :** pris 5 fois, jamais plus de 7 min par prise. Je n'ai rendu que ma propre place.
- **Index utilisé :** `index.html` du disque, assemblé depuis `code/` (`--verifier` ✔, 350 morceaux, 13 222 733 octets).
- **Les courses :**
  - URL : `?intro=ancien&attente=0&prebati=0&tel=1&carte=ville&meteo=orage&teinte=violet&pistegraine=G`. Pour la comparaison, j'ajoute `&sans=villedecor`.
  - Une fois la course lancée : `dbgTremble({tier:P})` fixe le palier moteur, puis `dbgClassique('ville','orage','violet')` et `dbgSaut()` posent une piste ville neuve à ce palier.
  - À chaque portail, `dbgClassique` est rappelé : toutes les pistes jouées sont des villes de nuit, ce que j'ai vérifié par `dbgClassique().niveau`.
- **Graines neuves :** 5207 et 5213 au palier 0 ; 5221 et 5233 au palier 10 ; 5249 et 5257 au palier 20.
  - Les routes sont identiques avec et sans le décor : même empreinte de 64 points de `dbgRoute().pts` dans chaque paire.
- **Pilotage :** `dbgAuto(1,0,{vol:1})`, c'est-à-dire que le pilote dirige aussi en l'air, comme un joueur.
  - De 0 à 30 s : conduite seule.
  - De 30 à 70 s : un saut du banc toutes les 6 s (`saut:6`, c'est `startFall`, le saut du joueur), plus 4 nitros **tenues à la vraie touche Espace** pendant 3 s chacune (à 32, 42, 52 et 62 s).
  - Après une mort, je relance (`dbgJouer`) jusqu'à 60-70 s de jeu cumulées.
- **Comptes :**
  - Appels et triangles : `renderer.info` sur **une image du jeu**. J'enveloppe un seul appel de `loop()`, avec `autoReset` coupé pendant cet appel.
  - Je compte une image toutes les 2 s. Les images sautées par la cadence (rien de dessiné) sont exclues.
  - Programmes : `renderer.info.programs.length`, relevé toutes les ~130 ms.
- **Traversée de volume :** toutes les 6 images, je teste la position de la caisse contre les boîtes de **toutes** les instances de la scène (3 500 à 5 000 boîtes). Les boîtes sont refaites à chaque nouvelle piste.
- **Tour ou néon dans la route :** `dbgVilleAudit()` sur chaque piste jouée (dans / frôle / flotte).

## 2. Morts, volumes, route

| palier | graine | jeu (décor / sans) | morts décor / sans | caisse dans un volume (vivante) | audit dans / frôle / flotte |
|---|---|---|---|---|---|
| 0 | 5207 | 70 / 70 s | 0 / 0 | 0 / 0 | 0/0/0 |
| 0 | 5213 | 70 / 70 s | 0 / 0 | 0 / 0 | 0/0/**2** (les deux variantes) |
| 10 | 5221 | 70 / 70 s | 0 / 0 | 0 / 0 | 0/0/0 |
| 10 | 5233 | 70 / 70 s | 0 / 0 | 0 / 0 | 0/0/**2** (les deux variantes) |
| 20 | 5249 | 65 / 70 s | 3 / 2 | 0 / 0 | 0/0/0 |
| 20 | 5257 | 64 / 63 s | 4 / 4 | 0 / 0 | 0/0/0 |

**Tour ou néon dans la route : 0 sur les 12 courses.**
- Les « flottes » sont 2 enseignes posées hors de tout mur. Elles sont à y −1175 (g5213) et y −1016 (g5233), loin sous la route.
- Elles existent avec **et sans** le décor : le défaut est d'avant le lot F (le journal note déjà « 2 enseignes flottantes »).

**Caisse dans un volume : jamais pendant la conduite ni pendant un saut.**
- Le test touche des boîtes seulement après un crash (état `boom`) : la carcasse est alors posée dans la façade heurtée. Ce n'est pas une traversée.

**Palier 20 : les morts ne viennent pas du décor.**
- Toutes ont la cause `tour`.
- Le schéma est toujours le même : la caisse dérive au bord (lat ±28-30, alors que la demi-route fait 28 m) à 1 300-1 700 km/h, quitte la route et finit dans une tour.
- Les mêmes endroits tuent **dans les deux variantes** :
  - g5257 : vers s ≈ 5 530, 2 fois avec le décor et 2 fois sans, **dont une fois en phase 1, sans saut ni nitro** ;
  - g5257 : vers s ≈ 2 400-2 580, 1 fois avec le décor et 1 fois sans ;
  - g5257 : vers s ≈ 4 940-4 990, juste après un saut, 1 fois avec le décor et 1 fois sans ;
  - g5249 : vers s ≈ 4 960-4 980, juste après un saut, 1 fois avec le décor et 1 fois sans (cause `air` sans le décor) ;
  - g5249, avec le décor seulement : vers s ≈ 7 270, 2 fois, dont une en phase 1 sans saut. La course sans décor n'est jamais passée là : elle avait pris le portail plus tôt ;
  - g5249, sans le décor seulement : vers s ≈ 2 430 en zone 2. Au premier passage du banc, la course avec le décor était morte au même endroit (s 2 588 contre 2 607).
- **« Mort sans raison » ?** La mort de g5257 vers s ≈ 5 530, sans saut ni nitro, est soit une limite du pilote, soit un virage trop dur à 1 300 km/h. Je ne peux pas trancher sans un humain au volant.
  - C'est un point de la route à étages (lot E) au palier 20, présent aussi avec `?sans=villedecor`.
  - Planche `final-tel-p20.jpg`, dernière ligne : explosion contre une façade, la même avant et après.
- Aux paliers 0 et 10, il n'y a aucune mort en 8 × 70 s, sauts et nitros compris.

## 3. Coût par image (`renderer.info`, moyenne / pointe)

| palier | graine | appels sans décor | appels décor | écart moy / pointe | triangles sans | triangles décor | écart moy / pointe | images (décor/sans) |
|---|---|---|---|---|---|---|---|---|
| 0 | 5207 | 117 / 185 | 120 / 195 | +3 % / +5 % | 297 k / 450 k | 313 k / 429 k | +5 % / −5 % | 34/35 |
| 0 | 5213 | 98 / 174 | 100 / 169 | +2 % / −3 % | 258 k / 386 k | 258 k / 393 k | 0 % / +2 % | 34/35 |
| 10 | 5221 | 121 / 176 | 124 / 174 | +3 % / −1 % | 346 k / 500 k | 354 k / 526 k | +2 % / +5 % | 34/34 |
| 10 | 5233 | 100 / 134 | 102 / 138 | +2 % / +3 % | 328 k / 473 k | 326 k / 474 k | 0 % / 0 % | 35/35 |
| 20 | 5249 | 110 / 136 | 113 / 154 | +3 % / +13 % | 363 k / 522 k | 403 k / 563 k | +11 % / +8 % | 19/11 |
| 20 | 5257 | 111 / 136 | 112 / 151 | 0 % / +11 % | 428 k / 599 k | 405 k / 572 k | −5 % / −5 % | 11/11 |

- **Paliers 0 et 10 (les mesures fiables) :** appels +2 à +3 % en moyenne, triangles 0 à +5 %.
  - C'est dans la fourchette du contrôle d'hier (−1 à +8 %).
- **Palier 20 :** il y a peu d'images valides (11 à 19), parce que les morts et les relances font jouer des tronçons différents d'une variante à l'autre. Les écarts (−5 à +13 %) y sont du bruit de tronçon, pas une mesure propre du décor.
- **Plafond téléphone (124 appels / 311 k) :**
  - déjà dépassé en moyenne de triangles aux paliers 10 et 20, **avec ou sans le décor** ;
  - les pointes (134-195 appels, 386-599 k) le dépassent partout, avant comme après.
- **Sous nitro :** 260-430 k triangles, sans écart net entre les deux variantes.

## 4. Sauts et nitros joués
Dans chaque course : 4 à 5 nitros allumées (`nitroOn` vérifié), 5 à 7 envols, dont au moins 3 sauts du banc en phase 2, photographiés en l'air (étiquette `saut`).

- **Rien dans l'air des sauts aux paliers 0 et 10 :** aucune caisse dans un volume, et pas de tour ni de néon devant la caisse en vol sur les photos. Une grande façade pâle passe près de la route (g5213, `saut` n° 11), mais pas sur la trajectoire.
- **La voiture reste lisible :**
  - **Sur la route et sous nitro : oui.** La caisse est nette au centre et le flou de vitesse étire seulement les côtés. C'est vrai sur les 3 planches.
  - **En saut aux paliers 0 et 10 : moyen.** La caméra reste en arrière : la caisse devient petite (environ 30-60 px de large) et parfois masquée par ses propres traînées de nitro ou par les pièces qu'elle ramasse (g5213, `saut` n° 13). **C'est identique avec `?sans=villedecor`** (même cadrage, colonnes voisines des planches) : ça vient de la caméra, pas du décor.
  - **En saut au palier 20 : non.** La caisse sort de la route sur le côté : on ne voit que des traînées orange et la route en bande sombre au bord de l'image (`final-tel-p20.jpg`, lignes 4 à 7). C'est pareil sans le décor.
- **Le décor se voit-il ?**
  - Sur ces 4 graines des paliers 0 et 10, la différence avec `?sans=villedecor` est **faible** à 844×390 : les photos des deux variantes se ressemblent beaucoup.
  - Comme hier (g4103 « à peine »), le décor ne se voit nettement que sur certaines graines.

## 5. Programmes compilés en course
- **0 pendant la conduite, les sauts et les nitros**, dans les 12 courses.
- Paliers 0 et 10 : 153 → 153 (152 → 152 sans le décor ; le décor ajoute 1 programme, compilé au chargement).
- **+1 programme à la PREMIÈRE mort de chaque course qui meurt** (palier 20 ; 154 → 155 ou 153 → 154), à l'instant de l'explosion. C'est la même chose sans le décor : le programme de l'explosion n'est pas chauffé d'avance. Ce n'est pas lié à la ville.

## 6. Console
- **0 erreur et 0 avertissement** dans les 12 courses (exceptions et `console.error`/`warn` écoutés).
- Le seul plantage a été celui de MON banc : au premier passage du palier 20, `computeBoundingBox` est tombé sur une géométrie vidée. J'ai corrigé le banc et refait le palier 20 en entier.

## 7. Planches (regardées une à une)
- `planches/final-tel-p0.jpg`, `final-tel-p10.jpg` et `final-tel-p20.jpg`, toutes ≤ 230 Ko.
- 4 colonnes : graine 1 avec le décor | graine 1 sans | graine 2 avec le décor | graine 2 sans.
- Lignes : route, route, nitro, sauts, nitro, et la mort au palier 20.

## 8. Ce que je n'ai PAS vérifié
- Le vrai iPhone : tout ici tourne dans Chrome sur Mac (GPU Metal) qui imite un téléphone. Je n'ai mesuré ni le temps par image ni la chauffe.
- La mise en portrait 390×844, l'ordinateur, la ville de jour (cjMatin/cjMidi/cjSoir), et les autres météos (`?plus=villenoire` non joué).
- La cause exacte des morts du palier 20 : un humain au volant passerait-il le virage de g5257 à s ≈ 5 530 ? À rejouer à la main.
- Le pilote ne saute qu'avec le saut du banc (`startFall`, celui du joueur). Le double-tap tactile et les figures n'ont pas été joués.
- Les 2 enseignes flottantes de g5213 et g5233 ne sont pas photographiées (elles sont à 1 km sous la route).
- **Anomalie notée, sans y toucher :** l'`index.html` **commité** dans HEAD 962194182 (12 818 552 octets) n'est pas celui que donnent les morceaux de `code/` du même commit. Celui du disque, assemblé, fait 13 222 733 octets ; il est marqué « modifié » dans `git status` et contient par exemple `pauseSure` du 17/11, que l'index commité n'a pas. Tout ce rapport porte sur l'index assemblé du disque. Il faudra committer l'index assemblé avant de livrer.

Bancs (scratchpad, `p1/`) : `cdp.cjs`, `course.cjs`, `sous-verrou.sh`, `tableau.cjs`, `planche.py`, et les résultats bruts dans `p0/`, `p10/` et `p20/` (`r-*.json` et les photos).
