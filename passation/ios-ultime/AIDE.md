# Session ios-aide (13/11) — l'aide de la session de fond

Session « Optimisation iOS Kashkar » (Opus), lancée par Sacha pour assister la session de fond (Fable) pendant ses essais sur le téléphone :
prendre ce qui est long ou hors de son plan, sans toucher au téléphone, à `ios-fond`, `ios-ultime` ni `main`. Branche `ios-aide`
(worktree `~/cash-car/ios-aide`) ; chaque lot est fusionné par la session de fond. Tout est derrière ALLEGE (téléphone) avec un interrupteur.

## Lots livrés
| Lot | Interrupteur | Ce qu'il fait | Mesure |
|---|---|---|---|
| Nuages à la demande (v1568) | `?sans=nudemande` | une map sans coton ne recalcule plus les 100 gabarits de nuages | 2 recalculs → 0 sur nuages → espace → ville → nuages ; 107 Mo de tableaux gardés → 0 ; 4-6 s de processeur d'ouvrier par recalcul (Mac). C'était la pire rafale aux portails sur le téléphone (arrivée sur NUAGES après une autre map : 15-33 images longues, 1 à 4,7 s) |
| Les reprises (v1570) | `?sans=reprises` | `jadeFini` mené d'un trait rend la main toutes les 4 ms ; mode direct lu sur `jfDirect()` | grotte d'un trait 4 132 → 1 855 ms (creusement 3 204 → 824), grille et décor identiques |
| Ciel réduit + moteurs légers (v1571) | `?sans=cieltoile`, `?sans=moteursleger` | toiles 2048×512 du ciel photo rendues après envoi ; copie JS des 30 moteurs gardés jetée une fois dessinés | −12 Mo ; 40,0 → 35,7 Mo à l'accueil, plus à chaque palier |
| Les bornes rapides (v1573) | `?sans=bornes9`, témoin `?bornesverif=1` | boîtes et sphères englobantes du pré-bâti sur le tableau brut, mêmes flottants que three r128 | WebKit : 10-25× (150 000 sommets 16 → 0,83 ms) ; route d'un trait ~137 → ~99 ms ; 4 322 calculs comparés, 0 écart |
| Le lissage sans appel (v1575) | `?sans=lissevite` | le lissage du cap (jusqu'à 481 prises par point) sans appel de fonction loin des bouts | WebKit 2,5-3× (40 → 16 ms par route au moteur élevé), identique élément par élément |

## Ce qui a été mesuré et écarté
- **Générateurs du fil principal sous JSC** : sans objet. Un générateur n'est ×10 lent que mené d'UNE seule entrée ; repris toutes les 4 ms
  (le pré-bâti en tranches) il va à +9 % du plat (banc grotte g777 : 417 / 454 / 4 178 ms).
- **Sons en mono** : 189 des 199 sons stéréo de la banque ont deux canaux différents ; la banque décode déjà à la demande.
- **Échantillonnage de la courbe** (cache des coefficients par segment) : identique au bit près (66 560 points), mais sous WebKit il ne coûte
  que ~4 ms pour 20 000 points et ne gagne que 1,3× → non livré. Le profil de Chrome l'avait surévalué : **ne jamais choisir un lot sur un
  profil de Chrome seul, toujours mesurer sous WebKit** (outils ci-dessous).

## La grande vitesse : ce qu'on sait
- Sur la même piste, pré-bâti coupé, la boucle ne grossit pas avec la vitesse (Chrome : 9,5 ms à 656 km/h, 8,2 ms à 1 658 km/h).
- C'est le pré-bâti de la map d'en face : à ~2 000 km/h une map dure ~13 s et la tranche grossit pour finir avant le portail (« le rythme
  qui suit le reste », jusqu'à 14-16 ms par image). Coût par map sous WebKit (Mac) : grotte 310-810 ms, jade 350-590, espace 155-425,
  canyon 230-370, nuages 185-297, ville 160-190.
- La ROUTE en est le gros (WebKit, route d'un trait, moyenne de 6) : 154 ms = génération 39 (canyon : 14 essais de route, règle de jeu),
  rails/nappe/ligne 29, cadres/torsion/lissage 28, tranches et LOD du bitume 25, normales du bitume 14, sommets 8, flancs 4, courbe 4.
- L'échange d'état de chaque tranche (`prebEchange` + `prebObj`) : ~0,14 ms par tranche sous WebKit (≈ 34 ms par grotte, 236 tranches).
- Pistes restantes (chacune 5-10 % de la route, toutes à vérifier au bit près) : indices des LOD construits en tableau typé au lieu de
  `ix.push` + `setIndex(Array)` ; `prebObj` sans Set ni concat ; normales du bitume.

## Outils
- `outils/banc-memoire/` : empreinte réelle du processus WebContent (WebKit Playwright + `footprint`) et inventaire par créateur ;
  `--images 1` (images longues et constructions datées) ; `gc=1` = alerte mémoire de WebKit.
- `outils/banc-vitesse/` : `profil.cjs` (boucle à basse et haute vitesse), `route.cjs` (routes d'un trait), `prebati.cjs` (pré-bâtis en tranches).
- Méthode WebKit sans profileur : une copie instrumentée de `index.html` dans le scratchpad (liens symboliques vers `VERSION PRINCIPALE`
  sauf `index.html`), servie par `memoire.cjs --jeu <dossier>` ; des marqueurs `window.__prM('phase')` entre les étapes, la route bâtie
  d'un trait (`dbgSaut`) pour que le temps entre deux marqueurs soit du calcul.

## Pièges rencontrés
- Le crochet post-commit pousse CHAQUE commit : jamais de commit provisoire (un « WIP » est parti tout seul, neutralisé dans 4133bf7cc).
- Le Mac a dépassé une charge de 180 cet après-midi (autres sessions, simulateur, Chrome de banc) et le disque était plein (3 Go) :
  43 worktrees propres et fusionnés retirés avec l'accord de Sacha (16 Go libres). Mesurer seulement charge < 15, sinon compter.

## En attente : LE RYTHME EN PAS (13/11 soir, mis de côté à la demande de Sacha)
Sacha : « ne travaille pas sur la génération des routes pour l'instant, d'autres sessions vont pousser ». Le correctif est prêt et vérifié, mais NON
appliqué : `passation/ios-ultime/rythme-en-pas.patch` (sur la tête cec60f9f9, v1578 ; à réappliquer par `git apply --3way` quand les sessions de la
génération auront poussé, puis tout revérifier).
- Ce qu'il fait : dans le pré-bâti seulement (rythmePas() : ALLEGE, `?sans=rythmepas`), le meilleur-de-N du directeur de rythme (genCtrlG, genJadeG →
  rythmeMeilleurG / rythmeCoeurG) rend la main entre deux essais et avant le rejeu ; la torsion (pisteTordPropreG) entre deux tirages ; une pause entre
  génération et torsion. rythmeMeilleur, genCtrl, genJade, pisteTordPropre restent des fonctions d'un trait (les bancs node, les autres appels).
- Vérifié : empreintes node identiques avant/après (outils/banc-routes/empreinte.cjs, ville, crypto, nuages, espace, paliers 0 et 10, 12 graines) et
  bilan de torsion de la grotte identique (grotte-torsion.cjs, palier 10, 6 graines) ; témoins WebKit `?rythmeverif=1` en pré-bâti réel à ~2 000 km/h :
  génération 18 fois et torsion 7 fois refaites d'un trait et comparées, 0 écart.
- Mesuré (WebKit, Mac, 8 portails, étapes du pré-bâti de plus de 8 ms) : pire étape 39 ms (génération + torsion d'un seul tenant) → 23 ms ; la
  génération ne dépasse plus 10-14 ms ; reste la torsion d'un seul tirage (≤ 23 ms). Sur le téléphone bridé (build 105, Fable) les étapes d'un
  seul tenant faisaient 165-262 ms.
