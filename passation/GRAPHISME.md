# PASSATION — session GRAPHISME (monde 3D de CASH CAR) · 14/10/2026, ~13 h 40, Mac → PC

La branche est `gfx-integration`, sur CAR-CASH-GIT. Elle contient TOUT le travail graphisme vérifié, avec `assemblage` T7 (d8af462) fusionné.
Ne jamais pousser sur `main` : c'est la publication, et c'est Sacha qui décide. Ne jamais pousser en force.
Zone : le MONDE 3D seulement (ambiances, lumières, shaders, matières, ciel, brume, post). Le HTML, le CSS et le HUD sont à INTERFACE.

## 1. CE QUI EST FAIT (intégré dans `gfx-integration`, chaque chantier coupable par `?sans=<nom>`)
| Chantier | Ce que ça change | Coupure |
|---|---|---|
| Route béton | Sol en béton brut mat, gris minéral. Décision de Sacha. Réglages : `BETON`, `ASPH_K .57`, et `rtK` par ambiance pour la clarté de la route. | — |
| Plots | Plus aucun cône de chantier sur la route (`PLOTS_ON=false`). | — |
| Sapèques | Au JADE, des pièces chinoises en laiton percées d'un vrai trou carré (`sapequePeint`). | — |
| Étalonnage des 22 couples | Une ligne `Object.assign(BIOMES.x,…)` par ambiance, dans le bloc « ÉTALONNAGE » (~l.18690-18760), avec ses sections MER DE NUAGES, VILLE, JADE, ORBITE et COUCHE COMMUNE. | — |
| Façades de la ville | Plus de fenêtres allumées en plein jour. | `?sans=facades`, `?sans=neonville` |
| Bords de route | Fin du néon de bord. Flancs de la dalle en béton. | `?sans=bords` |
| Mer de nuages, nuit et orage | Nuits lisibles, orage en ardoise. | `?sans=mernuit` |
| Jade, nuit et orage | Silhouettes d'estampe sur ciel teal. | `?sans=jadenuit` |
| Coton | Matière neutre des nuages. Le jade utilise les nuages de la mer de nuages, ordre de Sacha. | `?sans=coton` |
| Flou de vitesse | Flou radial nettoyé. | `?sans=flou` |
| Planètes en orbite | Terre au matin, Mars au midi, Jupiter au soir, Saturne avec anneau aux satellites. Plus de volutes sur la Terre (validé par Sacha). | `PLANETES_ON`, `SATURNE_ANNEAU`, `TERRE_VOLUTES` |
| Œil neuf | Vignette de vitesse plafonnée à .6. Béton du jade au soir gris mat (rtK .72). | `?sans=oeil` |
| Ville, 6 météos | Une ligne finale par ambiance, `VILLE2_V`. Soir : béton charbon L*23 au lieu de mauve L*38. Matin et midi : béton gris neutre, faces à l'ombre lisibles. Orage : ardoise. Voir `graphisme-ville.jpg`. | `?sans=ville2` |
| Écran titre, 6 heures | Bloc `TITRE_V2` après `TITRE_CIEL`. Soir : magenta remplacé par mauve et pêche. Nuit : navy. Plus de mer lavande. Caisse orange vif. La course reste identique (vérifié). Voir `graphisme-titre.jpg`. | `?sans=titre` |
| Néon résiduel | La nitro infinie ne baigne plus la caisse et la route de violet (blanc-or). Réserve bleue désaturée. Plafond de la ville en ardoise à l'orage. | `?sans=neon` |
| Garage 3D | Sorti du néon. Disque or pâle, atelier lisible, guirlande or et crème, caisse en vedette, lave −16 %. La boutique reste identique (`bqBio` ← `ATELIER_V0`). | `?sans=garage` |
| Nuages de jour | Cumulus blancs aux ventres bleu-gris, sans lavande. Soir raccordé au titre. | `?sans=nujour` |
| Courbe des noirs | Corrige l'écrasement des noirs sous ~28/255. | ÉTEINTE par défaut. `?courbe=2` pour la voir. Attend le OK de Sacha. |

## 2. EN COURS / NON INTÉGRÉ au moment du départ
- **Dernier chantier intégré juste avant le départ : Mer de nuages de jour** (`?sans=nujour`).
  - Cause trouvée : l'ombre des cumulus était une constante GLSL lavande `vec3(.72,.78,.97)` dans `nuage8Mat`. Elle devient l'uniforme `uLav`, réglé par ambiance via `nuLav`/`nuR`/`nuK` (BIO_ETAL0 + bioApply), à coût nul.
  - Matin et midi : sommets L* 84-87 → 91-95, ventres 63-69 → 72-75, plus de « ciel d'orage ».
  - Soir : pêche et prune douce, raccordé au titre.
  - À surveiller : le béton du midi monte à L* 44 (plafond de la charte : 45). L'horizon de la dalle reste dur : `fog` n'y peut rien, il faut un fondu d'horizon dans le shader de la route.
- **Aucune branche ne porte de travail utile non intégré.** Toutes les branches `gfx/*` sont fusionnées dans `gfx-integration`. L'orbite n'a qu'un diagnostic, sans code (section 3, point 7).
- Contrôles au départ :
  - syntaxe des 14 scripts : 0 erreur ;
  - `garde-burnout.sh` : OK ;
  - chinois / POKI : 0 ;
  - test complet (accueil → JOUER → course → mort → REJOUER → mort → accueil, couché et debout) : OK, 0 erreur JS.

## 3. LA SUITE, PAR PRIORITÉ
1. **P2 · Auto-école = première image de course** (BACKLOG). Ciel bleu électrique → magenta → orange, route couleur sable, la caisse orange perdue sur du sable. Attendu : une AURORE sobre (ciel pâle, béton gris) et une caisse qui se détache. C'est une ligne d'ambiance, à trouver avec `dbgLvl` / `niveau.ciel`.
2. **Mer de nuages au soir, en course** (`nuagesSoir`) : un premier raccord au titre est fait (nujour). Le gain est de teinte, pas de valeur : verdict « mieux, sans plus ». Juger sur iPhone, et pousser vers `T2('soir')` / `T2('golden')` si besoin (bloc TITRE_V2). Piège : `nuagesSoir` et `nuagesNuit` copient `titreGolden` / `titreNuit` au chargement (`bioPris`). Surcharger APRÈS cette copie et vérifier que le titre ne bouge pas.
3. **Cumulus de nuit et de pluie** : des aplats sans dégradé, et la pluie est la plus laiteuse du jeu (œil neuf n°10).
4. **Brume du jade au midi** : bandes à bords rectilignes. Horizon de la dalle trop dur aux nuages (œil neuf n°7). Attention : la CONSTRUCTION du jade est intouchable.
5. **Flammes de la réserve bleue** encore cobalt `#5b7dff`. Proposition : `#8fa4c8`. La plume de la nitro infinie `NINF.jet #9d4dff` est un pouvoir, à voir avec Léo.
6. **Lune du titre la nuit**, quasi invisible : `moon` / `stars` plus hauts.
7. **Finitions de l'ORBITE** (diagnostic fait, rien codé). Les quatre couples sont sous les plafonds : sat 1,10-1,12, con 1,25. Le vide est propre.
   - (a) `hemiG` [.22,.32,.55] et `fillC` sont BLEU TERRE sur les 4 couples, même sous Mars et Saturne. Il faut un rebond par planète, sur `hemiG`, `fillC`, la bande .58 de `env` et `eS2` : Terre bleu-gris, Mars rouille sombre, Jupiter ambre, Saturne or pâle.
   - (b) Mars (midi) et Saturne (satellites) lisent la MÊME ambiance `espace`. Créer `BIOMES.espaceSat`, copie de `espace`, avec `SF_CARTES.espace.m.satellites.bio='espaceSat'`, posé après la ligne PLANETES qui pose `astre`.
   - (c) La route est un gris uniforme : seulement 2 à 5 L* d'écart entre gauche et droite. Viser 8 à 10 L* : `sunI` plus haut, `hemiI` et `fillI` plus bas, sans descendre sous L* 32 côté soleil. Ne pas toucher au shader du béton.
   - Interrupteur prévu : `ORBITE2_V` / `?sans=orbite2`.

## 4. DÉCISIONS DE SACHA (QUESTIONS.md) et questions ouvertes
- Acquis :
  - béton brut mat ;
  - plus de cônes ;
  - sapèques au vrai trou ;
  - mêmes nuages au jade qu'aux nuages ;
  - planètes Terre / Mars / Jupiter / Saturne avec anneau, sans volutes ;
  - « pas IA » : plus de violet, magenta ni cyan néon ;
  - au cas par cas, la ville de jour d'abord ;
  - aucun changement global sans planche validée.
- OUVERTES :
  - (a) allumer `COURBE_V2` (`?courbe=2`) ;
  - (b) régler NETTE par défaut sur iPhone : l'iPhone rend en DPR 1, soit 1/9 des pixels. C'est la décision d'OPTIMISATION ;
  - (c) les taches de JUS et les confettis, défaut n°1 de toutes les captures, zone Léo + INTERFACE (QUESTIONS.md l.266) ;
  - (d) les phrases du DOGE en magenta/cyan/violet → passer à l'or, la crème et le blanc (pour Léo) ;
  - (e) assombrir le DOGE la nuit (`material.color` ×.85, pour Léo) ;
  - (f) le dessous de la porte relevée du garage, laque indigo → acier (pour Léo).
- POUR INTERFACE :
  - le dégradé CSS `html #garage::after` (~l.3555, `rgba(7,5,15,.96→.86)` sur 52 %) bouche la moitié droite du garage 3D. Proposition : alpha .55 / .35, en bleu-nuit ;
  - le HUD de course est resté en néon violet (jauge, AURA) ;
  - `#pwrFx` et `#speedFx` sont des lavis DOM violets.

## 5. RÈGLES
- INTOUCHABLES :
  - le burn-out du garage (`sh garde-burnout.sh` doit dire OK) ;
  - la boutique 3D ;
  - les voitures (CARS, peintures, LE DOGE) ;
  - les musiques de Léo ;
  - la construction de la map JADE ;
  - toutes les créations de Léo : on peut au plus accorder leur lumière, jamais leur forme ;
  - l'ambiance du soir du jade (Léo) : on l'accorde au béton, on ne la refait pas.
- Plus de chinois (`I18N_ZH`, `LANG==='zh'`), plus de POKI, plus de CRYPTOCITY.
- Jamais `main`, jamais `--force`. Un commit par correctif.
- Chaque chantier derrière son `?sans=<nom>`. Pas de deuxième ligne `Object.assign` empilée sur la même ambiance.
- COULEURS : `jZen/jMid/jHor/jSol/fog` sont en LINÉAIRE, c_lin = ((c+0.055)/1.055)^2.4. Sinon c'est deux fois trop clair.
- Saturation réelle = `BIOMES.x.sat × DA.sat × 1,12`. Charte : ≤ 1,25 de jour, ≤ 1,30 au soir, ≤ 1,15 la nuit, sous la pluie et à l'orage. Contraste ≤ 1,32.
- Route (béton) : L* 32-45 de jour, 22-30 au soir, 14-20 de nuit.
- Règle 9 : si ça ne se VOIT pas en mieux sur une capture comparée, on le retire.

## 6. TESTER SANS LES BANCS DU MAC
- `cd "VERSION PRINCIPALE" && python3 -m http.server 8000`, puis `http://localhost:8000/index.html` en couché ou `index.html?colonne=portrait` en debout.
- Voir comme l'iPhone : `?palier=2`, avec un DPR de 1.
- Une map × météo précise : `dbgClassique('nuages'|'ville'|'jade'|'espace', 'matin'|'midi'|'soir'|'nuit'|'pluie'|'orage'|'satellites')`.
- Ambiance à chaud : `dbgBio('<nom>')`, `dbgAmb('<nom>',{…})`, `dbgLvl()`.
- Titre : `dbgHeure('<heure>')`, `dbgTitre(h,{ciel,amb,P,v,t})`.
- Contrôles : `dbgChaine`, `dbgEtatLum`, `dbgBeton`, `dbgBords`, `dbgFlou`, `dbgCotonV2`, `dbgPlanete`, `dbgFacades`, `dbgMer`, `dbgNitro`, `dbgGarObj`.
- Avant/après d'un chantier : la même URL avec `?sans=<nom>`, combinables : `?sans=titre,garage`.
