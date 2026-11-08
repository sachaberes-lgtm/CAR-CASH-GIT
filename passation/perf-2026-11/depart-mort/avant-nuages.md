# Départ et mort — profil des fenêtres de 3 s (nuages:midi, CPU ×4, charge machine 45)

| fenêtre | pire image (ms) | images > 100 ms | programmes liés | occupé (ms) | postes principaux (inclusif ms) |
|---|---|---|---|---|---|
| JOUER (3 s) | 1600 | 3 | 0 | 2704 | newTrack / piste 75, départ d'avance 76, chauffe niveau / divers 34, rendu three 1154, GC / natif 529 |
| MORT 1 (3 s) | 833 | 2 | 0 | 2977 | départ d'avance 661, rendu three 973, photos / vignettes 335, GC / natif 691 |
| ÉCRAN DE MORT 1 (3 s, 8 s après) | 617 | 2 | 0 | 2225 | rendu three 419, photos / vignettes 507, GC / natif 1296 |
| REJOUER 1 (3 s) | 783 | 3 | 0 | 2434 | newTrack / piste 176, départ d'avance 176, chauffe niveau / divers 25, resetGame 200, rendu three 603, photos / vignettes 80, GC / natif 1176 |
| MORT 2 (3 s) | 450 | 2 | 0 | 2235 | départ d'avance 191, rendu three 275, photos / vignettes 38, GC / natif 1641 |
| ÉCRAN DE MORT 2 (3 s, 8 s après) | 733 | 2 | 0 | 2434 | rendu three 485, photos / vignettes 534, GC / natif 1351 |
| REJOUER 2 (3 s) | 583 | 3 | 0 | 2457 | newTrack / piste 87, départ d'avance 87, chauffe niveau / divers 188, resetGame 132, rendu three 552, photos / vignettes 148, GC / natif 1365 |
| MORT 3 (3 s) | 967 | 2 | 1 | 2923 | départ d'avance 843, rendu three 495, photos / vignettes 248, GC / natif 1058 |
| ÉCRAN DE MORT 3 (3 s, 8 s après) | 950 | 1 | 0 | 2606 | rendu three 729, photos / vignettes 902, GC / natif 924 |

## JOUER (3 s)

Top inclusif : `loop` 2034 (index.html:83269), `render` 1154 (three.min.js:6), `renderer.render` 1117 (index.html:50628), `Rt` 606 (three.min.js:6), `renderBufferDirect` 597 (three.min.js:6), `Ct` 596 (three.min.js:6), `garageRender` 396 (index.html:79512), `It` 392 (three.min.js:6), `chuteRender` 346 (index.html:77809), `At` 177 (three.min.js:6), `(anonyme)` 162 (index.html:59696), `Cr.upload` 151 (three.min.js:6), `traverseVisible` 122 (three.min.js:6), `setup` 100 (three.min.js:6), `sm.render` 96 (index.html:47858), `menuCull` 87 (index.html:83096)

Top propre : `(program)` 529 (:0), `(idle)` 324 (:0), `loop` 144 (index.html:83269), `It` 118 (three.min.js:6), `traverseVisible` 87 (three.min.js:6), `At` 77 (three.min.js:6), `render` 66 (three.min.js:6), `menuCadre` 64 (index.html:75916), `renderBufferDirect` 63 (three.min.js:6), `(anonyme)` 57 (index.html:59696)

LoAF : 1612 ms [] ; 246 ms [FrameRequestCallback loop 210ms (forcé 0)] ; 197 ms [FrameRequestCallback loop 176ms (forcé 13)]

## MORT 1 (3 s)

Top inclusif : `loop` 2204 (index.html:83269), `render` 973 (three.min.js:6), `renderer.render` 948 (index.html:50628), `(anonyme)` 678 (three.min.js:6), `prebDepTick` 661 (index.html:19064), `prebTick` 658 (), `prebAvec` 651 (index.html:18858), `prebTravaille` 651 (), `prebJob` 600 (index.html:18916), `Rt` 553 (three.min.js:6), `renderBufferDirect` 543 (three.min.js:6), `Ct` 541 (three.min.js:6), `pisteRoute` 476 (index.html:19119), `engVigRender` 335 (index.html:51025), `It` 330 (three.min.js:6), `Cr.upload` 237 (three.min.js:6)

Top propre : `(program)` 691 (:0), `(idle)` 229 (:0), `Er.setValue` 167 (three.min.js:6), `pisteRoute` 164 (index.html:19119), `engVigRender` 136 (index.html:51025), `renderBufferDirect` 121 (three.min.js:6), `getBufferSubData` 100 (:0), `update` 99 (three.min.js:6), `loop` 96 (index.html:83269), `genCanyon` 91 (index.html:21588)

LoAF : 837 ms [] ; 140 ms [FrameRequestCallback loop 102ms (forcé 34)]

## ÉCRAN DE MORT 1 (3 s, 8 s après)

Top inclusif : `loop` 925 (), `engVigRender` 507 (index.html:51025), `render` 419 (three.min.js:6), `renderer.render` 419 (), `engLit` 347 (index.html:50418), `At` 222 (three.min.js:6), `update` 221 (three.min.js:6), `fenceSync` 160 (:0), `get` 156 (three.min.js:6), `getBufferSubData` 110 (:0), `Rt` 101 (three.min.js:6), `renderBufferDirect` 101 (), `Ct` 98 (three.min.js:6), `It` 94 (three.min.js:6), `Cr.setValue` 75 (three.min.js:6), `Yi` 65 (three.min.js:6)

Top propre : `(program)` 1296 (:0), `(idle)` 896 (:0), `fenceSync` 160 (:0), `get` 156 (three.min.js:6), `engVigRender` 132 (index.html:51025), `getBufferSubData` 110 (:0), `update` 61 (three.min.js:6), `Gi` 60 (three.min.js:6), `traverseVisible` 52 (three.min.js:6), `engLit` 35 (index.html:50418)

LoAF : 632 ms [FrameRequestCallback loop 15ms (forcé 1)] ; 122 ms [] ; 81 ms [] ; 149 ms []

## REJOUER 1 (3 s)

Top inclusif : `loop` 761 (index.html:83269), `renderer.render` 603 (index.html:50628), `render` 602 (three.min.js:6), `scene.onBeforeRender` 381 (), `sel` 376 (index.html:22284), `cySelect` 376 (), `wipePxDraw` 258 (index.html:52657), `wipePxLoop` 258 (), `(anonyme)` 220 (:1), `resetGame` 200 (), `newTrack0G` 176 (), `newTrackG` 176 (), `newTrack` 176 (), `prebDepPrend` 176 (), `buildTrackG` 170 (), `cyMonuments` 127 (index.html:22829)

Top propre : `(program)` 1176 (:0), `(idle)` 658 (:0), `sel` 376 (index.html:22284), `wipePxDraw` 235 (index.html:52657), `noiseBuf` 51 (index.html:63722), `render` 40 (three.min.js:6), `getBufferSubData` 33 (:0), `M` 30 (three.min.js:6), `engVigRender` 22 (index.html:51025), `fillRect` 22 (:0)

LoAF : 526 ms [] ; 250 ms [TimerHandler:setTimeout  216ms (forcé 0) | FrameRequestCallback loop 22ms (forcé 0)] ; 801 ms []

## MORT 2 (3 s)

Top inclusif : `loop` 553 (index.html:83269), `render` 275 (three.min.js:6), `renderer.render` 275 (index.html:50628), `prebDepTick` 191 (index.html:19064), `prebTick` 188 (), `(anonyme)` 182 (three.min.js:6), `prebJob` 155 (index.html:18916), `prebAvec` 155 (), `prebTravaille` 155 (), `pisteRoute` 151 (index.html:19119), `Ct` 137 (), `Rt` 137 (), `renderBufferDirect` 136 (three.min.js:6), `It` 131 (three.min.js:6), `useProgram` 91 (three.min.js:6), `At` 44 ()

Top propre : `(program)` 1641 (:0), `(idle)` 817 (:0), `useProgram` 91 (three.min.js:6), `(anonyme)` 60 (three.min.js:6), `pisteRoute` 53 (index.html:19119), `renderer.render` 49 (index.html:50628), `setFromRotationMatrix` 42 (three.min.js:6), `(garbage collector)` 27 (:0), `rythmeMesure` 25 (index.html:17470), `putImageData` 21 (:0)

LoAF : 469 ms [] ; 211 ms []

## ÉCRAN DE MORT 2 (3 s, 8 s après)

Top inclusif : `loop` 991 (index.html:83269), `engVigRender` 534 (index.html:51025), `render` 485 (three.min.js:6), `renderer.render` 484 (index.html:50628), `engLit` 329 (), `renderBufferDirect` 302 (three.min.js:6), `Rt` 298 (three.min.js:6), `Ct` 292 (), `getBufferSubData` 275 (:0), `It` 243 (three.min.js:6), `Cr.upload` 160 (three.min.js:6), `Wi` 125 (three.min.js:6), `engVigRendRT` 75 (index.html:50509), `Cr.setValue` 73 (three.min.js:6), `(garbage collector)` 67 (:0), `At` 58 (three.min.js:6)

Top propre : `(program)` 1351 (:0), `(idle)` 1020 (:0), `getBufferSubData` 275 (:0), `engVigRender` 126 (index.html:51025), `Wi` 119 (three.min.js:6), `(garbage collector)` 67 (:0), `Cr.setValue` 57 (three.min.js:6), `transformDirection` 48 (three.min.js:6), `At` 25 (three.min.js:6), `engPose` 22 (index.html:50416)

LoAF : 746 ms [] ; 111 ms [] ; 160 ms [FrameRequestCallback loop 30ms (forcé 5)]

## REJOUER 2 (3 s)

Top inclusif : `loop` 915 (index.html:83269), `render` 552 (three.min.js:6), `renderer.render` 531 (index.html:50628), `(anonyme)` 375 (three.min.js:6), `At` 223 (three.min.js:6), `Rt` 216 (three.min.js:6), `renderBufferDirect` 214 (three.min.js:6), `update` 213 (three.min.js:6), `Ct` 209 (), `Q.<computed>` 189 (:6), `chauffeRendu` 188 (), `It` 172 (three.min.js:6), `engVigRender` 148 (index.html:51025), `resetGame` 132 (), `bufferData` 130 (:0), `pluieCaisseTick` 113 (index.html:61346)

Top propre : `(program)` 1365 (:0), `(idle)` 555 (:0), `bufferData` 130 (:0), `expandByObject` 108 (three.min.js:6), `engVigRender` 105 (index.html:51025), `It` 73 (three.min.js:6), `scene.updateMatrixWorld` 69 (index.html:12374), `Q.<computed>` 59 (:6), `(anonyme)` 49 (three.min.js:6), `getBufferSubData` 33 (:0)

LoAF : 592 ms [FrameRequestCallback loop 27ms (forcé 5)] ; 172 ms [TimerHandler:setTimeout  116ms (forcé 0) | FrameRequestCallback loop 43ms (forcé 0)] ; 164 ms [FrameRequestCallback loop 150ms (forcé 0)] ; 103 ms []

## MORT 3 (3 s)

Top inclusif : `loop` 1753 (index.html:83269), `(anonyme)` 961 (index.html:55225), `prebTick` 844 (index.html:18999), `prebDepTick` 843 (index.html:19064), `prebAvec` 835 (index.html:18858), `prebTravaille` 834 (), `prebJob` 829 (index.html:18916), `pisteRoute` 688 (index.html:19119), `render` 495 (three.min.js:6), `renderer.render` 489 (index.html:50628), `engVigRender` 248 (index.html:51025), `Rt` 227 (three.min.js:6), `renderBufferDirect` 220 (three.min.js:6), `Ct` 218 (three.min.js:6), `psiAt9` 199 (index.html:19205), `genCanyon` 195 (index.html:21588)

Top propre : `(program)` 1058 (:0), `psiAt9` 199 (index.html:19205), `prebJob` 140 (index.html:18916), `pisteRoute` 132 (index.html:19119), `getBufferSubData` 118 (:0), `(idle)` 102 (:0), `engVigRender` 69 (index.html:51025), `getPoint` 68 (three.min.js:6), `drawImage` 55 (:0), `Pt` 50 (three.min.js:6)

LoAF : 972 ms [FrameRequestCallback loop 16ms (forcé 0)] ; 99 ms [FrameRequestCallback loop 70ms (forcé 0)] ; 262 ms [FrameRequestCallback loop 243ms (forcé 85)]

## ÉCRAN DE MORT 3 (3 s, 8 s après)

Top inclusif : `loop` 1656 (index.html:83269), `engVigRender` 902 (index.html:51025), `render` 729 (three.min.js:6), `renderer.render` 716 (index.html:50628), `engLit` 621 (index.html:50418), `getBufferSubData` 455 (:0), `renderBufferDirect` 281 (three.min.js:6), `Rt` 272 (three.min.js:6), `Ct` 269 (three.min.js:6), `scene.updateMatrixWorld` 238 (index.html:12374), `It` 189 (three.min.js:6), `engPose` 151 (index.html:50416), `Cr.upload` 125 (three.min.js:6), `At` 83 (three.min.js:6), `engVigRendRT` 57 (), `sm.render` 54 (index.html:47858)

Top propre : `(program)` 924 (:0), `getBufferSubData` 455 (:0), `(idle)` 400 (:0), `engVigRender` 221 (index.html:51025), `scene.updateMatrixWorld` 219 (index.html:12374), `engPose` 106 (index.html:50416), `putImageData` 45 (:0), `Er.setValue` 40 (three.min.js:6), `renderBufferDirect` 40 (three.min.js:6), `update` 38 (three.min.js:6)

LoAF : 965 ms []
