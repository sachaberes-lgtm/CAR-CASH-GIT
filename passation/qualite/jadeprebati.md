# Lot JADEPREBATI — les freezes de Jade (2026-11-17)

Sacha (build 120, 13 Pro, toute la séance en état thermique CRITICAL, 20 i/s, QL 6) : « c'est pas mal, j'ai eu quelques freezes sur la map jade ».
Branche `qa/jadeprebati` (base `qualite-appareil` 4324e2b91). Interrupteur : `?sans=jadeprebati` (tout comme avant).
Fichiers touchés : maps/jade-alleluia.js, maps/jade-2.js, maps/jade-3.js, moteur/depart-avance.js ; bancs : outils/banc-jade/prebati-bride.cjs (neuf), opt-empreinte.cjs (option `jf=`).
piste-prebati.js et route-sans-haut.js : pas touchés.

## 1. Ce que dit la boîte de vol (vol-1117-1137.json, courses 10:25 et 10:33)

Unité de P (enregistreur-perf.js, bvSec) : `P[2s]` = pré-bâti MOYEN par image ×10, `P[2s+1]` = PIRE tranche de la seconde ×10. Le temps vient de `prebTick` entier
(boucle-6-hud.js) : la liaison des programmes d'en face (prebLie) y est comptée aussi. Les cartes de la course n'ont pas d'horodatage : le moment des portails
se déduit des bouffées de pré-bâti et des rappels PORTV.

Course 10:33 (nuages → jade, 110 s), départ juste après la course 10:25 finie à ~1 400 km/h :
- 0-2,3 s : images de 547, 736, 174, 144, 173, 143 ms. Deux causes ensemble :
  - un PIVOT de l'écran (M[15] = 0 aux secondes 0-1, toile 216 % → 100 %, 4 images d'écran par seconde, plus petit intervalle 770 ms, 674 ms « hors boucle »,
    rappels `retailleRaf` / `camera.aspect`) : ce n'est pas le pré-bâti ;
  - le PRÉ-BÂTI DE LA JADE D'EN FACE qui tourne DÈS LA 1re SECONDE : 45-47 ms par image, 1 355 ms de calcul entre 0 et 9 s.
    La cause est à nous : `PREB.v` (la vitesse lissée qui décide quand la map d'en face commence) n'était jamais remise à zéro. La course héritait des ~390 m/s
    de la fin de la précédente : ×3 (prebAvanceK), 60 s × 390 m/s = 23 km, toute la piste. Le lissage la rattrape en ~15 images ; pendant le pivot il n'y en a eu que 4.
- 4,4 s : 309 ms, la boucle d'avant à 192 ms dont une tranche de pré-bâti de 179 ms (la pire de la course) : à nous.
- 69-80 s (dans la jade) : une grappe de gels 107-312 ms. Pivot à 70 s (M[15]) ; la puce à 28-49 ms par image (R : vrai coût), l'écran à 10-14 images par seconde.
  Ce n'est pas le pré-bâti (P = 0) : c'est le rendu de la jade à chaud + le pivot. Hors de ce lot.
- 80 s : 161 ms, une tranche de 75 ms du pré-bâti de la map d'APRÈS la jade.
- 90, 97, 106 s : 157-196 ms, la boucle d'avant à 135-138 ms, sans pré-bâti : non attribué.

Course 10:25 (départ sur jade, 449 s, 10 maps) :
- 0,3 s : 272 ms (reconstruction du départ) ; 13,1 s : 275 ms = un pivot (M[15]). Le pré-bâti des nuages à 9-12 s : 4,4-4,7 ms par image, pire 23 ms : sain.
- Le pire rappel PORTV (321 ms, 442,8 s) est le DERNIER portail de la course : l'entrée dans la GROTTE (dernière carte), pas la jade. Les deux autres > 80 ms
  (70,4 s : 116 ms ; 118,2 s : 106 ms) sont des portails du début, pas vers la jade. L'entrée dans la 2e jade (~246-249 s) : boucle de 209 ms à 247 s, image de 100 ms
  à 248,6 s (pré-bâti 24 ms) ; son PORTV n'a pas dépassé 80 ms.

En résumé, les gels liés à Jade : (a) le pré-bâti de la jade lancé au départ par la vitesse héritée, avec des tranches d'un ESSAI ENTIER (45 ms) et un pas de 179 ms ;
(b) au banc, les tranches longues du pré-bâti de la jade (essais de route, lointain, arbres, couloir du vol, boucles de la route). Le reste (pivots, rendu à chaud dans la
jade, portail de la grotte) n'est pas le pré-bâti.

## 2. Ce qui est fait

1. **La vitesse d'une partie finie ne sert plus à la suivante** (depart-avance.js, prebDepTick) : hors course, `PREB.v = 0` et `PREB.sT = 0`. La course neuve mesure sa vitesse
   dès sa 1re image ; sans mesure, 60 m/s comme au 1er départ d'une session.
2. **Les essais de route de Jade en tranches fines** (jade-alleluia.js) : `jadeAGenG` = l'essai, en générateur, qui rend la main à l'échéance de la tranche (JF.lim) entre ses étapes
   (chaque scène, les deux lissages de courbure, les normales tous les 64 points, le rééchantillonnage, les tenues 30° et 8°, la distance mini, chaque raccourci tiré, les croisements,
   chaque décor contrôlé). `jadeAGen` = le même mené d'un trait (`jadeAMene` → jadeFini : sur téléphone, repris toutes les 4 ms). JAV_LIA est remis à chaque reprise.
3. **Le couloir du vol en tranches** (`jadeCouloirVolG`) : rend la main entre deux tirs. `JADE.cvMs` compte le temps actif seulement.
4. **jadeBatit** (jade-3.js) : le lointain (`touffe`) et les arbres/cristaux (`enArb` + `famille`) rendent la main à l'échéance.
5. **jadeCle** (jade-2.js) : les 12 nombres d'un point posés dans un Float64Array, leurs 24 mots hachés dans le même ordre (même clé, prouvé ci-dessous).
6. **La route commune** (pisteRoute, depart-avance.js) : ses boucles regardent aussi l'échéance tous les 64 points (`jpbEch`), en plus de leur compte fixe.
7. Crochet `dbgJadeEmpreinte()` (jade-3.js) : l'empreinte de la vallée BÂTIE (familles, quartiers, sommets et index de chaque maillage, clé, nVol).

## 3. Prouvé

- **Empreinte de la route** (opt-empreinte.cjs, 24 graines × p0/p10/p20, drapeau verbes 1 et 0) : identique à la référence (origin/qualite-appareil) en sync, tranches et mémo,
  ET avec `jf=-1` (l'essai rend la main à CHAQUE étape, une autre vallée générée entre deux tranches : 14 811 à 21 079 tranches par palier).
  drapeau 1 : p0 00706b5c… p10 9bd4d6f6… p20 40c4a39e… · drapeau 0 : p0 77bb6d2f… p10 87511d1e… p20 8b358b27… (les mêmes que jadeopt).
- **Empreinte de la vallée bâtie** (dbgJadeEmpreinte, graine 7, au banc) : `f93ad157` (131 611 mots, 45 familles, 80 enfants, clé `7:7879:w9x8ug`, nVol 723) dans les 6 courses,
  avec et sans `?sans=jadeprebati`.
- **verbes-node.cjs 24 graines** : 0 exception, notes 4,56 / 5,26 / 7,41, raccourcis 2/2 (comme avant).
- **Vitesse héritée** : au menu après une course, `dbgPrebati().v` = 79 (sans) → 0 (avec).
- **Plus longue tranche du pré-bâti de la jade d'en face** (banc prebati-bride.cjs : Chrome sans fenêtre, téléphone émulé, profil iPhone14,2, processeur ×10, profileur) :
  - sans : 99, 80, 57 ms (3 courses) — un essai entier, le lointain 54-68 ms, les arbres 59 ms, le couloir 41-45 ms, jadeCle 36-60 ms, des pas de route 41-50 ms ;
  - avec (dernière version) : **44 ms** (jadeCle, appelé d'un bloc par prebJade), puis 27, 27, 26 ms ; les essais 24-27 ms.
  - pas > 20 ms notés par le jeu (PREB.pas, jade seulement) : sans 43, 71, 44, 32 ms · avec 37, 25-30, 57 (une fois), 36, 36 ms.
- 0 exception, 0 erreur console dans les 6 courses de banc. Gardes : garde-demarrage OK, garde-allege ✔, garde-charte OK, node --check du gros script OK.

## 4. NON prouvé

- **Le départ à vitesse héritée n'est pas reproduit au banc** : la course 1 du banc finit à 79 m/s (×1 : pas d'effet). Le calcul (390 m/s → ×3 → 23 km) et la boîte de vol
  le montrent ; la remise à zéro est prouvée (79 → 0). À voir sur le téléphone : plus de pré-bâti dans les premières secondes d'une course qui suit une course rapide.
- Le banc n'est pas « 20 i/s calé » : processeur ×10, 15-25 images par seconde, la puce (swiftshader) n'est pas bridée. Les ms sont celles du Mac ×10, pas du 13 Pro critical.
- Le total de calcul du pré-bâti de la jade ne bouge pas de façon mesurable (bruit ±40 %) : on étale, on ne retire rien.
- La grappe 69-80 s dans la jade (rendu à chaud + pivot) et les gels 90-106 s : pas traités ici.

## 5. Hors des fichiers permis (à faire ailleurs)

- **jadeCle d'un bloc** (44 ms au banc ×10) : `prebJade` (piste-prebati.js) l'appelle hors tranche. Correctif juste : `const cle=yield* jadeCleG(seed)` (une version générateur, même hachage).
- **La liaison des programmes de la jade d'en face** (prebLie → jadeChauffeProgs) part dès la 1re image de course si `JADE_CHP.fait < 4` ; un morceau = un `chauffeRendu` (~45 ms au téléphone critical ?).
  Correctif juste (piste-prebati.js, prebTick) : ne pas lier ni bâtir la map d'en face avant ~6-8 s de course (`now - t0 course`), et plafonner le pré-bâti à 4 ms quand la cadence réelle est ≤ 20 i/s.
- **Le pré-bâti de la ville** (genCtrl → rythmeMeilleur, 61 ms au banc ×10) et de la grotte (genGrotte 52-69 ms, pisteTordPropre 67 ms) : mêmes tranches d'un essai entier, dans
  route-rythme / grottes / route-sans-haut. Au téléphone, la tranche de 75 ms à 80 s (course 10:33) est celle de la map d'après la jade.
- **Le portail vers la jade** : le rappel PORTV (newTrack, installation) reste à 150-240 ms au banc ×10 avec et sans ce lot.

## Commandes

```
node outils/banc-jade/prebati-bride.cjs <racine abs> 8941 9341 <sortie.json> bride=10 avant=2 prof=1 [q=sans=jadeprebati] [profdep=1]   # sous ~/cash-car/verrou-banc.sh
node outils/banc-jade/opt-empreinte.cjs <racine> drapeau=1|0 mode=sync|tranches|memo [jf=-1]
node outils/banc-jade/verbes-node.cjs graines=1-24
```
Lecture : `prebati-bride` écrit `<sortie>.cpuprofile` ; le plus long passage du pré-bâti par fonction se lit en groupant les échantillons sous `prebTravaille`.

## À regarder sur le 13 Pro

- Le départ d'une course juste après une course rapide (≥ 1 000 km/h) : plus de bouffée de pré-bâti dans les 10 premières secondes (boîte de vol : P des secondes 0-10).
- L'approche d'un portail vers la jade : la pire tranche de pré-bâti (P[2s+1]) sous ~25 ms au lieu de 45-179.
- Les pivots en course (secondes 0-2, 70 s) restent des gels de 300-700 ms : à traiter à part (lot retourpivot).
