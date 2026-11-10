# Le studio : moteur, nitro, pneus

Page unique pour jouer, régler et montrer le son du moteur et du nitro de CASH CAR. Elle remplace, pour la démonstration, le labo expert
(`../moteur-vivant/labo.html`, une centaine de curseurs, gardé pour les réglages fins).

**Ouvrir** : servir `VERSION PRINCIPALE/` en HTTP (`python3 -m http.server 8138 --directory "VERSION PRINCIPALE"`) puis
`http://localhost:8138/atelier-son/generateur/index.html`. Ajouter `?muet=1` pour tout voir sans rien entendre (bancs, captures).
Les réglages vivent dans le lien (`#s=…`) : « Copier le lien de mes réglages » partage un moteur, un nitro, une musique et leurs curseurs.

## Ce qu'on y trouve
- **Cockpit** : compteur, Gaz / Nitro / Frein / Virage (souris, doigt ou clavier : espace, N, flèche bas, V), démo de 36 s, démarreur, calage, choc.
- **Console** : quatre tranches (moteur, nitro, pneus, musique), chacune avec un choix net et six ou sept réglages qui comptent. Les niveaux de départ sont ceux du jeu
  (moteur −7 dB, nitro −6 dB, pneus −13 dB sous la musique), calés par `calibration.json`.
- **Scène** : le spectrogramme en direct. Les repères `×1 … ×12` du bord droit sont les harmoniques du moteur ; le compteur « du nitro posé sur les harmoniques du moteur »
  refait en direct la mesure du banc (énergie 80 Hz à 3 kHz à ±3 % d'un multiple de la cadence d'allumage), moteur stable seulement.
- 8 moteurs (bûche, tisane, braise, chocolat, veillée, V8 croisé, V8 plat, 6 en ligne turbo) et 18 nitros en cinq familles : mécanique et flammes, à matière, flammes seules, braise, et les anciens réglages pour comparer.

## Le moteur de base et le mode mécanique
Le moteur de base est la **Bûche avec sa touche cyber** (halo dans la tonalité du morceau, notes à chaque marche de régime, coup de poing au gaz). Le bouton **Mécanique** de la tranche moteur
la dépouille : culbuteurs, claquement, détonation franche, échappement ouvert, pops plus présents. Mêmes huit moteurs dans les deux modes.

## Le nitro : mécanique, flamme, et l'appui
- **Mécanique et flammes** (le nitro de départ) : la voix mécanique de `nitro-matiere.js` (preset `meca`), calée sur la cadence d'allumage du moteur, plus les flammes de `nitro-fusee.js`
  (corps de flamme, langues, air chaud, chambre) sans leur note, assemblées par `nitro-hybride.js`. Trois réglages : brûleur, flambée, dragon.
- **Selon l'appui** : la gâchette est analogique. Curseur « Appui du nitro », glissé du doigt sur le pad (haut = fort, bas = doux) ou pression tactile quand l'appareil la donne.
  Un appui léger donne surtout le ronron mécanique ; un appui plein durcit la mécanique et ouvre la flamme (`mesure-pression.cjs` : brillance et aigu qui montent avec l'appui, niveau −13 dB à 25 %).
- **L'atelier du nitro** : nitro maintenu, gaz maintenu, régime fixe, couches avec solo et muet, réglages détaillés par famille, nitro seul avec les harmoniques du moteur.
- **L'agrément, mesuré** (`mesure-agrement.cjs`) : le 1er jet du nitro à matière était bien plus aigu que le moteur (centroïde 667 Hz contre 354 ; 6,7 % entre 2 et 6 kHz contre 0,1 %). Après le 4e tour : 463 Hz et 1 %.
  Règle : le nitro n'est jamais plus brillant que le moteur de plus de 1,5 fois.

## Pourquoi un nitro « à matière »
Un nitro en bruit filtré n'a ni hauteur ni rythme : l'oreille ne le range pas avec le moteur (« la tête par la fenêtre »). Le nitro à matière reçoit `f0`, la cadence
d'allumage du moteur (`tr/min × pitch ÷ 120 × cylindres`), à chaque bloc audio : son corps, sa râpe et son poing grave tombent sur les harmoniques du moteur.
Mesuré hors ligne (`../moteur-vivant/rendu-matiere.cjs`) : 75 % de l'énergie sur les harmoniques du moteur, contre 16 % pour la flamme d'hier et 54 % pour le moteur seul.

## Fichiers
| | |
|---|---|
| `index.html`, `studio.css`, `studio.js` | la page, son style, ses réglages et ses dessins |
| `calibration.json`, `calibrer.cjs` | niveaux mesurés (moteurs, nitros, pneus, dix musiques) ; `node calibrer.cjs` les refait (macOS : `afconvert`) |
| `../../assets/audio/moteur-vivant/worklet-studio.js` | UN seul processeur audio : moteur + nitro + pneus, trois sorties |
| `../../assets/audio/moteur-vivant/nitro-matiere.js` | le nitro à matière (presets matière, plus, chaude, enfer) |
| `../../assets/audio/moteur-vivant/nitro-braise.js` | le nitro braise (presets foyer, forge, gouffre, noël) |
| `../../assets/audio/moteur-vivant/pneus-doux.js` | les pneus |
| `../../assets/audio/moteur-vivant/nitro-fusee.js` | les flammes (travail de la session `son-moteur`, copié tel quel) : six nitros « Flammes seules » et la flamme du hybride |
| `../../assets/audio/moteur-vivant/nitro-hybride.js` | le nitro mécanique + flamme |
| `mesure-agrement.cjs`, `mesure-pression.cjs` | brillance, aigu, acuité, rugosité ; caractère selon l'appui |

Le jeu lui-même n'est pas touché : rien ici n'est branché dans `code/`.
