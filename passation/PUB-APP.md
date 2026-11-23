# LA VRAIE PUB DANS L'APP iPHONE (AdMob) — état et décisions

Branche `pub-admob-app` (partie de `origin/qa/tuto-finitions` `ebf48e138`), dossier `~/cash-car/pub-admob`.
Rien sur `main`, rien d'envoyé à Apple, rien d'installé sur l'iPhone sans le OUI écrit de Sacha.

## DÉCISIONS DE SACHA (23/11/2026, dans la session)
1. Régie : **AdMob** (Google).
2. Formats :
   - **vidéo récompensée** : CONTINUER après la mort, et ×2 du gain (le joueur choisit) ;
   - **pub plein écran entre les courses** (interstitiel), au moment de REJOUER : **1 course sur 3** en temps normal, et
     **obligatoire si la course a duré plus de 2 minutes**. Jamais sur l'écran de mort, jamais juste après une vidéo récompensée.
3. Pas d'achat « SANS PUB » pour l'instant.
4. Pas de pub disponible (mode avion, rien chez Google) : **CONTINUER et ×2 grisés** (le jeu se joue normalement).
5. Identifiants de TEST de Google pendant tout le développement : jamais de vraies pubs sur l'iPhone de Sacha.
6. Le site web (Vercel) ne change pas : la pub n'existe que dans l'app.

## ÉTAT (23/11, soir) — RIEN COMMITÉ ENCORE (le crochet post-commit pousse tout seul : commit à faire une fois la compilation vue)
- Module : `@capacitor-community/admob` **8.4.2** (exact, `app-ios/package.json`). Demande `@capacitor/core ^8.0.0` (l'app : 8.5.3) ; Swift
  Package Manager ; embarque Google Mobile Ads **13.11.0** et UMP **3.1**. Même auteur (rdlabo) pour sa dépendance `@webview-native-ui/engine`.
- FAIT dans `code/` (assemblé par `--depuis-morceaux`, gardes démarrage / allégé / charte / burn-out OK ; index.html et sw.js NON commités, règle de NUIT-18-11) :
  - `rendu/traces-pneus.js` : la régie AdMob réécrite pour 8.4.2 (récompensée + plein écran, UMP puis ATT, réessais sans réseau, péremption 50 min,
    choix des pubs). L'ancienne prenait « fermée avant la fin » pour « pas de pub » : corrigé.
  - `gameplay/seconde-chance.js` : PUBR.app (vraie pub) / PUBR.sans (ancien binaire : gratuit comme avant) ; plaques grises sans vidéo chargée ;
    ×2 rendu dans l'app ; `pubEntre` = la pub entre les courses (1 REJOUER sur 3, obligatoire si la partie > 120 s, jamais < 45 s après une récompensée).
  - `moteur/mobile-tactile.js` (plaques grises, REJOUER → pubEntre, réglage CHOIX DES PUBS), `page/ecrans-menus.html` (la ligne),
    `css/mort-flottante.css` (gris, html.ccSansPub), `economie/achats-store.js` (la confidentialité DANS l'app parle des pubs de Google).
- FAIT dans `app-ios/` : `preparer-www.js` (coupes PUB/AD et leur contrôle ôtés, CC_ADMOB depuis `admob.json`, témoins de la pub, garde-fous :
  test:false exige de vrais identifiants et reste INTERDIT en COMPLET=1) ; `admob.json` (test:true, App ID de test de Google) ; Info.plist
  (GADApplicationIdentifier, NSUserTrackingUsageDescription EN, 50 SKAdNetworkItems de la page de Google) ; `fr.lproj` / `en.lproj` InfoPlist.strings
  (+ projet Xcode, région fr) ; `CapApp-SPM/Package.swift` (module ajouté par cap sync, cible remise à 16.4).
  Essais `preparer-www --essai` : App Store OK (482 fichiers) et COMPLET=1 OK ; garde-fous prouvés (test:false refusé deux fois).
- ⛔ BLOQUÉ : compilation simulateur arrêtée, DISQUE PLEIN (125 Mo libres). Mon dossier de compilation (625 Mo, dans le dossier temporaire de la
  session) est à effacer sur le oui de Sacha.
- 23/11, plus tard (oui de Sacha) : mon dossier de compilation effacé → 699 Mo libres, toujours trop peu pour compiler avec le kit Google.
- FAIT ensuite : `PrivacyInfo.xcprivacy` (7 types de données de Google ; NSPrivacyTracking reste false pour le code de l'app, le manifeste du kit
  Google déclare son pistage) ; fiche FR + EN (plus de « sans pub », confidentialité « Oui, nous collectons » avec le tableau, IDFA Oui,
  publicité Oui, notes du testeur, URL marketing, version 1.1.0 conseillée ; `verifier-fiche.js` : 13 textes dans les limites) ;
  `app-ios/fiche/confidentialite.html` FR + EN (copie EN LIGNE `pages-app/` NON touchée : à recopier sur main au moment de la sortie, oui de Sacha) ;
  `app-ios/fiche/app-ads.txt` (MODÈLE) + `vercel-build.sh` (pose `pages-app/app-ads.txt` à la racine seulement s'il porte un vrai identifiant :
  rien ne change aujourd'hui) ; `publier-maj.js` (rappel) ; banc `outils/banc-pub/` (faux module AdMob, Chrome muet).
- ⚠ GOOGLE (support.google.com/admob/answer/9363762) lit le champ **URL marketing** de la fiche App Store (pas l'URL d'assistance) et
  cherche `https://<ce domaine>/app-ads.txt`. La fiche disait « laisser vide » : à remplir avec `https://car-cash-git.vercel.app/`.
- RESTE : compiler au simulateur (place disque), tester sur le simulateur (vraies pubs de test de Google).

## LE BANC (`node outils/banc-pub/banc.cjs`, Chrome sans fenêtre et muet, faux module AdMob ; `--sonde` : l'écran de fin toutes les 400 ms)
Il tourne sur le jeu du dépôt avec un faux Capacitor (l'édition de l'app retire les crochets dbg* à la fabrication). Quatre passages le 23/11,
disque presque plein, machine lente : le banc est INSTABLE (la toute première course part ou non, une course part trop tard). VU VERT au moins
une fois : consentement Google → formulaire → ATT → pubs, blocs de TEST + isTesting ; CHOIX DES PUBS visible et qui ouvre le formulaire ;
plaque CONTINUER ▶ PUB allumée 5,5 s puis ×2 ▶ PUB (sonde) ; ×2 vu → gain doublé (327 → 654) ; vidéo fermée trop tôt → PAS de reprise ;
mode avion → CONTINUER GRIS « PAS DE PUB » et le toucher ne lance rien ; pub entre les courses : REJOUER 1 et 2 sans pub, le 3e avec ;
partie de 130 s → pub au 1er REJOUER ; double appui sur REJOUER → une seule pub ; jamais juste après une récompensée ; mode avion → REJOUER
part sans attendre ; ancien binaire : reprise servie sans pub, pas de ×2, html.ccSansPub ; le site : pas d'AdMob, rien de grisé, pas de
ligne CHOIX DES PUBS ; 0 exception JS dans les trois. JAMAIS VU au banc (la 1re course n'est pas partie) : CONTINUER vu jusqu'au bout → reprise,
double appui sur CONTINUER, le jeu qui se tait pendant la vidéo → à voir au simulateur avec les vraies pubs de test de Google.
`app-ios/www/` a été refait par `npm run sync` (non commité, comme sur le reste de la lignée).

## LE NUMÉRO POUR LES MISES À JOUR EN DIRECT
Le module AdMob est natif : il faut un NOUVEAU binaire. Conseil : `MARKETING_VERSION` **1.1.0** pour le premier binaire qui a la pub (et les
achats), puis toujours `node publier-maj.js --natif-min 1.1.0`. Un binaire sans le module reste sûr (seconde chance gratuite, pas de ×2, pas de pub).

## CE QUE SACHA DOIT FAIRE LUI-MÊME (la session ne crée aucun compte et ne tape aucun mot de passe)
1. **Compte AdMob** (admob.google.com, avec ton compte Google) : accepter les conditions.
2. **Paiement et impôts chez Google** : AdMob › Paiements : adresse, coordonnées bancaires (IBAN), informations fiscales (formulaire
   fiscal américain pour un non-Américain, statut d'entrepreneur individuel). Sans ça, Google n'encaisse pas pour toi.
3. **Ajouter l'app dans AdMob** : Applications › Ajouter › iOS › « l'app est-elle publiée ? » Non pour l'instant (la relier à l'App Store
   après la sortie). Noter l'**App ID** (`ca-app-pub-…~…`).
4. **Deux blocs d'annonces** : un « Avec récompense » (récompense : 1, « continuer ») et un « Interstitiel ». Noter leurs identifiants (`ca-app-pub-…/…`).
5. **Le message de consentement européen** : AdMob › Confidentialité et messages › RGPD › créer un message pour l'app (langues FR + EN),
   le publier. Sans lui, le formulaire UMP ne s'affiche pas. (Facultatif : le message « explicatif IDFA » avant la fenêtre d'Apple.)
6. **Ton iPhone en appareil de test** : AdMob › Paramètres › Appareils de test › ajouter (IDFA de l'iPhone) — une sécurité de plus pour ne
   jamais voir de vraie pub chez toi, même avec les vrais identifiants.
7. **Me donner** l'App ID et les deux identifiants de blocs : je les mets dans `app-ios/admob.json` (test reste `true` jusqu'à l'archive).
8. **app-ads.txt** : AdMob › Applications › app-ads.txt donne ta ligne exacte (`google.com, pub-…, DIRECT, f08c47fec0942fa0`) : me la
   donner, je prépare `pages-app/app-ads.txt` ; il part en ligne avec main, sur ton oui.
9. **App Store Connect** :
   - fiche › **URL marketing** = `https://car-cash-git.vercel.app/` ;
   - **Confidentialité de l'app** : refaire le questionnaire (« Oui, nous collectons », le tableau de la fiche § 5) ;
   - **Classification d'âge** : « Publicité » = Oui ;
   - **Notes pour le testeur** : recoller celles de la fiche § 6 ;
   - la page de confidentialité en ligne : recopier `app-ios/fiche/confidentialite.html` dans `pages-app/` sur main (ton oui).
10. Au moment de l'archive pour Apple seulement (ton oui) : `admob.json` → `"test": false`, `MARKETING_VERSION` 1.1.0, `npm run sync`, archive.
