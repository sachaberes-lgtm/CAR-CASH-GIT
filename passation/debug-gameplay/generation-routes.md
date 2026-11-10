# Génération des routes : chasse aux bugs (node, sans navigateur de jeu)

Banc : `outils/banc-routes/toutes.mjs` (Chrome headless CDP, `dbgGenRoute`, génération seule) + bancs node. Scripts d'analyse : `passation/debug-gameplay/preuves/`.
Sorties brutes (JSON par route) : scratchpad de session (lot1, lot2, lot3), non conservées dans le dépôt.
Paliers testés : 0, 10, 20 (les valeurs que le banc connaît). Les 10 maps : nuages, espace, ville, crypto, jade, foret, canyon, dunes, grotte, banquise.

## 1. Lots lancés

| lot | commande | routes | erreurs / NaN |
|---|---|---|---|
| 1 | `node outils/banc-routes/toutes.mjs paliers=0,10,20 graines=1-60` | 1800 (266 s) | 0 / 0 |
| 2 | idem `graines=100-160` | 1830 (114 s) | 0 / 0 |
| 3 | idem `graines=1000-1040` | 1230 (67 s) | 0 / 0 |
| 4 | rejeu `cartes=grotte,foret,canyon,dunes,nuages,jade,banquise graines=1-6 paliers=20,0` | 84 | 0 ; ctrl0 ET ctrl identiques au bit près à ceux du lot 1 |
| 5 | `node outils/banc-routes/croise.cjs graines=1-60 / 100-160 / 1000-1040 paliers=0,10,20` (ville, crypto) | 3 x 6 plages | voir C3 |
| 6 | `node outils/banc-routes/grotte.cjs {0,10,20} 1-60` | 3 x 60 graines | contacts 0, conflits 0 sur les graines affichées (banc node, route sans le routage du banc réel) |

Total 4860 routes banc réel : 0 ERREUR, 0 exception, 0 NaN, 0 longueur aberrante (L de chaque map dans une fourchette serrée), 0 route de secours.
Seuls cas : infranchissable (infr) = 0 partout ; zigzags = 0 partout ; contacts (routes roulées) = 3 routes sur 1620 roulées (grotte).
Commandes d'analyse : `SORTIE=rows.json node preuves/analyse-lots.cjs DOSSIER...` puis `node preuves/horsnorme.cjs rows.json`, `node preuves/essais.cjs DOSSIER...`.

## 2. Anomalies, par gravité

### A1. CANYON : le contrôle de séparation n'est JAMAIS satisfait (14 essais gaspillés à chaque génération) — SÛR
- Map canyon, tous paliers, toutes graines : 486 routes sur 486. `RYTHME.der.notes` = 14 essais, tous à 70-117.
- Mesure : `node preuves/canyon-sep.cjs $LOT1 p0` : séparation en plan entre deux tronçons à plus de 1200 m d'abscisse, hors raccourci : min 204, médiane 269, max 352 m ; le contrôle exige `sep>560*SQ` (SQ>=1).
- Cause : `code/maps/canyon-route.js:244-246` (`ok9=sep>560*SQ`, malus `50+(560*SQ-sep)*.1`) et boucle `for(essai<14)` ligne 80 : `if(ok9&&nt9<=1.5)break` ne se déclenche jamais.
- Conséquence : la génération du canyon coûte 14 essais pleins (47-124 ms au banc, max 208 ms ; x4 à x6 sur téléphone) pour garder « le moins mauvais » ; la garantie visuelle « jamais à moins de 560 m » n'existe pas (les routes se frôlent à 200-350 m).
- Correctif minimal : abaisser le seuil à ce que le dessin tient (ex. `200*SQ`) ou supprimer la sortie anticipée conditionnée par `ok9`, et ramener la boucle à 3-4 essais. Reproduire : `OUT=/tmp/x node outils/banc-routes/toutes.mjs cartes=canyon paliers=0 graines=1-3` puis lire `rythme.notes` dans le JSON.

### A2. La route dépend du PALIER (même graine, routes différentes) — SÛR (conception, à décider)
- `node preuves/palier-diff.cjs $LOT1 1` : suite de modules identique aux 3 paliers sur 0 graine pour nuages, ville, crypto, espace, dunes ; 1/60 forêt ; 5/60 grotte ; 15/60 canyon ; 38-39/60 jade et banquise. Sens du premier virage identique aux 3 paliers sur seulement 14-26 graines sur 60 (le hasard donnerait 15).
- Longueur aussi : nuages 6,3 / 8,3 / 9,8 km (p0/p10/p20).
- Cause : `vPalier()` et `rayonPalier()` (`code/gameplay/camera.js:246-247`) pilotent rayons, longueur (`longueurCible`, `code/gameplay/route-sans-haut.js:71`) et la phrase de rythme (`phraser`, route-rythme.js), donc le nombre de tirages `rnd()` consommés change.
- Impact : un défi à graine partagée entre un PC (palier 2) et un téléphone ne donne pas la même route. Déterminisme à palier constant : OK (lot 4).
- Correctif : seulement si un classement par graine existe ; sinon à documenter.

### A3. FORÊT : coût de génération et notes d'essais énormes — PROBABLE (pas un gel)
- Le « essai à 1630 ms » de foret g2 p0 n'est PAS un temps : c'est la NOTE d'un essai (`RYTHME.der.notes`, `code/maps/foret-route.js:128`) : `[..,1630.2,18.6,48.7,24.8]`. Temps réel mesuré : foret p0 g2 petit ; moyenne 65-103 ms, max 322 ms (p20 g14), 279 ms (p10 g124).
- Essais rejetés (note > 50) : 41 % au p0, 21 % au p10, 3 % au p20 ; note max d'essai 3310. Cause : malus du portail (`foret-route.js:454`, `FOR_PORT_PEN`) et malus de longueur / croisements (lignes 436-446) ; quand le meilleur brut passe sous 110 m du portail, 8 essais de plus (`:126`, `FOR_PORT_PLUS`), soit 16 essais au pire.
- Conséquence : sur téléphone 16 essais x ~30 ms x4-6 ; `yield` entre essais donc pas de gel d'un bloc, mais 1-2 s de pré-bâti en cumulé. Forêt p0 mal notée : g1008 note 9,0 (spirales 618°), g133 8,5 (656°), g140 7,3 (droite 11,2 s).
- Correctif : plafonner à 8 essais au palier 0 ou réduire la part de candidats rejetés (la cause des 41 %).

### A4. Banquise (glacier) : crêtes, douilles, note 9-10 au palier 0 — NORMAL pour cette map (SÛR sur la cause)
- crêtes > 0 sur 41/60, 51/60, 60/60 routes (p0/p10/p20) ; douilles > 0 sur 47/60, 31/60, 33/60 ; note moyenne p0 10,2 (p95 17,6), p10 1,8, p20 2,7. Pire : g1004 p0 note 33,8, droite 24 s. Ex. à reproduire : `node outils/banc-routes/toutes.mjs cartes=banquise paliers=0 graines=1-6`.
- Cause : les crêtes viennent du module `bkBosses` (pente 0,55/1,25 par tronçons de 45-65 m, `code/maps/glacier-route.js:143`, comptées par `rythmeMesure` : route-rythme.js:101-102, 0,6 de note chacune) ; les douilles viennent de `bkGodille` (6-8 virages de 22-32° sans droite, `:141`) et des recadrages `cap`/`bkVers` (seuil 2°). Ce sont des modules voulus. La note de p0 vient des droites de 9-12 s (cible 5 s, tracés en mètres fixes alors que vP=78 m/s) ; elle tombe à p10 car vP double.
- Pas un défaut de génération ; la note ne dit rien du jouable. Si on veut une note propre : exclure `bosses` / `godille` de la mesure comme les figures déclarées (prot).

### A5. Canyon p20 : « coudes » = 1 sur 2 routes (g16, g35, graines 1-60) ; autres lots : 0 — PROBABLE
- Un segment de 7,1 m (g16, ctrl 219, s=12002) et de 4,2 m (g35, ctrl 263, s=16226) entre deux segments de 50 m : `rythmeMesure` le compte en coude (route-rythme.js:54, « le spline y fait une boucle »). Les points voisins sont presque colinéaires : risque de boucle faible, mais c'est un point doublon. Se retrouve avec `node preuves/coudes.cjs $LOT1/canyon-p20-g16.json`.
- Cause probable : une jonction de pièce près de la fin du dessin (après le module, index 212-220) dans `canyon-route.js` (`droite()` ligne 84 : un point tous les 40 m au moins, ne garantit pas la longueur du dernier). Correctif : fusionner un point à < 10 m du précédent avant `push`.

### A6. Nuages g7 (p0, p10) : 7 « crêtes », pente p95 1,13 / 1,49, note 8,4 / 11,0 — SÛR, sans gravité
- C'est la figure `boucle` (looping, ctrl 36-79) : les crêtes sont le haut et le bas du looping. `rythmeMesure` compte les crêtes dans les figures déclarées (route-rythme.js:101). Correctif : ignorer les index `prot` dans le comptage des crêtes. Seule route concernée sur 342 de nuages.

### A7. Grotte : contacts (dalles qui se touchent) et croisement serré — PROBABLE
- p0 g40 (contacts 1, dz mesuré 6,3 m pour dh 55 m, s 6675-8042), p0 g1039 (contacts 2 sur ce lot), p20 g52 (dz 16,9, s 1464-10943). 3 routes sur 486.
- Cause : `pisteTordPropre` (`code/gameplay/route-sans-haut.js:232-246`) : 16 essais pour la grotte, garde la moins mauvaise ; pas d'issue « dévers seul » pour la grotte (`!(opts&&opts.zone)` et `opts` présent). Correctif : autoriser la version `zero` aussi quand `opts` est la grotte.
- Reproduire : `OUT=/tmp/x node outils/banc-routes/toutes.mjs cartes=grotte paliers=0 graines=40`.

### A8. Part « hors de l'endroit » (routes roulées) au-dessus de la cible 25 % — DOUTEUX
- espace p20 g102 : 0,53 ; espace p10 g49 : 0,39-0,43 ; espace p20 g129 : 0,42 ; nuages p20 g141 0,49 ; grotte p20 jusqu'à 0,50. La cible v2 est <= 0,25 (GENERATION-ROUTES.md 3.1). Médianes 0,03-0,15, donc rare (quelques % des routes). La note ne les pénalise qu'à 4,3 sur espace g102 p20. À confirmer visuellement.

### A9. Hors norme sans gravité
- Notes hautes isolées : ville p0 g17 8,05 ; crypto p0 g130 5,8 ; canyon p10 g44 4,6 (droite 8,2 s) ; canyon p20 g1020 3,5 (droite 7,5 s) ; grotte p0 g1040 5,3 (droite 9,2 s).
- rMin minimum : 1,00 rP (grotte p20 g2, g123, g146), 1,03 (canyon p20) : tenable (infr = 0) mais à la limite.
- Temps de génération (banc sous charge) : forêt 322 ms max, canyon 208 ms, grotte 167 ms, banquise 31 ms, tout le reste < 70 ms.

## 3. Auto-croisements et passages trop près

- Ville et crypto (`croise.cjs`, graines 1-60, 100-160, 1000-1040, p0/p10/p20) : 0 route sous 46 m de hauteur libre, sauf 1 : crypto p0, dans la plage 1000-1040, exactement 46 m (module `moon`) : marginal, pas sous la règle. Les plus bas : ville p0 52-77 m, crypto p0 46-67 m.
- Toutes maps non roulées, depuis les JSON (`croise-json.cjs`, H=56, dsMin=150) : forêt 45-46 m de dégagement minimum aux ponts (voulu : `DY` 46) ; canyon p0 53-56 m ; dunes, jade, banquise : aucun croisement. Pas d'anomalie.
- Routes roulées (nuages, espace, grotte) : la mesure en altitude monde est fausse (la dalle est couchée) ; on se fie à `info.contacts` : voir A7.

## 4. Tremplins, raccourcis, dbgTrace

- Tremplins qui atterrissent hors route (`sc-saut.mjs`, `sc-vrai-saut.mjs`) : ces scénarios passent par `dbgTrace` dans le navigateur, hors périmètre (pas de navigateur). Non vérifié.
- `dbgTrace({graine})` ne prend plus la graine : CONFIRMÉ toujours vrai. `code/rendu/traces-pneus.js:157` teste `/^\s*at newTrack0\b/` alors que le générateur s'appelle `newTrack0G` (`traces-pneus.js:95`) : `\b` ne coupe pas entre `0` et `G`, la regex ne matche jamais. Correctif (SÛR) : `/^\s*at newTrack0G?\b/`. Les scénarios `sc-*` et la comparaison par graine du banc raccourcis du navigateur restent faux ; `raccourcis.cjs` en node n'est pas touché (il appelle `genCtrl` directement). Je n'ai pas relancé `raccourcis.cjs` à grande échelle.
- Déterminisme : lot 4 = 84/84 routes identiques au lot 1, et aucun `Math.random` dans les générateurs de route (les occurrences de `Math.random` de `code/maps/` sont dans le décor, les effets, `foret-route.js:477` pour le décor).

## 5. Les 10 lignes importantes

1. 4860 routes (10 maps x p0/p10/p20 x 162 graines) : 0 erreur, 0 NaN, 0 infranchissable, 0 zigzag, 0 route de secours. Génération déterministe, indépendante de l'ordre.
2. CANYON : le contrôle `sep>560*SQ` (canyon-route.js:244) échoue sur 100 % des routes (sep réel 204-352 m) : 14 essais pour rien à chaque génération. SÛR.
3. La route dépend du palier (modules, sens du 1er virage, longueur) : voulu par vPalier/rayonPalier, mais deux appareils n'ont pas la même route pour la même graine. SÛR.
4. FORÊT : « 1630 ms » est une NOTE d'essai, pas un temps ; vrai temps 65-322 ms, mais 41 % des essais du p0 sont rejetés (malus portail / croisements) et jusqu'à 16 essais. PROBABLE.
5. BANQUISE : crêtes (bkBosses) et douilles (bkGodille) sont voulues ; note 9-10 au p0 vient des droites de 9-12 s en mètres fixes ; normal, sans effet sur le jeu.
6. `dbgTrace({graine})` cassé : regex `newTrack0\b` vs `newTrack0G` (traces-pneus.js:157). SÛR ; invalide les scénarios sc-saut / sc-vrai-saut.
7. GROTTE : 3 routes sur 486 gardent un contact de dalles (g40 p0, g1039 p0, g52 p20) ; pas de repli « dévers seul » pour la grotte (route-sans-haut.js:242). PROBABLE.
8. CANYON p20 : coude (segment de 4-7 m entre deux de 50 m) sur g16 et g35 ; point doublon en fin de dessin. PROBABLE.
9. NUAGES g7 p0/p10 : 7 crêtes + pente 1,5 = le looping compté comme défaut (route-rythme.js:101). Sans gravité.
10. VILLE/CRYPTO : aucune route sous 46 m de hauteur libre sur 3 plages x 3 paliers ; seul cas limite crypto p0 à 46 m (graine de la plage 1000-1040).

## 6. Reste à compléter

- `grotte.cjs` (moyennes 1-60) : p0 3,02 vir/km, droite max 3,8 s, raccourcis 1,15/km ; p10 2,29 vir/km (sous la cible 2,5), raccourcis 0,92 ; p20 1,24 vir/km, chaînes 0,44/km, raccourcis 0,53/km (sous les cibles 0,6 et 1 de RACCOURCIS.md) ; conflits 0. Les contacts du banc réel (A7) n'apparaissent pas ici : le banc node n'applique pas le même routage.
- `raccourcis.cjs` / `foret.cjs lot` non lancés à grande échelle.
- `dunes.cjs` (nom exact `douilles.cjs`) mesure les micro-virages de nuages/espace sur 6 graines : non relancé ; les douilles sont déjà dans la fiche (colonne douilles : 0-1 par route, voir section 2).
