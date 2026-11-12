# ESPACE — la refonte « Gravity » (2026-11-12) : ce qui est fait, ce qui reste

Sacha : « Refonte du niveau espace. Le ciel, j'aime pas, il faut que ça soit plus réaliste, trop cartoon : fais comme si on était dans Gravity, c'est plus simple, ça allège
le code. Dans la génération de terrain il y a trop de modules chiants, par exemple le grand U où il faut aller en arrière : il faut des modules qui vont vers l'avant
(pas toujours, mais souvent), pas de grands demi-tours ni de trucs compliqués. Des modules qui incitent à beaucoup voler, sans que ce soit forcé ; des longues lignes ;
contemplatif ; des passages secrets fun ; plusieurs modules, des grands, de la variété (on a l'impression que c'est toujours les mêmes niveaux) ; tu peux rallonger un peu ;
jouer à l'endroit et à l'envers, prendre un raccourci et arriver la tête en bas ; que ceux qui n'ont pas envie de sauter ne sautent pas ; que la route reste crédible. »
Puis : « fais d'abord ce que seul Fable peut faire, laisse le reste pour un autre modèle. » → la CONCEPTION et le CŒUR DU GÉNÉRATEUR sont faits ; le reste est listé au § 4.

Branche `espace-gravity-2026-11-12` (partie d'origin/main v1497), **rien de poussé, sw.js pas monté**. Variante : `?espace=ancien` = l'orbite d'avant, au tirage près.

## 1. Ce qui a été mesuré AVANT (outils/banc-routes, palier 0, 16 graines)
Chaque route d'orbite n'avait que DEUX temps forts, toujours les mêmes : le **filet** (2,5 km, 32 s : un virage, 300 m d'éloignement, un demi-tour, le retour — c'est « le grand U »)
ou le **puits** (une spirale de 22 s), puis le **couloir**. Photos du ciel d'avant (Terre bleu électrique, Mars orange, Saturne, étoiles à branches roses) : dans le scratchpad de la session, non gardées.

## 2. La règle de conception (à ne pas perdre)
- En orbite la caisse **ne quitte jamais la route d'elle-même** (aucun décollage de crête dans le moteur : `startFall` ne part que du bord, du saut nitro au double-tap, d'une figure). On ne vole que si on le VEUT :
  le **saut nitro** (`veqSaut`, impulsion 21, 20 % de la jauge, interdit sous la dalle : ~2,5 s en l'air à niveau en gravité d'orbite, gK = 0,5) ou la **sortie par le bord**. Jauge de vol en orbite : 5 s.
- Le haut d'un vol est celui de la face QUITTÉE et ne bouge plus (`VOLR_FIGE`) ; on se pose sur la face qu'on touche, **dessus ou dessous** (`side` = ±1 : rouler sous la dalle est un vrai mode de jeu).
- Donc un module de vol = **une route sage et belle qui s'écarte de la ligne droite (vers le bas ou de côté) puis y revient** : qui roule suit le détour, qui vole tire tout droit ; et la route **remonte vers
  celui qui vole court** (la paroi d'en face le rattrape). Aucun vide obligatoire, aucun tremplin forcé.
- Vers l'avant : un détour qui ne recule jamais ne peut pas faire gagner beaucoup de mètres (au mieux 1/cos de l'écart). Le plaisir visé est **le vol lui-même** (3-4 s de plané, la Terre dessous, des figures), pas le gain :
  les gains sont de 60-150 m (le jeu crie RACCOURCI dès 60 m). C'est un choix assumé contre la règle « ≥ 0,6 raccourci de 150 m par km » de passation/RACCOURCIS.md, qui ne s'obtient qu'avec des boucles.

## 3. Ce qui est FAIT (code/maps/ville-entree.js, code/gameplay/route-sans-haut.js, route-briques.js)
- `ESP_V3` (route-sans-haut.js) et `EV3` (genCtrl1) : le plan de l'orbite est toujours « axe », cap tenu à 32-56° de l'axe (mêmes tirages) ; genre de phrase `ORBITE` (1-2 grands virages de 40-85° à 2,6-3,8 rP par montée,
  souffles de 2,6-4,4 s, un balayage sur deux) ; budget de torsion : un retournement/passage à l'envers + une grande courbe par route ; `DUREE_ALLURE.espace` 1,2 → 1,5 (**+25 % de longueur** : 9,1 km / ~58 s réelles au palier 0).
- Sortent de l'orbite : filet, puits, fronde (180-230°), double corde, orbite de transfert, slalom. Le mur devient LA GRANDE COURBE (88-118° à 3,4 rP), la fronde du couloir tourne de 92-112°.
- Cinq modules neufs (un temps fort sur deux est tiré à tour de rôle dans faille / écart / cascade / terrasses ; les autres dans le paquet complet avec houle, esses, débris, looping, à l'envers, grande courbe, retournement) :
  | module | `fig` | pour qui roule | pour qui vole |
  |---|---|---|---|
  | LA FAILLE | faille | un piqué de 46-54° dans une gorge de ~105 m, on remonte en face (grand huit) | saut nitro par-dessus : ~330 m au palier 0, bord d'en face 25 m plus bas, gain ~65 m ; trop court = posé sur la paroi d'en face |
  | LA CASCADE | cascade | 2-3 failles de plus en plus petites (×1 · ×0,78 · ×0,6) | un saut par faille, ou un long plané à la nitro |
  | LES TERRASSES | terrasses | 3-4 longues lignes droites en gradins, une marche de ~29 m entre deux | sauter d'une terrasse à la suivante (ou celle d'après) |
  | LE GRAND ÉCART | ecart | la route s'écarte de 54-62°, grand virage de 108-124°, revient dans l'axe plus bas, puis 2,3 s de ligne droite à 12 % | sortir tout droit par le bord extérieur du 1er virage, planer (~380 m de corde), se poser sur la ligne droite |
  | LE GRAND RETOURNEMENT | retourne | une ligne droite où la dalle se retourne en 3,4 s, ~3 s la tête en bas (la Terre au-dessus), retour | sauter avant la vrille : on retombe sur l'AUTRE face (« tu ne sais plus si tu es à l'endroit ») |
  Tous `{g:1}` (forme protégée), les quatre premiers `plat:1` (ni dévers ni houle). `fV(l,p0,p1,n)` = un tronçon dans le plan vertical. `?fort=faille|cascade|terrasses|ecart|retourne` : tous les temps forts jouent ce module.
- Banc Node (16 graines, palier 0) APRÈS : 4-5 temps forts par route (terrasses ×0,8 · cascade ×0,6 · faille ×0,6 · écart ×0,4 · grande courbe ×0,2 · retournement ×0,13 · à l'envers ×0,13 + le couloir), 0 contact, 0 vrille au hasard,
  5-7 % de la route hors de l'endroit, pente 12 %. `outils/banc-routes/charge.cjs` lit l'allure 1,5.
- **NON VÉRIFIÉ dans le vrai jeu** : aucun module n'a été roulé ni sauté en page. Les hauteurs de vol (`dr` de la faille, `dh` de l'écart) sont calculées (gravité de vol d'orbite ≈ 11,5 m/s², croisière vD) — à régler.
- index.html est assemblé et les gardes passent (voir le commit) ; `VERSION PRINCIPALE/sw.js` n'a PAS été monté.

## 4. Ce qui RESTE (dans l'ordre)
1. **Prouver les modules dans le vrai jeu** (recette : mémoire « banc-sauts-vrai-jeu », `node outils/banc-maps/serveur.cjs <port>` puis `banc.cjs gen --carte=espace --graines=1,2,3 --q="fort=faille" --roule=30 --photos=1`) :
   a) rouler chaque module au pilote auto (`?fort=` un par un, paliers 0/10/20, `--tel=1`) : la caisse reste collée dans le piqué de la faille et dans les marches ? la caméra tient (piqué de 50°, remontée de 100° en ~2 s) ?
      pisteTord accepte les zones (`dbgTorsion()` / `TORD.info.zones`, dernier chiffre à 1) ? rien ne casse au portail ?
   b) sauter : étendre `outils/banc-routes/saut-page.js` (il ne connaît que filet/puits/boucle) aux nouveaux `fig`, avec un vrai `veqSaut` au bord de la faille / d'une terrasse (dbgAuto({saut}) ou appel direct) et la sortie
      par le bord pour l'écart ; relever pose / mort / gain à 78, 105, 140 m/s. Régler : faille1 (`Rv` 1,3 vD, `Ls`, `dr` 0,36 vD, angle 46-54°), terrasses (`th`, `Rv`), écart (`dh` : vol à 1,5 vD, constante 11,5).
   c) à l'envers : sauter 0,5 s avant le retournement, vérifier qu'on se pose dessous (`side<0`) et que la suite reste jouable jusqu'au portail (sous la dalle : pas de saut nitro, pas de figures de route).
2. **Les faire VOIR** : la paroi d'en face de la faille se voit (vue du volant au banc silhouette) ; l'écart et les terrasses demandent sans doute une ligne de pièces dans l'axe du vol (voir comment le filet pose ses repères :
   `FILETMARK`, et le ramassage) — c'est ce qui « incite » sans forcer. À faire après la preuve des trajectoires.
3. **Le rythme** : la note du directeur (v2.cjs) est montée au palier 0 (5,7 : 1,1 virage/km, une droite de 7 s — voulu, contemplatif). Soit adapter `rythmeCible('espace')` (route-rythme.js), soit vérifier que le meilleur-de-N ne
   choisit pas systématiquement les routes les plus tortillées. Une graine sur six revient encore près de son départ (plan « axe » souple) : resserrer `capB` si Sacha le voit.
4. **LE CIEL façon Gravity** (pas commencé : aucun fichier du ciel n'a été touché). Direction arrêtée :
   - UNE planète : la Terre, énorme (orbite basse : horizon en courbe large), palette réelle (océans bleu nuit, reflet du soleil sur la mer, nuages en systèmes avec leur ombre, continents ocre/vert désaturés), atmosphère = liseré FIN
     bleu-cyan, terminateur à frange orangée. Mars, Saturne (orbite-saturne.js), les roches (orbite-roches.js) : SUPPRIMÉS pour de vrai (fichiers, lignes d'ORDRE.txt, `PLANETES` de niveaux.js) — « ça allège le code ».
   - Les trois ambiances (matin/midi/soir : garder les clés de `SF_CARTES.espace.m`) deviennent trois moments de l'orbite : plein jour · terminateur (lever de soleil sur le limbe) · face nuit (villes, airglow). Libellés `mt` à renommer + I18N.
   - Vide noir ; étoiles petites, blanches, rares côté jour ; plus d'étoiles-vedettes à branches ni de poussière cosmique (orbite-embellie.js). Soleil : petit disque blanc dur (orbite-soleil.js, fixe dans le monde), ombres noires, earthshine discret.
   - Débris : garder la ferraille grise et les Starlink, dans les trois ambiances. La lune troll (frénésie seulement, demande de Sacha) : ne pas toucher.
   - Route en orbite : ramener le liseré violet néon vers un blanc froid sobre, sans perdre la lisibilité. Règles : shaders compilés à l'init, rien sur `IS_MOBILE` (ALLEGE / PAL.b), pas de texture géante ni de passe plein écran en plus.
   - Juger EN IMAGE : `banc.cjs vue --carte=espace --meteo=matin|midi|soir` (+ `--tel=1`), comparer à l'avant, vérifier qu'une autre map n'a pas bougé.
5. **Livrer** : repartir d'origin/main à jour (⚠ la session NUAGE retouche aussi `ville-entree.js` : fusionner, puis `node outils/banc-routes/non-declares.cjs` et `git show --remerge-diff`), `node code/assembler.cjs --depuis-morceaux`,
   `--verifier`, gardes (allege, charte, demarrage), monter `cashcar-vNNN` dans sw.js, pousser À PART, vérifier `/jouer/sw.js` en ligne.
