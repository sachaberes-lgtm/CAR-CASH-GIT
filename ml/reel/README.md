# ml/reel — des bots qui conduisent le VRAI jeu actuel

`ml/train/train.html` est une **copie du jeu de juillet** : les bots y apprenaient une physique qui n'existe plus
(découvert le 2026-10-20). Ici on charge **`VERSION PRINCIPALE/index.html`, le jeu publié tel quel**, dans un faux
navigateur sans écran, et on le pilote avec les **touches d'un clavier** (les gestionnaires `keydown`/`keyup` du jeu).
Rien du jeu n'est modifié ; chaque mise à jour du jeu est reprise automatiquement au prochain lancement.

| Fichier | Rôle |
|---|---|
| `sim-env-reel.js` | le faux navigateur + une porte de lecture ajoutée à la fin du script (`__EV`, `__S`, `__TRK`) |
| `jeu-reel.js` | `creer()` : `lancer(graine)`, `image()` (1/60 s exactes), `touche()`, `etat()` |
| `cerveau.js` | 15 entrées → 16 neurones → 4 touches (volant, HAUT, BAS, NITRO) |
| `worker.js` | charge le jeu une fois, note des cerveaux (distance parcourue en N secondes) |
| `entrainer.js` | l'évolution, 2 ouvriers en parallèle, reprenable (`--reprendre`) |
| `etape0.js` | (22/11) la mesure de l'étape 0 BOTS-ML : vitesse + même graine = même course ? → `results/etape0.json` |
| `repetable.js` | (22/11) le contrôle map par map (même processus, et deux processus neufs) → `results/repetable.json`. **À relancer après chaque mise à jour du jeu.** |

**Ce que ça garantit** : mêmes touches, même physique, mêmes règles que le joueur — c'est le jeu lui-même qui tourne.
**Ce que ça ne garantit pas** : que les bots *ressemblent* à des humains. Pour ça il faut des parties de vrais joueurs
à comparer (fréquence des appuis, figures par minute, temps en l'air) — voir la fin de ce fichier quand elles existeront.

Le jeu tourne environ 3 à 4 fois plus vite que le temps réel (certaines maps lourdes, moins). Les scripts décoratifs
`creatures/singe.js`, `dauphin.js`, `vitrail.js` ne sont pas chargés : ils coûtaient 70 % du temps pour rien.

## Depuis le 23/11/2026 — étape 1 : les bots vivent dans `ml/bot`

Le contrat du bot (ses yeux, ses gestes, ses doigts, sa note) est dans **`ml/bot/README.md`**. `cerveau.js`, `worker.js` et `entrainer.js`
(le petit réseau d'octobre) restent pour mémoire et pour `etape0.js` / `repetable.js`.

Deux réparations du simulateur ce jour-là, trouvées dès que les courses ont dépassé 110 s (celles de l'étape 0 faisaient 60 s) :
- **Le portail de fin de piste ne passait pas.** Le jeu attend deux images d'écran (`requestAnimationFrame`) avant de bâtir la piste suivante ;
  ici elles ne battaient jamais, la caisse restait tenue à la bouche du portail. `sim-env-reel.js` laisse maintenant passer ces demandes
  pendant l'attente du portail (`PORTV.att`), et seulement là. (Corrigé le 25/11 : il était écrit « `loop()` exclue, c'est `jeu-reel` qui
  l'appelle ». C'est faux : le jeu enrobe `requestAnimationFrame` dès le chargement — la sonde du démarrage, `code/page/debut-corps.html`, qui ne se
  referme jamais ici —, ce qui arrive à la porte est toujours cette enveloppe, jamais `loop`. Pendant l'attente, `loop` tourne donc une fois de plus
  par image, à la même heure : 4 fois de trop pour 2 portails sur la course témoin. L'empreinte témoin `a7b3171768ca` dépend de cet accident ; sans
  lui, c'est une autre course. Pas corrigé : rien ne dit laquelle des deux est la plus proche d'un navigateur. Voir `jeu-reel.js`.)
- **La grotte bâtie à un portail n'arrivait jamais** : elle se creuse dans un Worker, et celui du simulateur ne répond pas. `jeu-reel.js`
  passe `grotteworker=0`, l'interrupteur du jeu qui la creuse sur place.

Une course enchaîne donc les maps comme une vraie partie. La vitesse baisse sur les maps lourdes bâties en route (jade, grotte) :
compter 2 à 4 × le temps réel sur une course de plusieurs minutes, contre 6,8 × sur la première piste seule.

## État au 22/11/2026 — étape 0 du plan BOTS-ML (`passation/BOTS-ML.md`)

**Vitesse** (`node etape0.js`, 3 graines × 60 s, PC de Sacha, Node 24) : **411 images/s = 6,8 × le temps réel** en course
(83 à 666 selon la map et la course), chargement 5 s. Hors course : bâtir une map coûte de 2 à 25 s (la grotte est la plus lourde).

**Même graine = même course ?**
- **Processus neuf : OUI, au bit près.** Deux processus neufs, même graine, même map → même trace. C'est la garantie des **rejeux**
  (un rejeu = commit + graine + map + touches, rejoué dans un processus neuf).
- **Même processus, après d'autres courses : presque.** Identique au bit près sur la ville, la jade et le canyon (30 s) ; ailleurs,
  identique 9 à 34 s puis un écart sur la NITRO (0,24 de jauge d'un côté, pas de l'autre), qui grossit ensuite. Assez pour comparer des
  cerveaux sur 20 graines ; pas assez pour un rejeu. Piste non suivie : un état de la machine NITRO / double appui qui n'est ni une
  variable de haut niveau ni une propriété d'une fonction (une variable locale d'une fonction auto-appelée, sans doute).

**Ce qui a été changé dans le simulateur** (jamais dans le jeu) pour en arriver là :
- `sim-env-reel.js` : three.js pris dans `VERSION PRINCIPALE/vendor` si `ml/sim` n'a pas le sien ; **pas d'écran titre** (sinon la 1re
  touche du bot lançait l'intro du studio, qui figeait `loop()`) ; **horloge virtuelle** (Date suit l'horloge du jeu, les minuteries
  partent à l'heure du jeu, une par image au plus pour une chaîne `setTimeout(f,0)`) ; **le jeu a son propre `Math`** (three.js ne pioche
  plus dans la suite de la graine) ; le hasard du chargement est semé ; un **Worker qui ne répond jamais** (le modèle des nuages, pur décor,
  coûtait 82 s d'un bloc sans lui).
- `jeu-reel.js` : `?intro=ancien&prebati=0` ; toutes les courses passent par `resetGame()` (un seul `start()`, de chauffe) ; la piste est
  attendue (elle se bâtit dans les 1res images de `loop()`) ; `lancer(graine, {carte, meteo})` impose la map, sinon la graine la tire ;
  avant chaque course : le tirage des maps et ses mémoires (`SF_HIST`, `GRT_VUS`) repartent de zéro, la sauvegarde en mémoire revient à
  son état de départ, l'horloge revient à l'heure de la chauffe, et **~2 700 variables du jeu** (données pures, champs de données des
  objets, réserves de particules, propriétés des fonctions comme `loop._ms`, pose de la caisse et de la caméra) sont remises comme à la
  chauffe. Ce qui tient un maillage, une matière, le DOM n'est jamais touché : `resetGame()` / `newTrack()` le rebâtissent.

## État au 24/11/2026 — étape 1 bis (`ml/labo/README.md`)

Trois ouvertures, sans effet tant qu'on ne s'en sert pas (contrôle : les 20 courses du bot de référence redonnent leurs 20 empreintes
du 23/11, et les 4 rejeux gardés sont exacts) :
- `jeu-reel.js` : `creer({charge, noms})` accepte un autre chargeur que le faux navigateur. La salle de projection y met le jeu chargé
  dans un **vrai** navigateur ; la chauffe, la photo, la remise et la graine restent ce même code.
- `sim-env-reel.js` : les portes de lecture (`__EV`, `__TRK`, `__S`) sont sorties dans `PORTES`, pour que le navigateur pose les mêmes ;
  le générateur de hasard rend son état (`Math.random.__etat()`, et `__etat(v)` pour le poser).

**Ce que cette étape a montré du simulateur.**
- Sa fausse page ne fait pas tourner la couche d'effets du vrai jeu comme un navigateur : `classList.contains` y répond toujours non (la
  flamme du bouton NITRO ne s'anime jamais), et presque chaque image tire un nombre de valeurs au hasard différent de celui d'un vrai
  navigateur. Pour la conduite, les routes et l'argent, ça ne change rien **une fois le hasard recalé** (`HASARD_CODE`, `ml/bot/piloter.js`).
- **Le régime** (corrigé le 25/11 : ce paragraphe disait « au régime MAXIMUM, quel que soit le PC », ce qui n'est plus vrai depuis le 24/11).
  Par défaut, régime maximum (`POSTE.r = 3`, Crypto City au tirage) : sans carte graphique à juger, le jeu prend le simulateur pour un poste récent.
  `ouvrir({regime:'allege'})` dans `ml/bot/piloter.js`, donc `--regime allege` de `noter.js`, `inscrire.js`, `justesse.js` et le défaut de
  `ml/ecurie/boucle.js`, charge le jeu avec `?allege=1` : la version allégée, sans Crypto City, celle des joueurs de l'étalon (14 parties, PC à puce
  intégrée ou téléphone) et de l'écurie. Le POSTE reste à 3. Ce que l'allégé change d'autre que le tirage des maps n'est pas mesuré.
- Course de quatre maps rejouée dans un vrai navigateur, au même régime, hasard recalé : **la même course, à chaque décision** : 1 879 décisions sur 1 879, 11 268 images, trois portails, même fin (roche) et même argent (52 545,35) ; aucune image n'a eu besoin d'être rattrapée. (Graine 910074 : nuages, jade, crypto, grotte —
  ce contrôle ne dit **rien du canyon**, et le relief du canyon n'a jamais été rejoué dans un vrai navigateur.)

## 25/11/2026 — le simulateur fidèle (relecture du simulateur)

Décision de la session principale, pour Sacha : avant de dépenser les 200 € de la boucle, le simulateur doit avoir **les mêmes obstacles que le
vrai jeu**. Un pilote noté sur un canyon sans parois est noté sur du faux. C'est le seul lot qui a eu le droit de changer la course d'un cerveau
sans profil.

- **Le relief du canyon est allumé** (`REQUETE` de `jeu-reel.js` porte `&cyw=0`, l'interrupteur du jeu, comme `grotteworker=0`). Avant, le jeu
  envoyait le relief à un travailleur qui ne répond jamais ici : `CY.on` restait faux, donc **ni paroi, ni rivière, ni tunnel, ni mur de couloir** ;
  une sortie de route au canyon était un vol gratuit, quand le vrai jeu tue en 0,2 s. MESURÉ (version allégée, bot de référence, 900 s) sur les
  4 graines de la note de départ qui passent au canyon : 910222 passe du palier 25 (333,8 s, « roche », 6 maps) au palier 5 (76,6 s, « paroi ») ;
  910444 du palier 20 (211,3 s, « vide ») au palier 12 (130,1 s, « paroi ») ; 910481 du palier 13 (166,8 s, « vide ») au palier 11 (152,2 s,
  « paroi ») ; 910111 reste au palier 4 mais meurt « rivière » à 52,1 s au lieu de « vide » à 56,4 s. Les 16 autres courses de la note, qui ne
  passent pas au canyon, redonnent exactement leur course (même empreinte). La note de départ refaite : `ml/bot/README.md`, § 7 bis.
  Le coût : le relief se calcule en 3 à 4 s à chaque canyon bâti (le vrai jeu fait le même calcul dans son travailleur) ; les yeux coûtent moins de
  3 % du temps d'une course entière (radar coupe / ouvert sur ces 4 courses : 19,7 / 19,8 s, 27,0 / 26,3 s, 39,0 / 39,3 s, 77,6 / 78,2 s de calcul),
  même si une vue en vol au canyon coûte 4 à 20 ms. Pas de mémo du relief : il n'est pas nécessaire au seuil fixé (10 %).
  Mêmes nombres que le travailleur du vrai jeu : le texte de ce travailleur, exécuté à part, rend les mêmes octets que le calcul sur place
  (relecture, 4 canyons ; pas vérifié dans un vrai navigateur). ⚠ Le travailleur du vrai jeu plante sur certains canyons (il lui manque
  `cyNiveauEau`) et le jeu se rabat alors sur le calcul sur place : c'est un défaut **du jeu**, transmis, pas corrigé ici.
- **La version du simulateur** (`SIMULATEUR` = `relief-canyon` ; l'ancienne : `avant-relief`) s'écrit dans chaque note (`ml/bot/noter.js`), chaque
  ligne du journal du labo et chaque rejeu (`ml/labo/labo.js`, `versionJeu`). Une note ou un rejeu sans elle est d'avant le relief.
  `creer({simulateur:'avant-relief'})` (et `ouvrir({simulateur})` de `ml/bot/piloter.js`) recharge l'ancien simulateur : c'est ainsi que
  `ml/labo/rejouer.js`, `garder.js` et la salle de projection rejouent un vieux rejeu **dans le simulateur de son enregistrement** ; la boucle
  ne compare que des notes du même simulateur ; `inscrire.js --note` refuse une note d'un autre simulateur.
- **Une course ne dépend plus de la NITRO en vol de la course d'avant** (même processus). `loop._nAirT` (l'heure du dernier coup de réacteur en
  vol) naissait après la photo de l'état propre et n'était jamais effacé ; l'horloge revenant à T0, le jeu refusait le réacteur en vol à la course
  suivante. Désormais `remet()` efface sur les fonctions du jeu les propriétés de données nées après la photo (une quarantaine par course :
  `loop._nAir`, `loop._nAirT`, `loop._nk`, `tryLand._bi`, `dalleProche.bd`, `engBig.*`… ; un contexte de dessin ou une instance n'est pas touché). La première course d'un processus ne change pas (les notes, un
  processus par course, non plus). `repetable.js` tient désormais la NITRO en vol et contrôle l'effacement. MESURÉ (`node repetable.js --tmax 30`,
  25/11) : le même processus redonne la même course sur 5 maps sur 7 (nuages, ville, jade, crypto, canyon) et le même processus égale un processus
  neuf ; le 23/11 (sans la NITRO en vol, même durée) : 3 sur 7, et pas le même que le processus neuf. ⚠ L'espace et la grotte s'écartent encore,
  à la même image que le 23/11 (1 038 et 1 248, un écart de NITRO) : un autre état reste. Les rejeux et les notes restent à un processus neuf par course.
- **Le faux travailleur compte ce qu'il avale** (`sim-env-reel.js`, `travailleurs()` de `loadGame`) : qui l'a créé (les fonctions du jeu dans la
  pile) et combien de messages sont restés sans réponse. `ml/bot/verifier.js` (contrôle 6c) refuse un travailleur en attente hors du décor permis
  (le modèle des nuages, `cotonOuvrier` ; le ciel reflété sur la carrosserie, `envOuvrier`) et exige que le décor qui tue de chaque map soit
  allumé (canyon `CY.on`, jade `JADE.col`, ville `CITY.col`, grotte `GROTTE.root`). Les dunes (`?dnw=0`) ont le même travailleur : hors du tirage
  de main aujourd'hui, le contrôle le verra le jour où elles reviennent.
- **Pas corrigé, écrit** : la double boucle à l'attente du portail (voir plus haut) ; chaque course du bot est la toute première partie d'un
  débutant (`SAVE.d.ex.runs` = 0 : premier pouvoir un aimant près de l'axe, aimant tiré 30 % du temps contre 19 % pour un habitué — l'effet sur
  les pièces n'est pas mesuré ; à décider à l'étape D).
