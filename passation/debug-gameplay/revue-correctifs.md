# Revue indépendante des 17 correctifs « debug gameplay » (f0fb32e5..HEAD, code/)

Relu sans ouvrir les rapports de passation des auteurs. Lecture seule sur `code/` et `VERSION PRINCIPALE/` ; aucun commit.
Les scripts de preuve sont dans `passation/debug-gameplay/preuves/revue/` :

- `commentaires.cjs` analyse le script du jeu assemblé avec acorn (en mode strict), puis vérifie que chaque fragment de code ajouté est bien du CODE et ne se trouve pas dans un commentaire. Il compte aussi les caractères de contrôle.
- `portees.cjs` résout avec eslint-scope chaque nom utilisé dans les lignes ajoutées. Il signale :
  - les noms non déclarés ;
  - les écritures dans une const ;
  - une déclaration let/const placée APRÈS son usage dans la même fonction (zone morte temporelle).
- `cadence.cjs` applique les formules de sous-pas aux dt réels d'un rAF, puis vérifie la loi de PG-01 par tirage.

## Contrôles globaux

| Contrôle | Résultat |
|---|---|
| `node code/assembler.cjs --verifier` | ✔ index.html et les 307 morceaux sont d'accord (11 164 395 octets) |
| Syntaxe du script assemblé (acorn, ES2022, 'use strict') | analyse OK |
| Fragments ajoutés avalés par un `//` ou un `/* */` | 0 sur 35 fragments testés (tous du code) |
| `*/` prématuré dans un commentaire ajouté | aucun : l'analyse passe et tous les fragments qui suivent sont du code |
| Caractères de contrôle dans le script | 0 |
| Fins de ligne | 9 morceaux LF restés LF ; `rendu/traces-pneus.js` est en CRLF, sa ligne modifiée a gardé son CR (267/267) |
| Portée des noms ajoutés | 248 références, toutes résolues ; aucune écriture de const ; aucune zone morte |

Portées vérifiées, avec le moment de l'usage :

- **`TL_V0`, `HV9`** : const au niveau de la grande fonction (portail-passage.js:330, avec dTmp). Lus seulement dans la boucle et dans `tryLand`, donc toujours après le chargement.
- **`VIS_R2`** : const locale au bloc du viseur (boucle-3:531), utilisée ligne 539 dans le même bloc.
- **`GLI`** : const de figures-physique.js:293, au niveau de la fonction.
- **`figGVoit`** : fonction hissée. `figGVoit(null)` est sûr : il rend la main sans rien créer si `GLI.el` est nul.
- **`BANQ`** : const de glacier-route.js:30. Seule une propriété est écrite.
- **`PORTV`** : const de portail-passage.js:108.
- **`pan` (mobile-tactile:324), `panOpen` (fonction, :351), `stUp` (const, :217), `TCTL`, `paused`, `inclLis`/`inclPL`** : tous visibles dans le bloc des écouteurs, qui ne s'exécutent qu'à un événement.
- **`levre9`, `tranche9`, `bestI`** : passés de const à let. Aucune fermeture ne les capture (`touche9` lit des copies : nI9, imp9…).
- **`exA`/`exB`** : paramètres. Absents, `exB!=null` est faux et le comportement est identique à avant.
- **Index** : `bestI-ex9` peut être négatif, ce qui est sans danger : ce n'est qu'une borne de comparaison, jamais un index. La piste est ouverte (`CatmullRomCurve3(…,false)`), il n'y a donc pas de bouclage d'indices à gérer.

## Verdicts

| Id | Fichier:ligne | Verdict | Preuve / remarque |
|---|---|---|---|
| MAP-A07 | maps/jade-balade.js:241 | **SAIN** | `villeHeurt` ne lit que la case du point et teste la boîte +0,9 m (`villeForme` aussi +0,9). Inscrire chaque tour à ±1 m dans la grille couvre la marge. Le coût est quelques boîtes de plus par case. |
| EE-01 | moteur/boucle-2-conduite.js:139 | **SAIN** | `PORTV.att` n'est non nul qu'entre `portPasseNiveau` et `suite()`. `suite()` arrive au pire à `PREBF.voileMax` = 25 s (pré-bâti, TEL_NATIF seulement) ou après 1 à 2 images. Il est remis à 0 par `resetGame`. Une mort pendant la tenue ne le colle pas : `pas` appelle quand même `suite`. Pendant la tenue, la caisse est clampée au bord (`lat=out*ROAD_HALF`, vL extérieur annulé) et à `s≤L-2`, donc elle ne coince pas. Seul effet hors tenue : la chute du bord est aussi suspendue pendant les 1 à 2 images d'attente d'un portail ordinaire, ce qui est négligeable. |
| EE-02 | gameplay/seconde-chance.js:213 | **SAIN** | Instruction identique à `jadeEauRamene`. Visible seulement dans la branche « chute sauvée ». C'est un choix de règle : la chaîne du vol raté est perdue. |
| EE-03 | moteur/mobile-tactile.js:562 | **SAIN** | Identique à `gliCoupe()`, sous try. |
| EE-04 | gameplay/seconde-chance.js:418 | **SAIN** | Le seul lecteur est `if(BANQ.fid!==flightId){…figs={}…}` (glacier-verglas:274) ; avec -1, le 1er vol de la partie repart à vide. |
| dbgTrace | rendu/traces-pneus.js:156 | **SAIN** | Crochet de banc uniquement. `newTrack0G` est bien le générateur (traces-pneus:95). Le CR de la ligne est conservé. |
| PG-01 | demi-tour.js:461 + boucle-3:293 | **SAIN** (non mesuré en jeu) | `TL_V0` est copié sans condition en tête de la branche 'fall' ; `tryLand` n'est appelé que plus bas dans cette même branche (boucle-3:586), donc jamais avec une valeur d'un autre vol. Aucune division par zéro (dt>1/60, `max(1e-4,…)`). Signe : aN<0 en chute, donc \|vNj\|<\|vN\|. Vérification par tirage (cadence.cjs, a = 48) : surplus moyen 0,801 → 0,399 à 30 i/s, 1,200 → 0,399 à 20 i/s ; la référence à 60 i/s exact vaut 0,400. À 17 ms (60 Hz arrondi à la ms par Safari), le facteur vaut 0,02 : effet nul en pratique. |
| PG-02 | moteur/boucle-3-physique.js:576 | **À CORRIGER** (défaut D1) | Le recul `fallPos − fallVel·dtF·SPD·(1−k/n)` retombe exactement sur le segment intégré à boucle-3:388. Entre 388 et 576, rien ne modifie fallVel ou fallPos : `AIR_ASSIST=0` ; `jadeEauRamene` met fallVel à 0, donc points confondus. Les sauts, réacteurs, rebonds et respawns ont lieu avant l'intégration ou après 576, ce qui garde le segment réel. Au 1er pas d'un vol, k=1 est exactement le point qu'aurait testé le jeu à 60 i/s (k=0, la route, n'est pas testé). Les fonctions de heurt n'ont pas d'état (relu : forêt, grotte, jade, canyon, dunes, ville). L'ordre est celui de la chaîne (portail d'abord, puis le décor). **Mais** `ceil(dt·60−1e-6)` donne n9=2 à 16,667 ms et à 17 ms, c'est-à-dire à 60 Hz réel : le « aucun point de plus à 60 i/s » est faux sur la plupart des images d'un iPhone. À 34 ms, n9=3 ; or entre deux sous-points aucune pose n'est essayée, ce qui ne colle pas à 60 i/s pour n≥3. |
| PG-03 | moteur/boucle-2-conduite.js:91 | **SAIN** | n9=1 à 8, 16, 17, 33 et 34 ms : le pas est identique à avant (d9=dt ; avant, `min(dt,1/30)`). Entre 33,4 et 40 ms, on fait un seul pas de dt au lieu de 1/30. C'est voulu (plus de temps perdu) et stable : ω·d = 0,36 < 2. Au plafond de 50 ms : 2 pas de 25 ms. Le test de repos est hors de la boucle, comme avant. |
| PG-04 | moteur/boucle-6-hud.js:129 | **SAIN** | À 60 i/s, 20 erreurs durent 0,33 s, sous le seuil de 1,2 s : la règle des 60 images arrive la première, comme avant. `endGame` est déjà gardée contre le double appel. Cosmétique : la note dit « 60 images » même quand c'est la règle de temps qui déclenche. |
| IOS-01 | moteur/mobile-tactile.js:558-559 | **SAIN** | Pas de double pause : `iosPose` et l'écouteur `visibilitychange` (init.js:405) testent tous deux `!paused` ; le premier pose la pause, le second ne fait rien. Les événements 'pause' des `<audio>` ne remontent pas jusqu'à `document` (écouteur sans capture), donc pas de faux déclenchement par la musique (musique.js:296). Rien hors de l'app : `ccInactif` n'est jamais envoyé. |
| IOS-02 | rendu/palier-appareil.js:182 | **SAIN** (remarque D4) | Le seul lecteur est `ctxRecharge` (n9>3 → écran de crash). Une boucle de pertes rapprochées (< 2 min) est toujours arrêtée. Une boucle à plus de 2 min d'écart ne l'est plus, ce qui est acceptable. |
| IOS-04 | moteur/mobile-tactile.js:442 | **SAIN** | Même remise à zéro que `cc:jeu` et `orientationchange` (lignes 473-474). Le jeu est figé pendant la pause, donc `TCTL.sv`, laissé tel quel, ne bouge rien. |
| IOS-08 | moteur/mobile-tactile.js:296 | **SAIN** | `stUp` remet le braquage à 0. Le pouce resté posé est bien repris : le `touchmove` de window (capture) appelle `stAdopte` quand `!TCTL.act`, ce qui fait naître un nouveau stick sous le pouce, avec le braquage à 0, donc pas de saut. |
| PV-01 | gameplay/demi-tour.js:374-383 | **À CORRIGER** (défaut D1) | L'ordre de jugement suit bien le jeu à 60 i/s (tranche, puis fenêtre du dessus). J'ai vérifié les deux sorties. Cas « bumpIn » : le trajet va vers l'intérieur et la fin est hors largeur, donc aucun sous-point n'est dans la largeur ; la règle « pose ordinaire » ne peut pas s'y déclencher. Cas « bumpThru » : le premier sous-point dans la largeur est forcément pris par `tk` s'il est dans la bande de la tranche. Si `tranche9` passe à false, la caisse a donc franchi h=0 DANS la largeur, `latX9` est dans la largeur et la pose se fait sans retour à faux. Pas de boucle sans fin (k<n9≤4), pas de double paiement (break). **Mais** la garde `dt>1/60+1e-6` est vraie à 17 ms, et `ceil` donne 2 : à 60 Hz réel sur iPhone, un sous-point de plus sur environ 2 images sur 3. |
| PV-02 | moteur/boucle-3-physique.js:531/539 | **SAIN** (effets à dire) | 1156 = 34² pour une route de 28 m ; le glacier garde 400. Ce n'est pas seulement l'anneau : `LM.vu` et `CAMV.eta` sont désormais posés au-dessus du tiers extérieur. Cela change donc aussi le MIRACULÉ (`mirTick` : `perdu=!LM.vu…`), la durée des figures (figures-physique:113, qui raccourcit avant la pose) et la caméra vivante (camera.js:65). Tout va dans le bon sens (c'était faux avant), mais rien n'est mesuré en jeu. |
| PV-03 | demi-tour.js:310-317 + portail-passage.js:354-362 | **SAIN** (limites D3) | Pas de téléportation : la dalle de repli doit être à ±3 m de son plan et à moins de RH+w+2 m de son axe. La pose exige encore `latX9<RH`, et `s` est pris sur la dalle où se trouve réellement la caisse. Une seule portion proche : la dalle élue donne une fenêtre (aucune 2e recherche), ou bien la 2e ne trouve rien à moins de 40 m, et rien ne change. La graine `_bi` reste une borne : le résultat est toujours le vrai plus proche. Le saut de casier `b*K>exA && i1-1<exB` est correct pour la bande ouverte. Les trous restent exclus. `dalleProche.bd` est écrasé par la 2e recherche, mais rien ne le relit après. |
| PV-04 | moteur/boucle-3-physique.js:321 | **SAIN** | Même facteur (ou même ajout) sur TL_V0 que sur fallVel, dans les deux branches. Comme le coup est une impulsion, PG-01 n'en extrapole rien. |

## Défauts, du plus grave au moins grave

### D1 (moyen, sur PG-02 et PV-01) : « à 60 i/s rien ne change » est faux sur un vrai téléphone
`dt` est brut (boucle-1.js:21, `(now-last)/1000`, non lissé). Safari et WKWebView arrondissent l'horodatage à la ms : à 60 Hz, dt vaut 16 ou 17 ms. Chrome donne 16,66 à 16,70 ms.

Résultat (cadence.cjs) : `ceil(dt*60-1e-6)` = **2 à 16,667 ms et à 17 ms**, et 3 à 34 ms (un téléphone calé à 30 Hz arrondi à la ms).

Conséquences :
- **PG-02** : un test de décor de plus au milieu de l'image sur la plupart des images à 60 Hz. Il n'y a pas de garde `dt>1/60`, seulement `n9>1`. Le point est bien sur le trajet, donc ce n'est pas une mort injuste en soi. Mais la référence à 60 i/s mesurée au banc (dt = 1/60 exact) n'est plus celle que vit le joueur.
- **PV-01** : un sous-point de lèvre de plus à 17 ms.
- **PG-02 à n≥3** (34 à 50 ms) : deux sous-points de décor sans essai de pose entre eux. Le jeu à 60 i/s aurait pu poser la caisse avant le 2e sous-point.

Réparation : arrondir au lieu de `ceil`. On obtient alors 1 à 16 et 17 ms, 2 de 25 à 41 ms, et 3 seulement au plafond de 50 ms. Diff exact :

```diff
--- a/code/moteur/boucle-3-physique.js
+++ b/code/moteur/boucle-3-physique.js
@@ ligne 576
-      {const n9=Math.max(1,Math.ceil(dtF*60-1e-6));if(n9>1&&!PARK.on&&!PORTV.att)for(let k9=1;k9<n9;k9++){
+      {const n9=Math.max(1,Math.round(dtF*60));if(n9>1&&!PARK.on&&!PORTV.att)for(let k9=1;k9<n9;k9++){
--- a/code/gameplay/demi-tour.js
+++ b/code/gameplay/demi-tour.js
@@ ligne 378
-    const n9=Math.ceil(dt*60-1e-6),mg9=CARS[level].w*.5+Math.max(.2,Math.abs(vB)*SPD*dt/n9*1.5);let pl9=prevL;
+    const n9=Math.max(1,Math.round(dt*60)),mg9=CARS[level].w*.5+Math.max(.2,Math.abs(vB)*SPD*dt/n9*1.5);let pl9=prevL;
```

Facultatif, par cohérence : pour PG-01 (demi-tour.js:461), remplacer `dt>1/60+1e-6` par `dt>1.25/60`. Le facteur vaut 0,02 à 17 ms, donc sans effet réel.

Après la réparation, relancer `node code/assembler.cjs`, `--verifier`, puis le banc cadence.

### D2 (faible, PG-02) : pas d'essai de pose entre les sous-points quand n9 ≥ 3
Avec D1 réparé, cela n'arrive qu'à dt ≥ 41,7 ms (moins de 24 i/s). Pour une mort réellement nouvelle, il faudrait à la fois :
1. un sous-point dans la fenêtre de pose ;
2. un décor mince traversé juste après, au ras de la route ;
3. un point de fin hors du décor.

C'est très rare. À documenter, pas à coder.

### D3 (information, PV-03) : limites
- Une hélice dont le tour mesure moins de 200 m a sa portion du dessous dans la zone écartée (±200 m), et le correctif ne l'aide pas.
- La 2e recherche tourne à chaque image de vol où la caisse est à plus de 3 m sous les 40 m. Son coût est faible : un test de sphère par casier, puis rien dans la zone écartée.

### D4 (information, IOS-02)
Des pertes de contexte espacées de plus de 2 min relancent sans fin : une par relance, jamais comptées au-delà de 1. C'est acceptable (rien ne bloque), mais à savoir.

### D5 (cosmétique, PG-04)
Le texte de la note `__ccNote` dit « 60 images de suite en erreur » même quand c'est la règle des 1,2 s qui finit la partie.

## Ce que je n'ai PAS pu vérifier
Aucun correctif n'est mesuré en jeu par cette revue (pas de navigateur) :
- l'effet de PG-01, PV-01 et PV-02 sur le taux de PARFAIT ou de BUMP ;
- les morts de PG-02 à 30 i/s ;
- IOS-01 et IOS-08 sur un vrai iPhone.

Je n'ai trouvé aucun risque d'exception, de double appel ni d'état collé. Le seul vrai défaut est D1 : le cas « 60 i/s » n'est pas préservé, à cause du dt brut arrondi à la ms.
