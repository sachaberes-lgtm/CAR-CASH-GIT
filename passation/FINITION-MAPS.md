# FINITION GRAPHIQUE DES MAPS (18 → 20/11/2026)

Branche : `claude/finition-maps-dee281`, partie de `origin/main` dbc5f1d54 (livraison du 19/11).
**Rien n'est sur `main`, rien dans `qualite-appareil`, aucun build installé. Le vrai téléphone n'a rien vu** : tout est jugé dans Chrome sans fenêtre en `?tel=1`, aux formats iPhone 844×390 et 390×844.
Ni `VERSION PRINCIPALE/index.html` ni `sw.js` ne sont commités ici : à la livraison, assembler (`node code/assembler.cjs --depuis-morceaux`) et monter `cashcar-vNNN`.

Méthode : un lot par map, un auteur puis un contrôle adverse qui exécute le lot au banc (image, comptes `renderer.info`, console, route au bit près). Seuls les lots déclarés FUSIONNABLES sont sur la branche. Chaque lot a son interrupteur `?sans=<nom>` qui rend l'image d'avant.
Planches avant/après et note détaillée de chaque lot (mesures, tous les tours de contrôle) : `passation/photos/finition-maps/<lot>/` et son `NOTE.md`.

Tout couper d'un coup : `?sans=nappes,couleursfinies,espacefini,jadefini`.

## État

| Lot | Sur la branche | Interrupteur | Contrôle au banc |
|---|---|---|---|
| Grotte (nappes de lave et d'eau) | oui | `?sans=nappes` | fusionnable, 19/11 |
| Couleurs (nuages, ville jaune) | oui | `?sans=couleursfinies` | fusionnable, 19/11 |
| Espace | oui | `?sans=espacefini` | fusionnable, 20/11 |
| Pic de Jade | oui | `?sans=jadefini` | fusionnable, 20/11 |
| Canyon | NON (branche `finition-maps-canyon`) | `?sans=canyonfini` | à corriger au 19/11, correction en cours le 20/11 |
| Modules de l'espace | abandonné | — | Sacha a retiré les géants (41285daf1) |

Coût, pour les quatre lots fusionnés : aucune texture, aucun maillage, aucun programme, aucune instruction GLSL en plus (l'espace en retire une). Au banc : 149 programmes avant = après partout, textures égales, appels et triangles dans le bruit du banc (les écarts existent aussi entre « avant » et « sans », qui sont le même code). Routes identiques au bit près sur ≥ 20 graines × 2 paliers pour chaque lot.

## 1. Grotte — les nappes de lave et d'eau

Seul lot qui touche à la génération (celle des nappes, pas celle de la route).
- Fichiers : `code/maps/grottes-1.js`, `grottes-2.js`, `grotte-travailleur.js` ; bancs `outils/banc-routes/grotte-nappes.cjs`, `outils/banc-nappes/`.
- Cause du « pas de limite » : la portée d'un lac était décidée par sous-cube de 48 m, d'où des parois d'eau ou de lave debout dans le vide, des nappes qui flottent, des dessous peints.
- Ce qui change (`grtNappesG`, sans hasard, la route est seulement lue) : les poches d'air fermées sous le niveau sont comblées (moins de 4 096 cases, loin de la route), les encoches du plan d'eau de 48 m ou moins sont refermées, l'eau et la lave ne gardent qu'une lèvre de 12 m sur leur rive, le reste est de la roche.
- Mesures (banc Node, graines que l'auteur n'avait pas choisies) : paroi peinte 327 464 → 24 472 m², 471 478 → 60 372, 1 350 561 → 91 838, 499 852 → 16 781 ; nappes qui flottent, murs et contacts lave-eau : 0. Aucune nappe supprimée. Le travailleur sort les mêmes octets (419 tronçons, 0 écart).
- Coût : triangles de la grotte égaux à ±0,2 %. `grtNappesG` : 26 à 258 ms en jeu, découpé en tranches (359 ms en Node sur la plus grosse grotte).
- Non vérifié : le temps de `grtNappesG` sur le vrai iPhone ; la météo glace n'a qu'une vue ; aucune photo ne montre de près une poche comblée ; une chute dans une poche comblée tue par « eau » ou « lave » au lieu de « roche » (la route n'y passe pas) ; il reste 60 000 à 92 000 m² de paroi sur certaines graines, visibles seulement depuis l'air sous le niveau.
- À l'œil : sur les vues courantes le lot ne change presque rien, il retire des défauts.
- Décisions pour Sacha : (1) les grandes salles sous le niveau ne sont pas noyées, elles gardent un bord de roche ; (2) sur une graine (g56) la roche près de la lave est un peu plus orange (+2 points de rouge) : la garder ou l'assombrir.

## 2. Couleurs — mer de nuages et ville d'orage

Audit mesuré des maps au tirage du téléphone hors des autres lots. Rien de brûlé, pas de rouge venant des maps : les défauts étaient des ternes.
- Fichier : un nouveau morceau `code/rendu/couleurs-finies.js` (24 lignes, inscrit dans `ORDRE.txt` après `chute-menu.js`), uniquement des nombres d'ambiance. Banc : `outils/banc-finition-couleurs/`.
- Nuit des nuages : la route n'est plus noire (noirs du tiers bas 28,7 % → 0,1 %), chroma 65 → 80, route violette.
- Pluie : chroma 36 → 45-50. Matin et midi : +4. Orage : +5. Ville jaune : chroma 45 → 53.
- Inchangés : soir des nuages, ville violette, ville verte.
- Non vérifié : une seule vue par scène, pas de vue face au soleil ni avec la nitro ; l'ordinateur sans `?tel=1`.
- Décisions pour Sacha : (1) hors de la nuit, le gain se mesure mais se voit peu : en vouloir plus (pluie `chr .35`, matin/midi `sat ×1,10`) ? (2) ville jaune : l'air reste brun et les néons ambre sont un peu plus vifs (rouge 5,5 → 6,0 %) : garder, ou verdir le ciel ? (3) la ville violette est sombre (11-15 % de noirs), laissée intacte : la déboucher ? (4) la nuit des nuages est plus lisible mais un peu plus voilée : à juger à l'œil.

## 3. Espace — finition sobre

- Fichiers : `code/maps/orbite-embellie.js`, une ligne dans `orbite-geants.js` ; banc `outils/banc-finition-espace/`.
- Face nuit de Mars et Saturne : le croissant nocturne n'est plus un trou noir, il se fond dans le ciel (pixels noirs de Mars en portrait 13,1 % → 0,25 %).
- Nébuleuse un peu retenue (`ESP_NEB` 1,25 au lieu de 1,7), cinq littéraux de matière des satellites et des roches (la face à l'ombre passe du noir à une encre violette).
- Éblouissement : ≤ 0,45 % de pixels brûlés, rien sur la route ; inchangé par le lot.
- À l'œil : seul Mars change vraiment ; Saturne à peine ; la Terre et les amas, rien de visible.
- Non vérifié : l'écran OLED du vrai iPhone (c'est là que la face nuit compte) ; les météorites de Mars et Saturne en gros plan ; `?plus=geants`.
- Pour la session espace : les amas de satellites et de météorites restent peu lisibles à 150-360 m (10-30 px). C'est la distance, pas la matière : les rapprocher ou grossir le plus gros (`ESP_AMAS.dLib`, `espAmasLieux`).
- Décision pour Sacha : face nuit à .030, plus sombre (.022) ou plus claire (.045) ?

## 4. Pic de Jade — couleurs, nuit, pluie

- Fichiers : `code/rendu/lumiere-design.js` (bloc `JADE_FINI`, des nombres), `code/rendu/scene-ciel.js` (l'astre « Japon », mêmes opérations, gardé) ; banc `outils/banc-finition-jade/`.
- Soir, moins rouge : rouge-orange vif du haut 25 → 19 %, 23 → 17 %, 27 → 17 % selon la graine ; zénith lilas-pervenche au lieu d'un ciel tout orange, disque vermillon net.
- Nuit, moins terne : le ciel est plus clair et plus coloré (luminance du haut 53 → 65, 43 → 57 ; chroma +18 à +38), bleu nuit et bande sarcelle ; le sol jade est celui d'avant.
- Pluie, plus verte : vert du haut 81 → 86 %, 90 → 96 % ; chroma du haut +26 à +36 ; reste plus sombre que le midi.
- Orage, matin, midi : plus colorés (chroma du haut +47 au matin et au midi).
- 0 % de pixels brûlés partout.
- Non vérifié : matin, midi, orage et astre en portrait ; les fondus entre météos ; l'ordinateur.
- Décisions pour Sacha : (1) le milieu de l'image au soir est un pêche plus pâle (plus clair, un peu moins saturé) : si c'est délavé, `jdM [1,.72,.54] → [1,.70,.50]` ; (2) vers le soleil du soir, le ciel derrière l'astre est une lavande assez saturée : question de goût ; (3) sous la pluie la route perd 5-6 points de chroma, sans être moins lisible.

## 5. Canyon — le soir trop rouge (PAS sur la branche)

Branche `finition-maps-canyon`, fichier `code/maps/canyon-relief.js` (bloc `CY_FINI_R`).
- Bon et jugé au banc : la nuit (chroma +7 à +25 %), la pluie (route bleu canard, chroma 7 → 23-29), l'orage (chroma +60 %), 0 % brûlé, coût nul.
- Refusé au 19/11 : le soir. Moins de braise, mais la roche tournait au kaki délavé (chroma −27 à −40 %), une graine restait trop rouge et l'image était 5 à 9 % trop claire.
- Une correction mesurée est en cours le 20/11 ; elle n'entre sur la branche que si son contrôle au banc la déclare fusionnable. Voir la fin de `passation/photos/finition-maps/canyon/NOTE.md`.

## Pour livrer

1. Fusionner `origin/main` dans la branche, `node code/assembler.cjs --depuis-morceaux`, puis `--verifier`.
2. Compiler les `<script>` d'index.html (`vm.Script`) : un seul échec attendu, le script 5, qui échoue pareil sur `main` (l'extracteur coupe dans un commentaire).
3. `node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh`.
4. Monter `cashcar-vNNN` dans `sw.js`, committer `code/` et index.html ensemble.
5. Sur le vrai iPhone, regarder d'abord : la nuit de Jade, le soir de Jade, la nuit des nuages, Mars de nuit (OLED), une grotte avec de l'eau.
