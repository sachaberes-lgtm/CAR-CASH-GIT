# LOT « PARTICULES » — le rendu net (15/11)

Demande de Sacha : « Trop de particules avec la voiture : la fumée, les petites étincelles du capot, les petites particules blanches qui sortent de la voiture des fois, les particules dans les airs. On veut un rendu TikTok. On garde QUE les particules de quand tu ramasses des pièces. »

Branche `qa/particules`, worktree `~/cash-car/qualite-particules`. Retour à l'avant : **`?plus=particules`**.

## Comment c'est coupé
- `PNET` + `pnetCoupe(nom)` (`rendu/tirelire-reserves.js`) : vrai **en course seulement** (`running && !garageOn`), sauf avec `?plus=particules`. Le garage, la boutique, la vitrine et la révélation ne changent pas.
- On coupe **là où ça émet** (pas la réserve) : les réserves `sparkGold`/`sparkBlue` servent aussi aux pièces, aux fruits et à la mort.
- Une réserve où rien ne naît dort déjà (`visible=false`, plus parcourue par `updatePool`). Donc couper l'émission retire l'appel de dessin, la mise à jour par image et l'envoi au GPU. Les petits bouts de tôle (`dropChip`) ne créent plus de géométrie ni de matière neuves.
- `dbgParticules()` : les naissances par réserve, les réserves allumées (= appels de dessin), les effets coupés. `dbgParticules(1)` remet à zéro.
- L'aléatoire du jeu (`Math.random`) n'est plus consommé par ces effets : une course du banc ne suit plus exactement le même tirage qu'avant.

## Recensement (en course)
| nom (`pnetCoupe`) | fichier | quand | à quoi ça ressemble | état |
|---|---|---|---|---|
| glisse | moteur/boucle-3-physique.js (fumée de gomme) | dérapage, grosse charge | fumée lavande aux roues arrière | COUPÉ |
| pots | boucle-3 (braises d'échappement) | accélération, nitro | traits de feu + braises aux pots | COUPÉ (la plume JETS et le feu de pixels restent) |
| retour | boucle-3 (retour de flamme) | pied levé > 280 km/h | 6 traits de feu aux pots | COUPÉ (le son reste) |
| jetVol | boucle-3 (réacteur en vol) | vol au nitro | crayon de feu + braises | COUPÉ |
| raclage | boucle-3 | roues au-delà de la lèvre | étincelles d'or | COUPÉ |
| raseBord | moteur/boucle-2-conduite.js | rase-bord | étincelles bleues | COUPÉ |
| plaque | boucle-2 | plaque turbo | gerbe d'or | COUPÉ |
| bosse | boucle-2 | retombée d'un petit saut | poussière aux roues | COUPÉ |
| flaque | boucle-2 | flaque d'huile ou d'eau | gerbe d'eau / poussière | COUPÉ |
| toles | rendu/billets-devises.js `dropChip` | au hasard en roulant, pose dure | petits cubes de tôle qui tombent de la caisse | COUPÉ (le cliquetis reste) |
| comete | moteur/boucle-6-hud.js | 3 derniers paliers moteur | caisse en feu permanent (flammes, braises) | COUPÉ |
| nitroFin | rendu/stries-vent.js `nitroEteint` | nitro relâchée | langue de feu + braises aux pots | COUPÉ (`nfeuFin` et la pétarade restent) |
| nfeuEtinc | voitures/nitro-feu.js `nfeuEtincelle` | nitro, pops du moteur | petits cubes blancs/jaunes qui giclent dans le monde | COUPÉ (le feu de pixels lui-même reste) |
| sillage | voitures/atchoum-feu.js `sillageStep` | nitro | braises crachées le long du ruban | COUPÉ (le ruban reste) |
| pluieCaisse | gameplay/pluie-caisse.js | sous la pluie | gouttelettes blanches qui rejaillissent du toit | COUPÉ (la pluie de la map reste) |
| levre | rendu/traces-pneus.js, gameplay/sensations-flow.js | lèvre rattrapée | étincelles d'or | COUPÉ |
| drift | gameplay/sensations-flow.js | drift chargé, turbo, gomme qui reprend | étincelles bleu/or/rose, poussière | COUPÉ (la bille du stick garde la couleur) |
| demiTour | gameplay/demi-tour.js | demi-tour, burn-out, verglas | anneau de fumée, braises, givre | COUPÉ |
| pose | demi-tour.js `tryLand`, mort.js `landBoom` et `poseGerbe`, vol-equilibre.js `veqContact` | atterrissage | gerbe d'or/bleu, gomme, anneau de poussière | COUPÉ (secousse, son, anneau restent) |
| decolle | gameplay/portail-passage.js `startFall` | décollage | poussière + braises sous la caisse | COUPÉ |
| flanc | portail-passage.js `sensBumpFlanc` | flanc qui cogne une tranche | gerbe d'or | COUPÉ |
| saut | gameplay/vol-equilibre.js `veqSaut` | saut voulu | souffle de feu + or | COUPÉ |
| figure | figures-physique.js, figures-route.js | figure (explosion, jet tenu, plantée, toupie, figure au sol) | feu, braises, poussière, or | COUPÉ (le coup de rein reste) |
| frole | gameplay/frole-contrats.js | plot frôlé | étincelles bleues | COUPÉ |
| impMini | gameplay/impact.js `impMini` | mur touché sans mourir | gerbe d'or + braises | COUPÉ (l'étoile et les éclats de paroi restent, voir plus bas) |
| replace | missions/atelier.js `sensPassages` | replacement (R) | poussière aux roues | COUPÉ |
| braquage | interface/jus-echelle.js `heistFire` | le braquage (frénésie) | colonne de feu, fumée, or | COUPÉ |
| — | gameplay/ramassage.js | **pièce ramassée** | gerbe d'or, LA GORGÉE | GARDÉ, intact (fichier non touché) |
| — | gameplay/mort.js, impact.js `impDetone/impTick`, boucle-3 (mode boom), gravite-orbite.js | mort, impact mortel | explosion | GARDÉ |
| — | rendu/stries-vent.js `ventN`, `spawnStreak` | vitesse | stries | GARDÉ |
| — | maps/* | décor | pluie, neige, braises, poudre | GARDÉ (non touché) |

## Vérifié
- Assemblage `--depuis-morceaux` OK, `node --check` du grand script OK. index.html et sw.js ne sont pas commités.
- Banc `outils/banc-particules/particules.cjs` : un Chrome muet (sfx/mus/vox coupés), iPhone 13 Pro émulé, `?tel=1`, verrou pris puis rendu, Chrome fermé. 1 800 pas de 33 ms (60 s), nitro tenue, louvoiement, saut toutes les 2 s, tonneau en vol. Deux fois : rendu net, puis `?plus=particules`.

| 60 s, nuages | couché net | couché avant | debout net | debout avant |
|---|---|---|---|---|
| vols / poses | 10 / 10 | 10 / 10 | 10 / 10 | 10 / 10 |
| naissances | 454 | 16 681 | 807 | 34 045 |
| réserves allumées en moyenne (appels de dessin) | 0,24 | 4,26 | 0,41 | 5,58 |
| erreurs | 0 | 0 | 0 | 0 |

- Ce qui naît encore avec le rendu net : `sparkGold` (pièces), `sparkBlue` et `juicePool` (fruits, voir « à trancher »). Fumée, flammes, braises et gouttes de la caisse : **0**.
- Gain : environ 4 à 5 appels de dessin de moins par image en course, ~16 000 à 33 000 particules de moins par minute (écriture + envoi au GPU), et plus aucun mesh neuf pour la tôle.
- Photos dans `passation/qualite/photos/particules/` (`net-*` / `avant-*`, couché et debout) : nitro, louvoie, vol, figure, pose. Chiffres dans `rapport-couche.json` / `rapport-debout.json`.

## Non vérifié
- Rien sur un vrai téléphone, pas de build.
- Pas de photo de dérapage chargé ni de ramassage de pièce image par image. Pour les pièces : `ramassage.js` n'a pas changé et la gerbe naît toujours (sparkGold > 0 sur le banc net).
- Les maps autres que les nuages, le demi-tour, la comète, Atchoum et le braquage n'ont été vus qu'en lisant le code.

## À trancher par Sacha (laissés tels quels)
1. **Le ramassage des FRUITS** : gerbe d'or/bleue + jus (`juiceSplash`) à la caisse. Ce ne sont pas des pièces : on coupe ?
2. **Les ailes achetées** (`voitures/ailes.js`, essaims de vapeur blanche, braises, étincelles en vol) : objets achetés comme les traînées, mais ce sont des « particules quand elle est dans les airs ».
3. **La petite flamme du moteur hors nitro** (feu de pixels en minuscule aux pots, `NFEU_MINI`) : flamme ou particule ? Ses étincelles, elles, sont coupées.
4. **Atchoum** (la caisse qui éternue du feu) : c'est sa personnalité, laissée.
5. **Le choc contre un mur sans mourir** : l'étoile et les éclats de paroi restent, seules les étincelles sont coupées.
6. **Les pouvoirs ramassés, l'aura (fronde), les événements rares, les caisses cassées (zones), la seconde chance, la tirelire, le déblocage d'une caisse en course, la spirale du changement de caisse** : effets de récompense, pas de conduite. Laissés.
7. **L'orbite** (rentrée en feu autour de la caisse, `orbFxTick`) et **les bots** des autres caisses (`kit-lumiere.js`) : laissés.
