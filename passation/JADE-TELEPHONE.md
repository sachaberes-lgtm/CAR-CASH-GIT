# JADE ALLÉLUIA SUR TÉLÉPHONE — passation pour la session d'optimisation iOS (2026-11-13)

Demande de Sacha : « regarde le plan d'optimisation iOS et fais l'optimisation de la nouvelle map Jade de la même manière qu'elle est actuellement
sur mobile ; fais le gros du travail et mâche le travail pour la session d'optimisation ; je la teste sur téléphone dans tous les cas. »

**Branche** : `jade-alleluia-tel-2026-11-13` = `jade-alleluia-pub` (a5da3a90 : la descente Alléluia + main v1568) + cette passe.
Rien n'est sur `main`. **Rien n'a été mesuré sur un iPhone** : tout ce qui suit vient du banc Chrome sans fenêtre en édition téléphone
(`--tel=1` : tactile émulé, 390×844, donc `TEL_NATIF` et `ALLEGE` vrais, cubes de 3,5 m). Un banc Chrome compte (triangles, appels, tranches,
erreurs) ; il ne juge pas la fluidité (plan iOS § 5.4).

## En cinq lignes
1. La nouvelle Jade coûtait plus cher que celle qui tourne aujourd'hui sur téléphone en DEUX endroits, pas plus : un gel au tirage de la route, et la route elle-même à l'image.
2. **Le tirage** (10 essais d'affilée) tenait le fil 133-202 ms d'un trait (avant : 45 ms), pendant la course d'avant → 40 tranches de 9-20 ms. Même route au bit près.
3. **La route** montrait 3-5 tranches de bitume en pleine finesse (144-240 k triangles) au lieu de 1-2 → règle « tranche moyenne par l'abscisse », téléphone seulement. Image identique.
4. Résultat : triangles dessinés au niveau de l'ancienne Jade (médiane ~440 k contre ~455 k ; pire pointe 736 k contre 770 k). Les montagnes, les scènes et les cascades ne sont PAS touchées.
5. Reste à faire sur le vrai téléphone : la liste « À mesurer » plus bas (5 points, dans l'ordre).

## Ce que le plan iOS demande, et comment c'est tenu ici
| Règle du plan (`passation/ios-ultime/PLAN-ULTIME.md`, branche `ios-ultime`) | Ici |
|---|---|
| Mobile seulement, l'ordinateur ne change pas | la règle de la route est sous `PISTE_MOY` (donc `ALLEGE`) ; le tirage en tranches rend la même route partout |
| DA intouchée | aucune montagne, île, cascade ni scène retirée ; photo avant/après de la route identique |
| Chaque allègement d'image a un interrupteur d'adresse | `?pistemoys=0` |
| Jamais d'un bloc pendant une course (les lacs de la grotte, build 62) | tirage et couloir du vol en générateurs à rendez-vous |
| Piloté par la mesure | tableaux ci-dessous ; rien d'allégé « à l'aveugle » |

## 1. Le tirage en tranches (`code/maps/jade-alleluia.js`, `code/moteur/depart-avance.js`)
- `genJadeA` jouait 10 essais (`JADE_A.essais`, jamais arrêtés avant : aucune note ≤ 0,6), chacun 13-20 ms sur PC : le dessin des scènes 0,5 ms, le dévers lissé 2-3,
  les cônes de 30° et 8° 4-7, le roulis 1,3, la grille et le plus court écart 3-4, les tirs des raccourcis 1-2, les croisements et conflits 2.
- Il tourne dans `pisteRoute`, donc dans le pré-bâti (`prebJob`) PENDANT LA COURSE D'AVANT. Sur un iPhone chaud (×4 à ×6, mesures du plan) : 0,6 à 1 s de gel.
- Désormais `genJadeG` / `genJadeAG` / `jadeAGenG` sont des générateurs (comme `genCanyon`, `genDunes`) : un rendez-vous entre deux essais et trois dans chaque essai.
  `genJadeA` (d'un trait) reste pour les bancs (`dbgGenRoute`, `dbgGenBilan`). `tenue()` (les cônes) saute les départs qui ne peuvent pas battre la meilleure tenue : même résultat.
- `jadeCouloirVol` (7-13 ms d'un trait dans `jadeBatit`) → `jadeCouloirVolG`, un rendez-vous par vol à l'échéance `JF.lim`.
- Lire : `dbgJadeA()` → `genMs` (travail cumulé), `genMax` (plus longue tranche), `genTranches`.

| Graine (tél.) | Avant : d'un trait | Après : plus longue tranche | Tranches | Route (L, scènes, essai gardé, note) |
|---|---|---|---|---|
| 1 | 146-159 ms | 9,7-20,5 ms | 40 | identique (7 802 m, tours·colimaçon·envers·balcon·puits, essai 2, 3,45) |
| 2 | 133-148 ms | 9,0-10,4 ms | 40 | identique (8 228 m, îlots·spirale·couloir·balcon·stade, essai 9, 3,07) |
| 3 | 202 ms | 12,1-15,2 ms | 40 | identique (7 443 m) |
| 4 | — | 13,5 ms | 40 | 7 587 m |

## 2. La tranche moyenne par l'abscisse (`code/moteur/piste-prebati.js`, `code/rendu/autoroute.js`)
- La règle d'aujourd'hui sur téléphone (24/10) : une tranche de route passe en MOYENNE (une rangée sur 4 m) quand le point le plus proche de sa sphère est à plus de 400 m.
- La descente Alléluia s'enroule (spirale, stade, colimaçon, puits, tours) : la sphère d'une tranche de 720-1 200 m avale la caméra, la règle ne joue plus.
- Ajout, téléphone et Jade Alléluia seulement : une tranche est AUSSI moyenne quand elle est tout entière à plus de 260 m de route devant la caisse ou 70 m derrière
  (`PISTE_MOYS={av:260,ar:70,maps:{jade:1}}`). La tranche où l'on roule reste fine. Bitume, rails et nappes néon, traits et îlots d'autoroute suivent (ils ont déjà leur moyenne).
- `dbgPiste().parAbscisse` : le nombre de tranches passées en moyenne par cette règle à l'image courante (14-16 en course au banc). `?pistemoys=0` = avant.
- Les autres maps enroulées (nuages carte postale, grotte en étages) : ajouter leur `piste` à `PISTE_MOYS.maps` APRÈS mesure — pas fait, Sacha a dit « Jade seulement pour l'instant ».

Triangles dessinés par image (milliers), 14 points le long de la route, édition téléphone, `dbgChamp()` :
| | Graine 1 | Graine 2 | Graine 3 | Graine 4 | Moyenne |
|---|---|---|---|---|---|
| Ancienne Jade (`?sans=jadev3`) — médiane / pointe | 475 / 649 | 391 / 568 | 419 / 588 | 536 / 770 | 455 / 644 |
| Alléluia avant cette passe | 546 / 807 | 453 / 857 | 381 / 636 | 620 / 820 | 500 / 780 |
| Alléluia après | 507 / 665 | 394 / 736 | 313 / 512 | 547 / 715 | 440 / 657 |

Appels de dessin : médiane 130-155, pointe 161-187 (ancienne : 127-146 / 146-174). Les 6 gabarits d'îles ajoutent quelques familles : pas touché.
Détail d'une pointe (graine 2, la spirale, s 2 194) avant la passe : montagnes 360 k, bitume 240 k (5 tranches fines), rails 58 k, nappes 58 k, traits 36 k.

## 3. Ce qui a été regardé et laissé tel quel (avec la raison)
| Sujet | Mesure (tél.) | Verdict |
|---|---|---|
| Montagnes à l'image | 304-360 k contre 264-298 k (+15-20 %) : la route repliée ramène près de la caisse le décor de plusieurs lacets | laissé : la parité est retrouvée par la route seule. Levier prêt si le téléphone le demande : `MOB` (`jade-3.js`, .35 en sobre) → .28 quand `JADE.deco3`, derrière un interrupteur — c'est le SEUL levier qui se verrait |
| Nombre de montagnes | 121-207 pics + 102-136 îles (ancienne : 313-330 pics) | équivalent |
| Gabarits (6 îles et massifs en plus) | 404-601 ms de taille contre 265-302 ms, déjà en tranches au menu (`gabFondMs`) | laissé ; à surveiller : `dbgGabarits().msFinSurPlace` si JOUER arrive avant la fin |
| Cascades | 4-7, longueur déjà bornée sur téléphone (`ALLEGE?420:900`) | laissé |
| Le saut prédit (`jadeSautSur`) | joué à l'appui du saut seulement, 50 pas | laissé |
| Fils d'or | 3 ms, ≤ 28 pièces | laissé |
| Bâti de la map (`dbgJade().ms`) | 505-729 ms contre 353-576 ms, en tranches | laissé (route 15-20 % plus longue : 7,4-8,2 km) |

## 4. Vérifié au banc
- 4 graines × édition téléphone : 0 erreur, 0 trou de route, mêmes poses de décor (`poses3`) qu'avant la passe.
- Course au pilote 50 s × 2 graines, pré-bâti allumé : vivant, 0 erreur, `window.__jadeErr` vide.
- Photo de la spirale (graine 2, s 2 194) avec et sans la règle : la route est la même à l'œil, même vue de 18 m au-dessus (le pire cas : en jeu la moyenne n'est jamais à moins de ~60 m).
- Assembleur d'accord ; gardes démarrage, charte, allègement, burn-out : OK ; `non-declares.cjs` : rien de neuf.
- **Non conclu** : les tâches longues du fil pendant 60 s de course (`audits/jade-tel-taches.js`, PerformanceObserver). Avant la passe : 0 à 38 tâches par course, la pire 913 ms ;
  après : 0 à 23, la pire 1 435 ms ; trois courses sur quatre à zéro dans les deux cas. Le banc sans fenêtre est trop bruité pour ça et ces tâches ne viennent pas du tirage
  (il est fini avant la course). Aucun gain revendiqué ici : c'est la boîte de vol du téléphone qui tranchera (point 1 ci-dessous).
- Vu en passant, PAS de cette passe : graine 4, une tour de scène refusée (`tour-voisin`, `poses3.refus` 1) — à signaler à la session Jade.

## 5. À MESURER SUR LE TÉLÉPHONE (la session d'optimisation), dans l'ordre
1. **Boîte de vol, une course qui finit dans Jade puis une qui y commence** : images > 21 ms et > 51 ms dans Jade, contre les chiffres du vol 72 (Jade ~30 i/s, 4 ms de travail, téléphone critical).
2. **Le gel du tirage** : pendant la map d'AVANT Jade, chercher une image longue marquée « reconstruction » (drapeau 2). Attendu : plus aucune au-dessus de ~100 ms venant de `genJadeAG`.
   Si une tranche pèse encore trop sur un téléphone chaud, couper plus fin : ajouter un `yield` dans `jadeAGenG` avant `let rMax=0` et avant `let racOk=0`.
3. **A/B de la route** : build avec `--qs pistemoys=0` contre sans, même état thermique, trois passes (plan § 5). Garder si les images en retard baissent ; Sacha ne doit rien voir changer.
4. **Si Jade reste plus lourde que les autres maps** : le levier `MOB` du § 3 (visible : à montrer à Sacha), puis `TEL_NATIF?650:900` (la portée des gabarits, `jade-3.js:172`).
5. **Séance longue** : la mémoire après 3 passages dans Jade (route plus longue, 6 gabarits de plus) — lignes `memoire` de la boîte noire.

## 6. Intégrer
- Fusionner `jade-alleluia-tel-2026-11-13` APRÈS que la descente Alléluia est entrée dans `main` (elle ne l'était pas le 13/11 au soir : `origin/main` = 79ab0221, v1569).
- Conflits attendus : aucun dans `code/` si Alléluia arrive telle quelle ; `sw.js` n'est PAS monté ici (à monter à l'intégration, +1).
- Après fusion : `node code/assembler.cjs --depuis-morceaux`, les 4 gardes, `node outils/banc-course/non-declares.cjs`, puis une course AVEC photos.
- Banc pour rejouer les mesures : `node outils/banc-maps/serveur.cjs 8371`, puis
  `node outils/banc-maps/banc.cjs gen --carte=jade --graines=1,2,3,4 --tel=1 --port=8371 --cdp=9571 --profil=jadetel --auditfile=outils/banc-maps/audits/jade-tel-champ.js`
  (`jade-tel-tirage.js` : le tirage ; `jade-tel-champ.js` : les triangles le long de la route ; ajouter `--q=sans=jadev3` pour l'ancienne Jade, `--q=pistemoys=0` pour sans la règle).
