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
- 8 moteurs (bûche, tisane, braise, chocolat, veillée, V8 croisé, V8 plat, 6 en ligne turbo) et 8 nitros (4 « à matière », 3 « braise » à corps calé sur le moteur, la « flamme d'hier » en bruit pour comparer).

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
| `../../assets/audio/moteur-vivant/nitro-fusee.js` | instantané du travail « flammes sous pression » (en cours, pas encore dans le studio) |

Le jeu lui-même n'est pas touché : rien ici n'est branché dans `code/`.
