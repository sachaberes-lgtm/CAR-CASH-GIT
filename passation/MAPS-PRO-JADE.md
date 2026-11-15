> ## ⚠ CONSIGNE DE SACHA SUR L'OPTIMISATION (2026-11-14, 16 h 50) — PRIORITAIRE pour l'optimiseur, les vérificateurs et la reprise
> Sacha : « il faut que ce soit aussi peu lourd que ce qu'on a actuellement, mais qu'on fasse le maximum possible en rendu sans que ça nuise à la fluidité. Prends le temps. »
> Règle de budget : la map, après corrections ET optimisation, ne doit JAMAIS coûter plus que la référence origin/main v1589 (worktree wt-avant),
> sur ordinateur comme sur téléphone (--tel=1) : triangles, draw calls, ms de tirage/pré-bâti, image figée, mémoire, gels en course — chacun ≤ la référence
> (au bruit de mesure près, mesures alternées avant/après). Tout dépassement est un défaut BLOQUANT à corriger.
> À l'intérieur de ce budget : pousser le rendu au maximum (chaque milliseconde ou triangle gagné par l'optimisation se réinvestit en beauté visible :
> lumière, brume, matière, détail proche, raccords), tant que la fluidité ne baisse pas. Tableau « référence / après » obligatoire dans cette fiche.

# MAPS PRO — JADE : la variété de forme des îlots (2026-11-14)

Sacha : « pour jade travaille la variété de forme d'îlot ». Branche `pro/jade-2026-11-14` (partie d'origin/main v1589). Ce fichier est tenu par chaque agent
de la chaîne : l'agent suivant ne connaît que lui. **État (2026-11-14, soir) : CORRECTION FAITE et commitée sur la branche**, OPTIMISATION FAITE (§ 12, tableau référence / après) — voir le § 8 (ce qui est fait, mesures avant/après, ce qui reste). Le diagnostic
(§ 1-7) est conservé tel quel : ses chiffres sont l'« avant ».

## 1. Ce dont Sacha se plaint, reproduit et chiffré

Toutes les montagnes de Jade sortent d'UN moule : `voxPilierG(R,H,kind,graine)` (code/maps/jade-1.js, l. 478) — un empilement de couches rondes autour d'un axe
vertical, un sommet PLAT, un dessous qui s'effile en pointe. Les « sortes » ne changent qu'un coefficient de rayon de ±15 à 45 % le long de la hauteur
(l. 497-500) : 0 colonne, 1 aiguille (qui garde 70 % de son rayon en haut : ce n'est pas une pointe), 2 gradins, 3 tête large, 4 île, 5 massif.

- **Le catalogue** (`passation/jade-formes-avant/catalogue-19-gabarits.png`, les 19 gabarits en silhouette, à l'échelle) : 10 « carottes » (JADE_TPL, élancement
  hauteur/diamètre 2,8 à 6,5), 4 îles = le MÊME cône à 4 tailles (JADE_ILE, 0,6-0,7), 2 massifs, 3 rochers. Profils normalisés : **3 silhouettes distinctes pour
  19 gabarits** (`formes.cjs --profil=0.2` ; 7 au seuil strict 0,12, où les deux plus grosses tours ne sortent du lot que par leur élancement).
- **Aucune arche, aucun trou, aucun corps double, aucun surplomb, aucune pointe, aucun plateau large** : le moule ne sait faire qu'un fût.
- **Photos en roulant** (course au pilote, HUD compris) : `scratchpad/jade-diag/avant/course/` (ordi soir g2, nuit g3) et `course-tel/` (pluie g6, matin g1) ;
  cadres fixes sans HUD : `scratchpad/jade-diag/avant/graph/jade-{midi,soir}[-tel]-decor{A,B}.png` (une copie : `passation/jade-formes-avant/soir-g7-decorB.png` —
  quatre îles identiques en rang, des colonnes partout). Sur toutes : une forêt de colonnes verticales, les « pics renversés » sont la même carotte à l'envers.

Mesures (`node outils/banc-jade/formes.cjs`, 8 graines ordi midi / 4 graines `--tel=1` ; déterministes ; détail par graine dans `passation/jade-formes-avant/*.json`) :

| mesure (montagnes à moins de 120 m du bord de la route) | ordi | tél. | cible proposée |
|---|---|---|---|
| silhouettes distinctes du catalogue (profil, seuil 0,2 / 0,12) | 3 / 7 | 4 / 8 | ≥ 12 |
| classes de silhouette effectives vues de près (tour, île, massif) | 1,68 sur 3 | 1,88 | ≥ 5 |
| part des « tours » (sortes 0-3) | 81 % | 72 % | ≤ 45 % |
| plus proche voisine du MÊME gabarit (« jumelles ») | 19 % | 19 % | ≤ 3 % |
| …dont même quart de tour et même sens (« clones »), par route | 4,75 | 3 | 0 |
| file au bord (< 60 m), deux consécutives du même gabarit | 16 % | 15 % | ≤ 3 % |
| plus longue série de tours d'affilée au bord (moy. / pire) | 21 / 39 | 17 / 29 | ≤ 4 |
| tranches de 300 m où l'on ne voit qu'UNE classe | 55 % | 67 % | ≤ 10 % |
| hauteurs différentes réellement posées | 14 | 13 | ≥ 25 |

## 2. Les causes dans le code

1. **Un seul moule** : voir plus haut. `T9.ly` (les couches : y0, y1, centre, rayon) est relu par `voxPilierFin` (jade-1.js l. 553, les cubes de 58 cm à moins de
   130 m, ordi seulement) qui suppose UN contour étoilé par couche : toute forme à plusieurs corps (arche, jumeaux, grappe) demande d'étendre les DEUX.
2. **Le rayon choisit tout** : `jadeTplDe(r)` (jade-2.js l. 161) et `jadeIleDe(r)` (jade-alleluia.js l. 50) prennent le gabarit de rayon le plus proche. 10 rayons
   → 10 montagnes, chacune avec SA hauteur et SA sorte ; aucune mise à l'échelle (`jadeMatPilier`, jade-2.js l. 275 : VX fixe), 4 quarts de tour (`(jr()*4)|0`).
   Près de la route les rayons demandés sont 10-30 m (`un()`, RANGS[0], rase-route) : toujours les gabarits 0 à 5. Au loin l'île 16 (90 m) fait 1 377 des 8 479
   poses de 8 routes.
3. **Aucune mémoire des voisines** : `tente()` et `un()` (jade-3.js l. 65 et 83) refusent un chevauchement (`pgVois`) mais ne regardent jamais le gabarit d'à côté.
4. **Les îles et massifs sont rares près de la route** : `forme` n'est tiré que hors du premier rang (`R9!==RANGS[0]`, 25 %, jade-3.js l. 121) ; les massifs
   seulement au loin (12 %) : le massif 18 (241 m de large) pèse 7,7 Mo de géométrie et 2,56 Mo de grille pour 41 poses en 8 routes, jamais près.
5. **Les rochers** : 3 gabarits, de petits fûts de 19-35 m (`v%3`).

## 3. Autres constats (hors variété)

- **`dbgJadeAudit().panneaux` ment dans les demi-tonneaux** (faux positifs : 18, 3, 43, 53, 11 « lianes dans le couloir » sur les graines 2, 3, 4, 6, 8, tous là
  où la normale de la dalle vaut 0,2 à 0,7). Sa fonction `coupe()` (jade-vol.js ~l. 480) compare des hauteurs VERTICALES (`p.y+.3 … p.y+7`). Refait dans le repère
  de la dalle (B, Nn) par `dbgJadePan()` du serveur-sonde : **0 panneau dans le couloir sur 8 graines** (13 960 à 38 857 panneaux testés par route). À corriger
  dans le crochet, sinon l'agent suivant ne peut pas s'y fier.
- `JADE.n.rochers` (jade-3.js l. 251), l'étiquette de `dbgJadeAudit` (jade-vol.js l. 471) et `dbgJadeVue('pres')` comptent îles et massifs comme des rochers
  (`q[5]>=JADE_NTPL`) depuis la descente Alléluia : compteur faux (graine 1 : 474 « rochers » annoncés, dont 306 îles et massifs et 168 vrais rochers).
- `outils/banc-routes/juge-node.cjs` est figé sur `B.piste('espace',…)` : il ne juge PAS Jade quoi qu'on lui passe. Une copie réglée sur jade donne « env 0 % »
  (elle ne voit pas l'envers) : inutilisable pour Jade. Le juge officiel (wt-juge/outils/banc-juge/juge.cjs --cartes=jade) n'a PAS été relancé ici — la route est
  celle d'origin/main à l'octet (voir § 5).
- Une cascade coupe le couloir sur 3 graines sur 8 (g2 s 3358 dans l'envers, g3 s 450 — la scène « sous la cascade », voulue —, g5 s 2618) : nappe sans collision,
  non jugé à l'œil.
- Sains : couloir 0 heurt, frôle 0, règle d'or 0/9 366 essais, 0 flottant, cœurs pleins 100 %, 0 erreur console, 0 `__jadeErr`, 0 uniforme manquant, empreinte
  identique sur deux passes (déterminisme), 8/8 ordi et 4/4 tél. ; les 4 courses au pilote (48 s) vivantes.
- NON VÉRIFIÉ : le popping du passage aux cubes fins (130 m) et des bandes de distance ; la lumière nuit/orage au-delà des deux photos regardées ; les paliers
  moteur autres que 0 en navigateur (la route aux paliers 0/10/20 n'est vérifiée qu'en Node).

## 4. L'état « avant » du coût (à ne pas dépasser)

| | ordi (VX 1,75 m) | tél. `--tel=1` (VX 3,5 m) |
|---|---|---|
| gabarits / familles d'instances / instances | 19 / 73-77 / 17 000-43 000 | 19 / 60-63 / 5 800-17 000 |
| grilles de cubes gardées (collisions) | 12,3 Mo | 1,8 Mo |
| géométries des gabarits (4 niveaux, 32 o/sommet) | 53 Mo | 10,5 Mo |
| triangles du catalogue par niveau | 525 428 / 171 166 / 49 798 / 7 480 | 112 356 / 34 396 / 9 838 / 1 438 |
| cubes fins (tous bâtis) | ~1,15 M triangles | aucun |
| taille des gabarits (JADE.geos.ms, bruité) | 1,3-2,5 s | 0,5-0,9 s |
| génération de la route (JADE.genMs) | 90-150 ms (une pointe à 936) | 120-310 ms |
| jadeBatit (JADE.n.ms) | 1,5-3,0 s | 0,6-1,05 s |
| appels de dessin de Jade / de l'image | 56-64 / 188-231 | 23-36 / 105-142 |
| triangles de l'image (départ) | 1,7-6,5 M | 0,26-0,48 M |
| image figée (banc-graphismes, g7, médiane) | midi 11,3 ms · soir 13,7 ms (247-249 appels, 2,6 M tri) | midi 6,5 ms · soir 6,7 ms (129-138 appels, 0,47 M tri) |
| tas JS | 400-520 Mo | 130-270 Mo |

Les 4 plus grosses tours (gabarits 6 à 9) font 34 des 53 Mo, les 2 massifs 12 Mo. Un gabarit moyen (rayon ≤ 30 m, hauteur ≤ 220 m) coûte ≤ 0,35 Mo de grille,
≤ 1,2 Mo de géométrie et ~10-40 ms de taille. Chaque gabarit EN SERVICE ajoute jusqu'à 8 appels de dessin (2 niveaux × 3 passes de verre + 2 opaques).

## 5. Les garde-fous (références enregistrées)

- **La route** : `node outils/banc-jade/empreinte-route.cjs <racine>` → p0 `66a138ad988e519e` (2 809 points), p10 `dd8d6772b9331a3a` (3 642), p20
  `5480b388feac08d1` (4 391), graines 1-8 — identique sur wt-jade et wt-avant. Doit rester identique, formes allumées ou éteintes.
- **Le décor d'avant** (`dbgJadeAudit().emp`, midi) : ordi g1-8 `65fbcec4 30bc294e ed420caf 7d576e5e 2c6c08e2 c36ed374 aeea2bbc f80da275` ; tél. g1-4
  `873815d9 b2a3e226 36b9ce dc93d4bd`. Avec l'interrupteur (`?sans=jadeformes`) ces empreintes doivent revenir à l'identique.
- **Les autres maps** : `voxPilierG`, `jadeTplDe`, `jadeIleDe`, `JADE_TPL/ILE` ne servent qu'aux fichiers `maps/jade-*.js`. `voxMeshG`, `voxDemiG`, `jadeFini`
  servent aussi à la grotte et à la banquise : NE PAS y toucher. Preuve à refaire : `node outils/banc-routes/empreinte.cjs`.

## 6. Le plan de correction (ordonné)

0. **Les crochets dans le jeu** (jade-secoue.js) : `dbgJadePil()` et `dbgJadePan()` (le texte est dans `outils/banc-jade/serveur-sonde.cjs`, SONDE et SONDE_PAN ;
   le serveur n'injecte plus rien dès que le jeu les porte) ; `coupe()` de dbgJadeAudit dans le repère de la dalle ; `rochers` = gabarits JADE_NTPL à JADE_NTPL+2 ;
   le témoin « cœur plein » lu sur une case pleine connue du gabarit (`T9.coeur`) et non au centre (une arche a le centre vide). Dans la fiche de chaque gabarit :
   `fam` (famille) et `classe` (silhouette) — `formes.cjs` les lit déjà en priorité.
1. **L'interrupteur** `JADE_FORMES` (`?sans=jadeformes`, jade-1.js près de JADE_PROX). Éteint : mêmes tables, mêmes tirages de `jr()`, mêmes empreintes (§ 5).
   Le choix des formes tire sur SON générateur (`mulberry32(seed^…)`), jamais sur `jr()`.
2. **Les familles à un seul fût** (sortes 6 et plus dans `voxPilierG` : un profil `s(v)`, une dérive du centre, une part de dessous — `ly` reste lisible par
   voxPilierFin tel quel) : FLÈCHE (vraie pointe, élancement ≥ 8), MÉSA / PLATEAU (élancement 0,35-0,6, parois droites, dessous court ; avec cascades forcées =
   le plateau à cascades), CHAMPIGNON (pied à 35-45 % du rayon sur 60 % de la hauteur, chapeau large), SABLIER, CROC penché (le centre dérive de 0,6-0,9 R vers un
   azimut — aujourd'hui bridé à ±0,25 R, l. 503), TOUPIE (large en haut, longue pointe : le pic renversé natif), PAGODE (3-4 plateaux en encorbellement). La grille
   se dimensionne sur le rayon MAXIMAL du profil et la dérive (`M`, l. 479). Les sortes 0 à 5 restent identiques au bit près.
3. **Les familles à plusieurs corps** (`parts` : plusieurs empilements dans UNE grille, chacun son décalage et sa tranche de hauteur) : PITONS JUMEAUX RELIÉS
   (deux fûts inégaux, un pont de roche à 55-70 %), GRAPPE (3-5 fûts fins soudés par le pied), ARCHE (deux jambes, un linteau, ouverture ≥ 40 % de la largeur),
   ROCHE PERCÉE (arche fermée en bas : un œil). La grille, les collisions (`jadePilierDans`), les arbres (`tops`, `cor`) suivent sans rien changer. À étendre :
   `voxPilierFin` — une sous-couche = l'UNION des contours des corps présents à cette hauteur (`finUnion` à écrire à côté de finDiff/finInter ; le chemin à un
   corps reste tel quel) ; `des` (lianes) sous les linteaux. Repli honnête si le temps manque : `T9.finX=1` sur ces gabarits (cubes de 1,75 m de près — visible).
4. **Les îles et les rochers** : les 4 îles deviennent 4 formes (table mince, bol, cône long, île à deux étages) ; 2-3 rochers de plus (dalle, éclat, boule).
5. **Le choix** : `jadeFormeChoix(r, contexte, voisines)` à la place de jadeTplDe/jadeIleDe dans `tente`, `un`, les îles du ciel, `jadeDeco3Pose` : candidats dans
   une fenêtre de rayon (±40 %) et selon le contexte (bord, rang proche, lointain, au-dessus, renversable), jamais le gabarit d'une voisine à moins de 250 m (ni,
   à défaut, sa pose), jamais trois fois la même classe d'affilée au bord, tours ≤ 45 %. Les poses gardent leurs gardes (`regle`, `un`, `libre`) : elles lisent
   `T9.rmax` (le cylindre englobant) — un chapeau ou un linteau ne peut donc pas surplomber la route.
6. **Le budget** : une PALETTE par vallée (≤ 18 gabarits tirés du catalogue par la graine : les appels de dessin restent ceux d'aujourd'hui, et deux vallées ne se
   ressemblent plus) ; gabarits nouveaux petits ou moyens ; le massif 18 remplacé par un massif de ~70 m (−4 à −5 Mo) ; sur téléphone (`JADE_SOBRE`) la même
   palette. Mesurer § 4 avant/après, en alternant.
7. **Les preuves** : § 5 ; `formes.cjs` aux cibles du § 1 ; dbgJadeAudit (couloir, frôle, flottants) + dbgJadeRegle + dbgJadePan à 0 sur 8 graines ordi et tél. ;
   4 courses au pilote avec photos REGARDÉES (midi, soir, nuit, pluie ; ordi et tél.) ; le catalogue en planche ; banc-graphismes avant/après.

## 7. Les bancs (ports réservés : serveur 8360-8369, CDP 9560-9569, profil Chrome `pro-jade`)

```
node outils/banc-jade/serveur-sonde.cjs 8360 [racine]          # sert le dépôt + injecte dbgJadePil / dbgJadePan (rien n'est écrit)
node outils/banc-maps/banc.cjs gen --carte=jade --meteo=midi --graines=1,2,3,4,5,6,7,8 --port=8360 --cdp=9560 --profil=pro-jade \
     --auditfile=outils/banc-jade/audit-formes.js --out=<dossier> [--tel=1] [--roule=48 --photos=1 --photoms=3500] [--q=sans=jadeformes]
node outils/banc-jade/formes.cjs <dossier>/gen-jade-midi[-tel].json [--planche=catalogue.png] [--json=bilan.json] [--profil=0.2] [--pres=120]
node outils/banc-jade/empreinte-route.cjs <racine> [detail=1]   # Node seul
node outils/banc-graphismes/banc.cjs --out=<dossier> --cartes=jade:midi,jade:soir --port=8360 --cdp=9560 --profil=pro-jade [--tel=1]
```
Pièges : arrêter le serveur par son PID (`netstat -ano | grep 8360`) ; un script de retouche écrit par heredoc perd ses accents et ses antislashs (écrire avec
Write) ; `gabaritsMs` et `constr` varient du simple au double selon la charge de la machine — comparer les compteurs (octets, triangles, appels).

## 8. La correction (2026-11-14 ; deux ingénieurs : le premier a été coupé après ~1 h, le second a contrôlé, réglé la palette et mesuré)

### Ce qui est fait
- **`code/maps/jade-formes.js`** (nouveau, dans `ORDRE.txt` après `jade-alleluia.js`) : le moule à plusieurs corps `voxFormeG` (des corps coulés dans une grille ;
  par tranche de hauteur, l'union des disques présents), **15 familles** `JADE_FDEF` (flèche, mésa/plateau à cascades, champignon, sablier, croc penché, toupie,
  empilement, table, île à deux étages, pitons jumeaux reliés, grappe, arche, roche percée, pont d'îles, rochers dalle/éclat/boule), le **catalogue** `JADE_CAT`
  (39 gabarits ; les 19 premiers gardent leur rang pour les scènes Alléluia), la **palette par vallée** `jadePalette` (19 gabarits en service par vallée, ordi
  et téléphone, tirés par la graine ; un gabarit n'est taillé que s'il sert, le fond du menu taille le reste), le **choix noté** `jadeFormeChoix` (voisine du
  même gabarit < 260 m presque refusée, classe des voisines, classe trop vue, jamais trois fois la même classe au bord, quart de tour d'une jumelle changé ; son
  propre générateur, jamais `jr`), la **mémoire** `jadeGeoCompacte` (sommets en Int16/Int8/Uint8 : 11 octets au lieu de 32), `finUnion/finUnionS` (cubes fins
  des formes à plusieurs corps : `voxPilierFin` lit `ly[6]`), `jadePanLibre` / `jadeCascLibre` (panneaux et cascades hors du couloir, dans le repère de la dalle).
- `jade-3.js` / `jade-alleluia.js` / `jade-eau.js` : `tente`, `un`, les îles du ciel, les rochers, les tours et îles des scènes passent par le choix ; plateaux à
  cascades ; cascades au hasard qui traversaient le couloir retirées (g2, g5) ; arbres/lianes/cristaux gardés par `jadePanLibre` ; `JADE.n.rochers` ne compte plus
  îles et massifs (`jadeRocher`) ; le pont du ciel taille son gabarit s'il n'est pas dans la palette.
- Crochets (`jade-secoue.js`) : `dbgJadePil(tout)`, `dbgJadePan()`. `dbgJadeAudit` (`jade-vol.js`) : couloir dans le repère de la dalle, cascades tous les 5 m,
  témoin « cœur plein » lu sur une case pleine connue (`T9.coeur`).
- Interrupteurs : **`?sans=jadeformes`** (la vallée d'avant au cube près), **`?sans=jadecompact`** (tampons en flottants), `?jpal=tout|19,23,…` (banc : palette forcée).
- Second ingénieur : palette téléphone portée de 16 à 19 (comme l'ordi, autant de gabarits qu'avant) — à 16 il restait 13 % de jumelles et 41 % de tranches à
  une classe sur téléphone ; ordi inchangé par construction (les tirages ne dépendent plus d'ALLEGE).

### Mesures (mêmes bancs que le § 4 ; ordi 8 graines midi / tél. `--tel=1` 4 graines ; avant → après)
| mesure | ordi | tél. |
|---|---|---|
| silhouettes distinctes du catalogue (seuil 0,2) | 3/19 → **28/39** | 4 → **28/39** |
| classes effectives de près | 1,68 → **9,48** | 1,88 → **9,08** |
| tours | 81 % → **17 %** | 72 % → **19 %** |
| jumelles (cible ≤ 3 %) | 19 % → **4 %** | 19 % → **7 %** |
| clones par route | 4,75 → **0** | 3 → **0** |
| suites du même gabarit au bord | 16 % → **6 %** | 15 % → **7 %** |
| série de tours au bord (moy./pire) | 21/39 → **1,6/2** | 17/29 → **1,75/3** |
| tranches de 300 m à une classe (cible ≤ 10 %) | 55 % → **13 %** | 67 % → **31 %** |
| hauteurs distinctes (cible ≥ 25) | 14 → **15** | 13 → **14** |
| grilles de la palette | 12,3 → **4,9-8,6 Mo** | 1,8 → **0,7-1,2 Mo** |
| géométries de la palette | 53 → **9,1-15,7 Mo** | 10,5 → **2,1-2,8 Mo** |
| familles d'instances | 73-77 → 76-78 | 60-63 → 64 |
| appels de dessin Jade | 56-64 → **62-71** | 23-36 → **37-42** |
| appels de l'image | 188-231 → 205-239 | 105-142 → 131-146 |
| triangles de l'image | 1,7-6,5 M → 1,46-2,27 M | 0,26-0,48 M → 0,25-0,32 M |
| image figée g7, médiane (banc-graphismes, bruité) | midi 9,4/12,6 · soir 9,3/12,5 (2 passes) → midi 13,4/16,0/12,8 · soir 16,7/10,0/9,9 (3 passes) | midi 5,5 → 4,9 · soir 5,1 → 5,2 |

Santé (ordi 8/8, tél. 4/4) : couloir 0, règle d'or 0, flottants 0, panneaux 0 (repère de la dalle), cœurs pleins 100 %, 0 erreur, 0 `__jadeErr`, 0 uniforme
manquant. Frôle : **1** sur ordi g2 à s 552 — une « table » (gabarit 14) posée par une scène en île de bord (marge voulue 2,5 m) à 2,7 m du bord, à hauteur
de route : pas un heurt, proximité de scène ; à regarder à l'œil si gênant. Cascade dans le couloir : seulement g3 s 450 (la scène « sous la cascade », voulue).
Garde-fous : route identique (p0 66a138ad988e519e, p10 dd8d6772b9331a3a, p20 5480b388feac08d1) ; `?sans=jadeformes` rend exactement les empreintes du décor
d'avant (ordi g1-8 et tél. g1-4, § 5) ; `outils/banc-routes/empreinte.cjs` identique wt-avant / wt-jade pour toutes les maps ; aucun fichier hors `jade-*.js`
n'emploie les nouveaux noms ; `voxPilierFin` (jade-1.js) inchangé pour un gabarit d'avant (`fmin` absent = −∞, `ly[6]` absent). Analyseur `non-declares.cjs` :
51 lignes avant comme après. Course complète `outils/banc-course/course.cjs --map jade` : 0 exception, 0 requête en échec ; les 273 messages console
(dont « WebGL: too many errors ») sont **les mêmes sur wt-avant** (préexistants). Empreintes du décor après : ordi c6b9eaac 7303b8ff 8d3629e1 7f538d80
d9d34908 b3e4794b 51075eb9 2fa76376 ; tél. 20afbaf9 14cffeb ddf28755 b2198deb.
Photos regardées : catalogue (`passation/jade-formes-apres/catalogue-39-gabarits.png`), ordi midi decorA et soir decorB (`jade-formes-apres/soir-g7-decorB.png` :
tables, champignons, îles à étages entre les colonnes), tél. midi decorB. DA intacte (mousse, lianes, rouille, brume).

### Ce qui reste / n'est pas vérifié
- Cibles non atteintes : jumelles ≤ 3 % (4 / 7 %), tranches à une classe ≤ 10 % (13 / 31 % : sur téléphone, peu de montagnes par tranche), hauteurs ≥ 25 (15) —
  il faudrait une échelle par instance (la grille des chocs `jadePilierDans` ne la lit pas) ou une palette plus grande (des appels de dessin).
- Appels de dessin Jade : +6 à +7 sur ordi, +5 à +14 sur téléphone, à triangles égaux ou moindres et image figée téléphone inchangée ; image figée ordi
  trop bruitée par la machine partagée pour conclure (recouvrement des plages).
- NON vérifié : les cubes fins d'une forme à plusieurs corps vus de près (finUnion, ordi), le popping à 130 m et entre bandes, nuit/orage, les 4 courses
  au pilote avec photos en roulant (seules les vues fixes et la course complète ont été faites), les attributs Int16/Int8 sur un vrai iPhone (WebGL2 headless seulement).
- À trancher par l'intégration : le massif de 241 m d'avant a été REMPLACÉ (catalogue 17 : massif de 128 m, r 64 ; 18 : grande mésa à cascades, r 78, h 96 ;
  une des deux par vallée) — le lointain change (moins de masse au fond) ; `?sans=jadeformes` montre l'ancien.

### Commandes (en plus du § 7)
`node ../jade-ing/resume.cjs <dossier>/gen-jade-midi.json` (scratchpad, résumé par graine : audit, appels, palette) ;
`node outils/banc-course/course.cjs --map jade --http 8362 --cdp 9562 [--jeu <VERSION PRINCIPALE d'un autre worktree>] --prof <dossier>`.

## 9. Contre-vérification (2026-11-14, deux vérificateurs adverses) — ce qui a été corrigé, ce qui est réfuté

**Corrigé — compteurs `JADE.n.montagnes/rochers` inversés avec `?sans=jadeformes`.** Reproduit (vérificateur : 660/422 contre 425/657 sur wt-avant).
Cause : `jadeRocher()` (jade-formes.js) avait, hors formes, le test « rochers seulement » au lieu du test d'avant `t>=JADE_NTPL`. Désormais `?sans=jadeformes`
reprend le test d'avant (compteurs, étiquette rocher/montagne de `jadeQuoi` jade-vol.js:471, vue `pres`). Preuve, graine 12 soir ordi, `?sans=jadeformes` :
wt-jade 425/657, empreinte du décor 9c5c4493 = wt-avant 425/657, 9c5c4493. Le mode formes n'est pas touché (le test des formes est inchangé).

**Appels de dessin sur téléphone (classé « majeur ») : réel, mesuré, gardé.** Nouveau banc `outils/banc-jade/appels-route.js` (voiture posée à 6 abscisses,
vue du conducteur, image entière sans post) ; `--tel=1`, nuit, graines 9 et 10, wt-avant puis wt-jade :
| | appels de l'image (moy. / max) | triangles (moy., k) | ms de tirage headless (moy.) |
|---|---|---|---|
| avant g9 / g10 | 127 / 171 · 138 / 200 | 545 · 562 | 1,25 · 1,61 |
| après g9 / g10 | 151 / 194 · 152 / 196 | 459 · 474 | 1,35 · 1,80 |
Soit +15 % d'appels en moyenne, le MAXIMUM inchangé (200 → 196), −16 % de triangles. La cause est structurelle : chaque gabarit visible de près coûte
3 appels (verre : absorption, profondeur, couleur ; jade-3.js famille()), et la variété, c'est justement plus de gabarits différents dans le champ. Les
pistes pour l'enlever retirent de la variété (palette de 16 au téléphone : 13 % de jumelles, § 8) ou de l'image (la bande 1 en une passe opaque) :
décision laissée à Sacha / l'intégration, rien n'a été changé. ms headless trop bruitée pour conclure (machine partagée). **NON vérifié : un vrai iPhone.**

**Cibles de variété (jumelles ≤ 3 %, tranches ≤ 10 %, hauteurs ≥ 25) : non atteintes, gardées comme limites.** Ces cibles sont celles que le diagnostic
(§ 8) s'était fixées, pas une demande de Sacha ; les deux vérificateurs jugent la demande satisfaite à l'œil. Les hauteurs demanderaient une échelle par
instance que la grille des chocs (`jadePilierDans`) ne lit pas : un chantier à part (risque de chocs faux), pas une retouche.

**Tours verticales groupées (g13 s1666, impression sur une capture) : non reproduit ici.** Les scènes de la descente Alléluia demandent des TOURS
(`FC.tours` : formes `haut`, assez hautes pour la portée) ; un groupe de colonnes y est attendu. Non vérifié à l'œil par moi (capture non rejouée).

Commande : `node outils/banc-maps/banc.cjs gen --carte=jade --meteo=nuit --graines=9,10 --tel=1 --port=<p> --cdp=<c> --profil=<nom> --auditfile=<abs>/outils/banc-jade/appels-route.js`
(sert aussi wt-avant tel quel : il n'emploie que des crochets d'origine).

## 10. Optimiseur (2026-11-14, passe courte à la demande de Sacha : « vas-y mollo sur les tokens ») — la bande 1 opaque sur téléphone

**Fait** (`code/maps/jade-3.js`, `JADE_B1O`) : sur **ALLEGE seulement**, les familles de la bande 1 (220-750 m, cubes de 3,5 m ; 176-600 m sur
`TEL_NATIF`) prennent le matériau opaque `M9.vrO` (UNE passe) au lieu du verre en trois passes (`vr` + `vrX` absorption + `vrP` profondeur) — c'était
la piste n° 2 du § 9, qui reprend le surcoût d'appels de la variété. Ordi : `ALLEGE` faux → chemin inchangé par construction (même matériau, mêmes
familles). Route, décor, chocs : non touchés (seul le matériau d'une famille change). **Interrupteur : `?jadeb1=verre`** (le verre d'avant sur téléphone).

**Mesures** (`outils/banc-jade/appels-route.js`, `--tel=1`, nuit, voiture posée à 6 abscisses ; appels de l'image moy./max, triangles moy.) :
| | g9 | g10 |
|---|---|---|
| origin/main (§ 9) | 127 / 171 · 545 k | 138 / 200 · 562 k |
| formes, verre (`?jadeb1=verre`) | 150 / 189 · 460 k | 150 / 201 · 474 k |
| **formes, bande 1 opaque** | **127 / 169 · 418 k** | **126 / 173 · 397 k** |
→ les appels reviennent au niveau d'origin/main (et sous lui), triangles −23 % / −29 % contre origin/main. 0 exception dans les 4 courses.

**Photos regardées** (`passation/jade-formes-apres/tel-g9-bande1-opaque.png` / `-verre.png`, midi, s 2800) : en opaque, les piliers à mi-distance sont plus
clairs et laiteux (moins de veines sombres du verre) ; la silhouette, la mousse, les lianes et la brume sont les mêmes.
**NON vérifié** : le saut de teinte verre → opaque quand une montagne passe la limite des 220 m en roulant (avant, il se faisait à 750 m, dans la brume) —
à regarder en course sur téléphone ; s'il se voit, `?jadeb1=verre` le compare et l'intégration peut repousser la limite (`JADE_LOD.r0`) ou revenir au verre.
Non vérifié non plus : un vrai iPhone, ordi remesuré (inchangé par construction).

**Banc** : le `gen` de `outils/banc-maps/banc.cjs` n'a jamais levé `__gameReady` cette fois (machine chargée, 84 % de CPU, 3 Go libres ; sur wt-avant : NON prouvé — l'option `--racine` n'a peut-être pas été prise ; un vérificateur l'a vu échouer aussi sur wt-avant g3 avec `gen`, alors que `sonde-tel.cjs` lève bien `__gameReady` sur wt-avant : l'échec tient au `gen`, pas au code de Jade — § 11) ;
`outils/banc-jade/sonde-tel.cjs` (son propre petit serveur, sans sw.js, sauvegarde muette du banc) l'a remplacé :
`node outils/banc-jade/sonde-tel.cjs <racine abs> <port> <cdp> "tel=1&meteo=nuit&pistegraine=9[&jadeb1=verre]" 120 <abs>/outils/banc-jade/appels-route.js [<préfixe des photos>]`.

## 11. Correctifs après la 2e double vérification (2026-11-14, passe courte : « vas-y mollo sur les tokens »)

**Jumelles (« jamais deux voisins identiques ») — corrigé en partie.** Reproduit : avec `?sans=jadejumelles` (le code du § 8), le téléphone
avait 7 % de voisines jumelles et l'ordi 4 %. Cause : quand TOUTE la fenêtre de taille (0,6-1,5 × le rayon demandé) a déjà sa jumelle à
moins de 260 m, la note ne peut choisir qu'une jumelle. **Fait** (`code/maps/jade-formes.js`, `JADE_JUM`, dans `jadeFormeChoix().liste`) :
dans ce cas, la fenêtre s'élargit (0,4-2,2 ×) aux gabarits sans jumelle proche. La pénalité de jumelle (≥ 45) l'emporte alors sur l'écart de taille
(7·|ln|, ≤ 5,5). Mode formes seulement (`?sans=jadeformes` n'est pas touché). La route n'est pas touchée : l'empreinte g1-8 donne p0 66a138ad988e519e,
p10 dd8d6772b9331a3a et p20 5480b388feac08d1, identiques. **Interrupteur : `?sans=jadejumelles`.**

Mesures avec `outils/banc-jade/formes.cjs` (midi). Les mêmes graines ont été passées dans les deux versions, via `outils/banc-jade/jumelles.cjs` :

| | tél. g1-4 avant → après | ordi avant (g1-4) → après (g1-2, voir plus bas) |
|---|---|---|
| jumelles | 7 % → **4 %** | 4 % → **3 %** |
| suites du même gabarit au bord | 7 % → 4 % | 8 % → 4 % |
| gabarits effectifs de près | 12,1 → 12,3 | 11,8 → 13,8 |
| tranches à une seule classe | 31 % → 34 % | 10 % → 7 % |
| hauteurs distinctes | 14,3 → 13,8 | 15,3 → 15,5 |

Les tranches à une seule classe sur téléphone (31 → 34 %, à 4 graines, c'est du bruit de tirage) et les hauteurs distinctes ne bougent pas.
Leur cause est donnée au § 8 : il y a peu de montagnes par tranche, et une seule échelle par gabarit.

Santé, refaite avec `audit-formes.js`. Téléphone g1-4 et ordi g1-2 : couloir 0, frôlements 0, panneaux 0, flottants 0, règle d'or 0 (les exceptions de ces courses-là ne sont pas lues par
jumelles.cjs ; 0 exception sur les deux courses photo tél. g2). Le frôlement connu sur ordi g2 à s 552 (§ 8) **a disparu** avec le correctif ; il est toujours là avec `?sans=jadejumelles`.

**Ce qui reste, et pourquoi.** Le reste des jumelles (environ 4 %) vient des **tours de scène** (`FC.tours`, jade-alleluia.js). Par exemple, au
téléphone g2 s 550, on a 3 × le gabarit 13 à 50 m les uns des autres, et à g3 s 3220, 2 × le gabarit 14 à 42 m. Ces tours trient d'abord par
hauteur (`span` : la tour doit monter jusqu'à son balcon), puis par note : quand une seule forme haute de la palette tient dans le cercle, elle
revient. Pour corriger, il faudrait plus de formes hautes dans la palette, donc plus d'appels de dessin, ou une échelle par instance (que la
grille des chocs ne lit pas). **Non fait.** Le quart de tour est déjà changé, donc ce ne sont jamais des clones (0 clone).

**Ordi g3 et g4 après correctif : non mesurés.** Sur la machine chargée, la course ordi n'était pas montée au moment de l'audit (JADE.root
absent, `finPrets 19/38`). Contrôle fait : **le même échec se produit avec `?sans=jadejumelles`**, donc il vient de la charge et pas du
correctif. Les deux mêmes graines étaient passées une heure plus tôt avec `?sans`. `jumelles.cjs` attend maintenant que la vallée soit posée
(jusqu'à 3 min) et relance un audit nul jusqu'à 4 fois.

**Photos regardées.** Téléphone g2 midi s 600, après correctif et avec `?sans=jadejumelles` (dans le scratchpad, non gardées) : la DA est la même
(verre, mousse, bonsaïs, brume) et les poses diffèrent, avec une grande colonne à gauche dans la version après. Rien de cassé.

**Bande 1 opaque sur téléphone (§ 10) : gardée, avec sa justification.** Les vérificateurs ont reproduit que la bande 1 opaque perd les veines
sombres du verre entre 220 et 750 m sur téléphone. Le premier l'a vu à g9, le second l'a trouvée indiscernable à g3. Sans elle, le téléphone
coûte environ 148 appels contre 128 sur origin/main (reproduit par les deux), ce qui viole la règle de budget écrite en tête de ce fichier. La
DA ou le budget : **c'est à Sacha de trancher**. `?jadeb1=verre` fait la comparaison en un drapeau. Pour revenir au verre, il suffit de mettre
`JADE_B1O` à faux dans jade-3.js. Le saut verre → opaque à 220 m en roulant n'a toujours pas été vu, ni par moi ni par les deux vérificateurs
(5 photos espacées de 20 m) : il reste **non vérifié en mouvement** sur un vrai téléphone.

**Le « gen » échoue aussi sur wt-avant : affirmation corrigée au § 10.** Ce n'était pas prouvé par moi. Un vérificateur l'a vu échouer sur wt-avant
g3 avec le `gen`, tandis que `sonde-tel.cjs` monte bien wt-avant. Le `gen` reste inutilisable sur la machine chargée. Les bancs de remplacement
sont `sonde-tel.cjs` et `jumelles.cjs`.

**Course complète.** `outils/banc-course/course.cjs --map jade --http 8362 --cdp 9562 --prof <profil> --jeu <wt-jade>/VERSION PRINCIPALE` :
0 exception et 0 requête en échec. Les 87 messages console sont des avertissements connus (readback Canvas2D, navigator.vibrate bloqué,
« READ-usage buffer »). Le banc a fini sur l'écran RÉGLAGES (`mSet`) et n'a pas trouvé les boutons `#mvW` et `#serieW`. C'est un défaut du parcours
du banc ; la cause n'a pas été cherchée et le même parcours n'a pas été lancé sur wt-avant. La mort par `dbgDauphin('boom')` a bien eu lieu (`mort ? true`).

**Toujours non vérifié** : sauts piégés et morts injustes en conduite réelle sur le nouveau décor (le `gen --roule` est cassé), un vrai
iPhone, l'ordi g3-g8 après le correctif des jumelles, et d'autres météos que midi pour ce correctif.

Commandes :
`node outils/banc-jade/jumelles.cjs <racine abs> 8360 9560 1,2,3,4 1 <sortie.json> [sans=jadejumelles]` puis `node outils/banc-jade/formes.cjs <sortie.json>` ;
`node outils/banc-jade/empreinte-route.cjs` (route).

## 12. L'optimisation (2026-11-14 soir → 2026-11-15 ; la reprise après la coupure réseau) — le tableau « référence / après »

**Reprise.** Le premier optimiseur a été coupé net en pleine passe : son travail (non commité, sans note ici) était dans le worktree. Relu fichier par fichier,
contrôlé (`assembler --verifier`, route identique, 0 exception dans toutes les courses et mesures ci-dessous), mesuré : sain, gardé et terminé. Son contenu :
- **les familles regroupées** (jade-3.js) : au-delà de 750 m une seule famille en cubes de 7 m (bandes 2-5) ; les gabarits légers (`petit`) gardent leurs cubes
  fins en verre jusqu'à 750 m (une famille au lieu de deux). `?jadefam=avant` : les familles d'avant ;
- **le saut de teinte à 220 m sur téléphone** (jade-2.js, `vrO1` réglé par `JADE_B1U`) : l'opaque de la bande 1 ne comptait que la face avant du verre et
  sortait 30 à 60 % plus clair. `?jadeb1=ancien` : l'opaque d'avant ; `?jadeb1=verre` : le verre ;
- **le détail proche plus loin sur l'ordinateur** (jade-2.js, `JADE_R0`) : cubes de 1,75 m jusqu'à 280 m au lieu de 220 (téléphone : 220). `?jader0=220` ;
- **l'échelle d'une petite île jumelle** (jade-formes.js `echelle` ; jade-3.js, jade-alleluia.js, jade-vol.js : matrices, chocs `jadePilierDans`, cubes fins) ;
- crochets `dbgJadeMem`, `dbgJadeB1` ; bancs `mesure.cjs`, `tableau.cjs`, `cout-route.js`, `temps-route.js`, `inj-memoire.js`, `inj-familles.js`, `courses.cjs`,
  `course-pilote.js`.

**Ajouté pendant la reprise :**
- **Le banc réparé** (`outils/banc-jade/sonde-tel.cjs`) : `?carte=jade` n'impose la map qu'au 1er JOUER. Une voiture morte avant l'audit, relancée par
  `dbgJouer()`, roulait sur une map tirée au hasard — c'est ce qui faisait « échouer » le `gen` et les mesures ordi (prouvé : l'ordi g9 mesuré sur
  `niveau:"ville"`, la vallée de Jade rangée, 0 appel de Jade). Chaque `dbgJouer` de la page force désormais Jade et la météo (`window.__carteBanc` pour une
  autre map). `cout-route.js` rend `bati.niveau`, `courses.cjs` affiche la carte roulée. **Les mesures « ordi » des § 10-11 qui disaient « vallée pas
  montée » venaient de là**, pas de la charge.
- **L'échelle étendue aux autres formes jumelles** (jade-formes.js `echelle` : tours, mésas, ponts de rayon ≤ 60 m, ×0,84 à ×1,2 ; ni rochers ni massifs) et
  `echelleTour` (tours des scènes Alléluia, bornée par la portée et le cercle de la scène, repli à l'échelle 1 si une garde refuse). `?sans=jadeechelle` coupe tout.
- **Le seuil `petit` de l'ordinateur ramené de 10 000 à 6 000 triangles** (jade-3.js) : à 10 000, la vallée soir g3 frôlait le budget de triangles (2,34 M
  contre 2,28-2,39 M) ; à 6 000 : 2,12 M. `?jadepetit=n` (banc).
- Bancs : `b1-ecart.js` (saut de teinte), `qui-appelle.js` (appels par objet), `programmes.js`, `temps-postes.js`, `mort-locale.js`, `sonde-montage.js`.

**Tableau référence (wt-avant = origin/main v1596) / après** — `mesure.cjs` + `cout-route.js` (voiture posée à 6 abscisses, vue du conducteur, une image sans
post ; appels, triangles et sommets comptés à chaque appel de dessin, passes de verre comprises) ; ordi `poste=max`, tél. `tel=1` :

| cas | appels moy. réf → après | pire réf → après | triangles (k) réf → après | sommets (k) réf → après | mémoire de la vallée réf → après (grilles + géométries + cubes fins + instances, Mo) |
|---|---|---|---|---|---|
| ordi midi g9 | 249 → **231** | 265 → 247 | 5 320 → **4 351** | 10 291 → 8 354 | 204,5 → **61,3** |
| ordi nuit g10 | 254 → **236** | 301 → 279 | 5 028 → **3 178** | 9 683 → 5 981 | 203,2 → **68,0** |
| ordi soir g3 | 218 → **199** | 234 → 215 | 2 277 → **2 122** | 4 339 → 4 027 | 201,0 → **58,0** |
| tél. nuit g9 | 136 → **127** | 177 → 165 | 595 → **510** | 935 → 771 | 14,9 → **6,0** |
| tél. midi g10 | 150 → **123** | 183 → 162 | 597 → **510** | 935 → 772 | 14,5 → **5,7** |
| tél. soir g3 | 103 → **100** | 159 → 134 | 345 → **323** | 497 → 442 | 13,3 → **4,2** |

Référence et téléphone : série alternée (`mesure.cjs`). Ordi « après » : seuil 6 000, mesuré juste après la série alternée (même banc, même machine).
Les tampons d'instances seuls montent un peu (ordi g9 7,4 → 9,2 Mo, tél. g9 2,5 → 2,9 Mo : plus de montagnes, plus petites, 598 → 1 322) ; le total de la
vallée baisse de 60 à 70 %. Géométries et textures vivantes de three (`renderer.info`) : varient de ±100 d'une page à l'autre selon ce que le jeu a fait avant
l'audit (la référence seule : 491 à 690 sur le même cas) — non concluant par cette mesure ; contrôlées à la même minute (`programmes.js`, ordi g9) :
programmes 197 / 197, géométries 637 / 639, textures 135 / 135.

**ms de tirage (bruitée, machine partagée à 100 % de CPU)** : `temps-route.js` (minimum de 5 × `dbgTemps(20)` à 6 abscisses), alterné, total des 6 :
ordi g9 25,4 / 33,4 → 67,2 / 28,6 ; ordi g3 40,2 / 28,7 / 16,3 / 31,3 → 43,0 / 42,2 / 25,1 / 17,2 ; tél. g9 10,0 → 9,7 ; tél. g3 7,1 / 10,1 / 7,0 → 16,5 / 11,7 / 8,8 ;
puis `temps-postes.js` tél. g3 : 1,24 (réf.) → 1,25 ms par image. **Rien de tranché à mieux que ±30 %** : la référence elle-même varie du simple au double.
Le tél. soir g3 est sorti plus lent 3 fois sur 4 (puis égal) : à surveiller sur un vrai iPhone. Les postes mesurés un à un (cascades, rayons, brume, piliers)
pèsent ≤ 0,3 ms chacun des deux côtés. **jadeBatit** (ms, bruité) : ordi 16 743 / 2 905 / 2 499 → 1 105 / 1 874 / 1 308 ; tél. 1 018 / 904 / 84 (vallée gardée)
→ 1 461 / 674 / 684.

**Saut de teinte à 220 m (téléphone)** — `b1-ecart.js` : à 6 abscisses, l'image rendue avec la bande 1 en verre puis en opaque, écart moyen sur les pixels qui
changent (sur 255) : nuit g9, opaque d'avant 4,8 → réglé **2,1** ; soir g6, 34,2 → **7,4** (luminance : verre 45,8, opaque d'avant 79,3, réglé 50,2). Midi g3 :
aucun pixel de bande 1 aux 6 abscisses (rien à juger). À ces écarts le saut ne se voit plus en image fixe ; **en mouvement sur un vrai téléphone : non vérifié**.

**Jumelles** (`jumelles.cjs` + `formes.cjs`, g1-4 ; « identique » = même gabarit ET même échelle) : tél. jumelles 5 %, **identiques 0 %** ; ordi jumelles 3 %,
**identiques 1 %** — 3 flèches (gabarit 32) en file au bord à g4 s ≈ 1 600, échelles 1 / 1,1 / 1 (une tour de scène, bornée à l'échelle 1 par sa portée et son
cercle). 0 clone partout. Santé (8 audits) : couloir 0, frôle 0, panneaux 0, flottants 0, règle d'or 0.

**Garde-fous** : route identique (p0 66a138ad988e519e, p10 dd8d6772b9331a3a, p20 5480b388feac08d1) ; `?sans=jadeformes` rend les empreintes du décor d'avant
(tél. g1-4 873815d9 b2a3e226 36b9ce dc93d4bd = § 5) ; `outils/banc-routes/empreinte.cjs graines=1-6` identique wt-avant / wt-jade (crypto, nuages, espace) ;
seuls des fichiers `code/maps/jade-*.js` sont touchés (aucun fichier partagé, aucun de la session « qualité par appareil »).

**Courses complètes** (`courses.cjs`, pilote mortel, sauts toutes les 4 s, deux passes : milieu puis bord à 0,8 ; carte vérifiée `jade` ; avant le seuil 6 000,
qui ne change que le dessin) :

| cas | morts réf. | morts après | images/s (passe 1) réf → après | gels > 250 ms réf → après |
|---|---|---|---|---|
| ordi midi g9 | 0 | 1 (s 2614, pic) | 28 → 21 | 30 → 54 |
| ordi soir g3 | 1 (s 2265, air) | 1 (s 2206, pic) | 46 → 52 | 2 → 8 |
| tél. nuit g10 | 0 | 0 | 49 → 54 | 19 → 6 |
| tél. pluie g6 | 0 | 0 | 46 → 53 | 24 → 6 |

Les morts : la même zone tue aussi la référence — rejouée 4 fois depuis s 2300 (`mort-locale.js`), ordi g9 : référence morte à s 2650 (« air »), branche à
s 2646 (« air »), puis 3 essais sans mort chacune ; avec `?sans=jadeechelle`, 0 mort sur 4. C'est un saut du pilote de banc au même endroit d'une route
identique à origin/main. « pic » au lieu de « air » au même endroit sur 2 courses : **non tranché** (une montagne sous la trajectoire d'un saut déjà perdu,
ou une mort injuste) — à regarder à l'œil, `?sans=jadeechelle` pour comparer. Gels et images/s : bruit de machine (dans les deux sens). 0 exception partout.

**Réinvesti en image (ordi)** : cubes de 1,75 m jusqu'à 280 m, le lointain en cubes de 7 m au lieu de 14 au-delà de 1 500 m, les gabarits ≤ 6 000 triangles
gardent verre et cubes fins jusqu'à 750 m — dans les triangles et appels du tableau. Essayé, non gardé : `?jader0=340` (g9 : +20 k triangles ; g3 trop juste) ;
au téléphone `?jadepetit=3000` (+54 k triangles, aucun appel de moins).
**Photos regardées** : `jade-formes-apres/optim-ordi-soir-g3-s2800-{reference,apres}.png` (même endroit, l'envers : îles, tables et ponts variés, verre et mousse
intacts), tél. soir g3 s 600 (arche, tours, îles ; un peu moins de grandes colonnes à l'horizon qu'avant), tél. soir g6 s 2800 (bande 1 réglée).

**Non vérifié** : un vrai iPhone (ms, saut de teinte en mouvement, attributs Int16) ; la libération de la mémoire au changement de map (banc tenté, la map
n'a pas changé — rien n'est touché dans `jadeJette` / `JADE_GARDE` par cette branche) ; les jumelles ordi hors g1-4 ; le juge commun des routes (route
identique à l'octet, donc même verdict qu'origin/main) ; les courses refaites après le seuil 6 000.

Commandes : `node outils/banc-jade/mesure.cjs <sortie.json> <wt-avant> <wt-jade> 8360 9560 <abs>/outils/banc-jade/cout-route.js "<cas>"…` puis
`node outils/banc-jade/tableau.cjs <sortie.json>` ; `node outils/banc-jade/courses.cjs <sortie> <réf> <branche> <port> <cdp> "<cas>"…` ;
`node outils/banc-jade/sonde-tel.cjs <racine> <port> <cdp> "<cas>" 150 <audit.js abs> [<préfixe des photos>]`.
