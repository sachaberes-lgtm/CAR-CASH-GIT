# Note de l'intégrateur du réglage (28/11/2026) : la mesure de τ branchée, les trois lots ensemble

Pour la session principale, puis pour Sacha. Les trois lots (« sacre », « règles », « tau ») sont décrits dans leurs notes (`notes/sacre.md`,
`notes/regles.md`, `notes/tau.md`, relectures comprises) ; le contrat est `INTERFACES.md` § 11 ; la livraison et les gestes sur le Ryzen :
`notes/LIVRAISON-REGLAGE.md`. **Rien n'est commité ni poussé.** Le jeu ne change pas ; `modele.js`, `enfant.js`, `config.json « reseaux »`, `ml/bot/`,
`ml/reel/`, `ml/labo/`, `pilote-voltige.js` et le coffre de l'étude ne sont pas touchés.

## En mots simples (pour Sacha)

- Les pages de la sélection posent maintenant la question dont tout dépend : **« Les mutations comptent-elles ? »** Un enfant « bon » l'est-il vraiment,
  ou seulement chanceux ? La sélection le mesure seule, sans jouer une course de plus. Pendant une trentaine de générations, la réponse sera
  « trop tôt pour le dire (N enfants mesurés sur 191) ». C'est normal.
- Où la lire : le tableau (section « 1 bis », juste après le coffre, avec une barre qui avance), le récit (un paragraphe après « Où on en est ») et la
  dernière ligne de `etat/resume.txt`. `node ml\evolution\etat.js` garde ses 10 lignes.
- Quand elle sortira de « trop tôt », **c'est ce premier verdict qui compte** : le chiffre est recalculé chaque génération, et à force de le regarder
  il finirait par se tromper une fois de temps en temps.

## Ce qui a changé (l'intégrateur)

| fichier | changement |
|---|---|
| `etat.js` | `mesureTau(cfg, o?)` : appelle `mesure-tau.mesurer` (400 tirages) dans un `try`, « trop tôt » par défaut ; ne lit rien au-delà de 100 Mo de `courses-*.jsonl` (`TAU_MAX_OCTETS` : le tableau est refait dans le processus de la sélection) ; `o.tau` = une mesure déjà faite. `tauLigne(x)` : la ligne ASCII de resume.txt (118 colonnes). `resumeComplet(cfg, o?)` : les 10 lignes, une vide, la ligne de τ. `resume` et la ligne de commande inchangés (10 lignes). |
| `tableau.js` | La section « 1 bis. Les mutations comptent-elles ? » (après le coffre ; les 7 sections numérotées restent dans leur ordre) : la phrase, une barre enfants mesurés / requis (CSS, aucun script), r et τ avec intervalles, les courses pour rien, le détail `MT.lignes` en petit ; dans un `try` (une erreur rend « Trop tôt pour le dire »). `ecrire` fait la mesure **une fois** et la passe à la page, à resume.txt (`resumeComplet`) et au récit. |
| `histoire.js` | `## Les mutations comptent-elles ?` après « Où on en est » : `paragrapheTau` (ne lève jamais ; « trop tôt » par défaut) ; dit que le premier verdict sorti de « trop tôt » compte (le conseil du relecteur du lot « tau »). |
| `tests/tableau.test.js` | resume.txt = les 10 lignes + une vide + « Mutations comptent-elles ? » (ASCII, ≤ 118) ; la section 1 bis et le paragraphe du récit présents ; une mesure qui **lève** (mesure-tau.mesurer remplacé par une panne) ne fait échouer ni le tableau, ni resume.txt, ni le récit. 72 contrôles (69 avant). |
| `INTERFACES.md` | § 11 (neuf) ; corrigés : § 2.6 (comparer : seuilB/seuilC), § 2.8, § 2.9, § 2.10 (`protectionCourses` 6 de l'essai barré), § 3.1 (ordreCourses, graines.entrainement.suite, auBout, validation.*, maledictionSeuil, alarmeDistance 0,011), § 3.4 (`graines.blocs`), § 3.6 (renvoi au format séquentiel), § 6.1 (étapes 3 et 5 : l'ordre des demandes et le tri des lignes ; la phrase fausse « population.json n'est pas réécrite en fin de génération »), § 6.4 (24 graines → séquentiel ; l'alarme), § 9.3 (0,011). La contradiction C7 était déjà corrigée au § 9.3 par le lot « règles » : le § 11.6 le redit. |
| `README.md` | « Le réglage de la sélection » (en mots simples : ce qui change pour Sacha, la décision D1 qui reste à lui) ; la 11e ligne de resume.txt ; la ligne 8 (le regard) ; « 1 bis » dans le tableau ; une ligne dans « Si ça s'arrête » (graines épuisées) ; `mesure-tau.js` et `LIVRAISON-REGLAGE.md` dans les fichiers. |
| `tests/etat-e93ff5cb5/` (neuf) | Un état écrit par le **code exact du Ryzen** (commit e93ff5cb5, `git worktree` hors du dépôt, retiré ensuite) : config-essai, 2 générations de vraies courses puis `--valider-maintenant` (une ligne de validation d'avant) ; population.json, les quatre journaux et le fichier de courses (37 Ko), sans pilotes générés ni pages. Relu : ni chemin, ni nom de PC, ni adresse. |
| `tests/generation.test.js` | « compatibilité » : aussi sur `tests/etat-e93ff5cb5` (tel quel et réserve d'avant vidée). |
| `tests/validation-sequentielle.test.js` | V8 : lit aussi `tests/etat-v2-ancien` et `tests/etat-e93ff5cb5` (gardés dans git, indépendants de `essais/`), contrôle la ligne de τ de resume.txt, et ne juge que les lignes de validation **d'avant** (sans `regards`) : il échouait dès qu'`evoluer.test.js` avait écrit une validation séquentielle dans `essais/tests-evoluer`. |
| `notes/LIVRAISON-REGLAGE.md`, cette note | neuves. |

`sauver-traces.cmd` : **rien à changer**. Il lance `node ml\evolution\tableau.js` (qui refait tableau.html, resume.txt, arbre.html et histoire.md, la mesure
comprise) puis ajoute ces quatre fichiers (ligne `for %%f in (arbre.html histoire.md tableau.html resume.txt)`). La mesure ne crée aucun fichier.

## Le format nouveau : la ligne de resume.txt (exemple réel, une copie de l'état du 27/11)

```
Gen. 1 : 0 course(s) non mesuree(s) sur 312 (0.0 %), 0 panne(s) de cerveau
Alertes : aucune

Mutations comptent-elles ? trop tot pour le dire (19 enfants mesures sur 191) ; r -0.13, tau 0.00 [0.00 ; 0.92]
```
(Les « courses pour rien 12 % » ne s'ajoutent que si la ligne tient dans 118 colonnes : ici non.) Le paragraphe du récit, sur la même copie :
« **Aujourd'hui : trop tôt pour le dire (19 enfants mesurés sur 191).** La mesure ne conclut pas avant 191 enfants mesurés, même si les chiffres ont
l'air nets. Corrélation entre les deux moitiés : −0,13 [entre −0,53 et 0,49] ; écart vrai entre enfants τ ≈ 0,00 palier [entre 0,00 et 0,92].
Courses jouées pour rien … : 62 sur 528 (12 %), 5,1 % du temps d'entraînement. »

## Les vérifications

Voir `notes/LIVRAISON-REGLAGE.md` § 2 (les tests, la reprise d'un état écrit par e93ff5cb5, l'essai de 4 générations) : c'est le même compte rendu.

## Ce qui reste, ce que je n'ai pas vérifié

- **Le premier verdict n'est pas gardé.** Les pages disent le verdict du jour et rappellent que le premier sorti de « trop tôt » compte, mais rien
  n'écrit ce premier verdict quelque part (il faudrait une clé `tau` dans la ligne de `generations.jsonl`, écrite par `evoluer.js`, ou un petit journal) :
  pas fait, pour ne pas toucher aux lignes que les tests de reprise comparent ; c'est une décision de méthode (relecture du lot « tau »).
- Au-delà de 100 Mo de journaux de courses (quelques mois sur le Ryzen), les pages ne mesurent plus τ et le disent ; la mesure aura répondu bien avant
  (191 enfants ≈ 32 générations ≈ 10 000 lignes ≈ 11 Mo). Le coût : 59 ms pour la mesure sur la copie du 27/11 (552 lignes), 0,4 s pour tout le tableau ; `notes/tau.md` : 0,6 s sans tirages et 2,4 s à 1 000 tirages pour 47 000 lignes (15 Mo).
- Le seuil d'`alarmeDistance` indépendant du nombre de gènes (lot « règles ») : pas branché.
