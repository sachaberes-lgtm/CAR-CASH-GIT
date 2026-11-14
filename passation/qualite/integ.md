# LOT « integ » — LES CORRECTIONS D'INTÉGRATION DES LOTS 1-3 (14/11)

Branche `qa/integ` (partie de `qualite-appareil` 9fc36a112), worktree `~/cash-car/qualite-integ`. Rien dans `code/maps/*`, ni `moteur/cadence.js`,
`moteur/gouverneur-*.js`, `moteur/mobh-*.js` (lot 4). `VERSION PRINCIPALE/index.html` et `sw.js` NON commités (`node code/assembler.cjs --depuis-morceaux`).
Source : les trois CONTRÔLES ADVERSES des lots 1-3 (journal du workflow) et les décisions du pilote (a)-(h).

## Ce qui est fait (fichier : ce qui change)

**(a) crochet** — `rendu/nettete-qualite.js` : la redirection de `window.dbgProfil` sur téléphone est SUPPRIMÉE ; le crochet du profil est `window.dbgPrf`
partout ; `dbgProfil` = celui de `voitures/plaque.js` (intact) sur toutes les plateformes. Textes alignés : `soleil-planete.js` (commentaire), `PLAN.md`, `profil.md`.

**(b) réglages hors profil** — `sauvegarde.js` : `Q2_ON = TEL_NATIF && PRF.on && !?sans=reglage2`. Un téléphone hors profil (Safari sans modèle, iPhone 11 et
avant, paliers 0-1, `?sans=profil`) garde les trois choix, son défaut et sa migration d'avant. `qDefautTel()` = `prfDef()` (plus de repli « qNetDefaut → HAUTE »).

**(c) une seule règle du défaut** — `soleil-planete.js` : `prfDef()` (= `PRF.T.c[PRF.c].def`) lu par `prfQ`, par `qDefautTel` (sauvegarde) et, via `PRF.q`, par
`TOILE1_Q` (`palier-appareil.js` : sous profil `TOILE1_Q = PRF.q`, hors profil la ligne d'avant mot pour mot). En plus : `prfSuit` (appelé par `dprPlafond`) qui
change de niveau sans que l'appelant refasse `qlReprise` (miroir natif, `mobPalCapJoueur` du gouverneur) programme une `qlReprise` à la microtâche
(`PRF.repr`, effacé par `qlReprise`) — défaut 3 du contrôle du lot 1 (toile restée à l'ancien niveau).

**(d) le choix** — `moteur/mobile-tactile.js` : `qRegle` ne fait RIEN si la position touchée est déjà prise (ni `qChoisi`, ni `flush`) ; `qVers` : un tap dans la
marge / l'écart de `b.choix2` (ni BASSE ni HAUTE) rend la position courante ; dans RÉGLAGES `#mvQ` porte `data-m="q"` pour que la marge y arrive (sinon `mHit`
remontait à la ligne, qui bascule). L'ordinateur et le hors-profil (cycle à trois de `qSuivant`, qui change toujours de valeur) : même chemin qu'avant.

**(e) le piège `imgRegle('reset')`** — déjà tenu par `prfRegle` (lot 1 : sous gouverneur actif il réécrit la BASE `IMG_REGLE0` que le `reset` rendra) ; le seul chemin
qui ne le tenait pas (`applyQ` de repli dans `qRegle`) ne sert plus sur téléphone profilé depuis (b). Vérifié au banc (voir plus bas), rien à coder de plus.

**(f) N1** — textes corrigés : N1 = l'image d'aujourd'hui + les traînées nettes + la loupe allongée (décision : Sacha veut la voiture et les traînées parfaites sur
son 13 Pro ; les rubans restent sur `PRF.on`, N1 compris). `soleil-planete.js` (en-tête du profil), `PLAN.md` (table des niveaux), `profil.md` (à juger, point 1).
Le témoin strict d'avant = `?sans=profil`.

**(g) traînées / loupe** — `rendu/loupe-caisse.js` : « la loupe suit la résolution » (`loupeDpr`) seulement sous `PRF.on` (`LOUPE.dprOn`), `?sans=loupedpr` = la
loupe d'avant. `rendu/rubans-nets.js` : `?rubans=1` ne force plus que sur `ALLEGE` (téléphone ou `?tel=1`) : l'ordinateur n'en voit rien. `voitures/atchoum-feu.js` :
le plancher B (`rubanlarg`) ne joue plus sous l'encre de la boutique (D5 : l'encre recalcule l'intensité, le trait élargi sortait plus épais).

**(h) journal** — `palier-appareil.js` : `prfNote` n'écrit que si `PRF.on` (plus de ligne « hors profil ») ; `soleil-planete.js` : la note de `prfApprend` aussi.

**Autres défauts mineurs** — `palier-appareil.js` : après `palPuce` (qui peut rabattre le palier sur Android), `PRF.on && PAL.n < 2` → `prfHors` et `IMG_TEL = ALLEGE`
(`IMG_TEL` devient `let`) — défaut 4 du lot 1. `soleil-planete.js` : la table `T.vhd` dit que la vitrine ne descend jamais sous le plafond de la course (N4 HAUTE : DPR 3,
le `px` n'agit qu'en BASSE) — défaut 5, documenté plutôt que changé (une vitrine sous la résolution de la course serait un recul).

**Bancs** — nouveau `outils/banc-integ/integ.cjs` (modes `demarrage`, `jeu`, `chaud`, `pc` ; compteur des écritures width/height de la toile WebGL posé avant le jeu ;
VRAIS taps `Input.synthesizeTapGesture`). `outils/banc-rubans-nets/controle.cjs` passe au vrai profil (ordinateur avec `?rubans=1`, téléphone sans modèle,
`?appareil=iPhone14,2`, `?sans=loupedpr`), ports 9875/9876.

## VÉRIFIÉ (et comment)
Chrome sans fenêtre, muet (sfx/mus/vox coupés dans la sauvegarde), verrou du Mac pris et rendu à chaque passage. Téléphone émulé 844×390 DPR 3, tactile,
`hover:none`, UA iPhone → `TEL_NATIF` vrai ; le VRAI profil par `?appareil=` (jamais `?tel=1` ni `?rubans=1`). Sorties brutes dans le scratchpad (non gardées).
- Syntaxe : `node code/assembler.cjs --depuis-morceaux` (329 morceaux d'accord), `node outils/garde-demarrage.cjs` OK (21 scripts), `sh garde-allege.sh` OK, `garde-texte-nu` OK.
- **(c) Démarrage, compteur de la toile** (`--mode demarrage`) : à CHAQUE lancement, UNE allocation au plafond de la course (le 1er `setSize`) puis, au menu, celle de la
  vitrine quand elle est plus dense que la course — exactement le motif de l'ancien jeu (v1596, même banc). Jamais de 2e allocation de la course (l'à-coup d'`applyQ`).
  Essais : iPhone14,2 neuf / 'fast' / 'haute' / 'net' choisi ; iPhone15,4 neuf / 'fast' / 'haute' / vieux 'net' sans qChoisi ; iPhone17,1 neuf / 'fast' / 'haute' / 'net' ;
  iPhone18,1 neuf / 'fast' / 'haute' / 'net' jamais choisi. 'net' → défaut de la classe, `qChoisi` 0 (BASSE classes 1-2, HAUTE 3-4). 0 exception, 0 console.error.
- **(b) hors profil = l'ancien jeu** : téléphone sans modèle (neuf), iPhone12,8 'net' choisi, iPhone14,2 `?sans=profil` : `q` 'net' gardé, plafond 1,25 / 1,35, toile 1055×487 /
  1139×526, même compteur que l'ancien jeu, `#mvQ` texte (pas de choix à deux positions), 0 ligne `profil`, rubans et loupe-DPR éteints.
- **(a)** `dbgProfil` = celui de la plaque (`profOuvre`) sur téléphone profilé, hors profil et ordinateur.
- **(h)** une seule ligne `profil` (chargement) sur téléphone profilé, 0 hors profil.
- **Jeu, chaque niveau** (`--mode jeu`, iPhone14,2 neuf + haute, 15,4 neuf + haute, 17,1 fast + neuf, 18,1 fast + haute) : 20 s de course au pilote auto (10 + 10 s),
  **0 exception, 0 console.error, 0 panne, 0 mort**. Valeurs relues (`dbgPrf`) :

| appareil | BASSE en course | HAUTE en course |
|---|---|---|
| 14,2 (classe 1) | N1 : 1055×487, DPR 1,25, ombre 768 PCF, halo ½ 3 étages | N2 : 1266×585, 1,5, 1024 PCF, halo plein 4 étages |
| 15,4 (classe 2) | N2 : 1266×585, 1,5, 1024 PCFSoft, plein 4 | N3 : 1688×780, 2, 1280 PCFSoft, plein 5 |
| 17,1 (classe 3) | N3 : 1688×780, 2, 1280, 5 | N4 : 2532×1170, 3, 1280, 5 |
| 18,1 (classe 4) | N3 : 1688×780, 2, 1280, 5 | N4 : 2532×1170, 3, 1280, 5 |

- **Vrais taps dans RÉGLAGES** (chaque essai) : tap sur la position déjà prise → rien, `qChoisi` reste 0 sur une sauvegarde neuve ; tap dans la MARGE de `b.choix2`
  (point où `elementFromPoint` rend le choix lui-même ; la cible reçue est `b.choix2`) → rien ; tap sur l'autre moitié → le niveau change à chaud (plafond, ombre,
  halo) ; tap retour → revenu.
- **Vrai tap en PAUSE, en course** : l'autre moitié → toile, ombre et halo du nouveau niveau tout de suite (tableau ci-dessus, les deux sens) ; la course reprend et les garde.
- **(e) le piège, simulé** (`imgRegle({dpr:1,halo:'off',ombre:512})` = chaud → tap en pause sur l'autre réglage → `imgRegle('reset')`) : pendant le chaud la toile
  reste 844×390 (le gouverneur garde la main) ; au froid, plafond / ombre / halo = ceux du réglage COURANT, dans les 8 essais.
- **(e) le piège, VRAI gouverneur** (`--mode chaud`, `dbgThermique(2)` → tap en pause → `dbgThermique(0)`, descente réelle en 117 s) : iPhone15,4 BASSE → HAUTE pendant
  le chaud → froid : N3 1688×780, DPR 2, ombre 1280, halo plein 5 ; iPhone14,2 HAUTE → BASSE → froid : N1 1055×487, 1,25, 768, halo ½ 3.
- **Ordinateur inchangé** (`--mode pc`, ancien jeu v1596 contre la branche, sauvegarde neuve et 'haute', 15 s de course) : 73 champs lus (`dbgNette`, `dbgImg`, `dbgQual`,
  `dbgVHD`, `imgRegle()`, toile et rapport, filtre d'ombre, loupe, `dbgProfil`, `#mvQ`, lignes `profil`) identiques au menu et après la course ; seule différence : le
  champ `loupe.horsDpr` qui n'existait pas dans l'ancien jeu (faux).
- **RELANCE des trois bancs des lots** (sur l'index réassemblé, vrai profil) :
  - `outils/banc-profil/profil.cjs` (8 essais, iPhone14,2 / 15,4 / 17,1 / 18,1 × BASSE / HAUTE, 20 s de course) : 0 exception, 0 console.error, 0 mort ; seule ligne du
    journal = `profil|chargement …` ; niveaux et toiles du tableau ci-dessus (17,1 et 18,1 HAUTE : N4 2532×1170 ; 18,1 BASSE : N3 noté 60 i/s).
  - `outils/banc-reglages/reglages.cjs` couché FR, `appareil=iPhone14,2` : BASSE | HAUTE affiché, explication ouverte, bascule à chaud (plafond 1,25 ⇄ 1,5, N1 ⇄ N2),
    tap sur la position prise → rien, pause : bascule, rechargement garde HAUTE ; aucun débordement. Téléphone SANS modèle, 'net' choisi : MOYENNE affichée,
    un tap → HAUTE (cycle à trois d'avant), pas d'explication. Ordinateur 1280×800, 'net' choisi : MOYENNE → HAUTE en pause, rien d'autre. 0 exception.
  - `outils/banc-rubans-nets/controle.cjs` (repris au vrai profil) : ordinateur AVEC `?rubans=1` → profil faux, rubans 128/Additive/1, pas de loupe ; téléphone sans
    modèle → profil faux, loupe d'avant (disque seul, `kq` 0 : la loupe-DPR ne tourne pas) ; `?appareil=iPhone14,2` → tout posé (texture 256, mélange 5, opacité 20,
    `nitro2`, capsules 2 / 28 000 px), même nombre de programmes que sans profil (2801) ; DPR 1,25 / 2 / 2,5 posée, 2,9 / 3 retirée, 1,25 revenue ;
    `?sans=loupedpr` à DPR 2,9 : la loupe reste. 0 exception.

## NON vérifié
- Rien n'a tourné sur un vrai iPhone (coût GPU, chaleur, mémoire de N2-N4, tenue de la cadence) ; le capteur iOS réel `cc:thermique` (simulé par `dbgThermique`).
- La cadence 60 i/s de `PRF.fps` n'est toujours appliquée par personne (lot 4).
- Le son du tap dans la marge : `mTap` joue toujours son clic (le réglage ne bouge pas) — jamais écouté (banc muet).
- `?sans=reglage2` ne rend pas la donnée : une sauvegarde 'net' déjà migrée sur téléphone profilé reste au défaut.

## À juger sur le vrai iPhone 13 Pro
1. BASSE (défaut) = l'image d'avant + traînées nettes + loupe allongée : fluide ? (`&sans=profil` = le témoin d'avant).
2. Un joueur qui avait CHOISI RAPIDE (DPR 1) a désormais BASSE = N1 = DPR 1,25 (+56 % de pixels) : c'est la table du plan (doute A du contrôle du lot 1), à confirmer.
3. Le tap sur BASSE / HAUTE (pause et RÉGLAGES), la marge qui ne bascule plus.
4. En chaleur (palier ≥ 2 du gouverneur), passer en HAUTE remonte le plancher de l'échelle QL du niveau (N3 : 1,25 au lieu de 1) : à voir si ça chauffe.

## Observé, laissé (hors de mon lot ou voulu)
- Pendant le chaud SIMULÉ, après la bascule, la base du halo et ses étages prennent les valeurs du nouveau niveau (halo coupé, donc invisible) : un appel du
  gouverneur / de la boîte de vol rejoue `MOB_P0`, que `prfP0` a recopié. L'état rendu au froid est juste. À reprendre au lot 4 avec `mobPalVoulu`.
- Doutes B, C, D, F du contrôle du lot 1 (HAUTE et le palier 1 du gouverneur, `qlMin` après bascule, maps pleines en N4, DPR 3 → 1,5 au palier 2) : lot 4 / Sacha.
- Doutes du lot 3 (cœur net et gauchissement du nitro, transparents devant le cœur, `kC` sur le blanchiment, cible 8 bits) : à juger à l'œil sur le téléphone.
