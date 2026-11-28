# Le réglage de la sélection naturelle : la synthèse des cinq études (28/11/2026)

Pour la session principale (Fable), qui décide, puis pour Sacha. Elle rassemble cinq études faites et relues le 27-28/11 : `effets/`, `simulateur/`, `vitesse/`, `tri-precoce/`, `sacre/`. Chacune a son LISEZ-MOI et sa section « Relecture ». Aucun chiffre refuté par un relecteur n'est repris ici. Les deux seuls calculs neufs sont dans `synthese/`.

## En une minute

La question : la sélection naturelle, telle qu'elle est réglée aujourd'hui, va-t-elle fabriquer de meilleurs pilotes, à quelle vitesse, et qu'est-ce qui la freine le plus ?
La réponse honnête : peut-être, lentement, et seules les vraies générations le diront.
Le frein principal n'est pas un réglage. Le hasard d'une seule course (3,3 paliers) est environ dix fois plus grand que l'écart vrai entre deux enfants (le plus probable est 0,3 palier, au plus 1,1). Dans le cas le plus probable, le classement que fait la sélection est donc fait à 80 ou 90 % de hasard.
Si les mutations comptent un peu (le scénario « moyen » du simulateur), le champion gagne environ 1 palier en 50 000 courses, soit 2,6 à 5,3 jours à 400 à 800 courses par heure (le Ryzen, s'il fait 2 à 4 fois le Xeon). Si elles comptent aussi peu que ce que montrent les courses du 27/11, la sélection stagne.
Les réglages actuels sont déjà bons : sur des mondes simulés neufs, aucun changement étudié ne rapporte plus de 0 à 0,4 palier, alors que le scénario fait varier le résultat de 0 à 4 paliers.
Je recommande quatre changements sûrs qui ne touchent ni au pilote ni aux yeux (couper l'alarme « malédiction », protéger les enfants par leur âge, une validation séquentielle plus puissante, lancer les courses longues d'abord), et deux autres à grouper avec la prochaine époque. Surtout, il faut mesurer le débit du Ryzen et lire, sans jouer une course de plus, si les enfants se classent pareil d'une génération à l'autre.
Ce qu'on ne sait pas : si les mutations comptent. Les vraies générations le diront gratuitement : il faut environ 160 enfants, soit 27 générations à 12 graines, pour distinguer un écart vrai de 0,5 palier de zéro.

## La méthode

- Les cinq LISEZ-MOI ont été lus en entier, relectures comprises, ainsi que `ml/evolution/config.json`, `INTERFACES.md` § 3.10, § 9.3 et § 9.5, et `commun.js` (`FICHIERS_EPOQUE`).
- Je n'ai lu aucune donnée de l'évolution qui tourne : les chiffres réels viennent des copies figées des études (lues entre 23:16 et 23:45 le 27/11, de 566 à 592 lignes de courses selon l'étude).
- Aucune course du jeu n'a été jouée, rien n'a été modifié hors de ce fichier et de `synthese/`, rien n'est commité.
- Deux calculs neufs, chacun un seul processus de moins de 5 minutes :
  1. `synthese/b4-au-simulateur.js` tranche la contradiction principale (le rejeu des anciens). Il rejoue la proposition B4 du tri précoce **exacte** dans le simulateur calé de l'étude « simulateur ». Pour cela, il patche `simuler.js` en mémoire (quatre remplacements de texte, le fichier n'est pas touché). Il tourne sur les mondes neufs 7000+k de la relecture du simulateur.
     - Contrôle à réponse connue (`sorties/b4-controle.txt`, TOUT PASSE) : le patch au neutre redonne au bit près la même évolution que `simuler.js` sur 6 mondes, et le patch actif fait bien deux fois plus de générations.
  2. `synthese/taille-de-la-mesure.js` calcule combien d'enfants il faut pour voir si les mutations comptent.
     - Contrôle : il redonne r = 0,53 pour τ = 1 à 12 graines (`effets/` attend environ 0,56). La puissance simulée retombe à 0,79-0,85 pour 0,80 visé (`sorties/taille-de-la-mesure.txt`).

## 1. La sélection telle qu'elle est réglée : progresse-t-elle, à quelle vitesse, qu'est-ce qui la freine ?

### Ce qui est mesuré sur les vraies courses du 27/11

| mesure | valeur | source |
|---|---|---|
| hasard d'une course autour du modèle pilote + graine | 3,26 paliers (3,19 à 2,92 selon le lot) | `effets/` § 3, `simulateur/`, `tri-precoce/` |
| écart vrai entre mutants, τ | **0,32 [0 ; 1,07]**, et 0,35 [0 ; 1,20] par un autre chemin (relecture) | `effets/` § 4 |
| un mutant se classe-t-il pareil sur deux lots de graines ? | r = −0,13 (19 mutants) ; −0,21 sur a et −0,23 sur F (20 pilotes) ; on attendrait 0,56 si τ ≈ 1 | `effets/` § 1, `tri-precoce/` |
| fiabilité du classement (part vraie de la variance des notes) | 19 % à 24 courses, 10 % à 12 (τ 0,32) ; 72 % et 56 % si τ = 1,07 | `effets/` § 4 |
| mutants létaux, nettement pires ou nettement meilleurs | 0 / 25, 0 / 19, 0 / 19 | `effets/` |
| effet moyen d'un mutant g0 | −0,42 palier [−1,57 ; +0,73] (Student, relecture) | `effets/` |
| E (l'écart aux joueurs) entre mutants | ne bouge pas (ΔE +0,01 ± 0,08) : la note F suit le palier | `effets/` |
| la validation actuelle (24 graines) | 3 % de faux sacres ; reconnaît un vrai +1 palier 15 fois sur 100, un +2 44 fois sur 100 | `sacre/` § 1, confirmé par la relecture (vrai `note.comparer`) |
| débit sur le Xeon | 191 courses/h à la génération 0 ; 129 à 130 à la génération 1 (PC chargé, courses plus longues) | `effets/`, `vitesse/` |
| où part le temps d'une course | environ un quart avant que la voiture roule ; le cerveau 2,4 %, les yeux 5 à 6 % | `vitesse/` |

### Ce que le simulateur en tire (supposé : la loi des mutations)

Le champion, en vrai, en écart au témoin, médiane sur 10 mondes (`simulateur/resultats/principal.txt`) :

| scénario | 10 000 courses | 50 000 | 200 000 |
|---|---|---|---|
| étroit (le plus proche du τ mesuré) | 0,00 | 0,00 | 0,00 |
| pessimiste | 0,00 | 0,01 | 0,00 |
| moyen | 0,30 | 0,99 | 1,28 |
| optimiste | 0,85 | 2,86 | 4,25 |

En jours (scénario moyen), 50 000 courses font 10,8, 5,3 ou 2,6 jours à 200, 400 ou 800 courses par heure. Le débit du Ryzen n'est pas mesuré. S'il fait 2 à 4 fois les 191/h du Xeon, il se situe entre 400 et 800/h.

Attention :
- Les quatre scénarios sont calés sur une dispersion des mutants d'environ 0,6 palier, alors que la meilleure estimation mesurée est 0,32 (voir la contradiction C3). Le « moyen » est donc plutôt optimiste.
- Dans les scénarios plats, la sélection dérive un peu : 10 à 40 % des évolutions finissent avec un champion pire que le témoin, de 0,1 à 0,3 palier au plus.

### Ce qui freine, du plus fort au moins fort

1. **Le hasard d'une course devant la petite taille des effets** (3,26 contre environ 0,3). Aucun réglage étudié ne l'efface : la sélection trie surtout du bruit tant que τ est petit.
2. **La loi des mutations elle-même** : si le témoin est déjà près de son optimum, il n'y a rien à trouver. C'est ce qui sépare 0 de 4 paliers.
3. **La validation presque aveugle** : 15 % à +1 palier. Un vrai progrès attend longtemps son sacre, ce qui ralentit les naissances de l'immigré, toujours tiré du champion.
4. **Le débit** : 130 à 191 courses/h sur le Xeon. Les accélérations exactes ne gagnent qu'environ 9 % (`vitesse/` corrigé). Le facteur deux viendra du Ryzen, pas du code.

## 2. Les changements, classés

« Époque » : un changement de `FICHIERS_EPOQUE` (`ml/evolution/commun.js:251` : yeux, doigts, piloter, ressemblance, mesures, voltige, jeu-reel, sim-env-reel, modele, enfant) ou de `cfg.reseaux` change l'époque des courses. Les notes repartent de zéro et les courses sont rejouées, mais les pilotes restent. Un changement de `cfg.note` change l'époque des notes : les courses restent dans le cache, les notes repartent de zéro (INTERFACES § 3.10).

### A. À faire tout de suite (sûr, ne change ni le pilote ni les yeux ni les courses)

Classés du meilleur rapport gain / risque au moins bon.

| # | changement précis | gain attendu | coût | verdict du relecteur | époque ? | comment on saura |
|---|---|---|---|---|---|---|
| A1 | `config.json` : `validation.maledictionSeuil` 1 → `null`. On garde la mesure de la malédiction dans le journal, mais `regle6` ne passe plus à `regle6Haute` (3). | Évite que la règle 6 passe à 3 après 10 validations. La malédiction attendue quand tout marche vaut 1,1 à 1,8 palier pour un meneur jeune : l'alarme sonnerait par construction. Le « ÷ 5 des vrais sacres » est un taux par essai : la perte réelle serait surtout un retard, plus petit. | Une valeur de config. La validation sur graines neuves n'est pas biaisée (1,7 % contre 1,6 % de faux sacres, relecture `sacre/r3`). | tient avec réserve (ampleur surestimée) | non | La malédiction moyenne des 10 premières vraies validations : vers 1 à 1,8, c'est le biais attendu. |
| A2 | Ne rien dégrader : garder `grainesParGeneration` 12, `mu` 20, `lambda` 6, `seuilSacre` 2. Ne jamais passer à 6 graines par génération, ni à 24, ni à 40 vivants avec 6 naissances, ni à `seuilSacre` 3. | 6 graines coûte −1,16 ± 0,23 (moyen) et −2,46 ± 0,38 (optimiste) de F4 à 50 000 courses. 40 vivants coûte −0,57 ± 0,12 (moyen). | Rien. | tient avec réserve (« 40 pilotes » ne vaut qu'à 6 naissances ; 24 graines de validation et `seuilSacre` 2 sont un choix de prudence) | non | — |
| A3 | Mesurer le débit du Ryzen dès la première nuit (`debit_h`, `nGraines` dans `generations.jsonl`). Laisser l'économie de graines telle quelle, avec A4. | Dire si 50 000 courses font 2,6 ou 10,8 jours. Au simulateur, 8 graines au lieu de 12 ne nuisent pas : +0,06 ± 0,15 en apparié. | Une nuit. | tient | non | Le premier `generations.jsonl` du Ryzen. |
| A4 | **Protéger les enfants par leur âge et non par 24 courses.** `ml/evolution/evoluer.js`, `tournoi()` (l. 354) : `pool` = vivants nés en G−2 ou avant. « 6. LE RENVOI » (l. 680) : `elig` = vivants nés avant G (`v.ne < G`), en gardant l'exclusion du témoin et du champion. C'est exactement le comportement d'aujourd'hui à 12 graines ; à 8 graines (l'économie), la règle des 24 courses protège un enfant deux générations au lieu d'une. | Mesuré ici (`synthese/sorties/b4-bilan.txt`, 24 mondes neufs, 200/h, l'économie à 8 graines active) : +0,17 ± 0,10 (moyen) et +0,32 ± 0,12 (optimiste) de F4 du champion à 50 000 courses. À 400/h (l'économie ne se déclenche pas) : −0,01 ± 0,02 et +0,02 ± 0,14, donc aucun effet, comme attendu. | Deux lignes et un cas dans `tests/generation.test.js`. | non relu par un second agent : proposé par la relecture du tri précoce, chiffré par cette synthèse | non | Avec l'économie active, `morts.jsonl` doit montrer des renvois dès la 2e génération d'un enfant. |
| A5 | **Validation séquentielle** (`sacre/`). `evoluer.js`, `validation()` : 24 graines, puis des paquets de 12 jusqu'à 96. Sacre si z > 2,2·√(96/n), arrêt si z < 0,5. La malédiction se calcule sur les **24 premières** graines (correction de la relecture). `note.comparer` lit `seuilB` et `seuilC` dans `cfg.validation`, à **1 par défaut** (le changement à 2 est en D1). `validations.jsonl` reçoit `regards[]`. La revalidation garde ses 24 graines. | Simulé sur les vraies courses : on reconnaît un +1 palier 33 fois sur 100 au lieu de 15, un +2 86 fois au lieu de 44 ; les faux sacres passent de 3,0 à 1,8 % ; un pilote moins bon (−0,5) n'est jamais sacré (0,0 %). | 76 courses par validation pour un pilote égal, 120 pour un +1, contre 48. Une boucle à écrire, avec une reprise par le cache. Au même risque, un lot fixe de 96 graines est un peu plus puissant (+6 ± 2 points à +1) mais coûte toujours 96 graines. | tient avec réserve (« le meilleur plan » est trop fort : il est le moins cher, pas le plus puissant) | non (`cfg.validation` n'entre pas dans l'époque) | La part des sacres confirmés au coffre monte ; `regards` permet de rejouer d'autres bornes sur les vraies validations. |
| A6 | `evoluer.js`, `courir` : demander les courses par durée attendue décroissante, en rangeant les promesses à leur index d'origine. | 0,2 % mesuré sur le Xeon ; jusqu'à environ 1,7 % estimé, plus sur le Ryzen (non mesuré). | Quelques lignes. | tient avec réserve (gain incertain dans les deux sens) | non | Le temps inoccupé en fin de génération, dans `sortie.log`. |

### B. À grouper avec la prochaine époque (exact, mais change l'empreinte de l'époque)

Le bon moment : avant que le Ryzen lance sa population. Si elle tourne déjà, à la prochaine époque voulue (par exemple le passage au génome v:2).

| # | changement | gain | coût | verdict | époque ? |
|---|---|---|---|---|---|
| B1 | `ml/reel/jeu-reel.js`, `creer` : après `loadGame`, avant `start()`, seulement si `!opts.charge`, remplacer `envCielCalc` par 6 faces noires (`vitesse/` A1). | 3,3 à 5,8 % du temps d'une génération (5 à 8 min sur le Xeon). La fonction est pure et ne tire pas au hasard ; 2 courses sur 2 sont identiques au bit près. | Une preuve à faire **avec le vrai code et des pilotes variés** : `preuve-identite.js --n 24 --options "--sans-ciel"`, puis `ml/bot/verifier.js`, soit 30 min à 1 h. | tient avec réserve (gain corrigé de 9,3 % à 3,3-5,8 %) | **oui** (courses), sans changer aucun résultat |
| B2 | `config.json` : `note.passes` 10 → 30. | Le modèle pilote + graine converge mieux quand les pilotes n'ont pas joué les mêmes graines (erreur de a de 0,03 palier à 10 passes, 0,0005 à 30) : utile seulement si les graines diffèrent entre pilotes (B4). | Le calcul de la note est 3 fois plus long. | tient | **oui** (notes : `cfg.note`), courses gardées |

### C. À essayer (gain possible, à mesurer d'abord, sans danger connu)

| # | changement | gain attendu | coût, risque | verdict | époque ? |
|---|---|---|---|---|---|
| C1 | `config.json` : `poissonMutations` 2 → 4 (ou `sigmaMutation` 0,15 → 0,30). Des mutations plus fortes, pour rendre τ plus visible. | Sur mondes neufs, `poissonMutations` 4 donne 0,00 ± 0,07 (moyen) et +0,20 ± 0,11 (optimiste). `sigmaMutation` 0,30 n'a été vu que sur les mondes de choix (+0,44 en optimiste) : non confirmé. | Plus de mutations nuisibles. Rien de mesuré à σ 0,3 (un seul immigré). Le simulateur ne peut pas dire si τ grandit avec σ. | tient avec réserve (×2) | non |
| C2 | `ml/evolution/genome.js`, `muter` : ne tirer les réels que parmi ceux que le pilote lit, en retirant de l'urne ceux dont le drapeau de garde vaut 0 chez le parent (`volRetour`, les 5 réels de `retourOn`, les 15 réels des gestes). Ne compte qu'en génome v:2. | +34 % de réels actifs à chaque naissance en v:2 (25,3 % des tirages perdus aujourd'hui). Au moins 2 % de naissances muettes en moins. | Une dizaine de lignes. Le seul « nul exact » observé ne porte **aucun** gène muet par construction : le gain réel sur la sélection n'est pas montré. | tient avec réserve | **non d'après le code** (`genome.js` n'est pas dans `FICHIERS_EPOQUE`), voir C7. Change la suite des naissances, pas les courses. |
| C3 | `validation.regle6` 2 → 1, après les premières vraies validations (avec A5). | Valider plus tôt. Les chiffres « par fenêtre » de `sacre/` sont surestimés, car la règle 6 est réessayée à chaque génération. | Plus de validations, environ 100 courses chacune. | tient avec réserve | non |
| C4 | Le filtre des clones : un enfant dont les 4 premières courses ont l'empreinte de celles de son parent s'arrête là (`raison:'clone'`). | 2,2 % du temps de la génération 1 réelle (1 clone sur 6 enfants) ; au simulateur, rien au-delà du bruit (4,58 ± 0,18 contre 4,46 ± 0,15). | Une promesse chaînée dans `courir` ; 0,05 à 0,16 % de faux clones simulés. La part de clones parmi les naissances ordinaires est mal connue (14 courses sur 36 identiques au parent sur 3 naissances). | tient avec réserve | non |
| C5 | B4 : les anciens ne rejouent que 4 des graines de la génération (`grainesAnciens: 4`, avec A4 et B2). | Dans le simulateur calé, sur mondes neufs (`synthese/`) : à 400/h, +0,08 ± 0,10 (moyen), +0,26 ± 0,13 (optimiste), +0,03 ± 0,04 (pessimiste). À 200/h, +0,25 ± 0,07 (moyen) et +0,40 ± 0,16 (optimiste), mais la protection par l'âge seule (A4) en donne déjà +0,17 et +0,32. Le gain propre de B4 est donc de l'ordre de +0,1 palier. | Il **casse la mesure gratuite de τ** (la seconde moitié d'un enfant tombe à 4 graines), épuise la réserve de 1 081 graines deux fois plus vite, rend la note d'un ancien moins précise (se_F 0,48 contre 0,30) et retarde la validation (9 générations au lieu de 3 pour atteindre 48 courses). | tient avec réserve (relecture `tri-precoce/` : 1,4 fois plus de générations face à ce qui tourne, pas 2,1 ; moins bien en « très faible ») | non |

À essayer **après** que la mesure de τ (§ 4, M1) a répondu. Si τ est sous 0,3, aucun de ces cinq changements ne vaut son code.

### D. À décider par Sacha (ce que la note récompense, ou les yeux)

| # | la décision | ce que disent les études | époque ? |
|---|---|---|---|
| D1 | Les critères de garde (b) et (c) du sacre à 2 erreurs-types au lieu de 1 (`seuilB`, `seuilC` 2), et `<=` dans (c). | À 2 se, un +2 paliers est sacré 86 fois sur 100 au lieu de 80, avec les mêmes faux sacres (1,6 %). Mais un pilote +2 paliers qui s'éloigne des joueurs (E +0,1) passe 56 fois sur 100 au lieu de 30 : c'est le **taux de change palier contre ressemblance**. Parmi les pilotes qui passent déjà (a), (c) n'en retire que 1 à 10 % (relecture). Si Sacha ne veut jamais perdre en ressemblance, il faut garder 1 se. | non |
| D2 | Le poids de E dans F (`note.poidsEcart` 4). | Le garder à 4. À 0, E dérive dans le mauvais sens (+0,08 ± 0,02 à +0,18 ± 0,04 en apparié). À 16, la note trie le bruit de E et coûte 0,49 ± 0,20 à 1,11 ± 0,24 palier en monde inerte. Tout cela dépend de la taille **supposée** des effets sur E. | **oui** (notes) |
| D3 | `seuilSacre` 1 au lieu de 2. | Plus rapide (+0,56 ± 0,16 en optimiste), mais 18 % de faux sacres par validation (vrai `note.comparer` sur les vraies courses) et 21 à 38 % de champions pires que le témoin en pessimiste. C'est la sûreté contre la vitesse. Avec A5, on a les deux en partie. | non |
| D4 | Tout ce qui change les yeux, le pilote ou la physique : moins de rayons (5 à 6 % au plus), décider moins souvent (8 % au plus), 30 images/s (jusqu'à environ 35 %, mais une autre physique que celle des joueurs), couper les effets qui tirent au hasard (15 à 19 %, mais toutes les routes changent), une tmax plus courte. | `vitesse/` les déconseille toutes : soit le gain est petit, soit elles changent ce qu'est une course. | **oui** |
| D5 | Committer ou non les copies figées des données (`donnees/` dans quatre études, de 600 à 860 Ko chacune, plus deux profils CPU d'environ 1,2 Mo) dans un dépôt public. | Rien de privé d'après les greps des auteurs (« Users », « sacha », « @ ») ; `sortie.log` a été retiré des copies. À refaire sur tout le dossier avant un commit. | — |

### E. À ne pas faire (refuté, ou trop risqué)

| changement | pourquoi | source |
|---|---|---|
| « Rejouer seulement les jeunes + les 4 meilleurs » (R3 du simulateur), et l'ensemble D tel qu'annoncé | Le gain venait des mondes qui ont servi à le choisir. Sur mondes neufs : +0,05 ± 0,06 (moyen), 0,00 ± 0,03 (pessimiste). | relecture `simulateur/` |
| Écrire les gènes éteints à leur valeur de naissance (A3 de `vitesse/`) | Environ 0,1 % de gain, pas 3,8 % : le clone observé avait muté un gène lu sans drapeau. | relecture `vitesse/` |
| Le tri précoce des enfants (couper après 3 courses) | Environ 1 % du temps par enfant coupé ; aucun effet au simulateur. Piège : sous 5 parties, `note.js` met E = 4, et une règle sur F couperait tout le monde. | `tri-precoce/` |
| Le rejeu « près du seuil » (C) et le jeu de graines fixe (D0, D1) | C n'économise rien. D sur-apprend son jeu de graines par les courses identiques parent / enfant (2,92 contre 4,46 en moyen), et ses pilotes n'atteignent jamais les 48 courses de la validation. | `tri-precoce/` |
| Compter les courses d'entraînement dans le jugement du sacre | 53 à 62 % de faux sacres. | `sacre/` |
| Un cache « au comportement » contre les courses identiques | Elles pèsent 5 % du temps (12 % des courses, mais des courses courtes). À revoir au-delà de 15 % du temps. | `effets/` R4 |
| Plusieurs courses dans un même processus (A2 de `vitesse/`) | Mesuré faux sur 2 maps sur 7 (`ml/reel/README.md`, 25/11). Gain réel de 4,7 à 6,1 % (et non 12,4 %). Pas avant d'avoir trouvé l'état qui reste. | `vitesse/` |
| Options de mémoire de node, préchauffage du processus suivant, cache de code V8 seul | 0,4 à 1,3 %, 0 et 0,2 %. | `vitesse/` |
| Relever `seuilEconomie_s` pour garder 12 graines | Pas de dommage mesuré à 8 graines (+0,06 ± 0,15). Le vrai défaut de l'économie est la protection des 24 courses, réparée par A4. | voir C2 ci-dessous |

## 3. Les contradictions entre études

**C1. Le rejeu des anciens : `tri-precoce/` (B4 gagne 1,2 à 1,3 fois) contre `simulateur/` (son cousin R3 ne gagne rien).**
*Tranché en grande partie par `synthese/b4-au-simulateur.js`.* Rejoué exact dans le simulateur calé, B4 ne gagne que +0,08 ± 0,10 (moyen) à 400/h, alors qu'il fait 328 générations contre 163. Il ne gagne nettement qu'avec l'économie active (+0,25 ± 0,07), et là, la protection par l'âge seule en explique la plus grande part (+0,17 ± 0,10).
Pourquoi les deux simulateurs divergent : celui du tri précoce n'a **pas de plafond** (un pilote progresse sans fin, ses niveaux atteignent +4 à +8 paliers en 3 jours), et deux fois plus de générations y rapportent forcément. Le simulateur calé a un plafond (2,4 paliers en « moyen ») : le progrès y sature, et la précision perdue sur les anciens compte davantage.
Ce qui reste ouvert : la forme vraie du paysage. Il faut aussi rappeler que B4 est moins bon dans le monde « très faible », celui que désigne le test-retest (0,48 contre 0,65).

**C2. Le nombre de graines et l'économie : `effets/` R5 (relever le seuil pour garder 12) contre `simulateur/` (8 ne nuit pas) et `tri-precoce/` (8 est la référence).**
*Tranché.* Au simulateur, 8 contre 12 ne montre aucun dommage en apparié (+0,06 ± 0,15). Le seul défaut que l'économie crée, la protection de 24 courses qui dure alors deux générations, se répare par A4 sans relever le seuil.
Il est aussi probable que l'économie ne se déclenche pas sur le Ryzen. La génération 1 n'a dépassé les 5 400 s que sur un Xeon chargé (129 courses/h ; la génération 0 tenait en 4 535 s). C'est à vérifier par A3.

**C3. La taille des effets des mutations : `effets/` 0,32 [0 ; 1,07], `sacre/` 0,54 (0,45 sur 7 pilotes), `simulateur/` environ 0,6, `tri-precoce/` au plus 0,54 avec un test-retest de −0,21.**
*Tranché sur la méthode, pas sur la valeur.* L'estimation d'`effets/` est la seule qui retire le bruit du témoin commun à tous les mutants, et qui a été vérifiée sur un cas inventé (la méthode naïve trouvait 0,62 pour 0,9 vrai). La relecture la retrouve sans le témoin (0,35). Les 0,54 à 0,6 sont des « observé² − bruit² » sur la seule génération 0, compatibles avec l'intervalle mais du côté haut.
Conséquence : les scénarios du simulateur (calés sur 0,6) penchent vers l'optimisme, et « étroit », où la sélection stagne, est le plus proche du mesuré. La valeur ne se tranche que par la mesure M1.

**C4. Les faux sacres : `simulateur/` 5,9 % ± 2,2 contre `sacre/` 3,0 %.**
*Tranché* : environ 3 %. Le vrai `note.comparer` sur les vraies courses donne 3,2 % ± 0,6 (relecture du simulateur) et 3,5 % ± 0,8 (relecture du sacre, par permutation). L'écart vient du hasard (7 sacres sur 118), pas d'un bootstrap biaisé (rapport 1,02).

**C5. Les courses identiques : 12 % des courses (`effets/`), 8,8 % (`vitesse/`), 10 % (`tri-precoce/`), 39 % chez les naissances ordinaires (relecture `effets/`).**
*Pas une contradiction* : les définitions diffèrent (une ou trois empreintes ; contre le témoin ou contre n'importe quel autre pilote) et les populations aussi (les mutants g0 changent 4,8 réels, une naissance ordinaire 3). En temps, tout le monde trouve 4 à 5 %. Ce qui reste inconnu, la part chez les naissances ordinaires (3 cas seulement), se lit gratuitement (M4).

**C6. La force des mutations : `effets/` R2 (σ 0,30 ou Poisson 4, confiance basse) contre `simulateur/` (Poisson 4 « mieux », +0,61).**
*Tranché* : sur mondes neufs, Poisson 4 vaut 0,00 ± 0,07 (moyen) et +0,20 ± 0,11 (optimiste). C'est sans danger mais incertain, donc en C1.

**C7. `genome.js` fait-il partie de l'époque ?**
INTERFACES § 9.3 le dit, et `effets/` R3 le reprend. Mais `FICHIERS_EPOQUE` (`commun.js:251`) ne contient pas `genome.js`, et `courses.js` ne le cite pas.
*D'après le code*, changer `muter` ne change aucune course ni aucune note : seulement la suite des naissances. À confirmer par Fable : je n'ai lu que ces deux endroits. Changer le génome v:1 → v:2 change l'époque, mais par `modele.js`.

**C8. `simulateur/` R1 « garder 24 graines de validation » contre `sacre/` « jusqu'à 96 ».**
*Pas une contradiction* : le simulateur trouvait 48 graines de validation un peu mieux (+0,09 à +0,30, non significatif), jamais pire. La validation séquentielle n'a pas été rejouée dans le simulateur de population. Son effet sur le progrès du champion (et non sur le taux de sacre) n'est pas mesuré.

## 4. Ce qu'on ne sait toujours pas, et la mesure la moins chère

| inconnue | pourquoi elle compte | la mesure la moins chère (courses réelles sur le Ryzen) |
|---|---|---|
| **M1. Les mutations comptent-elles ? (τ)** | Elle décide de tout : de 0 à 4,3 paliers à 200 000 courses, et de l'utilité de C1 à C5. | **Gratuite** : à 12 graines, chaque enfant joue 12 graines à sa naissance et 12 neuves à la génération suivante (il ne peut pas être renvoyé avant). La corrélation « moitié contre moitié » de son a, jugée par le modèle pilote + graine, mesure τ. Il faut (`synthese/sorties/taille-de-la-mesure.txt`) 160 enfants pour voir τ = 0,5 contre 0, soit environ 27 générations à 6 naissances ; 60 enfants pour τ = 0,7 ; 921 pour τ = 0,3. À 8 graines : 311, 106 et 1 948. Version payante plus rapide : 58 mutants sur 2 × 24 graines (environ 2 800 courses) pour τ = 0,5. Il faut étendre `effets/analyser.js` aux générations suivantes ; ne pas faire C5 avant. |
| M2. Le débit du Ryzen | Il transforme les courses en jours (2,6 à 10,8 jours pour 50 000) et décide si l'économie se déclenche. | La première nuit : `debit_h` et `nGraines` dans `generations.jsonl` (A3). |
| M3. La force des mutations agrandit-elle τ ? | C'est le seul levier connu contre le frein n° 1. | La même mesure moitié contre moitié sur des enfants à σ 0,30 : environ 160 enfants pour voir τ = 0,5, soit environ 3 840 courses s'ils sont joués exprès (12 graines par moitié). L'immigré (σ 0,30, un par génération) la donne lentement et gratuitement. |
| M4. La part de clones et de courses identiques chez les naissances ordinaires | C4 et R4 en dépendent (39 % sur 3 naissances seulement). | Gratuite : relancer `effets/analyser.js` sur une copie après 10 générations. |
| M5. Un meilleur pilote décale-t-il ses paliers sans changer leur forme ? | C'est la supposition centrale de toute la puissance du sacre. | Le champ `regards` des premières vraies validations (avec A5) ; sinon le coffre, champion contre témoin sur 40 graines. |
| M6. La réserve de 1 081 graines d'entraînement | Elle s'épuise après 90 générations à 12 graines : 9 jours sur le Xeon au rythme de la génération 1 (9,95 générations par jour), soit 2,3 à 4,5 jours si le Ryzen fait 2 à 4 fois mieux (calcul à partir des chiffres de `tri-precoce/`, non simulé). Ensuite, un ancien retombe sur des graines déjà jouées (le cache, rien appris) et un enfant sur des graines que son parent connaît : le piège de D revient en partie. | Aucune course : vérifier dans `graines.js` le comportement à l'épuisement et prévoir une seconde plage. Celle-ci ne doit toucher ni 950 000 et au-delà (repli de la validation, coffre) ni la validation qui monte de 1 000 000 par pas de 37. `cfg.graines` n'entre pas dans l'époque. À décider avant environ la génération 80. |
| M7. Les phases B et C (les têtes) et les gestes du génome v:2 | Aucun simulateur ne les a. La vraie évolution sera en phase C au plus tard à la génération 120. | Rien de moins cher que la vraie évolution : relire M1 à chaque changement de phase. |
| M8. La preuve de B1 (le ciel) | Elle garantit qu'aucune course ne change. | 24 courses connues avec le vrai code et des pilotes variés : 30 min à 1 h. |

## Les limites de cette synthèse

- Elle repose sur cinq études qui n'ont lu que les générations 0 et 1 d'une seule évolution, en génome v:1, sur le Xeon. Le Ryzen tournera sans doute en v:2.
- Mon calcul B4 réutilise le simulateur calé, avec toutes ses suppositions : paysage additif de 64 gènes, loi des mutations par scénario, ni têtes ni drapeaux.
  - Le bras « B4 » comprend aussi `note.passes` 30.
  - Je n'ai rejoué que 50 000 courses : le rejeu à 200 000 a été arrêté, car il dépassait 5 minutes.
  - 24 à 30 mondes par case : les écarts de moins de 2 erreurs-types sont fragiles. A4 est à 1,7 et 2,7 erreurs-types.
- A4 et C7 sont des lectures du code (`evoluer.js` l. 354 et 680, `commun.js:251`) faites par cette synthèse seule, sans second relecteur.
- `taille-de-la-mesure.js` suppose un bruit normal, alors que le palier est un entier borné en bas. Il suppose aussi que les deux moitiés d'un enfant sont jouées dans la même époque.

## Comment refaire

Depuis `ml/ecurie/etude/reglage-de-la-selection/synthese/`, un processus à la fois, aucune course du jeu :

```
node b4-au-simulateur.js controle                         # le patch au neutre = simuler.js au bit pres (1 s) -> sorties/b4-controle.txt
node b4-au-simulateur.js jouer moyen 0 4 50000 400        # puis moyen 4 26, optimiste 0 30, pessimiste 0 30 (a 400/h),
node b4-au-simulateur.js jouer moyen 0 24 50000 200       #   et moyen / optimiste 0 24 a 200/h (~5 s par monde, < 3 min par appel)
node b4-au-simulateur.js bilan                            # -> sorties/b4-bilan.txt
node taille-de-la-mesure.js > sorties/taille-de-la-mesure.txt   # (< 5 s)
```

Les chiffres des cinq études se refont avec les commandes de leurs LISEZ-MOI (sections « Comment refaire » et « Relecture »).
