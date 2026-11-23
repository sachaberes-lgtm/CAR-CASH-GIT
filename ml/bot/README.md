# ml/bot — le contrat du bot (étape 1 du plan BOTS-ML)

Plan : `passation/BOTS-ML.md`. Socle : `ml/reel` (le vrai jeu publié, sans écran, piloté au clavier).

Ici : **ce que le bot voit, ce qu'il peut faire, et comment on le note.** Un cerveau est un programme lisible qui reçoit une *vue* et
rend un *ordre*, dix fois par seconde. Il ne touche jamais le jeu : ses yeux lisent, ses doigts appuient sur les touches d'un joueur.

| Fichier | Rôle |
|---|---|
| `yeux.js` | la vue : ce que le joueur voit, en nombres (route devant, pièces, jauges, vol, tronçons en contrebas) |
| `doigts.js` | les gestes → les cinq touches du clavier, aux délais d'une main (`HUMAIN`) ; le journal des touches |
| `piloter.js` | une course : charge le jeu, charge le cerveau dans un bac fermé, fait tourner l'enregistreur du jeu |
| `mesures.js` | les chiffres d'une partie et d'un lot — les mêmes pour Sacha et pour les bots |
| `reference.js` | le bot écrit à la main : le point de départ à battre, et l'exemple du contrat |
| `noter.js` | note un cerveau sur N graines → `results/note-<nom>.json` |
| `autopsie.js` | raconte les dernières secondes d'une course (ce qu'il voyait, ce qu'il a ordonné) |
| `etalon.js` | lit les parties de Sacha (`etalon/`) → la barre, et la compare aux notes des bots |
| `verifier.js` | les contrôles du contrat dans le vrai jeu. **À relancer après chaque mise à jour du jeu.** |

```bash
cd ml/bot
node verifier.js                         # le contrat tient-il ? (≈ 2 min)
node noter.js                            # la référence sur 20 graines (≈ 10 min, 4 cœurs)
node noter.js mon-cerveau.js --graines 20 --tmax 300
node autopsie.js mon-cerveau.js --graine 910037 --avant 6
node etalon.js                           # quand les parties de Sacha sont dans etalon/
```

---

## 1. Le contrat d'un cerveau

Un fichier JavaScript qui pose :

```js
module.exports = { nom: 'mon-cerveau', decide: function (vue, memoire) { return { ligne: 0, nitro: true }; } };
```

- `decide` est appelé **toutes les 6 images (10 fois par seconde)**. Il rend un ordre (§ 3), ou rien.
- `memoire` est un objet à lui, vide au départ de chaque course.
- Il tourne dans un **bac fermé** (`charger`, dans `piloter.js`) : pas de `require`, pas de fichiers, pas de réseau, pas d'horloge, pas de
  `Math.random`. Une décision de plus de 500 ms est coupée et comptée comme une panne. Ce bac est un garde-fou, pas un coffre-fort.
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
et la course enchaîne les maps aux portails comme une vraie partie. Sortie : `results/note-<nom>.json` et le tableau.

Les chiffres (`mesures.js`) : survie, argent par minute, pièces par minute, figures posées par minute, temps en l'air, vols par minute,
raccourcis par minute (gain ≥ 60 m, calculé sur la trace), distance, nitro tenue, causes de fin, maps. Les taux « par minute » sont des
totaux divisés par le temps total.

`autopsie.js` : une graine, les dernières secondes décision par décision. C'est le texte à donner à lire pour comprendre une mort.

**Ne jamais annoncer ce que « le bot » sait faire sur une seule course** (règle de `ml/train`) : la note, sur 20 graines au moins.

---

## 5. L'étalon : les parties de Sacha

Le jeu a déjà son enregistreur (`passation/ENREGISTREUR-JEU.md`). Le pilote fait tourner **le même** pour les bots : mêmes chiffres, même format.

1. **Allumer**, une fois : ouvrir https://car-cash-git.vercel.app/jouer/?jeurec=1 (ordinateur ou téléphone ; c'est gardé).
   Dans l'app : RÉGLAGES → 5 touchers rapides sur la ligne de version → BOÎTE NOIRE → PARTIES → ALLUMER.
2. **Jouer normalement.** « PARTIE ENREGISTRÉE · n » s'affiche à chaque fin de partie.
3. ⚠ **L'enregistreur ne garde que les 8 dernières parties.** Exporter toutes les 8 parties au plus : même chemin → PARTIES → PARTAGER
   (le fichier `cashcar-parties-….json`), ou COPIER puis coller dans un fichier `.json`. 20 parties = 3 exports. Une partie présente dans
   deux exports n'est comptée qu'une fois. (L'export n'a pas été essayé sur l'ordinateur pendant l'étape 1 : si PARTAGER n'offre pas
   d'enregistrer le fichier, COPIER marche partout.)
4. **Déposer** les fichiers dans `ml/bot/etalon/`, puis `node etalon.js` : la barre s'affiche, et le tableau « Sacha contre le bot » pour chaque note déjà écrite.

À savoir pour lire la comparaison :

- le bot joue une **sauvegarde neuve** (voiture LA HONTE, deux figures : salto et tail whip, moteur au premier palier au départ) ; Sacha joue la sienne ;
- le bot joue **au clavier** ; l'enregistrement note si la partie vient d'un téléphone ou d'un ordinateur ;
- les courses du bot sont **coupées à `--tmax`** : sa survie est plafonnée, ses taux par minute ne le sont pas ;
- l'enregistreur ne note pas la graine de la piste : « le bot contre Sacha sur les mêmes graines » (le test final du plan) demandera `?pistegraine=`.

---

## 6. Le bot de référence

`reference.js`, écrit à la main, rien d'appris. Il tient la route, suit les pièces, les plaques, les fruits et les orbes, évite les flaques,
pousse la NITRO dans les droites, pose une figure sur la route quand la jauge le permet, saute une fois sur deux si la route est droite,
plate et sans plongée, revient se poser, tourne une figure en vol quand le jeu annonce assez de temps. Il ne cherche **aucun raccourci**,
ne drifte pas, n'enchaîne pas.

Sa note : `results/note-reference.json` (les chiffres du jour sont dans `passation/BOTS-ML.md`).

---

## 7. Ce qui a été réparé dans `ml/reel` pour en arriver là

- **Le portail** : le jeu attend deux images d'écran avant de bâtir la piste suivante ; le simulateur n'en donnait jamais, la caisse restait
  tenue à la bouche du portail (plus un mètre après ~110 s). Les demandes d'image comptent maintenant pendant l'attente du portail, et seulement là.
- **La grotte au portail** : elle se creuse dans un travailleur qui ne répond pas dans le simulateur ; `grotteworker=0` (l'interrupteur du jeu) la creuse sur place.

Le jeu lui-même n'est pas modifié.
