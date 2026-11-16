# JADE QUI SECOUE, PUIS SANS MER — passation (2026-11-12)

Demande de Sacha : « refonte du système de route des montagnes de Jade : trop répétitif, trop plat. Beaucoup de modules, propres à la map,
fun, simple, sobre, sans grands demi-tours. Il faut que ça secoue. » Puis, en cours de réglage : « changement de plan : plus de mer dans les
pics de jade, ça doit juste être des pics flottants comme Avatar ; retravaille la génération et le design pour que ça soit à couper le souffle ;
la route doit descendre en passant entre les montagnes qui flottent. » Puis, sur le code de la mer gardé derrière `?mer=1` : « j'en veux plus ».

**Publié** : v1512 (Jade sans mer, commit 2d245d30), puis v1515 (la mer retirée du code, commit 11ada290). Branche de travail : `jade-modules-2026-11-12`.

## Les modules (genJade1, code/maps/jade-1.js)

| Module (`?jmod=` clé) | Ce que c'est |
|---|---|
| slalom | 4 ou 6 virages alternés, un pic planté à la corde de chacun |
| defile | un S large entre deux rangées de pics en quinconce |
| carrousel | un grand appui de 105-125° autour d'un vrai pic (remplace épingle et double sommet dans le paquet) |
| vrille | une droite, un tonneau complet de la dalle (~4 s) |
| colimacon | un tour complet autour d'un pic, qui DESCEND toujours (64 à 90 m) |
| plongee | LE GRAND PLONGEON (`jPlongeon`) — 62 à 90 m de chute en ~3,6 s entre deux pics, sous une île qui flotte au-dessus de la route |
| bosses | 3 ou 4 bosses de 6-8 m sur une droite |
| ascension | rare (25 %, `?asc=1`) : un tour jusqu'au-dessus du pic (150-200 m), une crête, un tour de l'autre main pour redescendre |

Jusqu'à 5 modules par vallée, deux par tronçon (`troncFun`) ; signatures (slalom, vrille, colimaçon, plongée) entrelacées avec les autres.
`?sans=jadefun` : la génération d'avant ces modules (sans la mer, elle aussi).

## Jade sans mer

- **Le ciel** (`code/rendu/scene-ciel.js`, `jAbime`) : sous l'horizon, la brume qui s'enfonce vers un bleu profond, et loin dessous une mer de
  nuages éclairée côté soleil, à `uJMerY` (parallaxe vraie). Le fleuve, la mer en cubes, l'écume et le ciel d'en dessous sont retirés.
- **Plus d'eau, dans le code non plus** (v1515) : la physique de l'eau (plonger, ricocher, surfer, jaillir, la mer qui ramène), l'eau qui frappe
  les montagnes, les effets (gouttes, couronnes, sillage, objectif mouillé, son sous l'eau, la peau de l'eau), les dauphins (et leur modèle,
  plus chargé par la page), le ras de l'eau, la route sous la mer et l'option `?mer=1`. **`JEAU` reste, neutre** (jade-3.js) : le vol, la caméra,
  le son, les missions et les portails le lisent — la caisse n'est jamais dans l'eau. `JADE.eauY = merY − 40` : le fond de l'abîme.
  Tomber de la route : la mort par le vide habituelle (jauge d'air, ou 120 m sous le point le plus bas : `jadeVide`).
- **La mission L'ABYSSE** (missions/table.js, secrète, 15 000) : « DESCENDS 400 M DANS LES PICS DE JADE » — la descente depuis le haut de la
  vallée (defis-moteur.js), au lieu du fond de la mer, devenu impossible.
- **La descente** : le relief au hasard penche vers le bas (`JDESC` 5,5 à 8,5 %, `JADE.desc`), ajoutée APRÈS les paliers (ils n'aplanissent que
  les ondes) ; ondes plus douces (budget de pente 0,20). Mesuré : 470 à 630 m de descente par vallée.
- **Les îles du ciel** (jadeBatit, jade-3.js) : tous les 560-980 m une montagne flotte au-dessus de la route (pied 75 à 135 m plus haut).
  Le lointain s'étage de −380 à +720 m autour de la route. Cascades × 1,6, longueur plafonnée à 340 m (elles se perdent dans la brume).

## Réglages faits pendant les contrôles

- **Le Pont du ciel** (`jadePont`, jade-eau.js) posait ses piliers et son arche sans la règle d'or : un pilier qui tomberait sur une autre portion
  de route est rehaussé au-dessus d'elle, sinon pas posé ; une arche traversée par une autre portion → pas de Pont dans la vallée (`pontSaute`).
- **Ascension** : autour d'une route levée, aucun sommet au-dessus de la crête − 35 m (900 m à la ronde).
- **Paliers voisins** : deux zones aplanies du relief à moins de 400 m prennent le même niveau.
- Crochets de banc (`jade-secoue.js`) : `dbgJadeMods()` / `dbgJadeMods(s)` (les montagnes au droit de la route en s), `dbgUniformes()` (les matières
  dont le programme lit un uniforme absent — la cause d'un écran noir « a.needsUpdate »).

## Ce qui a été vérifié (Chrome sans fenêtre, `outils/banc-maps`)

- Lots de 20 graines × 2 éditions (ordi, téléphone) avec et sans mer ; les fautives corrigées puis repassées : 0 heurt, pentes sous 0,40 sauf le
  grand plongeon (0,42 à 0,47, voulu). Conduites au pilote auto sans mort à travers plongeon, vrille, colimaçon, ascension.
- Après le retrait de la mer : syntaxe, assembleur, gardes, analyseur des non-déclarés (44 au lieu de 52, rien de nouveau), `dbgUniformes()` vide ;
  Jade (ordi + téléphone), nuages et grotte conduits avec photos, image nette.
- Panne trouvée en route (pas de ce travail) : depuis la fusion d1e431eb (v1508), tout le jeu s'affichait en noir en course (« a.needsUpdate »,
  `TRAIT_U.uAA` perdu). Une autre session l'a corrigée (3f462573, v1513) ; v1515 la contient.

Commandes :
`node outils/banc-maps/serveur.cjs 8347`, puis
`node outils/banc-maps/banc.cjs gen --carte=jade --graines=1,2,3 --roule=100 --photos=1 --port=8347 --cdp=9551 --profil=jade --audit="JSON.stringify({u:dbgUniformes(),m:dbgJadeMods(),r:dbgJadeRegle()})"` ;
`vue --graines=7 --s=700,1050 --meteo=midi` pour des photos. ⚠ `--roule` long : une vallée finie passe le portail, `s` repart de zéro.

## Ce qui reste

1. **Juger en jeu, au volant** : la descente, le grand plongeon, l'île au-dessus, la vrille (`rails9` de boucle-2-conduite.js traite une dalle couchée
   comme un looping sans TORD.on).
2. **Le ciel** pas vu la nuit ni au soir en photo fixe (vu la nuit en course : correct).
3. Les textes de figures de l'eau (PLONGEON, RICOCHET, SURF…) restent dans traductions.js : inutilisés, sans effet.

## LA CHUTE DE JADE, L'ENDROIT ET L'ENVERS (2026-11-12, branche `jade-chute-2026-11-12`)

Sacha : « retravaille la génération de route : il faut que ça aille vers le bas et exploite les pics volants ; on doit descendre en roulant à travers
des pics de jade volants, c'est super épique — prends des libertés, inspire-toi des autres maps », puis « il faut que ce soit vertigineux dans
l'esthétique, et que tu joues sur l'idée de l'endroit et l'envers ».

- **La pente de fond** 17-23 % (`JADE_CHUTE.fond`, `?jadepente=0.07` = celle d'avant) : 0,9 à 1,7 km de descente par vallée ; la route naît en pente.
  La règle du rythme accepte jusqu'à 0,85 de pente pour Jade (route-rythme.js). Les rampes des modules ont leur arrondi (`e`, rampe(t,e)).
- **Modules** : LE PUITS (rare, remplace l'ascension : deux tours autour d'un pic géant, 170-250 m plus bas), LE COULOIR (pics des deux côtés + une île
  au-dessus), LES ARCHES (trois îles au-dessus d'un S), LES MARCHES (3-4 bascules de 30-45 m autour de pics), LE RETOURNEMENT (`envers` : demi-tonneau,
  ~2 s tête en bas en descendant sous trois pics renversés, demi-tonneau) ; plongeon 80-115 m, colimaçon 90-140 m ; îles du ciel deux fois plus nombreuses.
- **Les pics renversés** (`q.inv`) : une île du ciel sur deux, un tiers des montagnes proches et la moitié des lointaines qui flottent entièrement
  au-dessus de la route sont posées la tête en bas (jadeMatPilier / finMat : demi-tour autour de x ; jadePilierDans : le point ramené à l'endroit) ;
  leurs pins pendent (hauteur négative = le shader les dessine vers le bas) ; ni lianes, ni temples, ni cascades, ni cristaux, et elles ne s'effondrent pas.
- **Le saut refusé tête en bas** (`jadeEnversRefuse`, jade-secoue.js) : veqSaut et frEnvol refusent un saut si la dalle regarde vers le bas sur les
  4 s de vol qui suivent (200 m au moins) — sur une descente de 20-40 % un saut dure 3-4 s. Le saut du banc (`dbgAuto({saut})`, boucle-1.js) suit la même règle.
- Cascades jusqu'à 700 m de chute sur ordi (340 sur ALLEGE).

Mesuré : lots propres (0 heurt dans le couloir) ; pente locale max 0,42-0,50 ; sauts toutes les 2 s : plus aucune mort dans les retournements ni
les vrilles ; les morts restantes sont aux Trois Pics (une crête suivie d'un virage de 50° : le saut part tout droit) — elles existaient avec la pente
d'avant (comparaison `?jadepente=0.07` : 4 morts sur 4 contre 3 sur 4).

À faire : juger au volant (la descente, le retournement, le vertige) ; les Trois Pics plus doux si les sauts y tuent trop ; le retournement vu de près
sur téléphone ; `?jmod=` liste : puits, couloir, arches, marches, envers.
- Audit : dbgJadeAudit().panneaux suppose une route à plat ; dans une vrille ou un retournement il signale à tort (graine 13 téléphone : une liane à 88 m du vrai couloir, mesuré dans le repère de la route couchée).

## La nuit et la pluie sur téléphone (2026-11-12)

Sacha : « sur mobile les versions nuit et pluie ont un mauvais rendu ; améliore les couleurs, spécialement pour l'iPhone optimisé ». Les temps avaient été réglés
pour une mer sous l'horizon ; sur téléphone (moins de montagnes, cadrage en hauteur) le ciel, l'abîme et la route remplissent l'écran. Que des couleurs, aucun coût :
- monts peints de l'horizon (jLointain) : suivent la lumière du ciel (silhouettes d'encre la nuit) et, par temps sombre ou gris, prennent la teinte de l'horizon ;
  jour, matin, soir inchangés (plafond 1, poids nul au-dessus d'une luminance de .78) ;
- mer de nuages de l'abîme : éclairée selon le ciel (argent sourd au clair de lune la nuit) ;
- etalonnage-da.js : `rtT` (teinte de la route de Jade) la nuit, l'orage, la pluie ; la pluie en vert de jade brumeux plus profond (brume, ciel, reflets).
Photos avant/après : banc `vue --carte=jade --meteo=nuit|pluie|orage --tel=1`. Pas vu sur un vrai iPhone.

## LA ROUTE FRÔLE LES PICS (2026-11-13) — « trop de tout droit, joue avec l'environnement, la route doit exploiter la proximité avec les pics de manière créative »

Mesuré avant (dbgJadeProx, 3 graines) : 7 à 19 % de la route à moins de 14 m d'un pic, des tronçons de 2,5 km sans un pic à moins de 28 m, 40-48 % de droite.
Maintenant : 40-56 % frôlé, plus long vide 390-450 m (les abords des monuments, `zonesNu`), 35-44 % de droite (la vrille et ses abords, la Porte et le Pont restent droits).
`?proxi=0` rend la vallée d'avant. Trois étages, tous derrière `JADE_PROX` :
1. **Génération (jade-1.js, genJade1)** : `ARCR` note chaque arc dessiné. Une droite libre de 80 m et plus devient un S autour d'un pic (`virages`, 90 %) ; le souffle avant un module fait 1,1-1,7 s (1,8-2,7) ;
   la Porte et le Pont perdent ~70 m de droite, la vrille ~100 m. Fin de genJade1 (« LES FRÔLEURS ») : chaque arc hors module reçoit son PIVOT (au creux, 4,5-8 m) et une fois sur deux son MUR (à l'extérieur) ;
   chaque droite hors module un motif au hasard — QUINCONCE, PORTES, FALAISE (paroi d'un seul côté) ou VOÛTE (une île au-dessus, renversée une fois sur deux, et deux pics au bord). Les monuments, les trois pics
   et les modules qui ont déjà leurs pics (`POSE`) sont laissés tranquilles (masque `hors`).
2. **Pose (jade-3.js, « LE RASE-ROUTE »)** : après les pics des modules, tous les ~30 m de route réelle sans pic à moins de 27 m du bord (40 en JADE_SOBRE), on en plante UN à 4,5-8 m — dans un virage au creux (70 %),
   sinon en quinconce ; un sur sept est une île au-dessus de la route. Hors `zonesNu`. C'est lui qui fait l'essentiel (le plan de la génération ne voit que ~210 points de contrôle). `un()` est sorti de `if(JADE.pose)`.
3. **Bug trouvé en chemin** : `inv` n'était pas transmis dans `JADE.pose` — les trois pics du retournement et les îles renversées voulues par les modules étaient posés à l'endroit. Corrigé (`inv:o9.inv||0`).
Crochet de banc : `dbgJadeProx()` (frole, vide, droite, droiteMax, rase, frol, runs). Piège : sur le banc, `--attente=8` ou plus fait mourir le pilote à ~314 m (monde pas encore bâti au-delà) — garder `--attente=4`.
Mesuré : 8 graines ordi + 4 téléphone sans un heurt dans le couloir de conduite ; le pilote finit la vallée sur 4 graines ; avec des sauts forcés toutes les 2 s il meurt vers 3000-5500 m (comme avant, 4100-5800).

## LA DESCENTE ALLÉLUIA (2026-11-13, branche `jade-avatar-2026-11-13`) — la route en scènes, l'endroit et l'envers

Demandes de Sacha (dans l'ordre) : « trop de tout droit, c'est insupportable, on s'ennuie ; des droites courtes (jamais plus de 5 s) ; la map va trop dans une seule
direction ; il faut que ça descende beaucoup plus, au moins 45°, voire 50° ; joue sur la taille des trucs (trop serré dans un couloir de jade : garder des parties
comme ça, mais avec plus de virages) ; des zones contemplatives, carte postale : trois îlots bien répartis, puis on descend dans un petit couloir d'îlots ; un petit
îlot qui flotte et bam, le virage se met juste devant ; on passe sous une cascade ; de nouvelles formes de montagnes, plus larges, des îlots plus petits ; des modules
qui interagissent avec le décor ; comme les îles flottantes d'Avatar », puis « exploite à fond l'endroit et l'envers : ça baisse, ça remonte, une spirale derrière des
tours, paf paf on passe derrière des tours, on sort d'un couloir et on est à l'envers », puis « très optimisé, en une fois, pas de bug », puis « pas de torsade trop
serrée et pas plus de 10 secondes dans une même direction ». La CHARTE DES ROUTES de la supervision (`passation/CHARTE-ROUTES.md`, banc juge : R1-R10) et son
évaluation n° 2 (« un passage à l'envers sur CHAQUE route, 8-20 %, annoncé et sorti sur du calme ; vise 5-6 modules au palier 0 »). Puis Sacha, après avoir joué :
« pas de looping. Sinon c'est pas mal : debug complètement puis push » (et pour les six maps : « looping dans aucune map »).

**La route** : une DESCENTE faite de SCÈNES, chacune avec son décor posé pour elle. Deux familles (la parité de la graine, R5) ; CHAQUE ROUTE joue le même paquet :
- une scène de sa famille, tournée d'une graine à l'autre — paire : le grand plongeon (une crête entre deux pics, 2 s à 50-56°, le virage juste devant un îlot),
  le couloir d'îlots, le chas de l'aiguille, le mur du massif ; impaire : derrière les tours (paf, paf), sous la cascade, les montagnes russes, LA VOÛTE D'ÎLES
  (un balayage en S sous trois ou quatre îles suspendues juste au-dessus de la route — elle remplace le looping) ;
- le 1er RACCOURCI (spirale autour d'une tour, stade · colimaçon autour d'une île, puits : une cage de trois tours) ;
- L'ENVERS de la famille : le couloir qui retourne (on sort du couloir de pics la tête en bas) · l'envers sous les îles (pics renversés sous les roues, îles
  au-dessus de la tête) — annoncé par un pic renversé suspendu au-dessus de la route, demi-tonneau de 5 s, ~1,2 s la tête en bas dans un virage, demi-tonneau
  de sortie, balayage ;
- LE CLIMAX : le balcon, la carte postale (un grand virage presque à plat au bord du vide, trois îles de tailles différentes, un massif qui pleure ses cascades,
  puis on pique à ~50°), vers 55-65 % de la route ;
- le 2e RACCOURCI.
Aux paliers 0-5 : 5 modules ; plus vite, la première scène saute (LA DURÉE DES MAPS de Léo : la route raccourcit avec la vitesse). Plus de looping (Sacha).

**Le code** (`?sans=jadev3` rend la vallée d'avant, genJade1, intacte ; `?jscene=russes,couloir` impose les premières scènes) :
- `code/maps/jade-alleluia.js` (nouveau morceau, après jade-1) — tout est expliqué dans son en-tête :
  `genJadeA` (le meilleur de 10 essais, arrêt dès une note ≤ 0,6), la tortue (cap + pente + roulis écrit), les scènes (`JA_CLES`, `JA_FAM` : `autres`, `env`,
  `rac`), LE PAQUET, LA BOUSSOLE et LE GARDE-FOU (direction, R1), la rampe `rp` (roulis, R3), les contrôles de chaque essai MESURÉS COMME LE JUGE (à la vitesse
  réelle), les raccourcis et leur vol joué, `jadeAApplique` (MODMARK : `nom`, `climax:1`, `rac:1` avec i0 = la lèvre, i1 = la pose), `jadeDeco3Pose` (tours, îles,
  cascades des scènes, jugées au PROFIL RÉEL du gabarit : rayon par rangée), `jadeCascRoute` (la gerbe sous la cascade), `jadeCouloirVol`/`jadeVolLibre`
  (LE COULOIR DU VOL), `jadeFilsOr` (les pièces sur l'arc du saut, `?filsor=0`), `dbgJadeA()` (avec `couloirVolMs`, `filsOrMs`), `dbgJadeRac(k,1)`.
- `jade-1.js` : `genJade` → `genJadeA` (+ `JADE.genMs`) ; `voxPilierG` sait deux sortes de plus — 4 l'ÎLE (le plateau qui s'évase, le dessous en long cône),
  5 le MASSIF (large, en gradins) — les sortes 0-3 sont les mêmes au bit près.
- `jade-2.js` : les 6 gabarits d'îles et de massifs (`JADE_ILE`, à partir de `JADE_ILE0`), bâtis seulement en V3 ; `cascR` dans `JADE_CH`.
- `jade-3.js` : l'abîme plus profond (merY − 520) ; `tente`/`touffe` posent une île ou un massif (`forme`) ; le couloir du vol (`CVOL`) respecté par toutes les
  poses ; les décors des scènes avant tout le hasard ; LE CALME (rien de près au hasard sur la carte postale) ; les îles du ciel sont de vraies îles ; au loin un
  massif sur huit, une île sur trois ; le rase-route du 13/11 est coupé en V3 (« trop serré dans un couloir ») ; les cascades des scènes.
- `jade-vol.js` : `jadeCascRoute()` à chaque image. `jade-secoue.js` : `jadeSautSur`/`jadeHeurtPt`/`dbgJadeSaut()` (le saut prédit) — il ne sert que hors TORD,
  donc plus en V3.
- MOTEUR PARTAGÉ, trois lignes : `moteur/depart-avance.js` (Jade V3 : `TORD.on`, `TORD.pente`, `TORD.N=JADE.bankN` — Jade roule comme les autres maps roulées :
  caméra, vol et bord de route suivent la dalle, VOLR_FIGE), `moteur/piste-prebati.js` (`genJade(rnd,seed)` dans dbgGenBilan1/dbgGenRoute : la graine pour le
  juge), `gameplay/pouvoirs-grisants.js` (`jadeFilsOr()` après `espFilsOr`). Outil : `outils/banc-maps/banc.cjs --photoms=1400` (l'abscisse dans le nom des photos).

**Les raccourcis** (R6) : une LÈVRE presque à plat ; sous elle la route plonge à 30° (LA CHUTE), se redresse (la ressource) et fait une boucle de 360° presque à
plat autour de son décor ; LA SORTIE-TREMPLIN se recale sur la ligne de la lèvre (un petit S annule l'écart de côté et de cap), remonte à 14-17° sur toute la zone
de pose, puis LE REPLAT. Qui saute à la lèvre se pose sur le tremplin 1,7-3 s plus tard, ~200-270 m plus loin (mesuré dans le vrai jeu, volant lâché : 8/8).
Chaque essai joue le vrai saut (VEQ_K.saut × SPD ≈ 10 m/s le long de la normale, pesanteur 23-28 m/s², 1 à 1,9 × la croisière) et LE COULOIR DU VOL interdit tout
décor sur sa trajectoire (montagnes, îles, pics, rochers).

**Mesuré** (juge commun, 3 paliers × 8 graines : 27/27) : droites de 8° ≤ 2,7 s ; jamais plus de 6,9 s dans la même direction ; roulis ≤ 44 °/s (95e centile
41) ; la tête en bas sur CHAQUE route, 10-14 % (≤ 6,4 s d'affilée) ; 5 modules au palier 0, 15 scènes différentes sur 8 graines ; pente moyenne 28 % (24 % avant),
plongeons à 50-56° ; durée ~57 s au palier 0 (47,7 avant ; acceptée par la supervision), 47-50 s aux paliers 10-20. 

**Pièges** :
- LE TEMPS : le juge mesure à la vitesse RÉELLE, vT = vPalier × élan (`DUREE_ELAN` : 1,8 au palier 0, 1,48 au 10, 1,16 au 20). Tout ce qui se juge en secondes
  (droites, liaisons, roulis, crêtes, mur, voûte) est écrit en vT. Les raccourcis restent en vP (leur vol dépend de la vitesse du palier) : au palier 20, leur
  tremplin droit durait 2,8 s — la plus longue droite de chaque route, R2 ✗ (moyenne 3,4 s) — d'où LE REPLAT.
- R3 AU 95e CENTILE : avec un envers sur chaque route, les deux demi-tonneaux font ~17 % de la route — à 4,6 s le demi-tonneau, le 95e centile du roulis tombait
  pile sur la limite (44-45 °/s) ; à 5 s il est à 41.
- LA DURÉE : cinq modules et un envers ne tiennent pas dans les 38 s de vraie vitesse visées au palier 0 (`longueurCible()` × allure 0,85) — les autres maps :
  nuages 45, ville 45, espace 65, grotte 71, canyon 80.
- Le pilote du banc BRAQUE EN L'AIR : un saut testé avec lui suit la boucle et manque le tremplin. Pour juger un saut : `dbgAuto(false)` au décollage
  (`audit-vol.js` : `dbgJadeRac(k,1)` arme le saut à la lèvre k, sans téléporter).
- Un tremplin qui tourne encore de 4-6° perd les vols qui dérivent (graine 1 : le vol passait SOUS la rampe qui montait à côté) : il est recalé sur la ligne de
  la lèvre avant la zone de pose.
- `jadeCascRoute` : les modes de la caisse sont drive / fall / boom (jamais 'run').
- Une scène n'est pas jugée sur ses propres passages (le looping d'avant : son entrée et sa sortie côte à côte — sans ça il n'était JAMAIS gardé).
- Le plateau d'une île déborde de ~35 % son rayon nominal (les harmoniques).
- Le banc des maps tourne SANS le pré-bâti (`&prebati=0`) sauf `--prebati=1` : en tester au moins une graine avec.
- Banc des maps : `--attente=4` (8 ou plus : le pilote meurt vers 314 m, le monde pas encore bâti).

**Bancs** : `node outils/banc-maps/banc.cjs gen --carte=jade --graines=… --auditfile=audit.js` avec `dbgJadeA()` (la fiche de l'essai gardé : famille, note, t30,
t8, roulis, envers, dMin, raccourcis, scènes, climax, décors posés/refusés et pourquoi, fils d'or, temps de génération), `dbgJadeAudit()` (couloir de conduite),
`dbgJadeRac(k,1)` ; le juge : `node outils/banc-juge/juge.cjs --racine=<worktree> --cartes=jade` ; l'empreinte des autres maps :
`node outils/banc-routes/empreinte.cjs graines=1-20` ; le coût : `outils/banc-graphismes/banc.cjs --cartes=jade:soir --graine=7 [--tel=1]`.

**Le débogage complet (2026-11-13, avant publication, Chrome sans fenêtre)** : décor des 8 graines ordi + 8 téléphone : 0 erreur, rien dans le couloir de conduite, rien de flottant, 16-18 pièces de fils d'or par route, génération 0,1-0,3 s ; pré-bâti (2 graines) idem ; le pilote finit la route sur les 8 graines (et 2 avec le pré-bâti) ; les 8 raccourcis sautés volant lâché se posent ; le pilote qui saute toutes les 2 s finit par tomber (vide, air, pic — comme l'ancienne vallée, 3000-5500 m : R7 laisse ~15 % de route où un saut ne se repose pas) ; ?sans=jadev3, nuages et ville sans erreur ; l'empreinte des routes des autres maps et le juge de grotte/canyon identiques à main ; téléphone (banc-graphismes, jade soir/midi, graine 7) : 33,4 ms par image comme avant, image figée 5,4-5,7 ms (4,5-5,5 avant). Piège du banc : un pilote « arrêté » à s constant en mode drive venait d'un banc surchargé (un autre calcul lourd en même temps) — relancé seul, il finit.
