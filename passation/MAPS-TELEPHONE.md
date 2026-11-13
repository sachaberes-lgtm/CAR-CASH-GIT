# LES NOUVELLES MAPS SUR TÉLÉPHONE — la branche commune (2026-11-13, soir)

Sacha, à mesure que les sessions de routes publiaient : « fais l'optimisation de la nouvelle map de la même manière qu'elle est actuellement sur mobile,
mâche le travail pour la session d'optimisation » (Jade, puis nuages, canyon, grotte, orbite) ; puis « mets-toi à jour avec la dernière optimisation ».

**Branche** : `maps-tel-2026-11-13` = `origin/main` v1587 + les passes Jade et nuages (qui étaient sur `jade-alleluia-tel-2026-11-13` et
`nuages-parcours-tel-2026-11-13` : ces deux branches sont maintenant EN CONFLIT avec `main`, à cause de « la tranche moyenne à chaud » du chantier iOS —
**n'intégrer que celle-ci**) + la grotte. Le cache n'est pas monté ici. **Rien n'est mesuré sur un iPhone** : banc Chrome en édition téléphone (`--tel=1`).

## Où en est chaque map
| Map | Script du tirage / de la route | Image (triangles dessinés, tél.) | Fait | Où |
|---|---|---|---|---|
| **Canyon V3** | 14 essais toujours joués : 160 ms (palier 0) à 330 ms (palier 20) ; avant le V3 ~70 ms | +25-30 % mais bas (≤ 555 k), bitume inchangé | tirage 66 / 74 / 122 ms, 72 routes identiques | **PUBLIÉ, `main` v1587** (`?sans=cyelag` = avant) |
| **Jade Alléluia** | tirage 133-202 ms d'un trait pendant la course d'avant | médiane 500 k, pointe 857 k (ancienne : 455 / 770) | tirage en 40 tranches ≤ 20 ms, même route ; règle de la route → 440 / 736 | ici — `JADE-TELEPHONE.md` |
| **Nuages en parcours** | tirage 14-33 ms : rien à faire | bitume fin 144-192 k en pointe (avant 96-144) | règle de la route → 96 k | ici — `NUAGES-TELEPHONE.md` |
| **Grotte (v1585)** | route 147 ms contre 153 avant ; tirage 60-100 ms contre 30-78 | médiane 409 k contre 312 avant ; jusqu'à 6 tranches fines (288 k) | règle de la route → médiane 317 k, pointe ~440 k (sans : 609), bitume 96 k | ici |
| **Orbite v6** | route 118 ms contre 143 avant ; tirage 34-48 ms inchangé | médiane 245-282 k contre 270-291 ; pointe ~450 k des deux côtés | rien : à parité | — |

## Ce que le chantier iOS a changé dans la méthode (PLAN-ULTIME, 13/11 18 h → 20 h 30)
- Le rendu n'est pas le problème de la grande vitesse ni de la chaleur (« inutile d'abîmer l'image ») : c'est **le coût TOTAL du script du pré-bâti de la map d'en face**,
  payé à chaque image (à ~2 000 km/h une map dure ~13 s). D'où l'ordre des contrôles pour une nouvelle map : (1) `node outils/banc-vitesse/route.cjs --n 4 --carte <map>`
  contre la version d'avant (`--jeu <dossier VERSION PRINCIPALE d'un worktree d'avant>`), (2) le nombre d'essais du tirage et ce que coûte chacun, (3) seulement ensuite les triangles.
- Le canyon V3 était le cas grave (×3 à ×5 sur le tirage, pire au palier 20). Les trois raccourcis qui ont servi sont réutilisables partout où un tirage garde « le meilleur de N » :
  les termes de la note qui ne coûtent rien d'abord, et l'essai abandonné dès qu'ils valent la meilleure note (élagage exact tant que chaque terme est ≥ 0) ;
  `Math.hypot` seulement après un test sur le carré ; une « plus longue tenue » qui saute les départs incapables de battre la meilleure.
- **Pas fait, à faire si la boîte de vol le demande** : le même élagage dans `jadeAGenG` (10 essais entiers, 130-200 ms au total — le tirage est en tranches, son coût total n'a pas baissé).

## La tranche moyenne par l'abscisse (`piste-prebati.js`, `pisteMoysOn()`)
Sur téléphone (`PISTE_MOY`, donc `ALLEGE`), une tranche de route tout entière à plus de 260 m de route devant la caisse ou 70 m derrière passe en moyenne (une rangée sur 4 m).
Elle joue dans Jade Alléluia, les nuages en parcours et la grotte ; `?pistemoys=0` = avant ; `dbgPiste().parAbscisse`. Rails et nappes néon ne la suivent qu'à chaud
(`E.chaud`, la décision du chantier iOS est gardée telle quelle). Canyon et orbite : mesuré, le bitume n'y dépasse pas, la règle n'y est pas branchée.
Photo de la route moyenne vue de 18 m (Jade, la spirale) : identique à l'œil.

## Vérifié au banc (cette branche, après fusion de main v1587)
- Assembleur d'accord, 4 gardes OK, aucun nouveau nom non déclaré. (`hudReveil` déclarée deux fois : déjà sur `main`, pas de cette passe.)
- Courses au pilote, édition téléphone : canyon 45 s × 2 graines, grotte 40 s (graine 1) : vivant, 0 erreur ; ordinateur : règle inactive (`parAbscisse: null`).
  Grotte graine 3 : mort « vide » à 319 m en 6 s — le piège connu du banc (la caisse roule sans pilote pendant `--attente` > 4), pas la route.
- NON refait sur cette branche après les fusions : les courses de Jade et des nuages (faites sur leurs branches d'origine), une course AVEC photos.

## À faire sur le téléphone, dans l'ordre
1. Canyon (déjà en ligne) : à grande vitesse (code « test », palier 15+), la map d'AVANT un canyon — le script par image doit baisser (boîte de vol, colonne travail).
2. Intégrer cette branche (cache +1, `assembler --depuis-morceaux`, gardes, course avec photos), build, puis A/B `pistemoys=0` dans la grotte, Jade et les nuages.
3. Jade : le gel du tirage pendant la map d'avant (image longue « reconstruction ») doit avoir disparu.
4. Ce que le banc ne voit pas : le remplissage (nappes des nuages, brume de la grotte), la mémoire sur une séance longue (canyon : route de 14-15 km, 50 tranches).

Bancs : `outils/banc-maps/audits/` (`*-tel-champ.js` : triangles en 14 points ; `*-tel-tirage.js` : temps et empreintes du tirage ; `grotte-tel-champ.js` attend le vrai départ).
