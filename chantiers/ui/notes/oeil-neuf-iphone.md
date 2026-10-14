# Œil neuf — CASH CAR sur iPhone (14/10/2026)

Critique sans modification du jeu. Banc : `/Users/sachaberes/cash-car/ui/banc/lib.cjs` (copie locale avec user-agent iPhone), http://localhost:8500/index.html, deviceScaleFactor 3, UA iPhone iOS 17, tactile.

## LIMITE DE CETTE PASSE (à lire d'abord)

- UN SEUL passage de banc a eu lieu : **iPhone SE (375×667), debout + couché**, tous les écrans de menu (zones sûres = 0, comme demandé pour le SE). Les captures sont dans `/Users/sachaberes/cash-car/ui/shots/iphone/SE-*.png` (+ journal des mesures et de l audit : `SE-journal.log` dans le même dossier).
- Ensuite la machine est restée à une charge de 116 à 184 (limite 40) sur trois contrôles : **pas de passage iPhone 15 ni Pro Max**, donc pas de simulation îlot 59 pt / barre d'accueil 34 pt.
- La course, la pause et la fin du SE ont échoué (le script ne revenait pas à l'accueil après la boutique). Pour ces trois écrans j'ai regardé les **captures existantes** de `/Users/sachaberes/cash-car/ui/shots/relecture/` (390×844 et 844×390, dsf 2, marges de test 47 pt, prises à 03:58 ; le jeu a été modifié à 04:08, donc possible léger écart). Mesures de texte de ces écrans = estimées sur capture, pas lues dans le DOM.

## 1. Verdict en 5 lignes

1. Le jeu est dessiné pour un écran COUCHÉ de 844 pt ; en debout il est empilé, pas recomposé : cartes collées en haut, 40 à 50 % d'écran noir vide, bouton JOUER seul en bas (Carrière, niveaux, inventaire, fin de partie).
2. Tout le texte est en police pixel (Press Start 2P) à 8–10 pt : sur le SE, 20 des 21 textes des Réglages, 36 des 38 de la boutique, 14 des 17 des Missions sont sous 11 pt. Ce n'est pas lisible, et c'est ça qui fait « fait à la main ».
3. Il y a quatre langages visuels qui se croisent : dalles noires à bord blanc (Réglages, Carrière), boutique blanche/lavande, Offres en néon violet/magenta (le style que Sacha rejette), plus du texte en police système (missions, offres) : on dirait quatre jeux.
4. Les écrans denses (boutique, offres, HUD) sont tassés, rognés ou débordent (noms coupés « LA BAVARO… », prix sur 2 lignes, cartes coupées par la barre du bas), alors que les écrans simples sont vides : le rythme de l'espace n'est jamais maîtrisé.
5. Ce qui manque est ce que font les jeux de course du top : un héros (la voiture) grand et propre, un bouton principal évident et physique, des étiquettes lisibles, des tuiles de contenu avec de l'image, une hiérarchie en une seconde. Ici le plus grand élément est souvent du noir.

(Ce n'est PAS un problème de cibles tactiles : la plupart des boutons font 48 pt. Les exceptions sont citées au défaut 9.)

## 2. Les 10 défauts les plus visibles (du pire au moins grave)

**1. Police pixel en petit corps partout — lisibilité (majeur / quasi bloquant)**
- Écran : tous. Tailles : toutes (mesuré SE ; identique aux autres tailles car les corps sont en pt fixes).
- Ce qu'on voit : libellés « CARRIERE », « MISSIONS », « DEFI 1 », « RECOMPENSE », prix de la boutique, onglets, en lettres de 8 pt aux formes pixel écrasées ; les chiffres sont difficiles à distinguer (0 / O, 8 / B).
- Preuve : `SE-debout-accueil.png` CARRIERE/MISSIONS = 8 pt ; `SE-debout-reglages.png` 20 textes sous 11 pt (AUDIO 8, ON 8, SON 10) ; `SE-debout-garage-boutique.png` noms et prix 8 pt (« LE CAID », « $ 50 k », « CETTE SEMAINE », chrono « 4J 20:57:13 »), 36 textes sur 38 sous 11 pt ; `SE-debout-missions.png` « DEFI 1 », « +$ 150 » 8 pt ; HUD (relecture, estimé) « GLISSE POUR TOURNER », « MOY », « $×1 », « +$ 18 », « AIMANT » ≈ 8–9 pt.
- Ce qu'un pro ferait : une police pixel seulement pour les titres et gros chiffres, une police sans-serif nette 12–14 pt minimum pour tout le reste.

**2. Écrans simples « empilés » en debout : moitié d'écran vide (majeur)**
- Écrans : Carrière (mondes et niveaux), Inventaire, Fin de partie ; tailles : SE debout (et couché pour les niveaux).
- Ce qu'on voit : 4 cartes de monde dans le tiers haut, ~450 pt de noir, puis JOUER ; 5 niveaux sans image ; inventaire = 2 vignettes dans un panneau de 400 pt de haut vide.
- Preuve : `SE-debout-carriere-mondes.png` : cartes de y=72 à 272 pt, JOUER à y=592 pt, vide ≈ 320 pt (48 % de l'écran) ; `SE-debout-carriere-niveaux.png` : cartes finissent à 375 pt, vide ≈ 210 pt, case 05 seule sur une ligne ; `SE-couche-carriere-niveaux.png` : cartes de 72 à 168 pt sur 375 pt de haut, plus de la moitié noire ; `SE-debout-garage-inventaire.png` panneau ~270 pt vide.
- Ce qu'un pro ferait : cartes de monde grandes avec illustration (un monde = une image plein cadre que l'on fait défiler), niveaux en grille remplissant l'écran, panneau d'inventaire à hauteur du contenu.

**3. Boutique du garage : écran cassé (bloquant visuellement)**
- Écran : Boutique (garage) ; tailles : SE debout et couché (non vu ailleurs).
- Ce qu'on voit : sur fond blanc/lavande (seul écran clair du jeu), une colonne de vignettes rognée en haut et en bas (le prix « $ 3,8 M » mord sous l'en-tête), une voiture 3D minuscule avec un « 1.51 » fantôme, des noms tronqués « LA BAVARO… », « LE CHARGE… », « LA SILENC… », la dernière rangée de cartes coupée net par la barre RETOUR/ÉQUIPÉE.
- Preuve : `SE-debout-garage-boutique.png` ; audit du banc : « HORS ÉCRAN : COUCHER DE SOLEIL $ 18 k [38,-56,…] », « NOIR MAT [38,308] », « MASQUÉ (le doigt touche CANVAS) : LE CAID $ 50 k » ; `SE-couche-garage-boutique.png` : 3 colonnes (liste 100 pt, aperçu 3D ~130 pt, grille ~300 pt) sur 667 pt, onglet VOITURES 160×34 pt (< 44).
- Ce qu'un pro ferait : un seul axe de défilement, une grande voiture au centre, un carrousel d'items en bas avec noms complets sur 2 lignes et prix lisibles, un bouton ACHETER fixe.

**4. Offres : style rejeté + texte qui casse (majeur)**
- Écran : Offres ; tailles : SE debout et couché.
- Ce qu'on voit : cadre violet/magenta à coin coupé, rayons, étiquette « OFFRE DE LANCEMENT » dont le texte pixel est déformé/illisible, description en police système grise sur violet, prix « 4,20 € » cassé sur DEUX lignes (« 4,20 / € ») et prix barré « 9,99 € » coupé en couché, bouton RETOUR posé PAR-DESSUS les cartes, et le seul appel à l'action affiche « BIENTOT » (cadenas).
- Preuve : `SE-couche-boutique-offres.png` (prix sur 2 lignes, RETOUR 148×3 pt sur la carte) ; `SE-debout-boutique-offres.png` : « LA PIZZA EXPRESS 161,00 € » HORS ÉCRAN [18,524,164,192] et « MASQUÉ (le doigt touche SPAN) » ; audit : « TEXTE COUPÉ : LA PIZZA EXPRESS 161,00 € », « LA FELINE 1,61 € ».
- Ce qu'un pro ferait : même charte sombre/or que le reste, tuiles propres avec image + nom + un prix en gros, aucun bouton flottant sur le contenu.

**5. HUD de course : coin haut surchargé, éléments à 8–9 pt (majeur)**
- Écran : Course (HUD, pouvoir actif « AIMANT ») ; tailles : 844×390 et 390×844 (captures existantes, estimé).
- Ce qu'on voit : sur la même ligne la jauge, 2 barres fines, « MOY 400 », « $×1 », « 40 AURA », la vitesse, le bouton pause, l'argent, le gain et la carte du pouvoir : 9 groupes de texte dans 40 % de la largeur, avec des polices de 3 tailles ; le pouvoir actif est un petit cadre noir de ~65×40 pt dont le chrono est à ~9 pt ; le rond de joystick en pointillés au pouce gauche et l'éclair en bas à droite sont les seuls éléments pour le pouce.
- Preuve : `relecture/couche-fr-15-course-hud.png` (barres fines ≈ 4 pt de haut, texte « GLISSE POUR TOURNER » cap ≈ 7 pt) ; `relecture/debout-fr-15-course-hud.png` (barres et « 400 », « $×1 » entassés sous le bouton pause à 48 pt).
- Ce qu'un pro ferait : 3 informations en haut (vitesse, argent, jauge), le reste en icônes sans chiffres, le pouvoir actif en icône à anneau de temps près du pouce.

**6. Pause : panneau du bas et débris du HUD par-dessus (majeur)**
- Écran : Pause ; tailles : debout et couché (captures existantes).
- Ce qu'on voit : en couché un texte « +16 KM/H » du HUD flotte sur le panneau entre QUITTER et REPRENDRE ; en debout le panneau (~715×1060 px) s'écrase dans la moitié basse et la moitié haute n'est que du noir ; QUITTER a le même poids que RECOMMENCER et REPRENDRE : deux actions destructrices au même niveau.
- Preuve : `relecture/couche-fr-17-pause.png` (« +16 KM/H » à x≈760–960 px) ; `relecture/debout-fr-17-pause.png` (panneau de y=525 à 1590 px sur 1688).
- Ce qu'un pro ferait : masquer tout le HUD en pause, panneau centré, REPRENDRE énorme, QUITTER en lien discret avec confirmation.

**7. Fin de partie : cases vides et titres qui se heurtent (majeur)**
- Écran : Fin de partie ; tailles : debout et couché (existantes).
- Ce qu'on voit : en debout, deux cartes de ~175×215 pt dont l'une contient seulement « 112 » dans du noir, une rangée de 4 stats grises (« 0:00 FRENESIE » à contraste faible), ~100 pt vides avant REJOUER, bouton accueil de 48 pt isolé à gauche ; en couché le titre « NOUVEAU RECORD ! » touche le badge « RECORD ! » juste dessous, et le texte « ENCORE 2 PIECES POUR / ↑ 4 EN LIGNE » coupe la phrase.
- Preuve : `relecture/debout-fr-22-fin-posee.png` ; `relecture/couche-fr-22-fin-posee.png` (badge à y=91 px collé au titre y=53 px).
- Ce qu'un pro ferait : un gros total centré qui s'incrémente, 2–3 stats clés, un seul rappel de progression, REJOUER très grand.

**8. Accueil : un décor sans bouton principal (majeur)**
- Écran : Accueil ; tailles : SE debout et couché.
- Ce qu'on voit : debout, le titre tout en haut, une voiture tournée en l'air, ~480 pt de ciel, puis une rangée de 5 icônes dont deux seulement ont un nom (8 pt) ; trois boutons sont des icônes seules (garage, offres, réglages) avec un carré jaune de notification inexpliqué ; JOUER est une écriture dorée SANS bouton, alors que partout ailleurs JOUER est un gros bouton jaune plein.
- Preuve : `SE-debout-accueil.png` (rangée de 5 boutons de 84,84,48,48,48 × 48 pt à y=523 ; JOUER 343×64 sans fond ; voiture ≈ 270 pt de large) ; `SE-couche-accueil.png`.
- Ce qu'un pro ferait : le bouton jaune JOUER partout, voiture grande et fixe, une barre d'onglets en bas avec icône + nom lisible à 11 pt.

**9. Cibles tactiles sous 44 pt et boutons chevauchés (mineur à majeur)**
- Écran : Garage (hub, inventaire, boutique) et Carrière ; tailles : SE debout et couché.
- Ce qu'on voit : le sélecteur de rotation de la voiture (barre ± marque gris) fait 279×30 pt (257×30 en couché), l'onglet VOITURES de la boutique 160×34 pt ; dans Carrière/niveaux le décor de l'accueil reste actif sous l'écran (audit : « MASQUÉ (le doigt touche cmCorps) : Réglages, Garage », chevauchements de 6 pt avec les cartes).
- Preuve : journal du banc `/Users/sachaberes/cash-car/ui/shots/iphone/SE-journal.log` (`PETIT 279×30 : gTourne`, `PETIT 160×34 : VOITURES 29`).
- Ce qu'un pro ferait : zone de toucher d'au moins 44×44 même si le dessin est plus petit, et couper l'accueil quand un autre écran est ouvert.

**10. Missions : cartes tassées, lignes d'accroche et alignement (mineur)**
- Écran : Missions ; tailles : SE debout et couché.
- Ce qu'on voit : trois cartes de 109×88 pt avec 2 lignes de titre à 10 pt serrées, barres de progression vides noires sur noir, des traits blancs qui relient les cartes à des carrés dans le garage (lecture de schéma, pas de jeu), la consigne en police système ; en couché les cartes 1, 2 et 3 n'ont pas leur barre à la même hauteur (titre sur 2 lignes pour la 1) et le panneau RÉCOMPENSE cache la moitié basse de la voiture.
- Preuve : `SE-couche-missions.png` (barre DÉFI 1 y=232 px, DÉFI 2 y=196 px, DÉFI 3 y=196 px) ; `SE-debout-missions.png`.
- Ce qu'un pro ferait : cartes plus hautes avec grand compteur « 3/25 » et récompense en gros, alignement sur une grille fixe.

## 3. Tableau écran × taille (note /10 par écran)

Légende : bon / médiocre / mauvais ; « n.v. » = non vu sur capture.

| Écran | SE debout | SE couché | 390×844 debout | 844×390 couché | 430×932 / 932×430 | Note |
|---|---|---|---|---|---|---|
| Accueil | médiocre | médiocre | n.v. | n.v. | n.v. | 5/10 |
| Carrière (mondes, niveaux) | mauvais | mauvais | n.v. | n.v. | n.v. | 4/10 |
| Missions | médiocre | médiocre | n.v. | n.v. | n.v. | 5/10 |
| Garage (hub) | médiocre | bon | n.v. | n.v. | n.v. | 6/10 |
| Garage (inventaire) | mauvais | médiocre | n.v. | n.v. | n.v. | 4/10 |
| Boutique (garage) | mauvais | mauvais | n.v. | n.v. | n.v. | 3/10 |
| Offres | mauvais | mauvais | n.v. | n.v. | n.v. | 3/10 |
| Réglages | bon | bon | n.v. | n.v. | n.v. | 6/10 |
| Course (HUD) | n.v. (échec) | n.v. (échec) | médiocre (ancienne capture) | médiocre (ancienne capture) | n.v. | 5/10 |
| Pause | n.v. | n.v. | médiocre (ancienne capture) | mauvais (ancienne capture) | n.v. | 5/10 |
| Fin de partie | n.v. | n.v. | médiocre (ancienne capture) | médiocre (ancienne capture) | n.v. | 4/10 |

Note globale ≈ 4,5/10. La note d'un écran = son meilleur état vu ; les écrans non vus sur la plupart des tailles ne sont pas notés à la hausse.

## 4. Ce que je n'ai PAS pu voir

- iPhone 15 (390×844) et iPhone Pro Max (430×932), debout et couché, pour tous les écrans de menu, avec simulation de l'îlot (59 pt), de la barre d'accueil (34 pt) et des coins arrondis. Donc : AUCUN verdict sur les zones sûres (ce qui passe sous l'îlot ou la barre d'accueil).
- Course, pause, fin sur SE (375×667) : le passage a échoué, et pas de nouvelle ouverture (charge machine).
- Course avec pouvoir actif : seul « AIMANT » est visible sur les captures existantes ; les autres pouvoirs et l'état « boost » en 390×844 ne sont pas vérifiés.
- Courses réelles en marche de longue durée, états d'erreur, premier lancement (profil neuf, auto-école), langues autres que le français, textes plus longs (anglais, chinois).
- Mesures exactes en points du HUD, de la pause et de la fin : estimées sur captures de 03:58 (pas lues dans le DOM), avec un jeu modifié depuis (04:08).
- Réglages : seules les parties visibles (scroll bas sur `SE-debout-reglages-bas.png`) ; sauvegarde/restauration non testées.
