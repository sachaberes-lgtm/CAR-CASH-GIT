# Lot JADEOPT — Jade « les verbes », l'optimisation iPhone (2026-11-17)

Branche `qa/jadeopt` (base `qualite-appareil` ce3f9e04e). Tout derrière `?sans=jadeopt` (`JADE_OPT`, jade-alleluia.js).
Fichiers : jade-alleluia.js, jade-1.js, jade-2.js, jade-3.js, jade-avatar.js, jade-vol.js, moteur/depart-avance.js. Rien d'autre.
piste-prebati.js et route-sans-haut.js : pas touchés. `JADE.avR` dans jadeEtatVide : pas touché.

## Ce qui est fait

1. **La route en tranches.** `genJadeAG` (jade-alleluia.js) = la boucle des 10 essais, qui rend la main entre deux essais.
   `genJadeG` (jade-1.js) l'enveloppe ; `pisteRoute` la mène par `yield*` (comme canyon, dunes, grotte).
   `genJadeA` reste synchrone (dbgGenRoute, dbgGenBilan, pisteDirecte) : il mène le même générateur d'un trait.
   JAV_LIA est reposé au début de chaque essai et ne sert que dedans : un yield entre deux essais suffit.
   prebAvec rend LVL.cur, engTier, etc. à chaque tranche : les essais voient le même palier.
   **Bonus** : `JADE_AMEMO` retient l'essai gagnant par clé (graine, palier, vitesse, rayon, ROAD_HALF, longueur, drapeau verbes, force).
   REJOUER ne refait qu'un essai. Même route.
   **En plus** (dans jadeAGen, derrière JADE_OPT) : la boucle des repères `ecr` part du premier repère utile (ecr est rangé). Même m au bit près.
2. **Chauffe** : `JAV_MAT.liane` et `JAV_MAT.eau` ajoutés au 3e lot de `jadeChauffeLots` quand JADE_AV.
3. **Sphères vraies** : lianes et eau = `computeBoundingSphere` + frustumCulled. Pierres = une sphère pour toute la famille :
   centre moyen, rayon = plus loin + |amp| + 3 m de houle + rayon réel du gabarit, ×1,1 + 8 m.
4. **jadeAvTick** : vecteurs de travail globaux, matrice de pivot posée une fois (`pm.T`). Pas de remontée si la sphère
   (élargie de 60 m + 15 % de la distance) est hors champ ou à plus de 2,6 km.
5. **jade-3.js** : `if(performance.now()>JF.lim)yield;` avant jadeAvBatit.
6. **Pierres** : `jadeVueGeo` (tampons du gabarit partagés). `userData.vue` : jadeJette ne rend que leur aJ.
7. **Image entière** sur les iPhone profilés de classe ≥ N2 (`PRF.on && PRF.nMax>=2`, le 13 Pro en est) :
   lianes à deux plans tous les 17 m, pierres au niveau 0. L'allègement ne reste qu'hors profil (`jadeAvAllege`).

## Prouvé

- **Empreinte route + décors** (`outils/banc-jade/opt-empreinte.cjs`, 24 graines × p0/p10/p20) : identiques à la référence
  en sync, en tranches (une autre vallée générée entre chaque tranche) et en mémo (72 essais gagnants rejoués), avec et sans drapeau.
  - drapeau 1 : p0 00706b5c… p10 9bd4d6f6… p20 40c4a39e…
  - drapeau 0 : p0 77bb6d2f… p10 87511d1e… p20 8b358b27…
- **verbes-node.cjs 24 graines** : 0 exception (avec et sans drapeau) ; notes 4,56 / 5,26 / 7,41 ; raccourcis 2/2.
- **Plus longue tranche de la génération** (Chrome, processeur ×4, graines 3/5/7 × paliers 0/10/20) :
  d'un trait 181-649 ms → en tranches **24-86 ms** (10 tranches). Total de calcul égal ou un peu moindre.
- **Jeu** (`opt-jeu.cjs`, nuit tel=1 graine 7, et midi ordi graine 3) : 0 exception, 0 __jadeErr, règle d'or 0 heurt (13 506 / 18 006 essais).
  Pierres : 24 arrêts, 0 pierre visible dont la famille serait coupée, 0 hors sphère, marge mini 85,8 m.
  Tick : 3 490 mises à jour, 1 182 images sautées.
  Programmes : liane et eau compilés dès le menu (avant : absents de la chauffe).
- Gardes : garde-demarrage OK, garde-allege ✔, garde-charte OK, node --check du gros script OK.

## NON prouvé

- Les vallées soir (graine 5) et midi tel (graine 11), et le profil `appareil=iPhone14,2` : le verrou du banc
  était tenu par d'autres sessions plus de 2 h. Lot prêt : relancer les runs de `opt-jeu.cjs` (voir Commandes).
- **Coût du point 7** (triangles de plus sur le 13 Pro) : pas mesuré. Estimation : lianes ≈ ×4 (deux fois plus de lianes,
  deux plans) soit ~1 000-1 500 triangles ; pierres au niveau 0 : quelques centaines. 0 appel de plus.
- **Photos avant / après** : prises en course vivante, pas figée. Même vallée, même décor à l'œil,
  mais 1-20 % de pixels diffèrent (position de la caméra, panneaux, argent). Pas une preuve au pixel.

## Commandes

```
node outils/banc-jade/opt-empreinte.cjs <racine> drapeau=1|0 mode=sync|tranches|memo
node outils/banc-jade/opt-jeu.cjs <racine abs> 8931 9331 "pistegraine=7&meteo=nuit&tel=1&appareil=iPhone14,2" <sortie> [photos=1] [page=index-ref.html] [tranches=1]
```
Crochets : `dbgJadeTranches(g,palier,trait)`, `dbgJadeAvVerbes()`, `dbgJadeAvSphere()`.

## À regarder sur le 13 Pro

- Pas d'à-coup au pré-bâti de Jade pendant la map d'avant (avant : 120-600 ms d'un bloc).
- Pas de gel au portail de Jade (lianes, eau déjà compilées).
- Les pierres ne disparaissent pas au bord de l'écran.
- Les lianes à deux plans et les pierres pleines : l'image, et la chaleur.
