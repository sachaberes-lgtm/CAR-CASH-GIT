# La prédiction de la ville, écrite avant de jouer (28/11/2026, le mesureur)

Écrit **avant** de lancer les 16 courses de ville neuves (`node mesurer.js --lot ville`). Aucune de ces courses n'avait tourné quand ce fichier a été écrit.
Rien ici ne sera retouché après les courses ; le résultat sera écrit ailleurs (`sorties/ville.txt`), jugé par la règle ci-dessous.

## Ce qu'on compte

- **Les courses** : 16 courses de c0025 (génome `19e3767cc346`) en ville **tenue** (la ville à chaque portail), 180 s au plus, diagnostic étendu
  (`course-diag.js --diag 1`). Graines **3 963 000 + 37 × i, i = 400 à 415** (3 977 800 à 3 978 355). Vérifié avant de jouer : aucune de ces graines
  n'apparaît dans `../../sortie-preparee/sorties/` (celles-là vont de 3 970 400 à 3 970 659), ni ailleurs dans `ml/` (recherche du nombre exact).
- **Une sortie voulue** : un décollage que `volsDe` (`../../sortie-preparee/analyser.js`, lu tel quel) marque `voulu` avec un raccourci engagé
  (`raccourci`, le champ `D.so` du pilote à la dernière vue au sol). Elle est **mortelle** si le vol finit par une mort (`issue.k === 'mort'`).
- **Vrai raccourci / sortie du dessous** : `raccourci.d` faux / vrai (le raccourci est engagé depuis le dessous de la dalle). Comptés à part, puis ensemble.
- **Le côté bordé, la définition exacte de `../concepteur-libre/cote-borde.js` (non retouchée)** : à la vue au sol de l'engagement (la vue dont `t`
  est à moins de 0,026 s de `raccourci.t0`), on lit les sorties du côté choisi (`Sg` si `raccourci.c > 0`, sinon `Sd`) et leurs rayons `rien` et `plane` :
  - **bordé** : `rien` ET `plane` finissent en `choc` ;
  - **mi-bordé** : l'un des deux seulement ;
  - **ouvert** : aucun des deux ;
  - pas de rayons à cette vue : non classé.
  Le mi-bordé et le non classé sont donnés à part ; ils n'entrent ni dans « bordé » ni dans « ouvert ». (Dans la mesure d'avant, en ville, aucune sortie n'était mi-bordée.)

## La prédiction

**Sur les 16 courses neuves seules : au moins trois fois plus de morts par sortie voulue côté bordé que côté ouvert**,
c'est-à-dire (morts bordées / sorties bordées) ≥ 3 × (morts ouvertes / sorties ouvertes).

## Ce qui la jugera (règle fixée ici)

Soit a morts sur b sorties bordées, c morts sur d sorties ouvertes ; le rapport = (a/b) / (c/d) (infini si c = 0 et a ≥ 2 ; 0 si a = 0).
- **CONFIRMÉE** : rapport ≥ 3 **et** Fisher unilatéral (bordé plus mortel) p ≤ 0,05.
- **RÉFUTÉE** : rapport < 1,5 (0 mort bordée compris), avec au moins 10 sorties de chaque côté.
- **INDÉCISE** : tout le reste (rapport ≥ 3 sans p ≤ 0,05 ; rapport entre 1,5 et 3 ; moins de 10 sorties d'un côté).
L'ensemble (les 8 courses de ville d'avant + les 16 neuves) sera donné aussi, **mais il ne juge rien** : les 8 d'avant ont fait naître l'hypothèse
(le découpage est né sur leurs 3 morts du dessous, § 6 de `../LISEZ-MOI.md`).

## La puissance (calculée avant, grossièrement)

`node puissance-ville.js` → `sorties/puissance-ville.txt`. Modèle calé sur les 8 courses de ville d'avant : une sortie voulue toutes les 24 s
(22 en 528 s), moitié bordées ; une autre mort environ toutes les 176 s ; tmax 180 s ; une mort sur sortie voulue arrête la course. 20 000 tirages de 16 courses.

| hypothèse (mort par sortie bordée / ouverte) | sorties attendues (bordées / ouvertes) | morts attendues (bordées / ouvertes) | CONFIRMÉE | RÉFUTÉE | INDÉCISE |
|---|---|---|---|---|---|
| comme avant (0,45 / 0,03) | 20 / 20 | 9,0 / 0,6 | 94 % | 0 % | 6 % |
| rapport 6 (0,30 / 0,05) | 23 / 23 | 7,0 / 1,2 | 62 % | 3 % | 35 % |
| rapport 3 (0,24 / 0,08) | 24 / 24 | 5,8 / 1,9 | 30 % | 16 % | 54 % |
| rapport 3, plus rare (0,15 / 0,05) | 28 / 28 | 4,2 / 1,4 | 19 % | 21 % | 61 % |
| rapport 2 (0,20 / 0,10) | 25 / 25 | 4,9 / 2,5 | 14 % | 33 % | 52 % |
| aucun écart (0,15 / 0,15) | 25 / 25 | 3,7 / 3,7 | 2 % | 70 % | 28 % |
| aucun écart, rare (0,08 / 0,08) | 30 / 30 | 2,4 / 2,4 | 1 % | 67 % | 32 % |

**Ce que cela veut dire** : on attend de l'ordre de 40 à 55 sorties voulues et 4 à 10 morts sur sortie voulue. Si l'écart d'avant est vrai et aussi
fort (rapport de l'ordre de 6 ou plus), 16 courses le confirment une fois sur deux à neuf fois sur dix. **Si le vrai rapport est juste 3, 16 courses
ne le confirment qu'environ une fois sur trois à cinq** (et le réfutent à tort une fois sur cinq) : une issue « indécise » sera alors le cas le plus probable.
S'il n'y a aucun écart, la règle le réfute environ 7 fois sur 10. Le modèle est grossier (les sorties ne sont pas indépendantes, la part bordée n'est pas forcément la moitié).
