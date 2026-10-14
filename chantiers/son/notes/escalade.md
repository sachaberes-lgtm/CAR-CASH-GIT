# Les échelles de récompense — session SON « escalade » (2026-10-14)

Branche `son/escalade`, worktree `son/wt/escalade`. Rien de neuf cuit : hauteur, volume, pan, doublures de sons existants.
Bancs : `son/banc/escalade/*.cjs` (node, sans navigateur).

## 1. Les pièces — `blip()` + `const SON_P_AR`
- CE QU'ON ENTEND EN PLUS : après la 11e pièce (+24), la ligne ne mitraille plus la même note aiguë : elle redescend
  21-19-16-14-12 puis remonte 14-16-19-21-24 (aller-retour sur l'octave haute, période 10). Toutes les 10 pièces d'affilée
  (10e, 20e, 30e… qui tombent toujours sur +21), une doublure discrète : la même pièce à st−5 (+16, la quinte de la note une
  octave en dessous), −7 dB sous la pièce (vol −3 contre +4), 30 ms après — un « palier » qui épaissit sans crier.
- VALEURS : `SON_P_AR=[21,19,16,14,12,14,16,19,21,24]` ; doublure `{st:st9-5,vol:-3,t:.03}`.
- LE CD (0,018 s) : la doublure part AVANT la pièce, et seulement si la dernière pièce jouée par blip date d'au moins 18 ms
  (`blip._t`, chronométrée sur `AC.currentTime`) — on ne double jamais une pièce que le lecteur va avaler. Jouée après, la doublure
  (programmée à +30 ms) aurait poussé `S.der` dans le futur et avalé la pièce suivante d'une ligne rapide.
- TRANSPOSITION : la note max reste +24 (comme avant). `bases:[0,12]` : à ton 0 c'est base+12 pile ; avec `SON_TON` +5/+6
  (ville-n, + frénésie) on monte à base+18 — c'était DÉJÀ le cas avant (GAMME_P finissait à 24) ; le correctif y passe 1 pièce
  sur 10 au lieu de toutes. Doublure à +16 : base 12 + 4.
- PROVOQUER : une ligne de 12+ pièces sans lâcher (combo, fenêtre 3 s) ; 10 pièces d'affilée pour le palier.
- RISQUE : faible. L'ancien chemin (sans banque, oscillateurs) garde son plafond (repli rare, non touché).

## 2. Les gammes du vol — `sonPdAR()` (neuf, à côté de `sonPd`), `echSt()`, `froleSnd()`, l'appel dans `frole()`
- CE QU'ON ENTEND EN PLUS : passé le 10e geste d'un vol (demi-tours de vrille, maillons, BIG AIR, AIR MONSTRE, paliers de
  l'échelle — tous par `echSt`), la note ne se fige plus sur +21 : 19-16-14-12-14-16-19-21… (aller-retour sur l'octave haute).
  Même chose pour le SLALOM après 10 plots/satellites/voitures frôlés d'affilée. Et le souffle du frôlé passe du CÔTÉ de
  l'obstacle (pan ±0,35 au plus).
- VALEURS : `SON_ECH_AR=[8,7,6,5,6,7,8,9]` (degrés) ; max +21 comme avant (bases [0,12] : jamais plus haut qu'avant).
  Pan = 0,35 × clamp(écart latéral à l'écran / 2,5 m) : l'écart est mesuré en vrai, `ob.mesh.position − caméra` projeté sur l'axe
  droit de la caméra (matrice de l'image précédente). Les trois appelants de `frole()` passent un objet avec `.mesh.position` en
  monde (plot : fantôme posé par placeCone ; satellite : `fr.mesh.position=q` ; trafic : `VTR.du` recopié juste avant). Sans objet → 0.
  Vecteurs `SON_FR_D/R/C` réutilisés. NaN gardé à 0.
- PROVOQUER : 6 vrilles complètes en un vol (12 demi-tours), ou un long slalom ; le pan au premier frôlé venu (plot à gauche → souffle à gauche).
- RISQUE : faible. Si la caméra est dans un mode exotique (vue libre), le pan suit l'écran — ce qui est voulu. L'ancien chemin
  oscillateurs (sans banque) non touché.

## 3. Les fruits — `sonFruitSt()` + `SON_FRUIT_ST` (neufs, juste avant `fruitCroque`), l'appel son de `fruitCroque()`
- CE QU'ON ENTEND EN PLUS : la rafale de fruits MONTE vraiment : le splotch à 0, +2, +4, +7 demi-tons, puis aller-retour +4/+7
  (avant : +0,4 demi-ton par fruit, plafonné à +2 au 6e, sous un hasard de ±1 demi-ton → inaudible). Le mixeur `fruit.rafale`
  (dès le 3e fruit, `key:1`, dans la gamme du morceau) monte avec : 0, 2, 4, 7, puis 4/7.
- VALEURS : `rate = 2^(sonFruitSt(fruitRaf−1)/12)` (×1,5 au plus haut) ; `fruit.rafale {st: sonFruitSt(fruitRaf−3)}`.
  Le pas (2 à 3 demi-tons) dépasse le `rj` .06 (±1 st) de la fiche, gardé. `fruitRaf` (non plafonné, remis à 0 quand la fenêtre
  de rafale expire) porte la série ; `r` (plafonné à 6) garde ses rôles visuels.
- PROVOQUER : enchaîner 4+ fruits dans la fenêtre de rafale (ligne de fruits, un toutes les ~2,4 s).
- RISQUE : faible. Les fiches `fruit.*` sont `key:0` : le `rate` monte en intervalles de pentatonique mais pas dans la tonalité du
  morceau (ce sont des bruits de pulpe, pas des notes). La pastèque (`key:1`, bases [0]) monte de même, +7 au plus.

## 4. Les menus — `SON_UI`, `SON_UI_MEL`, `sonUiSt()` (neufs, juste avant `uiClic`), la 1re ligne de `uiClic()`
- CE QU'ON ENTEND EN PLUS : un appui seul = la note de base, comme avant. Des appuis RAPPROCHÉS (< 0,6 s) montent doucement la
  pentatonique du morceau : degrés 0-1-2-3 (0, +2, +4, +7) puis 2-3-2-3… ; entre 0,6 et 1,2 s la note est tenue ; plus de 1,2 s
  sans appui, on repart d'en bas. `ui.retour` redescend d'un DEGRÉ (depuis le 3 → le 2, depuis le 2 de l'aller-retour → le 1).
- QUI : `ui.tap`, `ui.nav`, `ui.onglet`, `ui.retour` — les quatre sont `key:1` (vérifié dans la banque : transposés dans la
  tonalité, donc jamais faux). `ui.on/off` (déjà des quintes), `ui.refus`, `ui.danger` (key:0) gardent leur note et ne touchent
  pas la série. +7 au plus : `bases:[0]`, sous l'octave même avec SON_TON +5.
- VALEURS : `SON_UI={i,t}` (index, horodatage `performance.now()`), lu À L'APPUI (le son en pause part plus tard avec la note de l'appui).
- PROVOQUER : feuilleter vite les onglets / vignettes du garage, les réglages ; ◀ RETOUR juste après.
- RISQUE : faible. Pas de son nouveau, pas d'appel en course (uiClic = interface). Remise à zéro par le temps seul.

## 5. `SON_DUCK` — les grands moments creusent le mix
- CE QU'ON ENTEND EN PLUS : quand tombent ×5 / ×8 d'aura, SNAKE LOOP, ESSOREUSE, DAUPHIN ROYAL, DOUBLE POUVOIR, RECORD DE FRÉNÉSIE,
  le verdict MONSTRE et le gros encaissement, le moteur, le vent et la flamme reculent un instant (comme pour ×10, DOUBLE MONSTRE,
  TRIPLE POUVOIR) : la fanfare passe devant au lieu de lutter.
- VALEURS (audit §6) : aura.x5 .2 · aura.x8 .3 · fig.snake .3 · fig.essoreuse .25 · fig.dauphinRoyal .3 · pwr.double .25 ·
  frenesie.record .4 · verdict.1 .15 · argent.gros .15.
- VÉRIFIÉ : les neuf fiches existent dans la banque (+1 à +3 dB, prio 3-5) et sont appelées : `'aura.x'+xv` (aura.x5/x8/x10),
  `'verdict.'+tier` (verdict.1), fig.snake (trickSnd), fig.essoreuse (figSnd, une fois par vol), fig.dauphinRoyal (6e dauphin),
  pwr.double, frenesie.record, argent.gros (fxArgent + pluie de richesse « gros »). Aucune clé en double dans l'objet.
- PROVOQUER : une chaîne d'aura à ×5 puis ×8 ; 4 demi-tours de vrille ; deux pouvoirs à la fois.
- RISQUE : faible. `duckT = max(duckT, v)` : ne fait que creuser les chaînes continues, jamais le gameplay. `argent.gros` sonne aussi
  au CIEL de l'écran titre (pluie de richesse, « gros ») : le creux n'y touche que le vent du menu, s'il y en a.

## Laissé (et pourquoi)
- Les replis SANS banque (oscillateurs de `blip`, `froleSnd`, `crunchSfx`) gardent leur plafond : chemin de secours rare, hors son actuel.
- Le pic +24 des pièces avec `SON_TON` +5/+6 (base 12 + 17/18) : préexistant ; le baisser changerait la montée validée de GAMME_P.
- `rj` des fruits non touché (la montée le domine, ce que demandait la mission).
- Bancs : `son/banc/escalade/{pieces,vol,fruits,menus}.cjs` (node, rejouent les formules du code).
