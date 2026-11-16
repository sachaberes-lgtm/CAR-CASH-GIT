# GPU-BASE — ce que coûte une image ordinaire, map par map (13/11/2026, nuit)

Branche `gpu-base` (worktree `~/cash-car/gpu-base`), partie d'`origin/ios-ultime` (v1538). Rien sur `main`, rien de fusionné dans `ios-ultime`, pas de build iOS.
Banc : `outils/banc-gpu/banc.js` (à coller dans la page) + `outils/banc-gpu/recoit.py` (captures), crochets `dbgGpu`, `dbgGpuChaud` (voir plus bas).

## 0. Ce qu'il faut savoir avant de lire les chiffres

- **Aucun temps de puce fiable.** Charge du Mac entre 5,8 et 28 pendant la session (deux autres sessions à banc), et **le volet du navigateur était caché** tout du long (la session n'était ouverte dans aucune fenêtre) : le jeu se mettait même en pause tout seul. Le chronomètre (`EXT_disjoint_timer_query_webgl2`) dit qu'une image du téléphone coûte **~1 à 2 ms de puce sur le Mac**, avec ±0,7 ms de bruit d'un témoin à l'autre : chaque élément coupé un à un est sous ce bruit. Tout ce qui suit est donc en **comptes** (appels de dessin, triangles, appels WebGL, ko envoyés, surfaces), pas en millisecondes.
- **Ce que ça veut dire pour le téléphone.** Sur le Mac la puce passe l'image en 1-2 ms ; sur l'iPhone 13 Pro chaud, le « vrai coût » mesuré à la barrière est de 13-37 ms. Et le plan du 12/11 a montré que baisser résolution, halo et ombre (crans QL 5 → 10) **ne changeait rien** aux images par seconde. Les pixels ne sont donc probablement pas le goulot. Dans WKWebView, chaque appel WebGL traverse le processus GPU de WebKit (traduit en Metal) : le nombre d'**appels WebGL**, d'**appels de dessin** et d'**octets envoyés** par image est le levier le plus probable. Ce n'est pas prouvé sur le téléphone : c'est la prochaine mesure à faire (voir § 5).
- Résolution pendant les relevés : la règle de qualité a baissé seule la toile à 312×675 (DPR 0,8) sur le Mac chargé, contre 487×1055 (DPR 1,25) au départ. Les comptes de triangles et d'appels n'en dépendent pas ; les surfaces en « écrans » sont relatives à la toile.

## 1. Le tableau par map (version téléphone `?tel=1&palier=2`, course en vol auto, nitro, 2-3 relevés par map)

| Map | Appels de dessin | Triangles | Appels WebGL / image | ko envoyés / image | Passes (écrans) | Transparences (écrans) | Le plus lourd |
|---|---|---|---|---|---|---|---|
| Nuages (midi) | 71-222 | 183 000-831 000 | 850-1 600 | 150-160 (avant lot 2) | 7-10 passes (2,0-2,4) | 2,8-5,2 | coton 42-52 appels / 170 000-263 000 tri ; nuages v8 24 appels / 150 000-176 000 ; rails + nappe 8 tranches = 144 000 |
| Orage | 162-193 | 575 000-596 000 | 1 244-1 423 | 65-78 (après lot 2) | 2-3 | 2,5-2,7 | nuages v8 (un maillage par nuage) 27 appels / 180 000 ; rails + nappe 8 tranches = 144 000 même au-delà de la brume (1 km) |
| Ville (nuit) | 91-134 | 205 000-330 000 | 1 081-1 866 | 145-611 (avant lots 1-2) | 7-8 (2,1-2,3) | 2,6-3,9 | bitume 96 000 ; **gouttes de pluie sur la caisse** : 61-87 points étirés = 290 000-400 000 pixels rastérisés (≈ 1 écran) |
| Espace (nuit) | 77-92 | 238 000-270 000 | 873-1 009 | 14-23 | 2 | 3,0-3,3 | la plus légère ; additifs 0,8-1,1 écran |
| Jade (midi) | 107-114 | 427 000-430 000 | 981-990 | 35-36 | 2,25 | **3,7-7,7** | le verre de jade dessiné 3 fois (corps, absorption, profondeur : 3 × 29 000-55 000 tri) ; transparents instanciés 3,7 écrans |
| Grotte (midi) | 113-161 | 299 000-423 000 | 1 023-1 125 | 15-23 | 2 | 2,7-3,1 | 4 tranches de bitume entières = 192 000 (la route s'enroule : tout est à moins de 400 m) ; roche 20-27 appels |
| Canyon (midi) | 120-197 | 430 000-658 000 | 1 046-1 275 | 20-27 | 2 | 2,7-3,0 | décor instancié 33-40 appels / 61 000-69 000 ; rails + nappe 7-8 tranches = 124 000-144 000 |

Constantes de toutes les maps : la caisse ~25 appels (carrosserie Phong 11, basiques 6, sprites 3-4), l'ombre (« moba ombre ») 4 appels / 6 000 tri, carte d'ombre 768, halo à 68×146-103×222, 151-172 programmes, 0 erreur relevée (`dbgErreurs` filtré).

## 2. Ce qui coûte, du plus cher au moins cher

**Appels WebGL (le travail du processus GPU de WebKit) — 850 à 1 900 par image**
1. **Les VAO des maillages instanciés réécrits à chaque dessin** (three r128) : jusqu'à 366 `vertexAttribPointer` + ~300 `bindBuffer` par image pour UN maillage instancié en ville ; 100-230 appels de trop au canyon. → **corrigé (lot 1)**.
2. Les uniformes par objet : `uniform3f` 200-240, `uniformMatrix4fv` 140-200, `uniform1f` 55-80 par image. Inhérent à three (matrices par objet, lumières Phong) : se réduit seulement en réduisant les appels de dessin.
3. Les appels de dessin eux-mêmes : 70-220. Les plus gros paquets : le coton (24 gabarits × 4 finesses = un appel par couple visible), les nuages v8 de l'orage (un maillage par nuage), le décor du canyon, la route (5 appels par tranche visible : bitume, flancs, rails, nappe, ligne).

**Envois de tampons — 15 à 611 ko par image**
4. **Le feu du nitro (`nfeuPas`)** renvoyait ses deux tampons entiers (1 600 places : 100 ko + 19 ko) à chaque image pour 45 cubes. → **corrigé (lot 2)** : ~150 → 65-78 ko par image.
5. Le coton : jusqu'à ~150 ko de matrices par image dans les nuages (plages déjà posées : c'est le nombre de nuages × gabarits).
6. Le reste (pièces, particules, étincelles) : 1-8 ko chacun, déjà à plage.

**Géométrie (triangles)**
7. La route : bitume 96 000-192 000 (48 000 par tranche entière de 1 200 m, la moitié est la face du dessous, jetée par le GPU mais traitée par le vertex shader), rails 53 000-72 000, nappe 53 000-72 000, flancs 25 000-36 000, ligne 13 000-18 000. Au palier 2, rails et nappe n'ont NI tranche moyenne NI maigre : 8 tranches entières jusqu'au brouillard, et même au-delà (orage). → **allégé à chaud (lot 2)**.
8. Les nuages : coton 170 000-263 000 (finesse 3 = 11 000 tri par nuage, 2× la finesse 2), nuages v8 150 000-180 000. → coton **allégé à chaud (lot 2)** ; nuages v8 : reste (§ 4).
9. Jade : le verre 3 × (29 000-55 000).

**Remplissage (pixels)**
10. Jade : 3,7-7,7 écrans de transparences (verre instancié + additifs).
11. Ville sous la pluie : les gouttes sur la caisse (`gameplay/pluie-caisse.js`, réserve « E260/0.2 », points étirés) rastérisent 290 000-400 000 pixels (≈ 1 écran) pour 60-90 gouttelettes : un trait étiré est rastérisé comme un CARRÉ de côté longueur + épaisseur (`dbgPtAire`), ~95 % des fragments sont rejetés.
12. Nuages : coton 1,1-2,5 écrans de transparences ; nappe néon additive 0,8-1,7 écran et ligne centrale 0,8-1,6 écran partout.
13. Post-traitement : 2 à 10 passes pour 2,0-2,4 écrans en tout (halo à 1/4-1/5 de résolution) ; l'ombre : 1,15-1,48 écran (carte 768²). Petit.

## 3. Les allègements faits

| Lot | Quoi | Où | À qui | Interrupteur | Avant → après | Image |
|---|---|---|---|---|---|---|
| 1 (068ce091e, v1539) | Les VAO des `InstancedMesh` ne sont plus réécrits à chaque appel de dessin : seulement si la matrice / la couleur d'instances (ou leur tampon GL) a changé depuis le dernier passage sur ce VAO | `VERSION PRINCIPALE/vendor/three.min.js` (retouche de `WebGLBindingStates.setup`, inerte sans drapeau) + `self.__ccVao` posé dans `code/rendu/soleil-planete.js` | `ALLEGE` (téléphone, `?tel=1`) ; l'ordinateur : rien ne change | `?sans=vao` ; au banc `self.__ccVao=false` | Ville de nuit : `vertexAttribPointer` 93 → ~0, `bindBuffer` 96 → 39 ; canyon : 1 193-1 275 → 1 046-1 091 appels WebGL par image (−10 à −18 %) | Image figée lue à l'octet : identique au témoin (même grain animé : 3 octets à ±1 dans les deux cas) |
| 2 (1c6a179e1, v1540) | Le feu du nitro n'envoie que ses `n` cubes vivants | `code/voitures/nitro-feu.js` (`NFEU_PLAGE`) | `ALLEGE` | `?sans=plage` | ~119 ko → n×76 octets par image (45 cubes : 3,4 ko) ; envoi total nuages/orage ~150 → 65-78 ko | Inchangée (seuls des octets inutilisés ne partent plus) |
| 2 | À chaud, rails et nappe néon prennent une tranche moyenne (une rangée sur 4) au-delà de 400 m de profondeur | `code/moteur/piste-prebati.js` (`RAIL_CHAUD`, `gpuChaud()`, `E.chaud` dans `pisteLoin`, option `moChaud` de `pisteTranches`) + `code/moteur/depart-avance.js` | `ALLEGE` ET iOS serious/critical (`TEL_NATIF && MOB_S.capteur && MOB_S.thermo>=2`, comme `cyDetPose`) | `?sans=railchaud` ; banc `dbgGpuChaud({rail:false})` | Nuages : 765 000 → 719 000 tri ; canyon : 658 000 → 594 000 tri (−10 %) ; même nombre d'appels | Image figée : 0 octet de différence au canyon ; aux nuages dans le bruit du témoin (le témoin seul varie jusqu'à 36 000 octets, écart max 12/255) — `passation/gpu-base/canyon-midi-chaud.png`, `nuages-midi-chaud.png` (froid · chaud · écart ×16) |
| 2 | À chaud, le coton ne prend plus sa finesse la plus fine (3) | `code/maps/nuages-vitrail.js` (`NU_CHAUD`, dans `cotonTick`) | `ALLEGE` ET serious/critical | `?sans=nuchaud` ; banc `dbgGpuChaud({nu:false})` | Nuages : −12 000 tri sur l'image mesurée (seuls les nuages tout proches prenaient la finesse 3 ; davantage quand on traverse un champ de nuages) | Dans le bruit du témoin |

Vérifié : les 4 gardes (démarrage, charte, allègement, burn-out), `node code/assembler.cjs --verifier`, `node outils/banc-routes/toutes.mjs` : **240 routes, 0 infraction** (les mailles de la route ont changé, pas la génération). Aucune panne relevée dans `dbgErreurs` sur les 7 maps. Rien de mesuré sur le téléphone.

Crochets de banc ajoutés (inertes tant qu'on ne les appelle pas) :
- `dbgGpu({n, k, sans, garde})` (`code/moteur/desktop-banc.js`) : fige la simulation (`BANC_FIGE`), rend la même image n fois (k rendus par chronomètre), rend `{p50, p25, min, appels, tri}` ; avec `sans` (une fonction qui coupe et rend celle qui remet), mesure encadrée témoin / coupé / témoin. Pose `window.__gpuObj` (scene, camera, renderer, composer…).
- `dbgGpuChaud({rail, nu, force})` (`code/moteur/piste-prebati.js`) : allume/éteint les allègements à chaud, `force:true|false` impose l'état chaud, `null` rend la main au capteur.

## 4. Ce qui reste, avec le gain attendu

1. **Mesurer sur le téléphone** (avant tout le reste) : un build avec v1540, 2 courses de 3 min, téléphone chaud ; comparer le « vrai coût » et les i/s de la boîte de vol avec `?sans=vao,plage,railchaud,nuchaud` contre sans. Si les appels WebGL sont bien le goulot, les lots 1-2 doivent se voir surtout au canyon et aux nuages ; sinon, c'est la puce bridée elle-même et il faudra couper plus de géométrie.
2. **Rails et nappe en tranche moyenne pour TOUS les téléphones**, pas seulement à chaud : 0 octet de différence au canyon, dans le bruit aux nuages. Gain : −50 000 à −65 000 triangles par image partout. Il faut d'abord un regard de Sacha sur une course (le trait au loin dans un virage serré).
3. **Les nuages v8 de l'orage et des nuages** (`maps/nuages-vitrail.js`, `nuages boules / nuages v8`) : un maillage par nuage = 15-27 appels et 76 000-180 000 triangles ; ni instanciés, ni tirés au-delà de la brume de l'orage comme le coton (`fF`). Gain attendu : −15 à −25 appels et ~−100 000 tri à l'orage. Visible : non si on ne coupe que ce qui est entièrement dans la brume.
4. **Rails et nappe au-delà de la brume de l'orage** : la nappe est `fog:false` (elle perce la brume exprès), les rails ont la brume. Une tranche de rails entièrement au-delà du brouillard est de la couleur pure du brouillard : elle pourrait ne pas être dessinée (comme le bitume maigre). Gain : ~−30 000 tri à l'orage.
5. **Les gouttes sur la caisse** (`gameplay/pluie-caisse.js`) : ~1 écran de fragments rejetés sous la pluie. Plafonner la longueur des traits étirés au téléphone, ou passer en quads orientés. Gain : ~−300 000 pixels rastérisés par image en ville mouillée. Visible un peu : à réserver au chaud.
6. **Le verre de jade** (3 passes par famille, 3,7-7,7 écrans de transparences) : une version à 2 passes (sans « profondeur ») à chaud. C'est le plus gros remplissage relevé. Gain attendu : −1/3 des triangles du verre et −1 à −2 écrans. Visible : à juger avec Sacha.
7. **La face du dessous de la route** : la moitié des triangles de bitume, rails, nappe et ligne (le dessous n'est vu qu'en passant sous la route). Une tranche dont la caméra est au-dessus partout pourrait cacher son dessous. Gain : jusqu'à −100 000 tri. Délicat (Jade « l'envers », vols sous la route) : à faire avec le banc des captures.
8. **Grotte** : la route s'enroule, 4 tranches entières (192 000 tri) à moins de 400 m. Des tranches plus courtes en grotte (`pisteCh` par map) réduiraient la part entière. Une autre session travaille la grotte creusée : à voir avec elle.
9. Les uniformes (`uniform3f` ~230 / image) : viennent des lumières Phong et des couleurs par matière. Seule une baisse du nombre d'appels de dessin les réduit.

Note : le canyon (`cyFS`, `cyDetPose`), la grotte creusée, le son et l'interface n'ont pas été touchés.
