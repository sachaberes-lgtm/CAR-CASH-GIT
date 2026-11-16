# JADE, LES VERBES (2026-11-16) — la refonte « Inspiration Avatar 1 », côté code

Demande de Sacha : « refonte totale de la génération de route et de map. C'est tout le temps la même chose : il faut que chaque partie soit une
expérience unique […] sans que ça nuise trop à l'optimisation déjà faite pour iOS. Je t'ai mis des maquettes de modules, tu dois en faire d'autres.
Que la route interagisse bien avec le décor. » Puis, en cours de route : « le teste pas toi-même, occupe-toi juste de faire des bons modules variés
qui donnent l'impression que chaque map est unique ».

**État : ÉCRIT, BRANCHÉ, JAMAIS LANCÉ.** Branche locale `jade-avatar-2026-11-16` (partie d'origin/main v1611, cache v1612), non poussée.
Seuls contrôles faits : `node --check` et `node code/assembler.cjs --verifier`. Ni le juge, ni une course, ni une photo.
Tout est derrière **`?jade=avatar`** : sans le drapeau, les tirages de la route et du décor sont ceux d'avant (aucun appel au hasard ajouté).

## Ce qui existe

`code/maps/jade-avatar.js` (inscrit dans ORDRE.txt après jade-alleluia.js). L'en-tête du fichier est la description complète.

| clé (`?jscene=`) | verbe | rôle dans la vallée | la route et la roche |
|---|---|---|---|
| `gue` | POSÉE | ouverture | 3-4 îlots en escalier, un palier posé sur chacun, une crête ronde entre deux |
| `pont` | SUSPENDUE | ouverture | d'un pic à l'autre, la dalle se creuse, des lianes montent à une île 150-200 m au-dessus |
| `mouton` (neuf) | TRESSÉE | ouverture | sous une île renversée (un toit plat), puis posée sur la suivante, deux fois |
| `escalier` (neuf) | ARROSÉE | ouverture | 2-3 virages alternés, chacun sous la cascade d'une île, une vasque plus bas |
| `galerie` | TAILLÉE | ouverture | dalle couchée à 50-58° contre une paroi de pics, toit d'îles renversées, colonnes côté vide |
| `gouffre` | PERCÉE | climax | couronne de 10-12 pics, on passe le rebord, plongée à 52-56° dans le trou, cascade, sortie dessous |
| `belvedere` (neuf) | GRAVIE | climax | on monte en tournant entre des pics, plateau au sommet, trois îles en carte postale, piqué |
| `pierres` | VIVANTE | envers | S couché pendant le demi-tonneau, 6-8 rochers qui dérivent en travers (sans collision) |
| `ange` | POSÉE | raccourci | LE FLEUVE QUI TOMBE : deux mésas, la rivière, la lèvre au bord, la cascade, la boucle autour d'une grappe d'îles |
| `ceinture` | ENROULÉE | raccourci | le tour d'un pic géant, huit îlots dedans / dehors |

**Le paquet** (`jadeAvPaquet`) : ouverture (tourne sur 5 graines) → raccourci → envers (une fois sur deux `pierres`) → climax (tourne sur 3, décalé à
chaque tour de 5) → raccourci → remplissage (les autres ouvertures, puis les scènes Alléluia). Un des deux raccourcis est toujours `ange` ou `ceinture`.
Jamais deux verbes pareils de suite (`JAV_VERBE`).

**Le décor qui touche la route** : `av` sur un décor de scène (`anc:'haut'` = l'île sous la dalle, sommet 2,6 m sous le point le plus bas de la dalle
au-dessus d'elle ; `anc:'bas'` = un toit ; `plat` ; `m` = la marge de la garde `libre` ; `lia` = les lianes). `jadeAvAncre` et `jadeAvPose` sont appelées
par `jadeDeco3Pose`, `jadeAvBatit` par `jadeBatit` (jade-3.js), `jadeAvTick` par `jadeCascRoute`. Trois appels de dessin de plus au maximum
(lianes, rivières, pierres) ; sur `ALLEGE` : une liane sur deux, un seul plan par liane, rocher au niveau de détail 1.
`dbgJadeAv()` : les scènes, les verbes, les îles posées ou refusées, les compteurs.

## À faire par la session suivante (dans l'ordre)

1. **Lancer** `?carte=jade&jade=avatar` et lire `dbgJadeA()` / `dbgJadeAv()` : une exception dans une scène neuve est le risque n° 1 (code jamais exécuté).
2. **Scène par scène** `?jade=avatar&jscene=<clé>` : photo, et `dbgJadeAv().poses` — une île `anc:'haut'` avec `ok:false` = refusée par `libre` ou `voisin`
   (`refus` dit pourquoi). Points que je n'ai pas pu régler sans voir :
   - `gue`, `pont`, `mouton` : le palier fait 2 r + 16 m ; si l'îlot sort 5-6 m sous la dalle sur téléphone (cubes de 3,5 m), baisser 2,6 dans `jadeAvAncre`.
   - `gouffre` : la couronne a un rayon de ~150-190 m à la vitesse réelle (la plongée parcourt ~230 m à l'horizontale) ; vérifier qu'elle se lit comme un
     trou et pas comme des pics épars (resserrer `Rc`, monter `n`).
   - `galerie` : toit à `RH·sin(roulis) + 10 m` au-dessus du centre ; les colonnes demandent un gabarit haut de rayon ≤ 16,5 m (peut manquer dans une palette).
   - `ange` : la rivière n'est dessinée que sur la roche (mésa de 47 m forcée dans la palette quand le drapeau est mis) ; son eau est un aplat
     (`JAV_MAT.eau`), à embellir. La cascade tombe à `RH + 7 m` du bord, côté boucle.
   - `pierres` : hauteur 36-62 m au-dessus de la dalle ; pendant le tonneau le bord de la dalle monte à 26 m — vérifier qu'aucune ne la traverse à l'image.
3. **Le juge** (charte R1-R13) sur 8 graines × paliers 0/10/20 : les scènes neuves passent par la même note que les autres (`jadeAGen`), mais R13
   (part couchée, part à plat) n'est pas dans la note.
4. **Le coût téléphone** (`--tel=1`) contre origin/main : appels, triangles, ms (bancs de passation/MAPS-PRO-JADE.md § 12).
5. Sacha joue ; s'il valide, retirer le drapeau (ou l'inverser en `?sans=jadeavatar`).

Refusés par Sacha, à ne pas reproposer : la liane-mère, la faille, le ventre, l'étreinte.
