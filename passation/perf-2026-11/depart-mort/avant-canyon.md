# Départ et mort — profil des fenêtres de 3 s (canyon:midi, CPU ×4, charge machine 39)

| fenêtre | pire image (ms) | images > 100 ms | programmes liés | occupé (ms) | postes principaux (inclusif ms) |
|---|---|---|---|---|---|
| JOUER (3 s) | 817 | 4 | 0 | 1966 | newTrack / piste 374, départ d'avance 374, chauffe niveau / divers 313, rendu three 853, GC / natif 1554 |
| MORT 1 (3 s) | 783 | 1 | 0 | 2365 | départ d'avance 368, rendu three 589, photos / vignettes 188, GC / natif 916 |
| ÉCRAN DE MORT 1 (3 s, 8 s après) | 483 | 1 | 0 | 1849 | rendu three 200, photos / vignettes 967, GC / natif 1223 |
| REJOUER 1 (3 s) | 733 | 2 | 0 | 2234 | newTrack / piste 73, départ d'avance 73, chauffe niveau / divers 78, resetGame 112, rendu three 587, photos / vignettes 207, GC / natif 983 |
| MORT 2 (3 s) | 850 | 3 | 0 | 2920 | départ d'avance 781, rendu three 650, photos / vignettes 338, GC / natif 731 |
| ÉCRAN DE MORT 2 (3 s, 8 s après) | 833 | 1 | 0 | 2368 | rendu three 762, photos / vignettes 675, GC / natif 819 |

## JOUER (3 s)

Top inclusif : `loop` 1686 (index.html:83269), `render` 853 (three.min.js:6), `renderer.render` 838 (), `chuteRender` 550 (index.html:77809), `garageRender` 550 (), `newTrack0G` 374 (), `newTrackG` 374 (), `newTrack` 374 (), `rebuildMenuScene` 374 (), `prebDepPrend` 374 (), `sous9` 374 (), `CHUTE.sous` 374 (), `buildTrackG` 371 (), `sm.render` 334 (), `M` 332 (three.min.js:6), `chauffeRendu` 313 ()

Top propre : `(idle)` 1554 (:0), `M` 332 (three.min.js:6), `(program)` 199 (:0), `contiMap` 114 (index.html:18447), `updatePool` 101 (index.html:63031), `createObjectURL` 90 (:0), `cyNz` 71 (index.html:21793), `update` 70 (three.min.js:6), `lierScene` 62 (index.html:50665), `toArray` 58 (three.min.js:6)

LoAF : 831 ms [] ; 106 ms [FrameRequestCallback loop 20ms (forcé 3)] ; 482 ms [FrameRequestCallback loop 457ms (forcé 0)] ; 139 ms [FrameRequestCallback loop 119ms (forcé 4)] ; 285 ms []

## MORT 1 (3 s)

Top inclusif : `loop` 1392 (index.html:83269), `render` 589 (three.min.js:6), `renderer.render` 552 (index.html:50628), `renderBufferDirect` 428 (three.min.js:6), `(anonyme)` 424 (three.min.js:6), `prebTick` 373 (), `prebAvec` 368 (), `prebTravaille` 368 (), `prebJob` 359 (), `prebDepTick` 314 (index.html:19064), `pisteRoute` 310 (index.html:19119), `sm.render` 257 (), `M` 229 (three.min.js:6), `drawArrays` 216 (:0), `Rt` 212 (three.min.js:6), `Ct` 209 (three.min.js:6)

Top propre : `(program)` 916 (:0), `(idle)` 868 (:0), `pisteRoute` 245 (index.html:19119), `drawArrays` 216 (:0), `toArray` 60 (three.min.js:6), `getBufferSubData` 55 (:0), `leconSilence` 45 (index.html:62282), `drawImage` 41 (:0), `engVigRender` 41 (index.html:51025), `It` 38 (three.min.js:6)

LoAF : 770 ms [] ; 83 ms [FrameRequestCallback loop 60ms (forcé 14)]

## ÉCRAN DE MORT 1 (3 s, 8 s après)

Top inclusif : `loop` 1216 (index.html:83269), `engVigRender` 967 (index.html:51025), `engLit` 649 (index.html:50418), `getBufferSubData` 441 (:0), `render` 200 (three.min.js:6), `renderer.render` 198 (index.html:50628), `Rt` 116 (three.min.js:6), `Ct` 113 (three.min.js:6), `engVigRendRT` 96 (index.html:50509), `renderBufferDirect` 91 (three.min.js:6), `setRenderTarget` 63 (three.min.js:6), `fenceSync` 54 (:0), `It` 53 (three.min.js:6), `engPose` 49 (index.html:50416), `multiplyMatrices` 33 (three.min.js:6), `Cr.upload` 31 (three.min.js:6)

Top propre : `(idle)` 1223 (:0), `(program)` 621 (:0), `getBufferSubData` 441 (:0), `engVigRender` 222 (index.html:51025), `engLit` 104 (index.html:50418), `setRenderTarget` 59 (three.min.js:6), `fenceSync` 54 (:0), `multiplyMatrices` 33 (three.min.js:6), `engPose` 31 (index.html:50416), `cryptoOn` 23 (index.html:27886)

LoAF : 490 ms []

## REJOUER 1 (3 s)

Top inclusif : `loop` 940 (index.html:83269), `renderer.render` 587 (index.html:50628), `render` 567 (three.min.js:6), `(anonyme)` 265 (three.min.js:6), `Rt` 233 (three.min.js:6), `renderBufferDirect` 231 (three.min.js:6), `Ct` 231 (), `At` 224 (three.min.js:6), `engVigRender` 207 (index.html:51025), `engLit` 115 (index.html:50418), `resetGame` 112 (index.html:71401), `(garbage collector)` 111 (:0), `update` 108 (three.min.js:6), `intersectsObject` 108 (three.min.js:6), `Q.<computed>` 98 (:6), `getBufferSubData` 97 (:0)

Top propre : `(program)` 983 (:0), `(idle)` 948 (:0), `(garbage collector)` 111 (:0), `intersectsObject` 107 (three.min.js:6), `getBufferSubData` 97 (:0), `bufferData` 92 (:0), `renderBufferDirect` 72 (three.min.js:6), `nxfDessine` 56 (index.html:82954), `copy` 40 (three.min.js:6), `engVigRender` 38 (index.html:51025)

LoAF : 756 ms [FrameRequestCallback loop 17ms (forcé 1)] ; 263 ms [TimerHandler:setTimeout  133ms (forcé 0) | FrameRequestCallback loop 95ms (forcé 0)] ; 97 ms [FrameRequestCallback loop 76ms (forcé 0)]

## MORT 2 (3 s)

Top inclusif : `loop` 1998 (index.html:83269), `(anonyme)` 883 (three.min.js:6), `prebTick` 784 (index.html:18999), `prebDepTick` 781 (), `prebTravaille` 768 (index.html:18935), `prebAvec` 764 (index.html:18858), `prebJob` 733 (index.html:18916), `pisteRoute` 659 (index.html:19119), `render` 650 (three.min.js:6), `renderer.render` 639 (index.html:50628), `Rt` 363 (three.min.js:6), `Ct` 351 (three.min.js:6), `renderBufferDirect` 340 (three.min.js:6), `engVigRender` 338 (index.html:51025), `genForet` 331 (index.html:19617), `forPelote` 271 (index.html:19651)

Top propre : `(program)` 731 (:0), `forPelote` 145 (index.html:19651), `getBufferSubData` 144 (:0), `pisteRoute` 119 (index.html:19119), `(idle)` 112 (:0), `engVigRender` 73 (index.html:51025), `prebJob` 69 (index.html:18916), `getPoint` 58 (three.min.js:6), `renderBufferDirect` 56 (three.min.js:6), `(anonyme)` 55 (three.min.js:6)

LoAF : 856 ms [FrameRequestCallback loop 21ms (forcé 0)] ; 81 ms [FrameRequestCallback loop 38ms (forcé 0)] ; 143 ms [FrameRequestCallback loop 130ms (forcé 0)] ; 186 ms [FrameRequestCallback loop 163ms (forcé 77)]

## ÉCRAN DE MORT 2 (3 s, 8 s après)

Top inclusif : `loop` 1516 (index.html:83269), `render` 762 (three.min.js:6), `renderer.render` 755 (index.html:50628), `engVigRender` 675 (index.html:51025), `engLit` 433 (index.html:50418), `Rt` 409 (three.min.js:6), `renderBufferDirect` 399 (three.min.js:6), `Ct` 394 (three.min.js:6), `getBufferSubData` 329 (:0), `It` 199 (three.min.js:6), `At` 115 (three.min.js:6), `setup` 102 (three.min.js:6), `engPose` 98 (index.html:50416), `Cr.upload` 93 (three.min.js:6), `(anonyme)` 91 (three.min.js:6), `engVigRendRT` 65 (index.html:50509)

Top propre : `(program)` 819 (:0), `(idle)` 637 (:0), `getBufferSubData` 329 (:0), `engVigRender` 174 (index.html:51025), `renderBufferDirect` 75 (three.min.js:6), `putImageData` 52 (:0), `engPose` 46 (index.html:50416), `loop` 45 (index.html:83269), `updateMatrixWorld` 44 (three.min.js:6), `update` 39 (three.min.js:6)

LoAF : 846 ms [] ; 89 ms [FrameRequestCallback loop 84ms (forcé 10)]
