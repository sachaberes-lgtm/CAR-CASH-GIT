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

## 3 bis. La suite du 2026-11-12 (Opus, branche `espace-gravity-suite-2026-11-12`, partie de 3d7eeafc) — PROUVÉ DANS LE VRAI JEU
Bancs (Chrome headless, MUET) : `outils/banc-routes/roule-page.js` (le pilote auto roule la route entière ; par module : la caisse quitte-t-elle la dalle, la caméra — distance, angle, sous la
dalle ? ; `pmot=N` monte le moteur puis passe le portail avec l'orbite imposée : la zone suivante est bâtie au palier N), `outils/banc-routes/saut-page.js` (étendu : le VRAI double-tap
`dbgSautFig(0,0)` avec `&froute=0` à la lèvre de chaque faille / cascade / terrasse, la sortie par le bord et le saut nitro à l'entrée de l'écart, le saut avant / au début du retournement ;
POSE / MORT / RESTE, face, gain, durée de vol ; la réanimation `dbgChance('bon',3)` puis `dbgJouer()` avec l'orbite imposée pour continuer sur la même route), `outils/banc-routes/zones-espace.cjs`
(Node : les zones refusées par pisteTord). Lancement : `node outils/banc-maps/serveur.cjs <port>` puis `node outils/banc-maps/banc.cjs gen --carte=espace --graines=1,2 --auditms=900000
--q="fort=faille&froute=0&vsaut=105" --auditfile=outils/banc-routes/saut-page.js` (vitesses 78 / 105 / 140).

**Ce que le banc a trouvé, et ce qui a été changé :**
1. **Sauter dans la remontée de la faille tuait à coup sûr** (6/6, « air ») : le haut d'un vol d'orbite était la dalle quittée, penchée à 50° ; la caisse filait le long de la pente, la route tournait
   sous elle, la jauge de 5 s la tuait. → `ESP_VOLM` (route-sans-haut.js) : en orbite, comme au canyon (`murRoule`), le vol ne suit la dalle que si elle est vraiment couchée (> 25° de roulis) ;
   sinon le haut du monde. Et **le saut nitro est refusé dans une montée de plus de 7°** (`espSautRefuse`, le « tchk » de la nitro à vide, comme sous la dalle). Essayé puis abandonné : borner la
   montée du vol (la caisse passait SOUS la route qui continuait de monter et s'y posait dessous). `?volmonde=0` = avant.
2. **Les terrasses tuaient dès 105 m/s** : un saut d'orbite dure ~3 s à toute vitesse ; des terrasses de 1,2-1,6 s faisaient survoler la suivante et celle d'après. → 2-3 terrasses de 4,6-5,2 s,
   marches de ~22 m (24-30°).
3. **Le 1er temps fort tombait parfois avant s0 + 60 m** : pisteTord le refusait (la dalle gardait son dévers : un saut de faille y est mort). → l'ouverture de la phrase d'orbite passe à 2,4-3,2 s.
   `zones-espace.cjs` : 0 zone refusée sur 20-30 graines × paliers 0/10/20, avec et sans `?fort=`.
4. **L'écart** : le geste qui marche est **sortir tout droit par le bord du 1er virage** (avant retouche : posé 8/9 de 78 à 140 m/s, gain 85-104 m, 3,2 s de vol). Le saut nitro à l'entrée
   vole trop longtemps dès ~100 m/s (mort « air »). Deux réglages essayés (chute bornée à 48 m ; écart resserré à une corde de 230 m) ont cassé la sortie par le bord (vide) : **rendu tel qu'il était**.
   ⚠ **À REPRENDRE** : remesuré sur 2 graines (8 écarts × 3 vitesses), la sortie par le bord ne se pose que 13 fois sur 24 (quelques ratés sont du banc : caisse mal replacée) ; sur certains
   écarts la caisse ne quitte la dalle qu'au 2e virage (~330 m après le début au lieu de ~170) et part dans le vide de l'autre côté. Le saut nitro à l'entrée : 5/8 à 78 m/s, 2/8 à 105, 0/8 à 140.
   Qui ROULE l'écart ne risque rien (roulé sans décrocher à tous les paliers). Piste : comprendre pourquoi la caisse non braquée reste sur la dalle dans le 1er virage (aide au maintien de cap ?),
   puis rendre le 1er virage plus court que la sortie (R1 < R2) ; les fils d'or de l'écart (sortie tout droit) ne trouvent aucune pose à la croisière de conception : il n'y en a donc pas.
5. **Le retournement** : sauté 0,5 s avant ou au début de la vrille, on se pose **toujours sur la même face** (vol 0,3-1,3 s). Ce n'est pas un réglage : la dalle tourne autour de son axe et vient
   balayer la caisse par le dessus vers 90° ; avec ~4 m de hauteur de saut on ne peut pas passer de l'autre côté. Une descente pendant la vrille (essayée) allongeait le vol jusqu'à la mort :
   retirée. Le module reste un passage tête en bas contemplatif, le saut y est sans danger (sauf ~1/8 à 140 m/s).
6. **LES FILS D'OR** (`espFilsOr`, pouvoirs-grisants.js, `?filsor=0` = sans, `dbgFilsOr()`) : au-dessus de chaque lèvre de faille / cascade / terrasse, une file de pièces EN L'AIR (`p.air` :
   prises en vol seulement) dessine le saut nitro ; à l'écart, la sortie tout droit. Trajectoire intégrée comme le vrai vol à la croisière de conception ; pas de pose en vue = pas de file.
   ~70-130 pièces par route quand tous les temps forts sont des failles (`?fort=faille`). Mesuré : 5 sauts de faille à la lèvre (78 et 105 m/s) ramassent 70 des 122 pièces de la route.

**LES CHIFFRES FINAUX** (sauts : graines 1-2, `?fort=<module>`, le vrai double-tap ; posés / essais · gain médian (route sautée − distance volée) · vol médian) :
| module, geste | 78 m/s | 105 m/s | 140 m/s |
|---|---|---|---|
| faille, saut à la lèvre | 8/8 · 55 m · 3,7 s | 7/8 · 67 m · 3,0 s (la mort : zone refusée, corrigée depuis) | 8/8 · 74 m · 2,5 s |
| faille / cascade, saut dans la remontée | refusé (tchk), 0 mort | refusé, 0 mort | refusé, 0 mort |
| cascade, saut à la lèvre | 10/10 · 61 m · 3,7 s | 10/10 · 72 m · 2,7 s | 10/10 · 79 m · 2,2 s |
| terrasses, saut à la lèvre | 17/17 · 7 m · 2,8 s | 17/17 · 9 m · 2,7 s | 17/17 · 10 m · 2,8 s |
| écart, sortie par le bord | 5/8 · 92 m · 3,2 s | 3/8 · 95 m | 5/8 · 106 m |
| écart, saut nitro à l'entrée | 5/8 · 72 m · 4,5 s | 2/8 | 0/8 (« air ») |
| retournement, saut avant / au début | 16/16 (même face) | 13/16 | 12/16 |
Avant ces réglages (graine 1) : la remontée de la faille 0/6, les terrasses 0/2 à 105 et 1/3 à 140.
ROULER (pilote auto, nitro coupée) : paliers 0 et 10 et téléphone, les cinq modules × 2 graines : la caisse ne quitte jamais la dalle, caméra à ~5,5 m (6,7 m au téléphone), jamais sous la dalle,
portails passés sans casse. Palier 20 : morts du pilote sur une crête de la route ordinaire (~2 550 m, graine 1, décollage à ~400 m/s — elle tue aussi avec l'ancien vol, une fois sur deux) et sortie
de dalle dans l'écart (le pilote ne braque pas assez à 390 m/s) : **non tranché** (le pilote auto du banc n'est pas un joueur à ces vitesses).
Le ciel : les autres maps n'ont pas bougé (empreinte des routes identique ; tout le rendu nouveau est gardé par `uOrb`). Gardes : assembler --verifier, garde-allege, garde-charte,
garde-demarrage OK ; non-declares.cjs : la même liste qu'avant.

**MARS ET SATURNE REVIENNENT (le soir même, Sacha : « je voulais pas les enlever », puis « repasse sur les trois maps et optimise au max ») :** cinq ambiances d'orbite à poids égaux —
les trois moments de la Terre + `mars` (MARS : le vide, plein jour rasant) + `saturne` (SATURNE : haute dans le ciel, anneaux, roches immobiles). orbite-saturne.js et orbite-roches.js
restaurés (planeteCap / planeteSoleil restent dans orbite-soleil.js) ; leurs ambiances `espaceMars` / `espaceSaturne` naissent dans orbite-embellie.js (copies du lever, après tout
l'étalonnage). Réalistes : Mars au terminateur net, nuit noire, rouille éteinte, voile de poussière fin ; Saturne au terminateur doux, bord assombri, bandes crème. Roulées sans chute
(2 graines chacune, ordi et téléphone). `?meteo=mars` / `?meteo=saturne`.
**OPTIMISÉ** (crochet `dbgOrbPerf()`) : (1) chaque planète a sa texture, peinte une fois et gardée — la peinture au portail passe de ~300 ms (Terre) / ~70 (Mars) / ~40 (Saturne) à 0 ;
(2) Mars et Saturne sont peintes d'avance au menu (orbiteChauffe → planetesPrepeint) ; (3) les nuages de la Terre sont précalculés une fois (512 × 256, 256 × 128 au téléphone, ~70 ms au
menu) : une lecture de texture au lieu de six bruits 3D par pixel ; (4) le halo n'est plus dessiné en orbite. Le gain GPU n'est PAS mesurable sur l'ordi du banc (la planète y pèse moins
que le bruit de mesure, ~1,5-2 ms l'image en tout) : il est attendu sur téléphone, non mesuré.

**LE CIEL FAÇON GRAVITY (fait) :** Mars, Saturne (orbite-saturne.js) et les roches (orbite-roches.js) supprimés (fichiers, ORDRE.txt, `PLANETES`, peintres de continuite.js), étoiles-vedettes
et poussière cosmique retirées (orbite-embellie.js). `planeteCap` / `planeteSoleil` / `planeteTourne` vivent dans orbite-soleil.js. Trois MOMENTS (clés matin/midi/soir gardées) :
PLEIN JOUR · LEVER DE SOLEIL (le soleil posé juste au-dessus du limbe : hauteur calculée sur le bord de la Terre) · FACE NUIT (le soleil derrière la Terre : il ne se dessine plus — l'éclipse —,
villes allumées, air du limbe à contre-jour). Terre plus grande (1,6), nuit presque noire, villes en amas, nuages en bruit 3D qui tournent avec elle (et leur ombre), océans bleu nuit,
terres désaturées, fil d'air fin bleu-cyan, frange orangée du terminateur ; halo qui bat éteint en orbite. Lumière des moments : rebond de Terre (plus de rouille ni d'ambre), contre-jour
blanc froid (était rose), étoiles .35 / .5 / .9. Liseré de route en orbite : blanc froid (0xc8d8f4, était violet néon). `dbgTerre()` : le moment, le soleil, la Terre. Tout est gardé par `uOrb`
(0 hors orbite) : le menu et les autres maps ne bougent pas (empreinte des routes identique pour ville, crypto, nuages). Photos avant/après : dossier de notes de la session.

## 4. Ce qui RESTE (dans l'ordre) — état au soir du 2026-11-12 : 1 (preuve en jeu) FAIT sauf l'écart et le palier 20 ; 2 (fils d'or) FAIT ; 3 (rythme) PAS TOUCHÉ ;
##    4 (ciel) FAIT en 1re passe — à juger par Sacha sur les photos et en jeu (le plein jour reste le plus « coloré » des trois) ; 5 (livrer) PAS FAIT (sw.js non monté, rien de poussé)
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
