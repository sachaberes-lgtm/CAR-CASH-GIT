# La construction de ml/evolution (la sélection naturelle des bots) : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `construction-evolution-bots` (wf_403c6fab-ee7), lancée par la session principale (Claude Fable).
- Agents : 10, tous du modèle claude-opus-5-5.
- Durée : 2 h 41 ; jetons consommés par les agents : 2 399 211 (2,40 millions) ; appels d'outils : 542.
- Message de fin du script : « 20 defauts releves (0 bloquants, 11 importants) ».
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. architecte : écrit le contrat entre les modules (INTERFACES.md), sans coder aucun module (phase « Interfaces »)
2. constructeur du module « pilote » : écrit le code et ses tests, en parallèle des trois autres (phase « Modules »)
3. constructeur du module « courses » : écrit le code et ses tests, en parallèle des trois autres (phase « Modules »)
4. constructeur du module « note » : écrit le code et ses tests, en parallèle des trois autres (phase « Modules »)
5. constructeur du module « exploitation » : écrit le code et ses tests, en parallèle des trois autres (phase « Modules »)
6. intégrateur : assemble les modules, écrit le programme maître evoluer.js et ses essais de bout en bout (phase « Integration »)
7. relecteur « statistique » : relit le travail des autres et relève les défauts, sans les corriger (phase « Relecture »)
8. relecteur « robustesse » : relit le travail des autres et relève les défauts, sans les corriger (phase « Relecture »)
9. relecteur « determinisme » : relit le travail des autres et relève les défauts, sans les corriger (phase « Relecture »)
10. correcteur : corrige les défauts relevés par les trois relecteurs et relance les tests (phase « Corrections »)

## 1. architecte

*Rôle : architecte : écrit le contrat entre les modules (INTERFACES.md), sans coder aucun module. Phase : Interfaces.*

### Résumé

J'ai écrit le contrat des modules, ml/evolution/INTERFACES.md (environ 61 Ko, LF), ml/evolution/config.json (toutes les valeurs par défaut des § 5 à 7) et ml/evolution/config-essai.json (μ 4, λ 2, 3 graines, tmax 60, fusionné par-dessus config.json, état à part dans essais/). Aucun module n'est codé, rien n'est commité, et rien n'a été écrit hors de ml/evolution/.

Le contrat donne pour chacun des onze modules (plus commun.js) les fonctions exportées avec leur signature, leurs erreurs et leur ligne de commande. Il donne aussi le format exact, avec un exemple, de : le génome, config.json, population.json, une ligne de courses-AAAA-SS.jsonl, generations, validations, morts, coffre, le champion (.js et .json), verrou.json, l'époque. Il décrit le bloc généré dans modele.js (balise et forme), donne les 36 entrées de la tête RAYON et les 12 de la tête SOL une par ligne avec leur formule, et dit qui écrit quel fichier.

Décisions prises là où la spécification était floue :
1. **Génome de 86 gènes** : 64 réels (45 de REGLAGES avec volRetour, 5 de la loi « retour », 14 constantes promues), 20 drapeaux (dont un par map pour raccCartes et raccJumeau, sur 6 maps), dessousDecor et figMax. La constante « 20 » de vaut() devient axePoids, la même que dans faire-pR.js. volNitro reste figé à 0.
2. **Bornes** : la table de l'inventaire « faits (3) » est introuvable dans l'étude. Seules les 11 bornes citées par la spécification sont reprises (marquées ★). Les 34 autres sont des propositions. J'ai vérifié que chaque valeur du témoin tombe dans sa borne.
3. **Identité au bit près avec retourOn = 0** : deux gardes sont indispensables dans modele.js.
   - Au sol, une sortie engagée garde `facon==='plane'` pour la nitro au lieu de avecNitro. Sinon une sortie viserPlane allume la nitro au sol.
   - Les façons retour<i> sans loi correspondante sont sautées. Sinon retour0 sans rayon vaut 3 points et peut être choisie.
4. **Tête RAYON** : la case de façon « tenu » ne sert jamais, car FACONS n'a pas de façon de ce nom. Elle sert donc aux lois retour<i>. On garde 36 entrées et 222 poids. R = 0 quand le rayon est absent, et R est ajouté aussi dans le choix du départ de faire-pR.js.
5. **Tête SOL** : elle est évaluée juste avant `cible=cl(cible,-max,max)`. La sortie « ligne » agit sur la cible plutôt que sur m.ligne, qui sinon dériverait d'une décision à l'autre. margeV et jauge sont calculés plus tôt, sans changer leur expression.
6. **Contrôle des rayons, écrit d'après radarVol** :
   - les 10 premiers rayons sont toujours là, dans l'ordre ;
   - viser et viserPlane viennent ensemble, et seulement si vol.cible n'est pas null ;
   - viennent ensuite retour0… consécutifs, au plus autant que de lois demandées.

   Le contrôle tourne à chaque vue de vol qui a un radar. En cas d'échec il lève « YEUX CHANGES », qui remonte par bilan.derniereErreur, et le maître s'arrête.
7. **Deux époques** :
   - « courses » change quand une course peut changer, et la clé du cache la contient ;
   - « note » change avec l'étalon ou les paramètres de note, et le cache reste valable.

   Elles couvrent plus de fichiers que la spécification : mesures.js, voltige.js, jeu-reel.js, sim-env-reel.js, modele.js, enfant.js et cfg.reseaux.
8. **Note d'entraînement** : seules les courses d'entraînement y entrent. La validation et le coffre restent à part, pour que la malédiction du gagnant soit mesurée sur des courses neuves.
9. **Bootstraps** : ils ont leur propre générateur, tiré d'un sha1, et n'usent jamais l'état du maître. Une reprise refait donc exactement la même génération, et population.json n'est écrit qu'une fois par génération.
10. **Courses non mesurées** : elles sont écrites (mesuree:false). Une clé déjà ratée deux fois n'est plus relancée, ce qui garde la reprise déterministe. Une graine ratée deux fois sort de la note de tous pour toute l'époque.
11. **Peu de parents éligibles** : sous 3 éligibles (génération 1), le tournoi se fait parmi ceux qui ont le plus de courses. Le nombre de virés est min(éligibles, vivants − μ).
12. **« Doit être revalidé »** : le champion recourt contre le témoin sur 24 graines neuves. Il ne perd son titre que si dF < −1 × se.
13. **Formules du hasard figées** : mulberry32 et Box-Muller sont écrits mot pour mot, ainsi que l'ordre des tirages des poids W1. Les réels sont arrondis à 4 décimales, les poids à 6 et bornés à ±4, et −0 n'apparaît jamais.
14. **Travailleurs à 4 dans config.json**, au lieu des 9 de la spécification. Ce PC a 4 cœurs et d'autres mesures tournent ; sur le Ryzen, le banc réécrira la valeur.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : Le contrat qui fait foi : signatures des 11 modules et de commun.js, formats avec exemples, bloc généré de modele.js, entrées des deux têtes, écrivains des fichiers, algorithme détaillé là où la spécification laissait un choix, répartition entre les 5 développeurs
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json  
  Role : Toutes les valeurs par défaut (§ 5 à 7 de la spécification), avec les chemins relatifs à ml/evolution
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config-essai.json  
  Role : Le petit jeu « essai » (μ 4, λ 2, 3 graines, tmax 60, 3 travailleurs, état dans essais/), fusionné par-dessus config.json

### Tests

- Nom : config.json et config-essai.json se lisent avec JSON.parse  
  Passe : true  
  Détail : node -e JSON.parse sur les deux fichiers : aucune erreur
- Nom : Les trois fichiers sont en LF (aucun \r)  
  Passe : true  
  Détail : vérifié par lecture : CR false pour les trois
- Nom : Chaque valeur du témoin (REGLAGES de pilote-voltige.js) tombe dans sa borne proposée  
  Passe : true  
  Détail : REGLAGES lu par regex puis vm : 54 clés, 44 réels sans volRetour vérifiés, aucun hors borne ; les 10 autres clés sont bien les drapeaux, les objets et volRetour
- Nom : Les extraits littéraux des 14 constantes promues existent dans pilote-voltige.js  
  Passe : true  
  Détail : relu dans le fichier : lignes 143-157 (raccourci), 296-302 (vaut), 345 (bonus)
- Nom : L'ordre des rayons et la présence de viser et de cible vérifiés dans yeux.js  
  Passe : true  
  Détail : radarVol, lignes 765-785 : liste fixe de 10 rayons, puis viser et viserPlane seulement si sv!=null et E0.uy>0 (même condition que f.cible), puis retour<i> ; f.cible=null par défaut à la ligne 977

### Problèmes

- Non vérifié en course : rien n'a tourné. L'identité au bit près repose sur les deux gardes de modele.js (§ 5.2, points 2 et 3) et sur l'analyse du code, pas sur une mesure.
- Les bornes de 34 gènes réels de REGLAGES et des 14 constantes promues sont des propositions : la table de l'inventaire « faits (3) » est introuvable dans evolution-etude/.
- cartesTirage (nuages, ville, jade, espace, grotte, canyon) est lu à la main dans code/maps/niveaux.js (SF_CARTES moins SF_HORS en allégé) ; à confirmer à l'étape 0.
- Le refus de partir quand boucle.js tourne passe par PowerShell (Get-CimInstance) : non essayé.
- inscrire-champion.js suppose la ligne /^evolution/ ajoutée à sansCout() de labo.js (étape 9, à la main) ; il refuse de s'exécuter sans elle.
- La définition de « revalider le champion » après une nouvelle époque (§ 6.5) et la tête SOL appliquée à la cible plutôt qu'à m.ligne sont des choix d'architecte, à confirmer par Sacha.

### Écarts à la consigne

Écarts à la SPECIFICATION, chacun voulu et écrit dans INTERFACES.md :
1. Module en plus, commun.js (config fusionnée, écriture atomique, JSONL, sha1, semaine ISO, pid vivant), pour que les onze modules ne recopient pas ces fonctions.
2. La loi « retour » entre dans le génome dès la v1 (amendement 2) : 7 gènes, une seule loi, rv, rm et rn figés. volNitro de faire-pR.js reste figé à 0, car il n'est pas dans la liste de l'amendement.
3. Tête RAYON : la case de façon « tenu » (jamais un nom de façon) sert aux lois retour<i>. Le nombre d'entrées ne change pas.
4. Le contrôle des rayons suit le code réel (amendement 3), pas les « 12 rayons » du § 5.2 : 10 fixes, puis viser et viserPlane si une cible existe, puis retour<i>. Il tourne à chaque vue de vol, pas seulement à la première.
5. Époque en deux niveaux (courses et note), qui couvre plus de fichiers. La clé du cache contient l'époque des courses, en plus des champs du § 5.3.
6. Les courses non mesurées sont écrites dans courses.jsonl (mesuree:false). La spécification ne parlait que des courses mesurées.
7. Les courses de validation et de coffre restent hors de la note d'entraînement.
8. Résultat compact de enfant.js enrichi de empreinte, empreinteVues, empreinteTouches et nom, nécessaires aux tests d'identité et du champion. Option complet pour inscrire-champion.js.
9. travailleurs vaut 4 par défaut au lieu de 9 (PC de 4 cœurs, amendement 5). Banc à 2, 3 et 4 travailleurs au lieu de 6, 8 et 10.
10. Revalidation, tournoi sous 3 éligibles, nombre de virés et passage définitif à 8 graines : règles précisées là où la spécification était muette.

## 2. module:pilote

*Rôle : constructeur du module « pilote » : écrit le code et ses tests, en parallèle des trois autres. Phase : Modules.*

### Résumé

Le pilote fabriqué est construit (étape 2 de la spécification, avec l'amendement 2), et les cinq tests a à e passent. Rien n'est commité. Je n'ai écrit que dans ml/evolution/ : modele.js, genome.js, identite.js, les deux fichiers de tests, et quatre ajouts à INTERFACES.md.

**modele.js** est la copie de pilote-voltige.js avec ces changements :
- les retouches de faire-pR.js (la loi « retour »), toutes gardées par `REGLAGES.retours.length>0` ;
- les deux gardes du contrat (la nitro d'une sortie engagée au sol, et le saut des façons retour<i> qui n'ont pas de loi) ;
- les 14 constantes branchées sur G.* ;
- les têtes RAYON (36→6→1) et SOL (12→6→3), branchées aux endroits du § 5 ;
- le contrôle des rayons, écrit d'après radarVol : il lève « YEUX CHANGES » ;
- la balise `/*@GENOME@*/` à la place de REGLAGES, et `nom:'evolution'`.

Je l'ai fabriqué par remplacements exacts sur le texte de pilote-voltige.js : le reste du fichier est octet pour octet le même.

**genome.js** suit le contrat : 86 gènes (64 réels), les têtes de 222 et 90 poids tirées par mulberry32 depuis graines.js, avec W2 = 0. Il fournit `genomeTemoin`, `muter`, `croiser`, `reparer`, `valider`, `shaGenome`, `idDe`, `ecrirePilote`, `shaPilote`, `distance`, `distanceW2`, et ses deux lignes de commande. Le bloc écrit pour le témoin est exactement celui de l'exemple du § 5.1.

**identite.js** passe par courses.creer({cache:false, ecrire:false}), avec un processus neuf par course (enfant.js), et n'écrit rien. Il fournit `verifier` et `verifierW2` ; en ligne de commande `node ml/evolution/identite.js` puis `--w2`.

**Résultats mesurés** (45 s par course, au plus 4 à la fois) :
- **Identité :** les trois graines donnent les mêmes empreintes que pilote-voltige.js (course, vues et touches). Pour 910000, l'empreinte de course est `8d34b0578072`, la même que dans l'inventaire.
- **Têtes branchées :** W2 de la tête RAYON à 0,5 change 1 course sur 3 (910074). W2 de la tête SOL à 0,5 en change 3 sur 3.
- **Loi « retour » :** retourOn = 1 change 2 courses sur 3. Sur une course tracée (910037, vrais yeux), les 69 vues de vol sont toutes dans l'ordre du contrôle : 35 portent viser/viserPlane, 69 portent retour0, et le cerveau ne fait aucune erreur.
- **Chargement :** le pilote se charge dans le bac en 8,2 ms la première fois, puis en environ 3 ms.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\modele.js  
  Role : Le pilote à trous (texte, jamais requis) : pilote-voltige.js avec les retouches de faire-pR.js sous garde, les 14 constantes en G.*, les têtes teteRayon/teteSol, controleRayons et la balise /*@GENOME@*/
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\genome.js  
  Role : BORNES, CONTINUS, TETES, genomeTemoin, tirerReseaux, muter, croiser, reparer, valider, shaGenome, idDe, ecrirePilote, shaPilote, distance, distanceW2 ; lignes de commande --temoin [--ecrire] et --essai-reparer N
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\identite.js  
  Role : Le contrôle d'avant-nuit : verifier, verifierW2, jouerTextes, genomeW2 ; ligne de commande [--graines] [--tmax] [--travailleurs] [--w2] [--config]
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\genome.test.js  
  Role : Tests c, d et e sans course, plus le témoin, le tirage des têtes, muter/croiser/distance (environ 11 s)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\identite.test.js  
  Role : Tests a et b en course (15 courses, 4 à la fois), plus la course tracée (e') sur les vrais yeux (environ 4 min)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : Contrat : ajout des précisions du dév. 2 en § 2.3, § 2.7, § 5.1, § 5.5 et § 5.6

### Tests

- Nom : (a) identité : génome témoin contre pilote-voltige.js, 3 graines × 45 s, un processus neuf par course  
  Passe : true  
  Détail : 910000 donne 8d34b0578072 c3e43d836ec3 cad18e2f5956 (0 vol). 910037 donne c4b906ba0a4f ce4f5618595e 1c50ca469a55 (2 vols). 910074 donne 59db7c95e6f3 b3ff853927f2 9ca21a3e11e6 (5 vols). Les trois empreintes sont égales des deux côtés, sur deux lancements séparés.
- Nom : (b) W2 de la tête RAYON à 0,5 donne une autre course  
  Passe : true  
  Détail : 1 graine sur 3 change (910074 : 5366adb56ab8, palier 4), sans erreur du cerveau. identite.js --w2 redonne le même résultat.
- Nom : (b) W2 de la tête SOL à 0,5 donne une autre course  
  Passe : true  
  Détail : 3 graines sur 3 changent, sans erreur.
- Nom : (b) retourOn = 1 donne une autre course  
  Passe : true  
  Détail : 2 graines sur 3 changent (910037, 910074). 910000 ne vole pas en 45 s et reste donc identique. Aucune erreur, YEUX CHANGES compris.
- Nom : (c) reparer : 10 000 mutations au hasard (phases A, B, C, croisements, gros sigma)  
  Passe : true  
  Détail : Aucun génome hors bornes ni hors contraintes, et reparer est idempotent. 3 764 génomes tombent au ras d'une contrainte, donc les contraintes sont bien exercées. S'y ajoutent 2 000 génomes abîmés (NaN, -0, chaînes, clés en trop ou manquantes) que reparer rend conformes. genome.js --essai-reparer 10000 sort OK.
- Nom : (d) ecrirePilote : zéro \r, sha stable, bloc conforme, chargement en moins de 20 ms  
  Passe : true  
  Détail : Le bloc du témoin est identique à l'exemple du § 5.1. Un modèle en CRLF donne le même pilote. Une balise manquante ou en double est refusée. charger prend 8,2, 2,8, 3,1, 3,0 puis 2,7 ms ; le nom est « evolution » et le profil a le même sha que celui de pilote-voltige.
- Nom : (e) contrôle de l'ordre des rayons, sur des vues de vol truquées  
  Passe : true  
  Détail : Les 5 formes conformes passent. Les 12 vues truquées lèvent YEUX CHANGES avec un ordre vide, dont les 12 rayons dans l'ordre de la spec § 5.2 (viser avant versRoute), retour0 sans loi demandée, et viser sans cible. controleRayons:false ne lève pas. Un radar nul ou en erreur n'est pas contrôlé.
- Nom : (e') contrôle sur les vrais yeux : une course tracée de 45 s, loi retour demandée  
  Passe : true  
  Détail : Graine 910037 : 69 vues de vol à radar, toutes dans la forme attendue, 0 erreur. Au premier lancement le test a ÉCHOUÉ parce qu'il prenait la graine 910000, qui ne vole pas en 45 s (0 vue à contrôler). Je l'ai corrigé pour prendre la graine où la course « retour » vole le plus. La règle « au moins une vue à radar » est restée.

### Problèmes

- Rien n'est commité. modele.js dépend des modifications non enregistrées de ml/bot/yeux.js et ml/bot/piloter.js (la loi « retour ») : si elles sont annulées, les tests b (retourOn) et e' casseront.
- Les bornes restent celles proposées par l'architecte. Je n'ai rien vérifié sur leur pertinence au-delà du fait que le témoin y tombe.
- La tête RAYON à W2 = 0,5 ne change qu'une course sur trois en 45 s, parce que peu de vols ont lieu dans ce temps. verifierW2 sur des graines sans vol rendrait un faux ECHEC. Avec les graines d'identité par défaut, il passe.
- L'identité est prouvée sur 3 graines × 45 s seulement, et la graine 910000 ne passe pas par le vol. Je ne l'ai pas vérifiée sur des courses longues ni sur toutes les maps.
- Les tests de comptage des têtes de phase B et C (autour de 100 sur 200 et de 60 sur 200) ont des marges statistiques ; ils sont déterministes à graine fixe.

### Écarts à la consigne

Tous ces écarts sont écrits dans INTERFACES.md, en « Précisions de l'implémentation (27/11, dév. 2) » ou en ligne :
1. **Ordre des clés de REGLAGES dans le pilote écrit :** j'ai suivi l'ordre de pilote-voltige.js, comme l'exemple du § 5.1. La phrase qui disait « dans l'ordre de BORNES » contredisait cet exemple. L'ordre des clés ne change rien à la course.
2. **Nom de la tête RAYON :** dans modele.js elle s'appelle `teteRayon` et non `R`, parce que `R` y est déjà l'alias de REGLAGES.
3. **Décalage de la cible au sol :** il est écrit `if(dc!==0)cible=cible+dc`. Sans cette garde, -0 + 0 donne +0, et ce signe d'un zéro peut ressortir dans l'ordre, puisque le bac garde -0.
4. **`reparer` et `valider` :** ils prennent un `cfg` facultatif, pour bornePoids. Une tête de mauvaise longueur lève une erreur. La contrainte braqueFort se compare avec une tolérance de 1e-9.
5. **`ecrirePilote` :** il accepte `o.cfg`, pour retourFige, et refuse un génome non conforme.
6. **`muter` :** l'ordre des tirages est figé et documenté. `mutes` donne la différence complète avant et après `reparer` ; une tête changée y apparaît comme `{cle:'WV'|'WS', avant:null, apres:null}`. `croiser` passe aussi par `reparer`.
7. **BORNES :** il est construit avec cartesTirage de config.json, et un cfg aux cartes différentes est refusé.
8. **Exports en plus :**
   - genome.js : CARTES, ORDRE_VOLTIGE, EXTRAITS, MODELE, VOLTIGE ;
   - identite.js : jouerTextes et genomeW2, ainsi que l'option `--config`.
   - Les résumés d'identite.js portent aussi vols, erreurs, derniereErreur, mesuree et raison.
9. **Test e' en plus :** une course tracée sur les vrais yeux. Elle s'ajoute aux vues truquées du test e, qui reste fait comme demandé.

Toutes les autres signatures et tous les formats suivent le contrat.

## 3. module:courses

*Rôle : constructeur du module « courses » : écrit le code et ses tests, en parallèle des trois autres. Phase : Modules.*

### Résumé

L'étape 1 est faite et ses cinq tests passent. Elle comprend commun.js (l'outillage du § 0), enfant.js (une course dans un processus neuf, qui rend le résultat compact d'environ 1 Ko : 1015 octets par ligne, avec les 15 mesures au-delà de 60 s) et courses.js.

courses.js contient l'époque, la clé du cache et l'ordonnanceur. L'ordonnanceur lance N enfants à la fois, en priorité basse, sous un chien de garde. Une course non mesurée est relancée une fois (essai 2). Le tri passe par note.pourquoiEcartee, avec une recopie de secours si note.js manque ; c'est note.js qui a servi pendant les essais. Le cache se lit dans courses-AAAA-SS.jsonl ; à la reprise, une ligne tronquée est ignorée, mise de côté puis coupée du fichier. Une clé demandée deux fois ne se joue qu'une fois.

La ligne de commande marche telle que demandée : `node ml/evolution/courses.js <pilote.js> --graines 12 --depart 910000 --tmax 300 --travailleurs 4`.

Résultats marquants :
- **Test b** : les 6 courses de pilote-voltige.js depuis 910000 à tmax 300, 4 à la fois, redonnent palier, durée, cause ET empreinte identiques à mes-pN2.json (6/6, en 168 s).
- **Test a** : 4 courses de la graine 910074 dans des processus neufs, dont deux en parallèle, donnent des résultats identiques au bit près (empreinte b920af56d321).
- **Contrôle** : la graine 910000 à 45 s redonne l'empreinte 8d34b0578072 de l'inventaire.

Aucun commit. Rien n'a été écrit hors de ml/evolution/, et ni boucle.js, ni chaine.js, ni verifier.js n'a été lancé.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\commun.js  
  Role : outillage commun (INTERFACES § 0) : lireConfig avec la surcouche, chemin, ecrireAtomique (LF exigé), ajouterLigne, lireJsonl (fin tronquée ignorée, milieu illisible qui lève), lireJson, sha1, semaineIso, vivant, fusionner
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\enfant.js  
  Role : une course dans un processus neuf, qui rend le résultat compact ; renvoie {graine, erreurFatale} puis sort avec le code 2 si le chargement échoue ; sort avec le code 3 sur disconnect ; essai à la main avec --essai <pilote> <graine> [tmax] ; exporte resultatCompact
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\courses.js  
  Role : epoque(cfg,o), cle, lireCourses, creer (l'ordonnanceur : demander, arreter, enCours, stats), reparerFins, plus la ligne de commande
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\courses.test.js  
  Role : les tests a à e de la mission : node ml/evolution/tests/courses.test.js [a b c d e] ; leur état va dans essais/tests-courses/
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\commun.test.js  
  Role : tests sans course de commun.js, plus la stabilité de l'époque et la forme de la clé
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\pilotes\leve-au-chargement.js  
  Role : pilote d'essai pour le test d1
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\pilotes\boucle.js  
  Role : pilote d'essai pour le test d2
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\pilotes\leve-dans-decide.js  
  Role : pilote d'essai pour le test d3
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : § 2.2 complété par un paragraphe « Précisions du développeur 1 » (les écarts ci-dessous)

### Tests

- Nom : a : même (pilote, graine) dans des processus neufs  
  Passe : true  
  Détail : 4 courses de la graine 910074 à 50 s, dont 2 en parallèle : 0 différence hors ms, date et cerveau_ms_moy ; empreinte b920af56d321, vues 62ef9d3f2d92, touches 3c42e461c93a
- Nom : b : 6 courses de pilote-voltige = mes-pN2.json  
  Passe : true  
  Détail : même pilote (sha c3e8b81953b3), même jeu (cashcar-v1627 e7e1eed4718f). 6/6 palier et durée égaux et 6/6 empreintes égales (910000 7/147,8 s ; 910037 10/179,3 s ; 910074 7/142,4 s ; 910111 8/112,3 s ; 910148 6/110,9 s ; 910185 3/20,1 s) ; 168 s, 4 à la fois
- Nom : c : maître tué net au milieu puis relancé  
  Passe : true  
  Détail : ligne de commande, 6 graines de 45 s, 2 à la fois, tuée par SIGKILL après 2 lignes ; une ligne tronquée ajoutée à la main. À la reprise : 2 courses rendues du cache, 4 lancées, 0 rejouée, 6 lignes, 0 clé en double, fragment mis de côté, 0 orphelin vivant, code 0. Une première passe avait échoué à cause du test lui-même : sa regex comptait aussi « · cache » dans la ligne de résumé ; corrigée, le code n'a pas changé
- Nom : d1 : pilote qui lève au chargement  
  Passe : true  
  Détail : non mesurée, raison « chargement : pilote casse expres », relancée une fois (2 lignes, essai 2)
- Nom : d2 : pilote qui boucle  
  Passe : true  
  Détail : chien de garde à 25 s pour le test : non mesurée « chien de garde », 2 enfants tués, relancée une fois, 50 s en tout, aucun blocage
- Nom : d3 : pilote qui lève dans decide  
  Passe : true  
  Détail : mesurée, avec 116 erreurs : c'est la règle de noter.js (une erreur du cerveau se répète, la course reste répétable). La course ne se bloque pas
- Nom : e : le cache ne rejoue jamais une clé connue  
  Passe : true  
  Détail : une clé demandée deux fois est jouée une fois ; un ordonnanceur neuf ne rejoue rien (3 lignes du cache, identiques) ; une clé ratée 2 fois n'est jamais relancée ; une clé ratée 1 fois est rejouée une fois (essai 2)
- Nom : commun.test.js  
  Passe : true  
  Détail : 11/11 : semaine ISO (6 cas de bord), écriture atomique et refus du \r, lireJsonl (absent, fin tronquée, milieu illisible), reparerFins, fusion de config-essai.json, vivant, époque stable, clé à 7 morceaux
- Nom : essai à la main de enfant.js --essai (graine 910000, 45 s)  
  Passe : true  
  Détail : redonne l'empreinte 8d34b0578072 de l'inventaire ; stdout ne porte que la ligne JSON

### Problèmes

- L'époque bouge pendant que les autres développeurs écrivent modele.js (elle est passée de 61fd6cc45dd4 à e3c717485683 entre deux essais) : c'est voulu, mais tout le cache de essais/ devient caduc à chaque retouche de modele.js. Les tests figent donc l'époque (option --epoque).
- Le chien de garde n'a été vérifié qu'à 25 s. La valeur réelle de 1 200 s n'a pas tourné. Sans chien de garde, un pilote qui boucle est abandonné par piloter.js au bout d'environ 2 min (« panne ») puis écarté par le tri ; ce chemin-là n'a pas été testé.
- Test d, « un pilote qui lève une erreur » : je l'ai compris comme une erreur au chargement (course non mesurée). Une erreur dans decide reste mesurée, selon la règle de noter.js et du contrat. Si une erreur dans decide doit aussi rendre la course non mesurée, il faut changer la règle dans note.pourquoiEcartee, pas dans courses.js.
- Les enfants orphelins sont morts aussitôt après le kill du maître sous Windows. Je pense que c'est l'écriture dans un tuyau fermé (EPIPE), mais je ne l'ai pas vérifié ; la sortie sur 'disconnect' n'agit qu'en fin de course.
- La relance d'une course non mesurée passe en tête de file, donc l'ordre de lancement n'est plus exactement l'ordre des tâches quand il y a une relance (écrit dans INTERFACES.md).
- Il n'y a pas de .gitignore dans ml/evolution/ : il revient au développeur 5. Il doit couvrir essais/, et etat/*.fragment-* que j'ai ajouté au contrat.
- Les essais ont mesuré environ 17 à 30 s par course de 45 s, en comptant l'ouverture du jeu (une course de 300 s : 60 à 80 s). Ce n'est pas un banc : d'autres mesures tournaient sur le PC.

### Écarts à la consigne

Tous ces écarts sont écrits dans INTERFACES.md, § 2.2, au paragraphe « Précisions du développeur 1 ».

1. K.epoque(cfg, o) accepte o.tolererManquants : un fichier absent compte alors 'absent' au lieu de lever. Seuls la ligne de commande et les tests le passent, parce qu'ils devaient tourner avant que modele.js n'existe. evoluer.js ne doit jamais le passer.
2. La ligne de commande a trois options en plus. --chien remplace cfg.chienDeGarde_s. --epoque f.json fige l'époque, pour les tests. --bavard imprime tout le journal. Elle imprime aussi « course : lancee graine G pid P » ; le test c s'en sert pour suivre les orphelins.
3. À la reprise, une ligne tronquée en fin de fichier n'est pas seulement ignorée : elle est mise de côté dans <fichier>.fragment-<date> puis coupée du fichier. Sans cela, la ligne suivante s'y collerait et lireJsonl lèverait ensuite sur une ligne illisible au milieu.
4. Une clé demandée en double n'est jouée qu'une fois, et les deux tâches reçoivent le même objet. Une relance passe en tête de file. Une clé qui a déjà une ligne mesuree:false part directement à l'essai 2, ce qui garde la reprise déterministe.
5. arreter({dur:true}) n'écrit aucune ligne pour les enfants tués : leur tâche rend null.
6. Une ligne rendue du cache porte _cache, non énumérable, donc absent du JSON. Une ligne non mesurée garde toujours graine et tmax.
7. pilotes/<sha12>.js est écrit octet pour octet par .tmp + rename, sans passer par ecrireAtomique, qui refuserait un \r.
8. courses.js garde une recopie de secours de pourquoiEcartee pour le cas où note.js manque ; elle n'a pas servi, note.js existait au moment des tests.
9. Les tests sont dans tests/courses.test.js et tests/commun.test.js, pas dans un fichier par module.

## 4. module:note

*Rôle : constructeur du module « note » : écrit le code et ses tests, en parallèle des trois autres. Phase : Modules.*

### Résumé

J'ai écrit note.js et graines.js (étape 3) dans ml/evolution/, avec leurs tests dans ml/evolution/tests/. Tous les tests passent : 8 sur 8 pour graines, 13 sur 13 pour note, en 0,5 s sur un cœur.

Les trois contrôles de l'étape 3, sur courses-0.json (34 pilotes × 24 graines, 816 courses) :
- (a) le b moyen du lot 930000 est de −0,799 par rapport au lot 910000 (attendu ≈ −0,8). L'écart-type des résidus vaut 3,208, celui de l'étude 3,21.
- (b) la fiabilité lot 1 / lot 2 de â est de 0,4430. C'est exactement celle du palier moyen brut : dans un plan complet, â en est une transformation linéaire.
- (c) l'écart classique de pilote-voltige est de 1,666 sur 18 parties. Sa grande note (note-voltige4-t900.json) est reconnue par le sha de ml/ecurie/pilote-voltige.js. Son E « dans la foule » vaut 0,839 ± 0,066.

`node ml/evolution/note.js --etude <courses-0.json>` imprime TOUT PASSE en 0,2 s.

Ce que fait note.js, sans effet de bord :
- les moindres carrés alternés pilote + graine, le rétrécissement, se_a, et la survie par le même modèle ;
- E avec la zone morte, la borne à 8, les poids 0,5 et ePire sous 5 parties, plus se_E par bootstrap des parties ;
- la note F = â − 4·E et son erreur-type se_F ;
- `comparer`, un bootstrap apparié par graine, avec les critères a, b et c et le sacre ;
- `pourquoiEcartee`, `referenceEpoque`, `depuisEtude`, et la ligne de commande sur l'état (lecture seule ; elle a tourné sur un état vide sans erreur).

graines.js : mulberry32 suivant la formule exacte du contrat, `rngDe`, le tirage d'entraînement sans remise puis avec remise hors des 5 derniers lots, le compteur de validation et son repli, le coffre.

Les tests de graines ont trouvé un vrai défaut, corrigé depuis : le paramètre de mulberry32 s'appelait « etat », et la fonction `etat()` hissée le masquait. Tous les générateurs partaient donc de 0.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\graines.js  
  Role : mulberry32, rngDe, etatInitial, grainesEntrainement, grainesValidation, grainesCoffre ; --essai
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\note.js  
  Role : pourquoiEcartee, referenceEpoque, ajuster, ecartFoule, noter, comparer, depuisEtude, controlesEtude ; --etude et note de l'etat
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\graines.test.js  
  Role : formule mulberry32 au bit pres, lois des tirages, reprise du generateur et des lots apres relecture JSON, sans remise puis hors recents, validation/repli/fin, coffre, rngDe
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\note.test.js  
  Role : etape 3 sur courses-0.json, a_p/b_g connus (sans bruit et avec bruit), exclure, E (zone morte, borne, poids), E=4 sous 5 parties, se_E, noter, bootstrap apparie a reponse connue, sacre d'un vrai meilleur, pourquoiEcartee, depuisEtude, temps
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : ajout de deux paragraphes « Precisions de l'implementation » aux § 2.5 et 2.6 (rien d'autre n'a change)

### Tests

- Nom : etape 3 (a) b du lot 930000 par rapport au 910000  
  Passe : true  
  Détail : -0,799 (attendu -0,8 ± 0,1) ; sigma des residus 3,208 (etude 3,21)
- Nom : etape 3 (b) fiabilite lot 1 / lot 2 de â  
  Passe : true  
  Détail : 0,4430, egale a celle du palier moyen brut (34 pilotes)
- Nom : etape 3 (c) ecart classique de pilote-voltige  
  Passe : true  
  Détail : 1,666 sur 18 parties (note-voltige4-t900, reconnue par le sha) ; E 0,839 ± 0,066
- Nom : modele sans bruit, plan incomplet a 18 % : a_p et b_g retrouves  
  Passe : true  
  Détail : ecart maximal 1,5e-13
- Nom : modele avec bruit N(0,3) : a a l'erreur-type pres, sigma ≈ 3, formules de â et se  
  Passe : true
- Nom : exclure, lignes non mesurees, entree intacte  
  Passe : true
- Nom : E : zone morte, borne a 8, poids 0,5  
  Passe : true  
  Détail : E = 2, 0, 7 et 4/13 exacts
- Nom : pilote sans assez de parties : E = 4, se_E = 0, F = â - 16  
  Passe : true
- Nom : se_E bootstrap deterministe et de l'ordre attendu  
  Passe : true
- Nom : noter : F, se_F, determinisme, ids demandes  
  Passe : true
- Nom : comparer : bootstrap apparie a reponse connue  
  Passe : true  
  Détail : dPalier 2 ± 0,2095 (attendu 0,2041 malgre un effet de graine de ±10), dE 1,5 exact, dF -4
- Nom : comparer : vrai meilleur sacre, clone non sacre  
  Passe : true
- Nom : pourquoiEcartee  
  Passe : true
- Nom : depuisEtude  
  Passe : true
- Nom : note.test.js en moins de 10 s  
  Passe : true  
  Détail : 0,5 s
- Nom : mulberry32 conforme a la formule (5 etats x 1000 tirages)  
  Passe : true  
  Détail : echouait au premier passage (parametre masque par la fonction etat hissee) ; corrige
- Nom : reprise du generateur et des lots apres sauvegarde JSON et relecture  
  Passe : true
- Nom : entrainement sans remise sur 1081, puis hors des 5 derniers lots  
  Passe : true
- Nom : validation : compteur, repli, fin avec alerte ; coffre ; rngDe  
  Passe : true

### Écarts à la consigne

Tout est écrit dans INTERFACES.md (§ 2.5 et § 2.6, paragraphes « Précisions de l'implémentation ») :
1. **ajuster, centrage de b.** Au centrage, la constante retirée aux b est rendue aux a. L'ajustement a+b ne change pas et les a de la dernière passe restent cohérents avec les b. La lettre de la spec ne le disait pas ; sans cela, les a seraient décalés de la moyenne des b.
2. **sigmaRes.** Il divise par N − P − G + 1, les degrés de liberté du modèle additif, et retrouve ainsi le 3,21 de l'étude.
3. **Paramètres acceptés.** `noter`, `comparer` et `ecartFoule` acceptent cfg complet ou cfg.note. Par défaut, `comparer` prend `tirages` dans cfg.validation.bootstrap, sinon 400, et `rng` = rngDe('comparer|n').
4. **Un id sans course.** Avec `ids`, il rend `n:0, a:null, ahat:abar, se_a:null, se_F:null, E:ePire`.
5. **depuisEtude.** `id` = les 12 premiers caractères du sha, `pilote` = le sha complet, plus les champs tmax, fichier et lot.
6. **Ajout : controlesEtude.** Un export de plus, `controlesEtude`.
7. **Graines d'entraînement.** Un lot n'a jamais deux fois la même graine.
8. **Repli des validations.** Quand il est épuisé, il ne rend rien plutôt qu'un lot incomplet.
9. **Pas de commun.js.** graines.js et note.js utilisent crypto directement pour sha1. commun.js n'existait pas quand j'ai commencé ; seule la ligne de commande sur l'état le requiert, avec courses.js.

### Problèmes

- Le critère c du sacre est un « < » strict, comme le veulent la spec et le contrat : dE < +1·se_dE. Si les deux pilotes ont des mesures identiques (se_dE = 0, dE = 0), c est faux. Avec de vraies courses, se_dE n'est jamais nul, mais un cas dégénéré, par exemple deux pilotes sous 5 parties tous les deux, ne peut pas être sacré.
- La ligne de commande « node note.js » sur l'état n'a tourné que sur un état vide (0 course), avec commun.js et courses.js écrits entre-temps par un autre développeur. Elle n'a pas été vérifiée sur de vraies lignes de courses.jsonl.
- Le contrôle (b) passe par construction : dans un plan complet, la fiabilité de â est exactement celle du palier moyen (0,4430). Le seuil 0,44 n'est tenu que de 0,003.
- Le contrôle (c) reconnaît la grande note par le sha actuel de pilote-voltige.js. Si ce fichier change, il retombe sur le nom note-voltige4-t900.json, et le dit.

## 5. module:exploitation

*Rôle : constructeur du module « exploitation » : écrit le code et ses tests, en parallèle des trois autres. Phase : Modules.*

### Résumé

L'étape 6 (l'exploitation) est écrite dans ml/evolution/ et ses tests passent tous : 69 sur 69 pour le tableau et le résumé, 17 sur 17 pour les lanceurs. Rien n'est commité. Aucune course n'a été jouée et rien n'a été écrit hors de ml/evolution/.

- **tableau.js** : `ecrire(cfg)` réécrit `etat/tableau.html` et `etat/resume.txt` en écriture atomique, et rend `{html, resume}`. La ligne de commande est `node tableau.js [--config f]`.
  - La page est faite d'un seul fichier : du SVG en ligne, aucun script, aucune URL, et elle se recharge seule toutes les 5 minutes.
  - Elle a 7 sections, dans l'ordre de la spécification § 8, en français simple, et la courbe du coffre vient en premier (« Est-ce que ça apprend ? »).
  - On y trouve : F, palier et E du meneur, du champion et du témoin par génération ; les 15 z du champion, calculés par `ressemblance.ecart` sur ses courses d'entraînement de l'époque ; la population avec sa note F ± se et un tableau ; la chance du meneur ; la diversité avec sa ligne d'alarme ; la machine (débit, courses non mesurées, pannes, époques, événements) ; un petit lexique.
  - Les changements d'époque et de phase sont marqués sur les courbes. Une valeur absente coupe la ligne au lieu de relier les points par-dessus. La page a un thème clair et un thème sombre.
- **etat.js** : `resume(cfg)` rend au plus 10 lignes, sans accents, de 118 caractères au plus. Elles disent :
  - la génération, la phase et l'époque ;
  - si l'évolution est EN MARCHE, ARRETEE ou ARRETEE SANS PREVENIR, d'après le pid du verrou et son battement ;
  - le débit ;
  - le champion, le meneur et le témoin ;
  - le dernier coffre et la dernière validation ;
  - les courses non mesurées et les pannes ;
  - les alertes.
  
  La lecture est tolérante : une ligne de journal abîmée ou un `population.json` tronqué devient une alerte au lieu d'un plantage.
- **Les lanceurs** : `lancer.cmd`, `arreter.cmd` et `installer-tache.cmd` utilisent des chemins relatifs à `%~dp0`, sont en ASCII et en CRLF.
  - Le mode `auto` de `lancer.cmd` (celui de la tâche planifiée) respecte un arrêt voulu par Sacha, grâce au marqueur `etat/ARRETE`.
  - `arreter.cmd` attend la fin réelle de l'évolution et reconnaît un verrou laissé par un processus mort.
  - `installer-tache.cmd` explique ce qu'il va faire et demande O ou N avant d'agir ; `installer-tache.cmd enlever` retire les tâches.
- **README.md** : le mode d'emploi pour Sacha (lancer, arrêter, lire le résumé et le tableau, prendre un champion, quoi faire si ça s'arrête, ce qu'il ne faut pas faire).
- **.gitignore** et **.gitattributes** (`*.cmd` en CRLF).
- **L'état d'exemple** : 30 générations inventées après la génération 0, conformes à INTERFACES.md § 3, fabriquées de façon déterministe (deux fabrications donnent les mêmes octets). Une nouvelle époque à la génération 13, le passage à 8 graines à la 18, un sacre à la 20, la phase B à la 25, des pannes et des courses non mesurées.
- La page a été regardée dans le navigateur, servie par 127.0.0.1 depuis un petit serveur du bloc-notes, et deux défauts d'affichage ont été corrigés. L'accès en file:// est refusé par le volet Browser, donc l'ouverture hors ligne est prouvée par le contenu de la page, pas en la regardant.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js  
  Role : ecrire(cfg) -> etat/tableau.html (SVG en ligne, 7 sections, hors ligne) et etat/resume.txt ; page(cfg) pour les tests ; CLI --config
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\etat.js  
  Role : resume(cfg) -> 10 lignes (CLI node etat.js [--config f]) ; lire(cfg) lecture tolerante partagee avec tableau.js
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\lancer.cmd  
  Role : lance evoluer.js depuis la racine du depot, console dans etat\sortie.log ; mode auto (tache planifiee) qui respecte etat\ARRETE ; rend le code de evoluer.js
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\arreter.cmd  
  Role : cree etat\STOP et etat\ARRETE, attend la disparition du verrou (ou constate un processus mort), au plus 20 min
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\installer-tache.cmd  
  Role : a lancer par Sacha seulement : explique, demande O/N, pose les taches CashCarEvolution (onlogon +5 min) et CashCarEvolution-relance (horaire), coupe la veille sur secteur ; argument enlever
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\README.md  
  Role : mode d'emploi pour Sacha
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore  
  Role : courses*.jsonl, pilotes/, sortie.log, verrou.json, STOP/PAUSE/ARRETE, *.tmp, essais/
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitattributes  
  Role : *.cmd text eol=crlf
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\fabriquer-etat-exemple.js  
  Role : fabrique l'etat d'exemple deterministe (30 generations inventees)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-exemple\  
  Role : l'etat d'exemple : population.json, generations/validations/morts/coffre.jsonl, courses-2026-48.jsonl, verrou.json
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\tableau.test.js  
  Role : 69 controles : exemple complet, en marche, etat absent, vide, tronque ; CLI etat.js et tableau.js
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\lanceurs.test.js  
  Role : 17 controles de lancer.cmd et arreter.cmd dans un bac au chemin avec espaces, avec un faux evoluer.js
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : complete : fichier ARRETE (§ 1), ajouts de tableau.js et etat.js (§ 2.8, 2.9), nouveau § 2.9 bis les lanceurs, .gitignore (§ 7)

### Tests

- Nom : tests/tableau.test.js  
  Passe : true  
  Détail : 69/69. Sur l'exemple complet : - tableau.html commence par <!doctype html>, n'a aucune URL http, aucun script, link, src=, url() ni @import, aucun \r, ni NaN ni undefined, et ses balises sont équilibrées ; - les 7 sections sont dans l'ordre (le coffre d'abord), avec au moins 10 courbes SVG, les 15 barres de z et une ligne de population par vivant (26) ; - les marques d'époque et de phase sont là, et l'écriture prend environ 250 ms. Le résumé : - `resume.txt` est identique à `etat.resume()` ; - il fait 10 lignes de 120 caractères au plus, en ASCII ; - la ligne de commande `node etat.js --config` donne les mêmes lignes ; - `node tableau.js --config` sort en code 0. Les états : - en marche (pid vivant), arrêt demandé, battement périmé, ARRETE : chacun donne le bon texte ; - dossier absent ou vide : rien ne lève et la page est valide ; - état tronqué (population.json coupé de moitié puis vide, generations, courses et verrou coupés, une ligne abîmée au milieu du coffre) : rien ne lève, les alertes « population.json illisible » et « ligne abîmée » apparaissent, et la ligne de commande sort en code 0.
- Nom : tests/lanceurs.test.js  
  Passe : true  
  Détail : 17/17 dans un bac au chemin avec espaces (essais/test lanceurs/depot copie/ml/evolution), avec un faux evoluer.js : - les options sont passées à evoluer.js, le dossier courant est la racine du dépôt et la console va dans sortie.log ; - le code 2 remonte jusqu'à lancer.cmd ; - `auto` avec ARRETE ne lance rien et le journal le dit ; - un lancement à la main efface ARRETE et STOP ; - `auto` n'est jamais passé à evoluer.js ; - lancer en tâche de fond puis arreter.cmd : « C'est arrete », le verrou est parti, ARRETE reste ; - arreter.cmd sur le verrou d'un processus mort dit « Rien ne tournait » et efface STOP ; - arreter.cmd sans verrou s'arrête tout de suite. Le premier passage avait un ECHEC : arreter.cmd lisait verrou.json juste après sa disparition et concluait « Rien ne tournait ». C'est corrigé : un fichier disparu (ENOENT) veut dire « arrêt fini ». Le test a ensuite passé deux fois de suite.
- Nom : node ml/evolution/etat.js sur l'etat reel absent  
  Passe : true  
  Détail : 10 lignes, code 0 : « Pas encore lance (le dossier ...\etat n'existe pas) ».
- Nom : rendu visuel de tableau.html  
  Passe : true  
  Détail : Vérifié par des captures d'écran du volet Browser, via un serveur local 127.0.0.1 (file:// est refusé par le volet). Deux défauts corrigés : la ligne du champion recouvrait celle du témoin tant qu'ils étaient le même pilote, et l'absence de meneur après une nouvelle époque était reliée par-dessus au lieu de couper la ligne. Contrôle à l'œil, pas un test automatique.

### Écarts à la consigne

Tous ces écarts sont écrits dans INTERFACES.md (§ 1, 2.8, 2.9, 2.9 bis, 7).

1. **Nouveau fichier d'état `etat/ARRETE`.** arreter.cmd le crée et lancer.cmd lancé à la main l'efface. Le mode `lancer.cmd auto` de la tâche planifiée ne lance rien s'il existe. Sans lui, la relance horaire de la spécification redémarrerait dans l'heure une évolution que Sacha vient d'arrêter. evoluer.js n'a pas à le connaître.

2. **lancer.cmd lancé à la main efface aussi un `STOP` qui traîne.** Le contrat disait que seul evoluer.js efface STOP. Laissé en place, un STOP fait s'arrêter le lancement suivant aussitôt.

3. **installer-tache.cmd utilise `/sc onlogon` au lieu de `/sc onstart` (spécification § 8).** Une tâche lancée au démarrage tourne hors de toute session, donc sous le compte SYSTEM ou avec un mot de passe enregistré dans Windows. Ici, elle tourne sous le compte de Sacha, sans mot de passe stocké, plus une relance toutes les heures. Conséquence : la session de Sacha doit être ouverte après un redémarrage.

4. **etat.js et tableau.js lisent les journaux de façon tolérante.** Une ligne abîmée est sautée et signalée en alerte, là où `commun.lireJsonl` lève, pour ne jamais planter.

5. **Exports ajoutés.**
   - etat.js : `lire`, `lireConfig`, `chemin`, `args`, `lireJsonlTolerant`, `fichiersCourses`, et les options `o.maintenant` et `o.donnees` de `resume`.
   - tableau.js : `page`, `courbe`, `barresZ`.

6. **Les lignes du résumé sont sans accents** (console Windows en page de code 850).

7. **Les z du champion** se calculent avec `ressemblance.ecart` sur ses courses d'entraînement mesurées de l'époque. Le contrat ne disait pas d'où les tirer, car aucun journal ne les porte.

8. **Les .cmd sont en CRLF, alors que la règle dit LF.** La règle LF vise les fichiers générés. cmd.exe lit mal les .cmd en LF (sauts vers une étiquette ratés), d'où le `.gitattributes` local.

9. **inscrire-champion.js n'est pas écrit.** Il est dans la ligne du dév. 5 au § 7 du contrat, mais hors de la mission confiée.

10. **L'exemple a 31 lignes de générations** (la 0, puis 1 à 30). population.json y est au début de la génération 31.

### Problèmes

- installer-tache.cmd n'a jamais été lancé : il change des réglages de Windows (tâches planifiées, mise en veille), c'est à Sacha de le faire. Les commandes schtasks et powercfg ne sont donc pas vérifiées. En particulier, `/sc onlogon` peut exiger les droits d'administrateur : le script le dit et continue, la tâche horaire suffisant à relancer.
- Windows coupe une tâche planifiée au bout de 72 h (réglage par défaut de schtasks, qu'on ne peut changer que par un fichier XML). La relance horaire la fait repartir, et la reprise ne perd que les courses en cours. C'est documenté, pas évité.
- lancer.cmd n'a pas été essayé avec le vrai evoluer.js, qui n'existe pas encore : il n'a tourné qu'avec un faux maître. Les messages de sortie.log que cite le README (« YEUX CHANGES », « identite », boucle.js, labo) dépendent des textes que choisira evoluer.js.
- lancer.cmd et arreter.cmd visent toujours etat\ (la config par défaut). Avec `lancer.cmd --config config-essai.json`, les marqueurs STOP et ARRETE ne sont pas dans le dossier d'état de l'essai, qui est essais/etat.
- La page tableau.html n'a pas été ouverte en file:// (le volet Browser refuse les fichiers locaux) : elle a été vue servie par 127.0.0.1. L'ouverture hors ligne repose sur le contrôle du contenu (aucune URL, aucun script, aucune ressource externe).
- Si l'écriture du fichier échoue (disque plein, droits), tableau.ecrire lève, ce qui est conforme au contrat. evoluer.js devra l'attraper pour ne pas s'arrêter à cause du tableau.
- Les pannes par génération sont lues en filtrant le texte des fichiers courses-*.jsonl (`"pannes":[1-9]`). Le tableau les lit tous, etat.js seulement les deux derniers. Sur des semaines de courses, cela peut prendre quelques secondes par génération : à mesurer sur le Ryzen.
- Il reste un petit serveur de test (bloc-notes, port 47811, 127.0.0.1) lancé en tâche de fond ; il s'éteint seul au bout de 10 minutes. Les bacs de test essais/test-tableau et « essais/test lanceurs » restent sur le disque (ignorés par git).

## 6. integrateur

*Rôle : intégrateur : assemble les modules, écrit le programme maître evoluer.js et ses essais de bout en bout. Phase : Integration.*

### Résumé

Le maître `evoluer.js` est écrit et les sept tests de la mission passent, sur un état à part : `ml/evolution/essais/tests-evoluer/etat`, avec config-essai.json et 4 travailleurs. Les tests sont dans `tests/evoluer.test.js`, étapes a, bd, c, e, f, g et t ; ils durent environ 25 minutes en tout. Rien n'est commité, rien n'a été écrit hors de `ml/evolution/`, `ml/labo/labo.js` n'est pas touché, et ni boucle.js, ni chaine.js, ni verifier.js n'a été lancé.

**Ce que fait `evoluer.js` :**
- le verrou (création exclusive, battement, reprise d'un verrou mort) et le refus de partir : marqueurs du labo lus sans rien écrire, boucle.js cherché par PowerShell ;
- l'époque, avec l'identité vérifiée au premier lancement et à chaque époque neuve ;
- la génération 0, puis les naissances : tournoi, croisement, mutation, un immigré, et remutation des doublons ;
- les courses, la note, le retrait des graines non mesurées et le renvoi d'office après 2 pannes ;
- le renvoi des F les plus bas, la validation selon la règle 6 avec la malédiction du gagnant, la revalidation après une nouvelle époque, le sacre et les fichiers du champion ;
- le coffre (époque, sacre, 24 h), les phases A→B→C et l'économie des graines ;
- les quatre journaux, le tableau, STOP, PAUSE et Ctrl+C ;
- les options `--une-generation`, `--arret-apres N`, `--valider-maintenant`, `--banc`, `--config`, `--travailleurs`, et deux ajouts : `--etat` et `--bavard`.

**Raccords corrigés :**
1. `config-essai.json` : travailleurs passé de 3 à 4, comme le demande la mission. protectionCourses passé de 3 à 6 : avec 3, un nouveau-né de l'essai pouvait être viré dès sa première génération.
2. population.json est aussi écrit en fin de génération (`etape:'fin'`). Sans cela, la reprise prévue par le contrat (§ 6.1) refaisait une génération finie avec des décisions qui dépendent de l'horloge (économie des graines, coffre de 24 h) et recopiait ses journaux.
3. Les journaux d'une génération refaite ne sont jamais écrits deux fois.
4. `refusDePartir` n'appelle pas `labo.inscriptionsEnCours`, parce que cette fonction efface des fichiers dans ml/labo.

**`inscrire-champion.js`** est écrit mais n'a jamais été lancé (`node --check` seulement). La ligne à ajouter à la main dans ml/labo/labo.js (ligne 98) :

`function sansCout(modele){return modele==='main'||/abonnement$/.test(String(modele||''))||/^evolution/.test(String(modele||''));}`

`tableau.js` et `etat.js` tournent sans erreur sur l'état obtenu : génération 5, époque e01a25acbba9, 10 lignes de résumé, page de 49 664 octets sans NaN.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js  
  Role : Le maître : verrou, refus de partir, époque et identité, génération 0, naissances, courses, note, renvoi, validation, revalidation, sacre, coffre, phases, économie, journaux, tableau, STOP, PAUSE, Ctrl+C, --banc et --valider-maintenant. Exports : generation, charger, preparer, verrouiller, refusDePartir, ecrireChampion, validerMaintenant, banc, chemins.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\inscrire-champion.js  
  Role : Étape 9 : inscrit un champion au labo à l'étape N1. Il rejoue le champion par enfant.js avec complet:true, puis appelle L.inscrire, L.valider et L.clore. Option --essai. Écrit, jamais exécuté.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\evoluer.test.js  
  Role : Tests a, bd, c, e, f, g et t de la mission, lancés un par un ou tous à la suite. État dans essais/tests-evoluer/, une sortie de log par lancement.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config-essai.json  
  Role : travailleurs 4, protectionCourses 6 (avec une note qui l'explique)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : Précisions de l'intégrateur ajoutées au § 2.10 (maître), § 2.11 (inscrire-champion et la ligne du labo), § 3.4 (population.json écrite aussi en fin de génération, champs en plus) et § 3.5 (sens de courses.demandees)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\tests-evoluer\etat  
  Role : L'état laissé par les tests (ignoré par git) : 6 générations, 2 époques, population.json, journaux, tableau.html, resume.txt

### Tests

- Nom : (a) --une-generation sur un état vide  
  Passe : true  
  Détail : Code 0 en 192 s. L'identité donne IDENTIQUE sur 910000, 910037 et 910074 (8d34b0578072, c4b906ba0a4f, 59db7c95e6f3). La génération 0 compte 4 vivants et 12 courses mesurées, plus 2 courses du coffre (époque). Tous les fichiers sont écrits : population.json, les quatre journaux, pilotes/, tableau.html, resume.txt. Le verrou est retiré, aucun \r.
- Nom : (d) deux lancements  
  Passe : true  
  Détail : Le second lancement sort en 1 s avec le code 2 (« REFUS DE PARTIR : une evolution tourne deja sur cet etat (pid …) »). Le premier continue.
- Nom : (b) kill dur au milieu des courses de la génération 1, puis relance  
  Passe : true  
  Détail : Tué par SIGKILL après 2 courses de la génération 1. La relance reprend le verrou, annonce « reprise » et ne refait pas les naissances (mêmes ids : 5da8f536f7ac et f972c4cbd310). Elle compte 18 courses demandées : 2 rendues par le cache, 16 jouées, aucune clé mesurée en double. Aucun enfant orphelin ne restait.
- Nom : (c) PAUSE puis STOP  
  Passe : true  
  Détail : PAUSE entre deux générations : aucune course pendant 40 s, le verrou reste tenu. PAUSE au milieu des courses : 38 → 42 → 42 lignes, donc les courses en cours finissent (au plus 4) et aucune ne part. Les courses reprennent après chaque levée. STOP : code 0 en 20 s, STOP effacé, verrou retiré, plus aucune course ensuite. La génération 2 est annoncée « interrompue, reprise au prochain lancement ».
- Nom : (e) trois générations de suite (--arret-apres 3)  
  Passe : true  
  Détail : Code 0 en 432 s. Les générations 2 (reprise, 16 courses du cache), 3 et 4 sont faites. Les générations 1 à 4 virent chacune 2 pilotes et gardent μ = 4 vivants. Le témoin et le champion ne sont jamais virés. morts.jsonl compte 8 lignes pour 8 ids.
- Nom : (f) --valider-maintenant, puis le champion noté par noter.js  
  Passe : true  
  Détail : Verdict écrit pour d06b00776ec3 contre le témoin : 6 courses sur 1000000, 1000037 et 1000074, dF 0,29 ± 2,40, pas sacré (critère a faux). Faute de sacre, le fichier du champion a été écrit par evoluer.ecrireChampion pour le meneur, dans essais/tests-evoluer/champions-essai/g0004-aceef6d5.js. Son .js est identique à celui de pilotes/ et son sha correspond au .json. noter.js (1 graine, 936714, tmax 60, régime allégé) redonne exactement la course de courses.jsonl : empreinte e27cd5d56e4a, vues 02b3cf4a7825, palier 4, 60 s.
- Nom : (g) config d'époque changée (retourFige.rv 0,21)  
  Passe : true  
  Détail : La console dit « nouvelle epoque : reseaux/retourFige (e3c717485683 -> e01a25acbba9) ». L'identité est refaite. population.json passe à la nouvelle époque (depuis la génération 5) et generations.jsonl la marque. Toutes les courses sont rejouées (cache 0, 20 jouées) et le coffre « époque » court.
- Nom : (t) tableau.js et etat.js sur l'état obtenu  
  Passe : true  
  Détail : Code 0 pour les deux. etat.js tient en 10 lignes. tableau.html fait 49 664 octets, sans URL externe, sans NaN ni undefined.
- Nom : Tests rapides des autres modules (non-régression)  
  Passe : true  
  Détail : commun 11/11, graines 8/8, note 13/13, genome 14/14, tableau 69/69, lanceurs 17/17.

### Problèmes

- Le chemin du sacre n'a jamais tourné de bout en bout : la seule validation n'a pas sacré (3 graines, se_dF 2,4). L'enchaînement sacrer() (nouveau champion protégé, fichier écrit dans dossierChampions, coffre « sacre », sansSacre remis à 0) n'est donc pas testé. Seul ecrireChampion l'est, appelé à part par le test f. La revalidation d'un champion qui n'est pas le témoin n'a pas tourné non plus.
- --banc n'a pas été lancé : il réécrit travailleurs et banc.resultats dans le vrai config.json. Les passages de phase A→B→C, l'économie des graines (12 → 8), la règle 6 qui passe à 3 et le chien de garde à 1 200 s ne sont pas testés.
- inscrire-champion.js n'a jamais été exécuté, comme demandé. Il échouera tant que la ligne sansCout de labo.js n'est pas ajoutée à la main. Son appel L.clore('N1', G) suit le contrat sans avoir été vérifié contre un vrai journal du labo.
- À la première génération d'une époque neuve, personne n'a les courses de protection : aucun renvoi possible, et les vivants passent à μ + λ (6 en génération 5 de l'essai). La génération suivante en virera plus d'un coup. C'est la règle de la spécification (les notes repartent de 0), mais à surveiller.
- pannesGeneration ne somme que la dernière tentative de chaque course. Une panne au premier essai suivie d'une relance réussie ne compte pas pour le renvoi d'office.
- Si PowerShell échoue, refusDePartir ne refuse rien : boucle.js passerait inaperçu, sans avertissement à la console.
- lancer.cmd et arreter.cmd visent toujours etat\ : ils ne servent pas à un état passé par --etat ou --config (problème déjà signalé par le dév. 5).
- L'alerte « population trop semblable » (distance 0,03 à 0,05) s'allume dès la génération 0 de l'essai : c'est normal, les mutants de départ ne changent que 3 à 6 gènes.

### Écarts à la consigne

Tous ces écarts sont écrits dans INTERFACES.md (§ 2.10, 2.11, 3.4 et 3.5).

1. **Fin de génération :** population.json est réécrit à la fin de chaque génération (`etape:'fin'`), et pas seulement au début comme le dit le § 6.1. Sans cela, la reprise d'une génération finie dépendait de l'horloge (économie des graines, coffre de 24 h) et recopiait les journaux.
2. **Champs en plus dans population.json :** `etape`, `naissancesGeneration`, `abandonsGeneration`, `coffreEpoque` et `epoque.composants`. Ce dernier sert à dire ce qui a changé à une nouvelle époque. Les journaux d'une génération refaite ne sont jamais recopiés.
3. **`E.charger` est synchrone.** L'étape « époque, identité, génération 0 » est dans `E.preparer`, qui est asynchrone. Exports en plus : preparer, validerMaintenant, banc, chemins, ecrireChampion.
4. **Options en plus :**
   - `--etat dossier` : relatif à ml/evolution ou absolu ; les champions vont alors dans `<etat>/champions` ;
   - `--bavard`.
5. **Identité et coffre :** l'identité est vérifiée aussi au premier lancement. Le coffre court au premier lancement et à chaque nouvelle époque (raison « epoque »).
6. **Doublons :** un enfant abandonné pour doublon n'est écrit que comme événement, sans ligne dans morts.jsonl. La raison « doublon » n'est donc jamais écrite.
7. **`refusDePartir` :** il lit lui-même les marqueurs du labo, parce que `labo.inscriptionsEnCours` en efface.
8. **`courses.demandees` :** il compte toutes les tâches de la génération (entraînement, validation, coffre).
9. **config-essai.json :** travailleurs 4 et protectionCourses 6.
10. **Test (g) :** l'époque change par `retourFige.rv` (0,21 au lieu de 0,2) dans une config à part. Ce paramètre entre dans le sha « reseaux » de l'époque et change réellement la loi « retour ». Je n'ai touché aucun octet de yeux.js.
11. **Test (f) :** il n'y a pas eu de sacre, donc le fichier du champion vient d'`ecrireChampion` appelé pour le meneur, pas d'un vrai sacre. Le test le dit.
12. **Retouches non enregistrées :** git ne montre aucune modification dans ml/bot. Les retouches de la loi « retour » (amendement 4) semblent déjà dans le commit 49012f2d9 ; l'identité passe telle quelle.

## 7. relecture:statistique

*Rôle : relecteur « statistique » : relit le travail des autres et relève les défauts, sans les corriger. Phase : Relecture.*

### Défauts relevés

- **La règle de sacre donne environ 18 % de faux sacres quand le meneur ne vaut pas mieux que le champion, et ne voit +1 palier que 38 % du temps**  
  Gravité : important  
  Fichier : ml/evolution/note.js  
  Preuve : Ligne 132 : criteres={a:p.dF>1*se_dF,…}. Le seuil de 1 se est celui de la spécification (§ 7.6) ; le code la suit à la lettre. Commande : node ml/evolution/tests/relecture-statistique/d-sacre-nul.js 300 (300 essais, 24 graines, 400 tirages ; courses réelles tirées des 4 grandes notes de 900 s de pilote-voltige ; effet de graine commun). Sortie : « vrai ecart de palier 0 : sacre 18.3 % ; (a) 18.3 %, (b) 85.0 %, (c) 84.3 % » ; « vrai ecart de palier 1 : sacre 37.7 % » ; « vrai ecart de palier 2 : sacre 65.7 % ». Les critères (b) et (c) ne filtrent presque rien quand il n'y a pas d'écart. Environ une validation sur cinq sacre donc un champion qui ne vaut pas mieux : il est protégé, il sert de souche à l'immigré et il fausse la courbe du coffre « champion − témoin ».  
  Correction proposée : Mettre le critère (a) à ΔF > 2·se(ΔF), soit environ 2 à 3 % de faux sacres. Le seuil peut aussi passer dans config.json (validation.seuilSacre). Autre voie : une validation en deux temps, avec 24 graines de plus seulement quand 1 se < ΔF < 2 se. À écrire dans la spécification, puisque c'est une règle et pas une faute de code.
- **Le rétrécissement tire vers ā calculé sur tous les pilotes de l'époque, morts compris, ce qui pénalise les nouveau-nés de 0,3 à 0,6 palier**  
  Gravité : important  
  Fichier : ml/evolution/note.js  
  Preuve : Ligne 72 : abar=moy(M.ids.map(i=>M.a[i])). M.ids contient tous les id des lignes de l'époque, y compris les pilotes virés, puisque evoluer.js chargerLignes (l. 109-113) ne filtre pas les vivants. Les virés sont surtout les malchanceux du bruit, donc ā tombe sous la moyenne des vivants. Commande : node tests/relecture-statistique/a-calcul-main.js, sortie « escalier 30 generations : … ā (morts compris) -0.087 contre moyenne des vivants 1.545 (ecart 1.632) ; penalite d'un nouveau-ne moyen a 24 courses : 0.544 palier ». Commande : node tests/relecture-statistique/b-retrecissement.js, sortie (vrai σ_a 0,3, le cas réaliste) « cible tous : nouveau-nes = 66.3 % des vires pour 30.0 % des renvoyables ; moyenne des vivants - ā(tous) 0.956 » contre « cible vivants : 54.7 % des vires ». Un nouveau-né à 24 courses perd (1 − 24/36) × écart ≈ 0,32 palier sur un ancien à 200 courses (qui ne perd que 0,06), soit la moitié de son se_a (0,67). Ce que je n'ai pas pu montrer : le gain final. Le vrai a moyen des vivants vaut 0,208 contre 0,171 sur 6 répétitions, une différence dans le bruit.  
  Correction proposée : Calculer ā sur les vivants seulement : passer o.ids de noter à ajuster et prendre abar=moy(ids vivants), ou la moyenne des a pondérée par n des vivants. Le dire dans INTERFACES.md § 2.6, puisque la spécification dit seulement « la moyenne des a ».
- **Une mesure absente de toutes les parties d'un pilote sort de E : elle ne compte ni pour ni contre lui**  
  Gravité : mineur  
  Fichier : ml/evolution/note.js  
  Preuve : Lignes 82-86 : seules les mesures que rend ressemblance.ecart entrent dans Σw, et ressemblance.js l. 75 saute une mesure sans valeur. Or volDuree, volsCourts et volHaut sont nulles sous 3 vols ou 3 poses, aller sous 10 allers, vitesse sous 100 échantillons (ressemblance.js l. 52-57). Commande : node tests/relecture-statistique/e-E-a-la-main.js, sortie « 5 parties : E 1 (a la main 1) » puis « 5 parties sans volDuree : E 1.3333 (… la mesure absente ne compte ni pour ni contre) ». Un génome qui fait disparaître une mesure de toutes ses parties change le dénominateur de E, et donc F, sans ressembler davantage aux joueurs. Ce n'est pas observé : les 14 lots de l'étude ont tous leurs 15 mesures (c-biais-E.js).  
  Correction proposée : Dans eSimple, donner à une mesure de REF absente chez le pilote le pire e_k (borneZ − zoneMorte = 7) avec son poids, ou E = ePire si plus de 2 mesures manquent. Écrire la règle dans INTERFACES.md.
- **Un pilote dont toutes les courses sont non mesurées, sans que ce soit une panne, n'est jamais renvoyable et fait retirer chaque graine pour tout le monde**  
  Gravité : mineur  
  Fichier : ml/evolution/evoluer.js  
  Preuve : Lignes 450-451 : toute course non mesurée retire sa graine pour l'époque, quel que soit le pilote fautif. Ligne 455 : seul pannesGeneration (des pannes) vire d'office. Ligne 467 : il faut n ≥ protectionCourses pour être renvoyable, et n compte les seules lignes mesurées. Un pilote qui fait non mesuré pour une autre raison que les pannes (chien de garde, processus fini sans résultat, yeuxTirages ≠ 0) garde donc n = 0 : il est immortel, et chaque génération perd toutes ses graines, donc toute la note. J'ai vérifié qu'une course retourOn=1, volMieux=1 est bien mesurée (node tests/relecture-statistique/f-retour-mesuree.js : « retourOn=1,volMieux=1 graine 910037 : MESUREE ; … yeuxTirages 0, pannes 0 ») : aucun déclencheur n'est connu aujourd'hui.  
  Correction proposée : Quand toutes les courses non mesurées d'une graine viennent d'un seul pilote, retirer seulement ses lignes à lui. Virer d'office un pilote qui a ≥ 2 courses non mesurées dans une génération, quelle qu'en soit la raison (raison 'non-mesuree').
- **Les pannes ne sont comptées que sur le dernier essai de chaque course**  
  Gravité : mineur  
  Fichier : ml/evolution/evoluer.js  
  Preuve : Ligne 452 : v.pannesGeneration+=l.pannes|0, avec l la ligne rendue par courses.js. Un premier essai en panne suivi d'une relance réussie (courses.js l. 198-201) n'est donc pas compté. La spécification (§ 5.3) dit : « 2 pannes de cerveau sur une génération = viré ». L'intégrateur l'avait déjà signalé ; c'est confirmé dans le code.  
  Correction proposée : Faire rendre à courses.js les pannes de tous les essais (par exemple l.pannesEssais, la somme), ou relire memoire.get(cle) pour additionner les lignes non mesurées de la génération.
- **La référence des joueurs ne se recalcule pas quand l'étalon change en cours de marche**  
  Gravité : mineur  
  Fichier : ml/evolution/note.js  
  Preuve : note.js l. 45 : referenceEpoque() appelle ressemblance.joueurs('clavier'), qui garde l'étalon dans le module (ressemblance.js l. 62 : ETALON[quels] gardé). evoluer.js l. 293 rappelle N.referenceEpoque() à chaque génération, et l. 310-313 annonce « nouvelle epoque de notes » quand le sha de etalon/ change. Mais REF reste l'ancien jusqu'au redémarrage : les notes de la nouvelle époque sont faites avec l'ancienne référence.  
  Correction proposée : Quand ep.note change, vider le cache (delete require.cache de ressemblance.js puis recharger), ou arrêter proprement pour qu'un relancement recharge l'étalon.
- **L'économie de graines (12 → 8, sans retour) se déclenche sur une durée qui compte la PAUSE, la validation et le coffre**  
  Gravité : mineur  
  Fichier : ml/evolution/evoluer.js  
  Preuve : Ligne 431 : t0=Date.now() en début de génération. Lignes 530-532 : duree_s>cfg.seuilEconomie_s → pop.nGraines=8, sans aucun retour. Une PAUSE de plus d'1 h 30, ou une génération avec 80 courses de coffre et 48 de validation, fait passer définitivement à 8 graines. La protection des nouveau-nés passe alors à 3 générations, et la puissance par génération baisse.  
  Correction proposée : Mesurer la seule durée des courses d'entraînement, sans le temps passé en PAUSE, et revenir à 12 si la génération suivante redescend sous le seuil.
- **La malédiction du gagnant mélange les validations forcées par --valider-maintenant avec celles de la règle 6**  
  Gravité : mineur  
  Fichier : ml/evolution/evoluer.js  
  Preuve : Ligne 136 (chargement) et ligne 382 : toute ligne usage==='validation' entre dans ctx.maledictions. Or validerMaintenant (l. 568-571) prend le meneur sans le filtre « dépasse de 2 se » ni n ≥ 48, et se rabat même sur autres[0]. La moyenne qui fait passer la règle 6 à 3 se (l. 507-510) inclut donc des validations qui ne mesurent pas la malédiction du gagnant.  
  Correction proposée : Marquer ces validations (forcee:true) et les exclure de ctx.maledictions.

### Vérifié et jugé bon

- Calcul refait à la main (tests/relecture-statistique/a-calcul-main.js) : plan en escalier sans bruit, a = 5, 7, 9 et b = +1, −1, 0. Après 10 passes, ajuster rend exactement a = 5,0000, 7,0000, 9,0000 et b = 1, −1, 0. Le rétrécissement donne 6,7143, 7,0000 et 7,2857, comme à la main ((a − ā)·n/(n + 12) + ā).
- Les 10 passes convergent : sur un escalier simulé de 10, 30 et 60 générations (μ 20, λ 6, 12 graines, bruit 3,3), l'écart à la solution exacte (3000 passes) est au plus de 0,015 palier, et 1 paire sur 190 au plus est classée à l'envers. Le centrage (c retiré aux b et rendu aux a) ne change pas l'ajustement.
- Les degrés de liberté de σ_res (N − P − G + 1) et se_a = σ_res/√n sont conformes au § 6.1.
- E à la main (e-E-a-la-main.js) : la zone morte de 1, la borne de 8, le poids 0,5 de volDuree, ondulation, vols et volsCourts, et E = 4 sous 5 parties sont exacts. F = â − 4E et se_F = √(se_a² + 16·se_E²) sont exacts (X : â 5,2941, F 1,2941, comme à la main).
- Le biais de E selon le nombre de parties est négligeable (c-biais-E.js, données réelles) : +0,005 sur E à 12 parties et +0,003 à 16, soit 0,02 de F au plus. Il ne pénalise pas les nouveau-nés.
- comparer : le bootstrap est bien apparié (mêmes indices de graines pour les deux pilotes, sur les graines mesurées chez les deux). Les critères (a), (b) et (c) sont ceux du § 7.6, avec 400 tirages. Le générateur rngDe('comparer|'+n) est le même pour toutes les validations : c'est sans effet sur la justesse.
- Le déclenchement de la validation suit le § 7.6 : meneur hors champion, n ≥ 48, au plus une validation toutes les 5 générations, F_m − F_c > règle6·√(se_m² + se_c²). La malédiction (ΔF d'entraînement − ΔF de validation) est journalisée, et la règle 6 passe de 2 à 3 après 10 validations de moyenne > 1.
- Le renvoi ne touche pas le témoin ni le champion, et il faut n ≥ 24 courses mesurées de l'époque, hors graines retirées. Le nombre de virés est vivants − μ (6 en régime normal). En cas d'égalité, la survie départage.
- Tournoi : 3 sans remise parmi les vivants qui ont au moins protectionCourses, le témoin compris. Le repli, quand moins de 3 pilotes ont ce minimum, prend ceux du plus grand n. Le second parent exclut le premier. L'immigré est le champion muté fort.
- Pas de fuite entre les graines : entraînement de 910000 à 949960 (i < 1081, sans remise puis avec remise hors des 5 derniers lots), repli de validation de 950000 à 989960, coffre de 990000 à 991443, validation à partir de 1 000 000 (chacune une seule fois). Les ensembles sont disjoints. chargerLignes et courir ne prennent pour la note que usage==='entrainement' de l'époque. La clé du cache contient la graine et tmax, et le sha du pilote porte l'id du génome. L'identité (tmax 45) et le banc (sans cache) ne touchent pas le cache d'entraînement.
- Reprise : les naissances utilisent le générateur sauvé (pop.rng) et ne sont pas refaites à l'étape 'courses'. Une validation interrompue ne sauve pas validationK et rejoue les mêmes graines, que le cache rend telles quelles.
- Une course à loi « retour » (retourOn = 1, volMieux = 1) est bien mesurée : yeuxTirages 0 et aucune panne sur 2 graines de 60 s (f-retour-mesuree.js, 4 courses, sans cache ni écriture). Le témoin donne les mêmes empreintes que la variante sur la graine 910000.
- Contexte, mesuré par simulation (b-retrecissement.js) : avec un vrai écart entre mutants de σ 0,3 palier et un bruit de 3,3, le vrai palier moyen des vivants ne monte que de 0,17 à 0,21 en 40 générations. La sélection est conforme mais faible, comme l'annonce la spécification (§ 12).

## 8. relecture:robustesse

*Rôle : relecteur « robustesse » : relit le travail des autres et relève les défauts, sans les corriger. Phase : Relecture.*

### Défauts relevés

- **Un arret (Ctrl+C, ou STOP) qui tombe pendant que les enfants meurent : la generation est ecrite « finie » avec des courses jamais jouees, et leur graine est retiree pour toute l'epoque**  
  Gravité : important  
  Fichier : ml/evolution/courses.js (l. 198-201) et ml/evolution/evoluer.js (l. 445-451)  
  Preuve : Dans la fenetre de lancer.cmd, Ctrl+C envoie CTRL_C_EVENT a tous les processus de la console. Le maitre le prend « comme STOP ». Les enfants, qui sont dans la meme console sans gestionnaire SIGINT, meurent. Je n'ai pas de console ici, donc je l'ai reproduit autrement : STOP pose et les 4 enfants tues au meme instant, au moment ou la file est vide (les 4 dernieres courses de la generation). Commande : `node tests/relecture-robustesse/stop-et-enfants-morts.js --fin`. Sortie : « courses d'entrainement mesurees : 20/24 : la file est vide » puis « STOP pose et 4 enfants tues ». Le maitre ecrit « course : graine 911332 NON MESUREE (essai 1) : processus fini sans resultat (code 1) », puis « evenement : graine 911332 retiree pour l'epoque », puis « generation 6 finie en 254 s ». Etat obtenu : « generation 6 etape fin, graines retirees [911332] ». Dans generations.jsonl : nonMesurees 4, relancees 0. La cause : quand doitArreter() est vrai, finir() rend la ligne non mesuree a x.fin(l) au lieu de null, et courir() ne voit pas d'interruption tant que la file est vide. Si l'arret tombe en milieu de file, les taches en attente rendent null et la generation est bien interrompue (meme test sans --fin) : le defaut ne frappe que la fin d'un lot. Le lot peut etre l'entrainement, la validation ou le coffre. Avec la vraie config, le renvoi se fait alors sur des notes amputees.  
  Correction proposée : Dans courses.js, a la ligne 198 : si la course n'est pas mesuree et que `arrete||doitArreter()` est vrai, ne pas faire `x.fin(l)` mais `x.fin(null)`. La ligne reste au cache comme essai 1. La generation est alors « interrompue » et reprise au prochain lancement. Mieux encore, dans enfant.js : `process.on('SIGINT',()=>{})`. Les enfants ignorent alors Ctrl+C, et seul le maitre decide (il les tue lui-meme au second Ctrl+C, par arreter({dur:true})).
- **Les echecs dus a la machine (chien de garde, enfant mort, pannes) sont mis au cache pour toujours apres 2 essais : la graine est perdue pour l'epoque, meme apres une relance avec un chien plus long**  
  Gravité : important  
  Fichier : ml/evolution/courses.js (l. 138-139, ligneCachee ; cle l. 54-57)  
  Preuve : Commande : `node courses.js ../ecurie/pilote-voltige.js --graines 2 --tmax 60 --travailleurs 2 --chien 8 --etat tests/relecture-robustesse/etat-chien`. Sortie : « NON MESUREE (chien de garde) · essai 2 » pour les 2 graines (« tuees 4, relancees 2 »). Je relance ensuite SANS --chien, donc avec 1200 s : « NON MESUREE (chien de garde) · cache · essai 2 » et « jouees 0 · cache 2 ». ligneCachee() rend `fini:true` des qu'il y a 2 lignes `mesuree:false` pour la cle. Or chienDeGarde_s n'entre ni dans la cle ni dans l'epoque. Il en va de meme pour « processus fini sans resultat » (un kill, un Ctrl+C : voir le defaut precedent) et pour les « pannes > 0 » de note.pourquoiEcartee, qui dependent de la charge du PC (« d'autres mesures tournent »). Dans evoluer.js, chaque ligne non mesuree retire la graine pour TOUS les pilotes, pour toute l'epoque.  
  Correction proposée : Separer deux sortes d'echecs. Les echecs DETERMINISTES (erreurFatale de chargement, yeuxTirages, autre jeu, autre simulateur) peuvent rester definitifs. Les echecs d'ENVIRONNEMENT ('chien de garde', 'processus fini sans resultat', pannes) ne doivent compter que dans le lancement en cours : par exemple, ne compter dans `ko` que les lignes dont `date` est posterieure au demarrage de l'ordonnanceur, ou marquer ces lignes `env:true` et les ignorer au cache. Dans evoluer.js, ne retirer une graine que sur un echec deterministe, ou apres deux echecs d'environnement dans le meme lancement.
- **Le verrou ne protege pas : deux maitres partis ensemble sur un verrou mort le prennent tous les deux, et un maitre VIVANT dont le battement a pris du retard se le fait prendre puis l'ecrase**  
  Gravité : important  
  Fichier : ml/evolution/evoluer.js (l. 39-52, verrouiller ; l. 621 hors du try)  
  Preuve : (1) Commande : `node tests/relecture-robustesse/verrou-course.js 12`. Le verrou.json d'un pid mort est en place, et deux processus appellent evoluer.verrouiller() a la meme milliseconde. Sortie : « bilan : 5/12 essais ou les DEUX maitres tiennent le verrou ». Dans un autre essai, le perdant ne refuse pas : il leve « EPERM: operation not permitted, rename 'verrou.json.10048.tmp' -> 'verrou.json' at verrouiller (evoluer.js:49) », non rattrape (l. 621 est hors du try). La reprise passe par une simple ecriture (ecrireAtomique) au lieu d'une creation exclusive. Un verrou mort, c'est exactement ce que laisse chaque coupure de courant ou chaque redemarrage, et deux taches planifiees (onlogon et horaire) relancent lancer.cmd auto. (2) Commande : `node tests/relecture-robustesse/verrou-vivant.js`. A tient le verrou, et son battement vieillit d'une heure (veille ou hibernation : installer-tache ne coupe la veille que sur secteur). Sortie : « B 4052 : ok true ; A (14164) vivant : true », puis « verrou.json dit pid 14164 » trois fois. B prend le verrou d'un maitre vivant, puis le battement de A (l. 51) reecrit verrou.json sans verifier qu'il en est encore le proprietaire. Les deux tournent sur le meme etat (population.json, courses-*.jsonl).  
  Correction proposée : Reprendre un verrou mort par une creation exclusive. Renommer le verrou mort vers `verrou.json.mort-<pid>` (un seul processus reussit ce renommage), puis `openSync(P.verrou,'wx')`. Sur EEXIST ou EPERM, refuser avec le code 2, dans le try. Ne jamais reprendre le verrou d'un pid VIVANT sur la seule foi de l'age du battement : refuser et le dire. Le battement relit verrou.json avant de l'ecrire. Si le pid n'est plus le sien, il pose ctx.arret.demande et le dit (« verrou perdu »).
- **Les journaux du maitre (morts, generations, validations, coffre) ne sont jamais repares apres une ligne tronquee, et lireJsonlSur avale l'erreur : le maitre oublie en silence tout ce qu'il a deja ecrit**  
  Gravité : important  
  Fichier : ml/evolution/evoluer.js (l. 114 lireJsonlSur, l. 120-138 charger) ; seul courses.js repare ses fichiers (reparerFins)  
  Preuve : Commande : `node tests/relecture-robustesse/journaux-tronques.js`. Le test copie l'etat de l'integrateur, laisse une ligne sans « \n » a la fin de morts.jsonl, generations.jsonl et validations.jsonl (ce que fait un kill dur pendant ajouterLigne), puis ajoute des lignes comme le fait le maitre. Sortie : « avant : morts connus 8, generations connues 6, validations 1, maledictions 1 », puis « apres la ligne suivante : morts connus 8, generations connues 6 ». La ligne ajoutee s'est collee au fragment : elle est perdue sans un mot. Ensuite : « apres une ligne de plus : morts connus 0, generations connues 0, validations 0, maledictions 0 », et « commun.lireJsonl(morts.jsonl) : LEVE : ligne 9 illisible ». Consequences : le cimetiere perd des morts, les dedoublonnages (deja.*) se vident, et ctx.maledictions repart de 0, ce qui fausse la regle 6. etat.js tolere la ligne (« 7 lignes, alertes 1 »), le maitre non.  
  Correction proposée : Dans charger(), avant toute lecture, appliquer aux 4 journaux la reparation de courses.reparerFins : mettre le fragment de cote puis tronquer (exporter une fonction generique `reparerFin(fichier)` dans commun.js). Remplacer lireJsonlSur par C.lireJsonl. Une ligne illisible au milieu d'un fichier doit etre fatale et dite, ou au minimum signalee par evenement(), jamais avalee en tableau vide.
- **Les fichiers des yeux et du pilote sont hashes une fois par generation, mais chaque enfant les relit au moment de son fork : une retouche (puis un retour) de ml/bot/yeux.js pendant une generation empoisonne le cache**  
  Gravité : important  
  Fichier : ml/evolution/courses.js (l. 23-52 epoque, l. 93-96 tri) ; ml/evolution/evoluer.js (l. 286) ; ml/evolution/enfant.js (l. 29)  
  Preuve : Je l'ai lu dans le code, sans le provoquer : la regle interdit de toucher ml/bot. L'epoque (le sha de yeux.js, doigts.js, piloter.js, modele.js…) est calculee dans preparer(), au debut de la generation (evoluer.js:286). Chaque enfant fait ensuite `require('../bot/piloter')` au moment ou il est forke (enfant.js:29), donc avec les fichiers du disque a cet instant. Le tri (note.pourquoiEcartee, l. 37-41) ne controle que jeu_sha, version, simulateur, node et yeuxTirages, jamais les fichiers du bot. Les courses jouees avec un yeux.js retouche sont donc rangees sous l'ANCIENNE cle d'epoque. Si la retouche est annulee (git checkout, essai abandonne), l'epoque reprend son ancien sha et ces courses sont rendues par le cache pour toujours. L'amendement 4 dit que yeux.js et piloter.js sont justement en travail, avec des modifications non enregistrees.  
  Correction proposée : L'enfant doit dire ce qu'il a charge. Dans enfant.js, avant `require('../bot/piloter')`, hasher les FICHIERS_EPOQUE (lus depuis le disque) et renvoyer `fichiers_sha` dans le resultat. Le tri rejette la ligne (« jouee avec d'autres yeux ») si ce sha differe de ep.courses, et le maitre arrete la generation (nouvelle epoque). A defaut, recalculer K.epoque(cfg) dans finir() et ne pas mettre au cache une course finie apres un changement.
- **ecrireAtomique leve EPERM sans reessayer quand un autre programme tient le fichier ouvert (antivirus, indexeur, sauvegarde) : maitre arrete en code 1, ou exception non rattrapee dans courses.js**  
  Gravité : important  
  Fichier : ml/evolution/commun.js (l. 47-54)  
  Preuve : Commande : `node tests/relecture-robustesse/renommer-occupe.js`. Un PowerShell ouvre population.json pendant 6 s (`[IO.File]::Open(f,'Open','Read','Read')`, sans FILE_SHARE_DELETE). Sortie : « ecrireAtomique : LEVE EPERM (rename) » et « restes .tmp : population.json.9664.tmp ». Dans evoluer.js, ecrirePop leve : la generation s'arrete en erreur fatale (code 1), et la relance n'arrive qu'a la tache horaire suivante. Dans courses.js, ecrirePilote (l. 148-150) est appele dans pomper() depuis le gestionnaire 'exit' d'un enfant. La meme erreur, comme ENOSPC (disque plein) dans garder()/ajouterLigne (l. 164), devient une exception non rattrapee : pas de process.on('uncaughtException'), donc ni arret propre ni tableau. Le test du verrou a montre le meme EPERM sur deux rename concurrents.  
  Correction proposée : Dans ecrireAtomique, sur EPERM, EACCES ou EBUSY au renameSync, reessayer avec un court delai croissant jusqu'a environ 10 s (ce que fait graceful-fs sous Windows), et effacer le .tmp en cas d'echec final. Dans courses.js, entourer le corps de finir() et de lancer() d'un try/catch : sur erreur, poser arrete et rejeter la promesse de demander(), pour que l'erreur remonte au try de principal() (code 1 propre, verrou rendu).
- **La cle du cache et l'epoque ignorent cfg.regime : un changement de regime rend les courses de l'ancien regime**  
  Gravité : mineur  
  Fichier : ml/evolution/courses.js (l. 49 et 54-57 ; l. 206 envoie regime:cfg.regime)  
  Preuve : Dans le code, la ligne 206 envoie `regime:cfg.regime||'allege'` a l'enfant, qui fait `ouvrir({regime:m.regime})` (enfant.js:30). Pourtant `cle()` vaut shaPilote|graine|tmax|jeu_sha|simulateur|node|ep.courses, et ep.courses ne contient ni cfg.regime ni rien qui en depende (l. 49 : jeu_sha, version, simulateur, node, fichiers, reseaux). Une recherche de « regime » dans ml/evolution/*.js ne le montre nulle part ailleurs. Passer config.json a un autre regime (CLAUDE.md : allege contre poste MAX) laisserait le cache rendre les courses allegees.  
  Correction proposée : Ajouter `regime:cfg.regime||'allege'` dans l'objet hashe de epoque() (l. 49), pour qu'il fasse une nouvelle epoque, et dans composants.
- **Une generation interrompue apres le renvoi a deja ecrit ses morts dans morts.jsonl, et deja.morts empeche d'ecrire plus tard la vraie mort d'un pilote reste vivant**  
  Gravité : mineur  
  Fichier : ml/evolution/evoluer.js (l. 476, puis l. 484/501/520 return interrompue avant ecrirePop)  
  Preuve : Lu dans le code. Les lignes de morts sont ajoutees (l. 476) avant la validation et le coffre. Un STOP pendant ces courses fait `return {interrompue:true}` sans ecrire population.json, qui garde etape 'courses' avec les pilotes vires encore vivants. A la reprise, le renvoi est refait. Si l'epoque a change entre-temps (les notes repartent de 0, protection), d'autres pilotes peuvent etre vires. morts.jsonl contient alors des pilotes encore vivants, et ecrireMort (l. 324, deja.morts) refusera d'ecrire leur vraie mort plus tard.  
  Correction proposée : Ecrire les lignes de morts seulement avec l'etat final, juste avant ecrirePop(etape 'fin'). Ou poser une etape intermediaire 'renvoi' dans population.json (vivants deja filtres) avant la validation, pour que la reprise ne refasse pas le renvoi.
- **Le cache garde en memoire toutes les lignes de toutes les epoques, et tout est relu a chaque lancement et a chaque nouvelle epoque**  
  Gravité : mineur  
  Fichier : ml/evolution/courses.js (l. 123-125) ; evoluer.js (l. 109-113, chargerLignes)  
  Preuve : Commande : `node --expose-gc tests/relecture-robustesse/memoire-cache.js 200000`. Sortie : « 200000 lignes (191.2 Mo sur disque) : creer() en 1514 ms, tas +253 Mo (1266 octets par ligne) ». Les lignes d'une autre epoque ne servent jamais, puisque la cle contient ep.courses, mais elles restent dans `memoire`. Avec environ 50 courses a l'heure (4 travailleurs, 900 s de jeu, un rapport mesure de 0,37 s reelle par seconde de jeu), cela fait environ 11 Mo de tas par semaine, sans fin. Ce n'est pas bloquant avant des mois, mais rien ne fait tourner les fichiers. Les restes *.<pid>.tmp et *.fragment-* ne sont jamais effaces non plus.  
  Correction proposée : Dans creer(), ne garder que les lignes `l.epoque===ep.courses`. Au lancement, effacer les .tmp dont le pid ne vit plus. Plus tard, faire tourner les courses-*.jsonl des epoques closes vers un sous-dossier archive/.

### Vérifié et jugé bon

- Enfants apres un kill dur du maitre (`node tests/relecture-robustesse/orphelins.js 25000`, courses.js avec 4 courses de 60 s, maitre tue par SIGKILL 25 s apres) : « +4 s : enfants orphelins encore vivants : 0 ». Les enfants meurent seuls des que leur tuyau vers le maitre casse. Aucune ligne n'est ecrite au cache pour ces courses.
- Chien de garde (courses.js --chien 8) : chaque enfant est tue a 8 s, relance une fois (« relancees 2, tuees 4 »), puis rendu NON MESUREE. Pas de double appel de finir() : le drapeau fini garde 'exit' et 'error'.
- Un STOP au milieu de la file (stop-et-enfants-morts.js sans --fin) : les taches en attente rendent null, « generation 6 interrompue : elle sera reprise au prochain lancement », STOP efface, code 0. La reprise dit « reprise (naissances deja faites) » et garde les memes 8 pilotes ; les 4 courses tuees repartent en essai 2.
- Reprise d'une generation : les naissances, le rng et les graines sont relus de population.json (etape 'courses'). Les graines de validation sont reprises du meme etat, donc les memes ; ecrireValidation, ecrireCoffre et ecrireMort dedoublonnent par cle, et la ligne de generations.jsonl n'est pas recopiee.
- courses-*.jsonl : reparerFins met de cote puis coupe une fin tronquee avant tout ajout, et lireJsonl ignore une derniere ligne illisible. Une cle demandee deux fois n'est jouee qu'une fois (enVol).
- Ctrl+C deux fois et arreter({dur:true}) : les enfants tues portent v.dur et n'ecrivent aucune ligne (rendent null).
- Chemins Windows : fork(ENFANT) et execFileSync passent des tableaux d'arguments. lancer.cmd et arreter.cmd partent de "%~dp0" entre guillemets ; « VERSION PRINCIPALE » est toujours joint par path.join.
- arreter.cmd : quand le verrou est en plein renommage, la lecture leve EPERM, ce qui donne le code 0 (« tourne encore ») et non un faux « c'est arrete ».
- Marge du chien de garde : sur 192 courses d'au moins 55 s, temps reel / temps de jeu = 0,37 en mediane, 0,52 au 90e centile, 1,06 au plus. 900 s de jeu donnent donc au plus environ 954 s, sous les 1200 s du chien.
- Tous mes scripts et etats d'essai sont dans ml/evolution/tests/relecture-robustesse/ (outils.js, orphelins.js, verrou-course.js, verrou-vivant.js, journaux-tronques.js, renommer-occupe.js, stop-et-enfants-morts.js et son .log, memoire-cache.js, dossiers etat-*). Aucun autre fichier n'est touche, aucun processus ne reste, rien n'est commite.

## 9. relecture:determinisme

*Rôle : relecteur « determinisme » : relit le travail des autres et relève les défauts, sans les corriger. Phase : Relecture.*

### Défauts relevés

- **Les pilotes et les champions ne sont pas protégés contre core.autocrlf : une fois commités, ils reviennent en CRLF à l'extraction, ce qui casse leur sha et change l'époque**  
  Gravité : important  
  Fichier : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitattributes  
  Preuve : `git config --show-origin --get-all core.autocrlf` répond `file:C:/Program Files/Git/etc/gitconfig true` et `file:C:/Users/sacha/.gitconfig true`. `git check-attr -a -- ml/evolution/modele.js` ne rend rien : aucun attribut. ml/evolution/.gitattributes ne contient que `*.cmd text eol=crlf`. Git l'annonce sur mes propres fichiers .js de ce dossier : « in the working copy of 'pR.js', LF will be replaced by CRLF the next time Git touches it ». Deux conséquences. (1) courses.js:29-30 calcule le sha de l'époque sur les OCTETS bruts de ml/evolution/modele.js (`fichiers[rel]=b?C.sha1(b):'absent'`) : sur une autre extraction, par exemple le Ryzen, l'époque change. (2) Le README prévoit de committer champions/*.js à la main, mais le .json du champion garde `shaPilote`, le sha1 du texte en LF (ecrireAtomique refuse les \r). Après extraction, le .js en CRLF ne correspond plus à son sha. C'est exactement la panne du labo que décrit le .gitattributes de la racine (« sur ce PC c0001 ne correspondait plus a son empreinte »), qui ne protège que ml/labo/cerveaux/*.js.  
  Correction proposée : Ajouter dans ml/evolution/.gitattributes : `*.js -text`, `champions/** -text`, `*.json -text`, `*.jsonl -text` (et `tableau.html -text`), comme pour ml/labo/cerveaux. Garder `*.cmd text eol=crlf`.
- **Le contrôle d'identité ne se relance pas quand genome.js ou pilote-voltige.js changent : ces deux fichiers ne sont pas dans l'époque**  
  Gravité : important  
  Fichier : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\courses.js  
  Preuve : courses.js:18-19 : `FICHIERS_EPOQUE=['ml/bot/yeux.js',…,'ml/evolution/modele.js','ml/evolution/enfant.js']`, sans ml/evolution/genome.js ni ml/ecurie/pilote-voltige.js. evoluer.js:294-303 n'appelle `controleIdentite` qu'au premier lancement (`if(!ctx.pop)`) ou si `pop.epoque.courses!==ep.courses`. Or c'est genome.js (bloc() et ecrirePilote) qui fabrique le texte du pilote, et c'est pilote-voltige.js que l'identité prend pour référence. Le message d'échec le dit lui-même (evoluer.js:282 : « modele.js, genome.js ou les yeux ont change »), mais une retouche de genome.js n'y mène jamais. Un bloc mal écrit, par exemple une faute dans `retours:` ou dans `volRetour`, change donc tous les shaPilote sans aucun contrôle. Et pop.temoin garde un génome lu dans un ancien pilote-voltige.js.  
  Correction proposée : Garder dans population.json un sha « identité » : sha1 de genome.js, de pilote-voltige.js et du texte du témoin écrit par ecrirePilote. Relancer identite.verifier à chaque lancement où ce sha change (45 s), sans changer l'époque des courses : le shaPilote, qui est dans la clé, suffit déjà au cache. On peut aussi ajouter simplement les deux fichiers à FICHIERS_EPOQUE, mais tout le cache serait alors rejoué à chaque retouche.
- **cfg.regime change la course, mais il n'est ni dans la clé du cache ni dans l'époque**  
  Gravité : important  
  Fichier : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\courses.js  
  Preuve : courses.js:206 envoie `regime:cfg.regime||'allege'` à l'enfant. enfant.js:30 fait `ouvrir({regime:m.regime||'allege'})`, et piloter.js:37-40 traduit : `regime==='allege'?'&allege=1':''`, c'est-à-dire un autre jeu (autre tirage des maps, autre rendu). Pourtant courses.js:54-56 donne `cle = shaPilote|graine|tmax|jeu_sha|simulateur|node|ep.courses`, et `courses` (ligne 49) = sha1 de `{jeu_sha,version,simulateur,node,fichiers,reseaux}`. Ni l'un ni l'autre ne contient regime. Si config.json passe à `"regime":"max"`, toutes les lignes en cache (jouées en allégé) sont rendues comme valables et se mêlent aux nouvelles.  
  Correction proposée : Ajouter `regime:cfg.regime||'allege'` aux `composants` et au sha `courses` de epoque(), ou au moins à cle(). Faire de même dans ceQuiAChange (evoluer.js:271), pour que la console le dise.

### Vérifié et jugé bon

- Identité au bit près, refaite sur 2 graines que les tests n'utilisent pas, 60 s, 4 courses à la fois : `node ml/evolution/identite.js --graines 913579,927183 --tmax 60 --travailleurs 4` donne IDENTIQUE pour 913579 (fd2e4209c3b0 223cea9abd22 2c166c63e75a, palier 5, 60 s) et pour 927183 (e06484323afa 1079fe633517 479e6c2866d0, palier 5, 60 s), code 0. Journal : ml/evolution/tests/relecture-determinisme/identite-913579-927183.log
- Branche « retour » contre faire-pR.js : les mêmes courses, 2 graines, 60 s (tests/relecture-determinisme/essai-retour-et-tetes.js). Le génome témoin avec retourOn=1 et volMieux=1 est comparé à pilote-voltige.js transformé par les retouches de faire-pR.js, rejouées en mémoire avec la même loi (marge 8, cap .8, gain .8, avance .15, rv .2, rm .24, rn .18). Résultat IDENTIQUE sur 913579 (42ddb35409a5) et 927183 (aa5f355144ae), 0 erreur : le contrôle des rayons passe aussi avec des rayons retour0. La garde « retour<i> au-delà de retours.length sautée » ne change rien ici, avec bascule ≥ 4.
- Tête SOL branchée : un génome dont les W2 de la tête SOL valent 0,5 donne des courses différentes de pilote-voltige (913579 : 28ca98b00521 ; 927183 : dd812fe6b1a3, palier 4), sans erreur. identite.test.js teste déjà w2sol, et identite.verifierW2 teste la tête RAYON.
- Comparaison ligne à ligne entre modele.js (le témoin écrit) et pilote-voltige.js + faire-pR.js (git diff --no-index, dans tests/relecture-determinisme/diff-pR-modele.txt). Ce qui change, et rien d'autre : le bloc du génome, les deux têtes et le contrôle des rayons ; teteSol placé juste avant `cible=cl(cible,-max,max)`, avec `jauge` et `margeV` déplacés sans changement ; kSeuil sur le seuil de la nitro ; kGain sur raccGain ; les deux `nitro:` du sol gardés par `R.retours.length` ; les 14 constantes en G.* exactement aux endroits du § 4.1 ; teteRayon ajoutée à sMien, aux candidats et au choix du départ ; la garde `retour<i>` ; `nom:'evolution'`. Le nom et le nom de fichier ne changent pas la course : l'identité passe.
- Têtes : l'ordre des 36 entrées RAYON et des 12 entrées SOL est conforme aux § 5.5 et 5.6 d'INTERFACES.md. Chaque entrée passe par borne3 (NaN, ±Infinity, non-nombre → 0, puis [-3,3]). Les tampons Float64Array sont réécrits avant chaque lecture. Avec W2 = 0, la sortie vaut +0 (out part de +0, et +0 + -0 = +0) ; `if(dc!==0)` évite le signe d'un zéro ; exp(0)=1 exactement. teteRayon rend 0 sans rayon.
- Contrôle des rayons écrit d'après yeux.js, radarVol (lignes 765-785) : les 10 rayons de la liste sont toujours là, dans l'ordre ; viser et viserPlane ne viennent que si `sv!=null&&E0.uy>0`, et f.cible n'est rempli que dans ce cas (yeux.js:977 le remet à null à chaque vue) ; retour0… viennent ensuite, un par loi de RET (4 au plus). controleRayons suit exactement ce code et n'écrit rien.
- Rien d'interdit dans le pilote écrit : « Math.random » et « Date » n'y apparaissent qu'une fois chacun, dans le commentaire de l'en-tête (ligne 12). Le bac retire Math.random et met une souche à la place de Date à l'exécution (piloter.js:70-73), il ne lit pas le texte. Aucun require, eval, Function, process ou globalThis.
- Gènes (tests/relecture-determinisme/audit-genome.js) : les 86 gènes sont tous lus par modele.js, les ret* passant par `retours`, que yeux.js lit dans lireRetours. Aucune clé lue n'est absente du bloc ; la seule clé figée lue est volNitro, voulue (§ 4.1). Sur 12 000 mutations en phases A, B et C, les 86 gènes ont tous changé au moins une fois, avec 0 génome hors bornes ou contraintes. `mutes` est exact. La phase A ne touche aucune tête ; la phase B ne touche pas W1. reparer est idempotent. muter ne modifie pas le parent et rend le même enfant pour un même état.
- Croisement : sur 2 000 enfants, 0 non conforme, et chaque gène vient de l'un des deux parents (hors les trois contraintes). Contraintes poussées au bord (braqueDoux .5 et braqueFort .2 → .6 ; jaugeCoupe ramené à jaugeAllume ; departMax ramené à departMin ; NaN et -0 dans les poids) : valider rend null.
- sha et fins de ligne : le pilote écrit n'a aucun \r. Un modele.js en CRLF donne exactement le même texte, car ecrirePilote normalise. shaGenome ne dépend pas de l'ordre des clés. Dans l'état des tests (essais/tests-evoluer/etat), les 6 vivants vérifient tous id = idDe(genome), shaPilote = sha1(ecrirePilote(genome)), pilotes/<sha12>.js = ce texte, et valider = null. Le champion g0004-aceef6d5.js correspond à son .json (sha et texte identiques). Sur 94 fichiers des essais, seuls deux contiennent des \r : un sortie.log de cmd.exe et test-e.txt, tous deux hors du déterminisme.
- Le hasard : mulberry32 est le seul générateur de genome.js et de graines.js, et normal() use deux tirages sans cache, ce qui rend une reprise exacte. genomeTemoin lit REGLAGES dans un contexte vm vide et vérifie les 7 extraits du § 5.3.

## 10. correcteur

*Rôle : correcteur : corrige les défauts relevés par les trois relecteurs et relance les tests. Phase : Corrections.*

### Résumé

J'ai corrigé les 20 défauts relevés par les trois relecteurs. Il n'en reste qu'un en partie ouvert : les anciens fichiers de courses ne sont pas archivés. Les quatre défauts que je pouvais reproduire tels quels l'ont été avant de les corriger : sacre, ā, mesure absente et journaux tronqués ; l'arrêt en fin de lot ne s'est reproduit qu'après correction, au second lancement. Un test refait chacun des autres. Tous les tests de ml/evolution/tests/ passent, et deux générations avec config-essai.json finissent en code 0.

Les bloquants et importants :
1. **Sacre** : le critère (a) se règle par cfg.validation.seuilSacre, à 2 par défaut. Les faux sacres passent de 18,3 % à 3,7 % (d-sacre-nul.js 300). En contrepartie, un meneur à +1 palier n'est plus sacré que 12 % du temps (37,7 % avant), à +2 paliers 34 % (65,7 %).
2. **ā du rétrécissement** : il se calcule sur les vivants seulement (noter avec ids, transmis à ajuster).
3. **STOP en fin de lot** : un échec pendant un arrêt rend null, la génération est donc interrompue et non écrite comme finie. L'enfant ignore SIGINT. Reproduit avec stop-et-enfants-morts.js --fin : génération 7 interrompue à l'étape « courses », aucune graine retirée.
4. **Échecs d'environnement** (chien de garde, enfant mort, pannes, autres fichiers du bot) : la ligne porte env:true et ne compte comme essai que dans le lancement qui l'a écrite.
5. **Verrou** : la reprise passe par une création exclusive, gardée par verrou.json.reprise. Un pid node vivant n'est jamais repris. Le battement relit le fichier et dit « VERROU PERDU ». verrouiller ne lève plus jamais (refus en code 2). Rejoué : 0 essai sur 12 où les deux maîtres tiennent le verrou, et le maître vivant garde le sien.
6. **Journaux du maître** : charger répare leur fin et lève sur une ligne illisible au milieu.
7. **Fichiers du bot relus par chaque enfant** : l'enfant hashe les fichiers de l'époque juste avant son require et rend fichiers_sha. Le tri rejette la course si l'empreinte diffère. Le maître coupe alors la génération, relit l'état et reprend dans la nouvelle époque (3 fois au plus par lancement).
8. **ecrireAtomique** réessaie le rename jusqu'à environ 10 s sur EPERM, EACCES ou EBUSY, et efface son .tmp en cas d'échec final. Une erreur interne de l'ordonnanceur fait rejeter demander() et remonte au maître (code 1).
9. **.gitattributes** : *.js, *.json, *.jsonl, *.md, *.html, *.txt et champions/** passent en -text ; *.cmd reste en CRLF.
10. **Contrôle d'identité** : une empreinte d'identité (genome.js, pilote-voltige.js, texte du témoin) est gardée dans population.json. Le contrôle est refait quand elle change.
11. **Régime** : il entre dans l'époque des courses, donc dans la clé du cache, et ceQuiAChange le cite.

Les mineurs :
- Une mesure absente de toutes les parties compte au pire dans E.
- Une graine n'est retirée que si deux pilotes ou plus la manquent, ou le témoin. Un pilote à 2 courses non mesurées est viré d'office (raison 'non-mesuree').
- Les pannes se comptent sur tous les essais (pannesEssais).
- La référence des joueurs est relue quand l'époque des notes change.
- L'économie de graines se décide sur la seule durée des courses d'entraînement, sans la PAUSE, avec retour à 12 graines sous 90 % du seuil.
- Les validations de --valider-maintenant portent forcee:true et sortent de la malédiction du gagnant.
- Les lignes de morts.jsonl ne s'écrivent qu'à la fin de la génération.
- Le cache ne garde en mémoire que l'époque en cours : +0 Mo pour 50 000 lignes d'une autre époque, contre environ 1 266 octets par ligne avant.
- Les restes .tmp d'un processus mort sont effacés au chargement.

INTERFACES.md est mis à jour aux endroits touchés, et un nouveau § 8 « Les corrections » fait foi. Le README a 4 lignes nouvelles ou complétées dans « Si ça s'arrête », et le .gitignore couvre les fragments et les restes du verrou. Aucun commit, rien d'écrit hors de ml/evolution/.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\commun.js  
  Role : rename qui réessaie (renommerSur, dormir), ecrireAtomiqueOctets, reparerFin générique, FICHIERS_EPOQUE / shaFichiersEpoque / shaDesFichiers (déplacés ici), nettoyerTmp
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\courses.js  
  Role : époque avec regime et fichiers_sha ; échecs d'environnement (env:true, estEnv) qui ne valent que pour le lancement ; null sur un échec pendant un arrêt ; pannesEssais ; erreurs internes qui font rejeter demander() ; cache limité à l'époque ; tri sur fichiers_sha
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\enfant.js  
  Role : hashe les fichiers de l'époque avant le require et rend fichiers_sha ; ignore SIGINT
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\note.js  
  Role : seuilSacre (2 par défaut) ; ā sur les vivants ; mesure absente comptée au pire ; referenceEpoque({recharger}) ; rejet de fichiers_sha différent
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js  
  Role : verrou réécrit (création exclusive, pid vivant jamais repris, battement qui relit, ne lève jamais) ; charger qui répare et lit strictement ; identité suivie dans population.json ; retraits par graine, renvois 'non-mesuree' et 'pannes' sur tous les essais ; morts écrits à la fin ; économie hors PAUSE et réversible ; validations forcées ; coupure et reprise quand les fichiers du bot changent
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json  
  Role : + validation.seuilSacre: 2
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitattributes  
  Role : *.js, *.json, *.jsonl, *.md, *.html, *.txt, champions/** en -text ; *.cmd en text eol=crlf
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore  
  Role : + etat/verrou.json.* et etat/*.fragment-*
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : sections 2.2, 2.6, 2.10, 3.1, 3.7, 3.9, 3.10, 6.1, 6.4, 6.7 retouchées ; nouveau § 8 « Les corrections » qui fait foi
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\README.md  
  Role : « Si ça s'arrête » : 3 lignes nouvelles (verrou d'un maître en veille, VERROU PERDU, journal illisible) et la ligne des courses non mesurées complétée
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\robustesse.test.js  
  Role : NOUVEAU : 8 tests sans course (verrou concurrent, vivant, perdu, erreur ; journaux tronqués ; ligne illisible au milieu ; malédiction forcée ; .tmp)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\generation.test.js  
  Role : NOUVEAU : 12 tests de evoluer.generation avec un faux ordonnanceur (retraits, renvois d'office, morts à la fin, économie, PAUSE, identité, époque, tri)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\courses.test.js  
  Role : + f (arrêt en fin de lot), g (échec d'environnement rejoué au lancement suivant), h (pannesEssais)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\note.test.js  
  Role : test « ids » adapté au nouveau contrat ; + ā sur les vivants, E avec mesure absente, seuil du sacre
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\commun.test.js  
  Role : + régime dans l'époque, reparerFin, nettoyerTmp, ecrireAtomique avec fichier tenu ouvert (réessai, puis échec final sans .tmp)

### Tests

- Nom : tests/commun.test.js  
  Passe : true  
  Détail : 16/16
- Nom : tests/graines.test.js  
  Passe : true  
  Détail : 8/8
- Nom : tests/note.test.js  
  Passe : true  
  Détail : 16/16 ; le test « ids » encodait l'ancien calcul de ā et a été adapté au nouveau contrat, pas retiré
- Nom : tests/genome.test.js  
  Passe : true  
  Détail : 14/14
- Nom : tests/tableau.test.js  
  Passe : true  
  Détail : 69/69
- Nom : tests/lanceurs.test.js  
  Passe : true  
  Détail : 17/17
- Nom : tests/robustesse.test.js (nouveau)  
  Passe : true  
  Détail : 8/8 en 27 s ; les 8 auraient échoué sur l'ancien code
- Nom : tests/generation.test.js (nouveau)  
  Passe : true  
  Détail : 12/12 en 7 s, aucune course
- Nom : tests/courses.test.js a-h  
  Passe : true  
  Détail : 10/10 ; f, g et h nouveaux ; h dure 255 s (pannesEssais 4 sur deux essais de 2 pannes)
- Nom : tests/identite.test.js  
  Passe : true  
  Détail : 6/6 en 219 s (identité au bit près, têtes et loi retour branchées, contrôle des rayons)
- Nom : tests/evoluer.test.js  
  Passe : true  
  Détail : 78 contrôles OK, 0 ECHEC, code 0 (environ 24 min)
- Nom : evoluer.js --config config-essai.json --arret-apres 2 (état neuf essais/etat)  
  Passe : true  
  Détail : code 0 : identité IDENTIQUE sur 3 graines, génération 0 (12 courses et coffre), génération 1 (2 naissances, 18 courses, 2 renvois), 0 non mesurée
- Nom : relecture-statistique/d-sacre-nul.js 300 (après correction)  
  Passe : true  
  Détail : faux sacres 3,7 % (18,3 % avant) ; +1 palier sacré 12 %, +2 paliers 34 %
- Nom : relecture-robustesse/stop-et-enfants-morts.js --fin (après correction)  
  Passe : true  
  Détail : au second lancement (le premier avait frappé pendant le contrôle d'identité) : génération 7 interrompue, étape courses, graines retirées []
- Nom : relecture-robustesse/verrou-course.js 12 et verrou-vivant.js  
  Passe : true  
  Détail : 0/12 essais avec deux maîtres ; le maître vivant garde son verrou
- Nom : relecture-robustesse/journaux-tronques.js  
  Passe : true  
  Détail : les morts, générations, validations et malédictions augmentent au lieu de retomber à 0
- Nom : relecture-robustesse/memoire-cache.js 50000  
  Passe : true  
  Détail : tas +0 Mo pour 50 000 lignes d'une autre époque

### Problèmes

- Non fait : les courses-*.jsonl des époques closes ne sont pas archivées. Elles ne restent plus en mémoire, mais elles sont relues du disque à chaque lancement.
- SPECIFICATION.md n'est pas modifiée, car elle est hors de ml/evolution/. Les changements de règle (seuil du sacre à 2, ā sur les vivants, mesure absente comptée au pire, retrait d'une graine seulement si deux pilotes la manquent, renvoi 'non-mesuree', économie réversible) sont écrits dans INTERFACES.md § 8 et restent à reporter dans la spec.
- Le seuil de sacre à 2 coûte de la puissance : un vrai +1 palier n'est plus sacré que 12 % du temps (37,7 % avant). La validation en deux temps proposée par le relecteur (24 graines de plus quand ΔF tombe entre 1 et 2 se) n'est pas faite.
- Avec config-essai.json (courses de 60 s), la règle « mesure absente = pire » pèse lourd : 5 mesures de vol sur 15 manquent à un pilote qui vole peu, d'où un E vers 3 et un F vers -8. C'est voulu, mais c'est un changement visible des notes d'essai. Sur 900 s, les 14 lots de l'étude avaient leurs 15 mesures.
- ml/bot/*.js (yeux.js, piloter.js…) ne sont pas protégés contre core.autocrlf : leur sha entre dans l'époque, et ils sont hors de mon dossier. git diff ne montre d'ailleurs plus de changement en cours dans ml/bot.
- Pas testé en vraie console : un Ctrl+C dans la fenêtre de lancer.cmd. L'enfant ignore SIGINT, mais je ne l'ai vérifié que par l'essai STOP avec enfants tués, pas avec une vraie console Windows.
- La commande exacte du relecteur (courses.js --chien 8, puis relance sans --chien) n'est pas rejouée ; le test courses g couvre le même cas avec un chien de 4 s.
- Si pilote-voltige.js ne donne plus le génome du témoin, le maître le signale par un événement « ATTENTION » mais garde le témoin d'origine (choix prudent). Une population d'avant ce changement refera une fois le contrôle d'identité (champ identite absent).
- Mes changements (enfant.js et le régime dans l'époque) ouvrent une nouvelle époque pour tout état existant : courses rejouées et contrôle d'identité refait. Aucun état réel ml/evolution/etat/ n'existe, seulement des essais.
- J'ai rejoué les scripts du relecteur ; ils ont modifié ses dossiers tests/relecture-robustesse/etat-* (etat-stop est maintenant à la génération 7, interrompue). J'ai effacé etat-memoire, un dossier de 48 Mo fabriqué par ce même script.

### Écarts à la consigne

Écarts à SPECIFICATION.md (des règles, pas des fautes de code ; écrits dans INTERFACES.md § 8, qui fait foi) :
- § 7.6, critère (a) du sacre : 2·se au lieu de 1·se, réglable par cfg.validation.seuilSacre.
- ā est la moyenne des vivants, et non de tous les pilotes de l'époque.
- Une mesure absente compte au pire dans E.
- § 5.3 et § 6.1-4 :
  - une graine n'est retirée que si deux pilotes ou plus la manquent, ou le témoin ;
  - un pilote à 2 courses non mesurées est viré d'office (raison 'non-mesuree') ;
  - les pannes se comptent sur tous les essais.
- L'économie de graines se décide sur les courses d'entraînement hors PAUSE, et revient à 12 graines.
- Les morts ne s'écrivent qu'en fin de génération.

Écarts à l'ancien INTERFACES.md, corrigés dans le fichier lui-même :
- Formats :
  - Ligne : + pannesEssais, fichiers_sha, env ;
  - résultat de l'enfant : + fichiers_sha ;
  - Epoque.composants : + regime et fichiers_sha, et le sha « courses » inclut le régime ;
  - Population : + identite ;
  - generations.jsonl : + dureeEntrainement_s et pleine_s ;
  - validations.jsonl : + forcee ;
  - morts.jsonl : raison + 'non-mesuree'.
- Règle 1 du cache : un échec d'environnement d'un lancement précédent ne compte pas.
- verrouiller(cfg, {surPerte}) ne lève plus.
- charger lève sur un journal illisible au milieu.
- FICHIERS_EPOQUE a été déplacé dans commun.js ; courses.js le réexporte.
