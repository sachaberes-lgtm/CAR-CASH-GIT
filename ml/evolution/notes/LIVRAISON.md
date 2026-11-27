# La livraison de la sélection naturelle (27/11/2026, au soir)

Pour Sacha, ou pour l'assistant qui l'aidera sur le Ryzen. Ce qui est prêt, ce qui ne l'est pas, et les commandes à taper, dans l'ordre, avec ce qui doit
s'afficher.

## Ce qui est prêt

- **Le code de `ml/evolution/`**, avec les trois lots du soir intégrés (la mesure du PC, l'histoire, les gestes) : voir `INTERFACES.md` § 9.
- **Les tests**, relancés après l'intégration (voir plus bas « Ce qui a été vérifié »).
- **Le mode d'emploi** : `README.md`, avec « INSTALLER SUR UN NOUVEAU PC » et « METTRE À JOUR » en tête. Ces commandes ont été tapées pour de vrai dans un
  dépôt jetable (un clone, un worktree `evolution-ryzen`, une mise à jour par fusion, la mise à l'abri vers une origine locale).

## Ce qui n'est pas prêt (ou pas vérifié)

- **Rien n'est commité ni poussé.** Tant que ce code n'est pas commité sur `bots-ecurie` **et poussé sur GitHub**, le Ryzen ne peut pas le recevoir
  (`git fetch origin` ne verra que l'ancien). C'est l'étape 0 ci-dessous, à faire depuis le PC de développement.
- **Le vrai banc sur le Ryzen n'a jamais tourné** : sa durée (10 min à 1 h) et le nombre qu'il choisira sont des estimations.
- **Aucun envoi vers le vrai GitHub n'a été essayé** : seulement vers une origine locale, dans un dossier temporaire. Le premier envoi doit être fait d'un
  double-clic sur `sauver-traces.cmd` (connexion GitHub une fois) : la tâche de chaque heure ne pose jamais de question.
- **Les tâches planifiées n'ont jamais été posées** (installer-tache.cmd change des réglages de Windows : c'est à Sacha). Seul le texte d'avant la question a
  été lancé, dans un dépôt jetable.
- Une fenêtre noire s'ouvre quelques secondes chaque heure (les tâches planifiées).
- Le tableau ne montre pas encore `machine.json` (la ligne 3 de `etat.js` le montre).
- `tests/evoluer.test.js` (étapes bd, c, f, g) et `tests/courses.test.js` n'ont pas été relancés avec ce code (lents ; une autre évolution occupait le PC).
- On ne sait pas encore si les gestes sont bons : c'est la sélection qui le dira.
- Dans 2 à 3 mois, `morts.jsonl` approchera la limite de taille de GitHub : il faudra le découper.

## Les commandes, dans l'ordre

### 0. Sur le PC de développement (une fois) : livrer le code

Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (la branche `bots-ecurie`) :

```
git add ml/evolution ml/ecurie/etude/selection-naturelle/SPECIFICATION.md
git commit -m "BOTS-ML : ml/evolution, les finitions du 27/11 au soir (mesure du PC, arbre et recit, sauver-traces, cinq gestes) — le jeu ne change pas"
git push origin bots-ecurie
```

- Avant le commit, `git status --short ml/evolution` ne doit montrer **aucun** fichier de `ml/evolution/etat/` ni de `ml/evolution/essais/` (ils sont ignorés).
- Le push doit finir par `bots-ecurie -> bots-ecurie`. Ce n'est pas `main` : le site du jeu ne change pas.

### 1. Sur le Ryzen : installer (une fois)

Dans le dépôt déjà cloné (le dossier qui contient `VERSION PRINCIPALE`), une fenêtre de commande (barre d'adresse de l'Explorateur, `cmd`, Entrée) :

| Commande | Ce qui doit s'afficher |
|---|---|
| `node --version` | `v24.…` |
| `git fetch origin` | rien, ou quelques lignes `… -> origin/bots-ecurie` |
| `git worktree add -b evolution-ryzen ..\CASH-CAR-evolution origin/bots-ecurie` | `Preparing worktree (new branch 'evolution-ryzen')`, `branch 'evolution-ryzen' set up to track 'origin/bots-ecurie'.`, puis `HEAD is now at …`. (Si `already exists` : c'est déjà installé, aller en 2.) |
| `git config user.email` | une adresse. **Si rien ne s'affiche**, taper les deux lignes suivantes. |
| `git config user.name "Sacha (Ryzen)"` | rien |
| `git config user.email "sacha-ryzen@exemple.invalid"` | rien |

Puis dans l'Explorateur, le dossier `CASH-CAR-evolution\ml\evolution` (à côté du dépôt) :

| Geste | Ce qui doit s'afficher |
|---|---|
| double-clic sur `lancer.cmd` | « La selection naturelle des bots demarre. … Premier lancement sur ce PC : les premieres minutes (jusqu'a une heure) servent a mesurer … ». Laisser la fenêtre ouverte. |
| (après quelques minutes) `node ml\evolution\etat.js` dans une fenêtre de commande ouverte dans `CASH-CAR-evolution` | 10 lignes ; ligne 2 `EN MARCHE`. Pendant la mesure, ligne 3 finit par `banc a faire` ; après, par `N a la fois (banc du JJ/MM)`. |
| double-clic sur `installer-tache.cmd` | Le texte des 4 tâches ; au point 4, `adresse :  https://github.com/…` et `branche :  evolution-ryzen`, **sans** ligne `ATTENTION`. Taper O. Puis `Tache "CashCarEvolution" : posee.` (ou un refus : voir le texte, la relance horaire suffit), `Tache "CashCarEvolution-relance" : posee.`, `Tache "CashCarEvolution-traces" : posee.`, `Mise en veille sur secteur : coupee.` |
| double-clic sur `sauver-traces.cmd` | Peut-être une fenêtre GitHub de connexion (une fois). Puis `Traces : commit fait (…) ; envoye sur la branche evolution-ryzen` (ou `rien a sauver` / `rien de nouveau` si aucune génération n'est encore finie). |

Pour vérifier que la tâche des traces marche (le lendemain) : la fin de `CASH-CAR-evolution\ml\evolution\etat\traces.log` doit dire `envoye sur la branche
evolution-ryzen`, et sur GitHub la branche `evolution-ryzen` doit exister.

### 2. Sur le Ryzen : mettre à jour (chaque fois que Claude a changé le bot)

D'abord l'étape 0 (le nouveau code poussé sur `bots-ecurie`). Puis :

| Geste ou commande | Ce qui doit s'afficher |
|---|---|
| double-clic sur `CASH-CAR-evolution\ml\evolution\arreter.cmd` | `Arret demande.` puis, après quelques minutes, `C'est arrete.` |
| fenêtre de commande dans `CASH-CAR-evolution` : `git fetch origin` | rien, ou `… -> origin/bots-ecurie` |
| `git merge --no-edit origin/bots-ecurie` | `Merge made by the 'ort' strategy.` (ou `Already up to date.`). Si `CONFLICT` : `git merge --abort`, et demander à Claude. Si `Committer identity unknown` : les deux `git config` de l'étape 1, puis refaire le merge. |
| double-clic sur `lancer.cmd` | « La selection naturelle des bots demarre. » |

Si le bot a changé, `etat\sortie.log` dit une nouvelle époque (et ce qui a changé), puis le contrôle d'identité (`IDENTIQUE` sur 3 graines) : les notes
repartent de zéro, les pilotes restent. Avec le code de ce soir, la première mise à jour d'une sélection déjà commencée fait toujours une nouvelle époque
(le pilote fabriqué a changé : les gestes).

### 3. Pour regarder

| Quoi | Où |
|---|---|
| Les 10 lignes | `node ml\evolution\etat.js` (dans `CASH-CAR-evolution`), ou `etat\resume.txt` |
| Le tableau | double-clic sur `CASH-CAR-evolution\ml\evolution\etat\tableau.html` |
| L'arbre | `…\etat\arbre.html` (ou le lien en haut du tableau) |
| Le récit | `…\etat\histoire.md` (Bloc-notes) |

## Ce qui a été vérifié ce soir (sur le PC de développement, 2 courses à la fois au plus)

**Les tests rapides, relancés après toutes les retouches** (aucune course) : commun 16/16, graines 8/8, note 16/16, genome 14/14, tableau 69/69,
lanceurs 17/17, generation 12/12, robustesse 8/8, machine 45/45, machine-relecture 19/19, traces 87/87, relecture-traces 95/95, gestes 10/10,
integration 29/29 (nouveau). Avant mes corrections, traces échouait 1 contrôle (les mots des 21 gènes des gestes manquaient dans l'arbre) et
relecture-traces 1 (la ligne de bilan perdue dans traces.log après un envoi SSH raté).

**`node ml/evolution/tests/identite.test.js --travailleurs 2`** : OK, 6 passés, 0 raté (376 s) ; le témoin fabriqué rejoue pilote-voltige au bit près.

**Une évolution d'essai neuve de 3 générations** (`essais/integration/etat`, config d'essai, jamais plus de 2 courses à la fois) :
- Lancement 1 : `node ml/evolution/evoluer.js --config config-essai.json --etat essais/integration/etat --arret-apres 3` (sans `--travailleurs` : avec lui,
  il n'y a pas de banc ; la config d'essai borne de toute façon à 2). Le banc : 1 à la fois 103 courses/h, 2 à la fois 172,4 courses/h → **2 retenu**,
  écrit dans `machine.json`. Le contrôle d'identité : **IDENTIQUE** sur 910000, 910037, 910074. Génération 0 : 4 pilotes, 14 courses, coffre de l'époque.
  Génération 1 commencée (2 naissances : `b7e6fc67` immigré, `2e3c7287` mutation) ; **un fichier STOP posé après 4 courses** : arrêt propre après les
  courses en cours (6 faites), « generation 1 interrompue : elle sera reprise », STOP effacé, code 0 (685 s).
- Lancement 2 : même commande avec `--arret-apres 2`. **Pas de nouveau banc** (« mesure par le banc du 2026-11-27, etat/machine.json »). « generation 1 :
  reprise (naissances deja faites) » : les mêmes deux enfants, **6 courses rendues par le cache, 12 jouées, aucune course de la graine déjà jouée rejouée**.
  Génération 1 : 2 renvoyés. Génération 2 : 2 naissances, 2 renvoyés. Code 0 (577 s).
- Les journaux : 3 lignes dans generations.jsonl (aucune en double), 4 renvoyés dans morts.jsonl, 50 courses, 0 non mesurée, 0 panne.
- `histoire.md` raconte bien ces 3 générations (dix lignes « Où on en est », puis la génération 0 avec le contrôle d'identité, la 1 et la 2, chacune avec ses
  naissances, ses renvois et son meneur). `arbre.html` : 8 pilotes, 4 renvoyés, les bonnes générations de naissance et de renvoi, les bons parents ;
  regardée dans Chrome : la fiche de `2e3c7287` dit « relacheOn (geste : garder la nitro un instant après le décollage) : non → oui » — **un enfant a déjà
  allumé un geste**, et il a joué ses courses sans erreur. `tableau.html` : les 7 sections, le lien vers l'arbre et le récit, aucun `undefined` ni `NaN`.
  `resume.txt` : `2 a la fois (banc du 27/11)`.
- L'alerte « population trop semblable (distance 0.030) » est levée : c'est l'essai (4 pilotes presque pareils) ; avec 20 pilotes la distance sera plus grande.

**Les commandes d'installation et de mise à jour** : tapées dans cmd.exe dans un clone jetable (`git clone --no-hardlinks --branch bots-ecurie`), avec le
code de ce soir commité dans le clone et une « origin » nue locale : `git worktree add -b evolution-ryzen ..\CASH-CAR-evolution origin/bots-ecurie` (code 0),
`lancer.cmd --aide` dans le worktree (code 0), `sauver-traces.cmd auto` (commit et envoi vers l'origin locale), puis une mise à jour
`git fetch origin` + `git merge --no-edit origin/bots-ecurie` : sans identité git, **refusée** (« Committer identity unknown ») — d'où les deux `git config`
de l'étape 1 ; avec, « Merge made by the 'ort' strategy », sans éditeur. Le clone jetable a été effacé ensuite.
