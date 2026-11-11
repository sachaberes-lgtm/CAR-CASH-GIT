# RACCOURCIS — la règle commune des maps (GAMEPLAY, 14/10/2026 soir)
Sacha : « le but du jeu est de prendre des RACCOURCIS en coupant la route quand une autre la croise plus bas ; à part la montagne chinoise (la mer),
les maps DESCENDENT » · « un jeu de COURSE, pas de balade » · « plus la vitesse du palier est élevée, plus les virages doivent être larges ».
Mesure : `node C:/Users/sacha/cc-banc/raccourcis.cjs <carte> <graine> [dossier VERSION PRINCIPALE] [--palier N] [--json]`.
## La physique (relevée dans le code, ne pas la réinventer)
- Monde en mètres ; m/s monde = km/h affichés / 3,6. Croisière du palier moteur `vPalier(t)` (même calcul que `lvPiste`) : palier 0 → **78 m/s**,
  5 → 105, 10 → 158, 15 → 236, 20 → 341, 27+ → 439. La piste se bâtit à chaque portail AU PALIER DU MOMENT : tout se met à son échelle.
- Gravité monde g = FALL_G × SPD = 33 × 0,48 = **15,8 m/s²**. Sortie par le BORD : 0 impulsion verticale (la pente de la route donne la vitesse de départ).
- Mort en vol : **6 s de vol** (`AIR_MAX` ; un bump en rend la moitié) ou **sous `trackMinY − 120`**. La pose ne tue JAMAIS (au plus −30 % de vitesse,
  `landLoss`). Pose propre ≤ 55° de l'axe de la route d'arrivée ; 55-120° = RATÉE (le flow tombe à zéro) ; au-delà, contresens.
- Dalle **56 m** (`ROAD_HALF` 28), 2,6 m d'épaisseur, lèvre de 45 cm. `tryLand` pose sur la dalle LA PLUS PROCHE, où qu'elle soit : aucun code à écrire,
  il suffit qu'une route soit sous la trajectoire. Volant en l'air ≈ 100°/s à fond. Le jeu crie « RACCOURCI » dès **gain ≥ 60 m**
  (gain = s pose − s décollage − distance volée en ligne droite).

| chute | vol | portée à 80 / 160 / 320 m/s (palier ~0 / ~10 / ~19) |
|---|---|---|
| 32 m | 2,0 s | 160 / 320 / 640 m |
| 71 m | 3,0 s | 240 / 480 / 960 m |
| 127 m | 4,0 s | 320 / 640 / 1 280 m (limite 6 s = 285 m de chute) |
## Un RACCOURCI jouable
1. La route d'en bas passe **25 à 150 m sous** la sortie (au-delà, plus de 4,4 s de vol : trop près des 6 s).
2. Elle est **là où la caisse arrive** : à ~v × t devant la sortie, **même sens à ±55°**, sur au moins 150 m de long (une dalle qu'on touche de
   0,75 à 1,25 × la vitesse du palier, pas un point). La portée grandit avec le palier : bâtir les raccourcis à l'échelle de `vPalier()`.
3. **Gain ≥ 150 m** (≈ 1 s une fois rattrapés les 30 % de la pose). Un GROS raccourci (≥ 400 m) par niveau au moins.
4. **On la voit avant de sauter** : à côté de la route d'en haut, pas cachée sous sa dalle, en deçà de la brume. Sous un pont, ≥ 12 m de dégagement ;
   des dalles à moins de 7 m l'une de l'autre = croisement DANGEREUX (zéro).
5. **≥ 0,6 raccourci rentable par km** (4 à 5 par niveau de 7 km). Rater = mourir : c'est le prix ; la route sage reste toujours ouverte.
- Les formes : le **VIRAGE À FILET** de genCtrl (boucle qui repasse 30-60 m plus bas, à l'EXTÉRIEUR du virage, même sens) ; la **SPIRALE qui descend**
  (sauter par l'intérieur) ; la **double épingle** parallèle. ⚠ L'épingle simple : la branche d'en dessous est à CONTRESENS.
- **CANYON** : la règle s'applique, sauf dans ses **COULOIRS** (gorges serrées de précision, parois collées) : là, ni raccourci exigé ni sortie possible.
## DESCENTE (toutes les maps sauf JADE, la mer)
- Départ en haut, arrivée en bas : **pente moyenne ≥ 4 %** (≥ 280 m sur 7 km), **montée ≤ 15 %** de la longueur. Pente lissée sur 20 m ≤ 30 % hors plongeons.
- Chaque raccourci « dépense » son dy : la descente le paie entre la sortie et la pose. ⚠ Près de l'arrivée (le plancher), un raté tue après 120 m de chute.
## COURSE — des virages larges à la mesure du palier
- **Rayon mini = `rayonPalier()` = 40 + 0,3 × vPalier** (le vrai plafond du joueur : `lacetMax`, VOL_R0/VOL_RK — TURN_HS ne règle que la police) :
  palier 0 → 63 m, 5 → 71, 10 → 87, 15 → 111, 20 → 142, 27+ → 172. Rayon d'axe **< rMin = INFRANCHISSABLE** à la vitesse du palier (zéro) ;
  rMin à 1,5 × rMin = **SERRÉ** (volant à fond, ≥ 0,5/km) ; au-delà, il passe au pouce. Les rayons d'un générateur se multiplient par `rayonPalier()/63`.
- **≥ 2,5 virages/km** (cap qui tourne ≥ 20°, rayon < 4 × rMin : 252 m au palier 0, il s'élargit avec lui), **≥ 1 enchaînement/km** (deux virages à < 150 m), **ligne droite ≤ 5 s** à vPalier (≈ 400 m au palier 0).
## LES VILLES ET LA GROTTE (2026-11-11 nuit, cache v1482) — mesuré DANS LE VRAI JEU
Sacha : « ça ne descend pas assez, il manque 50 % du gameplay : s'envoler pour prendre des raccourcis ». Les maps hors du JOUER (dunes, forêt, volcan, glacier, ville vitrée) n'ont pas été touchées.
| map | pente avant → après | raccourcis jouables avant → après |
|---|---|---|
| ville (nuit d'orage) | 9,3 % → 13,3 % (palier 0), 9,8 % → 13,6 % (palier 10) | aucun (le seul promis finissait dans une tour) → LE SAUT + LE GRAND SAUT : 1,8 module par route au palier 0, 1 au palier 10, 0,4 au palier 20 |
| Crypto City (jour) | 8,0 % → 12,1 % (palier 0), 7,6 % → 11,2 % (palier 10) | aucun → 2 modules par route au palier 0, 1,25 au palier 10, 0,9 au palier 20 |
| grotte | 4,4 % → 7,3 % | aucun en sortie franche (les ~1/km du banc Node demandent de braquer en l'air entre deux lacets) → LE SAUT DES ABYSSES, un par route (la signature de la dernière salle) |
| canyon | 23-26 % (inchangé) | son module « raccourci » pose en jeu (1,2 km gagnés, 2 graines sur 3) : 0,4-0,6/km — inchangé |
- **LE SAUT / LE GRAND SAUT** (`vSaute`, code/maps/ville-entree.js) : un virage serré (1,6-1,9 rP) qu'on NE PREND PAS ; la route d'en bas est DANS L'AXE de l'approche, 32-44 m (2 s de vol) ou 66-90 m plus bas
  (3 s), longue de ~1,35 × la portée et en descente de 14 % : on s'y pose dans le sens de la marche de 55 à 110 m/s, au milieu comme à ±20 m du bord. La route sage fait la bretelle (demi-tour du même côté)
  et repasse SOUS le virage. Gain en jeu : 0,9 à 1,2 km. Le jeu crie RACCOURCI (pas de repère de filet : ce n'est pas un « RATTRAPÉ »).
- **LE SAUT DES ABYSSES** (`gSaut`, code/maps/grottes-1.js) : le même geste dans la grotte, 58-80 m plus bas ; 9 poses sur 9 à 58, 78 et 110 m/s (3 graines), 2,1-2,5 s de vol, 0,9-1,1 km gagnés ; édition téléphone 2/2.
  Rien à creuser (les salles font 200 m de demi-largeur). ⚠ Le module doit rester À PLAT dans la torsion : en fin de route pisteTord le refusait (il déborde sur la fin tenue à l'endroit) et le dévers couchait le virage
  de 30° — vol faussé de 4,8 s. `O.platFin` (grtTordOpts) coupe la figure à la fin au lieu de la refuser. La pente de la grotte : `PENTE` par salle (les salles à lac restent douces), `?sans=grottedesc`, `?sans=grottesaut`.
- **Les tours** : `FILETMARK.air` (des disques en cône de ±12° le long de l'axe) → `buildVoxCity` rabat les toits 60 m sous la route d'en bas (code/maps/jade-balade.js). Sans ça : mort « tour ».
- **Essayé et retiré en ville** : le virage à filet concentrique des nuages (1,9 km presque à plat, pose dépassée à 90 m/s : la caisse coupe le filet à 45-55°).
- **Bancs** : `node outils/banc-routes/descente.cjs cartes=ville,crypto paliers=0,10,20` (pente, modules ; il ne voit pas les tours) · `modules-longueur.cjs` (longueur et pente de chaque module) ·
  dans le vrai jeu : `node outils/banc-maps/banc.cjs gen --carte=ville --graines=1,2,3 --auditfile=outils/banc-routes/raccourcis-page.js --q="vsaut=78&essais=0&droit=1"` puis `node outils/banc-routes/lit-perso.cjs ville`
  (`droit=1` : la caisse arrive droit et ne tourne pas — le vrai geste ; `lat=20` : au bord ; `essais=6` : les candidats du simulateur, joués un par un). `?sans=villeracc`, `?sans=grottedesc` : les routes d'avant.
- **Reste à faire** : en VILLE, rendre la route d'en bas plus VISIBLE depuis l'approche (elle est sous le bord de la dalle jusqu'au dernier moment, on voit surtout la bretelle revenir : une ligne de pièces dans l'axe du saut ?
  — dans la grotte elle se voit bien, à côté du virage) ; la grotte n'a qu'UN saut par route (~0,1/km) ; à haut palier (20+) la route ne dure que ~25 s : un module sur deux routes seulement.
