# GROTTE — les nappes de lave et d'eau ont une limite (finition des maps, nuit du 18/11)

Branche `finition-maps-grotte` (dossier `/Users/sachaberes/cash-car/finition-lots/grotte`). Commit du code : `14cd35951`.
Le vrai téléphone n'a RIEN vu. Rien n'a été poussé sur main ni sur qualite-appareil, et aucune app n'a été touchée.

## Le défaut (« il n'y a pas de limite ») et sa cause
Un lac (la lave `GROTTE.lac`, l'eau `GROTTE.eau`) remplit d'abord l'air sous son niveau. Ce remplissage se décide par **sous-cube de 48 m** (`V.si` : l'échantillon de route le plus proche est-il dans la portée s0..s1 du lac ?).
Un sous-cube dont l'échantillon tombe hors de la portée garde donc son **air sous le niveau**, juste à côté d'un sous-cube rempli.
Le mailleur peint en lave ou en eau tout triangle qui touche une case du lac. On obtenait donc :
- des **murs de lave/eau debout dans le vide**, la nappe coupée net sur le bord d'un sous-cube ;
- des **dessous de nappe** : la nappe vue d'en dessous, au plafond d'un creux ;
- des **gradins** sous le niveau ;
- et, dans 85 grottes sur 600, de la **lave collée à l'eau**.

## Le correctif (code/maps/grottes-1.js, plus 2 lignes de grottes-2.js)
- `grtLacsG` garde la liste des cases qu'il remplit. Le nouveau `grtNappesG` fait d'une case de nappe une case de **RIVE** (6 = rive de lave, 7 = rive d'eau) quand l'une de ses 26 voisines est de l'air sous le niveau ou une case de l'AUTRE nappe.
- **Ce qui change** : la rive est **peinte en roche** (`lvP` dans `grtMailleNetsG`, nouveau tampon CPU `T.Fp`). La nappe se ferme sur une lèvre de roche au lieu d'un mur de lave, et la lave ne touche plus l'eau.
- **Ce qui ne change pas** : la rive reste du lac pour tout le reste.
  - Même densité, et mêmes sommets posés sur le plan du lac.
  - Mêmes lacs fondus (`Fl`). Les blocs fondus gardent la peinture d'avant, entre `fA` et `fB`.
  - Même collision et même mort : `grotteHeurt` lit 6 comme 4 et 7 comme 5.
  - La chute de lave de `grtDecorsG` lit 6 comme 4.
- **Pas un sommet ni un triangle de plus.** Pas de texture, pas de programme, pas de GLSL, pas d'appel de dessin. Une seule chose s'ajoute : un tableau CPU de NV×2 octets (80 Ko), alloué une fois pour toutes les grottes.
- Le travailleur (`grotte-travailleur.js`) maille avec le même `grtMailleNetsG`/`grtTampons` : il reçoit la grille APRÈS `grtLacsG`, rives comprises.

## Interrupteur
`?sans=nappes` donne `const GRT_NAPPES` dans grottes-1.js, de la même forme que `VILLE_AME`. Coupé, aucune case n'est listée, donc il n'y a aucune rive, et `Fp` est égal à `F` : c'est la génération et la peinture d'avant.
Preuve en Node, graine 4 au palier 10 : le jeu d'AVANT (`finition-lots/avant/code/maps/grottes-1.js`) et ce lot sous `?sans=nappes` donnent
- les mêmes positions (hP `ed365219`),
- les mêmes attributs (hF `12701367`),
- le même nombre de triangles (249 488),
- les mêmes défauts.

## Preuves — banc Node `outils/banc-routes/grotte-nappes.cjs`
Le banc fait tourner, dans un vm Node, les vraies fonctions du jeu : `genGrotte`, `grtEchantillons`, le vrai champ (`grtMonde`, `grtCreuse1`, les galeries), `grtLacsG`, et le vrai mailleur.
Il compare AVANT et APRÈS sur le même champ. Le bilan se lit avec `node outils/banc-nappes/bilan.cjs <sorties>`.

### Les cases, 200 graines × 3 paliers (`MAILLE=0`)
Le compte porte sur les cases de nappe PEINTES qui touchent par une face de l'air sous le niveau :
- « côté » = un mur dans le vide ;
- « dessous » = une nappe qui flotte.

| palier | grottes (avec lave et eau) | mur dans le vide (graines touchées / cases) | nappe qui flotte | lave contre eau | route dans une nappe | route noyée |
|---|---|---|---|---|---|---|
| 0 avant | 200 | 200 / 382 463 | 200 / 203 806 | 38 / 35 925 | 0 | 0 |
| 0 après | 200 | **0 / 0** | **0 / 0** | **0 / 0** | 0 | 0 |
| 10 avant | 200 | 200 / 450 647 | 198 / 190 349 | 18 / 4 595 | 0 | 0 |
| 10 après | 200 | **0** | **0** | **0** | 0 | 0 |
| 20 avant | 200 | 198 / 561 726 | 193 / 220 121 | 29 / 37 091 | 0 | 0 |
| 20 après | 200 | **0** | **0** | **0** | 0 | 0 |

Les défauts classés par fréquence :
1. Le mur dans le vide touche presque toutes les grottes (598 sur 600).
2. La nappe qui flotte, 591 sur 600.
3. La lave collée à l'eau, 85 sur 600 (écart de niveau médian : 130 m). Les pires sont palier 20 graine 56 (6 366 cases) et palier 20 graine 55.

~~La route n'est jamais dans une nappe ni sous son niveau, ni avant ni après.~~ **Faux (corrigé au tour 2)** : la colonne ne comptait que les cases 4/5. Recomptée avec 4 à 7 (rive comprise) : graine 305 palier 20, 2 échantillons de route ont une case de nappe 8 m sous leur dalle, AVANT comme APRÈS (défaut antérieur au lot, non touché) ; 0 sur les 120 grottes 1-40 × 0/10/20. Les pires graines pour le mur et la nappe qui flotte sont : palier 10 graine 176, palier 20 graines 160, 76, 122 et 27.
⚠ Ces comptes « après » sont nuls par construction : la rive est définie par ces mêmes voisines. La vraie preuve de ce que l'œil voit est celle du maillage, plus bas.

### Le maillage, 14 graines × palier (le vrai `grtMailleNetsG`, tronçons autour des nappes)
On compte les m² peints lave/eau sur des triangles à plus de 6 m sous le niveau :
- « paroi » = un mur debout ;
- « dessous » = un triangle tourné vers le bas.

| palier:graine | triangles avant = après | positions (hP) | paroi m² avant → après | dessous m² avant → après |
|---|---|---|---|---|
| 0:1 | 131 004 | identiques | 236 524 → 0 | 184 303 → 0 |
| 0:2 | 196 107 | identiques | 232 636 → 0 | 195 008 → 0 |
| 0:3 | 182 131 | identiques | 392 523 → 0 | 186 691 → 0 |
| 0:4 | 148 721 | identiques | 272 884 → 0 | 83 463 → 382 |
| 0:5 | 227 399 | identiques | 188 130 → 0 | 157 324 → 0 |
| 10:1 | 129 475 | identiques | 211 371 → 0 | 81 908 → 0 |
| 10:2 | 259 832 | identiques | 265 907 → 0 | 21 666 → 0 |
| 10:3 | 150 446 | identiques | 92 649 → 0 | 49 044 → 2 187 |
| 10:4 | 342 719 | identiques | 239 098 → 0 | 187 475 → 0 |
| 20:1 | 170 857 | identiques | 648 254 → 0 | 323 766 → 3 110 |
| 20:2 | 195 458 | identiques | 291 000 → 0 | 202 013 → 375 |
| 20:3 | 254 511 | identiques | 525 423 → 0 | 183 772 → 0 |
| 20:101 | 241 770 | identiques | 257 224 → 0 | 85 808 → 443 |
| 20:102 | 261 918 | identiques | 400 726 → 0 | 73 970 → 104 |

En tout : paroi 4 254 349 m² → 0, dessous 2 016 211 m² → 6 601 m² (99,7 %).
Le **résidu** a été examiné sur palier 20 graine 1. C'est une surface de lac PLATE, 7 m sous le niveau : la case d'air au-dessus est dans un sous-cube hors portée, sa densité n'a pas été bornée, et l'aimant du plan ne prend que les sommets à moins de 4,8 m.
C'est donc une petite marche dans la nappe, pas un mur ni un dessous. Il est laissé tel quel : la corriger déplacerait des sommets.

### La route au bit près
L'empreinte des échantillons de la route (X, Y, Z, S) est la même avant et après sur les 600 grottes ; elle diffère sur 0 graine. Le diff ne touche aucune fonction de la route : `grtLacsG` court après `grtEchantillons`.

## Coût : renderer.info
- **Node (mesuré)** : les mêmes triangles et les mêmes positions de sommets au bit près, sur les 14 grottes maillées, ci-dessus.
- **Navigateur en `?tel=1` : PAS mesuré** (voir plus bas). Rien dans le diff ne crée de matériau, de géométrie, de texture ni de programme. Seuls les octets de matière/drapeau (attribut existant) changent.

## Ce qui n'a PAS été vérifié
- **Les photos du vrai jeu et les planches avant/après n'ont pas été faites.** Deux passages du banc se sont perdus.
  - Le 1er, à 03 h 37 : l'outil du premier auteur, `photos-nappes.py`, retiré depuis. Avec `?tel=1` sur un écran d'ordinateur, la page ouvre le CADRE `#colonne` et le jeu tourne dans une iframe : la grotte n'était jamais « prête ».
  - Le 2e, à 04 h 29 : même cause avec `banc.cjs`.
  - Le correctif est dans `outils/banc-maps/banc.cjs`, 2e commit `d94adfe8e` : `--ecran=844x390` émule un téléphone tactile, `{ecran:'390x844'}` en cours de passage, et le banc attend `dbgJouer`. Le correctif n'a pas été essayé.
  - Le 3e passage a attendu le verrou commun de 04 h 37 à 07 h 44 (18 sessions en file), en vain. Je l'ai arrêté proprement : il n'a pas pris le verrou.
  - Le script prêt : `scratchpad/b2/passe.sh` (vues dans `b2/vues-*.json`), puis `python3 outils/banc-nappes/planches.py <out> <ce dossier> 1:20:pire 4:10:pire …`.
- Donc : l'image sous `?sans=nappes` n'a pas été comparée à celle de `finition-lots/avant` dans le navigateur (seulement en Node), renderer.info n'a pas été mesuré, et la console n'a pas été lue en jeu.
- Le travailleur de la grotte (Worker) n'a pas été exécuté. Le code est relu : il reçoit la grille après les rives, et `grtTampons` comme `grtMailleNetsG` y sont envoyés.
- Le banc Node dépend de l'ordre des graines : une graine tirée seule ne donne pas la même grotte que tirée après d'autres dans le même processus (palier 10 graine 4 : lave à −1 059 seule, −1 235 en série). L'avant/après se compare toujours sur le même champ, donc les comptes tiennent. Mais les vues « pire mur » ont été recalculées graine seule pour coller au jeu.
- Aucun essai sur un vrai téléphone.

## Décisions pour Sacha
1. **Une lèvre de roche là où la nappe s'arrête**, plutôt que prolonger la lave. Prolonger demandait un remplissage borné par la hauteur de la route, soit environ 400 triangles de plus pour 2 grottes : ce n'était pas neutre, donc ce n'est pas fait.
   La géométrie de la coupe reste là : on voit une falaise de ROCHE au bord du sous-cube, plus un mur de lave.
2. Dans les blocs de lac fondus, la peinture d'avant est gardée. Ces blocs sont sur le plan, donc il n'y a pas de mur, mais leur bord est encore couleur lave.
3. Entre la lave et l'eau qui se touchent, il y a maintenant deux cases de roche, soit 24 m. Elles se touchaient dans 85 grottes sur 600.

## Contrôle adverse, tour 1

Contrôleur indépendant, 18/11 de 07 h 45 à 09 h 15. Je n'ai pas touché au code du lot. **Verdict : A_CORRIGER.**
Le correctif fait vraiment son travail, et la route ne bouge pas d'un point. Deux choses manquent :
- les planches de l'auteur, qui n'existent pas ;
- la nuit, la rive peinte en roche fait des **trous noirs** dans la nappe.

### Ce que j'ai exécuté
1. **Le diff** (`git diff a0d9f3094 HEAD --stat`) : 6 fichiers.
   - `code/maps/grottes-1.js` et `grottes-2.js` (2 lignes).
   - `outils/banc-maps/banc.cjs`, `outils/banc-nappes/*` et `outils/banc-routes/grotte-nappes.cjs`.
   - Ni index.html ni sw.js. Rien dans nuages, ville, route ni gameplay. Pas d'`IS_MOBILE`.
   - Relu ligne à ligne : pas de texture, pas de mesh, pas de GLSL, pas de matériau. Un tampon CPU `T.Fp` (NV×2 octets) et une liste JS `LST`.
2. **Les gardes**, après `node code/assembler.cjs --depuis-morceaux` (346 morceaux d'accord) : garde-demarrage OK (21 scripts), garde-allege OK, garde-charte OK.
   - vm.Script sur les 8 `<script>` : une seule erreur, le script 5 (« Unexpected token ',' »), et elle est identique dans `finition-lots/avant`. Elle existait avant le lot.
   - `const GRT_NAPPES` et `grtNappesG` ne sont déclarés qu'une fois.
3. **La route au bit près, banc Node, sur des graines que l'auteur n'a pas choisies (301-320).**
   - Le code de `finition-lots/avant` (via `G1=`) contre le lot, aux paliers 0 et 20 : l'empreinte (X, Y, Z, S) est identique sur **80/80** comparaisons, 0 différente.
   - Les comptes de défauts du lot sous `?sans=nappes` sont identiques au code d'avant (0 écart sur 40 grottes).
4. **Les nappes, graines 301-320 × paliers 0/10/20 (60 grottes)** :
   - Mur dans le vide (cases) : avant 48 297 / 37 028 / 72 429, après 0 / 0 / 0.
   - Nappe qui flotte : avant 23 557 / 14 606 / 27 291, après 0.
   - Lave contre eau : avant 2 226 (3 grottes) et 5 676 (2 grottes), après 0.
   - **Aucune nappe supprimée** : 60/60 grottes gardent leur lave et leur eau. La rive prend 4 à 6 % des cases remplies (96 541 sur 1 567 456 au palier 0).
5. **Le maillage, graines 401-403 × 3 paliers (9 grottes, vrai mailleur)** :
   - Triangles identiques, positions hP identiques et route identique sur les 9.
   - Paroi : avant 118 515 à 611 972 m², après **0** sur les 9.
   - Dessous : 99,5 % en moins (275 906 → 370 m², par exemple).
   - Surface de nappe peinte sur le plan : −0,0 à −1,3 % seulement (palier 0, graine 403 : 563 507 → 555 995 m²). Les nappes ne rétrécissent pas.
6. **Le coût CPU de `grtNappesG`** (Node, Mac chargé) : 31 à 54 ms pour une grotte ordinaire, et **251 ms pour la pire** (palier 20, graine 302 : 838 958 cases, donc un tableau JS de 839 k nombres).
   - Le travail est découpé (`yield` sous `JF.lim`), mais il allonge la construction.
   - Pas mesuré sur iPhone.
7. **Au banc, le vrai jeu en `?tel=1`, 844×390 puis 390×844**, deux passages sous le verrou (08 h 04 et 09 h 03). Graines testées :
   - 3, palier 20, matin ;
   - 56, palier 20, matin (la pire de l'auteur pour lave contre eau) ;
   - 1, palier 20, nuit ;
   - 4, palier 10, soir.

   Les caméras sont calculées dans la page sous `?sans=nappes` (`dbgGrotte('lac',{dis:1})`), puis reposées à l'identique pour avant et après : 6 vues × 2 formats × 3 versions.
   - **L'interrupteur** : `?sans=nappes` contre `finition-lots/avant` donne **0,00 %** de pixels différents sur les 12 vues de la graine 3, 0,01-0,02 % sur la graine 56 et 0,04-0,09 % sur la graine 4. La nuit, c'est 1-2,5 %, mais c'est l'animation de la braise : avant contre après donne le même bruit.
   - **renderer.info, par vue** : programs 153 = 153 = 153 et textures 119/118 identiques. Les géométries sont identiques à ±1.
     Les calls et les triangles bougent de ±0,2 % **dans les deux sens, et autant entre avant et sans** (même code) : c'est du bruit de chargement, aucune hausse systématique.
   - **Console** : 0 erreur sur les 15 chargements.
   - Photos regardées : planches `controle/ctl2-*.jpg`. `controle/ctl-*.jpg` vient du 1er passage, avec les vues « pire » de l'auteur : elles tombent dans le vide, car les coordonnées viennent de Node et ne correspondent pas au jeu.

### Ce que l'œil voit
- **Mieux** :
  - g3 p20 matin, lave −250/0 : les rideaux de lave debout disparaissent, remplacés par une lèvre de roche sombre avec un filet néon.
  - g56 p20 matin, eau 0 : le dessous bleu de la nappe sous l'île verte flottante devient roche violacée.
  - Les plans de lave et d'eau loin des coupes restent identiques au pixel près (diff 0-2 %).
- **Défaut 1, masse noire la nuit** : g1, palier 20, `?meteo=nuit`, paysage 844×390.
  - Vue `eau0h40`, caméra p=[x,y,z] du log `log-1-20-nuit-sans.txt` : la cuvette sous le niveau, avant peinte en eau, devient un **trou noir** au milieu du plan d'eau, barré d'un trait magenta. Voir `controle/zoom-g1-nuit-eau0.jpg`.
  - Vue `lave-250h40` : un grand aplat noir au premier plan, à la place du mur de lave.
  - Le défaut de forme (un creux sous le niveau) reste. On a seulement troqué un mur de couleur pour un trou noir. La nuit, ce n'est pas plus beau.
- **Défaut 2, livrables** : `passation/photos/finition-maps/grotte/` ne contient aucune planche de l'auteur, et la NOTE le dit. Le lot n'a donc aucune preuve visuelle de sa main.
  Les vues « pire » de `scratchpad/b2/vues-*.json` sont fausses dans le jeu : la caméra est dans le vide.
- **Défaut 3, mineur, le banc** : la colonne « route dans une nappe » ne compte que 4/5. Après le lot, une case de rive (6/7) n'est plus vue.
  Graine 305, palier 20 : 2 échantillons de route sont dans une case de nappe avant ET après. Le « 0 après » est un reclassement, pas une correction, et la NOTE dit à tort « jamais, ni avant ni après ».
  `grotte-nappes.cjs` : compter `a>=4&&a<=7`. Par ailleurs, `rempli` est toujours `null` : il faut lire `nappes.cases`.

### Pour la passe suivante (une passe suffit)
1. Ne pas peindre la rive en roche **nue**. Garder des NOMBRES : pour la rive de lave, `grtMatieres` → `GT.BASALTE` (ou `GT.MAGMA`) ; pour la rive d'eau, une roche claire de la salle.
   Ou encore : garder le drapeau du lac sur les facettes de la rive au-dessus de `L9.y−B*.5`, et ne peindre en roche que ce qui descend plus bas (`grottes-1.js`, ligne ~1207, `lvP`).
   Puis re-photographier g1 p20 **nuit**, vues `eau0h40` et `lave-250h40`, en paysage et en portrait : plus aucun aplat noir.
2. Faire les planches (≤ 10 JPEG, deux formats, plusieurs ambiances dont la nuit) avec les caméras calculées dans la page, pas en Node. La recette qui marche est dans mon `scratchpad/ctl/passe2.sh` + `vues.py` (caméras de `dbgGrotte('lac',{dis:1})` sous `?sans=nappes`, reposées en `({p,c,fov})`).
3. `LST` : un `Int32Array` (taille connue après un premier passage, ou par blocs) plutôt qu'un tableau JS de 839 k nombres. Mesurer `grtNappesG` sur iPhone, ou au moins en `?tel=1` (`__constr`).
4. Corriger la colonne route du banc et la phrase de la NOTE.

Non vérifié par moi : le vrai téléphone, le travailleur (Worker) exécuté à part (le jeu du banc l'a utilisé, et l'image avec `sans` est identique à avant), les ambiances « midi » et « glace », et les graines au-delà de 320 pour les cases (au-delà de 403 pour le maillage).

## Tour 2 — reprise après le contrôle (18/11, 09 h 15 - 11 h 30)

### Ce qui change encore (code/maps/grottes-1.js, plus 1 ligne de grottes-2.js)
1. **La rive de LAVE rougeoie au lieu d'être noire.** Cause de l'aplat noir : le sous-cube hors portée porte la salle VOISINE (`sal` ≠ 4), donc `LE RIVAGE ROUGEOIE` (GRT_FS, réservé à la salle de lave) ne s'allumait pas sur la paroi.
   Dans la sortie du mailleur, un sommet de rive de lave (drapeau 1 dans `F`, pas dans `Fp`) prend `sal = 4` : la roche sous le niveau rougeoie (dégradé déjà calculé par le fragment). Un octet, pas un sommet de plus.
2. **La lèvre** : un sommet de rive à moins d'une demi-case (6 m) sous le niveau garde la peinture du lac (conseil du contrôleur) : la nappe va jusqu'à son bord, seule la paroi plus basse est de roche.
3. **La rive d'EAU** (`grtRiveEau`) : la roche sous l'eau ne rougeoie pas. Une facette DEBOUT (|ny| < 0,7) de la rive d'eau, entièrement à moins de 18 m (1,5 case) sous le niveau, garde l'eau : une cuvette ou une marche reste de l'eau, comme avant. Le dessous d'une nappe (facette couchée) et ce qui descend plus bas restent de roche.
4. **Le coût de `grtNappesG`** : la case loin du bord de son tronçon lit ses 26 voisines directement dans son tableau (sans `V.dir`). Même résultat (mêmes rives, mêmes hP).
   Node, même banc : graine 302 palier 20 (838 958 cases, la pire du contrôleur) **251 → 91 ms** ; 120 grottes 1-40 × 0/10/20 : médiane 13 ms, max 78 ms.
   Dans le vrai jeu, `?tel=1`, Mac chargé (temps de calcul, pauses ôtées, `dbgGrotte().nappes.ms`) : 25 ms (g1 p20), 17 (g3 p20), 19 (g56 p20), 15 (g4 p10), 9 (g2 p0). `LST` reste un tableau JS d'entiers (SMI compacts, 4 octets avec la compression des pointeurs de V8) : je ne l'ai pas changé en Int32Array, le coût était dans la boucle des voisines, pas dans le tableau.
5. **Essayé puis retiré** : combler les trous sous le niveau (un remplissage borné, puis par rangées). Mesuré : ces trous ne sont presque jamais fermés (ils fuient vers le vide de la salle), on n'en comblait que 0 à 248 cases par grotte, et cela ajoutait 14 à 84 triangles : pas neutre, retiré.

### Le banc corrigé (outils/banc-routes/grotte-nappes.cjs)
- La colonne `route` compte les cases 4 à 7 (la rive est de la nappe). `cases` lit `nappes.cases` (`rempli` n'existait pas). `msNappes` additionne le temps de `grtNappesG`.

### Preuves Node (même champ avant / après)
| palier (40 graines, 1-40) | mur dans le vide avant → après (cases) | nappe qui flotte | lave contre eau | route dans une nappe (4-7) | route identique au bit près |
|---|---|---|---|---|---|
| 0 | 72 023 (40 grottes) → 0 | 46 043 (40) → 0 | 7 772 (9) → 0 | 0 → 0 | 40/40 |
| 10 | 85 701 (40) → 0 | 37 759 (39) → 0 | 513 (1) → 0 | 0 → 0 | 40/40 |
| 20 | 118 334 (40) → 0 | 40 440 (38) → 0 | 4 949 (8) → 0 | 0 → 0 | 40/40 |

Graines 301-306 palier 20 : mêmes zéros ; route 305 = 2 avant ET après (voir plus haut).
Maillage (vrai mailleur), palier 20 graines 1-2, palier 0 graines 1-2 : **triangles et positions (hP) identiques** avant/après. Paroi peinte (m², > 6 m sous le niveau) : 648 254 → 23 795 (g1 p20), 291 000 → 32 615, 236 524 → 21 432, 232 636 → 19 512 ; dessous : 323 766 → 3 223, 202 013 → 502, 184 303 → 734, 195 008 → 1 777.
Le reste de « paroi » est la lèvre (6 m) et la paroi d'eau gardée (≤ 18 m) : des bords de nappe, plus des rideaux.

### Le vrai jeu, `?tel=1`, 844×390 et 390×844 (passage sous le verrou, 10 h 48 - 10 h 55, puis TOUR2B)
Caméras calculées DANS la page (`dbgGrotte('lac',{…,dis:1})` sous `?sans=nappes`), reposées à l'identique pour avant / sans / après. 5 graines × ambiances : g1 p20 **nuit**, g3 p20 matin, g56 p20 matin, g4 p10 soir, g2 p0 midi ; 6 vues × 2 formats.
- **Interrupteur** : `?sans=nappes` contre `finition-lots/avant` : 0,00 % de pixels différents (g3), 0,04-0,09 % (g2), 0,7-1,4 % (g4), 1,2-2,6 % (g1 nuit, g56) — le même bruit d'animation que le contrôleur a mesuré entre deux chargements.
- **Console** : 0 erreur sur les 15 chargements.
- **renderer.info** (caméra fixe, `I.reset()` puis un rendu, en COMPTES) — extrait, vue `paysage-eau0h40` :

| graine | avant (finition-lots/avant) | sans=nappes (ce lot) | après |
|---|---|---|---|
| g1 p20 nuit | 90 calls · 262 189 tri · 153 prog · 671 geo · 119 tex | 90 · 262 525 · 153 · 671 · 119 | 90 · 262 129 · 153 · 673 · 119 |
| g3 p20 matin | 69 · 230 966 · 153 · 734 · 119 | 68 · 228 494 · 153 · 736 · 119 | 69 · 230 798 · 153 · 736 · 119 |
| g56 p20 matin | 115 · 353 705 · 153 · 680 · 119 | 124 · 357 073 · 153 · 662 · 119 | 116 · 356 009 · 153 · 680 · 119 |
| g4 p10 soir | 162 · 467 008 · 153 · 743 · 119 | 161 · 464 332 · 153 · 743 · 119 | 161 · 464 512 · 153 · 743 · 119 |
| g2 p0 midi | 164 · 218 800 · 153 · 837 · 111 | 157 · 220 400 · 153 · 835 · 111 | 165 · 221 272 · 153 · 834 · 111 |

  Programmes et textures identiques partout ; calls / triangles / géométries bougent autant entre « avant » et « sans » (le MÊME code) qu'entre « avant » et « après » : c'est le chargement en tranches (le lot en vol à l'instant de la mesure), pas le lot. En Node, à champ identique, les triangles et les positions sont identiques au bit près.
- Planches : `planche-g<graine>-p<palier>-<ambiance>-<format>.jpg` (gauche AVANT, droite APRÈS), 10 fichiers.
- REGARD

### Ce qui n'est toujours PAS vérifié
- Le vrai téléphone : rien vu. Le travailleur (Worker) n'a pas été lancé à part (le banc du jeu l'a utilisé).
- La glace (`GROTTE.met==='glace'`, la lave repeinte en glace) : la rive rougeoie en bleu glace par le même mélange `uIce` du fragment, pas photographiée.
- Les cases au-delà des graines 1-40 / 301-306 ; le maillage au-delà de 4 grottes à ce tour.

### Décisions pour Sacha
1. La paroi d'une rive de lave est de la ROCHE ROUGEOYANTE (orange, sous le niveau), plus un rideau de lave : la coupe se voit encore comme une falaise chaude.
2. La paroi d'eau garde l'eau jusqu'à 18 m sous le niveau (les cuvettes restent des marches d'eau) ; plus bas, de la roche.
3. Prolonger les nappes jusqu'à la roche (supprimer la coupe elle-même) changerait la forme, la collision et ajouterait des triangles : pas fait.

## Tour 3 — reprise du 19/11 (correction 0 de la reprise, base = origin/main dbc5f1d54)

### Ce qui change encore (code/maps/grottes-1.js, grotte-travailleur.js, 1 ligne de grottes-2.js)
1. **Le trou noir dans l'eau, la nuit (g1 p20 nuit, vue `eau0`), corrigé.** Mesuré au banc Node (graine 1, palier 20) : les facettes passées d'eau à roche sont, en aire, à 95 % la paroi d'une FOSSE à plus de 36 m sous le niveau (debout > 60 m : 179 224 m², dessous > 60 m : 110 830 m², debout 36-60 m : 13 672 m²), vue D'EN HAUT à travers le plan d'eau. La règle du tour 2 (garder l'eau sur une facette debout à moins de 18 m) ne la touchait pas : la planche du tour 2 montrait encore le trou.
   - **Essayé puis retiré** : une lueur bleu-vert cuite dans la lumière des sommets de la rive d'eau (`aL`, des nombres, aucun coût). Mesuré : le bas de la vue passait de 23,5 % à 18,5 % de pixels noirs seulement (avant le lot : 4,5 %). La roche est trop sombre la nuit pour qu'une lumière suffise.
   - **Retenu** (`grtRiveEau`) : une facette de la rive d'EAU qui ne regarde pas vers le bas garde l'eau, à toute profondeur, comme avant le lot. Seul le DESSOUS d'une nappe (l'air sous la facette : la nappe qui flotte) reste en roche. Normale : (b−a)×(c−a) du mailleur pointe dans la roche (banc : 313 634 m² sur 313 634 m² de facettes nettes) ; l'air est en bas quand ny > 0,35. La lave ne change pas (sa paroi rougeoie, tour 2).
2. **`LST` en Int32Array** qui double (65 536 au départ) au lieu d'un tableau JS. Les rives et les hachages ne bougent pas. Temps de `grtNappesG` dans le vrai jeu (`?tel=1`, Mac chargé, `dbgGrotte().nappes.ms`) : 34 ms (g1 p20, 136 872 cases) et 26 ms (g56 p20, 77 373 cases). En Node, 4 grottes (g1-2 × p0/p20) : 169 ms au total.
3. **Le travailleur** : `grtRiveEau` est dans sa liste de fonctions. Le banc `grotte-nappes.cjs` a un mode `TRAV=1` qui maille chaque tronçon AUSSI avec le code du travailleur : liste `fns` lue dans grotte-travailleur.js, sources recopiées et aplaties comme `grwPlat`, vm à part avec l'état de `grwInit`. Il compare P, F, L octet par octet. Résultat : **1 987 + 1 987 tronçons (avant / après, g1-2 × p0/p20), 0 différent** ; au premier essai (g1-2 p20), 1 021 + 1 021, 0 différent.
4. Le banc compte la route sur les cases 4 à 7 (tour 2, déjà dans le fichier). La phrase « jamais, ni avant ni après » est fausse et corrigée plus haut : graine 305, palier 20, 2 échantillons de route dans une nappe AVANT comme APRÈS (le lot ne les crée pas et ne les règle pas).
5. `outils/banc-nappes/mesure-image.py` : luminance, chroma, % brûlés (> 245), % rouge-orange vif, % noir, par tiers d'image.

### Preuves Node (même champ, vrai mailleur, `TRAV=1 node outils/banc-routes/grotte-nappes.cjs 20,0 1-2`)
| | avant | après |
|---|---|---|
| triangles / positions hP | 771 677 / 1446285271 | 771 677 / 1446285271 (identiques) |
| route (empreinte) | 3ef5ae02 | 3ef5ae02 |
| paroi peinte > 6 m sous le niveau (m²) | 1 569 415 | 557 111 (le reste : des parois d'eau gardées exprès, point 1) |
| dessous peint (m²) | 1 005 196 | 66 167 |
| cases « mur dans le vide » / « nappe qui flotte » / lave contre eau | 9 881 / 3 688 / 0 | 0 / 0 / 0 |
| travailleur ≠ fil principal | 0 / 1 987 | 0 / 1 987 |

**L'interrupteur, au bit près** : `SANS=nappes` (ce lot) et le `grottes-1.js` de finition-lots/avant donnent le même hP, le même hF (matières et drapeaux de tous les triangles) et la même route sur les 4 grottes (g1-2 × p0/p20). Exemple, g1 p20 : hP db8621a7, hF ba31ccbc, route 14f658a0, des deux côtés.

### Le vrai jeu, `?tel=1`, 844×390 puis 390×844 (3 passages sous le verrou : 17 h 44, 17 h 53, 18 h 45)
Les caméras sont calculées dans la page d'AVANT (`dbgGrotte('lac',{…,dis:1})`, sans rive), puis reposées telles quelles pour `?sans=nappes` et pour après. 0 erreur console sur les 9 chargements.
- **Mesure d'image (bas de la vue, paysage)** :

| vue | lum | chroma | noir % | brûlé % | rouge % |
|---|---|---|---|---|---|
| g1 nuit eau0 | 39,3 → 39,3 | 72,6 → 72,6 | **4,54 → 4,54** (tour 2 : 23,52) | 0,95 → 0,95 | 1,1 → 1,1 |
| g56 matin eau0 | 35,6 → 32,6 | 74,7 → 71,2 | 0 → 0 | 2,61 → 0,95 | 3,33 → 1,11 |
| g1 nuit lave-250 | 115,6 → 98,1 | 186,1 → 201,5 | 0,46 → 0,47 | 19,8 → 20,3 | **56,4 → 79,6** |

  `?sans=nappes` contre avant : g1 eau0, tout l'écran, lum 45,7 / 45,6, noir 16,84 / 16,84 (même image au bruit d'animation près).
- **renderer.info** (caméra fixe, `info.reset()` puis un rendu de la scène, en COMPTES), avant → après : **programmes 148 = 148, textures 119/118 = 119/118 partout**. Les appels bougent de ±1 (81-82, 63-64, 41-42…) dans les deux sens. Triangles ±0-2 %, géométries ±2-8, eux aussi dans les deux sens. Entre « avant » et « sans » (le même code), l'écart est du même ordre : géométries +10, triangles +168. C'est le chargement en tranches, pas le lot. En Node, à champ égal, les triangles sont identiques au bit près.
- **Planches** (gauche → droite AVANT | `?sans=nappes` | APRÈS) :
  - `planche-g1-p20-nuit-{paysage,portrait}.jpg` : refaites, plus de trou noir dans l'eau.
  - `planche-g56-p20-matin-{paysage,portrait}.jpg` : refaites, AVANT | APRÈS.
  - Les 6 autres (g2 midi, g3 matin, g4 soir) datent du tour 2. Ces vues ne montrent pas de rive d'eau vue d'en haut : le changement de ce tour ne les touche pas, elles n'ont pas été refaites.

### Ce qui n'est toujours PAS vérifié
- Le vrai téléphone : rien vu.
- La glace (`met==='glace'`), photo absente.
- Les cases sur 120 grottes avec l'Int32Array : passage arrêté, disque à 1,2 Go. Mesurées seulement sur 4 grottes avec maillage, plus 2 grottes du vrai jeu.
- Les vues `eau` de g56 regardent surtout le sol rouille de la salle : peu parlantes.

### Décisions pour Sacha
1. **La rive d'eau** : les parois d'une fosse sous l'eau restent de l'EAU, comme avant le lot, parce que vues d'en haut c'est de l'eau. Seul le dessous des nappes qui flottent devient roche. L'autre choix, la roche partout, faisait des trous noirs la nuit.
2. **La paroi de lave** est une falaise de roche ROUGEOYANTE (orange uni) au lieu d'un rideau de lave : dans la vue g1 lave-250, la part de rouge-orange vif du bas de l'image passe de 56 à 80 %. Si c'est « trop rouge », il faudra faire décroître la lueur avec la profondeur, ce qui veut dire une ligne de GLSL (même coût) : non fait.

## Contrôle adverse, reprise du 19/11, tour 1

Contrôleur indépendant, 19/11 au soir. Je n'ai pas touché au code du lot. **Verdict : A_CORRIGER.**
Le lot est propre côté technique : la route, l'interrupteur, le coût, les gardes, le travailleur. Mais sur l'image, il ne tient pas la consigne du 19/11 (« trop rouge », « pas de bug de génération »).

### Ce que j'ai exécuté
1. **Le diff** `origin/main...HEAD` : 3 fichiers de code (`grottes-1.js`, `grottes-2.js`, `grotte-travailleur.js`) et 6 outils.
   - Ni index.html ni sw.js. Pas d'`IS_MOBILE`. Pas de texture, de mesh, de matériau ni de GLSL.
   - Côté CPU : un tampon `T.Fp` et l'Int32Array `LST`.
   - Les cases 6/7 sont relues par `grotteHeurt`, par la chute de lave (`|2)===6`) et par `plancher` (`v===0` : inchangé). Je n'ai pas trouvé d'autre lecteur.
2. **Assemblage** `--depuis-morceaux` : 349 morceaux d'accord.
   - Les gardes passent toutes : burnout, charte, allège et démarrage (21 scripts).
   - `GRT_NAPPES`, `grtNappesG` et `grtRiveEau` ne sont déclarés qu'une fois.
3. **La route au bit près** (`outils/banc-routes/ctl19-route.cjs`, outil à moi, non commité) : le lot contre le `grottes-1.js` d'avant (`G1=`), graines 321-344 × paliers 0/20. Résultat : **48/48 empreintes identiques**, 0 erreur.
4. **Les nappes, sur des graines que l'auteur n'a pas choisies, avec le vrai mailleur** (`grotte-nappes.cjs 0,10 451-452 detail=1`).
   - Triangles et positions hP identiques. Route identique.
   - Le `grottes-1.js` d'avant (`G1=`) donne le même hP et le même hF que le lot sous `sans` (451 et 452, palier 0). L'interrupteur est donc exact.

   | grotte | paroi m² avant → après | dessous m² avant → après | ms grtNappesG (Node, Mac chargé) |
   |---|---|---|---|
   | g451 p0 | 428 880 → 156 444 | 406 563 → 1 648 | **228** |
   | g452 p0 | 226 205 → 137 999 | 182 840 → 7 051 | 7 |
   | g451 p10 | 342 024 → 195 097 | 218 515 → 19 563 | 102 |
   | g452 p10 | 412 470 → 253 656 | **338 072 → 247 639 (−27 % seulement)** | 44 |

   Cases, graines 301-302 au palier 20 (`MAILLE=0`) : mur, flotte et contact passent à 0, et aucune nappe n'est supprimée. Attention : ce compte est vrai **par construction**, puisque la rive reclassée n'est plus comptée. Seul le maillage juge l'image.
5. **Mesure des images de l'auteur** (`mesure-image.py`, appliqué case par case sur ses planches, AVANT contre APRÈS, image entière) :
   - g1 p20 nuit lave-250 : lum 102,7 → 94,1 ; **rouge-orange vif 54,0 → 61,5 %** (le bas de l'image, mesuré par l'auteur : 56,4 → 79,6 %) ; brûlé 23,6 → 23,8.
   - g3 p20 matin : lave-250 lum 66,2 → 60,5 ; lave0h40 brûlé 23,6 → 24,5.
   - g1 eau0 et eau200 : identiques. Le trou noir du tour 2 est bien parti.
   - g56 matin eau0 : lum 39,6 → 37,9.
6. **Photos regardées** : `planche-g1-p20-nuit-{paysage,portrait}`, `planche-g56-p20-matin-paysage` et `planche-g3-p20-matin-paysage`.

### Défauts
1. **BLOQUANT, trop rouge et aplat.** `grottes-1.js:1312` force la salle 4 (`?4:`) sur la rive de lave. Le rideau de lave à motifs devient un **pavé orange uni, saturé, sans aucun dessin**.
   - Cas le plus net : g1 p20 nuit, vue lave-250, paysage et portrait. Rouge-orange vif +7,5 points sur l'image entière, +23 points en bas.
   - C'est exactement le « trop rouge » de Sacha. La coupe reste en plus une falaise orange debout dans le vide : la limite n'est pas lue comme de la roche. Le banc compte 0 m² de « paroi » de lave, mais seulement parce que le drapeau Fp est à 0 : à l'écran, la paroi est toujours orange.
   - Conseil : ne pas forcer `sal=4` plus bas que `L9.y−B*.5`, ou faire décroître le rougeoiement avec la profondeur (dans les nombres de la lumière cuite `Lt`, plutôt qu'une ligne de GLSL). Peindre la paroi en `GT.BASALTE` sombre, avec la braise seulement sur la lèvre. Cible : rouge-orange vif ≤ avant + 1 point, sur la vue lave-250 de g1 et de g3.
2. **BLOQUANT, l'eau n'a toujours pas de limite.** `grtRiveEau` (`grottes-1.js:1111`) remet l'eau sur toute paroi non tournée vers le bas, à toute profondeur.
   - Il reste 138 000 à 254 000 m² de paroi d'eau sous le niveau par grotte (g451/452).
   - Le creux sous le niveau, qui est un bug de génération (trou ou cuvette), reste dans le jeu. Il est seulement repeint comme avant.
   - Conseil : régler ce bug dans la génération des nappes, ce qui est permis dans ce lot. Le tour 2 a essayé de combler les creux par remplissage borné ; reprendre l'idée pour les seules fosses vues à travers le plan, ou abaisser localement le plan de la nappe. Prouver alors le coût en triangles (le tour 2 en ajoutait 14 à 84 : à mettre en regard du défaut, et à décider avec Sacha).
3. **g452 p10 : dessous 338 072 → 247 639 m²**, une baisse de 27 % seulement. Les nappes qui flottent restent peintes vues d'en dessous. Cause probable : les blocs fondus (`fu`) gardent `T.F`. À expliquer et à corriger.
4. **g56 p20 matin, vue eau0, paysage** : une tache brune sombre est découpée dans le dessous bleu de la nappe qui flotte (en haut à droite de la planche). C'est un patchwork. La nappe qui flotte, elle, est toujours là : bug de génération non réglé.
5. Non bloquant : sur les planches portrait de l'auteur, chaque vue fait environ 140 px de large, ce qui ne se juge pas. Il faut une planche par vue.
6. Non bloquant : `grtNappesG` a pris 228 ms sur g451 p0 en Node, Mac chargé (deux bancs en même temps), contre 34 ms annoncés dans le jeu. À mesurer en `?tel=1` sur cette graine.

### Pas vérifié par moi
- **Aucun passage au banc navigateur.** Le disque n'avait que 1,2 Go libres au départ (règle c), et le verrou était tenu par `auteur-boutiquegel`.
  - Je n'ai donc ni fait `?sans=nappes` contre avant en image, ni relevé `renderer.info` moi-même, ni regardé la console.
  - Mon jugement sur l'image repose sur les planches de l'auteur, mesurées et regardées.
- La glace, l'ambiance midi de nuit, le vrai téléphone.

## Correction 1 de la reprise du 19/11 (réponse au contrôle adverse, tour 1)

### Ce qui change (code/maps/grottes-1.js, grotte-travailleur.js ; rien dans grottes-2.js de plus)
1. **Les fosses se comblent, dans la génération des nappes** (`grtNappesG`, avant le calcul de la rive). Pas de hasard, la route est seulement lue. Deux passes :
   - **Poche fermée** (3D) : de l'air sous le niveau, collé à la nappe, de moins de 4 096 cases. Elle ne doit toucher ni l'autre nappe, ni passer à moins de `ROAD_HALF + 3 cases` d'un échantillon de route. Elle est remplie avec la densité de la nappe.
   - **Encoche du plan** : on ne regarde que la couche de cases juste sous le niveau. Une case d'air de cette couche est remplie si, sur l'axe x ou sur l'axe z, elle est bornée des deux côtés à moins de 5 cases (par la nappe ou la roche, dont au moins une fois la nappe). Cela referme le plan à l'échelle d'un sous-cube de portée (48 m) : le trou qu'on voyait d'en haut disparaît. Mêmes gardes que pour la poche. Le dessous de la couche devient une case de rive, donc de la roche.
   - **Mesuré** (banc Node) : presque tout l'air sous le niveau collé aux nappes forme une poche géante, la grotte d'en dessous (plus de 4 096 cases). La remplir noierait des salles entières : elle reste telle quelle. On remplit 74 à 608 cases par grotte (encoches : 72 à 424 ; poches : 1 à 11).
2. **L'eau ne garde que sa lèvre** (`grtRiveEau`) : la peinture d'eau d'une facette de rive d'eau s'arrête à 12 m sous le niveau. Plus bas, la paroi et les gradins sont de roche, comme pour la lave.
3. **Lave : le pavé orange est corrigé.** La salle 4, donc le rougeoiement plein sous le niveau dans GRT_FS, n'est forcée que sur les sommets de la lèvre de la rive de lave, à moins de 12 m sous le niveau. Plus bas, la paroi garde la roche de sa salle.
4. **Le dessous des blocs fondus** : une facette fondue qui regarde vers le bas prend la peinture de la rive (`grtVersBas`, ajouté à la liste du travailleur). Le travailleur reçoit `GRT_NAP.on`.
5. Le banc `outils/banc-routes/grotte-nappes.cjs` sépare maintenant `dessous` en deux : **dessousBas** (l'air dessous : une nappe vue d'en dessous) et **fond** (un sol sous le niveau vu d'en haut). Il compte aussi `trous`. Nouvel outil : `outils/banc-nappes/photos.cjs` (vrai jeu, ?tel=1, vues `lave-250`/`eau0`…, ou la vue `pire` d'un triangle du banc).

### Le défaut 3 (« g452 p10, dessous −27 % ») était une erreur de lecture
Le banc comptait comme « dessous » tout triangle horizontal sous le niveau, qu'il regarde vers le haut ou vers le bas. Avec la séparation :
- g452 p10, mesuré avec le code de cette correction AVANT la lèvre d'eau (point 2) : **dessousBas = 0 m²** (contre 68 147 avant le lot). Les 247 209 m² restants étaient des **fonds**, c'est-à-dire des gradins et des sols sous le niveau peints en eau. Le tour 3 n'a pas été remesuré avec la séparation.
- Ce sont précisément les « terrasses peintes sous le niveau » dont parle Sacha. Le point 2 les ramène à 13 326 m².

### Preuves Node (même champ, vrai mailleur ; graines 451-452 × paliers 0/10, dans cet ordre)
| grotte | paroi m² avant → tour 3 → **maintenant** | dessousBas m² avant → maintenant | fond m² avant → maintenant | triangles avant → maintenant |
|---|---|---|---|---|
| g451 p0 | 428 880 → 156 444 → **23 752** | 216 913 → 2 748 | 189 650 → 109 | 191 329 → 191 389 |
| g452 p0 | 226 205 → 137 999 → **19 975** | 174 233 → 1 954 | 8 607 → 3 110 | 171 880 → 171 496 |
| g451 p10 | 342 024 → 195 097 → **25 694** | 140 208 → 0 | 78 308 → 6 068 | 226 446 → 226 340 |
| g452 p10 | 412 470 → 253 656 → **37 661** | 68 147 → 0 | 269 926 → 13 326 | 232 400 → 230 808 |

- Sur les 4 grottes : `cote`, `flotte`, `contact` et `route` à 0, `noyes` inchangé.
- Triangles : de +60 à −1 592 par grotte, soit −0,2 % au total (822 055 → 820 033).
- **La route au bit près** : l'empreinte `h` est identique avant et après sur les 4 grottes.
- **L'interrupteur** `?sans=nappes` contre le grottes-1.js de `finition-lots/avant` (G1), sur les mêmes 4 grottes : hP 1735991468 = 1735991468, hF 927348276 = 927348276, triangles 822 055 = 822 055, empreinte des routes 5533dc9c = 5533dc9c.
- **Le travailleur** (`TRAV=1`, paliers 0 × 451-452) : 878 tronçons, 0 octet différent.
- **Le temps de `grtNappesG`** (Node, Mac chargé) : 29 à 75 ms. En jeu `?tel=1` : 57 ms (g1 p20), 73 ms (g3 p20), 112-116 ms (g56 p20, 351 887 cases). C'est du calcul en tranches (`yield` toutes les 2 048 cases), pas une image figée. Il n'a pas été mesuré sur g451 p0 en jeu.
- **Paroi restante** (20 000 à 38 000 m²) : la lèvre de 12 m (de 6 à 12 m sous le niveau, que le banc compte), plus les rives au contact d'une poche ouverte (une salle sous le niveau, la route).

### Le vrai jeu, `?tel=1`, 844×390 et 390×844 (deux passages sous le verrou : 19 h 18 - 19 h 22, 20 h 09 - 20 h 12 ; 0 erreur console)
Les caméras sont calculées une fois dans la page d'AVANT (`dbgGrotte('lac',{…,dis:1})`), puis reposées telles quelles. Image entière, AVANT → APRÈS :

| vue | format | lum | rouge-orange vif % | brûlé % | noir % |
|---|---|---|---|---|---|
| g1 p20 nuit lave-250 | paysage | 63,9 → 63,9 | **39,43 → 39,53** | 22,50 → 22,54 | 31,4 → 31,5 |
| g1 p20 nuit lave-250 | portrait | 59,8 → 60,2 | 29,80 → 29,76 | | 41,1 → 41,1 |
| g1 p20 nuit eau0 | paysage | 56,8 → 56,7 | 0,70 → 0,71 | 0,68 → 0,68 | **29,07 → 29,07** (pas de trou noir) |
| g3 p20 matin lave-250 | paysage | 78,7 → 76,3 | 44,46 → 43,50 | 22,89 → 22,16 | |
| g56 p20 matin lave-250 | paysage | 64,6 → 59,6 | **32,16 → 34,29** | 16,65 → 17,51 | |
| g56 p20 matin lave-250 | portrait | 68,4 → 68,3 | 51,13 → 51,10 | | |
| g56 p20 matin eau0 | paysage | 100,2 → 98,4 | 0,80 → 0,79 | 0,92 → 0,93 | |

- Le pavé orange de g1 lave-250 a disparu : +0,1 point de rouge, contre +7,5 au tour 3.
- **g56 lave-250 paysage, +2,1 points** : c'est le seul écart au-dessus de +1. À droite, AVANT montrait une **paroi d'EAU cyan** debout au bord de la lave (le contact lave ↔ eau, un des défauts de Sacha). Elle est maintenant de la roche de la salle de lave, éclairée en orange par la lumière cuite. Voir la planche g56 lave-250.
- g3 lave-250 : la lave debout au bord gauche (jaune, éblouissante) est devenue de la roche orange sombre.
- **`?sans=nappes` contre AVANT** : mêmes nombres à ±0,1 près sur g1 (lave-250 39,54 contre 39,43 ; eau0 29,07 = 29,07).
- **renderer.info** (même caméra, après la fusion des petits tronçons, `lotsRestants = 0`). Programmes : 149 = 149. Textures : 119 = 119 ou 121 = 121.
  - Appels : g1 lave-250 99 → 98 ; eau0 111 → 110 ; g452 p0 20 → 19 (`sans` : 21) ; g451 p10 53 → 56 (portrait : 30 → 26).
  - Triangles de la grotte entière (`dbgGrotte().n.triangles`) : g452 p0 276 151 → 275 763 ; g451 p10 509 140 → 509 384 (+0,05 %) ; g1 p20 496 335 → 496 433 (+0,02 %).
  - Au 1er passage, g1 paysage avait +7 appels : les lots n'étaient pas encore fondus. Ce n'est plus le cas une fois qu'on attend `lotsRestants = 0`.
- **Le temps de `grtNappesG` en jeu** : 26 à 258 ms (g451 p10 : 542 312 cases, 157-258 ms), en tranches, Mac à charge ~20.
- **Les vues `pire` du banc Node** (g452 p0, g451 p10) : en jeu, le niveau des lacs diffère de quelques mètres de celui du banc (−590 contre −593). Elles tombent dans le noir (90 % de pixels noirs avant comme après) et ne prouvent rien : planches non gardées.
- **Planches** (10, toutes refaites, les anciennes du tour 3 sont retirées) : `planche-g1-p20-nuit-{lave-250,eau0}-{paysage,portrait}.jpg` (paysage : AVANT | ?sans=nappes | APRÈS), `planche-g56-p20-matin-{lave-250,eau0}-{paysage,portrait}.jpg`, `planche-g3-p20-matin-{lave-250,eau0}-paysage.jpg`. Une vue par planche.

### Ce qui n'est PAS vérifié
- Le vrai téléphone n'a rien vu.
- La glace (`met==='glace'`) n'a pas été photographiée.
- Le banc Node change de grotte selon l'ordre des graines (g452 p10 seule : lac −995, eau −758 ; après g451 : −993 et −191). Les nombres du tableau Node viennent de l'ordre 451-452 × 0/10.
- Aucune photo du jeu ne montre une encoche refermée vue de près. Les vues `lac` regardent la nappe depuis la route, et les vues `pire` du banc ne correspondent pas aux grottes du jeu.
- Il reste de 2 000 à 2 700 m² de dessous peint par grotte : le dessous des couches d'encoche fines, dont la lèvre garde la peinture du lac. Ce n'est visible que depuis l'air sous le niveau.
- Le jeu : une chute dans une poche comblée tue maintenant par « eau » ou « lave » au lieu de « roche ». La route n'y passe jamais (garde à ROAD_HALF + 36 m).

### Décisions pour Sacha
1. **Les poches géantes sous le niveau ne sont pas noyées.** Seules les poches fermées et les encoches de 48 m sont comblées. Le reste garde un bord de roche avec une lèvre de lave ou d'eau de 12 m.
2. **g56 lave-250 : +2 points de rouge.** Ils viennent de la paroi d'eau, devenue roche de la salle de lave. Garder la roche, ou demander une roche plus sombre (une ligne de GLSL, même coût) ?

## Contrôle adverse, reprise du 19/11, tour 2

Contrôleur indépendant, 19/11 vers 20 h 15 - 20 h 35. Je n'ai pas touché au code du lot (commit 8259ede8d). **Verdict : FUSIONNABLE**, avec des réserves non bloquantes.

### Ce que j'ai exécuté
1. **Le diff** `origin/main...HEAD` : `grottes-1.js`, `grottes-2.js`, `grotte-travailleur.js` et des outils. Ni index.html ni sw.js. Pas d'`IS_MOBILE`. Je n'ai trouvé ni texture, ni mesh, ni matériau, ni GLSL. Côté CPU : `T.Fp` (80 Ko), la liste `LST` (Int32Array) et le remplissage des poches et des encoches.
   - Sous `?sans=nappes`, j'ai relu toutes les branches nouvelles : `lvP===lv`, `Fp=F`, `grtRiveEau` ne fait que redire le drapeau 2, et le forçage de la salle 4 est éteint. C'est bien l'image d'avant.
2. **Assemblage** `--depuis-morceaux` : 349 morceaux d'accord. Les gardes burnout, charte, allège et démarrage (21 scripts) passent. Compilation `vm.Script` : la seule erreur vient d'un faux positif de mon extracteur, et elle est identique dans `avant`. `GRT_NAPPES`, `grtNappesG`, `grtRiveEau` et `grtVersBas` ne sont déclarés qu'une fois.
3. **La route au bit près** (`ctl19-route.cjs`), graines **461-480 × paliers 0/20**, le lot contre le `grottes-1.js` d'avant : **40/40 empreintes identiques**, 0 erreur.
4. **Banc des nappes** (`grotte-nappes.cjs`), graines **377-378 × paliers 0/20**, que l'auteur n'avait pas choisies.
   - L'interrupteur est exact : `G1=avant` et `SANS=nappes` donnent les mêmes hP, hF, triangles et `h` que l'avant interne, sur les 4 grottes.

   | grotte | paroi m² | dessousBas m² | fond m² | cote / flotte / contact | triangles |
   |---|---|---|---|---|---|
   | g377 p0 | 327 464 → 24 472 | 37 502 → **9 074** | 63 814 → 269 | 2 154/444/0 → 0/0/0 | 270 627 → 268 787 |
   | g378 p0 | 471 478 → 60 372 | 381 058 → 163 | 62 439 → 0 | 2 628/2 900/36 → 0/0/0 | 118 890 → 119 064 |
   | g377 p20 | 1 350 561 → **91 838** | 16 404 → 3 316 | 1 317 252 → 273 | 9 725/136/2 772 → 0/0/0 | 288 974 → 289 152 |
   | g378 p20 | 499 852 → 16 781 | 340 034 → **9 180** | 102 762 → **32 328** | 3 066/2 507/0 → 0/0/0 | 369 914 → 368 568 |

   - Sur les 4 grottes, `route` et `noyés` restent à 0 et l'empreinte `h` est identique. Aucune nappe n'est supprimée : on comble 168 à 1 736 cases.
   - `grtNappesG` en Node : 64 à **359 ms** (g377 p20, 718 322 cases), calcul en tranches.
   - **Le travailleur** (`TRAV=1`, g378 p0) : 419 tronçons, 0 écart.
5. **Vrai jeu `?tel=1`, un passage sous le verrou** (20 h 19 - 20 h 25, place 2). 844×390 et 390×844. Graines 23 (nuit p20), 88 (**glace** p10), 141 (soir p20) et 7 (midi p0). Vues lave-250 et eau0 ; avant (8610), lot (8611) et lot `?sans=nappes`.
   - **Console** : 0 exception, 0 erreur sur toutes les pages.
   - **`?sans=nappes` contre avant** : triangles de la grotte entière identiques (g88 403 941 = 403 941 ; g23 556 096 = 556 096). Image g88 glace : lum 107,0 contre 107,1, rouge 0,71 = 0,71, brûlé 36,36 contre 36,37 (eau0 : 77,1 = 77,1).
   - **renderer.info, avant → lot** :
     - Programmes 149 = 149 et textures 119 = 119 partout.
     - Appels égaux ou −1 : g23 d 45/48 = 45/48 ; g88 78/84 → 77/84 ; g141 49/57 = 49/57 ; g7 158/96 = 158/96.
     - Triangles de la grotte entière : g88 −0,65 %, g23 −2, g141 +0,04 %, g7 −0,2 %.
     - Géométries en mémoire : de −1 à +5. Le même bruit existe entre `sans` et avant (+1).
   - **Mesures avant → après** (image entière) :

     | vue | lum | chroma | brûlé % | rouge-orange vif % | noir % |
     |---|---|---|---|---|---|
     | g23 nuit lave-250 portrait | 68,3 → 69,1 | 146,2 → 146,3 | 25,5 → 26,4 | 54,2 → 54,9 | 20,2 → 19,2 |
     | g23 nuit eau0 portrait | 51,4 → 49,4 | 79,9 → 75,9 | 1,18 → 1,07 | 1,14 = 1,14 | 20,4 → 19,1 |
     | g88 glace lave-250 paysage | 107,0 → 107,5 | 123,2 → 124,1 | 36,4 → 36,2 | 0,71 → 0,37 | 9,5 → 8,4 |
     | g88 glace eau0 paysage | 77,1 → 76,6 | 145,5 → 144,6 | 5,76 → 5,44 | 0,74 → 0,42 | 0,33 = 0,33 |
     | g141 soir eau0 portrait | 99,2 → 98,9 | 147,0 → 146,8 | 2,50 → 2,51 | 1,18 → 1,17 | 0,12 |
     | g141 soir lave-250 portrait | 34,5 → 41,7 | 80,6 → 92,1 | 1,09 → 1,07 | 1,15 = 1,15 | 0,13 |
     | g7 midi lave-250 paysage | 34,2 = 34,2 | 70,8 → 72,3 | 1,90 → 2,13 | 4,61 → 5,62 | 0,14 |

   - **Photos regardées** (`controle/ctl19b-*.jpg`) :
     - g88 glace eau0 et g141 soir eau0 : identiques.
     - g23 nuit lave-250 : la nappe est la même. Seuls changent les traits de vitesse et la route au-dessus, selon le moment de la course.
     - g7 midi : la même, sauf l'aura de la voiture, qui dépend de l'état du jeu.
     - g141 soir lave-250 : la caméra est à 10 m au-dessus du niveau, sans lave visible, ni avant ni après (probablement dans la roche, d'où un écran de brume). Le trait sombre d'avant a disparu, d'où lum +7 : la vue ne prouve rien.
     - Je n'ai vu aucun trou noir, aucun aplat, aucune couleur criarde ni aucune route moins lisible.
     - Je n'ai trouvé aucune hausse de rouge au-dessus de +1 point sur mes graines (g7 : +1,0, quelques facettes de paroi).
6. **Les planches de l'auteur** : il y en a 10. g1 et g56 existent en paysage et en portrait, g3 en paysage seulement. Sa NOTE ne contredit pas mes mesures, à une nuance près (réserve 1).

### Réserves (aucune n'est bloquante)
1. Non bloquant : la NOTE annonce une « paroi restante de 20 000 à 38 000 m² ». Sur mes graines, il en reste **60 372 (g378 p0) et 91 838 (g377 p20)**. La baisse dépasse quand même 87 %. Il reste aussi **9 074 et 9 180 m² de dessousBas** (g377 p0, g378 p20), contre « 0 à 2 748 » annoncés, et 32 328 m² de fond sur g378 p20. Ce sont des défauts de génération résiduels, vus seulement depuis l'air sous le niveau.
2. Non bloquant : `grtNappesG` atteint 359 ms en Node sur g377 p20 (718 k cases). Le calcul est en tranches, mais il n'a pas été mesuré sur le vrai téléphone.
3. Non bloquant : sur les vues standard (lave-250, eau0), le lot ne change presque rien à l'œil. Il retire des défauts de génération sans rien embellir de plus. C'est conforme à la mission (« ne pas redessiner »).
4. Non bloquant : `controle/` contient 15 photos des tours précédents en plus de mes 6. Je ne les ai pas retirées : c'est à l'orchestrateur de décider.

### Pas vérifié par moi
- Le vrai téléphone.
- Une encoche ou une poche comblée vue de près en jeu.
- Le scénario avant g23 paysage : « grotte pas prête » au démarrage à froid. Je l'ai remplacé par `?sans=nappes` contre le lot sur la même caméra.
- La mort par « lave/eau » au lieu de « roche » dans une poche comblée (la route est gardée à plus de 64 m).

## Reprise du 19/11 au soir (après le contrôle du tour 2)
La consigne de reprise parlait d'une correction « coupée en route, non commitée ». Ce n'est plus le cas : ce travail a été fini et commité dans 8259ede8d (« correction 1 »), qui est déjà sur origin/finition-maps-grotte. Le contrôle du tour 2 l'a jugé **FUSIONNABLE**. Je n'ai rien changé au code, et je n'ai lancé aucun banc Chrome, pour ne pas ajouter de passage au verrou.

Vérifié de nouveau :
- HEAD = origin/finition-maps-grotte = 8259ede8d, qui part de origin/main dbc5f1d54.
- `assembler --verifier` : 349 morceaux d'accord.
- Gardes charte, burnout et allège : 0. Garde du démarrage : OK, 21 scripts.
- Pas d'`IS_MOBILE` dans le diff.
- Arbre propre, sauf `outils/banc-routes/ctl19-route.cjs`, qui appartient au contrôleur et n'a pas été commité.

Les défauts du contrôle du tour 1 et où ils ont été traités (détails et nombres plus haut, dans la section « Correction 1 ») :
1. Pavé orange : la salle 4 n'est plus forcée que sur la lèvre de 12 m. Rouge sur g1 lave-250 : 39,43 → 39,53.
2. Eau sans limite : les fosses et les encoches sont comblées, et l'eau ne garde que sa lèvre. Paroi : −90 % à −94 %.
3. g452 p10 : c'était une erreur de lecture du banc (dessous et fond étaient mélangés). dessousBas passe de 68 147 à 0.
4. Tache de g56 : c'était un fond peint, maintenant en roche.
5. Une planche par vue.
6. Temps en jeu mesuré : 26 à 258 ms, en tranches.

Restent ouverts (réserves non bloquantes du tour 2) :
- Il reste jusqu'à 9 000 m² de dessousBas et 92 000 m² de paroi sur certaines graines, visibles seulement depuis l'air sous le niveau.
- `controle/` contient 21 photos, au lieu des 6 prévues. Celles des 18/11 (ctl-, ctl2-) sont à retirer sur décision de l'orchestrateur.
- Le vrai téléphone n'a rien vu.
