# ml/bot — le contrat du bot (étape 1 du plan BOTS-ML)

Plan : `passation/BOTS-ML.md`. Socle : `ml/reel` (le vrai jeu publié, sans écran, piloté au clavier).

Ici : **ce que le bot voit, ce qu'il peut faire, et comment on le note.** Un cerveau est un programme lisible qui reçoit une *vue* et
rend un *ordre*, dix fois par seconde. Il ne touche jamais le jeu : ses yeux lisent, ses doigts appuient sur les touches d'un joueur.

| Fichier | Rôle |
|---|---|
| `yeux.js` | la vue : ce que le joueur voit, en nombres (route devant, pièces, jauges, vol, tronçons en contrebas) — et, depuis le 24/11 (yeux v2), **le radar** : l'issue prévue d'un vol pour plusieurs façons de piloter, les sorties de route, le virage, les couloirs, la ligne parfaite, l'aimant, le palier |
| `doigts.js` | les gestes → les cinq touches du clavier, aux délais d'une main (`HUMAIN`) ; le journal des touches — et, depuis le 24/11 (doigts v2), **la main à profil** : temps de réaction, volant par coups irréguliers, suivi à chaque image, drift, seconde chance, erreurs, hasard à graine (§ 3.1 à 3.7) |
| `piloter.js` | une course : charge le jeu, charge le cerveau dans un bac fermé (et son `profil`, borné), fait tourner l'enregistreur du jeu ; `rejouer` remet les touches d'une course sans le cerveau (étape 1 bis) |
| `mesures.js` | les chiffres d'une partie et d'un lot — les mêmes pour Sacha et pour les bots ; `partiesJoueurs` : les vraies parties des joueurs (doublons, pause, mort, seconde chance), pour `etalon.js` et `discerner.js` ; `mainDe` / `mainLot` : ce qui se lit de la main (coups de volant, nitro) |
| `appuis.js` | la main d'un bot contre celle des joueurs : coups de volant par minute, leurs durées, changements de sens, nitro (§ 3.8) |
| `essai-main.js` | le cerveau d'essai de la main : la conduite du bot de référence sans ses gestes, et un profil « humain » écrit en entier (un exemple, pas un pilote) |
| `reference.js` | le bot écrit à la main : le point de départ à battre, et l'exemple du contrat |
| `noter.js` | note un cerveau sur N graines → `results/note-<nom>[-allege][-t<tmax>].json` |
| `autopsie.js` | raconte les secondes d'avant chaque mort d'une course, puis sa fin (ce qu'il voyait, radar compris, ce qu'il a ordonné) |
| `etalon.js` | lit les parties des joueurs (`etalon/` : Sacha au clavier, Léo au doigt) → la barre, et la compare aux notes des bots |
| `verifier.js` | les contrôles du contrat dans le vrai jeu, dont le bac fermé ; pour les yeux v2, « le radar ne touche pas le jeu », son coût, sa justesse ; pour les doigts v2, la main sans profil inchangée, une main à profil répétable et rejouable par ses touches, la seconde chance (lue dans le jeu au toucher de la plaque) ; depuis le 25/11, les outils de la boucle (contrôle 14 : lire une réponse, la raison d'un pilote refusé, la ligne de journal d'une course reprise). **À relancer après chaque mise à jour du jeu.** |
| `justesse.js` | la justesse du radar : ce qu'il **prévoit** contre ce qui **arrive**, sur de vraies courses (§ 2 ter) |
| `voltigeur.js` | le cerveau de mesure : il sort de la route exprès et tient une façon de piloter par vol (pour `justesse.js` et `verifier.js`) |
| `voltigeur-route.js` | le second cerveau de mesure (25/11) : après un saut il tient `rien` ou `plane`, après une sortie par le bord la loi `versRoute` — ce qu'un pilote fera (`justesse.js --cerveau voltigeur-route.js`, avec ou sans `--profil clavier`) |
| `discerner.js` | le juge « humain ou bot » : un bot se distingue-t-il d'un vrai joueur, sur ce qui se voit d'une course ? (§ 4 bis) |
| `voltige.js` | (26/11) les vols un par un, joueurs et bots comptés pareil : d'où ils partent, de quel côté du virage, la piste gagnée (raccourcis), la durée, la hauteur, les figures. `node voltige.js` : les joueurs ; `node voltige.js <note --parties>` : un bot ; `--vols` : la liste |
| `ressemblance.js` | (26/11) **l'écart aux joueurs** : la distance moyenne d'un lot de parties aux joueurs au clavier sur quinze mesures de ce qui se voit (nitro, vols, raccourcis, figures, poses, dessous de la dalle, slalom, vitesse), en écarts-types d'une partie à l'autre, chacun borné à 8 (4 jusqu'au soir du 26/11 : un bot caché sous la dalle, z +7,7, n'y payait pas plus qu'à z +4). 0 = au milieu des joueurs ; `pilote.js` 3,05, le pilote qui vole 2,02 ; une partie de joueur contre les autres 0,9. Un nombre qui bouge à chaque pas, là où l'AUC du juge reste à 0,97 : c'est lui que la boucle note (`--critere mixte` = palier médian − 6 × écart). `node ressemblance.js <note --parties>` ; sans argument : les joueurs entre eux et la référence |

```bash
cd ml/bot
node verifier.js                         # le contrat tient-il ? (33 processus neufs, 2 à la fois, 11 min ; --regime allege pour l'autre version du jeu ; --carte nuages : les contrôles du radar sur une seule map)
node justesse.js --graines 5             # le radar dit-il juste ? (le voltigeur, 6 maps × 5 graines : refait results/justesse-allege.json ; les autres mesures du § 2 ter, commande par commande, sont sous son tableau)
node noter.js --tmax 300                 # LA note de référence documentée (20 graines, régime max, 300 s) → results/note-reference.json
node noter.js mon-cerveau.js --regime allege --coeurs 2     # 900 s au plus par défaut → results/note-mon-cerveau-allege-t900.json
node autopsie.js mon-cerveau.js --graine 910037 --regime allege --avant 6   # le MÊME régime et la MÊME --tmax que la note
node etalon.js                           # la barre des joueurs (etalon/), comparée à chaque note ; --nom=Leo : la barre d'un joueur
node discerner.js results/note-mon-cerveau-allege-t900.json --nom mon-cerveau   # une note faite avec --parties
node appuis.js results/note-mon-cerveau-allege-t900.json                        # sa main contre celle des joueurs (une note faite avec --parties)
```

---

## 1. Le contrat d'un cerveau

Un fichier JavaScript qui pose :

```js
module.exports = { nom: 'mon-cerveau', decide: function (vue, memoire) { return { ligne: 0, nitro: true }; } };
```

- `decide` est appelé **toutes les 6 images (10 fois par seconde)**. Il rend un ordre (§ 3), ou rien.
- **Le cerveau peut régler sa main** : `module.exports = { nom, profil: { … }, decide }` (§ 3.1). Le profil est lu **une fois**, au chargement, et
  borné : une valeur hors bornes y est ramenée, **un champ inconnu ou d'un mauvais type refuse le cerveau** (`charger` lève une erreur).
  Sans profil, ou avec un profil vide : exactement la main d'avant. `profil` ne règle **que la main** : les réglages de la conduite restent des
  constantes du fichier.
- **Le cerveau peut dire ses figures** (26/11) : `module.exports = { nom, garage: { figures: ['rodeo', 'chandelle', 'helico'] }, decide }` — les trois figures
  **équipées**, dans l'ordre avant, arrière, côté (le geste `figure` + `direction` joue celle de sa direction ; `gauche` et `droite` jouent celle du côté). Les
  douze du catalogue (`VERSION PRINCIPALE/figures.js`) : de côté `tailwhip`, `tonneau`, `toupie`, `shimmy`, `double`, `helico`, `penche` ; à l'arrière seulement
  `chandelle` ; devant ou derrière `salto`, `tirebouchon`, `rodeo`, `cosmique`. `''` = ce que la sauvegarde du débutant met là. Un id inconnu, ou une figure qui
  ne va pas à cet emplacement, **refuse le cerveau**. Sans `garage` : la sauvegarde du débutant (salto devant et derrière, tail whip de côté), la course d'avant
  au bit près. Le garage entre dans la sauvegarde du jeu avant le départ (`ml/reel/jeu-reel.js`, `o.sauvegarde` — le jeu n'est pas modifié), il est écrit dans
  la partie (`partie.bot.garage`), le bilan (`garage` : ce que le jeu a vraiment équipé) et le rejeu du labo, qui le remet. Ce n'est pas la main : il dit ce que
  le joueur **possède** (les figures chères rapportent plus d'aura, donc plus de pièces par pose : c'est un levier de niveau, comme la main).
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
⚠ **Une seule exception, sous la dalle (`dessous`)** : le `lat` des pièces, des fruits et des orbes y est en miroir (c'est le champ d'origine, gardé tel quel).
**Lire `latC` à la place, partout** : c'est le même côté dans le repère du conducteur, juste dessus comme dessous (ajouté le 25/11).

**Toujours** : `mode` (`sol`, `vol`, `boom`) · `fini`, `mort` (toujours `false` et `null` pour un cerveau : il n'est jamais appelé mort) · `t`, `image` · `carte`, `meteo` · `s` (où j'en suis sur la piste), `fin` (distance au portail), `L` ·
`vitesse` (m/s) · `volant` (le braquage en cours) · `demi` (demi-largeur de la route, 28 m) ·
`nitro` (part de la jauge, 0 à 1), `reserve` (réserve bleue), `nitroOn`, `nitroLibre` (elle est offerte : départ ou pouvoir) ·
`flow`, `flowNiveau` (0 à 4) · `argent`, `pieces`, `figures`, `chaine`, `moteur` (**le palier moins 1** : 0 à 29 ; pour le palier de 1 à 30, lire `palier.n`) · `pouvoirs` (secondes restantes : nitro, vitesse, air, aimant) ·
`troncons` (voir plus bas) ·
`vitMult` (ce qui multiplie l'avance : 1 à 2,6) · `palier` : `n` (1 à 30), `pieces`, `manque` (pièces avant le suivant ; `null` au 30), `pousse` (poussée de la nitro), `jauge` (taille de la jauge), `elan`, `vmax` (m/s) ·
`aimant` : `moteur` (acquis au palier 16), `sol` [m en long, m de côté], `prise` (m), `vol` (m), `pomme` (rayon de la pomme dorée, 0 sans elle : les pièces seulement) ·
`invulnerable` (s restantes après une seconde chance).

**Au sol** : `lat` (écart à l'axe), `cap` (angle de la caisse par rapport à la route), `pente`, `devers` · `dessous` (roule sous la dalle) ·
`drift`, `glisse` (flaque), `rebond`, `sursis` · `figureRoute`, `bond` (hauteur du bond d'une figure sur la route) ·
`lacetRoute`, `lacetMax` (pour tenir une ligne) ·
`route` : à 30, 60, 100, 150, 220, 300, 400, 550 m devant — `virage` (de combien elle a tourné), `monte`, `devers`, `envers`, `trou` ·
`piecesDevant` (par tranches de 25 m : `d`, `lat` moyen, `n`, **`latC`**) · `plaques` (`d`, `lat`) · `fruits` (ils remplissent la réserve : `d`, `lat`, `nom`, `force`, **`latC`**) ·
`orbes` (pouvoirs : `d`, `lat`, `pouvoir`, **`latC`**) · `flaques` (`d`, `lat`, `rayon`) — `latC` est le côté à viser (voir l'exception en tête) ; les plaques, les flaques et `ligne.objets` n'ont pas ce défaut ·
`modules` (les deux prochains morceaux nommés de la route : `nom`, `d0`, `d1`, `climax`) ·
`arret` (s passées sous 22 km/h : la caisse explose à 6) · `rayonMin` (le plus petit rayon qu'elle tient à cette vitesse, volant à fond) ·
`virage` : le prochain virage sur 400 m ou 4 s de route — `d`, `sens` (+1 à gauche), `rayon`, `angle`, `vSure`, `vSureDrift`, `vCorde`, `marge` (`vSure` − ma vitesse), `braquage` (part de volant qu'il demande ; au-dessus de 1 il ne passe pas). **Au-dessus de `vSure` l'axe ne se tient plus ; `vCorde` est la borne en coupant le virage** (optimiste) ·
`couloirs` (jusqu'à 900 m : `d0`, `d1`, `genre` — couloir, tunnel, mine, ville —, `plafond`) et `mur` (`ici`, `bord`, `angle`, `mortel`) : **dans un couloir le bord est un mur ; il tue au-delà de 0,52 rad et de 200 km/h** ·
`ligne` : la ligne parfaite — `cadence` (s entre deux objets), `don` (nitro rendue par objet : 1,15, contre 0,8 perdu par seconde nitro tenue — 1 brûlé, 0,2 refait), `prises` (un fruit se prend à 4,5 m de côté, une plaque à 5,6 m), `objets` (les 4 prochains : `d`, `lat`, `type` fruit ou plaque, `don`) ; `null` hors course. ⚠ `don` et le 0,8 par seconde sont en **unités de jauge du jeu**, pas en parts de jauge comme `vue.nitro` et `vue.reserve` : diviser par `palier.jauge` (2,0 au palier 1, 3,6 au palier 30) pour les comparer — 1,15 vaut 57 % de la jauge au palier 1 et 32 % au palier 30 ·
`sautRefuse` (le jeu refusera le saut : sous la dalle, avant une crête ou un retournement, pendant un rebond, pendant un demi-tour, **moins de 0,9 s après la figure d'avant, ou la jauge plus la réserve sous 35 %** — le prix de la figure qui porte le saut, sauf nitro offerte ; ajouté le 25/11. La main, elle, joue quand même le geste jusqu'au bout : ↓ tenu au sol, c'est le frein. Une figure déjà en cours — `figureRoute` — n'est pas un refus : voir `sorties.saut`) ·
`tenue` : la route se tient-elle 3 s, volant au mieux ? `tient`, sinon `t` (s avant le bord), `cote`, `s`, `mur`, `mortel` ; `approx` toujours vrai (une estimation : la vitesse tenue, ni drift ni flaque) ·
`sorties` : le radar lancé depuis le bord (voir « Le radar »).

**En vol** (`vue.vol`) : `t` (temps en l'air), `reste` (avant l'explosion des 6 s), `monte` (vitesse verticale), `plancher` (hauteur au-dessus du fond mortel), `lacetMax` (rad/s : de combien le vol tourne au plein volant) ·
`proche` : la route la plus proche — `lat` (à côté), `haut` (au-dessus, le long de SA normale), `avant`, `cote`, `versRoute` (vitesses), `axe` (angle d'arrivée), **`envers`** (la caisse vole tête en bas par rapport à cette route — après une sortie depuis le dessous de la dalle : **le volant y tourne à l'envers**, ← envoie vers la droite de la route ; ajouté le 25/11) ·
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
ville, espace), `maille` (m entre deux sondes du décor : depuis le 25/11 le décor est sondé **à chaque image**, comme le jeu le juge — le canyon aussi depuis
les finitions de l'étape B, par une borne du relief qui évite le calcul du terrain là où il ne peut pas toucher : la réponse reste celle du jeu), `aveugle` (ce qui ne l'est pas ici : `glacier`, `dunes`, `roches`), `approx`, et `rayons`.

**`rayons` est un TABLEAU** d'objets `{ m, issue, t, … }` — le nom du rayon est dans le champ `m`, toujours dans l'ordre du tableau ci-dessous. On ne lit donc
pas `rayons.versRoute` (toujours `undefined`, sans aucune erreur) : on cherche le rayon par son nom. Et on teste avant de lire : `vue.vol` n'existe qu'en vol,
`radar` peut valoir `null` (caisse tenue au portail, pas d'air) ou `{ erreur }` sans `rayons`.

```js
const R = vue.vol && vue.vol.radar && vue.vol.radar.rayons;          /* un tableau, ou rien */
const r = Array.isArray(R) ? R.find(x => x.m === 'versRoute') : null;
if (r && r.issue === 'pose') { /* … r.t, r.s, r.axe, r.note … */ }
```

Les rayons :

| Rayon `m` | L'ordre à tenir pour l'obtenir | Horizon |
|---|---|---|
| `tenu` | rien de neuf : les touches telles qu'elles sont | long |
| `rien` | `{}` | long |
| `gauche`, `droite` | `{volant:1}`, `{volant:-1}` | court |
| `cabre`, `pique` | `{manche:1}`, `{manche:-1}` | court |
| `plane` | `{nitro:true}` (un coup de réacteur à l'allumage, puis le plané) | long |
| `planeCabre` | `{nitro:true, manche:1}` | court |
| `versRoute`, `versRoutePlane` | la loi ci-dessous, redécidée toutes les 6 images comme un cerveau — mais toutes les 30 images (deux fois par seconde) tant que la route la plus proche est à plus de 60 m (sans, puis avec la nitro) | long |
| `viser`, `viserPlane` (26/11) | **le raccourci** : rejoindre un morceau de piste plus loin et plus bas (`cible` : son abscisse), sans puis avec la nitro. La loi est donnée toute faite dans `vue.vol.cible` (`volant`, `manche`) : la recopier dans l'ordre à chaque décision, avec `cible: <abscisse>` pour que la vue suivante porte sur la même cible. Voir « Le rayon viser » plus bas | long |

Chaque rayon : `issue`, `t` (**secondes de jeu** avant elle), `d` (m volés), `bumps` (s'il rebondit sur la tranche en route), `nitro` (part de jauge à l'issue, rayons à nitro), puis selon l'issue :

- `pose` : `s`, `lat` (+ à gauche, sur la face de pose), `axe` (rad ; au-delà de 55° — 0,96 — la pose est ratée, au-delà de π/2 c'est un contresens), `impact` (m/s vers la dalle),
  `note` (`parfaite` sous 2,16 m/s, `lourde` à partir de 4,8, sinon `bonne`), `dessous`, `centre` (à moins de 0,3 × `demi` de l'axe : PILE AU CENTRE), `gain` (le raccourci, comme le jeu le compte),
  `air` (jauge restante), `propre` (axe sous 55° et plus aucune figure qui tourne) ;
- `levre` : le pneu raccroche le bord (`s`, `cote`) — la caisse est sauvée, rien n'est payé ;
- `choc` : `cause`, le mot du jeu (roche, lave, eau, pic, tour, sol, paroi, riviere, canyon…) ;
- `air` (jauge vide), `fond` (120 m sous le point le plus bas de la piste), `portail` ;
- `libre` : rien avant l'horizon — `haut`, `lat`, `s` par rapport à la route la plus proche à ce moment-là ; `coupe` : le budget de calcul est épuisé (même chose).

**La loi `versRoute`**, pour qu'un cerveau puisse la suivre (c'est celle du bot de référence sans son anneau) : avec `p = vue.vol.proche`,
`volant = borne((borne(-p.lat/40, ±0,6) − p.axe) × 1,6, ±1) × (p.envers ? −1 : 1)` si `|p.axe| < 1,6` (tête en bas par rapport à la route, le volant se retourne :
sans cela la caisse s'éloigne de l'axe — corrigé le 25/11) ; `manche = p.envers ? 1 : −1` (piquer vers la route ; tête en bas, c'est cabrer) si `p.haut > 10`,
`|p.lat| < 2 × demi` et que le délai avant la route (`p.haut / max(1, p.versRoute)`) dépasse 2 s, ou dépasse l'air qu'il reste moins 1 s — **`vol.air.reste − 1`**,
la vraie marge (raisin compris), pas `vol.reste`, qui ment sous le raisin. Sinon `manche = 0`. Le radar la recalcule toutes les 6 images, et deux fois par seconde
seulement loin de la route (à plus de 60 m de la dalle la plus proche).
Le bot de référence (`reference.js`) suit encore la loi d'avant, sans `envers` : il n'a pas été touché (sa course changerait dans ce cas-là).

**Le rayon `viser` (26/11/2026 — « ils n'osent pas prendre des raccourcis évidents »).** Mesuré sur les 10 parties au clavier (`node voltige.js`) : 43 % des
poses des joueurs sont des raccourcis (3,5 par minute), 413 m de piste gagnés en médiane, sur toutes les cartes (grotte 5 par minute, nuages 4,2, jade 4,4,
ville 4,3, espace 1,9, canyon 1,2), en 2,7 à 3,3 s de vol, à 47–130 m de haut. Ce ne sont pas des virages coupés à plat (une corde gagne une dizaine de mètres)
mais des **plongeons vers un morceau de route en contrebas**. Avant le 26/11 aucun rayon ne disait si un tel plongeon se pose : `rien` et `plane` filent droit,
`versRoute` revient à la dalle la plus proche, celle qu'on vient de quitter.
- **Les cibles** (`ciblesDe`, `yeux.js`) : les morceaux de piste qu'un vol peut atteindre depuis son état — au moins 100 m de piste gagnés (comme le jeu compte),
  4 m plus bas au moins, à 3,6 s de trajet au plus, ni trop haut ni trop bas pour ce temps, pas derrière. Les deux meilleurs (le gain, moins 70 m par seconde de
  trajet), écartés de 150 m. Ce n'est qu'une **proposition** : c'est le rayon, joué image par image avec les lois du jeu, qui dit si ça se pose. (`vue.troncons`,
  l'ancien calcul — une chute libre en ligne droite —, reste dans la vue mais ne sert plus aux rayons : il n'offrait que 4 occasions en 300 s de course.)
- **La loi** : celle de `versRoute`, mais vers **le morceau visé** (le point d'axe le plus proche dans une fenêtre de 250 m avant à 700 m après la cible) : un cap
  vers son axe (jusqu'à 0,9 rad tant qu'on en est à plus de 1,5 largeur, 0,6 au-dessus), puis le long de lui ; le manche pique si la descente tarde, cabre si l'on
  arrive trop bas avant d'être au-dessus. Redécidée toutes les 6 images. Fenêtre dépassée : `versRoute`.
- **En vol** : `vue.vol.radar.rayons` porte en plus `viser` et `viserPlane` (chacun avec `cible`, l'abscisse visée), vers la cible que l'ordre d'avant a
  demandée (`cible: <abscisse>` dans l'ordre), sinon vers la meilleure cible du moment ; et `vue.vol.cible` = `{ s, volant, manche, pres, dist, chute, lat, haut,
  axe, demandee }` : **le volant et le manche que la loi donne à cet instant** — le pilote les recopie. Ils viennent APRÈS les dix autres rayons, avec leur propre
  budget (`BUDGET.viser`, 740 images par cible) : les dix premiers ne changent pas d'une image.
- **Au sol** : chaque sortie `gauche` / `droite` de `vue.sorties` porte en plus `viser` et `viserPlane` vers une ou deux cibles vues depuis son décollage.
- **Ce que ça vaut, mesuré le 26/11** (12 courses de 300 s, la main `clavier`, `ml/ecurie/pilote-voltige.js` sans figures) : 30 plongeons engagés sur l'annonce
  d'un rayon du sol, 28 posés, 19 raccourcis de 396 m en médiane (les joueurs : 413 m) ; **à la grotte et au canyon l'annonce du sol est fausse** (4 sorties
  sur 4 finissent contre la roche en moins de 1,5 s) : pas de mesure de justesse dédiée (`justesse.js` ne tire pas encore ces rayons). Estimation (`approx`), toujours.

**Au sol, `vue.sorties`** : le même radar lancé depuis la sortie de route. `null`, ou `{pourquoi, bord, gauche, droite, saut}`, chaque sortie
`{t (s avant de décoller), s, cote, approx, rayons}` (ou `{issue}` si elle n'a pas lieu : la route tient, un mur, le portail) :
- `bord`, **d'office**, quand `tenue` annonce le bord dans 1,5 s : rayons `rien`, `versRoute`, `plane`, sur 6 s. Elle suppose une caisse qui essaie de tenir la route ;
- `gauche`, `droite` (plein volant dès maintenant jusqu'au bord), **à la demande** : l'ordre d'avant doit porter `regarder:'sorties'` (§ 3). Rayons `rien` et `plane`
  sur 3 s, et **`versRoute` sur 6 s** (ajouté le 25/11 : c'est lui qui dit si la sortie est vivable — `rien` et `plane` s'éloignent du bord et répondent presque toujours
  « libre » pour des vols qui meurent ensuite, jauge vide) ;
- `saut` (le geste `saut`), **à la demande** aussi : rayons `rien` et `plane` sur 3 s, plus `impulsion` (celle que le rayon suppose), `mesure` et `fleche`.
  Absent si `sautRefuse` ; `{issue:'figure'}` si une figure tourne déjà sur la route (le geste peut alors faire décoller du bond en cours : **non prévu**).
  Le radar joue le geste comme la main sans profil le joue, image par image (mesuré dans le jeu le 25/11) : 24 images de route (`t` = 0,42 s), puis en vol la
  NITRO et le manche tenus **5** images, la NITRO **relâchée jusqu'à la 27e image** (la main ne peut pas la reprendre avant : le rayon `plane` du saut ne plane
  donc qu'à partir de là), et **une flèche du volant des images 6 à 9** si l'ordre du moment braque (`fleche` : +1 ←, −1 →, 0 rien). Cette flèche vient de la
  main : à la fin du geste elle applique en plein vol le volant du dernier ordre donné au sol (`ligne` ou `volant`), et le radar suppose que cet ordre est celui
  de la vue. **Pour sauter droit, donner `volant: 0` (et pas `ligne`) aux décisions qui suivent l'ordre de saut** : la flèche ne part pas ; le rayon, lui, l'aura
  comptée si `fleche` n'était pas 0 (4 à 5 m d'écart après 0,5 s de vol).

Pour les lire, la même prudence qu'en vol : `vue.sorties` vaut `null` le plus souvent, chacune des quatre sorties peut valoir `null`, et une sortie qui n'a pas lieu
est `{ issue, t, s }` **sans `rayons`** :

```js
const B = vue.sorties && vue.sorties.bord;                             /* null, { issue } ou { t, s, cote, rayons } */
const vr = B && Array.isArray(B.rayons) ? B.rayons.find(x => x.m === 'versRoute') : null;
const revient = !!(vr && (vr.issue === 'pose' || vr.issue === 'levre'));
```

À savoir pour s'en servir :

- **En vol, le radar compte les délais de la main.** Un ordre ne passe pas à l'image suivante : une touche enfoncée ou relâchée le reste 4 images, et après le
  geste `saut` les doigts tiennent encore la NITRO et le manche quelques images, puis la NITRO reste relâchée jusqu'à 27 images après son appui (`doigts.js`,
  `delais` ; `piloter.js` les donne aux yeux à chaque vue). Chaque rayon garde donc chaque touche dans son état du moment pendant son délai, puis applique son
  ordre. Un **geste** en vol (figure, redresser) n'est pas prévu : l'appui seul donne un coup de réacteur. Hors d'une course (`voir(J)` sans les doigts), l'ordre
  est supposé tenu dès l'image suivante.
- **Au sol, pour une main sans profil, aucun délai n'est compté** dans `vue.sorties` (seul le déroulé du geste `saut` l'est) : « gauche » et « droite » braquent
  à fond dès l'image suivante, et chaque rayon applique son ordre dès la première image du vol.
- **Avec une main à profil** (§ 3.1) — depuis le 25/11, mesuré une seule fois (§ 2 ter), à prendre comme une estimation :
  au sol, la réaction déjà tirée est **roulée avant** le plein volant ou le geste (la caisse tient encore la route pendant ce temps), et une fois en l'air les touches
  du décollage (la flèche de la sortie, la NITRO) tiennent encore le temps d'une réaction avant que l'ordre du rayon ne parte ; en vol, le temps de réaction du canal
  s'ajoute au délai de chaque touche (il est tiré d'avance : le radar lit le vrai). Pour un **volant par coups ou tenu par le suivi**, la flèche du moment tient jusqu'à
  la fin de son coup (déjà tirée), puis le radar joue **la part de braquage moyenne** de l'ordre en vigueur et des ordres déjà en route, jusqu'à l'arrivée de l'ordre du
  rayon — les coups suivants sont tirés au hasard de la main, que les yeux ne lisent pas. `tenu` vaut alors « l'ordre en vigueur », et **tous les rayons sont `approx`**.
  En vol, avec une telle main, seuls des ordres pleins (0, ±1) tenus plus longtemps que la réaction sont prévus au plus juste.
- Un rayon dont l'ordre est déjà celui des touches recopie `tenu` (son horizon est alors le long).
- **Tout ce qui part du sol est une estimation** (`approx`) : la vitesse est tenue, sans drift ni flaque. Le saut prend l'impulsion du dernier saut de la
  course (`saut.mesure` vrai) ; avant le premier, le plancher du jeu (`mesure` faux : le vrai saut monte plus haut et retombe plus loin — § 2 ter). Dans le jeu,
  l'impulsion dépend de la figure et de l'instant du dernier appui : une main dont les appuis varient (profil) ne refait pas exactement le saut d'avant.
- **Les rayons `versRoute`** sont joués volant dosé, redécidés 10 fois par seconde (2 fois à plus de 60 m de la route) : au clavier le dosage se fait en tapotant (`approx`).
- `t` est en secondes de jeu ; pendant le ralenti de la frénésie, `radar.approx` est vrai.

**Ce que les yeux ne voient toujours pas** : le glacier et les dunes (hors du tirage : `aveugle`), la ville vitrée au-delà de son sol, la route d'après le portail,
un obstacle plus mince que `maille`, les montagnes de jade qui tombent (elles sont vues à leur place du moment), les filets de virage. **Au canyon**, le relief
existe dans le simulateur depuis le 25/11 (`ml/reel/jeu-reel.js`, `cyw=0` ; avant, ni paroi, ni rivière, ni mur de couloir) : le radar le sonde **à chaque image** depuis les
finitions de l'étape B (25/11 au soir ; avant, une image sur huit : une sonde coûte 134 µs, dont 115 pour le terrain). La sonde passe d'abord par une
**borne haute du relief** (`borneCanyon`, `yeux.js`, écrite d'après le texte de `cyHauteur`) : si la caisse est au-dessus, le terrain ne peut pas la
toucher et seuls les ouvrages sont appelés ; sinon `canyonHeurt` entier. La réponse est celle du jeu : **0 écart sur 1,3 million de points** tirés
autour de 5 canyons (`ml/ecurie/agents/tmp-pilote/bench-borne.js`, hors git) ; une signature des textes du jeu éteint la borne et s'inscrit dans
`manque` s'ils changent. Le coût d'une course entière au canyon ne bouge pas (voir « Ce que ça coûte »). MESURÉ AVANT (une image sur huit)
(`node justesse.js --cartes canyon --graines 16`, allégé) : 32 vols, issue juste 32 sur 32 à la première vue, les 16 chocs prévus avec leur cause (paroi,
canyon, rivière), aucun choc non prévu ; pas de mesure image par image au canyon. Les murs de couloir (`vue.mur`) : sur une course de 200 s du bot de
référence (graine 910037), `mur.ici` a dit vrai aux 33 vues au sol où le jeu avait un mur (`cyCouloirIci`), et jamais ailleurs (1 918 vues). Sous la dalle, les `lat` des pièces, fruits et orbes sont en miroir :
lire `latC` (voir en tête du § 2). **Pas de rayon `viser`** : l'aide `viser` (un tronçon en contrebas, l'anneau) n'a aucun rayon — le radar ne dit pas où
elle mène ; et la loi des rayons `versRoute` n'a pas d'aide : pour la suivre il faut la recopier en `volant` chiffré à chaque décision.
Les tronçons sont un calcul simple (chute verticale, sans le plané ni les maps où le haut suit la route) : une piste, pas une promesse.

### 2 ter. Ce que vaut le radar (`justesse.js`)

Le radar ne vaut que par son tableau « prévu / arrivé ». **Mesuré le 24/11/2026, refait le 25/11 après la relecture** (mêmes chiffres en vol), version allégée,
le voltigeur sur 6 maps × 5 graines (57 vols, `results/justesse-allege.json`, `node justesse.js --graines 5`) :

| Où le rayon est pris | Issue juste | Poses : écart médian (90 % des poses sous…) |
|---|---|---|
| à la première vue du vol | 57 / 57 | 0 s (0,02) · 0,2 m le long de la piste (2,3) · 0,03 m de côté (0,16) |
| à la première vue où les doigts tiennent la façon | 57 / 57 | 0 s (0) · 0,2 m (0,4) · 0,03 m (0,86) |
| une seconde avant la fin du vol | 51 / 51 | 0 s (0,02) · 0,2 m (1,5) · 0,03 m (0,11) |

- la **note** de la pose (parfaite, bonne, lourde) est la bonne 22 fois sur 22 ; les 8 **chocs** contre le décor (roche, pic, tour) sont vus : 6 avec leur cause dès la première vue, 2 par un rayon court (2 s) qui les dit « libre » parce qu'ils arrivent plus loin que son horizon ;
- **le pas à pas** (`--pas`, 44 vols, `results/justesse-allege-pas.json`) : les places prévues image par image sont celles du jeu **au centimètre sur tout le vol, 44 fois sur 44** ; l'issue tombe à l'image près **41 fois sur 41** (le 24/11 : 38 sur 41 — ce n'étaient pas des chocs « vus une image trop tard » mais des roches **manquées** : la grotte et les pics de jade n'étaient sondés qu'une image sur deux, et une roche touchée pendant une seule image impaire passait inaperçue ; depuis le 25/11 ils sont sondés à chaque image, comme le jeu les juge) ; **le canyon pas à pas** (finitions de l'étape B, le canyon sondé à chaque image : `node justesse.js --cartes canyon --pas --graines 16 --sortie results/justesse-allege-pas-canyon.json`) : 20 vols, les places **au centimètre sur tout le vol 20 fois sur 20** (écart au pire : 0 m), l'issue **à l'image près 18 fois sur 18** (16 courses, fins paroi 14, canyon 1, rivière 1) ;
- **les sorties du sol** : une sortie franche est annoncée à 0,07 s près (médiane ; 0,5 s pour une sur dix) ; l'issue du vol qui suit est juste 16 fois sur 17, **mais 15 de ces 16 sont des « libre » avant 3 s pour des vols morts ensuite, jauge vide** : les rayons `rien` et `plane` d'une sortie à gauche ou à droite ne disent pas si elle est vivable (d'où le rayon `versRoute` ajouté, mesuré plus bas) ;
- **le saut** (30, tous le **premier** de leur course : le voltigeur n'en fait qu'un) : il décolle à l'image annoncée (écart médian 0, au pire 0,05 s). Le vol qui suit : issue juste **17 fois sur 18** (le 24/11 : 15 sur 18), la pose annoncée **0,36 s et 25 m trop tôt** en médiane (le 24/11 : 0,71 s et 45 m), 5,2 m de côté, la note juste 6 fois sur 16. Ce qui reste d'écart vient de l'impulsion : avant le premier saut, le radar prend le plancher du jeu (`mesure` faux). L'erreur restante : une pose annoncée pour un choc contre un pic, sur la jade ;
- **le bot de référence** (rayon `tenu`, 12 vols, `results/justesse-allege-reference.json`) : 10 sur 12 — il change d'ordre pendant ses vols, et `tenu` ne dit que ce qui arrive si rien ne change. Ses courses passent sous la dalle : `latC` y est contrôlé sur 3 325 objets vus dessous, 0 faux ;
- **le canyon avec son relief** (`--requete "&cyw=0"`, 8 vols, `results/justesse-allege-cyw0.json`) : 8 sur 8, les 4 chocs « paroi » prévus avec leur cause (ce sont 5 vols distincts : les 3 sauts `versRoutePlane` sont presque les mêmes, 1,40 à 1,45 s).
- (25/11, **simulateur fidèle** : le relief du canyon est allumé dans `ml/reel`, `--requete "&cyw=0"` n'est plus utile) **le canyon, 16 graines**
  (`node justesse.js --cartes canyon --graines 16 --coeurs 4`, `results/justesse-allege-canyon-relief.json`) : 32 vols, issue juste **32 sur 32** à la première
  vue et 17 sur 17 une seconde avant la fin ; **16 chocs prévus avec la bonne cause, aucun non prévu** ; les 16 courses finissent contre le décor (paroi 14,
  canyon 1, rivière 1) en 11 à 15 s : le voltigeur sort exprès, et au canyon la sortie tue. Les yeux : 2,5 à 9,6 ms par vue (10 à 17 ms en vol).
  ⚠ Les fichiers d'avant le 25/11 (`justesse-allege.json`, `-pas`, `-reference`, `-voltigeur-route`, `-main-clavier`…) ont leurs courses du canyon **sans
  relief** : leurs chiffres du canyon ne disent rien du vrai canyon.

**Le second cerveau de mesure, `voltigeur-route.js`** (25/11, 6 maps × 5 graines, 86 vols, `results/justesse-allege-voltigeur-route.json`) : il fait ce qu'un pilote fera — plusieurs sauts par course, et après une sortie par le bord la loi `versRoute`.

| Ce qui est jugé | Issue juste | Ce que ça dit |
|---|---|---|
| en vol, à la première vue / quand les doigts tiennent la façon / 1 s avant la fin | 83 / 86 · 84 / 84 · 66 / 66 | poses à 0,3 m le long de la piste en médiane (11,7 m pour une sur dix à la première vue, 1,7 quand la façon est tenue) |
| le rayon `versRoute` d'une sortie franche (gauche, droite), vu du sol | 22 / 27 | 9 posés, 11 morts jauge vide, 7 chocs sur les 27 jugées : **revenir après une sortie franche réussit une fois sur trois** ; poses annoncées à 0,12 s, 26 m le long, 3,2 m de côté |
| le rayon `versRoute` de la sortie `bord` d'office | 9 / 10 | 9 posés (dont 5 rattrapés par la lèvre) ; poses à 0,47 s, 35 m le long (une fois sur dix plus de 400 m : la lèvre rattrape loin de l'endroit annoncé) |
| le saut, impulsion connue (un 2e saut ou plus) | 14 / 15 | poses à 0,05 s et 4 m en médiane, mais 68 m et 23 m de côté pour un sur dix : l'impulsion dépend de la figure et de l'instant du 2e appui |
| le saut, premier de la course | 30 / 30 | poses à 0,38 s et 27 m trop tôt (le plancher du jeu) |

Sur 46 sauts ordonnés : 45 prévus, tous décollés ; 1 dit refusé (jauge trop basse), qui n'a pas décollé.

**Avec la main « clavier »** (`--profil clavier`, une main à profil : réactions tirées, volant par coups) — **refait le 25/11 au soir avec la main réglée de la relecture
et le canyon sondé à chaque image** (`node justesse.js --profil clavier --graines 5`, 6 maps × 5 graines, 55 vols, `results/justesse-allege-main-clavier.json`) :
**50 sur 55 à la première vue du vol** (91 % ; le 24/11, avant les corrections de la main et du radar : 36 sur 50), **55 sur 55 dès que les doigts tiennent la façon**
(avant 49 sur 50 ; poses à 0,3 m le long de la piste et 0,03 m de côté en médiane), **41 sur 43 une seconde avant la fin** (avant 42 sur 43 : deux chocs prévus pour des
poses, un à la grotte, un à la ville) ; les causes des chocs sont les bonnes 10 sur 10, 12 sur 12 et 7 sur 7 ; au canyon 8 sur 8 aux trois moments. Les sorties franches : annoncées 17 sur 17
à 0,09 s près, le vol qui suit juste 10 fois sur 12 ; le saut : décollé à l'image annoncée 30 sur 30 (0,03 s), le vol qui suit juste **14 sur 20** (avant 14 sur 26 ; le premier
saut d'une course part du plancher du jeu). Les sondes du décor : une toutes les 1,14 image au pire, sur 979 vues, canyon compris. Chiffres d'avant le 25/11 au soir pour
le voltigeur de la route avec cette main (non refait) : Le voltigeur de la route avec cette main
(`results/justesse-allege-voltigeur-route-main-clavier.json`) : 44 sur 58 à la première vue, 58 sur 58 ensuite ; `versRoute` après une sortie franche 16 sur 20 ;
un saut prévu n'a pas décollé (1 sur 35). **Conclusion : avec une main à profil, ne se fier au radar en vol qu'une fois la façon tenue depuis une réaction.**

Ce que ces mesures ne disent pas : `viser` n'a jamais été tiré (`cabre` et `pique` : deux vols chacun, avec la main clavier, le 25/11) ; **un seul pilote décide en lisant le radar** (`ml/ecurie/pilote.js`,
le 25/11 ; ce que le radar lui apporte n'est pas mesuré à part) ; les sorties à gauche et à droite du premier voltigeur n'ont pas de vol `versRoute` (il tient `rien` ou `plane`). **Ce qui a rendu la première vue juste** (elle ne l'était que 54 fois sur 57) : le radar tient compte des **délais de la main** (`Doigts.prototype.delais`, `doigts.js`) — au décollage, les doigts tiennent encore quelques images les touches d'avant (une flèche du volant, la NITRO et le manche du geste `saut`) ; ces images-là suffisent à déplacer la pose de 9 m.

**Refaire ces mesures, à l'identique** (depuis le 25/11, un fichier qui existe avec un autre réglage — graines, départ, durée, maps, régime, mode, cerveau,
profil, adresse — n'est plus écrasé sans `--force` : `node justesse.js` tout court, 3 graines, refuse donc de remplacer les 57 vols et dit les bonnes options) :

| Fichier | Commande |
|---|---|
| `justesse-allege.json` | `node justesse.js --graines 5` |
| `justesse-allege-pas.json` | `node justesse.js --pas` |
| `justesse-allege-reference.json` | `node justesse.js --cerveau reference.js --cartes libre --graines 4 --tmax 150` |
| `justesse-allege-cyw0.json` | `node justesse.js --cartes canyon --graines 4 --tmax 60 --requete "&cyw=0"` (avant le 25/11) |
| `justesse-allege-canyon-relief.json` | `node justesse.js --cartes canyon --graines 16 --coeurs 4` (25/11, le relief allumé dans le simulateur) |
| `justesse-allege-voltigeur-route.json` | `node justesse.js --cerveau voltigeur-route.js --graines 5` |
| `justesse-allege-pas-canyon.json` | `node justesse.js --cartes canyon --pas --graines 16 --sortie results/justesse-allege-pas-canyon.json` (25/11 au soir, le canyon sondé à chaque image) |
| `justesse-allege-main-clavier.json` | `node justesse.js --profil clavier --graines 5` (refait le 25/11 au soir) |
| `justesse-allege-voltigeur-route-main-clavier.json` | `node justesse.js --cerveau voltigeur-route.js --profil clavier --graines 5` |

Les options : `--pas` (les places image par image), `--cerveau` (un autre cerveau que le voltigeur : `reference.js`, le rayon `tenu` ; `voltigeur-route.js`, la façon
que l'ordre porte), `--profil clavier` (une main à profil), `--requete "&…"` (un morceau de plus dans l'adresse du jeu ; `&cyw=0`, le canyon avec son relief, n'est plus utile depuis le 25/11 : le simulateur le porte), `--sortie` (un autre fichier). C'est aussi le **détecteur de dérive** : une loi du jeu qui change sans que sa copie
dans `yeux.js` suive se voit là. **Ce que ça coûte** : sur la course du contrôle 3 de `verifier.js` (150 s, le bot de référence, 4 % des vues en vol), **0,74 ms par vue contre 0,39 sans le radar** (au sol 0,66 ms, en vol 2,6), et une vue de 2 360 caractères contre 1 640. Une vue en vol coûte de 1 à 2 ms sans décor, **2,5 à 4 ms devant la ville ou la grotte, 5,5 à 6 ms devant les pics de jade** depuis que le décor est sondé à chaque image (le 24/11, une image sur deux : 2 à 4,5 ms ; les sondes du décor sont des fonctions du jeu : la cible de 2,5 ms n'y est pas tenue), et 13 à 18 ms au canyon avec son relief (une sonde y coûte 134 µs). **Le canyon sondé à chaque image** (finitions de l'étape B, MESURÉ sur 8 graines imposées au canyon, 150 s, allégé, mêmes courses avant et après) : sonde par sonde, la vue en vol passait de 18 à 125 ms et les yeux ajoutaient **18 %** au temps de boucle des courses du pilote (5,3 % à celles du bot de référence) ; avec la borne du relief, **+0,2 %** (pilote : yeux 5,2 → 5,4 s sur 83 s de boucle) et **+0,5 %** (référence : 8,9 → 10,2 s sur 278 s). Le voltigeur, qui demande les sorties à chaque vue, paie 11 ms par vue au canyon avec la main clavier (30 ms en vol). Un pilote qui volerait autant qu'un joueur (29 % du temps) paierait de l'ordre de 1,5 ms par vue.

---

## 3. Ses gestes (`doigts.js`)

L'ordre rendu par `decide` :

| Champ | Effet | Touches |
|---|---|---|
| `volant` −1…1 | braquer (+ = gauche) ; un dosage se fait en tapotant | ← → |
| `ligne` (m) | *aide* : tenir cet écart à l'axe au sol (la loi du pilote de mesure du jeu, `dbgAuto`) | ← → |
| `viser` (un tronçon, ou `vue.vol.anneau`) | *aide* : en vol, tourner vers lui ; cabrer ou piquer selon `tChute` / `tTrajet` | ← → ↑ ↓ |
| `manche` −1, 0, 1 | en vol : −1 pique, +1 cabre. Au sol : +1 freine, et drifte si le volant est tenu | ↑ ↓ |
| `drift` −1, 0, +1 | *main à profil seulement* (§ 3.4) : drifter à gauche (+1) ou à droite (−1) tant que l'ordre dure — la flèche d'abord, ↓ ensuite | ← → ↓ |
| `nitro` vrai / faux | tenir la NITRO : pousse au sol ; en vol, un coup de réacteur puis le plané | ESPACE |
| `geste:'figure'` + `direction` | deux appuis brefs sur NITRO, la direction tenue : `avant`, `arriere`, `gauche`, `droite` | direction + ESPACE ×2 |
| `geste:'saut'` + `direction` | une figure sur la route, puis manche vers soi et un nouvel appui NITRO pendant le bond : la caisse décolle | idem, puis ↓ + ESPACE |
| `geste:'redresser'` | un appui bref, seul, en vol : la figure en cours s'arrête, la caisse se remet droite | ESPACE |
| `ensuite` `{ ligne }` ou `{ volant }` | *main à profil seulement* (relecture du 25/11) : l'ordre du volant pour le mode **d'après** — donné en vol, celui de la pose ; donné au sol, celui du décollage. La main l'applique dès qu'elle voit le mode changer (6 images après), sans attendre la décision suivante. `ligne` n'y vaut qu'avec le suivi (sans lui : volant à zéro) | ← → |
| `regarder:'sorties'` | *pas un geste* : demande aux yeux, pour la vue **suivante**, les sorties à gauche, à droite et par un saut (`vue.sorties`, § 2 bis) | aucune |
| `cible: <abscisse>` (26/11) | *pas un geste* : en vol, l'abscisse (m le long de la piste) que le pilote vise — à la vue **suivante**, les rayons `viser` et `vue.vol.cible` portent sur elle (§ 2 bis, « Le rayon viser ») | aucune |

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

`HUMAIN` ne change pas avec les doigts v2 : **un profil peut ralentir la main, jamais l'accélérer.** Chaque touche passe encore par ces limites.
(Relecture du 25/11 : ce n'était pas vrai du suivi — avec un retard nul, le défaut, il lisait l'image même, 83 ms avant ce qu'une décision peut
ordonner. Le suivi actif lit désormais l'état du jeu **vieux de 6 images au moins** ; contrôle 9c.)

### 3.1 Le profil : régler la main (doigts v2, 24/11)

Sans profil, la main est une **machine** : l'ordre est obéi à l'image suivante, le volant se dose par un battement régulier. Un joueur ne fait
ni l'un ni l'autre. Le profil dit quelle main le cerveau a :

```js
module.exports = {
  nom: 'mon-pilote',
  profil: {
    modele: 'clavier', graine: 3,                 /* le point de départ ; la graine : deux pilotes du même réglage n'ont pas la même main */
    reaction: { volant: [120, 200, 320] },        /* ms : [p10, p50, p90], ou un nombre seul pour une constante */
    coups:    { duree: [70, 130, 300] },          /* le volant par appuis de durée tirée */
    nitro:    { tenue: [320, 1000, 4100] },       /* la nitro hachée au sol ; null = tenue tant que demandée */
    chance:   { prend: 0.2, palierMin: 8 },       /* la seconde chance : une fois sur cinq, à partir du palier 8 */
    erreur:   { manque: 0.03, parasite: 2 }       /* 3 % d'appuis manqués, 2 embardées par minute */
  },
  decide: function (vue, memoire) { return { ligne: 0, nitro: true }; }
};
```

**Sans profil, ou avec un profil dont tout est au défaut (`profil: {}`) : exactement la main d'avant**, au bit près (`verifier.js`, contrôles 3 bis et 10).
**Dans la boucle (`ml/ecurie/boucle.js`), la main du parent est imposée** (relecture du 25/11) : une variante dont le profil normalisé n'a pas la même empreinte
que celui du parent (`profilSha`, ou l'absence de profil) est refusée sans être notée, « main changée ». Changer la conduite, oui ; changer la main, non — sauf
lancement avec `--main-libre` (les étapes où l'on règle la main).
Les durées sont en **millisecondes** (converties en images de 1/60 s) ; une durée s'écrit `[p10, p50, p90]` ou un nombre seul.

| Champ | Unité | Défaut (= la main d'avant) | Bornes | Ce que les joueurs font (`ml/ecurie/etude/humains.md`) |
|---|---|---|---|---|
| `modele` | `'machine'`, `'clavier'`, `'doigt'` | `'machine'` | — | le point de départ ; les champs écrits l'écrasent |
| `graine` | entier | 0 | 32 bits | — |
| `reaction.volant` | ms | 0 | 0 à 1000 | **pas mesuré** (l'étalon est à 10 échantillons par seconde) ; `clavier` : `[120, 200, 320]` |
| `reaction.nitro` | ms | 0 | 0 à 1000 | pas mesuré ; `clavier` : `[110, 180, 300]` |
| `reaction.manche` (drift compris) | ms | 0 | 0 à 1000 | pas mesuré ; `clavier` : `[150, 240, 380]` |
| `reaction.geste` | ms | 0 | 0 à 1000 | pas mesuré ; `clavier` : `[180, 260, 420]` |
| `suivi.actif` | vrai / faux | faux | — | vrai : avec `ligne` ou `viser`, le volant est recalculé **à chaque image** |
| `suivi.retard` | ms | 0 | 0 à 500 ; **6 images (100 ms) au moins si le suivi est actif** | le retard de perception de la main ; pas mesuré ; `clavier` : 150 |
| `coups.actif` | vrai / faux | faux | — | faux : le dosage régulier d'avant |
| `coups.duree` | ms | `[100, 200, 400]` | 67 à 1500 | les VRAIS appuis des joueurs au clavier, reconstruits du volant lissé : p10 77, p25 117, p50 153, p75 220, p90 347, p99 697 ms. (La mesure d'avant, 100 · 200 · 400, était celle de la **trace lissée**, qui reste au-dessus du seuil 2 à 3 images après le relâché.) `clavier` : `[70, 130, 300]`, `doigt` : `[80, 150, 330]` — réglés sur `appuis.js` (§ 3.8) |
| `coups.repos` | ms | `[70, 110, 200]` | 67 à 1000 | la pause de **la flèche lâchée** après un coup ; pas mesuré ; `clavier` et `doigt` : `[90, 140, 250]` |
| `coups.inversion` | ms ou `null` | `null` | 33 à 1000 | (relecture du 25/11) la pause de **la flèche d'en face** après un coup : un autre doigt, une autre touche. `null` : un seul repos pour les deux, comme avant. Les joueurs : 68 % de leurs appuis successifs changent de côté, souvent dans les 100 ms ; `clavier` : `[50, 90, 200]` |
| `coups.seuil` | part du prochain coup | 0,5 | 0,2 à 1,5 | plus haut : des coups plus rares et plus tardifs ; `clavier` et `doigt` : 0,4 |
| `coups.plein` / `coups.mort` / `coups.contre` | part de volant | 0,92 / 0,08 / 0,5 | 0,5 à 1 / 0 à 0,4 / 0,1 à 1 | au-dessus de `plein` la touche est tenue ; sous `mort` rien ; au-dessus de `contre` un ordre inverse coupe le coup en cours |
| `nitro.tenue` | ms ou `null` | `null` | 67 à 30 000 | `null` : tenue tant que demandée. Mesuré **sur la flamme, au sol** (joueurs au clavier) : allumée 76 % du sol, 16 à 22 allumages par minute de sol, tenues p10 0,32 · p50 1,0 à 1,2 · p90 4,1 s. Les tenues courtes (médiane 0,2 s, 51 par minute) sont **en vol**, et au sol jauge vide la flamme bat toute seule, touche tenue : ce ne sont pas des tapotements. `clavier` : `[320, 1000, 4100]` ; `doigt` : `null` |
| `nitro.pause` | ms | `[130, 220, 500]` | 67 à 2000 | pas mesuré ; `clavier` : `[120, 220, 450]` (le mode court des pauses au sol) |
| `geste.tap` | ms | 83 | 67 à 233 | la durée d'un appui du double appui (le jeu exige moins de 300 ms) ; `clavier` : `[70, 90, 130]`, pas mesuré |
| `geste.entre` | ms | 83 | 67 à 167 | le blanc entre les deux (appui + blanc : 367 ms au plus, le jeu exige moins de 420) ; `clavier` : `[70, 90, 140]`, pas mesuré |
| `drift.avance` | ms | 33 | 33 à 200 | de combien la flèche précède ↓ (§ 3.4), tiré une fois par drift ; `clavier` : `[33, 70, 150]`, pas mesuré |
| `chance.prend` | probabilité | 0 | 0 à 1 | 2 parties sur les 12 de plus de 20 s l'ont prise — les deux meilleures |
| `chance.palierMin` | palier | 1 | 1 à 30 | prises aux paliers 14 et 28 |
| `chance.delai` | ms après l'apparition de la plaque | `[900, 1500, 3000]` | 600 à 4500 | pas mesuré ; la plaque est sourde 600 ms, l'offre dure 5,5 s |
| `erreur.manque` | probabilité par appui | 0 | 0 à 0,5 | pas mesuré (§ 3.6) |
| `erreur.retard` / `erreur.retardK` | probabilité par réaction / facteur | 0 / 2,5 | 0 à 0,5 / 1 à 5 | pas mesuré |
| `erreur.sur` / `erreur.surK` | probabilité par coup / `[mini, maxi]` | 0 / `[1.5, 2.5]` | 0 à 0,5 / 1 à 3 | pas mesuré |
| `erreur.bruit` | ± part du volant, par coup | 0 | 0 à 0,5 | pas mesuré |
| `erreur.parasite` | coups par minute | 0 | 0 à 20 | pas mesuré ; le taux obtenu est celui demandé (contrôle 9h ; avant le 25/11, 20 à 28 % de moins) |

Les modèles : **`machine`** = les défauts. **`clavier`** = les réactions ci-dessus, `suivi` (retard 150 ms), `coups` (`[70, 130, 300]`, repos `[90, 140, 250]`,
inversion `[50, 90, 200]`, seuil 0,4), `nitro.tenue [320, 1000, 4100]` et `pause [120, 220, 450]`, `geste.tap [70, 90, 130]`, `geste.entre [70, 90, 140]`,
`drift.avance [33, 70, 150]` ; ni seconde chance, ni erreurs. **`doigt`** = le même avec des coups `[80, 150, 330]` (repos, inversion et seuil du clavier)
et la nitro tenue (`null`) — provisoire (4 parties de Léo). Réglés le 25/11 sur la mesure d'`appuis.js` (§ 3.8) pour les coups ; les réactions, le
retard du suivi, les gestes et le drift restent des ordres de grandeur.

À savoir : la nitro des joueurs est lue sur la flamme (`nitroOn`), pas sur la touche — une jauge vide tenue la fait battre toute seule (elle se
rallume quand la jauge repasse 0,3, soit 1,5 s plus tard) : au sol, une bonne part de leurs coupures vient de là. Et après un appui de 18 images
(300 ms) ou moins, la main attend 450 ms depuis son début avant de rappuyer (sinon deux tapotements feraient une figure) : `nitro.tenue` court
donne donc une nitro allumée peu de temps.

### 3.2 Ce que la main à profil fait, image par image

L'ordre de `decide` n'agit plus tout de suite. À chaque décision il part dans trois files — **volant**, **manche** (le drift voyage avec lui), **nitro** — et
un geste en attente :

- **un ordre qui change attend un temps de réaction**, tiré dans la loi de son canal. « Change » : pour le volant, une autre aide, une `ligne` déplacée de
  plus de 3 m, un cap visé de plus de 0,15 rad, un volant qui change de sens ou de plus de 0,3 ; pour le manche et la nitro, une autre valeur. Un ordre qui
  ne change pas n'attend pas, mais ne double jamais un ordre déjà en route ;
- **un geste attend `reaction.geste`** ; un second geste demandé pendant cette attente est refusé (`gestesRefuses`). À son heure il part si rien ne
  l'empêche (un autre en cours, moins de 0,5 s depuis le dernier) — donc **plus tard que le `vue.t` de l'ordre** : un saut demandé au bord d'un tremplin
  part 0,2 à 0,4 s après ;
- puis, à chaque image, dans cet ordre : le geste en cours (il tient ses touches) · le volant · le manche · la nitro.

**Le suivi** (`suivi.actif`). Avec `ligne` (au sol) ou `viser` (en vol), la main ne reçoit plus un volant chiffré dix fois par seconde : elle reçoit
la cible, et recalcule le volant **à chaque image** sur l'état du jeu qu'elle perçoit (celui d'il y a `suivi.retard`, **6 images au moins** ; au
départ et après une seconde chance, tant qu'elle n'a pas cet état-là, elle ne voit rien : volant à zéro), avec la loi du § 3. C'est donc **la cible**
qui a le temps de réaction, pas la boucle. Une aide qui ne va plus avec le mode (un `viser` arrivé après la pose, une `ligne` après le décollage)
est lâchée : volant à zéro jusqu'à l'ordre suivant. **`volant` écrit en clair n'est pas suivi : il est tenu tel quel, même quand le mode change** —
mesuré : le plein volant donné en vol reste enfoncé au sol 7 à 30 images après la pose (médiane 12) ; à 100 m/s le bord est à moins d'une seconde.
Pour l'éviter : donner `ensuite` avec l'ordre (`{ volant: 1, ensuite: { ligne: 0 } }` : la flèche est lâchée 6 images après la pose, contrôle 9j),
ou lâcher le volant 0,3 s avant la pose annoncée par le radar.

**Les coups** (`coups.actif`). La part de volant voulue s'accumule ; quand elle vaut `coups.seuil` × le prochain coup, la main appuie **à fond** pendant
une durée tirée de `coups.duree`, puis se repose (`coups.repos`). En moyenne le braquage est celui demandé ; mais à 400 km/h un coup médian de 0,2 s
tourne déjà la caisse de l'ordre d'un quart de radian (calculé sur la loi du lacet) : **la trajectoire ondule** d'un bord à l'autre, comme celle d'un
joueur au clavier, et un cerveau écrit pour la main d'avant sort de la route avec celle-ci (§ 3.8). Au-dessus de `coups.plein` la touche est tenue.
(Relecture du 25/11.) **Un coup ne part que du côté de l'ordre** : avant, la dette passée sous zéro faisait partir un coup à contresens, à fond (pour
un volant de 0,12, un appui sur quatre) — contrôle 9f. **Deux horloges** : après un coup, la flèche lâchée attend `coups.repos`, la flèche d'en face
seulement `coups.inversion` (contrôle 9i).

**La nitro hachée** (`nitro.tenue`), au sol seulement : chaque appui dure une tenue tirée, puis une pause tirée. En vol la nitro reste tenue tant que
demandée (chaque allumage y coûte de la jauge, et un appui seul redresse une figure).

**Un geste n'ouvre pas sur un tapotement** (relecture du 25/11, une main à profil qui change les touches) : le jeu lance la figure dès qu'un appui
NITRO suit un appui de moins de 300 ms commencé moins de 420 ms plus tôt. Avec la nitro hachée, un geste sur six partait au 1er appui (le saut :
son 3e appui lu comme un double). Le geste attend donc que le dernier tapotement sorte de cette fenêtre — 0,35 s au plus, le volant et le manche
restant à l'ordre pendant ce temps ; le radar le compte (`delais`). Contrôle 9g : le détecteur du jeu rejoué sur le journal.

**Ce que la main sait d'elle-même** (`vue.main`, cerveau à profil seulement, relecture du 25/11) : `attente` (`volant`, `manche`, `nitro` : dans
combien d'images le dernier ordre donné atteindra la main, 0 = arrivé), `geste` (`'attend'` : en route ; `'joue'` : en cours ; `null`) et `refuse`
(le dernier geste demandé n'est pas parti : refusé, trop tôt, un autre en cours, ou manqué). Lecture seule ; ce champ n'entre pas dans
`empreinteVues` (contrôle 10).

Le bilan d'une course dit ce que la main a fait : `main` (`sha` du profil, `graine`, `modele`), `gestesRefuses`, `gestesRates`, `erreursMain`,
`chance`, `imagesMortes`.

### 3.3 Le hasard de la main

Aucune horloge, aucun hasard de l'ordinateur : les durées sortent d'un générateur **à graine**, fait de la graine de la course et de `profil.graine`.
**Même jeu + même graine + même cerveau (profil compris) = même course**, touche pour touche, dans un processus neuf. Une autre `profil.graine` : la
même main, d'autres durées. Il y a un flux par usage (réactions, volant, nitro, gestes, erreurs, seconde chance) et un tirage par **événement** — un
ordre qui change, un appui, une mort — jamais par image : allumer une erreur ne change pas les réactions. `decide` n'a toujours pas de hasard.

### 3.4 Le drift

`drift: +1` (à gauche) ou `−1` (à droite), **tenu à chaque décision** tant qu'on veut drifter ; `0` ou rien pour finir. La main tient la flèche à fond,
attend `drift.avance` (tiré une fois par drift), puis tient ↓ ; elle ignore `ligne`, `volant` et les coups pendant ce temps. À la fin elle relâche ↓
d'abord, puis la flèche — à la même image pour une main sans coups, un repos tiré plus tard pour une main à coups (relecture du 25/11 : avant,
les deux à la même image, 1465 drifts sur 1466) : jamais ↓ seul, qui freinerait. Hors du sol l'ordre est ignoré (↓ en vol cabre). L'ordre voyage avec le manche : il attend `reaction.manche`.

Ce que le jeu en fait (lu dans `code/moteur/boucle-2-conduite.js` et `code/gameplay/sensations-flow.js`) : il faut de la vitesse (plus de 42 % de la
vitesse maximale du palier), sinon ↓ **freine**. `vue.drift` dit s'il a pris. Sa durée appartient au cerveau :

| Durée du drift | Au relâché |
|---|---|
| moins de 0,45 s | rien, et l'élan est perdu |
| 0,45 à 0,9 s | un mini-turbo, l'élan n'est pas rendu |
| 0,9 s et plus | SUPER (ULTRA à 1,4 s) : l'élan revient |

Puis une attente avant de pouvoir recharger : 0,9 s après un mini-turbo, 1,2 s après un SUPER, 1,5 s après un ULTRA (rien après un drift de moins de 0,45 s). Les joueurs : Sacha au clavier ne drifte presque jamais (0,1 % du sol), Léo au doigt 16 %.
**Sans profil (ou profil vide), `drift` n'est pas lu** — écrire alors `manche: 1` avec `volant: ±1` comme avant ; le bilan compte ces ordres perdus
(`driftSansProfil`). Pour drifter avec une main de machine : `profil: { drift: { avance: 50 } }` — **42 ms au moins** : de 33 à 41 ms la valeur
s'arrondit à 2 images, c'est-à-dire au défaut, le profil est alors compté vide (« pas de profil ») et l'ordre `drift` n'est pas lu.

### 3.5 La seconde chance

Le jeu l'offre **une fois par partie**, après une mort par explosion, si la partie a plus de 20 s : la plaque CONTINUER de l'écran de mort, puis une
pub de 5 s. La reprise coûte **un palier** (`vue.moteur` baisse d'un cran, les pièces reviennent au seuil du palier d'en dessous), repose la caisse
sur la route un peu avant l'endroit de la mort (14 m dans la mesure), donne 3 s d'invulnérabilité (`vue.invulnerable`), 2 s d'élan et la nitro à
moitié au moins.

**C'est le profil qui la prend, pas `decide`** (qui n'est jamais appelé mort) : `chance.prend` (la probabilité), `chance.palierMin` (pas en dessous
de ce palier), `chance.delai` (le temps de réaction devant la plaque). La main touche la plaque comme un joueur : quand elle est affichée, pas avant
ses 600 ms de garde, dans sa fenêtre de 5,5 s. Mesuré dans le simulateur : la plaque paraît 1,9 s après la mort, la course reprend 5,2 s après le toucher.

Pour le cerveau : entre la mort et la reprise, **7 à 12 s passent sans décision** ; `vue.t` et `vue.image` les comptent (la durée de la partie,
`duree_s`, non), `memoire` est gardée. À la reprise la main repart de zéro (plus aucun ordre en route). Le bilan : `chance` (`voulue`, `prise`, les
images de la plaque, du toucher et de la reprise), `imagesMortes`, `chances`. La partie est recollée comme celles des joueurs (un événement
`seconde_chance`), et son palier reste **le plus haut atteint**.

### 3.6 Les erreurs

Cinq réglages, tous à zéro par défaut, aucun mesuré sur les joueurs :

| Réglage | Ce qu'il fait | Ce que ça donne à l'écran |
|---|---|---|
| `erreur.manque` | un coup de volant ne part pas (il est refait après un repos) ; un geste ne part pas du tout (`gestesRates`) | une correction en retard ; une figure ou un saut qui n'a pas lieu |
| `erreur.retard` | une réaction est multipliée par `retardK` (1 s au plus) | un virage pris tard, une nitro lâchée tard |
| `erreur.sur` | un coup dure `surK` fois trop longtemps | un coup de volant trop fort, puis sa correction |
| `erreur.bruit` | chaque coup compte un peu plus ou un peu moins que prévu | une ligne moins nette |
| `erreur.parasite` | des coups que personne n'a demandés, d'un côté au hasard, tant par minute | des embardées |

`manque` (pour le volant), `sur`, `bruit` et `parasite` n'agissent qu'avec `coups.actif` ; `retard` qu'avec un temps de réaction non nul. Le bilan
les compte (`erreursMain` : `manques`, `retards`, `surs`, `parasites`).

### 3.7 Le journal et le rejeu

Le journal `touches` reste `[image, touche, 1|0]`, avec une lettre de plus : **`C`**. `[image, 'C', 1]` = la plaque CONTINUER touchée et acceptée ;
`[image, 'C', 0]` = l'attente de la plaque abandonnée (sans effet dans le jeu). **Le journal suffit au rejeu** : `rejouer` n'a besoin ni du cerveau,
ni du profil, ni de son hasard, et redonne la course à l'image près, seconde chance comprise (`verifier.js`, contrôles 11 et 12 ; `ml/labo` code `C` / `c`).

### 3.8 Ce que vaut la main, mesuré (`appuis.js`)

`node appuis.js <note faite avec --parties>` compte la main d'un bot et celle des joueurs **par la même fonction** (`mesures.js`, `mainLot`), sur
ce qui se lit de l'enregistrement du jeu : le volant lissé (`|steer| > 0,3`, au sol) et la flamme de la nitro, 10 fois par seconde.
(Relecture du 25/11.) **Chaque échantillon pèse son vrai écart au précédent** : l'enregistreur ne prend un échantillon que lorsque 0,1 s est
*dépassée* (6 ou 7 images : 0,1095 s en moyenne chez les joueurs, 0,1055 s chez le bot). Compter 0,1 s gonflait tous les « par minute », et pas
autant des deux côtés : les joueurs au clavier font **101,6** coups de volant par minute vraie de sol et **1,24** changement de sens par seconde,
pas 111,3 et 1,36 comme écrit avant. `discerner.js` divise lui aussi par la vraie durée. La nitro est comptée en plus **au sol** et **hors du sol** à part.

**Mesuré le 25/11/2026, après la relecture et le réglage** : le cerveau d'essai `essai-main.js` (la conduite du bot de référence sans ses gestes ;
sa main est le modèle `clavier` tel quel — avant, il écrivait par-dessus les durées d'avant, et un réglage du modèle n'aurait rien changé à la mesure ;
seconde chance prise à chaque mort), 8 graines, version allégée, 120 s au plus (`results/note-essai-main-allege-t120.json` : les bilans ;
`results/appuis-essai-main-allege-t120.json` : ce tableau ; `results/discerner-essai-main-allege-t120.json` : le juge). Les enregistrements des 8 courses
pèsent 2,9 Mo et ne sont pas dans git ; ils se refont à l'identique : `node noter.js essai-main.js --regime allege --coeurs 4 --tmax 120 --graines 8 --parties --sortie results/note-essai-main-allege-t120-parties.json`,
puis `node appuis.js results/note-essai-main-allege-t120-parties.json --nom essai-main-allege-t120` (4 minutes en tout) :

| | les joueurs au clavier (10 parties) | la main `clavier` avant (24/11, recompté) | la main `clavier` réglée (25/11) |
|---|---|---|---|
| coups de volant par minute de sol | 101,6 | 80,0 | **99,9** |
| durée d'un coup lue : p10 · p50 · p90 | 0,10 · 0,22 · 0,43 s | 0,12 · 0,30 · 0,60 s | 0,10 · **0,20** · 0,59 s |
| écart entre deux débuts : p10 · p50 · p90 (CV) | 0,23 · 0,45 · 0,90 s (0,54) | 0,30 · 0,60 · 1,30 s (0,64) | 0,23 · 0,50 · 1,10 s (0,68) |
| part du sol volant braqué | 40,5 % | 47,7 % | 47,7 % |
| changements de sens par seconde de sol | 1,24 | 0,83 | **0,89** |
| nitro allumée, au sol | 75,8 % du sol, 22,5 allumages par minute | 12,4 %, 16,5 | 14,5 %, 14,5 |
| tenue de nitro au sol : p10 · p50 · p90 | 0,32 · 1,19 · 4,23 s | 0,10 · 0,30 · 1,00 s | 0,12 · 0,40 · 1,17 s |

Ses vraies touches (le journal) : 111,6 appuis de flèche par minute, tenus 0,07 · 0,15 · 0,43 s (p10 · p50 · p90) — les joueurs, reconstruits :
104,6 par minute de sol, 0,08 · 0,15 · 0,35 s. Le modèle `doigt`, mesuré de même (le même cerveau, `modele:'doigt'`, contre les 4 parties de Léo) :
93,9 coups par minute (Léo 88,8), p50 0,24 s (0,22), 0,84 changement de sens par seconde (1,12).

Les quatre tours du réglage (clavier) : (1) les vraies durées `[80, 155, 345]` : 89,6 coups, p50 0,30 s, sens 0,88 ; (2) des coups plus courts
`[70, 130, 300]`, un repos de la même flèche plus long `[90, 140, 250]`, seuil 0,4, retard du suivi 150 ms : 99,9 · 0,20 · 0,89 — **retenu** ; (3) le
même avec 8 embardées par minute et 10 % d'appuis trop longs : 99,5 · 0,23 · **0,81**, et 3 morts de plus — abandonné ; (4) le tour 2 refait, à
l'identique (même graine = même course). Le doigt : un tour avec `[100, 220, 450]` (70,1 coups, p50 0,40 s), un second avec les réglages du tour 2
et `[80, 150, 330]` — retenu.

Ce que ça dit, et ce que ça ne dit pas :

- **les coups sont maintenant ceux des joueurs** : leur nombre (à 2 % près) et leur durée médiane (à 10 % près). La queue reste trop longue (p90
  0,59 s contre 0,43) : ce sont surtout les pleins braquages, que le cerveau demande (le sol braqué 48 % du temps contre 40 %), et les coups d'un même
  côté qui se suivent (repos de 90 à 250 ms) et que le volant lissé du jeu recolle en un seul ;
- **les changements de sens résistent** (0,89 contre 1,24, à −28 %) : ni un retard du suivi plus long, ni des erreurs n'y font rien (les erreurs les
  font même baisser). Ils tiennent à la **trajectoire** que le cerveau demande — une ligne lisse, quand les joueurs slaloment sur toute la largeur
  pour les pièces. C'est au pilote de l'étape C de le faire, pas à la main ;
- **la nitro tient au cerveau, pas à la main** : celui-ci ne la demande que dans les droites (15 % du temps) ; les joueurs l'ont allumée 76 % du
  sol, par tenues d'une seconde. Le modèle tient maintenant la touche comme eux (tenues de 0,3 à 4,1 s), mais les tenues lues (0,4 s) sont coupées
  par les ordres du cerveau ;
- **la main ne fait plus mourir le cerveau** : 7 courses sur 8 vont jusqu'à la limite de temps (avant : les 8 mouraient une première fois en vol, à
  72 s en médiane) ; 5 meurent une fois (vers 38 à 70 s) et la seconde chance les reprend ; 193 pièces par minute (avant : 159 ; le bot de
  référence avec la main d'avant : 402) ;
- **LE JUGE** (`node discerner.js results/note-essai-main-allege-t120-parties.json --nom essai-main-allege-t120`) : **AUC 0,993, « DISCERNABLE À COUP
  SÛR »** (le témoin à étiquettes mélangées : 0,47). Ce qui trahit le plus : **les décollages** (0,21 par 10 s contre 1,3 : z −3,1), la part du temps en
  l'air (z −2,8), le vol moyen, la nitro (z −2,2), la hauteur — tout cela tient au cerveau (ce cerveau d'essai ne vole presque pas). Ce qui tient
  à la main : **changements de côté par seconde z −0,02** (dans les joueurs), mais **l'ondulation z +1,9 : le bot ondule PLUS que les joueurs**
  (0,189 contre 0,168, en part de sa vitesse), l'accélération latérale −0,4. (Relecture des outils, 25/11 : le juge mesurait l'ondulation en m/s ;
  elle grandit avec la vitesse, et ce bot, qui meurt tôt, roule lentement — il disait « ondulation −0,6, accélération −0,9 », donc « le bot ondule
  moins », alors qu'à vitesse égale il ondule 5 à 20 % de plus. Elles sont maintenant divisées par la vitesse au sol, § 4 bis. L'AUC passe de 0,991
  à 0,993 sur les mêmes 83 fenêtres. Qui réglerait la main sur l'ancien chiffre l'aurait fait onduler davantage : le mauvais sens) ;
- 8 courses, un seul cerveau : les réactions, le retard du suivi, les gestes et le drift ne sont mesurés nulle part chez les joueurs.

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
  comptées (pour les joueurs comme pour les bots), il faudrait que le jeu enregistre ses raccourcis (à décider par Sacha : cela change le jeu, et
  les parties déjà enregistrées ne l'auront pas). En attendant, **« raccourcis par minute » n'est ni un critère de la boucle ni une mesure du juge**
  (relu le 25/11 : `boucle.js` juge sur `palier_median`, `discerner.js` ne le lit pas) ;
- **au-delà de 10 min**, l'enregistreur ne garde que les 6000 derniers échantillons : distance et raccourcis se rapportent à la fenêtre couverte
  (`fenetre_s`, `tronquee`), et un vol sans échantillon à moins de 0,3 s n'est pas compté.

`autopsie.js` : une graine, les dernières secondes décision par décision. C'est le texte à donner à lire pour comprendre une mort.
⚠ Avec le **même `--regime` et la même `--tmax`** que la note : en allégé, Crypto City sort du tirage et la même graine donne une autre course.
Depuis le 25/11 (relecture des outils) : **un bloc par mort** (`#### MORT n sur N : à t s de partie, cause, map, en vol ou au sol — puis reprise par la seconde
chance`), puis `#### LA FIN` si la course ne finit pas par une mort. Avant, seule la fin était racontée : une course reprise par la seconde chance puis coupée par
le temps montrait une fin sans mort, et la mort qui avait coûté un palier n'apparaissait nulle part. Chaque décision dit aussi le **radar** en vol (chaque rayon,
son issue et dans combien de secondes ; « les 10 rayons → air » quand ils disent tous la même chose), la **tenue** de route et les **sorties** au sol, et tous les
champs de l'ordre (`drift`, `ensuite`, `regarder` compris). `boucle.js` borne chaque bloc à 6 000 caractères en gardant sa fin (les décisions d'avant la mort).

**Allégé, c'est la version « sobre » du jeu** (`--regime allege` = `?allege=1`) : celle du web sur téléphone et d'un PC lent — les 14 parties de l'étalon y ont été
jouées. Ce n'est pas celle de l'app sur les iPhone 16, 16 Pro, 17 et après (classes 3 et 4 du jeu, dans l'app seulement, tant que le plafond appris en course
reste N4) : eux ont les maps pleines, et la jade y pose ses pics avec le facteur 0,7 au lieu de 0,35 — **deux fois plus de pics**, le décor qui tue en vol sur la
jade (4 morts « pic » sur 20 dans la note de départ). Les iPhone 12 à 15 Pro et le 16e, comme tout Safari, restent en sobre. Un pilote réglé ici rencontrera donc
deux fois plus de pics sur les iPhone récents ; aucune note de contrôle ne rejoue aujourd'hui leur jeu (le simulateur n'est pas « dans l'app » : `&sobre=0` ne
suffirait pas à le reproduire). Lu dans le code du jeu (`rendu/soleil-planete.js`, `rendu/palier-appareil.js`, `maps/jade-3.js`), pas mesuré.

### 4 bis. Le juge « humain ou bot » (`discerner.js`)

Coupe chaque partie en fenêtres de 10 s, mesure ce qu'un spectateur voit (écart au milieu, ondulation, vols, nitro, drift…), entraîne une
régression logistique humain / bot en laissant une partie entière de côté à chaque tour, et donne l'AUC (0,50 = indiscernable), un témoin à
étiquettes mélangées, et ce qui trahit le bot mesure par mesure (z = distance aux joueurs).

- Les parties des joueurs sont **celles d'`etalon.js`**, comptées par la même fonction (`partiesJoueurs`) : doublons écartés, seconde chance
  recollée, fin à la mort. Par défaut les parties **au clavier** (`--humains clavier|doigt|tous`).
- **Le bot se juge sur une note complète** : `node noter.js <cerveau> --parties`, puis `node discerner.js results/note-….json`.
  Les 4 courses de `ml/labo/trajectoires` sont les courses EXTRÊMES gardées par `clore.js` : un verdict sur elles (l'AUC de 0,97 du 24/11)
  n'est pas celui du bot ordinaire.
- **L'ondulation et l'accélération latérale sont divisées par la vitesse au sol** (km/h ÷ 3,6, 10 m/s au moins), depuis le 25/11 : en m/s elles grandissent
  avec la vitesse (chez les joueurs au clavier, l'écart-type de la vitesse latérale passe de 14,7 m/s sous 350 km/h à 46,8 au-dessus de 700), et un bot lent
  paraissait onduler moins qu'eux. Le rapport vaut 0,17 à 0,21 chez les joueurs à toutes les vitesses. **Pas vérifié** : « hauteur max » et « pièces par
  seconde » dépendent peut-être aussi de la vitesse.
- **Le juge ne lit pas les touches** (ni `steer`, ni le journal) : un adversaire ne les voit pas. Un réglage du `profil` (durées des coups, repos, réactions) ne
  peut le faire bouger que par la trajectoire qu'il donne ; la main elle-même se mesure avec `appuis.js` (§ 3.8).
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
- (25/11, relecture du simulateur) chaque course du bot est donc **la toute première partie d'un débutant** (`SAVE.d.ex.runs` = 0, remis avant chaque course
  par `ml/reel/jeu-reel.js`) : son premier pouvoir est toujours un AIMANT posé près de l'axe, et l'aimant sort 30 % du temps (vitesse 12 %, aura ×2 16 %)
  contre 19 % pour un habitué de plus de 30 parties (16 %, 27 % ; `code/gameplay/pouvoirs-grisants.js`). Le palier se compte en pièces et l'aimant en
  ramène : un petit avantage sur les joueurs de l'étalon, qui ont des dizaines de parties. **L'effet n'est pas mesuré** ; une sauvegarde de départ
  d'habitué changerait toutes les courses : à décider à l'étape D (le rythme de ramassage) ;
- le bot joue **au clavier** ; chaque partie dit si elle a été jouée au clavier ou au doigt (`etalon.js` les compte à part dans son titre) ;
- une reprise par **seconde chance** est recollée à sa partie ; le bot en prend une si son profil le dit (`chance.prend`, § 3.5 : recollée pareil) — sans profil, jamais ;
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
- **(25/11) Le relief du canyon** : même défaut, plus grave — le relief partait dans le même travailleur muet, et le canyon des bots n'avait **ni paroi, ni
  rivière, ni tunnel, ni mur de couloir** (une sortie de route y était un vol gratuit). `cyw=0` (l'interrupteur du jeu) le calcule sur place. **C'est le
  seul changement du simulateur qui change la course d'un cerveau sans profil** : toute course qui passe au canyon. La course du témoin (graine 910000,
  150 s, régime max : espace > nuages > grotte) n'y passe pas : **l'empreinte `a7b3171768ca` ne change pas** (contrôlé, `verifier.js` TOUT PASSE). Les
  notes, les lignes du journal et les rejeux d'avant portent la version du simulateur `avant-relief` (absente du fichier = avant) ; ceux d'après,
  `relief-canyon`. Détail et mesures : `ml/reel/README.md`, section du 25/11.
- **(25/11) La NITRO en vol d'une course à l'autre**, l'**ouvrier qui compte ce qu'il avale**, la **version du simulateur** : voir la même section.
  La note de départ refaite dans ce simulateur : § 7 bis.

Le jeu lui-même n'est pas modifié.

## 7 bis. La note de départ, avant et après le relief du canyon (25/11)

Le bot de référence, version allégée, 20 graines (910000 + 37 × i), 900 s au plus, un processus neuf par course
(`node noter.js --regime allege --tmax 900 --graines 20 --coeurs 4`, puis renommée `results/note-reference-allege.json` ; 6 min sur ce PC).
L'ancienne est gardée : `results/note-reference-allege-avant-relief.json` (24/11).

| | palier médian | meilleur | survie médiane | pièces par minute | argent par minute | en l'air | les fins |
|---|---|---|---|---|---|---|---|
| avant le relief (24/11) | 9 | 25 | 157,3 s | 402,5 | 28 821 | 9,9 % | vide 11 · pic 4 · roche 4 · tour 1 |
| avec le relief (25/11) | **8,5** | **18** | **141,1 s** | **351,7** | 11 523 | 7,9 % | vide 8 · pic 4 · **paroi 3** · roche 3 · **rivière 1** · tour 1 |

**Seules les 4 courses qui passent au canyon ont changé** ; les 16 autres redonnent exactement leur course (même empreinte) :

| graine | avant | après |
|---|---|---|
| 910111 | canyon, 56,4 s, vide, palier 4 | canyon, 52,1 s, **rivière**, palier 4 |
| 910222 | nuages > canyon > jade > espace > ville > grotte, 333,9 s, roche, **palier 25** | nuages > canyon, **76,6 s, paroi, palier 5** |
| 910444 | espace > ville > canyon, 211,3 s, vide, palier 20 | espace > ville > canyon, 130,1 s, **paroi**, palier 12 |
| 910481 | ville > grotte > canyon, 166,8 s, vide, palier 13 | ville > grotte > canyon, 152,2 s, **paroi**, palier 11 |

Les deux meilleures courses de la note d'avant (paliers 25 et 20) passaient au canyon : elles y volaient sans risque là où le vrai jeu tue. Le
meilleur palier tombe de 25 à 18 (910629, qui ne passe pas au canyon), la médiane de 9 à 8,5. **Les 4 courses qui atteignent le canyon y meurent toutes, contre le décor** (3 parois, 1 rivière) ; avant, elles y
mouraient « vide » ou le traversaient. Les joueurs de l'étalon meurent 2 fois sur 14 « paroi »
(`ml/ecurie/etude/humains.md`). Toute note faite avant le 25/11 (simulateur `avant-relief`) ne se compare plus à une note d'après.
