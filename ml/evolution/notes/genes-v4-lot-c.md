# Le lot « gènes v4 », lot (c) : le banc des gènes v2 (28/11/2026)

Le code et son mode d'emploi sont dans `ml/evolution/banc/` (`README.md` pour Sacha, `banc.js` et ses modules, `banc/tests/banc.test.js`).
Le contrat est `notes/genes-v4.md` § 6 ; le compte rendu de l'auteur est dans la passation de la session principale. Cette note ne garde que la relecture.

## Relecture (28/11/2026, le relecteur « banc-courses »)

Angle : le banc v2, la carte et la ligne de course, contre le contrat § 4 à § 6. Tout ce qui a tourné est dans `ml/evolution/essais/relecture-v4-banc/`
(hors git). Une seule vraie course à la fois.

### Le taux de faux « net » sur de vraies courses, et pas sur une loi normale

Le test b6 de l'auteur tire ses lignes d'une loi normale. J'ai refait la mesure avec **le vrai code de décision** (`banc.derouler`,
`criteres.statistique`, `note.comparer` pour palier, F et E, `plan.decision`, `borne`, `constanteOBF`) sur les lignes du banc d'étude
(`ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl`, lues sans rien y écrire : 13 bras sur 87 graines complètes, tmax 900).
- **L'hypothèse « aucun effet », sans modèle** : à chaque graine de la vague, on tire une graine réelle (avec remise) et l'on distribue au hasard ses
  6 lignes réelles (le départ et 5 bras tirés parmi les 12) entre le témoin et les 5 bras. Aucun bras n'a d'effet par construction, et l'on garde les
  vrais paliers, la vraie part de courses identiques (de 1 % pour `slalomOn` à 97 % pour `largeOn`) et les corrélations entre bras.
- **Le résultat** (`faux-nets.js`, plan par défaut 24/24/192, k = 5, c = 2,645, critères palier, F, E, survie et vols) : **1 500 vagues, 4,67 % de
  vagues avec un faux « net » [3,60 ; 5,73]**, pour 4,9 % attendus. 102,9 graines par bras en moyenne (le contrat annonçait 102). Les faux « net »
  tombent surtout tard (regards 6 à 8 : 76 sur 83) : la borne d'O'Brien-Fleming fait son travail au début. Un bras seul jugé sur le palier, avec la
  constante de 5 bras (`node faux-nets.js 1000 palier`, 94 graines réelles à ce moment) : **0,60 % [0,12 ; 1,08]** pour 1 % attendu (le palier est un
  nombre entier : le bootstrap le rend un peu prudent).

### Ce que j'ai corrigé (marqué « le relecteur banc-courses » dans le code)

1. **Un « net » sur une seule course** (`criteres.js`, `apparie` et `statistique`). Avec une seule graine mesurable (une mesure nulle sous 60 s sur les
   autres, par exemple), `se` valait 0, donc `z` infini, et la borne finie était franchie : un bras s'arrêtait « net » sur une course. Une graine ne
   donne pas d'écart-type : `z = null` (jamais net ; futilité dès le 2e regard). Test ajouté dans b2. Deux graines aux différences égales donnent
   toujours `z` infini, comme le contrat le dit (§ 6.5) : voir les problèmes laissés.
2. **`journal.md` levait** à la fin d'une vague où un regard avait `m = 0` : la borne infinie arrive en texte « +inf » (`pourJson`) et `toFixed`
   levait (`rapport.js`). Elle est écrite telle quelle.
3. **Le dossier d'état de la sélection** (`banc.js`) : la comparaison ignore la casse sous Windows, comme `courses.js`.
4. **`resume.txt` relu comme quelqu'un qui ne code pas** (`rapport.js`) :
   - le plan est dit en mots (le banc fait le point après 24, 48… graines ; quand un bras s'arrête ; le seuil haut au début qui descend ; le risque
     de 5 % pour toute la vague) ; « Bonferroni », « O'Brien-Fleming » et la constante restent en fin de phrase, et le symbole « |z| » disparaît ;
   - « 2e regard fait sur 6, 12 graines » (qui se lisait « fait sur 6 graines ») devient « point 2 sur 6 fait, 12 graines jouées » ; le mot
     « point » remplace « regard » partout dans `resume.txt` (le `journal.md`, pour le portfolio, garde « regard ») ;
   - un bras arrêté en cours de vague dit son arrêt en mots (« rien de net (arret tot) », « trop rare ») au lieu de « futilite » ;
   - l'écart d'un « net » porte son unité (« +24,25 s de survie par course », « mort par course », « palier par course ») ; « gonflé par l'arrêt »
     n'est écrit que si l'arrêt est tôt (avant : « gonfle par l'arret  ; » au plafond) ;
   - « avec 5 bras et un plafond de 192 graines, le banc voit un palier 3 fois sur 4 » était écrit même pour une vague de 3 bras : la phrase dit
     maintenant que ce chiffre est calculé pour 5 bras et 192 graines, et donne ceux de la vague ;
   - une vague de confirmation sans « net-aide » le dit : « le candidat n'est PAS confirmé ».

### Ce que j'ai vérifié sans rien changer

- **La reprise** (`reprise.js`, un faux ordonnanceur qui écrit un vrai cache) : STOP au milieu du 3e paquet → code 3, 2 regards gardés ; puis un bras
  changé dans `bras.json` → code 4 (le message nomme le bras) ; le texte du pilote changé pour tous (un faux genome.js) → code 4 (nomme le témoin) ;
  l'époque des courses → 4 ; l'époque de la note → 4 ; `vague.json` édité → 4 ; tout remis → code 0, **même `resultat.json` (date à part) et même
  `regards.json`** qu'une vague jamais coupée, aucune course jouée deux fois.
- **La clé du cache** : pour les 38 lignes de `tests/etat-e93ff5cb5/courses-2026-48.jsonl`, `K.cle` (sans carte, `carte:''`, `carte:null`, et
  `carteTenue` sans carte) redonne **exactement** la clé écrite (152 sur 152).
- **Les lecteurs** : `etat.js`, `tableau.js`, `mesure-tau.js`, `histoire.js` et `note.noter` donnent le même texte sur une copie de
  `etat-e93ff5cb5` et sur la même copie dont les lignes portent `declenchements`, `cartes`, `causesMorts`, `chancePrise` et `carte` (dates à part).
- **Le refus dans l'état de la sélection** : une tâche à carte est refusée avec le dossier de la sélection écrit tel quel, en majuscules, avec un `/`
  final et en chemin relatif ; une carte hors de `cartesTirage` (« banquise ») aussi.
- **La carte tenue (lot b)** : sa preuve tient, refaite par moi, une course à la fois, avec `pilote-voltige.js` : 917807, 60 s, sans carte → les trois
  empreintes de `etat-e93ff5cb5` (`e0fe543bc1fd a57b6895d6e4 5c7251ebf35b`) ; 3963000, 120 s, carte grotte → `[grotte, jade]` ; la même tenue →
  `[grotte, grotte]`, 0 erreur, 0 panne, yeuxTirages 0, et **deux fois la même course** (`a0328ced407d 8b7865c84c23 e53ba0b2a07a`). Gardée.

### Les problèmes laissés (pour l'intégrateur)

- Deux graines aux différences égales et non nulles (par exemple +1 mort chacune) donnent `se = 0`, donc `z` infini et un « net » au premier regard,
  si `fMin` = 0 et `premier` = 2 : c'est la vague d'essai `v000-essai`. Sans effet pour une vraie vague (24 graines au premier regard), mais l'essai
  peut finir en « net » sur 2 courses : ce n'est pas un défaut du banc, c'est le contrat (§ 6.5, « se = 0 : ±inf »).
- `INDEX.md` marque « confirmé » toute vague à un bras et un regard qui donne « net-aide », sans vérifier que le critère est celui de la vague où le
  candidat est né (l'auteur le dit).
