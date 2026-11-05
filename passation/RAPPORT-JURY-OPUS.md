# RAPPORT DU JURY — OPUS (2026-11-05, branche `jury/opus`)

Mission : les points de niveau O de `passation/AUDIT-FINAL-2026-11-05.md` (§7.2). Branche partie de `origin/main` ea2d37b4, puis
`origin/main` du soir fusionné dedans (39d869f6 : cousin tout, révélation, forêt, menu ciel) ; un conflit (`aura-banque-contrats.js`,
l'étage) résolu en gardant les deux. **Rien n'est poussé sur `main`. `sw.js` non touché par moi** (la fusion apporte celui de main).

## LES DÉCISIONS D1 À D9 : SACHA NE LES A PAS DONNÉES

Le message de lancement ne contenait pas les décisions. J'ai appliqué **la recommandation du jury** partout, et chaque changement visible
garde l'ancien comportement derrière un `?x=ancien` (ou `?x=0`) pour que Sacha puisse revenir en arrière d'un mot :

| Décision | Appliqué (recommandation du jury) | Pour revenir |
|---|---|---|
| D1 pub dans l'app | Couper dans l'app : seconde chance GRATUITE et immédiate, pas de ×2, aucun texte PUB/AD dans `www/`. Le site garde tout. | (coupe app) |
| D2 Final Spin | Rien à coder (déclaration App Store Connect, Sacha). | — |
| D3 ACHAT en € | Masqué PARTOUT (web et app). | `?achat=ancien` |
| D4 noms IP | LE DOGE → **LE SHIBA** ; POP-TART gardé (choix de Sacha du 13/10) ; commentaires de marques purgés du livrable. | (nom) |
| D5 résolution | Déjà en place par palier (voir B-8) : **mesure à faire sur iPhone**, rien changé. | — |
| D6 sauvegarde web | Remise sur le web ; compte neuf = `?demo=1`. | `?demo=1` |
| D7 départ | 3 s de rails tant qu'on ne braque pas. | `?rails=0` |
| D8 garage | Plaque APRÈS la 1re course : fait. Rideau de flammes : **PAS fait** (voir DIR-28). | `?plaque=ancien` |
| D9 coordonnées | Rien à coder (dépôt privé ou purge, Sacha). | — |

## PAR ID

### A. Conformité App Store
| ID | État | Ce qui a été fait / pourquoi pas |
|---|---|---|
| IOS-04 / DIR-29 | **FAIT** | `EN_APP` (= `window.Capacitor`, `?app=1` au banc ; ⚠ PAS `TEL_NATIF`, vrai aussi dans Safari iPhone = le site) : `PUBR.sans`, seconde chance annoncée GRATUIT, `DBL.on=false`. `preparer-www.js` retire 8 textes PUB/AD et **refuse** toute chaîne contenant le mot PUB ou AD dans `www/` (contrôle à chaque fabrication). CSS de ceinture dans `mort-flottante.css` (`html.ccApp`). |
| ECO-08 | **FAIT** | Le ×2 double `commitExploits._vire` (le virement de la course) et plus la prime de série ; `?double=ancien`. ⚠ L'animation du grand chiffre (`mobile-tactile.js`, hors zone) monte de v à 2v avec v = virement seul : écart d'affichage de la prime de série (150-600 $) pendant 0,9 s, le solde est juste. |
| INT-01 / INT-20 | **FAIT** | `ACHAT_EUR` (faux) : style `#sansAchat` (tuile, `#mShop`, BOUTIQUE du bas du garage, porte des offres), rayon `achat` retiré de `BQ_CATS` (et sa pastille avec), `gOffresPage` inerte. `shopPaye` intact. |
| ECO-05 / 15 / 16 | **FAIT** | `equippedCar()`, l'étage (`ex.floor`, dans `carUnlockedVrai` ET `m2CarAMoi`), `bqA`, `garEquipeCaisse`, le lot « toutes » (`m2Col` : caisses en € et peintures en € non possédées) ignorent l'€. |
| IOS-10 | **FAIT — À VÉRIFIER SUR MAC** | `IPHONEOS_DEPLOYMENT_TARGET = 16.4` (×4), `Package.swift` `.iOS("16.4")` (⚠ `cap sync` peut le réécrire : sans gravité). `LISEZ-MOI.md` documenté. Fiche App Store : « iOS 16.4 » à écrire (Sonnet / Sacha). |
| SON-04 | **FAIT — À VÉRIFIER SUR IPHONE** | `AppDelegate.swift` : `AVAudioSession.setCategory(.playback)` au lancement ; le JS (`musicSession`) garde la main sur iOS 17+. Test : iPhone en silencieux → le son joue. |
| IOS-07 | **FAIT** | `creatures/` dans `GARDE` + détection des chargements par programme (`new Worker('…')`, `fetch('…')`, `script('…')`) : a aussi trouvé **`musique-moteur.json` et `musique-paliers.js` (la musique de course Pouce bleu) qui manquaient à l'app**. Un Worker introuvable arrête la fabrication. |
| IOS-11 / SON-01 / SON-07 / ECO-17 | **FAIT** | `preparer-www.js` applique les outils du site : `outils/retraits-publies.cjs` (NOUVEAU, la liste des retraits d'audio d'atelier, partagée avec `vercel-build.sh` — équivalence vérifiée fichier par fichier sur une copie), `scinde-banque`, `publie-audio`, `publie-allege`. **103,6 → 47,0 Mo.** La page est relue par `garde-demarrage.cjs` avant et après (une de mes coupes cassait la syntaxe et `publie-allege` la gardait en silence : c'est maintenant impossible). Marques (Ferrari, Batman, Kellogg, McQueen, Lamborghini, Cybertruck, Rolls) refusées dans le texte livré : 0. Restent des **identifiants** internes `nyan`, `simpson`, `poptart` (clés de sauvegarde, jamais affichées) et le nom CHAT POP-TART (choix de Sacha). |
| IOS-26 | **FAIT** | `CITE` ne lit plus que la page, `pouce-bleu-jeu.js` et `musique-bus.js` (`CHARGEURS`). |
| IOS-32 | **FAIT** | `vercel-build.sh` lance `node app-ios/preparer-www.js --essai "VERSION PRINCIPALE"` après la garde du démarrage (`GARDE_APP=0` la coupe en urgence). `--essai` sans dossier = le jeu du dépôt. **Passe sur le `main` du soir fusionné** (47,0 Mo, 0 adresse réseau). Coût Vercel : ~10-15 s de plus. |
| ECO-01 | **FAIT (aussi)** | `LE CHARGEUR` compté 14 (Sonnet fait la même ligne au jour 0 : fusion identique). Coupes recalées au passage : peintures en € (nuancier v3 du 5/11), code COUSIN (« cousin tout » du 5/11). |
| D4 | **FAIT** | LE DOGE → LE SHIBA (nom, phrase FR/EN, I18N dans `gamme-6.js`, récompense de la mission `rejoue10` dans `table.js`, `FEUX_SAUF` dans `feux-led.js`). Index inchangé ; la sauvegarde pointe par index. Le nom n'était clé de sauvegarde nulle part. |
| IOS-19 | **FAIT (doc)** | `natifMin` = `MARKETING_VERSION` et l'app compare la version marketing : règle écrite dans `LISEZ-MOI.md` (« chaque envoi natif monte MARKETING_VERSION »). La comparaison elle-même est dans les lignes de mise à jour de `natif.js` (Fable) : non touchée. |
| IOS-20 | **FAIT — À VÉRIFIER SUR IPHONE** | `launchAutoHide:false`, `launchShowDuration` 30 000 ; `natif.js` cache l'écran à `DOMContentLoaded` (après le grand script) + filet à 30 s. |
| IOS-21 | **FAIT — À VÉRIFIER SUR IPHONE** | `prefersHomeIndicatorAutoHidden = true` dans `JeuViewController.swift`. |

### B. Téléphone = optimisé
| ID | État | |
|---|---|---|
| D5 / DIR-03 | **PAS CHANGÉ — À MESURER SUR IPHONE** | Le code fait déjà ce que D5 demande : palier 2 (iPhone 12 et après) part en NETTE (`qNetDefaut=[0,0,1]`) → `DPR_CAP = dprNetCap = 1,5` ; sous charge l'échelle QL descend à `dprNetBas = 1` ; au menu/garage la vitrine monte à ~2 (`vhdPx` 1,4 M). **Mesuré au banc** (iPhone émulé 390×844 ×3, compte neuf) : palier 2, `q:'net'`, accueil `curDPR` 2,06 (vitrine), course `curDPR` 1,5 = `cap` pendant 24 s, aucun cran perdu. Le « DPR 1 » du jury venait d'un autre état du banc (palier ou sauvegarde) : à confirmer sur un vrai iPhone avec `dbgNette()` (palier, q, cap, dpr) et `?perf=1`. Seul doute : `soleil-planete.js:321` (Fable) remet `DPR_CAP` à 1 sous ALLEGE quand le zoom change en `?simu=1` — sans effet hors simulateur. |
| RND-05 | **FAIT** | Sous ALLEGE (WebGL2) la sonde attend la puce par `fenceSync` relu toutes les ~2 ms, plus de `readPixels` bloquant ; l'ordi garde l'ancienne ; `?sonde=ancien`, `dbgBarriere()`. |
| RND-06 | **FAIT (en partie)** | 4 étages de halo au lieu de 5 sous ALLEGE (palier 2) ; `?post=ancien`. FXAA en demi-cible : PAS fait (shader à reprendre, risque visuel). |
| RND-12 | **PAS FAIT** | `biomes.js` attend le feu vert « Arrakis a committé » de Sacha (non reçu). |
| RND-07 / 09 / 11 | **PAS FAIT** | Temps. |
| DIR-07 | **FAIT — À VÉRIFIER SUR ORDI** | La page-cadre (`CC_COLONNE`) écrit un `<plaintext hidden>` au début du `<body>` : tout le reste du document devient un texte inerte (ni three.js, ni banque de sons, ni grand script dans le cadre). Le boîtier, l'iframe et les boutons sont tous construits par le `<head>`. `?cadre=ancien`. |

### C. Économie et missions
| ID | État | |
|---|---|---|
| ECO-06 | **FAIT** | `km100k` = 10 000 km (`table.js`, valeur seule ; Sonnet y touche les textes). |
| ECO-23 | **FAIT** | Ailes ENGRENAGES 10 M → 4 M, AILES EN X 12 → 4,2, FÉE 16 → 4,5, DRAGON 45 → 4,8, SANS AILES 50 → 5 M (ordre gardé, plafond 5 M). Aux yeux de Sacha : c'est un choix de prix. |
| DIR-08 | **FAIT (météo) / À CONFIRMER (+180 k)** | Cause trouvée : `m2Meteo` prend la MEILLEURE map en proportion, et EN ORBITE n'a qu'un temps (matin) : 1 partie en orbite = 1/1 = mission réussie. Correction : seules les maps à ≥ 3 temps comptent ; `?meteo=ancien`. Les +180 000 $ : pas reproduits ici ; journal posé (`?journal=banque` en DEV : chaque écriture de `SAVE.d.bank` avec l'écran et la pile, et chaque temps gagné ; `dbgBanque()`). Piste la plus probable : récompenses de missions récupérées pendant la navigation (dont la STRATOS de cette mission fautive). |
| D6 | **FAIT** | `SAVE.neuf` seulement avec `?demo=1` (`sauvegarde.js`, une ligne). `?garde=1` ne sert plus. |
| HYG-10 | **FAIT (dans ma zone)** | `DEV` (= hôte local / réseau privé / fichier, ou `?dev=…`) et `qDev()` dans `icones-fenetre.js`. Conditionnés : `?pub=0`, `?chance=0`, `?spin=0`, `?lecon=non`, `?eco=ancien`. Hors zone, à faire par leurs propriétaires avec `qDev(/…/)` : `?cadeau=1` (`son/mute-cadeau.js`, Fable), `?carte=` / `?niveau=` (`maps/niveaux.js` et ~15 fichiers de maps), `?simu=1` (`rendu/soleil-planete.js`, Fable). `?garde=1` est devenu inutile (D6). |

### D. États d'interface
| ID | État | |
|---|---|---|
| INT-02 | **FAIT — À VÉRIFIER (VoiceOver)** | `#overlay` : `role="region"`, plus de `tabindex` (aucun clic n'y lançait rien). |
| INT-05 | **FAIT** | Mission réussie : 1er toucher arme (« TOUCHE ENCORE POUR RETIRER »), 2e dans les 3 s retire ; mission en cours : toucher neutre (plus le son du refus). `?retire=ancien`. |
| INT-06 / DIR-45 | **FAIT** | « TOUCHE » sous la boule, 2 s après qu'elle est prête ; seuil de glissement 12 → 32 px. `?touche=ancien`, `?glisse=ancien`. |
| INT-08 | **FAIT — À VÉRIFIER SUR IPHONE** | `#modale` à champ posée sur `visualViewport` quand le clavier mange > 90 px ; `?modclavier=0`. |
| INT-16 | **PAS FAIT** | Un RETOUR en bas à gauche du tiroir d'inventaire demande du CSS dans `garage-hub-bas.css` / `garage-accueil.css` (zone Sonnet). À faire ensemble : bouton `.pbtn` RETOUR en pied de `#gInv`, qui appelle `invFerme()`. |
| INT-26 | **FAIT** | `estCouche()` (la requête du CSS) lue par `missions/atelier.js` et `hud-figures.js` ; `?couche=ancien`. |
| INT-40 | **FAIT** | Au doigt (`TEL_NATIF`) VOL INVERSÉ disparaît et son choix est replié dans POUCE HAUT (même sens) ; l'ordi le garde (seul réglage du clavier). `?volinv=ancien`. |
| DIR-04 | **FAIT** | Le libellé INVENTAIRE repasse par `TR()` à chaque retour (il était figé dans la langue de la 1re visite). |
| DIR-26 | **FAIT** | La pastille du GARAGE = un panier (le nombre reste pour VoiceOver) ; `?pastille=ancien`. ⚠ ligne 819 de `mobile-tactile.js` (Sonnet n'y touche que la 771). |
| DIR-36 | **FAIT** | Toucher `#gCard` ouvre la boutique (rayon VOITURES) sur la caisse ; `?gcard=ancien`. |
| DIR-09 / D7 | **FAIT** | 3 s de rails (écart, cap, vitesse latérale ramenés sur l'axe) tant que le joueur ne braque pas ; tenus dans `frTick` (`figures-route.js`), posés par `resetGame`. `?rails=0`, `dbgRails()`. |
| DIR-28 (D8) | **PAS FAIT, volontairement** | Le rideau de flammes est un choix explicite de Léo (« enlève la porte, remets des flammes », 4/10) ; sans décision de Sacha, je ne l'annule pas. |
| DIR-46 (D8) | **FAIT** | La plaque se choisit après la 1re course (`plaque.js`, `plqVeut`) ; `?plaque=ancien`. |
| DIR-30 | **FAIT** | Verrou entre onglets : jeton `sessionStorage`, `localStorage.ccOngletActif`, événement `storage` ; le dernier ouvert sauvegarde, les autres passent en lecture seule et le disent ; pas dans l'app ; `?onglets=ancien`, `dbgOnglet()`. ⚠ Un banc qui ouvre deux pages du jeu dans le même navigateur verra la première passer en lecture seule. |
| GP-03 | **FAIT** | `frFin` ne rend le nitro que si une figure a été plantée ; `?figrend=ancien`. |
| GP-04 | **FAIT** | Seconde chance et chute sous bouclier : au plus loin de `safeS` ou de la mort − 40 m (`chanceSafe`) ; `?reprise=ancien`. Le `safeS` « temporel » lui-même s'écrit dans `boucle-2-conduite.js` (Fable) : non touché. |
| GP-05 | **PAS FAIT (hors zone)** | Le filet NaN est le `catch` de `boucle-6-hud.js:125`, que Fable réécrit (GP-01) : à faire là, `fallPos`/`fallVel`/`carGroup.position` compris. |
| GP-17 / 21 / 30 / 35 | **PAS FAIT** | Temps. |
| INT-27 | **PAS FAIT (sacrifié)** | Mettre `mort-flottante.css` dans un `@layer` le ferait perdre contre tout le CSS non couché (il gagne aujourd'hui par `!important`) : à faire seulement quand tout le CSS passe en couches. |

## VÉRIFICATIONS

**Gardes (tête de branche, après la fusion de `origin/main`)** : `node code/assembler.cjs --verifier` ✔ (254 morceaux) ·
`bash garde-allege.sh` ✔ · `node outils/garde-demarrage.cjs` ✔ (22 scripts) · `sh garde-burnout.sh` ✔ · `sh garde-charte.sh` ✔ ·
`node app-ios/preparer-www.js --essai` ✔ (530 fichiers, 47,0 Mo, 0 adresse réseau, 0 texte PUB/AD, 0 marque).

**Navigateur** (Playwright, contexte iPhone 390×844 tactile ; deux passes par un sous-agent Sonnet, puis moi pour les deux défauts) :
- Bloc A, web `?tel=1` : tuile ACHAT et BOUTIQUE en € cachées, rangée de l'accueil sans trou, rayon ACHAT absent, aucun « € » ni ACHETER en €,
  écran de mort « CONTINUER ▶ PUB » et ×2 (voulu sur le site). `?app=1` : GRATUIT, pas de ×2, reprise immédiate, `#pubR` jamais créé.
  Édition app générée (`?app=1`) : course, mort GRATUIT, `musique-moteur.json` chargé, aucun PUB/AD/€ visible. LE SHIBA / THE SHIBA au garage.
- Blocs B-D : « TOUCHE » sous la boule à ~10 s, 1 toucher lance le film ; plaque pas avant la 1re course puis **~3 s après le retour à
  l'accueil** ; rails : 2,88 s au départ de la 1re course, décompte 3 → 0 en ~3 s, caisse vivante ; EN : « INVENTORY » au garage depuis la mort ;
  `#gCard` ouvre la boutique sur la caisse ; pastille GARAGE = panier (aria « 8 à ta portée ») ; mission réussie : 1er toucher « TOUCHE ENCORE
  POUR RETIRER », 2e la retire ; réglages : POUCE HAUT seul ; deux onglets : le 1er passe en lecture seule avec son message ; page-cadre
  d'ordinateur : 3 scripts au lieu de 22, `THREE` absent du cadre, 5 ressources dont ~14 Ko hors iframe (contre 18), PORTRAIT tourne le cadre.
- **0 erreur console** sur le web (téléphone et ordi) et dans l'édition app. Seuls 404 : `sw.js` et `version.json` dans l'édition app servie
  par un serveur local (normal : l'app n'a ni l'un ni l'autre, et le jeu ne les demande pas sous Capacitor).
- Défauts trouvés au banc et corrigés : les rails ne s'armaient pas à la 1re partie (posés seulement par `resetGame`) → armés par `chanceRaz` ;
  la guette de la plaque s'arrêtait pour toujours avant la 1re course → elle patiente. Revérifiés.
- Vu, pas à moi : « RARES » non traduit en EN (DIR-05, Sonnet) ; sur l'écran de mort, la pastille GARAGE affiche encore un nombre nu (autre
  élément que `#bdGar`, `mobile-tactile.js` l.750 `bdGar2` : à aligner sur DIR-26). Au banc, `navigator.webdriver` coupe la plaque (voulu).

**À VÉRIFIER SUR IPHONE (le jour Mac, une ligne chacun)** :
1. Xcode compile avec la cible 16.4 (`AppDelegate` importe `AVFoundation`) ; `npx cap sync ios` ne casse rien.
2. Interrupteur silencieux enclenché : la musique et les sons jouent (SON-04).
3. Lancement à froid : l'écran natif reste jusqu'au jeu, pas de fond violet nu (IOS-20) ; l'indicateur d'accueil s'efface (IOS-21).
4. Écran de mort : CONTINUER dit GRATUIT et reprend tout de suite ; pas de ×2 ; nulle part « PUB » ni « AD » (IOS-04).
5. Jade : les singes et dauphins apparaissent (Worker `creatures/atelier.js`, IOS-07) ; la musique de course joue (`musique-moteur.json`).
6. ENTRER UN CODE : le clavier ne cache plus VALIDER / ANNULER (INT-08).
7. VoiceOver sur l'accueil : chaque bouton du menu se lit séparément (INT-02).
8. `dbgNette()` en course sur un iPhone 12-15 : `cap` 1,5 ; `dbgBarriere()` : `barriere:true`, et `dbgSonde(1)` rend des mesures (RND-05).

## FICHIERS TOUCHÉS

- **app-ios/** : `preparer-www.js`, `natif/natif.js` (§5 écran de lancement seulement), `capacitor.config.json`, `LISEZ-MOI.md`,
  `ios/App/App/AppDelegate.swift`, `ios/App/App/JeuViewController.swift`, `ios/App/App.xcodeproj/project.pbxproj`, `ios/App/CapApp-SPM/Package.swift`.
- **outils/** : `retraits-publies.cjs` (nouveau). **Racine** : `vercel-build.sh`.
- **code/** : `interface/icones-fenetre.js` (EN_APP, DEV, qDev, ACHAT_EUR, estCouche), `gameplay/seconde-chance.js`, `css/mort-flottante.css`,
  `economie/` (`achat-carte-moteur.js`, `boutique-du-jour.js`, `boutique.js`, `final-spin.js`, `eco-vague3.js`), `interface/` (`boutique-scene-1.js`,
  `garage-lacher.js`, `garage-menu-inventaire.js`, `hud-figures.js`), `missions/` (`defis-moteur.js`, `ecran-revelation.js`, `atelier.js`, `table.js`),
  `gameplay/figures-route.js`, `rendu/nettete-qualite.js`, `rendu/triptyque-bloom.js`, `moteur/intro-161.js`, `page/debut-corps.html`, `page/ecrans-menus.html`.
- **Hors de ma zone, une ligne chacun, nécessaires** (à signaler aux fusions) : `economie/aura-banque-contrats.js` l.102 (étage sans €, à côté
  du « cousin tout » de main ; Sonnet touche la l.93 TEST_CAISSES), `sauvegarde.js` (ligne `neuf:` de D6, zone Fable), `voitures/plaque.js`
  (`plqVeut`, DIR-46), `voitures/feux-led.js` (`FEUX_SAUF`, renommage), `voitures/gamme-6.js` (I18N du SHIBA, en fin de fichier),
  `moteur/mobile-tactile.js` l.819 (DIR-26), `missions/table.js` (valeur de `km100k` et récompense `LE SHIBA` de `rejoue10`).

### Lignes de `cars.js` (pour Sonnet)
- l.182-183 : un commentaire de deux lignes ajouté AVANT la fiche (aucune entrée de `CARS` insérée ni retirée) ;
- l.184 : `name:'LE DOGE'` → `name:'LE SHIBA'` ; l.186 : `desc:` → « Une grosse tête de chien sur quatre roues. Il te regarde de côté, et il a raison. »
- `rar`, prix, index : non touchés.

### Lignes de `natif.js` (pour Fable)
- §5 (l.75-80) : commentaire réécrit et `setTimeout(cache,30000);` ajouté. Rien dans la partie 7 (notify, ban, mise à jour).

## LAISSÉ AUX AUTRES
- **Sonnet** : clés I18N mortes « LE DOGE » et sa phrase dans `traductions.js` ; fiche App Store « iOS 16.4 » et « pas de publicité » cohérente avec D1 ;
  INT-16 (CSS du RETOUR de l'inventaire) ; une règle CSS pour `.m2Arme` (la mission armée, INT-05) si on veut la voir en plus du toast.
- **Fable** : GP-05 (filet NaN dans `boucle-6-hud.js`), `safeS` temporel dans `boucle-2-conduite.js` (GP-04 complet), `?cadeau=1` et `?simu=1` en
  `qDev`, RND-12 avec le feu vert Arrakis si Fable passe dans `biomes.js`.
- **Propriétaires des maps** : `?carte=` / `?niveau=` en `qDev`.
- **Sacha** : D1-D9 à confirmer (tout est réversible par `?x=ancien`) ; D5 à mesurer sur iPhone ; DIR-28.
