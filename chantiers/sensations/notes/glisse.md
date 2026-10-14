# Notes de l'agent `glisse` (passe SENSATIONS, 2026-10-14)

⚠ RIEN n'a été essayé en jeu (aucun navigateur) : relu, `verifie.sh glisse` = VERIF OK après chaque détail, c'est tout. Les doses sont à
juger au téléphone. Diff = 40 lignes AJOUTÉES, 0 réécrite. Tout tient dans UNE fonction neuve, `sensGlisse(on)`, appelée en tête de
`driftTick` (`if(SENS)try{…}catch(e){}`) ; état : `SENS_GL` (objet de script, aucune allocation par image).

## Inventaire (ce qui EXISTE déjà — laissé tel quel)
- CHARGE (`driftTick`) : paliers .45/.9/1,4 s → son `drift.charge` (note qui monte), `hap(10)` (`[14,30,14]` à l'ULTRA), étincelles
  bleu/or/rose aux deux roues arrière toutes les 45 ms. → le « tic dans la main à chaque palier » EXISTE : rien ajouté dans la main.
- RELÂCHÉ CHARGÉ : poussée, `fovPunch`, `shake`, `hap([12,30,20])`, son `turbo.mini/super/ultra`, flash rose + ralenti à l'ULTRA, aura
  muette. Aucune particule ni mouvement de caisse propre au relâché (le tangage `pitch9` s'accroupit de 1,7° en fondu sous `boost`).
- EN GLISSE : `slipB` (nez jusqu'à 24°), roulis +4° (`rollT`), nez qui plonge 2° (`pitch9`, en fondu), power-slide visuel `driftYaw`,
  fumée de gomme (`dust`, à la seconde, héritant de la vitesse), traces de pneus (`traceTick`), crissement (`glisse9`).
- FRONDE (`frondeLache`) : gerbe d'or aux pots, champ, secousse, vibration, son. Complet : rien ajouté.
- Réception en travers : `driftT` relance fumée et crissement.

## Détails (dans l'ordre des commits)
### 1. L'accroche — c7341b3
- Le joueur tire le pouce vers le bas en braquant : à l'instant où la glisse part, la caisse se JETTE sur ses roues extérieures
  (`sensCoup(-sign(steer)*1.3, .8, -.45)` ≈ +3° de roulis, 2° de nez, 2 cm) et le pouce reçoit un tic (`sensHap(8,1)`).
- Avant : rien à cet instant (roulis et nez s'installaient en fondu, première vibration au palier bleu, 0,45 s plus tard).
- Anti-clignotement : pas de coup si la glisse précédente s'est finie il y a moins de 260 ms.
- Provoquer : au-dessus de 42 % de la vitesse max, braquer et tirer le pouce vers le bas (↓ + flèche au clavier).
- Risque : le SENS du coup suppose que `carRoll9` penche du côté de `steer` (lu dans `rollT`) ; si la caisse sursaute vers l'intérieur,
  inverser le signe. S'ajoute au roulis de drift (borné par rollV ±5).
### 2. Le relâché chargé — bd96608
- Relâcher avec un niveau : la caisse S'ASSOIT (`sensCoup(0, -(.4+.3 lv), -(.25+.15 lv))` : nez levé ≈ 2° bleu → 3,5° ULTRA) et la charge
  ÉCLATE aux deux roues arrière dans la couleur du niveau (`sparkBurst`, 4/5/6 par roue, vitesse 8).
- Provoquer : tenir la glisse ≥ 0,45 s (étincelles bleues) puis relâcher ; tenir 1,4 s pour le rose.
- Risque : se cumule avec le cabrage de l'allumage nitro (`NFX.ign`) si la nitro part au même instant (SCOUP.p borné ±8°) ; 8 à 12
  particules prises dans des anneaux de 70 (bleu/rose) déjà sollicités par la charge.
### 3. La gomme reprend — ec85f61
- Après le relâché, quand l'angle de glisse repasse sous 3,5° (≈ 0,25 s) : la carrosserie est RENVOYÉE vers l'intérieur
  (`sensCoup(sg*(.5+.8k),0,.2k)`, k = angle tenu / 24°), 2 bouffées de `dust` par roue arrière (si > 14 m/s), tic `sensHap(7,1)`.
- Seuil franchi (pas un minuteur) → indépendant des i/s ; périmé 0,7 s après le relâché (décollage, pause, mort) ; n'arme qu'au-delà de 7° tenus.
- Provoquer : une glisse franche, relâcher, regarder la caisse se redresser d'un coup sec juste après la poussée.
- Risque : après un turbo, c'est un 2e temps (turbo… clac) — s'il paraît de trop, baisser `.5+.8*k`. Aucun SON : voir « sons à faire ».
### 4. Le palier pèse — e11d876
- À chaque palier (bleu, or, rose) la caisse se TASSE d'un coup sec (`pompe` −.42 / −.59 / −.76 m/s ≈ 1,5 → 3 cm) et verse un rien de plus
  (`versLat` .25 × niveau). Pas de vibration (elle existe).
- Provoquer : tenir une glisse 1,5 s et regarder la carrosserie aux trois changements de couleur.
- Risque : discret ; lu une image après le palier (invisible). Sens du roulis : même hypothèse qu'au détail 1.
- Sous « Réduire les animations » : aucun coup de caisse ni particule neuve ; les deux tics (1 et 3) restent.

## Écarté
- Tic dans la main à chaque palier : EXISTE (`hap(10)` / `[14,30,14]`).
- Contre-braquage visible des roues avant : les roues qu'on voit sont des essieux SOUDÉS (`ESSIEUX`, `carVit` ne fait que les faire
  rouler) ; les braquer = toucher au modèle de chaque caisse, hors d'une passe de 20 minutes sans navigateur. À faire à part.
- Plus de fumée à l'entrée / pendant la glisse : la fumée suit déjà `glisse9` ; loi « pas de voile derrière la caisse ».
- Secousse d'écran à l'accroche ou à l'ULTRA : le relâché secoue déjà (`shake .14×niveau`) ; pas de doublon.
- Vibration continue pendant la glisse : interdite par le brief.
- Fronde : déjà complète.

## Sons à faire
- Un « chirp » de pneu qui raccroche (40-80 ms, sec) pour le détail 3 : `pneuMord` se tait sous SONV2, `virage` est le son d'une
  récompense (VIRAGE SERRÉ) — le réemployer aurait menti.
