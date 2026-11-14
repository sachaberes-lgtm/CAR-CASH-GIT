# Carte : le réglage de résolution du joueur (IMAGE)

Lecture seule de `code/` (branche qualite-appareil = origin/main v1596). Rien n'a été exécuté : tout est lu dans le code, pas mesuré.
« Non vérifié » = déduit de la lecture, pas observé en jeu.

## 1. Les valeurs et leur nom à l'écran

`SAVE.d.q` prend **trois** valeurs, `SAVE.d.qChoisi` dit si le joueur a touché le réglage :

| valeur interne | clé TR (`qLbl`) | FR affiché | EN affiché |
|---|---|---|---|
| `'fast'` | `RAPIDE` | **BASSE** | LOW |
| `'net'` | `NETTE` | **MOYENNE** | MEDIUM |
| `'haute'` | `HAUTE` | **HAUTE** | HIGH |

- `qSuivant(q)` : `code/rendu/nettete-qualite.js:133` — cycle fast → net → haute → fast.
- `qLbl()` : `code/rendu/nettete-qualite.js:134` — rend la CLÉ (`HAUTE`/`NETTE`/`RAPIDE`), traduite ensuite par `TR()`.
- Textes : `code/interface/passe-textes.js:6` (`I18N_FR` : `RAPIDE→BASSE`, `NETTE→MOYENNE`) ; `:7-9` commentaire TEL-N04 + `Object.assign(I18N,{'RAPIDE':'LOW','NETTE':'MEDIUM'})` ;
  `code/moteur/mobile-tactile.js:330` `I18N['HAUTE']='HIGH'` (posé seulement dans le bloc mobile — sur ordinateur sans `?touch=1`, l'anglais de HAUTE dépend de ce bloc : non vérifié s'il existe ailleurs) ;
  `code/interface/traductions.js:394` (anciennes traductions `RAPIDE:FAST`, `NETTE:SHARP`, écrasées par passe-textes). Libellé de la ligne : `IMAGE` → `GRAPHICS` (traductions.js:394).
- Langues : `LANG_CYCLE=['fr','en']` (`code/economie/eco-vague3.js:78`) — **deux langues seulement** (le commentaire « trois langues » de passe-textes est périmé, le chinois est retiré).

## 2. Où le joueur le voit (HTML / CSS / clic)

- Écran RÉGLAGES complet (`#mSet`, charte 6) : `code/page/ecrans-menus.html:155` — `<div class="mLigne" data-m="q">… IMAGE … <b id="mvQ" class="valeur">RAPIDE</b>` (texte initial « RAPIDE » réécrit par `mFill`).
  Remplissage : `code/moteur/mobile-tactile.js:888` `sv('mvQ',TR(qLbl()),true)`. Clic : `mobile-tactile.js:969`.
  Son du clic : `mobile-tactile.js:906` (rôle `'onglet'`).
- Panneau PAUSE mobile (`#tPanel`) : `code/page/ecrans-menus.html:241` `<div class="tp ligne" data-a="q">`. Rendu : `mobile-tactile.js:348` (`tpLbl('eclair','IMAGE',qLbl(),true)`, `tpLbl` = `code/interface/icones-fenetre.js:183`). Clic : `mobile-tactile.js:398`. Son : `:417`.
  CSS : `code/css/pause-v2.css:72` (caché debout hors `.c6`), `:97` (affiché couché), `code/css/ux8.css:104,125` — règles en `html:not(.c6)` seulement.
- Panneau PAUSE ordinateur (`dPan`) : `code/moteur/desktop-banc.js:23` (rendu), `:40` (clic), `applyQ9` `:49`.
- Les trois clics font la même chose : `SAVE.d.q=qSuivant(SAVE.d.q); SAVE.d.qChoisi=1; SAVE.flush(); applyQ(SAVE.d.q==='fast')`.

**Autres réglages graphiques exposés au joueur : aucun.** Dans #mSet : SON, MUSIQUE (+ volumes), VIBRATIONS, IMAGE, LANGUE, POUCE HAUT, FIGURES, VOL INVERSÉ, MAIN, COMMANDES, AUTO-ÉCOLE, CONFIDENTIALITÉ, sauvegarde. IMAGE est le seul levier d'image.

## 3. Ce que CHAQUE valeur change concrètement

### 3.1 Le plafond de résolution : `dprPlafond(fast)` — `code/rendu/palier-appareil.js:252-258`
- `fast` vrai → `min(devicePixelRatio, 1)`.
- sinon, téléphone (`ALLEGE && !POSTE.auto`) → `min(dpr, PAL.bT('imgDprCap', PAL.b('dprNetCap',1.5), 'c'))`.
  - `PAL.B.imgDprCap=[1.25,1.35,1.25]` (`palier-appareil.js:251`) — 3e colonne lue seulement si le levier `c` est actif (`PAL.imgOn`, `:98`, TEL_NATIF + palier 2, sauf `?img=max` / `?imgsans=c`).
  - `PAL.B.dprNetCap=[1.25,1.35,1.5]` (`palier-appareil.js:263` et redéclaré identique `nettete-qualite.js:93`).
  - ⇒ **iPhone récent (palier 2) : NETTE et HAUTE = plafond 1,25**, RAPIDE = 1. Palier 1 : 1,35 ; palier 0 : 1,25.
- Ordinateur (POSTE.auto) : budget de pixels (`PC_PX`, régimes `POSTE.r`), plancher `PC_MIN` ; `fast` → 1.
- ⚠ **`dprPlafond` ne distingue pas `net` et `haute`** : HAUTE n'apporte aucun pixel de plus que MOYENNE.

### 3.2 Les planchers de l'échelle QL : `qlNet()` (`nettete-qualite.js:97`) et `qlBornes()` (`:135`)
- `net` ou `haute` → plancher `PAL.b('dprNet',1.25)`, bas `PAL.b('dprNetBas',1)` (`PAL.B.dprNet=[1,1.15,1.25]`, `dprNetBas=[.85,.9,1]`, `:93`).
- `fast` → plancher 0,85, bas 0,7.

### 3.3 Ce que HAUTE ajoute à NETTE : `qHaute()` (`nettete-qualite.js:105`)
- `qlPose(k)` (`:140`) : `if(qHaute())k=0` — cran 0 forcé : ombre pleine (`QL.ombre0`), bloom pleine résolution, flou radial (`FLOU_OK`), jamais de baisse de résolution par l'échelle. Sinon la course part au cran `max(PAL.bT('imgQlDepart',PAL.b('qlDepart',0),'c'), POSTE.k0)` (`:239` ; `imgQlDepart=[5,2,1]`, `qlDepart=[5,2,0]`) — palier 2 : cran 1 en NETTE.
- `qlAuto()` (`:132`) faux en HAUTE → l'échelle automatique QL de `code/moteur/boucle-1.js:98` ne baisse plus.
- Ordinateur : `posteCadOk` / `posteJugeable` (`code/moteur/poste-juge.js:14,25`) — HAUTE n'est jamais jugée ; et au CHARGEMENT `code/rendu/soleil-planete.js:476` lit la sauvegarde brute : `q==='haute' && qChoisi!==0` → `POSTE.r=3` (régime MAX).
- ⚠ **Le gouverneur thermique du téléphone ignore HAUTE** (non vérifié en jeu, lu) : `code/moteur/gouverneur-paliers.js` n'appelle jamais `qHaute`. `mobPalVoulu` pose via `imgRegle({dpr,halo,mips,ombre,ciel,stries})` le départ `MOB_P0={halo:'demi',mips:3,ombre:768,…}` (`:37`) puis baisse par paliers. `imgRegle` change `DPR_CAP` puis `qlPose(QL.k)` → k=0 mais `qlDpr(0)=b.cap=DPR_CAP` : la résolution baisse quand même en HAUTE. `mobPalCapJoueur` (`:53`) et `mobPalCapPlein` (`:54`) ne testent que `q==='fast'`.
  ⇒ Sur iPhone récent, HAUTE ≈ NETTE + ombre/halo/flou du cran 0 tant que le gouverneur reste au palier 0 ; mais le halo ½ / 3 mips / ombre 768 de `MOB_P0` s'appliquent dès que le gouverneur pose quoi que ce soit (non vérifié : l'instant exact où MOB_P0 est posé).

### 3.4 La vitrine HD (VHD : accueil, garage, boutique) — **le réglage n'y change presque rien**
- `vhdDpr()` (`nettete-qualite.js:198`) = `max(DPR_CAP, min(dpr, sqrt(PAL.b('vhdPx')/px), 2 sur TEL_NATIF sauf ?menu=max))` ; `PAL.B.vhdPx=[.45e6,1.4e6,1.4e6]` (`:238`), `vhdDprTel=[2,2,2]`, `vhdOmbreTel=[1024,…]` (`:197`).
  Un 390×844 : sqrt(1,4 M / 329 k) ≈ 2,06 → vitrine à 2 quel que soit IMAGE (q ne joue que par le plancher DPR_CAP).
- En course VHD est éteint ; à l'écran de fin le téléphone garde la résolution de course (`PCM_ON`, `:189`).

### 3.5 Résumé par valeur (iPhone palier 2, TEL_NATIF, sans paramètre d'URL)
- BASSE (`fast`) : course DPR 1, planchers 0,85/0,7, échelle QL auto, gouverneur.
- MOYENNE (`net`, défaut) : DPR 1,25 (levier c), départ cran 1, planchers 1,25/1, échelle QL auto (seuil p75 19 ms, `imgQlP75`), gouverneur.
- HAUTE : DPR 1,25 aussi, cran 0 figé, pas d'échelle QL, gouverneur thermique toujours actif.
- **Aucune des trois n'atteint l'image ordinateur** (plafond 1,5+, halo plein, ombre 1024, ciel entier, traits pleins) : pour ça il faut `?img=max` + `?gouv=max` (paramètres de banc, pas un réglage).

## 4. Le défaut selon l'appareil

- `PAL.B.qNetDefaut=[0,0,1]` (`nettete-qualite.js:93`) : une sauvegarde qui n'a jamais choisi part en NETTE sur palier 2, RAPIDE sur paliers 0-1 ; l'ordinateur (`!ALLEGE || POSTE.auto`) toujours NETTE.
- Le palier vient de `PAL` (`palier-appareil.js:22-87`) : `?palier=` > palier appris en course (`localStorage.cashcarPalier`, `src:'mesure'`) > ordinateur > **modèle natif `window.__ccAppareil`** (« iPhone14,2 », `:61-64` ; `iPhoneN,x` : N≤10 → 0, N≤12 → 1, sinon 2 ; `?appareil=iPhone12,8` au banc) > iOS ≤ 15 > taille d'écran (`:51-59`) > banc CPU.
- ⚠ **Tous les iPhone depuis le 12 (iPhone13,x) sont palier 2** : 13 Pro, 15, 17 Pro Max reçoivent exactement les mêmes budgets — c'est la cause de la plainte de Sacha. Il n'y a pas de palier au-dessus de 2, et le modèle exact n'est retenu que pour choisir 0/1/2.
- Le défaut est **relu à chaque chargement** tant que `qChoisi` vaut 0 (`sauvegarde.js:71`).

## 5. Sauvegarde, migration, miroir natif

- Défaut d'une sauvegarde neuve : `code/sauvegarde.js:11` — `q:((PAL.b('qNetDefaut',0)||!ALLEGE||POSTE.auto)?'net':'fast'),qChoisi:0`.
- Désinfection (à CHAQUE chargement, `san`) : `sauvegarde.js:67` `c.q=(d.q==='net'||d.q==='haute')?d.q:'fast'` ; `:68-71` règle `qChoisi` : 1 si `d.qChoisi===1`, ou si absent et q ∈ {net,haute} (sauvegardes d'avant le champ) ; sinon 0 → q = défaut du palier.
- `SAVE.V=2` (`:8`) ; emplacement prévu pour les migrations : `load()`, commentaire « une marche par version » (≈ `:220`). Aucune migration de `q` n'existe aujourd'hui en dehors de `san`.
- **Lecture d'avance hors SAVE** (avant le 1er `setSize`, `TOILE1`, `palier-appareil.js:264-268`) : relit `localStorage.cashcarSave` brut et refait la même règle → `TOILE1_Q` ∈ fast|net|haute, puis `DPR_CAP=dprPlafond(TOILE1_Q==='fast')`. `mobile-tactile.js:11` saute `applyQ` si le plafond est déjà le bon. `?toile1=0` = ancien ordre.
- **Lecture d'avance n°2** : `soleil-planete.js:476` (POSTE, ordinateur seulement) relit `q==='haute'`.
- Miroir natif Capacitor : `SAVE.flush()` (`sauvegarde.js:241-244`) écrit le JSON ENTIER (donc `q`, `qChoisi`) dans `Capacitor.Plugins.Preferences` (clé `cashcarSave`) ; `fige()` (`:234`) et `import()` (`:252-257`) aussi. Au démarrage, si localStorage est vide/illisible ou témoin `cashcarSave_natif==='1'`, `Preferences.get` (`:278-297`) sème le miroir puis **recharge la page**. Aucun traitement spécifique de `q` côté natif ; `app-ios/natif/natif.js` ne lit pas `q` (grep : seulement un diagnostic de présence, l. 421).
  ⇒ Une migration écrite dans `san` s'applique aussi aux sauvegardes restaurées du miroir (elles repassent par `load`). Mais `TOILE1_Q` du tout premier lancement après restauration lit le localStorage vide → repli défaut, corrigé par `applyQ` (`mobile-tactile.js:11`).
- Diagnostics qui exposent `q` : `code/interface/habillages-accueil.js:199`, `code/interface/bouton-nitro-gains.js:295` (lecture seule).

## 6. À chaud ou au rechargement ?

- Téléphone : **à chaud.** `applyQ(fast)` (`mobile-tactile.js:331`) = `DPR_CAP=dprPlafond(fast); qlReprise()` → `qlPose` → `applyDPR` (réallocation toile + cibles du compositeur, un à-coup). `qHaute()`/`qlNet()`/`qlAuto()` lisent `SAVE.d.q` à chaque appel : effet immédiat.
- Ce qui NE suit PAS à chaud (lu une fois au chargement) : `TOILE1_Q`, `POSTE.r` HAUTE sur l'ordinateur (`soleil-planete.js:476` → régime MAX seulement au prochain chargement), `ALLEGE`, `MOB_PALS`, `PAL.n`, les leviers `PAL.imgOn` (consts), `VHE_MODE`, `MENU_MAX`.
- Pièges à chaud (lus, non vérifiés en jeu) :
  - `imgRegle('reset')` remet `DPR_CAP=IMG_REGLE0.cap` = le plafond mémorisé au 1er `imgRegle` : si le joueur change IMAGE pendant que le gouverneur a posé quelque chose, le reset rend l'ANCIEN plafond (le rattrapage `gouverneur-paliers.js:79` ne joue que si `MOB_P.t>0` et seulement à la baisse).
  - Si la vitrine est allumée (`VHD.on`, changement depuis l'accueil), `qlPose` garde `VHD.dpr`, non recalculé par `applyQ` (la différence ne se voit qu'au plancher `DPR_CAP`).

## 7. Passer à deux choix HAUTE / BASSE : quoi modifier

Proposition minimale qui garde les valeurs internes (moins de risques) — à arbitrer : soit `fast`→BASSE et `haute`→HAUTE en supprimant `net` ; soit (plus fidèle à la demande « BASSE = fluidité optimale, meilleur rapport ») BASSE = le comportement actuel `net` du profil de l'appareil, et `fast` disparaît. Les deux variantes touchent les mêmes lignes :

1. `nettete-qualite.js:133` `qSuivant` : bascule à deux valeurs.
2. `nettete-qualite.js:134` `qLbl` : deux clés. Si on garde la clé `RAPIDE`, le FR « BASSE » vient déjà d'`I18N_FR` ; sinon ajouter `'BASSE':'LOW'` (EN) et `HAUTE:'HIGH'` hors du bloc mobile.
3. `passe-textes.js:6-9` : retirer `NETTE→MOYENNE`/`MEDIUM` (et le commentaire TEL-N04) ; `mobile-tactile.js:330` déplacer `HIGH` dans passe-textes ; `ecrans-menus.html:155` texte initial.
4. `nettete-qualite.js:97` `qlNet`, `:105` `qHaute`, `:93` `qNetDefaut` (ou une table par modèle, voir §8).
5. `palier-appareil.js:252-253` `dprPlafond(fast)` : aujourd'hui un booléen ; il faut un plafond HAUTE distinct (sinon HAUTE = MOYENNE en pixels).
6. `sauvegarde.js:11,67,71` : défaut + désinfection + migration. `palier-appareil.js:265-267` (`TOILE1_Q`, même règle en double) et `soleil-planete.js:476` (POSTE) à garder en phase.
7. `gouverneur-paliers.js:53-54` et tout le gouverneur : décider ce que HAUTE accepte (garder au moins les paliers d'urgence thermique ≥ 2 pour la batterie / le bridage iOS).
8. Les trois clics : `mobile-tactile.js:398,969`, `desktop-banc.js:40` (inchangés si `qSuivant` change).
9. `poste-juge.js:14,25` (ordinateur) : rien si HAUTE garde sa valeur `'haute'`.

**Migration du joueur qui avait MOYENNE (`net`)** — à trancher par Sacha/l'orchestrateur :
- `qChoisi=0` (jamais touché, le cas de presque tout le monde) : rien à migrer, il prendra le nouveau défaut de son appareil.
- `net` + `qChoisi=1` : il a choisi MOYENNE explicitement (depuis BASSE, ou en passant par le cycle). Proposition : `net` → BASSE (c'est l'image fluide qu'il avait, puisque la BASSE nouvelle = profil fluide) en gardant `qChoisi=1` ; ou remettre `qChoisi=0` pour qu'il reçoive le profil de son appareil. ⚠ Avec le cycle actuel, un joueur passé par MOYENNE pour atteindre HAUTE est déjà en `haute` : aucun souci.
- `fast` + `qChoisi=1` : → BASSE.
- Écrire la marche dans `san` (s'applique à chaque chargement, au miroir natif et aux codes importés) ; si l'on veut une migration « une fois », lever `SAVE.V` à 3 et ajouter `if(d&&d.v<3){…}` dans `load()` — mais `import()` passe par `san` sans `load` : la règle doit aussi tenir dans `san`.

## 8. Pour un système de profils par appareil : où brancher, pièges

**Où brancher**
- Le modèle exact est déjà là : `window.__ccAppareil` (natif, posé avant le script) lu dans `palier-appareil.js:61-64` ; `?appareil=iPhoneN,x` pour le banc. C'est le bon point pour une table modèle → profil (p. ex. iPhone13-14,x = 12/13 → profil « 13 Pro », iPhone15-16,x = 14/15, iPhone17,x+ = 16/17 → « ordinateur »). Exposer le résultat sur `PAL` (p. ex. `PAL.profil`) avant `dprPlafond` et avant la ligne `TOILE1` (`:264`).
- Les budgets se lisent par `PAL.b(clé)` (colonne `PAL.n`) et `PAL.bT(clé, avant, levier)` (3e colonne si levier actif) : un 4e palier « 3 = très récent » obligerait à rallonger TOUTES les tables `PAL.B.*` (`[a,b,c]` lues par index) — une table qui n'a que 3 colonnes rendrait `undefined` au palier 3 ; `P.n` est borné 0-2 (`:31`, `:32`, `?palier=([0-2])`, palier appris `n<=2`). Plus sûr : garder `PAL.n=2` et faire couper les leviers `img*` par le profil (`PAL.imgOn` → faux = « comme l'ordinateur », exactement ce que fait `?img=max`) + `MOB_PALS`/`MOB_P0` adoucis (équivalent `?gouv=max` partiel).
- Plafond HAUTE : `dprPlafond` (`:252`) — ajouter un plafond par profil (p. ex. 1,5 sur 15, 2 sur 17 Pro) ; `mobPalCapPlein` (`gouverneur-paliers.js:54`) est déjà « vers l'ordinateur ».
- Défaut du réglage : `qNetDefaut` → remplacer par une fonction du profil ; elle doit être identique dans `sauvegarde.js:11,71` ET `palier-appareil.js:267` (lecture d'avance).
- Crochets : `dbgNette()` (`nettete-qualite.js:146`), `dbgImg()` (`palier-appareil.js:101`), `dbgPalier()` (`:139`), `dbgVHD()`, `dbgVhdEcran()`, `imgRegle()` (lecture/pose à chaud), `dbgQual(k)` (`:254`), `dbgGouv()` / `dbgGouvPaliers()` (gouverneur-thermique.js:117-119), `dbgPoste()`, `dbgBarriere()`.
- URL : `?img=max|a,c|13`, `?imgsans=`, `?imgplus=`, `?gouv=max`, `?mob_raise=1`, `?palier=0..2`, `?appareil=`, `?palecran=0`, `?toile1=0`, `?menu=max`, `?hd=0`, `?frais=0`, `?pcmort=0`, `?sans=chargechaud`, `?poste=0..3|max`, `?bloom=1`, `?sonde=ancien`.

**Pièges**
1. HAUTE et MOYENNE ont le même plafond de pixels aujourd'hui (§3.1) : changer seulement les libellés ne rendra rien plus net.
2. La règle du défaut est écrite **trois fois** (`sauvegarde.js:11`, `:71`, `palier-appareil.js:267`) + une 4e lecture brute (`soleil-planete.js:476`) : les désynchroniser = toile allouée au mauvais rapport puis réallouée (`applyQ` de `mobile-tactile.js:11` rattrape, mais coûte un à-coup au démarrage).
3. `typeof SAVE` ne protège pas la zone morte du `const SAVE` (`nettete-qualite.js:94-96`) : tout code de profil exécuté avant `sauvegarde.js` doit lire `localStorage` brut, comme `TOILE1_Q`.
4. Le gouverneur thermique ne connaît pas HAUTE (§3.3) ; et `imgRegle('reset')` restaure un plafond mémorisé (§6) : un changement de réglage en course peut être défait.
5. Le palier appris en course (`cashcarPalier`, `src:'mesure'`) passe AVANT le modèle : un 15 qui aurait été rétrogradé une fois resterait bas. À vérifier : qui écrit `src:'mesure'` (non lu ici, hors de ce sous-système).
6. Les leviers `img*` et `MOB_PALS` sont des `const` lus au chargement : un profil choisi par le joueur (HAUTE ⇄ BASSE) qui voudrait les changer demande un rechargement, ou de les rendre dynamiques (`PAL.imgOn` est appelé à chaque `PAL.bT`, mais beaucoup de résultats sont figés dans des `const`/`let` au chargement : `BLOOM_BASE` `:301`, précision du renderer `:174`, `QL.ombre0`…).
7. Ordinateur : HAUTE force `POSTE.r=3` au chargement seulement ; la colonne Vercel doit rester au pixel près (règle CLAUDE.md « DEUX VERSIONS, UN CODE »).
8. Les règles CSS d'IMAGE (`pause-v2.css`, `ux8.css`) ne touchent que `html:not(.c6)` ; le panneau à deux valeurs n'a pas besoin de CSS (une `.valeur` texte), sauf longueur du mot.
9. Lignes très longues, commentaires `/* */` seulement, un seul gros IIFE : `applyQ` (bloc mobile) est hors de portée de `desktop-banc.js` (d'où `applyQ9`) — toute nouvelle fonction partagée doit être déclarée hors du bloc `if(IS_MOBILE…)`.
10. Ne pas toucher `code/maps/*` (autre session) : aucune des lignes ci-dessus n'y est.
