# DÉMARRAGE VITE — le lancement de l'app, de l'ouverture au menu (13/11/2026)

Branche `demarrage-vite` (partie d'`origin/ios-ultime` v1538), chantier `~/cash-car/demarrage-vite`. Rien sur `main`, rien fusionné dans `ios-ultime`, pas de build iOS.
Commits : `8883d9033` (v1539), `096afdda7` (v1540), `f1e480885` (v1541). Les 4 gardes passent.
Règle tenue : l'intro et le menu ne changent pas à l'œil — seul le MOMENT du travail change, et seulement SOUS LE SERPENT (avant le film).

## Comment c'est mesuré
- **Banc `outils/banc-demarrage/lancement.cjs`** (nouveau) : Chrome sans fenêtre et muet, 390×844 ×2, agent iPhone, `?tel=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1`
  (= le chemin du téléphone : `INTRO_APRES` = 1, tout le travail avant le film, puis le film, puis le menu), vraie intro (`intro-161.js`), processeur ralenti ×4
  (`--cpu 4`), cache de programmes chaud (profil réutilisé) ou froid (`--froid 1`, profil neuf). Il relève depuis la 1re ligne de la page : les notes de la boîte
  noire avec leur instant, les tâches longues (`PerformanceObserver longtask`) et les trous entre images (> 50 ms), rangés par phase (AVANT « prêt », FILM, MENU),
  et chaque seconde l'état du chargement (étapes, liaison, chauffe, tôles, départ d'avance, photos). Il touche le logo pour ouvrir le menu. `--suite 1` : ouvre
  ensuite le GARAGE, l'INVENTAIRE (onglet voitures, photos en vue relevées chaque seconde) et lance une COURSE (`dbgJouer`), puis lit les pannes de la boîte noire.
  Exemple : `node outils/banc-demarrage/lancement.cjs --cpu 4 --suite 1 --photo /tmp/x.png` ; avant/après : `--q sans=dense,photovue`.
- Le volet Browser intégré était caché (aucune image, aucun rAF) : inutilisable pour un lancement.
- ⚠ **Le Mac était chargé** (charge 3 à 45, d'autres sessions). Les chronos absolus sont bruités ; les preuves reposent sur l'ORDRE et le NOMBRE (tâches longues,
  images, étapes) et sur des paires avant/après lancées l'une après l'autre. La map du départ est tirée au hasard (la grotte pèse 3 s de plus que les nuages).

## La chronologie du lancement AVANT (×4, cache chaud, `?sans=dense,photovue`)
Tout est EN SÉRIE sur le fil principal, sous le serpent ; le film (`INTRO_APRES`) ne part que quand `introPrete()` ne manque plus rien
(chauffe-intro → étapes → lier → chauffe → tôles → départ d'avance → photos → lit → coup-appui), plafond 30 s.

| instant (×4) | ce qui se passe | ce que la boule attend |
|---|---|---|
| 0 → 4 s | lecture du script (UNE tâche de 3,0 à 4,3 s) | — |
| 5,8 → 10,5 s | **8 photos de voitures** (`photoTour`, 140 à 700 ms chacune, liaison de leurs programmes, `readPixels`) mêlées aux **étapes de la piste** (71 tranches de ~10 ms, une par image) | « chauffe-intro », « etapes » |
| 11 → 13 s | liaison de la 1re image (`lierDemarrage`, 0,4 à 1,4 s, rien d'autre ne tourne) | « lier » |
| 13 → 16 s | chauffe « divers » (36 pas, un par image) | « chauffe » |
| 16 → 23 s | **31 paliers de moteur, un par image, chacun attendant que les programmes du précédent soient LIÉS** (~7 s) | « chauffe » |
| 23 → 28 s | **départ d'avance** à 3-6 ms par image (4,7 s ; 23 s pour une jade) | « tôles » |
| après | **tôles** des voitures (découpe CSG, jusqu'à 2 s chacune) — elles attendaient la fin du départ d'avance, ou 15 s après la chauffe | « tôles » |
| **28,6 / 30,0 / 30,1 s** | **prêt** — 3 essais sur 4 au PLAFOND de 30 s, « manque tôles » | |
| pendant tout ça | la boucle **redessine le menu 3D entier** (bloom, ACES, vignette du moteur) à chaque image, sous un voile noir opaque | |

C'est la même histoire que la boîte noire du 13 Pro : `attend « chauffe » à 5.1 s, à 10.1 s, attend « tôles » à 15.3 s`, trous `photoTour 1143`,
`image loop 851 · getProgramParameter`, `étape rendu 505`.
NB : la liaison PARALLÈLE (`KHR_parallel_shader_compile`, `compileDoux`/`lierPret` qui lit `COMPLETION_STATUS_KHR`) existait déjà (vendor/three.min.js retouché,
`__ccLier`) : les attentes `getProgramInfoLog`/`getProgramParameter` venaient des PHOTOS (rendu synchrone voulu : une photo ne doit manquer aucun objet) et de
dessins hors liaison douce — et la chauffe, elle, sérialisait les liaisons palier par palier.

## Ce qui a changé
### 1. LE CHARGEMENT DENSE — `?sans=dense`, `dbgDense()` (interface/vignette-moteur.js, moteur/boucle-1.js, moteur/depart-avance.js, moteur/intro-161.js)
Actif seulement sous le serpent, avant le film, au téléphone (`INTRO_APRES` et `TEL_NATIF||ALLEGE`), jamais au menu ni en course ; filets : il s'arrête dès que
le film part (`__ccFilmPart`, posé par `introPartir`), que le menu est révélé (`cc:revele`) ou que le voile `#splash` n'est plus là (intro sautée/plantée/ancienne).
- La boucle ne dessine plus le menu qu'**une image par seconde** (`DENSE_RENDU`) ; les autres images ne font que du chargement, jusqu'à **28 ms** (`DENSE_MS`).
- Les **paliers de moteur** (compilés, jamais dessinés) n'attendent plus la liaison du précédent (`denseMoteur`) : leurs programmes se lient ENSEMBLE. Ce qui
  DESSINE (atelier, étapes diverses, scène entière) attend toujours que tout soit lié, comme avant — mêmes dessins hors écran, mêmes états de pipeline.
- Quand la chauffe attend une liaison, une **tôle** se découpe pendant ce temps (calcul pur ; la puce lie à côté). Elles n'attendent plus le départ d'avance
  sous le serpent (la règle d'avant protégeait le départ d'une course, pas le chargement).
- Les **gabarits de la jade** et le **départ d'avance** prennent la tranche qui reste (`DENSE.prebFin`). Le film ATTEND le départ d'avance (`introPrete` :
  « depart-avance » tant qu'il y a une cible et qu'il n'est pas bâti) — avant, il l'attendait de fait, derrière les tôles.
- La **1re piste et les textures** du chargement (`chargeTranches`) : tranches de 28 ms au lieu de 6-8 ms (29 images au lieu de 71).

### 2. LES PHOTOS QU'ON VOIT — `?sans=photovue` (interface/vignette-moteur.js `PHOTO_VUE`, interface/garage-lacher.js, interface/atelier-ferme.js, moteur/intro-161.js)
Téléphone (`ALLEGE`). La bande du garage / la grille de l'inventaire donnent leur carte à `photoFile` : la photo attend que la carte soit EN VUE (la rafale sous le
volet ou la file au repos la prend, une à la fois comme avant) ; aucune photo sous le serpent du lancement ; la boule n'attend plus « photos ».
L'accueil d'arrivée ne montre AUCUNE photo (capture à l'appui) : rien ne change à l'arrivée. Les photos gardées (`PHDB`) reviennent comme avant.

## Avant → après (banc ×4 ; chaque ligne « après » a sa paire « avant » lancée juste avant ou après)
| essai | map tirée | AVANT : prêt | APRÈS : prêt | tâches longues avant « prêt » (avant → après) |
|---|---|---|---|---|
| cache chaud | ville / nuages / jade | 28,6 s · 30,1 s (plafond) · 30,0 s (plafond) | **13,7 s · 12,2 s · 13,1 s** | 53-71 (10,4-15,0 s) → 42-49 (8,2-9,5 s) |
| cache chaud, map lourde | grotte | 30,0 s (plafond) | **15,9 s** | — |
| cache FROID (profil neuf) | grotte / espace | **30,0 s (plafond, manque « tôles »)** | **12,1 s** | 71 (14,6 s) → 41 (8,4 s) |

- **Départ du film** : avant, une tâche de 0,35 à **3,4 s** juste au départ (froid) ; après, 0 à 0,7 s (dans les 400 ms de silence voulues avant la 1re image du film, `INTRO_DRAIN`).
- **Pendant le film** : 0-1 tâche longue (≤ 78 ms) des deux côtés ; images de la boule : pire 17-50 ms (inchangé).
- **Les 8-10 premières secondes du menu** : avant, 1 tâche de 409-430 ms (2 essais sur 2) ; après, 0 (3 essais sur 4 ; 1 essai : 3 de 51-81 ms).
- **Le départ d'avance** est bâti avant le film en 16-108 images (au lieu de 130-151 images, parfois fini au menu).
- **Vérifications** (`--suite 1`, 4 essais) : même accueil (même caisse, mêmes boutons — captures) ; au 1er passage dans l'INVENTAIRE, la photo de la voiture en
  vue arrive en moins d'une seconde (une tâche de 209 ms au ×4, après l'entrée du tiroir) ; une course démarre (`started, running`, 3 s après JOUER) ;
  aucune panne, aucune erreur, aucune promesse rejetée.

## Ce qui ne se mesure que sur le téléphone
- **Le chrono réel** : la boîte noire écrit déjà tout (`chargement | mode 1 · prêt en … : lier …, chauffe …, photos N restantes, étapes N` — après ce correctif
  « photos 8 restantes » est normal — et les `attente | attend « … »`). À relire après un build : on attend la disparition des `attend « tôles »`, moins de
  `attend « chauffe »`, et un « prêt » nettement sous 13 s. `dbgDense()` dit combien d'images denses, de pas, de tôles et de ms.
- **La liaison groupée des 31 paliers de moteur** : sur Metal, lancer ~100 programmes d'un coup se lie-t-il vraiment en parallèle (gain) ou en file (pas de gain, pas
  de perte) ? Lire `lier` et la durée de « chauffe » dans la boîte noire.
- **Le serpent** est dessiné par iOS (SerpentNatif) : les tranches de 28 ms ne le touchent pas. Dans un navigateur de téléphone (pas l'app), `INTRO_APRES` vaut 0 :
  le chargement dense ne s'allume pas.
- **La 1re seconde du menu** après le film : le menu n'a été dessiné qu'une fois par seconde sous le serpent ; ses programmes et états de pipeline sont prêts
  (chauffe faite et dessinée hors écran), mais un premier rendu un peu plus long reste possible — à lire dans les lignes `serpent`/`gel` du build de mesure.

## Non fait — propositions
- **Le `remesure` de l'intro (téléphone tourné pendant le film, 506 ms)** : `prepare()` refait logo, boule et fracture à la nouvelle taille. Préparer les deux
  orientations d'avance coûterait ~0,5 s à CHAQUE lancement pour un cas rare ; l'étaler casserait l'image (canevas redimensionné, logo à l'ancienne taille).
  Le bon remède est natif : verrouiller le portrait pendant l'intro (Swift, hors de mon champ) — à décider avec la session iOS.
- **Les photos refaites à CHAQUE build de l'app** : `CC_PHOTOS` n'est PAS gravé par `app-ios/preparer-www.js` (seul `CC_BUILD` l'est, avec le commit) ; les photos
  gardées (`PHDB`) portent donc le commit et sont jetées à chaque build. Vercel, lui, grave l'empreinte des seuls fichiers qui dessinent une photo
  (`vercel-build.sh`, ligne `PHOTOS=`). Graver la même empreinte dans `preparer-www.js` (3 lignes) éviterait de refaire les photos à chaque mise à jour de l'app
  qui ne touche pas les caisses. Non fait : `app-ios/` est hors de mon champ.
- **La lecture du script** : une tâche de 3 à 4 s (×4) avant tout le reste. Hors de ce chantier (taille du script, découpe).
- **Les tôles** (découpe CSG des carrosseries, jusqu'à 2 s chacune au ×4) ne sont utiles qu'au garage/à la boutique : elles pourraient être GARDÉES d'un lancement
  à l'autre (comme les photos) — gros gain au lancement, mais à valider (mémoire, versions).
