# RAPPORT DU JURY — SONNET (2026-11-05)

Branche `jury/sonnet` (worktree `../CASH-CAR-jury-sonnet`), partie de `jury/jour0` = `origin/main` (ea2d37b4) + le commit du jour 0.
**Je n'ai poussé ni `main` ni rien d'autre. `sw.js` n'est pas touché** (Sacha monte le numéro à la fusion).

## 0. À FAIRE PAR SACHA (dans cet ordre)

1. **Jour 0** (commit `50d7171b`, branche `jury/jour0`, un seul commit au-dessus d'`origin/main`) : `git push origin jury/jour0:main` (fast-forward, ne touche pas le dossier principal).
   Pourquoi une branche et non `main` directement : le dossier principal est partagé avec d'autres sessions et plein de fichiers non committés qui ne sont pas à moi ; un commit là-bas les aurait embarqués.
2. Fusionner `jury/sonnet` (qui contient déjà le jour 0) : `git merge jury/sonnet`, puis `sw.js` +1.
3. `pages-app/confidentialite.html` est sur ma branche (texte vrai : mises à jour depuis GitHub) : **le push de `main` qui le publie est ta décision (IOS-03)**.

## 1. JOUR 0 — FAIT (vérifié)

| ID | Résultat |
|---|---|
| ECO-01 / IOS-01 | `app-ios/preparer-www.js` : la coupe « LE CHARGEUR » est souple (≥ 13, message clair). **Deux autres coupes étaient cassées sur `origin/main`** (le nuancier v3 de ce matin a supprimé `PEINT_EUR_ID` ; et `TEST_CAISSES=false` n'a plus de « true » à remplacer) : la coupe des peintures en € vise maintenant `o.eur=PEINT_EUR[o.r]` (même effet : 0,50 € → 30 000 $ du jeu…), et la coupe TEST_CAISSES accepte `false`. `node app-ios/preparer-www.js --essai "VERSION PRINCIPALE"` : ✓ (655 fichiers). ⚠ la syntaxe est `--essai "<dossier>"`, pas `--essai` seul. |
| ECO-02 | `TEST_CAISSES=false` ; `outils/garde-demarrage.cjs` refuse `TEST_CAISSES=true` (testé sur une copie : refus). |
| ECO-03 | `code/sauvegarde.js` : `o9.mq=L9(s9.mq,200);` |

## 2. A. TEXTES ET TRADUCTIONS

FAIT : INT-04, INT-09, INT-10, INT-11, DIR-05, DIR-24, DIR-25 (partie anglais en FR), DIR-21, DIR-33, ECO-19.
- `code/interface/traductions.js` : un bloc en fin de fichier (« LES CLÉS MANQUANTES DU JURY ») : sous-titres des fruits, DONUT, BOOST, RIEN ICI, BURN-OUT, SECONDE CHANCE, PREMIER MATIN, THE DARK TRIAD, CAPTEUR REFUSÉ…, PENCHE LE TÉLÉPHONE…, `EARLY DEAD → CHAIN LOST`, NOUVEAU → NEW, les 13 `aria-label` (Achat, Aura, Vitesse de départ, Plaque, Cadeau, Volume du son/de la musique, Haut, Bas, Figures, Final spin, Levier). `"RARES":"RARES"` → `"RARES":"RARE"` (DIR-05). RACCOURCI, CHAMPION !, DERNIER !, EXPLOSION DANS, COUPERET DANS, ACCROCHE !, ELLE T'A SEME, LA CAISSE-NUAGE **existaient déjà** (`zones-caisses.js`, par une boucle `Object.entries` que le script du jury ne lisait pas) : rien à ajouter.
- Script de contrôle (scratchpad `i18n-audit.cjs`, étendu aux `Object.entries`) : 9 « manquantes » restent, toutes fausses (couleurs `#fff0b0`, un commentaire, une clé à apostrophe échappée, un nom propre `CAR`, la puce `FR`, un nom dynamique). `aria-audit.cjs` : 0 reste. `aria-labelledby="modT"` ajouté sur `#modale`.
- `SEE ALL ITEMS` (`garage-lacher.js:225`, `boutique-du-jour.js:87`), la pastille `NEW` (`mobile-tactile.js`, la ligne `bs.textContent=…`, seule ligne touchée de ce fichier) et `1.61 PRESENTS` (`intro-161.js:461`, une ligne) passent par `TR()` : FR `TOUT VOIR` / `NOUVEAU` / `PRESENTE` (l'accent d'une capitale tombe en pixel). **En anglais, `TOUT VOIR` donne « SEE ALL »** (la clé existait déjà avec cette valeur dans `garage-rendu.js`, qui charge APRÈS `traductions.js` : je ne pouvais pas la remplacer par « SEE ALL ITEMS » depuis mon fichier). Vérifié à l'écran : « NOUVEAU » sur ACHAT.
- DIR-21 / DIR-33 : `voitures/plaque.js` (fichier non attribué, une ligne et sa clé) : « TEMPS DE JEU » → « TEMPS DANS L'APP » (EN `TIME IN APP`), « TEMPS EN COURSE » → « EN COURSE » (EN `IN RACES`) — partout, pas seulement sous 400 px.
- ECO-19 : `missions/table.js`, textes seulement : « FRÔLE {v} TOURS EN UN SAUT (LA VILLE) », « ROULE {v} KM SUR LE VERGLAS (GLACIER) », « JOUE UNE MAP SOUS TOUTES SES MÉTÉOS », « FAIS UNE PARTIE SANS SON NI MUSIQUE ».

PAS FAIT (hors de la zone que tu m'as donnée, ou sans objet) :
- **INT-22, INT-24** : tout est dans `moteur/mobile-tactile.js` (l.776 `lb9=LANG==='en'?[…]`, l.952 `'FREE':'GRATUIT'`, la ligne AUTO-ECOLE « +$ 500 ») et `gameplay/seconde-chance.js:169` : tu m'as limité à une ligne dans ce fichier. → Opus : `TR('PARTIE')/TR('MOY.')/TR('RECORD')`, `TR('GRATUIT')`, « REVOIR · +$ 500 ».
- **INT-23** (`missions/ecran-revelation.js:28`, `' $'` après le nombre, `' S'`) : fichier d'Opus. → `fmtC(...)` et « s » minuscule.
- **DIR-34** : « VERSION LOCALE · ⚠ » ne se voit qu'en local (`CC_BUILD` est remplacé à la publication) ; le « ⚠ » vient de `page/debut-corps.html:84,113` (Opus) ; « LOCAL » en anglais vient de `passe-textes.js:7` (`'LOCALE':'LOCAL'`, que `traductions.js` ne peut pas écraser : il charge avant). → Opus : `'LOCALE':'LOCAL BUILD'`.
- **DIR-04** (« INVENTAIRE » reste en français au retour de la mort) : Opus.
- `INT-09` : le glyphe « › » de la clé FR `CAPTEUR REFUSÉ : RÉGLAGES › SAFARI` reste (ce sont des lignes de `mobile-tactile.js`) ; la version anglaise utilise « > ».
- **`I18N_FR`** (le français affiché qui diffère de la clé) est une `var` de `passe-textes.js`, chargée après `traductions.js` : je ne peux pas y ajouter d'entrée depuis mon fichier. Conséquence : le bandeau FR « EARLY DEAD » reste « EARLY DEAD » (anglais) ; seule la version anglaise dit « CHAIN LOST ». → Opus : `I18N_FR['EARLY DEAD']='CHAINE PERDUE'`.

## 3. B. CSS

FAIT :
- **INT-03** : la barre MISSIONS (`.mMisBarre`) garde son dessin et gagne une zone de toucher de 44 px par un `::before` (couché : 28 + 16). ⚠ non vérifié à l'écran : cette barre n'est pas affichée sur l'accueil d'un compte neuf (la porte de 113×68 vue au banc est un autre élément).
- **INT-30** : `text-overflow:clip` → `ellipsis` sur les 5 libellés d'une seule ligne (jamais sur un bloc multiligne).
- **INT-13** : `.feNom{font-weight:900}` → 400 (fête d'une caisse). Les étoiles « ★ » sont dans le JS de `fete-caisse.js` : non faites (→ `pxi('etoile')`).
- **INT-19 / DIR-42 (partie contraste et corps)** : `--tx3` `#9a90c8` → `#aea5d8` ; les corps de 6 px passent à 7 px (`.ivT small`, `#engVigTier`, `#misBan .mbTx small`).
- **INT-43** : table des couches (commentaire) en tête de `charte-1-touches.css` ; `#m2Rev` de 95 à 93 pour qu'une fenêtre `#modale` (95) s'ouvre au-dessus de la révélation.
- **DIR-22** : en couché, le bloc JOUER prend `margin-right:max(6px,var(--sR))` (il dépassait de 4 px).
- **DIR-14** : déjà réglé (la zone de toucher des onglets fait 44 px par `::after{top:-5px;bottom:-5px}`, `garage-hub-boutique.css:251`) : le rectangle visible, lui, fait 34 px.
- **DIR-15 / 16 / 17 (MESURÉ au banc, SE et debout)** : à la fin du défilement, le dernier élément s'arrête 30 à 36 px AU-DESSUS de RETOUR (réglages : 563 contre 593 ; achat : 557 contre 593). Le chevauchement vu par le jury est l'état en milieu de défilement, avec le fondu qui existe déjà. Rien à changer ; l'indice de défilement reste à décider.

PAS FAIT (demandent un banc d'images itératif sur des règles empilées à `#garage#garage#garage…` et `!important` ; je n'ai pas voulu livrer du CSS non vu) : DIR-13, DIR-18, DIR-20, DIR-23 (c'est le JS qui écrit l'espace fine entre les milliers), DIR-35 (`mort-flottante.css`, exclu), DIR-38, DIR-39, DIR-44, DIR-48, INT-12 (glyphe › dans `auto-ecole.js`), INT-14, INT-25, INT-41 (`mort-flottante.css`), et les corps de 4 et 5 px (`socle-1.css:289-290`, `socle-3-hud.css:17`, `ecrans-iphone.css:29` « ACCUEIL » 6 px `!important`).

## 4. C. TABLES ET PETITES VALEURS

FAIT :
- **ECO-07** `deblocage.js` : L'ICEBERG 32 M → 3,2 M ; LE DOGE 40 M → 4 M (lignes `{p:…}` seulement).
- **ECO-11** `cars.js` : POSTER 84 reçoit `rar:'legendaire'` (la fiche est à l'index 5 du tableau, pas 84).
- **ECO-12** : la règle « LÉGENDAIRE = boutique € seulement » est écrite comme morte (commentaire de `aura-banque-contrats.js`).
- **ECO-28** : en-têtes de `cars.js` et `deblocage.js` (91 lignes, 50 actives).
- **ECO-31** `final-spin.js` : sacs ×10 (60 000 / 150 000 / 500 000 ; espérance ≈ 16 800 $ ; le jackpot garde 500 000 + une épique).
- **RND-03** `palier-appareil.js` : `memToiles` aussi sous `ALLEGE`. **RND-28** `piste-prebati.js` : `PISTE_MOY` sur `ALLEGE`.
- **GP-06 / 07 / 10 / 29** : une ligne de remises à zéro dans `resetGame` (`seconde-chance.js`), uniquement ce qui est listé dans le rapport gameplay.
- **GP-13** `boucle-1.js` : R = respawn seulement sous `?dev` (la touche est toujours consommée).
- **GP-40** : déjà fait (`loopWarn` appelle `__ccNote`).
- **DIR-31** : `flatShading` retiré des `MeshLambertMaterial` qui le portaient (`garage-salle.js`, `atelier-ferme.js`, `boutique.js`) ; les `MeshPhongMaterial` le gardent (il y est valide).
- **ECO-09** : `passation/ECONOMIE.md` réécrit : table des 50 caisses actives (n°, nom, rareté, prix · condition), le trou 80 k → 250 k → 500 k, l'ancien texte gardé en archive.

PAS FAIT :
- **ECO-14** (`defis-moteur.js`, palier 10 à « 0/9999 ») et **ECO-22** (témoin `bientot` dans `preparer-www.js`) : hors zone (missions/moteur, preparer-www = Opus).
- **ECO-24** (`maps` / `maps2`) : ce n'est pas qu'un doublon de sauvegarde, ce sont deux **missions** qui paient (30 000 $ et LE ROUGE-GORGE) ; en supprimer une retire une récompense : **décision de Sacha**. **Je n'ai donc touché à aucune autre ligne de `sauvegarde.js`** que `o9.mq` du jour 0 (Fable : rien à fusionner de mon côté).
- ECO-30 (commentaires de prix) : seulement les deux lignes que j'ai changées.

**Lignes de `cars.js` / `deblocage.js` touchées (pour la fusion avec Opus, D4)** : `cars.js` l.2 (commentaire d'en-tête) et la fiche POSTER 84 (l.29, ajout de `rar:'legendaire'`) ; `deblocage.js` l.2 (en-tête), l.29 (commentaire), et les lignes `{p:…}` d'ICEBERG (~l.112) et DOGE (~l.116). Aucune ligne n'est insérée ni retirée.

## 5. D. NETTOYAGE

FAIT :
- **SON-09** : `FX_ARGENT`, `fxPreload`, `fxEls`… retirés de `son/fanfare-turbo.js` (restent trois coquilles vides `fxStop/fxPreload/fxTick` pour les appelants de `init.js`, `curseurs.js`, `seconde-chance.js`, `boucle-6-hud.js`) ; les 4 mp3 de `assets/audio/fx/` supprimés (le dossier disparaît ; `preparer-www --essai` : 659 → 655 fichiers).
- **HYG-12 (en partie)** : 13 fonctions jamais appelées retirées, trouvées par acorn (un seul jeton d'identifiant = sa déclaration, aucune occurrence entre guillemets) : `lisseDiffuse`, `palDonne`, `courroie10`, `sphN10`, `bete30`, `h4_naissance`, `h3_poly`, `fx3_comete`, `djReste`, `glyphes`, `allumage`, `dGraine`, `orbAlea` (≈ 15 Ko). `dunes-dieux/gizeh` étaient déjà partis ; `dnScenes` (`dunes-4.js`) laissé : fichier interdit tant que la session Arrakis n'a pas dit « fini ».
- **IOS-03** : `pages-app/confidentialite.html` = le texte de `app-ios/fiche/` (mises à jour depuis GitHub). **IOS-15** : `.gitignore` += `.claude/`, `.playwright-mcp/`.
- **HYG-11 / ECO-17** : il n'y a **pas de liste de 27 crochets** dans `publie-allege.cjs` : il retire tout seul tout `window.dbgX=` qu'aucun autre code ne nomme. Les survivants sont ceux que le jeu teste (`typeof dbgX`). Rien à compléter ; reste à brancher `publie-allege` dans `preparer-www` (Opus) puis à relire `grep -o "window\.dbg[A-Za-z]*" app-ios/www/index.html`.

PAS FAIT (raison) :
- **HYG-21** : le chiffre du jury est faux : acorn compte **11 163** `//` après du code (pas 348). Les convertir toucherait des milliers de lignes de presque tous les fichiers et ferait conflit avec les branches d'Opus et de Fable : à ne pas faire cette semaine. (Le script `h21.cjs` du scratchpad le fait proprement si Sacha le veut un jour, sans écrire par défaut.)
- **HYG-08** (18 `setInterval`) : tous les sondages permanents commencent par un `return` quand l'écran n'est pas là ; les arrêter demande des crochets d'ouverture/fermeture dans des fichiers d'Opus et de Fable. Risque > gain avant la soumission.
- **HYG-09** (30 variantes `?x=ancien`) : chaque suppression est une chirurgie de comportement dans des fichiers d'autres zones, sans filet de test ; non faite.
- **SON-20** (15 Mo de musique) : les morceaux (`lobby/ciel-*`, `chris-matin`, `intro/pad-*`) servent encore des variantes (`?lecon=musique`, `?lit=`) et leurs références sont dans `son/musique.js` (Fable) ; ce sont des fichiers de Léo : **décision de Sacha** (la correction du jury elle-même est de les ajouter aux `rm` de `vercel-build.sh` et à la liste de `preparer-www`, pas de les effacer du dépôt).
- **SON-11, 19, 10/14/16/18/21/24/25/32, 33 à 40, INT-17/18/32/33, ECO-20/29/32, HYG-14, IOS-22/23/27, IOS-33 à 45, HYG-24 à 40, INT-46 à 52, RND-10** : non faits. IOS-22/23 sont dans `preparer-www.js`/`boutique.js` (Opus) ; IOS-27 modifie `vercel.json` (en-têtes de sécurité) et peut casser le site en ligne (iframe des portails, capteurs de l'inclinaison) : décision de Sacha ; RND-10 attend la fin de la session Arrakis.

## 6. VÉRIFICATION (ce qui a tourné)

- `node code/assembler.cjs --verifier` ✔ · `bash garde-allege.sh` ✔ · `node outils/garde-demarrage.cjs` ✔ · `node app-ios/preparer-www.js --essai "VERSION PRINCIPALE"` ✔ (à chaque commit).
- Banc : `playwright-core` + Chrome sur `VERSION PRINCIPALE` servie en local (`?garde=1&tel=1&lecon=non`), accueil → réglages → achat → garage → course → mort → REJOUER (= `resetGame`) → mort → garage, **0 erreur de page**. Le seul message console est `readRenderTargetPixels … Framebuffer not complete` (rendu logiciel du Chrome sans GPU, absent des captures du jury avec GPU).
- Formats passés (voir le § 7) ; **non passés** : les 6 rayons de la boutique 3D, missions, profil, et un parcours complet en EN dans les trois formats : le banc, sur ce PC chargé, met 2 à 4 minutes par format.

## 7. POINTS HORS ZONE LAISSÉS AUX AUTRES

Voir §§ 2 à 5 : Opus — INT-22/23/24, DIR-04, DIR-34 (`passe-textes.js:7`, `debut-corps.html:84`), `I18N_FR['EARLY DEAD']`, ECO-14, ECO-22, IOS-22/23, branchement `publie-allege`, étoiles `★` de `fete-caisse.js`, `›` de `auto-ecole.js` ; Fable — rien de `sauvegarde.js` ; `son/musique.js` si SON-20 est décidé ; Sacha — ECO-24, SON-20, IOS-27, push de la confidentialité.
Doublons d'I18N contradictoires (INT-21) : `'RARES'` (corrigé ici), `'TOUT VOIR'` (`garage-rendu.js` l'emporte sur `traductions.js` : c'est l'ordre de chargement).
