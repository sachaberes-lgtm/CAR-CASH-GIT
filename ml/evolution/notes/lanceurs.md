# Les lanceurs : un Node fixe par PC, des tâches sans limite de 72 h (28/11/2026, lot « lanceurs »)

Deux défauts sont apparus pendant l'installation sur le Ryzen (rapport de Sacha, 28/11) :

1. Dans le PATH système, `C:\Program Files\nodejs` passait en premier : un simple `node` lançait v24.22.1 au lieu de v24.22.3.
   Or la version de Node entre dans l'époque des courses (`courses.epoque` → `composants.node`, INTERFACES § 3.10). Une autre version ouvre donc une nouvelle époque, et toutes les notes repartent de zéro, **sans rien dire**.
2. `schtasks /create /sc …` pose une tâche que Windows **tue au bout de 72 heures** (c'est la limite par défaut). La sélection se serait arrêtée tous les trois jours.

Sur le Ryzen, les trois tâches ont été posées à la main, sous les mêmes noms, sans limite de durée et avec node-v24.22.3 en tête du PATH.

## Pour Sacha, en trois lignes

- **Rien à faire de plus.** Au prochain `lancer.cmd` (après la mise à jour habituelle), il retrouve tout seul le Node de l'époque en cours. Il écrit son chemin dans `ml\evolution\etat\node.txt` et s'en sert ensuite à chaque fois.
- **S'il refuse de partir**, la fenêtre dit quel Node il attend, lequel il a trouvé, et comment corriger. Le même texte est rangé dans `etat\NODE-REFUSE.txt`. Pour corriger, écris dans `etat\node.txt` le chemin complet du bon `node.exe`, sur une seule ligne, puis relance `lancer.cmd`.
- **Tu peux relancer `installer-tache.cmd` une fois** (O ou N, comme avant). Il remplace proprement les trois tâches posées à la main. Si tu ne le relances jamais, rien ne casse : les tâches posées à la main continuent d'appeler `lancer.cmd auto`, qui prend lui aussi le Node de `node.txt`.

## Ce qui a changé

| Fichier | Changement |
|---|---|
| `node-fixe.js` (nouveau) | Choisit et contrôle le Node de ce PC (`choisir`). Écrit les trois tâches en XML (`taches`). Ne touche ni à Windows ni au réseau. |
| `cache.vbs` (nouveau) | `wscript //B cache.vbs "<x>.cmd" args` lance le .cmd dans une fenêtre cachée, attend sa fin et rend son code. Pas de fenêtre noire toutes les heures, et aucun droit d'administrateur. |
| `lancer.cmd` | Lance `evoluer.js` avec le Node choisi par `node-fixe.js`. Ne lance rien (code 2) si ce Node n'est pas celui de l'époque. |
| `arreter.cmd`, `sauver-traces.cmd` | Prennent le Node de `etat\node.txt` s'il existe, sinon `node` du PATH. Ils ne refusent jamais sur la version : ils ne jouent aucune course. |
| `installer-tache.cmd` | Pose les tâches par `schtasks /create /tn NOM /xml F /f`. Nouveau mode `essai DOSSIER`. Le texte d'avant le O / N a été complété. |
| `.gitignore` | Ajoute `etat/node.txt`, `etat/node.txt.*`, `etat/NODE-REFUSE.txt`, `etat/node-choix-*`, `etat/CHANGER-DE-NODE`. |
| `.gitattributes` | `*.vbs text eol=crlf` |
| `tests/lanceurs.test.js` | Réécrit et étendu : les anciens contrôles du 27/11 plus les nouveaux, 74 contrôles en tout. |
| `tests/integration.test.js` | Il cherchait les anciennes lignes `/sc onlogon` et `/sc hourly`. Il cherche maintenant `/xml … /f` et l'absence de `/sc`. Son aperçu recopie aussi `node-fixe.js` et `cache.vbs`. |
| `tests/machine-relecture.test.js` | Recopie aussi `node-fixe.js` à côté de `lancer.cmd`. |

Je n'ai touché ni à `genome.js`, `modele.js`, `evoluer.js`, `commun.js`, `identite.js`, ni à `README.md`.

### Comment `lancer.cmd` choisit son Node

1. **Le Node d'amorce.** C'est celui qui fait tourner `node-fixe.js`, et il peut être de n'importe quelle version : `node-fixe.js` ne joue aucune course. On prend celui de `etat\node.txt` s'il existe. Sinon, le premier `where node.exe`. Sinon `%ProgramFiles%\nodejs` ou `%LOCALAPPDATA%\Programs\nodejs`.
2. **`node-fixe.js choisir --etat <etat>`.** La version attendue est `population.json` → `epoque.composants.node`. Si le fichier n'existe pas, s'il est illisible ou s'il ne donne pas de version, il n'y a pas de version attendue.
   - **`etat\node.txt` existe.** Le fichier qu'il désigne doit exister, répondre à `--version` et avoir la version attendue. Sinon : refus, code 2. Le fichier est lu avec ou sans BOM, en CRLF ou en LF, avec ou sans guillemets.
   - **`etat\node.txt` n'existe pas.** Il cherche dans cet ordre :
     - les `node.exe` du PATH, dans l'ordre (le premier est le « node » de cmd) ;
     - le Node qui le fait tourner ;
     - Program Files (x64 et x86) ;
     - `%LOCALAPPDATA%\Programs\nodejs` ;
     - nvm-windows (`NVM_HOME`, `NVM_SYMLINK`, `%APPDATA%\nvm`, `%LOCALAPPDATA%\nvm`) ;
     - fnm (`FNM_DIR`, `%APPDATA%\fnm`, `%LOCALAPPDATA%\fnm`, `node-versions\v*\installation`) ;
     - Volta ;
     - Scoop ;
     - un dossier `nodejs` ou `node-v*`, y compris une archive décompressée en double (`node-v…\node-v…\node.exe`), à la racine du dépôt, à côté du dépôt, ou dans le profil (`%USERPROFILE%`, `Downloads`, `code`, `tools`, `outils`).

     Il prend le premier de la version attendue, ou le premier qui répond s'il n'y a pas d'époque, et l'écrit dans `node.txt`. S'il n'en trouve aucun : refus, code 2, rien n'est écrit. Le texte liste chaque Node trouvé avec sa version et l'endroit où il l'a trouvé.
3. **Sortie.** La ligne 1 donne le chemin, et `lancer.cmd` la lit. Les lignes suivantes expliquent le choix et vont dans `sortie.log`. En cas de refus, tout le texte part à l'écran, dans `sortie.log` et dans `etat\NODE-REFUSE.txt`. Ce fichier est effacé au premier lancement qui passe.
4. **Changer de Node exprès** (une nouvelle époque voulue) : créer le fichier vide `etat\CHANGER-DE-NODE`. Il accepte **une fois** un Node d'une autre version, puis il est effacé, même s'il n'a rien eu à accepter, pour qu'il ne traîne pas.

### Les nouveaux formats

- **`etat\node.txt`** : une ligne, le chemin complet de `node.exe`, terminée par CRLF. Il est propre à chaque PC.
  **Il ne se committe pas**, contrairement à `machine.json` : le chemin contient le nom du compte Windows, et le dépôt est public. `sauver-traces.cmd` ne l'ajoute pas (il n'ajoute qu'une liste fixe de fichiers), et `.gitignore` le tient dehors.
- **`etat\NODE-REFUSE.txt`** : le dernier texte de refus.
- **`etat\CHANGER-DE-NODE`** : un marqueur vide, qui sert une fois.
- **`node node-fixe.js taches --ici <ml\evolution> --sortie <dossier> --node <node.exe> [--utilisateur D\nom] [--debut AAAA-MM-JJ]`** : écrit les fichiers suivants dans `<dossier>`.
  - `CashCarEvolution.xml`, `CashCarEvolution-relance.xml` et `CashCarEvolution-traces.xml`, en UTF-16 avec BOM, comme le Planificateur les exporte.
  - `commandes.txt`, qui liste les quatre commandes que `installer-tache.cmd` lance ensuite.

### Les trois tâches (XML)

**Ce qu'elles ont en commun :**
- `ExecutionTimeLimit` = `PT0S` (aucune limite) ;
- `MultipleInstancesPolicy` = `IgnoreNew` ;
- `DisallowStartIfOnBatteries` et `StopIfGoingOnBatteries` = `false` ;
- `StartWhenAvailable` = `true` ;
- `StopOnIdleEnd` = `false` ;
- `Principal` : `InteractiveToken` et `LeastPrivilege`, sur le compte de la session, sans mot de passe stocké ;
- `Priority 7`, comme le défaut de schtasks ;
- l'action : `%SystemRoot%\System32\wscript.exe //B //Nologo "<ici>\cache.vbs" "<ici>\lancer.cmd" auto`, ou `sauver-traces.cmd auto` pour les traces, avec `WorkingDirectory` = `ml\evolution`.

**Ce qui change d'une tâche à l'autre :**

| Tâche | Déclencheur |
|---|---|
| `CashCarEvolution` | `LogonTrigger` de ce compte, 5 minutes après l'ouverture de session |
| `CashCarEvolution-relance` | `TimeTrigger` à 00:05 du jour de la pose, répété toutes les heures, sans fin |
| `CashCarEvolution-traces` | `TimeTrigger` à 00:35, répété toutes les heures, décalé de 30 minutes pour ne pas tomber en même temps que la relance |

La description de chaque tâche nomme le Node de ce PC.

### `installer-tache.cmd`

- **Mode normal.** `node-fixe.js choisir --sans-ecrire` passe d'abord. Un Node qui n'est pas celui de l'époque arrête tout avant la question : rien n'est posé, code 2. Vient ensuite le texte complet, puis O ou N.
  - **Ce que dit le texte.** Les trois tâches, la mise en veille, l'envoi sur Internet (adresse sans jeton, branche, dépôt public, `PAS-D-ENVOI`, et ce qui part). Il dit aussi : « sans limite de durée (sinon 72 heures) », « sur batterie », « rattrape une heure manquée », « jamais deux fois à la fois », « aucune fenêtre noire », le Node et sa version. Enfin : « Si des tâches de ces trois noms existent déjà (par exemple posées à la main), elles sont REMPLACÉES ».
  - **Après O.** `node.txt` est écrit, les XML sont générés dans `%TEMP%\cashcar-taches-*`, puis il lance `schtasks /create /tn … /xml … /f` trois fois et `powercfg`. Le dossier temporaire est ensuite retiré.
  - **Si un remplacement échoue.** Il dit de relancer en administrateur, ou de retirer la tâche dans le Planificateur. C'est le cas d'une tâche posée à la main en administrateur.
- **`installer-tache.cmd essai DOSSIER`.** Il affiche le même texte, écrit les XML et `commandes.txt` dans `DOSSIER`, puis sort en code 0. Il n'appelle jamais `choice`, `schtasks` ni `powercfg`, et n'écrit pas `node.txt`. Il crée un seul fichier temporaire dans `%TEMP%`, effacé aussitôt.
- **`enlever`.** Inchangé : il retire les trois tâches. Il dit maintenant que `node.txt` reste.

## Les tests

`node ml/evolution/tests/lanceurs.test.js` : **74 / 74**. Il ne joue aucune course et ne pose aucune vraie tâche ; il dure environ une minute sur le Xeon. Le bac de test est `essais/test lanceurs/depot copie (1)/…`, un chemin avec des espaces et des parenthèses.

1. **CRLF et ASCII pur** pour les quatre `.cmd` et `cache.vbs`.
2. **Les 18 contrôles du 27/11** sur `lancer.cmd` et `arreter.cmd`, qui passent tous. Un contrôle en plus : sans `node.txt` ni époque, `node.txt` est écrit.
3. **`node-fixe.js` seul**, avec un faux PATH (deux dossiers, dont un entre guillemets et un en double) et de faux `node.exe` (des fichiers vides) dont la version est simulée. Les cas couverts :
   - l'ordre des candidats ;
   - le choix du second Node du PATH quand c'est lui qui a la version de l'époque ;
   - le refus quand aucun Node n'a la bonne version ;
   - `node.txt` absent, faux, d'une autre version, bon avec BOM et LF, ou présent sans époque en cours ;
   - `CHANGER-DE-NODE` qui sert une fois ;
   - `population.json` abîmé ;
   - un PATH vide : il trouve le bon Node dans une archive `node-v*` décompressée en double à côté du dépôt, en passant devant Programs (v24.22.1) et nvm (v24.22.0).
4. **Le contenu des XML** : `PT0S`, `IgnoreNew`, batterie, `StartWhenAvailable`, `InteractiveToken`, `LeastPrivilege`, `wscript //B`, les chemins avec espaces et parenthèses entre guillemets, `&` échappé, le Node dans la description, `LogonTrigger` avec `PT5M`, `PT1H` sans `Duration`, et `commandes.txt`. System.Xml les relit sans erreur.
5. **De vrais faux `node.exe`**, compilés pendant le test par PowerShell `Add-Type` : un relais qui répond à `--version` par sa propre version et passe tout le reste au vrai Node, en notant chaque appel. Les cas couverts :
   - A (v24.22.1) devant B (v99.0.1) dans le PATH, avec une époque en v99.0.1 : `node.txt` = B, et `evoluer.js` est lancé par B, jamais par A ;
   - `node.txt` = B : A n'est jamais appelé ;
   - une époque en v77.7.7 : code 2, rien de lancé, le texte est complet à l'écran, dans `sortie.log` et dans `NODE-REFUSE.txt` ;
   - `node.txt` vers un fichier absent : code 2 ;
   - `node.txt` = A avec une époque en v99.0.1 : code 2 ;
   - `node.txt` corrigé à la main : ça repart, et `NODE-REFUSE.txt` s'efface ;
   - un PATH sans node, avec Node dans `%LOCALAPPDATA%\Programs\nodejs` ;
   - `arreter.cmd` utilise le Node de `node.txt`.
6. **`installer-tache.cmd`** sous un PATH où `schtasks.exe`, `powercfg.exe` et `choice.exe` sont des pièges compilés, qui notent leurs arguments ; le vrai `schtasks` n'est jamais atteint. Les cas couverts :
   - en essai : aucun piège appelé, les fichiers écrits, le texte complet ;
   - en pose avec N : seul `choice` est appelé ;
   - en pose avec O : les trois `schtasks /create /tn … /xml … /f` exacts, puis `powercfg`, le XML reçu contrôlé et le dossier temporaire retiré ;
   - avec un Node d'une autre époque : code 2, sans question ni `schtasks`.
7. **`cache.vbs` sous `wscript`**, sur un faux `.cmd` placé dans un chemin avec espaces et parenthèses : les arguments arrivent intacts, y compris `"a b c"`, et le code 3 remonte.

Après les tests, `schtasks /query` ne montre aucune tâche CashCar sur le Xeon.

**Les autres tests :**
- `tests/integration.test.js` : 28 / 29. Le contrôle raté, « parent mort v:1 lu migré (v:2, 107 gènes) », vient des changements de `genome.js` en cours chez l'autre agent, pas des lanceurs.
- `tests/machine-relecture.test.js` : 19 / 19.
- `tests/traces.test.js` : 86 / 87 au premier passage. Tous les contrôles de `sauver-traces.cmd` passent. Le raté est « chaque gène du génome a un mot simple » : de nouveaux gènes de `genome.js` (`fuirVite`, `bordOn`…) n'ont pas encore de mot dans `arbre.js`, ce qui n'est pas dans mon lot.
  Au second passage, le test lève sur `rmSync` du dossier temporaire `cashcar-traces-test` (EPERM). Ce dossier est sans doute encore tenu par un processus du premier passage ; je ne l'ai pas forcé.

## Ce que je n'ai PAS vérifié (méfiance)

- **Qu'un vrai `schtasks /create /xml` accepte ces fichiers.** Je n'ai posé aucune tâche (c'est interdit sur ce PC). Le XML suit la forme des exports du Planificateur et System.Xml le relit, mais aucun Planificateur ne l'a validé. Le premier vrai essai sera chez Sacha, et le texte de l'installateur dit quoi faire si une tâche n'est pas posée.
- **Que le `LogonTrigger` se pose sans droits d'administrateur.** C'est le même doute qu'avant pour `/sc onlogon`, et le texte le dit toujours. La tâche horaire suffit à relancer.
- **Que `wscript` soit permis sur le Ryzen.** Une stratégie peut couper Windows Script Host. Dans ce cas, les tâches échouent sans fenêtre, et le Planificateur affiche le code dans « Dernier résultat ».
- **Qu'une tâche à `PT0S` dont le processus `cmd` caché tourne plusieurs jours se comporte bien** (mise en veille, fermeture de session). C'est le comportement attendu de Windows, mais je ne l'ai pas observé.
- **La priorité 7** (sous la normale), qui est aussi le défaut des tâches de `schtasks /sc`. Je ne sais pas quelle priorité ont les tâches posées à la main sur le Ryzen. Si elles tournaient en priorité normale, le banc (`machine.json`) a été mesuré dans d'autres conditions. Ce n'est sans doute pas grave, puisque les courses ne dépendent pas de l'horloge, mais je ne l'ai pas vérifié.
- **Les chemins avec des lettres accentuées** : cmd peut mal lire `node.txt`. `node-fixe.js` prévient, mais ne corrige pas.
- **`lancer.cmd --etat X` ou `--config`** : `node-fixe.js` ne regarde que l'époque de l'`etat\` par défaut, celle de la vraie sélection. Pour un état d'essai à part, une autre version de Node n'y ouvrirait qu'une nouvelle époque d'essai.
- **La tâche des traces est elle aussi à `PT0S`, comme demandé.** Un `git push` bloqué pour de bon empêcherait les envois des heures suivantes, à cause d'`IgnoreNew`. L'envoi est déjà coupé s'il ne transmet rien pendant 2 minutes, et SSH ne pose jamais de question. Si l'intégrateur préfère, `PT1H` pour cette seule tâche est un changement d'une ligne dans `tacheXml`.
- **Le cas exact du Ryzen**, avec les tâches posées à la main et un Node dans un dossier `node-v24.22.3` dont je ne connais pas l'emplacement. Si ce dossier est en tête du PATH de la tâche, ou dans un des lieux de la liste, il est trouvé. Sinon : refus clair, et Sacha écrit le chemin dans `node.txt`.
- **L'observation de Fable sur `validations.jsonl`** (les mêmes 20 paliers pour les quatre derniers champions) : je ne l'ai pas recontrôlée, elle n'est pas dans mon lot.

## Demandes pour l'intégrateur (fichiers qui ne sont pas à moi)

1. **`evoluer.js` : refuser de partir quand la version de Node a changé.** Aujourd'hui, seul `lancer.cmd` protège l'époque : `node ml\evolution\evoluer.js` tapé à la main avec un autre Node change d'époque sans rien dire. La demande précise :
   - au chargement, si `pop.epoque.composants.node` existe et diffère de `process.version`, sortir en code 2 avec le même genre de texte (attendue, trouvée, `etat\node.txt`) ;
   - sauf si `etat\CHANGER-DE-NODE` existe, ou si l'option `--nouveau-node` est donnée.
   - **Attention à l'ordre** : `lancer.cmd` (`node-fixe.js`) efface ce marqueur quand il s'en sert, juste avant de lancer `evoluer.js`. Il faudrait donc soit que `node-fixe.js` ne l'efface plus et qu'`evoluer.js` l'efface une fois la nouvelle époque écrite dans `population.json` (je peux faire ce changement de mon côté), soit qu'`evoluer.js` accepte un drapeau passé par `lancer.cmd`.
2. **`README.md` :**
   - la phrase « Une petite fenêtre noire peut apparaître quelques secondes, une fois par heure » est devenue fausse ;
   - ajouter les trois lignes « Pour Sacha » ci-dessus, et dire que `etat\node.txt` est propre au PC et ne se committe pas ;
   - pour le Ryzen : « relancer `installer-tache.cmd` une fois après la mise à jour remplace les tâches posées à la main ».
3. **`arbre.js`** : il manque des mots pour les nouveaux gènes de `genome.js` (voir `tests/traces.test.js`). Ce n'est pas lié aux lanceurs.

Rien n'a été commité, poussé ni installé. Aucun réglage de ce PC n'a changé : aucune tâche, pas de `powercfg`.

## Relecture (28/11/2026, le relecteur)

Relu ligne à ligne : `node-fixe.js`, `cache.vbs`, `lancer.cmd`, `arreter.cmd`, `sauver-traces.cmd`, `installer-tache.cmd`, les tests. Relancé : `tests/lanceurs.test.js` (74 / 74 avant mes changements, 76 / 76 après), `tests/machine-relecture.test.js` (19 / 19), `tests/integration.test.js` (28 / 29, le même raté sur `arbre` / `genome.js`, étranger aux lanceurs).

**Preuve refaite par un autre chemin.** Le doute n° 1 de l'auteur était : « schtasks acceptera-t-il ces XML ? ». J'ai produit les trois fichiers par `installer-tache.cmd essai` (dossier avec espace et parenthèses), puis je les ai donnés au vrai Planificateur de tâches par son interface COM : `NewTask(0).XmlText = …` puis `RegisterTaskDefinition(…, flags = 1)`. Le drapeau 1 (TASK_VALIDATE_ONLY) fait contrôler le XML par Windows sans rien enregistrer. Les trois sont acceptés. Windows relit : limite `PT0S`, `IgnoreNew`, départ sur batterie permis, `InteractiveToken`, wscript avec `cache.vbs` et le bon `.cmd`, répétition `PT1H`. `schtasks /query` ne montre ensuite aucune tâche CashCar ni de test. Ce contrôle ne prouve pas que le compte de Sacha a le **droit** de poser la tâche d'ouverture de session : ce doute reste.

**Ce qui était faux, et qui est corrigé :**
1. **L'installateur mangeait le marqueur `CHANGER-DE-NODE`.** Après le O, `installer-tache.cmd` appelait `node-fixe.js choisir`, qui effaçait le marqueur et écrivait le nouveau Node dans `node.txt`. Mais l'installateur ne lance aucune course, donc l'époque ne changeait pas. Le `lancer.cmd` suivant voyait alors un `node.txt` d'une autre version, sans marqueur, et refusait (code 2) le Node que l'installateur venait de fixer. Correction : une option `--garder-marqueur` dans `node-fixe.js`, que l'installateur passe ; seul `lancer.cmd` efface le marqueur. Un test le prouve.
2. **Un `node.txt` enregistré en « Unicode » (UTF-16) par le Bloc-notes** n'était pas lu : refus « ce fichier n'existe pas » avec un chemin illisible. `node-fixe.js` le lit maintenant aussi. Un test le prouve. `arreter.cmd` et `sauver-traces.cmd` lisent `node.txt` par `for /f` : en UTF-16 ou avec BOM, ils retombent sur le `node` du PATH. C'est sans effet sur les notes, puisqu'ils ne jouent aucune course.
3. **`README.md`** : la phrase fausse sur la fenêtre noire de chaque heure est remplacée. Il dit aussi : pas de limite de 72 h, le remplacement des tâches posées à la main, et ce qu'est `etat/node.txt`. C'était la demande n° 2 de l'auteur.

**Ce qui reste (je ne l'ai pas corrigé) :**
- Le marqueur est effacé **avant** qu'`evoluer.js` ait écrit la nouvelle époque. Prenons un `lancer.cmd` qui consomme le marqueur, puis un `evoluer.js` qui sort sans changer d'époque (verrou tenu par une sélection en cours, option de travers). Le lancement suivant refuse alors, et il faut recréer le marqueur. Le refus est bruyant, jamais silencieux, donc sans danger pour les notes. La vraie correction est la demande n° 1 ci-dessus (`evoluer.js` efface le marqueur), dans un fichier qui n'est pas à ce lot.
- **Priorité 7** : le Planificateur lance alors le processus et ses enfants sous la normale, avec des entrées-sorties basses. Ce n'est pas nouveau, c'était déjà le défaut de `schtasks /sc`. Mais `machine.json` (le banc) mesuré sous une tâche et sous un double-clic peut différer. Je ne l'ai pas mesuré.
- Les droits pour la tâche d'ouverture de session, une stratégie qui couperait wscript, `--etat` / `--config` non protégés : les doutes de l'auteur restent entiers. Je n'ai rien pu essayer sans poser une vraie tâche.
- L'observation de Fable sur `validations.jsonl` n'est pas recontrôlée ici. Elle n'est pas dans ce lot.
