# Étude « simulateur » : la sélection progresse-t-elle, et à quelle vitesse ? (27-28/11/2026)

## En une minute

La question : la sélection naturelle qui tourne sur le PC de Sacha fabrique-t-elle vraiment de meilleurs pilotes, et en combien de temps ? Pour le savoir sans jouer une seule course, j'ai écrit un simulateur. Il suit les vraies règles de `ml/evolution`. Chaque pilote y a une valeur cachée, et chaque course rend cette valeur plus un hasard tiré des vraies courses du 27/11. La réponse dépend de ce qu'on ne sait pas encore : la part des mutations qui aident vraiment. Si le pilote de départ a encore de la marge (scénarios « moyen » et « optimiste »), la sélection progresse : le champion gagne en vrai environ **1 palier en 50 000 courses dans le scénario moyen, 3 dans l'optimiste**. Cela fait 5 à 7 jours à 400 courses par heure. Ensuite le progrès ralentit beaucoup : à 200 000 courses, on n'arrive qu'à 1,3 et 4,3 paliers. Si le pilote de départ est déjà presque au mieux (scénarios « pessimiste » et « étroit », ce dernier proche de ce que mesure l'étude voisine « effets »), elle stagne. Elle sacre alors parfois par chance un champion à peine moins bon que le témoin : 10 à 40 % des évolutions, pour au plus 0,1 à 0,3 palier perdu. Les réglages actuels sont déjà bons, et la vraie recommandation est d'**éviter les mauvais** : 6 graines par génération, 40 pilotes (avec 6 naissances), `seuilSacre` 3, 24 graines par génération. Le meilleur ensemble testé (rejouer seulement les jeunes et quelques anciens, plus de gènes mutés, une validation possible toutes les 2 générations) faisait gagner 0,1 à 0,6 point de note sur les mondes qui ont servi à le choisir ; rejoué par la relecture sur des mondes neufs, il ne gagne plus que 0 à 0,4 point, et rien de sûr hors du scénario optimiste. Ce que je ne sais pas : la vraie loi des mutations. Les premières 30 à 50 générations du Ryzen la diront, avec le coffre.

## Ce qui est mesuré, ce qui est supposé

| | d'où ça vient |
|---|---|
| bruit d'une course : résidus du modèle pilote + graine (σ 3,19 sur 527 courses ; 2,92 sur la génération 0 seule), effet des graines (ET vraie 1,82), loi du palier entier (de 1 à 20) | **mesuré** : copie figée des vraies courses (`donnees/`, lue le **27/11/2026 à 23:16:50**, 567 lignes dans `courses-2026-48.jsonl`) ; `analyser-reel.js` |
| bruit de E : 0,307 par partie, se_E 0,104 sur 12 courses, 8,8 parties de plus de 60 s sur 12 courses, part des courses de plus de 60 s selon le palier | **mesuré**, `analyser-reel.js` avec le vrai `note.noter` |
| temps réel d'une course selon le palier (7 s au palier 1, 66 s au palier 7, 279 s au palier 20) | **mesuré** (`ms` des lignes, 4 courses à la fois sur le Xeon) |
| part des graines où un mutant refait la course du témoin au bit près (10 %) | **mesuré** (même `empreinte`) |
| dispersion vraie des 19 mutants de la génération 0 : environ 0,6 palier (variance observée 1,05 moins bruit 0,71) ; E : indiscernable du bruit (sous ~0,09) | **mesuré, très incertain** (19 mutants) ; l'étude voisine `effets/` trouve 0,32 [0 ; 1,07] |
| **la loi des effets des mutations** (part sans effet, nuisible, létale, utile ; ce qui reste à gagner) | **supposé** : 4 scénarios, tous réglés pour rendre la dispersion mesurée de la génération 0 |
| les règles de la sélection | **recopiées** de `evoluer.js`, `note.js`, `graines.js`, et **prouvées** sur les vraies données (ci-dessous) |

## La méthode

### Le simulateur (`simuler.js`)

- **Le monde** : 64 gènes continus x dans [0, 1]. Ce sont les 64 réels du génome v:1 de l'évolution du 27/11 ; les 22 drapeaux ne sont pas simulés. Le témoin est en x0. Chaque gène porte trois choses :
  - q, la part des graines où il change la trajectoire : 0 pour 30 % des gènes (le gène est muet : course identique au parent), 1 pour 10 %, uniforme sinon. Un gène de carte n'agit que sur sa carte.
  - un effet sur le palier sur ces graines, `w·((x0 − xo)² − (x − xo)²)`, où xo est un optimum caché. Un gène peut être sans effet (w = 0), normal, ou « fragile » (xo = x0 et w grand : tout pas fait perdre ; c'est la mutation létale).
  - un effet sur E de même forme.
- **Palier vrai** = 6,5 + Σ q·effet. **E vrai** = 0,905 − Σ q·effetE.
- **Une course** : le niveau sur la graine (6,5 + les effets qui y agissent + b_graine), plus un **résidu réel re-tiré** par hachage de (comportement, graine). Le résidu est mis à l'échelle du niveau, comme le dit la mesure : σ 2,92 à 6,5 de moyenne et 3,30 à 7,6. Le résultat est arrondi à un entier ≥ 1. Deux pilotes au même comportement sur une graine font **la même course**, comme dans le jeu (`9627905cd5bb` a rejoué son parent sur 11 graines sur 11).
- **E** : la moyenne des parties de plus de 60 s, avec un bruit de 0,307 par partie. Sous 5 parties, E = 4, comme `note.js`.
- **Les règles, à l'identique** :
  - 20 vivants, 6 naissances (1 immigré : le champion muté, 8 gènes à σ 0,30 ; puis le tournoi de 3 parmi ceux qui ont n ≥ 24 ; croisement si u < 0,3 ; sinon mutation à 1 + Poisson(2) gènes, σ 0,15) ;
  - les graines par le vrai `graines.grainesEntrainement` (réserve de 1 081 graines, puis réemploi hors des 5 derniers lots ; une course déjà jouée sort du cache et ne coûte rien) ;
  - tous les vivants × toutes les graines ;
  - la note cumulée sur toute l'époque (modèle pilote + graine, 10 passes, ā des vivants, rétrécissement n/(n+12), F = â − 4·E) ;
  - le renvoi des F les plus bas, sauf le témoin, le champion et ceux sous 24 courses ;
  - la règle 6 (meneur à n ≥ 48, toutes les 5 générations au plus, F_m − F_c > 2·√(se²+se²)) ;
  - la validation sur 24 graines neuves (`grainesValidation`), comparée comme `note.comparer` (bootstrap apparié de 400 tirages, le même générateur `rngDe('comparer|24')`, critères a/b/c, `seuilSacre` 2) ;
  - la malédiction du gagnant (règle 6 → 3), les phases, l'économie de graines (12 → 8 quand une génération pleine dépasse 5 400 s au débit choisi) ;
  - le coffre, compté comme coût : 40 courses par nouveau champion.
- **Ce qui est simplifié** : E est une moyenne de valeurs par partie (le vrai E est une fonction non linéaire des moyennes de 15 mesures) ; les têtes (phases B et C) ne sont pas simulées ; aucune course n'échoue. Le palier vrai rapporté est la valeur cachée (Σ q·effet), pas une moyenne de courses.

### La preuve de fidélité (`verifier.js`, résultats dans `sorties-verifier.txt` : TOUT PASSE)

1. Le modèle pilote + graine du simulateur contre le **vrai** `note.ajuster`. Sur les 527 vraies courses, et sur 2 632 courses simulées où les graines reviennent, l'écart vaut 0 (a, â, se_a, σ, ā).
2. La génération 0 réelle : le F recalculé (palier du simulateur + E réel) redonne le F du journal à 5·10⁻⁵ près (le journal arrondit), et **le même classement**.
3. Les naissances, rejouées avec le **vrai** `genome.muter` / `croiser` du commit e2ea8d2c9 (extrait par `git show` dans un dossier temporaire) et la règle de naissance du simulateur :
   - les 20 identifiants de la génération 0 sont identiques, ainsi que ses 12 graines ;
   - les **6 naissances de la génération 1 sont identiques** (identifiant, parents, origine : immigré, 3 mutations, 2 croisements) ;
   - ses 12 graines sont identiques, ainsi que l'état du générateur (3114583574, celui de `population.json`).
4. Le simulateur rend la génération 0 réelle (40 mondes, scénario moyen) :
   - σ des résidus : 2,85 simulé, 2,92 réel ;
   - ET des a des mutants : 0,92 simulé, 1,03 réel ;
   - ET de E : 0,114 simulé, 0,101 réel ;
   - se_E : 0,101 simulé, 0,104 réel ;
   - parties : 8,5 simulé, 8,8 réel ;
   - graines identiques au témoin : 11 % simulé, 10 % réel.
5. Deux cas dont on connaît la réponse :
   - un monde **sans aucun effet** : gain vrai exactement 0 ;
   - un monde **sans bruit** : le champion ne recule jamais, et il monte vers le plafond (+2,1 à +4,2 pour des plafonds de 4,4 à 5,1).

### Les scénarios (`node simuler.js --calibrer`)

Les quatre scénarios sont réglés pour que 19 mutants de génération 0 aient la dispersion vraie mesurée. Ils diffèrent par ce que le témoin a encore à gagner (le « plafond » : tous les gènes à leur optimum, inaccessible en pratique) :

| scénario | g0 : moyenne / dispersion vraie | une naissance : sans effet / nuisible / létale (≤ −1,5) / utile (≥ +0,05) | taille moyenne d'un effet utile | plafond médian |
|---|---|---|---|---|
| étroit (proche du « central » de `effets/`) | −0,20 / 0,34 | 55 % / 44 % / 0,8 % / 0,2 % | 0,08 | 0,16 palier |
| pessimiste | −0,23 / 0,67 | 65 % / 30 % / 2,3 % / 2,9 % | 0,13 | 0,45 |
| moyen | −0,19 / 0,60 | 60 % / 28 % / 1,9 % / 10 % | 0,24 | 2,4 |
| optimiste | −0,11 / 0,57 | 56 % / 26 % / 1,6 % / 15,5 % | 0,30 | 5,3 |

(`sorties-calibrer.txt`, 200 mondes par scénario ; « sans effet » est un effet de moins de 0,05 palier. La copie de `sortie.log` n'est pas gardée dans `donnees/` : elle contenait un chemin local, et rien ne la lit.)

## Les résultats

Toutes les valeurs sont **vraies** (cachées à la sélection) et données en écart au témoin. dP est le palier gagné. dE est l'écart aux joueurs gagné (négatif = plus ressemblant). F4 = dP − 4·dE. On donne la médiane [10 % ; 90 %] sur 10 mondes. Les tableaux complets sont dans `resultats/*.txt`.

### 1. La vraie configuration : progrès et durée (`resultats/principal.txt`, `resultats/etroit.txt`)

| scénario | courses | générations | champion dP | meilleur vivant dP | champion F4 | champion < témoin |
|---|---|---|---|---|---|---|
| étroit | 10 000 / 50 000 / 200 000 | 31 / 164 / 707 | 0,00 / 0,00 / 0,00 [−0,10 ; 0,14] | 0,00 / 0,00 / 0,00 | 0,00 / 0,00 / 0,00 | 10 / 30 / 40 % |
| pessimiste | idem | 31 / 164 / 702 | 0,00 / 0,01 / 0,00 [−0,11 ; 0,61] | 0,04 / 0,13 / 0,17 | 0,00 / 0,01 / 0,36 | 10 / 30 / 20 % |
| moyen | idem | 31 / 162 / 696 | 0,30 / **0,99** [0,51 ; 2,09] / **1,28** [0,61 ; 2,41] | 0,76 / 1,31 / 1,74 | 0,41 / 1,22 / 1,86 | 0 % |
| optimiste | idem | 31 / 163 / 708 | 0,85 / **2,86** [0,67 ; 6,25] / **4,25** [1,71 ; 7,69] | 1,93 / 3,10 / 4,41 | 1,16 / 3,17 / 4,30 | 0 % |

**Le nombre de jours** (temps réel, les courses s'allongent quand le palier monte) :

| scénario | 10 000 courses | 50 000 | 200 000 |
|---|---|---|---|
| moyen, 200 / 400 / 800 courses à l'heure | 1,9 / 1,0 / 0,5 j | 10,8 / 5,3 / 2,6 j | 47 / 23 / 11 j |
| optimiste | 2,0 / 1,1 / 0,5 j | 13,0 / 6,7 / 3,3 j | 65 / 33 / 16 j |
| pessimiste | 1,8 / 0,9 / 0,5 j | 9,1 / 4,6 / 2,3 j | 37 / 18 / 9 j |

Ce qu'on en tire :
- **La sélection progresse quand il y a de quoi** (moyen, optimiste). Elle ne recule jamais sous le témoin dans ces scénarios : 0 % de champions pires que le témoin, et 0 faux sacre sur 27 à 45 à 400/h.
- **La moitié du chemin est faite vers 50 000 courses.** Après, chaque course rapporte 5 à 10 fois moins. Dans le moyen, le champion arrive à la moitié du plafond (1,3 sur 2,5, le plafond médian de ces 10 mondes) et la population entière suit (+1,3).
- **Elle stagne quand il n'y a rien** (pessimiste, étroit). Elle **dérive** un peu : elle sacre par chance un champion à peine moins bon que le témoin, dans 10 à 40 % des évolutions, avec une perte d'au plus 0,1 à 0,3 palier (le 10 % bas). Le coffre (champion contre témoin sur 40 graines fixes) ne verrait pas une perte aussi petite.
- **À 200 courses à l'heure (le Xeon), l'économie de graines passe à 8 graines dès que les pilotes s'allongent** : moyen et optimiste, colonne « graines/gen » de `principal.txt`. L'étude « effets » l'a vu pour de vrai à la génération 1. Dans le simulateur, 8 graines ne nuisent pas : l'écart apparié 200/h − 400/h (mêmes mondes) du F4 du champion vaut +0,06 ± 0,15 (moyen, 50 000) et −0,04 ± 0,07 (moyen, 200 000), sans aucun écart au-delà de 2 erreurs-types (`relecture/economie-apparie.txt`). Les médianes 1,54 contre 1,22 citées ici avant la relecture faisaient croire à un gain qui n'existe pas. Ce n'est pas un test de 8 contre 12 graines seules : 200/h change aussi la durée.
- 400 et 800/h donnent la même évolution (aucune économie) ; seul le temps est divisé par deux.

### 2. Les réglages, un à la fois (`resultats/sensibilite.txt` ; 14 mondes, 50 000 courses, 400/h, économie coupée)

Les chiffres sont les écarts **appariés** au défaut (mêmes mondes, mêmes hasards), en F4 vrai du champion ± erreur-type, puis du meilleur vivant.

| réglage | pessimiste | moyen | optimiste | verdict |
|---|---|---|---|---|
| graines 6 | −0,07 / −0,27 | **−1,16 / −1,25** | **−2,46 / −2,84** | très mauvais : on renvoie au hasard |
| graines 24 | +0,02 / 0,00 | −0,36 / −0,04 | −0,17 / −0,09 | moins bon : deux fois moins de générations |
| naissances 3 | +0,08 / −0,03 | −0,12 / −0,08 | +0,01 / −0,21 | neutre à moins bon |
| naissances 12 | +0,01 / −0,08 | +0,05 / −0,05 | +0,15 / +0,18 | neutre |
| population 10 | −0,01 / −0,15 | −0,27 / −0,34 | +0,29 / −0,02 | moins bon |
| population 40 | −0,09 / −0,04 | **−0,57 / −0,21** | −0,43 / −0,37 | mauvais |
| **rejouer jeunes + 4** (proposition) | +0,05 / −0,01 | **+0,31 ± 0,09 / +0,23 ± 0,05** | **+0,50 ± 0,18 / +0,30 ± 0,10** | le meilleur seul |
| seuilSacre 1 | +0,08 / −0,02 | +0,08 / +0,08 | +0,56 / +0,20 | plus de sacres, 21 % de champions < témoin (pessimiste) |
| seuilSacre 3 | −0,04 / −0,01 | −0,45 / −0,07 | −0,41 / +0,08 | moins bon |
| validation 12 graines | +0,03 / 0,00 | −0,05 / −0,01 | +0,16 / +0,24 | neutre |
| validation 48 graines | +0,11 / +0,01 | +0,09 / +0,08 | +0,30 / +0,26 | un peu mieux |
| intervalle 2 (validation possible toutes les 2 générations) | +0,07 / −0,03 | −0,10 / +0,01 | +0,58 / +0,22 | mieux en optimiste |
| sigmaMutation 0,30 | +0,11 / +0,01 | −0,03 / +0,10 | +0,44 / +0,38 | un peu mieux |
| poissonMutations 4 | −0,01 / 0,00 | +0,10 / **+0,23** | **+0,61 / +0,49** | mieux |

Les erreurs-types vont de 0,03 à 0,38 (dans le fichier). Tout écart sous ~2 erreurs-types est du bruit.

« rejouer jeunes + 4 » : seuls rejouent la génération les pilotes de moins de 48 courses, le témoin, le champion et les 4 meilleurs F. Avec le même nombre de courses, on fait 40 % de générations en plus (230 contre 162).

### 2 bis. Les meilleurs ensemble, avec l'économie de graines (`resultats/ensemble.txt` ; 8 mondes, 400/h)

Écart apparié au défaut, F4 vrai du champion :

| ensemble | pessimiste 50k / 200k | moyen 50k / 200k | optimiste 50k / 200k |
|---|---|---|---|
| B rejouer jeunes + 4 | +0,13 / +0,03 | +0,25 ± 0,14 / **+0,15 ± 0,05** | +0,01 / −0,17 ± 0,12 |
| C B + poissonMutations 4 | +0,13 / −0,07 | +0,21 / +0,15 | +0,41 ± 0,23 / +0,08 |
| **D C + intervalle 2** | +0,13 ± 0,05 / +0,03 | −0,04 / **+0,21 ± 0,09** | **+0,60 ± 0,15** / +0,11 ± 0,14 |
| E D + seuilSacre 1 | +0,19 / 0,00 (38 % de champions < témoin à 50k) | +0,24 / +0,15 (9 faux sacres sur 53) | +0,50 / +0,26 ± 0,10 |

**Ce qui donne le plus de progrès vrai par course** : D (rejouer seulement les jeunes et 4 anciens, 1 + Poisson(4) gènes, `intervalle` 2). C'est l'ensemble le plus régulier : il ne fait jamais nettement moins bien. Il gagne +0,1 à +0,6 de F4, soit 10 à 15 % de plus que le défaut, et surtout plus tôt. C'est **petit** devant l'incertitude du scénario : de 0 à 4 paliers. Le défaut est déjà bien réglé.

**Relecture : ces gains ne se retrouvent pas sur des mondes neufs.** Les mondes de ce tableau (graines 1000 à 1007) sont les mêmes que ceux du plan « sensibilité », qui a servi à choisir B, C et D. On a donc choisi puis jugé sur les mêmes données. Rejoués sur des mondes que personne n'avait vus (graines 7000+k, `relecture/hors-echantillon.js`), les écarts au défaut deviennent :

| | pessimiste 50k | moyen 50k | moyen 200k | optimiste 50k |
|---|---|---|---|---|
| R3 seul (rejouer jeunes + 4, économie coupée, 40 mondes) | 0,00 ± 0,03 | +0,05 ± 0,06 | — | +0,20 ± 0,10 |
| D (30 mondes à 50k, 10 à 200k) | 0,00 ± 0,03 | +0,08 ± 0,08 | +0,04 ± 0,07 | +0,37 ± 0,12 |
| poissonMutations 4 seul (30 mondes) | +0,01 ± 0,05 | 0,00 ± 0,07 | — | +0,20 ± 0,11 |

Seul l'optimiste garde un gain net, plus petit : +0,37 contre +0,60. Ailleurs, rien ne se distingue de zéro, et rien ne nuit non plus.

### 3. Ce que fait la note F = palier − 4·E (`resultats/note.txt` ; 10 mondes, 50 000 courses)

Pour le champion : dP palier vrai, dE écart vrai, puis F4.

| scénario | loi de E | poids 0 (le palier seul) | poids 4 (la vraie note) | poids 16 |
|---|---|---|---|---|
| moyen | indépendante | dP 1,07, dE +0,021, F4 1,22 | dP 0,99, dE −0,055, F4 1,22 | dP 0,39, dE −0,127, F4 1,06 |
| moyen | en conflit avec le palier | dP 1,27, dE +0,093, F4 0,56 | dP 0,75, dE +0,005, F4 0,65 | dP −0,14, dE −0,078, F4 0,08 |
| moyen | inerte | dP 1,06 | dP 1,08 | dP 0,00 |
| optimiste | indépendante | dP 3,41, dE +0,114, F4 2,68 | dP 2,86, dE −0,029, F4 3,17 | dP 1,05, dE −0,192, F4 2,04 |
| optimiste | en conflit | dP 0,90, dE +0,066, F4 0,50 | dP 2,33, dE +0,058, F4 2,03 | dP 0,20, dE −0,097, F4 0,46 |
| pessimiste | toutes | dP 0,00 à 0,01, dE 0,00 | idem | dP −0,02 à −0,06 |

- **La note pousse surtout vers le palier.** Avec le poids 4, presque tout le gain de F vient du palier (dP ≈ 1 et 2,9 contre dE ≈ −0,03 à −0,06, soit 0,1 à 0,2 de F). Les vraies différences de E entre mutants sont petites devant leur bruit : se_E 0,10 sur 12 courses, ×4 = 0,4 de F, contre une dispersion vraie de E sous 0,09.
- **Le poids 4 sert de garde-fou.** Sans lui (poids 0), E dérive dans le mauvais sens : +0,02 à +0,11 en médiane (en écart apparié au poids 4 : +0,08 ± 0,02 à +0,18 ± 0,04 dans le moyen et l'optimiste, `relecture/note-apparie.txt`), et +0,12 à +0,53 chez le meilleur vivant en cas de conflit. Avec lui, E reste plat ou baisse un peu. Attention : « poids 0 » n'est pas « le palier seul » pour le sacre, car le critère (c) de `note.comparer` (dE < se_dE) s'applique quel que soit le poids. Dans l'optimiste en conflit, il bloque les sacres : le champion y perd 1,13 ± 0,46 palier contre le poids 4, alors que le meilleur vivant monte à +3,5.
- **Un poids plus fort (16) ne rend pas plus ressemblant de façon utile.** Il gagne 0,1 à 0,2 de E, mais perd beaucoup de palier, parce que la sélection trie alors surtout le bruit de E. Dans un monde où E ne bouge pas (« inerte »), le poids 16 coûte, en écart apparié, 0,49 ± 0,20 palier (moyen) à 1,11 ± 0,24 (optimiste) pour rien.
- **Pessimiste** : rien ne bouge, quel que soit le poids. La note ne pousse « vers rien ».
- Ces conclusions dépendent de la taille **supposée** des effets sur E (plafond médian de E : 0,12 à 0,36). Si E pouvait baisser de 0,5 ou plus, il faudrait refaire ce plan.

### 4. Les faux sacres quand personne ne vaut mieux (`resultats/monde-nul.txt` ; 8 mondes sans effet, 50 000 courses)

| seuilSacre | 12 graines de validation | 24 | 48 |
|---|---|---|---|
| 1 | 12,8 % ± 3,2 | 17,3 % ± 3,7 | 15,5 % ± 3,7 |
| **2 (aujourd'hui)** | 3,0 % ± 1,5 | **5,9 % ± 2,2** | 0,8 % ± 0,8 |
| 3 | 0,0 % | 1,4 % ± 1,0 | 0,0 % |

Ce sont des faux sacres par validation. À seuilSacre 2 et 24 graines, on trouve 6 % ± 2. La relecture statistique mesurait 3,7 % hors sélection. Sur les vraies courses du 27/11, avec le vrai `note.comparer`, la relecture trouve **3,2 % ± 0,6** (`relecture/faux-sacres-reel.txt`). Le bootstrap n'y sous-estime pas l'erreur-type : le rapport entre l'écart-type réel de dF et le se_dF moyen vaut 1,02. L'explication donnée ici avant la relecture (« le bootstrap à 24 graines sous-estime l'erreur-type ») est donc fausse. L'écart 5,9 contre 3,2 tient au hasard : 7 sacres sur 118 validations, à 1,2 erreur-type. Le reste du tableau se retrouve aussi : seuil 1 donne 9 / 18 / 17 % pour 12 / 24 / 48 graines, seuil 3 moins de 1 %.

## Recommandations

Toutes sont des **propositions**. Aucun fichier de `ml/evolution` n'a été modifié.

| # | changement | gain attendu | coût | confiance | comment on saura |
|---|---|---|---|---|---|
| R1 | **Ne rien dégrader** : garder 12 graines, 20 vivants, `seuilSacre` 2 et 24 graines de validation. Ne pas passer à 6 graines ni à 40 pilotes. | Évite −0,6 à −2,5 de F4 à 50 000 courses (moyen, optimiste). | Rien. | haute (écart apparié > 4 erreurs-types) | — |
| R2 | **Mesurer le débit du Ryzen avant tout**, puis laisser l'économie de graines telle quelle. À 200/h, elle passe à 8 graines sans dommage visible dans le simulateur. | Sait si 50 000 courses font 2,6 ou 5 jours. | Une nuit. | haute | `generations.jsonl` du Ryzen : `debit_h`, `nGraines`. |
| R3 | Proposition : `ml/evolution/evoluer.js`, fonction `generation`, étape 3 (« LES COURSES »). Ne mettre dans `taches` que les vivants de moins de 48 courses, le témoin, le champion et les 4 meilleurs F de la note d'avant les naissances (option de config `rejouer`, « tous » par défaut). | +0,15 ± 0,05 (moyen, 200 000) à +0,31 ± 0,09 (moyen, 50 000) de F4. 40 % de générations en plus pour le même nombre de courses. | Une vingtaine de lignes. La note d'un ancien ne s'affine plus (elle est déjà sur 48 courses ou plus). Rien n'est supprimé. | **basse après relecture** : sur 40 mondes neufs, +0,05 ± 0,06 (moyen) et +0,20 ± 0,10 (optimiste) ; le +0,31 venait des mondes qui ont servi à choisir | Lancer les deux réglages côte à côte au simulateur sur le paysage mesuré au Ryzen (R6). |
| R4 | Proposition : `config.json`, `poissonMutations` 2 → 4, et `validation.intervalle` 5 → 2 (avec R3 : l'ensemble D). | D contre le défaut : +0,6 ± 0,15 (optimiste, 50 000), +0,21 ± 0,09 (moyen, 200 000), +0,13 ± 0,05 (pessimiste, 50 000). | Plus de validations (48 courses chacune) ; aucune époque ne change (ces clés n'entrent pas dans l'époque, INTERFACES § 3.10, à revérifier). | basse : sur 30 mondes neufs, D ne gagne que dans l'optimiste (+0,37 ± 0,12) ; 0,00 (pessimiste), +0,08 ± 0,08 (moyen, 50 000), +0,04 ± 0,07 (moyen, 200 000). L'époque ne change pas : elle ne lit que `cfg.note` (vérifié, `courses.js` `epoque`). | Comparer `nSacres` et le coffre après 100 générations à ceux du simulateur. |
| R5 | **Ne pas** baisser `seuilSacre` à 1 ni monter le poids de E au-dessus de 4. | `seuilSacre` 1 : 13 à 17 % de faux sacres par validation, 38 % de champions < témoin dans le pessimiste. Poids 16 : −1 à −2 paliers. | — | moyenne | — |
| R6 | **Recaler le simulateur sur la vraie évolution après 30 à 50 générations** : remplacer les scénarios par la loi mesurée. On regarde le coffre champion − témoin, les a des enfants contre ceux de leurs parents, la part de naissances qui battent leur parent. Puis refaire les plans 1 et 2. | Saura lequel des 4 scénarios est le vrai ; tout le reste en dépend : de 0 à 4 paliers. | ~10 000 courses déjà jouées par l'évolution, plus 5 minutes de calcul. | haute pour le recalage ; **le test du coffre est trop faible** | Avant la relecture : « si le coffre ne montre rien à 50 000 courses, on est dans le pessimiste ou l'étroit ». C'est faux. Dans le scénario moyen, le coffre (40 graines) ne voit un gain à plus de 2 erreurs-types que dans 8 mondes sur 23 (`relecture/coffre-puissance.txt`), et dans 15 sur 24 dans l'optimiste. Un coffre muet ne départage donc pas les scénarios. Il faut juger sur les enfants contre leurs parents (des centaines de naissances), ou agrandir le coffre. |

## Les limites

- **La loi des mutations est supposée.** C'est le facteur qui décide de tout : entre l'étroit et l'optimiste, le gain à 200 000 courses va de 0 à 4,3 paliers. Les réglages ne déplacent le résultat que de 0,1 à 0,6.
- **Le paysage est additif** (chaque gène a son optimum, sans interaction), avec 64 gènes. Les drapeaux, les têtes (phases B, C) et les gestes du génome v:2 (107 gènes, dont 21 réels muets au témoin d'après `effets/muets.txt`) ne sont pas simulés.
- **E est simplifié** : c'est une moyenne de valeurs par partie, alors que le vrai E est non linéaire. Son bruit par partie est calé sur le réel.
- **Le résidu croît avec le niveau** (proportionnel). Ce n'est mesuré qu'entre 6,5 et 7,6 de palier moyen.
- Le coût en temps prend le temps réel par palier du Xeon et le multiplie par le rapport des débits. Le Ryzen peut avoir une autre forme (les courses longues pourraient mieux se paralléliser).
- **Aucune course ne rate** dans le simulateur : pas de graine retirée, pas de panne, pas de chien de garde.
- 8 à 14 mondes par réglage : les écarts appariés de moins de 2 erreurs-types ne veulent rien dire.

## Comment refaire

Un seul processus à la fois ; chaque commande dure moins de 5 minutes. Aucune course du jeu n'est lancée.

```
cd ml/ecurie/etude/reglage-de-la-selection/simulateur
node analyser-reel.js                    # donnees/ -> donnees/calibrage.json (+ sorties-analyser-reel.txt)
node verifier.js                         # les preuves de fidelite et les cas connus (sorties-verifier.txt)
node simuler.js --calibrer               # la loi des effets de chaque scenario
node simuler.js --scenario moyen --repetitions 4 --budget 50000 --debit 400 [--cfg '{"poissonMutations":4}']
node etudes.js principal --partie 1/5    # ... jusqu'a 5/5 (~4 min chacune) ; puis : node resumer.js principal
node etudes.js etroit --partie 1/1       ; node resumer.js etroit
node etudes.js sensibilite --partie 1/4  # ... 4/4 (~2 min chacune) ; node resumer.js sensibilite
node etudes.js ensemble --partie 1/10    # ... 10/10 (~2,5 min) ; lit resultats/ensemble-reglages.json ; node resumer.js ensemble
node etudes.js note --partie 1/2         # et 2/2 ; node resumer.js note
node etudes.js nul --partie 1/1          ; node resumer.js nul
```

Les fichiers :
- `simuler.js` : le simulateur, avec son usage en tête.
- `verifier.js` : les preuves.
- `analyser-reel.js` : le calage sur les vraies courses.
- `etudes.js` : les plans.
- `resumer.js` : les tableaux.
- `donnees/` : la copie figée de l'évolution réelle (lue le 27/11 à 23:16:50) et `calibrage.json`.
- `resultats/` : les sorties brutes (`.json`) et les tableaux (`.txt`).
- `relecture/` : les scripts et les sorties de la relecture (ci-dessous).

## Relecture (28/11/2026, un second agent, chargé de réfuter)

**Ce qui a été refait.** `node verifier.js` redonne `sorties-verifier.txt` à l'identique (TOUT PASSE). Les médianes du scénario moyen à 400/h sont retrouvées exactement sur les mêmes mondes : champion dP 0,30 / 0,99 et F4 0,41 / 1,22 à 10 000 / 50 000 courses (`relecture/hors-echantillon.js reproduire`). Les règles recopiées ont été relues contre `evoluer.js` (tournoi, naissances, renvoi, règle 6, validation, malédiction, économie) et `note.comparer` : pas d'écart qui change les résultats. L'époque ne lit que `cfg.note` et les fichiers du bot, donc R4 ne la change pas.

**Ce qui était faux, et qui est corrigé plus haut :**
1. « En une minute » mettait « 12 graines de validation » parmi les mauvais réglages. Le tableau de sensibilité le donne neutre (−0,05 à +0,16) ; le mauvais réglage est 24 graines **par génération**. Corrigé.
2. « Le champion arrive aux deux tiers du plafond (1,3 sur 2,4) » : 1,28 sur un plafond médian de 2,53, c'est la moitié. Corrigé.
3. « 8 graines ne nuisent pas (F4 1,54 contre 1,22) » : ces médianes suggéraient un gain. L'écart apparié vaut +0,06 ± 0,15 (`relecture/economie-apparie.txt`). La conclusion « pas de dommage visible » tient ; le gain, non. Corrigé.
4. **La fuite du plan « ensemble ».** Les mondes 1000 à 1007 ont servi à choisir les réglages (plan « sensibilité ») puis à juger leur combinaison. Sur des mondes neufs, R3 passe de +0,31 ± 0,09 à +0,05 ± 0,06 (moyen) et de +0,50 ± 0,18 à +0,20 ± 0,10 (optimiste). D passe de +0,60 à +0,37 ± 0,12 (optimiste, 50 000), de +0,21 à +0,04 ± 0,07 (moyen, 200 000) et de +0,13 à 0,00 (pessimiste). Tableau ajouté en § 2 bis, confiances de R3 et R4 abaissées.
5. Le taux de faux sacres (§ 4) : l'explication par un bootstrap qui sous-estimerait l'erreur-type est réfutée. Sur les vraies courses, avec le vrai `note.comparer`, le bootstrap est juste (rapport 1,02) et le taux vaut 3,2 % ± 0,6. Le 5,9 % ± 2,2 du simulateur lui est compatible. Corrigé.
6. Q3 : « le poids 16 coûte 1 à 1,6 palier » en monde inerte, c'est 0,49 ± 0,20 à 1,11 ± 0,24 en écart apparié. « +0,09 à +0,5 chez le meilleur vivant » se lit +0,12 à +0,53 dans `note.txt`. Et « poids 0 » n'est pas « le palier seul » pour le sacre, car le critère (c) bloque les sacres qui dégradent E. Corrigé dans le texte.
7. R6 : « si le coffre ne montre rien à 50 000 courses, on est dans le pessimiste ou l'étroit » est faux. Le coffre de 40 graines ne voit le gain du scénario moyen que dans 8 mondes sur 23 (`relecture/coffre-puissance.txt`). Corrigé dans le tableau des recommandations.
8. `resultats/monde-nul.txt` manquait (seul `nul-1.json` existait). Il est refait par `node resumer.js nul` (renommé `monde-nul.txt` le 28/11 : « nul.txt » est un nom réservé de Windows), avec les mêmes chiffres que ce LISEZ-MOI.

**Ce qui tient, mais avec réserve (non corrigé, à garder en tête) :**
- Le cas connu « un monde sans effet donne un gain de 0 exactement » ne prouve rien sur la sélection : avec w = 0, tous les pilotes valent 6,5 par construction. Seul le compte des faux sacres y est informatif.
- La preuve 4 (« le simulateur rend la génération 0 réelle ») est en partie circulaire : les résidus, se_E et la dispersion des mutants sont calés sur ces mêmes courses. C'est un contrôle de cohérence, pas une validation.
- « 40 pilotes est mauvais » ne vaut qu'à 6 naissances : la pression de sélection tombe de 6/26 à 6/46. Ce n'est pas un verdict sur une grande population en général.
- Les phases B et C (les têtes) ne sont pas simulées. À 200 000 courses (~700 générations), la vraie évolution sera en phase C au plus tard à la génération 120 (`phases.passage` : 60 générations par phase au plus). Les chiffres à 200 000 courses en dépendent.

**Les fichiers de la relecture** (un processus à la fois, chacun < 5 min) :
```
node relecture/faux-sacres-reel.js 900           # faux sacres, vrai note.comparer sur les vraies courses -> relecture/faux-sacres-reel.txt
node relecture/hors-echantillon.js reproduire     # retrouve les medianes du moyen 400/h
node relecture/hors-echantillon.js r3 moyen 0 40  # (idem optimiste, pessimiste) puis : node relecture/hors-echantillon.js bilan
node relecture/hors-echantillon.js d moyen 0 30   # (idem optimiste, pessimiste ; « d moyen 0 4 200000 » et « d moyen 4 6 200000 ») puis : bilan-d
node relecture/note-apparie.js                    # Q3 en ecarts apparies -> relecture/note-apparie.txt
node relecture/coffre-puissance.js 24             # ce que verrait le coffre a 50 000 courses -> relecture/coffre-puissance.txt
```
`relecture/economie-apparie.txt` et `relecture/d-moyen-200000-bilan.txt` viennent de deux lignes `node -e`, qui relisent `resultats/principal-*.json` et `relecture/d-moyen-200000-*.json`.
