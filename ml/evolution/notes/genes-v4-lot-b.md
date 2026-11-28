# Le lot « gènes v4 », part (b) : les compteurs et la map imposée côté courses (28/11/2026)

Contrat : `notes/genes-v4.md` (§ 4.1 l'enveloppe, § 4.4 les champs de ligne, § 5 la map imposée, § 8.2 les tests, § 9 lot b).
Fichiers touchés : `enfant.js`, `courses.js`, `tests/courses.test.js` (un test `i`, non lancé ici), `tests/carte-et-declic.test.js` (neuf).
`commun.js` n'est pas touché (§ 5). Rien dans `ml/bot/`, `ml/reel/`, `code/`, `VERSION PRINCIPALE/`.

## En mots simples

- Chaque course dit maintenant combien de fois chaque idée du pilote a agi (`declenchements`), par quelles maps elle est passée (`cartes`),
  de quoi est morte la caisse à **chaque** mort (`causesMorts`, la seconde chance comprise) et si la seconde chance a été prise (`chancePrise`).
- On peut demander une course **sur une map choisie** (`carte`). Si le jeu joue une autre map (une carte qu'il ne connaît pas), la course est
  **non mesurée** et le dit.
- En plus du contrat : la **carte tenue** (`carteTenue: true`) garde la même map à chaque portail, pas seulement au départ.
- Une course sans carte d'un pilote qui n'émet aucun « declic » reste **exactement** la même : mêmes trois empreintes, même clé de cache.

## Ce qui est fait

### enfant.js
- `envelopper(C)` : pose sur `C.decide` une enveloppe qui appelle l'original (`d0.call(C, vue)` : `this.texte`, `this.pannes` restent ceux du cerveau),
  compte chaque nom de `declic` (une fois par décision, même si le pilote l'écrit deux fois), puis **supprime** le champ avant de rendre l'ordre.
  Sans `declic`, l'ordre rendu est l'objet même de l'original. Le compte est un objet sans prototype (un nom `__proto__` reste un nom).
- `resultatCompact(r, J, C, graine, compte)` : les champs d'avant, dans le même ordre, puis `declenchements` (clés triées, `{}` sans rien, `null` sans
  compte), `cartes` (`bilan.cartes`), `causesMorts` (les événements `'mort'` de `r.partie.ev`, `[]` sans mort), `chancePrise` (`null` sans `bilan.chance`).
- `optionsCourse(m)` : `{tmax}`, plus `carte` seulement pour une chaîne non vide.
- `lireEssai(A)` : `--essai <pilote.js> <graine> [tmax] [--carte grotte] [--tenue]` ; `--carte` lu par son nom (refusé vide ou suivi de `--`),
  `tmax` lu seulement s'il ne commence pas par `--` ; erreur → usage, code 1, avant d'ouvrir le jeu.
- `tenirLaCarte(J, carte)` : la carte tenue (plus bas).

### courses.js
- `carteDe(t)` : la seule mise en forme (chaîne non vide, sinon `null`) ; elle sert à la clé, à l'envoi, à `faireLigne` et au contrôle.
- `cle(t, ep)` : sans carte, la chaîne d'avant au caractère près ; avec carte, `|carte:<carte>` à la fin ; carte tenue : `|carte:<carte>|tenue`.
- `une(t)` refuse (promesse rejetée, rien n'est lancé) : une carte hors de `cfg.cartesTirage` (`courses : carte inconnue « x » (cartesTirage : …)`),
  une carte quand le dossier d'état est celui de la sélection (`courses : une course a carte imposee ne va pas dans l etat de la selection`, la
  comparaison des chemins ignore la casse sous Windows), `carteTenue` sans carte.
- L'envoi à l'enfant porte `carte` et `carteTenue`.
- `CHAMPS` gagne `declenchements, cartes, causesMorts, chancePrise` **à la fin** ; `faireLigne` écrit `carte` depuis la tâche (`null` sans), et
  `carteTenue: true` seulement pour une carte tenue (absent sinon).
- `raisonCarte(t, res)` : après le tri, une course à carte dont `cartes[0]` n'est pas la carte → `mesuree:false`,
  `carte imposee non appliquee (jouee sur x)` ; carte tenue avec une autre map traversée → `carte tenue non appliquee (jouee aussi sur …)`.
  **Définitif dès le premier essai** : pas de relance, et le cache la rend telle quelle au lancement suivant (« rejouer ne changerait rien »).
- `creer` accepte une option de test `o.enfant` (le script de l'enfant ; défaut `enfant.js`) : le test neuf y met un faux enfant. La signature
  documentée et `demander` ne changent pas.
- La ligne de commande gagne `--carte x` et `--tenue` (elle n'écrit jamais dans `etat/`).
- Exports en plus : `CHAMPS`, `carteDe`, `raisonCarte`.

## La carte tenue (au-delà du contrat, prouvée)

Le jeu a déjà `dbgBancCarte(c, m)` (`code/economie/aura-banque-contrats.js`) : il tient `SF.force` posé (un accesseur sur `SF`) et réécrit les
maps déjà tirées. Plutôt que de toucher `piloter.js` ou `jeu-reel.js` (deux fichiers d'époque de plus, une époque « des yeux »), l'enfant enveloppe
`J.lancer` **de son propre processus** quand la tâche porte `carteTenue: true` : après le départ (la première map est bâtie, sa météo tirée), il
appelle `dbgBancCarte(carte, météo de la première map)`. La météo est fixée parce qu'une map déjà tirée garde sa météo : la grotte n'a ni pluie
ni orage, une météo d'une autre map pourrait ne pas exister dans la carte tenue. Donc : **même carte et même météo à chaque portail**.
Une course = un processus neuf : l'accesseur posé sur `SF` ne survit pas à la course. Sans `carteTenue`, ce code ne s'exécute pas.

**La preuve, dans cette copie de travail, une course à la fois** (c0025 = `ml/ecurie/pilote-voltige.js`, `enfant.js --essai`, tmax 60) :

| graine (ligne de `tests/etat-e93ff5cb5/courses-2026-48.jsonl`) | enregistrée | avant le lot | après le lot |
|---|---|---|---|
| 917807 | `e0fe543bc1fd a57b6895d6e4 5c7251ebf35b` | identique | identique |
| 990037 | `0c0e81227a78 635ce581b2ba 700c769579c9` | identique | identique |

Après le lot, la seule différence du résultat compact (hors `ms`, `cerveau_ms_moy` et les champs neufs) est `fichiers_sha` (enfant.js a changé).
Les champs neufs de 917807 : `declenchements {}`, `cartes ["canyon"]`, `causesMorts ["paroi"]`, `chancePrise false`.

La carte tenue elle-même (graine 3963000, 120 s, grotte) : carte imposée seule → `cartes ["grotte","jade"]` ; carte tenue → `["grotte","grotte"]`,
zéro erreur du cerveau, `yeuxTirages` 0, aucune panne.

L'enveloppe en vraie course (par `K.creer`, carte grotte, 3963000, 20 s) : c0025 et le même pilote qui ajoute `declic:['essai','essai','autre']` à
chaque ordre ont les mêmes trois empreintes (`e2304c441f6d 5976023aaa41 5f46d81d87a1`) ; le second compte `{autre:200, essai:200}`.

## Les tests

- `tests/carte-et-declic.test.js` (neuf, sans course, environ 1 s, 33 contrôles) : l'enveloppe sur un faux cerveau ; `resultatCompact` sur un faux r
  (deux morts et une seconde chance) ; `optionsCourse` ; la ligne de commande (`lireEssai` et le vrai processus refusé en code 1) ; la clé ;
  l'ordonnanceur avec un faux enfant écrit dans `%TEMP%\cashcar-carte-declic-<pid>` (refus, ordre des champs d'une ligne sans carte, carte envoyée,
  carte non appliquée sans relance et rendue par le cache, carte tenue) ; `courses.js --carte` sans valeur.
- `tests/courses.test.js` : un test `i` (4 courses, une à la fois, environ 3 min) qui refait en test les mesures ci-dessus. **Non lancé ici**
  (consigne : l'intégrateur lance `courses.test.js`).

## Écarts au contrat

- Le test neuf s'appelle `tests/carte-et-declic.test.js` (le nom donné par la session principale), et non `tests/compteurs-carte.test.js` (§ 8.2, § 9).
- `creer` accepte une option de test `o.enfant` : le contrat demandait de remplacer l'enfant « comme courses.test.js le fait », mais courses.test.js
  ne remplace pas l'enfant (il utilise des pilotes qui lèvent) ; il fallait un point d'entrée.
- Une ligne « carte non appliquée » est définitive dès le premier essai (pas de relance) : c'est la lecture de « elle reste en cache (rejouer ne
  changerait rien) ».
- La carte tenue (`carteTenue`, suffixe `|tenue`, champ `carteTenue` de la ligne, `--tenue`) n'est pas dans le contrat (§ 10.8 la disait hors lot).

## Relecture (28/11/2026, le relecteur « banc-courses »)

Relu `enfant.js` et `courses.js` contre le contrat § 4.4 et § 5. **Aucune correction** dans ces deux fichiers : je n'y ai trouvé aucun défaut.
Le détail des essais (hors git) est dans `ml/evolution/essais/relecture-v4-banc/` ; la relecture du banc est dans `notes/genes-v4-lot-c.md`.
- **La clé** : sans carte, `K.cle` redonne exactement les 38 clés de `tests/etat-e93ff5cb5/courses-2026-48.jsonl` (aussi avec `carte:''`, `carte:null`
  et `carteTenue` sans carte) ; avec carte, le suffixe `|carte:grotte` en fin.
- **Le refus** d'une tâche à carte dans l'état de la sélection tient avec le dossier écrit en majuscules, avec un `/` final ou en relatif ; une carte
  hors de `cartesTirage` est refusée.
- **Les lecteurs** (etat, tableau, mesure-tau, histoire, `note.noter`) rendent le même texte avec ou sans les champs neufs dans les lignes.
- **La carte tenue** : la preuve refaite, une course à la fois (`pilote-voltige.js`) : 917807 sans carte = les trois empreintes enregistrées ;
  3963000 grotte imposée → `[grotte, jade]`, tenue → `[grotte, grotte]`, 0 erreur, et la même course deux fois de suite. Le changement est gardé.
- À savoir : `causesMortsDe` lit `partie.ev` après `colle` (mesures.js) ; la première mort d'une seconde chance y reste, comme le test c le montre.
