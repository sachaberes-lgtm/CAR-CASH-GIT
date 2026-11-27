# LA SÉLECTION NATURELLE DES BOTS — spécification unique (27/11/2026)

> Pour : les développeurs qui la construiront. Écrite à partir de l'inventaire, de l'étude du bruit et de trois conceptions
> (« simple-robuste », « neuronal », « statistique »). Chaque point est tranché ; ce qui est repoussé est dans le § 11.
> Rien ici n'a tourné : les chiffres de débit sont des extrapolations, les faits de code sont cités (fichier, fonction).

---

## 0. La réponse à Sacha, en clair

**Oui, c'est adapté, pour une partie du chemin.** Une sélection naturelle qui tourne seule sur le Ryzen, sans jeton ni abonnement, est le bon outil
pour **régler au mieux** le pilote qui existe (ses ~75 nombres) puis pour **greffer de petits réseaux de neurones** sur ses deux décisions clés
(quelle façon de voler, quand mettre la nitro). Elle remplace entièrement la boucle payante `ml/ecurie/boucle.js`.

**Deux corrections à la demande, pour qu'elle marche :**
1. **« Le moins bon est viré » ne peut pas se juger sur une seule manche.** Sur 12 courses, la fiabilité du palier est de 0,35 à 0,44 (étude du bruit) :
   virer le dernier d'une manche, c'est tirer au sort à 60 %. Ici, chaque bot garde **toutes** ses courses depuis sa naissance ; on vire le moins bon
   **sur sa note cumulée**, et un nouveau-né est protégé tant qu'il n'a pas 24 courses.
2. **Un réseau neuronal parti de zéro n'apprendra pas à voler** en 10 000 courses par jour (l'essai d'octobre `ml/reel/cerveau.js` + `entrainer.js`
   l'a montré). Le réseau naît donc **greffé sur pilote-voltige, muet** : à la naissance il conduit exactement comme lui, au bit près, et la sélection
   lui apprend à corriger ce que le code écrit à la main décide mal.

**Ce qu'elle ne donnera pas seule** (détail au § 12) : les gestes que le code ne sait pas faire (canyon, freinage, drift, pose droite), les paliers
25-30, des débutants crédibles, et la preuve qu'on ne distingue pas les bots d'un joueur. Pour cela il faut, de temps en temps, du code écrit à la main
(de nouveaux yeux, de nouveaux gestes) et **plus de parties de vrais joueurs** dans l'étalon. Le partage qui marche : *le code ajoute des gestes, la
sélection les règle pendant les nuits.*

---

## 1. Le jugement des trois conceptions

| | Ce qui est bon | Ce qui ne va pas |
|---|---|---|
| **simple-robuste** (OSSATURE RETENUE) | Population à l'état stable qui **réutilise** chaque course (un survivant est jugé sur 100 à 400 courses) ; témoin figé ; naissance **identique au bit près** à pilote-voltige, vérifiable avant toute nuit ; reprise par courses ; un seul dossier ; aucune retouche au jeu. | Ses réseaux naissent **tous les poids à 0** : la sortie vaut W2·tanh(W1·x) = 0 et une mutation d'une seule couche n'a **aucun effet** tant que l'autre est nulle (effet du second ordre — l'auteur le note lui-même). Corrigé ici : W1 tiré une fois, W2 = 0. « Palier relatif à la moyenne de la génération » dérive quand la population s'améliore : remplacé par un vrai modèle pilote + graine. Réseau de vol à 12 sorties fixes : remplacé par une tête partagée par rayon (idée du neuronal). |
| **neuronal** | La **tête RAYON partagée** (le même petit réseau note chacun des 12 rayons : peu de poids, il généralise d'une façon à l'autre) ; repondérer les mesures de ressemblance qui ne sont que du bruit ; priorité basse des enfants ; test de l'ordre des 12 rayons ; refuser de partir si boucle.js tourne ; « fossiles » comme gamme de niveaux. | L'**imitation (DAgger)** coûte ~600 courses, du code d'apprentissage à la main (Adam, rétropropagation), et ne donne au mieux… que pilote-voltige — ce que la greffe muette donne gratuitement et exactement. La tête « nitro des joueurs » repose sur une correspondance export/vue **non vérifiée**. Le σ auto-adapté n'a pas de sens sous ce bruit (on ne peut pas sélectionner un σ quand on ne sait même pas classer les bots). 558 poids ouverts d'un coup : trop pour ~150 enfants par jour. |
| **statistique** | Le **coffre** (40 graines fixes qui ne décident jamais : la seule courbe honnête « ça apprend ») ; la **promotion par erreur-type sur bootstrap apparié** et le filtre de Pareto souple (on refuse « beaucoup de palier contre un peu de ressemblance » et l'inverse) ; l'**écart avec zone morte** contre le surapprentissage d'un étalon de 8 parties ; le cache clé = empreintes ; la remarque que l'étalon « clavier » ne compte que 8 parties. | Les **trois manches éliminatoires** jettent l'information : 11 enfants sur 16 virés sur 12 courses (fiabilité 0,35-0,44), et le champion recouru à chaque fois. Le **placebo ne mesure rien** dans un simulateur déterministe : un jumeau exact du champion sur les mêmes graines rejoue *les mêmes courses* (et le cache les lui donne telles quelles) ; il ne peut jamais différer. La **grille niveau × style** (MAP-Elites) est séduisante, mais un « bot de palier 2 » y est retenu parce qu'il meurt tôt, pas parce qu'il joue comme un débutant (l'auteur le dit) : repoussée. |

**Décision :** l'ossature est celle de *simple-robuste* (μ+λ à l'état stable, témoin, greffe muette, un seul dossier) ; on y greffe la tête RAYON, la
repondération des mesures, les gardes et la priorité basse du *neuronal* ; le coffre, la promotion par erreur-type, la zone morte, le cache et
l'époque à empreintes du *statistique*. On remplace « palier relatif à la moyenne » par un **modèle additif pilote + graine** (§ 6), qui est la forme
exacte de ce que les trois cherchaient.

---

## 2. Faits vérifiés dans le code (sur lesquels tout repose)

- **Une course = un processus neuf.** `ml/bot/noter.js`, bloc `--enfant` (lignes 27-37) : `ouvrir({regime})`, `charger(fichier,{source})`,
  `course(J,C,graine,{carte,meteo,tmax})`, puis `process.send({bilan,partie,touches,jeu,jeu_sha,simulateur,nom})` et `process.exit(0)`.
  L'inventaire a mesuré qu'un processus réutilisé ne redonne pas la même course (empreintes `8d34b0578072` puis `25db0c0ff610`, graine 910000).
- **Le tri des courses** : `pourquoiEcartee(m)` de noter.js (lignes 73-79) écarte `pannes>0`, `cause==='panne'`, `jeu_sha` nul, un autre
  `simulateur`, un autre `jeu_sha` ou une autre version (`cashcar-vNNN` de `VERSION PRINCIPALE/sw.js`). Une `erreur` du cerveau n'écarte pas.
- **Le bac** (`ml/bot/piloter.js`, `charger()`, `BAC_CODE`) : pas de `require`, pas de `Math.random`, pas de `Date`, pas d'`eval` de texte ;
  `Float64Array`, `Math.tanh`, `Math.exp` présents ; compilation < 1 000 ms ; une décision coupée à 60 s ; 2 coupures = course abandonnée.
  Mesuré : 53 512 poids se chargent en 15 ms, 0,25-0,4 ms par décision (le jeu : ~20 ms par décision).
- **Le pilote** `ml/ecurie/pilote-voltige.js` : `PROFIL` (lignes ~25-29 : `modele:'clavier', graine:1, chance:{prend:1,palierMin:12}`),
  `const REGLAGES={…}` (lignes 30-96), `auSol(v,m)` (l. 167), `FACONS` (l. 270), `vaut(r,long,v)` (l. 290), `enVol(v,m)` (l. 311),
  `module.exports={nom,profil,REGLAGES,decide}` (l. 370-375). Le choix de façon en vol est (l. 337-347) :
  `s = vaut(ry, LONGS[nom], v) + bonus(nom)` comparé à `sMien = vaut(mien, true, v)` avec la marge `REGLAGES.bascule`.
  La nitro au sol (l. ~208-213) : `seuil = (m.nitro ? braqueNitro : braqueNitro-.1) × k`, puis `sur = margeV > … && max(force,|lIci|/lmax) < seuil`.
- **La ressemblance** (`ml/bot/ressemblance.js`) : `mesuresPartie(partie)` (15 nombres ou `null` sous 60 s), `joueurs('clavier')`,
  `reference(M)` (moyenne, σ avec plancher 15 %), `ecart(parties, {mesures, reference})` → `{ecart, mesures:[{cle,z,…}], parties}` ; chaque |z| borné à 8.
  `ecart(null,{mesures:[…]})` accepte des mesures déjà calculées.
- **Le labo** (`ml/labo/labo.js`) : `sansCout(modele)` = `'main'` ou `/abonnement$/` (ligne 98) ; un autre modèle exige `cout{entree,sortie}` ;
  l'id `cNNNN` vient du nombre de lignes, sans verrou ; `ecrireAtomique` existe et est exporté.
- **Les graines** de noter.js : `depart + 37·i`. Entraînement et tri historiques depuis 910000, validation de boucle.js/inscrire.js depuis 950000.
- **Fins de ligne** : `core.autocrlf=true`, `ml/` hors de `.gitattributes` : un fichier extrait en CRLF change de sha1.

---

## 3. Les fichiers

Tout vit dans **`ml/evolution/`**, Node pur, sans dépendance, sans Internet. Le jeu, `pilote-voltige.js`, `boucle.js`, les yeux, la main et
`ressemblance.js` ne sont **jamais modifiés**. Seule retouche à l'existant : une ligne de `labo.js` (étape 9).

| Fichier | Rôle |
|---|---|
| `evoluer.js` | Le maître, seul processus long : verrou, reprise, naissances, ordonnancement des courses, note, renvoi, validation, coffre, état, tableau. Options : `--travailleurs N`, `--une-generation`, `--arret-apres N`, `--banc`, `--valider-maintenant`, `--config f.json`. |
| `enfant.js` | Une course dans un processus neuf (copie du bloc `--enfant` de noter.js) ; rend un résultat **compact** (§ 5.2). |
| `courses.js` | L'ordonnanceur : file de (pilote, graine), N enfants à la fois, chien de garde, relance, cache. Utilisé par evoluer.js et par les tests. |
| `genome.js` | `BORNES`, `genomeTemoin()` (lit REGLAGES dans pilote-voltige.js, regex `\r?\n`), `muter()`, `croiser()`, `reparer()`, `shaGenome()`, `ecrirePilote(genome)` → texte du pilote en LF. |
| `modele.js` | Copie de pilote-voltige.js avec la balise `/*@GENOME@*/` à la place du bloc REGLAGES, les 14 constantes promues branchées sur `G.*`, les deux têtes de réseau branchées (§ 4). **Seul fichier qu'on retouche à la main quand on ajoute un geste.** |
| `note.js` | Le modèle pilote + graine, le rétrécissement, l'écart « dans la foule » E, la note F, les erreurs-types, `pourquoiEcartee()` recopiée. Sans effet de bord : testable sur des données. |
| `graines.js` | Générateur `mulberry32` à graine sauvegardée ; tirage des graines d'entraînement, compteur de validation, coffre. |
| `identite.js` | Contrôle d'avant-nuit : le génome témoin doit rejouer pilote-voltige au bit près. |
| `tableau.js` | Réécrit `etat/tableau.html` (SVG en ligne, pas d'Internet) et `etat/resume.txt`. |
| `etat.js` | `node ml/evolution/etat.js` : le résumé en 10 lignes. |
| `config.json` | Tous les nombres du § 6-7 (valeurs par défaut ci-dessous). |
| `lancer.cmd`, `arreter.cmd`, `installer-tache.cmd` | Lanceur, arrêt propre (crée `etat/STOP`), installation de la tâche planifiée — **lancée par Sacha** (réglage du système). |
| `inscrire-champion.js` | À la main seulement : inscrit un champion au labo, étape `N1`. |
| `README.md` | Mode d'emploi pour Sacha : lancer, arrêter, lire le tableau, prendre un champion. |
| `etat/population.json` | L'état, écrit d'un coup (fichier `.tmp` puis `rename`) au début de chaque génération, après les naissances. |
| `etat/courses.jsonl` | **Le cache et la mémoire** : une ligne par course mesurée, ajoutée à la fin seulement. Découpé par semaine (`courses-AAAA-SS.jsonl`). |
| `etat/generations.jsonl`, `validations.jsonl`, `morts.jsonl`, `coffre.jsonl` | Journaux qui ne font que s'allonger. |
| `etat/pilotes/<sha>.js` | Le texte de chaque pilote ayant couru (pour rejouer, autopsier). |
| `champions/gNNNN-<sha8>.js` + `.json` | Chaque champion sacré, pilote ordinaire que `noter.js` sait noter, et son génome + ses notes. |
| `etat/verrou.json`, `etat/STOP`, `etat/PAUSE`, `etat/sortie.log` | Verrou (pid + battement toutes les 30 s), arrêt, pause, console. |

`.gitignore` local : `etat/courses*.jsonl`, `etat/pilotes/`, `etat/sortie.log`, `etat/verrou.json`. Les champions et les journaux légers se committent
à la main sur la branche de travail. **Aucun commit automatique.**

---

## 4. Le génome

### 4.1 Les nombres (bloc A, ~75 gènes)

Chaque gène scalaire est stocké **dans son unité** et muté en fraction de l'étendue de sa borne.

- **52 scalaires de REGLAGES** avec les bornes de l'inventaire (exemples : `marge [3,20]`, `bandeDecor [10,99]`, `braqueNitro [.2,1.2]`,
  `capMax [.1,.8]`, `raccTmax [2,5.5]`, `figJauge [.35,1]`, `figTemps [1.4,3]`, `figEcart [.5,2]`, `bascule [0,40]`, `tenirFacon [.1,1.5]`,
  `nitroDecor [0,1.5]` … la table complète est celle des faits (3) de l'inventaire, recopiée dans `BORNES`).
- **Contraintes réparées après chaque mutation** (`reparer()`) : `braqueFort ≥ braqueDoux + .1`, `jaugeCoupe ≤ jaugeAllume`, `departMax ≥ departMin`.
  `volRetour` : 0 ou `[.2,1.5]` (gène à deux formes : drapeau `volRetourOn` + valeur).
- **Drapeaux** : `dessousAveugle, dessousNitro, dessousFuir, portailVol, volDemiTour` (0/1) ; `dessousDecor` ∈ {0,1,2} ; `figMax` entier `[0,5]` ;
  `raccCartes` et `raccJumeau` : un drapeau par map **du tirage actuel** (la liste est lue une fois dans le jeu et écrite dans config.json).
- **14 constantes promues** (écrites en dur dans pilote-voltige.js, branchées sur `G.*` dans modele.js) :
  dans `vaut()` : 20 (axe) `[5,60]`, 3 (par s) `[0,10]`, 94 (portail) `[60,100]`, 80 (lèvre) `[40,95]`, 12 et 2 (rayon long libre) `[0,30]`/`[0,6]`,
  34 (rayon court) `[10,60]` ; dans `raccourci()` : 250 (axe) `[50,500]`, 25 (temps) `[0,80]`, 40 (plane) et 40 (lourde) `[0,100]` ;
  dans `enVol()` : les bonus +3, +2, +1 de versRoute, versRoutePlane, rien `[0,10]`.

**Restent FIGÉS** (jamais dans le génome) : `PROFIL` (main `clavier`, graine 1, chance), le garage, le régime `allege`, les yeux, la main, la
structure du code. Sinon la sélection monte le palier en trichant sur la main (boucle.js, « LA MAIN EST FIXEE »).

### 4.2 Les deux têtes de réseau (bloc B, 312 poids)

Une fonction unique dans modele.js : `reseau(W, x, nIn, nH)` → `Σ_j W2[j]·tanh(Σ_i W1[j][i]·x[i])` (biais = une entrée constante 1).
Chaque entrée est **bornée à [−3, 3]**, une valeur non finie (NaN, ±Infinity, undefined) devient 0. Les poids sont écrits en littéral
`const WV=new Float64Array([…]), WS=new Float64Array([…]);`.

**Tête RAYON (vol), partagée** — appliquée à chaque rayon candidat, y compris celui de la façon tenue. 36 entrées → 6 tanh → 1 sortie (216 + 6 = **222 poids**).
- le rayon (14) : issue en 8 cases (`pose, levre, portail, choc, air, fond, libre, coupe`), `t/6`, `|axe|/1.4`, `lat/demi`, `propre` (0/1),
  `dessous` (0/1), `gain/200` ;
- la façon (12) : une case parmi les 12 de `FACONS`, dans l'ordre fixe du radar ;
- le contexte (9) : `air.reste/6`, `(nitro+reserve)/2`, `proche.haut/100`, `proche.lat/demi`, `proche.axe`, « c'est la façon tenue » (0/1),
  `(v.t − m.tFacon)/1`, `vol.t/6`, map à décor (0/1) ;
- biais (1).

Branchement : `R(ry, nom) = 15·tanh(sortie)` ajouté **aux deux côtés** de la comparaison de enVol :
`s = vaut(ry,…) + bonus(nom) + R(ry,nom)` et `sMien = vaut(mien,true,v) + R(mien, m.facon)`. Les règles de patience, de fuite du dessous et
`tenirFacon` restent écrites à la main.

**Tête SOL** — une fois par décision au sol. 12 entrées → 6 tanh → 3 sorties (W1 12×6 = 72, W2 6×3 = 18 : **90 poids**). Total des deux têtes : 222 + 90 = 312 poids.
- entrées : `lat/demi`, `cap/0.5`, `force` (déjà calculée dans auSol), `margeV/3`, `jauge/2`, `vitesse/150`, `palier.n/30`, décor (0/1),
  couloir (0/1), lache (0/1), `tourne(v,400)`, biais.
- sorties : `seuil ← seuil · exp(0,3·o1)` (la nitro) ; `ligne ← ligne + 5·tanh(o2)` m, puis la même borne qu'aujourd'hui (la ligne) ;
  `raccGain ← raccGain · exp(0,5·o3)` (le goût du raccourci, passé à `raccourci()`).

### 4.3 La naissance muette (le point le plus important)

- **W1** de chaque tête est tiré **une seule fois** par le générateur du maître (graine `graineReseaux` de config.json), N(0, 1/√nIn), puis hérité.
- **W2 = 0**. Donc chaque sortie vaut exactement 0 ; `x + 0 === x` et `x · exp(0) === x` en virgule flottante : le pilote fabriqué joue
  **au bit près** la course de pilote-voltige. `identite.js` le prouve (étape 2).
- Une mutation de W2 a donc un effet **du premier ordre** dès la première génération qui ouvre les réseaux.

### 4.4 Les phases d'ouverture (une seule variable `phase` dans population.json)

- **Phase A** (départ) : seuls les nombres du bloc A mutent. Les réseaux sont muets.
- **Phase B** : W2 des deux têtes mute en plus (24 poids : 6 + 18). Passage automatique quand **20 générations de suite sans champion sacré**,
  ou à la **génération 60**, au premier des deux.
- **Phase C** : W1 mute aussi (312 poids en tout). Même règle, comptée depuis l'entrée en phase B.
- Le passage de phase est écrit dans generations.jsonl ; il ne remet aucune note à zéro (les génomes ne changent pas au passage).

---

## 5. Une course

### 5.1 Les graines (`graines.js`)

| Usage | Graines | Règle |
|---|---|---|
| Entraînement | `910000 + 37·i`, `i ∈ [0, 1080]` (jamais ≥ 950000) | 12 graines **sans remise** par génération ; quand la réserve est vide, retirage avec remise en excluant celles des 5 dernières générations. |
| Validation | `1 000 000 + 37·k`, `k` compteur global | Chaque graine ne sert **qu'une fois**. Repli si l'étape 0 montre que le jeu refuse ces graines : `950000 + 37·k`, k < 1 081, puis arrêt des validations avec alerte. |
| Coffre | `990000 + 37·j`, `j = 0..39`, fixes | Ne décide **jamais** rien. |

Le générateur du maître est `mulberry32`, état sauvegardé dans population.json : une reprise refait exactement les mêmes tirages.

### 5.2 `enfant.js`

Reçoit `{source, graine, tmax, regime:'allege'}` ; fait `ouvrir`, `charger('evolution', {source})`, `course(J,C,graine,{tmax})`.
**Contrôle en début de course** : la première vue en vol doit porter les 12 rayons dans l'ordre `tenu, rien, gauche, droite, cabre, pique, plane,
planeCabre, versRoute, versRoutePlane, viser, viserPlane` ; sinon le pilote fabriqué lève une erreur (écrite dans `bilan.derniereErreur`) et le
maître arrête tout (les yeux ont changé).
Rend, en un message d'environ 1 Ko :
```
{ graine, palier, pieces, survie_s, cause, morts, vols, pannes, erreurs, derniereErreur, cerveau_ms_moy, yeuxTirages,
  mesures: ressemblance.mesuresPartie(partie) | null,
  jeu, jeu_sha, simulateur, node: process.version, ms }
```
Le maître lance l'enfant avec `os.setPriority(pid, PRIORITY_BELOW_NORMAL)`. Un enfant muet plus de **20 minutes** est tué : course non mesurée.

### 5.3 Le tri et le cache

- `pourquoiEcartee()` recopiée de noter.js, plus : `yeuxTirages !== 0`, `node` différent de l'époque. Une course écartée est **non mesurée** :
  relancée une fois ; au second échec, la graine est retirée **pour tous** les pilotes de cette génération (graines communes préservées).
  Un pilote qui fait 2 pannes de cerveau sur une génération est viré d'office (raison écrite).
- **Clé du cache** : `sha_pilote | graine | tmax | jeu_sha | simulateur | node`. Une course de clé connue n'est jamais rejouée.
  À la reprise, une ligne tronquée en fin de fichier est ignorée.

### 5.4 Durée et débit

- `tmax = 900` partout (entraînement, validation, coffre). Aujourd'hui cela ne coûte rien : durée moyenne jouée 158 s contre 155 s coupée à 300,
  aucune course au-delà de 600 s (étude du bruit). Règle d'économie : si une génération dépasse **1 h 30**, `graines` passe de 12 à 8 (écrit dans
  generations.jsonl) ; on ne raccourcit jamais tmax (les paliers 20-30 en dépendent).
- Travailleurs : **9 par défaut**, fixés par le banc de l'étape 0 (6, 8, 10 → on garde le meilleur débit, écrit dans config.json).
- Estimation non mesurée : une course ≈ 6 s d'ouverture + 158 s jouées / 2,4 à 5 ≈ 40 à 70 s de cœur ; ~7 cœurs utiles → **≈ 500 courses/h**.

---

## 6. La note (`note.js`)

### 6.1 Le palier : un modèle pilote + graine

Sur toutes les courses mesurées **de l'époque en cours** (courses.jsonl) : `palier(p,g) = a_p + b_g + ε`, ajusté par moindres carrés alternés
(10 passes : `a_p` = moyenne de `palier − b_g` sur ses courses ; `b_g` = moyenne de `palier − a_p` sur les courses de la graine ; centrer `b`).
Pourquoi : le lot 930000 est plus dur de ~1 palier médian que le 910000 ; un bot ne doit jamais être jugé sur des graines plus faciles qu'un autre,
et une moyenne de la génération dérive quand la population progresse. Toutes les graines étant courues par toute la génération, `b_g` est identifié.
- On utilise le palier **moyen** (sur toutes les courses), jamais le médian : 140 courses au lieu de 216 pour voir +1 palier.
- **Rétrécissement** : `â_p = (a_p − ā) · n_p / (n_p + 12) + ā`, avec ā la moyenne des a. Un nouveau-né est ramené vers la moyenne.
- **Erreur-type** : `se_a = σ_res / √n_p`, σ_res l'écart-type des résidus de l'ajustement (attendu ≈ 3,2-3,4).
- La survie (même modèle, en s) sert seulement à départager.

### 6.2 L'écart aux joueurs : E « dans la foule »

Sur **toutes** les mesures cumulées du pilote (parties ≥ 60 s) : `r = ressemblance.ecart(null, {mesures, reference: REF})`, où `REF = reference(joueurs('clavier'))`
est calculée **une fois par époque** (référence gelée par le sha des fichiers de `ml/bot/etalon/`). Pour chaque mesure k : `e_k = max(0, min(8,|z_k|) − 1)`,
pondérée `w_k = 0,5` pour `volDuree, ondulation, vols, volsCourts` (fiabilité −0,16 à 0,20), `1` sinon. `E = Σ w_k e_k / Σ w_k`.
- La zone morte de 1 σ : sous un σ des joueurs, gagner de l'écart ne veut plus rien dire avec 8 parties de référence.
- Moins de 5 parties ≥ 60 s : `E = 4` (le pire).
- L'écart **classique** `r.ecart` (le 1,67 historique) est calculé et journalisé **pour comparaison**, il ne décide rien.
- Erreur-type de E : bootstrap des parties du pilote, 200 tirages (attendu ≈ 0,06-0,12).

### 6.3 La note F

**`F_p = â_p − 4 · E_p`** (poids 4 dans config.json, `poidsEcart`). Avec 6 (boucle.js), le mixte était porté aux deux tiers par l'écart et tirait
contre le palier (étude du bruit) ; 4 équilibre les deux parts. Les deux composantes sont toujours écrites séparément, pour pouvoir changer de poids
**à l'époque suivante** sans rien rejouer (le poids change → nouvelle époque de notes, pas de courses rejouées grâce au cache).
`se_F = √(se_a² + 16·se_E²)`.

---

## 7. L'algorithme (une génération)

État : **μ = 20 vivants** (dont le **témoin**, génome de pilote-voltige, jamais muté ni viré, et le **champion** en titre, protégé), **λ = 6 enfants**.

1. **Époque.** Relire `shaJeu()`, la version de sw.js, `SIMULATEUR`, `process.version`, le sha de `yeux.js`, `doigts.js`, `piloter.js`,
   `ressemblance.js` et des fichiers de `etalon/`. Si un seul a changé : **nouvelle époque** (les génomes restent, les notes repartent de 0,
   le champion garde son titre mais doit être revalidé). Aucune comparaison ne traverse deux époques.
2. **Naissances** (6). Parents par **tournoi de 3** sur F parmi les vivants d'au moins 24 courses (le témoin peut être parent).
   - 1 enfant sur 6 est un **immigré** : le champion muté fort (8 gènes, σ = 0,30 de l'étendue).
   - Les autres : avec p = 0,3 **croisement** (chaque gène scalaire pris chez l'un ou l'autre parent ; chaque tête de réseau prise **entière** chez
     un seul parent), puis **mutation** : `m = 1 + Poisson(2)` gènes scalaires, N(0 ; 0,15 × étendue), réflexion aux bornes, `reparer()` ;
     chaque drapeau bascule avec p = 0,03 ; `figMax` ±1 avec p = 0,05.
     En phase B : avec p = 0,5, une tête tirée au sort reçoit N(0 ; 0,3) sur 30 % de ses W2. En phase C, en plus : avec p = 0,3, N(0 ; 0,1) sur 10 %
     des W1 d'une tête.
   - Mutation **forte** voulue : de petits pas (+0,3 palier) demandent ~1 500 courses pour être vus.
   - Un génome déjà vu (sha dans population.json ou morts.jsonl) est remuté.
   - Écrire population.json (atomique).
3. **Courses** : les 26 pilotes × les 12 graines de la génération = **312 courses**, toutes communes (le cache saute celles déjà faites).
4. **Note** de tous (§ 6), sur toute l'époque.
5. **Renvoi** : parmi les vivants qui ont **au moins 24 courses**, hors témoin et champion, les **6 F les plus bas** sont virés. Les nouveau-nés
   (12 courses) ne peuvent pas l'être ; ils le seront à la génération suivante s'ils sont mauvais. Chaque mort → morts.jsonl
   `{id, genome, parents, ne, mort, n, a, E, F, se_F, ecartClassique}` (c'est aussi la gamme de niveaux, § 11).
6. **Validation** (au plus une toutes les 5 générations) si le **meneur** (plus haut F, n ≥ 48, pas le champion) dépasse le champion de
   **plus de 2 × se** de la différence. Meneur et champion courent **24 graines de validation neuves** (48 courses, tmax 900).
   Sur ces 24 graines, avec un **bootstrap apparié par graine** (400 tirages) : il est **sacré** si
   (a) `ΔF > 1 × se(ΔF)`, (b) `Δpalier moyen > −1 × se(Δpalier)`, (c) `ΔE < +1 × se(ΔE)`.
   Toujours journalisé : ΔF d'entraînement contre ΔF de validation (**la malédiction du gagnant mesurée**) ; si sur 10 validations l'écart moyen
   dépasse 1, la règle 6 passe de 2 à 3 × se (écrit dans generations.jsonl).
   Sacré → `champions/gNNNN-<sha8>.js` + `.json`, il devient le protégé, l'ancien champion redevient un vivant ordinaire.
7. **Coffre** : à chaque sacre, et une fois par 24 h, le champion et le témoin courent les 40 graines du coffre (80 courses, le cache évite les
   reprises). La courbe « champion − témoin sur le coffre » (palier moyen, E, écart classique) est **le seul critère de “ça apprend”**.
8. Écrire generations.jsonl, tableau.html, resume.txt. Lire `etat/STOP` / `etat/PAUSE`. Génération suivante.

**Coût** : 312 courses + en moyenne ~10 de validation et ~3 de coffre ≈ **0,65 h par génération ≈ 35 générations/jour ≈ 200 enfants jugés/jour**.
Tous les survivants recourent chaque génération : c'est le prix d'une note fiable (un ancien est jugé sur 100 à 400 courses).

### Génération 0

Le témoin + 19 mutants du témoin (3 à 6 gènes chacun, σ = 0,15). Pas de variantes du labo en v1 (repoussé, § 11). Le témoin est aussi le premier
champion (sans validation).

---

## 8. L'automatisme

- **Verrou** `etat/verrou.json` : pid + battement réécrit toutes les 30 s ; un second lancement s'arrête si le pid vit et que le battement a moins de
  5 min ; sinon il reprend le verrou. Le maître **refuse de partir** si un marqueur d'inscription du labo est en cours (`inscriptionsEnCours()` de
  labo.js) ou si un processus `boucle.js` tourne.
- **Reprise** : population.json (début de génération) + courses.jsonl (chaque course) + générateur sauvegardé ⇒ une coupure coûte au plus les
  courses en cours (≤ 9).
- **Arrêt propre** : `arreter.cmd` crée `etat/STOP` : plus aucune course lancée, attente des courses en cours, état écrit, verrou retiré.
  `etat/PAUSE` : idem sans quitter, attend la disparition du fichier. Ctrl+C = STOP ; un second Ctrl+C tue les enfants (sans perte, grâce à la reprise).
- **Lancement automatique** : `installer-tache.cmd` (à lancer **par Sacha**) :
  `schtasks /create /tn CashCarEvolution /sc onstart /delay 0005:00 /tr "<dépôt>\ml\evolution\lancer.cmd"`, plus une tâche horaire « si pas déjà
  lancé » (le verrou s'en charge), plus `powercfg /change standby-timeout-ac 0`. `lancer.cmd` : `cd` au dépôt, `node ml\evolution\evoluer.js >> ml\evolution\etat\sortie.log 2>&1`.
- **Le dépôt figé** : sur le Ryzen, l'évolution tourne dans **un worktree à elle** (`CASH-CAR-evolution`), sur un commit donné, que personne ne
  réassemble. Le pilote généré est écrit en **LF** et son sha calculé sur le texte envoyé.
- **Tableau** `etat/tableau.html` (ouvert à la main, rien n'est publié) : 1. la courbe du coffre (champion et témoin) ; 2. F, palier, E du meneur
  et du témoin par génération ; 3. les 15 z du champion ; 4. la population (âge, n, F ± se) ; 5. malédiction du gagnant (entraînement contre
  validation) ; 6. distance génétique moyenne entre vivants (alarme sous 0,05 de l'étendue normalisée) ; 7. débit, pannes, non mesurées, époque, phase.
- **Disque** : ~1 Ko par course ≈ 12 Mo/jour (courses.jsonl découpé par semaine) ; ~25 Ko par pilote dans `etat/pilotes/`.

---

## 9. Le labo (après la mise au point, à la main)

`inscrire-champion.js` inscrit un champion sous l'étape **`N1`** (distincte de l'étape C de boucle.js), lot `entrainement`, `modele:'evolution'`,
raison générée (« génération 42 : 4 réglages mutés : braqueNitro .70→.82, … ; phase A »), parents = le champion précédent, puis `L.valider`
(role `candidat`/`barre`) et `clore()`. Il faut ajouter `/^evolution/` à `sansCout()` de labo.js (une ligne) plutôt que des lignes à 0 € dans
depenses.jsonl. Jamais pendant que boucle.js ou inscrire.js tournent (id sans verrou). L'évolution elle-même n'écrit **rien** dans `ml/labo/journal`.

---

## 10. L'ordre de construction (chaque étape a son test)

| # | Étape | Livrable | Test (doit passer avant l'étape suivante) |
|---|---|---|---|
| 0 | **Préalables** | Les modifications non committées de `piloter.js` et `yeux.js` (loi « retours ») committées ou annulées sur la branche de travail ; worktree `CASH-CAR-evolution` ; `--banc` de evoluer.js. | (a) 2 processus neufs, même graine 910000, 45 s : même empreinte (sha1 des touches + bilan). (b) Une course de 45 s aux graines 1 000 000 et 990000 se joue (sinon repli du § 5.1). (c) Banc 20 courses de 300 s à 6, 8, 10 travailleurs : courses/h et pannes écrites dans config.json. |
| 1 | `enfant.js` + `courses.js` + cache | Ordonnanceur seul, en ligne de commande (`node courses.js pilote.js --graines 12`). | Les 12 courses de pilote-voltige depuis 910000 à tmax 300 redonnent le palier et la durée de la note existante (43 sur 45 identiques attendus, cf. bruit/resultats.txt §0). Tuer le maître au milieu, relancer : seules les courses manquantes tournent. |
| 2 | `genome.js` + `modele.js` + `identite.js` | Le pilote fabriqué. | (a) **Identité** : génome témoin (W2 = 0) contre pilote-voltige.js, 3 graines × 45 s, un processus neuf chacun : empreintes identiques. (b) Un génome avec W2 ≠ 0 donne une course différente (les têtes sont branchées). (c) `reparer()` : 10 000 mutations au hasard respectent les 3 contraintes et les bornes. (d) `ecrirePilote` : zéro `\r`, sha stable, chargement < 20 ms. (e) Rayons dans le désordre (vue truquée) → erreur levée. |
| 3 | `note.js` | Note hors ligne. | Sur `evolution-etude/bruit/courses-0.json` (34 pilotes × 24 graines) : (a) l'ajustement retrouve un `b` moyen du lot 930000 plus bas d'environ 0,8 palier moyen ; (b) la fiabilité lot 1 / lot 2 de `â_p` ≥ 0,44 (celle du palier moyen) ; (c) l'écart classique de pilote-voltige sur sa grande note retombe à 1,67 ± 0,1. Moins de 10 s sur un cœur. |
| 4 | `evoluer.js` (sans validation) | La boucle. | `--une-generation` avec μ = 4, λ = 2, 3 graines, tmax 60 : finit, écrit tous les fichiers. Tuer au milieu (kill dur), relancer : mêmes naissances, seules les courses manquantes. STOP et PAUSE marchent. Changer un octet de `yeux.js` : nouvelle époque annoncée. Deux lancements : le second s'arrête. |
| 5 | Validation + coffre + champions | Sacre. | `--valider-maintenant` : 48 courses, verdict écrit ; le fichier du champion, noté par `noter.js` sur 1 graine, donne la même course que dans courses.jsonl. |
| 6 | Tableau, etat.js, lanceurs, README | Exploitation. | tableau.html s'ouvre hors ligne ; etat.js tient en 10 lignes ; lancer.cmd marche à la main (la tâche planifiée est posée par Sacha). |
| 7 | **Première nuit** (phase A) | — | Au matin : ≥ 12 générations, non mesurées < 2 %, débit noté, témoin à palier moyen stable (± 0,5 du départ) — sinon le simulateur dérive, tout arrêter. |
| 8 | Phases B et C | Rien à écrire (automatique). | Après ouverture : distance génétique des W2 > 0 ; aucune hausse des pannes ni de `cerveau_ms_moy` > 5 ms. |
| 9 | Labo | `inscrire-champion.js` + une ligne de labo.js. | Un champion inscrit en étape N1 ; `boucle.js` sur l'étape C ne voit rien changer (`meilleur()`). |

---

## 11. Repoussé à plus tard (et pourquoi)

- **Imitation / DAgger** (neuronal) : la greffe muette donne le même départ exact sans 600 courses ni code d'apprentissage. À reprendre seulement si
  on veut des têtes beaucoup plus grandes qui **remplacent** des blocs de code.
- **Tête « nitro des joueurs »** apprise sur l'étalon : correspondance export ↔ vue non vérifiée.
- **Grille niveau × style (MAP-Elites)** et **écurie palier 1-30** : sans parties de débutants dans l'étalon, un bot faible n'est qu'un bot qui meurt.
  En attendant, morts.jsonl donne des fossiles de palier ~3 à ~9 (honnêtement : des bots moins bons, pas des débutants crédibles).
- **Mesures témoins anti-Goodhart** (durée des appuis de nitro, quantiles de |lat|…) : utiles, mais la zone morte + le coffre + l'écart classique
  journalisé suffisent en v1.
- **Variantes du labo** (pN…pZ) en génération 0.
- **Nouvelles sorties** : drift, frein, saut, lois `retours` — à ajouter dans modele.js (W2 à 0 pour rester muettes à la naissance).
- **σ auto-adapté, CMA-ES** sur un génome réduit : seulement si la phase A plafonne nettement.
- **Placebo** (statistique) : écarté définitivement — dans un simulateur déterministe, un jumeau rejoue les mêmes courses.

---

## 12. Ce que la sélection naturelle seule ne donnera pas

1. **Ce que le code et les yeux ne savent pas exprimer** : tenir le canyon, freiner, drifter, le slalom (« aller », z +4,6), la pose droite
   (36 % des poses ressortent en moins de 0,8 s : il faut de nouveaux rayons, ETAPES.md). Le génome règle des nombres et deux petites têtes qui ne
   choisissent qu'entre ce que le radar propose.
2. **Les paliers 25 à 30** : il faut survivre ~900 s ; le pilote a un record de 14-19, les joueurs 28. Pas sans de meilleurs yeux.
3. **Des débutants crédibles** (paliers 1-5) : rien ne les mesure (l'étalon = 8 parties au clavier de 2 joueurs moyens).
4. **« Qu'on ne les distingue pas d'un joueur »** : 15 mesures sur 8 parties ne le prouvent pas (un joueur contre les autres : 0,39 à 1,15). Il faut
   20 à 30 parties de plus, à tous les niveaux, et un juge extérieur (discerner.js, un humain qui regarde des rejeux).
5. **Ce que la main fixe** : le profil clavier est figé exprès ; une partie de l'écart lui appartient.

**Ce qu'on peut attendre** (estimations, non mesurées) : en une nuit, la tuyauterie validée et un écart classique de 1,67 vers ~1,5 sur le coffre,
aucun gain de palier démontrable ; en une semaine (~250 générations, ~80 000 courses), écart 1,2-1,4 et +1 à +2 paliers moyens au mieux, puis un
plateau qui dira qu'il est temps d'écrire de nouveaux yeux ou gestes.

---

## 13. Non vérifié (à lever pendant l'étape 0)

Débit réel du Ryzen et gain des 12 fils ; que le jeu accepte les graines ≥ 990000 et ≥ 1 000 000 et y tire des maps du tirage actuel ; que
`Math.tanh`/`Math.exp` donnent les mêmes bits d'une version de Node à l'autre (d'où `node` dans la clé du cache) ; que les bornes des réglages sont
bonnes (propositions tirées des commentaires) ; la cause des 2 courses sur 45 qui diffèrent de 2-5 s vers 290 s entre deux notes ; que les chiffres
de bruit (corrélation 0,16 sur graines communes) tiennent pour des pilotes à réseau plus différents (à remesurer après 10 générations depuis
courses.jsonl) ; le contenu de `doigts.js`, `mesures.js`, `arbre.js` au-delà de ce qu'en disent l'inventaire et les conceptions.


## 14. Ce qui a changé à la construction (27/11/2026)

Cette spécification d'origine ne se réécrit pas : les écarts décidés pendant la construction sont tenus ailleurs, et y font foi.

- **Le contrat des modules** : `ml/evolution/INTERFACES.md`. Son § 8 rassemble les corrections d'après les trois relectures de l'après-midi
  (déterminisme, robustesse, statistique) : le sacre exige `ΔF > 2·se(ΔF)` et non `1·se` (§ 7.6 ci-dessus), le rétrécissement sur les seuls vivants,
  les échecs d'environnement rejoués, l'époque qui compte le régime et l'empreinte des fichiers du bot, etc.
- **Les finitions du soir** : `ml/evolution/INTERFACES.md` § 9, trois lots faits et relus puis intégrés :
  - « machine » (`ml/evolution/notes/machine.md`) : le banc du § 8 ci-dessus n'écrit plus dans `config.json` mais dans `etat/machine.json`, un par PC,
    et se fait tout seul au premier lancement sur un PC ; `travailleurs: "auto"` ; une ligne de commande de travers ne lance rien (code 2) ;
  - « traces » (`ml/evolution/notes/traces.md`) : l'arbre généalogique (`etat/arbre.html`, la pièce que le plan d'origine appelait « maîtresse ») et le récit
    (`etat/histoire.md`), refaits à chaque génération ; `sauver-traces.cmd`, qui les committe sur la branche `evolution-<pc>` et les envoie sur GitHub
    (jamais main) — un écart au « rien n'est publié » d'origine, demandé par Sacha (« garder des traces de tous les process, pour un portfolio ») ;
  - « gestes » (`ml/evolution/notes/gestes.md`) : cinq gestes des joueurs (`PROPOSITIONS.md`), 21 gènes éteints à la naissance, le génome passe en v:2
    (107 gènes au lieu de 86 ; les identifiants ne changent pas tant que les gestes sont à leur naissance).
- **L'état de la livraison** et les commandes à taper sur le Ryzen : `ml/evolution/notes/LIVRAISON.md`.
- **L'automatisme du § 8** : la tâche « au démarrage » est devenue une tâche à l'ouverture de session plus une relance horaire (INTERFACES.md § 2.9 bis), et
  une troisième tâche horaire met l'histoire à l'abri (§ 9.2). La sélection tourne dans un dossier à elle, un worktree `CASH-CAR-evolution` sur la branche
  `evolution-<pc>` (README, « INSTALLER SUR UN NOUVEAU PC »).
