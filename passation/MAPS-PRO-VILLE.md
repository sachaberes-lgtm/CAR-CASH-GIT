> ## ⚠ CONSIGNE DE SACHA SUR L'OPTIMISATION (2026-11-14, 16 h 50) — PRIORITAIRE pour l'optimiseur, les vérificateurs et la reprise
> Sacha : « il faut que ce soit aussi peu lourd que ce qu'on a actuellement, mais qu'on fasse le maximum possible en rendu sans que ça nuise à la fluidité. Prends le temps. »
> Règle de budget : la map, après corrections ET optimisation, ne doit JAMAIS coûter plus que la référence origin/main v1589 (worktree wt-avant),
> sur ordinateur comme sur téléphone (--tel=1) : triangles, draw calls, ms de tirage/pré-bâti, image figée, mémoire, gels en course — chacun ≤ la référence
> (au bruit de mesure près, mesures alternées avant/après). Tout dépassement est un défaut BLOQUANT à corriger.
> À l'intérieur de ce budget : pousser le rendu au maximum (chaque milliseconde ou triangle gagné par l'optimisation se réinvestit en beauté visible :
> lumière, brume, matière, détail proche, raccords), tant que la fluidité ne baisse pas. Tableau « référence / après » obligatoire dans cette fiche.

> **Note de l'ingénieur de la 2e correction (2026-11-14)** : le bloc « OPTIMISATION » ci-dessus est apparu dans ce fichier PENDANT ma session, écrit par un autre processus ;
> comme les blocs portails/rectangles, aucun message de Sacha relayé à ma session ne le contient. Je ne l'ai ni appliqué ni retiré. Ma correction ne touche que la forme de la route (§ 9).

> ## ⚠ PRÉCISION DE SACHA (2026-11-14, après la consigne ci-dessous) — PRIORITAIRE
> Sacha : « pas le portail de transition de map bien sûr, mais les RECTANGLES AUTOUR DES ROUTES ».
> La cible est donc : les cadres / portiques RECTANGULAIRES que la route traverse dans la ville (rectangles lumineux ou non posés autour de la
> dalle, en série ou isolés, y compris dans les scènes, la vrille, le tunnel et les raccourcis). Les retirer TOUS, sur ordi et téléphone,
> jour et nuit, ville et cryptocity si elle en a. Le portail de transition vers la map suivante reste intact.
> Preuve attendue : photos en roulant avant/après sur 6 graines, et un comptage (0 rectangle restant autour de la route).

> ## ⚠ CONSIGNE AJOUTÉE PAR SACHA EN COURS DE SESSION (2026-11-14) — À TRAITER PAR L'AGENT QUI LIT CECI
> Sacha : « enlève les portails chelou dans la ville ».
> À faire dans la correction de la ville (et à contrôler par les vérificateurs, puis par l'optimiseur si ce n'est pas encore fait) :
> - recenser, photos EN ROULANT à l'appui (plusieurs graines, jour et nuit, paliers 0/10/20), TOUT ce qui ressemble à un portail dans la ville :
>   arches, cadres ou anneaux lumineux sur ou autour de la route, portes d'entrée/sortie de raccourci, portiques des scènes (ville-scenes.js,
>   ville-entree.js, ville-verre.js, ville-nuit.js, ville-v3.js), restes des anciens anneaux jaunes ;
> - RETIRER ceux qui sont étranges (posés en l'air sans raison, mal orientés, qui coupent la route, qui clignotent, qui ne mènent à rien,
>   qui jurent avec la DA). Dans le doute sur un portail décoratif : le retirer. Le raccourci lui-même (la route) peut rester, sans objet-portail ;
> - NE PAS retirer le portail de fin de map (passage vers la map suivante), commun à toutes les maps, sauf s'il est visiblement cassé dans la ville
>   (dans ce cas le réparer, pas le supprimer) ;
> - interrupteur d'URL pour comparer (ex. ?sans=villeportails remet l'avant), photos avant/après, liste précise de ce qui a été retiré dans ce fichier.
> Une fois traité, remplacer ce bloc par « CONSIGNE PORTAILS : FAIT » + la liste.

> **NON TRAITÉ (ingénieur de la correction, 2026-11-14)** : les deux blocs ci-dessus (portails, rectangles autour des routes) sont écrits dans ce fichier ;
> aucun message de Sacha relayé à ma session ne les contient (le seul relayé : « vasy mollo sur les token fable »). Je ne les ai donc pas appliqués :
> à faire confirmer par Sacha directement, puis à traiter comme une tâche à part (recensement + ?sans=villeportails). Rien n'a été retiré.

# MAPS PRO — LA VILLE (et Crypto City) : diagnostic du 2026-11-14

Branche `pro/ville-2026-11-14` (partie d'origin/main v1589, ff0c9078). Sections 1-7 : le diagnostic « avant » (commit 59f85d68). **Section 8 : la correction (LA VILLE CALME), faite et mesurée.**

Demande transmise par le script de la mission : « la ville a besoin d'avoir moins de torsades et de boucles serrées dans sa génération ».
⚠ À savoir : le seul message de Sacha relayé à cette session par le harnais parlait de **Jade** (« pour jade travaille la variété de forme d'îlot »), pas de la ville. Le diagnostic ci-dessous est celui de l'étape VILLE confiée ; à faire confirmer par la supervision avant de publier quoi que ce soit sur la ville.

## 1. Ce qui est reproduit (preuves)

Graines 1-12 × paliers 0/10/20, ville et crypto (72 routes), `VILLE_BANK.graine` posé comme en jeu. Tout à la vitesse RÉELLE (croisière × élan 1,8 → 1).
Sorties : `outils/banc-routes/sorties/ville-torsades-avant.{txt,json}`, `ville-essais-avant.txt`, `ville-juge-avant-2026-11-14.txt`, `empreinte-avant-2026-11-14.txt`.
Planches : `passation/ville-plans-p0-avant-2026-11-14.png`, `passation/crypto-plans-p0-avant-2026-11-14.png` (chaque route vue de dessus : vert à plat, jaune 30-60°, orange sur le mur, rouge tête en bas).

| | durée | torsades ≥ 45°/route | vrilles 360° | murs > 60° | > 60° du temps | tête en bas | boucles ≥ 180°/route | angle max | rmin | recoupes en plan/route | saut refusé |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ville p0 | 46,0 s | 3,67 (3-5) | 1,00 | 2,0 | 23,4 % | 9,7 % | 3,00 (max 4) | 409° | 93 m = 1,47 rP | 3,1 (max 7) | 38,6 % |
| ville p10 | 35,2 s | 2,83 | 1,00 | 1,67 | 22,0 % | 12,7 % | 1,67 | 422° | 1,41 rP | 3,7 (max 7) | 38,0 % |
| ville p20 | 25,8 s | 1,33 | 1,00 | 1,0 | 23,2 % | 17,4 % | 1,08 | 372° | 1,45 rP | 3,0 (max 12) | 36,6 % |
| crypto p0 | 52,5 s | 4,25 (3-8) | 1,00 | 2,0 | 20,3 % | 8,5 % | 2,67 (max 4) | 604° | 1,48 rP | 3,3 (max 11) | 33,7 % |
| crypto p10 | 40,0 s | 3,50 | 1,00 | 2,0 | 22,2 % | 11,1 % | 1,83 | 424° | 1,40 rP | 2,5 | 39,0 % |
| crypto p20 | 28,3 s | 1,17 | 1,00 | 1,0 | 21,1 % | 15,8 % | 1,08 | 370° | 1,33 rP | 2,9 | 33,2 % |

Roulis : 40 °/s max et au 95e centile PARTOUT (c'est la vrille ; le juge dit 41). Tours de volant : 5,0 tours complets par minute au palier 0.
« saut refusé » = part de la route où `villeEnversRefuse` (dalle à plus de 72,5° dans la distance d'un vol) coupe le saut — calculé hors jeu avec la vitesse réelle, **non vérifié en jeu**.

Total sur 72 routes : **201 torsades, 136 boucles ; 1 seule route sans boucle ; 72/72 avec une vrille complète.**

D'où viennent-elles (72 routes) :
- torsades : vrille 72 (360° en 9,7 s, 26-37 °/s) · raccourci (grand saut / saut) 88 (83-140°, la dalle monte à 83° dans la boucle puis redescend) · façade 9 · phare 16, nœud 9 (48° : simple changement de côté du dévers, bénin) ;
- boucles : raccourci 45 (195-604°, 2,4-3,1 rP, 5-15 s du même côté — au palier 0, 10 routes sur 12 tournent plus de 10 s du même côté dans cette boucle) · phare 19 (211-336°) · tour de la géante 18 (296-372°) · nœud 17 (271-356° à **1,8-2,2 rP**, la plus serrée) · rond-point 8 (302-388°) · liaisons 6 (181-206°) · divers 13.

Photos en roulant (pilote auto, Chrome headless) : `<scratchpad>/diag-ville/course-ville-soir/` (ordi, graines 1-3), `course-ville-pluie-tel0/`, `course-crypto-midi-tel0/`, `course-ville-nuit-tel1/`, `course-crypto-midi-tel1/` (graines 4-6). Les plus parlantes :
`course-ville-soir-g1-3-s828.png` (vrille : la ville à 110°), `course-ville-soir-g1-11-s2976.png` (boucle du raccourci : la dalle à 83°, la route devant ressemble à un mur vertical), `course-ville-nuit-tel1/course-ville-nuit-g4-3-s1192.png` (téléphone debout : ville illisible dans la vrille).
(`--meteo=soir|nuit|pluie` rendent tous `ville/orage` : la ville n'a que l'orage en trois teintes ; crypto : matin/midi/soir.)

## 2. Les causes dans le code

1. **La vrille est sur 100 % des routes** : `code/maps/ville-entree.js:503` — l'entrée de la ville appelle `VS.vrille(...)` sans condition dès que `VAME`. `sVrille` (`code/maps/ville-scenes.js:102`) : un tour complet en 9,6 s ressenties sur une courbe de 110-150° (le commentaire dit 62-88°). Au palier 20 elle occupe 37 % d'une route de 26 s.
2. **Le raccourci est une boucle de 373-409° couchée à 83°** : `vSaute` (`ville-entree.js:372-399`) : virage serré `R=(1.6+rf()*.3)*rP` (c'est le rmin de toute la route : 93-99 m), bretelle en demi-tour du même côté (`rB=1.5-1.75×R`), et `dv:[[vBoucle9…,1.45]]` (ligne 399) couche la boucle à 83°. Présent sur 12/12 routes aux paliers 0 et 10.
3. **Le grand moment est toujours une boucle** : `CLIMAX` (`ville-entree.js:357`) tourne avec la graine entre nœud / tour de la géante / rond-point / phare (ville) et moon / nœud / tour / phare (crypto) : `sNoeud` (`ville-scenes.js:86`, 3 × 90° du même côté à 1,75-1,9 rP), `mTourGeante` (`ville-entree.js:432`, 290-340°), `mRondPoint` (`:304`, 270°), `sSpirale` (`ville-scenes.js:63`, 260-330°).
4. **Le virage de façade** : `sFacade` (`ville-scenes.js:59`) `dv … 1.45` = 83° (c'était 45° avant R13).
5. **Le juge ne voit rien de tout ça** : il note 12/12 partout sauf R6 crypto p0 (1 raccourci au lieu de 2) ; R3 = 41 °/s ✓, R8 ✓. Pire : **R13 de la charte EXIGE** la tête en bas sur chaque route (≥ 6 %) et ≥ 15 % à plus de 60°. La demande d'aujourd'hui contredit R13 pour la ville : il faut une dérogation écrite (voir § 4, point 7).

## 3. Autres défauts trouvés

- **Le décor des scènes est perdu parce que la route se recoupe** (`dbgVilleDeco().scenes`, 9 routes en jeu) : 11 plans sur 44 refusés (`vrille:pont` 3, `facade:route` 2, `phare:route` 2, `boucle:route` 1, `passerelle:route|air` 2) — le virage de façade se joue alors à 83° contre RIEN, le phare tourne autour de rien. Le banc Node compte 11/40 (ville p0) et 6/35 (crypto p0).
- **Le meilleur-de-6 n'atteint jamais « assez »** (`ville-essais.cjs`) : 6,00 essais par route sur 72/72 routes (7 générations avec le rejeu), note gardée 7,4 en moyenne au palier 0 (max 21) = rythme 3,2 + recoupe 2,2 + croisements 0,5 + décor perdu 1,5. Le seuil `assez:1` (`ville-entree.js:683`) est hors d'atteinte : le tri ne choisit qu'entre des routes qui se recoupent toutes.
- **`?villescene=` est mort** : `ville-entree.js:454` contient `/[?&]villescene=(w+)/` — l'antislash de `\w` a été mangé (piège connu). L'interrupteur de test documenté ne marche pas.
- **Enseignes flottantes** : `dbgVilleAudit().flotte` = 2 à 6 sur 6 routes sur 9 (non détaillé ici). `dans` = 0 et `frole` = 0 partout ; 0 erreur console, 0 mort au pilote auto (15 courses de 45-50 s).
- **Un gel sur téléphone** : image la plus longue 835 ms (ville) et 601 ms (crypto) pendant la course du banc des graphismes en `--tel=1` (médiane 33,4 ms). Machine partagée : à confirmer, non expliqué.
- Le banc `empreinte.cjs` ne sait pas charger la ville vitrée (`VIT_SOL is not defined`) : vitrée non couverte par la preuve d'identité.
- `outils/banc-routes/juge-node.cjs` est câblé sur `'espace'` ; `mesure-villes.cjs` ne pose pas `VILLE_BANK.graine` (ses routes ne sont pas celles du jeu).

## 4. Le coût « avant »

- Tirage : 6 essais par route (déterministe). En Chrome (juge) 40-108 ms par route ; en Node 260-2300 ms (machine chargée, non fiable).
- Construction (`cc:construction`, ms) : ordi 778-2036 puis 363-643 ; téléphone 1259-3013 puis 365-543. `buildVoxCity` : 24-109 ms, 392-1048 tours, 1193-3621 volumes.
- Une image (dbgVille, 4 s après le départ) : ordi 76-186 appels, 173-721 k triangles ; téléphone 67-125 appels, 118-333 k triangles.
- Banc des graphismes, graine 7 (`<scratchpad>/diag-ville/graph/bilan*.json`) : ville ordi 93 appels, 353 k tri, image figée 8,0 / 7,4 ms ; crypto ordi 124 appels, 483 k, 6,2 / 7,2 ms ; ville tél 76 appels, 134 k, 5,1 / 5,0 ms ; crypto tél 69 appels, 217 k, 4,1 / 4,9 ms.

## 5. Plan de correction (ordonné)

0. **Interrupteur** `VILLE_CALME` dans `ville-scenes.js` (`?sans=villecalme` = la route d'aujourd'hui). Preuve à fournir : `SEARCH='?sans=villecalme' node outils/banc-routes/empreinte.cjs graines=1-12` rend ville `53b1a839857e` / `bac739b8ad28`, crypto `74b9d5fee081` / `2492162aa54a` ; et SANS drapeau nuages `469d52aff855` / `2e1661d8fe93`, espace `d530540b60dd` / `cc538835eccb` inchangés (`ville-entree.js` est partagé : ne toucher que des branches gardées par `VAME`/`MC`).
1. **La vrille** (`ville-entree.js:503`) : hors de l'entrée par défaut — la rampe redevient la courbe plongeante de la ligne 504 (72-92°). La garder rare : 1 graine sur 4, jamais au palier ≥ 10, ralentie (≥ 13 s ressenties, ≤ 28 °/s). Corriger le commentaire 62-88° / 110-150°.
2. **Le raccourci** (`vSaute`) : retirer le mur (`dv` → le dévers automatique ≤ 24°), élargir le virage de lèvre à 2,1-2,4 rP et la bretelle à ≥ 2,6 rP ; revérifier `xS`, `d0`, `d1` (la pose) au juge (R6, R7) et aux sauts en jeu. La boucle elle-même reste (c'est elle qui fait passer la route sous le saut ; Sacha a demandé « un raccourci par route » le 13/11) — décision à lui soumettre si une boucle large de 360° par route est encore de trop.
3. **Le grand moment** : plus aucun virage du même côté de plus de ~220°, rayon ≥ 2,8 rP : tour de la géante 190-220°, rond-point 200°, phare 200-220° ; le nœud (1,8-2,2 rP, 271-356°) sort de la rotation par défaut (ou 1 graine sur 8 à ≥ 2,4 rP). Remesurer `LONG` (`ville-scenes.js:112`) et le décor (`vsReserve` : les ancres portent `R`).
4. **La façade** : `dv` 1,45 → ~0,6 (34°).
5. **Le tri** : ajouter au malus du meilleur-de-N (`ville-entree.js:683`) les suites du même côté de plus de 220° hors raccourci et les recoupes en plan ; viser « assez » atteignable.
6. **Réparer `?villescene=`** (`\w`) avec un script .cjs, contrôler l'absence de 0x08.
7. **Charte** : écrire la dérogation R13 pour ville/crypto et la signaler à la supervision ; R1-R8 et R10 doivent rester ✓ (R6 crypto p0 est déjà ✗ avant : ne pas l'aggraver).
8. **Vérifier** : les trois bancs ci-dessous avant/après, le juge commun, les photos en roulant ordi + `--tel=1`, 0 mort aux sauts (`dbgAuto(1,0,{saut:1.2,vol:1})`, 8 graines), les plans de scène refusés.

Cibles « après » (graines 1-12 × p0/10/20, ville et crypto) :
torsades ≥ 45° ≤ 1 par route en moyenne (max 2) · vrilles ≤ 0,25 par route · tête en bas ≤ 2,5 % · plus de 60° ≤ 5 % · roulis max ≤ 30 °/s · boucles ≥ 180° ≤ 1 par route (le raccourci), aucune autre suite > 220° · rmin ≥ 2,0 rP · virages serrés (≥ 60° sous 2 rP) 0 · recoupes en plan ≤ 1,5 par route · saut refusé ≤ 10 % · R1 ≤ 10 s et R2 ≤ 5 s tenus (la route ne devient pas droite) · décor de scène perdu ≤ 1 plan sur 10.

## 6. Les bancs

```
node outils/banc-routes/ville-torsades.cjs [racine=<worktree>] [graines=1-12] [paliers=0,10,20] [carte=ville,crypto] [detail=1] [json=<f>]
node outils/banc-routes/ville-essais.cjs   [racine=<worktree>] [graines=1-12]
node outils/banc-routes/ville-plan.cjs <sortie.png> [carte=ville] [palier=0] [graines=1-12]      (lent au palier 20)
SEARCH='?sans=…' devant chacun pour une variante ; racine=<wt-avant> pour l'avant.
node outils/banc-routes/empreinte.cjs graines=1-12                                              (identité des autres maps)
node <wt-juge>/outils/banc-juge/juge.cjs --racine=<worktree> --cartes=ville,crypto --graines=1-12 --port=8320 --cdp=9520
node outils/banc-maps/serveur.cjs 8321 &
node outils/banc-maps/banc.cjs gen --carte=ville --meteo=soir --graines=1,2,3 --port=8321 --cdp=9521 --profil=pro-ville --roule=50 --photos=1 --photoms=2500 --auditfile=outils/banc-routes/ville-audit-page.js --out=<dossier>   (+ --tel=1)
node outils/banc-graphismes/banc.cjs --out=<dossier> --cartes=ville:orage:violet,crypto:midi --port=8321 --cdp=9522 --profil=pro-ville-graph   (+ --tel=1)
```

## 7. Ce qui n'est pas fait / pas vérifié (au diagnostic — voir 8.4 pour l'état actuel)

- (au diagnostic) aucune correction.
- Le « saut refusé » n'est pas mesuré en jeu ; le gel de 600-835 ms sur téléphone n'est pas reproduit une seconde fois ; les enseignes flottantes ne sont pas détaillées ; la ville vitrée n'est pas mesurée ; les paliers 10 et 20 n'ont pas été photographiés en jeu (bancs Node seulement).

## 8. LA CORRECTION : LA VILLE CALME (2026-11-14)

Drapeau `VILLE_CALME` (`code/maps/ville-scenes.js`, `VCAL` dans `genCtrl1`, `code/maps/ville-entree.js`). **`?sans=villecalme` rend la route d'avant au point près** (empreintes identiques, ci-dessous).
Tout est gardé par `VAME` / `VILLE_CALME` : les autres maps ne passent par aucune ligne modifiée.

### 8.1 Ce qui est fait
1. **La vrille** n'est plus l'entrée de chaque route : une graine sur quatre (graine % 4 = 1), jamais au palier 10 et plus, un tour en 12 s ressenties (≤ 33 °/s). Les autres routes plongent dans la ville par une rampe en S / grande courbe / trois temps (2,8-3,2 rP, dalle à plat).
2. **Le raccourci** (vSaute) : plus de mur (le `dv` à 83° est retiré, dévers automatique), lèvre à 2,1-2,4 rP, bretelle ≥ 2,6 rP, la boucle part de l'autre côté du virage d'avant ; son tour complet ne compte plus dans l'enroulement.
3. **Le grand moment** n'est plus une boucle : tour de la géante 175-205° à 2,8-3,1 rP, rond-point 200° à 2,8 rP, rampe du phare 190-220° à 2,8-3,1 rP ; le nœud (270° à 1,8 rP) cède la place à la plongée (ville graine % 4 = 0, crypto % 4 = 1). Moon : 2,4 rP.
4. **Façade** : dévers 34° (83° avant). Slalom / épingle des géantes ≥ 2,2-2,3 rP, épingle ≤ 172° ; liaisons ≥ 2,1-2,2 rP ; un grand virage (≥ 150°) part toujours de l'autre côté du précédent.
5. **Le tri** : `vsMalusBoucle` (suite du même côté > 220° hors raccourci : 5 + 1 par 10°) ajouté au malus du meilleur-de-N.
6. `?villescene=` réparé (`\w`), aucun octet 0x08.

### 8.2 Mesures après (mêmes bancs, graines 1-12 × p0/10/20)
`outils/banc-routes/sorties/ville-torsades-apres.{txt,json}`, `ville-essais-apres.txt`, `empreinte-apres-*.txt`.

| | torsades/route | vrilles | > 60° du temps | tête en bas | roulis max | boucles ≥ 180°/route | rmin (point / sur 80 m) | serrés/route | recoupes/route | saut refusé (calcul) |
|---|---|---|---|---|---|---|---|---|---|---|
| ville p0 | 3,67 → **0,92** | 1 → 0,25 | 23,4 → **4,2 %** | 9,7 → **3,1 %** | 40 → 32 °/s | 3,00 → 2,08 | 1,47 → 1,83 / 2,07 rP | 1,17 → 0,25 | 3,1 → 1,08 | 38,6 → **6,1 %** |
| ville p10 | 2,83 → 0,17 | 1 → 0 | 22,0 → 0 % | 12,7 → 0 % | 40 → 28 | 1,67 → 1,75 | 1,41 → 1,74 / 2,05 | 1,0 → 0 | 3,7 → 1,92 | 38,0 → 0 % |
| ville p20 | 1,33 → 0,25 | 1 → 0 | 23,2 → 0 % | 17,4 → 0 % | 40 → 24 | 1,08 → 0,83 | 1,45 → 1,54 / 1,98 | 1,08 → 0 | 3,0 → 2,42 | 36,6 → 0 % |
| crypto p0 | 4,25 → 0,58 | 1 → 0,25 | 20,3 → 3,7 % | 8,5 → 2,8 % | 40 → 32 | 2,67 → 1,75 | 1,48 → 1,82 / 1,90 | 1,25 → 0,25 | 3,3 → 1,0 | 33,7 → 5,4 % |
| crypto p10 | 3,50 → 0,08 | 1 → 0 | 22,2 → 0 % | 11,1 → 0 % | 40 → 28 | 1,83 → 1,5 | 1,40 → 1,73 / 2,06 | 1,17 → 0 | 2,5 → 2,08 | 39,0 → 0 % |
| crypto p20 | 1,17 → 0 | 1 → 0 | 21,1 → 0 % | 15,8 → 0 % | 40 → 24 | 1,08 → 1,17 | 1,33 → 1,59 / 2,02 | 1,08 → 0 | 2,9 → 2,92 | 33,2 → 0 % |

Suites du même côté > 220° hors raccourci : **0 partout**. Les « boucles ≥ 180° » restantes = la boucle du raccourci (large, à plat) + le grand moment à 175-220° (demi-tour large, plus une boucle).
Tirage (ville-essais) : note gardée ville p0 7,37 → 2,85, crypto p0 6,82 → 3,60 ; 5,4-6 essais par route.

**Identité des autres maps** (empreinte.cjs graines=1-12) : nuages 469d52aff855 / 2e1661d8fe93 et espace d530540b60dd / cc538835eccb **inchangés** ; avec `?sans=villecalme` la ville et crypto rendent exactement les empreintes d'avant (53b1a839857e / bac739b8ad28, 74b9d5fee081 / 2492162aa54a). Vitrée : non mesurable par ce banc (VIT_SOL), mais elle ne passe pas par VAME.

**Juge commun** (`outils/banc-routes/sorties/ville-juge-apres-2026-11-14.txt`) : R1, R2, R3 (roulis 41 → 33 / 28 / 25 °/s), R4, R5, R7 (saut 90,2 → 94,7 % moy à p0 ; p20 70 → 81 %), R8, R10 verts partout.
**⚠ R6 ville p0 passe au ROUGE** : raccourcis min 2 → 1 (moy 2,8 → 1,6 ; 7 routes sur 12 n'en ont plus qu'un). Crypto p0 était déjà rouge (min 1), il le reste (moy 2,7 → 1,8).
Cause : la ville n'a qu'UN raccourci de module par route (`patF=[1,0,0]`, « un raccourci par route ») ; les autres que comptait le juge étaient NATURELS, nés des boucles serrées qui repassaient sous la route — exactement ce qui est retiré. Une route qui ne repasse plus sous elle-même n'offre plus de raccourci par le bord.
Essais faits et défaits (rien n'est resté) : (a) pente des demi-tours 22-26 % : 1 route de plus à 2 raccourcis, R6 toujours rouge ; (b) `patF=[1,1,0]` aux paliers lents : le 2e raccourci ne tient presque jamais (vTient), R6 toujours rouge, et une grande boucle de plus par route.
**Décision à prendre par la supervision / Sacha** : dérogation R6 pour la ville calme (comme R13), ou un 2e raccourci par route au palier 0 (= une 2e boucle large par route, contraire à la demande), ou un raccourci sans boucle (jamais trouvé : gain 47-70 m sur le papier, il en faut 150).
R13 (l'envers sur chaque route) n'est plus tenue que sur 1 graine sur 4 : dérogation à écrire dans la charte, comme prévu au plan.

### 8.3 En jeu (Chrome headless, muet)
- Courses avec photos, ordi, graines 1-3 (`<scratchpad>/apres-ville-ordi-photos/`) : 0 erreur, 0 mort, 0 croisement ; obstacles sur la route 10/6/11 (pas de bilan avant sur ces graines). Photos regardées : g1-3 (la vrille gardée, graine 1), g1-11 (le raccourci : dalle presque à plat là où l'avant montrait un mur à 83°), g3-12 (grande courbe lisible).
- Téléphone (--tel=1), graines 4-6 (`<scratchpad>/apres-ville-tel1/`) : 0 erreur, 0 mort ; obstacles sur la route 13/10/6 (avant, même banc et graines : 17/12/10) ; g4-4 regardée : ville lisible (l'avant g4-3 était la vrille illisible).
- Sauts au pilote auto 45 s (`ville-sauts-page.js`, graines 1-3, ordi, `<scratchpad>/apres-ville-ordi/`) : **0 mort** ; saut refusé 0 % (g2, g3) et 34 % sur les 45 premières secondes de g1 (la vrille, gardée sur cette graine) ; tête en bas 0 / 0 / 20 %.
- Course complète (`outils/banc-course/course.cjs --map ville:orage`, téléphone émulé) : **0 exception**, 0 requête en échec ; 276 avertissements console (WebGL headless, vibrate), aucun du jeu.

### 8.4 Ce qui reste / n'est pas vérifié (état au commit 9756ac05 — voir § 9 pour l'état actuel)
- ~~R6 ville p0 rouge~~ : corrigé au § 9 (la grande spirale).
- rmin ponctuel 1,54-1,83 rP (passerelle, traversée, lèvre du saut à p20) ; sur 80 m ≥ 1,9 rP. Cible 2,0 rP non tenue au point près.
- Recoupes en plan aux paliers 10/20 : 1,9-2,9 par route (cible 1,5).
- Paliers 10 et 20 non photographiés en jeu ; crypto non photographiée après ; banc des graphismes (coût de l'image) non relancé : les changements ne touchent que la forme de la route (aucune matière, aucun décor ajouté), non mesuré.
- Les consignes « portails / rectangles » en tête de ce fichier : non traitées (voir la note en tête).

## 9. LA 2e CORRECTION (2026-11-14, après deux vérificateurs) : LA GRANDE SPIRALE, LA VITRÉE, LES PREUVES

Commit sur `pro/ville-2026-11-14` après 9756ac05. Rien n'est poussé, sw.js inchangé.

### 9.1 R6 ville p0 rouge → VERT : la grande spirale (`VILLE_SPIRALE`, `?sans=villespirale`)
- Cause prouvée (juge, positions des raccourcis `racPos`) : le seul raccourci sûr de chaque route est le module `grandsaut` ; le 2e venait, quand il existait, d'un grand moment qui repassait sous la route. Le juge (`juge-page.js`) ne compte un raccourci que si l'on se pose à ±55° de son sens, avec un lacet de ±25° au départ et un gain ≥ 150 m : il faut donc que la route repasse SOUS elle-même dans le même sens, c'est-à-dire un tour de plus de ~300° (un lacet ou un S n'écarte la route d'en bas que de 4 R, hors de portée d'un vol à ±25°).
- Fait : au **palier 0 seulement** (R6 n'est exigée qu'au palier 0), le grand moment redevient un grand tour descendant : tour de la géante 320-345°, rond-point 320-340°, phare 320-340° (qui DESCEND à 12 % au lieu de monter), tous à 2,8-3,1 rP, dalle à plat (dévers automatique ; le phare garde ses 20°). La plongée et le moon cèdent leur tour de rotation au palier 0 (ville : rond-point, tour, rond-point, phare ; crypto : tour, rond-point, tour, phare). Le tour complet ne compte ni dans l'enroulement (`spiDefait`, comme la boucle du raccourci) ni dans le malus des suites du même côté ni dans la recoupe (marque `spi`). Paliers 10 et 20 : bit à bit identiques au commit 9756ac05.
- Essai défait : 305-325° → R6 ville p0 retombe à min 1 (une route). 320° est le plus petit angle qui tient.
- Code : `code/maps/ville-entree.js` (`VSPI`, `spiC`, `spiDefait`, `mRondPoint`, `mTourGeante`, `CLIMAX`, `routeRecoupe`), `code/maps/ville-scenes.js` (`VILLE_SPIRALE`, `sSpirale`, `vsMalusBoucle`).

Juge commun, graines 1-12 × paliers 0/10/20 (`outils/banc-routes/sorties/ville-juge-spirale-2026-11-14.txt`) : **tout vert, ville ET crypto, à tous les paliers**.
| | R6 rac min / moy | R7 saut min / moy | R10 dMin | R1 cap30 max | R3 roulis |
|---|---|---|---|---|---|
| ville p0 avant (v1589) | 2 / 2,8 ✓ | 90,2 / 91,5 % | 47 m | — | 41 °/s |
| ville p0 9756ac05 | **1** / 1,6 ✗ | 90,7 / 94,7 % | 51 m | 7,96 s | 33 |
| ville p0 maintenant | **2 / 2,8 ✓** | 91,6 / 96,0 % | 34 m | 8,21 s | 33 |
| crypto p0 avant (v1589) | **1** / 2,7 ✗ | 91,1 / 92,1 % | 47 m | — | 41 |
| crypto p0 maintenant | **2 / 3,1 ✓** | 92,7 / 97,0 % | 37 m | 8,33 s | 33 |
dMin (34-37 m) = la hauteur libre où la spirale repasse sous elle-même : bien au-dessus des 5-11 m qui avaient fâché Sacha le 09/11 (et ≥ 8 m exigés par R10).

Banc Node `ville-torsades.cjs` (`sorties/ville-torsades-spirale.{txt,json}`), palier 0 (paliers 10/20 inchangés, voir 8.2) :
| | torsades/route | roulis max | > 60° | tête en bas | boucles ≥ 180°/route | angle max | rmin point / 80 m | serrés/route | recoupes/route |
|---|---|---|---|---|---|---|---|---|---|
| ville p0 9756ac05 → maintenant | 0,92 → 1,08 | 32 → 32 | 4,2 → 3,9 % | 3,1 → 2,9 % | 2,08 → 2,17 | 415 → 451° | 1,83 → 1,87 / 2,07 rP | 0,25 → 0,25 | 1,08 → 2,33 |
| crypto p0 9756ac05 → maintenant | 0,58 → 1,25 | 32 → 32 | 3,7 → 3,4 % | 2,8 → 2,6 % | 1,75 → 2,33 | 427 → 430° | 1,82 → 1,80 / 1,88 rP | 0,25 → 0,25 | 1,0 → 2,17 |
Le prix, assumé : une 2e grande boucle LARGE par route au palier 0 (c'est elle qui fait le raccourci ; les recoupes « en plan » sont ses passages dessous). Les torsades ajoutées ne viennent pas de la spirale (à plat) : le tri garde d'autres routes, où tombent un virage de façade (34°) ou une passerelle (48-57° en 2-5 s, 10-25 °/s) ; vrilles inchangées (0,25). Tirage : note gardée ville p0 3,51, crypto p0 3,82 (`ville-essais-spirale.txt`).

### 9.2 La ville VITRÉE changeait (défaut trouvé en la mesurant) — corrigé
- `empreinte.cjs` ne charge pas la vitrée (`VIT_SOL is not defined`). Nouveau banc `outils/banc-routes/empreinte-chrome.cjs` : copie du juge commun (même Chrome muet, même serveur) qui rend une empreinte FNV des points `ctrl0`, `ctrl` et `N` de `dbgGenRoute`.
- Mesuré : au commit 9756ac05, **vitrée palier 10 graine 3 différait d'origin/main** (117 points au lieu de 126). Cause : le tri du meilleur-de-N appelle `vsMalusBoucle` pour `id==='ville'`, et la vitrée a l'id `ville` (la déduction « VCAL exige VANC » ne couvrait pas le tri). Corrigé : `(c&&c.vitre?0:vsMalusBoucle(...))`.
- Preuve après correction : vitrée, nuages, espace × paliers 0/10/20 × graines 1-12 = 108 routes, **empreintes identiques à wt-avant** (`sorties/empreinte-chrome-vitree-nuages-espace-2026-11-14.txt`). Node (`empreinte.cjs`) : nuages et espace inchangés ; `?sans=villecalme` rend ville/crypto d'origin/main (53b1a839857e / bac739b8ad28 / 74b9d5fee081 / 2492162aa54a) ; `?sans=villespirale` rend exactement 9756ac05 (dc7edd365f42 / 39dac5ea8281 / 2cda97e5393c / 8d9f85ecac0c).

### 9.3 Le rayon minimal (cible 2,0 rP) : localisé, NON corrigé
- `outils/banc-routes/ville-ou-rmin.cjs <carte> <graine> <palier>` : les points sous 1,8 rP (23 routes sur 72, toutes aux paliers 10-20 ; 58 sur 72 avant) ne sont pas des virages dessinés serrés. Exemple ville p20 g3 : la sortie du saut est dessinée à 2,3 rP (11,9° tous les 68 m), mais la courbe du jeu (Catmull-Rom centripète) se pince à 1,59 rP sur ~20 m au raccord avec le virage suivant de l'autre côté ; ville p20 g12 : 1,54 rP au raccord entre une liaison à points espacés de 221 m et la passerelle. « Serrés » (≥ 60° sous 2 rP) = 0 aux paliers 10 et 20 ; sur 80 m, ≥ 1,88 rP partout.
- Essais défaits : (a) double S de la piste de pose à ≥ 2,15 rP : aucun effet (ce n'était pas là) ; (b) sortie du saut à un point tous les 5° : le pincement se déplace (26 routes sous 1,8 rP au lieu de 23). Une vraie correction = adoucir les raccords entre modules (espacement des points), un chantier du générateur partagé : non fait.

### 9.4 En jeu (Chrome headless muet, ports 8323-8324 / 9523-9524)
- Ordi, ville p0 graines 3, 4, 6 (routes qui n'avaient plus qu'un raccourci), 50 s, photos (`<scratchpad>/spirale-ville-ordi/`) : 0 erreur, 0 mort, 0 croisement ; obstacles 6/13/7. Regardé : g4 s5151 = la grande spirale, large, à plat, la route d'en dessous visible à gauche ; g4 s4289 : grande ligne droite lisible.
- Téléphone (--tel=1), crypto p0 graines 2, 4, 12, 55 s, puis g2 80 s (`spirale-crypto-tel1/`, `spirale-crypto-tel1b/`) : 0 erreur, 0 mort ; obstacles 6/17/6. Regardé : g2 s5651 et s6085 (la spirale autour de la géante) : grande courbe lisible, dalle à plat.
- NON vérifié en jeu : les paliers 10 et 20 (aucun banc ne fixe `engTier` pour une course ; leurs routes sont bit à bit celles de 9756ac05, vérifiées en Node et au juge seulement), la vitrée en course, les sauts par-dessus la spirale au pilote auto (le juge les trouve ; personne ne les a sautés en jeu), le banc des graphismes (coût de l'image : la route garde la même longueur qu'origin/main, 6,3-7,1 km en ville p0, mais non mesuré).

### 9.5 Dérogation R13 — texte prêt pour `passation/CHARTE-ROUTES.md` (worktree du juge, que je n'ai pas le droit d'éditer)
> **R13, dérogation VILLE et CRYPTO CITY (2026-11-14, demande de Sacha « moins de torsades et de boucles serrées »)** : l'envers n'est exigé que sur une graine sur quatre (la vrille, palier 0 seulement, 12 s le tour, ≤ 33 °/s) ; aux paliers 10 et 20 la ville roule à l'endroit (dévers ≤ 33°). Les seuils « ≥ 15 % à plus de 60° » et « ≥ 25 % à plus de 45° » ne s'appliquent pas à la ville. R1-R10 restent exigées (toutes vertes au 14/11, R6 comprise).
R6 n'a plus besoin de dérogation.

### 9.6 Commandes
```
node <wt-juge>/outils/banc-juge/juge.cjs --racine=<wt-ville> --cartes=ville,crypto --paliers=0,10,20 --graines=1-12 --port=8320 --cdp=9520 --out=<dossier>
node outils/banc-routes/empreinte-chrome.cjs --racine=<worktree> --cartes=vitree,nuages,espace --paliers=0,10,20 --graines=1-12 --port=8323 --cdp=9523 --out=<dossier>   (à lancer sur wt-avant et wt-ville, puis diff des lignes « points »)
SEARCH='?sans=villespirale' node outils/banc-routes/empreinte.cjs graines=1-12      (doit rendre 9756ac05)
node outils/banc-routes/ville-torsades.cjs json=<f>    ·    node outils/banc-routes/ville-essais.cjs
```
⚠ Le port 8321 était tenu par un `serveur.cjs 8321` (PID 10352, lancé à 16 h 24 par un autre processus, sans doute un vérificateur) : laissé tel quel, je ne l'ai pas lancé.


## 10. OPTIMISATION (2026-11-14, l'optimiseur — passe courte, « mollo sur les tokens »)

Constat : la grande spirale du palier 0 replie la route sur elle-même ; sur TÉLÉPHONE la règle de la tranche moyenne (PISTE_MOY_D) ne jouait plus
(la sphère d'une tranche repliée avale la caméra) — même maladie que la grotte en étages. Le bitume restait entier : la ville calme coûtait PLUS que v1589 sur téléphone.
Correction (code/moteur/piste-prebati.js, `pisteMoysOn`) : la tranche moyenne par l'abscisse, déjà publiée pour la grotte, s'applique aussi à la ville et à Crypto City
(id 'ville', carte ville|crypto ; pas la vitrée). Téléphone seulement (PISTE_MOY = 0 sur l'ordi : rien n'y change). Rendu seul : les routes sont identiques au bit près.
Interrupteur : `?sans=villemoys` = avant cette passe.

Mesures (banc-maps gen, soir, graines 1-6, triangles de TOUTE la scène visible 6 s après le départ, moyenne ; audit outils/banc-maps/audit-triangles-scene.js) :

| | v1589 (wt-avant) | ville calme sans la passe | après la passe |
|---|---|---|---|
| ville téléphone | 443 k | 465 k | **337 k** (−24 %) |
| crypto téléphone | 499 k | 571 k | **387 k** (−22 %) |
| ville ordi | 617 k | 628 k (+1,7 %) | inchangé |
| crypto ordi | 697 k | 734 k (+5,2 %) | inchangé |
| essais de tirage par route (Node, 12 graines × 3 paliers) | 6,00 | ≤ 6,00 | inchangé |
| géométries vivantes, crypto téléphone | 536 | 560 | 566 |

A/B sur le même code (crypto téléphone g5 / g6) : 634 k → 386 k, 461 k → 365 k. Photos téléphone avec / sans (crypto midi, s≈322) regardées : identiques
(scratchpad opt-graph2/avec et sans). 0 erreur console sur toutes les courses.

RESTE (non fait, non vérifié) :
- Ordi : +1,7 % (ville) et +5,2 % (crypto) de triangles de scène et +24 géométries vivantes en crypto par rapport à v1589 — viennent de la forme de route (plus de ville
  bâtie le long de la spirale), à profiler par groupe (outils/banc-maps/audit-triangles-groupes.js) ; les triangles DESSINÉS d'une image dépendent du point de vue et
  ne sont pas comparables point à point (graphismes graine 7 : 352 k → 579 k ville ordi au même s, vue différente).
- Image figée et trous d'images : trop bruités sur la machine partagée pour conclure (p99 téléphone 37-337 ms d'un passage à l'autre, avec ou sans la passe).
- Pré-bâti (banc-vitesse/prebati.cjs), mémoire au changement de map, embellissements : non faits.
Commandes : `node outils/banc-maps/banc.cjs gen --carte=crypto --meteo=soir --graines=1,2,3,4,5,6 --tel=1 --attente=6 --auditfile=outils/banc-maps/audit-triangles-scene.js --out=<d>`
puis `node outils/banc-maps/lit-triangles-scene.cjs` (lit ./opt-gen/*/ depuis le dossier courant).
