# LOT B — L'IMMEUBLE QU'ON TRAVERSE, refait (nuit du 2026-11-18)

Sacha : la traversée est « mal amenée, mal faite, mal gérée ». Ce lot reprend son APPROCHE, sa FORME et son INTÉGRATION à la route,
carte `ville` seulement. Worktree `.lots/b` (détaché sur a42e9ec50), **rien de commité**, index.html assemblé (`--depuis-morceaux`).
Deux auteurs : le premier (≈ 40 min, coupé à 03 h 20 par la panne réseau) a écrit tout le code et le banc Node ; le second (reprise) a
relu, compilé, réassemblé (index.html n'était pas à jour), relancé les bancs Node, écarté la colonnade de la dalle, exécuté le banc Chrome.

## 1. L'interrupteur
- `VILLE_HALL` (`code/maps/ville-scenes.js`) ; **`?sans=villehall`** rend l'ancienne traversée, route ET décor, au bit près.
- Périmètre : `genCtrl1` passe `hall: VILLE_HALL && MC==='ville'` à `vsModules` (`code/maps/ville-entree.js`). Crypto City, la vitrée, les
  nuages, l'espace et le nœud gardent l'ancien couloir. Le décor neuf ne se bâtit que sur une ancre `{t:'tunnel', hall:1}`, que seule
  `sHall` pose : sans le drapeau, aucune ancre `hall`, donc `vsReserve` / `vsBatirG` prennent l'ancienne branche, inchangée.
- `VS.longueur(fn, ref)` : la nouvelle longueur du hall (`VS_HALL_LONG` = [12,3 ; 7,3] s) sert au placement des scènes ; le tri des
  scènes d'ouverture (`L9`, ville-entree l. 458) garde l'ANCIENNE longueur (`ref=1`) pour que les autres scènes s'ouvrent comme avant.

## 2. Diagnostic de l'existant (exécuté)
Banc Chrome sous verrou, `?tel=1&villescene=traversee`, référence a42e9ec50 (graines 2 et 3 ; la graine 1 n'avait pas d'ancre tunnel
bâtie à l'écran du banc), vues à 300 / 150 / 50 m avant la bouche, intérieur, sortie, profil, dessus (`scratchpad/lot-b/photos/avant-*`).
Banc Node (`ville-hall.cjs`, 60 graines × paliers 0/10/20, sur la référence) :
- **Mal amenée — confirmé.** La ligne droite avant la bouche (cap à moins de 6° de l'axe) mesure **67 m au palier 0** (104 m au p10,
  190 m au p20), soit 0,3 s : on sort du virage de calage et on est dedans. Photos : à 300 m la route tourne, la tour n'est pas dans
  l'axe ; à 150 m on tourne encore, la bouche est sur le côté.
- **Mal faite — confirmé.** Le hall est un couloir plat (pente médiane 1,4-1,9 %) de 40 m de haut, deux murs à fenêtres et une grille de
  néon au plafond ; vu de dehors, c'est une tour ordinaire avec un trou. La tour au-dessus du hall est posée sur ses murs à 40 m (le
  commentaire du code disait « elle FLOTTE (sans pied) » ; à l'image, ses murs la portent, mais rien ne la distingue du quartier).
  La bouche n'a plus de cadre depuis le 14/11 : vue de 150 m, rien ne dit « on entre ici » sinon la grille verte du plafond.
- **Mal gérée — confirmé.** À la sortie, 35 m de droite à −3 % puis la scène suivante, quelle qu'elle soit : pas de vue, pas de geste.
- Taux de bâti : 100 % des ancres tunnel posées (35/35 p0, 30/30 p10, 30/30 p20 ; 34/34 sur les graines 61-120) — l'abandon n'est PAS
  le problème. `dans` = `frole` = 0. Ouverture : la traversée ouvre la route une graine sur deux (30/60), inchangé par ce lot (voir § 6).

## 3. Ce qui est fait (carte `ville`)
- **L'APPROCHE** (`sHall`) : après le calage, une **ligne de mire** de 2,1 s RÉELLES (croisière × l'élan 1,8 → 1 selon le palier),
  au moins 140 m × LV, presque droite et qui descend de 3,5 % vers la bouche. Mesuré : **318 m au p0 (était 67), 520 m au p10 (104),
  872 m au p20 (190)**.
- **LA FORME** (`vsReserve` + `vsBatirG`, branche `a.hall`) :
  - la tour la plus haute du quartier : sommet 330-570 m au-dessus de la route ; essais de repli si un saut passe au-dessus (`air`)
    ou une route en dessous (`route`) : moins haute, puis pied moins profond, enfin le hall seul sous son toit ; un saut qui passe
    SOUS le pied est accepté (`vsAirSous`, 150 m de marge) ;
  - **un pied** : les deux murs descendent jusqu'au pied (`b`) et montent jusqu'au plafond de l'atrium ; la tour est posée dessus ;
    le socle sous la route suit la pente par 4 tranches ;
  - **la façade d'entrée** : trois lames verticales de chaque côté de la bouche (adossées au mur, genre 1), une enseigne de 16 m
    au-dessus de la bouche (une enseigne de façade : plus étroite que la route, ce n'est PAS un cadre de néon autour de la route) ;
  - **le hall** : deux bouches basses (linteaux à 40 m) et entre elles un **ATRIUM de 96 m de haut** (plus haut que large), ses étages
    vus en coupe (trois galeries par côté, leur nez éclairé, celui du milieu en couleur), une colonnade de pilastres adossés aux murs,
    11,5 m au-delà du bord de la dalle, trois grandes bandes de lumière au plafond de l'atrium, les bandes des plafonds des bouches ;
  - la longueur du hall suit la période des façades (`VS_PER`) : les linteaux ont la façade de la tour.
- **LA ROUTE** : −5 % dans le hall (le socle suit), puis **LA SORTIE** : la route plonge à −14 % en tournant franchement de 32-46°
  (rayon ≥ 2,4 rP, ≥ 1,2 s de croisière). Chute médiane sur 200 m après la bouche : 27-30 m (était 16-29 m, en ligne droite).
- Gardés : `murCote` dans le hall (`CITY.couloirs`), les rails (`CITY.railN`), l'abri de pluie et la caméra sous le plafond
  (`CITY.abris` : trois abris — bouche d'entrée 40 m, atrium 96 m, bouche de sortie 40 m), le dévers nul (`nul:[[iA,iB]]`).

## 4. Preuves chiffrées

### 4.1 Identité (règle dure)
`node outils/banc-routes/empreinte.cjs graines=1-12` dans `.lots/b` :

| | `SEARCH='?sans=villehall'` | sans drapeau |
|---|---|---|
| ville p0 / p10 | **d63b36e2af8b / fb378a8c6756** (= référence) | e8b3bd10c92e / e70f0717b6f3 (la route change, voulu) |
| crypto p0 / p10 | 5447610bd8f2 / eae97981f833 | **5447610bd8f2 / eae97981f833** (inchangé) |
| nuages p0 / p10 | 469d52aff855 / 2e1661d8fe93 | **469d52aff855 / 2e1661d8fe93** |
| espace p0 / p10 | 9c99fae61d38 / ea2d9e750351 | **9c99fae61d38 / ea2d9e750351** |

(La vitrée rend `VIT_SOL is not defined` dans ce banc, avant comme après : limite connue du chargeur Node, pas une régression.)
Décor : avec `?sans=villehall` aucune ancre ne porte `hall`, les branches neuves de `vsReserve` / `vsBatirG` ne s'exécutent pas.

### 4.2 Banc Node des vrais générateurs
`node outils/banc-routes/ville-hall.cjs graines=1-60` (et `graines=61-120`), avant = `SEARCH='?sans=villehall'`. Pour chaque ancre
tunnel : le verdict de `vsReserve`, puis CHAQUE volume et néon bâti par `vsBatirG` (rails exclus) contre TOUS les points de la route :

| | p0 avant → après | p10 | p20 |
|---|---|---|---|
| plans tunnel bâtis | 35/35 → 35/35 (61-120 : 34/34 → 32/32) | 30/30 → 30/30 | 30/30 → 30/30 |
| abandons | aucun → aucun | aucun | aucun |
| `dans` / `frole` / hors-bande (marge 14 m) | 0/0/0 → 0/0/0 | 0/0/0 → 0/0/0 | 0/0/0 → 0/0/0 |
| ligne de mire (médiane) | 67 m → 318 m | 104 → 520 m | 190 → 872 m |
| hauteur libre | 40 → 96 m (atrium) | idem | idem |
| pente dans le hall | 1,9 → 5,4 % | 1,4 → 5,3 % | 1,4 → 5,4 % |

« hors-bande » = un point de route à moins de ROAD_HALF + 14 m d'un volume du plan, dans sa hauteur −40/+60, hors de la bande de la
scène : **0 sur 400 halls bâtis**. Le meilleur-de-N (`ville-essais.cjs`) et la charte (`ville-torsades.cjs`) ont été relancés par
le premier auteur (`scratchpad/lot-b/essais-*.txt`, `torsades-*.txt`) : notes et torsades au bruit près ; décor perdu inchangé (0,50 au p0).

Coûts du décor (même banc, json) : **5 → 38 volumes par hall** (max 48), néons 24 → 25 par hall. Ce sont des instances dans les familles
existantes (`V.corps`/`V.genre`, `V.neon`) : **0 appel de dessin, 0 matière, 0 texture, 0 programme en plus** ; ≈ +400 triangles
par hall (33 boîtes × 12), contre des dizaines de milliers pour la ville. Temps : tirage et décor au bruit du Mac (charge 5-20 ; trois
passages du même banc donnent 86-283 ms pour la même route) — médianes 139 → 115 ms (tirage), 2,3 → 1,8 ms (décor de tout le plan).

### 4.3 Banc Chrome (sous verrou)
`outils/banc-routes/ville-hall-chrome.cjs` (CDP sans Puppeteer, `--mute-audio`, sfx/mus/vox coupés dans `cashcarSave`), sous
`verrou-banc.sh prendre "ville-cyber-b"` (une seule prise, 4 min, 06 h 20-06 h 24, après ≈ 2 h 30 de file d'attente : 18 sessions sur le verrou) :
```
node outils/banc-routes/ville-hall-chrome.cjs --arbres="avant@<référence>@8467,apres@<.lots/b>@8468" --graines=2,3,4 --course=1 --tcourse=60000 --out=<dossier>
```
`?tel=1&villescene=traversee&pistegraine=N`, 844×390 puis 390×844, palier 0 (début de partie) ; course au pilote auto (`dbgAuto(1,0,{nit:0})`)
jusqu'à 250 m après la sortie, puis vues fixes en pause (`dbgAudit('vue')`) à 300 / 150 / 50 m de la bouche, au milieu, à la sortie,
70 m après, de profil, de dessus ; les comptes = les appels `renderBufferDirect` d'UNE image vraie de chaque vue (composer compris).

| graine | course (avant → après) | dbgVilleAudit dans / frole / flotte | dbgVillePortiques barres | erreurs console |
|---|---|---|---|---|
| 2 | traversée, pas de mort → idem (s 1192, sortie 936) | 0/0/**2** → 0/0/**0** | 0 → 0 | 0 → 0 |
| 3 | idem → idem (s 5206, sortie 4956) | 0/0/2 → 0/0/0 | 0 → 0 | 0 → 0 |
| 4 | idem → idem (s 1123, sortie 864) | 0/0/2 → 0/0/0 | 0 → 0 | 0 → 0 |

(Les 2 « flotte » d'avant : les deux enseignes verticales de l'ancienne bouche, qu'aucune façade ne portait. Après : l'enseigne est
adossée au linteau, `enseignes` 1 au lieu de 2, aucune barre de lumière en travers de la route.) Le plan tunnel est bâti (`ok`) aux 3 graines, avant comme après.

Comptes (moyenne des 8 vues × 3 graines) : paysage 106,0 → 106,3 appels, 249 k → 263 k triangles ; portrait 85,1 → 91,0 appels,
222 k → 224 k triangles ; textures 121 → 121, programmes 154 → 154 ; géométries égales aux graines 2 et 3 (546, 548), 567 → 571 à la 4.
⚠ Honnêtement : après le hall la route n'est plus la même (voulu), donc les vues ne regardent pas les mêmes quartiers ; l'écart d'une vue
à l'autre (46 à 187 appels) écrase celui du hall. Par construction le hall n'ajoute ni appel, ni matière, ni texture, ni programme (instances
des familles existantes) ; les +4 géométries de la graine 4 viennent du reste de la route (non attribuées, non creusées).

**Planches** (`passation/ville-cyber/planches/`, JPEG ≤ 250 Ko, ligne du haut AVANT, du bas APRÈS, mêmes graines, mêmes abscisses relatives à la bouche) :
`hall-g{2,3,4}-{pay,por}.jpg` (8 vues) et `hall-g{2,3,4}-pay-{avant,apres}-grand.jpg` (6 vues en grand : 300 m, 150 m, 50 m, milieu, sortie, après).
**Ce que j'y vois** : AVANT, à 300 m et à 150 m on tourne encore (le virage de calage) et la bouche est sur le côté, rien ne l'annonce ;
dedans, deux murs de fenêtres et une grille verte. APRÈS, à 300 m la tour est dans l'axe, plus haute que ses voisines, son enseigne
lisible ; à 150 m la façade, les lames et la bouche éclairée se lisent ; à 50 m on voit le plafond bas de la bouche puis, au-delà, le
volume de l'atrium ; à la sortie, la route plonge et tourne face à la ville (graine 3 : la plongée se voit nettement). C'est mieux amené
et mieux lu. Ce qui reste faible : les murs restent de grands pans de fenêtres (le shader de façade des tours), les galeries de l'atrium
ne se lisent que comme des bandes rouges, le saut de hauteur de l'atrium (96 m) se sent peu dans une vue à hauteur de caisse — c'est un
« grand hall », pas encore une cathédrale. Pour aller plus loin il faudrait de la lumière dans l'atrium (le lot D, finition).

## 5. Ce qui N'EST PAS vérifié
- Le vrai iPhone : rien vu.
- La course au pilote ne roule qu'au palier 0 (le début de partie). Aux paliers 10-20, la sortie (−5 % → −14 % en tournant) fait
  décoller la caisse au bord du hall à haute vitesse (comme la crête et la plongée existantes) : vol plus BAS que la route du hall,
  donc jamais contre le linteau ; mais la caisse part sur la tangente d'un virage de 32-46° à R ≥ 2,4 rP. Non mesuré au simulateur de vol.
- Le saut du joueur (double-tap, 5,6 m de haut, 11 m au plus) à l'entrée : le linteau est à 40 m → aucun contact possible en roulant
  ou en sautant depuis la dalle (calcul, pas un banc). Dans l'atrium, un saut qui dérive hors de la dalle trouve les pilastres à 11,5 m
  du bord (les murs d'avant étaient à 14 m) : mortels en vol, comme toutes les tours.
- Les temps de tirage par tranche (JF.lim) en Chrome : non mesurés ; le décor ajouté est dans la même tranche que les autres scènes
  (une pause possible entre deux scènes, inchangé).

## 6. Décisions prises (pour Sacha)
- La traversée reste l'ouverture une graine sur deux (`graine%2`) : c'était l'approche ratée qui la rendait « mal amenée » ; avec 2,1 s
  de ligne de mire elle s'ouvre bien. Le modulo lui-même est l'affaire du lot U (tirage unique, `ruChoix 'ouv'` : « traversée haute »).
- Pas de cadre de lumière autour de la route : l'entrée se lit par la tour (la plus haute), la façade (lames, enseigne) et la lumière du
  hall vue de loin.
- La colonnade est collée aux murs (le premier auteur la mettait à 8 m du bord : un saut qui dérive l'aurait touchée plus tôt que les murs).

## 7. Fichiers (rien de commité)
- `code/maps/ville-scenes.js` : `VILLE_HALL`, `VS_HALL_LONG`, `VS_HA`, `sHall`, `vsAirSous`, branches `a.hall` / `p.hall` de `vsReserve` / `vsBatirG`, `VS.longueur(fn, ref)`.
- `code/maps/ville-entree.js` : `hall:` passé à `vsModules` ; `VS.longueur(MCJ[0],1)` dans le tri de l'ouverture.
- `VERSION PRINCIPALE/index.html` : réassemblé (`node code/assembler.cjs --depuis-morceaux`, `--verifier` ✔). `sw.js` NON touché (à incrémenter à la fusion).
- Bancs : `outils/banc-routes/ville-hall.cjs` (Node), `ville-hall-chrome.cjs` (Chrome, sous verrou), `ville-hall-planche.py` (planches).
- Gardes vertes : `node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh`, `node code/assembler.cjs --verifier`.
- Sorties brutes : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-b/` (`h2-*`, `h3-*`, `h4-apres.txt`, `c2.log`, `photos2/bilan.json`).

## 8. Après le contrôle, tour 1 (2026-11-18, reprise)
Défauts du contrôle (`CONTROLE-B.md`), chacun reproduit avant d'être corrigé. Bancs : `scratchpad/lot-b/t2/` (`cmp.cjs`, `rail.cjs`, `len.cjs`, `ph.cjs`, `prof.cjs`, `sim3.cjs`, `chrome.sh`), avec les bancs du contrôleur (`controle/ctl.cjs`, `sim.cjs`).

### 8.1 Le raccourci du palier 20 (bloquant) — CORRIGÉ
- **Reproduit** (`ctl.cjs` + `cmp.cjs`, graines du contrôleur) : p20, 31 → 19 routes avec un saut, les 12 perdantes paires.
- **Cause, en deux temps** (mesurée avec `ph.cjs`/`len.cjs`, journal temporaire retiré ensuite) :
  1. à l'entrée (graines paires) le hall plein (calage 55-125° + 2,1 s de ligne de mire + hall + sortie de 1,2 s) rallongeait l'entrée d'≈ 1 000 m au p20 : plus de place pour le saut ;
  2. une fois l'entrée raccourcie, la place libérée faisait passer une SCÈNE d'ouverture (passerelle, plongée) qui mangeait la place du saut : `vPlace` ne réserve le raccourci que s'il tient AVEC le climax (`vTient()`), or au p20 le saut ne vient qu'à la place du climax.
- **Correction** :
  - `sHall(ent)` : à l'entrée, **LA PORTE DE LA VILLE** — plus de calage ni de ligne de mire ajoutée. Un pli large (0-45°, 2,4 rP) pose la droite surélevée du départ sur la trame : elle sert de ligne de mire, la tour est presque en face dès le départ. Après un pli de plus de 10°, on ajoute jusqu'à 0,9 s dans l'axe. Puis le hall, et une courte sortie (35 LV à −6 %), puisque le plongeon qui suit plonge et tourne déjà. `VS.hallE` (null sans le hall) ; `ville-entree` appelle `(VS.hallE||VS.scenes[0])()`.
  - `vPlace` (ville-entree) : derrière la porte (`vHallE`), avant le 1er raccourci, quand celui-ci ne tiendra plus qu'à la place du climax, une scène ne se pose que si elle laisse sa longueur + 2,5 s + le souffle qui mène au climax (2,6 s, mesuré). Sans le hall, `vHallE` reste 0 : identique.
  - Les traversées de milieu de route gardent l'approche complète (calage, 2,1 s de ligne de mire, sortie qui plonge en tournant).
- **Mesuré** :

| raccourcis (routes avec saut / grand saut) | avant | tour 1 | maintenant |
|---|---|---|---|
| graines du contrôleur (65), p0 / p10 / p20 | 65 / 65 / 31 | 65 / 65 / **19** | 65 / 65 / **35** |
| graines 1-300, p0 / p10 / p20 | 300 / 300 / 133 | — | 300 / 300 / **161** |
| 1-300 p20 : paires / impaires | 46 / 87 | — | 74 / 87 |

  Au p20 il reste des perdantes et des gagnantes (65 graines : 5 perdent, 9 gagnent). Le saut du p20 est un tirage à 60 % (`rf()<.6`, inchangé), et changer la route change le tirage. Ce n'est plus systématique : aucune perte de parité, et +28 routes avec un saut sur 300.
  `ville-torsades` (101-160) : boucles « saut » au p20 **33** (avant 30, tour 1 18). RMIN 2,04 / 1,93 / 1,84 rP, recoupements 2,03 / 2,32 / 5,93 (avant 2,05 / 2,7 / 6,67).

### 8.2 La variété — CORRIGÉ (au bruit)
| modules par route p0 / p10 / p20 | avant | tour 1 | maintenant |
|---|---|---|---|
| 65 graines | 5,72 / 4,48 / 3,20 | 5,37 / 4,00 / 2,95 | **5,91 / 4,48 / 3,15** |
| 300 graines | 5,71 / 4,50 / 3,19 | — | **5,79 / 4,49 / 3,18** |

Par scène, sur 300 graines (avant → maintenant) :
- p10 : crête 104 → 87, virage de façade 64 → 61, passerelle 49 → 62.
- p20 : crête 2 → 44, passerelle 82 → 38, plongée 59 → 31, virage de façade 70 → 70.

Le total ne change pas, seule la répartition bouge.

### 8.3 Les rails du hall — CORRIGÉ
Les rails (`CITY.railN`) sont posés par tronçons de 15 m, chacun à la hauteur du bitume sous son milieu (point de route le plus proche dans la tranche de hauteur du hall ; repli : la tranche `yT`). Ce sont des instances `V.neon`, sans appel en plus : ≈ 40 rails par hall au lieu de 2.
Mesure (`rail.cjs`) : écart entre le bas du rail et le bitume, à l'aplomb, pour chaque rail :
- **maintenant** : −0,3 à +0,7 m (médiane −0,06), aux 3 paliers ;
- tour 1 : 7 à 20 m sous le bitume ;
- référence : 2 à 11 m sous le bitume. L'ancien couloir avait le même défaut, la carte d'avant le garde avec `?sans=villehall`.

### 8.4 Génération, sécurité, identité (Node)
- `ctl.cjs`, graines du contrôleur et 1-300, p0/10/20 :
  - `dans` / `frole` = 0 / 0 pour toutes les scènes ;
  - **hall : 0 point de route hors bande** à moins de ROAD_HALF+14 m d'un volume ;
  - tunnels bâtis : 33/33, 31/31, 31/31 (65 graines) et 166/166, 150/150, 150/150 (300 graines) ; aucun abandon ;
  - 0 erreur.
- Identité, 975 routes (65 graines × 3 paliers × ville, crypto, nuages, espace, vitrée) :
  - référence contre lot `?sans=villehall` : 0 écart de route, d'ancres et de décor ;
  - crypto, nuages et espace sans drapeau : 0 écart.
- Empreintes `graines=1-12` :
  - `?sans=villehall` : ville d63b36e2af8b / fb378a8c6756 ;
  - sans drapeau : crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351.

  `empreinte.cjs` ne fixe pas `VILLE_BANK.graine` : l'entrée n'y joue pas.
- Décollages (`sim.cjs`, vol balistique sans volant ni aimant, pire cas grossier), décollages dans le vide hall + sortie, sur 60 routes :

  | palier | avant | tour 1 | maintenant |
  |---|---|---|---|
  | p0 | 0 | 0 | 0 |
  | p10 | 40 | 50 | 52 |
  | p20 | 29 | 0 | 0 |

  Au p10, c'est la bascule de −5 % vers les −18 % du plongeon, 30-40 m après la porte, sur ses grands virages ; l'ancien hall décollait au même endroit, compté « dans le hall ». Dans le jeu, le vol en ville est guidé ; ce n'est pas tranché par ce banc.
- Gardes : `assembler --verifier` ✔, `garde-demarrage` OK, `garde-allege` ✔, `garde-charte` OK.

### 8.5 Le jeu en Chrome (sous verrou, exécuté)
`scratchpad/lot-b/t2/chrome.sh` : c'est `controle/chrome.sh`, le harnais du contrôleur, avec ses graines.
- Le verrou a été pris après ≈ 45 min de file. Le banc a tourné 218 s, puis le verrou a été rendu et les Chrome et serveurs du banc tués.
- Conditions : `?tel=1&villescene=traversee`, palier 0, graines **104** (paire : la porte de la ville), **113**, **131** (impaires : la traversée de milieu de route) ; avant = la référence, après = `.lots/b`.

| graine | course au pilote auto (avant → après) | dbgVilleAudit dans / frole | flotte | erreurs console |
|---|---|---|---|---|
| 104 paysage | pas de mort → **pas de mort** (s 647, bouche à 252-396) | 0/0 → 0/0 | 2 → 20* | 0 → 0 |
| 104 portrait | — → **pas de mort** | 0/0 | 20* | 0 |
| 113 | aucune ancre tunnel à l'écran du banc, avant comme après (la scène imposée ne tient pas sur cette route) | 0/0 → 0/0 | 0 → 0 | 0 → 0 |
| 131 paysage | pas de mort → **pas de mort** (s 5415) | 0/0 → 0/0 | 2 → 18* | 0 → 0 |

\* Les « flotte » d'après sont **tous des rails** : 20 et 18, c'est exactement le nombre de tronçons de 15 m de ces deux halls ; les exemples sont à ±29 m de l'axe, à la hauteur du bitume. Les anciens rails passaient l'audit parce qu'ils étaient noyés dans le socle (§ 8.3). `dbgVilleAudit` excluait déjà `CITY.railN` de `dans` / `frole` (« au bord de la route par construction ») ; j'ai étendu cette exclusion à `flotte` (`code/maps/ville-v3.js`, une condition, l'audit seulement, aucun effet sur le rendu ni sur la génération). Ce n'est pas re-mesuré en Chrome, faute d'une 2e prise du verrou ; par construction il reste 0 flotte hors rails, contre 2 enseignes flottantes dans l'ancienne bouche.
- `toutes.mjs cartes=ville paliers=0,10,20 graines=101-103` sur le lot : 9 routes, **0 ERREUR**, `hors` 0, `douilles` 0, droites max 4,3 s (p20).
- renderer.info, même vue avant → après, graine 104 (même quartier jusqu'à la bouche) :
  - paysage : à 150 m, 113 → 114 appels ; dans le hall, 110 → 111 ;
  - portrait : à 150 m, 86 → 100 appels ; dans le hall, 96 → 91 ;
  - textures 121 = 121, programmes 153 = 153 ;
  - géométries 530 → 554 dans le premier passage, mais **530** dans la course en portrait sur le même arbre : du bruit de passage, pas le hall.

  Le hall pose ses volumes en instances des familles existantes. À la graine 131 la route change après le hall, et les vues ne regardent pas le même quartier.
- **Image** (planches `passation/ville-cyber/planches/hall-t2-g{104,131}-{pay,por,jeu}.jpg`, AVANT en haut, APRÈS en bas, mêmes abscisses relatives à la bouche) :
  - graine 104 (la porte), ce que je vois :
    - à 300 m, la tour est dans l'axe de la droite du départ, plus haute que tout, sa bouche éclairée au bout de la route : c'est une porte de ville ;
    - à 50 m, le plafond bas de la bouche, les lames et, au fond, la lumière de l'atrium ;
    - dedans, deux murs de fenêtres, le plafond en poutres éclairées, les rails dorés au ras de la dalle ;
    - à la sortie, la ville s'ouvre et le plongeon commence.

    AVANT, on arrivait par un virage, et la bouche était une grille verte sur le côté. C'est mieux amené.
  - graine 131 (traversée de milieu de route, approche complète), ce que je vois :
    - à 150 m et à 50 m, la façade, l'enseigne et la bouche se lisent dans l'axe ;
    - à 300 m, en revanche, une bosse de la ligne de mire (la pente de −3,5 % qui suit le calage) cache la bouche : on voit la tour, pas l'entrée ;
    - à la sortie, la route plonge en tournant.

    C'est un défaut à reprendre au lot D, finition : une ligne de mire sans bosse, ou qui monte légèrement.
  - Les palettes avant/après diffèrent (or contre vert, violet) : l'ambiance tirée change avec la route. Ce n'est pas le lot.
  - Ce qui reste faible, honnêtement :
    - l'atrium de 96 m se sent peu à hauteur de caisse ;
    - les murs restent des pans de fenêtres ;
    - la porte d'une graine paire n'a pas la longue ligne de mire de la traversée de milieu de route : c'est la droite du départ, ≈ 1,4 s réelles au p0.
  - Les planches `hall-g2-*` et `hall-g4-*` du tour 0 montrent l'ancienne entrée du lot (calage et ligne de mire) : elles sont **périmées** pour les graines paires.

### 8.6 Ce qui reste NON vérifié
- La course aux paliers 10 et 20 : le jeu n'a pas de crochet pour démarrer à un palier, la course roule au p0. Aux paliers 10-20, la bascule de la porte vers le plongeon décolle (§ 8.4, simulateur sans volant).
- `flotte` = 0 après l'exclusion des rails : par construction (20 = 20 et 18 = 18 tronçons), pas re-mesuré en Chrome.
- Le temps par tranche `JF.lim` en Chrome.
- Le vrai iPhone.
- La vitrée en Node (`VIT_SOL`, limite du chargeur, avant comme après).
- Saut à l'entrée : le linteau est à 40 m au-dessus du bitume (hauteur libre mini 40,2 m), le saut du joueur monte à 5,6 m : aucun contact en roulant ni en sautant depuis la dalle. Calcul inchangé du tour 0, pas un banc.

### 8.7 Fichiers touchés depuis le tour 1 (rien de commité)
- `code/maps/ville-scenes.js` : `sHall(ent)` (la porte : pli, ligne de mire courte, sortie courte), `VS.hallE`, les rails par tronçons (`yU`).
- `code/maps/ville-entree.js` : `(VS.hallE||VS.scenes[0])()`, `vHallE`, la garde `hq9` dans `vPlace`.
- `code/maps/ville-v3.js` : `dbgVilleAudit` n'appelle plus `flotte` pour les rails (`RN9`).
- `VERSION PRINCIPALE/index.html` : réassemblé (`--depuis-morceaux`, `--verifier` ✔). `sw.js` non touché.

## 9. Après le contrôle, tour 2 (2026-11-18, reprise)
Défauts de `CONTROLE-B.md` (tour 2). Bancs et sorties : `scratchpad/lot-b/t3/` (`ctl.cjs`, `ana.cjs`, `ana2.cjs`, `rail2.cjs`, `sim10.cjs` du contrôleur ; `hc3.cjs` = `hc2.cjs` + une fenêtre `--fen=<m avant la bouche>` et une vue à 300 m ; `chrome4.sh`).

### 9.1 La porte coûte plus cher à l'écran (bloquant) — RETIRÉE, l'entrée garde sa route d'avant
- Reproduit par le contrôleur (`hc2.cjs`, logs `controle/t2c/ch3.log`, `ch4.log`) ; cause : le cadrage (la droite du départ dans l'axe de la trame, face à l'avenue).
  Corriger le cadrage (demi-maille, coupe de profondeur sur ALLEGE) demandait plusieurs prises du verrou pour régler à l'aveugle un coût qui ne vient pas du hall : je ne
  peux pas le rendre sûr cette nuit, **la porte est retirée** (`sHall(ent)`, `VS.hallE`, `vHallE` et la garde `hq9` de `vPlace` supprimés).
- **À la place** (`VS.entree`, `code/maps/ville-scenes.js`) : à l'entrée (graines paires) la ROUTE est celle d'avant au bit près — `sTravAvant` est l'ancienne
  `sTraversee`, mêmes tirages — et seule son ancre porte `hall:1` : le **décor du hall** (la tour la plus haute du quartier, le pied, les lames, l'enseigne, l'atrium de 96 m,
  les rails par tronçons, les abris, `murCote`) se pose sur l'ancienne route. Même chemin de caméra qu'avant ⇒ même cadrage ; le hall n'ajoute que des instances des
  familles existantes. Le hall de milieu de route (calage, 2,1 s de ligne de mire, hall à −5 %, sortie qui plonge en tournant) est inchangé.
- Conséquence voulue : la route de la carte `ville` à graine fixée est **identique à la référence** partout où il n'y a pas de hall de milieu de route (toutes les
  routes des paliers 10 et 20 de l'échantillon, voir 9.4) : raccourcis, variété, décollages, torsades = ceux d'avant.

### 9.2 La bouche du hall de milieu de route, peu lisible de loin (mineur) — CORRIGÉE
- La lame la plus proche de la bouche, de chaque côté, porte un trait de lumière vertical (`V.neon`, une instance), de la dalle à 50 m au-dessus du linteau.
  Ce sont deux traits verticaux, jamais un cadre autour de la route.
- Image (`t3/c2`, graine 175, en course, paysage ; planche `planches/hall-t3-g175-pay.jpg`) :
  - à 300 m, la tour et son enseigne rouge sont au bout de la droite ;
  - à 150 m, la façade, l'enseigne et la bouche éclairée se lisent dans l'axe ;
  - à 50 m, l'intérieur éclairé apparaît.

  Ce n'est plus un trou sombre. L'atrium reste « une grande rue couverte » plus qu'une cathédrale : c'est l'affaire de la finition (lumière, lot D).

### 9.3 Les deux points de code (mineur) — CORRIGÉS
- `dbgVilleAudit` (`ville-v3.js`) : l'exclusion des rails de `flotte` ne vaut plus que pour la carte `ville` avec le hall (`RH9 = VILLE_HALL && ville sans crypto ni vitre`).
  Les autres villes sont auditées comme avant.
- `ville-entree.js` : la ligne `if(VRAC&&!vRac…` a retrouvé son indentation. Le diff ne touche plus que 3 lignes :
  - `hall:` passé à `vsModules` ;
  - `VS.longueur(MCJ[0],1)` dans le tri de l'ouverture ;
  - `VS.entree()` à l'entrée.

### 9.4 Les décollages au palier 10 (mineur) — SANS OBJET
La bascule hall → plongeon du palier 10 venait de la porte, qui est retirée.

`sim10.cjs` (graines 161-230, `scratchpad/lot-b/t3/s10b-*.txt`) :
- p10 : 46 décollages dans le vide (hall + sortie), **identiques à la référence, graine par graine**. Les routes du p10 sont celles d'avant.
- p0 : 0 → 0.

### 9.5 Preuves Node de ce tour (graines du contrôleur : 161-230 + 4000000007, 271828182, 1414213562, −123456789, 777777777)
- **Identité** :
  - `ctl.cjs`, 900 routes (ville, crypto, nuages, espace × p0/10/20, graine fixée, donc l'entrée jouée) : référence ↔ lot `?sans=villehall`, **0 écart** de route, d'ancres et de décor ;
  - crypto, nuages et espace sans drapeau : **0 écart** ;
  - 0 erreur.
- Empreintes `graines=1-12` :
  - `?sans=villehall` : ville **d63b36e2af8b / fb378a8c6756** ;
  - sans drapeau : crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 ;
  - ville sans drapeau : e8b3bd10c92e / e70f0717b6f3 (le hall de milieu de route).
- **Route de la ville, lot sans drapeau contre la référence** : p0 68/75 routes identiques au bit près ; les 7 autres (163, 179, 191, 211, 215, 219, 223) ont un hall de milieu de route. p10 et p20 : 75/75 identiques.
- Génération :

| | p0 avant → après | p10 | p20 |
|---|---|---|---|
| tunnels bâtis / abandons | 43/43 → 41/41, aucun | 37/37 → 37/37 | 37/37 → 37/37 |
| toutes scènes bâties | 313/323 → 312/322 | 257/257 → 257/257 | 165/165 → 165/165 |
| dans / frole (toutes scènes) | 0/0 → 0/0 | 0/0 → 0/0 | 0/0 → 0/0 |
| route à < ROAD_HALF+14 m d'un volume du tunnel, hors bande | 912 → **0** | 1085 → **0** | 1117 → **0** |
| routes avec un raccourci | 75 → 75 | 75 → 75 | 36 → 36 (perd 0, gagne 0) |
| modules par route | 5,69 → 5,67 | 4,49 → 4,49 | 3,12 → 3,12 |
| tirage genCtrl, méd | 128 → 97 ms (bruit du Mac) | 137 → 98 | 114 → 105 |

- **Rails** (`rail2.cjs`, graines 161-200 : 60 halls d'entrée, 2 de milieu de route) :
  - la route reste dans l'axe du hall (écart ≤ 0,13 m) ;
  - aucun rail sur la dalle (axe → rail ≥ 28,17 m) ;
  - bas du rail −0,31 à +0,74 m du bitume (entrée : −0,01 à +0,43 m).
- Hauteur libre minimale sous les linteaux : 39,1-39,8 m, pour un saut du joueur de 5,6 m au plus.

### 9.6 Le jeu en Chrome (sous verrou, ?tel=1, palier 0, pilote auto, `hc3.cjs` : crochet sur `renderBufferDirect`, moyenne par image du départ à la sortie du hall + 250 m)
Prises du verrou de la reprise précédente : 10 h 23 (408 s), 10 h 31 (76 s) et 11 h 30 (76 s). Prise de cette reprise : voir 9.6.2. Chaque fois, le verrou a été rendu et les Chrome et serveurs du banc tués.

#### 9.6.1 Comptes de rendu en course — appels par image, moyenne (max)

Graines paires (l'entrée), paysage :

| graine | avant | après | triangles moy, avant → après |
|---|---|---|---|
| 162 (c5) | 121,9 (145) | **121,9 (145)** | 327 k → 327 k |
| 162 (c6, teinte fixée violet) | 121,8 (145) | 121,9 (145) | 326 k → 327 k |
| 170 (c5) | 99,6 (124) | 99,4 (126) | 263 k → 263 k |
| 170 (c6) | 99,5 (124) | 99,6 (124) | 263 k → 263 k |
| 164 (c1) | 113,0 (128) | 113,1 (128) | 303 k → 304 k |

Graines paires, portrait :

| graine | avant | après | triangles moy, avant → après |
|---|---|---|---|
| 162 (c3) | 102,4 (121) | 102,2 (121) | 240 k → 241 k |
| 170 (c3) | 92,8 (110) | 92,9 (111) | 227 k → 228 k |

Hall de milieu de route, graine 175 (fenêtre de 700 m avant la bouche jusqu'à la sortie + 250 m) :
- paysage (c2) : 99,4 (122) → 103,8 (137) appels, triangles 253 k → 262 k ;
- portrait (c3) : 92,8 (106) → 90,9 (105) appels, triangles 225 k → 215 k.

Détail par famille (c6 : chaque matière et objet compté par image) : avant et après sont égaux à ±0,03 appel par ligne. Le hall n'ajoute aucun appel.

⚠ Une mesure s'écarte : c1, la 1re prise, sur le même code, donnait 162 paysage 121,9 → 129,8 et 170 99,6 → 104,4. Deux reprises (c5, c6) donnent l'égalité au dixième, et le détail par famille de c6 aussi. La cause est identifiée en 9.6.2 : ce n'est pas le hall.

- Géométries : 526-571 d'une page à l'autre, avant comme après (bruit de passage). Textures 121 = 121, programmes 154 = 154.
- Courses : **0 mort**, avant comme après, à toutes ces graines et dans les deux formats.
- `dbgVilleAudit` : dans 0 / frole 0 partout ; flotte 2 → 0 (les 2 enseignes flottantes de l'ancienne bouche).
- 0 erreur console.

#### 9.6.2 Cette reprise : trois prises du verrou
Prises : 12 h 33 (245 s), 12 h 51 (120 s), 13 h 07 (121 s), le 19/11. Chaque fois, verrou rendu, Chrome et serveurs tués. Bancs : `t3/chrome7.sh`, `chrome10.sh`, `chrome12.sh`, `hc5.cjs`.

Nouvelles graines paires, appels par image, moyenne (max) :

| graine | format | avant | après | triangles moy, avant → après |
|---|---|---|---|---|
| 176 (c7) | paysage | 122,2 (129) | 128,0 (137) | 338,5 k → 339,7 k |
| 176 (c10) | paysage | 122,3 (129) | **122,3 (129)** | 338,8 k → 339,6 k |
| 176 (c11, après passé en premier) | paysage | 122,3 (129) | 128,1 (138) | 338,8 k → 339,8 k |
| 176 (c12, 6 Chrome neuves) | paysage | 122,2 / 122,4 | 130,2 / 122,2 / 122,2 / 122,3 | 338,5-339,3 k |
| 178 (c7) | paysage | 96,2 (104) | 96,8 (107) | 230,6 k → 231,1 k |
| 162 (c10) | paysage | 121,8 (145) | 121,8 (145) | 326,6 k → 326,6 k |
| 164 (c8) | portrait | 103,3 (117) | 103,2 (117) | 268,1 k → 268,7 k |
| 176 (c8) | portrait | 110,1 (137) | 106,8 (129) | 273,4 k → 274,0 k |

**Le passage qui monte de 6-8 appels, identifié** (`hc5.cjs` : chaque objet dessiné est nommé par sa géométrie, sa matière, sa couleur, ses parents et sa position) :
- c12, passage 1, a +8 appels par image. Ce sont 4 objets à (−655, −203, 1629), à 1,3 km du hall :
  - un cylindre Phong `ffc72a` ;
  - un tore Basic `fff3c0`, de 203 sommets : c'est `d.rimGeo`, `TorusGeometry(1.78,.17,6,28)` ;
  - deux sprites.
- C'est **le jeton du FINAL SPIN** (`code/economie/final-spin.js`, `spinPose`). Il est posé au hasard du jeu : `Math.random() > SPIN.pZone` (0,28 par zone), à un `Math.random()` de la longueur.
- c11 montre le même +1,45 Phong, +1,46 Basic et +2,9 sprites, donc le même jeton.
- Les autres écarts de couleur viennent de la teinte de la ville, tirée au hasard à chaque partie (`sfTire`, `?teinte=`). Ce sont les mêmes objets et le même nombre d'appels.
- Le jeton n'est ni du code du lot ni une conséquence de la route : il apparaît au hasard. Il est tombé dans 4 passages « après » sur 10 et dans 0 « avant » sur 9. C'est un hasard (p ≈ 0,1 si le jeton se pose une partie sur quatre), pas un lien : son tirage ne lit ni la route, ni les couloirs, ni le décor.
- Sans le jeton, l'après est égal à l'avant à ±0,6 appel, à toutes les graines paires mesurées (162, 164, 170, 176, 178), en paysage comme en portrait. Les triangles valent l'avant à +0,4 % : les volumes du hall sont des instances des familles existantes.

**Conclusion sur le bloquant** : la porte retirée, l'ouverture des graines paires coûte ce qu'elle coûtait (même route, même cadrage). Le hall pose ses volumes sans aucun appel de plus. Textures 121 = 121, programmes 153-154 = avant.

**Le hall de milieu de route (graines impaires)** :
- graines 177 et 181 (c9) : **le hall n'est pas posé**. `?villescene=traversee` le demande, mais il ne tient pas à sa place sur ces routes (la scène est 2× plus longue que l'ancienne traversée) ; la route prend une autre scène. Avant, l'ancienne traversée y était posée puis son décor **refusé** (`raison 'route'`), ce qui donnait un couloir sans immeuble. Ce n'est pas une régression : on n'a plus de module refusé.
- 175 (c2) : +4,4 appels en paysage, −1,9 en portrait. La route change après le hall, donc les vues ne regardent pas le même quartier. Au bruit.
- Dans l'échantillon Node (75 graines), le hall de milieu de route ne se joue qu'au p0, sur 7 routes sur 75. Aux p10 et p20, jamais : la route reste celle d'avant.

Courses : **0 mort** sur les 22 passages de cette reprise. dans 0 / frole 0 partout ; flotte 2 → 0. 0 erreur console.

### 9.7 L'image (planches `planches/hall-t3-*.jpg` : AVANT en haut, APRÈS en bas, mêmes graines, en course aux mêmes abscisses relatives à la bouche : −300, −150, −50, +20 m, milieu, sortie +15 m, +120 m)
Je les ai regardées : `g162-pay`, `g162-por`, `g176-pay`, `g176-por`, `g175-pay`.

**L'entrée des graines paires (162, 176).**
- L'approche est celle d'avant : on arrive en virage, et la bouche n'est dans l'axe qu'à 50 m. C'est le prix du retrait de la porte : la demande « bien amenée » n'est servie que par le hall de milieu de route.
- Ce qui a changé :
  - de l'extérieur, la façade a ses lames et son enseigne, sans barre de lumière en travers de la route ;
  - dedans (portrait, +20 m et milieu), on lit l'atrium : un volume haut, des galeries en coupe des deux côtés, un plafond lointain. Avant, c'était un couloir de 40 m sous une grille verte. C'est mieux fait.
- La sortie est celle d'avant (droite, puis la vrille ou le plongeon de l'entrée).

**Le hall de milieu de route (175).**
- À 300 m, la droite mène à la tour, dont l'enseigne rouge est déjà visible.
- À 150 m, la façade, l'enseigne et la bouche éclairée se lisent dans l'axe.
- Dedans, c'est une grande nef de fenêtres. À la sortie, la route plonge et vire.
- C'est le seul hall vraiment « amené ».

**Honnêtement.**
- C'est mieux FAIT partout, et mieux AMENÉ seulement au milieu de la route, soit un hall sur dix environ.
- L'atrium de 96 m se sent peu à hauteur de caisse.
- Les teintes avant/après diffèrent (or, vert, violet). Le tirage est aléatoire à chaque partie, ce n'est pas le lot.

### 9.8 Décision (pour Sacha)
- **La porte de la ville est retirée.** C'était le hall imposé à l'entrée, dans l'axe de la droite du départ. Son cadrage coûtait +13 % d'appels en paysage et +34-37 % en portrait.
- Pour la rendre sûre, il faudrait couper la profondeur vue pendant l'ouverture sur ALLEGE, ou décaler sa ligne de mire d'une demi-maille, puis le prouver en course sur beaucoup de graines. Je ne pouvais pas le faire cette nuit (verrou partagé, dix minutes par prise).
- À l'entrée, l'immeuble est donc le nouveau (pied, façade, atrium) sur l'ancienne route.
- Piste pour plus tard : une porte qui file dans l'axe d'une RUE ÉTROITE de la trame, et non dans celui de l'avenue, à mesurer avec `hc3.cjs` et le jeton du final spin coupé (`?spin=0` est réservé au DEV : neutraliser `SPIN.on` dans le banc).

### 9.9 Ce qui reste NON vérifié
- Le vrai iPhone ; le temps par tranche `JF.lim` en Chrome et sur iPhone.
- La course aux paliers 10 et 20 dans le jeu : pas de crochet. Par construction, les routes des p10 et p20 sont celles d'avant (Node, 150/150 identiques), et seul le décor du hall d'entrée change.
- La vitrée en Node (`VIT_SOL`, avant comme après).
- Le saut contre le linteau : calcul seulement. La hauteur libre minimale est de 39,1 m, pour un saut de 5,6 m.
- Le hall de milieu de route en course : une seule graine où il est posé (175), en paysage et en portrait.

### 9.10 Fichiers (rien de commité)
- `code/maps/ville-scenes.js` :
  - `VS.entree` (l'ancienne traversée, `sTravAvant(h)`, avec l'ancre `hall` quand le hall est actif) ;
  - les traits de lumière des lames.

  `sHall(ent)`, `VS.hallE`, `vHallE` et la garde `hq9` sont retirés.
- `code/maps/ville-entree.js` :
  - `VS.entree()` à l'entrée ;
  - la ligne `VRAC` a retrouvé son indentation ;
  - plus de `vHallE` ni de garde dans `vPlace`.
- `code/maps/ville-v3.js` : `RH9` (l'exclusion des rails de `flotte`, carte `ville` avec le hall seulement).
- `VERSION PRINCIPALE/index.html` : réassemblé, `--verifier` ✔ (347 morceaux). `sw.js` non touché.
- Gardes vertes au 19/11 : `garde-demarrage` OK, `garde-allege` ✔, `garde-charte` OK.
- Planches neuves : `planches/hall-t3-g176-{pay,por}.jpg`.
- Sorties : `scratchpad/lot-b/t3/` :
  - `c1`-`c12*.log` ;
  - `s10b-*.txt` ;
  - `rail.json`, `lot.json`, `ref.json`, `sans.json`.
