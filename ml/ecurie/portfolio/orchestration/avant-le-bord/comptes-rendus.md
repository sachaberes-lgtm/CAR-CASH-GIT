# L'étude « avant le bord » (ce que le pilote pourrait faire au sol avant de sortir de la route) : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu en texte libre ; l'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l'agent. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `avant-le-bord` (wf_9b9e2844-682), lancée par la session principale (Claude Fable).
- Agents : 10, 7 du modèle claude-opus-5-5, 3 du modèle claude-fable-5-2 (le modèle de chaque agent est écrit à son rôle, plus bas).
- Durée : 27 min ; jetons consommés par les agents : 1 744 957 (1,74 millions) ; appels d'outils : 213.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. lecteur « traces » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course (phase « Comprendre »)
2. lecteur « code » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course (phase « Comprendre »)
3. lecteur « joueurs » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course (phase « Comprendre »)
4. concepteur « vitesse » : propose une règle de pilote chiffrée, à partir des trois lectures (phase « Concevoir »)
5. concepteur « ligne » : propose une règle de pilote chiffrée, à partir des trois lectures (phase « Concevoir »)
6. concepteur « libre » : propose une règle de pilote chiffrée, à partir des trois lectures (phase « Concevoir »)
7. relecteur « chiffres » : attaque les trois propositions sous cet angle (phase « Attaquer »)
8. relecteur « code » : attaque les trois propositions sous cet angle (phase « Attaquer »)
9. relecteur « banc » : attaque les trois propositions sous cet angle (phase « Attaquer »)
10. rédacteur : écrit le LISEZ-MOI de l'étude à partir de tout ce qui précède (phase « Ecrire »)

## 1. lire:traces

*Rôle : lecteur « traces » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

#### Avant le bord : ce que disent les traces (lecteur des traces, 28/11)

Je n'ai joué aucune course. J'ai relu les 40 traces de `ml/ecurie/etude/sortie-preparee/sorties/lignes/*.jsonl.gz`. Les décollages viennent des événements du jeu, comme dans `relecture.js`. Les 9 doublons des courses « libre » sont retirés. Mes trois scripts sont dans `ml/ecurie/etude/avant-le-bord/lecteur-traces/` : `avant-le-bord.js`, `complements.js` et `vues-rapides.js`. Leurs sorties sont dans `lecteur-traces/sorties/` : `avant-le-bord.txt`, `.json`, `complements.txt` et `vues-rapides.txt`. Rien n'est modifié ailleurs et rien n'est commité.

**Le périmètre.** On compte 180 décollages subis distincts, dont 24 mortels, ce qui recoupe la relecture. Sur les maps à décor, il en reste 160 : **22 mortels**, 137 posés, 1 coupé par la limite de temps. Les 2 autres morts tombent sur nuages et espace, hors sujet ici. Les comparaisons portent donc sur 22 morts contre 137 posés. À 0,6 s avant le décollage, il n'y a une vue au sol que pour 18 morts et 103 posés : les autres décollages suivent une pose de trop près.

##### 1. Évitable ou imposé : le chiffre le plus important

**Ce que dit le jeu.** L'enregistreur (`code/moteur/enregistreur-jeu.js`, l.74) classe chaque décollage en « trou », « bord » (si |lat| > 0,92 de la demi-largeur) ou « saut ». Les 246 décollages distincts sont tous « bord ». Au décollage, |lat| vaut entre 25,8 et 28 m, pour une demi-largeur de 28 m dans toutes les vues. **La route ne s'arrête jamais sous la caisse** sur ces données : aucun trou, aucune fin de dalle. Toutes les sorties se font par le côté.

**Ma définition**, en lisant les yeux :
- **évitable** : à au moins une vue au sol entre 0,6 et 3 s avant le décollage, `tenue` disait « la route tient 3 s en conduite au mieux » ;
- **imposé** : `tenue` disait « bord » à toutes ces vues ;
- **sans sol** : aucune vue au sol à 0,6 s ou plus. Ce sont les chaînes : la caisse se pose et repart aussitôt.

| classe (maps à décor) | morts | posés |
|---|---|---|
| évitable | **17** | 101 |
| imposé | **1** (canyon 3970659, bord annoncé 1 s avant) | 2 |
| sans sol à 0,6 s | 4 (3 vols de 6 s à la jade, 1 chaîne au canyon) | 34 |

Avec une définition plus stricte (« tient » à **toutes** les vues de 0,6 à 3 s), il reste 13 morts et 94 posés évitables. À 0,8 s avant, `tenue` disait « tient » pour 17 morts sur 18. Le bord n'est annoncé à 0,6 s ou plus que pour 3 morts et 8 posés (médiane de la première annonce : 0,29 s chez les morts, 0,28 s chez les posés).

Deux réserves sur ce chiffre :
- `tenue` est une approximation : vitesse tenue, ni drift ni flaque, et une main sans retard, alors que celle du pilote met 0,2 s.
- « Évitable » veut donc dire « évitable par une conduite idéale qui part de cet état », pas « évitable par c0025 ».

**Conclusion : environ 17 morts sur 22 sont évitables au sens des yeux, et 1 seule est imposée.**

##### 2. Les grandeurs lues au sol, morts contre posés

Les grandeurs sont orientées vers le côté de la sortie :
- `marge` = 28 − lat, en m ; plus de 28 veut dire que la caisse est sur l'autre moitié de la route ;
- `capS` = le cap vers le bord, en rad ;
- `v` = la vitesse de la vue, en m/s.

Le seuil est celui qui sépare le mieux (indice J de Youden). « Au-dessus » se lit dans le sens indiqué, par exemple « nitro coupée ».

| grandeur, recul | médiane morts / posés | seuil | morts au-dessus / en dessous | posés au-dessus / en dessous | p (Fisher) |
|---|---|---|---|---|---|
| v à 1,5 s | 148 / 132 | > 143 | 13 / 4 | 31 / 64 | 0,001 |
| v à 1 s | 149 / 134 | > 139 | 14 / 4 | 38 / 58 | 0,004 |
| v à 0,6 s | 155 / 136 | > 154 | 11 / 7 | 26 / 77 | 0,005 |
| nitro coupée à 1 s | 50 % / 18 % | coupée | 9 / 9 | 17 / 79 | 0,005 |
| nitro coupée à 0,8 s | 50 % / 25 % | coupée | 9 / 9 | 25 / 75 | 0,046 |
| marge à 0,6 s | 37 / 28 | > 39 | 9 / 9 | 14 / 89 | 0,001 |
| cap vers le bord à 0,6 s | 0,19 / 0,23 | | | | 0,27, rien |
| jauge, palier, ligne visée | proches | | | | > 0,1, rien |

**Le hasard.** J'ai mélangé les étiquettes « mort » 300 fois sur les 36 grandeurs lues à 0,6 s ou plus. Le meilleur J trouvé par hasard vaut 0,37 en médiane et 0,49 dans 95 % des tirages. Aucune grandeur ne dépasse 0,49 : la meilleure est la vitesse à 1,5 s, avec J = 0,44. **Fouillées à l'aveugle, ces 22 morts ne prouvent aucun séparateur.**

**À carte égale.** La carte pèse lourd : le canyon tue 30 % de ses décollages, la jade 5 %. J'ai donc permuté les étiquettes à l'intérieur de chaque carte (`complements.js`), pour les grandeurs que l'étude d'avant désignait déjà, la vitesse et la marge :

| grandeur | rang moyen des morts dans leur carte (0,5 = hasard) | p |
|---|---|---|
| vitesse à 2 s | 0,70 | 0,0003 |
| vitesse à 1,5 s | 0,71 | 0,0005 |
| vitesse à 1 s | 0,69 | 0,001 |
| vitesse à 0,6 s | 0,68 | 0,002 |
| nitro demandée à 1 s | 0,38 (les morts l'ont moins) | 0,012 |
| marge à 0,6 s | 0,63 | 0,04 |
| palier | 0,58 | 0,13, rien |

Vitesse au-dessus de 143 m/s à 1,5 s, carte par carte :

| carte | morts au-dessus / en dessous | posés au-dessus / en dessous |
|---|---|---|
| canyon | 6 / 0 | 4 / 13 |
| grotte | 4 / 3 | 4 / 20 |
| ville | 2 / 1 | 3 / 8 |
| jade | 1 / 0 | 20 / 23 |

**Ma lecture.**
- **La vitesse est le seul séparateur qui tient.** Il tient dans les trois cartes qui tuent, il se lit dès 1,5 à 2 s avant le décollage, et ce n'est pas le palier : le palier seul ne sépare pas.
- Au sol sur décor, 17 % des vues dépassent 143 m/s (`vues-rapides.txt` : 4 937 sur 29 156). Or 13 des 17 morts qui ont une vue à 1,5 s en viennent : environ **15 fois plus de morts par vue** au-dessus du seuil.
- On peut y croire, mais pas en tirer un seuil précis : 17 à 18 morts seulement, un seul pilote, 8 graines par map. Le seuil de 143 m/s est choisi sur ces données : il est trop optimiste.
- **La nitro coupée à 1 s** est un second signe, plus faible (p = 0,012 à carte égale). Elle est encore allumée à 2 s chez 15 morts sur 17.
- Le pilote coupe la nitro quand ce n'est « pas sûr » (`modele.js`, l.282 à 296 : marge de vitesse dans le virage, volant demandé). Ma lecture : c0025 arrive vite, nitro allumée, et ne la coupe qu'environ 1 s avant, quand le virage la refuse. Couper la nitro ne freine pas. **C'est une déduction.** La marge de vitesse et `v.virage` ne sont pas gardés dans les traces.
- **Les morts viennent de l'autre côté de la route.** À 0,6 s, ils sont à 37 m du bord de sortie (lat ≈ −9) et traversent toute la largeur en 0,6 s : environ 60 m/s de vitesse latérale, contre 47 chez les posés. Le cap vers le bord passe de −0,11 à 1,5 s à +0,19 à 0,6 s, puis +0,5 à 0,3 s. Cela ressemble à un virage pris trop vite, la caisse emportée vers l'extérieur.
- Le balancement du cap (zigzag) ne sépare pas : 2 changements de signe dans les deux groupes, p = 0,29 à carte égale.

##### 3. Endroits, visites, paliers

- **Les mêmes endroits ne tuent pas plusieurs fois.** Une seule paire de morts tombe à moins de 40 m sur la même carte (canyon, 11 371 et 11 395 m). Le hasard en donne environ 0,55 : 30 paires proches sur 12 720 entre tous les décollages. De plus, le tracé du canyon est tiré à partir de la graine (`code/maps/canyon-route.js`) : une même distance n'est pas un même décor.
- **Le canyon tue loin dans la map.** Ses 8 morts tombent à 6,7 km ou plus, entre 62 et 104 s de course, toutes pendant la première visite. 13 des 19 décollages posés au canyon sont avant 6,7 km. La vitesse monte au fil de la visite : c'est cohérent avec le § 2, mais je ne l'ai pas prouvé.
- **Pas tôt dans la visite.** Part de morts par rang du décollage dans la visite de la map : 1er 8 sur 52, 2e 1 sur 38, 3e 4 sur 25, 4e et suivants 9 sur 44. Temps médian depuis l'entrée dans la map : 53 s chez les morts, 38 s chez les posés.
- **Le palier ne compte pas** une fois la carte connue : les morts vont du palier 1 au palier 8, p = 0,13.

##### 4. Ce que je n'ai pas pu savoir

- **Le volant au sol** n'est pas gardé : `O.volant` n'existe que dans 752 vues sur 34 201. Le pilote donne une `ligne`, et la ligne visée ne sépare pas.
- **La suite de la route** (`virage`, `ligne` des yeux, couloirs) et **la vitesse du jeu** (`vitMult`) ne sont pas dans les traces. Je ne peux donc pas dire « virage » ni « portail » autrement que par déduction.
- **Le type de pièce du décor** au point du décollage n'est pas connu.
- On ne sait pas si freiner sauverait. Couper la nitro plus tôt ne réduit peut-être pas assez la vitesse, et on ne sait pas si le jeu freine sans drifter (`prochaines-idees`, n° 4).

##### Ce que cela dit pour un gène au sol avant le bord

1. Le bon moment est 1,5 à 2 s avant, sur la vitesse, et pas sur l'annonce du bord : celle-ci arrive à 0,3 s, alors que la vitesse sépare déjà à 2 s.
2. Une piste de gène : sur une map à décor, au-dessus d'environ 140 m/s (un gène borné, par exemple 120 à 170), ne pas rallumer la nitro, ou la couper plus tôt, ou freiner quand un virage approche.
3. Le coût : ce seuil touche 17 % du temps au sol et deux décollages posés pour un mortel (31 posés contre 13 morts). Il peut coûter du palier en ralentissant partout.
4. Il est attendu au canyon et à la grotte, presque pas à la jade.
5. Le gain se joue sur au plus 17 morts évitables sur 22 en 40 courses. Seul le banc le dira, avec des courses à map imposée et un critère annoncé d'avance : les morts « paroi » et « roche ».


## 2. lire:code

*Rôle : lecteur « code » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

#### Avant le bord, au sol : ce que fait le pilote et ce qu'il pourrait savoir de plus (rôle : lecteur du code)

Je n'ai lancé aucune course et rien modifié dans `ml/evolution`, `ml/bot`, `ml/reel` ou `code/`. J'ai écrit un seul script, qui relit les traces déjà gardées par l'étude sortie-preparee : `ml/ecurie/etude/avant-le-bord/lecteur-code/sol-avant-bord.js`. Sa sortie est `sol-avant-bord.json`, dans le même dossier. Il porte sur 37 courses, après retrait des 3 courses « libre » comptées en double (§ 8.2 de la relecture).

##### 0. Ce que fait c0025 au sol sur une map à décor (`modele.js`, `auSol`)

- **La ligne.** La cible est bornée par `max = min(bandeDecor, demi − marge)`, l.223. Chez c0025 : min(99, 28 − 10) = **18 m**. `bandeDecor` vaut 99, donc **rien ne dépend du décor dans la ligne**.
- **Quand la route lâche** (`tenue.tient` faux), la cible passe à `−cote × max × 0,5`, soit 9 m du côté opposé (l.241). La ligne y glisse au pas `glisseUrgence` (l.261).
- **Le cap** est borné à ±0,4 rad, en dur (l.279).
- **La nitro.** Elle est coupée dès que la route lâche (l.296). Sur décor, son seuil de braquage est multiplié par `nitroDecor` (l.289). Chez c0025, `nitroDecor` vaut 1 : **la nitro se comporte comme sans décor**.
- **Les raccourcis** sont interdits à canyon, grotte et jade (`raccCartes` à 0) et permis en ville. Sur ces trois maps, le pilote ne demande donc jamais `sorties` (l.323-325).
- **Le frein et le drift.** Aucun des deux : `auSol` ne rend jamais de `manche`.
- **En vol.** Au décollage subi, la façon est « vers la route » (l.446). Le vol n'hérite du sol que `m.sortie` (raccourci engagé) et, gènes allumés, `planeBord` et `tNitroSol`.

##### (1) Ce que la vue au sol offre et que le pilote n'utilise pas

| champ (`yeux.js`) | ce qu'il dit | utilisé ? |
|---|---|---|
| `route[i].trou` (30 à 550 m) | un trou devant, à 8 distances | non |
| `route[i].monte`, `devers`, `envers`, et `pente`, `devers` ici | le relief et le dévers | non |
| `virage.vSure`, `rayon`, `vCorde`, `vSureDrift`, `braquage`, `angle` | la vitesse sûre et le rayon du prochain virage | seul `virage.marge` sert, et pour la nitro seulement (`margeV`) |
| `rayonMin`, `palier.vmax`, `vitMult` | le rayon possible et la vitesse | non (seul `palier.n` entre dans la tête SOL) |
| `tenue.t`, `tenue.s`, `tenue.mur`, `tenue.mortel` | quand et où le bord arrive, et si c'est un mur mortel | `tenue.t` ne sert qu'à `bordOn` et `sortieOn` (éteints) ; le reste, non |
| `sorties.bord` (rayons `rien`, `versRoute`, `plane`, et la cause du choc) | où mène la sortie, dès que le bord est à moins de 1,5 s | **jamais lu** |
| `mur.bord`, `mur.mortel`, `couloirs.genre`, `couloirs.plafond` | les couloirs à parois | seuls `mur.ici`, `d0` et `d1` servent |
| `volant` (la direction du moment), `drift`, `sursis`, `modules`, `sautRefuse` | l'état de la main et du jeu | non |

Sur ces champs, ceux qui parlent d'avant le bord sont `trou`, `vSure` contre la vitesse, et `tenue.mortel`. Le décor lui-même (paroi, roche, pic, tour) n'est **pas** dans la vue au sol. On ne le touche que par les rayons de `sorties`, joués en vol simulé.

##### (2) Ce que les yeux ne donnent pas, et qu'il faudrait

1. **Une tenue avec la main et la ligne du pilote.** Aujourd'hui, `tenue` roule 3 s avec la loi 0 (`rouler`, l.805) : un volant analogique, sans délai, qui vise le centre, à vitesse tenue. Quand cette conduite idéale sort quand même, l'état est déjà perdu.
   - Mesuré : sur les maps à décor, **155 décollages subis sur 160** partent du côté annoncé à la première annonce (`B.meme`). Seules **25 annonces sur 238** ne finissent pas en décollage dans les 0,6 s (`D`).
   - Le bord est annoncé 0,28 s avant (sortie-preparee § 8.5).
   - Il faudrait le temps avant le bord **pour la trajectoire que le pilote suit vraiment** : la main au clavier, sa ligne, ses coups de volant.
2. **Une tenue « en freinant ».** `rouler` garde la vitesse constante (« la vitesse tenue », l.789). Aucun rayon ne dit si ralentir sauve.
3. **La distance du décor de chaque côté**, au sol, le long de la route : la paroi en face, la roche, la tour. Rien aujourd'hui.
4. **Où la route reprend après un trou** : seul un drapeau `trou` est donné, à 8 distances. Les `troncons` ne listent que la route en contrebas, à plus de 8 m sous la voiture, qui fasse gagner au moins 60 m.
5. **La vitesse latérale vers le bord** : on ne peut que la déduire du cap et de la vitesse.

**Le coût.** `yeux.js` fait partie des fichiers qui fixent l'époque (`FICHIERS_EPOQUE`, `commun.js`, cité par `prochaines-idees` l.22). Le changer rend inutilisables toutes les courses en cache :
- la sélection du Ryzen repart sur une époque neuve. Elle est à la génération 18 (`origin/evolution-ryzen`, `resume.txt`) ;
- le champion c0025 doit être re-noté ;
- le banc doit rejouer son bras « départ » (96 courses) ;
- la vague 1 en cours est arrêtée.

Le budget de la vue au sol permettrait une deuxième tenue : `BUDGET.route` = 900 images, la tenue en prend 180. Ce n'est pas vérifié en coût réel.

##### (3) Les gènes qui touchent déjà la ligne, la marge et la vitesse sur décor

Les bornes et les valeurs de c0025 viennent de `genome.js` (REELS_R, `[clé, min, max, témoin]`, et GENES_V4). Le champion du Ryzen **est** c0025 (`19e3767cc346`).

| gène | bornes | c0025 | effet sur décor |
|---|---|---|---|
| `bandeDecor` | 10 – 99 | 99 (sans effet) | borne la ligne sur décor seulement. Sous 18, la ligne se resserre vers le centre |
| `nitroDecor` | 0 – 1,5 | 1 (sans effet) | multiplie le seuil de nitro sur décor. À 0, plus jamais de nitro sur décor, donc plus lent |
| `marge` / `margeCouloir` | 3–20 / 5–25 | 10 / 15 | la marge au bord, partout / en couloir |
| `glisse` / `glisseUrgence` | .04–.3 / .1–.6 | .12 / .3 | la vitesse de la ligne, normale et quand la route lâche |
| `capLigne`, `avanceCap`, `capAvance` | .1–.5, 0–.6, 0–.5 | .3, .25, .25 | le cap visé |
| `braqueDoux`, `braqueFort` | 0–.5, .2–1 | .15, .5 | la place à l'intérieur du virage |
| `braqueNitro`, `margeAllumer`, `margeTenir` | .2–1.2, −.1–.5, −.2–.3 | .7, .05, 0 | la nitro selon le virage et la vitesse sûre (pas propre au décor) |
| `jaugeAllume`, `jaugeCoupe`, `capMax` | .2–1.2, 0–.8, .1–.8 | .45, .25, .35 | la nitro selon la jauge et le cap |
| `sortieOn` (+ `sortieT`, `sortieJauge`) | drapeau | 0 (.7, .5) | la nitro au décollage sur décor |
| `raccCartes_*`, `raccJumeau_ville` | drapeaux | canyon, grotte, jade : 0 ; ville : 1 ; jumelle en ville : 1 | les raccourcis voulus (qui tuent en ville) |
| tête SOL `WS` (12 → 6 → 3) | poids | W2 = 0 (muette) | voit `decor` et `lache` en entrée ; décale la ligne de ±5 m ; règle le seuil de nitro |

**Ce que la sélection peut déjà faire seule :**
- resserrer la ligne sur décor (`bandeDecor`) ;
- ralentir sur décor en coupant la nitro (`nitroDecor`, jusqu'à 0) ;
- retirer les raccourcis en ville (`raccCartes_ville`).

**Une règle neuve « ligne plus centrale » ou « moins de nitro sur décor » ne sert donc à rien.**

Deux réserves :
- en phase A, les têtes ne mutent pas (INTERFACES l.906-907) : la tête SOL reste muette ;
- après 18 générations, le champion est toujours le témoin, et le banc ne voit pas des écarts de 0,3 palier (`prochaines-idees` l.5). « Réglable » ne veut pas dire « trouvé ».

**Ce qu'aucun gène ne peut atteindre :**
- **le frein** : aucun code ne rend `manche` au sol ;
- un objectif de vitesse sous `vSure` propre au décor : `nitroDecor` n'agit que sur le seuil de braquage, pas sur la marge de vitesse ;
- réagir avant l'annonce de `tenue`.

##### (4) Les leviers réels au sol

- **Un frein existe.** ↓ au sol hors drift donne une accélération de `−1,5·acc9` (`code/moteur/boucle-2-conduite.js` l.43).
  - La main y accède par `manche: +1` (`doigts.js` l.5, l.7, l.256), avec le délai du manche : 150 / 240 / 380 ms (`MAIN_CLAVIER`).
  - Mais si le volant dépasse 0,35 et la vitesse 42 % du maximum, ↓ devient un **drift** (`conduite.md` l.58-60).
  - Le simulateur roule gaz automatiques (`AUTO_GAS`, `conduite.md` l.62, déduit par lecture et non vérifié en exécution) : on ne peut pas lever le pied.
  - Le frein remplace la poussée des gaz (`a=` écrase `a`). L'élan est gardé (`up` reste vrai).
  - Ordre de grandeur, **calculé et non mesuré** : 1,5 × 22 × 0,48 ≈ **16 m/s perdus par seconde** dans l'unité de la vue (accel 22, `cars.js` l.15 ; SPD 0,48), multiplié par (1 + (push − 1) × 0,6) et par vitMult. S'y ajoute la perte de la poussée des gaz.
  - Combien de vues « la route lâche » ont le volant sous 0,35 ? On ne sait pas : les traces ne gardent pas `vue.volant`.
- **Lâcher la nitro.** C'est mesuré, sur les vues au sol sur décor, sans glisse, rebond ni dessous, avec un ordre stable sur [t − 0,2 ; t + 0,8] (`A`) :

| sur 1 s | nitro demandée | nitro coupée |
|---|---|---|
| variation de vitesse, médiane (10 % – 90 %) | **+5 à +7 m/s** (−6 ; +18) | **−4 à −8 m/s** (−15 ; +5) |
| en part de la vitesse | +4,9 % | −5,8 % |
| nombre de mesures | 13 903 | 2 752 |

- **La vitesse compte peut-être.** 1 s avant un décollage subi, les mortels allaient plus vite que les décollages posés, avec de petits nombres (`C`, vitesse de la vue) :

| map | mortels | vitesse (médiane) | posés | vitesse (médiane) |
|---|---|---|---|---|
| canyon | 8 | 143 | 19 | 131 |
| grotte | 7 | 156 | 29 | 127 |
| ville | 3 | 164 | 20 | 119 |

  La vitesse au décollage (`ev[5]`, unité non vérifiée) va dans le même sens : canyon 564 contre 461, grotte 570 contre 483, ville 596 contre 410. C'est un indice, pas une preuve : 3 à 8 morts par map, et personne n'a vérifié que ralentir sauve.
- **Choisir de quel côté on quitte la dalle ?** Non, une fois le bord annoncé : 155 fois sur 160, la voiture part du côté annoncé. On ne peut choisir qu'avant, par un raccourci voulu : volant à fond d'un côté, ce qui demande `sorties`. C'est interdit chez c0025 à canyon, grotte et jade.
- **Ce que la main ne peut pas faire** (`doigts.js`) :
  - un volant analogique : elle tape des coups de 70 / 130 / 300 ms ;
  - réagir vite : 120 à 320 ms pour le volant, 110 à 300 ms pour la nitro ;
  - décider plus de 10 fois par seconde ;
  - freiner en braquant sans drifter.

##### Ce que je n'ai pas pu savoir

- L'effet réel d'un freinage : aucun rayon ne le joue, aucune course n'a freiné.
- Le volant au moment où la route lâche : il n'est pas gardé dans les traces.
- Si `bandeDecor` ou `nitroDecor` abaissés ont déjà été tirés par la sélection : je n'ai pas lu la population.

##### Ce que cela dit pour un gène au sol avant le bord

- Une ligne plus centrale ou moins de nitro sur décor existent déjà en gènes réglables (`bandeDecor`, `nitroDecor` à 0). Une règle neuve qui ferait cela ne sert à rien. Au mieux, un bras du banc qui les fixe (par exemple `nitroDecor` 0,5 et `bandeDecor` 14) dirait si la direction paie.
- Le seul levier neuf, sans toucher aux yeux, est **le frein** : `manche: +1` au sol, sur décor, quand `vitesse > vSure − marge` ou au premier `trou`, et seulement si |volant| < 0,35. Sinon le jeu fait un drift.
- Ce frein ne peut pas attendre l'annonce du bord : à 0,28 s, c'est trop tard. Il doit partir sur `virage.vSure` et `route[].trou`, que le pilote ne lit pas aujourd'hui.
- Avant de l'écrire : compter les vues sur décor avec |volant| < 0,35. Cela demande une trace qui garde `vue.volant`, que les traces actuelles n'ont pas.
- Une vraie anticipation, c'est-à-dire une tenue jouée avec la main du pilote et en freinant, demande de changer `yeux.js` : une nouvelle époque partout. Ce n'est à faire qu'en lot.


## 3. lire:joueurs

*Rôle : lecteur « joueurs » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

**Rapport du lecteur des joueurs et de la ville (28/11). Aucune course jouée, rien de modifié hors de `ml/ecurie/etude/avant-le-bord/joueurs-ville/`, rien de commité.**

Scripts laissés là, tous en lecture seule :
- `par-map.js` produit `par-map.json`.
- `vitesse-et-km.js` produit `vitesse-et-km.json`.
- `raccourcis-par-map.js` produit `raccourcis-par-map.json`.
- `ville-raccourcis.js` produit `ville-raccourcis.json`.

##### Les sources

| lot | fichier | contenu |
|---|---|---|
| Joueurs | `ml/bot/etalon/*.json`, lus par `partiesJoueurs`, comme `ressemblance.js` | 14 parties, 2 joueurs, 41 min |
| c0025 | `ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json` | 20 courses de 900 s au plus, maps tirées, jeu v1627 |

Pour c0025, `sha_cerveau` vaut c3e8b819…, le même que `ml/ecurie/pilote-voltige.js` aujourd'hui. Ce fichier n'est pas suivi par git.

Les deux lots ont le même format (l'enregistreur du jeu) et passent par les mêmes fonctions. Un mort est rattaché à la map de son décollage.

##### (A) Les joueurs avant le bord

###### A1. Ensemble (`par-map.json`, champ `tout`)

| | joueurs | c0025 |
|---|---|---|
| parties | 14 | 20 |
| durée médiane | 155 s | 137 s |
| palier médian | 11,5 (de 1 à 28) | 7,5 (de 2 à 14) |
| morts | 16 (dont 2 reprises en seconde chance) | 22 (dont 2 de plus que les fins) |

###### A2. Par map à décor (`par-map.json`, `vitesse-et-km.json`)

| map | min J / B | morts J / B | morts pour 10 min J / B | pour 100 km J / B | causes J | causes B |
|---|---|---|---|---|---|---|
| canyon | 3,4 / 2,8 | 3 / 3 | 8,9 / 10,7 | 8,7 / 14,3 | paroi 3 (dont 1 au sol) | paroi 3 |
| grotte | 6,4 / 10,9 | 4 / 9 | 6,2 / 8,2 | 5,6 / 12,3 | roche 3, glace 1 | roche 9 |
| ville | 4,8 / 4,3 | 2 / 3 | 4,1 / 6,9 | 4,2 / 11,3 | air 1, tour 1 | tour 3 |
| jade | 8,2 / 9,1 | 3 / 0 | 3,7 / 0 | 2,8 / 0 | pic 3 | — |
| **décor, total** | 22,8 / 27,1 | 12 / 15 | **5,3 / 5,5** | **4,6 / 8,0** | | |

J = joueurs, B = c0025.

Test des morts du bot, sachant le total, à taux égaux (calcul dans la commande de `raccourcis-par-map.js` ; il n'est pas gardé en fichier) :
- **par minute**, les deux lots meurent autant sur décor : p = 0,53 ; grotte p = 0,44 ;
- **par km**, le bot meurt environ 1,7 fois plus sur décor : p = 0,11 ; grotte p = 0,15. Ce n'est pas significatif.

###### A3. Les décollages par le bord (`par-map.json`)

| map | décollages J / B | mortels J / B | morts dans la seconde J / B | mort après, médiane J / B | nitro au décollage J / B | km/h au décollage, médiane J / B |
|---|---|---|---|---|---|---|
| canyon | 9 / 9 | 2 / 3 | 2 / 2 | 0,31 / 0,55 s | **0,60 / 0,00** | 646 / 515 |
| grotte | 50 / 58 | 3 / 9 | 2 / 5 | 1,5 / 0,6 s | **0,52 / 0,12** | 683 / 483 |
| ville | 41 / 34 | 2 / 3 | 0 / 1 | 4,8 / 1,5 s | **0,59 / 0,12** | 567 / 429 |
| jade | 80 / 42 | 3 / 0 | 2 / 0 | 0,4 s / — | **0,65 / 0,10** | 694 / 496 |

**Vitesse à temps égal** (`vitesse-et-km.json`). Au sol, toutes maps, minute par minute de partie :

| minute de partie | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| joueurs (km/h) | 405 | 503 | 598 | 699 |
| c0025 (km/h) | 374 | 455 | 497 | 539 |

Au décollage sur décor, aux minutes 0, 1 et 2 : joueurs 432, 542, 574 km/h ; c0025 397, 455, 497 km/h. **Les joueurs vont 8 à 30 % plus vite et partent nitro allumée 5 fois plus souvent. Ils ne meurent pas plus souvent par minute.**

**Place sur la route** : `|lat|` divisé par la demi-route, en médiane (`par-map.json`).

| | 1 s avant le décollage | 0,3 s avant |
|---|---|---|
| joueurs | 0,21 à 0,38 | 0,14 à 0,45 |
| c0025 | 0,27 à 0,33 | 0,38 à 0,48 |

Au sol, la part du temps au-delà de 0,75 de la demi-route vaut 2 à 9 % des deux côtés. **Aucun des deux ne longe le bord.** On ne voit pas d'écart net de ligne. Les comptes sont petits : 8 à 48 décollages par map.

###### A4. Ce que les données des joueurs ne contiennent pas
- Aucune intention : on ne sait pas si un décollage est voulu ou subi.
- Rien des yeux, des rayons, de la distance au décor ou de la paroi.
- Pas de filets.
- Deux joueurs bons, 14 parties. Sur les maps à décor : 22,8 min et 12 morts en tout, donc 2 à 4 morts par map.
- Une seule voiture (LA HONTE), en version ALLEGE.
- D'autres versions du jeu : 60aa15e et ccdca9b, contre v1627 pour le bot.

###### A5. La tension, à trancher par Sacha
- Les joueurs meurent bien au canyon et à la grotte : 8,9 et 6,2 morts pour 10 min. C'est autant que c0025 par minute (10,7 et 8,2).
- La part des décollages mortels au canyon est la même : 2 sur 9 contre 3 sur 9.
- Un bot qui ne meurt plus sur décor serait donc **moins humain par sa mort**.
- Or aucune des 15 mesures de E (`MESURES`, dans `ressemblance.js`) ne porte sur la mort, sa map ou sa cause. La note F = palier − 4E récompenserait ce bot sans rien lui retirer.
- Par km, en revanche, le bot meurt environ 1,7 fois plus que les joueurs. Ce n'est pas tranché (p = 0,11).

##### (B) Les raccourcis voulus en ville (`ville-raccourcis.json`)

**Correction de la piste.** Les « 5 morts sur 22 » mêlent deux choses :

| sorties voulues | nombre | morts | cause | mort après |
|---|---|---|---|---|
| ville, vrais raccourcis | 17 | **2** | tour | 0,75 et 0,25 s |
| ville, **sorties du dessous** (`raccourci.d`, vrai) | 5 | **3** | tour | 5,05, 0,75 et 0,45 s |
| ailleurs, raccourcis | 10 | 0 | | |
| ailleurs, sorties du dessous | 35 | 1 | pic | |

Les 17 raccourcis de ville, par façon engagée : `viser` 6 (0 mort), `versRoute` 5 (0 mort), **`viserPlane` 6 (2 morts)**.

Ce que disait le radar au sol, pour les 5 morts :

| course | sortie | à l'engagement | vue d'avant | dernière vue au sol | 1re vue en vol | issue |
|---|---|---|---|---|---|---|
| 3970548, 58,8 s | raccourci à gauche, `viserPlane` | pose propre 1,7 s, gain 1 145 m ; jumeau `viser` en pose | pose | pose 1,67 s | choc | mort contre une tour à 0,75 s |
| 3970622, 52,3 s | raccourci à gauche, `viserPlane` | portail 3,07 s ; jumeau en pose, gain 14 m | portail | pose, gain 11 m | choc | mort contre une tour à 0,25 s |
| 3970585, 59 s | dessous | `versRoute` en pose | choc (tour) | air | | mort à 0,75 s |
| 3970659, 29,2 s | dessous | `versRoute` en pose | choc (tour) | choc (tour) | | mort à 0,45 s |
| 3970474, 136,1 s | dessous | `versRoute` en pose | choc (tour) | choc (tour) | | mort à 5,05 s |

- Pour les deux raccourcis, la promesse tenait aux trois vues : **le radar se trompait**.
- Pour les trois sorties du dessous, la vue d'avant et souvent la dernière vue au sol disaient choc. **Le pilote s'y engage sur une seule vue**, sans la règle des deux vues (`modele.js`, l. 343 à 354), et ne renonce jamais (`tetu`).

###### Le gène `raccCartes_ville`
- c0025 le porte à **1** (né à 1, `genome.js` l. 43). La greffe 2e9b5cc4c924 le passe à 0 et ne change rien d'autre (`population.json`, champ `mutes`).
- À 0, `permis` devient faux en ville (`modele.js`, l. 323) et aucun raccourci ne s'engage.
- Les sorties du dessous restent permises (la variable `sortir`, avec `dessousDecor` = 1). Les 3 morts du dessous ne sont donc **pas** touchées. Les 17 raccourcis tombent, dont 2 mortels et 15 posés.
- **L'effet sur la ressemblance va contre** : en ville, les joueurs font 2,9 raccourcis par minute, c0025 2,08 (`raccourcis-par-map.json`). C'est la map où le bot est le plus proche des joueurs.

###### Son sort sur le Ryzen (`origin/evolution-ryzen` f8c071fa0, `etat/generations.jsonl`, génération 17)

| pilote | courses | palier | E | F |
|---|---|---|---|---|
| greffe 2e9b5cc4c924 (rang 2 sur 20) | 12 | 7,60 | 0,75 | 4,60 ± 0,90 |
| témoin c0025 (rang 16) | 24 | 6,77 | 0,78 | 3,65 ± 0,64 |

- L'écart vaut +0,95, pour une erreur d'environ 1,1 : ce n'est pas tranché.
- La comparaison n'est pas faite sur les mêmes graines (pas de fichier par course sur la branche) : on ne peut pas la rendre appariée.
- Le pilote est vivant, mais n'est ni validé ni sacré. La génération 18 est en cours : **la suite n'est pas encore écrite**.
- Le génome du Ryzen est en v:3.

##### Ce que cela dit pour un gène au sol avant le bord
- La ligne n'est pas le levier visible : avant le bord, joueurs et c0025 sont à la même place, à environ 0,2 à 0,45 de la demi-route.
- Les joueurs vont plus vite et partent nitro allumée environ 5 fois plus souvent sur décor, sans mourir plus par minute. Un gène au sol qui ralentit ou coupe la nitro éloignerait le bot des joueurs.
- En ville, le défaut le plus net est la sortie du dessous engagée sur une seule vue qui contredit la précédente : 3 morts sur 5. C'est une règle de deux vues, pas `raccCartes_ville`.
- Avant de viser « ne plus mourir au canyon et à la grotte », Sacha doit trancher : les joueurs y meurent au même rythme par minute.

**Question pour Sacha** : un bot doit-il mourir sur décor comme un joueur (ce que E ne mesure pas), ou moins que lui (ce que F récompense) ?

## 4. concevoir:vitesse

*Rôle : concepteur « vitesse » : propose une règle de pilote chiffrée, à partir des trois lectures. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### Concepteur « vitesse et énergie » : un gène v5, `plafOn` (lever le pied sur décor)

Aucune course jouée, rien de modifié hors de mon dossier, rien de commité. Mes chiffres viennent de `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\avant-le-bord\concepteur-vitesse\plafond.js` (sorties `plafond.txt` et `plafond.json`, § cités) et de `sigma-survie.js` (même dossier). Périmètre recoupé : 180 décollages subis, 24 morts ; sur décor 160, dont 22 morts et 137 posés (§ 2).

**Verdict d'avance : je ne propose pas d'écrire ce gène tout de suite.** Un gène qui existe déjà (`nitroDecor` à 0) peut dire d'abord, sans code neuf ni nouvelle époque, si le levier sauve.

##### Ce que les traces ajoutent

- **Au-dessus de 143 m/s, la caisse ne tient plus la route** (§ 8). Elle décolle 5 à 6 fois par minute de sol, contre 0,8 à 2,4 en dessous, et ce dans les quatre maps. 28 à 31 % de ces décollages tuent, contre 3 à 9 %.
- **Le seuil tient hors échantillon** (§ 4) : choisi sur 7 graines et compté sur la 8e, il reste à 143 (une fois 145) ; 27,9 % de morts au-dessus, 7,2 % en dessous.
- **La nitro pèse assez** (§ 1, § 10). Au palier 6, la vitesse médiane est de 148 m/s nitro tenue et 129 coupée ; au palier 8, 153 et 137. Au-dessus de 130 m/s, la nitro tenue ne fait que garder la vitesse (−0,1 m/s par seconde) ; coupée, la caisse perd 11 m/s par seconde.
- **Le pilote coupe trop tard** (§ 7). À 2 s du décollage, 15 morts sur 17 ont la nitro allumée ; à 0,8 s, encore 9 sur 18.
- **Contre moi : c'est peut-être le palier, pas la nitro** (§ 3). À carte égale, la vitesse sépare (rang 0,72, p = 0,0005) et le palier aussi (0,68, p = 0,005). La vitesse rapportée à celle du palier ne sépare pas (0,61, p = 0,11). La part de vitesse que la nitro commande n'est donc pas prouvée coupable.
- **La jauge ne compte pas** (§ 9) : rang 0,50, p = 0,98. « Arriver jauge gardée » n'est pas une piste.
- **La nitro au décollage n'est pas jugeable** (§ 9) : aucun des 159 décollages ne part nitro demandée.

##### (1) L'idée

Sur les maps à décor, passé une certaine vitesse, le pilote arrête de pousser la nitro et ne la reprend qu'une fois ralenti. Aujourd'hui il la tient jusqu'à ce que le virage la refuse, une seconde avant le bord, quand il n'a plus le temps de ralentir. C'est lever le pied avant de ne plus tenir la route.

##### (2) La règle

Elle se place dans `auSol`, juste après `m.nitro=!lache&&pose&&sur&&…` (`modele.js` l.296) et avant `bordOn` (l.301). Elle lit `vit` (l.221, soit `v.vitesse`, `yeux.js` l.76), `decor` (l.223), `v.carte` et `m.sortie`.

```
if(R.plafOn>0){
  const ici=decor&&(R.plafOn>1||v.carte!=='jade')&&!m.sortie;
  if(!ici)m.plaf=false;
  else{ if(vit>R.plafV)m.plaf=true; else if(vit<R.plafV-R.plafBande)m.plaf=false;
        if(m.plaf&&m.nitro){ <compteur plafOn> m.nitro=false; } } }
```

- **Aucun champ nouveau aux yeux.**
- **Coût** : `modele.js` et `genome.js` changent, donc une nouvelle époque (cache refusé, bras « départ » rejoué, sélection du Ryzen sur une époque neuve). À écrire seulement dans un lot v5, après la vague en cours.
- `m.plaf` n'est lu ni écrit quand le gène est éteint.

##### (3) Les gènes

Trois gènes en fin de `BORNES` (index 129 à 131), génome v:5, même règle d'identifiant que le § 2.3 du contrat : c0025 garde `19e3767cc346` et conduit au bit près.

| gène | type | bornes | naissance | rôle |
|---|---|---|---|---|
| `plafOn` | entier | 0 à 2 | 0 | 0 éteint ; 1 canyon, grotte, ville ; 2 jade aussi. Garde les deux autres |
| `plafV` | réel | 120 à 190 m/s | 145 | le plafond |
| `plafBande` | réel | 2 à 20 m/s | 8 | la reprise de la nitro, sous `plafV − plafBande` |

La jade est à part parce qu'elle prend la moitié des vues rapides (2 410 sur 4 937, `lecteur-traces/sorties/vues-rapides.txt`) pour 1 mort touchée.

##### (4) Le compteur

`plafOn` : une vue où la règle coupe une nitro que le pilote voulait (`m.nitro` passe de vrai à faux). Forme `if(COMPTE){try{tic('plafOn');}catch(e){}}`. Mesure secondaire, jamais un critère.

##### (5) Sur les 180 décollages et les 24 morts

Compté sans la bande de reprise (qui élargit un peu l'action). Fenêtre : le sol continu de 0,6 à 5 s avant le décollage. « Au moins 1 s » veut dire assez longtemps pour perdre une dizaine de m/s.

| plafond | part du sol où elle agit | morts touchées | dont au moins 1 s | posés touchés | dont au moins 1 s |
|---|---|---|---|---|---|
| 143, sans la jade (§ 11) | 9,7 % du sol des 3 maps, 13,6 % de leur nitro | 12 sur 17 | 10 | 20 sur 57 | 13 |
| 145, sans la jade (§ 11) | 8,3 % | 11 sur 17 | 10 | 19 sur 57 | 13 |
| 143, jade comprise (§ 5) | 12,8 % du sol sur décor | 13 sur 18 | 11 | 47 sur 103 | 32 |

- **Hors d'atteinte** (§ 11) : 9 morts sur décor, plus les 2 mortes hors décor. Quatre n'ont pas de sol à 0,6 s (chaînes et longs vols), quatre partent sous le seuil ou nitro déjà coupée, une n'a pas de vue à 1,5 s.
- **Plafond optimiste** (§ 5, seuil 143, jade comprise) : si les décollages touchés prenaient le taux de mort des non touchés de leur carte, 11 morts deviendraient 3. C'est un maximum : le seuil est choisi sur ces données et la cause n'est pas prouvée.
- **Ce qu'elle risque de casser** : des vols qui se posaient. Sous 143 m/s la caisse décolle trois fois moins. Or c0025 vole déjà trop peu (vols par minute z −1,80, temps en l'air z −1,68) et met trop peu de nitro (au sol z −1,38), d'après `node ml/bot/ressemblance.js` sur la grande note.
- **Coût sur F, ordre de grandeur** : 5 points de nitro au sol en moins valent environ +0,03 de E sur cette mesure, autant sur la nitro totale, soit environ −0,2 sur F avant de compter les vols perdus. Calculé sur la référence clavier ; je n'ai pas relu `note.js`.
- **Limite connue** : au palier 9, la caisse roule à 148 m/s nitro coupée (§ 1, 43 vues). La règle n'y peut plus rien. Au mieux, le mur recule du palier 6-7 vers le palier 9.

##### (6) Les interactions

- **`nitroDecor`** : c'est la version brutale du même levier (à 0, plus jamais de nitro sur décor). Avec `nitroDecor` à 0, `plafOn` ne se déclenche jamais.
- **`sortieOn`** (l.312-316) : passe après et rallume la nitro dans la dernière demi-seconde. Je la laisse gagner, mais les deux tirent en sens contraire : à juger ensemble dans un bras.
- **`bordOn`, `libreOn`** : hors décor seulement, aucun recouvrement.
- **`slalomOn`, `suitOn`, la marge, `bandeDecor`** : la ligne n'est pas touchée.
- **Raccourcis** : la règle se tait pendant un raccourci engagé (`!m.sortie`). À la vue de l'engagement, la nitro peut être coupée une fois.
- **`relacheOn`** : lit l'ordre rendu, donc cohérent.

##### (7) Le critère, écrit avant de jouer

Fait utile : dans les 8 courses à canyon tenu, c0025 meurt 8 fois dans le canyon (7 « paroi », 1 « canyon »), entre 62 et 105 s, sans jamais le traverser (en-têtes de `sortie-preparee/sorties/lignes/canyon-tenue-*.json`). Sur maps tirées, chaque course finit par une mort (1,06 par course, aucune à la limite de temps, `sigma-survie.js`) : compter les morts d'une famille n'y montre qu'un changement de cause. Sur canyon imposé, « mort paroi ou canyon » veut dire « n'a pas passé le canyon », et c'est net.

1. **Étape 0, sans code neuf ni nouvelle époque** (après la vague 1). Carte `canyon`, bras `{nitroDecor:0}`, critère `causes`, famille paroi et canyon, sens bas, plan 24/24/192. Garde annoncée : pas plus de 0,75 palier perdu.
   - Si la part de courses mortes au canyon passe de 0,9 à 0,6 : net vers 72 graines.
   - De 0,9 à 0,75 : vers 144 graines.
   - Moins que cela : invisible.
2. **Étape 1, seulement si l'étape 0 aide.** Écrire `plafOn`. Même vague avec les bras `plaf`, `plaf-bas` (`plafV` 135) et `plaf-sortie` (`plafOn` + `sortieOn`), puis la grotte (famille roche).
3. **Étape 2, la confirmation.** Maps tirées, critère F, nombre de graines fixe. 192 graines voient environ 1 palier ; pour un demi-palier il en faut 500 à 800 (règle n ≈ 121 / (f × d²) de `prochaines-idees`). L'écart-type apparié mesuré vaut 88 s pour la survie et 4,0 pour le palier (`sigma-survie.js`).

##### (8) Ce qui me ferait abandonner

- **L'étape 0 ne baisse pas les morts au canyon.** Si retirer toute la nitro ne sauve pas, un plafond ne sauvera pas, et le gène meurt avant d'être écrit. Il ne resterait que le frein.
- **Le compteur est hors plage** : sous 10 % des graines (trop rare), ou plus du quart du sol (c'est devenu « plus de nitro »).
- **Moins de morts mais la garde du palier cassée, ou F « nuit » à la confirmation** : c'est le coût en nitro et en vols.
- **Une trace gardant `virage.marge`, `vitMult` et `volant` montre que les morts ne sont pas au-dessus de la vitesse sûre** : la vitesse ne serait qu'un reflet du palier.
- **La réponse de Sacha** : les joueurs meurent autant par minute sur décor et roulent plus vite. S'il veut un bot qui meurt comme eux, ce gène va à l'envers.

##### Ce que je n'ai pas pu savoir

- Si ralentir évite le décollage ou seulement la mort, et si ralentir sauve tout court : aucune course ne l'a joué.
- Si les morts sont dans un virage : `virage` et `route` ne sont pas dans les traces.
- La part du sol au-dessus de 145 m/s dans une course de 900 s à maps tirées.
- **Le frein** (`manche:+1`, environ −16 m/s par seconde calculés) : c'est le seul levier qui resterait au palier 9. Sa faisabilité dépend de |volant| < 0,35, absent des traces. Je ne le propose pas.


## 5. concevoir:ligne

*Rôle : concepteur « ligne » : propose une règle de pilote chiffrée, à partir des trois lectures. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### Concepteur « ligne et placement » — proposition : la garde au bord (`gardeOn`), et pourquoi je n'y crois qu'à moitié

Aucune course jouée, rien modifié hors de `ml/ecurie/etude/avant-le-bord/ligne-placement/`, rien commité. Scripts (lecture seule des traces de sortie-preparee) : `garde.js` (→ `sorties/garde.txt`, `garde.json`, `garde-borne.json`), `vues-avant.js` (les vues une par une, à l'écran), `survies.js`.

##### Ce que j'ai trouvé avant de concevoir (c'est le résultat principal)

Les traces gardent `O.ligne` : j'en tire le cap que le pilote DEMANDE, `(O.ligne − lat) / (0,9 × vitesse)`, et je le compare au cap réel de la caisse. Périmètre : 159 décollages subis sur décor (22 morts, 137 posés), celui du lecteur des traces.

- **La ligne du pilote ne pousse pas la caisse dehors.** De 0,25 à 1 s avant le décollage, le cap demandé vers le bord de sortie vaut au plus 0,11 rad en médiane chez les morts (0,07 chez les posés). Il dépasse 0,15 rad chez 4 morts sur 18 lisibles et 26 posés sur 109 : même proportion. Le cap réel, lui, monte à 0,23–0,65 rad.
- **La caisse part en 0,5 s.** Le cap vers le bord grimpe d'environ 1 rad/s dans la dernière demi-seconde, souvent alors que le pilote demande le contraire (`vues-avant.js` : canyon 3970474, 3970622, 3970437).
- **Je ne sais pas pourquoi.** Trois mécanismes possibles, indécidables sur ces traces (ni `volant`, ni `lacetRoute`, ni `lacetMax`, ni `virage` n'y sont) : virage à la limite d'adhérence (vitesse, pas mon angle) ; main en retard à l'entrée du virage (elle perçoit 150 ms après, `doigts.js` l.113, `suivi.retard`) ; à-coup du décor.

Conclusion dure : **le placement n'est pas le levier principal**. Ce qui suit est le seul gène que mon angle justifie.

##### (1) L'idée

Aujourd'hui le pilote règle son cap en angle, sans regarder la place qui reste du côté où il va. La garde lui fait calculer, à chaque vue, « à ce cap, dans combien de temps suis-je au bord ? » avec son propre cap, au lieu d'attendre l'annonce des yeux (0,28 s avant, trop tard). Si c'est trop court, il ne demande plus de cap vers ce bord (niveau 1) et contre-braque à fond en coupant la nitro (niveau 2).

##### (2) La règle (aucun champ nouveau aux yeux, aucune nouvelle époque)

Champs lus : `v.lat`, `v.cap`, `v.vitesse` (`yeux.js` l.76), `v.demi`, `v.carte`, `v.dessous`, `v.glisse`, `v.rebond` ; mémoire : `m.sortie`, `m.tPose`. Dans `auSol` (`modele.js`), entre l.273 (« jamais vers le bord ») et l.279 (`const ligne=`) :

```
garde=false
si R.gardeOn>0 et decor et !m.sortie et !v.dessous et !v.glisse et !v.rebond
   et !(R.suitOn>0 et fenêtre de suitOn ouverte, l.258) :
  c = zActif ? capVoulu+capZ : capVoulu
  pour k dans (+1, −1) :
    capSur = cl((v.demi − R.gardeM − v.lat·k) / (R.gardeT·vit), 0, .4)
    si c·k > capSur            : tic('gardeOn') ; c = k·capSur              /* (a) la borne */
    si R.gardeOn>1 et v.cap·k > capSur : tic('gardeOn.contre') ; c = −k·.4 ; garde=true   /* (b) le contre */
  ligne = v.lat + .9·vit·cl(c, −.4, .4)
```
Après l.296 : `si garde : m.nitro=false`, avant les blocs `bordOn` et `sortieOn`. Éteint : rien n'est lu, l.279 inchangée.

##### (3) Les gènes

| gène | type | bornes | naissance |
|---|---|---|---|
| `gardeOn` | choix | 0, 1, 2 | 0 |
| `gardeT` | réel | 0,3 – 1,2 s | 0,5 |
| `gardeM` | réel | 0 – 10 m | 4 |

`gardeT` et `gardeM` ne sont lus que sous `gardeOn>0` (comme `sortieT` sous `sortieOn`, `genome.js` l.202). c0025 inchangé au bit près.

##### (4) Les compteurs

`gardeOn` (la borne rabote), `gardeOn.contre` (le contre part), `gardeOn.decol` (décollage subi moins de 0,6 s après un contre : l'échec de la règle, à lire en face du précédent).

##### (5) Rejoué sur les traces (`garde.js` ; la condition, pas l'effet)

**La borne (a), de 0,25 à 1 s avant le décollage : presque rien.**

| `gardeT` | morts touchés | posés touchés | mètres de traversée rabotés (médiane) | part des vues |
|---|---|---|---|---|
| 0,5 | 3 / 18 | 7 / 102 | 0,5 | 0,7 % |
| 0,9 | 3 / 18 | 13 / 102 | 4,4 / 2,5 | 5,7 % |

**Le contre (b) : il arrive toujours, mais partout et tard.**

| `gardeT` | part des vues au sol | épisodes | sans décollage ensuite | morts où il tient depuis ≥ 0,4 s | posés ≥ 0,4 s | début médian (morts / posés) |
|---|---|---|---|---|---|---|
| 0,5 | 14,7 % | 966 | 795 | 11 / 22 | 83 / 137 | 0,42 / 0,45 s |
| 0,7 | 21,3 % | 1 324 | 1 138 | 17 / 22 | 94 / 137 | 0,45 / 0,50 s |
| 0,9 | 28,4 % | 1 669 | 1 474 | 18 / 22 | 98 / 137 | 0,52 / 0,55 s |

Lecture :
- Le sort de la sortie préparée (condition jamais vraie) est écarté : (b) est vraie avant 21 des 21 morts qui ont du sol.
- Mais elle ne gagne que **0,15 à 0,25 s** sur l'annonce des yeux (0,29 s), et ne sépare pas les morts des posés.
- Elle change la conduite 15 à 28 % du temps : ce n'est pas une règle de secours, c'est un autre style de volant.
- Hors d'atteinte : 4 morts et 34 posés « sans sol » (chaînes, vols longs) ; les 20 décollages hors décor (2 morts).
- **L'effet n'est pas calculable sans course** : dès le premier contre, la suite n'est plus celle de la trace. Et si la main était déjà à fond à cet instant (virage à la limite), le contre n'ajoute rien. On ne le sait pas.

Ce qu'elle risque de casser : les vols qui se posaient (120 posés sur 121 voient la condition) deviennent autre chose, moins de décollages donc (les joueurs décollent plus que le bot en grotte et jade, lecteur joueurs A3) ; l'ondulation et le slalom ; le palier si la nitro est coupée 15 % du temps.

##### (6) Interactions

- `bordOn` : hors décor seulement, disjoint.
- `sortieOn` : placé après, il rallume la nitro quand la route lâche. La garde agit avant l'annonce, `sortieOn` après : compatibles, mais ils tirent en sens contraire sur 0,3 s.
- `slalomOn` : la borne s'applique à la somme `capVoulu + capZ` ; un contre annule le slalom de la vue.
- `suitOn` : exclu pendant sa fenêtre (il laisse finir une glisse, la garde la contrerait).
- Raccourcis : jamais pendant `m.sortie` (ils demandent le bord). Les sorties du dessous (3 morts en ville) ne sont pas touchées.
- `marge`, `bandeDecor` : inchangés ; `gardeM` est une marge de cap, pas de ligne.

##### (7) Le critère, à écrire avant de jouer

- Map imposée **canyon** (8 courses sur 8 y meurent, survie 86 s ± 19, `survies.js`, tmax 180), puis **grotte** dans une seconde vague.
- Un seul bras : `gardeOn` 2, `gardeT` 0,7. Le niveau 1 seul sera « trop rare » : je ne le jouerais pas.
- Critère : **survie**, sens haut. Garde annoncée : pas plus de 0,75 palier perdu, E pas dégradée.
- Graines : un gain de 10 s de survie demande environ 60 graines (écart apparié majoré par 19 × √2 ; ordre de grandeur, non mesuré en apparié ni à tmax 900). Je planifierais 96, regards à 24.
- À lire en plus : `gardeOn.decol` / `gardeOn.contre`.

##### (8) Ce qui me ferait abandonner

1. **Avant tout code** : rejouer les 40 courses de sortie-preparee en gardant `vue.volant`, `lacetRoute`, `lacetMax` et `virage` (champs existants ; seul `course-diag.js` de l'étude change, environ 13 min de calcul d'après `ms` des en-têtes, PC libre). Si le volant est déjà au-delà de 0,9 au début de (b) dans la majorité des morts, la garde est morte : c'est la vitesse.
2. Au banc, `gardeOn.decol` dépasse 80 % de `gardeOn.contre` dans les courses qui meurent.
3. La survie ne bouge pas à 96 graines, ou le palier perd plus de 0,75.

##### Une seconde piste, vraiment différente, non comptable ici

`avanceT` (réel, 0,3 – 1,0 s, naissance 0,4 : neutre) : l'horizon du cap d'avance, écrit en dur à l.230 (`lacetDans(v,.4,vit)`). La main perçoit 150 ms après et réagit en 120 à 320 ms : à 0,4 s d'horizon, la caisse n'a presque pas tourné quand le virage commence. `avanceCap` et `capAvance` règlent déjà la dose, rien ne règle le moment. Je ne peux rien compter sans `lacetRoute` : le ré-enregistrement du point 1 dira si les morts suivent une entrée de virage.

##### Ce que je n'ai pas pu savoir

- Le mécanisme des 0,5 dernières secondes (voir plus haut).
- Si un contre franc 0,2 s plus tôt suffit à garder la route.
- L'écart apparié de survie entre deux pilotes au canyon.

Fichiers : `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\avant-le-bord\ligne-placement\garde.js`, `vues-avant.js`, `survies.js`, `sorties\garde.txt`, `sorties\garde.json`, `sorties\garde-borne.json`.

## 6. concevoir:libre

*Rôle : concepteur « libre » : propose une règle de pilote chiffrée, à partir des trois lectures. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### Concepteur libre : « ne sortir exprès que du côté ouvert » (28/11)

Aucune course jouée, rien modifié hors de `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\avant-le-bord\concepteur-libre\`, rien commité. Cinq scripts en lecture seule y sont, chacun avec sa sortie `.txt` : `cote-borde.js` (le chiffre central, aussi en `.json`), `voulus.js`, `dessous.js`, `dessous-promesse.js`, `qui-sort.js`.

##### Ce que mon angle écarte d'abord

- **Mémoire des endroits qui tuent** : morte. Les mêmes endroits ne tuent pas deux fois (lecteur traces § 3).
- **Choisir le côté d'un décollage subi** : mort. 155 fois sur 160, la caisse part du côté annoncé (lecteur code).
- **Deux vues de suite, ou renoncer, pour la sortie du dessous** : mesuré ici, ne sépare pas. Sous la dalle les rayons clignotent : « deux vues » ne retarde que de 0,1 s deux des quatre morts, et « renoncer » partirait sur 21 sorties sur 34, dont 17 posées (`voulus.txt`).
- **Aucune règle de décision ne touche les 24 morts subies.** Sur les 18 morts qui ont une vue au sol, le pilote ne demande jamais le cap à fond (0 %), alors que le cap réel atteint 0,5 rad à 0,3 s. À la grotte, 5 morts sur 6 suivent le même dessin : la caisse frôle un bord (22 à 27 m de l'autre côté de l'axe, une seconde avant), puis retraverse et sort par l'autre (`qui-sort.txt`). C'est de la dynamique, donc l'affaire des deux autres angles.

##### Ce qui reste : la mort que le pilote choisit, en ville

Les 5 « morts sur 22 raccourcis » de la ville ne sont pas dans les 24 morts subies. Or :

- **5 courses de ville tenue sur 8 finissent sur un vol que le pilote a voulu** (`voulus.txt`).
- La ville est la map où l'on survit le moins : médiane 59,7 s, contre 95 au canyon.
- « Tour » est la première cause du bras départ : 18 morts sur 60 (`prochaines-idees`). Ici : 5 morts « tour » voulues, 2 subies.

###### (1) L'idée, pour Sacha

Avant de quitter la route exprès, le pilote regarde déjà de chaque côté. Si « tout lâcher » et « planer » finissent tous deux contre le décor, une tour borde ce côté : seul un vol parfait y survit, et la main d'un clavier ne vole pas parfaitement. La règle : ne jamais sortir exprès d'un côté bordé, attendre un côté ouvert.

###### (5) Ce que la règle aurait fait (`cote-borde.txt`, 66 sorties voulues distinctes, 6 morts)

Un côté est « bordé » quand ses rayons `rien` et `plane` finissent tous deux en choc à la vue de l'engagement.

| ville, côté choisi | sorties | morts |
|---|---|---|
| bordé (toujours « tour ») | 11 | **5** |
| ouvert | 11 | **0** |

- Fisher : p = 0,018 d'un côté, 0,035 des deux.
- Le découpage est né sur les 3 morts du dessous (3 bordées sur 3, 0 sur 2 ouvertes). Il a tenu sur les raccourcis, que je n'avais pas regardés : 2 morts sur 8 bordés, 0 sur 9 ouverts. Seul, ce second lot ne prouve rien (p = 0,21).
- **La règle aurait agi sur 11 sorties de ville, soit 1,4 par course : les 5 mortelles et 6 posées** (3 `versRoute`, 2 `viser`, 1 `viserPlane`).
- Hors ville, elle aurait touché 9 sorties du dessous bordées (canyon 2, grotte 5, jade 2), toutes posées : un coût pur.
- **Sur les 180 décollages subis et leurs 24 morts : zéro, par construction.** Elle vise 5 des 30 morts de la mesure (24 subies + 6 voulues).

Ce qu'elle casse : 6 raccourcis qui se posaient. Les joueurs en font 2,9 par minute en ville, c0025 2,08 (lecteur joueurs). Elle ajoute aussi du temps sous la dalle (3,3 % du sol en ville aujourd'hui, `dessous.txt`).

Ce qu'on ne sait pas :
- **Ce que la caisse fait à la place.** Un épisode sous la dalle finit toujours par un décollage, jamais au sol (57 sur 57, `dessous.txt`).
- Le verdict clignote. Une des 5 morts (ville 3970474) est bordée à l'engagement puis ouverte aux 7 vues suivantes : la règle la retarderait de 0,4 s, sans forcément l'éviter.
- La fiabilité des rayons `rien` et `plane` de côté n'est pas mesurée. Je m'en sers pour détecter le décor, pas pour prédire le vol.

###### (2) La règle, sur des champs qui existent

Aucun champ nouveau aux yeux. `vue.sorties.gauche` et `.droite` portent déjà `rien`, `plane`, `versRoute` (`yeux.js` l.953 `LISTE_COTE`, l.1004-1005), et le pilote les demande déjà (`regarder:'sorties'`, `modele.js` l.341, 354, 365-366).

```
function borde(X){ const Y=X&&Array.isArray(X.rayons)?X.rayons:null; if(!Y) return false;
  const r=Y.find(q=>q&&q.m==='rien'), p=Y.find(q=>q&&q.m==='plane');
  return !!(r&&p&&r.issue==='choc'&&p.issue==='choc'); }

auSol, apres l.223 (decor connu), si R.ouvertOn>0 && decor && v.sorties :
  if(borde(v.sorties.gauche)) m.tBordeG=v.t;   if(borde(v.sorties.droite)) m.tBordeD=v.t;
ferme(cote) = R.ouvertOn>0 && decor && tBorde(cote)!=null && v.t-tBorde(cote) <= R.ouvertT

raccourci(), l.182, apres le test de X :   if(ferme(nom==='gauche'?1:-1)) continue;
cote9 (sortie du dessous), l.347 :         if(R.ouvertOn>1 && ferme(k==='gauche'?1:-1)) return null;
enVol, au decollage :                      m.tBordeG=m.tBordeD=null;
```

Une sortie déjà engagée (`m.sortie`, l.326-341) ne change pas. Le coût : `modele.js` et `genome.js` changent, donc une nouvelle époque et un génome v:5, comme tout gène A. À grouper avec le lot des deux autres angles.

###### (3) Les gènes

| clé | type | bornes | naissance | garde |
|---|---|---|---|---|
| `ouvertOn` | choix | 0..2 | 0 | garde `ouvertT` |
| `ouvertT` | réel | 0,1..1,5 s | 0,3 | gardé par `ouvertOn` |

- `ouvertOn` : 0 éteint, 1 les raccourcis, 2 les raccourcis et les sorties du dessous. Même type que `dessousDecor` et `loiFidele`.
- Éteint, rien n'est lu ni écrit, et c0025 doit rester `19e3767cc346` au bit près. À prouver comme pour v4.
- Le niveau 1 n'agit qu'en ville chez c0025, puisque ses raccourcis sont interdits ailleurs.
- Le niveau 2 touche aussi les 9 sorties posées hors ville. Si le banc le montre nuisible, la variante est un drapeau par carte, comme `raccCartes_*`.

###### (4) Les compteurs

- `ouvertOn` : un raccourci que le code sans le gène engageait à cette vue est écarté. Refait en locales, comme le compteur `raccJumeau` (l.196-205).
- `ouvertOn.dessous` : la même chose dans `cote9`.

Ce sont des mesures secondaires, jamais un critère.

###### (6) Les interactions

- `raccCartes_ville` = 0 (la greffe en cours, non tranchée) : le niveau 1 devient muet, le niveau 2 agit encore. Elle retire les 17 raccourcis de ville pour 2 morts, et ne touche pas les 3 morts du dessous. La mienne en retire 8 pour ces 2 morts, plus les 3 du dessous.
- `raccJumeau_ville` : passe après, indépendant.
- `dessousDecor` = 0 : niveau 2 muet. `dessousAveugle` = 0 : le dessous passe par `raccourci()`, le filtre s'y applique aussi.
- `bordOn`, `sortieOn`, `slalomOn`, `suitOn`, `marge` : aucun lien direct. `sortieOn` exige `!m.sortie` : une sortie refusée laisse la caisse en conduite ordinaire, où il peut agir.

###### (7) Le critère, à écrire avant de jouer

**D'abord, sans code : rejouer la mesure.** Seize courses de ville tenue sur des graines neuves, avec `course-diag.js`, environ 10 minutes une fois le PC libre. Prédiction écrite avant : la part de morts des sorties bordées vaut au moins trois fois celle des ouvertes. Si elle ne tient pas, on n'écrit pas le gène.

**Puis une vague** :
- `carte: "ville"`, `tmax` 900, deux bras : `ouvert-racc` (1) et `ouvert-tout` (2).
- Critère principal : `causes`, famille `["tour"]`, sens bas.
- Garde annoncée : pas plus de 0,75 palier perdu.
- À lire sans décider : morts air et vide (une mort déplacée n'est pas une mort évitée), raccourcis, dessous, compteurs.

**Les graines.** Le banc n'impose que la première map. Dans la mesure, 3 courses sur 8 meurent dans cette première visite sur une sortie bordée (3970585, 3970622, 3970659). Le plafond vaut donc environ −0,37 mort « tour » par course. Ordre de grandeur, non simulé : visible dès 24 à 50 graines au plafond, 50 à 100 à la moitié, pas avant 192 au quart. En courses à maps tirées l'effet se dilue par trois : il faut la ville imposée.

###### (8) Ce qui me ferait abandonner

1. La mesure rejouée ne retrouve pas l'écart. C'est le risque principal : 5 morts, un seul pilote, 8 graines, découpage trouvé après coup.
2. Le compteur part moins de 0,5 fois par course de ville, ou le bras sort « trop rare ».
3. Les morts « tour » baissent mais air, vide ou le dessous montent d'autant.
4. La part du sol sous la dalle en ville dépasse nettement celle des joueurs (3 %), ou les raccourcis par minute tombent sous 1,5.
5. La greffe `raccCartes_ville` = 0 est sacrée avant : il ne resterait que le niveau 2, soit 3 morts sur 5 sorties.

##### Ce que je n'ai pas pu savoir

- Si un côté ouvert se présente dans la seconde qui suit un refus.
- Si le verdict « bordé » vaut hors ville : 0 mort sur 9 bordées, 1 sur 20 ouvertes.
- La part des morts « tour » du bras départ qui sont voulues : ses lignes ne gardent pas l'intention.

## 7. attaquer:chiffres

*Rôle : relecteur « chiffres » : attaque les trois propositions sous cet angle. Phase : Attaquer. Modèle : claude-opus-5-5.*

#### Relecteur adverse des chiffres : recompte (28/11)

Je n'ai joué aucune course, je n'ai rien modifié hors de mon dossier et je n'ai rien commité. J'ai écrit deux scripts, qui relisent seulement les traces de `sortie-preparee/sorties/lignes`. Ils n'utilisent aucun code des lecteurs. Leurs sorties sont à côté d'eux :
- `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\avant-le-bord\relecteur-chiffres\recompte.js`, sortie `recompte.txt` ;
- `C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\avant-le-bord\relecteur-chiffres\recompte2.js`, sortie `recompte2.txt`.

##### Le périmètre : retrouvé à un décollage près

Ce que je compte (`recompte.txt`) :
- 40 courses, 255 décollages, tous « bord » (aucun trou ni saut), et 9 doublons ;
- **179 subis distincts, dont 24 mortels** ;
- sur les maps à décor : **161 subis, dont 23 morts, 137 posés et 1 coupé par la limite de temps**.

Les lecteurs comptent 180 subis, et 160 sur décor dont 22 morts. L'écart d'un décollage vient de la façon de traiter une vue au sol prise à l'instant même du décollage : je l'exclus, `relecture.js` la garde. Une sortie passe ainsi entre « voulue » et « subie », et une mort change de groupe. Aucune conclusion n'en dépend.

Les morts qui ont une vue au sol lisible sont 18 à 0,6–1 s avant le décollage, et 17 à 1,5–2 s. Ces chiffres sont retrouvés.

##### Le séparateur, face au hasard

J'ai essayé **35 grandeurs** : la vitesse, la nitro, la marge, le cap vers le bord, la jauge, le palier et la ligne, chacune à 5 reculs (0,6 / 0,8 / 1 / 1,5 / 2 s). Pour chacune, j'ai cherché le meilleur seuil (indice J de Youden).

- **Le meilleur observé** : la vitesse à 1,5 s, avec J = 0,435 et un seuil à 142,3 m/s. C'est le même que celui du lecteur des traces (0,44, seuil 143).
- **Le hasard, étiquettes « mort » mélangées 500 fois sur toutes les cartes** : le meilleur J sur 35 grandeurs vaut 0,366 en médiane et 0,482 dans 95 % des tirages. **p = 0,16.**
- **Le hasard, étiquettes mélangées à l'intérieur de chaque carte** : 0,349 en médiane, 0,454 dans 95 % des tirages. **p = 0,07.**
- **Conclusion** : fouillées à l'aveugle, ces données ne prouvent aucun séparateur. Le lecteur des traces le dit honnêtement, et c'est retrouvé.

**Ce qui sauve la vitesse.** L'étude sortie-preparee l'avait nommée avant toute mesure, avec la ligne et la marge, soit environ 15 tests. Sur ces grandeurs nommées d'avance, j'ai calculé le rang moyen des morts parmi les posés de leur carte (0,5 = hasard ; 2 000 permutations dans la carte) :

| grandeur | rang moyen des morts | p | morts lisibles |
|---|---|---|---|
| vitesse à 2 s | 0,79 | 0,0005 | 17 |
| vitesse à 1,5 s | 0,78 | 0,0005 | 17 |
| vitesse à 1 s | 0,76 | < 0,0005 | 18 |
| vitesse à 0,6 s | 0,72 | 0,005 | 18 |

Ces p résistent à une correction de Bonferroni sur 15 tests.

**Ce qui tombe : « ce n'est pas le palier » (lecteur des traces).**
- Sur les 17 mêmes morts, le palier à 1,5 s sépare lui aussi : rang 0,73, p = 0,0035.
- Le 0,58 (p = 0,13) du lecteur est lu à la dernière vue sur 22 morts : ce n'est pas le même ensemble.
- Une fois le palier retiré (vitesse à 1,5 s moins la médiane des posés du même palier), il reste un rang de 0,64, **p = 0,07 : non prouvé.**
- Le concepteur « vitesse » avait vu cette faiblesse (0,61, p = 0,11) : retrouvé.

**Les autres chiffres retrouvés :**
- **Par carte**, au-dessus de 143 m/s à 1,5 s (morts au-dessus / en dessous ; posés au-dessus / en dessous) :
  - canyon : 6/0 ; 4/13
  - grotte : 4/3 ; 4/20
  - ville : 2/1 ; 2/8
  - jade : 1/0 ; 21/22 (le lecteur en compte 20/23)
- **Les vues au sol sur décor au-dessus de 143 m/s** : 4 937 sur 29 156, soit 16,9 %.
- **Le seuil hors échantillon** (choisi sur 7 graines, compté sur la 8e) : il vaut 142,3 sept fois et 145,1 une fois. Part de morts : 27,9 % au-dessus, 7,4 % en dessous (le concepteur annonce 7,2 %).
- **La vitesse sur 1 s au-dessus de 130 m/s** (`recompte2.txt`) : +0,1 m/s nitro tenue (4 821 mesures), −10,7 m/s nitro coupée (765). Retrouvé.
- **Les décollages par minute de sol** (`recompte2.txt`) :
  - au-dessus de 143 m/s : 5,3 / 7,1 / 6,1 / 8,7 par minute (canyon / grotte / ville / jade) ;
  - en dessous : 1,9 / 1,9 / 2,8 / 3,4 ;
  - le concepteur écrit « 0,8 à 2,4 » en dessous : c'est faux pour la jade (3,4) et la ville (2,8) ;
  - part mortelle au-dessus de 143 m/s : 67 / 33 / 40 / 9 %, et non « 28 à 31 % » partout. Le sens tient, les chiffres annoncés non.

##### Proposition « vitesse » (`plafOn`, étape 0 = `nitroDecor` à 0)

**Ce qui tient :**
- la vitesse est le seul signe nommé d'avance qui survit à carte égale ;
- couper la nitro fait réellement perdre environ 11 m/s par seconde ;
- `nitroDecor` à 0 coupe bien toute nitro sur décor (`modele.js` l.289 : seuil × 0 ; c'est une lecture du code, sans exécution).
- **L'étape 0 ne demande ni code neuf ni nouvelle époque.** Le banc sait imposer la carte et compter les morts par cause (`banc/README.md` l.61-66).

**Ce qui tombe ou reste ouvert :**
- les taux de décollage chiffrés, voir plus haut ;
- la cause : vitesse et palier ne sont pas séparés (p = 0,07) ;
- je n'ai pas refait « 11 morts deviendraient 3 » ni « 12 morts touchées sur 17 » : **non vérifiés** ;
- le coût en ressemblance est réel : les joueurs vont plus vite que c0025 (lecteur des joueurs).

**Verdict : à mesurer d'abord.** L'étape 0 telle qu'écrite est le bon test, avec son critère et sa garde annoncés avant de jouer. Ne pas écrire `plafOn` avant.

##### Proposition « ligne » (`gardeOn`)

**Ce qui tient** (`recompte2.txt`, gardeM = 4) : le « contre » est vrai sur 14,4 % des vues au sol avec gardeT = 0,5, et 20,8 % avec gardeT = 0,7 (le concepteur annonce 14,7 et 21,3 %). Tenu au moins 0,4 s avant le décollage :

| gardeT | morts | posés |
|---|---|---|
| 0,5 | 10 / 22 (45 %) | 82 / 136 (60 %) |
| 0,7 | 16 / 22 (73 %) | 93 / 136 (68 %) |

**Ce qui tombe :** rien dans ses chiffres. Mais **la condition ne sépare pas les morts des posés**, comme il le dit lui-même. Elle s'allume aussi souvent avant un décollage posé qu'avant un mortel. Rien ne montre qu'elle cible les morts, et son effet n'est pas calculable sans course.

**Verdict : à ne pas faire en l'état.** Son point 1 vaut mieux que le gène : ré-enregistrer avec `volant`, `lacetRoute` et `virage`, PC libre. Ce même enregistrement trancherait aussi la question vitesse contre palier pour la proposition « vitesse ».

##### Proposition « libre » (`ouvertOn`)

**Ce qui tient** (`recompte.txt`, mes propres règles) : sur les 67 sorties voulues distinctes, dont 6 mortelles, le côté choisi en ville se répartit ainsi :

| ville | sorties | morts |
|---|---|---|
| sorties du dessous, côté bordé | 3 | 3 |
| sorties du dessous, côté ouvert | 2 | 0 |
| raccourcis, côté bordé | 8 | 2 |
| raccourcis, côté ouvert | 9 | 0 |
| **total bordé** | **11** | **5** |
| **total ouvert** | **11** | **0** |

Hors ville, les sorties bordées font 9 vols et 0 mort. Le Fisher unilatéral vaut p = 462 / 26 334 = 0,018 : retrouvé.

**Le hasard :**
- Le découpage est né sur les 3 morts du dessous, et `cote-borde.txt` montre au moins 6 découpages regardés (à l'engagement, à la vue d'avant, par décor touché, par lieu…).
- Avec 5 morts sur 22 et un partage 11 / 11, un découpage au hasard met les 5 morts du même côté avec une probabilité de 0,035.
- Sur 6 découpages, cela donne de l'ordre de 0,2 : ce n'est pas une preuve.
- Seule la moitié non regardée compte comme confirmation : les raccourcis, 2 morts sur 8 contre 0 sur 9, p = 0,21.
- Le concepteur l'écrit lui-même : sa prudence est juste.

**Verdict : à mesurer d'abord.** Il faut sa réplique sur 16 courses de ville neuves, avec la prédiction écrite avant (au moins trois fois plus de morts côté bordé). Pas de gène avant.

##### Ce que je n'ai pas pu savoir

- Le mécanisme des morts : `volant`, `virage` et `vitMult` ne sont pas dans les traces.
- Si ralentir sauve.
- Les chiffres de coût sur F (−0,2) et sur le palier, que je n'ai pas refaits.

Mes permutations utilisent une graine fixe (12345) : 500 tirages pour le meilleur J, 2 000 pour les rangs. À 500 tirages, les p de 0,16 et 0,07 sont à environ ±0,015 près.

## 8. attaquer:code

*Rôle : relecteur « code » : attaque les trois propositions sous cet angle. Phase : Attaquer. Modèle : claude-opus-5-5.*

#### Relecture adverse du code : les trois propositions (28/11)

Je n'ai lancé aucune course, je n'ai rien modifié ni commité, et je n'ai écrit aucun script. Ce que je dis vient de la lecture de `ml/evolution/modele.js` (l.170-470), `ml/bot/doigts.js` (l.26-42 et l.113), `code/moteur/boucle-2-conduite.js` (l.36-62), `ml/bot/yeux.js` (l.70-80, 953, 1004), `ml/evolution/banc/README.md` (l.50-66), et des sorties que les concepteurs ont laissées (`plafond.txt`, `garde.txt`, `cote-borde.txt`).

##### 1. `plafOn` (vitesse) : **mesurer d'abord** (l'étape 0 seulement)

**Ce qui tient :**
- **La condition peut arriver.** `vit` vaut `v.vitesse` (yeux l.76 : `|vA|·SPD·vm`) et existe à chaque vue au sol. La règle se place après `m.nitro=` (l.296), là où `m.nitro` vient d'être calculé.
- D'après `plafond.txt` § 5 et § 11, la règle agit sur 9,7 % du sol des trois maps : ce n'est pas le sort de la sortie préparée, qui ne s'est jamais déclenchée.
- **La main a le temps.** La nitro réagit en 110 à 300 ms (`MAIN_CLAVIER`, doigts l.113), et la fenêtre est de 1,5 à 2 s.
- **Le jeu permet le geste.** Couper la nitro retire la poussée `vA+=30·push` (boucle-2 l.45). `up` reste vrai : on ne lève jamais le pied (`AUTO_GAS`). Mesuré au-dessus de 130 m/s : −11,2 m/s par seconde nitro coupée, −0,1 nitro tenue (`plafond.txt` § 10). Les chiffres du § 4 (le seuil reste 142,7 à 145,4 sans la graine jugée ; 27,9 % de morts au-dessus contre 7,2 % en dessous) et du § 8 (5,1 et 6,4 décollages par minute au-dessus de 143, contre 0,8 à 2,4 en dessous) sont retrouvés.
- **Éteint, la règle est muette** si `m.plaf` n'est écrit que sous `R.plafOn>0`. Elle ne touche ni `auSol` hors nitro, ni `enVol`.

**Ce qui tombe ou reste faible :**
- **La cause n'est pas montrée.** Le concepteur le dit lui-même (§ 3) : à carte égale, la vitesse rapportée au palier ne sépare pas (rang 0,606, p = 0,107). Le palier seul sépare (0,68, p = 0,0045). La part au-dessus de 143 m/s passe de 3,5 % au palier 3 à 47 % au palier 6, puis 90 % au palier 9 (§ 1). La règle frappe donc d'abord les paliers hauts : elle coûte du palier là où F se gagne.
- **Un effet de bord, que l'auteur ne cite pas.** Couper `m.nitro` change aussi l'hystérésis de la vue suivante : le seuil passe à `braqueNitro−.1` et la marge à `margeAllumer` (l.287-290). La reprise est donc plus dure que la bande `plafBande` ne le dit. Ce n'est pas un bug, mais c'est un réglage caché.
- **L'étape 0 a des limites.**
  - « Retirer toute la nitro » (`nitroDecor`:0) ne retire pas toute la nitro : le départ rend `nitro:true` (l.214), et un raccourci « plane » la demande aussi (l.330 et 365). Sur canyon, où les raccourcis sont interdits, cela pèse peu.
  - Le critère `causes` compte « toutes les morts de la partie » (banc README l.65-66), alors que seule la première map est imposée. Un bras plus lent qui passe le canyon peut le revoir plus tard et y mourir : le gain est sous-compté.
  - Un échec à l'étape 0 n'enterre donc la règle que si l'on lit aussi `survie`.
- **Cela éloigne des joueurs.** Ils vont 8 à 30 % plus vite et partent nitro allumée environ 5 fois plus souvent, sans mourir plus par minute (lecteur joueurs, A3). Sous F = palier − 4E, aucune mesure de E ne récompense le fait de moins mourir sur décor.

**Verdict :** ne pas écrire `plafOn`. Jouer d'abord l'étape 0 (`{nitroDecor:0}`, canyon imposé), qui ne demande ni code ni époque. La lire sur `causes` ET sur `survie`, avec la garde du palier.

##### 2. `gardeOn` (ligne) : **à ne pas faire** en l'état

**Ce qui tient :**
- Les champs (`v.cap`, `v.demi`, `v.lat`, `v.glisse`, `v.rebond`, `v.dessous`) existent à chaque vue au sol.
- La condition (b) est vraie avant 21 morts sur 21 (`garde.txt`) : ce n'est pas une règle qui ne part jamais.

**Ce qui tombe :**
- **Le contre ne peut rien demander de plus que ce que la main reçoit déjà.**
  - La main traduit la ligne en `capVise = cl((ligne−lat)/(0,9·vit), −0,4, 0,4)` (doigts l.31), puis `volant = cl((lacetRoute + (capVise − cap)·3)/lacetMax, −1, 1)` (l.32).
  - Aux morts, le cap demandé vaut au plus 0,11 en médiane, alors que le cap réel monte à 0,23 à 0,65 (`garde.txt` § 0). L'écart de cap, multiplié par 3, vaut déjà 0,4 à 1,6 rad/s de lacet demandé vers l'intérieur.
  - Le contre fait passer `capVise` à −0,4. Il n'ajoute rien si le volant est déjà à −1, ce qui est probable dès que `lacetMax` est inférieur à environ 1,2 + `lacetRoute`.
  - `lacetMax` n'est pas dans les traces : on ne sait pas, mais l'hypothèse « la main contre déjà » est la plus probable. C'est exactement le test d'abandon n° 1 du concepteur, et il penche contre lui avant même d'être joué.
- **La borne (a) ne fait presque rien** : elle est vraie sur 0,7 % des vues, et touche 3 morts sur 18 pour 0,5 m rabotés à `gardeT` 0,5 (`garde.txt`).
- **Elle ne sépare pas les morts des posés.**
  - Le contre (b) tient depuis au moins 0,4 s chez 17 morts sur 22, mais aussi chez 94 posés sur 137, à `gardeT` 0,7.
  - Elle change la conduite sur 21 % des vues.
  - 1 138 des 1 324 épisodes (86 %) ne mènent à aucun décollage dans les 1,5 s.
- **Elle casse quelque chose.** Le contre annule `capZ` (le slalom) et coupe la nitro 21 % du temps sur décor : cela coûte du palier et de E, sans aucune preuve de gain.

**Verdict :** ne pas écrire `gardeOn`. Seul son préalable a de la valeur : un ré-enregistrement des traces qui garde `volant`, `lacetRoute`, `lacetMax` et `virage` (`course-diag.js`, une fois le PC libre). Il trancherait aussi le mécanisme pour `plafOn` et pour `avanceT`.

##### 3. `ouvertOn` (libre) : **mesurer d'abord** (rejouer la mesure), avec deux corrections

**Ce qui tient :**
- `vue.sorties.gauche` et `.droite` portent bien les rayons `rien`, `plane` et `versRoute` (`LISTE_COTE`, yeux l.953 et 1004-1005).
- Le champ est présent à l'instant voulu. `cote9` exige un rayon qui sauve sur décor quand `dessousDecor` vaut moins de 2 (l.348) : une sortie du dessous ne s'engage donc jamais sans `v.sorties`. `raccourci()` lit le même `v.sorties` (l.177).
- Les chiffres sont retrouvés (`cote-borde.txt`) :
  - en ville, côté bordé : 11 sorties, 5 morts ; côté ouvert : 11 sorties, 0 mort ;
  - raccourcis seuls : 8 bordés pour 2 morts, 9 ouverts pour 0 mort ;
  - hors ville, sorties du dessous bordées : 9 vols, 0 mort.
- Aucun geste à la main n'est demandé : la règle ne fait que refuser.

**Ce qui tombe :**
- **Les niveaux ne font pas ce qui est écrit.**
  - Quand `cote9` rend `null` des deux côtés, le code continue jusqu'à `raccourci(v, sortir)` (l.358-359), et `permis` est vrai sous la dalle (`sortir`, l.323).
  - Le filtre placé dans `raccourci()` dès `ouvertOn > 0` touche donc aussi les sorties du dessous, sur toutes les maps à décor, dès le niveau 1.
  - « Le niveau 1 n'agit qu'en ville chez c0025 » est faux. Il faut garder `!sortir` sur le filtre du niveau 1.
- **Le filtre écarte aussi les rayons « portail ».** Ils sont testés avant le `continue` de la pose (l.184). Un côté « bordé » pour `rien` et `plane` peut garder un portail par `viser` : l'auteur ne le dit pas.
- **Ce que fait la caisse refusée n'est pas connu.** 57 épisodes sous la dalle sur 57 finissent par un décollage (`dessous.txt`). Une sortie du dessous refusée peut donc devenir un décollage subi du même côté. Le risque d'une mort seulement déplacée est réel.
- **L'échantillon est petit et le découpage a été trouvé après coup.** Il est né sur 3 morts. Sa seule confirmation (les raccourcis) donne p = 0,21.

**Verdict :** rejouer d'abord les 16 courses de ville sur des graines neuves, une fois le PC libre, avec la prédiction écrite avant. Si l'écart tient, écrire le gène en corrigeant le niveau 1 (`!sortir`) et le cas du portail.

##### Ordre conseillé

1. L'étape 0 de `plafOn` : un bras du banc, sans code.
2. Le ré-enregistrement avec `volant` et `lacetMax`. Il décide de `gardeOn` et éclaire la vitesse.
3. Les 16 courses de ville pour `ouvertOn`.

Aucun code v5 ne devrait être écrit avant ces trois étapes.

##### Ce que je n'ai pas pu savoir

- Les valeurs de `lacetMax` aux morts, qui ne sont pas dans les traces : ma conclusion « le volant est déjà saturé » est une déduction, non mesurée.
- Si `nitroDecor` est accepté comme bras par le catalogue du banc sans nouvelle époque : je ne l'ai pas vérifié dans le code du banc.
- Le seuil exact du drift quand on freine en braquant : je n'ai pas relu `conduite.md`.

## 9. attaquer:banc

*Rôle : relecteur « banc » : attaque les trois propositions sous cet angle. Phase : Attaquer. Modèle : claude-opus-5-5.*

#### Relecteur adverse : les trois propositions « avant le bord » (28/11)

Je n'ai joué aucune course, rien modifié, rien écrit ni commité. J'ai revérifié moi-même ces sources : `ml/evolution/modele.js` l.223 et l.280-296, `genome.js` l.33, `ml/evolution/banc/README.md` l.13, 21, 49-67, `ml/bot/ressemblance.js` l.29-33, `concepteur-vitesse/plafond.txt` § 1 et § 3, `concepteur-vitesse/sigma-survie.js`, `concepteur-libre/cote-borde.txt` et `ligne-placement/survies.js`.

##### Deux faits qui pèsent sur les trois

- **E ne compte aucune mort.** Les 15 mesures (`ressemblance.js` l.29-33) portent sur la nitro (`nitro`, `nitroSol`, `nitroDecol`), l'air, les vols, les raccourcis, `dessous`, l'ondulation et la `vitesse` des deux premières minutes. Un bras qui meurt moins ne gagne donc rien en E. Il ne gagne que sur le palier, la survie ou les causes.
- **Le banc compte toutes les morts de la partie** (README l.65-66) et n'impose que la première map. Sur 900 s, chaque course finit par une mort : 1,06 par course, selon `sigma-survie.js`. Le critère `causes` mesure donc un **déplacement de cause** autant qu'une mort évitée. Il faut lire les autres causes en face, ce que seule la proposition « libre » prévoit.

##### 1. Le plus prometteur : vitesse, étape 0 seulement (`nitroDecor`), à mesurer d'abord

**Ce qui tient**
- L'étape 0 passe par un gène qui existe déjà : pas de code neuf, pas de nouvelle époque. C'est exactement « laisser la sélection régler seule », mais forcé au banc.
- La règle d'abandon est logique : si couper toute la nitro ne sauve pas au canyon, un plafond ne sauvera pas.
- Le séparateur vitesse tient à carte égale. Le lecteur des traces donne un rang de 0,70 à 2 s (p = 0,0003). `plafond.txt` § 3 donne un rang de 0,72.

**Ce qui tombe**
- **`nitroDecor` à 0 n'est pas « moins de nitro » : c'est plus jamais de nitro sur décor.** Le seuil vaut `braqueNitro × 0 × kSeuil` = 0, et `sur` exige `max(force, …) < 0`, ce qui est toujours faux (modele.js l.289-291). Le bras teste donc « nitro interdite ». Il ne teste pas « nitro coupée au-dessus de 143 m/s ».
- Si l'étape 0 réussit, cela ne valide **pas** `plafOn`. La démarche n'est sûre que dans le sens de l'abandon. Je jouerais aussi `nitroDecor` 0,5, qui reste dans les bornes (0 à 1,5, `genome.js` l.33) : c'est la dose intermédiaire que la sélection pourrait trouver seule.
- **Le palier n'est pas écarté.** Dans le texte même du concepteur, le palier sépare aussi (rang 0,68, p = 0,0045, `plafond.txt` l.24). La vitesse rapportée au palier ne sépare plus (rang 0,61, p = 0,11, l.23).
- Les deux lecteurs se contredisent sur le palier : le lecteur des traces trouve p = 0,13. **Je n'ai pas tranché d'où vient l'écart.** Tant qu'il n'est pas tranché, « c'est la nitro » reste une hypothèse : la vitesse peut n'être que le reflet de la vitesse du jeu au palier.
- **L'étape 0 est une course de régularité qu'un bras lent gagne en partie.** Moins de nitro donne moins de vitesse, donc moins de sorties : 5 à 6 décollages par minute au-dessus de 143 m/s, contre 0,8 à 2,4 en dessous (§ 8). La garde du palier (0,75) est donc indispensable. **Il manque une garde sur E.** `nitroSol`, `nitroDecol` et `vitesse` sont dans E, et le bot est déjà en dessous des joueurs sur la nitro au sol (z −1,38) et sur les vols (z −1,80).
- **Ce gène éloigne le bot des vrais joueurs.** Les joueurs roulent 8 à 30 % plus vite et partent nitro allumée 5 fois plus souvent, sans mourir plus par minute (lecteur des joueurs, A3).
- « Net vers 72 graines » (passer de 0,9 à 0,6) est un ordre de grandeur binomial, non simulé. Il est plausible avec un critère de comptage. En revanche, un demi-palier demande bien 500 à 800 graines : **la confirmation au critère F n'est pas faisable avec le banc tel qu'il est** (192 graines au plafond, README l.21).

**Verdict** : étape 0 **à mesurer d'abord**, avec deux bras (0 et 0,5), une garde sur E et la lecture des autres causes. **`plafOn` à ne pas écrire** tant que l'étape 0 n'a pas parlé et que le palier n'est pas séparé de la vitesse.

##### 2. Le deuxième : libre, « côté ouvert » (`ouvertOn`), à mesurer d'abord

**Ce qui tient**
- Les chiffres sont retrouvés dans `cote-borde.txt`. En ville, 11 sorties bordées ont fait 5 morts et 11 ouvertes 0 mort. Une condition proche donne 13 bordées pour 5 morts, contre 9 pour 0.
- C'est la seule proposition qui vise des morts que le pilote **choisit**. Elle agit sur une décision et non sur la dynamique.
- Aucun gène existant ne l'exprime : `raccCartes_ville` coupe tout, y compris 15 raccourcis posés, et ne touche pas les 3 morts du dessous.
- Le critère `causes` « tour » sur ville imposée ne gagne pas par construction. Le concepteur prévoit lui-même de lire « air » et « vide » pour repérer une mort déplacée.

**Ce qui tombe**
- **Le découpage est né des 3 morts du dessous.** La seule partie hors échantillon, les raccourcis, ne prouve rien seule : 2 morts sur 8 contre 0 sur 9, p = 0,21.
- **Hors ville, « bordé » ne sépare pas** : 9 bordées et 0 mort, 20 ouvertes et 1 mort. Le niveau 2 y serait un coût pur.
- Les rayons `rien` et `plane` mentent en partie au canyon et à la grotte : la prévision de sol y était fausse 4 fois sur 4 (prochaines-idees l.55). Leur justesse de côté n'est pas mesurée.
- Le gain plafonne à environ 0,37 mort « tour » par course de ville. C'est peu, et on ignore ce que fait la caisse après un refus : un passage sous la dalle finit toujours en décollage, 57 fois sur 57.
- La règle éloigne un peu le bot des joueurs sur les raccourcis : 2,08 par minute chez c0025, 2,9 chez les joueurs.
- **Le bras recouvre la greffe `raccCartes_ville` = 0.** Celle-ci est en cours sur le Ryzen : F 4,60 contre 3,65, non tranché. Il faut l'attendre avant de comparer.

**Verdict** : **à mesurer d'abord**. Rejouer la ville tenue sur 16 graines neuves (`course-diag.js`, environ 10 min), avec la prédiction « au moins 3 fois plus de morts côté bordé » écrite avant. Le gène ne s'écrit que si la mesure tient, et au niveau 1 seulement, ou par carte, jamais au niveau 2 partout.

##### 3. Le moins prometteur : ligne, la garde (`gardeOn`), à ne pas faire

**Ce qui tient**
- Le diagnostic est honnête : la ligne demandée ne pousse pas la caisse dehors (cap demandé de 0,11 rad au plus, contre un cap réel de 0,23 à 0,65 rad). Le placement n'est donc pas le levier.
- Le concepteur le dit lui-même.

**Ce qui tombe**
- **La condition ne sépare pas** : le contre (b) est vrai pour 17 morts sur 22 et pour 94 posés sur 137 (gardeT 0,7), et il change la conduite 21 % du temps.
- **Il ne gagne que 0,15 à 0,25 s sur l'annonce des yeux.** La main perçoit 150 ms après et réagit en 120 à 320 ms (`doigts.js`). Le contre arriverait donc presque en même temps que l'annonce d'aujourd'hui, déjà jugée trop tardive.
- Il touche 120 vols posés sur 121 : il retire des vols au bot, qui en manque déjà (z −1,80). Il éloigne donc le bot des joueurs.
- **Le nombre de graines est faux.** Les « 96 graines pour 10 s » s'appuient sur un écart-type de 19 s, tiré de 8 courses **non appariées et coupées à 180 s** (`survies.js`, tmax 180). Sur 900 s, l'écart-type apparié de la survie vaut 88 s (`sigma-survie.js`). Il faut alors environ (2,8 × 88 / 10)² ≈ **600 graines** pour 10 s, au-delà des 192 du banc. À tmax 180, la survie bute sur la limite : le critère devient « a passé le canyon ». C'est un autre critère, qu'il faut écrire comme tel.
- Il n'y a rien à attendre de mieux de la sélection : `marge`, `capMax` et `capLigne` couvrent déjà le style de volant, que la sélection peut régler.

**Verdict** : **à ne pas faire.** Une seule partie est à garder, et elle sert aux trois propositions : **le ré-enregistrement des 40 courses avec `volant`, `virage` (`vSure`, `marge`), `vitMult` et `lacetRoute`.** Seul `course-diag.js` de l'étude change, pour environ 13 min une fois le PC libre. Il tranche à la fois la garde (le volant est-il déjà à fond ?), le plafond (vitesse au-dessus de `vSure`, ou simple vitesse du palier ?) et le frein (combien de vues ont |volant| < 0,35 ?). Ce serait mon étape n° 0, avant toute vague.

##### Le classement

1. Ré-enregistrer les traces avec le volant et le virage : ce n'est pas une proposition, mais c'est la meilleure dépense.
2. Vitesse, étape 0 : `nitroDecor` à 0 et à 0,5 au banc, canyon imposé, avec une garde sur le palier **et** sur E.
3. Libre : la mesure de la ville rejouée, puis `ouvertOn` au niveau 1 si elle tient.
4. `plafOn` : seulement après l'étape 0 et le diagnostic.
5. **`gardeOn` : je ne le ferais pas.**

##### Ce que je n'ai pas pu savoir

- D'où vient l'écart entre les deux lecteurs sur le poids du palier (p = 0,13 contre p = 0,0045).
- Si le palier du jeu monte avec la distance ou avec le temps. Couper la nitro pourrait donc faire baisser le palier mécaniquement.
- La puissance réelle des 16 courses de ville rejouées pour un rapport de 3.

##### La question qui reste à Sacha

Les trois gènes éloignent le bot des joueurs sur au moins une mesure de E. Les joueurs meurent autant que c0025 par minute sur décor. Faut-il viser « moins de morts » (ce que récompense F) ou « des morts comme les joueurs » (ce que E ne mesure pas) ?

## 10. rediger

*Rôle : rédacteur : écrit le LISEZ-MOI de l'étude à partir de tout ce qui précède. Phase : Ecrire. Modèle : claude-opus-5-5.*

J'ai écrit le fichier : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\avant-le-bord\LISEZ-MOI.md

Il suit le plan demandé : en une minute, la question, les traces, le code, les joueurs et la ville, une fiche par proposition, ce que les relecteurs ont fait tomber, leur classement, ce qui reste à mesurer avec son coût, puis les fichiers. Le § 9 « Ce que l'on en fait » ne porte que la mention « À écrire par la session principale. »

Je n'ai joué aucune course, rien modifié hors du dossier, rien commité. J'ai cherché les noms de machine, les adresses et les noms privés dans le dossier : rien trouvé.

**Les versions des relecteurs que j'ai retenues contre les lecteurs et concepteurs :**
- « Le palier ne compte pas » tombe. Sur le même ensemble de morts, le palier sépare aussi (p = 0,0035), et la vitesse une fois le palier retiré donne p = 0,07.
- Les taux de décollage de `plafOn` ne se contredisent pas, ils sont mesurés autrement. Les chiffres du concepteur (« 0,8 à 2,4 par minute », « 28 à 31 % ») sont justes pour toutes les cartes ensemble, vitesse lue 1,5 s avant (`plafond.txt` § 8). Le relecteur des chiffres compte carte par carte, à la dernière vue au sol. Les deux versions sont écrites.
- Le niveau 1 de `ouvertOn` touche aussi les sorties du dessous (via `raccourci()`, l.358-359), et pas seulement la ville.
- Le chiffre « 96 graines » de `gardeOn` est remplacé par environ 600 graines.
- La règle « deux vues » du lecteur des joueurs tombe : le concepteur libre l'a mesurée.

**Trois sorties ajoutées.** J'ai relancé trois petits scripts en lecture seule pour que leurs chiffres aient un fichier :
- `concepteur-vitesse/sigma-survie.txt`
- `ligne-placement/sorties/survies.txt`
- `ligne-placement/sorties/vues-avant.txt`

**Fichiers gardés.** Je n'ai rien supprimé : chaque fichier sert de source à un chiffre cité. Tous sont dans `ml/ecurie/etude/avant-le-bord/` :
- `LISEZ-MOI.md`
- `lecteur-traces/` : `avant-le-bord.js`, `complements.js`, `vues-rapides.js` ; `sorties/` avec `avant-le-bord.txt`, `avant-le-bord.json`, `complements.txt`, `vues-rapides.txt`
- `lecteur-code/` : `sol-avant-bord.js`, `sol-avant-bord.json`
- `joueurs-ville/` : `par-map.js`, `vitesse-et-km.js`, `raccourcis-par-map.js`, `ville-raccourcis.js`, et un `.json` pour chacun
- `concepteur-vitesse/` : `plafond.js`, `plafond.txt`, `plafond.json`, `sigma-survie.js`, `sigma-survie.txt`
- `ligne-placement/` : `garde.js`, `vues-avant.js`, `survies.js` ; `sorties/` avec `garde.txt`, `garde.json`, `garde-borne.json`, `survies.txt`, `vues-avant.txt`
- `concepteur-libre/` : `cote-borde.js`, `cote-borde.txt`, `cote-borde.json`, `voulus.js`, `voulus.txt`, `voulus.json`, `dessous.js`, `dessous.txt`, `dessous-promesse.js`, `dessous-promesse.txt`, `qui-sort.js`, `qui-sort.txt`
- `relecteur-chiffres/` : `recompte.js`, `recompte.txt`, `recompte2.js`, `recompte2.txt`

**Ce que la session principale doit trancher :**
1. Faut-il écrire un gène v5 maintenant ? Les trois relecteurs disent non : aucun code v5 avant les mesures.
2. Lancer d'abord le ré-enregistrement des 40 courses ? Il garderait le volant, le virage, `vitMult`, `lacetRoute` et `lacetMax`, pour 13 à 25 min de calcul une fois le PC libre. Il faut changer `course-diag.js` et reprouver que la course est identique avec et sans diagnostic. Il dirait si c'est la vitesse ou le palier qui tue, si le volant est déjà à fond, et si le frein est possible.
3. Lancer l'étape 0 de `plafOn` après la vague 1 ? Ce serait `nitroDecor` à 0 et à 0,5 au canyon imposé, 72 à 576 courses. Il faut ajouter un bras dans `ml/evolution/banc/bras.json`, où aucun n'existe pour ce gène ; je n'ai pas vérifié si cet ajout arrête une vague en cours. Les critères proposés : les causes, la survie, une garde sur le palier et une garde sur E.
4. Rejouer 16 courses de ville neuves pour `ouvertOn` (environ 10 min), avec la prédiction écrite avant ? Faut-il aussi attendre le sort de la greffe `raccCartes_ville` sur le Ryzen ?
5. Abandonner `gardeOn` ? Les trois relecteurs le disent, comme le concepteur à moitié.
6. Retenir que la ligne n'est pas le levier et qu'une règle « ligne plus centrale » ou « moins de nitro sur décor » est inutile, puisque `bandeDecor` et `nitroDecor` existent déjà ?
7. Que faire d'une confirmation sur F à maps tirées ? Elle est hors de portée du banc : il faut 500 à 800 graines, le banc en joue 192 au plus.
8. Ralentir éloigne le bot des joueurs : ils vont 8 à 30 % plus vite, partent nitro allumée environ 5 fois plus souvent, et ne meurent pas plus par minute sur décor.
9. La question pour Sacha : un bot doit-il mourir sur décor comme un joueur (ce que E ne mesure pas) ou moins (ce que F récompense) ?
10. Écrire le § 9 « Ce que l'on en fait » du `LISEZ-MOI.md`.
