# LOT « espaceopt » (2026-11-17) — branche qa/espaceopt : l'orbite des voyages (?espace=voyages) optimisée pour l'iPhone

Demande de Sacha (17/11) : « il y a un nouveau push pour la map espace, regarde tout ce qu'il y a sur main et inclus-le dans ton plan ».
Base : qualite-appareil (781b002ab), qui contient le commit des voyages (d7a4ad6e1, v1614). Seul fichier du jeu touché : `code/maps/orbite-voyages-decor.js`.
Interrupteur : **`?sans=espaceopt`** = tout comme avant.

## La revue iPhone (ce qui coûte, ce qui ne coûte pas)

1. **Le décor (voyDecorPose) se bâtit d'un bloc** dans orbiteBuild, à la fin de buildTrackG, donc dans newTrack : au portail (sous le voile
   `cc:portail` → `chauffe`) ou au départ. Ni tranche du pré-bâti ni travailleur : le pré-bâti de l'orbite ne bâtit que la route
   (prebJob → pisteRoute). Le coût s'ajoute donc au gel du changement de map (≈ 550 ms au banc ×4, voile posé).
2. **La route** : genCtrl (les six essais du directeur de rythme) est SYNCHRONE pour l'orbite (pas de `yield*` : depart-avance.js l. 97).
   Mais le drapeau ne coûte rien de plus (tirage-ms.cjs, Node, 12 graines, deux passes) : sans 48/51/52 ms (paliers 0/10/20), avec 45/50/52 ms.
   Le bloc de ~50 ms (Mac) dans une tranche du pré-bâti existe déjà sans les voyages (fichiers en lecture seule pour ce lot : non touché).
3. **Programmes** : aucun neuf, vérifié en jeu (le compte de linkProgram au banc : 166-167 avec et sans drapeau, **0 lié en course**
   sur les 14 courses). La jante et la roche prennent l'objet matière `GT_EPAVE.material` (même clé), la lune et la nébuleuse des mailles existantes.
   Sous PROG_DOUBLE (TEL_NATIF seulement) : même matière, même géométrie de sommets (position, normal, aCol, aK) → même programme ; lu dans le code, pas mesuré sur l'iPhone.
4. **Les deux mailles vides sans drapeau** : coût par image négligeable (cachées : three ne les dessine pas ; seulement updateMatrixWorld). Retirées quand même.
5. **Par image** : voyTick = deux visibilités + une distance ; il rendait un tableau neuf à chaque image dans une nébuleuse → corrigé.
   geantsTick, voile, feux, hublots : les hublots et feux sont dans la maille (aucun travail par image). voySautRefuse : seulement à l'appui (≤ ~400 asin).
6. **Cadrage / surdessin** : les mailles ont leur sphère englobante (computeBoundingSphere) ; la jante est un seul objet (sphère ~ la roue).
   La nébuleuse : la coque du gaz de la comète + le voile plein écran, le même mécanisme que la comète et la poussière de Mars (inchangé : image).
7. **ALLEGE / PRF** : le décor suit `GT_TEL` (= ALLEGE) comme tous les géants : sur un téléphone de classe haute (PRF.pc) il garde les facettes
   réduites. Le passer à IMG_TEL ajouterait de l'image sur les classes hautes, mais pour être cohérent il faudrait le faire pour TOUS les géants
   (GT_TEL donne aussi un `#define TEL` au shader de la lune : un programme de plus) → **non fait, décision à prendre**.
8. **Libération** : en quittant l'orbite, la géométrie de la jante/roche restait (cachée) en mémoire et au GPU → corrigé (dispose).

## Corrigé (VOY_OPT ; même décor au bit près)

- la jante : « à plus de ~70 m d'une autre portion de route » (3 fois par pas, chaque fois tous les points de la route) → une grille de la route (`voyPres`) ;
- la roche percée : la sphère unité (IcosahedronGeometry ≈ 15 ms sur l'ordi, la moitié de la roche) gardée une fois pour toutes, bâtie au
  chargement sous le drapeau ; le relief calculé une fois par sommet distinct (6× en double) ; « dans le tunnel ? » par une grille des centres ;
- la maille écrite dans des Float32Array (plus de tableaux de nombres ni de tableau par triangle) ;
- `dispose` de la géométrie quand la route change ; voyTick sans allocation ; sans drapeau, les deux mailles ne sont plus créées.

## Prouvé (chiffres)

- **Même décor au bit près** : `dbgVoyage('banc',5)` rebâtit la jante / la roche avant puis après au même hasard : empreinte FNV des sommets
  identique (roue 305f1f9/13 908 sommets ; roche c2254661/12 243). Banc ×4 (Chrome muet 390×844, tel=1) : **roue 24,1 → 5,0 ms (×4,8)**,
  **roche 21,3 → 12,9 ms (×1,65)** (médianes de 5, chaud). À la vraie pose (1er appel, froid) : jante 28-29 → 16 ms, roche 43 → 29 ms.
- **Routes identiques** : empreinte.cjs (graines 1-12, paliers 0/10) base = branche, avec et sans `?espace=voyages` (espace p0 8b6f03f67f99 /
  469dc7f22dc9 avec drapeau). Aucun fichier lu par le banc Node n'a changé ; le décor ne tire pas plus de hasard (empreintes égales).
- `?sans=espaceopt` : 0 erreur, la même empreinte de jante.
- Gardes : garde-demarrage OK, garde-allege ✔, garde-charte OK, assembler --verifier ✔, node --check du gros script ✔.

## Le tableau (390×844, tel=1, processeur ×4, Chrome muet sur le Mac, charge 1,6-2,5, pistegraine=3, pilote immortel, sauts toutes les 4 s,
course entière jusqu'à 500 m du portail ; « décor » = VOY_D.ms à la pose ; construction = newTrack du départ)

| cas | build | décor (ms, pose) | construction au départ (ms) | appels moy/p95 | triangles moy (k) | programmes | VAO après | ms/image moy/p95 | gels >50/100/250 | plus longue tâche en course | fin |
|---|---|---|---|---|---|---|---|---|---|---|---|
| orb | référence | 0 | 564 | 96/140 | 245 | 167 (+0 en course) | 572 | 3.67/9.8 | 0/0/0 | - | bout 8883/9014 |
| orb | après | 0 | 541 | 97/141 | 245 | 167 (+0 en course) | 568 | 3.63/9.6 | 0/0/0 | - | bout 8805/9014 |
| voy (NUAGE) | référence | 1 | 536 | 84/117 | 222 | 166 (+0 en course) | 569 | 3.01/8.3 | 0/0/0 | - | bout 8873/8984 |
| voy (NUAGE) | après | 0 | 539 | 92/128 | 229 | 167 (+0 en course) | 569 | 3.48/9.5 | 0/0/0 | - | bout 8900/8984 |
| station (STATION) | référence | 29 jante 4636 tri | 571 | 88/127 | 243 | 166 (+0 en course) | 569 | 3.16/8.4 | 0/0/0 | - | bout 8546/8994 |
| station (STATION) | après | 16 jante 4636 tri | 560 | 91/136 | 244 | 166 (+0 en course) | 569 | 3.19/8.8 | 0/0/0 | - | bout 8505/8994 |
| lune (LUNE) | référence | 2 | 523 | 88/129 | 245 | 166 (+0 en course) | 572 | 3.23/8.9 | 0/0/0 | - | bout 8418/8916 |
| lune (LUNE) | après | 3 | 549 | 92/133 | 246 | 166 (+0 en course) | 569 | 3.34/8.9 | 0/0/0 | - | bout 8435/8916 |
| ceinture (CEINTURE) | référence | 43 roche 4095 tri | 579 | 91/135 | 248 | 166 (+0 en course) | 569 | 3.17/8.6 | 0/0/0 | - | bout 8539/9035 |
| ceinture (CEINTURE) | après | 29 roche 4095 tri | 569 | 90/134 | 247 | 166 (+0 en course) | 571 | 3.22/9 | 0/0/0 | - | bout 8596/9035 |
| nuage (NUAGE) | référence | 1 | 541 | 85/118 | 227 | 166 (+0 en course) | 569 | 3.18/8.6 | 0/0/0 | - | bout 8516/8984 |
| nuage (NUAGE) | après | 0 | 536 | 87/126 | 226 | 166 (+0 en course) | 568 | 3.21/8.8 | 0/0/0 | - | bout 8525/8984 |
| grand (GRAND) | référence | 28 jante 4732 tri | 572 | 102/141 | 285 | 166 (+0 en course) | 569 | 3.25/9.2 | 0/0/0 | - | bout 8442/8916 |
| grand (GRAND) | après | 16 jante 4732 tri | 551 | 97/136 | 283 | 166 (+0 en course) | 569 | 3.27/9 | 0/0/0 | - | bout 8480/8916 |

Lecture : en course, les voyages ne coûtent rien de visible au banc (ms/image et appels dans le bruit d'une route à l'autre ; triangles +40 k sur le
grand tour, qui a deux géants) ; 0 gel > 50 ms sur les 14 courses ; tout le coût est à la pose, sous le voile. Le Mac ×4 n'est pas l'iPhone chaud.

## NON prouvé
- l'iPhone (pas touché) ; la pose au portail EN COURSE vers l'orbite (mesurée au départ seulement : même fonction newTrack, d'un bloc) ;
- le juge commun (juge-node.cjs) : son `juge-page.js` n'est pas sur ce Mac (chemin du PC) — les entrées du juge n'ont pas changé ;
- PROG_DOUBLE : lu dans le code ; la nébuleuse plein écran sur le GPU du téléphone (inchangée).

## Sur le 13 Pro
Une orbite `?espace=voyages&voyage=ceinture` puis `station` : le gel du portail vers l'espace (boîte noire, construction) ; une course entière sans
image > 50 ms dans la jante, le tunnel et la nébuleuse ; `dbgVoyage().decor.ms` s'il est lisible.
