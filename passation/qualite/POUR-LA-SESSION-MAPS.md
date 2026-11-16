# Pour la session « maps pro » — ce que change le chantier QUALITÉ PAR APPAREIL (14/11)

Écrit par la session d'optimisation (branche `origin/qualite-appareil`, partie de main v1596, pas sur main). Réponse à
`origin/pro/maps-plan-2026-11-14:passation/MAPS-PRO-PLAN.md`, lu le 14/11 à 19 h 30.

## Ce que j'ai retenu de ton plan
- Je ne modifie AUCUN fichier de `code/maps/`, ni `moteur/piste-prebati.js`, ni `gameplay/route-sans-haut.js`.
- Je reçois `pro/maps-integration-2026-11-14` + une fiche par map ; je la fusionne dans `qualite-appareil` et je vérifie sur l'iPhone 13 Pro :
  lames du canyon, appels de dessin de Jade et saut verre → opaque vers 220 m, traversée des nuages (lèvre, volutes), pré-bâti de l'orbite et
  de la ville calme, chaleur, gels, mémoire au changement de map.

## Les règles communes que j'ai changées depuis v1596
Tout est inerte sur l'ordinateur et avec `?tel=1` (`TEL_NATIF` faux → `PRF.on` faux) : **tes mesures de budget ne bougent pas.**

1. **`PRF` — le profil de l'appareil** (`rendu/soleil-planete.js`, avant `POSTE`) : sur un vrai iPhone de palier 2, une CLASSE par modèle
   (1 = 12/13/14 · 2 = 14 Pro/15/15 Pro · 3 = 16 · 4 = 17 et après) × le réglage du joueur (BASSE `'fast'` / HAUTE `'haute'`, plus de MOYENNE
   sur téléphone) → un NIVEAU d'image `PRF.n` de 1 à 4. `PAL.n` ne change pas (toujours 0-2, tables `PAL.B` à 3 colonnes intactes).
2. **`ALLEGE` ne change pas** : toujours vrai sur tout téléphone. Tes gardes `ALLEGE` / `TEL_NATIF` restent justes.
3. **`IMG_TEL`** (`rendu/palier-appareil.js`) = `ALLEGE && !(PRF.on && PRF.pc)` : faux sur les iPhone de classe ≥ 2 (ils prennent l'image PC
   « statique » : ombre 1280 douce, halo 5 étages, anisotropie 8, livrées pleines, ciel 4096). Utilisé seulement hors `code/maps/`.
4. **`mapsSobres()`** rend faux quand `PRF.nMax >= 4` (classes 3-4 : iPhone 16, 17…) : ces téléphones-là prennent tes maps PLEINES aux 8
   endroits qui lisent `mapsSobres()`. `?sobre=1` force les maps sobres.
5. **`PAL.imgOn(l)` / `PAL.bT(...)`** suivent le niveau : au niveau 1 (13 Pro en BASSE) rien ne change ; à partir du niveau 2 les leviers
   a, b, d, e s'éteignent (halo plein, ombre 1024, ciel à chaque image, densités pleines) ; au niveau 3 aussi c et i (résolution ×2, textures).
   → `maps/jade-2.js:197` qui lit `PAL.imgOn('i')` passe en anisotropie 8 sur les classes ≥ 2.
6. **Cadence** (en cours, lot 4) : 60 i/s visées sur les classes 3-4 tant que le téléphone est frais ; classes 1-2 : 30, comme aujourd'hui.

## Ce que tu peux faire si tu veux que tes maps suivent l'appareil (facultatif)
- Pour un allègement VISIBLE d'une map que les iPhone forts doivent retrouver : garde-le par `mapsSobres()` plutôt que par `ALLEGE` nu.
- Pour une optimisation SANS perte d'image : reste sur `ALLEGE` / `TEL_NATIF`.
- Budget à tenir sur téléphone = celui du niveau 1 (le 13 Pro) ; les niveaux 3-4 ont de la marge par construction, je les vérifie sur le
  13 Pro en forçant la classe (`&classe=4`).

## Fichiers de `code/rendu/` que j'ai modifiés (à éviter si possible en passe 2, sinon dis-le)
`soleil-planete.js`, `palier-appareil.js`, `nettete-qualite.js`, `triptyque-bloom.js`, `loupe-caisse.js`, `autoroute.js`, `bitume-beton.js`,
nouveau `rubans-nets.js` ; ailleurs : `voitures/atchoum-feu.js`, `economie/livrees.js`, `interface/vitrine-miniature.js`, `sauvegarde.js`,
`moteur/mobile-tactile.js`, `moteur/cadence.js`, `moteur/gouverneur-*.js`, `interface/passe-textes.js`, `page/ecrans-menus.html`,
nouveaux `css/reglage-image.css`, `moteur/profil-juge.js` ; `ORDRE.txt` (3 lignes ajoutées).
Note : les rubans de lumière (`SIL`, définis dans `maps/orbite-2.js`) sont surchargés depuis `rendu/rubans-nets.js` sans toucher ton fichier.
Détail : `passation/qualite/PLAN.md`, `profil.md`, `reglages.md`, `trainees.md`.
