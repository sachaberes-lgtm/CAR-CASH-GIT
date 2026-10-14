# carriere-missions — refonte de l interface, charte 6 (2026-10-14)

## Journal
- c2ae4db — TACHE 1 : plus aucun « BIENTOT » dans le garage. `#gMenuBas .gVerrou` et `#gStrip>.gT.gMys` en `display:none` (fin de `c6-garage`) ; `gStripModeVoitures` ne construit plus
  les blocs `gMystere()` sous c6 (garde JS, 1 ligne). Les noeuds restent (le script lit `.gVerrou`).
- 7a33dca — TACHE 2 : carriere + missions (voir ci-dessous).
- (dernier commit) — « CHALLENGE n » en anglais : la case passe au-dessus du libelle (`flex-wrap`) sous 700 px couche et debout.
- Banc : `banc/cm/cm.cjs [formats] [lang]` (garage sans BIENTOT, carriere mondes/niveaux, ◀, missions, ◀, lancement). 3 passages faits (couche fr ; debout+i7couche fr ; couche+debout+i7couche en).

## CARRIERE (#carr)
- JS : `carrVue` sous c6 delegue a `carrVueC6(bi,el)` (nouvelle fonction juste apres) ; l'ancien code reste pour `?ui=5`. Memes `data-c` que l'ancien ecran : l'ecouteur de `#carr` n'a pas bouge.
- Markup : `.c6Tete.plein` (◀ `.c6Ret` + `.c6Titre`) · `.cmCorps` > `.cmGrille.cmMondes|.cmNivs` > `.cmCarte` · `.c6Bas` > `.pbtn.pb-gold.big.cmJouer`.
- Carte de monde : icone, nom (12 px), « 2 / 5 », `.c6Jauge`. Carte de niveau : numero 16 px, nom 8 px. Etats : fait = coche blanche ; en cours = face blanche
  (monde = celui que lancent les PLAY (`carrSel`) ; niveau = `f`, le prochain a finir) ; verrouille = cadenas + opacite .5 (`.verr`).
- JOUER (or, bas droite couche / pleine largeur debout) lance l'etape EN COURS : page des mondes → `carrSel()` ; page d'un monde → son niveau a finir. Toucher un niveau le lance toujours.
- Une zone qui defile : `#carr` ; en-tete et bas colles (sticky, fond d'encre).

## MISSIONS (#gMis)
- HTML : `#gmHead` recoit un `.c6Ret` (◀, `hidden` hors c6) ; JS : 1 ligne `clicM('#gmHead .c6Ret', garMisRetour)`. `#gmBas .gmHome` (HOME) masque sous c6, noeud garde.
- Mise en page inchangee (`gmPlace` calcule les cartes depuis `#gmHead` et `#gmBas` : couche = cartes a droite de l'en-tete large de 200 px, debout = sous l'en-tete).
- Peau : voile d'encre plat .45 (plus de trame ni de balayage), cartes d'encre a filet blanc 2 px + tranche 4 px, fils blancs pleins 2 px (la constellation en pointilles .5),
  points carres (creux = a faire, pleins = fait/suivi), jauge `.gmP u`, prime en vert, case a cocher : vide / pleine (suivi, face blanche) / coche blanche (fait).
- « SUIVI EN COURSE », « MEILLEUR ESSAI x / y » masques sous c6 (la jauge et la face blanche le disent). `#gmSous` (« CARNET 1 ... ») masque ; `#gmAide` = la phrase unique, en `--sans` 13 px.

## RETIRE / DEPLACE
- Garage : bouton « BIENTOT » du menu bas ; trois blocs « ? » de raretes a venir au bout de SEE ALL ITEMS.
- Carriere : titre en haut a gauche + livree, dock RETOUR/HOME en bas, pastille « 0 / 5 ▸ » (n'est plus un bouton), ciel colore des cartes, « NIVEAU 1 » sous la jauge, bande d'horizon des niveaux.
  ⚠ Toucher une carte de MONDE n'est plus « lancer son niveau » mais « ouvrir ses niveaux » (JOUER lance directement ; voir a trancher).
- Missions : bouton HOME du bas, ▶▶▶ de JOUER, crochets cyan, trame et balayage, lueurs.

## POUR LE SOCLE
- Aucun composant ajoute au socle. Locaux : `.cmCarte` (carte d'etape, 3 etats), `.c6Bas` (barre du bas collee avec la decision). A remonter si d'autres ecrans de choix en ont besoin.

## POUR LES AUTRES
- `html.c6 body #garage.missions` : `#gC6Tete` du hub est volontairement masque en missions (regle existante) ; `#gmHead .c6Ret` fait le travail.
- Les faisceaux et anneaux 3D des ancres (`gmHoloBuild`, cyan/or additifs) sont dans la scene : non touches.
- « Reclamer » n'existe pas dans le jeu (la recompense se voit dans la boutique en touchant sa carte) : JOUER reste l'unique or de l'ecran des missions.

## RESTE / QUESTIONS
- NON VERIFIE A L'ECRAN : le correctif « CHALLENGE n » (flex-wrap, 3e passage deja consomme ; calcul : 88 px ≤ 91/98 px) ; l'etat VERROUILLE de la carriere (la version test `TEST_CARRIERE` ouvre tous
  les niveaux : le cadenas n'a jamais ete vu) ; le toast et la secousse d'un niveau ferme ; carriere debout avec 10 niveaux (Paris/Espace : defilement) ; i7debout 375×667 ; la mission « reussie » (coche) ;
  `?ui=5` (calcul : `carrVue` inchange, `.c6Ret` de `#gmHead` en `hidden`) ; `?play=carriere` ; la pastille de monde `.choisi` (PLAY_CARR) ; carriere ouverte pendant une course.
- Le garage : « BIENTOT visibles : aucun » avant comme apres (le menu `#gMenu` est deja cache par `garMenuH`) ; les blocs `.gMys` sont dans l'inventaire « tous » (SEE ALL ITEMS), non ouvert au banc.
- A TRANCHER : (1) monde = carte qui ouvre (choix actuel) ou qui lance (comme avant, Leo 30/09) ; (2) JOUER de la page des niveaux lance le niveau en cours, pas un niveau « choisi » (il n'y a pas de selection) ;
  (3) la carte « RECOMPENSE » garde le nom et la famille en couleur de rarete (sens, inline) ; (4) i7couche : titre « CHALLENGE n » sur 2 lignes dans la carte (case au-dessus).

## P1 CARRIÈRE — cartes pleine largeur (2026-10-14, commit 0874046 + retouches de CSS)
- `carrVueC6` + `<style id="c6-carriere-missions">` réécrits. MONDES : une carte pleine largeur par monde = le CIEL (photo `maps-ciel/img/sh<n>-volant.jpg` pour SKY HIGH, `v<n>-volant.jpg` pour VILLE : celle du niveau où l'on en est ;
  PARIS et ESPACE n'ont AUCUNE photo → ciel à bandes dures en CSS : nuit/horizon ambré + skyline pour Paris, noir + limbe de la planète du niveau pour l'Espace), nom (pixel 16 px), état (EN COURS / FINI / À FINIR / NOUVEAU,
  texte système 13 px, accents gardés), « n / total » et la jauge. Le monde que JOUER lance a le filet d'or de 4 px ; fini = coche. Debout : une carte par rangée, la photo à gauche (42 %), les rangées se partagent la hauteur.
  Couché : 4 colonnes, la photo en haut. NIVEAUX : même carte (photo du niveau pour SKY HIGH/VILLE), numéro pixel 16 px, nom en 13 px, état fait (coche) / en cours (or) / à finir / verrouillé (cadenas + « Termine le niveau n ») ;
  une rangée par niveau debout (jamais de case seule), 5 colonnes couché. JOUER dit « JOUER · SKY HIGH 3 » (16 px : 24 px ne tient pas). `cousin()` ouvre aussi les niveaux (comme `carrSel`).
- Les images sont lues de `maps-ciel/img/` (jamais modifiées) : ⚠ ce dossier est un OUTIL (`vercel-build.sh` le retire du site, `poki-construire.js` aussi) → pour la sortie, soit le laisser sur Vercel/app-ios (≈ 100 Ko × 10),
  soit copier ces 10 jpg dans `assets/` et changer le préfixe dans `carrVueC6`. À décider.
- SKY HIGH : aucune traduction française dans le jeu (nom voulu par Léo le 04/10 : « renomme CLOUDS par SKY HIGH »), pas renommé. À TRANCHER avec Sacha/Léo (ex. « HAUT CIEL »).
- VU À L'ÉCRAN (banc, 375×667 · 390×844 · 430×932 debout, 844×390 · 667×375 couché, version avant les retouches de min-hauteur) : mondes et niveaux SKY HIGH/PARIS corrects, 0 erreur JS, 0 texte < 11 px, aucun texte coupé en debout.
- NON VÉRIFIÉ À L'ÉCRAN (machine à charge 300-450, aucun navigateur relancé) : les retouches faites après les captures (hauteurs min 100/76 px pour que 4 mondes / 5 niveaux tiennent en 375×667 ; skyline de Paris ; mots de niveau non coupés en couché
  `overflow-wrap:normal` + marges 8 px — « PREMIERES LUEURS » se cassait en « PREMIERE/S » à 667×375) ; l'état VERROUILLÉ (copie `TEST_CARRIERE=false` servie sur 8592 prête, jamais ouverte) ; l'anglais et le chinois ; `?ui=5` ; les captures
  « avant » complètes (seul 375×667 existe) et la planche `carriere-avant-apres.png` (non faite). Banc : `banc/cm/p1.cjs <avant|apres|verr|ui5> <port> [formats] [lang]` ; serveurs : avant = 8591, verrouillé = 8592 (dossiers du scratchpad, liens vers le worktree).
