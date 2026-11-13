# JADE · NUIT — « la nuit de jade » (13/11, branche `fin/jade-nuit`)

Demande de Sacha (iPhone 13 Pro, tête de main) : « la map Jade nuit est assez moche », puis « couleurs ternes, mélangé au fait que la barrière de rendu est très grise ».

## Diagnostic (photos du chemin iPhone, 844 × 390 et 390 × 844, palier 2 et palier 0)
1. **Une seule couleur, presque neutre** : zénith, horizon et brume entre .10 et .16 en gris-vert (jdZ → jdH, fog [.13,.155,.16]). Chroma moyenne de l'image 23-43.
2. **La barrière grise** : les pics en 3D se fondent dans une brume grise PLUS CLAIRE que le ciel peint derrière eux : des fantômes gris pâle devant un ciel sombre.
3. **Du noir sous l'horizon** : l'abîme (mer de nuages) était multiplié par `jdK.z = .32`, le réglage de l'ancien fleuve. Résultat : une bande pâle (l'horizon) posée sur du noir ; en vol, jusqu'à 72-76 % de noirs dans le bas de l'image.
4. **La lune** : un disque lavande codé en dur, sans halo, sans rapport avec la lumière de la scène.
5. **Les pics** : éclairés par un ciel et un remplissage gris-bleu, ils perdaient leur vert ; la route, grise sur gris.

## Ce qui a changé (rien que cette variante ; `?jadenuit=0` = avant, au bit près)
`code/rendu/lumiere-design.js` (fin du fichier, posé après l'équilibre et le plan de feu), `BIOMES.jadeNuit` :

| champ | avant | après |
|---|---|---|
| jdZ (zénith) | .100 .113 .116 | .018 .052 .098 |
| jdL | .108 .126 .131 | .030 .086 .130 |
| jdM | .118 .140 .146 | .045 .135 .150 |
| jdH (horizon) | .130 .155 .160 | .065 .19 .18 |
| jdB (brume des pieds, abîme) | .15 .19 .20 | .07 .19 .195 |
| jdR | .09 .10 .10 | .03 .09 .09 |
| jdS (lune) | .55 .78 .74 | 1 .90 .68 |
| jdK | .9 0 .32 1 | .9 0 .8 1 |
| fog / fogCj / fogIn | .13 .155 .16 / .17 .21 .22 / .15 .18 .19 | .047 .142 .148 / .08 .22 .21 / .06 .17 .17 |
| volSky / volGnd | .10 .15 .19 / .04 .06 .07 | .06 .17 .18 / .02 .06 .06 |
| hemiS / hemiG | .16 .28 .34 / .04 .08 .09 | .14 .36 .40 / .03 .09 .08 |
| sunC, sunI (la lune) | .6 .76 .92, .55 | .80 .90 .92, .75 |
| fillC / kickC | .24 .42 .5 / .4 .6 .7 | .16 .50 .44 / .30 .85 .65 |
| rtK (route) | .85 | .78 |
| env (reflets) | gris-bleu | bleu nuit → jade |

`code/rendu/scene-ciel.js` (ciel de Jade, une ligne) : le disque de nuit prend `jdS` (ivoire doré) et un halo large ; le jour (`uJdK.w = 0`) le calcul est le même qu'avant.

Principe : la brume des pics (fog) = la teinte du bas du ciel (jdM ≈ jdB) : un pic qui s'efface s'efface dans le ciel. L'abîme est rendu dans cette même teinte : plus de noir (règle « le fond à la couleur de la brume »).

Coût : des valeurs d'ambiance et une ligne de shader de même poids. Zéro passe, zéro texture, zéro appel de dessin en plus.

## Mesures (parcours.py, paysage, palier 2)
Chroma moyenne 29-43 → 45-56 ; noirs du bas en vol 25 % → 6 % (palier 0 : 76 % → 5 %) ; L* moyen inchangé (≈ 15-25 : c'est toujours une nuit).

## Photos (`passation/finition/photos/jade-nuit/`)
- `planche-paysage-1.jpg`, `planche-paysage-2.jpg` : avant | après, 300 m, 1500, 3000, puis 5000, 7000 (lune), vol à 4200.
- `planche-portrait-1.jpg`, `planche-portrait-2.jpg` : idem en 390 × 844.
- `planche-palier0-paysage.jpg` : le cran bas du téléphone (distance de vue réduite), 1500, 5000, 7000, vol.
- `midi-reference.jpg` : Jade de midi, inchangée.
Les cadrages avant/après ne sont pas au pixel près (la route est tirée au hasard à chaque chargement) : mêmes abscisses, mêmes réglages.

## Outils
- `outils/banc-lumiere/parcours.py` : une map à plusieurs abscisses, chemin iPhone, essais d'ambiance sur image figée (`POS`, `VOL`, `PALIER`, `PARAMS`, `NOM`).
- `outils/banc-lumiere/avant-apres.py` : la planche.
- `photos.py` : `PALIER=0|1|2` (défaut 2).

## Vérifié / pas vérifié
- Vérifié au banc (Chrome sans tête, chemin TEL_NATIF + ALLEGE) : nuit après, nuit `?jadenuit=0`, midi ; paysage et portrait ; palier 2 et 0 ; `dbgErreurs` ne contient que gels/serpent/attente (machine du banc à charge 200+), aucune panne.
- Pas vérifié : le vrai téléphone (écran OLED : le bleu du zénith et le jade de l'horizon y sortent plus saturés qu'ici) ; le soir, la pluie et l'orage de Jade n'ont pas été rephotographiés (aucune valeur à eux n'est touchée ; l'orage a `jdK.w = 0`, la ligne du ciel lui rend le calcul d'avant) ; `toutes.mjs` non lancé (aucune géométrie ni route touchée).
- `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS dans le commit : à réassembler (`node code/assembler.cjs --depuis-morceaux`) et numéroter par l'intégrateur.

## L'autre direction (non livrée)
Garder l'encre-vert d'avant et ne corriger que la barrière et le noir (fog = ciel, jdK.z) : plus sobre, mais les couleurs restaient ternes.
