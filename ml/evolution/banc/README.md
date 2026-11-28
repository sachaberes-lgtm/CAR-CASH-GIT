# Le banc des gènes v2 (28/11/2026)

## En une minute

**À quoi il sert.** Le pilote de la sélection porte des « interrupteurs », éteints à la naissance : chacun est une idée de conduite (garder la
nitro avant une sortie, lâcher le volant pour mieux se poser, des secours en vol…). Une course est si capricieuse qu'une seule ne dit rien. Le banc
répond à une question simple : **cette idée, allumée, change-t-elle quelque chose, et dans quel sens ?**

**Comment il fait.**
1. Une **vague** compare 1 à 5 idées (des « bras ») au pilote de départ (le « témoin », c0025), sur les **mêmes courses** (mêmes graines).
2. Avant de jouer, la vague **écrit sa question et, pour chaque bras, ce qu'elle va regarder** (le critère : le palier, la survie, un type de mort…).
   On ne change plus d'avis ensuite : le banc refuse une vague modifiée.
3. Elle regarde après 24 graines, puis toutes les 24, jusqu'à 192. Un bras **s'arrête dès que c'est clair** (« net »), s'il ne change presque
   aucune course (« trop rare »), s'il ne montre rien (« futilité ») ou au bout (« plafond »).
4. Les règles d'arrêt sont faites pour que, si aucune idée ne fait rien, le banc se trompe (un faux « net ») **moins de 5 fois sur 100 par vague**.
   C'est vérifié sur 2 000 vagues simulées (4,2 %).

**Ce qu'un résultat veut dire.**
- **« NET : aide »** = un **candidat**, pas une preuve. Il faut une **seconde vague**, sur des graines neuves, avec ce seul bras et un nombre fixe de
  graines (une « confirmation »). C'est la leçon du coffre : un « +2 paliers » sur des graines rejouées était la chance du gagnant.
- **« rien de net »** ne veut pas dire « ne fait rien » : à 192 graines, le banc voit un effet d'environ un palier 3 fois sur 4.
- **« trop rare »** : l'idée ne change presque aucune course sur ces maps. Essayer une vague sur une map où elle agit (par exemple la grotte).
- Le banc **n'allume jamais rien lui-même** et ne touche pas à la sélection. C'est toi qui décides.

## Lancer une vague

    node ml/evolution/banc/banc.js --vague ml/evolution/banc/vagues/v001-maps-a-decor

- **Vérifier sans jouer** : ajouter `--verifier` (fabrique les pilotes, calcule le plan, écrit `plan.json`, aucune course).
- **Courses à la fois** : `--travailleurs 2` (le défaut). ⚠ Pas de banc sur le Ryzen pendant que la sélection y tourne (la charge fait des pannes).
- **Arrêter** : créer un fichier vide `ml/evolution/banc/etat/STOP`, ou Ctrl+C. **Reprendre** : relancer la même commande (les courses déjà jouées
  viennent du cache, rien n'est rejoué ; les décisions sont les mêmes).
- **Relire le résumé** : `--resume`.

Codes de sortie : 0 fini ; 1 une entrée mal écrite ; 2 une course a mal tourné (yeux changés, erreur du cerveau, carte non appliquée, plus de
10 % de courses non mesurées) : rien n'est conclu ; 3 interrompue (relancer) ; 4 quelque chose a changé depuis le départ (la vague, le code du jeu ou du
pilote, la note) : refaire la vague sous un autre numéro ; 5 un autre banc tourne déjà.

## Écrire une vague

Un dossier `vagues/<nom>/` avec un fichier `vague.json` :

```json
{ "format": "banc-vague-1",
  "numero": 1,
  "nom": "v001-maps-a-decor",
  "question": "Les gènes A des maps à décor font-ils moins mourir à la grotte ?",
  "temoin": "c0025",
  "tmax": 900,
  "carte": "grotte",
  "fixes": {},
  "plan": { "premier": 24, "pas": 24, "plafond": 192, "alpha": 0.05, "futilite": 0.5, "fMin": 0.1 },
  "bras": [
    { "nom": "sortie",  "critere": { "type": "causes", "famille": ["roche", "paroi", "pic", "glace"], "sens": "bas" } },
    { "nom": "rien",    "critere": { "type": "mesure", "cle": "poseCentre", "sens": "haut" } },
    { "nom": "secours", "critere": { "type": "causes", "famille": ["air", "vide"], "sens": "bas" } } ] }
```

- **`numero`** : de 1 à 50 000, **jamais deux fois le même** (il fixe les graines de la vague ; `vagues/INDEX.md` tient la liste des numéros pris,
  même si un dossier est effacé). Le numéro **0** est l'essai `v000-essai` : hors de git, jamais conclu.
- **`carte`** : `null` (la graine tire les maps) ou une map de départ imposée (nuages, ville, jade, espace, grotte, canyon). Seule **la première map**
  est imposée : le jeu tire les suivantes.
- **`fixes`** : des gènes posés chez le témoin **et** chez tous les bras (le seul endroit où la seconde chance, `chancePalierMin`, peut changer).
- **`bras`** : des noms du catalogue `bras.json` (chaque bras y dit pourquoi il existe et quels gènes il change).
- **`critere`** : `palier`, `F`, `E` (la note de la sélection), `mesure` + `cle` (une des 15 mesures des joueurs), `causes` + `famille` (le nombre de
  morts de ces causes, toutes les morts de la partie comptées), `survie`, `vols` ; `sens` : `haut` (plus = mieux) ou `bas`.
  **Un compteur n'est jamais un critère** : chez le témoin l'idée est éteinte, son compteur vaut 0, le bras « gagnerait » par construction.
  Les compteurs (combien de fois chaque idée a vraiment agi) sont dans les mesures secondaires.

## Ce que le banc écrit (dans le dossier de la vague)

| fichier | ce qu'il dit |
|---|---|
| `plan.json` | la vague telle qu'au départ : les pilotes (leur identifiant), le plan, les graines, l'époque ; la reprise compare tout à lui |
| `regards.json` | chaque regard : pour chaque bras, les graines lues, la part de courses changées, l'écart, sa décision |
| `resume.txt` | **pour toi** : pendant la vague, seulement l'avancement (aucun chiffre : on ne conclut rien d'une lecture en cours) ; à la fin, une ligne par bras, ce qu'on peut dire et ce qu'on ne peut pas dire |
| `resultat.json` | les verdicts, l'écart au premier regard (l'écart à l'arrêt est gonflé par l'arrêt tôt), les mesures secondaires (« ne décident rien ») |
| `journal.md` | le portfolio : la question, les bras et pourquoi, le plan et ses nombres, chaque regard, les verdicts, le coût |

Et `vagues/INDEX.md` : une ligne par vague conclue, les numéros pris, et le nombre de faux « net » qu'on attend par hasard sur toutes les vagues
(5 % par vague : sur 10 vagues, environ un demi).

Les vagues vont dans git (elles sont légères) ; `etat/` (le cache des courses) jamais.

## Les détails (pour qui relit le code)

- Le contrat : `ml/evolution/notes/genes-v4.md` § 6 et § 8.4. Les fichiers : `banc.js` (la ligne de commande, la boucle des regards `derouler`, le
  résultat), `plan.js` (le plan, la constante d'O'Brien-Fleming, la décision, les graines), `criteres.js`, `bras.js`, `rapport.js`.
- **La règle** : à chaque regard, `z = d / se` sur les graines mesurées chez le bras et chez le témoin (`m`) ; arrêt « net » si `|z| ≥ c × √(plafond / m)` ;
  puis « rare » au 1er regard si la part de courses changées est sous `fMin` ; puis « futilité » dès le 2e si `|z| < futilite` ; puis « plafond ».
  `c` : la constante d'O'Brien-Fleming au risque `alpha / k` (Bonferroni sur les `k` bras), par simulation de la marche aléatoire aux temps des
  regards (200 000 chemins, `mulberry32(20261128)`, dichotomie à 40 pas). Pour 24/24/192 et 5 bras : 2,645.
- **« Identique »** = mêmes `empreinte` et `empreinteTouches` (pas `empreinteVues` : un bras qui demande des lois aux yeux a d'autres vues même sans
  conduire autrement).
- **Les graines** : `4 000 000 + 37 × (1 000 × (numero − 1) + i)`. Le reste modulo 37 vaut 4 ; aucune autre plage (entraînement 22, validation 1,
  repli 25, coffre 28, banc d'étude 3, mesures du 27/11 5) ne l'a : aucune graine commune, quelle que soit la longueur des plages.
- **Les mesures du banc** (`tests/banc.test.js`, sans course, une dizaine de secondes) : faux « net » 4,2 % sur 2 000 vagues de 5 bras sans effet
  (102 graines par bras en moyenne) ; un effet de 0,25 écart-type par graine trouvé 74 % des fois (137 graines en moyenne) ; la reprise après un
  arrêt au milieu d'un paquet rend le même résultat.
- Le banc d'étude d'avant (`ml/ecurie/etude/banc-des-genes/`) reste tel quel ; le v2 en reprend la façon de jouer (l'ordonnanceur de
  `courses.js`, un dossier d'état à lui, le verrou, STOP, les courses graine par graine) et compte comme le contrat le dit pour le reste.
