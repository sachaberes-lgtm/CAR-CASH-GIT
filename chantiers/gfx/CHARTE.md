# CASH CAR — LA CHARTE DE L'IMAGE (monde 3D) — passe graphismes du 14/10/2026

Écrite par le chef d'équipe à partir des captures AVANT (`shots/avant/planche-tout.png`), du premier audit (`audit/nuages.md`) et des
décisions de Sacha. Elle fait foi pour l'étalonnage de chaque map × météo. Tout ici se règle par des VALEURS (gratuit pour la puce).

## 1. Ce que l'image doit devenir
CASH CAR : une caisse en pixels qui file sur un ruban de BÉTON MAT posé dans le ciel. L'image est CLAIRE, LISIBLE, TENUE : une lumière
par scène, une palette courte, de l'air. Ce qu'elle n'est plus : le violet-néon « par défaut » (Sacha : « trop IA »), les noirs bouchés,
les oranges et les cobalts poussés à fond, les coins de l'écran recolorés. Le juge : un designer d'Apple (retenue, matières justes, finition).

## 2. Les règles d'or (chiffrées)
1. VALEURS. La ROUTE (béton gris) est le repère : L* 32-45 de jour, 22-30 au soir, 14-20 de nuit, jamais un trou (moins de 15 % de pixels
   sous L* 6 dans le tiers bas de l'image). De jour le ciel est plus clair que la route ; de nuit la route éclairée par les phares est
   plus claire que le ciel. La voiture se détache de la route d'au moins 20 L* (ou par sa teinte).
2. SATURATION ET CONTRASTE. Deux couches se multiplient : `BIOMES.x.sat × DA.sat` et `BIOMES.x.con × DA.con`. Produit final visé :
   saturation ≤ 1,25 de jour · ≤ 1,30 au soir · ≤ 1,15 la nuit, sous la pluie et l'orage ; contraste ≤ 1,32 partout (aujourd'hui : jusqu'à
   1,63 et 1,48 — la cause du cobalt criard, de l'orange « Cheetos » et des noirs bouchés). On baisse par l'ambiance (`sat`, `con`,
   `daCon`, `daExpo`), la couche DA commune étant réglée à part.
3. TEMPÉRATURE. Une lumière clé (`sunC`) et son contraire en ombre : clé chaude → ombres froides (`sh`, `hemiG`, `fillC`), et l'inverse
   la nuit (clé de lune froide, accents chauds des phares). Jamais clé et ombre de la même famille.
4. LA BRUME EST LA PROFONDEUR. `fog` prend la couleur de l'HORIZON du ciel (jamais un violet arbitraire) ; `fogN`/`fogF` réglés pour que
   le décor lointain perde du contraste sans avaler les 300 premiers mètres de route.
5. LE VIOLET. Réservé à l'ENCRE des ombres profondes (#1c0430 : garde) et à l'orbite. Interdit comme dominante de ciel, de brume, de
   vignette ou de route de jour. L'orage devient ARDOISE (gris-bleu sombre), pas indigo-magenta.
6. LA VIGNETTE (`vigK`, `vigC`). Discrète (≤ 60 % de sa force d'aujourd'hui) et NEUTRE : la couleur de l'ombre de la scène en plus sombre,
   jamais un teal, un vert ou un magenta. Les coins ne se recolorent pas.
7. LE HALO (`bloomS`, `bloomT`). Il ne s'allume que sur ce qui ÉMET (soleil, phares, feux, néons, nitro, pièces) : seuil haut de jour
   (`bloomT` ≥ 0,9), force modérée ; un ciel de midi ou un nuage blanc ne doit pas baver.
8. LES BLANCS ET LES NOIRS. Un nuage au soleil de midi est BLANC (L* > 85, à peine chaud), pas beige/taupe. Le noir le plus noir de
   l'image reste teinté par l'ombre de la scène, jamais un aplat #000 sur une grande surface.
9. LA RETENUE. Si un réglage ne se VOIT pas en mieux sur une capture comparée, on le retire.

## 3. La grille à deux entrées (c'est elle qui fait la cohérence)
### L'identité de chaque MAP (constante à travers ses météos)
| Map | Ce qu'elle est | Dominante | Matières-repères | Accent |
|---|---|---|---|---|
| MER DE NUAGES | l'air, l'altitude, la lumière pure | bleu ciel → blanc | cumulus blancs, béton clair | l'or du soleil |
| LA VILLE | le minéral urbain, le verre, la densité | gris bleuté de jour, encre bleue de nuit | tours béton/verre, fenêtres | les enseignes (seulement soir, nuit, pluie) |
| PICS DE JADE | l'estampe : roche, pins, brume | céladon / vert de jade / blanc de brume | roche jade, mer, kasumi | le laiton des sapèques, le rouge laque (rare) |
| EN ORBITE | le vide net, la lumière dure | noir profond + bleu de la Terre | béton éclairé à vif, planète | le blanc-soleil, une pointe d'ambre |
| CRYPTOCITY | la ville en fête (bull run) | jour clair et vif, verts de hausse | tours, graphiques | l'or du ₿, le vert de hausse |

### La signature de chaque MÉTÉO (commune à toutes les maps)
| Météo | Lumière clé (`sunC`) | Ombres | Ciel (zénith → horizon) | Expo / contraste / saturation | Brume |
|---|---|---|---|---|---|
| MATIN | or pâle, basse (#FFE0AE) | bleu-lavande froid (#5A6C9E) | #5E9FDD → #F7D9BC (pêche clair) | claire, contraste doux (≤ 1,22), sat ≤ 1,20 | abondante, claire, rosée |
| MIDI | blanc à peine chaud (#FFF7EA) | bleu neutre (#4A5F86) | #3F8FE0 → #CFE8F7 (pas de cobalt) | la plus claire, contraste ≤ 1,28, sat ≤ 1,25 | légère, bleu très clair |
| SOIR | orange-rosé (#FFA264) | prune désaturée (#4A3A5E) | #5A5FA8 → #FFB98A (pêche → mauve DOUX) | −10 % d'expo, contraste ≤ 1,30, sat ≤ 1,30 | dorée, plus dense à l'horizon |
| NUIT | lune bleu-argent (#A9C0EA) | bleu nuit (#141C36), jamais #000 | #0B1230 → #1E2A52 | basse mais LISIBLE, contraste ≤ 1,25, sat ≤ 1,15 | bleu sombre, proche |
| PLUIE | diffuse, gris perle (#D5DEEA) | gris-bleu (#3A4660) | #6E7F96 → #A9B7C6 | −5 % d'expo, contraste ≤ 1,18, sat ≤ 1,05 | dense, gris clair ; la route mouillée fait le spectacle |
| ORAGE | ardoise froide (#9AA8C4), éclairs blanc-bleu | #1B2236 | #1E2740 → #4A5670 (ARDOISE, plus d'indigo-magenta) | sombre, contraste ≤ 1,30, sat ≤ 1,10 | lourde, gris-bleu sombre |
| SATELLITES (orbite) | blanc dur | noir bleuté | noir étoilé | contraste net, sat ≤ 1,15 | aucune |
Chaque map TEINTE cette signature de son identité (le matin de la VILLE est plus gris-bleu, celui du JADE plus céladon, celui de l'ORBITE
est le lever du soleil derrière la Terre) — mais on doit reconnaître « un matin » ou « une pluie » d'une map à l'autre.

## 4. La route en béton mat (décision de Sacha)
Le sol n'est plus violet ni brillant : gris minéral neutre-chaud, mat à sec, mouillé seulement sous la pluie. Chaque ambiance doit donc
s'assurer que SA lumière pose bien sur du gris : de jour un béton clair (L* 38-45) légèrement réchauffé par la clé ; au soir il prend
l'orange sur les faces éclairées ; de nuit il reste lisible dans les phares ; en orbite il est éclairé à vif d'un côté. Les réglages
de la route (`ROUTE_JOUR`, `uLift`, `LVL.route`, `sheen`) appartiennent à l'agent `route-beton` : les équipes d'ambiance n'y touchent pas.

## 5. Objets et effets (constants d'une map à l'autre, sauf mention)
Pièces : or (sapèques de laiton sur le JADE, ₿ à CRYPTOCITY) — toujours l'objet le plus chaud et le plus net de la route. Les voitures
et la boutique 3D sont gelées cette nuit (Léo). Les voiles de couleur plein écran liés aux bonus (vert de l'aimant, magenta de la
vitesse) recolorent la moitié de l'image : à adoucir par leurs valeurs — chantier séparé, pas celui des ambiances.

## 6. L'accord avec l'interface
L'interface devient « ENCRE · BLANC · OR », à plat (autre session). Le monde 3D doit lui laisser la place : pas de zones criardes
derrière le HUD (haut de l'écran : ciel calme), des coins neutres (vignette), l'or réservé aux pièces et au soleil.

## 7. Ce qu'on garde
L'ambiance du SOIR des PICS DE JADE (Léo) : on l'accorde au béton, on ne la refait pas. La pluie des NUAGES (la plus tenue). L'encre
#1c0430 des ombres de contact. Le style pixel/voxel. Toutes les créations de Léo.

⚠ COULEURS : `jZen`, `jMid`, `jHor`, `jSol`, `fog` sont en LINÉAIRE — convertir les hexa sRGB de ce fichier (c_lin = ((c+0.055)/1.055)^2.4) avant de les poser, sinon deux fois trop clair (constat de etal-nuages).
