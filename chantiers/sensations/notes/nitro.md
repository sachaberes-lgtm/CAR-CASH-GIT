# Notes de l'agent `nitro` (passe SENSATIONS, 2026-10-14)

⚠ RIEN n'a été essayé en jeu (aucun navigateur) : relu, `verifie.sh nitro` = VERIF OK après chaque détail, c'est tout. Les doses sont à
juger au téléphone. Diff = 38 lignes AJOUTÉES, 0 réécrite. Tout tient dans UNE fonction neuve, `sensNitro(dt,veut)` (juste après
`nitroEteint`), appelée une fois par image dans la boucle, juste après l'appel de `nitroEteint` et avant la remise à zéro de `nitroHeldT`
(`if(SENS)try{…}catch(e){}`) ; état : `SENS_NI` (objet de script, aucune allocation par image). Elle ne fait que LIRE `nitroOn`,
`nitroHeldT`, `engGear`, `VPAL.n`, `NFX.ign`, `mode`, `gameOver`.

Signe du tangage : LU, pas supposé — `carBody.rotation.x = pitch9 + SCOUP.p`, et `pitch9` vaut +.035 au frein (« plonge ») et −.03 sous
la poussée (« s'accroupit ») : `nez` > 0 dans `sensCoup` = le nez plonge. Non vu à l'écran pour autant.

## Inventaire (ce qui EXISTE déjà — laissé tel quel)
- ALLUMAGE (`nitroAllume`, sol ET vol) : cabrage (`pitch9 −NFX.ign×.1`, ≈ 3-5°), onde/anneau, éclair de couleur plein cadre, champ +7°
  (+8° en vol : `NFX.air`), `hap([14,26,10])` (bleu `[8,16,8]`), `nitroWhoomp(k,bleu,air)` (son différent en vol), gerbe de filés,
  plume qui jaillit, sillage épaissi, à-coup de caméra des 3 premières images ; au sol en plus `nitroSpool`. 2e étage (réserve bleue) et
  rallumages rapprochés : les mêmes, en plus petit.
- PENDANT : la caisse s'accroupit de 1,7° (`pitch9`, en fondu), flammes, champ, moteur qui gonfle, arpège du boost, paliers NITROOO.
- COUPURE : `blowOff` (pssht + flutter, si tenu > 0,35 s), `nitroEteint` (8 flammes + 4 braises aux pots, pétarade, `NFX.off`).
  Rien dans la carrosserie, rien dans la main. → détail 1.
- PANNE SÈCHE : son `nitro.sec`, plus tout ce qui précède. Rien dans la main ni la tôle. → détail 2. (Appui à vide : `nitro.vide` + `hap(6)`.)
- RAPPORTS (boîte virtuelle, bloc son du moteur) : coupure, `subBoom`, souffle, pétarade, `hap(5)`, champ +1,8°, au plus un / 350 ms.
  Rien dans la carrosserie. → détail 3.
- PALIERS DE VITESSE (`vpalTick`) : texte, champ +5 à +13°, `hap`, son `jeu.palierVitesse`, puis RECORD DE VITESSE. Rien dans la
  carrosserie. → détail 4.
- PLAQUES BOOST : déjà traitées par l'intégrateur (`sensCoup(0,-1.7…,-.9)` + gerbe d'or, à côté de `sfx('pad')`). Rien ajouté.

## Détails (dans l'ordre des commits)
### 1. La coupure retombe sur le nez — 826d142
- Le joueur lâche la nitro après l'avoir tenue > 0,35 s : le poids repasse sur l'avant, le nez PLONGE d'un coup
  (`sensCoup(0, .6+.8k, -(.25+.25k))`, k = tenue de 0,35 → 1,5 s : ≈ 1,6° → 3,6°, 1 → 2 cm) puis se repose ; `sensHap(9,1)`.
- Provoquer : au sol, tenir NITRO une bonne seconde puis lâcher. En vol : seulement le tic (la carrosserie est au repos en l'air).
- Risque : s'ajoute au retour en fondu de l'accroupi (`pitch9` −1,7° → 0) : si le nez paraît piquer trop, baisser `.6+.8*k`. Le tic
  est léger et passe par le limiteur ; au même instant il n'y avait aucune vibration.
### 2. La panne sèche hoquette — 19c03af
- Doigt encore posé, la jauge lâche : DEUX RATÉS. Le nez pique sec (`sensCoup(0,1.1,-.3)` ≈ 2,9°), 130 ms plus tard il repique plus
  petit (`0,.7,-.2`) ; la main reçoit `sensHap([12,118,12],2)` (deux coups, même écart) ; l'écran frémit (`sensSecoue(.1)` puis `.07`,
  moitié en vol). Remplace alors le détail 1.
- Au plus une fois par 1,2 s (doigt tenu, le réservoir se rallume à ,3 et retombe à sec en boucle) ; entre deux, la coupure redevient un
  simple transfert de charge (détail 1) si la flamme a tenu > 0,35 s. Le 2e raté est compté en secondes (`SENS_NI.h`), annulé si la flamme
  est revenue, à la mort, à l'explosion.
- Provoquer : tenir NITRO jusqu'à vider la jauge (≈ 2,6 s au moteur de départ), sans lâcher. En vol : la main et le frémissement seuls.
- Risque : la secousse d'écran en vol (plafonnée, moitié dose, coupée sous « Réduire les animations ») — si elle gêne la visée, retirer
  les deux `sensSecoue`. Sous Capacitor, un motif de 142 ms peut être rendu comme UN coup lourd plutôt que deux tics : à sentir.
### 3. Le rapport salue — d575c39
- À chaque rapport monté, le couple se coupe un instant : le nez SALUE (`sensCoup(0,.45,0)` ≈ 1,2°) puis se reprend.
- Garde : un seul cran monté (les recalages de palier moteur sautent plusieurs crans ou retombent en 1re : muets), au plus un / 350 ms,
  pas pendant le cabrage de l'allumage (`NFX.ign<.3`), au sol seulement. Vu une image après le passage (la boîte tourne plus bas).
- Provoquer : accélérer depuis le départ (ou après une pose) et regarder le capot à chaque « clac » du moteur.
- Risque : la boîte vit dans le bloc SON (`if(AC)… osc&&gainN`) : sans contexte audio, pas de rapports, donc pas d'à-coup (comme le
  `hap(5)` existant). Les turbines (`gr:1`) n'ont pas de boîte : rien. Si l'à-coup lasse à la longue, baisser `.45` ou le retirer seul.
### 4. Le mur d'air appuie — 3ce55c4
- À chaque centaine criée (« 400 KM/H ! »), la caisse S'ÉCRASE sur ses roues (`pompe` −.5 à 300 → −.9 passé 700, ≈ 2 → 3,5 cm,
  plafonné), le nez un rien levé (`nez` −.3), et se repose. Pas de vibration ni de son (ils existent).
- Provoquer : dépasser une centaine de km/h criée par le jeu (à partir d'une centaine sous son record de vie).
- Risque : discret ; s'additionne à un rapport passé à la même image (`SCOUP.pv` borné ±4).
- Sous « Réduire les animations » : aucun coup de caisse (détails 1 à 4) ; les vibrations des détails 1 et 2 restent.

## Écarté
- Un coup différent à l'allumage EN VOL : déjà distingué (`NFX.air` : champ +8 au lieu de +7, `nitroWhoomp` propre au vol, pas de
  `nitroSpool`), et le brief interdit d'ajouter quoi que ce soit à l'image en vol (on vise). La vibration y existe déjà.
- Un tassement de l'arrière à l'allumage au sol : le cabrage existe et a été réglé (« à 14 la caisse fondait de moitié ») — pas de renfort.
- Des particules à la panne sèche (flamme qui crache) : `nitroEteint` en tire déjà 12 aux pots au même instant ; loi « pas de voile ».
- Une vibration ou une secousse de plus au rapport et au palier : elles existent (`hap(5)`, `hap(10)` / `[12,20,18]`, `fovPunch`).
- Plaques BOOST : déjà faites par l'intégrateur.
- Rétrogradage : pas de cérémonie existante (silencieux par choix), on n'en invente pas.

## Sons à faire
- Aucun : `nitro.sec` porte déjà la panne ; rien de neuf n'appelait un son.
