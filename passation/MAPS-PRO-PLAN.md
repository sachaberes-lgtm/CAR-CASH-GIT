# MAPS PRO — le plan de la session « maps » (2026-11-14), pour la session d'optimisation

Ce fichier est écrit par la session « maps pro » (ordinateur Windows de Sacha) pour la session d'optimisation
(autre ordinateur, même compte). Il dit ce qui est en cours, ce que tu vas recevoir, et ce qu'on te demande d'ici là.
**ÉTAT FINAL, 2026-11-15, 20 h 45 : C'EST SUR `main` ET EN LIGNE (cache v1597, commit 6bd169f6).** Sacha a arrêté la boucle
(« ça suffit, finis proprement et push »). La branche `pro/maps-integration-2026-11-14` = ce `main`. Pour toi : fusionne `origin/main`
dans ta branche (aucun de tes fichiers réservés n'est touché ; 40 fichiers de `code/` changés, liste par `git diff --name-only 545a4722 6bd169f6 -- code`),
puis vérifie sur l'iPhone. Tout est dans `passation/MAPS-PRO-INTEGRATION.md` (contrôles, interrupteurs d'URL, défauts connus, ce qui n'est pas vérifié)
et les six fiches `passation/MAPS-PRO-<MAP>.md`. Fichiers partagés touchés hors `code/maps/` : `moteur/piste-prebati.js`, `moteur/depart-avance.js`,
`moteur/boucle-6-hud.js`, `gameplay/route-sans-haut.js`, `gameplay/route-rythme.js`, `rendu/portails*`. Le reste de ce fichier est l'historique du plan.

## Ce que Sacha a demandé
- **Canyon** : « très buggé dans les textures ».
- **Ville** : moins de torsades et de boucles serrées ; retirer les rectangles (cadres, portiques) que la route traverse — pas le portail de transition de map.
- **Grotte** : un peu moins de tunnels.
- **Nuages** : déboguer les nuages, meilleure animation quand on les traverse (la route ne change pas).
- **Espace** : plus de virages qui exploitent l'endroit / l'envers (toujours aucun looping, aucun anneau, pas de torsade serrée).
- **Jade** : variété des formes d'îlots (la route ne change pas).
- Puis, pour toutes : « aussi peu lourd que ce qu'on a actuellement, mais le maximum possible en rendu sans que ça nuise à la fluidité »,
  en boucle « jusqu'à être sûr à 90 % de ne pas pouvoir faire plus beau et plus fluide ».

## Comment c'est mené
- Une branche LOCALE par map, partie d'`origin/main` v1589 puis fusionnée avec `origin/main` v1596 (ta nuit de finition iPhone y est) :
  `pro/canyon-2026-11-14`, `pro/ville-…`, `pro/grotte-…`, `pro/nuages-…`, `pro/espace-…`, `pro/jade-…`. Elles ne sont pas poussées.
- Passe 1 (finie) : diagnostic, correction, deux vérificateurs adverses, reprise.
- Passe 2 (en cours) : restes + optimisation mesurée contre `origin/main` v1596, contrôle adverse.
- Ensuite, boucle par map : un critique indépendant donne sa confiance qu'on ne peut pas faire mieux dans le budget ; sous 90 %, un ingénieur applique, le critique repasse (cinq tours au plus).
- **Règle de budget** (bloquante) : chaque map finale coûte ≤ `origin/main` v1596, ordinateur ET téléphone (`?tel=1`) : triangles, appels de dessin, sommets calculés, ms de tirage / pré-bâti, mémoire, gels en course. Ce que l'optimisation gagne est réinvesti en rendu.
- Deux versions, un code : tout ce qui retire de l'image est gardé sur `ALLEGE` / `TEL_NATIF`.

## Ce que tu vas recevoir
- UNE branche d'intégration `pro/maps-integration-2026-11-14` (les six maps fusionnées sur le `main` du moment, UNE seule montée de cache), poussée sur `origin` ; puis sur `main` seulement sur l'ordre de Sacha.
- Une fiche par map, dans cette branche : `passation/MAPS-PRO-<MAP>.md` (constats, mesures, tableau « référence / après », commandes des bancs, ce qui n'est pas vérifié).
- Ce fichier sera mis à jour à l'intégration avec les chiffres finaux.

### Fichiers touchés (hors bancs et passation)
| Map | Fichiers de `code/` |
|---|---|
| Canyon | `maps/canyon-relief.js`, `maps/canyon-voute.js`, `maps/canyon-mine.js` |
| Ville | `maps/ville-entree.js`, `maps/ville-scenes.js`, `moteur/piste-prebati.js` |
| Grotte | `maps/grottes-1.js`, `maps/grottes-2.js` |
| Nuages | `maps/nuages-casses.js`, `maps/nuages-modules.js`, `maps/nuages-pouf-gpu.js`, `maps/nuages-v8.js`, `maps/nuages-vitrail.js` |
| Espace | `maps/orbite-2.js`, `maps/orbite-modules.js`, `maps/orbite-roches.js`, `maps/ville-entree.js`, `gameplay/route-sans-haut.js` |
| Jade | `maps/jade-1.js`, `jade-2.js`, `jade-3.js`, `jade-alleluia.js`, `jade-eau.js`, `jade-secoue.js`, `jade-vol.js`, nouveau `maps/jade-formes.js` (inscrit dans `ORDRE.txt`) |

La passe 2 et la boucle peuvent en toucher d'autres dans `code/maps/` et `code/rendu/` : la liste finale sera ici.

### Interrupteurs d'URL déjà posés (pour comparer sur l'iPhone)
- Canyon : `?sans=cytex` (roche, arbres, tube d'avant), `?sans=cylod` (fissures du relief), `?cygrille=N` (grille du relief au téléphone, 16 par défaut).
- Ville : `?sans=villecalme` (route d'avant) ; `?sans=villeportails` arrive avec la passe 2.
- Grotte : `?sans=budgettube` (plafond de 10 s de tunnel par route) et les interrupteurs de la fiche.
- Nuages : voir la fiche (tri de champ `NU_TRI`, limité à la map nuages).
- Espace : `?orbvir=0` (virages d'avant), `?orbidx=0` (roches non indexées).
- Jade : `?sans=jadeformes` (îlots d'avant), `?sans=jadejumelles`.

### Ce qui est déjà mesuré (passe 1, à confirmer en passe 2)
- Canyon : pixels de roche noirs le soir 9,3 % → 0,4 %. Reste : lames de roche à travers la route au téléphone (grille 16 ; la grille 24 les retire pour +14 à +27 % de triangles — solution dans le budget cherchée en passe 2).
- Grotte : part de route en tunnel 24,0 % → 17,0 % (palier 0), route identique à l'octet (seules les parois s'ouvrent).
- Espace : 135 → 156 °/km de virage (cible 200) ; roches indexées : 960 → 162 sommets par roche (ordi), 240 → 42 (téléphone).
- Jade : 15 familles de formes ; +15 % d'appels de dessin au téléphone, HORS BUDGET, à ramener ≤ référence en passe 2.
- Ville : triangles ordi −3,4 % (ville), +1,0 % (crypto, dans le bruit).

## Ce qu'on te demande d'ici l'intégration
- Éviter de modifier les fichiers du tableau ci-dessus (sinon : conflits à la fusion). Si tu dois y toucher, écris-le dans ta passation et préviens Sacha.
- Aucun de ces changements n'a été vu sur un vrai iPhone : les mesures viennent de Chrome headless sur une machine chargée (compteurs déterministes fiables, millisecondes bruitées). **La vérification sur l'iPhone t'appartient** : chaleur, gels, mémoire au changement de map, et les points ci-dessous.
- À regarder en priorité sur l'iPhone à la réception : les lames du canyon ; les appels de dessin de Jade et le saut verre → opaque vers 220 m ; la traversée des nuages (coût de la lèvre et des volutes) ; le pré-bâti de l'orbite avec ses nouveaux virages ; le pré-bâti de la ville calme.
- Si tu as changé des règles communes depuis v1596 (paliers `PAL`, `ALLEGE`, `pisteMoysOn()`, pré-bâti), dis-le dans `passation/` : l'intégration les reprendra telles quelles.

## Où lire la suite
`git fetch origin` puis `git show origin/pro/maps-plan-2026-11-14:passation/MAPS-PRO-PLAN.md` (ce fichier, remis à jour à chaque étape).
