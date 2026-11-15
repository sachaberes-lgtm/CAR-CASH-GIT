CONTRÔLE ADVERSE — lot « caisse » (qa/caisse, 171fd5852 sur 10f6cdc8e)

Ce qui a été fait. J'ai lu le diff réel entre qualite-appareil et HEAD dans code/. Il touche seulement trainees-1.js, trainees-2.js et caisse-pieces.js. J'ai suivi les appelants : trxBati, vignette-moteur.js:591 (chauffeRendu), trxParts/trxQ (le calque L[p.L]), prfHors, texLibere. J'ai assemblé deux copies avec git archive puis assembler --depuis-morceaux, une de HEAD et une de la base. Les deux donnent « 330 morceaux d'accord » et le grand script passe node --check des deux côtés.

DÉFAUTS CONFIRMÉS

1. SÉRIEUX (la mesure, pas le jeu) — trainees-2.js:199-200. dbgTrxNet ne règle le biais que sur la matière du calque L[0].
   - Le code : `U=TRX.L[0].m.material.uniforms` ; seul `U.uBiais.value` est réécrit.
   - mk() crée un uniforme uBiais distinct pour chaque calque (trainees-1.js:162). L[1] (le calque additif) et son voile mi gardent la valeur posée à la construction, −0,6.
   - Or HYPERESPACE (trxHyFile, trxNait(1)), POUDRE D'OR (paillettes, trxNait(1)), le néon et la plupart des traînées POP naissent sur L[1].
   - Scénario : trx.sh pose « avant = {biais:0, aniso:1} » puis « après = {biais:−0,6, aniso:4} ». Pour l'hyperespace, le biais vaut −0,6 dans les DEUX images, et dans la « vérité » aussi. Seule l'anisotropie bascule, car la planche tx est partagée.
   - Conséquences :
     - « avant = la lecture de TRX_FS » est faux pour L[1] ;
     - la conclusion « le biais n'a pas de prise ici » n'est pas démontrée pour les traînées vendues ;
     - les 540 339 pixels d'écart viennent de l'anisotropie et du seul calque L[0].
   - En jeu, `?trxnet=1` reste correct : les deux calques sont construits avec TRXNET.biais.
   - Correction : dans dbgTrxNet, régler `TRX.L[i].m.material.uniforms.uBiais` pour i = 0 et 1 (mi partage celui de L[1]). Puis refaire l'A/B, ou au moins corriger le rapport : biais non mesuré sur L[1].

2. MINEUR (banc non reproductible) — outils/banc-caisse/trx.sh:10. `sh "$D/course.sh"` est appelé sans argument.
   - course.sh ne met donc pas `trxnet=1` dans l'URL. Avec le code committé (éteint par défaut), TRXNET.on est faux et dbgTrxNet ne fait rien (`if(o&&TRXNET.on)`).
   - Résultat : avant, après et la partie « réglages » de la vérité sont identiques. Aucun script committé ne contient « trxnet ».
   - Les chiffres du rapport viennent donc d'un état du code non committé (sans doute allumé par défaut à ce moment-là).
   - Correction : `sh "$D/course.sh" "trxnet=1"`.

3. MINEUR — trainees-1.js:43. Le paramètre ?trxbiais peut produire NaN.
   - Le motif `-?[0-9.]+` accepte « . », « 1.2.3 » ou « -. ». Alors `+m[1]` vaut NaN, Math.min/Math.max laissent passer NaN, et uBiais = NaN arrive dans texture2D (comportement indéfini).
   - Cela n'arrive que sous ?trxnet=1 avec un ?trxbiais mal tapé.
   - Correction : `const v=+m[1]; return isFinite(v)?clamp:-.6`.

4. MINEUR (outil de banc) — caisse-pieces.js:165. dbgSoudeInv({caisse}) laisse la caisse demandée à la place de celle du joueur.
   - L'appel écrit `level=o.caisse|0` et reconstruit cette caisse. SHOP.prev est restauré, mais ni level ni la caisse d'origine.
   - Après un relevé, la caisse en jeu reste celle du relevé. Sans effet hors banc : rien n'appelle cette fonction.
   - Correction : garder l'ancien level et reconstruire CARS[level] dans le finally (ou le noter dans le commentaire).

POINTS VÉRIFIÉS SANS DÉFAUT
- (2) Ordinateur et téléphone hors profil :
  - TRXNET.on exige `PRF.on` ; PRF vaut toujours false si TEL_NATIF est faux (soleil-planete.js:480) ;
  - les deux prfHors sont appelés au chargement, avant trainees-1 (palier-appareil.js:106 et 193), donc pas d'état périmé ;
  - quand c'est éteint, `Object.assign(..., {})` donne les mêmes uniformes, `fragmentShader` reste TRX_FS mot pour mot et l'anisotropie de la planche n'est pas touchée ;
  - aucun changement de pixel, de comportement ni de source de shader par défaut, téléphone profilé compris.
- (3) `?sans=trxnet` rend bien l'avant (`\btrxnet\b`) ; `?trxnet=10` ne s'allume pas.
- (4) Ordre de déclaration :
  - PRF (soleil-planete, morceau 73) et renderer (palier-appareil) sont déclarés avant trainees-1 (morceau 160) : pas de zone morte ;
  - le second `const PRF` (caid.js:248) est enfermé dans l'IIFE CAID_ANCIEN, chargée plus tard, donc pas de masquage ;
  - TRXNET, trxNetFs, trxNetAniso, dbgTrxNet et dbgSoudeInv n'existent nulle part ailleurs ;
  - les noms utilisés par dbgSoudeInv existent tous (fusSoudable, CAR_PIECES, MOTIFS d'economie/boutique.js, cosmSur, SHOP.prev, carBody).
- (5) Assemblage et syntaxe : OK (HEAD 12 280 929 octets, base 12 273 068).
- (6) Aucun fichier interdit touché. VERSION PRINCIPALE et sw.js ne sont pas committés ; seul brut/ reste non suivi.
- (7) GLSL :
  - `texture2D(sampler,uv,bias)` est valide en fragment GLSL ES 1.00 ; sous WebGL2, three le récrit en `texture(...,bias)`, valide en ES 3.00 ;
  - la lecture se fait avant le discard, donc les dérivées restent en flot uniforme ;
  - uBiais est toujours initialisé quand il est déclaré ; pas de boucle ni de division ;
  - le remplacement par .replace ne touche qu'une occurrence, qui est la seule ;
  - la planche n'est pas libérée par texLibere : le needsUpdate de dbgTrxNet (changement d'anisotropie) la renvoie sans risque.
- (8) Aucune allocation par image : le programme est choisi une fois dans trxBati, et dbgSoudeInv est un outil de banc.
- (9) Rien n'est allumé par défaut. Le scintillement et le coût GPU sont bien annoncés comme non vérifiés.

DOUTES
- Les chiffres et planches du rapport ne peuvent pas être rejoués avec les scripts committés (défaut 2), et ils sont faux pour L[1] (défaut 1). La phrase « vérifié : après indiscernable de l'avant » ne vaut que pour l'anisotropie et le calque L[0].
- Je n'ai pas vérifié en navigateur que le relevé dbgSoudeInv compte juste. La conclusion (gain sûr 0) est plausible au vu du code : PANNEAUX est animé et les lots du kit ont des uniformes différents.

VERDICT : FUSIONNABLE pour le code du jeu (tout est éteint par défaut, rien ne change à l'image ni ailleurs). Avant de s'appuyer sur la conclusion « le biais n'a pas de prise », il faut :
- corriger dbgTrxNet (défaut 1) et trx.sh (défaut 2) ;
- corriger le rapport, ou refaire l'A/B.

Le test prévu sur le 13 Pro (A /jouer/ contre B /jouer/?trxnet=1) reste valable : en jeu, le biais s'applique bien aux deux calques. Les défauts 3 et 4 sont à corriger au passage.

Fichiers : /Users/sachaberes/cash-car/qualite-caisse/code/rendu/trainees-2.js, /Users/sachaberes/cash-car/qualite-caisse/code/rendu/trainees-1.js, /Users/sachaberes/cash-car/qualite-caisse/code/voitures/caisse-pieces.js, /Users/sachaberes/cash-car/qualite-caisse/outils/banc-caisse/trx.sh, /Users/sachaberes/cash-car/qualite-caisse/passation/qualite/caisse.md