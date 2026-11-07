# Chasse — économie / sauvegarde / missions (agent Opus, 2026-11-07)

Bilan : 0 bloquant, 1 majeur, 6 mineurs. Scripts : chasse/economie/ (table.cjs, colall.cjs, ids.cjs).

Fichiers lus : code/sauvegarde.js ; code/economie/aura-banque-contrats.js, boutique.js, achat-carte-moteur.js, eco-vague3.js, final-spin.js, boutique-du-jour.js ; code/voitures/cars.js (table + DENOMS), deblocage.js ; code/missions/table.js, defis-moteur.js, ecran-revelation.js (l.1-300), aujourdhui.js (l.1-80) ; code/gameplay/seconde-chance.js (l.60-591) ; par grep : ramassage.js, aura-chaine.js, frole-contrats.js, fete-caisse.js, argent-atelier.js, missions/atelier.js, son/mute-cadeau.js, moteur/mobile-tactile.js, interface/icones-fenetre.js, interface/garage-menu-inventaire.js, app-ios/preparer-www.js.

Constat de base (table.cjs) : `CARS.length === CAR_UNLOCK.length === 91`, dont 50 actives. Les 21 caisses données par une mission existent et aucune n'est `retire`. Aucun id COSM/mission refusé par les regex de `san`.

## A. Audit du 11-05
| ID | état | preuve |
|---|---|---|
| ECO-01 | CORRIGÉ | app-ios/preparer-www.js:84-85 (`souple`), :135 |
| ECO-02 | CORRIGÉ | aura-banque-contrats.js:94 `TEST_CAISSES=false` + garde-demarrage.cjs:10 |
| ECO-03 | CORRIGÉ | sauvegarde.js:178 `o9.mq=L9(s9.mq,200);` |
| ECO-04 | OUVERT | sauvegarde.js:240-244 : import = JSON.parse + san, sans signature ; `owned` (l.134) n'exclut pas les € ; `ex.floor` importable jusqu'à 90 (l.80) ; `cousin`/`cousinTout` recopiés (l.121) |
| ECO-05 | CORRIGÉ avec effet de bord | defis-moteur.js:81 → N01, N02 |
| ECO-06 | CORRIGÉ | table.js:51 `v:10000` |
| ECO-07 | CORRIGÉ | deblocage.js:112, :116 |
| ECO-08 | CORRIGÉ | seconde-chance.js:328-329 `dblGain()` lit `commitExploits._vire` |
| ECO-09 | doc corrigée / trou toujours là | aucune caisse entre 80 000 (deblocage.js:135) et 500 000 (l.38) ; comblé par traînées 110-400 k et aile HÉLICES 300 k |
| ECO-10 | OUVERT | mobile-tactile.js:938 : effacement = `san(null)` + flush ; si `SAVE.natif===1` aucun Preferences.set, témoin `_natif` (sauvegarde.js:234) ; au rechargement le miroir le plus riche gagne (l.275-277) ; aucun `Preferences.remove` dans natif.js |
| ECO-11 | CORRIGÉ | cars.js:29 |
| ECO-12 | CORRIGÉ | aura-banque-contrats.js:48 |
| ECO-14 | CORRIGÉ de fait | palier10 secrète (ecran-revelation.js:43) |
| ECO-15 | CORRIGÉ | achat-carte-moteur.js:61 |
| ECO-16 | CORRIGÉ | aura-banque-contrats.js:102 |
| ECO-17 | CORRIGÉ | preparer-www.js:187-194 |
| ECO-18 | CORRIGÉ (D6) | sauvegarde.js:202 (`neuf` seulement sous `?demo=1`) |
| ECO-19 | NON VÉRIFIABLE | |
| ECO-20 | OUVERT (finition) | sauvegarde.js:20, :79 `pubs` |
| ECO-22 | CORRIGÉ de fait | COMÈTE donnée par la mission `terre` (table.js:86) |
| ECO-23 | CORRIGÉ | boutique.js:147-151 |
| ECO-24 | OUVERT | table.js:73 `maps` et :75 `maps2` même mesure `k:'cartes'` : réussies d'un coup |
| ECO-28..32 | PARTIEL | sacs ×10 (final-spin.js:33-35) mais consolation 40 (l.39) ; commentaire eco-vague3.js:62 « CABOSSÉE 2 500 $ » faux (25 000) ; code cadeau éteint mais présent |
| DIR-08 | météo CORRIGÉE (defis-moteur.js:92, M2_METEO_MIN) / +180 k NON VÉRIFIABLE — piste : N01 |
| INT-01 | OUVERT par décision (web) / CORRIGÉ (app) | icones-fenetre.js:25-26 ; web : ACHETER → INDISPONIBLE (boutique.js:40-44, 645) ; app : écran masqué, € → argent du jeu (preparer-www.js:109-113, 146-148) |

## B. Nouveaux défauts

### ECO-N01 · MAJEUR · Web : « collecte toutes les couleurs » offerte d'office
- Où : code/missions/defis-moteur.js:81 (m2Col), avec boutique.js:623 (`o.eur=PEINT_EUR[o.r]` pour chaque peinture).
- Quoi : un joueur neuf sur le site trouve `colall` déjà réussie au premier passage au garage et récupère +50 000 € (deux caisses communes).
- Raisonnement : les 64 peintures ont `eur` ; le lot « toutes » se réduit à D'ORIGINE + peintures possédées → `nT === tot`. Preuve node colall.cjs : `WEB peinture {n:1,tot:1,nT:1} => RÉUSSIE D'OFFICE`. App : `tot:65`, normal.
- Preuve : `if(!m2HabReco(cat,d)&&(!d.eur||a)){tot++;if(a)nT++;}`
- Correction proposée : compter les peintures gagnables par défi même en € (`(!d.eur||d.def||a)`), ou rendre `colall` indisponible (m2Dispo) tant que les peintures en € ne s'achètent pas.
- Confiance : haute

### ECO-N02 · MINEUR · Web : `trall` (50 k) et `toutall` (500 k) impossibles
- Où : defis-moteur.js:81 + boutique.js:632 (ARC-EN-CIEL → `pack:'chat'`).
- Quoi : l'ARC-EN-CIEL ne vient qu'avec le CHAT POP-TART, en €, impossible sur le web → jamais réussies. App : chat ≈ 3,9 M en argent du jeu, réussissables.
- Correction proposée : dans m2Col, traiter `d.pack==='chat'` comme un objet en € tant que `carEuros(chatPackI())`.
- Confiance : haute

### ECO-N03 · MINEUR · `m2.c.pg` non recopié par san : les peintures gagnées sortent de l'écran Missions
- Où : sauvegarde.js:181-188 (san, bloc `m2.c`) ; écrits par boutique.js:664 (`pg`), :672 (`pgv`), aujourdhui.js:37.
- Quoi : après redémarrage, les peintures gagnées par défi disparaissent de « MISSIONS RÉUSSIES », le compteur n/N baisse (ecran-revelation.js:34-36). La peinture reste possédée. `pgv` perdu aussi → seules les 18 de PEINT_EX_SEC reconstruites.
- Correction proposée : `o9.c.pg=` ids filtrés par `/^[a-zA-Z]{2,12}$/` (majuscules de `srBraise`), et `if(cc.pgv===1)o9.c.pgv=1;`.
- Confiance : haute

### ECO-N04 · MINEUR · Primes fixes oubliées par le ×10
- Où : aujourdhui.js:31 (série 7 jours : 150/250/400/600), final-spin.js:39 (consolation 40), auto-ecole.js:163 (permis +500), commentaire eco-vague3.js:62.
- Quoi : semaine complète = 1 400 € contre une caisse à 25 000 €.
- Correction proposée : ×10 si Sacha le veut ; sinon corriger le commentaire.
- Confiance : haute (constat) ; décision Sacha

### ECO-N05 · MINEUR · Web : ~28 peintures sans défi impossibles à obtenir
- Où : boutique.js:623, :12 (shopPaye rejette toujours), icones-fenetre.js:26.
- Quoi : LAGON, ROSE POUPÉE, GRIS NARDO, NOIR MAT, LILAS, PISTACHE, VAPORWAVE, CUIVRE… en € avec ACHETER → « indisponible » ; la fenêtre promet « Les achats ouvriront à la sortie sur l'App Store », alors que l'app les passe en argent du jeu.
- Correction proposée : appliquer sur le web la conversion de l'app (`o.p=…*60*1000`) tant que StoreKit n'existe pas, ou retirer la phrase « App Store » sur le web.
- Confiance : haute

### ECO-N06 · MINEUR · Onglet passif : TOUT EFFACER et les achats ne s'écrivent pas
- Où : garage-menu-inventaire.js:295-297 (`SAVE.flush` remplacé par une fonction vide) ; mobile-tactile.js:938.
- Correction proposée : à l'effacement, écrire localStorage directement comme `SAVE.import` (sauvegarde.js:249-250), ou reprendre `ccOngletActif`.
- Confiance : moyenne (web, rare)

### ECO-N07 · MINEUR · Import web : caisses en € et code cousin par un code de sauvegarde
- Où : sauvegarde.js:121 (`cousin`, `cousinTout`), :134-135 (`owned` sans filtre €).
- Correction proposée : dans san, `c.owned=c.owned.filter(i=>!carEuros(i))` tant que StoreKit n'existe pas ; dans SAVE.import, supprimer `cousin`/`cousinTout` avant san.
- Confiance : haute

## C. Non vérifié
- Textes EN manquants : script trop lent (timeout) ; les nouveaux textes lus (SÉRIE, TOUCHE ENCORE POUR RETIRER, remboursement, achat) sont traduits.
- Symbole « $ » : aucun dans les chaînes de code/ ; `u:'$'` des missions s'affiche en € (ecran-revelation.js:25, defis-moteur.js:140) ; à confirmer à l'écran.
- Progression : pas de simulation ; première caisse à 25 000 € ≈ 10-15 parties moyennes sans primes ; machine à sous ≈ 16 800 € par jeton. Aucun mur sous 500 k vu.
- Seconde chance dans l'app : ×2 éteint sous EN_APP (seconde-chance.js:319), mais `chanceJoue` appelle encore `pubRecompense` dans l'app (sauf bon gratuit) : non lu.
- Double débit / double récompense : aucun trouvé (carBuy, shopBuy, figAchat, m2Prend synchrones et revérifiés ; m2RecupVite → m2Prend protégé par `s.pr`).
