# Le banc des gènes (28/11/2026)

## En une minute

**La question.** Le pilote que la sélection naturelle fait évoluer porte neuf « interrupteurs », tous éteints à la naissance : cinq gestes copiés sur
les vrais joueurs (lâcher le volant juste avant de se poser, le slalom, le petit coup de nitro en vol, garder la nitro un instant après le décollage,
laisser la ligne suivre la glisse après la pose) et quatre idées venues de la boucle payante (fuir vite quand on passe sous la route, décoller nitro
allumée au bord, des figures dans les vols bien partis, tenir la nitro plus longtemps en virage). On ne sait d'aucun s'il aide. La sélection les
essaie au hasard, mais une course est si capricieuse (le hasard d'une seule course vaut environ 3 paliers) qu'elle ne peut pas le voir seule.

**La méthode, en trois phrases.**
1. On fabrique 13 pilotes (des « bras ») : le pilote de départ (c0025, tout éteint), puis le même avec UN interrupteur allumé, et quelques mélanges.
2. Chaque bras joue les MÊMES 96 courses (mêmes graines : même tirage des maps, même route), sur une plage de graines que la sélection n'utilise jamais.
3. Pour chaque bras, on regarde graine par graine s'il va plus loin ou moins loin que le pilote de départ : c'est la différence « appariée », qui
   retire de la comparaison tout le hasard que les deux courses partagent.

**Lire le tableau** (`sorties/resume.txt`).
- `d palier` : de combien de paliers le bras fait mieux (+) ou moins bien (−) que le départ, en moyenne sur les graines. Entre crochets, l'intervalle
  à 95 % : si les deux bornes sont du même côté de zéro, l'effet est probablement réel.
- `mieux/pareil/moins` : sur combien de graines il fait mieux, pareil, moins bien.
- `identiques` : le nombre de courses EXACTEMENT les mêmes que celles du départ. Un interrupteur qui ne se déclenche jamais donne 96/96 : il ne peut
  ni aider ni nuire sur ces maps.
- `E` : l'écart aux joueurs (plus bas = conduite plus humaine). `F = palier − 4 × E` : la note de la sélection. `dF` : la différence de note avec le départ.
- Le verdict : « aide » ou « nuit » seulement si l'intervalle à 95 % (du palier ou de dF) exclut zéro ; sinon « on ne sait pas », avec le nombre de
  graines de plus qu'il faudrait pour trancher.

**Ce qu'on ne pourra pas conclure.**
- 12 bras comparés en même temps : même si aucun interrupteur ne faisait rien, on aurait environ une chance sur deux de voir au moins un « aide » ou un
  « nuit » par hasard. Le résumé dit donc aussi combien de verdicts tiennent au seuil corrigé (Bonferroni : 5 % divisé par 12). Un « aide » qui ne
  passe pas ce seuil est une piste, pas une preuve.
- « On ne sait pas » ne veut pas dire « ne fait rien » : avec 96 graines, on ne voit qu'un effet d'environ 1 palier ou plus.
- Un bras est mesuré seul, sur le pilote de départ. Un interrupteur qui n'aide pas seul peut aider avec un autre (c'est pour cela qu'il y a les bras
  `gestes5`, `c0026` et `c0101`), et un interrupteur qui aide sur c0025 peut ne rien apporter sur un autre pilote.
- Les réglages de chaque interrupteur sont à leur valeur de naissance : un interrupteur qui « ne sait pas » ou « nuit » avec ces réglages pourrait
  aider avec d'autres. Le banc ne règle rien, il allume.

## Les bras

| bras | ce qui change par rapport au départ |
|---|---|
| `depart` | rien : le génome du témoin c0025 (`Gn.genomeTemoin`, témoin `c0025`), le pilote que la sélection écrit pour lui |
| `lacheOn` | geste 1 : `lacheOn` 0 → 1 (`lacheAvant` à sa naissance, 0,35 s) |
| `slalomOn` | geste 2 : `slalomOn` 0 → 1 (`slalomCap` 0,35, `slalomDemi` 0,45, `slalomH` 3) |
| `coupOn` | geste 3 : `coupOn` 0 → 1 (les neuf réglages du coup à leur naissance, `coupDecor` 0) |
| `relacheOn` | geste 4 : `relacheOn` 0 → 1 (`relacheT` 0,25 s) |
| `suitOn` | geste 5 : `suitOn` 0 → 1 (`suitDerive` 0,3, `suitMarge` 0,25) |
| `gestes5` | les cinq gestes allumés ensemble |
| `fuirVite` | l'idée de c0026 seule : `fuirVite` 0 → 1 |
| `c0026` | l'étape c0026 entière : `fuirVite` 0 → 1, `dessousMax` 0,8 → 0,4, `dessousPose` 25 → 40 (même génome que `Gn.genomeTemoin` témoin `c0026`) |
| `bordOn` | l'idée de c0064 : `bordOn` 0 → 1 (`bordNitro` 0,7, `bordJauge` 0,5) |
| `largeOn` | l'idée de c0072 avec les réglages de c0101 : `largeOn` 0 → 1 (`largeHaut` 4, `largeT1` 2,2, `largeT2` 1,8, `largeAxe` 0,5, `largeAir` 1,5, `largeMax` 3) |
| `libreOn` | l'idée de c0087 : `libreOn` 0 → 1 (`nitroLibreK` 1,25, `tenirLibre` 0,05) |
| `c0101` | le génome du témoin c0101 : les quatre idées et les deux réglages de c0026 |

Les réglages d'un interrupteur ne changent rien tant qu'il est éteint ; allumé, il apporte ses réglages de naissance (`ml/evolution/genome.js`,
`GESTES` et `PORTAGE`). Le détail exact de chaque bras (gènes changés, identifiant du génome, sha du pilote) est écrit par `jouer.js` dans `etat/bras.json`.

## Les commandes

La mesure (13 bras × 96 graines = 1 248 courses, plus 2 courses de contrôle ; 4 à la fois) :

    node ml/ecurie/etude/banc-des-genes/jouer.js --travailleurs 4 --graines 96
    node ml/ecurie/etude/banc-des-genes/analyser.js

- **Reprendre** : relancer la même commande. Une course déjà mesurée vient du cache de `etat/` et n'est pas rejouée — dans la même époque des courses
  seulement : si `ml/evolution/modele.js` ou `enfant.js`, le jeu, les yeux ou la version de Node changent, tout est rejoué (jouer.js le dit au lancement ;
  le piège vu au coffre de la boucle payante, voir `../boucle-payante-ryzen/coffre/LISEZ-MOI.md`, « Relecture »).
- **Arrêter proprement** : créer un fichier vide `etat/STOP`. Les courses en cours finissent, rien d'autre ne part, STOP est effacé, code de sortie 3.
  Ctrl+C fait de même (un second Ctrl+C tue les courses en cours). Les courses partent graine par graine (les 13 bras sur la graine 1, puis sur la
  graine 2…) : un arrêt laisse des graines complètes pour tous les bras, sauf la dernière.
- **Vérifier sans jouer** : `node ml/ecurie/etude/banc-des-genes/jouer.js --verifier` écrit `etat/bras.json` et refait les contrôles des bras.
- **Options** : `--bras lacheOn,bordOn` (un sous-ensemble ; `depart` est toujours joué), `--depart 3000000` (la première graine ; jamais sous
  2 000 000), `--etat dossier` (un autre dossier d'état, pour un essai), `--epoque id` pour analyser.js (sinon : l'époque du jour si elle a des courses,
  sinon la plus fournie), `--sorties dossier`.

Les graines : 3 000 000 + 37 × j (j = 0 … 95), une plage à part : l'entraînement de la sélection est en 910 000…, la validation en 950 000… et à partir
de 1 000 000, le coffre en 990 000…. tmax (900 s) et régime (allégé) : ceux de `ml/evolution/config.json`.

## Les contrôles faits à chaque lancement

- Le témoin c0025 a ses neuf interrupteurs à 0 et tous leurs réglages à la naissance.
- Le pilote du bras `depart` est exactement celui que la sélection écrit pour le témoin (`Gn.ecrirePilote(Gn.genomeTemoin(cfg), {cfg})`, comme
  `evoluer.js`) et son génome garde l'identifiant du témoin, `19e3767cc346`.
- Les bras `c0026` et `c0101` ont le même génome que `Gn.genomeTemoin` pour ces témoins.
- Chaque bras diffère du départ, et les 13 pilotes sont différents.
- En course : `ml/ecurie/pilote-voltige.js` (le c0025 écrit à la main) joue les deux premières graines ; ses empreintes doivent être celles du bras
  `depart` (dernière ligne de `resume.txt`).

Un contrôle raté : rien n'est joué, code 2.

## Les fichiers

- `jouer.js` : les courses, par l'ordonnanceur de `ml/evolution/courses.js` (un processus neuf par course, priorité basse, chien de garde, cache),
  avec un dossier d'état à lui (`etat/`, jamais `ml/evolution/etat`) et un verrou (`etat/verrou.json`) contre deux lancements sur le même état.
- `analyser.js` : les chiffres (`sorties/resume.txt`, `sorties/resultats.json`). Bootstrap apparié sur les graines (4 000 tirages, hasard tiré de
  `graines.rngDe` : rejouer redonne les mêmes chiffres), test du signe exact, `note.noter` et `note.comparer` de la sélection.
- `etat/bras.json` : les bras (gènes changés, génome, sha du pilote), les contrôles, et l'historique des pilotes qu'a portés chaque nom.
- `etat/courses-AAAA-SS.jsonl` : une ligne par course (écrites par `courses.js`). `etat/pilotes/` (les textes des pilotes), `etat/verrou.json*` et
  `etat/STOP` ne vont pas dans git.

## Les résultats

La mesure est finie : voir « Le résultat (28/11/2026) », juste après.

## Le résultat (28/11/2026)

La mesure est allée au bout : 13 bras × 96 graines = 1 248 courses, plus les 2 courses de contrôle, aucune course ratée (`jouer.log`, dernière
ligne : 1 250 sur 1 250, fin à 10 h 45). Le contrôle passe : sur les deux premières graines, `pilote-voltige.js` rejoue exactement les courses du bras
`depart`. Les chiffres viennent de deux fichiers : `sorties/resume.txt` (`analyser.js`) et `sorties/composantes.txt` (`composantes.js`, qui découpe
l'écart E mesure par mesure et regarde d'où vient le palier, sans jouer une course). Un second agent a refait les calculs avec ses propres scripts ;
là où il a affaibli une phrase, c'est sa version qui est écrite ici.

Deux rappels pour lire. **E**, l'écart aux joueurs, vaut 0 au milieu des vrais joueurs : plus il est bas, plus la conduite est humaine. **F**, la note
de la sélection, vaut le palier moins 4 fois E : plus haut = mieux.

### Ce que le banc dit

- **Sur le palier et sur la note F, il ne tranche rien.** Trois verdicts sortent à 95 % (bordOn et fuirVite « aident », gestes5 « nuit »), mais aucun ne
  tient au seuil corrigé (Bonferroni, 0,42 % par bras) : ce sont des pistes, pas des preuves.
- **Sur la ressemblance, il tranche.** Trois bras rendent sûrement la conduite plus proche des joueurs : slalomOn (E passe de 0,882 à 0,707),
  bordOn (à 0,728) et les cinq gestes ensemble, gestes5 (à 0,665). c0101 aussi (à 0,765), mais moins nettement.
- **On sait d'où vient ce gain.** slalomOn et gestes5 corrigent la durée de l'aller du slalom ; bordOn et c0101 corrigent la nitro au décollage. Ce
  sont justement les deux mesures qui pesaient le plus dans le E du pilote de départ.
- **Ce gain n'est pas un effet de comptage.** E ne lit que les courses de 60 s ou plus (79 courses sur 96 pour le départ, de 75 à 80 selon le bras).
  Recalculé sur les seules graines qui comptent chez les deux pilotes, l'écart change d'au plus 0,015 (gestes5). Le relecteur a aussi vérifié que le
  gain ne vient ni de courses plus longues, ni de mesures manquantes.
- **Le slalom coûte de l'allure.** slalomOn et gestes5 roulent environ 25 km/h moins vite, et E ne le voit pas (plus bas, « Le prix en palier »).

### Ce que le banc ne dit pas

- **Un petit effet sur le palier.** « On ne sait pas » ne veut pas dire « ne fait rien » : à 96 graines, un effet de moins d'environ un palier passe
  inaperçu.
- **Ce que donnent slalomOn et bordOn ensemble.** Aucun bras n'allume les deux. Chacun agit sur une mesure différente, mais leur palier commun est
  inconnu.
- **Sur quelle map un bras gagne ou perd.** La ligne de course ne dit ni la map ni le biome : ce découpage est impossible avec ces lignes.
- **Quelle cause de mort explique une perte.** Quand un interrupteur change une course, la nouvelle course est presque un nouveau tirage : les graines
  où le départ allait loin perdent souvent, celles où il mourait tôt gagnent souvent, pour tous les bras (c'est la « régression vers la moyenne »).
  Ranger les graines par cause de mort montre surtout cela. Seul le total sur les 96 graines mesure un effet.
- **Si l'œil voit le slalom.** slalomOn fait alterner le cap, et la mesure qu'il améliore est la durée d'un aller : il fabrique exactement ce qu'on
  mesure. En même temps, il éloigne un peu d'autres mesures des joueurs : la nitro (de −0,95 à −1,34 écart-type des joueurs) et l'ondulation (de
  +1,71 à +2,08). C'est un gain sur la mesure ; rien ne prouve qu'un spectateur le verrait.

### Le tableau des bras

`identiques` : courses exactement pareilles à celles du départ, sur 96. `d palier` et `dF` : la différence moyenne avec le départ, graine par graine, et
son intervalle à 95 %. `dE` : la différence d'écart aux joueurs (négatif = plus humain), avec son erreur-type (se) entre parenthèses.

| bras | identiques | d palier [IC 95 %] | E | dE (se) | dF [IC 95 %] | ce qu'on peut en dire |
|---|---|---|---|---|---|---|
| `depart` | 96 | (palier moyen 6,83) | 0,882 | | | la référence |
| `slalomOn` | 1 | −0,50 [−1,27 ; +0,28] | 0,707 | −0,175 (0,033) | +0,20 [−0,68 ; +1,08] | plus humain, sûr ; palier : on ne sait pas |
| `bordOn` | 34 | +0,52 [−0,20 ; +1,28] | 0,728 | −0,155 (0,027) | +1,14 [+0,31 ; +1,97] | plus humain, sûr ; F meilleure : une piste, pas au seuil corrigé |
| `gestes5` | 1 | −0,75 [−1,42 ; −0,03] | 0,665 | −0,218 (0,035) | +0,12 [−0,66 ; +0,90] | plus humain, sûr ; palier perdu : une piste, pas au seuil corrigé |
| `c0101` | 18 | −0,21 [−1,01 ; +0,58] | 0,765 | −0,118 (0,031) | +0,26 [−0,63 ; +1,15] | un peu plus humain ; ne va pas plus loin que le départ |
| `suitOn` | 9 | +0,59 [−0,20 ; +1,38] | 0,840 | −0,042 (0,033) | +0,76 [−0,13 ; +1,66] | on ne sait pas |
| `fuirVite` | 66 | +0,36 [−0,01 ; +0,77] | 0,863 | −0,020 (0,011) | +0,44 [+0,01 ; +0,88] | F meilleure : une piste, pas au seuil corrigé |
| `lacheOn` | 16 | +0,10 [−0,67 ; +0,84] | 0,806 | −0,076 (0,030) | +0,41 [−0,40 ; +1,22] | aucun effet sûr, ni sur E ni sur le palier |
| `c0026` | 33 | −0,09 [−0,73 ; +0,53] | 0,902 | +0,020 (0,028) | −0,17 [−0,86 ; +0,51] | aucun effet sûr |
| `coupOn` | 59 | +0,08 [−0,34 ; +0,50] | 0,883 | +0,000 (0,020) | +0,08 [−0,37 ; +0,53] | change peu de courses ; aucun effet sûr |
| `relacheOn` | 45 | +0,01 [−0,54 ; +0,55] | 0,868 | −0,014 (0,024) | +0,07 [−0,51 ; +0,64] | change peu de courses ; aucun effet sûr |
| `largeOn` | 93 | +0,16 [+0,00 ; +0,40] | 0,879 | −0,003 (0,003) | +0,17 [−0,06 ; +0,40] | ne change presque aucune course |
| `libreOn` | 83 | −0,15 [−0,45 ; +0,18] | 0,895 | +0,013 (0,009) | −0,20 [−0,49 ; +0,09] | ne change presque aucune course |

Pour lacheOn, `resume.txt` donne un dE de −0,076, mais il ne passe même pas le seuil d'une famille de 12 comparaisons : on ne peut pas dire que
lacheOn rapproche des joueurs.

### Les mesures qui bougent

E est une somme de quinze termes, un par mesure ; un terme ne compte que si le bot sort de la dispersion des joueurs eux-mêmes. Dans le E du départ
(0,882), deux termes font plus de la moitié : **l'aller du slalom, 0,284**, et **la nitro au décollage, 0,248**. Viennent ensuite les raccourcis
(0,100), le temps en l'air (0,082) et la hauteur des vols (0,061) (`composantes.txt`, partie 1).

- **L'aller du slalom** (le temps pour passer d'un côté de la route à l'autre) : 0,982 s pour le départ, 0,576 s pour les joueurs. Avec slalomOn,
  0,808 s ; avec gestes5, 0,791 s. Le terme passe de 0,284 à 0,129 (slalomOn) et à 0,115 (gestes5).
- **La nitro au décollage** (la part des vols commencés nitro allumée) : 0,149 pour le départ, 0,625 pour les joueurs. Avec bordOn, 0,286 ; avec
  c0101, 0,284. Le terme passe de 0,248 à 0,155 (bordOn) et à 0,156 (c0101).
- **Le temps en l'air**, avec gestes5 : le terme passe de 0,082 à 0,018.
- **En contrepartie**, slalomOn et gestes5 éloignent un peu la nitro des joueurs : ce terme passe de 0,000 à 0,026 et à 0,027.
- **Les gros gains survivent aux mélanges.** Dans gestes5, l'aller gagne −0,169 (contre −0,155 pour slalomOn seul) ; dans c0101, la nitro au décollage
  gagne −0,092 (contre −0,094 pour bordOn seul). Mais le mélange ne fait pas toute la somme de ses morceaux : gestes5 gagne −0,218 en E, alors que les
  cinq gestes seuls, additionnés, donnaient −0,306.
- `composantes.txt` marque les mesures qui bougent avec un seuil corrigé pour le nombre de comparaisons. Le relecteur juge ce compte trop petit (on a
  regardé d'autres tableaux encore) ; tout ce qui est donné comme sûr dans cette partie passe aussi son seuil, plus sévère, sauf le E de c0101,
  d'où le « moins nettement ».

### Le prix en palier des gestes

- **Le palier.** gestes5 perd 0,75 palier [−1,42 ; −0,03] : 49 graines moins bien, 29 mieux, 18 pareil. slalomOn perd 0,50 [−1,27 ; +0,28]. Ni l'une ni
  l'autre perte ne tient au seuil corrigé.
- **La survie.** Aucun effet visible : slalomOn +3,9 s [−14,5 ; +22,7], gestes5 −0,4 s [−15,6 ; +15,9]. Un effet d'une quinzaine de secondes, dans un
  sens ou dans l'autre, reste possible.
- **La vitesse.** Le fait le plus net : au sol, pendant les deux premières minutes, le départ roule à 409 km/h, slalomOn à 386 km/h et gestes5 à
  384 km/h (les joueurs : 450 km/h). Graine par graine, c'est −24,2 km/h (se 4,1) et −26,5 km/h (se 3,5). bordOn, suitOn et lacheOn ne changent pas
  la vitesse.
- **Le rythme.** Sur les graines où les deux courses durent au moins 60 s, gestes5 passe de 3,354 à 2,941 paliers par minute. Pour slalomOn (de 3,330
  à 2,972), la baisse est probable mais moins nette : elle ne passe pas le seuil le plus sévère.
- **E ne fait pas payer ce ralentissement.** Le terme « vitesse » de E reste dans la zone où un écart ne compte pas (de −0,60 à −0,95 écart-type des
  joueurs, la zone s'arrête à 1). Le slalom gagne donc en ressemblance et perd en allure, sans que la note E le voie.
- **Les deux perdent sur les mêmes graines** (corrélation 0,586 ; 34 graines perdues par les deux). Les grosses pertes, de 5 paliers ou plus, tombent
  sur des graines où le départ allait loin : c'est la régression vers la moyenne, et aucune graine ni aucune cause de mort n'en ressort comme
  « coupable ».

### slalomOn et bordOn ensemble ?

Ils jouent sur des mesures séparées : l'aller du slalom bouge de −0,155 avec slalomOn et de −0,008 avec bordOn ; la nitro au décollage, de −0,027 et de
−0,094. Si tout s'additionnait, leur E gagnerait la somme des deux, −0,175 et −0,155. Pour le palier, on ne sait rien : bordOn change la course sur
62 graines, et slalomOn change aussi ces 62-là. Le bras slalomOn + bordOn est la prochaine course à jouer, pas une conclusion.

### Ce que l'on en fait

1. **Aucun interrupteur n'est allumé à la naissance** sur la seule foi de ce banc.
2. **bordOn, slalomOn, suitOn et fuirVite passent en vague de confirmation**, sur des graines neuves, avec le banc plus fin (`ml/evolution/banc`, en
   cours d'écriture). Le critère est annoncé avant de jouer : dF pour bordOn, suitOn et fuirVite ; dE avec un garde-fou de palier pour slalomOn. La
   vague ajoute le bras bordOn + slalomOn, que ce banc n'avait pas.
3. **c0101 est confirmé une troisième fois** comme n'allant pas plus loin que c0025.
4. **coupOn, relacheOn, largeOn et libreOn** ne changent presque aucune course : ils restent éteints et ne sont pas rejoués.

Les autres bras (lacheOn, gestes5, c0026) ne sont pas dans cette vague.

### Les fichiers du résultat

- `sorties/resume.txt` et `sorties/resultats.json` : les verdicts (`analyser.js`).
- `composantes.js`, puis `sorties/composantes.txt` et `sorties/composantes.json` : les termes de E, les courses comptées, le palier découpé, les
  mélanges et le prix des gestes. Il ne joue aucune course et refait ses contrôles (la somme des termes doit redonner le E de `note.js`) :
  `node ml/ecurie/etude/banc-des-genes/composantes.js`. Deux lancements donnent les mêmes octets.
