# perf-iphone7 — LE COÛT PAR IMAGE SUR iPHONE 7 (passe de sortie, 2026-10-13/14)

Agent perf-iphone7 · copie `$R/wt/perf-iphone7` · branche `sortie2/perf-iphone7` · bancs `$R/banc/perf-iphone7/`.

## L'EXISTANT (lu avant de toucher)
- **Pas de détection d'iPhone 7.** `IS_MOBILE` = tout téléphone tactile ; `IS_LOW_END` = IS_MOBILE (ou ≤ 4 cœurs) ; Safari iOS plafonne
  `navigator.hardwareConcurrency` à 2 sur TOUS les iPhone, et WEBGL_debug_renderer_info dit « Apple GPU » partout → rien ne distingue un
  A10 d'un A17. Un iPhone 7 démarre donc comme un 15 Pro : ACCUEIL en VHD (DPR 2 = 1334×750 = 1 M pixels, ombre 2048, bloom plein),
  course à QL k=0 (ombre 1024, bloom plein, flou radial), puis la règle QL descend cran par cran (1,1 s par pas, sonde avant chaque baisse,
  5 s de grâce au départ) et le FILET de l'accueil ×0,8 toutes les ~3 s après 2,5 s de lenteur TENUE + sonde.
- Crans (RAPIDE, téléphone) : 0 plein · 1 ombre ½ en vol · 2 ombre 768 · 3 bloom ¾ · 4 ombre 512 · 5 flou radial coupé ·
  6-7 DPR 1 → 0,85 (plancher net) · 8-9 → 0,7 (plancher bas, effondrement seulement) · 10 bloom éteint. `dbgQual(k)` force et fige.
- La règle QL vise 60 i/s (16,7 ms) : un téléphone qui ne peut pas les tenir descend jusqu'au plancher et tourne à 40-50 i/s irréguliers
  (une image sur deux à 33 ms = à-coups) — exactement ce que la mission interdit (« 30 i/s STABLES »).

## BANCS
- `ouvre7.cjs` : B.ouvre + sonde MÉMOIRE posée avant le jeu (chaque texture / cible / tampon WebGL compté à sa création, toiles 2D suivies
  par WeakRef, tas JS), respecte le sémaphore du banc commun.
- `mesure.cjs <tag> [cpu] [vp] [scènes]` : par scène, fenêtre AUTO puis BAS (dbgQual(kMax) ; menu : dbgDPR(1)) — i/s, centiles rAF, pics,
  chrono de la PUCE (`dbgCout`), appels, triangles, pixels, mémoire. JSON `res-<tag>-<vp>-cpu<n>.json`.
- Hooks ajoutés au jeu : `dbgCout(1|0)` (le coût de l'image ENTIÈRE : renderer.info cumulé sur toutes les passes + chrono de la puce),
  `dbgSable(on)` (bac à sable : mesures longues sans fin de partie).

## MESURES
(en cours)

## POUR LES AUTRES
(en cours)
