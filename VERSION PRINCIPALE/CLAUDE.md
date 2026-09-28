# CASH CAR — guide projet pour Claude Code

## LA CAMPAGNE NUAGES (2026-09-27) — dix heures du jour, dix idées de jeu
Brief de Sacha (inspiration rédigée avec Grok) : « les 10 niveaux racontent une journée, de l'aurore au coucher du soleil ; chaque
niveau ajoute ou détourne UNE idée de jeu ». Tout est BRANCHÉ sur l'existant, rien n'est réécrit.
- **OÙ** : `CARRIERE[0].niveaux` porte `camp:n` (piste dessinée), `pr` (la PROMESSE, dite sous le nom par `lvlAnnonce`) et le ciel ;
  `carNiveau` ajoute `piste:'camp'`, `camp`, `pr` et une **graine FIXE** (`newTrack` la prend : pièces, pads, nuages identiques à
  chaque essai). Générateur `genCampagne(n)` (juste après `genTuto`) ; systèmes dans le bloc « LA CAMPAGNE NUAGES — LES SYSTÈMES »
  (juste avant `rebuildMenuScene`). Entrée : bouton **CARRIERE** de l'accueil (`data-m="carr"` → `carrVue`). Hooks : `dbgCampagne(n)`
  (lance le niveau n), `dbgCamp()` (état : dégâts, police, fantôme, coupes, bancs), `dbgPisteCamp()` (croisements, dégagement, rayon mini, pente).
- **LES NIVEAUX** : 1 AURORE = `genTuto` intouché · 2 PREMIÈRES LUEURS = deux grands balayages de 160° qui DESCENDENT (lus d'en haut), zéro
  banc, zéro plot · 3 LEVER = UN banc (r 36) sur une droite tournée PILE vers le soleil (`SUN_DIR`), « PERCE-NUAGE ! » à la sortie ·
  4 MATIN FRAIS = 3 séquences de 3 PORTES (centrale large / décalée / décalée de l'autre côté, de plus en plus étroites), sur des droites
  plates · 5 MATIN = la POURSUITE · 6 MIDI = 4 OVALES LENTS (la coupe), ciel propre (ni déco ni coussins) · 7 APRÈS-MIDI = vagues en sinus
  + esses, zéro plot/banc · 8 FIN D'APRÈS-MIDI = un banc au BOUT de chaque droite (cache le virage SUIVANT, on en sort ~1,5 s avant) ·
  9 HEURE DORÉE = biome `orageDore` (orage SANS guirlande de ville, brume 1 350 m), pluie .5, mer refermée + bancs proches + un titan,
  éclairs · 10 COUCHER = la CAISSE-NUAGE (deux ovales, une traversée de nuages, un grand balayage final).
- **RÈGLES DES PISTES** : aucun tirage (piste identique à chaque essai), aucun trou, aucun plot/huile/banc de route tiré au hasard
  (`campNuageOk`, filtres dans buildTrack) ; les REPÈRES (`CAMPM` : bancs, portes, coupes) sont notés par INDEX de point de contrôle,
  relus après `lisserRaccords`/`adoucirCretes`, convertis en `s` par `campRepere` (appelé dans buildTrack AVANT les pads, qui s'écartent des portes).
- **LES BANCS DESSINÉS** = la forme `mur` de mkBlobs (trois rangées de boules soudées, `ry` ≈ 0,6·r), relevés de 0,2·r et TOURNÉS en travers de
  la route (`c.g.rotation.y`). MESURÉ en capture : le cumulus à base plate faisait 13 m de haut et, dans l'objectif grand-angle du portrait,
  se lisait comme une dune rose à l'horizon. Niveau 3 : la droite du banc file vers le soleil À 22° PRÈS (pile en face = contre-jour, fondu
  dans le ciel). Sortie du banc : « PERCE-NUAGE ! » (3), « HORS DE VUE » (écran du 5), « À L'INSTINCT ! » lancé au 8.
- **LA CORDE QUI BRILLE** (marques `corde` → `CAMP.cordes` → `campPieces`) : une pièce tous les ~26 m sur l'INTÉRIEUR des grands virages
  des niveaux 2, 5 et 10 — la bonne trajectoire se voit, et elle paie.
- **LA CORDE** (`cordeK`, `KAPB` = courbure latérale signée par point, `campCourbure`) : le jeu avance sur la ligne centrale (`s`) quelle
  que soit la position latérale — couper l'intérieur ne rapportait RIEN. En campagne (`CORDE_ON`), `s` avance de ×1/(1−κ·lat) : la corde
  est vraiment plus courte (≈10 % dans un R 250 à 25 m de l'axe), et il faut tourner plus serré. Joueur, police et fantôme. Hors campagne : ×1.
- **L'OVALE LENT** (la coupe, niveaux 6 et 10) : leg1 (droite S) → demi-tour R1 → retour → demi-tour R2 = R1 + d/2 → leg3, qui file À CÔTÉ
  de leg1, 12 m plus bas, 22 m de vide entre les bords (d = 2·ROAD_HALF + 22). ⚠ En vol la gravité MONDE vaut FALL_G×SPD ≈ 16 m/s²
  (la chute est intégrée ×SPD) : fenêtre de cap ≈ 8°-30° à 115 m/s, 13°-56° à 70 m/s. ⚠ Plus bas que ~12 m, la TRANCHE de leg1 cache
  leg3 à la caméra de poursuite (basse en portrait) — mesuré en capture à 16 m. Sortir par le bon bord = `startFall` + `tryLand` sur leg3 :
  ~2,9 km gagnés, zéro physique nouvelle. Un seul croisement par ovale (l'entrée passe AU-DESSUS du 2e demi-tour) : topologiquement
  obligatoire. Des pièces longent le bord qui regarde leg3 et un jackpot brille sur leg3 (`campPieces`) — aucune flèche. Et les GUÉS DE
  OUATE (`campNuages`) : 6 coussins r 10,5 au milieu du vide entre leg1 et leg3, crête ~5 m au-dessus de leg1 — ils dépassent du bord (leg3, lui, se
  devine à peine depuis la caméra basse) et, traversés en vol, portent et rendent de l'airtime (surf de nuage existant). Se poser > 300 m
  après son décollage = « RACCOURCI ! » (FLOW, nitro, aura) — détecté dans `campTick`.
- **LA POURSUITE** (niveau 5, `SURV.chasse`) : le mode Survivant réglé (survStart/survTick) — 2 bots qui naissent 200/245 m DERRIÈRE (~20 s de sirènes avant le 1er tir),
  jamais devant (clamp `pTot−9`), pas de nitro sous 86 m (juste hors de portée), 6 % de moins en pointe, ni classement ni couperet.
  `poursuiteTick` : tirs en SALVES COMMUNES aux deux voitures (1-1,35 s de feu / 1,6-2,2 s de pause — elles ne se relaient pas),
  seulement derrière, à 9-92 m, au sol, ligne de vue dégagée (`campVue` : la dalle
  protège, un nuage coupe — les bancs `ecran` du niveau 5 ne se DÉFONCENT pas). 7 s CUMULÉES sous le feu = `explode('feu')`. Aucun
  chiffre : la FUMÉE (`FUME`, Points à taille/alpha par particule, héritant 93 % de la vitesse de la caisse) — 2 s filet blanc, 4 s grise
  + moteur qui tousse, 6 s NOIRE + caisse qui broute. Traits néon magenta/cyan (`TIR`, rubans TRAIL_TEX), « piou » arcade. Halos d'écran
  `#campFx` (opacité seule) : rouge/bleu en bas quand ils sont derrière, magenta sous le feu. MESURÉ (banc `camp5.js`, pilote auto) :
  sans nitro et sur la ligne centrale, abattu vers 30 s avec la fumée qui monte par paliers ; un coup de nitro toutes les 7 s = semés.
  Historique : nitro libre = 80 m repris en 8 s et salves relayées = mort en 11 s ; seuil nitro 140 m = jamais à portée, zéro tension.
- **L'ORAGE** (niveau 9) : `orageTick` — un éclair toutes les 3,4-7,4 s (ruban brisé `ECL`, deux branches), `CAMP_FLASH` (exposition,
  lue dans updateClouds) et `CAMP_FOG` (le brouillard recule de 1 900 m) : l'éclair RÉVÈLE la route ; tonnerre retardé selon la distance ;
  le dernier tombe à côté du portail.
- **LA CAISSE-NUAGE** (niveau 10) : fiche en FIN de CARS (après le bloc généré des 50), gabarit `SHAPES.nuage` (boules `NUAGE_BLOBS`
  fusionnées par `mergeSpheres`, matière `nuageMat` = celle des nuages, opaque), condition `{k:'carrN',v:10}`. Le FANTÔME (`GH`, créé à
  l'init, compilé au menu par `campChauffe`) : ligne gravée (`fantomeLigne` : corde lissée ±60 m + approche du bord de chaque coupe),
  coupes en parabole (`fantomeSaute`, gravité MONDE FALL_G×SPD), vitesse = TES équations et TON moteur ×`GH_K` 1,10 en pointe (jamais de
  nitro ; le boost de départ vaut pour elle aussi), part 180 m devant, se PERD dans les bancs (−45 %/s dedans : la section de nuages est
  une occasion), et l'aspiration marche dans les deux sens (dépassée de près, elle revient dans ton sillage) — elle ne regarde jamais où tu
  es. Le pouvoir VITESSE ×2 est retiré du niveau 10 (+500 m d'un coup : on la dépassait loin sur le côté). Sillage : aspiration à < 46 m
  derrière elle, « ACCROCHE ! » dans sa BULLE de 18 m, 1 s tenue (la jauge retombe à ×1,5) = `fantomePris` : ta caisse DEVIENT la caisse-nuage (équipée), le portail s'ouvre. Elle passe le portail avant toi = « ELLE T'A
  SEMÉ » (`fantomeSeme`, fin sans explosion). Le portail du niveau 10 = `campFinale` → écran de fin « NUAGES TERMINES ».
- **VERSION TEST** : `TEST_CARRIERE=true` (près de `CARR`) ouvre les dix niveaux de chaque monde sans les avoir finis — ⚠ à remettre à
  false pour la version publique, comme `TEST_CAISSES`.
- **FINS DE PARTIE** : `mortCause` feu / seme / finNuages (CAUSES de mFill), gardée par `CAMP.garde` dans endGame ; REJOUER repart du
  niveau où l'on s'est arrêté (`CARR.actif.i` mis à jour dans endGame) ; la stat NIVEAU dit le vrai numéro.

## LA CAMPAGNE VILLE (2026-09-27) — du coucher du soleil à midi, dix idées de jeu
Même méthode que les NUAGES, même exigence (« parfait du premier coup »). `CARRIERE[1].niveaux` porte `camp:11…20` + `pr` ; les pistes
sont dessinées dans `genCampagne` (branche `n>10`, pas de looping, pentes douces) et **la ville se bâtit toute seule autour**
(`buildVoxCity`, qui marche sur n'importe quel ruban). Systèmes : bloc « LA CAMPAGNE VILLE — LES SYSTÈMES » (juste après celui des
NUAGES, avant `rebuildMenuScene`). Branchés sur les crochets de la campagne (`campRepere` → `VZ`, `campPlots` → `villePlots`,
`campPieces` → `villePieces`, `campDebut` → `villeDebut`, `campTick` → `villeTick`, `campStop` → `villeStop`, `campChauffe` →
`villeChauffePrep/Fin`) + QUATRE lignes ailleurs : `campPad(i9)` dans la prise de pad, `villeApres()` juste après `musicTick`, le portail
du niveau 20 dans `portailPasse`, la meute dans `survStart`/`survTick` (`SURV.camp`). ⚠ `lvlNuageOk` : la campagne ne choisit son ciel
QUE pour les NUAGES (`c.camp&&c.id==='nuages'`) — la ville garde zéro nuage (les gués des coupes n'y naissent pas).
- **LA PLAQUE** `#campChip` (`vChip(txt,sous,col,alerte)`) : ce qu'on LIT, en haut (sous la jauge de nitro au téléphone) — un cadre
  d'arcade opaque, deux lignes (l'objectif, son chiffre) ; ne se repeint que si le texte change. Radar à venir, file de pads, cellule
  d'orage, panne, fourgon, bouchon, banquier, rang de la meute.
- **1 COUCHER — FAIS-TOI FLASHER** : trois portiques RADAR (`VZ.radars`, `radarsPose`, poutre à 24 m — à 17 m elle barrait l'écran de la
  caméra portrait — rampe lumineuse dessous) au bout de trois droites ; le flash paie `denom × km/h/22` (×2 en EXCÈS DE VITESSE, jugé sur
  `vCroisiere()` ≥ 92 % : MESURÉ, sur `vmaxShow` le pilote auto SANS nitro était « en excès » à 317 km/h), slam « 412 KM/H », déclic + bip ;
  la plaque annonce « RADAR · DANS 240 M ». Parcours complet mesuré : 94,5 s, trois flashs.
  Les éclairs de flash sont des sprites HORS `trackMeshes` (leur géométrie est celle de tous les sprites) : `radarsVide`.
- **2 SOIRÉE — SUIS LA LIGNE DE NÉON** : cinq FILES de 5 à 7 pads d'or (`VZ.chaines`, `chainesPose`, `vPad`) reliées par un TRAIT de
  lumière posé sur la route (ShaderMaterial additif, 2,2 m de large : parcouru = OR, tronçon suivant = tirets CYAN qui filent, suite en
  veilleuse cyan, cassé = éteint — en orange il se confondait avec la flamme de nitro ; la 1re file est à 8 m de l'axe, pas SUR la ligne centrale). `campPad` : `padCd` ramené à 0,45 s dans une file (le pad suivant est à ~110 m), « LIGNE ×k », file complète =
  LIGNE PARFAITE (slam, `denom×6×n`, demi-nitro). Pad raté = LIGNE CASSEE. `campPadNon` écarte les pads au hasard des files.
- **3 PLUIE — LIS LES FLAQUES** : rangées d'eau en travers (`VZ.flaques`, `flaquesPose`, 2 InstancedMesh : EAU DE NÉON — fond bleu nuit,
  rides concentriques et bord cyan qui brillent, `VEAU.mat` + onBeforeCompile — et liseré cyan additif ; MESURÉ en capture : dans l'objectif
  portrait la route à 20 m est déjà tassée sous l'horizon, une flaque sombre ou réfléchissante y était invisible ; la plaque annonce
  « FLAQUES · DANS 180 M », jamais le côté sec), UNE ligne sèche de 16 → 9 m qui change de côté, puis des DAMIERS (deux rangs en quinconce). L'eau = une entrée `OILS` : le
  glissement des flaques d'huile de la boucle (aquaplaning, gerbe d'eau). Rangée passée sans glisser = « A SEC ! ».
- **4 MINUIT — NE FINIS PAS DERNIER** : le Survivant tel quel (7 voitures, couperet à chaque minute) — `campMeute()` dans `survStart`,
  HUD du Survivant et `#lastAlert` masqués en campagne (`SURV.camp`) : la PLAQUE dit « RANG 3 / 8 · COUPERET DANS 0:42 », rouge
  clignotante « DERNIER ! » ; la caisse clignote rouge comme avant.
- **5 ORAGE — ESQUIVE LA FOUDRE** : trois CELLULES (`VZ.cellules`) ; toutes les 2-3,2 s un CERCLE se pose là où tu seras dans ~1,3 s
  (2 fois sur 3 sur ta ligne, sinon une autre file), se resserre sur le rayon mortel (`VFOU_R` 7,5 m) avec un bourdon qui monte, puis
  `eclVers` fait tomber l'éclair PILE dedans (le moteur d'éclairs du niveau 9). Touché = « FOUDROYE ! » : vitesse ×0,55, nitro ×0,4,
  FLOW −25, la caisse grésille — jamais la vie. Sous la dalle = « A L ABRI ». Frôlé = « ESQUIVE ! ». Les éclairs lointains continuent.
- **6 AVANT L'AUBE — ROULE DANS LE NOIR** : trois PANNES (`VZ.pannes`). L'uniforme `CITY.uC` (dans les trois matières de la ville :
  fenêtres, liserés des toits, enseignes, réclames) vacille 170 m avant, tombe à 0 dedans, revient avec des ratés. Le néon de la route
  est baissé à 7 % dans `villeApres` (APRÈS musicTick, qui le repeint chaque image depuis `userData.base` — on ne touche QUE ce qui a une
  base, rien ne s'accumule) ; les phares portent 136 m. Les CATADIOPTRES (`catasPose`, ambre à gauche, blanc à droite, tous les 14 m,
  plots de 50 cm tous les 10 m SUR la ligne de bord, `fog:false` — des pavés de 16 cm tous les 14 m tombaient sous le pixel dès 60 m) dessinent
  les bords ; un fil de pièces trace la corde dans le noir. Sortir sans quitter la route = « A L AVEUGLE ».
- **7 AUBE — VIDE LE FOURGON** (`VFG`) : fourgon blindé ARGENT à bandes d'or (×1,25 ; en bleu nuit il disparaissait sur le bitume de l'aube), créé à l'init. Un LIÈVRE qui règle sa vitesse sur la tienne
  (MESURÉ : avec tes équations ×1,04, le FLOW, les pads et l'élan te le faisaient doubler à 24 s et il finissait 2,5 km derrière, 4 % vidé) :
  +3 % dans son semis (il se tient à 8-40 m : à 30 m il ne faisait que 25 px en portrait), +12 % collé à < 8 m, +12 à +72 % si tu l'as doublé (il revient d'autant plus vite qu'il est loin), ta vitesse loin
  devant, ×1,35 vidé. Collé derrière lui (3-45 m, dessus de la dalle ou en vol ; une étiquette « FOURGON $ » flotte au-dessus) : les portes s'OUVRENT, 6 pièces/s tombent
  sur la route — de vraies entrées `pickups` (réserve de 40 maillages recyclés), ramassées par la boucle normale. 80 pièces ; vidé =
  « FOURGON VIDE ! » (`denom×25`), puis il s'enfuit (×1,3). Le percuter par l'arrière = dix pièces d'un coup (« BRAQUAGE ! ») et un coup
  de frein. Côte à côte, il déboîte toujours de l'autre côté.
- **8 LEVER — SAUTE D'UN ÉTAGE** : trois ovales (la coupe des NUAGES 6), `RACCOURCI !` inchangé ; à la place des gués de ouate, six
  COLONNES de lumière (`colonnesPose`, deux plans croisés, un seul maillage) montent du vide entre les étages, tête 9 m au-dessus de la
  route ; deux pads d'or attendent sur l'étage du dessous.
- **9 MATIN — FAUFILE-TOI** (`VTR`) : huit files de 7 m, 2-3 voitures par rangée (4-6 dans les deux BOUCHONS), jamais les huit : 100-160
  km/h (60-90 en bouchon), plus vite à gauche. Voiture / fourgonnette / bus (échelles), tout ×1,3 (MESURÉ en capture : à l'échelle vraie, une
  voiture faisait 7 px à 100 m dans l'objectif portrait), feux arrière qui saignent dans le bloom. Clignotant 1,1 s puis changement de file 1,3 s.
  Trois InstancedMesh (caisses teintées, feux, clignotants), on ne dessine que la face où l'on roule. ACCROCHAGE = vitesse ×0,62, FLOW
  −15, la voiture part en toupie ; le FRÔLÉ (`frole`, le système des plots) paie ; foncer dans sa file = klaxon. Trafic à graine fixe.
- **10 MIDI — BATS LE BANQUIER** (`VBQ`) : une course au portail contre LE LINGOT (gabarit `SHAPES.lingot` : tronc de pyramide d'or à
  quatre pans, plaque poinçonnée 999,9, `LINGOT_MAT` partagée avec la caisse du garage — or MÉTAL : base cuivrée sombre, spéculaire doré ;
  en 0xffc33a il sortait jaune pâle). TES équations ET ton FLOW ×`VBQ_K` 1,07 (MESURÉ sans le FLOW : tu gagnais de 640 m au nitro sans sauter
  d'étage, et tu le rattrapais même sans nitro ; à flow égal, sans nitro tu perds — 275 m à 40 s et ça s'ouvre), la corde (`banquierLigne`),
  jamais de nitro, jamais d'étage sauté, aspiration dans les deux sens, coup d'épaule sans dégât. ×1,25 et une étiquette « BANQUIER »
  flotte au-dessus (`vEtiquette`, comme les pouvoirs : à 20 m il faisait une pépite). Il passe le portail avant toi = « LE
  BANQUIER A GAGNÉ » (fin 1,6 s après, cause `banquier`). Toi d'abord = `villeFinale` : `carrMarque(ville,9)`, LE LINGOT débloqué
  (`{k:'carrV',v:10}`) et ÉQUIPÉ, écran « VILLE TERMINEE ». L'orbe VITESSE est retiré du niveau.
- **HOOKS** : `dbgCampagne(n,1)` (niveau n de la VILLE), `dbgVille()` (tout l'état), `dbgFoudre()`, `dbgCourant(v)`, `dbgTrafic()`. Bancs
  Puppeteer : `scratchpad/pp/v1.js` (les dix niveaux), `vplay.js niveau [nitro] [coupe] [suit]` (parcours complet ; `suit` colle au fourgon,
  au banquier, ou vise le pad suivant de la file). ⚠ Les bancs partagent la carte graphique de Sacha : UN à la fois, viewport 200×430.
- **PIÈGES MESURÉS** : `b = n×t` (frameAt) → la base (b, t, n) est un MIROIR : un objet posé à plat sur la route se construit en (t, b, n) —
  le cercle de foudre se dressait en arche ; (b, n, t) est la base directe des caisses. Les pads de campagne (`vPad`) passent tout seuls
  dans `PAD_IM` (padsInstancier ramasse padGeo+PAD_MAT). Cercle de foudre visible à opacité 0 et UNE voiture garée sous la dalle dès
  `villeDebut` : `chauffeRendu` (120 ms après newTrack) les dessine, la puce crée leur état de pipeline avant la 1re frappe / le 1er bouchon.

## ⚠ DEUX ÉDITIONS, UN SEUL JEU (2026-09-25) — LIRE EN PREMIER
- Le dossier `version-fusion-2026-09` s'appelle désormais **`VERSION PRINCIPALE`** (la version mobile fusionnée) ;
  **`AUTRE VERSION`** = la version PC. Les deux `index.html` sont IDENTIQUES sauf `const EDITION='mobile'|'pc'`
  (près de `FORCE_TEL`). `'mobile'` : l'ordi joue la version téléphone (`FORCE_TEL` vrai hors vrai téléphone).
  `'pc'` : l'ordi garde le menu desktop. Un vrai téléphone a la version téléphone dans les deux éditions.
- **On ne modifie QUE `VERSION PRINCIPALE`**, puis `node synchro-versions.js` à la racine du dépôt régénère
  `AUTRE VERSION` (recopie tout sauf son README, bascule la ligne, vérifie). Commiter les deux ensemble.
- Forçages de test : `?tel=1` (téléphone) / `?pc=1` (menu desktop), quelle que soit l'édition.
- **LA COLONNE DE L'ORDI (2026-09-28, Sacha : « la disposition des affichages PC et mobile vertical doit être EXACTEMENT la
  même »)** — puis « je voulais la version horizontale sur PC, pardon » (une heure en option), puis, TRANCHÉ : « je veux voir sur
  mon PC la même chose que je verrais sur mon téléphone quand il sera en vertical », et enfin, LE MOT DE LA FIN : « non,
  justement, je veux voir la version HORIZONTALE DU MOBILE sur mon PC » → le cadre est LE DÉFAUT sur l'ordi, et il est COUCHÉ :
  **844 × 390** (l'iPhone de référence en paysage), zoomé à la largeur (1600×900 → 1600×739, dpr 1,90 ; dedans innerWidth 844,
  la mise en page paysage d'un vrai téléphone). `?colonne=portrait` = le téléphone DEBOUT (390 × 844). Le détail qui suit décrit
  la mécanique (identique dans les deux sens ; la taille du cadre est posée par le script, classes `couche`/`debout`). `const EDITION` a DÉMÉNAGÉ dans le `<head>` (toujours une seule occurrence : la synchro marche telle quelle), à
  côté d'un aiguillage : édition 'mobile' + page principale (`window.top===window`) + écran qui n'est PAS un téléphone (même
  test que TEL_NATIF) + ni `?pc=1` ni `?colonne=0` → la page devient un CADRE (`html.colonne`, `CC_COLONNE`, tout le document
  masqué, le grand script s'arrête à sa 1re ligne, `__gameReady` posé pour le chien de garde) et le jeu tourne dans
  `<iframe id="colonne">` de **390 × 844** (l'écran de référence de la charte) agrandi par `zoom` = min(h/844, w/390). Chrome
  propage ce zoom au document du cadre : dedans innerWidth 390, @media/vw d'un téléphone, `devicePixelRatio` = le zoom (net) —
  mesuré 1600×900 → colonne 416×900, dpr 1,066 ; 1600×1100 → 499×1080, dpr 1,28. Même en file:// (sauvegarde partagée).
  CLAVIER : focus donné au cadre au chargement et à chaque clic hors colonne ; une touche frappée pendant que la page-cadre a le
  focus est RELAYÉE (`postMessage` {cc:'touche'} → `KeyboardEvent` sur le document du cadre). Bancs muets : scratchpad 52f21eda
  `fr/col.js` (captures + mesures), `fr/cle.js` (clavier). ⚠ Un banc « plein écran » d'avant doit passer `?colonne=0` (ou piloter la frame `colonne=1`).
- ⚠ **AUTRE VERSION EST GELÉE depuis le 2026-09-25** (user : « travaille que dans la version mobile ») : elle est
  restée à l'état du commit de séparation. On ne relance `synchro-versions.js` que si Sacha le redemande.
- **LE MOUVEMENT (2026-09-25, « transitions niveau App Store »)** — dernier bloc du `<style>` : UNE courbe `--ease`
  (cubic-bezier(.32,.72,0,1), celle des feuilles iOS, sans rebond) et DEUX durées `--t-fast` 140 ms / `--t-slow` 420 ms.
  Fin des `steps()` sur les écrans. `mGo(id,sens,sansSortie)` : profondeur `PROF` → `avant` (arrive de droite) /
  `retour` (de gauche) / `racine` (fondu-zoom) ; l'écran qui part garde `.sort` 220 ms en absolu ; les enfants se
  posent en cascade via `--i`. Un `MutationObserver` sur `#overlay` pose l'écran racine AVANT la prochaine image (plus
  de flash de l'ancien écran à la mort). `ecranWipe(fn,apres)` = FONDU AU NOIR (monte 200 ms, bascule dessous, 2 images,
  se lève) — `apres` part au lever (le LÂCHER du garage), l'événement `cc:revele` fait rejouer l'entrée de l'écran
  découvert. JOUER et REJOUER passent par ce fondu. Feuilles (`#tPanel`, `#modale`, `#carr`) : `feuilleOuvre/feuilleFerme`
  (classe `.sortant` 170 ms). Clavier : Échap referme fenêtre → pause → carrière, met en pause en course, revient d'un
  sous-écran ; Entrée = le bouton or de l'écran. « Réduire les animations » : fondus seuls.
- **LA CONDUITE JOUISSIVE (2026-09-25, « plus fun, plus addictive, un sound design jouissif »)** :
  · **LE FRÔLÉ** (`FROLE`, `frole()`) : un plot qui passe DERRIÈRE la caisse entre deux images (balayage `FROLE.s0`→`s`)
    à 1,6-3,6 m de `lat`, au-dessus de 45 % de `vmaxShow()` = nitro + FLOW + aura ; chaîne de 1,4 s → « SLALOM ×n ».
  · **LA GAMME DES PIÈCES** (`blip`, `GAMME_P`) : le combo joue une pentatonique majeure qui monte (plus de chromatique).
  · **`boostSnd(k)`** = FWOOSH (souffle balayé + sous-grave + note qui décolle) ; `k` dose (pads 1 → ULTRA TURBO ~2).
  · **`driftChargeSnd()`** (chaîne `DRS`, créée une fois) : le « brrrr » de charge qui monte par niveau de drift ;
    **`raseSnd(dt)`** (`RSN`) : la bande rugueuse du RASE-BORD + un tic haptique ; **`froleSnd`**, **`flowSnd(lv)`**
    (accord majeur qui monte par palier). Passages de rapport : pétarade À CHAQUE rapport + tic + `fovPunch` 1,8.
  · Hook : `dbgConduite()` (état des chaînes), `dbgConduite('son')` (joue tout, renvoie les erreurs), `dbgConduite('frole')`.
- **LE SOIR DU 25/09 — verdicts de Sacha et ce qui a changé (tous mesurés/rendus avant commit)** :
  · **VOLANT « CAP VISÉ »** (`CAP_K/CAP_V0/CAP_V1/CAP_DRIFT/CAP_YAW/CAP_RET`, `capVise`) : le pouce DONNE LA DIRECTION ; lâcher = filer
    droit sur sa ligne. Remplace le ressort `psi*=exp(-2,6…)` (« on est toujours aimanté au centre »). Banc : scratchpad `volant/sim.js`.
    Courbe du pouce 1,15. Drift : braquage à fond TENU 0,12 s (ou pouce tiré vers le bas), paliers .45/.9/1,4 s, recharge `driftCd`.
  · **BITUME v2** (`roadMat`, `ROAD_U`, `asphTex`, `routeTick`) : grain d'asphalte cuit une fois, spéculaire froid et serré, brillance
    d'horizon, clarté par niveau (`NIVEAUX[].route/sheen`). La « tache rose » = reflet de `carLight` (désormais blanc neutre, portée 12,
    décroissance 2) + lobe du `kick`. Étincelles et gerbes près de la caisse héritent de sa vitesse (`EXV`).
  · **NIVEAUX** : NUAGES → VILLE → ORBITE ; jamais de Terre dans les nuages ; route de la VILLE plus claire.
  · **DAUPHIN v3** (`dolTick`, `DAUPH`, `#dolHud`) : **1 s** (`DOL_T`, 2 s jusqu'au 26/09) de vol continu au-dessus de la route, puis
    dauphins + étiquette DAUPHIN et aura en direct, encaissée à la pose ; le banc reste au moins `DOL_VU`=2,6 s à l'écran. Hook `dbgDauphin(...)`.
    L'ANIMATION est celle de Léo (`version-leolei-2026/dauphins.html`, portée le 26/09 — l'ancienne n'en gardait que le tube du corps) :
    BANC de 3 (`DOL_BANC`), nageoires dorsale/pectorales/caudale qui BAT, bonds en arc, gerbe d'eau à la sortie et à la plongée
    (`dolSplash`), sillage d'étincelles (`dolTrail`) — les deux pools vivent dans le repère du banc (`dolPod`), sinon la caisse les
    sème. Taille et largeur RECALCULÉES sur la vraie caméra (`dolKS` ≈ ⅓ de la plus petite dimension, `dolW` = 80 % de la
    demi-largeur) : lisible en portrait comme en paysage. `dbgCreatures()` donne `kS`/`W`.
  · **MOTEUR 3D EN GRAND** : la carte `#engBig` porte le modèle 3D (canvas `.eb3d`, recopie de `engRT`) ; sur téléphone plus aucun rendu
    moteur hors de la carte. Hook `dbgMoteur()`.
  · **CONDUITE v5** : effets de vitesse étalonnés sur `vCroisiere()` (=1,55×vmaxShow ; vmaxShow reste la référence d'économie) ; pads =
    CIBLES (`PADL`, voies ±0,45×ROAD_HALF) ; MOMENTUM v2 (manœuvrer gèle, style nourrit, la pose juge) ; PORTES DE FRÔLÉ pour tous
    (« PORTE ! », un frôlé payé par image) ; filés en sprites (zéro dégradé par image).
  · **SON v5** : `sfxOk()` (rien n'est fabriqué muet/en pause) ; tampons de bruit cuits (`NZ_CACHE/BR_CACHE`) ; `subBoom` ne s'empile
    plus ; turbo lu sur le MOTEUR ; nitro audible sur téléphone (`TEL_NATIF` : passe-haut de la flamme, `nB/gE` dans engSndParams) ;
    moteur qui s'emballe en vol, gomme qui mord (`pneuMord`), tôle du POSÉ LOURD, « tchak » du PARFAIT ; une seule tonalité (`TON`,
    `noteP`, `FLOW_ACC` — mi pentatonique) ; le FLOW prévient avant de retomber ; plot percuté (`coneSnd`).
  · **ERGONOMIE 6b** : l'événement **`cc:jeu`** (fin de `start()`, `resetGame()`, et d'`endGame()` APRÈS les retours bac à sable /
    auto-école) synchronise `body.play`/`body.dead` à l'instant — le tick de 140 ms n'est plus qu'un filet ; commandes, jauge et ⏸
    entrent/sortent en fondu (le fondu est sur `#tGear`, jamais sur `#tSet`). **`HAUT`** (`hautPasse/hautArme/hautVide`) : UNE carte
    à la fois sous l'encoche (moteur `engBigFile`, défi `misBanniere`→`misBanMontre`, permis) ; l'auto-école retient la file. Le coach
    porte ses ratés (`tutoAffiche(msg)`, classe `.rate`), plus de toast sous les pouces. Garage : `.verrou` montre la condition d'aura,
    boutons en `aria-disabled` (jamais `disabled` : un bouton désactivé n'émet aucun clic) + `gSecoue`. Plancher `--fs-min` 8 px.
    **`GRADE_ACES`** (téléphone) : l'étalonnage `saturate/contrast/brightness` vit dans l'ACES, `body.post>canvas{filter:none}` ;
    `ACES_N` 6 prises + grain animé `uJit` ; « Réduire les animations » coupe aussi le flou de vitesse.
  · **TESTS MUETS** : le pane caché joue le son chez Sacha — tout onglet de test (agents compris) démarre sfx/mus/vox à false.
- **CONDUITE v6 / PISTE v6 / LARGEUR (soir du 25/09 — « quand je ne touche à rien je reste quand même sur la route », « la voiture
  glisse », « pistes trop droites », « réduis de moitié la largeur de la route »)** — ⚠ RÈGLE N°1 : pouce lâché, la caisse garde
  son cap MONDE et SORT dans les virages. Aucune aide qui prend la courbe (`ASSIST_VIRAGE=0`, `AIR_ASSIST=0`), aucun réalignement.
  · **Le pouce fait TOURNER** : `lacetMax(v)=v/(VOL_R0+VOL_RK·v)` (40 / .3 : rayon mini 61 m à 250 km/h, 100 m à 720), inertie
    `VOL_TAU` .1 s, état `yawR`. Le cap visé (`capVise`, CAP_*) ne sert plus qu'au pilote `dbgAuto` (qui anticipe via `routeLacet`).
  · **DRIFT = un GESTE** (pouce tiré vers le bas / ↓ + braquage) : la trajectoire tourne ×1,15, le NEZ pivote en plus (`slipB` ≤ 24°,
    ajouté au nez, jamais retiré de la trajectoire) ; `glisse9` pilote fumée et crissement. Le « Tokyo drift » décoratif (crabe au
    boost) est RETIRÉ (`tdWant=0`) ; roulis de caisse vers l'EXTÉRIEUR (charge `yawR·v`).
  · **Caméra** : la penche ne s'accumule plus (`camera.up` = copie penchée de `camUp`) ; placée derrière un axe mi-route mi-caisse
    (`loop._camD`) pour qu'on VOIE la caisse bouger ; visée lissée relativement à la caisse (elle traînait de v/9).
  · **Route** : divisée par 2 (`ROAD_HALF0` 14 → 7) puis REDOUBLÉE le soir même (« double la largeur des routes ») → `ROAD_HALF0=14`,
    47,6 m en zone 0. Restent les garde-fous adaptatifs (voies des pads, slalom de plots, ombre de vol bornés par ROAD_HALF) ; anneau
    de visée, RASE-BORD (×0,8) et aimant à pièces sont revenus aux valeurs de la route large. Spec ÷2 : scratchpad v6/largeur/SPEC.md.
  · **Piste v6** (`genCtrl`) : la CAISSE ne dessine plus la piste (`level` masqué à 0) ; l'échelle suit la VITESSE du palier moteur
    +2 (`lvPiste()`, 1 → 4,4) pour que les virages restent faisables sans aide ; respirations = petits virages de liaison ; ligne de
    momentum cintrée ; arcs densifiés (≤ 12°/point). Banc : 31 → 51 % de piste en virage, plus longue droite 978 → 336 m.
  · **Vol = INERTIE** (26/09, « basé sur un principe d'inertie, dépend de la vitesse à l'éjection, PAS de la vitesse max ») : `AIR_RATE=1`,
    l'avance horizontale reste celle de l'éjection (`fallVH0`, plafond dur — un cabré ne crée pas d'élan), seule la gravité agit ; AUCUNE
    lecture de maxSp en vol ; la nitro en l'air fait PLANER (compense 60-75 % de `FALL_G`) et garde l'assiette, elle n'accélère plus.
    `speedKmh` en vol = vitesse d'AVANCE (horizontale).
  · **Zéro aide, partout** (26/09) : atterrissage au point EXACT de traversée de la dalle (`latX9`, plus de « ramené sur la route »), cap
    de pose = direction du vol ; caméra au retard latéral (`loop._camLat`, τ .22 s, plafonné à 30 % du recul) pour VOIR la caisse bouger.
    Seule exception : le haut des loopings (dalle > 60°, `rails9`) où la caisse suit le ruban — le vrillage y fabrique un faux virage.
  · **Route** : largeur CONSTANTE (`LARGEUR=[1.7]`, `CARR_LARG` tout à 1.7) — « la vitesse fait tout le travail » ; niveaux ×2 (`LEN` 14 400).
  · **Piste v7** (26/09, « la génération n'est pas adaptée à la conduite ») — mesuré par un pilote 150 ms sur les vraies pistes
    (scratchpad `v6/piste/conduite/test.js`, `attrib.js`) : le repère de dalle ne revenait JAMAIS vers la verticale → dalle penchée
    > 45° sur la moitié de la piste, chaque bosse devenait un virage, les loopings pris penchés étaient impossibles (0,41 sortie/km,
    7,8 % infaisable). Désormais `buildTrack` REDRESSE la dalle (`RAPPEL9` .05 rad/m, coupé si |T.y| > .7 ou dalle à l'envers) ; courbe
    `centripetal` (plus de coudes entre points inégaux) ; décalage des loopings progressif `(θ−sinθ)/2π` ; liaisons 60-110 m sur 4 points.
    Résultat : 0,019 sortie/km, 1,2 % infaisable (le haut des loopings, couvert par `rails9`), 43 % de piste en virage (31 % à l'origine).
  · **Power-slide** (26/09, « la voiture part vraiment sur le côté pendant les virages ») : `driftYaw` = arrière qui chasse ∝ charge latérale
    (jusqu'à ~18°), UNIQUEMENT en virage — la trajectoire reste celle du pilote ; fumée/crissement via `glisse9`.
  · **AURA v2 — LA CHAÎNE** (26/09, « on ne voit pas le compteur d'aura ni combien rapporte chaque figure ; des multiplicateurs quand on
    enchaîne ») : `CHA`, `chaineAura(nom,base,fam,brut)`, `chaineTick`, `chaineEncaisse`, `chainePerdue`, HUD `#auraV2` (à gauche sous la
    pastille FLOW, toujours visible) + `#avGain`. Chaque geste entre avec SES points (affichés), chaque geste DIFFÉRENT +×1 (max ×10),
    redite ×0,7 ; ouverte 3,5 s au sol, gelée en l'air ; encaissée = points × multiplicateur ; perdue à l'explosion. Barème en tête du
    module. Libellés SANS accent (`sansAcc`) : la police pixel n'a pas de capitales accentuées.
  · **Moteur flottant** (26/09) : `#engBig` sans carte, au MILIEU de l'écran, moteur 3D (engRT 480×321, fond transparent) qui flotte
    (`ebFlotte`), gros NUMÉRO du palier (`.ebNum`, comme le badge de Léo).
  · **La carrosserie PENCHE** (« la voiture doit vraiment pencher sur le côté ») : `buildCar` range tout sauf roues et flaques au sol
    (`userData.sol`) dans `carBody`, qui roule autour de l'axe des moyeux (`pivY`). Roulis vers l'EXTÉRIEUR ∝ charge latérale
    (`yawR·v`), jusqu'à ~15° (+4° en drift), en RESSORT (ω 14, ζ .55 : `carRoll9`/`rollV`), tangage `pitch9`. ⚠ ne jamais remettre
    `carRoll9`/`rollV` à zéro DANS buildCar : elle tourne avant leur déclaration (zone morte). L'explosion arrache les pièces de `carBody`.
  · **HUD v4 — LE TABLEAU DE BORD** (26/09, « gère tous les affichages comme un tout qui rend accro ») : carte de l'écran en tête du
    bloc CSS « HUD v4 ». EN HAUT on LIT : nitro + ⏸ · **bande du FLOW** pleine largeur (`flowHudMaj` : 4 segments aux couleurs des
    paliers, nom `FLOW_NOM`, vrai multiplicateur de CASH `$×1,5` en vert — l'ancien « FLOW ×2 » mentait et se confondait avec le × de
    chaîne ; états `.presque`/`.fuit`/`.lache`/`.monte`) · **AURA** + **RECORD à battre** (`recInit/recMaj/recBattu`, `SAVE.d.auraMax`,
    crié une fois par partie) · CHAÎNE à gauche (s'ENVOLE dans le compteur à l'encaissement `.vole`, se brise `.perdu`, barre rouge la
    dernière seconde) · colonne de droite : chrono de vol + POUVOIRS (`#pwrChip` sorti de l'écran nu, sous le chrono en vol). AU CENTRE,
    le **couloir des annonces** `--laneA` : UNE voix (`slam` pose `body.slamOn` → niveau/dauphin/contrats/logo s'effacent) ; taille
    auto pour tenir dans l'écran. SUR LA CAISSE le geste (`popSuit` : au-dessus du toit, ou dessous en vol). Contour d'arcade 4 ombres
    sur tous les chiffres (le ciel pastel les dissolvait). Hook `dbgHud(k,n)`. Captures fiables : harnais Puppeteer + Chrome système
    (scratchpad `pp/shoot.js`, GPU réel, figer les animations CSS avant la capture).
  · **VOL LIBRE** (26/09, « pas de haut/bas en mode aérien, la voiture va là où on la guide ») : repère transporté `FLY_U`/`FLY_R`
    (le haut part de la normale de la route puis suit la trajectoire, aucun (0,1,0)) ; volant autour de `FLY_U`, manche autour de
    `FLY_R` SANS plafond (looping possible), caméra `up = FLY_U`. Plafond d'inertie = vitesse d'éjection ENTIÈRE (`fallVH0`).
  · **MÉTÉORE** = cratère UNIQUEMENT si nitro allumée au contact ET plongée > 45° (`2·vN² > v²`), plus la figure en l'air.
  · **LOT 6 (26/09 soir)** : ÉCONOMIE v4 — `DENOMS` 3 → 16 $ (×1,06/palier ; c'était ×1,585 → 401 Md sur une grande partie contre
    2,5 M pour la caisse la plus chère) : ~380 $/min en pilote auto, ~1 M sur une partie record. Ville : plus de circulation volante,
    plus de looping (`sansLoop` dans genCtrl), couronne peinte assombrie et posée 900 m sous l'œil (plus de bande violette ni de ligne
    néon), forêt 3D jusqu'à 2,1 km, tours DURES (`CITY.col` grille 60 m + `villeHeurt` dans la branche 'fall' → explose ; `dbgHeurt()`),
    marges `tourLibre` élargies. Routes 56 m (`LARGEUR=[2]`). Pouvoir VITESSE ×2. Nitro en l'air : IMPULSION +46 m/s à l'allumage
    (1 par appui, 0,5 s mini, 12 % de réserve) + une poussée DOUBLE de celle du sol (60 · 96 en bleue ; 26/09 « le nitro doit
    accélérer plus ») + le champ qui s'ouvre (`fovAir`, `fovPunch` lu en vol). Fruits posés à `fruitLeve(i)` (≥ 45 cm sous le fruit,
    battement compris) et RETOURNÉS sous la route. Flammes de jauge = NITRO MAX seulement. Pouvoirs en GRANDES plaques
    (minuteur au dixième, jauge continue). Écran de mort : le moteur 3D (`ENG_MORT`, rendu par `engVigRender`) au lieu du nom.
    Objets : pièce Ø 2,6 m à jonc (`geoFusion`), fruits ×2,7 (le battement écrasait l'échelle), pouvoirs en CRISTAL + 2 anneaux +
    étiquette pixel, plots 1,4 m à 2 bandes. ⚠ `level` = index de caisse (0-65) : il ne doit plus rien agrandir (aimant, plumes).
    Bancs : `dbgEssaiObjets()`, `dbgEssaiFruit(src,pal)` (scratchpad `gamme/objets.js`, `gamme/fruits.js`).
  · **VILLE v3 — LE CANYON** (26/09, « la route plus proche des immeubles, un truc premium compatible iPhone ») : `buildVoxCity` bâtit
    en coordonnées MONDE autour du ruban — 3 rangs de tours de chaque côté, posés LE LONG de chaque tronçon (la piste de la ville
    descend en spirale sur 7-9 km : plusieurs étages de route à la verticale d'un point) + une forêt au large par cases. RÈGLE D'OR
    `tourLibre` (grille de hachage des points de piste) : aucune tour ne coupe la route, elle se raccourcit ou relève son pied. Pieds
    noyés dans la brume (shader). 3 draw calls : `villeMatTours` (fenêtres dans le shader, fondues en lueur au loin), `villeMatNeon`
    (respire/clignote/grésille, `CITY.uT`), `villeMatTrafic` (voitures volantes déplacées par le vertex shader). Programmes compilés au
    menu (`villeChauffe`). Plus de suivi d'altitude ni de plancher. `dbgCity()` = comptes + ms de construction (~30 ms).
  · **LES POTS** (26/09, « pour chaque skin, les flammes des pots et la traînée de nitro au bon endroit ») : `buildCar` relève les
    VRAIS pots de chaque caisse (`CAR_POTS`, repère caisse) dans les pièces du kit (`lpKit` note ses cylindres/tours/boîtes :
    cylindres couchés dans l'axe, r ≤ 20 cm, ≤ 60 cm de haut, bout arrière dans les 70 cm de la poupe ; boîtes chromées plus larges
    que hautes ou petits tubes — ni verre, ni feux, ni tôle, ni butoirs). Sinon la fiche les DÉCLARE (`pots:[…]` : Chevalier noir,
    Mur du son, Mastodonte), la Comète prend ses propulseurs (`spec.rocket`), les autres gabarits gardent les pots canoniques. Tuyères
    (4 max), flammes au sol/en vol, retour de flamme, gerbe, arc-en-ciel, `nitroLight` et rubans en partent via `potMonde` (suit le
    roulis de `carBody`). Rubans = moyenne des pots les plus en arrière de chaque côté ; UN seul (`CAR_POT_1`) si d'un côté ou au
    centre. Banc des 66 : `dbgPots()`, `dbgSpec(i)`, `dbgNbCaisses()` (scratchpad `pots/audit.js`, planche avant/après).
  · **CIEL DE LA VILLE** (26/09, « la skyline, le sol et le plafond sont mal gérés, ça casse l'immersion ») : la couronne peinte
    (cylindre de 5,2 km, net derrière des tours noyées de brume, BORDS visibles en vol libre) est RETIRÉE ; le fond musical géométrique
    (roue, ondes, piliers — des polygones jusque sous l'horizon) s'efface dans la ville (`uVille<.999`). Tout vit dans le dôme,
    `villeCiel(d,az,ciel)`, par DIRECTION DU MONDE (aucune couture, caméra vrillée comprise), et CONVERGE vers `uFogCol` (la brume,
    recopiée chaque image) sur l'horizon : PLAFOND de nuages bas (520 m au-dessus de l'œil, éclairé par en dessous, parallaxe avec
    `uCam`, seulement sous la PLUIE `uPluie`), ondes de néon + éclairs sur les grosses frappes (les « clignotements » du 24/09) ;
    SKYLINE à l'infini (3 rangées `vTours` + 2 tours du chef `vChef`, pied fondu `fo`) ; ABÎME à 1 600 m sous l'œil (artères = lignes de
    niveau de bruits, quartiers, lumières floutées ; anticrénelage par l'empreinte du pixel `px`). Levier `LVL.ville` (fondu comme la
    pluie, carrière comprise) ; sous la pluie ni contre-jour ni soleil « 1.61 » (éteints = `visible=false`). Hook `dbgCiel(cap,site,h,
    roulis,nu)` : photo du ciel, `nu` masque les tours. ⚠ `villeChauffe` : les pubs chauffées SANS `setColorAt` (three r128 garde le
    1er programme : chauffées avec, elles faisaient jeter le rendu à chaque image quand la ville venait après l'auto-école).
  · ⚠ **PLUS AUCUN LOOPING** (28/09, Sacha : « enlève tous les loopings du jeu ») : `SANS_LOOPING=true` (juste avant `genTuto`)
    coupe les QUATRE sources — motif 0 de genCtrl (→ GRAND VIRAGE, comme la ville), signature VOLTIGE (→ descente), genTuto
    (→ GRAND PLONGEON 240 m à 18°), module LOOP VERTICAL du Parc (retiré). NUAGES/ORBITE changent à partir du 1er motif concerné.
    Mesure : `dbgLooping()` (portions à plus de 60° de pente) — avant : ORBITE 8 portions à 84°, auto-école 82°, Parc 85° ;
    après : 0 partout (Parc : 61° max = ses rampes, aucune boucle). `false` = les loopings reviennent. Le paragraphe qui suit
    décrit donc un looping qui n'existe plus que derrière l'interrupteur.
  · **PISTE v3** (26/09, « enlève les structures bizarres, quelques loopings de temps en temps ; ça va trop tout droit ») : hélice,
    spirale, tire-bouchon, entrelacs à ZÉRO ; looping SEUL espacé de 1,6 km ; pentes bornées (~30°) ; `courbe()` = une « droite »
    qui tourne ; GRAND BALAYAGE (motif 9) ; `lisserRaccords` (pente continue entre motifs) + creux adoucis. Banc : 62 % de piste en
    virage R<400 m (39,5 % avant), plus longue droite 1,6 km → 0,9 km, sorties 0,01/km. Scripts : scratchpad `v6/piste/conduite/virages.js`.
  · **PLUS AUCUN RALENTI** : `slowT`/`hitT` vidés dans la boucle (les déclencheurs restent, inoffensifs). **NITRO EN L'AIR** = la même
    poussée qu'au sol dans l'axe du vol, l'élan gagné relève `fallVH0`.
  · **PETITES ANIMATIONS** : feu de DOOM sur la jauge (`nitroFeu`, 96×18 cases, brasier en NITRO MAX, frange au boost), jauge chauffée
    à blanc (`.inf`), pouvoirs qui fondent et clignotent, reflet sur la bande du FLOW, lettres du niveau qui tombent, chrono de vol qui
    tremble < 1,5 s, confettis (`slam(…, fete)`) sur les annonces heureuses.
  · **LES CINQ FAMILLES** (26/09) : `RARETES`, `carRar(i)` (fiche `rar`, sinon déduite de `CAR_UNLOCK`), `rarListe`, `carOrdre`. Garage
    onglet VOITURES : barre des familles `#gRar` + bande de vignettes `#gStrip` (photos `carPhoto` via la file `photoFile`, une par
    image) + pastille `#gRarPill`. LÉGENDAIRE = boutique seulement (bouton « EN BOUTIQUE » → `#mShop`). Les 50 nouvelles caisses sont
    modelées dans l'atelier du scratchpad (`gamme/`, banc `essai.js` + hook `dbgEssaiCaisse`) et versées par `gamme/integrer.js`
    (blocs balisés « LA GAMME DES 50 » / FICHES / CONDITIONS / CARNETS — regénérer, ne pas éditer à la main). Index 0-15 inchangés.
    Gamme : 15 communes (1 500 → 15 000 $) · 16 rares (20 k → 200 k) · 14 épiques (300 k → 2,5 M) · 13 légendaires (boutique, €) ·
    8 défis (carnets 6-9 : PUCE, GROUPE B, HOT ROD, MASTODONTE ; + BULLE/COMBI/DOLORÈS/POSTER). Caméra de course : les caisses
    HAUTES (h > 1,5 m) reculent/montent la caméra (`hC9`). Garage : visée abaissée à l'onglet VOITURES (la caisse passe au-dessus
    des vignettes). `dbgEquipe(i)` pour tester une caisse en course. ⚠ `exSmoke` n'est plus émise : la caméra de poursuite
    TRAVERSAIT la fumée laissée derrière → un DÔME gris-blanc derrière la caisse.
  · **PORTAIL OVULE** (`PORTAL`, sphère 55 m fresnel + noyau) : `portailPasse()` appelé au sol (bout de piste / entrée dans l'ovule)
    ET en vol (branche 'fall', avant `tryLand`) — `dbgPortail(d|'ciel')`.
  · **NUAGES** : `nuageTouche()` refuse tout nuage de décor qui mordrait le ruban (sauf bancs `onRoad`, 2× plus rares) ; tours
    jamais plantées sur la piste ; coussins décollés de 30 m ; famille ARCHIPEL (16 cumulus à 0,4-2,8 km).
  · Bancs : scratchpad `v6/conduite/diag/` (diagnostic, sim6.js), `v6/conduite/moi/sim-v6.js` (le modèle retenu + pilote 150 ms),
    `v6/piste/base/` (banc.js étendu, variantes.js, resume.js). `dbgState()` expose psi/yawR/slipB/glisse/drift/roulisDeg/vH.

## LA CHARTE v4 — CARBONE · OR · NÉON (2026-09-26) — TOUTE L'INTERFACE HORS COURSE
Verdicts successifs de Sacha : v1 plate (« moche et mal fait ») · v2 borne d'arcade 1985 (« pas très moderne ») · v3 bonbon violet
brillant (« trop générique, pas de direction artistique »). Demande : « top 1 de l'App Store », refonte intégrale. ⚠ Les sections plus
bas qui décrivent la CHARTE v2, la CHARTE PIXEL UNIFIÉE, la charte v3 et les règles « INTERFACE » de la PASSE DE FINITION sont
PÉRIMÉES pour ces écrans : leurs règles CSS ont été SUPPRIMÉES (purge postcss, 630 règles, 27 @keyframes mortes).
- **OÙ** : UNE feuille, `<style id="charte4">`, posée DANS LE `<body>` juste avant `<div id="splash">` — après toute la feuille
  historique (elle gagne à spécificité égale) et loin de la fin du premier `<style>` où s'ajoute le HUD de course (zéro conflit de
  fusion). Écrans couverts : coque `#mob` (accueil, mort, modes, boutique, réglages), `#tPanel` (pause), `#garage` (DOM, pas la
  scène 3D), `#modale`, `#toast`, `#carr`, `#wipe`, `#nameEntry`, l'invite `#spNote`, le ⏸ `#tGear` et le bouton NITRO `#tNitro`
  (visuel seul, validé avec la session HUD). ⚠ Ne JAMAIS remettre de règle pour ces écrans dans le premier `<style>`.
- **LES TROIS MATIÈRES** : CARBONE (`--carbone`, sergé à périodes inégales + reflet ; `--tresse` pour les panneaux) = tout ce qui
  se touche, avec un filet de NÉON de livrée sur la tranche gauche (`--nc` : cyan = aller voir, magenta `.pb-mag` = boutique) ·
  OR = le LINGOT `.pb-gold`, l'UNIQUE action primaire d'un écran (face dégradée, filet gravé `outline-offset:-8px`, texte frappé,
  reflet `k4Lingot`) · NÉON = titres d'écran (`.mHead h3`, enseigne penchée + bande magenta), états allumés, raretés.
- **LA GRAMMAIRE** : PENCHÉ (`--sk` −11°) = JE TOUCHE (touches, onglets, puces, interrupteurs) ; ce qu'on LIT est DROIT, coins
  coupés (`.mPanel`, `.hCard`, `.mStat`, compteur, pastille de famille) — seul leur TEXTE garde la pente. Exception écrite : une
  ligne de liste touchable (réglages, modes, ticket de mort) = droite + filet + chevron. L'OR = l'argent ou le lingot, rien d'autre
  (réglages en lavande/cyan, ticket en cyan, prix de boutique = chiffres d'or sur plaquette noire). Rouge PLEIN = seulement dans la
  confirmation ; EFFACER et QUITTER sont en carbone à filet rouge.
- **LA TOUCHE** `.pbtn` : face + contour 2 px + TRANCHE 6-7 px dessous (box-shadow) + ombre au sol ; `:active` descend de la
  hauteur de la tranche. Variantes `pb-gold` `pb-cyan` `pb-mag` `pb-red` `pb-green`, états `.off`, tailles `.big` `.wide`
  `.pbCarre` `.ico`. ⚠ Le lingot : la tranche AVANT le contour dans la liste d'ombres (sinon un anneau sombre sépare face et tranche).
- **JETONS** dans le `:root` de charte4 : encres `--k0…--kl2`, or `--au0…--auT`, néons `--neoM/C/V/R/A`, `--cash`, textes
  `--tx/--tx2/--tx3`, corps `--f0` (8 px, plancher) → `--f8`, safe areas `--sT/--sB/--sL/--sR` (TOUT passe par elles — pour simuler
  une encoche en test : `:root{--sT:59px!important;--sB:34px!important}`), `--gut`, `--coupe`. Une courbe `--ease`, deux durées.
- **ÉCRANS** : sous-écrans = SORTIE EN BAS (`.mDock`, collé au bas, « ◀ RETOUR ») · mort = colonne centrée, ressort `.mEsp`
  (REJOUER sous le pouce sans creuser le milieu), montant qui CLAQUE (`.clac` en fin de `mCount`), confettis si record
  (`mCompteSon`) · boutique = vitrine MAGENTA (cadre `k4Or`, rayons `k4Rayons`, badge `.shRemise` −50 %, `BIENTÔT` en simple mention) ·
  pause = RECOMMENCER + QUITTER sur une rangée (`.tpRow`), REPRENDRE lingot collé en bas, ⏸ et commandes masqués dessous ·
  fenêtre = FEUILLE DU BAS, ANNULER en dernier (Échap clique le dernier bouton), le bouton `pb-red` s'ARME après 420 ms (`.arme`) ·
  toast en HAUT (au garage : au-dessus des onglets), filet vert/rouge selon l'icône coche/croix · fondu `ecranWipe` = VOLET PENCHÉ
  (liseré or + magenta) qui balaie de droite à gauche (contrat JS inchangé : couvert en 200 ms).
- **GARAGE** : EN HAUT on lit (compteur vert, pastille de famille OU de catégorie, rang, NOM auréolé de `--rc`, condition si à
  gagner) ; EN BAS on touche (onglets, familles `#gRar`, vignettes `#gStrip`, barre `#gAct` = `#gClose` ◀ + UN lingot). ⚠ La fiche
  et les onglets ne bougent JAMAIS d'un onglet à l'autre (`#gRar` en `visibility:hidden` en habillage, la pastille dit la catégorie).
  JS : `gEtat(bt,etat,ic,txt)` (ÉQUIPER = lingot, ÉQUIPÉE = touche ENFONCÉE verte, VERROUILLÉE/À GAGNER = enfoncée grise, via
  `data-etat`), `gPrixHtml` (verbe + prix `.gPrix`), `gNomEntre` (le nom glisse s'il change), `gTampon` (« À TOI ! » frappé +
  éclair `#gEclat` de la couleur de la famille — l'achat ne se REDIT plus en toast), `gStripHabits(cat,i)` (la bande des PEINTURES/AILES/TRAÎNÉES : nuancier — chrome,
  or, mat ont leur matière —, aile, ruban ; prix / cadenas / coche ; clic = on ESSAIE). La famille active vient se centrer.
  En habillage, la rangée des familles porte les FILTRES `TOUT · À MOI · À ACHETER` (`SHOP.filtre`, `.gR.gF[data-f]`, remis à TOUT
  à chaque catégorie). ⚠ La bande des voitures se reconstruit aussi quand le nombre de caisses POSSÉDÉES change (`st._o`) — sans
  ça, une caisse achetée gardait son cadenas. Prix en euros : `eurTxt()` (« 4,99 € » / « €4.99 » selon la langue — à remplacer
  par le prix localisé de StoreKit). Carrière : sortie en bas (`.mDock` généré par `carrVue`), tuiles toutes numérotées.
  Volet : `body.voletSort` (480 ms) coupe la cascade de l'écran découvert — c'est le volet qui fait l'entrée ; `#wipe::after`
  porte la marque CASH CAR.
- **NITRO** : cadran (rond = une JAUGE, pas une plaque) à face carbone, jauge néon SEGMENTÉE (`--nr` orange / `--nx` cyan, posées par
  la boucle), s'embrase à l'appui ; `.plein` = halo sur `::before` dont seule l'OPACITÉ bouge. ⚠ Jamais d'animation de `filter` ici.
- **PIÈGES** : ⚠ un `filter:drop-shadow` sur une icône `.pxi` ne se voit PAS (le masque passe après le filtre et le rogne) — la
  lueur doit venir d'ailleurs. ⚠ La feuille historique floute `#overlay` (menu desktop) : `body.touch #overlay` remet
  `backdrop-filter:none`. ⚠ `#mob{display:none}` hors téléphone (sinon la coque s'affiche sous le menu desktop en `?pc=1`).
  ⚠ `#spNote` est en absolu centré : son `transform` garde `translateX(-50%)`. Les libellés neufs sont traduits (bloc i18n
  « charte v4 », après la ligne FRÉNÉSIE).
- **Bancs** (scratchpad de la session) : `pp/tour.js <prefixe> [port] [w] [h]` (13 écrans), `pp/extras.js`, `pp/extras2.js` (états
  rares : volet, tampon, carrière, anglais, record, défis), `pp/qa.js` (**62 vérifications** : routage, achat, équipement, onglets, filtres,
  langue, modes, pause, mort, rejouer, zéro backdrop-filter, cibles ≥ 44 px), `pp/nitro.js`, `css/purge.js` (la purge postcss),
  `pp/planche.js` (planches-contact). Serveur : `srv.js` sur le worktree.

## LA CHARTE AU COMPLET (2026-09-28) — les menus ET le HUD de course, une seule main
Sacha : « une interface parfaite et cohérente pour la version mobile verticale, du premier coup — tous les écrans, menus, affichage
en jeu ». Audit MESURÉ d'abord (captures de tous les écrans 390×844 et 375×667 — hors course, HUD, campagne, auto-école —, relevé des
styles calculés, critique DA indépendante) : les menus parlaient la charte v4, le HUD encore trois dialectes plus anciens. Tout vit
dans UN bloc en fin de `<style id="charte4">` (« LA CHARTE AU COMPLET », sections 1 à 10) + quatre retouches JS.
- **LA GRAMMAIRE, vraie partout** : PENCHÉ = je touche · DROIT à coins coupés = je lis · ROND = une jauge (cadran NITRO, chrono de vol).
  Une PLAQUE qu'on lit = carbone tressé `--k2`, deux coins coupés, FILET de sa couleur à gauche ; étiquette en pixel, PHRASE en `--sans`.
  Jetons : `--plaqueH`, `--coupeHP` (coins du HUD, `--coupeH` 10 px), `--filetH`, `--encre`. Rien d'arrondi, aucun dégradé dans un texte.
- **LES COULEURS** : OR = le lingot (UNE action primaire) + le prix en vrai argent ; en course l'or est la VOIX des annonces (niveau,
  slam, verdict, record à battre, consigne de l'auto-école), jamais un fond de plaque · `--cash` = l'argent du jeu · `--aura` = l'aura
  et ses records · CYAN = aller voir / info · MAGENTA = boutique + halo des titres · VERT NÉON = allumé / gagné · ROUGE = danger, fin ·
  une jauge prend la couleur de ce qu'elle mesure. Lavande (`--tx2`) = neutre (la tuile RÉGLAGES).
- **CE QUI A CHANGÉ** : (1) UN logo — `#spTitle` et `#launchLogo` prennent la pente, la chasse, l'ombre et la livrée de l'accueil
  (la pente est AJOUTÉE à leur transform d'animation) ; l'invite de l'écran titre en filet cyan. (2) MORT rangée comme l'accueil
  (`order` : ressort, tuiles, PUIS REJOUER tout en bas) ; titre NOUVEAU RECORD en `--aura`, fin de campagne en `--neoV` (l'or reste au
  lingot) ; pastilles des cartes à la couleur de LEUR carte ; en-têtes AURA/MOTEUR alignés ; `▶` réservé à ce qui se touche (« ENCORE
  400 · REMARQUÉ ») ; « 1 PIÈCE » s'accorde ; tient sans défiler sur 375×667 (compactage `max-height:760px` / `690px`). (3) CARRIÈRE :
  `.carrIn` en colonne pleine hauteur + `#carr{padding-bottom:0}` → RETOUR collé au bord (sticky ne colle que ce qui déborde) ;
  chevron sur les cartes de monde ; jauge vide à 0 ; numéros de niveau alignés. (4) MODES : le même interrupteur que les réglages.
  (5) Fenêtre destructrice filet ROUGE ; « restaurer mes achats » 44 px ; pause à 20 px du titre ; étiquettes de volume lavande ;
  compteur du garage « $ 48 250 ». (6) Jauges nitro/FLOW à coins francs. (7) `#avVal`/`#avX` en couleur PLEINE (ils étaient en dégradé
  découpé). (8) Pouvoirs, astuce/défi (`#misBan`), auto-école (`#coach`, c'était une carte de verre arrondie), objectif de campagne
  (`#campChip`) = la plaque du HUD. (9) Colonne de droite FIXE : case du chrono de vol réservée (hudH+96), objectif de campagne à hudH+184,
  pouvoirs à hudH+184 (+248 en campagne) — ils sautaient de 88 px à chaque décollage ; en campagne le couloir `--laneA` descend (384 px).
  `airPieDraw` : le chrono de vol est le frère du cadran NITRO (face carbone nuit, anneau segmenté 16°/4°, « AIR » 8 px affichés).
- **(10) LA FRÉNÉSIE, REFAITE** (même soir, Sacha : « retravaille l'effet frénésie / dark triad, beaucoup beaucoup ; une petite part
  rouge dans la barre de flow = une zone de tolérance pour rester en frénésie plus souvent ; la barre toute rouge qui scintille quand
  elle reçoit encore du flow ; le logo plus beau, plus gros, mieux animé, ROUGE ; parfaitement intégré, pro dès le début » — et : « le
  son, la musique, je la mettrai après » → RIEN n'a été touché côté audio).
  · **LA ZONE ROUGE** (`FREN`, `flowLvDe` = le SEUL calcul du palier) : hystérésis — on ENTRE à 100 (inchangé), on RESTE tant que
    `FLOW.v ≥ FREN.seuil` (88) ; dans la zone la fuite est retenue ×`FREN.retient` (.45) → sans style la frénésie tient ~3,6 s au lieu
    de 1,8. Le tic « ça lâche » vise le bord de la zone. Les coups directs sur `FLOW.v` (foudre, choc, porte) passent par `flowTick`.
    Dessin : la 4e cellule porte `.fZ` (à partir de `--fzL`, posé par le JS depuis FREN) — hachures rouges tant qu'elle est vide, cran
    clair au seuil, et son propre remplissage rouge PAR-DESSUS le violet (`FLOW.zs`, classe `.dansZ` = un seul curseur, celui de la zone).
    `FLOW_CEL` = couleurs des cellules (la 4e reste violette) ; `FLOW_COL[4]` = ROUGE (#ff2a3d, jetons `--fren*` en tête de la section 10).
  · **LA JAUGE EN FRÉNÉSIE** : `.embrase` (cellules qui flambent de gauche à droite) puis toute rouge, halo `#flowHud::after` qui bat,
    paillettes (`.fSeg::before` + `u.fG`, deux trames, deux cadences) ; **nourrie** (`frenNourrit`, ≥ 1,2 point, ≤ 1 fois/110 ms) :
    `.sc1/.sc2` (éclat + reflet qui la balaie + paillettes à fond) et braises `PIX_FREN` (≤ 1 gerbe/420 ms) ; **fuit** : la zone se
    hachure et clignote ; **lâche** : cadre qui clignote (le tic), emblème qui tremble. Plus d'arc-en-ciel (hue-rotate) nulle part.
  · **L'EMBLÈME v3 — EN PIXEL** (même soir, Sacha : « toute l'interface est faite en pixel, réinterprète la dark triad ») : un BADGE
    PIXEL de 54 × 49 cases de 2 px (108 × 98, `crispEdges`), généré case par case (scratchpad 52f21eda `fr/pix/gen.js` → chemins
    `<path style="fill:var(--…)">` par couleur, dans `<g id="trArt">`) : contour d'encre `--frenO`, biseau clair `--frenV` + lèvre
    `--frenC` à gauche, `--fren` + ombre `--frenS` à droite, base sombre, ÉPAISSEUR dessous à `--encre`, fond carbone tramé, un ŒIL au
    sommet, trois rivets ; texte « THE / DARK / TRIAD » en Press Start 2P 8 px calé au pixel. Il TOURNE COMME UNE PIÈCE (`.trPiece`
    preserve-3d + deux `.trFace` dont le revers déjà retourné, `rotateY` −720° / retour sur 5,2 s) : une rotation dans le plan
    floutait les pixels. Frappe = BOND de 6 px en paliers (`trPouls` steps(3)) + halo ; nourri = +2 px et éclat ; lâche = tremble de
    2 px ; onde de choc = le contour pixel, par paliers. Plus de fantômes. Enveloppes `.trTr`/`.trBat`/`.trPouls` inchangées ; JS :
    `frenEntre` (zone → `--ox/--oy`, `.on`), `frenSort` (`.sort` 440 ms), `.tremble`/`.froid` par `flowHudMaj`. `#flowGlow` bat en
    rouge (1,3 s) calé sur les frappes. Place (390×844) : boîte 188-296 × 72-170 — chrono de vol à 298, pouvoirs/objectif à 184 ;
    la barre du RECORD se contracte (`#avRec` max-width). « Réduire les animations » : ni tour, ni bond, revers et onde masqués.
  · **LA VOIX** (Sacha, même soir : « ça doit déclencher la voix TRIPLE MONSTRE quand la frénésie est atteinte ») : entrée
    `ANN_LIB.frenesie` (même fichier `triple_monstre.mp3`, son propre compteur — elle ne consomme pas le tirage 1/3 des vrais
    TRIPLE MONSTRE), appelée dans `flowAdd` avec `annSpeak('frenesie',5,true)` : À CHAQUE frénésie, forcée, priorité 5 (coupe
    un MONSTRE, cède au MÉGA MÉTÉORE), cd 2,5 s ; l'interrupteur VOIX reste maître. Banc muet `fr/voix.js` (compte les `new Audio`).
  · Première frénésie de la session : l'annonce dit « RESTE DANS LE ROUGE » (i18n EN/ZH) au lieu du ×. Hook **`dbgFren(k,n)`** :
    `'v'` n (100 = y entrer par le vrai chemin), `'nourrit'` n, `'idle'` s ; rend zone/emblème/classes. Banc : scratchpad de la session
    52f21eda, `fr/fren.js` (muet ; ne fige QUE les CSSAnimation — une transition en attente figée reste à 0 px).
- **(11) LE JUS v3** (même soir, Sacha : « les taches de jus de fruit doivent être plus opaques et grosses ») — `juiceScreen` /
  `juiceScreenTick` : taille sur la plus PETITE dimension de l'écran (même goutte debout ou couché), ~×1,5 (rayon ~37-73 px sur
  téléphone, plafond 90), brouillon `JUS_N` 192 cellules ; opacité PLEINE .9 la 1re moitié de la vie puis fondu (c'était ≤ .55 en
  fondu dès l'impact), corps .94 / cœur .9, coulure .95, `#juiceCv` opacité 1 ; l'ellipse du couloir s'élargit de la goutte (son
  BORD reste dehors). Banc `fr/jus.js` (dbgJus figé) : 14 taches = 13,6 % d'écran peint (6,2 % avant).
  **v3b** (même soir : « trop sur les côtés ; un peu plus grosses ; pouvoir apparaître PARTOUT sur l'écran ») : plus d'ellipse ni de
  bande du haut interdites — position uniforme sur tout l'écran (le HUD reste dessiné par-dessus) ; rayon ×1,25 (~46-91 px, plafond
  110), `JUS_N` 240. Cas extrême du banc (14 taches d'un coup) : 45,7 % d'écran peint ; un fruit en projette 1 à 5.
- **Écarté volontairement** (verdicts) : JOUER au garage, bouton d'action dans MODES/CARRIÈRE, ⚙ de l'accueil en bas, flèches du garage,
  rangée LA PARTIE de la pause descendue près de REPRENDRE (QUITTER ne se colle pas au lingot), l'or du HUD (voix des annonces, record en
  or demandé le 26/09 : « plus en lavande 8 px »).
- **Bancs** (scratchpad de la session 923b15ae, `ui/`) : `tour.js` (34 écrans), `tour2.js` (états + AUDIT des styles calculés →
  `audsum.js`), `tour3.js` (auto-école, moteur, record), `tour4.js` (logo du départ, astuce, défi, campagne VILLE 4 + rectangles),
  `tour5.js` (FRÉNÉSIE, emblème), `planche.js`. Serveur `srv.js <racine> 8097`. Tous muets.

## PASSE DE FINITION (2026-09-26) — quatre audits (son · interface · ergonomie · rendu iPhone), six lots
Commits `2608066` (lot 1) · `c3493a5` (lots 2-3) · `04e8d28` (4) · `bd995f4` (5) · `3f5c08e` (6). Ce qui est devenu une RÈGLE :
- **RENDU** · Les lumières ponctuelles n'éclairent QUE la caisse : `LFB_SANS_PL` (le chunk `lights_fragment_begin` sans sa boucle de
  PointLights) est branché sur `roadMat` et `CLOUD_MAT` — ⚠ une PointLight ne peindra JAMAIS la route (c'étaient les taches rondes, et
  ~20 % du GPU). ⚠ r128 remplace `NUM_POINT_LIGHTS` par sa valeur dans le texte : on ne peut pas le redéfinir, on retire la boucle.
  · **Jamais de `new THREE.PointLight` en cours de partie** (le nombre de lumières change → tout recompile : 1,5 s à l'explosion).
  `boomLight` RECYCLE `swapLight`. · Particules « proches » (`makePool(…,true)`, `ptProche`, `PT_U.uPxMax`=26 px×DPR) : taille plafonnée
  et fondu sous 3,5-8 m de la caméra — les pools de l'explosion n'y sont pas soumis. · Plus de néon sous caisse, plus de `CARPOOL.tail/jet`,
  `nitroLight` à 0 au repos, `trailLight` à 0. · `bloomPass.setSize` surchargé (l'`addPass` écrasait `bSc`). · ACES : `FXAA_ON` (anticrénelage
  là où il n'y a pas de MSAA), `roule()` = coude des hautes lumières qui garde la teinte (plus de clamp intermédiaire), flou de boost en
  8 lectures, `FLOU_OK` (coupé au palier BAS, qui passe l'ombre à 512 sans recompiler). · Caisses : `refl ≤ .45`, `shin ≤ 300`, lueur ≤ .2 —
  ⚠ l'index de caisse n'est PAS une progression. `paintEnv` peint le cube face par face (zénith, sol, point chaud vers `SUN_DIR`).
  Traînée nitro : `TRAIL_TEX` (cœur/bords), fondu 6-14 m. Caméra du garage bornée à 8 m horizontaux (cadrage rendu par le FOV).
- **SON** · `nOn9` : la flamme nitro ne vit que manette en main ; `endGame` éteint aussi `whG/skidG/jrG/jrDep/jetG/jetLowG/jetOscG`.
  · Un `play()` refusé ne condamne un sample que sur `NotSupportedError` ; la voix libère le ducking à sa `pause` + filet 7 s.
  · `deathSound(sansVoix)` (pas de « ewww » sur l'annonceur) · `poseSndT` : la visseuse du palier moteur attend 450 ms après une pose
  · `chaineAura(…,muet)` : un seul carillon par figure / pose · `pwrPrisSnd/pwrFinSnd` · `mCompteSon` (l'écran de mort sonne) ·
  encaissement à 2-3 notes · tic d'airtime sous 1,5 s · « tchk » de nitro à vide · `boostSnd` ±6 % · bourdon du drift en si/mi
  · VRAI iPhone (`TEL_NATIF`) : `lpMin` 700 Hz du moteur, `subBoom`/`heartBeat` remontés, `jetLowG` à 0, pops moins denses et plus hauts.
  · Contexte audio suspendu en arrière-plan AUSSI au menu ; `togglePause` coupe voix et samples ; `uiClic` attend le réveil du contexte.
- **ERGONOMIE** · `TCTL.mortT` : 0,6 s d'écran de mort sourd (les taps réflexes n'ouvrent plus RÉGLAGES/GARAGE) · retour d'appli en course
  → le panneau PAUSE s'ouvre · `repriseCompte` : REPRENDRE / Échap / retour en portrait = 3-2-1 jeu gelé (`#slam9.compte`, retirer `on` à la
  fin sinon le « 1 » revient) · `#tNitroZone` : tout le coin bas-droit est la NITRO (`bindHold(el,code,onDown,vis)`) · `explode(cause)` →
  `mortCause` → `#mCause` sous GAME OVER · astuces uniques `SAVE.d.ast` (bit 1 drift, bit 2 assiette) · `runStats.xMax` = CHAÎNE MAX ×n
  · le record de fin s'allume aussi pour l'AURA (`CHA.recB`) et le MOTEUR · `recInit()` dans `start()` · auto-école : TOURNE à .25,
  NITRO comptée en vol, sortie de route (> .5 s en l'air, étapes 0-1) rattrapée avec « SORTI ! TON POUCE RAMENE LA CAISSE » · intro 4,6 s
  pour qui a déjà joué.
- **INTERFACE** · Le bloc CSS « PASSE DE FINITION » est le DERNIER du `<style>` : il gagne. Pouvoirs en `pxi` (`flamme` ajoutée à `PXI_G`) ;
  sous `#tPanel.open`/`#carr.on` le HUD est `visibility:hidden` ; or = action (onglet de garage violet, prix = étiquettes) ; garage
  arrondi (l'octogone reste au HUD) ; titres en `--ttrOr` ; petits écrans (< 720 px) compactés ; curseurs 44 px ; solde au format de la langue.
- **Écarté volontairement** : caméra plus haute (réglée par Sacha), ⚙ de l'accueil en bas (accueil v3 voulu), aura recolorée, planète en
  shader (son halo bat au rythme, voulu), gros chantiers perf (route en 3 colonnes, plots/pièces instanciés, nuages LOD, piste par tranches,
  RT 8 bits) : gains réels, risque moyen à élevé — passe dédiée. MODES et CARRIÈRE restent volontairement sans bouton.
- **Vérifier** : harnais Puppeteer + Chrome système (puppeteer de `Desktop/projet-161`), `--mute-audio`, sauvegarde sfx/mus/vox à false.
  ⚠ `dbgSaut()` = passer au NIVEAU suivant (pas un saut) ; pour s'envoler : `dbgDauphin(hauteur,vA,vLat,lat)`. Un test ne mesure le son
  qu'en comptant les `createOscillator` (patch avant chargement).

## PASSE PERF iPHONE (2026-09-27) — « NETTE doit rester nette, surtout en vol » (iPhone 13 Pro, DPR 1,5)
Mesuré au départ (banc Chrome, viewport iPhone, NETTE figée) : ~750 000 triangles/image dont ~600 000 pour la piste ENTIÈRE dessinée à
chaque image ; en vol le CIEL devenait le 1er poste GPU (×5, il couvre la moitié de l'écran) ; CPU +60 % en l'air ; et la résolution
adaptative descendait EN PREMIER. Cinq lots (branches perf-ciel/-post/-cpu/-piste/-caisse fusionnées). Ce qui est devenu une RÈGLE :
- **CIEL** (`skyDome`) : chaque couche ne se calcule QUE là où elle peint (guirlande, étoiles par cellule, lune, cœurs du soleil, voile,
  `atan` à la demande), coupures posées à la borne exacte où le terme vaut 0 (écart mesuré ≤ 1/255) ; mer de nuages en UNE passe
  (`mfbm2`) ; VILLE pleine → saut direct à `villeCiel` (le ciel habituel était calculé pour être jeté), abîme/artères bornés en distance.
  ⚠ La mer de nuages est maintenant les 2/3 du dôme aux NUAGES : l'alléger changerait son dessin (4→3 octaves) — décision de Sacha.
- **CIEL EN DEUX TEMPS** (tour 2, `CIEL2` après `chauffeDivers` ; shader du dôme rangé en morceaux : une fonction par couche, un
  `main` par programme) : les couches LISSES (dégradé, mer, soleil, guirlande, voile · plafond de pluie, lueur des quartiers) sont
  peintes à ½ résolution dans une cible hors écran (format du compositeur, suit `curDPR`) ; le dôme à pleine résolution la relit au
  pixel (`gl_FragCoord`) et n'ajoute que ce qui a des BORDS (étoiles, lune · lumières fines de l'abîme, skyline) + la trame.
  Un seul point d'appel : `scene.onBeforeRender` (chaîné). Repli = programme PLEIN d'avant (fondus de la ville, fond musical hors
  ville, atelier, étal, `?ciel=plein`). ⚠ Découverte : sous le rendu logiciel et ANGLE/D3D les `if` du shader NE sautent PAS le
  travail — chaque pixel payait tout le programme (éteindre la mer ne changeait rien) : ce qui paie, ce sont des programmes à la
  taille de leur travail. ⚠ Une couche qui a des bords ne va JAMAIS dans la passe lisse ; en cible 8 bits la passe lisse se trame
  (`uBasTr`), sinon anneaux d'arrondi. Banc `dbgCiel2(on,{rendre,f,octets})`, micro-banc `scratchpad/ciel2/mb.js`.
- **ÉCHELLE DE QUALITÉ `QL`** (remplace `applyPerfTier`, `dbgQual()`) : UN curseur `QL.k`, chaque cran enlève d'abord ce qui se voit le
  moins — ombre 1 image sur 2 en vol loin des dalles · carte d'ombre 768 · bloom ¾ · ombre 512 · flou radial coupé · PUIS la résolution,
  jusqu'au PLANCHER NET (1,25 en NETTE, `DPR_MIN` en RAPIDE) ; sous le plancher puis bloom éteint seulement sur EFFONDREMENT (> 24 ms 6 s
  d'affilée). RÉVERSIBLE : on remonte dans l'ordre inverse (la netteté revient la première). Anti-yoyo, 30 Hz imposé, chargements : inchangés.
  Zéro recompilation (tailles de carte, drapeaux, uniforms). `applyQ` → `qlReprise()`.
- **BLOOM 13 → 8 passes plein écran** : composite + copie additive sommés DANS l'ACES (`bloomPass.fuse`), seuil plié dans le 1er flou,
  mips 3-4 en flou 2D d'une passe (`plie`). `?bloom=ancien` = l'ancien chemin pour comparer sur le téléphone.
- **MONITEUR `?perf=1`** : une ligne en haut (ms, pire image, i/s, DPR/plafond, cran QL, allègements). Absent sans le drapeau (charte).
  C'est ce qu'on demande à Sacha pour tout rapport de fluidité : captures `/jouer/?perf=1` au sol et en vol.
- **PISTE EN TRANCHES** (`pisteTranches`, `PISTE_CH=600` points) : bitume, flancs, rails, nappes, ligne centrale bâtis ENTIERS (normales
  calculées sur le tout) puis répartis en tranches à rangée frontière dupliquée, une sphère chacune → le frustum culling de three fait le
  reste. UNE matière par famille (NEON_RAILS/NEON_GLOW n'en ont plus qu'une chacun). `pisteLoin` : une tranche entièrement au-delà de
  `scene.fog.far` passe le bitume à 2 colonnes (même surface, déjà couleur du brouillard) et coupe la ligne. Géométrie hashée identique à
  l'ancien code. `dbgPiste(on,loin)` = témoin sans tri. En vol : −58 à −81 % de triangles.
- **PLOTS VUS** (`conesVus`, `CONE_PM`, `CONE_OMB`) : avant chaque rendu, seuls les plots dans le champ (4 instances sans ombre) et dans la
  boîte d'ombre du soleil (3 instances qui ne font QUE l'ombre) partent au GPU ; tampon renvoyé seulement si la liste change ; chauffe
  forcée 3 rendus (sinon le programme instancié compilait au 1er plot). ⚠ `scene.onBeforeRender` est pris (`pisteLoin`+`conesVus`) :
  CHAÎNER, ne jamais réassigner.
- **PLAQUES TURBO** : `padsInstancier()` (dans newTrack après conesInstancier) → UN `InstancedMesh` `PAD_IM` (82 draws → 1) ; toute
  animation d'une plaque passe par l'instance.
- **CPU** : `dalleIx`/`dalleProche` (casiers de 64 points dans une sphère) remplacent le balayage de toute la piste par `tryLand` et le
  viseur (résultat identique prouvé sur 36 000 requêtes, 3-5× plus rapide) ; ⚠ `scene.updateMatrixWorld` SAUTE les enfants directs
  INVISIBLES (l'atelier caché, pièces hors couloir…) : pour lire `matrixWorld`/`localToWorld` d'un objet caché, l'ajouter à
  `SCENE_TOUJOURS` (la caisse y est) ; `airPieDraw` dessine hors écran puis UNE copie ; `updatePool` saute les réserves vides ; sur
  téléphone plus de `fmtC` pour la mallette/le compteur masqués ; nuages `matrixAutoUpdate=false`. En vol le CPU coûte ≈ le sol.
- **TOUR 2** (même jour, verdict « ça marche pas, on repasse en mode pixel assez vite après avoir lancé ») :
  · **QL v2** : la mesure n'est plus la moyenne glissante mais la PART D'IMAGES RATÉES sur les 60 dernières (`QLR` : p50/p75/p90 —
  sur un écran 60 Hz une image qui déborde dure 33 ms, la moyenne mélangeait à-coups et lenteur) ; DEUX planchers par réglage, le net et
  le BAS jamais franchi (NETTE 1,25 / **1,0** · RAPIDE 0,85 / 0,7 — l'ancien plancher 0,5 ÉTAIT « le mode pixel ») ; « la netteté ne se
  sacrifie que si ça paie » (`QL.essai` : un cran de résolution qui ne fait pas baisser les centiles en 3,3 s est annulé et devient un
  plafond 45 s) ; départ de partie = 5 s de grâce (`loop._rebuildD`), remontée plus vite (2 crans quand p90 < 16,9).
  · **`chauffeRendu()`** : toute la scène dessinée UNE fois hors écran (cible 8×8 au format du composer) au menu (fin d'engChauffe) et
  120 ms après chaque newTrack — Safari/Metal ne crée le vrai programme de la puce (état de pipeline) qu'au 1er dessin de chaque combinaison,
  invisible au compteur linkProgram. Un objet caché dont la matière n'est pas compilée reste caché (rien d'inutile compilé). Coût mesuré :
  +2 programmes au 1er portail (matières de la carte moteur), une fois par session.
  · **Piqué** `uSharp` dans l'ACES (branche « peu de contraste » du FXAA, ses 4 lectures, borné par le voisinage) : 0 au plafond (image
  identique au bit près), dosé par `applyDPR` quand la résolution descend. `?pique=0` pour comparer.
  · **LE BANC DU TÉLÉPHONE `?banc=1`** : lance une partie seul, fige l'image au sol puis en vol (NUAGES, VILLE), chronomètre des images
  SYNCHRONISÉES (`readPixels` d'1 pixel en fin d'image = coût réel processeur+puce, sans la grille 16,7 ms) et éteint les postes un par un
  (DPR, post, bloom, ombre, ciel, nuages, piste, caisse, transparents, ville) ; mesure aussi l'affichage réel avec/sans HUD. Tableau à
  capturer. `&ech=0.25` réduit les échantillons (rendu logiciel). Hooks : `dbgDPR(d,sansPique)`, `dbgQual(k)`.
  · **POST tour 2** (écart ≤ 1/255) : FXAA et passes verticales du bloom en `texelFetch`, autres lectures en `textureLod(…,0)` ; HALO
  COMPOSÉ une fois par image (`bloomPass._cRT`) : l'ACES lit 1 texture au lieu de 5 ; `uWE` (WB×exposition) et `uKC` (contraste) posés par
  image dans `acesPass.render` ; tunnel/lueur nitro sautés quand ils valent 0 ; mips 3-4 à nouveau séparables (`?bloom=plie2d` = flou 2D du
  tour 1). Chaîne complète −33 % en rendu logiciel, −20/−25 % sur carte. ÉCARTÉ : LUT 3D (5-17 % des pixels à ≥ 7/255 : coudes du grade),
  halo 8 bits, cible R11G11B10F (mantisse trop courte pour le ciel clair), mediump (invérifiable sur PC).
  · **BITUME tour 2** : bitume en `FrontSide`, le bloc du DESSOUS de chaque tranche retourné à la construction (triangles inversés, normales
  et couleurs niées — le shader relit `abs(vColor)` et reprend le signe du `normalBias` sur `color.r`) : la face cachée n'est plus dessinée
  (−32 % sur la piste au sol en rendu logiciel). `LFB_ROUTE` (bitume) et `LFB_CAISSE` (tôles `rimify`/`lpMat`) SAUTENT les lumières nulles
  à ce pixel — lampe de couleur nulle, hors de portée, phare hors cône, directionnelle dos à la face (le soleil et ses 16 lectures d'ombre
  compris) : exact. `dbgBitume(false,false)` = l'ancien bitume. ⚠ Relevé : `stallKey`/`stallRim` (lampes de l'étal/atelier) passent
  visible → 10 lumières ponctuelles au lieu de 8 : ~30 programmes recompilés en entrant au garage puis au départ (voir la chasse aux gels).
  · **VILLE tour 2** (bloc « LA VILLE NE TRAVAILLE PLUS POUR RIEN » avant `villeMatTours`) : MESURÉ, la ville coûtait ~25 % de l'image en
  VILLE et les DEUX TIERS n'étaient pas des pixels (fenêtre de rendu d'1 pixel : encore 2/3 du coût) — 5 000 volumes × 24 sommets éclairés
  AU SOMMET par ~13 lumières, dont 75-80 % entièrement au-delà du brouillard. Désormais : QUARTIERS de 320 m (`villeTri`, chaîné sur
  `scene.onBeforeRender`) jugés à chaque rendu — hors champ = pas dessinés · entièrement au-delà de `fogFar` = matière NUE
  (`villeMatToursLoin`/`villeMatNeonLoin` : fogColor + pied noyé + pluie, zéro lumière, 4 interpolants au lieu de 24) · sinon complète ;
  tampons mis à jour par AJOUTS au bout / EFFACEMENTS repliés, ménage quand les restes dépassent 30 % (tout ranger à chaque changement
  remontait les tampons 40-115 fois/s). Au sommet `VILLE_TRI` (boîte hors champ repliée en un point, au-delà du brouillard sans lumière)
  et la PORTÉE DES LAMPES (`villeLampes` → `uLum9`, 4 sphères : les boucles ponctuelles/spots sautées là où leur apport est nul) ; au
  pixel, fenêtres/liserés/enseignes/pied/pluie seulement là où ils peignent (dérivées AVANT les branches) ; `USE_SHADOWMAP` retiré (la
  ville ne reçoit pas d'ombre). 5 appels de rendu au lieu de 3, +2 programmes au menu, 0 en course. Rendu logiciel, A/B dans la même page :
  ville −30 % au sol, −47 % en vol (sommets −57/−83 %) ; le reste est le PIXEL des tours proches (les `if` n'y sautent rien en logiciel —
  sur la puce, oui là où c'est cohérent). A/B au pixel (`dbgVilleAncien(true)` = l'ancien chemin) : 0 à quelques pixels d'ARÊTE (une arête
  rastérisée au bit près autrement). ⚠ Une matière de ville nouvelle passe par `villeChauffe`, dans l'ordre TOURS puis NÉONS (three trie
  les opaques par programme : le dessus d'une couronne est au ras du toit, à égalité c'est le néon qui gagne) ; ⚠ les quartiers se
  choisissent par TOUR (`tqC`/`tqN`) : ses pièces restent ensemble et dans leur ordre (égalités de profondeur aux croisements).
  `dbgCity()` = tri, ménages, envois ; `dbgVilleTri({lum,avAr,H,M,G,K})`. Bancs : scratchpad `ville2/` (m2 A/B+chrono, m6/m10 diff
  multi-vues, m7 GPU amplifié, churn, valide).
  · **LA MESURE DU VRAI IPHONE (28/09, banc `?banc=1` reçu par mail)** — iPhone 13 Pro, NETTE 1,5 : une image coûte **8-13 ms**
  (JS 1-2 ms), mais l'écran n'en montre que **30 i/s PILE** partout, même à DPR 1,0. Ce n'était PAS le jeu : Safari bridé à 30 i/s par
  l'iPhone (mode économie d'énergie, ou surchauffe — WebKit « ThermalMitigation »). La règle QL, qui ne voyait que 33 ms/image, baissait la
  netteté pour rien = le « mode pixel ». **LA SONDE** (`qlSonde`, `QLR.vrai`) : avant toute baisse, 5 images SYNCHRONISÉES (`readPixels` 1 px
  en fin d'image) donnent le vrai coût ; sous 14,5 ms c'est l'ÉCRAN qui bride → on ne baisse rien et ce qui aurait été baissé remonte
  (`QL.bride`, « ÉCRAN BRIDÉ » dans `?perf=1`). Sonde seulement quand des images sont ratées, au plus toutes les 8 s. Postes mesurés sur
  l'iPhone (écarts, en ms) : post −2/−4, piste −1/−5,5 (VILLE sol), ombre −3 (NUAGES sol), DPR 1,0 −1,5/−3 : plus rien de dominant.
  Le banc garde son tableau (`ccBancDernier`, rouvrir `?banc=1` le remontre, RELANCER / COPIER).
  · **Rendu logiciel = proxy du coût par pixel** : le même banc sous SwiftShader (`--use-angle=swiftshader`, ~11 min) classe les postes
  comme une puce saturée : ciel ~38 %, piste 20-50 %, post ~20 %, ville ~25 % en VILLE, ombres 3-12 %, résolution 1,25 = −23 %.
- **Écarté après mesure** : moins de mips de bloom (halo changé), RT 8 bits (banding), LOD de piste en deçà du brouillard (grain),
  décimation des rails au loin (silhouettes qui bougent), masquage de la face cachée du bitume (dalle qui vrille), regroupement des nuages.
- **Bancs** (scratchpad de la session 1a323fdd) : `banc/vol.js` (GPU par passe, `--drawgpu` GPU par draw sur image figée, `--attrib`
  triangles par objet, `--prof`), `ciel/skybench.js`, `post/echelle.js` (GPU lent simulé), `cpu/cpu.js` (bridé ×4), `piste/equiv.js`.
- **CHASSE AUX GELS** (2026-09-28, branche `perf-gels`) — les images qui figent, pas le débit. MESURÉ avant : 30-36 programmes compilés
  APRÈS le tap sur JOUER (~1,1-1,3 s de gel sur PC), 1-2 de plus à la 1re image de course, chaque portail ~150-200 ms de JS. Désormais :
  · **L'ATELIER À 8 LUMIÈRES** (`atelierLampes(on)`) : allumer stallKey/stallRim faisait passer la scène de 8 à 10 PointLights, et three
    recompile toute matière éclairée pour un nouveau compte (la caisse, l'atelier, le bitume et la ville vus derrière ses murs). Les deux
    lampes entrent quand les deux GYROPHARES (toujours à 0 hors poursuite) sortent : même compte, mêmes programmes que la course, image
    identique au bit près (même image figée rendue à 8 et à 10 lumières). ⚠ Ne jamais écrire `stallKey.visible=true` en direct.
  · **L'atelier se prépare au menu, d'abord** (`atelierChauffe`, dans engChauffe) : bâti caché dès que la police pixel est prête, compilé
    SEUL et dessiné une fois hors écran — `chauffeRendu(que)` : la scène ne garde que ses lumières (toutes enfants DIRECTS de la scène) et
    ces sous-arbres, sans passe d'ombre. Le garage du JOUER (`quiet`) ne prend plus de photos (sa bande est masquée) ; `CAR_GARDE` garde
    la 1re matière de chaque programme de caisse (le studio photo enchaînait deux constructions sans dessin et tuait les programmes).
    Résultat : **0 programme après JOUER**, même en tapant JOUER 0,3 s après le menu, même après une visite du vrai garage.
  · **La chauffe** : `chauffeRendu` ne dessine qu'UN exemplaire par couple (matière, géométrie) — les 2 000-4 000 pièces n'en valent
    qu'une (1 800-3 200 objets → 270-370 appels) ; `chauffeDivers(k)` une étape par image (c'était ~1,8 s d'un bloc) ; `chauffeGrace()` :
    chaque étape repousse la grâce de la qualité auto (`loop._rebuildT`) — une chauffe n'est pas une lenteur. `dbgChauffe()` (dev).
  · **buildTrack sans tableaux JS** : tampons typés à la taille exacte écrits en place (l'arrondi float32 à l'écriture = celui de la
    conversion), `normales9`/`sphere9` = computeVertexNormals/computeBoundingSphere recopiés opération par opération sur le brut,
    `TEINTE9` (la teinte du bitume ne dépend que de (point, colonne) : une fois par session), `sceneRetire` (retrait de la scène d'un seul
    passage — remove() un par un était quadratique sur ~5 000 enfants), `PIECES_LIBRES` (les pièces de la piste d'avant recyclées,
    `userData.pi`). Empreinte IDENTIQUE vérifiée (pts/T/Nn/B, pads, plots, huile, tremplins, trous, pièces, nuages, attributs + index +
    sphères de chaque maillage, ordre des enfants) sur 18 pistes × 3 niveaux. buildTrack ~2× plus rapide (banc, minima : 140 → 51 ms
    orbite, 165 → 82 nuages, 150 → 95 ville), pire image après un portail 26 → 16 ms.
  · Bancs (scratchpad de la session 1a323fdd, `gels/`) : `gels.js <racine> [--menu=ms] [--bride=4] [--garage] [--prof] [--time=f1,f2]`
    (le parcours réel, programmes liés avec matière/objet/lumières/appelant, images longues par phase), `bt.js <racineA> <racineB>`
    (newTrack A/B alterné dans le même navigateur, graines forcées, empreinte, chronos, minima), `garcomp.js` (l'atelier à 8 vs 10
    lumières, même image), `gelsprof.js` (qui occupe chaque image longue). ⚠ Les FRUITS se tirent au Math.random hors graine, que la
    musique consomme selon son état : ils changent d'une partie à l'autre (normal), pas la piste.

## PASSE DÉBOGAGE / PERF (2026-09-26) — lots 1 à 4, mesurée (téléphone émulé, processeur bridé ×4)
Résultat : 60 i/s partout sur PC, ZÉRO compilation de shader en course (portails, montées de moteur, rejouer, 1re ville, 1er vol de
pigeons). Pires images, bridé ×4 : moteur 169 → 65-92 ms, portail 322 → 66-111 ms, croisière 36 → 18-22 ms/image. Ce qui est devenu une RÈGLE :
- **Scène gelée** : `scene.matrixAutoUpdate=false` (sinon three recalcule ~6 000 matrices par image). Les objets IMMOBILES (plots, pièces,
  fruits, pouvoirs) sont posés puis `updateMatrix();matrixAutoUpdate=false` — un objet gelé qu'on anime doit appeler `updateMatrix()` lui-même
  (le LOD des pièces le fait). **Plots en instances** : `CONE_IM` (4 `InstancedMesh`, `conesInstancier()` après `buildTrack`) ; `CONES[i].mesh`
  est un FANTÔME hors scène ; un plot percuté passe par `coneVole(c9)` (un vrai `mkCone` prend sa place). Plaques turbo : 42 images pré-dessinées
  (`PAD_FR`, `updatePadTex` change la `map`, jamais le canvas).
- **Sons continus** : `stt(param,v,t,tc)` au lieu de `setTargetAtTime` dans la boucle (rien si le contexte dort, rien si la cible n'a pas bougé).
- **Ne jamais détruire un programme qu'on va réutiliser** : three DÉTRUIT un shader quand sa dernière matière est libérée. Donc :
  · piste : `MAT_SURSIS` — les matières de l'ancienne piste sont libérées 3 images APRÈS le 1er rendu de la neuve (`matSursisTick`) ;
  · caisse : `CAR_VIEUX` (libérées à la construction suivante) ; moteur de la vignette : `engVigVieux` (après le 1er rendu du suivant) ;
  · **préchauffe au menu** (`engChauffe`, une étape par image, `!started||gameOver`) : `chauffeDivers()` d'abord (ville, trace de gomme, un
    pigeon), puis les 30 moteurs dans `engVigScene` — la 1re matière de chaque programme reste en vie dans `ENG_GARDE`. ⚠ Tout ce qui naît EN
    COURSE pour la 1re fois avec une matière neuve doit rejoindre `chauffeDivers` (le vérifier avec un compteur de `linkProgram`).
- **Vignette moteur** (carte « NOUVEAU MOTEUR », écran de mort) : rendue seulement quand elle est recopiée (30 i/s), relue en ASYNCHRONE en
  WebGL2 (`engLit` : PBO + `fenceSync`, l'image arrive 33 ms plus tard ; repli `readRenderTargetPixels`), recopiée ligne par ligne (`engPose`).
- **DOM** : on n'écrit un style ou un texte QUE s'il change (`textContent=` recrée le nœud même à valeur égale). ⚠ Ne JAMAIS lire
  `innerWidth/innerHeight` dans la boucle : sur Chrome mobile ça force une mise en page complète → lire `VP.w/VP.h` (tenu à jour au `resize`).
  `applyDPR` ne réalloue qu'une fois et ne retaille les canvas 2D que si leur taille change (retailler un canvas l'efface).
- **Fuites fermées** : géométries de caisse/pigeons/explosion libérées ou partagées (`userData.partage`), `jeteObj` au `clearBoom`.
- **Bancs** (scratchpad de la session) : `debug/perf.js` (ressources GPU, draw calls, profil), `debug/acoups.js <racine> [brideCPU]` (pire image
  + shaders compilés par événement), `debug/boot.js` (erreurs de démarrage — À LANCER APRÈS CHAQUE LOT : `node --check` ne voit pas une
  variable avalée par un commentaire).
- **iPhone** : `f16ok` essaie un tampon demi-flottant 4×4 au démarrage — refusé par le pilote (écran NOIR sans erreur), le post-traitement
  repasse en 8 bits (testé en forçant le refus : image normale). Contexte WebGL perdu → sauvegarde, rechargement à la restauration.
- **Écarté après mesure** : grille spatiale pour la recherche de dalle en vol (~20 000 distances par image = moins de 0,1 ms, pas rentable).

## VAGUES GRAPHIQUES 2 et 3 (2026-09-26 / 27) — « L'ENCRE ET L'OR », puis les retours de jeu de Sacha
**Vague 2** (branche `fusion-gfx2`, six chantiers fusionnés) : ville/route/objets (plots rouge danger, pièces qui émettent l'or, plaques
turbo en or, liseré par niveau), voitures (laque, ombre cuite à l'encre, liseré de contre-jour, atelier), ciel (soleil « 1.61 » en or,
planète, ciel peint en DERNIER sur le plan lointain), HUD de course (FILE UNIQUE du couloir `hautPasse`, carte moteur v3 recollée dans
l'image WebGL), particules (explosion en volutes instanciées, jus pixel, réserves endormies), étalonnage PAR BIOME (`wb/sh/hi/con/bloom/
vig/rim`, `BIO_ETAL0` = les valeurs d'avant). La bible : encre `#1c0430` pour ombres et contours ; seul ce qui a de la VALEUR émet —
or `#ffd75e` argent, feu `#ff7a24` nitro, réserve `#5b7dff`, néon `#ff3ec8`/`#5ee6ff`, danger `#ff3b5c`.
**Vague 3** — les retours de Sacha après avoir joué la vague 2 :
- **NUAGES** : le « jour cobalt » (ciel bleu roi, mer d'encre, nuages encre/crème, `ETAL_JOUR`, apport de zénith) est REJETÉ — « j'aime
  pas le niveau dans les nuages, remets une version antérieure », puis « le ciel est bien maintenant, continue sur cette base ». Matin /
  midi / aprem et le modelé des nuages sont revenus à l'état d'avant la vague 2. ⚠ Ne pas re-cobaltiser le jour.
- **NITRO façon Asphalt** (bloc NFX, `nitroAllume`/`nitroEteint`) : à l'allumage onde de choc aux tuyères, recul caméra ~1 m + champ
  +7° (+8° en vol), cabrage ~3°, bords d'écran à la couleur de la poussée (une ligne dans l'ACES), traits de vitesse, « WHOOMP » ; en
  tenue flamme ×1,85 à cœur blanc, stries de vent 3D ; à l'extinction bouffée + pétarade, champ qui retombe en 1,2 s. Poussée et
  consommation INCHANGÉES. Aléatoire propre `nfxR` (ne touche pas `Math.random` du jeu). Banc `dbgNitro(r,x)`.
- **CAMÉRA** (`BOOM_CAM`, `CAM_ROUTE`) : la mort est un PLAN (recul en 0,55 s à ~14 m puis travelling lent et orbite 7°/s, objectif 70°,
  ciel toujours en haut, boule au centre de la zone libre, garde-fous tour/dalle, zéro ralenti). Sous la route : TONNEAU de ~0,2 s au
  passage dessus↔dessous (au lieu d'1,2 s de bascule) et CABRAGE ANTICIPÉ (la caméra lit la route 0,65 s devant et pivote d'une part de
  la pente). `dbgCamRoute({regle:{...}})` règle à chaud (ANTICIPE:0, ANTICIPE_DESSOUS:0, TONNEAU:0 = la caméra d'avant) ; `dbgBoomCam()`.
- **ÉCONOMIE** (bloc « ÉCONOMIE — VAGUE 3 », après `DENOMS`) : ~8× moins d'argent par partie, prix du garage inchangés. UN bouton
  global `gain` (dans `denom()`), `prime` (contrats), `defi` (seuils ENCAISSE), `flow` = ×1 · 1,3 · 1,5 · 1,8 · 2 (lu par `flowMult()` —
  jamais de multiplicateur en dur à l'écran), plafonds `recolte` ×2,5 et `serie` ×1,5. `qG` garde l'échelle des verdicts (MONSTRE…) et
  des pièces moteur. Record d'argent et Top 10 convertis UNE fois (×0,125, marqueur `eco:3`) ; la BANQUE n'est pas touchée.
- **HUD** : la barre de FLOW est de la famille de la jauge NITRO (même cadre, lèvre, reflet), juste dessous, 14 px, pictogramme
  « vague » ; les verdicts de pose (MONSTRE / DOUBLE / TRIPLE / MÉTÉORE / SNAKE LOOP + montant + pastilles de bonus) reviennent sur
  téléphone : `trickMsg` → `verdPousse` → une carte par image dans la file du couloir (famille `ver`). Banc `dbgHud('verdict',k)`.
- **ORBITE** (bloc après `pluieTick`, `orbiteBuild/orbiteLumiere/orbiteTick/orbiteChauffe`) — refait le 2026-09-27 (user : « la lune suit
  le joueur bizarrement, c'est un bug mais j'aime bien : mets-lui un visage inspiration troll face, CHOQUÉ, comme s'il le regardait ; à la
  place des astéroïdes des satellites STARLINK et des débris ; puis une lumière SPATIALE ») :
  · la LUNE garde son placement (tiers haut-droit, avec retard = elle « suit » le joueur — VOULU, ne pas corriger) ; `LUNE_R` 520 → 640 ;
    son VISAGE est dessiné dans le fragment (zéro texture) : yeux écarquillés, pupilles qui VISENT LA CAISSE (`uOeil`, direction écran
    lune → caisse, lissée + saccades), sourcils remontés, rides, plis du troll, bouche béante (dents, langue, mâchoire qui tremble) ; la face
    TOURNE ~22° vers la caisse ; `uChoc` monte en vol / nitro / explosion ; clignement rare ; yeux qui luisent sur la face de nuit ;
    hasard du regard = `orbAlea` (pas Math.random).
  · `SATS` (remplace ROCS) : 3 InstancedMesh + 1 matière `SAT_MAT` (pièces par `aPart`, variantes par `aVg`) — [0] Starlink entiers (1 ou
    2 ailes) : passants, champ, et TRAINS (files de 20-26 qui glissent, mouvement dans le vertex shader, éclat qui court le long de la file) ;
    [1] gros débris (satellite mort, étage de fusée, pan de panneau, petit satellite d'or) ; [2] éclats (matière par instance) + 2 anneaux
    de débris. `GLINT` : étoile à 4 branches sur chaque Starlink quand son panneau renvoie le soleil (tampons partagés avec [0]).
  · LA LUMIÈRE SPATIALE (`orbiteLumiere`, pondérée par `LVL.espace`) : UN soleil blanc rasant à GAUCHE de l'image, juste hors champ
    (`ORB.cle`, suit la caméra avec retard) — la fenêtre d'ombre suit `L_DIR/L_PERP/L_UP` (hors orbite = SUN_DIR au bit près, vérifié par
    `dbgOrbite('lum')`) ; hémisphère sans ciel, dessous = bleu Terre ; `fill` depuis la Terre, `kick` = clair de lune ; liseré (RIM) bleu
    depuis la Terre ; `FLARE` = voile + trait anamorphique du soleil hors cadre. Route d'orbite `route` .9 → .38 (le soleil l'éclaire).
  6 appels de dessin (+2), ~154 k sommets/image sur téléphone (les 4 variantes de gros débris EMPILÉES dans les mêmes
  sommets, `satEmpile`/`SAT_MAT_E` : 828 → 300 par instance ; ⚠ 14 attributs échouaient déjà au lien sous ANGLE, ce chemin en a 12). Zéro shader compilé au portail (mesuré). Bancs `dbgOrbite('vue'|'cout'|
  'photo'|'portrait'|'sat'|'train'|'rendu'|'force'|'lum'|'carte')`.
- **VILLE** (`VILLE_PENTE={seuil:.30,garde:.35}`, `adoucirPentes`) : la pente de la ville est comprimée au-delà de ~16,7° (pente max
  ~47° → ~30°), altitude seulement, zéro `rnd()` ajouté : NUAGES et ORBITE identiques au bit. `garde:1` = l'ancienne ville.
- **⚠ RELIEF COUPÉ PARTOUT** (même soir, user : « et en fait même pour la ville remets l'ancien terrain ») : `RELIEF_ON=false` — les trois
  niveaux ont la pente et les virages d'AVANT (banc : 36/36 pistes identiques à daf9e60 ; la ville garde VILLE_PENTE). Le programme
  ci-dessous dort derrière cet interrupteur (true = la VILLE seulement). Ne pas le rallumer sans que Sacha le redemande.
- **RELIEF — VILLE SEULEMENT** (même jour, user : « garde ce terrain pour la ville mais remets les anciens pour les deux autres niveaux ») :
  `reliefPiste`, les poids `wv` et les rayons larges ne jouent que si `sansLoop` (la ville) ; NUAGES et ORBITE retrouvent leurs pistes
  d'avant AU TIRAGE PRÈS (banc : 36/36 pistes identiques). Ce qui suit décrit donc la VILLE.
- **RELIEF** (`RELIEF`, `reliefPiste`, appelé à la fin de `genCtrl`) — « les parcours ne doivent pas toujours aller vers le bas… mets
  plus de virages larges », puis « 40 % descente, 30 % montée, 30 % plat ». Avant : 95-99 % de la piste descendait (6 à 13 km de chute
  par niveau). L'altitude ne vient PLUS des motifs (leurs `dy` ne servent qu'aux loopings) : un programme de tronçons DESCENTE −6/−15° ·
  MONTÉE +5/+11° · PLAT 0°, tenu en longueur, rampes de 120 m ; une montée débouche toujours sur un plat (pas de crête aveugle) ; 250 m
  plats avant le portail ; loopings transportés d'un bloc ; ÉTAGES : là où la route repasse sur elle-même, la suite passe DESSOUS à ≥ 85 m
  (marche douce, toujours vers le bas — ne jamais « soulever » : ça oscillait et faisait des pentes à 50°). RNG = hachage du tracé.
  Mesuré (banc `scratchpad/relief/mesure2.js`, 8 graines × 2 vitesses × 3 niveaux) : 28 % montée · 42 % descente · 30 % plat, chute
  ~0,3-1,2 km par niveau, écart mini aux croisements (hors loopings) ≥ 63 m. Virages : grand virage R 130-320 et grand balayage R 160-320
  (×RS), poids relevés partout — part de la piste en courbe LARGE (R 400-1500) ~22 % → 44 %, serrée (R < 150) ~13 % → 6 %. La caisse
  roule ~15 % moins vite en moyenne (la pente ne pousse plus en permanence). Nuages : la garde `nuageTouche` écarte ceux qui mordraient
  la route (85 nuages au lieu de 88).
Vérifié : VERIF OK, grand tour 0 shader compilé en course, 60 i/s.

## ⚠ FUSION SACHA × LÉO + NIVEAUX — 2026-09-24 (branche `fusion-2026-09`)
- `index.html` = fusion à trois points : appstore-backlog (Sacha) × `main:version-leolei-2026` (Léo),
  base `fusion-atelier-mobile`. Hors ligne : `vendor/` + police locale (aucun CDN, aucune Google Font).
- **NIVEAUX** (`NIVEAUX`, `LVL`, `lvlChoisir/lvlBiome/lvlGo/lvlStep/lvlPlanete/lvlNuageOk/lvlAnnonce`) :
  une zone = un niveau, en boucle **1 NUAGES** (jour : matin/midi/aprem, ciel SANS motif musical) →
  **2 VILLE** (biome `pluie`, ciel musical allumé, pluie `PLUIE`) → **3 ORBITE** (biome `espace` + `uSpace` :
  NOIR COMPLET, soleil éteint, planète ×1,35 sous la route). `cielMusical` coupe `uLvl` ET `uPulse` dans
  `musicTick`. Nuages filtrés dans `mkCloud` (+ une couche en NUAGES). Remplace la « nuit au 3e portail ».
  Bannière `#lvlBan` (niveau 1 : après le logo du départ). Hooks : `dbgNiveau()`, `dbgSaut()`.
- **ROUTE** : `ROAD_HALF` est un `let` posé par `lvlChoisir` : ×1,7 / 1,55 / 1,4 / 1,25 puis plancher ×1,1 de
  `ROAD_HALF0=14` (parc ×1,4). Dos d'âne, tapis et lèvre du tremplin : géométries sur `ROAD_HALF0`, mesh ×scale.x.
- **VILLE = village caché de la pluie, cyberpunk** (`buildVoxCity`, `cityRues`) : tours grises minces
  plafonnées à `CITY_MIN−50` (ne percent jamais la route), tuyaux + antennes DANS l'InstancedMesh des tours,
  étages/enseignes/feux DANS celui des néons, rues néon en texture partagée — toujours 3 draw calls.
  `CITY_BELOW` 660. Pluie : `LineSegments` 1 100 traits (600 mobile), animée en vertex shader, créée à l'init.
- **VERSION TÉLÉPHONE SUR L'ÉCRAN D'ORDI** : `index.html?tel=1` (ou `?mobile=1`, `FORCE_TEL`) — toute la
  fenêtre, chemin téléphone complet ; volant à la souris, clavier branché ; ni gel en paysage, ni plein
  écran forcé ; image 1,0 / 1,5. **PORTRAIT ET PAYSAGE (2026-09-27, user : « je veux un mode horizontal et vertical »)** : plus aucun gel
  quand le téléphone se couche (`#rotNote` et `body.couche` supprimés, manifest en `"orientation": "any"`) ; la caméra suit
  toute seule par `fovFit`/`POR`. ⚠ En paysage, l'écran d'accueil cache la caisse derrière GARAGE/SHOP.
- **CHARTE v2 — LE BOUTON D'ARCADE PIXEL** (dernier bloc CSS, il gagne sur tout) : contour 3 px par QUATRE ombres
  décalées (coins crantés, SANS clip-path — le clip-path rognait l'épaisseur), face deux tons, lèvre claire,
  tranche sombre, ombre au sol ; à l'appui −6 px. Variables par couleur (`--fc/--fc2/--hi/--lo/--ol/--tx/--txs`) :
  or (principal), bleu arcade (défaut), vert, rouge, orange (NITRO), `.off` gris. Panneaux (ce qui se lit) : même
  contour. Réglages et pause = PANNEAUX-LISTES (`.mPanel/.mLigne`, `.tpPanel/.tp.ligne`) avec interrupteur pixel
  `b.bascule` (ON à droite vert, `.off`/`.ko` à gauche gris) et valeur `b.valeur` (or + chevron) — `tpLbl` choisit.
  ⚠ ne JAMAIS remettre `position` dans le tronc commun : #tGear/#tNitro/.tbtn sont en position fixe.
- **UX MOBILE (audit 17 points, 2026-09-24)** : le téléphone ATTERRIT SUR LE MENU (JOUER · CARRIÈRE · GARAGE/MODES/
  RÉGLAGES) ; boutons de la coque et du panneau ⚙ au `click` (au relâcher : défilement possible, annulation par
  glissé) + `uiClic()` (note + vibration) ; `modale()`/`toast()` remplacent prompt/confirm ; REJOUER = `resetGame()`
  direct, placé AVANT la saisie du record ; réglages en 3 sections (`.mSec`), interrupteur SOUDÉ à son curseur
  (`.mGrp`) ; cibles ≥ 44 pt, textes ≥ 8 px ; coque traduite (textes nus enveloppés en `span[data-fr]` au boot) ;
  anneau-fantôme du volant jusqu'au 1er braquage ; fiche du garage repliée à 2 lignes (tap = déplier) ;
  transitions 180 ms (coupées sous Réduire les animations). ⚠ `closeGarage/closeStall` réappliquent le biome.
- **NIVEAU 1 CARRIÈRE** : biome `aurore`, ciel nu (`sansNuages`), piste dessinée à la main `genTuto()`.
- **CARRIÈRE (architecture, détail à faire niveau par niveau)** : `CARRIERE` = 3 biomes × 10 niveaux (NUAGES
  aurore→coucher, VILLE coucher→midi, ESPACE Mercure→Pluton). `carNiveau(b,i)` fabrique un NIVEAU standard
  (heure = biome ou `bioMix(a,b,t)`, planète = `astre` teinte/limbe/échelle via `lvlAstre`), `CARR.actif`
  branche `lvlChoisir`, `CARR_LARG` resserre la route, `SAVE.d.carr[biome]` = niveaux terminés. Bouton
  `#gCarr` (garage) → écran `#carr` (biomes → grille). Les JOUER « sans fin » remettent `CARR.actif=null`.
  Hook : `dbgCarriere()`.
- **CHARTE PIXEL UNIFIÉE** (bloc CSS « LA CHARTE PIXEL UNIFIÉE » en FIN de `<style>`, il gagne sur l'historique) :
  une police (Press Start 2P) partout ; PLAQUE d'arcade `.pbtn` pour ce qui se touche (`.pbCarre` : croix,
  flèches, retour), CADRE (même coupe `--coupe7`, même `--biseau`) pour ce qui se lit ; titres d'écran en or
  dégradé extrudé comme le logo ; ÉTAT dans une pastille `.etat` (or = actif/valeur, gris = coupé).
  **ICÔNES PIXEL** : `PXI_G` (grilles 9×9) → SVG en masque CSS, `pxi('nom')` en JS, `<i class="pxi pxi-nom">`
  en HTML, `var(--pxi-nom)` dans un `::before` ; taille ENTIÈRE via `--pxs` (1/2/3). **Aucun emoji ni glyphe
  système dans l'UI** (la police n'a ni ✕ ◀ ▶ ⚙ ⏸ ★ ✓). `TR()` retire l'accent des CAPITALES (`majPix`) ;
  les clés i18n « symbole + texte » ont un alias sans symbole ; `applyLangDOM` préserve les icônes.
  ⚠ bug corrigé : `filter` sur `.lg.gold` enterrait la face or sous l'extrusion brune (logo terne).
- **Icône app / écran de lancement** : l'emoji 💰 d'Apple (image protégée, risque de rejet) remplacé par le
  mot-symbole pixel CASH CAR (AppIcon toutes tailles sans alpha, Splash 2732, `assets/icons/` pour le web).
- **Résolution adaptative** : la remontée exige < 17,8 ms (et non 14,5 — impossible à 60 Hz, DPR coincé à
  0,42) ; paliers définitifs seulement sur lenteur SOUTENUE, hors reconstruction de zone / retour d'onglet.
  Image RAPIDE / NETTE = 1,0 / 1,5 (téléphone, `?tel=1` et ⚙ desktop). Plancher 0,5.
- **Caméra / conduite** : la caméra de conduite de SACHA en bloc (recul 4,6, suivi dt*5, roulis .035, FOV
  jusqu'à +38/+22) — les équations de conduite étaient identiques, c'est l'habillage qui faisait le « fun ».
  Swing/kick de Léo retirés ; boost de départ automatique (`startBoostT`) désarmé, le logo reste.

## ⚠ FUSION DU 2026-08-30 — LIRE AVANT DE SE FIER À CE DOCUMENT
Le projet avait DEUX `index.html` divergents : celui du dépôt (couche MOBILE : coque d'écrans,
volant analogique, écran nu, bac à sable, réglage d'image) et une copie de travail beaucoup plus
avancée dans `~/Downloads` (gamme de 15 caisses à silhouette unique, paliers de MOTEUR, garage 3D,
i18n FR/EN, fruits, parc freestyle, musique en fichiers, créatures, nouvelle boule de feu).
Les deux ont été fusionnés : le TRONC est la version avancée, la couche mobile a été PORTÉE dessus.
`index.html` du dépôt est désormais la SOURCE UNIQUE (sauvegarde de l'ancienne branche mobile dans
`index.html.bak-branche-mobile-*`).

Ce que la fusion change par rapport à ce que décrit la suite de ce document :
- **24 caisses à l'argent → 15 caisses à CONDITIONS** (`CAR_UNLOCK`, `carUnlocked()`, `carUnlockText()`),
  une SILHOUETTE unique par caisse (`SHAPES`, `spec.shape` déclaré, jamais deviné). `THRESH` n'existe plus.
- **`level` n'est plus une progression** : c'est la caisse CHOISIE au garage (`SAVE.d.equipped`). Ce qui
  monte PENDANT une partie, c'est le **palier de MOTEUR** (`ENGINE_TIERS`, `engTier`, `coinsGot`).
- **Musique** : le synthé procédural `MUS` a laissé place à une playlist de fichiers (`MUSIC`, `musicTick`).
- **Nuages** : le raymarch volumétrique (`VOL`, `mkCloudVol`) a laissé place à des nuages en MAILLAGE
  (`CLOUD_SPH`, `CLOUD_MAT`, `mergeSpheres`). `NO_CLOUDS` n'existe plus — le nouveau système est assez
  léger pour tourner sur téléphone, et les nuages y sont VISIBLES.
- **Ajouts du tronc** non documentés ci-dessous : i18n (`LANG`/`TR`/`applyLangDOM`), fruits (`FRUIT_DEFS`
  + l'étal), parc freestyle (`PARK`), planète, dauphins/serpent, voile de beat, sons de mort.
- **Sections encore à auditer** (elles décrivent l'ancienne branche et n'ont PAS été revérifiées) :
  Économie, Chaîne de figures, Pouvoirs, Announcer, Audio, Survivant, Biomes, Piste.

## Le jeu
Runner arcade 3D dans le ciel (Three.js r128). On conduit sur un ruban de route suspendu,
on saute, vrille, rebondit sur les tranches, traverse des nuages, ramasse pièces et nitro.
Une seule vie. 15 caisses à la SILHOUETTE unique, chacune avec SA condition de déblocage ; on la
CHOISIT au garage avant de partir. La progression d'une partie, c'est le MOTEUR qu'on monte.
Langue : français (bascule EN). Ton du flavour : fun, arrogant, cash, speed-addict, second degré.

## Structure
- `index.html` — TOUT le jeu (HTML + CSS + JS dans un seul fichier, ~11 700 lignes). C'est voulu : ne pas le découper sans demande explicite.
- `assets/audio/announcer/*.mp3` — 9 voix d'annonceur. Le TITRE du fichier = la condition de déclenchement.

## Lancer / tester
- Serveur local : `python -m http.server 8000` (ou `npx serve`) puis http://localhost:8000 — nécessaire pour que les mp3 chargent proprement.
- Vérif syntaxe rapide : extraire le JS entre `<script>` et `</script>` puis `node --check`.
- Déploiement : zipper `index.html` + `assets/` et glisser le zip sur Netlify Drop.
- Pas de build, pas de dépendances, pas de framework. Three.js vient du CDN cloudflare (r128 — NE PAS changer de version sans tester : l'API a bougé après r128).

## Architecture (repères dans index.html)
- **Ciel/décor — VICE CITY NUIT (rose/violet SOMBRE)** : skyDome shader (indigo profond au zénith → violet → grande bande ROSE Miami assombrie → corail → ambre au ras du couchant ; ÉTOILES scintillantes par cellules d'azimut — 64/tour, zéro couture ; LUNE pâle à l'opposé du soleil ; GUIRLANDE néon rose↔cyan sur l'horizon loin du soleil = la ville sous la mer de nuages), soleil « 1.61 » (halo contenu, échelle 940), horizonGlow rosé, RAYS, pigeons. ÉCLAIRAGE NUIT : hemi rose-mauve/indigo `0xba86b6`/`0x18162e` baissé à **.40**, soleil **BRAISE ROUGE-CORAIL `0xff6a3c`** 1.45 (« red hour » : lumière rasante rouge sombre sur le bitume, ombres longues inchangées), fill bleu néon `0x4f74e8` .24 par dessous, kick MAGENTA `0xff3d9e` .20. `POST_EXPO` **0.71** + `brightness .97` : le sol s'éteint pour que les lumières de la caisse y VIVENT. Fog `0x5e3254` (contre-jour corail, nuage rose-lavande). PISTE : bitume NUIT VIOLET `0x2b2937`, spéculaire ROSÉ `0x9a5568` shininess 58, BANDES NÉON ROSE `0xf24aa0` + NAPPE additive `fog:false` qui saigne vers l'intérieur (1 mesh/face, dans `trackMeshes`), ligne centrale sodium doré. **LUMIÈRES DE CAISSE** (toutes à l'init → zéro recompilation) : `headSpot` = SPOT phares (suit le nez via `getWorldDirection`, 1.2, éteint en 'boom') + **`nitroLight`** = PointLight du REFLET NITRO/BOOST derrière l'échappement (repère caisse via `hsF`/`hsU` — marche sous la dalle) : orange `0xff7a24` nitro / bleu `0x5b7dff` réserve bleue / or `0xffb040` pad turbo, intensité lissée + tremblement 43 Hz, pilotée par `nitroOn`/`nitroBlue`/`boost`. Halos phares élargis, NÉON SOUS CAISSE magenta (`userData.noShadow` → exclu du castShadow, sinon carré d'ombre). **ÉCHAPPEMENT v2 (refonte totale)** : (1) **PLUME DE RÉACTEUR** (`JETS`, `jetTex`/`jetGeo`/`jetShellM`/`jetCoreM`/`jetGlowM`) — cône additif par pot (coquille colorée + cœur blanc + halo tuyère), texture dégradée avec ANNEAUX DE CHOC bakés, construit dans buildCar (listes vidées à chaque rebuild), animé chaque frame (`JETS.k` lissé, flicker 57 Hz, long à la nitro) ; (2) **TRAÎNÉE RUBAN** (`mkTrail`/`trailStep`, `trailL`/`trailR`, `TRAIL_N=26`) — 2 rubans additifs à buffers FIXES accrochés aux tuyères (historique de positions, largeur orientée face caméra, fondu au carré de l'âge, couleurs franches orange/bleu/or) avec **FONDU PRÈS CAMÉRA** (<3-7 m → 0 : la caméra de poursuite roule DANS le sillage, sans ça = voile blanc plein écran) et reset d'historique au réveil (pas de trait fantôme) ; (3) **BRAISES fines** — particules d'échappement à vie COURTE (.05-.14 s) et taille plafonnée (les sprites géants qui restaient plantés dans le monde et que la caméra TRAVERSAIT, c'est fini), exSmoke discret. `nitroLight` portée 18 (une flaque, pas une rivière spéculaire) — au REPOS elle passe rouge feux arrière .55 (reflet permanent, la nuit sert à ça), nitro orange 1.6 / réserve bleue 2.1 / pad or .9 ; + **`trailLight`** (PointLight 26) : le reflet de la traînée glisse 9 m derrière, couleur du ruban. **MEUTE ÉQUIPÉE PAREIL** : halos phares/feux (`pcHeadM`/`pcTailM`), plume réacteur bleue (2 cônes `jetGeo`/caisse, `b.mesh.jets`), **7 rubans bleus `botTrails`** (larges ×1.7, sans limite de distance, reset survStart/endGame), **`botJetLight`** (1 PointLight bleue → l'échappement du boosteur le plus proche), cerveau nitro débridé (`appBoost` .45 base, gate .35, durée .7-1.9 s — la ressource régule, zéro triche). envTex indigo→rose sombre→ambre + strips rose/cyan. Nuages VOL : `uSunCol` rose-doré tamisé (1.95,.92,.62), `uSkyCol` violet, `uGroundCol` prune, `uAmb` .46. GRADE : SAT 1.40, VIVID .74, WB magenta (1.02,.985,1.03), ombres bleu-violet, hautes lumières or rosé, bloom .58/.52 seuil .92, vignette pourpre .52.
- **Nuages VOLUMÉTRIQUES — ACTIFS, LISSES & CRÉMEUX** (`VOL`, `mkCloudVol`, `mkCloud`, `buildClouds`, `updateClouds`). Historique 2026-07-16 : deux aller-retours. (1) Le raymarch DÉGRADÉ (18-24 pas + DPR bas) tramait en « boules damier » ; (2) la bascule tout-sprites a été REJETÉE encore plus fort (« retour 20 prompts en arrière ») — le user veut du PHYSIQUE traversable ET lisse. Leçon : **réparer la version dégradée, jamais changer de système**. Verdict final : la forme vient des MÉTABALLES (lisses), le bruit ne fait QU'adoucir le bord. Réglages « lisse » : `uCoverage .85, uDetail .04` (fin du carving cellulaire = fin du quadrillage), `uFreq 1/120` base ET par-nuage (grosses ondulations douces, jamais de grain fin ; `fMul=min(1,300/r)` garde les lobes proportionnels à la taille), **dither ×.18** (c'est lui, magnifié par le DPR bas, qui dessinait le quadrillage diagonal), `uEdge .34, uSigma .55, uDensity 2.9, uAbsorb 1.5, uAmb .56`, ventres `uGroundCol (.13,.08,.18)`. **Planchers de pas** LOW 32/4, MED 42/5, mobile 32, desktop 56/7 (grain ∝ 1/pas — nuages peu nombreux + pas plafonnés `slMax=|vRadius|*.05`, ça se paie). **ANTI-GRAIN (2026-07-18)** : alpha au point JITTÉ (stratifié, zéro anneau) mais ÉCLAIRAGE au point quasi stable (micro-jitter 30 % du pas) — l'alpha sature en 1 pas sur un nuage épais, donc lum plein-jitter = sable, lum figée = bandes ; grain ANIMÉ par frame (statique = saleté collée) ; bascule matB en marge ABSOLUE ~9 m (en ×1.45 un titan passait sans z-test à 1,7 km → nuage visible À TRAVERS la route). **Fondu de bord `rim=1-smoothstep(.88,1,‖impact‖)`** (.78 = boules, .93 = pointillé sur les petits). Se juge TOUJOURS au pire cas `dbgCloud(26,4)` : lisse là = lisse partout. Chaque nuage = une BOÎTE englobante (`VOL.geo` cube ±1, `r/ry/r`) avec un `ShaderMaterial` GLSL3 (`VOL.matF`/`matB`, WebGL2 requis) : rayon dans l'ELLIPSOÏDE, champ de densité 3D, MARCHE VERS LE SOLEIL (`lightMarch`, loi de Beer) → cœurs OPAQUES, ventres ombrés, coiffes dorées, on VOLE DEDANS. Densité = ellipsoïde PLEIN moins le bruit ; bruit = texture 3D 64³ Perlin-Worley bakée une fois. Blending PRÉMULTIPLIÉ (`OneFactor`/`OneMinusSrcAlpha`), `depthWrite:false` ; `matF` depthTest:true, **`matB` SANS depthTest** (caméra dans la boîte : sinon le z-test découpe le volume en TROUS polygonaux — LE bug de proximité). **RAMPE DE PAS** : pas serrés à l'entrée (×.55→1.6), longs au fond (alpha sur la longueur RÉELLE `sl`). **Bascule FRONT/BACK selon la CAMÉRA** (updateClouds) : dans la boîte → BackSide ; dehors → FrontSide. Fog dans le shader (`uFogAmt`, `noFog`→0). Repli `mkCloudSprite` si pas de WebGL2 (silhouette peinte : peu de sprites, très gros, opaques). DONNÉES nuage et physique/gameplay/son INCHANGÉES. Familles GAMEPLAY (couloir de la piste) : bancs SUR la route (murs, plus rares), nuages de VOL en **CHAMPS de 2-3** échelonnés (coussin d'air + airtime `c.refT`), TOURS GÉANTES (`giant`), MER/ouate/VOILES (`sea` dMul .7, `deco`, `veil` dMul .4). **CIEL ORGANISÉ — une MÉTÉO, pas un semis** (après ces familles → zéro décalage RNG ; espace MONDE, `roadY≈37` ; ⚠ JAMAIS `B[i]`/`Nn[i]` : binormale verticale sur piste loopée = nuages éjectés SOUS le monde) : VENT unique (`wA`) oriente rues et massifs, `pickAz` garde le COULOIR DU COUCHANT dégagé (azimut >0.62 rad du soleil). 6 couches PEU & GROS : (1) **RUES DE NUAGES** — 7 chaînes de 2-3 cumulus sous le vent, sur le MÊME plafond (`o.baseY`→`center.y=baseY+ry*0.64`, `deckY≈roadY−58`), (2) électrons libres, (3) banc haut, (4) OCÉAN d'undercast PLAT (y −245±38), (5) **MASSIFS** — 3 fronts de 2 tours épaule contre épaule (`pickAz`), (6) **TITANS** (`titan:true` r 700-1200, `dMul .8`, `stepMul .55`) : 3 par `pickAz` + **LE COLOSSE** aux 2/3 du run à l'OPPOSÉ du soleil. Tours `cross` PLAFONNÉES à r 190. `buildClouds` : UN SEUL `rr()` puis mulberry32 propre. `cloudInS` pilote voile `#cloudFx`, fog, sons feutrés, `sparkGold`. **PALIERS PERF (applyPerfTier, UN SEUL chemin)** : défauts desktop **46/6** (56/7 était un luxe), MED (<54 fps soutenus OU **détecteur d'À-COUPS** `loop._spk` : ~10 frames >26 ms sur 2-3 s — l'EMA lissait les pics des titans plein écran) → `36/4` + ombres 1024 ; LOW (<45 fps après 12 s) → `26/4` + bloom off + BasicShadowMap. ⚠ `uSteps` ÉCRASÉ à chaque draw par `onBeforeRender` (`VOL.stepBase×stepMul`) : les tiers écrivent **`VOL.stepBase`**. Budget de base allégé (2026-07-17) : DPR cap desktop **1.5** (Retina : −26 % de pixels, invisible sous bloom+grain), **MSAA réservé aux écrans 1×** (`devicePixelRatio<1.5` — le resolve coûtait cher pour rien sur Retina), ombres 1536→**1280**, bloom desktop .62→**.55**. Hooks console : `dbgCloud(steps,lightSteps)` et **`dbgPerf()`** (ms/fps/spikes/dpr/tier — à demander au joueur pour tout rapport de fluidité). DPR adaptatif : gros cran >24 ms, petit >19 ms, remontée <14,5 ms. Étalonnage : `body>canvas{filter}` + `#vig`.
- **GARAGE — L'ATELIER low-poly** (`GAR`, `buildGarageRoom`, `garageRender`, `openGarage`/`closeGarage`) :
  la vitrine n'est plus une caisse posée sur une nappe de brume à 1500 m, c'est un vrai atelier — établi
  garni, panneau perforé d'outils, servante, compresseur, palan, pont élévateur, rack, distributeur,
  piles de pneus, néon « CASH CAR » qui respire, six tubes au plafond dont UN qui grésille, poussière en
  suspension, et la PORTE RELEVÉE sur la nuit d'où **la route part directement** (liseré néon rose +
  pointillés sodium, fondu baké dans la texture — pas de barrière, pas de parvis clos : franchir le
  seuil, c'est déjà être sur la ligne de départ). La caisse tourne sur un plateau cerclé de cyan, la
  caméra fait ses 360° DEDANS. Bâti UNE FOIS à la première visite, en SIX géométries unité mises à
  l'échelle + ~15 matériaux plats ; caché à la fermeture. **⚠ TROIS RÈGLES GRAVÉES** : (1) *placement* —
  l'orbite est bornée à 7,8 m, donc **rien de haut ne se pose à moins de 8,3 m du centre** (sinon la
  caméra traverse l'objet en tournant) ; tout ce qui reste **sous 50 cm** est autorisé dans le couloir
  (la caméra vole à 1 m minimum), et c'est là que vit le bazar au sol. (2) *lumière* — **aucune
  PointLight n'est ajoutée à la scène** : on recycle `stallKey`/`stallRim` (celles de l'étal), qui
  suivent la caméra façon studio ; une lumière de plus se paierait sur TOUTES les frames du jeu, course
  comprise — et `stallRender` doit reposer leur teinte et leur portée. (3) *cônes de lumière en
  `FrontSide`, jamais `DoubleSide`* : la caméra ENTRE dedans en tournant, et en double face on se
  retrouvait derrière un voile blanc plein écran. Dosage : à 2,9 + 1,9 d'intensité tout partait en
  pastel délavé — un atelier, c'est deux lampes et beaucoup d'ombre. Cadrage portrait : `fov 52×FOV_K`,
  distance `×(1+POR·.34)`, visée abaissée de `POR·.40`.
- **BIOMES — le monde voyage** (`BIOMES`, `BIO`, `bioGo/bioStep/bioApply`, `paintEnv`) : 5 ambiances complètes par zone, LERPÉES ~4 s au portail (uniforms/couleurs UNIQUEMENT, zéro recompilation) — `braise` (l'identité Vice City, valeurs d'init copiées à l'identique), `aube` (pastel laiteux), `orage` (violet éteint), `minuit` (bleu-noir, étoiles ×1.8, lune reine, nuages ARGENT lunaire), `neon` (magenta/cyan à bloc, sat 1.62). Choix par ARCHÉTYPE de zone (`zoneArch` posé par genCtrl SANS consommer de rnd) : FLOW→braise · TECH→neon · ALPIN→aube · VOLTIGE→minuit · GRAND8→orage ; zone 0 toujours braise. Chaque biome pilote : GRADE DU CIEL (uniforms `uSkyMul/uSkyLift/uSunTint/uSunHalo/uCity/uStars/uMoon` injectés dans le shader skyDome — identité neutre par défaut = rendu d'origine au pixel), fog (`FOG_N/FOG_F` devenus `let`, RGB de `FOG_BASE` muté), les 4 lumières (hemi/sun/fill/kick — hemi désormais NOMMÉE), uniforms nuages VOL (`uSunCol/uSkyCol/uGroundCol/uAmb`), `POST_EXPO` (let, relu chaque frame par le contre-jour) + `uSat` ACES, sprites soleil « 1.61 »/horizonGlow/RAYS (opacité ×sunHalo — à minuit le soleil devient fantôme), et `envTex` REPEINT via `paintEnv` (canvases gardés dans `envCvs`). `bioStep(dt)` tourne en tête de loop (hors gate de sim : le ciel vit même au menu). Hook console : `dbgBio('minuit',durée)`. ⚠ bioApply est la SEULE écriture de sun/hemi/fill/kick/uSat — ne pas ajouter d'autre écrivain sans passer par les biomes.
- **Piste** (`genCtrl`, `buildTrack`, `frameAt`) : Catmull-Rom + repères T/N/B. Deux faces roulables (`side` ±1). **ADN DE PISTE (genCtrl v2)** : chaque zone tire un ARCHÉTYPE (`AR` : FLOW sweepers / TECH épingles-chicanes / ALPIN crêtes-plongeons / VOLTIGE loops-hélices / GRAND8 mixte) = poids des 10 motifs (dont chicane rapide et spirale géante) + LATÉRALITÉ (`hand`/`sgn()` : piste qui spirale à gauche, à droite ou équilibrée) + humeur verticale `vt` + SIGNATURE DE FIN par archétype (double loop, triple chicane, méga-plongeon…). **NIVEAU → PRATICABLE** : `LV=1+min(2.6,level*.13)` élargit TOUS les rayons (`RS=AR.rs*LV`), évase les épingles (`180/√(LV·.7)`), allonge départ/respirations/droites et la zone (`LEN=7200×(1+min(1.1,level*.07))`) ; gros motifs plafonnés en longueur d'arc (~58000/R) pour ne pas manger la zone ; loops en douceur (`LOOPS=1+(LV-1)*.35`). **ACCENT DE ZONE** : `accC` tiré parmi 6 néons (rose/cyan/ambre/menthe/violet/corail) teinte bandes + nappe — chaque portail change la couleur de la nuit. ATTENTION : `rnd` (mulberry32 seedé) est consommé séquentiellement dans buildTrack — insérer/retirer des appels `rnd()` change toute la génération en aval.
- **Voiture** (`CARS`, `buildCar`) : 24 specs, meshes procéduraux. **GABARITS v2 (silhouettes par archétype)** : `carProfile(pts,w)` extrude un PROFIL 2D (z=longueur, y=hauteur) sur la largeur — silhouette choisie par niveau (surchargable par caisse via `spec.shape`) : `boxy` (0-3, l'ancienne construction en boîtes + épave), `gt` (4,6,7,9 — coin plongeant + verrière profilée), `muscle` (5,8 — long capot, hanches, scoop), `formula` (10 — fuselage étroit roues DEHORS, aileron biplan, pontons), `proto` (11-13 — coin furtif + bulle de verre + dérive), `rocket` (14-23 — fuselage missile, ailerons en croix, canards, carénages de roues, variations par `vr=lvl-14`, anneau doré pour DIEU-VITESSE). ⚠ ANCRES à ne pas déplacer : pots/plumes JETS à `±spec.w*.22, y .43, -l/2-.14` (les TRAÎNÉES rubans et `nitroLight` y sont accrochées en dur via `hsF/hsU/hsR`) ; phares/feux/halos paramétrés par gabarit (`hlX/hlY/hlZ`/`tlX/tlY/tlZ`). Hooks console : `dbgCar(i)` (prévisualiser une caisse, visuel pur) et `dbgView(a,d,h)` (MODE PHOTO : force la pause, cadre la caisse, re-rend une frame). **LA CAISSE ÉCLAIRE LA ROUTE (`CARPOOL`)** : 3 plans additifs au sol recréés par buildCar (même recette que le néon sous caisse) — `head` flaque de phares chaude devant (l'épave n'a qu'un œil : op .14), `tail` rouge feux derrière (chauffe au frein via `keys.ArrowDown`), `jet` halo de nitro/traînée (opacité=`JETS.k*.5`, couleur copiée de `jetShellM` → suit l'état orange/bleu/or) ; tout s'éteint en 'boom'. PointLights renforcées : headSpot 1.85, nitroLight repos .8 (reflet rouge permanent), trailLight portée 34 ×1.7. **MEUTE : MÊME KIT** (`pool9` dans mkPolice : flaque phares blanc-bleu + rouge AR + `jetPool` bleu par bot, opacité pilotée par sa poussée dans survRender). **PARTICULES D'ÉCHAPPEMENT v3** : texture `sparkTex` (cœur brûlant, chute d'alpha rapide — le disque mou `puffTex` gonflé au bloom faisait des BALLONS blancs), tailles ÷2 (flames cap .62, core .34), flux serré haute vitesse (spread ~.6-.9, vitesse arrière 22-28) — un JET de feu, pas des boules. **v3.1** : `poolTex` (flaque radiale à extinction FRANCHE — lampTex saturait les nappes additives en PAVÉ visible) pour néon/flaques joueur+police ; `beamTex` = DEUX faisceaux de phares peints (bord haut du canvas = pare-chocs, blanc neutre teinté par matériau : chaud joueur / blanc-bleu police) sur les plans `head` ; fumée de gomme UNIQUEMENT en glisse (`drf9` = même zone morte |psi|>.32 que le crissement, teinte mauve-nuit .28) — la poussière permanente derrière les roues a sauté ; blob de contact face dessus .5→.30 et `shadow` .10 en drive (ils creusaient un donut dans les flaques). Hook `dbgScene()` (carGroup/scene/ombres) pour disséquer au debug. ⚠ En PAUSE photo, les particules restent FIGÉES à l'écran (la gerbe du drop d'intro dessine un faux « anneau » sous la caisse — artefact de pause, pas un bug). Chaque caisse porte `desc` (punchline de déblocage) affichée par la CARTE DE DÉBLOCAGE (`carCardShow`, `#carCard` : nom + km/h + niveau + desc, 5,2 s). Indices codés en dur alignés sur 24 : `level<23` (checkUpgrade), `min(level,23)` (denom/bestCar), `min(level,22)`/`level>=23` (jauge), `level<19` (earlyDead = mort avant le top 5).
- **Modes** : `mode` = 'drive' | 'fall' | 'boom'. Physique conduite dans la boucle, vol dans le bloc 'fall', `tryLand(dt)` gère atterrissage, BUMPS (rebond tranche) et SNAKE LOOP. **`AIR_RATE` DYNAMIQUE (let, posé par startFall)** : `clamp(.95+kmhAffichés/420*.55, 1, 2.3)` figé au décollage — vol au tempo du roulage quand on roule doucement, vol qui claque en endgame (l'ancien 1.6 fixe rendait le vol trop rapide au début et MOU à 1500 km/h). Dans le bloc 'fall' un `dtF=dt*AIR_RATE` remplace `dt` pour TOUTES les intégrations de vol (gravité `FALL_G`, position, `fallT`/`nitroAirT`, lacet/vrille, poussée nitro, compteurs dauphin/rase/limbo/mains, surf de nuage). La parabole DANS L'ESPACE est identique (viseur d'atterrissage + seuils de figures + paiements INCHANGÉS car `fallT` suit le temps-sim), mais on flotte moins longtemps. **JAUGE D'AIRTIME EN TEMPS RÉEL (`fallTR`)** : le camembert des 6 s (`#airPie`) et l'explosion comptent sur `fallTR+=dt` (secondes VÉCUES — sinon le chrono filait à ×1,6) ; `fallT` (temps-sim) reste la référence des figures/paiements ; les remboursements sont miroités (nuage `rf/AIR_RATE`, bump demi-jauge, `pwrAirT` reset les deux). ⚠ `tryLand` DOIT recevoir `dtF` (pas `dt`) sinon le balayage anti-tunnel couvre une distance trop courte → traversée de dalle à grande vitesse. Collisions BALAYÉES anti-tunnel : `prevH/prevL` (position de la frame d'avant dans le repère de la dalle) rattrapent dessus/dessous/paroi percés en une frame à grande vitesse. **PLONGEON FATAL v2 (`trackMinY`)** : la mort en vol = passer sous le point le plus BAS de toute la piste −120 m (`trackMinY`, calculé dans buildTrack) — l'ancienne référence `lastNearY-200` (route la plus proche en 3D) tuait injustement en plein plongeon légitime de crête ALPIN (elle référençait la crête au-dessus). `lastNearY` reste pour le télégraphe d'atterrissage. **`SPD=0.25`** (÷2 le 2026-07-16, « trop rapide ») : SPD scale TOUT — avance joueur/bots, position de chute, viseur ET compteur affiché ; c'est LE bouton de vitesse globale. Le viseur d'atterrissage intègre comme la vraie chute (pas de position ×SPD). Hooks debug : `dbgState()` (état interne lecture seule), `window.__loopErr` (dernière exception avalée par le try/catch de loop), capteur `addEventListener('error')` → `document.title='ERR:…'` (les erreurs d'init échappent aux consoles headless).
- **Announcer** (`ANN_LIB`, `annSpeak`, `annRoll`) : chaque condition déclenche sa voix EXACTEMENT 1 fois sur 3 (paquets de 3, place aléatoire). TOUTES les clés ont `first:1` : la voix se présente à sa 1re occurrence, ensuite elle se mérite. Couches : voix (`ANN_VOICE_VOL=.58`) + doublure démon pitchée (.26) + 2 échos dorés (161,8/323,6 ms). Ne jamais laisser un fichier manquant planter le jeu (`e.dead`).
- **Économie — REBASÉE ×2,5 (2026-07-17, « montants trop énormes »)** : `DENOMS` (valeur des pièces ×~2,5 par niveau, 24 entrées de 10 à 15e9 — fini les 1e25), `THRESH` (23 paliers cumulés ≈ `5×denom×effort` avec la MÊME courbe d'effort 8→630 équiv. pièces : la difficulté ressentie est inchangée, seuls les zéros ont dégonflé ; DIEU-VITESSE ≈ 19 billions cumulés). ⚠ tout revenu est relatif à `denom` → l'échelle suit seule ; la pluie de billets est calée dessus (`nextRainAt=4e3`, `×2.6`) ; les VIEUX records localStorage sont sur l'ancienne échelle (inatteignables — proposer un reset au user). `UNITS` monte jusqu'aux QUINTILLIONS (1e30). **Flavour pools** (`pickL` + `GO_LINES`/`ZONE_LINES`/`RAIN_LINES`/`CRASH_LINES` (fonctions montant→phrase)/`END_LINES`/`END_TOP`) : départ, portail, pluie de billets, chaîne perdue, punchline de fin de run (dans `tagline` sous GAME OVER, variante record). Revenus : pièces (combo x5 max), CHAÎNE de figures (voir ci-dessous), portail (`denom*40` + nitro pleine), tirelire (`denom*8`). Fever = tout ×2 pendant 10 s. **Unités compactes** (`fmtC`, `UNITS`) : tous les messages d'événement (verdict, mallette, tirelire, portail, « pièces de », prochaine voiture) affichent « $ 1,4 M » — échelle longue française k/M/Md/Bn/Bd/T ; le compteur GTA 8 chiffres (`fmtGta`) et les records gardent le nombre plein. Première traversée d'un ordre de grandeur = célébration « 💸 TU COMPTES EN MILLIONS » (`unitSeen`, une fois par SESSION, jamais reset).
- **Chaîne de figures** (`addTrick`, `chainVal/chainMult`, `#chainHud`) : chaque exploit aérien se NOMME à l'instant où il naît (pop `trickMsg` + carillon `trickPop` qui monte d'un demi-ton par maillon) et gonfle la chaîne — RIEN n'est payé en vol, tout se cashe à l'ATTERRISSAGE : `gain = denom*(5*fallT + chainVal)*chainMult(≤6)*grade*(face cachée ×2)*série*fever`. Grade de réception : PARFAIT ×1.5 (impact<4.5), normal, POSÉ LOURD ×0.65 (impact≥10) — pendant le BRAQUAGE tout monte d'un cran (PARFAIT→DIVIN ×2, normal→PARFAIT, lourd→normal). **BRAQUAGE** (`feverArmed`, `heistFire`) : à `styleM`≥100 la jauge S'ARME (clignote rose `.armed`, fuit à −2/s, retombée à 0 = désarmée) — DOUBLE-TAP ESPACE <280 ms (`lastSpaceT`, garde `e.repeat`) déclenche le fever ×2 de 10 s ; chaque figure pendant le braquage PROLONGE de +0,8 s (plafond 18 s, largeur de jauge clampée). **ROLLOVER** (`rollover`) : une pose PARFAIT/DIVIN reporte 10 % de `chainVal` comme mise de départ du vol suivant (pop « REPORT +X » dans `startFall`, consommé une fois) — reset avec `feverArmed` dans `resetGame`. Bonus posés : PILE AU CENTRE (|lat|<30 % demi-route), À RECULONS (vA<-3). Si on EXPLOSE : « CHAÎNE PERDUE » — tout s'envole (bank-or-bust). La redite paye 60 % de la précédente (`chainSeen`), sauf échelles `raw` (vrilles, bumps). Figures en vol : vrilles par demi-tour de lacet (180°/360/540…), BIG AIR (2,3 s), AIR MONSTRE (4,4 s), PLEIN CIEL (+26 m au-dessus du départ), MÉTÉORE (nitro 1,2 s en l'air), SANS LES MAINS (2,1 s sans volant), PERCE-NUAGE (entrer dans un banc), RASE-MOTTES (frôler le dessus de la dalle ≥0,55 s, via radar `curNear/curHOff/curLatOff` rempli par `tryLand`), LIMBO (passer sous la dalle ≥0,35 s), LE DAUPHIN (nager au ras de la dalle, bande 0,9-7 m : `chainVal` accrue en continu au CARRÉ de la proximité via `dolphT`, pop à 0,4 s, DAUPHIN ROYAL à 2,4 s cumulées, écume `sparkGold` sous la caisse quand on frôle ; pendant l'accumulation le HUD de chaîne affiche EN CONTINU « 🐬 LE DAUPHIN +X » via `dolphGain` — on sait POURQUOI ça monte), BUMPS (tranche de dalle, échelle 8+3n, demi-jauge d'airtime rendue). Détection dans le bloc 'fall' de `loop` + entrée nuage dans `updateClouds`. Reset de la chaîne dans `startFall`, verdicts announcer par seuils `gain/denom` (m2≥45, m3≥140) + overrides meteor/snakeLoop/megaMeteor inchangés. **LA MALLETTE** (`#caseHud`, `chainEst()`) : la valeur en jeu s'affiche EN DIRECT sous le HUD de chaîne (💰 + montant, police qui gonfle avec le magot) ; au-delà de `denom*20` elle passe `.hot` (or, tremblement CSS `caseTremble`) + battement de cœur (`heartBeat`, toum-toum sinus 58→38 Hz, cadence 0,86 s). À l'explosion EN VOL : « CHAÎNE PERDUE — $X ENVOLÉS ! » + gerbe `sparkGold` (garde `mode==='fall'` : une explosion au sol après encaissement ne perd rien) — SAUF la 1re fois : **L'ASSURANCE** (`insUsed`, reset dans `resetGame`) sauve 30 % de la mallette (« 🛡 ASSURANCE — $X sauvés sur $Y (une seule fois par run !) », `checkUpgrade` + `flyCash`) — le filet qui enseigne le bank-or-bust aux débutants sans coûter aux experts. Masquée à l'atterrissage/explosion/reset. **L'ÉCHELLE** (`LADDER`, `ladderI`) : chaque palier de multiplicateur franchi se crie (×2 CHAUD ! · ×3 EN FEU ! · ×4.5 MILLIONNAIRE · ×6 JACKPOT MAX) avec carillon qui monte — reset dans `startFall`. **HIT-STOP** (`hitT`) : 80 ms de gel (`dt×.04`, à côté du slow-mo dans `loop`) déclenché sur le grade PARFAIT. **BILLETS VOLANTS** (`flyCash`, CSS `.bill`) : des `$` DOM volent de la position monde (projetée caméra) vers le compteur `elMoney` — branchés sur verdict d'atterrissage, tirelire, portail. **VISEUR GRADÉ** : `landMark` se colore selon l'impact PRÉDIT (`tmp3·Nn` dans l'intégration du viseur) — or <4.5 (pulse), blanc, rouge ≥10 ; même unité que le verdict.
- **Symétrie des faces — MIROIR STRICT (zéro dessus-dessous)** : pièces/nitros, pouvoirs, flaques et groupes de plots existent SUR LES DEUX FACES aux mêmes positions (`for(const face of [1,-1])`), intervalles DOUBLÉS → densité et économie PAR FACE identiques à l'ancienne alternance. Dos d'âne : mesh jumeau dessous + physique `hopY` sur les deux faces (F.n est déjà retournée quand `side<0`, le check `side>0` a sauté). Ligne centrale sodium sur les deux faces. Les deux faces de la dalle sont à pleine lumière (`dim=1`). Chaque obstacle porte `face` — les collisions testent `face===side`.
- **Fin de partie (niveau 6+)** : OVERDRIVE `late=1+min(.5,(level-5)*.08)` sur `maxSp`/`accel` (+8 %/niveau, plafond +50 %) ; 2e vague de plots + UNE ÉPAVE entre chaque palier de pads (`WRECKS`, `mkWreck`, matériaux/géométries partagés jamais disposés) — flux aléatoire DÉRIVÉ (`seed^0xCA55E77E`) : la densité dépend du niveau sans rebrasser la génération. Percuter une épave : −50 % de vitesse, gros feedback ; au-delà de 330 km/h : `explode()`.
- **Mode SURVIVANT v3 — la POURSUITE À ARMES ÉGALES** (`SURV`, `survStart/survTick/survRender/botBoom`, `#survHud`/`#lastAlert`, bouton `#survBtn`) : 7 voitures de POLICE incarnées sur la piste (`mkPolice`, 3 livrées, géométries/matériaux partagés + roues d'épave réutilisées). Classement = DISTANCE (`SURV.pBase+s` pour le joueur ; au portail `SURV.pBase+=s` → les écarts traversent les zones, téléportation invisible). **ZÉRO TRICHE — même moteur que le joueur** : chaque bot intègre les équations EXACTES du joueur (accél/traînée/MOMENTUM `b.momT`, pente `GRAV·T[bi].y`, nitro-RESSOURCE `b.nitroR` regen .2/s + poussée 30/s, volant complet `phi/steer/sHold` avec plafond `TURN_HS` et rétroaction de courbure comme `psi`, avance `v·cos(phi)·SPD`) et subit les MÊMES obstacles : plots (qu'il fait VALSER via `FLYCONES` — visible devant toi), épaves (−50 %, MUR >330 km/h → `botBoom`, `w9.hit` reste posé pour le joueur), flaques (`b.slipT`), pads turbo (`b.padB`). Plus d'élastique, plus d'aspiration, plus de garde-fou, plus de rush artificiel, plus de bonus de vitesse. **Le CERVEAU fait la différence** (`SURV_PILOTS` : agro/err/rea/line) : tick de décision à RETARD HUMAIN (`rea` 100-300 ms — toutes les décisions tombent au tick, entre deux il roule sur les précédentes), perception BORNÉE (75 m devant, 25 m derrière, écarts estimés ±10 %, obstacles vus seulement devant), POINT DE CORDE par waypoints (3 échantillons de courbure sur la vraie distance de freinage, `vSafe` résout κ·v·SPD = plafond de braquage, marge `b.marg` bruitée à chaque tick), ligne de corde selon `line`, fautes VISIBLES (`errK` : 0 = coup de frein injustifié, 1 = embardée sinusoïdale, 2 = corde ratée → part large), DÉBOÎTEMENT (<14 m) / DÉFENSE (<9 m) au tick. SORTIE DE ROUTE = même sanction : décollage (vy 6), retombée hors piste = `botBoom` — le vide ne pardonne à personne. **VOL des bots** : état aérien complet (`air/airH/vy/spin/spinV`, gravité 26, gerbe `sparkGold` à la retombée, vrille `rotateZ`, cap réel `rotateY(b.phi)` — on VOIT les braquages) — décollage UNIQUEMENT sur les ZONES DE SAUT du joueur (`SURV.jumpZones`, gravées à chaque passage drive→fall, osées selon `appJump` à <8 m via `zoneMark`) : s'il n'y a pas de tremplin prouvé, personne ne s'envole. **NITRO VISIBLE** : sprite réacteur `jet` + braises `flameCore` (LOD <130 m) — la flamme suit la VRAIE combustion (`b.boostT`=flag), allumée au tick sur du droit dégagé selon `appBoost`. **DRIVATAR** (`AIP`) : profil persistant `SAVE.d.ai` (air/boost/caution/skill/aggr/airDur/runs, désinfecté dans `san()`) — `AIP.tick(dt)` observe CHAQUE frame (même hors Survivant), `resetRun()` dans `resetGame`, `commit()` dans `endGame` (adoption totale 1re run, EMA .35 ensuite) ; `survStart` biaise le CERVEAU seulement : `line×(.72+skill×.3)`, `marg` (caution), appJump, appBoost. LOD : sim complète permanente (~7 bots, coût négligeable), mesh+gyros seulement à |Δs|<340, halo sprites additifs qui s'éteignent au loin, POOL de 2 PointLights (les 2 plus proches <170 m éclairent vraiment route+caisse — jamais de recompilation shader, lights toujours en scène), sirène UNIQUE en WAIL doux (`sirenInit` : sine + LFO glissando ±115 Hz à 0.27 Hz + vibrato 5.3 Hz, lowpass 880, volume ≤.032 dosé sur la poursuivante la plus proche DERRIÈRE — plus jamais de deux-tons `setValueAtTime`). Rampes : matériaux on/off swappés par phase (`SURV.ph`), chaque unité bat sur SA phase. Minimap : points rouge/bleu temps réel dans `drawMinimap`. Minuteur PIXEL-ART : canvas 20×20 upscalé `image-rendering:pixelated` (`svClockDraw`, anneau qui se vide vert→orange→rouge, aiguille fluide, secondes dessous), dessiné chaque frame. DERNIER = CONDAMNÉ : `SURV.last` → `#lastAlert` clignote (« EXPLOSION DANS : 00:XX ») + `carLight` rouge 18 Hz ; au couperet → flash + gerbes + `explode()`. Bot dernier → `botBoom` (gerbe or+bleu + champignon + son si <220 m), les survivants gagnent en TÉMÉRITÉ (agro/appBoost/marg — jamais en vitesse). Tous morts = CHAMPION (jauge offerte). `endGame` coupe sirène/lumières/alerte et fige le classement. `survStart()` APRÈS `newTrack()` dans `resetGame` (sinon meute sur position périmée).
- **Pouvoirs** (`PWR_DEFS`, `mkPower`, `pwrNitroT/pwrAirT/pwrSpdT`) : orbes rares sur la piste (spawn dans `spawnPickups`, ~1 tous les 430-810 m). `n` = NITRO INFINIE 6 s (jauge pleine, zéro drain), `a` = AIRTIME INFINI 10 s (pas d'explosion à 6 s, camembert cyan, jauge neuve à l'expiration), `v` = SPEED UP +60 % 6 s (multiplie l'avance `s/lat` et le compteur, pas `vA`). Chaque orbe porte une ÉTIQUETTE flottante (sprite canvas : pictogramme 🔥/🪂/⚡ + nom, matériau partagé `d.icoM`, côté joueur même sous la route) — on sait ce qu'on vise avant de le prendre. Ramassage : `showMsg` coloré + `trickMsg` doré. Compte à rebours emoji dans `#pwrChip`, reset dans `resetGame`.
- **Sensation de vitesse — RELATIVE à la caisse (`vmaxShow()`)** : vibration caméra dès ~45 % de la vmax de LA caisse (`spdN` relatif, `CAM_SHAKE_V=.78`) MAIS **plané supersonique** : `calm9` fond les vibrations à 30 % passé 350-900 km/h affichés (l'endgame FEND l'air, il ne tremble plus) ; speed lines dès ~55 % vmax (`drawSpeedLines`) ; FOV mixte (part relative ×17° + part absolue ×.030) — même LA HONTE à fond a sa sensation. Sifflement d'air (`whF/whG`, >280 km/h), compteur qui gonfle/rougit — **compteur VERT GTA V** (dégradé menthe→vert billet, `.dz` vert éteint).
- **MUSIQUE — synthwave procédurale** (`MUS`, `musInit/musTick/musStep/musVoice/musKick/musHat`, appelée en fin d'`initAudio`) : le jeu n'avait AUCUNE musique (c'était le chantier n°1). Zéro fichier, tout est calculé — boucle mineure de 4 accords (Am · F · C · G, `MUS_CH`/`MUS_ROOT`), basse à croches **side-chainée sur un kick FANTÔME** (on ne l'entend presque pas, on entend ce qu'il ÉCRASE : c'est ce mouvement qui fait respirer le morceau), nappe tenue, arpège qui se lève avec la vitesse, charley en croisière, lead réservé à la gloire (nitro/vol/braquage). **Ordonnancement à REGARD D'AVANCE** (~280 ms, `setInterval` 60 ms) : aucune note n'est posée depuis la boucle de rendu, donc une frame qui tousse ne fait pas bégayer la mesure ; garde anti-rattrapage quand l'onglet a dormi. L'INTENSITÉ (`MUS.i`, lissée) écoute la partie : menu = nappe seule · roulage = groove · vol/nitro/fever = filtre grand ouvert. Bus dédié → `MASTER`, volume max ~.12, interrupteur MUSIQUE séparé du SON (`SAVE.d.mus`). Hook : `dbgSnd()`.
- **Audio** : tout en WebAudio procédural sauf les voix (HTMLAudio). `initAudio()` exige un geste utilisateur. Tout passe par le bus `MASTER` (compresseur + limiteur tanh) — ne JAMAIS reconnecter à `AC.destination`. `duckT=…` creuse brièvement le mix (gros événements). Boutons `#sndBtn` (SON : `AC.suspend()/resume()`) et `#voxBtn` (VOIX : gate dans `annSpeak`), persistés `rrSfx5`/`rrVox5`. **Moteur v2** (`ENGINES`) : un timbre par caisse (onde harmonique + sub + souffle → saturation → filtre), fréquence = explosion (`i`+`engRpm`×`r`), boîte virtuelle (`gr` rapports, thump au passage), RONRON au ralenti (`lope`, LFO 8-15 Hz), crépitements au lâcher (`crk`, fn `crackle`), sifflement onduleur/turbine (`whine`) pour les 3 caisses du haut. Changer une caisse de son = éditer sa ligne `ENGINES`, zéro code. Crissement = stick-slip (2 bandes + LFO `skLfo`, zone morte |psi|>.32). Nitro façon fusée RL : le CORPS = rumble de bruit BROWN (`brownBuf`, boucle sans couture) sous double lowpass (`jrF`) + flutter 5 Hz (`jrDep`) — rond et chaud, dominant EN L'AIR. Pétillement = pops BRUNS (`flamePop`, ~25/s au sol) + POK (plop+subBoom) — des pops blancs trop denses fusionnent en tapis de souffle. Zéro couche de bruit blanc continue pendant la nitro : ça chuinte. Les médiums saturés (`jetDist`/`jcFb`) sont au repos, gardés pour usage ponctuel.
- **MOBILE / TACTILE — LA VERSION TÉLÉPHONE** (bloc `if(IS_MOBILE)` en fin de fichier + CSS `body.touch`) : **PORTRAIT assumé** (le paysage est refusé : `#rotate` s'affiche et la partie se gèle), **DEUX POUCES**, gaz AUTOMATIQUE (`AUTO_GAS`), **aucun bouton de frein** (verdict user : le pouce droit ne sert qu'à la NITRO). Tout est scopé sous `body.touch`/`body.play`/`body.tpad` — **le desktop ne bouge pas d'un pixel**, et aucune physique n'est réécrite (le tactile pilote le MÊME objet `keys` et le MÊME `steer`). **VOLANT ANALOGIQUE 2 AXES** (`TCTL`, `#tSteer`/`#tStick`/`#tKnob`) : la moitié gauche est le volant, le stick NAÎT sous le pouce, **stick FLOTTANT sur les deux axes** (passé la butée la base suit le doigt → revenir au centre rend la main INSTANTANÉMENT). `TCTL.st` = braquage (X, course 54 px, zone morte 6 %, courbe `|n|^1.15`) — un seul point d'entrée : `const target=TCTL.act?TCTL.st:(lf?1:0)-(rt?1:0)`. `TCTL.sv` = **ASSIETTE EN VOL** (Y, course 44 px depuis le 28/09 « augmente la sensibilité » — 66 avant, zone morte 10 %, courbe 1,15 ; le DRIFT lit les pixels `TCTL.dy` > 34,9) : **manche d'avion** — pouce vers le HAUT = **PIQUÉ** (`piq` : rotation −1.45 rad/s + `fallVel.y−=`, le plongeon ACCÉLÈRE), pouce vers le BAS = **CABRER/DÉCOLLAGE** (`cab` : même levier que l'ancien ↓ clavier, +1.35 rad/s et portance). Les deux vivent dans le bloc `if(nitroOn)` du mode 'fall' : **sans nitro, pas d'assiette** (le clavier desktop est inchangé : ↑ portance, ↓ cabrer). Pouce DROIT : NITRO énorme (double-tap = BRAQUAGE). Deuxième schéma **PAD** (flèches) au bouton 🕹, persisté `SAVE.d.tctl`. **CIEL NU** (`NO_CLOUDS=IS_MOBILE`) : `VOL_OK` passe à false (la texture 3D 64³ n'est même pas bakée) et `buildClouds` sort **après avoir consommé son `rr()`** (sinon toute la piste en aval se décale) — plus aucun nuage, ni volume ni sprite ; le ciel, le fog et les biomes restent. **CADRAGE PORTRAIT** (`fovFit()` → `FOV_K` et `POR`, recalculés à chaque resize/rotation) : le `fov` de three est VERTICAL, donc sur un écran haut le champ horizontal s'effondre → `FOV_K` (≤1.30) rouvre l'angle, et `POR` (0 paysage → 1 portrait) recadre la caméra. Réglage final (user, deux passes : « plus proche, qu'elle occupe plus de place ») : `camBack ×0.70` (on COLLE à la caisse — elle déborde volontairement un peu en bas de cadre), `camH ×1.72` (vue plongeante — c'est elle qui fait tenir la caisse ENTIÈRE dans le cadre au lieu de la laisser sortir par le bas) et visée abaissée (`F.n 1.05−0.55`) pour la faire remonter au-dessus de la jauge. Ces trois valeurs se règlent ENSEMBLE : reculer rapetisse, monter redresse, viser bas remonte. **ÉCRAN NU** (verdict user 2026-08-24) : sur mobile TOUT le HUD est masqué — argent, minimap, compteur km/h, barre de style violette, `#msg`, `.trick`, chaîne, mallette, carte de caisse, HUD survivant, alerte dernier, billets volants, scanlines. Il ne reste que **la jauge de nitro** (remontée tout en HAUT de l'écran : en bas elle barrait la caisse en travers) et **UN bouton ⚙** en haut à droite. Rien n'est supprimé du code (les éléments sont écrits comme avant, juste `display:none` sous `body.touch`) : rallumer une ligne = retirer son sélecteur du bloc ÉCRAN NU. `drawMinimap()` est sauté sur mobile (plus de repeinte de canvas pour un élément invisible). Le camembert d'airtime `#airPie` est un rescapé : sans lui on explose en vol sans prévenir. **LE DÉBLOCAGE EST LE SEUL TEXTE QUI PARLE** (verdict user 2026-08-25 : « enlève les textes de présentation des voitures et les blagues ») : `#carCard` est ressorti de la purge mais DÉPOUILLÉ — `.ccSpd` (fiche technique) et `.ccDesc` (la punchline de la caisse) masqués, plus de fond de carte, il ne reste que le bandeau 🔑 sur une ligne et le **NOM en 34 px** qui DÉBOULE à l'écran (`@keyframes ccPunch` : entrée en scale 2.4 floutée → rebond). C'est un trophée, pas une notice. Les punchlines de fin de run (`END_LINES`/`END_TOP` dans `#tagline`) sont masquées en mode `dead` — à la mort on lit un montant, pas une vanne ; la baseline du menu, elle, reste. Les autres viviers de flavour (`GO_LINES`, `ZONE_LINES`, `RAIN_LINES` — « LA BANQUE A APPELÉ : ELLE ABANDONNE », `CRASH_LINES`, échelle) passent tous par `showMsg`/`trickMsg`, donc déjà muets sur mobile. Rien n'est retiré du DESKTOP. **LA COQUE MOBILE — écrans à la façon des jeux mobiles** (`#mob`, `.mscr`, routeur `mGo`/`mFill`/`mTap` dans le bloc IS_MOBILE) : l'ancien menu desktop est masqué EN BLOC (`body.touch #overlay>*{display:none!important}` — `endGame` repose des `display:block` en inline, d'où le `!important`) et cinq écrans le remplacent : **ACCUEIL** (titre, meilleur score, gros JOUER, rangée d'icônes), **MORT** (verdict, montant qui S'ÉGRÈNE en 750 ms via `mCount`, caisse atteinte, 3 stats, meilleur, saisie de record ré-adoptée dans l'écran, REJOUER, icônes — **le classement TOP 10 a disparu, il ne servait à rien sur téléphone**), **GARAGE** (les 24 caisses en grille, débloquées d'après `max(level, SAVE.d.bestCar)`, verrouillées en `? ? ?`, barre de progression vers la prochaine + montant restant), **MODES** (cartes SURVIVANT et BAC À SABLE, avec leur description), **RÉGLAGES** (son · musique · voix · commandes · image · copier/restaurer · effacer). Le retour d'un sous-écran revient sur l'écran RACINE du moment (`mRoot()` : mort si on vient de mourir, accueil sinon). ⚠ L'overlay lançait la partie AU MOINDRE CLIC : un bloqueur en phase de CAPTURE neutralise tout clic parasite (la saisie de record garde le sien). **BAC À SABLE** (`SANDBOX`, persisté `SAVE.d.sand`) : `endGame()` est intercepté en tête et renvoie vers `sandRevive()` — la caisse se replace, la run continue, aucun score n'est enregistré ; le QUITTER du panneau contourne l'interception le temps d'un appel. **DA PIXEL — la charte `.pbtn`** : le titre du jeu est du pixel 3D doré, tout le reste s'y est aligné. Zéro coin arrondi, zéro verre dépoli : chaque bouton est une PLAQUE D'ARCADE (biseau clair en haut-gauche, ombre dure en bas-droite, **épaisseur** en `drop-shadow` qui disparaît à l'appui — le doigt ENFONCE la touche), coins coupés en octogone par `clip-path` (le « rond » du pixel art). Quatre variantes : `pb-gold` (action principale) · `pb-cyan` · `pb-green` · `pb-red`, plus `.ico` (pictogramme + étiquette). Le bouton NITRO, le ⏸, le panneau de pause, la saisie de record et la jauge suivent tous cette charte. **UN SEUL BOUTON** (`#tSet`/`#tGear`/`#tPanel`) : ⏸ manette en main, ⚙ au menu — il remplace TOUS les boutons du jeu (son, voix, reset, survivant, sauvegarde). **Ouvrir MET EN PAUSE**, fermer reprend (on ne fouille pas les options à 1400 km/h). Panneau à SECTIONS contextuelles (`data-g="run"|"menu"`, arbitrées par `panSync()`) : *PAUSE* → REPRENDRE · *RÉGLAGES* → SON · VOIX · COMMANDES (volant⇄flèches) · **IMAGE** · SURVIVANT · *LA PARTIE* (en jeu) → REPLACER · RECOMMENCER · *SAUVEGARDE* (au menu) → COPIER/RESTAURER le code. **RÉSOLUTION D'IMAGE À LA CARTE** (`applyQ`, `SAVE.d.q`) : `setPixelRatio` ne touche QUE le canvas 3D — le HUD est du DOM, il reste net au pixel quoi qu'il arrive. On enlève donc les pixels là où ils coûtent (raymarch, bloom, ombres) sans jamais flouter une jauge. Mobile : **0.66 par défaut (« RAPIDE »)**, ~4× moins de pixels qu'un rendu Retina ; « NETTE » remonte à 1.15 ; plancher de l'adaptatif `DPR_MIN` .42 sur téléphone. **ÉCRANS COHÉRENTS** : le menu, l'écran de mort et le panneau partagent UN vocabulaire — même fond, mêmes cartes arrondies à liseré cyan, même pilule dorée pour l'action principale, titres de section en petit violet (`.tpH`). L'écran de MORT (`body.dead`, posée par le tick) réordonne tout en flex `order` : le logo s'efface, **GAME OVER** passe en tête, le **montant devient le héros** (le 🏆 RECORD se pose dessous en petit via `#finalScore .rec`), puis punchline, caisse, stats, saisie du nom, TOP 10, et **REJOUER** ferme la marche. `#saveRow`/`#ctrlRow` sont masqués (leur contenu vit dans le panneau : UN seul endroit pour les réglages). `env(safe-area-inset-*)` partout ; menu compacté sous `max-width:560px` et `max-height:560px`. **SYNCHRO PARESSEUSE 8 Hz** (`setInterval` 140 ms) : classe `play` (les commandes n'existent que manette en main), astuce de vol dite UNE fois, gel si le téléphone est couché. **IMMERSION** (`goImmersive`, sur geste uniquement) : plein écran + `screen.orientation.lock('portrait')` + Wake Lock, rejoués au retour d'appli ; manifest en `"orientation":"portrait"`. **HAPTIQUE** (`hap(p)`) : crash, PARFAIT/DIVIN, braquage, caisse débloquée — suit l'interrupteur SON. **PIÈGES iOS traités** : `volume` en lecture seule sur HTMLAudio (`VOL_LOCKED` → l'annonceur ne joue QUE la voix principale) ; `AC.resume()` rejoué à chaque `touchend` ; `orientationchange` recadre après 280 ms. Gestes parasites tués (zoom pincé, double-tap, long-appui, pull-to-refresh) SAUF le défilement de `#overlay`. **PERF** : `PCFShadowMap`, `backdrop-filter` désactivé sous `body.touch`, + DPR cap 1.25 / MSAA off / bloom .42. Hook console : **`dbgTouch()`** (on/pad/act/st/sv/play/steer).
- **MOBILE — CE QUI A CHANGÉ À LA FUSION** (le paragraphe MOBILE ci-dessus reste vrai pour tout le
  reste : portrait assumé, deux pouces, gaz auto, volant flottant deux axes, écran nu, charte `.pbtn`,
  panneau ⚙ qui met en pause, immersion, haptique, pièges iOS) :
  · **plus d'écran GARAGE en grille** — le bouton 🏎 ouvre le VRAI atelier 3D (`openGarage()`), avec ses
    commandes grossies au pouce et le **pincement** en guise de molette. ⚠ le `preventDefault` global sur
    `touchmove` ANNULE la séquence `pointer*` : il y a une sortie `if(garageOn)return`, sans elle le
    glissé qui fait tourner l'atelier était tué net (`touch-action:none` suffit à bloquer le scroll).
  · **MODES a trois cartes** : Survivant · Parc freestyle · Bac à sable.
  · **RÉGLAGES a LANGUE** (FR/EN), et les interrupteurs (son, voix, musique, Survivant, Parc) passent par
    **`.click()` sur les boutons du menu desktop** au lieu de refaire leur logique : ils ont des effets de
    bord (suspend du contexte audio, exclusion mutuelle police/parc, reconstruction de la scène de menu),
    les dupliquer ferait deux vérités qui divergent. ⚠ le bloqueur de clics en phase de CAPTURE doit donc
    laisser passer `#saveRow` (sinon ces `.click()` n'atteignent jamais leur bouton, et le mode s'affiche
    ON dans la coque en restant OFF dans le jeu).
  · **l'écran de MORT montre le MOTEUR atteint**, pas une caisse gagnée (les caisses ne se gagnent plus
    à l'argent). L'accueil affiche la caisse équipée.
  · **la police pixel n'a pas de capitales accentuées** : tout libellé en `var(--pix)` s'écrit SANS accent
    (« REGLAGES », « FLECHES ») — sinon on lit « RéGLAGES ». Les descriptions en police système gardent
    les leurs. Et **jamais de `data-fr=""` vide** : `applyLangDOM` écrit `TR(dataset.fr)`, une chaîne vide
    donne une chaîne vide — l'attribut ne se pose que s'il porte déjà le texte français.
  · **les nuages restent allumés** sur téléphone (le maillage a remplacé le raymarch).
- **Persistance** (`SAVE`) : UNE clé localStorage versionnée `cashcarSave` (`{v:2, best, leaders, bestCar, sfx, vox, tctl}`). Toute la persistance passe par `SAVE.d` + `SAVE.flush()` (écriture immédiate) ou `SAVE.mark()` (filet auto-save 30 s) — ne JAMAIS écrire localStorage en direct. `san()` désinfecte tout ce qui entre (storage rongé, code importé) : la forme est garantie. Migration douce : les anciennes clés `rrBest5`/`rrLeaders5`/`rrBestCar5`/`rrSfx5`/`rrVox5` sont lues UNE fois si `cashcarSave` absent, jamais réécrites (retour arrière possible). Export/import par code base64 (`SAVE.export()`/`SAVE.import()`) — boutons `#saveExp`/`#saveImp` sur l'overlay (copie presse-papier avec repli `prompt`, restauration + reload). Flush aux moments clés : fin de run (`endGame`), record leaderboard, meilleure caisse, mutes. Migrations futures : une marche par version dans `SAVE.load()`.

## Conventions
- Style compact existant (pas de point-virgule manquant, minification manuelle légère) : s'y conformer.
- Commentaires en FRANÇAIS, avec la voix du projet (imagés, précis).
- Perf d'abord : pools de particules réutilisés (`makePool`/`spawnP`), pas d'allocation dans la boucle (réutiliser tmp/tmp2/tmp3/cldV1…), sprites plutôt que géométrie lourde.
- Tout nouvel élément visuel doit être disposé proprement au rebuild (`trackMeshes` ou équivalent de `disposeClouds`).
- Ne jamais casser la boucle : le try/catch de `loop()` masque les erreurs (voir console).

## Pièges connus
- `tmp3` & co sont partagés : toujours `set`/`copy` avant usage.
- Les positions des sprites de nuage sont LOCALES à leur groupe (monde = `g.position + sp.position`).
- `checkUpgrade()` doit être appelé après CHAQUE gain d'argent.
- `annSpeak(key,prio,forced)` : `forced=true` uniquement pour rejouer la file d'attente (bypass du 1/3).

## Idées de suite (backlog)
- Boucliers/malus dans les nuages sur route (risque/récompense de la percée à l'aveugle).
- Mode contre-la-montre par zone + fantôme du record.
- Voix supplémentaires (bump.mp3, fever.mp3) — suivre le pattern ANN_LIB + règle du 1/3.
- Gamepad (API Gamepad), tactile mobile.
- Réglage qualité auto (compter les ms/frame, réduire nuages/particules si <50 fps).
