# LOT 1 — LE PROFIL (`PRF`) : rapport (14/11)

Branche `qa/profil` (partie de `qualite-appareil`), worktree `~/cash-car/qualite-profil`. Seuls les fichiers du lot 1 sont touchés
(+ un banc à moi, `outils/banc-profil/profil.cjs`). `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS commités : l'intégrateur fait
`node code/assembler.cjs --depuis-morceaux`.

## Ce qui est fait (fichier:ligne, numéros des morceaux)

### `rendu/soleil-planete.js` (juste avant `POSTE`)
- `:434-446` le commentaire de section (classes, niveaux, statique/à chaud, interrupteurs).
- `:447` `prfLit()` lit `localStorage.cashcarProfil` (`{v:1,c,m,t}`) ; `:448` `prfApprend(c, plus)` l'écrit (classe bornée à [1, classe du modèle], modèle retenu,
  note `profil` dans la boîte noire). **Lecture seule côté profil** : seul le juge (lot 4) appellera `prfApprend`.
- `:450-480` `const PRF` : la table `PRF.T` (TOUS les chiffres) et le calcul au chargement :
  - `T.n[1..4]` niveaux (N1 : rien n'y est lu, c'est le code d'aujourd'hui ; N2 `dpr 1.5, pl 1.25, bas 1, ombre 1024, mips 4, éteints 'abde'` ;
    N3 `dpr 2, pl 1.5, bas 1.25, gros, ombre 1280, mips 5, éteints 'abcdei'` ; N4 `px 3.2e6 (DPR 2..3), plK .72, basK .5 (≥ 1.25), gros, ombre 1280, mips 5, 60 i/s`).
  - `T.c[1..4]` classes : `{fast, haute, def, fpsFast}` = 1:N1/N2 BASSE · 2:N2/N3 BASSE · 3:N3/N4 HAUTE · 4:N3 (60 i/s)/N4 HAUTE.
  - `T.hauteK=2` (HAUTE : cran QL max), `T.vhd[3|4]` (vitrine de l'image PC : 1,8 / 2,6 Mpx, densité ≤ 3, ombre 2048).
  - surcharges d'URL : `?prfdpr=` (`T.dprForce`), `?prfniv=1..4` (`T.nivForce` : niveau ET statique), `?prffps=30|60`.
  - classe du modèle : `window.__ccAppareil` ou `?appareil=iPhoneN,x` → N ≤ 12 : 0 · 13-14 : 1 · 15-16 : 2 · 17 : 3 · ≥ 18 : 4 ; `?classe=1..4` force (même sans modèle).
    Classe effective = min(modèle, apprise) si l'apprise vaut pour CE modèle (`a.m`).
  - réglage lu BRUT dans `cashcarSave` (même règle de `qChoisi` que `TOILE1_Q`) : `'haute'`/`'fast'` choisis → tels quels ; `'net'` ou jamais choisi → `T.c[c].def`.
  - `PRF.on` faux et RIEN calculé si `!TEL_NATIF` (ordinateur, Vercel) ou `?sans=profil` ou classe 0.
- `:481-484` `prfNivT`, `prfFpsT`, `prfQ(v)` (normalise : 'net' → défaut de la classe), `prfHors(raison)`.

API figée exposée : `PRF.on, c, c0, q, n, nMax, pc, fps, dpr, src, haute()` + `PRF.T`, `PRF.modele`, `PRF.appris`, `PRF.qBrut` ; `prfRegle(q)` ; `prfApprend(c)`.

### `rendu/palier-appareil.js`
- `:99` `PAL.imgOn(l)` exige en plus `prfLev(l)` ; `:105` `prfLev` : hors profil vrai (rien ne change) ; leviers à chaud a-f suivent `PRF.n`, figés g i j suivent `PRF.nMax`.
  Donc N1 = leviers d'aujourd'hui, N2 = a b d e éteints, N3+ = c et i aussi. `?img=…` / `?imgsans=` / `?imgplus=` jouent toujours par-dessus.
- `:106` profil coupé si `PAL.n < 2` (?palier=, palier appris) — `prfHors`.
- `:109` **`IMG_TEL = ALLEGE && !(PRF.on && PRF.pc)`** — le drapeau des gardes VISIBLES statiques. Hors profil = `ALLEGE` au bit près.
- `:110` `prfNote(quoi)` : la ligne `profil` de la boîte noire (téléphone profilé, ou de classe connue mais coupé) ; `:284` au chargement.
- `:117` `mapsSobres()` faux si `PRF.nMax >= 4` (sauf `?sobre=1`).
- `:262-266` `prfDprDe(n)`, `prfSuit()`, `dprPlafond(fast)` → sous profil : le plafond du NIVEAU (fast ignoré ; N1 = `dprPlafond0(false)` = la NETTE d'aujourd'hui 1,25) ;
  `dprPlafond0` = l'ancienne fonction intacte. `prfSuit` rattrape un `SAVE.d.q` changé par un bouton (applyQ → dprPlafond) : **les boutons n'ont rien à appeler**.
  `dprNetCap` (déclaré deux fois) n'est pas touché.

### `rendu/triptyque-bloom.js` (ombre, étages SEULEMENT)
- `:12` filtre d'ombre : sous profil `PRF.pc` → PCFSoft, sinon PCF (le filtre d'aujourd'hui, quel que soit le réglage du chargement : la classe 1 garde PCF même lancée en HAUTE).
- `:14` `ombreTel()` (taille du niveau : N2 1024, N3-4 1280 ; N1/hors profil = l'expression d'avant) → `OMBRE_N` ; `:15` `bloomNM()` (étages : N2 4, N3-4 5 ; sinon l'expression d'avant, levier j compris) → `:337`.

### `rendu/nettete-qualite.js`
- `:132` `qlAuto` : vrai aussi en HAUTE profilée. `:133-134` `qSuivant` / `qLbl` : deux choix BASSE ⇄ HAUTE sous profil (`'RAPIDE'` = affiché BASSE).
- `:136, :143` `qlBornesPrf()` : bornes N2-N4 (planchers de la table ; N3-N4 « gros » = 2 + 1 crans de résolution, N2 les pas de 0,08). `:138` N1 : `net` forcé (BASSE N1 = planchers NETTE 1,25 / 1).
- `:150` `qlPose` : HAUTE profilée → `k ≤ PRF.T.hauteK` (2) tant que le gouverneur est sous le palier 2 (`prfGouv()`) ; à « sérieux » et plus son `qlMin` garde la main. Hors profil : `qHaute → k=0` comme avant.
- `:215-220` vitrine VHD : budget/densité/ombre `PRF.T.vhd[nMax]` si `PRF.pc` ; `vhdAniso` sur `IMG_TEL`.
- `:246-252` commentaire ; `:253` `prfGouv` ; `:254` `prfDepart` (= le départ de `:245`) ; `:255` `prfP0` ; `:257` **`prfRegle(q, sansReprise)`** :
  niveau, fps, plafond ; `BLOOM_BASE` (levier a), `bloomPass._nM`, `QL.ombre0`, `DPR_CAP`, puis `qlReprise()` (une réallocation).
  Pièges tenus : **`IMG_REGLE0`** (gouverneur actif) → on réécrit la BASE que son `reset` rendra, sans défaire ce qu'il a posé (DPR seulement rabattu s'il dépasse) ;
  **`VHD.k0`** (à l'accueil) → reparti du départ du nouveau niveau ; **`MOB_P0`** (le départ N1 recopié à chaque bascule) → `prfP0` y met halo 'tout', les étages et l'ombre du niveau
  (et le rend tel quel au N1) — fait aussi une fois après la fin du script (microtâche `:268`).
- `:273-274` **`window.dbgPrf(o)`** : profil + ce qui est posé (toile réelle, ombre taille/base/filtre, halo base/rés./étages/cible, QL k/kNet/kMax/planchers, gouverneur, vitrine,
  MOB_P0, leviers). `dbgPrf('haute'|'fast')` règle à chaud (SAVE en mémoire, sans flush) ; `dbgPrf('oubli')` efface `cashcarProfil`.
  ⚠ `window.dbgProfil` EXISTAIT (voitures/plaque.js:385 : ouvre l'écran PROFIL du joueur). Sur TÉLÉPHONE seulement, après le script, `dbgProfil(o)` = `dbgPrf(o)` (l'API du plan)
  et `dbgProfil('joueur')` = l'ancien. Sur l'ordinateur `dbgProfil` reste celui de la plaque.

### Gardes visibles passées d'`ALLEGE` à `IMG_TEL` (statique, suit `PRF.pc`)
`rendu/autoroute.js:202` (anisotropie), `:243` (`FACES`), `:310` (« autoroute gronde ») · `rendu/bitume-beton.js:83` (anisotropie) · `economie/livrees.js:64` (livrées ½)
· `interface/vitrine-miniature.js:26` (`vitLarg`) · `rendu/nettete-qualite.js:217` (`vhdAniso`). Photos du ciel 4096 (`chute-menu.js:159`) : par le levier i (`prfLev`), sans retouche.
Ciel lissé (`ciel2.js:59`) et traits d'air (`stries-vent.js:35`) : par les leviers d / e relus à chaque image, sans retouche.
Laissés sur ALLEGE (sans perte ou hors de mon lot) : tout le reste ; `TRAIT_RGB` (`bitume-beton.js:319`, décision DA de Sacha) ; `JADE_CIEL_F` (`ciel2.js:32`, ciel de map) ; `TERRE_PETITE`
(`soleil-planete.js:268`, calculé avant PRF).

## Interrupteurs
`?sans=profil` (tout comme avant) · `?classe=1..4` · `?appareil=iPhoneN,x` · `?prfdpr=1.75` · `?prfniv=1..4` · `?prffps=30|60` · `?sobre=1` (maps sobres même en N4) ·
et toujours `?img=max|a,c` `?imgsans=` `?imgplus=` par-dessus. Crochet : `dbgPrf()` (alias `dbgProfil()` sur téléphone). Journal : `profil` (`dbgErreurs()` / boîte noire).

## VÉRIFIÉ (et comment)
Banc `outils/banc-profil/profil.cjs` (un Chrome sans fenêtre, muet, sfx/mus/vox coupés dans la sauvegarde ; téléphone émulé 844×390 DPR 3, tactile, `hover:none`,
UA iPhone → TEL_NATIF vrai, SANS `?tel=1` ; `?appareil=` ; une course de 20 s au pilote auto `dbgAuto`, rAF réel). Sorties : scratchpad de la session (non gardées).
- Syntaxe : `node code/assembler.cjs --depuis-morceaux` puis `node outils/garde-demarrage.cjs` OK (21 scripts lus par acorn) ; `garde-allege.sh` OK.
- **Chaque classe × réglage, après 20 s de course, 0 exception, 0 console.error, 0 panne** (seule la ligne `profil` dans `dbgErreurs`) :

| essai | niveau (statique) | toile réelle | DPR | ombre | filtre | halo base / étages | leviers allumés | maps sobres | QL k / kNet / kMax |
|---|---|---|---|---|---|---|---|---|---|
| iPhone14,2 BASSE | N1 (N2) | 1055×487 | 1,25 | 768 | PCF | 0,5 / 3 | a b c d e f i | oui | 1 / 5 / 10 |
| iPhone14,2 HAUTE | N2 (N2) | 1266×585 | 1,5 | 1024 | PCF | 1 / 4 | c f i | oui | 1 / 9 / — |
| iPhone15,4 BASSE | N2 (N3) | 1266×585 | 1,5 | 1024 | PCFSoft | 1 / 4 | c f | oui | 1 / 9 / — |
| iPhone15,4 HAUTE | N3 (N3) | 1688×780 | 2 | 1280 | PCFSoft | 1 / 5 | f | oui | 0 / 7 / — |
| iPhone17,1 BASSE | N3 (N4) | 1688×780 | 2 | 1280 | PCFSoft | 1 / 5 | f | **non** | 0 / 7 / — |
| iPhone17,1 HAUTE | N4 (N4), 60 i/s | 2532×1170 | 3 | 1280 | PCFSoft | 1 / 5 | f | non | 0 / 7 / — |
| iPhone18,1 BASSE | N3 (N4), 60 i/s | 1688×780 | 2 | 1280 | PCFSoft | 1 / 5 | f | non | 0 / 7 / — |
| iPhone18,1 HAUTE | N4 (N4), 60 i/s | 2532×1170 | 3 | 1280 | PCFSoft | 1 / 5 | f | non | 0 / 7 / — |

  Vitrine (menu) : classe 1 densité 2 / ombre 1024 (comme avant) ; classe 2 2,34 / 2048 ; classes 3-4 2,81-3 / 2048.
- **Le témoin** : iPhone14,2 sauvegarde neuve, la MÊME course sur l'ancien jeu (`~/cash-car/qualite`, = origin/main v1596) et sur la branche : `dbgNette`, `dbgImg`, `dbgQual`,
  `dbgVHD`, `imgRegle()`, taille de la toile, filtre d'ombre **identiques champ par champ** au menu et après 20 s de course. Idem ancienne sauvegarde `q:'net', qChoisi:0`.
- **L'ordinateur** (Chrome sans émulation) : sauvegarde neuve et `q:'haute'` : mêmes lectures **identiques champ par champ** entre l'ancien jeu et la branche (PRF.on faux, IMG_TEL = ALLEGE).
- `?sans=profil` sur iPhone14,2 en `'fast'` : l'ancien RAPIDE (DPR 1, planchers 0,85 / 0,7), aucune ligne `profil`.
- **À chaud** (iPhone15,4 BASSE, en course) : `dbgPrf('haute')` → N3 tout de suite (toile 1688×780, ombre 1280, halo 5 étages, cible 709×328, bornes N3) ; `dbgPrf('fast')`
  → N2 (1266×585, 1024, 4 étages) ; deux lignes `profil` « réglage BASSE → HAUTE / HAUTE → BASSE » ; 0 erreur.
- **Le gouverneur garde la main en HAUTE** (iPhone17,1 HAUTE, `dbgThermique(2)` en course) : palier 2, `qlMin` = kMax 9, k = 9, halo coupé, ombre 512, résolution au plancher
  BAS 1,5 (le plafond 3 reste noté) ; `MOB_P0` = `{halo:'tout', mips:5, ombre:1280}` (prfP0 l'a bien recopié). 0 erreur.

## NON vérifié
- Rien n'a tourné sur un vrai iPhone : coût GPU, chaleur, mémoire des niveaux N2-N4 (à DPR 3 : toile 2532×1170 + cibles demi-flottantes + halo ; ordre de 80-100 Mo estimé
  par la carte, non mesuré), tenue de la cadence, perte de contexte.
- Le gouverneur avec le VRAI capteur iOS (`cc:thermique`) : seulement simulé par `dbgThermique` au banc (voir plus haut).
- L'enchaînement BASSE ⇄ HAUTE par le vrai bouton (lot 2) : vérifié par `dbgPrf('haute'|'fast')` qui écrit `SAVE.d.q` comme le bouton ; le chemin `applyQ → dprPlafond → prfSuit` est lu, pas cliqué.
- L'image elle-même (photos AVANT/APRÈS) : pas faites (lot 5).

## À juger sur le vrai iPhone 13 Pro (`CC_QS` : `&classe=N`, `&prfniv=N`, `&prfdpr=x`)
1. Classe 1 BASSE (défaut) = l'image d'avant : rien ne doit avoir bougé (c'est le témoin).
2. Classe 1 HAUTE = N2 : DPR 1,5, halo plein à 4 étages, ombre 1024 — fluide ? chaleur ?
3. `&classe=2` (N2 / N3), `&classe=3`, `&classe=4` sur le 13 Pro : à quel niveau il décroche (c'est ce qui calera la table `PRF.T`).
4. La ligne `profil` dans la boîte noire (`dbgErreurs` côté banc ; boîte de vol côté app).

## Pour les autres lots
- **Lot 2 (réglages)** : `qSuivant`/`qLbl` sont déjà à deux valeurs sous profil (`nettete-qualite.js:133-134`, mon fichier) ; les boutons peuvent rester tels quels
  (`applyQ(SAVE.d.q==='fast')` → `dprPlafond` → `prfSuit` → `prfRegle`). Le libellé `RAPIDE` → BASSE vient d'`I18N_FR`. `sauvegarde.js` : le défaut et `san` peuvent garder
  `'net'` (lu comme « défaut de la classe ») ou écrire `T.c[PRF.c].def` ; `PRF.q` fait foi sur téléphone. Hors profil (ordinateur, Safari) : le cycle à trois d'avant reste.
- **Lot 3 (traînées / loupe)** : la LOUPE (`loupe-caisse.js:24`) et `NET_NITRO` restent allumées à tous les niveaux (ALLEGE et PAL.n inchangés). Mais à N4 la scène est déjà à DPR 3 :
  la loupe agrandit ×1 (passe plein écran inutile) — la couper quand `curDPR >= LOUPE.k - 0,05` (ou rabattre `LOUPE.k` à `devicePixelRatio`), et à N3 (DPR 2 → ×1,5) vérifier
  que sa reconstruction vaut encore son coût. `QUAL_LOW` (halo coupé à chaud) éteint toujours les lampes des traînées.
- **Lot 4 (cadence + juge)** : lire `PRF.fps` (30/60) pour `MOB_FROID30`/`g30` ; remplacer le rattrapage `prfP0` (qui écrit dans `MOB_P0` depuis mon fichier) par une lecture
  du niveau dans `mobPalVoulu` ; `mobPalCapPlein` (`gouverneur-paliers.js:54`, remontée éteinte) vise encore `dprNetCap` ; le juge écrit par `prfApprend(c)` ;
  `PRF.haute()` pour la tolérance de HAUTE.
- **Lot 5 (banc)** : `?appareil=` + émulation tactile/`hover:none` suffisent pour TEL_NATIF ; NE PAS mettre `?tel=1` (FORCE_TEL fait passer PAL par la branche « ordinateur »).
