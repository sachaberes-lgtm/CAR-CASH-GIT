# LOT PETITS — les petits défauts de la relecture, côté interface (15/11)

Branche `qa/petits` (worktree `~/cash-car/qualite-petits`), partie de `qualite-appareil`. Fichiers touchés : `code/css/reglage-image.css`, `code/sauvegarde.js` (`Q2_ON` seulement),
`code/moteur/mobile-tactile.js` (un commentaire du bloc IMAGE), `passation/qualite/menus.md`, `passation/qualite/reglages.md`, et des bancs (`outils/banc-petits/`, `outils/banc-menus/s-derog*.cjs`, `s-serie.cjs`, 4 formats de plus dans `menus.cjs`).
Rien dans `code/maps/*`, ni les fichiers des autres sessions ; `index.html` non commité (l'intégrateur réassemble). L'ORDINATEUR (`!TEL_NATIF`, et `body.touch` absent) ne change pas.
Banc : `outils/banc-petits/petits.cjs` (le banc `reglages.cjs` à n'importe quelle taille `--w --h`, DPR 3, iPhone émulé tactile + UA, `?appareil=iPhone14,2` vérifié `tel:true`, muet), ports 9841/9842.
Planches (AVANT à gauche, APRÈS à droite, même scène, pixels d'écran ×3) dans `passation/qualite/photos/petits/`.

## (1) n11 — choix BASSE | HAUTE rogné dans la pause couchée étroite — FAIT, VÉRIFIÉ
- Cause (confirmée au banc : `.tp.ligne` 168 px, contenu 184 px, `deborde:true` à 667 FR et 568 FR/EN) : le choix avait sa largeur naturelle (131 px) dans une colonne de 82 à 110 px, et `.tp.ligne{overflow:hidden}` rognait.
- Correctif CSS, `css/reglage-image.css` : couché ≤ 820 pt, le choix prend la largeur de sa colonne (jamais plus), moitiés `flex:1 1 0`, sans interlettrage. Couché ≤ 620 pt (Zoom 568), la colonne ne fait plus que ~84 px (il en faut 90) : la case IMAGE (elle seule) rend la colonne de l'icône, libellé et choix courent sur toute la case.
- VÉRIFIÉ : `deborde:false` aux 10 couples format × langue (667×375, 568×320, 693×320, 844×390, 932×430 ; FR et EN) ; photos relues (Read) : 667 et 693 = HAUTE entier, patin entier ; 568 = IMAGE sans icône, BASSE | HAUTE / LOW | HIGH pleins. 844×390 et 932×430 : écart de pixel ≤ 24/255 sur la zone du choix et AUCUN pixel > 40 (le fond 3D bouge) : inchangés. ≥ 821 pt : aucune règle ne joue.
- Debout (réglages 375×667 et 320×568, FR et EN) : pas de débordement avant ni après (`n11-reglages-debout.png`), rien changé.
- Planches : `n11-667x375.png`, `n11-568x320.png`, `n11-693x320.png`, `n11-844x390.png`, `n11-932x430.png`, `n11-reglages-debout.png`.
- NON vérifié : l'inclinaison (`skewX`) du choix sur WebKit réel aux largeurs étroites ; l'icône absente à 568 pt (choix de mise en page : à juger sur un iPhone en Zoom d'affichage).

## (2) n3 / n6 / n12 — `?sans=reglage2` — RETIRÉ (le plus simple et sûr)
- Pourquoi retirer plutôt que réparer : sur un téléphone profilé, `PRF.q = prfQ(SAVE.d.q)` range `'net'` au défaut de la classe, et le niveau d'image N1..N4 ne connaît que BASSE et HAUTE. Rendre le cycle à trois crans (qSuivant, qLbl) aurait affiché NETTE sans donner une troisième image : un état mixte, pire que le défaut. Le vrai témoin d'avant existe déjà : `?sans=profil` (`PRF.on` faux : `Q2_ON` faux, trois crans, ancienne migration, ancienne image).
- `code/sauvegarde.js` : `Q2_ON = TEL_NATIF && PRF.on` (plus de lecture de l'URL), commentaire corrigé ; commentaire de `mobile-tactile.js` corrigé ; `reglages.md` corrigé. Plus aucune mention du drapeau dans `code/` ni `outils/`. Reste cité dans `integ.md` (lignes 12 et 93, rapport d'intégration hors de mon lot, non retouché) et dans les JSON des critiques (historique).
- Cohérence : sans l'interrupteur, `Q2_ON === PRF.on` sur téléphone (`PRF` n'est calculé que si `TEL_NATIF`, et `prfHors` s'exécute dans `palier-appareil.js`, avant `sauvegarde.js`) : `qSuivant`, `qLbl`, `prfQ` et l'écran disent la même chose, sans toucher à `nettete-qualite.js`.
- VÉRIFIÉ au banc (pause 667×375 FR, build final) : `?appareil=iPhone14,2` et `?appareil=iPhone14,2&sans=reglage2` rendent EXACTEMENT la même chose (BASSE | HAUTE, `deborde:false`, le paramètre ne fait plus rien) ; sans modèle (`?sansmodele=1`, `PRF.on` faux) → trois crans, MOYENNE affichée, un tap → HAUTE.
- VÉRIFIÉ au banc (844×390 FR, pause) : `?appareil=iPhone14,2` → BASSE | HAUTE (voir plus bas) ; `?sans=profil` + sauvegarde `{q:'net', qChoisi:1}` → `q` reste `net`, libellé MOYENNE, un tap → HAUTE (trois crans d'avant), aucune exception.

## (3) n2 — dérogation des quatre classes `qm*` — ÉCRITE et VÉRIFIÉE
Voir `menus.md`, section « DÉROGATION ». Photos : `n2-derogation-palier2.png` (série, halo ½, volant, inventaire), `n2-derogation-palier0.png`, `n2-derogation-palier1.png`. Résultat honnête : rayons, halo et volant identiques à l'œil
(halo : 10/255 au plus au milieu du battement, nul aux extrêmes ; paliers 0-1 : styles calculés strictement identiques) ; INVENTAIRE NON identique, voulu (9 → 8 px sur 375 pt, corrige un débordement).

## (4) balayage des photos hors boutique — UN défaut trouvé, corrigé : l'écran de SÉRIE sur les petits écrans
Balayé (Read) : accueil, achat, garage, inventaire (4 onglets), missions, mort (3 variantes), pause, plaque, profil, réglages ; FR debout / couché, EN debout, formats 375×667 et 430×932. Rien de plus que ce que `menus.md` traite déjà (les relevés de l'audit
« hors / chevauche / coupe » sont des éléments cachés ou des listes qui défilent). Les photos d'audit n'avaient pas l'écran de SÉRIE couché ni en 320 pt : photographié ici (`s-serie.cjs`, encoche simulée, 8 formats, jour 1 = la variante la plus haute) :
- 568×320 couché : « SERIE DE CONNEXION » sur deux lignes par-dessus « JOUR 1 » (qui casse aussi « JOUR » / « 1 »), « 3 JETONS » / « 1 JETON » rognés par leur carte, « REVIENS DEMAIN : +€ 20 / k » avec un « k » seul.
- 320×568 debout : « JOUR 1 » cassé en deux lignes de 40 px.
- 667×375 et 812×375 couchés : libellés collés aux bords des cartes, « k » orphelin.
Correctif (`css/reglage-image.css`, section « L'ÉCRAN DE SÉRIE SUR LES PETITS ÉCRANS », tout sous `body.touch #serieW`, seuils ≤ 340 pt de large / couché ≤ 380 pt de haut) : le montant du pied ne se coupe plus ; « JOUR 1 » à 28 px (320 pt) ou 16 px (568 pt) sans retour à la ligne ; titre à 1 px d'interlettrage ; libellés des cartes à 8 px sur deux lignes si besoin.
Les fichiers d'origine (`css/missions.css`) ne sont pas dans mon lot : les règles sont dans mon morceau, plus spécifiques (`body.touch #serieW …`).
- VÉRIFIÉ : 8 formats (375×667, 320×568, 390×844, 844×390, 667×375, 568×320, 693×320, 812×375) avec encoche simulée (`--ccT/B/L/R`), aucun texte ni bouton du bloc hors de la zone sûre ; photos relues : 568, 320, 667 corrigés ; 390×844 et 844×390 : seuls écarts = animation (carte du jour qui bat, étincelles aléatoires), aucune règle n'y joue.
- Planches : `n4-serie-568x320.png`, `n4-serie-320x568.png`, `n4-serie-667x375.png`.
- NON vérifié : les jours 4 et 7 de la série (la scène du banc ne les ouvre pas de façon fiable : `dbgSerie('ecran',4|7)` rend un bloc vide après le jour 1) ; seule la variante du jour 1 (la plus haute) l'a été.

## A MESURER SUR LE 13 PRO
Ce lot ne change ni le coût GPU ni la chaleur (CSS de mise en page seulement). Ce qui reste à voir sur un vrai téléphone :
1. La pause couchée d'un iPhone SE 3 / Zoom d'affichage (si disponible) : le choix IMAGE entier, patin visible. Sur le 13 Pro (844×390 ou 812×375 selon le réglage) : aucun changement attendu à 844, une compression légère du choix à 812 (≤ 820 pt).
2. A/B de la dérogation, un essai à la fois sur le 13 Pro (hors profil : `&sans=profil` ; avec profil : sans) : `?sans=halofren` (frénésie, halo : le battement paraît-il plus « escalier » ?), `?sans=volantfiltre` (volant glissé), `?sans=serierayons` (écran de série : rayons), `?sans=inv8` (garage : INVENTAIRE à 9 px). Aucun gain de fluidité n'est mesuré ici : ce sont les crochets de retour arrière.
