# L'accueil en ciel seul — essai (13/11, branche `accueil-ciel`)

Sacha : « pourquoi la voiture est au-dessus d'une map ? … ça serait pas plus simple de juste la mettre dans un espace où il y a un faux ciel, sans avoir à générer toute une map ? »

## Verdict

**Le gain de perf est négligeable : ne pas fusionner pour la perf.** La map sous la caisse est déjà presque entièrement retirée du dessin par `menuCull` (depuis le 07/11). L'éteindre en plus enlève en moyenne ~3,5 appels de dessin sur ~45-60 et ~10 à 15 % des triangles (et rien du tout sous la plupart des angles). Le temps de script par image ne bouge pas de façon mesurable. L'essai est poussé, sans risque et derrière un interrupteur : à fusionner seulement si Sacha préfère *l'image* qu'il donne.

Le vrai levier derrière la question de Sacha, c'est de **ne plus construire** la piste du menu (voir plus bas). C'est un autre chantier.

## Les faits établis

1. **La map sous la caisse n'est PAS la piste de la course.** C'est la *piste du menu* (`NIVEAUX[0]`, les nuages). Elle est construite au chargement, en tranches sous le serpent (`chargeTranches('piste',newTrackG,8)`, code/moteur/init.js:3), puis reconstruite d'un trait à chaque retour à l'accueil (`accueilRetour` → `rebuildMenuScene`, code/gameplay/evenements-rares.js:121 et :143).
2. **JOUER n'en a pas besoin.** Le JOUER tire la map de la course et la bâtit sous le nuage blanc du piqué : `CHUTE.sous` → `sous9` → `prebDepPrend(rebuildMenuScene)` (code/gameplay/zones-caisses.js:337-342 ; appelé dans code/interface/chute-libre.js:263). Le piste vient du **départ d'avance** (`PREB`, code/moteur/depart-avance.js), préparé au menu en tranches de 3-6 ms. La piste du menu est jetée à ce moment-là. Elle sert seulement :
   - de décor ;
   - à placer la caisse : `chutePlan` met l'ancre au-dessus du sommet de la piste (code/interface/richesse-3.js:278) ;
   - au piqué, qui « vise » la route (code/interface/chute-libre.js:138).
   Quand Sacha voit « une vraie map » en tombant, c'est déjà la map de la course, une autre.
3. **Ce qu'elle coûte à construire** (banc Mac) :
   - au chargement : 12 tranches, ≈ 510 ms ;
   - au retour à l'accueil, d'un trait : 178-402 ms.
   Sur l'iPhone 13 Pro : 650 ms d'un bloc mesurés au build 6 (code/rendu/traces-pneus.js:89), maintenant étalés sous le serpent.
4. **Ce que l'accueil dessine** (banc, iPhone 390×844 ×2, `?tel=1&palier=2`). Il dessine **43 à 77 appels**. Les nuages du titre (`CHUTE_NU`, 2 maillages transparents chacun, 13 à 43 k triangles par nuage) font l'essentiel des triangles. La caisse fait ~30 appels, plus 4 pour son ombre. Le ciel, les filets de vent et la traînée suivent.

   La map, elle :
   - 0 appel en portrait la plupart du temps ;
   - en paysage, quand le tour de caméra passe devant la route, jusqu'à 5 appels pour la route (bitume 48 k, flancs, rails, nappe, ligne) et 2 pour les pièces (10 k) ;
   - ses nuages de décor (`CLOUDS`) sont hors champ.

   `menuCull` retire déjà 88-93 maillages (≈ 600 k triangles) par image : c'est la piste presque entière. Le relevé de « ~173 appels » ne se retrouve pas ici : il comptait sans doute toutes les passes du compositeur, ou datait d'avant `menuCull`.

## Ce que fait l'essai

- **Sur téléphone seulement** (`TEL_NATIF`), et seulement à l'accueil dans le ciel (`CHUTE.on`, piqué compris). Juste avant le rendu de l'image, on éteint la piste et son décor (`trackMeshes`), ses nuages de décor (`CLOUDS`), ses pièces et le coton. Ils sont rallumés juste après.
  - Rien d'autre ne les voit éteints : la chauffe, la liaison des programmes, le départ d'avance et la logique les voient comme avant.
  - Il reste la caisse, sa traînée, le ciel du titre, ses cumulus et les filets de vent.
  - Code : `accCielCache` (code/moteur/cadence.js, section « L'ACCUEIL EN CIEL SEUL »), appelée autour du rendu (code/moteur/boucle-6-hud.js).
- La piste reste construite.
- Au bout du piqué, la course apparaît sous le nuage blanc comme avant : rien ne « pope ». Sur les photos du banc, le piqué ne montrait déjà que de la brume.
- **Ordinateur : rien ne change.**
- **Interrupteur** : `?sans=accueilciel` = comme avant.
- **Crochets** :
  - `dbgAccueilCiel()` : l'état ;
  - `dbgAccueilCiel(0|1)` : A/B dans la même session ;
  - `dbgAccueilCiel('appels')` : ce que l'image dessine, map éteinte ;
  - `'inventaire'` : les enfants de la scène ;
  - `'bati'` : le temps pour reconstruire la piste du menu.
- Version : `cashcar-v1570`.

## Chiffres avant / après

Mesures faites dans la même session, en alternance (`outils/banc-accueil-ciel/accueil.cjs`). Le Mac est chargé (charge 6-88) : les ms sont indicatives, les appels et les triangles sont fiables.

| accueil au repos | portrait avant | portrait ciel | paysage avant | paysage ciel |
|---|---|---|---|---|
| appels, moyenne sur un tour (12 angles) | 46,9 | 43,3 | 60,1 | 55,8 |
| appels, maximum | 63 | 63 | 76 | 74 |
| triangles, moyenne sur un tour | 197 k | 168 k | 393 k | 351 k |
| maillages renvoyés par menuCull | 89 | 74 | 93 | 77 |
| script par image (médiane, ms) | 0,99 | 0,83 | 0,89 | 0,83 |
| images/s (cadence du menu) | 30 | 30 | 30 | 30 |

Au départ, on a dérivé « JOUER → piqué → course 20 s → pause/reprise → mort → retour à l'accueil » dans les deux modes. Le circuit complet passe, avec **0 erreur** (`dbgErreurs` filtré sur panne|erreur|exception|boucle|promesse). La liaison des programmes n'a rien raté (`dbgLier` : 231/231 liés, 0 raté). Les à-coups du départ (200-530 ms sur ce Mac chargé) sont du même ordre dans les deux modes : les maps tirées n'étaient pas les mêmes, ce n'est donc pas comparable finement.

## Captures (`passation/accueil-ciel/`)

- `ab-portrait-avant.png` / `ab-portrait-ciel.png` et `ab-paysage-avant.png` / `ab-paysage-ciel.png` : même image figée.
- `ab-*-route-*.png` : l'angle où la route pèse le plus. À l'œil, presque aucune différence : la route est loin dessous, dans la brume.
- `temoin-pique-0..5.png` (avant) et `ab-pique-0..5.png` (ciel) : le piqué puis la course.
- `ab-course.png` et `ab-retour.png`.
- Mesures brutes : `ab.json` et `temoin.json`.

## Le vrai levier (pas fait) : ne plus construire la piste du menu

On gagnerait :
- ~0,5-0,65 s de processeur au chargement sur le téléphone ;
- 0,2-0,4 s (Mac) à chaque retour à l'accueil ;
- sa mémoire.

Il faudrait :
- donner à `chutePlan` une ancre fixe ;
- vérifier tout ce qui lit `L` et `frameAt` au menu : la caméra de l'atelier, la vitrine, `homeCielPrise`, l'auto-école et le parc, qui appellent aussi `rebuildMenuScene` ;
- garder un piqué sans route.

À chiffrer comme un chantier à part si Sacha le veut.

## Non vérifié

- Pas vu sur le téléphone : ni la chaleur, ni l'image du piqué sur un vrai écran.
- Ms de script mesurées sur un Mac partagé et chargé.
- L'atelier, la boutique et les missions ne sont pas touchés : l'essai ne vaut que pour le ciel de l'accueil.
