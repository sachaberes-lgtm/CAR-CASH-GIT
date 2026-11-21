# Rejugement du lot F (le décor du 3/11), flou réparé

## Tour 1 (21/11/2026, 15:02-15:11), contrôleur adverse

**Verdict : FUSIONNABLE**, avec trois défauts mineurs.
Cette fois, le décor se voit au téléphone : sur 2 graines sur 3, il y a nettement plus de tours, des murs des deux côtés et des tours pendues au-dessus de la route. Le coût reste sous +10 % et les identités tiennent.

**La nuit noire (`?plus=villenoire`) : à garder en option, pas par défaut.**
- Elle rapproche le bas de l'image du 3/11 : la route redevient noire.
- Elle assombrit aussi le haut, sur une graine sur trois.
- C'est exactement la retouche que Sacha avait fait retirer le 06/11 (« sombres et ternes »). C'est donc à lui de trancher, planche à l'appui.

Je n'ai pas touché au code du lot. Mes bancs sont dans le scratchpad, sous `lot-f/rejuge/` :
- `page-r.cjs` = `page-c.cjs` des tours précédents, plus la capture des avertissements de la console et des réglages du flou ;
- `passe.sh` : ports 8961, 8963 et 9961, profils `cc-banc-rjf-*`, variable `SEUL=` pour ne refaire qu'une colonne ;
- `planche.py`, `stats.py`, `comptes.cjs`, et les photos dans `chrome/<passe>/`.

Comment les colonnes sont faites :
- « Avant » = le lot avec `?sans=villedecor`, dans le même worktree, sur la même graine. « Après » = le lot. « Nuit » = le lot avec `&plus=villenoire`.
- Le 3/11 = l'archive `aa160d07f` (`scratchpad/ancienne`). Elle roule sa propre route.
- Graines neuves : 4103 et 4119 en 844×390, 4111 en 390×844. Toutes en `?tel=1`, carte ville, teinte violette.

### 1. Le flou réparé est bien posé dans le vrai jeu (sans injection)
- Dans les 12 courses du lot, le programme du flou (`dbgCielObj().aces`) contient `uniform vec4 uFv` et `float sp=uSpeed…`.
  - Réglages lus en course : `uFv = [0.26, 2, 0.8, 0.25]`, `dbgFlou() = {v:true, s:0.234}`, palier 2.
  - Le flou V2 est donc actif au téléphone. Aux tours 1 et 2, il ne l'était pas.
- À l'image, les tours ne sont plus des traînées : on lit les fenêtres sur les trois planches.
  - Netteté du haut de l'image : 6,1 à 7,8 aujourd'hui, contre 2,4 à 3,3 aux tours précédents.
  - Pour le 3/11 : 6,5 à 8,3.
- Console : **0 erreur, 0 avertissement** dans les courses du lot, avant comme après, shaders compris. Le 3/11 seul répète l'avertissement three « flatShading », qui est le sien.
- Aucune mort, aucune erreur de banc.

### 2. L'image (planches regardées une à une)
Les planches sont dans `planches/` :
- `rejuge1-t844-g4103-jeu.jpg`
- `rejuge1-t844-g4119-jeu.jpg`
- `rejuge1-t390-g4111-jeu.jpg`

Chaque planche a 4 colonnes et 6 photos, prises en course lancée, une toutes les 4 s, HUD caché, avec `dbgAuto(1,0,{nit:0})`.

Ce que je vois :
- **844, graine 4119 : le lot se voit.** Après a des murs de tours à fenêtres pleins des deux côtés (photos 1, 2, 3, 4 et 6), là où avant montre du ciel et des tours éparses. On roule dans une rue de tours, ce qui rapproche du 3/11.
- **390×844, graine 4111 : le lot se voit nettement.** Après a une forêt de tours au-dessus de la route sur les 6 photos, contre du ciel et quelques tours avant. C'est l'« enclavé » demandé. Photos 5 et 6 : des tours pendues dont on voit le dessous.
- **844, graine 4103 : à peine.** Seule la photo 1 a nettement plus de tours. Les photos 2 à 6 sont presque identiques à avant.
- **La voiture reste lisible partout.** Je n'ai vu aucune tour dans la route et aucun trou.
- **La nuit noire.** La route devient noire et mouillée, comme au 3/11. Les tours restent colorées, mais l'ensemble s'assombrit.

Mesures (`stats.py`, luma de 0 à 255 ; « haut » = 45 % du haut de l'image, « bas » = 40 % du bas) :

| | luma haut | luma bas | noirs du bas | netteté du haut |
|---|---|---|---|---|
| 844 g4103 : 3/11 / avant / après / nuit | 35 / 46 / 46 / **31** | 38 / 70 / 62 / 30 | 70 / 23 / 16 / 81 % | 8,3 / 6,1 / 6,5 / 5,8 |
| 844 g4119 : 3/11 / avant / après / nuit | 31 / 45 / 51 / 40 | 32 / 63 / 61 / 34 | 77 / 29 / 28 / 74 % | 6,5 / 6,4 / **7,8** / 7,3 |
| 390 g4111 : 3/11 / avant / après / nuit | 37 / 50 / 52 / 52 | 52 / 78 / 79 / 64 | 51 / 20 / 18 / 40 % | 7,9 / 5,3 / **6,9** / 6,9 |

Lecture des mesures :
- Le décor monte la netteté du haut (plus de façades à fenêtres) sur les deux graines où il se voit.
- La nuit noire ramène le bas sur le 3/11. Avec la graine 4103, elle fait aussi tomber le haut de 46 à 31, plus sombre encore que le 3/11 (35).

### 3. Coût au téléphone (`?tel=1`, renderer.info, une image auditée par photo, 6 points par course)

| | avant | après | écart |
|---|---|---|---|
| 844 g4103 : appels moyen et max / triangles moyen et max | 119 et 138 / 326 k et 360 k | 116 et 130 / 322 k et 356 k | −2 % / −1 % |
| 844 g4119 | 111 et 123 / 294 k et 342 k | 117 et 132 / 304 k et 359 k | +5 % / +3 % (max +5 %) |
| 390 g4111 | 112 et 132 / 313 k et 387 k | 117 et 132 / 338 k et 396 k | +4 % / **+8 %** (max +2 %) |

- Bâti seul : 34 → 32 k, 31 → 36 k et 32 → 42 k triangles, pour +0 à 2 appels.
- Programmes : 154 → 154 sur toute la course, dans chaque course. **0 programme compilé en course.**
- Nuit noire : même coût qu'après.
- **Plafond 124 appels / 311 k triangles : déjà dépassé AVANT le lot**, en moyenne sur 2 graines sur 3 et en pointe partout. Le lot reste sous +10 %, mais en 390 il porte la moyenne de 313 à 338 k.

### 4. Identités et gardes
- `empreinte.cjs graines=1-12` :
  - ville 77f22cbf4933 / 7aec17e77c92 ✔ ;
  - crypto 5447610bd8f2 / eae97981f833 ✔ ;
  - nuages 469d52aff855 / 2e1661d8fe93 ✔ ;
  - espace 9c99fae61d38 / ea2d9e750351 ✔.
  - La vitrée ne tourne pas dans ce banc (`VIT_SOL is not defined`), comme aux tours précédents.
- `garde-demarrage` OK (21 scripts), `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔ (350 morceaux, 13 222 733 octets).
- Diff : seulement `jade-balade.js`, `ville-etages.js`, `equilibre-maps.js` et `index.html`. Ni `sw.js` ni aucun fichier réservé.

### Défauts
1. **Mineur : le décor ne se voit pas sur toutes les routes.** Il est net sur les graines 4119 et 4111, à peine visible sur la 4103 (seulement la photo 1).
2. **Mineur, à montrer à Sacha : le dessous plat des tours pendues.** En 390, graine 4111, photos 5 et 6, ce dessous apparaît comme un grand aplat violet à bords nets, de la couleur du ciel. Ça peut se lire comme le « transparent » du 3/11, ou comme un trou. Ce n'est ni dans la route ni sur la voiture.
3. **Mineur : le plafond du téléphone est dépassé** (moyenne et pointes de triangles), mais il l'est **déjà** avant le lot. Le lot ajoute jusqu'à +8 % de triangles en moyenne en 390.
4. **Piège du banc, pas du lot.** `meteo=pluie`, que les tours précédents utilisaient, n'existe plus pour la carte ville. Elle n'a que `orage`, plus les heures du jour du lot J. Ma première course « nuit » (844, graine 4103) a donc tiré `cjMatin` (le jour) et a été refaite en `meteo=orage`. Toutes les colonnes gardées sont en `villeOrage` (vérifié dans `dbgClassique().niveau`).

### Pas vérifié
- Les abscisses exactes : la photo 1 tombe au même endroit (s = 129), mais ensuite la voiture du lot roule un peu moins vite. Les photos 2 à 6 sont décalées de 0 à 85 m, donc la comparaison du coût n'est pas point par point.
- L'iPhone réel, la tranche du bâti dans le jeu (pointes sous ALLEGE en Node, signalées aux tours 1 et 2), les sauts joués et le nitro, les paliers 10 et 20 en Chrome.
- L'ordinateur (`poste=max`) : non refait à ce tour.
- La vitrée et Crypto City de jour à l'image, que le banc ne tire pas.
- Pourquoi `&plus=villenoire` changeait le tirage de la météo avec `meteo=pluie` (le hasard du tirage de la météo n'est sans doute pas lié à la graine de la piste) : non cherché.

Nettoyage : verrou « ville-cyber-f » pris et rendu à chaque passe (place 1, 15:02-15:05, puis jusqu'à 15:10:32). Profils `cc-banc-rjf-*` supprimés, aucun Chrome à moi restant, serveurs arrêtés.
