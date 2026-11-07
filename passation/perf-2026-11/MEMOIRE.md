# MEMOIRE — « une partie ne laisse rien derrière elle » (Perf 3, P1, 7/11/2026)

Outils (tous dans `outils/banc-perf/`, aucun ne touche au jeu) :
- `memoire.py` — N parties enchaînées (JOUER → course avec pilote → K portails franchis `--portails K` → mort `dbgBoom` → écran de fin → REJOUER), un relevé après chaque portail et chaque fin de partie (GC forcée) : textures / géométries / programmes (`renderer.info`), `performance.memory.usedJSHeapSize`, toiles rendues, PCM audio (`CCSON.etat()`), lieu (`dbgNiveau`). `--trace` pose `traceur-memoire.js` ; `--tas 2,4` prend deux instantanés de tas CDP ; `--vp <dossier>` sert un autre `VERSION PRINCIPALE` (l'AVANT = une copie d'`origin/main`) ; `--json`.
- `traceur-memoire.js` — injecté avant le jeu : liste des géométries/textures encore envoyées au GPU (= celles que `renderer.info.memory` compte), lesquelles ne sont plus dans AUCUNE scène, copies JavaScript (`attribute.array`) des géométries de la scène regroupées par nom de maillage, et `__MEMTR_A()` : les tableaux > 100 Ko encore vivants regroupés par fonction créatrice (pile).
- `tas-diff.cjs` (self size par constructeur entre deux instantanés), `tas-tampons.cjs` (qui TIENT les tampons typés : `Float32Array ← BufferAttribute.array`…).

## Ce que la mesure a dit (AVANT, iPhone émulé p2, `?tel=1&palier=2&garde=1&pistegraine=777`, 5 parties × 3 portails)
1. **Pas de fuite GL entre deux parties.** Les `dispose()` sont déjà là (`pisteInstalle`, `disposeClouds`, `foretVide`/`grotteVide`/`banqVide` + `userData.jeter`, `clearBoom`, `buildCar`, `MAT_SURSIS`) : le traceur ne trouve que 52-72 géométries « hors scène » (2-4 Mo, les gabarits gardés exprès : jade, ville, garage) et 12-16 textures hors scène, STABLES de la partie 1 à la 5. Programmes 209 → 220 (les variantes de banquise/espace/etc. apparaissent à la 1re visite, puis plus rien). Textures 149-153 stables dès la 2e partie. Les géométries suivent la MAP visitée (grotte 1 069, forêt 714, jade 655, ville 552-652, canyon 614-658) : elles ne s'additionnent pas. **Les « 311 → 632 géométries » du 13 Pro sont donc la composition des maps visitées + les caches voulus, pas des fuites de `dispose()`.**
2. **Le vrai poids est ailleurs : les copies JavaScript des tampons de sommets.** `performance.memory.usedJSHeapSize` (203 Mo au menu, 300-347 Mo en fin de partie) est surtout fait de « system / JSArrayBufferData » : 269 Mo sur 353 Mo dans l'instantané de la partie 4, dont 201 Mo de `Float32Array ← BufferAttribute.array` (3 144 attributs) et 17 Mo d'index. Le tas JS pur (`Performance.getMetrics`) reste à ~50 Mo. three garde le tableau d'un `BufferAttribute` après l'envoi au GPU tant que personne ne le jette.
3. **Pic de fin de partie.** L'écran de mort porte la piste qui vient de finir + la piste d'après bâtie d'avance (pré-bâti, jamais envoyée au GPU : tout en tableaux) : +40 à +70 Mo (partie 4 : 276 → 347 Mo). C'est là qu'un iPhone de 4 Go est le plus proche du jetsam.
4. **Audio.** Les SFX sont déjà décodés à la demande (`sfx.js`, 2026-11-05, `?sons=tout` = avant) : 15,5 Mo de PCM au menu (fiches `pre:1` + `ui.*`), 20-26 Mo en course, éviction après 60 s d'inactivité.

## Cartographie des libérations (par construction)
| zone | ce qui part | ce qui reste |
|---|---|---|
| route (`pisteInstalle`, `piste-prebati.js:231`) | géométrie de chaque maillage de `trackMeshes`, matières en sursis 3 images (`MAT_SURSIS`) | **la copie JS des tranches de route (19 Mo)** — corrigé (commit « route ») |
| nuages (`disposeClouds`, `nuGeoLibre`) | géométrie de chaque nuage, peau d'un nuage seul | **les 100 PEAUX des gabarits `COTON.skin` gardaient leur tableau (33 Mo)** — corrigé (commit « peau ») ; corps des gabarits : `nuLibre` déjà là |
| forêt / grotte / glacier (`foretVide`, `grotteVide`, `banqVide`) | `userData.jeter` ⇒ `dispose()` ; racines mises à null | rien (grotte : `grtLibere`) |
| ville (`buildVoxCity`) | familles instanciées `.dispose()`, géométries avec `trackMeshes` | copies JS des maillages fusionnés (~13 Mo, non touché : gabarits partagés) |
| mort (`clearBoom`, `jeteObj`) | éclats, anneaux, crânes, billets | les réserves de la boule de feu sont RANGÉES exprès |
| caisse (`buildCar`, `CAR_VIEUX`) | géométries + `InstancedMesh.dispose()` | matière « gardienne » de chaque programme (`carGarde`) |
| réserves (`makePool`, `streaks`) | — | **taille fixe à la création** (anneau `head`) : ne grandissent pas |
| fruits (`FRUIT_GEO`) | jamais libérés (cache de session, voulu) | **copie JS 13 Mo gardée** — corrigé (commit « fruits ») |
| textures peintes une fois | `texLibere` (palier 0/1 ou `ALLEGE`) | ordinateur : toiles gardées (voulu) |

## Corrections (un commit chacune ; `?memoire=ancien` = tout comme avant)
| commit | quoi | gain mesuré |
|---|---|---|
| peau | `nuSkinPose` : les 100 peaux de `COTON.skin` jettent leur copie JS une fois au GPU (`nuLibre`) | ≈ 33 Mo (maps où le ciel de coton est dessiné ; ailleurs elles attendent leur 1er dessin) |
| route + fruits | `memLibere(g)` (palier-appareil.js) : tranches de route (`pisteTranches`, 3 finesses) et `FRUIT_GEO` ; boîte/sphère englobantes calculées AVANT de jeter | ≈ 19 + 13 Mo |
| audio | `sfx.js` : `finCourse()` (à `endGame`) rend 4 s après la mort les sons de la COURSE (ni `pre:1` ni `ui.*`), `debutCourse()` (à `resetGame`) les redemande d'avance | PCM 21,9 → 15,7 Mo à l'écran de fin ; `?audio=tout` / `?memoire=ancien` : banque entière (77 Mo) |
| outils | `memoire.py`, `traceur-memoire.js`, `tas-diff.cjs`, `tas-tampons.cjs`, `capture-memoire.py` | — |

## AVANT / APRÈS (iPhone émulé p2, 5 parties × 3 portails, cartes cyclées ; relevé à la fin de chaque partie, après GC ; `mesures/2026-11-07-p1-memoire-*.json`)
| partie | AVANT : carte · tex/géo/prog · tas Mo · copies JS des géométries Mo · PCM Mo | APRÈS : carte · tex/géo/prog · tas Mo · copies JS · PCM |
|---|---|---|
| menu | 9 / 1 / 110 · **204** · — · 15,5 | 9 / 1 / 112 · **203** · — · 15,5 |
| 1 | grotte · 119/1 069/209 · **312** · 71 · 21,9 | grotte · 120/1 174/210 · **240** · 16 · 15,7 |
| 2 | forêt · 149/714/210 · **303** · 96 · 24 | dunes · 153/662/211 · **240** · 24 · 15,5 |
| 3 | ville · 149/652/217 · **303** · 89 · 23,7 | ville · 150/694/219 · **232** · 26 · 15,7 |
| 4 | jade · 149/655/219 · **347** · 80 · 21,1 | jade · 150/707/221 · **261** · 39 · 15,7 |
| 5 | canyon · 153/658/220 · **305** · 85 · 22,2 | canyon · 154/699/222 · **236** · 28 · 15,7 |
`?memoire=ancien` sur le même code : 283 / 296 / 296 / 299 / 293 Mo, PCM 77 Mo, copies JS 83-91 Mo (= l'état d'avant, interrupteur vérifié).
- **Tas : −70 à −85 Mo** à chaque fin de partie (−23 à −25 %), et le pic de fin de partie (jade, pré-bâti de la piste suivante : 347 Mo) passe à 261 Mo.
- **Stabilité (critère)** : de la partie 3 à la 5 (même régime, cartes déjà vues) : textures 150 → 154 (+2,7 %), géométries 694 → 699 (+0,7 %), programmes 219 → 222 (+1,4 %), tas 232 → 236 Mo (+4 Mo) ; AVANT 303 → 305 (+2 Mo). De la partie 2 à la 5 le banc affiche « programmes 211 → 222 » : ce sont les variantes de PREMIÈRE visite (banquise, espace, nuages…), pas une dérive — la partie 5 d'AVANT en fait autant (210 → 220). Aucune erreur de page dans aucune des 4 séries.
- ⚠ **Pas de pixel-à-pixel** : `capture-memoire.py` compare des images de course, mais le pilote et les nuages animés décalent la scène d'une image à l'autre (écart moyen AVANT/AVANT 18 sur 255, AVANT/APRÈS 16) : le banc ne PEUT pas prouver l'identité au pixel. À l'œil les deux captures (`captures/p1-memoire/nuages-midi-*.jpg`) sont la même scène (même peau de nuage, mêmes pièces, même route). Preuve structurelle : `memLibere` / `nuLibre` ne touchent le tableau qu'APRÈS l'envoi au GPU (`onUploadCallback`), les sommets envoyés sont les mêmes.

## Ce qui reste (non fait, à décider)
1. **Les gabarits de nuages (`COTON`, 24 formes × 4 finesses) gardent ~48 Mo de copies JS dès le menu** tant qu'aucun nuage n'est dessiné (leur racine est `visible=false` hors des maps à ciel de coton) : `cotonInit()` est appelé AVANT le test `lvlNuageOk` de `buildCoton`. Les construire seulement à la 1re map qui en veut gagnerait ~48 Mo mais retarde les formes fines de la 1re map à nuages (visible) → décision DA/P2, pas prise ici.
2. Les `(sans nom) MeshPhong` de la ville fusionnée et des gabarits de jade (≈ 13 + 8 Mo) : géométries gardées d'une piste à l'autre, `memLibere` y est dangereux sans preuve de non-réutilisation après `dispose()`.
3. Le pic de fin de partie vient du pré-bâti de la piste suivante (toute en tableaux avant son 1er dessin) : le raccourcir = le bâtir plus tard (compromis avec le gel au REJOUER, `rejoueAttend`).
4. Géométries « hors scène » (52 → 100 au fil des parties, AVANT comme APRÈS comme `?memoire=ancien`, donc pas causé par cette passe) : lecture du code, ce sont très probablement les **moteurs gardés** (`ENG_PRET`, `vignette-moteur.js:191-198` et `:341`) : `mkEngine(i)` pour les 30 paliers est gardé à vie (décision de Léo du 31/10 contre les à-coups de montée de palier, « ~39 Mo de géométrie pour les 30 »), chaque moteur montré par la carte NOUVEAU MOTEUR devient une géométrie envoyée au GPU mais hors de toute scène. Levier possible : fenêtre glissante [palier de départ, +3] + `memLibere` des moteurs montrés ; NON FAIT : il défait un réglage de Léo (retour des à-coups de montée) et n'est pas mesurable sans banc. À valider au banc avant de toucher.
5. Le banc : en partie 2 le portail dunes → suivante n'est pas franchi dans 3 séries sur 4 (aussi en `ancien`) : défaut du banc sous forte charge (la machine était à 150-500 de charge), pas de la mémoire.
