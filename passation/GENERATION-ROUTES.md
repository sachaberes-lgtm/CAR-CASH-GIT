# LA GÉNÉRATION DES ROUTES, PROPRE — conception (07/11/2026, Fable)

Sacha : « la génération des routes et des modules marche bien dans l'ensemble, mais améliore-la encore : un juste équilibre entre vitesse,
jeu de course, technicité, spectacle, esthétique. Dans l'espace la route s'emmêle bizarrement, ça fait pas joli ; elle s'emmêle trop dans
les nuages ou l'espace ; des tournicotis trop intenses ; des routes qui se génèrent bizarrement, plein de petits virages et de petites
douilles. Rends ça super propre, super clean, un joli modèle ; réfléchis à des genres de maps ; des virages, des tout droits, mais pas trop
de trucs bizarres. Et pour chaque map, un module unique. Prends le temps. »

Chantier : worktree `~/cash-car/generation`, branche `generation-routes` (depuis origin/main v1243).

## 1. CE QUI A ÉTÉ MESURÉ (banc `outils/banc-routes/toutes.mjs`, 9 maps × paliers 0/10/20 × 6 graines : `sorties/avant-0711/`)

Le directeur de rythme du 05/11 a tenu ses cibles (2 à 4 virages/km, plus de droite de 20 s, zéro coude) — mais il les a tenues avec des
**petits virages**. Trois défauts, tous confirmés sur les plans (PNG du banc) et dans le code :

### a) Les « douilles » : des arcs de 2 à 20° dessinés sans que personne ne les ait voulus
Chaque générateur a un geste de **recadrage** qui dessine un petit arc dès que le cap dévie de 2 ou 3° : `recentre` (canyon dès 3,4°, dunes
dès 5,7°), `jCap` et l'alignement de la Porte (jade dès 3°), `gAxe`/`vers`/le `tourne` plafonné (grotte dès 2°), `cap`/`bkVers` (banquise dès 2°),
`recadre` (forêt, après CHAQUE pièce). Comme tous les `arc()` ont au moins 3 points, un arc de 3° fait trois cordes de 3 à 10 m : c'est le
« petit coup de volant » qu'on sent sans le comprendre. S'y ajoutent les **respirations** entre deux motifs (genCtrl : des S de 8-20°,
« le souffle entre deux temps forts »), les `ond`/`serp` des dunes (des S de 6-12° sur 100 m), la `houle` du chapelet (10-14°), le dérive de
l'allée de la forêt (8-20°), le milieu du `gBoyau` (10-18°), le champ de débris de l'orbite (6-8 coups de 22-34°), le `large()` du canyon qui
laisse un reste de 4°… Mesuré au banc Node (nuages/espace) : **60 à 84 changements de courbure par route d'orbite** (un tous les 130 m),
dont 13 à 20 zigzags de petits lobes alternés. Le scorer ne les voit pas : un virage compte à partir de 20°, et ce qui est en dessous
n'est ni un virage ni une droite.

### b) Les « tout droits » ont disparu, remplacés par des faux tout droits
La règle du 05/11 (« jamais 5 s de droite ») a été tenue en remplaçant les droites par des courbes molles de 8-20°. Résultat : il n'y a plus
**ni droite franche** (le moment nitro, la ligne qu'on lit) **ni vrai virage** à cet endroit, juste du « entre les deux ». Les plans de la
jade, des dunes et de la grotte sont une ligne qui ondule le long d'un axe : pas de forme qui se retient.

### c) Dans l'espace et les nuages, la route s'emmêle
- la route roulée (`pisteTord`) tire ses **vrilles au hasard**, sans regarder ce que fait la route en dessous : un demi-tour de roulis
  pendant une épingle ou un slalom = un tire-bouchon. Mesuré : 30 à 40 % de la route sur la tranche ou à l'envers (p0), des tenues de
  1,5 km à l'envers (espace p10) ;
- en ORBITE les modules se suivent à **40-240 m** (`mcNext=approx+(FIGON?40+rf()*200…)`) : collés les uns aux autres, puits + fronde + houle
  sans un souffle, et la route repasse près d'elle-même (contacts résiduels : `pisteTordPropre` garde la moins mauvaise après 6 essais) ;
- le roulis est lissé sur 12-30 m seulement, et les normales sont mélangées linéairement entre deux points de contrôle (~18 m) :
  des cassures de roulis dans les spirales.

### d) Les chiffres d'avant (moyennes, 6 graines)
| map | p0 : vir/km · droite max · note | p10 | p20 |
|---|---|---|---|
| nuages | 2,8 · 4,8 s · 4,4 | 2,0 · 4,4 · 3,8 | 0,9 · 3,8 · 4,9 |
| espace | 2,7 · 4,9 · 2,4 | 1,9 · 4,7 · 1,6 | 1,1 · 4,1 · 2,8 |
| ville | 3,6 · 4,0 · 0,9 | 2,6 · 3,7 · 1,5 | 1,5 · 3,2 · 3,9 |
| crypto | 3,9 · 4,2 · 0,9 | 2,9 · 3,8 · 1,3 | 1,7 · 3,2 · 3,5 |
| jade | 3,1 · 5,4 · 2,3 | 2,6 · 3,8 · 0,6 | 2,2 · 1,8 · 1,0 |
| forêt | 2,6 · 6,2 · 2,6 | 1,7 · 4,3 · 1,7 | 0,8 · 3,4 · 4,4 |
| canyon | 3,0 · 6,0 · 2,9 | 2,2 · 3,8 · 0,8 | 1,2 · 3,8 · 5,4 |
| dunes | 3,2 · 4,5 · 0,2 | 2,4 · 3,5 · 0,2 | 1,7 · 2,8 · 0,6 |
| grotte | 4,2 · 5,9 · 2,6 | 2,9 · 4,5 · 0,2 | 2,0 · 3,2 · 1,1 |
Les notes sont bonnes : **la règle actuelle ne mesure pas ce qui gêne**. C'est la règle qu'il faut changer, pas seulement les réglages.

## 2. TROIS PISTES

- **A · Réglages** : relever les seuils de recadrage (rien sous 10°), remettre des droites de 3 s, espacer les modules de l'orbite, baisser le
  budget de vrilles. Vite fait, mais la génération reste « une chaîne de virages au hasard le long d'un axe » : ni forme, ni genres de maps.
- **B · Un modèle commun (recommandée)** : (1) une règle commune v2 qui VOIT les douilles et VEUT des droites franches, (2) des briques de
  dessin partagées qui ne savent pas dessiner un petit virage, (3) une **phrase de rythme** planifiée en secondes avant de dessiner (montée →
  temps fort → souffle, avec un climax), (4) espace/nuages : des vrilles seulement sur du calme et jamais dans un virage, (5) un module unique
  par map. Les neuf générateurs gardent leur vocabulaire (modules, monuments, relief) : on change ce qui les relie.
- **C · Un seul générateur pour toutes les maps** : tout réécrire autour d'une grammaire unique. Le plus propre sur le papier, mais on
  jette la jade, les dunes, la grotte, le canyon tels qu'ils sont (relief, lacs, salles, murs, raccourcis : tout est calé sur leur tracé).
  Trop de casse pour ce que ça rapporte.

## 3. LA CONCEPTION (piste B)

### 3.1 La règle commune v2 (`code/gameplay/route-rythme.js`)
« **Une courbe ou une droite, jamais entre les deux.** »
- un **VIRAGE** = ≥ 26° à un rayon < 4 rP (20° aujourd'hui) ; sous 26°, c'est soit un **BALAYAGE** (≥ 6,5 rP : la courbe au pouce, une
  droite qui penche, bienvenue) soit une **DOUILLE** (interdite) ;
- une **DOUILLE** = un lobe de 4 à 26° à moins de 5 rP ; un **ZIGZAG** = trois douilles alternées d'affilée. Cible : ≤ 0,4 douille/km ;
  note : 0,8 par douille, 2 par zigzag (plus cher qu'un coude) ;
- une **DROITE FRANCHE** = ≤ 8° de cap sur ≥ 1,8 s à plus de 6 rP : voulue, **5 à 22 % de la route** (la ligne nitro). Une droite de plus de **6,5 s** coûte (5 aujourd'hui) ;
  une figure déclarée vaut deux virages dans la cible virages/km (une map courte faite d'un looping et d'un surf n'est pas « sans virage ») ;
  une « droite » entre deux temps forts qui n'est pas franche n'est plus comptée comme un souffle ;
- **routes roulées** (nuages, espace, grotte) : part hors de l'endroit **≤ 25 %** ; aucune vrille sur un virage < 3 rP ; une figure au plus par 20 s.
Ces mesures vont dans la fiche (`douilles`, `zigzags`, `droitesF`, `horsEndroit`) et dans `rythmeNote` : le meilleur-de-N de TOUS les
générateurs les respecte sans qu'on touche à chacun — et le banc (`fiche.cjs`) les dessine (douilles en jaune).

### 3.2 Les briques propres (`code/gameplay/route-briques.js`, nouveau morceau)
Des primitives de plan partagées, que chaque générateur branche à la place des siennes :
- la règle d'arc : |a| ≥ 26° sauf si R ≥ 6,5 rP (chaque générateur l'applique à son `arc`) ; des segments de droite de ≥ 40 m ;
- `briqueRecadre(dPhi)` : **ne dessine rien** sous 8° (le cap n'a pas à être tenu au degré) ; de 8 à 28°, garde une **dette de cap** reportée
  sur le prochain vrai virage (qui tourne un peu plus ou un peu moins) ; au-delà, un vrai virage à 2,4-3,2 rP. Remplace `recentre`, `jCap`,
  `cmRe`, l'alignement de la Porte, `gAxe`/`vers`/`tourne` plafonné, `cap`/`bkVers`, `recadre`, `large()` et son reste ;
- `briqueSouffle(rnd, vP, genre)` : le souffle entre deux temps forts = une droite franche de 1,6-3,4 s ou un balayage de 30-60° à ≥ 6,5 rP (part selon le genre). Plus jamais
  des S de 8-20°.
- `phraser(rnd, L, vP, genre)` : le phraseur, qui décide du prochain temps d'après la position RÉELLE du dessin (`suivant(pos)`).

### 3.3 La phrase de rythme (`phraser()` dans route-rythme.js)
La map est **planifiée en secondes** avant d'être dessinée, comme une phrase musicale, puis chaque générateur remplit les cases avec SON
vocabulaire :
```
OUVERTURE (2-3 s, droite ou balayage : on lit la map)
puis des cycles :  MONTÉE (2-3 virages lisibles, 6-9 s) → TEMPS FORT (module, 4-8 s) → SOUFFLE (droite franche 2-4 s, ou balayage)
CLIMAX : le module UNIQUE de la map, posé entre 55 et 75 % de la route, précédé d'un souffle long (la tension)
FIN : le geste de fin, la droite d'arrivée
```
- à haut palier les cycles gardent leurs **secondes** (donc moins de temps forts par km, chacun plus long) ;
- trois **genres de rythme** tirés à chaque map (c'est ça, « les genres de maps ») : **VITESSE** (souffles longs, balayages, montées en grands
  virages), **TECHNIQUE** (montées serrées, enchaînements, souffles courts), **SPECTACLE** (le climax plus tôt, une figure de plus, les
  souffles avant chaque figure). Le genre remplace les archétypes FLOW/TECH/ALPIN/VOLTIGE/GRAND8 de genCtrl ;
- genCtrl (nuages, espace, ville, crypto) : la boucle des 13 motifs pondérés est remplacée par la phrase ; jade (`tronc`), canyon (liaisons),
  dunes (`vague`/`valle`), forêt (`piece`), grotte (`remplir`) : la phrase dit combien de virages avant le prochain module et où va le souffle.

### 3.4 Espace et nuages : la route roulée, lisible (`pisteTord`)
- une vrille ne part que sur du **CALME** : la courbure du plan < 1/(5 rP) pendant toute la vrille, plus 1 s avant ; jamais dans un module
  ni dans un virage (la dalle se couche par le dévers dans les virages, et c'est tout) ;
- budget : ≤ 25 % de la route hors de l'endroit ; le tour complet seulement dans une figure déclarée (le tonneau) ; une vrille dure ≥ 5 s ;
- ORBITE : modules espacés de **3 à 6 s** (40-240 m aujourd'hui), une figure au plus toutes les ~20 s ;
- si après 6 essais la route se touche encore : version **dévers seul** (zéro vrille) — jamais une route qui se touche ;
- roulis lissé sur 0,3 s de croisière (12-30 m aujourd'hui), normales des points de contrôle interpolées en slerp.

### 3.5 Un module unique par map (le climax, déclaré `fig`)
| map | le module | ce qu'on vit |
|---|---|---|
| NUAGES | **LE SURF** | trois virages alternés de 70-85° à 2,2 rP ; à chacun la dalle se couche à 75° vers l'intérieur (roulis scripté gauche/droite/gauche), à l'endroit entre deux : on surfe la vague |
| ESPACE | **LE COULOIR DE LANCEMENT** | 4 s de ligne droite parfaitement plate et à l'endroit (la nitro), puis un balayage de 120-140° à 2,6 rP pris sur la tranche (roulis scripté 80°) : la fronde de sortie. Vitesse puis spectacle |
| VILLE | **LE ROND-POINT** | 270° à 1,9 rP, entrée et sortie en droite franche de 1,5 s : on lit le rond-point. ⚠ PLUS PLAT (2026-11-09) : sa sortie recoupe son entrée, il DESCEND de ~0,66 R (pente 14 %, ≥ 70 m) pour que la route passe dessous avec de l'air (plat : 5 m de hauteur libre, sur 100 % des routes). Test : `node outils/banc-routes/croise.cjs` |
| CRYPTO | **TO THE MOON** | 3 s de rampe droite montante à 18 % qui finit sur une crête (big air), retombée sur 2 s de plat, puis 90° à 2 rP |
| JADE | **LES TROIS PICS** | trois crêtes en ligne : droite montante 1,5 s, crête à sauter, descente en virage de 50° alterné — le relief de la jade comme module, plus une chaîne de virages |
| FORÊT | **LA CLAIRIÈRE** | 3,5 s de droite franche (la forêt s'ouvre) puis une épingle de 160° à 1,8 rP à l'entrée du bois |
| CANYON | **LE RAPIDE** | 2,5 s de descente droite à 35 % au fond de la gorge, puis une double corde 90° + 90° du même côté |
| DUNES | **LE GRAND ERG** | 3 s de montée droite à 20 % (la plus haute dune) → crête-tremplin → atterrissage sur 2 s de plat → balayage de 110° à 2,6 rP |
| GROTTE | **LE GOUFFRE** | 2 s de plongeon droit à 30 % (la dalle roulée sur la paroi à 60°), le fond en épingle de 150° à 1,5 rP, remontée droite de 1,5 s |
| BANQUISE | — | hors du JOUER : pas touchée |
Chacun est unique à sa map, tiré **une fois par route** comme climax (jamais deux fois), et écrit dans la liste `dbgGenRoute(...).marks1`.

### 3.5 bis LES NUAGES, LA GRANDE DESCENTE (2026-11-12, cache v1497) — `?sans=nuagesv2` = la route d'avant
Sacha : « ça descend pas assez : 30 degrés en moyenne, 35 même ; le grand U, là où il y a un grand demi-tour, c'est nul ; une vingtaine de PETITS modules qui se combinent, en interaction avec les nuages ; contemplatif, fun, smooth, beau ».
- **Mesure** : `node outils/banc-routes/nuages-v2.cjs paliers=0,10,20,27 graines=1-12` (pente, cap, modules ; `SEARCH="?sans=nuagesv2"` pour l'avant). Avant → après, palier 0 : pente 6,6° → 35,6° · cap le plus loin de l'axe 179° → 74° (pire 81°) · route qui revient en arrière 37 % → 0 % · modules : filet / puits / surf → 8 petits modules par route (20 sortes) + le surf.
- **La pente** (route-sans-haut.js, `NUA2`) : visée à 38° partout hors départ et arrivée ; l'approche d'une figure est une tenue calme (elle éteignait la pente 7 s avant chaque figure) ; les figures à coucher sont tenues calmes (`calme:1`) ; la pente s'accentue plus lentement qu'elle ne s'adoucit (`tangBas`, les crêtes).
- **Le cap** : sur une dalle qui plonge de θ, un lacet de a° tourne le cap de a/cos θ : pisteTord joue donc le lacet × cos θ (le plan vu d'avion est le cap vrai). genCtrl borne le cap à `capMax` (80°) de l'axe (thrG, capA, `cote`/`borne` des modules). Plus de filet, de puits, d'épingle ni de double corde aux nuages.
- **Les modules** (code/maps/nuages-modules.js) : quatre familles de cinq (courbes, portes, relief, torsades), deux ou trois par temps fort, un par un en fin de route ; `?module=anneau` en impose un. Chacun pose ses nuages (`nu` → MODS → `cotonModules`, à la fin de buildCoton), au ras de la route (marge 13 à 26 m au lieu de 113) : à côté, en porte, au cœur du virage, ou l'anneau traversé. `dbgNuaModules()` : posés / refusés.
- **⚠ Le prix** : sans demi-tour, plus de raccourci par le bord (banc descente.cjs : 1,67 → 0,08 par km). Reste à faire si on en veut : un module de saut vers l'avant, prouvé dans le vrai jeu (saut-page.js).
- **Le pouf et les moutons** (même jour, « une animation et un bruit qui fait pouf quand on traverse un nuage, léger et sans bug ») : `cotonPouf` (nuages-modules.js, appelée par updateClouds) — les nuages du ciel de coton savent qu'on les traverse (`nuage.entre` / `nuage.sort`, une trouée et une douzaine de cubes, la vibration) ; des MOUTONS (petits nuages bas posés sur la route) dans porte, piqué, vagues et marche. `?pouf=0` : ni l'un ni l'autre. dbgNuagesAudit les compte « dedans » : c'est voulu (dedans = moutons).
- **Deux pièges trouvés au contrôle** : (1) une route qui part à plat puis plonge se DÉROBE sous un saut fait dans la première seconde (mort « vide » après un portail, à grande vitesse) → la route naît en pente (pisteTord, « le départ en pente ») ; (2) là où la pente s'accentue de Δ, un saut fait à v ne retombe qu'après ~v·tan Δ / g s → le relief des modules s'aplatit en 1/vitesse (`NUA2.relief`, `kR`). La mer et les voiles (mkCloud) se posent à la verticale du monde, plus le long de la normale penchée.
- **Contrôles passés (2026-11-12)** : dbgNuagesAudit 6 météos × 3 graines + 3 × 2 (aucun nuage dans le couloir hors moutons, 0 erreur) ; `banc.cjs gen --auditfile=<sauts + portail>` : route entière avec un saut toutes les 2 s, portail, deux maps de plus — ordi, pré-bâti (`--prebati=1`), téléphone ; 11 arrivées de portail avec saut immédiat de 84 à 374 m/s (dbgMoteur × 12) ; course.cjs : 0 exception.
- **Pas vérifié** : la vue des crêtes à la caméra de course (à juger en jouant), la cadence d'images sur un vrai téléphone avec les nuages proches, le son du pouf à l'oreille (le banc est muet).

### 3.5 ter LES CIRCUITS DES NUAGES (2026-11-13, Sacha : « la génération de map nuages déconne, elle va trop tout droit : rajoute des générations de terrain qui descendent mais qui, vues de haut, pourraient ressembler à un circuit ») — `?circuit=0` = les montées d'avant
- Quatre modules de plus dans `nuages-modules.js` (`M.lacets`, `M.esseGeante`, `M.chicanes`, `M.epingle`) : leur PLAN zigzague comme un circuit (2-3 épingles de ~130° avec une tour de ouate au cœur de chacune ; un grand S ; quatre virages serrés qui se répondent ; une épingle derrière une tour), la pente restant celle de la descente (pisteTord). `vers(h, Rk, p, coeur, dehors)` : tourne jusqu'au cap h° de l'axe, jamais à plus de ~72° de lui (le cap oscille autour de l'axe : aucun retour en arrière, c'est un zigzag de montagne, pas le « grand U »).
- Ils sont aussi tirés par `NUA.circuit` : à la place des deux virages d'une MONTÉE (65 %) et d'un SOUFFLE sur deux (jamais celui qui annonce le surf), voir `ville-entree.js` (genCtrl).
- Mesuré (12 graines, palier 0) : virage cumulé 233 → 262 °/km, part de route quasi droite (< 1,5°/100 m) 33 → 28 %, pente inchangée (36°), 0 contact. Ce qui reste droit : les retournements (retourne, tonneau : ~96 % droits) et les longs tenus du surf.

### 3.6 Ce qu'on ne change pas
Les modules existants, les monuments (Porte, Pont, ras de l'eau, géants, raccourci du canyon, tremplins des dunes), le relief et les décors,
la longueur visée (`DUREE`), le hasard par graine (même graine = même route pour tout le monde), le pré-bâti. `?rythme=0` reste.
Variante : `?gen=ancien` = la génération et la règle d'avant (phrase et briques débrayées).

## 4. L'ORDRE DU CHANTIER (chaque étape mesurée au banc, commitée, poussée)
1. règle v2 + fiche (douilles, droites franches, hors-endroit) + banc Node étendu — les chiffres « avant » sont déjà là ;
2. briques propres + phrase ; genCtrl (nuages/espace/ville/crypto) dessus ; pisteTord v2 ;
3. les cinq générateurs propres branchés sur les briques et la phrase (jade, canyon, dunes, forêt, grotte) ;
4. les neuf modules uniques ;
5. banc « après » (mêmes graines), plans PNG, photos dans le jeu (espace, nuages, dunes, grotte), course au pilote auto ;
6. sw.js, fusion dans main, lien de test.

## 5. LES CHIFFRES D'APRÈS (banc réel `toutes.mjs`, mêmes graines 1-6 : `sorties/apres-0711/`, journal `journal-ctrl.txt`)
Colonnes de la fiche v2 : vir/km · douilles (lobes de 4-26° sous 5 rP, par route) · zigzags · dF% (part de droites franches, voulue 5-22 %) · hors (part de route hors de l'endroit, ≤ 25 %) · note.
| map | p0 | p10 | p20 |
|---|---|---|---|
| nuages | 2,2 · 0,2 · 0 · 13 % · 9 % · 0,8 | 1,2 · 0 · 0 · 20 % · 9 % · 3,2 | 0,4 · 0 · 0 · 20 % · 14 % · 6,0 |
| espace | 2,0 · 0 · 0 · 15 % · 8 % · 0,7 | 1,2 · 0 · 0 · 17 % · 10 % · 1,8 | 0,5 · 0 · 0 · 21 % · 13 % · 4,5 |
| ville | 2,6 · 0,2 · 0 · 16 % · 0 · 1,3 | 1,6 · 0 · 0 · 21 % · 0 · 4,0 | 0,5 · 0 · 0 · 19 % · 0 · 6,9 |
| crypto | 3,1 · 0,2 · 0 · 16 % · 0 · 1,1 | 2,0 · 0,8 · 0 · 17 % · 0 · 2,6 | 0,5 · 0 · 0 · 16 % · 0 · 7,4 |
Avant (même fiche v2 sur l'ancienne génération, banc Node) : nuages p0 **4,1 douilles/route**, espace p0 **2,3**, 30-40 % de route hors de l'endroit, droites franches ~0.
- **Douilles : zéro** (une par route au pire sur 24 routes de crypto p10). **Zigzags : zéro. Hors de l'endroit : 8-14 %** (c'était 30-40 %). Les droites franches font 13-21 % de la route.
- **Les routes sont à la longueur visée** (ville p0 : 77 s de croisière au lieu de 94, p20 : 28 s au lieu de 38) : l'ancienne recette collait un dernier module APRÈS la longueur visée et la dépassait de 15-20 %. Ce n'est pas une régression, c'est la durée voulue (45 s → 20 s, `DUREE`).
- **La note monte au palier 20** (ville 6,9, crypto 7,4) : la cible `vir` est par km et une route de 28 s à 340 m/s n'a plus que 4-5 virages (chacun long). C'est la cible qui est mal posée à haut palier, pas la route (dessins propres dans `apres-0711/*-p20-*.png`). À reprendre si on retouche le directeur : viser des virages par MINUTE.
- **Le climax** (SURF, COULOIR, ROND-POINT, TO THE MOON) : d'abord absent de 5 routes roulées sur 36 (la phrase ne le déclenchait qu'à l'état « fort » et un module plus long que ses 5 s la faisait basculer en fin) ; corrigé (déclenchement à tout état, après un souffle tout de suite) : **96 routes sur 96** au banc Node l'ont. Photos dans le jeu : `sorties/photos-0711/`.

### Les neuf maps (banc réel, 162 routes en 104 s : `sorties/apres-tout-0711/`, FICHE.txt + PNG)
| map | p0 : vir/km · douilles/route · dF% · hors · note | p10 | p20 | module unique |
|---|---|---|---|---|
| nuages | 2,1 · 0,2 · 17 % · 11 % · 1,6 | 1,1 · 0 · 20 % · 11 % · 3,3 | 0,3 · 0 · 30 % · 15 % · 7,4 | SURF |
| espace | 1,9 · 0,2 · 16 % · 7 % · 0,8 | 1,1 · 0 · 16 % · 16 % · 2,3 | 0,4 · 0 · 21 % · 16 % · 4,6 | COULOIR DE LANCEMENT |
| ville | 2,7 · 0,2 · 19 % · 0 · 1,3 | 1,6 · 0 · 21 % · 0 · 4,2 | 0,4 · 0 · 27 % · 0 · 8,1 | ROND-POINT |
| crypto | 3,0 · 0,7 · 17 % · 0 · 1,2 | 1,8 · 0,8 · 20 % · 0 · 3,4 | 0,5 · 0 · 18 % · 0 · 7,7 | TO THE MOON |
| jade | 2,6 · 0 · 20 % · 0 · 1,4 | 1,9 · 0 · 22 % · 0 · 0,7 | 1,3 · 0 · 18 % · 0 · 2,0 | TROIS PICS |
| forêt | 2,2 · 0,5 · 15 % · 0 · 1,0 | 1,5 · 0,2 · 9 % · 0 · 1,4 | 0,7 · 0,3 · 12 % · 0 · 3,9 | CLAIRIÈRE |
| canyon | 2,6 · 0,2 · 10 % · 3 % · 1,2 | 1,7 · 0,5 · 9 % · 5 % · 0,7 | 1,1 · 0,2 · 9 % · 3 % · 4,2 | RAPIDE |
| dunes | 3,3 · 0,3 · 10 % · 0 · 0,4 | 2,4 · 0 · 7 % · 0 · 0,4 | 1,7 · 0 · 8 % · 0 · 0,4 | GRAND ERG |
| grotte | 3,1 · 0,5 · 24 % · 13 % · 0,5 | 2,0 · 0,2 · 22 % · 10 % · 0,5 | 1,3 · 0 · 20 % · 12 % · 2,5 | GOUFFRE |
Avant (même fiche) : douilles par route 1,8 (canyon) à 17,8/km (dunes), grotte 55 % hors de l'endroit, nuages 4,1 douilles. Zigzags : 0 partout. Le module unique est dans `marks1` de 162 routes sur 162.
- **Piège de mesure** (trouvé par trois agents sur cinq) : un arc DESSINÉ à 26-28° ne MESURE que 21-25° (le lissage mange l'entrée et la sortie) et la fiche le compte en douille. Les générateurs dessinent donc à 29-36° minimum (`F_MINA` forêt 32, `MINA` grotte 30, `VMIN2` dunes 29, jade 36, canyon 29).
- **Reste** : canyon p20 : 8 m infranchissables par route en moyenne (25 m sur la graine 5) dans les virages ordinaires, pas dans le rapide (c'était 4 m avant) ; forêt p0 : une droite de 7-8 s sur deux graines (arche collée à la fin de la boucle) ; dF% à 27-30 % au palier 20 (nuages, ville) : une droite de 4 s pèse lourd sur 28 s de route ; le grand erg tombe à 29-45 % de la route aux paliers 10-20 (la route n'a que 3-4 vagues).

### Les restes, réglés le soir même (`sorties/apres-restes4-0711/`)
- **Canyon au palier 20** : les 5-25 m sous rP étaient à l'INFLEXION de deux arcs opposés serrés (sous 2 rP) collés sans droite : la courbe lissée y fait une pointe. La garde est dans `arc()` même (canyon-route.js) : 0,25 s de droite s'intercale à toute inflexion serrée, quelle que soit la pièce (slalom, gorge, virages). Infranchissable : 0 sur les 18 routes, note p20 4,2 → 0,7.
- **La note par minute** (route-rythme.js, `virFMin`) : la cible de virages se lit par minute (× 4,68 depuis la cible par km réglée à 78 m/s), plancher adouci en √(78/vP) ; le plafond reste par km lu à la vitesse réelle (les dunes font 33 virages courts par minute au palier 20, c'est leur nature). Notes p20 : ville 8,1 → 3,3, crypto 7,7 → 3,0, nuages 7,4 → 3,4, espace 4,6 → 1,8, forêt 3,9 → 1,3, grotte 2,5 → 0,7, jade 2,0 → 0,7.
- **Forêt** : l'ouverture de la clairière fait 1,6 s (et non 3,2) après une allée ou un toboggan ; l'arche (290 m de droite) et le toboggan attendent une pièce qui tourne quand la dernière était droite. Reste un trou de 7-8 s sans virage sur deux graines sur six au palier 0 (une pièce qui ouvre par une droite, puis l'arche) : note p0 0,9, moyenne des plus longues droites 5,7 s.
- **Banc** : la fiche prend les marques du plan (`marks0`) et seulement à défaut, sur une route non roulée, les marques finales (sur une route roulée leurs indices ne sont plus ceux du plan : fausse fiche).
