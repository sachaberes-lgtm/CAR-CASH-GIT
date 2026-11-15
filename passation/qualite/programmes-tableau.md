# Programmes compilés au lancement (2026-11-15T15:06, ?tel=1&classe=1&palier=2&introapres=1, cpu ×1)

- 165 programmes liés (three en garde 165 vivants) ; 1572 matériaux créés ; prêt à 4.8 s, menu à 18.7 s.
- Par phase : {"serpent":161,"film":4} ; sans matériau reconnu : 0.
- Jumeaux : EXACT 3 groupes (3 programmes évitables), INERTES 12 groupes (13 évitables, defines sans effet), DEFINES 22 groupes (82 programmes), SOURCE 13 groupes (36 programmes).

## Simulation du correctif three (lumières/ombres/faces ignorées des matériaux sans lumière)

- éligibles 113, programmes 165 → 156 (9 évités) ; garde-fou (sources différentes réunies) : 0
- 2 réunis : #0 ShaderMaterial maps/nuages-embellie.js:47 MAPS · #66 ShaderMaterial maps/nuages-embellie.js:47 MAPS
- 2 réunis : #1 ShaderMaterial rendu/scene-ciel.js:956 · #100 ShaderMaterial rendu/scene-ciel.js:956
- 2 réunis : #12 MeshBasicMaterial voitures/buildcar.js:399 · #44 MeshBasicMaterial gameplay/impact.js:317
- 2 réunis : #16 MeshBasicMaterial voitures/ailes.js:127 · #24 MeshBasicMaterial maps/orbite-2.js:349 MAPS
- 2 réunis : #45 MeshBasicMaterial son/musique-frenesie.js:555 · #72 MeshBasicMaterial gameplay/ligne-parfaite.js:283
- 2 réunis : #51 MeshBasicMaterial interface/garage-salle.js:9 · #53 MeshBasicMaterial interface/garage-salle.js:9
- 3 réunis : #84 MeshBasicMaterial rendu/triptyque-bloom.js:326 · #153 MeshBasicMaterial voitures/moteurs-originaux.js:29 · #155 MeshBasicMaterial voitures/moteurs-themes.js:19
- 2 réunis : #132 MeshBasicMaterial interface/vignette-moteur.js:93 · #160 MeshBasicMaterial interface/vignette-moteur.js:179

## Par origine (morceau où naît le matériau)

| origine | programmes |
|---|---|
| rendu/triptyque-bloom.js | 20 |
| maps/jade-2.js (INTOUCHABLE) | 11 |
| rendu/scene-ciel.js | 10 |
| maps/canyon-relief.js (INTOUCHABLE) | 8 |
| interface/garage-salle.js | 7 |
| maps/orbite-geants.js (INTOUCHABLE) | 6 |
| gameplay/fruits-auras.js | 6 |
| rendu/autoroute.js | 5 |
| maps/ville-v3.js (INTOUCHABLE) | 5 |
| maps/jade-vol.js (INTOUCHABLE) | 4 |
| voitures/echappements.js | 4 |
| maps/orbite-2.js (INTOUCHABLE) | 4 |
| rendu/tirelire-reserves.js | 4 |
| gameplay/impact.js | 4 |
| voitures/matieres-forme.js | 4 |
| voitures/moteurs-themes.js | 4 |
| voitures/buildcar.js | 3 |
| maps/nuages-casses.js (INTOUCHABLE) | 3 |
| maps/nuages-coton.js (INTOUCHABLE) | 3 |
| interface/vignette-moteur.js | 3 |
| maps/nuages-embellie.js (INTOUCHABLE) | 2 |
| rendu/soleil-planete.js | 2 |
| maps/orbite-1.js (INTOUCHABLE) | 2 |
| voitures/ailes.js | 2 |
| voitures/atchoum-feu.js | 2 |
| voitures/plaque.js | 2 |
| maps/ville-nuit.js (INTOUCHABLE) | 2 |
| moteur/depart-avance.js | 2 |
| maps/nuages-v8.js (INTOUCHABLE) | 2 |
| rendu/portails.js | 2 |
| interface/burn-out-1.js | 2 |
| maps/ville-verre.js (INTOUCHABLE) | 2 |
| economie/final-spin.js | 2 |
| maps/grottes-2.js (INTOUCHABLE) | 2 |
| voitures/moteurs-originaux.js | 2 |
| maps/orbite-saturne.js (INTOUCHABLE) | 1 |
| maps/continuite.js (INTOUCHABLE) | 1 |
| maps/orbite-lune.js (INTOUCHABLE) | 1 |
| maps/orbite-roches.js (INTOUCHABLE) | 1 |
| voitures/shapes-1.js | 1 |
| maps/orbite-soleil.js (INTOUCHABLE) | 1 |
| gameplay/pickups-fruits.js | 1 |
| gameplay/pouvoirs-grisants.js | 1 |
| son/musique-frenesie.js | 1 |
| gameplay/zones-caisses.js | 1 |
| rendu/bitume-beton.js | 1 |
| gameplay/ligne-parfaite.js | 1 |
| voitures/moba-ombre.js | 1 |
| maps/ville-embellie.js (INTOUCHABLE) | 1 |
| maps/canyon-embellie.js (INTOUCHABLE) | 1 |
| rendu/traces-pneus.js | 1 |
| maps/pigeons.js (INTOUCHABLE) | 1 |

## Groupes de jumeaux

### EXACT · 2 programmes · intouchable : 1 maps / 2
- #46 serpent MeshPhongMaterial clé aaa83d8a — gameplay/zones-caisses.js:196 (nuageMat) obc cpk — lien page/debut-corps.html:195
- #69 serpent MeshPhongMaterial clé 87b0e093 — maps/nuages-coton.js:74 MAPS obc cpk — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"clePropre":["nuageCaisse","nuageV2"]}
  - clé three propre à #46 : ["nuageCaisse"]
  - clé three propre à #69 : ["nuageV2"]

### EXACT · 2 programmes · intouchable : non
- #52 serpent MeshPhongMaterial clé d71cb99f — voitures/echappements.js:346 (lpMat) obc — lien page/debut-corps.html:195
- #55 serpent MeshPhongMaterial clé 9cd54bd6 — voitures/echappements.js:346 (lpMat) obc — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"vertexAlphas":["false",""]}

### EXACT · 2 programmes · intouchable : non
- #84 serpent MeshBasicMaterial clé 5f04fdcd — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195
- #155 serpent MeshBasicMaterial clé 49dc9c68 — voitures/moteurs-themes.js:19 (h5_coccinelle) — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"numDirLights":["0","4"],"numHemiLights":["0","1"]}
  - clé three propre à #155 : ["4"]

### INERTES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #0 serpent ShaderMaterial clé 721814fe — maps/nuages-embellie.js:47 (mk) MAPS — lien page/debut-corps.html:195
- #66 serpent ShaderMaterial clé afdaa7a0 — maps/nuages-embellie.js:47 (mk) MAPS — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
  - clé three propre à #66 : ["3","8"]

### INERTES · 2 programmes · intouchable : non · defines qui diffèrent : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #1 serpent ShaderMaterial clé e1de50c4 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #100 serpent ShaderMaterial clé baef910e — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
  - clé three propre à #1 : ["3","8"]

### INERTES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #12 serpent MeshBasicMaterial clé 75cba2ba — voitures/buildcar.js:399 (mkPoolPlane) — lien page/debut-corps.html:195
- #44 serpent MeshBasicMaterial clé 88a13c49 — gameplay/impact.js:317 — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"doubleSided":["false","true"]}

### INERTES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #45 serpent MeshBasicMaterial clé 67724eac — son/musique-frenesie.js:555 — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #72 serpent MeshBasicMaterial clé fbd306a9 — gameplay/ligne-parfaite.js:283 — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"doubleSided":["true","false"]}

### INERTES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #132 serpent MeshBasicMaterial clé 079a6b83 — interface/vignette-moteur.js:93 — lien page/debut-corps.html:195
- #160 serpent MeshBasicMaterial clé 98e3a3cf — interface/vignette-moteur.js:179 — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"numDirLights":["0","4"],"numHemiLights":["0","1"],"doubleSided":["false","true"]}
  - clé three propre à #160 : ["4"]

### INERTES · 2 programmes · intouchable : 1 maps / 2 · defines qui diffèrent : #define DOUBLE_SIDED
- #16 serpent MeshBasicMaterial clé c9445b0b — voitures/ailes.js:127 (Object.panneaux) — lien page/debut-corps.html:195
- #24 serpent MeshBasicMaterial clé a5b4b070 — maps/orbite-2.js:349 MAPS — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"doubleSided":["false","true"]}

### INERTES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #17 serpent MeshBasicMaterial clé 98276055 — voitures/ailes.js:137 (Object.panneaux) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #38 serpent LineBasicMaterial clé 0b85b27d — rendu/tirelire-reserves.js:204 — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"combine":["0",""],"skinning":["false",""],"doubleSided":["true","false"]}

### INERTES · 2 programmes · intouchable : tous maps
- #26 serpent MeshBasicMaterial clé ceaeb4d7 — maps/orbite-2.js:484 MAPS — lien page/debut-corps.html:195
- #27 serpent MeshBasicMaterial clé 7d63ba94 — maps/orbite-2.js:485 MAPS — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"vertexColors":["true","false"]}

### INERTES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #51 serpent MeshBasicMaterial clé 6b69c68d — interface/garage-salle.js:9 (BA) — lien page/debut-corps.html:195
- #53 serpent MeshBasicMaterial clé 5539ce42 — interface/garage-salle.js:9 (BA) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"doubleSided":["false","true"]}

### INERTES · 3 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #84 serpent MeshBasicMaterial clé 5f04fdcd — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195
- #153 serpent MeshBasicMaterial clé 1d3f30bb — voitures/moteurs-originaux.js:29 (kit10) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #155 serpent MeshBasicMaterial clé 49dc9c68 — voitures/moteurs-themes.js:19 (h5_coccinelle) — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"numDirLights":["0","4","4"],"numHemiLights":["0","1","1"],"doubleSided":["false","true","false"]}
  - clé three propre à #153 : ["4"]
  - clé three propre à #155 : ["4"]

### INERTES · 2 programmes · intouchable : 1 maps / 2
- #46 serpent MeshPhongMaterial clé aaa83d8a — gameplay/zones-caisses.js:196 (nuageMat) obc cpk — lien page/debut-corps.html:195
- #69 serpent MeshPhongMaterial clé 87b0e093 — maps/nuages-coton.js:74 MAPS obc cpk — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"clePropre":["nuageCaisse","nuageV2"]}
  - clé three propre à #46 : ["nuageCaisse"]
  - clé three propre à #69 : ["nuageV2"]

### INERTES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define DOUBLE_SIDED
- #119 serpent ShaderMaterial clé be61c50f — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195
- #120 serpent ShaderMaterial clé 5ac7f1ff — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #0 serpent ShaderMaterial clé 721814fe — maps/nuages-embellie.js:47 (mk) MAPS — lien page/debut-corps.html:195
- #66 serpent ShaderMaterial clé afdaa7a0 — maps/nuages-embellie.js:47 (mk) MAPS — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #1 serpent ShaderMaterial clé e1de50c4 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #100 serpent ShaderMaterial clé baef910e — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195

### DEFINES · 9 programmes · intouchable : 1 maps / 9 · defines qui diffèrent : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define PREMULTIPLIED_ALPHA ; #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_INSTANCING
- #5 serpent MeshBasicMaterial clé 49ffe88c — rendu/triptyque-bloom.js:478 — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define PREMULTIPLIED_ALPHA
- #12 serpent MeshBasicMaterial clé 75cba2ba — voitures/buildcar.js:399 (mkPoolPlane) — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #21 serpent MeshBasicMaterial clé d0b3b6df — voitures/plaque.js:171 (plqMats) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #25 serpent MeshBasicMaterial clé 12ec77aa — maps/orbite-2.js:451 (mkSillage) MAPS — lien page/debut-corps.html:195 — propres : #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #44 serpent MeshBasicMaterial clé 88a13c49 — gameplay/impact.js:317 — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #45 serpent MeshBasicMaterial clé 67724eac — son/musique-frenesie.js:555 — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #72 serpent MeshBasicMaterial clé fbd306a9 — gameplay/ligne-parfaite.js:283 — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #132 serpent MeshBasicMaterial clé 079a6b83 — interface/vignette-moteur.js:93 — lien page/debut-corps.html:195
- #160 serpent MeshBasicMaterial clé 98e3a3cf — interface/vignette-moteur.js:179 — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define EMPILE
- #8 serpent ShaderMaterial clé e86d460f — maps/orbite-1.js:170 MAPS — lien page/debut-corps.html:195
- #9 serpent ShaderMaterial clé 7460a7b9 — maps/orbite-1.js:236 MAPS — lien page/debut-corps.html:195 — propres : #define EMPILE

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define USE_COLOR
- #13 serpent MeshPhongMaterial clé 26a296f1 — voitures/buildcar.js:104 (buildCar) obc — lien page/debut-corps.html:195
- #22 serpent MeshPhongMaterial clé b14ab599 — voitures/shapes-1.js:8 (epave) obc — lien page/debut-corps.html:195 — propres : #define USE_COLOR

### DEFINES · 14 programmes · intouchable : 5 maps / 14 · defines qui diffèrent : #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_ALPHAMAP ; #define USE_UV
- #16 serpent MeshBasicMaterial clé c9445b0b — voitures/ailes.js:127 (Object.panneaux) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #17 serpent MeshBasicMaterial clé 98276055 — voitures/ailes.js:137 (Object.panneaux) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #24 serpent MeshBasicMaterial clé a5b4b070 — maps/orbite-2.js:349 MAPS — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #26 serpent MeshBasicMaterial clé ceaeb4d7 — maps/orbite-2.js:484 MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #27 serpent MeshBasicMaterial clé 7d63ba94 — maps/orbite-2.js:485 MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define USE_COLOR
- #38 serpent LineBasicMaterial clé 0b85b27d — rendu/tirelire-reserves.js:204 — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #51 serpent MeshBasicMaterial clé 6b69c68d — interface/garage-salle.js:9 (BA) — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #53 serpent MeshBasicMaterial clé 5539ce42 — interface/garage-salle.js:9 (BA) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #84 serpent MeshBasicMaterial clé 5f04fdcd — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195
- #113 serpent MeshBasicMaterial clé 6ba65e03 — maps/ville-v3.js:314 (villeMatNeonLoin) MAPS cpk — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #124 serpent MeshBasicMaterial clé cb5658a9 — maps/canyon-relief.js:417 (cyT2Mats) MAPS — lien page/debut-corps.html:195 — propres : #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #130 serpent MeshBasicMaterial clé 3e667b1b — rendu/traces-pneus.js:28 (traceInit) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_ALPHAMAP ; #define USE_UV ; #define DOUBLE_SIDED ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #153 serpent MeshBasicMaterial clé 1d3f30bb — voitures/moteurs-originaux.js:29 (kit10) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #155 serpent MeshBasicMaterial clé 49dc9c68 — voitures/moteurs-themes.js:19 (h5_coccinelle) — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define USE_FOG
- #19 serpent SpriteMaterial clé b29e0268 — voitures/atchoum-feu.js:462 — lien page/debut-corps.html:195 — propres : #define USE_FOG
- #41 serpent SpriteMaterial clé 2a1d2fd5 — gameplay/impact.js:82 — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define FLAT_SHADED
- #20 serpent MeshPhongMaterial clé b0d91b37 — voitures/plaque.js:172 (plqMats) — lien page/debut-corps.html:195
- #43 serpent MeshPhongMaterial clé 28964b4a — gameplay/impact.js:117 — lien page/debut-corps.html:195 — propres : #define FLAT_SHADED

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define ENVMAP_BLENDING_MIX ; #define FLAT_SHADED ; #define ENVMAP_BLENDING_MULTIPLY
- #23 serpent MeshPhongMaterial clé 8db273cd — voitures/buildcar.js:105 (buildCar) — lien page/debut-corps.html:195 — propres : #define ENVMAP_BLENDING_MIX
- #116 serpent MeshPhongMaterial clé 00c8451f — economie/final-spin.js:187 — lien page/debut-corps.html:195 — propres : #define FLAT_SHADED ; #define ENVMAP_BLENDING_MULTIPLY

### DEFINES · 4 programmes · intouchable : 3 maps / 4 · defines qui diffèrent : #define USE_COLOR ; #define DOUBLE_SIDED ; #define NUAGE_DEDANS
- #46 serpent MeshPhongMaterial clé aaa83d8a — gameplay/zones-caisses.js:196 (nuageMat) obc cpk — lien page/debut-corps.html:195 — propres : #define USE_COLOR
- #69 serpent MeshPhongMaterial clé 87b0e093 — maps/nuages-coton.js:74 MAPS obc cpk — lien page/debut-corps.html:195 — propres : #define USE_COLOR
- #156 serpent MeshPhongMaterial clé 2aac8bae — maps/nuages-coton.js:81 MAPS obc cpk — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #157 serpent MeshPhongMaterial clé ee04475a — maps/nuages-coton.js:78 MAPS obc cpk — lien page/debut-corps.html:195 — propres : #define NUAGE_DEDANS ; #define USE_COLOR ; #define DOUBLE_SIDED

### DEFINES · 4 programmes · intouchable : 3 maps / 4 · defines qui diffèrent : #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_INSTANCING
- #49 serpent MeshLambertMaterial clé 1219a303 — interface/garage-salle.js:8 (L) — lien page/debut-corps.html:195
- #131 serpent MeshLambertMaterial clé 282730b7 — maps/pigeons.js:7 MAPS — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED
- #146 serpent MeshLambertMaterial clé 36cf16c5 — maps/jade-vol.js:236 (grueGeos) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED
- #147 serpent MeshLambertMaterial clé c446dd14 — maps/jade-vol.js:333 (jadeChauffeProgs) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define NUAGE8_INST ; #define USE_INSTANCING ; #define USE_INSTANCING_COLOR
- #65 serpent ShaderMaterial clé 6c8de6f8 — maps/nuages-v8.js:440 (nuage8Mat) MAPS cpk — lien page/debut-corps.html:195 — propres : #define NUAGE8_INST ; #define USE_INSTANCING ; #define USE_INSTANCING_COLOR
- #68 serpent ShaderMaterial clé f64887ea — maps/nuages-v8.js:506 (nuage8Solo) MAPS cpk — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_COLOR
- #67 serpent ShaderMaterial clé 6ae5e144 — maps/nuages-casses.js:126 (nuSkinMat) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_COLOR
- #161 film ShaderMaterial clé 3d49fb5a — maps/nuages-casses.js:126 (nuSkinMat) MAPS — lien interface/vignette-moteur.js:315 compileDoux

### DEFINES · 5 programmes · intouchable : non · defines qui diffèrent : #define KERNEL_RADIUS 3 ; #define SIGMA 3 ; #define KERNEL_RADIUS 5 ; #define SIGMA 5 ; #define KERNEL_RADIUS 7 ; #define SIGMA 7 ; #define KERNEL_RADIUS 9 ; #define SIGMA 9 ; #define KERNEL_RADIUS 11 ; #define SIGMA 11
- #77 serpent ShaderMaterial clé 35b3a332 — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 3 ; #define SIGMA 3
- #78 serpent ShaderMaterial clé 573fc2a7 — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 5 ; #define SIGMA 5
- #79 serpent ShaderMaterial clé a7dc295d — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 7 ; #define SIGMA 7
- #80 serpent ShaderMaterial clé c666fcf6 — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 9 ; #define SIGMA 9
- #81 serpent ShaderMaterial clé 8edcd79f — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 11 ; #define SIGMA 11

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define KR 9 ; #define KR 11
- #87 serpent ShaderMaterial clé 9fe722c2 — rendu/triptyque-bloom.js:429 (bloomPlieMat) — lien page/debut-corps.html:195 — propres : #define KR 9
- #88 serpent ShaderMaterial clé d35cb076 — rendu/triptyque-bloom.js:429 (bloomPlieMat) — lien page/debut-corps.html:195 — propres : #define KR 11

### DEFINES · 5 programmes · intouchable : non · defines qui diffèrent : #define KERNEL_RADIUS 3 ; #define SIGMA 3 ; #define KERNEL_RADIUS 5 ; #define SIGMA 5 ; #define KERNEL_RADIUS 7 ; #define SIGMA 7 ; #define KERNEL_RADIUS 9 ; #define SIGMA 9 ; #define KERNEL_RADIUS 11 ; #define SIGMA 11
- #89 serpent ShaderMaterial clé 310c3112 — rendu/triptyque-bloom.js:438 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 3 ; #define SIGMA 3
- #90 serpent ShaderMaterial clé ca2e4226 — rendu/triptyque-bloom.js:438 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 5 ; #define SIGMA 5
- #91 serpent ShaderMaterial clé 56eddc48 — rendu/triptyque-bloom.js:438 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 7 ; #define SIGMA 7
- #92 serpent ShaderMaterial clé 2acfbaa0 — rendu/triptyque-bloom.js:438 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 9 ; #define SIGMA 9
- #93 serpent ShaderMaterial clé 7479d479 — rendu/triptyque-bloom.js:438 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 11 ; #define SIGMA 11

### DEFINES · 3 programmes · intouchable : tous maps · defines qui diffèrent : #define DOUBLE_SIDED ; #define USE_INSTANCING
- #119 serpent ShaderMaterial clé be61c50f — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195
- #120 serpent ShaderMaterial clé 5ac7f1ff — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #125 serpent ShaderMaterial clé efd14a33 — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING ; #define DOUBLE_SIDED
- #122 serpent ShaderMaterial clé b93dad24 — maps/canyon-relief.js:296 (mt) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING
- #123 serpent ShaderMaterial clé 2d9915d0 — maps/canyon-relief.js:296 (mt) MAPS — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 8 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING ; #define PASSE_M ; #define DOUBLE_SIDED ; #define PREPASS ; #define OPAQUE
- #134 serpent ShaderMaterial clé f8961a64 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING
- #135 serpent ShaderMaterial clé e02556cf — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PASSE_M ; #define USE_INSTANCING ; #define DOUBLE_SIDED
- #136 serpent ShaderMaterial clé f32c9a22 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PREPASS ; #define USE_INSTANCING
- #137 serpent ShaderMaterial clé 536afaa2 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define OPAQUE ; #define USE_INSTANCING
- #139 serpent ShaderMaterial clé 04fcad2c — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195
- #140 serpent ShaderMaterial clé 65fdd3ac — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PASSE_M ; #define DOUBLE_SIDED
- #141 serpent ShaderMaterial clé 0ec22264 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PREPASS
- #142 serpent ShaderMaterial clé fa13b3ef — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define OPAQUE

### DEFINES · 3 programmes · intouchable : non · defines qui diffèrent : #define USE_SPECULARMAP ; #define DOUBLE_SIDED
- #148 serpent MeshPhongMaterial clé b78819f6 — voitures/matieres-forme.js:185 (Object.fonte) — lien page/debut-corps.html:195 — propres : #define USE_SPECULARMAP
- #150 serpent MeshPhongMaterial clé 1a20696b — voitures/matieres-forme.js:488 (Object.sable) — lien page/debut-corps.html:195 — propres : #define USE_SPECULARMAP ; #define DOUBLE_SIDED
- #152 serpent MeshPhongMaterial clé bda6cdd5 — voitures/matieres-forme.js:492 (Object.soudure) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 3 programmes · intouchable : non · defines qui diffèrent : #define FLAT_SHADED ; #define DOUBLE_SIDED
- #149 serpent MeshPhongMaterial clé 56fa9f07 — voitures/moteurs-themes.js:53 (mat) — lien page/debut-corps.html:195 — propres : #define FLAT_SHADED ; #define DOUBLE_SIDED
- #154 serpent MeshPhongMaterial clé 3b3afe78 — voitures/moteurs-themes.js:19 (h5_coccinelle) — lien page/debut-corps.html:195
- #158 serpent MeshPhongMaterial clé 654c1311 — voitures/moteurs-themes.js:748 (theme30) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #151 serpent MeshPhongMaterial clé 83faac70 — voitures/moteurs-originaux.js:16 (poli) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #159 serpent MeshPhongMaterial clé 45ac2dc0 — voitures/matieres-forme.js:197 (Object.cristal) — lien page/debut-corps.html:195

### SOURCE · 2 programmes · intouchable : non
- #76 serpent ShaderMaterial clé 16c6d4c1 — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195
- #83 serpent ShaderMaterial clé 8e75755a — rendu/triptyque-bloom.js:326 — lien page/debut-corps.html:195
  - écart #76/#83 : 11 lignes ; +#76 ["uniform vec3 defaultColor;","uniform float defaultOpacity;","uniform float luminosityThreshold;","uniform float smoothWidth;","vec3 luma = vec3( 0.299, 0.587, 0.114 );","float v = dot( texel.xyz, luma );"] ; +#83 ["uniform float opacity;","gl_FragColor = opacity * texel;"]

### SOURCE · 6 programmes · intouchable : 2 maps / 6
- #18 serpent ShaderMaterial clé ea1c2241 — voitures/atchoum-feu.js:457 (jetMat) — lien page/debut-corps.html:195
- #70 serpent ShaderMaterial clé 7b7803ea — rendu/portails.js:83 (pcubeInit) — lien page/debut-corps.html:195
- #75 serpent ShaderMaterial clé fbb383e8 — gameplay/fruits-auras.js:569 (fzMat) — lien page/debut-corps.html:195
- #115 serpent ShaderMaterial clé 19b00ef8 — maps/ville-embellie.js:32 (villeRaisMat) MAPS cpk — lien page/debut-corps.html:195
- #144 serpent ShaderMaterial clé 978c76d5 — maps/jade-vol.js:87 MAPS — lien page/debut-corps.html:195
- #163 film ShaderMaterial clé d73515d3 — gameplay/fruits-auras.js:336 (zapBuild) — lien interface/vignette-moteur.js:315 compileDoux
  - écart #18/#70 : 4 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#70 ["varying vec3 vW;varying vec2 vL;void main(){vL=position.xy;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMa","uniform sampler2D uTex;uniform float uT,uHas,uTan,uR,uInvOn,uSat,uDv;uniform vec3 uC1,uC2,uG,uWE,uSh,uHi,uC;uniform vec2 uKC;uniform mat3 uI"]
  - écart #18/#75 : 11 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#75 ["uniform float uT,uG,uPx;attribute vec3 aSeg;varying float vA;varying float vK;","float h(float x){return fract(sin(x*127.1)*43758.5453);}","vec3 pt(float bolt,float stp,float k){float th0=h(bolt*5.1+stp*.37)*6.2832+uT*.9;float th=th0+k*.34;","float zz=(h(k*7.7+bolt*3.3+stp*1.9)-.5);float rr=4.4+zz*1.3+max(0.,k-4.)*1.6;float yy=.7+1.1*k*h(bolt+2.)+(h(k*3.1+bolt*9.+stp)-.5)*1.6;","if(k>4.5)yy+=1.6;return vec3(cos(th)*rr,uG+yy,sin(th)*rr);}","void main(){float bolt=aSeg.x,k=aSeg.y,side=aSeg.z;float stp=floor(uT*13.+bolt*3.7);float on=step(.3,h(bolt*17.1+stp*1.3));"]
  - écart #18/#115 : 4 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#115 ["attribute vec4 aB;attribute vec4 aP;uniform float uT;varying vec3 vR,vD,vW;varying float vT,vK;void main(){float az=aP.y+uT*aP.z,tl=aP.x+.05","uniform vec3 uCa,uCb,uCg;uniform float uK;varying vec3 vR,vD,vW;varying float vT,vK;void main(){vec3 V=cameraPosition-vW;float dist=length(V"]
  - écart #18/#144 : 10 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#144 ["attribute vec3 aC;attribute vec4 aW;uniform vec3 uAx;varying vec2 vP;varying vec4 vWw;varying float vF;","void main(){vec3 tc=normalize(cameraPosition-aC),W=normalize(cross(uAx,tc)+vec3(1e-4,0.,0.));","vec3 wp=aC+uAx*position.y*aW.y+W*position.x*aW.x*(1.+.6*(position.y+.5));vP=position.xy;vWw=aW;","float d=length(cameraPosition-wp);vF=smoothstep(2600.,900.,d)*smoothstep(40.,220.,d);","gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}","uniform float uTime;uniform vec3 uCol;varying vec2 vP;varying vec4 vWw;varying float vF;"]
  - écart #18/#163 : 4 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#163 ["void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}","uniform float uA;void main(){gl_FragColor=vec4(.55,.95,1.,uA);}"]
  - écart #70/#75 : 11 lignes ; +#70 ["varying vec3 vW;varying vec2 vL;void main(){vL=position.xy;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMa","uniform sampler2D uTex;uniform float uT,uHas,uTan,uR,uInvOn,uSat,uDv;uniform vec3 uC1,uC2,uG,uWE,uSh,uHi,uC;uniform vec2 uKC;uniform mat3 uI"] ; +#75 ["uniform float uT,uG,uPx;attribute vec3 aSeg;varying float vA;varying float vK;","float h(float x){return fract(sin(x*127.1)*43758.5453);}","vec3 pt(float bolt,float stp,float k){float th0=h(bolt*5.1+stp*.37)*6.2832+uT*.9;float th=th0+k*.34;","float zz=(h(k*7.7+bolt*3.3+stp*1.9)-.5);float rr=4.4+zz*1.3+max(0.,k-4.)*1.6;float yy=.7+1.1*k*h(bolt+2.)+(h(k*3.1+bolt*9.+stp)-.5)*1.6;","if(k>4.5)yy+=1.6;return vec3(cos(th)*rr,uG+yy,sin(th)*rr);}","void main(){float bolt=aSeg.x,k=aSeg.y,side=aSeg.z;float stp=floor(uT*13.+bolt*3.7);float on=step(.3,h(bolt*17.1+stp*1.3));"]

### SOURCE · 4 programmes · intouchable : 2 maps / 4
- #34 serpent ShaderMaterial clé 3d702109 — maps/orbite-geants.js:157 MAPS — lien page/debut-corps.html:195
- #104 serpent ShaderMaterial clé f3950ee8 — interface/burn-out-1.js:71 (burnPool) — lien page/debut-corps.html:195
- #105 serpent ShaderMaterial clé ba25e21a — interface/burn-out-1.js:71 (burnPool) — lien page/debut-corps.html:195
- #128 serpent ShaderMaterial clé d6611b67 — maps/grottes-2.js:320 (grtMats) MAPS — lien page/debut-corps.html:195
  - écart #34/#105 : 10 lignes ; +#34 ["varying vec2 vU;void main(){vU=position.xy;gl_Position=vec4(position.xy,0.,1.);}","uniform vec3 uCol,uCol2;uniform float uK,uBord,uT;varying vec2 vU;","void main(){float r=length(vU*vec2(1.,.8)),e=smoothstep(.45,1.3,r);","float fl=.8+.2*sin(uT*9.+atan(vU.y,vU.x)*6.)*sin(uT*5.3+r*7.);","gl_FragColor=vec4(uCol*uK*(.7+.3*e)+uCol2*uBord*e*e*fl,1.);}"] ; +#105 ["attribute vec3 iP;attribute float iA;attribute float iS;attribute float iG;attribute float iSd;attribute vec3 iC;","varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;","varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;","void main(){vec4 mv=modelViewMatrix*vec4(iP,1.);mv.xy+=position.xy*iS;gl_Position=projectionMatrix*mv;vUv=uv;vA=iA;vG=iG;vSd=iSd;vC=iC;vY=iP","void main(){if(vA<.003)discard;vec2 c=floor(vUv*3.);float e=(c.x==1.&&c.y==1.)?1.:.5;gl_FragColor=vec4(vC*e,vA*e);}"]
  - écart #34/#128 : 10 lignes ; +#34 ["varying vec2 vU;void main(){vU=position.xy;gl_Position=vec4(position.xy,0.,1.);}","uniform vec3 uCol,uCol2;uniform float uK,uBord,uT;varying vec2 vU;","void main(){float r=length(vU*vec2(1.,.8)),e=smoothstep(.45,1.3,r);","float fl=.8+.2*sin(uT*9.+atan(vU.y,vU.x)*6.)*sin(uT*5.3+r*7.);","gl_FragColor=vec4(uCol*uK*(.7+.3*e)+uCol2*uBord*e*e*fl,1.);}"] ; +#128 ["attribute vec4 aR;uniform float uTime,uPx,uK,uSz,uSw;uniform vec3 uBoxC,uVel,uPC;varying vec3 vC;varying float vA;","void main(){vec3 p=aR.xyz*180.+uVel*uTime*(.55+.9*aR.w)+vec3(sin(uTime*.7+aR.w*20.),.5*sin(uTime*.5+aR.w*13.),cos(uTime*.6+aR.w*7.))*uSw;","p=mod(p-uBoxC+90.,180.)-90.+uBoxC;vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float dd=-mv.z;","gl_PointSize=clamp(uSz*uPx*(420./max(dd,2.))*(.55+.9*aR.w),1.,9.*uPx);vA=uK*smoothstep(150.,45.,dd)*smoothstep(5.,16.,dd)*(.55+.45*sin(uTime","varying vec3 vC;varying float vA;void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5));if(a*vA<.004)discard;gl_FragColor=vec4(vC*v"]
  - écart #104/#105 : 12 lignes ; +#104 ["uniform float uY0;uniform vec3 uBleu;uniform float uPx;","float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+vSd*91.7)*43758.5453);}","void main(){if(vA<.003)discard;","vec2 fc=(floor(gl_FragCoord.xy/uPx)+.5)*uPx-gl_FragCoord.xy;vec2 u=vUv+dFdx(vUv)*fc.x+dFdy(vUv)*fc.y;","const float G=6.;vec2 c=floor(u*G);float d=length(u-.5)*2.;float r=h(c);","if(d>.7+.3*r)discard;"] ; +#105 ["void main(){if(vA<.003)discard;vec2 c=floor(vUv*3.);float e=(c.x==1.&&c.y==1.)?1.:.5;gl_FragColor=vec4(vC*e,vA*e);}"]
  - écart #105/#128 : 10 lignes ; +#105 ["attribute vec3 iP;attribute float iA;attribute float iS;attribute float iG;attribute float iSd;attribute vec3 iC;","varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;","varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;","void main(){vec4 mv=modelViewMatrix*vec4(iP,1.);mv.xy+=position.xy*iS;gl_Position=projectionMatrix*mv;vUv=uv;vA=iA;vG=iG;vSd=iSd;vC=iC;vY=iP","void main(){if(vA<.003)discard;vec2 c=floor(vUv*3.);float e=(c.x==1.&&c.y==1.)?1.:.5;gl_FragColor=vec4(vC*e,vA*e);}"] ; +#128 ["attribute vec4 aR;uniform float uTime,uPx,uK,uSz,uSw;uniform vec3 uBoxC,uVel,uPC;varying vec3 vC;varying float vA;","void main(){vec3 p=aR.xyz*180.+uVel*uTime*(.55+.9*aR.w)+vec3(sin(uTime*.7+aR.w*20.),.5*sin(uTime*.5+aR.w*13.),cos(uTime*.6+aR.w*7.))*uSw;","p=mod(p-uBoxC+90.,180.)-90.+uBoxC;vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float dd=-mv.z;","gl_PointSize=clamp(uSz*uPx*(420./max(dd,2.))*(.55+.9*aR.w),1.,9.*uPx);vA=uK*smoothstep(150.,45.,dd)*smoothstep(5.,16.,dd)*(.55+.45*sin(uTime","varying vec3 vC;varying float vA;void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5));if(a*vA<.004)discard;gl_FragColor=vec4(vC*v"]

### SOURCE · 2 programmes · intouchable : non
- #36 serpent ShaderMaterial clé 2e26e866 — gameplay/pouvoirs-grisants.js:335 — lien page/debut-corps.html:195
- #71 serpent ShaderMaterial clé 5f689804 — rendu/portails.js:50 (pcubeInit) — lien page/debut-corps.html:195
  - écart #36/#71 : 4 lignes ; +#36 ["attribute float aA;varying vec2 vU;varying float vA;void main(){vU=uv;vA=aA;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4","uniform sampler2D uT;varying vec2 vU;varying float vA;void main(){vec4 c=texture2D(uT,vU);gl_FragColor=vec4(c.rgb,c.a*vA);}"] ; +#71 ["uniform float uT,uAsp;attribute vec3 aC;attribute vec4 aK;varying vec3 vC,vB,vN,vV;varying float vA,vL,vI;vec3 tourne(vec3 v,vec3 a,float s)","uniform vec3 uG;varying vec3 vC,vB,vN,vV;varying float vA,vL,vI;void main(){vec3 q=abs(vB)*2.;float mx=max(q.x,max(q.y,q.z)),mn=min(q.x,min("]

### SOURCE · 3 programmes · intouchable : non
- #14 serpent MeshPhongMaterial clé 41018139 — voitures/echappements.js:346 (lpMat) obc cpk — lien page/debut-corps.html:195
- #52 serpent MeshPhongMaterial clé d71cb99f — voitures/echappements.js:346 (lpMat) obc — lien page/debut-corps.html:195
- #55 serpent MeshPhongMaterial clé 9cd54bd6 — voitures/echappements.js:346 (lpMat) obc — lien page/debut-corps.html:195
  - écart #14/#55 : 3 lignes ; +#14 ["uniform float uStuHdr;vec3 fstuHdr(vec3 e){return e*(1.+uStuHdr*4.5*smoothstep(.5,.92,dot(e,vec3(.299,.587,.114))));}","outgoingLight=mix(outgoingLight,fstuHdr(envColor.xyz)*mix(vec3(1.),diffuseColor.rgb,uVern.w),saturate(specularStrength*reflectivity*mix(uVer"] ; +#55 ["outgoingLight=mix(outgoingLight,envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w),saturate(specularStrength*reflectivity*mix(uVern.x,uVern"]

### SOURCE · 2 programmes · intouchable : non
- #19 serpent SpriteMaterial clé b29e0268 — voitures/atchoum-feu.js:462 — lien page/debut-corps.html:195
- #117 serpent SpriteMaterial clé 61c06f7e — economie/final-spin.js:191 obc cpk — lien page/debut-corps.html:195
  - écart #19/#117 : 4 lignes ; +#19 [] ; +#117 ["varying float vD9;","varying float vD9;","vD9=-mvPosition.z;","gl_FragColor.a*=1.-smoothstep(110.,160.,vD9);"]

### SOURCE · 5 programmes · intouchable : 1 maps / 5
- #24 serpent MeshBasicMaterial clé a5b4b070 — maps/orbite-2.js:349 MAPS — lien page/debut-corps.html:195
- #58 serpent MeshBasicMaterial clé 7ef73d46 — moteur/depart-avance.js:319 (pisteRoute) obc cpk — lien page/debut-corps.html:195
- #61 serpent MeshBasicMaterial clé 152b7623 — rendu/autoroute.js:161 (arLignesMat) obc cpk — lien page/debut-corps.html:195
- #62 serpent MeshBasicMaterial clé 69fcbe47 — rendu/autoroute.js:183 (arZoneMat) obc cpk — lien page/debut-corps.html:195
- #127 serpent MeshBasicMaterial clé ea5c62ce — rendu/autoroute.js:183 (arZoneMat) obc cpk — lien page/debut-corps.html:195
  - écart #24/#58 : 4 lignes ; +#24 [] ; +#58 ["attribute vec3 aLat;uniform float uPx9,uRas9,uAA9;varying float vK9,vE9,vF9;","{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z),p9=uAA9*uPx9*d9;vE9=dot(aLat,vec3(.31,.83,.47))<0.?-1.:1","varying float vK9,vE9,vF9;uniform float uAA9;","float c9=1.;if(uAA9>.001){float g9=length(vec2(dFdx(vE9),dFdy(vE9)));c9=clamp(((1.-abs(vE9))/max(g9,1e-6)-.25*uAA9)/uAA9,0.,1.);}gl_FragColo"]
  - écart #24/#62 : 12 lignes ; +#24 ["#endif","#if defined( USE_COLOR_ALPHA )","#elif defined( USE_COLOR )","diffuseColor *= vColor;","diffuseColor.rgb *= vColor;"] ; +#62 ["attribute vec4 aI;varying highp vec4 vArI;","vArI=aI;","uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;","highp float arF(highp float t,float a,float b){return floor(t)*(b-a)+clamp(fract(t)-a,0.,b-a);}","float arPulse(highp float t,float a,float b,float w){w=max(w,1e-4);return clamp((arF(t+w*.5,a,b)-arF(t-w*.5,a,b))/w,0.,1.);}","float arH(float n){return fract(sin(n*12.9898)*43758.5453);}"]
  - écart #24/#127 : 12 lignes ; +#24 ["#endif","#if defined( USE_COLOR_ALPHA )","#elif defined( USE_COLOR )","diffuseColor *= vColor;","diffuseColor.rgb *= vColor;"] ; +#127 ["attribute vec4 aI;varying highp vec4 vArI;","vArI=aI;","uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;","highp float arF(highp float t,float a,float b){return floor(t)*(b-a)+clamp(fract(t)-a,0.,b-a);}","float arPulse(highp float t,float a,float b,float w){w=max(w,1e-4);return clamp((arF(t+w*.5,a,b)-arF(t-w*.5,a,b))/w,0.,1.);}","float arH(float n){return fract(sin(n*12.9898)*43758.5453);}"]
  - écart #61/#62 : 11 lignes ; +#61 ["attribute vec4 aLatQ;attribute float aV;attribute vec4 aK;varying highp float vArV;varying vec4 vArK;vec3 aLat;uniform float uPx9,uRas9,uAA9","aLat=aLatQ.xyz*(aLatQ.w*.5);vArV=aV;vArK=aK;","{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z),p9=uAA9*uPx9*d9;vE9=dot(aLat,vec3(.31,.83,.47))<0.?-1.:1","uniform vec3 uArPal[7];uniform float uArTrav,uArNuit;varying highp float vArV;varying vec4 vArK;","varying float vK9,vE9,vF9;uniform float uAA9;","{float k9=floor(vArK.x*255.+.5),cd=mod(k9,4.),ci=floor(k9/4.),per=cd>2.5?36.:12.;highp float t=vArV/per;float w=max(fwidth(t),uArTrav/per);f"] ; +#62 ["attribute vec4 aI;varying highp vec4 vArI;","vArI=aI;","uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;","{float xm=vArI.x*vArI.y;highp float t=(vArI.z-abs(xm))/7.;float c=arPulse(t,0.,.07,max(fwidth(t),uArTrav/7.));diffuseColor=vec4(uArC*(1.-.4*"]
  - écart #61/#127 : 11 lignes ; +#61 ["attribute vec4 aLatQ;attribute float aV;attribute vec4 aK;varying highp float vArV;varying vec4 vArK;vec3 aLat;uniform float uPx9,uRas9,uAA9","aLat=aLatQ.xyz*(aLatQ.w*.5);vArV=aV;vArK=aK;","{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z),p9=uAA9*uPx9*d9;vE9=dot(aLat,vec3(.31,.83,.47))<0.?-1.:1","uniform vec3 uArPal[7];uniform float uArTrav,uArNuit;varying highp float vArV;varying vec4 vArK;","varying float vK9,vE9,vF9;uniform float uAA9;","{float k9=floor(vArK.x*255.+.5),cd=mod(k9,4.),ci=floor(k9/4.),per=cd>2.5?36.:12.;highp float t=vArV/per;float w=max(fwidth(t),uArTrav/per);f"] ; +#127 ["attribute vec4 aI;varying highp vec4 vArI;","vArI=aI;","uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;","{highp float t=vArI.z/.55;float c=arPulse(t,0.,.5,max(fwidth(t),uArTrav/.55));diffuseColor=vec4(uArC,c*vArI.w);}"]
  - écart #62/#127 : 2 lignes ; +#62 ["{float xm=vArI.x*vArI.y;highp float t=(vArI.z-abs(xm))/7.;float c=arPulse(t,0.,.07,max(fwidth(t),uArTrav/7.));diffuseColor=vec4(uArC*(1.-.4*"] ; +#127 ["{highp float t=vArI.z/.55;float c=arPulse(t,0.,.5,max(fwidth(t),uArTrav/.55));diffuseColor=vec4(uArC,c*vArI.w);}"]

### SOURCE · 2 programmes · intouchable : 1 maps / 2
- #45 serpent MeshBasicMaterial clé 67724eac — son/musique-frenesie.js:555 — lien page/debut-corps.html:195
- #114 serpent MeshBasicMaterial clé 1a9ffbb0 — maps/ville-v3.js:356 (villeMatPub) MAPS obc — lien page/debut-corps.html:195
  - écart #45/#114 : 8 lignes ; +#45 [] ; +#114 ["#ifdef USE_INSTANCING","#endif","#else","uniform float uT9;varying float vS9;","vS9=fract(instanceMatrix[3].x*.0713+instanceMatrix[3].z*.0419+instanceMatrix[3].y*.017);float c9=floor(vS9*16.);float gl9=step(.93,fract(uT9","vS9=0.;"]

### SOURCE · 2 programmes · intouchable : 1 maps / 2
- #59 serpent MeshBasicMaterial clé 0b3c1159 — moteur/depart-avance.js:341 (pisteRoute) obc cpk — lien page/debut-corps.html:195
- #124 serpent MeshBasicMaterial clé cb5658a9 — maps/canyon-relief.js:417 (cyT2Mats) MAPS — lien page/debut-corps.html:195
  - écart #59/#124 : 4 lignes ; +#59 ["attribute vec3 aLat;uniform float uPx9,uRas9,uAA9;varying float vK9,vE9,vF9;","{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z),p9=uAA9*uPx9*d9;vE9=dot(aLat,vec3(.31,.83,.47))<0.?-1.:1","varying float vK9,vE9,vF9;uniform float uAA9;","float c9=1.;if(uAA9>.001){float g9=length(vec2(dFdx(vE9),dFdy(vE9)));c9=clamp(((1.-abs(vE9))/max(g9,1e-6)-.25*uAA9)/uAA9,0.,1.);}gl_FragColo"] ; +#124 []

### SOURCE · 2 programmes · intouchable : non
- #96 serpent ShaderMaterial clé c27b9bc9 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
- #99 serpent ShaderMaterial clé 5b6d715c — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
  - écart #96/#99 : 8 lignes ; +#96 ["uniform float uBasTr;","void main(){gl_FragColor=vec4(villeLisse(vDir,vec3(0.))+vec3(cielTrame()*uBasTr),1.);}"] ; +#99 ["uniform sampler2D uBasTex;uniform vec2 uBasInv;uniform float uBasRe;varying vec4 vBas;vec2 basUV(){return uBasRe>.5&&vBas.w>1e-4?clamp(vBas.","void main(){","vec3 c=texture2D(uBasTex,basUV()).rgb;","villeFin(c,vDir);","float yv=vDir.y-uVilleY;if(yv>-.1&&yv<.42)villeSkyline(c,vDir,atan(vDir.x,-vDir.z));","c+=vec3(cielTrame());gl_FragColor=vec4(c,1.);}"]

### SOURCE · 2 programmes · intouchable : non
- #97 serpent ShaderMaterial clé 1d547b13 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
- #102 serpent ShaderMaterial clé f404a006 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
  - écart #97/#102 : 3 lignes ; +#97 ["uniform float uBasTr;","void main(){gl_FragColor=vec4(jadeCiel(vDir)+vec3(cielTrame()*uBasTr),1.);}"] ; +#102 ["void main(){gl_FragColor=vec4(jadeCiel(vDir)+vec3(cielTrame()),1.);}"]

### SOURCE · 2 programmes · intouchable : tous maps
- #109 serpent MeshBasicMaterial clé af49d075 — maps/ville-v3.js:302 (villeMatToursLoin) MAPS obc cpk — lien page/debut-corps.html:195
- #113 serpent MeshBasicMaterial clé 6ba65e03 — maps/ville-v3.js:314 (villeMatNeonLoin) MAPS cpk — lien page/debut-corps.html:195
  - écart #109/#113 : 10 lignes ; +#109 ["#ifdef USE_INSTANCING","#endif","#endif","#else","varying float vB9;varying vec3 vW9;","#ifdef USE_FOG"] ; +#113 []

### SOURCE · 2 programmes · intouchable : non
- #132 serpent MeshBasicMaterial clé 079a6b83 — interface/vignette-moteur.js:93 — lien page/debut-corps.html:195
- #133 serpent MeshBasicMaterial clé 95203013 — interface/vignette-moteur.js:107 obc cpk — lien page/debut-corps.html:195
  - écart #132/#133 : 2 lignes ; +#132 [] ; +#133 ["uniform float uClipY;","if(gl_FragCoord.y<uClipY)discard;"]

## Tous les programmes

| # | t ms | phase | type | nom | origine | maps | clé | corps | defs |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 1868 | serpent | ShaderMaterial |  | maps/nuages-embellie.js:47 | INTOUCHABLE | 721814fe | 9f9a7400 | a9ee9e62 |
| 1 | 2024 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | e1de50c4 | df4a1fae | c5cd8515 |
| 2 | 2025 | serpent | MeshBasicMaterial |  | rendu/soleil-planete.js:282 |  | 8d99e1bb | f3c08280 | aef11fd8 |
| 3 | 2026 | serpent | MeshBasicMaterial |  | rendu/soleil-planete.js:316 |  | 698ff92c | b0cf48fd | a4924a88 |
| 4 | 2026 | serpent | ShaderMaterial |  | maps/orbite-saturne.js:53 | INTOUCHABLE | 76e6875f | 9e1676d2 | bab4f8bb |
| 5 | 2027 | serpent | MeshBasicMaterial |  | rendu/triptyque-bloom.js:478 |  | 49ffe88c | 2c1f539f | b198cc2b |
| 6 | 2027 | serpent | ShaderMaterial |  | maps/jade-vol.js:108 | INTOUCHABLE | 7b11c63a | 8bd23891 | 0e86c785 |
| 7 | 2027 | serpent | ShaderMaterial |  | maps/continuite.js:367 | INTOUCHABLE | cca4db84 | 8fd8e4f2 | 0e86c785 |
| 8 | 2028 | serpent | ShaderMaterial |  | maps/orbite-1.js:170 | INTOUCHABLE | e86d460f | 3d1cf5fc | 095d4c83 |
| 9 | 2028 | serpent | ShaderMaterial |  | maps/orbite-1.js:236 | INTOUCHABLE | 7460a7b9 | 3d1cf5fc | 25d04b9f |
| 10 | 2028 | serpent | ShaderMaterial |  | maps/orbite-lune.js:28 | INTOUCHABLE | 41cbbdd9 | 7d4af2b4 | 0e86c785 |
| 11 | 2028 | serpent | ShaderMaterial |  | maps/orbite-roches.js:19 | INTOUCHABLE | 5f33c085 | fbf877e5 | 095d4c83 |
| 12 | 2029 | serpent | MeshBasicMaterial |  | voitures/buildcar.js:399 |  | 75cba2ba | 2c1f539f | aef11fd8 |
| 13 | 2030 | serpent | MeshPhongMaterial |  | voitures/buildcar.js:104 |  | 26a296f1 | 7cec0214 | b035c9f2 |
| 14 | 2031 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | 41018139 | 6327b929 | 95f8606c |
| 15 | 2032 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | e56ecbde | 979dba66 | b5baae13 |
| 16 | 2032 | serpent | MeshBasicMaterial |  | voitures/ailes.js:127 |  | c9445b0b | 4a77e60b | e208bea8 |
| 17 | 2033 | serpent | MeshBasicMaterial |  | voitures/ailes.js:137 |  | 98276055 | 4a77e60b | b93c8e16 |
| 18 | 2033 | serpent | ShaderMaterial |  | voitures/atchoum-feu.js:457 |  | ea1c2241 | 555b90d8 | bab4f8bb |
| 19 | 2033 | serpent | SpriteMaterial |  | voitures/atchoum-feu.js:462 |  | b29e0268 | 13a7d991 | ce4cab2c |
| 20 | 2034 | serpent | MeshPhongMaterial |  | voitures/plaque.js:172 |  | b0d91b37 | 8712a1ce | 227e01f0 |
| 21 | 2035 | serpent | MeshBasicMaterial |  | voitures/plaque.js:171 |  | d0b3b6df | 2c1f539f | 9de27cf2 |
| 22 | 2036 | serpent | MeshPhongMaterial |  | voitures/shapes-1.js:8 |  | b14ab599 | 7cec0214 | 9cb25056 |
| 23 | 2036 | serpent | MeshPhongMaterial |  | voitures/buildcar.js:105 |  | 8db273cd | 6ebf3605 | b035c9f2 |
| 24 | 2037 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:349 | INTOUCHABLE | a5b4b070 | 4a77e60b | 9a20a609 |
| 25 | 2038 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:451 | INTOUCHABLE | 12ec77aa | 2c1f539f | 6d05f57b |
| 26 | 2038 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:484 | INTOUCHABLE | ceaeb4d7 | 4a77e60b | e77231f9 |
| 27 | 2038 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:485 | INTOUCHABLE | 7d63ba94 | 4a77e60b | 8df0f67e |
| 28 | 2038 | serpent | ShaderMaterial |  | maps/orbite-soleil.js:30 | INTOUCHABLE | 2aa471e2 | b46b0aa0 | 0e86c785 |
| 29 | 2039 | serpent | ShaderMaterial |  | maps/orbite-geants.js:62 | INTOUCHABLE | 62e0b556 | 9d85ba85 | 4fa842ca |
| 30 | 2039 | serpent | ShaderMaterial |  | maps/orbite-geants.js:81 | INTOUCHABLE | eac379e1 | 35dced01 | bab4f8bb |
| 31 | 2039 | serpent | ShaderMaterial |  | maps/orbite-geants.js:104 | INTOUCHABLE | 55e5681a | fe41abe1 | 4e5d0ac4 |
| 32 | 2039 | serpent | ShaderMaterial |  | maps/orbite-geants.js:126 | INTOUCHABLE | b9f1fd30 | e40e5743 | 0e86c785 |
| 33 | 2039 | serpent | ShaderMaterial |  | maps/orbite-geants.js:151 | INTOUCHABLE | 8786c737 | 1a131c98 | bab4f8bb |
| 34 | 2039 | serpent | ShaderMaterial |  | maps/orbite-geants.js:157 | INTOUCHABLE | 3d702109 | a39bd086 | 0e86c785 |
| 35 | 2040 | serpent | MeshPhongMaterial |  | gameplay/pickups-fruits.js:213 |  | 9e8e77b6 | 38b3b391 | 903e310f |
| 36 | 2040 | serpent | ShaderMaterial |  | gameplay/pouvoirs-grisants.js:335 |  | 2e26e866 | 5b660371 | 095d4c83 |
| 37 | 2041 | serpent | PointsMaterial |  | rendu/tirelire-reserves.js:157 |  | d656ca28 | 8b671070 | a5722893 |
| 38 | 2042 | serpent | LineBasicMaterial |  | rendu/tirelire-reserves.js:204 |  | 0b85b27d | 4a77e60b | b1a9fcd8 |
| 39 | 2043 | serpent | PointsMaterial |  | rendu/tirelire-reserves.js:157 |  | 8726d1a9 | cec7056d | a5722893 |
| 40 | 2043 | serpent | ShaderMaterial |  | rendu/tirelire-reserves.js:343 |  | 2c041e8d | efbed11f | 0e86c785 |
| 41 | 2043 | serpent | SpriteMaterial |  | gameplay/impact.js:82 |  | 2a1d2fd5 | 13a7d991 | 3e7877f4 |
| 42 | 2043 | serpent | ShaderMaterial |  | gameplay/impact.js:87 |  | 96208d5d | 05b427fb | 0e86c785 |
| 43 | 2044 | serpent | MeshPhongMaterial |  | gameplay/impact.js:117 |  | 28964b4a | 8712a1ce | f16def74 |
| 44 | 2045 | serpent | MeshBasicMaterial |  | gameplay/impact.js:317 |  | 88a13c49 | 2c1f539f | 89d0967a |
| 45 | 2045 | serpent | MeshBasicMaterial |  | son/musique-frenesie.js:555 |  | 67724eac | 2c1f539f | fc1068ae |
| 46 | 2046 | serpent | MeshPhongMaterial |  | gameplay/zones-caisses.js:196 |  | aaa83d8a | d67d1ffe | 8124fdde |
| 47 | 2047 | serpent | MeshPhongMaterial |  | interface/garage-salle.js:60 |  | 8fdc09db | 00d14af9 | 55edff02 |
| 48 | 2048 | serpent | MeshLambertMaterial |  | interface/garage-salle.js:8 |  | 728bf71a | 5118b669 | bbb3c79b |
| 49 | 2049 | serpent | MeshLambertMaterial |  | interface/garage-salle.js:8 |  | 1219a303 | 332911d5 | 70c92340 |
| 50 | 2050 | serpent | MeshLambertMaterial |  | interface/garage-salle.js:158 |  | 6ce85523 | 5b9488ea | a725b411 |
| 51 | 2051 | serpent | MeshBasicMaterial |  | interface/garage-salle.js:9 |  | 6b69c68d | 4a77e60b | 84d1cc1e |
| 52 | 2052 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | d71cb99f | 6467b64b | 95f8606c |
| 53 | 2053 | serpent | MeshBasicMaterial |  | interface/garage-salle.js:9 |  | 5539ce42 | 4a77e60b | 130fd8c9 |
| 54 | 2053 | serpent | PointsMaterial |  | interface/garage-salle.js:563 |  | 9ff4eac6 | 94b1a2ad | df454ad4 |
| 55 | 2054 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | 9cd54bd6 | 6467b64b | 95f8606c |
| 56 | 2055 | serpent | MeshPhongMaterial |  | rendu/bitume-beton.js:225 |  | a934c5c7 | d966ba84 | b3c36a8e |
| 57 | 2056 | serpent | MeshLambertMaterial |  | maps/ville-nuit.js:180 | INTOUCHABLE | ff312ae3 | 438e96e8 | 30cd2847 |
| 58 | 2057 | serpent | MeshBasicMaterial |  | moteur/depart-avance.js:319 |  | 7ef73d46 | 236fd21b | 9a20a609 |
| 59 | 2057 | serpent | MeshBasicMaterial |  | moteur/depart-avance.js:341 |  | 0b3c1159 | ee5cb9e4 | 468fd438 |
| 60 | 2058 | serpent | MeshBasicMaterial |  | maps/ville-nuit.js:166 | INTOUCHABLE | 4cdb9006 | f6363a4e | 591ae850 |
| 61 | 2058 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:161 |  | 152b7623 | 6550a496 | 9a20a609 |
| 62 | 2059 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:183 |  | 69fcbe47 | f0e5a54d | 9a20a609 |
| 63 | 2059 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:218 |  | 06b78e60 | ef73269e | 90d4dee1 |
| 64 | 2060 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:205 |  | f26539ef | b746dc5a | 591ae850 |
| 65 | 2060 | serpent | ShaderMaterial |  | maps/nuages-v8.js:440 | INTOUCHABLE | 6c8de6f8 | 7997c228 | 4bea9c76 |
| 66 | 2061 | serpent | ShaderMaterial |  | maps/nuages-embellie.js:47 | INTOUCHABLE | afdaa7a0 | 9f9a7400 | 0e86c785 |
| 67 | 2061 | serpent | ShaderMaterial |  | maps/nuages-casses.js:126 | INTOUCHABLE | 6ae5e144 | c3c87bca | 0115f3e2 |
| 68 | 2061 | serpent | ShaderMaterial |  | maps/nuages-v8.js:506 | INTOUCHABLE | f64887ea | 7997c228 | 7bd87239 |
| 69 | 2062 | serpent | MeshPhongMaterial |  | maps/nuages-coton.js:74 | INTOUCHABLE | 87b0e093 | d67d1ffe | 8124fdde |
| 70 | 2062 | serpent | ShaderMaterial |  | rendu/portails.js:83 |  | 7b7803ea | a36ef351 | bab4f8bb |
| 71 | 2063 | serpent | ShaderMaterial |  | rendu/portails.js:50 |  | 5f689804 | f8052262 | 095d4c83 |
| 72 | 2063 | serpent | MeshBasicMaterial |  | gameplay/ligne-parfaite.js:283 |  | fbd306a9 | 2c1f539f | 66314125 |
| 73 | 2063 | serpent | ShaderMaterial |  | gameplay/fruits-auras.js:168 |  | e5cc8af7 | 9ea6e732 | bab4f8bb |
| 74 | 2063 | serpent | ShaderMaterial |  | gameplay/fruits-auras.js:548 |  | 8c126b66 | d5568115 | 0e86c785 |
| 75 | 2064 | serpent | ShaderMaterial |  | gameplay/fruits-auras.js:569 |  | fbb383e8 | 3c5f60d4 | bab4f8bb |
| 76 | 2065 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | 16c6d4c1 | c66dbddd | a9ee9e62 |
| 77 | 2065 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | 35b3a332 | 6db6f83a | ca1a0ca0 |
| 78 | 2065 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | 573fc2a7 | 6db6f83a | c23816bf |
| 79 | 2065 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | a7dc295d | 6db6f83a | 7ef02d2f |
| 80 | 2065 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | c666fcf6 | 6db6f83a | f9ed0436 |
| 81 | 2066 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | 8edcd79f | 6db6f83a | e02b6a08 |
| 82 | 2066 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | ef0d5eed | d01625a9 | bf1c2c38 |
| 83 | 2066 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:326 |  | 8e75755a | 8ad1e939 | a9ee9e62 |
| 84 | 2066 | serpent | MeshBasicMaterial |  | rendu/triptyque-bloom.js:326 |  | 5f04fdcd | 4a77e60b | cc488ef1 |
| 85 | 2066 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:337 |  | aaf0f2ee | 8ad01b09 | a9ee9e62 |
| 86 | 2066 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:424 |  | c19144c8 | 1ed87182 | 73b30a80 |
| 87 | 2066 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:429 |  | 9fe722c2 | 388e156f | cdd7e9eb |
| 88 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:429 |  | d35cb076 | 388e156f | 0e5d62c4 |
| 89 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:438 |  | 310c3112 | 6d392734 | a8e4b2a6 |
| 90 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:438 |  | ca2e4226 | 6d392734 | 1b2fad57 |
| 91 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:438 |  | 56eddc48 | 6d392734 | 8812dc89 |
| 92 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:438 |  | 2acfbaa0 | 6d392734 | 9d55e258 |
| 93 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:438 |  | 7479d479 | 6d392734 | c0bfd203 |
| 94 | 2067 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:354 |  | 4b1c653e | 611f7d79 | a9ee9e62 |
| 95 | 2068 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 6e9eb51b | b3ca838e | 43f767df |
| 96 | 2068 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | c27b9bc9 | 17f79730 | c378ee14 |
| 97 | 2068 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 1d547b13 | ecd5dec6 | c378ee14 |
| 98 | 2068 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | e6cea152 | 15e182a0 | c378ee14 |
| 99 | 2069 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 5b6d715c | 7e0ba11d | c378ee14 |
| 100 | 2069 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | baef910e | df4a1fae | 6a9d40c5 |
| 101 | 2069 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 17bad1bc | 8ad4ef25 | c378ee14 |
| 102 | 2069 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | f404a006 | 57001a80 | c378ee14 |
| 103 | 2069 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 964699d6 | e5d524d1 | c378ee14 |
| 104 | 2531 | serpent | ShaderMaterial |  | interface/burn-out-1.js:71 |  | f3950ee8 | f5e5eab7 | 0e86c785 |
| 105 | 2532 | serpent | ShaderMaterial |  | interface/burn-out-1.js:71 |  | ba25e21a | 7996edbe | 0e86c785 |
| 106 | 2565 | serpent | ShaderMaterial |  | maps/nuages-casses.js:15 | INTOUCHABLE | d4d36ffd | 292a990b | 0115f3e2 |
| 107 | 2593 | serpent | MeshDepthMaterial |  | voitures/moba-ombre.js:80 |  | d8ea2faf | e2b00b93 | c3fe79de |
| 108 | 2764 | serpent | MeshLambertMaterial |  | maps/ville-v3.js:147 | INTOUCHABLE | ef89a961 | 55490e82 | 04be5021 |
| 109 | 2765 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:302 | INTOUCHABLE | af49d075 | b9b865a4 | cfac21f5 |
| 110 | 2766 | serpent | MeshLambertMaterial |  | maps/ville-verre.js:385 | INTOUCHABLE | 13c66c7c | 82677f89 | 04be5021 |
| 111 | 2767 | serpent | MeshBasicMaterial |  | maps/ville-verre.js:426 | INTOUCHABLE | c523e1bc | cf35f8a9 | 2c25d5e6 |
| 112 | 2767 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:258 | INTOUCHABLE | 1c522333 | 6229e453 | 2c25d5e6 |
| 113 | 2767 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:314 | INTOUCHABLE | 6ba65e03 | 4a77e60b | cfac21f5 |
| 114 | 2768 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:356 | INTOUCHABLE | 1a9ffbb0 | 4cd1b0c2 | fc1068ae |
| 115 | 2768 | serpent | ShaderMaterial |  | maps/ville-embellie.js:32 | INTOUCHABLE | 19b00ef8 | cce446d1 | bab4f8bb |
| 116 | 2814 | serpent | MeshPhongMaterial |  | economie/final-spin.js:187 |  | 00c8451f | 6ebf3605 | 49215ec7 |
| 117 | 2814 | serpent | SpriteMaterial |  | economie/final-spin.js:191 |  | 61c06f7e | 3450fbec | ce4cab2c |
| 118 | 2934 | serpent | ShaderMaterial |  | maps/canyon-relief.js:152 | INTOUCHABLE | 4785c90e | cfa70355 | 114bf33e |
| 119 | 2934 | serpent | ShaderMaterial |  | maps/canyon-relief.js:295 | INTOUCHABLE | be61c50f | ef2ac4e8 | 114bf33e |
| 120 | 2934 | serpent | ShaderMaterial |  | maps/canyon-relief.js:295 | INTOUCHABLE | 5ac7f1ff | ef2ac4e8 | fda98d77 |
| 121 | 2934 | serpent | ShaderMaterial |  | maps/canyon-relief.js:318 | INTOUCHABLE | dc0cc3fb | 2ab8d69f | fda98d77 |
| 122 | 2934 | serpent | ShaderMaterial |  | maps/canyon-relief.js:296 | INTOUCHABLE | b93dad24 | 99dc3011 | fad67f21 |
| 123 | 2935 | serpent | ShaderMaterial |  | maps/canyon-relief.js:296 | INTOUCHABLE | 2d9915d0 | 99dc3011 | 5e33d40f |
| 124 | 2935 | serpent | MeshBasicMaterial |  | maps/canyon-relief.js:417 | INTOUCHABLE | cb5658a9 | 4a77e60b | 468fd438 |
| 125 | 2935 | serpent | ShaderMaterial |  | maps/canyon-relief.js:295 | INTOUCHABLE | efd14a33 | ef2ac4e8 | 40212d61 |
| 126 | 2935 | serpent | ShaderMaterial |  | maps/canyon-embellie.js:19 | INTOUCHABLE | e64e8d52 | 7448231f | 0e86c785 |
| 127 | 2965 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:183 |  | ea5c62ce | 0ef32d1a | 9a20a609 |
| 128 | 2991 | serpent | ShaderMaterial |  | maps/grottes-2.js:320 | INTOUCHABLE | d6611b67 | 04c6dd5c | 0e86c785 |
| 129 | 2992 | serpent | ShaderMaterial |  | maps/grottes-2.js:318 | INTOUCHABLE | 46585073 | 03806aec | fda98d77 |
| 130 | 3031 | serpent | MeshBasicMaterial |  | rendu/traces-pneus.js:28 |  | 3e667b1b | 4a77e60b | e5ed5857 |
| 131 | 3032 | serpent | MeshLambertMaterial |  | maps/pigeons.js:7 | INTOUCHABLE | 282730b7 | 332911d5 | 3153cfa2 |
| 132 | 3074 | serpent | MeshBasicMaterial |  | interface/vignette-moteur.js:93 |  | 079a6b83 | 2c1f539f | 8a113131 |
| 133 | 3075 | serpent | MeshBasicMaterial |  | interface/vignette-moteur.js:107 |  | 95203013 | a8d1b7bf | 8a113131 |
| 134 | 3100 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | f8961a64 | 2e4f08d9 | 40212d61 |
| 135 | 3100 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | e02556cf | 2e4f08d9 | e00d0e4b |
| 136 | 3101 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | f32c9a22 | 2e4f08d9 | 5f017848 |
| 137 | 3101 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 536afaa2 | 2e4f08d9 | bd68addf |
| 138 | 3141 | serpent | ShaderMaterial |  | maps/jade-2.js:134 | INTOUCHABLE | daace4e7 | 61045ff4 | 8b2f2184 |
| 139 | 3141 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 04fcad2c | 2e4f08d9 | 114bf33e |
| 140 | 3141 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 65fdd3ac | 2e4f08d9 | dded0880 |
| 141 | 3141 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 0ec22264 | 2e4f08d9 | 19d5d8e1 |
| 142 | 3172 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | fa13b3ef | 2e4f08d9 | 42659036 |
| 143 | 3173 | serpent | ShaderMaterial |  | maps/jade-2.js:226 | INTOUCHABLE | 4c9fb916 | 0657ede7 | fda98d77 |
| 144 | 3173 | serpent | ShaderMaterial |  | maps/jade-vol.js:87 | INTOUCHABLE | 978c76d5 | 73bb4a88 | bab4f8bb |
| 145 | 3173 | serpent | ShaderMaterial |  | maps/jade-2.js:251 | INTOUCHABLE | eae5beb4 | a083fb6d | 40212d61 |
| 146 | 3210 | serpent | MeshLambertMaterial |  | maps/jade-vol.js:236 | INTOUCHABLE | 36cf16c5 | 332911d5 | efc598a9 |
| 147 | 3211 | serpent | MeshLambertMaterial |  | maps/jade-vol.js:333 | INTOUCHABLE | c446dd14 | 332911d5 | 11b7a765 |
| 148 | 3302 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:185 |  | b78819f6 | bf74604a | f1a0a36e |
| 149 | 3303 | serpent | MeshPhongMaterial |  | voitures/moteurs-themes.js:53 |  | 56fa9f07 | 90247721 | faacfdc3 |
| 150 | 3368 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:488 |  | 1a20696b | bf74604a | d3bdcc4d |
| 151 | 3369 | serpent | MeshPhongMaterial |  | voitures/moteurs-originaux.js:16 |  | 83faac70 | 51d6ac94 | 2f278265 |
| 152 | 3370 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:492 |  | bda6cdd5 | bf74604a | 220e12e3 |
| 153 | 3370 | serpent | MeshBasicMaterial |  | voitures/moteurs-originaux.js:29 |  | 1d3f30bb | 4a77e60b | 2471a38d |
| 154 | 3419 | serpent | MeshPhongMaterial |  | voitures/moteurs-themes.js:19 |  | 3b3afe78 | 90247721 | 6cce75b8 |
| 155 | 3419 | serpent | MeshBasicMaterial |  | voitures/moteurs-themes.js:19 |  | 49dc9c68 | 4a77e60b | cc488ef1 |
| 156 | 3565 | serpent | MeshPhongMaterial |  | maps/nuages-coton.js:81 | INTOUCHABLE | 2aac8bae | d67d1ffe | 095ad7f9 |
| 157 | 3567 | serpent | MeshPhongMaterial |  | maps/nuages-coton.js:78 | INTOUCHABLE | ee04475a | d67d1ffe | 56408908 |
| 158 | 3689 | serpent | MeshPhongMaterial |  | voitures/moteurs-themes.js:748 |  | 654c1311 | 90247721 | 11cc47aa |
| 159 | 3830 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:197 |  | 45ac2dc0 | 51d6ac94 | b21d8197 |
| 160 | 4001 | serpent | MeshBasicMaterial |  | interface/vignette-moteur.js:179 |  | 98e3a3cf | 2c1f539f | a57e68d3 |
| 161 | 10089 | film | ShaderMaterial |  | maps/nuages-casses.js:126 | INTOUCHABLE | 3d49fb5a | c3c87bca | d84cc30b |
| 162 | 10090 | film | ShaderMaterial |  | gameplay/fruits-auras.js:334 |  | b2d17310 | d397193e | bab4f8bb |
| 163 | 10090 | film | ShaderMaterial |  | gameplay/fruits-auras.js:336 |  | d73515d3 | f43ded17 | bab4f8bb |
| 164 | 10090 | film | ShaderMaterial |  | gameplay/fruits-auras.js:294 |  | 7909b530 | 5cd98d7f | 0e86c785 |
