# Passation — l'écurie, le 28/11/2026 vers 7 h 40 (mise à jour ; l'état du 27/11 au soir et celui du 26/11 suivent, en partie périmés)

À lire en premier par la session qui reprend. Le détail de chaque étape est dans `ETAPES.md` (« La nuit du 27 au 28/11 ») ; le récit pour le portfolio
dans `portfolio/journal/2026-11-28.md` ; ici, l'état exact, ce qui tourne, et quoi faire. Heures de Paris.

## L'état au 28/11/2026 au matin

> **Mise à jour, 28/11 à 10 h 45 : le banc des gènes est fini** (1 250 courses sur 1 250, aucune ratée). Aucun interrupteur ne change le palier ni F
> au seuil corrigé ; slalomOn, bordOn et gestes5 rapprochent sûrement des joueurs (E 0,882 → 0,707, 0,728, 0,665). Le résultat, ses limites et
> la suite décidée (vague de confirmation de bordOn, slalomOn, suitOn, fuirVite et du bras bordOn + slalomOn) : `ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md`,
> « Le résultat (28/11/2026) ». Ce qui suit, écrit à 7 h 40, le disait encore en marche.

**En bref.** La sélection naturelle tourne sur le Ryzen depuis le 28/11 à 0 h 29, mais n'envoie plus rien depuis 2 h. La boucle payante y est arrêtée,
et jugée : sur les 40 graines du coffre, ses champions ne font pas mieux que le pilote de départ c0025 (+0,03 palier [−1,18 ; +1,38], commit `00fb4cfad`).
L'étude du réglage a montré pourquoi : le hasard d'une course (3,26 paliers en écart-type) pèse environ dix fois plus que l'écart vrai entre deux
mutants (0,32 [0 ; 1,07]). D'où la méthode retenue par la session principale : des changements de structure, écrits comme des gènes éteints à la
naissance, jugés un par un sur le **banc des gènes**, qui tourne sur le Xeon.

### Ce qui tourne

| | État au 28/11 vers 7 h 40 |
|---|---|
| **Le banc des gènes, sur le Xeon** | **en marche** depuis 3 h 28, dans ce worktree : `node ml/ecurie/etude/banc-des-genes/jouer.js --travailleurs 4 --graines 96`. 13 pilotes × 96 graines = 1 248 courses, plus 2 de contrôle. À 7 h 40 : 744 sur 1 250, « reste ~172 min » (dernière ligne de `jouer.log`). **Aucun résultat** : `sorties/resume.txt` n'existe pas encore. Le dossier n'est pas dans git |
| **La sélection, sur le Ryzen** | lancée le 28/11 à 0 h 29 avec le code `e93ff5cb5` (génome v:2), dans `CASH-CAR-evolution` sur le Ryzen. Banc de la machine : 10 courses à la fois ; génération 0 : 280 courses en 40 minutes, 418 à l'heure ; champion = témoin (branche `origin/evolution-ryzen`, `machine.json` et `resume.txt`). **Silencieuse depuis 2 h 00** (dernier envoi `71e7c7c2c`) : sélection arrêtée, PC éteint ou en veille, ou envoi bloqué, on ne sait pas (`ml/evolution/notes/LIVRAISON-REGLAGE.md` § 5) |
| **La boucle payante, sur le Ryzen** | **arrêtée** le 28/11 à 0 h 12 (`b1ff8af89`) ; ses résultats sont fusionnés dans `bots-ecurie` (`7f9543955`) |
| **Les prochaines idées** (11 agents Opus, lancés vers 7 h 20) | en cours : relever dans les études déjà écrites les changements de structure à mettre sur le banc. Dans `ml/ecurie/etude/prochaines-idees/`, un `LISEZ-MOI.md` (écrit à 7 h 35) et un `candidats.json` (7 h 37) ; l'équipe n'avait pas rendu son bilan à 7 h 40 : ne pas s'y fier avant sa fin et sa relecture |

**Ce qui ne doit pas bouger pendant le banc** : `ml/evolution/modele.js`, `enfant.js`, le jeu, les yeux, la version de Node. Le banc lit le code de ce
worktree ; s'ils changent, toutes ses courses sont rejouées (`banc-des-genes/LISEZ-MOI.md`, « Reprendre »). Arrêt propre : un fichier vide
`ml/ecurie/etude/banc-des-genes/etat/STOP`. Pas d'autre course lourde sur le Xeon d'ici là.

### Ce qui est poussé, ce qui ne l'est pas

- **`origin/bots-ecurie` est au commit `2a3bea3c1`** (28/11, 7 h 22), le même que la branche locale : le portage (`7b1df608e`), le coffre (`00fb4cfad`) et
  le réglage (`3b1bf15e5`, `2a3bea3c1`) sont sur GitHub.
- **Pas encore commités** au 28/11 à 7 h 40 : le chapitre `portfolio/journal/2026-11-28.md` et les mises à jour du journal (`LISEZ-MOI.md`, `LEXIQUE.md`),
  les quatre travaux de la nuit dans `portfolio/orchestration/` (et son `LISEZ-MOI.md`, et `outils/orchestration.js`), `ETAPES.md`, cette passation,
  et tout `ml/ecurie/etude/banc-des-genes/`. À relire, puis à commiter sur `bots-ecurie` par la session principale.

### La mise à jour du Ryzen, qui attend Sacha

Le Ryzen tourne encore le code `e93ff5cb5`. En fusionnant `origin/bots-ecurie`, il recevra deux mises à jour d'un coup : le portage (génome v:3, témoin
au choix, Node fixe, tâches sans limite ; `notes/LIVRAISON-C0101.md`) et le réglage (`notes/LIVRAISON-REGLAGE.md`). Le portage change `modele.js` :
**une nouvelle époque** (les notes repartent de zéro, les courses sont rejouées, les pilotes restent). La fusion ne fait aucun conflit
(`git merge-tree`, § 5 de la livraison).
1. **D'abord** (§ 5) : sur le Ryzen, `node ml\evolution\etat.js` et les 30 dernières lignes de `etat\sortie.log` et `etat\traces.log`, à donner à Claude.
   Si la ligne 2 dit EN MARCHE et que la génération a avancé, c'est seulement l'envoi ; sinon, la cause de l'arrêt compte avant de relancer.
2. **Puis** les sept gestes du § 4 : arrêter, fusionner, le Node fixe, relancer (le témoin reste c0025), rien à faire pour les tâches, vérifier
   (dont `"regle6"` dans `population.json`), mettre à l'abri.
Ces gestes se font sur le Ryzen par Sacha, avec l'assistant de Sacha sur le Ryzen. Aucune session Claude du Xeon ne les fait.

### Les décisions prises cette nuit

- **Sacha** (27/11, 23:22 UTC) : arrêter la boucle payante, installer la sélection sur le Ryzen, « j'accepte l'envoi horaire de l'histoire sur GitHub ».
  Aucun message de lui après 23:35 UTC dans le relevé refait le 28/11 au matin.
- **La session principale** (méthode) :
  - le témoin reste **c0025** (le pilote écrit à la main, `pilote-voltige.js`) : le coffre a montré que c0064 et c0101 ne font pas mieux ;
  - **ne pas relancer la boucle payante telle quelle** (3 h 05) : ses 20 courses de validation, réutilisées à chaque sacre, ont couronné la chance ;
  - les idées de la boucle, et toute idée nouvelle, deviennent des **gènes éteints à la naissance**, jugés un par un sur le banc des gènes ;
  - les changements sûrs de l'étude du réglage entrent dans la sélection (`3b1bf15e5`) ; les autres (§ 2 B à E de `etude/reglage-de-la-selection/LISEZ-MOI.md`)
    attendent : B avec la prochaine époque voulue, C après la mesure de τ, E écartés.
- **Une erreur de Claude, à garder en tête** : à 0 h 23, Claude a d'abord conseillé de prendre c0101 comme point de départ ; le coffre l'a démenti.

### Les décisions qui attendent Sacha

1. **La sévérité des deux garde-fous du sacre** (`validation.seuilB` et `seuilC` dans `ml/evolution/config.json`, à 1 aujourd'hui, ou 2) : à 2, un +2 paliers
   est reconnu 86 fois sur 100 au lieu de 80, mais un pilote qui ressemble un peu moins aux joueurs passe plus souvent (`LIVRAISON-REGLAGE.md` § 1, point 8 ;
   `etude/reglage-de-la-selection/LISEZ-MOI.md`, D1).
2. **Les 141 € de crédit d'API qui restent** sur 200 (58,53 € dépensés, `b1ff8af89`), à utiliser d'ici le 08/12. La boucle payante telle quelle est
   écartée ; un lancement payant se fait par Sacha seulement.
3. **Le nom de l'école** visée : il apparaît dans `portfolio/journal/2026-11-22_23.md` (les points laissés à Sacha par le plan) et dans
   `portfolio/orchestration/journal/comptes-rendus.md` (le compte rendu du critique). Le dépôt est public : garder ou retirer, à lui de dire.
4. **Sa page `portfolio/journal/LA-VOIX-DE-SACHA.md`**, vide exprès : à écrire par lui, ou à laisser.
5. Les décisions de l'étude du réglage qui lui reviennent aussi (D2 à D5 du même LISEZ-MOI : le poids de E dans la note, `seuilSacre`, tout ce qui change les
   yeux, committer ou non les copies de données des études) : aucune n'est urgente.

L'abonnement : 27 % de la semaine utilisés à 7 h 20 le 28/11 (18 % la veille à 23 h 15), d'après les messages de la session principale.

### À faire ensuite, dans l'ordre (28/11/2026)

1. **Lire le banc des gènes** quand `jouer.log` finit par le total : `node ml/ecurie/etude/banc-des-genes/analyser.js`, puis `sorties/resume.txt`.
   Le lire avec ses limites (son LISEZ-MOI, « Ce qu'on ne pourra pas conclure ») : 12 bras comparés, donc environ une chance sur deux qu'un « aide » sorte
   par hasard ; regarder le seuil corrigé ; « on ne sait pas » ne veut pas dire « ne fait rien ». Écrire le résultat dans le LISEZ-MOI du banc, dans le
   journal (le chapitre du jour) et ici.
2. **Choisir les prochaines idées** dans `ml/ecurie/etude/prochaines-idees/` (quand l'équipe aura rendu), en relisant ce qu'elle propose contre les études.
   Ce que son LISEZ-MOI marque comme décision de Sacha (par exemple ce qui change les yeux, ou la façon de compter un palier) lui revient.
3. **Les écrire comme gènes éteints à la naissance** dans `ml/evolution/genome.js` : tout éteint, le pilote doit redonner c0025 au bit près. Attention :
   ce qui touche `modele.js` ou `enfant.js` change l'époque (pour le Ryzen) et fait tout rejouer au banc s'il tourne encore.
4. **Les passer au banc**, sur les mêmes 96 graines (ou une nouvelle plage, jamais sous 2 000 000), un bras par idée.
5. Entre-temps, dès que Sacha a envoyé les lignes du Ryzen : l'aider pour la mise à jour (plus haut).
6. Restent ouverts depuis le 27/11 : `tests/courses.test.js` non relancé ; inscrire un champion au labo (`sansCout()`) ; le biais des rayons `versRoute`
   (change `yeux.js`, donc l'époque : prévenir Sacha) ; archiver les courses des époques closes ; `morts.jsonl` qui grossit.

### Les règles qui tiennent toujours (28/11/2026)

- **Ne jamais lancer `chaine.js` ni `boucle.js` sur le Xeon.**
- **La clé d'API ne s'affiche ni ne s'écrit nulle part.**
- **Un lancement payant se fait par Sacha**, jamais par une session Claude.
- **`installer-tache.cmd` se lance par Sacha seulement** (il change des réglages de Windows).
- **Rien dans `code/` ni dans `VERSION PRINCIPALE/`** : le jeu ne change pas.
- Le dépôt GitHub est **public** : aucun nom de PC, aucune adresse, aucune clé, aucun détail de famille ou de logement dans ce qui part. Les deux PC
  s'appellent « le Xeon » et « le Ryzen » ; celui qui tape les commandes sur le Ryzen, « l'assistant de Sacha sur le Ryzen ».
- **Une seule mesure lourde à la fois sur un PC**, et rien ne change dans les fichiers de l'époque pendant qu'elle joue (le 28/11, le portage a changé
  `modele.js` pendant que la mesure du coffre jouait : voir `portfolio/orchestration/LISEZ-MOI.md`).
- **Un gain se juge sur des graines neuves, jamais réutilisées pour choisir**, et par comparaison appariée (le coffre, le banc).
- Chaque travail d'agent est relu par un second agent qui refait les mesures ; la session principale relit avant de commiter.
- Garder des traces de chaque décision pour le portfolio (journal, `ETAPES.md`, `portfolio/orchestration/`).

### Un dossier d'essai à retirer un jour

Le worktree `C:\Users\sacha\code\CASH-CAR-evolution-essai` (code `e2ea8d2c9`), à côté du dépôt : la première vraie évolution du 27/11 au soir, sur le Xeon.
Ses chiffres servent de premier repère (chapitre du 27/11). À retirer avec `git worktree remove` quand Sacha le veut ; ses `etat/` ne sont pas dans git.

### Le texte à coller dans la session qui reprend (28/11/2026)

> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/PASSATION.md` (la partie du 28/11), puis
> `ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md` et `ml/evolution/notes/LIVRAISON-REGLAGE.md`. Si le banc des gènes est fini, lance son `analyser.js` et
> lis `sorties/resume.txt` avec ses limites ; sinon, ne touche ni à `modele.js` ni à `enfant.js`. Puis suis « À faire ensuite ». Ne lance jamais
> `chaine.js` ni `boucle.js` sur le Xeon, ne touche ni à `code/` ni à `VERSION PRINCIPALE/`, et garde des traces de chaque décision pour le portfolio.

---

# L'état du 27/11/2026 à 23 h 15 (gardé pour l'histoire)

> ⚠ **Périmé en partie depuis le 28/11/2026** : le tableau d'état (finitions non poussées, Ryzen « jamais lancée », boucle payante en marche), les
> étapes 1 à 4 de « À faire ensuite » (faites dans la nuit), le point « le sacre est prudent » (remplacé par le sacre séquentiel, `3b1bf15e5`) et le
> texte à coller de cette partie ne sont plus à jour : voir l'état du 28/11, plus haut. Le récit du changement de cap, la première évolution sur le Xeon
> et les finitions restent justes.

## Le changement de cap du 27/11/2026 : la sélection naturelle

**La décision de Sacha (27/11, l'après-midi).** Le plan d'avant ne lui correspondait pas. Il a demandé de « recycler » le travail déjà fait pour en
tirer un système qui apprend seul, où le moins bon bot est renvoyé, et qui tourne en automatique sur son second PC, **sans jetons ni abonnement**,
« juste par sélection naturelle » (ses messages datés : `agents/tmp-voltige/paroles-sacha.md` ; le récit de la journée :
`portfolio/journal/2026-11-27.md`). Il a ajouté deux consignes de méthode : ne plus suivre un plan étape par étape sans se demander à chaque fois
quelle est la meilleure méthode pour la suivante, et garder des traces de tout pour son portfolio.

**Ce que ça arrête.** On n'améliore plus le pilote à la main (les réglages un par un des 26 et 27/11, plus bas), ni par la boucle payante
(`boucle.js`, `chaine.js` : une IA payée sur la clé d'API écrit des variantes du pilote). Ces outils restent dans le dépôt, avec leur histoire ; ils
ne sont plus la voie suivie. Ce qui remplace : **`ml/evolution/`**, un programme qui tourne sur le processeur du PC et ne paie rien.

**Ce qu'est la sélection, en quelques phrases** (mode d'emploi : `ml/evolution/README.md` ; le détail technique : `ml/evolution/INTERFACES.md`).
- Une **population de 20 pilotes**. Chaque pilote est décrit par un **génome** : la liste de ses réglages (les « gènes » : des seuils, des marges, des
  interrupteurs) et deux petits réseaux de neurones muets à la naissance. Le pilote de départ est `pilote-voltige.js`, le pilote écrit à la main : le
  génome le refabrique à l'identique.
- À chaque **génération**, chaque pilote joue les mêmes **12 courses** (une course est tirée d'une « graine », un nombre qui fixe la piste et le hasard
  du jeu). **6 pilotes naissent** : copies légèrement changées des meilleurs (mutation) ou mélanges de deux parents (croisement). Les moins bons, sur
  leur note cumulée, sont renvoyés.
- **La note F** = le palier atteint moins 4 fois **l'écart aux joueurs E** (la distance entre la conduite du bot et celle des vrais joueurs, mesurée
  sur quinze mesures). Un bot qui monte haut en conduisant comme une machine n'est donc pas préféré.
- **Le témoin** : `pilote-voltige.js` tel qu'il est, jamais modifié, rejoue chaque génération ; il sert d'étalon. **Le coffre** : 40 courses qui ne
  servent jamais à l'entraînement ; le champion et le témoin y sont comparés : c'est le seul juge de « est-ce que ça apprend ».
- **Le sacre** : un pilote ne devient champion qu'après avoir battu le champion en titre sur des courses neuves.
- Le jeu n'est jamais modifié ; rien n'est écrit dans `code/` ni dans `VERSION PRINCIPALE/`.

| | État au 27/11/2026 à 23 h 15 |
|---|---|
| **Le code de `ml/evolution/`** | **écrit et commité** : la construction (commit `e2ea8d2c9`, 19 h 32, 10 agents Opus d'après son message) puis les finitions (commit `7c5204afa`, 23 h 12, 7 agents Opus) : genome v:2 de 107 gènes |
| **Envoyé sur GitHub** | **en partie** : `origin/bots-ecurie` est au commit `4c1fe5c3c` ; **les finitions (`7c5204afa`) ne sont pas poussées** (la branche locale a un commit d'avance) |
| **Une vraie évolution sur le Xeon** | **en marche**, dans une copie à part du dépôt (voir plus bas) ; elle joue le code de `e2ea8d2c9`, sans les finitions |
| **Sur le Ryzen** | **jamais lancée.** La boucle payante (`boucle.js`, plafonnée à 60 € sur ce PC) y tournait encore à la dernière nouvelle, relancée par une tâche planifiée de Windows (message de Sacha du 27/11, `agents/tmp-voltige/paroles-sacha.md`) |
| **La mise à l'abri sur GitHub** (`sauver-traces.cmd`) | **jamais essayée vers le vrai GitHub** (seulement vers une copie locale, dans un dossier temporaire) |
| **Les tâches planifiées de la sélection** (`installer-tache.cmd`) | **jamais posées** : c'est à Sacha |
| **Les cinq gestes des joueurs** | **en gènes éteints à la naissance** ; on ne sait pas si un seul est bon : c'est la sélection qui le dira |

### La première vraie évolution, sur le Xeon (le soir du 27/11)

Le Xeon est le PC de développement. À 19 h 33 (l'heure écrite dans le verrou de ce premier lancement, `etat/verrou.json.mort-14580`), Fable (la session principale) a lancé `ml/evolution` pour la première fois avec la vraie
configuration (20 pilotes, 12 graines par génération, 4 courses à la fois), dans un **« worktree »** à part : une seconde copie de travail du même
dépôt, dans son propre dossier (`C:\Users\sacha\code\CASH-CAR-evolution-essai`), pour que rien de ce qui se fait ailleurs ne la dérange.

**L'erreur de Fable, et ce qu'elle a montré.** Pour lire l'aide, Fable a tapé `node ml/evolution/evoluer.js --aide | head -30` (le `| head -30`
envoie la sortie à un petit programme qui n'en garde que les 30 premières lignes). L'option `--aide` n'existait pas encore et les options inconnues
étaient ignorées sans rien dire : **la vraie évolution a démarré**. Puis `head`, ses 30 lignes reçues, a fermé le tuyau ; le programme, qui n'avait plus
où écrire, est mort (l'erreur « EPIPE », un tuyau cassé). Les garde-fous ont joué : d'après Fable, le **verrou** (un fichier qui dit « une sélection tourne ici ») a
refusé un second lancement, et le résumé a affiché « ARRETE SANS PREVENIR ». Relancée pour deux générations (`--arret-apres 2`, ligne de commande lue
sur le processus en marche) : le **cache** (la mémoire des courses déjà jouées) a rendu les 22 courses faites avant la mort, sans les rejouer
(`etat/generations.jsonl` : 22 du cache, 258 jouées). Les deux défauts — une option inconnue ignorée, la mort quand la console se ferme — sont corrigés
le soir même dans `7c5204afa` : une option mal écrite arrête tout avant la moindre course, et la console perdue, le journal continue dans `etat/sortie.log`.

**Ce qu'elle a produit** (lu à 23 h 15 par `node ml/evolution/etat.js` et dans `etat/sortie.log` et `etat/generations.jsonl` de ce worktree) :
- **Génération 0** : 280 courses (258 jouées, 22 rendues par le cache) en 4 874 s, soit 81 minutes, **191 courses à l'heure** ; aucune course non
  mesurée, aucune panne. Le témoin : palier moyen 6,5 sur 12 courses, **note F 2,8 ± 0,9**, écart aux joueurs **E 0,90**. Le coffre : 40 courses
  (le champion est encore le témoin : la différence vaut 0). Aucun meneur, aucun renvoi.
- **Génération 1**, commencée à 21 h 04 : 6 naissances (1 immigré, c'est-à-dire une copie très changée du champion, ici encore le témoin ; 3 mutations ; 2 croisements), 312
  courses (26 pilotes × 12 graines) ; **282 écrites au journal à 23 h 15**. Après elle, l'évolution s'arrêtera seule (`--arret-apres 2`).
- L'alerte « population trop semblable (distance 0,028) » affichée par ce worktree vient de l'ancien seuil (0,05 dans le `config.json` de ce worktree, code de `e2ea8d2c9` ; l'intégrateur des finitions l'avait ensuite porté à 0,04) : la mesure de
  cette vraie population est justement ce qui a fait baisser le seuil à 0,012 dans les finitions (`ml/evolution/config.json`, `_notes`).
- Le contrôle d'identité à la naissance (le pilote fabriqué par le génome rejoue `pilote-voltige.js`, course pour course) : **IDENTIQUE sur 3 graines**,
  d'après Fable ; la ligne n'est pas dans le `sortie.log` de ce worktree, qui commence à la relance de 19 h 43. Le même contrôle est écrit dans
  `ml/evolution/notes/LIVRAISON.md` pour l'essai de l'intégrateur (graines 910000, 910037, 910074).

### Les finitions du soir (commit `7c5204afa`)

Un travail orchestré de 7 agents Opus : trois lots, chacun relu par un second agent, puis un intégrateur (notes : `ml/evolution/notes/machine.md`,
`traces.md`, `gestes.md`, `integration.md`, `LIVRAISON.md` ; `INTERFACES.md` § 9).
1. **Un réglage par PC** : chaque machine mesure seule, au premier lancement, combien de courses elle tient à la fois (« le banc », 10 minutes à une
   heure, écrit dans `etat/machine.json`). Le même dépôt marche donc sur le Xeon et sur le Ryzen sans rien régler à la main.
2. **Les traces pour le portfolio** : `arbre.js` (l'arbre généalogique des pilotes : qui naît de qui, quels gènes ont changé, qui est renvoyé, qui est
   sacré), `histoire.js` (le récit, génération par génération), `sauver-traces.cmd` (chaque heure, un commit des journaux légers et un envoi sur une
   branche à part `evolution-…`, jamais `main` ni `bots-ecurie` ; coupé par un fichier `etat\PAS-D-ENVOI`).
3. **Les cinq gestes des enquêtes du 27/11** (lâcher le volant avant le contact, le slalom demandé par le pilote, le coup de nitro en vol, garder la
   nitro un instant après le décollage, laisser la ligne suivre la glisse après la pose) : 21 gènes ajoutés, **éteints à la naissance** (genome v:2,
   107 gènes au lieu de 86). Le pilote de départ conduit donc exactement comme avant ; chaque geste est allumé au hasard chez environ 3 enfants sur 100.

**La relecture de Fable après les agents** (même commit) : le nom Windows du PC serait parti sur le dépôt GitHub, qui est **public** (dans
`machine.json` et dans chaque message de commit de la mise à l'abri) — remplacé par une empreinte et par la fin du nom de la branche ; l'alerte
« population trop semblable » était levée dès la génération 0 (une vraie population de 20 vaut 0,028 à la naissance) — seuil ramené à 0,012 ;
l'installateur dit maintenant que ce qui part sur un dépôt public est lisible par tous.

Dans l'essai de l'intégrateur (4 pilotes, 3 générations, `LIVRAISON.md`), un enfant a déjà allumé un geste (`relacheOn` : garder la nitro un instant
après le décollage) et a joué ses courses sans erreur. **Cela ne dit rien de sa valeur.**

**Le coût de la journée en jetons de sous-agents** (les bilans des quatre orchestrations, recopiés dans `portfolio/orchestration/LISEZ-MOI.md`) : le journal de bord
(16 agents), 2,44 millions ; ses images (20 agents), 2,46 millions ; la construction de `ml/evolution` (10 agents), 2,40 millions ; les finitions (7 agents,
3 h 18 de travail, 568 appels d'outils), 1,99 million.

### À faire ensuite, dans l'ordre (27/11/2026)

1. **Pousser `bots-ecurie`** (depuis le Xeon) : `git push origin bots-ecurie`. Sans cela, le Ryzen ne reçoit pas les finitions.
2. **Sacha arrête la boucle payante du Ryzen** — `boucle.js` **et** la tâche planifiée qui la relance — **avant** de lancer la sélection : les deux
   ne peuvent pas se partager les cœurs du processeur, et `evoluer.js` refuse de partir tant que `boucle.js` tourne (`evoluer.js`, « le refus de partir »).
3. **Sacha installe sur le Ryzen** : `ml/evolution/README.md`, « INSTALLER SUR UN NOUVEAU PC », et `notes/LIVRAISON.md`, étape 1, avec ce qui doit
   s'afficher à chaque commande. `installer-tache.cmd` et le premier `sauver-traces.cmd` se lancent par Sacha seulement.
4. **Lire les premières générations** : `node ml\evolution\etat.js` (dix lignes), `etat/tableau.html`, `etat/histoire.md`, `etat/arbre.html` ; sur
   GitHub, la branche `evolution-ryzen`. Les premiers jours, champion et témoin se confondent au coffre : c'est attendu.
5. **Les points ouverts** :
   - **Le sacre est prudent au point de rater des progrès.** Avec `seuilSacre` 2 (`INTERFACES.md` § 8), un meneur qui ne vaut pas mieux n'est sacré
     à tort que 3,7 fois sur 100 (18,3 avec 1), mais un vrai gain d'un palier n'est sacré que 12 fois sur 100 (deux paliers : 34). L'idée à étudier :
     une validation à deux étages (un premier tri sur peu de courses neuves, puis une confirmation sur davantage) ; rien n'est écrit.
   - **Inscrire un champion au labo** : `inscrire-champion.js` exige d'abord une ligne dans `sansCout()` de `ml/labo/labo.js` (y ajouter `/^evolution/`,
     la ligne exacte est dans `INTERFACES.md` § 2.11).
   - **Le biais des rayons `versRoute`** : dans `ml/bot/yeux.js`, le radar joue la loi « vers la route » sans le retard de la main (la main obéit 0,2 à
     0,35 s plus tard), alors que les lois « retour » l'ont depuis le 27/11. Le corriger change `yeux.js`, donc toutes les courses : **prévenir Sacha**,
     il faudra re-noter (et la sélection changera d'époque, c'est-à-dire que ses notes repartiront de zéro).
   - **Archiver les fichiers de courses des époques closes** (`etat/courses-*.jsonl`) : ils restent sur le disque et sont relus à chaque lancement
     (`INTERFACES.md` § 8, « Non corrigé »).
   - **`morts.jsonl` grossira** d'environ 1 Mo par jour : vers 100 Mo, la limite de GitHub, dans 2 à 3 mois ; il faudra le découper (`INTERFACES.md` § 9.5).
   - Non relancés avec le code des finitions : `tests/evoluer.test.js` (étapes bd, c, f, g) et `tests/courses.test.js` (lents).
6. L'évolution d'essai du Xeon (`CASH-CAR-evolution-essai`) s'arrête seule après la génération 1. Ses chiffres servent de premier repère ; elle ne
   remplace pas celle du Ryzen.

### Les règles qui tiennent toujours (27/11/2026)

- **Ne jamais lancer `chaine.js` ni `boucle.js` sur le Xeon.**
- **La clé d'API ne s'affiche ni ne s'écrit nulle part.**
- **Un lancement payant se fait par Sacha**, jamais par une session Claude.
- **`installer-tache.cmd` se lance par Sacha seulement** (il change des réglages de Windows).
- **Rien dans `code/` ni dans `VERSION PRINCIPALE/`** : le jeu ne change pas.
- Le dépôt GitHub est **public** : aucun nom de PC, aucune adresse, aucune clé dans ce qui part.

### Le texte à coller dans la session qui reprend (27/11/2026)

> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/PASSATION.md` (la partie du 27/11), `ml/evolution/README.md`
> et `ml/evolution/notes/LIVRAISON.md`. Le cap est la sélection naturelle de `ml/evolution`, qui tourne seule sur le Ryzen sans jetons ni abonnement.
> Vérifie que `bots-ecurie` est poussé, puis suis « À faire ensuite » de la passation. Ne lance jamais `chaine.js` ni `boucle.js` sur le Xeon, ne
> touche ni à `code/` ni à `VERSION PRINCIPALE/`, et garde des traces de chaque décision pour le portfolio.

---

# L'état du 26/11/2026 à 17 h (gardé pour l'histoire)

> ⚠ **Périmé depuis le 27/11/2026** : « Ce qui tourne : rien », les deux commandes à lancer (la chaîne, l'agent voltige), « À faire ensuite » et le
> texte à coller de cette partie ne sont plus la voie suivie (voir le changement de cap, plus haut). Les chiffres du pilote et les défauts connus restent justes.

## Ce qui a changé le 26/11 (la demande de Sacha)

Sacha a regardé les bots : « ils conduisent bien mais ils sont encore trop frileux de s'envoler et de faire des figures dans les airs ; pour plus de
réalisme il faut qu'ils puissent utiliser toutes les figures du jeu ; parfois ils n'osent pas prendre des raccourcis évidents ». Puis : « lance une
enquête : tous les éléments à ajouter aux bots pour simuler de vrais joueurs ; objectif : on ne peut pas du tout faire la différence ».

**La boucle par tranches n'a donc PAS été relancée** : elle ne note que le palier médian, et partait d'un pilote qui ne vole pas exprès. La relancer
telle quelle dépenserait 12 € par jour à polir ce que Sacha vient de refuser. Elle repartira du pilote qui vole, avec une note « palier et ressemblance ».

| | État |
|---|---|
| **L'enquête** (`etude/realisme.md`, une session à part, 0 €) | **faite** : 26 écarts mesurés entre le pilote et les joueurs, classés ; le juge mis à l'épreuve (0,974 ; il resterait 0,965 même en corrigeant nitro, vols et figures) ; 28 parties à enregistrer par Sacha et 8 lignes à ajouter à l'enregistreur du jeu (sa décision) |
| **La voltige mesurée** (`ml/bot/voltige.js`) | **fait** : les vols un par un, joueurs et bots comptés pareil (`node voltige.js` : les joueurs ; `node voltige.js <note --parties>` : un bot) |
| **Le rayon « viser »** (`ml/bot/yeux.js`, README § 2 bis) | **fait** : le radar dit enfin si un raccourci se pose (en vol et depuis le bord), avec la loi à suivre (`vue.vol.cible`) et l'ordre `cible` |
| **Le garage** (`module.exports.garage`, README § 1) | **fait et essayé** : un pilote s'équipe de n'importe laquelle des 12 figures du jeu (une course : rodéo, chandelle et hélico lancés ; rejeu exact) ; la boucle fixe le garage comme la main |
| **Le pilote qui vole** (`ml/ecurie/pilote-voltige.js`) | **un premier palier, réglé le 26/11 après-midi** (détail et tableau : `ETAPES.md`, « L'étape C, deuxième temps ») — sur 20 courses de 900 s : palier médian **9,5**, record **21** (`pilote.js` : 11 et 20) ; **0,71 raccourci par minute** de 749 m (avant 0,24 ; les joueurs 3,49) ; **0,59 figure lancée par minute** (avant 0 ; joueurs 2,79) ; sous la dalle **14 %** du sol (avant 29 % ; joueurs 3 %) ; les plongeons voulus tuent 6 fois sur 100. **Le juge ne bouge pas : 0,97** (avant 0,974). `pilote.js` n'est pas remplacé |
| **Le dessous de la dalle** (soir du 26/11 ; `ETAPES.md`, « Le soir du 26/11 ») | **fait** : le pilote ne se cache plus sous la route — **2,3 %** du sol (avant 14 % ; joueurs 3 %), passages de 1,5 s (avant jusqu'à 66 s). Écart aux joueurs **2,02** (avant 2,54, borne passée de 4 à 8 : `pilote.js` 3,05). Coût sur le moment : palier médian 7 (avant 9,5) — le dessous était un abri ; **regagné en fin de soirée** en corrigeant la loi « vers la route » du pilote (elle lâchait le volant au-delà de 1,6 rad de l'axe et braquait avec 0,25 s de retard sur la main) : palier médian 8,5, record 19, 8,3 morts pour 100 vols (avant 12), écart 2,00. **Puis la nitro au sol (nuit du 26 au 27/11)** : 53 % du temps au lieu de 31 % (joueurs 64 %), qui ne coûte plus qu'un demi-palier depuis que les vols tuent moins — **état du pilote : palier médian 7,5, record 14, écart aux joueurs 1,67** (`pilote.js` 3,05), mixte −2,5. Essayés et écartés le même soir : coups de nitro en vol à l'aveugle (−3 paliers), nitro à la sortie, biais doux, pose plus tôt |
| Contrôles | `node ml/bot/verifier.js` **TOUT PASSE** (604 s, empreinte `a7b3171768ca`, après le dernier changement des yeux) ; `node ml/labo/rejouer.js --tout` : **34 rejeux exacts sur 34** (refaits le 26/11 à 17 h) |
| GitHub | la branche `bots-ecurie` est poussée (`origin/bots-ecurie`), pour le second PC de Sacha (Ryzen 5 3600, 12 fils : à installer, voir plus bas) — *au 27/11 au soir, le dernier commit (`7c5204afa`) n'est pas poussé : voir en tête* |

**Dépensé : 36,92 € sur 200** au 26/11 à 14 h 30 (0 € aujourd'hui). L'abonnement : 3 à 4 % de la semaine après cette session.

## Ce qui tourne : rien. Deux commandes prêtes, à lancer par Sacha (périmé le 27/11/2026 : la boucle a ensuite tourné sur le Ryzen, puis le cap a changé)

Une session Claude ne peut pas lancer elle-même ce qui dépense les crédits (l'app l'a refusé le 26/11 : c'est à Sacha de le déclencher), et un
programme lancé par un outil de session meurt avec elle. Depuis un **terminal ordinaire** :

**1. La boucle** (la chaîne des deux semaines, ≈ 12,5 € par jour, s'arrête seule au plafond de 200 € ou le 08/12) :

```powershell
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie; node chaine.js
```

Elle relit `agents/choix.json` à chaque tranche : Sonnet 5.5 écrit six variantes de `pilote-voltige.js` par tour, le vrai jeu les note, et la note est
maintenant **« mixte » = palier médian − 6 × écart aux joueurs** (`ml/bot/ressemblance.js`) ; étape du labo **C2**. Essayée à blanc le 26/11 (0 €).
Journal : `agents/chaine.log` ; arrêt : créer `agents/STOP`. Un tour prend 30 à 100 minutes de PC (6 variantes triées, les promues notées sur 20 graines).
Sur le second PC (Ryzen, 12 fils), ajouter `--coeurs 10` à la ligne de `boucle.js` dans `chaine.js` ou lancer `boucle.js` à la main.

**2. L'agent « voltige »** (facultatif, 12 $ au plus, une à trois heures ; pas en même temps que la boucle : ils se disputeraient le PC) :

```powershell
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie; node agent-api.js --consigne consignes-agents/voltige.md --nom voltige --modele claude-fable-5-2 --budget 12 --etape C
```

Sa tâche (`consignes-agents/voltige.md`) : ce que le réglage à la main n'a pas su faire — la nitro au bon endroit, la justesse des rayons `viser` du sol
à la grotte, au canyon et sur la jade, des vols plus hauts. Son rapport : `agents/<date>-voltige.md`.

## À faire ensuite, dans l'ordre (périmé le 27/11/2026 : remplacé par la liste du 27/11, en tête)

1. **Ce qui trahit encore le plus le pilote qui vole** (le juge, 20 courses) : le slalom (ondulation z +4 : un aller toutes les 1,0 s sur 17 m, les
   joueurs 0,55 s sur 9 m — c'est la main et la ligne visée), la **nitro** (30 % du temps contre 63 %), la part du temps en l'air (17 % contre 28 %),
   la hauteur des vols (4 m contre 38 m : les joueurs s'envolent nitro allumée et montent). Puis rouvrir la grotte, le canyon et la jade aux sorties
   voulues (il faut d'abord mesurer la justesse des rayons `viser` du sol : `justesse.js` ne les tire pas). Si l'agent voltige a tourné : lire son
   rapport et refaire ses chiffres (`cd ml/ecurie/agents/tmp-voltige; node lot.js ../../pilote-voltige.js --graines 12 --tmax 300 --coeurs 6 --nom controle` ;
   repères sur ces 12 graines : `pilote.js` médian 12,5, la version du 26/11 9,5 à 10,5 ; sur 12 graines neuves `--depart 930000` : 7 et 6,5 à 7,5).
2. **Le juge** (`ml/bot/discerner.js`) : lui ajouter les mesures de l'enquête (§ 3 de `realisme.md` : le dessous de la dalle, la durée d'un aller du slalom,
   le volant en vol, les allumages de nitro en vol, la pose…), un juge « à l'instant » et un juge « du compte ». Sans lui la boucle ne voit aucun progrès de ressemblance.
3. **La boucle** : sa note « palier et ressemblance » est faite (`--critere mixte`), `CONSIGNES.md` aussi. Quand elle a tourné : lire `agents/chaine.log`,
   `node ml/labo/labo.js` (étape C2), l'arbre ; un champion sacré se mesure par `node ml/bot/ressemblance.js` et `voltige.js` sur une note `--parties`.
   Si le poids 6 fait trop baisser le palier (ou pas assez monter la ressemblance), le changer dans `agents/choix.json` (`poids`).
4. **Le plan d'action de l'enquête** (§ 4 de `realisme.md`), dans son ordre : sortir du dessous de la dalle (29 % du sol contre 3 %), s'envoler nitro
   allumée, tapoter la nitro en vol, viser le portail en vol, le départ, la seconde chance (`chance.prend` de 1 à 0,3 : c'est la main, donc l'étape D),
   la nitro au sol, le rythme du slalom.
5. **Les garages par niveau** (étape D) : un bot du palier 5 a les figures du débutant, un bot du palier 25 des figures chères ; à tirer par bot.
6. Étapes D, E, F (`ETAPES.md`).

## Ce que Sacha peut faire

- **Enregistrer des parties** : la liste est dans `etude/realisme.md` § 5 (28 parties : 6 normales, 4 « voltige », 4 « prudent », 4 avec d'autres figures
  équipées, 6 de Léo au doigt, 4 d'un vrai débutant). ⚠ L'enquête recommande d'ajouter **d'abord** 8 lignes à l'enregistreur du jeu (les touches ↑ ↓,
  la jauge de nitro, le verdict des poses, la frénésie, la graine de la piste…) : sans elles, les nouvelles parties auront les mêmes trous. C'est une
  modification du jeu : **à décider par Sacha**. Exporter toutes les 4 ou 5 parties (l'enregistreur n'en garde que 8).
- **Un deuxième PC** : les simulations tournent sur le processeur de ce PC (8 cœurs), pas chez Claude, et une carte graphique n'y change rien. Un autre
  PC avec beaucoup de cœurs, Node.js et une copie du dépôt doublerait la cadence ; rien n'est encore écrit pour répartir les courses.

## Comment le travail se paie — la règle de Sacha

**Le travail lourd se paie sur la clé d'API, jamais sur l'abonnement** (le 25/11 un workflow de 152 agents a vidé l'abonnement : à ne pas refaire).
`agent-api.js` (une session sans écran, la clé seulement, coût au journal, plafond de 200 €), `chaine.js`, `relais.js`, `apres.js`,
`consignes-agents/`. La clé : `setx` par Sacha ; ne jamais l'afficher. Le 26/11 Sacha a ajouté : « gère bien ta consommation de l'abonnement et des
crédits API pour que ça dure toute la semaine ». Le rythme : ce qui reste des 200 € partagé entre les jours jusqu'au 08/12 (≈ 12,5 € par jour).

## Défauts connus

- `pilote-voltige.js` : la grotte, le canyon et la jade sont interdits aux sorties voulues (l'annonce du rayon du sol y est fausse : 4 sorties sur 4
  contre la roche à la grotte, 3 sur 4 ratées sur la jade) alors que les joueurs y coupent 4 à 5 fois par minute ; les figures restent rares parce
  qu'une figure lancée à moins de 2,2 s de la pose dérègle le plongeon. Depuis le soir du 26/11 il ne se cache plus sous la dalle (2,3 % du sol) mais
  a regagné les paliers perdus en volant mieux (palier médian 8,5). **10 de ses 20 morts arrivent dans la seconde qui suit une sortie de route, contre
  le décor** (la grotte : 20 % des vols) : pose trop en travers, ou zigzag au sol qui s'amplifie vers 550 km/h — le prochain chantier. Mesuré la nuit du 26 au 27/11 :
  la pose du pilote glisse à 0,33 rad de l'axe (les joueurs 0,13), 36 % de ses poses ressortent dans les 0,8 s ; trois remèdes « de pilote » essayés
  et écartés (avance au sol, redressement au-dessus de la dalle, plané réacteur tenu). **La suite passe par les yeux** : des rayons qui jouent la loi
  corrigée du pilote et un allumage bref de la nitro (`yeux.js`, puis `verifier.js` et `justesse.js`) — alors seulement la nitro en vol des joueurs
  (2,6 allumages par vol) et des poses droites.
- La justesse des rayons « viser » n'est pas mesurée par `justesse.js` ; la salle de projection ne remet pas encore le garage d'un rejeu (`page.html`).
- Fable 5.2 coupé à 32 000 jetons dans `boucle.js` (`max_tokens`) ; la seconde chance prise 7 fois sur 12 (joueurs 2 sur 14) ; le canyon tue toujours.

## Pour voir et tester

- **Les vols des joueurs et d'un bot** : `cd ml\bot; node voltige.js --vols` ; `node voltige.js <note faite avec --parties> --nom x`.
- **Une course racontée vol par vol** : `cd ml\ecurie\agents\tmp-voltige; node essai.js ..\..\pilote-voltige.js --graine 910074 --tmax 150 --detail`.
- **Les bots jouer, avec l'image** : `cd ml\labo; node projection.js`, puis http://localhost:3161/ . L'arbre : http://localhost:3161/labo/arbre.html .
- **L'enquête** : `ml/ecurie/etude/realisme.md`. Les comptes rendus : `ml/ecurie/comptes-rendus/`. Le portfolio : `ml/ecurie/portfolio/index.html`.

## Le texte à coller dans la session qui reprend (périmé le 27/11/2026 : prendre celui du 27/11, en tête)

> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/PASSATION.md`, `ml/ecurie/etude/realisme.md` puis `ml/ecurie/ETAPES.md`. Lis le rapport de l'agent voltige (`ml/ecurie/agents/*-voltige.md`), contrôle ses chiffres, puis suis « À faire ensuite » de la passation. Fais payer tout travail lourd par la clé d'API (`agent-api.js`), jamais par mon abonnement, sans dépasser 200 € au total d'ici le 08/12, et à chaque fin de contexte prépare un compte rendu esthétique et testable. Ne me pose pas de question.
