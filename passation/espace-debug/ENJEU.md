# L'ESPACE PAR LE PORTAIL, DANS LE VRAI JEU — rôle « enjeu » (2026-11-18, phase TROUVER, rien de modifié dans code/)

Base : worktree `claude/espace-debug-ed5d53` = origin/qualite-appareil a42e9ec50 (build 121), `VERSION PRINCIPALE/index.html` tel quel, servi avec un
CROCHET de mesure glissé à la volée (copie en mémoire, avant `window.dbgPieces=function`).

## Le banc
- `outils/banc-espace/enjeu-course.cjs` : une course au pilote (`dbgAuto(1,0,{vol:true})`) qui enchaîne des portails (`--suite`), chaque map
  imposée (`dbgClassique`) et prise par son portail (`dbgPortail(1400)` → pré-bâti prêt → `dbgPortail(260)`). DANS L'ESPACE : aucune téléportation, la
  caisse roule jusqu'au VRAI portail de sortie, mortelle (`--mortel 1`, une mort → `dbgChance('joue')`), `routeverif=1`. Options : `--graine` (pistegraine),
  `--q "sans=uniques"`, `--force "cx=roue;cx=lune"` (le plan de CHAQUE visite, par `OU.force`), `--tue nebuleuse,lune` (mort provoquée au milieu d'un module),
  `--saut N`, `--pay 1`, `--vue 2000` (une photo toutes les 2 s).
- Relevé toutes les ~50 ms (en pratique 67 ms : la page tourne à ~15 images/s dans Chrome sans fenêtre) : s, mode, module (dbgMods), caisse dans le repère
  de la dalle (hauteur, écart), haut caisse·normale, haut caméra·normale, caméra dans le repère de la dalle, rotation de la caméra (°/s, quaternion et
  vecteur haut), distance caméra-caisse, caisse dans le champ, gravité du vol (VOLR.u·n, TBORD), palier, mort. Anomalies notées dans la page avec seuils
  (caisse sous la dalle < −0,6 m au sol ; caméra dans/sous la dalle ; caisse hors champ ; rotation > 240 °/s ; horizon > 78° de la dalle au sol ; caisse
  penchée > 45° ; caméra à plus de 60 m ; gravité du vol contre la dalle ; mort) → suite de JPEG (~200 ms, ~3 s) dans `enjeu/<passe>/v<n>-<anomalie>-s<s>/`.
- `enjeu-passe.sh` (sous le verrou commun, coupée à 11 min 30, tue le groupe de SON Chrome), `enjeu-lire.cjs` (lecture par module), `enjeu-sonde.cjs`.
- Téléphone émulé `tel=1&appareil=iPhone14,2`, 390×844 portrait, DPR 2, muet (`--mute-audio` + sfx/mus/vox à false, contrôlé avant le départ),
  cadence forcée à 30 i/s par `dbgCadence(30)` (retour : `force:30, per:33.3`). Pas de bride CPU (la machine est déjà saturée : 15 i/s réels).

## Résultats PROUVÉS (passe 1 : `p1-vivant`, sac vivant, sans pistegraine)
Commande : `outils/banc-espace/enjeu-passe.sh passation/espace-debug/enjeu/p1-vivant --suite nuages,espace,jade,espace,ville,espace --monte 0,3,3 --mortel 1`
Lecture : `node outils/banc-espace/enjeu-lire.cjs passation/espace-debug/enjeu/p1-vivant/resultat.json`

| visite | entrée | plan (ouv · sil · rel · fin · temps fort) | modules | palier · km/h méd. | durée | relevés | anomalies | sortie |
|---|---|---|---|---|---|---|---|---|
| 1 | nuages → espace | sserre · S · raide · lacet · failleEnvers | envers-entree, faille-envers, envers-sortie, quart, plongeon, ceinture | 0→7 · 463 | 72 s | 1090 | 0 | portail → jade |
| 2 | jade → espace | mur · crochet · rampe · desorb · roue | mur, marche, roue-entree, roue, roue-sortie, rentree, plongee | 10→12 · 769 | 53 s | 813 | 0 | portail → ville |
| 3 | ville → espace | grand · spirale · vagues · lacet · asteroide | asteroide-entree, asteroide, asteroide-sortie, plongeon | 15→19 · 1153 | 39 s | 611 | 0 | portail → nuages |

Sur les 2 514 relevés des trois visites (dont les passages à l'envers : Nn.y = −1 dans faille-envers, ceinture, astéroïde) :
0 exception, 0 erreur console, 0 mort, 0 vol (mode `fall`), hauteur de la caisse sur la dalle ≥ −0,02 m, haut de la caisse·normale = 1,
haut de la caméra·normale ≥ 0,80 (faille-envers, 0,81 ; ailleurs ≥ 0,95), caméra jamais dans ni sous la dalle, caisse toujours dans le champ,
distance caméra-caisse ≤ 6,7 m, rotation de la caméra ≤ 157 °/s (p95 par module 22-76 °/s, le plus haut : faille-envers 76), pièces 9-12 posées, 0 hors route,
`dbgVoyage().decor.err` nul pour la roue et l'astéroïde. Les trois sorties se font par le vrai portail, pré-bâti prêt.

### Le seul écart prouvé : la route de l'espace bâtie d'avance ≠ la même bâtie d'un trait (1re visite de la séance seulement)
`dbgRouteVerif()` en fin de passe : `espace-matin eng 0 z 1 egal:false egalMk:false ref yqx4rn/1tdqjjp ≠ fait = inst fjp1ki/w9esic` ; les 5 autres routes de la
course (jade-orage, espace-midi, ville-orage, espace-soir, nuages-nuit) égales au bit près. Les trois routes de l'espace jouées sont jouables (voir plus haut).
MÉCANISME (lu dans le code, pas encore isolé par une exécution `?sans=uniques`) : la route de référence de `?routeverif=1` est bâtie la première ;
elle appelle `ruMarque` qui ÉCRIT le sac dans localStorage (`cashcarRU`) ; `rmRemet` remet en mémoire `RU.lu = 0` (le sac n'était pas encore lu dans cette
séance) ; la vraie route relit alors localStorage (`ruH`) et y trouve la route de référence comme « déjà jouée » (`h.der`, `h.vu`) → autre ouverture / autres
modules. C'est d'abord un défaut du CONTRÔLE (le banc change la route qu'il vérifie), invisible au joueur ; le même chemin existe sans le banc pour un
pré-bâti de l'espace ANNULÉ avant la 1re route de l'espace d'une séance (il laisse sa route marquée dans localStorage) : la route jouée change, elle n'est pas cassée.
Gravité joueur : faible. Origine : routes uniques (sac persistant) × routeverif / pré-bâti annulé. Piste : dans `rmPrend`/`rmRemet`, lire le sac (`ruH`) avant
la prise, ou garder/rétablir aussi la valeur de `localStorage.cashcarRU`.

## Ce que le banc n'a PAS vu, et pourquoi c'est important
Le pilote roule au milieu (latK 0), sans saut, parfaitement : avec lui, l'espace du build 121 est propre aux trois paliers (463 → 1 153 km/h). Ce que Sacha
décrit (« j'ai rien compris ce qui se passait ») n'est donc PAS une route cassée, une caisse qui traverse ou une caméra dans la dalle sur les modules joués ici.
Restent à jouer (passe 2 prête, voir plus bas) : les géants nébuleuse / lune / S retourné, la mort provoquée au milieu d'un module à l'envers et d'un géant,
les sauts volontaires, la caisse au bord de la route, et l'IMAGE elle-même (aucune anomalie → aucune photo dans la passe 1).

## NON vérifié
- La passe 2 (`p2-g301-geants` : pistegraine=301, `--force "cx=nebuleuse;cx=lune;cx=sret" --tue "nebuleuse,lune,s-retourne" --vue 2000`) : 1er essai,
  départ de course non obtenu (la caisse restée au garage, `started:false`, le script ne relançait pas `dbgJouer` : corrigé, 4 essais) ; 2e essai en attente
  du verrou commun pendant plus d'une heure (pris tour à tour par d'autres sessions) — non jouée.
- `?sans=uniques`, `?sans=portv`, départ direct `?carte=espace` : non joués (rien à départager : aucun défaut joueur trouvé dans la passe 1).
- Paysage 844×390, bride CPU, sauts volontaires, mort + seconde chance au milieu d'un module, les 7 petits (seuls quart, plongeon, mur, marche joués).
- Les captures : la passe 1 n'en a écrit aucune (aucune anomalie, photos de survol ajoutées au banc après elle).
- Le rythme réel : la page tourne à ~15 i/s dans ce Chrome (relevés à 67 ms), pas à 30 : les rotations en °/s sont justes, les à-coups image à image non.
