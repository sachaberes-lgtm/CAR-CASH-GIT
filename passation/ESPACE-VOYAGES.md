# ESPACE — LES VOYAGES (2026-11-16) : la génération de l'orbite, une trajectoire unique à chaque partie

Demande de Sacha : « retravaille la génération de la map espace pour qu'on n'ait plus l'impression que chaque fois qu'on va dans l'espace c'est la même
chose ; des modules qui jouent avec l'endroit et l'envers ». Sur les maquettes (`passation/espace-endroit-envers-1.html`, fiche
`passation/ESPACE-ENDROIT-ENVERS-1.md` du dossier principal, non commitées) il a gardé **la roue, la petite lune, l'astéroïde percé, la nébuleuse**,
puis demandé des modules « de virage, comme des montagnes russes, de vitesse et de variation de direction, que chaque map soit unique sans niquer
l'optimisation », puis : « code-les sauf l'accélérateur », « il faut que la génération propose une trajectoire de route complètement unique à chaque partie ».

**État** : branche `espace-voyages-2026-11-16` (partie d'origin/main 2e0cce7b, v1613), **non poussée**. Tout est derrière **`?espace=voyages`**.
Sans le drapeau : les routes de toutes les maps identiques à main (empreinte, 12 graines × paliers 0/10) ; seules deux mailles vides et invisibles
de plus dans la scène (la jante et la roche, voir plus bas).

## Ce que fait le drapeau

- **Un voyage par route** (`VOY_LISTE`, orbite-voyages.js) : LA STATION (la roue), LA LUNE (la petite lune), LA CEINTURE (l'astéroïde percé),
  LE NUAGE (la nébuleuse), LE GRAND TOUR (deux géants au hasard). Jamais celui de la route d'avant (`ORB_PIOCHE.voyDer`, posé par orbPioche).
  Le voyage donne le **poids de chaque module** (ses tracés préférés ; les modules d'avant restent possibles, rares) et **son géant** : climax des
  routes longues (≥ 90 s de croisière, paliers 0 à ~6), premier temps fort des routes courtes.
- **La silhouette** (`orbVoyAxe`) : l'axe de la route ne fait plus toujours la même spirale (`derAx = sAx·TOT_AX·u`) ; chaque route tire sa forme —
  spirale (220-360°), S (100-150°, elle part d'un côté et revient), zigzag (±45-70°, 1,5-2,5 dents), vague (±60-90°), crochet (140-220° au tiers de la
  route) —, son ampleur et son sens. Avec les modules, leur ordre et leurs réglages : deux parties ne dessinent jamais la même trajectoire.
- **Le tirage** est gardé pour les six essais du directeur de rythme (`ORB_PIOCHE.vo`, remis à zéro à chaque route dans genCtrl, comme l'humeur).
- `?voyage=station|lune|ceinture|nuage|grand` impose un voyage (banc, essai).

## Les modules neufs (orbite-voyages.js, `orbVoyModules`)

| clé (`?orb=`) | famille | ce que la route fait | comment c'est tenu |
|---|---|---|---|
| `bosses` | montagnes russes | 3 bosses en descente, chacune dans un virage alterné ; sommet ~5° sous l'horizontale, creux ~45° | FIGURE (`g:1` sans `calme`) : pisteTord garde le relief du dessin, posé sur la descente |
| `pique` | montagnes russes | une crête, puis un piqué jusqu'à ~24° de plus que la descente, en tournant de 95-125° et couché à 68-78° | figure ; la fin de sa sortie tourne HORS de la marque (`i1`), comme la sortie d'une faille |
| `balancier` | virage | 3 grands virages enchaînés sans droite, la dalle à 62-69° dans chacun, d'un mur à l'autre en un virage | calme (la descente tenue), couchers d'un sommet de virage à l'autre |
| `stengel` | virage | « le dévers inversé » : un virage de 72-98° couché VERS L'EXTÉRIEUR jusqu'à 110-122° | calme, couchers |
| `marches` | direction | 2 ou 3 marches raides (~17° de plus que la descente), chacune suivie d'un palier À PLAT qui tourne de 48-64°, de l'autre côté | figure : le palier est dessiné relevé de 27°, à plat sur la route |
| `spirale` | direction | « la spirale qui se serre » : 4 arcs de plus en plus serrés (6,5 → 3,2 rP), la dalle jusqu'à 60-72°, puis 2 arcs qui s'ouvrent | calme, couchers par arc |
| `roue` | géant | on arrive couché jusqu'à ~125°, on roule dans la jante (la dalle tournée vers le moyeu) sur 125-150°, elle se relève jusqu'à ~55° | trois marques (entrée, cœur, sortie) ; le cœur porte ses repères `nu {t:'voy'}` |
| `lune` | géant | la dalle couchée VERS L'EXTÉRIEUR, ~40° → ~120° sur 125-150° de tour : la lune reste sous les roues jusqu'en dessous | trois marques |
| `asteroide` | géant | un grand virage de 75-92° dans un tunnel ; le demi-tonneau (π en ~6 s) se fait dedans ; on ressort la tête en bas | trois marques ; saut refusé dans le tunnel |
| `nebuleuse` | géant | de même, 80-96°, dans une boule de gaz | trois marques |

L'accélérateur des maquettes n'est pas codé (Sacha). Les places (`ORB_DR`), les secondes la tête en bas (`ORB_ENVS`, le budget d'envers de la route),
les noms (`ORB_NOM`, le juge), la pioche (`ORB_FIG`) et les modules en trois marques (`ORB_COMPO`) sont ajoutés aux tables d'orbite-modules.js.
Ceux qui passent la verticale comptent comme « le virage qui change de face » de la route (`VOY_FACE`). Une route courte dont le géant a retourné le
joueur prend sa rentrée à l'endroit (sinon 26 % de la route à l'envers au palier 20). La place du lacet resserré est gardée derrière le géant du climax
(sans elle, plus de raccourci au palier 0 : R6).

## Le décor (orbite-voyages-decor.js) : ajusté à la route BÂTIE, sans matière neuve

`voyDecorPose` (appelée par geantsPose, AVANT les autres géants) lit les repères du cœur de chaque géant sur la route refaite par pisteTord :
- **la roue** : la jante est un chenal LE LONG DE LA ROUTE (sol sous la dalle, lèvres de 30 m avec hublots, bandes orange, feux, coque), le reste de la
  roue suit le cercle par trois points de la route jusqu'à la brèche ; le moyeu, trois rayons hors de l'arc, deux moignons ; ce qui passerait à moins de
  ~70 m d'une autre portion de route n'est pas posé ;
- **la petite lune** : la LUNE GLACÉE des géants (`GT_LUNES[0]`), centrée là où les normales de la dalle se croisent sous les roues, rayon au ras de la dalle
  (MESURÉ en jeu : la route l'épouse à 4-7 m près) ; teinte par planète ; elle entre dans `GEANTS.lunes` (le heurt en vol) ;
- **l'astéroïde percé** : un tube de 46 m de rayon le long de la route (anneaux de lampes, cristaux), la roche centrée sur le tunnel, percée là où il passe,
  sa taille bornée par les autres portions de route ;
- **la nébuleuse** : une boule du GAZ de la comète (`GT_VOLS[2]`, la coque de la poussière de Mars), centrée sur le demi-tonneau ; dedans, le voile prend
  sa couleur (geantsTick).
La jante et la roche prennent **la matière de l'épave** (`GT_EPAVE.material`, le même programme) : aucun programme neuf à compiler, rien à chauffer au menu.
Sur `ALLEGE` (`GT_TEL`) : moins de facettes et des pas plus longs.

**Le saut refusé** (`voySautRefuse`, vol-equilibre.js) : dans la jante et le tunnel ; dans les bosses, le piqué et les marches dès que la route plonge plus
fort devant (12° de plus dans les ~2,7 s qui viennent) — un saut lancé d'une crête survolerait la descente jusqu'à la jauge vide ; dans un creux, devant
une remontée, il reste permis.

## Les preuves (2026-11-16)

- **Juge commun** (`juge-node.cjs`, 8 graines × paliers 0/10/20, `SEARCH='?espace=voyages'`) : **29/30** (l'orbite publiée v7.5 : 28/30). Seul échec :
  R7 au palier 0 (la part sautable : 66,3 % sur la pire graine, il en faut 75 ; les crêtes des bosses, du piqué et des marches, l'envers des géants).
  R1 ≤ 7,5 s (moy. 6,8), R2 ≤ 2,7 s, R3 ≤ 44°/s (p95 38-39), R5 ✓ aux trois paliers (24 noms au p0 ; au p20 le géant change d'une route à l'autre :
  jaccard 0,21, l'orbite publiée y échoue), R6 ✓ (le lacet gardé derrière le géant), R8 ≤ 18,9 %, R13 envers 7,7-11,1 %.
- **Corrigé en route, mesuré** : le tunnel et la nébuleuse en S trop doux (16 s dans la même direction) → un seul grand virage ; les approches de la roue
  et de la lune trop droites ; les bosses à ±28-40° (13,8 s dans le même cône) → 50-66° ; la fin du piqué (77°/s : le dévers de la liaison arrivait
  d'un coup) → sa sortie tourne hors de la marque ; au palier 20, géant + rentrée au plafond = 26,6 % à l'envers → la rentrée à l'endroit.
- **Sans le drapeau** : `empreinte.cjs` (12 graines × paliers 0/10) identique à main pour ville, crypto, nuages et espace ; `non-declares.cjs` : la même
  liste que main ; `garde-allege.sh` ✔ ; `assembler --verifier` ✔.
- **Dans le vrai jeu** (Chrome sans fenêtre, muet, `banc.cjs gen`) : six routes (Terre ×4, Mars, Saturne au téléphone), les quatre voyages imposés et deux
  tirés : **0 erreur**, roulées 60-70 s au pilote sans mort, décor posé. Coût du décor : la jante 7,7 k triangles (4,7 k au téléphone) en 9-11 ms, la roche
  percée 9 k en 28 ms, la lune et la nébuleuse ~1 ms (elles réutilisent des mailles existantes). Photos regardées : la roue de loin et dans la jante
  (ordi et téléphone), la petite lune enroulée par la route, l'astéroïde percé (Terre, puis Mars après retouche des tons), la nébuleuse.
- **Non fait** : les gels et les ms d'image en course (`pilote.cjs --sonde`), le tableau de coût référence / après à la règle de Sacha (le décor ajouté est
  petit mais n'est pas mesuré contre main en course), un vrai iPhone, les sauts joués à la main (le refus aux crêtes n'est vérifié que par le code).

## Commandes

```
SEARCH='?espace=voyages' node outils/banc-routes/juge-node.cjs . paliers=0,10,20 graines=1-8 [rapide=1] [detail=1]
node outils/banc-routes/empreinte.cjs graines=1-12          (sans drapeau : à comparer avec main)
node outils/banc-maps/serveur.cjs 8361 <worktree>
node outils/banc-maps/banc.cjs gen --carte=espace --meteo=matin --graines=3 --q="espace=voyages&pioche=0&voyage=lune" --audit="JSON.stringify(dbgVoyage())" --roule=70 --photos=1 --port=8361 --cdp=9561 --profil=voyages-pc --out=<dossier>
```
Crochet : `dbgVoyage()` (le voyage, sa silhouette, les modules de la route, le décor posé, les zones sans saut, les vues de chaque géant).
Après toute retouche d'un morceau : `node code/assembler.cjs --depuis-morceaux`.
