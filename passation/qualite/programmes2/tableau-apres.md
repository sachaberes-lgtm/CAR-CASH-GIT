# Programmes compilés au lancement (2026-11-15T22:49, ?tel=1&classe=1&palier=2&introapres=1, cpu ×1)

- 144 programmes liés (three en garde 144 vivants) ; 1579 matériaux créés ; prêt à 5.2 s, menu à 18.9 s.
- Par phase : {"serpent":140,"film":4} ; sans matériau reconnu : 0.
- Jumeaux : EXACT 0 groupes (0 programmes évitables), INERTES 1 groupes (1 évitables, defines sans effet), DEFINES 19 groupes (63 programmes), SOURCE 8 groupes (28 programmes).

## Simulation du correctif three (lumières/ombres/faces ignorées des matériaux sans lumière)

- éligibles 94, programmes 144 → 144 (0 évités) ; garde-fou (sources différentes réunies) : 0

## Par origine (morceau où naît le matériau)

| origine | programmes |
|---|---|
| rendu/triptyque-bloom.js | 11 |
| maps/jade-2.js (INTOUCHABLE) | 11 |
| rendu/scene-ciel.js | 9 |
| maps/canyon-relief.js (INTOUCHABLE) | 7 |
| maps/orbite-geants.js (INTOUCHABLE) | 6 |
| interface/garage-salle.js | 6 |
| gameplay/fruits-auras.js | 6 |
| rendu/autoroute.js | 5 |
| maps/ville-v3.js (INTOUCHABLE) | 5 |
| maps/jade-vol.js (INTOUCHABLE) | 4 |
| voitures/matieres-forme.js | 4 |
| voitures/buildcar.js | 3 |
| voitures/echappements.js | 3 |
| maps/orbite-2.js (INTOUCHABLE) | 3 |
| rendu/tirelire-reserves.js | 3 |
| gameplay/impact.js | 3 |
| maps/nuages-casses.js (INTOUCHABLE) | 3 |
| voitures/moteurs-themes.js | 3 |
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
| maps/nuages-coton.js (INTOUCHABLE) | 2 |
| maps/ville-verre.js (INTOUCHABLE) | 2 |
| economie/final-spin.js | 2 |
| maps/grottes-2.js (INTOUCHABLE) | 2 |
| interface/vignette-moteur.js | 2 |
| voitures/moteurs-originaux.js | 2 |
| maps/nuages-embellie.js (INTOUCHABLE) | 1 |
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
| voitures/moba-ombre.js | 1 |
| maps/ville-embellie.js (INTOUCHABLE) | 1 |
| maps/canyon-embellie.js (INTOUCHABLE) | 1 |
| rendu/traces-pneus.js | 1 |
| maps/pigeons.js (INTOUCHABLE) | 1 |

## Groupes de jumeaux

### INERTES · 2 programmes · intouchable : tous maps
- #25 serpent MeshBasicMaterial clé de3c9347 — maps/orbite-2.js:484 MAPS — lien page/debut-corps.html:195
- #26 serpent MeshBasicMaterial clé 0a5058ba — maps/orbite-2.js:485 MAPS — lien page/debut-corps.html:195
  - cases de la clé three qui diffèrent (dans l'ordre des membres) : {"vertexColors":["true","false"]}

### DEFINES · 6 programmes · intouchable : 1 maps / 6 · defines qui diffèrent : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define PREMULTIPLIED_ALPHA ; #define USE_FOG ; #define USE_COLOR ; #define USE_INSTANCING
- #5 serpent MeshBasicMaterial clé eaa6d353 — rendu/triptyque-bloom.js:522 — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define PREMULTIPLIED_ALPHA
- #12 serpent MeshBasicMaterial clé 1e656fc2 — voitures/buildcar.js:399 (mkPoolPlane) — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #21 serpent MeshBasicMaterial clé 965c88e8 — voitures/plaque.js:171 (plqMats) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #24 serpent MeshBasicMaterial clé 3b2c7b5c — maps/orbite-2.js:451 (mkSillage) MAPS — lien page/debut-corps.html:195 — propres : #define USE_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #42 serpent MeshBasicMaterial clé 2c213412 — son/musique-frenesie.js:555 — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #115 serpent MeshBasicMaterial clé d1d3aa02 — interface/vignette-moteur.js:93 — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define EMPILE
- #8 serpent ShaderMaterial clé 33aff991 — maps/orbite-1.js:170 MAPS — lien page/debut-corps.html:195
- #9 serpent ShaderMaterial clé 0cac4f5f — maps/orbite-1.js:236 MAPS — lien page/debut-corps.html:195 — propres : #define EMPILE

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define USE_COLOR
- #13 serpent MeshPhongMaterial clé 6e1c54da — voitures/buildcar.js:104 (buildCar) obc — lien page/debut-corps.html:195
- #22 serpent MeshPhongMaterial clé 6d8f2fb0 — voitures/shapes-1.js:8 (epave) obc — lien page/debut-corps.html:195 — propres : #define USE_COLOR

### DEFINES · 9 programmes · intouchable : 4 maps / 9 · defines qui diffèrent : #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define USE_COLOR ; #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_ALPHAMAP ; #define USE_UV
- #16 serpent MeshBasicMaterial clé 6961f7a3 — voitures/ailes.js:127 (Object.panneaux) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #17 serpent MeshBasicMaterial clé 8d1f49b3 — voitures/ailes.js:137 (Object.panneaux) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #25 serpent MeshBasicMaterial clé de3c9347 — maps/orbite-2.js:484 MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #26 serpent MeshBasicMaterial clé 0a5058ba — maps/orbite-2.js:485 MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF ; #define USE_COLOR
- #48 serpent MeshBasicMaterial clé 1bc033d0 — interface/garage-salle.js:9 (BA) — lien page/debut-corps.html:195 — propres : #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #97 serpent MeshBasicMaterial clé dd3b9dfb — maps/ville-v3.js:314 (villeMatNeonLoin) MAPS cpk — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #107 serpent MeshBasicMaterial clé 7bd4ab66 — maps/canyon-relief.js:417 (cyT2Mats) MAPS — lien page/debut-corps.html:195 — propres : #define USE_COLOR ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #113 serpent MeshBasicMaterial clé 529cbe71 — rendu/traces-pneus.js:28 (traceInit) — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_ALPHAMAP ; #define USE_UV ; #define USE_SHADOWMAP ; #define SHADOWMAP_TYPE_PCF
- #136 serpent MeshBasicMaterial clé 45d4c385 — voitures/moteurs-originaux.js:29 (kit10) — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define USE_FOG
- #19 serpent SpriteMaterial clé 3bd3224e — voitures/atchoum-feu.js:462 — lien page/debut-corps.html:195 — propres : #define USE_FOG
- #39 serpent SpriteMaterial clé a912bf02 — gameplay/impact.js:82 — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define FLAT_SHADED
- #20 serpent MeshPhongMaterial clé f6ca7c40 — voitures/plaque.js:172 (plqMats) — lien page/debut-corps.html:195
- #41 serpent MeshPhongMaterial clé 2ade5ffc — gameplay/impact.js:117 — lien page/debut-corps.html:195 — propres : #define FLAT_SHADED

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define ENVMAP_BLENDING_MIX ; #define FLAT_SHADED ; #define ENVMAP_BLENDING_MULTIPLY
- #23 serpent MeshPhongMaterial clé b4cff6c4 — voitures/buildcar.js:105 (buildCar) — lien page/debut-corps.html:195 — propres : #define ENVMAP_BLENDING_MIX
- #100 serpent MeshPhongMaterial clé 1673bbc4 — economie/final-spin.js:187 — lien page/debut-corps.html:195 — propres : #define FLAT_SHADED ; #define ENVMAP_BLENDING_MULTIPLY

### DEFINES · 3 programmes · intouchable : 2 maps / 3 · defines qui diffèrent : #define USE_COLOR ; #define DOUBLE_SIDED ; #define NUAGE_DEDANS
- #43 serpent MeshPhongMaterial clé 8ca9d49e — gameplay/zones-caisses.js:196 (nuageMat) obc cpk — lien page/debut-corps.html:195 — propres : #define USE_COLOR
- #89 serpent MeshPhongMaterial clé 1a424a62 — maps/nuages-coton.js:81 MAPS obc cpk — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #90 serpent MeshPhongMaterial clé b9c30914 — maps/nuages-coton.js:78 MAPS obc cpk — lien page/debut-corps.html:195 — propres : #define NUAGE_DEDANS ; #define USE_COLOR ; #define DOUBLE_SIDED

### DEFINES · 4 programmes · intouchable : 3 maps / 4 · defines qui diffèrent : #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED ; #define USE_INSTANCING
- #46 serpent MeshLambertMaterial clé 35737f3f — interface/garage-salle.js:8 (L) — lien page/debut-corps.html:195
- #114 serpent MeshLambertMaterial clé 32dce317 — maps/pigeons.js:7 MAPS — lien page/debut-corps.html:195 — propres : #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED
- #129 serpent MeshLambertMaterial clé 9906931b — maps/jade-vol.js:236 (grueGeos) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG ; #define USE_COLOR ; #define DOUBLE_SIDED
- #130 serpent MeshLambertMaterial clé 418f9504 — maps/jade-vol.js:333 (jadeChauffeProgs) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_FOG

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define NUAGE8_INST ; #define USE_INSTANCING ; #define USE_INSTANCING_COLOR
- #60 serpent ShaderMaterial clé 5014494f — maps/nuages-v8.js:440 (nuage8Mat) MAPS cpk — lien page/debut-corps.html:195 — propres : #define NUAGE8_INST ; #define USE_INSTANCING ; #define USE_INSTANCING_COLOR
- #62 serpent ShaderMaterial clé ed85b281 — maps/nuages-v8.js:506 (nuage8Solo) MAPS cpk — lien page/debut-corps.html:195

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_COLOR
- #61 serpent ShaderMaterial clé 5ab5932b — maps/nuages-casses.js:126 (nuSkinMat) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING ; #define USE_INSTANCING_COLOR ; #define USE_COLOR
- #140 film ShaderMaterial clé 10c0aaa2 — maps/nuages-casses.js:126 (nuSkinMat) MAPS — lien interface/vignette-moteur.js:315 compileDoux

### DEFINES · 3 programmes · intouchable : non · defines qui diffèrent : #define KERNEL_RADIUS 5 ; #define SIGMA 5 ; #define KERNEL_RADIUS 7 ; #define SIGMA 7 ; #define KERNEL_RADIUS 9 ; #define SIGMA 9
- #68 serpent ShaderMaterial clé 654f019c — rendu/triptyque-bloom.js:370 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 5 ; #define SIGMA 5
- #69 serpent ShaderMaterial clé 4da13eed — rendu/triptyque-bloom.js:370 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 7 ; #define SIGMA 7
- #70 serpent ShaderMaterial clé 3f8d4e35 — rendu/triptyque-bloom.js:370 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 9 ; #define SIGMA 9

### DEFINES · 4 programmes · intouchable : non · defines qui diffèrent : #define KERNEL_RADIUS 3 ; #define SIGMA 3 ; #define KERNEL_RADIUS 5 ; #define SIGMA 5 ; #define KERNEL_RADIUS 7 ; #define SIGMA 7 ; #define KERNEL_RADIUS 9 ; #define SIGMA 9
- #73 serpent ShaderMaterial clé 898311af — rendu/triptyque-bloom.js:482 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 3 ; #define SIGMA 3
- #74 serpent ShaderMaterial clé d31a2213 — rendu/triptyque-bloom.js:482 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 5 ; #define SIGMA 5
- #75 serpent ShaderMaterial clé 9774c10b — rendu/triptyque-bloom.js:482 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 7 ; #define SIGMA 7
- #76 serpent ShaderMaterial clé 52cbec9a — rendu/triptyque-bloom.js:482 — lien page/debut-corps.html:195 — propres : #define KERNEL_RADIUS 9 ; #define SIGMA 9

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING
- #103 serpent ShaderMaterial clé 9ee43967 — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195
- #108 serpent ShaderMaterial clé 202dcaf7 — maps/canyon-relief.js:295 (mk) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING

### DEFINES · 2 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING
- #105 serpent ShaderMaterial clé e08f06bd — maps/canyon-relief.js:296 (mt) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING
- #106 serpent ShaderMaterial clé dbc4e800 — maps/canyon-relief.js:296 (mt) MAPS — lien page/debut-corps.html:195

### DEFINES · 8 programmes · intouchable : tous maps · defines qui diffèrent : #define USE_INSTANCING ; #define PASSE_M ; #define PREPASS ; #define OPAQUE
- #117 serpent ShaderMaterial clé 311f2a65 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define USE_INSTANCING
- #118 serpent ShaderMaterial clé b8217f0a — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PASSE_M ; #define USE_INSTANCING
- #119 serpent ShaderMaterial clé f54231a3 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PREPASS ; #define USE_INSTANCING
- #120 serpent ShaderMaterial clé af278690 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define OPAQUE ; #define USE_INSTANCING
- #122 serpent ShaderMaterial clé 84d80523 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195
- #123 serpent ShaderMaterial clé 3c0fec62 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PASSE_M
- #124 serpent ShaderMaterial clé 0801b998 — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define PREPASS
- #125 serpent ShaderMaterial clé 43d3af8f — maps/jade-2.js:126 (jadeVRMat) MAPS — lien page/debut-corps.html:195 — propres : #define OPAQUE

### DEFINES · 3 programmes · intouchable : non · defines qui diffèrent : #define USE_SPECULARMAP ; #define DOUBLE_SIDED
- #131 serpent MeshPhongMaterial clé 9aff3ae1 — voitures/matieres-forme.js:185 (Object.fonte) — lien page/debut-corps.html:195 — propres : #define USE_SPECULARMAP
- #133 serpent MeshPhongMaterial clé c2a3a64c — voitures/matieres-forme.js:488 (Object.sable) — lien page/debut-corps.html:195 — propres : #define USE_SPECULARMAP ; #define DOUBLE_SIDED
- #135 serpent MeshPhongMaterial clé 9b792bf1 — voitures/matieres-forme.js:492 (Object.soudure) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 3 programmes · intouchable : non · defines qui diffèrent : #define FLAT_SHADED ; #define DOUBLE_SIDED
- #132 serpent MeshPhongMaterial clé 5908453c — voitures/moteurs-themes.js:53 (mat) — lien page/debut-corps.html:195 — propres : #define FLAT_SHADED ; #define DOUBLE_SIDED
- #137 serpent MeshPhongMaterial clé 258eaee7 — voitures/moteurs-themes.js:19 (h5_coccinelle) — lien page/debut-corps.html:195
- #138 serpent MeshPhongMaterial clé 8cb6710e — voitures/moteurs-themes.js:748 (theme30) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED

### DEFINES · 2 programmes · intouchable : non · defines qui diffèrent : #define DOUBLE_SIDED
- #134 serpent MeshPhongMaterial clé 56e0cf70 — voitures/moteurs-originaux.js:16 (poli) — lien page/debut-corps.html:195 — propres : #define DOUBLE_SIDED
- #139 serpent MeshPhongMaterial clé 653469bd — voitures/matieres-forme.js:197 (Object.cristal) — lien page/debut-corps.html:195

### SOURCE · 13 programmes · intouchable : 6 maps / 13
- #18 serpent ShaderMaterial clé e30472cd — voitures/atchoum-feu.js:457 (jetMat) — lien page/debut-corps.html:195
- #27 serpent ShaderMaterial clé f95196cf — maps/orbite-soleil.js:30 MAPS — lien page/debut-corps.html:195
- #33 serpent ShaderMaterial clé 7be8810f — maps/orbite-geants.js:157 MAPS — lien page/debut-corps.html:195
- #63 serpent ShaderMaterial clé 5a6d2833 — rendu/portails.js:83 (pcubeInit) — lien page/debut-corps.html:195
- #66 serpent ShaderMaterial clé 09ddd0b6 — gameplay/fruits-auras.js:569 (fzMat) — lien page/debut-corps.html:195
- #71 serpent ShaderMaterial clé 986aa699 — rendu/triptyque-bloom.js:381 — lien page/debut-corps.html:195
- #86 serpent ShaderMaterial clé 40bc89a7 — interface/burn-out-1.js:71 (burnPool) — lien page/debut-corps.html:195
- #87 serpent ShaderMaterial clé 9e68399d — interface/burn-out-1.js:71 (burnPool) — lien page/debut-corps.html:195
- #99 serpent ShaderMaterial clé 3bcccae0 — maps/ville-embellie.js:32 (villeRaisMat) MAPS cpk — lien page/debut-corps.html:195
- #109 serpent ShaderMaterial clé 8758171a — maps/canyon-embellie.js:19 (cyPousPoints) MAPS — lien page/debut-corps.html:195
- #111 serpent ShaderMaterial clé fcf4b41a — maps/grottes-2.js:320 (grtMats) MAPS — lien page/debut-corps.html:195
- #127 serpent ShaderMaterial clé aa6274df — maps/jade-vol.js:87 MAPS — lien page/debut-corps.html:195
- #142 film ShaderMaterial clé 1dda8a3a — gameplay/fruits-auras.js:336 (zapBuild) — lien interface/vignette-moteur.js:315 compileDoux
  - écart #18/#27 : 11 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#27 ["uniform vec3 uD;uniform vec2 uPx;varying vec2 vQ;","void main(){vQ=position.xy;vec4 c=projectionMatrix*viewMatrix*vec4(cameraPosition+uD*1000.,1.);","if(c.w<=0.){gl_Position=vec4(0.,0.,2.,1.);return;}","gl_Position=c+vec4(position.xy*uPx,0.,0.)*c.w;gl_Position.z=gl_Position.w;}","uniform float uR,uOp;varying vec2 vQ;","void main(){float r=length(vQ)*uR;if(r>uR)discard;"]
  - écart #18/#33 : 7 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#33 ["varying vec2 vU;void main(){vU=position.xy;gl_Position=vec4(position.xy,0.,1.);}","uniform vec3 uCol,uCol2;uniform float uK,uBord,uT;varying vec2 vU;","void main(){float r=length(vU*vec2(1.,.8)),e=smoothstep(.45,1.3,r);","float fl=.8+.2*sin(uT*9.+atan(vU.y,vU.x)*6.)*sin(uT*5.3+r*7.);","gl_FragColor=vec4(uCol*uK*(.7+.3*e)+uCol2*uBord*e*e*fl,1.);}"]
  - écart #18/#63 : 4 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#63 ["varying vec3 vW;varying vec2 vL;void main(){vL=position.xy;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMa","uniform sampler2D uTex;uniform float uT,uHas,uTan,uR,uInvOn,uSat,uDv;uniform vec3 uC1,uC2,uG,uWE,uSh,uHi,uC;uniform vec2 uKC;uniform mat3 uI"]
  - écart #18/#66 : 11 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#66 ["uniform float uT,uG,uPx;attribute vec3 aSeg;varying float vA;varying float vK;","float h(float x){return fract(sin(x*127.1)*43758.5453);}","vec3 pt(float bolt,float stp,float k){float th0=h(bolt*5.1+stp*.37)*6.2832+uT*.9;float th=th0+k*.34;","float zz=(h(k*7.7+bolt*3.3+stp*1.9)-.5);float rr=4.4+zz*1.3+max(0.,k-4.)*1.6;float yy=.7+1.1*k*h(bolt+2.)+(h(k*3.1+bolt*9.+stp)-.5)*1.6;","if(k>4.5)yy+=1.6;return vec3(cos(th)*rr,uG+yy,sin(th)*rr);}","void main(){float bolt=aSeg.x,k=aSeg.y,side=aSeg.z;float stp=floor(uT*13.+bolt*3.7);float on=step(.3,h(bolt*17.1+stp*1.3));"]
  - écart #18/#71 : 4 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#71 ["varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}","varying vec2 vUv;uniform sampler2D t1,t2,t3,t4,t5;uniform vec4 w;uniform float w5,a;void main(){gl_FragColor=vec4(clamp(w.x*textureLod(t1,vU"]
  - écart #18/#87 : 7 lignes ; +#18 ["uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;p.x+=sin(uT*23.+uv.","uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec"] ; +#87 ["attribute vec3 iP;attribute float iA;attribute float iS;attribute float iG;attribute float iSd;attribute vec3 iC;","varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;","varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;","void main(){vec4 mv=modelViewMatrix*vec4(iP,1.);mv.xy+=position.xy*iS;gl_Position=projectionMatrix*mv;vUv=uv;vA=iA;vG=iG;vSd=iSd;vC=iC;vY=iP","void main(){if(vA<.003)discard;vec2 c=floor(vUv*3.);float e=(c.x==1.&&c.y==1.)?1.:.5;gl_FragColor=vec4(vC*e,vA*e);}"]

### SOURCE · 2 programmes · intouchable : non
- #35 serpent ShaderMaterial clé d30e955c — gameplay/pouvoirs-grisants.js:335 — lien page/debut-corps.html:195
- #64 serpent ShaderMaterial clé 83e1b133 — rendu/portails.js:50 (pcubeInit) — lien page/debut-corps.html:195
  - écart #35/#64 : 4 lignes ; +#35 ["attribute float aA;varying vec2 vU;varying float vA;void main(){vU=uv;vA=aA;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4","uniform sampler2D uT;varying vec2 vU;varying float vA;void main(){vec4 c=texture2D(uT,vU);gl_FragColor=vec4(c.rgb,c.a*vA);}"] ; +#64 ["uniform float uT,uAsp;attribute vec3 aC;attribute vec4 aK;varying vec3 vC,vB,vN,vV;varying float vA,vL,vI;vec3 tourne(vec3 v,vec3 a,float s)","uniform vec3 uG;varying vec3 vC,vB,vN,vV;varying float vA,vL,vI;void main(){vec3 q=abs(vB)*2.;float mx=max(q.x,max(q.y,q.z)),mn=min(q.x,min("]

### SOURCE · 2 programmes · intouchable : non
- #14 serpent MeshPhongMaterial clé 2da927d1 — voitures/echappements.js:346 (lpMat) obc cpk — lien page/debut-corps.html:195
- #49 serpent MeshPhongMaterial clé cd66ee39 — voitures/echappements.js:346 (lpMat) obc — lien page/debut-corps.html:195
  - écart #14/#49 : 3 lignes ; +#14 ["uniform float uStuHdr;vec3 fstuHdr(vec3 e){return e*(1.+uStuHdr*4.5*smoothstep(.5,.92,dot(e,vec3(.299,.587,.114))));}","outgoingLight=mix(outgoingLight,fstuHdr(envColor.xyz)*mix(vec3(1.),diffuseColor.rgb,uVern.w),saturate(specularStrength*reflectivity*mix(uVer"] ; +#49 ["outgoingLight=mix(outgoingLight,envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w),saturate(specularStrength*reflectivity*mix(uVern.x,uVern"]

### SOURCE · 3 programmes · intouchable : non
- #56 serpent MeshBasicMaterial clé 72a09116 — rendu/autoroute.js:161 (arLignesMat) obc cpk — lien page/debut-corps.html:195
- #57 serpent MeshBasicMaterial clé 1bcbbf3b — rendu/autoroute.js:183 (arZoneMat) obc cpk — lien page/debut-corps.html:195
- #110 serpent MeshBasicMaterial clé d8b63368 — rendu/autoroute.js:183 (arZoneMat) obc cpk — lien page/debut-corps.html:195
  - écart #56/#57 : 11 lignes ; +#56 ["attribute vec4 aLatQ;attribute float aV;attribute vec4 aK;varying highp float vArV;varying vec4 vArK;vec3 aLat;uniform float uPx9,uRas9,uAA9","aLat=aLatQ.xyz*(aLatQ.w*.5);vArV=aV;vArK=aK;","{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z),p9=uAA9*uPx9*d9;vE9=dot(aLat,vec3(.31,.83,.47))<0.?-1.:1","uniform vec3 uArPal[7];uniform float uArTrav,uArNuit;varying highp float vArV;varying vec4 vArK;","varying float vK9,vE9,vF9;uniform float uAA9;","{float k9=floor(vArK.x*255.+.5),cd=mod(k9,4.),ci=floor(k9/4.),per=cd>2.5?36.:12.;highp float t=vArV/per;float w=max(fwidth(t),uArTrav/per);f"] ; +#57 ["attribute vec4 aI;varying highp vec4 vArI;","vArI=aI;","uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;","{float xm=vArI.x*vArI.y;highp float t=(vArI.z-abs(xm))/7.;float c=arPulse(t,0.,.07,max(fwidth(t),uArTrav/7.));diffuseColor=vec4(uArC*(1.-.4*"]
  - écart #56/#110 : 11 lignes ; +#56 ["attribute vec4 aLatQ;attribute float aV;attribute vec4 aK;varying highp float vArV;varying vec4 vArK;vec3 aLat;uniform float uPx9,uRas9,uAA9","aLat=aLatQ.xyz*(aLatQ.w*.5);vArV=aV;vArK=aK;","{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z),p9=uAA9*uPx9*d9;vE9=dot(aLat,vec3(.31,.83,.47))<0.?-1.:1","uniform vec3 uArPal[7];uniform float uArTrav,uArNuit;varying highp float vArV;varying vec4 vArK;","varying float vK9,vE9,vF9;uniform float uAA9;","{float k9=floor(vArK.x*255.+.5),cd=mod(k9,4.),ci=floor(k9/4.),per=cd>2.5?36.:12.;highp float t=vArV/per;float w=max(fwidth(t),uArTrav/per);f"] ; +#110 ["attribute vec4 aI;varying highp vec4 vArI;","vArI=aI;","uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;","{highp float t=vArI.z/.55;float c=arPulse(t,0.,.5,max(fwidth(t),uArTrav/.55));diffuseColor=vec4(uArC,c*vArI.w);}"]
  - écart #57/#110 : 2 lignes ; +#57 ["{float xm=vArI.x*vArI.y;highp float t=(vArI.z-abs(xm))/7.;float c=arPulse(t,0.,.07,max(fwidth(t),uArTrav/7.));diffuseColor=vec4(uArC*(1.-.4*"] ; +#110 ["{highp float t=vArI.z/.55;float c=arPulse(t,0.,.5,max(fwidth(t),uArTrav/.55));diffuseColor=vec4(uArC,c*vArI.w);}"]

### SOURCE · 2 programmes · intouchable : non
- #79 serpent ShaderMaterial clé 61714fcc — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
- #82 serpent ShaderMaterial clé 264170e1 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
  - écart #79/#82 : 8 lignes ; +#79 ["uniform float uBasTr;","void main(){gl_FragColor=vec4(villeLisse(vDir,vec3(0.))+vec3(cielTrame()*uBasTr),1.);}"] ; +#82 ["uniform sampler2D uBasTex;uniform vec2 uBasInv;uniform float uBasRe;varying vec4 vBas;vec2 basUV(){return uBasRe>.5&&vBas.w>1e-4?clamp(vBas.","void main(){","vec3 c=texture2D(uBasTex,basUV()).rgb;","villeFin(c,vDir);","float yv=vDir.y-uVilleY;if(yv>-.1&&yv<.42)villeSkyline(c,vDir,atan(vDir.x,-vDir.z));","c+=vec3(cielTrame());gl_FragColor=vec4(c,1.);}"]

### SOURCE · 2 programmes · intouchable : non
- #80 serpent ShaderMaterial clé 892b5e41 — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
- #84 serpent ShaderMaterial clé 867388ef — rendu/scene-ciel.js:956 (mk) — lien page/debut-corps.html:195
  - écart #80/#84 : 3 lignes ; +#80 ["uniform float uBasTr;","void main(){gl_FragColor=vec4(jadeCiel(vDir)+vec3(cielTrame()*uBasTr),1.);}"] ; +#84 ["void main(){gl_FragColor=vec4(jadeCiel(vDir)+vec3(cielTrame()),1.);}"]

### SOURCE · 2 programmes · intouchable : tous maps
- #93 serpent MeshBasicMaterial clé 1bdc679e — maps/ville-v3.js:302 (villeMatToursLoin) MAPS obc cpk — lien page/debut-corps.html:195
- #97 serpent MeshBasicMaterial clé dd3b9dfb — maps/ville-v3.js:314 (villeMatNeonLoin) MAPS cpk — lien page/debut-corps.html:195
  - écart #93/#97 : 10 lignes ; +#93 ["#ifdef USE_INSTANCING","#endif","#endif","#else","varying float vB9;varying vec3 vW9;","#ifdef USE_FOG"] ; +#97 []

### SOURCE · 2 programmes · intouchable : non
- #115 serpent MeshBasicMaterial clé d1d3aa02 — interface/vignette-moteur.js:93 — lien page/debut-corps.html:195
- #116 serpent MeshBasicMaterial clé 3698c68c — interface/vignette-moteur.js:107 obc cpk — lien page/debut-corps.html:195
  - écart #115/#116 : 2 lignes ; +#115 [] ; +#116 ["uniform float uClipY;","if(gl_FragCoord.y<uClipY)discard;"]

## Tous les programmes

| # | t ms | phase | type | nom | origine | maps | clé | corps | defs |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 1545 | serpent | ShaderMaterial |  | maps/nuages-embellie.js:47 | INTOUCHABLE | 66dcc104 | 9f9a7400 | a9ee9e62 |
| 1 | 1678 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | f236f9bc | df4a1fae | 6a9d40c5 |
| 2 | 1679 | serpent | MeshBasicMaterial |  | rendu/soleil-planete.js:282 |  | c7ce67bc | f3c08280 | aef11fd8 |
| 3 | 1679 | serpent | MeshBasicMaterial |  | rendu/soleil-planete.js:316 |  | 58eff297 | b0cf48fd | a4924a88 |
| 4 | 1680 | serpent | ShaderMaterial |  | maps/orbite-saturne.js:53 | INTOUCHABLE | 9f547214 | 9e1676d2 | a9ee9e62 |
| 5 | 1680 | serpent | MeshBasicMaterial |  | rendu/triptyque-bloom.js:522 |  | eaa6d353 | 2c1f539f | b198cc2b |
| 6 | 1680 | serpent | ShaderMaterial |  | maps/jade-vol.js:108 | INTOUCHABLE | 3e3ff013 | 8bd23891 | a9ee9e62 |
| 7 | 1680 | serpent | ShaderMaterial |  | maps/continuite.js:367 | INTOUCHABLE | e00b5ea2 | 8fd8e4f2 | a9ee9e62 |
| 8 | 1680 | serpent | ShaderMaterial |  | maps/orbite-1.js:170 | INTOUCHABLE | 33aff991 | 3d1cf5fc | 1c0c1121 |
| 9 | 1681 | serpent | ShaderMaterial |  | maps/orbite-1.js:236 | INTOUCHABLE | 0cac4f5f | 3d1cf5fc | 69568f13 |
| 10 | 1681 | serpent | ShaderMaterial |  | maps/orbite-lune.js:28 | INTOUCHABLE | 5e472de1 | 7d4af2b4 | a9ee9e62 |
| 11 | 1681 | serpent | ShaderMaterial |  | maps/orbite-roches.js:19 | INTOUCHABLE | ee8ace2d | fbf877e5 | 1c0c1121 |
| 12 | 1681 | serpent | MeshBasicMaterial |  | voitures/buildcar.js:399 |  | 1e656fc2 | 2c1f539f | aef11fd8 |
| 13 | 1682 | serpent | MeshPhongMaterial |  | voitures/buildcar.js:104 |  | 6e1c54da | c4ae4b9b | 3800d02d |
| 14 | 1683 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | 2da927d1 | bb58fb38 | 2d7b85d7 |
| 15 | 1684 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | b865d869 | 8be46d99 | b0519a8b |
| 16 | 1684 | serpent | MeshBasicMaterial |  | voitures/ailes.js:127 |  | 6961f7a3 | 4a77e60b | e208bea8 |
| 17 | 1685 | serpent | MeshBasicMaterial |  | voitures/ailes.js:137 |  | 8d1f49b3 | 4a77e60b | b1a9fcd8 |
| 18 | 1685 | serpent | ShaderMaterial |  | voitures/atchoum-feu.js:457 |  | e30472cd | 555b90d8 | a9ee9e62 |
| 19 | 1685 | serpent | SpriteMaterial |  | voitures/atchoum-feu.js:462 |  | 3bd3224e | 13a7d991 | cbd40b2d |
| 20 | 1686 | serpent | MeshPhongMaterial |  | voitures/plaque.js:172 |  | f6ca7c40 | 437836f0 | 25db041a |
| 21 | 1686 | serpent | MeshBasicMaterial |  | voitures/plaque.js:171 |  | 965c88e8 | 2c1f539f | 9de27cf2 |
| 22 | 1687 | serpent | MeshPhongMaterial |  | voitures/shapes-1.js:8 |  | 6d8f2fb0 | c4ae4b9b | 20e84466 |
| 23 | 1687 | serpent | MeshPhongMaterial |  | voitures/buildcar.js:105 |  | b4cff6c4 | 3942530f | 3800d02d |
| 24 | 1688 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:451 | INTOUCHABLE | 3b2c7b5c | 2c1f539f | 78fe96dc |
| 25 | 1688 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:484 | INTOUCHABLE | de3c9347 | 4a77e60b | e77231f9 |
| 26 | 1688 | serpent | MeshBasicMaterial |  | maps/orbite-2.js:485 | INTOUCHABLE | 0a5058ba | 4a77e60b | 8df0f67e |
| 27 | 1688 | serpent | ShaderMaterial |  | maps/orbite-soleil.js:30 | INTOUCHABLE | f95196cf | b46b0aa0 | a9ee9e62 |
| 28 | 1688 | serpent | ShaderMaterial |  | maps/orbite-geants.js:62 | INTOUCHABLE | 2dd0525e | 9d85ba85 | b8ccaad5 |
| 29 | 1689 | serpent | ShaderMaterial |  | maps/orbite-geants.js:81 | INTOUCHABLE | 02dd4a0d | 35dced01 | a9ee9e62 |
| 30 | 1689 | serpent | ShaderMaterial |  | maps/orbite-geants.js:104 | INTOUCHABLE | b30d3456 | fe41abe1 | b93dcc51 |
| 31 | 1689 | serpent | ShaderMaterial |  | maps/orbite-geants.js:126 | INTOUCHABLE | eb22fe32 | e40e5743 | a9ee9e62 |
| 32 | 1689 | serpent | ShaderMaterial |  | maps/orbite-geants.js:151 | INTOUCHABLE | ca7ac208 | 1a131c98 | a9ee9e62 |
| 33 | 1689 | serpent | ShaderMaterial |  | maps/orbite-geants.js:157 | INTOUCHABLE | 7be8810f | a39bd086 | a9ee9e62 |
| 34 | 1690 | serpent | MeshPhongMaterial |  | gameplay/pickups-fruits.js:213 |  | 4ad7b03a | 47db5134 | 2e735cc7 |
| 35 | 1690 | serpent | ShaderMaterial |  | gameplay/pouvoirs-grisants.js:335 |  | d30e955c | 5b660371 | 1c0c1121 |
| 36 | 1690 | serpent | PointsMaterial |  | rendu/tirelire-reserves.js:167 |  | 3b88b612 | 8b671070 | a5722893 |
| 37 | 1690 | serpent | PointsMaterial |  | rendu/tirelire-reserves.js:167 |  | a24d96d7 | cec7056d | a5722893 |
| 38 | 1691 | serpent | ShaderMaterial |  | rendu/tirelire-reserves.js:353 |  | d1516ccd | efbed11f | a9ee9e62 |
| 39 | 1691 | serpent | SpriteMaterial |  | gameplay/impact.js:82 |  | a912bf02 | 13a7d991 | e34fc5df |
| 40 | 1691 | serpent | ShaderMaterial |  | gameplay/impact.js:87 |  | caa8cf81 | 05b427fb | a9ee9e62 |
| 41 | 1691 | serpent | MeshPhongMaterial |  | gameplay/impact.js:117 |  | 2ade5ffc | 437836f0 | 17f8b391 |
| 42 | 1692 | serpent | MeshBasicMaterial |  | son/musique-frenesie.js:555 |  | 2c213412 | 2c1f539f | 66314125 |
| 43 | 1693 | serpent | MeshPhongMaterial |  | gameplay/zones-caisses.js:196 |  | 8ca9d49e | 91ca4021 | 40218391 |
| 44 | 1694 | serpent | MeshPhongMaterial |  | interface/garage-salle.js:60 |  | dbfcbe17 | 2ce72d4d | 59e7e8c1 |
| 45 | 1694 | serpent | MeshLambertMaterial |  | interface/garage-salle.js:8 |  | 56924b5b | 1d4a8450 | 785b7398 |
| 46 | 1695 | serpent | MeshLambertMaterial |  | interface/garage-salle.js:8 |  | 35737f3f | 47e4caab | bc1135f2 |
| 47 | 1696 | serpent | MeshLambertMaterial |  | interface/garage-salle.js:158 |  | 2c026b52 | 2ac0ffe1 | 4ae993ba |
| 48 | 1697 | serpent | MeshBasicMaterial |  | interface/garage-salle.js:9 |  | 1bc033d0 | 4a77e60b | 84d1cc1e |
| 49 | 1698 | serpent | MeshPhongMaterial |  | voitures/echappements.js:346 |  | cd66ee39 | 9973a178 | 2d7b85d7 |
| 50 | 1698 | serpent | PointsMaterial |  | interface/garage-salle.js:563 |  | e49fa1c3 | 94b1a2ad | df454ad4 |
| 51 | 1700 | serpent | MeshPhongMaterial |  | rendu/bitume-beton.js:225 |  | 93a7e4fa | be91ec8d | fc59caaa |
| 52 | 1701 | serpent | MeshLambertMaterial |  | maps/ville-nuit.js:180 | INTOUCHABLE | 414cb2da | 808f02b9 | 5f325ad9 |
| 53 | 1702 | serpent | MeshBasicMaterial |  | moteur/depart-avance.js:319 |  | df79fa58 | 236fd21b | 9a20a609 |
| 54 | 1702 | serpent | MeshBasicMaterial |  | moteur/depart-avance.js:341 |  | 0b53af06 | ee5cb9e4 | 468fd438 |
| 55 | 1702 | serpent | MeshBasicMaterial |  | maps/ville-nuit.js:166 | INTOUCHABLE | 7c4b485e | f6363a4e | 591ae850 |
| 56 | 1703 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:161 |  | 72a09116 | 6550a496 | 9a20a609 |
| 57 | 1703 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:183 |  | 1bcbbf3b | f0e5a54d | 9a20a609 |
| 58 | 1704 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:218 |  | 21af1d1b | ef73269e | 90d4dee1 |
| 59 | 1704 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:205 |  | 673d988b | b746dc5a | 591ae850 |
| 60 | 1704 | serpent | ShaderMaterial |  | maps/nuages-v8.js:440 | INTOUCHABLE | 5014494f | 7997c228 | 8ce95420 |
| 61 | 1705 | serpent | ShaderMaterial |  | maps/nuages-casses.js:126 | INTOUCHABLE | 5ab5932b | c3c87bca | f3e1c548 |
| 62 | 1705 | serpent | ShaderMaterial |  | maps/nuages-v8.js:506 | INTOUCHABLE | ed85b281 | 7997c228 | 28e9deff |
| 63 | 1705 | serpent | ShaderMaterial |  | rendu/portails.js:83 |  | 5a6d2833 | a36ef351 | a9ee9e62 |
| 64 | 1705 | serpent | ShaderMaterial |  | rendu/portails.js:50 |  | 83e1b133 | f8052262 | 1c0c1121 |
| 65 | 1706 | serpent | ShaderMaterial |  | gameplay/fruits-auras.js:168 |  | 6a89cfae | 9ea6e732 | a9ee9e62 |
| 66 | 1706 | serpent | ShaderMaterial |  | gameplay/fruits-auras.js:569 |  | 09ddd0b6 | 3c5f60d4 | a9ee9e62 |
| 67 | 1706 | serpent | ShaderMaterial |  | gameplay/fruits-auras.js:548 |  | 895095ac | d5568115 | a9ee9e62 |
| 68 | 1707 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:370 |  | 654f019c | 6db6f83a | c23816bf |
| 69 | 1707 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:370 |  | 4da13eed | 6db6f83a | 7ef02d2f |
| 70 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:370 |  | 3f8d4e35 | 6db6f83a | f9ed0436 |
| 71 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:381 |  | 986aa699 | 8ad01b09 | a9ee9e62 |
| 72 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:468 |  | d17617e1 | 1ed87182 | 73b30a80 |
| 73 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:482 |  | 898311af | 6d392734 | a8e4b2a6 |
| 74 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:482 |  | d31a2213 | 6d392734 | 1b2fad57 |
| 75 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:482 |  | 9774c10b | 6d392734 | 8812dc89 |
| 76 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:482 |  | 52cbec9a | 6d392734 | 9d55e258 |
| 77 | 1708 | serpent | ShaderMaterial |  | rendu/triptyque-bloom.js:398 |  | a8e7154a | 611f7d79 | a9ee9e62 |
| 78 | 1709 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 99fe3eb1 | b3ca838e | 43f767df |
| 79 | 1709 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 61714fcc | 17f79730 | c378ee14 |
| 80 | 1709 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 892b5e41 | ecd5dec6 | c378ee14 |
| 81 | 1709 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 9fc7e4a4 | 15e182a0 | c378ee14 |
| 82 | 1709 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 264170e1 | 7e0ba11d | c378ee14 |
| 83 | 1709 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | fc156793 | 8ad4ef25 | c378ee14 |
| 84 | 1710 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 867388ef | 57001a80 | c378ee14 |
| 85 | 1710 | serpent | ShaderMaterial |  | rendu/scene-ciel.js:956 |  | 9d2714fa | e5d524d1 | c378ee14 |
| 86 | 2930 | serpent | ShaderMaterial |  | interface/burn-out-1.js:71 |  | 40bc89a7 | f5e5eab7 | a9ee9e62 |
| 87 | 2931 | serpent | ShaderMaterial |  | interface/burn-out-1.js:71 |  | 9e68399d | 7996edbe | a9ee9e62 |
| 88 | 2972 | serpent | ShaderMaterial |  | maps/nuages-casses.js:15 | INTOUCHABLE | 071d9dfd | 292a990b | f3e1c548 |
| 89 | 2975 | serpent | MeshPhongMaterial |  | maps/nuages-coton.js:81 | INTOUCHABLE | 1a424a62 | 91ca4021 | efb299f0 |
| 90 | 2977 | serpent | MeshPhongMaterial |  | maps/nuages-coton.js:78 | INTOUCHABLE | b9c30914 | 91ca4021 | 9fcecfa5 |
| 91 | 3027 | serpent | MeshDepthMaterial |  | voitures/moba-ombre.js:80 |  | 5a3bb566 | e2b00b93 | fdd63250 |
| 92 | 3216 | serpent | MeshLambertMaterial |  | maps/ville-v3.js:147 | INTOUCHABLE | bd6e9b86 | 2a6e4da7 | 0fe46759 |
| 93 | 3216 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:302 | INTOUCHABLE | 1bdc679e | b9b865a4 | cfac21f5 |
| 94 | 3218 | serpent | MeshLambertMaterial |  | maps/ville-verre.js:385 | INTOUCHABLE | d9c16bb8 | 4967d0fa | 0fe46759 |
| 95 | 3218 | serpent | MeshBasicMaterial |  | maps/ville-verre.js:426 | INTOUCHABLE | 442362b0 | cf35f8a9 | 2c25d5e6 |
| 96 | 3218 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:258 | INTOUCHABLE | 5a4c0091 | 6229e453 | 2c25d5e6 |
| 97 | 3219 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:314 | INTOUCHABLE | dd3b9dfb | 4a77e60b | cfac21f5 |
| 98 | 3219 | serpent | MeshBasicMaterial |  | maps/ville-v3.js:356 | INTOUCHABLE | 584269a1 | 4cd1b0c2 | fc1068ae |
| 99 | 3219 | serpent | ShaderMaterial |  | maps/ville-embellie.js:32 | INTOUCHABLE | 3bcccae0 | cce446d1 | a9ee9e62 |
| 100 | 3262 | serpent | MeshPhongMaterial |  | economie/final-spin.js:187 |  | 1673bbc4 | 3942530f | 8d02272f |
| 101 | 3263 | serpent | SpriteMaterial |  | economie/final-spin.js:191 |  | a21582ff | 3450fbec | ce4cab2c |
| 102 | 3374 | serpent | ShaderMaterial |  | maps/canyon-relief.js:152 | INTOUCHABLE | 9d7b9233 | cfa70355 | d0f0dfcb |
| 103 | 3374 | serpent | ShaderMaterial |  | maps/canyon-relief.js:295 | INTOUCHABLE | 9ee43967 | ef2ac4e8 | d0f0dfcb |
| 104 | 3374 | serpent | ShaderMaterial |  | maps/canyon-relief.js:318 | INTOUCHABLE | 24672436 | 2ab8d69f | d0f0dfcb |
| 105 | 3374 | serpent | ShaderMaterial |  | maps/canyon-relief.js:296 | INTOUCHABLE | e08f06bd | 99dc3011 | 0b10c98f |
| 106 | 3374 | serpent | ShaderMaterial |  | maps/canyon-relief.js:296 | INTOUCHABLE | dbc4e800 | 99dc3011 | 6dab988e |
| 107 | 3375 | serpent | MeshBasicMaterial |  | maps/canyon-relief.js:417 | INTOUCHABLE | 7bd4ab66 | 4a77e60b | 7b74f249 |
| 108 | 3375 | serpent | ShaderMaterial |  | maps/canyon-relief.js:295 | INTOUCHABLE | 202dcaf7 | ef2ac4e8 | d117bbae |
| 109 | 3376 | serpent | ShaderMaterial |  | maps/canyon-embellie.js:19 | INTOUCHABLE | 8758171a | 7448231f | a9ee9e62 |
| 110 | 3423 | serpent | MeshBasicMaterial |  | rendu/autoroute.js:183 |  | d8b63368 | 0ef32d1a | 9a20a609 |
| 111 | 3446 | serpent | ShaderMaterial |  | maps/grottes-2.js:320 | INTOUCHABLE | fcf4b41a | 04c6dd5c | a9ee9e62 |
| 112 | 3447 | serpent | ShaderMaterial |  | maps/grottes-2.js:318 | INTOUCHABLE | ddfafa8d | 03806aec | d0f0dfcb |
| 113 | 3489 | serpent | MeshBasicMaterial |  | rendu/traces-pneus.js:28 |  | 529cbe71 | 4a77e60b | 575a8f50 |
| 114 | 3491 | serpent | MeshLambertMaterial |  | maps/pigeons.js:7 | INTOUCHABLE | 32dce317 | 47e4caab | 120bea1e |
| 115 | 3535 | serpent | MeshBasicMaterial |  | interface/vignette-moteur.js:93 |  | d1d3aa02 | 2c1f539f | 8a113131 |
| 116 | 3536 | serpent | MeshBasicMaterial |  | interface/vignette-moteur.js:107 |  | 3698c68c | a8d1b7bf | 8a113131 |
| 117 | 3556 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 311f2a65 | 2e4f08d9 | d117bbae |
| 118 | 3556 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | b8217f0a | 2e4f08d9 | 5c9e0c1a |
| 119 | 3557 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | f54231a3 | 2e4f08d9 | ac3b1f90 |
| 120 | 3557 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | af278690 | 2e4f08d9 | b3ee7a30 |
| 121 | 3579 | serpent | ShaderMaterial |  | maps/jade-2.js:134 | INTOUCHABLE | fbf78699 | 61045ff4 | d117bbae |
| 122 | 3579 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 84d80523 | 2e4f08d9 | d0f0dfcb |
| 123 | 3579 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 3c0fec62 | 2e4f08d9 | 6f80ee0d |
| 124 | 3579 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 0801b998 | 2e4f08d9 | d08deed4 |
| 125 | 3612 | serpent | ShaderMaterial |  | maps/jade-2.js:126 | INTOUCHABLE | 43d3af8f | 2e4f08d9 | 930fd4ea |
| 126 | 3613 | serpent | ShaderMaterial |  | maps/jade-2.js:226 | INTOUCHABLE | 6d598784 | 0657ede7 | d0f0dfcb |
| 127 | 3613 | serpent | ShaderMaterial |  | maps/jade-vol.js:87 | INTOUCHABLE | aa6274df | 73bb4a88 | a9ee9e62 |
| 128 | 3613 | serpent | ShaderMaterial |  | maps/jade-2.js:251 | INTOUCHABLE | 78c2de12 | a083fb6d | d117bbae |
| 129 | 3631 | serpent | MeshLambertMaterial |  | maps/jade-vol.js:236 | INTOUCHABLE | 9906931b | 47e4caab | fd1a3eb6 |
| 130 | 3632 | serpent | MeshLambertMaterial |  | maps/jade-vol.js:333 | INTOUCHABLE | 418f9504 | 47e4caab | 2357a7db |
| 131 | 3722 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:185 |  | 9aff3ae1 | cdae43c9 | 31bc8d6b |
| 132 | 3724 | serpent | MeshPhongMaterial |  | voitures/moteurs-themes.js:53 |  | 5908453c | 794138c7 | cf726dd4 |
| 133 | 3775 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:488 |  | c2a3a64c | cdae43c9 | c50a37fb |
| 134 | 3776 | serpent | MeshPhongMaterial |  | voitures/moteurs-originaux.js:16 |  | 56e0cf70 | 21cf3dbf | 425ab151 |
| 135 | 3777 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:492 |  | 9b792bf1 | cdae43c9 | 6a368e7d |
| 136 | 3777 | serpent | MeshBasicMaterial |  | voitures/moteurs-originaux.js:29 |  | 45d4c385 | 4a77e60b | cc488ef1 |
| 137 | 3825 | serpent | MeshPhongMaterial |  | voitures/moteurs-themes.js:19 |  | 258eaee7 | 794138c7 | 1423b5ac |
| 138 | 4100 | serpent | MeshPhongMaterial |  | voitures/moteurs-themes.js:748 |  | 8cb6710e | 794138c7 | be28e390 |
| 139 | 4270 | serpent | MeshPhongMaterial |  | voitures/matieres-forme.js:197 |  | 653469bd | 21cf3dbf | 89ee329c |
| 140 | 9947 | film | ShaderMaterial |  | maps/nuages-casses.js:126 | INTOUCHABLE | 10c0aaa2 | c3c87bca | e8477b45 |
| 141 | 9948 | film | ShaderMaterial |  | gameplay/fruits-auras.js:334 |  | 52a73620 | d397193e | a9ee9e62 |
| 142 | 9948 | film | ShaderMaterial |  | gameplay/fruits-auras.js:336 |  | 1dda8a3a | f43ded17 | a9ee9e62 |
| 143 | 9948 | film | ShaderMaterial |  | gameplay/fruits-auras.js:294 |  | b407f0e9 | 5cd98d7f | a9ee9e62 |
