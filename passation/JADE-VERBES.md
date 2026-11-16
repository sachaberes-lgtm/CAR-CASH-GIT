# JADE, LES VERBES (2026-11-16) — prêt pour la session d'optimisation finale

Demande de Sacha : « refonte totale de la génération de route et de map. C'est tout le temps la même chose : il faut que chaque partie soit une
expérience unique […] sans que ça nuise trop à l'optimisation déjà faite pour iOS. Je t'ai mis des maquettes de modules, tu dois en faire d'autres.
Que la route interagisse bien avec le décor. » Puis : « fais tout ce que tu veux pour que ce soit prêt à envoyer tel quel à la session optimisation
finale, sans bug ni rien ».

**État** : branche locale `jade-avatar-2026-11-16` (partie d'origin/main v1611, cache v1612), **non poussée, non fusionnée**. Tout est derrière
**`?jade=avatar`**. Sans le drapeau, la route et les décors de scène sont identiques à origin/main (empreinte, 8 graines × paliers 0/10/20).
Jade publiée est validée (« on ne touche plus ») : le drapeau ne s'inverse que quand Sacha aura joué et validé.

## Ce qui existe

`code/maps/jade-avatar.js` (dans ORDRE.txt après jade-alleluia.js) : dix scènes, le paquet d'une vallée, le décor qui touche la route, trois maillages.
Retouches ailleurs : `jade-alleluia.js` (branchement des scènes et du paquet, ancrage et raison de refus des îles de scène), `jade-3.js` (une ligne : les
maillages), `jade-2.js` (`av` gardé avec la vallée dans `JADE_CH`, remis à zéro dans `jadeEtatVide`), `jade-formes.js` (avec le drapeau, la mésa de 47 m
toujours dans la palette, à la place du tirage 34/47 : même nombre de gabarits).

| clé (`?jscene=`) | verbe | rôle | la route et la roche |
|---|---|---|---|
| `gue` | POSÉE | ouverture | 3-4 paliers posés sur des mésas en escalier, une crête ronde entre deux |
| `pont` | SUSPENDUE | ouverture | d'un pic-mésa à l'autre, la dalle se creuse ; ~60 lianes montent à une île 150-200 m au-dessus |
| `mouton` (neuf) | TRESSÉE | ouverture | sous le ventre d'une île renversée, puis posée sur une mésa, deux fois |
| `escalier` (neuf) | ARROSÉE | ouverture | 2-3 virages alternés, chacun sous la cascade d'une île, une vasque plus bas |
| `galerie` | TAILLÉE | ouverture | dalle couchée à 50-58° contre une paroi de pics (qui suit le dévers réel), toit d'îles renversées, colonnes côté vide |
| `gouffre` | PERCÉE | climax | couronne de 10-12 pics, plongée à 52-56° dans le trou, cascade, sortie dessous |
| `belvedere` (neuf) | GRAVIE | climax | on monte en tournant entre des pics, plateau-mésa au sommet, trois îles en carte postale, piqué |
| `pierres` | VIVANTE | envers | S couché pendant le demi-tonneau, 6-8 rochers qui dérivent en travers (sans collision), puis la tête en bas |
| `ange` | POSÉE | raccourci | LE FLEUVE : mésas sous le plateau, rivière, la lèvre au bord, cascade, boucle autour d'une grappe d'îles, atterrissage sur une mésa |
| `ceinture` | ENROULÉE | raccourci | le tour d'un pic géant, huit îlots dedans / dehors |

**Le paquet** (`jadeAvPaquet`) : ouverture (tourne sur 5 graines) → raccourci → envers (une fois sur deux `pierres`) → climax (tourne sur 3 ; aux grands
paliers, sans ouverture, sur 8) → raccourci → remplissage. Un des deux raccourcis est toujours `ange` ou `ceinture`. Jamais deux verbes pareils de suite.

**Le décor qui touche la route** : `av` sur un décor de scène. `anc:'haut'` : une mésa SOUS la dalle, sommet ~3 m sous le point le plus bas de la dalle
qu'elle porte (`jadeAvAncre`), à son échelle (pas de `echelle`), refusée si plus large que 1,35 × son rayon. `anc:'bas'` : le ventre d'une île renversée
(un toit). `lia` : les lianes. Une mésa du fleuve que la route de retour (sous le plateau) traverserait est retirée à la génération.

## Le coût

Trois appels de dessin de plus au maximum (lianes : 1 maillage ; rivières : 1 ; pierres : 1 famille d'instances). Sur `ALLEGE` : une liane sur deux,
un plan par liane, rocher au niveau de détail 1. Aucun gabarit de plus (la palette garde 19 formes). Mesures du banc (une image au départ, `dbgJade`) :
ordi 43-46 appels de Jade, 0,74-0,92 M triangles ; téléphone (`tel=1`, nuit) 30 appels, 65 k triangles. **Pas de tableau référence / après au
standard de passation/MAPS-PRO-JADE.md § 12** : c'est le travail de la session d'optimisation (bancs `mesure.cjs` + `cout-route.js`, en alternant).

## Les preuves (2026-11-16)

- **Routes, en Node** (`node outils/banc-jade/verbes-node.cjs graines=1-24` ; `scene=<clé>` pour imposer une scène) : 24 graines × paliers 0/10/20 et chaque
  scène neuve imposée sur 8 graines × 3 paliers : **0 exception**, raccourcis 2/2 partout, conflits 0, tenue dans un cône de 30° ≤ 8,3 s (R1 : 10),
  de 8° ≤ 2,8 s, roulis ≤ 62°/s (la Jade publiée : 63), envers 7,7-13,8 % (la Jade publiée : 10-14 %). Note moyenne p0 3,6 (publiée : 3,4).
- **Dans le vrai jeu** (`outils/banc-jade/verbes-jeu.cjs`, Chrome headless muet, caisse immortelle) : graines 3, 5, 6 (ordi, midi et soir, scènes
  imposées) et 7 (`tel=1`, nuit, paquet naturel) : **0 exception, 0 `__jadeErr`, règle d'or 0 heurt (13 506 essais), couloir 0, frôle 0, panneaux 0,
  flottants 0** ; îles des verbes posées : 10/11, 11/11, 9/10 (un toit du saute-mouton et une île de cascade du gouffre refusés par leurs gardes, sans
  défaut visible). Photos regardées de chaque scène (route et vue large).
- **Garde-fous** : sans le drapeau, empreinte route + décors de scène = origin/main ; `garde-allege.sh` ✔ ; `non-declares.cjs` : rien de neuf ;
  `publie-allege.cjs --essai` : la copie allégée passe, les deux crochets neufs sont retirés.
- **Courses complètes au pilote** (`courses.cjs`, sauts toutes les 4 s, une passe au milieu, une au ras du bord ; chaque cas joué deux fois) :

  | cas | verbes : morts · images/s · gels > 250 ms | Jade publiée : morts · images/s · gels > 250 ms |
  |---|---|---|
  | ordi midi g9 | 0 · 0 / 0 · 59,7-59,9 · 0 · 0 | 0 · 0 / 0 · 59,2-59,8 · 0 · 1 |
  | tél. nuit g10 | 1 (s 4133, « air ») · 0 / 0 · 59,1-59,9 · 3 · 0 | 0 · 0 / 0 · 59,9 · 0 · 0 |

  0 exception partout. La mort (fin de LA CEINTURE, la sortie-tremplin, même code que les raccourcis publiés) **rejouée 6 fois** depuis s 3850
  (`mort-locale.js`) : 0 mort — un saut raté du pilote de banc, comme les morts « air » non reproductibles du § 12 de MAPS-PRO-JADE.md. Les 3 gels
  de cette course : absents de la seconde course du même cas (trois Chrome tournaient en même temps).

## Corrigé pendant la vérification (pour ne pas le refaire)

- **La vallée gardée** (`JADE_GARDE`, `jadeReprend`) : une route régénérée écrasait l'état bâti des verbes → lianes, rivières, pierres absentes à la
  reprise. Séparé : `JADE.avR` (données de la route, refaites à chaque génération) / `JADE.av` (état bâti, né dans `jadeAvPose`, gardé avec la vallée).
- **La grande mésa jamais choisie** : elle n'est pas « île » dans le catalogue ; les îles porteuses de plus de 38 m demandent `massif` (mésas plates).
- **Les îles porteuses trop petites** (la dalle fait 52 m) et **calées trop bas** (le calage prenait la route qui plonge après le palier) : rayon 46-54 m,
  palier = 2 r + 44 m, calage sur la seule dalle au-dessus de l'île.
- **La galerie** : la dalle penche vers le centre ; la paroi suit le dévers réel (rampes comprises), est posée avant le toit ; le toit pend le long de la
  normale de la dalle, entre deux piliers.
- **Le fleuve** : mésas sur toute la longueur du plateau, celle de la lèvre au bord ; la cascade part du bord réel de la mésa ; l'atterrissage est un
  palier qui tourne (sans lui, 12,5 s dans la même direction au palier 10).
- **Le saute-mouton** : le toit pend au-dessus d'un creux à plat (la route remontait dans son ventre).

## Ce qui reste à la session d'optimisation (dans l'ordre)

1. Tableau référence / après (ordi `poste=max` et `tel=1`, 3 cas chacun) : appels, triangles, ms, mémoire, gels — avec et sans `?jade=avatar`.
2. Regarder en mouvement sur téléphone : les lianes (planes, sans lumière), la rivière (un aplat d'eau, `JAV_MAT.eau`), les pierres qui passent.
3. Fusionner sur origin/main à jour : le cache (`cashcar-v1612`) sera sans doute déjà pris par une autre publication → monter au suivant.
4. Sacha joue `?carte=jade&jade=avatar` ; s'il valide, inverser le drapeau (`?sans=jadeavatar` pour l'ancienne).

## Commandes

```
node outils/banc-jade/verbes-node.cjs [graines=1-24] [paliers=0,10,20] [scene=gue] [detail=1] [sans=1]
node outils/banc-jade/verbes-jeu.cjs <racine abs> <port> <cdp> "pistegraine=5&meteo=midi&jscene=gue,ange" <dossier de sortie> [photos=0]
node outils/banc-jade/courses.cjs <sortie.json> <racine réf.> <racine branche> <port> <cdp> "jade=avatar&pistegraine=9&meteo=midi" …
```
Crochets : `dbgJadeAv()` (scènes et leurs s, îles posées / refusées et pourquoi, compteurs, formes hautes de la palette), `dbgJadeAvVue(s,lat,h,rec)`.
Après toute retouche d'un morceau : `node code/assembler.cjs --depuis-morceaux` (l'assembleur nu refuse quand index.html a déjà été recollé).

Refusés par Sacha, à ne pas reproposer : la liane-mère, la faille, le ventre, l'étreinte.
