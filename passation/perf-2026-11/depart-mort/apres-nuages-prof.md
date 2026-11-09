# Départ et mort — profil des fenêtres de 3 s (nuages:midi, CPU ×4, charge machine 41)

| fenêtre | pire image (ms) | images > 100 ms | programmes liés | occupé (ms) | postes principaux (inclusif ms) |
|---|---|---|---|---|---|
| JOUER (3 s) | 1233 | 3 | 0 | 3260 | newTrack / piste 185, départ d'avance 185, rendu three 1125, GC / natif 1306 |
| MORT 1 (3 s) | 567 | 5 | 0 | 3583 | départ d'avance 598, rendu three 440, photos / vignettes 257, mort / explosion 113, GC / natif 1591 |
| ÉCRAN DE MORT 1 (3 s, 8 s après) | 433 | 2 | 0 | 1322 | rendu three 430, photos / vignettes 302, GC / natif 2262 |
| REJOUER 1 (3 s) | 533 | 4 | 0 | 3266 | newTrack / piste 405, départ d'avance 405, resetGame 418, rendu three 53, photos / vignettes 726, GC / natif 2358 |
| MORT 2 (3 s) | 1217 | 6 | 0 | 6518 | départ d'avance 1268, mort / explosion 32, GC / natif 2343 |
| ÉCRAN DE MORT 2 (3 s, 8 s après) | 817 | 1 | 0 | 1921 | rendu three 641, photos / vignettes 431, GC / natif 1075 |
| REJOUER 2 (3 s) | 400 | 2 | 1 | 24916 | départ d'avance 87, rendu three 6205, photos / vignettes 5359, GC / natif 16635 |
| MORT 3 (3 s) | 683 | 3 | 0 | 2351 | départ d'avance 1195, rendu three 82, photos / vignettes 70, GC / natif 733 |
| ÉCRAN DE MORT 3 (3 s, 8 s après) | 550 | 2 | 0 | 1908 | rendu three 219, photos / vignettes 893, GC / natif 2820 |

## JOUER (3 s)

Top inclusif : `loop` 1896 (index.html:83302), `render` 1125 (three.min.js:6), `renderer.render` 1084 (index.html:50628), `Rt` 565 (three.min.js:6), `Ct` 540 (three.min.js:6), `renderBufferDirect` 512 (three.min.js:6), `garageRender` 443 (index.html:79545), `chuteRender` 413 (index.html:77842), `It` 346 (three.min.js:6), `newTrack0G` 185 (), `newTrackG` 185 (), `newTrack` 185 (), `rebuildMenuScene` 185 (), `prebDepPrend` 185 (), `sous9` 185 (), `CHUTE.sous` 185 ()

Top propre : `(program)` 1306 (:0), `(idle)` 1012 (:0), `At` 124 (three.min.js:6), `(anonyme)` 88 (index.html:83133), `menuCadre` 75 (index.html:75949), `project` 67 (three.min.js:6), `bindVertexArray` 65 (:0), `M` 62 (three.min.js:6), `updateMorphTargets` 56 (three.min.js:6), `Wi` 54 (three.min.js:6)

LoAF : 1246 ms [] ; 276 ms [FrameRequestCallback loop 250ms (forcé 0)] ; 129 ms [FrameRequestCallback loop 118ms (forcé 6)] ; 132 ms []

## MORT 1 (3 s)

Top inclusif : `loop` 1345 (index.html:83302), `(anonyme)` 659 (three.min.js:6), `(garbage collector)` 622 (:0), `prebDepTick` 598 (), `prebTick` 598 (), `prebJob` 521 (index.html:18916), `prebAvec` 521 (), `prebTravaille` 521 (), `render` 440 (three.min.js:6), `renderer.render` 440 (), `pisteRoute` 378 (index.html:19119), `engVigRender` 257 (index.html:51025), `Rt` 216 (three.min.js:6), `Ct` 216 (three.min.js:6), `renderBufferDirect` 214 (three.min.js:6), `genForet` 202 (index.html:19617)

Top propre : `(program)` 1591 (:0), `(garbage collector)` 622 (:0), `forPelote` 155 (index.html:19651), `pisteRoute` 137 (index.html:19119), `traverseVisible` 116 (three.min.js:6), `billsTick` 113 (index.html:62983), `(anonyme)` 108 (three.min.js:6), `multiplyMatrices` 71 (three.min.js:6), `mont` 70 (index.html:20611), `createObjectURL` 64 (:0)

LoAF : 88 ms [] ; 565 ms [] ; 165 ms [FrameRequestCallback loop 123ms (forcé 0)] ; 110 ms [FrameRequestCallback loop 103ms (forcé 0)] ; 109 ms [FrameRequestCallback loop 80ms (forcé 32)]

## ÉCRAN DE MORT 1 (3 s, 8 s après)

Top inclusif : `loop` 737 (), `render` 430 (three.min.js:6), `renderer.render` 428 (), `engVigRender` 302 (index.html:51025), `Rt` 263 (three.min.js:6), `renderBufferDirect` 263 (three.min.js:6), `Ct` 259 (), `engLit` 217 (index.html:50418), `getBufferSubData` 160 (:0), `setup` 130 (), `(anonyme)` 127 (three.min.js:6), `sm.render` 125 (), `M` 122 (three.min.js:6), `determinant` 116 (three.min.js:6), `It` 106 (three.min.js:6), `THREE.UnrealBloomPass.render` 97 ()

Top propre : `(idle)` 2262 (:0), `(program)` 585 (:0), `getBufferSubData` 160 (:0), `(anonyme)` 126 (three.min.js:6), `determinant` 116 (three.min.js:6), `ir` 90 (three.min.js:6), `engVigRender` 85 (index.html:51025), `engPose` 54 (index.html:50416), `renderBufferDirect` 25 (three.min.js:6), `applyMatrix4` 21 (three.min.js:6)

LoAF : 435 ms [] ; 141 ms [FrameRequestCallback loop 21ms (forcé 1)] ; 85 ms [FrameRequestCallback loop 70ms (forcé 1)] ; 84 ms []

## REJOUER 1 (3 s)

Top inclusif : `loop` 818 (), `engVigRender` 726 (index.html:51025), `(anonyme)` 469 (three.min.js:6), `resetGame` 418 (), `buildTrackG` 405 (), `newTrack0G` 405 (), `newTrackG` 405 (), `newTrack` 405 (), `prebDepPrend` 405 (), `cotonOuvrier` 354 (), `nuage8Async` 354 (), `nuSymRebuild` 354 (), `nuSymMaj` 354 (), `buildCoton` 354 (), `buildClouds` 354 (), `getBufferSubData` 339 (:0)

Top propre : `(idle)` 2358 (:0), `(program)` 2029 (:0), `engVigRender` 388 (index.html:51025), `getBufferSubData` 339 (:0), `createObjectURL` 259 (:0), `Blob` 95 (:0), `bmapPeint` 51 (index.html:18501), `memLibereCb` 50 (index.html:13807), `updateContactShadow` 24 (index.html:14421), `fusMaillage` 11 (index.html:47675)

LoAF : 441 ms [] ; 97 ms [] ; 172 ms [] ; 118 ms [] ; 546 ms [TimerHandler:setTimeout  436ms (forcé 0) | FrameRequestCallback loop 89ms (forcé 0)]

## MORT 2 (3 s)

Top inclusif : `loop` 4144 (), `prebDepTick` 1268 (), `prebTick` 1268 (), `pickupsTick` 1046 (), `(anonyme)` 717 (), `pisteRoute` 685 (index.html:19119), `prebJob` 685 (), `prebAvec` 685 (), `prebTravaille` 685 (), `lookAt` 654 (three.min.js:6), `updateBoomArt` 654 (), `Blob` 583 (:0), `envOuvrier` 583 (), `envPrepare` 583 (), `prebPart` 583 (), `raisinTick` 573 (index.html:59094)

Top propre : `(program)` 2343 (:0), `(idle)` 775 (:0), `lookAt` 654 (three.min.js:6), `Blob` 583 (:0), `raisinTick` 573 (index.html:59094), `nxfDessine` 544 (index.html:82987), `rythmeMesure` 314 (index.html:17470), `flowTagTick` 272 (index.html:53224), `livre` 259 (index.html:53643), `juiceScreen` 214 (index.html:69489)

LoAF : 83 ms [] ; 190 ms [] ; 95 ms [] ; 497 ms [] ; 337 ms []

## ÉCRAN DE MORT 2 (3 s, 8 s après)

Top inclusif : `loop` 1124 (index.html:83302), `render` 641 (three.min.js:6), `renderer.render` 625 (index.html:50628), `Rt` 446 (three.min.js:6), `Ct` 440 (three.min.js:6), `engVigRender` 431 (index.html:51025), `renderBufferDirect` 389 (three.min.js:6), `It` 268 (three.min.js:6), `engLit` 232 (), `getBufferSubData` 201 (:0), `Cr.upload` 169 (three.min.js:6), `setup` 83 (three.min.js:6), `(anonyme)` 64 (index.html:50668), `engVigRendRT` 64 (), `THREE.UnrealBloomPass.render` 57 (index.html:14279), `Oi` 52 (three.min.js:6)

Top propre : `(idle)` 1075 (:0), `(program)` 722 (:0), `getBufferSubData` 201 (:0), `engVigRender` 134 (index.html:51025), `Cr.upload` 57 (three.min.js:6), `loop` 52 (index.html:83302), `Ct` 50 (three.min.js:6), `setup` 46 (three.min.js:6), `activeTexture` 45 (:0), `toArray` 44 (three.min.js:6)

LoAF : 822 ms [FrameRequestCallback loop 25ms (forcé 5)]

## REJOUER 2 (3 s)

Top inclusif : `loop` 12599 (index.html:83302), `render` 6205 (three.min.js:6), `renderer.render` 6067 (index.html:50628), `engVigRender` 5359 (index.html:51025), `engLit` 3916 (index.html:50418), `renderBufferDirect` 3549 (three.min.js:6), `Rt` 3435 (three.min.js:6), `Ct` 3378 (three.min.js:6), `getBufferSubData` 2843 (:0), `It` 1531 (three.min.js:6), `engPose` 932 (index.html:50416), `At` 887 (three.min.js:6), `Cr.upload` 847 (three.min.js:6), `setup` 808 (three.min.js:6), `(anonyme)` 614 (three.min.js:6), `sm.render` 508 (index.html:47858)

Top propre : `(idle)` 16635 (:0), `(program)` 12075 (:0), `getBufferSubData` 2843 (:0), `engVigRender` 1080 (index.html:51025), `renderBufferDirect` 911 (three.min.js:6), `engPose` 572 (index.html:50416), `At` 487 (three.min.js:6), `(anonyme)` 398 (three.min.js:6), `putImageData` 360 (:0), `loop` 348 (index.html:83302)

LoAF : 402 ms [] ; 91 ms [] ; 96 ms [] ; 101 ms [FrameRequestCallback loop 88ms (forcé 1)] ; 81 ms [FrameRequestCallback loop 16ms (forcé 1)]

## MORT 3 (3 s)

Top inclusif : `loop` 1821 (index.html:83302), `(anonyme)` 1231 (), `prebDepTick` 1195 (), `prebTick` 1195 (), `prebAvec` 1185 (index.html:18858), `prebTravaille` 1185 (), `prebJob` 1183 (index.html:18916), `pisteRoute` 782 (index.html:19119), `normales9` 534 (index.html:19245), `createObjectURL` 391 (:0), `cyTravailleur` 386 (), `cyAvPart` 386 (), `cyBatitG` 386 (), `eclEcrit` 298 (index.html:72444), `eclVide` 298 (), `campStop` 298 ()

Top propre : `(idle)` 733 (:0), `normales9` 534 (index.html:19245), `createObjectURL` 391 (:0), `(program)` 331 (:0), `eclEcrit` 298 (index.html:72444), `(garbage collector)` 184 (:0), `rythmeMesure` 102 (index.html:17470), `set` 82 (three.min.js:6), `qlAuto` 64 (index.html:15068), `pisteRoute` 60 (index.html:19119)

LoAF : 700 ms [] ; 81 ms [FrameRequestCallback loop 16ms (forcé 0)] ; 87 ms [FrameRequestCallback loop 59ms (forcé 0)] ; 115 ms [FrameRequestCallback  86ms (forcé 0) | FrameRequestCallback loop 21ms (forcé 0)] ; 94 ms [FrameRequestCallback loop 74ms (forcé 42)]

## ÉCRAN DE MORT 3 (3 s, 8 s après)

Top inclusif : `loop` 1136 (index.html:83302), `engVigRender` 893 (index.html:51025), `engLit` 869 (), `getBufferSubData` 546 (:0), `engPose` 323 (index.html:50416), `render` 219 (), `renderer.render` 219 (index.html:50628), `renderBufferDirect` 199 (), `Ct` 164 (), `Rt` 164 (), `Yi` 109 (three.min.js:6), `It` 98 (), `Cr.setValue` 97 (three.min.js:6), `setup` 85 (), `uniformMatrix4fv` 59 (:0), `(anonyme)` 56 (three.min.js:6)

Top propre : `(idle)` 2820 (:0), `(program)` 771 (:0), `getBufferSubData` 546 (:0), `engPose` 321 (index.html:50416), `uniformMatrix4fv` 59 (:0), `(anonyme)` 41 (three.min.js:6), `bindVertexArray` 29 (:0), `Gi` 28 (three.min.js:6), `engVigRender` 24 (index.html:51025), `vertexAttribPointer` 16 (:0)

LoAF : 546 ms [] ; 191 ms []
