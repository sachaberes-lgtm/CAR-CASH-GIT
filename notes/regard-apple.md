> **DÉCISIONS DE SACHA (14/10, 3 h 15 – 3 h 27) — elles PRIMENT sur les propositions ci-dessous :**
> - **Le CHAT POP-TART RESTE** (« le chat reste, on prend le risque ») → NE PAS appliquer la coupe C1, ne pas le renommer.
> - **Les deux voitures « Batman » sont RENOMMÉES, pas retirées** (fait sur `assemblage`, commit `7f5c4cd`) : LA CHAUVE-SOURIS → LA NOCTAMBULE,
>   LE CHEVALIER NOIR → LE BLINDÉ NOIR (+ sa phrase) → NE PAS appliquer la coupe C2.
> - Le reste (noms de modèles réels, sons tiers, contenus « BIENTOT ») : pas encore tranché.

# REGARD APPLE — audit en lecture seule (App Store Review Guidelines) — CASH CAR

Source auditée : `pilotage/integ/VERSION PRINCIPALE/index.html` (52 618 lignes, 5 411 208 o). « L'app » = ce fichier APRÈS les retouches de `preparer-www.js`, que j'ai rejouées à l'identique dans `regard-apple-outils/appli.html` (script `fabrique-appli.js`, les 8 retouches passent). **Tous les n° de ligne sont ceux de la SOURCE integ.**
Chaînes extraites : `regard-apple-chaines.txt` (caisses, HTML statique, ~2 750 chaînes JS à visage humain dont la table `TR` FR→EN/ZH). Brut complet : `regard-apple-outils/src-js.tsv` (24 923 chaînes JS) et `src-html.tsv`. Scripts : `regard-apple-outils/`.

⚠ `ios-capacitor/app-ios/www/index.html` sur disque est PÉRIMÉ (5 317 415 o, fait à 01:33 ; la source fait 5 411 208 o) : refaire `npm run sync` avant l'archive.
⚠ Je n'ai rien lancé (ni navigateur, ni build) : tout ce qui est « visuel » ou « atteignable au doigt » est établi par lecture du code, pas par essai (voir NON VÉRIFIÉ).

---------------------------------------------------------------------
## 1. À TRANCHER PAR SACHA ET LÉO AVANT L'ENVOI (1 ligne chacune)

1. **CHAT POP-TART** (marque « Pop-Tarts » de Kellogg + Nyan Cat, œuvre de son auteur ; le guide l'écrit lui-même l. 1912, 4243) : proposition = **le RETIRER de l'app** (`retire:1`, voir §2), ou à défaut le renommer **« CHAT GOÛTER »** ET enlever l'arc-en-ciel / le motif biscuit rose. Renommer seul ne suffit pas : c'est la ressemblance qui est copiée.
2. **LA CHAUVE-SOURIS** (forme interne `d_batmobile`) et **LE CHEVALIER NOIR** (= « The Dark Knight » en VF ; gabarit large 2,6 m, « pas de capot ») : deux véhicules de Batman (DC). Proposition : retirer les deux de l'app, ou renommer **« LA NOCTAMBULE »** / **« LE BLINDÉ NOIR »** et changer le dessin (ailes de chauve-souris, bec).
3. **ATCHOUM** (nom FR du nain Simplet/Sneezy de Disney ; le guide l. 4240 : « la voiture tuning McQueen orange », Cars/Pixar) : proposition **« L'ENRHUMÉE »**, sans le style Lightning McQueen (orange laqué + bandes + aileron).
4. **Noms = modèles réels** (le guide l. 77-80 dit que TOUTES les caisses sont « inspirées de vrais modèles », « photos du vrai modèle », « bouclier AMG », « Coccinelle », « la berlinette de Maranello » en commentaire de code) :
   - **ELDORADO** (Cadillac Eldorado) → **« LE FLAMANT »**
   - **LA DAYTONA** (Ferrari 365 « Daytona ») → **« LA GRANDE FLÈCHE »**
   - **LA STRATOS** (Lancia Stratos) → **« LA CALE »** (le coin)
   - **LA VETTE** (Corvette) → **« LA RAPIÈRE »**
   - **LE CHARGEUR / LE CHARGEUR 69 / LE DÉFIEUR** (Dodge Charger / Challenger, traduits mot à mot) → **« LE FORBAN » / « LE FORBAN 69 » / « LE PROVOCATEUR »**
   - **LA DOLORÈS** (DeLorean ; sa phrase dit « portes papillon… À 88 à l'heure elle remonte le temps » = Retour vers le futur) → **« LA BRUMEUSE »** et réécrire la phrase
   - **ROSSO 40** (Ferrari F40) → **« ROUGE 40 »** ; **LA GROUPE B**, **LA ZED**, **LA BAVAROISE**, **LA SILENCIEUSE**, **LA GRANDE ANGLAISE** : évocations, risque faible (voir tableau).
5. **Phrase « …on vient de doubler une Ferrari. »** (marque nommée, FR et EN) → « une voiture de course ».
6. **Les 3 caisses « DÉFI À VENIR »** (REQUIN, COMÈTE, LA RAIE) : visibles, verrouillées, **impossibles à obtenir** dans l'app → les rendre achetables en argent du jeu (comme le fait déjà la coupe pour les caisses en €) ou les retirer.
7. **Le bouton « BIENTOT » du garage, les affiches « CLASSEMENT MONDIAL : BIENTOT EN LIGNE », les blocs « ? » BIENTÔT** : à retirer ou à finir (2.1).
8. **Sons tiers** (`kaching.mp3` : étiquettes « Yout.com » ; `compteuse.mp3` : « 101soundboards.com » ; `cash.mp3`, `compteur.mp3`, `wow.mp3` d'origine inconnue) : Sacha confirme d'où ils viennent et s'il a les droits, sinon les remplacer (synthèse). Musiques Suno (dont une « Cover ») : garder la preuve d'abonnement payant au moment de la génération.
9. **Paris : « MOULIN ROUGE »** (enseigne, marque du cabaret) → **« CABARET ROUGE »** ; l'éclairage nocturne de la tour Eiffel est protégé en France (image, pas texte : décision de Sacha).

---------------------------------------------------------------------
## 2. COUPES À AJOUTER DANS L'APP (pour la session APP STORE — `preparer-www.js`, même mécanique `une(de, vers, quoi)` qui refuse si ≠ 1 occurrence)

Rien n'est à ajouter côté jeu : ce sont des retouches de `www/` seulement (consigne de Sacha : « couper dans l'app seulement »).

| # | Où | `de` (chaîne exacte, occurrence unique vérifiée) | `vers` | Pourquoi |
|---|---|---|---|---|
| C1 | CARS l. 17152 | `{name:'CHAT POP-TART',   shape:'poptart',` (3 espaces après la virgule ; 1 occurrence) | `{retire:1,name:'CHAT POP-TART',   shape:'poptart',` | 5.2. `retire:1` est le mécanisme existant (`carRetiree`, l. 28298 ; remboursement automatique des caisses retirées déjà possédées, l. 36341). La caisse quitte garage, boutique et inventaire. |
| C2 | CARS l. 17243, 17263 | `name:'LA CHAUVE-SOURIS',` et `name:'LE CHEVALIER NOIR',` (si la décision est « retirer ») | préfixer `retire:1,` | 5.2 (Batman). |
| C3 | CARS l. 17297 | `name:'ATCHOUM',` (ou renommer, voir C5) | `retire:1,` ou rename | 5.2 (Disney/Pixar). |
| C4 | CAR_UNLOCK l. 28178, 28179, 28224 (`{k:'bientot',v:1}` ×3 : REQUIN, COMÈTE, LA RAIE) | à ajouter dans la boucle de la coupe « caisses en € » : `u.k==='bientot'` → `CAR_UNLOCK[i]={p:…}` (le prix de la rareté de la caisse) | | 2.1 : plus aucune caisse « DEFI A VENIR » (l. 30172). |
| C5 | Noms de caisses (§1 point 4) | un `renomme('LA DAYTONA','LA GRANDE FLÈCHE')` par nom, en `split/join` sur tout `h` (le nom FR apparaît 4 à 9 fois : CARS, clés de `TR`, `I18N`) **et** remplacer aussi la valeur EN/ZH dans `TR` (`"LA DAYTONA":"THE DAYTONA"` l. 17731 → `"LA GRANDE FLÈCHE":"THE GREAT ARROW"`), sinon l'anglais garde le nom réel | | 5.2 |
| C6 | l. 17186 (FR) et l. 17680 (TR, clé FR et valeur EN) | `on vient de doubler une Ferrari.` / `we just passed a Ferrari.` | `on vient de doubler une voiture de course.` / `we just passed a race car.` (clé ET valeur en même temps) | 5.2 |
| C7 | CSS `#appStore` (déjà en place) à compléter | ajouter les sélecteurs : `#gMenuBas .gVerrou` (bouton « BIENTOT », l. 7330) | `{display:none!important}` | 2.1 |
| C8 | `buildAffiches` (l. 42586-42630) | masquer / neutraliser l'affiche « classement » : remplacer `toast(sansAcc(TR(a.k==='perso'?'TES RECORDS : BIENTOT EN DETAIL':'CLASSEMENT MONDIAL : BIENTOT EN LIGNE')));` par une ligne vide, et retirer le texte `P('BIENTOT EN LIGNE')` (l. 42594) | | 2.1 |
| C9 | blocs de raretés « ? » (`gMystere`, l. 43773 ; toast l. 48865 `— BIENTÔT`) | `if(t.classList.contains('gMys')){…return;}` → ne pas afficher les blocs (renvoyer `[]` dans `gMystere`) | | 2.1 |
| C10 | Réglages ancien panneau (`#setBtn` l. 7540, `#saveExp`/`#saveImp` l. 7697-7698) qui appellent `prompt()` (l. 40157, 40158, 40161) | CSS : `#setBtn,#saveExp,#saveImp,#settings{display:none!important}` (le nouveau panneau `#mSet` utilise `modale()`, pas `prompt()`) | | alerte système au titre de la page (voir §6) |
| C11 | l. 29789-29790, 29820, 29843 (`Achat unique, via ton compte App Store…`, `Les achats ouvriront à la sortie sur l'App Store.`) | pas atteignables après les coupes (voir §3 ligne R-04) ; si l'on veut un `www/` propre : les retirer de `I18N` | | 3.1.1 (hygiène) |

---------------------------------------------------------------------
## 3. TABLEAU DES CONSTATS (trié par gravité)

Légende « déjà coupé » : OUI = rendu inatteignable par `preparer-www.js` ; NON = encore dans l'app ; PARTIEL = voir texte. « Qui » : APP STORE = session `preparer-www.js` ; INTERFACE = session interface ; S+L = décision Sacha + Léo.

| gravité | règle | constat | où (ligne, chaîne EXACTE) | déjà coupé ? | correctif proposé (qui) |
|---|---|---|---|---|---|
| **BLOQUANT** | 5.2.1 (marques, œuvres d'autrui) | Le nom d'une marque déposée (« Pop-Tarts », Kellogg) ET une copie assumée de Nyan Cat (le guide : « je mise tout sur cette image… mimétisme », « Nyan Cat appartient à son auteur », « reste dans la liste droits »). Nom visible au garage, en boutique et en inventaire (9 occurrences). La description « Une pâtisserie industrielle avec une tête de chat et quatre roulettes » décrit le meme objet. | l. 17152 `name:'CHAT POP-TART'` ; l. 17603 TR `"POP-TART CAT"` ; l. 17156 desc ; l. 28177 `{k:'premium',eur:'4,20 €',rar:'leg',une:1}` ; forme interne `shape:'poptart'` | NON (la coupe app la rend seulement achetable à 3 900 000 $ du jeu) | C1 (retire:1) ; sinon nom de rechange « CHAT GOÛTER » + changer la forme (APP STORE + S+L) |
| **BLOQUANT** (à confirmer visuellement) | 5.2.1 | Véhicules de Batman : forme `d_batmobile` portant le nom LA CHAUVE-SOURIS ; LE CHEVALIER NOIR (= The Dark Knight en VF, gabarit w 2,6 m « Pas de capot, pas de pitié… La ville a appelé à l'aide : c'est lui qui a répondu. »). Je ne juge pas la forme 3D ; le nom interne de la forme et la phrase sont explicites. | l. 17243 `name:'LA CHAUVE-SOURIS'` (`shape:'d_batmobile'`) ; l. 17263 `name:'LE CHEVALIER NOIR'` ; l. 17264 desc ; peinture « CHAUVE-SOURIS » aile l. 29900 | NON | C2 ou renommer + redessiner (S+L) |
| RISQUE | 5.2.1 | ATCHOUM : nom FR de Simplet (Disney) + guide « la voiture tuning McQueen orange » (Cars/Pixar). Le guide précise : « ni nom, ni numéro, ni regard sur le pare-brise (droits) » donc la parade est déjà partielle. | l. 17297 `name:'ATCHOUM'` (14 occurrences) ; guide l. 4240 | NON | renommer « L'ENRHUMÉE » (C5) ou retirer (C3) (S+L) |
| RISQUE | 5.2.1 | Noms de modèles RÉELS de constructeurs : `ELDORADO` (Cadillac), `LA DAYTONA` (Ferrari), `LA STRATOS` (Lancia), `LA VETTE` (Corvette), `LE CHARGEUR` `LE CHARGEUR 69` `LE DÉFIEUR` (Dodge, traduits), `LA DOLORÈS` (DeLorean), `ROSSO 40` (Ferrari F40). Le guide l. 4243 les avait déjà listés (QUATTRO, STRATOS, DAYTONA, ELDORADO, VETTE, LE MANS 24 ; QUATTRO et LE MANS 24 sont depuis `retire:1`, il reste les 4 autres). | l. 17130 `name:'ELDORADO'` ; l. 17237 `name:'LA DAYTONA'` ; l. 17241 `name:'LA STRATOS'` ; l. 17225 `name:'LA VETTE'` ; l. 17207 `name:'LE CHARGEUR'` ; l. 17209 `name:'LE DÉFIEUR'` ; l. 17231 `name:'LE CHARGEUR 69'` ; l. 17148 `name:'LA DOLORÈS'` ; l. 17136 `name:'ROSSO 40'` | NON | C5 (noms de §1 point 4) (APP STORE ; décision S+L) |
| RISQUE | 5.2.1 | Marque citée en toutes lettres dans un texte de caisse (FR et EN). | l. 17186 `Sept places, zéro limite. Les enfants hurlent, mais c'est de joie : on vient de doubler une Ferrari.` ; l. 17680 (clé TR) ; EN : `we just passed a Ferrari.` | NON | C6 |
| RISQUE | 5.2.1 | Ressemblance VOULUE avec de vrais modèles pour « toutes les voitures » (guide l. 77-110 : « photos du vrai modèle (Wikimedia Commons) », « bouclier AMG », « cotes de la Coccinelle », « la C3 68-72 », « le CÔNE noir à T des premières années » pour LA SILENCIEUSE, « badge rouge » pour LE SAMOURAÏ). Aucun logo n'est cité dans le code, mais le guide parle de badges, de calandres et d'un « T » : à passer en revue VISUELLEMENT avant l'envoi (je ne vois pas les formes). | CLAUDE.md l. 77-110 ; CARS l. 17114-17326 | NON | revue visuelle des 51 caisses actives pour qu'aucun emblème (étoile, T, bœuf, cheval, écusson) ne subsiste (INTERFACE / S+L) |
| RISQUE | 5.2 (sons) | Samples d'origine tierce SHIPPÉS et joués : `kaching.mp3` (étiquettes « Yout.com », extrait YouTube) et `compteuse.mp3` (« 101soundboards.com ») d'après le guide l. 4698 (étiquettes vidées depuis, mais l'origine reste), `cash.mp3`, `compteur.mp3` (origine inconnue). `wow.mp3` (tag 2012) et `eww.m4a` ne sont PAS joués dans l'app (`SANS_VOIX` vrai, l. 69, 36069, 36104). `minecraft.m4a` n'est qu'un nom de fichier : 7,6 Ko de synthèse (« placeholder », l. 36061-36064). | l. 36096 `{f:'kaching.mp3',   v:.7,max:2.4}` ; l. 36098 `{f:'compteuse.mp3', v:.7,max:2.6}` ; l. 36097-36099 `cash.mp3`, `compteur.mp3` | NON | Sacha confirme les droits, sinon remplacer par des sons synthétisés (S+L) |
| RISQUE | 5.2 (musique) | Musiques Suno (dont une « Cover ») et voix ElevenLabs (guide l. 4242). Les 9 mp3 d'annonceur sont livrés dans `assets/audio/announcer/` mais jamais joués dans l'app (`SANS_VOIX`) : poids mort + risque inutile. | `assets/audio/music/*` ; `assets/audio/announcer/*` | PARTIEL (voix coupée à l'exécution, fichiers encore copiés) | APP STORE : ne pas copier `assets/audio/announcer/` dans `www/` ; Sacha : garder la preuve d'abonnement Suno |
| RISQUE | 2.1 complétude | Texte « BIENTOT » visible : bouton verrou du menu du garage, toast « BIENTÔT DISPONIBLE ». Le CSS de l'app ne le masque pas (il masque `.gBoutique`, pas `.gVerrou`). | l. 7330 `<span data-fr="BIENTOT">BIENTOT</span>` (classe `gVerrou`) ; l. 48836 `toast(pxi('verrou')+' '+TR('BIENTÔT DISPONIBLE'))` | NON | C7 |
| RISQUE | 2.1 | Trois caisses visibles mais impossibles à obtenir dans l'app : REQUIN, COMÈTE, LA RAIE (`{k:'bientot',v:1}`) ; condition affichée « DEFI A VENIR » / `CHALLENGE COMING SOON`. | l. 28178 `{k:'bientot',v:1}` (REQUIN) ; l. 28179 (COMÈTE) ; l. 28224 (LA RAIE) ; l. 30172 `case 'bientot':return [ 'DEFI A VENIR','CHALLENGE COMING SOON','挑战即将推出' ]` | NON (la coupe app ne convertit que `premium` et `pubs`) | C4 |
| RISQUE | 2.1 | Affiches du garage : « CLASSEMENT MONDIAL : BIENTOT EN LIGNE » (toast) et affiche dessinée avec « 1.  ? ? ?  - - - » + cartouche « BIENTOT EN LIGNE » ; « TES RECORDS : BIENTOT EN DETAIL ». Fonction fantôme, et « classement mondial » suggère un service en ligne qui n'existe pas. | l. 42594 `P('BIENTOT EN LIGNE')` ; l. 42630 `'TES RECORDS : BIENTOT EN DETAIL':'CLASSEMENT MONDIAL : BIENTOT EN LIGNE'` ; l. 42608-42609 | NON | C8 |
| RISQUE | 2.1 | Blocs « ? » de raretés à venir au bout de « SEE ALL ITEMS », qui répondent « — BIENTÔT » au toucher. | l. 43773 (commentaire) / `gMystere` ; l. 48865 `toast(pxi('horloge')+' '+sansAcc(TR(t.getAttribute('aria-label')))+' — '+sansAcc(TR('BIENTÔT')))` | NON | C9 |
| RISQUE | 4.0 / 2.1 | `prompt()` système atteignable si le vieux panneau RÉGLAGES (`#setBtn`) est affiché : copie de secours de la sauvegarde et « Colle ton code de sauvegarde ». Le NOUVEAU panneau (`#mSet`, `data-m="exp"/"imp"`, l. 52249-52263) utilise bien la fenêtre maison `modale()`. Le vieux panneau est dans l'écran-titre de bureau (l. 7540) : je n'ai pas pu confirmer qu'il est caché sur iPhone. | l. 40157 `prompt('Copie ce code :',code)` ; l. 40158 idem ; l. 40161 `prompt('Colle ton code de sauvegarde :')` | PARTIEL (probable : écran de bureau) | C10 |
| À SAVOIR | 3.1.1 | Restes du parcours d'achat en vrai argent : tout le code reste dans le fichier mais il est INATTEIGNABLE après les coupes : toutes les caisses `premium`/`pubs` deviennent `{p:…}` (boucle de la coupe), donc `u.k==='premium'` est faux partout (`gBuy` ne passe plus à `dataset.bout='1'`, l. 43695 ; `shopRender`/`bqPayantes`/`shopPop` ne trouvent rien, l. 29769, 29829, 43854). Les écrans OFFRES (`#mShop`, `data-m="shop"`) et la tuile cadeau sont masqués (`display:none!important`). Chaînes mortes mais présentes : `OFFRE DE LANCEMENT`, `-50%`, `9,99 €`, `ACHETER` (en $ du jeu : légitime), `RESTAURER MES ACHATS`, `Achat unique, via ton compte App Store. À toi pour toujours.`, `Les achats ouvriront à la sortie sur l'App Store.`, `BIENTÔT DISPONIBLE — À LA SORTIE SUR L'APP STORE`. | l. 7587, 7623-7627 ; l. 29774 `<s>…9,99 €</s>` ; l. 29789-29790 ; l. 29819-29820 ; l. 17595 | OUI (inatteignable) | C11 (hygiène, facultatif) |
| À SAVOIR | 3.1.1 | Le « $ » est un décor de monnaie de jeu : aucune conversion en argent réel, aucune pub, aucun achat intégré. Les caisses « légendaires » ex-€ coûtent 2 M + 450 k × l'ancien prix en $ du jeu (CHEVALIER NOIR et DRAGON D'OR ≈ 6 500 000 $). Le réglage `Devise` (`#curRow`, l. 7670) est dans le vieux panneau, sans gestionnaire (aucun autre `curRow` dans le fichier) : si ce panneau est visible, la ligne ne fait rien. | l. 28254 formule ; l. 7670 `<span>Devise</span><b id="tgCur">$</b>` | OUI (monnaie) / PARTIEL (Devise) | C10 couvre `Devise` |
| À SAVOIR | 3.1.1 | PUBS : aucun chemin hors édition portail. `pkPasse()` rend `true` tout de suite si `!POKI` (l. 52566) ; les kits Poki/CrazyGames/Playgama sont vidés ; `commercialBreak`/`rewardedBreak` (l. 103-104) ne sont appelés que par le kit. L'ÉTERNELLE (100 pubs) est convertie en `{p:…}` par la coupe. Texte mort : `REGARDE 100 PUBS` (l. 30173). | l. 52566 `if(!POKI||!pkDeja||pkPasse._dedans)return true;` ; l. 28225 `{k:'pubs',v:100}` | OUI | rien |
| À SAVOIR | 3.1.1 / 1.x | Mode TEST : coupé (`TEST_CAISSES=false`, `TEST_CARRIERE=false`). Reste le texte « CAISSE PREMIUM — offerte pour l'instant » (l. 30171, `case 'prem'`) pas atteignable. L'insigne `<i class="gTest">TEST</i>` (l. 43658) ne s'affiche que si `testOuv`. | l. 30171 ; l. 43658 | OUI | rien |
| À SAVOIR | 2.1 | Message de mort « CRASH TEST RÉUSSI. ENFIN… TEST. » : humour, mais contient « TEST » dans l'écran de fin. | `TR` l. 17491 `CRASH TEST RÉUSSI. ENFIN… TEST.` | NON | à garder ou reformuler (INTERFACE) |
| À SAVOIR | 5.2 | « MOULIN ROUGE » : enseigne dessinée sur une façade de la carte PARIS (monde « PARIS », atteignable en carrière). Marque d'un cabaret. Autres noms réels : PARIS, LA TOUR EIFFEL (« LA DAME DE FER »), « CHAMPS-ELYSEES », « PONT ALEXANDRE III » : lieux publics, sans risque côté texte. | l. 14210 `x.fillText('MOULIN ROUGE',256,34)` | NON | « CABARET ROUGE » (APP STORE `une(...)`) |
| À SAVOIR | 5.2 / 1.x crypto | « CRYPTOCITY / BULL RUN » : tickers `BTC`, `ETH`, `DOGE`, `SOL`, `LAMBO`, `HODL`, `TO THE MOON`, `WAGMI`, `JACKPOT !`, `CASINO`, `LUCKY`. Décor de ville sans aucune mécanique de crypto ni de pari. ET le niveau n'est lancé que par `?niveau=crypto` (l. 14563 `CRYPTO_URL=/[?&]niveau=crypto\b/`, l. 41432 `cryptoPlayOk`) : INATTEIGNABLE dans l'app (pas de barre d'adresse). | l. 13483 `['BTC','$1 000 000','+420 %']…` ; l. 13095 `CASINO` ; l. 13307 `LAMBO` ; l. 13591 `slam(TR('NOUVEL ATH !'),'BTC $ '+pr…` | OUI (inatteignable) | rien ; si Léo ouvre ce niveau un jour : « LAMBO » → « BOLIDE », noms de monnaies → fictifs |
| À SAVOIR | 1.x | `JACKPOT !` / `JACKPOT` : libellé de récompense du jeu (l. 13623-13624, 37785), aucune machine à sous, roulette, pari ni tirage payant. | l. 37785 `JACKPOT!` | n/a | rien |
| À SAVOIR | 2.3 | Aides clavier : le texte HTML `NITRO (ESPACE)` (l. 7491) est remplacé par `NITRO` sur téléphone (l. 51717) et masqué en `body.touch` (l. 1140) ; `glisse pour tourner · molette pour zoomer` (l. 7364) est remplacé par `… pince pour zoomer` (l. 51720). Le bloc « Commandes » clavier (`#setKb`, l. 7681-7688 : « Z Q S D », « Espace », « Entrée ») est masqué en `body.touch` (l. 480-481). Aucune mention d'Android, Poki, CrazyGames, itch, navigateur, PWA, « écran d'accueil » dans ce que le joueur lit (seulement dans les diagnostics d'erreur, l. 2157 `navigateur :`, écran de panne ; et `Sur iPhone, le volume de la voix est verrouillé par le système.` l. 7679, cache). | l. 51717 ; l. 51720 ; l. 480-481 | PARTIEL (par le code tactile du jeu) | revue visuelle sur iPhone : `body.touch` doit être posé |
| À SAVOIR | 2.1 | Paramètres d'URL (`?menu=leo`, `?poki=1`, `?niveau=…`, `?perf`, `?banc`, ~40 clés) et crochets `window.dbg*` : inatteignables au doigt (l'app se charge sur `capacitor://localhost` sans barre d'adresse, aucun schéma d'URL déclaré dans `Info.plist`). Aucun geste secret trouvé (`touches.length>=3`, tap répété, konami : aucun). | l. 61 `const POKI=…/[?&](poki|crazy|playgama)=1\b/` ; l. 14563 | OUI (par construction) | rien |
| À SAVOIR | 2.1 | Réseau au premier lancement : aucune requête hors de l'app. Seules adresses http(s) du fichier = les 3 kits de portail (l. 98, 109, 122), vidées par la coupe. `fetch('version.json')` (l. 52435) ne tourne pas sous Capacitor (garde `window.Capacitor`, l. 52416). `fetch(MUSIC_FREN.f,{method:'HEAD'})` (l. 33934) et `fetch(url)` (l. 35187) visent des fichiers locaux. Police Press Start 2P, Three.js, sons : tous dans l'app. Mode avion : OK d'après le code. | l. 98, 109, 122 ; l. 52416 | OUI | rien |
| À SAVOIR | 2.3 / 4.x | Liens sortants : aucun `<a href>`, aucun `window.open(`, un seul `iframe` (cadre « colonne » pour ordinateur, l. 226) qui n'est pas créé sous Capacitor (l. 207 `window.Capacitor` → retour). `natif.js` et `GardeNavigation` bloquent de toute façon. | l. 207 ; l. 226 | OUI | rien |
| À SAVOIR | 1.x violence | Crashs de voitures, explosion de voitures de police en mode SURVIVANT (« Toutes les 60 secondes, le dernier explose », l. 7596), « T'ES MORT. LES THUNES, ELLES, RESTENT. », pictogramme « TÊTE DE MORT » (l. 40040, un symbole de machine à jetons). Voitures seulement : ni personnage, ni sang, ni arme (aucune occurrence de sang, arme, tuer, drogue, alcool dans les chaînes ; aucune grossièreté). | l. 7596 ; `TR` l. 17492 | n/a | questionnaire d'âge §4 |

### Compléments sur 5.2 (ce que j'ai cherché et NE trouve PAS dans les chaînes affichées)
Aucune occurrence de : Tesla, Cybertruck, Zelda, Minecraft (sauf le nom de fichier `minecraft.m4a`, jamais affiché), GTA (seulement dans des commentaires et le nom de fonction `fmtGta`), Wukong/Black Myth (commentaires et guide seulement ; les niveaux s'appellent « SOLEIL DE JADE » / « PICS DE JADE »), Cars/McQueen (guide seulement), Pixar, Disney, Red Bull, Nike, noms d'artistes ou de morceaux connus (les morceaux s'appellent NÉON CASH CAR, CASH CAR VITESSE, ADDICTIVE LOOP, NOITE DE VELOCIDADE, GLASSY PLUCKS, SWAG CASH CAR, VAPEUR SALON, ASCENSEUR… ; le seul titre d'artiste réel, `HEYMIKEY! — IN DA BACK 2` l. 33608, est commenté et son mp3 n'est pas dans `assets/`). Les titres de morceaux ne sont d'ailleurs pas affichés au joueur (seulement `dbgMusique`).
Mentions de TOUTES les marques réelles trouvées dans des chaînes affichables : CHAT POP-TART / POP-TART CAT, Ferrari (phrase), MOULIN ROUGE, et les noms de modèles listés plus haut. « Eiffel » n'apparaît que dans des textes de menu secondaires (l. 42501 « PARIS BY NIGHT … all the way to the Eiffel Tower », liste de cartes de l'atelier).

---------------------------------------------------------------------
## 4. CLASSIFICATION D'ÂGE — réponses proposées au questionnaire d'App Store Connect

(Rubriques du questionnaire actuel ; je donne « aucun / peu fréquent / fréquent » avec la preuve.)

| rubrique | réponse | justification |
|---|---|---|
| Violence cartoon ou fantastique | **Peu fréquent** | voitures qui s'écrasent / explosent (mode SURVIVANT : « le dernier explose »), effets de cubes ; aucun personnage |
| Violence réaliste | **Aucune** | aucun humain ni animal blessé |
| Violence réaliste prolongée / sadique | **Aucune** | — |
| Grossièretés ou humour cru | **Aucune** (grossièretés) / **Peu fréquent** (humour : « jamais sorti de la puberté », « hanches de starlette ») | aucun mot grossier trouvé dans les 24 923 chaînes ; allusions légères dans des phrases de caisses (l. 17210, 17256) |
| Thèmes matures / suggestifs | **Aucun** (à 4+) ou **Peu fréquent** si on veut être large | « Elle te fait les yeux doux » (l. 17240), « Hollywood a pris la route » : sans image |
| Horreur / peur | **Aucune** | « TÊTE DE MORT » = un symbole de jackpot de jeu |
| Alcool, tabac, drogues | **Aucune** | aucune occurrence |
| Jeux d'argent simulés | **Aucun** | le mot JACKPOT et le décor CASINO (niveau inatteignable) ne sont pas des jeux ; aucun tirage payant ; l'argent du jeu ne s'achète pas |
| Jeux d'argent réels / concours | **Non / Non** | — |
| Boîtes à butin (« caisses ») | **Non** | « caisse » = voiture en argot FR, achat DIRECT d'une voiture connue, jamais de tirage aléatoire payant |
| Contenu sexuel / nudité | **Aucun** | — |
| Accès web sans restriction | **Non** | aucun lien, `GardeNavigation` + `natif.js` |
| Contenu généré par l'utilisateur / messagerie / publicité | **Non / Non / Non** (dans l'app) | aucun réseau ; pseudo du Top 10 local |
| Achats intégrés | **Aucun** pour la v1.0.0 | la boutique en € est coupée |

Résultat attendu : classement **9+** (violence cartoon peu fréquente). Pour viser **4+**, il faudrait répondre « Aucune » à la violence cartoon, ce que le mode SURVIVANT (explosions) rend discutable : je recommande de répondre honnêtement « Peu fréquent ».

## 5. CONFIDENTIALITÉ (5.1) — réponses proposées à « Confidentialité de l'app »

- **Données collectées : AUCUNE** (« Data Not Collected »). Aucune requête réseau, aucun SDK d'analyse ou de pub, aucun identifiant publicitaire.
- Ce que le jeu garde SUR L'APPAREIL (hors réseau) : `localStorage` clés `cashcarSave` (toute la progression, y compris le **pseudo du Top 10** et les scores `leaders`), `ccLang` (langue), `ccCadrageBq` (réglage de cadrage de la boutique), `ccMaj`, `ccPortailSeme`, `ccCtxPerdu` (diagnostics de l'écran de panne), anciennes clés héritées `rrSfx5`, `rrVox5`, `rrLeader5`, `rrBest5`, `rrBestCar5` ; miroir de `cashcarSave` dans `Preferences` (UserDefaults iOS, raison CA92.1 déclarée dans `PrivacyInfo.xcprivacy`, qui déclare : pas de pistage, aucun type de donnée collecté). Le pseudo du Top 10 reste donc sur l'appareil : le seul code qui l'écrit est `saveLeaders` (l. 36926+), sans `fetch` ni `sendBeacon`.
- Autorisations système demandées : **aucune** (`Info.plist` : aucune clé `NS…UsageDescription`, aucun `CFBundleURLTypes`, aucun `NSAppTransportSecurity`). Le code appelle `navigator.wakeLock` (écran qui reste allumé, sans permission) et la vibration (plugin Haptics) ; pas de micro, caméra, localisation, notification, capteurs de mouvement.
- Politique de confidentialité (URL exigée par App Store Connect même sans collecte) : à fournir par Sacha (page d'une phrase : « CASH CAR ne collecte aucune donnée »).

## 6. `alert(` / `confirm(` / `prompt(` atteignables

Source : recherche de `alert(`, `confirm(`, `prompt(` sur tout le fichier (aucun commentaire écarté à la main sauf mention).
- **`alert(`** : aucun appel.
- **`confirm(`** : aucun appel (le commentaire l. 7778 dit que la fenêtre maison `modale()` les a remplacés).
- **`prompt(`** : 3 appels, tous dans le VIEUX panneau RÉGLAGES :
  - l. 40157 `navigator.clipboard.writeText(code).then(…,()=>prompt('Copie ce code :',code));`
  - l. 40158 `else prompt('Copie ce code :',code);`
  - l. 40161 `const c=prompt('Colle ton code de sauvegarde :');`
  Ils répondent aux boutons `#saveExp` / `#saveImp` (l. 7697-7698) du panneau `#settings`, ouvert par `#setBtn` (l. 7540, `openSettings` l. 47137). Le panneau RÉGLAGES du nouveau menu mobile (`#mSet`, l. 7631-7660) passe par `modale({titre:'MA SAUVEGARDE',…})` (l. 52249) et ne déclenche PAS `prompt()`. Atteignabilité du vieux panneau sur iPhone : NON VÉRIFIÉE → C10.

## 7. Ce qui est DÉJÀ coupé par `preparer-www.js` (non re-signalé)
nom « CASH CAR » ; `natif.js` en tête ; version gravée ; kits Poki/CrazyGames/Playgama vidés ; `TEST_CAISSES=false`, `TEST_CARRIERE=false` ; caisses `premium` et `pubs` converties en prix du jeu ; styles `#appStore` (OFFRES, `.gBoutique`, `#mShop`, `#bdShop`, onglet OFFRES de la boutique du garage) ; pas de service worker ; `sw.js`, notes, outils exclus de `www/`. Garde de navigation `GardeNavigation` + `natif.js`. Icône de l'app remplacée (l'émoji 💰 d'Apple n'est pas embarqué).

## 8. NON VÉRIFIÉ
- **Rien n'a été lancé** : toutes les conclusions sur « visible / atteignable » viennent de la lecture du code et du CSS.
- Aspect des 51 caisses actives : emblèmes, calandres, badges (le guide parle de « badge rouge », de « cône à T », de « bouclier AMG »).
- Si le vieux panneau RÉGLAGES (`#setBtn`, `#settings`) et le bouton `.gVerrou` s'affichent bien sur iPhone dans l'état « menu du garage ».
- Si `body.touch` est bien posé dans WKWebView Capacitor (les masquages clavier en dépendent).
- L'origine réelle de `cash.mp3`, `compteur.mp3`, `kaching.mp3`, `compteuse.mp3`, `wow.mp3` (je n'ai que les étiquettes du guide et un tag « 2012 » dans `wow.mp3`) ; la licence des musiques Suno et des voix ElevenLabs.
- Le contenu de `Info.plist` hors clés cherchées, `JeuViewController.swift` (lu en diagonale seulement), `Assets.xcassets` (icône 1024 sans transparence, écran de lancement).
- Si les posters du garage (`buildAffiches`) sont actifs dans l'édition iPhone (le code est inconditionnel).
- La page « Modes » : « PARC FREESTYLE », « BAC A SABLE » (« aucun score n'est enregistré ») : textes corrects, non testés.
- Métadonnées App Store Connect (nom, sous-titre, captures, mots-clés : ne rien y mettre de marque tierce, ni « Nyan »).
