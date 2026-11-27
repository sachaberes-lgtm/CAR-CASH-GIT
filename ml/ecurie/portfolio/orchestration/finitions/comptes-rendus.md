# Les finitions de ml/evolution avant la livraison au Ryzen : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `evolution-v1-finitions` (wf_207898d7-fdd), lancée par la session principale (Claude Fable).
- Agents : 7, tous du modèle claude-opus-5-5.
- Durée : 3 h 18 ; jetons consommés par les agents : 1 993 694 (1,99 millions) ; appels d'outils : 568.
- Message de fin du script : « machine : 7 defaut(s) releve(s) ; traces : 17 ».
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. constructeur du lot « machine » : un réglage par PC, le banc qui mesure combien de courses la machine tient à la fois (phase « Machine et traces »)
2. constructeur du lot « traces » : l'arbre généalogique, le récit, la mise à l'abri des journaux dans git (phase « Machine et traces »)
3. relecteur du lot « traces » : essaie de casser le travail d'un autre agent, puis corrige lui-même ce qu'il trouve (phase « Relecture 1 »)
4. relecteur du lot « machine » : essaie de casser le travail d'un autre agent, puis corrige lui-même ce qu'il trouve (phase « Relecture 1 »)
5. constructeur du lot « gestes » : les cinq gestes des enquêtes deviennent des gènes éteints à la naissance (phase « Gestes »)
6. relecteur du lot « gestes » : essaie de casser le travail d'un autre agent, puis corrige lui-même ce qu'il trouve (phase « Relecture 2 »)
7. intégrateur : fusionne les notes des trois lots, lance tous les tests et une évolution d'essai (phase « Integration »)

## 1. machine

*Rôle : constructeur du lot « machine » : un réglage par PC, le banc qui mesure combien de courses la machine tient à la fois. Phase : Machine et traces.*

### Résumé

Le même dépôt marche maintenant sur n'importe quel PC sans retouche, et un mot de travers ne lance plus rien. Un vrai premier lancement d'essai a fait son banc puis sa génération 0 (code 0). Un seul test existant échoue désormais : le contrôle « lireConfig fusionne » de tests/commun.test.js (voir les problèmes). Aucun commit.

1. **Options** : toute la ligne de commande d'evoluer.js est contrôlée avant la config, le verrou et toute course.
   - --aide, --help et -h affichent l'usage et sortent en code 0.
   - Une option inconnue, un mot en trop, une valeur manquante ou absurde (abc, 0, 2.5), une option donnée deux fois, des options incompatibles ou un --config introuvable affichent l'erreur et l'usage, puis sortent en code 2.
   - « --option=valeur » est accepté.
2. **Console (EPIPE)** : stdout et stderr ont un écouteur d'erreur, et chaque écriture est protégée. Si la console meurt, le maître continue et la suite de son journal va à la fin de <etat>/sortie.log. Sans la correction, le crash EPIPE se reproduit ; avec elle, le test passe.
3. **Un réglage par machine** :
   - config.json et config-essai.json ont "travailleurs": "auto". lireConfig contrôle la valeur et la résout toujours en un entier, donc courses.js, identite.js et inscrire-champion.js reçoivent un nombre.
   - Le réglage vit dans <etat>/machine.json, de format evolution-machine-1, écrit de façon atomique. Il est ignoré s'il vient d'un autre PC (autre nom ou autre nombre de cœurs), s'il est illisible ou si son nombre est absurde.
   - Au premier lancement sur un PC, evoluer.js fait lui-même le banc avant la génération 0 et le dit dans le journal (pourquoi, la liste essayée, une durée estimée).
   - La liste « auto » vaut {ceil(L/2), L-4, L-2, L-1}, sans doublon, chacun entre 1 et L. Le banc joue des vagues pleines. Un nombre est écarté s'il a eu une panne, une course non mesurée ou relancée ; à moins de 5 % du meilleur débit, on garde le plus petit nombre.
   - Si le banc échoue ou est interrompu (STOP, PAUSE, Ctrl+C), on passe au repli max(1, L-2), borné par une liste de banc écrite à la main, et le banc est retenté au lancement suivant. Écart voulu : un banc fini sans nombre valable n'est retenté que 3 fois, pour ne pas coûter jusqu'à une heure à chaque relance. Un bon machine.json n'est jamais écrasé par un banc raté.
   - --travailleurs N l'emporte pour un lancement sans rien écrire. --banc réécrit machine.json, plus jamais config.json.
   - Vérifié dans courses.js : le nombre de travailleurs n'entre ni dans l'époque ni dans la clé du cache, et chaque course est un processus neuf. Un PC trop chargé donne des pannes, donc une course non mesurée et rejouée, jamais un autre résultat.
4. **lancer.cmd** : seul le premier mot peut être « auto » (avant, « --etat auto » perdait son auto). Un argument vide "" est sauté au lieu d'arrêter la liste. Sans etat\machine.json, la fenêtre dit en une ligne que les premières minutes servent à mesurer le PC. Le message du code 2 cite aussi une option mal écrite.
5. **refusDePartir** : essayé pour de vrai, il répond en 0,43 s. Avec un faux …/ml/ecurie/boucle.js (un node qui dort), il refuse en 0,44 s avec son pid. PowerShell a maintenant 5 s au plus (avant : 60 s). S'il est lent, absent ou illisible, on part quand même et une ligne le dit.

etat.js montre en ligne 3 « ; N a la fois (banc du jj/mm) ». Dans .gitignore, un seul commentaire change : machine.json est cité parmi ce qui se committe (il n'était déjà pas ignoré).

Essai réel (« --config config-essai.json --etat essais/machine/etat --arret-apres 1 », sans --travailleurs), 10 min 42 s en tout :
- le banc a duré 3 min 39 s : 103,6 courses/h à 1 à la fois, 180,9 à 2, aucune panne ; 2 est retenu et écrit dans machine.json ;
- le contrôle d'identité est IDENTIQUE sur les 3 graines ;
- la génération 0 a joué 14 courses, 2 à la fois au plus, sans course non mesurée, puis le coffre ; fin en code 0 ;
- un second lancement (STOP posé d'avance) n'a pas refait le banc : « 2 courses a la fois (mesure par le banc du 2026-11-27) ».

Pour l'intégrateur, notes/machine.md contient le texte du README pour Sacha et la liste de ce qu'il faut reporter dans INTERFACES.md.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js  
  Role : Console protégée (EPIPE), lireOptions/USAGE (code 0/2 avant tout verrou), banc vers machine.json et banc automatique au premier lancement, planBanc, refusDePartir/processusNode (5 s, on part en cas de doute et on l'écrit), principal réécrit
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\commun.js  
  Role : lireConfig contrôle travailleurs/banc et résout "auto" en entier ; le réglage par machine : coeursLogiques, listeBancAuto, listeBanc, repliTravailleurs, choisirTravailleurs, controlerTravailleurs, lire/ecrireMachine, bancAFaire, resoudreTravailleurs
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json  
  Role : travailleurs "auto", banc.travailleurs "auto", note _notes[1] réécrite
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config-essai.json  
  Role : travailleurs "auto", banc [1, 2] (4 courses de 45 s) : un essai ne dépasse jamais 2 courses à la fois
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\lancer.cmd  
  Role : Seul le premier mot peut être auto, arguments vides sautés, ligne « premier lancement sur ce PC », message du code 2 (CRLF, ASCII)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\etat.js  
  Role : Ligne 3 : nombre de courses à la fois et d'où il vient (machineCourte)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore  
  Role : Un commentaire : machine.json se committe
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\machine.test.js  
  Role : Nouveau test : 45 contrôles, aucune course, ~10 s
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\machine.md  
  Role : Note pour l'intégrateur : changements, formats (machine.json réel), texte du README pour Sacha, ce qu'il faut reporter dans INTERFACES.md, l'essai réel, ce qui reste
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\machine\etat\machine.json  
  Role : Le machine.json écrit par le vrai premier lancement d'essai (ignoré par git)

### Tests

- Nom : tests/machine.test.js  
  Passe : true  
  Détail : 45/45 en ~7 s : options (24 lignes de travers, aide), vraie ligne de commande (code 0/2, < 5 s, rien de lancé), EPIPE sur un vrai maître (code 0, journal dans sortie.log), liste auto L=1..32, repli, choix du banc, machine.json (écrit, relu, autre PC, tronqué, absurde), ordre de résolution, configs de travers, banc interrompu, refusDePartir réel et avec un faux boucle.js, PowerShell lent, absent ou illisible
- Nom : essai réel : --config config-essai.json --etat essais/machine/etat --arret-apres 1  
  Passe : true  
  Détail : Banc de 3 min 39 s (1 à la fois : 103,6 courses/h ; 2 à la fois : 180,9 courses/h ; 2 retenu), identité IDENTIQUE sur 3 graines, génération 0 : 14 courses à 2 à la fois au plus, 0 non mesurée, coffre, code 0. Le second lancement réutilise machine.json sans nouveau banc.
- Nom : tests/commun.test.js  
  Passe : false  
  Détail : 15/16 : « lireConfig fusionne » attend banc.travailleurs [2,3] pour config-essai, qui vaut maintenant [1,2] (changé exprès pour ne jamais dépasser 2 courses à la fois). Une ligne à corriger dans un fichier qui n'est pas le mien (ligne 40).
- Nom : graines, note, genome, tableau, generation, robustesse, lanceurs  
  Passe : true  
  Détail : 8/8, 16/16, 14/14, 69/69, 12/12, 8/8, 17/17
- Nom : courses, identite, evoluer (tests lents)  
  Passe : false  
  Détail : Non relancés : ils passent un nombre de travailleurs explicite, donc le banc n'y joue pas. Mais evoluer.test.js lance principal(), qui a été réécrit : ce n'est pas vérifié.

### Problèmes

- tests/commun.test.js ligne 40 doit passer de '[2,3]' à '[1,2]' (le banc de config-essai.json) : ce n'est pas mon fichier, je ne l'ai pas changé.
- evoluer.test.js (lent) n'a pas été relancé, alors que principal() a été réécrit.
- Le vrai banc sur le Ryzen n'a pas été joué (la vraie config est interdite ici). La durée de 11 à 46 min pour 16 cœurs est une estimation tirée de la vitesse mesurée sur les essais (0,25 à 1 s réelle par seconde de jeu).
- INTERFACES.md et README.md ne sont pas mis à jour (c'est le rôle de l'intégrateur) : le texte est prêt dans notes/machine.md.
- estMaitre (la reprise d'un verrou dont le pid vit encore) refuse toujours de partir si PowerShell ne répond pas en 15 s : c'est voulu, pour ne pas voler le verrou d'un maître vivant.
- Les nouveaux cas de lancer.cmd (--etat auto, argument vide) n'ont pas de contrôle dans lanceurs.test.js, qui n'est pas à moi. La ligne « Premier lancement sur ce PC » n'a pas été vue dans une vraie fenêtre.
- Le tableau (section 7, La machine) ne montre pas encore machine.json.
- Écart à la consigne : un banc fini sans aucun nombre valable n'est retenté que 3 fois. Ensuite il reste au repli, et le journal dit de relancer --banc à la main.
- D'autres agents ont modifié tableau.js et créé arbre.js et histoire.js pendant ce travail : je n'y ai pas touché.

## 2. traces

*Rôle : constructeur du lot « traces » : l'arbre généalogique, le récit, la mise à l'abri des journaux dans git. Phase : Machine et traces.*

### Résumé

The selection now writes and saves its own history. Nothing was committed or pushed, and the separate evolution run in CASH-CAR-evolution-essai was not touched.

**1. The family tree (arbre.js, written to etat/arbre.html).** It is a single page with no outside resources that opens from the file system, in light and dark, at 380 px and at full width.
- **Layout:** each pilot is a point at the generation it was born, followed by a line for its life until it was dropped (or until now).
- **Lanes keep the height fixed:** the line of a dropped pilot is reused by a newborn, as close as possible to its parent's line. Both the example state and the 5,054-pilot state use 32 lanes, so the page only grows in width.
- **Older generations are squeezed:** the last 60 generations are shown in detail and the older ones are compressed on the left.
- **Lines and shapes:** a curved line joins each pilot to its parent (two lines for a cross). The shape and colour show where it came from. Champions get a star, and the current champion's ancestry is drawn as a thick green line back to the witness.
- **The pilot card:** clicking or using the keyboard opens it. It says when and from whom the pilot was born. It lists what changed from its parent gene by gene, with a plain word (« braqueNitro (virage au-dessus duquel pas de nitro) : 0,70 → 0,74 »). For the networks it gives « 12 poids changés sur 222 ». It also shows the scores, when and why the pilot was dropped, and its children.
- **Plain words for genes:** no description existed, so I wrote them myself from the comments in pilote-voltige.js.
- **Large states:** with 5,054 pilots the page weighs 1.14 MB and takes 0.5 s to write. Chrome starts, loads and draws it in 1.7 s, of which 1.18 s is Chrome starting.

**2. The story (histoire.js, written to etat/histoire.md).** It is plain Markdown that can be pasted into the portfolio journal as is.
- It opens with ten lines on where things stand, including « La sélection apprend-elle vraiment ? », based on the 40 held-back test races.
- Then there is one plain-French entry per generation.
- Rare events are spelled out; an unknown event is copied as written, so nothing is made up.

**3. tableau.js:** it now rebuilds both pages at the end of its write step, inside a try/catch that cannot break the dashboard, and gets a link to them in its header. Since evoluer.js already calls it, both pages are rebuilt every generation (1.2 s in total with 5,054 pilots).

**4. sauver-traces.cmd (CRLF, ASCII)** rebuilds the pages and commits only the light files. It pushes to `evolution-<pc name>` unless `etat\PAS-D-ENVOI` exists; a failed push is not an error. Two choices differ from the task:
- It also refuses any branch whose name does not start with "evolution", not only main and bots-ecurie.
- The git detail goes to `etat\traces.log`. While the selection runs, lancer.cmd holds sortie.log open and Windows refuses a second writer (I checked this).

The text for the README and the exact lines for installer-tache.cmd (a separate hourly task, with the warning that it SENDS to GitHub) are in notes/traces.md.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\arbre.js  
  Role : Writes etat/arbre.html (the family tree); exports ecrire, page, modele. Command line: --config, --etat.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js  
  Role : Writes etat/histoire.md (the story); exports ecrire, texte, message, nomPc. Command line: --message (commit message), --pc (PC name).
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\sauver-traces.cmd  
  Role : Saves the traces: rebuilds the pages, local commit of the light files, push to evolution-<pc> unless PAS-D-ENVOI. Refuses main, bots-ecurie and non-evolution branches. CRLF.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js  
  Role : Two changes only: calls arbre and histoire at the end of ecrire() (try/catch, also returns traces:{arbre,histoire,erreurs}), and a header link to arbre.html and histoire.md.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore  
  Role : Added etat/traces.log and etat/PAS-D-ENVOI.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\traces.test.js  
  Role : 87 checks (about 25 s, no races, no network); --fabriquer builds a large state with the real genome operators.
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\traces.md  
  Role : Integrator note: what changed, formats with real examples, README text for Sacha, lines for installer-tache.cmd with the sentence to show before O/N, INTERFACES additions, what remains.
- Chemin : <dossier temporaire>\scratchpad\traces\grand-1300.png  
  Role : Headless-Chrome screenshot of the tree with 5,054 pilots, 1,300 px, light. The same folder also has grand-1300-sombre.png, grand-380.png, grand-380-sombre.png and the ex-*.png shots of the example state.

### Tests

- Nom : traces.test.js (new)  
  Passe : true  
  Détail : 87/87. Example state: tree, all 206 pilot cards, gene-by-gene difference recomputed for 109 mutants, story. Dashboard tolerates a tree that throws. Empty and truncated states. Large state (840 generations, 5,054 pilots: 1.14 MB, 0.5 s; Chrome draws it and opens the card asked for by #p=). sauver-traces.cmd in a throwaway git repo with a local bare origin.
- Nom : tableau.test.js  
  Passe : true  
  Détail : 69/69 after my changes; the dashboard still has no script.
- Nom : generation.test.js / robustesse.test.js / lanceurs.test.js  
  Passe : true  
  Détail : 12/12, 8/8, 17/17.
- Nom : graines / note / genome  
  Passe : true  
  Détail : 8/8, 16/16, 14/14.
- Nom : commun.test.js  
  Passe : false  
  Détail : 15/16: « lireConfig fusionne » fails. It comes from another agent (« machine ») editing commun.js and config.json at the same time; my task touches neither file.
- Nom : Visual check  
  Passe : true  
  Détail : Chrome PNGs at 1,300 px and at 380 px (through a 380 px frame, because headless Chrome will not open a window narrower than 500 px), light and dark, on the example and on the large state. Nothing overlaps and the tree scrolls sideways on a phone.
- Nom : courses / identite / evoluer (slow)  
  Passe : false  
  Détail : Not re-run. They reach my code only through tableau.ecrire, whose call to the traces is wrapped in a try/catch.

### Problèmes

- Not tested for real: a push to GitHub (only to a local bare origin), the scheduled task, a worktree on the Ryzen. In auto mode the credential manager asks nothing, so the first push must be done by a double-click (one GitHub login). A pre-push or pre-commit hook on the Ryzen (none here) could block it.
- The dashboard header still says « Rien n'est publié : elle ne vit que sur ce PC », which becomes false once sauver-traces.cmd sends tableau.html to GitHub. Likewise the end of .gitignore (« Aucun commit automatique »), which another agent was editing at the same time. My task did not let me change those lines: for the integrator.
- Size in git: morts.jsonl keeps each dropped pilot's genome (about 4.6 KB), so roughly 1 MB per day. GitHub refuses files over 100 MB, so morts.jsonl must be split within 2 to 3 months, and that file is written by evoluer.js. To limit loose copies, sauver-traces.cmd runs git -c gc.auto=500 gc --auto after each commit; not measured on the real repo.
- Deviation from the task: the push-failure message cannot always go to sortie.log, because Windows refuses a second writer while lancer.cmd runs. The detail goes to etat/traces.log and the summary line is also tried in sortie.log.
- Deviation from the task: the cmd also refuses any branch not starting with « evolution », not only main and bots-ecurie.
- The plain words for the genes are my own (no description existed); they should be reread by someone who knows the pilot.
- A commit may capture a half-written last journal line if evoluer.js is appending at that moment; the next commit completes it.

## 3. relecture:traces

*Rôle : relecteur du lot « traces » : essaie de casser le travail d'un autre agent, puis corrige lui-même ce qu'il trouve. Phase : Relecture 1.*

### Défauts relevés

- Gravité : important  
  Quoi : A generation that was redone after a crash (two lines in generations.jsonl) was told twice in histoire.md, and the headers of the tree and of the story counted one generation too many.  
  Preuve : Hand-written state (relecture-traces.test.js): the story contained '### Génération 2' twice and the tree header said generations=7 for 6 finished generations. Fixed in arbre.modele, which now keeps one line per generation (the last one written).  
  Corrige : true
- Gravité : important  
  Quoi : « La sélection apprend-elle vraiment ? » counted vault measurements, so the same champion measured again on the same 40 races counted several times, and +0.3 palier was counted as 'plus loin'. Nothing mentioned the noise.  
  Preuve : Hand-written state: « le champion est allé plus loin que le témoin 2 fois » came from one champion measured twice, at +0.5 and +0.6. Fixed in histoire.js: one measurement per champion, and a conclusion only beyond the noise of 1.5 palier over 40 races. That figure comes from bruit/resultats.txt § 1 (1.37 over 12 common seeds, so 0.75 over 40 seeds, times two). Each vault line now says 'dans le bruit' or 'au-delà du bruit'.  
  Corrige : true
- Gravité : important  
  Quoi : After a lost title, the story claimed « aucun pilote n'a encore prouvé ... qu'il faisait mieux », which is false once a pilot has been crowned.  
  Preuve : Hand-written state where D is crowned at generation 3 and loses at generation 5. It now reads « Le champion est de nouveau le témoin : le dernier sacré, `63c72aa2` (génération 3), a perdu son titre à la génération 5 (à la revalidation d'une nouvelle époque) ».  
  Corrige : true
- Gravité : important  
  Quoi : sauver-traces.cmd decided 'something new' on files that include the pages, and the pages carry the time. A stopped selection would therefore make one commit (about 1.2 MB) every hour. The existing 'rien de nouveau' test only passed when its two runs fell in the same minute.  
  Preuve : traces.test.js failed 4 checks once ('rien de nouveau : code 0, pas de commit': a 3rd commit of 3 files that only changed the date). Fixed: 'new' is judged on the logs only (journals, machine.json, champions); the pages follow, and a page never saved before counts as new. My test commits a different page, reruns, and checks there is no commit and nothing left staged.  
  Corrige : true
- Gravité : important  
  Quoi : sauver-traces.cmd ran during an unfinished merge, cherry-pick or revert. Its git add would mark a conflicted log as resolved, conflict markers included, which leaves the repository half-broken.  
  Preuve : Test: with .git/MERGE_HEAD present, the new version refuses with code 2 and leaves the index empty. The old version only checked the branch name. It now refuses on MERGE_HEAD, CHERRY_PICK_HEAD, REVERT_HEAD or git ls-files -u.  
  Corrige : true
- Gravité : important  
  Quoi : The commit failed every hour on a PC where git has no user.name or user.email set.  
  Preuve : Test with GIT_CONFIG_GLOBAL pointing to an empty file and GIT_CONFIG_NOSYSTEM=1: the commit now succeeds with a fallback identity used for that commit only, « selection CASH CAR (<pc>) » with selection@<pc>.invalid.  
  Corrige : true
- Gravité : mineur  
  Quoi : The branch check only looked at the first 9 letters, 'evolution', so branches named 'evolution' or 'evolutionmain' were accepted.  
  Preuve : Test: both are now refused with code 2 and no commit. The name must start with 'evolution-'.  
  Corrige : true
- Gravité : mineur  
  Quoi : The push went to evolution-<hostname> whatever the current branch was. A worktree on branch evolution-ryzen of a PC named le-xeon would have created a second remote branch.  
  Preuve : Test: on branch evolution-ryzen, origin now has exactly refs/heads/evolution-ryzen. The command is push origin HEAD:refs/heads/<current branch>, and that branch has already been checked to start with evolution-, so it is never main and never forced.  
  Corrige : true
- Gravité : mineur  
  Quoi : In auto mode an SSH origin could ask a question (passphrase, host key) and block the task, and a stalled push was never cut off.  
  Preuve : Fixed: GIT_SSH_COMMAND=ssh -o BatchMode=yes -o ConnectTimeout=30 (only if not already set), plus -c http.lowSpeedLimit=1 -c http.lowSpeedTime=120. Weak test: only an unreachable SSH origin (closed port) was tried; it returned code 0 with 'envoi rate'.  
  Corrige : true
- Gravité : mineur  
  Quoi : A champions\ folder that is empty or holds only .tmp files made the commit fail ('pathspec did not match').  
  Preuve : Test with champions\ holding only a .tmp file: code 0 and a commit. The folder is now added only if it contains a .js or .json.  
  Corrige : true
- Gravité : mineur  
  Quoi : etat\traces.log grew forever, one entry per hour.  
  Preuve : Test: with a 1.1 MB traces.log it becomes traces.log.ancien and a new one starts. .gitignore now says etat/traces.log*, and neither file enters git.  
  Corrige : true
- Gravité : mineur  
  Quoi : The card of an immigrant with no parent was ungrammatical and misleading: « une copie très changée de un parent inconnu » and « par rapport à son parent, un parent inconnu ».  
  Preuve : Hand-written state, pilot F. It now says « du champion d'alors (son nom n'est pas dans les journaux) » and « Pas de parent connu : on ne peut pas dire ce qui a changé ».  
  Corrige : true
- Gravité : mineur  
  Quoi : A new era and a new phase at the same generation printed two labels on top of each other; two close markers also overlapped at 380 px.  
  Preuve : Seen on the PNG of the 38-pilot state (« époque » over « phase C »). They are now merged into one marker « époque · phase B » (tested), and a marker too close to the previous one keeps its line but drops its label.  
  Corrige : true
- Gravité : mineur  
  Quoi : A tree of only a few generations used about a quarter of the page width (at most 42 px per generation).  
  Preuve : PNG of the 15-pilot state at 1,300 px: the drawing was about 350 px wide. The cap is now 110 px per generation.  
  Corrige : true
- Gravité : mineur  
  Quoi : The story always said '48 courses pour être candidat', whatever the config said, and used « meneur », « immigré », « époque » and « revalidation » without explaining them.  
  Preuve : Hand-written state run with config-essai (nMin 3). The number now comes from cfg.validation.nMin, and the « Les mots » paragraph explains each word in one sentence.  
  Corrige : true
- Gravité : mineur  
  Quoi : The hourly scheduled task (schtasks /it) will flash a black console window on Sacha's screen every hour, as the existing relance task already does.  
  Preuve : installer-tache.cmd lines 36 and 38 use /it, and notes/traces.md § 5.1 uses the same pattern. Recorded in notes § 8.4 for the integrator (would need a hidden launcher such as a .vbs); not fixed because it is outside my files.  
  Corrige : false
- Gravité : mineur  
  Quoi : The dashboard header still says « Rien n'est publié ».  
  Preuve : tableau.js header. Already noted by the author; the integrator was meant to change it, and I did not touch it.  
  Corrige : false

### Tests

- Nom : tests/relecture-traces.test.js (new, mine)  
  Passe : true  
  Détail : 95/95, about 40 s, no races. A hand-written 6-generation state (15 pilots) with a redone generation, truncated last lines, two new eras, a champion crowned, revalidated and then dethroned, an immigrant with no parent, and a generation in progress. Checked: each pilot's birth, parents, origin and end of life; each changed gene and no other; the champion's ancestry (in the same state stopped at generation 3); the story; the merged markers. Then sauver-traces.cmd in a throwaway repo (%TEMP%\cashcar-relecture-traces) with a local bare origin: evolution / evolutionmain refused, no git identity, champions\ holding only a .tmp, push to the current branch only, stopped selection gives no commit and nothing staged, MERGE_HEAD refused, traces.log rotation, unreachable SSH origin.
- Nom : tests/traces.test.js (the author's)  
  Passe : true  
  Détail : 87/87 after my fixes. Before my .cmd fix, 4 checks had failed in one run, because the two runs crossed a minute boundary (the 'rien de nouveau' check).
- Nom : tableau / lanceurs / generation / robustesse  
  Passe : true  
  Détail : 69/69, 17/17, 12/12, 8/8.
- Nom : commun / genome / note / graines  
  Passe : true  
  Détail : commun 16/16 on its second run. The first run failed one check, « ecrireAtomique reessaie quand le fichier est tenu ouvert : fichier tenu false »: that check could not hold the file open in that run, and it is in commun.js, which I did not touch. genome 14/14, note 16/16, graines 8/8.
- Nom : Visual check in headless Chrome  
  Passe : true  
  Détail : PNGs at 1,300 px and in a 380 px frame, light and dark, for 15, 38, 296 and 5,054 pilots. Page weight: 35 KB, 90 KB, 1.20 MB. Writing the tree and the story: 0.37 s, 0.40 s, 1.15 s. Chrome start, load and draw: 1.2 to 1.6 s, of which Chrome alone takes about 1.2 s. The card requested with #p= opens. Nothing overlaps after the fixes.
- Nom : courses / identite / evoluer (slow)  
  Passe : false  
  Détail : Not rerun: my changes only touch arbre.js, histoire.js, sauver-traces.cmd and .gitignore, not tableau.js or evoluer.js.

### Vérifié et jugé bon

- Lineage and gene-by-gene differences are exact on a hand-written state: 15 nodes and no duplicates despite a redone generation and a death written twice; parents, origins (including a cross with « pris chez » the second parent), WS/WV weight counts, and no extra gene listed.
- The champion's ancestry is exact: D ← A ← témoin at generation 3; only the témoin after D loses its title. D then keeps the « ancien champion » badge with a star at generation 3.
- A truncated last line in generations.jsonl or morts.jsonl is ignored and the tree is still correct.
- Era changes are marked in the tree and spelled out in the story; revalidations kept and then lost are each told at the right generation.
- The page is self-contained: no URL or external resource; light and dark both work; readable at 380 px with horizontal scrolling; 1.2 MB for 5,054 pilots.
- tableau.js calls the traces inside a try/catch, and evoluer.js already wraps ecrireTableau in a try/catch, so the traces cannot stop the selection.
- sauver-traces.cmd cannot push to main or bots-ecurie: it refuses those branches, a detached HEAD, and any branch not starting with evolution-. The target is refs/heads/<that branch>, with no + and no --force. git add only touches the listed light files; .gitignore keeps races, generated pilots, sortie.log, verrou.json and traces.log* out; commit --only does not carry files staged by someone else.
- sauver-traces.cmd never stops the selection and writes nothing to its open files apart from one summary line in sortie.log; when the selection holds sortie.log open, that line goes to traces.log instead.
- Root .gitignore and .gitattributes do not exclude ml/evolution/etat journals; *.jsonl/*.html/*.md are -text so LF is kept in commits.

### Ce qui reste

- Not tested for real: a push to GitHub, a real SSH question, any git hook (pre-commit or pre-push), the scheduled task, or a worktree on the Ryzen.
- The hourly scheduled task with schtasks /it will flash a console window every hour; a hidden launcher is left for the integrator to decide (notes § 8.4).
- The dashboard header « Rien n'est publié » is still to be corrected by the integrator.
- The README text in notes § 5.2 should say « la branche de la sélection (evolution-…) » rather than « le nom du PC », and mention that there is no commit when nothing has changed (notes § 8.4).
- The 1.5-palier noise threshold of the vault is an estimate from the noise study. coffre.jsonl should carry its own standard error; that is evoluer.js, outside this batch.
- morts.jsonl will approach GitHub's 100 MB limit in 2 to 3 months (unchanged). A commit can still carry a half-written last line of a log (unchanged, on purpose: there is no lock between the selection and the save).
- Slow tests (courses, identite, evoluer) not rerun.
- Files changed by this review: ml/evolution/arbre.js, histoire.js, sauver-traces.cmd (CRLF, ASCII), .gitignore (etat/traces.log*), notes/traces.md (§ 4.5 and new § 8), and a new test ml/evolution/tests/relecture-traces.test.js. Throwaway states are in ml/evolution/essais/relecture-traces/; PNGs are in <dossier temporaire>\scratchpad\relecture\. Nothing was committed or pushed.

## 4. relecture:machine

*Rôle : relecteur du lot « machine » : essaie de casser le travail d'un autre agent, puis corrige lui-même ce qu'il trouve. Phase : Relecture 1.*

### Défauts relevés

- Gravité : bloquant  
  Quoi : lancer.cmd ne se lançait plus du tout si le chemin du dépôt contient des parenthèses (par exemple « CASH CAR (2) », le nom que Windows donne à une copie). La cause : %ICI% sans guillemets dans le bloc if not exist "%ICI%evoluer.js" ( … ), ce qui fait refuser tout le fichier par cmd.exe. Le défaut existait avant ce lot.  
  Preuve : Copie dans « depot avec espaces (2) » : code 255, « \ml\evolution\ était inattendu ». Après la correction ("%ICI%" entre guillemets sur les deux lignes, le fichier reste en CRLF et en ASCII) : code 0, les options arrivent entières, et sans evoluer.js le message s'affiche avec le code 1.  
  Corrige : true
- Gravité : important  
  Quoi : Si machine.json ne peut pas s'écrire (un dossier à sa place, un fichier en lecture seule ou tenu ouvert), ecrireMachine levait une erreur hors du try de banc(). Le résultat était une ERREUR FATALE (code 1) après des minutes de banc, à chaque relance.  
  Preuve : C.ecrireMachine sur un dossier machine.json lève EPERM. Après la correction (l'écriture est protégée dans banc()) : pas d'exception, le journal dit « impossible a ecrire … le nombre ne vaut que pour ce lancement ». Contrôlé dans tests/machine-relecture.test.js.  
  Corrige : true
- Gravité : mineur  
  Quoi : Un machine.json de ce PC retouché à la main avec plus de courses que de cœurs logiques (par exemple 11 sur 8 cœurs) était cru. Ce n'est jamais une valeur « auto ».  
  Preuve : Après la correction, C.lireMachine l'ignore (« retouche a la main ? ») et le banc est refait, sauf si ce nombre figure dans banc.liste (une liste écrite à la main). Les deux cas sont testés.  
  Corrige : true
- Gravité : mineur  
  Quoi : --valider-maintenant sur un PC sans machine.json faisait d'abord le banc, soit jusqu'à une heure avant une validation demandée tout de suite.  
  Preuve : Après la correction, le journal dit « pas de banc pour --valider-maintenant », aucune course n'est lancée et la sortie prend 1,1 s (test sur un état neuf).  
  Corrige : true
- Gravité : mineur  
  Quoi : Après le banc du premier lancement, cfg._machine n'était pas mis à jour : le tableau et etat.js, écrits par le maître, affichaient « banc du ? » jusqu'au lancement suivant.  
  Preuve : Lecture du code de principal() et de etat.js machineCourte. Corrigé : cfg._machine et cfg._bancAFaire sont mis à jour après le banc. Aucun test ne le couvre, il faudrait un banc fini dans le même processus.  
  Corrige : true
- Gravité : mineur  
  Quoi : tests/commun.test.js échouait (15/16) : il attendait encore le banc d'essai [2,3], alors qu'il vaut maintenant [1,2] pour ne jamais dépasser 2 courses à la fois.  
  Preuve : J'ai changé '[2,3]' en '[1,2]' à la ligne 40, la seule retouche de ce fichier. Le test passe maintenant 16/16.  
  Corrige : true
- Gravité : mineur  
  Quoi : machine.json est committable mais propre à un PC. Celui du PC de développement, tiré sur le Ryzen, y est ignoré (autre nom d'ordinateur) puis réécrit : le fichier suivi devient modifié et un git pull suivant peut refuser de l'écraser. Pour la même raison, lancer.cmd n'affiche pas « Premier lancement sur ce PC », puisqu'il ne vérifie que l'existence du fichier.  
  Preuve : Lecture de lireMachine (comparaison avec hostname et nombre de cœurs) et de lancer.cmd (if not exist). C'est la même situation que population.json et les autres fichiers de etat/.  
  Corrige : false

### Tests

- Nom : tests/machine-relecture.test.js (nouveau)  
  Passe : true  
  Détail : 19/19 en 12 s, aucune course jouée. Il couvre : lancer.cmd dans un chemin avec espaces et parenthèses (auto mangé, "" sauté, --etat auto conservé, message quand evoluer.js manque) ; 11 machine.json abîmés ou venus d'un autre PC (vide, null, liste, tronqué, dossier, travailleurs auto/0/2,5, autre nom, autre nombre de cœurs, plus que L), jamais crus, nombre toujours dans [1, L] ; un bon machine.json cru ; un banc dont l'écriture échoue sans exception ; --valider-maintenant sans banc ; config.json et config-essai.json identiques octet pour octet après les lancements.
- Nom : tests/machine.test.js (le sien)  
  Passe : true  
  Détail : 45/45, relancé après mes corrections.
- Nom : tests rapides existants  
  Passe : true  
  Détail : commun 16/16 (après la retouche de la ligne 40), tableau 69/69, lanceurs 17/17, generation 12/12, robustesse 8/8, graines 8/8, note 16/16, genome 14/14.
- Nom : essai réel : deux lancements et un STOP pendant le banc  
  Passe : true  
  Détail : --config config-essai.json --etat essais/relecteur-machine/etat --arret-apres 1, au plus 2 courses à la fois. Le verrou est pris avant le banc. Le second lancement, 1 s après le début du banc, sort en code 2 (« une evolution tourne deja »). Le STOP arrête le banc à la fin de la course en cours (~25 s) ; machine.json est écrit avec interrompu:true et un repli à 2 ; aucune génération n'est lancée ; code 0 et STOP effacé. Une relance avec STOP posé d'avance ne fait ni banc ni course (code 0).
- Nom : evoluer.test.js, étapes a et c (copie temporaire à --travailleurs 2)  
  Passe : false  
  Détail : PAS FINI : l'étape a tournait encore au moment du rapport. Résultat inconnu, à ne pas compter comme réussi. L'original lance 4 courses à la fois, je ne l'ai donc pas lancé tel quel. La copie temporaire tests/zz-relecteur-evoluer.tmp.test.js est restée dans le dépôt, à effacer, ainsi que essais/relecteur-machine-evoluer/.

### Vérifié et jugé bon

- Un mot de travers ne lance rien : lireOptions passe avant la config, le verrou et toute course. -h au milieu de la ligne donne l'aide ; --Banc et -banc donnent « option inconnue », code 2.
- Le verrou est pris avant le banc, et son battement (setInterval) le garde vivant pendant tout le banc. Vu dans l'essai réel.
- « auto » ne donne jamais 0 ni plus que L : la liste auto et le repli restent dans [1, L].
- Le nombre de travailleurs n'entre ni dans K.epoque, ni dans K.cle, ni dans shaIdentite : la reprise ne change pas d'époque. Un état dont le banc a réussi ne refait pas de banc.
- Aucun code de ml/evolution n'écrit config.json (vérifié par grep et par comparaison des octets).
- lancer.cmd marche avec des espaces dans le chemin, et l'argument "" est sauté.
- refusDePartir répond en environ 0,45 s pour de vrai.
- EPIPE : le test de son lot passe sur un vrai maître.

### Ce qui reste

- Le résultat des étapes a et c de evoluer.test (copie à 2 courses) est inconnu : la course n'était pas finie. Il faut aussi effacer la copie temporaire C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\zz-relecteur-evoluer.tmp.test.js. Les étapes bd, e, f, g et t n'ont pas été relancées.
- tests/evoluer.test.js lance 4 courses à la fois en dur, ce qui est incompatible avec la règle des 2 courses au plus de ce chantier.
- Un état déjà commencé mais sans machine.json fera son banc à la reprise, avant de continuer sa génération. Le banc n'écrit pas dans le journal des courses et ne change pas l'époque.
- Le conflit git sur un machine.json committé puis réécrit sur un autre PC n'est pas réglé (défaut mineur ci-dessus).
- L'intégrateur doit reporter les notes dans INTERFACES.md et README.md. La section « La relecture » a été ajoutée à C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\machine.md.
- Fichiers touchés : evoluer.js, commun.js, lancer.cmd, tests/commun.test.js (ligne 40), tests/machine-relecture.test.js (nouveau) et notes/machine.md. Aucun commit.

## 5. gestes

*Rôle : constructeur du lot « gestes » : les cinq gestes des enquêtes deviennent des gènes éteints à la naissance. Phase : Gestes.*

### Résumé

The five gestes are in the built pilot, each switched off at birth, and with all flags at 0 the pilot still replays pilote-voltige.js bit for bit.

The five gestes:
1. lacheOn: release the wheel before landing.
2. slalomOn: an alternating heading, with the line law softened in the same block.
3. coupOn: the tight version of the seen nitro burst.
4. relacheOn: keep the nitro briefly after takeoff.
5. suitOn: after landing, the line follows the car.

**Genome.** 21 new genes were added at the end of BORNES: 6 flags at 0 (the 5 gestes plus coupDecor) and 15 settings. That makes 107 genes, 79 of them reals. Each bound and birth value cites its line in PROPOSITIONS.md. One value is not measured: coupPerte = 10 m is my choice, because l.321 only says "petit seuil". The proposals rated "douteux" or "à écarter" were not done.

**Migration.** The genome format moves to v:2.
- `migrer()` upgrades a valid v:1 genome in place: the new genes get their birth value, flags at 0, and the 86 old values and both heads are unchanged.
- `valider` calls `migrer` first. That is how `evoluer.charger`, which validates every living pilot right after loading, gets v:2 genomes without me touching evoluer.js.
- `shaGenome` keeps the old id as long as all 21 genes are at their birth value. So the témoin keeps its id `19e3767cc346`, and there will be no "témoin changed" alert.
- Tested two ways: a genome from tests/etat-exemple (completed to the 86 v:1 genes, because the example only has 12), and 200 mutants written by the old genome.js itself, read back with `git show HEAD`. All are valid with the same ids.

**Mutation rate.** Flags flip with pDrapeau = 0.03 per flag per child. Measured over 20,000 mutations: 2.9 to 3.2 % of children switch a given geste on, so about 17 % of generations try each geste. I do not propose raising it; the note explains how to do so later without breaking the deterministic resume.

**Time and the bac.** Every variant loads in the bac. With comments stripped, the code has no require, Math.random, Date, eval or Function. In courses on this loaded PC, decision time was 0.81 to 0.97 ms against 0.88 ms for the témoin. The coup is the slowest at ×1.09, with two courses at 1.02 and 1.00 ms.

**Epoch.** modele.js is part of the course epoch, so this change starts a new epoch: scores reset, pilots stay. That is intended and written in the note.

**Two fixes made during the trials:**
- **Relâché:** the last ground view never shows the nitro, because the pilot cuts it at the edge while the car still takes off with it on (the order takes 0.2 s to reach the hand). The gene now counts nitro asked on the ground within the last 0.35 s. It is `< .35` and not `<= .3` because of a float trap: 12.4 − 12.1 = 0.3000…07.
- **Coup:** it is rare. It cannot fire on décor maps, and on nuages the pilot was often already holding the jet. It is now judged on 4 non-décor seeds, by the total count.

Not committed. I did not touch the game, ml/bot, ml/reel, ml/labo, pilote-voltige.js, config.json, INTERFACES.md, README.md or the running evolution.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\modele.js  
  Role : The built pilot: the 5 gestes, each guarded by its flag; RETOURS_DEMANDES (the coup asks the eyes for 2 extra 'retour' laws, after the pilot's own one); the ray check counts RETOURS_DEMANDES; the takeoff choice skips coup rays (does nothing while the coup is off)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\genome.js  
  Role : GESTES table (21 genes at the end of BORNES, cited bounds), genome v:2, migrer(), valider migrates v:1 in place, id unchanged while the gestes are at birth, gestes written into REGLAGES; exports migrer, VERSION, GESTES, CLES_V1
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\gestes.test.js  
  Role : New test. Without courses: table, migration (etat-exemple and the old genome.js from git), flag switch-on rate, bac loading and timing, settings inert while flags are off, coup laws. With --courses: bit-for-bit identity with settings at their bounds, plus each geste switched on with its figure (options --pilotes, --graines-rares, --json)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\genome.test.js  
  Role : Counts updated (107 genes, 79 reals, 26 flags), distance denominator, expected REGLAGES line of the témoin
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\identite.test.js  
  Role : Added the --travailleurs N option only (default 4, unchanged) so it can run 2 courses at a time
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\gestes.md  
  Role : The note: changes, v:2 format with example, migration, rate, each geste (plain sentence for Sacha, genes, bounds and sources, trial), results, README text, what is left for the integrator
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\gestes\  
  Role : Raw trial outputs and diagnostic scripts, ignored by git: sortie-courses-b.txt, sortie-relache.txt, sortie-identite.txt, courses-*.json, diag-coup.js, cartes.js, genome-v1.js

### Tests

- Nom : identite.test.js --travailleurs 2 (final modele.js)  
  Passe : true  
  Détail : OK, 6 passed, 0 failed (347 s): IDENTIQUE on 910000/910037/910074 (45 s, all three fingerprints), 7 flights; W2 rayon, W2 sol and retourOn change the course without error; ray check on the real eyes OK. A comments-only edit of modele.js came after this run.
- Nom : identite.js --travailleurs 2 --config config-essai.json  
  Passe : true  
  Détail : IDENTIQUE on all 3 seeds (117 s), run before the last relâché tweak (code guarded by relacheOn)
- Nom : gestes.test.js, fast part  
  Passe : true  
  Détail : 7/7: table; migration from etat-exemple and from 200 mutants of the old genome.js (same ids); switch-on rate 2.9-3.2 % per child; bac loading with no forbidden token; decision 0.52-0.63 ms; settings at their bounds with flags off give the same decisions; coup asks for 2 laws, ray check accepts retour0/1 and rejects retour2
- Nom : gestes.test.js --courses (c1): flags off, settings at bounds  
  Passe : true  
  Détail : Course identical to the témoin on 910037 and 910074, 120 s (three fingerprints)
- Nom : (c2) lache  
  Passe : true  
  Détail : Different course, 0 errors / 0 YEUX CHANGES; wheel at 0 in the last 0.35 s before landing: 100 % vs 12.5 %, 73 % vs 33 %
- Nom : (c2) slalom  
  Passe : true  
  Détail : Line side changes per second on the ground 1.34 vs 1.12 and 1.82 vs 0.93; aller 0.86 vs 0.93 s and 0.80 vs 1.00 s
- Nom : (c2) coup  
  Passe : true  
  Détail : 4 non-décor seeds, all different, 0 errors; short bursts in flight: 2 in total vs 0 for the témoin. Rare, so few cases.
- Nom : (c2) relache (after the fix)  
  Passe : true  
  Détail : 4 seeds, all different, 0 errors; first flight view without nitro at 0.30/0.25/0.30/0.28 s vs 0/0.05/0.05/0.08 s (players 0.29). The first version failed: same course as the témoin.
- Nom : (c2) suit  
  Passe : true  
  Détail : After landing, line asked on the side the car slides: 58 % vs 28 %, 85 % vs 22 %
- Nom : (c2) decision time  
  Passe : true  
  Détail : Under 1 ms on average and at most 15 % above the témoin: coup ×1.09 (two courses at 1.02 and 1.00 ms on a loaded PC), the others ×0.98 to 1.01
- Nom : Fast tests: genome, commun, graines, note, tableau, lanceurs, generation, robustesse, genome.js --essai-reparer 10000  
  Passe : true  
  Détail : All pass
- Nom : courses.test.js and evoluer.test.js  
  Passe : false  
  Détail : Not run: slow tests that use 4 courses at a time, not allowed while the real evolution runs

### Problèmes

- Not checked: no geste is judged good or bad. Two 120 s courses only show that each one acts and does not crash. Judging them is the selection's job, and the verifiers' 24 × 300 s batches.
- `valider` migrates a v:1 genome in place (a side effect), because evoluer.js is not my file. The integrator should call `Gn.migrer` explicitly in `evoluer.charger`, then make `valider` pure again.
- v:1 genomes read from journals (morts.jsonl, champions) are not migrated. arbre.js will show 21 'undefined → naissance' differences between a v:2 child and a dead v:1 parent. This is cosmetic, and is fixed by calling `Gn.migrer` in arbre.js, histoire.js and tableau.js.
- `distance` now divides by 107 instead of 86: the diversity shown drops by about 20 % for the same population, to compare against `alarmeDistance` 0.05.
- The 15 settings join the mutation pool. About 19 % of real-gene mutations land on a switched-off geste, and about 4 % of children drive like their parent but are re-run anyway: a small compute cost.
- The coup is rare (2 short bursts in 4 × 120 s), and its two extra rays cost the eyes time that `cerveau_ms_moy` does not count: course throughput will drop a little when it is on.
- The témoin itself is already at 0.8-0.96 ms per decision on this loaded PC, close to the 1 ms limit. The coup adds about 9 %.
- coupPerte (10 m) is not measured: l.321 only says 'petit seuil'.
- INTERFACES.md §2.3, §3.2, §4.1, §5.1 and §5.7 and README.md still need updating by the integrator. The README text is in the note.
- courses.test.js and evoluer.test.js were not rerun.

## 6. relecture:gestes

*Rôle : relecteur du lot « gestes » : essaie de casser le travail d'un autre agent, puis corrige lui-même ce qu'il trouve. Phase : Relecture 2.*

### Défauts relevés

- Gravité : important  
  Quoi : When the coup and the relâché were both on, the coup fired while the relâché was already holding the nitro. The game only gives the coup on a fresh press after a release, so that coup did nothing. It still used one of the 3 coups of the flight, and coupEcart then blocked the real coup that should have come next. The verifier calls this the most useful combination (PROPOSITIONS.md l.337).  
  Preuve : Sequence in ml/evolution (EX views, coupOn+relacheOn, relacheT .45, coupDepuis .35). Before the fix, the nitro asked view by view was true,true,false,false: the coup started at 8.2 s while the relâché held, then was blocked until 8.9 s. Fix in modele.js, only inside the coupOn guard: no coup if the nitro is already asked at this view (!o.nitro) or was asked at the previous view (m.nitroAvant, reset to false at takeoff). After the fix: true,false,true,true,false. New test (r1) in tests/gestes.test.js.  
  Corrige : true
- Gravité : mineur  
  Quoi : slalomDemi was born at 0.42, the enquête value, although the verifier corrects it: « garder slalomDemi à 0,45 au moins » (PROPOSITIONS.md l.239).  
  Preuve : Birth set to .45 in genome.js. The lower bound stays .38, measured at l.216. The témoin keeps its id 19e3767cc346. Expected values updated in (g1) of gestes.test.js and in the expected REGLAGES line of genome.test.js.  
  Corrige : true
- Gravité : mineur  
  Quoi : distance now divides by 107 instead of 86, so the diversity shown drops. The tableau raised « population trop semblable (distance 0.037) » on a population of 4 in the evoluer test.  
  Preuve : Tableau output of evoluer-2.test.js, stage t. This is not my file (tableau/evoluer config): the integrator chooses between lowering alarmeDistance to about 0.04 or counting only the active genes. Written in the note.  
  Corrige : false
- Gravité : mineur  
  Quoi : About 4 % of children differ from their parent only in settings of switched-off gestes. They drive the same, but are re-run anyway because their id and text differ.  
  Preuve : Arithmetic from the mutation pool: 15 of the 79 real genes are settings of gestes that are off at birth. It costs compute only. Fixing it would mean touching evoluer.js or the mutation rule, so it is in the note as a choice for the integrator.  
  Corrige : false

### Tests

- Nom : identite.test.js --travailleurs 2 (rerun by me, before my fixes, which are all guarded or genes at birth)  
  Passe : true  
  Détail : OK 6/6 in 341 s. IDENTIQUE on 910000/910037/910074 (all three fingerprints, 7 flights). W2 rayon, W2 sol and retourOn change the course with 0 errors. (e'): 69 flight views on the real eyes, 0 errors.
- Nom : Long courses: pilote-voltige vs the built témoin vs the 'inerte' pilot (flags 0, the 15 settings + coupDecor at their bounds), tmax 300 s, after my fixes  
  Passe : true  
  Détail : IDENTIQUE on 6 seeds (910111, 930000, 910074, 910222, 910259, 910000), all three fingerprints, 0 errors. Caveat: no course reached 300 s, the pilot dies at 97-150 s. That is 755 s of play and 61 flights, not 2 x 300 s.
- Nom : Text of the built pilot before/after (git show HEAD:modele.js + the old genome.js), compared by hand  
  Passe : true  
  Détail : Outside the flag-guarded blocks, these lines change: REGLAGES (21 extra keys), RETOURS_DEMANDES (the same array when the coup is off), (zActif?R.slalomH:.9)*vit and zActif?capVoulu+capZ:capVoulu (same float operations when zActif is false), and a continue in the departure choice that skips retour<i> rays the eyes do not return. No computation or memory field outside a guard.
- Nom : gestes.test.js, fast part (with my 3 new tests r1, r2, r3)  
  Passe : true  
  Détail : 10/10. r1 coup+relâché; r2 crossing v1 x v2 (200 children, valid v:2) and an out-of-bounds genome refused then repaired; r3 10,000 simulated births: lacheOn 3.31 %, slalomOn 3.86 %, coupOn 3.25 %, relacheOn 3.36 %, suitOn 3.34 % of births switch the geste on (parent off -> child on). Same seed = same children, and a resume halfway through gives them too.
- Nom : gestes.test.js --courses --pilotes temoin,slalom,coup (after the fixes, 120 s, 2 at a time)  
  Passe : true  
  Détail : 13/13 in 463 s. Slalom: different on 2 seeds, 0 errors; line side changes 1.27 vs 1.12 and 1.53 vs 0.93. Coup: different on 4 seeds, 0 errors / 0 YEUX CHANGES; 2 short bursts vs 0. Decision time coup x1.055, slalom x0.98.
- Nom : genome.test.js, generation.test.js, tableau.test.js, commun.test.js, genome.js --essai-reparer 10000  
  Passe : true  
  Détail : 14/14, 12/12, 69/69, 16/16, OK (0 faults)
- Nom : evoluer.test.js stages a, e, t (a copy at 2 courses at a time: essais/relecture-gestes/evoluer-2.test.js, its own state, config-essai.json)  
  Passe : true  
  Détail : TOUT PASSE in 1349 s. The master's identity check is IDENTIQUE and the témoin keeps id 19e3767cc346. 3 generations, one dismissal each, never the témoin or the champion. tableau.js and etat.js run. Stages bd, c, f, g not replayed.
- Nom : Births from the témoin only (10,000 mutations)  
  Passe : true  
  Détail : 2.9 to 3.3 % per geste. 14.2 % of children switch on at least one of the five.

### Vérifié et jugé bon

- Bit-for-bit identity with flags at 0 holds, including on longer courses and with every switched-off setting pushed to its bounds.
- The 5 blocks follow PROPOSITIONS.md with the verifiers' corrections: release only for a pose on the slab (not a lip, not underneath, versRoute/versRoutePlane only); slalom horizon in the same block as capZ with u<.5; coup copied faithfully from faire-coup.js, plus coupDepuis .6, coupDecor 0 and the gain threshold; relâché not applied when the façon already asks for nitro; line that follows the car as written at l.52.
- Bounds are cited from measured lines of PROPOSITIONS.md. coupPerte = 10 m is the one value not measured, and the previous agent says so honestly.
- Migration v:1 -> v:2 works, ids are unchanged, a crossing v1 x v2 gives a valid genome, and an out-of-bounds genome is refused.
- The flag switch-on rate is about 3 % per child, and the deterministic resume holds.
- The pilot loads in the bac and decides in under 1 ms.

### Ce qui reste

- Nothing committed. Files I changed: ml/evolution/modele.js (coup: !o.nitro and m.nitroAvant, inside the coupOn guard), ml/evolution/genome.js (slalomDemi birth .45), ml/evolution/tests/gestes.test.js (r1, r2, r3, g1), ml/evolution/tests/genome.test.js (REGLAGES line), ml/evolution/notes/gestes.md (slalomDemi section and the 'La relecture' section).
- Not rerun in course after my fixes: lache, relache, suit. Their code did not change, but coup+relâché together has never been played in a course; only the unit test r1 covers it.
- For the integrator: an explicit Gn.migrer call in evoluer.charger, arbre.js, histoire.js and tableau.js, then make valider pure again; alarmeDistance vs the 107 denominator; the ~4 % of children re-run although they drive like their parent; INTERFACES.md.
- Stages bd, c, f, g of evoluer.test.js and courses.test.js not run.
- Scratch copy that can be deleted: ml/evolution/essais/relecture-gestes/ (ignored by git). My comparison scripts are in the scratchpad: <dossier temporaire>\scratchpad\long300.js and <dossier temporaire>\scratchpad\naissances.js

## 7. integration

*Rôle : intégrateur : fusionne les notes des trois lots, lance tous les tests et une évolution d'essai. Phase : Integration.*

### Résumé

J'ai intégré les trois lots (machine, traces, gestes). Rien n'est commité ni poussé. Le jeu, ml/bot, ml/reel, ml/labo et le témoin ne sont pas touchés. L'évolution de CASH-CAR-evolution-essai n'a été ni lue ni touchée, et mes essais n'ont jamais joué plus de 2 courses à la fois, un seul à la fois.

Défauts corrigés :
- **Arbre, gènes v:1 (gestes, important)** : arbre.js migre les génomes v:1 relus des journaux, sur l'objet lu sans rien réécrire. Sinon l'enfant v:2 d'un parent mort v:1 montrait 21 changements « undefined -> naissance ».
- **Arbre, mots manquants (nouveau, faisait échouer traces.test)** : les 21 gènes des gestes n'avaient pas de mot simple. Ils en ont un maintenant.
- **Tableau** : l'en-tête ne dit plus « Rien n'est publié », ce qui était faux depuis sauver-traces.cmd.
- **sauver-traces.cmd (nouveau, faisait échouer relecture-traces.test, reproduit à la main)** : après un envoi SSH raté, la ligne de bilan se perdait dans traces.log. L'écriture est maintenant réessayée 5 fois.
- **config.json** : alarmeDistance passe de 0,05 à 0,04 (0,05 × 86/107). Ce nombre n'entre dans aucune époque (testé).
- **tests/evoluer.test.js** : il accepte `--travailleurs N` (4 par défaut). La copie temporaire du relecteur et son dossier d'essai sont effacés.
- **.gitignore** : le commentaire de fin dit maintenant où et par qui les journaux se committent.

installer-tache.cmd :
- Il pose une troisième tâche, CashCarEvolution-traces, qui lance « sauver-traces.cmd auto » toutes les heures, et `enlever` la retire.
- La phrase « Rien n'est envoyé sur Internet » est remplacée. Avant le O / N, il dit ce qui part, l'adresse de origin (sans identifiant ni jeton) et la branche, et il avertit si le dossier n'est pas sur une branche evolution-.
- Le fichier reste en CRLF et en ASCII.

Documentation :
- INTERFACES.md : un § 9 (9.1 machine.json et le banc, 9.2 arbre, récit et sauver-traces, 9.3 gestes et génome v:2, 9.4 mes corrections, 9.5 ce qui reste). Les §§ 1, 2.3, 2.8, 2.9, 2.9 bis, 2.10, 3.1, 3.2, 4.1, 5.1, 5.7 et 7 sont mis à jour là où ces formats sont décrits.
- README.md est refait pour Sacha. En tête : « INSTALLER SUR UN NOUVEAU PC » et « METTRE À JOUR ». Puis la mesure du PC, l'arbre et le récit, « Mettre l'histoire à l'abri », les gestes en cinq lignes, et de nouvelles lignes dans « Si ça s'arrête » et dans la liste des fichiers.
- SPECIFICATION.md : une section 14, ajoutée à la fin seulement.
- Deux notes nouvelles : notes/integration.md et notes/LIVRAISON.md (l'état exact et les commandes du Ryzen, chacune avec ce qui doit s'afficher).

Commandes vérifiées dans un clone jetable (chemin avec espace, code de ce soir commité dans le clone, « origin » nue locale) :
- worktree add -b evolution-ryzen, lancer.cmd --aide dans le worktree, puis sauver-traces auto : tout marche.
- La mise à jour par `git merge --no-edit` échoue sans identité git (« Committer identity unknown »). J'ai donc ajouté au README l'étape `git config user.email` et, s'il n'affiche rien, deux lignes `git config`. Avec l'identité, la fusion passe sans éditeur.
- Le clone a été effacé ensuite.

Essai neuf de 3 générations :
- Pas de nouvel arrêt ni d'erreur : banc (2 retenu), identité IDENTIQUE sur 3 graines, génération 0.
- STOP posé pendant la génération 1 : arrêt propre, code 0.
- Relance avec --arret-apres 2 : pas de nouveau banc, mêmes naissances, 6 courses rendues par le cache et aucune rejouée, générations 1 et 2 avec 2 renvois chacune, code 0.
- generations.jsonl a 3 lignes sans doublon. histoire.md, arbre.html (regardé dans Chrome) et tableau.html racontent bien ces 3 générations.
- Un enfant a déjà allumé un geste (relacheOn) et a joué ses courses sans erreur.

### Fichiers

- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\arbre.js  
  Role : migre les génomes v:1 relus des journaux ; MOTS des 21 gènes des gestes
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js  
  Role : en-tête corrigé (sauver-traces envoie la page sur une branche à part)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\sauver-traces.cmd  
  Role : ligne de bilan de traces.log réessayée (CRLF, ASCII)
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\installer-tache.cmd  
  Role : 3e tâche horaire sauver-traces auto ; texte exact de ce qui est envoyé, adresse, branche ; avertissement hors branche evolution-
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json  
  Role : alarmeDistance 0.04 et une note
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore  
  Role : commentaire de fin mis à jour
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\evoluer.test.js  
  Role : option --travailleurs N
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\integration.test.js  
  Role : nouveau test, 29 contrôles, aucune course
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\README.md  
  Role : mode d'emploi pour Sacha : installer, mettre à jour, la mesure du PC, l'arbre, le récit, sauver-traces, les gestes
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md  
  Role : § 9 et formats mis à jour
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\selection-naturelle\SPECIFICATION.md  
  Role : section 14 ajoutée à la fin
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\integration.md  
  Role : note de l'intégrateur
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\LIVRAISON.md  
  Role : état de la livraison et commandes du Ryzen
- Chemin : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\integration\etat  
  Role : état de l'évolution d'essai (ignoré par git) : tableau.html, arbre.html, histoire.md

### Tests

- Nom : tests rapides (commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture, traces, relecture-traces, gestes)  
  Passe : true  
  Détail : 16/16, 8/8, 16/16, 14/14, 69/69, 17/17, 12/12, 8/8, 45/45, 19/19, 87/87, 95/95, 10/10 après les corrections. Avant : traces 86/87 (mots des gestes manquants), relecture-traces 94/95 (bilan perdu après un envoi SSH raté).
- Nom : tests/integration.test.js (nouveau)  
  Passe : true  
  Détail : 29/29, ~3 s. Il lance pour de vrai le début de l'installateur (jusqu'à la question O / N) dans un dépôt jetable : adresse sans jeton, branche, avertissement, sans origin. Il vérifie aussi l'arbre avec un parent v:1, en échec si on retire la correction.
- Nom : identite.test.js --travailleurs 2  
  Passe : true  
  Détail : OK, 6 passés, 0 raté, 376 s.
- Nom : évolution d'essai neuve de 3 générations, avec un STOP et une reprise  
  Passe : true  
  Détail : Lancée sans --travailleurs (voir problèmes) : banc 1 → 103 courses/h, 2 → 172 courses/h, 2 retenu ; identité IDENTIQUE x3 ; génération 0. STOP après 4 courses de la génération 1, code 0. Relance --arret-apres 2 : pas de banc, mêmes naissances, 6 courses du cache, générations 1 et 2, code 0. 3 lignes dans generations.jsonl, 4 dans morts.jsonl, 0 non mesurée, 0 panne. Le récit, l'arbre (regardé dans Chrome) et le tableau sont justes.
- Nom : commandes INSTALLER / METTRE À JOUR dans un clone jetable  
  Passe : true  
  Détail : git fetch + worktree add -b evolution-ryzen (code 0), lancer.cmd --aide, sauver-traces auto vers une origine locale, merge --no-edit : refusée sans identité git, passée avec les deux git config du README.
- Nom : evoluer.test.js (bd, c, f, g) et courses.test.js  
  Passe : false  
  Détail : Pas relancés (lents). Seule l'évolution d'essai ci-dessus couvre le maître.

### Problèmes

- Écart à la tâche : la commande d'essai donnée (--travailleurs 2) ne fait jamais le banc, parce que --travailleurs l'emporte sans banc. Je l'ai lancée sans --travailleurs : la config d'essai borne à 2 courses à la fois, et le banc a bien eu lieu.
- Rien n'est commité ni poussé. Le Ryzen ne peut rien recevoir tant que bots-ecurie n'est pas commité puis poussé sur GitHub : c'est l'étape 0 de LIVRAISON.md, laissée à Sacha ou à la session principale.
- Non vérifié : le vrai banc sur le Ryzen, un envoi vers le vrai GitHub, la pose réelle des tâches planifiées. Le premier envoi doit être fait d'un double-clic sur sauver-traces.cmd (connexion GitHub une fois).
- Défauts mineurs non corrigés : une fenêtre noire s'ouvre chaque heure (/it, il faudrait un lanceur .vbs) ; le tableau ne montre pas machine.json ; valider migre encore en place ; environ 4 % d'enfants rejoués pour rien ; morts.jsonl vers 100 Mo dans 2 à 3 mois ; lancer.cmd ne dit pas « premier lancement » quand un machine.json vient d'un autre PC.
- Dans l'essai, l'alerte « population trop semblable (0,030) » reste levée : seulement 4 pilotes. Le seuil 0,04 n'a pas été jugé sur une vraie population de 20.
- Fichier non suivi trouvé et laissé tel quel : ml/bot/results/note-essai-main-allege-t120-parties.json (il était déjà là au début).
