# Le lot « règles » : quatre changements de règles (A4, A6, M6, C2) et deux vérifications — 28/11/2026

Pour l'intégrateur, puis pour Sacha. Source : `ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md` (§ 2 A4, A6, C2 ; § 3 C7 ; § 4 M6) et les études
qu'elle résume. Rien n'est commité, rien n'est poussé. Le jeu ne change pas. Ni `modele.js`, ni `enfant.js`, ni `config.json « reseaux »` n'ont bougé :
**aucune époque ne change** (ni celle des courses, ni celle des notes). Le travail du lot « sacre » (`notes/sacre.md`, la validation séquentielle) est
gardé tel quel : je n'ai touché ni `validation()`, ni `cfg.validation`.

## En mots simples (pour Sacha)

- **Les bébés pilotes sont protégés par leur âge.** Un enfant né à une génération ne peut pas être renvoyé pendant cette génération, et il ne devient
  parent que deux générations après sa naissance. C'était déjà ce qui se passait à 12 courses par génération ; mais quand le PC est lent (8 courses par
  génération), l'ancienne règle des « 24 courses » le protégeait deux générations au lieu d'une.
- **Les courses longues partent en premier.** Pour que tous les cœurs travaillent jusqu'au bout de la génération. Rien d'autre ne change : mêmes
  courses, mêmes notes, mêmes journaux (prouvé par un test qui joue la même génération dans les deux ordres). Le gain est petit (de 0,2 à 2 %).
- **Les graines d'entraînement ne s'épuisent plus.** Il y en avait 1 081 : au bout d'environ 90 générations (quelques jours sur le Ryzen), la sélection
  se mettait à **rejouer en silence** des graines déjà jouées. Il y en a maintenant **27 millions de plus**, après les plages réservées : de quoi tenir
  plus de 2 millions de générations. Les 1 081 premières restent en tête : une sélection déjà commencée continue sans rejouer ni sauter une graine.
  Au tout bout, la sélection **s'arrête avec un message clair** au lieu de rejouer.
- **Les mutations ne tombent plus dans le vide.** Un pilote a des réglages qu'il ne lit pas tant que leur interrupteur est éteint (les cinq gestes, les
  quatre idées de la boucle payante, la loi « retour »). Avant, une mutation sur trois du témoin tombait sur l'un d'eux et ne changeait rien. Maintenant
  la mutation ne tire que parmi les réglages que le pilote lit : **0 % de mutations perdues**, au lieu de 34 % (27 % sur le Ryzen, en génome v:2).
  Le nombre de mutations et le tirage des interrupteurs sont les mêmes qu'avant.
- **L'alarme « population trop semblable »** est remise à l'échelle des 121 gènes : 0,011 au lieu de 0,012.

## Ce qui a changé

| fichier | changement |
|---|---|
| `genome.js` | `GARDES` (la **seule** table drapeau → réels qu'il garde : 10 drapeaux, 30 réels), `GARDE_DE` (réel → drapeau), `reelsLus(genome)` ; `muter` tire ses réels dans `reelsLus(parent)` (`o.urneComplete` = l'ancienne urne, pour la mesure seulement) ; contrôle au chargement (chaque clé de `GARDES` est un drapeau de `BORNES`, chaque valeur un réel, 30 en tout). `VERSION`, `BORNES`, `bloc()`, `ecrirePilote`, `idDe` inchangés. |
| `graines.js` | la suite d'entraînement (`cfg.graines.entrainement.suite`), la réserve rechargée par **blocs** de 1 081 indices (`eg.blocs`, défaut 0), `grainesRestantes(eg,cfg)`, `graineDe(E,i)` ; au bout : erreur `GRAINES_EPUISEES` (`cfg.graines.auBout` `"arret"`, défaut quand une suite existe) ou l'ancien retirage (`"rejouer"`, ou une config sans suite). |
| `evoluer.js` | `tournoi(…, G)` et le renvoi par l'âge (`protectionGenerations`, `neDe`) ; `ordreLongues` + `courir(ctx, taches, {ordre})` (l'étape 3 d'une génération) ; `ordreLignes` : `noterTous` range les lignes par génération, graine, pilote, clé avant `note.noter` ; `naissances` s'arrête **avant** toute naissance quand les graines manquent, et prévient à moins de 20 générations de la fin. Exporte `ordreLongues`, `ordreLignes`. |
| `config.json` | `protectionGenerations: 1` (remplace `protectionCourses`, retiré), `ordreCourses: "longues"`, `graines.entrainement.suite: {depart: 1000021, pas: 37, fin: 999999999}`, `graines.auBout: "arret"`, `alarmeDistance: 0.011` ; quatre notes dans `_notes`. Rien dans `validation.*` ni `reseaux`. |
| `config-essai.json` | `protectionCourses` retiré (la note dit pourquoi). |
| `INTERFACES.md` | § 9.3 : la phrase « `modele.js` et `genome.js` font partie de l'époque » est corrigée (C7, voir plus bas). Rien d'autre. |
| `tests/genes-muets.test.js` | neuf (m1 à m6). |
| `tests/generation.test.js` | A4 à 12 et à 8 graines, A6 (deux ordres), la compatibilité (un état v:2 de l'ancien code). |
| `tests/graines.test.js` | l'ancien test d'entraînement tourne sur une config d'avant (sans suite) ; cinq tests M6. |
| `tests/integration.test.js` | `alarmeDistance` 0,011. |
| `tests/mesure-muettes.js`, `tests/mesure-distance.js` | les deux mesures (pas des tests rapides). |
| `tests/etat-v2-ancien/` | neuf : population.json et les quatre journaux d'une vraie marche du 27/11 au soir (genome v:2, graines sans `blocs`), pour le test de compatibilité. Relu : ni chemin, ni nom de PC, ni adresse. |

## 1. A4 — la protection par l'âge

**La règle d'avant, vérifiée dans le code avant de la changer** (`evoluer.js`, `tournoi` et « 6. LE RENVOI ») : parent et renvoyable seulement avec
`nDe(notes, id) >= protectionCourses` (24), `n` = les courses d'entraînement **mesurées** de l'**époque**, hors graines retirées. À 12 graines c'est bien
« né en G : protégé en G, renvoyable en G+1, parent des naissances de G+2 », comme le dit la synthèse. **Mais pas toujours**, et la synthèse ne le dit pas :
- à 8 graines (l'économie) : 16 courses en G+1, protégé une génération de plus (c'est le cas que la synthèse décrit) ;
- une **graine retirée** pour l'époque ou **une course non mesurée** : 23 courses en G+1, l'enfant restait protégé une génération de plus ;
- **une nouvelle époque** : tout le monde repart de 0 course ; à la première génération de l'époque, personne n'avait 24 courses, donc **aucun renvoi**
  (la population montait à μ + λ), et le tournoi retombait sur « les vivants qui ont le plus de courses ».
La règle par l'âge ne dépend d'aucun de ces cas.

**Maintenant** : parent des naissances de G si `ne <= G - 1 - protectionGenerations` ; renvoyable en G si `ne <= G - protectionGenerations`, témoin et
champion toujours exclus ; `protectionGenerations` 1 ; `v.ne` absent = 0. Moins de 3 parents possibles : comme avant, les vivants qui ont le plus de courses.

**Prouvé** (`tests/generation.test.js`, faux ordonnanceur, mu 4, lambda 2, tous les enfants au palier 0, six générations) :
- 12 graines : 8 enfants renvoyés, **tous à ne+1**, jamais à leur naissance ; 24 courses au renvoi (l'ancienne règle faisait pareil) ;
- 8 graines : 8 enfants renvoyés, **tous à ne+1** ; 16 courses au renvoi (l'ancienne règle les aurait protégés une génération de plus) ;
- les parents des naissances de G ≥ 2 sont tous nés en G−2 ou avant.

## 2. A6 — les courses longues demandées d'abord

`ordreLongues(ctx, taches)` : la durée attendue d'un pilote = la moyenne de ses survies connues (lignes d'entraînement mesurées de l'époque) ; un enfant
sans course : celle de son premier parent ; sans rien : la moyenne de tous. Tri décroissant, égalité : l'ordre d'origine. `courir` demande dans cet ordre
et range chaque résultat à son indice d'origine. Seule l'étape 3 (les courses de la génération) s'en sert ; la validation et le coffre gardent leur ordre.
`cfg.ordreCourses: "origine"` = l'ordre d'avant.

**Un point trouvé en chemin, corrigé** : `note.noter` dépend de l'**ordre** de ses lignes (les sommes du modèle pilote + graine au dernier bit, et surtout
le bootstrap de E, qui tire des **positions** dans les parties d'un pilote). Cet ordre était celui où les courses **finissaient** (après une reprise :
celui du fichier). Changer l'ordre des demandes l'aurait donc changé — et une reprise le changeait déjà. `noterTous` range maintenant les lignes
(génération, graine, pilote, clé) : la note ne dépend plus que des courses jouées. Conséquence à savoir : sur le Ryzen, les `se_F` (donc la règle 6) peuvent
bouger un peu à la première génération avec ce code, une fois, comme ils bougeaient déjà d'une reprise à l'autre.

**Prouvé** (`tests/generation.test.js`, A6) : le même état (3 générations à 12 graines) copié deux fois, la génération 3 jouée dans les deux ordres :
72 courses, ordre des demandes différent, décroissant en durée attendue (429 s … 318 s) ; **identiques** : la ligne de generations.jsonl (hors date et
durées), population.json, morts.jsonl, validations.jsonl (hors date), les clés des courses.

## 3. M6 — la réserve de graines d'entraînement

**Aujourd'hui** (le `graines.js` du Ryzen, commit e93ff5cb5, relu dans git par le test) : 1 081 graines tirées sans remise ; la réserve vide, un
**retirage avec remise** parmi les 1 081, hors des 5 derniers lots, **sans alerte**. À 12 graines, la **génération 90** (le 91ᵉ lot) tire la dernière graine
neuve et **11 déjà jouées** ; sur 120 générations, 359 graines rejouées (test `M6 AUJOURD'HUI`).

**Maintenant** : la même progression 910000 + 37·i continue **après** les plages réservées.

| plage | graines | qui |
|---|---|---|
| 910000 à 949960, pas 37 | 1 081 | l'entraînement d'avant, **inchangé, toujours en tête** |
| 950000 à 989999 | — | réservée : repli de la validation, validation de la boucle payante |
| 990000 à 991443 | — | réservée : le coffre |
| 1 000 000 + 37·k | sans fin | la validation de la sélection (reste 1 modulo 37) |
| **1000021 à 999999984, pas 37** | **27 000 000** | **la suite de l'entraînement** (1000021 = 910000 + 37·2433 : reste 22 modulo 37, comme 910000) |

La suite ne rencontre **jamais** la validation de la sélection, si loin qu'elle monte : les deux progressions n'ont pas le même reste modulo 37.
La réserve reste un tableau d'au plus 1 081 indices : vide, elle reçoit le bloc suivant (indices ≥ 1081 → `suite.depart + 37·(i − 1081)`).

**Combien elle tient** : 27 001 081 graines = **2 250 090 générations à 12 graines** (3 375 135 à 8). À 10 à 40 générations par jour, des siècles.
**Au bout** : `naissances` voit avant toute naissance que les graines manquent et lève « evoluer : generation G non commencee : les graines d'entrainement
sont epuisees (… neuves restent, … demandees ; aucune ne sera rejouee). Allonger cfg.graines.entrainement.suite.fin … » : code 1 (« Arrêté sur une erreur »
dans lancer.cmd), **rien n'est écrit**, l'état reste à la fin de la génération d'avant. À moins de 20 générations de la fin, un événement le dit à chaque
génération. `auBout: "rejouer"` remet l'ancien retirage.

**Prouvé** (`tests/graines.test.js`) : les 90 premiers lots sont ceux de l'ancien code au bit près (même hasard), le 91ᵉ prend la même dernière graine ;
2 500 lots sans une graine rejouée, aucune dans une plage réservée, aucune de la forme de la validation ; un état de l'ancien code (sans `blocs`), en cours
ou déjà vide, continue sans rejouer ni sauter ; reprise lot par lot à cheval sur trois blocs ; au bout d'une petite suite, l'arrêt `GRAINES_EPUISEES` sans
rejeu, la demande refusée entière ; **la validation jusqu'à 96 graines** : 3 000 générations (12 ou 8 graines) mêlées de 600 validations de 24 à 96 graines
(29 580 graines de validation, k jusqu'à 29 580) : aucune graine commune avec l'entraînement (les deux plages), aucune dans le coffre ni le repli.

Exemple réel (`essais/tests-generation/compat-b`, l'état v:2 de l'ancien code dont on a vidé la réserve, après une génération avec ce code) :

```json
"graines":{"reserve":[1081,1082,1083,1084,"… 1078 indices"],"recentes":[[940525,938342,929203],[1038649,1021629,1001205]],
           "validationK":3,"validationRepli":false,"validationFinie":false,"blocs":1},
"grainesGeneration":[1038649,1021629,1001205]
```

## 4. C2 — les gènes muets hors de l'urne

**La table, relue dans le code et non dans les noms** (`genome.js` `GARDES` ; le pilote : `modele.js` et `bloc()`) :

| drapeau | réels qu'il garde | comment (code) |
|---|---|---|
| `volRetourOn` | `volRetour` | `bloc()` écrit `volRetour:0` quand il est éteint |
| `retourOn` | `retMarge`, `retCap`, `retGain`, `retAvance`, `retourPrime` | `retours:[]` sans lui ; `retourPrime` n'est lu que par `prime()` d'une façon `retour<i>`, `i < R.retours.length` (le choix du départ et la bascule sautent les autres, **même quand le coup de nitro demande retour0 et retour1**) |
| `lacheOn` | `lacheAvant` | `R.lacheOn>0&&…` |
| `slalomOn` | `slalomCap`, `slalomDemi`, `slalomH` | `zActif` |
| `coupOn` | les 8 réels `coup*` | `if(R.coupOn>0){…}` |
| `relacheOn` | `relacheT` | `R.relacheOn>0&&…` |
| `suitOn` | `suitDerive`, `suitMarge` | `R.suitOn>0&&…` (au sol et à la pose) |
| `bordOn` | `bordNitro`, `bordJauge` | `R.bordOn>0&&…` |
| `largeOn` | `largeHaut`, `largeT1`, `largeT2`, `largeAxe`, `largeAir` | `largeHaut`, `largeAxe`, `largeAir` sous `R.largeOn>0` ; `largeT1`, `largeT2` dans `tSeuil`, qui ne compte que si `large` est vrai, donc si `largeOn` |
| `libreOn` | `nitroLibreK`, `tenirLibre` | `libre=R.libreOn>0&&!decor` |

Hors de la table (ce ne sont pas des réels de l'urne) : `coupDecor` (un drapeau gardé par `coupOn`) et `largeMax` (un entier gardé par `largeOn` : son tirage
est celui des entiers, `pFigMax`, inchangé). Le témoin c0025 lit 58 réels sur 88.

**Prouvé** (`tests/genes-muets.test.js`, ~1,5 min sur ce PC chargé) :
- m2 : drapeau éteint, chaque réel gardé poussé à sa borne basse puis haute ne change **aucune** décision, sur 261 suites (les deux vues de l'inventaire,
  les suites de `tests/portage.test.js` recopiées, et des suites faites pour chaque bloc) : sur c0025 réel par réel, et sur « tout allumé sauf ce drapeau »
  (c0101 + les cinq gestes + retourOn + volRetourOn) réels du drapeau ensemble ;
- m3 : drapeau allumé, **chacun des 30 réels** change au moins une décision (la suite qui le montre est écrite dans la sortie du test) ;
- m4 : 20 000 naissances du témoin et 5 000 d'un génome à drapeaux tirés au hasard : aucun réel muet ne mute ; **à chaque naissance**, le nombre de réels
  tirés, les drapeaux, le choix, les entiers et les têtes sont ceux de l'ancienne urne à la même graine (le hasard consommé est le même : un tirage par réel,
  quelle que soit la taille de l'urne) ;
- m6 : à génome égal, le texte du pilote est **le même** qu'avec le genome.js du commit de départ (120 génomes) : mêmes `shaPilote`, mêmes clés de courses.

**La part de mutations muettes** (`tests/mesure-muettes.js`, 20 000 naissances, mulberry32 fixe) :

| | réels gardés / réels | avant (part des réels mutés) | naissances muettes avant | après |
|---|---|---|---|---|
| v:2 (le Ryzen, genome.js de e93ff5cb5), parent = le témoin | 21 / 79 | **26,7 %** | 2,3 % | — |
| v:3, parent = le témoin | 30 / 88 | **34,1 %** | 3,1 % | **0 %** (0 naissance muette) |
| v:3, une population de 20 sans sélection (les drapeaux dérivent vers 50 %) | | 16,4 % | 1,1 % | 0 % (au regard de l'enfant : 0,6 %, un drapeau éteint dans la naissance même) |

La synthèse attendait « 25,3 % » en v:2 : je trouve 26,7 % au regard du parent et 25,8 % au regard de l'enfant (un drapeau allumé dans la naissance même
rend son réel lu) ; je n'ai pas retrouvé son calcul exact, l'écart est de cet ordre.

**C7 : genome.js entre-t-il dans une époque ? Non.** `commun.FICHIERS_EPOQUE` ne le contient pas, `courses.epoque` ne le lit pas, et la clé d'une course
contient déjà le sha du **texte** du pilote. C'est `INTERFACES.md` § 9.3 qui se trompait (« `modele.js` et `genome.js` font partie de l'époque ») : corrigé.
Ce que genome.js change quand même : l'**empreinte d'identité** (`evoluer.shaIdentite`) : au premier lancement de ce code, le Ryzen refera le contrôle
d'identité (3 courses du témoin, 45 s chacune), sans changer d'époque, et c'est voulu. `effets/` R3 (une étude) reprend l'ancienne phrase : je n'y ai pas touché.

## 5. alarmeDistance

`tests/mesure-distance.js` refait `generation0` (le témoin et 19 mutants de 3 à 6 gènes, σ 0,15) : **0,0221** sur 121 gènes avec `graineMaitre`
(0,0223 en moyenne sur 200 graines, de 0,013 à 0,033 ; c0101 : 0,0218), la même avec l'ancienne urne (0,0220). La moitié : **0,011** (`config.json`, avec
sa note). Pour mémoire : 0,028 × 86 / 121 = 0,0199 ; la somme sur les gènes vaut 2,68 aujourd'hui contre 2,41 sur 86 gènes (la population de naissance
diffère un peu : plus de gènes non réels à basculer).
**Indépendant du nombre de gènes : pas fait**, ce n'est pas simple dans mon périmètre. Le seuil se lit dans `etat.js`, `histoire.js` et `tableau.js`, qui ne
sont pas à moi. La façon sûre : un seuil en **somme** sur les gènes (`alarmeDistanceSomme` 1,34, la moitié de 2,68) et, dans ces trois fichiers,
`seuil = alarmeDistanceSomme / genome.BORNES.length`. `genome.distance` (qui divise par le nombre de gènes) n'a pas été changé : les lignes déjà écrites
dans `generations.jsonl` (sur 107 gènes au Ryzen) se lisent encore pareil.

## Compatibilité avec le Ryzen (code e93ff5cb5, génome v:2)

- Champs neufs, tous avec un défaut : `pop.graines.blocs` (absent = 0) ; `cfg.protectionGenerations` (absent = 1) ; `cfg.ordreCourses` (absent = les longues
  d'abord) ; `cfg.graines.entrainement.suite` (absente : l'ancien retirage au bout) ; `cfg.graines.auBout` (absent : « arret » s'il y a une suite).
  `protectionCourses` n'est plus lu (une config qui l'a encore n'est pas refusée).
- **Prouvé** (`tests/generation.test.js`, « compatibilité ») : `tests/etat-v2-ancien` (une vraie marche du 27/11 au soir : génome v:2, graines sans `blocs`)
  se relit et fait une génération entière avec ce code (génomes v:2 → v:3, aucune graine rejouée, le tableau s'écrit) ; la même chose avec la réserve
  d'avant vidée (le Ryzen après 90 générations) : la génération prend ses graines dans la suite (1038649 1021629 1001205). Le lot « sacre » relit, lui,
  sept autres états de l'ancien code (V8).
- Au premier lancement avec ce code, le Ryzen : refait le contrôle d'identité (genome.js a changé), **ne change pas d'époque**, garde ses courses et ses notes
  (les `se_F` peuvent bouger un peu : l'ordre fixe des lignes, § 2).

## Les tests

Rapides (tous relancés à la fin, voir le compte rendu) : commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture,
traces, relecture-traces, gestes, integration, portage, node-epoque, validation-sequentielle (du lot « sacre »), et le nouveau genes-muets.

Avec de **vraies courses** : `evoluer.js --config essais/regles/config-vrai.json --travailleurs 2 --arret-apres 3` (config-essai, état à moi
`essais/regles/vrai`, tmax 60) : **code 0**, 3 générations en 35 min. Identité IDENTIQUE sur les 3 graines ; génération 0 (20 courses, une validation
séquentielle arrêtée au 1ᵉʳ regard, le coffre) ; générations 1 et 2 (18 courses chacune) : les courses demandées par pilote, du plus long attendu
(le témoin, 60 s en génération 0) au plus court (a1996dd2, 27,9 s), dans cet ordre au journal ; renvois : les deux mutants g0 en génération 1, les deux
enfants nés en 1 renvoyés en 2 (âge 1), aucun nouveau-né renvoyé à sa naissance ; les réels mutés des quatre naissances sont tous des réels lus. `evoluer.test.js`, `courses.test.js`, `identite.test.js` n'ont pas été lancés (ils
écrivent dans des dossiers communs ; m6 montre que le texte des pilotes ne change pas, donc l'identité non plus).

## Ce qui reste, ce que je n'ai pas vérifié

- `tableau.js:256` dit encore « Un nouveau-né est protégé tant qu'il n'a pas 24 courses » (`cfg.protectionCourses||24`) : à reformuler (« pendant sa première
  génération ; parent deux générations après sa naissance ») par l'intégrateur, ce n'est pas mon fichier. `INTERFACES.md` § 2.5 (graines), § 3.1
  (`protectionCourses` → `protectionGenerations`, `ordreCourses`, `graines.entrainement.suite`, `graines.auBout`), § 3.4 (`graines.blocs`), § 6.1 (étape 6,
  le renvoi), § 6.2 (le tournoi, l'urne de `muter`) : à reprendre ; je n'ai corrigé que la phrase fausse du § 9.3.
- Le gain de A6 n'est pas mesuré ici (la synthèse : 0,2 % mesuré sur le Xeon) ; « le temps inoccupé en fin de génération » dans `sortie.log` le dira.
- L'effet de C2 sur la **sélection** (et pas sur les tirages) n'est pas montré : la synthèse le dit déjà (le seul « nul exact » observé ne portait aucun gène
  muet). En v:2, +37 % de réels actifs par naissance (26,7 % perdus), au moins 2 % de naissances muettes en moins.
- Un drapeau allumé **dans** une naissance garde les réglages du parent (ou leur naissance) : ce sont les enfants suivants qui les feront muter. Voulu (la
  consigne : l'urne se décide chez le parent), à savoir.
- La suite s'arrête à 999 999 984, sous 2³¹ : je n'ai pas cherché si deux graines dont l'écart est un multiple de 0x6D2B79F5 (le pas de mulberry32) donnent
  des courses voisines — c'était déjà vrai des graines d'avant, et une course tire bien plus de nombres que ce décalage.
- `tests/etat-v2-ancien` est une copie de `essais/tests-evoluer/etat` (dossier ignoré par git) ; je ne sais pas à quel commit exact il a été écrit (le
  27/11 vers 23 h 20, génome v:2, avant le portage).

## Relecture (28/11/2026, le relecteur du lot « règles »)

Relu ligne à ligne : `git diff 7b1df608e` de `genome.js`, `graines.js`, `evoluer.js` (A4, A6, M6 ; la validation du lot « sacre » n'est pas à moi),
`config.json`, `config-essai.json`, les tests neufs, cette note. Cherché à réfuter ; ce qui tient, ce que j'ai corrigé, ce qui reste.

**Refait par un chemin indépendant** (mes scripts dans `essais/relecture-regles/`, hors git, aucune course) :
- **M6** (`verif-graines.js`, l'ancien `graines.js` tiré de 7b1df608e) : 90 générations à 12 graines **identiques au bit près** à l'ancien code ; la 91ᵉ
  garde sa 1ʳᵉ graine (916068) puis passe à la suite (1003203…) quand l'ancien rejouait (913256…) ; 3 000 générations (8 et 12 graines, l'état écrit
  puis relu en JSON à chaque fois comme `population.json`) mêlées de validations de 24 à 96 graines : 32 000 graines, 0 doublon, 0 hors plage, 0 sur la
  plage de validation, 0 croisement avec les 10 296 graines de validation, `blocs` 29 ; au bout (une suite courte de 2 501 graines, deux blocs pleins et un
  partiel) : exactement 1 081 + 2 501 graines distinctes, puis `GRAINES_EPUISEES`, `grainesRestantes` juste à l'unité.
- **A6, le tri de `noterTous`** (`verif-ordre-note.js`, les 48 vraies courses de `essais/regles/vrai`) : sans tri, **10 mélanges sur 10** changent la
  note (`se_F` jusqu'à 1,06 d'écart, config-essai, `bootstrapE` 50) ; avec `ordreLignes`, 0 sur 10. Le tri était donc nécessaire et il suffit. Au passage :
  l'ancien code donnait déjà une note différente après une reprise (ordre du fichier contre ordre d'arrivée).
- **C2** : relu dans `modele.js` le lieu de lecture de chacun des 30 réels de `GARDES` (l. 218-219, 230-236, 247-248, 254, 305, 336, 430, 434,
  447-451, 474-478, 485) : chacun n'est lu que sous son drapeau, `largeT1/largeT2` seulement quand `large` est vrai (donc `largeOn`), `retourPrime`
  seulement pour `retour<i>`, `i < R.retours.length` ; la table est juste. Mais **le « 0 % après » de `mesure-muettes.js` et de (m5) se mesure avec la
  table elle-même** : il est vrai par construction ; la preuve que la table est complète et juste, ce sont (m2) et (m3) sur des vues, et cette lecture.
- Les flux de `Math.random` (`verif-mulberry.js`) : voir « ce qui reste ».

**Corrigé en place** (marqué « le relecteur du lot « regles » », 28/11) :
- `tableau.js` l. 256 : la page disait « protégé tant qu'il n'a pas 24 courses » ; elle dit la règle de l'âge (`protectionGenerations`).
- `INTERFACES.md` : § 2.5 (`grainesEntrainement` : les blocs de la suite, `GRAINES_EPUISEES`), § 3.1 (`protectionCourses` barré →
  `protectionGenerations`), § 6.1 étape 6 (le renvoi par l'âge), § 6.2 (le tournoi par l'âge, l'urne `reelsLus` de `muter`). Restent à écrire par
  l'intégrateur : `ordreCourses`, `graines.entrainement.suite`, `graines.auBout` dans la table du § 3.1, `graines.blocs` au § 3.4, et la ligne du § 9.1
  sur `protectionCourses` 6 de l'essai (l. 401 : historique, laissée).

**Tests relancés** : les 16 rapides, plus `genes-muets` et `validation-sequentielle` : tous passent. Quatre (`traces`, `relecture-traces`,
`integration`, `portage`) ont échoué au premier passage sur des dossiers partagés pendant que d'autres relecteurs lançaient les mêmes tests
(`EPERM` sur `%TEMP%\cashcar-traces-test`, « archives manque dans l'archive ») ; relancés seuls, ils passent (87/87, 95/95, 29/29, 11/11).

**Ce qui reste, ce que je n'ai pas pu trancher** :
- **Les flux de mulberry32 se recouvrent dans la grande plage.** Le jeu (`SEED_CODE`, `ml/reel/sim-env-reel.js`) part de `a = graine|0` et ajoute
  0x6D2B79F5 à chaque tirage : deux graines dont l'écart vaut k·0x6D2B79F5 (mod 2³²) jouent le **même ruban** de nombres décalé de k tirages. Dans
  l'ancienne plage (40 000 de large), le plus petit tel décalage entre deux graines d'entraînement était de 2,3 millions de tirages ; dans la suite,
  pour les graines réellement atteintes (les blocs avancent dans l'ordre), il est de 14 173 tirages après 1 000 générations (deux graines distantes de 69 375),
  265 après 100 000 ; entre une graine d'entraînement et l'une des 20 000 premières de validation : 2 284 tirages vers 10 000 générations. Ce n'est
  pas une même course (le jeu consomme ses nombres selon son état ; un décalage mélange leurs usages), et je n'ai joué aucune course pour le mesurer.
  Si l'on veut l'écarter tout à fait : un pas de suite dont les multiples restent loin des k·0x6D2B79F5 petits, ou passer la graine par un hachage
  dans `enfant.js` (époque nouvelle : décision de Sacha, pas de ce lot).
- `naissances` : l'avertissement « moins de 20 générations » a son 20 en dur (pas dans la config) ; sans conséquence.
- A4 rend renvoyable dès la 1ʳᵉ génération d'une époque neuve un pilote qui n'a que 12 courses dans l'époque (l'ancienne règle n'en renvoyait aucun) :
  voulu par la règle de l'âge, mais c'est un changement de comportement que la synthèse ne nomme pas.
- Les tests lents (`evoluer`, `courses`, `identite`) : pas relancés ; la marche de 3 générations de l'auteur (`essais/regles/vrai.log`) non rejouée.
