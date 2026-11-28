# Les greffes (28/11/2026) : la sélection essaie elle-même des interrupteurs sur son champion

Rien n'est commité. `config.json` n'est pas touché : **sans la clé `greffes`, la sélection fait exactement ce qu'elle faisait avant**,
au bit près (vérifié en vraies courses, voir plus bas). Un essai réel de 5 générations avec des greffes a tourné sur ce PC (pas sur le Ryzen).

## Pour Sacha, en mots simples

**Le problème.** Le banc des gènes (`ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md`, « Le résultat ») a montré que deux interrupteurs,
`bordOn` (décoller nitro allumée quand le bord de la route arrive, un apport de c0064) et `slalomOn` (les petits zigzags rapides sur la route), rendent le pilote **nettement plus proche des vrais
joueurs**. Il n'a pas su dire s'ils le font aller plus loin. Pour le savoir, il faut que la sélection les essaie. Mais aujourd'hui, une
naissance n'allume un interrupteur donné qu'une fois sur 33 environ, et sur un parent tiré au hasard : il peut se passer des semaines avant
que le champion essaie `bordOn`.

**L'idée.** À chaque génération naît un « immigré » : une copie très changée du champion (8 réglages bougés d'un coup), pour apporter du
neuf. Avec les greffes, cette place est donnée **une fois sur deux, sur trois, sur cinq…** (selon le nombre d'essais demandés) à une
**greffe** : une copie **exacte** du champion du moment, sur laquelle on allume seulement les interrupteurs demandés. Rien d'autre ne
change. L'enfant greffé court ensuite comme tous les autres : s'il fait mieux, il reste, devient parent, et peut être sacré ; sinon il est
renvoyé. On compare ainsi, de façon régulière, « le champion » et « le champion + bordOn ».

**Ce que ça ne fait pas.** Une greffe ne force rien sur le champion lui-même, et ne décide de rien : c'est la sélection (la note, puis la
validation sur des courses neuves) qui juge, comme pour n'importe quel enfant.

## Comment l'allumer

Dans `ml/evolution/config.json` (sélection **arrêtée**), ajouter une ligne, par exemple :

```
"greffes": [ {"bordOn":1}, {"slalomOn":1}, {"bordOn":1,"slalomOn":1}, {"bordOn":1,"suitOn":1,"fuirVite":1} ],
```

Chaque `{…}` est un **essai** : les gènes écrits dedans sont forcés à la valeur écrite. Puis relancer `lancer.cmd`.
Pour éteindre : retirer la ligne (ou écrire `"greffes": []`). Rien n'est perdu ni rejoué.

Une config mal écrite est **refusée au lancement**, avant toute course (même avant le banc d'un PC neuf), avec une phrase qui dit quoi
corriger, et le code de sortie 1 (comme une config illisible). Sont refusés :

- un gène qui n'existe pas (faute de frappe) ;
- un réglage à virgule (`bordNitro`, `slalomCap`…) ou une tête de neurones (`WV`, `WS`) : seuls les **interrupteurs** (0 ou 1), les
  **choix** (`dessousDecor` : 0, 1, 2) et les **nombres entiers** (`figMax`, `largeMax`) se greffent ;
- une valeur hors de ses bornes (`"bordOn":2`), à virgule (`1.5`) ou entre guillemets (`"1"`) ;
- un essai vide `{}`, ou une valeur qui n'est pas une liste ;
- un gène marqué « figé » dans `genome.js` (`fige:true` ; aucun ne l'est aujourd'hui, le lot `genes-v4` en ajoutera).

## La règle exacte

- `n` = le nombre d'essais de la liste. Le cycle a `n + 1` places : les `n` essais, puis l'immigré ordinaire.
- À la génération `G` (à partir de 1), l'immigré numéro `k` (il y en a `immigres` par génération, 1 aujourd'hui) a le rang
  `((G − 1) × immigres + k) mod (n + 1)`. Rang < `n` : la greffe de l'essai de ce rang. Rang = `n` : l'immigré ordinaire.
  Avec les 4 essais de l'exemple et 1 immigré : G1 `bordOn`, G2 `slalomOn`, G3 les deux, G4 les trois, G5 l'immigré ordinaire,
  G6 `bordOn` de nouveau, etc. Chaque essai revient toutes les 5 générations, sur le champion **du moment**.
- La greffe = le génome du champion, copié (le champion n'est jamais modifié), avec les gènes de l'essai mis à leur valeur. Elle ne tire
  **aucun nombre au hasard** : les autres naissances de la génération sont exactement celles qu'on aurait eues sans immigré.
- Si le champion porte **déjà** toutes ces valeurs (par exemple il a déjà `bordOn` allumé), ou si cette copie existe déjà (née plus tôt) :
  on fait en plus une petite mutation ordinaire de la greffe, puis on remet les valeurs de l'essai (une mutation peut avoir éteint un
  interrupteur). Si l'enfant est encore un pilote déjà vu, on recommence comme pour n'importe quelle naissance (jusqu'à `essaisDoublon`,
  20 fois), en remettant chaque fois les valeurs de l'essai ; au bout, l'enfant est abandonné, comme avant.
- L'enfant garde l'origine **immigré** (les pages ne connaissent pas d'autre origine) et porte un champ de plus, `greffe: {"bordOn":1}`,
  dans `population.json` (les vivants et `naissancesGeneration`) et donc dans la ligne de la génération de `generations.jsonl`.
  Ce qui a changé par rapport au champion (`mutes`) contient les gènes greffés qui étaient différents chez lui.
- Le journal le dit : `generation 12 : 6 naissance(s) (3f9a0c1d2e4b immigre greffe bordOn=1 + slalomOn=1, …)`, et un événement
  `greffe bordOn=1 + slalomOn=1 : 3f9a0c1d2e4b ne du champion c0ffee123456 (aucune autre mutation)`.
- Le récit (`etat/histoire.md`) dit « Dont 1 né par greffe (le champion du moment, recopié avec des interrupteurs forcés) : … » et
  traduit l'événement en phrase.
- Rien de cela n'entre dans une époque : allumer ou éteindre les greffes ne fait repartir aucune note de zéro.
- **Un arrêt au milieu d'une génération** (STOP, coupure) : à la relance, la génération reprend avec les mêmes enfants (ils sont déjà
  écrits dans `population.json`) et l'événement de la greffe est redit, pour que la ligne de `generations.jsonl` le garde (avant la
  relecture, il se perdait : les événements des naissances ne vivent qu'en mémoire jusqu'à la fin de la génération). Seul détail perdu :
  le nombre de remutations d'une greffe qui retombait sur un pilote déjà vu (il n'est écrit nulle part).
- **Changer la liste entre deux lancements** (en ajouter, en retirer, la réordonner) : le cycle ne dépend que du numéro de génération et
  de la longueur de la liste, rien n'est gardé dans l'état. La génération suivante prend simplement l'essai qui tombe à son rang dans la
  nouvelle liste : un essai peut être sauté ou venir deux fois de suite, rien ne casse, rien n'est rejoué. Une génération déjà commencée
  garde les enfants déjà nés. C'est acceptable : la liste est un réglage, pas une mémoire.
- **`"immigres": 0`** avec des greffes : aucune greffe ne naît jamais (elles prennent la place de l'immigré). Le lancement le dit :
  `greffes : la config en demande, mais "immigres" vaut 0 : aucune greffe ne sera faite`.

## Les fichiers

| Fichier | Quoi |
|---|---|
| `greffes.js` (nouveau) | La lecture et le contrôle de `"greffes"`, le cycle, la greffe elle-même. Des fonctions pures : aucun tirage, aucune écriture. |
| `evoluer.js` | `naissances()` : la place de l'immigré suit le cycle ; le champ `greffe`, le journal, l'événement (`texteGreffe`, redit par `generation()` à la reprise d'une génération interrompue). Le contrôle de la config au lancement (`principal`, avant le banc) et dans `charger`. Un avertissement si des greffes sont demandées avec `immigres` à 0. `naissances` et `generation0` sont exportées pour le test. |
| `histoire.js` | La phrase « né par greffe » et l'événement en clair. Sans greffe, le récit est identique. |
| `tests/greffes.test.js` (nouveau) | 70 contrôles, environ 45 s, aucune course. |

## Ce qui a été vérifié

- `node ml/evolution/tests/greffes.test.js` : **70 / 70**.
  - La validation : chaque refus ci-dessus (gène inconnu, `__proto__`, réel, tête, hors bornes pour un interrupteur, un choix et un
    entier, non entier, texte, essai vide, élément qui n'est pas un objet, liste qui n'en est pas une), un gène figé simulé (une copie
    des bornes où `bordOn` porte `fige:true`), et la ligne de commande : `evoluer.js` avec une config fautive sort avec le code 1, le
    message, et sans avoir créé de dossier d'état.
  - Le cycle : les rangs de G = 1 à 12 avec 0, 1 et 4 essais, pour 1 et 2 immigrés par génération, comparés à une table écrite à la main.
  - La greffe : le champion n'est pas modifié, les valeurs sont forcées, le reste est identique, l'identifiant change, le génome est valide.
  - `naissances()` avec une greffe : l'enfant = le champion + les gènes forcés exactement ; `mutes` = les gènes greffés ; le champ
    `greffe` dans les vivants, `naissancesGeneration` et le `population.json` écrit ; le journal et l'événement ; **aucun tirage consommé**
    (les 5 autres enfants et l'état du générateur sont ceux d'une génération sans immigré) ; à la génération suivante, avec un seul essai,
    l'immigré ordinaire revient.
  - La voie de repli, 120 fois (un champion qui porte déjà quatre interrupteurs, 120 états du générateur) : les valeurs tiennent à chaque
    fois, l'identifiant est neuf, le génome est valide, une mutation a eu lieu. Et une copie déjà vue : identifiant neuf, valeurs tenues.
  - **La non-régression** : `evoluer.js` du commit `46842ee77` (lu par `git show`, chargé à part) et le nouveau, sur la même population
    de départ (20 pilotes, la config réelle), 6 générations de naissances enchaînées avec des courses fabriquées et un changement de
    champion à la génération 3, avec `greffes` absente, `null` et `[]`, et avec 1 puis 2 immigrés : même `population.json` à l'octet près,
    mêmes lignes de journal, mêmes événements, même état du générateur, et la même génération 0. Le contrôle a été « essayé à l'envers » :
    avec une vraie greffe, il voit bien la différence.
- Les pages sur un état d'exemple (`tests/etat-exemple` recopié, avec des naissances greffées ajoutées à la main) : `tableau.js`,
  `arbre.js` et `histoire.js` tournent ; l'arbre et `resume.txt` sont identiques à ceux de l'état sans greffe ; le tableau ne diffère que
  par la ligne de l'événement ; le récit ne diffère que par les phrases de greffe (génération finie et génération en cours).
- Les suites rapides existantes, relancées une par une avec le code final (`node ml/evolution/tests/<nom>.test.js`), toutes code 0 :
  generation 16/16, machine-relecture 19/19, machine 45/45, mesure-tau 75/75, node-epoque 14/14, portage 11/11, robustesse 8/8,
  validation-sequentielle 25/25, tableau 72/72, relecture-traces 95/95, traces 87/87, integration 29/29, lanceurs 76/76, commun 16/16,
  graines 13/13.

### En vraies courses (28/11/2026, le relecteur ; sur ce PC, 2 courses à la fois, `config-essai.json` : 4 pilotes, 2 naissances, 3 routes de 60 s)

Les états d'essai sont dans le dossier temporaire de la session, jamais dans `ml/evolution/etat`. Commandes (depuis la racine du dépôt) :
`node ml/evolution/evoluer.js --config <cfg>.json --etat <dossier> --travailleurs 2 --arret-apres N`, où `<cfg>.json` est
`config-essai.json` sans ses `_notes` (et, pour les greffes, avec `"greffes": [{"bordOn":1},{"slalomOn":1},{"bordOn":1,"slalomOn":1}]`).
Le code d'avant est `git show 46842ee77:ml/evolution/evoluer.js`, recopié dans le dossier temporaire avec ses `require('./…')` et son
`__dirname` rendus absolus (il lit donc les mêmes `genome.js`, `courses.js`… que le nouveau). Comparaison par un petit script qui
relit chaque fichier d'état en retirant dates et durées.

1. **Sans la clé, au bit près comme avant.** Trois générations (0, 1, 2 ; 56 courses) avec le code de `46842ee77` puis avec le nouveau, sur
   deux états vides : `population.json`, `generations.jsonl` (3 lignes), `courses-*.jsonl` (56 lignes), `morts.jsonl` (4),
   `validations.jsonl`, `coffre.jsonl` identiques hors dates et durées ; les 8 textes de `pilotes/` identiques à l'octet ; mêmes
   identifiants (`7c2a21d1ab10` immigré et `509f4f72ef7e` en G1, `5bea018c29fd` et `5b1f002bb50f` en G2), même générateur
   (3453687662). Le journal ne diffère que par l'ordre d'arrivée de deux courses jouées en même temps ; les pages (`tableau.html`,
   `arbre.html`, `histoire.md`, `resume.txt`) ne diffèrent que par les heures, les durées et le débit. (Ce passage a été fait avant les
   deux retouches du relecteur ; elles ne touchent que des lignes qui ne tournent qu'avec une greffe, et la non-régression du test, 70/70,
   a été refaite après.)
2. **Avec trois essais, cinq générations** (le champion est resté le témoin `19e3767cc346` tout du long) :
   G1 `e0131036d529` greffe `bordOn=1` (aucune autre mutation) ; G2 `a886019a3ca4` greffe `slalomOn=1` ; G3 `9c7a96ea7efa` greffe
   `bordOn=1 + slalomOn=1` ; G4 `009059dc0b26` immigré ordinaire (10 gènes changés) ; G5 `b2905fe1417b` greffe `bordOn=1` **par la voie de
   repli** (la copie de G1 était déjà vue : plus 4 gènes mutés, `bordOn` reste à 1). Dans `pilotes/`, le texte de chaque greffé ne diffère
   de celui du témoin que par les interrupteurs demandés (`bordOn:1`, `slalomOn:1`) et le nom du génome (le repli de G5 : ses 4 réglages
   en plus). Chaque greffé a joué ses courses, toutes mesurées (6 pour ceux de G1 à G3, renvoyés ensuite ; 3 pour celui de G5) ; sur une
   des trois routes de G1, `bordOn` seul a changé le résultat du témoin (palier 1 au lieu de 2). Le champ `greffe` est dans
   `population.json` et `generations.jsonl` ; `mutes` contient les gènes greffés. `tableau.html`, `arbre.html`, `histoire.md`,
   `resume.txt` se construisent à chaque génération sans erreur ; le récit dit « Dont 1 né par greffe … » et traduit les quatre événements.
3. **La reprise.** Depuis une copie de l'état à la fin de G0, un STOP posé au milieu des courses de G1 (une génération à greffe), puis une
   relance : `population.json`, `courses-*.jsonl` (38 lignes), `morts.jsonl`, `validations.jsonl`, `coffre.jsonl` et `pilotes/` sont
   ceux du passage sans arrêt ; la ligne de G1 de `generations.jsonl` aussi, hors dates, durées et compteurs de courses (9 jouées + 9 du
   cache au lieu de 18 jouées, ce qui est le but de la reprise). **Défaut trouvé à ce passage** : sans arrêt, la ligne disait l'événement
   de la greffe ; après un arrêt, elle ne le disait plus. Corrigé (voir « La règle exacte ») puis refait : la ligne est identique.
4. **Les cas tordus.** Une greffe d'un choix (`dessousDecor` à 0, 1, 2) : valeur forcée, génome valide, et 1 (la valeur du témoin) passe par
   le repli. Le champ `greffe` n'entre pas dans l'identifiant (`idDe` ne lit que le génome). `"immigres": 0` : le message au lancement.
   Un état ancien sans aucun champ `greffe` (`tests/etat-e93ff5cb5`, recopié) : `tableau.js`, `arbre.js` et `histoire.js` tournent, et
   `histoire.md` est identique à celui du code de `46842ee77` (hors heure).

## Ce qui n'a pas été vérifié

- **Rien n'a tourné sur le Ryzen**, ni avec la vraie config (12 graines, 20 pilotes) : seulement le petit essai ci-dessus, où le champion
  n'a jamais changé (une greffe sur un champion sacré n'a donc été vue qu'au test sans course). Le premier lancement avec la clé dira, dans
  `sortie.log`, la ligne `generation N : … immigre greffe …`.
- Le repli avec remutations (une greffe qui retombe plusieurs fois sur un pilote déjà vu) n'a été vu qu'au test sans course.
- `evoluer.test.js` (une heure de courses) et `identite.test.js` (des courses) n'ont pas été relancés.
- `INTERFACES.md` et `README.md` ne parlent pas encore des greffes (un autre chantier les modifie en ce moment) : à ajouter à la fusion
  (la clé de config, le champ `greffe` des naissances et des vivants, la règle du cycle).
- **Limites connues, laissées telles quelles :**
  - la fiche d'un enfant greffé dans l'arbre dit « immigré : une copie très changée » (l'arbre ne lit pas le champ `greffe`) ; ce qui a
    changé (`mutes`) y est juste ;
  - `morts.jsonl` ne garde pas le champ `greffe` d'un renvoyé (il reste dans `generations.jsonl`, ligne de sa naissance) ;
  - la mesure « Les mutations comptent-elles ? » range les greffes avec les immigrés (même origine) ;
  - une greffe dont les interrupteurs ne servent pas sur une route rejoue exactement la course du champion : ce sont des « courses jouées
    pour rien », que cette même mesure compte déjà.
