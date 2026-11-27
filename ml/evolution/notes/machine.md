# Note « machine » (27/11/2026) : le même dépôt sur n'importe quel PC, et un mot de travers ne lance rien

Pour l'intégrateur : ce qui a changé, les formats nouveaux, le texte à mettre dans le README pour Sacha, ce qui reste à faire.
Rien n'est commité. Le jeu, `ml/bot/`, `ml/reel/`, `ml/labo/` et le témoin ne sont pas touchés.

## Ce qui a changé

| Fichier | Changement |
|---|---|
| `evoluer.js` | `lireOptions` : toute la ligne de commande est contrôlée **avant** la config, le verrou et toute course. `--aide` / `--help` / `-h` → l'usage, code 0. Option inconnue, mot en trop, valeur manquante ou absurde, option donnée deux fois, options incompatibles, `--config` introuvable → l'erreur et l'usage sur stderr, code 2. `--option=valeur` est accepté. |
| `evoluer.js` | La console : `process.stdout` / `process.stderr` ont un écouteur `error`. Toute écriture passe par `ecrireConsole` (try/catch). Si la console meurt (EPIPE…), le maître continue et la suite de son journal va à la fin de `<etat>/sortie.log` (une ligne « la console ne repond plus (EPIPE) » le dit). |
| `evoluer.js` | Le banc (`banc(cfg, dire, o)`) écrit `<etat>/machine.json`, **plus jamais config.json**. Au premier lancement sur un PC (pas de machine.json valable, pas de nombre forcé), `principal` fait le banc lui-même, avant la génération 0, et le dit dans le journal (pourquoi, la liste essayée, une durée estimée). |
| `evoluer.js` | `refusDePartir(o)` : PowerShell a 5 s au plus (avant : 60 s). PowerShell absent, lent ou illisible : on part, et une ligne le dit (« impossible de verifier que ml/ecurie/boucle.js ne tourne pas (…) : on part quand meme »). `estMaitre` (le verrou) garde 15 s. |
| `commun.js` | `lireConfig` contrôle `travailleurs` et `banc` (une valeur absurde lève, avec un message clair) et **résout `"auto"` en un entier**. Tout lecteur de `cfg.travailleurs` (courses.js, identite.js, inscrire-champion.js) reçoit donc un nombre. Les fonctions du réglage par machine sont dans commun.js (liste plus bas). |
| `config.json` | `"travailleurs": "auto"`, `"banc": {"travailleurs": "auto", "courses": 20, "tmax": 300}`. La note `_notes[1]` est réécrite. |
| `config-essai.json` | `"travailleurs": "auto"`, `"banc": {"travailleurs": [1, 2], "courses": 4, "tmax": 45}`. Un essai ne lance donc jamais plus de 2 courses à la fois, même en repli. Son banc prend 1 à 5 minutes. |
| `lancer.cmd` | Seul le **premier** mot peut être `auto` (avant : `--etat auto` perdait son `auto`). Un argument vide `""` est sauté (avant : il arrêtait la liste et les options suivantes étaient perdues). Sans `etat\machine.json`, la fenêtre dit en une ligne que les premières minutes servent à mesurer le PC. Le message du code 2 cite aussi « une option est mal ecrite ». Reste en CRLF et en ASCII. |
| `etat.js` | Ligne 3 (Débit) : `… ; 9 a la fois (banc du 27/11)`. Les autres valeurs possibles sont `ecrit dans la config`, `banc a faire` et `sans banc`. |
| `.gitignore` | Un seul commentaire change : machine.json est cité parmi ce qui se committe. Il n'était déjà pas ignoré. |
| `tests/machine.test.js` | Nouveau : 45 contrôles, aucune course jouée, ~10 s. |

### La ligne de commande (l'usage affiché par `--aide`)

```
node ml/evolution/evoluer.js [--config f.json] [--etat dossier] [--travailleurs N] [--une-generation | --arret-apres N]
                             [--banc] [--valider-maintenant] [--bavard] [--aide | --help | -h]
```

Options incompatibles :
- `--banc` ne va pas avec `--valider-maintenant`, `--une-generation`, `--arret-apres` ni `--travailleurs` ;
- `--valider-maintenant` ne va pas avec `--une-generation` ni `--arret-apres` ;
- `--une-generation` ne va pas avec `--arret-apres`.

`--travailleurs` va de 1 à 256, `--arret-apres` à partir de 1.

Codes de sortie : 0 (arrêt propre ou aide), 1 (erreur fatale, ou `--banc` fini sans nombre valable), 2 (refus de partir **ou option mal écrite**).

`--banc` : refait le banc et réécrit machine.json, puis sort. Un banc raté (interrompu, ou sans nombre valable) n'écrase **jamais** un machine.json qui avait un banc réussi.

### D'où vient le nombre de courses à la fois (dans l'ordre)

1. `--travailleurs N` : pour ce lancement seulement, rien n'est écrit, pas de banc.
2. Un nombre écrit dans la config (`config.json` ou la surcouche) : il l'emporte partout, pas de banc.
3. `<etat>/machine.json`, s'il est de CE PC (même `os.hostname()`, même nombre de cœurs logiques), au format `evolution-machine-1`, avec un nombre entre 1 et 256. Sinon il est ignoré, et la raison est dite.
4. Sinon, le repli : `max(1, L-2)` (L = cœurs logiques), borné par le plus grand nombre de `banc.travailleurs` quand c'est une liste écrite. Le banc est alors à faire.

Le banc est refait au lancement suivant quand machine.json :
- n'a pas de banc réussi (`banc.retenu` vide) ;
- ou a un banc interrompu (STOP, PAUSE, Ctrl+C) : toujours refait ;
- ou a un banc fini sans nombre valable : refait au plus 3 fois (`C.ECHECS_BANC_MAX`). Ensuite il reste au repli, et le journal dit de relancer `--banc` à la main. Cet écart est voulu : sinon un banc qui échoue toujours coûterait jusqu'à une heure à chaque relance.

### Le banc

- **La liste « auto »** : `{ceil(L/2), L-4, L-2, L-1}`, sans doublon, chacun entre 1 et L, en ordre croissant.
  Valeurs : L=2 → [1] ; 4 → [2, 3] ; 8 → [4, 6, 7] ; 12 → [6, 8, 10, 11] ; 16 → [8, 12, 14, 15] ; 32 → [16, 28, 30, 31].
- **Une liste écrite** dans la config reste acceptée.
- **Les courses** : pour chaque n, le témoin joue `n × max(2, ceil(courses/n))` courses de `tmax` s. Ce sont des vagues pleines, sur les mêmes graines d'entraînement depuis 910000, sans cache et sans écrire dans courses.jsonl. C'est un écart à l'ancien banc, qui jouait toujours 20 courses : avec 15 courses à la fois, la dernière vague n'aurait compté que 5 courses, et le débit aurait été faussé.
- **Le choix** :
  - un nombre est écarté s'il a eu une panne de cerveau (tous les essais comptent), une course non mesurée ou une course relancée ;
  - parmi les autres, on garde le meilleur débit ;
  - à moins de 5 % du meilleur débit, on prend le plus PETIT nombre.
- **La durée estimée** dite dans le journal : (nombre total de vagues) × tmax × 0,25 à 1 s réelle par seconde de jeu. Mesuré sur les essais du 27/11 : 0,37 en moyenne.
  - Vraie config sur 16 cœurs : 24 courses à 8, 24 à 12, 28 à 14, 30 à 15, soit **11 à 46 min**.
  - Essai : 68 s à 5 min.
- **STOP, PAUSE ou Ctrl+C pendant le banc** : le banc est interrompu. On passe au repli, machine.json est écrit avec `interrompu:true`, et le banc sera refait au lancement suivant.
  - Une PAUSE posée avant le banc : il attend qu'elle soit levée.
  - Un second Ctrl+C tue les courses du banc.

### Le nombre de travailleurs n'entre pas dans l'époque (vérifié dans courses.js)

- **L'époque ne le contient pas.** `K.epoque(cfg)` (courses.js l. 24-49) hache : `jeu_sha`, `version`, `simulateur`, `node`, `regime`, les fichiers du bot, `reseaux`/`retourFige` (et `etalon`, `noteCfg` pour l'époque des notes). `cfg.travailleurs` n'y est pas.
- **La clé du cache ne le contient pas non plus.** `K.cle` vaut `shaPilote|graine|tmax|jeu_sha|simulateur|node|epoque`.
- **Il ne change pas ce que fait une course.** Chaque course est un `fork` neuf d'enfant.js (l. 187) : le nombre d'enfants à la fois ne change que l'ordonnancement.
- **Un PC trop chargé ne change pas une note.** Il donne des « décisions coupées par la limite de temps » (pannes). La course est alors `mesuree:false`, marquée échec d'environnement (`env`), et rejouée. Elle ne donne jamais un autre résultat mesuré.

## Les formats nouveaux

### `<dossierEtat>/machine.json`

Un par PC. Écriture atomique, en LF, et il se committe. Exemple : le vrai fichier écrit par l'essai du 27/11 sur le PC de développement (seul le nom du PC est masqué) :

```json
{
 "format": "evolution-machine-1",
 "ordinateur": "NOM-DU-PC",
 "cpus": 8,
 "modeleCpu": "Intel(R) Xeon(R) CPU E3-1245 v5 @ 3.50GHz",
 "memoireGo": 15.9,
 "node": "v24.22.3",
 "travailleurs": 2,
 "source": "banc",
 "date": "2026-11-27T19:02:29.156Z",
 "banc": {
  "date": "2026-11-27T19:02:29.151Z",
  "liste": [
   1,
   2
  ],
  "tmax": 45,
  "resultats": [
   {
    "travailleurs": 1,
    "coursesParHeure": 103.6,
    "pannes": 0,
    "nonMesurees": 0,
    "relancees": 0,
    "courses": 4,
    "duree_s": 139
   },
   {
    "travailleurs": 2,
    "coursesParHeure": 180.9,
    "pannes": 0,
    "nonMesurees": 0,
    "relancees": 0,
    "courses": 4,
    "duree_s": 80
   }
  ],
  "retenu": 2
 }
}
```

Les champs :
- `source` vaut `'banc'` (un banc réussi) ou `'auto'` (le repli). `'ligne de commande'` n'est jamais écrit, puisque `--travailleurs` n'écrit rien. Il n'apparaît que dans le journal et dans `cfg._travailleursSource`.
- Après un banc raté, `banc` a en plus `raison`, `interrompu` et `echecs`, et `retenu` vaut `null`.

### Ce que pose `commun.lireConfig` (et `C.resoudreTravailleurs(cfg, {ligne, dossierEtat})`)

- `cfg.travailleurs` : toujours un entier.
- `cfg._travailleursConfig` : `"auto"` ou le nombre écrit.
- `cfg._travailleursSource` : `'ligne de commande'`, `'config'`, `'banc'` ou `'auto'`.
- `cfg._bancAFaire` : vrai ou faux.
- `cfg._machine` : le machine.json lu, ou null.
- `cfg._machinePourquoi` : pourquoi il ne sert pas (`'absent'`, `'il vient d'un autre PC (…)'`, `'illisible …'`…).

### Les exports nouveaux

- **commun.js** : `FORMAT_MACHINE`, `TRAVAILLEURS_MAX` (256), `ECHECS_BANC_MAX` (3), `coeursLogiques()`, `listeBancAuto(L)`, `listeBanc(cfg, L)`, `repliTravailleurs(L, cfg)`, `choisirTravailleurs(resultats)`, `controlerTravailleurs(cfg)`, `descriptionMachine()`, `cheminMachine(d)`, `lireMachine(d)` → `{machine, pourquoi}`, `ecrireMachine(d, {travailleurs, source, banc})`, `bancAFaire(m)`, `resoudreTravailleurs(cfg, o)`.
- **evoluer.js** : `lireOptions(argv, {existe})`, `USAGE`, `planBanc(cfg, L)`, `processusNode(o)`.
- **evoluer.js, signatures changées** : `banc(cfg, dire, {dossierEtat, doitArreter, surOrd, ecrire})` rend maintenant `{travailleurs, retenu, interrompu, raison, resultats, machine}` (avant : le tableau des résultats). `refusDePartir({dire, timeout_ms, commande})` (sans argument : comme avant).

## À reporter dans INTERFACES.md (par l'intégrateur)

- **§ 1** (qui écrit quel fichier) : `config.json` n'est plus écrit par personne. Une ligne de plus : `machine.json` est écrit par `evoluer.js` (le banc) et lu par `commun.lireConfig` et etat.js.
- **§ 2.10** : la ligne de commande, `--aide`, le code 2 pour une option mal écrite, `--banc` → machine.json, le banc du premier lancement, `refusDePartir` (5 s, on part en cas de doute et on l'écrit), la console qui ne tue plus le maître.
- **§ 2.10, « Précisions »** : `config-essai.json` a maintenant `travailleurs "auto"` et un banc `[1, 2]`. Les tests passent toujours `--travailleurs 4`.
- **§ 3.1** : `travailleurs` et `banc.travailleurs` peuvent valoir `"auto"`. Ajouter un § 3.13 pour `machine.json`.
- **§ 2.9** : la ligne 3 de etat.js.
- **§ 2.9 bis** : `lancer.cmd` (seul le premier mot `auto` compte, les arguments vides sont sautés, la ligne du premier lancement).

## Le texte pour le README (pour Sacha)

À mettre dans « Lancer », à la place de la phrase « Au tout premier lancement, il vérifie d'abord… » :

> - Au tout premier lancement sur un PC, il **mesure d'abord ce PC** : il joue quelques courses avec 8, puis 12, puis 14… courses à la fois, et garde le nombre le plus rapide qui ne fait rien rater. Cela prend entre 10 minutes et une heure. La fenêtre le dit. Ensuite il vérifie que le pilote fabriqué conduit exactement comme pilote-voltige (quelques minutes), puis la sélection commence.
> - Le résultat de la mesure est rangé dans `etat/machine.json`. Il ne sert qu'à ce PC : sur un autre PC, la mesure est refaite toute seule. Rien à régler à la main.
> - Pour refaire la mesure (par exemple après avoir changé de processeur) : arrête la sélection, puis tape `node ml\evolution\evoluer.js --banc` à la racine du dépôt.
> - Si la mesure est interrompue (arrêt, pause), la sélection part quand même avec un nombre prudent. La mesure sera refaite au lancement suivant.

Dans « Si ça s'arrête », deux lignes de plus pour le tableau :

> | La fenêtre dit « Pas lancé : … une option est mal écrite » | Un mot de travers dans la commande (par exemple `--aide` mal tapé). Rien n'a été lancé. | Regarder la fin de `etat/sortie.log`. La ligne `node ml\evolution\evoluer.js --aide` montre toutes les options. |
> | `sortie.log` dit « impossible de verifier que ml/ecurie/boucle.js ne tourne pas … on part quand meme » | Windows n'a pas répondu à temps (PowerShell lent ou absent). La sélection est partie quand même. | Rien, si `boucle.js` ne tourne pas. |

Dans « Ce qu'il ne faut pas faire », remplacer la dernière ligne par :

> - Ne pas modifier `config.json` pendant que ça tourne. Le nombre de courses à la fois ne s'y règle plus : il est mesuré pour chaque PC.

Dans « Les fichiers », une ligne de plus :

> | `etat/machine.json` | Ce que la mesure a trouvé pour ce PC (combien de courses à la fois). |

## Les tests

Tests lancés :
- `node ml/evolution/tests/machine.test.js` : **45 / 45**, aucune course jouée, ~10 s.
- Les tests existants rapides : graines 8/8, note 16/16, genome 14/14, tableau 69/69, lanceurs 17/17, generation 12/12, robustesse 8/8.
- **commun 15/16** : le contrôle « lireConfig fusionne » attend encore `JSON.stringify(cfg.banc.travailleurs)==='[2,3]'`. Le banc de l'essai est maintenant `[1, 2]`, pour qu'un essai ne dépasse jamais 2 courses à la fois. **À corriger dans `tests/commun.test.js` ligne 40 : `'[2,3]'` → `'[1,2]'`** (ce n'est pas mon fichier).
- Les tests lents (courses, identite, evoluer) **n'ont pas été relancés**. Ils passent `--travailleurs 4` ou un nombre explicite, donc le banc n'y joue pas. Mais evoluer.test.js repose sur `principal` (réécrit), et ce n'est pas vérifié.

Le premier lancement d'essai pour de vrai : `node ml/evolution/evoluer.js --config config-essai.json --etat essais/machine/etat --arret-apres 1`, sans `--travailleurs`. Voir « L'essai pour de vrai » plus bas.

Ce que machine.test.js contrôle :
- **Les options** : 24 lignes de travers, chacune avec son erreur. `--aide`, `-h` et `--help`, même au milieu d'autres options.
- **La vraie ligne de commande** : un processus `evoluer.js` avec `--aide`, `-h`, `--inconnue`, `--travailleurs abc`, `--arret-apres 0` ou `lancer`. Code 0 ou 2, en moins de 5 s, sans verrou, sans machine.json, sans population. Ces lancements passent toujours `--config config-essai.json --etat essais/…` : même si le contrôle ratait, seul un essai serait lancé.
- **EPIPE** : un vrai maître, avec un STOP posé d'avance (il s'arrête avant toute course). On ferme son tube de console dès sa première ligne. Il finit en code 0, et sa fin de journal est dans `<etat>/sortie.log`. Sans la correction, le même geste fait planter node (« Unhandled 'error' event … EPIPE »), reproduit à part.
- **La liste et le choix** : la liste « auto » pour L = 1, 2, 4, 8, 12, 16, 32 ; le repli et sa borne ; 7 cas de choix du banc ; la durée du banc de l'essai (≤ 5 min) et celle du vrai banc sur 16 cœurs.
- **machine.json et la résolution** : machine.json écrit puis relu, et ignoré s'il vient d'un autre PC, d'un autre nombre de cœurs, s'il est tronqué ou s'il a un nombre absurde. Quand refaire le banc. L'ordre ligne > config > machine.json > repli. 7 configs de travers qui font lever lireConfig.
- **Un banc interrompu** : repli, `interrompu`, banc à refaire. Un bon machine.json n'est pas écrasé.
- **refusDePartir pour de vrai** : 434 ms sans rien. Avec un **faux** `…/essais/machine-tests/faux/ml/ecurie/boucle.js` (un node qui dort 60 s) : refus en 435 ms, avec son pid. Un faux PowerShell lent (1,5 s), absent, ou qui répond n'importe quoi : on part, et une ligne le dit. Un seul processus rendu en objet est bien lu. Sans PATH, Windows trouve quand même PowerShell (454 ms) : le cas « PowerShell vraiment absent » n'est couvert que par le faux exécutable.

## L'essai pour de vrai (27/11)

`node ml/evolution/evoluer.js --config config-essai.json --etat essais/machine/etat --arret-apres 1`, sans --travailleurs, avec un état vide. Code 0, 10 min 42 s en tout.
- **19:58:49** : le maître part avec 2 courses à la fois. C'est le repli, borné par la liste [1, 2] ; le journal dit « le banc est a faire ».
- **19:58:50** : « banc : premier lancement sur ce PC (pas de machine.json) : avant la generation, on mesure … ». La liste essayée est 1 et 2, pour une durée estimée entre 68 s et 5 min.
- **Le banc (3 min 39 s)** :
  - 1 à la fois : 4 courses, 103,6 courses/h, en 139 s ;
  - 2 à la fois : 4 courses, 180,9 courses/h, en 80 s ;
  - aucune panne ni course non mesurée : **2 est retenu** et écrit dans `essais/machine/etat/machine.json` (recopié plus haut).
- **20:02:29 à 20:04:24** : le contrôle d'identité, sur 3 graines, toutes IDENTIQUE.
- **20:04:24 à 20:09:31** : la génération 0 (4 pilotes × 3 graines, **2 à la fois**), puis le coffre de l'époque. 14 courses jouées, 0 non mesurée, fin en code 0.
- **Le second lancement** (STOP posé d'avance) : pas de nouveau banc. Le journal dit « 2 courses a la fois (mesure par le banc du 2026-11-27, etat/machine.json) », puis l'arrêt, en code 0.
- **etat.js** sur cet état, ligne 3 : `Debit : 119 courses/h (gen. 0 : 14 courses dont 14 jouees, 0 du cache, en 7 min) ; 2 a la fois (banc du 27/11)`.

Au plus 2 courses à la fois pendant tout l'essai. Aucun autre essai ne tournait en même temps.

## Ce qui reste à faire

- Corriger `tests/commun.test.js` ligne 40 (`[2,3]` → `[1,2]`), puis reporter cette note dans INTERFACES.md et README.md.
- Le tableau (`tableau.js`, section « 7. La machine ») ne montre pas encore machine.json : le nombre retenu, la date du banc, les débits mesurés. etat.js le montre en ligne 3.
- Le vrai banc sur le Ryzen n'a pas été joué (vraie config interdite ici). La durée de 11 à 46 min pour 16 cœurs est une estimation.
- `estMaitre` (la reprise d'un verrou dont le pid vit encore) reste prudent quand PowerShell ne répond pas en 15 s : il croit que c'est un maître et refuse de partir (code 2). C'est voulu (ne pas voler le verrou d'un maître vivant), mais une tâche planifiée qui relance toutes les heures retentera.
- `lancer.cmd` n'a été testé que par `tests/lanceurs.test.js`, avec un faux maître. Les nouveaux cas (`--etat auto`, `""`) n'y ont pas de contrôle à eux : ce fichier de test n'est pas à moi. La ligne « Premier lancement sur ce PC » n'a pas été vue dans une vraie fenêtre.

## La relecture (27/11, le relecteur de « machine »)

J'ai relu le diff, relancé ses tests, puis cherché à casser. Ce qui tient, ce que j'ai trouvé, ce que j'ai corrigé.

### Ce que j'ai corrigé (chaque correction a son contrôle dans `tests/machine-relecture.test.js`, 19 contrôles, aucune course, ~12 s)

1. **`lancer.cmd` ne marchait pas du tout dans un dossier dont le nom a des parenthèses** (par exemple `CASH CAR (2)`, le nom que Windows donne à une copie). cmd.exe refusait le fichier entier : « \ml\evolution\ était inattendu ». La cause : `%ICI%` sans guillemets dans le bloc `if not exist "%ICI%evoluer.js" ( … )`. Le défaut existait avant « machine ». Corrigé : `"%ICI%"` entre guillemets dans les deux lignes. Le fichier reste en CRLF et en ASCII. Contrôlé : lancer.cmd copié dans `essais/machine-relecture/depot avec espaces (2)/` avec un faux evoluer.js. Les options arrivent entières (`--etat "C:\x (y) z\etat"`), `auto` en premier mot est mangé, `""` est sauté, `--etat auto` garde son `auto`, et sans evoluer.js le message s'affiche (code 1). Les espaces seuls marchaient déjà.
2. **Un machine.json impossible à écrire tuait le maître après le banc** (un dossier `machine.json`, un fichier en lecture seule ou tenu ouvert) : `ecrireMachine` levait en dehors du `try` du banc, donc ERREUR FATALE (code 1) après plusieurs minutes de banc, et la même chose à chaque relance. Corrigé dans `banc()` : l'écriture est protégée, le journal dit « impossible a ecrire … le nombre ne vaut que pour ce lancement », et la sélection continue avec le nombre trouvé.
3. **Un machine.json retouché à la main avec plus de courses que de cœurs logiques était cru** (par exemple 11 sur 8 cœurs). « auto » ne donne jamais cela : la liste auto et le repli restent dans [1, L]. Corrigé dans `C.lireMachine` : un tel fichier est ignoré (« retouche a la main ? ») et le banc est refait. La seule exception : le nombre a été mesuré par une liste de banc écrite à la main, c'est-à-dire qu'il est dans `banc.liste`.
4. **`--valider-maintenant` faisait d'abord le banc** sur un PC sans machine.json, ce qui pouvait prendre jusqu'à une heure avant une validation demandée « maintenant ». Corrigé : pas de banc dans ce cas, le repli est utilisé, et le banc sera fait au prochain lancement ordinaire. Le journal le dit.
5. **Après le banc du premier lancement, `cfg._machine` restait vide.** Le tableau et le résumé du maître (`ecrireTableau(ctx)` → etat.js `machineCourte`) affichaient donc « banc du ? » jusqu'au lancement suivant. Corrigé : `cfg._machine` et `cfg._bancAFaire` sont mis à jour après le banc. **Pas contrôlé par un test** : il faudrait un vrai banc fini dans le même processus.
6. **`tests/commun.test.js` ligne 40** : `'[2,3]'` est devenu `'[1,2]'`, la seule retouche de ce fichier. Le test attendait l'ancien banc de l'essai. Il passe maintenant 16/16.

### Ce que j'ai essayé de casser, et qui tient

- **Un mot de travers** : `lireOptions` est appelé avant `lireConfig`, le verrou et toute course. `-h` au milieu (`--etat -h`) donne l'aide, rien n'est lancé. Les options en majuscules (`--Banc`) ou à un seul tiret (`-banc`) donnent « option inconnue », code 2.
- **machine.json vide, `null`, une liste, tronqué, un dossier, `travailleurs` à `"auto"`, à 0 ou à 2,5, un autre nom d'ordinateur, un autre nombre de cœurs** : il n'est jamais cru, le banc est à faire, et le nombre de repli reste dans [1, L] (11 cas dans machine-relecture.test.js).
- **Deux lancements pendant le banc** (essai réel, `essais/relecteur-machine/etat`) : le verrou est pris avant le banc, et son battement est un `setInterval`, donc il vit pendant le banc. Le second lancement, parti 1 s après le début du banc, sort en **code 2** : « une evolution tourne deja sur cet etat (pid …) ».
- **STOP pendant le banc** (même essai) : le banc s'arrête à la fin de la course en cours (~25 s). machine.json est écrit en `source:'auto'`, avec `interrompu:true`, `echecs:0` et un repli à 2. Aucune génération n'est lancée et le STOP est effacé (code 0). Relancé avec un STOP posé d'avance : ni banc ni course, code 0.
- **« auto » ne donne jamais 0 ni plus que L** : liste auto et repli bornés (machine.test.js le contrôle pour L = 1 à 8, 12, 16, 32 et 64).
- **La reprise d'un état ne change pas d'époque** : `cfg.travailleurs` n'entre ni dans `K.epoque` ni dans `K.cle`, ni dans `shaIdentite`. Un état qui a un machine.json avec un banc réussi ne refait pas le banc (vu par l'essai de « machine »).
- **config.json n'est plus jamais écrit** : aucun `writeFile` ni `ecrireAtomique` vers config.json dans ml/evolution/*.js (grep), et machine-relecture.test.js vérifie que config.json et config-essai.json ont les mêmes octets après ses lancements.
- **refusDePartir** : environ 0,45 s pour de vrai (vu dans les deux fichiers de test).

### Ce qui reste (relecture)

- **`tests/evoluer.test.js` lance 4 courses à la fois** (`--travailleurs 4` en dur). Sur ce chantier, où on joue au plus 2 courses à la fois, je ne l'ai pas lancé tel quel. J'ai lancé une copie temporaire (`--travailleurs 2`, autre dossier d'essai, copie effacée ensuite) pour les étapes `a` et `c` : voir le résultat plus bas. Les étapes bd, e, f, g et t n'ont pas été relancées.
- **Un état déjà commencé mais sans machine.json** (par exemple l'évolution d'essai qui tourne en ce moment, quand elle recevra ce code) fera son banc à la reprise, avant de continuer sa génération. C'est conforme à « pas de machine.json → banc », mais ce n'est pas « avant la génération 0 ». Le banc n'écrit rien dans courses.jsonl et ne change pas l'époque.
- **machine.json se committe, mais il est propre à un PC.** Un machine.json du PC de développement tiré par git sur le Ryzen y est ignoré (autre nom) et réécrit par le banc. Le fichier suivi est alors modifié, et un `git pull` suivant peut refuser de l'écraser. C'est le même cas que population.json et les autres fichiers de `etat/`, qui sont eux aussi propres à un PC. Autre effet : lancer.cmd ne regarde que l'existence de `etat\machine.json`. Dans ce cas, il ne dit donc pas « Premier lancement sur ce PC », alors que le banc a bien lieu (il est écrit dans sortie.log).
- Un STOP pendant le banc attend la fin des courses en cours, jusqu'à `banc.tmax` (300 s avec la vraie config). C'est la même règle qu'en génération.

À ajouter au texte du README pour Sacha (§ « Si ça s'arrête ») :

> | La fenêtre se ferme tout de suite, avec « … était inattendu » | Plus depuis le 27/11 : lancer.cmd marche aussi dans un dossier dont le nom a des parenthèses, comme `CASH CAR (2)`. | Si ça revient : renommer le dossier sans parenthèses. |
