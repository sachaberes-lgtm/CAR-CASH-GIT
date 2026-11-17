# CONTRÔLE ADVERSE — « chaque route est unique » (Jade, Espace) — 2026-11-17

Contrôle indépendant de la refonte non commitée du worktree `~/cash-car/routes-uniques` (base `88a648892` = l'AVANT).
Tout au banc Node, aucun navigateur. Outils (les miens, pas ceux des auteurs) : `outils/banc-routes/uniques/adverse/`
(`lib.cjs` charge le code par `uniques/routes.cjs`, puis rééchantillonne et mesure lui-même ; `gen.cjs`, `ana.cjs`, `tableau.cjs`,
`mem.cjs`, `empreinte.cjs`, `jade-envers.cjs`, `temps.cjs`, `paires-roulis.cjs`). Résultats bruts : `adverse/resultats-*.txt`, données `adverse/data/`, planches `adverse/png/`.

**Graines** : 32 bits au hasard comme le jeu (`(rand·1e9)|0`, tirées d'un mulberry32(20261117 + palier·7919)), jamais 1-200.
**Séance** : 30 routes de rodage puis 200 routes DE SUITE dans le même vm (le sac se souvient), AVANT (`ref=88a648892`) et APRÈS sur les mêmes graines.
**Vitesse** : vPalier × élan = 140 / 234 / 396 / 439 m/s aux paliers 0 / 10 / 20 / 27 ; « 10 s » = 1,4 / 2,3 / 4,0 / 4,4 km.
**Proximité** (la mienne) : tracés rééchantillonnés tous les 25 m dans le repère du départ (origine au 1er point, cap des 50 premiers m), RMS 3D et écart max,
sans et avec miroir gauche/droite, sur 0-500 m, 0-1, 0-1,5, 0-3 km. Roulis « vu de l'horizon » (angle de la normale autour de la tangente) dérivé sur ±15 m × v ;
crête = v²·κn/(g·Ny) avec g = 33 (relatif : AVANT dépasse déjà 1 partout, le jeu tient la caisse — ne lire que l'écart avant/après).

---

## 1. Le critère du créateur, mot pour mot (200 routes de suite)

**Suites de modules : TIENT.** 200/200 distinctes aux 4 paliers, deux maps (avant : Jade 16 / 4 / 4 / 4, Espace 69 / 19 / 1 / 1).

**Mais l'unicité est souvent celle du DERNIER nom** : paires qui ne diffèrent que par leur dernier module — Espace p20 **30**, p27 **134** ; Jade p27 **92**.
À une retouche près (Levenshtein ≤ 1) : Espace p27 430, Jade p27 251.

**Tracés proches sur les 3 premiers km : NE TIENT PAS aux paliers rapides.** Paires (sur 19 900) sous 50 / 100 m de RMS 3D, miroir compris :

| 0-3 km | Jade avant | Jade après | Espace avant | Espace après |
|---|---|---|---|---|
| p0 | 12 / 92 | **0 / 0** | 68 / 523 | **0 / 1** |
| p10 | 882 / 4958 | **0 / 1** | 78 / 1088 | **2 / 12** |
| p20 | 2002 / 5311 | **2 / 21** | 2211 / 9364 | **24 / 221** |
| p27 | 1828 / 5432 | **3 / 45** | 1211 / 4542 | **52 / 308** |

Sur 0-1 km (2,3 s à p27) : **36 % (Jade) et 49 % (Espace) des paires** restent sous 50 m à p27 — la droite du portail + l'ouverture.
Écart MAX (miroir) sous 100 m sur TOUT le 3e km : Espace p27 **36 paires**, p20 28.

Les plus proches (planches `adverse/png/<carte>-apres-p<palier>-proches.png`, dessus | profil, rouge/bleu) :
- **Espace p27 `g114443823` ~ `g897266160`** : RMS **9 m**, max 23 m sur 3 km (6,8 s) ; **roulis identique (écart RMS 0°), cap 0°, pente 1,2°** — même 1er module (fronde @630 m), le 2e n'arrive qu'à 3,6 km. Les suites diffèrent (`fronde>esse>…` / `fronde>quart>…`) : unique sur le papier, **la même route pendant 7 s**.
- **Espace p27 `g631408407` (fronde) ~ `g803378151` (surbaisse)** : RMS 17 m, max 28 m, roulis 2° : **deux noms de module, une seule forme** à cette vitesse.
- Espace p20 `g732791027` ~ `g773896746` RMS 25 m (plongeon, puis rien avant 3,2 km) ; Espace p10 `g30008677` ~ `g142585938` RMS 24 m (marches>esse… les deux).
- Jade p20 `g670415034` ~ `g142702147` (miroir) RMS 44 m, roulis 0° (belvédère les deux) ; Jade p27 `g880018673` ~ `g426332545` RMS 34 m avec des suites **sans aucun module commun** (passerelles>porte>arche / toboggan>plongee) : le tracé ne les distingue pas (le décor, si).

Repro : `node outils/banc-routes/uniques/adverse/gen.cjs carte=espace etiq=apres paliers=27 && node …/ana.cjs carte=espace paliers=27 && node …/paires-roulis.cjs espace 27 114443823:897266160`.

**VERDICT : suites TIENT ; tracés NE TIENT PAS à p20-p27 (et douteux à p10 espace).** Énorme progrès sur l'avant (÷15 à ÷100), mais « aucune paire proche » est faux.
**Correction proposée** : juger l'unicité aussi sur la FORME vécue, pas seulement sur les noms — garder pour les N dernières routes une signature des 10 premières
secondes (cap déroulé, pente, roulis tous les 25 m) et refaire la route si sa signature est à moins d'un seuil (p. ex. RMS < 60 m sur 3 km ou cap < 10° et roulis < 15° RMS) ;
traiter fronde / surbaisse / plongeant comme UNE famille à p20+ ; ne pas compter le dernier module (ou seulement ceux qui commencent avant ~60 % de la route) dans l'empreinte.

## 2. Les 10 premières secondes

| | familles d'ouverture (±30° cap, 8° pente, 40° roulis) | 1er module distincts (le + fréquent) | 1er module dans les 10 s / 5 s |
|---|---|---|---|
| Jade avant p0/p10/p20/p27 | 38 / 2 / 2 / 2 | 8 / 4 / 4 / 4 (boucles 23-30 %) | 200 / 200 |
| **Jade après** | **174 / 172 / 179 / 180** | **39-41 (5-8 %)** | 199-200 / 160-177 sur 200 |
| Espace avant | 10 / 14 / 5 / 3 | 9 / 6 / 1 / 1 (rentrée 100 % à p27) | p27 : 91 / 0 |
| **Espace après** | **116 / 131 / 104 / 101** | **28 / 26 / 16 / 15 (11-26 %)** | **200 / 200** |

Restes : Espace p20 `stengel` en 1er module dans 26 % des routes ; Jade : 1 route sur 200 sans module dans les 10 s (p0, p20), p95 du 1er module à 3,4 km à p27 (7,8 s).
**VERDICT : TIENT** (le principal gain de la refonte). Douteux seulement pour Espace p20 (`stengel` 26 %).

## 3. La mémoire

(a) **Premier lancement** (50 sacs vides × 5 routes) : aucun plan par défaut (ouvertures, caps, reliefs, fins tirés à plat) ; 250/250 suites distinctes (Jade p0), 0 ouverture répétée de suite. Espace p27 : **172 suites distinctes sur 250** et 17 paires de 1res routes à < 100 m — l'espace des suites possibles à p27 est petit. **TIENT** (sauf l'étroitesse p27, voir b).

(b) **Séance de 1000 routes** :
| | redites | dont à < 400 routes d'écart | routes refaites | cashcarRU |
|---|---|---|---|---|
| Jade p0 | 0 | 0 | 0 | 4,4 Ko |
| Jade p27 | 44 (4 %) | 0 | 94 | 4,4 Ko |
| Espace p0 | 4 | 0 | 8 | 4,3 Ko |
| **Espace p27** | **234 (23 %)** | **2 (écart min 13 routes)** | **583 (58 %), jusqu'à 5 reprises** | 4,3 Ko |

Pas de cycle, aucun module ne disparaît au fil des tranches de 100. Mais **dès que la mémoire de 400 déborde, les redites reviennent** (Espace p27 : une route sur quatre) ;
et à p27 l'espace des suites est si petit que **5 reprises ne suffisent pas toujours** (2 redites dans la mémoire). Le localStorage est borné (~4,3 Ko par carte, pas « quelques centaines d'octets »). **NE TIENT PAS (Espace p27)**.
Repro : `node …/adverse/mem.cjs carte=espace quoi=longue paliers=27`.

(c) **`?pistegraine=`** : même graine = même route après 40 autres routes, 12/12 (deux maps, p0 et p27) ; graines voisines n / n+1 sans parenté (RMS 3 km 553-925 m, comme au hasard), 0/16 suites communes. **TIENT.**

(d) **La même graine générée deux fois de suite (sans pistegraine)** :
- Jade : 10/10 identiques, A-B-A 10/10. Mais **A, puis 13 autres, puis A : DIFFÉRENTE** (JADE_AMEMO garde 8 vallées, RU.P 12 plans : passé ça, le plan est retiré avec le sac du moment). **DOUTEUX.**
- **Espace : 0/10 identiques, A-B-A 0/10. BUG.** La 1re génération MARQUE sa suite (`orbUMarque` → `ruMarque`) ; à la 2e, `genCtrl` appelle `ruDeja(orbUNoms())` qui trouve… la suite de la même graine et **refait la route sur une variante**. Ex. p0 `g632215813` : `stengel>lune>plongeon>balancier>quart>chicane` puis `bosse>failleEnvers>pique>esse>rentree>plongee`. Le contrat écrit en tête de `route-uniques.js` (« le pré-bâti puis le vrai départ, REJOUER rendent la même route ») est faux pour l'espace. En jeu le pré-bâti n'engendre qu'une fois, mais **`dbgGenRoute` / `toutes.mjs` et toute map à graine fixe (`niv.graine`) ne rendent plus la même route deux fois** — les bancs de même graine des auteurs comparent deux routes différentes.
- **Correction** : `ruDeja(c,noms,graine)` → `if(h.dg===graine) return false` (ou mémoriser graine → empreinte des 20 dernières et ignorer la sienne) ; pour Jade, aligner `RU.P` et `JADE_AMEMO` sur une même taille (≥ 32) ou garder dans `RU.H` la variante `v` par graine.
Repro : `node …/adverse/mem.cjs carte=espace quoi=deux paliers=0`.

## 4. La répartition (module × palier, % des 200 routes — tableau complet : `adverse/resultats-tableau-*.txt`)

- **Jade : TIENT.** Les 41 modules sortent à tous les paliers (min 2 % à p27 ; `lacets` 0 % à p0 par construction). Les 9 petits font 51-53 % des modules joués (chacun 15-41 %, chaque grand 2-18 %) — en NOMBRE ils dominent, en temps non (1,5-3,5 s contre 8-10 s). À p27 une route n'a que **2,7 modules** dont ~1,3 grand.
- **Espace : NE TIENT PAS à p20-p27.** À p20 / p27, **lune, roue, sret, torsade, failleEnvers, astéroïde, nébuleuse, cascade = 0-1 %** ; spirale, ceinture, bobsleigh, balancier, bosses, marches ≤ 4 %. Le « sac de 20 grands » se réduit à ~6 (surbaisse, stengel, fronde, plongeant, faille, pique). Les petits = 56 % des modules à p27 (3,3 modules/route). (`lacet` 32 % à p0 → 1-2 % à p20+.)
- Ouvertures / caps / reliefs / fins : équilibrés (aucun > 25 % hors fin « virage » 24/50 à p0 et « module » 29/50 à p27 sur les 1res routes).

## 5. Direction d'ensemble et profil

| | à 3 km : cap ± / direction du point ± | fin vue du départ : |.| méd (distance en plan) | pente moy. 0-3 km |
|---|---|---|---|
| Jade avant p0 → après | 372° / 66° → 201° / 68° | 68° (1,6 km) → 53° (2,5 km) | −32 ± 14° → −32 ± 16° |
| Jade avant p27 → après | 176° / 24° → 85° / 34° | 64° (4,3 km) → 42° (5,0 km) | −8 ± 1° → **−14 ± 8°** |
| Espace avant p0 → après | 130° / 39° → 69° / 39° | **112° (1,2 km) → 39° (4,9 km)** | −45 ± 7° → −29 ± 11° |
| Espace avant p27 → après | 89° / 43° → 57° / 27° | 30° (2,7 km) → 43° (7,6 km) | −39 ± 4° → −29 ± 10° |

La pente et l'altitude se dispersent bien plus (Espace y à 3 km ± 101 → ± 372 m ; Jade p27 ± 5 → ± 339 m) ; aucune route ne remonte en moyenne sur 3 km (0-2 sur 200), ça remonte seulement par endroits.
**Mais l'espace part davantage « tout droit devant »** : la fin est à ±39-43° du cap de départ (méd), 4,9-7,6 km devant, contre ±93-139° et 1,2-2,7 km avant ; l'amplitude du cap déroulé a fondu (±354° → ±123° à p0). Or l'espace part toujours au cap 0 dans le monde (`genCtrl(rnd, (0,0,0), 0)`) : c'est littéralement « la map a globalement la même direction ».
**VERDICT : profil TIENT ; direction d'ensemble NE TIENT PAS pour l'espace (pire qu'avant), tient pour Jade.** Correction : laisser l'axe (`orbVoyAxe`, `capMax`) dériver franchement (crochet / spirale / dérive à 150-270° sur la route) ou tirer le cap de départ ; mesurer la fin vue du départ comme critère.

## 6. Jouabilité (avant → après ; pires et graines dans `resultats-<carte>.txt`)

- **Jade, l'envers a disparu de la plupart des routes. NE TIENT PAS.** Mesure du jeu lui-même (`JADE.a3.envers`, 100 routes) : routes à **0 % d'envers : 0 → 71 (p0), 82 (p10), 91 (p27) sur 100** ; moyenne 11-13 % → 1,7-2,9 %. Les normales disent pareil (130 / 149 / 165 / 174 routes sur 200 sans envers). La règle de la supervision citée dans le code (« un passage à l'envers sur CHAQUE route, 8-20 % ») a été levée en silence (`nE=h()<.3?0:1` + la note ne punit plus l'envers manquant). Décision à faire prendre à Sacha, ou rétablir `nE=1` et la pénalité. Repro : `node …/adverse/jade-envers.cjs`.
- **Jade, la vallée ne dure plus autant aux paliers rapides. NE TIENT PAS (l'annonce « dure autant qu'avant »).** Longueur méd. p0 8,0 → 8,7 km, p10 11,0 → 11,4, **p20 19,9 → 14,0 km (−30 %), p27 24,0 → 12,8 km (−47 %, 55 s → 29 s)**. L'avant dépassait sa visée de 3× à p27 ; l'après est plus près de `longueurCible` — c'est peut-être mieux, mais c'est un changement de durée de map (portails, pièces) non annoncé.
- **Rayons verticaux sous rayonPalier (creux et crêtes vives). NE TIENT PAS.** Routes dont le rayon vertical (dalle debout) passe sous rayonPalier : Espace **0 → 73 / 69 / 78 / 96** (p0/10/20/27), min **39 m** (p0 `g511999174`), 55 m (p10), 70 m (p20), **79 m à 439 m/s** (p27 `g246476614`) contre 71 / 136 / 242 / 254 m avant ; coupables : le **petit module `marche` (creux, ~52 routes à chaque palier)** et **`bosse` (crête, 12-42 routes)**. Jade p10 **0 → 100** routes (min 53 m crête, `g384192198`), p20 2 → 69 (min 83 m crête, `g142702147`) — dans `cirque/passe/ange/russes` et les liaisons neuves (`liaisonU` : « marche » 42-51°, « remonte ») ; Jade p0 et p27 : déjà sous rayonPalier avant (172 et 200 routes), un peu moins après. Crête relative max : Espace p27 15 → 57, p20 44 → 46 ; Jade p10 15 → 32, p20 31 → 58, p27 37 → 59. **Correction** : arrondir aussi les creux et borner le rayon vertical des petits modules (marche, bosse, plongeon) et des gestes de liaison à k·rayonPalier, comme le fait `crete()` pour les crêtes de Jade.
- **Roulis vu de l'horizon (ma mesure, pas celle du juge)** : pire Espace 51/46/48/46 → **62 / 68 / 66 / 70 °/s** (p27 `g991580601` 70, p10 `g208105653` 68, p20 `g841181878` 66) — au-dessus de 55 °/s : le **lacet** (13 routes à p0 et à p10), torsade (p10), plongeon (p20), mur/esse (p27). Jade 45-48 → 47 / **62** / 59 / **61** (p10 `g811886896`, p27 `g926902286`, dans épingle, cirque, passe). Temps > 60 °/s ≈ 0 (pointes de < 0,1 s). Les auteurs annoncent ≤ 60 : **DOUTEUX** — à repasser à leur `roul.cjs`/juge sur ces graines.
- **Envers espace** : routes sous 6 % : p20 0 → **49**, p27 0 → **49** (8 routes à 0 % à p27). **NE TIENT PAS** (charte R13, les auteurs le savent).
- **Lignes droites** (R > 450 m en plan) : Espace p10 pire 7,9 → **21,6 s**, p20 23,8 → **34,5 s** ; mais en droite « vécue » (< 5 °/s en 3D) : pire 1,0-1,6 → 1,7-3,6 s. Jade pire 5,5-5,6 → 6,1-16,5 s en plan, 1,6-2,8 s vécue. **TIENT** (les « droites » en plan sont des pentes qui tournent).
- **Recoupes** : aucune sous 40 m ; Jade p0 sous 60 m : 197 → 39 routes (mieux). Espace : aucune sous 300 m. **TIENT.**
- Rayons en plan sous rayonPalier : Jade p20 0 → p95 175 m, pire 360 m de route ; p27 méd 1070 → 90 m (mieux). Espace : 0 partout. **Douteux à p20 (Jade)**.
- Routes refaites (reprises d'unicité) vs non : même roulis, même envers ; rayon vertical moyen plus petit (Espace p20 216 contre 356 m) — une refaite ne prend qu'1 essai du directeur de rythme au lieu de 3.

## 7. `?sans=uniques` au bit près — TIENT

Mon empreinte (FNV sur les Float64 de la route finale + normales + marques), 24 graines au hasard × p0/p10/p27, contre `ref=88a648892` :
Espace `?sans=uniques` 72/72 ; `?sans=uniques&espace=voyages` 72/72 ; Jade `?sans=uniques` 72/72 ; `?sans=uniques&jade=avatar` 72/72 ;
nuages / ville / crypto (RU allumé ET `?sans=uniques`) 216/216 identiques. Repro : `node …/adverse/empreinte.cjs`.

## 8. Le coût — TIENT (médiane), queue douteuse sur Jade p0

Séances de 300 routes (Node, machine partagée, rodage 20) : Jade p0 méd 135 → **87 ms**, mais p95 219 → **305**, p99 289 → **447**, pire 503 → 729 ms ;
Jade p27 méd 310 → 84 ms, p95 562 → 240. Espace p0 52 → 31 ms (pire 183 → 72), p27 54 → 44 ms (pire 123 → 109, reprises comprises).
Les pires après ne se reproduisent pas seules (729 ms → 63 ms rejouée) : ramasse-miettes / charge machine. Dans les séances de 1000, pires Jade 1,5-1,7 s (même nature probable).
À re-mesurer sur le téléphone (tranches du pré-bâti) avant de conclure sur la queue de Jade p0.

## 9. Relecture du code du tirage

1. **Bug (grave pour les bancs, rare en jeu)** : `ruDeja` ne sait pas reconnaître la route de la MÊME graine déjà marquée → l'espace refait la route à chaque re-génération (voir 3d). Correctif : comparer `h.dg` / passer la graine.
2. **L'unicité porte sur des NOMS** (`ruHache(noms.join('>'))`) : deux noms qui font la même forme (fronde / surbaisse à p27) ou une suite qui ne diffère que par le dernier module passent pour « uniques » (voir 1).
3. **Mémoire 400 + reprises plafonnées (3 Jade, 5 Espace)** : au-delà la redite est acceptée sans le dire (Espace p27 : 2 redites à 13 routes d'écart sur 1000 ; 23 % au-delà de 400).
4. **`ruRefait` vide tout `RU.V` à 65 clés** : une graine en cours de reprise peut revenir à la variante 1 déjà rejetée (une reprise perdue). Mineur.
5. **Le sac vieillit sur des routes JAMAIS jouées** : `ruMarque` est appelé à chaque génération (`jadeAApplique`, `genCtrl`), donc aussi pour un pré-bâti annulé (`prebAnnule`) et pour `dbgGenRoute` / les bancs dans le navigateur du joueur (localStorage `cashcarRU`). « Deux routes de suite ne partent jamais de la même façon » vaut pour deux routes GÉNÉRÉES, pas forcément pour deux routes JOUÉES. Douteux, à vérifier en jeu (`dbgRoutesU().H.jade.n` avant/après une partie avec pré-bâti annulé).
6. Clés de mémo : `JADE_AMEMO` contient la signature du plan (complète : `pas`, `ry`… découlent du même flux `h`) — OK. `ruH` ne vérifie que `h.vu` : un objet stocké sans `der` ferait planter `ruChoix` (`ruH(c).der[champ]`) — seul ce code écrit la clé, risque faible.
7. Catalogue vide / module inconnu : `ruChoix` rend `undefined` sans planter ; `orbUJoue` saute un module qui ne tient pas (`R.ok`) ; aucune exception vue sur 3 200 + 4 000 routes. OK.

---

## VERDICT GLOBAL

**« Chaque route est unique » : vrai pour les NOMS, faux pour l'EXPÉRIENCE aux paliers rapides, et payé par des régressions de jouabilité.**
La refonte est un vrai progrès (ouvertures : 2-14 familles → 100-180 ; suites : 1-69 → 200/200 ; tracés proches ÷15 à ÷100 ; `?sans=uniques` au bit près),
mais on ne peut pas encore dire au créateur que chaque route est unique.

### À corriger avant de le dire, par gravité

1. **Jade : l'envers a disparu de 71-91 % des routes** (0 % avant) — règle de la supervision levée sans le dire ; rétablir ou faire trancher Sacha. (`jade-envers.cjs`)
2. **Creux / crêtes vives neufs** : petits modules `marche` (creux) et `bosse` (crête) de l'espace, liaisons et scènes de Jade p10-p20 — rayon vertical jusqu'à 39-83 m (rayonPalier 63-172), ~70-100 routes sur 200 par palier. (graines au § 6)
3. **Espace p20-p27 : des routes identiques sous deux suites différentes** (52 paires < 50 m sur 3 km à p27, dont `g114443823`~`g897266160` à 9 m RMS et roulis identique ; fronde ≡ surbaisse) ; 134 paires ne diffèrent que par le dernier module ; 8 grands modules à 0-1 % ; sur 1000 routes 23 % de redites et 2 dans la mémoire. → unicité jugée sur la forme des 10 premières secondes, familles de modules, plus de matière aux paliers rapides.
4. **Bug `ruDeja`** : l'espace ne rend jamais deux fois la même route pour la même graine (0/10) ; Jade non plus après 13 routes — les bancs de même graine (`dbgGenRoute`, `toutes.mjs`) sont faussés. (`mem.cjs quoi=deux`)
5. **Espace : la route part plus « tout droit devant » qu'avant** (fin à ±39-43° du cap de départ, 5-7,6 km devant, au cap 0 du monde à chaque partie).
6. **Jade p20-p27 : la vallée dure 30-47 % de moins** que l'avant (annoncé « autant ») — à faire valider.
7. **Envers de l'espace < 6 % sur 49 routes sur 200 à p20 et p27** (0 avant) ; **roulis** pointes 61-70 °/s par ma mesure (lacet, épingle, cirque) — à repasser au juge.
8. Mineurs : le sac vieillit sur des routes jamais jouées (pré-bâti annulé, bancs) ; `RU.V` vidé en bloc ; queue de temps Jade p0 (p95 305 ms contre 219) à re-mesurer sur téléphone ; localStorage 4,3 Ko par carte (pas « quelques centaines d'octets »).
