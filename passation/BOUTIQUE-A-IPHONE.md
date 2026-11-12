# La boutique en version A (2026-11-10, v1411 ; tous formats dès v1428 ; passe « expérience Apple » du 2026-11-11)

**Les demandes de Sacha :** « la boutique est cool mais pas adaptée à l'iPhone, c'est trop petit pour l'écran », « j'aime bien la A, fais-la bien, sans bug, avec une vraie réflexion profonde pour l'ergonomie », « objectif visibilité et ergonomie pour iPhone », puis le 11/11 : « améliore cette boutique en pensant à l'expérience Apple, redimensionne bien tout, réfléchis à chaque détail et chaque étape utilisateur dans chaque écran, fais les sons et tout, et débugue après » et « ça doit être bien autant en portrait que paysage ». Il tient au plateau de Léo (la caisse tenue par les bras robot, qu'on fait tourner du doigt) : on ne l'enlève pas.

## La hiérarchie de l'écran (portrait et paysage, la même)
1. **La scène est la vitrine.** La caisse et son nom, rien d'autre. Le nom est un titre de produit (20 px ; 17 px couché sur un téléphone).
2. **La bande est un sélecteur, pas une vitrine.** Basse (17,6 % de la hauteur, de 136 à 164 px), des cartes petites, deux à trois de front ; elle défile de côté, s'aimante, se fond sur le bord où elle continue. Les **peintures** (83) y tiennent sur **deux rangs de pastilles-photos** : dix à l'écran au lieu d'une et demie ; le nom s'écrit sur la scène, le prix sur le bouton, la coche reste sur celles qui sont à toi.
3. **La rangée d'action est sous le pouce :** ◀ le bouton d'état ▶. Les flèches ont quitté la scène (elles mordaient sur la caisse et le pouce ne les atteignait pas) ; elles passent à l'objet d'avant / d'après dans l'ordre affiché (`bqaPas`).
4. **RETOUR | JOUER** en bas, comme partout.

- **Debout :** titre et solde, scène, rayons (au-dessus de la bande qu'ils commandent), bande, rangée d'action, RETOUR | JOUER.
- **Couché sur un téléphone** (moins de 560 px de haut) : la scène à gauche ; à droite une colonne de 288 à 320 px (`--bqaCol`) qui porte, de haut en bas, les rayons, la même bande, la rangée d'action, RETOUR (une flèche seule) | JOUER. La barre du bas se resserre à la largeur de la colonne (`html.bqaCs`) : la scène gagne ~90 px. Les trois emplacements des figures se rangent en colonne à gauche de la bande.
- **Couché sur un grand écran** (560 px de haut et plus) : la colonne garde sa grille (classe `bqaC` seule), avec les mêmes flèches autour du bouton.

## Les tailles mesurées (banc, audit des 8 formats)
| Format | La caisse avant | La caisse après |
|---|---|---|
| iPhone 15 debout (393 × 852) | ~250 px de large | ~325 px |
| iPhone 15 couché (852 × 393) | ~300 px (passait derrière RETOUR) | ~340 px, rien dessus |
| cadre de l'ordinateur (844 × 390) | ~300 px | ~330 px |
| iPhone SE debout (375 × 667) | ~200 px | ~245 px |

Toutes les touches font 44 px au moins ; rien ne sort des marges de sécurité (encoche, barre d'accueil simulées) ; aucun texte coupé sauf quatre noms de voiture très longs, abrégés par « … » dans la bande (le nom entier est sur la scène).

## Où ça vit
| Quoi | Fichier |
|---|---|
| le mode, la bande, la zone libre, les flèches, le recentrage, clavier / molette / souris | `code/interface/boutique-scene-1.js` (`bqaVeut`, `bqaBande`, `bqaHaut`, `bqaPas`, `bqaClavier`, `bqaCentre`, `bqaFlPlace`, `bqaVide`, `BQA_K` ; bloc « LA PLACE » de `garBqPanneau`) |
| le grossissement de la caisse | `code/interface/garage-rendu.js` (facteur `KA`, lu dans `BQA_K`) |
| où la caisse se pose dans la scène | `code/interface/garage-cadrage.js` (`garLibre`, `BQA_K[4]` debout, `[5]` couché) |
| ← → au clavier | `code/missions/atelier.js` (`bqaClavier` avant `garageGo`) |
| toute la mise en forme | `code/css/boutique-a-iphone.css` (`<style id="bqA">`, posée en dernier) |

- **Quand ça s'active** (`bqaVeut`) : toujours, sauf `?bqa=0` qui rend l'ancienne mise en page.
- **Les classes :** `html.bqA` (le mode), `html.bqaCs` (couché sur téléphone : la barre du bas resserrée) ; sur `#gBqPan` : `bqaB` (la bande), `bqa2` (deux rangs : peintures), `bqaC` (couché). Toutes retirées à la sortie de la boutique.
- **`BQA_K`** = [grossissement debout, couché téléphone, ailes debout, ailes couché, centre debout, centre couché, part au rayon FIGURES, couché grand écran, ailes couché grand écran]. `?bqk=.4,.48,…` ou `dbgBqA([…])` les règle à chaud.
- **`dbgBqA()`** rend la zone libre, la boîte de la caisse à l'écran (par son gabarit), l'objet courant.

## Les gestes et leurs sons
| Geste | Ce qui se passe | Son |
|---|---|---|
| toucher un rayon | la bande change, se cale sur l'objet choisi | `onglet` |
| toucher une carte | le bras pose l'objet, la bande se recentre | le bruit de l'objet, sinon `nav` |
| ◀ ▶ (ou ← → au clavier) | l'objet d'avant / d'après, retour au début au bout | `precedent` / `suivant` (la flèche, grave / aiguë) + vibration |
| glisser la bande (doigt, souris, molette) | elle défile ; un glissé à la souris n'est pas un clic | — |
| ACHETER | débit, vitre brisée ou tampon « À TOI ! », carte « ÉQUIPÉE » | `ui.achat` + `ui.tampon` |
| ÉQUIPER / DÉSÉQUIPER | l'état change sur le bouton et la carte | `ui.equipe` / `ui.off` |
| IL TE MANQUE, À GAGNER, MISSION SECRÈTE | le bouton se secoue, rien n'est dépensé | `refus` |
| glisser sur la scène | la caisse tourne (le plateau de Léo, inchangé) | — |

## Vérifié le 2026-11-11 (banc `bancA.cjs`, un Chrome headless qui change de format à la volée)
- 8 formats × 6 rayons photographiés et mesurés (iPhone 15 et Pro Max debout / couché avec encoche simulée, iPhone SE debout / couché, cadre de l'ordinateur 844 × 390 et 390 × 844 à la souris), plus 1920 × 1080, 1313 × 607, tablette 820 × 1180 et 1180 × 820.
- Flèches (aller, retour, tour complet), clavier, molette, glisser à la souris (le clic qui suit est ignoré), toucher une carte, rotation de la caisse au doigt.
- Achat d'une voiture et d'une figure (débit, « ÉQUIPÉE », compteur), équiper une figure à la place d'une autre, peinture à gagner (refus), anglais.
- Rotation de l'écran boutique ouverte (debout ↔ couché), sortie par RETOUR (classes retirées, garage intact).
- Le bouton d'état ne déborde dans aucun format pour ses neuf libellés (mesuré).
- 0 erreur JS ; gardes allège / burn-out / charte ; `non-declares.cjs` : 52 avant, 52 après.

## À savoir
- Le glisser sur la bande ne fait pas tourner la caisse (la liste est exclue de la zone sensible).
- L'état « IL TE MANQUE » n'a pas pu être joué au banc (la banque de `?simu=1` est trop riche) : sa mise en forme a été vérifiée en injectant son contenu dans le bouton.
- Le rayon ACHAT reste caché dans l'app iPhone v1 (pas de StoreKit) : cinq rayons, la rangée s'adapte.
- Refus à respecter (2026-11-07) : pas de niche autour des boîtes, pas de boules de peinture, pas de pastilles TOUT / À MOI / À ACHETER / TRI, pas de statistiques.

## Les ajouts du 2026-11-11 (v1463 à v1476)
- **Peintures : une palette.** Des pastilles de couleur (unies, dégradés, motifs), plus aucune photo de caisse (`bqaPalette`, `.pCsw`, couleur posée par `bqPeintPhotos`). Carrés arrondis, pas des boules (refus du 07/11).
- **La rareté se voit, elle ne s'écrit pas.** Une barre colorée entre les groupes (plus de texte vertical) ; le fond de la zone de la bande prend la couleur du groupe qui passe (`bqaTeinte` → `--bqaRar`, `@property` pour le glissé). Pas de voile sur tout l'écran (il grisait JOUER et RETOUR).
- **Les prix entiers** : un prix à sept chiffres tient dans la pastille d'une aile (plus de « € 2 500 0… »).
- **Les flèches suivent l'ordre vu** (la palette à deux rangs se lit colonne par colonne) ; depuis une caisse sortie de la liste, ▶ prend celle qui a pris sa place (`GBQ.apresIdx`).
- **L'achat d'une caisse** : la vitre éclate, la photo de la carte s'envole vers le plateau, la carte se referme et quitte la bande (`bqAchatPart` dans `vitre-brisee.js`) ; les caisses à toi ne sont plus dans la boutique (`bqPieces`), sauf celle qui part (`GBQ.partant`).
- **Le défilement des voitures** : aimant OBLIGATOIRE au centre de la bande (CSS `:has(.bqK.vo)`), la caisse du centre est sélectionnée au verrouillage ; cran de coffre-fort (`bqaCran` : un tic léger par carte qui passe, un clac plus fort à la pose ; Taptic dans l'app, vibreur sur Android, rien sur Safari web). Plus de masque sur la bande (voiles à la place), repères pris une fois par geste.
- **Le chargement d'avance** (`photoChoix` dans `atelier-ferme.js`) : au repos la boutique prend la carte non photographiée la plus proche de l'écran, autant de repos que de travail. Mesuré : à froid CPU ×4, les cartes en vue en 3 s, les 39 voitures en ~40 s (avant : jamais, 3 sur 42). Les photos sont gardées d'une session à l'autre (PHDB).
- **L'écran des figures** : on choisit D'ABORD le geste (les trois hexagones, celui visé est plein), une ligne le dit (« FIGURES POUR AVANT »), la liste ne montre que les figures de CE geste (`fsListe` honore `FSEL.dir` en version A), ÉQUIPÉE seulement dans le geste visé, le bouton dit « ÉQUIPER · AVANT ». On arrive sur le premier emplacement vide, rien de sélectionné. Sous 700 px de haut, la ligne du geste est masquée.
- Un même figure peut occuper deux emplacements (AVANT et ARRIÈRE) : c'est la logique d'équipement d'origine (`figEquipe`), inchangée.
- `app-ios/preparer-www.js` : la coupe de `cousinTout` suivait un texte qui avait changé (Vercel refusait la publication) ; corrigée sur main par ailleurs.
- **Le mode FOCUS (couché)** : le sélectionneur de droite est LARGE (54 % de la largeur sur téléphone couché : il dépasse le milieu de l'écran ; 42 % jusqu'à 760 px sur grand écran) ; toucher la caisse (le plateau) le rapetisse en douceur vers le coin haut droit (transform CSS, `html.bqFocus`, ressort `cubic-bezier(.19,1,.22,1)` de .7 s) et zoome sur la caisse (`GBQ.fk`, ressort amorti lu par `garage-rendu.js` : facteur de `KA`) ; la place de la caisse s'élargit de 30 % du chemin au-dessus de la rangée d'action (`garLibre`). Toucher le sélectionneur rétréci le rouvre (ce toucher ne choisit rien). Debout : pas de focus (`bqaFocusOk`).
