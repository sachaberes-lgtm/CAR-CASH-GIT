# La lecture du banc des gènes : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `banc-des-genes-lecture` (wf_f91dd3e4-3e4), lancée par la session principale (Claude Fable).
- Agents : 3, tous du modèle claude-opus-5-5.
- Durée : 15 min ; jetons consommés par les agents : 481 454 (0,48 millions) ; appels d'outils : 53.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. analyste : calcule, bras par bras, le palier et les morceaux de l'écart aux joueurs, sans rejouer de course (phase « Analyse »)
2. relecteur : refait les calculs par un autre chemin et attaque les conclusions (phase « Relecture »)
3. rédacteur : écrit le résultat dans le LISEZ-MOI de l'étude, le journal et la passation (phase « Redaction »)

## 1. analyste

*Rôle : analyste : calcule, bras par bras, le palier et les morceaux de l'écart aux joueurs, sans rejouer de course. Phase : Analyse.*

COMPTE RENDU — composantes du banc des gènes (aucune course jouée, rien de commité)

FICHIERS ÉCRITS (seulement ceux-ci, tous dans ml/ecurie/etude/banc-des-genes/)
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\banc-des-genes\composantes.js : l'outil. Il lit etat/bras.json et etat/courses-*.jsonl. Il appelle le vrai code : ressemblance.ecart pour les z, note.referenceEpoque, note.ecartFoule et note.noter pour le contrôle, graines.rngDe pour le hasard. La seule chose recopiée est la somme de note.js eSimple (c_k = w_k·max(0,min(8,|z_k|)−1)/Σw, la mesure absente comptée au pire). Elle est vérifiée contre ecartFoule et noter à 1e-9 près. Si un contrôle rate, l'outil sort avec le code 2.
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\banc-des-genes\sorties\composantes.txt (sha1 8cd3c53c…) et sorties\composantes.json (sha1 6c48212f…). Ces sorties ne contiennent aucune date.
- Je n'ai pas touché à etat/, à resume.txt ni à resultats.json (leurs sha1 sont 95f8f63e… et 1b399279…). git status ne montre rien de nouveau hors du dossier banc-des-genes/, qui était déjà non suivi. Le fichier ml/bot/results/… était déjà là au départ.
- Fichiers de travail : <dossier temporaire>\scratchpad\banc-lecture\a.txt et a.json.

VÉRIFICATIONS
- Deux lancements donnent des sorties identiques octet pour octet (cmp sur le .txt et le .json), code de sortie 0, environ 8 s.
- Le E de chaque bras retombe sur celui de resume.txt / resultats.json à 0,001 près, pour les 13 bras (composantes.txt l.6-7, « TOUT PASSE »). Exemples : depart 0,8823 contre 0,882 ; slalomOn 0,7073 contre 0,707 ; bordOn 0,7277 contre 0,728. Σ c_k est égal exactement à note.ecartFoule et à note.noter.
- Le bootstrap est apparié : 2 000 tirages de graines, les mêmes pour les 13 bras. Les dE retrouvent ceux de resume.txt (par exemple slalomOn −0,175, se 0,034 contre 0,033 dans resume.txt ; composantes.txt l.50).

1. LES COMPOSANTES DE E
- Le E du départ (0,882) vient surtout de deux termes : l'aller du slalom 0,284 (z +4,69) et la nitro au décollage 0,248 (z −4,23) (composantes.txt l.23, 43, 13, 33). Viennent ensuite raccourcis 0,100, air 0,082 et volHaut 0,061 (l.9-26). Cela confirme le 0,29 / 0,24 de prochaines-idees.
- Nombre de comparaisons : 12 bras × 15 mesures = 180. Seuil de Bonferroni : 5 %/180, soit |z| > 3,64 (l.47-48). Le seuil d'une famille de 12 (|z| > 2,87) n'est donné que comme une piste.
- Ce qui bouge au seuil corrigé (l.62-72) :
  - slalomOn : aller −0,155 (se 0,012, z −13,1). L'aller moyen passe de 0,982 à 0,808 s (joueurs 0,576) : il reste à z +2,68, toujours le premier terme. En contrepartie, nitro +0,026 (z +5,6) : le slalom réduit la part de nitro.
  - gestes5 : aller −0,169 (z −15,8), air −0,064 (z −4,3), nitro +0,027, nitroSol +0,020, figures −0,009.
  - bordOn : nitroDecol −0,094 (se 0,014, z −6,8). La part des vols nitro allumée au décollage passe de 0,149 à 0,286 (joueurs 0,625).
  - c0101 : nitroDecol −0,092 (z −6,4), c'est le même effet que bordOn.
  - lacheOn : figures −0,009 (z −4,2), minuscule. Son dE de −0,076 est réparti sur air, aller et nitroDecol, dont aucun ne passe seul le seuil (l.49).
- Rien ne passe le seuil pour coupOn, relacheOn, suitOn, fuirVite, c0026, largeOn ni libreOn.
- Ce qui est sûr : le gain de E de slalomOn et de gestes5 vient de l'aller ; celui de bordOn et de c0101 vient de la nitro au décollage.

2. SUR COMBIEN DE COURSES E EST CALCULÉ
- La règle : E ne lit que les courses qui ont des mesures. ressemblance.mesuresPartie rend null sous 60 s de course ou sous 100 échantillons (ml/bot/ressemblance.js l.38), et enfant.js l.25 écrit cette valeur. Sous 5 parties, E vaut 4 (note.js l.93-104).
- Ici, toute course de 60 s ou plus a ses mesures et aucune course plus courte n'en a. D'où les 79 parties du départ sur 96 courses (resultats.json l.57, composantes.txt l.27).
- Nombre de parties par bras : de 75 à 80 (l.27).
- Recalcul sur les seules graines qui comptent chez les deux bras (composantes.txt l.75-89) :

| bras | dE, toutes les courses | dE, graines communes (se) [IC 95 %] |
|---|---|---|
| slalomOn | −0,175 | −0,172 (0,035) [−0,241 ; −0,101] |
| bordOn | −0,155 | −0,151 (0,028) |
| gestes5 | −0,218 | −0,203 (0,035) |
| c0101 | −0,118 | −0,121 (0,030) |
| lacheOn | −0,076 | −0,065 (0,029) [−0,118 ; −0,004] |

- La part due au choix des courses est au plus de 0,015 (gestes5) : aucun bras ne change E seulement en changeant quelles courses comptent. Le seul bras dont l'effet sur E fond un peu est lacheOn.
- Réserve : la condition « rester 60 s » est elle-même un effet du bras. Le sous-ensemble commun n'est donc pas parfaitement propre non plus ; les deux chiffres ensemble encadrent l'effet du choix des courses.

3. LE PALIER DÉCOUPÉ
- La ligne de course ne dit ni la map ni le biome (champs : palier, pièces, survie, cause, morts, vols, mesures, empreintes). Ce découpage est impossible avec les lignes actuelles.
- Sur les graines où la course diffère du départ (l.95-107) :

| bras | graines qui diffèrent | mieux / pareil / moins | gains / pertes (paliers) | d sur ces graines | p du signe |
|---|---|---|---|---|---|
| slalomOn | 95 | 37/9/49 | +123 / −171 | −0,51 | 0,235 |
| gestes5 | 95 | 29/17/49 | +94 / −166 | −0,76 | 0,031 |
| bordOn | 62 | 31/7/24 | +133 / −83 | +0,81 | — |
| fuirVite | 30 | 15/9/6 | — | +1,17 | — |
| libreOn | 13 | 3/2/8 | — | −1,08 | — |

- Sur ces graines, l'écart-type des différences vaut de 3,4 à 4,7 paliers.
- Les tableaux par cause de mort sont en l.109-167, par exemple bordOn : sur les graines où le départ mourait en « air », +66 paliers sur 21 graines (l.119).
- Mise en garde, écrite aussi dans la sortie (l.220-222) : une course qui diffère est presque un nouveau tirage. Ranger par l'issue du départ montre surtout la régression vers la moyenne. Tous les bras gagnent là où le départ mourait sous 60 s, par exemple slalomOn +39 sur 16 graines (l.139-151). Seul le total sur les 96 graines mesure un effet.

4a. slalomOn ET bordOn S'ADDITIONNENT-ILS ?
Ce que les bras permettent de dire :
- Sur E, les mélanges s'additionnent à peu près, sur les deux bras de mélange :
  - gestes5 : dE observé −0,218, somme des cinq gestes seuls −0,306, interaction +0,089 (se 0,074, IC [−0,075 ; +0,218]) (l.171).
  - c0101 : dE observé −0,118, somme de c0026, bordOn, largeOn et libreOn −0,125, interaction +0,008 (se 0,038) (l.175).
- Chaque gain survit au mélange : l'aller de slalom dans gestes5 (−0,169 contre −0,155), la nitro au décollage de bordOn dans c0101 (−0,092 contre −0,094) (l.54, 60).
- slalomOn et bordOn jouent sur des termes différents : aller −0,155 contre −0,008, nitroDecol −0,027 contre −0,094 (l.181, 187). Si tout s'additionnait, on attendrait dE ≈ −0,33.
- Mais le terme « air » sature : dans gestes5, interaction +0,075 (se 0,038). Le terme air du départ ne vaut que 0,082, et slalomOn (−0,055) et bordOn (−0,022) en prendraient −0,077. Le dE réel d'un bras slalomOn + bordOn serait donc un peu moindre ; ce n'est pas mesuré.

Ce que les bras ne permettent pas de dire :
- L'interaction slalomOn × bordOn elle-même : aucun bras n'a les deux.
- Le palier : les deux mélanges perdent sur le palier par rapport à la somme de leurs parties, gestes5 −1,04 (se 0,91) et c0101 −0,65 (se 0,49) (l.172, 176). Aucune des deux n'est significative : c'est une piste, pas une preuve.
- Le palier d'un bras slalomOn + bordOn reste inconnu : la somme des deux effets seuls donne environ +0,02, avec une incertitude d'au moins 0,55, sans compter l'interaction.
- Toute bordOn change de course sur 62 graines, et slalomOn change aussi la course sur ces 62 graines (l.189).

4b. LE PRIX EN PALIER DES GESTES
- Le fait le plus net : les gestes ne font pas mourir plus tôt, ils font avancer moins vite. Sur les graines où les deux courses durent 60 s ou plus (l.204-218) :

| bras | paliers par minute (départ → bras) | d (se) z | vitesse des deux premières minutes | d vitesse appariée (se) z | d survie |
|---|---|---|---|---|---|
| slalomOn | 3,330 → 2,972 | −0,358 (0,097) z −3,7 | 409 → 386 km/h | −24,2 (4,1) z −5,9 | +3,9 s |
| gestes5 | 3,354 → 2,941 | −0,413 (0,091) z −4,5 | → 384 km/h | −26,5 (3,5) z −7,6 | −0,4 s |
| bordOn, suitOn, lacheOn | — | — | — | z entre −0,2 et +0,7 | — |

- Le terme vitesse de E reste dans la zone morte (z −0,60 → −0,95, l.45) : E ne fait pas payer ce ralentissement. Le slalom gagne donc de la ressemblance sur l'aller et coûte de l'allure sans que la note le voie.
- Par cause et par graine :
  - Les d de slalomOn et de gestes5 sont corrélés, r 0,586. 34 graines perdent chez les deux (l.194).
  - Les grosses pertes (5 paliers ou plus) : slalomOn 13 graines, −89 ; gestes5 15 graines, −96. Elles tombent sur des graines où le départ allait loin, de 9 à 14 paliers (l.195-201). En face, les gros gains : slalomOn 9 graines, +63 ; gestes5 8 graines, +49. Ce découpage par graine est dominé par la régression vers la moyenne et ne désigne pas une graine « coupable ».
  - Par cause de mort du bras : slalomOn perd en « air » (−46 sur 18 graines, z −2,7) et gagne en « paroi » (+33 sur 15, z +2,1). Chez gestes5, aucune cause ne dépasse |z| 1,7 (l.198, 202). Avec 10 causes, aucune ne passe un seuil corrigé (environ 2,8).

CE QUI EST SÛR / CE QUI NE L'EST PAS
- Sûr, à très fort z :
  - le gain de E de slalomOn et gestes5 vient de l'aller ; celui de bordOn et c0101 vient de la nitro au décollage ;
  - aucun dE ne s'explique par le choix des courses ;
  - slalomOn et gestes5 roulent environ 24 km/h moins vite et font environ 0,36 à 0,41 palier par minute de moins.
- Probable : E s'additionne dans les mélanges, avec une saturation du terme air.
- Pas sûr : toute interaction sur le palier, le prix en palier lui-même (gestes5 −0,75 [−1,42 ; −0,03] ne passe pas Bonferroni) et toute attribution à une cause de mort.
- Hors de portée de ces lignes : un découpage par map ou par biome. Il faudrait que la ligne de course porte la map de la mort.

## 2. relecteur

*Rôle : relecteur : refait les calculs par un autre chemin et attaque les conclusions. Phase : Relecture.*

RELECTURE ADVERSE — composantes du banc des gènes (aucune course jouée, aucun fichier du dépôt modifié, rien de commité)

Je n'ai trouvé aucune erreur de calcul dans composantes.js : je ne l'ai donc ni corrigé ni relancé. Les sha1 sont inchangés : resume.txt 95f8f63e, resultats.json 1b399279, composantes.txt 8cd3c53c, composantes.json 6c48212f. Je n'ai trouvé ni `//` en fin de ligne ni nom de machine dans composantes.js ou composantes.txt.

Mes scripts sont indépendants : je calcule E moi-même et le hasard vient de mulberry32. La seule chose reprise au code est la référence des joueurs, ressemblance.reference(joueurs('clavier')). Ils sont dans <dossier temporaire>\scratchpad\banc-lecture\ :
- relire.js et relire.json : paliers, E, dE, dF, composantes, bootstrap à 2 000 tirages, graine 777 ;
- artefact.js : E selon la survie, E à survie égale, mesures absentes, biais de taille ;
- reste.js : seuils de Bonferroni, rythme, vitesse, régression vers la moyenne, causes ;
- inter.js : interactions et somme slalomOn + bordOn.

## AFFIRMATIONS CONFIRMÉES (mes chiffres)

**1. Palier moyen et E de chaque bras.**
- Palier moyen : depart 6,833 ; slalomOn 6,333 ; bordOn 7,354 ; gestes5 6,083 ; c0101 6,625 ; lacheOn 6,938. C'est identique à resume.txt.
- Mon E retombe sur celui du résumé à 0,0015 près : depart 0,8826, slalomOn 0,7073, bordOn 0,7285, gestes5 0,6639, c0101 0,7641, lacheOn 0,8073. Le petit écart vient de ressemblance.ecart, qui arrondit z à 2 décimales.

**2. dE, dF et d palier contre le départ (mon bootstrap apparié, autre graine, 2 000 tirages).**

| bras | d palier (se) | dE (se) | z de dE | dF (se) [IC 95 %] |
|---|---|---|---|---|
| slalomOn | −0,50 (0,40) | −0,175 (0,034) | −5,1 | +0,20 (0,44) |
| bordOn | +0,52 (0,38) | −0,154 (0,027) | −5,8 | +1,14 (0,42) [+0,31 ; +1,97] |
| gestes5 | −0,75 (0,36) | −0,219 (0,034) | −6,5 | +0,13 (0,40) |
| c0101 | −0,21 (0,40) | −0,118 (0,030) | −3,9 | +0,27 (0,44) |
| lacheOn | +0,10 (0,38) | −0,075 (0,028) | −2,7 | +0,41 (0,40) |

- Les erreurs-types sont identiques à 0,001 près à celles du résumé et de l'analyste : le bootstrap est crédible.

**3. Composantes de E.**
- Au départ : aller 0,284 (z +4,69), nitroDecol 0,248 (z −4,23), raccourcis 0,100, air 0,082, volHaut 0,061.
- Écarts au départ (se) : aller slalomOn −0,155 (0,012) et gestes5 −0,169 (0,011) ; nitroDecol bordOn −0,093 (0,014) et c0101 −0,092 (0,015) ; air gestes5 −0,064 (0,015).
- Le gain de E de slalomOn et de gestes5 vient de l'aller ; celui de bordOn et de c0101 vient de la nitro au décollage. C'est confirmé.

**4. Règle des 60 s.**
- Sur les 1 248 courses du banc : aucune course de 60 s ou plus sans mesures, aucune course plus courte avec mesures (1 003 courses mesurées).
- Le départ a 79 parties.

**5. Ce n'est pas un artefact de la survie, du choix des courses ni du nombre de vols.**
- Dans le départ, E baisse un peu avec la survie : quartiles de survie de 63-93 s à 169-286 s, E 0,93 / 0,88 / 0,93 / 0,85. Les corrélations course par course avec la survie sont faibles : vols +0,33, air +0,20, vitesse +0,40, aller −0,18, nitroDecol −0,03. **Un pilote qui vit plus longtemps a donc mécaniquement un E un peu plus bas.**
- À survie égale (strates de survie du départ) :
  - slalomOn −0,176, gestes5 −0,225, c0101 −0,116 : inchangés ;
  - bordOn −0,143 au lieu de −0,154 : environ 0,01 de son gain vient de courses plus longues ;
  - lacheOn −0,090.
- Sur les graines où les deux courses ont une durée proche (moins de 30 % d'écart) : slalomOn −0,213, gestes5 −0,190, bordOn −0,145, c0101 −0,159.
- Biais de taille : E du départ sur 20 parties tirées 0,897, sur 79 parties 0,886. Il est négligeable entre 75 et 80 parties.
- Mesures absentes : 0 à 5 courses par mesure, même ordre de grandeur partout. Aucune mesure n'est absente au niveau du bras, donc aucune n'est comptée au pire.

**6. Les autres faits avancés par l'analyste.**
- bordOn change la course sur 62 graines, et slalomOn la change aussi sur ces 62.
- bordOn, sur les graines où le départ mourait en « air » : +66 paliers sur 21 graines.
- Corrélation des d palier de slalomOn et de gestes5 : r 0,586. 34 graines perdent chez les deux, contre 25 attendues si les deux étaient indépendants.
- Grosses pertes et gros gains (5 paliers ou plus) :
  - slalomOn : 13 graines perdent (−89), 9 gagnent (+63) ;
  - gestes5 : 15 graines perdent (−96), 8 gagnent (+49).
- La régression vers la moyenne est réelle : sur les graines qui diffèrent, r(d, palier du départ) va de −0,43 à −0,77 selon le bras.

**7. Interactions (mon calcul).**
- gestes5 : E +0,087 (se 0,078), palier −1,04 (se 0,90), air +0,075 (se 0,037).
- c0101 : E +0,006 (se 0,037), palier −0,65 (se 0,52).
- Somme slalomOn + bordOn : dE −0,329 (se 0,052), d palier +0,02 (se 0,65 en comptant la covariance, ce qui s'accorde avec son « au moins 0,55 »).

**8. Vitesse et palier à survie égale.**
- Vitesse appariée : slalomOn −24,2 km/h (se 4,0, z −6,0), gestes5 −26,5 (se 3,5, z −7,6). Le terme vitesse de E reste dans la zone morte, z −0,60 → −0,95.
- Sur les 96 graines, avec la pente palier/survie du départ (r palier/survie = 0,95) : slalomOn −0,66 palier, gestes5 −0,73, bordOn −0,07, suitOn −0,05. Les se naïves valent environ 0,09 : c'est une indication, pas un test apparié.

## AFFIRMATIONS REFUSÉES OU AFFAIBLIES

1. **Le nombre de comparaisons est sous-compté (« 180 »).**
   - On a regardé au moins : 12 × 2 critères de verdict, plus 12 × (15 composantes, dE, d survie, rythme, vitesse, dE sur graines communes), plus environ 20 z par cause de mort, plus environ 30 z d'interaction. Cela fait environ 300 comparaisons, soit |z| > 3,76 ; en comptant les tableaux par cause, environ 600, soit |z| > 3,93.
   - Ce qui survit à 600 : les dE de slalomOn, bordOn et gestes5 ; l'aller de slalomOn et de gestes5 ; la nitroDecol de bordOn et de c0101 ; la vitesse de slalomOn et de gestes5 ; les composantes de gestes5 (air, nitro, nitroSol, figures) et la nitro de slalomOn ; le rythme de gestes5 (z −4,6).
   - Ce qui ne survit qu'à 300 : le dE de c0101 (z −3,9) et le figures de lacheOn (z −4,15, juste au-dessus de 3,93).
   - Ce qui tombe :
     - le rythme de slalomOn (z −3,6 chez moi, −3,7 chez lui) ne passe déjà plus à 180. Il faut l'affaiblir et s'appuyer sur la vitesse (z −6) ;
     - le dE de lacheOn (z −2,7) ne passe même pas le seuil de 12 (2,87). La phrase « son dE de −0,076 est réparti » laisse croire à un effet établi : **lacheOn n'a aucun effet sûr sur E.**
2. **« Les gestes ne font pas mourir plus tôt ».** d survie slalomOn +3,9 s (se 9,5), gestes5 −0,4 s (se 8,0). Il faut écrire « aucun effet sur la survie n'est visible » : un effet de ±18 s reste possible.
3. **« Le terme air sature, le dE d'un slalomOn + bordOn serait un peu moindre ».** C'est faux comme mécanisme de la note : la somme prédite des z d'air vaut −1,07, au-dessus de la zone morte, donc le plancher de air n'est pas atteint (0,082 disponible pour 0,077 demandé). La saturation de gestes5 vient de cinq gestes qui demandent −0,139 sur 0,082. Le seul risque réel pour la paire est que les conduites ne s'ajoutent pas, et cela, aucun bras ne le mesure.
4. **« E s'additionne dans les mélanges » (probable).** Il faut l'affaiblir : dans gestes5, seulement 71 % de la somme est réalisée (interaction +0,087, IC à peu près [−0,07 ; +0,24]), et la somme est faite surtout de petits morceaux non significatifs. Ce qui est sûr est plus étroit : les deux gros termes, aller et nitroDecol, survivent tels quels au mélange.
5. **« Le slalom gagne de la ressemblance ».** Il faut le nuancer : slalomOn fabrique exactement la statistique qu'il fait baisser (le gène alterne le cap, la mesure est la durée d'un aller). En même temps, il éloigne nitro (z −0,95 → −1,34), nitroSol, ondulation (+1,71 → +2,08) et dessous (+0,54 → +1,46, non significatif), et il ralentit. C'est un gain sur la mesure ; ce n'est pas prouvé que l'œil le voie.
6. **bordOn dF +1,14.** Son z vaut 2,69 : il échoue même au seuil de 12 (2,87). Environ 0,04 de son dF (0,01 de dE × 4) vient de courses plus longues.

## CE QU'ON A LE DROIT D'ÉCRIRE (conclusion du banc)

1. Sur 96 graines, aucun interrupteur ne change le palier ni F de façon sûre. bordOn (dF +1,14, z 2,7) et la perte de gestes5 (−0,75 palier) restent des pistes.
2. Trois bras rapprochent sûrement des joueurs : slalomOn dE −0,175, bordOn −0,155, gestes5 −0,22 (z de −5 à −6,5). c0101 aussi, −0,12 (z −3,9), mais plus faiblement.
3. Le gain de slalomOn et de gestes5 vient de l'aller du slalom ; celui de bordOn et de c0101 vient de la nitro au décollage (part de 0,15 → 0,29, les joueurs à 0,63).
4. Ces gains ne viennent ni du choix des courses comptées, ni de leur durée (au plus 0,01 pour bordOn), ni des mesures absentes.
5. Le slalom coûte de l'allure : environ −25 km/h, z −6. À survie égale, il fait environ 0,7 palier de moins. E ne le voit pas, car le terme vitesse reste dans sa zone morte, au bord (z −0,95).
6. slalomOn et bordOn jouent sur des termes séparés : la somme prédit dE ≈ −0,33 et un palier inconnu (+0,02 ± 0,65). Le bras slalomOn + bordOn est la prochaine course à jouer, pas une conclusion.
7. lacheOn, coupOn, relacheOn, suitOn, fuirVite, c0026, largeOn et libreOn : aucun effet sûr sur E ni sur le palier.

## 3. redacteur

*Rôle : rédacteur : écrit le résultat dans le LISEZ-MOI de l'étude, le journal et la passation. Phase : Redaction.*

J'ai écrit le résultat du banc dans les quatre fichiers demandés et ajouté une ligne au registre des impasses. Aucune course jouée, rien de commité. etat/, resume.txt et resultats.json n'ont pas bougé : leurs sha1 sont toujours 95f8f63e et 1b399279.

FICHIERS MODIFIÉS
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\banc-des-genes\LISEZ-MOI.md
  - J'ai corrigé une phrase devenue fausse : « (à venir : la mesure n'est pas encore lancée) » renvoie maintenant au résultat.
  - J'ai ajouté une partie « Le résultat (28/11/2026) ». Elle contient : ce que le banc dit, ce qu'il ne dit pas, le tableau des 13 bras, les mesures qui bougent, le prix en palier des gestes, slalomOn et bordOn ensemble, ce que l'on en fait (tes points i à iv) et les fichiers du résultat.
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28.md
  - J'ai remplacé la phrase « au matin, il tournait encore » dans « En une minute ».
  - J'ai remplacé le « EN COURS » du point « Le banc des gènes » par un court paragraphe de résultat, marqué GARDÉ comme mesure.
  - J'ai remplacé la ligne du tableau des chiffres « 725 sur 1 250 » par deux lignes de résultat.
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\PASSATION.md : un encadré « Mise à jour, 10 h 45 » en tête de « L'état au 28/11/2026 au matin », qui renvoie au LISEZ-MOI.
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\ETAPES.md : deux lignes de mise à jour avant « Ce qui n'est pas fait au matin du 28/11 ». Cette phrase porte maintenant « (écrit à 7 h 40) » et « fini depuis ».
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LISEZ-MOI.md : une ligne au registre des impasses.
  - Elle porte sur coupOn, relacheOn, largeOn et libreOn. Sur 96 graines, ils jouent 59, 45, 93 et 83 courses identiques au départ, sans aucun effet sûr. Le relecteur le confirme, et ils restent éteints sans être rejoués.
  - Je n'ai pas mis de ligne pour gestes5 : le relecteur classe sa perte de −0,75 palier comme une piste, pas comme une impasse avérée.

CHOIX DE RÉDACTION
- L'heure de fin (10 h 45) et le compte de 1 250 courses sur 1 250 viennent de la dernière ligne de jouer.log, qui est citée. Ces deux chiffres ne sont ni dans resume.txt ni dans composantes.txt. Tous les autres chiffres sont dans l'un ou l'autre.
- J'ai laissé de côté les chiffres que le relecteur a refusés ou ne donne que dans ses propres scripts :
  - le compte de 180 comparaisons et le seuil |z| 3,64 ;
  - la saturation du terme « air » ;
  - « ne font pas mourir plus tôt » (j'ai écrit « aucun effet visible sur la survie », avec les intervalles de resume.txt) ;
  - l'effet de lacheOn sur E, que j'ai écrit comme « aucun effet sûr » ;
  - les z de dF et les « 0,7 palier à survie égale ».
- La baisse de rythme de slalomOn est affaiblie (« probable mais moins nette ») ; l'argument principal reste la vitesse.
- Une phrase du compte rendu de l'analyste est fausse et je ne l'ai pas reprise : l'aller ne reste pas le premier terme de E chez slalomOn. Avec slalomOn, la nitro au décollage pèse 0,222 et l'aller 0,129.
- « c0101 confirmé une troisième fois » est repris tel que tu l'as donné.
- lacheOn, gestes5 et c0026 sont seulement dits « pas dans cette vague » : je n'ai écrit aucune décision pour eux.

LE RÉSULTAT, TEL QUE JE L'AI ÉCRIT
1. Sur 96 graines, aucun interrupteur ne change le palier ni la note F au seuil corrigé. bordOn (dF +1,14 [+0,31 ; +1,97]), fuirVite et la perte de gestes5 (−0,75 palier [−1,42 ; −0,03]) restent des pistes.
2. slalomOn, bordOn et gestes5 rapprochent sûrement des joueurs : E passe de 0,882 à 0,707, 0,728 et 0,665. c0101 aussi, moins nettement (0,765). Cela ne vient pas des courses comptées : au plus 0,015.
3. Le slalom corrige l'aller : de 0,982 s à 0,808 s (joueurs 0,576 s). bordOn corrige la nitro au décollage : de 0,149 à 0,286 (joueurs 0,625). Rien ne prouve qu'un œil voie le slalom.
4. Le slalom coûte de l'allure : −24,2 km/h pour slalomOn et −26,5 km/h pour gestes5. E ne le voit pas, car son terme vitesse reste dans la zone morte. Le palier de slalomOn + bordOn est inconnu.
5. La suite : aucun interrupteur n'est allumé à la naissance. bordOn, slalomOn, suitOn et fuirVite, plus le bras bordOn + slalomOn, passent en vague de confirmation sur des graines neuves, sur ml/evolution/banc. c0101 ne va pas plus loin que c0025. coupOn, relacheOn, largeOn et libreOn restent éteints.
