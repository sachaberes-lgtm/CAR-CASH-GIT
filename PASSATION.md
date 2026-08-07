# CASH CAR — passation de session (mise à jour 2026-08-05)

## Le projet
- **Un seul fichier** : `index.html` (~8 500 lignes, HTML+CSS+JS mélangés — c'est voulu, ne pas découper).
- **Three.js r128** via CDN. **Aucun build**, aucune dépendance.
- Dossier : `/Users/mulei/Downloads/CAR CAHS V3`
- Tester : `python3 -m http.server 8000` puis `localhost:8000`.
- **Git en place, ~40 commits.** `git log --oneline` pour l'historique, `git checkout <id> -- index.html` pour revenir.
- `CLAUDE.md` = doc technique du jeu (piste, nuages, biomes, audio, moteurs, économie…).

## ⚠ LE PIÈGE QUI FAIT PERDRE UNE HEURE
Le jeu enregistre un **service worker** (PWA) sur l'origine. Il sert des **copies périmées** :
une simple F5 peut montrer une version d'hier, et un `fetch('index.html')` renvoie 16 Ko de vieille
page au lieu des 570 Ko réels. Symptôme classique : « ton correctif ne marche pas » alors qu'il est
bien dans le fichier.
- Dans le navigateur : **rechargement forcé (⇧⌘R)**.
- En code : ajouter une **URL unique** (`index.html?x=`+Date.now()), c'est ce que fait `moteurs.html`.

## LES DÉCISIONS DE DESIGN À NE PAS REFAIRE
1. **Les PIÈCES font monter le MOTEUR** (pas les fruits — eux ne servent qu'au boost).
2. **La VOITURE est purement COSMÉTIQUE.** Ni vitesse, ni valeur de pièces, ni tenue de route, ni
   timbre moteur. Elle ne change plus en pleine partie. *(Trois fuites ont été bouchées : l'overdrive
   suivait le niveau de caisse, `spec.turn` donnait un meilleur braquage aux caisses tardives, et
   les bots de Survivant roulaient avec la fiche de la caisse équipée.)*
3. **On repart toujours en bas de l'échelle** : moteur rouillé + **1,61 €**. La CARROSSERIE, elle,
   est celle choisie au garage — le bouton ÉQUIPER sert.
4. **LE BRUIT DU MOTEUR, C'EST LE MOTEUR.** Jamais la caisse. *(Le timbre était bien rechargé depuis
   le palier, mais la boîte de vitesses, le ralenti et les crépitements lisaient encore `ENGINES[level]`.)*
5. **Pas de séries de moteurs identiques.** Deux paliers voisins doivent différer visiblement.
   Vérifiable par script — voir plus bas.

## OÙ EST QUOI (repères dans index.html)
| Sujet | Repère |
|---|---|
| Les 30 moteurs | bloc balisé `/* <<<MOTEURS>>> … <<<FIN MOTEURS>>> */` |
| Fiche visuelle par palier | `ENG_LOOK` (architecture, cylindres, turbos, ailettes, pièces) |
| Données de palier | `ENGINE_TIERS` (nom, desc, coins, push, res, cyl, col, flam) |
| Matières génératives | `MAT9` (alu, carbone, fonte) et `M9` (les matériaux) |
| Constructeur 3D moteur | `mkEngine(i)` + `collecteur9()` / `bobines9()` |
| Les 15 silhouettes de caisse | bloc `<<<VOITURES>>>` → `SHAPES` (une entrée = une caisse) |
| Vignette en jeu + écran de fin | `engVigRender()` |
| Déblocage des caisses | `CAR_UNLOCK`, `carUnlocked(i)`, `carScan()` |
| Flux de pièces | `spawnPickups()`, facteur `rich` |
| Animation de palier | `addCoins()` → `engSwapT` + `engSwapSnd()` |
| Vol : inclinaison / ailerons | `airBank`, `AIR_BANK_MAX`, `AIR_BANK_RATE` |

## LES TROIS ATELIERS (pages autonomes)
- **`moteurs.html`** — revue des 30 moteurs. ⚠ il ne recopie pas le jeu : il **lit `index.html` au
  chargement** et en extrait le bloc balisé. Impossible qu'il dérive. Bouton **« LES 30 »** = planche
  contact, la seule vue qui montre si deux paliers se ressemblent trop.
- **`voitures.html` — L'ÉTAL DES VOITURES** — même principe pour la gamme (bloc balisé
  `<<<VOITURES>>>` + `CARS` + `CAR_UNLOCK`). Quatre vues : showroom, **planche contact**,
  **SILHOUETTES** (profil noir, échelle COMMUNE à toute la gamme : une caisse courte se voit courte) et
  **DOUBLONS** — le recouvrement mesuré de chaque paire de profils, classé. C'est la page à ouvrir
  AVANT de toucher à une carrosserie, et à rouvrir après pour voir si le chiffre a bougé.
- **`atelier-rouille.html`** — les 3 propositions du moteur rouillé + les régimes RALENTI / ROULE /
  BOOST. C'est là que vit le prototype de flamme à 3 couches (coque + cœur + halo), meilleur que
  celui du jeu.

## HOOKS CONSOLE
`dbgTier(n)` rejouer un passage de palier · `dbgEngine(i)` prévisualiser un moteur ·
`dbgPieces(z)` densité de pièces par zone · `dbgHudCar()` état vignette/flamme/chauffe ·
`dbgJet()` signature d'échappement (plume, ruban, arc-en-ciel, hélices) ·
`dbgState()` état interne (dont `engTier`, `coinsGot`) · `dbgStep(n,ms)` avancer la boucle à la main
(indispensable si l'onglet est en arrière-plan) · `dbgGap()` `dbgBio()` `dbgCar(i)` `dbgFx()`

## CE QUI A ÉTÉ FAIT (dernières sessions)
- **30 paliers moteur** (au lieu de 10), courbe de coût ×1,40 → ×1,10 avec paliers-cadeaux.
- **Déblocage des caisses** par conditions persistantes, 3 familles mélangées (record d'argent /
  palier moteur / défis nommés). Clause de grand-père pour les caisses déjà gagnées.
- **Traduction FR/EN** (dictionnaire `I18N`, fonction **`TR()`** — ⚠ **pas `T`**, déjà pris par le
  tableau des tangentes de la piste : la collision fait planter tout le script au parsing).
- **Matières génératives** d'après références réelles : alu de fonderie, inox poli (chrome = envMap +
  shininess, pas une texture), fibre de carbone (sergé 2/2 tissé par le code), fonte rouillée
  réservée aux 2 premiers paliers.
- **Collecteurs tubulaires** qui serpentent, bobines d'allumage, boulons de culasse.
- **Vignette moteur** en jeu (sans cadre) + **le moteur atteint s'affiche en fin de partie**.
- **Le moteur vit** : tremble au régime, rougit et crache une flamme au boost.
- **Animation de changement de palier** : clé à chocs + clanks + démarreur, étincelles de soudure au
  capot, vignette qui s'emballe.
- **Flux de pièces indexé sur la progression** : 20 pièces/1000 m en zone 1 → 99 en zone 6.
- **Le vol se pilote à l'INCLINAISON (2026-08-05)** : le braquage commande une inclinaison qui
  s'établit en ~0,2 s, et c'est elle qui fait tourner — plus de lacet instantané, et la **rôtissoire
  est supprimée** (la caisse tournait sur son axe à 172 °/s en permanence, ce qui rendait les ailes
  absurdes). Les ailerons se braquent en opposition. ⚠ gameplay préservé : à inclinaison pleine la
  formule de lacet est identique à l'ancienne, seuls l'entrée et la sortie de virage changent.
  `AIR_BANK_RATE` est le bouton « ça tourne trop direct », `AIR_BANK_MAX` ne change que l'angle vu.
- Bugs corrigés : 1,61 € au menu **et** au départ, centimes invisibles, tremplins qui bloquaient,
  traversée de route, volant mort en vol vertical, rectangle à l'horizon, soleil terne.

## EN ATTENTE / PROCHAINS CHANTIERS
1. **LE SON DES MOTEURS — jamais commencé, et c'est le plus gros manque.** Les 30 paliers se
   partagent les 24 timbres de `ENGINES` par une simple règle de trois. Il faut une vraie palette :
   un 3-cylindres qui tousse, un V12 qui hurle, un réacteur qui souffle. ⚠ **Je n'ai jamais pu
   juger le son moi-même** (pas d'écoute depuis la session) : à valider à l'oreille.
2. **Les paliers 20-23 se ressemblent encore** en planche contact (toutes des « flèches »). Il
   faudrait faire varier la FORME du collecteur/de la tuyère, pas seulement ses accessoires.
3. **La flamme de boost du jeu est modeste** — un seul cône. Le prototype à 3 couches de
   `atelier-rouille.html` est meilleur : à porter si ça vaut le coup à 200 px.
4. **Équilibrage à jouer pour de vrai** : les seuils `cash` de `CAR_UNLOCK` (2 500 → 250 M) et la
   rampe de pièces sont posés à l'estime.
5. **Le boost suit le moteur** (`push`). Le user a évoqué le lier à la VOITURE — non tranché, et ça
   contredirait la décision n°2.
6. **Silhouettes des voitures — FAIT (2026-08-05).** La gamme est passée de **24 à 15 caisses, une
   silhouette par caisse**, déclarée dans `CARS[i].shape` et montée par le registre `SHAPES`.
   Mesuré dans l'étal : de **20 paires ≥ 90 % de recouvrement (pire : 99,0 %)** à **0 paire ≥ 80 %,
   pire cas 78,0 %**. Trois caisses fantastiques d'après les planches du user (ACIDE le tuner au
   capot vitré, CHAT POP-TART, REQUIN à bulle et hélices) avec des matières GÉNÉRATIVES (`MATV`),
   **offertes d'entrée** (`{k:'prem',v:0}` — un `0` à passer à `1` le jour où elles se paient).
   **Les signatures sont faites** (2e passe) : `spec.fx` donne à chaque caisse sa plume, son ruban
   et son reflet au sol, l'arc-en-ciel du CHAT POP-TART a son propre ruban à 7 rangées, et les
   hélices du REQUIN tournent. ⚠ **RÈGLE POSÉE PAR LE USER** : ces effets ne s'allument QU'À LA
   NITRO — au filage, tout le monde garde la plume orange commune. Et la RÉSERVE BLEUE efface
   toutes les signatures : c'est un signal de jeu, pas une décoration.
   ⚠ **CE QUE JE N'AI PAS PU JUGER** : le RENDU de l'arc-en-ciel (largeur, densité des bandes,
   lisibilité à 400 km/h). L'état est vérifié par `dbgJet()` — il s'allume et s'éteint au bon
   moment — mais `dbgStep` désynchronise la caméra de poursuite, donc aucune capture propre.
   **À valider à l'écran, manette en main.** Reste aussi : les descriptions des 9 caisses
   supprimées ne sont pas recyclées.
7. **`#carInfo` est masqué** (`display:none!important`, choix « HUD épuré ») : le nom de la caisse
   conduite n'apparaît nulle part en jeu. À rallumer ou à assumer.

## MÉTHODE — ce qui a marché
- **Mesurer avant de corriger.** Presque tous les vrais bugs de ces sessions ont été trouvés par un
  chiffre, pas à l'œil : les séries de moteurs identiques (13 paliers sur 29), l'échappement manquant
  (11 paliers sur 30), la flamme invisible (le remplissage BAISSAIT au boost), les centimes
  invisibles (alpha 149 sur les bords). Écrire le test AVANT le correctif.
- **Mettre la règle dans le code, pas dans la table.** L'échappement manquant venait d'un oubli
  répété entrée par entrée ; la garantie est maintenant dans le constructeur.
- **Deux ou trois objectifs à la fois.** Les longues listes multiplient les effets de bord.
- **Exiger une capture** pour tout problème d'apparence.
- Le jeu **se met en pause quand l'onglet est masqué** : en test automatisé, forcer la reprise.
