# sans-plots — les plots de chantier retirés de la route (passe graphismes, 2026-10-14)

Sacha : « Enlève les cônes de chantier sur la route, ça ne sert plus. »
Branche `gfx/sans-plots`, copie `gfx/wt/sans-plots`, fichier `VERSION PRINCIPALE/index.html`. Quatre lignes AJOUTÉES, aucune ligne existante modifiée.

## Ce qui a changé (commit 36a3429)
1. `const PLOTS_ON=false;` — juste après la déclaration de `CONES` (à côté de `GAP_ON`, même principe : UN interrupteur). `true` = les plots
   reviennent tels quels.
2. `placeCone(cs,cl,fc)` (dans `buildTrack`) : `if(!PLOTS_ON)return;` en 1re ligne. C'est le SEUL endroit qui remplit `CONES` ; il coupe
   d'un coup les trois poses : (a) les chantiers (slaloms + lignes de bord), (b) la 2e vague « portes de frôlé », (c) les murs à porte de
   la campagne (`campPlots`). `placeCone` ne tire aucun nombre : les boucles gardent tous leurs tirages (`rnd`, `wrnd`) → la piste, les
   pads, les flaques, les nuages sont les mêmes. `villePlots()` (radars, files de pads, flaques, catadioptres, colonnes) n'est pas touchée.
3. `campPortesTick()` : `if(!PLOTS_ON)return;` en 1re ligne (voir « carrière » ci-dessous).
4. Après `CARRIERE` : la promesse `pr` du niveau `camp:4` vidée quand `PLOTS_ON` est faux.

Tout le reste du système (géométries, `mkCone`, instances `conesInstancier`/`conesVus`, choc, `FLYCONES`, `coneSnd`, frôlé) RESTE, inerte :
`CONES` vide ⇒ aucune boucle ne fait rien.

## Inventaire de ce qui dépendait des plots, et ce que j'en ai fait
| Organe | Dépendance | Décision |
|---|---|---|
| Mode classique (toutes maps/météos), orage compris | chantiers + portes de frôlé (l'ORAGE gardait ses plots exprès) | plus posés |
| Auto-école (piste `tuto`) | recevait les chantiers de la 1re vague ; AUCUNE étape (`TUTO_ETAPES`) ne parle de plots | plus posés, rien d'autre à faire |
| Parc, écran titre (piste du menu), survie | passent par `buildTrack` → `placeCone` | plus posés |
| Garage | ses « cônes de chantier » de décor n'existent qu'avec `?bazar=1` (`GAR_AERE`) | pas touché (pas sur la route, pas affiché par défaut) |
| MISSIONS (`CARNETS`, `carnetBrut`, `misVal`) | clés : coins, fruits, perfect, survie, nitro, cash, kmh, zones, tricks, gaps, chain — AUCUNE ne compte un plot, un frôlé ou une porte | rien à retirer ; aucune sauvegarde ne peut être bloquée (`SAVE.d.mis` = n / ok / best) |
| Carrière NUAGES 4 « MATIN FRAIS » (`camp:4`) | son IDÉE = 9 portes dans des murs de plots ; `campPortesTick` comptait « PORTES n / 9 » (plaque, pluck, +4 flow, aura PORTE) ; promesse « PASSE LES PORTES » | voir ci-dessous |
| Le FRÔLÉ (`frole`, `FROLE`, SLALOM ×n) | 3 sources : plots, satellites (`SATOB`, PLUIE DE SATELLITES), trafic (`VTR`, campagne ville 19) | les deux autres sources restent ; le code plots tourne à vide |
| Le choc (boucle de conduite), le rival/la meute qui les mange ou les évite, l'écart des pièces (`dodge`), `ligneBloque`, la caméra du menu | lisent `CONES` | inertes ; pièces et fruits restent à leur place d'origine (ils ne s'écartent plus d'un plot absent) |
| Textes fr/en/zh | « FRÔLÉ », « SLALOM », « PORTES », « PORTE », « TOUCHE ! », « PASSE LES PORTES » | aucun texte ne DEMANDE un plot ; entrées I18N laissées (FRÔLÉ/SLALOM servent encore aux satellites) |
| Succès / astuces / aide | aucune mention | — |

### Carrière NUAGES 4 — ce que j'ai décidé, précisément
- Les murs n'étaient QUE des plots : ils disparaissent, la porte avec eux. Le niveau n'a PAS d'objectif de portes (finir = franchir le
  portail, comme les autres) : il reste jouable et finissable ; la progression `SAVE.d.carr.nuages` ne dépend pas des portes.
- Sans mur, CHAQUE porte aurait été comptée « propre » d'office (une plaque « PORTES 9 / 9 », des plucks et du flow pour des portes
  invisibles) : `campPortesTick` ne fait plus rien. Plus de plaque, plus de gain gratuit.
- Les REPÈRES `CAMP.portes` sont GARDÉS : `campPadNon` (pas de pad à ±80 m d'une porte) et `satPassage` les lisent → le niveau garde
  exactement ses pads. Conséquence : 9 tronçons de ~160 m sans pad ni plot (route nue) — NOTÉ, rien rajouté.
- La promesse « PASSE LES PORTES » est vidée (elle n'est plus affichée depuis le 30/09, `LVL_BAN.prom:0`, mais elle ne doit pas revenir
  demander l'impossible si on rallume les promesses).
- ⚠ À TRANCHER (Sacha/Léo) : ce niveau n'a plus d'idée de jeu à lui (c'est une piste propre, trois séries de droites plates). Soit on
  l'accepte comme niveau « respiration », soit on lui donne une autre idée (portes de lumière ? pièces en ligne dans l'axe des portes ?).

## Conséquences de jeu que je n'ai PAS compensées (zone « détail » : missions/économie)
- Le frôlé de plot rendait de la nitro (.08-.16, ×1,5 pour une porte), du flow de style (4-8, NARCISSE) et 20 d'aura par frôlé (SLALOM en
  chaîne). Le plot percuté coûtait vitesse, élan, répit du flow. Tout ça n'existe plus hors PLUIE DE SATELLITES. Les réglages du FLOW
  (lois 16-19) ont été mesurés AVEC les plots : à re-mesurer si la frénésie paraît plus dure à atteindre.
- L'ORAGE avait gardé ses plots exprès (« un orage vide, sans frôlé ni FLOW ») : ils sont partis comme les autres, à la demande de Sacha.

## POUR LES AUTRES
- OBJETS / dev : la planche `dbgEssaiObjets()` liste encore « PLOT » (`objs.push(['PLOT',()=>mkCone()])`) — inutile de le retravailler.
- INTERFACE / Léo : la vignette de l'AUTO-ÉCOLE (`gvVignette`, branche `else`) dessine trois plots en pixel art (« le plot qui fait la
  tête »). Création de Léo, hors de la route : pas touchée. À redessiner si on veut que l'image dise vrai.
- PERF : `conesInstancier()` crée encore 7 `InstancedMesh` vides et `conesVus` joue sa chauffe (2 programmes compilés au menu pour rien).
  Je n'y ai pas touché (ordre des programmes, zone perf). Le jour où l'on arrache le système : `CONE_*`, `mkCone`, `coneVole`,
  `FLYCONES`, `coneSnd`, `conesListe/Pose/Vus/Zero`, la boucle de choc, `campPlots`, `dodge` (partie plots), `ligneBloque` (ligne plots).
- SON : `sfx('plot')`, `sfx('porte')` et `coneSnd` ne sonnent plus jamais.
- DOC : `VERSION PRINCIPALE/CLAUDE.md` décrit encore les plots (chantiers, portes de frôlé, plots de l'orage, niveau 4) — je n'ai pas
  le droit d'y toucher : à ajouter par l'intégrateur (« LES PLOTS RETIRÉS, PLOTS_ON »).
- Bancs des autres : `dbgPas().plots`, `dbgJadePoste('ramasse').plots`, `dbgPiste().plots` valent 0 ; `dbgAuto('plot')`/`dbgPwr('plot')`
  rendent null.

## Vérifications
- Syntaxe (`syntaxe.cjs`) : 13 scripts, 0 erreur. Garde du burn-out : OK. Diff : 4 insertions, 0 ligne existante modifiée.
- Ouverture 1 (`banc/sans-plots/courses.cjs`, 45 s, couché 844×390, UNE course qui enchaîne les couples par portail forcé) :
  nuages midi · ville orage · espace midi · jade soir → `dbgPas().plots` = 0 et `dbgPiste()` {plots 0, plotsScene 0, plotsOmbre 0} sur
  les quatre, course en 'drive', **0 erreur JS**. Captures `shots/sans-plots/<carte>-<meteo>-a|b.png`.
  À l'œil : la route n'est pas vide (pièces, fruits, pouvoirs, pads) ; aux NUAGES elle est la plus nue entre deux lignes de pièces
  (c'était déjà le cas : les chantiers tombaient tous les 340-860 m).
- NON FAIT au navigateur : la carrière NUAGES 4 et l'auto-école (script prêt : `banc/sans-plots/campagne.cjs`, dbgCampagne(4) + téléport
  avant une ancienne porte + portail ; puis save:null). La 2e ouverture a été refusée (une seule ouverture par mission cette nuit).
  Vérifié PAR LE CODE seulement : `campPortesTick` sort en 1re ligne, aucune condition de fin du niveau ne lit `CAMP.porteOk`
  (seuls `dbgCamp` et la plaque le lisaient), `TUTO_ETAPES`/`tutoTick` ne lisent ni `CONES` ni `FROLE`.

## Pour GAMEPLAY / DEBUGGING
- Le FRÔLÉ existe encore, sur autre chose que des plots : les SATELLITES de la PLUIE DE SATELLITES (`satHard` → `frole`) et le TRAFIC de
  la campagne ville 19 (`VTR`, niveau retiré de la carrière). Partout ailleurs il n'y a plus rien à frôler : « SLALOM ×n » ne sort plus.
- Le FLOW n'EXIGE jamais un frôlé (ni armement, ni triade, ni mission) : le frôlé n'était qu'UNE des sources de style/NARCISSE
  (4-8 points) et de nitro. Rien n'est bloqué ; la montée du flow au sol perd une source, et la faute « plot percuté » (-NARCISSE) disparaît.
- Journal commun : une ligne `gfx:sans-plots` ajoutée.

## À trancher par Sacha / Léo
1. NUAGES 4 « MATIN FRAIS » n'a plus d'idée de jeu (voir plus haut).
2. Compenser ou non la nitro/le flow/l'aura que rendaient les frôlés (rien rééquilibré).
3. La vignette de l'auto-école (trois plots en pixel art) et le « PLOT » de la planche dev.
