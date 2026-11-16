# JADE, LES VERBES (2026-11-16) — prêt pour la session d'optimisation finale

Demande de Sacha : « refonte totale de la génération de route et de map. C'est tout le temps la même chose : il faut que chaque partie soit une
expérience unique […] sans que ça nuise trop à l'optimisation déjà faite pour iOS. Je t'ai mis des maquettes de modules, tu dois en faire d'autres.
Que la route interagisse bien avec le décor. » Puis : « fais tout ce que tu veux pour que ce soit prêt à envoyer tel quel à la session optimisation
finale, sans bug ni rien ».

**État** : branche locale `jade-avatar-2026-11-16` (partie d'origin/main v1611, cache v1612), **non poussée, non fusionnée**. Tout est derrière
**`?jade=avatar`**. Sans le drapeau, la route et les décors de scène sont identiques à origin/main (empreinte, 8 graines × paliers 0/10/20).
Jade publiée est validée (« on ne touche plus ») : le drapeau ne s'inverse que quand Sacha aura joué et validé.

## V2 (2026-11-16, soir) : les itinéraires et les grands sauts — À LIRE D'ABORD

Sacha, après avoir joué la V1 : « c'est nul, c'est tout le temps la même génération de route ; elle est bien mais il faut qu'elle change à chaque map ;
il y a toujours les deux mêmes boucles de merde ; invente d'autres modules, que chaque génération de map fasse vivre une expérience et un parcours
uniques ». Les « deux boucles » : les deux raccourcis de chaque route étaient TOUJOURS un tour de 360° (spirale, stade, colimaçon, puits — et la V1 avait
refait le fleuve et la ceinture sur la même boucle) ; et le paquet était toujours ouverture → raccourci → envers → climax → raccourci.

- **Plus aucune boucle** avec le drapeau. **LES GRANDS SAUTS** (raccourcis sans boucle, `jade-avatar.js`) : la lèvre (à PLAT : roulis écrit nul), la chute
  qui s'écarte déjà de la ligne, puis un DÉTOUR dont le cap revient sans faire le tour — `cirque` (Ω autour d'un cirque vide : couronne de pics, îles au
  fond, cascade du bord en travers de la route ; le saut le survole), `passe` (Ω autour d'une tour, une autre de l'autre côté : le saut file dans la porte),
  `corniche` (Ω couché à 30-50° contre un massif, couchage borné à ~35°/s), `lacets` (quatre virages alternés autour de piliers ; seulement si
  vPalier/rayonPalier ≥ 1,6, soit dès le palier ~8), `ange` (le fleuve : plateau, mésas, rivière, la cascade tombe dans le cirque que la route contourne).
  La route revient sur la ligne PLUS LOIN et PLUS BAS : la pente du détour est calculée sur le vol (`volH` : 1,4 × la croisière, impulsion 10 m/s,
  pesanteur 26 ; la route 25 m sous le vol au point de retour), puis `recale` (le cap, puis un S qui remet la route sous la ligne) et la sortie-tremplin
  de jadeAGen (le replat tourne de 12-18°). Le vol est jugé par `vole` comme avant (MODMARK.rac, fils d'or, couloir du vol inchangés).
- **LES ITINÉRAIRES** (`JAV_ITIN`, six) : LA VALLÉE DES CASCADES, LES PILIERS DU CIEL, LA FORÊT SUSPENDUE, LA GRANDE CHUTE, LES MURS DE JADE, LA NUÉE —
  chacun ses ouvertures, climax, envers, grands sauts, remplissage, l'allure de ses liaisons (`JAV_LIA` : pente, rayon, respirations, durée), son
  ouverture (`calme` / `plonge` / `balcon`) et le biais de son décor (`jadeAvDecoBiais` dans jadeBatit : cascades, brume, forêt, lianes, densité,
  hauteur, rochers — uniquement des valeurs que le tirage d'avant sait déjà sortir). Graine g → itinéraire (g + ⌊g/6⌋) mod 6 : six graines de suite,
  six voyages. Puis l'ORDRE est tiré parmi sept trames (`JAV_TRAMES`) : le climax, l'envers et les sauts ne tombent pas toujours au même endroit.
- **Modules neufs** : `viaduc` (la route posée sur une file de colonnes de pierre, sommets 7,5 m sous la dalle), `essaim` (LA NUÉE : un S dans un essaim
  d'îles à toutes les hauteurs), `defile` (deux murs de pics hauts et serrés) ; `ceinture` n'est plus un raccourci : un demi-tour autour du pic.
- Branchements (sans drapeau : mêmes tirages, même empreinte) : `jade-alleluia.js` (`JAV_LIA` dans la liaison, le paquet, les trois ouvertures, `itin`
  rendu), `jade-3.js` (le biais du décor).

**Preuves de la V2** : voir § « Preuves de la V2 » en bas. Le reste de ce fichier décrit la V1 (toujours valable pour les dix scènes d'origine).

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

## Preuves de la V2 (2026-11-16, soir)

- **Routes, en Node** (`verbes-node.cjs graines=1-24`, paliers 0/10/20) : **0 exception, 2 raccourcis validés sur 2 sur chaque route**, conflits 0,
  tenue 30° ≤ 7,2 s (R1 : 10), 8° ≤ 3,2 s (R2 : 3,6), roulis ≤ 61°/s (la Jade publiée : 63), envers 9-13,3 %. Notes moyennes p0/p10/p20 :
  4,6 / 5,3 / 7,4 (la Jade publiée : 3,4 / 5,0 / 7,5). Les six itinéraires passent 3 à 5 fois sur 24 graines ; aucune scène ne domine.
- **Les grands sauts, un par un** (`sauts-node.cjs <racine> <forme>`) : au palier 0 le vrai saut se pose à ×1,5 et ×1,9 sur chaque forme (×1 retombe
  trop tôt ou dans le vide : attendu, il suffit de 2 vitesses sur 3) ; aux paliers 10-20 tout se pose (gain de route 300-800 m).
  Ce qui faisait rater (corrigé) : le redressement juste après la lèvre (un saut lent retombait dessus) → plongeon continu qui s'écarte ; la route qui
  revenait de côté (un saut rapide passait à côté) → `recale` ; la lèvre penchée par le dévers (le vol tombe le long de la normale quittée : il
  dérivait de 30-50 m) → roulis écrit nul sur la lèvre.
- **Dans le vrai jeu** (`verbes-jeu.cjs`) : sept vallées, les six itinéraires (graines 11, 1, 2, 3 au téléphone de nuit, 4, 5, et 2 au soir) : **0 exception,
  0 `__jadeErr`, règle d'or 0 heurt, couloir 0, frôle 0, panneaux 0, flottants 0** ; îles des verbes posées (refus résiduels : une île de
  cascade du gouffre par `ile-voisin`) ; rivière, lianes, pierres bâties. Coût au départ : ordi 41-50 appels de Jade, 0,65-1,6 M triangles ;
  téléphone 31 appels, 46 k triangles. Photos regardées : cirque, passe, corniche, viaduc, défilé, gouffre.
- **Courses complètes au pilote** (`courses.cjs`, 3 cas × 2 passages) : 0 exception, 59-60 images/s. 3 morts sur 12 passes (s 6882 passe, ordi g1 ;
  s 4801 gouffre et s 6111 passe, tél. g3), chacune absente du second passage ; **rejouées 6 fois chacune** (`mort-locale.js`) : **0 mort** — des
  sauts ratés du pilote de banc, comme les morts « air » / « pic » non reproductibles de la Jade publiée (MAPS-PRO-JADE.md § 12).
- **Gardes** : sans le drapeau, empreinte route + décors de scène = origin/main (p0 064c08ecc2cfa2d5, p10 e24b77b95acb6d5d, p20 a8d16c6d8169453c) ;
  `garde-allege.sh` ✔ ; `non-declares.cjs` : rien de neuf ; `publie-allege.cjs --essai` ✔ ; aucune adresse réseau ; cache v1613.

**Non fait / à la session d'optimisation** : le tableau référence / après du coût (ordi et `tel=1`, en alternant) ; les grands sauts joués à la main
(un vol de 3-4 s au palier 0 : à juger en jouant) ; un vrai iPhone.
