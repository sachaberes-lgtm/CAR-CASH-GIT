# CANYON — la refonte des modules (2026-11-12) : passation

Branche `canyon-modules-2026-11-12` (partie d'origin/main v1496, **non poussée, cache non incrémenté**). Demande de Sacha : « de loin la map la plus dure… des modules
plus exploratifs : une gorge serrée et puis, bam, une plus grande gorge avec une rivière en dessous, une route le long de la falaise… plus de passages larges… modules
variés, sans grand demi-tour où il faut aller en arrière… qui exploitent beaucoup les parois, agréables à rider ». Il a validé le design et **le remplacement des trombones**.
Puis : « fais d'abord ce que seul Fable peut faire, laisse le reste pour un autre modèle » — ce fichier est ce reste.

## Ce qui est fait (le cœur)
- `code/maps/canyon-route.js` : `CY_REF` (le grand commentaire dit tout) ; dans `genCanyon`, la branche `if(CY_REF.on){…}` : les pièces `gorge`, `meandre`, `traversee`,
  `toboggan`, `vire`, `riviere` (+ saut de la cascade), les modules `courbes`, `entonnoir`, `tremplin`, deux paquets de modules (T technique, F coulé), la liaison choisie
  selon ses voisines (`lienR`), le jeu de pièces tiré par la graine seule (`rj`), les gabarits (`gab()` → `CY.gab`). Dans `cyBatitG` : les gabarits deviennent des clés de
  profil (fente, ouvert, large, vallée, corniche), `S.zL` (le serrage s'efface), `S.co` → `S.of` (l'axe de la vallée décalé : la corniche). Dans `cyProfil` : le décalage.
- `code/maps/canyon-murs.js` : `cyMurPose(C,Q,VW,GA)` gère plusieurs dévers (grand mur 86°, vire 58°, toboggan 32°), `cyMurBank(…, mx9)`, `dbgCanyonGab()`.
- `code/maps/canyon-mine.js` : `dbgCanyonSonde` rend aussi `of` et `zL`.
- `?sans=canyonrefonte` = le canyon d'avant. Au banc Node ses chiffres sont identiques à ceux d'avant la refonte (40 graines) ; l'égalité au bit près en jeu n'a pas été contrôlée.
- Bancs : `node outils/banc-routes/canyon.cjs graines=1-80 palier=0 [--v] [--json=f]` (Node, le vrai genCanyon ; `SEARCH="?sans=canyonrefonte"` pour l'avant ; trois lancements de suite rendent les mêmes chiffres) ·
  dans le vrai jeu : `node outils/banc-maps/serveur.cjs 8231` puis
  `node outils/banc-maps/banc.cjs gen --carte=canyon --meteo=midi --graines=1,2,3 --port=8231 --cdp=9431 --profil=canyonref --auditfile=outils/banc-routes/canyon-page.js`
  (règle d'or, couloir, pièces, gabarits, distance de la falaise et largeur du vide de chaque corniche) ; photos : `banc.cjs vue … --s=1130,1290,1500`.

## Mesuré
| (palier 0) | avant (40 graines) | après (80 graines) |
|---|---|---|
| demi-tours par canyon | 1 (le trombone : 1,5-2 km, 30 % de la map) | 0 (cap à 84° au plus du cap moyen) |
| gorge serrée (part de route) | 64 % | 54 % · corniche 16 %, large/ouvert 27 %, fente 2 %, vallée 1 % |
| virages/km · rayon mini (× rP) | 2,3 · 1,16 | 3,1 · 1,26 |
| note de rythme (moyenne) | 84 (les écarts du trombone) | 3,7 |
| ordres de pièces différents | 10 sur 40 | 66 sur 80 ; 4 pièces par canyon, toutes les pièces sortent |
| descente | 25 % | 26 % |
Dans le vrai jeu (3 graines, ordi) : règle d'or `dessus 0, dessous 0`, marge mini 27-34 m ; aucun point du couloir dans la roche ; en corniche la falaise passe à
12-16 m du bord, le vide fait 130-460 m, la route est 115-160 m au-dessus du lit ; toboggan : 29° de dévers ; construction 170-210 ms. Photos vues : le goulot, la
révélation (une cascade naît au pied : le lit tombe de ~100 m), la corniche, le toboggan. Pilote auto 75 s sur 4 graines : aucune mort (mais 1,2 à 4,5 km parcourus seulement).

## ⚠ À dire à Sacha
Sans boucle, **aucun raccourci « rentable » n'est possible** au palier 0 (rayon mini 68 m, 2-3 s de vol = 156-234 m : un détour sans demi-tour n'allonge la route que de
quelques mètres ; il faut ~360° de virage pour que la route repasse à côté d'elle-même). Le « Grand Méandre » promis comme raccourci est donc devenu deux coudes en
corniche reliés par un pont ; le canyon gagne des SAUTS (cascade, tremplin) mais n'a plus de raccourci de distance (règle RACCOURCIS : 0,4-0,6/km avant). S'il en veut un :
remettre `rac` (le trombone) comme pièce rare dans `autres` — tout le code est encore là.

## Reste à faire (dans l'ordre)
1. **Vérifier large** : `banc.cjs gen` sur 12 graines × (midi, soir, nuit, orage), ordi et `--tel=1`, avec `canyon-page.js` → règle d'or et couloir à zéro partout ;
   paliers 10 et 20 (`--q=palier=…` : voir comment les autres bancs imposent le palier). Contrôler `--q=sans=canyonrefonte` (l'ancien se bâtit toujours).
2. **Photos des pièces pas encore vues** : la rivière (vallée) et le saut de la cascade, la vire, le méandre et son pont, la traversée, l'entonnoir, le tremplin
   (`dbgCanyon().hz.p` donne les pièces et leurs longueurs, `dbgCanyonGab()` les abscisses).
3. **Course réelle** : `outils/banc-course/course.cjs` sur le canyon ; le saut de la cascade et le tremplin avec `outils/banc-routes/saut-page.js` (la pose : prévue
   30-180 m après le début de la réception, 3,1-3,4 s de vol — calcul, pas mesuré en jeu) ; la tenue sur la vire et le toboggan (`dbgCanyonMurs()` : roulis 27,7°/s
   mesuré sur le toboggan pour une borne de 24).
4. **Le goulot** (gabarit `fente`) : ses parois sont des nappes violettes étirées (les étroits, eux, ont un maillage cuit : `C.cou` / cyCouloir). Soit lui donner ce
   maillage, soit adoucir la fente (`st`, `wF` dans `prof()` de cyBatitG).
5. **Le lit de la rivière** : mesurer la hauteur de la route au-dessus de l'eau dans le gabarit `vallee` (visée : 16-40 m) ; si trop haut, allonger la descente d'entrée
   (`large(Math.max(200*LL,2.3*VW),-.36)` dans `PC.riviere`).
6. **Le décor** ne connaît pas `S.of` : peupliers, éboulis et cheminées (`cyMonuPrevoir`, `cyMonuments`) se posent comme si la rivière était sous la route — en corniche,
   vérifier sur photo qu'aucun n'est planté dans la falaise ; les ramener au bord de l'eau (l'axe de la vallée est à `S.of` m de la route, + = à droite).
7. **Les petites interactions promises, pas faites** : des pièces en haut des virages relevés et en file au-dessus du vide ; des cheminées de fée à la corde des virages.
8. **Réglages** : gorge serrée 54 % (visée 45 %) ; `serreKm` 0,09 pour une cible de 0,5 dans `RYTHME_CIBLES.canyon` (voulu : baisser la cible) ; au-dessus du palier 10 un
   canyon ne tient que 3 pièces.
9. **Livrer** (seulement avec l'accord de Sacha) : `cashcar-vNNN` +1 dans `VERSION PRINCIPALE/sw.js`, mettre à jour la ligne `maps/canyon-route.js` de `code/ORDRE.txt`,
   fusionner origin/main, `node code/assembler.cjs --depuis-morceaux`, `--verifier`, gardes, pousser À PART, vérifier `/jouer/sw.js` en ligne.
