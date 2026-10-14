# ACCORD — l'inventaire des écarts et la spécification cible (14/10/2026, passe d'accord)

Mission de Sacha : « rends chaque chose COMPATIBLE et MAGNIFIQUE les unes avec les autres » — même bouton, même marge, mêmes tailles de texte,
même retour au toucher, même transition sur chaque écran. **Rien n'a été modifié dans le jeu, aucun navigateur ouvert.** Ce fichier est
l'INVENTAIRE (§1), la SPÉCIFICATION CIBLE (§2) et la LISTE ORDONNÉE DES CHANGEMENTS (§3) qu'un autre agent appliquera. Les variables
cibles sont dans `ui/banc/accord/jetons.css` (non branché).

## 0. Matière lue, limites

- **État à venir** = `<style id="charte6">` + `c6-transitions` de `ui-integration`, et le bloc de chaque zone pris sur sa branche
  (`git show ui/<zone>:"VERSION PRINCIPALE/index.html"`, 14/10 ~6 h 15) : accueil (fefcee0, v2 « acc2 »), pause-fin (2b1056c, fin v2),
  carrière-missions (95c3aea, carrière « passe iPhone »), boutique (2b8bb3e), hud (cd7eea2). **ui/pages et ui/garage = identiques à la base**
  (ui/pages n'a que des commits « Textes » ; ui/garage = 4007550, rien de neuf). Extraits : `ui/banc/accord/css/futur-*.css` ; règles
  mises à plat par `parse.cjs` → `regles.json` (804 règles), interrogeables par `q.cjs`.
- **Ce que ces blocs NE disent PAS** : les anciennes feuilles (charte4, hubGarage, uxPasse, k4/k5/k6…) portent encore la mise en place et
  des tailles (le HUD, la boutique 3D, la modale, le toast, le splash, `.mLigne` hors #mSet). Je les ai interrogées là où l'accord les
  croise (modale, toast, splash, `⏸`, press legacy) ; le reste du HUD (chiffres en pixels à bandes) n'est **pas** inventorié : il est
  validé par Sacha, on n'y touche pas.
- **Captures regardées** (état de ~3 h-6 h, donc plus anciennes que les branches pour l'accueil et le garage) : `shots/accueil/apres/debout`
  (v1, pas la v2), `shots/pages/apres/debout-reglages`, `shots/garage/apres/debout-hub` + `carriere-missions/apres/debout-inventaire`,
  `shots/carriere-missions/p1/apres-debout-mondes` + `apres-couche-niv-skyhigh`, `shots/carriere-missions/apres/debout-missions`,
  `shots/pause-fin/apres/debout-fin` + `pause-debout`, `shots/hud/p1/apres-couche-t2`. **Pas vu** : l'accueil v2 (2 × 2 cartes), la fin v2,
  la boutique, les Offres, les Modes, la modale, le toast, le splash, l'iPhone 15/Pro Max avec zones sûres. Les mesures marquées
  « (code) » sont lues dans le CSS, « (capture) » sur une image, « (non mesuré) » ne sont ni l'un ni l'autre.
- Le BRIEF §0 bis (règles de 6 h) prime : **aucun texte < 11 px, pixel seulement pour titres ≥ 16 et gros chiffres, texte courant en
  système ≥ 13 px, JOUER = vraie plaque, ◀ en haut à gauche.** La charte 6 d'origine (corps 8·10·12·16·24·32 en pixel) est donc
  **périmée** sur les corps 8, 10 et 12 : c'est la cause numéro 1 des écarts ci-dessous.

---------------------------------------------------------------------------------------------------------------------------------------

## 1. INVENTAIRE

### 1.1 Les boutons

Vocabulaire : **tranche** = ombre dure sous la touche (`0 4px 0 0 #000`) ; **filet** = `inset 0 0 0 2px` ; **appui** = ce qui arrive à `:active`.

#### a) L'action principale en or (la « décision »)

| Écran | Sélecteur | Haut. | Larg. | Corps / police | Casse · lettres | Appui | Écart |
|---|---|---|---|---|---|---|---|
| socle | `.pb-gold` | 48 min | auto | pixel 12 | capitales · 0 | `translateY(4px)`, 90 ms linear (code) | 48 alors que partout ailleurs 64 |
| socle | `.pbtn.big` | 64 | auto | pixel 24 | 0 | idem | — |
| accueil | `#mHome.acc2 .mAccP>.mPlay` | **72** (rangée de grille) | pleine | pixel 32 (`.lg`) | 0 | `translateY(4px)!important`, **pas de transition déclarée** | 72/32 vs 64/24 partout |
| accueil (≤ 350 px) | idem | 72 | pleine | pixel 24 | 0 | idem | |
| accueil couché | idem | 64 | 2 colonnes | pixel 32 | 0 | idem | 64 ici, 72 debout |
| garage | `#gAct>#gJouer` | 64 | pleine | pixel 24 | 0 | `translate:0 4px!important`, **propriété `translate`, pas de transition déclarée** | propriété différente (translate vs transform) |
| garage (achat) | `#gAct>#gEquip.achat` | 64 | pleine | verbe pixel **12**, prix pixel 16 | 0 | idem | verbe 12 px (< 16) |
| carrière | `#carr .cmJouer` | 64 (capture, `.big`) | ≥ 192 | pixel 16 | 0 | `.pbtn` : 4 px, 90 ms | libellé « JOUER · SKY HIGH 3 » en 16 |
| missions | `#gMis #gmBas .gmJouer` | 64 (capture) | ≥ 192 | pixel 24 (capture) | 0 | `.pbtn` 4 px | |
| pause | `#tPanel #tpIn>.tp.go` | 64 debout · **48 couché** | pleine · ≥ 192 | pixel 24 · **16** | 0 | `translateY(var(--c6-t))`, 90 ms | 48/16 couché |
| fin | `#mDead .mFin>[data-m="replay"]` | 64 | flex | pixel 24 (rétrécit à 16 si long) | 0 | `.pbtn` | |
| boutique (gelée) | `#gBqBtn` | **48** | pleine | **système 15 / 800** | caps · .5 px | non mesuré | une 2e « plaque d'achat » : 48/système vs 64/pixel du garage |
| choix FACILE/NORMAL | `#modale.facC6 .modB .pbtn` | **128** (carte) | 1fr | pixel 16 + système 13 | 0 | 4 px | une carte, pas un bouton : à laisser |

Face / filet / tranche de l'or (identiques partout, code) : face `#ffc62b`, filet 2 `#1d1300`, trait de lumière haut 4 `#ffe389`, tranche
4 `#b07a00` + liseré `#1d1300`. **Un seul or réel** (voir 1.4). Désactivé : `ACHETER` boutique grisé en `#eef0f3`.

#### b) La touche secondaire d'encre

| Écran | Sélecteur | Haut. | Larg. | Corps · police | Casse · lettres | Padding | Appui | Écart |
|---|---|---|---|---|---|---|---|---|
| socle | `.pbtn` | 48 | auto | **pixel 12** | caps · 0 | 0 16 | 4 px / 90 ms linear | pixel 12 (< 16) |
| socle | `.pbtn.ico` | 64 | auto | **pixel 8** | 0 | 8 10 | idem | 8 px interdit |
| socle | `.modB .pbtn` (fenêtre) | 48 | auto | **pixel 10** | 0 | — | idem | 10 px |
| accueil | `.mAccB` (CARRIÈRE, MISSIONS, GARAGE, OFFRES) | **64 debout · 56 couché** | 1fr | **système 15/800** + sous-ligne 13/600 | caps · .02 em / .01 em | 0 12 | `translateY(4px)!important`, pas de transition déclarée | 56 est une 4e hauteur ; lettres .02 ≠ .04 |
| accueil | `.mGear` (RÉGLAGES) | **44** | auto (icône + mot) | système 13/800 | caps · .02 em | 0 14 0 12 | 4 px | 44 ≠ 48 ; haut = sT+16 (◀ = sT+8) |
| garage | `#gAct>#gvCof` INVENTAIRE · `#gShopBas` BOUTIQUE | 48 | 1fr (≤ 160 couché) | **pixel 10** | caps · 0 | 0 8 | `translate:0 4px!important` | 10 px |
| garage | `#gCard>#gOeil` | 48 × 48 | 48 | icône | — | 0 | `translate:0 4px` | |
| pause | `#tPanel #tpIn .tp:not(.ligne)` RECOMMENCER · QUITTER | 48 | 1fr | **pixel 12 → 10 (`!important`)** | caps · 0 | 0 16 (`0 8!important`) | `translateY(4px)`, 90 ms | 10 px |
| fin | `#mDead .mFin>.mMenu` (maison) | 48 × 48 | 48 | icône | — | 0 | `.pbtn` | |
| HUD | `#tGear` (⏸) | **50 × 50** (`!important` legacy) | 50 | icône | — | — | `translateY(4px)!important` ; transition legacy **140 ms ease** | 50 ≠ 48 ; 140 ms ease ≠ 90 ms linear |
| HUD (auto-école) | `#coach .coSkip` PASSER | 44 min | 44 min | système 12/800 | caps · .5 px | 0 8 | texte seul | 12 ≠ 13 |
| modale | `.modB .pbtn` | 48 | flex | pixel 10 | | | 4 px | idem socle |

Filet blanc 2 px + tranche noire 4 px + face `#13161d` : **identiques partout** (seule vraie unité du jeu). Les hauteurs, elles, vont de 44 à 72.

#### c) Le carré ◀ (et ses frères icône seule)

| Écran | Élément | Taille | Position (code) | Écart |
|---|---|---|---|---|
| réglages · carrière · garage · inventaire · missions | `.pbCarre.c6Ret` dans `.c6Tete` | 48 × 48 | x = `sL + 16`, y = `sT + 8` | la référence |
| missions | `#gmHead .c6Ret` | 48 × 48 | `left: sL+16 ; top: sT+8` | = |
| boutique (branche) | `#gBqRet` | 48 × 48 | `left: sL+16 ; top: **sT+4**` ; titre `left: **sL+72** ; top sT+6` | **4 px plus haut**, titre à 72 au lieu de 76 |
| accueil | `.mGear` (réglages, pas un retour) | **44 haut.**, largeur auto | `padding-top sT+16` | pas aligné avec les ◀ |
| HUD | `#tGear` ⏸ | **50 × 50** | `top: ccT + 8 ; right: hudD + 4` | 50 |
| fin | `.mMenu` maison | 48 × 48 | bas gauche | (exception voulue) |

#### d) La ligne de réglage

| Écran | Sélecteur | Haut. | Padding / gap | Corps · police | Filet / tranche | Appui | Écart |
|---|---|---|---|---|---|---|---|
| socle | `:is(.mLigne,.tp.ligne)` | **56 min** | 0 16 / 12 | pixel 10 | trait haut 2 `#2a303c` | fond `#1c2029`, 90 ms linear, ne bouge pas | 56 |
| réglages | `#mSet .mLigne` | **48** | 0 8 0 12 / 12 (8 couché étroit) | pixel 10 (`.tpL` 10 ; couché étroit idem) | filet sourd 2 `#2a303c`, pas de tranche | fond e2 | 48 ≠ 56 ; pixel 10 |
| pause | `#tPanel #tpIn .tp.ligne` | 48 | 0 8 0 12 / 12 | pixel 10 | idem | fond e2 | = réglages |
| sa commande ON/OFF | `b.bascule` | socle **64 × 28** · réglages et pause **64 × 32** | patin 20 (socle) / 16 | pixel **8** | ON = face blanche ; OFF = encre + filet blanc | — | 28 vs 32 ; 8 px |
| sa commande valeur | `b.valeur` | 32 | min 64 (56 couché étroit) | pixel **10** (**8** couché étroit) | filet blanc 2 | au doigt : blanc | 8–10 px |
| curseur | `.volRow` | 44 | — | % pixel 10 | rail 4 px | poignée 28 × 42 de prise | 10 px |
| EFFACER | `#mSet .c6Efface` | 48 | gap 12 | pixel 10 rouge | filet rouge 2 + tranche | 4 px | 10 px |

#### e) L'onglet

| Écran | Sélecteur | Haut. | Corps · police | Actif | Écart |
|---|---|---|---|---|---|
| socle | `.c6Onglet` | **44** | pixel 10 | texte blanc + **souligné 4 px** | 44 ; 10 px |
| inventaire | `#gTabs>.gTab` | 48 | pixel **8** (10 ≥ 800 px de large) | **face blanche**, texte d'encre | actif ≠ socle ; 8 px |
| boutique (gelée) | `#gBqPan .bqOng button` | 48 (44 côte) | système 14/800 | non mesuré | 14 |

#### f) La carte touchable

| Écran | Sélecteur | Filet | Tranche | Appui | Choisi / spécial | Écart |
|---|---|---|---|---|---|---|
| socle | `.c6Carte` | 2 `#2a303c` (blanc si `.on`) + barre rareté 4 | **aucune** | **`translateY(2px)`** | `.on` = filet blanc **2** | peau plate, descente 2 |
| carrière | `#carr .cmCarte` | 2 blanc | 4 noire | `translateY(4px)`, 90 ms | `.choisi` filet blanc **4** ; `.cours` filet or **4** ; `.verr` filet `#404858` | — |
| missions | `#gMis .gmC` | 2 blanc | 4 | **`translate:0 4px`**, pas de transition déclarée | `.f` (suivi) = face blanche | propriété `translate` |
| inventaire | `#gStrip>.gT` | 2 blanc | 4 | **`translate:0 4px`**, idem | `.on` filet blanc 4 ; `.eq` face blanche | idem |
| accueil | `.mAccB` | 2 blanc | 4 | `translateY(4px)!important`, sans transition | — | — |
| fin | `#mDead .mObj` (défi), `.hCard` | 2 `#2a303c` | **aucune** | fond `#1c2029` + (legacy `.mObj[data-m].appui{translate:0 2px}` qui reste !) | — | 2 px résiduels |
| légendaire | `.mMode.appui` (modes), `.gR.appui` | — | — | **`translate:0 2px`** · **`translate:0 3px` + `brightness(1.25)`** (k6, non neutralisés) | | 2 et 3 px |

#### g) États et retours communs (tous boutons)

- **Désactivé** : `.pbtn.off` = face e1, filet `#404858`, texte `#7a8292`, tranche noire, **répond encore au doigt** ; carte verrouillée
  `.cmCarte.verr` = filet `#404858`, vignette 35 %, texte g2 ; `.gT.lock` = image 40 % + cadenas ; `#gBqBtn[data-e=choix|manque]` = gris clair
  `#eef0f3` / `#4a525d`. Trois façons de dire « pas maintenant ».
- **Choisi / actif / équipé** : onglet souligné (socle) · face blanche (inventaire) · `.modeOn` face blanche (INVENTAIRE/BOUTIQUE du garage) ·
  `.c6Carte.on` filet blanc 2 · `.gT.on` filet blanc 4 · `.cmCarte.choisi` filet blanc 4 · `.gT.eq` face blanche · `b.bascule` ON face blanche ·
  `.gmC.f` face blanche. **Deux grammaires mélangées** (« état = face blanche » et « sélection = filet épais »).
- **Relâcher** : `.pbtn.pop`, `.gTab.pop`, `.gR.pop`, `.gT.pop`, `.mLigne.pop`, `.mMode.pop` rejouent `c6Pop` (160 ms, `brightness(1.6)` → 1) : un **deuxième**
  retour au toucher, en filtre, sur six classes seulement.
- **Survol souris** (legacy 4244) : `brightness(1.14)` — sans effet au doigt.
- **Focus clavier** : `outline 2px or, offset 4px` sur `.pbtn`, `.cmCarte`, `.tp` seulement.
- **Tap highlight** : `-webkit-tap-highlight-color:transparent` seulement sur `.c6Onglet`, `.c6Carte`, `.cmCarte`.

### 1.2 Marges et grille (zones sûres `--sT --sB --sL --sR`)

| Écran | Gauche / droite | Haut | Bas | Écart entre éléments | En-tête |
|---|---|---|---|---|---|
| `.c6Tete` (socle) | `sL+16` / `sR+16` | ◀ à `sT+8` | — | `gap:12` ◀ → titre ; comptes `gap:8` | haut. `sT+64`, ◀ 48 × 48, titre pixel 16, comptes à droite (`.c6Sou` 32 de haut) |
| réglages | corps `sL+16 / sR+16`, max 640 | 8 sous l'en-tête | `sB+24` | **8** entre lignes ; section `margin 16 0 0` ; couché 2 colonnes `column-gap 16` | `.c6Tete.plein`, sticky |
| carrière | `sL+16 / sR+16` | 8 | barre du bas : **`sB+8`** (+ 4 de tranche) | cartes mondes **12**, niveaux **8** (grille ; tranche 4 en plus) | `.c6Tete.plein` |
| missions | `sL+16 / sR+16` | `sT+8` (`#gmHead`) | `#gmBas` **`sB+16`** | colonnes de cartes laissées au script | titre pixel 16 + UNE phrase 13 ; couché : 200 px de large |
| garage hub | fiche `sL+16`, `#gAct` calé à droite par **marges négatives −10 (couché) / −6 (debout)** pour « tomber sur 16 + sR » | fiche `sT+72` (**`sT+96` debout**) | `#gBottom` (non lu) | INVENTAIRE ↔ BOUTIQUE **8**, rangée ↔ JOUER **12** | `#gC6Tete` ; comptes **empilés debout** |
| inventaire | plaque `margin 0 sR+16 sB+16 sL+16`, padding 8 | fiche `sT+72/96` | `sB+16` | cartes `gap 12 8` ; onglets sans écart | titre INVENTAIRE **12 px debout** |
| accueil v2 | `sL+16 / sR+16` | **`sT+16`** | **`sB+16`** | colonnes **8** ; rangées 64 / **8** / 64 / **12** / JOUER | pas d'en-tête : `.mGear` 44 px en rangée 1 |
| fin v2 | `sL+16 / sR+16` | `sT+16` | `sB+16` (+4 de tranche dans `.mFin`) | blocs **16** (**12** sur SE) ; bande 4 stats `gap 8` ; couché 2 colonnes (`calc(50% − 12px)`) | pas d'en-tête |
| pause | panneau : `sL+16 / sR+16`, bas `sB+16`, **padding intérieur 16** | `sT+16` | `sB+16` | grille `gap 16 8` ; lignes **8** | pas d'en-tête (titre dans le panneau) |
| modale | `modIn` padding **20 16 16**, gap **12** | — | — | `.modB` gap **12** (legacy : colonne 18 / ligne-inversée 16) | — |
| boutique (gelée) | ◀ `sL+16`, titre `sL+72` | **`sT+4` / `sT+6`** | — | — | décalé de 4 px et de 4 px |
| HUD | `--hudG = encoche + 14` | `ccT + 8` (⏸) | — | (validé, ne bouge pas) | — |

Écarts de méthode : (1) le bas d'écran est tantôt `sB+8` (carrière), `sB+16` (missions, pause, inventaire, fin) ; **la tranche de 4 px n'est comptée que
dans la fin** ; (2) deux marges négatives codées en dur dans le garage ; (3) l'accueil est à `sT+16`, les en-têtes à `sT+8` ;
(4) l'écart vertical entre deux touches empilées est 8 (accueil lignes 1-2, fin), 12 (garage, accueil → JOUER, carrière mondes), 16 (pause) ;
(5) l'intérieur d'une carte/ligne : 12 (fin, lignes), 14 (cmTxt), 16 (pause, cmTxt), 8 (inventaire, gmC portrait) .

### 1.3 Le texte (tout ce qui est écrit en CSS dans les blocs c6, rôle par rôle)

Deux familles se partagent le jeu : le **pixel** (Press Start 2P) et le **système** (`var(--sans)`). Voici la répartition réelle.

| Rôle | Accueil | Réglages | Carrière | Missions | Garage hub | Inventaire | Pause | Fin | HUD / coach | Écart |
|---|---|---|---|---|---|---|---|---|---|---|
| Titre d'écran | — (logo) | `.c6Titre` pixel 16 | pixel 16 | pixel 16 | pixel 16 | pixel 16 (**12 debout**) | `.tpH` pixel 16 | `.mOver` pixel 16 | — | 12 px debout |
| Titre de carte / nom | `.c6aT` **système 15/800** | — | monde pixel 16 ; niveau **système 13/700** | `.gmX` **pixel 10** (8 couché étroit) | `#gName` pixel 16 | `.gT>b` **pixel 8** | — | `.hMotN` système 15/800 | `#coach .coTx b` système 15/800 | 8, 10, 13, 15, 16 selon l'écran |
| Libellé de touche / ligne | système 15/800 | **pixel 10** | — | — | **pixel 10** | **pixel 8** (onglets) | **pixel 10** + RECOMMENCER **pixel 10** | — | — | pixel 8/10 vs système 15 |
| Sous-ligne / état | `.c6aS` système 13/600 | — | `.cmEtat` système 13/700 | `.gmT` **pixel 8** | `#gLvl` **pixel 8** ; `#gRarPill` **pixel 8** | `.gT>em` **pixel 8** | `.tpResume span` **pixel 8** | système 13/700 | `.coN` 11/700 | 8 vs 13 |
| Chiffre héros | — | — | — | — | — | — | — | `.mCashL>b` pixel 32 ; `.hAura>b` 24 ; `.mStat b` 16 | HUD (pixels à bandes) | cohérent dans la fin |
| Chiffre / compte | — | `.volV` **pixel 10** | `.cmNum` pixel 16 | `.gmP b` **pixel 8** | `.c6Sou` **pixel 10** | idem | `.mStat b` pixel 16 | `.mStat b` pixel 16 | — | 8, 10, 16 |
| Légende | — | `.mSec` **pixel 8** | — | `.gmNext` **pixel 8** | — | — | `.tpResume span` **pixel 8** | `.mStat span` système 13/700 | — | 8 vs 13 |
| Aide / phrase | — | `.c6Ver` **pixel 8** | — | `#gmAide` système 13/500 | — | — | — | `.mCause` 13/700 | `.coTx span` 13/600 | graisses 500, 600, 700 |
| Commande (ON/OFF, valeur) | — | **pixel 8 / 10** | — | — | — | — | **pixel 8 / 10** (8 couché étroit) | — | — | 8 / 10 |

**Tout ce qui reste < 11 px dans les blocs c6 (48 déclarations)** : socle 14 (`.pbtn.ico` 8, `.mBadge`/`#bdShop` 8, `:is(.mSec,.tpH)` 8, `:is(.mLigne,.tp.ligne)` 10, `b.bascule` 8,
`b.valeur` 10, `.volHd` 8, `.modB .pbtn` 10, `.c6Sou` 10, `.c6Onglet` 10, `.c6Carte .c6Nom` 8, `.c6Carte .c6Prix` 8, `.c6Stat small` 8) · pages 9 (`.mLigne` 10, `.tpL` 10,
`.volV` 10, `b.bascule` 8, `b.valeur` 10 et 8, `.c6Efface` 10 ×2, `.c6Ver` 8) · pause 7 (`.tpResume .mStat span` 8, `.tp.ligne` 10 ×2, `b.bascule` 8, `b.valeur` 10 et 8, `.tpRow>.tp` 10) ·
garage 10 (`#gLvl` 8 ×2, `#gRarPill` 8 ×2, `#gvCof/#gShopBas` 10, `.gTab` 8 et 10, `.gT>em` 8, `.gT>b` 8, `.gVide` 8) · missions 8 (`.gmC` 8, `.gmT` 8, `.gmX` 10 et 8, `.gmT b` 8,
`.gmP b` 8, `.gmC.r small` 8, `.gmNext` 8). **Plus** : `.pbtn` par défaut = pixel **12** (< 16 : règle « pixel seulement ≥ 16 »), `.tp:not(.ligne)` pixel 12,
`#toast` pixel 10 (`--f1`), `#modT` pixel 14 avec **lueur magenta résiduelle** (`text-shadow:0 0 14px rgba(255,62,200,.5)`, légacy 2731, non neutralisé hors `facC6`), le HUD
« GLISSE POUR TOURNER » (≈ 8 px, hors périmètre). **Tailles conformes déjà en place** : carrière, fin v2, accueil v2, `#coach`, boutique (11-15 système).

Caps, graisses, lettres (système) : **graisses 500 / 600 / 700 / 800 toutes en service** ; **lettres** `.02em` (accueil `.c6aT`), `.01em` (`.c6aS`), `.02em` (fin légendes),
`.04em` (fin badge), `.5px` (boutique, coach), `.3px` (`.coN`), 0 (aide) ; casse : « EN COURS » (monde) mais « En cours » / « À finir » / « Fait » (niveau, `text-transform:none`).

### 1.4 Les couleurs réellement utilisées (hex, comptage dans les 8 blocs)

| Rôle | Valeur | Où | Écart |
|---|---|---|---|
| Encre | e0 `#0b0d12` · e1 `#13161d` · e2 `#1c2029` · e3 `#2a303c` · e4 `#404858` | partout | **cinq encres + `--k1 #0f1218` et `--kl2 #5a6376` des jetons legacy** (fond de panneau `rgba(11,13,18,.88/.8/.45)`) |
| Noir pur | `#000` (**66 occurrences**) | tranche, contour dur, halo d'encre | normal : à nommer `--c6-noir` |
| Blanc | `#fff` / `#ffffff` (10 + 5) · `#eceae4` (b1, splash) | texte, filets | `#fbf8f0` / `#e6e1d6` / `#8d877b` / `#f4f1ea` = bandes du LOGO (intouchable) |
| Gris | g1 `#b3b8c4` · g2 `#7a8292` | légendes, texte éteint | deux gris propres ✓ |
| Or | `#ffc62b` · lumière `#ffe389` · tranche `#b07a00` · encre `#1d1300` | décision, état « en cours » | **un seul or** ✓ ; Poki : bandes d'ombre `#6e3f00 #5c3300 #472700 #331c00` (garde) |
| Vert | `#58e08c` (argent) · `#12813f` (argent sur blanc) · **`#1c6b37` + `#0e3a1d` (carte auto-école « bravo »)** · `#1f7a45` (tranche `.pb-green`) | argent, `.pb-green` | **3 verts de décor/état en plus du sens « argent »** : bravo = plaque verte pleine |
| Violet | `#b9a2ff` | aura | ✓ |
| Rouge | `#ff5648` (danger) · **`#ff6b7d`** (coach raté, PASSER-sûr) · `#8e1c12` (tranche) | danger | **2 rouges** |
| Voiles | `rgba(11,13,18,.45)` (missions) · `.8` (plaque inventaire) · `.88` (pause) · **`rgba(5,3,12,.9)`** (modale, legacy, teinté **violet**) | | **4 voiles différents** |
| Scène claire (boutique) | `#fff #eef0f3 #d5d8df #c9ccd4 #a9aebb #8c93a3 #4a525d #14171c` | `.c6Clair`, `#gBqBtn`, missions suivies (`.gmC.f u` `#c9ccd4`) | **7 gris clairs** (+ `#12813f`) |
| Fonds hors charte | splash `radial-gradient(900px 600px,#191024,#000 75%)` (legacy 973) | chargement | dégradé teinté violet |

### 1.5 Le mouvement

| Quoi | Valeur (code) | Écart |
|---|---|---|
| Appui d'une touche `.pbtn` | `transform: translateY(4px)`, **90 ms linear** (`--c6-vite`), tranche → 0 | la référence |
| Appui `.cmCarte`, `.tp:not(.ligne)`, accueil `.mAccB/.mPlay` | 4 px ; 90 ms **ou pas de transition déclarée** (accueil, `#tGear` : 140 ms ease) | accueil/garage/missions : pas de durée dans le bloc |
| Appui garage, missions, inventaire | `translate:0 4px` (propriété `translate`) — **pas `transform`** | autre propriété, durée non déclarée |
| Appui `.c6Carte` | `translateY(2px)` | 2 ≠ 4 |
| Appui ligne | fond e1 → e2, ne bouge pas | volontaire : plate |
| Appui legacy résiduel | `.mObj[data-m].appui` `translate:0 2px` + `brightness(1.22)` (filter neutralisé en c6) ; `.mMode.appui` 2 px ; `.gR.appui` 3 px + `brightness(1.25)` ; `--t-press:70 ms` | trois descentes en plus, un 70 ms |
| Relâcher | `c6Pop` 160 ms `brightness(1.6)` (6 classes) | 2e retour |
| Page de la coque qui entre | `.mscr.on` 200 ms (`--c6-courbe`) : `c6Avant` (+24 px, fondu) / `c6Retour` (−24 px) / `c6Ecran` (fondu) ; blocs `c6Entre` (+8 px, fondu) en cascade **30 ms**, 5 crans | ✓ |
| Page qui sort | fondu **100 ms linear** | ✓ |
| Rideau (changement de scène 3D) | entrée **150 ms** (`--c6-courbe`), sortie **240 ms** `cubic-bezier(.6,0,.8,.4)` | 240 ≠ 200 |
| Fin de partie | cascade 0/30/90/120 ms, `c6Entre` 200 ms | ✓ |
| Pause qui entre | voile 200 ms + blocs 0/30/60/90 ms | ✓ |
| Pause qui sort · réglages sur la pause qui sortent | **120 ms** (`c6FondSort`) · **130 ms** (commentaire) | 100 ≠ 120 ≠ 130 |
| **Modale** | `k6Feuille` : glisse **du bas** (`translate:0 calc(100% + 40px)`), **400 ms** `--ease cubic-bezier(.32,.72,0,1)` ; boutons `k6Monte` 400 ms décalés 110/150 ms ; sortie `k6FeuilleOut` **150 ms** ; voile `rgba(5,3,12,.9)` | **seule chose qui glisse du bas en 400 ms** ; non neutralisée par c6 |
| **Toast** | opacité `--t-fast` 140 ms + transform `--t-slow` (et 400 ms), tombe de −26 px avec `scale(.96)` | rien à voir avec `c6Entre` |
| Plaquette de pouvoir | `c6PwIn` +24 px, 200 ms | ✓ (comme une page) |
| Ruban du record | `c6Ruban` `scale(1.25)` → 1, 200 ms | célébration (autorisé) |
| Boucles qui restent | `c6Respire` (invitation du splash, 2,4 s, opacité) · `chipFin .24s steps(2)` (pouvoir qui finit, course) · gestes de l'auto-école (`c6CoGlisse/Bord/Appui`, infinies) · logo `teaseBreath` 2,8 s (legacy) · `k4Chev` 1,1 s sur `.mChev` (masqué à la plupart des endroits) | aucune boucle sur un bouton de menu ✓ ; `c6Respire` et logo = 2 boucles de plus |
| `prefers-reduced-motion` | respecté dans charte6 (touches, cartes, onglets, entrée), transitions, accueil (invite), pause-fin, hud | **`html[data-reduced-motion="1"]` (le réglage du jeu) n'est géré que dans pause-fin, hud et le legacy de la modale** : pas dans charte6 ni c6-transitions |

### 1.6 Les 10 écarts les plus visibles entre écrans (du plus au moins visible)

1. **Deux régimes de texte.** Carrière, fin v2, accueil v2, coach et boutique sont en système 13/15 ; réglages, pause (lignes), garage (INVENTAIRE/BOUTIQUE, nom de rareté, onglets,
   cartes), missions et comptes restent en **pixel 8/10/12** (48 déclarations < 11 px). Le même jeu parle deux langues, et la moitié est illisible sur iPhone.
2. **La plaque de décision n'est pas la même.** 64/pixel 24 (garage, pause, missions, fin) · **72/32** (accueil) · **48/système 15** (ACHETER de la boutique) · 64/16 (carrière) · 48/16 (pause couché).
3. **Six hauteurs de touche** : 44 (accueil ⚙, onglet) · 48 · 56 (accueil couché, ligne du socle) · 64 · 72 · 128 (choix FACILE/NORMAL). Cible : 48 / 64 / 32.
4. **Le retour au toucher** : 4 px / 90 ms linear (`.pbtn`) · 2 px (`.c6Carte`) · `translate` sans durée (garage, missions, inventaire, accueil) · fond seul (lignes) · 140 ms ease (⏸) ·
   résidus legacy 2 px / 3 px / 70 ms / `brightness` · le flash `c6Pop` au relâcher.
5. **L'état « actif »** : onglet souligné (socle) / face blanche (inventaire) ; « choisi » en filet blanc 2 (`.c6Carte.on`) ou 4 (`.gT.on`, `.cmCarte.choisi`) ; « éteint » de trois façons.
6. **Les entrées de fenêtre** : la modale glisse du bas en **400 ms** (courbe `.32,.72,0,1`), le toast tombe en 140/400 ms avec `scale`, tout le reste monte de 8 px en 200 ms (`.2,.8,.2,1`) ;
   les sorties valent 100, 120, 130, 150 et 240 ms.
7. **Les marges haute et basse** : accueil ⚙ à `sT+16`/44 px contre ◀ à `sT+8`/48 ; boutique ◀ à `sT+4`, titre à `sL+72` (au lieu de 76) ; ⏸ à 50 px ; bas d'écran `sB+8` (carrière)
   contre `sB+16` (ailleurs) ; marges négatives −10/−6 dans le garage ; écart vertical entre touches 8 / 12 / 16.
8. **Trois peaux de carte** : `.c6Carte` (filet sourd, sans tranche, descente 2) · `cmCarte`/`gmC`/`gT`/`mAccB` (filet blanc, tranche 4, descente 4) · `mObj`/`hCard` (plates, sourdes).
9. **Les couleurs de service** : 4 voiles (.45/.8/.88 + `rgba(5,3,12,.9)` violet), 2 rouges (`#ff5648`, `#ff6b7d`), un vert « bravo » plein `#1c6b37`, 7 gris clairs, un splash en dégradé violet,
   un titre de fenêtre à lueur magenta.
10. **Casse, graisses, lettres** : « EN COURS » (monde) / « En cours » (niveau) ; graisses 500-800 ; lettres `.01 / .02 / .04 em`, `.3 / .5 px`, 0.

---------------------------------------------------------------------------------------------------------------------------------------

## 2. SPÉCIFICATION CIBLE (les jetons, choisis à l'œil, en partant de ce qui marche déjà le mieux)

Le modèle : **la carrière et la fin v2** (pixel pour les noms et les gros chiffres, système net pour tout le reste, plaques à filet blanc + tranche, 16 px de marge) et **l'accueil v2**
(libellé système 15/800 + sous-ligne 13/600). Il ne s'invente presque rien : on **choisit** entre des valeurs déjà présentes dans le jeu. Détail technique : `ui/banc/accord/jetons.css`.

**Les 10 lignes qui suffisent** :

1. **Hauteurs : 48 · 64 · 32.** 48 = toute touche (bouton, ligne, onglet, ◀, œil, maison, ⏸) ; 64 = la décision et les cartes d'accueil debout ; 32 = une commande DANS une ligne (interrupteur, sélecteur) ou un compte. Couché ≤ 400 px de haut : la décision passe à 48/16.
2. **Retour au toucher UNIQUE : `translateY(4px)` + tranche 4 → 0, 90 ms `linear`, descente et remontée.** Surfaces plates (lignes, onglets, cartes sans tranche) : face → `#1c2029` en 90 ms, rien ne bouge. Plus de flash au relâcher, plus de 2/3 px, plus de `brightness`, plus de `translate`.
3. **Durées : 90 ms (toucher) · 200 ms (tout ce qui entre) · 100 ms (tout ce qui sort).** Rideau 150 entrée / 200 sortie. **Une courbe** : `cubic-bezier(.2,.8,.2,1)`. Cascade 30 ms, 5 blocs, +8 px.
4. **Échelle de texte : 11 · 13 · 15 · 16 · 24 · 32.** Système : 11 (plancher, rare), 13 (lire : 600 ; nommer : 800 capitales), 15 (libellé de touche, de ligne, d'accueil : 800 capitales ; les ONGLETS restent à 13/800 pour que quatre tiennent côte à côte). Pixel : 16 (titre, nom), 24 (la décision, l'aura), 32 (l'argent héros). **Plus de pixel 8, 10, 12, 14, 20.** Graisses : **600 et 800**. Lettres : `.04em` sur les capitales système, 0 ailleurs. Lignes : 13→18, 15→20, 11→14, pixel 16→24 (ou 1 sur une ligne).
5. **Le libellé d'une touche = système 15/800 capitales ; la décision = pixel 24** (16 si le mot dépasse 10 lettres : `.long`).
6. **Marges : 16 + zone sûre** de chaque côté ; ◀ et tout bouton d'en-tête à `sT+8` (48 × 48, x = `sL+16`) ; en-tête de `sT+64` ; **le bas de la face de la décision à `sB+20`** (16 de marge + 4 de tranche) ; panneau flottant à `sB+16`.
7. **Écarts : 8** entre deux touches du même groupe (côte à côte, ou carte/ligne plate), **12** entre deux touches empilées (8 + la tranche), **16** entre deux groupes et avant la décision. Dedans : 12 (lignes, cartes), 16 (panneaux).
8. **Une grammaire d'états** : *actif / allumé / équipé / suivi* = **face blanche, texte d'encre** ; *choisi (grille)* = **filet blanc 4 px** ; *en cours* = **filet or 4 px** ; *verrouillé* = vignette 35 %, cadenas, texte g2, filet e4 ; *éteint* `.off` = face e1, filet e4, texte g2 (répond encore au doigt).
9. **Couleurs : on ne change aucune valeur de charte6** (encre `#0b0d12 #13161d #1c2029 #2a303c #404858` · blanc `#fff` · gris `#b3b8c4 #7a8292` · or `#ffc62b / #ffe389 / #b07a00 / #1d1300` · vert `#58e08c` · violet `#b9a2ff` · rouge `#ff5648`). On **retire** : `#ff6b7d`, `#1c6b37`, `#0e3a1d`, le voile violet `rgba(5,3,12,.9)`, le splash en dégradé ; on **réduit** : deux voiles (`.88` panneau, `.45` scène), la scène claire à cinq gris `#fff #eef0f3 #d5d8df #a9aebb #8c93a3` + vert `#12813f`.
10. **Peaux : une touchable à filet blanc 2 + tranche 4 (touche ET carte de choix) ; une surface de page à filet sourd `#2a303c` (panneau, ligne, compte, carte d'information) ; un panneau flottant sur une scène = filet blanc 2 + tranche 4 (pause, modale, toast, coach).**

**Pourquoi ces choix (l'œil)** : 15/800 capitales est ce que l'accueil v2 et le coach montrent déjà (net, large, tient dans 48) ; le pixel garde la voix là où il est beau (titres, noms de monde, l'argent héros) ;
48/64 est le rythme de la boutique de Léo et de la fin ; 4 px d'enfoncement est ce que l'iPhone 7 sait animer sans filtre ; 200 ms est la durée du reste du jeu, le 400 ms de la modale est le seul témoin de l'ancien régime.

---------------------------------------------------------------------------------------------------------------------------------------

## 3. LISTE DES CHANGEMENTS — du plus visible au moins visible (bloc par bloc)

Légende : **S** = `charte6` (socle) · **A** = `c6-accueil` · **P** = `c6-pages` · **C** = `c6-carriere-missions` · **G** = `c6-garage` · **B** = `c6-boutique` (gelée, après dégel) · **H** = `c6-hud` ·
**F** = `c6-pause-fin` · **T** = `c6-transitions` · **L** = ancienne feuille à neutraliser DEPUIS un bloc c6 (rien n'est supprimé dans l'ancienne). Ordre d'application conseillé : S d'abord (les autres suivent),
puis G, P, F, C, A ; B quand Léo a fini ; H et T en dernier. Chaque ligne : *sélecteur : avant → après*.

### 3.1 Le texte (le plus visible : 48 déclarations < 11 px)

1. **S** `html.c6 .pbtn` : `font-family:var(--pix); font-size:12px; letter-spacing:0` → `var(--sans)`, `15px`, `line-height:20px`, `font-weight:800`, `letter-spacing:.04em`, `text-transform:uppercase` ; `gap:10px` → `8px`. → **[FAIT (socle) — `gap` 8 = `--c6-e`.]**
2. **S** `html.c6 .pb-gold` : `min-height:48` (hérité) → `min-height:64px; font-family:var(--pix); font-size:24px; line-height:1; letter-spacing:0; font-weight:400` ; ajouter `html.c6 .pb-gold.long{font-size:16px}` ; garder `.pbtn.big` en alias. Ajouter `@media (orientation:landscape) and (max-height:400px){html.c6 .pb-gold{min-height:48px;font-size:16px}}`. → **[FAIT (socle) — `.pbtn.big` = même recette (pixel 24) ; EN PLUS : dans une rangée de fenêtre (`.modB`, `.spBtns`) et dans la vieille grille `.carrNiv`, l'or prend 48 / 16 (une plaque de 64 à côté d'une touche de 48 se voit tout de suite).]**
3. **S** `html.c6 .pbtn.ico` : `min-height:64px; font-size:8px` → `min-height:48px; font-size:13px` (8 px interdit). → **[FAIT (socle) — `padding:4px 10px; gap:4px; line-height:16px` pour que l'icône + le mot tiennent dans 48.]**
4. **S** `html.c6 :is(.mLigne,.tp.ligne)` : `min-height:56px; padding:0 16px; font-size:10px` → `min-height:48px; padding:0 12px; font:800 15px/20px var(--sans); letter-spacing:.04em; text-transform:uppercase`. → **[FAIT (socle).]**
5. **S** `html.c6 :is(.mSec,.tpH)` : `font-size:8px` pixel → `font:800 13px/16px var(--sans); letter-spacing:.04em; text-transform:uppercase` (couleur g2 inchangée). → **[FAIT (socle) — `.tpH:first-child` (le titre de la pause) garde explicitement le pixel 16.]**
6. **S** `html.c6 b.bascule` : `width:64px; height:28px; font-size:8px` → `height:32px; font:800 13px/1 var(--sans); letter-spacing:.04em` ; patin `::before` 20 → 16 (comme #mSet). → **[FAIT (socle) — patin 16 en `top/right 8`, éteint `translateX(-32px)` (comme #mSet).]**
7. **S** `html.c6 b.valeur` : `font-size:10px` → `font:800 13px/1 var(--sans); letter-spacing:.04em`. → **[FAIT (socle).]**
8. **S** `html.c6 .volHd` : `font-size:8px` → `font:600 13px/16px var(--sans)`. → **[FAIT (socle).]**
9. **S** `html.c6 .c6Sou` : `font-family:var(--pix); font-size:10px` → `font:800 13px/1 var(--sans); letter-spacing:0; font-variant-numeric:tabular-nums` (32 de haut conservé). → **[FAIT (socle) — `.c6Sou b` passe aussi à 800.]**
10. **S** `html.c6 .c6Onglet` : `min-height:44px; font-family:var(--pix); font-size:10px` → `min-height:48px; font:800 13px/1 var(--sans); letter-spacing:.04em; text-transform:uppercase` ; `.c6Onglet.on` : `box-shadow:inset 0 -4px 0 var(--c6-b0)` → `background:var(--c6-b0); color:var(--c6-e0); box-shadow:none` (= l'inventaire) ; `.c6Clair .c6Onglet.on` : `background:var(--c6-e0); color:#fff`. → **[FAIT (socle) — + `.c6Onglet:active` = face e2 (surface plate).]**
11. **S** `html.c6 .c6Carte .c6Nom` : `font-family:var(--pix); font-size:8px; line-height:12px` → `font:800 13px/16px var(--sans); letter-spacing:.04em; text-transform:uppercase` ; `.c6Prix` : idem `font:800 13px/16px var(--sans); font-variant-numeric:tabular-nums`. → **[FAIT (socle) — `.c6Prix` : `letter-spacing:0` (chiffres).]**
12. **S** `html.c6 .c6Stat small` : `font-family:var(--pix); font-size:8px` → `font:700 13px/16px var(--sans); letter-spacing:.04em; text-transform:uppercase` ; `html.c6 .c6Aide` : `font-weight:500` → `600`. → **[FAIT (socle) — graisse **800** et non 700 (accord §2-4 : deux graisses, 600 et 800) ; `.c6Aide` 600.]**
13. **S** `html.c6 .modB .pbtn` : `font-size:10px` → supprimer (hérite 15/800) ; **L→S** `html.c6 #modT` (ancien `#modT{font-size:var(--f4);letter-spacing:1px;text-shadow:0 0 14px rgba(255,62,200,.5)}`) : ajouter `font-size:16px; line-height:24px; letter-spacing:0; text-shadow:none` ; `html.c6 #modX` : `15px/500` → `13px/18px; font-weight:600`. → **[FAIT (socle) — `#modT` sous `html.c6 #modale .modIn #modT` (l'ancienne `html .modIn:has(.pb-red) #modT` rallumait la lueur rouge) ; `transform:none`.]**
14. **S** `html.c6 .mBadge,html.c6 #bdShop` : `font-size:8px` → `font-size:0` (pastille muette, comme `#bdGar2`) ; plus aucun texte de 8 px. → **[FAIT (socle) — carré d'or MUET 8 × 8 (`font-size:0`, `color:transparent`), comme `#bdGar2`.]**
15. **S** `html.c6 #toast` : `font-size:var(--f1)` (pixel 10) → `font:800 13px/18px var(--sans); letter-spacing:0` ; `padding:14px 18px 13px 16px` → `12px 16px`. → **[FAIT (socle) — + `filter:none` (l'ancienne `drop-shadow(0 10px 16px)` floue restait).]**
16. **P** `html.c6 #mSet .mLigne`, `.mLigne .tpL` : `font-size:10px; line-height:12px` → supprimer (hérite 15/800 de S4) ; `padding:0 8px 0 12px` → supprimer (12 de S4) ; **couché étroit** `@media (orientation:landscape) and (max-width:700px)` : ajouter `html.c6 #mSet .mLigne,html.c6 #mSet .mLigne .tpL{font-size:13px}` (« COPIER MA SAUVEGARDE » 20 lettres ≈ 186 px à 13/800, ne tient pas à 15 dans 262). → **[FAIT (zone pages) — `font-size`/`line-height`/`letter-spacing`/`padding` locaux retirés : la ligne hérite 15/800 du socle ; couché ≤ 700 px de large : libellé 13/18 (lu au banc 667×375 FR+EN : « COPIER MA SAUVEGARDE » tient).]**
17. **P** `html.c6 #mSet b.bascule` : `font-size:8px; line-height:8px` → `font:800 13px/1 var(--sans)` ; `html.c6 #mSet b.valeur` : `font-size:10px; line-height:12px` → `font:800 13px/1 var(--sans)` (et le couché étroit `font-size:8px; line-height:8px` → `13px`, `min-width:56px` → 64). → **[FAIT (zone pages) — bascule et valeur héritent 13/800 ; couché étroit : `min-width:64px`, plus de 8 px.]**
18. **P** `html.c6 #mSet .volV` : `font-family:var(--pix); font-size:10px` → `font:800 13px/16px var(--sans); font-variant-numeric:tabular-nums` ; `.c6Efface`, `.c6Efface .tpL` : `font-size:10px` → `15px` système ; `.c6Ver` : `font-family:var(--pix); font-size:8px; line-height:8px` → `font:600 13px/16px var(--sans)`. → **[FAIT (zone pages) — `.volV` système 13/800 chiffres tabulaires ; `.c6Efface` hérite 15 ; `.c6Ver` système 13/600 (sans capitales).]**
19. **F** `html.c6 #tPanel #tpIn .tp.ligne`, `.tp.ligne .tpL`, `.tp.ligne b.valeur` (10), `b.bascule` (8), couché étroit `b.valeur` (8) : mêmes changements que 16-17 (supprimer les corps locaux, hériter du socle) ; `html.c6 #tPanel #tpIn .tp:not(.ligne)` : `font-family:var(--pix); font-size:12px` → système 15/800 ; `html.c6 #tPanel #tpIn .tpRow>.tp` : `font-size:10px!important; padding:0 8px!important` → supprimer la taille (`padding:0 12px!important`) ; `html.c6 #tPanel #tpIn .tpResume .mStat span` : `font-size:8px; line-height:8px` → `font:700 13px/16px var(--sans); letter-spacing:.04em`. → **[FAIT (zone pause) — lignes, bascule, valeur héritent du socle (13 en couché étroit) ; touches RECOMMENCER / QUITTER système 15/800 (le `font-size:var(--f1)!important` de l'ancien `.tpRow .tp` forçait 10 px : surclassé par `var(--c6-t15)!important`) ; légendes du résumé 13/800 capitales ; REPRENDRE garde le pixel 24 (la famille système de `.tp:not(.ligne)` l'aurait pris sinon).]**
20. **G** `#garage[hub] #gAct>:is(#gvCof,#gShopBas)` : `font-size:10px!important` + pixel → `font:800 15px/20px var(--sans)!important; letter-spacing:.04em!important; text-transform:uppercase` (INVENTAIRE ≈ 108 px + icône 24 + gap 8 + padding 16 = 156 ≤ 160, à confirmer à 844 couché). → **[FAIT (garage) — 15/800 capitales .04em sur les jetons ; couché le mot seul (sans icône) : 112 px dans 144.]**
21. **G** `#gCard>#gLvl` (hub et `atelierInv`) : `font-size:8px!important` → `font:700 13px/1 var(--sans)!important` ; `#gCard>#gRarPill` : `font-size:8px!important; line-height:8px!important; height:16px` → `font:800 13px/16px var(--sans)!important; letter-spacing:.04em; text-transform:uppercase` ; `#gAct>#gEquip.achat .gEqV` : `font-size:12px!important` → `16px` (pixel, `.long`). → **[FAIT (garage) — rareté 13/800 .04em, rang 13/800 tabulaire (pas 700 : deux graisses), verbe d'ACHETER pixel 16.]**
22. **G** `#garage.atelierInv #gTabs>.gTab` : `font-size:8px!important` (10 à ≥ 800 px de large) → `font:800 13px/1 var(--sans)!important; letter-spacing:.04em; text-transform:uppercase` et supprimer la règle `@media (min-width:800px){… font-size:10px}` (TRAINEES 8 × 9,3 = 75 ≤ 85 ✓). → **[FAIT (garage), avec écart mesuré — 13/.04em là où les 5 mots gardent 8 px d'air (430 debout, couché ≥ 790), 12/0 à 390 debout et 702-789 couché, plancher 11 à 375 debout et 667 couché : mots 321/281/259 px pour 304-312 px de plaque.]**
23. **G** `#garage.atelierInv #gStrip>.gT>em` (prix) : `font-size:8px!important` → `font:800 13px/1 var(--sans)!important; font-variant-numeric:tabular-nums` (`height:16px` → `20px`) ; `#gStrip>.gT>b` (nom) : `font-size:8px!important; line-height:12px` → `font:800 13px/16px var(--sans)!important; letter-spacing:.04em; text-transform:uppercase` ; `#gStrip>.gVide` : `font-size:8px!important` → `font:600 13px/18px var(--sans)!important`. ⚠ trois colonnes de ~108 px à 16/10 (69 px de haut) n'y tiennent plus : voir 3.8 n° 72. → **[FAIT (garage) — nom 13/16 capitales, prix 13/20 tabulaire, vides 13/600.]**
24. **G** `#garage.atelierInv>#gC6Tete>#gC6TitreInv` (debout) : `font-size:12px` → supprimer (reste 16 px pixel ; vérifier le débord avec les comptes à 375 : si besoin, les comptes perdent leur icône ≤ 380 px). `#garage.atelierInv #gCard>#gName` couché étroit : `font-size:12px; line-height:16px` → garder 16/20 si ça tient, sinon le nom passe sur 2 lignes (jamais < 16 pixel). → **[FAIT (garage) — titre pixel 16 debout ; ≤ 380 px debout les comptes perdent l'icône (88 px mini) ; nom couché étroit reste pixel 16 (197 px de plaque, plus long mot 176).]**
25. **C** `html.c6 #gMis .gmC` (`font-size:8px`), `.gmT` (8), `.gmT b` (8), `.gmX` (10), `@media … max-width:700px .gmX` (8), `.gmP b` (8), `.gmC.r small` (8), `.gmNext` (8) → `.gmC{font:800 13px/16px var(--sans); letter-spacing:.04em; text-transform:uppercase}` ; `.gmT{font:700 13px/16px var(--sans)}` ; `.gmX{font:800 13px/16px var(--sans)}` (3 lignes max) ; `.gmP b{font:800 13px/16px var(--sans); font-variant-numeric:tabular-nums}` ; `.gmC.r small, .gmNext{font:600 13px/16px var(--sans); text-transform:none}` ; supprimer l'override couché étroit. ⚠ les cartes grandissent (3 colonnes de 114 px) : le script lit leurs dimensions, voir 3.8 n° 73. → **[NON FAIT — demande le banc (gmPlace, EN « CHALLENGE n » à 13 px)]**
26. **C** `html.c6 #carr .cmNiv .cmNom` : `13px / 700` → `13px / 800; letter-spacing:.04em; text-transform:uppercase` ; `.cmEtat` : `font-weight:700` → `800; letter-spacing:.04em` ; `html.c6 #carr .cmNiv .cmEtat{text-transform:none}` → `uppercase` (« EN COURS » = « EN COURS » partout) ; `.cmNiv .cmNom` ligne 16 → 18. → **[NON FAIT — demande le banc (couché étroit, états en capitales)]**
27. **A** `html.c6.hub:not(.poki) body #mHome.acc2 .c6aT` : `letter-spacing:.02em` → `.04em` ; `.mAccB>.c6aS` : `letter-spacing:.01em` → `.04em` ; `.mGear>.c6aT` : `font-size:13px; line-height:16px` → `15px; line-height:20px`. → **[FAIT (accueil) — `.04em` partout ; RÉGLAGES 15/20.]**
28. **F** `#overlay #mDead :is(.mCause,.mCashL>small,.hCard>small,.hNx,.hMotN,.mStat span,.mObj .obHd,.mObj .obBig,.mObj .obCat,.mObj .obFt)` : `font-weight:700; letter-spacing:.02em` → `800; .04em` (légendes) ; `.hMotN i`, `.mObj .obFt` secondaires : `700` → `600` ; `.mObj .obBig`, `.hMot .hMotN` : `15px` ✓ (déjà au jeton). → **[FAIT (fin, 11a09ec) — légendes en jetons (`--c6-sys`, `--c6-t13`, `--c6-wf`, `--c6-cap`) ; `.hMotN i` et `.mObj .obFt` en 600 (les chiffres de la prime gardent 800) ; badges RECORD ! et 15 px en jetons : plus aucune alerte lint dans `c6-pause-fin`.]**
29. **H** `html.c6 body #coach .coSkip` : `font:800 12px/1 …; letter-spacing:.5px` → `font:800 13px/1 var(--sans); letter-spacing:.04em` ; `#coach .coN` : `11px / 700; letter-spacing:.3px` → `13px / 800; .04em` ; `#coach .coTx b` : `letter-spacing:.5px` → `.04em`. → **[FAIT (carrière-missions, db27aa9)]**

### 3.2 Les hauteurs et la plaque de décision

30. **A** `html.c6.hub:not(.poki) body #mHome.acc2` : `grid-template-rows:44px 8px auto minmax(16px,1fr) 64px 8px 64px 12px 72px` → `48px 8px auto minmax(16px,1fr) 64px 12px 64px 16px 64px` (ligne 1 = 48 comme ◀ ; écart entre les deux rangées de cartes 8 → 12 ; cartes → JOUER 12 → 16 ; JOUER 72 → 64). → **[FAIT (accueil) — rangées `48 8 auto 1fr 64 12 64 16 64` ; padding haut `sT+8`, bas `sB+20`.]**
31. **A** `… #mHome.acc2 .mAccP>.mPlay .lg` : `font-size:32px!important` → `24px!important` ; `@media (max-width:350px)` `24px` → supprimer (devenu le défaut). → **[FAIT (accueil) — JOUER 24 px par défaut ; l'override ≤ 350 px retiré ; couché ≤ 400 px de haut : 16 px.]**
32. **A** `… #mHome.acc2 .mGear` : `height:44px!important; min-height:44px!important; min-width:44px!important` → `48px / 48px / 48px` ; `padding:calc(var(--sT) + 16px) …` du conteneur : `calc(var(--sT) + 16px)` → `calc(var(--sT) + 8px)` (le ⚙ tombe où tombent les ◀). → **[FAIT (accueil) — ⚙ 48 × 48 min, à `sT+8`.]**
33. **A** `@media (orientation:landscape) and (max-height:540px) … grid-template-rows:44px minmax(0,1fr) auto 12px 56px 8px 56px 12px 64px minmax(0,1fr)` → `48px minmax(0,1fr) auto 12px 48px 12px 48px 16px 64px minmax(0,1fr)` (cartes d'accueil couchées 56 → 48 ; la sous-ligne 13/16 + libellé 15/20 + 2 = 38 ≤ 48 ; à vérifier au banc i7couche 375 de haut). → **[FAIT (accueil) — couché : cartes 48, rangées `48 · 1fr · auto · 12 · 48 · 12 · 48 · 16 · 64` ; ≤ 400 px de haut : JOUER 48/16. Lu à 844×390 et 667×375 : libellé 15 + sous-ligne 13 tiennent dans 48, rien de tronqué.]**
34. **C** `html.c6 #carr .cmJouer` : garder 64 mais le passer sur la recette `.pb-gold.long` (`font-size:16px` par la classe, plus par règle locale) ; vérifier en EN. → **[FAIT (db27aa9) — classe big → long dans carrVueC6 (.pbtn.big, après .pb-gold.long dans le socle, la remettait à 24)]**
35. **F** `@media (orientation:landscape) and (max-height:540px) html.c6 #tPanel #tpIn>.tp.go` : `min-height:48px; font-size:16px` → `@media … (max-height:400px)` seulement (48/16), sinon 64/24 : à ≥ 400 px de haut la décision reste à 64. → **[FAIT (pause) — la décision de la pause reste 64/24 au-dessus de 400 px de haut ; 48/16 seulement à 844×390 et 667×375.]**
36. **H** `html.c6 body #tGear` : ajouter `width:48px!important; height:48px!important` (legacy 1350 : 50 × 50 `!important`) ; ⚠ le HUD ne bouge pas : c'est 2 px, centrés sur la même zone. → **[FAIT (db27aa9) — 48 déjà effectif par 2541, désormais dit dans c6-hud]**
37. **S** `html.c6 :is(.mLigne,.tp.ligne)` hauteur 56 → 48 (voir n° 4). **F** `#tPanel #tpIn .tp.ligne` : `height:48px; min-height:48px` ✓ déjà. **P** `#mSet .mLigne` : `min-height:48px` ✓. → **[FAIT (socle, partie S).]**

### 3.3 Le retour au toucher

38. **S** `html.c6 .c6Carte` : `box-shadow:inset 0 -4px 0 0 var(--rc),inset 0 0 0 2px var(--c6-e3)` → `inset 0 0 0 2px var(--c6-b0),inset 0 -4px 0 0 var(--rc),0 4px 0 0 #000` ; `html.c6 .c6Carte:active{transform:translateY(2px)}` → `translateY(4px)` ; `html.c6 .c6Carte.on` : `inset 0 0 0 2px var(--c6-b0)` → `inset 0 0 0 4px var(--c6-b0)` ; `transition:transform …` → `transform … , box-shadow …` (90 ms linear) ; `.c6Clair .c6Carte` : filet `#d5d8df` → `var(--c6-e0)`, tranche `#a9aebb`. → **[FAIT (socle) — + l'appui retire la tranche (comme `.pbtn`) ; `.c6Clair` : filet `--c6-e0`, tranche `--c6-l3`.]**
39. **G** `#garage #gCard>#gOeil:is(:active,.appui)`, `#gAct>:is(#gvCof,#gShopBas):is(:active,.appui)`, `#gAct>:is(#gJouer,#gEquip.achat):is(:active,.appui)`, `#garage.atelierInv #gStrip>.gT:active` : `translate:0 4px!important` → `transform:translateY(4px)!important` (le `translate:none` de l'état repos devient `transform:none!important`), et ajouter `transition:transform var(--c6-vite) linear,box-shadow var(--c6-vite) linear` sur chacun des quatre à l'état repos (aucune transition déclarée aujourd'hui). → **[FAIT (garage) — transform translateY(4px) + tranche, 90 ms linear (mesuré : descente 4 px) ; onglet = face e2 ; cartes .on/.eq comprises.]**
40. **C** `html.c6 #gMis .gmC:active{translate:0 4px}` → `transform:translateY(4px)` ; ajouter `transition:transform var(--c6-vite) linear,box-shadow var(--c6-vite) linear` sur `html.c6 #gMis .gmC` (le `html.c6 #gMis .gmC.d:hover` suit). → **[FAIT (db27aa9)]**
41. **A** `… #mHome.acc2 :is(.mAccB,.mGear)` et `.mAccP>.mPlay` : ajouter `transition:transform var(--c6-vite) linear,box-shadow var(--c6-vite) linear` (aujourd'hui `transition` non déclarée dans le bloc ; à confirmer au banc si l'ancienne feuille en pose une). → **[FAIT (accueil) — `transition:transform 90ms linear, box-shadow 90ms linear` sur cartes, ⚙ et JOUER.]**
42. **H** `html.c6 body #tGear` : la transition legacy (`body.touch #tGear{transition:transform var(--t-fast) var(--ease),box-shadow …,filter …,opacity …!important}`, 140 ms `.32,.72,0,1`) → `html.c6 body.touch #tGear{transition:transform var(--c6-vite) linear,box-shadow var(--c6-vite) linear,opacity var(--c6-pose) linear,visibility 0s!important}`. Seul bouton de la course : 90 ms linear. → **[FAIT (db27aa9)]**
43. **L→S** supprimer les résidus de l'appui legacy sous c6 : `html.c6 .mObj[data-m].appui,html.c6 .misPrix.voir.appui,html.c6 .mMode.appui{translate:none;filter:none}` ; `html.c6 .gR.appui{translate:none;filter:none}` ; `html.c6{--t-press:var(--c6-vite)}` (70 → 90 ms) ; ces carte-là passent au fond e2 (plates). → **[FAIT (socle) — + `.mMode` / `.misPrix.voir` à l'appui : face e2 (plates) ; `.gR` : `translate/filter` seulement (sa face n'est pas un panneau d'encre).]**
44. **S** supprimer `html.c6 .pbtn.pop,.gTab.pop,.gR.pop,.gT.pop,.mLigne.pop,.mMode.pop{animation:c6Pop 160ms linear}` et `@keyframes c6Pop` (flash de filtre : 2e retour, inutile et coûteux sur iPhone 7) ; remplacer par `html.c6 .pop{animation:none}` pour neutraliser le k4Pop legacy. → **[FAIT (socle) — neutralisation limitée aux six classes (`html.c6 :is(.pbtn,.gTab,.gR,.gT,.mLigne,.mMode).pop`), pas `html.c6 .pop` : `.pop` pourrait servir ailleurs à une célébration.]**
45. **S** `html.c6 *{-webkit-tap-highlight-color:transparent}` (aujourd'hui seulement sur `.c6Onglet`, `.c6Carte`, `.cmCarte`) ; focus : `html.c6 :is(.pbtn,.c6Carte,.c6Onglet,.mLigne,.tp):focus-visible{outline:2px solid var(--c6-or);outline-offset:4px}`. → **[FAIT (socle) — focus sur `.pbtn, .c6Carte, .c6Onglet, .mLigne, .tp`.]**

### 3.4 Les marges et la grille

46. **C** `html.c6 #carr .c6Bas` : `padding:8px calc(var(--sR) + 16px) calc(var(--sB) + 8px) calc(var(--sL) + 16px)` → `… calc(var(--sB) + 20px) …` (la face de JOUER à `sB+20`, sa tranche tombe à `sB+16`). → **[FAIT (db27aa9)]**
47. **C** `html.c6 #gMis #gmBas` : `bottom:calc(var(--sB) + 16px)` → `calc(var(--sB) + 20px)`. → **[FAIT (db27aa9)]**
48. **F** `html.c6 #overlay #mDead .mFin` : `padding:0 0 var(--c6-t)` ✓ (déjà le bon patron : la tranche est dans le padding) ; ne rien changer, c'est le MODÈLE pour 46 et 47. → **[FAIT (rien à changer) — conforme ; en plus, REJOUER passe à 48 / pixel 16 sous 400 px de haut couché (accord §2-1, comme JOUER et REPRENDRE), 329be80.]**
49. **G** `html.c6 body #garage … #gAct` couché : `margin-right:-10px; margin-left:auto` et debout `margin-left:-6px; margin-right:-6px` (marges négatives) → les remplacer par une valeur sans compensation : `#gBottom{padding-left/right:0}` posé sous c6 **ou** garder les −10/−6 mais les nommer `--c6-gBottomPad` (12 px de padding intérieur de `#gBottom`, mesuré à 2 px près) ; ne pas toucher à `#gBottom` si c'est l'ancien système de Léo : vérifier au banc que la plaque touche exactement `sR+16`/`sL+16` à 844 et 390. → **[FAIT (garage) — #gBottom du hub sans marge intérieure de côté, posé à sR+16 couché / largeur 100 % − 32 debout ; plus de −10/−6. Mesuré 16 / 16 à 375 et 390.]**
50. **G** `#gAct{row-gap:12px}` ✓ (8 + tranche) : devient le jeton `--c6-ev`. → **[FAIT (garage) — `--c6-h/--c6-hD/--c6-e/--c6-ev`.]**
51. **B** `html.c6 #garage.modeShop #gBqRet` : `top:calc(var(--sT,0px) + 4px)` → `+ 8px` ; `html.c6 #gBq #gBqTete` : `left:calc(var(--sL,0px) + 72px); top:calc(var(--sT,0px) + 6px); min-height:44px` → `left … + 76px; top … + 8px; min-height:48px` (le titre s'aligne sur la grille des autres écrans, ◀ 48 + 12 de gap).
52. **C** `html.c6 #carr .cmNivs` : `gap:8px` → `12px 8px` (cartes empilées debout : 8 + tranche) ; `html.c6 #carr .cmGrille{gap:12px}` → `12px 8px` (couché : colonnes à 8). → **[NON FAIT — demande le banc (5 niveaux à 375×667)]**
53. **F** `html.c6 #tPanel #tpIn` : `gap:16px 8px` ✓ ; `padding:16px` ✓ (panneau = 16) ; rien.
54. **A** `html.c6.hub:not(.poki) body #mHome.acc2` : `column-gap:8px` ✓.

### 3.5 Les cartes et les états (une grammaire)

55. **S** `html.c6 .c6Carte` (peau) : voir n° 38 — la carte du socle (inventaire, boutique, offres) prend la peau des autres cartes de choix. → **[FAIT (socle) = n° 38.]**
56. **G** `#garage.atelierInv #gStrip>.gT.on{box-shadow:inset 0 0 0 4px …}` ✓ (choisi = filet 4) ; `.gT.eq` face blanche ✓ : conforme ; ne rien changer. → **[FAIT (garage) : rien à changer (conforme) — seul ajout : l'appui des cartes .on/.eq.]**
57. **C** `html.c6 #carr .cmCarte.verr`, `html.c6 #gMis .gmC.f` : conformes (verrouillé = e4 + 35 % ; suivi = face blanche) ; ne rien changer. → **[FAIT (rien à changer : conforme)]**
58. **G** `html.c6 body #garage … #gAct>:is(#gvCof,#gShopBas).modeOn` (face blanche) ✓ conforme à « actif = face blanche ». → **[FAIT (garage) : rien à changer (conforme).]**
59. **F** `html.c6 #overlay #mDead .mObj:is(:active,.appui)` : `filter:none; background:var(--c6-e2)` → ajouter `translate:none` (le legacy 2 px résiduel). → **[FAIT (fin, 11a09ec) — + `transform:none` et `transition:background-color 90ms linear` (surface plate : la face fonce, rien ne bouge).]**
60. **S** `html.c6 .pbtn.off` : rien (conforme) ; **S** aligner `html.c6 #gBqBtn[data-e=choix|manque]` (boutique) sur `.pbtn.off` → après dégel. → **[S : rien à faire (conforme) ; partie boutique → après dégel.]**

### 3.6 Les couleurs

61. **H** `html.c6 body #coach .coSkip.sur`, `html.c6 body #coach.rate .coN` : `#ff6b7d` → `var(--c6-rouge)` (le contraste sur `#13161d` reste ≥ 4,5). → **[FAIT (db27aa9)]**
62. **H** `html.c6 body #coach.bravo` : `background:#1c6b37!important` + pips `#0e3a1d` → `background:var(--c6-e1)!important; box-shadow:inset 0 0 0 2px var(--c6-cash),0 4px 0 0 #000!important` ; `.coTx b, .coIco, .coN` : `var(--c6-b0)` → `var(--c6-cash)` ; `.coPips i` : `background:var(--c6-e3)` ; `.coPips i.ok,i.on` : `var(--c6-cash)` (même grammaire que le toast « coche »). → **[FAIT (db27aa9)]**
63. **S** déclarer `--c6-voile:rgba(11,13,18,.88)` et `--c6-voile-leger:rgba(11,13,18,.45)` ; **F** `html.c6 #tPanel{background:rgba(11,13,18,.88)}` → `var(--c6-voile)` ; **G** `#garage.atelierInv #gBottom{background:rgba(11,13,18,.8)!important}` → `var(--c6-voile)!important` ; **C** `html.c6 #gMis::before{background:rgba(11,13,18,.45)}` → `var(--c6-voile-leger)` ; **L→S** `html.c6 #modale{background:var(--c6-voile)}` (legacy 4299 : `rgba(5,3,12,.9)`, violet). → **[FAIT (partie socle : jetons + `#modale`) ; F / G / C : aux zones.]** **[G FAIT (garage) — plaque de l'inventaire ET plaque de la fiche → `--c6-voile`.]**
64. **S/B** palette claire : déclarer `--c6-l0:#fff; --c6-l1:#eef0f3; --c6-l2:#d5d8df; --c6-l3:#a9aebb; --c6-l4:#8c93a3; --c6-cashL:#12813f` et réduire `.c6Clair …` (`#c9ccd4` → `--c6-l2`, `#4a525d` → `--c6-l4`, `#14171c` → `--c6-e0`) ; **C** `html.c6 #gMis .gmC.f u{background:#c9ccd4}` → `var(--c6-l2)` ; `.gmC.f .gmP b{color:#12813f}` → `var(--c6-cashL)` ; **B** (gelée) `#gBqBtn` gris `#eef0f3/#4a525d/#c9ccd4`, `.bqJ` `#d5d8df`/`#14171c` → tokens. → **[FAIT (partie socle : jetons + `.c6Clair`) ; C / B : aux zones.]**
65. **L→S** `html.c6 #splash{background:var(--c6-e0)}` (legacy : `radial-gradient(900px 600px at 50% 46%,#191024,#000 75%)` = dégradé teinté violet) ; le logo, ses lueurs et sa livrée restent intouchés. → **[FAIT (socle).]**

### 3.7 Le mouvement (une durée, une courbe)

66. **L→S** `html.c6 #modale.on .modIn{animation:c6Entre var(--c6-pose) var(--c6-courbe) both}` ; `html.c6 #modale.sortant .modIn{animation:c6Sort var(--c6-sort) linear forwards}` ; `html.c6 #modale.on .modB>.pbtn{animation:c6Entre var(--c6-pose) var(--c6-courbe) 30ms backwards}` + `.pbtn+.pbtn{animation-delay:60ms}` (la fenêtre ne glisse plus du bas en 400 ms ; mêmes 8 px / 200 ms que le reste) ; garder `data-reduced-motion` (le legacy 3242/4267 le fait). → **[FAIT (socle) — voile `k4Voile` 200 ms courbe, sortie `c6Fondu` 100 ms linear (nouvelle `@keyframes c6Fondu` dans le socle, pour ne pas dépendre de `c6Sort` des transitions) ; le `data-reduced-motion` ancien (`!important`) prime toujours.]**
67. **L→S** `html.c6 #toast` : `transition:opacity var(--c6-pose) var(--c6-courbe),transform var(--c6-pose) var(--c6-courbe); transform:translate(-50%,-8px)` ; `html.c6 #toast.on{transform:translate(-50%,0)}` (le legacy pose `-26px scale(.96)` à 4231 et `translate(0,-14px)` couché 3729 : à surclasser aussi) ; sortie `opacity` 100 ms. → **[FAIT (socle) — + le garage couché (`body.inGarage`, ancienne 3729) : entrée 8 px aussi.]**
68. **T** `html.c6 #wipe.out::before{animation-duration:240ms!important; animation-timing-function:cubic-bezier(.6,0,.8,.4)}` → `200ms` (garder l'entrée à 150 : la main revient au script à 160 ms). → **[FAIT (transitions, df032f4) — `var(--c6-pose)` ; entrée 150 et courbe de sortie gardées.]**
69. **F** `@keyframes c6FondSort` : `120ms` → `var(--c6-sort)` (100 ms) ; le commentaire « 130 ms » des réglages sur pause → 100 ms (`setPauseSort`). → **[FAIT (pause, 329be80) — `var(--c6-sort)` ; le minuteur du script (130 ms) n'est PAS touché : il retire la classe après la dernière image du fondu, c'est voulu.]**
70. **S/T** `@media (prefers-reduced-motion:reduce)` ajouter l'équivalent `html.c6[data-reduced-motion="1"]` pour : `.pbtn`, `.c6Carte`, `.c6Onglet` (transition:none), `.c6Entre>*`, `.mscr.on`, `.mscr.on>*`, `.mscr.sort` (animation:none), `#wipe.in::before,#wipe.out::before` (animation-duration:1ms) — aujourd'hui le réglage du jeu n'est lu que par pause-fin, hud et la modale legacy. → **[FAIT (partie socle : `.pbtn`, `.c6Carte`, `.c6Onglet`, `.c6Entre`, boutons de fenêtre, toast) ; `.mscr`, `#wipe` : au bloc T.]** **[FAIT (transitions, df032f4) — `html.c6[data-reduced-motion="1"]` : `.mscr.on`, `.mscr.on>*`, `.mscr.sort` sans animation (l'ancienne feuille leur rendait un fondu k4Voile), `#wipe.in/out::before` 1 ms ; sous la préférence du système : rideau 1 ms et voile `--c6-e0` au lieu de `#07050f`. La fin (`#mDead`) l'avait déjà.]**
71. **A** `html.c6 #splash #spInvite.on{animation:c6Respire 2.4s …}` : conservé (une boucle, opacité seule) ; ne rien changer.

### 3.8 Compléments à risque (à décider avant d'appliquer ; non comptés plus haut)

72. **G** `#garage.atelierInv #gStrip` (3 colonnes, `aspect-ratio:16/10` → 69 px de haut à 108 px de large) : avec nom 13/16 sur 2 lignes + prix 20, l'image n'a plus de place → **2 colonnes** (`grid-template-columns:repeat(2,minmax(0,1fr))`, `aspect-ratio:4/3`) debout ; couché garde 3 colonnes si la plaque fait ≥ 330 px. Décision de mise en page (Sacha). → **[FAIT (garage) — décision §5 : DEUX colonnes partout (4/3 debout, 16/10 couché), pas de 3 colonnes couché.]**
73. **C** `#gMis` en 3 colonnes de ~114 px (390 debout) : à 13/800, « RAMASSE 25 PIECES » = 2 lignes, « ENCAISSE $ 200 » 2 lignes ; les cartes passent de ~88 à ~110 px de haut ; `gmPlace` (script) lit leurs dimensions pour poser les fils : repasser le banc. Alternative : une seule colonne de trois lignes pleine largeur (coché · nom · récompense) — structure, donc maquette. → **[NON FAIT — lié à 25]**
74. **A** la carte d'accueil couchée à 48 px de haut : si le libellé de l'ancienne EN (« DEFIS » / « REWARDS ») ne tient pas, la sous-ligne disparaît couché (le libellé reste).

---------------------------------------------------------------------------------------------------------------------------------------

## 4. Comptes, questions, ce qui n'a pas été vu

**Nombre de changements listés par bloc** (numéros ci-dessus ; chaque numéro = une règle ou un petit groupe de règles du même sélecteur) :
**S (charte6) 28** (dont 4 sont des neutralisations de l'ancienne feuille posées dans le socle : n° 13, 43, 63, 65-67) · **A (accueil) 8** · **P (pages) 3** · **C (carrière-missions) 8** · **G (garage) 10** · **F (pause-fin) 7** · **H (hud) 5** · **T (transitions) 2** · **B (boutique, après dégel) 2** · **L (ancienne feuille, neutralisée depuis un bloc c6) 4** · **à décider (3.8) 3**. Total : **71 changements** + 3 compléments à risque.

**Questions à trancher (Sacha / chef de chantier)** :
1. **JOUER de l'accueil** : 64/24 comme partout (proposé, « même bouton ») ou garder 72/32 en exception « héros » du premier écran ?
2. **Inventaire** : 3 colonnes de cartes illisibles à 13 px → 2 colonnes (n° 72) — structure, donc à valider.
3. **Missions debout** : cartes de 114 px à 13/800 (n° 73) ou une colonne de lignes ?
4. **Pixel dans les libellés de touche** : l'accord supprime le pixel 8/10/12 des touches et lignes (système 15/800 à la place). C'est ce que demandent les règles de 6 h ; si Sacha veut garder « la voix pixel » sur les libellés, la seule valeur légale est 16 px (alors CARRIÈRE = 8 lettres × 16 = 128 px : ne tient pas en carte d'accueil de 175 px avec icône).
5. **Offres (#mShop) et Modes (#mModes)** : aucune règle c6 propre dans les blocs lus (ui/pages n'a fait que les réglages) ; ils reçoivent seulement le socle + le legacy. À relire sur captures avant l'application.
6. **La boutique** (gelée, Léo) : tout ce qui la touche (n° 51, 60, 64) est à appliquer APRÈS le dégel ; sa plaque d'achat 48/système 15 doit devenir la décision 64/pixel 24 (ou rester une exception notée).

**Non vu / non vérifié** : accueil v2 et fin v2 à l'écran (seulement le CSS) ; iPhone 15 / Pro Max avec encoche et barre ; modale, toast, splash, offres, modes, boutique à l'écran ; l'anglais (largeurs
calculées à la main : INVENTAIRE 108 px, TRAINEES 75 px, COPIER MA SAUVEGARDE 186 px à 13/800 — à confirmer au banc) ; les chinois (hors périmètre, la session DETAIL traduit) ; l'effet réel des
`!important` des anciennes feuilles sur les sélecteurs de la liste (chaque ligne est écrite pour s'appliquer *dans le bloc c6 de la zone*, avec `!important` là où le bloc en pose déjà).

## §5 — DÉCISIONS DU CHEF (7 h 40, tranchées à l'œil, réversibles ; Sacha a dit de ne plus lui poser ces questions)
1. JOUER de l'accueil : 64 / pixel 24 comme toutes les décisions (pas d'exception « héros ») — l'accord prime.
2. Inventaire : deux colonnes de cartes.
3. Missions debout : on garde les cartes (texte 13/800), banc obligatoire après (`gmPlace` lit les dimensions).
4. Libellés de touche : police système 15/800 capitales ; le pixel seulement ≥ 16 (titres, décisions, gros chiffres).
5. Offres et Modes : relire sur captures avant d'appliquer quoi que ce soit.
Ordre d'application : socle `charte6` d'abord (branche `ui/socle`), puis les blocs de zone une fois les branches P1 intégrées.

## §6 — APPLICATION DU SOCLE (branche `ui/socle`, 14/10 ~7 h 30-8 h)
- **Fait** : les 28 changements S du §3 (marqués « FAIT (socle) » en bout de ligne) dans `<style id="charte6">` seul ; les jetons de
  `banc/accord/jetons.css` sont posés sous `html.c6{…}` (mêmes noms) et lus par les composants communs. Écarts tranchés à l'œil : la décision or
  passe à 48 / 16 dans une rangée de fenêtre (`.modB`, `.spBtns`) et dans la vieille grille `.carrNiv` (64 à côté de 48 = deux hauteurs côte à
  côte) ; `.c6Stat small` en 800 (pas 700 : deux graisses) ; `.pop` neutralisé sur les six classes seulement. Aucun changement écarté.
- **Banc** (passage 1 ; le passage 2 — fenêtre debout après défilement, fin de partie — abandonné : file du verrou tenue 25 min par un autre banc ; 390×844 · 844×390 · 375×667, avant 8500 / après 8509, `ui/shots/socle/`) : 0 erreur JS (une requête audio annulée au changement d'écran, pas une erreur) ; fenêtre (vue couché) : plus de lueur
  magenta, voile d'encre, FERMER système 15, COPIER pixel 16 en 48 ; comptes du garage en système 13 (plus lisibles) ; lignes de la pause
  inchangées (le bloc pause épingle le pixel) avec commandes en système 13.
- **⚠ ENTRE-DEUX (jusqu'aux passes de zone)** : là où un bloc de zone épingle un corps < 13 SANS famille, le libellé passe du pixel au système
  au même corps — réglages (`#mSet .mLigne` / `.tpL` 10 px : libellés plus petits que les titres de section à 13, hiérarchie inversée → **P16**),
  garage INVENTAIRE / BOUTIQUE (10 px → **G20**), accueil de BASE CARRIÈRE / MISSIONS (8 px ; l'accueil v2 de la branche `ui/accueil` les met
  déjà à 15 → **A**), POKI `.mMisBtn` 12 px. À intégrer **avec** (ou juste avant) ces passes. Onglets de l'inventaire qui se chevauchent couché
  (VOITURESPEINTURE…) : **déjà là avant**, `#gTabs>.gTab` pixel 10 → **G22**.
- **Outil** : `banc/lint-c6.cjs` accepte désormais `letter-spacing:var(--c6-cap)` (.04em des capitales système, accord §2-4) ; le pixel reste à 0.
- **Planche** : `ui/shots/socle/accord-avant-apres.png` (accueil, réglages, garage, pause — 390×844, avant 8500 / après 8509). Elle MONTRE
  l'entre-deux : accueil de base, réglages et garage ont, après, des libellés système 8-10 px plus petits qu'avant (les blocs de zone épinglent
  ces corps) ; la pause est identique (commandes en 13) ; la fenêtre (couché) est nettement mieux. **Verdict : bon à intégrer, mais PAS SEUL —
  dans le même train que P16-19 (réglages, pause), G20-23 (garage) et l'accueil v2 (`ui/accueil`)** ; seul, trois écrans sont temporairement
  moins lisibles. Non vu à l'écran : la fenêtre debout, la fin de partie (le banc ne l'a pas atteinte), l'anglais, l'iPhone 15/Pro Max.


## §7 — PASSE DE ZONES réglages / pause / accueil (branche `ui/socle`, 14/10 ~11 h 30-12 h)
- **Fait** : P16-P19 (réglages, pause), A27, A30-A33, A41 — voir les marques « FAIT » du §3. Blocs touchés : `c6-pages`, `c6-pause-fin` (partie pause), `c6-accueil`. Les blocs de zone ne fixent plus ni corps ni police des lignes de réglage : ils lisent le socle.
- **Écarté / sans objet** : A54 (rien à changer, `column-gap:8px` déjà là) ; les règles POKI de l'accueil (T5 a retiré POKI et le chinois : conflit de fusion résolu en prenant `ui-integration`, `grep html.poki|html.c6.poki|I18N_ZH|LANG==='zh'` = 0). L'accueil de base `?menu=leo` n'a aucune règle c6 propre : il ne bouge pas (hors périmètre, pas de style de zone à accorder).
- **Banc** (`banc/socle/zones.cjs`, `ui/shots/socle/zones/`) : 375×667, 390×844, 667×375, 844×390 (FR) + 375×667 et 667×375 en EN ; avant 8500 (390×844, 844×390) / après 8509. Audit automatique de tout texte visible < 11 px : **aucun** sur accueil, réglages, pause (avant : 8 et 10 px partout dans réglages et pause). 0 texte tronqué, `boutons()` : 0 problème sur accueil et pause ; sur réglages seuls restent « hors écran / dans la marge » = lignes plus bas que l'écran (la liste défile), pas des défauts.
- **Planches** : `ui/shots/socle/zones-avant-apres.png` (debout) et `zones-avant-apres-couche.png`.

## §8 — PASSE FIN DE PARTIE + TRANSITIONS (+ bas des réglages) (branche `ui/socle`, 14/10 ~12 h 15-13 h)
- **Fait** : n° 28 (légendes de la fin en jetons système 13/800 .04em ; secondaires 600) · n° 48 (rien à changer : face de REJOUER à sB+20, mesurée dans les 6 formats) ·
  n° 59 (défi = surface plate) · n° 68 (rideau sortie 200 ms) · n° 69 (fondu de sortie des réglages sur pause 100 ms) · n° 70 (mouvement réduit, partie pages + rideau).
  Commits : 11a09ec (28, 59), 329be80 (REJOUER 48/16 sous 400 px de haut couché + 69), df032f4 (68, 70), 2bed044 (ENTRER UN CODE), 2e6a180 (retouches vues au banc).
- **En plus, à l'œil** : (1) REJOUER suit la règle de la décision des autres écrans : 64 / 24 partout, **48 / pixel 16 sous 400 px de haut couché** (844 × 390, 667 × 375),
  comme JOUER et REPRENDRE — la maison et REJOUER ont alors la même hauteur. (2) La bande : à 800 / .04em « MULTI MAX » passait sur deux lignes → légendes de la bande
  sans chasse ajoutée (800 gardé). EN « BEST MULTI » passe sur deux lignes équilibrées (déjà avant). (3) Le palier du moteur : un nom long (« 4 EN LIGNE TURBO ») renvoyait
  « · PALIER 6 » à la ligne derrière un point orphelin, avec la chasse de 2 px de l'ancienne feuille → palier sur sa propre ligne, sans point (mFill, branche c6 seulement).
- **Écarté** : rien des numéros. Non retenu : aligner le titre de la fin sur les titres d'en-tête (sT+32 au lieu de sT+28) — la fin n'a pas de ◀ à côté, l'écart ne se voit
  pas et coûterait 4 px à la colonne couchée la plus serrée. Le minuteur de `setPauseFerme` (130 ms) n'est pas touché (il doit suivre la fin du fondu de 100 ms).
- **Réglages (backlog P2)** : RESTAURER UN CODE et EFFACER étaient déjà entièrement atteignables (56 px sous EFFACER au bas du défilement, 6 formats, depuis l'accueil ET
  depuis la pause). Le vrai défaut trouvé : **ENTRER UN CODE** (Léo, « tout en bas ») montait EN TÊTE de la liste debout et tombait seul SOUS la version couché → rangé
  sous RESTAURER UN CODE (c6-pages, CSS seul, DOM et ?ui=5 intacts). ◀ des réglages à sT+8 partout (8 / 67 px).
- **Banc** (`banc/socle/fin.cjs`, `ui/shots/socle/fin/`, log `banc1.log`) : 8500 avant / 8509 après ; 375×667, 390×844, 430×932 debout et couché, dpr 3, marges
  59/34 · 59/21 · SE 0 ; FR + EN ; 1re partie (aucun badge, GAME OVER) et records battus (trois badges). 0 texte < 11 px, 0 débordement, `boutons()` 0 problème, rien ne
  défile, 0 erreur JS (deux musiques interrompues = bruit connu). Mouvement réduit lu : rideau 1 ms, page sans animation.
- **Planches** : `shots/socle/fin/fin-avant-apres-debout.png`, `fin-avant-apres-couche.png`, `reglages-bas-avant-apres.png`.
- **Passage de contrôle v2** (`banc2.log`, après 2e6a180) : palier du moteur sur sa ligne (FR « PALIER 6 », EN « TIER 6 ») vu ; 0 texte < 11 px, 0 problème de touche,
  0 erreur JS ; `?ui=5` : l'ancienne fin et les anciens réglages (ENTRER UN CODE tout en bas) intacts — l'ancienne fin défile de 34 px à 390×844 et 19 px à 844×390 :
  état de l'ancienne interface, pas touché.
- **NON FAIT (reste)** : à 375 de large, « MULTI MAX » passe encore sur deux lignes (la chasse 0 ne suffit pas à 800) ; piste : graisse 700 pour les seules légendes de la
  bande, ou écart de bande 8 → 4 — à voir au banc (arrêt demandé par le chef avant un 3e passage). EN « BEST MULTI » : deux lignes équilibrées (comme avant).
  Non vu : 430×932 EN, joueur en auto-école quittée (REPRENDRE), fin de campagne, l'appui réel au doigt (lu par styles calculés seulement).


## §10 — CARRIÈRE, MISSIONS, HUD (branche `ui/carriere-missions`, 14/10 ~12 h 40-12 h 55, arrêtée sur ordre du chef)
- Fusions : `ui-integration` 48315bd (avance rapide) puis `ui/socle` 2bed044 (41711e4). Conflits : `c6-accueil` couché = rangées du socle (48·48·48) + RÉGLAGES
  en `grid-column:2/-1` de la vérif P1 (la sonde avait montré la 1re colonne à 0 px) ; `c6-pause-fin` = côté socle (lignes 15/800 et bascule 13 au lieu du bloc
  13/12 px de 000b292 : plus lisible, aucun texte < 11). Lint 24 alertes après fusion (ui-integration 33) ; 21 après db27aa9.
- FAIT (db27aa9, non vu au banc) : H29, H36, H42, H61, H62 ; C34, C40, C46, C47 ; C57 conforme.
- NON FAIT (demandent le banc, la charge était > 40) : C25 / C73 (cartes de mission en 13/800 : gmPlace, « CHALLENGE n » EN dans 93-98 px),
  C26 (noms de niveau 13/800 .04em + états en capitales ; couché 667×375 : 12 px gardé faute de mesure de MONTMARTRE à 13/800), C52 (écarts 12/8 :
  5 niveaux à 375×667 = 428 px pour ~415 avec C46).
- Ouverture de la carrière tombée dans les niveaux de PARIS (844×390, 1 fois sur 6) : non regardée.
- Plaque de pouvoir : hudColonne lit le bas de #coach (getBoundingClientRect + 8) : la carte un peu plus haute (coN 13/16) reste suivie ; non vu.

## §9 — PASSE D'ACCORD DU GARAGE (branche `ui/garage`, 14/10 ~12 h 15-13 h, bloc `c6-garage` seul)
- **Fusion** : `ui/socle` fusionnée dans `ui/garage` sans conflit (le socle gagne `charte6`, le garage `c6-garage` ; blocs `c6-pause-fin`, `c6-transitions`, `c6-pages`, `c6-boutique` non touchés).
- **FAIT** : 20, 21, 22, 23, 24, 39, 49, 50, 56 et 58 (rien à changer), 63 (partie G), 72 — voir les marques du §3. En plus : la condition d'une caisse fermée / à défi (`#gDesc`) se lit dans la plaque (13 système, plus de pixel 8-10) ; un nom long (LA QUEUE DE CANARD) poussait la plaque et l'œil hors de l'écran à 375 debout → colonne `minmax(0,max-content)`, le nom passe sur 2 lignes.
- **ÉCARTÉ / décidé à l'œil** : `#gTourne` reste SANS libellé (le patin se lit comme un curseur, un mot de plus chargerait le décor) ; onglets à 12 (390) et 11 (375 / 667) au lieu de 13 — mesuré, 13 ne tient pas.
- **Banc** (`banc/garage/accord.cjs`, dpr 3, marges iPhone, avant 8500 / après 8504, FR) : 375×667, 390×844, 430×932, 667×375, 844×390, 932×430 ; hub, fiche à vendre (ACHETER), fiche fermée, nom long, inventaire neuf, inventaire plein (code cousin), onglet AILES. Résultat (33 écrans) : aucun texte < 11 px, 0 débordement, 0 erreur JS, ◀ à x=sL+16 / y=sT+8 en 48×48, bas du hub à 16 / 16 de la marge, appui = 4 px de descente en 90 ms. Les seuls « problèmes » de l'audit = cartes de la grille sous le bord (la liste défile).
- **NON VU** : l'anglais (passe EN annulée à l'arrêt) ; le texte de condition `#gDesc` à l'écran — en version TEST (`TEST_CAISSES`) toutes les caisses sont ouvertes et `.prixSeul` le masque : le CSS est posé mais jamais rendu (passe « condition simulée » `banc/garage/accord-p2.cjs` prête, pas lancée) ; nom long dans l'inventaire (le code cousin n'a pas pris l'`equipped` demandé) ; le correctif du nom long n'a été revu qu'en 667 / 844 couché (375 debout = avant correctif) ; `?ui=5` pas regardé (toutes les règles sont sous `html.c6`).
- **Planche** : pas faite (charge machine > 40 à l'arrêt) — captures brutes dans `ui/shots/garage/accord/` (`avant-*` / `apres-*`), script prêt : `node banc/garage/accord-planche.cjs`.
