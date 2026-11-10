# VITESSE-FLUIDE — saccades à grande vitesse sur l'iPhone 13 Pro (passation, 7-8/11/2026)

Branche `vitesse-fluide` (worktree `~/cash-car/vitesse`), locale, jamais poussée. Tout ce qui suit est sur **vrai téléphone récent** (`TEL_NATIF`, palier PAL 2) ; l'ordinateur (`?tel=0`, Vercel) ne change pas d'un bit.
Tests : `node passation/banc-perf/preuve-gouverneur.cjs` · `node passation/banc-perf/preuve-grotte-travailleur.cjs` (statiques, 2 s) · banc Chrome `python3 outils/banc-perf/vitesse.py {capture|paliers|depart|profil|portail|graphe} …` (verrou : `sh ~/cash-car/verrou-banc.sh prendre "<qui>"` / `rendre`).

## 1. Le diagnostic (build 6, boîte noire du 13 Pro)
Le p50 suit le **TEMPS de jeu**, pas la vitesse ni le palier moteur : jade 191 s p50 16 → 38 ms au calage à 30 ; espace 504-520 s p50 53 → 83 ms (12 i/s) malgré le 30 calé et l'échelle de qualité au plancher. Le « palier 16 » de Sacha est le moment où il sent la bride d'iOS (plusieurs minutes de jeu). 83,3 ms = exactement 5 images d'écran : iOS ralentit lui-même l'affichage. Même constat que la séance du 26/10 (branche `mobile-perf`) : jouer les premières minutes à 60 chauffe la puce, caler à 30 ensuite est trop tard.

## 2. Le gouverneur thermique (`code/moteur/gouverneur-thermique.js`, reporté de mobile-perf)
- **Dose de chaleur sans capteur** `MOB_S.D` (secondes équivalentes de 60 i/s) : +1/s en course à 60, +0,5/s calé sur 30, +0,3/s au menu, −0,25/s au repos (pause, mort, arrière-plan, trou > 1 s). Plafond 230, sauvée dans `localStorage cashcarMobGouv` (périmée après 10 min). État iOS : événement `cc:thermique` (`dbgThermique(n)`), ≥ 2 pose la dose à 160.
- **Le 30 calé dès le départ (PAR DÉFAUT)** : `MOB_G.g30` vrai → `mobChaud()` toujours vrai en course (cadence.js `cadFin`/`cadPose` : calage dès la 1re image, `CAD.gel`, la sortie réactive ne joue pas). `?mob_g30=0` = la dose d'avant (calage à 160, ou à 50 si la cadence réactive cale). `?mob_gouv=0` = plus de gouverneur ; `?cad30=0` = avant tout.
- `cadence.js` : la période d'écran est lue en **médiane** de 90 images (`?mob_ecran=0` = l'ancien minimum, qui lisait 144 Hz).
- Crochets : `dbgGouv()` (dose, `gpu`, `g30`…), `dbgGouv(n)` pose la dose, `dbgThermique(n)`, `dbgGouvPaliers()`.

## 3. Les paliers de coût GPU (`code/moteur/gouverneur-paliers.js`, par la dose)
Le départ statique de la passe 3 (P2 : halo ½, ombre 768, plafond 1,25, ciel ½…) est le palier 0. Par `imgRegle` (`rendu/nettete-qualite.js`) :
| palier | dose | ce qui est posé |
|---|---|---|
| 1 | ≥ 60 (~2 min de course) | plafond 1,1, halo ½ à 2 mips |
| 2 | ≥ 100 (~3 min 20) | plafond 1,0, halo coupé, ombre 512, ciel lisse 1/4, traits ×½ ; plancher d'échelle QL au cran max ; vent et émission ×½ ; **régime chaud** (`mobh-regime-chaud.js`, actif par défaut à dose ≥ 100) |
| 3 | ≥ 140 (~4 min 40) | plafond 0,8, ciel lisse 1/8 |
- **Une seule bascule par palier** : un seul appel `imgRegle` (toutes les clés redites ; descente idem ; retour au 0 par `reset`). Chaque appel d'`imgRegle` repasse sinon par `applyDPR` (réallocation de toutes les cibles) — P2 a retiré `curDPR=-1` et différé le `reset` à la microtâche.
- **Montée immédiate, descente lente** : un palier ne baisse qu'une minute après le dernier changement, un palier à la fois.
- **Remontée de l'image** (paliers négatifs : frais + fluide 60 s → plafond 1,5, puis halo plein/ombre 1024) : **INACTIVE par défaut** (`?mob_raise=1`). Raison : sous le 30 calé la dose monte de 0,5/s, la remontée partait à ~60 s et retombait à 120 s (deux réallocations pour une minute d'image plus belle), et le build 13 avait 15 gels > 1 s.
- Interrupteurs : **`?gouv=max`** = aucun palier (et pas de régime chaud par défaut) ; `?mobh_chaud=0` = pas de régime chaud, `?mobh_chaud=1` = chaud dès que le gouverneur dit chaud.

## 4. Le pré-bâti lissé et la règle « jamais d'un bloc » (`code/moteur/piste-prebati.js`, `gameplay/portail-passage.js`)
Mesuré (Mac ×4, 10 s par palier moteur 4/10/16, canyon/nuages) : le **seul coût JS par image qui grandit avec la vitesse** est le pré-bâti de la piste suivante (canyon : `loop` 8,9 → 18,0 → 19,8 ms dont `prebTick` 0 → 8,8 → 9,4). Hors pré-bâti, `loop` ne bouge presque pas (8,9 → 10,3 ; render 5,2 → 6,0).
Sur téléphone, `?prebfin=0` = avant :
- tranche qui **suit le reste à faire** (reste estimé ÷ images avant le portail, plafond 16 ms, base 2,5-4 ms) au lieu de l'urgence automatique 9/14 ms ;
- départ plus tôt à grande vitesse : avance (20 s, grotte 75 s) × clamp(v/90, 1, 3) ;
- **au passage du portail, si le pré-bâti n'est pas fini** : la caisse est tenue (`PORTV.att`, voile posé), le travail continue par tranches de 26 ms, une par image, jusqu'au bout (25 s au plus, puis d'un trait comme avant) — `prebRetient`. Plus jamais d'un bloc ;
- la pause travaille à pleine tranche (12 ms) ; la mort et le menu le faisaient déjà (`prebDepTick`).
- Mesure : neutre sur le CPU total (le travail est conservé), aucun bloc au passage, `dbgPrebati()` expose `lisse`, `tenusSousVoile`, `msSousVoile`, `cpuMaps`.

## 5. La grotte dans un travailleur (`code/maps/grotte-travailleur.js`) — le vrai gain
Le pré-bâti de la grotte (≈ 7,3 s de CPU ×4) était dominé par `grtCreuse1` (creusement de la grille de densité) puis `grtMailleNetsG` (maillage). Les deux sont du **calcul pur sur tableaux typés** : ils tournent dans un Web Worker (Blob, comme le canyon), avec les **mêmes fonctions** (sources par `toString`), mêmes entrées → **même résultat au bit près**.
- **Creusement** : `grwCreuse` (appelé dans `buildGrotteG`), entrées = 17 tableaux de la route + bornes + `ROAD_HALF`/`THICK` du travail ; sortie = grille regroupée en 5 tampons transférés. Le fil attend par `yield 'attente'` (`prebTravaille` rend la main sans brûler la tranche).
- **Mailles** : après décors et lumières, UNE copie de la grille + salles/lac/eau/piliers/lumières par tronçon ; `grtTronconG` tire les tronçons dans l'ordre de la file, 12 d'avance (`grwMailleDe`) ; en course ils sont déjà prêts. `grwFin` (grotteVide) libère.
- **Repli automatique sur le fil** (comme avant) : pas de Worker, création/envoi/erreur, tranche infinie pendant l'attente (le travailleur est terminé), bâti « d'un trait ». Jamais sur ordinateur. **`?grotteworker=0` = avant.**
- **Preuves** : `preuve-grotte-travailleur.cjs` (vm : grille identique + 104 tronçons / 28 364 triangles identiques en P, F, L, nt + tous les replis) ; vrai jeu ×4 (`vitesse.py portail`, p16, 14 000 m) : hash de grille `8d722a26` et 517 808 triangles identiques aux deux chemins, 1 121/1 121 tronçons du travailleur.
- **Mesure** : CPU du fil pour la grotte **7 348 → 1 545 ms (−79 %)** ; images > 50 ms 5,6 % → 1,0 % (creusement seul) puis 2,4 % → 1,6 % (avec mailles). Reste sur le fil : route `pisteRoute` (~0,4 s), `BufferGeometry` des tronçons (0,4 s), décors/lacs (0,4 s).
- **Mémoire** : le travailleur garde ≈ 9-10 Mo de grille + 1,8 Mo de tampons + ≤ 12 tronçons d'avance jusqu'à `grotteVide` (noté dans la boîte noire).

## 6. Les no-go chiffrés
- **`pisteRoute` dans le travailleur** : 330 lignes (depart-avance.js 91-420) pleines de three.js (CatmullRomCurve3, Vector3/Quaternion que tout le jeu relit), générateurs de modules à état global, flux `rnd` partagé ; gain ≤ 0,4 s de CPU par zone (413 ms sur 48 s d'approche d'une grotte, 391 ms nuages→dunes) → jours de travail pour ≤ 1,5 ms/image pendant la fenêtre. Non fait.
- **Le graphe de scène** (p10 ×4, 150 images ; nuages/canyon/forêt) : 469/191/299 objets atteints (513-515 enfants de la racine déjà sautés par `scene.updateMatrixWorld` gelée), 292/118/192 `updateMatrixWorld` et 133/103/135 `updateMatrix` par image (73-87 % des `matrixAutoUpdate` immobiles), 113/73/91 appels de dessin, 428/361/378 uniformes, 117/70/128 « doublons » de matériaux (borne haute). `matrixAutoUpdate=false` ≈ 0,1-0,3 ms avec risque d'image ; matériaux partagés ≈ 0,3-0,5 ms sans preuve d'identité. **Le goulot est le nombre d'appels de dessin (≈ 70 µs ×4 chacun)**, pas le graphe : c'est le terrain de P3 (fusions, transparents). Non fait.
- **(e) grotte à pas grossier** : changerait la forme de la grotte (A/B pour Sacha) ; rendu inutile par le travailleur.

## 7. Les interrupteurs (adresse, banc)
| | effet |
|---|---|
| `?gouv=max` | aucun palier de coût GPU, pas de régime chaud par défaut |
| `?mob_gouv=0` | plus de gouverneur du tout |
| `?mob_g30=0` | le 30 n'est plus calé d'office : la dose d'avant (160, ou 50 si la cadence réactive cale) |
| `?mob_raise=1` | la remontée de l'image (inactive par défaut) |
| `?mobh_chaud=0` / `=1` | pas de régime chaud / chaud dès que le gouverneur dit chaud |
| `?mob_ecran=0` | la période d'écran en minimum (avant) |
| `?prebfin=0` | pré-bâti comme avant (urgence 9/14 ms, retenue au passage coupée) |
| `?grotteworker=0` | creusement et mailles de la grotte sur le fil principal |
| `?mob_poly=0` | pas de plafond de polyphonie des bruitages sous la chaleur |
| `?sonde=0` | coupe les sondes « fluide » (et du serpent) |
Dans l'app il n'y a pas d'adresse : les interrupteurs servent au banc ; en pratique on joue sur les valeurs par défaut (`code/moteur/gouverneur-*.js`, `MOB_G`, `MOB_PP`, `MOB_R`, `PREBF`).

## 8. Lire la boîte noire (`sh ~/cash-car/perfmob/main/outils/banc-perf/boite-noire.sh`, par câble, lecture seule)
Chaque ligne : heure, ×n (répétitions), genre, message, version. Le `t` des lignes est le temps de **session** (depuis le lancement), menus compris.
- **`fluide`** (toutes les 4 s en course, si p50 > 22 ms — 38 quand le 30 est calé — ou une image ≥ 100 ms ; 40 lignes au plus) : `t · carte · palier moteur · km/h · p50 / p90 / pire · cadence 30|60 · cran QL · tas · dose N chaud|froid pal=P basc=B`. `pal` = palier du gouverneur (0-3, négatif = remonté), `basc` = bascules cumulées depuis le lancement. **Lecture** : si le p50 se dégrade avec le temps quel que soit le palier moteur, c'est la chaleur ; une image à 83,3 ms = 5 images d'écran = bride d'iOS.
- **`gel`** (une image > 1 s, onglet visible) : `durée · classes du body · pal=… basc=…`. **Pour savoir si un gel est tombé sur une bascule** : comparer le `basc=` du gel à celui de la ligne précédente (ou du gel d'avant) ; un `basc` qui a bougé entre les deux = une bascule d'`imgRegle` dans l'intervalle. Les gels à l'écran `inGarage`/`play` ne se lisent pas pareil (le garage n'a pas de gouverneur).
- **`grotte`** (une ligne par grotte creusée sur téléphone, 12 au plus, `n` = nombre de grottes) : **`travailleur`** avec en 3e champ « N ms de creusement, attente N ms · le travailleur garde ≈ X Mo de grille + 1,8 Mo de tampons + ≤ 12 tronçons d'avance » ; ou **`repli <raison>`** : pas de Worker · coupé (?grotteworker=0) · création : <erreur> · envoi : <erreur> · erreur : <message> · passage sans voile (tranche infinie) · bâti d'un trait (sans tranches) · mailles : <erreur>. Un `repli` répété = le Worker en Blob est refusé par le WKWebView : le jeu marche comme avant, sans le gain.
- `memoire` (fin de partie) : textures, géométries, programmes. `serpent` : les trous du chargement. `panne` : erreurs du pré-bâti.

## 8b. Le son (audit énergie du 8/11, `vitesse.py son|energie|poly`)
- **Mesuré** (p16 nuages, 30 s en course) : aucun ScriptProcessorNode ; AudioWorklet seulement pour moteur-vivant (éteint sans `?moteurvivant=1`) ; 1 AnalyserNode lu ~9 fois/s ; pas de fuite (sources démarrées ≈ finies). Les créations : gain ~52/s, oscillateur ~37/s, BufferSource ~21/s, biquad ~13/s. Le JS du fil principal est petit (jouer() de la page du morceau 0,39 ms/img ×4). Le gros est le fil de RENDU audio : CPU du processus de rendu par image (×1 CPU) ≈ 11 ms tout coupé, 15 sans musique, 18-22 tout allumé (bruit ±3) → le son pèse +4 à +10 ms/image, musique et bruitages à parts comparables. `renderCapacity` n'existe pas dans ce Chrome.
- **La musique de course est jouée EN DIRECT** : `assets/audio/pouce-bleu-jeu.js` tire un des ~19 morceaux de Pouce bleu ; 14 sont des GÉNÉRATEURS (`genv`, notes posées en direct sur le contexte du jeu) et ~17 ont une page « tout » (`PERSO`, refontes de Léo) ; AUCUN n'utilise les PALIERS FIGÉS (`type 'paliers'` : il faudrait `place[id]='bleu'` et pas de `PERSO.tout`). Les rendus existent (`assets/audio/music/paliers/rendus/` : ciel-30, glisse-fusion, neon-noir, nuit-de-velours, penthouse, siffleur-30 ; 35 Mo, 7 à 30 palier .m4a chacun) mais pour d'AUTRES versions (anciennes) ou d'autres morceaux. Jouer les paliers figés au lieu du direct n'est donc PAS « le même morceau, le même mixage » : il faudrait rendre les 19 morceaux (chaîne d'assets, ≈ 100 Mo) ou restreindre le tirage aux 6 morceaux rendus (décision d'oreille). **Non fait.**
- **Fait (b)** : sous le gouverneur seulement (palier ≥ 2, EN COURSE, `?mob_poly=0` = avant), `window.__ccPoly.on` est vrai ; `sfx.js` (`play`) ramène alors la polyphonie de chaque son à la moitié de son `max` (au moins 1 ; les boucles et `force` exemptés ; les plus anciennes voix s'effacent en 15 ms comme d'habitude) et ignore les sons de moins de 60 ms (hors boucle). Test déterministe dans le vrai jeu : `piece` 6 → 3 voix, `combo.frappe` 6 → 3, `frole` 3 → 2 ; sur les 104 sons décodés, seuls `ui.curseur` et `ui.appui` (interface, jamais joués en course) durent moins de 60 ms. Effet réel petit (le pilote automatique ne coupe qu'une voix en 30 s) : les bruitages ne sont qu'une part du coût, la musique en direct reste le gisement.

## 9. État et pièges
- Cache `cashcar-v1211`+ (sw.js) ; `node code/assembler.cjs --depuis-morceaux` après une modif de morceau (l'assembleur refuse si index.html ET les morceaux ont changé depuis le dernier commit) ; 4 gardes : `garde-burnout.sh`, `garde-charte.sh`, `garde-allege.sh` (le mot IS_MOBILE dans un commentaire d'un morceau la fait échouer), `outils/garde-demarrage.cjs`.
- Fusionnée avec : `serpent-fluide` (sonde) et `perf3/P2` (`imgRegle`). À fusionner avec `perf3-main` côté intégrateur (sw.js, ORDRE.txt : 3 morceaux de moteur/ + `maps/grotte-travailleur.js`).
- Mesures sur Mac : charge < 8 avant tout banc, un seul Chrome à la fois (verrou). Un banc sous charge 100+ donne des temps faux ; les compteurs et les hashs, eux, restent valables.
- Non mesuré : le Worker en Blob dans le WKWebView du 13 Pro, la mémoire du travailleur sur téléphone, les gels sur bascule — ce sont les prochaines lignes de la boîte noire à lire.

## 10. Musique figée (9/11, branche `musique-figee` : `1dfcb077` outil + 10 morceaux, `f9d9f643` jeu, détail dans `passation/MUSIQUE-FIGEE.md`)
- **Quoi** : sur téléphone (ALLEGE = vrai téléphone ou `?tel=1`), la musique de course ne tourne plus en direct (pages à ~50-110 oscillateurs vivants au départ, ~190 mesurés au palier 16, chaleur du processeur audio) mais en 10 paliers pré-rendus, enchaînés sur la mesure par `PalLecteur`. Ordinateur : direct, inchangé.
- **Les 10** : `bleu-4830` (flamme de tonnerre), `pal-asphalte`, `bleu-7299` (enseigne de jade), `bleu-9664` (mirage), `bleu-8338` (rubis ultra), `bleu-6562` (pluie d'argent), `bleu-1275` (feu de luxe), `bleu-2221` (cobra ultra), `bleu-6104` (tonnerre deluxe), `pal-aura-30` (intro de 4 mesures, boucle de 2 phrases = 16 mesures). Les 9 autres morceaux du tirage restent en direct.
- **Format** : `assets/audio/music/course/<id>/p1…p10.m4a` (AAC 96 kbps, 44,1 kHz, 3 moteurs par palier, représentant 3g+2 remappé par `pbjTier`), `index.json` par morceau, `course/index.js` (`window.PALIERS_COURSE`), `rapport.json`. 101 fichiers, 26,4 Mo ; partent aussi sur le site (un téléphone en navigateur est ALLEGE) et dans l'app. La boucle est exacte à l'échantillon par le marqueur `iTunSMPB` (amorce + N valides) : le décodeur d'Apple ignore une liste d'édition MP4 écrite à la main. NE JAMAIS réencoder ces fichiers.
- **Chaîne de rendu** : `node outils/musique/rendre-paliers.mjs [--ids a,b] [--force] [--det] [--variantes] [--sortie dossier]` : Chrome headless + `palRendPalier` (OfflineAudioContext, élan + boucle) sur le texte patché (`RYTHMIQUE` pour asphalte et aura), puis `boucle_aac_pur.py` (afconvert + réécriture iTunSMPB) ; il vérifie chaque fichier (`afinfo`, décodage Apple, `decodeAudioData` Chrome). ≈ 10 min par morceau, sous le verrou du banc ; à REFAIRE quand une page-source change.
- **Interrupteurs** : `?musique=live` = le direct partout (A/B) ; `?musique=fige` = le figé même sur ordinateur (banc) ; défaut = figé si ALLEGE. `?pouce=<id>` impose le morceau. Le drapeau est lu au chargement de la liste (`figeOn()`), car le jeu pose `window.__ccAllege` après le chargement du fichier.
- **Repli** : un fichier absent, une fiche absente ou un décodage faux (longueur ≠ N) → la page en direct du même morceau joue (`joueurFige`), note boîte noire `musique` (« figée <id> » ou « live (repli : …) »). Prouvé : p1 retiré → direct (49 osc).
- **Preuves** : fumée son 4 cas VERT (ordi 59 osc, `?tel=1&musique=live` 60, `?tel=1` figé 21 = plus aucun oscillateur de musique, repli 49) ; longueur exacte 10/10 (Apple, Chrome, afinfo) ; RMS croissant avec le palier.
- **Limite connue** : les boucles se répètent à l'identique (14-33 s) ; le direct variait de 0,3 à 3 dB par octave d'une phrase à l'autre (jusqu'à 6 dB sur une mesure pour `bleu-6104`, remplissages). Le figé est donc plus prévisible, un peu moins vivant.
- **À mesurer** : le CPU par image et la chaleur sur le 13 Pro (figé vs `?musique=live`, boîte noire `musique`/`fluide`). Au Mac, `vitesse.py energie <dossier> 16 "&pouce=bleu-4830" nuages:midi 40 1 1 1` contre `&musique=live&pouce=…` : fait une fois sous charge ~100 (sans valeur), à refaire sous charge < 8.
- **À la fusion** : `sw.js` posé v1373 (main était v1384) → renuméroter ; réassembler (`--depuis-morceaux`) ; 4 gardes.
