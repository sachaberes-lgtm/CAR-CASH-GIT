# L'oreille neuve n°3 : audit son (lecture seule, 2026-10-14) : moteur au sol, glisse, ambiances, mondes, « hors banque »

Base : `son/integ/VERSION PRINCIPALE/index.html` (n° de ligne = ce fichier, ils bougent). RIEN ÉCOUTÉ : tout vient du code et de calculs
(scripts dans `son/banc/oreille3/` : `tiers.js` table des 30 moteurs, `prop.js` table après correctif, `niv.js` niveaux des bruits directs,
`skid.js` niveau du crissement, `gears.js` cadence des rapports). Les niveaux « dBFS RMS 200 ms » sont des ESTIMATIONS (bruit blanc filtré
rejoué hors ligne, sans pondération K) : ils servent à classer, pas à régler au dB. Repères de la table de cohérence : pièce −30 (+4),
récompenses −24…−29, explosion −16, cratère −20.
Décisions respectées : la note du moteur ne monte pas au-delà de la croisière (pas touché au `tgt`/`rpm`), burn-out/`BURN`/`DON` intouchés,
aucune recuisson de banque, aucun fichier de Léo réencodé.

## Les 10 défauts, du plus audible au moins audible

### 1. Chaque plongeon dans la mer du SOLEIL DE JADE sonne presque comme une explosion (et c'est la map du JOUER)
- PREUVE : `jadeEauVol` l. 16400 : `subBoom(.4+.35*k9);noiseBurst(.6,.4+.25*k9,520);noiseBurst(.9,.18+.12*k9,2600)` PUIS `sfx('flaque.eau')` +
  `sfx('nuage.entre')` en plus. Ces trois appels sont directs (hors banque, hors mixage cohérent, hors `SON_DUCK`) et jouent même quand
  `SONV2` est vrai. Estimation (`niv.js`) : plongeon k=.3 → −17,5 dBFS, k=1 → −14,7 (iPhone −18) ; l'explosion de la banque est à −16 LUFS200.
  Même défaut, un cran plus bas, à la sortie de l'eau (l. 16413 : `noiseBurst(.8,.34,2200);noiseBurst(.5,.3,450);subBoom(.22)` → −23) et au
  ricochet (l. 16388 → −26). C'est un événement POSITIF (figure PLONGEON, flow) qui sonne plus fort qu'un verdict 3 (−24) ou un cratère (−20).
- POURQUOI : à la fréquence où on plonge sur la map par défaut, la hiérarchie « chocs/danger au-dessus, gestes en dessous » est inversée ;
  sur iPhone le bruit lowpass 520 Hz + le 2e à 2,6 kHz couvrent la musique GLISSE.
- CORRECTIF (3 lignes, son seul, aucun gameplay) : n'appeler les bruits directs que si `!SONV2`, et doser la banque :
  l. 16388 `if(SONV2)sfx('flaque.eau',{vol:2});else{noiseBurst(.28,.32,1500);subBoom(.18);}`
  l. 16400 `if(SONV2){sfx('flaque.eau',{vol:-2+8*k9});sfx('nuage.entre',{vol:-6+6*k9});}else{subBoom(.4+.35*k9);noiseBurst(.6,.4+.25*k9,520);noiseBurst(.9,.18+.12*k9,2600);}`
  l. 16413 `if(SONV2){sfx('flaque.eau',{vol:2});sfx('nuage.sort',{vol:-3});sfx('air.regain');}else{…les trois directs…}`
  Ajouter `duckT=Math.max(duckT,.35+.3*k9)` au plongeon pour que le moteur se creuse comme pour un grand moment.

### 2. Les moteurs 17 à 30 sont des sifflements de 0,9 à 2 kHz : le « moustique » de la décision de Léo, mais dans la deuxième moitié du jeu
- PREUVE : `engSndParams` l. 34604-34605 : `fF=(e.i+rpm*e.r)*ENG_PITCH(.62)…`. Table `tiers.js`, fondamentale à régime plein : palier 10 → 217 Hz,
  13 → 480, 16 → 692, 17 → 941, 20 → 745, 24 → 973, 26 → 1 342, 27 → 1 548, 29 → 1 872, 30 → 2 081 Hz. Les ondes de 20-30 sont presque des
  sinus (`h:[1,.05,.02,…]`). Le « sub » suit `subF=fF*.5` : 1 040 Hz au palier 30 (« le plus GRAVE et le plus AIGU, rien au milieu » ne tient pas :
  il n'y a plus de grave à cruising). Table non monotone : 21 → 874, 22 → 585, 23 → 121, 24 → 973. Le commentaire l. 34593-34603 fixait « sous
  200 Hz » pour un moteur qu'on sent ; `ENG_PITCH` a ramené les paliers 1-12 mais pas les `r` des paliers 17-30 (jusqu'à 3 300).
- POURQUOI : c'est la voix du jeu 100 % du temps, et après 15 paliers c'est un sifflet continu de 1-2 kHz (zone la plus sensible de l'oreille et
  celle que le haut-parleur de l'iPhone rend le mieux). Aucune fatigue ne se voit en lisant le code des paliers bas, tout se joue en haut.
- CORRECTIF (une ligne dans le bloc `<<<SON-MOTEUR>>>`, donc `moteurs.html` suit) : compression douce de la fondamentale au-dessus de 420 Hz,
  la brillance du filtre continuant à lire la fréquence brute :
  `const fF0=(e.i+rpm*e.r)*ENG_PITCH*(1+.04*nA)*(1+(st.wob||0)); const fF=fF0<420?fF0:420*Math.pow(fF0/420,.30);`
  puis `lpB=…e.fq+fF0*e.fr…` (fF0 au lieu de fF, pour garder le timbre). Résultat (`prop.js`, plein régime) : 17 → 535, 20 → 499, 24 → 540,
  26 → 595, 29 → 658, 30 → 679 Hz ; sub 250-340 Hz ; 1-12 inchangés au Hz près ; la montée idle → croisière reste un vrai « spool » (35 → 679 Hz).
  La note ne monte pas plus haut que la croisière, la décision est respectée. ⚠ toucher au timbre des 14 paliers du haut : à juger à l'oreille
  par Léo (ouvrir `moteurs.html` après correctif, paliers 17, 24, 30).

### 3. Neuf moteurs émettent un sinus pur de 9 kHz, fixe, hors filtre
- PREUVE : `whineF:e.whine?Math.min(9000,fF*e.whine):2000` (l. 34621). Pour les paliers 20, 21, 24-30 `fF*whine` dépasse 11 000 Hz dès
  rpm ≈ .76 : la note reste collée à 9 000 Hz. Et ce sifflet part par `engWhine → ewf (lowpass 9000) → engWhineG → gainN` (l. 35098-35100) : il
  NE PASSE PAS par `filt` (le lowpass 700-2 500 Hz du moteur) ni par la saturation. Une dent de scie dont le filtre est à sa propre
  fréquence = un sinus pur. Gain : `(.10+.16*ch)*rpm^.7*(1-.45nA)*.4` (≈ .06 en charge). Paliers 6, 7, 9, 12, 18, 19 : 1,7 à 6,3 kHz, même chemin.
- POURQUOI : un sifflement d'acouphène constant tant qu'on roule vite ; il n'a plus aucune information de vitesse (immobile à 9 kHz).
- CORRECTIF (même bloc) : `whineF:e.whine?Math.min(3400,1000+2400*Math.min(1,rpm)*(.7+.3*Math.min(1,e.whine/30))):2000,` (monte avec le
  régime : ≈ 2 000-2 200 Hz à mi-régime, 2 900-3 400 plein régime, tous paliers à sifflet), et `whineG` ×.7 tant que `fF0>420`. À écouter.

### 4. Le « brrrr » de charge du drift est faux par rapport à la musique et plus fort que le crissement qu'il accompagne
- PREUVE : `driftChargeSnd` l. 35372-35391 : deux carrés synthétisés en direct (jamais dans la banque) à `DRS_BASE=[123.47,164.81,246.94,329.63]`
  (si-mi-si-mi) et leur quinte ×1,5, fixes, `f=base*(1+.25*fr)` (l. 35385). La banque, elle, est transposée par `sonTonSuit` (`SON_TON` va de −2 à
  +5 demi-tons selon le morceau ; GLISSE de Jade = +1). Au passage de chaque palier la banque joue `drift.charge` DANS la tonalité
  (`sfx('drift.charge',{st:sonPd(…)})`, l. 28298/28308) pendant que le bourdon carré continue à mi. Niveau : gain `.014+lv*.008` → carré à −28 dBFS
  au niveau 3, alors que le crissement à plein drift est à −35 (point 5).
- POURQUOI : à chaque drift, deux notes se frottent (jusqu'à 5 demi-tons d'écart sur la musique de ville) et le bourdon écrase le crissement.
- CORRECTIF : `const tr=Math.pow(2,(sonTonSuit._t||0)/12);` au début du bloc `if(on){` puis `const f=base*tr*(1+.25*fr);`
  (l. 35385, une lecture + un produit). Et `DRS.g.gain` → `lv?.010+lv*.006:.005` (−3 dB) une fois le point 5 appliqué.

### 5. Le crissement de glisse est 10 à 20 dB sous le moteur : il ne « signale » plus la limite
- PREUVE : l. 50798 `skidG = min(.17, drift^1.3*.15*(.4+min(1,spd3/380)))`, passé dans deux passe-bande Q 8 et 10 (l. 35111-35112 : ~130 Hz de bande
  utile). Simulation (`skid.js`) : drift .4 à 300 km/h → −46 dBFS, drift 1 → −35,6 ; le moteur seul (sinus ev .05) est à −29 au minimum, avec
  le grain −26. Le crissement n'est donc jamais plus fort que −9 dB sous le moteur et reste inaudible pour une glisse légère.
- POURQUOI : c'est le seul retour sonore de « tu es à la limite » ; l'exposant 1,3 l'éteint exactement là où le joueur en a le plus besoin.
- CORRECTIF : `min(.30,Math.pow(drift,1.0)*.20*(.5+Math.min(1,spd3/380)))*dk` : +4 dB à plein drift, +7 à drift .4. À juger à l'oreille (le
  cap .30 peut se baisser à .26). Le burn-out du garage réécrit `skidG` lui-même (l. 48108-48110) : NON TOUCHÉ, ce correctif est dans la boucle de course.

### 6. Le rase-bord gronde à 190 Hz : le haut-parleur de l'iPhone ne le joue pas
- PREUVE : `raseSnd` l. 35401 `bp.frequency.value=190;bp.Q.value=1.3` sur bruit haché par un carré de 18-60 Hz ; gain `.09+raseT*.12` (≤ .22) → ≈ −42 dBFS
  avant le haut-parleur. Le moteur a `lpMin:TEL_NATIF?700:0` et `subBoom` a une version `TEL_NATIF` (190→80 Hz) pour la même raison ; le rase-bord, non.
- POURQUOI : frôler le vide à 700 km/h (la prise de risque que le jeu paie le plus) n'a de son qu'au casque / sur ordi ; sur téléphone seul le tic
  haptique (`hap(4)`) existe.
- CORRECTIF : `bp.frequency.value=TEL_NATIF?520:190;` et `Math.min(.22,.09+raseT*.12)*(TEL_NATIF?1.5:1)` (l. 35401 et la ligne du gain).

### 7. Des mondes entiers n'ont pas de voix : pluie (ville, minuit, orage), mer de Jade, carrière
- PREUVE : boucles vivantes de tout le jeu (grep `loop:true`) : `garage.ambiance`, `garage.feu`, `chute.vent` (piqué de JOUER), `espace.ambiance`
  (−24, bus amb). `nuages.ambiance` est coupée EXPRÈS (`NUAGES_AMB=false`, Léo). La pluie existe en rendu (`PLUIE`, `LVL.pluie`, `uWet`) mais aucun
  son de pluie : seul `tonnerre` et `pluie.billets` (les billets). Jade (map du JOUER) : le vent de vitesse (`windG`) et la musique ; la mer
  n'a pas de voix à part le plouf (point 1). Réglages / carrière : aucune ambiance, seulement la musique de lobby.
- POURQUOI : la ville a un signe visuel fort (flaques, pluie, néons) sans son qui le porte ; Jade n'a aucune signature sonore alors que c'est le
  premier niveau que voit un joueur.
- CORRECTIF sans banque (même recette que `chuteDoux`, l. 45297 : deux `bufferSource` bouclés + filtres + un gain mené par `stt`, `porte` ouverte à
  la demande) : `pluieSon(dt)` appelé dans la boucle près de `windG` (l. 50784) : `pinkBuf(2)` en boucle → highpass 1 400 Hz → lowpass 7 500 Hz
  (Q .4), gain `0.0075*LVL.pluie*(mode==='boom'?0:1)*(1-.8*JEAU.k)*dk`, fondu `stt(…,.4)`, coupé si `LVL.pluie<.02`. Niveau cible ≈ −46 dBFS
  (au niveau de `garage.ambiance` −42/espace −38, sous le moteur). Jade : brun lowpass 240 Hz modulé par une houle de 8-12 s,
  gain `.006*(0.35+.65*clamp(1-(carY-JADE.eauY)/450,0,1))`, ainsi la mer se rapproche quand on descend. À écouter AVANT de garder : c'est le
  seul point qui AJOUTE un son (les autres corrigent). Pas d'impact gameplay ; ne rien brancher en plein burn-out/garage.

### 8. Le moteur est un bourdon parfaitement fixe tant que la vitesse est stable
- PREUVE : l. 50738 `wob` n'existe que pour `eng.wob` ET `engRpm<.29` (`max(0,1-engRpm*3.5)`) ; au-delà, `engRpm` en dernier rapport = `sN`-bijection
  (`pos^.9`) : à vitesse stable la fondamentale est constante à ±0 Hz (seul le LFO d'amplitude 7-24 Hz bouge, et il module le GAIN, pas la hauteur).
  `drift9` (marche aléatoire lente de `engLoadStep`, ±.5, τ ≈ .6 s) n'est lu que par `lp` (`1+dr*.015`) et `transF`.
- POURQUOI : fatigue sur les longues lignes droites des paliers 20-30 (sans rapports : `gr:1`) ; un vrai moteur respire de ±0,5 % même au régime
  stabilisé.
- CORRECTIF (hauteur ±0,7 %, sous le demi-ton, donc ni moustique ni vibrato) : ligne 50744, argument `wob:wob` → `wob:wob+(.012*drift9)*Math.min(1,engRpm*2.2)`.
  Aucune formule du bloc `<<<SON-MOTEUR>>>` n'est modifiée.

### 9. Les rapports de boîte partent en rafale dans les 2 premières secondes de chaque course, hors banque
- PREUVE : `gears.js` (montée type 1−e^(−t/2,2)) : rapports montés à 0,16 / 0,42 / 0,76 / 1,22 / 1,85 / 2,8 / 4,7 s (8 rapports) ; 0,2 / 0,5 / 0,9 /
  1,6 / 2,5 / 4,3 s (7 rapports). Chaque montée = `subBoom + noiseBurst + crackle + hap(5) + fovPunch 1,8` (l. 50706-50708), 6 « claquements » de ce type
  en ~3 s au départ, justement sur le piqué de JOUER + musique + boost offert. Estimation du coup : −29 dBFS (ordi), −33 (iPhone).
- POURQUOI : sa cadence tombe pile quand l'oreille traite déjà le départ ; trois claquements en 1 s = une mitrailleuse, pas un rythme.
- CORRECTIF : proportionner la cérémonie au rapport : `const q9=.35+.65*engGear/gn; subBoom((.06+.07*engGear/gn)*q9); noiseBurst(.05,.07*q9,3000);
  if(engGear>=gn-1)crackle(…); if(engGear>2){hap(5);fovPunch=Math.max(fovPunch,1.8*q9);}` et passer le garde-temps `loop._shT` de 350 à 500 ms. Rythme
  conservé (« le RYTHME de l'accélération » reste vrai), mais les premiers rapports deviennent des tics. ⚠ fovPunch/hap = ressenti, pas gameplay.

### 10. Les « hors banque » qui restent vivants échappent à la table de niveaux (inventaire ci-dessous)
- PREUVE : voir l'inventaire ; en plus des points 1, 4, 6, 9 : `nitroWhoomp` (bruit brun gain .42 + subBoom : ≈ −21 dBFS à chaque allumage, 5 dB sous
  l'explosion, 15 dB au-dessus d'un verdict 1 ; assumé par Léo « boost à −22 » : à ne PAS toucher), `heistFire` l. 37992 (`boostSnd();subBoom(.34);
  noiseBurst(.5,.2,340);thud(12)` ≈ −21 dBFS, sans `SONV2`), `afficheTap` l. 42379 (deux `chimeNote` 659/988 fixes, hors tonalité), `panneSnd`/`impactSnd`/`fumeTick`
  (campagne VILLE 6, `noiseBurst` directs), `PARIS.murT` l. 15367, `smashPig` (intro).
- CORRECTIF minimum : (a) `afficheTap` : `chimeNote(…)` → `sfx('ui.ok',{st:sonUiSt?…:0})` ou `if(!SONV2){…}` + `sfx('ui.carte')` ; (b) `heistFire` : si le
  braquage est toujours joignable, `if(SONV2){sfx('frenesie.entre',{vol:-6});duckT=Math.max(duckT,.5);}else{…}` ; sinon laisser. Le reste (campagne,
  Paris, intro) : hors du chemin du JOUER, laissé, mais à passer en `if(!SONV2)` à la prochaine passe.

## Inventaire des appels directs (`chimeNote`/`noiseBurst`/`subBoom`/`boostSnd`) : joués avec SONV2 vrai ou non ?
- **MORTS quand la banque est là (repli seulement)** : `blip` (pièces), `froleSnd` (l. 35418 return), `flowSnd`, `rewardSfx`, `bumpSfx`, `coneSnd`, `boomSnd`,
  `engSwapSnd`, `thud`, `trickPop`, `pwrPrisSnd/pwrFinSnd`, `uiClic`, `garLacherSon`, `radarSnd`, `mCompteSon` (l. 52039 après le `return` de la banque),
  la plupart des `chimeNote(noteP…)` de flow/triade/aura (`if(SONV2)sfx(…);else…`), `whoosh`/`boostSnd` des pads, portail, orbite, fronde.
- **VIVANTS avec la banque** : bruits du plongeon/sortie/ricochet de Jade (point 1) ; cérémonie de boîte (9) ; `driftChargeSnd` (4) ; `raseSnd` (6) ;
  `nitroWhoomp` + `nitroSpool` + `blowOff` + `nitroAllume` (le « moteur » de la nitro, voulu) ; POK/pops de nitro (`flamePop`, `subBoom(.05)`) ; allumage en
  vol l. 50837 (`noiseBurst(.35,.2,300);subBoom(.15)` ≈ −28 dBFS, ok) ; retour de flamme l. 49951 (`noiseBurst(.12,.07,900)`, négligeable) ;
  `heistFire`, `afficheTap`, `logoButin`/`cx` (menu de bureau seulement), campagne (`panneSnd`, `impactSnd`), Paris (`murT`), `smashPig`.

## Ce que je n'ai PAS pu juger (aucune écoute)
- Équilibre exact des ambiances de menu (ciel `chuteDoux` .06 + `MUS_CIEL` .15 ; garage `garage.ambiance` −42 LUFS + `garage.feu` −39 ; boutique `bqSon`) :
  les niveaux calculés à la main sont du même ordre (≈ −42 à −50 dBFS pour chuteDoux), rien d'incohérent trouvé dans le code, mais la réponse
  « se répondent-elles ? » demande une écoute ou `dbgVu()`.
- La brillance des paliers 13-19 après la compression du point 2 (leur `lpB` est calculé sur `fF0`, donc inchangée).

## Idée addictive (hors liste)
- Quand le rapport monte, une toute petite « goutte » de 1 dB sur `gainN` (−1 dB en 80 ms, retour en 120 ms) à la place du `fovPunch` des premiers rapports :
  le corps du moteur respire, l'image ne pompe pas. Se pose au même endroit que le point 9.
