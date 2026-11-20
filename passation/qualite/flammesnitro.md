# Lot « flammesnitro » — le feu du nitro en figure (19/11)

Branche `qa/flammesnitro` (worktree clairsemé `~/cash-car/lots-nuit/flammesnitro`), depuis `origin/qualite-appareil` fc028a62b.
Interrupteur : `?sans=flammesnitro` = exactement l'avant. Crochet : `dbgFlamme('figure',0|1)`.

## La demande
Sacha, 19/11 : « retravaille le rendu des flammes du nitro, notamment quand on fait des figures dans les airs, ça rend bizarre ».
Le 18/11 : « les traînées, quand on est dans les airs et qu'on fait des figures, elles s'affichent bizarrement, ça fait un peu flou ;
la traînée de nitro, les sortes d'étincelles derrière ».
Pas de travail antérieur trouvé (ni `passation/TRAINEES-VOITURES.md` ni banc « trainees voiture par voiture » sur origin) : parti de zéro.

## Ce qui était « bizarre » (vu au banc, images dans le dossier des planches)
Ce que Sacha appelle « les sortes d'étincelles derrière », c'est le FEU DE PIXELS du nitro (`NFEU`, voitures/nitro-feu.js) : des cubes
qui sortent des pots, étirés le long du jet. Deux défauts, tous deux EN VOL seulement :
1. **Le feu « détaché » (15/10)** : en vol, chaque cube gardait l'assiette de la caisse à l'instant de sa naissance. Pendant une figure
   la caisse tourne d'un demi-tour pendant la vie d'un cube : les cubes partaient dans toutes les directions où le pot avait regardé.
   On voit (planches `c*-vrille`, `c*-tonneau`) un NUAGE de pavés orange autour de la caisse, une BARRE de feu horizontale qui traverse
   l'écran des deux côtés en vrille, et en salto une colonne de feu qui monte droit au-dessus de la caisse. Les cubes étaient en plus
   ÉTIRÉS le long de l'axe ACTUEL du pot, pas de celui de leur naissance : des plaques allongées dans tous les sens (le « flou »).
2. **La plume lisse des pots (JETS) et l'axe d'émission du feu (`JET_DIR`)** se couchaient vers la TÊTE de la traînée des feux arrière
   (« la flamme suit la ligne », v5). Au sol c'est voulu (virages). En figure, cette tête tourne autour de la caisse : la plume
   battait jusqu'à 70° hors de l'axe du pot, et le feu de pixels partait avec elle.
Pas vu de défaut sur les rubans des feux arrière eux-mêmes en vol (le lot « rubans en vol » du 14/11 les avait déjà traités) : pas touché.

## Ce qui a changé (2 morceaux)
- `code/voitures/nitro-feu.js` — `FNIT`, `NFEU_VOL` : en vol, plus de feu détaché. Le feu sort du pot et suit la caisse dans toutes ses
  rotations ; en vieillissant, chaque cube se couche dans le VENT de la trajectoire (`vh`, l'arrière du vol) : une comète, la tête dans
  la bouche du pot, la queue derrière la trajectoire. L'étirement suit la même courbe. Passage sol ↔ vol glissé (`N.vf`, ~0,25 s, calé net à 0 et à 1).
  Au sol : même calcul qu'avant (vf = 0, les mêmes multiplications par 1).
- `code/moteur/boucle-4-effets.js` — en vol, la plume des pots reste dans l'axe du pot (plus couchée vers la tête de la traînée).
- `outils/banc-flammesnitro/` : le banc (`banc.cjs`) et la planche (`planche.py`).

## Preuves (exécutées)
Banc : `node outils/banc-flammesnitro/banc.cjs --out <dossier> --cars 4,2,1,11 --tag apres` (+ `--q sans=flammesnitro --tag avant`),
Chrome sans fenêtre et muet, 844×390, UA iPhone, `?tel=1&appareil=iPhone14,2`, nuages midi, nitro tenue, pilote auto, saut (imp 44),
figure à la 3e image de vol (vrille = `toupie`, `tonneau`, `salto`), une image toutes les 2 images de jeu (dbgStep 33 ms, rAF coupé).
Caisses : LÉONIE (4, basse), LE CAÏD (2, haute), ELDORADO (1, longue 5,7 m), COMÈTE (11, aileron).
- **Planches avant/après** (sol, saut droit, vrille, tonneau, salto × 4 caisses) : HORS dépôt, voir le chemin donné dans le compte rendu.
  Après : le feu reste une flamme qui sort des pots dans toutes les figures ; plus de nuage de pavés, plus de barre en travers en vrille,
  plus de colonne au-dessus de la caisse en salto. Au sol : même allure (rangées `sol` avant/après).
- **Appels de dessin** (rendu enveloppé, somme par image de jeu, en vol) : 146-157 avant, 146-154 après sur les mêmes scènes ;
  au sol 129-147 des deux côtés (les écarts suivent la longueur du vol et le décor, pas le lot). Aucun maillage ajouté.
- **Temps JS du feu** (`nfeuPas`, par image, sur les films) : 0,08-0,31 ms avant, 0,08-0,22 ms après — le bruit d'une passe à l'autre
  (deux passes du même code au sol : 0,09 et 0,14) est plus grand que l'écart. D'où la mesure A/B DANS LA MÊME IMAGE (`--micro 1`) :
  en plein vol, 5 images après la figure, l'état du feu gardé, `nfeuPas` rejoué 200 fois depuis cet état, avant puis après, cinq fois
  chacun (150-225 cubes vivants). Rondes stabilisées (les 3 dernières), µs par appel, avant → après :
  CAÏD salto 65 → 61 · vrille 42 → 36 · tonneau 44 → 42 ; COMÈTE salto 52 → 47 · vrille 52 → 50 · tonneau 49 → 51. Égal ou plus bas.
  (Une première version glissait sol ↔ vol sans fin : pendant ~1 s de vol les deux calculs tournaient, +25 % ; corrigée en calant
  `N.vf` net à 0 et à 1, puis remesurée — ce sont les chiffres ci-dessus.)
- **Course complète** (COMÈTE, `?tel=1`, nitro tenue, un saut toutes les 4 s, une figure au hasard par vol) : 9 vols, 7 figures,
  fin de course par chute dans le vide à l'image 2205 ; 0 exception, `__loopErr`/`__banqErr` nuls, `dbgErreurs` sans panne.
  Refaite après le dernier réglage (vf calé) : 8 vols, 6 figures, chute dans le vide à l'image 1995, 0 exception, `__loopErr`/`__banqErr`
  nuls ; `dbgErreurs` : deux « gel » du pilote hors boucle (max 116 ms, boucle 3,3 ms : le Mac partagé), aucune panne.
- Gardes : `node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh` : OK.

## Où sont les planches
Hors dépôt (scratchpad de la session, effacé au redémarrage du Mac) : `planches/c<caisse>-<scène>.jpg` (rangée du haut = avant,
rangée du bas = après ; 4 = LÉONIE, 2 = LE CAÏD, 1 = ELDORADO, 11 = COMÈTE) et `planches/final-c2.jpg` (après le dernier réglage).
Pour les refaire : le banc (≈ 35 s par scène) puis `PL_N=7 PL_DE=6 PL_PAS=4 PL_L=360 python3 outils/banc-flammesnitro/planche.py <dossier> <sortie.jpg> avant-c2-vrille apres-c2-vrille`.

## Non prouvé / pas fait
- Rien sur le vrai iPhone (consigne : ne pas toucher au téléphone). À regarder en figure dans le prochain build.
- Les vols au banc ne sont pas rejouables à l'identique (le hasard et l'horloge varient même avec `--graine`) : les planches avant/après
  montrent des vols du même scénario, pas la même image au pixel près.
- Le flou radial de vitesse de l'image (passe finale, nitro) n'est pas touché : il est commun à toute la course.
