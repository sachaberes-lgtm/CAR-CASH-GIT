# JADE, LA ROUTE UNIQUE — DANS LE JEU (2026-11-17, vérification)

Écrit au fil de l'eau : chaque section dit ce qui est PROUVÉ (chiffres, commande) et ce qui ne l'est pas encore.

## 1. Gardes (OK)
`node outils/garde-demarrage.cjs` OK (21 scripts) · `sh garde-allege.sh` ✔ · `sh garde-charte.sh` OK · `node code/assembler.cjs --verifier` ✔ (346 morceaux).

## 2. Bugs trouvés et corrigés
1. **`jade-avatar.js`, `jadeAvTick` (×2) : `JADE_RU.uTime.value`** — un renommage de trop : `JADE_RU` est un booléen ; l'horloge est `JADE_U.uTime`.
   Effet : TypeError à chaque tick des pierres dès qu'une route a `pierres` (défaut ET `?sans=uniques&jade=avatar`). Corrigé : `JADE_U.uTime.value`.
2. **`jade-uniques.js`, la clé du plan** : `ruPlan('jade', g)` ne disait pas si les lacets étaient permis (`kv ≥ 1,6`), alors que le plan en dépend :
   une même graine à un autre palier reprenait un plan tiré sans lacets (le résultat dépendait de l'ordre des appels). Corrigé (`jadeUCle(g,kv)` = `g` ou `g:L`,
   repris depuis par le pilote).
3. **Banc : forcer dans le NOUVEAU plan** (ajout, `jade-uniques.js`) : `?jsceneu=porte,arche` met ces modules en tête de `U.ordre` (`?jscene=` repasse par l'ancien
   paquet) ; `?jouv=`, `?jcap=`, `?jrelief=` imposent l'ouverture, le cap, le relief. Sans ces paramètres : rien ne change (même `sig`, mêmes empreintes).

## 3. L'ancien tirage à l'identique (`?sans=uniques`) — PROUVÉ en Node
`outils/banc-jade/opt-empreinte.cjs` : option neuve `uniques=1` (charge AUSSI `route-uniques.js` + `jade-uniques.js`, `sans=uniques` dans le search) et `uniques=2`
(le nouveau tirage, sac figé `RU.fige` pour comparer à historique égal ; l'empreinte inclut alors `JADE.u`).

| | drapeau 1 (`jade=avatar`) p0 / p10 / p20 | drapeau 0 p0 / p10 / p20 |
|---|---|---|
| référence jadeopt.md | 00706b5c / 9bd4d6f6 / 40c4a39e | 77bb6d2f / 87511d1e / 8b358b27 |
| chemin d'avant (sans les fichiers neufs), sync | identiques | identiques |
| `uniques=1` (fichiers neufs chargés, `?sans=uniques`), sync | identiques | identiques |
| `uniques=1`, tranches | identiques | identiques |

Revérifié après les retouches du pilote (LC ×1,5, unicité stricte `ruDeja`/`ruRefait`, boucle `t7`) : toujours identiques (24 graines × 3 paliers).

## 4. Le nouveau tirage : tranches / mémo = d'un trait — PROUVÉ en Node
`opt-empreinte.cjs uniques=2` (24 graines × p0/p10/p20, sac figé) : sync = memo (72 essais gagnants rejoués) = tranches (une autre vallée générée entre deux
tranches) = tranches `jf=-1` (l'essai rend la main à CHAQUE étape : 9 320-10 541 tranches par palier). État final (après les retouches du pilote), graines 1-6 :
p0 8afaf5cd… p10 8600a0ba… p20 e35a12f2… dans les trois modes.
NON prouvé : le sac NON figé (mémoire `cashcarRU`) en tranches — le plan est mémorisé par graine dans `RU.P` au premier appel, donc les tranches suivantes le
reprennent ; mais une vallée générée ENTRE deux tranches appelle `ruMarque` (elle vieillit le sac) : sans effet sur le plan déjà gardé, pas mesuré.

## 5. Forçages en Node (`?jsceneu=`, `?jouv=`, `?jrelief=`, 6 graines × p0/p10/p20)
Chaque petit module forcé est bien en tête (18/18), chaque ouverture et chaque relief tenus (18/18) ; 0 exception, 0 conflit ; notes moyennes 0,71-1,16 (pire 4,6).

## 6. Coût de génération en Node (`uniques-stat.cjs n=100`, routes de suite)
| palier | défaut : essais · ms/route · note moy | `sans=uniques` | `sans=uniques&jade=avatar` |
|---|---|---|---|
| 0 | 5,5 · 72 · 1,06 | 10 · 100 · 3,40 | 10 · 137 · 4,73 |
| 10 | 5,0 · 75 · 1,08 | 10 · 125 · 4,91 | 10 · 197 · 5,25 |
| 20 | 4,7 · 119 · 0,85 | 10 · 284 · 7,34 | 10 · 335 · 7,38 |
Le nouveau tirage est MOINS cher à générer (moins d'essais : une note ≤ 0,6 arrête la boucle) ; longueur rendue / visée ×1,5 : 1,08-1,12 (soit 1,6-1,7 × la visée
d'avant ; l'ancien paquet : 1,49-2,43).

## 7. Dans le jeu — EN COURS
Banc : `outils/banc-routes/uniques/jade-jeu.cjs` (neuf). (résultats à venir)
