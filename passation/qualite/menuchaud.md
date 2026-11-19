# Lot « menuchaud » : le menu au chaud (18/11)

Branche `qa/menuchaud`, partie de `origin/qa/voituredabord` (63437297). Rien n'a été mis sur main.

Ce que Sacha a dit : « sur l'interface, le jeu, tout ça, il y a encore pas mal de freeze » et « je préférais que ça soit la map qui baisse en qualité en priorité et que la voiture soit toujours le plus nette ».

## Ce que fait le lot

Le lot ne joue que sur un vrai téléphone (`TEL_NATIF`), à l'accueil, au garage et à la boutique (la vitrine HD, `VHD`). Il s'allume quand l'état thermique est SERIOUS ou plus : `window.__ccThermique` ≥ 2, ou le capteur lu par le gouverneur (`MOB_S.thermo`).

- **La voiture ne change pas de résolution.** La toile de la vitrine reste à la densité 2 (1688×780 au banc) et n'est pas réallouée.
- **Le décor baisse.**
  - La carte d'ombre passe de 1024 à 768. C'est une taille que `QL.ombres` garde déjà, donc rien n'est réalloué au retour.
  - Le halo passe à la moitié de sa résolution (cible 355×164 → 177×82 au banc), avec 2 étages au plus. À serious, le gouverneur avait déjà mis 2 étages.
- **Le changement d'ombre et de halo se fait hors de la vue.** Il a lieu sous le volet (`ecranWipe`, quand il couvre l'écran) ou à l'entrée de la vitrine, jamais devant le joueur.
- **Au repos, le menu passe à 15 i/s.** Après 10 s sans geste, il tourne à 15 i/s réguliers (66,7 ms). Avant le lot, à serious, il restait à 30 i/s pendant une minute.
- **Le premier toucher relance tout.** Il remet 60 i/s pendant 0,35 s (HC GESTE), puis 30.
- **Pas de 15 i/s sous le doigt.** Un doigt sur la caisse (garageDrag, le donut BURN, la boutique GBQ) compte toujours comme un geste.
- Rien ne change à froid (nominal, fair), sur l'ordinateur ni avec `?menu=max`.

Interrupteur : `?sans=menuchaud` rend l'ancien comportement.

Crochet de banc : `dbgMenuChaud()` donne l'état.
- `dbgMenuChaud(1)` ou `dbgMenuChaud(0)` force l'état chaud ou froid et l'applique tout de suite.
- `dbgMenuChaud(null)` rend la main au capteur.

Fichiers touchés :
- `code/rendu/nettete-qualite.js` : la section MCH, `vhdBascule`, et la part du halo dans `qlPose` ;
- `code/rendu/triptyque-bloom.js` : le plafond d'étages `IMG_DYN.mchMips` ;
- `code/moteur/cadence.js` : `hcRepos` ;
- `code/economie/aura-banque-contrats.js` : `mchVolet()` quand le volet couvre l'écran.

## Preuves au banc (Mac, Chrome sans fenêtre, muet, sous le verrou)

Réglages du banc : iPhone 13 Pro émulé (844×390, DPR 3, tactile, UA iPhone, donc `TEL_NATIF` vrai), `?appareil=iPhone14,2`, réglage BASSE. Le chaud est simulé avec `dbgThermique(2)` et `__ccBranche=2`.

Outils : `outils/banc-menuchaud/` (`menuchaud.cjs`, `tout.sh`, `compare.py`). Relevés bruts : `outils/banc-menuchaud/releves/`.

| À l'accueil | froid, lot | froid, avant | chaud, lot | chaud, avant |
|---|---|---|---|---|
| toile (DPR) | 1688×780 (2) | 1688×780 (2) | **1688×780 (2)** | 1688×780 (2) |
| carte d'ombre | 1024 | 1024 | **768** | 1024 |
| cible du halo | 355×164 | 355×164 | **177×82** | 355×164 |
| i/s au repos, avant 10 s | 30,9 | 30,9 | 30,8 | 30,9 |
| i/s au repos, après 10 s | 30 | 30 | **15** (66,7 ms médiane, p10 65,4 / p90 67,8) | 30 |
| 1re image après un toucher | 23 ms | 22,5 ms | 27 ms | 27,7 ms |
| écarts dans les 300 ms après un toucher | 16,7 ms | 16,9 ms | 16,5 ms | 16,6 ms |

- **Le repos à 15 i/s : prouvé.** Au garage aussi : juste avant le donut, la cadence était à 66,7 ms, avec le lot à chaud.
- **La reprise au toucher : prouvée.** La première image arrive en moins de 30 ms, puis les images s'enchaînent toutes les 16,6 ms. C'est pareil avec et sans le lot.
- **Les donuts : prouvés dans les quatre cas** (lot ou avant, froid ou chaud). Le test se fait au garage, après 12 s de repos : doigt tenu 1,1 s sur la caisse, puis glissé pendant 1 s. Résultat :
  - `BURN.on` vaut vrai et le burn-out arrive au bout (k = 1) ;
  - pendant le geste, une image toutes les 16,6 ms (60 i/s), même partie du repos à 15 i/s.
- **Le volet : prouvé.**
  - Quand l'état change sans volet, ni l'ombre ni le halo ne bougent.
  - Après GARAGE, ils passent à l'état froid (1024 / 0,5). Après ACCUEIL, au chaud, ils passent à l'état chaud (768 / 0,25).
  - La toile ne change jamais.
- **L'ordinateur n'est pas touché : prouvé.** Sans émulation de téléphone, `dbgMenuChaud().actif` est faux, même après `dbgThermique(2)`.
- **Le coût par image sur la puce du Mac : aucun gain mesurable.** Mesure en A/B alterné dans la même session, 8 blocs de 5 s, chrono de la puce (`dbgCout`) :
  - médiane : 3,88 ms avec le lot contre 3,49 ms avant ;
  - p90 : 8,76 ms contre 8,06 ms.

  Les blocs varient de 2,85 à 4,35 ms. Le bruit cache tout : la puce du Mac est trop rapide pour qu'une ombre et un halo se voient.

  Ce qui est sûr se compte : 0,46 M de texels d'ombre en moins (1,05 M → 0,59 M), une cible de halo quatre fois plus petite, et surtout **deux fois moins d'images** au repos à chaud.
- **La voiture : même résolution, mais pas le même pixel.** Pour la comparaison, le temps est figé (rAF coupé, `performance.now` arrêté, chute figée par `dbgChute({fige})`). On compare un rognage de la caisse (`releves/planche-caisse.jpg`). Écart moyen sur 255 :
  - deux images froides de suite : 2,7 (le bruit : les roues tournent, les nuages bougent) ;
  - froid contre chaud : 5,9 ;
  - froid contre retour au froid : 4,0.

  La différence sur la caisse est une lueur douce : c'est le halo en ½ résolution qui baigne la carrosserie. Les arêtes, elles, ne bougent pas. **La voiture n'est donc pas identique au pixel.** Sa netteté (toile, DPR, pas de réallocation) est identique.

## Pas prouvé, à voir sur le téléphone

- **L'effet sur les freezes et sur la chaleur n'est pas prouvé.** La boîte de vol ne couvre pas encore les menus. Il faudra comparer, avec ou sans `?sans=menuchaud`, la chaleur au départ de la course suivante et les gels au menu.
- **Les 15 i/s doivent passer devant Sacha.** C'est la question du plan : « au menu chaud, 10 s sans toucher, le décor à 15 i/s ? ». Avant le lot, les nuages de l'accueil à 15 i/s lui avaient paru saccadés (13/11). Si ça ne lui va pas, seul le repos peut être retiré : l'ombre et le halo se gardent.
- **Pour une voiture identique au pixel, il faudrait garder le halo plein.** Le gain serait alors plus petit : l'ombre seule, plus le repos.
- La bascule sous le volet est prouvée avec GARAGE et ACCUEIL. Les autres volets (boutique, missions) passent par le même `ecranWipe`, mais n'ont pas été essayés un par un.
