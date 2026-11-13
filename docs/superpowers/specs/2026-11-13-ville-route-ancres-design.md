# La route de la ville : moins de droites, plus de modules, des ancres dans le décor

Date : 2026-11-13 · Branche : `ville-route-ancres-2026-11-13` (worktree sur `origin/main` v1537) · Taille : un projet, en deux étapes.

## Intention
Demande de Sacha : « pousse la génération de la route dans la map ville : il y a trop de tout droit tout le temps, les mêmes modules, et ça n'interagit pas assez avec l'environnement ».
« La map ville » = CRYPTO CITY, qui est la même ville le jour (`MC==='crypto'`) et la nuit (`MC==='ville'`) dans `genCtrl1` (`code/maps/ville-entree.js`). La ville vitrée n'est plus une map.
Pourquoi : la route se lit comme un ruban posé au-dessus d'une ville qui n'en sait rien. Le joueur sent la répétition (mêmes gestes, mêmes souffles) et ne sent jamais la ville.

## État mesuré par la lecture du code (origin/main v1537)
- Paquet de modules de la ville de nuit : `mAngles, mBretelle, tSlalom, tCorde, mCarrefourS, mPont, mParking` ; Crypto City de jour : `mBougie, mDents, tSlalom, tEpingle, mEscalier, mKrach`. Climax : `mRondPoint` (nuit), `mMoon` (jour). Deux temps forts sur trois sont déjà un raccourci (`vPetit`/`vSaut`, « la descente des villes », 2026-11-11) : **on n'y touche pas**.
- Les droites viennent de la règle elle-même : `RYTHME_V2.droiteFMin=[.05,.22]` (5 à 22 % de la route en droites franches, voulues) et `briqueSouffle` (droite franche de 1,8-4 s sept fois sur dix, genre VITESSE jusqu'à 3,4 s).
- La ville est bâtie APRÈS la route (`buildVoxCity`, `code/maps/jade-balade.js`) et ne fait que l'éviter (`tourLibre`, règle d'or). Une seule interaction existe : `FILETMARK.air` → `AIRZ` rabat les tours sous la trajectoire des sauts. Aucun autre module ne dit quoi que ce soit à la ville ; le pont n'a rien à ses bouts, le rond-point rien en son centre.
- `FILETMARK` est déjà échangé par le pré-bâti (`piste-prebati.js`) : c'est le bon porteur d'ancres.

## Buts
1. **Moins de tout droit** : cible propre aux villes (`droiteF` ≈ [.03,.12]), souffles de 1,2-2,6 s, plus de balayages. Mesure : part de droites franches, plus longue droite (s), notes du directeur de rythme (pas pires qu'avant).
2. **Plus de modules, qui ne se ressemblent pas** : 3 nouveaux modules à ancre dans les deux paquets (ville et crypto) + `mTour` et `mCarrefourS` rendus aux deux paquets. Aucun module deux fois de suite (déjà garanti par le paquet mélangé).
3. **Des ancres** : un module déclare dans `FILETMARK` une ancre (`anc`: type, x, z, rayon libre, y) ; `buildVoxCity` la lit et bâtit un élément du décor à cet endroit.

## Non-buts
Générer la ville avant la route (approche C, écartée) · toucher aux modules à raccourci, à la physique, aux pièces, à l'économie · la ville vitrée · tout ce qui retire de l'image sur téléphone.

## Anti-buts (un échec même si « ça marche »)
- Une tour qui touche la route ou coupe le vol d'un saut (règle d'or et `AIRZ` restent prioritaires).
- Une route moins jouable (virage infranchissable, spirale subie, croisement serré : `rythmeNote`, `routeRecoupe`, `croise.cjs`).
- Moins de raccourcis qu'avant (deux temps forts sur trois).
- Un coût en image sur téléphone (ancres = quelques volumes, pas de matière ni de programme de plus).

## Approches (choisie : B)
- A. Route seule : sûre mais la route ne réagit toujours pas au décor.
- **B. Route + ancres (choisie)** : A, puis la ville lit les ancres. Étape 2 : le tunnel dans une tour.
- C. La route suit les tours existantes : écartée (ordre de génération, pré-bâti, risque).

## Le dessin (étape 1)
- **Ancres** : `FILETMARK.push({anc:[{t:'geante',x,z,r,y}]})`, coordonnées du plan (stables : les lissages ne déplacent que `y`). Dans `buildVoxCity`, après les repères : pour chaque `geante`, une tour repère (code des `DZ.rep`) centrée en (x,z), demi-diagonale ≤ `r` − marge, passée par `tourLibre`, toit au moins 120 m au-dessus de la route la plus haute du module, mât et couronne comme les repères. `pile` : un fût sous le tablier du pont. `AIRZ` gagne si les deux se chevauchent.
- **Modules** (rayons ≥ 1,75 rP, longueurs × LV, hasard `rf`) :
  - `mSlalomGeantes` : 4-5 virages alternés de 70-90°, une géante au centre de chaque virage (la route serpente entre les tours) ;
  - `mEpingleTour` : un demi-tour de 170-190° autour d'une géante, avec son altitude qui descend ;
  - `mTour` (existant, de la vitrée) : 300-340° autour d'une géante ;
  - ancres ajoutées à `mRondPoint`, `mParking`, `mPont` (piles).
- **Souffles** : un réglage `RYTHME_CIBLES.ville/crypto.droiteF` pris en compte par `rythmeCible`, des souffles plus courts et plus de balayages quand `VRAC`.
- Tout derrière `VILLE_ANCRES` ; `?sans=villeancres` rend la route d'avant au tirage près.

## Étape 2 (après vérification de l'étape 1) : le tunnel
`mTunnel` : un balayage cale le cap sur un axe, puis 180-240 m plats au travers d'une tour creusée (deux murs, un toit, un pied, des volumes alignés sur la trame). Touche la collision (`villeHeurt` lit les mêmes volumes), l'audit (`dbgVilleAudit` : exempter les murs), le rendu et la caméra (toit à 30 m). Décidé seulement quand l'étape 1 est jugée.

## Vérification
`node code/assembler.cjs` · `outils/banc-routes/{toutes.mjs,v2.cjs,croise.cjs}` (fiche, notes, recoupements) · une course headless en ville de nuit ET Crypto City de jour AVEC photos (`banc-course`, `banc-graphismes`) · `dbgVilleAudit()` : `dans`=0, `frole`=0 · `cashcar-vNNN` +1 dans `sw.js`.

## Choix faits par moi (à contrôler)
Trois nouveaux modules et leurs dimensions · cible `droiteF` [.03,.12] · géantes seulement aux modules qui tournent autour d'un centre · tunnel reporté à l'étape 2 · publication non faite sans votre feu vert.

## Réponses au contrôle du constructeur (mes choix, tous réversibles)
- **Pré-bâti** : la route pré-bâtie est calculée dans la session, jamais conservée d'une version à l'autre (`piste-prebati.js` sauve et rend `FILETMARK` en mémoire) : pas de montée de version ; les ancres voyagent avec `FILETMARK`.
- **Conflit d'une ancre** : si `tourLibre` refuse la géante, on la rétrécit deux fois (× 0,8) puis on l'abandonne ; sous un `AIRZ`, le saut gagne (on l'abandonne). Les marges des modules (rayon libre = R − demi-route − 24 − 10 m) sont calculées pour que le cas normal passe ; l'audit compte les ancres posées et abandonnées (cible : ≥ 90 % posées au banc).
- **`?sans=villeancres`** : route d'avant au tirage près. Les nouveaux modules ne sont pas dans les paquets, la cible `droiteF` n'est pas surchargée, aucun tirage `rf` de plus.
- **Fréquence** : une géante au moins par route quand elle tient : le premier module de chaque paquet mélangé est un module à géante.
- **Barre de réussite** : relative. Je mesure d'abord la ligne de base v1537 (notes, droites, recoupements), puis je compare : pas de note pire, moins de droites franches.
- **`y` de l'ancre** : l'altitude de la route au centre du module ; le pied d'une tour ou d'une pile est celui des autres tours (`b`), le toit se règle sur la route la plus haute du module.

## Laissé au constructeur
Les rayons et hauteurs exacts, le nom des champs, l'ordre dans les paquets, le réglage fin des cibles au banc.
