# Note pour l'intégrateur : le lot « lignée » (28/11/2026)

## Ce qui a changé

Rien dans le jeu, rien dans `ml/bot/`, `ml/reel/`, `ml/labo/`, `ml/evolution/`, ni dans `ml/ecurie/pilote-voltige.js`. Fichiers nouveaux, non commités :

- `ml/ecurie/etude/boucle-payante-ryzen/LISEZ-MOI.md` : l'étude (« En une minute » pour un jury qui ne code pas, puis la lignée,
  les champions, le point délicat, trois leçons, ce qui n'est pas vérifié).
- `ml/ecurie/etude/boucle-payante-ryzen/outils/extraire.js` et `outils/figure.js` (Node pur, rien de payé, aucune course jouée).
- `ml/ecurie/etude/boucle-payante-ryzen/donnees/lignee.json`, `donnees/tableaux.md`, `diffs/*.diff` (écrits par `extraire.js`).
- `ml/ecurie/portfolio/images/boucle-payante-lignee-clair.svg` et `-sombre.svg` (écrits par `figure.js`).

Pour tout refaire : `node ml/ecurie/etude/boucle-payante-ryzen/outils/extraire.js && node ml/ecurie/etude/boucle-payante-ryzen/outils/figure.js`.
`extraire.js` sort en erreur si un contrôle tombe (sacres, 21,61 €, 58,53 €, c0025 = pilote-voltige.js, validations identiques).

## Format nouveau

`donnees/lignee.json` : `generations[]` (par génération : parent, écrites, perdues, triées, promues, jumelles du parent, validées, sacre, euros),
`pilotes{}` (pour c0025, les cinq sacres, c0098, c0103 : angle donné au modèle, raison, coût, notes d'entraînement et de validation avec les paliers
course par course, courses changées par rapport au parent, palier apparié, résumé du diff), `toutes_les_variantes[]`.

## Ce que Sacha doit savoir, en mots simples

- L'argent est juste : 21,61 € pour l'étape C2 sur le Ryzen, 58,53 € en tout.
- L'observation de Fable est **confirmée, et plus forte** : c0064, c0072, c0087 et c0101 ne jouent pas seulement les mêmes notes en
  validation, ils jouent **les mêmes 20 courses image par image**. Les trois derniers ont été sacrés parce que la boucle accepte l'égalité
  en validation, sur la foi d'une ou deux courses d'entraînement différentes.
- Le seul vrai mouvement en validation est c0026 → c0064 (note −6,06 → −2,35). Même lui n'est pas sûr : sur les 40 courses réunies, c0101 fait
  +0,9 palier moyen de mieux que le pilote de départ, avec une marge de hasard d'environ ±0,6, et ces 40 courses ont toutes servi à choisir.
- La mesure du coffre (`coffre/`, une autre étude) dira si c'est un vrai progrès.

## Ce qui reste

- Recouper les noms de gènes du tableau de portage avec `ml/evolution/genome.js` une fois commité (lu en cours de modification).
- Comprendre pourquoi les règles de c0072, c0087, c0101 ne se déclenchent presque jamais (13 courses de validation passent par les cartes
  sans décor, aucune image ne change). *(Le relecteur, 28/11 : elles ne sont pas impossibles, chacune change au moins une course d'entraînement ;
  `largeOn` et `libreOn` ne sont donc pas inertes, seulement rares. Voir la section « Relecture » du LISEZ-MOI, qui corrige aussi deux phrases.)*
- Si la boucle payante est relancée un jour : refuser le sacre à égalité parfaite, et ne pas noter en grand une variante identique au parent au tri.
- Ajouter l'image à la page du portfolio (`ml/ecurie/portfolio/index.html`) si on la veut : je n'y ai pas touché.
