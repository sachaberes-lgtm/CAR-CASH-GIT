# Le vol qui monte et se résout — session SON, branche `son/vol` (2026-10-14)

Base : `son/integ` à 24bb68e. Cinq commits, un par correctif. Rien n'a été écouté (aucun navigateur) : tout est déduit du code,
et la courbe de tension a été vérifiée au banc node `son/banc/vol/tension.cjs` (30, 60 et 120 i/s : même k à ±0,005 près).
Les numéros de ligne sont ceux du worktree `wt/vol` à la fin de la session ; ils bougent : chercher par nom.

## A · Le vol monte — 650f5ff
- **Ce que le joueur entend** : plus le vol dure, plus le vent s'ouvre et s'aiguise et plus le moteur chante haut. Un saut de 0,3 s
  sonne comme avant, un vol de 3 s se TEND. Les figures ajoutent un peu de tension.
- **Où** : `const SVOL={t,k}` (~l. 34426) ; mise à jour en tête des sons continus (`if(mode==='fall'){SVOL.t+=dt…}`, ~l. 50548) ;
  roue libre en vol (`k9=SVOL.k`, ~l. 50624) ; `windG` et `windF` du bloc vent ; remises à zéro dans `startFall` (t), `respawn`,
  `newTrack`, `resetGame` (t et k).
- **Valeurs** : cible `k = min(1, .85·min(1, t/2,5) + min(.3, 0,06·ECH))`, montée `1−exp(−2,6·dt)`, descente hors vol `exp(−5·dt)`.
  Vent : gain `+.016·k` (sous le plafond existant `.075`), filtre `+340·k` Hz. Moteur en vol : régime visé `.85 + .13·k` (max .98,
  sous le plafond 1 du sol, donc pas de « moustique »), gain ×(1 + .35·k), LFO 9 → 13 Hz et sa profondeur ×(1 + .35·k).
  `SVOL.t` compte le temps VÉCU (pas `fallTR`, que les bumps et la mer font reculer).
- **Banc** : k ≈ .25 à 1 s, .65 à 2 s, .84 à 2,5 s, .93 à 3 s (avec 2 figures) ; −0,1 s après la pose .57, −0,25 s .27.
- **Le provoquer** : un long vol (bord de route, ou tremplin) sans nitro, 3 s et plus ; comparer à un petit saut.
- **Risque** : le vent monte de ~+1,5 dB au plus et s'éclaircit — si Sacha trouve que ça « siffle », baisser le 340. La nitro en vol
  coupe toujours le moteur (`.004`) : la montée passe alors par le seul vent.

## B · La pose résout — 4e66061
- **Ce que le joueur entend** : à la pose d'un vol tendu, les chaînes continues (moteur, vent, sifflet, jet) se creusent ~80 ms, le
  verdict (`pose.parfait`, le choc) claque dedans, puis le vent et la tension retombent en ~0,2 s (pas de coupure sèche).
- **Où** : `tryLand`, juste après `prevTvalid=false;mode='drive';` (~l. 39186) : `duckT=Math.max(duckT,.2*SVOL.k)`.
- **Valeurs** : duckT ≤ .2 → dk ≥ .9 (−0,9 dB), qui retombe à 2,6/s (~80 ms). Le choc `thud` ajoute toujours le sien (≤ .7) au contact.
- **Le provoquer** : un vol de 2,5 s+ posé PARFAIT ; comparer avec un petit saut (k ≈ 0 : aucun creux).
- **Risque** : faible (le creux est sous le choc existant). La levée de la lèvre (`levreRattrape`) n'a pas de creux : pas une vraie pose.

## C · Le décollage sans trou — 7c30ed0
- **Ce que le joueur entend** : au décollage le moteur s'efface en douceur au lieu de décrocher, et garde un souffle audible en vol.
- **Où** : roue libre en vol, `stt(gainN.gain,.02*(1+.35*k9)…,.18)` et `engLfoG` (~l. 50635).
- **Valeurs** : tc .08 → .18 ; plancher .013 → .02. Plafond en vol (tension comprise) .027×vol, sous le moteur au sol à la vitesse
  d'un décollage (`engSndParams` : ev ≈ .032×vol sur ordi — `gE` .72 —, ≈ .045×vol sur iPhone ; pleine charge .039 / .054).
- **Le provoquer** : décoller à pleine vitesse, écouter les 0,3 premières secondes.
- **Risque** : sur un départ LENT (régime bas, ev ≈ .021) le vol peut sonner aussi fort que le sol — rare (on décolle vite).
  Les couches mécaniques (`transG/diffG/ovrG/engTickG/pinkG`) tombent toujours en tc .12 : non touchées.

## D · Le jet sans grésillement — c3754d7
- **Ce que le joueur entend** : la turbulence du jet de nitro (`jrG`, `jetLowG`) change toutes les 90 ms au lieu de chaque image :
  même grain à 30 et à 120 i/s (il grésillait deux fois plus vite à 120 Hz).
- **Où** : `const JETN={t,r,l}` (~l. 34430) ; bloc jet des sons continus (`JETN.t+=dt…`, ~l. 50690).
- **Valeurs** : mêmes plages (×.84-1.16 et ×.7-1.3), retirées toutes les 90 ms (horloge par dt, `%=`) ; `stt` économise de nouveau
  les ~90 % d'images où la consigne ne bouge pas.
- **Le provoquer** : tenir la nitro au sol puis en l'air, idéalement sur un écran 120 Hz.
- **Risque** : nul côté timbre ; la turbulence est un peu plus « en marches » (lissées par tc .08).

## E · Les pops sur iPhone — cfcfa20
- **Ce que le joueur entend** : sur iPhone (`TEL_NATIF`), un peu moins de pétillement de flamme : 6 pops/s au sol (10), 4/s en l'air (9).
  Ordinateur inchangé (25 / 9).
- **Où** : bloc jet, cadence de `flamePop` (~l. 50705).
- **Pourquoi** : chaque pop alloue 4 nœuds WebAudio ; c'est un coût CPU de l'iPhone, pas un choix de timbre.
- **Risque** : la nitro au sol un peu moins « crépitante » sur téléphone. Le POK au sol (2,4/s) n'a pas bougé.

## Laissé
- Le `for(const n9 of [transG,diffG,ovrG,engTickG,pinkG])` de la branche vol alloue un tableau par image (hors mission, à reprendre).
- Le sifflet (`whG`) ne lit pas la tension : il dit la VITESSE, pas le vol.
- Aucun filtre moteur (`filt`) ouvert par la tension : le risque de « moustique » ne vaut pas le gain.
