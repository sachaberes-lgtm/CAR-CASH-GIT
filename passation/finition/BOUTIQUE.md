# Finition : la boutique plus fluide (2026-11-13)

Sacha, sur son iPhone 13 Pro : « la boutique mérite d'être optimisée ». La course tient ses 30 i/s ; la boutique rame, saccade et met du temps.
Branche `fin/boutique` (worktree `~/cash-car/finition-boutique`), partie d'`ios-finition`. Apparence et règles inchangées.

## Comment ça a été mesuré
Un seul Chrome sans tête (`outils/banc-boutique-a/banc.cjs`, 390×844 tactile, `?tel=1`, sans son), la charge du Mac entre 50 et 380 : **les chronos ne valent rien,
seuls les compteurs comptent**. Sondes rangées dans `outils/banc-boutique-a/perf/` :
- `sonde.js` (injectée dans la page) : appels de dessin WebGL, images dessinées par seconde, textures, toiles 2D, toBlob/toDataURL, innerHTML (par élément),
  lectures de mise en page (getBoundingClientRect, offset*), écritures localStorage, animations qui tournent (hors vue / invisibles), filtres, ombres, nœuds.
- `mesure.mjs <port> <étiquette> [portrait|couche]` : accueil → garage → ouverture → repos → chaque rayon → défilement de la bande → rotation au doigt →
  essai de peintures, plus les compteurs CDP (LayoutCount, RecalcStyleCount). Écrit `mes_<étiquette>_<format>.json` et les photos à côté de lui.
- `profil.mjs <port> "<geste JS>" <ms>` : le profileur JS (temps propre et total par fonction). `trace.mjs` : les évènements de la timeline (Paint par couche, style, mise en page).
Le port de contrôle est le 3e argument de banc.cjs ; le port CDP est celui d'avant (port − 1).

## Ce qui coûtait (mesuré)
- **Au repos, la boutique ne coûte presque rien en JS** : ~1,8 ms de boucle par image, garBqPanneau 0,27 ms, 0,05 mise en page par image. La scène 3D tourne
  (la caisse pivote) : son rendu est nécessaire.
- **Le doigt sur la bande rendait la scène 3D à 51 i/s** alors que rien n'y change (la caisse ne s'échange qu'au verrou). Sur iPhone, la bande défile en JS
  (le doigt la tire, voir LE VERROU RAPIDE) : ces rendus prennent le fil principal aux touchmove.
- **15 reflets en boucle infinie sur des cartes hors de la bande** (lgShine du prix et du nom des boîtes rares et plus ; aux AILES, bcLuit + bcScint) : style recalculé et
  repeint à chaque image ; sur iPhone chaque `.lg::after` est en plus sa propre couche (`html.ifReflets`). Les mettre en pause : temps de recalcul du style
  au repos 199 → 65 ms sur 5 s (trace Chrome).
- **Dans l'app, les photos de caisses étaient jetées à chaque build** : `__CC_PHOTOS__` n'était gravé que par vercel-build.sh ; dans l'app la signature des
  photos gardées (IndexedDB, `phdbVer`) retombait sur CC_BUILD = le dernier commit → chaque build ou mise à jour en direct refaisait toutes les photos de la
  boutique à la première ouverture (à l'ouverture mesurée : 47 toBlob, 78 readPixels, ~3,5 s de vitrinePhoto/buildCar sur le Mac).

## Les lots
| Lot | Ce qui change | Avant → après | Interrupteur |
|---|---|---|---|
| La bande à 30 (`moteur/cadence.js`) | un glissé / molette / pointeur qui bouge SUR la bande ne rend plus les 60 i/s : la scène garde 30 i/s (la cadence du repos dans l'app). Le toucher qui commence, l'échange de caisse, la rotation au doigt rendent toujours 60. ALLEGE seulement. | images 3D pendant le défilement 51,3 → 31,3 /s ; rotation au doigt 56 → 49 /s (inchangé, bruit) | `?sans=bande30` |
| Les reflets hors champ dorment (`interface/boutique-scene-1.js` bqHorsVeille, `css/boutique-a-iphone.css`) | un observateur (racine : la bande, 60 px d'avance) met `.bqHors` sur `.lg/.bcEcl/.bcSc/.bcTv` hors de la bande → `animation-play-state:paused` (jamais `animation:none`). Seulement des boucles infinies. ALLEGE seulement. | animations infinies au rayon VOITURES 18 → 6 (15 hors vue → 3, dans la marge) ; les 3 en vue tournent | `?sans=refletshors` ; `dbgBqHors()` |
| Empreinte des photos dans l'app (`app-ios/preparer-www.js`) | grave `CC_PHOTOS` = empreinte des fichiers qui changent l'image d'une photo (même liste que vercel-build.sh) | photos refaites à la 1re ouverture après un build : toutes → 0 (si aucun fichier de la liste n'a changé) | `CC_PHOTOS=0 npm run sync` |

Photos avant/après (390×844 et 844×390) : identiques hors la phase de rotation de la caisse et des chevrons de JOUER.

## Pas fait / pas vérifié
- Rien n'est vérifié sur l'iPhone ni dans WebKit (pas de simulateur ni de xcodebuild dans ce lot). Le gain réel du lot 1 dépend du temps CPU d'une image 3D sur le 13 Pro.
- Le lot 3 n'agit qu'au prochain `npm run sync` / build ; l'essai à blanc (`node preparer-www.js --essai --sortie …`) grave bien `CC_PHOTOS='e6e5ded6…'`.
  ⚠ La liste des fichiers est tenue en DEUX endroits (vercel-build.sh et preparer-www.js).
- Restent, vus mais pas touchés : les chevrons de JOUER (`gChevFile` anime `color` → 3 repeintes par image, la plus grosse source de Paint au repos — visible,
  donc gardé) ; `pan.offsetTop` lu à chaque image dans garBqPanneau (petit) ; 235 éléments à `box-shadow` au rayon PEINTURES (statiques) ; la première entrée
  aux AILES (photos des ailes sur la caisse : compilations de shaders, déjà étalées par la file du studio).
- Non touchés à dessein (autre lot en parallèle) : la fuite des motifs/livrées dans `economie/boutique.js`, RESTAURER et l'achat en attente dans `achats-store.js`.

## À essayer sur l'iPhone
1. Tirer la bande des VOITURES vite, plusieurs fois : la bande doit suivre le doigt sans à-coups, le verrou et l'échange de caisse rester nets.
2. Défiler jusqu'aux boîtes rares / épiques / légendaires : le reflet doré du prix et du nom passe toujours sur celles qu'on voit.
3. Rayon AILES, faire défiler : les étincelles et l'éclat des légendaires brillent sur les cartes en vue.
4. Tourner la caisse au doigt dans la boutique : toujours fluide (60 i/s).
5. Après le prochain build : ouvrir la boutique une fois, relancer l'app, rouvrir → les vitrines sont là tout de suite (plus de rafale de photos).
