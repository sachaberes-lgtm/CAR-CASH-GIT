# conduite

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Au sol, le pouce ne règle pas un cap : il commande une vitesse de rotation (lacet). Au plein pouce, cette rotation vaut lacetMax(v) = vw/(40+0,3·vw), avec vw = |vA|·0,48 en m/s monde. Le rayon le plus serré qu'on tient est donc r = 40 + 0,3·vw. Pour un virage de rayon R, la vitesse sûre vaut vw ≤ (R−40)/0,3. En drift, on tourne 15 % plus serré : vw ≤ (1,15R−40)/0,3. On gagne encore de la marge en coupant le virage sur les 56 m de route. Rien ne recentre la caisse : pouce lâché, elle file tout droit et tombe dès que |lat| > ROAD_HALF = 28 m.

Pour la nitro, la jauge se refait de 0,2/s et la nitro brûle 1/s (0,5/s en frénésie). Avec la seule recharge, on tient donc 20 % du temps. C'est exactement le chiffre du bot de référence (18 %).

Ce qui permet aux humains de tenir 60 % : la LIGNE PARFAITE. Le jeu pose devant la caisse, sur la trajectoire, un fruit puis une plaque, en alternance, toutes les 1,2 s. Chaque objet rend 1,15 de nitro. Tout prendre rapporte 0,96/s, plus 0,2 de recharge, soit plus que les 1/s brûlés : on peut alors tenir la nitro sans fin. Le bot de référence ne pousse la nitro qu'en ligne droite et ne vise un objet que s'il est déjà presque sur sa ligne.

La part des objets de la ligne ramassés est donc le meilleur réglage pour faire varier le niveau d'un bot. La loi de conduite du pilote de mesure (dbgAuto) est réutilisable : doigts.js la reprend déjà. En revanche, elle n'anticipe pas les virages et ne gère pas la vitesse. Les poursuivantes du mode Survivant (survTick) roulent avec l'ancienne physique de direction : on ne peut pas les reprendre telles quelles, mais leur modèle de « pilote humain » (réaction, fautes) l'est.

## Pour le bot

- MEILLEUR RÉGLAGE DE NIVEAU : la part des objets de la LIGNE PARFAITE que le bot prend. Tout prendre permet de tenir la nitro sans fin (+1,16/s contre 1/s brûlé) ; ne rien prendre la ramène à 20 % du temps. Une écurie du palier 1 au palier 30 peut s'étager sur ce taux (par exemple 10 % → 95 %), plus un temps de réaction.
- Pour viser la ligne, il faut ses positions : yeux.js voit fruits et plaques (jusqu'à 325 et 450 m) mais ne les marque pas comme « objets de la ligne » (p.ligne, LIGNE.pts). Il faudrait sans doute ajouter ce champ, lecture seule, pour que le cerveau les reconnaisse. Plaque : écart latéral inférieur à 5,6 m ; fruit : attiré à 11 m.
- Pilote d'élite : suivre la ligne, nitro tenue (y compris dans les virages qu'on peut passer), et lâcher la nitro ou drifter avant un virage de rayon R inférieur à 40 + 0,3·vw. À palier égal, la nitro établie ajoute ~40 % de vitesse : à pleine nitro établie, les virages les plus serrés du palier (≈ rayonPalier) ne passent qu'en coupant toute la largeur ou en drift (×1,15). Pour anticiper, il faut lire vue.route[].virage sur 100 à 300 m, pas seulement lacetRoute.
- Ralentir : le bot roule gaz automatiques (AUTO_GAS, faux téléphone), donc pas de pied levé. Le seul ralentissement est ↓ volant à moins de 0,35 ; avec plus de volant, ↓ part en drift. Le frein doit précéder le virage, pas l'accompagner.
- Ne jamais perdre l'élan (momT) : |psi| < 0,25 pour qu'il monte, à partir de 0,6 il se vide de 2/s. Un MINI-turbo (drift de moins de 0,9 s) coûte l'élan sans le rendre ; seuls SUPER et ULTRA le rendent. Pour un bot moyen, il vaut mieux ne pas drifter que mal drifter.
- Clavier tout ou rien : le dosage en tapotant de doigts.js (appui et repos d'au moins 67 ms) fait osciller le volant à τ 47 ms. En drift, si |steer| retombe sous 0,2, le drift s'arrête : pour un bot qui drifte, tenir la flèche à fond plutôt que tapoter.
- Rase-bord (|lat| > 22,4 m à plus de 0,5·maxSp) : +0,22 nitro/s nitro coupée et du flow. La marge de 9 m du bot de référence l'interdit ; un bot fort peut s'en servir dans les lignes droites, nitro coupée.
- Frénésie : la nitro y dure 2×, donc un bot qui atteint FLOW 4 tient la nitro presque sans fin rien qu'avec la recharge (40 %). C'est un marqueur de très bon joueur. Une pose à plus de 55° remet le flow à zéro : l'élite doit poser dans l'axe.
- Bots « humains » faibles : reprendre le modèle de faute de survTick (réaction 0,10 à 0,26 s, coup de frein, embardée, corde ratée à ×1,35 la vitesse sûre, micro-bruit selon line), mais appliqué à la physique actuelle (lacetMax), pas à la sienne.
- Ne pas réutiliser survTick tel quel : ses voitures ont l'ancienne direction et une vitesse de virage fausse pour la physique actuelle. Réutiliser dbgAuto pour TENIR une ligne (c'est déjà dans doigts.traduire), en sachant qu'il n'anticipe pas les virages et ne règle pas la vitesse : la vitesse est au cerveau de la gérer.

## Les faits

- VOLANT : le pouce (ou ←/→) donne une consigne -1..1. Au clavier c'est tout ou rien, (lf?1:0)-(rt?1:0). Au pouce, la valeur est analogique (TCTL.st, ou inclinaison / flèches tactiles). Le volant suit la consigne avec un lissage exponentiel : τ 47 ms au clavier (VOL_LIS 21,4/s), τ 30 à 60 ms adaptatif au pouce (VOL_LIS_D 33,3/s).
  - *preuve* : code/moteur/boucle-1.js:241-247 ; code/son/curseurs.js:124
- LACET : la rotation visée vaut steer·lacetMax(vA)·spdMult·(1,15 en drift)·clamp(vA/8)·(0,18 dans une flaque, BK_VG.grip sur le verglas). La caisse la rejoint avec une inertie VOL_TAU = 0,1 s (÷spdMult). La formule : lacetMax(v) = vw/(VOL_R0 + VOL_RK·vw), avec VOL_R0 = 40, VOL_RK = 0,3 et vw = max(8, |v|·SPD).
  - *preuve* : code/moteur/boucle-2-conduite.js:87-88 ; code/gameplay/camera.js:254-255
- La caisse ne suit pas la route toute seule (ASSIST_VIRAGE = 0). La route tourne sous elle (psi -= dyaw). Seuls les murs et plafonds au-delà de 60° d'inclinaison font suivre le ruban comme sur des rails. psi est le cap par rapport à la route, borné à ±1,4 rad.
  - *preuve* : code/gameplay/camera.js:240,244-253 ; code/moteur/boucle-2-conduite.js:30-31,135-137
- VITESSE SÛRE EN VIRAGE : la trajectoire se courbe au plus de 1/(40+0,3·vw). Un virage de rayon R passe donc à vw ≤ (R−40)/0,3 m/s monde, soit vw·3,6 en km/h affichés hors pouvoir VITESSE. En drift : vw ≤ (1,15R−40)/0,3. spdMult (pouvoir VITESSE ×2, plafond ×2,6) multiplie à la fois l'avance et le lacet : la même consigne donne la même trajectoire. Le jeu lui-même parle de « virage serré » entre 1 et 1,5 × rayonPalier.
  - *preuve* : code/gameplay/camera.js:255,291-297 ; code/moteur/boucle-2-conduite.js:77-88
- SORTIE DE ROUTE : si |lat| > ROAD_HALF, la caisse bascule et tombe (startFall), sauf sous graceT ou au portail. ROAD_HALF = ROAD_HALF0 (14) × LARGEUR (2,0) = 28 m. Exceptions : dans les couloirs du canyon et de la ville, c'est un mur (murCote) ; au glacier, une congère.
  - *preuve* : code/moteur/boucle-2-conduite.js:146-154 ; code/rendu/triptyque-bloom.js:837 ; code/maps/continuite.js:225,229
- Les virages sont mis à l'échelle de la croisière du palier +2, nitro non comprise (lvPiste, rayonPalier). Calcul (script de scratchpad, régime établi) : au palier 10, la croisière gaz + élan donne vw ≈ 132 m/s (477 km/h, r_min 80 m) ; la nitro jaune tenue donne ≈ 192 m/s (692 km/h, r_min 98 m) ; rayonPalier(10) ≈ 87 m. En croisière, les virages de conception passent. À pleine nitro établie, les plus serrés ne passent pas sans utiliser la largeur ou le drift. Au palier 0 : 254 km/h (r 61 m) contre 356 km/h en nitro (r 70 m).
  - *preuve* : code/gameplay/camera.js:296-297,321-322 ; C:/Users/sacha/AppData/Local/Temp/claude/4f408c433e043674/f88f31c3-bb0b-46a7-81da-0268005df0f8/scratchpad/physique-sol/calc.js
- VITESSE : maxSp = 190/3,6 × late × push. Les gaz poussent de acc9 tant que vA < maxSp·(1+0,05·FLOW.lv), puis de 0,55·acc9 au-delà. Ils sont multipliés par 1,5 sous boost, par l'élan momF (1 à 2,8) et par (1+0,06·FLOW.lv). La traînée en vA² fixe la limite : ≈1,8 × maxSp sans élan, ≈3 × maxSp avec l'élan plein. Il n'y a pas de plafond dur. Sans gaz, sans frein et sans nitro : ×(1−0,4·dt).
  - *preuve* : code/moteur/boucle-1.js:181-183 ; code/moteur/boucle-2-conduite.js:40-52
- ÉLAN (momT) : il monte quand on accélère, sans drift, avec |psi| < 0,25, jusqu'à 4,3 s. Il se vide de 2/s dès qu'on drifte, qu'on lâche les gaz ou que |psi| ≥ 0,6 ; il reste figé entre 0,25 et 0,6. Formule : momF = 1 + min(1,8; 0,1·momT²). Perdre l'élan divise la vitesse de croisière par ~1,75 (254 contre 145 km/h au palier 0). Une plaque rend +0,8 d'élan, un SUPER ou ULTRA turbo le remet à 4,3.
  - *preuve* : code/moteur/boucle-2-conduite.js:38-40,178 ; code/gameplay/sensations-flow.js:125
- Poussée de la nitro : +30·push par seconde (×1,10 quand on puise dans la réserve bleue). Le départ donne 3 s de la même poussée (startBoostT, 2 s après une seconde chance) ; la jauge y reste pleine et rien ne se consomme.
  - *preuve* : code/moteur/boucle-2-conduite.js:45-46 ; code/moteur/boucle-1.js:201,207 ; code/gameplay/boost-depart.js:132 ; code/missions/ecran-revelation.js:648
- RÉSERVOIR (NITRO2) : recharge 0,2/s (même nitro allumée), consommation 1/s, ×0,5 en frénésie. La jauge nitroR se plafonne à ENGINE_TIERS.res (2,0 à 3,6) ; la réserve bleue nitroX se plafonne à 2. La nitro tient tant que jauge + réserve paient l'image. Une fois éteinte, elle ne se rallume qu'au-dessus de 0,3. En vol, l'allumage coûte 12 % de la jauge d'un coup.
  - *preuve* : code/gameplay/frole-contrats.js:144-166 ; code/moteur/boucle-1.js:199-221 ; code/moteur/boucle-3-physique.js:325
- Ce qui REMPLIT la nitro : fruit = +20 %·cap·fruitK, versé dans la réserve bleue ; plaque = +0,12 ; drift relâché = +0,16·niveau ; frôlé = 0,08 à 0,16 (×1,5 en porte) ; rase-bord = 0,22/s, nitro coupée seulement ; pose = 20 %·cap au prorata du vol fait nitro coupée ; figure = −35 % au lancement, +40 % à la pose ; rebond = 0,35 puis ×0,6 ; raccourci = +0,3 ; VIRAGE À FOND (filet) = +0,25 ; fronde = 0,05 à 0,12 ; rattrapage = 0,22 à 0,6 ; événement rare = 60 %.
  - *preuve* : code/gameplay/ramassage.js:150 ; code/moteur/boucle-2-conduite.js:106,178 ; code/gameplay/sensations-flow.js:126 ; code/gameplay/frole-contrats.js:10,149-153 ; code/gameplay/demi-tour.js:404,459 ; code/gameplay/zones-caisses.js:323,332 ; code/gameplay/aura-chaine.js:56
- LIGNE PARFAITE (version par défaut, avec plaques) : une file fruit / plaque / fruit… est posée pendant la course, 3,5 s devant, au rythme d'un objet toutes les 1,2 s à la vitesse d'arrivée. Elle suit la corde (≈11 m vers l'intérieur pour R 150). Chaque objet rend LIGNE.don = 1,15 : 0,96/s si on prend tout, plus la recharge 0,2/s, soit 1,16/s, plus que les 1/s brûlés. La plaque de la ligne n'a pas de temps de recharge et pousse aussi (vA +26 et plus, boost 1,9 s). Au bout d'une file de 14 à 33 objets vient un pouvoir ; le tirage donne 21 % de NITRO INFINIE pendant 9 s.
  - *preuve* : code/gameplay/ligne-parfaite.js:117-121,129,137-141,172,204-229 ; code/gameplay/pouvoirs-orbes.js:24 ; code/gameplay/pouvoirs-grisants.js:25
- Rayon de prise : un fruit est attiré à 11 m (3,8 m pour le prendre) ; une plaque exige un écart latéral inférieur à 5,6 m, testé sur tout le trajet de l'image.
  - *preuve* : code/gameplay/ramassage.js:111,138 ; code/moteur/boucle-2-conduite.js:171-172
- Nitro « libre » (vue.nitroLibre) = pwrNitroT > 0 ou startBoostT > 0 : la jauge est forcée pleine et rien ne se consomme.
  - *preuve* : code/moteur/boucle-1.js:201,207 ; ml/bot/yeux.js:39
- DRIFT : il faut ↓ (ou le pouce tiré de 34,9 px vers le bas) ET |steer| > 0,35 ET |vA| > 0,42·maxSp. On en sort en lâchant le geste, si |steer| < 0,2, ou si la vitesse tombe. Pendant le drift : vA ×(1−0,1·dt), ↓ ne freine plus, la trajectoire tourne ×1,15, le nez pivote en plus (slipB, ressort, jusqu'à 0,47 rad) et l'élan se vide. Niveaux à 0,45 / 0,9 / 1,4 s. Au relâché : boost, vA += 6·niveau, nitro 0,16·niveau, flow 9·niveau, élan rendu à 4,3 si niveau ≥ 2 ; recharge 0,6 + 0,3·niveau.
  - *preuve* : code/moteur/boucle-2-conduite.js:43,58-68,87-94 ; code/gameplay/sensations-flow.js:113-136 ; code/son/curseurs.js:125
- FREIN : ↓ hors drift donne −1,5·acc9. Avec les gaz automatiques (AUTO_GAS), on ne peut pas lever le pied : ralentir, c'est appuyer ↓, et ↓ avec |steer| > 0,35 à bonne vitesse devient un DRIFT, pas un freinage. Marche arrière plafonnée à −16. Si la vitesse reste sous 22 km/h pendant 6 s, la caisse explose.
  - *preuve* : code/moteur/boucle-2-conduite.js:4-14,43,54 ; code/moteur/mobile-tactile.js:18-21
- Le faux navigateur de ml/reel ne passe pas ?pc=1 (REQUETE = ?sim=1&fps=0&intro=ancien&prebati=0&grotteworker=0). Comme EDITION = 'mobile', FORCE_TEL devient vrai, donc IS_MOBILE, et le bloc tactile pose AUTO_GAS = true et TCTL.on = true. Le bot roule donc gaz automatiques, volant au clavier.
  - *preuve* : ml/reel/jeu-reel.js:99 ; code/page/tete.html:59 ; code/rendu/soleil-planete.js:419-420 ; code/moteur/mobile-tactile.js:18-21
- FLAQUE : slipT = 0,75 s ; la direction ne mord plus qu'à 18 % et une embardée aléatoire s'ajoute (×√(dt/60)) ; 1,2 s avant la flaque suivante. VERGLAS (glacier, hors tirage sur main) : la trajectoire suit le nez avec du retard (BKV.gl).
  - *preuve* : code/moteur/boucle-2-conduite.js:87,96,121,205-223
- PENTE : vA += −GRAV·F.t.y·cos(psi), avec GRAV = 9,8 × 0,55. DESSOUS / ENVERS : side < 0 renverse la normale ; sur une dalle à l'envers (F.n.y < −0,15) sous 7 m/s, on décroche, sauf sur une route sans haut ni bas.
  - *preuve* : code/moteur/boucle-2-conduite.js:16,47,155 ; code/son/curseurs.js:309
- RASE-BORD : |lat| > 0,8·ROAD_HALF (22,4 à 28 m) avec |vA| > 0,5·maxSp donne +0,22 nitro par seconde (nitro coupée) et 6 points de flow « route » par seconde.
  - *preuve* : code/moteur/boucle-2-conduite.js:106-109
- FLOW : jauge de 0 à 100, un palier tous les 25 points, palier 4 = frénésie. Argent multiplié par 1 / 1,3 / 1,5 / 1,8 / 3. Chaque palier pousse aussi : +6 % d'accélération et un seuil de gaz relevé de 5 %. Nitro allumée hors frénésie : la jauge ne perd rien. Pose à plus de 55° de l'axe : flow remis à zéro. Les gains sont multipliés par la vitesse rapportée à la croisière. En frénésie, la nitro dure 2× plus et la jauge ne tient que par les trois traits (NARCISSE, MACHIAVEL, PSYCHO).
  - *preuve* : code/gameplay/frenesie.js:9-10 ; code/economie/eco-vague3.js:18 ; code/gameplay/sensations-flow.js:283-342 ; code/gameplay/frole-contrats.js:28-70 ; code/moteur/boucle-2-conduite.js:42
- dbgAuto (pilote de mesure) : target = clamp((routeLacet + clamp((visée−lat)/(max(6, vw·spdMult)·0,9), ±0,4) − psi)·3 / (lacetMax·spdMult), −1, 1). C'est un correcteur de cap qui s'appuie sur le virage du moment. Il ne regarde pas devant, ne règle pas la vitesse et ne freine jamais. En jeu, sa consigne est analogique (meilleure qu'un clavier). doigts.traduire reprend déjà cette loi.
  - *preuve* : code/moteur/boucle-1.js:238-245 ; code/rendu/ciel2.js:325-330 ; ml/bot/doigts.js:30-33
- survTick (Survivant) : ses voitures tournent avec l'ancienne loi de direction (spec.turn·0,75, TURN_HS, sHold, phi), sans lacetMax, VOL_TAU, psi, yawR ni drift. Leur vitesse de virage est calculée sur cette ancienne loi, et leur réservoir n'a que la recharge, sans aucun ramassage. Le mode est d'ailleurs retiré de l'interface.
  - *preuve* : code/rendu/kit-lumiere.js:152-153,176-190,236-251 ; code/moteur/mobile-tactile.js:25
- Ce que le cerveau de survTick a d'humain : un temps de réaction b.rea de 0,10 à 0,26 s (avec un aléa ×0,8 à 1,4) ; des fautes à la fréquence err·0,4 par décision, de trois sortes (coup de frein, embardée sin(13t)·0,7, corde ratée ×1,35) ; un point de frein variable (±8 %·(0,4+err)) ; des micro-corrections (bruit 0,1·(1,2−line)) ; une perception bornée (75 m devant, 25 m derrière, ±10 %). Sept personnalités : SURV_PILOTS.
  - *preuve* : code/rendu/kit-lumiere.js:168-216,247-248 ; code/interface/menu-logo.js:181-189
- Le bot de référence ne pousse la nitro que si la route est droite à 100, 150 et 300 m, qu'il est posé (|cap| < 0,18, ni glisse, ni rebond, ni dessous) et que jauge + réserve > 0,45. Il garde 9 m de marge au bord (jamais de rase-bord), ne drifte pas, et ne vise un fruit ou une plaque que s'il est à moins de max(4; 0,22·d) de sa ligne actuelle.
  - *preuve* : ml/bot/reference.js:8-10,25-37

## Non verifie

- Pas pu vérifier en exécution qu'AUTO_GAS vaut bien true dans ml/reel. C'est déduit de la lecture : EDITION = 'mobile' (page/tete.html:59) et une requête sans ?pc=1, à condition que tete.html s'exécute dans le bac à sable. À confirmer avec un dbgState ou un ev('AUTO_GAS') par l'agent qui fait tourner le simulateur.
- Les vitesses établies et rayons par palier viennent d'un calcul à la main de la formule de traînée (calc.js du scratchpad). Ils négligent le temps nécessaire pour atteindre ces vitesses, les pentes, le pouvoir VITESSE, les plaques et les pertes de vitesse aux chocs.
- Pas vérifié carte par carte le rayon réel des virages générés : route-sans-haut, canyon, dunes, grottes, villes, Paris, Jade et orbite ont chacun leur générateur (lvPiste n'est qu'une échelle).
- Pas vérifié comment les 60 % des humains sont comptés (champ 'nit' de l'enregistreur : probablement nitroOn, vol et nitro libre compris). Rien ne dit que la ligne parfaite en est la seule source : figures et poses en vol comptent sans doute aussi.
- HUD_CALME / CALG : dans ce mode, un fruit arrivé pendant le calme n'est pas ramassé (ramassage.js:101). Pas vérifié si ce mode est actif dans le simulateur.
- Bosses (dos d'âne, hopY), tremplins de glace et dunes : lus en surface seulement ; le détail de leur effet sur la vitesse n'a pas été vérifié.
- Frénésie : le déclenchement (FREN.arme, seuil, figure posée) et le détail de la triade n'ont pas été lus entièrement (gameplay/frenesie.js).
