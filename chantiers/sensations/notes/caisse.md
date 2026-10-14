# Notes de l'agent `caisse` (passe SENSATIONS, 2026-10-14)

⚠ RIEN n'a été essayé en jeu (aucun navigateur) : relu, `verifie.sh caisse` = VERIF OK après chaque détail, c'est tout. Les doses sont à
juger au téléphone. Diff = 43 lignes AJOUTÉES, 0 réécrite, 3 commits sur la copie `wt/caisse` (base a57f9ef).
Une fonction neuve, `sensCaisse()` (entre `sensGlisse` et `driftTick`), état `SENS_CA` (objet de script, aucune allocation par image),
appelée une fois par image dans le bloc `mode==='drive'` de la boucle, juste après `driftTick(dt,drifte)` (`if(SENS)try{…}catch(e){}`).
Elle ne fait que LIRE `steer`, `lat`, `vA`, `hopY`, `driftEnCours`, `slipT`, `introD`, `ROAD_HALF`, `PARIS.sol`, `CARS[level]` ; elle
n'écrit que par `sensCoup`, `sensHap` et une gerbe `sparkGold`. Un trou de plus de 150 ms entre deux passages (vol, pause, mort,
replacement) remet son état à zéro sans rien jouer.

Signes : LUS, pas vus. `rT=steer*lacetMax…` → `yawR` a le signe de `steer` → `rollT=sign(aLat)*.26` aussi ; `sensCoup` fait
`rollV-=versLat` : `versLat=-sign(steer)` pousse donc DANS le roulis du virage (même convention que l'accroche de `glisse`).
L'affaissement du bord est `rollT-=sign(lat)*.15*pe9` : `versLat=+sign(lat)` penche vers le VIDE, `-sign(lat)` vers la route.

## Inventaire (ce qui EXISTE déjà — laissé tel quel)
- ROULIS DE VIRAGE : ressort (ω 14, amorti .55) vers `rollT` (6° petit virage → 15° plein braquage, +4° en drift) ; il dépasse déjà un
  peu de lui-même sur un gauche-droite. POWER-SLIDE visuel (`driftYaw`).
- TANGAGE : `pitch9` en fondu — plonge de 2° au frein / en drift, s'accroupit de 1,7° sous nitro / boost, se cabre à l'allumage ;
  plus le ressort des coups `SCOUP` (accroche, relâché, coupure, rapports, fruits, pads… : les autres agents).
- SUSPENSION : `susY`/`susV` sur `squashT` (pose, dos d'âne, bump, petit saut).
- BORD : roues dehors → la carrosserie s'affaisse vers le vide jusqu'à ~9° (`pe9`), le plancher racle (étincelles d'or au hasard,
  à la seconde) ; bande du RASE-BORD : étincelles bleues, son haché (`RSN`), `hap(12)` + aura à 0,6 s. Rien à l'INSTANT où la roue
  passe la lèvre, rien au retour. → détails 2 et 3.
- VOL : la carrosserie est au repos (`carBody` remis à zéro par `startFall`) ; c'est `carGroup` qui s'oriente — le nez suit la
  trajectoire (`slerp dt×8`), le manche (`pitchS`) infléchit la trajectoire, la VRILLE permanente (`airRoll`, + `steer×2,2`) est un
  parti pris tranché par Sacha. À flot : le bouchon de l'intégrateur (`sensEau`).

## Détails (dans l'ordre des commits)
### 1. Le coup de volant sec — 47c1883
- Le joueur passe le pouce d'un bord à l'autre (au-delà de la moitié du braquage de chaque côté, en moins de 0,3 s) : le poids est JETÉ
  sur le nouveau flanc extérieur et la caisse s'y tasse (`sensCoup(-sign(steer)*(.5+.6k), 0, -(.15+.2k))`, k = vitesse de 14 → 40 :
  ≈ 1,2° → 2,7° de roulis en plus, ≈ 0,5 → 1,5 cm), puis se repose seule. Pas de vibration (un slalom bourdonnerait).
- Gardes : pas en glisse (elle a son accroche), pas sur une flaque (elle louvoie déjà), pas en petit saut, pas sous 14 de vitesse, au
  plus un coup / 220 ms. Jamais en ligne droite : il faut deux demi-braquages opposés en 0,3 s.
- Provoquer : à bonne vitesse, gauche-droite franc du pouce (ou ←→ au clavier) ; regarder le toit basculer avec un petit rebond.
- Risque : s'ajoute au dépassement naturel du ressort (borné : `rollV` ±5, `carRoll9` ±24°). Si la caisse paraît « dandiner » en
  slalom serré, baisser `.5+.6*k`. Signe = hypothèse lue dans le code (voir en tête), la même que `glisse`.
### 2. La roue passe la lèvre — 8f67416
- Les roues extérieures quittent le bitume (`|lat| > ROAD_HALF − demi-largeur`) : à cet instant la caisse TOMBE d'un cran vers le vide
  (`sensCoup(sign(lat)*.45, 0, -.3)` ≈ 1,1°, ≈ 1 cm) et le pouce reçoit UN tic (`sensHap(8,1)`). Une fois par approche : réarmé quand la
  roue est revenue de 12 cm sur la route, et pas plus d'un tic / 0,45 s.
- Gardes : pas à Paris au sol (`PARIS.sol` : pas de vide), pas roues en l'air, pas sous 12 de vitesse ; posé directement roues dehors
  après un vol : pas de tic (la pose a le sien).
- Provoquer : longer le bord et laisser glisser les roues extérieures dehors ; téléphone en main.
- Risque : arrive ~0 à 0,6 s AVANT le `hap(12)` du RASE-BORD (deux tics distincts pour deux choses : la lèvre, puis la prime) — si ça
  fait doublon dans la main, retirer le `sensHap(8,1)` et garder le cran. Sur les routes étroites, le joueur qui vit au bord en reçoit
  souvent (limité à ~2 / s).
### 3. La roue remonte — d97416a
- On a vraiment mordu le vide (au moins 30 % du chemin vers la bascule) et on revient : la roue regrimpe la lèvre, la carrosserie est
  RENVOYÉE vers la route et se soulève d'un rien (`sensCoup(-sign(lat)*(.4+.6k), 0, .15+.25k)`, k = profondeur max de la sortie :
  ≈ 1,5° → 2,5°, ≈ 1 → 1,5 cm), 2 à 4 étincelles `sparkGold` sautent de la roue arrière extérieure, `sensHap(10,1)`.
- Provoquer : sortir franchement les roues (la caisse penche vers le vide, le plancher racle) puis revenir d'un coup de pouce.
- Risque : s'ajoute au redressement naturel du ressort (l'affaissement de 9° disparaît au même instant) : si le toit claque trop,
  baisser `.4+.6*k`. La gerbe part du côté `sign(lat)` en repère de la caisse (même hypothèse que le raclage existant, `driveDir` = 1).
- Sous « Réduire les animations » : aucun coup de caisse ni étincelle neuve (détails 1 à 3) ; les deux tics du bord restent.

## Écarté
- Plongée au FREIN et relâché de frein : il n'y a PAS de frein au doigt (gaz automatique ; `dn` = touches S / ↓ du clavier seulement, et
  ↓ + braquage = le drift, que `glisse` a traité). Un détail que l'iPhone ne verrait jamais : pas fait.
- Le coup de manche lisible EN VOL : l'orientation de la caisse suit déjà la trajectoire que le manche infléchit ; et la carrosserie
  tourne en vrille permanente (décision de Sacha, 05/08) — un tangage de `carBody` tournerait avec elle et ne dirait plus « piqué » ni
  « cabré ». En vol on vise : rien ajouté, ni secousse ni tic de butée.
- Frémissement CONTINU de la caisse près du bord : interdit (pas de tremblement), et le RASE-BORD a déjà étincelles + son haché.
- Toit ou flanc qui touche en roulant : pas trouvé de contact sans réponse (plots, portes, frôlés, flaques : faits par l'intégrateur ;
  le bump et la lèvre : `pose`).
- Braquage visible des roues avant : essieux soudés (écarté par le brief).
- Un coup de roulis à l'entrée d'un virage depuis la ligne droite, ou au lâcher du volant : le ressort le fait déjà (départ franc,
  léger dépassement) ; le renforcer = retoucher un réglage de Sacha.

## Sons à faire
- Un « toc » de pneu sur l'arête (30-50 ms, mat) pour la roue qui passe / remonte la lèvre : rien dans la banque ne convient
  (`pneuMord` se tait sous SONV2, `dosdane` est trop lourd). Aucun son joué pour ces trois détails.
