# Lot « boutiquegel » — le petit gel à la 1re ouverture de la boutique (19/11)

Mots de Sacha (18/11) : « Il y a un petit freeze quand on charge la boutique pour la première fois. C'est pas très grave, mais à régler quand même. »
Branche `qa/boutiquegel` (partie d'origin/qualite-appareil). Rien sur main, rien sur le téléphone. `?sans=boutiquegel` = l'avant.

## Ce qui remplissait la pire image (banc ×4, iPhone 13 Pro émulé, profil neuf)
- **Boutique de l'accueil** (#mShop) : les PHOTOS des caisses, une par tâche. Chacune bâtissait la caisse photographiée PUIS remettait
  la caisse du menu (deux `buildCar`), et la 1re liait d'un bloc les programmes du studio (compile + getProgramInfoLog, 90 à 140 ms).
- **Boutique 3D du garage** : sous le voile, la construction du panneau de vente (`garBqPanneau`, ~250 puis ~100 ms sur deux images)
  ET la rafale des photos (`photoRafale`, budget 300 ms vérifié avant chaque photo, puis la caisse rebâtie) dans la même image.

## Ce qui change (rien n'est retiré)
1. `economie/boutique.js` — LA BOUTIQUE SANS À-COUPS : tant que la page couvre la scène, les photos s'enchaînent sans remettre la caisse
   du menu entre deux (`PHOTO.chaine`) ; la caisse du menu revient une seule fois (file vide, page quittée par `mGo`, autre photo demandée,
   ou quelqu'un d'autre bâtit une caisse). Chaque photo reste prise dans la même tâche que la construction de sa caisse.
   ⚠ Essayé puis retiré : bâtir à une image et photographier à la suivante. Le diagnostic a montré que la boucle du menu anime la caisse
   cachée entre-temps (opacité d'une pièce 0,55 → 0,275, halos, ombres « moba » posées après coup), ce qui donne des photos différentes.
2. `interface/photos-films.js` — les programmes du studio préparés au menu au repos (`photoPrechauffe`, 3 petites étapes, une fois par
   session, compilation douce KHR_parallel_shader_compile, rien n'est dessiné). Coût mesuré : 7 + 6 + 1 ms (garage : jusqu'à 12 + 8 + 1).
   Sans l'extension : rien. `dbgPhotoPre()`.
3. `interface/atelier-ferme.js` — `photoRafale` tient son budget : une photo de plus seulement si elle tient dans ce qui reste.
4. `interface/boutique-scene-2.js` — une image où le panneau a coûté plus de 40 ms laisse la rafale à la suivante (4 fois au plus).
5. Colle : `photoHorsChaine()` dans carPhoto / vitrinePhoto / figFilm / photoRonde / photoRafale, `shopChaineFin()` dans `mGo`, garde dans `buildCar`.

## Preuves (exécutées, `outils/banc-boutiquegel/gel.cjs` + `passe.sh`, sous le verrou, 5 essais chacun, profil neuf à chaque fois)
| | avant (`?sans=boutiquegel`) | après |
|---|---|---|
| Accueil → BOUTIQUE, pire image | 367, 383, 317, 350, 333 ms (médiane 350) | 200, 200, 200, 200, 267 ms (médiane 200) |
| Garage → BOUTIQUE 3D, pire image | 1117, 717, 767, 1167, 800 ms (+ 867 en 2e passe ; médiane 800) | 400, 450, 450, 417, 400 ms (médiane 417) |
| Démarrage (navigation → prêt, ×4) | accueil 4489 / garage 5640 ms (médianes) | 4414 / 5681 ms (même passe ; 2e passe : 4495) |
| Menu au repos, temps occupé sur 6 s | accueil 2137 ms (médiane) | 2259 ms (bruit : 2033-2803 avant) |

- Garage au repos : 3128 à 4561 ms avant, 3122 à 4357 après, deux groupes (~3,2 s et ~4,2 s) des deux côtés : c'est la charge du Mac.
  La préparation des programmes a fini AVANT la fenêtre du repos et n'apparaît pas dans son profil.
- **Image à l'identique** : empreinte (60 px) de chaque photo posée, comparée à un essai « avant ». Accueil : 10 boîtes, écart moyen
  ≤ 0,02/255 (deux essais « avant » entre eux : ≤ 0,01). Garage : 35 photos, ≤ 0,02 (« avant » entre eux : ≤ 0,02). Au bit près, les
  essais « avant » ne sont pas non plus identiques entre eux.
- Le nombre d'images > 100 ms au garage monte (médiane 10 → 16) : le travail est étalé en images plus courtes, il n'a pas disparu.
- Ce qui reste dans la pire image : à l'accueil, UNE construction de caisse (`buildCar`, la Squale ~180 ms) et sa photo ; au garage,
  la rafale (une photo, ~200 ms) avec la queue du panneau (~90 ms). Aller plus bas demanderait de couper `buildCar` en morceaux.

## Non vérifié
- Pas mesuré sur le vrai iPhone (consigne : ne pas toucher au téléphone). Le banc émule un iPhone (×4) dans Chrome, pas WebKit.
- La 2e ouverture et les photos gardées d'une session à l'autre (PHDB, version publiée) n'ont pas été re-mesurées.
- Les « pannes » `pilote` listées par le banc sont présentes avant comme après (sans rapport avec ce lot).
