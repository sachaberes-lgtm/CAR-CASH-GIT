# Les traces : l'arbre, le récit, la mise à l'abri (27/11/2026, tâche « traces »)

Sacha, le 27/11 : « il faut qu'on garde des traces de tous les process, pour un portfolio ». Le plan d'origine (passation/BOTS-ML.md § 5.2) appelait
l'arbre généalogique « la pièce maîtresse ». Ce fichier dit ce qui a été fait, les formats, le texte à poser dans le README et dans installer-tache.cmd
(par l'intégrateur), et ce qui reste à faire. Rien n'a été commité, rien n'a été poussé.

## 1. Ce qui a changé

| Fichier | Ce qu'il fait |
|---|---|
| `arbre.js` (nouveau) | Écrit `<etat>/arbre.html` : l'arbre généalogique. Module `ecrire(cfg, o?)`, `page`, `modele` ; ligne de commande `node ml/evolution/arbre.js [--config f] [--etat dossier]`. |
| `histoire.js` (nouveau) | Écrit `<etat>/histoire.md` : le récit. Module `ecrire(cfg, o?)`, `texte`, `message`, `nomPc` ; ligne de commande `node ml/evolution/histoire.js [--config f] [--etat dossier] [--message \| --pc]`. |
| `sauver-traces.cmd` (nouveau, CRLF, ASCII) | La mise à l'abri : refait les pages, commit local des fichiers légers, envoi sur `evolution-<pc>`. |
| `tableau.js` | Deux retouches seulement : (1) à la fin de `ecrire()`, appelle `arbre.ecrire` puis `histoire.ecrire`, chacun dans un `try/catch` qui ne peut pas faire échouer le tableau ; (2) une ligne de liens dans l'en-tête (`arbre.html`, `histoire.md`). `ecrire` rend en plus `traces:{arbre, histoire, erreurs:[…]}` (chemins, ou `null` et le message). La page reste sans script (le test du tableau le vérifie). |
| `.gitignore` | Trois lignes après `etat/ARRETE` : `etat/traces.log`, `etat/PAS-D-ENVOI` (propres à un PC). Les lignes 18-19 (le commentaire « se committent… Aucun commit automatique ») ne sont pas de moi : un autre agent (« machine ») les a retouchées en même temps ; voir § 6. |
| `tests/traces.test.js` (nouveau) | 87 contrôles, ~25 s, aucune course, aucun réseau. |

Comme `evoluer.js` appelle déjà `tableau.ecrire(cfg)` à la fin de chaque génération (et à l'arrêt), **l'arbre et le récit sont refaits à chaque génération**
sans toucher à evoluer.js. Coût mesuré : 0,5 s pour l'arbre et 0,4 s pour le récit avec 5 054 pilotes et 840 générations (tableau compris : 1,2 s).

## 2. L'arbre (`<etat>/arbre.html`)

- Une page seule : HTML + SVG dessiné par un petit programme inclus dans la page, aucune ressource extérieure, aucune adresse Internet, s'ouvre en `file://`.
  Palette du tableau, clair et sombre (`prefers-color-scheme`, et `data-theme` comme le tableau). Lisible à 380 px (vérifié dans un cadre de 380 px :
  Chrome sans écran refuse une fenêtre de moins de 500 px) comme à 1 300 px.
- **La disposition** : un pilote = un point à la génération de sa naissance, puis un trait horizontal = sa vie, jusqu'à son renvoi (ou aujourd'hui).
  Les traits sont rangés sur des « voies » : une voie libérée par un mort est reprise par un nouveau-né, au plus près de la voie de son parent.
  Avec 20 vivants et 6 naissances par génération, il n'y a jamais plus de ~32 voies (mesuré : 32 sur l'exemple, 32 sur 5 054 pilotes) : **la hauteur reste
  fixe, seule la largeur grandit**. Les 60 dernières générations sont en détail (14 à 42 px par génération selon la largeur), les plus anciennes resserrées
  (4 px, 2 px au-delà de 300 générations), sur un fond plus clair, avec la mention « générations 0 à N resserrées » ; la vue s'ouvre sur la fin (à droite).
- Un fil courbe relie chaque pilote à son parent (deux fils pour un croisement, le second pointillé). Forme et couleur disent l'origine : losange gris = témoin,
  carré sarcelle = mutant de départ, rond bleu = mutation, anneau orange = croisement, triangle violet = immigré. Étoile verte = sacré champion (grande pour le
  champion en titre). Les noms « témoin » et « champion » au bout de leur vie. **La lignée du champion en titre** (tous ses ancêtres, par ses deux parents,
  jusqu'au témoin) : traits et fils vert épais. Les traits pointillés verticaux marquent une nouvelle époque ou une nouvelle phase.
- Les pilotes renvoyés sans enfant sont dessinés plus petits ; au-delà de 2 500 pilotes ils sont cachés par défaut (case « montrer aussi les pilotes renvoyés
  sans enfant »). Mesuré sur 5 054 pilotes : page 1,14 Mo (< 2 Mo), Chrome sans écran lance + charge + dessine en 1,7 s (2 192 points), 2,05 s avec tous les
  5 054 points (Chrome seul, page vide : 1,18 s).
- **La fiche** (un clic n'importe où sur la vie d'un pilote, ou Entrée/Espace sur un point des 60 dernières générations, ou les boutons « le champion en
  titre / le témoin / le meneur », ou la recherche par le début du nom, ou l'adresse `arbre.html#p=<id>`) : né à la génération N, de qui, par mutation /
  croisement / immigré / mutant de départ ; **ce qui a changé par rapport au parent, gène par gène, avec un mot simple** (« `braqueNitro` (virage au-dessus
  duquel pas de nitro) : 0,70 → **0,74** ») ; pour un croisement : les mutations, puis ce qui a été « pris chez » le second parent ; pour les réseaux :
  « tête rayon (le petit réseau qui juge les trajectoires en vol) : 12 poids changés sur 222 » ; ses notes (palier, écart aux joueurs, F ± se, courses ; à
  son renvoi ou à la dernière génération) ; renvoyé à la génération M (raison en clair) et durée de vie, ou « encore en vie » ; sacré à la génération G ;
  ses enfants (liens). Les parents et les enfants sont des boutons : on remonte l'arbre au clavier.
- La différence au parent est **recalculée à partir des génomes** (population.json pour les vivants, morts.jsonl pour les morts), pas lue dans `mutes` :
  elle vaut donc aussi pour les morts. Si un génome manque, la fiche donne les seules clés de `naissances[].mutes` et le dit.
- Les mots simples des gènes (`MOTS` dans arbre.js) : ni genome.js ni INTERFACES.md § 4 n'en ont. Je les ai tirés des commentaires de `REGLAGES` dans
  `ml/ecurie/pilote-voltige.js` (et du § 4.1 pour les 14 constantes) ; ils sont courts et peuvent être affinés. Le test vérifie que chacun des 86 gènes a un mot.

### Le format des données dans la page (pour qui voudrait le relire)
`<script type="application/json" id="donnees">` : `{g, detail, voies, genes:[86 clés], types:['r'|'e'|'d'|'c'], mots:[…], tetes, noeuds:[…], sacres:{indice:[générations]},
reperes:[[g,'époque'|'phase B']], chiffres:{generations, nes, morts, vivants, sacres}, champion, temoin, meneur}` (indices dans `noeuds`). Un nœud :
```
[id, ne, fin (-1 = vivant), origine (0 temoin, 1 g0, 2 mutation, 3 croisement, 4 immigre, 5 inconnue), parent1, parent2 (indices, -1), voie,
 drapeaux (1 temoin, 2 champion en titre, 4 sacre, 8 lignee, 16 meneur, 32 a des enfants), F, palier, E, courses, se_F, raison, difference, generationDeLaNote, parentsInconnus]
difference : [[indiceGene, avant, apres, deP2?], …, [-1 (WV) | -2 (WS), poidsChanges, poidsEnTout, deP2]]  ou  {c:[cles]} (genome absent)
```
Exemple réel (le champion de l'état d'exemple : immigré né à la génération 16, fils du témoin, voie 13, drapeaux 2+4+8+32) : `["deab1c9e9513",16,-1,4,0,-1,13,46,5.05,9.06,1,128,0.46,null,[[14,0.7,0.5315],[35,0.4,0.334]],30,[]]`.

## 3. Le récit (`<etat>/histoire.md`)

Réécrit en entier à chaque fois (dérivé des journaux, atomique). Du Markdown simple (titres, listes, gras, `code`), sans HTML : il se colle tel quel dans
le journal de bord. En tête : une phrase sur ce qu'est ce fichier, un paragraphe « les mots », puis **« Où on en est » en dix lignes** : générations et
durée, naissances / renvois / vivants, le champion en titre, le meneur, le témoin, les tentatives de sacre et la chance moyenne du meneur, la dernière
mesure du coffre, **« La sélection apprend-elle vraiment ? »** (compté sur les mesures du coffre avec un champion autre que le témoin : combien de fois il
est allé plus loin, combien de fois il a ressemblé davantage ; « trop peu pour conclure » sous 3 mesures), la diversité, la machine (courses jouées,
% non mesurées, arrêts de plus d'une heure). Puis une entrée par génération, de la plus ancienne à la plus récente, et la génération en cours.

Extrait réel (l'état d'exemple) :
```
### Génération 20 — 26/11/2026 à 23 h 43

6 naissances (1 immigré, 3 croisements, 2 mutations). 6 renvois : les notes F les plus basses. Le meneur est `deab1c9e` : palier 8,70, écart aux joueurs 0,97,
note F 4,8, 48 courses. 176 courses jouées en 31 min. Validation : le meneur `deab1c9e` rejoue contre le champion `3c093def` sur 24 courses neuves. Son avance
de note y est de +1,78 ± 0,43 (elle était de +2,45 à l'entraînement). **Il est sacré nouveau champion.** Coffre (après le sacre) : sur les 40 courses qui ne
servent jamais à l'entraînement, le champion `deab1c9e` va 0,57 palier plus loin que le témoin et ressemble davantage aux joueurs (écart −0,09).
```
Les événements d'evoluer.js sont traduits (nouvelle époque et ce qui a changé, contrôle d'identité, sacre, revalidation, phase, économie des graines, règle 6,
renvoi d'office, graine retirée, enfant abandonné, ATTENTION en gras) ; un événement inconnu est **recopié tel quel** (rien d'inventé). Un trou de plus d'une
heure entre la fin d'une génération et le début de la suivante est dit (« arrêt, veille ou coupure »), sans en inventer la cause.
Taille mesurée : 254 Ko pour 840 générations.

## 4. La mise à l'abri (`sauver-traces.cmd`)

Lancé d'un double-clic, ou par la tâche planifiée avec `auto` (rien à l'écran, aucune fenêtre de mot de passe : `GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`).
1. Refuse (code 2, dit dans sortie.log) sur `main`, sur `bots-ecurie`, et **sur toute branche dont le nom ne commence pas par `evolution`** (écart prudent à la
   tâche, qui ne nommait que main et bots-ecurie : un commit de journaux sur `maj` ou `ios-capacitor` serait aussi une erreur), et hors d'un dépôt git.
2. `node ml\evolution\tableau.js` (qui refait aussi arbre.html et histoire.md ; s'il échoue, arbre.js et histoire.js sont lancés seuls).
3. `git add --` des seuls fichiers légers qui existent : `etat/{population.json, generations.jsonl, validations.jsonl, morts.jsonl, coffre.jsonl, machine.json,
   arbre.html, histoire.md, tableau.html, resume.txt}` et `ml/evolution/champions`. Les courses, `pilotes/`, sortie.log, verrou.json, traces.log restent
   dehors (.gitignore ; le test le vérifie sur le commit).
4. S'il y a du nouveau dans ces fichiers-là (`git diff --cached --quiet`) : `git commit --only -m "BOTS-ML evolution <pc> : generation N, X nes, Y renvoyes,
   Z sacres, champion …" -- <ces fichiers>` (un fichier préparé par quelqu'un d'autre n'est pas emporté : testé). Puis `git -c gc.auto=500 gc --auto --quiet`
   (voir § 6).
5. Sauf si `etat\PAS-D-ENVOI` existe : `git push origin HEAD:refs/heads/<la branche courante>` (une branche `evolution-…`, vérifiée au point 1 ; **changé
   à la relecture**, voir § 8), **même sans nouveau commit** (un envoi raté la veille part ainsi à la fois suivante). Jamais `--force`, jamais vers main.
   Un échec n'est pas une erreur (code 0).
- (Depuis la relecture de Fable, le `<pc>` des commits est la fin du nom de la branche, pas le nom Windows.) `<pc>` de `histoire.js --pc` = `os.hostname()` en minuscules, caractères hors `[a-z0-9._-]` remplacés par `-` (`node ml\evolution\histoire.js --pc` ; la variable
  d'environnement `EVOLUTION_PC` le remplace si besoin).
- **Écart à la tâche : le journal.** La tâche voulait l'échec d'envoi dans `etat\sortie.log`. Mesuré : quand la sélection tourne, le `>>` de lancer.cmd tient
  sortie.log et Windows refuse un second écrivain (« Le processus ne peut pas accéder au fichier… »). Donc : le détail (sorties de git et de node) va dans
  `etat\traces.log` (ignoré par git) ; la ligne de bilan est écrite dans traces.log ET tentée dans sortie.log (elle y arrive quand la sélection ne tourne pas).
- Vercel ne publie que `main` (`vercel.json`, `git.deploymentEnabled`) : une branche `evolution-<pc>` poussée ne déclenche aucun déploiement.

## 5. Le texte à poser (par l'intégrateur)

### 5.1 Dans `installer-tache.cmd`
Après `set "RELANCE=CashCarEvolution-relance"` :
```bat
set "TRACES=%~dp0sauver-traces.cmd"
set "TACHE_TRACES=CashCarEvolution-traces"
set "PC=pc"
for /f "delims=" %%p in ('node "%~dp0histoire.js" --pc 2^>nul') do set "PC=%%p"
```
Dans l'explication, après le point 3, et en remplaçant la ligne `echo   Rien n'est envoye sur Internet. Rien n'est paye. Pour tout retirer :  installer-tache.cmd enlever` :
```bat
echo   4. Une tache planifiee "%TACHE_TRACES%" : toutes les heures, elle lance :  "%TRACES%" auto
echo      Elle refait l'arbre des pilotes, le recit et le tableau, les range dans un commit git sur la branche evolution-%PC%,
echo      puis les ENVOIE SUR INTERNET, vers ton depot GitHub, sur cette branche a part. Jamais sur main : le site du jeu ne change pas.
echo      Pour garder les commits sur ce PC sans rien envoyer : cree un fichier vide nomme PAS-D-ENVOI dans ml\evolution\etat\
echo.
echo   La selection elle-meme n'envoie rien sur Internet ; seule la tache 4 envoie ses traces vers GitHub. Rien n'est paye.
echo   Pour tout retirer :  installer-tache.cmd enlever
```
Après la création de la tâche de relance :
```bat
schtasks /create /tn "%TACHE_TRACES%" /sc hourly /mo 1 /tr "\"%TRACES%\" auto" /it /f
if errorlevel 1 (echo   La tache "%TACHE_TRACES%" n'a pas pu etre creee : voir le message ci-dessus.) else (echo   Tache "%TACHE_TRACES%" : posee.)
```
Dans `:enlever` : ajouter `"%TACHE_TRACES%"` à la phrase « Ce fichier va retirer les taches planifiees … » et la ligne
```bat
schtasks /delete /tn "%TACHE_TRACES%" /f
```
**La phrase à montrer à Sacha avant qu'il tape O ou N** (elle est dans le point 4 ci-dessus) : « Toutes les heures, une tâche range l'arbre, le récit et le
tableau dans git et les ENVOIE SUR INTERNET, vers ton dépôt GitHub, sur une branche à part (evolution-<nom du PC>), jamais sur main. Pour ne rien envoyer :
un fichier vide PAS-D-ENVOI dans ml\evolution\etat\. »
Une tâche à part (et non un appel dans `lancer.cmd auto`) : quand la sélection est arrêtée, `lancer.cmd auto` la relance et ne rend la main qu'à son arrêt.

### 5.2 Dans le README (pour Sacha, à mettre après « Savoir où ça en est »)
```markdown
## Garder les traces (pour le portfolio)

La sélection écrit elle-même son histoire, à la fin de chaque génération, dans `etat/` :

- **`etat/arbre.html`** : l'arbre généalogique des pilotes. Double-clic, il s'ouvre dans le navigateur, sans Internet.
  Chaque point est un pilote, son trait est sa vie. Touche un point : sa fiche dit de qui il est né et ce qui a changé chez lui.
  Le trait vert épais remonte la lignée du champion jusqu'au pilote de départ.
- **`etat/histoire.md`** : le récit, génération par génération, en phrases simples. En tête, dix lignes disent où on en est.
  On peut le copier tel quel dans le journal de bord.

### Les mettre à l'abri : `sauver-traces.cmd`

**Double-clic sur `sauver-traces.cmd`.** Il refait l'arbre, le récit et le tableau, les range dans git, puis les **envoie sur GitHub**,
sur une branche à part qui porte le nom du PC (`evolution-…`). Jamais sur `main` : le jeu et le site ne changent pas.
Une ligne dit ce qu'il a fait. La première fois, une fenêtre GitHub peut demander de te connecter : fais-le une fois.

- Il ne tourne que dans le dossier de la sélection (sa branche `evolution-…`). Ailleurs, il refuse et le dit.
- Pas d'Internet ? Ce n'est pas grave : tout est gardé sur le PC, l'envoi se refera la fois suivante.
- Pour ne rien envoyer du tout : crée un fichier vide nommé `PAS-D-ENVOI` (sans extension) dans `etat/`.
- `installer-tache.cmd` peut le lancer tout seul toutes les heures (il te le demande).
- Le détail est dans `etat/traces.log`.
```
Et dans le tableau des fichiers du README : `sauver-traces.cmd` (« Met l'arbre, le récit et le tableau à l'abri dans git et sur GitHub (double-clic). »),
`etat/arbre.html` (« L'arbre généalogique des pilotes. »), `etat/histoire.md` (« Le récit, génération par génération. »), `arbre.js` / `histoire.js`
(« Refont l'arbre et le récit (le tableau les appelle). »).

### 5.3 Dans INTERFACES.md
- § 1 (qui écrit quel fichier) : `arbre.html`, `histoire.md` — écrivains `arbre.js`, `histoire.js`, appelés par `tableau.ecrire` (donc par evoluer.js en fin de
  génération) ou en ligne de commande ; contenu dérivé, atomique. `traces.log` — `sauver-traces.cmd` (redirection). `PAS-D-ENVOI` — Sacha.
- § 2.8 : `ecrire(cfg, o?)` rend aussi `traces:{arbre, histoire, erreurs}` ; un échec des traces ne fait jamais échouer le tableau.
- Une section « 2.12 arbre.js, histoire.js, sauver-traces.cmd » qui reprend les §§ 2 à 4 de cette note (API, lignes de commande, format des données de la page).

## 6. Ce qui reste à faire, et ce que je n'ai pas pu vérifier

- **Le tableau ment désormais à un endroit** : son en-tête dit « Rien n'est publié : elle ne vit que sur ce PC. » Avec sauver-traces.cmd, tableau.html part
  sur GitHub (dépôt privé ou public : je ne sais pas). Ma tâche ne me laissait toucher à tableau.js que pour l'appel et le lien : à corriger par l'intégrateur
  (par exemple « Rien n'est publié par la sélection ; sauver-traces.cmd l'envoie sur une branche à part de GitHub. »). Même chose pour le commentaire de la
  fin de `.gitignore` (« Aucun commit automatique »), retouché par l'agent « machine » pendant mon travail.
- **Pas testé pour de vrai** : un envoi vers GitHub (testé seulement vers une « origin » locale nue, dans un dépôt jetable du dossier temporaire) ; la tâche
  planifiée ; un worktree sur le Ryzen ; les identifiants : en mode `auto`, le gestionnaire d'identifiants ne demande rien, donc **le premier envoi doit être
  fait d'un double-clic** (connexion GitHub une fois), sinon chaque heure dira « envoi raté ». Un crochet `pre-push` ou `pre-commit` posé sur le Ryzen
  (aucun ici) pourrait refuser : l'échec serait écrit dans traces.log.
- **La taille dans git** : `morts.jsonl` garde le génome de chaque renvoyé (~4,6 Ko) : ~6 morts par génération, soit ~1 Mo par jour au rythme prévu.
  GitHub avertit à 50 Mo par fichier et refuse à 100 Mo : vers 2 à 3 mois de marche, il faudra découper morts.jsonl (par époque ou par mois) — c'est
  evoluer.js qui l'écrit, hors de ma tâche. Un commit par heure d'un journal qui grossit laisse des copies entières tant que git ne range pas : d'où
  `git -c gc.auto=500 gc --auto --quiet` après chaque commit (range quand il y a plus de ~500 objets en vrac, soit à peu près une fois par jour ;
  le rangement d'un gros dépôt peut prendre quelques minutes, à priorité normale). Non mesuré sur le vrai dépôt.
- Un commit peut emporter une dernière ligne à moitié écrite d'un journal si evoluer.js écrit pile à ce moment-là ; le commit suivant la complète
  (les lecteurs ignorent une dernière ligne coupée). Pas de verrou entre les deux : voulu (sauver-traces ne doit jamais bloquer la sélection).
- Les `mots` des gènes sont les miens (d'après les commentaires de pilote-voltige.js) : à relire par qui connaît le pilote.
- Le grand état des tests est fabriqué (les génomes sont vrais, les notes inventées) : la forme de l'arbre d'une vraie sélection sera différente.
  Une vraie évolution tourne dans `CASH-CAR-evolution-essai` : je ne l'ai pas lue ; l'arbre de son état n'a donc pas été regardé.
- `tests/commun.test.js` échoue sur 1 contrôle (« lireConfig fusionne ») pendant mon travail : il vient des retouches de config.json / commun.js de l'agent
  « machine », pas de ma tâche (je ne touche ni l'un ni l'autre). Les autres tests rapides passent (graines, note, genome, tableau 69/69, generation 12/12,
  robustesse 8/8, lanceurs 17/17). Les tests lents (courses, identité, evoluer) n'ont pas été relancés : ils ne passent par mon code que via
  `tableau.ecrire`, dont l'appel aux traces est enfermé dans un try/catch.

## 7. Les tests (`node ml/evolution/tests/traces.test.js`, 87 contrôles)

1. L'état d'exemple : arbre.html (page seule, un nœud par pilote, le témoin en voie 0, le champion marqué, voies sans chevauchement, lignée jusqu'au témoin,
   fins de vie = générations de renvoi, raisons et notes finales des morts, la différence au parent recalculée pour 109 mutants, la fiche de chacun des 206
   pilotes sans `undefined`/`NaN`, champion, témoin, croisement, renvoyé, recherche, mot simple pour chacun des 86 gènes) ; histoire.md (dix lignes, une entrée
   par génération dans l'ordre, génération en cours, sacre, époque et identité, économie, phase, chaque meneur cité = celui du journal, pas de HTML) ;
   le message du commit (ASCII) ; le nom du PC.
2. `tableau.ecrire` refait les deux et garde son lien ; un `arbre.ecrire` qui lève ne l'empêche pas (le récit est quand même écrit) ; état vide ; état tronqué.
3. Grand état fabriqué avec les vrais opérateurs du génome (840 générations, 5 054 pilotes) : 1,14 Mo, 0,5 s ; récit 0,4 s ; Chrome sans écran charge,
   dessine et ouvre la fiche demandée par `#p=`.
4. sauver-traces.cmd dans un dépôt jetable (chemin avec espace) : refus sur main / bots-ecurie / autre branche (code 2, rien à l'écran en `auto`) ; commit et
   envoi sur `evolution-<pc>` ; message ; fichiers emportés et laissés dehors ; fichier préparé par un autre non emporté ; LF gardé ; rien de nouveau = pas de
   commit ; PAS-D-ENVOI ; envoi raté = code 0 et journal ; double-clic = une ligne et l'envoi en retard part ; sortie.log tenu par un cmd.exe = bilan dans traces.log.
Regardé à l'œil (PNG de Chrome sans écran, 1 300 px et 380 px, clair et sombre, exemple et grand état) : rien ne se chevauche ; à 380 px la page tient en
largeur, l'arbre défile horizontalement.
Pour fabriquer seulement le grand état : `node ml/evolution/tests/traces.test.js --fabriquer ml/evolution/essais/traces/grand 840`.

## 8. La relecture (27/11/2026, le relecteur du lot « traces »)

Rien n'a été commité ni poussé ; aucun `git push` n'a été lancé depuis le vrai dépôt (seulement dans des dépôts jetables du dossier temporaire, vers une
« origin » locale nue). La vraie évolution de `CASH-CAR-evolution-essai` n'a été ni lue ni touchée.

### 8.1 L'exactitude : un état écrit à la main, dont on connaît la vérité
`tests/relecture-traces.test.js` (95 contrôles, ~40 s, aucune course) écrit dans `essais/relecture-traces/complet/` six générations à la main
(15 pilotes, μ = 4, λ = 2) : qui naît de qui, quel gène change de combien (`braqueNitro 0,70 → 0,74`, `marge` pris chez le second parent d'un croisement,
5 poids de la tête sol, 12 poids de la tête rayon), qui est renvoyé quand et pourquoi, un sacre (génération 3), une revalidation gardée (nouvelle époque,
génération 4) puis perdue (nouvelle époque, génération 5), un immigré **sans parent**, une génération en cours (6), la génération 2 **refaite** (deux fois
dans generations.jsonl, un mort deux fois dans morts.jsonl), une dernière ligne **tronquée** dans generations.jsonl et dans morts.jsonl. L'arbre et le
récit sont relus contre cette vérité, pilote par pilote (naissance, parents, origine, renvoi, chaque gène changé et AUCUN autre), plus la lignée du
champion dans le même état arrêté à la génération 3 (D ← A ← témoin).
**Juste dès le départ** : les 15 nœuds (aucun en double), les parents, les origines, les fins de vie, toutes les différences gène par gène (y compris
« pris chez » le second parent et les poids des têtes), la lignée, le sacre, le champion détrôné (le témoin redevient champion en titre, D reste
« ancien champion »), les lignes tronquées ignorées.

### 8.2 Les défauts trouvés et corrigés (chacun a son contrôle dans relecture-traces.test.js)
| Gravité | Défaut | Correction |
|---|---|---|
| important | Une génération refaite (deux lignes dans generations.jsonl) était **racontée deux fois** dans histoire.md, et l'en-tête de l'arbre et du récit comptait une génération de trop. | `arbre.modele` ne garde qu'une ligne par génération (la dernière écrite) ; le récit passe par le modèle. |
| important | « La sélection apprend-elle vraiment ? » comptait les mesures du coffre (« plus loin que le témoin 2 fois ») : un même champion remesuré sur les **mêmes 40 courses** comptait plusieurs fois, et +0,3 palier passait pour une victoire. Rien ne disait le bruit. | Une mesure par champion (sa dernière) ; la phrase ne conclut qu'**au-delà du bruit** : 1,5 palier sur 40 courses (bruit de la différence de palier moyen entre deux pilotes : 1,37 sur 12 graines communes, `ml/ecurie/etude/selection-naturelle/bruit/resultats.txt` § 1, ramené à 40 graines : 0,75 ; deux fois cela). Chaque mesure du coffre dans le récit dit « dans le bruit » ou « au-delà du bruit ». coffre.jsonl ne porte pas d'incertitude : c'est une estimation de l'étude, dite comme telle dans le code. |
| important | Après un sacre perdu, le récit disait « aucun pilote n'a encore prouvé … qu'il faisait mieux (ou le dernier sacré a perdu son titre) » : faux. | « Le champion est de nouveau le témoin : le dernier sacré, `63c72aa2` (génération 3), a perdu son titre à la génération 5 (à la revalidation d'une nouvelle époque). » |
| important | sauver-traces.cmd : les pages portent l'heure, donc **une sélection arrêtée faisait un commit par heure** (1,2 Mo d'arbre à chaque fois) ; le contrôle « rien de nouveau » de traces.test.js ne passait que si ses deux lancements tombaient dans la même minute (il a échoué une fois chez moi). | Le nouveau se juge sur les **journaux** (population, generations, validations, morts, coffre, machine.json, champions) ; les pages suivent. Une page jamais sauvée compte comme du nouveau. Rien ne reste préparé dans l'index. |
| important | sauver-traces.cmd pendant une **fusion / cherry-pick / revert pas finis** : son `git add` marquait un journal en conflit comme réglé (marqueurs de conflit compris). | Refus (code 2) si MERGE_HEAD, CHERRY_PICK_HEAD, REVERT_HEAD ou un fichier en conflit (`git ls-files -u`). Un rebase était déjà refusé (HEAD détachée). |
| important | Le commit échouait chaque heure sur un PC où git ne connaît pas encore `user.name` / `user.email`. | Identité de repli pour ce seul commit : « selection CASH CAR (<pc>) », `selection@<pc>.invalid`. |
| mineur | La branche n'était contrôlée que sur « evolution » (9 lettres) : `evolution`, `evolutionmain` passaient. | Le nom doit commencer par `evolution-`. |
| mineur | L'envoi allait vers `evolution-<nom du PC>` quelle que soit la branche courante : un worktree sur `evolution-ryzen` d'un PC nommé `DESKTOP-XYZ` aurait créé une seconde branche distante (et un PC renommé, une troisième). | `git push origin HEAD:refs/heads/<branche courante>` ; la branche est vérifiée (`evolution-…`, jamais main ni bots-ecurie). Le nom `evolution-<pc>` reste la convention pour créer le worktree. |
| mineur | En `auto`, une origine SSH pouvait poser une question (phrase de passe, empreinte d'hôte) et bloquer la tâche ; un envoi qui traîne n'était jamais coupé. | `GIT_SSH_COMMAND=ssh -o BatchMode=yes -o ConnectTimeout=30` (si l'utilisateur n'en a pas déjà un) ; `http.lowSpeedLimit=1`, `http.lowSpeedTime=120`. Contrôle faible : seule une origine SSH injoignable a été essayée (port fermé), pas une vraie question. |
| mineur | `champions\` vide (ou de seuls `.tmp`) faisait échouer le commit (« pathspec did not match »). | `champions` n'est ajouté que s'il porte un `.js` ou un `.json`. |
| mineur | `etat\traces.log` grossissait sans fin (une entrée par heure). | Au-delà de ~1 Mo, il devient `traces.log.ancien` ; `.gitignore` : `etat/traces.log*`. |
| mineur | La fiche d'un immigré sans parent disait « une copie très changée de un parent inconnu » et « Ce qui a changé par rapport à son parent, un parent inconnu ». | « une copie très changée du champion d'alors (son nom n'est pas dans les journaux) » ; « Pas de parent connu : on ne peut pas dire ce qui a changé. » |
| mineur | Une nouvelle époque et une nouvelle phase à la même génération : deux textes l'un sur l'autre au-dessus de l'arbre ; deux repères proches se chevauchaient à 380 px. | Un seul repère « époque · phase B » ; un repère trop proche du précédent garde son trait, pas son texte. |
| mineur | Un arbre de quelques générations n'occupait qu'un quart de la largeur (42 px par génération au plus). | Jusqu'à 110 px par génération. |
| mineur | Le récit disait « il faut 48 courses pour être candidat » quelle que soit la config (l'essai : 3). | `cfg.validation.nMin`. |
| mineur | Le récit employait « meneur », « immigré », « époque », « revalidation » sans les expliquer. | Le paragraphe « Les mots » les explique en une phrase chacun. |

### 8.3 Le rendu (Chrome sans écran, 1 300 px et 380 px dans un cadre, clair et sombre)
États : l'état écrit à la main (15 pilotes), 38, 296 et 5 054 pilotes (fabriqués par `traces.test.js --fabriquer`). Poids et temps : 35 Ko (38 pilotes),
90 Ko (296), 1,20 Mo (5 054) ; écriture arbre + récit : 0,37 s, 0,40 s, 1,15 s ; Chrome lance + charge + dessine : 1,2 s, 1,3 s, 1,5 à 1,6 s (Chrome
seul ~1,2 s). Lisible, rien ne se chevauche après les corrections ; la fiche demandée par `#p=` s'ouvre. Ce qu'un jury comprendra moins bien sans
explication : à 5 000 pilotes, la lignée du champion traverse la zone resserrée (on ne la suit plus à l'œil au-delà des 60 dernières générations) ; les
longues vies (champion et témoin protégés) font des traits qui barrent toute la largeur. Le paragraphe « Comment le lire » reste nécessaire.

### 8.4 Ce qui reste (non fait, non vérifié)
- **La tâche planifiée avec `/it` ouvrira une fenêtre noire chaque heure** sur l'écran de Sacha (comme la relance de lancer.cmd déjà posée). Pour l'éviter,
  il faudrait un petit lanceur caché (`wscript` + `.vbs`, ou `conhost --headless`) : à décider par l'intégrateur.
- L'en-tête du tableau dit toujours « Rien n'est publié » (§ 6) : à corriger par l'intégrateur.
- Aucun envoi réel vers GitHub ; aucune vraie question SSH ; aucun crochet git (pre-commit, pre-push) essayé. Un crochet `pre-push` qui refuse
  (il en existe un sur l'ordi de Léo, pour main seulement) serait noté « envoi raté » chaque heure.
- `morts.jsonl` vers 100 Mo (GitHub refuse) dans 2 à 3 mois (§ 6) : inchangé.
- Un commit peut emporter une dernière ligne à moitié écrite d'un journal (§ 6) : inchangé, voulu (aucun verrou entre la sélection et la sauvegarde).
- Le seuil de bruit du coffre (1,5 palier) est une estimation tirée de l'étude du bruit ; quand le coffre aura sa propre incertitude (écart-type des 40
  différences de course), c'est elle qu'il faudra lire (evoluer.js, hors de ce lot).
- Les tests lents (courses, identité, evoluer) n'ont pas été relancés : mes retouches ne touchent que arbre.js, histoire.js, sauver-traces.cmd, .gitignore
  et ce fichier ; tableau.js n'a pas été retouché par la relecture.
- Dans le README (§ 5.2), remplacer « sur une branche à part qui porte le nom du PC (`evolution-…`) » par « sur la branche de la sélection
  (`evolution-…`) » ; et ajouter : « S'il ne s'est rien passé depuis la dernière fois (sélection arrêtée), il ne fait pas de commit. »
