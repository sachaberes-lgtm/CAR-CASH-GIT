# route-beton — notes (passe graphismes, 2026-10-14, périmètre de la nuit : GRATUIT pour la puce)

Demande de Sacha : « Retravaille la texture de la route pour que ça soit un beau béton bien brut et bien, bien mat. »
Copie `gfx/wt/route-beton` (branche `gfx/route-beton`, 4 commits) · banc `gfx/banc/route-beton/` · captures `gfx/shots/route-beton/`.

## Ce qui a changé (tout dans `VERSION PRINCIPALE/index.html`, bloc « LE BITUME v2 »)
- `betonPeint(N)` (NOUVELLE fonction pure, juste avant `asphTex`) + `asphTex()` : la MÊME texture 256², repeinte — granulat serré, laitance
  et coulures (étirées dans le sens de la route) en 8 paliers nets, 3 micro-fissures qui bifurquent, bullage en grappes, teinte chaude/froide
  par grandes plages, et les JOINTS DE DALLE sur les bords de la tuile (en long : franc ; en travers : plus discret ; arête de chanfrein,
  salissure autour). Réglages en tête de la boucle finale : `JL` .36 / `JT` .22 (force des joints).
- `ASPH_K` 1.7 → .57 : une tuile = une dalle de 7 m (route de 56 m = 8 dalles, un joint sous la ligne centrale). Même lecture, même shader
  (seule la constante du texte change ; clé de programme inchangée).
- `roadMat()` : `color` 0x322e40 → `BETON.col` 0xa39c8e, `specular` → 0x000000, `reflectivity` → 0. Aucune ligne de GLSL ajoutée.
- `BETON` (nouvel objet de réglages, avant `ROAD_U`) et, en fin de `routeTick()` : `uLift` en gris minéral (× LVL.route, 22 % teinté par la
  brume du lieu), `uTeinte` × teinte globale × (1 − .24 × pluie), `uSheen` × pluie (0 à sec), `uGlace` → 0 sauf routes de jade de Léo (styles 0-4).
- `ROUTE_JOUR` [.86,.94,.86] → [1.10,1.07,1.0] · `ROUTE_JADE` [.95,1.04,.86] → [1,1,.96] (la base n'est plus violette).
- `BITUME_MOUILLE` : UNE valeur, le film d'eau hors flaque .45/.55 → .24/.76.
- `window.dbgBeton({t:[r,g,b],lift,lift0,amb,sheen,mouille,ville,espace,jour:[…],jade:[…]})` (banc).

## Compteurs (les ms ne valent rien ici)
Lectures de texture par pixel de route : inchangées (1 carte + le cube, comme avant). Branches : inchangées ; à sec `uGlace` = 0 → la
branche « bitume glacé » est SAUTÉE (c'était vrai seulement en ville). Programmes : 0 de plus. Texture : même 256², peinte une fois (~80 ms node).

## Vu au banc (2 ouvertures, 0 erreur JS) — `planche-avant-apres.png`
nuages midi · nuages nuit · ville pluie · jade soir · espace midi (couché), enchaînés par `chaine.cjs` (dbgClassique + dbgSaut).
Jade soir et espace midi : le béton se lit tout de suite (gris chaud, dalles, fissures). Ville pluie : sombre, mat hors flaques, reflets dans les flaques.
Nuages nuit : très sombre (texture peu lisible). Nuages midi : gris-bleu sombre avec ROUTE_JOUR .9 → relevé à 1.10/1.07/1.0.

## Doutes / ce qui reste
- Le joint EN TRAVERS revient tous les 7 m (la tuile) : à 300-500 km/h et 30 i/s il peut CLIGNOTER de près. S'il gêne : `JT` → 0 dans `betonPeint`.
- `dbgBeton({col})` ne change pas la couleur à chaud (les tranches ne sont pas dans `trackMeshes`) : régler par `t`.
- Ligne centrale (blanc lavande .5) : moins contrastée sur béton clair (jade, espace) — à monter côté marquages.
- Flancs de la dalle (`trancheMat` 0x1c0430, encre violette) : pas touchés.
- La planche node a un rendu un peu postérisé (décodeur maison) : se fier aux PNG d'origine.

## PROPOSITIONS (plus lourdes, hors périmètre de la nuit)
1. Joints PROCÉDURAUX dans le shader (dalles de 16 m, anticrénelés par fwidth, teinte et décalage de texture PAR DALLE) : pas de clignotement,
   pas de répétition. Brouillon écrit puis retiré ; aperçu `shots/route-beton/beton-dalles.png`.
2. Sauter la lecture du cube et le Blinn-Phong à sec (chunks patchés) : −1 lecture de texture par pixel de route.
3. Flancs en béton sombre + marquages blancs francs.

## POUR LES AUTRES
- Ambiances : la route n'est plus indigo ; `uLift` suit 22 % de la couleur de brume. Nuages nuit/midi : la lumière y est très froide sur un gris neutre.

## 3e ouverture (debout 390×844, nuages midi) — NON CONCLUANTE pour la route
La course tourne debout, 0 erreur JS, mais la capture est tombée en plein VOL : aucune route à l'image. Donc NON VÉRIFIÉ À L'IMAGE :
la route debout, et `ROUTE_JOUR` [1.10,1.07,1.0] (posé après la 2e ouverture, d'après la variante « t ×1,25 » vue sur jade/espace).
Budget de 3 ouvertures épuisé. ⚠ Les ouvertures 2 et 3 sont parties avec une charge 1 min de 26 et 30 (au-dessus des 25 demandés).
