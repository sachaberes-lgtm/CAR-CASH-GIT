# PASSE 3 — P3 « appels de dessin, programmes, niveau en tranches, remplissage » (7-8/11/2026)

Branche locale `perf3/P3` (worktree `~/cash-car/perf3/wt/P3`, base origin/main c9d9895d). Aucun push. Données brutes et notes : `passation/perf-2026-11/p3/` (`NOTE-P3.md`, `*.json`).

## 1. Ce qui est fait (commits à intégrer) et leurs interrupteurs
| sha | quoi | interrupteur | preuve |
|---|---|---|---|
| `4f925889` | **L'ombre de la caisse en un maillage** (`code/voitures/moba-ombre.js`, repris de `mobile-perf` 040c8a69, sans l'essai ombre15) ; **3 réserves d'eau vides qui dorment** après leur 1re image (`jade-eau.js` : EAUP/EAUB/JEAU, 1 appel chacune dans TOUTES les maps) ; outils de banc | `?moba_ombre=0`, `?dormeur=0` | dunes 86 → 73 appels, image finale IDENTIQUE (0 px) ; canyon/forêt identiques (l'ombre n'y passait pas à l'instant mesuré) ; nuages : témoin non déterministe (nuages animés), non conclu ; l'eau : −3 appels par construction, non remesuré |
| `9ddc8168` + `c06cbe56` | **Peupliers et cheminées du canyon en segments de 800 m** (`code/maps/instances-segments.js`, `instSegmente()` : une InstancedMesh par cellule 3D, géométrie proxy qui partage les tampons et porte SA sphère englobante) | `?segments=0` (⚠ pas `?tranches=0` : c'est celui des tranches de piste), `?segcell=N`, `dbgSegments(false)` pour l'A/B | canyon p2 émulé, instants 1800/900/2800 m : triangles 405k→265k, 338k→182k, 426k→297k (**−35/−46/−30 %**), appels ≈ +3 ; **image identique, 0 pixel** (ordinateur p2 ET téléphone p0), ombre identique. Cellules : 300 m = +10 appels, 400 m = +9, 800 m = +3 (−32 à −38 %), 1500 m = −22 % |
| `497bc7cc` | **La ville dessinée une fois au menu** (`villeChauffe` : `renderer.compile` → `chauffeRendu([g])`) ; cible les « 8 premiers dessins » de P6 à l'arrivée de ville:pluie | `?villedessin=0` | **NON MESURÉ** (Mac saturé) : à prouver avec `premiere-fois.py --portails-seuls` |
| `f1fd492b` | **Brume de la forêt en polygone à 12 côtés circonscrit à l'ellipse réellement peinte** (alpha nul au-delà dans FOR_BRUME_FS) ; actif PARTOUT (ordinateur compris : économie pure), sert aussi crypto | `?brumepoly=0`, `dbgBrumePoly(false\|true)` | forêt, A/B dans une tâche : surface de la brume ≈ −50 % ; appels inchangés ; +5,6k triangles ; image : 0 à 98 pixels différents sur 0,74 M, écart max 1/255 (seuil demandé < 0,5 % > 8/255) |
| autres | notes, mesures, outils, crochets `dbg*` (aucun changement de comportement) | | |

⚠ Ne PAS compter sur « appels −40 % » : mesuré −13 aux dunes (≈ −8 %), −3 par l'eau, ≈ +3 au canyon (le gain du canyon est en TRIANGLES). La piste (15-35 appels) est déjà en tranches par C3 : la fusionner perdrait le tri par le champ de vision.

## 2. Méthode (les outils, pour la refaire)
- `dbgAppels(n)` (existant) puis **`dbgAppelsBrut()`** : chaque appel de dessin sans regroupement (objet, ancêtres, géométrie + paramètres, matière, texture, échelle, position).
- **`dbgChamp()`** : par famille, triangles DESSINÉS / dans le champ (sphère ∩ tronc, par instance pour les instanciés) / DERRIÈRE la caméra / au-delà du brouillard réel / répartition par distance (0-500 · 500-1k · 1-2k · 2-3,5k · 3,5k+).
- **`dbgOmbre()`** : la passe d'ombre seule (appels et triangles par famille et par distance à la caisse).
- **`dbgRemplissage()`** : passes de l'image (taille de cible en écrans) + surface des transparents.
- **`dbgImgEmpreinte()` / `dbgImgDiff(i,j)`** : l'image finale relue dans la MÊME tâche (FNV, nombre de pixels qui diffèrent, écart max). `outils/banc-perf/p3-egal.py` : **état A → image ×2 (témoin de déterminisme) → état B → image ×2 → retour à A, dans une seule tâche JS** (`P3_A=… P3_B=… P3_POS=1800,900,2800`). C'est la seule façon fiable de comparer au pixel sur un jeu animé.
- `outils/banc-perf/p3-vitesse.py` (voiture lancée en nitro aux paliers moteur via `dbgMoteur`, une lecture complète par palier), `p3-champ.py`, `p3-sonde.py`. Un banc à la fois (`verrou-banc.sh`), charge < 150.
- **Le piège de l'estimateur non recoupé** : ma 1re estimation de la « surface écrite par les transparents » additionnait des triangles / disques ENTIERS (hors écran et derrière compris, plafonnés à un écran chacun) : elle donnait 9 écrans de brume, 19,5 de traînées aux dunes, 11 au canyon — tous faux. Recoupée à l'écran (Sutherland-Hodgman par triangle ; disque d'instance ∩ rectangle écran) : 0,1-0,4 pour les traînées, ≈ 0 au canyon, 0,4-1,4 pour la forêt. **Toute estimation de remplissage doit être recoupée au rectangle écran.** Autres pièges : un commentaire `/* … */` non fermé dans `jade-vol.js` avalait le code suivant (crochets absents, sans erreur) ; `renderer.render` imbriqué (le ciel lisse dans `scene.onBeforeRender`) : restaurer le `cur` précédent, pas `null` ; `geometry.attributes.position.array` peut être libéré après envoi (try/catch).

## 3. Les chiffres par map (?tel=1, palier 2, iPhone émulé 390×844×3, CPU ×4, `?pistegraine=777`)
**Triangles de la scène** (p10, instant fixe) : nuages 0,45-0,70 M (dans le champ 508k p4, 436k p10) · canyon 0,27-0,47 M · forêt 0,53-0,75 M · dunes 0,15-0,25 M. Appels : nuages 105-162, dunes 69-150, canyon 63-160, forêt 76-165 (avant mes leviers 162/149/123/149 à 1800 m).
**Caisse** : 33 appels (jusqu'à 66 aux dunes) = ombre 13 + Phong 11 + Basic 6 + sprites 3 ; après moba : ombre 4. La partie couleur (~24 appels = 1 par matière après soudure) ne se fusionne pas sans changer les shaders : 31 → ~21, pas 10.
**Où sont les triangles** (dans le champ, p10, par distance) : canyon 211k·33k·4k·0·0 · forêt 455k·51k·33k·5k·0 · nuages 230k·139k·102k·0·0. **Plus de 80 % à moins de 500 m.** Derrière la caméra : 4-12 %. Au-delà du brouillard réel (nuages 5,6 km, canyon 6,5, forêt 2,7) : ≈ 0,8k.
**Plus on va vite, MOINS il y a de triangles** (canyon 632k p4 → 408k p10).
**Ombre** : 4 appels / 6 164 triangles (14 / 6 388 au p13), TOUS à < 50 m de la caisse : < 1 % de la scène.
**Passes (en écrans, nuages p10, écran 585×1266)** : p2 = scène 1,00 · ciel lisse 0,25 · halo 246×532 ×3 (0,18) + 123×266 ×2 (0,04) + 62×133 ×2 (0,01) + 31×67 ×2 (0) · écran final 1,00 · ombre 1024² = 1,42 (profondeur seule) ≈ 4,3 écrans, **12 passes + ombre** ; p1 idem (4 étages de halo) ; p0 = scène + ciel lisse + écran = **3 passes** + ombre. Le surcoût du p2 est le NOMBRE de passes (fins de passe de tuile), pas les pixels du halo (≈ 0,9 écran).
**Transparents RECOUPÉS** (écrans/image, p10, 3 lectures) : jade 7-11 · dunes 0,3-5,1 (un instancié additif en rafales) · nuages 1,2-2,7 · forêt 0,4-1,4 (avec la brume polygone) · espace ≈ 1,1 · canyon ≈ 0 · banquise/ville/grotte petit.

## 4. Les no-go chiffrés (mesurés, NON codés)
- **Supprimer l'arrière de la map / décharger derrière le joueur** : ≤ 12 % des triangles sont derrière la caméra, et le culling les écarte déjà quand l'objet est borné ; le demi-tour ne pivote que la caisse. Gain rendu ≈ 0 (mémoire seulement : voir P1).
- **Plafond de distance devant** : ≈ 0-5k triangles au-delà de 2 km ; un plafond ≤ 1 km (nuages −100k, forêt −40k) = un brouillard de 1 km au lieu de 5,6 : c'est la DA (refusé par OPTI ULTIME).
- **Passe d'ombre** : < 1 % (voir §3).
- **Traînées** (SIL, atchoum-feu.js ; TRX, trainees-1/2) : 0,1-0,4 écran, 0 de « couleur nulle » ; le voile d'encre de jour est déjà sauté la nuit (`tr.mi.visible=dk>0`), TRX discard déjà `a<.004`, le profil en travers n'est nul qu'au bord exact.
- **Coton et nuages v8** : volumes 3D (`nuage8Mat`, depthWrite, FrontSide), pas de quad à circonscrire ; les réduire change l'image.
- **Jade** (7-11 écrans, instanciés ShaderMaterial absorption/profondeur, additifs) : couches voulues par la DA, pas image-identique.
- **Fusion de la piste** : détruirait le tri et le LOD par tranche (C3). **Plaques turbo (8 plans gris, `padGeo`) et fruits de la file** : meshes ajoutés au vol (ligne-parfaite.js:173), 8-14 appels, instanciation dynamique possible, non faite.
- **Leviers d'image halo / ciel lisse / ombre 768 / NETTE 1,25 / traînées demi-densité / qlAuto** : déjà sur `perf3/P2` (+ `imgRegle` du gouverneur). Rien recodé ici.

## 5. Conclusion
À grande vitesse, le coût du 13 Pro **n'est ni les triangles (moins nombreux quand on va vite, ≥ 80 % à < 500 m), ni l'ombre (< 1 %), ni les transparents (≈ 1-2 écrans, jade mis à part), ni le JS par image (vitesse-fluide : +1 à 2 ms de p4 à p16, le seul qui grandit est le pré-bâti de la piste suivante)**. Restent : le **thermique** (gouverneur) et le **nombre de passes plein écran / la résolution** (12 passes au p2 contre 3 au p0) — leviers P2 sous le gouverneur — à trancher SUR L'APPAREIL (13 Pro), pas au banc Mac.

## 6. Reste à faire / à prouver
1. `497bc7cc` (ville au menu) : `premiere-fois.py --portails-seuls`, 0 premier dessin au portail ville:pluie.
2. Nuages : A/B au pixel de moba avec `dbgImgDiff` (le témoin d'`dbgImgEmpreinte` varie à cause des nuages animés).
3. Vérifier au jeu si `canyon décor` (164k triangles) reste dessiné dans la grotte après canyon → forêt → grotte (vu au banc avec `dbgClassique` enchaînés ; peut être un artefact du banc ; `cyLiberer`/`cyEteindre` ne sont appelés que par `cyBatitG`).
4. Intégration : `sw.js` +1 par l'intégrateur ; les gardes burnout/charte/allège/démarrage + `--verifier` passent sur chaque commit.

## 7. Addendum (8/11) — la fusion des maillages statiques : gisement MESURÉ < 30 appels, arrêt
Appels de dessin d'une image par origine (sonde brute `dbgAppelsBrut`, p2 émulé, instant 1800 m ; `champ-p2.json`) :
| map | total | ombre | caisse (déjà soudée : 1/matière) | piste (tranches) | instanciés | ShaderMaterial décor | plaques turbo + fruits (ajoutés au vol) | traînées animées | points/lignes/sprites | autres statiques |
|---|---|---|---|---|---|---|---|---|---|---|
| nuages | 88 | 4 | 20 | 10 | 18 | 11 | 6 | 6 | 6 | 7 |
| dunes | 74 | 4 | 22 | 10 | 6 | 6 | 6 | 5 | 7 | 8 |
| canyon | 80 | 4 | 23 | 10 | 11 | 6 | 6 | 5 | 7 | 8 |
| forêt | 112 | 4 | 20 | 25 | 23 | 20 | 2 | 5 | 5 | 8 |
| grotte | 82 | 4 | 21 | 17 | 9 | 5 | 6 | 5 | 6 | 9 |
Les seuls appels « statiques posés par la carte, de même matière, fusionnables » sont les **tranches de piste** (10 à 25 : bitume / flancs / rails / nappe / ligne × 2-5 tranches visibles) — encore faudrait-il garder le tri par le champ de vision et le LOD plein/moyen/maigre de C3 : une seule géométrie par matière avec un `drawRange` sur la plage CONTIGUË des tranches visibles par classe de LOD (3 appels par matière au lieu de N) ; au mieux −6 à −15 appels (≈ 8-14 %), pour un chantier sur `pisteTranches`/`pisteLoin`/pré-bâti/libération. Les instanciés (6-23) sont déjà un appel par famille ; la caisse est soudée ; nuages v8/coton sont animés, transparents et triés ; les plaques/fruits sont des meshes au vol.
→ **gisement < 30 appels (10-25) et gain réaliste 6-15 : pas de ÷2 possible par fusion statique.** Arrêt, comme demandé. Mesures de coût : 73-113 appels/image restent le plancher de ce moteur sans changer l'image.
