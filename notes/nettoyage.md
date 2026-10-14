# Nettoyage (pilotage) — notes au fil de l'eau
Worktree : /Users/sachaberes/cash-car/detail/wt/nettoyage · branche detail/nettoyage (départ : assemblage)

## LOT 1 — fichiers jamais joués (FAIT, commit "Nettoyage : fichiers audio jamais joués")
Méthode : pour chaque fichier de assets/ (57), grep du chemin, du nom de fichier, du nom sans extension et des motifs construits
(`'ciel-n'+k`, `'ville-n'+(i+1)`, `'chris-'+k`, ANN_DIR/DEATH_DIR/FX_DIR + `.f`) dans index.html, sfx.js, sons-banque.js (comptage), harmonie.js,
musique-glisse-v2.js, sw.js, manifest.webmanifest ; puis les outils (maps-ciel.html, sons.html, simulateur, atelier-son…) séparément.

### Supprimés (git rm) — 14 fichiers, 10 486 526 octets = 10,0 Mo (assets/ : 82 Mo -> 72 Mo)
| fichier | taille | preuve |
|---|---|---|
| audio/announcer/{double_monstre,early_dead,launch400,mega_meteor,meteor,monstre,pure_speed,snake_loop,triple_monstre}.mp3 (9) | 682 877 | VOIX. Seul index.html les cite (ANN_LIB, ANN_DIR+f), et `ANN_LIB[k].dead=SANS_VOIX`, `SANS_VOIX=POKI\|\|!/[?&]voix=1\b/` : jamais chargés ni joués sans `?voix=1` (l. 71, 37571, 37580). poki-construire.js les saute déjà. |
| audio/death/eww.m4a | 10 325 | VOIX TTS : `DEATH_LIB` entrée `voix:1`, retirée par `if(SANS_VOIX)…splice` (l. 37605). |
| audio/fx/wow.mp3 | 55 081 | VOIX : `FX_WOW.dead=SANS_VOIX`, `waPrecharge` et `fxPreload` l'écartent si SANS_VOIX. |
| audio/music/nocturnal-groove.mp3 | 4 223 277 | 0 occurrence active : index.html ne le cite que dans un commentaire (l. 35213 « avant : … »), sw.js en commentaire d'historique ; plus dans MUSIC_TRACKS/MUSIC_LIEU/MUSIC.menu (le lobby = 6 « chris-* » depuis le 14/10). Cité seulement par l'outil maps-ciel.html (étiquette TITRES) et par des données (harmonie.js clé, SON_TON clé, atelier-son/harmonie.py). |
| audio/music/lobby/lobby-ascenseur.m4a | 2 655 494 | 0 chargement : MUSIC_LOBBY = ['matin','dimanche','nuit','polaroid','ciel','siffleur'] -> chris-*.m4a seulement. Cité par : SON_TON (clé, inoffensive), harmonie.js (clé), maps-ciel.html (étiquette d'outil). |
| audio/music/lobby/vapeur-salon.m4a | 2 859 472 | idem. |

Conséquence connue : l'outil maps-ciel.html (bibliothèque de musiques de Léo, `TITRES`/`BIB`) montrera ces 3 pistes en 404 ; `?voix=1` (débogage) donnera des 404 muets (l'annonceur a déjà un drapeau `dead` sur erreur).
Données mortes laissées en place (lot 3) : 3 clés de harmonie.js (vapeur-salon, lobby-ascenseur, nocturnal-groove, ~3,6 Ko), 3 clés de SON_TON.
sw.js : `CACHE` NON incrémenté (ligne unique, énorme, que toutes les sessions modifient -> conflit garanti) ; l'intégrateur doit l'incrémenter une fois à l'assemblage final pour purger les anciens fichiers des navigateurs.

### Gardés — demandés par le jeu
Musiques : lvl1-neon-cash-car-v3, lvl2-cash-car-vitesse, addictive-loop (MUSIC_TRACKS) · noite-de-velocidade, glassy-plucks-boucle, swag-cash-car-2 (MUSIC_LIEU) ·
ciel/ciel-n1..n5 (MUSIC_CIEL) + ciel-complet (MUSIC_CIEL_TOUT) · ville/ville-n1..n5 (MUSIC_VILLE[carr.i<5]) · lobby/chris-* x6 (MUSIC_LOBBY) · harmonie.js (<script>) · musique-glisse-v2.js (import() l. 43140).
Sons : death/{minecraft,explosion,gong}.m4a (DEATH_LIB), fx/{kaching,cash,compteuse,compteur}.mp3 (FX_ARGENT) — mais voir lot 3 : ce ne sont que le REPLI quand la console de son (SONV2) n'est pas chargée.
Police : fonts/pressstart2p.woff2 (@font-face l. 340), fonts/OFL.txt (licence de la police, à garder). Icônes : icon-32 / icon-180 (index.html), icon-192 / icon-512 (manifest).

### Douteux (NON supprimés)
| fichier | taille | pourquoi douteux |
|---|---|---|
| audio/music/ville/ville-n6..n10.m4a (5) | 2 279 667+2 296 413+... = 11,4 Mo | URLs construites dans MUSIC_VILLE (10 entrées) mais `musicLieuVoulu` ne lit que `MUSIC_VILLE[c.carr.i]` avec `carr.i<5` : jamais jouées aujourd'hui. Choix daté de Léo (2026-10-05 : « seulement celles de mon screen… 6-10 en attente »). poki-construire.js saute déjà tout le dossier ville. -> À DÉCIDER par Léo (11,4 Mo à gagner, + 5 entrées de harmonie.js). |

### Demandés par le jeu mais ABSENTS du dépôt
- assets/audio/music/dark-triad.mp3 (MUSIC_FREN, musique de FRÉNÉSIE ; le code sonde son absence) — déjà connu.
- assets/audio/music/heymikey-in-da-back-2.mp3 : ligne COMMENTÉE (droits) -> pas une demande.
- Aucun autre : tous les autres chemins `assets/…` cités par index.html, sw.js, manifest, sfx.js existent.

## LOT 2a — REQUIN, COMÈTE, LA RAIE cachées (FAIT, commit « REQUIN, COMÈTE et LA RAIE cachées »)
Mécanisme existant : `retire:1` dans la ligne de CARS. `carRetiree(i)` est lu par rarListe (donc garageListe + compteurs de famille), carUnlocked,
carUnlockedVrai, carPrice (=0), la vitrine premium, gAVendre, gMystere, bqValide/bqOffres/bqPayantes/bqPieces, la liste « voiture » de l'atelier, et à
la lecture de la sauvegarde (san : `owned` filtré, `equipped` remis à 0 si retirée). Les LIGNES restent : index inchangés.
Appliqué : `retire:1` ajouté aux 3 lignes (REQUIN idx 10, COMÈTE idx 11, LA RAIE idx 55). 3 lignes modifiées, rien d'autre.
Preuve : `nettoyage-outils/test-retire.cjs avant.html apres.html` (vm : extrait CARS, CAR_UNLOCK, RARETES, carRetiree/rarDefi/carRar/carOrdre/carPrixOrdre/rarListe/garageListe/carPrice) ->
CARS.length 77 -> 77, 0 nom changé d'index ; garageListe 52 -> 49 (sortent exactement REQUIN[10], COMÈTE[11], LA RAIE[55], ordre relatif des autres identique) ;
familles : exotique 5 -> 2, autres inchangées ; carPrice des 3 = 0. RESULTAT : OK. syntaxe.cjs 0 erreur, garde-burnout OK.
Limites / à savoir :
- Qui AVAIT acheté LA RAIE (2,5 M, avant le 06/10) la perd à la lecture de sa sauvegarde SANS remboursement (CAR_UNLOCK[RAIE] = {k:'bientot'}, plus de `p`). REQUIN/COMÈTE étaient « premium » (€, StoreKit factice) : pas de remboursement non plus, comme FORMULE OR / LE MANS 24 retirées le 06/10. Si on veut rembourser la RAIE : mettre `p:2.5e6` dans son entrée CAR_UNLOCK (carPrice la garde déjà à 0).
- Code désormais mort (lot 3) : `case 'bientot'` de carUnlockText, 3 entrées CAR_UNLOCK `bientot`, fiches/formes `requin` `proto` `e_raie` (SHAPES) si plus aucune caisse active ne les utilise.

## LOT 2b — affiches « BIENTOT EN LIGNE » (FAIT, commit « l'affiche du garage ne dit plus bientôt »)
Constat : l'affiche CLASSEMENT MONDIAL / RECORDS MONDIAUX n'existe DÉJÀ plus dans la liste (`buildAffiches` ne bâtit que `{k:'perso'}`, retirée le 2026-09-30 à la demande de Sacha) :
aucun trou ni cadre vide à combler. Ce qui disait encore « bientôt » : le TOAST de `afficheTap` au toucher de l'affiche RECORD PERSO
(« TES RECORDS : BIENTOT EN DETAIL ») -> supprimé (l'affiche rebondit et tinte, sans texte). 1 ligne remplacée par un commentaire. L'affiche PERSO n'est pas touchée.
Code mort laissé pour le lot 3 : branche `else` « monde » de affichesMaj (tampon « BIENTOT EN LIGNE », MONDE pixel-art), clés I18N 'BIENTOT EN LIGNE', 'TES RECORDS : BIENTOT EN DETAIL', 'CLASSEMENT MONDIAL : BIENTOT EN LIGNE', la mention 'monde' de dbgAffiche.

## LOT 3 — INVENTAIRE du code invisible (AUCUNE suppression de code ; analyse statique, pas de navigateur)
Méthode et outils (tous dans `/Users/sachaberes/cash-car/pilotage/notes/nettoyage-outils/`, relançables : `INDEX=<index.html> node X.cjs`) :
- `mort-js.cjs` : acorn + eslint-scope sur le grand `<script>` ; une fonction / const est MORTE si aucune de ses références n'est une LECTURE hors de sa propre déclaration ; fermeture transitive (lue seulement par du code mort) ; recoupement par mot (`ail=` = occurrences hors commentaires ailleurs). Sortie : `inventaire-morts.tsv`.
- `drapeaux.cjs` : évalue les `const` jamais réécrites avec `location.search=''` et POKI=false (1 200 constantes), puis compte les branches `if / ?: && ||` décidées d'avance. Sortie : `branches-mortes.tsv`.
- `formes.cjs` + `formes2.cjs` (formes des caisses retirées), `dbg-hooks.cjs` (crochets `window.*` × 256 scripts de banc de toutes les sessions), `css-mort.cjs`, `css-ecrase.cjs`, `cache-css.cjs`, `banque-sons.cjs`, `camp-retires.cjs`, `fam-decl.cjs` (poids d'une famille de noms), `poids-global.cjs`, `params-url.cjs`, `test-retire.cjs`.
Chiffres de base : index.html 5 651 747 o · grand script 4 723 198 o (45 896 lignes) · CSS 807 670 o · **commentaires : JS 1 875 601 o (39,7 % du script), CSS 244 630 o (30 %), HTML 17 547 o**. 1 Ko = 1 000 o. « avec comm. » = commentaires collés devant le bloc compris.
Temps de lecture (compilation V8 `vm.Script` du grand script, Mac, meilleur de 4) : **123 ms avec commentaires, 98 ms sans** (−25 ms) ; le code mort (fonctions jamais appelées, préparsées seulement) pèse ~0,03 ms/Ko : retirer 200 Ko de JS ≈ −6 ms bureau. Mobile non mesuré (×3 à ×5 attendu).

### Tableau (trié par poids décroissant ; les familles se recoupent un peu, ne pas additionner à l'aveugle)
| bloc (fonction/constante/CSS, lignes) | poids (Ko) | pourquoi invisible (preuve) | risque à le retirer | à qui (auteur / choix daté) | verdict |
|---|---|---|---|---|---|
| Commentaires du grand script (+ CSS 245 + HTML 17) | 1 876 (+262) | ne s'exécutent pas ; 39,7 % du script | on perd le « pourquoi » des pièges (⚠) ; à faire au BUILD (preparer-www.js / vercel-build.sh), pas dans la source | tous | À DÉCIDER SACHA+LÉO (retrait au build seulement) |
| Banque de sons : `nuages.ambiance` (117,3) + `ui.compteFin` 9,8 + `fig.goutte` 4,2 + `ui.pause` 3,8 + `ui.pop` 2,4 (sons-banque.js, base64) | 137 | `NUAGES_AMB=false` (l. 35395, Léo 08/10 « enlève ») : `sfx('nuages.ambiance')` n'est atteint que si vrai ; les 4 autres ids : 0 citation entre guillemets dans index.html/sfx.js (ni préfixe construit ; `mort.compteFin` est l'utilisé) | fichier GÉNÉRÉ : retirer par la recette (`atelier-son/recettes.js` + `node atelier-son/cuire.js`) puis `?v=` de sons-banque.js et `CACHE` de sw.js | Léo (NUAGES_AMB), session SON | SÛR À SUPPRIMER |
| Formes `SHAPES.*` des 25 caisses `retire:1` d'avant (majeste, hyper, formula, lemans, a_postiere … e_chatelain, a_etalon, d_pagode, d_deesse, etc.) — objet des 56 formes l. 23516 (22 formes = 92,7), classiques l. 22522 (6 = 11,7 dont 3 sont aux 3 nouvelles cachées), pots l. 22173 (0,3) ; + `loftBody` 3,2 et `finShape` 0,5 qui ne servent qu'elles | 98 (25 caisses) | `formes.cjs` : 28 formes n'appartiennent qu'à des caisses retirées ; aucune caisse active ne les nomme (`shape:`) ; hors-CARS, 30 lignes les citent entre guillemets (surtout dbg/essais) | `dbgEssaiCaisse('nom')`, `dbgCar(i)` et la salle blanche de Léo rendraient une forme absente (erreur) ; les LIGNES de CARS restent (index) | Sacha 02/10 (« supprimer ces 6 voitures ») et 06/10 (19 nouvelles) | SÛR À SUPPRIMER |
| 176 fonctions / constantes JAMAIS LUES (+ celles qui ne sont lues que par elles) du grand script — liste complète `inventaire-morts.tsv` | 63,7 | eslint-scope : 0 lecture ; 142 blocs « reste » = 28,2 ; dont : 9 fonctions `jade*` orphelines (jadeNuagesTex 4,0 · jadeRouteDeco 3,1 · jadeTronc 2,1 · jadeRondinsDeco 1,8 · jadeArcheGeo 1,7 · jadeChauffe 1,6 · jadeArchesRondins 1,6 · jadeBoite 1,3 · jadeArches 0,4 = 17,7) ; `ENGINES` (l. 36384, 4,7) + `engCurve9` 3,5 (le commentaire dit « n'est PLUS la source du son ») ; dauphin/singe/mk* (DOL_CHORE 2,8, dolChorePose 1,3, singeAnime 1,9, mkPig 1,1, mkAstroS 1,0, mkFruitS 0,6… = 9,5) ; bqEclat 1,0 ; gGarageInv 1,0 ; drawMinimap 1,0 ; juiceSfx 0,8 ; misPanel 0,7 ; paintSnake 0,7 ; openStall 0,6 ; trailPush 0,7 ; SWIPE_PX 0,8… | quelques `const x=appel()` à effet de bord (colonne « init_pure=NON » du tsv, ex. NY_GATEAU) : ne pas les supprimer sans lire ; noms locaux homonymes (`LF`, `seg`) : lire avant | Léo (jade, dauphins, singe), Sacha (ENGINES) | SÛR À SUPPRIMER (hors lignes « init_pure=NON » : À LIRE) |
| CRYPTOCITY (cryptoInit 4,9 · cryptoPlace 4,1 · CRYPTO_VERRE 3,5 · cryptoTick 2,6 · cryptoPicto 2,5 · lunePinceau 7,0 …, 52 décl. l. 14270-20243, + `NIV_CRYPTO`, `cryptoJouer`) | 55,9 | lancée par `?niveau=crypto` (CRYPTO_URL=false) ou `dbgNiveauCrypto` (le SIMULATEUR de Léo l'appelle) ; absente de SF_CARTES / CARRIERE / NIVEAUX ; seul `cryptoTick` tourne à vide à chaque image | casse le simulateur de Léo ; création de Léo du 13/10 | Léo 13/10 | À DÉCIDER SACHA+LÉO |
| 124 crochets `window.dbg*` sans appelant dans AUCUN script de banc (`dbg-sans-banc.tsv` : dbgRiche 4,8 · dbgBurn 4,4 · dbgEssaiCaisse 3,3 · dbgCamRoute 3,2 · dbgTerrain 2,2 · dbgImpact 2,0 · dbgNyan 1,9 · dbgSinge 1,9 …) | 90,8 | 256 scripts .cjs/.mjs/.js/.py/.sh des dossiers banc/outils des 9 sessions : 0 occurrence ; 119 n'ont aucun appelant dans le jeu non plus. (Les 94 autres dbg* = 78 Ko sont appelés par un banc.) | des bancs des sessions VIVANTES (scratchpads effacés au redémarrage, session UI sans banc/) peuvent les appeler ; dbgBurn = burn-out de Léo (ne JAMAIS retirer) ; dbgEssai* = atelier des caisses/fruits de Léo | toutes | À DÉCIDER SACHA+LÉO (après la dernière passe de bancs) |
| Édition POKI/CrazyGames : 28 branches mortes (l. 63-255 script 1, 31035, 54482 pkPasse…, 18,2) + 82 règles CSS `html.poki` (12,2) + loader SDK | 30,4 (+ 86 mentions de POKI) | POKI_BUILD=false et pas de `?poki=1` : toutes ces branches sont décidées « faux » | `poki-construire.js` fabrique les éditions portails À PARTIR de ce fichier : les retirer de main = abandonner Poki/Crazy ; c'est l'inverse qu'il faut faire si on les garde | Sacha 04-05/10 (portails) | À DÉCIDER SACHA (abandon des portails ?) |
| 100 règles CSS dont une classe/un id n'existe plus nulle part (100 règles, 12,5 : `.mWipe`, `#engBig .eb*`, `#spPhi`, `.c6Onglet/.c6Carte/.c6Jauge/…`, `.hBar`, `#coach .g-*`…) + 482 déclarations écrasées par une plus tardive du même sélecteur (14,8) — `css-mort.tsv` | 27,3 | css-tree + univers HTML/JS (préfixes construits `'x-'+k` pris en compte) | la session INTERFACE écrit `html.c6 …` en ce moment (`.c6Carte`… peuvent être posés avant leur HTML) | Sacha/Léo (chartes 4 à 6) | SÛR À SUPPRIMER (attendre la fin de la session INTERFACE) |
| `atelier-nuages.js` (fichier servi en ligne) + branche `NUAGES_LAB` l. 47340 | 21,4 (18,2 + 3,2) | chargé seulement par `?nuages=1` ; vercel-build.sh le laisse en ligne exprès | outil de Léo | Léo | À DÉCIDER LÉO |
| Anciens nuages `?n8=0` : cotonAleat 7,4 · cotonChouFleur 2,2 · cotonMat 0,4 + 12 branches `NUAGE8` | 10,4 | NUAGE8=true sans paramètre ; « ?n8=0 : les nuages d'avant, pour comparer » (Sacha 30/09) | aucun visible ; perd la comparaison | Sacha 30/09 | SÛR À SUPPRIMER |
| Ancien garage `?bazar=1` : 12 branches `!GAR_AERE` (l. 44824…, 8,3) + calTex/carton/bidon/jerry/bac (1,5) | 9,8 | GAR_AERE=!/bazar=1/ → vrai | aucun visible | Léo/Sacha (garage aéré) | SÛR À SUPPRIMER |
| Code des VOIX — ANN_LIB 1,4, annPlayLayers 2,5, annSpeak 0,9, annPreload 0,5, annRoll, annStop, voixWA 1,4, VOIX_NORM, fxWow, FX_WOW + `!SANS_VOIX` (l. 36727, 37580) + réglage VOIX (HTML `#voxBtn`, `[data-m=vox]`, CSS `html.sansVoix`) | ≈ 8 | SANS_VOIX=true sans `?voix=1` (Sacha 07/10 « PLUS AUCUNE VOIX ») ; mp3 supprimés au lot 1 | `annSpeak` rend aussi le TEXTE affiché (MONSTRE…) : garder une version texte seule ; `?voix=1` disparaît | Sacha 07/10 | SÛR À SUPPRIMER (en gardant annSpeak texte) |
| Ancien HUD masqué en tactile (CSS l. 1139-1154, `#money #speedo #styleBar #msg #trickBox #chainHud #caseHud #survHud #lastAlert #engVig #nitroLbl #record #scan #beatFx #auraHud` + `#minimap #resetBtn #sndBtn #voxBtn #musBtn` partout) | ≈ 7 (CSS 5,4 + HTML 1,3 + JS qui les met à jour : non mesuré) | `display:none!important` sans aucune règle qui les ré-affiche (reaffiche.cjs) | visibles sur ordinateur (non tactile) ! à n'enlever que si la cible est l'app iOS seule | Sacha 05/09 (« écran nu ») | À DÉCIDER SACHA (web PC gardé ?) |
| Variantes Jade : `?vitrail=1` (jadeLisse 4,2 + jadeLisseMat + 12 branches VIT = 5,7), `?nucubes=1` (jadeCumulusTex 1,7 + jadeNuagesVox 1,1 + branche = 5,0), anciens shaders JADE_LISSE/COEUR/PEAU (2,9) | 10,6 | VIT, JADE_NUAGES_CUBES=false sans paramètre | variantes de comparaison de Léo (« les panneaux en relief de la v9 ») | Léo 10-13/10 | À DÉCIDER LÉO |
| Formes des 3 caisses cachées au lot 2 : requin 5,0 + proto (COMÈTE) 0,6 + e_raie 5,0 | 10,6 | `retire:1` posé aujourd'hui | elles doivent REVENIR quand le défi sera écrit (« DEFI A VENIR ») ; `case 'bientot'` de carUnlockText + 3 entrées CAR_UNLOCK `bientot` (<1) idem | Sacha 06/10 (défis à écrire) | À GARDER (jusqu'à décision sur les défis) |
| Infrastructure de banc `?banc=1` : 2 branches (l. 51390, 54356) | 10,0 | BANC_ON=false sans paramètre | TOUS les bancs des sessions l'utilisent | toutes | À GARDER |
| Le moteur de la prairie `?bq=herbe` (bqPrairie 4,0) + `?cadrage=1` (bqPovPanneau 3,4) | 7,6 | BQ_DECOR='blanc', BQ_CADRAGE=false par défaut ; « la prairie reste derrière ?bq=herbe » | Léo a dit « reviens sur le blanc » mais garde la prairie derrière un paramètre | Léo 14/10 | À DÉCIDER LÉO |
| Plots de chantier : `cones*` (conesInstancier 1,7, conesVus 1,6, coneSnd 0,6, conesPose…, 29 décl. = 6,2) | 6,2 | `PLOTS_ON=false` (l. 10485, Sacha/passe graphismes 14/10) : `placeCone` sort avant de poser | la passe GRAPHISMES est en cours sur ces lignes ; les boucles de placement gardent leurs tirages | Sacha 14/10 | SÛR À SUPPRIMER (après la passe graphismes) |
| Niveaux de campagne RETIRÉS de CARRIERE mais gardés dans `genCampagne` (NUAGES 6-10, VILLE 16-20 : 9 branches `n===k`, l. 12302-12504) | 5,3 (+ scories dans campTick) | CARRIERE ne liste que 5 niveaux nuages + 5 ville ; commentaires « (genCampagne les garde) » | le code a été gardé exprès « au cas où » ; Léo | Léo 04-05/10 | À DÉCIDER LÉO |
| `RELIEF_ON=false` (l. 12142) : reliefPiste 3,6 + RELIEF + branches `RV` | 4,5 | const éteinte en dur, « programme gardé derrière UN interrupteur » | aucun | Sacha (vague 3 du relief) | SÛR À SUPPRIMER |
| Données mortes dans `harmonie.js` (clés vapeur-salon 1,0 · lobby-ascenseur 1,0 · nocturnal-groove 1,7 = 3,6) + `SON_TON` | 3,6 | mp3 correspondants supprimés au lot 1 | régénéré par `atelier-son/harmonie.py` | Léo | SÛR À SUPPRIMER |
| `INSTRU_MEL=false` (l. 38787) : instruNote 3,2 + et9 + branche | 3,4 | « la MÉLODIE est retirée » (Léo 03/10, « retire-la ») | aucun | Léo 03/10 | SÛR À SUPPRIMER |
| `?bazar` etc. déjà comptés ; reste des « interrupteurs éteints en dur » : `SANS_LOOPING=true` (l. 12057, 0,8), `SANS_MARCHES/SANS_PILIERS=true` (salle blanche, 1,7), `if(false)` ×5 (1,5), `BUMP_ON=false` (l. 13658), `GAP_ON=false`, `MER_MOTIF=false` (ancienne mer peinte, shader 1,2), `BURN_DOIGT=false` | ≈ 5 | const éteintes en dur | **BURN_DOIGT = burn-out de Léo : NE PAS TOUCHER** ; SANS_MARCHES/PILIERS = essai de Léo du 14/10 (« essayons ») | Léo/Sacha | À DÉCIDER (tous sauf `if(false)` et SANS_LOOPING = SÛR) |
| Ville-n6…n10 (audio, lot 1) | 11 400 Ko audio + 4,4 harmonie | jamais chargés (carr.i<5) | Léo « en attente » | Léo 05/10 | À DÉCIDER LÉO |
| Repli sonore sans console (fxArgent/FX_ARGENT/DEATH_LIB/deathSound ≈ 5 Ko + les 4 mp3 fx/ + 3 m4a death/ ≈ 0,2 Mo) | ≈ 5 | n'ont lieu que si `SONV2` est faux (banque non chargée) | c'est le filet quand sons-banque.js échoue | Sacha 28/09 | À GARDER |
| `?menu=leo` (MENU_SACHA) 6 branches + `?perf=1` PERF_MON (perfMonTick) + `?map=jade` BALADE (BALADE_MOTEUR 2,2…) | 0,5 + 1,4 + 3,0 | paramètres d'URL | l'outil de perf des sessions ; le simulateur de Léo (balade) ; le menu de Léo | Léo | À GARDER (menu=leo : À DÉCIDER) |
| Paramètres d'URL de test restants (`?ui=5` ancienne interface, `?ciel=plein`, `?hd=0`, `?sens=0`, `?pique=0`, `?bloom=ancien`, `?touch=1`, `?heure=`, `?ech=`, `?boost=`, `?refaire=1`, `?chute=0`…) | <1 chacun | gardés exprès « pour comparer » | outils de réglage | Sacha/Léo | À GARDER |

Familles de code VISIBLE confirmées (à ne pas toucher) : PARIS = encore dans la CARRIÈRE (CARRIERE[2], liste affichée par `CARRIERE.forEach`, 41 décl. = 42 Ko) — seulement sorti de NIVEAUX/mode infini le 10/10 ; JADE = dans SF_CARTES (JOUER classique : nuages, ville, jade, espace) ; ORAGE/SURVIVANT = campagne (niveaux 5, 14) ; BURN-OUT (burnTick…, 48 décl. = 43,7 Ko) = garde Léo.

### Totaux
- Code JS « SÛR À SUPPRIMER » (hors banque de sons et CSS) ≈ 98 + 63,7 + 10,4 + 9,8 + 8 + 6,2 + 4,5 + 3,4 + 3,6 + 1,5 ≈ 209 Ko = 4,4 % du grand script ; −6 ms de compilation bureau.
- + banque de sons 137 Ko, + CSS 27 Ko => ≈ 373 Ko de fichier en tout, sans toucher à rien de visible.
- « À DÉCIDER » : crypto 56 · dbg 91 · POKI 30 · atelier-nuages 21 · jade variantes 11 · caisses cachées 11 · bq 8 · campagne 5 · HUD tactile 7 ≈ 240 Ko JS/CSS + 11,4 Mo d'audio (ville-n6-10).
- Les commentaires (2,1 Mo) sont de loin le plus gros poids « invisible » : un retrait AU BUILD (aucune ligne de source touchée) fait passer index.html de 5,65 à ≈ 3,5 Mo et la compilation de 123 à 98 ms.
- Cumul fichiers lot 1 : −10,0 Mo d'audio. Les deux autres gros gains possibles : ville-n6-10 (−11,4 Mo, décision de Léo) et la musique FRÉNÉSIE absente (rien à retirer).

### Ce que je n'ai pas pu vérifier
- Aucun navigateur : « invisible » = prouvé par le code (lectures, constantes évaluées sans paramètre d'URL, CSS sans cible), pas par une capture. Les accès dynamiques (`window[nom]`, `eval`, noms construits `'x'+k`) ne sont vus que par les préfixes `'abc-'+x` ; relire les lignes « init_pure=NON » et `ail>0`.
- Scripts de banc : seuls ceux visibles sur disque (251 fichiers) ; les scratchpads de sessions vivantes et le banc de la session UI (dossier sans `banc/`) n'ont pas été vus.
- Le CSS « écrasé » ne tient pas compte des transitions/animations entre états ; le CSS « ancienne charte remplacée » (charte4 233 Ko, hubGarage 106 Ko, garageVitrine 52 Ko…) est en grande partie ÉCRASÉ par c6 mais ses sélecteurs existent encore : non prouvable sans rendu (seul l'écrasement exact est compté).
- `sw.js` : CACHE à incrémenter à l'assemblage (plusieurs lots changent des assets).
- Gain sur téléphone : non mesuré.
