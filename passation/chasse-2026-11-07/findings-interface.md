# Chasse — interface / écrans / I18N (agent Sonnet, 2026-11-07)

Comptage : 0 bloquant, 2 majeurs, 5 mineurs. Scripts : chasse/interface/ (ids.cjs, ids2.cjs, i18n.cjs, trkeys.cjs, annonces.cjs, conflits.cjs, libres.cjs, chaines.cjs, lis.cjs).

Limites : lus en entier figures-selecteur.js et fil.js ; en partie icones-fenetre.js (15-200), auto-ecole.js (1-140), garage-menu-inventaire.js (1-20, 236-327), boutique-scene-1.js (185-520), economie/boutique.js (1-180, 340-420, 636-660), missions/atelier.js (60-175, 290-300), ecran-revelation.js (11, 41-330), seconde-chance.js (1-200, 322-335, 532-545), plaque.js (236-330), mobile-tactile.js (560-680, 925-1012), ecranWipe. Non lus en entier : atelier-ferme, richesse-1/2/3, chute-menu, garage-salle, habillages-accueil, photos-films, vignette-moteur, burn-out, bouton-rouge, garage-cadrage, page/*.html, boutique-du-jour.js.

## A. Audit du 11-05
| ID | état | preuve |
|---|---|---|
| INT-01 | OUVERT web (décision Sacha « remets-le ») / CORRIGÉ app | icones-fenetre.js:26 `ACHAT_EUR=(!EN_APP&&…)` ; boutique.js:12 `shopPaye` rejette ; :36-41 INDISPONIBLE ; :646 toast ; app : preparer-www.js:93-145 |
| INT-02 | CORRIGÉ | ecrans-menus.html:26 `role="region"` |
| INT-03 | CORRIGÉ | garage-hub-bas.css `.mMisBarre::before` |
| INT-04 / DIR-25 | CORRIGÉ | boutique-du-jour.js:87 `TR('TOUT VOIR')` |
| INT-05 | CORRIGÉ | ecran-revelation.js:263-272 (voir INT-N05) |
| INT-06 / DIR-45 | CORRIGÉ | intro-161.js:246, :387 |
| INT-07 | OUVERT | debut-corps.html:138 (un toucher sur #mvVer) ; voir INT-N07 |
| INT-08 | CORRIGÉ | garage-menu-inventaire.js:308-317 |
| INT-09/10/11, DIR-05, DIR-24 | CORRIGÉ | traductions.js:402-407 ; 0 `TR('…')` sans clé EN |
| INT-12/13/14/19/22-25/27-35, DIR-47, INT-37/41/43/46-52 | NON VÉRIFIABLE | visuel |
| INT-15 | OUVERT (mineur) | atelier.js:68-80, ecran-revelation.js:246 sans `uiGarde()` |
| INT-16 | NON VÉRIFIABLE | |
| INT-17/18 | OUVERT | ecrans-menus.html:45,180,201-209 (#setBtn, #settings, #setTouch), ecrans-garage.html:258 (#resetBtn) existent ; visibilité non vérifiée |
| INT-20 | OUVERT (décision web) | boutique-scene-1.js:235 rayon `achat` si ACHAT_EUR |
| INT-21 | OUVERT | 45 clés EN contradictoires (conflits.cjs) ; deux visibles : INT-N01, INT-N04 |
| INT-26 | OUVERT partiel | `estCouche()` vs `cou=W>H*1.2` (boutique-scene-1.js:367) vs `VP.w>VP.h` ; sans effet sur iPhone |
| INT-36 | OUVERT (panneau legacy) | menu-logo.js:146,150 `prompt()` |
| INT-38 | CORRIGÉ | mobile-tactile.js:454 |
| INT-40 | CORRIGÉ | garage-menu-inventaire.js:298-305 |
| INT-45 | NON VÉRIFIABLE | |
| DIR-04 | CORRIGÉ | garage-lacher.js:221-223 |
| DIR-26 | NON VÉRIFIABLE | |
| DIR-36 | CORRIGÉ | garage-menu-inventaire.js:322-327 |
| DIR-30 | CORRIGÉ site | garage-menu-inventaire.js:285-297 |
| DIR-33/34 | CORRIGÉ en partie | plaque.js:329 ; passe-textes.js:12 |
| DIR-29 / IOS-04 | CORRIGÉ | seconde-chance.js:14, :119-123 ; mobile-tactile.js:951 ; mort-flottante.css:302 ; seconde-chance.js:322 |
| DIR-46 / D8 | CORRIGÉ | plaque.js:304-310 (après la 1re course), RETOUR en mode premier (:296-298) |

## B. Nouveaux défauts

### INT-N01 · MAJEUR · « ANNULER » s'affiche « UNDO » dans tous les dialogues EN
- Où : figures-selecteur.js:17 (`Object.assign(I18N,{… 'ANNULER':'UNDO' …})`, inconditionnel) écrase traductions.js:394 (`"ANNULER":"CANCEL"`, gardé par `if(!(k in I18N))`). ORDRE : traductions l.109, figures-selecteur l.244.
- Quoi : en EN, le bouton qui annule « TOUT EFFACER ? » (collé à ERASE), « ENTRER UN CODE » et la fenêtre d'achat de caisse (boutique.js:63) dit « UNDO ».
- Correction proposée : clé propre pour la puce : l.67 `TR('ANNULER LE CHOIX')`, l.17 `'ANNULER LE CHOIX':'UNDO'`, supprimer `'ANNULER':'UNDO'`. Ou `'ANNULER':'CANCEL'`.
- Confiance : haute.

### INT-N02 · MAJEUR · Web : tout ce qui est en « € » a un ACHETER qui répond « indisponible »
- Où : boutique.js:12, :36-41, :644-646 ; boutique-scene-1.js:416-420 (`bqEtat`), :235 ; icones-fenetre.js:26.
- Quoi : rayon ACHAT, caisses premium et presque toute la grille PEINTURES (« UNIES · 1 € », « ANIMÉES · 3 € ») : prix € + lingot ACHETER ; le toucher secoue et dit « L'achat est indisponible pour le moment. » ; fenêtre « Achat unique, via ton compte App Store » (boutique.js:64) sur le web.
- Correction proposée : décision produit. Au minimum sur le web : « Bientôt disponible » ou cacher ACHETER sur les items `eur` (`bqEtat`: `if(d.eur&&!ACHAT_EUR)…`).
- Confiance : haute sur le comportement.

### INT-N03 · MINEUR · La puce ANNULER des figures survit à la fermeture de l'écran
- Où : figures-selecteur.js:63-69 (`fsPuce`, `fsMontre`, `fsCache`) ; figures-selecteur.css:11,16 (`#fsUndo{position:fixed;…z-index:97}`).
- Quoi : équiper une figure affiche la puce 5 s ; RETOUR ou JOUER dans ces 5 s → la puce reste au-dessus de l'écran suivant, y compris le début de course (48 px en haut, capte le doigt) ; un toucher appelle `fsAnnule()` et remet `SAVE.d.figEq3` pendant la partie.
- Preuve : `FSEL.tm=setTimeout(fsCache,5000);}` (:67) ; aucun appel de fsCache hors du fichier.
- Correction : `fsCache()` dans `invFerme()`, sortie de boutique, `closeGarage()` / `start()`.
- Confiance : moyenne.

### INT-N04 · MINEUR · « SÉRIE 3 JOURS » devient « COMBO 3 DAYS » en EN sur l'écran de fin
- Où : ecran-revelation.js:205 (`'SÉRIE':'COMBO'`) écrase mute-cadeau.js:131 (`'SÉRIE':'STREAK'`) ; consommateur mute-cadeau.js:124.
- Correction : clé distincte pour la pastille de série (ecran-revelation.js:226), ou `TR('SÉRIE DE JOURS')` en mute-cadeau.js:124.
- Confiance : haute.

### INT-N05 · MINEUR · « TOUCHE ENCORE POUR RETIRER » tombe avec un double-tap
- Où : ecran-revelation.js:263-272. Correction : ignorer le 2e toucher < 400 ms après l'armement.
- Confiance : moyenne.

### INT-N06 · MINEUR · Textes FR du vieux panneau #settings sans clé EN
- Où : ecrans-menus.html:202-204,209 (« Pouce gauche », « volant (glisse le pouce) », « En vol + NITRO », « pouce en haut / en bas = assiette », « pouce droit ») ; #saveExp « Copier ma sauvegarde » (clé EN avec emoji, traductions.js:26).
- Confiance : basse sur la visibilité.

### INT-N07 · MINEUR · La ligne VERSION peut afficher « · ⚠ n » au testeur
- Où : debut-corps.html:111,140. Correction : ⚠ seulement hors EN_APP ; vider la boîte à chaque version.
- Confiance : moyenne.

Constats négatifs vérifiés : tous les ids visés par le JS existent (sauf `spNote`, gardé init.js:88,106) ; aucun identifiant non déclaré (acorn ; `genParis` branche morte piste-prebati.js:95) ; localStorage toujours sous try ; aucun écouteur ajouté à chaque ouverture ; ecranWipe ne reste pas bloqué (filet 160 ms) ; sélecteur de figures correct à la lecture ; boutique 3D ne jette ni sur rayon vide ni sur `retire:1`.

## C. Clés I18N manquantes
Aucune clé `TR('…')` littérale sans entrée EN. Panneau legacy #settings : voir INT-N06. Mauvais sens : ANNULER (INT-N01), SÉRIE (INT-N04). 45 doublons contradictoires sans effet visible (À GAGNER, À ACHETER, RECORD, ENSUITE, TOURNE, IL TE MANQUE…).

## D. Non vérifié
Tout le visuel ; visibilité réelle du panneau legacy #settings ; ordre effectif de l'I18N (déduit d'ORDRE.txt) ; patch preparer-www.js non rejoué ; fichiers non lus en entier ; rotation en cours d'écran (seuls garBqPanneau et reflow lus) ; INT-16, INT-45, DIR-26, DIR-33.
