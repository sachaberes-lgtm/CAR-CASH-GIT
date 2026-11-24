# ml/bot — le contrat du bot (étape 1 du plan BOTS-ML)

Plan : `passation/BOTS-ML.md`. Socle : `ml/reel` (le vrai jeu publié, sans écran, piloté au clavier).

Ici : **ce que le bot voit, ce qu'il peut faire, et comment on le note.** Un cerveau est un programme lisible qui reçoit une *vue* et
rend un *ordre*, dix fois par seconde. Il ne touche jamais le jeu : ses yeux lisent, ses doigts appuient sur les touches d'un joueur.

| Fichier | Rôle |
|---|---|
| `yeux.js` | la vue : ce que le joueur voit, en nombres (route devant, pièces, jauges, vol, tronçons en contrebas) — et, depuis le 24/11 (yeux v2), **le radar** : l'issue prévue d'un vol pour plusieurs façons de piloter, les sorties de route, le virage, les couloirs, la ligne parfaite, l'aimant, le palier |
| `doigts.js` | les gestes → les cinq touches du clavier, aux délais d'une main (`HUMAIN`) ; le journal des touches |
| `piloter.js` | une course : charge le jeu, charge le cerveau dans un bac fermé, fait tourner l'enregistreur du jeu ; `rejouer` remet les touches d'une course sans le cerveau (étape 1 bis) |
| `mesures.js` | les chiffres d'une partie et d'un lot — les mêmes pour Sacha et pour les bots ; `partiesJoueurs` : les vraies parties des joueurs (doublons, pause, mort, seconde chance), pour `etalon.js` et `discerner.js` |
| `reference.js` | le bot écrit à la main : le point de départ à battre, et l'exemple du contrat |
| `noter.js` | note un cerveau sur N graines → `results/note-<nom>[-allege][-t<tmax>].json` |
| `autopsie.js` | raconte les dernières secondes d'une course (ce qu'il voyait, ce qu'il a ordonné) |
| `etalon.js` | lit les parties des joueurs (`etalon/` : Sacha au clavier, Léo au doigt) → la barre, et la compare aux notes des bots |
| `verifier.js` | les contrôles du contrat dans le vrai jeu, dont le bac fermé et, pour les yeux v2, « le radar ne touche pas le jeu », son coût, sa justesse. **À relancer après chaque mise à jour du jeu.** |
| `justesse.js` | la justesse du radar : ce qu'il **prévoit** contre ce qui **arrive**, sur de vraies courses (§ 2 ter) |
| `voltigeur.js` | le cerveau de mesure : il sort de la route exprès et tient une façon de piloter par vol (pour `justesse.js` et `verifier.js`) |
| `discerner.js` | le juge « humain ou bot » : un bot se distingue-t-il d'un vrai joueur, sur ce qui se voit d'une course ? (§ 4 bis) |

```bash
cd ml/bot
node verifier.js                         # le contrat tient-il ? (2 processus à la fois, 9 min ; --regime allege pour l'autre version du jeu ; --carte nuages : les contrôles du radar sur une seule map)
node justesse.js                         # le radar dit-il juste ? (le voltigeur, 6 maps × 3 graines ; --pas : les places image par image ; --cerveau reference.js)
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
`troncons` (voir plus bas) ·
`vitMult` (ce qui multiplie l'avance : 1 à 2,6) · `palier` : `n` (1 à 30), `pieces`, `manque` (pièces avant le suivant ; `null` au 30), `pousse` (poussée de la nitro), `jauge` (taille de la jauge), `elan`, `vmax` (m/s) ·
`aimant` : `moteur` (acquis au palier 16), `sol` [m en long, m de côté], `prise` (m), `vol` (m), `pomme` (rayon de la pomme dorée, 0 sans elle : les pièces seulement) ·
`invulnerable` (s restantes après une seconde chance).

**Au sol** : `lat` (écart à l'axe), `cap` (angle de la caisse par rapport à la route), `pente`, `devers` · `dessous` (roule sous la dalle) ·
`drift`, `glisse` (flaque), `rebond`, `sursis` · `figureRoute`, `bond` (hauteur du bond d'une figure sur la route) ·
`lacetRoute`, `lacetMax` (pour tenir une ligne) ·
`route` : à 30, 60, 100, 150, 220, 300, 400, 550 m devant — `virage` (de combien elle a tourné), `monte`, `devers`, `envers`, `trou` ·
`piecesDevant` (par tranches de 25 m : `d`, `lat` moyen, `n`) · `plaques` · `fruits` (ils remplissent la réserve) · `orbes` (pouvoirs) · `flaques` (`rayon`) ·
`modules` (les deux prochains morceaux nommés de la route) ·
`arret` (s passées sous 22 km/h : la caisse explose à 6) · `rayonMin` (le plus petit rayon qu'elle tient à cette vitesse, volant à fond) ·
`virage` : le prochain virage sur 400 m ou 4 s de route — `d`, `sens` (+1 à gauche), `rayon`, `angle`, `vSure`, `vSureDrift`, `vCorde`, `marge` (`vSure` − ma vitesse), `braquage` (part de volant qu'il demande ; au-dessus de 1 il ne passe pas). **Au-dessus de `vSure` l'axe ne se tient plus ; `vCorde` est la borne en coupant le virage** (optimiste) ·
`couloirs` (jusqu'à 900 m : `d0`, `d1`, `genre` — couloir, tunnel, mine, ville —, `plafond`) et `mur` (`ici`, `bord`, `angle`, `mortel`) : **dans un couloir le bord est un mur ; il tue au-delà de 0,52 rad et de 200 km/h** ·
`ligne` : la ligne parfaite — `cadence` (s entre deux objets), `don` (nitro rendue par objet : 1,15, contre 0,8 perdu par seconde nitro tenue — 1 brûlé, 0,2 refait), `prises` (un fruit se prend à 4,5 m de côté, une plaque à 5,6 m), `objets` (les 4 prochains : `d`, `lat`, `type` fruit ou plaque, `don`) ; `null` hors course ·
`sautRefuse` (le jeu refusera le saut : sous la dalle, avant une crête ou un retournement, pendant un rebond) ·
`tenue` : la route se tient-elle 3 s, volant au mieux ? `tient`, sinon `t` (s avant le bord), `cote`, `s`, `mur`, `mortel` ·
`sorties` : le radar lancé depuis le bord (voir « Le radar »).

**En vol** (`vue.vol`) : `t` (temps en l'air), `reste` (avant l'explosion des 6 s), `monte` (vitesse verticale), `plancher` (hauteur au-dessus du fond mortel) ·
`proche` : la route la plus proche — `lat` (à côté), `haut` (au-dessus, le long de SA normale), `avant`, `cote`, `versRoute` (vitesses), `axe` (angle d'arrivée) ·
`anneau` : l'anneau de pose que le joueur voit — `delai`, `dist`, `dessous`, `gisement` ·
`figure` : `enCours`, `reste` (s pour finir), `angle` (rad restants), `ecart` (à l'endroit), `budget` (s avant la pose, selon le jeu) · `figuresDuVol` ·
`air` : `reste` (la **vraie** marge avant l'explosion — `vol.reste` ment sous le raisin, qui double la jauge : lire `air.reste`), `jauges` (2 tant que la première du raisin court) ·
`perdu` (s passées « perdu » sous la route : au-delà de 2,2 la mort par jauge s'écrit « vide ») · `hautRoute` (sur la route sans haut ni bas, le haut du vol est la face quittée ; `monte` et `plancher` restent ceux du monde) ·
`bascule` (s depuis la sortie par le bord : la lèvre raccroche tant qu'elle est sous 1) · `bumps` (rebonds sur la tranche pendant ce vol) · `radar`.

**Les tronçons** (`vue.troncons`, au sol et en vol) : les morceaux de route en contrebas que la caisse peut atteindre — la matière des raccourcis.
Jusqu'à quatre, le plus gros gain d'abord : `s`, `gain` (piste sautée moins distance volée ; le jeu crie RACCOURCI à 60 m), `dist`, `chute`,
`gisement` (à gauche ou à droite de ma trajectoire), `axe` (angle d'arrivée ; pose propre sous 55°), `tChute`, `tTrajet`, `longueur`.

### 2 bis. Le radar (yeux v2, 24/11)

En vol, `vue.vol.radar` rejoue le vol **image par image, avec les lois du jeu**, pour plusieurs façons de piloter, et donne pour chacune l'**issue**.
`radar` : `pas` (1/60 s), `court` (2 s) et `long` (ce qu'il reste d'air, 6 s au plus : les deux horizons), `decor` (ce qui est sondé : grotte, jade, canyon,
ville, espace), `maille` (m entre deux sondes du décor), `aveugle` (ce qui ne l'est pas ici), `approx`, et `rayons`, toujours dans cet ordre :

| Rayon `m` | L'ordre à tenir pour l'obtenir | Horizon |
|---|---|---|
| `tenu` | rien de neuf : les touches telles qu'elles sont | long |
| `rien` | `{}` | long |
| `gauche`, `droite` | `{volant:1}`, `{volant:-1}` | court |
| `cabre`, `pique` | `{manche:1}`, `{manche:-1}` | court |
| `plane` | `{nitro:true}` (un coup de réacteur à l'allumage, puis le plané) | long |
| `planeCabre` | `{nitro:true, manche:1}` | court |
| `versRoute`, `versRoutePlane` | la loi ci-dessous, redécidée à chaque vue (sans, puis avec la nitro) | long |

Chaque rayon : `issue`, `t` (**secondes de jeu** avant elle), `d` (m volés), `bumps` (s'il rebondit sur la tranche en route), `nitro` (part de jauge à l'issue, rayons à nitro), puis selon l'issue :

- `pose` : `s`, `lat` (+ à gauche, sur la face de pose), `axe` (rad ; au-delà de 55° — 0,96 — la pose est ratée, au-delà de π/2 c'est un contresens), `impact` (m/s vers la dalle),
  `note` (`parfaite` sous 2,16 m/s, `lourde` à partir de 4,8, sinon `bonne`), `dessous`, `centre` (à moins de 0,3 × `demi` de l'axe : PILE AU CENTRE), `gain` (le raccourci, comme le jeu le compte),
  `air` (jauge restante), `propre` (axe sous 55° et plus aucune figure qui tourne) ;
- `levre` : le pneu raccroche le bord (`s`, `cote`) — la caisse est sauvée, rien n'est payé ;
- `choc` : `cause`, le mot du jeu (roche, lave, eau, pic, tour, sol, paroi, riviere, canyon…) ;
- `air` (jauge vide), `fond` (120 m sous le point le plus bas de la piste), `portail` ;
- `libre` : rien avant l'horizon — `haut`, `lat`, `s` par rapport à la route la plus proche à ce moment-là ; `coupe` : le budget de calcul est épuisé (même chose).

**La loi `versRoute`**, pour qu'un cerveau puisse la suivre (c'est celle du bot de référence sans son anneau) : avec `p = vue.vol.proche`,
`volant = borne((borne(-p.lat/40, ±0,6) − p.axe) × 1,6, ±1)` si `|p.axe| < 1,6` ; `manche = -1` (piquer) si `p.haut > 10`, `|p.lat| < 2 × demi`
et que la route est à plus de 2 s dessous (`p.haut / max(1, p.versRoute)`) ou trop loin pour l'air qu'il reste.

**Au sol, `vue.sorties`** : le même radar lancé depuis la sortie de route. `null`, ou `{pourquoi, bord, gauche, droite, saut}`, chaque sortie
`{t (s avant de décoller), s, cote, approx, rayons}` (ou `{issue}` si elle n'a pas lieu : la route tient, un mur, le portail) :
- `bord`, **d'office**, quand `tenue` annonce le bord dans 1,5 s : rayons `rien`, `versRoute`, `plane` ;
- `gauche`, `droite` (plein volant dès maintenant jusqu'au bord) et `saut` (le geste `saut` : 0,42 s de route puis le décollage ; absent si `sautRefuse`),
  **à la demande** : l'ordre d'avant doit porter `regarder:'sorties'` (§ 3). Rayons `rien` et `plane`, sur 3 s.

À savoir pour s'en servir :

- **Le radar compte les délais de la main.** Un ordre ne passe pas à l'image suivante : une touche enfoncée ou relâchée le reste 4 images, et après le
  geste `saut` les doigts tiennent encore la NITRO et le manche quelques images (`doigts.js`, `delais` ; `piloter.js` les donne aux yeux à chaque vue).
  Chaque rayon garde donc chaque touche dans son état du moment pendant son délai, puis applique son ordre. Un **geste** en vol (figure, redresser)
  n'est pas prévu : l'appui seul donne un coup de réacteur. Hors d'une course (`voir(J)` sans les doigts), l'ordre est supposé tenu dès l'image suivante.
- Un rayon dont l'ordre est déjà celui des touches recopie `tenu` (son horizon est alors le long).
- **Tout ce qui part du sol est une estimation** (`approx`) : la vitesse est tenue, sans drift ni flaque. Le saut prend l'impulsion du dernier saut de la
  course (`saut.mesure` vrai) ; avant le premier, le plancher du jeu (`mesure` faux : le vrai saut monte plus haut et retombe plus loin).
- **Les rayons `versRoute`** sont joués volant dosé, redécidés 10 fois par seconde : au clavier le dosage se fait en tapotant (`approx`).
- `t` est en secondes de jeu ; pendant le ralenti de la frénésie, `radar.approx` est vrai.

**Ce que les yeux ne voient toujours pas** : le glacier et les dunes (hors du tirage : `aveugle`), la ville vitrée au-delà de son sol, la route d'après le portail,
un obstacle plus mince que `maille`, les montagnes de jade qui tombent (elles sont vues à leur place du moment), les filets de virage. **Au canyon, dans le
simulateur `ml/reel`, il n'y a rien à voir : le relief n'y existe pas** (son calcul part dans un travailleur qui ne répond jamais ; `?cyw=0` le calcule sur
place) — ni paroi, ni rivière, ni mur de couloir. Défaut connu, laissé tel quel : sous la dalle, les `lat` des pièces, fruits et orbes de la vue d'avant sont en miroir
(`ligne.objets` est dans le bon repère).
Les tronçons sont un calcul simple (chute verticale, sans le plané ni les maps où le haut suit la route) : une piste, pas une promesse.

### 2 ter. Ce que vaut le radar (`justesse.js`)

Le radar ne vaut que par son tableau « prévu / arrivé ». **Mesuré le 24/11/2026**, version allégée, le voltigeur sur 6 maps × 5 graines (57 vols, `results/justesse-allege.json`) :

| Où le rayon est pris | Issue juste | Poses : écart médian (90 % des poses sous…) |
|---|---|---|
| à la première vue du vol | 57 / 57 | 0 s (0,02) · 0,2 m le long de la piste (2,3) · 0,03 m de côté (0,16) |
| à la première vue où les doigts tiennent la façon | 57 / 57 | 0 s (0) · 0,2 m (0,4) · 0,03 m (0,86) |
| une seconde avant la fin du vol | 51 / 51 | 0 s (0,02) · 0,2 m (1,5) · 0,03 m (0,11) |

- la **note** de la pose (parfaite, bonne, lourde) est la bonne 22 fois sur 22 ; les 8 **chocs** contre le décor (roche, pic, tour) sont vus : 6 avec leur cause dès la première vue, 2 par un rayon court (2 s) qui les dit « libre » parce qu'ils arrivent plus loin que son horizon ;
- **le pas à pas** (`--pas`, 44 vols, `results/justesse-allege-pas.json`) : les places prévues image par image sont celles du jeu **au centimètre sur tout le vol, 44 fois sur 44** ; l'issue tombe à l'image près 38 fois sur 41 (3 chocs vus une image trop tard : la grotte et les pics de jade sont sondés une image sur deux) ;
- **les sorties du sol** (50) : une sortie franche est annoncée à 0,07 s près (médiane ; 0,5 s pour une sur dix) et l'issue du vol qui suit est juste 16 fois sur 17 ; un saut décolle à l'image annoncée, mais **avant le premier saut de la course sa pose est annoncée 0,7 s et 45 m trop tôt** (voir « Le radar ») ;
- **le bot de référence** (rayon `tenu`, 12 vols, `results/justesse-allege-reference.json`) : 10 sur 12 — il change d'ordre pendant ses vols, et `tenu` ne dit que ce qui arrive si rien ne change ;
- **le canyon avec son relief** (`--requete "&cyw=0"`, 8 vols) : 8 sur 8, les 4 chocs « paroi » prévus avec leur cause.

Ce que cette mesure ne dit pas : 57 vols, c'est peu. Le voltigeur meurt vite (2 à 3 vols par course) et n'a tiré ni `cabre`, ni `pique`, ni `versRoute` sans nitro ; les rayons `versRoute*` ne sont jugés que sur 8 vols. **Ce qui a rendu la première vue juste** (elle ne l'était que 54 fois sur 57) : le radar tient compte des **délais de la main** (`Doigts.prototype.delais`, `doigts.js`) — au décollage, les doigts tiennent encore quelques images les touches d'avant (une flèche du volant, la NITRO et le manche du geste `saut`) ; ces images-là suffisent à déplacer la pose de 9 m.

`node justesse.js` refait le tableau (6 maps × 3 graines, le voltigeur ; `--pas` : les places image par image ; `--cerveau reference.js` : le rayon `tenu`
d'un vrai cerveau ; `--requete "&cyw=0"` : le canyon avec son relief). C'est aussi le **détecteur de dérive** : une loi du jeu qui change sans que sa copie
dans `yeux.js` suive se voit là. **Ce que ça coûte** : sur la course du contrôle 3 de `verifier.js` (150 s, le bot de référence, 4 % des vues en vol), **0,74 ms par vue contre 0,39 sans le radar** (au sol 0,66 ms, en vol 2,6), et une vue de 2 360 caractères contre 1 640. Une vue en vol coûte de 1 à 2 ms sans décor, **2 à 4,5 ms devant la ville, la grotte ou les pics de jade** (les sondes du décor sont des fonctions du jeu : la cible de 2,5 ms n'y est pas tenue), et 13 à 18 ms au canyon avec son relief (une sonde y coûte 134 µs). Un pilote qui volerait autant qu'un joueur (29 % du temps) paierait de l'ordre de 1,5 ms par vue.

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
| `regarder:'sorties'` | *pas un geste* : demande aux yeux, pour la vue **suivante**, les sorties à gauche, à droite et par un saut (`vue.sorties`, § 2 bis) | aucune |

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
