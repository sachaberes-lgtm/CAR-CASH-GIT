# Carte : la cadence et le gouverneur de chaleur (lecture seule, 14/11, worktree qualite = origin/main v1596)

Fichiers lus : `code/moteur/cadence.js`, `code/moteur/gouverneur-thermique.js`, `code/moteur/gouverneur-paliers.js`,
`code/moteur/mobh-regime-chaud.js`, `code/moteur/poste-juge.js`, `code/moteur/boucle-1.js` (lignes de tête et règle QL),
`code/rendu/palier-appareil.js` (détection), `code/rendu/nettete-qualite.js` (QLR, imgRegle, qlPose, sondeFluide),
`code/rendu/stries-vent.js` (emiK), `code/rendu/loupe-caisse.js:37-39`, `app-ios/ios/App/App/JeuViewController.swift` (GardeThermique).
Rien n'a été lancé (ni navigateur, ni téléphone) : tout ce qui suit est lu dans le code ; les « MESURÉ » cités sont ceux des commentaires.

---

## 1. Réponse courte : à combien tourne la course sur iPhone dans l'app ?

**30 images/s, sur TOUS les iPhone 12 et plus, dès la première image de course, froid ou chaud. 20 i/s à l'état « critical ».**
Jamais 60 en course dans l'app aujourd'hui (sauf paramètre de banc), jamais 120.

Chaîne qui le décide :

1. `PAL.n===2` (palier RÉCENT) pour tout modèle `iPhone13,x` et plus — `rendu/palier-appareil.js:64-65,69` : `{n:g<=10?0:g<=12?1:2}`.
   iPhone 13 Pro (`iPhone14,2`), 15 (`iPhone15,4`), 17 (`iPhone18,x`) → tous `PAL.n=2`. Le modèle vient de `window.__ccAppareil`,
   injecté au début du document par `JeuViewController.swift:33`.
2. `CAD30_REC = TEL_NATIF && PAL.n===2 && !?cad30=0` (`cadence.js:38`) → `CAD.ok=1` (`cadence.js:39`) → `cadSaute` tourne (`boucle-1.js:7`).
3. `MOB_GOUV = CAD30_REC && !?mob_gouv=0` (`gouverneur-thermique.js:25`).
4. `mobChaud()` (`gouverneur-thermique.js:69`) :
   `MOB_GOUV && (MOB_S.capteur ? (MOB_FROID30 || thermo>=(MOB_FAIR30?1:2) || MOB_S.actif) : (MOB_G.g30 || thermo>=2 || MOB_S.actif))`.
   - Avec le capteur iOS : `MOB_FROID30` (`:68`, défaut VRAI, « CALÉ SUR 30 DÈS LE DÉPART, MÊME FROID », 13/11, Sacha : « réduire la chaleur au max pour l'instant ») ⇒ **toujours vrai**.
   - Avant que le capteur ait parlé : `MOB_G.g30` (`:26`, défaut VRAI, « LE 30 DÈS LE DÉPART, PAR DÉFAUT », 07/11) ⇒ **toujours vrai** aussi.
     (`__ccThermique` n'est PAS dans le script injecté au début du document, `JeuViewController.swift:33` ; il arrive par `envoie()` après chargement, `:455-460`, puis toutes les 5 s.)
5. `cadFin` (`cadence.js:88-89`) : au départ de course, `mobChaud()` ⇒ `cadPose(true)` ; `:97` : tant que `mobChaud()`, la sortie réactive (retour à 60) ne joue jamais.
6. `cadPer()` (`cadence.js:74-76`) : `CAD.per = 1000/30` ; **50 ms (20 i/s)** si `CAD_CRIT20` (`:73`, TEL_NATIF, `?sans=crit20` pour couper) et `MOB_S.capteur && MOB_S.thermo>=3`.

Plafond 60 (hors calage) : `FPS_CAP` (`cadence.js:41`, `?fps=0` coupe) + `fpsSaute` (`:50-55`) saute 1 image d'écran sur n, n=⌊Hz/60+0,2⌋ :
un écran 120 Hz donnerait 60. Côté natif, je n'ai trouvé AUCUNE clé `CADisableMinimumFrameDuration` / `preferredFramesPerSecond` dans
`app-ios/ios` ni `app-ios/natif` (grep vide) : rAF du WKWebView probablement à 60 sur ProMotion (non vérifié sur appareil). 120 n'est donc
visé nulle part.

Le calage est « en temps » (`cadSaute`, `cadence.js:62-67`) : on saute le rAF tant que `now-CAD.der < cadPer()-CAD.tol` ; une image sautée
ne fait rien, le `dt` suivant vaut ~33 ms (borné à 50). La simulation est inchangée.

Interrupteurs pour REVENIR à 60 sur iPhone (banc) :
- `?mob_froid30=0` → 60 à froid (nominal), 30 dès « fair » (`MOB_FAIR30`, `?mob_fair30=0` = 30 à serious seulement).
- `?mob_gouv=0` → plus de gouverneur ; reste la cadence réactive `CAD30_REC` (30 si p75 > 19 ms pendant 2 s).
- `?cad30=0` → plus de cadence du tout au palier 2 (60 haché si ça ne tient pas).
- `?mob_g30=0` → sans capteur : ancien modèle de dose (calage à 160 ou 50).
- `?cadfps=20|24` → impose 20/24 i/s à tout état (essai watts). `?sans=crit20` → critical à 30 au lieu de 20.
- `dbgCadence(30|60|0)` force / coupe et fige / rend la main (`cadence.js:158`).

Hors course (menus) : `hcSaute` (`cadence.js:168-183`) : `PFR_ON` (`nettete-qualite.js:204`, TEL_NATIF, `?frais=0`) ⇒ accueil/garage/boutique
à 30 i/s, 60 sous le doigt ou pendant une transition (`hcGeste`, `transUI`, `:223-227`) ; 15 i/s au repos seulement si `critical` ou
> 1 min sans geste (`ACC30`, `ACC30_CHAUD`, `accFrais`, `:207-216`) ; pause 10 i/s puis 2 i/s après 2 s (`PAUSE_FROIDE`, `:177`) ;
écran de mort : règle des menus 3,5 s après la mort (`HC_FROID`). `?menu=max`, `?repos=0`, `?hc=0`, `?sans=calmefroid|pausefroide|acc30|acc30chaud|bande30|transcad`.

---

## 2. Ce que chaque état thermique iOS retire à l'image (avec capteur, cas de l'app)

Source du capteur : `GardeThermique` (`JeuViewController.swift:372-460`) envoie `ProcessInfo.thermalState` (0..3) par
`CustomEvent('cc:thermique',{detail:{etat}})` + `window.__ccThermique`, au lancement, à chaque changement et toutes les 5 s
(tolérance 1 s). Reçu par `mobThermo(n)` (`gouverneur-thermique.js:85-93`, écouteur `:112-114`, seulement si `MOB_GOUV`).
1re parole : `MOB_S.capteur=true`, `MOB_S.neuf=true` → le palier tombe d'un coup sur l'état réel (`gouverneur-paliers.js:77`).
`?thermo=modele` = ignorer le capteur.

Le palier d'image = `mobPalCible()` (`gouverneur-paliers.js:50`) ; table `MOB_PN` (`:34`, avec `MOB_LONG.on`, `?mob_long=0` = table à 4) ;
posé en UN appel `imgRegle(o)` (`mobPalApplique`, `:60-66`) qui part de `MOB_P0={halo:'demi',mips:3,ombre:768,ciel:0,stries:null}` (`:37`)
+ `dpr: mobPalCapJoueur()` (= `dprPlafond(fast)`, donc 1,25 en NETTE via `PAL.B.imgDprCap[2]=1.25`, `palier-appareil.js:251`).

| Palier | Quand (capteur) | Cadence | Image retirée en plus du départ P2 |
|---|---|---|---|
| 0 | nominal | 30 (MOB_FROID30) | rien : `imgRegle('reset')` = départ statique P2 (halo ½ résolution `imgBloomRes`, 3 mips, ombre 768, DPR 1,25, échelle QL départ cran 1 `imgQlDepart`) |
| 1 | fair | 30 | halo ½ à **2 mips**, **ombre 512**, `qlMin` ≥ 3 (l'échelle QL ne remonte pas sous le cran 3 : ombre 768/512, halo ¾) |
| 2 | serious | 30 | **halo coupé**, ombre 512, ciel lisse 1 image sur 4, traits d'air et traînées ×½ (`stries:.5`), `ventK`/`emiK` ×½ (`k:.5`), `qlMin` = cran max (kMax : bloom éteint, flou radial coupé). Résolution INTACTE. + `mobhChaud()` vrai (régime chaud), polyphonie des bruitages réduite (`__ccPoly`, `:18-21`), loupe de la caisse coupée (voir §6) |
| 3 | serious depuis `MOB_LONG.s`=150 s de COURSE cumulées (`MOB_LONG.n`, remis à 0 dès fair) | 30 | + **plafond DPR 1,1**, ciel 1 image sur 8 |
| 4 | critical, OU serious ET branché (`mobBranche()` : `__ccBranche>=2`, `MOB_CHARGE`, `?sans=chargechaud`) | **20** si critical (`CAD_CRIT20`), 30 si serious branché | **plafond DPR 0,85**, idem 3 ; à critical en plus `qlPose(QL.k+1)` une fois par épisode (`mobThermo`, `:92`) |

Montée immédiate, descente lente : un palier à la fois, 60 s après le dernier changement (`mobPalTick`, `gouverneur-paliers.js:78-79`).
Exception : 1re parole du capteur (saut direct).

Exceptions « la voiture et les traînées PARFAITES » (13/11, `rendu/stries-vent.js:18-30`, `GFX_PLEIN`, `?sans=feuplein`) : les flammes
des pots / jets gardent `EMI_K0` (émission du PALIER DE L'APPAREIL, 1 au palier 2) au lieu de l'`emiK` du gouverneur, le feu de pixels
du nitro garde sa densité, les traînées POP la densité de l'ordinateur. Restent pilotés par la chaleur : traits d'air, fumée de drift,
vent, halo, résolution.

Autres lecteurs de l'état (hors de ce sous-système, à connaître) : `piste-prebati.js:99` `gpuChaud()` (serious+ : allègements rail /
nuages), `son/graphe-audio.js:249` (son chaud), `interface/bouton-nitro-gains.js:319` (carte de mort), `maps/canyon-relief.js:133`
(détail du canyon — maps, ne pas toucher), `rendu/ciel2.js:254-269`, `voitures/nitro-feu.js:196,208`, `gameplay/boost-depart.js`,
`interface/boost-icones.js` (via `mobhChaud()`).

Le RÉGIME CHAUD `mobhChaud()` (`mobh-regime-chaud.js:12`) : avec capteur = `thermo>=2` ; réglages `MOBH_R={vent:.7,ventPas:2,ventCap:.14,feu:.6,nx3Ms:66,engMs:100}` :
vent ×0,7 et redessiné 1 image sur 2, feu nitro ×0,6 (sauf GFX_PLEIN), éclair du bouton NITRO ≥ 66 ms, carte moteur ≥ 100 ms.
`?mobh_chaud=0|1`, `?gouv=max` = ni paliers ni régime chaud (`MOB_PALS`, `gouverneur-paliers.js:17`).

Sans capteur (Safari, `?thermo=modele`) : la DOSE `MOB_S.D` (secondes équivalentes de course à 60 : +1/s course à 60, +0,5 calée,
+0,3 menu, −0,25 repos ; seuils `MOB_G.haut`160 / `bas`40 / `tiede`50 / `max`230 ; gardée 10 min dans `localStorage.cashcarMobGouv`)
pose les paliers `MOB_PP` (`gouverneur-paliers.js:22`) : ≥60 DPR 1,1 + halo ½ 2 mips ; ≥100 DPR 1,0 halo coupé ombre 512… ; ≥140 DPR 0,8.
Avec capteur, la dose est encore COMPTÉE (banc) mais ne décide plus rien (`mobGouvEval`, `:41`) — sauf le blocage de la remontée (§4).

---

## 3. Le mode économie d'énergie

- Natif : `ProcessInfo.isLowPowerModeEnabled` → `window.__ccEco` (injecté au début, `JeuViewController.swift:23,33`, et toutes les 5 s, `:456-460` ;
  notification `NSProcessInfoPowerStateDidChange`, `:396`). iOS bride alors l'écran du WKWebView à 30 Hz.
- Jeu : `cadSaute` (`cadence.js:65`) mesure la médiane des intervalles d'écran sur 90 rAF (`MOB_ECRAN`, `?mob_ecran=0` = ancien minimum).
  Si médiane ≥ 24 ms (`CAD_E30`, `?cad_e30=0`) : tolérance = ½ période de 30 (16,7 ms) — plus rien ne se saute ; et
  `CAD.eco = m>=24 && (__ccEco===1 || ?eco=1)`.
- Effets de `CAD.eco` : la durée lue par la règle QL est ramenée à une image d'écran (`ms9`, `boucle-1.js:27`) ; l'échelle QL peut remonter
  sur `p75<19` (`boucle-1.js:121`) ; `cadPose` ne gèle pas l'échelle en éco (`cadence.js:77`) **sauf téléphone chaud** — or avec
  `MOB_FROID30`, `mobChaud()` est toujours vrai, donc `CAD.gel` reste vrai (`cadence.js:85`) : en pratique l'éco ne change rien à la
  remontée aujourd'hui (déduit du code, non vérifié).
- Aucun palier d'image n'est retiré PAR l'éco. Le wattmètre (`WATT`, `gouverneur-thermique.js:100-111`, `dbgWatt()`) note « éco » dans ses lignes.

---

## 4. La REMONTÉE quand le téléphone a de la marge (MOB_R) : ÉTEINTE

`MOB_R={on:/[?&]mob_raise=1\b/,frais:40,fen:60,wMed:12,wMax:16,p75:19,mal:5}` (`gouverneur-paliers.js:39`). **Inactive par défaut** depuis le
07/11 soir. Raison écrite (`:15`) : « build 13, 15 gels > 1 s en course, hypothèse = les bascules réallouent les cibles ». Hypothèse
jamais confirmée dans le code (non vérifié par moi non plus).

Ce qu'elle ferait (`mobPalTick`, `:81-88`, crans `MOB_RA`, `:38`) : téléphone en course, 60 s d'affilée « sain » (médiane `CAD.w` < 12 ms,
max < 16, `QLR.p75 ≤ 19`) → palier −1 = `dpr:'cap'` = `min(devicePixelRatio, dprNetCap=1.5)` (`mobPalCapPlein`, `:54`) ; encore 60 s → −2 =
+ halo plein (`'tout'`), 5 mips, ombre 1024. Retombe au palier 0 après 5 s de mal (`MOB_R.mal`) et ne revient pas dans la course (`MOB_P.non`).

Pièges si on la rallume :
- Condition de blocage `:86` : `MOB_S.D>=MOB_R.frais` (40) bloque même AVEC capteur. Or la dose continue de monter (+0,5/s de course calée,
  +0,3/s de menu, gardée 10 min entre lancements) : après ~80 s de course, ou ~2 min de menus, la remontée est interdite pour la session, même sur
  un iPhone 17 nominal. Il faudrait lire `MOB_S.thermo===0` quand `MOB_S.capteur`.
- `MOB_S.thermo>=1` la bloque aussi (fair) — normal.
- Elle ne monte qu'à 1,5 de DPR (le plafond « NETTE d'avant »), pas à 3 (densité réelle de l'écran) ; et ne touche ni la cadence (reste 30) ni
  les leviers statiques P2 a-j (`PAL.imgOn`, `palier-appareil.js:99`).
- Il n'existe AUCUNE autre remontée au-dessus du départ P2 sur téléphone. L'échelle QL elle-même est gelée dès qu'on est calé et chaud
  (`CAD.gel`, `cadence.js:77,85` ; `boucle-1.js:121` exige `!CAD.gel`) : avec MOB_FROID30, **l'échelle QL ne peut que descendre en course**.

---

## 5. Comment le jeu mesure qu'il « tient »

- `QLR` (`nettete-qualite.js:22`) : anneau des 60 dernières durées `ms9` (durée d'image **ramenée à une image d'écran** quand calé :
  `ms9 = rawMs − (CAD.per − CAD.ecran)`, `boucle-1.js:27`). Centiles `p50/p75/p90` recalculés toutes les 250 ms (`boucle-1.js:57-58`).
  Calé à 30 et à l'heure, ms9 ≈ 16,7.
- `CAD.w` : travail processeur de l'image (de `QLR.t0` à la fin de `loop`), lissé ×0,9 ; `CAD.wh` compteur fuyant des images > `CAD.wMax`=10 ms
  (`cadFin`, `cadence.js:81`). Fiable même à 30 i/s. N'inclut PAS le temps GPU.
- `QLR.vrai` / `QLR.vraiT` : la sonde readPixels (vrai coût GPU+CPU, 5 images synchronisées, au plus toutes les 8 s, seulement si images ratées).
- Entrée réactive à 30 : `QLR.p75>19` tenue `cadenceTenue` (2000 ms au palier 2) et `CAD.calme` (`cadence.js:91-95`). Sortie réactive : travail
  < 10 ms > 9 images/10 pendant 5 s → essai de 60 ; échec en 10 s → MUR 60 s doublé jusqu'à 8 min (`:94-98`). **Neutralisée tant que
  `mobChaud()`** — donc toujours dans l'app.
- `loop._r30` (`boucle-1.js:39-40`) : 30 Hz imposé par le système détecté (loop._ms entre 29,5 et 37,5, gigue < 2, tenu 2,5 s).
- `sondeFluide` (`nettete-qualite.js:283-304`) : toutes les 4 s en course, note une ligne `fluide` dans la boîte noire si p50 > 38 ms (calé) / 22 (60)
  ou une image ≥ 99 ms : carte, palier moteur, km/h, p50/p90/pire, cadence, cran QL, dose, palier `MOB_P.t`. `dbgFluide()`. `?sonde=0`.
- Le JUGE du poste (`poste-juge.js`) ne concerne QUE l'ordinateur (`POSTE.auto` faux sur téléphone : `soleil-planete.js:455`, `if(!P.pc)…return P`).
  `posteCadOk()` rend toujours vrai sur téléphone. Il n'y a pas d'équivalent « apprentissage » côté téléphone : `cashcarPalier` n'est
  écrit qu'avec `src:'banc'` (`palier-appareil.js:75`) ; la branche « appris en course » (`:67`, `src==='mesure'`) n'a aucun écrivain trouvé (grep).

Crochets : `dbgCadence()`, `dbgGouv(n)`, `dbgThermique(n)`, `dbgGouvPaliers()`, `dbgMobh()`, `dbgFluide()`, `dbgPalier()`, `dbgImg()`, `dbgNette()`,
`dbgHC()`, `dbgTransUI()`, `dbgWatt()`, `dbgGpuChaud(o)`, `dbgHudCalme()`, `dbgHudDort()`, `dbgPoste()` (ordi). `?palier=0|1|2`, `?appareil=iPhone18,1`.

---

## 6. Qu'est-ce qui distingue un iPhone 13 d'un iPhone 17 dans ces règles ?

**Rien de statique.** Tous deux : `PAL.n=2`, même `CAD30_REC`, même `MOB_GOUV`, même 30 i/s calé dès le départ (`MOB_FROID30`), même départ
P2 (DPR 1,25, halo ½, ombre 768, QL cran 1, traînées ½ densité > 200 km/h `imgDensVit`), même remontée éteinte. Le modèle exact
(`__ccAppareil`) ne sert qu'à choisir le palier 0/1/2 (`palier-appareil.js:65`) et à l'enregistreur (`enregistreur-perf.js`).

La seule différence possible est DYNAMIQUE : un téléphone qui reste « nominal » plus longtemps garde le palier 0 (pas d'allègement d'effets) et
la loupe de la caisse (`loupeChaud()`, `loupe-caisse.js:37-39` : coupée si `thermo>=2`, `MOB_P.t>=2` ou `QL.effondre`, + 20 s). Un 17 ne
reçoit donc jamais PLUS que le palier 0 du 13 Pro, et tourne aussi à 30 i/s. Ça colle exactement au constat de Sacha (iPhone 15 = même image).
Détail : `WATT.Wh=11.97` (batterie du 13 Pro) est codé en dur (`gouverneur-thermique.js:100`) — majorant faux pour les autres modèles.

Note (hypothèse, non vérifiée) : 30 i/s pour une caisse à plusieurs centaines de km/h = ~2× plus d'écart entre deux positions affichées ;
les traînées en ruban et la caisse peuvent paraître moins nettes / plus « saccadées-floues » qu'à 60, indépendamment de la résolution.
À mesurer (vidéo 240 i/s ou `dbgStep`) avant d'en faire une cause.

---

## 7. Pour un système de profils par appareil : où brancher, pièges

**Où brancher**
1. Le profil se déduit au même endroit que `PAL` : `rendu/palier-appareil.js:59-69` (`modele`, `__ccAppareil`, déjà disponible AVANT le script).
   Ajouter p.ex. `PAL.prof` (classe A15 / A16 / A17 Pro / A18 / A19…) sans toucher à `PAL.n` (la règle d'or et des dizaines de `PAL.b()`
   lisent la colonne 2). Table candidate : `iPhone14,x`=A15 (13), `iPhone15,x`=A16 (14 Pro/15), `iPhone16,x`=A17 Pro, `iPhone17,x`=A18, `iPhone18,x`=A19.
2. La CADENCE : le seul verrou du 30 pour tous est `MOB_FROID30` (`gouverneur-thermique.js:68`) + `MOB_G.g30` (`:26`, avant le capteur) dans
   `mobChaud()` (`:69`). Pour « 60 sur les forts » : rendre `MOB_FROID30` (et `g30`) dépendant du profil, et réutiliser `MOB_FAIR30` (30 dès fair).
   La cadence réactive (`cadFin`, `cadence.js:91-98`) redevient alors le filet automatiquement.
3. Le réglage HAUTE / BASSE : aujourd'hui `SAVE.d.q` ∈ `fast|net|haute` (`qSuivant`, `nettete-qualite.js:133`). `qHaute()` n'est lu NI par la
   cadence NI par le gouverneur (grep : 0 occurrence dans `moteur/cadence.js`, `gouverneur-*.js`, `mobh-*.js`, `boucle-1.js`) : en HAUTE,
   l'échelle QL est figée au cran 0 (`qlPose`, `:144`) mais le gouverneur coupe quand même le halo et baisse `DPR_CAP` (via `imgRegle`), et la
   course reste à 30. Brancher HAUTE/BASSE dans `mobChaud()` (cadence), `mobPalCible()` (paliers, `gouverneur-paliers.js:50`) et la table `MOB_PN`.
4. Le départ d'image par profil : `PAL.B.imgDprCap[2]` (1,25), `imgBloomRes[2]` (.5), `imgQlDepart[2]` (1), `imgDensVit[2]` (.5), `dprNetCap[2]` (1,5),
   leviers `PAL.imgOn(l)` (`palier-appareil.js:99`) : ce sont des budgets STATIQUES (une colonne pour tous les palier 2). Un profil doit les écrire
   AVANT le 1er dessin (la toile est allouée tôt : « UNE SEULE ALLOCATION », `palier-appareil.js:258-262`, `dprPlafond`).
5. La remontée : `MOB_R` / `MOB_RA` (`gouverneur-paliers.js:38-39`) est la prise prévue pour « vers l'ordinateur ». À adapter par profil (crans
   au-delà de 1,5 de DPR, halo plein, ombre 1024+), après avoir réglé le blocage par la dose (§4).

**Pièges**
- `MOB_P0` (`gouverneur-paliers.js:37`) RECOPIE le départ P2 (halo demi, mips 3, ombre 768) : chaque bascule du gouverneur réécrit ces valeurs.
  Un profil qui change le départ sans changer `MOB_P0` est écrasé à la 1re bascule (fair). De même `mobPalVoulu` borne `dpr` par
  `mobPalCapJoueur()` = `dprPlafond()`.
- `imgRegle('reset')` restaure les valeurs capturées au 1er `imgRegle(objet)` (`IMG_REGLE0`, `nettete-qualite.js:120-122`) : un profil appliqué
  APRÈS une 1re bascule serait perdu au retour au palier 0.
- `mobPalEcrit` MUTE `PAL.B[k][PAL.n]` pour `qlMin/ventK/emiK` (`:43`) ; `mobPalBase` lit les valeurs d'origine une seule fois.
- La dose `MOB_S.D` est persistée (`localStorage.cashcarMobGouv`, 10 min) et bloque la remontée même avec capteur.
- `MOB_GOUV` n'existe qu'au palier 2 : sur un palier 0/1 l'écouteur `cc:thermique` n'est même pas posé (`gouverneur-thermique.js:112`) —
  l'état thermique iOS y est ignoré.
- Le capteur arrive APRÈS le chargement (pas dans le script de début de document) : le tout début (menus, éventuellement 1re course rapide) tourne
  sous le modèle de dose / `g30`. Si le profil compte sur `thermo`, l'injecter aussi dans `JeuViewController.swift:33`.
- `CAD.gel` gèle l'échelle QL dès que `mobChaud()` : passer à 60 sur un profil fort rend aussi la remontée QL (comportement réactif normal).
- Ne JAMAIS utiliser `IS_MOBILE` (vrai sur l'ordi en cadre téléphone) : `TEL_NATIF` / `ALLEGE` (CLAUDE.md). Au banc navigateur, `?tel=1` donne
  TEL_NATIF mais pas de capteur : `dbgThermique(n)` le simule, `?appareil=iPhone18,1` simule le modèle.
- 120 Hz : il faudrait `FPS_CAP` (`?fps=0`) ET très probablement `CADisableMinimumFrameDuration` dans l'Info.plist (absent) — coût batterie
  ×2 ; incompatible avec « pas trop déconnant niveau batterie ». Non recommandé sans mesure.
- Les mesures historiques (« 60 à froid → serious en 1 min, puis bridé ×3 à ×10 ») sont TOUTES sur le 13 Pro, souvent BRANCHÉ (la charge chauffe,
  voir mémoire « banc de chaleur »). Aucune mesure d'un A16+ dans le code.
