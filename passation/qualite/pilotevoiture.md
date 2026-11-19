# Lot « pilotevoiture » — sous le pilote, la voiture nette en dernier (19/11)

Branche `qa/pilotevoiture`, partie d'`origin/qualite-appareil` (df4b24087). Rien sur main, rien sur le téléphone.
Règle de Sacha (18/11) : « je préférais que ça soit la map qui baisse en qualité en priorité et que la voiture soit toujours le plus nette […] d'abord les textures, ensuite la voiture ».
Les deux défauts viennent du contrôle de l'ensemble du 19/11 (`NUIT-18-11.md`, fin).

## 1. Le pilote retirait la loupe trop tôt : CORRIGÉ

### Ce qui se passait
La loupe (`rendu/loupe-caisse.js`) est ce qui garde la caisse nette : la toile visible reste à la taille de l'écran (2532×1170) et la caisse y est reconstruite le long de ses arêtes.
Sous le pilote, `loupeChaud()` rend `PILO.lpOff`, et le pilote posait `lpOff = K >= 8`. Donc :
- la loupe tombait au cran 8, en même temps que la recette critique du décor, AVANT le niveau − 1, la résolution et le halo coupé ;
- l'urgence est un moment « sous voile » pour `pilAppliquer` : elle posait K9/K10, donc retirait la loupe EN COURSE, et la toile visible passait de 2532×1170 à 949×438 ;
- une course qui finissait à K ≥ 8 repartait sans loupe (la séance et l'hystérésis gardent le cran 60 s), même revenue au froid ;
- la règle de « la voiture d'abord » (`VDA`) n'agissait pas : le pilote garde `QL.k` ≤ 2 et `loupeChaud` sort avant elle.

### Ce qui change (`code/moteur/pilote-qualite.js` seulement)
- **La loupe devient le cran 13**, le dernier, après la SURVIE (K12, halo coupé). Elle ne tombe qu'à K13, ou à CRITICAL. Critical, c'est la même règle que « la voiture d'abord », que `?sans=pilote` et que la borne S3 : la base ne garde pas la loupe à critical.
- **La loupe ne change qu'à un moment sous voile** : départ, mort, pause, menu, reprise. Jamais en course, jamais à l'urgence.
- **Elle revient dès que l'état le permet** : à chaque moment sous voile, `pilPaie` regarde si la loupe doit changer, même si le cran ne bouge pas.
- **K13 ne s'apprend pas et ne sert jamais de départ** : `pilDepartCalc` borne le départ à 12 et la mémoire à 12. Une course repart donc toujours AVEC la loupe, sauf à critical. On n'atteint K13 que par la dette d'une course déjà à K12 (ROUGE ou ORANGE tenus), payée à la mort ou à la pause.
- **L'urgence retire d'abord le décor.**
  - 1re urgence : K7-K8 (halo ½, recette critique), posés comme au portail. Les cibles du halo sont refaites, la résolution ne bouge pas, la loupe non plus.
  - 2e urgence, seulement si le ROUGE tient encore 8 s (5 s d'ORANGE au critical) : la résolution (niveau − 1 ou × 0,9), comme avant.
  - Avec la loupe posée, la 2e urgence ne change plus la taille de la toile VISIBLE ; seules les cibles de la scène sont refaites. C'est le dernier recours, et il reste en course : la fluidité passe avant le verrou, comme le pilote l'a toujours voulu.
- Les dettes ne visent K13 qu'une fois K12 posé (`pilKPlaf`).
- `?pilote=K13` existe ; `dbgPilote()` donne `pv`, `lpOff`, `loupe {on, toile}` et `nUrgD` (le nombre d'urgences « décor »).

L'échelle elle-même (K0-K12, `pilVoulu`) n'a pas bougé : la borne S3, le plafond des gels et la table de départ sont les mêmes au bit près.

### Les interrupteurs
- `?sans=pilotevoiture` = l'ordre d'avant au bit près : loupe retirée dès K8, à l'urgence aussi, échelle 0-12, urgence d'un seul coup.
- `?sans=voituredabord` fait la même chose sous le pilote : sans « la voiture d'abord », la voiture n'a plus la priorité. Hors pilote, il garde son sens.
- `?sans=pilote` est inchangé : le pilote est éteint et rien de ce lot ne joue.

## 2. Le menu au toucher, sous le pilote : NON REPRODUIT, cause non trouvée

Le contrôle avait mesuré, au premier toucher après le repos à 15 i/s, 30 i/s pendant 300 ms avec le pilote. Il avait 2 passes sur 3 à 30 avec le pilote, et 1 passe sur 1 à 60 sans le pilote.

Ce que j'ai fait (Mac, Chrome sans fenêtre, muet, 13 Pro émulé, serious + branché, sous le verrou) :
- **Nouveau mode `--mode toucher`** dans `outils/banc-menuchaud/menuchaud.cjs`. À chaque image d'écran, il note si l'image est rendue, plus `HC.on` et `HC.per` (qui règle la cadence du menu). Il ajoute `--q` (un paramètre de plus) et `--auto 1` (jamais choisi, comme le contrôle).
  - BASSE choisie, pilote et `?sans=pilote` : **60 i/s** au toucher (17 écarts de 16,7 ms dans les 300 ms). Donut au garage : 89 écarts à 16,7 ms.
  - AUTO + `?tel=1`, 3 passes avec le pilote et 3 sans : **60 i/s dans les 6 passes**, donut à 16,7 ms dans les 6.
- **Le banc du contrôle lui-même** (`ctl.cjs --mode chaud --rates .04`), rejoué 2 fois sur ce lot avec le pilote : 60 i/s les deux fois (15-18 écarts, p50 14,9 / 16,6 ms).
  - Sa mesure groupe les appels de rendu à moins de 6 ms : dans une passe, elle compte des « images » de 7 ms. Elle est fragile quand le Mac est chargé.

Ce que dit le code :
- Au menu, la cadence est réglée par `hcSaute` (`moteur/cadence.js`). Un toucher lance `hcGeste`, qui donne 60 i/s pendant 350 ms. Le pilote n'y touche pas : `CAD.on` est faux hors course, et `pilImg` / `pilRaf` sortent hors course.
- Au menu à chaud, l'image posée est la même avec et sans le pilote (relevé du contrôle et de ce lot) : halo 0,25, 2 étages, ombre 768, DPR 2, toile 1688×780.
- Relu aussi (2e reprise, 19/11 soir) : hors course, `cadSauteH`/`cadSaute` ne sautent jamais d'image (`CAD.on` est remis à faux hors course, `cadence.js:99`) ; sous le pilote, `mobPalTick` rend la main à `pilTick` avant `gdxLourdTick` et les paliers, mais rien de ce qu'il saute ne règle la cadence du menu ; `pilTick` au menu ne repaie que si le cran visé change. Aucun chemin du pilote n'écrit `HC`, `CAD.per`, `hors30` ni `MENU_MAX`.
- Quand le toucher n'est pas vu, les images sortent toutes les 66,7 ms (le repos), pas toutes les 33. Les 30 i/s du contrôle veulent donc dire : toucher vu, mais images longues.

**Conclusion** : aucune correction n'est faite. Je n'ai trouvé ni mécanisme ni reproduction (10 passes à 60 avec le pilote). L'explication la plus probable est un Mac chargé pendant le contrôle (charge 5 à 24 ce jour-là). Elle n'est pas prouvée.

## Preuves au banc

Mac, Chrome sans fenêtre, muet (`sfx`, `mus` et `vox` à faux), iPhone 13 Pro émulé (844×390, DPR 3, tactile), `?appareil=iPhone14,2`, AUTO, sous `verrou-banc.sh`. Les chiffres sont des compteurs et des tailles de toile, pas des temps.

Les modes neufs de `outils/banc-pilote/pilote.cjs` :
- `pvechelle` : condition libre (N2). Le cran visé est posé (`dbgPiloteSim({Kv})`) puis payé par une VRAIE pause (`__panBascule`), de 0 à 13.
- `pvserious` : serious + branché + éco, 15 % de ratés simulés pendant 45 s, puis la mort, la course suivante, puis le froid.
- `pvrouge` : ROUGE simulé en condition libre ; avec `--crit 1`, critical en course à 4 % de ratés.

`outils/banc-pilotevoiture/passe.sh` lance une passe sous le verrou, 9 min au plus.

### La table « cran K → ce qui est retiré » (`pvechelle`, relevé dans le jeu)
| K | ce qui s'ajoute (cumulé) | niveau, DPR | toile visible (en course) | loupe AVEC le lot | loupe AVANT (`?sans=pilotevoiture`) |
|---|---|---|---|---|---|
| 0 | rien (ULTIME) | N2, 1,5 | 2532×1170 | posée | posée |
| 1 | ombre en vol ½ (QL 1) | N2, 1,5 | 2532×1170 | posée | posée |
| 2 | ciel ½ | N2, 1,5 | 2532×1170 | posée | posée |
| 3 | polyphonie ½ (en course) | N2, 1,5 | 2532×1170 | posée | posée |
| 4 | halo 3 étages | N2, 1,5 | 2532×1170 | posée | posée |
| 5 | ombre 1024 | N2, 1,5 | 2532×1170 | posée | posée |
| 6 | ciel ¼, traits, vent et émission ×0,75 | N2, 1,5 | 2532×1170 | posée | posée |
| 7 | halo ½ | N2, 1,5 | 2532×1170 | posée | posée |
| 8 | ombre 512, halo 2 étages, ciel ⅛, traits ×0,5, QL 2 | N2, 1,5 | 2532×1170 | **posée** | RETIRÉE → 1266×585 |
| 9 | niveau − 1 | N1, 1,25 (scène 1055×487) | 2532×1170 | **posée** | retirée → 1055×487 |
| 10 | résolution ×0,9 | N1, 1,13 (scène 949×438) | 2532×1170 | **posée** | retirée → 949×438 |
| 11 | résolution ×0,8 | N1, 1,0 (scène 844×390) | 2532×1170 | **posée** | retirée → 844×390 |
| 12 | SURVIE : halo coupé | N1, 1,0 | 2532×1170 | **posée** | retirée |
| 13 | LA CAISSE : loupe retirée | N1, 1,0 | 844×390 | retirée | (n'existe pas : 12 au plus) |

Toiles visibles refaites pendant la descente : AVEC, **1** (au cran 13) ; AVANT, **4** (crans 8, 9, 10, 11).
Le relevé lu dans la pause arrive parfois avant le paiement (le pilote paie après 1 s de pause). La colonne « en course », lue 4 s après la reprise, montre le cran visé atteint à chaque ligne.
0 exception, 0 erreur de console, 0 panne, avec et sans.

### Serious + ratés simulés (`pvserious`, 15 %, 45 s)
| étape | AVEC le lot | AVANT (`?sans=pilotevoiture`) |
|---|---|---|
| départ (K5) | loupe, 2532×1170 | loupe, 2532×1170 |
| ratés | K6 [C] → **K8 urgence décor** → K10 urgence résolution (DPR 1,13) ; loupe posée TOUTE la course, toile 2532×1170 | K6 → K10 urgence d'un coup ; **toile 2532 → 949 EN COURSE**, plus de loupe |
| mort (K10, dette K12) | `lpOff` faux | `lpOff` vrai |
| course suivante, serious (K12) | **loupe posée**, 2532×1170 | sans loupe, 844×390 |
| course au froid | **loupe posée**, 2532×1170 | sans loupe, 844×390 |
| toiles refaites en course | **0** | 1 (l'urgence) |

À l'écran de mort, la toile visible reprend la taille de la scène dans les deux cas : la loupe ne se dessine jamais sur l'écran de mort (`loupeVeut` exige `!gameOver`). C'est d'avant ce lot. Elle revient au départ suivant (« depart » dans le relevé des toiles).

### ROUGE simulé, l'ordre des retraits (`pvrouge`, condition libre N2, 15 %, 60 s)
- **AVEC le lot** : K1 → K6, un cran [C] toutes les 3 s, puis `urgence armée (décor d'abord)`. Puis K6 → **K8** (urgence décor, posée comme au portail, toujours N2 DPR 1,5), puis 8 s de ROUGE, puis K8 → **K9** (urgence : niveau − 1, `retaille · urgence · DPR 1,25`).
  Loupe posée et toile 2532×1170 du début à la fin. Course suivante (froid) : N2 K0, loupe posée.
- **AVANT** : K1 → K6, puis l'urgence K6 → **7, N2 → N1** (la résolution d'abord), puis K8 au portail. La résolution partait avant le décor.
- 0 exception, avec et sans.

### Critical en course (`pvrouge --crit 1`, 4 % de ratés)
- Anticipation K5 → visé K10, puis urgence décor K5 → **K8**, puis urgence résolution K8 → K11 (DPR 1,00).
- Loupe posée et toile 2532×1170 toute la course : la loupe ne tombe jamais en course, même à critical.
- Course suivante revenue au froid : K12, loupe posée.
- **Course suivante encore à critical** (`pvrouge --crit 1 --s 30`, rejoué le 19/11 à 17 h 24, avec le lot) :
  - en course : `urgence armée (décor d'abord)`, K5 → **K8** (urgence décor, comme au portail), puis K8 → K11 (`retaille · urgence · DPR 1,00`) ; loupe posée, toile 2532×1170 jusqu'à la mort ;
  - à la mort : `lpOff` faux (la toile reprend 844×390 parce que la loupe ne se dessine jamais sur l'écran de mort, voir plus haut) ;
  - **course suivante toujours à critical** : K12, `lpOff` vrai, loupe retirée, toile 844×390. C'est voulu : critical est le seul cas, avec K13, où la loupe tombe (même règle que « la voiture d'abord » et que la base). Elle tombe au départ, sous voile, pas en course ;
  - **retour au froid** (capteur 0 ; l'hystérésis garde la clé critical 60 s, donc encore K12) : `lpOff` faux, la course repart **avec la loupe**, toile 2532×1170. La loupe suit l'état réel, pas la clé gardée par l'hystérésis ;
  - toiles visibles refaites : seulement aux morts et aux départs, **0 en course** ; 0 exception. Les « pannes » notées sont les relevés mémoire de fin de course et un repli de la grotte, pas des erreurs.

### Autres preuves
- La partie du contrôle rejouée (`ctl.cjs --mode chaud --rates .04`, 2 passes) : serious, K8 tenu, loupe posée en course, à la course suivante et au froid. Avant le lot, ce même banc la voyait retirée. Aucune toile refaite en course, 0 exception.
- **Borne S3 toujours verte** (`pilote.cjs --mode borne` dans les 16 conditions B×E×T, pilote contre `?sans=pilote`, puis `node outils/banc-pilote/borne-table.cjs`) : **180 cases jugées, 0 plus lourde**. Les crans de départ sont ceux d'avant (K0/K1/K5/K10 selon T ; B1E1 : K1/K2/K5/K10) : K13 ne sert jamais de départ.
- **Une partie complète** (`pilote.cjs --mode scenario --s 25`, branché + éco, l'état monte de nominal à critical, une course par état avec mort et relance ; cartes nuages, grotte, canyon…) : crans K1 → K2 → K5 → K8/K10, **0 exception**. Les « pannes » relevées sont les notes mémoire de fin de course, un repli de la grotte et un détail du canyon, pas des erreurs.
- Gardes : `garde-demarrage`, `garde-allege`, `garde-charte` OK. `assembler --depuis-morceaux` d'accord.

## Non vérifié
- Rien sur le téléphone (consigne).
- Le coût réel de la loupe gardée à serious avec des ratés, sur l'A15 : jamais mesuré. Le lot ne promet aucun gain de fluidité, il change l'ordre. Si le téléphone ratait à cause de la loupe elle-même, il lui faut maintenant K12 + 10 s de dette pour la retirer.
- L'ordre « résolution (K9-K11) avant halo coupé (K12) » est gardé tel quel. La résolution touche aussi la caisse, mais la loupe la reconstruit à la taille de l'écran. Passer le halo coupé avant la résolution changerait la borne S3 et le plafond des gels : non fait.
- Le défaut du menu (partie 2) n'est pas reproduit, et sa cause n'est pas trouvée.

## Ce qu'il faudra lire dans la boîte de vol du 13 Pro
- Journal `pilote` : `urgence armée (décor d'abord)`, puis `K…→8 … urgence décor … portail`, et seulement après `retaille · urgence`.
- `dbgPilote().loupe.on` vrai en course à serious, quel que soit K ≤ 12. Aucune ligne `K…→13` sans K12 avant.
- Si les i/s à serious sont pires qu'au build 123, comparer avec une course `?sans=pilotevoiture`.
