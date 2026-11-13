# La ville qui se visite : une route qui vit avec ses tours

Date : 2026-11-13 · Branche : `ville-ame-2026-11-13` (worktree, sur `origin/main` v1559) · Taille : un projet, en deux étapes.
Suite de `2026-11-13-ville-route-ancres-design.md` (publiée v1544 : ancres, trois modules autour d'une géante).

## Intention (Sacha, 13/11 soir)
« Ça manque d'art, d'âme, de beauté. La route est juste posée, elle va trop souvent tout droit. On doit pouvoir s'amuser et se perdre dans la ville :
ça monte, ça descend, des virages inclinés dans des immeubles, un tunnel qui passe dans un immeuble (comme en Chine), passer très près du sol, peut-être tomber.
Des virages pas trop nombreux, fun, légers, smooth, lisibles, beaux, aussi faciles en vol qu'au sol. Plus d'interaction route/bâtiments : des modules.
Inspire-toi de la science-fiction. Chaque partie a une génération unique, intégrée au décor. Cartes postales. Pousse vraiment, en game designer. »

## Ce qui ne va pas aujourd'hui (mesuré, v1559)
- La route fait 56 m de large (ROAD_HALF 28) et passe presque toujours AU-DESSUS des toits ; le premier rang de tours est à 40-100 m du bord (la règle d'or n'en exige que 24) : on ne frôle jamais rien.
- Vue du dessus : de grandes boucles (saut, grand saut, rond-point) reliées par de longues lignes presque droites (virages de 2,4-3,4 rP, balayages ≥ 6,5 rP : à 78 m/s on ne les sent pas).
- Vue de côté : une descente en escalier, jamais de remontée.
- La dalle de la ville ne s'incline jamais (aucun dévers : la ville n'a pas de `TORD.N`).

## Les piliers
1. **Jamais une ligne droite sans raison.** Entre deux scènes, des virages légers enchaînés (35-75°, 1,9-2,6 rP, en S), qui montent et descendent (houle de ±12-30 m). Une droite n'existe que pour viser une scène (la « ligne de mire », 1-2 s, pointée sur le monument).
2. **La route respire en 3D.** Crêtes au ras des toits, plongées dans les rues, remontées en spirale : la descente reste (les sauts en ont besoin) mais elle ondule.
3. **Chaque scène est un couple route + bâtiment.** Le module déclare son décor (ancres), la ville le bâtit exactement là.
4. **Lisible et facile.** Virages larges (≥ 1,9 rP), dévers qui aide, scènes annoncées de loin (le monument se voit avant), jamais de dévers sur un saut.
5. **Carte postale.** Chaque scène a son point de vue : route + bâtiment + lumière (néons, contre-jour) qui composent.
6. **Une partie unique.** 4 à 6 scènes tirées parmi 9 (sans redite), côtés, montée/descente, styles de tours et teintes tirés à chaque route.

## Les scènes (le catalogue)
| Scène | Route | Décor | Inspiration |
|---|---|---|---|
| **LA TRAVERSÉE** | un balayage cale le cap sur la trame de la ville, puis 150-230 m presque plats | une tour PERCÉE : la route entre dans un hall éclairé (plafond à ~40 m), cadre de néon aux deux bouches, bandes de lumière au plafond, bureaux allumés sur les murs | Liziba (Chongqing) |
| **LE NŒUD** (climax) | le rond-point descendant, calé sur la trame | la tour du croisement percée DEUX FOIS : on la traverse en haut, on fait le tour, on la retraverse 70-90 m plus bas, à angle droit : le tunnel sous le tunnel | échangeurs de Chongqing |
| **LE VIRAGE DE FAÇADE** | 90-130° à 2,2-2,6 rP, dévers 40-50° | une géante en croix (silhouette ronde) à l'intérieur, à ~14 m du bord bas de la dalle : la façade défile contre la portière | Minority Report |
| **LA SPIRALE** | 1-1,2 tour qui MONTE (~8 %, +60-90 m), dévers 30°, R ≥ 2,6 rP | une tour-phare ronde au centre, couronne de lumière ; on sort au sommet et on replonge | rampe du pont de Nanpu |
| **LA CRÊTE DES TOITS** | montée 8-12 % (2-3 s), crête, plongée 18-24 % | un toit-terrasse 8 m sous la crête : hélistation (H de néon), blocs techniques, mâts ; on décolle si on va vite | — |
| **LA PASSERELLE** | droite calée sur la trame, 1,5 s | deux tours jumelles de part et d'autre, reliées par un pont de verre 30-40 m au-dessus de la route (parfois deux) | Petronas |
| **LE SLALOM DES GÉANTES** (v1544) | 4-5 virages alternés | géantes PLUS PRÈS (≈ 16 m du bord), dévers alterné | — |
| **LES PORTES DE LUMIÈRE** | un grand S | 5-7 portiques de néon qui enjambent la route | Blade Runner, F-Zero |
| **LA PLONGÉE** | 3 s à 22-26 % entre deux murs serrés, puis remontée | une avenue au fond (bandes de lumière, trafic), le sol est dur (on y meurt si on tombe) | Coruscant (L'Attaque des clones) |

Gardés : le SAUT et le GRAND SAUT (raccourcis), le ROND-POINT et le TOUR DE LA GÉANTE (climax, avec dévers).

## Le dessin technique
- **Dévers de la ville** (comme les dunes, `DN.bankN`) : à la fin de `genCtrl1`, une normale par point de contrôle — dévers automatique ≤ 26° (courbure moyennée ±50 m, tanh), dévers SCRIPTÉ des scènes (`MODMARK.dv=[[i0,i1,rad]]`, rampes douces), ZÉRO sur l'entrée, les sauts (`vSaute`), les crêtes et l'arrivée. `pisteRoute` (depart-avance.js:97) prend `TORD.N=VILLE.bankN` sans `TORD.on` (la gravité reste la gravité ; la caisse tient au rail, elle ne glisse pas). Miroir dans le pré-bâti.
- **Liaisons vivantes** : la montée de la phrase devient 2-3 virages de 35-75° à 1,9-2,6 rP, enchaînés en S, chacun qui monte ou descend ; les souffles des villes deviennent des balayages (droites franches seulement en ligne de mire).
- **Le canyon plus proche** : le 1er rang à 14-40 m du bord au lieu de 28-68 (mêmes tirages `vr`).
- **Ancres de scène** (`FILETMARK.anc`, types `geante` existant, + `tunnel`, `toit`, `passerelle`, `mur`, `rue`, `porte`) : `buildVoxCity` réserve leur emprise (`ANCD`), puis bâtit chaque pièce avec SA marge (une scène peut approcher la route à 10-16 m ; les tours ordinaires gardent la règle d'or).
- **La trame** : les scènes bâties (tunnel, passerelle, nœud) calent le cap de la route sur un multiple de 90° (les tours de la ville sont alignées sur les axes) : les boîtes restent alignées, rien à tourner.
- **Collision** : murs, plafonds, toits et ponts sont des volumes durs (`CITY.col`) — mortels en vol, comme toutes les tours (villeHeurt ne teste qu'en vol). Le sol de la plongée tue (comme le sol de la vitrée). Le dessus d'un socle sous la route reste 6 m sous le bitume (comme la `pile`).
- **Ce que les explorations ont fixé (13/11)** :
  - les tours de béton ne tournent pas (`fam` : position + échelle ; la collision et l'audit lisent des boîtes alignées) → les scènes bâties se calent sur la trame ;
  - un volume qui FLOTTE (plafond de tunnel, passerelle, bloc entre deux tunnels) prendrait le brouillard violet du pied (`villePied` : les 280 m bas de CHAQUE boîte) → un drapeau par instance « sans pied » dans villeMatTours et cryptoMatTours (clé de cache montée) ;
  - le dessous d'un plafond sort noir (pas de fenêtres en dessous) → l'intérieur s'éclaire de bandes de néon (`neonC` 5 ou 6 : l'audit ne les prend pas pour des enseignes flottantes) ; la pluie s'éteint sous le toit ;
  - la caméra de conduite est à 4-6 m derrière, 2-4 m au-dessus (9 m en vol) : un plafond à 38-44 m ne la gêne jamais ;
  - les volumes de scène s'ajoutent EN DERNIER (aucun tirage `vr` de couleur décalé), 0 appel de rendu de plus (ils entrent dans les familles existantes).
- `?sans=villeame` : la ville v1559, au tirage près.

## Réponses au contrôle (mes choix — Sacha : « fais-le en une fois, très optimisé, prends ton temps, pas de bug »)
- **Téléphone** : exactement les mêmes scènes et la même structure dure partout (la collision ne dépend pas de l'appareil). Aucun programme ni matière neuve : volumes et néons entrent dans les familles existantes ; seuls les portiques des PORTES ont leur propre instance (même matière néon, +1 appel de rendu).
- **Collision au sol** : la caisse tient au rail ; les murs, plafonds, toits et la rue ne tuent qu'en vol (comme les tours). Tomber dans LA PLONGÉE = mourir sur la rue (une dalle dure).
- **Génération** : les scènes viennent d'un paquet mélangé (sans redite), à la place des temps forts du paquet ; deux temps forts sur trois restent des raccourcis. LE NŒUD est un climax possible (avec le rond-point et le tour de la géante). Chaque scène bâtie fait son propre calage sur la trame (un virage de 26-116° au début du module) : rien à refuser à la génération. Une pièce de décor qui ne trouve pas sa place (une autre route trop près) est abandonnée — la route reste, le banc compte les pertes.
- **`?sans=villeame`** : toutes les nouveautés coupées, la route et la ville de v1559 au tirage près (les nouveautés ne tirent qu'à l'intérieur de leurs branches).
- **Cibles chiffrées** : part de droites franches ≤ 8 % (palier 0) ; ≥ 3 scènes par route au palier 0, ≥ 2 au palier 20 ; ≥ 90 % des pièces de décor posées ; audit `dans/frole/flotte` = 0 ; 0 erreur sur 24 courses ordi + téléphone ; montées ≤ 12 % ; croisements ≥ 46 m de hauteur libre (hors raccourcis déclarés) ; pas d'appel de rendu de plus hors des portes ; construction de la ville < +15 %.
- **Une seule passe** : étapes 1 et 2 ensemble ; publication seulement après le feu vert.

## Étapes
1. **Fondations + 6 scènes** : dévers, liaisons vivantes, canyon proche, ancres de scène ; LA TRAVERSÉE, LE NŒUD, LE VIRAGE DE FAÇADE, LA SPIRALE, LA CRÊTE DES TOITS, LA PASSERELLE (+ slalom resserré). Une carte postale par scène.
2. **LES PORTES DE LUMIÈRE et LA PLONGÉE** (nouveaux objets : portiques, avenue et sol dur).

## Anti-buts
Une tour qui tue sans qu'on l'ait vue venir · un dévers sur un saut · une spirale serrée ou une route qui se superpose de près (règles du 05/11 et du 08/11) · moins de raccourcis qu'aujourd'hui · un coût en image sur téléphone (pas de matière ni de programme neuf sans ALLEGE) · une montée qui étouffe la vitesse (montées courtes, ≤ 12 %).

## Vérification
Bancs Node (`mesure-villes.cjs` : droites, notes, raccourcis, scènes par route ; `croise.cjs`), banc des maps (gen + audit `dans/frole/flotte`, courses au pilote auto ordi + téléphone, nuit et jour), une CARTE POSTALE par scène (vue libre), `garde-allege`, `garde-charte`, `non-declares`. Cache +1. Publication après votre feu vert.

## Choix faits par moi (à contrôler)
Le catalogue et ses dimensions · la trame à 90° pour les scènes bâties · dévers auto ≤ 26°, façade 40-50°, spirale 30° · sol dur seulement dans la plongée · étape 2 pour portes et plongée.
