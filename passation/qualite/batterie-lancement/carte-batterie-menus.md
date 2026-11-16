## RAPPORT : la batterie dans les menus (lecture seule de ~/cash-car/qualite, rien modifié ni commité)

### Ce qui existe déjà (à ne pas refaire)
- **Cadence des menus sur téléphone**, gérée par `moteur/cadence.js:179-239` (hcSaute, hcRepos, hcGeste) :
  - 60 i/s sous le doigt ou pendant une transition (`transUI`) ;
  - 30 i/s au repos pendant 60 s (ACC30, l.218-228), même en serious ;
  - 15 i/s au-delà, ou dès critical.
  - Le commentaire l.210 parle de « 10 i/s à 8 s », mais `PAL.B.reposLongMs=66.7` (l.212) donne 15 i/s : le plancher réel est 15 i/s, jamais moins.
- **Pause** : 10 i/s, puis 2 i/s après 2 s (l.186-189). **Écran de mort** : une image sur deux, puis la règle des menus (`mortSaute`, `interface/bouton-nitro-gains.js:308-336`).
- **Déjà allégé** :
  - menuCull, qui retire les maillages hors champ (cadence.js:241-253) ;
  - la vitrine plafonnée à DPR 2 avec une ombre de 1024 (`rendu/nettete-qualite.js:237`) ;
  - le HUD endormi (cadence.js:153-162), les reflets sur leur couche (ifReflets) et la trame MISSIONS (ifTrame) : `css/interface-opti.css` ;
  - les rayons de la série et le halo de la frénésie (lot menus, `palier-leger.css`) ;
  - pas de flou dans les réglages tactiles (`palier-leger.css:26`).
- **Boutique** (passation/boutique-ios/RAPPORT.md) : niveau caché et ombre (#6), atelier caché animé (#13), lgShine invisible (#17), bande à 30, rk250.
- **Films des figures** : dessinés seulement s'ils sont visibles et seulement quand l'image change (`interface/photos-films.js:302-312`). Ce sont des toiles, pas des vidéos. Rien à faire.
- **L'écran reste allumé seulement en course** (`moteur/init.js:458-474`, `JeuViewController.swift:183-195`). Au menu, iOS verrouille l'écran normalement.
- **Le wattmètre** existe (`moteur/gouverneur-thermique.js:106-124`, lignes `energie` dans la boîte noire, phases menu/garage/course).

### À savoir avant la veille
- **En mode économie d'énergie, iOS force le verrouillage automatique à 30 s.** Pour Sacha en éco, une veille qui part après 60 s ne sert à rien : l'écran est déjà éteint.
- **En éco, l'écran est aussi bridé à 30.** Le passage à 60 i/s sous le doigt ne coûte donc rien de plus.
- **Branché, la batterie n'est pas en jeu, la chaleur oui** (serious → l'accueil reste à 30 exprès, ACC30_CHAUD).
- **Les boucles CSS infinies tournent à 60 Hz**, quelle que soit la cadence de la 3D (30 ou 15 i/s).

### Propositions, de la meilleure à la moins bonne (gain / risque)

**P1. Scène couverte : on ne dessine plus la 3D sous un écran opaque.** Gain sûr, risque faible.
- **Constat** : sous RÉGLAGES, MODES et `shop` de la coque, le fond est opaque (`#overlay::before` à opacité 1, `css/charte-2-ecrans.css:7-15`). Idem sous la SÉRIE (`#serieW`, fond #000, `css/missions.css:429`), la PLAQUE / le PROFIL (`#plq,#prof` en `--fondEcran`) et CONFIDENTIALITÉ (`#confFen` à .97, `charte-7-details.css:587`). Dessous, la 3D se redessine à 30 ou 15 i/s : ~146 appels par image à l'accueil (mesure de cadence.js:209). Aucun code ne la saute.
- **Où** : un test en tête de `loop` (`moteur/boucle-1.js`, près de la l.4 `__introCouvre`), écrit comme `mortSaute`. On saute le dessin quand `data-ecran` ∈ {set, modes, shop} et que le fondu `--t-slow` est fini, quand `SERIEW.on` est vrai sans `.fin`, quand `#confFen` est là, ou quand `PLQ.on`/`PLQ.prof` est vrai. On redessine dès que l'attribut change : le fondu de sortie part d'un écran encore couvert. Interrupteur `?sans=couverte`.
- **Gain** : 100 % du coût de la 3D sur ces écrans. Mais on y passe peu de temps (quelques secondes à quelques minutes par séance) : gain total modeste.
- **Preuve sans téléphone** : `outils/banc-menus/menus.cjs`, avec par écran un compteur d'images dessinées et `renderer.info`. Puis une photo avec la toile cachée contre la toile visible : si elles sont identiques, la scène est bien couverte.
- **Sur le téléphone** : jauges GPU et Énergie de Xcode (app Debug lancée du Mac, CC_QS), 30 s dans RÉGLAGES, avec puis sans `?sans=couverte`.

**P2. Les boucles CSS des menus s'endorment.** Gain moyen, risque faible.
- **Constat** : le HUD endormi exclut exprès les menus (cadence.js:154 : `cle=''` si `!started||garageOn`). Boucles qui font repeindre l'écran dans les menus :
  - JOUER `k4LingotV4` (`charte-6-signatures.css:161`, `charte-7-details.css:60`, sous 6 ombres) ;
  - les tuiles `k6Reflet` (`charte-7-details.css:122`) ;
  - `gHomeCiel` (`garage-hub-boutique.css:77`, 7 fonds) ;
  - `gmFlux` (`charte-3-garage.css:223,247`, traits SVG) ;
  - `m2Brille` (`missions.css:50`, ombre de boîte) ;
  - `gChevFile` et `fsBat` (filtre).
- **(a) Tout de suite** : appliquer le scan de `hudDortTick` aux menus, pour geler les boucles des éléments invisibles.
- **(b) La veille** : après 20 s sans toucher (sans transition en cours, sans série, missions ni révélation ouvertes), une classe `html.ccVeille *, *::before, *::after{animation-play-state:paused!important}`. On ne pose JAMAIS `animation:none` (les annonces rejoueraient). Réveil au premier `touchstart`/`pointerdown` : chaque reflet repart d'où il s'était arrêté.
- **Gain** : la seule mesure connue est celle d'un reflet sur l'accueil, dans WebKit : temps libre du fil principal 30,4 k → 48,6 k une fois gelé (interface-opti.css:9-12). On peut s'attendre au même ordre de grandeur par boucle gelée.
- **Risque** : aucun reflet ne passe pendant qu'on ne touche pas. Visible, mais c'est l'esprit d'une veille.
- **Preuve** : sur le banc, compter `document.getAnimations()` (en cours, infinies, visibles ou non) sur chaque menu. Puis `outils/banc-interface/webkit.cjs` pour le temps libre, avec puis sans `ccVeille`.
- **Sur le téléphone** : la jauge CPU de Xcode sur l'accueil sans toucher, A/B.

**P3. Le reflet de JOUER passe sur sa couche et bouge par `transform`.** Gain moyen, risque moyen (visuel).
- `.mPlay` balaie son propre fond : tout le bouton se repeint pendant 30 % de chaque cycle de 4,2 s, à chaque visite de l'accueil.
- ifReflets n'a posé que `will-change` sur `.lg`, `#gShopBas` et `#gvMis` : le pseudo-élément se repeint encore. Avec un `::after` déplacé par translateX, la puce graphique fait tout et le fil principal ne travaille plus.
- **Risque** : rogner le reflet à la forme penchée et au contour du bouton. Il faut comparer au pixel à trois instants, comme pour ifReflets (webkit.cjs). Même chose possible pour `k6Reflet` et `lgShine`.

**P4. La veille profonde de la 3D.** Gain réel seulement si le verrouillage est réglé à plus de 90 s, risque moyen.
- Après 90 s sans toucher (une étape de plus dans `hcRepos`, cadence.js:226) : on ne dessine plus rien. La toile garde sa dernière image, le même principe que `mortSaute`.
- On remplace ensuite `requestAnimationFrame` (`boucle-1.js:2`) par une vérification toutes les 500 ms. Réveil au doigt, au clavier, à un `resize`, à `visibilitychange` ou à un retour d'achat. Le `dt` est borné à 0,05 : la chute ne saute pas.
- **Exclusions** : transition en cours, `GAR.go`, BIENV/TUTO, série, achat en vol.
- **Autre boucle à couper** : `motHorloge` (`economie/boutique.js:642`), qui tourne pour toujours dès qu'une peinture animée a été essayée.
- **Gain** : la 3D passe de 15 i/s à 0, et le fil principal ne se réveille plus que ~2 fois par seconde au lieu de 60. **Rien pour Sacha en éco** (verrouillage à 30 s).
- **Sur le téléphone** : wattmètre débranché, verrouillage sur « Jamais » (donc éco coupée), luminosité fixe, 2 × 15 min d'accueil sans toucher, A/B. Sa batterie descend par pas de 5 % : à ~3 W, il faut ~12 min par mesure.

**P5. La vitrine en économie d'énergie : DPR 2 → 1,5.** Gain fort, risque visible : décision de Sacha.
- **Constat** : `nettete-qualite.js:237-239` règle la vitrine à DPR 2 en BASSE N1, alors que la course est à 1,25. Le menu dessine 2,56 fois plus de pixels que la course.
- **Proposition** : `vhdDpr` à 1,5 seulement quand `__ccEco` vaut 1 (le natif le renvoie toutes les 5 s).
- **Gain** : −44 % de pixels, soit (1,5/2)², dans tous les menus.
- **Risque** : Sacha est souvent en éco, il le verra.
- **Avant de décider** : lui montrer des photos A/B en 390 × 844 ×3. L'ordinateur ne change pas.

**P6. Les minuteries de 250 ms qui mesurent la page.** Petit gain, seulement en complément de P4.
- `ghPlace` (`interface/garage-cadrage.js:222-226`), `garAplomb` (`interface/atelier-ferme.js:472-483`), `plqGarage` (`voitures/plaque.js:366-374`), `chute-libre.js:376`, `boutique-trainee.js:47`, `mobile-tactile.js:542` et `:1085`, `boutique.js:203`, `boutique-du-jour.js:71,112`.
- Ensemble : ~40 réveils par seconde. Une ligne `if(VEILLE.prof)return` pendant la veille profonde suffit.

**Écarté** :
- Baisser la luminosité depuis l'app : on toucherait un réglage du système.
- Descendre sous 30 i/s pendant la première minute au repos : Sacha s'est déjà plaint des nuages saccadés à 15 i/s.
- Le flou de `.pNav` (`boutique-peinture.css:8`) : à vérifier seulement s'il s'affiche dans la boutique iPhone (version A).

### Ordre conseillé
P1, puis P2(a), P2(b), P3, P4 avec P6. P5 attend le oui de Sacha.

**D'abord, mesurer le menu** : aucune ligne `energie` de phase menu n'est relevée dans passation (la course est à ~6 W). Prévoir une séance débranchée de 15 min sur l'accueil.

La vitesse de lancement n'est pas dans ce sujet, je ne l'ai pas regardée.
