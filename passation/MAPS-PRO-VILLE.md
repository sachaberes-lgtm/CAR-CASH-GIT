# MAPS PRO — LA VILLE (et Crypto City) : diagnostic du 2026-11-14

Branche `pro/ville-2026-11-14` (partie d'origin/main v1589, ff0c9078). **Ce document = le diagnostic « avant ». Aucune ligne du jeu n'a été modifiée** : seuls des bancs (`outils/banc-routes/ville-*.cjs`) et cette passation sont ajoutés.

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

## 7. Ce qui n'est pas fait / pas vérifié

- Aucune correction : le jeu est celui d'origin/main v1589.
- Le « saut refusé » n'est pas mesuré en jeu ; le gel de 600-835 ms sur téléphone n'est pas reproduit une seconde fois ; les enseignes flottantes ne sont pas détaillées ; la ville vitrée n'est pas mesurée ; les paliers 10 et 20 n'ont pas été photographiés en jeu (bancs Node seulement).
