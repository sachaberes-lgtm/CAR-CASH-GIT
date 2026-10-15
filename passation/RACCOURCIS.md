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
