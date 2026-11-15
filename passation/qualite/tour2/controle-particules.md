CONTRÔLE ADVERSE — lot « particules » (qa/particules, 7b770c280)

J'ai lu le diff complet (21 fichiers de code), cherché les autres émetteurs et regardé 4 photos.

**Ce qui est bon**
- Aucun fichier interdit touché : ni maps/*, ni piste-prebati, ni route-sans-haut, ni economie/*, ni interface/boutique-*.
- La coupe se fait là où l'effet émet. Exemples : `if(!pnetCoupe(..))`, ou `rp=pnetCoupe?0:emiN(..)`. Aucun objet n'est retiré, donc aucune référence ne pointe vers un objet qui n'existe pas.
- `pnetCoupe` ne coupe qu'en course (`running && !garageOn`).
- `?plus=particules` rend bien l'avant. `PNET` vaut faux, donc toutes les gardes laissent passer et le tirage aléatoire reste le même qu'avant.
- `ramassage.js` n'est pas modifié. La mort, l'impact mortel et le mode boom (boucle-3:599-613, impact.js:172-206) ne sont pas touchés.
- Ce que gardent les fonctions coupées :
  - `figBoum` garde le coup de rein (`volMonte`).
  - `heistFire` garde le son et la poussée.
  - `startFall` garde le bruit du bord.
  - `dropChip` garde le son de tôle.
- Ce qui reste par image : un appel `pnetCoupe` par effet (une comparaison et un compteur), un coût négligeable.
- `dbgParticules` n'est qu'un crochet de banc.

**Défauts sérieux** : aucun.

**Défauts mineurs**
1. `code/maps/murs-parois.js:17` : quand la caisse frotte une paroi, elle crache des étincelles d'or (`sparkBurst(sparkGold…)`, au plus toutes les 90 ms). C'est un émetteur de la caisse oublié. Il est dans un fichier interdit, mais il n'est pas signalé. Le rapport range même tout maps/* en « décor ». Il faut l'ajouter à « à trancher / hors périmètre ».
2. `code/maps/glacier-verglas.js` : sur le glacier, la caisse jette des éclats, de la brume, de la poudre et du givre. Lignes 75-79 (`fx.eclat`, `fx.brume` au flanc qui glisse), 154, 171, 205-209 et 295-300. C'est le même cas que le point 1 : fichier interdit, non signalé. Le glacier n'est plus dans le tirage de main, donc l'impact est faible.
3. `code/moteur/boucle-6-hud.js:255-260` : une spirale d'or tourne autour de la caisse **en course** à chaque changement de MOTEUR (`engSwapT`). Le rapport (point 6) l'appelle à tort « changement de caisse ». C'est la dernière gerbe liée au capot (la scène « on bricole sous le capot ») : à trancher par Sacha, nommée correctement.
4. `code/voitures/atchoum-feu.js:26-31` : « elle crache », une langue de feu aux pots toutes les 0,4 à 1,4 s quand elle roule. C'est le même effet que le retour de flamme, que le lot coupe pourtant. Le laisser dans « à trancher » est acceptable, mais il faut préciser que c'est un émetteur permanent, pas seulement l'éternuement.
5. Les photos prouvent peu :
   - `avant-debout-nitro2` et `net-debout-nitro2` ne montrent pas le même instant : la première est en drift avec les arcs bleus, la seconde au nitro.
   - Dans `net-couche-vol1` et `avant-couche-vol1`, la caisse est **au sol**, pas en vol.
   - Il manque les photos des points « à trancher », que la consigne demandait.
   - Les chiffres du banc compensent : il ne naît plus que sparkGold, sparkBlue et le jus.
6. Il n'y a pas de vérification image par image du ramassage des pièces. Le risque est faible : le code n'a pas bougé et sparkGold naît toujours au banc.
7. Avec la coupe, le bruit de tôle s'entend sans bouts de tôle visibles (`billets-devises.js:54`). C'est déjà signalé dans le rapport. Il serait plus cohérent de couper aussi le son, mais c'est à Sacha de le dire.

**Doutes (pas des défauts)**
- `voitures/gamme-6.js:196` : de petites flammes en pixels, dont une étincelle qui monte. Elles font partie du dessin de la caisse, donc je les laisse.
- Les éclats de paroi et l'étoile de `impMini` sont gardés et listés (point 5 du rapport). Ce sont pourtant des cubes qui volent près de la caisse : je les couperais probablement.

**VERDICT** : fusionnable. Avant de fusionner, il faut compléter le rapport (`passation/qualite/particules.md`, liste « à trancher par Sacha ») avec les points 1 à 4. Aucune correction de code n'est obligatoire.

Fichiers relus : /Users/sachaberes/cash-car/qualite-particules/passation/qualite/particules.md et /Users/sachaberes/cash-car/qualite-particules/passation/qualite/photos/particules/