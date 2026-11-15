# LOT « GELS » (2026-11-15) — branche qa/mouchard

## Ce que disent les fichiers du 13 Pro (build 117)
`python3 outils/banc-perf/analyse-vol.py passation/qualite/vol-1115-1546.json` (table « LES GELS : QUI », en fin de sortie).

- Les 15 courses d'avant : 0 à 20 secondes (sur 100 à 350) avec une image > 120 ms, travail médian 3-9 ms.
- La dernière (15 h 41, 270 s) : **135 secondes sur 269** avec une image > 120 ms, travail médian 13,6 ms.
- 0-38 s : propre (travail moyen 6-8 ms). 38-41 s : passage ville → nuages, pré-bâti 17-30 ms par image, deux images à 160-174 ms de travail.
  À partir de 43 s et jusqu'à la fin, sur toutes les maps : environ un gel par seconde.
- Point important dans `L` : les gels « hors boucle » (150-200 ms entre deux images, 15-25 ms de travail) **suivent presque toujours une image
  qui a beaucoup travaillé** (74-118 ms dans loop, une ou deux fois par seconde : 49,5 · 50,1 · 51,4 · 51,7 · 52,1 · 52,3 · 53 · 53,8 · 54,8 · 55,6 · 55,8 · 56,8 · 60 · 61,4 · 63,9 · 64,1 s).
  La durée d'une image se compte d'horodatage rAF à horodatage rAF : le travail de l'image N retarde l'image N+1, qui a l'air d'un gel « hors boucle ».
  Sur 49-55 s le travail MOYEN monte à 25-40 ms par image (≈ 400-500 ms de JS par seconde). Le gel est donc surtout DANS loop(), par paquets.
  La boîte de vol ne dit pas quelle tranche : c'est le but du mouchard.
- La puce bouge peu (vrai coût 15-35 ms), le pré-bâti retombe à 0,1-0,2 ms après 46 s : ni le rendu ni le pré-bâti ne portent ces paquets.
- Cran QL 3 → 5 à 42-43 s : les courses d'avant ont tourné au cran 5 sans gel, ce n'est pas lui.
- Retour d'arrière-plan (82 s) + pivot à 0-2 s : les 38 premières secondes sont propres. Un retour de 38 s à 15 h 31 (course de 14 h 31) n'a rien laissé.
- Journal : rien d'anormal pendant la course (pas de « panne », le veilleur du son n'a rien rattrapé avant la pause à 58 s ; « horloge arrêtée »
  seulement APRÈS la course, à 15 h 46). Géométries 889 à la fin (normal), programmes 194 (174 jusqu'à la partie 4 de la session : +20 sur la séance),
  tas inconnu sur iOS. Session longue : 7e partie, 1 516 s de vue web.

- JS par seconde (images × travail moyen) : courses d'avant ≈ 210-230 ms/s du début à la fin ; la dernière 228 ms/s avant 38 s, **392 ms/s après 43 s**
  (+165 ms/s, médian 368, pire 642). C'est l'équivalent d'une tâche de ~100-150 ms par seconde ajoutée dans la boucle, qui ne part plus.


## Le banc (outils/banc-perf/gels.py, Chrome muet format iPhone 13 Pro, `?tel=1&appareil=iPhone14,2&perfrec=2`, processeur ×5)
Modes : `verif` (gel provoqué) · `temoin` (course, pause, reprise, portails) · `pivot` (deux pivots en course) · `cache` (caché 80 s, page vivante)
· `gele` (page GELÉE 80 s sans événement) · `scenario` (caché + gelé 80 s + deux pivots). Résultats : outils/banc-perf/mesures/gels-*.json.

| mode | images de loop /s (médiane) | gels > 80 ms en ~160 s | coupable |
|---|---|---|---|
| témoin | 49 | 14 | boucle d'avant · après rendu |
| pivot | 48 | 19 | idem |
| cache 80 s | 41 | 18 | idem |
| gele 80 s | 14 | 240 | boucle d'avant · rendu (toutes les tranches ×3-4) |
| scénario | 13 | 240 | idem |

- Minuteries, intervalles (16 → 16), écouteurs (379 → 380), images de loop = images d'écran : **aucune boucle ni minuterie en double**
  après un retour, un pivot ou un changement de map. Le pivot seul et le retour sans gel de page ne changent rien.
- La page GELÉE dégrade tout (×3-4 sur chaque tranche, appels et triangles inchangés, temps de la puce inchangé)… **mais c'est un piège du banc** :
  le même essai SANS bridage du processeur donne 5,0 → 6,3 ms de JS par image (+25 %, bruit de map compris), et un calcul pur ne ralentit pas
  après le gel. Le bridage ×5 de Chrome et le gel de page (`Page.setWebLifecycleState`) se combinent mal. Ne pas lire « gele/scenario » comme le téléphone.
- Donc le banc ne reproduit PAS le gel de Sacha. Rien n'est corrigé dans le jeu (rien de prouvé).

## Suspects, classés
1. **Ramasse-miettes / mémoire en fin de longue séance** (7e partie, 1 516 s de vue web, programmes 174 → 194) : le travail monte d'un coup après
   le rebâti de 39 s (grosse allocation) et ne redescend plus, par paquets de 75-118 ms DANS loop une à deux fois par seconde, sur toutes les maps.
   Cohérent, pas prouvé : iOS ne donne pas le tas. Le mouchard dira si les paquets tombent dans UNE tranche (code) ou PARTOUT (ramasse-miettes / bridage).
2. **Bridage du processeur par iOS** (batterie 20 → 15 %, économie d'énergie, thermique serious) : les 8 courses d'avant avaient le même état, sauf la
   batterie (25-35 %). Possible ; le mouchard le distingue (toutes les tranches gonflent d'un coup, les rappels hors boucle aussi).
3. **Un juge / gouverneur qui tourne une fois par seconde dans loop** (b1 : cadSaute → mobGouvTick, cadFin → prfJuge/posteJuge, bvSec) : rien vu au banc
   (b1 < 1 ms) ; le mouchard le verrait dans « b1 début » ou « après rendu ».
Écartés au banc ou dans le code : boucle rAF en double, minuteries ou écouteurs qui s'empilent au retour / au pivot, cran QL 5, pré-bâti après 46 s,
veilleur du son (aucune action pendant la course ; « horloge arrêtée » n'apparaît qu'après), écritures de sauvegarde (en course : au plus toutes les 120 s).
Son (code/son/* tenu par un autre agent) : rien de prouvé, aucun correctif à décrire. Le mouchard note l'état du contexte audio et « running mais horloge
arrêtée » par seconde : si le prochain vol les montre pendant les gels, ce sera le fil à tirer.

## Corrigé (prouvé au banc)
- Le mouchard lui-même : le guet du démarrage (page/debut-corps.html) REMET les setTimeout / requestAnimationFrame d'origine à sa fin ; une simple
  affectation était écrasée et la boucle échappait au mouchard après ~10 s. Accesseurs posés (ce qu'on y range passe SOUS l'enveloppe).

## Le mouchard des gels (build de mesure seulement : `?perfrec=2` ; `?sans=mouchard` le coupe ; éteint = rien d'enveloppé)
Fichiers : code/moteur/mouchard-gels.js (nouveau morceau, inscrit dans ORDRE.txt après interface/icones-fenetre.js), code/moteur/enregistreur-perf.js,
une ligne `if(MG.on)MG.ts[k]=performance.now();` en tête de boucle-2…6 et deux autour du rendu (boucle-6).
Il enveloppe setTimeout, setInterval, requestAnimationFrame, requestIdleCallback, addEventListener, les observateurs (Mutation, Resize, Intersection).
Dans chaque course de la boîte de vol :
- `G` : chaque intervalle > 80 ms À L'HORLOGE entre deux images calculées (240 au plus) = [t, intervalle, travail, boucle d'avant, cette boucle,
  hors boucle, rappels attribués, combien > 8 ms, le plus long (nom dans `GN`), sa durée, 8 tranches de l'image d'avant (b1…b6, rendu, après),
  8 de celle-ci, pré-bâti, minuteries, intervalles, contexte audio, s depuis le retour d'arrière-plan, s depuis le pivot, tas (Mo, -1 sur iOS),
  loop sautés, durée selon rAF]. L'intervalle se décompose : boucle d'avant + hors boucle + loop sautés.
  (L'horodatage rAF montre un blocage UNE IMAGE TROP TARD : c'est pourquoi le mouchard mesure à l'horloge.)
- `Q` : tous les rappels > 8 ms par nom : [nombre, ms, pire].
- `M` : par seconde, images de loop, autres rAF, ms de rappels hors boucle, minuteries, intervalles, écouteurs, contexte audio (+10 = horloge arrêtée), tas.
- `mg` / `mg1` : minuteries, intervalles, écouteurs, retour s, pivot s, durée du dernier arrière-plan, orientation, au départ et à la fin.
Coût : deux performance.now par rappel, aucune allocation par image (enveloppes gardées par fonction ; une ligne seulement pour un gel).
Vérifié : une minuterie qui bloque 120 ms (`dbgMouchard('gel',120)`) → 3/3 rangées sous « rappel T:mouchardGelExpres », et 19/19 sous « rappel I:mouchardGelIntervalle » (intervalle de 90 ms), code final.
Lecture : `python3 outils/banc-perf/analyse-vol.py <vol.json>` → « LES GELS : QUI » (et pour les vieux vols, sans mouchard : dans / hors boucle).

## Ce qu'il faut faire jouer à Sacha (build de mesure, perfrec=2)
Une longue séance comme celle du 15/11 : 6-8 parties d'affilée, sortir de l'app ~1 min puis revenir, tourner le téléphone, rejouer, et noter l'heure
d'un gel. Batterie basse si possible (< 20 %) et une séance sur secteur pour comparer. Puis `sh outils/banc-perf/lire-vol.sh` et analyse-vol.py.
