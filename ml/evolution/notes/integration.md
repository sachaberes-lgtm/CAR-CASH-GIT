# Note « intégration » (27/11/2026, au soir) : les lots « machine », « traces », « gestes » assemblés

Rien n'est commité. Le jeu, `ml/bot/`, `ml/reel/`, `ml/labo/` et le témoin ne sont pas touchés. L'évolution de `CASH-CAR-evolution-essai` n'a été ni lue
ni touchée ; mes essais n'ont jamais joué plus de 2 courses à la fois, un seul à la fois.

## Ce que j'ai changé

| Fichier | Changement |
|---|---|
| `arbre.js` | `migre(g)` : un génome v:1 relu de morts.jsonl ou d'un vieux population.json passe par `Gn.migrer` (sur l'objet lu, jamais réécrit). Les 21 gènes des gestes ont leur mot dans `MOTS` (`traces.test.js` échouait sur « chaque gène a un mot simple »). |
| `tableau.js` | L'en-tête ne dit plus « Rien n'est publié : elle ne vit que sur ce PC » ; il dit que seul `sauver-traces.cmd` envoie la page, sur une branche à part, jamais sur main. |
| `sauver-traces.cmd` | `:dire` réessaie 5 fois (1 s d'écart) d'écrire la ligne de bilan dans traces.log : après un envoi SSH raté, elle s'y perdait (`relecture-traces.test.js` échouait 2 fois sur 2 chez moi ; reproduit à la main : la ligne arrivait dans sortie.log, pas dans traces.log). Le succès se lit par `&& set ECRIT=1` (un `echo` ne remet pas `errorlevel` à 0). |
| `installer-tache.cmd` | La troisième tâche `CashCarEvolution-traces` (`sauver-traces.cmd auto`, toutes les heures), retirée par `enlever`. Le texte d'avant le O / N : « Rien n'est envoyé sur Internet » est remplacé par ce qui part, l'adresse de `origin` (sans identifiant ni jeton : passée par `new URL`) et la branche ; un avertissement si le dossier n'est pas sur une branche `evolution-`. Le reste est gardé. CRLF, ASCII. |
| `config.json` | `alarmeDistance` 0,05 → 0,04 (0,05 × 86/107, le dénominateur des gestes) et une ligne dans `_notes`. Hors de toute époque (testé). |
| `tests/evoluer.test.js` | `--travailleurs N` (4 par défaut, comme avant), passé à ses deux sortes de lancement. |
| `tests/zz-relecteur-evoluer.tmp.test.js`, `essais/relecteur-machine-evoluer/` | Effacés (la copie temporaire du relecteur « machine », à effacer selon son rapport). |
| `.gitignore` | Le commentaire de fin (« Aucun commit automatique ») dit maintenant : sur la branche `evolution-<pc>`, à la main ou par sauver-traces.cmd, jamais sur main ni bots-ecurie. |
| `README.md` | Refait pour Sacha : « INSTALLER SUR UN NOUVEAU PC » et « METTRE À JOUR » en tête ; la mesure du PC ; l'arbre et le récit ; « Mettre l'histoire à l'abri » ; les gestes ; les lignes nouvelles de « Si ça s'arrête » et des fichiers. |
| `INTERFACES.md` | § 9 (les finitions du soir) ; § 1, 2.3, 2.8, 2.9, 2.9 bis, 2.10, 3.1, 3.2, 4.1, 5.1, 5.7, 7 mis à jour là où les formats sont décrits, avec un renvoi au § 9. |
| `ml/ecurie/etude/selection-naturelle/SPECIFICATION.md` | Une section 14 à la fin, « Ce qui a changé à la construction », qui renvoie à INTERFACES.md § 8 et § 9 et aux trois notes. Rien d'autre n'y est réécrit. |
| `tests/integration.test.js` (nouveau) | 29 contrôles, aucune course, ~15 s. |
| `notes/LIVRAISON.md` (nouveau) | L'état exact et les commandes du Ryzen. |

## Un écart à ma tâche

La tâche donnait la commande d'essai `… --travailleurs 2 --arret-apres 3` et attendait qu'elle « fasse son banc ». Les deux ne vont pas ensemble :
`--travailleurs N` l'emporte sur tout, pour ce lancement, **sans banc** (lot « machine »). J'ai donc lancé l'essai **sans** `--travailleurs` : la config
d'essai borne le banc à [1, 2] et le repli à 2, donc jamais plus de 2 courses à la fois, et le banc a bien eu lieu.

## Les commandes du README, vérifiées dans un dépôt jetable

Dans le dossier temporaire, jamais de worktree ajouté au vrai dépôt, jamais de push hors du dossier temporaire :
- `git clone --no-hardlinks --branch bots-ecurie C:\Users\sacha\code\CASH-CAR-bots-ecurie "CASH CAR"` (un chemin avec espace) ; puis, pour pouvoir simuler
  une mise à jour, une « origin » nue locale (`git clone --bare`) et un commit du code de l'intégration dans ce clone jetable.
- **Installer**, tapé dans cmd.exe : `git fetch origin && git worktree add -b evolution-ryzen ..\CASH-CAR-evolution origin/bots-ecurie` → code 0,
  « Preparing worktree (new branch 'evolution-ryzen') », « HEAD is now at … », dossier propre. `ml\evolution\lancer.cmd --aide` dans le worktree → l'usage,
  la ligne « Premier lancement sur ce PC », code 0.
- `sauver-traces.cmd auto` dans le worktree (avec l'état d'exemple recopié) : commit et envoi vers l'origin locale, branche `evolution-ryzen` créée.
- **Mettre à jour** : un commit poussé sur `bots-ecurie` de l'origin, puis dans le worktree `git fetch origin && git merge --no-edit origin/bots-ecurie`.
  **Sans identité git** (`GIT_CONFIG_GLOBAL` vide), la fusion échoue (« Committer identity unknown », code 128) : d'où l'étape 3 du README
  (`git config user.email` ; s'il n'affiche rien, `git config user.name …` et `git config user.email …`). Avec : « Merge made by the 'ort' strategy », code 0,
  sans éditeur. Puis `sauver-traces.cmd auto` : « rien de nouveau … ; envoyé sur la branche evolution-ryzen ».

## Ce qui reste

Voir INTERFACES.md § 9.5 et `notes/LIVRAISON.md` (« Ce qui n'est pas prêt »).


## Après l'intégration (27/11, Fable)

- **Le nom du PC ne part plus sur GitHub** (le dépôt est public) : `machine.json` porte une empreinte (`pc-xxxxxxxx`, `commun.empreintePc`) au lieu du nom Windows ; le message des commits de `sauver-traces.cmd` prend la fin du nom de la branche (`evolution-ryzen` donne `ryzen`). L'installateur dit que tout ce qui part est lisible par tous si le dépôt est public.
- **`alarmeDistance` 0,04 → 0,012** : la vraie population de 20 mesurée à la naissance vaut 0,028 sur 86 gènes (0,0225 sur 107) ; à 0,04 l'alerte « population trop semblable » était levée dès la génération 0.
