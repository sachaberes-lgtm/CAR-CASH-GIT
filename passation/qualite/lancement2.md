# Lot « lancement2 » : le film charge le reste (2026-11-15, branche qa/lancement2)

But : raccourcir le SERPENT d'avant le film sans abîmer le film. Sacha : « le film d'intro permet de charger le reste, ce qui prend du temps c'est le serpent avant le film ».

## Ce qui change (téléphone seulement : INTRO_AP = 1 et chargement dense, donc TEL_NATIF / ALLEGE)
1. **Le film part sans attendre la fin du départ d'avance** (la piste de la 1re course). Tout ce qui est un bloc reste AVANT le film, sous le serpent, comme avant : étapes, liaison, chauffe, tôles, et le début du départ d'avance (`prebPart`, gabarits de la jade).
2. **Le noir d'ouverture sert au chargement.** Constat dans le code : de 0 à 0,7 s le film ne montre que du noir et le serpent (`chCl`), le 1er point de la boule naît à 0,8 s. Jusqu'à 0,66 s le départ d'avance garde donc ses tranches du serpent (28 ms, `?filmnoir=`). Aucune image ne s'y voit.
3. **Pendant la boule, avant le toucher** : une tranche APRÈS le dessin de chaque image, 4 ms par défaut (`?filmtranche=<ms>`). Pas de tranche dans une image déjà en retard, ni dans l'image qui suit une tranche qui a débordé.
4. **La boule n'accepte le toucher que le départ d'avance fini** (`filmReste`). Plafond inchangé : 20 s de boule. Au toucher, plus aucune tranche : l'explosion joue seule.
5. **Banque de sons 2** (app, tardive depuis le lot 1) : le fichier est LU (`fetch`) pendant l'arrêt d'avant-film (INTRO_DRAIN, sous le serpent), puis ses 243 sons sont relevés par tranches de 4 ms dans le film (expression régulière qui avance). Fichier illisible : la balise `<script>` au moment d'avant.
6. **Calme d'avant-film** : 24 images calmes au lieu de 40 (`?filmcalme=40` = avant). C'est la durée de l'arrêt INTRO_DRAIN, et les 0,8 premières secondes du film sont noires.
7. **Chauffe de l'intro** sans son minuteur de 900 ms (`?sans=filmchauffe`).
8. **Boîte noire** : la ligne `chargement | mode 1 · prêt en …` finit par `· film-charge 4 ms, reste au film : depart-avance`. Une 2e ligne à l'ouverture du menu :
   `chargement | film · parti à 11.7 s · restait : depart-avance · tout prêt à 14.7 s · boule prête à 16.3 s · toucher à 16.4 s · noir d'ouverture : 19 tranches (28 ms), 575 ms · boule : 136 tranches (4 ms), 508 ms, pire 22 ms, de 8-12-20-34 ms et plus : 1-4-1-0, images sans tranche 7 · banque 2 - · images du film 513, > 20 ms : 16 (dont 16 dans le noir d'ouverture, rien à l'écran que le serpent), > 34 ms : 2 (dont 2 dans le noir), pire 67 ms`
9. `?introdrain=<ms>` existait déjà (défaut 400) : pas touché.

Essayé puis retiré : préparer le son du jeu (`ouvrir`) dès la liaison finie. Son coût (≈0,45 s ×4) se déplaçait sous le serpent, gain nul.

## Interrupteurs d'A/B
| Adresse | Effet |
|---|---|
| `?sans=filmcharge` | le chemin d'avant, exact (tout le lot éteint) |
| `?filmtranche=<ms>` | budget par image de la boule (défaut 4 ; 0 = un pas par image) |
| `?filmnoir=<ms>` | tranche dans le noir d'ouverture (défaut 28 ; 0 = rien dans le noir) |
| `?filmcalme=<n>` | images calmes avant le film (défaut 24 ; 40 = avant) |
| `?sans=filmbanque` | banque 2 tardive comme au lot 1 |
| `?sans=filmchauffe` | minuteur de 900 ms de la chauffe de l'intro |
| `?introdrain=<ms>` | arrêt d'avant-film (défaut 400, inchangé) |

`dbgIntro.film()` rend les mêmes chiffres que la 2e ligne.

## Fichiers
- `code/moteur/intro-161.js` : tout le lot (FILM_CH, filmTranche, filmReste, filmLigne, introPrete, boule prête).
- `code/moteur/depart-avance.js` : une ligne, l'échéance de la tranche du film (`FILM_TR.fin`).
- `code/interface/vignette-moteur.js` : une ligne, `const FILM_TR` (à côté de DENSE_MS ; lignes 340-380 pas touchées).
- `VERSION PRINCIPALE/sfx.js` : `filmDebut` / `filmTranche` (dans le bloc app du lot 1), `CCSON.etat().banqueFilm`.
- `outils/banc-demarrage/film.cjs` : le banc (nouveau).

## Prouvé au banc (Chrome sans fenêtre, muet, 390×844 ×2, `?tel=1&introapres=1`, processeur ×4, cache chaud, map forcée pour comparer)
Banc : `node outils/banc-demarrage/film.cjs --cpu 4 --q "carte=grotte&meteo=nuit"`. Avant = `sans=filmcharge`. Temps depuis l'origine de la page.

| Map | | Serpent (départ du film) | Boule prête (toucher accepté) | Menu (toucher immédiat) |
|---|---|---|---|---|
| grotte (la plus lourde) | avant ×3 | 14,85 · 13,89 · 14,40 s | 19,47 · 18,51 · 19,04 | 23,83 · 22,85 · 23,36 |
| | après ×3 | 11,98 · 11,67 · 11,34 s | 16,60 · 16,29 · 15,96 | 21,01 · 20,71 · 20,36 |
| | gain moyen | **−2,7 s** | −2,7 s | −2,7 s |
| jade | avant ×2 | 13,68 · 13,49 | 18,30 · 18,11 | 22,63 · 22,44 |
| | après ×2 | 12,44 · 12,26 | 17,06 · 16,89 | 21,39 · 21,21 |
| | gain moyen | **−1,2 s** | −1,2 s | −1,2 s |
| nuages | avant ×2 | 12,85 · 12,13 | 17,47 · 16,75 | 21,80 · 21,14 |
| | après ×2 | 11,32 · 11,34 | 15,94 · 15,96 | 20,30 · 20,27 |
| | gain moyen | **−1,2 s** | −1,2 s | −1,2 s |

D'où vient le gain : l'écart « prêt → film » passe de 1,1 s à 0,9-1,1 s (calme 24 : ≈0,15 s en moyenne, dans le bruit), et surtout le départ d'avance ne retient plus le film (0,3 à 3,3 s selon la map).
Le travail du film finit toujours avant les 4,6 s minimum de la boule (grotte : tout prêt 2,9 à 3,6 s après le départ du film) : la boule n'est jamais retenue au banc.

### Les images du film (intervalles entre deux images, relevés par le banc)
| | Noir d'ouverture (0-0,8 s, écran noir) | Boule (0,8 s → toucher, ~230 images) | Explosion (toucher → menu, ~253 images) |
|---|---|---|---|
| avant (7 lancements) | 0 > 20 ms | 0 > 20 ms, pire 16,8 | 1-2 à 33 ms ; dernière image 33 à 83 ms |
| après grotte (6 lancements) | 12-16 > 20 ms, 2-6 > 34 ms, pire 67-117 ms | **> 20 ms : 1 · 0 · 3 · 1 · 1 · 1 (toutes à 33,3 ms) ; > 34 ms : 0** | comme avant |
| après jade, nuages (4 lancements) | 7-18 > 20 ms, pire 33-67 ms | **0 > 20 ms** | comme avant |

- Les images longues du noir d'ouverture sont invisibles (rien à l'écran que le serpent, qui tournait déjà sur ces mêmes tranches avant). La ligne de la boîte noire les compte à part.
- Pendant la boule visible de la grotte : 0 à 3 images à 33 ms par lancement, aucune au-delà. Cause : des pas indécoupables du générateur de piste (20-33 ms ×4, 1 à 3 par construction ; `code/maps` et `piste-prebati.js` sont interdits). L'ancien chemin n'en avait aucune. **C'est le prix du lot sur la map la plus lourde, au banc ×4.**
- Choix du budget (grotte, 1 lancement chacun) : 4 ms → 1 image à 33 ms ; 6 ms → 0 ; 8 ms → 2 images à 50 ms. 4 ms retenu : aucune image > 34 ms sur 6 lancements, et le travail finit quand même avant la boule prête.

### Autres vérifications au banc
- **Toucher très tôt** (`--tot 1`, toucher 1,1 s après le départ du film) : ignoré, boule prête à 16,9 s, menu ensuite. Rien ne s'ouvre avant.
- **JOUER dès le menu** (`--jouer 1`) : course en route 5,2 s après (avant : 5,8 s), `dbgDepart()` n = 0 (aucun voile d'attente), 0 erreur. ⚠ Dans ce banc `dbgJouer` annule le départ d'avance (`der: cible`) avant comme après : il ne prouve pas que la piste bâtie pendant le film est PRISE au départ.
- **`?sans=filmcharge`** : `dbgIntro.film().on` faux, 0 tranche, ligne `chargement` d'avant (« libérés : chauffe-intro 5,5 … depart-avance 14,5 »), temps d'avant.
- **Banque 2** (copie de VERSION PRINCIPALE à banque scindée, `?banquetard=1`) : lecture du fichier 10,70 → 10,94 s (pendant l'arrêt, avant le film à 11,35 s), 243 sons relevés en 1-2 tranches (5-7 ms en tout), finie à 11,3 s. Avant : 22,5 s (menu + 1,2 s). Boule : 0-1 image à 33 ms (la grotte), 0 sur une map tirée au sort. `tardifs` 0, `perdus` 0. Contrôle hors navigateur : les 243 paires relevées par l'expression régulière sont identiques à celles du script (0 différence).
- 0 exception, 0 panne sur tous les lancements. Assemblage d'accord, `garde-demarrage`, `garde-allege`, `garde-charte` OK, `node --check` OK sur le script du jeu (10,7 Mo) et sur sfx.js.

## Ordinateur
Par lecture du code : `FILM_CH` exige `INTRO_AP === 1` (0 sur l'ordinateur) et `DENSE.ok`. Hors de là : mêmes minuteurs (500 / 900 ms), calme 40, `introPrete` inchangé, aucune tranche, `filmDebut` jamais appelé. Seuls ajouts exécutés partout : un compteur (`> 34 ms`) et deux horodatages dans la boucle du film. sfx.js : le nouveau code est dans le bloc « app seulement » du lot 1.

## NON prouvé
- Rien n'a tourné sur iPhone. Pas de build, pas de simulateur.
- Le gain réel sur le 13 Pro. Le banc ×4 donne −1,2 à −2,7 s ; le lot 1 mesurait « prêt » à 5,2-5,4 s à chaud sur le téléphone contre 13-14 s ici, donc attendre plutôt **−0,4 à −1 s** (estimation, pas une mesure).
- Les images de 33 ms pendant la boule : mesurées sous Chrome ×4, pas sous WebKit. Sur un téléphone non bridé presque tout le départ d'avance devrait tenir dans le noir d'ouverture (non mesuré).
- `fetch` de `sons-banque-2.js` dans l'app (schéma `capacitor://`) et le coût de sa mise en texte sous WebKit. Au banc, une tâche de 76 ms ×4 est tombée à cet instant (pendant l'arrêt puis le noir : invisible). Si la lecture traînait au-delà de 0,66 s de film, ce bloc tomberait sur la boule. `?sans=filmbanque` l'écarte.
- La piste bâtie pendant le film est-elle prise au 1er JOUER (voir ⚠ plus haut).
- Le son : banc muet. Le son du film (programmé d'avance sur son contexte) ne devrait pas bouger avec les tranches ; pas écouté.
- Mode éco (écran à 30 Hz) : 24 images calmes = 0,8 s au lieu de 1,33 s. Pas essayé.
- L'ordinateur au banc : essayé (1280×800, sans paramètre de téléphone), mais la page de l'ordinateur ne donne pas ses crochets (`dbgIntro`, `dbgDense`) dans le cadre principal, avec ou sans le lot : rien relevé. La preuve est la lecture du code (voir « Ordinateur »).
- Les trois dernières retouches (borne basse de `?filmtranche=`, `?filmnoir=0`, banque lue même si le budget vaut 0) sont passées par l'assemblage, les gardes et `node --check`, pas par un lancement au banc : le banc était tenu par une autre session.

## À mesurer sur le 13 Pro (boîte noire, `outils/banc-perf/boite-noire.sh`)
1. 3 lancements à chaud avec le lot, 3 avec `?sans=filmcharge` : « film · parti à » contre « prêt en » + 1 s ; et la sensation du serpent.
2. Lire la 2e ligne : `> 20 ms` hors du noir doit rester à 0-1 ; `> 34 ms` hors du noir à 0. Sinon essayer `?filmtranche=2`, puis `?filmnoir=0`.
3. Un lancement où la grotte est tirée (`?carte=grotte&meteo=nuit`) : « tout prêt à » avant « boule prête à ».
4. `banque 2 finie` sur la ligne, et les sons de la 1re course présents ; sinon `?sans=filmbanque`.
5. `?filmcalme=40` contre défaut : les 2 premières images du film (ligne `intro`).
6. JOUER tapé tout de suite au menu : pas de voile d'attente (ligne `attente | départ attendu`).
