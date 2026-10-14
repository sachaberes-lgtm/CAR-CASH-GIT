# ÉCONOMIE — mesure et proposition (GENERAL, 14/10/2026 soir) — RIEN N'EST CHANGÉ DANS LE JEU, Sacha tranche

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
