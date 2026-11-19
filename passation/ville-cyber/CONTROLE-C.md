# CONTRÔLE ADVERSE — LOT C (les cadres de lumière, `?sans=villecadres`)

## Tour 1 (2026-11-19, contrôleur ; code du lot NON modifié)

Worktree contrôlé : `.lots/c` (non commité : `jade-balade.js`, `ville-entree.js`, `ville-scenes.js`, `ville-v3.js`, index.html assemblé).
Référence « avant » : le worktree racine (même commit a42e9ec50). Mes graines : 101-122, 2654435761 (32 bits), jamais celles de l'auteur.
Sorties et bancs : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-c/controle/`
(`ctrl-banc.cjs` = copie relue du banc de l'auteur, port/profil à moi, + temps du dbgTrace synchrone, dbgVilleCadres() complet, barres de dbgVillePortiques,
renderer par appel à des abscisses fixes ; `verrou.sh`, `priseA-D.sh`). Quatre prises du verrou commun, chacune < 6 min, Chrome `--mute-audio`, sfx/mus/vox coupés.

**VERDICT : FUSIONNABLE** — aucun défaut bloquant trouvé ; trois défauts mineurs (§ 6), à trancher par Sacha.

### 1. Identité
- `SEARCH=… node outils/banc-routes/empreinte.cjs graines=1-12` dans `.lots/c`, pour `''`, `'?sans=villecadres'`, `'?sans=villeportails'` :
  ville p0 `d63b36e2af8b`, p10 `fb378a8c6756` ; crypto `5447610bd8f2` / `eae97981f833` ; nuages `469d52aff855` / `2e1661d8fe93` ; espace `9c99fae61d38` / `ea2d9e750351` — les trois identiques.
- Mes graines 101-160, lot contre référence (`''`) : ville `f8e8b7663424` / `731b9e6214f0`, crypto `d570fb46dae3` / `f80b11a2da14`, nuages `4d37d527b97f` / `b2336a029314`,
  espace `3015db4c9ddf` / `c4e52ee20aa4` — identiques. (`vitree` : « VIT_SOL is not defined » des deux côtés, défaut du banc Node.)
- Décor, Chrome `?tel=1`, graines 101-105 + 2654435761 × paliers 0/10/20 (18 routes) :
  - lot sans drapeau contre lot `?sans=villecadres` : `dbgVilleCadres({empreinte:1})` (FNV des volumes, genres, néons, couleurs, réclames, cadres exclus) **égal 18/18**, mêmes volumes et néons ;
  - lot `?sans=villecadres` contre RÉFÉRENCE : volumes, néons, réclames, dans/frôle/flotte de `dbgVilleAudit`, barres de `dbgVillePortiques`, scènes, modules, longueur **égaux 18/18**.
- Lecture du diff : avec `?sans=villecadres`, `CAD=null`, `V9.neonR` reste une Map vide (fam prend la pose d'avant), la bouche (`else if(CAD&&…)`) n'est pas lue ;
  l'ancre de l'anneau reçoit des champs en plus, aucun tirage (`vD` existe bien dans genCtrl1, l. 238). Garde Crypto/vitrée : `!V.CR`, `LVL.cur.vitre/crypto` (noms vérifiés), et V9 nul pour la vitrée.
- Diff : rien hors périmètre (ni sw.js, ni autre map, ni rendu partagé) ; pas de `//` ajouté en milieu de ligne, aucune regex à antislash touchée.
- Gardes : `node code/assembler.cjs --verifier` ✔ (347 morceaux, 13 156 518 octets) ; `garde-demarrage` OK ; `garde-allege` ✔ ; `garde-charte` OK.

### 2. Génération (Node, vrais générateurs)
- `ville-essais.cjs graines=101-160` (ville et crypto × paliers 0/10/20 = 360 routes) : sortie **identique** lot / référence (essais, notes, décor perdu, raccourcis, boucles).
- `ville-torsades.cjs graines=101-160 carte=ville` : identique hors temps de tirage (bruit, 84-134 ms des deux côtés). R min, roulis, torsades, sauts refusés inchangés.
- Le lot ne change aucune route : pas de nouveau trou, saut ou plan abandonné possible. Aucun cadre refusé par le juge (`rejets` 0 sur les 124 routes mesurées).

### 3. Le vrai jeu (Chrome sous verrou, `?tel=1`)
- `toutes.mjs cartes=ville paliers=0,10,20 graines=101-104` : 12 routes, **0 erreur**, longueurs identiques à celles du jeu complet.
- Erreurs console : 0 sur les 95 relevés (A-def, A-sans, B-ref, B-scan, photos, vols).
- Écart des cadres à la dalle (`dbgVilleCadres()`, indépendant du juge de pose) : `sous5` = 0 sur les 52 routes de mes graines ; écart min portes 8,2-8,3 m,
  bouches 12,4 m ; barre la plus basse au-dessus de la dalle : portes 25,3 m, bouches 40,3-41 m. `dbgVilleAudit` dans 0 / frôle 0 partout (flotte 2 sur les routes à tunnel : pareil dans la référence).
- Courses au pilote auto qui saute (`vol.js`, `dbgAuto(1,0,{saut:1.2,vol:1})`, 25 s) : g105, g110, g117, g2654435761 au palier 0 ; g117, g106 au palier 10 :
  **0 mort**, 0 passage à moins de 5 m ; caisse jamais à moins de 24,7 m d'une porte ni de 38,7 m d'une bouche (en l'air : 24,8 / 40,4 m).
- Rappel : les néons n'entrent pas dans la grille des chocs (`CITY.col` = corps de genre < 2) ; un cadre ne peut pas tuer.
- renderer.info, même vue fixe (70 m avant l'abscisse, 6 m de haut), 18 routes × 3 vues, lot / lot `?sans=villecadres` / référence : appels égaux ou ±1 (jusqu'à ±9 dans
  les DEUX sens sur des routes SANS cadre : les particules), textures 121 = 121, programmes 152-153 = référence ; triangles ±3 000 dans les deux sens ;
  géométries ±20 entre chargements, dans les deux sens. Aucune hausse imputable au lot.
- Temps : `dbgTrace` synchrone (palier 10/20) 129-175 ms avec et sans cadres, mêmes plages.

### 4. Le tirage mesuré (124 routes : mes 52 + les 72 de l'auteur, relues dans `s5/stats.json`)
| | routes | 0 famille | 1 famille | 2 familles |
|---|---|---|---|---|
| toutes | 124 | 72 (58 %) | 51 (41 %) | 1 (1 %) |
| qui offrent au moins une famille (grand S ou tunnel/nœud) | 79 | 27 (34 %) | 51 (65 %) | 1 |
| mes graines seules | 52 | 37 | 15 | 0 |

k visé (⌊3u⌋) : 40 / 41 / 43. Familles posées : bouches 38, portes 15, anneau 0 (hors tirage). Jamais trois.

### 5. À l'image (planches que j'ai REGARDÉES : `controle/C-photos/`, 844×390 et 390×844, g105 et g117 portes, g110 bouche)
- Portes de lumière : une enfilade de cadres fins (rouge, orange, rose, cyan) qui suivent le grand S et penchent avec le dévers — **beau, lisible, cyberpunk** ;
  en portrait la barre traverse l'écran haut, rien ne bouche la route. Les montants s'arrêtent à 4 m sous la dalle, dans le vide à 9 m du bord : on le voit à peine.
- Bouche de tunnel : un cadre rose autour de l'entrée, lisible comme une porte ; c'est presque le cadre retiré le 14/11 (montants deux fois plus fins).
- Planches de l'auteur relues : conformes à ce que j'ai vu.

### 6. Défauts (aucun bloquant)
1. (mineur) Le tirage ne suit pas l'exemple de la commande (« ~1/3 portes, ~1/3 anneau, 1/3 aucune ») : 58 % des routes n'ont aucun cadre, la bouche fait 3/4 des retours,
   l'anneau est hors tirage (jugé encore « chelou » par l'auteur, `?avec=villeanneau`). Conforme à la demande de Sacha (« à certains moments ») ; écart documenté dans LOT-C.md § 5.3 / § 7.
2. (mineur) La bouche revenue est presque le « rectangle autour de la route » retiré le 14/11 : à faire valider par Sacha à l'œil.
3. (mineur) `buildVoxCityG` remet à zéro `CITY.cadreN` et `CITY.cadres` mais pas `CITY.cadreF` ni `CITY.neonR` : hors ville (vitrée, autres maps) ils gardent la Map de la ville d'avant
   (≤ 24 tableaux de 16 nombres). Sans effet (tout lecteur passe par `cadreN`), un peu de mémoire.

### 7. Ce que je n'ai PAS vérifié
- Le temps de CHAQUE tranche (JF.lim) de `vsBatirG` : non exposé à un crochet. Le bloc CAD (portes) tourne sans `yield` avant la boucle des scènes ; par le code,
  ≤ ~10 portes × 3 pièces × quelques dizaines de points × 9 échantillons (< 10⁴ opérations). Seul le dbgTrace synchrone a été comparé (même plage).
- Le pilote au palier 20 (budget du banc épuisé avant le départ ; le relevé statique du palier 20 est fait : g101 p20, portes, sous5 0).
- `?avec=villeanneau` (hors tirage) : ni photo ni banc des sauts de ma part.
- Ni vrai iPhone, ni `?poste=…`, ni 2 graines 32 bits de plus (scan arrêté par le budget à g122).
