# Lot E — la route à étages (19/11/2026)

Worktree `.lots/e` (détaché sur 94cb49647, le socle : lots A et C). **Rien de commité, rien poussé, `sw.js` non touché.** Index assemblé (`--verifier` vert).
Bancs et sorties brutes : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-e/`
(`etages.cjs` le banc du lot, `final.txt` / `socle-final.txt` / `old-final.txt` ses sorties, `loc55.cjs`, `bas.cjs`, `ident.cjs`, `pieds.cjs`, `cyber-e4.txt`, `tors-e4.txt`, `tirage-ab4.txt`, `chrome/`).

## 0. Correction du tour 1 (après le refus de CONTROLE-E.md) — À LIRE D'ABORD : les § 1 à 6 plus bas décrivent la version refusée

Sorties : `scratchpad/lot-e/cor/` (`F-ctrl.txt` graines du contrôle 301-370 + 10 graines 32 bits, `F-auteur.txt` 1-20 + 101-160, `F-mid.txt` 401-460 aux paliers 5/15/27,
`F-cyber.txt`, `F-tors.txt`, `F-hr.txt`, `F-tirage.txt`, `F-pieds.txt`, `F-ie.txt` / `F-ienu.txt` ; bancs `etages-x.cjs` (= `ctrl/etages-c.cjs` + réglages par `X=`),
`encl.cjs` (enclavé par morceau), `part.cjs` / `mot.cjs` (longueur et virage par module / par motif), `hr.cjs`, `lg.cjs`). Mesures avec le banc du contrôle, `etages-c.cjs`.

### Ce qui a changé (tout sous `VETG` / `veActif()` : `?sans=villeetages` reste le socle au bit près)
| défaut | correction | où |
|---|---|---|
| 3. les étages disparaissaient aux paliers 10-15 | **L'ÉTAGE D'ABORD** (`veEtage`) : premier module de la route, le parking ou à défaut la bretelle s'il tient avant la clôture (même passé la borne des modules) ; le module suivant vient vite tant que l'étage ou le raccourci reste à jouer (un cinquième de l'écart) ; le raccourci ensuite, le grand saut sinon le petit ; sa réserve de scène ne double plus la place de la clôture. **Route courte** (LV ≥ 2,3, palier ~13 et plus) : le parking d'abord (enclavé 52 % contre 21 % pour la bretelle au palier 20), le raccourci une graine sur deux (`VE_RACN`) | `ville-entree.js` (boucle VETG), `ville-etages.js` |
| 1. écart avec la route du dessus | **le parking plonge de 170 m par tour** (`VE_AIR`, 68 avant) : toujours 400-460° à 1,8-2,1 rP, mais −23 % au rayon le plus serré du palier 0. C'est aussi ce qu'il faut au lot D (à 68 m, `tourLibre` n'y suspendait rien) | `ville-etages.js`, `mParking` |
| 2. virage cumulé aux paliers 10-20 | **mesuré** : au palier 20 la respiration tournait à 62 °/km (253 au palier 0) et l'entrée à 25 °/km, sur 2,15 km. `VE_KT` : la respiration et la rampe de l'entrée tournent LV^1,25 fois plus (×1,1 / ×2,2 / ×3,6) ; `VE_LRE` : la respiration s'allonge comme LV^0,6 ; `VE_KR` : rayons des motifs −50 % au palier 20 (jamais sous `rPlancher`). Rien ne bouge au palier 0 ou presque | `ville-entree.js`, `ville-etages.js` |
| 4. raccourci sous lui-même à < 40 m | `vsCroise(…,{h:60,k:20,hr:40})` : un raccourci qui repasse sous lui-même à moins de 40 m compte comme un croisement | `ville-scenes.js` (paramètre optionnel `o.hr`) |
| 5. pièces du piqué perdues | `VE_DECOR` 15 → 40 (une pièce de module route-ville : 20) ; et une **enseigne du piqué** qu'une route d'un autre étage frôlerait (12 m) n'est plus posée (graine 508, palier 20 : audit `dans` 2 sinon) | `ville-etages.js`, `ville-cyber.js` (gardé par `veActif()`) |
| 7. commentaires faux | `VE_AIR` a son commentaire ; mParking dit 170 m / −23 % ; l'appel de `veOrdre` et l'en-tête disent « l'étage en tête » | |
| (en passant) | la droite surélevée de l'entrée reprend sa borne de la charte (R2 : 2,6 s au plus), que la version refusée avait ôtée | `ville-entree.js` |

### Mesures (médianes ; « min » = pire route) — banc du contrôle
| | palier | 3/11 | socle | refusé | **corrigé, graines du contrôle** | **corrigé, graines 1-20 + 101-160** | objectif |
|---|---|---|---|---|---|---|---|
| enclavé | 0 / 10 / 20 | 68 / 57 / 46 % | 33 / 17 / 19 % | 69 / 58 / 54 % | **75 / 56 / 55 %** (min 56 / 40 / 36) | **75 / 57 / 53 %** | ≥ 50 ✔ |
| virage cumulé (tours) | 0 / 10 / 20 | 5,6 / 4,9 / 3,2 | 4,0 / 3,1 / 2,0 | 4,6 / 3,7 / 2,9 | **4,7 / 4,1 / 4,2** (p10 4,1 / 3,8 / 3,8) | **4,7 / 4,1 / 4,2** | ≥ 4 ✔ (au ras du seuil aux paliers 10 et 20) |
| écart avec la route du dessus, hors raccourci | 0 / 10 / 20 | 127 / 107 / 169 m | 158 / — / — | 110 / 425 / 170 | **175 / 176 / 174 m** | **178 / 178 / 173 m** | ≥ 150 ✔ |
| idem hors étages internes | 0 / 10 / 20 | | | 147 / … | 170 / 197 / 737 m | 200 / 219 / 928 m | |
| hauteur libre mini hors raccourci (pire route) | 0 / 10 / 20 | 58 / 82 / 138 | | 60 / 82 / 134 | **61 / 77 / 154 m** | 62 / 77 / 157 m | ≥ 60 ✔ |
| raccourci sous lui-même < 40 m (routes / 80) | 0 / 10 / 20 | — | 4 (p0) | 23 (p0) | **1 / 5 / 0** (mini 31 / 29 m) | | |
| `vsCroise` ≠ 0 ; montée hors module ; pente hors piqué | tous | | | 0 ; 0 ; ≤ 40,5 % | **0 ; 0 ; ≤ 40,5 %** | idem | ✔ |
| tenue t30 p90 (pire) | 0 / 10 / 20 | 10,3 / 9,3 / 8,8 | 8,3 / 7,7 / 6,4 | 7,6 / 6,9 / 7,8 | **7,4 (8,4) / 6,2 (7,1) / 4,9 (7,8) s** | 8,1 (9,5) / 6,4 (7,3) / 4,9 (7,8) | p90 < 8,5 ✔ |
| module d'étage (routes / 80) | 0 / 10 / 20 | | | 79 / 11 / 69 | **80 / 80 / 80** | 80 / 80 / 80 | |
| raccourcis par route | 0 / 10 / 20 | 0 | 1 / 1 / 0,5 | 1 / 1 / 0,1 | **1 / 1 / 0** | 1 / 1 / 0 | ⚠ voir plus bas |
| une scène ou un module du lot A | tous | | | 80/80 | **80 / 80 / 80** | 80 / 80 / 80 | ✔ |
| … dont un module du lot A | 0 / 10 / 20 | | 59 / 36 / 8 | 14 / … | 19 / 15 / 68 | 20 / 23 / 75 | ⚠ moins qu'au socle aux paliers 0-10 |
| durée | 0 / 10 / 20 | 52 / 41 / 31 s | 46 / 34 / 25 s | 45 / 35 / 26 | 45 / 35 / 26 s | 45 / 35 / 25 s | ≈ socle |

Paliers intermédiaires (graines 401-460) : palier 5 enclavé 67 %, 4,4 tours ; **palier 15 enclavé 47 %, 4,1 tours**, étage 60/60, raccourci 0,5/route ;
palier 27 enclavé 47 %, 2,6 tours, étage 60/60, pas de raccourci (3/11 au palier 15 : 52 %, 4,4 tours ; socle : 19 %, 2,7 tours).

Banc des modules (`ville-cyber.cjs`, 501-560) : **pièces perdues 0 / 0 / 2** (crusse, palier 20) aux paliers 0 / 10 / 20 (refusé : 4 + 1 tunnel ; socle : 16 pièces et 4 plans) ;
plans abandonnés : 1 boucle + 1 tunnel au palier 0, 1 tunnel au palier 10, 1 crusse au palier 20 (raison « route ») ; **règle 14 m 0, audit dans 0 / frole 0, nappes 0**
à tous les paliers. Le décor du socle (`?sans=villeetages`) est égal à la référence intacte, ligne pour ligne (hors temps). Pire t30 de ce banc : 8,77 s au palier 0 (8,95 refusé).
Torsades (501-530) : roulis ≤ 28°/s, 0 % au-delà de 45°, envers 0 %, saut refusé 0 %.
Tirage (`ville-tirage-ab.cjs`, 311-322 × 2, alterné) : ×1,07 / ×1,00 / ×0,66 aux paliers 0 / 10 / 20.

### Ce que je conteste / ce qui reste
- **Palier 15 : enclavé 47 %, pas 50.** Les routes SANS raccourci y font 53 %, celles AVEC ~32 % (le raccourci y prend 40 % de la route à 20 % d'enclavé, `encl.cjs`).
  Le palier 15 n'est pas dans les paliers de l'objectif (0, 10, 20) ; atteindre 50 demande de jouer moins de raccourcis, ce que Sacha n'a pas demandé (« les sauts et
  raccourcis restent »). **Choix à Sacha** : `VE_RACN` (1 = raccourci dès qu'il tient : 38 % ; 2 = une route sur deux : 47 % ; sans raccourci : 53 %).
- **Raccourcis aux hauts paliers : 0 au palier 20** (socle 0,5). L'étage passe d'abord et la route de 25 s n'a plus la place d'un saut de 2,5-3,5 km ;
  raccourci d'abord, l'étage manquait et l'enclavé tombait à 20 % sur ces routes (essayé, mesuré). C'est le même arbitrage que ci-dessus.
- **Virage au palier 20 : 4,2 tours, au ras du seuil.** Le plancher des rayons (1,6 rP) le borne : la respiration y tourne déjà au plancher. Le 3/11 n'en faisait que 3,2.
- **Moins de modules du lot A aux paliers 0-10** (19-23/80 contre 59/36 au socle) : étage + raccourci + clôture remplissent la route.
- Boucles (même côté, ≥ 180°) : 2,6 / 2,7 / 2,5 par route (refusé 2,5 / 1,5 / 1,0 ; socle 2,1 / 1,7 / 0,8), dont les « liaisons » 13 / 14 / 42 sur 30 routes, et une suite de
  **1 135°** au palier 10 (graine 523, autour d'un grand saut). Essayé : une respiration à contre-sens du motif (12-36 % de boucles en moins, max 590°) coûtait 3 points
  d'enclavé au palier 20 (51 %) ; pas gardé. À regarder en course.
- t30 pire : 9,5 s (palier 0, graines 1-160) et 9,9 s (palier 5) ; le p90 reste sous 8,5 partout.
- Décor pour le lot D (`pieds.cjs`, graines 1-12, simulation du canyon avec le vrai `tourLibre`) : pieds relevés par route **16,7 / 18** aux paliers 0 / 10 (socle 9,8 / 1,1 ;
  refusé 13,5 / 9,5), part de route sous un pied relevé **31 / 23 %** (socle 17 / 4 %). Tours refusées 127 / 140 (socle 109 / 108). `tourLibre` n'est pas touché.
  **Oui, la route donne des étages à superposer**, et le parking (170 m d'un tour à l'autre) a maintenant la hauteur d'y pendre des tours.
- Chrome : voir § 0 bis. L'iPhone, la vitrée et Crypto City en Chrome, les sauts nitro : pas faits.

## 1. Ce qui est fait (version refusée au tour 1 — voir § 0 pour ce qui a changé)

Interrupteur **`VILLE_ETAGES`** (`?sans=villeetages` = le socle au bit près), actif seulement si `veActif()` : carte `ville`, ni `crypto` ni `vitre`, ni piste dessinée,
ni parc, avec `MODC_ON`, `VILLE_ANCRES`, `VILLE_RACC`, `GEN_V2` (et `VILLE_CALME`, dont il dépend). Dans `genCtrl1`, `VETG = MC==='ville' && veActif()`.

Nouveau morceau `code/maps/ville-etages.js` (inscrit dans `ORDRE.txt` après `ville-cyber.js`) : l'interrupteur, `veActif`, les réglages `VE_*`, `vePente`, `veOrdre`.
Raccords (tous gardés par `VETG` / `ve9` / un paramètre absent ailleurs) :

| où | quoi |
|---|---|
| `ville-entree.js`, `genCtrl1` | `VETG`, `veDefait` (le tour d'un module d'étage sort de l'enroulement) ; garde-fou d'enroulement **450°** (170° ailleurs) |
| entrée | l'entrée du 3/11 : droite 260·LV, rampe 320·LV qui plonge de 160·LV **en arc de 48-62°** (un `arc`, pas une `courbe` : le `rPlafond` d'aujourd'hui la tournerait à ~90°) |
| la boucle | une branche `else if(VETG)` avant l'ancienne recette (et `V2&&!VETG`) : **les 13 motifs du 3/11 copiés motif par motif** (mêmes rayons RS, mêmes pentes, poids `VILLE_WM`), la respiration du 3/11 (50-90 m × LV, 16-36°, −(8-16)·LV), un module tous les 0,3-0,55 km × LV × kMC |
| les pentes | `vePente` : chaque motif est dessiné à la pente **finale** qu'adoucirPentes en aurait faite, **bornée à 40,5 %**, pré-compensée comme `vcDessin` → adoucirPentes n'y touche plus, aucune hauteur ne glisse derrière un saut ou une ancre ; les montées des motifs plafonnées à **+2 %** (`VE_MONTE`) |
| le paquet | `MCJ` = `VS.scenes.concat([angles, bretelle, slalom, double corde, carrefour en S, pont, parking du 3/11], VS.cyber.liste)` : **un tableau neuf**, `VS.scenes` jamais écrit |
| l'ordre | à chaque module : un **raccourci** (vSaut / vPetit, `MODMARK`/`FILETMARK` comme aujourd'hui) s'il tient avant l'arrivée (1er module, puis un sur trois) ; sinon une carte : d'abord un **étage** (parking une graine sur deux, sinon la bretelle : `veOrdre`), ensuite une carte route-ville (lot A) ou une scène qui tient ; la route se clôt par une carte qui tient (une scène ou un module route-ville si aucun n'a été joué) |
| `mParking` | sous `VETG` : **400-460° à 1,8-2,1 rP, −9 %** (le 3/11, confirmé par Sacha), avec au moins 68 m d'un tour à l'autre (`VE_AIR` : 9,8 % au rayon le plus serré du palier 0 — à 9 % il restait 60 m, mesuré) ; ancre géante au centre ; `{fig:'parking',etage:1}` |
| `mBretelle` | sous `VETG` : `{fig:'bretelle',etage:1}` + `veDefait` (ailleurs : `undefined`, comme avant) |
| malus, **genCtrl ET genCtrlG à l'identique** (`ve9`) | `routeRecoupe(…, 80)` (150 ailleurs) et exemption `etage` ; `vsCroise(…, {h:60,k:20})` (50 m et 6 ailleurs) ; `vsMalusDecor(…, 15)` (3 ailleurs) |
| `ville-scenes.js` | `vsCroise(ctrl,marks,o)`, `vsMalusDecor(ctrl,kD)` (paramètres optionnels), `vsMalusBoucle` exempte `m.etage` |
| `outils/banc-routes/charge.cjs` | charge `ville-etages.js` s'il existe |

Gardés tels quels : `vsDevers`, `vsReserve`/`vsBatir`/ancres, `vsMalusTenue`, `vsMalusBoucle` (hors étages), le refus du saut tête en bas, `genCtrlG` en tranches, le pré-bâti.
Aucun tirage `rf`/`rnd` ajouté hors de `VETG` (prouvé au bit près, § 3).

### La pente de 55 % du 3/11, localisée (`loc55.cjs`, 60 graines × 3 paliers, motifs marqués dans une copie d'aa160)
Segments au-dessus de 40,5 % : **esses (motif 3) 4 611, grands virages (motif 5) 1 598**, plongeons 160, entrée 18, autres < 12. Au-dessus de 50 % : esses 1 908, grands virages 484.
Ces deux motifs étaient dessinés à 60-110 % de pente ; adoucirPentes (seuil 30 %, garde 0,35) les rendait à 40-58 %. Ce n'était **ni la rampe d'entrée ni le pont**.

## 2. Les mesures (graines 1-20 et 101-160, 80 routes par palier, `VILLE_BANK.graine` posée comme en jeu)

`etages.cjs` : enclavé, tours, écarts, hauteur libre, `vsCroise`, tenue (juge du dépôt) sur les points de contrôle. 3/11 = les morceaux d'aa160d07f ; socle = 94cb49647.
⚠ L'enquête du matin ne posait pas `VILLE_BANK.graine` : le socle y valait 27 % d'enclavé « tous paliers » ; graine posée, il vaut 32 / 16 / 18 %.

| médiane (80 routes) | palier | 3/11 | socle | **lot E** | objectif |
|---|---|---|---|---|---|
| enclavé | 0 / 10 / 20 | 66 / 59 / 44 % | 32 / 16 / 18 % | **70 / 57 / 53 %** | ≥ 50 % ✔ (p10 du palier 10 : 43 %) |
| virage cumulé (tours) | 0 / 10 / 20 | 5,6 / 4,9 / 3,2 | 4,0 / 3,1 / 2,0 | **4,6 / 3,7 / 2,7** | ≥ 4 : ✔ au palier 0 seulement ✘ |
| écart médian avec la route du dessus, hors raccourci | 0 / 10 / 20 | 146 / 236 / 171 m | 172 / — / 585 m | **138 / 382 / 167 m** | ≥ 150 : ✘ au palier 0 (le parking : ses tours s'empilent à 68 m) |
| idem, hors raccourci ET hors parking/bretelle internes | 0 / 10 / 20 | (pas de marques au 3/11) | idem | **159 / 399 / 561 m** | ≥ 150 ✔ |
| hauteur libre min hors raccourci (pire route) | 0 / 10 / 20 | 58 / 83 / 136 m | 63 / — / 544 m | **60,5 / 76,6 / 127 m** | ≥ 60 ✔ |
| `vsCroise` (routes ≠ 0) | tous | 0 | 0 | **0** | 0 ✔ |
| tenue t30 90e centile (pire) | 0 / 10 / 20 | 9,8 / 8,3 / 7,8 s | 8,4 / 7,5 / 7,6 s | **7,5 (8,8) / 6,9 (8,3) / 7,8 (8,6) s** | p90 < 8,5 ✔ |
| pente d'un segment (pire, hors piqué) | tous | 58 % | 40,5 % | **40,5 %** | ≤ 40,5 ✔ (le piqué du lot A : 73-77 %, voulu, comme au socle) |
| montée hors module (max) | tous | 10,6 % | 6 % (liaisons) | **0** | aucune ✔ |
| pente moyenne | 0 / 10 / 20 | 18 / 18 / 17 % | 9,6 / 8,3 / 9,6 % | **16,9 / 16,9 / 17,5 %** | (comparaison) |
| durée (vitesse réelle) | 0 / 10 / 20 | 51 / 41 / 31 s | 47 / 34 / 25 s | **45 / 35 / 26 s** | ≈ socle ✔ |
| routes avec une scène ou un module du lot A | 0 / 10 / 20 | — | 79 / 80 / 72 sur 80 | **80 / 80 / 80** | toutes ✔ |
| … dont un module du lot A | 0 / 10 / 20 | — | 60 / 36 / 10 sur 80 | **16 / 27 / 71 sur 80** | ⚠ moins aux paliers 0 et 10 |
| module d'étage (parking ou bretelle) | 0 / 10 / 20 | — | 0 (la grande spirale au palier 0) | **80 / 20 / 66 sur 80** | |
| raccourcis par route | 0 / 10 / 20 | 0 | 1 / 1 / 0,4 | **1 / 1 / 0,2** | |

Banc des modules (`ville-cyber.cjs`, 60 graines × 3 paliers) : **règle 14 m 0, audit dans 0 / frole 0, nappes 0** ; 1 plan perdu sur toute la série (une passerelle, au palier 0, une route dans son emprise — le socle en perd 1 aussi) ; aucune pièce perdue. Avant le prix du décor perdu à 15, il y en avait 14 au palier 0.
Torsades (`ville-torsades.cjs`, 30 graines) : roulis max 28°/s, 0 % à plus de 45°, envers 0 %, saut refusé 0 % ; boucles ≥ 180° par route 2,9 / 1,8 / 1,2 (socle 2,1 / 1,7 / 0,8 : le parking et la bretelle, voulus).
Recoupements sous 70 m (`bas.cjs`) : seulement des parkings sur eux-mêmes (≥ 60 m) ; les recoupements à 42-48 m « route / saut » sont la bretelle d'un saut sous son propre départ (comptés dans le raccourci par `vsCroise`, comme au socle).

### Le décor (pour le lot D) — `pieds.cjs` (la simulation du canyon d'aujourd'hui avec le vrai `tourLibre`, graines 1-12)

| | palier 0 socle → lot E | palier 10 socle → lot E | 3/11 (enquête, anciens rangs) |
|---|---|---|---|
| tours au pied relevé par route | 9,8 → **13,5** | 1,1 → **9,5** | 26,6 / 18,9 |
| part de route sous un pied relevé | 17 % → **25 %** | 4 % → **12 %** | 27 % / 16 % |
| tours refusées (plus d'air entre deux étages) | 109 → **125** | 108 → **122** | 61 / 34 |
| toits rabattus | 11 → 9 | 12 → 7 | 2 / 0,4 |

**Oui, la route donne des étages à superposer** (trois à neuf fois plus de pieds relevés qu'au socle aux paliers 10 et plus), mais deux fois moins de tours suspendues
qu'au 3/11, et **plus de tours refusées** : le parking empile ses tours à 68 m, trop peu pour suspendre une tour (`tourLibre` veut 40 m entre pied relevé et toit rabattu
plus ses marges). Pour le lot D : les tours pendues ont la place entre deux tronçons ordinaires (écart médian 160-560 m), pas dans le parking. `tourLibre` n'est pas touché.

## 3. Preuves d'identité

- `SEARCH='?sans=villeetages' node outils/banc-routes/empreinte.cjs graines=1-12` : ville **17b89297a6b8 / 9dc6766ea34f** ✔ ; `?sans=villeetages,villecyber` : **d63b36e2af8b / fb378a8c6756** ✔ ;
  sans drapeau : crypto **5447610bd8f2 / eae97981f833**, nuages **469d52aff855 / 2e1661d8fe93**, espace **9c99fae61d38 / ea2d9e750351** ✔ (la ville neuve, version livrée : 06a2f688b1b8 / 20314c92750d).
- `ident.cjs` (ctrl + **MODMARK + FILETMARK + VILLE_BANK.N/max + VILLE_ENTREE**, ville et crypto, paliers 0/10/20, avec et sans graine posée) : `.lots/e` avec `?sans=villeetages` = la référence intacte, **12 empreintes sur 12** ; crypto sans drapeau = la référence.
- La vitrée (non mesurable en Node) : preuve au code — `VETG` exige `MC==='ville'` (la vitrée est `MC==='vitree'`) et `veActif` exige `!c.vitre` ; `ve9` (malus) vaut faux pour elle ; son paquet n'a ni parking ni bretelle ; `routeRecoupe`/`vsCroise`/`vsMalusDecor` reçoivent leurs valeurs d'avant (`hR||150`, `o` absent, `kD||3`). **Pas vérifié en Chrome.**
- Gardes : `garde-demarrage` OK (21 scripts lus), `garde-allege.sh` ✔, `garde-charte.sh` OK, `assembler --verifier` ✔.

## 4. Coûts

- Tirage (`ville-tirage-ab.cjs`, alterné, 10 graines × 2) : médianes p0 68 → 67 ms, p10 66 → 69 ms, p20 68 → 75 ms (+12 %) ; points de contrôle +2 / +15 / +27 %.
  Pire route au banc des modules : 105 / 117 / 83 ms (socle 215 / 99 / 533). Le malus garde ses pauses de tranche (`genCtrlG` inchangé) ; **non mesuré sur iPhone**.
- Décor : 0 appel, 0 matière, 0 programme ajoutés par le code (le lot ne touche que la route). Comptes Chrome : § 5.

## 5. Chrome

Une passe sous `verrou-banc.sh` (« ville-cyber-e », 306 s de verrou, Chrome muet `--mute-audio` + sfx/mus/vox coupés, profils supprimés, verrou rendu ; son groupe de processus tué) :
`outils/banc-routes/ville-cyber-page.cjs` (palier 0, `?tel=1`, pilote auto nitro coupée), JSON et photos dans `scratchpad/lot-e/chrome/`.

| course | écran | modules joués | dbgVilleAudit dans / frole / flotte | mort | erreurs console | appels / triangles (moyenne · max) | programmes / textures / géométries |
|---|---|---|---|---|---|---|---|
| `?villescene=parking`, graine 3, jusqu'à 5,15 km | 844×390 | saut, parking, façade | 0 / 0 / 0 | aucune | 0 | 112 / 296 k · 182 / 406 k | 154 / 121 / 524 |
| idem | 390×844 | saut, parking, façade | 0 / 0 / 0 | aucune | 0 | 100 / 257 k · 166 / 390 k | 154 / 121 / 538 |
| graine 5, 5 km | 844×390 | grand saut, parking, portes | 0 / 0 / 0 | aucune | 0 | 117 / 306 k · 138 / 378 k | 154 / 122 / 546 |
| graine 8, 5 km | 844×390 | saut, bretelle, piqué, façade | 0 / 0 / 0 | aucune | 0 | 116 / 274 k · 152 / 359 k | 154 / 121 / 555 |
| **avant** (`?sans=villeetages`), graine 5, 5 km | 844×390 | vrille, crête, grand saut, tour de la géante | 0 / 0 / 0 | aucune | 0 | 113 / 284 k · 150 / 409 k | 154 / 122 / 556 |

Le parking : la caisse est restée en `drive` à chaque relevé (36 et 38 relevés). Même graine 5 avant/après : **+4 appels (+3,5 %), +8 % de triangles** en moyenne
(la route n'est pas la même, donc pas la même vue : ce n'est pas une A/B du rendu ; le lot n'ajoute ni maillage ni matière ni programme — programmes et textures égaux).
Repère de l'enquête : 114 appels / 282 k triangles sur téléphone ; les triangles sont un peu au-dessus de ±5 % sur cette graine.
Photos (`planches/etages-parking-g3-*.jpg`, 844×390 et 390×844) : sous le parking, le tour du dessus passe au-dessus de la route, la ville violette autour.
**Non fait en Chrome** : le saut nitro (le pilote roule nitro coupée), la vitrée, Crypto City, les paliers 10 et 20, une course de bout en bout (5 km sur ~6).

## 6. Ce qui n'est PAS vérifié / ce qui reste

- **Le virage cumulé ≥ 4 tours n'est tenu qu'au palier 0** (3,7 au 10, 2,7 au 20 ; le 3/11 faisait 4,9 / 3,2 avec des routes plus longues de 15-25 %).
- **L'écart médian ≥ 150 m n'est tenu au palier 0 que hors parking** : la spirale serrée (choix de Sacha) empile ses tours à ~68 m et pèse sur la médiane.
- **Le lot A joue moins au palier 0** (16 routes sur 80 contre 60 au socle ; palier 10 : 27 contre 36) : dans la durée d'une route de 45 s, raccourci (~2 km) + étage (~1,1 km) laissent rarement la place d'une carte route-ville de 10-16 s ;
  c'est alors une scène courte (crête, façade, traversée) qui la remplace. Choix à faire par Sacha : (a) la carte route-ville avant l'étage une graine sur deux, (b) des routes de la ville 10-15 % plus longues (le 3/11 l'était), (c) tel quel.
- Le lot B (l'immeuble traversé) n'est pas dans ce socle : l'entrée du 3/11 n'a pas été essayée avec sa porte.
- Les vols : aucun banc de saut nitro (`ville-sauts-page.js`) n'a tourné ; le pilote du banc Chrome roule nitro coupée (pas de saut).
- La vitrée et Crypto City en Chrome ; l'iPhone (tirage, comptes, chauffe) ; l'œil de Sacha.
- `vcPaquet` met toujours la carte route-ville en tête du paquet, mais l'étage passe devant (`veOrdre`, puis `veEtage` depuis la correction).
