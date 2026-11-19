# ESPACE — rôle « etat » : l'état partagé entre la génération et la route jouée (2026-11-18, build 121, base a42e9ec50)

Phase TROUVER : rien de modifié dans `code/` ni dans les fichiers suivis. Mes scripts : `outils/banc-espace/etat-*.{cjs,sh}`. Mes résultats : `passation/espace-debug/etat-*.json`.

## Ce qui a tourné

| banc | ce qu'il exécute | sortie |
|---|---|---|
| `node outils/banc-espace/etat-entree.cjs paliers=0,5,10,15,20 graines=101-160 out=passation/espace-debug/etat-entree.json` | les vrais générateurs (genCtrl + pisteTordPropre, `outils/banc-routes/charge.cjs`), routes uniques contre `?sans=uniques`, 60 graines × 5 paliers × 2 = 600 routes | `etat-entree.json` |
| `node outils/banc-espace/etat-session.cjs paliers=0,10,20 n=12 out=…/etat-session.json` | 12 routes d'espace à la suite dans UN contexte (le sac de routes NON figé, comme le joueur), contre la même graine en contexte neuf | `etat-session.json` |
| `node outils/banc-espace/etat-session.cjs paliers=10 n=30 lent=1` puis `lent=10` | la même session de 30 routes, horloge du contexte ×10 (téléphone 10 fois plus lent vu par la borne de 50 ms des reprises) | `etat-session-lent1.json`, `etat-session-lent10.json` |
| un bout de Node à la main (commande plus bas) | les marques (MODMARK) remappées par pisteTord : correspondent-elles à la même abscisse ? | console |
| `outils/banc-espace/etat-lance.sh … --bride 2` (Chrome, `etat-vivant.cjs`) | le vrai chemin du joueur : nuages → portail → espace (pré-bâti par tranches) ×4 passages avec Jade/ville/nuages entre deux, sac non figé, `routeverif=1`, relevé de tout l'état (marques, MODS, OU.der, ORB5.prof, VOY, décor des géants, pièces), conduite au pilote | **N'A PAS TOURNÉ** (voir « Non vérifié ») |

## DÉFAUT PROUVÉ (par exécution)

### 1. Arrivée par un portail : le 1er module commence 1,2 à 1,7 s après l'entrée, sous l'effet de l'entrée en orbite — routes uniques seulement
- **Mesure** (`etat-entree.cjs`, 60 graines par palier) : l'abscisse du 1er module nommé de la route installée, divisée par la vitesse réelle du joueur au palier
  (`vPalier × élan`, la règle du jeu `elanReel()` / `EL5` : 1,8 au palier 0 → 1 au palier 25 — c'est la vitesse à laquelle on sort d'un portail ; elle n'est pas
  remise à zéro par newTrack).

  | palier | 1er module < 1,9 s après l'arrivée | min | médiane | ouvertures en cause (< 1,9 s) | `?sans=uniques` (< 1,9 s · min · médiane) |
  |---|---|---|---|---|---|
  | 0  | **23/60** | 1,67 s | 3,72 s | direct 8, mur 8, plongeon 4, bosse 3 | 0/60 · 4,49 s · 5,38 s |
  | 5  | **21/60** | 1,36 s | 3,03 s | direct 12, mur 6, plongeon 2, bosse 1 | 0/60 · 4,81 s · 5,64 s |
  | 10 | **18/60** | 1,16 s | 3,39 s | direct 11, mur 4, bosse 2, plongeon 1 | 0/60 · 5,08 s · 5,77 s |
  | 15 | **16/60** | 1,21 s | 3,47 s | direct 10, mur 3, bosse 2, plongeon 1 | 0/60 · 3,06 s · 3,29 s |
  | 20 | **20/60** | 1,32 s | 2,91 s | direct 14, mur 3, bosse 2, plongeon 1 | 0/60 · 3,50 s · 3,87 s |

  Exemples (graine, ouverture, 1er module, abscisse, temps) : g101 p10 plongeon à 270 m = 1,16 s ; g104 p10 bosse 270 m = 1,16 s ; g111 p15 `direct` → **ceinture** 378 m
  = 1,21 s ; g111 p20 `direct` → **stengel (le dévers inversé)** 540 m = 1,36 s ; g133 p20 **mur** (dalle couchée 62-72°) 522 m = 1,32 s ; g104 p5 `direct` → balancier 1,36 s.
- **Le seuil 1,9 s et pourquoi il compte pour le joueur** : en entrant dans l'orbite, `orbWarp()` (gameplay/portail-passage.js:12) pose un flash bleu-blanc
  (`rgba(140,210,255,.85)`), une secousse (`shake .45`) et l'effet de tunnel `ORBFX.warp=1`, qui décroît linéairement en **1,9 s** (`ORBFX.warp-dt/1.9`, ligne 27) et commande
  le flou radial de l'image (`sfxT=max(ORBFX.warp*.95,…)`, moteur/boucle-6-hud.js:152). En même temps : le voile du portail s'efface en 0,5 s (`portVoileSort`), le ciel bascule
  en 1,2 s (`BIO_PORTAIL`), la bannière « NIVEAU n — EN ORBITE » part (lvlAnnonce). Sur un tiers des routes, le joueur est donc déjà DANS un mur couché, une bosse, un plongeon,
  une ceinture ou un dévers inversé alors que l'image est encore floutée par le tunnel : il roule une figure qu'il n'a pas vue venir. Avant les routes uniques, jamais (≥ 3,06 s).
- **Origine : les routes uniques**, et seulement elles. `orbUJoue` pose `ORB5.s0U=150` (le départ tenu de pisteTord : 150 m au lieu de 450) et place le 1er module à
  `deb=max(150,1.2·vC)+85` m (maps/orbite-uniques.js:105 et 134), avec les ouvertures `direct` (droit dans le 1er module), `mur`, `plongeon`, `bosse` ; route-sans-haut.js:216
  (`ORB5.s0U?Math.max(ORB5.s0U,1.2*vC)`). `?sans=uniques` le supprime (0/300). **`?sans=portv` n'y change rien** : la route est la même au bit près avec ou sans le pré-bâti
  étalé (97/97 et 23/23 du lot portv) et le chemin warp → module est le même ; ce que portv change, c'est seulement quand l'annonce part (retenue jusqu'à l'ouverture du voile,
  `pvAnn`), ce qui met le warp exactement au moment où la caisse est lâchée (soupçon S1, pas mesuré).
- **Pourquoi la vérification d'avant ne l'a pas vu** : ESPACE-EN-JEU.md a roulé en départ direct (`?carte=espace`), où la caisse part de la vitesse de lancement (pas de warp,
  pas de portail) : « le 1er module dès 234 m : la caisse est lancée, pas de vol, pas de mort ». Au portail, elle arrive à pleine vitesse.
- **Gravité : fort** (un tiers des entrées dans l'espace, à tous les paliers ; la figure commence pendant le flou). Ce qui est mesuré : le temps ; ce qui est déduit des constantes
  du code : la visibilité sous le warp (pas de photo prise).
- **Piste** : à l'arrivée par un portail (runStats.zones > 0), un départ tenu d'au moins ~2,5 s à la vitesse réelle (≥ la durée du warp + le voile) avant le 1er module, ou
  ne pas tirer `direct`/`mur`/`plongeon`/`bosse` en ouverture d'une route d'arrivée ; ou faire passer l'ouverture du plan APRÈS `max(450, 2,5 s × v réelle)`.

## RÉSULTATS NÉGATIFS PROUVÉS (l'hypothèse « état partagé écrasé » tuée là où elle a été mesurée)

- **Les marques suivent la route remaniée par pisteTord** : 18 routes (graines 101-106 × paliers 0/10/20), pisteTordPropre change le nombre de points de contrôle
  (ex. 136 → 638) et réécrit les indices de toutes les marques ; l'abscisse de chaque bout de marque (i0, i1) avant/après diffère au plus de **16 m** (une route de 8,9-13,6 km).
  Commande : le bout de Node « marques » ci-dessous. Seuil : < ½ s de route à tout palier → aucune marque ni zone n'est posée pour une autre partie de la route.
- **Le sac non figé (2e, 3e … 12e route d'une session)** : `etat-session.cjs`. Les routes diffèrent de la même graine en contexte neuf (1/12 identique à chaque palier — voulu :
  le sac se souvient), mais rien ne se dégrade : modules nommés par route 6,58 / 5,25 / 4,5 (session) contre 6,17 / 5,08 / 4,42 (neuve) aux paliers 0/10/20 ; part la tête en bas
  11,0 / 13,2 / 11,5 % contre 10,5 / 13,6 / 12,3 % ; temps fort raté 0 / 0 / 1 contre 1 / 0 / 1 ; aucune suite de modules rejouée dans 30 routes (palier 10).
  (Le roulis R3 du banc Node est mesuré aux points de contrôle et sature à 23-36 °/s : il ne sépare rien, je ne m'en sers pas comme preuve.)
- **La borne de temps des reprises (50 ms, ville-entree.js genCtrl)** ne change pas la route sur un appareil lent : 30 routes d'une session au palier 10, horloge ×1 contre ×10 :
  **30/30 identiques**, mêmes reprises. (Elle commencerait à jouer au-delà ; pas atteint.)

## LU DANS LE CODE (pas exécuté — sert de carte, pas de preuve)
- Ce que la génération de l'orbite écrit hors des échanges du pré-bâti (`prebEchange`) : `ORB5.prof/s0U/descZ`, `OU.der/kAx/uw/rejet`, `VOY`, `SENS`, `TOT_AX`, `sAx`,
  `ORB_UG`, `ORB_PIOCHE`, `RYTHME.der`. Lecteurs trouvés : tous dans la génération (pisteTord, orbModules, orbUJoue), aucun en course. `VOY` est relu au passage par le
  décor (`voyDecorPose`, `orbVoyAxe`) : la dernière génération d'orbite avant le passage est celle de la route d'en face (rythmeMeilleurG rejoue le meilleur essai), sauf avec
  `?routeverif=1` où la référence d'un trait passe AVANT (même entrées, même VOY).
- Ce que le joueur lit en course est échangé ou rebâti au passage : `MODS`, `MODMARK`, `TORD.{on,N,ctrl0,seed,info,pente,murs}` (prebChampsDe), le décor des géants
  (`geantsPose` → `voyDecorPose`, bâti au passage depuis MODS / pts / L de la route installée), les zones de saut refusé `VOY_D.zonesSaut` (vidées par `geantsVide` à chaque
  buildTrack, donc pas de fuite vers la map suivante), `gK()` (lit `LVL.espaceA`, la cible posée d'un coup par lvlGo, pas le fondu).

## SOUPÇONS NON PROUVÉS
- **S1 (portv × uniques)** : avec le lot portv, `orbWarp` est retenu (`pvAnn`) et part à l'ouverture du voile, au moment même où la caisse est lâchée ; sans le lot il part
  dans l'image de construction (un long dt en mange une partie). Le warp « plein » tombe donc exactement sur le 1er module des routes uniques. À mesurer : `ORBFX.warp` et `s`
  image par image après le portail (le banc `etat-vivant.cjs` le relève : colonne `tl` = [ms, s, mode, km/h, PVE.ph, PORTV.att, lieu, ORBFX.warp, BIO.dip]).
- **S2 (palier de génération ≠ palier du passage)** : la route d'en face est tirée au palier du début du pré-bâti (`PREB.eng`), jusqu'à 20 s × `prebAvanceK` (≤ 3) = 60 s
  avant le portail ; tout ce que les routes uniques calculent à partir du palier (rayon tenable `rayonPalier`, `Tt`, `court` < 40 s, `DUR9` < 30 s, `kC`=0,72, `RV` des
  petits modules) est donc calé sur une vitesse plus basse si le moteur a monté entre-temps (un palier tous les ~100-230 pièces). Pré-existant (prebPalier, voulu) mais les
  routes uniques en dépendent davantage. Non mesuré : combien de paliers un joueur gagne en 20-60 s.
- **S3 (reprise sans directeur de rythme)** : dans une session, dès la 10e route d'espace au palier 10, une route refaite n'a qu'UN essai et pas de fiche de rythme
  (`RYTHME.der.note = 1e9`, 3/12 routes de `etat-session.cjs` au palier 10) : la qualité géométrique de ces routes n'est plus jugée. Je n'ai pas trouvé de dégradation
  mesurable (voir plus haut), mais le banc Node n'a pas la finesse du juge (R3 saturé).
- **S4 (le contrôle des routes du lot portv)** : `rvInstalle` compare `r.egal` sur la seule géométrie (moitié gauche de l'empreinte) ; les marques sont dans `r.egalMk`.
  Les « 23/23 ÉGALES » de portv.md sont des routes ; les marques ne sont signalées par vivant-lire.cjs que par « (marques ≠) ». Je n'ai pas retrouvé les JSON de ce banc
  pour relire `egalMk` sur l'espace.

## NON VÉRIFIÉ
- **Rien dans Chrome.** Le banc du vrai chemin (`outils/banc-espace/etat-vivant.cjs`, lancé par `etat-lance.sh`) est prêt et vérifié à la syntaxe, mais le verrou commun
  des bancs (`~/cash-car/verrou-banc.sh`) a été tenu sans interruption par d'autres sessions pendant ~65 min (finition-jade, ville-cyber-c, finition-modules, finition-grotte,
  ville-cyber-a, auteur-garage-donuts, ctl-integ-121 ; une douzaine de sessions en file) : je l'ai retiré de la file sans l'avoir eu. Donc NON VÉRIFIÉ en jeu : (B) la route
  pré-bâtie par tranches au portail et (C) le 2e/3e passage — marques, MODS, OU.der, ORB5.prof, VOY et décor des géants de la route installée, distance des pièces à la route,
  caméra sous la dalle, roulis de l'horizon (°/s), chutes, morts ; le départ direct comparé ; `?sans=uniques`, `?sans=portv`, `?sans=portvmem` sur ces relevés.
  À lancer (≤ 11 min, s'arrête seul) :
  `outils/banc-espace/etat-lance.sh "$PWD/passation/espace-debug/etat-vivant-1.json" "$PWD/passation/espace-debug/etat-vivant-1.log" --bride 2 --roule 18 --max 11`
  puis la même avec `--q sans=uniques` et `--q sans=portv`.
- La mort / seconde chance / REJOUER sur une route d'espace (lu seulement : la seconde chance repart sur la même piste, rien n'est régénéré).
- La mémoire des routes (`?sans=portvmem`) pour l'espace : non relancée (portv.md § 7.1 : orbite fantôme → différente, mémoire remise → égale, Node).
- La visibilité réelle sous le warp (aucune image prise).
- Rien sur le téléphone.

## INCIDENT DE BANC (à savoir)
À 04:01, en arrêtant mon premier lancement (la commande `timeout` n'existe pas sur ce Mac), la suite `; verrou-banc.sh rendre` de ma ligne a tourné alors que je n'avais pas
le verrou : elle a pu effacer le verrou que tenait alors **trainees-voitures** (pris à 1794970851) ; **finition-jade** l'a repris à 1794970891. Deux bancs Chrome ont pu tourner
en même temps pendant quelques minutes (leurs mesures de temps de cette fenêtre sont à regarder avec méfiance). Mon lanceur `etat-lance.sh` ne rend plus le verrou que s'il est à lui.

## Commandes
```
node outils/banc-espace/etat-entree.cjs paliers=0,5,10,15,20 graines=101-160 out=passation/espace-debug/etat-entree.json
node outils/banc-espace/etat-session.cjs paliers=0,10,20 n=12 out=passation/espace-debug/etat-session.json
node outils/banc-espace/etat-session.cjs paliers=10 n=30 lent=1  out=passation/espace-debug/etat-session-lent1.json
node outils/banc-espace/etat-session.cjs paliers=10 n=30 lent=10 out=passation/espace-debug/etat-session-lent10.json
node -e "const B=require('./outils/banc-routes/charge.cjs');const S=Q=>{const s=[0];for(let i=1;i<Q.length;i++)s.push(s[i-1]+Q[i].distanceTo(Q[i-1]));return s;};for(const p of [0,10,20])for(const g of [101,102,103,104,105,106]){const r=B.piste('espace',g,p);const a=S(r.ctrl0),b=S(r.ctrl);let mx=0;r.marks.forEach((m,i)=>{const m0=r.marks0[i];if(m0)for(const k of ['i0','i1'])mx=Math.max(mx,Math.abs(b[Math.min(b.length-1,m[k])]-a[Math.min(a.length-1,m0[k])]));});console.log(p,g,Math.round(mx));}"
outils/banc-espace/etat-lance.sh <sortie.json> <journal.log> --bride 2 --roule 18 --max 11 [--q sans=uniques]   (Chrome, sous le verrou — pas tourné)
```
