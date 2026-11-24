# ml/bot — le contrat du bot (étape 1 du plan BOTS-ML)

Plan : `passation/BOTS-ML.md`. Socle : `ml/reel` (le vrai jeu publié, sans écran, piloté au clavier).

Ici : **ce que le bot voit, ce qu'il peut faire, et comment on le note.** Un cerveau est un programme lisible qui reçoit une *vue* et
rend un *ordre*, dix fois par seconde. Il ne touche jamais le jeu : ses yeux lisent, ses doigts appuient sur les touches d'un joueur.

| Fichier | Rôle |
|---|---|
| `yeux.js` | la vue : ce que le joueur voit, en nombres (route devant, pièces, jauges, vol, tronçons en contrebas) |
| `doigts.js` | les gestes → les cinq touches du clavier, aux délais d'une main (`HUMAIN`) ; le journal des touches |
| `piloter.js` | une course : charge le jeu, charge le cerveau dans un bac fermé, fait tourner l'enregistreur du jeu ; `rejouer` remet les touches d'une course sans le cerveau (étape 1 bis) |
| `mesures.js` | les chiffres d'une partie et d'un lot — les mêmes pour Sacha et pour les bots ; `partiesJoueurs` : les vraies parties des joueurs (doublons, pause, mort, seconde chance), pour `etalon.js` et `discerner.js` |
| `reference.js` | le bot écrit à la main : le point de départ à battre, et l'exemple du contrat |
| `noter.js` | note un cerveau sur N graines → `results/note-<nom>[-allege][-t<tmax>].json` |
| `autopsie.js` | raconte les dernières secondes d'une course (ce qu'il voyait, ce qu'il a ordonné) |
| `etalon.js` | lit les parties des joueurs (`etalon/` : Sacha au clavier, Léo au doigt) → la barre, et la compare aux notes des bots |
| `verifier.js` | les contrôles du contrat dans le vrai jeu, dont le bac fermé. **À relancer après chaque mise à jour du jeu.** |
| `discerner.js` | le juge « humain ou bot » : un bot se distingue-t-il d'un vrai joueur, sur ce qui se voit d'une course ? (§ 4 bis) |

```bash
cd ml/bot
node verifier.js                         # le contrat tient-il ? (2 processus à la fois ; --regime allege pour l'autre version du jeu)
node noter.js --tmax 300                 # LA note de référence documentée (20 graines, régime max, 300 s) → results/note-reference.json
node noter.js mon-cerveau.js --regime allege --coeurs 2     # 900 s au plus par défaut → results/note-mon-cerveau-allege-t900.json
node autopsie.js mon-cerveau.js --graine 910037 --regime allege --avant 6   # le MÊME régime et la MÊME --tmax que la note
node etalon.js                           # la barre des joueurs (etalon/), comparée à chaque note ; --nom=Leo : la barre d'un joueur
node discerner.js results/note-mon-cerveau-allege-t900.json --nom mon-cerveau   # une note faite avec --parties
```

---

## 1. Le contrat d'un cerveau

Un fichier JavaScript qui pose :

```js
module.exports = { nom: 'mon-cerveau', decide: function (vue, memoire) { return { ligne: 0, nitro: true }; } };
```

- `decide` est appelé **toutes les 6 images (10 fois par seconde)**. Il rend un ordre (§ 3), ou rien.
- `memoire` est un objet à lui, vide au départ de chaque course. `vue` est une **copie** (les mêmes nombres, NaN et Infinity compris) : la modifier ne change rien au jeu.
- Il tourne dans un **bac fermé** (`charger`, dans `piloter.js`) : pas de `require`, pas de `process`, pas de fichiers, pas de réseau, pas d'horloge
  (`Date` refuse, `Intl` est retiré), pas de `Math.random`, pas de `WeakRef`. Rien de l'hôte ni du jeu n'y entre : la vue arrive en texte, l'ordre
  repart en texte (fermé le 24/11 : avant, `Date.now()`, le hasard de Node et même `process` passaient — `verifier.js`, contrôle 5, tente 17
  évasions à chaque passage). Une décision de plus de 60 s est coupée et comptée comme une panne ; à la 2e la course est abandonnée (fin « panne »). Une décision qui lève une erreur (un bug du cerveau) est comptée à part (`erreurs`) : son ordre est vide, la course continue et reste répétable.
  Pour des cerveaux d'inconnus, il faudrait encore un processus à part. ⚠ Une panne rend la course non répétable : `noter.js` l'affiche (« PANNES n »), le journal
  du labo la garde course par course. La limite était de 500 ms jusqu'au 24/11 : un PC chargé la franchissait tout seul.
- Pas de hasard, donc : **même version du jeu + même graine + même cerveau = même course**, au bit près, dans un processus neuf
  (contrôlé par `verifier.js`). Dans un même processus, une course dépend un peu de celles d'avant (limite de `ml/reel`, étape 0) :
  `noter.js` et `autopsie.js` lancent donc **un processus neuf par course**.

---

## 2. Ce que le bot voit (`yeux.js`)

Repères : mètres, secondes, radians. **Tout ce qui est latéral est positif à GAUCHE** (lat, cap, volant, virage, gisement).
`d` = distance le long de la route, devant la caisse.

**Toujours** : `mode` (`sol`, `vol`, `boom`) · `t`, `image` · `carte`, `meteo` · `s` (où j'en suis sur la piste), `fin` (distance au portail), `L` ·
`vitesse` (m/s) · `volant` (le braquage en cours) · `demi` (demi-largeur de la route, 28 m) ·
`nitro` (part de la jauge, 0 à 1), `reserve` (réserve bleue), `nitroOn`, `nitroLibre` (elle est offerte : départ ou pouvoir) ·
`flow`, `flowNiveau` (0 à 4) · `argent`, `pieces`, `figures`, `chaine`, `moteur` (palier) · `pouvoirs` (secondes restantes : nitro, vitesse, air, aimant) ·
`troncons` (voir plus bas).

**Au sol** : `lat` (écart à l'axe), `cap` (angle de la caisse par rapport à la route), `pente`, `devers` · `dessous` (roule sous la dalle) ·
`drift`, `glisse` (flaque), `rebond`, `sursis` · `figureRoute`, `bond` (hauteur du bond d'une figure sur la route) ·
`lacetRoute`, `lacetMax` (pour tenir une ligne) ·
`route` : à 30, 60, 100, 150, 220, 300, 400, 550 m devant — `virage` (de combien elle a tourné), `monte`, `devers`, `envers`, `trou` ·
`piecesDevant` (par tranches de 25 m : `d`, `lat` moyen, `n`) · `plaques` · `fruits` (ils remplissent la réserve) · `orbes` (pouvoirs) · `flaques` (`rayon`) ·
`modules` (les deux prochains morceaux nommés de la route).

**En vol** (`vue.vol`) : `t` (temps en l'air), `reste` (avant l'explosion des 6 s), `monte` (vitesse verticale), `plancher` (hauteur au-dessus du fond mortel) ·
`proche` : la route la plus proche — `lat` (à côté), `haut` (au-dessus, le long de SA normale), `avant`, `cote`, `versRoute` (vitesses), `axe` (angle d'arrivée) ·
`anneau` : l'anneau de pose que le joueur voit — `delai`, `dist`, `dessous`, `gisement` ·
`figure` : `enCours`, `reste` (s pour finir), `angle` (rad restants), `ecart` (à l'endroit), `budget` (s avant la pose, selon le jeu) · `figuresDuVol`.

**Les tronçons** (`vue.troncons`, au sol et en vol) : les morceaux de route en contrebas que la caisse peut atteindre — la matière des raccourcis.
Jusqu'à quatre, le plus gros gain d'abord : `s`, `gain` (piste sautée moins distance volée ; le jeu crie RACCOURCI à 60 m), `dist`, `chute`,
`gisement` (à gauche ou à droite de ma trajectoire), `axe` (angle d'arrivée ; pose propre sous 55°), `tChute`, `tTrajet`, `longueur`.

Ce que les yeux **ne voient pas** : les obstacles hors de la route (tours, pics, rochers, eau) — le bot les apprend en mourant, l'autopsie donne la cause.
Les tronçons sont un calcul simple (chute verticale, sans le plané ni les maps où le haut suit la route) : une piste, pas une promesse.

---

## 3. Ses gestes (`doigts.js`)

L'ordre rendu par `decide` :

| Champ | Effet | Touches |
|---|---|---|
| `volant` −1…1 | braquer (+ = gauche) ; un dosage se fait en tapotant | ← → |
| `ligne` (m) | *aide* : tenir cet écart à l'axe au sol (la loi du pilote de mesure du jeu, `dbgAuto`) | ← → |
| `viser` (un tronçon, ou `vue.vol.anneau`) | *aide* : en vol, tourner vers lui ; cabrer ou piquer selon `tChute` / `tTrajet` | ← → ↑ ↓ |
| `manche` −1, 0, 1 | en vol : −1 pique, +1 cabre. Au sol : +1 freine, et drifte si le volant est tenu | ↑ ↓ |
| `nitro` vrai / faux | tenir la NITRO : pousse au sol ; en vol, un coup de réacteur puis le plané | ESPACE |
| `geste:'figure'` + `direction` | deux appuis brefs sur NITRO, la direction tenue : `avant`, `arriere`, `gauche`, `droite` | direction + ESPACE ×2 |
| `geste:'saut'` + `direction` | une figure sur la route, puis manche vers soi et un nouvel appui NITRO pendant le bond : la caisse décolle | idem, puis ↓ + ESPACE |
| `geste:'redresser'` | un appui bref, seul, en vol : la figure en cours s'arrête, la caisse se remet droite | ESPACE |

Ce que ces gestes font dans le jeu (vérifié par `verifier.js`, sauvegarde neuve) :

- **Au sol, une figure reste sur la route** : un bond de moins d'une seconde, la figure tourne, elle est payée à la retombée. `avant` et `arriere` : le salto. `gauche` / `droite` : le tail whip.
- **Pour voler, il faut le saut** (ou sortir par le bord, ou une bosse de la route). Le « saut nitro » du jeu (double appui sans figure) n'existe que si la direction n'a pas de figure : jamais avec la sauvegarde neuve.
- **En vol, la figure dépend de la direction tenue** au second appui. Le jeu la refuse s'il ne reste pas assez de vol pour la finir.
- **Une figure coûte de la nitro** : jauge 2,00 → 1,23 mesuré pour une figure sur la route. Sans jauge, le jeu la refuse.
- **Tenir la NITRO pendant une figure en vol la redresse** (c'est un appui seul) : planer et tourner ne vont pas ensemble.
- **6 s en l'air = explosion** ; un pouvoir « air » suspend le compte.

### Les limites d'une main (`HUMAIN`)

Tenues dans `doigts.js`, pas dans le cerveau — aucun cerveau ne peut les dépasser :

| | |
|---|---|
| décision | 10 par seconde |
| une touche enfoncée | au moins 67 ms |
| une touche relâchée | au moins 67 ms (7,5 appuis par seconde au plus) |
| double appui | 83 ms, 83 ms de blanc, 83 ms |
| gestes | 2 par seconde au plus |
| après un appui bref isolé | la NITRO attend 450 ms (pas de double appui par accident) |

**Le bot joue au clavier** (les touches de la version ordinateur). Un joueur au téléphone a un pouce analogique, plus fin : le bot n'a pas cet avantage.

---

## 4. Noter, lire une mort

`noter.js` : N graines (`910000 + 37 × i`), une course par processus, `--tmax` secondes de jeu au plus. Sans `--carte`, la graine tire la map,
et la course enchaîne les maps aux portails comme une vraie partie.

- **`--tmax` vaut 900 par défaut** (24/11 ; c'était 180) : à 180 s, le palier d'un bot ne pouvait pas dépasser ~15, l'échelle 1 à 30 ne se
  remplissait pas. Une course coupée finit « temps » ; la note les compte (`coupees`) : leur survie et leur palier sont des **planchers**.
- **La sortie porte le réglage** : `results/note-<nom>.json` est la note canonique (régime max, 300 s) ; un autre réglage ajoute
  `-allege`, `-t<tmax>`, `-<map>` au nom. Une sortie qui existe avec d'autres réglages n'est pas écrasée sans `--force`.
- **Hors de la note**, comptées à part (`ecartees`, avec la raison, et dites à l'écran) : une course avec des décisions coupées ou abandonnée
  (pas répétable) ; une course jouée sur une autre version du jeu que celle du début de la note (empreinte `jeu_sha` = sha1 d'index.html +
  figures.js, lue par chaque processus ; un agent qui réassemble le jeu pendant la note ne mêle plus deux jeux). Les erreurs du cerveau,
  répétables, restent dans la note et sont affichées.
- La note porte `jeu` (cashcar-vNNN), `jeu_sha`, `sha_cerveau` (sha1 du code noté : chaque processus reçoit le texte lu une fois).

Les chiffres (`mesures.js`) : survie, argent par minute, pièces ramassées par minute, figures posées par minute, temps en l'air, vols par minute,
**palier** (le sommet de la partie), raccourcis par minute, distance, nitro tenue, causes de fin, maps. Les taux « par minute » sont des
totaux divisés par le temps total. Comptés **pareil pour un joueur et pour un bot** (24/11) :

- **la partie finit à sa mort** (l'événement `mort`) : l'explosion (~2 s que l'enregistreur d'un joueur garde, pas celui du bot) ne compte
  ni dans la survie ni dans les pourcentages ; une partie quittée depuis la pause finit à la pause (`finVraie`) ;
- **le palier = le plus haut atteint** (`pieces_max`) : le jeu monte le record du joueur à l'instant où le palier tombe, la seconde chance en
  reprend un ensuite. `pieces` reste le chiffre de fin, `pieces_ramassees` la somme des gains ;
- **les raccourcis comme le jeu les paie** : pose sur la même route, ou vol qui passe le **portail** (gain = L − 80 − s du décollage − distance
  volée). ⚠ Le jeu ne paie pas une pose dans le **filet** de son virage ; les filets ne sont pas dans l'enregistrement : ces poses restent
  comptées (pour les joueurs comme pour les bots), il faudrait que le jeu enregistre ses raccourcis ;
- **au-delà de 10 min**, l'enregistreur ne garde que les 6000 derniers échantillons : distance et raccourcis se rapportent à la fenêtre couverte
  (`fenetre_s`, `tronquee`), et un vol sans échantillon à moins de 0,3 s n'est pas compté.

`autopsie.js` : une graine, les dernières secondes décision par décision. C'est le texte à donner à lire pour comprendre une mort.
⚠ Avec le **même `--regime` et la même `--tmax`** que la note : en allégé, Crypto City sort du tirage et la même graine donne une autre course.

### 4 bis. Le juge « humain ou bot » (`discerner.js`)

Coupe chaque partie en fenêtres de 10 s, mesure ce qu'un spectateur voit (écart au milieu, ondulation, vols, nitro, drift…), entraîne une
régression logistique humain / bot en laissant une partie entière de côté à chaque tour, et donne l'AUC (0,50 = indiscernable), un témoin à
étiquettes mélangées, et ce qui trahit le bot mesure par mesure (z = distance aux joueurs).

- Les parties des joueurs sont **celles d'`etalon.js`**, comptées par la même fonction (`partiesJoueurs`) : doublons écartés, seconde chance
  recollée, fin à la mort. Par défaut les parties **au clavier** (`--humains clavier|doigt|tous`).
- **Le bot se juge sur une note complète** : `node noter.js <cerveau> --parties`, puis `node discerner.js results/note-….json`.
  Les 4 courses de `ml/labo/trajectoires` sont les courses EXTRÊMES gardées par `clore.js` : un verdict sur elles (l'AUC de 0,97 du 24/11)
  n'est pas celui du bot ordinaire.
- Limite : une dizaine de parties de 2 joueurs ; le juge connaît Sacha et Léo, pas « les humains ».

**Ne jamais annoncer ce que « le bot » sait faire sur une seule course** (règle de `ml/train`) : la note, sur 20 graines au moins.

---

## 5. L'étalon : les parties des joueurs

Le jeu a déjà son enregistreur (`passation/ENREGISTREUR-JEU.md`). Le pilote fait tourner **le même** pour les bots : mêmes chiffres, même format.

1. **Allumer**, une fois : ouvrir https://car-cash-git.vercel.app/jouer/?jeurec=1 (ordinateur ou téléphone ; c'est gardé).
   Dans l'app : RÉGLAGES → 5 touchers rapides sur la ligne de version → BOÎTE NOIRE → PARTIES → ALLUMER.
2. **Jouer normalement.** « PARTIE ENREGISTRÉE · n » s'affiche à chaque fin de partie.
3. ⚠ **L'enregistreur garde les 8 dernières parties, et 1,6 Mo au plus** (de longues parties : 6, parfois moins). Exporter **toutes les
   4 ou 5 parties** : même chemin → PARTIES → PARTAGER (le fichier `cashcar-parties-….json`), ou COPIER puis coller dans un fichier `.json`.
   Une partie présente dans deux exports n'est comptée qu'une fois. Sur l'ordinateur, COPIER marche (essayé le 24/11).
4. **Déposer** les fichiers dans `ml/bot/etalon/`, puis `node etalon.js` : la barre s'affiche, et le tableau « les joueurs contre le bot » pour chaque note déjà écrite.
   La barre d'un seul joueur, à côté : `node etalon.js --nom=Leo` → `results/etalon-leo.json`. **Qui a joué quoi** est une liste, fichier par
   fichier (`JOUEURS` dans `etalon.js`, et `etalon/LISEZ-MOI.md`) : rien dans un export ne le dit, et la date ne suffit pas.

**Où en est l'étalon (24/11) : 14 parties sur 20** — 10 au clavier (Sacha), 4 au doigt sur téléphone (Léo, décision de Sacha : « dans les 20 »).
Il en manque 6 : la barre est provisoire.

À savoir pour lire la comparaison :

- le bot joue une **sauvegarde neuve** (voiture LA HONTE, deux figures : salto et tail whip, moteur au premier palier au départ) ; Sacha joue la sienne ;
- le bot joue **au clavier** ; chaque partie dit si elle a été jouée au clavier ou au doigt (`etalon.js` les compte à part dans son titre) ;
- une reprise par **seconde chance** est recollée à sa partie ; le bot, lui, n'a pas de seconde chance ;
- les courses du bot sont **coupées à `--tmax`** (900 s par défaut depuis le 24/11) : une course coupée a une survie et un palier plafonnés, ses taux
  par minute ne le sont pas ; la comparaison le dit (« coupée(s) ») ;
- les paliers les plus hauts de l'étalon (22 et 28) viennent des deux parties à seconde chance ; `etalon.js` donne aussi le record sans elles ;
- l'enregistreur ne note pas la graine de la piste : « le bot contre Sacha sur les mêmes graines » (le test final du plan) demandera `?pistegraine=`.

---

## 6. Le bot de référence

`reference.js`, écrit à la main, rien d'appris. Il tient la route, suit les pièces, les plaques, les fruits et les orbes, évite les flaques,
pousse la NITRO dans les droites, pose une figure sur la route quand la jauge le permet, saute une fois sur deux si la route est droite,
plate et sans plongée, revient se poser, tourne une figure en vol quand le jeu annonce assez de temps. Il ne cherche **aucun raccourci**,
ne drifte pas, n'enchaîne pas.

Sa note : `results/note-reference.json` (23/11 : 20 graines, régime max, **300 s au plus** ; les chiffres du jour sont dans `passation/BOTS-ML.md`).
Elle date d'avant le palier : recalculé sur les pièces de ses 20 courses (`etalon.js` le fait seul), **palier médian 10, record 20** — un
record plafonné par les 300 s (le « palier 11 » qui a circulé venait de la moyenne des pièces, pas de la médiane). Elle compte encore
l'ancienne façon (explosion, raccourcis) ; la refaire : `node noter.js --tmax 300` (≈ 10 min, `--coeurs 2` : plus long).

---

## 7. Ce qui a été réparé dans `ml/reel` pour en arriver là

- **Le portail** : le jeu attend deux images d'écran avant de bâtir la piste suivante ; le simulateur n'en donnait jamais, la caisse restait
  tenue à la bouche du portail (plus un mètre après ~110 s). Les demandes d'image comptent maintenant pendant l'attente du portail, et seulement là.
- **La grotte au portail** : elle se creuse dans un travailleur qui ne répond pas dans le simulateur ; `grotteworker=0` (l'interrupteur du jeu) la creuse sur place.

Le jeu lui-même n'est pas modifié.
