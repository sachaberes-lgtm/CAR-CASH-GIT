# ÉCONOMIE — les prix, aujourd'hui (réécrit le 2026-11-05, jury final ECO-09 ; table générée depuis CARS et CAR_UNLOCK)

> L'ancienne version (mesure du 14/10, AVANT le ×10 des prix du 25/10) est gardée en bas, sous « ARCHIVE ». Ses prix (« ELDORADO 10 000 $ », « la gamme à l'argent fait ~34 M$ ») ne sont plus ceux du jeu.

## 1. Les caisses actives : 50 sur 91 lignes (les autres sont retirées, leur index reste pour la sauvegarde)
Prix en dollars du jeu (« $ »). **LA HONTE** (index 0) est la caisse du départ. Une rareté « déduite » vient de la règle de `carRar` (aura-banque-contrats.js) : boutique € = légendaire · prix ≥ 1 M = épique · ≥ 20 k = rare · sinon commune.

| n° | caisse | rareté | prix · condition |
|---|---|---|---|
| 0 | LA HONTE | COMMUNE (déduite) | offerte au départ |
| 1 | ELDORADO | RARE | 500 k $ à la boutique |
| 2 | LE CAÏD | RARE (déduite du prix) | 600 k $ à la boutique |
| 4 | ROSSO 40 | ÉPIQUE | 4 M $ à la boutique |
| 5 | POSTER 84 | LÉGENDAIRE | 3,2 M $ à la boutique |
| 6 | LE SCARABÉE | COMMUNE | MISSION — fig5 : FAIS {v} FIGURES DANS UN SEUL SAUT |
| 7 | LE COMBI | COMMUNE | MISSION — parf10 : FAIS {v} POSES PARFAITES D'AFFILÉE |
| 8 | LA DOLORÈS | COMMUNE (déduite) | MISSION — rares : DÉBLOQUE TOUTES LES VOITURES RARES |
| 9 | CHAT POP-TART | LÉGENDAIRE (déduite : boutique €) | boutique en € (4,20 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 15 | ACIDE | ÉPIQUE | 2 M $ à la boutique |
| 19 | LA PIZZA EXPRESS | LÉGENDAIRE | boutique en € (161,00 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 26 | LE CORBILLARD | RARE | 3 M $ à la boutique |
| 31 | LE CHARGEUR | RARE | 600 k $ à la boutique |
| 32 | LE DÉFIEUR | RARE | 1,2 M $ à la boutique |
| 33 | LA BAVAROISE | RARE | 1 M $ à la boutique |
| 39 | LE SAMOURAÏ | RARE | 1,2 M $ à la boutique |
| 40 | LA VETTE | RARE | 900 k $ à la boutique |
| 42 | LA GRANDE ANGLAISE | RARE | 1,3 M $ à la boutique |
| 43 | LE CHARGEUR 69 | RARE | 700 k $ à la boutique |
| 45 | LA QUEUE DE CANARD | ÉPIQUE | 8 M $ à la boutique |
| 47 | LA TAURINE | ÉPIQUE | 12 M $ à la boutique |
| 48 | LA STRATOS | ÉPIQUE | 7,5 M $ à la boutique |
| 49 | LA NOCTAMBULE | RARE | 8,5 M $ à la boutique |
| 52 | L'AIGLE DE FEU | RARE | 8 M $ à la boutique |
| 54 | LA FÉLINE | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 55 | LA RAIE | ÉPIQUE | 2,6 M $ à la boutique |
| 56 | L'ÉTERNELLE | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 57 | LE TRÔNE CENTRAL | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 58 | LE SPECTRE | ÉPIQUE | 4,2 M $ à la boutique |
| 59 | LE BLINDÉ NOIR | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 60 | LE MUR DU SON | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 61 | LE DRAGON D'OR | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 62 | LE MASTODONTE | defi | MISSION — air1000 : PASSE {v} S EN L'AIR |
| 64 | LE HOT ROD | defi | MISSION — palier10 : ATTEINS LE PALIER 10 SUR CHAQUE MUSIQUE DU JEU |
| 68 | L'ORIGAMI | ÉPIQUE | 2,8 M $ à la boutique |
| 69 | ATCHOUM | ÉPIQUE | 9 M $ à la boutique |
| 70 | SQUALE | LÉGENDAIRE | boutique en € (1,61 €) — ACHETER refuse tant que StoreKit n'est pas branché |
| 72 | L'ICEBERG | ÉPIQUE | 3,2 M $ à la boutique |
| 76 | LE DOGE | ÉPIQUE | 4 M $ à la boutique |
| 78 | LA PERLE | ÉPIQUE | 2,4 M $ à la boutique |
| 79 | LA CABOSSÉE | COMMUNE | 25 k $ à la boutique |
| 80 | LA DOLCE VITA | COMMUNE | 30 k $ à la boutique |
| 81 | LA FIDÈLE | COMMUNE | 40 k $ à la boutique |
| 82 | LE BAROUDEUR | COMMUNE | 80 k $ à la boutique |
| 83 | LA CERISE | COMMUNE | 60 k $ à la boutique |
| 84 | LE ROUGE-GORGE | RARE | 250 k $ à la boutique |
| 85 | LA LAME | RARE | 800 k $ à la boutique |
| 87 | LA BÊTE | ÉPIQUE | 2,2 M $ à la boutique |
| 88 | LA ZAGAIE | ÉPIQUE | 3,5 M $ à la boutique |
| 89 | LE LOUP | LÉGENDAIRE | 50 M $ à la boutique |

Somme des prix en dollars des caisses actives vendues à l'argent : **149,39 M $** (hors missions et hors boutique €).

## 2. Ce qui a changé depuis l'archive
- Le ×10 du 25/10 : les prix, les habillages, les figures et les contrats ont été multipliés par 10 ; les gains d'une partie, non. Les sacs du FINAL SPIN l'ont été le 05/11 (60 000 / 150 000 / 500 000 : espérance ≈ 16 800 $ par tirage).
- ICEBERG (3,2 M) et DOGE (4 M) avaient été multipliés par 100 par erreur (32 M / 40 M) : corrigés le 05/11.
- POSTER 84 est LÉGENDAIRE (fiche) ; LE LOUP (50 M $) aussi : la règle « légendaire = boutique € seulement » n'est plus tenue.
- **Trou de progression (ECO-09, à trancher par Sacha — rien n'est changé dans le jeu)** : les prix à l'argent, triés, font 25 k · 30 k · 40 k · 60 k · 80 k · **250 k · 500 k** · 600 k (×2) · 700 k · 800 k · 900 k · 1 M · 1,2 M (×2) · 1,3 M · 2 M · 2,2 M … 12 M · **50 M** (LE LOUP). Le saut de 80 k à 250 k puis 500 k est le trou : le jury propose une caisse à ~200 k.
- Les caisses vendues en € (« premium ») n'ont pas de bouton ACHETER qui marche : décision D3 du jury (masquer l'achat tant que StoreKit n'existe pas).

## ARCHIVE — la mesure du 14/10 (avant le ×10, ne plus s'y fier pour les prix)
### ÉCONOMIE — mesure et proposition (GENERAL, 14/10/2026 soir) — RIEN N'EST CHANGÉ DANS LE JEU, Sacha tranche

## 1. Ce qu'une partie rapporte, MESURÉ au banc (main + combos, cache v400)
Pilote de mesure `dbgAuto` (il tient le milieu, ramasse presque toutes les pièces, nitro au sol, ne slalome pas) ; sauvegarde NEUVE,
donc l'ARGENT DU DÉBUT (ECOD ×1,5) est actif ; `ECO3.gain` .25, flow [1 · 1,3 · 1,5 · 1,8 · 3]. Cinq parties d'affilée :

| partie | durée | argent | moteur atteint |
|---|---|---|---|
| 0 | 75 s | 2 456 $ | palier 10 |
| 1 | 75 s | 1 498 $ | palier 10 |
| 2 | 30 s | 607 $ | palier 7 |
| 3 | 60 s | 729 $ | palier 7 |
| 4 | 15 s | 267 $ | palier 4 |

Rythme : **~1 000-2 000 $ par minute** pour un pilote qui prend presque toutes les pièces (~650 $ les 15 premières secondes).
Le pilote meurt tôt (15-75 s) : il ne lit pas la route. Un humain moyen vit plus longtemps, mais ramasse ~40-60 % des pièces.

## 2. D'où vient le « facteur 10 » (175 $ contre 1 750 $)
Ce n'est pas une constante qui a changé : `ECO3.gain` vaut .25 dans les deux cas. Les deux chiffres décrivent deux joueurs différents :
- **1 750 $** (commentaire « ÉCONOMIE VAGUE 3 », 27/09) : le pilote auto en joueur « moyen », 2,3 min, toutes les pièces, ET les poses
  qui payaient de l'argent. Elles ne paient plus depuis le 29/09 (tout en vol paie en aura).
- **175 $** (modèle de GAMEPLAY, `outils/eco-debut-modele.cjs`, 14/10) : un joueur de 45-90 s qui prend la MOITIÉ des pièces et
  n'entre dans le flow que vers 40 s.
- Cumul : durée ×2, pièces ×2, poses payées, flow. Cela fait ~×10. Ma mesure d'aujourd'hui (pilote, ~1 500 $ la minute avec ×1,5)
  donne, pour un humain moyen à moitié des pièces sur 60-90 s, **~500-1 000 $ par partie** au début. Le vrai chiffre est entre les
  deux : le 175 est pessimiste, le 1 750 périmé.

## 3. Les prix, aujourd'hui
- La 1re caisse à l'argent est ELDORADO à **10 000 $**. Les communes de 1 500 à 8 000 $ sont RETIRÉES depuis le 06/10.
- Ensuite : 16 k · 24 k · 42 k · 50 k · 90 k · 120 k · 140 k · 200 k · 300 k (×2) · 460 k · puis les épiques de 550 k à 4 M.
  La gamme à l'argent fait **~34 M$**. Rayon d'habillages 2 k → 500 k ; figures 2,5 k → 50 k.
- Entrées hors partie : permis 500 $, carnets 500 → 65 000 $ (primes pleines depuis le 14/10), seconde chance = une DÉPENSE
  (k 0,6 → 0,8 de la partie), FINAL SPIN d'IDEE = une entrée, montant inconnu à ce jour.
- Aujourd'hui, un moyen à ~700 $ par partie (avec ×1,5) + permis + carnet 1 achète ELDORADO vers la **12e-13e partie**.

## 4. Proposition (au choix de Sacha — une seule à la fois, rien d'appliqué)
Cible : **la 1re caisse en 3 à 5 parties**, puis **une caisse toutes les 4 à 6 parties** au niveau où l'on joue.
- **A — LA PORTE D'ENTRÉE (recommandée, la plus sûre)** : ELDORADO 10 000 → **3 000 $**, et 2 caisses de transition remises en
  vente à 6 000 et 10 000 $. On n'a pas besoin de toucher aux gains : 1re caisse en 3-4 parties, puis 2 marches qui apprennent
  à économiser. Coût : 3 lignes de `CAR_UNLOCK`.
- **B — LE DÉBUT PLUS RICHE** : ECOD ×1,5 → **×3** jusqu'au 1er achat. ELDORADO tombe vers la 5e-6e partie. Rien ne change
  ensuite. Coût : 1 constante (`ECOD.coup`).
- **C — TOUT ×1,6** : `ECO3.gain` .25 → **.40**. Tout va plus vite, y compris le haut de gamme (34 M$ : ~-40 % de temps).
  À ne prendre que si le milieu de gamme paraît aussi trop lent. Les records et le Top 10 changent d'échelle.
- Avec la seconde chance et le FINAL SPIN : garder le spin à **≤ 10 % du gain moyen d'une partie** (espérance), sinon il devient la
  vraie source d'argent. La seconde chance coûte 60-80 % de la partie : elle ne crée pas d'argent, elle en échange.
Ma recommandation : **A seul**, puis on re-mesure. Ajouter B seulement si les 3 premières parties paraissent encore maigres.

## 5. Comment re-mesurer
`scratchpad/pop/eco.js` (session GENERAL) : `CC_QUI=GENERAL node verrou.js node eco.js <racine>` → l'argent toutes les 15 s, par partie.
`?eco=ancien` coupe l'argent du début ; `dbgEcoDebut()` dit si le ×1,5 est actif.

## 6. DÉCISION DE SACHA (14/10 soir) : OPTION A, APPLIQUÉE
- ELDORADO 10 000 → **3 000 $**. LE CHARGEUR 16 000 → **6 000 $** et LE DÉFIEUR 24 000 → **10 000 $** servent de marches
  de transition. Les communes retirées n'ont plus de modèle 3D (leurs gabarits ont été supprimés) : on ne pouvait pas les remettre
  en vente sans les redessiner. Aucun gain ne change.
- Vérification par le calcul, sur la mesure du §1 : le pilote fait ~1 100 $ par partie en moyenne (5 parties, 267 → 2 456 $). Un
  humain moyen qui prend la moitié des pièces fait ~550 $ ; avec le permis (+500) et le carnet 1 (+500), il atteint 3 000 $ vers la
  **3e-4e partie**. Puis 6 000 vers la 9e, et 10 000 vers la 16e.
- ⚠ Il reste un trou : après LE DÉFIEUR (10 000), la marche suivante est LA BAVAROISE à 42 000 (×4,2). À trancher : une caisse
  vers 20 000 ? (LE CAÏD est à 50 000.)
- FINAL SPIN (IDEE) : espérance plafonnée à 10 % du gain moyen d'une partie (~100 $ aujourd'hui).

## 7. LA MARCHE À 20 000 $ ET LA COURBE COMPLÈTE (14/10 soir)
- LA BAVAROISE 42 000 → **20 000 $** : c'est la caisse active juste au-dessus du DÉFIEUR, de même rareté.
- Le bas de gamme devient 3 000 · 6 000 · 10 000 · 20 000 · 50 000 (LE CAÏD) · 90 000, soit ×1,7 à ×2,5 par marche.
- Le reste de la gamme : 120 k · 140 k · 200 k · 300 k ×2 · 460 k · 550 k · 650 k · 700 k · 750 k ×2 · 800 k · 850 k · 900 k ·
  1,2 M · 1,6 M · 2,5 M · 3 M · 3,2 M · 3,4 M · 3,6 M · 3,8 M · 4 M.
  Plus aucun trou au-dessus de ×2,5 : le plus grand écart restant est 1,6 M → 2,5 M (×1,56).
- Ce que je note sans y toucher : de 550 k à 900 k, sept caisses se suivent à ×1,07-1,17, puis cinq de 3 M à 4 M à ×1,06. Ce sont
  des plateaux : on choisit sa caisse plutôt que de « monter ». À garder si c'est voulu (la rareté épique les distingue), sinon les
  espacer à ×1,3 environ.

## 8. SECONDE CHANCE : 100 % DE LA PARTIE (Sacha, 14/10 soir)
Continuer coûte exactement ce que la partie a encaissé (300 $ minimum si elle n'a presque rien rapporté). Elle ne crée donc plus
rien : on rend toute la partie pour la prolonger, et le moteur perd un palier. Le calcul « +25 % / +65 % de revenu » du §4 ne
tient plus : la reprise ne vaut le coup que si l'on compte gagner plus que ce que l'on a déjà en survivant après elle.

## 9. LES PRIMES DE MISSION RAMENÉES À LA PARTIE (Sacha, 15/10 soir : « 3 parties, déjà 96 000 $, c'est trop — il faut équilibrer »)
- Mesuré dans sa sauvegarde : 76 800 $ des 96 036 $ venaient des primes (6 carnets), pas des pièces. Les carnets 3-12 payaient 1 500 → 80 000 $
  la mission ; LA FILE (15/10) les fait tomber en rafale.
- Appliqué : carnets 1-2 inchangés (300-600) ; puis 700 → 4 000 $ la mission (+15-25 %/carnet), suite sans fin 4 000 → +800/carnet, jalon ×2.
  6 premiers carnets : 76 800 → 14 400 $. Cadeau plafonné à 2 500 $ (`CADO.max`) — un record de l'ancienne échelle le rendait astronomique.
- Règle pour la suite : une prime de mission ≈ 1/3 à 1 partie du joueur qui la remplit. Si les missions paraissent maigres, monter tout le
  tableau d'un même facteur par `ECO3.prime` (lu par `carnet()`), pas carnet par carnet.

## 10. L'ELDORADO À 40 000 $ (Sacha, 17/10 : « pas 3 000 dollars, elle doit coûter 40 000 dollars »)
- ELDORADO 3 000 → **40 000 $** (`CAR_UNLOCK`, ligne de l'ELDORADO), toujours RARE (`rar:'rare'` sur sa fiche). Ceux qui l'ont déjà la
  gardent : aucun remboursement ne lit ce prix.
- Le même jour, Sacha a aussi monté LE CHARGEUR 6 000 → **60 000 $**, LA BAVAROISE 20 000 → **100 000 $** et LE DÉFIEUR 10 000 → **120 000 $**
  (« non, chargeur 60 000 » : une 1re version de ce § disait LE CHARGEUR à 6 000, c'était avant ces hausses).
- Conséquence : l'ELDORADO RESTE la 1re caisse à l'argent, mais à 40 000 $ au lieu de 3 000. Les caisses moins chères de `CAR_UNLOCK` sont
  retirées ou se gagnent par mission (LA SILENCIEUSE, 90 000). Le bas de gamme : 40 000 (ELDORADO) · 50 000 (LE CAÏD) · 60 000 (LE CHARGEUR) ·
  100 000 (LA BAVAROISE) · 120 000 (LE DÉFIEUR, LE SAMOURAÏ) · 140 000 (LA VETTE), soit ×1,2 à ×1,7 par marche.
- Au rythme du §6 (~600 $ la partie d'un joueur moyen), 40 000 $ demandent ~60 parties sans compter les primes de mission, contre 3-4
  parties avant. À trancher si le début paraît long : une caisse d'entrée vers 3 000-6 000 $, ou les gains du début (§6, option B).

