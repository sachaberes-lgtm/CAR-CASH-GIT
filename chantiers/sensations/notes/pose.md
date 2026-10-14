# Notes de l'agent `pose` (passe SENSATIONS, 2026-10-14)

## Inventaire (ce qui EXISTE déjà — laissé tel quel)
- CONTACT (`touche9`, rendu à l'instant où les roues touchent via `POSE_F`) : `poseGerbe` (étincelles de châssis rasantes + gomme des
  DEUX côtés, braises si POSÉ LOURD, nombre selon l'impact), `thud`, `shake`, `squashT` (tassement des ressorts), `pneuMord`.
  → la gerbe « aux roues, plus large si lourd » existe déjà : rien ajouté.
- MAIN : `hap(15)` PARFAIT, `hap(45)` LOURD, `hap(14)` ordinaire — MAIS seulement dans le verdict (`fallT>.7` ou chaîne) ; BUMP `hap(24)` ;
  lèvre `hap(18)`. Aucune vibration au décollage, ni sur une pose courte sans verdict.
- BUMP : 12 étincelles or au CENTRE de la caisse, tôle (`dropChip`), secousse, tassement, sons.
- DÉCOLLAGE (`startFall`) : 14 poussières + 8 flammes sous la caisse (10 étincelles au bord), son `decollage` / `chute`, crépitement moteur.
- EN L'AIR : les roues filent sur leur élan et s'essoufflent déjà (`carVit`, `ROUES.v*=exp(-dt*.7)`) ; le moteur s'emballe (roues libres).
- Pose de travers : `driftT` relancé → fumée et crissement suivent déjà.

## Détails
### 1. La caisse encaisse la pose — `sensPose(imp,psi0,verdict)` appelée dans `touche9` (tryLand)
- Le joueur se pose : le NEZ plonge à proportion du choc (`nez` .35 → 1.85 rad/s, soit ≈ 1° plume → ≈ 5° lourd) ; arrivé en crabe, la
  carrosserie VERSE du côté où elle ripe (`versLat` = psi×3, borné ±2, ×(.5+.5k)). Pompe = 0 (squashT s'en charge déjà).
- Provoquer : un tremplin posé doux puis un piqué nitro ; braquer en vol pour se poser de travers.
- Risque : s'ajoute au roulis naturel de la réception en glisse (borné par rollV ±5 et SCOUP.p ±.14) ; à baisser (×3 → ×2) si ça tangue trop.
### 2. La main sent les petites retombées — même `sensPose` (paramètre `verdict`)
- Une pose SANS verdict (vol ≤ 0,7 s et aucune chaîne : trou enjambé, crête, sortie courte) n'avait aucune vibration. Au contact :
  `sensHap(9,1)` plume · `(16,2)` net (choc ≥ 4,5) · `(34,3)` lourd (≥ 10). Les poses jugées gardent leur `hap` du verdict : pas de doublon
  (`sensVer9` lu dans tryLand avec la même condition que le verdict).
- Provoquer : tomber dans un petit trou / passer une crête à vitesse moyenne, téléphone en main (vibrations activées).
- Risque : nul côté jeu ; si une pose courte porte une chaîne, c'est le verdict qui vibre (comme avant).
### 3. Le BUMP racle — `sensBumpFlanc(b,t,n,sg,impB)` appelée dans tryLand, bloc du BUMP (après la gerbe existante)
- Cogner la tranche : 4 à 10 étincelles `sparkGold` naissent au FLANC qui touche (une demi-largeur vers la route), giclent vers le vide
  et héritent de la vitesse d'avance (elles filent le long de la dalle au lieu de rester en boule sur place). On lit le côté du choc.
- Provoquer : sortir par le bord puis braquer vers la route pour taper la tranche sous le niveau du bitume.
- Risque : +4-10 particules dans l'anneau `sparkGold` par bump (en plus des 12 existantes) ; elles sont SOUS/à côté de la dalle, pas sur le viseur.
### 4. Le sol lâche dans la main — une ligne dans `startFall` (avant le crépitement moteur)
- Décoller : `sensHap(9,1)` (crête, trou, bord) ; CATAPULTE (`impU>=5`, pas au bord) : `sensHap([10,26,14],2)` = les deux essieux sur la lèvre.
- Gardé par `running&&!gameOver&&!introD`. Provoquer : prendre un tremplin ; sortir par le bord.
- Risque : le pad de la ligne juste avant un tremplin vibre déjà (`hap` direct, hors limiteur) : deux tics rapprochés possibles.

## Vu et laissé
- Double tap du PARFAIT : le `hap(15)` du verdict part à la DÉCLARATION de la pose (jusqu'à ~0,2 s avant le contact quand la caisse finit
  sa descente en `hopY`) ; le déplacer au contact = réécrire des lignes de règle. À faire par l'intégrateur s'il veut : passer le grade à `touche9`.
- Coup de roulis à la reprise du BUMP : en vol `sensCoup` ne fait rien et `airRoll` appartient aux figures (vrille) — écarté.
- Poussière aux 4 roues / gerbe du côté qui ripe : `poseGerbe` (deux côtés, dosée) + `driftT` (fumée de glisse) le font déjà.
- Bouffée au décollage, roues libres en l'air : existent déjà (`startFall`, `carVit`).
- `levreRattrape` : gerbe encore au centre de la caisse (8 étincelles) ; elle pourrait partir de la lèvre comme le bump (non fait, faute de temps).
- Sons à faire : aucun manquant pour ces détails (`pose.choc`, `fig.bump`, `decollage` couvrent). Un « raclement de tôle sur béton » court
  pour le BUMP (distinct du ressort caoutchouc de `fig.bump`) serait un plus.
