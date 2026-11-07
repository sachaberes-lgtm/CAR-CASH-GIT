# Chasse — voitures (agent Sonnet, 2026-11-07)

Verdict : 0 bloquant, 1 majeur, 4 mineurs. CARS/CAR_UNLOCK saine (91/91, 50 actives, 41 retirées). Tous les `shape` existent. Toutes les traductions de caisses et de moteurs présentes. Aucun identifiant non déclaré (acorn, 8,9 Mo), aucun TDZ non protégé. Scripts : chasse/voitures/*.cjs (t1…t14, tdz, undecl2, ctx).

Fichiers lus : cars.js, deblocage.js, buildcar.js en entier, plaque.js (plqPose), echappements.js, feux-led.js, atchoum-feu.js (HALO), finition.js (diffs 11-05), shapes-1.js (epave + diff HONTE), moteurs-themes.js, moteurs-originaux.js, moteurs-modeles-cc0.js, constructeur-moteur.js, son/voix-moteur.js, vignette-moteur.js (recherche), pickups-fruits.js (ENGINE_TIERS), missions/table.js, aura-banque-contrats.js, repertoire-voitures/modeles.js, TABLEAU-VOITURES.md. Dessins non relus ligne à ligne (couverts par acorn).

## A. Audit du 11-05
| ID | état | preuve |
|---|---|---|
| ECO-07 | CORRIGÉ | deblocage.js:112 `{p:3200000}`, :116 `{p:4000000}` (LE SHIBA, ex-DOGE) |
| ECO-11 | CORRIGÉ | cars.js:29 |
| ECO-12 | CORRIGÉ | aura-banque-contrats.js:48 ; `carRar` (:66) lit `c.rar` d'abord |
| ECO-23 | CORRIGÉ | boutique.js:147-151 (4 M → 5 M) |
| ECO-22 | CORRIGÉ en pratique | table.js:114-116 remplace `{k:'bientot'}` par `{k:'mis',id:'terre'}` ; COMÈTE revient (`c.retire=0`) |
| IOS-05/18 DOGE | CORRIGÉ | cars.js:184 `name:'LE SHIBA'` ; traductions.js:331 alias |
| IOS-05/18 POP-TART, CABOSSÉE, BAROUDEUR, ATCHOUM, ROSSO 40, ELDORADO, SPECTRE, PIZZA EXPRESS | OUVERT | décision D4 non tranchée |
| IOS-18 commentaires de marques | CORRIGÉ app (preparer-www.js:190-209 refuse `ferrari|batman|kellogg|mcqueen|lamborghini|cybertruck|rolls-royce`) / OUVERT web (index.html : 7 « nyan cat », 2 « Ferrari », Porsche, Toyota, Mazda, Jeep…) ; modeles.js non publié (vercel-build.sh:44) |
| Marque dans un texte visible | CORRIGÉ | seuls « CHAT POP-TART » et « LA STRATOS » |

## B. Nouveaux défauts

### CAR-N01 · MAJEUR · La carte de ROSSO 40 annonce 1,5 million, elle coûte 4 000 000
- Où : cars.js:28 (desc) ; EN traductions.js:128 ; prix deblocage.js:41
- Quoi : « La caisse de rêve : 1,5 million, et chaque euro se voit. » (EN « 1.5 million ») face à `{p:4e6}`. Seule desc chiffrée incohérente (script t12).
- Correction proposée : « La caisse de rêve, et chaque euro se voit. » / « The dream car, and every euro shows. »
- Confiance : haute

### CAR-N02 · MINEUR · Le nouveau halo de phares (1c701b46) n'a aucun effet en jeu
- Où : atchoum-feu.js:307-319 (`phareTex`, `HALO.hM`), écrasé par feux-led.js:33,49-52,94
- Quoi : `FEUXL` = 3 par défaut (feux-led.js:39), `FEUX_DOSES[3]` a `kH:0` → échelle des `HALO.h` à 0 ; `feuxGlobal()` au chargement réaffecte `HALO.hM.map=ledTex`. Le halo demandé par Léo est invisible sauf `?feux=0`.
- Preuve : `FEUX_DOSES[3]=Object.assign({},FEUX_DOSES[2],{kH:0,…})` ; `HALO.hM.map=HALO.tM.map=D?ledTex:lampTex;` ; `const k=s.userData.k0*(D0?D0.kH:1)`
- Correction proposée : demander à Léo ; si c'est le halo : `kH:.5` dans `FEUX_DOSES[3]` et ne plus écraser `HALO.hM.map` dans `feuxGlobal`.
- Confiance : haute sur la logique, moyenne sur l'intention

### CAR-N03 · MINEUR · Deux caisses retirées sans nom anglais (toast de remboursement)
- Où : cars.js:146 (LA CAISSE-NUAGE), :149 (LE LINGOT) ; sauvegarde.js:299
- Correction proposée : `Object.assign(I18N,{"LA CAISSE-NUAGE":"THE CLOUD CAR","LE LINGOT":"THE GOLD BAR"});`
- Confiance : haute

### CAR-N04 · MINEUR · TABLEAU-VOITURES.md périmé (doc)
- Prix d'avant le ×10, « LE DOGE », COMÈTE et SILENCIEUSE listées, ZAGAIE/LOUP oubliées ; modeles.js sans RAIE/SHIBA/BÊTE/ZAGAIE/LOUP. Régénérer (script t11).

### CAR-N05 · MINEUR · Branche morte `lvl===3` (mort.js:171-176). Inoffensif.

## C. Tableau de contrôle
- 91/91 fiches, 50 actives, 41 retirées avec `name`.
- 50/50 shapes définis (66 SHAPES ; surcharges après l'original dans ORDRE). SHAPES inutilisés : gt, proto, requin, c_silencieuse, b_daytona, e_zed, b_groupeb, d_puce, abstraite, fournaise, doge_sculpte, poupee, x, ae86, nuage, lingot.
- name+desc traduits 100/100 ; valeurs numériques 50/50 ; `rar` valide ; `fx` 8 fiches, tous lecteurs gardés.
- CAR_UNLOCK : `p` 69, `premium` 13 (8 actives), `carnet` 7, `bientot` 1 ; après table.js:114-121 aucun carnet/bientot restant, aucun `mis` vers mission inexistante.
- Missions donnant une caisse : 21 (20 actives ; `silence` → SILENCIEUSE écartée par m2Dispo ; `terre` → COMÈTE).
- Moteurs : ENGINE_TIERS 30, ENG_SND 30, TH30 30, dessins 1-29, 30 noms/descs traduits ; `ENGINE_TIERS[engTier+1]` gardé au palier max.
- Identifiants non déclarés : 0 (hors globaux navigateur, scripts externes, dbgX, branche morte `genParis`). TDZ : 0 non protégé.
- Diffs depuis 11-05 : HONTE (9a2435ea) OK ; patine/marbrure gardées ; nettoyage c15ca8ba : fonctions retirées sans appel restant.

## D. Non vérifié
Aucune construction réelle de buildCar (`outils/banc-caisses/verif.mjs` le ferait avec Chrome). Rendu de LA HONTE (la calandre peut chevaucher les phares génériques `L/2+.16` et la plaque). Dessins non relus ligne à ligne. vignette-moteur.js parcouru par recherche.
