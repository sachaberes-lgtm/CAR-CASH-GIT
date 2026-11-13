/* <<<GROTTE>>> */
/* ======================= LES PROFONDEURS — LA MAP DES GROTTES (2026-10-18, Sacha : « fais une nouvelle map en mode dans les grottes, en mode
   Minecraft mais bien — mets-toi dans la peau d'un designer senior de jeu vidéo et fais un truc parfait ») =======================
   Une DESCENTE sous la terre, en BLOCS : la route plonge de la mine jusqu'aux abysses à travers cinq grottes — chacune SA lumière, pour que
   l'œil sache toujours où il est (chaud → vert → violet → ocre → rouge → cyan), et que la vitesse se lise sur la roche qui défile.
   · LA ROUTE (`genGrotte` → `grtTrace`) : elle DESCEND (≈ 4-5 %) de salle en salle —
       0 · L'ENTRÉE ET LA MINE : une galerie CARRÉE, des cadres de bois, des torches (la lumière chaude, le décor qu'on reconnaît) ;
       1 · LA GROTTE LUXURIANTE : une grande salle, la mousse, les lianes aux baies qui luisent, le lac d'eau (vert et orange) ;
       2 · LE BOYAU DE CRISTAUX : un tube étroit et tortueux, des épingles et des lacets, ses parois hérissées de cristaux violets, roses et azur
           (la route y tourne vite et se roule beaucoup) — (2026-10-25) il a pris la place du puits de la géode : plus de pilier, plus de boule d'améthyste ;
       3 · LES STALACTITES : une cathédrale ocre hérissée de concrétions (dessus, dessous, en colonnes) — jamais sur la route ;
       4 · LE LAC DE LAVE : la plus grande salle, l'ardoise profonde, la lave PLATE ~48 m sous la route, les chutes de lave, les diamants ;
       5 · LES ABYSSES : le noir, le sculk qui pulse en cyan, les piliers d'une cité oubliée, la salle du portail.
     ≥ 3 MODULES tirés au hasard (`gSlalom`, `gCorde`, `gChicane`, `gHoule` — LES MODULES DE CHAQUE MAP), dans leur propre flux de hasard
     (un seul tirage `rnd`) ; contrôle des croisements (moins de 32 m d'air entre deux passages = conflit, nouvel essai).
   · LA DA (2026-10-18, Sacha, au premier banc : « non, arrête, ça fait pas Minecraft — je veux une grotte, les biomes de grotte de Minecraft,
     mais avec la MÊME DA que les autres maps ») : des biomes de Minecraft, AUCUN cube ni texture pixel — la roche LOW-POLY À FACETTES des pics du
     glacier et du cône du volcan, des couleurs pleines et saturées par salle, la recette commune des maps (CONTI), des décors à facettes.
   · LA GROTTE (`grtCreuse1`, `grtPuits`, `grtLacs`, `grtPiliers`) : un CHAMP DE DENSITÉ sur une grille de 8 m (`GRT.B` ; 12 m depuis LA GROTTE VASTE, 19/10), creusé autour de la route :
     chaque échantillon vide un ellipsoïde (demi-largeur, plafond, fond — par salle, fondus aux frontières, mordus par un bruit de roche) ; la
     galerie de la mine est carrée (exposant 6) ; puis le PUITS (cône, pilier, géode, bassin), le LAC DE LAVE et le LAC D'EAU (des surfaces
     plates), les PILIERS de basalte et les colonnes de concrétion. Stockage creux en tronçons de 16³ cases. RÈGLE D'OR : un NOYAU autour de la
     route est toujours vide, le bruit ne mord jamais la route (`dbgGrotte('test')`).
   · LE RENDU (`grtMailleNets`, `GRT_VS`/`GRT_FS`) : la surface est tirée du champ par « surface nets » (un sommet par cube traversé, des
     facettes de ~8 m), une maille par tronçon cachée au-delà du brouillard ; UNE matière : la normale de la FACETTE (dérivées), la paroi et le
     sol de chaque salle (`GRT_MUR`/`GRT_SOL`), des strates douces, l'OCCLUSION (la part de roche autour du sommet), la lumière CUITE en deux
     canaux — les TORCHES et la LUMIÈRE DU LIEU (l'air de la salle, la lave par en dessous, la géode, l'eau, les baies, les chutes de lave, les
     capteurs, les feux d'âme, les gemmes) —, dosée par la météo en uniforms ; la LANTERNE de la caisse allume la roche autour d'elle. Les
     décors (cadres, torches, gemmes de diamant et d'or, lianes et baies, azalées, cristaux, concrétions, chutes de lave, capteurs, piliers) sont
     des formes à facettes (prismes, boîtes, octaèdres) dans la même matière. Zéro image, zéro lumière three.
   · LES MÉTÉOS (`SF_CARTES.grotte`, `GRT_MET`) : sous la terre, pas de ciel — TORCHES (matin : la grotte explorée, bien éclairée), CRISTAUX
     (midi : peu de torches, cristaux et minerais à pleine lumière), MAGMA (soir : la lave déborde), NOIR COMPLET (nuit : torches éteintes, tes
     phares et la lave). Chaque SALLE a son ambiance (`grtBiomes` : brume, lumières de la caisse, bloom) fondue en 2,4 s quand on y entre (bioGo)
     — la caisse prend la couleur du lieu.
   · CE QUI TUE : en vol, la roche, la lave, l'eau du puits, les gros décors (`grotteHeurt` → L'IMPACT). La route n'a rien de plus.
   Console : `dbgGrotte()` (comptes, temps) · `dbgGrotte('test')` (la règle d'or) · `dbgGrotte('vue',{p,c,fov})` · `dbgGrotte('salle',{k,d,h})`
   (photo en pause au début d'une salle) · `dbgGrotte('puits')` (le raccourci vu du bord) · `dbgGrotte('meteo','nuit')`.
   Lancer : `?carte=grotte&meteo=matin`. */
const NIV_GROTTE={id:'grotte',nm:'LES PROFONDEURS',bio:['grt-matin-mine'],planete:0,espace:0,pluie:0,cielMusical:false,route:.34,sheen:.14,piste:'grotte',nuit:1,pr:'LA ROCHE NE PARDONNE PAS'};
const GROTTE={root:null,Q:null,salles:null,sTot:1,conflits:0,croise:0, // la génération (prebChampsDe)
  V:null,met:'matin',cur:null,de:null,to:null,k:1,dur:1,ms:0,msFile:0,n:{},file:null,fi:0,pret:false,grp:[],salle:-1,sl:null,col:null,heurt:'',part:null,R:null,puits:null,lac:null,eau:null};
/* ===== LA GROTTE SUR LES PAROIS (2026-10-25, Sacha : « refonte totale de la grotte : on enlève la boule d'améthyste, on enlève la géode, c'est tout le temps le même module ;
   plus de virages, plus de tout droits, des modules de course ; la route doit longer les parois de la grotte, sans queue ni tête — des fois sur le sol, des fois sur le mur à 90°,
   des fois au plafond ; la grotte est un long couloir qui tourne, puis une grande salle de lave où l'on roule au plafond, puis on retourne au sol ») =====
   · LE PUITS ET LA GÉODE SONT PARTIS (la spirale, le pilier, la boule d'améthyste, le bassin, le raccourci). Leur salle devient LE BOYAU DE CRISTAUX : un tube étroit et tortueux
     (épingles, lacets, esses) dont les parois portent des cristaux violets — l'améthyste reste, la boule non.
   · LA ROUTE SE ROULE : la piste est dessinée à plat (`grtTrace` : de nouveaux modules — ÉPINGLE, LACETS, ESSES larges — des caractères de salle plus virageurs, moins de droites),
     puis ré-enroulée dans l'espace par `pisteTord` (la machinerie de la map des nuages, réglée par `GRT_TORD`) : la dalle se couche dans les virages jusqu'à la verticale (le DÉVERS
     monte à 88°), tient un quart de tour (le mur), un demi-tour (le plafond), revient au sol. TORD.on : la caméra, la gravité et le vol suivent la dalle. Le départ, la mine, la salle
     du portail restent à plat. `?sans=grotteparois` = la route plate d'avant.
   · LE CREUX SUIT LA DALLE (`grtCreuse1`) : chaque échantillon de route creuse un ellipsoïde de révolution autour de SA normale (le haut de la dalle), pas autour du haut du monde ;
     sous la route il reste peu de vide (`hug`, ~34 m) : la route LONGE la paroi — sur le sol de la salle, sur un mur ou sous la voûte — et, par moments (`grtProfond`),
     le fond s'ouvre en gouffre. Le centre du creux se décale de côté (`lt`) : la route frôle un mur latéral, puis l'autre.
   · LA LAVE ET L'EAU restent PLATES (le niveau du monde) : un bassin vertical est creusé sous la route (`R.BAS`) jusqu'au lac — quand la route passe au plafond de la salle de lave,
     le lac est sous la caisse en vrai, au-dessus de sa tête vu de la dalle. */
const GRT_ROULE=!/[?&]sans=([^&]*,)?grotteparois(,|&|$)/.test(location.search);
function grtTordOn(){const c=LVL.cur;return GRT_ROULE&&!PARK.on&&!!c&&c.piste==='grotte'&&!c.camp&&(started||SF.pret);}
const GRT_TORD={f0:.14,tenueHaut:GEN_V2?.1:.9,lenHaut:GEN_V2?[2,2]:[6,6],tenueBas:GEN_V2?.95:.5,lenBas:[5,6],quart:GEN_V2?.9:.55,demi:.999,dev:{max:34/57.3,k:.8,vmax:24/57.3,roulis:50/57.3}}; /* (2e passe, Sacha : « on longe le mur, ou le plafond, ou le sol, et des spirales adaptées pour changer de surface — pas de spirales partout ») : LONGUES tenues sur une surface (6-12 s), un changement de surface = un quart de tour (mur) ou un demi-tour (plafond) lent, jamais de tonneau, un dévers modeste (34°) */ /* le roulis : peu de tenues à l'endroit (20 %), des tenues couchées/à l'envers de 3 à 7 s, la moitié de quarts de tour, 42 % de demi-tours, 8 % de tonneaux */
/* LE CARACTÈRE DE ROULIS DE CHAQUE SALLE (surcharges de GRT_TORD, lues par pisteTord selon l'endroit) — la luxuriante : des quarts de tour tranquilles, on marche sur les murs · le BOYAU : des changements de surface plus fréquents (tenues de 4-8 s)
    · la LAVE : de longues tenues AU PLAFOND, au-dessus du lac (des demi-tours, rarement à l'endroit) · les stalactites et les abysses : le réglage de base */
const GRT_ROULIS=GEN_V2?{luxe:{quart:.85},boyau:{tenueHaut:.1,lenHaut:[2,2],tenueBas:.93,lenBas:[4,4],quart:.4},lave:{tenueHaut:.15,lenHaut:[3,3],tenueBas:.9,lenBas:[4,4],quart:.5},abysse:{quart:.9}} /* (2026-11-07, LA RÈGLE v2) la route roulée ne passe plus que ~20 % de sa longueur hors de l'endroit (≤ 25 %) : tenues couchées courtes, tenues à l'endroit longues */
  :{luxe:{quart:.85},boyau:{tenueHaut:.8,lenHaut:[4,4],tenueBas:.4,lenBas:[4,4],quart:.4},lave:{tenueHaut:.93,lenHaut:[8,6],tenueBas:.25,lenBas:[3,3],quart:.12},abysse:{quart:.7}};
function grtTordOpts(){const S=GROTTE.salles||[],T9=Math.max(1,GROTTE.sTot),s1=S[1]?S[1].s/T9:.14;
  return Object.assign({},GRT_TORD,{f0:s1+.01,platFin:1,zone:function(u){let k=null;for(let j=1;j<S.length;j++)if(S[j].s/T9<=u)k=S[j].k;return GRT_ROULIS[k]||null;}});} /* la route ne roule qu'après la mine */
const GRT_SALLES=['mine','luxe','boyau','stal','lave','abysse'];
/* LA FORME DE CHAQUE SALLE (mètres) — rh : la demi-largeur de l'air autour de la route · up : le plafond au-dessus d'elle · dn : le fond en
   dessous · ex : la forme (2 = ellipse, 6 = galerie presque carrée) · nz : la morsure du bruit (±). entree / fin : la salle d'arrivée (le
   portail d'où l'on vient) et la salle du portail (son anneau fait ~70 m de rayon, 21 m au-dessus de la route). */
const GRT_FORME={
  entree:{rh:96, up:92, dn:52, ex:2,nz:.14},
  mine:  {rh:44, up:33, dn:15, ex:6,nz:.05},
  luxe:  {rh:122,up:80, dn:64, ex:2,nz:.30},
  boyau: {rh:94, up:82, dn:78, ex:2,nz:.22},
  stal:  {rh:106,up:104,dn:78, ex:2,nz:.26},
  lave:  {rh:178,up:86, dn:70, ex:2,nz:.22},
  abysse:{rh:98, up:68, dn:72, ex:2,nz:.30},
  fin:   {rh:138,up:140,dn:86, ex:2,nz:.18}};
/* LA GROTTE VASTE (2026-10-19, Sacha : « la map grotte doit être plus longue et la grotte beaucoup plus vaste ») — les salles ~2,5 × plus larges
   et plus hautes (la MINE reste la galerie étroite : c'est l'ouverture sur la première salle qui donne l'échelle), le puits de la géode en
   entonnoir géant, la map 1,7 × plus longue (le remplissage des quatre salles : l'entrée, la mine, le puits et la salle du portail restent).
   La grille passe de 8 à 12 m (`GRT.B`) : à 8 m, construction, mémoire et triangles auraient été multipliés par 4-6 ; à 12 m ils restent
   ceux d'avant à ~1,5 × près, et les facettes, rapportées à des salles 2,5 × plus grandes, sont même plus fines qu'avant. Le bruit de la roche,
   les torches, les gemmes, les décors, la lumière de la lave et de la géode et le brouillard suivent l'échelle (`GRV`). `?sans=grottevaste` =
   la grotte d'avant, à l'identique. */
const GRT_VASTE=!/[?&]sans=([^&]*,)?grottevaste(,|&|$)/.test(location.search);
if(GRT_VASTE)Object.assign(GRT_FORME,{
  entree:{rh:140,up:130,dn:80, ex:2,nz:.14},
  luxe:  {rh:215,up:170,dn:150,hug:34,lt:.55,ex:2,nz:.20},
  boyau: {rh:125,up:115,dn:110,hug:30,lt:.50,ex:2,nz:.20},
  stal:  {rh:210,up:240,dn:150,hug:34,lt:.50,ex:2,nz:.18},
  lave:  {rh:340,up:200,dn:170,hug:36,lt:.50,ex:2,nz:.16},
  abysse:{rh:200,up:170,dn:200,hug:34,lt:.55,ex:2,nz:.22},
  fin:   {rh:230,up:210,dn:160, ex:2,nz:.16}});
/* (2026-10-25, SUR LES PAROIS) hug : le fond sous la route quand elle LONGE la paroi · lt : de combien (× rh) le creux se décale de côté — seules les salles qui roulent en ont */
/* LA PROFONDEUR : le fond sous la route s'ouvre en gouffre ~25 % du temps (0 = la route longe la paroi, 1 = le fond entier de la salle) */
/* ===== LES GÉANTS (2026-11-05, Sacha : « un module avec une salle pleine de stalagmites… je veux qu'il soit tellement imposant que ça devienne un obstacle à part entière ») =====
   Dans la salle des stalactites, un MODULE : la route fait une serpentine de 1 à 3 virages larges et, au CENTRE de chaque virage, se dresse un stalagmite GÉANT (50-70 m de rayon,
   150-210 m de haut, tiges de pierre superposées, petits piquants au pied, une stalactite qui descend presque à sa pointe). Le virage existe À CAUSE de lui : il cache la suite de la route,
   couper le virage en vol, c'est le percuter (la roche tue en vol), et il est trop haut pour passer par-dessus. La route reste simple (longues droites, virages larges) : c'est le décor qui est l'obstacle.
   · `gGeants` (grtTrace) trace la serpentine et note chaque virage (GROTTE.geants : abscisses d'entrée et de sortie) ; le module est marqué `f:[]` dans MODMARK : pisteTord y tient la dalle À L'ENDROIT (le géant est sur le sol).
   · `grtEchantillons` relit le vrai virage dans la route finale (cap au début et à la fin → rayon, centre) : R.geants ; et ouvre la salle autour (RH, UP) pour que le géant tienne dans l'air.
   · `grtDecorsG` plante le géant sur le sol (plancher), le plafonne sous la voûte, et l'inscrit aux collisions (cône à la mesure de la facette).
   `?sans=geants` = la salle d'avant. Console : `dbgGrotte('geants')`. Les réglages sont ici, à un seul endroit. */
const GRT_GEANT={on:/[?&]avec=geants(&|$)/.test(location.search), /* (2026-11-06, Léo : « un gros bloc de neige sur la route, c'est pas jouable ») COUPÉS par défaut : la salle d'avant ; `?avec=geants` les rend (banc) */
  rayon:[48,72],  /* le rayon du pied (m) : 0,3 × le rayon du virage, borné ici */
  jour:70,        /* l'air minimum entre le flanc du géant et le bord de la route (m) */
  haut:[150,210], /* la pointe au-dessus de la ROUTE (m) — le fond peut être 200 m plus bas, dans un gouffre ; plus bas si la voûte est basse */
  voute:38,       /* l'air gardé entre la pointe du géant et la voûte (m) */
  salle:70,       /* la roche creusée de plus derrière le géant (m) */
  up:300,         /* le plafond de la salle autour des géants (m au-dessus de la dalle) */
  nMax:3};        /* le nombre de géants du module */
/* ===== LA ROUTE À RYTHME (2026-11-05, Sacha : « il n'y a pas assez de virages, pas assez de trucs fun, rajoute des modules — vitesse, exploration, smoothness ») =====
   MESURÉ au banc (passation/RACCOURCIS.md, outils/banc-routes) sur la route d'hier : 0,5 virage au km (cible ≥ 2,5), 0,2 enchaînement au km (≥ 1), 0 raccourci au km (≥ 0,6). Des virages LARGES (≥ 1,9 × le rayon mini : ils passent
   au pouce, jamais serrés) qui s'enchaînent en rythme, des droites courtes (≤ 3 s), et des MODULES lisibles : slalom, chicane, corde, esses (le rythme), houle (des bosses : les tremplins), LACETS (deux fois : ce sont
   les RACCOURCIS, la route sage reste ouverte), et trois nouveaux — LE PLONGEON (une descente raide et sa bosse), LA CORNICHE (un grand virage où la dalle monte sur la paroi) et LE BOYAU RAPIDE (un couloir étroit où la roche défile).
   `?sans=flow` = la route d'hier (longues droites, rares courbes douces). Réglages ici, à un seul endroit. */
const GRT_SAUT=!/[?&]sans=([^&]*,)?grottesaut(,|&|$)/.test(location.search); /* (2026-11-11, LA DESCENTE) LE SAUT DES ABYSSES : voir gSaut, dans grtTrace */
const GRT_FLOW={on:!/[?&]sans=([^&]*,)?flow(,|&|$)/.test(location.search),
  a:[30,30],      /* l'angle d'un virage (° : minimum + étendue) */
  k:[1.9,1.0],    /* son rayon (× rM : minimum + étendue) */
  gap:[.4,15,60], /* la chance d'une droite après un virage, sa longueur minimum et son étendue (m × KV) */
  rel:42,         /* écart au cap de l'axe (°) au-delà duquel le virage suivant ramène vers lui */
  liste:TORD_MOD?['gSlalom','gChicane','gHoule','gEsses','gCorde','gPlongeon','gBoyau']:['gSlalom','gChicane','gHoule','gEsses','gCorde','gPlongeon','gCorniche','gBoyau'], /* (2026-11-11, LA TORSION EN MODULES) la corniche ne se tire plus dans le paquet : elle est la signature d'UNE salle */ /* les modules tirés par paquets (le même n'est jamais deux fois de suite) */
  signature:TORD_MOD?{luxe:'gCorniche',boyau:'gChicane',lave:'gPlafond',abysse:GRT_SAUT?'gSaut':'gSlalom'}:{luxe:'gBoyau',boyau:'gChicane',lave:'gCorniche',abysse:'gSlalom'}, /* (2026-11-11, LA TORSION EN MODULES — Sacha : « moins, et placées de manière plus intelligente en fonction du contexte ») plus aucune vrille au hasard dans la grotte : la route ne quitte le sol que TROIS fois, chaque fois pour la salle où elle est — la LUXURIANTE se longe en corniche (la dalle couchée sur la paroi, au-dessus de l'eau), la salle de LAVE se traverse AU PLAFOND (le lac au-dessus de la tête), et le GOUFFRE se prend couché ; le boyau, les stalactites et les abysses se roulent à l'endroit */ /* le module PROPRE à chaque salle (le premier qu'elle reçoit) : la luxuriante s'engouffre dans un couloir, le boyau de cristaux et les abysses descendent en lacets (les raccourcis), la salle de lave longe sa paroi en corniche ; les stalactites ont les géants */
  plongeon:{amp:.07,long:[480,140]},        /* la pente en plus (0,07 = 4°) sur 480-620 m × KV, puis une bosse (−0,55 × amp) : le tremplin */
  corniche:TORD_MOD?{a:[95,45],k:2.4,roulis:2.6}:{a:[75,25],k:2.4,roulis:1.8}, /* (2026-11-11) 95-140° (la route ne dérive plus : la corniche peut durer), la dalle se couche en 2,6 s (1,8) */
  plafond:{roulis:3.4,a:34,k:2.3},           /* LE PLAFOND : la durée d'un demi-tour (s de croisière), l'angle du S pris à l'envers (°), son rayon (× rM) */   /* l'angle (°), le rayon (× rM), la durée du roulis (s de croisière) */
  boyau:{long:[340,100],rh:70,up:68,dn:42}};/* la longueur (m × KV) et le creux du couloir : demi-largeur, voûte, fond */
/* ===== LE VERTIGE (2026-11-12, Sacha : « on a toujours l'impression que ce sont les mêmes modules qui passent en boucle ; il faut beaucoup plus de modules ; qu'on ne sache plus si on est à l'endroit ou à
   l'envers — la route suit les murs, on rentre dans un tunnel, on ressort et on est au plafond, le lac de lave est en haut ; une génération plus aléatoire, des transitions qui se font mieux, chaque fois une
   grotte différente dans la forme, la direction de la route et l'emplacement des modules ; et il faut qu'on DESCENDE dans la grotte ») =====
   MESURÉ avant (outils/banc-routes/grotte-torsion.cjs + grotte-vertige.cjs, 20 routes, paliers 0 et 10) : le plafond, le gouffre, la corniche et le saut dans 100 % des grottes, les lacets 1,2 fois par route — 5 des
   7 à 9 modules d'une course toujours les mêmes ; 12 % de la longueur hors de l'endroit (4 % à l'envers), le plus long passage 6,8 s ; 7,4 % de pente, 14-23 % en pointe ; une grotte toujours en couloir (rectitude 0,66).
   LA RÈGLE, désormais (`grtTrace` → `planVertige`) :
   · LE PLAN : l'axe de la grotte TOURNE à chaque changement de salle (`formes` : couloir, arc, esse, crochet, zigzag) ; les salles ont des longueurs très inégales, une forme tirée (large et basse, haute et
     étroite : GROTTE.formes) et un remplissage à elles (`styles`).
   · L'ASSIETTE : chaque salle se vit sur une surface. AU SOL ; AU PLAFOND (`tenuePlafond` : on entre dans un tube, la route s'y retourne sans horizon pour le dire, on en ressort la tête en bas — le lac de lave
     au-dessus de soi — et on y RESTE, slalom et houle compris, jusqu'au tube de sortie) ; SUR LES MURS (`tenueMurs` : de grands virages de vélodrome, la dalle couchée sur la paroi, qui bascule d'un mur à
     l'autre dans les droites). Pas de tonneau : de longues tenues, des changements de surface lents et cachés (la veille, Sacha : « ça donne un peu envie de vomir, il en faut moins, placées plus intelligemment »).
   · LES PASSAGES : on change de salle en DESCENDANT — le toboggan (un tube à 30 %), la spirale autour du vide, la cascade (trois marches où l'on décolle), le nœud (la route passe sous elle-même), le saut,
     le gouffre. Tirés sans redite.
   · LES MODULES : 18 pour les salles + 6 passages + 2 tenues, tirés dans un paquet SANS REDITE dans une même grotte ; le jeu se souvient des deux dernières grottes (GRT_VUS) et sert d'abord ce qu'on n'y a pas vu.
   Les durées qui se SENTENT (un retournement, une tenue) sont en secondes RÉELLES (`sec` : la caisse roule à 1,8 × la croisière au palier 0, à la croisière au palier 25).
   `?sans=vertige` = la grotte du 11/11. Réglages ici, à un seul endroit. Banc : `node outils/banc-routes/grotte-vertige.cjs palier graines`. */
const GRT_VERTIGE=GRT_ROULE&&GRT_FLOW.on&&GEN_V2&&TORD_MOD&&!/[?&]sans=([^&]*,)?vertige(,|&|$)/.test(location.search);
const GRT_VUS=[]; /* les modules des deux dernières grottes bâties (genGrotte les y range) */
const GRT_VG={
  formes:['couloir','arc','esse','crochet','zigzag'], /* la forme de la grotte vue de dessus */
  axeMax:150,          /* l'axe ne s'écarte jamais de plus (°) de celui de l'entrée : la grotte ne revient pas sur ses pas */
  part:[.45,1.3],      /* la longueur d'une salle : × sa part d'origine (minimum + étendue), puis le tout ramené à la longueur visée */
  salle:{rh:[.78,.5],up:[.72,.6]}, /* la forme tirée d'une salle : × la demi-largeur, × la voûte (minimum + étendue) */
  styles:[             /* le remplissage d'une salle au sol (a : l'angle d'un virage · k : son rayon × rM · gap : chance, minimum, étendue d'une droite) */
    {nm:'rythme', a:[30,30],k:[1.9,1.0],gap:[.4,20,60]},
    {nm:'grandes',a:[46,34],k:[2.4,.8], gap:[.2,30,50]},
    {nm:'nerveux',a:[30,16],k:[1.6,.4], gap:[.1,20,20]},
    {nm:'balcon', a:[50,22],k:[2.0,.6], gap:[.85,110,90]}],
  tenueMax:[13,16],    /* une tenue dure au plus (s réelles) : au plafond, sur les murs — le reste de la salle se roule au sol, avec ses modules */
  tenues:[.3,.1],      /* la chance que la salle de lave se vive AU PLAFOND · celle de la luxuriante (son lac d'eau) quand elle a une tenue. Les salles sans lac se tiennent SUR LES MURS : sans rien pour dire où est le bas, un plafond ne se voit pas (vérifié en jeu : le boyau à l'envers est le boyau) */
  plafond:{roulis:2.4,mini:3.2,pente:0,penteLave:-.01,rh:60,up:56,dn:40}, /* le retournement (s réelles) dans son tube (demi-largeur, voûte, fond) · la tenue minimum (s réelles) · la pente tenue à l'envers */
  murs:{angle:1,roulis:2,bascule:3,k:2.4,cap:45,min:50,mini:5}, /* la dalle couchée (rad) · le coucher et la bascule d'un mur à l'autre (s réelles) · le rayon (× rM) · le cap visé de part et d'autre de l'axe (°) · l'angle minimum d'un virage (°) */
  toboggan:{amp:.24,t:3.6,rh:54,up:50,dn:38}, /* la pente en plus (÷ KV : à grande vitesse la caisse volerait jusqu'à la voûte), la durée (s de croisière), le tube */
  cascade:{n:3,amp:.19,t:1.7},              /* les marches, leur pente en plus (÷ √KV), la durée d'une marche (s de croisière) */
  spirale:{tours:[1.2,.1],k:[1.75,.3],pente:.18}, /* 1,2-1,3 tour (la grotte repart à ~90°), le rayon (× rM), la pente : ≥ 100 m d'air entre deux tours */
  noeud:{k:[1.6,.25],pente:.16},
  lacets:{pente:.16},
  pente:{mine:.05,luxe:.085,boyau:.12,stal:.13,lave:.03,abysse:.13}, /* la pente de chaque salle au sol (la grotte du 11/11 : 7,5 à 11 %) — la lave reste au ras de son lac */           /* trois quarts de tour : la route repasse SOUS sa propre arrivée (≥ 70 m d'air) */
  parSalle:470};       /* un module tous les 470 m × KV dans une salle au sol */
function grtProfond(s){const v=.5+.5*Math.sin(s*.0069+1.3)*Math.cos(s*.0027+.4);return Math.max(0,Math.min(1,(v-.62)/.28));}
/* long : la longueur · ent : l'entonnoir du puits au-delà de la spirale (m) · voute / bassin / eauP : sa voûte au-dessus du 1er tour, son fond et
   son eau sous le dernier · nzK : l'échelle du bruit de la roche · lacP, eauL : la lave et le lac sous le point le plus bas de leur salle ·
   lavL, geoL : la portée de la lumière de la lave (dans sa salle seulement : la cathédrale voisine virait à l'orange à midi et le soir) et de la géode · torR (tR2, tF), torK : la portée (son carré, sa décroissance) et la taille des torches · fog : le brouillard ·
   cull : la marge des tronçons cachés au-delà du brouillard (la demi-diagonale d'un tronçon) · amb : la lumière de l'air des salles (hors de la
   mine) · fogS (par salle, × fogC), fogN : la couleur de la brume et son départ (la perspective de l'air : une paroi à 300 m se lit dans la
   brume, pas dans le noir — banc du 19/10, quatre réglages comparés sur la même graine : ×2 / ×1,6 / départ ×0,4 retenu, ×2,6 délavait).
   `?grv=amb:2.6,fogC:1.3` : un réglage à l'essai (le banc). */
/* ===== L'ENTRÉE DE LA GROTTE SE LIT (2026-11-12, Sacha : « améliorer les graphismes au global pour la version Vercel sans que ça coûte en performance ») =====
   MESURÉ au banc des graphismes (outils/banc-graphismes, les 500 premiers mètres en TORCHES, CRISTAUX et MAGMA) : un vide NOIR — la route, un pan de roche rougi par un
   cristal, des coulées au plafond, rien d'autre. Deux causes, deux valeurs (rien d'autre ne change, zéro coût par image) :
   · L'AIR DE LA SALLE (`GRV.amb0`, cuit aux sommets au chargement) : les cinq autres salles reçoivent l'air du lieu × GRV.amb (2, depuis la grotte vaste) ; la mine et la
     bouche étaient restées à × 1, le réglage d'un boyau étroit que les torches suffisaient à éclairer. Or l'entrée est vaste elle aussi (GRV.ent, 200 m) : ses parois,
     hors de portée des torches, sortaient sous le seuil des noirs. À × 2,2 la roche brune se devine ; les torches et les éclats restent LA lumière ;
   · LA BRUME DE LA MINE (grtBiomes, `S.mine.fog`) : voulue ambre (« la brume est la couleur de la grotte au loin, jamais un gris »), elle était si sombre que le contraste
     de l'image l'écrasait en noir pur : les parois lointaines s'y perdaient au lieu de s'y découper. Relevée (,135 · ,075 · ,047), elle redevient une braise sombre où
     les silhouettes de la voûte se lisent — la salle a une profondeur. Le NOIR COMPLET (× ,5) reste noir : tes phares, ta seule lumière.
   `?sans=grtentree` = l'image d'avant ; `?grv=amb0:1` = l'air d'avant seul. */
const GRT_ENTREE=!/[?&]sans=([^&]*,)?grtentree(,|&|$)/.test(location.search);
const GRV=GRT_VASTE?{long:1.7,ent:200,voute:300,bassin:190,eauP:170,nzK:2,lacP:70,eauL:60,lavL:85,geoL:110,torR:66,tR2:4356,tF:166,torK:1.7,fog:1.3,cull:170,amb:2,amb0:GRT_ENTREE?2.2:1,fogC:1,fogN:.4,fogS:[1,1.6,1.6,1.6,1.6,2.2]}
  :{long:1,ent:92,voute:150,bassin:112,eauP:96,nzK:1,lacP:48,eauL:44,lavL:38,geoL:70,torR:46,tR2:2100,tF:80,torK:1,fog:1,cull:120,amb:1,amb0:1,fogC:1,fogN:1,fogS:[1,1,1,1,1,1]};
{const m=/[?&]grv=([^&]*)/.exec(location.search);if(m&&GRT_VASTE)for(const kv of decodeURIComponent(m[1]).split(',')){const a=kv.split(':');if(a.length===2&&a[0] in GRV&&!Array.isArray(GRV[a[0]])&&isFinite(+a[1]))GRV[a[0]]=+a[1];}}
/* LES MÉTÉOS — torche : les torches (lumière cuite et flammes) · lieu : la lumière du lieu · amb : le plancher de lumière · lant : la lanterne
   de la caisse · emi : minerais, cristaux, sculk · lav : la lave · part : les poussières · flam : les flammes des torches */
const GRT_MET={
  matin:{torche:1,  lieu:.9,  amb:.05, lant:1,   emi:1,   lav:1,   part:1,   flam:1,  vein:1,   glint:1},
  midi: {torche:.3, lieu:1.3, amb:.042,lant:.95, emi:1.8, lav:1.05,part:1.35,flam:.3, vein:1.4, glint:1.5},
  soir: {torche:.65,lieu:1.15,amb:.055,lant:1,   emi:1.1, lav:1.75,part:1.2, flam:.65,vein:1.1, glint:1.2},
  nuit: {torche:0,  lieu:.55, amb:.014,lant:1.5, emi:.9,  lav:1.2, part:.6,  flam:0,  vein:.7,  glint:.8}};
/* (2026-10-26, Sacha : « la grotte glacée, inspirée de la grotte intérieure de Fight Club ») GLACE : la grotte a gelé — roche bleu glacé, sols givrés, lave et chutes figées (blanc-bleu), torches froides, neige en suspension, un pingouin-totem
   posé au bord de la route ici et là. `ice` (0/1) fond la palette des shaders (uIce) : les quatre autres temps l'ont à 0. */
for(const k in GRT_MET)GRT_MET[k].ice=0;
GRT_MET.glace={torche:.55,lieu:1.25,amb:.06,lant:1.05,emi:1.15,lav:.9,part:1.5,flam:.8,vein:.5,glint:1.9,ice:1};
/* (2026-10-24, embellir) vein : les filons de minerai dans la roche · glint : leur scintillement */
/* ---------------- LA ROUTE : LA DESCENTE DE SALLE EN SALLE ----------------
   Les aides de la balade du volcan (avance, droite, arc, tourne, vers, virages), un AXE qui borne le cap (la route avance toujours), la pente
   par salle (houle douce), les modules. LE PUITS : on se met en travers de l'axe, le centre est DEVANT ; 1¼ tour (±14°) ramène la route dans
   l'axe ; le rayon se resserre de 34 m par tour (le tour d'en dessous est sous le BORD INTÉRIEUR de celui d'au-dessus : on y tombe en sautant
   vers l'intérieur) ; le PAS (58-64 m par tour) laisse > 50 m d'air entre deux tours. */
/* (2026-10-19, session HASARD — Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») LES PROFONDEURS AU HASARD.
   MESURÉ (40 graines, palier 0, l'écart de forme du hasard des maps) : 0,067 — toujours plein nord, toujours la même
   descente : la mine, la grotte luxuriante, le PUITS à 25-29 % du parcours, les stalactites, la lave, les abysses. Désormais chaque grotte tire,
   dans son propre flux (`rh` : un seul tirage `rnd` de plus) :
   · son AXE, dans toutes les directions (sous la terre, aucun soleil ne l'oriente) ;
   · l'ORDRE des quatre salles du milieu — luxuriante, puits de la géode, stalactites, lave — entre la mine (toujours la 1re : la porte qu'on
     reconnaît) et les abysses (toujours la dernière : le noir et la salle du portail) ; jamais la lave contre le puits (son lac ne déborde pas
     dans l'entonnoir : on y saute pour le raccourci), 12 ordres possibles — le puits arrive de ~5 à ~70 % du parcours ;
   · la LONGUEUR de chaque salle (0,6-1,4 × sa part d'avant, puis le tout ramené à la longueur visée) et un CARACTÈRE par salle (`GRT_HUMEURS`,
     ceux de la balade classique ; la salle de lave garde ses grandes courbes) ;
   · LE PUITS : 1¼ tour ± 0,12 (on en ressort jusqu'à ±43° de l'axe : l'AXE suit, borné à ±40° de celui de l'entrée — la grotte ne revient
     jamais sur ses pas), son rayon (+0 à 80 m).
   Le lac de lave ne déborde que dans les stalactites et les abysses (ses voisines d'avant) ; l'eau de la luxuriante, les piliers, les décors
   et la lumière de la lave suivent les salles VOISINES (`R.apres`, `GROTTE.lavLum`) au lieu de l'ordre fixe. Gardés : la mine, la règle d'or,
   le rayon tenable, les modules, le contrôle des croisements. `?sans=hasardgrotte` = la grotte d'avant, tirage pour tirage. */
const GRT_HASARD=!/[?&]sans=([^&]*,)?hasardgrotte(,|&|$)/.test(location.search);
const GRT_DESC=!/[?&]sans=([^&]*,)?grottedesc(,|&|$)/.test(location.search); /* (2026-11-11, LA DESCENTE) voir PENTE, dans grtTrace */
/* LES CARACTÈRES DES SALLES (les profondeurs au hasard) : chacun fixe les virages de la route d'une salle */
const GRT_HUMEURS=[ // a : angle d'un virage (°, minimum + étendue) · t : la part de virages SERRÉS (Rs) · Rk : le rayon des autres (× rM, minimum + étendue ; 0 = Rn) · inv : la chance de changer de côté · dr : [chance d'une droite après, longueur minimum, étendue] (m × KV)
  {nm:'flammes', a:[36,28],t:.33,Rk:0,        inv:1,  dr:[.1,24,30]},  // la balade classique : on louvoie, on revient vers l'axe passé 30°
  {nm:'serpent', a:[46,26],t:.6, Rk:0,        inv:1,  dr:[.02,16,14]}, // des S serrés, presque sans répit
  {nm:'courbes', a:[28,24],t:.1, Rk:[1.9,1.2],inv:.7, dr:[.15,36,50]}, // de grandes courbes qui se prennent à fond
  {nm:'derive',  a:[24,20],t:.25,Rk:[1.5,1.0],inv:.18,dr:[.15,30,40]},  // la plaine part en biais d'un côté, jusqu'à la butée
  {nm:'balcon',  a:[34,24],t:.3, Rk:0,        inv:.6, dr:[.45,60,60]}, // de longues droites cassées de coudes : on voit loin
  {nm:'chicanes',a:[34,18],t:.7, Rk:0,        inv:1,  dr:[.03,16,20]},
  {nm:'epingles',a:[52,22],t:.6, Rk:0,        inv:.9, dr:[.03,16,16]}]; /* (2026-10-25) les droites raccourcies et plus rares, et un caractère de plus : les épingles */// gauche-droite-gauche, vite
function* genGrotte(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais
  CAMPM.length=0;MODMARK.length=0;
  const LV=typeof lvPiste==='function'?lvPiste():1,gr=mulberry32((rnd()*4294967296)>>>0);let best=null;
  const cib9=rythmeCible('grotte'),vP9=typeof vPalier==='function'?vPalier():78,rP9=typeof rayonPalier==='function'?rayonPalier():63,notes9=[]; /* (2026-11-05, LE DIRECTEUR DE RYTHME) l'essai gardé : sans conflit ET le mieux noté (route-rythme.js) */
  for(let e=0;e<6;e++){if(e)yield;const r=grtTrace(gr,LV);r.fiche=rythmeMesure(r.ctrl,{vP:vP9,rP:rP9,marks:r.mods});r.note=rythmeNote(r.fiche,cib9)+r.conflits*20;notes9.push(+r.note.toFixed(1));if(!best||r.note<best.note)best=r;if(!r.conflits&&r.note<=1)break;}
  RYTHME.der={carte:'grotte',note:best.note,notes:notes9,fiche:best.fiche};
  for(const k of ['Q','salles','sTot','conflits','croise','geants','boyaux','vides','formes','noms'])GROTTE[k]=best[k];
  if(GRT_VERTIGE&&best.noms){GRT_VUS.push(best.noms.slice());while(GRT_VUS.length>2)GRT_VUS.shift();} /* (LE VERTIGE) la mémoire des deux dernières grottes */
  for(const m of best.mods||[])MODMARK.push(m);
  return best.ctrl;}
function grtTrace(rnd,LV){
  const vw=70+100*(LV-1),rM=40+.3*vw,KV=Math.sqrt(Math.max(1,vw/78)),ctrl=[],RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DN=[];
  const H9=GRT_HASARD,rh=H9?mulberry32((rnd()*4294967296)>>>0):null; // (LES PROFONDEURS AU HASARD) son flux
  const Rs=()=>rM*(1.30+rnd()*.2),Rn=()=>{const a=rM*1.55,b=Math.max(a+25,200);return a+rnd()*(b-a);},Rl=()=>Math.max(rM*1.6,175)+rnd()*95;
  // LA PENTE (positive = on descend) par salle, une houle douce par-dessus ; les 300 premiers mètres en douceur (le portail d'arrivée)
  const PENTE=GRT_VERTIGE&&GRT_HASARD&&GRT_DESC?GRT_VG.pente:GRT_DESC?{mine:.05,luxe:.075,boyau:.095,stal:.11,lave:.03,abysse:.10}:{mine:.032,luxe:.052,boyau:.045,stal:.062,lave:.024,abysse:.046}; /* (2026-11-11, LA DESCENTE — Sacha : « ça ne descend pas assez ») MESURÉ dans le vrai jeu : 4,4 % de pente moyenne (la règle : ≥ 4 %, tout juste). Les salles sans lac descendent deux fois plus (le boyau, les stalactites, les abysses à 10-11 %) ; la lave reste au ras de son lac, la luxuriante près de son eau. `?sans=grottedesc` : les pentes d'avant. */
  const ph1=rnd()*6.283,ph2=rnd()*6.283;let gF=null,sa='mine',gM=null,gK=false,FV=null; /* (LE VERTIGE) gK : une pente tenue (gF) qui garde la houle d'un module (gM) · FV : le remplissage de la salle */
  const pente=s9=>{if(gF!=null)return gF+(gK&&gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);
    let g=PENTE[sa]+(sa==='mine'?0:sa==='lave'?.012*Math.sin(s9/430*6.283+ph1):.024*Math.sin(s9/520*6.283+ph1)+.012*Math.sin(s9/230*6.283+ph2));
    if(s9<300)g=.008+(g-.008)*THREE.MathUtils.smoothstep(s9,170,300);
    return Math.max(-.03,Math.min(GRT_DESC?.16:.10,g))+(gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);};
  const axe0=H9?(rh()*2-1)*Math.PI:0;let axe=axe0,P=new THREE.Vector3(0,0,0),phi=axe0,s=0,y=0; // l'AXE (au hasard : toutes les directions ; il peut tourner une fois, à la sortie du puits)
  const push=()=>ctrl.push(P.clone());
  const avance=(nx,nz)=>{const dh=Math.hypot(nx-P.x,nz-P.z),n=Math.max(1,Math.ceil(dh/10)),x0=P.x,z0=P.z;
    for(let j=0;j<n;j++){y-=pente(s+dh*(j+.5)/n)*dh/n;DN.push(x0+(nx-x0)*(j+1)/n,y,z0+(nz-z0)*(j+1)/n,s+dh*(j+1)/n);}s+=dh;P.set(nx,y,nz);push();};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi,s:s};};
  const droite=l=>{const nn=GEN_V2?Math.max(1,Math.floor(l/25)):Math.max(2,Math.round(l/25)); /* (LA RÈGLE v2) un point tous les 25 m au plus serré : une droite de 20-50 m = UNE corde, pas de mini-coudes */for(let k=0;k<nn;k++)avance(P.x+Math.sin(phi)*l/nn,P.z+Math.cos(phi)*l/nn);};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;const nx=P.x+Math.sin(phi)*ch,nz=P.z+Math.cos(phi)*ch;phi+=st/2;avance(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  const rel=()=>wrap(phi-axe)*57.2958;
  /* (2026-11-07, LA RÈGLE v2 — « une courbe ou une droite, jamais entre les deux ») gDette : le cap que le recadrage n'a PAS dessiné (briqueRecadre) ; le prochain vrai virage le reprend (briqueDette).
     Plus de mini-arc de 2-15° (trois cordes de quelques mètres : LA douille) : sous 26° on ne dessine rien, au-dessus un vrai virage. */
  let gDette=0;const MINA=30; /* le lobe MESURÉ d'un arc de 26° ne fait que ~22° (l'entrée et la sortie lissées ne comptent pas) : on ne dessine un virage qu'à partir de 30° */
  const LIM=68,tourne=(aDeg,R)=>{const r=rel();let a=aDeg;
    if(GEN_V2){if(gDette){a=briqueDette(a,gDette);gDette=0;}if(r+a>LIM)a=LIM-r;if(r+a<-LIM)a=-LIM-r;
      if(Math.abs(a)<MINA){gDette=Math.abs(a)>=BRIQUE.recadreMin?a:0;return 0;}arc(a,R);return a;}
    if(r+a>LIM)a=LIM-r;if(r+a<-LIM)a=-LIM-r;if(Math.abs(a)>2)arc(a,R);return a;};
  const vers=(cible,R)=>{const a=wrap(axe+cible/57.2958-phi)*57.2958;
    if(GEN_V2){if(Math.abs(a)<MINA){gDette=Math.abs(a)>=BRIQUE.recadreMin?a:0;return;}gDette=0;arc(a,R);return;}
    if(Math.abs(a)>3)arc(a,R);};
  let sg=rnd()<.5?-1:1;
  let HC=null,dvH=1; // (AU HASARD) le CARACTÈRE de la salle (GRT_HUMEURS) et le côté de sa dérive
  // (2026-11-04, Sacha : « la génération de route dans la grotte, c'est trop compliqué — plus simple, plus linéaire, moins de torsion serrée ») :
  // plus de caractères de salle ni de virages serrés — de LONGUES droites et de rares courbes douces (12-26°, grands rayons), toujours ramenées vers l'axe.
  const virages=n=>{for(let k=0;k<n;k++){const r=rel();
    if(GRT_FLOW.on){const F=FV||GRT_FLOW;sg=Math.abs(r)>GRT_FLOW.rel?(r>0?-1:1):-sg;tourne(sg*(F.a[0]+rnd()*F.a[1]),rM*(F.k[0]+rnd()*F.k[1]));if(rnd()<F.gap[0])droite((F.gap[1]+(GEN_V2?5:0)+rnd()*F.gap[2])*KV);continue;} /* (2026-11-05) LA ROUTE À RYTHME */
    sg=Math.abs(r)>16?(r>0?-1:1):-sg;tourne(sg*(12+rnd()*14),Rl());droite((70+rnd()*90)*KV);}};
  const SL=[],salle=k=>{sa=k;SL.push({k:k,p:P.clone(),s:s});};
  // LES MODULES DES PROFONDEURS (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON) : les quatre du volcan, cap borné par l'axe, hasard `rv`
  const rv=mulberry32((rnd()*4294967296)>>>0),MM=[],paq=[];let mLast=-1;
  const gAxe=()=>{if(Math.abs(rel())>20){if(GEN_V2){gDette=wrap(axe+(rel()>0?1:-1)*12/57.2958-phi)*57.2958;} /* (v2) plus d'arc de recadrage : la dette de cap, reprise par le prochain virage */else vers((rel()>0?1:-1)*12,rM*(1.7+rv()*.3));}};
  const gSlalom=()=>{gAxe();const n=4+((rv()*3)|0),a=30+rv()*14,R=rM*(1.6+rv()*.4);let s9=rel()>0?-1:1;tourne(s9*a*.5,R);
    for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);}tourne(-s9*a*.5,R);};
  const gCorde=()=>{const T=90+rv()*25,s9=rel()>0?-1:1,R=rM*(1.6+rv()*.4),a1=T*(.45+rv()*.1);vers(-s9*T/2,rM*(1.7+rv()*.3));droite((30+rv()*30)*KV);
    tourne(s9*a1,R);droite((30+rv()*40)*KV);tourne(s9*(T-a1),Math.max(rM*1.4,R*.9));droite((30+rv()*30)*KV);};
  const gChicane=()=>{gAxe();const a=32+rv()*12,R=rM*(1.3+rv()*.2),s9=rel()>0?-1:1;droite(40*KV);tourne(s9*a,R);tourne(-s9*2*a,R);tourne(s9*a,R);droite(40*KV);};
  const gHoule=()=>{gAxe();const n=2,lam=(280+rv()*60)*KV,amp=.07+rv()*.03,L9=n*lam,s0=s;
    gM={s0:s0,s1:s0+L9,f:function(s9){const u=(s9-s0)/L9;return amp*Math.sin(u*n*6.2832)*Math.min(1,u*n*2,(1-u)*n*2);}};
    let s9=rel()>0?-1:1;tourne(s9*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){s9=-s9;const a=44+rv()*12;tourne(s9*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}tourne(-s9*22,lam*.25/(22/57.2958));gM=null;};
  /* (2026-10-25, SUR LES PAROIS) de nouveaux modules, pour que deux salles ne se ressemblent plus : l'ÉPINGLE (un demi-tour serré puis le retour : un lacet de montagne), les LACETS (la route de col :
     des demi-tours qui s'enchaînent, la route court de travers puis fait demi-tour) et les ESSES larges (de grands S, plus ouverts que le slalom) */
  const gEpingle=()=>{gAxe();const s9=rel()>0?-1:1,a=140+rv()*30,R=rM*(1.15+rv()*.25);droite(30*KV);arc(s9*a,R);droite((16+rv()*26)*KV);arc(-s9*a,R*(1+rv()*.2));droite(24*KV);vers(0,rM*1.8);};
  const gLacets=()=>{gAxe();const n=2+((rv()*2)|0),R=rM*(1.15+rv()*.25);let d=rel()>0?-1:1;arc(d*90,R);for(let k=0;k<n;k++){droite((80+rv()*90)*KV);arc(-d*180,R);d=-d;}droite((60+rv()*50)*KV);arc(-d*90,R);};
  /* LE SAUT DES ABYSSES (2026-11-11, LA DESCENTE — Sacha : « des modules qui permettent de prendre des raccourcis fun et stylés ») : le module à raccourci de la grotte, la signature des abysses (une fois par route).
     Le même geste que LE GRAND SAUT des villes (ville-entree.js) : un virage serré (1,6-1,9 rM, 66-86°) qu'on peut NE PAS PRENDRE — la route d'en bas est posée DANS L'AXE de l'approche, 58-80 m plus bas, sur ~1,35 × la portée,
     en descente de 14 % : qui va tout droit quitte le bord extérieur et s'y pose dans le sens de la marche. La route sage fait la bretelle (demi-tour du même côté) et repasse SOUS le virage (≥ 32 m d'air : un croisement, pas un conflit).
     Les salles sont vastes (200 m de demi-largeur, 170 m de voûte) : le creux de la route d'en bas contient tout le vol, rien à creuser de plus. La pente est tenue par gF (le plan de la bretelle est calculé AVANT de la dessiner).
     À plat pour pisteTord (`plat`) : la chute est calée sur la gravité. `?sans=grottesaut` : les lacets d'avant. */
  const gSaut=()=>{gAxe();gDette=0;const sg9=rel()>0?-1:1,R=rM*(1.6+rv()*.3),th=(66+rv()*20)/57.2958,dh=58+rv()*22,pC=.05,pN=.14,md=a=>((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
    droite(1.3*vw);const A=P.clone(),ph0=phi,ux=Math.sin(ph0),uz=Math.cos(ph0);
    const xS=Math.sqrt(2*RH*R),t0=Math.sqrt(2*dh/15.84),d0=xS+.4*vw*t0,d1=xS+1.75*vw*t0,l1=(40+rv()*40)*KV,rB=R*(1+rv()*.15); /* xS : là où celui qui va tout droit quitte le bord · 15,84 : la gravité du vol (FALL_G × SPD) */
    const cx=A.x+sg9*R*Math.cos(ph0),cz=A.z-sg9*R*Math.sin(ph0),phE=ph0+sg9*th,Ex=cx-sg9*R*Math.cos(phE),Ez=cz+sg9*R*Math.sin(phE),Px=Ex+Math.sin(phE)*l1,Pz=Ez+Math.cos(phE)*l1,Nx=A.x+ux*d0,Nz=A.z+uz*d0;
    const c1x=Px+sg9*rB*Math.cos(phE),c1z=Pz-sg9*rB*Math.sin(phE),c2x=Nx+sg9*rB*Math.cos(ph0),c2z=Nz-sg9*rB*Math.sin(ph0),D=Math.hypot(c2x-c1x,c2z-c1z),hs=Math.atan2(c2x-c1x,c2z-c1z),b1=md(sg9*(hs-phE)),b2=md(sg9*(ph0-hs)),Lb=l1+(b1+b2)*rB+D;
    gF=pC;arc(sg9*th*57.2958,R); // LE VIRAGE SERRÉ
    gF=Math.max(.01,(.75*dh-th*R*pC)/Lb);droite(l1);if(b1>.01)arc(sg9*b1*57.2958,rB);if(D>2)droite(D);if(b2>.01)arc(sg9*b2*57.2958,rB); // LA BRETELLE : elle s'éloigne, fait demi-tour, revient sous le virage
    gF=pN;droite(d1-d0);gF=null;droite(.9*vw); // LA ROUTE D'EN BAS, dans l'axe
    return {g:1,fig:'saut',plat:1};};
  const gEsses=()=>{gAxe();const n=3+((rv()*3)|0),a=56+rv()*12,R=rM*(1.2+rv()*.25);let s9=rel()>0?-1:1;tourne(s9*a*.5,R);for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);droite(((GEN_V2?20:10)+rv()*16)*KV);}tourne(-s9*a*.5,R);};
  const gDouce=()=>{gAxe();const s9=rel()>0?-1:1;droite(60*KV);tourne(s9*20,Rl());droite(80*KV);tourne(-s9*20,Rl());droite(60*KV);}; // un seul module : un S large
  /* LES GÉANTS (2026-11-05, voir GRT_GEANT) : la serpentine de la salle des stalactites. Un virage large par géant (1er : ~44°, les suivants ~88°, de l'un à l'autre côté de l'axe), un stalagmite au centre de chacun.
     Les rayons sont ceux des grandes courbes (≥ 1,7 rM, jamais sous 190 m) ; les droites entre deux virages laissent voir le suivant. Le module n'est PAS dans MJ (il n'est pas tiré au hasard : la salle des stalactites l'a toujours). */
  const GEA=[],gGeants=(n,iZ)=>{gAxe();const i0=iZ!=null?iZ:ctrl.length-1,A=40+rv()*8,Rg=Math.max(rM*1.7,190)+rv()*45;let d=rel()>0?-1:1;
    droite((130+rv()*60)*KV); /* de quoi poser la dalle à l'endroit avant le 1er virage */
    for(let k=0;k<n;k++){const a=wrap(axe+d*A/57.2958-phi)*57.2958,sA=s;arc(a,Rg);GEA.push({s0:sA,s1:s,sg:a>0?1:-1,R:Rg});droite((60+rv()*50)*KV);d=-d;}
    vers(0,Rg);droite(50*KV);MM.push({i0:i0,i1:ctrl.length-1,f:[],calme:1,geant:1});}; /* f:[] : pisteTord tient la dalle à l'endroit sur tout le module (une « figure » sans roulis) */
  /* LE PLONGEON (2026-11-05, Sacha : « vitesse, sensation ») : un grand S qui s'ouvre sur une descente RAIDE (+0,07 de pente sur ~500 m, ~4° de plus) suivie d'une bosse : la route se redresse et la caisse décolle au sommet — un tremplin naturel.
     La pente en plus passe par gM (la houle) ; la longueur du module est calculée d'avance pour que la bosse tombe à la fin. */
  const gPlongeon=()=>{gAxe();const P9=GRT_FLOW.plongeon,s9=rel()>0?-1:1,Rp=Rl(),aP=34,d1=(P9.long[0]*.2+rv()*P9.long[1]*.4)*KV,d2=(P9.long[0]*.25+rv()*P9.long[1]*.4)*KV,L9=d1+Rp*aP/57.2958+d2,s0=s;
    gM={s0:s0,s1:s0+L9,f:function(sx){const u=Math.max(0,Math.min(1,(sx-s0)/L9));return u<.62?P9.amp*Math.sin(Math.PI*u/.62):-.55*P9.amp*Math.sin(Math.PI*(u-.62)/.38);}};
    droite(d1);tourne(s9*aP,Rp);droite(d2);gM=null;};
  /* LA CORNICHE : un grand virage (75-100°) où la dalle se couche d'un quart de tour sur la paroi (le côté extérieur : on rase la roche), tient le virage, puis se redresse — le roulis est SCRIPTÉ (MODMARK.f, comme LE MUR des nuages) */
  const gCorniche=()=>{gAxe();const C9=GRT_FLOW.corniche,sg9=rel()>0?-1:1,Rc=Math.max(rM*C9.k,vw*.85)*(.95+rv()*.25),aC=C9.a[0]+rv()*C9.a[1],dR=Math.max(160,vw*C9.roulis);
    droite(70*KV);const ia=ctrl.length-1;droite(dR);const ib=ctrl.length-1;arc(sg9*aC,Rc);const ic=ctrl.length-1;droite(dR);const id=ctrl.length-1;vers(0,Rc);droite(50*KV); /* le retour à l'axe, dalle à l'endroit */
    return TORD_MOD?{g:1,fig:'corniche',c:[[ia,ib,-sg9*1.45],[ic,id,sg9*1.45]]}:{g:1,fig:'corniche',f:[[ia,ib,-sg9*Math.PI/2],[ic,id,sg9*Math.PI/2]]};}; /* (2026-11-11) c : la dalle se COUCHE à 83° sur la paroi, la route reste un grand virage à plat (voir « 2 ter » dans route-sans-haut.js) */
  /* LE PLAFOND (2026-11-11, LA TORSION EN MODULES — la signature de la salle de LAVE, une fois par route) : 3,4 s de droite pendant lesquelles la route fait un demi-tour sur elle-même et vient se coller
     à la voûte, un S doux pris À L'ENVERS (34° à 2,3 rM, de quoi regarder le lac de lave au-dessus de sa tête : la caverne est creusée du côté de la normale), puis 3,4 s de droite pour revenir, par le
     même côté. Le S est symétrique (½, −1, ½) : pris à l'envers il part de l'autre côté dans le monde, et retombe quand même sur l'axe et sur le cap du plan. */
  const gPlafond=()=>{gAxe();const F9=GRT_FLOW.plafond,sg9=rel()>0?-1:1,sr=rv()<.5?1:-1,Rp=rM*F9.k,dR=Math.max(260,vw*F9.roulis);
    droite(30*KV);const ia=ctrl.length-1;droite(dR);const ib=ctrl.length-1;droite(.3*vw);tourne(sg9*F9.a*.5,Rp);tourne(-sg9*F9.a,Rp);tourne(sg9*F9.a*.5,Rp);droite(.3*vw);const ic=ctrl.length-1;droite(dR);const id=ctrl.length-1;droite(20*KV);
    return {g:1,fig:'plafond',f:[[ia,ib,sr*Math.PI],[ic,id,-sr*Math.PI]]};};
  /* LE BOYAU RAPIDE : un couloir étroit (demi-largeur 70 m, voûte 68 m) presque droit, torches serrées : la roche défile à 30 m du bord de la route. Le creux se resserre dans grtEchantillons (GROTTE.boyaux), la dalle reste à l'endroit */
  const BOY=[],gBoyau=()=>{gAxe();const B9=GRT_FLOW.boyau,s9=rel()>0?-1:1,sA=s;droite((B9.long[0]*.45+rv()*B9.long[1]*.5)*KV);if(GEN_V2)tourne(s9*(28+rv()*8),Rl());else tourne(s9*(10+rv()*8),Rl()*1.4);droite((B9.long[0]*.45+rv()*B9.long[1]*.5)*KV);
    BOY.push({s0:sA,s1:s});return {f:[],calme:1,tunnel:1};};
  /* LE GOUFFRE (2026-11-07, LA GÉNÉRATION DES ROUTES — le module UNIQUE de la grotte, le climax, une fois par route : MODMARK.fig='gouffre') : 2 s de plongeon droit (la pente en plus ×1,7 : +0,12), pendant lequel la dalle se couche sur la paroi
     à 60° (le roulis est SCRIPTÉ : MODMARK.f, la zone est une figure : pisteTord n'y touche pas), le fond en ÉPINGLE de 150° à 1,5 rM (la dalle reste couchée), puis 1,5 s de remontée droite pendant lesquelles elle se redresse.
     La pente en plus passe par gM (ajoutée APRÈS le bornage de `pente` : elle n'est pas bornée à −0,03 ; la remontée est donc franche). Placé au début de la dernière salle du milieu (entre 55 et 75 % de la route). */
  let gouf=false,gouDans='lave';
  const gGouffre=()=>{const sg9=rel()>0?-1:1,Rg=1.5*rM,L1=2*vw,L2=Rg*150/57.2958,L3=1.5*vw,s0=s,i0=ctrl.length-1,A9=.12,sl=1.05;
    gM={s0:s0,s1:s0+L1+L2+L3,f:function(sx){const d=sx-s0;return d<L1?A9*Math.sin(Math.PI*d/L1):d<L1+L2?0:-.9*A9*Math.sin(Math.PI*Math.min(1,(d-L1-L2)/L3));}};
    gDette=0;const ia=ctrl.length-1;droite(.8*vw);const ib=ctrl.length-1;droite(1.2*vw);arc(sg9*150,Rg);const ic=ctrl.length-1;droite(L3);const id=ctrl.length-1;gM=null;
    MM.push(Object.assign({i0:i0,i1:id,nom:'gGouffre',fig:'gouffre',g:1},TORD_MOD?{c:[[ia,ib,-sg9*sl],[ic,id,sg9*sl]]}:{f:[[ia,ib,-sg9*sl],[ic,id,sg9*sl]]})); /* (2026-11-11) c : couchée, sans dérive */
    vers(0,rM*1.7);};
  /* (v2) LE SOUFFLE : une droite franche de 1,8-2,2 s avant chaque module (gMod) ; le gouffre a le sien avant ET après. Le boyau, la corniche et le plongeon s'ouvrent déjà sur 2-5 s de droite : pas de souffle de plus (la droite ferait 6,5 s et plus). */
  const preMod=()=>{if(GEN_V2&&sa===gouDans&&!gouf){gouf=true;droite((1.8+rv()*.35)*vw);gGouffre();droite((1.8+rv()*.35)*vw);}};
  const MJALL={gSlalom:gSlalom,gCorde:gCorde,gChicane:gChicane,gHoule:gHoule,gEsses:gEsses,gDouce:gDouce,gEpingle:gEpingle,gLacets:gLacets,gPlongeon:gPlongeon,gCorniche:gCorniche,gBoyau:gBoyau,gPlafond:gPlafond,gSaut:gSaut};
  const MJ=GRT_FLOW.on?GRT_FLOW.liste.map(function(n){return MJALL[n];}):[gDouce];
  const gMod=sig=>{let m=0,pris9=false;
    if(TORD_MOD&&sig&&GRT_FLOW.on&&(sig==='gCorniche'||sig==='gPlafond'||sig==='gSaut')){mLast=-1;{let n9=0;while(SL.length>1&&s-SL[1].s<300*KV&&n9++<4)virages(1);} /* la 1re salle après la mine : quelques virages d'abord — pisteTord ne roule pas la dalle avant la fin de la mine (f0), la figure y resterait à plat */const i0=ctrl.length-1,e9=MJALL[sig]();MM.push(Object.assign({i0:i0,i1:ctrl.length-1,nom:sig},e9||{}));return;} /* (2026-11-11) les signatures de torsion ne sont pas dans le paquet : jouées directement (elles s'ouvrent sur leur propre droite) */
    if(sig&&GRT_FLOW.on&&MJALL[sig]&&MJ.indexOf(MJALL[sig])>=0&&(mLast<0||MJ[mLast]!==MJALL[sig])){m=MJ.indexOf(MJALL[sig]);pris9=true;} /* (2026-11-05) la signature de la salle */
    for(let e=0;e<6&&!pris9;e++){if(!paq.length){const t=MJ.map(function(_,i){return i;});for(let i=t.length-1;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)paq.push(x);}m=paq.shift();if(mLast<0||MJ[m]!==MJ[mLast])break;}
    mLast=m;if(GEN_V2&&MJ[m]!==gBoyau&&MJ[m]!==gCorniche&&MJ[m]!==gPlongeon)droite((1.8+rv()*.35)*vw);const i0=ctrl.length-1,e9=MJ[m]();MM.push(Object.assign({i0:i0,i1:ctrl.length-1,nom:Object.keys(MJALL).filter(function(k){return MJALL[k]===MJ[m];})[0]},e9||{}));}; /* un module peut rendre de quoi marquer le sien (le roulis scripté de la corniche, le boyau) */
  /* LA PLACE DE CHAQUE SALLE (LA DURÉE DES MAPS, 2026-10-18 — voir DUREE) : l'entrée, la mine, le PUITS (la pièce maîtresse) et la salle du portail
     sont fixes ; les quatre autres salles se partagent le reste de la longueur visée (luxuriante 27 %, stalactites 20 %, lave 30 %, abysses 23 %),
     chacune remplie de virages et d'un module quand il tient (au moins un module dans la map). Hors du JOUER : la longueur pleine (~4,2 km × KV). */
  const LC9=(typeof longueurCible==='function'?longueurCible():0)*GRV.long; // (LA GROTTE VASTE, 19/10 : 1,7 × la longueur visée)
  const KM=Math.sqrt(KV),FIXE=170*KM+330*KM+250*KV,B9=LC9?Math.max(1500,LC9-FIXE):4200*KV*GRV.long; // (2026-10-25 : plus de spirale à réserver — tout le reste va aux salles)
  let nMod=0;
  const remplir=(len,mods,sig)=>{const s0=s;let m=0;while(s-s0<len-70){const r=len-(s-s0);if(m<mods&&(r>430*KV||nMod===0)){preMod();gMod(m===0?sig:null);m++;nMod++;}else virages(1);}};
  // ================= 0 · L'ENTRÉE ET LA MINE =================
  push();salle('mine');ici('depart');droite(bandeL(170*KM,0,3.6));ici('mine0'); /* (2026-11-11) LA BANDE D'ADAPTATION : la grotte, plus sombre et plus étroite, en prend 3,6 s (Sacha : « allonge encore celle de la grotte ») */ // (la mine ne grandit qu'en √KV : c'est un décor qu'on reconnaît, pas un tronçon de vitesse)
  {const a=sg*((GEN_V2?32:24)+rnd()*10);tourne(a,Rn());droite(70*KM);tourne(-a*1.25,Rn());droite(90*KM);tourne(a*.7,Rn());droite(40*KM);}ici('mine1');
  let C=null,b0=0,yH0=0,sH0=0,yH1=0,sH1=0,sgB=1;
  // ================= 1 · LA GROTTE LUXURIANTE =================
  const sLuxe=len=>{salle('luxe');remplir(len,Math.max(1,Math.round(len/(640*KV))),GRT_FLOW.signature.luxe);droite(20*KV);};
  // ================= 2 · LE BOYAU DE CRISTAUX : un tube étroit qui tourne vite =================
  const sBoyau=len=>{salle('boyau');remplir(len,Math.max(1,Math.round(len/(520*KV))),GRT_FLOW.signature.boyau);droite(20*KV);};
  // ================= 3 · LES STALACTITES =================
  const sStal=len=>{salle('stal');const s0=s;
    if(GRT_GEANT.on){const iZ=ctrl.length-1;droite(120*KV);gGeants(Math.max(1,Math.min(GRT_GEANT.nMax,Math.floor((len-600*KV)/430))),iZ);nMod++;remplir(Math.max(0,len-(s-s0)),0);} /* (2026-11-05) LES GÉANTS : le module de la salle ; le reste, de longues droites et de rares courbes */
    else remplir(len,Math.max(1,Math.round(len/(700*KV))));};
  // ================= 4 · LE LAC DE LAVE : de longues courbes au-dessus de la lave =================
  const sLave=len=>{salle('lave');{const s0=s;droite(60*KV);let m=0;
    while(s-s0<len-80){const r=len-(s-s0);if(m<2&&(nMod<2||r>700*KV)&&r>430*KV){preMod();gMod(m===0?GRT_FLOW.signature.lave:null);m++;nMod++;continue;}
      if(GRT_FLOW.on){virages(1);continue;} /* (2026-11-05) LA ROUTE À RYTHME */
      const rr=rel();sg=Math.abs(rr)>20?(rr>0?-1:1):-sg;tourne(sg*(12+rnd()*14),Rl());droite((70+rnd()*90)*KV);}}};
  // ================= 5 · LES ABYSSES =================
  const sAbysse=len=>{salle('abysse');remplir(len,Math.max(nMod?1:2,Math.round(len/(700*KV))),GRT_FLOW.signature.abysse);if(!nMod){gMod();nMod++;}}; // (au moins un module dans la map)
  let HZ=null;
  /* ================= LE VERTIGE (2026-11-12, voir GRT_VG) : le plan, les passages, les tenues, les modules de plus ================= */
  const VG=GRT_VERTIGE&&H9,V9=GRT_VG,VID=[],FOR={},NOMS=[],sm9=THREE.MathUtils.smoothstep;
  const EL=1.8-.8*Math.min(1,Math.max(0,(vw-78)/330)),sec=t=>t*EL*vw; /* la longueur (m) de t secondes RÉELLES : la caisse roule à ~1,8 × la croisière au palier 0, à la croisière passé le palier 25 (DUREE_ELAN) */
  let axeTot=0; /* de combien l'axe a tourné depuis l'entrée (°) */
  const tube=(sA,sB,f)=>{BOY.push({s0:sA,s1:sB,f:f});},vide=(sA,sB)=>{VID.push({s0:sA,s1:sB});};
  const marque=(i0,nom,e)=>{MM.push(Object.assign({i0:i0,i1:ctrl.length-1,nom:nom},e||{}));NOMS.push(nom);};
  const axeDe=p=>{axeTot+=wrap(p-axe)*57.2958;axe=p;}; /* l'axe suit la sortie d'un passage qui tourne (la spirale, le nœud) */
  const sensV=()=>Math.abs(axeTot)>50?(axeTot>0?-1:1):(rv()<.5?-1:1); /* le sens d'un passage qui tourne : celui qui ramène la grotte vers son axe d'entrée */
  /* ---------- LES PASSAGES : on change de salle en descendant ---------- */
  /* LE TOBOGGAN : un tube étroit où la route plonge (jusqu'à +0,24 de pente, ~30 % en tout), une courbe large au milieu une fois sur deux, et l'on débouche en haut de la salle suivante. La pente monte sur 42 % du tube :
     une crête plus sèche ferait décoller la caisse jusqu'à la voûte (la roche tue en vol). */
  const pToboggan=()=>{const T9=V9.toboggan,i0=ctrl.length-1,amp=T9.amp/KV,L1=T9.t*vw,d=rel()>0?-1:1;gDette=0;
    droite(.5*vw);const sA=s,sB=sA+L1;
    gM={s0:sA,s1:sB,f:function(sx){const u=(sx-sA)/L1;return amp*sm9(u,0,.42)*(1-sm9(u,.78,1));}};
    droite(L1*.4);if(rv()<.6)arc(d*(31+rv()*9),Math.max(Rl(),rM*2.4));else droite(L1*.2);droite(Math.max(20,sB-s));gM=null;
    tube(sA-.2*vw,sB-.2*vw,{rh:T9.rh,up:T9.up*Math.sqrt(KV),dn:T9.dn});droite(.7*vw);
    marque(i0,'pToboggan',{fig:'toboggan',tunnel:1});};
  /* LA CASCADE : trois marches en ligne droite — chacune plonge puis se redresse en tremplin : on vole de marche en marche, le vide ouvert dessous */
  const pCascade=()=>{const C9=V9.cascade,i0=ctrl.length-1,Lp=C9.t*vw,amp=C9.amp/Math.sqrt(KV);gDette=0;droite(.4*vw);const sA=s;
    gM={s0:sA,s1:sA+C9.n*Lp,f:function(sx){const u=((sx-sA)/Lp)%1;return u<.58?amp*Math.sin(Math.PI*u/.58):-.5*amp*Math.sin(Math.PI*(u-.58)/.42);}};
    droite(C9.n*Lp);gM=null;vide(sA,s);droite(.5*vw);marque(i0,'pCascade',{fig:'cascade'});};
  /* LA SPIRALE : 1,2-1,3 tour autour d'un vide, 15 % de pente (≥ 100 m d'air d'un tour à l'autre : on coupe en sautant par l'intérieur) ; la grotte repart à ~90° de là où elle arrivait */
  const pSpirale=()=>{const S9=V9.spirale,i0=ctrl.length-1,sg9=sensV(),R=rM*(S9.k[0]+rv()*S9.k[1]),T=S9.tours[0]+rv()*S9.tours[1];gDette=0;
    droite(.6*vw);const sA=s;gF=S9.pente;arc(sg9*T*360,R);gF=null;vide(sA-60,s+60);axeDe(phi);droite(.8*vw);marque(i0,'pSpirale',{g:1,fig:'spirale'});};
  /* LE NŒUD : trois quarts de tour en descente — la route repasse SOUS sa propre arrivée, qu'on voit au-dessus de soi (et d'où l'on peut sauter) */
  const pNoeud=()=>{const N9=V9.noeud,i0=ctrl.length-1,sg9=-sensV() /* trois quarts de tour d'un côté = un quart de l'autre : le sens qui ramène vers l'axe est l'opposé */,R=rM*(N9.k[0]+rv()*N9.k[1]);gDette=0;
    droite(R+.9*vw);const sA=s;gF=N9.pente;arc(sg9*270,R);droite(R+.5*vw);gF=null;vide(sA-R,s);axeDe(phi);droite(.5*vw);marque(i0,'pNoeud',{g:1,fig:'noeud'});};
  const pSaut=()=>{const i0=ctrl.length-1,e9=gSaut();marque(i0,'pSaut',e9);};
  const pGouffre=()=>{gouf=true;droite((1.8+rv()*.35)*vw);gGouffre();NOMS.push('pGouffre');droite((1.2+rv()*.3)*vw);};
  const PASS={pToboggan:pToboggan,pCascade:pCascade,pSpirale:pSpirale,pNoeud:pNoeud,pSaut:pSaut,pGouffre:pGouffre};
  /* ---------- LES TENUES : une salle vécue ailleurs qu'au sol ---------- */
  /* les motifs d'une tenue AU PLAFOND : chacun rend le cap qu'il a pris (la somme de ses virages est nulle). Il le faut : la route retournée part de l'autre côté dans le monde, et le retournement de sortie ne la
     remet sur son plan que si elle en sort PARALLÈLE à son entrée (la suite n'est alors que décalée de côté, pas tournée). */
  const hS=()=>{const d=rv()<.5?-1:1,a=36+rv()*10,R=rM*(2+rv()*.5);arc(d*a*.5,R);arc(-d*a,R);arc(d*a*.5,R);};
  const hSlalom=()=>{const n=3+((rv()*3)|0),a=32+rv()*8,R=rM*(1.7+rv()*.3);let d=rv()<.5?-1:1;arc(d*a*.5,R);for(let k=0;k<n;k++){d=-d;arc(d*a,R);}arc(-d*a*.5,R);};
  const hChicane=()=>{const d=rv()<.5?-1:1,a=30+rv()*8,R=rM*(1.4+rv()*.2);arc(d*a,R);arc(-d*2*a,R);arc(d*a,R);};
  const hHoule=()=>{const lam=(170+rv()*40)*KV,amp=.06+rv()*.025,s0=s,L9=2*lam;gM={s0:s0,s1:s0+L9,f:function(sx){const u=(sx-s0)/L9;return amp*Math.sin(u*4*Math.PI)*Math.min(1,u*4,(1-u)*4);}};droite(L9);gM=null;};
  const hGrand=()=>{const d=rv()<.5?-1:1,a=52+rv()*14,R=rM*(2.3+rv()*.5);arc(d*a,R);droite((.5+rv()*.4)*vw);arc(-d*a,R);};
  const HOLD=[hS,hSlalom,hChicane,hHoule,hGrand],HOLDN=['S','slalom','chicane','houle','grand'];
  /* LA TENUE AU PLAFOND : un tube, la route s'y retourne (un demi-tour en `roulis` s réelles, sans horizon : la roche tourne avec la dalle) ; on débouche la tête en bas dans la salle — le lac, s'il y en a un, au-dessus
     de soi — et l'on y roule (les motifs ci-dessus) jusqu'au tube de sortie, où la route se remet à l'endroit par le même côté. La pente est TENUE (la même à l'entrée et à la sortie). */
  const tenuePlafond=len=>{const P9=V9.plafond,sr=rv()<.5?1:-1,dR=Math.max(260,sec(P9.roulis),3.4*vw),T9={rh:P9.rh,up:P9.up,dn:P9.dn},dedans=[];gDette=0;
    droite(.5*vw);gF=sa==='lave'?P9.penteLave:P9.pente;gK=true;const ia=ctrl.length-1,sA=s;droite(dR);const ib=ctrl.length-1;tube(sA-.4*vw,s-.1*dR,T9);droite(.5*vw);
    const s0=s,L9=Math.max(sec(P9.mini),len-2*dR-2.6*vw);let der=-1;
    while(s-s0<L9){let m=(rv()*HOLD.length)|0;if(m===der)m=(m+1)%HOLD.length;der=m;HOLD[m]();dedans.push(HOLDN[m]);droite((.5+rv()*.5)*vw);}
    const ic=ctrl.length-1,sC=s;droite(dR);const id=ctrl.length-1;tube(sC+.1*dR,s+.4*vw,T9);gF=null;gK=false;droite(.6*vw);
    MM.push({i0:ia,i1:id,nom:'vPlafond',fig:'plafond',g:1,dedans:dedans,f:[[ia,ib,sr*Math.PI],[ic,id,-sr*Math.PI]]});NOMS.push('vPlafond');};
  /* LA TENUE SUR LES MURS : de grands virages de vélodrome — la dalle se couche à 72° sur la paroi, vers l'INTÉRIEUR du virage (jamais l'inverse : pris par l'extérieur, le virage serait une crête et la caisse décollerait),
     tient tout le virage, puis bascule d'un mur à l'autre dans la droite qui suit. La route garde son tracé (MODMARK.c) : c'est la roche qui passe d'un côté à l'autre. */
  const tenueMurs=len=>{const W9=V9.murs,B=W9.angle,dR=Math.max(170,sec(W9.roulis)),dS=Math.max(240,sec(W9.bascule)),ev=[];gDette=0;
    let d=rel()>0?-1:1;droite(.4*vw);const i0=ctrl.length-1;gF=PENTE[sa];let ia=ctrl.length-1;droite(dR);ev.push([ia,ctrl.length-1,-d*B]);
    const Rw=()=>Math.max(rM*W9.k,vw*.85)*(.95+rv()*.25),n=Math.max(1,Math.min(5,Math.round((len-2*dR)/(Math.max(rM*W9.k,vw*.85)*1.5+dS))));
    for(let k=0;k<n;k++){let a=d*W9.cap-rel();if(a*d<W9.min)a=d*W9.min;arc(a,Rw());
      if(k<n-1){ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,2*d*B]);d=-d;}}
    ia=ctrl.length-1;droite(dR);ev.push([ia,ctrl.length-1,d*B]);gF=null;droite(.4*vw);
    MM.push({i0:i0,i1:ctrl.length-1,nom:'vMurs',fig:'murs',g:1,n:n,c:ev});NOMS.push('vMurs');};
  /* ---------- LES MODULES DE PLUS (les salles au sol) ---------- */
  /* LE SERPENT : des esses dont l'amplitude ENFLE puis retombe (30 → 58 → 38°) : on se laisse prendre au rythme */
  const gSerpent=()=>{gAxe();const A=[32,40,50,58,48,38],n=4+((rv()*3)|0),R=rM*(1.5+rv()*.3);let d=rel()>0?-1:1;tourne(d*30,R);for(let k=0;k<n;k++){d=-d;tourne(d*A[k],R);droite((16+rv()*14)*KV);}};
  /* L'ENTONNOIR : un seul virage qui se RESSERRE (trois arcs du même côté, 2,6 → 1,9 → 1,35 rM, 135-150° en tout), puis la route se déroule vers l'axe : la roche se rapproche à mesure qu'on tourne */
  const gEntonnoir=()=>{gAxe();const d=rel()>0?-1:1,a=45+rv()*5;vers(-d*38,rM*2.2);droite(30*KV);arc(d*a,rM*2.6);arc(d*a,rM*1.9);arc(d*a,rM*1.35);droite((20+rv()*20)*KV);vers(0,rM*1.9);};
  /* LA FAILLE : une fente haute et étroite (48 m de demi-largeur, 170 m de voûte), un S rapide dedans : les deux parois filent au ras de la route */
  const gFaille=()=>{gAxe();const d=rel()>0?-1:1,a=34+rv()*6,R=rM*(1.5+rv()*.2),sA=s;droite(.7*vw);arc(d*a,R);arc(-d*2*a,R);arc(d*a,R);droite(.7*vw);
    tube(sA,s,{rh:48,up:170,dn:70});return {f:[],calme:1,tunnel:1,fig:'faille'};};
  /* LES MONTAGNES RUSSES : trois bosses en ligne droite, plus sèches que la houle : on décolle à chaque sommet */
  const gRusses=()=>{gAxe();const lam=(150+rv()*40)*KV,amp=(.1+rv()*.03)/Math.sqrt(KV),s0=s,L9=3*lam;
    gM={s0:s0,s1:s0+L9,f:function(sx){const u=(sx-s0)/L9;return amp*Math.sin(u*6*Math.PI)*Math.min(1,u*6,(1-u)*6);}};droite(L9);gM=null;return {fig:'russes'};};
  /* LE BALCON : un très long virage (110-135°, 2,7-3,1 rM) au bord du vide — le fond de la salle s'ouvre en entier sous la route */
  const gBalcon=()=>{gAxe();const d=rel()>0?-1:1,sA=s;vers(-d*58,rM*2.2);droite(40*KV);arc(d*(110+rv()*25),rM*(2.7+rv()*.4));droite(40*KV);vide(sA,s);return {g:1,fig:'balcon'};};
  /* LE SURF : trois grands virages alternés (65-80°, 2,2 rM), la dalle couchée à 52° vers l'intérieur de chacun : on monte sur une paroi, puis sur l'autre */
  const gSurf=()=>{gAxe();const B=.9,dS=Math.max(180,sec(1.3)),ev=[];let d=rel()>0?-1:1,ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,-d*B]);
    for(let k=0;k<3;k++){let a=d*38-rel();if(a*d<50)a=d*50;arc(a,rM*(2.2+rv()*.3));if(k<2){ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,2*d*B]);d=-d;}}
    ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,d*B]);return {g:1,fig:'surf',c:ev};};
  /* LA PASSERELLE : 2,6-3,2 s de droite au-dessus du vide ouvert, un virage large au bout : la vitesse pure, et l'on voit le fond */
  const gPasserelle=()=>{gAxe();const d=rel()>0?-1:1,sA=s;droite((2.6+rv()*.6)*vw);vide(sA-40,s+40);tourne(d*(34+rv()*14),Rl());return {fig:'passerelle'};};
  /* ===== DES GROTTES PLUS FACILES À LIRE (2026-11-13, Sacha : « rajoute des modules ; on voit trop souvent celui où on passe près du lac ; il y a trop le concept d'endroit et envers — les murs peuvent
     longer n'importe quelle paroi sans être trop torsadés, on se demande souvent si on est à l'endroit ou à l'envers ; enlève le module avec 3 virages très serrés, ça ralentit trop ») =====
     MESURÉ avant (12 grottes, palier 0) : la tenue au plafond dans 10 grottes sur 12 (la salle de lave l'avait 7 fois sur 10, et une tenue sur les murs sinon : le lac était TOUJOURS traversé couché),
     13 % de la route à l'envers, les lacets dans 7 grottes sur 12 (deux épingles et deux quarts de tour : la caisse tombe à la vitesse du rayon). Maintenant :
     · plus de LACETS, plus d'ÉPINGLE (les virages serrés) ; plus de CORNICHE (83° de coucher) ni de PLAFOND dans les modules tirés ;
     · UNE tenue par grotte (deux sur 40 % des grandes), dans une salle TIRÉE parmi les quatre ; le plafond n'est plus que 3 fois sur 10 dans la salle de lave, 1 fois sur 10 dans la luxuriante, jamais ailleurs ;
     · le coucher sur les murs est plus doux (57° au lieu de 72°, 2 s pour se coucher, 3 s pour passer d'un mur à l'autre) ;
     · quatre modules de plus, où la dalle suit une paroi SANS se retourner : le VIRAGE RELEVÉ, le FLANC, les ONDES et la GORGE. */
  /* LE VIRAGE RELEVÉ : UN grand virage (2,3-2,8 rM, 60-90°) où la dalle se couche d'un demi-quart de tour vers l'intérieur — on roule sur la paroi du virage, comme dans un vélodrome — puis se remet à plat */
  const gReleve=()=>{gAxe();const B=.75+rv()*.2,dS=Math.max(170,sec(1.5)),d=rel()>0?-1:1,ev=[];let ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,-d*B]);
    let a=d*55-rel();if(a*d<60)a=d*60;arc(a,rM*(2.3+rv()*.5));ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,d*B]);return {g:1,fig:'releve',c:ev};};
  /* LE FLANC : 2-3 grands virages alternés (2,5-2,9 rM) où la dalle ne se couche que de 31-37° : on glisse d'une paroi à l'autre, lentement (2,2 s pour passer de l'une à l'autre), sans jamais approcher l'envers */
  const gFlanc=()=>{gAxe();const B=.55+rv()*.1,dS=Math.max(240,sec(2.2)),n=2+((rv()*2)|0),ev=[];let d=rel()>0?-1:1,ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,-d*B]);
    for(let k=0;k<n;k++){let a=d*34-rel();if(a*d<44)a=d*44;arc(a,rM*(2.5+rv()*.4));if(k<n-1){ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,2*d*B]);d=-d;}}
    ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,d*B]);return {g:1,fig:'flanc',c:ev};};
  /* LES ONDES : un S large (30-40°, 2,1-2,4 rM) pris sur deux bosses douces — la route monte et redescend en tournant, on décolle à peine : de la vague, à plat */
  const gOndes=()=>{gAxe();const d=rv()<.5?-1:1,a=30+rv()*10,R=rM*(2.1+rv()*.3),amp=.055+rv()*.02,s0=s,L9=R*2*a/57.2958;
    gM={s0:s0,s1:s0+L9,f:function(sx){const u=(sx-s0)/L9;return amp*Math.sin(u*4*Math.PI)*Math.min(1,u*4,(1-u)*4);}};
    arc(d*a*.5,R);arc(-d*a,R);arc(d*a*.5,R);gM=null;return {g:1,fig:'ondes'};};
  /* LA GORGE : le virage relevé pris dans un couloir étroit (58 m de demi-largeur, 120 m de voûte) — la paroi défile tout près, la dalle couchée dessus */
  const gGorge=()=>{const sA=s,e9=gReleve();tube(sA,s,{rh:58,up:120,dn:56});return Object.assign(e9,{fig:'gorge',tunnel:1});};
  const MODV={gSlalom:gSlalom,gChicane:gChicane,gHoule:gHoule,gEsses:gEsses,gCorde:gCorde,gPlongeon:gPlongeon,gBoyau:gBoyau,
    gSerpent:gSerpent,gEntonnoir:gEntonnoir,gFaille:gFaille,gRusses:gRusses,gBalcon:gBalcon,gSurf:gSurf,gPasserelle:gPasserelle,gReleve:gReleve,gFlanc:gFlanc,gOndes:gOndes,gGorge:gGorge};
  const SANS_SOUFFLE={gBoyau:1,gCorniche:1,gPlongeon:1,gPlafond:1,gFaille:1,gRusses:1,gSurf:1,gPasserelle:1,gReleve:1,gFlanc:1,gGorge:1}; /* ceux qui s'ouvrent déjà sur leur propre droite */
  /* LE PAQUET SANS REDITE : battu au hasard, ce qu'on a vu dans les deux dernières grottes (GRT_VUS) passe derrière */
  const paquet=noms=>{const t=noms.slice();for(let i=t.length-1;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}
    const vu=n9=>GRT_VUS.some(function(L9){return L9.indexOf(n9)>=0;});return t.filter(function(n9){return !vu(n9);}).concat(t.filter(vu));};
  let DM=[];
  const modV=()=>{for(let e=0;e<3;e++){if(!DM.length){virages(2);return;}const nom=DM.shift();if(!SANS_SOUFFLE[nom])droite((1.8+rv()*.35)*vw);const i0=ctrl.length-1,sA=s,e9=MODV[nom]();
      if(s-sA<1.5*vw&&!(e9&&(e9.g||e9.f||e9.c)))continue; /* un module que le bornage du cap a vidé (ses virages rabotés par la butée de l'axe) ne compte pas : on tire le suivant */
      marque(i0,nom,e9);return;}};
  const corpsSol=len=>{const s0=s;let m=0;const nm=Math.max(1,Math.round(len/(V9.parSalle*KV)));while(s-s0<len-70){const r=len-(s-s0);if(m<nm&&r>430*KV){modV();m++;nMod++;}else virages(1);}};
  /* ---------- LE PLAN DE LA GROTTE ---------- */
  const planVertige=()=>{
    const ORD=['luxe','boyau','stal','lave'];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=ORD[i];ORD[i]=ORD[j];ORD[j]=x;}
    const PART={luxe:.25,boyau:.15,stal:.2,lave:.26,abysse:.14};let sp=0;for(const k in PART){PART[k]*=V9.part[0]+V9.part[1]*rh();sp+=PART[k];}for(const k in PART)PART[k]/=sp;
    const Tvw=B9/vw,nPass=Tvw>=95?(rh()<.5?4:3):Tvw>=60?3:Tvw>=36?2:1,nTen=Tvw>=55?(rh()<.4?2:1):(rh()<.7?1:0); /* le budget, en secondes de croisière : une grotte du palier 25 dure quatre fois moins que celle du palier 0 */
    /* les TENUES : la salle de lave au plafond 7 fois sur 10, puis d'autres salles, au plafond ou sur les murs ; une salle trop courte pour sa tenue est allongée */
    const ASS={},cand=ORD.slice();{let nT=nTen;while(nT>0&&cand.length){const k=cand.splice((rh()*cand.length)|0,1)[0]; /* (2026-11-13) la salle d'une tenue est TIRÉE parmi les quatre : avant, la salle de lave (le lac) l'avait presque toujours */
        ASS[k]=(k==='lave'&&rh()<V9.tenues[0])||(k==='luxe'&&rh()<V9.tenues[1])?'plafond':'murs';nT--;}}
    const besoin=k=>ASS[k]==='plafond'?2*Math.max(260,sec(V9.plafond.roulis),3.4*vw)+sec(V9.plafond.mini)+4*vw:ASS[k]==='murs'?2*Math.max(170,sec(V9.murs.roulis))+sec(V9.murs.mini)+3*vw:0;
    {let dette9=0,libre=0;for(const k in PART){const b=(besoin(k)+(k==='abysse'?0:4*vw))/B9;if(b>PART[k]){dette9+=b-PART[k];PART[k]=b;}else libre+=PART[k]-b*.5;}
      if(dette9>0&&libre>0)for(const k in PART)if(!besoin(k)){PART[k]*=Math.max(.35,1-dette9/libre);}}
    /* la FORME : les coudes de l'axe aux cinq frontières */
    const fo=V9.formes[(rh()*V9.formes.length)|0],sgF=rh()<.5?-1:1,jC=1+((rh()*3)|0),COU=[];
    for(let j=0;j<5;j++)COU.push(fo==='couloir'?(rh()*2-1)*18:fo==='arc'?sgF*(28+rh()*24):fo==='esse'?(j<2?1:j<4?-1:1)*sgF*(34+rh()*24):fo==='crochet'?(j===jC?sgF*(85+rh()*30):(rh()*2-1)*16):(j%2?1:-1)*sgF*(48+rh()*26));
    /* les PASSAGES : sans redite ; jamais le saut ni le gouffre à la sortie de la mine (pisteTord ne tient pas encore la dalle : leur vol et leur coucher y seraient faussés) */
    const PQ=paquet(Object.keys(PASS)),PJ=[null,null,null,null,null];{const fr=[1,2,3,4];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=fr[i];fr[i]=fr[j];fr[j]=x;}
      const ou=fr.slice(0,nPass-1).concat([0]);for(const j of ou){let q=0;if(j===0)while(q<PQ.length&&(PQ[q]==='pSaut'||PQ[q]==='pGouffre'))q++;if(q<PQ.length)PJ[j]=PQ.splice(q,1)[0];}}
    DM=paquet(Object.keys(MODV));
    const stl=[0,1,2,3];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=stl[i];stl[i]=stl[j];stl[j]=x;}
    const HU={},frontiere=(j,k)=>{let d=COU[j];if(Math.abs(axeTot+d)>V9.axeMax)d=-d;salle(k);
      if(PJ[j]==='pSpirale'||PJ[j]==='pNoeud')PASS[PJ[j]](); /* ils tournent d'eux-mêmes : l'axe suit leur sortie */
      else{axe+=d/57.2958;axeTot+=d;{const a=wrap(axe-phi)*57.2958;if(Math.abs(a)>=MINA){gDette=0;arc(a,rM*(1.9+rv()*.5));}else gDette=Math.abs(a)>=BRIQUE.recadreMin?a:0;}
        if(PJ[j])PASS[PJ[j]]();}};
    let fin9=s; /* la fin VISÉE de la salle en cours : un passage ou une tenue qui déborde est repris sur les salles suivantes — la grotte garde la longueur visée (LA DURÉE DES MAPS) */
    const piece=(j,k)=>{const s0=s,len=B9*PART[k];fin9+=len;FV=V9.styles[stl[j%4]];HU[k]=FV.nm;if(k!=='abysse')FOR[k]={rh:V9.salle.rh[0]+rh()*V9.salle.rh[1],up:V9.salle.up[0]+rh()*V9.salle.up[1]};
      frontiere(j,k);const reste=fin9-s;
      if(ASS[k]&&(reste>=besoin(k)-3*vw||fin9-s+B9*.12>=besoin(k))){const pl=ASS[k]==='plafond',lt=Math.min(Math.max(reste,besoin(k)-3*vw)-1.5*vw, /* la TENUE passe avant le remplissage : s'il lui manque moins de 12 % de la grotte, elle se joue quand même et les salles suivantes rendent la longueur */sec(V9.tenueMax[pl?0:1])+(pl?2*Math.max(260,sec(V9.plafond.roulis),3.4*vw)+2.6*vw:0));if(pl)tenuePlafond(lt);else tenueMurs(lt);
        const r9=fin9-s;if(r9>500*KV)corpsSol(r9);else virages(1);}
      else{if(ASS[k])ASS[k]='sol';if(reste>250*KV)corpsSol(reste);else virages(1);}
      droite(20*KV);};
    for(let j=0;j<4;j++)piece(j,ORD[j]);
    piece(4,'abysse');FV=null;if(!nMod){modV();nMod++;}
    HZ={axe:axe0,coude:Math.round(axeTot),forme:fo,ordre:['mine'].concat(ORD,['abysse']),assiettes:ORD.map(function(k){return k+':'+(ASS[k]||'sol');}).join(' '),passages:PJ.map(function(p){return p||'-';}).join(' '),humeurs:HU,
      parts:Object.keys(PART).map(function(k){return k+':'+Math.round(PART[k]*100);}).join(' '),budget:Math.round(Tvw)};};
  if(VG)planVertige();
  else if(!H9){sLuxe(B9*.25);sBoyau(B9*.15);sStal(B9*.2);sLave(B9*.26);sAbysse(B9*.14);}
  else{ /* LES PROFONDEURS AU HASARD (voir GRT_HASARD) : l'ordre des quatre salles du milieu (jamais la lave contre le puits), leurs longueurs, leurs caractères */
    const ORD=['luxe','boyau','stal','lave'];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=ORD[i];ORD[i]=ORD[j];ORD[j]=x;}
    const PART={luxe:.25,boyau:.15,stal:.2,lave:.26,abysse:.14};let sp=0;for(const k in PART){PART[k]*=.6+.8*rh();sp+=PART[k];}for(const k in PART)PART[k]/=sp;
    let hPrec=-1;const humeur=()=>{let i=(rh()*GRT_HUMEURS.length)|0;if(i===hPrec)i=(i+1+((rh()*(GRT_HUMEURS.length-1))|0))%GRT_HUMEURS.length;hPrec=i;return GRT_HUMEURS[i];};
    const HU={},car=k=>{HC=humeur();dvH=rh()<.5?-1:1;HU[k]=HC.nm;};
    gouDans=ORD[3];
    for(const k of ORD){if(k==='luxe'){car(k);sLuxe(B9*PART.luxe);}else if(k==='boyau'){HC=GRT_HUMEURS[rh()<.5?1:5];dvH=rh()<.5?-1:1;HU.boyau=HC.nm;sBoyau(B9*PART.boyau);}else if(k==='stal'){car(k);sStal(B9*PART.stal);}else{HC=null;sLave(B9*PART.lave);}}
        if(GEN_V2&&!gouf){gouf=true;droite((1.8+rv()*.35)*vw);gGouffre();droite((1.8+rv()*.35)*vw);} /* (v2) le gouffre n'a pas trouvé sa place : avant les abysses */
        car('abysse');sAbysse(B9*PART.abysse);HC=null;
    HZ={axe:axe0,coude:0,ordre:['mine'].concat(ORD,['abysse']),humeurs:HU,parts:Object.keys(PART).map(function(k){return k+':'+Math.round(PART[k]*100);}).join(' ')};}
  droite(90*KV);ici('fin');SL.push({k:'fin',p:P.clone(),s:s});droite(150*KV); // la salle du portail
  // LE CONTRÔLE DES CROISEMENTS (celui du volcan) : un passage à moins de 2·RH+14 m d'un autre tronçon ; avec moins de 32 m d'air = un CONFLIT
  let conflits=0,croise=0;{const G=new Map(),n=DN.length/4,cle=(x,z)=>Math.floor(x/40)+','+Math.floor(z/40),vu=new Set();
    for(let i=0;i<n;i++){const k=cle(DN[i*4],DN[i*4+2]);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
    for(let i=0;i<n;i+=2){const x=DN[i*4],yy=DN[i*4+1],z=DN[i*4+2],si=DN[i*4+3],bx=Math.floor(x/40),bz=Math.floor(z/40);
      for(let a9=-2;a9<=2;a9++)for(let b9=-2;b9<=2;b9++){const L9=G.get((bx+a9)+','+(bz+b9));if(!L9)continue;
        for(const j of L9){const sj=DN[j*4+3];if(sj-si<300)continue;const dh=Math.hypot(DN[j*4]-x,DN[j*4+2]-z);if(dh>2*RH+14)continue;
          const t=Math.round(si/150)+':'+Math.round(sj/150);if(vu.has(t))continue;vu.add(t);if(Math.abs(yy-DN[j*4+1])<32)conflits++;else croise++;}}}}
  if(HZ)Q.hasard=HZ;
  return {ctrl:ctrl,Q:Q,salles:SL,conflits:conflits,croise:croise,mods:MM,sTot:s,geants:GEA,boyaux:BOY,vides:VID,formes:FOR,noms:VG?NOMS:null};
}
/* ---------------- LA ROCHE : un CHAMP DE DENSITÉ creusé autour de la route ----------------
   (2026-10-18, Sacha, au premier banc : « non, arrête, ça fait pas Minecraft — je veux une grotte, les biomes de grotte de Minecraft, mais avec la
   MÊME DA que les autres maps ») — plus de cubes ni de texture pixel : la roche est une surface LOW-POLY À FACETTES, comme les pics du glacier et
   le cône du volcan. Une grille de 8 m (`GRT.B`, 12 m pour LA GROTTE VASTE) en tronçons de 16³ cases, alloués seulement là où la route creuse : `pool` (0 roche, 1 air,
   4 lave, 5 eau) et `dn` (la DENSITÉ, ~ la distance signée à la paroi × 1,6 : > 0 dans l'air) ; la surface en est tirée par « surface nets »
   (un sommet par cube traversé, les facettes sont des quads de ~8 m). Par tronçon, 64 sous-cubes de 32 m gardent l'échantillon de route le plus
   proche (`si`) : la salle d'un point et son abscisse s'en déduisent. `chS` : le premier échantillon qui a creusé le tronçon (l'ordre de construction). */
const GRT={B:GRT_VASTE?12:8,K:1.6}; // K : la densité par mètre — (LA GROTTE VASTE, 19/10) des cases de 12 m
function grtH3(i,j,k,s){let h=Math.imul(i|0,374761393)+Math.imul(j|0,668265263)+Math.imul(k|0,1274126177)+Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function grtN3(x,y,z,s){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const a=grtH3(i,j,k,s),b=grtH3(i+1,j,k,s),c=grtH3(i,j+1,k,s),d=grtH3(i+1,j+1,k,s),e=grtH3(i,j,k+1,s),f=grtH3(i+1,j,k+1,s),g=grtH3(i,j+1,k+1,s),h=grtH3(i+1,j+1,k+1,s);
  return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*(1-w)+(e+(f-e)*u+(g-e)*v+(e-f-g+h)*u*v)*w;}
function grtRoche(x,y,z){const k=GRV.nzK;return (grtN3(x/(46*k),y/(34*k),z/(46*k),11)*2-1)*.72+(grtN3(x/(17*k),y/(14*k),z/(17*k),23)*2-1)*.28;} // la morsure de la roche, −1…1 (GROTTE VASTE : des bosses deux fois plus larges, à l'échelle des salles)
function grtMonde(x0,y0,z0,x1,y1,z1){const B=GRT.B,C=B*16,ox=Math.floor(x0/C)*C,oy=Math.floor(y0/C)*C,oz=Math.floor(z0/C)*C;
  const CX=Math.ceil((x1-ox)/C)+1,CY=Math.ceil((y1-oy)/C)+1,CZ=Math.ceil((z1-oz)/C)+1;
  return {B:B,ox:ox,oy:oy,oz:oz,CX:CX,CY:CY,CZ:CZ,NX:CX*16,NY:CY*16,NZ:CZ*16,dir:new Int32Array(CX*CY*CZ).fill(-1),pool:[],dn:[],nzc:[],si:[],sd:[],chS:[],cle:[],nAir:0};}
function grtCh(V,ci,cj,ck){const d=ci+V.CX*(cj+V.CY*ck);let c=V.dir[d];
  if(c<0){c=V.pool.length;V.dir[d]=c;V.pool.push(new Uint8Array(4096));V.dn.push(new Int8Array(4096).fill(-127));V.nzc.push(null);V.si.push(new Int32Array(64).fill(-1));V.sd.push(new Float32Array(64).fill(1e12));V.chS.push(1e9);V.cle.push(d);}return c;}
function grtLit(V,i,j,k){if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return 0;const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];return c<0?0:V.pool[c][(i&15)|((j&15)<<4)|((k&15)<<8)];}
function grtD(V,i,j,k){if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return -127;const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];return c<0?-127:V.dn[c][(i&15)|((j&15)<<4)|((k&15)<<8)];}
function grtIci(V,x,y,z){return grtLit(V,Math.floor((x-V.ox)/V.B),Math.floor((y-V.oy)/V.B),Math.floor((z-V.oz)/V.B));} // la case d'un point (mètres)
function grtDensIci(V,x,y,z){ // la densité au point (trilinéaire entre les centres des cases) : < 0 = dans la roche — la collision lit la même surface que l'image
  const gx=(x-V.ox)/V.B-.5,gy=(y-V.oy)/V.B-.5,gz=(z-V.oz)/V.B-.5,i=Math.floor(gx),j=Math.floor(gy),k=Math.floor(gz),fx=gx-i,fy=gy-j,fz=gz-k;
  const a=grtD(V,i,j,k),b=grtD(V,i+1,j,k),c=grtD(V,i,j+1,k),d=grtD(V,i+1,j+1,k),e=grtD(V,i,j,k+1),f=grtD(V,i+1,j,k+1),g=grtD(V,i,j+1,k+1),h=grtD(V,i+1,j+1,k+1);
  return ((a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy)*(1-fz)+((e*(1-fx)+f*fx)*(1-fy)+(g*(1-fx)+h*fx)*fy)*fz;}
/* ===== LA SALLE D'UN POINT (2026-11-10, Sacha : « des stalactites en végétation dans un biome pas de glace ») =====
   MESURÉ (dbgGrotte('decors')) : les décors étaient tirés par ABSCISSE (les échantillons de la salle) mais posés jusqu'à 0,8 rayon de côté — là où la grotte vaste est celle d'une AUTRE salle (la route se replie
   sur elle-même) : des concrétions dans la luxuriante, des lianes dans les stalactites ; et leur lumière venait de la salle du TRONÇON (l'échantillon le plus bas qui le touche, 192 m de côté) : des
   stalactites ocre éclairées en VERT. La salle d'un point = celle de l'échantillon qui a creusé là (V.si, un par sous-cube de 32 m) : la même que celle des facettes de la roche tout autour. -1 : hors du creusement. */
function grtSalAt(V,R,x,y,z){const i=Math.floor((x-V.ox)/V.B),j=Math.floor((y-V.oy)/V.B),k=Math.floor((z-V.oz)/V.B);if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return -1;
  const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];if(c<0)return -1;const q=V.si[c][((i&15)>>2)|(((j&15)>>2)<<2)|(((k&15)>>2)<<4)];return q<0?-1:R.SAL[Math.min(R.n-1,q)];}
/* LE TON D'UNE FACETTE (0-63), tiré UNE fois par triangle, au centre : les facettes d'un même cube de 1/k m partagent leur ton (« une variation par paquet de facettes ») et aucune case ne coupe plus un triangle en deux
   (avant : un hash par PIXEL sur des cubes de 7,7 m découpait la paroi en carrés qui ne suivaient pas les facettes). Copiée dans le travailleur (grotte-travailleur.js). */
function grtR6(x,y,z,sal,k){return Math.min(63,Math.floor(grtH3(Math.floor(x*k),Math.floor(y*k),Math.floor(z*k),sal*7)*64));}
/* LES ÉCHANTILLONS DE ROUTE (tous les ~6 m) : position, tangente, abscisse, salle, forme fondue (90 m de part et d'autre d'une frontière),
   plus 20 échantillons prolongés avant le départ (la caméra du portail d'arrivée) et après l'arrivée (le portail). */
function grtEchantillons(){
  const ds=L/(NP-1),st=Math.max(1,Math.round(6/ds)),SL=GROTTE.salles||[],kS=L/Math.max(1,GROTTE.sTot||L); /* (SUR LES PAROIS) l'abscisse de la génération (à plat) → celle de la route enroulée : mêmes pas, la longueur est conservée */
  /* (2026-11-11, Sacha : « la ligne droite de lancement est dans un couloir ») la galerie étroite ne commence QU'APRÈS la bande de départ (mine0) : la droite de lancement roule dans l'entrée large, le rétrécissement (fondu 180 m) s'amorce à sa fin */const F=[{k:'entree',s:-1e9}];for(const b of SL)F.push({k:b.k,s:b.k==='mine'?(GROTTE.Q&&GROTTE.Q.mine0?GROTTE.Q.mine0.s*kS+250:180):b.s*kS});
  const SI={entree:0,mine:0,luxe:1,boyau:2,stal:3,lave:4,abysse:5,fin:5},bornes={};for(let j=1;j<F.length;j++)bornes[F[j].k]=F[j].s;
  const apres={},voisin={};for(let j=1;j<F.length;j++){apres[F[j].k]=j+1<F.length?F[j+1].s:null;voisin[F[j].k]=[F[j-1].k,j+1<F.length?F[j+1].k:null];} // (LES PROFONDEURS AU HASARD) la fin de chaque salle (= le début de la suivante) et ses voisines : l'ordre n'est plus fixe
  const FK9=GRT_VERTIGE&&GROTTE.formes||null; /* (LE VERTIGE) la forme tirée de chaque salle */
  const sm=THREE.MathUtils.smoothstep,ns=Math.floor((NP-1)/st)+1,n=ns+40,R={n:n,DNF:new Float32Array(ns+40),X:new Float32Array(n),Y:new Float32Array(n),Z:new Float32Array(n),S:new Float32Array(n),TX:new Float32Array(n),TZ:new Float32Array(n),
    NNX:new Float32Array(n),NNY:new Float32Array(n),NNZ:new Float32Array(n),BX:new Float32Array(n),BY:new Float32Array(n),BZ:new Float32Array(n),LAT:new Float32Array(n),BAS:new Float32Array(n),
    SAL:new Uint8Array(n),RH:new Float32Array(n),UP:new Float32Array(n),DN:new Float32Array(n),EX:new Float32Array(n),NZ:new Float32Array(n),EXT:new Uint8Array(n),i0:20,bornes:bornes,apres:apres,ds:ds};
  /* (SUR LES PAROIS) nrm : la normale de la dalle (le haut de la caisse), tan : la tangente — la base (tangente, normale, côté) du creusement ; BX/BY/BZ : le côté (normale × tangente) */
  const pose=function(q,x,y,z,tx,tz,s9,ext,nrm,tan){R.X[q]=x;R.Y[q]=y;R.Z[q]=z;R.S[q]=s9;const l=Math.hypot(tx,tz)||1;R.TX[q]=tx/l;R.TZ[q]=tz/l;R.EXT[q]=ext;
    R.NNX[q]=nrm.x;R.NNY[q]=nrm.y;R.NNZ[q]=nrm.z;{let bx=nrm.y*tan.z-nrm.z*tan.y,by=nrm.z*tan.x-nrm.x*tan.z,bz=nrm.x*tan.y-nrm.y*tan.x;const bl=Math.hypot(bx,by,bz)||1;R.BX[q]=bx/bl;R.BY[q]=by/bl;R.BZ[q]=bz/bl;}
    let rh=0,up=0,dn=0,ex=0,nz=0,lt=0,wb=-1,kb=0,dnf=0;const wp=grtProfond(s9);
    for(let j=0;j<F.length;j++){const a=j?sm(s9,F[j].s-90,F[j].s+90):1,b=j+1<F.length?sm(s9,F[j+1].s-90,F[j+1].s+90):0,m=a-b;if(m<=0)continue;
      const f=GRT_FORME[F[j].k],fk=FK9&&FK9[F[j].k];rh+=f.rh*(fk?fk.rh:1)*m;up+=f.up*(fk?fk.up:1)*m;dnf+=f.dn*m;dn+=(f.hug&&GRT_ROULE?f.hug+(f.dn-f.hug)*wp:f.dn)*m;ex+=f.ex*m;nz+=f.nz*m;if(GRT_ROULE&&f.lt)lt+=f.lt*m;if(m>wb){wb=m;kb=SI[F[j].k];}}
    if(GRT_ROULE&&lt>0){const g=Math.pow(Math.max(0,Math.sin(s9*.0051+2.1)),12),cw=1-.42*g*Math.min(1,lt/.5);rh*=cw;up*=1-.2*g*Math.min(1,lt/.5);} /* LES GOULETS : tous les ~1,2 km la salle se pince sur ~150 m (le creux se resserre autour de la route) : la vitesse se lit, puis l'espace s'ouvre */
    R.RH[q]=rh;R.UP[q]=up;R.DN[q]=dn;R.DNF[q]=dnf;R.EX[q]=ex;R.NZ[q]=nz;R.SAL[q]=kb;R.LAT[q]=lt*rh*Math.sin(s9*.0082+.7);}; /* le creux se décale de côté, lentement (période ~770 m) : la route frôle un mur latéral, puis l'autre */
  const T0=T[0],T1=T[NP-1],p0=pts[0],p1=pts[NP-1],N0=Nn[0],N1=Nn[NP-1];
  for(let k=0;k<20;k++){const d=(20-k)*6;pose(k,p0.x-T0.x*d,p0.y-T0.y*d,p0.z-T0.z*d,T0.x,T0.z,-d,1,N0,T0);}
  for(let k=0;k<ns;k++){const i=Math.min(NP-1,k*st),p=pts[i];pose(20+k,p.x,p.y,p.z,T[i].x,T[i].z,i*ds,0,Nn[i],T[i]);}
  for(let k=0;k<20;k++){const d=(k+1)*6;pose(20+ns+k,p1.x+T1.x*d,p1.y+T1.y*d,p1.z+T1.z*d,T1.x,T1.z,L+d,1,N1,T1);}
  /* LES GÉANTS (2026-11-05, voir GRT_GEANT) : le vrai virage relu dans la route finale (le cap à l'entrée et à la sortie → le rayon, le centre : pisteTord a pu la déplacer un peu), le rayon du géant,
     et la salle OUVERTE autour de lui — le creux (RH) s'élargit jusqu'à l'envers du géant + sa marge, la voûte (UP) monte, le décalage latéral (LAT) s'efface — ~40 m avant le virage jusqu'à ~40 m après, fondu sur ~180 m. */
  R.geants=[];R.TUN=new Uint8Array(n);R.TUF=new Float32Array(n); /* TUF : (LE VERTIGE) de combien l'échantillon est dans un TUBE (0-1) — le bassin du lac ne se creuse pas dessous : le tube reste fermé, on ne voit la lave qu'en en sortant */ /* TUN : 1 dans le boyau rapide (les torches s'y serrent) */
  if(GRT_GEANT.on&&GROTTE.geants&&GROTTE.geants.length){const G9=GRT_GEANT,wA=function(a){while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;},
      qAt=function(s9){let lo=R.i0,hi=R.n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=s9)lo=m;else hi=m-1;}return lo;};
    for(const g of GROTTE.geants){const q0=qAt(g.s0*kS),q1=qAt(g.s1*kS);if(q1-q0<4)continue;const qm=(q0+q1)>>1,
        dpsi=wA(Math.atan2(R.TX[q1],R.TZ[q1])-Math.atan2(R.TX[q0],R.TZ[q0])),len=R.S[q1]-R.S[q0];if(Math.abs(dpsi)<.3)continue;
      const Rb=len/Math.abs(dpsi),psi=Math.atan2(R.TX[qm],R.TZ[qm]),sg=dpsi>0?1:-1,rG=Math.min(G9.rayon[1],Math.max(G9.rayon[0],Rb*.3),Rb-ROAD_HALF-G9.jour);if(rG<30)continue;
      const G={x:R.X[qm]+sg*Rb*Math.cos(psi),z:R.Z[qm]-sg*Rb*Math.sin(psi),y:R.Y[qm],q:qm,q0:q0,q1:q1,R:Rb,r:rG,sg:sg};R.geants.push(G);
      const need=Rb+rG+G9.salle,sa=R.S[q0],sb=R.S[q1];
      for(let q=R.i0;q<R.n-20;q++){const dd=Math.max(0,sa-R.S[q],R.S[q]-sb),f=1-sm(dd,40,220);if(f<=0)continue;
        R.RH[q]=Math.max(R.RH[q],R.RH[q]+(need-R.RH[q])*f);R.UP[q]=Math.max(R.UP[q],R.UP[q]+(G9.up-R.UP[q])*f);R.LAT[q]*=1-f;}}}
  /* LE BOYAU RAPIDE (2026-11-05, voir GRT_FLOW) : le creux se resserre autour de la route — demi-largeur, voûte et fond du couloir (GRT_FLOW.boyau), parois plus nettes — sur toute la longueur du module, fondu sur ~90 m aux deux bouts : on s'y engouffre. */
  if(GRT_FLOW.on&&GROTTE.boyaux&&GROTTE.boyaux.length){
    for(const b of GROTTE.boyaux){const sa=b.s0*kS,sb=b.s1*kS,B9=b.f?Object.assign({},GRT_FLOW.boyau,b.f):GRT_FLOW.boyau; /* (LE VERTIGE) b.f : un tube à SA forme (le toboggan, le tube où la route se retourne, la faille) */
      for(let q=R.i0;q<R.n-20;q++){const dd=Math.max(0,sa-R.S[q],R.S[q]-sb),f=1-sm(dd,0,90);
        if(b.f&&dd<420){R.RH[q]=Math.min(R.RH[q],B9.rh+dd*.85);R.TUF[q]=Math.max(R.TUF[q],1-sm(dd,60,300));} /* (LE VERTIGE) L'ENTONNOIR : le creux d'un échantillon est de RÉVOLUTION autour de sa normale — une salle de 340 m de demi-largeur ronge aussi 340 m le long de la route, et mangeait le tube (vu en jeu : le retournement se faisait à ciel ouvert au-dessus de la lave). La salle se resserre donc en cône vers la bouche du tube : jamais plus large que le tube + 0,85 × la distance à lui */
        if(f<=0)continue;
        R.RH[q]+=(B9.rh-R.RH[q])*f;R.UP[q]+=(B9.up-R.UP[q])*f;R.DN[q]+=(Math.min(R.DN[q],B9.dn)-R.DN[q])*f;R.LAT[q]*=1-f;R.NZ[q]*=1-.6*f;if(f>.5)R.TUN[q]=1;if(b.f&&f>R.TUF[q])R.TUF[q]=f;}}}
  /* (LE VERTIGE) LES VIDES : là où un module le demande (la spirale, le nœud, la cascade, le balcon, la passerelle) le fond s'ouvre EN ENTIER sous la route — on voit où l'on descend */
  if(GRT_VERTIGE&&GROTTE.vides)for(const v of GROTTE.vides){const sa=v.s0*kS,sb=v.s1*kS;
    for(let q=R.i0;q<R.n-20;q++){const dd=Math.max(0,sa-R.S[q],R.S[q]-sb),f=1-sm(dd,0,120);if(f>0)R.DN[q]+=(Math.max(R.DN[q],R.DNF[q])-R.DN[q])*f;}}
  // LES LACS : la lave PLATE 70 m sous le point le plus bas de la salle de lave (elle déborde 300 m dans les salles voisines) ; l'eau de la grotte luxuriante
  const yMinDe=function(a,b){let m=1e9;for(let q=0;q<n;q++)if(!R.EXT[q]&&R.S[q]>=a&&R.S[q]<=b)m=Math.min(m,R.Y[q]);return m;};
  /* (AU HASARD) la lave ne déborde que vers les stalactites et les abysses (ses voisines d'avant) — jamais dans la mine, ni l'eau de la luxuriante ; sa LUMIÈRE n'éclaire qu'elle et les voisines où elle déborde
     (lavLum, par salle). (SUR LES PAROIS) le lac est creusé PAR EN DESSOUS de la route (R.BAS : un bassin vertical, voir buildGrotteG) — la route peut longer un mur ou le plafond au-dessus de la lave. */
  /* (2026-11-05, LA ROUTE À RYTHME) LA PORTÉE D'UN LAC EST ROGNÉE là où la route passerait SOUS son niveau : avec des virages sur la paroi, la route plonge ou grimpe de plusieurs centaines de mètres (le virage d'une dalle couchée est vertical) ;
     la lave déborde 300 m au-delà de sa salle, plus bas que la route y arrive, et la noyait (mesuré : 10 routes sur 30 au palier 0 ; 0 avant). Le lac s'arrête à la première dalle qui passe à moins de 24 m au-dessus de lui. */
  const qDe=function(s9){let lo=R.i0,hi=n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=s9)lo=m;else hi=m-1;}return lo;};
  const rogne=function(L9,sa,sb){for(let q=qDe(sb);q<n-20&&R.S[q]<=L9.s1;q++)if(R.Y[q]<L9.y+24){L9.s1=R.S[q];break;}for(let q=qDe(sa);q>=R.i0&&R.S[q]>=L9.s0;q--)if(R.Y[q]<L9.y+24){L9.s0=R.S[q];break;}};
  const deb9=k=>k==='stal'||k==='abysse'?300:0;GROTTE.lavLum=null;
  if(bornes.lave!=null&&apres.lave!=null){const y9=yMinDe(bornes.lave,apres.lave),v=voisin.lave;GROTTE.lac={y:y9-GRV.lacP,s0:bornes.lave-deb9(v[0]),s1:apres.lave+deb9(v[1])};rogne(GROTTE.lac,bornes.lave,apres.lave);
    GROTTE.lavLum=[0,0,0,0,1,0];for(const k of v)if(deb9(k))GROTTE.lavLum[SI[k]]=1;
    for(let q=0;q<n;q++)if(R.S[q]>=GROTTE.lac.s0&&R.S[q]<=GROTTE.lac.s1){const dd=R.Y[q]-GROTTE.lac.y+14;if(GRT_ROULE){if(dd<340)R.BAS[q]=dd*(1-R.TUF[q]);}else R.DN[q]=Math.max(R.DN[q],dd);}}
  if(bornes.luxe!=null&&apres.luxe!=null){const y9=yMinDe(bornes.luxe,apres.luxe);GROTTE.eau={y:y9-GRV.eauL,s0:bornes.luxe,s1:apres.luxe+(voisin.luxe[1]==='lave'?0:120)};rogne(GROTTE.eau,bornes.luxe,apres.luxe);}
  // la grille des échantillons (48 m) : les questions « suis-je sur la route ? » des décors
  const G=new Map();for(let q=0;q<n;q++){const k=Math.floor(R.X[q]/48)+','+Math.floor(R.Z[q]/48);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(q);}R.G=G;
  return R;}
/* un décor (colonne verticale de x,z, de y0 à y1, de rayon r) est-il LIBRE de la route ? — (SUR LES PAROIS) lu dans le repère de la dalle de chaque échantillon proche : en dehors de
   ROAD_HALF + r + 10 m de large, ou franchement au-dessus de la dalle (36 m : l'air du vol) ou au-dessous (14 m), « au-dessus » étant le haut de la DALLE, pas celui du monde */
function grtLibre(R,x,z,y0,y1,r){const lim=ROAD_HALF+r+10,big=lim+50+r,bx=Math.floor(x/48),bz=Math.floor(z/48),nn=Math.ceil(big/48);
  for(let a=-nn;a<=nn;a++)for(let b=-nn;b<=nn;b++){const L9=R.G.get((bx+a)+','+(bz+b));if(!L9)continue;
    for(const q of L9){const dx=x-R.X[q],dz=z-R.Z[q];if(dx*dx+dz*dz>big*big)continue;const ax=R.NNX[q],ay=R.NNY[q],az=R.NNZ[q],ya=Math.max(y0,R.Y[q]-big),yb=Math.min(y1,R.Y[q]+big);if(ya>yb)continue; // (la colonne, bornée autour de l'échantillon : les piliers l'appellent de −∞ à +∞)
      const ny=Math.max(1,Math.ceil((yb-ya)/8));
      for(let k=0;k<=ny;k++){const dy=(ya+(yb-ya)*k/ny)-R.Y[q],dN=dx*ax+dy*ay+dz*az,dp2=dx*dx+dy*dy+dz*dz-dN*dN;
        if(dp2<lim*lim&&dN>-(THICK+14)-r&&dN<36+r)return false;}}}
  return true;}
/* ---------------- CREUSER : l'ellipsoïde d'un échantillon ----------------
   Le rayon normalisé r̂ = ((dh/rh)^ex + (dy/H)^ex)^(1/ex) (H = plafond au-dessus de la route, fond au-dessous) ; la paroi est à r̂ = 1 + nz·bruit ;
   la DENSITÉ = la marge (1 + nz·bruit − r̂) × rh × K, gardée au plus grand de tous les échantillons (l'union des creux). Le NOYAU
   (ROAD_HALF + 10 m de large, 30 m au-dessus, THICK + 9 m au-dessous) est vide quoi qu'il arrive : la règle d'or. Le bruit d'une case est
   calculé une fois (cache Int8 : ~10 échantillons la revisitent) et seulement dans la COQUILLE (près de la paroi). */
function* grtCreuse1(V,R,q,O){ /* (2026-10-31, passe perf mobile) un générateur : un rendez-vous JF.lim par tranche de cases (un creusement d'un bloc : 15-37 ms ×4 au pré-bâti) */ /* O : un creusement à part, le BASSIN vertical de la lave {ax,ay,az,rh,up,dn} — sans lui, l'ellipsoïde de l'échantillon, de révolution autour de la NORMALE de la dalle */
  const B=V.B,inv=1/B,K=GRT.K,px=R.X[q],py=R.Y[q],pz=R.Z[q],cax=R.NNX[q],cay=R.NNY[q],caz=R.NNZ[q]; // (cax… : la normale de la dalle, pour la carotte de la route)
  const ax=O?O.ax:cax,ay=O?O.ay:cay,az=O?O.az:caz,lat=O?0:R.LAT[q],cx0=px+R.BX[q]*lat,cy0=py+R.BY[q]*lat,cz0=pz+R.BZ[q]*lat;
  const rh=O?O.rh:R.RH[q],up=O?O.up:R.UP[q],dn=O?O.dn:R.DN[q],ex=O?2:R.EX[q],nz=R.NZ[q];
  const rc=ROAD_HALF+10,hcU=30,hcD=THICK+9,e2=Math.abs(ex-2)<.01,he=ex/2,ie=1/ex,M=1+nz,BO=2.5*B,Rm=rh*M+BO,Hm=Math.max(up,dn)*M+BO,Rm2=Rm*Rm,sur=1-nz-2*B/rh,SAT=GRT_VASTE?3*B:1e9,core=!O;
  const hx=Math.sqrt(Rm*Rm*(1-ax*ax)+Hm*Hm*ax*ax),hy=Math.sqrt(Rm*Rm*(1-ay*ay)+Hm*Hm*ay*ay),hz=Math.sqrt(Rm*Rm*(1-az*az)+Hm*Hm*az*az),hc=core?rc+Math.max(hcU,hcD)+B:0;
  // 1 · LES SOUS-CUBES (32 m) qu'il touche : l'échantillon le plus proche (la salle, l'abscisse)
  {const S=4*B,a0=Math.floor((cx0-hx-V.ox)/S),a1=Math.floor((cx0+hx-V.ox)/S),c0=Math.floor((cz0-hz-V.oz)/S),c1=Math.floor((cz0+hz-V.oz)/S),b0=Math.floor((cy0-hy-V.oy)/S),b1=Math.floor((cy0+hy-V.oy)/S);
   for(let c=Math.max(0,c0);c<=Math.min(V.NZ/4-1,c1);c++)for(let b=Math.max(0,b0);b<=Math.min(V.NY/4-1,b1);b++)for(let a=Math.max(0,a0);a<=Math.min(V.NX/4-1,a1);a++){
     const x=V.ox+(a+.5)*S,y=V.oy+(b+.5)*S,z=V.oz+(c+.5)*S,dx=x-cx0,dy=y-cy0,dz=z-cz0,dN=dx*ax+dy*ay+dz*az,dh=Math.max(0,Math.sqrt(Math.max(0,dx*dx+dy*dy+dz*dz-dN*dN))-28),dv=Math.max(0,Math.abs(dN)-28),H=(dN>0?up:dn)*M+BO;
     if(dh*dh/Rm2+dv*dv/(H*H)>1)continue;
     const ch=grtCh(V,a>>2,b>>2,c>>2),qq=(a&3)|((b&3)<<2)|((c&3)<<4),ex9=x-px,ey9=y-py,ez9=z-pz,d2=ex9*ex9+ey9*ey9+ez9*ez9;if(d2<V.sd[ch][qq]){V.sd[ch][qq]=d2;V.si[ch][qq]=q;}if(q<V.chS[ch])V.chS[ch]=q;}}
  // 2 · LES CASES : la marge en MÈTRES (la fraction de rayon × la distance au centre / r̂) ; au-delà de 2,5 cases hors de la paroi la plus lointaine, rien
  const i0=Math.max(0,Math.floor((Math.min(cx0-hx,px-hc)-V.ox)*inv)),i1=Math.min(V.NX-1,Math.floor((Math.max(cx0+hx,px+hc)-V.ox)*inv)),
    j0=Math.max(0,Math.floor((Math.min(cy0-hy,py-hc)-V.oy)*inv)),j1=Math.min(V.NY-1,Math.floor((Math.max(cy0+hy,py+hc)-V.oy)*inv)),
    k0=Math.max(0,Math.floor((Math.min(cz0-hz,pz-hc)-V.oz)*inv)),k1=Math.min(V.NZ-1,Math.floor((Math.max(cz0+hz,pz+hc)-V.oz)*inv));
  let cc=-1,A=null,DN=null,NZ=null;
  for(let k=k0;k<=k1;k++){if(k>k0&&performance.now()>JF.lim)yield;const cz=V.oz+(k+.5)*B,dz=cz-cz0,ez=cz-pz;
    for(let j=j0;j<=j1;j++){const cy=V.oy+(j+.5)*B,dy=cy-cy0,ey=cy-py;
      for(let i=i0;i<=i1;i++){const cx=V.ox+(i+.5)*B,dx=cx-cx0,ex2=cx-px;
        const dN=dx*ax+dy*ay+dz*az,d2=dx*dx+dy*dy+dz*dz,dh2=Math.max(0,d2-dN*dN);
        let uc=2,dNp=0; /* la carotte autour de la route (ROAD_HALF + 10 m de large, 30 m au-dessus, THICK + 9 m au-dessous — le haut étant celui de la dalle) : toujours vide, quoi que fasse le bruit */
        if(core&&Math.abs(ex2)<hc&&Math.abs(ey)<hc&&Math.abs(ez)<hc){dNp=ex2*cax+ey*cay+ez*caz;uc=Math.max(0,ex2*ex2+ey*ey+ez*ez-dNp*dNp)/(rc*rc);}
        const inCore=uc<1&&uc+dNp*dNp/(dNp>0?hcU*hcU:hcD*hcD)<1;
        if(!inCore&&(dh2>Rm2||dN>Hm||dN<-Hm))continue;
        const H=dN>0?up:dn,dy2=dN*dN,u=e2?dh2/(rh*rh):Math.pow(dh2/(rh*rh),he),w=e2?dy2/(H*H):Math.pow(dy2/(H*H),he),rr=e2?Math.sqrt(u+w):Math.pow(u+w,ie),ds=Math.sqrt(d2)/Math.max(rr,.05);
        const dehors=(rr-M)*ds>BO;if(dehors&&!inCore)continue; // (loin dehors : la roche, rien à écrire)
        const ci=(i>>4)+V.CX*((j>>4)+V.CY*(k>>4));if(ci!==cc){cc=ci;let c=V.dir[ci];if(c<0)c=grtCh(V,i>>4,j>>4,k>>4);A=V.pool[c];DN=V.dn[c];NZ=V.nzc[c]||(V.nzc[c]=new Int8Array(4096).fill(-128));}
        const o=(i&15)|((j&15)<<4)|((k&15)<<8);if(DN[o]===127)continue;
        let m;if(dehors)m=-1e3;else if(rr<sur)m=1-nz-rr;else{let n8=NZ[o];if(n8===-128)n8=NZ[o]=Math.round(grtRoche(cx,cy,cz)*127);m=1+nz*n8/127-rr;}
        m*=ds; // (en mètres)
        if(m>SAT)m=128/K; /* (GROTTE VASTE) à plus de 3 cases de la paroi, seul le SIGNE sert (surface, collision, décors, occlusion) : la case est saturée
           tout de suite et les échantillons suivants la sautent (DN===127) */
        if(inCore)m=Math.max(m,1+(1-Math.sqrt(uc+dNp*dNp/(dNp>0?hcU*hcU:hcD*hcD)))*12);
        const dv=Math.max(-127,Math.min(127,Math.round(m*K)));if(dv>DN[o])DN[o]=dv;
        if(m>0&&A[o]!==1){A[o]=1;V.nAir++;}}}}}
/* LA CAROTTE DE LA ROUTE, à CHAQUE échantillon (6 m) : la règle d'or (ROAD_HALF + 10 m de large, 30 m au-dessus de la dalle, THICK + 9 m au-dessous) ne dépend plus du pas de creusement (rh/3,2 m,
   jusqu'à 100 m) — depuis que la route LONGE la paroi, un échantillon de creusement sur dix ne suffit plus : le bruit de la roche mordait la route entre deux. */
function grtNoyau(V,R,q){const B=V.B,inv=1/B,K=GRT.K,px=R.X[q],py=R.Y[q],pz=R.Z[q],ax=R.NNX[q],ay=R.NNY[q],az=R.NNZ[q],rc=ROAD_HALF+10,hcU=30,hcD=THICK+9,hc=rc+Math.max(hcU,hcD)+B;
  const i0=Math.max(0,Math.floor((px-hc-V.ox)*inv)),i1=Math.min(V.NX-1,Math.floor((px+hc-V.ox)*inv)),j0=Math.max(0,Math.floor((py-hc-V.oy)*inv)),j1=Math.min(V.NY-1,Math.floor((py+hc-V.oy)*inv)),k0=Math.max(0,Math.floor((pz-hc-V.oz)*inv)),k1=Math.min(V.NZ-1,Math.floor((pz+hc-V.oz)*inv));
  let cc=-1,A=null,DN=null;
  for(let k=k0;k<=k1;k++){const ez=V.oz+(k+.5)*B-pz;for(let j=j0;j<=j1;j++){const ey=V.oy+(j+.5)*B-py;for(let i=i0;i<=i1;i++){const ex=V.ox+(i+.5)*B-px,dN=ex*ax+ey*ay+ez*az,uc=Math.max(0,ex*ex+ey*ey+ez*ez-dN*dN)/(rc*rc);if(uc>=1)continue;
    const c2=uc+dN*dN/(dN>0?hcU*hcU:hcD*hcD);if(c2>=1)continue;
    const ci=(i>>4)+V.CX*((j>>4)+V.CY*(k>>4));if(ci!==cc){cc=ci;let c=V.dir[ci];if(c<0)c=grtCh(V,i>>4,j>>4,k>>4);A=V.pool[c];DN=V.dn[c];}
    const o=(i&15)|((j&15)<<4)|((k&15)<<8);if(DN[o]===127)continue;const dv=Math.min(127,Math.round((1+(1-Math.sqrt(c2))*12)*K));if(dv>DN[o])DN[o]=dv;if(A[o]!==1){A[o]=1;V.nAir++;}}}}}
/* LES LACS : sous le niveau, dans la portée du lac (l'échantillon le plus proche), la densité devient celle d'une surface PLATE au niveau — la
   lave (ou l'eau) est le dessus de ce « sol » ; ses cases sont marquées 4 (5) pour la collision et la matière */
/* (2026-11-12, Sacha : « beaucoup de freeze dans la map Pic de Jade ») LES LACS PAR TRANCHES. MESURÉ au profileur (Chrome, course dans le jade, 12 s) : grtLacs = 19,8 % de TOUT le temps du fil principal, d'un seul bloc — ce n'est pas le jade, c'est la GROTTE SUIVANTE que le pré-bâti construit pendant la course (prebJob → prebDecorG → buildGrotteG), et ses lacs parcouraient toutes les cases (4096 par bloc) sans rendre la main. Sur un téléphone chaud : des images de 300 à 850 ms. Un générateur, comme le reste de buildGrotteG : rendez-vous JF.lim tous les 8 blocs. Le résultat est le même au bit près. */
function* grtLacsG(V,R){const lac=GROTTE.lac,eau=GROTTE.eau,B=V.B,K=GRT.K;if(!lac&&!eau)return;const yMax=Math.max(lac?lac.y:-1e9,eau?eau.y:-1e9)+2*B;
  for(let c=0;c<V.pool.length;c++){if((c&7)===7&&performance.now()>JF.lim)yield;const d=V.cle[c],cj=((d/V.CX)|0)%V.CY,y0=V.oy+cj*16*B;if(y0>yMax)continue;const A=V.pool[c],DN=V.dn[c],SI=V.si[c];
    for(let o=0;o<4096;o++){if(DN[o]<=0)continue;const j=(o>>4)&15,cy=y0+(j+.5)*B,q=SI[((o&15)>>2)|((j>>2)<<2)|(((o>>8)>>2)<<4)];if(q<0)continue;const S=R.S[q];
      const L9=lac&&S>=lac.s0&&S<=lac.s1?lac:(eau&&S>=eau.s0&&S<=eau.s1?eau:null);if(!L9||cy>L9.y+2*B)continue;
      const dv=Math.max(-127,Math.round((cy-L9.y)*K));if(dv<DN[o])DN[o]=dv;if(cy<L9.y&&A[o]===1){A[o]=L9===lac?4:5;V.nAir--;}}}}
/* LES PILIERS (après les lacs) : des colonnes de BASALTE qui sortent de la lave jusqu'à la voûte, des COLONNES de concrétion (en sablier) dans la
   cathédrale — loin de toutes les routes (règle d'or), dans l'air de la salle. La densité les refait roche (la physique = l'image). */
function grtPiliers(V,R,fr){const L9=[],B=V.B,K=GRT.K,b=R.bornes,VZ=GRT_VASTE,H9=VZ?560:260; // (GROTTE VASTE : plus nombreux, plus gros, dans toute la largeur des salles)
  const ap=R.apres||{}; // (AU HASARD) la fin de la salle = le début de la suivante, quelle qu'elle soit
  for(const [k,s0,s1,nb,ra,rb] of VZ?[['stal',b.stal,ap.stal,11,14,14],['lave',b.lave,ap.lave,16,18,16]]:[['stal',b.stal,ap.stal,6,9,9],['lave',b.lave,ap.lave,9,12,11]]){if(s0==null||s1==null)continue;
    let n=0;for(let e=0;e<nb*12&&n<nb;e++){const q=R.i0+((fr()*(R.n-R.i0-20))|0);if(R.S[q]<s0+60||R.S[q]>s1-60)continue;
      const sd=fr()<.5?-1:1,lat=ROAD_HALF+48+fr()*(VZ?Math.max(110,R.RH[q]*.75):110),x=R.X[q]+R.TZ[q]*sd*lat,z=R.Z[q]-R.TX[q]*sd*lat,y=R.Y[q],r=ra+fr()*rb;
      if(grtIci(V,x,y,z)!==1||!grtLibre(R,x,z,-1e9,1e9,r+8)||grtSalAt(V,R,x,y,z)!==(k==='stal'?3:4))continue; /* (2026-11-10) une colonne de concrétion dans les stalactites, de basalte dans la lave — pas dans la salle d'à côté */
      let yb=y,yt=y;while(yb>y-H9&&grtIci(V,x,yb-B,z)===1)yb-=B;while(yt<y+H9&&grtIci(V,x,yt+B,z)===1)yt+=B;
      if(yt-yb<40)continue;yb-=B*1.5;yt+=B*1.5;
      const R9=r*1.3+2*B,i0=Math.floor((x-R9-V.ox)/B),i1=Math.floor((x+R9-V.ox)/B),k0=Math.floor((z-R9-V.oz)/B),k1=Math.floor((z+R9-V.oz)/B),j0=Math.floor((yb-V.oy)/B),j1=Math.floor((yt-V.oy)/B);
      for(let j=j0;j<=j1;j++){const cy=V.oy+(j+.5)*B,u=(cy-yb)/(yt-yb),rr=k==='stal'?r*(1-.42*Math.sin(Math.PI*Math.max(0,Math.min(1,u)))):r*(1+.25*(grtN3(x/9,cy/14,z/9,8)-.5));
        for(let kk=k0;kk<=k1;kk++)for(let i=i0;i<=i1;i++){const cx=V.ox+(i+.5)*B,cz=V.oz+(kk+.5)*B,dd=Math.hypot(cx-x,cz-z);if(dd>rr+2*B)continue;
          const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(kk>>4))];if(c<0)continue;const o=(i&15)|((j&15)<<4)|((kk&15)<<8),dv=Math.round((dd-rr)*K);
          if(dv<V.dn[c][o])V.dn[c][o]=Math.max(-127,dv);if(dd<rr&&V.pool[c][o]===1){V.pool[c][o]=0;V.nAir--;}}}
      L9.push({x:x,z:z,r:r*1.3+B,yb:yb,yt:yt,k:k});n++;}}
  return L9;}
/* ---------------- LA LUMIÈRE CUITE ----------------
   Canal 1 (aL.x) : les TORCHES (rayon 45 m). Canal 2 (aL.yzw, ×2 dans le shader) : la LUMIÈRE DU LIEU — l'air de la salle (GRT_AMB), la lave
   (par en dessous, elle décroît en 38 m), l'eau, la géode (en 70 m), et les lumières ponctuelles (baies, chutes de lave, capteurs, âmes, gemmes).
   Chaque tronçon a sa liste (`grtLumListes`) : un sommet ne regarde que les lumières qui peuvent l'atteindre. */
const GRT_AMB=[[.30,.19,.10],[.13,.38,.24],[.24,.10,.40],[.34,.24,.14],[.30,.09,.045],[.04,.15,.20]]; // (banc 18/10 : au tiers, les grandes salles étaient noires au-delà de la lanterne)
GRT_AMB[0]=GRT_AMB[0].map(function(v){return v*GRV.amb0;}); /* (2026-11-12) la mine et la bouche : l'air du lieu relevé — voir L'ENTRÉE DE LA GROTTE SE LIT */
function grtLumListes(V,T9,P9){const M=new Map(),C=16*V.B;
  const add=function(o,r,cle){const i0=Math.floor((o.x-r-V.ox)/C),i1=Math.floor((o.x+r-V.ox)/C),j0=Math.floor((o.y-r-V.oy)/C),j1=Math.floor((o.y+r-V.oy)/C),k0=Math.floor((o.z-r-V.oz)/C),k1=Math.floor((o.z+r-V.oz)/C);
    for(let k=Math.max(0,k0);k<=Math.min(V.CZ-1,k1);k++)for(let j=Math.max(0,j0);j<=Math.min(V.CY-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(V.CX-1,i1);i++){
      const d=i+V.CX*(j+V.CY*k);let a=M.get(d);if(!a)M.set(d,a={t:[],p:[]});a[cle].push(o);}};
  for(const o of T9)add(o,GRV.torR,'t');for(const o of P9)add(o,o.r,'p');return M;}
function grtLum(x,y,z,sal,LL,out){
  const a=GRT_AMB[sal]||GRT_AMB[0],ka=sal?GRV.amb:1;let t=0,r=a[0]*ka,g=a[1]*ka,b=a[2]*ka;
  if(LL){for(const o of LL.t){const dx=x-o.x,dy=y-o.y,dz=z-o.z,d2=dx*dx+dy*dy+dz*dz;if(d2<GRV.tR2)t+=1.3/(1+d2/GRV.tF)*(1-d2/GRV.tR2);}
    for(const o of LL.p){const dx=x-o.x,dy=y-o.y,dz=z-o.z,d2=dx*dx+dy*dy+dz*dz;if(d2<o.r2){let k=1-d2/o.r2;k*=k*o.I;r+=o.c[0]*k;g+=o.c[1]*k;b+=o.c[2]*k;}}}
  const lac=GROTTE.lac;if(lac&&(GROTTE.lavLum?GROTTE.lavLum[sal]:sal>=3)&&y>lac.y-8){const k=(sal===4?1.65:.9)*Math.exp(-Math.max(0,y-lac.y)/(sal===4?GRV.lavL:38));r+=1.0*k;g+=.32*k;b+=.055*k;}
  const e=GROTTE.eau;if(e&&sal===1&&y>e.y-8){const k=.6*Math.exp(-Math.max(0,y-e.y)/16);r+=.04*k;g+=.22*k;b+=.26*k;}
  out[0]=Math.min(1,t);out[1]=Math.min(2,r);out[2]=Math.min(2,g);out[3]=Math.min(2,b);}
/* ---------------- LA SURFACE À FACETTES (surface nets) ----------------
   Sur les centres des cases : un SOMMET par cube dont les 8 coins changent de signe (la moyenne des points où ses arêtes traversent la
   paroi), un QUAD par arête qui traverse (les 4 cubes autour). Les facettes se voient par le shader (normale de la facette, dérivées). Par
   sommet : la matière (roche, lave, eau, améthyste, basalte, concrétion, magma), la salle, l'OCCLUSION (la part de roche dans les 4 × 4 × 4
   cases autour : les creux s'assombrissent, les arêtes s'éclairent) et la lumière cuite. Un tronçon lit une bordure de 2 cases chez ses voisins. */
const GRT_ARETES=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
const GRT_TMP={lum:[0,0,0,0],loc:null,vid:null,P:null,F:null,Lt:null,I:null};
function grtTampons(){const T=GRT_TMP;if(!T.loc){T.loc=new Float32Array(20*20*20);T.vid=new Int32Array(17*17*17);const NV=40000;T.P=new Float32Array(NV*3);T.F=new Uint8Array(NV*4);T.Lt=new Uint8Array(NV*4);T.I=new Uint32Array(NV*6);}return T;}
const GT={ROCHE:0,LAVE:1,EAU:2,AMETHYSTE:3,BOIS:4,FLAMME:5,CRISTAL:6,BAIE:7,FEUILLE:8,FLEUR:9,CONCRETION:10,BASALTE:11,SCULK:12,CAPTEUR:13,BRIQUE:14,AME:15,DIAMANT:16,OR:17,MAGMA:18,ROSEC:19,VIOLETC:20,AZURC:21,SOLEILC:22}; /* (2026-10-24, embellir) 19-22 : les CRISTAUX À TEINTES (grottes-embellies.js) — rose, violet, azur, or */
function grtMatieres(x,y,z,sal,lv){ // la matière d'un sommet de la roche (lv : un coin voisin est de la lave 4 ou de l'eau 5)
  const lac=GROTTE.lac,eau=GROTTE.eau;
  if(lv===4&&lac&&Math.abs(y-lac.y)<3.5)return GT.LAVE;if(lv===5&&eau&&Math.abs(y-eau.y)<3.5)return GT.EAU;
  if((sal===3||sal===4)&&GROTTE.piliers)for(const c of GROTTE.piliers)if((x-c.x)**2+(z-c.z)**2<c.r*c.r&&y>c.yb-8&&y<c.yt+8)return c.k==='stal'?GT.CONCRETION:GT.BASALTE;
  return GT.ROCHE;} /* (2026-11-10) PLUS DE MAGMA ICI : le rivage de la lave (9 m) et le pied des piliers de basalte (14 m) prenaient la matière MAGMA par TRIANGLE — une dent de scie de 12 m le long du lac, des facettes rouges et sombres en damier (le mélange entre deux matières se décidait sur les coins). Le rougeoiement est maintenant dans le fragment, lissé par la HAUTEUR au-dessus de la lave (GRT_FS) ; GT.MAGMA n'est plus posé */
/* (2026-10-24, passe perf 3e tour) LE MAILLAGE D'UN TRONÇON EN TRANCHES : au PRÉ-BÂTI, un tronçon (40 à 150 ms ×4, d'un bloc) faisait les images
   de 100-283 ms du vol qui précède la grotte (MESURÉ ×4 : 8 à 15 images > 100 ms par approche). grtMailleNetsG rend la main entre deux tranches de sa
   grille (l'échéance JF.lim, celle du pré-bâti) ; d'un trait (JF.lim infini : le passage, les tranches en course), il ne s'arrête jamais.
   Mêmes calculs, même ordre : le même maillage. */
function grtMailleNets(V,c,LL){return jadeFini(grtMailleNetsG(V,c,LL));}
function* grtMailleNetsG(V,c,LL){
  const T=grtTampons(),d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,I0=ci*16,J0=cj*16,K0=ck*16,B=V.B,lum=T.lum,loc=T.loc,vid=T.vid,R=GROTTE.R;
  // 1 · les densités du tronçon et de sa bordure (−2 … 17)
  for(let k=0;k<20;k++){if(performance.now()>JF.lim)yield;for(let j=0;j<20;j++)for(let i=0;i<20;i++)loc[i+20*(j+20*k)]=grtD(V,I0+i-2,J0+j-2,K0+k-2);}
  const L=function(i,j,k){return loc[(i+2)+20*((j+2)+20*(k+2))];};
  // 2 · les sommets (cubes −1 … 15)
  vid.fill(-1);let nv=0;const MAXV=39990,cv=new Float32Array(8);
  for(let cc=-1;cc<16&&nv<MAXV;cc++){for(let b=-1;b<16&&nv<MAXV;b++){if(performance.now()>JF.lim)yield; /* (2026-11-01) le rendez-vous à chaque rangée (une couche entière : jusqu'à 100 ms ×4 d'un bloc) */for(let a=-1;a<16;a++){
    let m=0;for(let q=0;q<8;q++){const v=L(a+(q&1),b+((q>>1)&1),cc+((q>>2)&1));cv[q]=v;if(v>0)m|=1<<q;}
    if(m===0||m===255)continue;
    let sx=0,sy=0,sz=0,ne=0;
    for(let e=0;e<12;e++){const q0=GRT_ARETES[e][0],q1=GRT_ARETES[e][1],v0=cv[q0],v1=cv[q1];if((v0>0)===(v1>0))continue;const t=v0/(v0-v1);
      sx+=(q0&1)+((q1&1)-(q0&1))*t;sy+=((q0>>1)&1)+(((q1>>1)&1)-((q0>>1)&1))*t;sz+=((q0>>2)&1)+(((q1>>2)&1)-((q0>>2)&1))*t;ne++;}
    const lx=(a+.5+sx/ne)*B,ly=(b+.5+sy/ne)*B,lz=(cc+.5+sz/ne)*B,wx=V.ox+I0*B+lx,wy=V.oy+J0*B+ly,wz=V.oz+K0*B+lz;
    // la normale (vers l'air), l'occlusion, la salle, la matière
    const gx=(cv[1]+cv[3]+cv[5]+cv[7])-(cv[0]+cv[2]+cv[4]+cv[6]),gy=(cv[2]+cv[3]+cv[6]+cv[7])-(cv[0]+cv[1]+cv[4]+cv[5]),gz=(cv[4]+cv[5]+cv[6]+cv[7])-(cv[0]+cv[1]+cv[2]+cv[3]),gl=Math.hypot(gx,gy,gz)||1;
    let roc=0;for(let z9=-1;z9<=2;z9++)for(let y9=-1;y9<=2;y9++)for(let x9=-1;x9<=2;x9++)if(L(a+x9,b+y9,cc+z9)<=0)roc++;
    let sal=0,lv=0;{let q9=-1;for(let q=0;q<8&&q9<0;q++){if(cv[q]<=0)continue;const ii=I0+a+(q&1),jj=J0+b+((q>>1)&1),kk=K0+cc+((q>>2)&1),ch=V.dir[(ii>>4)+V.CX*((jj>>4)+V.CY*(kk>>4))];
        if(ch>=0)q9=V.si[ch][((ii&15)>>2)|(((jj&15)>>2)<<2)|(((kk&15)>>2)<<4)];}
      if(q9>=0&&R)sal=R.SAL[q9];
      for(let q=0;q<8&&!lv;q++){const p=grtLit(V,I0+a+(q&1),J0+b+((q>>1)&1),K0+cc+((q>>2)&1));if(p===4||p===5)lv=p;}}
    /* (2026-11-10) LE LAC EST PLAT : un sommet qui touche le lac et qui est à moins de 0,4 case de son niveau est posé EXACTEMENT dessus — l'arrondi de la densité (±0,3 m) bossuait le plan, et le pli entre le lac et une paroi ou le pied d'un pilier (un escalier de cases de 12 m) faisait des dents de 5 m le long de la ligne d'eau */
    const Y9=lv===4?GROTTE.lac:lv===5?GROTTE.eau:null,dy9=Y9&&Math.abs(wy-Y9.y)<B*.4?Y9.y-wy:0;
    const p3=nv*3,p4=nv*4;T.P[p3]=lx;T.P[p3+1]=ly+dy9;T.P[p3+2]=lz;
    T.F[p4]=grtMatieres(wx,wy,wz,sal,lv);T.F[p4+1]=sal;T.F[p4+2]=Math.round(Math.max(.3,Math.min(1,1.28-roc/64))*255);T.F[p4+3]=lv===4?1:lv===5?2:0; /* (2026-11-10) 1 : un coin touche la LAVE, 2 : l'EAU (le drapeau du bord d'un lac, voir w4 plus bas) */
    grtLum(wx+gx/gl*1.5,wy+gy/gl*1.5,wz+gz/gl*1.5,sal,LL,lum);T.Lt[p4]=lum[0]*255;T.Lt[p4+1]=lum[1]*127.5;T.Lt[p4+2]=lum[2]*127.5;T.Lt[p4+3]=lum[3]*127.5;
    vid[(a+1)+17*((b+1)+17*(cc+1))]=nv++;}}}
  // 3 · les quads : chaque arête (points 0 … 15 du tronçon) qui traverse la paroi — tournés vers l'air
  let ni=0;const V9=function(a,b,cc){return vid[(a+1)+17*((b+1)+17*(cc+1))];};
  for(let cc=0;cc<16;cc++){if(performance.now()>JF.lim)yield;for(let b=0;b<16;b++)for(let a=0;a<16;a++){const v0=L(a,b,cc),s0=v0>0;
    for(let ax=0;ax<3;ax++){const v1=ax===0?L(a+1,b,cc):ax===1?L(a,b+1,cc):L(a,b,cc+1);if((v1>0)===s0)continue;
      let q0,q1,q2,q3;
      if(ax===0){q0=V9(a,b-1,cc-1);q1=V9(a,b,cc-1);q2=V9(a,b,cc);q3=V9(a,b-1,cc);}
      else if(ax===1){q0=V9(a-1,b,cc-1);q1=V9(a-1,b,cc);q2=V9(a,b,cc);q3=V9(a,b,cc-1);}
      else{q0=V9(a-1,b-1,cc);q1=V9(a,b-1,cc);q2=V9(a,b,cc);q3=V9(a-1,b,cc);}
      if(q0<0||q1<0||q2<0||q3<0||ni+6>T.I.length)continue;
      if(s0){T.I[ni++]=q0;T.I[ni++]=q1;T.I[ni++]=q2;T.I[ni++]=q0;T.I[ni++]=q2;T.I[ni++]=q3;}
      else{T.I[ni++]=q0;T.I[ni++]=q2;T.I[ni++]=q1;T.I[ni++]=q0;T.I[ni++]=q3;T.I[ni++]=q2;}}}}
  /* 4 · UNE MATIÈRE PAR FACETTE : les sommets sont dédoublés par triangle et la facette prend la matière de la majorité de ses coins (le numéro
     de matière interpolé sur un triangle à cheval passait par toutes les matières entre les deux : un liseré arc-en-ciel le long des bords —
     banc du 18/10). La lumière et l'occlusion restent celles des coins (fondues sur la facette). */
  const nt=ni/3,P=new Float32Array(nt*9),F=new Uint8Array(nt*12),Lt=new Uint8Array(nt*12);
  for(let t=0;t<nt;t++){if((t&2047)===2047&&performance.now()>JF.lim)yield;const a=T.I[t*3],b=T.I[t*3+1],c9=T.I[t*3+2],ma=T.F[a*4],mb=T.F[b*4],mc=T.F[c9*4],mt=(ma===mb||ma===mc)?ma:(mb===mc?mb:(ma||mb||mc));
    /* (2026-11-10, Sacha : « des triangles très visibles sur l'eau et la lave ») w4 = le BORD D'UN LAC (0 aucun · 1 lave · 2 eau : un coin du triangle touche une case du lac) + 4 × le TON de la facette (0-63). La matière
       lave/eau/roche ne se joue plus sur la majorité des coins (des dents de 12 m le long du rivage) : le fragment la décide à la HAUTEUR du lac (uLacW, GRT_FS) — la ligne d'eau est droite, au pixel près. */
    const lk=Math.max(T.F[a*4+3],T.F[b*4+3],T.F[c9*4+3]),w4=lk+4*grtR6(V.ox+I0*B+(T.P[a*3]+T.P[b*3]+T.P[c9*3])/3,V.oy+J0*B+(T.P[a*3+1]+T.P[b*3+1]+T.P[c9*3+1])/3,V.oz+K0*B+(T.P[a*3+2]+T.P[b*3+2]+T.P[c9*3+2])/3,T.F[a*4+1],GRT_VASTE?.11:.16);
    for(let k=0;k<3;k++){const v=k===0?a:k===1?b:c9,o=t*3+k;P[o*3]=T.P[v*3];P[o*3+1]=T.P[v*3+1];P[o*3+2]=T.P[v*3+2];
      F[o*4]=mt;F[o*4+1]=T.F[v*4+1];F[o*4+2]=T.F[v*4+2];F[o*4+3]=w4;Lt[o*4]=T.Lt[v*4];Lt[o*4+1]=T.Lt[v*4+1];Lt[o*4+2]=T.Lt[v*4+2];Lt[o*4+3]=T.Lt[v*4+3];}}
  return {P:P,F:F,L:Lt,I:null,nv:nt*3,nt:nt};}
/* LES DÉCORS : des FORMES low-poly (prismes à n pans qui s'affinent, boîtes orientées, octaèdres), rangées par tronçon, dessinées dans la même
   matière que la roche (matière, lumière cuite à leurs coins). Les grosses entrent aussi dans les COLLISIONS (boîtes orientées, grille de 64 m). */
function grtRange(D,V,x,y,z,f){const C=16*V.B,d=Math.floor((x-V.ox)/C)+V.CX*(Math.floor((y-V.oy)/C)+V.CY*Math.floor((z-V.oz)/C));let a=D.get(d);if(!a)D.set(d,a=[]);a.push(f);}
function grtCol(x,y,z,hx,hy,hz,yaw,k){const G=GROTTE.col,cs=Math.cos(yaw||0),sn=Math.sin(yaw||0),rx=Math.abs(cs)*hx+Math.abs(sn)*hz,rz=Math.abs(sn)*hx+Math.abs(cs)*hz,o={x:x,y:y,z:z,hx:hx,hy:hy,hz:hz,c:cs,s:sn,k:k};
  for(let i=Math.floor((x-rx)/64);i<=Math.floor((x+rx)/64);i++)for(let j=Math.floor((z-rz)/64);j<=Math.floor((z+rz)/64);j++){const k9=i+','+j;let L9=G.G.get(k9);if(!L9)G.G.set(k9,L9=[]);L9.push(o);}G.n++;return o;}
function grtBoite(D,V,x,y,z,hx,hy,hz,t,yaw,col){grtRange(D,V,x,y,z,['b',x,y,z,hx,hy,hz,t,yaw||0]);if(col)grtCol(x,y,z,hx,hy,hz,yaw,col);}
function grtPrisme(D,V,x,y,z,dir,n,r0,r1,h,t,rot,col){ // la base au point, l'axe dir (unitaire), n pans, rayon r0 → r1 (0 : une pointe)
  grtRange(D,V,x,y,z,['p',x,y,z,dir[0],dir[1],dir[2],n,r0,r1,h,t,rot||0]);
  if(col){const m=Math.max(r0,r1)*.8;grtCol(x+dir[0]*h/2,y+dir[1]*h/2,z+dir[2]*h/2,Math.abs(dir[0])*h/2+m,Math.abs(dir[1])*h/2+m,Math.abs(dir[2])*h/2+m,0,col).cone=[x,y,z,dir[0],dir[1],dir[2],r0,r1,h];} /* (2026-10-22, DEBUGGING : la boîte n'est que la 1re approche — un cône s'affine jusqu'à sa POINTE, la boîte (0,8 × le rayon de la base + 1 m, sur toute la longueur et encore 0,8 × ce rayon AU-DELÀ de la pointe) tuait en vol dans l'air vide autour des pointes des stalactites et des stalagmites — mesuré : 100 % des points à 3 m du cône près de la pointe, 2/3 de ceux à 2-10 m au-delà de la pointe ; grotteHeurt teste aussi le cône) */}
function grtOcta(D,V,x,y,z,r,h,t,rot){grtRange(D,V,x,y,z,['o',x,y,z,r,h,t,rot||0]);}
function grtMailleDecor(V,c,L9,LL,sal){ // les formes d'un tronçon → triangles {P (mètres du tronçon),F,L,I}
  const d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,C=16*V.B,ox=V.ox+ci*C,oy=V.oy+cj*C,oz=V.oz+ck*C,lum=GRT_TMP.lum;
  const P=[],F=[],Lt=[],I=[],salT=sal;let W4=0; /* W4 : le ton de la facette en cours (4 × 0-63, le lac : 0) */
  const sommet=function(x,y,z,nx,ny,nz,t){grtLum(x+nx*.8,y+ny*.8,z+nz*.8,sal,LL,lum);P.push(x-ox,y-oy,z-oz);F.push(t,sal,255,W4);Lt.push(lum[0]*255,lum[1]*127.5,lum[2]*127.5,lum[3]*127.5);return P.length/3-1;};
  const tri=function(a,b,c9){I.push(a,b,c9);};
  const nrm=function(a,b,c9){const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c9[0]-a[0],c9[1]-a[1],c9[2]-a[2]],n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],l=Math.hypot(n[0],n[1],n[2])||1;return [n[0]/l,n[1]/l,n[2]/l];};
  const face=function(Q,t){const n=nrm(Q[0],Q[1],Q[2]);W4=4*grtR6((Q[0][0]+Q[1][0]+Q[2][0])/3,(Q[0][1]+Q[1][1]+Q[2][1])/3,(Q[0][2]+Q[1][2]+Q[2][2])/3,sal,.45);const ix=Q.map(function(p){return sommet(p[0],p[1],p[2],n[0],n[1],n[2],t);});tri(ix[0],ix[1],ix[2]);if(ix.length>3)tri(ix[0],ix[2],ix[3]);};
  for(const f of L9){
    /* (2026-11-10) LA SALLE DE LA FORME : sa lumière (ambiance cuite) et sa salle viennent de l'endroit où elle est (milieu du fût), pas de la salle du tronçon (192 m : la plus basse qui le touche) */
    {const m9=f[0]==='p'?f[10]*.5:0,s9=GROTTE.R?grtSalAt(V,GROTTE.R,f[1]+(f[0]==='p'?f[4]*m9:0),f[2]+(f[0]==='p'?f[5]*m9:0),f[3]+(f[0]==='p'?f[6]*m9:0)):-1;sal=s9<0?salT:s9;}
    if(f[0]==='b'){const x=f[1],y=f[2],z=f[3],h=[f[4],f[5],f[6]],t=f[7],cs=Math.cos(f[8]),sn=Math.sin(f[8]);
      const w=function(q){const lx=q[0]*h[0],ly=q[1]*h[1],lz=q[2]*h[2];return [x+lx*cs+lz*sn,y+ly,z-lx*sn+lz*cs];};
      for(const Q of [[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],
        [[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]])face(Q.map(w),t);}
    else if(f[0]==='p'){const x=f[1],y=f[2],z=f[3],dv=[f[4],f[5],f[6]],n=f[7],r0=f[8],r1=f[9],h=f[10],t=f[11],rot=f[12];
      const ref=Math.abs(dv[1])<.9?[0,1,0]:[1,0,0];let u=[dv[1]*ref[2]-dv[2]*ref[1],dv[2]*ref[0]-dv[0]*ref[2],dv[0]*ref[1]-dv[1]*ref[0]];const ul=Math.hypot(u[0],u[1],u[2]);u=[u[0]/ul,u[1]/ul,u[2]/ul];
      const v=[dv[1]*u[2]-dv[2]*u[1],dv[2]*u[0]-dv[0]*u[2],dv[0]*u[1]-dv[1]*u[0]];
      const anneau=function(r,hh){const A=[];for(let k=0;k<n;k++){const a=rot+k/n*6.2832,ca=Math.cos(a)*r,sa=Math.sin(a)*r;A.push([x+u[0]*ca+v[0]*sa+dv[0]*hh,y+u[1]*ca+v[1]*sa+dv[1]*hh,z+u[2]*ca+v[2]*sa+dv[2]*hh]);}return A;};
      const A0=anneau(r0,0),A1=r1>.01?anneau(r1,h):null,tip=[x+dv[0]*h,y+dv[1]*h,z+dv[2]*h];
      for(let k=0;k<n;k++){const k2=(k+1)%n;if(A1)face([A0[k],A1[k],A1[k2],A0[k2]],t);else face([A0[k],tip,A0[k2]],t);}
      if(A1)for(let k=0;k<n;k++)face([tip,A1[(k+1)%n],A1[k]],t);
      for(let k=0;k<n;k++)face([[x,y,z],A0[k],A0[(k+1)%n]],t);}
    else{const x=f[1],y=f[2],z=f[3],r=f[4],h=f[5],t=f[6],cs=Math.cos(f[7]),sn=Math.sin(f[7]); // l'octaèdre (une gemme, une baie, un buisson)
      const pt=[[x+r*cs,y,z-r*sn],[x-r*sn,y,z-r*cs],[x-r*cs,y,z+r*sn],[x+r*sn,y,z+r*cs]],H=[x,y+h,z],Bs=[x,y-h,z];
      for(let k=0;k<4;k++){const a=pt[k],b=pt[(k+1)%4];face([a,H,b],t);face([a,b,Bs],t);}}}
  const nv=P.length/3;return {P:new Float32Array(P),F:new Uint8Array(F),L:new Uint8Array(Lt),I:nv<65536?new Uint16Array(I):new Uint32Array(I),nv:nv};}
