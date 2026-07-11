# CASH CAR — guide projet pour Claude Code

## Le jeu
Runner arcade 3D dans le ciel (Three.js r128). On conduit sur un ruban de route suspendu,
on saute, vrille, rebondit sur les tranches, traverse des nuages, ramasse pièces et nitro.
Une seule vie. 14 voitures à débloquer en gagnant de l'argent. Langue : français.

## Structure
- `index.html` — TOUT le jeu (HTML + CSS + JS dans un seul fichier, ~3200 lignes). C'est voulu : ne pas le découper sans demande explicite.
- `assets/audio/announcer/*.mp3` — 9 voix d'annonceur. Le TITRE du fichier = la condition de déclenchement.

## Lancer / tester
- Serveur local : `python -m http.server 8000` (ou `npx serve`) puis http://localhost:8000 — nécessaire pour que les mp3 chargent proprement.
- Vérif syntaxe rapide : extraire le JS entre `<script>` et `</script>` puis `node --check`.
- Déploiement : zipper `index.html` + `assets/` et glisser le zip sur Netlify Drop.
- Pas de build, pas de dépendances, pas de framework. Three.js vient du CDN cloudflare (r128 — NE PAS changer de version sans tester : l'API a bougé après r128).

## Architecture (repères dans index.html)
- **Ciel/décor** : skyDome shader, soleil « 1.61 », horizonGlow, RAYS, pigeons.
- **Nuages volumétriques** (`CLOUDS`, `mkCloud`, `buildClouds`, `updateClouds`) : grappes de sprites sur ressorts, traversables, teintés par HAUTEUR (sommets crème au soleil, ventres mauves). Textures cumulus 4 couches, BASE PLATE 1 variante sur 2. 6 familles : bancs SUR la route dont MEGA-MURS r 34-58 (la voiture disparaît ; freinent `vA`, secouent la caméra), nuages de VOL (coussin d'air + regain d'airtime via `c.refT`, budget 1,2 s/nuage/vol, turbulence sur `airRoll`), TOURS GÉANTES (`giant`, r 120-260, base plate ; 1/3 `cross` = PLANTÉES sur la piste, les autres `noFog:true` pour percer la brume jusqu'à l'horizon), MER DE NUAGES sous la piste (`sea`, ±900 m, noFog), ouate à mi-distance, VOILES d'altitude (`veil`, noFog). `buildClouds` consomme UN SEUL `rr()` puis roule sur son propre mulberry32 : retoucher les nuages ne rebrasse plus la génération en aval. `cloudInS` pilote : voile blanc `#cloudFx`, fog resserré, sons feutrés, poussière d'or (`sparkGold`). `QUAL_LOW` (garde-fou dans `loop`) : <45 fps soutenus → 1 bouffée sur 3 masquée. Étalonnage cinéma : `body>canvas{filter:saturate/contrast}` + vignettage `#vig`.
- **Piste** (`genCtrl`, `buildTrack`, `frameAt`) : Catmull-Rom + repères T/N/B. Deux faces roulables (`side` ±1). ATTENTION : `rnd` (mulberry32 seedé) est consommé séquentiellement dans buildTrack — insérer/retirer des appels `rnd()` change toute la génération en aval.
- **Voiture** (`CARS`, `buildCar`) : 14 specs, meshes procéduraux.
- **Modes** : `mode` = 'drive' | 'fall' | 'boom'. Physique conduite dans la boucle, vol dans le bloc 'fall', `tryLand()` gère atterrissage, BUMPS (rebond tranche) et SNAKE LOOP.
- **Announcer** (`ANN_LIB`, `annSpeak`, `annRoll`) : chaque condition déclenche sa voix EXACTEMENT 1 fois sur 3 (paquets de 3, place aléatoire). TOUTES les clés ont `first:1` : la voix se présente à sa 1re occurrence, ensuite elle se mérite. Couches : voix (`ANN_VOICE_VOL=.58`) + doublure démon pitchée (.26) + 2 échos dorés (161,8/323,6 ms). Ne jamais laisser un fichier manquant planter le jeu (`e.dead`).
- **Économie** : `DENOMS` (valeur des pièces ×10 par niveau), `THRESH` (paliers cumulés, courbe d'effort croissante 8→105 équiv. pièces). Revenus : pièces (combo x5 max), figures (`denom*8*fallT*mult`), portail (`denom*40` + nitro pleine), tirelire (`denom*8`). Les BUMPS ne payent RIEN en direct : demi-jauge d'airtime + style + `mult+=bounceN*.75` au verdict — tout se cash à l'ATTERRISSAGE. Fever = tout ×2 pendant 10 s.
- **Pouvoirs** (`PWR_DEFS`, `mkPower`, `pwrNitroT/pwrAirT/pwrSpdT`) : orbes rares sur la piste (spawn dans `spawnPickups`, ~1 tous les 430-810 m). `n` = NITRO INFINIE 6 s (jauge pleine, zéro drain), `a` = AIRTIME INFINI 10 s (pas d'explosion à 6 s, camembert cyan, jauge neuve à l'expiration), `v` = SPEED UP +60 % 6 s (multiplie l'avance `s/lat` et le compteur, pas `vA`). Compte à rebours dans `#pwrChip`, reset dans `resetGame`.
- **Sensation de vitesse** : vibration caméra quadratique dès 190 km/h (`spdN`, `CAM_SHAKE_V=.78`) + roulis, speed lines canvas dès 230 km/h (`drawSpeedLines`, #slCv), sifflement d'air (`whF/whG`, >280 km/h), FOV dynamique, compteur qui gonfle/rougit.
- **Audio** : tout en WebAudio procédural sauf les voix (HTMLAudio). `initAudio()` exige un geste utilisateur. Boutons `#sndBtn` (SON : `AC.suspend()/resume()`) et `#voxBtn` (VOIX : gate dans `annSpeak`), persistés `rrSfx5`/`rrVox5`.
- **Persistance** : localStorage — `rrBest5` (record), `rrLeaders5` (top 10), `rrBestCar5` (meilleure caisse à vie), `rrSfx5`/`rrVox5` (mutes).

## Conventions
- Style compact existant (pas de point-virgule manquant, minification manuelle légère) : s'y conformer.
- Commentaires en FRANÇAIS, avec la voix du projet (imagés, précis).
- Perf d'abord : pools de particules réutilisés (`makePool`/`spawnP`), pas d'allocation dans la boucle (réutiliser tmp/tmp2/tmp3/cldV1…), sprites plutôt que géométrie lourde.
- Tout nouvel élément visuel doit être disposé proprement au rebuild (`trackMeshes` ou équivalent de `disposeClouds`).
- Ne jamais casser la boucle : le try/catch de `loop()` masque les erreurs (voir console).

## Pièges connus
- `tmp3` & co sont partagés : toujours `set`/`copy` avant usage.
- Les positions des sprites de nuage sont LOCALES à leur groupe (monde = `g.position + sp.position`).
- `checkUpgrade()` doit être appelé après CHAQUE gain d'argent.
- `annSpeak(key,prio,forced)` : `forced=true` uniquement pour rejouer la file d'attente (bypass du 1/3).

## Idées de suite (backlog)
- Boucliers/malus dans les nuages sur route (risque/récompense de la percée à l'aveugle).
- Mode contre-la-montre par zone + fantôme du record.
- Voix supplémentaires (bump.mp3, fever.mp3) — suivre le pattern ANN_LIB + règle du 1/3.
- Gamepad (API Gamepad), tactile mobile.
- Réglage qualité auto (compter les ms/frame, réduire nuages/particules si <50 fps).
