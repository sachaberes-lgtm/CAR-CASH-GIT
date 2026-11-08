# Départ et mort — profil des fenêtres de 3 s (nuages:midi, CPU ×4, charge machine 111)

| fenêtre | pire image (ms) | images > 100 ms | programmes liés | occupé (ms) | postes principaux (inclusif ms) |
|---|---|---|---|---|---|
| JOUER (3 s) | 1700 | 1 | 0 | 2357 | rendu three 1065, GC / natif 804 |
| MORT 1 (3 s) | 533 | 4 | 0 | 3192 | départ d'avance 892, rendu three 348, photos / vignettes 63, mort / explosion 25, GC / natif 1496 |
| ÉCRAN DE MORT 1 (3 s, 8 s après) | 667 | 2 | 0 | 2285 | rendu three 529, photos / vignettes 717, GC / natif 1052 |
| REJOUER 1 (3 s) | 367 | 5 | 0 | 2533 | newTrack / piste 105, départ d'avance 105, resetGame 120, rendu three 203, photos / vignettes 992, GC / natif 1128 |
| MORT 2 (3 s) | 583 | 5 | 0 | 4224 | départ d'avance 508, rendu three 344, HUD 606, photos / vignettes 1001, GC / natif 1361 |
| ÉCRAN DE MORT 2 (3 s, 8 s après) | 750 | 2 | 0 | 1800 | rendu three 381, photos / vignettes 999, GC / natif 1488 |
| REJOUER 2 (3 s) | 533 | 3 | 0 | 1835 | newTrack / piste 114, départ d'avance 114, chauffe niveau / divers 120, resetGame 129, rendu three 241, son (décodage, bus) 50, photos / vignettes 561, GC / natif 1461 |
| MORT 3 (3 s) | 800 | 3 | 0 | 3161 | départ d'avance 1242, rendu three 157, photos / vignettes 147, GC / natif 1502 |
| ÉCRAN DE MORT 3 (3 s, 8 s après) | 783 | 3 | 0 | 2244 | rendu three 849, photos / vignettes 603, GC / natif 3460 |

## JOUER (3 s)

Top inclusif : `loop` 1432 (index.html:83302), `render` 1065 (three.min.js:6), `renderer.render` 999 (index.html:50628), `Rt` 592 (three.min.js:6), `Ct` 590 (three.min.js:6), `renderBufferDirect` 589 (three.min.js:6), `It` 501 (three.min.js:6), `Cr.upload` 222 (three.min.js:6), `Er.setValue` 175 (three.min.js:6), `garageRender` 159 (index.html:79545), `At` 147 (three.min.js:6), `sm.render` 116 (index.html:47858), `(anonyme)` 113 (index.html:83133), `(garbage collector)` 113 (:0), `chuteRender` 111 (index.html:77842), `Yi` 99 (three.min.js:6)

Top propre : `(idle)` 804 (:0), `(program)` 634 (:0), `It` 175 (three.min.js:6), `Er.setValue` 162 (three.min.js:6), `(garbage collector)` 113 (:0), `uniformMatrix4fv` 86 (:0), `menuCadre` 68 (index.html:75949), `getBoundingClientRect` 66 (:0), `At` 62 (three.min.js:6), `f` 59 (:7)

LoAF : 1727 ms []

## MORT 1 (3 s)

Top inclusif : `loop` 1535 (index.html:83302), `(anonyme)` 984 (three.min.js:6), `prebAvec` 892 (), `prebTravaille` 892 (), `prebDepTick` 892 (), `prebTick` 892 (), `prebJob` 756 (index.html:18916), `prebDunes` 493 (), `dnTravailleur` 474 (), `createObjectURL` 414 (:0), `render` 348 (), `renderer.render` 348 (), `pisteRoute` 234 (index.html:19119), `Ct` 233 (), `Rt` 233 (), `renderBufferDirect` 206 ()

Top propre : `(program)` 1496 (:0), `createObjectURL` 414 (:0), `(idle)` 316 (:0), `(anonyme)` 180 (three.min.js:6), `Xi` 110 (three.min.js:6), `psiAt9` 110 (index.html:19205), `M` 105 (three.min.js:6), `pisteRoute` 97 (index.html:19119), `gAt` 96 (index.html:23266), `m2Seuil` 92 (index.html:66970)

LoAF : 494 ms [] ; 142 ms [FrameRequestCallback loop 104ms (forcé 0)] ; 89 ms [FrameRequestCallback loop 33ms (forcé 0)] ; 94 ms [FrameRequestCallback loop 21ms (forcé 0)] ; 542 ms [FrameRequestCallback loop 534ms (forcé 0)]

## ÉCRAN DE MORT 1 (3 s, 8 s après)

Top inclusif : `loop` 1223 (index.html:83302), `engVigRender` 717 (index.html:51025), `render` 529 (), `renderer.render` 502 (index.html:50628), `engLit` 495 (index.html:50418), `getBufferSubData` 361 (:0), `renderBufferDirect` 285 (three.min.js:6), `At` 197 (three.min.js:6), `Ct` 180 (), `Rt` 180 (), `engVigRendRT` 153 (), `bindFramebuffer` 138 (three.min.js:6), `setRenderTarget` 138 (), `setup` 129 (three.min.js:6), `(anonyme)` 112 (three.min.js:6), `M` 104 ()

Top propre : `(program)` 1052 (:0), `(idle)` 999 (:0), `getBufferSubData` 361 (:0), `At` 185 (three.min.js:6), `bindFramebuffer` 138 (three.min.js:6), `(anonyme)` 111 (three.min.js:6), `engVigRender` 69 (index.html:51025), `engLit` 68 (index.html:50418), `fenceSync` 56 (:0), `renderBufferDirect` 50 (three.min.js:6)

LoAF : 687 ms [] ; 132 ms []

## REJOUER 1 (3 s)

Top inclusif : `loop` 1299 (index.html:83302), `engVigRender` 992 (index.html:51025), `engLit` 778 (index.html:50418), `getBufferSubData` 733 (:0), `render` 203 (), `renderer.render` 203 (), `(anonyme)` 149 (), `(garbage collector)` 148 (:0), `resetGame` 120 (), `buildTrackG` 105 (index.html:19451), `newTrack0G` 105 (), `newTrackG` 105 (), `newTrack` 105 (), `prebDepPrend` 105 (), `renderBufferDirect` 81 (three.min.js:6), `Ct` 81 ()

Top propre : `(idle)` 1128 (:0), `(program)` 911 (:0), `getBufferSubData` 733 (:0), `engVigRender` 214 (index.html:51025), `(garbage collector)` 148 (:0), `uniformMatrix4fv` 63 (:0), `createObjectURL` 56 (:0), `lvlTick` 50 (index.html:62534), `wipePxDraw` 49 (index.html:52657), `setupView` 49 (three.min.js:6)

LoAF : 100 ms [FrameRequestCallback loop 22ms (forcé 5)] ; 374 ms [] ; 375 ms [TimerHandler:setTimeout  200ms (forcé 0) | FrameRequestCallback loop 157ms (forcé 0)] ; 278 ms [FrameRequestCallback loop 40ms (forcé 0)] ; 132 ms []

## MORT 2 (3 s)

Top inclusif : `loop` 2828 (index.html:83302), `getImageData` 1001 (:0), `homeCielPrise` 1001 (), `hudDiscretTick` 606 (index.html:69229), `chaineTick` 606 (), `prebAvec` 508 (), `prebTravaille` 508 (), `prebDepTick` 508 (), `prebTick` 508 (), `prebJob` 504 (index.html:18916), `render` 344 (EffectComposer.js:106), `pickupsTick` 258 (index.html:82527), `pisteRoute` 207 (index.html:19119), `renderer.render` 183 (), `At` 130 (three.min.js:6), `pisteTranches` 91 (index.html:18752)

Top propre : `(program)` 1361 (:0), `(idle)` 1007 (:0), `getImageData` 1001 (:0), `hudDiscretTick` 606 (index.html:69229), `prebJob` 297 (index.html:18916), `pickupsTick` 258 (index.html:82527), `render` 157 (EffectComposer.js:106), `At` 76 (three.min.js:6), `pisteTordPropre` 52 (index.html:17349), `pisteMaigre` 49 (index.html:18668)

LoAF : 597 ms [] ; 86 ms [] ; 103 ms [] ; 93 ms [] ; 547 ms [FrameRequestCallback loop 527ms (forcé 27)]

## ÉCRAN DE MORT 2 (3 s, 8 s après)

Top inclusif : `loop` 1438 (index.html:83302), `engVigRender` 999 (index.html:51025), `engLit` 929 (), `getBufferSubData` 918 (:0), `render` 381 (), `acesPass.render` 291 (), `renderer.render` 250 (), `At` 159 (three.min.js:6), `bindFramebuffer` 133 (:0), `setRenderTarget` 133 (), `setup` 50 (), `get` 50 (three.min.js:6), `invert` 44 (three.min.js:6), `getWorldDirection` 44 (), `dnPartTick` 44 (), `dunesTick` 44 ()

Top propre : `(idle)` 1488 (:0), `getBufferSubData` 918 (:0), `(program)` 362 (:0), `At` 157 (three.min.js:6), `bindFramebuffer` 133 (:0), `engVigRender` 54 (index.html:51025), `get` 50 (three.min.js:6), `invert` 44 (three.min.js:6), `leconAmbiance` 18 (index.html:62284), `updateWorldMatrix` 17 (three.min.js:6)

LoAF : 741 ms [] ; 371 ms [] ; 91 ms []

## REJOUER 2 (3 s)

Top inclusif : `loop` 909 (index.html:83302), `engVigRender` 561 (index.html:51025), `engLit` 483 (), `(anonyme)` 376 (index.html:48507), `putImageData` 286 (:0), `engPose` 286 (), `renderer.render` 241 (), `getBufferSubData` 196 (:0), `render` 188 (), `resetGame` 129 (), `chauffeRendu` 120 (), `chauffeNiveau` 120 (), `buildClouds` 114 (), `buildTrackG` 114 (), `newTrack0G` 114 (), `newTrackG` 114 ()

Top propre : `(idle)` 1461 (:0), `(program)` 664 (:0), `putImageData` 286 (:0), `getBufferSubData` 196 (:0), `buildCoton` 94 (index.html:16306), `bufferData` 87 (:0), `(anonyme)` 75 (index.html:48507), `lierScene` 53 (index.html:50665), `atob` 50 (:0), `bindFramebuffer` 33 (:0)

LoAF : 553 ms [FrameRequestCallback loop 24ms (forcé 2)] ; 180 ms [TimerHandler:setTimeout  101ms (forcé 0) | FrameRequestCallback loop 58ms (forcé 0)] ; 210 ms [FrameRequestCallback loop 181ms (forcé 0)]

## MORT 3 (3 s)

Top inclusif : `loop` 1567 (), `(anonyme)` 1258 (three.min.js:6), `prebDepTick` 1242 (), `prebTick` 1242 (), `prebAvec` 1194 (index.html:18858), `prebTravaille` 1194 (), `prebJob` 1153 (index.html:18916), `pisteRoute` 1148 (index.html:19119), `render` 157 (), `renderer.render` 157 (), `engVigRender` 147 (index.html:51025), `engLit` 122 (), `getBufferSubData` 90 (:0), `renderBufferDirect` 85 (three.min.js:6), `Ct` 85 (), `Rt` 85 ()

Top propre : `(program)` 1502 (:0), `pisteRoute` 1113 (index.html:19119), `getBufferSubData` 90 (:0), `createObjectURL` 36 (:0), `At` 32 (three.min.js:6), `bindVertexArray` 27 (:0), `now` 27 (:0), `get` 26 (three.min.js:6), `mGo` 25 (index.html:87063), `(anonyme)` 25 (three.min.js:6)

LoAF : 786 ms [FrameRequestCallback loop 16ms (forcé 0)] ; 95 ms [FrameRequestCallback loop 84ms (forcé 0)] ; 511 ms [] ; 132 ms [FrameRequestCallback loop 92ms (forcé 47)]

## ÉCRAN DE MORT 3 (3 s, 8 s après)

Top inclusif : `loop` 1472 (index.html:83302), `render` 849 (), `engVigRender` 603 (index.html:51025), `engLit` 484 (), `renderer.render` 457 (), `THREE.UnrealBloomPass.render` 447 (), `getBufferSubData` 438 (:0), `setRenderTarget` 392 (three.min.js:6), `renderBufferDirect` 318 (three.min.js:6), `Ct` 318 (), `Rt` 318 (), `bindVertexArray` 184 (:0), `h` 184 (), `setup` 184 (), `At` 68 (three.min.js:6), `sm.render` 65 ()

Top propre : `(idle)` 3460 (:0), `(program)` 772 (:0), `getBufferSubData` 438 (:0), `setRenderTarget` 392 (three.min.js:6), `bindVertexArray` 184 (:0), `engVigRender` 118 (index.html:51025), `renderBufferDirect` 65 (three.min.js:6), `push` 57 (three.min.js:6), `Cr.setValue` 55 (three.min.js:6), `copy` 54 (three.min.js:6)

LoAF : 787 ms [] ; 134 ms [] ; 129 ms [] ; 92 ms [FrameRequestCallback loop 16ms (forcé 1)]
