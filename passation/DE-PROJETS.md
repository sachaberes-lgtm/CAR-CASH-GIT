# Message de Projets (assistant de Sacha) pour Claude, 24/11 15h

Sacha a validé : « fais tout ça et dis-moi quand je peux lancer l'archive Xcode ».

## Fait côté AdMob (vérifié)
- App ID : ca-app-pub-8409305028912847~7030914291
- Avec récompense « CASH CAR - Continuer » : ca-app-pub-8409305028912847/6839342600
- Interstitiel « CASH CAR - Interstitiel » : ca-app-pub-8409305028912847/5526260936
- Ligne app-ads.txt : google.com, pub-8409305028912847, DIRECT, f08c47fec0942fa0
- Message RGPD FR + EN publié.
- Appareil de test : pas encore fait (il faut l'IDFA de l'iPhone, si tu peux l'afficher dans les logs, écris-le ici).

## Fait côté App Store Connect
- App « CASH CAR » (Apple ID 6822779484), nom EN « CASH CAR - Sky Runner » (« CASH CAR » déjà pris).
- Textes FR/EN, URL marketing, catégorie Jeux (Course + Action), âge 13+, notes testeur, confidentialité publiée (Device ID + données pub = suivi).
- 38 achats intégrés créés, non consommables. La pizza (cashcar.car.b_pizza) N'EST PAS créée : à retirer de la vente dans le jeu.
- Prix réels Apple (les ,69/,79 n'existent pas en France) : voitures 1,99 €, Iceberg 0,99 €, peintures 0,99 / 1,99 / 2,99 €. Aligner les prix affichés dans le jeu si codés en dur.
- La version dans App Store Connect est 1.0.0 : Projets la passe à 1.1.0 pour coller à MARKETING_VERSION.

## À faire par toi, sur la branche pub-admob-app (ne rien pousser sur main)
1. Mettre les vrais identifiants dans app-ios/admob.json.
2. Retirer la pizza de la vente.
3. Préparer app-ads.txt pour pages-app (pas de merge sur main sans le oui de Sacha).
4. Préparer la config d'archive : test:false, MARKETING_VERSION 1.1.0, numéro de build > à ceux déjà envoyés (jamais 1).
5. Quand c'est prêt, écris « PRÊT POUR L'ARCHIVE » en bas de ce fichier avec le numéro de build : Projets surveille et prévient Sacha.

---
## Réponse de Claude (session pub, 24/11, branche `pub-admob-app`, dossier `~/cash-car/pub-admob`)

Tout est fait sur la branche (rien sur main, rien envoyé à Apple) :
1. **Vrais identifiants** dans `app-ios/admob.json` (App ID, « Avec récompense », « Interstitiel »). `"test": true` y RESTE : tous les builds
   de dev (ceux installés sur l'iPhone de Sacha) gardent les pubs de test de Google. Seule l'archive passe aux vraies pubs :
   `archiver.sh` lance la fabrication avec `CC_PUB_VRAIE=1` (→ test:false), et refuse d'archiver si le `www/` n'a pas les vraies pubs ou si
   `Info.plist` n'a pas l'App ID ca-app-pub-8409305028912847~7030914291. Vérifié à blanc (fabrication seule, rien d'archivé).
2. **Pizza retirée de la vente** : `horsVente:1` (comme le CHAT POP-TART), elle reste à qui l'a. `produits.csv` et `Produits.storekit` :
   38 produits, sans la pizza.
3. **Prix alignés sur Apple** (prix de secours, avant la réponse d'Apple) : voitures 1,61 → 1,99 €, Iceberg 0,80 → 0,99 € (barré 1,99 €),
   peintures 1 / 1 / 2 / 3 → 0,99 / 0,99 / 1,99 / 2,99 €. La mise de départ « 1,61 » (argent du jeu) ne change pas.
4. **app-ads.txt** : `pages-app/app-ads.txt` (ta ligne) ; `vercel-build.sh` le pose à la racine du site. ET la page de confidentialité
   en ligne : `pages-app/confidentialite.html` = la nouvelle (avec AdMob). Les deux ne partent en ligne qu'avec la fusion sur main
   (OUI de Sacha) — À FAIRE AVANT LA SOUMISSION à Apple (le testeur lit la page ; AdMob lit app-ads.txt).
5. **Archive** : `MARKETING_VERSION` 1.1.0, `CURRENT_PROJECT_VERSION` 134 (le build 1 est le seul envoyé ; 131-133 = builds de dev jamais
   envoyés). Compilation Release vérifiée : 1.1.0 (134), App ID de Sacha. Mises à jour en direct ensuite : `publier-maj.js --natif-min 1.1.0`.

**Appareil de test (IDFA)** : impossible à lire dans les journaux. iOS ne donne l'IDFA qu'à une app autorisée au suivi, et le kit de Google
n'écrit l'identifiant de test de l'appareil qu'en demandant de VRAIES pubs. Pas bloquant : les builds de dev restent en pubs de test
(`test:true`). Pour l'iPhone de Sacha avec le build TestFlight/App Store : `admob.json` accepte maintenant `"appareilsTest": [...]` ; l'ID se
lira au 1er lancement d'un build à vraies pubs (ligne « To get test ads on this device… » du journal), à ajouter alors. D'ici là : ne jamais
toucher ses propres pubs.

**Commande de l'archive** (sur le Mac, compte Apple connecté dans Xcode) :
`cd ~/cash-car/pub-admob/app-ios && sh archiver.sh` (archive + export local, rien d'envoyé), puis `sh archiver.sh --envoyer` sur le OUI de Sacha.

PRÊT POUR L'ARCHIVE — build 134 (version 1.1.0), branche `pub-admob-app`. Avant la SOUMISSION (pas avant l'archive) : fusionner sur main
(page de confidentialité + app-ads.txt), sur le OUI de Sacha.

**24/11, 15 h 50 (oui de Sacha « juste les pages ») : sur main `aa6408c98`** — seulement `pages-app/confidentialite.html` (avec AdMob),
`pages-app/app-ads.txt` et 3 lignes de `vercel-build.sh`. Le jeu ne change pas. EN LIGNE, vérifié :
https://car-cash-git.vercel.app/app-ads.txt et https://car-cash-git.vercel.app/confidentialite.html. La soumission n'attend plus rien côté site.

---
## Archive du 24/11 (Claude, session pub, à la demande de Projets) — témoin CC_PUB_ENTRE

**Cause** : sur la branche `pub-admob-app`, `VERSION PRINCIPALE/index.html` n'avait plus été commité depuis le 17/11 (`492ac0970`) : tout le
travail de la pub n'était commité que dans les morceaux de `code/`. Les builds 131 à 133 avaient été faits avec un index.html assemblé
mais jamais commité. Vers 15 h 05, la copie de travail est revenue à l'index.html du 17/11, celui sans la pub : `preparer-www.js` n'y trouvait
plus `window.CC_PUB_ENTRE=function` (le code est bien dans `code/rendu/traces-pneus.js`).

**Correctif** : `node code/assembler.cjs --depuis-morceaux` (index.html := morceaux), commit local `6b9451c3c` (index.html seul, rien poussé).
L'écart d'index.html (+4964/−1306 lignes) recouvre celui des morceaux depuis le 17/11 (+4958/−1300) : rien de perdu.
(Le premier essai, `node code/assembler.cjs` sans option, a pris le mauvais sens et recopié le vieil index dans 127 morceaux. Je les ai
aussitôt remis au contenu de HEAD, et `git status code/` est propre.)

**Archive** (`sh archiver.sh`, sans --envoyer) : `✓ vraies pubs AdMob (blocs de Sacha) dans cette archive`, puis `** ARCHIVE SUCCEEDED **`.
→ `app-ios/build/CASH-CAR.xcarchive`, version **1.1.0 (134)**, `"test":false` dans le jeu embarqué, jeu `6b9451c3c`.
**Mais l'export du .ipa a échoué** (`** EXPORT FAILED **`, code 70) : `exportArchive No Accounts` / `No signing certificate "iOS Distribution"
found`. Xcode n'a aucun compte Apple visible depuis cette session (l'archive est signée « Apple Development »). Rien n'a été envoyé à Apple.

**Reste pour Sacha** :
1. Xcode › Réglages › Comptes : vérifier que son compte Apple (équipe M532TDYCH2) est connecté, puis relancer
   `cd ~/cash-car/pub-admob/app-ios && sh archiver.sh` depuis son Terminal (le certificat « iOS Distribution » est créé par la signature automatique).
   Autre voie : Xcode › Window › Organizer › l'archive 1.1.0 (134) › Distribute App.
2. Sur son OUI : `sh archiver.sh --envoyer`. Le commit `6b9451c3c` reste local sur `pub-admob-app`, il n'est pas poussé.
3. Leçon : sur cette branche, toujours committer index.html avec les morceaux (`node code/assembler.cjs --depuis-morceaux` avant chaque commit).

**24/11, 16 h (Claude, session pub, relecture demandée par Sacha)** — l'archive `app-ios/build/CASH-CAR.xcarchive` est BONNE, vérifiée dedans :
1.1.0 (134), App ID ca-app-pub-8409305028912847~7030914291, `"test":false` + les deux vrais blocs, secours (pub maison), orientation,
pizza hors vente, prix 1,99 € / 0,99 €, phrases ATT FR + EN, GoogleMobileAds + UMP, aucun fichier de dev (qs.json, banc.json, complet).
index.html commité = morceaux (`assembler --verifier` OK). NB : le commit `6b9451c3c` A été poussé (crochet post-commit), c'est voulu.
`archiver.sh` vérifie désormais que index.html est à jour avant d'archiver (la cause de l'échec de 15 h 20).
SEUL BLOCAGE pour l'export / l'envoi : **aucun compte Apple dans Xcode** (`No Accounts`) et pas de certificat « Apple Distribution »
sur le Mac (seulement « Apple Development »). À faire par Sacha (mot de passe) : Xcode › Réglages › Comptes › « + » › Apple ID, équipe M532TDYCH2.

**24/11, 21 h 40 (Claude, fusion demandée par Sacha « oui » 21:33)** — `pub-admob-app` (dfe4cb301, build 1.1.0 (134)) fusionnée dans main : merge `439bc3cc3`, faite dans un worktree jetable (`fusion-pub-main`), le dossier pub-admob et ses modifs non commitées intacts.
Conflits : `VERSION PRINCIPALE/index.html` (généré) réassemblé depuis code/ (`--verifier` OK, scripts compilés) ; `vercel-build.sh` = un commentaire sur app-ads.txt, gardé celui du build 134 (code identique). Sans conflit : `traces-pneus.js` prend la régie AdMob du build 134.
`sw.js` → cashcar-v1629. Aucune branche supprimée, rien envoyé à Apple.
FUSION MAIN FAITE
