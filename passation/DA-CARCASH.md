# LA BIBLE CAR CASH — l'identité des maps et des lumières (GRAPHISME, 14/10/2026, PROPOSITION à valider par Sacha)

Sacha : « les maps et les éclairages, c'est l'identité du jeu ; il faut une vraie connexion entre chaque map, qu'on regarde le jeu et qu'on se dise : ça, c'est CAR CASH ».
Référence d'identité : **LA VILLE AU NÉON ROSE** (ville · pluie, rendue telle qu'avant la passe graphismes). Le mur des maps : `passation/graphisme-mur-des-maps.jpg`.

## Ce que dit le mur (état au 14/10, 17 h 45)
- Une seule map a une signature : la ville au néon (ciel indigo, bords de route rose et cyan, sol violet mouillé).
- Les maps de JOUR sont délavées : ciel des nuages L* 91-95 et chroma 1-2 (blanc), jade au soir chroma 6 (beige gris), toutes les brumes de jour sont blanches (#e7f2fa → #f7f0ea), la ville de jour est grise et plate.
- Les routes de jour n'ont plus aucun accent (bords ambre ou blancs, éteints de jour) : rien ne relie les maps entre elles.
- La forêt au soir a une couleur forte (corail, rose, laser) mais sans lien avec le reste. L'orbite vit à part (noir, planète).
- Saturation effective de 1,04 (ville · pluie, avant correctif) à 1,45 (jade · soir) ; exposition de l'orbite à 0,73 contre 0,95-1,17 ailleurs.

## 1. La palette signature (le trio qu'on retrouve PARTOUT)
| Rôle | Couleur | Où |
|---|---|---|
| NÉON ROSE (la marque) | #F24AA0 · magenta #FF3EC8 | bords de route, nappe, liseré de contre-jour des caisses, enseignes |
| OR (le cash) | #FFD75E · sodium #FFB04A | ligne centrale, pièces, interface, clé du soleil au soir |
| LAQUE BLEU NUIT (l'encre) | #141D3A · #22305C | ombres, vignette, ciel de nuit, plaques de l'interface |
Chaque map ajoute UN accent secondaire, le sien : ville = cyan #3EE8FF · nuages = azur #5EA8FF · jade = vert jade #4FE0A8 · forêt = ambre #FFC477 · orbite = blanc lunaire #E8EEF2.

## 2. Les règles de lumière
1. Toujours DEUX températures : une clé chaude (or, corail) et un remplissage froid (bleu, cyan). La nuit, la clé devient la lune ou les néons.
2. Un contre-jour ROSE sur les caisses (le `kick`) à toutes les heures : c'est lui qui « signe » la caisse sur n'importe quel fond.
3. Jamais de lumière blanche neutre seule. Jamais un ciel ni une brume sans couleur.

## 3. Les invariants (chaque map, chaque météo)
- **Signature de route** : bords néon ROSE et nappe (pleins la nuit et sous la pluie, ~50 % de jour, jamais blancs ni éteints) + ligne centrale OR.
- **Ciel** : jour = zénith azur saturé (chroma ≥ 35) → horizon chaud pêche/corail (chroma ≥ 15) ; soir = corail, magenta, or ; nuit = indigo/violet profond + néons.
- **Brume** : toujours teintée (L* ≤ 88, chroma ≥ 8) : bleu ciel ou pêche le jour, violette ou indigo la nuit.
- **Grade** : saturation effective 1,25-1,40 de jour, 1,35-1,50 au soir et la nuit néon ; contraste 1,20-1,32 ; vignette encre bleu nuit ; bloom sur ce qui ÉMET (néons, nitro, pièces).
- **Béton** : L* 35-50 de jour, 22-30 au soir, 14-22 la nuit ; mouillé = reflets des néons roses.

## 3 bis. Règles gravées par Sacha (14/10 au soir)
- **LA VILLE LA NUIT = ROSE, intouchable (comme le logo)** : nuit, pluie et orage de la ville gardent le rendu néon rose (`villeRose()`, `?sans=villerose`).
- **LA NUIT = BLEU ET VIOLET PURS, CLAIR DE LUNE, JAMAIS GRIS** : ciel bleu profond → indigo → violet, lune et étoiles nettes, sommets argent-bleu, ventres violets,
  mer bleu nuit lumineuse, route au reflet bleuté avec la signature rose + or (`?sans=clairdelune` pour la mer de nuages).

## 4. Ce que chaque map a le droit de varier
La géographie et les silhouettes (jamais touchées), la couleur du ciel dans les règles, l'accent secondaire, l'intensité des néons selon l'heure, la densité de la brume, la météo.

## 5. Les interdits
Gris dominant (ciel ou brume de chroma < 8) · délavé (saturation effective < 1,15) · noir et blanc · blanc qui REMPLACE une couleur (néons ou nitro blanchis, cumulus qui blanchissent tout l'écran) · fluo acide (vert ou jaune hors néons) · brume violette qui noie le JOUR (le violet est réservé à la nuit et aux néons).

## 6. Application proposée (après validation de Sacha), une planche avant/après par map
1. Villes de jour (matin, midi) : ciel azur saturé, brume teintée, signature de route rose + or, kick rose.
2. Mer de nuages de jour : sortir du blanc (zénith azur, cumulus aux ventres colorés, brume teintée), signature de route.
3. Jade (matin, midi, soir) : accorder sa palette au trio, horizon pêche au soir.
4. Forêt : garder sa force, la relier au trio (néon rose de route, or).
5. Orbite : signature de route rose + or sur le noir, exposition remontée.
Chaque étape derrière un `?sans=<nom>`, coût nul (des nombres et des uniformes, aucun programme de plus).
