# CARTE DE L'INTERFACE HORS COURSE (charte 6) — relevée le 14/10 vers 13 h 30 sur ui-integration de78b60
Numéros de ligne AVANT le socle nav7 (2582b10 ajoute 2 lignes vers la l. 49 et 28 lignes vers la l. 8528 : ajoute +2 au-delà de 49, +30 au-delà de 8528).

## 0. Quatre faits techniques
1. Tout le script principal est dans `(function(){'use strict';…})()` (l. 9000-52804) : aucune fonction sur window, sauf `window.__mGo(id)` (52575),
   `window.__panBascule()` (52576), `window.__mHomeSur()` (52259), ~140 `window.dbg*` ; drapeaux `__setPause`, `__mRetour`, `__offGar`, `__intro`, `__gameReady`.
2. Sur un ordi, le jeu tourne dans `iframe#colonne` ; le banc émule un vrai téléphone (tactile + hover:none) donc pas d'iframe. `?simu=1` saute l'intro.
3. Le routeur des écrans (bloc `if(IS_MOBILE||?touch=1)`, l. 51797-52584, pose `body.touch`) : `mScr={home,dead,modes,set,shop,mis}` (52212), `PROF` (52223),
   `mGo` (52224), `mFill` (52319), `mTap` (52440), clics par `mHit` sur `#mob` en `click` (52519-52532).
4. L'ACCUEIL EST LE GARAGE : `mGo('home')` → `garAccueil()` (52236, 48713) → `openGarage()` + `garMode('menu')` → `body.garMenuH` (48494) ; le CSS l. 2872
   réaffiche `#overlay`/`#mHome` par-dessus la scène. Le « menu » et le « garage » sont la même scène, deux modes de `#garage`.

## A. Splash `#splash` (8528) — toucher : `launch()` (51460), 2e toucher > 600 ms : `hide()` (51659), sinon hide seul à 4,6 / 6,4 s. `#spInvite` à 900 ms.
Sortie : `cc:revele` (51710) → `mGo('home')` → `garAccueil()`.

## B. Accueil `#mHome.acc2` sur `#garage.menu` — reconstruit l. 47249-47259 et 47270-47287 ; textes des cartes par `accC6()` (52304).
Debout (CSS 7420-7429) : RÉGLAGES en haut à gauche, logo, caisse 3D, grille 2×2 de cartes de 64, JOUER pleine largeur (64, à sB+20).
Couché (7474-7483) : bloc en colonne à droite (2×184), la caisse à gauche.
- RÉGLAGES `.mGear[data-m=set]` → `mTap('set')` garage ouvert (52458) : volet, `closeGarage()`, `__mRetour='set'` ouvre `#mSet` par l'observateur (52556)
- CARRIÈRE `.mAccB[data-m=carr]` → `carrVue(null)` (52456)
- MISSIONS `.mMisBarre[data-m=mis]` → `garMissionsOuvre()` (48689) → `garMode('missions')`
- GARAGE `.mHubPorte[data-m=garage]` → volet + `garMode('boutique')` (52478) → hub replié
- OFFRES `.mOffres[data-m=shop]` → `bqVaOffres(1)` (52465, 46217) : boutique onglet OFFRES
- JOUER `.mPlay[data-m=play]` → `mTap('play')` (52443-52451) : FACILE/NORMAL au 1er JOUER puis `classiqueJouer()` ou `playViaGarage(true)` (auto-école)
Masqués : `.mIcons` (5961), `.mBadge` (7513). `#misBan` « DÉFIS RÉUSSIS ! » (52391). Aucun compteur d'argent.

## C. Réglages `#mSet.c6Page` (8877) — ouverture accueil `mGo('set')` après `closeGarage()` ; pause `setPauseOuvre()` (52241).
◀ `.c6Ret[data-m=back]` : si `__setPause` → `setPauseFerme()` (52453) ; sinon `mGo(mRoot())` (52455) → `garAccueil` (reconstruit le garage, 48717). Échap idem (52565).
Lignes (`mTap`) : SON `[data-m=snd]` + `#mVolSfx` ; MUSIQUE `[data-m=mus]` + `#mVolMus` ; VOIX `[data-m=vox]` (masquée sansVoix) ; COPIER `[data-m=exp]` → modale (52493) ;
RESTAURER `[data-m=imp]` → modale (52502) ; IMAGE `[data-m=q]` ; LANGUE `[data-m=lang]` (`langNext`+`applyLangDOM`, 52486) ; MODE FACILE `[data-m=facile]` ;
POUCE HAUT `[data-m=volh]` ; VIBRATIONS `[data-m=vib]` ; AUTO-ÉCOLE `[data-m=tuto]` (SAVE.d.tuto=0 + toast, ne lance rien, 52452) ;
ENTRER UN CODE `[data-m=code]` → modale + `codeCousin` (52508) ; EFFACER `[data-m=wipe]` → modale rouge armée 420 ms (52513) ; version `#mvVer`.
CSS : 7518-7590 (debout une colonne, couché deux colonnes).

## D. Carrière `#carr` (8750) — `carrVue(null)` (20430) → `carrVueC6(bi,el)` (20460) ; `feuilleOuvre(el,'on')`. Un seul écouteur (48866-48879) sur `data-c` :
◀ `.c6Ret` : depuis l'accueil `data-c=maison` → `hubMaison()` (47315) → clique `#gClose` → VOLET inutile ; page d'un monde `data-c=biomes` ; sinon `fermer`.
Monde `.cmMonde[data-c=biome][data-b]` → `carrVue(b)` ; niveau `.cmNiv[data-c=niveau]` → `carrLancer(b,i)` (20503) ; `verrou` secoue + toast ;
JOUER `.cmJouer[data-c=niveau]` → `carrLancer`. CSS 7602-7670 (en-tête collé, cartes qui défilent, JOUER collé en bas).

## E. Missions `#gMis` dans `#garage.missions` (8573) — `garMode('missions')` (48486), caméra qui monte (`GMIS.mk`), cartes `gmRender` (48568) → `gmRenderS` (48620).
Entrées : accueil ; carte défi `#mObj[data-m=mis]` de la fin (52457, 44117).
◀ `#gmHead .c6Ret` → `garMisRetour()` (48686) : accueil, ou hub si `GAR.misVit`. Cartes `#gmNoeuds .gmC[data-k]` (48726-48732) : défi = suivre/ne plus suivre ;
récompense = volet + `garMode('boutique')` + `garageShow(caisse)` ; « à venir » = toast. JOUER `.gmJouer` → `garJouer()` (48725). `.gmHome` masqué (7686).
CSS 7672-7741.

## G. Fenêtre d'achat € `#shPop` (JS `shopPopEl`, 29583 ; `shopPop(src)` 29612, depuis `#gBuy` 48781) : `[data-sp=oui]` (refus « BIENTÔT DISPONIBLE »),
`[data-sp=non]`, voile/Échap. Aucune règle c6.

## H. FACILE/NORMAL `facChoix()` (9046) dans `#modale.facC6` — au 1er JOUER (`SAVE.d.facile==null && !SAVE.d.tuto`) ; testé l. 52444/52446/52448/52450, 47191, 20510.
CSS 7497-7512.

## I. `modale(o)` (9052) sur `#modale` (8760) : `#modT`, `#modX`, `#modC` (zone de texte), boutons `.modB` ; le DERNIER = annuler (Échap, 52564) ; `pb-red` armé 420 ms.

## J. Fin `#mDead` (8811) — l'observateur de l'overlay (52556) → `mGo(mRoot())`, `mRoot()='dead'` (52218) ; `mFill` (52323-52384). 600 ms sourds après la mort (`mHit` 52525).
Maison `.mMenu[data-m=menu]` 48×48 → volet + `accueilRetour()` (42387) → `mGo('home')` (52461) ; REJOUER `[data-m=replay]` → volet + `resetGame` (52442),
libellé « REPRENDRE » après une auto-école quittée ; carte défi `#mObj` `data-m=mis` ou `voirRec` (52470), écrite par `objRender` (29306).
Masqués : `#mDead>.mRow` (OFFRES · RÉGLAGES, CSS 8314), `#nameEntry` (jamais : `pendingScore` jamais posé, 37250). CSS 8186-8358.

## K. Pause `#tPanel` (8964) par `#tGear` ⏸ (haut droite, sT+10) — `gearOpenHandler` → `panOpen(true)` (52086, 52056) ; P/Échap `__panBascule` ; visibilitychange.
`.tp[data-a]` (`panTapHandler`, 52087) : RECOMMENCER `reset` (modale → volet + resetGame) ; QUITTER `quit` (modale → endGame) ; SON, MUSIQUE, VOIX (masquée),
IMAGE, POUCE HAUT ; TOUS LES RÉGLAGES `tous` → `setPauseOuvre()` ; REPRENDRE `close` → 3-2-1 (52063). CSS 8360-8483 (debout feuille en bas, couché panneau centré).

## L. HUD de course + auto-école — touchables `#tGear`, `#tSteer` (bas gauche), `#tNitro`/`#tNitroZone` (bas droite), `#tLeft`/`#tRight` (mode flèches).
Colonne droite sous ⏸ (`hudColonne` 18552) : `#cashHud`, `#facVies`, `#triade`, `#airHud`, `#pwrChip` ; `#nitroWrap` haut ; `#auraV2` gauche ; `#lvlBan`, `#engPop`,
`#misFocus`, `#misBan`, `#toast` (haut centre, sT+72). Auto-école `#coach` (`tutoCarte` 29750) : PASSER `.coSkip` → `tutoPasse` (29764, deux appuis < 3 s). CSS 8121-8178.
BUG vu au banc : la carte du coach reste par-dessus la PAUSE (couché : sur le titre PAUSE) et par-dessus la page RÉGLAGES ouverte depuis la pause.

## M. Morts ou sans c6 : `#mModes` (8834, aucune porte), `#mMis` (8854), `#mShop` (8864), `#settings` (8918), `#stall` (8667), `#gInv` (8652, touche I / `dbgAtelier(1)`),
`#shPop`, `#misBan`, `#misFocus` (0 règle c6).

## 3. DOUBLONS
- Réglages : accueil `.mGear` ; pause (5 bascules + TOUS LES RÉGLAGES) ; masqués mais câblés `#gOutils [data-go=set]` (8589, 47196), `#gReglage` (8562, 48721),
  `#mDead [data-m=set]` (8831), `#settings`/`#setBtn` (47067). SON/MUSIQUE/IMAGE en double (`mTap` et `panTapHandler`).
- Boutique/OFFRES : accueil OFFRES → `bqVaOffres(1)`, ◀ → accueil (`GBQ.deAcc`, 46210) ; hub BOUTIQUE `#gShopBas` → `gModeVa('shop')` (capture, 47216), ◀ → hub ;
  onglet OFFRES `#gBqPan [data-o=off]` ; ACHETER d'une caisse € → `shopPop` ou `bqVaOffres` (48781-48784). Masqués : `#mShop`, `#mDead` OFFRES, `#gOutils [data-go=shop]`,
  `#gMenuBas .gBoutique` (48733), `#gPerso` SHOP (47168), `.fnPorte`/`gOffresPage` (43705). 2e boutique dans le code : `gShopJour`/`gShopPaye` (43707, 43727) à côté de `garBqUI` (46106).
- Missions : accueil, carte de fin ; masqués `#gvMis` (48688), `#gMisBtn` (48722), `#gHub [data-h=mis]`, `#mMis`.
- Carrière : accueil ; masqués `#gCarr`, `.gLevel`, `#gHub [data-h=carr]`, `.mIcons [data-m=carr]`.
- JOUER : 5 entrées / 4 chemins : accueil `mTap('play')` (52443-52451) ; hub `#gJouer` et missions `.gmJouer` → `garJouer` (47177, 48725) ; carrière `carrLancer` (20503) ;
  REJOUER `resetGame` (52442). FACILE/NORMAL recopié 6 fois.
- Retour à l'accueil : ◀ du hub `#gC6Ret` (clique `#gClose` caché) ; maison de la fin ; ◀ missions ; ◀ carrière (`hubMaison`) ; ◀ boutique si `deAcc`.
  Masqués : `#gHomeBas` (43920), `#gvHome` (47543), `#gHomeMini` (47375), `.gmHome`, `#gClose`.
- Inventaire ×3 : `atelierInv` (hub INVENTAIRE `#gvCof` → `gModeVa('inv')`) ; `#gInv` (touche I, ou `#gvCof` hors console, 48687) ; SEE ALL ITEMS (`tous`, 43738).
- Argent/aura : `#gCompteur`/`#gAuraC` cachés, recopiés par MutationObserver dans `#gC6Cash`/`#gC6Aura` (43907) ; `#gBqArg` (boutique) ; `#gpArg` (masqué) ; `#mCash` (fin).

## 4. LE GARAGE
Scène 3D de Léo (INTOUCHABLE) : `buildGarageRoom` (42696), `garageRender` (46657), `VITRINE_CAM` (45764), `garPorte`/`garFeu` (44471-44481), `garageGo`/`garageSaute`/
`garageShow`, BURN (47833) + `burn*` (47861-48316), `BURN_*`, `DON`/`DON_PIV`, `garageLaunch` (43400), `GATL`/`garAtelierBatir`/`garAtelierTick` (43783, 43828),
bras `ATL` (borne rouge cachée 48437), `GMIS`/`gmHoloBuild`, boutique `GBQ.grp`/`bqBio`/`garGlitch` (46652)/`garBqAmbiance` (46044), `bqOutil` (46537), `bqGeste` (46451),
`garFigEssai`, `trailApercu`, `carPhoto`. L'interface = le DOM de `#garage` (8551-8663) + `#gBq`, `#gBqBtn`, `#gRang1`, `#gRappel`, `#wipe`.
États de `#garage` : `menu` (accueil), `missions`, `quiet`/`launching`, hub `GMODE.m` (43575) : `'tout'`+`consoleCachee` = hub replié (`gGarageReplie`, 43879) ;
`'inv'`+`modeInv`+`atelierInv` = inventaire (`gAtelier(true)`, 43776) ; `'shop'`+`modeShop`+`shopRet`+`html.bqIndus` = boutique ; `'tous'` = SEE ALL ITEMS.
`vueSeule` = l'œil (`gVueSeule`, 43887) — BUG vu au banc : aucune sortie visible. `inv` = vieux `#gInv`. `vitrine`/`deplie`/`aideInv` = `?menu=leo`.
HUB : entrée `garMode('boutique')` → `gGarageReplie` (48493). En-tête `#gC6Tete` (CSS 7753-7760) : ◀ `#gC6Ret` (clique `#gClose` → volet → `garMode('menu')`, 43905, 47170),
titre GARAGE, comptes `#gC6Cash`/`#gC6Aura`. Fiche `#gCard` : `#gName`, ŒIL `#gOeil` (48, déplacé dans la fiche, 43904), `#gLvl`, `#gRarPill`, `#gDesc`, toucher = déplie (.ouvert, 48865).
Bas `#gAct` : INVENTAIRE `#gvCof` et BOUTIQUE `#gShopBas` (`gModeVa('inv'|'shop')`, capture 47216), puis JOUER `#gJouer` (`garJouer`) ou ACHETER + prix `#gEquip.achat`
(relaie vers `#gBuy` caché, 47206-47220). Jauge `#gTourne` (`gtPlace`, 47364). Gestes : glisser = tourner, pincer = zoom (52169), MAINTENIR la caisse = burn-out (aucune aide :
`#gInvAide` seulement en vitrine, 47400). Clavier ←/→ change la caisse (48946) mais `#gPrev`/`#gNext` masqués (5336).
Masqués au hub (7763, 7791, 6015, 6142, 2810) : `#gTopRow`, `#gCompteur`, `#gOutils`, `#gAuraC`, `#gVJ`, `#gPlayMain`, `#gCarr`, `#gvMis`, `#gvBranche`, `#gvLvl`, `#gvNivs`,
`#gClose`, `#gPerso`, `#gBuyRow`, `#gCache`, `#gHomeBas`, `#gRappel`, `#gTabs`, `#gRar`, `#gStrip`, `#gHub`, `#gHomeMini`, `#gMenu`. Depuis le hub : ni missions, ni carrière, ni réglages.
INVENTAIRE (`#garage.atelierInv`, CSS 7855-8020) : porte qui descend, lampe, pinces (3D). En-tête : ◀ (clique `#gvCof` caché → `gAtelier(false)` → `gGarageReplie`), INVENTAIRE, comptes.
Fiche à gauche ; plaque (à droite couché, en bas debout) : onglets `#gTabs .gTab[data-tab]` VOITURES · PEINTURE · AILES · TRAÎNÉES · FIGURES (`shopTab`, 48862) ;
grille `#gStrip .gT` : toucher = ÉQUIPE, ou ESSAIE si pas à toi (48763) ; vide : `#gC6Vide`. Pas de JOUER (`#gAct` masqué, 7886).
BOUTIQUE (`modeShop` + `html.bqIndus`, salle blanche) : depuis le hub BOUTIQUE, ou l'accueil OFFRES (onglet OFFRES). Glitch 0,72 s, la caisse flotte.
`garBqUI` (46106) pose : ◀ `#gBqRet` (`gModeVa('shop')` → hub, ou volet → accueil si `deAcc`, 46207-46211) ; `#gBqTete` BOUTIQUE + argent ; `#gBqNom` nom + rareté flottants ;
`#gBqSkins` COLORIS (une valeur ORIGINAL, `.bqS` SANS écouteur, 46163) ; `#gBqUne` CETTE SEMAINE à gauche, cartes `.bqU` → `bqEssaie` (46186) ;
`#gBqPan` : onglet `[data-o=cat]` (retouché = menu `.bqMenu [data-c]` VOITURES, PEINTURES, AILES, TRAÎNÉES, FIGURES), onglet `[data-o=off]` OFFRES, rail `.bqRail .bqK` (essayer) ;
`#gBqBtn` (bas, pleine largeur) → `bqAction()` (46232) : ACHETER + prix, ÉQUIPER, DÉSÉQUIPER, ÉQUIPÉE, À GAGNER, CHOISIS UNE OFFRE, IL TE MANQUE.
Masqués : JOUER, INVENTAIRE, `#gShopBas` (6348, 8034), la jauge (6385).
Répétitions : trois en-têtes semblables (hub, inventaire, boutique) ; le même ◀ fait trois choses ; INVENTAIRE/BOUTIQUE deviennent RETOUR (`gModeBoutons`, 43592-43595) ;
deux portes vers la boutique (OFFRES accueil, BOUTIQUE hub) aux retours différents.

## 5. ÉTATS SPÉCIAUX
Joueur neuf (`cashcarSave` vide) : intro 6,4 s ; OFFRES « NOUVEAU » ; CARRIÈRE = AURORE 1 (`carrSel` 20546) ; JOUER → FACILE/NORMAL → auto-école (`playViaGarage(true)`,
`tutoArme` 29796, `#coach`) ; carrière sans permis → AURORE + toast (20506) ; inventaire presque vide `c6Peu`/`c6VideV`. `TEST_CARRIERE=true` (20391) : tout ouvert.
Après une partie : `body.dead`, `#mDead`, `mRoot()='dead'` tant que `MENUV.retour` faux ; maison = `accueilRetour` ; REJOUER rejoue le même niveau (`CARR.actif`) ou l'auto-école.
FACILE : `SAVE.d.facile`, `#facVies` ; bascule dans RÉGLAGES (52487), absente de la pause. Auto-école : `TUTO`, `body.coOn`, `#coach.on` ; QUITTER → « AUTO-ÉCOLE INTERROMPUE »,
REJOUER devient « REPRENDRE » ; REVOIR réarme le prochain JOUER. Carrière en cours : `CARR.actif` ; le JOUER de l'accueil lance le CLASSIQUE (`SF.on`, 19286).
Anglais : `localStorage.ccLang='en'` ; `TR()` + `data-fr` (17977, `applyLangDOM`) ; `accC6` et `carrVueC6` ont leurs tables ; « SEE ALL ITEMS » en dur ; EFFACER supprime aussi `ccLang`.

## 6. OUVRIR CHAQUE ÉCRAN AU BANC
Attentes : `uiGarde` (28149) avale les clics RÉELS 320 ms après `mGo`/feuille/`garMode`/`modale`, 300 ms après `gModeVa`, 520 ms après `ecranWipe` ; le volet
(`ecranWipe`, 28099) : la main revient à 160 ms, la classe se vide à 460 ms → attendre `#wipe` sans classe + 350 ms ; fin de partie : 600 ms sourds.
Accueil `#mHome.on.acc2`, `body.garMenuH`, `#garage.menu` · Réglages : toucher `.mGear` → `#mSet.on` · Missions : `.mMisBarre` → `#garage.missions` (`window.dbgMissions()`) ·
Carrière : `.mAccB[data-m=carr]` → `#carr.on` ; monde `#carr .cmMonde[data-b=N]` · Lancer un niveau : `window.dbgCampagne(n,b)` · Hub : `.mHubPorte` →
`#garage.on.consoleCachee:not(.menu)` · Inventaire : hub `#gvCof` → `#garage.atelierInv` (~1 s) · Boutique : hub `#gShopBas` ou `.mOffres` → `html.bqIndus`
(`window.dbgBqIndus().on`), catégorie : `[data-o=cat]` ×2 puis `.bqMenu [data-c=peinture]`, `window.dbgBqVoir(i)` · Fenêtre € : OFFRES, une carte, `#gBqBtn` → `#shPop.on` ·
Œil : `#gOeil` → `#garage.vueSeule` · FACILE/NORMAL : sauvegarde neuve, `.mPlay` → `#modale.on.facC6` · Auto-école : `#coach.on`, `window.dbgTuto()`, `dbgTuto('permis')` ·
Pause : `#tGear` ou `window.__panBascule()` → `#tPanel.open` · Réglages depuis la pause : `#tPanel .tp[data-a=tous]` → `body.setPause`, `#mSet.on` ·
Fin : en course `window.dbgQuitte()` (ou `dbgFacile('mort')`) → `#mDead.on`, `body.dead` (+600 ms) · Fenêtres : réglages `[data-m=exp|imp|code|wipe]` → `#modale.on`.

## 7. LES 10 PROBLÈMES DE STRUCTURE
1. Accueil = garage (même scène) et GARAGE mène au garage ; le hub est un cul-de-sac (missions, carrière, réglages masqués : 7763, 7791, 6015).
2. Trois inventaires ; `#gvCof` a deux écouteurs contradictoires (capture `gModeVa` 47216 contre `invOuvre` 48687).
3. Trois boutiques ; OFFRES (accueil) et BOUTIQUE (hub) n'ont pas le même ◀ (`deAcc`, 46210).
4. Boutons qui changent de rôle et relais cachés : BOUTIQUE/INVENTAIRE → RETOUR (43592) ; ÉQUIPER → ACHETER relayé vers `#gBuy` caché (47206-47220) ; le ◀ clique `#gClose`/`#gvCof` masqués.
5. Réglages éclatés : `#mSet` + 5 doublons dans la pause + `#settings` + ⚙ du garage ×2 et RÉGLAGES de la fin masqués ; ouvrir les réglages détruit puis reconstruit le garage 3D.
6. Cinq JOUER, quatre chemins, FACILE/NORMAL recopié 6 fois.
7. Masse de DOM mort mais câblé (`#gMenu`, `#gHub` avec `hubVa`/`hubSync` qui tournent, `#gHomeMini`, `#gvLvl`…, `#gPrev`/`#gNext`, `#mModes`, `#mMis`, `#stall`, `#nameEntry`) ;
   COLORIS sans écouteur ; ids en double `#gTop`, `#gBottom`, `#gCard` (8588/8668, 8610/8669, 8593/8671).
8. Chemins trop longs vers missions/récompenses (carte de fin → `accueilRetour` → `openGarage` + `GAR.aMis` → `garMode('missions')`).
9. Retours incohérents (volet ou pas ; ◀ boutique ×2 destinations ; ◀ réglages ×3 ; Échap géré à 3 endroits : 52561, 48946, 29608).
10. Infos clés dispersées : pas d'argent à l'accueil ; au hub l'argent est recopié d'un compteur caché ; burn-out et rotation sans aide ; 6 drapeaux d'adresse forkent l'interface.
