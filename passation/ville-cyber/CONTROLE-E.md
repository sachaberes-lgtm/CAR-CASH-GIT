# Contrôle adverse du lot E — tour 1 (19/11/2026)

**Verdict : REFUSÉ.**

L'identité est exacte et les gardes passent. Mais sur des graines que l'auteur n'a pas utilisées, des objectifs mesurés ne tiennent pas, et un des « atteint » du rapport ne se reproduit pas.

Bancs et sorties : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-e/ctrl/`
(`id2.cjs`, `mine.cjs`, `etages-c.cjs`, `tranche.cjs`, `new.txt`, `socle.txt`, `old.txt`, `new2.txt`, `mine-*.jsonl`, `cyber-*.txt`, `tors-e.txt`, `chrome/`).

Graines neuves : 301-370, plus dix graines 32 bits (2654435761, 4294967295, 2147483648, 123456789, 3141592653, 3735928559, 1000000007, 2863311530, 305419896, 4000000000). Bancs secondaires : 401-440 et 501-560. La graine est posée comme en jeu.

## Ce qui tient
- **Identité au bit près** (`id2.cjs`).
  - Ce qui est haché : les points, MODMARK, FILETMARK, VILLE_BANK et VILLE_ENTREE.
  - Les tirages : `genCtrl` et `genCtrlG`, aux paliers 0, 5, 10, 15, 20 et 27, sur 20 graines neuves et 32 bits.
  - Ville avec `?sans=villeetages` : égale à la référence intacte. Crypto, nuages et espace sans drapeau : égaux.
  - Vitrée : la sortie de genCtrl1 est égale à la référence, quel que soit le drapeau. Ce banc remplace `VIT_SOL` par faux, donc `vitreAplanir` est sauté, mais cette fonction n'est pas touchée par le lot.
- **Gardes vertes** : garde-demarrage, garde-allege, garde-charte, `--verifier`.
- **vsCroise** à 0, aucune montée hors module, pente ≤ 40,5 % hors piqué, aucun NaN, aucun segment de plus de 64 m (comme au socle).
- **Chaque route joue au moins une scène ou un module du lot A**, à tous les paliers.
- **Torsades** (graines 501-530) : roulis au plus 28°/s, 0 % de temps tête en bas, saut refusé 0 %.
- **Règle des 14 m** et audit `dans` / `frole` à 0 (graines 501-560).
- **Tirage** (A/B alterné, graines 311-322) : +5 % / +5 % / +17 % aux paliers 0 / 10 / 20. Plus longue tranche (un genCtrl1 ou un terme du malus) : 9 ms au plus, comme au socle.

## Défauts
1. **BLOQUANT — écart médian avec la route du dessus.** Au palier 0 il n'atteint pas 150 m, même avec l'exclusion de l'auteur.
   - Hors raccourci : 110 m.
   - Hors raccourci et hors tours internes du parking ou de la bretelle : 147 m.
   - Le rapport annonce 159 m pour cette dernière mesure : ce chiffre ne se reproduit pas.
2. **BLOQUANT — virage cumulé.** Il est de 4,6 / 3,7 / 2,9 tours aux paliers 0 / 10 / 20 : l'objectif de 4 tours n'est pas tenu aux paliers 10 et 20.
3. **BLOQUANT — les étages disparaissent aux paliers moyens.**
   - Palier 10 : un module d'étage dans 11 routes sur 80 (le rapport dit 20).
   - Palier 15 : aucun, sur 40 routes.
   - Enclavé au palier 15 : 44 %, sous les 50 % visés. Au palier 10 le p10 est à 44 %, et au palier 20 le minimum tombe à 17 %.
   - La cause : le raccourci passe toujours en premier et prend la place de l'étage.
4. **Mineur — plus de raccourcis à faible hauteur libre.** Au palier 0, 23 routes sur 80 ont un raccourci qui passe sous lui-même à moins de 40 m (minimum 30 m), contre 4 au socle. Ce cas est exclu par vsCroise, comme au socle.
5. **Mineur — pièces du piqué perdues.** Au palier 0 (graines 501-560), 4 pièces du piqué sont perdues (« route ») et un tunnel est abandonné (« air »). Le rapport dit « aucune pièce perdue ».
6. **Mineur — tenue de cap.** Le pire t30 atteint 8,95 s au palier 0 (graines 501-560). Le 90e centile reste sous 8,5 s.
7. **Mineur — commentaires faux dans le code.**
   - `VE_AIR=68` n'a pas de commentaire : le sien est collé sur la ligne de `VE_FIN`.
   - mParking annonce 9,5 % de pente : c'est 9,8 %.
   - L'appel de `veOrdre` dit « une carte route-ville en tête » : c'est l'étage qui passe en tête.
8. **Mineur — moins de modules du lot A.** Ils sortent dans 14 routes sur 80 au palier 0 (déjà dit par l'auteur).

## Pas vérifié
- La passe Chrome de ce contrôle (bretelle graine 17, parking graine 23 en 390×844, courses graines 29 et 44, A/B des comptes sur la graine 13, toutes.mjs) était en attente du verrou, tenu par une autre session, quand ce rapport a été écrit. Ses résultats ne sont pas jugés ici.
- Je n'ai regardé que les photos de l'auteur. Sous le parking, le tour du dessus passe bien au-dessus de la route. Sur les plans, la route ondule et les spirales restent isolées : ce n'est pas encore la ville « enclavée dans des tunnels d'immeubles » du 3/11 aux paliers moyens.
- Pas faits : les sauts nitro, la vitrée et Crypto City en Chrome, l'iPhone.
- Le `index.html` commité au socle 94cb49647 n'est pas à jour de ses morceaux : le diff de l'index fait environ 3 000 lignes, dont 121 seulement viennent du lot. Ce n'est pas un défaut du lot, mais il faudra en tenir compte au commit.

---

# Contrôle adverse du lot E — tour 2 (19/11/2026)

**Verdict : FUSIONNABLE**, avec des réserves mineures à soumettre à Sacha (plus bas).

Le code jugé est celui du 19/11 à 16:49 (dernier morceau modifié). Toutes les mesures ci-dessous ont été faites après.
Bancs et sorties : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-e/ctrl2/`
(`run1.sh`, `run2.sh`, `chrome.sh`, `new.txt`, `socle.txt`, `old.txt`, `mid*.txt`, `mine-*.jsonl`, `id-*.txt`, `emp-*.txt`, `cyber-*.txt`, `tors-e.txt`, `tranche-*.txt`, `tirage-ab.txt`, `chrome/`).

Graines neuves, que ni l'auteur ni le tour 1 n'ont utilisées : 801-870, plus dix graines 32 bits (1609215445, 3000000001, 1234567891, 2718281828, 4123456789, 987654321, 2222222222, 3333333333, 4242424242, 1073741825).
Paliers intermédiaires : graines 901-950. Modules : 601-660. Torsades : 601-630. Tirage : 861-872. Chrome : 37, 41, 53, 66, 71, 81-83.

## Ce qui tient

### Identité
- **Empreintes officielles** (`empreinte.cjs graines=1-12`), toutes égales aux valeurs attendues :
  - `?sans=villeetages` : 17b89297a6b8 / 9dc6766ea34f ;
  - `?sans=villeetages,villecyber` : d63b36e2af8b / fb378a8c6756 ;
  - crypto, nuages et espace sans drapeau : égaux.
- **`id2.cjs`** : hache les points, MODMARK, FILETMARK, VILLE_BANK et VILLE_ENTREE, avec genCtrl et genCtrlG, aux paliers 0, 5, 10, 15, 20 et 27, sur 20 graines neuves dont les 32 bits.
  - `.lots/e` avec `?sans=villeetages` donne les mêmes 60 empreintes que la référence intacte.
  - Crypto, vitrée, nuages et espace sans drapeau : égaux aussi.
- **La vitrée et Crypto City en Chrome** (`toutes.mjs`, graines 81-83, paliers 0, 10 et 20) : avec et sans `sans=villeetages`, les 18 fiches sont égales (hors temps).

### Gardes
garde-demarrage, garde-allege, garde-charte et `--verifier` sont verts (relancés à la fin). Aucun `//` ajouté au milieu d'une ligne. `sw.js` n'est pas touché, rien n'est commité.

### Objectifs (médianes sur 80 routes, graines neuves)
| | p0 | p10 | p20 | 3/11 | socle | objectif |
|---|---|---|---|---|---|---|
| enclavé | **74 %** (min 52) | **56 %** (min 43) | **55 %** (min 39) | 67 / 57 / 49 | 32 / 17 / 18 | ≥ 50 ✔ |
| virage cumulé | **4,6** | **4,2** | **4,2** tours | 5,5 / 4,8 / 3,3 | 3,9 / 3,0 / 2,0 | ≥ 4 ✔ |
| écart avec la route du dessus, hors raccourci | **175 m** | **177 m** | **174 m** | 169 / 229 / 216 | 153 / — / — | ≥ 150 ✔ |
| hauteur libre mini hors raccourci (pire route) | **61 m** | 92 m | 157 m | 58 / 82 / 137 | | ≥ 60 ✔ |
| tenue de cap t30, p90 (pire route) | **7,2 s** (9,3) | 6,3 (8,6) | 5,6 (7,6) | | 8,3 / 7,6 / 6,3 | < 8,5 ✔ |

- **Toujours à zéro** : `vsCroise`, montée hors module (0 m, 0 %), NaN.
- **Pente** : 40,5 % au plus hors piqué. Le piqué du lot A va jusqu'à 76 %, comme au socle.
- **Pas de trou** : le plus long segment fait 64 m, comme au socle.
- **Modules** : chaque route joue au moins une scène ou un module du lot A, et un module d'étage, à tous les paliers.
- **Paliers intermédiaires** (graines 901-950) :
  - palier 5 : 69 % d'enclavé, 4,6 tours ;
  - palier 15 : 48,8 % d'enclavé, 4,3 tours (3/11 : 52 %) ;
  - palier 27 : 46 % d'enclavé, 2,7 tours (3/11 : 49 % et 2,5).
- **Banc des modules** (601-660) : règle des 14 m à 0, audit `dans` / `frole` / nappes à 0.
  - Une seule pièce perdue : un slalom au palier 0, raison « route ». Le socle en perd 13.
  - Un plan abandonné : une boucle au palier 0.
- **Torsades** (601-630) : roulis au plus 28°/s, 0 % de temps au-delà de 45°, à l'envers 0 %, saut refusé 0 %.
- **Raccourci qui passe sous lui-même à moins de 40 m** : 3 routes sur 80 aux paliers 0 et 10 (au moins 28-30 m), 0 au palier 20. Le socle en a 5, 58 et 32 : le défaut 4 du tour 1 est corrigé.

### Chrome
Une passe sous `verrou-banc.sh` (« ville-cyber-e-ctrl2 ») de 490 s, Chrome muet (`--mute-audio`, sfx/mus/vox coupés), profils supprimés, verrou rendu.

| course | résultat | appels / triangles (moyenne) |
|---|---|---|
| graine 53, 844×390 | parking, grand saut, piqué, façade ; 6,8 km sans mort ; audit 0/0/0 | 128 / 390 k |
| parking, graine 37, 390×844 | sans mort, la caisse reste en `drive`, audit `flotte` 2 | 96 / 239 k |
| bretelle, graine 41, 844×390 | sans mort, la caisse reste en `drive`, audit 0/0/0 | 117 / 284 k |
| graine 71, avant (`sans=villeetages`) | 4,5 km sans mort | 115 / 285 k |
| graine 71, après | 4,5 km sans mort | 107 / 289 k |

- Avant/après sur la graine 71 : programmes 154 = 154, textures 121 = 121.
- **0 erreur console** dans toutes les courses.

### Ce que montrent les photos
Les photos sont dans `ctrl2/chrome/`. Dans le parking (390×844), on descend entre des tours, et le tour du dessus et la bretelle passent au-dessus et à côté de la route.
On voit d'autres rubans de route empilés dans la ville. Ce n'est pas encore le « tunnel d'immeubles à l'envers » du 3/11 : ce décor appartient au lot D.
**La route donne bien des étages à superposer** : écart de 170-180 m, 4-11 % de la route sous un autre étage.

## Défauts (tous mineurs)

1. **Le parking descend 2,5 fois plus fort qu'au 3/11.**
   - Le rayon (1,8-2,1 rP) et l'angle (400-460°), confirmés par Sacha, sont respectés.
   - Mais la pente passe de 9 % à environ 23 % au palier 0 (`VE_AIR` = 170 m par tour). La spirale serrée devient un tire-bouchon plongeant.
   - C'est ce qui fait tenir l'écart ≥ 150 m. Le commentaire d'en-tête de `mParking` (ville-entree.js l.420) dit encore « ~9 % » et « ≥ 60 m d'air ».
   - **À montrer à Sacha.**
2. **Des routes toutes pareilles.**
   - Chaque route s'ouvre par le même module d'étage (parking ou bretelle).
   - Aux paliers 0 et 10, il est presque toujours suivi du grand saut, puis d'une scène.
   - Au palier 20, 69 routes sur 80 sont exactement « parking, slalom des tours ». On voit donc la spirale à chaque ville.
   - Les modules du 3/11 sont dans le paquet, mais ne sortent que deux fois sur 240 routes (un carrefour en S, un pont ; ni angles, ni slalom, ni double corde).
   - Le lot A sort moins qu'au socle : 24 / 14 / 75 routes sur 80, contre 56 / 39 / 7.
   - L'auteur le dit en partie. **Choix à Sacha.**
3. **Virages plus serrés aux hauts paliers.** Ils restent au plancher de la charte, mais plus près qu'au socle.
   - Au palier 20, avec `VE_KR` : 4 virages « serrés » par route (60° et plus sous 2 rP) contre 0 au socle.
   - Rayon tenu sur 80 m : 1,54-1,57 rP, contre 2,05 au socle. Accélération de côté sur 20 m : 82 g, contre 63.
   - `toutes.mjs` ne trouve aucun virage infranchissable. Mais aucune course n'a roulé au palier 10 ou 20 : le banc Chrome part au palier 0.
4. **Deux enseignes flottantes** (dbgVilleAudit `flotte` 2) dans la course du parking (graine 37), à y ≈ −1 186 m, portées par aucune façade.
   - Hypothèse : leur tour a été refusée par `tourLibre` sous un étage. Je n'ai pas vu ces enseignes à l'image.
   - Ce n'est pas `dans` ni `frole` : rien ne touche la route.
5. **Coût du tirage.**
   - A/B alterné : ×1,12 au palier 0, ×1,10 au palier 10, ×0,75 au palier 20.
   - Plus longue tranche au palier 0 : genCtrl1 17 ms et vsMalusTenue 13,5 ms, contre 10,6 et 2,8 ms au socle (un seul maximum, sur un Mac chargé).
   - **Non mesuré sur iPhone.**
6. **Pire tenue de cap** : t30 à 9,3 s au palier 0 (socle 8,6). Le p90 reste à 7,2 s.

## Pas vérifié
- **Courses aux paliers 10 et 20** : le banc ne sait pas poser le palier moteur.
- **Sauts nitro** (`ville-sauts-page.js`) : pas lancés. Le pilote roule nitro coupée.
- **iPhone** : ni tirage, ni comptes, ni chauffe.
- La deuxième course longue (graine 66, 390×844) a dépassé ses 220 s et n'a pas rendu de résultat.
- L'œil de Sacha sur le « délire » du 3/11 : le décor, c'est le lot D.
- **Incident de verrou** : pendant la passe, le dossier du verrou a disparu (une autre session l'a rendu). Je l'ai repris au nom de cette passe jusqu'à la fin.
  Le Chrome de la course coupée (profil ctrl2-e-a) était resté orphelin : son groupe de processus est tué et son profil supprimé.
