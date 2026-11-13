# Banc gabarits - rapport en cours

Jeu servi : branche debug-gameplay (f32fbba2). Pilote dbgAuto(1,0,{vol:true}), graine fixe par map, muet, --reel 1, 30 s reelles par course.
Charge du Mac 40 a 114 (autres sessions) : seuil du banc releve a 60 (SEUIL=60 dans lot.sh). Les i/s sont donc faux ; exceptions, NaN, morts, caisse figee restent valables.
Outils : preuves/banc-gabarits/{gab.cjs,lot.sh,chaine.sh,resume.sh}. Journaux : *.jsonl, *.log.

## Config 1 : iPhone SE 375x667 @2, palier 0, 12 maps (courses 1, 2 apres REJOUER, 3 = portail)
Exceptions JS : 0. Requetes en echec : 0. NaN : 0. Caisse figee : 0. Mort pendant une course : 0 (toutes vivantes apres 30 s ; aucune mort arbre/tour/pic/paroi).
Distance (c1 / c2) : banquise 279/2342, canyon 2543/5492, crypto 1914/-, dunes 2273/5118, foret 2646/-, grotte 2369/5875, jade 2496/6207, ville 2467/5788, vitree 2673/6505, espace 2711/-, volcan 3943/-, nuages 2722/6187. vmax 207 a 285 km/h.
Portail (c3) joue et valide (zone traversee, vivant) : banquise (s=6594), crypto (7110), foret (7047), espace (6184), volcan (10415).

## Anomalie a regarder (probablement le jeu, pas le banc)
7 courses 3 (canyon, dunes, grotte, jade, ville, vitree, nuages) et 4 courses 2 (crypto, foret, espace, volcan) ne redemarrent PAS apres REJOUER : l'etat reste gameOver, mode boom, pendant 60 s.
Correlation parfaite : ces memes courses (et seulement elles) ont dans la console "WebGL: too many errors, no more errors will be reported to the console for this context." (la course d'avant ou celle-la). Les REJOUER qui marchent n'ont pas ce message.
Hypothese : sur palier 0 (ANCIEN), mort forcee par dbgDauphin('boom') puis REJOUER sous charge -> contexte WebGL en erreur -> jeu fige sur l'ecran de mort. A distinguer : effet de la mort forcee (dbgDauphin) ou du banc surcharge (swiftshader) ; ou vrai bug de REJOUER depuis le correctif seconde chance. Les 5 premieres maps jouees avant la charge 100+ ont mieux marche. Non tranche.
Banc corrige pour les configs suivantes : REJOUER reessaye jusqu'a 6 fois et note "SANS EFFET" ; a verifier si l'anomalie persiste.

## A faire (chaine en cours)
promax-p2 430x932@3 palier 2 (12 maps), paysage-p2 844x390 (6 maps), 13pro-p1 390x844 palier 1 (6 maps). Verrou rendu entre chaque config (lot.sh).
Reprise : cd preuves/banc-gabarits ; ./resume.sh <tag>.jsonl ; verifier pgrep -fl "chaine|lot.sh|gab.cjs".

## Mise au point des « REJOUER sans effet » (se-diag et vieux-diag, SE p0)
Cause : le BANC, pas le jeu. Apres la mort forcee (dbgDauphin('boom')), l'ecran de fin porte des voiles par-dessus REJOUER : badge/recompense de mission (#bdGar2.mBadge, mDead) pendant quelques secondes, et le FINAL SPIN plein ecran (#spinM, jeton ramasse en route) qui reste tant qu'on ne tire pas. Le tap tombe sur le voile. Des relances (jusqu'a 6) + fermeture du Final Spin corrigent. Meme comportement sur l'ancien code f0fb32e5.
Aucune des courses de 30 s ne finit par une mort naturelle (etat avant mort forcee : mode drive, cause vide). Les « morts a s=87/104/172 » = la mort forcee a la fin de la fenetre, apres une zone deja changee naturellement (s repart de 0, lat 0, psi 0 : la mort forcee ne bouge pas la caisse).

## Branche 1ff2da3f / 973390a1 : roches de Jupiter et satellites (banc scen.cjs, 390x844 @3, palier 2, espace)
Crochets : dbgClassique('espace','soir') = Jupiter (peuple « roches », 33 roches), ('espace','matin') = orbite terrestre (peuple « satellites »). Le peuple est TIRE AU HASARD a chaque partie : roches / satellites / vide.
1. Roches de Jupiter
 (a) dbgOrbite().roches = 33, instance 'orbite roches' visible dans la scene : OK.
 (b) Caisse en vol (saut du pilote), roche posee SUR son trajet (matrice reecrite + grille relue) : mort en 3 images, cause « roche », ecran de mort normal (PERDU, REJOUER), photo roches-mort-roches-espace-b.jpg. OK.
 (c) Roche posee a 3 m (au-dela de l'ellipsoide de choc .86*S+.9) du trajet, la caisse passe a cote : pas de mort, retombe sur la route. Rayon normalise minimal du trajet = 1,42 (> 1) : le trajet est reste dehors. OK.
 NB : dbgImpact(d,v,el) ne tue pas ici : il vise la roche la plus proche, souvent SOUS la dalle ; la caisse se pose sur la route avant. Le test reel a donc place la roche devant la caisse en vol.
 (d) 3 courses normales au pilote auto (roches-d : c1 2560 m, c2 5323 m, c3 portail 6403 m) : 0 mort, 0 exception, 0 NaN. NB : meteo 'soir' donne parfois peuple « vide » ou « satellites » (hasard).
 (e) Apres un portail venant d'une orbite a roches : ROCHES.visible=false, count=0, dbgOrbite().roches=0, 0 mort « roche » pendant 14 s sur la zone suivante. OK (deux fois).
2. Satellites (orbite terrestre, ccLang explicite)
 Mesure du corps (geometrie unitaire x echelle) : Starlink = bande plate de 2 unites de large (x +-1) pour 0,10 d'epaisseur (y +-0,05) et 0,26 de profondeur (z +-0,13) ; le « corps » (rayon des sommets p50 0,14, p90 0,29) est au centre, les panneaux vont jusqu'a 1,0. Sphere dure = rad*0,22+0,9 : pour rad 10 : 3,1 m (corps p90 = 2,9 m, panneaux jusqu'a 10 m) ; pour rad 40 : 9,7 m (corps p90 11,6 m). La sphere colle donc au CENTRE de l'engin (le corps) ; les panneaux au-dela ~3 m du centre (jusqu'a 90 % de l'envergure) se traversent sans mourir ; on peut mourir jusqu'a ~2 m au-dessus ou au-dessous de la tole du petit modele (epaisseur reelle +-0,5 m). Debris : geometrie nulle cote CPU (bbox 0), forme dans le shader : non mesurable ici.
 Les trains Starlink (aMov) n'ont pas de sphere dure mais restent a 240-560 m au-dessus de la piste (libre(..., rad+ROAD_HALF+140)) : inatteignables.
 Mort en vol dans un satellite : obtenue en anglais au 10e tir (dbgImpact(25,170,0.16), dist 112,8) : cause « satellite », texte du DOM « HIT A SATELLITE », ecran de mort normal. En francais : 14 tirs sans cible a portee (« rien a moins de 400 m »), pas de mort : le libelle francais « CONTRE UN SATELLITE » (table CAUSES de mobile-tactile.js) n'a pas ete lu dans le DOM.
 ATTENTION : la ligne de cause (#mCause) n'est JAMAIS visible : charte-7-details.css:208 `#mDead .mCause{display:none!important}` (volontaire : « la cause de la mort ne s'affiche plus »). Donc l'ecran « CONTRE UN SATELLITE » / « HIT A SATELLITE » n'apparait pas a l'ecran, pour aucune cause ; le texte est seulement dans le DOM.
 A cote d'un satellite : non teste (ORB.durs n'est pas exposee ; dbgImpact vise toujours la cible). Pas de mort « satellite » dans les courses au sol.

## Portrait / paysage / rotation (scen.cjs --scen rot ; 390x844 puis 844x390 @3, palier 2 ; 9 maps du tirage ; resume : node rotresume.cjs <maps>)
Par map : course de 30 s debout, rotations debout->couche->debout en roulant puis en vol (changement de la taille emulee + evenement orientationchange), course de 30 s couchee (page rechargee a 844x390).
Resultat : 0 exception (9 maps), 0 NaN, 0 mort, 0 pause intempestive, 0 caisse figee, 0 image ou la caisse sort du cadre (projection |x|,|y| <= 1) pendant les 30 s et pendant les 3,5 s apres chaque rotation. Le rapport camera/aspect suit (aspect 0,462 <-> 2,164 des la 1re image apres rotation). Rotation en vol : mode « fall » au moment du changement dans 8 maps sur 9 (vitree : la 1re rotation « en vol » est tombee apres l'atterrissage).
Champ de vision (vertical) et distance camera-caisse, plage mesuree sur 30 s de course :
 - debout : FOV 101-123 deg, distance 6,1 a 14 m, caisse a l'ecran x -0,47..0,5, y -0,34..-0,01 (centre a mi-bas)
 - couche : FOV 78-106 deg, distance 4,0 a 7,6 m, caisse x -0,2..0,17, y -0,49..-0,07 (plus bas : jusqu'a 25 % du bord bas de l'ecran)
 Apres rotation (derniere image) : couche FOV 90-100 deg / 4,1-4,3 m ; debout 102-120 deg / 6,2-13,7 m (volcan debout apres rotation : 13,7 m et FOV 102 : la camera est encore en train de reculer a +3,5 s, caisse au centre (-0,01,-0,02)).
 Seul point d'attention : grotte, rotation en vol : la camera passe a FOV 73 deg / 9,7 m (couche) puis 91 deg / 15,8 m (debout), et le mode devient « boom » dans la 2e fenetre (la caisse a explose pendant le vol, probablement contre une paroi : cause non relevee, non imputee a la rotation).

## Ville, course 3 (portail) : pourquoi la caisse restait a L-2 (scen.cjs --scen portail, ville, 390x844 @3)
Code : `if(PORTV.att){if(s>L-2)s=L-2;}` (boucle) : a l'entree du portail, le voile est pose et la caisse est TENUE a L-2 tant que le pre-bati de la piste suivante n'est pas fini (PORTV.att = jeton de passage en attente), puis relachee. Sur l'ancien code (f0fb32e5) la caisse est tenue exactement de la meme facon : ce n'est pas une regression.
Mesures (dbgPortail(450) 2,5 s apres le depart, echantillon toutes les 200 ms) : nouveau code palier 2, ancien code palier 2, nouveau code palier 0 : zone suivante (zones 0->1) atteinte, caisse tenue seulement 0,2 a 0,3 s (pre-bati deja fini), relachee, vivante, nouvelle piste (s repart) ou s continue sans mort, 0 exception. Il a fallu ~66 s reelles pour couvrir les 450 m (images lentes sous swiftshader pendant le pre-bati) : le temps de travail est consomme AVANT d'arriver au portail.
Dans la course 3 de gab.cjs (portail a 8 s de simulation) la caisse restait « figee » >= 6 s a L-2 (6 echantillons a 1 s) : le pre-bati n'etait pas fini a l'arrivee. Duree exacte de la tenue non mesuree dans ce cas (le lot s'arretait a 30 s) : au moins 6 s sur la machine surchargee du banc (le code parle de jusqu'a 25 s sur telephone). Non reproduit en isole ici.
Le NODEM de la ville dans se-diag (c3 jamais lancee) etait le Final Spin sur REJOUER, pas le portail.

## Garde de course (JC-02, audit-jour-c.md §4) : sans KHR_parallel_shader_compile, y a-t-il des objets invisibles mais solides ?
Banc : scen.cjs --scen garde (garde.sh : profil Chrome NEUF a chaque essai, verrou, un seul Chrome), 390x844 @3, ?tel=1&app=1, palier 2. Avant le chargement : getExtension rend null pour KHR_parallel_shader_compile (+ getSupportedExtensions filtree) ; temoin sans cette injection. JOUER est TAPE (toucher reel) : « tot » = des que le menu est pret ; « tard » = apres 40 s au menu. Puis portails (dbgClassique(map) + dbgPortail(450)) nuages -> jade -> grotte -> ville -> canyon -> espace (orbite Jupiter). 8 s releves toutes les ~120 ms apres chaque franchissement (dbgLier().garde / .enCours, liste des maillages visibles dont le programme est absent ou en attente, distance a la caisse, plus grande image figee par rAF), photos a 0,5 / 1 / 2 / 4 s (supprimees), morts.
Verification de l'injection : sans KHR, dbgLier().garde.temps = true (mode au temps) ; temoin avec KHR : temps = false et getSupportedExtensions contient KHR (Chrome headless/SwiftShader l'a).
Resultats (4 essais : sans KHR tot, sans KHR tard, avec KHR tot, avec KHR tard) :
 - Les 5 portails sont franchis dans les 4 essais (zone suivante = la bonne carte, approche 3,6 a 7,3 s).
 - Le garde n'a JAMAIS rien retenu : nes=0, sautes=0, refus=0, refusCompile=0, blocMax=0 apres chaque portail, y compris sans KHR et en jouant tot. dbgLier().enCours = 0 a chaque releve. Aucun programme n'est ne en course sur ces 5 cartes dans ce banc (la chauffe du menu les avait tous lies).
 - Plus longue image figee (ecart entre deux rAF) pendant les 8 s : 17 a 67 ms (aucun gel).
 - Morts dans les fenetres : aucune. Exceptions : 0 (voir note sur stNote).
 - Objet « visible sans programme » : un seul type revient, parfois (ville/canyon/espace, 1 a 2 occurrences, 1,5 s de portee cumulee) : un Mesh MeshPhongMaterial de 24 sommets (un cube, 1 instance), « pas ne », a 4-11 m de la caisse. Il apparait AUSSI dans le temoin avec KHR (ou le garde est inactif : nes=0), donc ce n'est pas le garde ; probablement un objet pas encore rendu (hors champ). Mon releve ne distingue pas « cache par le garde » de « hors champ jamais rendu » : ne pas lire « 1,5 s invisible » comme prouve (la duree est l'ecart entre premiere et derniere vue de la meme cle nom|materiau, pas une duree continue d'un meme objet).
 - Collisions (route, tours, piliers, parois, roches, satellites) : aucune de ces familles n'a ete trouvee sans programme.
Limites : SwiftShader n'est pas un iPhone : sa compilation est quasi instantanee, donc les durees ne se transposent pas ; le MECANISME (qui est cache, dans quel ordre) n'a pas pu etre exerce faute de naissance de programme en course (nes=0). Le « pire cas » du code (?chauffe=0, 25 programmes en course) n'a pas ete lance : c'est le test a faire pour vraiment voir le garde retenir quelque chose.
Note stNote : une exception « Cannot read properties of undefined (reading 'length') at stNote » (listener touchstart en capture) est levee quand le banc envoie un evenement touchstart SYNTHETIQUE sans `touches` (new Event('touchstart') sur #splash) ; elle disparait avec un vrai toucher (Input.dispatchTouchEvent). Artefact du banc, mais le listener ne se protege pas d'un evenement sans touches.
Piege du banc : dbgJouer() ne lance pas la partie pendant l'animation de « chute » du menu ; il faut taper JOUER.
Grotte / lac de lave ou d'eau (demande JB-01) : NON FAIT (pas de crochet pour viser une berge ; il faudrait lancer la caisse en vol rasant vers un lac connu et photographier la ligne d'eau).
Matrice restante : promax-p2 (430x932 palier 2, 11 maps x 3 courses) : 0 mort, 0 exception, 0 REJOUER sans effet ; paysage-p2 (844x390, 6 maps x 2 courses) : idem. 13pro-p1 en cours / voir ci-dessous.
13pro-p1 (390x844 @3, palier 1, nuages/canyon/crypto/jade/ville/espace, 3 courses dont portail) : 18 courses vivantes, 0 NaN, 0 exception, 0 requete en echec, 0 « REJOUER sans effet », fps 54-59. Matrice terminee. Nettoyage fait : profils Chrome temporaires, copie de l'ancien code, captures de diagnostic supprimes ; restent les photos de mort roches-mort-roches-espace-b.jpg / -c.jpg et sat-mort-sat-*.jpg.
