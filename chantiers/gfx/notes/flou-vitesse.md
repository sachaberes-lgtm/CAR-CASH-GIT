# NOTES — flou-vitesse (passe graphismes, 14/10, 6 h 10)

Branche `gfx/flou-vitesse`. Banc : `gfx/banc/flou-vitesse/ab.cjs` (une ouverture, image figée, v1/v2 × 5 vitesses d'effet, mesure de netteté).
Interrupteur : `const FLOU_V2=!/[?&]sans=flou\b/.test(location.search);` — `?sans=flou` = le programme d'avant au caractère près.
Hook banc : `dbgFlou({v:0|1, s:<vitesse d'effet forcée>, fv:[rayon,force,warp,courbe]})` (v = recompilation : banc seulement).

## 1. CE QUI PRODUIT ET DOSE LE FLOU (avant)
- **Une seule source : la passe finale `ACESShader`**, branche `if(uSpeed>0.004)` (à la place du FXAA) :
  · `dc=vUv-uCtr` (part de la CAISSE à l'écran, `postCaisse`), `rb=|dc|·uRn` (le coin le plus loin vaut .707), `ms` = disque net de la
    taille de la caisse (`uSafe`) ;
  · WARP `buv=uCtr+dc·(1+uSpeed·.60·rb²·ms)` : le bord est agrandi de 30 % à uSpeed 1 (c'est lui qui « incurve » horizon et tours) ;
  · FLOU `amt=uSpeed·(.04+1,7·rb²)·ms`, `ACES_N` prises (6 tél. / 8 ordi) le long de `dc·amt·t·.62` avec un grain animé (`uJit`) :
    au boost (s .6), le coin file sur ~0,28 de l'écran (~200 px) — la moitié haute de l'image n'est plus que des traînées ;
  · ABERRATION CHROMATIQUE (ordi seul, `IS_MOBILE` la retire) : `ca=dc·amt·.015` au-delà de 45 % du rayon ;
  · le halo du bloom est relu au milieu de la traînée (`bu`) : il file avec ;
  · plus loin : TUNNEL `c*=1-uSpeed·smoothstep(.30,.85,r)·.55` (coins noircis de moitié à la nitro) et la lueur de NITRO (`uNit`,`uNitF`,
    `nfxTick`) — la lueur n'est PAS touchée.
- **`uSpeed` = `loop._sfx`** (boucle, `if(acesPass){ // EFFETS DE VITESSE`) : cible
  `sfxT = max(ORBFX.warp·.95, min(1, nitro .72 + min(1,boost)·.6 + CAM_HEROS.flou(.2)·clamp((v/vCroisière−.7)/.8)))·volK9`
  (vol ×.5, explosion ×0), montée ×7/s, retombée ×3/s. `boost` = minuteur des pads (1,5), du drift (.35-.65), de la fronde…
  ⇒ **hors boost** : le voile `CAM_HEROS.flou` met uSpeed à .075 à la croisière et .2 à 1,5× la croisière — d'où « le flou même hors
  boost » (et sans FXAA, puisque la branche flou remplace l'anticrénelage).
- Coupé par : `FLOU_OK` (cran 5 = palier 0 / iPhone 7), `REDUCED_MOTION`, `!running`/`gameOver`, et les photos (`uSpeed=0` partout).
- Le reste du sentiment de vitesse : le FOV de `CAM_HEROS` (`kick`, `fovMaxL`), la caméra qui descend (`bas`), les tremblements (`shake`).
  `vLigneMat` n'est PAS une ligne de vitesse : c'est la LIGNE DE NÉON entre les pads (gameplay). Pas d'autre flou de mouvement.

## 2. CE QUI CHANGE (FLOU_V2) — cinq remplacements de texte dans le programme, rien d'autre
| | avant | après |
|---|---|---|
| dose | `uSpeed` linéaire | `sp = uSpeed·(.25+.75·uSpeed)` : croisière .075 → .019, .2 → .07, boost .6 → .42, nitro 1 → 1 |
| seuil de la branche | `uSpeed > .004` | `sp > .02` : à la croisière l'image reste NETTE et garde son FXAA |
| où ça file | `.04 + 1,7·rb²` (dès le centre) | `e = max(rb − .26, 0)²` : rien avant 26 % du rayon (la caisse, la route devant, le point de fuite), puis en carré vers les bords |
| force | coin : .89·uSpeed | coin : 2,0·.2 = .40·sp (≈ moitié à la nitro, ≈ 1/3 au boost) |
| warp | bord ×1,30 | bord ×1,16 à la nitro, ×1,07 au boost, nul avant 26 % |
| aberration (ordi) | ×.015 dès 45 % | ×.006 au-delà de 55 % |
| tunnel | .55, dès r .30 | .30·sp, dès r .42 |
Coût : mêmes lectures de texture ; quelques opérations ; à la croisière le FXAA (5 lectures) au lieu du flou (6) ⇒ un poil moins cher.

## 3. VU / PAS VU
- PAS VU à l'image : la machine est montée à une charge de 400-670 (7 h) ; le banc a été retiré de la file avant d'ouvrir Chrome.
- VÉRIFIÉ hors navigateur (scratchpad t.cjs, l'objet ACESShader évalué avec des bouchons) : les 5 remplacements s'appliquent au
  programme du téléphone ET de l'ordi (l'aberration seulement à l'ordi, normal), le retour v2→v1 de `dbgFlou({v:0})` redonne les
  lignes d'origine, les 3 remplacements de COURBE_V2 ne sont pas touchés. Syntaxe JS 0 erreur, garde OK. La COMPILATION GLSL n'est
  pas vérifiée (pas de validateur hors navigateur) : `sp` est déclaré dans `main` avant le `if`, `e` est local au bloc — risque faible.
- À FAIRE dès que la charge < 40 : `node $G/banc/flou-vitesse/ab.cjs` (1 ouverture, ~3 min) → planche-iphone.png, vitesses.png
  (v1/v2 à s .075/.2/.6/1 + variantes « doux » [.30,1.6,.6] et « franc » [.22,2.4,.9]), mesures de netteté par zone ; réglage à
  chaud ensuite par `dbgFlou({fv:[rayon,force,warp,courbe]})`, puis reporter dans `uFv` (une ligne).

## POUR LES AUTRES (propositions, pas dans le code)
- Le sentiment de vitesse se porterait mieux par le FOV (CAM_HEROS.kick à l'allumage du boost) que par le flou : zone caméra, pas la mienne.
- `CAM_HEROS.flou` (.2) devient presque sans effet sous FLOU_V2 (sp < .02 jusqu'à ~1,1× la croisière) : c'est voulu.
