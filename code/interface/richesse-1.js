/* LA PLUIE DE RICHESSE — LA CAISSE QUI CRACHE (2026-10-08, Léo : « des billets (bleu turquoise foncé, léger reflet en dégradé vert clair
   fluo), des pièces comme les euros français, des bitcoins, de l'or (bouts de taille variée, luisants, bling), des diamants (taille variée,
   très beaux), des trèfles à quatre feuilles, des fruits ; le tap trash sur la voiture peut provoquer un petit jet de flamme très léger et
   des étincelles qui projettent ces objets au hasard — pas toujours, juste assez pour qu'on ait envie de le refaire ; inspire-toi des études
   sur le cerveau, effort / réconfort ; les étincelles d'avant étaient brutes, naïves, gamines : fais mieux »).
   LE CERVEAU (on s'en sert pour le plaisir du geste — aucun argent réel n'est en jeu, rien ne s'achète) :
   · Fiorillo, Tobler & Schultz 2003 (Science) : l'activité soutenue des neurones à dopamine est MAXIMALE quand la récompense a une chance
     sur deux (l'incertitude la plus forte) → un coup seul paie une fois sur deux environ (mesuré), jamais à coup sûr.
   · Schultz 1997-98 : la dopamine suit l'ÉCART à la prédiction, une récompense prévisible ne fait plus rien → la TAILLE est tirée elle
     aussi (petit / bon / gros / jackpot) et la composition change à chaque gerbe (un diamant, ça surprend).
   · Clark et al. 2009 (Neuron) : le PRESQUE (near-miss) recrute les circuits du gain et donne envie de rejouer, surtout quand c'est nous
     qui agissons → un coup sec sur trois laisse échapper une seule pièce, un éclat — presque.
   · Knutson et al. 2001 : l'ANTICIPATION d'un gain allume le noyau accumbens ; Inzlicht et al. 2018 (« effort paradox ») : l'EFFORT ajoute
     de la valeur → le COMBO (coups rapprochés) fait monter la chance ET la taille, ses étincelles chauffent jusqu'au blanc-or ; 80 ms de
     souffle entre le coup et la gerbe (le temps que ça monte).
   · Pas d'extinction : après 3 coups secs d'affilée, le suivant paie. Le TRÈFLE porte chance : il en sort un, les deux coups suivants +18 %.
   LA MATIÈRE — trois programmes à soi, compilés une fois à l'arrivée au ciel (sous l'écran titre) : le MÉTAL (pièces, bitcoin, or : le
   ciel reflété teinté par le métal, Fresnel, deux éclats spéculaires), la GEMME (le diamant : réfraction dispersée R/V/B après un rebond
   intérieur, feu arc-en-ciel par facette, reflet), le SOUPLE (billet et trèfle : le papier ondule, un reflet vert fluo glisse dessus). Les
   fruits sont ceux de la piste (fruitGeo / FRUIT_MAT, déjà compilés).
   L'AIR : la caisse tombe, l'air remonte autour d'elle (RICH.W m/s) — chaque objet freine selon sa forme : le billet et le trèfle planent
   et papillonnent, la pièce tourbillonne sur sa tranche, l'or et le diamant, denses, filent plus loin avant d'être emportés.
   LE BLING : un éclat en étoile quand une FACETTE renvoie le soleil vers l'œil (calculé, pas tiré au sort) — la pièce qui flashe en
   tournant, le diamant qui scintille.
   LES ÉTINCELLES v2 : des traits de métal en fusion qui REFROIDISSENT (blanc → jaune → orange → rouge sombre), allongés par leur vitesse,
   freinés par l'air, dont certains ÉCLATENT en deux (la meule) — même programme que les filets de vent (0 compilé).
   LA FLAMME : un jet bref et léger au point d'impact — le signal du gain (dorée au jackpot).
   Console : dbgRiche() l'état · dbgRiche('jackpot'|'gros'|'bon'|'petit'|'presque'|'rien') impose le prochain coup · dbgRiche('pluie',t)
   fait cracher la caisse sans coup (t = la taille). */
const RICH={pret:false,chauffe:0,objs:[],libres:{},sp:null,fl:[],gl:[],sec:0,chance:0,force:null,attente:[],
  n:{coups:0,gains:0,presque:0,jackpot:0},W:3,v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),q:new THREE.Quaternion(),
  H:new THREE.Vector3(),cam:new THREE.Vector3(),eu:new THREE.Euler(),
  v4:new THREE.Vector3(),v5:new THREE.Vector3(),v6:new THREE.Vector3(),q2:new THREE.Quaternion(),q3:new THREE.Quaternion(),mx:new THREE.Matrix4()}; // (2026-10-10) les vecteurs du papier qui tombe et de la liasse qui craque
const RICH_UP=new THREE.Vector3(0,1,0),RICH_BOSSE=.0045; // le relief des pièces : la hauteur (m, à l'échelle de la pièce) que donne le blanc de leur carte de hauteur — exagéré (le vrai fait 0,1 mm), sinon il ne se lit pas
const RICH_U={uLum:{value:0},uSunDir:{value:new THREE.Vector3().copy(SUN_DIR)},uSunCol:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},
  uEnv:{value:envTex},uT:{value:0}};
// les objets : kd = freinage par l'air (1/s), fl = papillonnement (m/s²), w = rotation (rad/s), v = élan au départ (m/s), vie (s) ;
// flip = l'axe de la face (la pièce, le jeton et la carte tournent sur un DIAMÈTRE : ils « flashent ») ; nl = les facettes qui renvoient le
// soleil (le bling) ; gem = une gemme (scintille toujours un peu) ; gc = la teinte de son éclat.
// s = LA TAILLE (2026-10-08, Léo : « respecte bien la taille et la différence de chaque objet ») : la VRAIE taille de chaque objet, passée
// par UNE règle — taille à l'écran = 1,05 m × (taille réelle ÷ 15,6 cm)^0,55, le billet faisant 1,05 m (la puissance resserre l'écart, sans
// quoi un diamant ne ferait qu'un pixel) ; plafonnée à ~1,2 m (la bouteille, le crâne, la pastèque, la chaîne). Donc : une pièce de 2 € est
// plus grande qu'une de 1 € (25,75 / 23,25 mm), un jeton (39 mm) plus grand qu'une pièce, la carte (85,6 mm) plus petite que le billet,
// la liasse a la taille du billet, les gemmes et les pépites sont petites (et de tailles variées), chaque fruit a la sienne (la myrtille
// ne fait plus la taille de la pastèque). Les unités de s suivent la forme de chaque objet (rayon d'une pièce, longueur d'un billet…).
const RICH_GEM_NL=[[0,1,0],[.6,.55,.58],[-.7,.5,.3],[.2,.45,-.85],[-.3,-.7,.6]],RICH_OR_NL=[[0,1,0],[.7,.4,.5],[-.6,.5,-.4],[.2,-.6,.7]],RICH_FACE_Y=[[0,1,0],[0,-1,0]];
const RICH_FRUIT_R={MYRTILLE:.13,CERISE:.18,KIWI:.32,'PÊCHE':.34,'PÊCHE PLATE':.34,ORANGE:.36,MANGUE:.43,POMME:.36,MELON:.51,LITCHI:.23,BANANE:.57,GRENADE:.41,'PASTÈQUE':.6,KAKI:.34,PITAYA:.45,MANGOUSTAN:.30,'FIGUE DE BARBARIE':.36,DATTE:.25,'MELON DU DÉSERT':.46}; // (2026-10-20) PAR NOM, plus par rang : la liste des fruits a été refaite (fruits-nouveaux.js : myrtille, cerise, kiwi, pêche, orange, mangue, pomme, melon, litchi) et l'ancienne table par index donnait à la cerise le rayon de la banane, à l'orange celui de la myrtille, à la mangue celui de la pastèque — Léo : « je n'ai pas l'impression de tous les voir » // le RAYON (m) de chaque fruit, dans l'ordre de FRUIT_DEFS : pêche plate 7 cm, banane 18, grenade 10, orange 8, myrtille 1,2, pastèque 30 (plafonnée)
const RICH_T={
  billet:{kd:2.4,fl:5,s:[.88,.96],w:[2,6],v:[3,6],vie:[2.8,3.8],papier:1},                            // 156 × 66 mm → 1,05 m (s = sa longueur) · (2026-10-10, Léo : « un tout petit peu plus petits ») −12 % : 0,92 m — la liasse garde sa taille
  liasse:{kd:.9,fl:.3,s:[1,1.1],w:[3,7],v:[4,7],vie:[2.6,3.4]},                              // le billet, en paquet
  carte:{kd:1.5,fl:3,s:[.74,.77],w:[7,14],v:[4,8],vie:[2.6,3.4],flip:'z',nl:[[0,0,1],[0,0,-1]],gc:[1,1,1]}, // 85,6 × 54 mm → 0,75 m
  trefle:{kd:2.6,fl:4,s:[.44,.5],w:[2,6],v:[3,6],vie:[2.6,3.4],papier:1},                   // 3 cm → 0,42 m · papier : il tombe en feuille (richPapier)
  piece2:{kd:.8,fl:.6,s:[.193,.2],w:[11,20],v:[4,8],vie:[2.4,3.2],flip:'y',nl:RICH_FACE_Y,gc:[.92,.96,1]},  // 2 € : Ø 25,75 mm → 0,39 m (s = son rayon) — l'éclat de l'argent, froid
  piece1:{kd:.8,fl:.6,s:[.18,.187],w:[11,20],v:[4,8],vie:[2.4,3.2],flip:'y',nl:RICH_FACE_Y,gc:[1,.9,.62]}, // 1 € : Ø 23,25 mm → 0,37 m — l'or nordique, chaud
  piece50:{kd:.8,fl:.6,s:[.185,.192],w:[11,20],v:[4,8],vie:[2.4,3.2],flip:'y',nl:RICH_FACE_Y,gc:[1,.86,.55]}, // 50 c : Ø 24,25 mm → 0,38 m
  jeton:{kd:.85,fl:.6,s:[.24,.25],w:[10,18],v:[4,8],vie:[2.4,3.2],flip:'y'},                 // jeton de casino : Ø 39 mm → 0,49 m
  btc:{kd:.75,fl:.5,s:[.245,.26],w:[9,17],v:[4,8],vie:[2.6,3.4],flip:'y',nl:RICH_FACE_Y,gc:[1,.8,.5]},    // la pièce-souvenir : Ø 40 mm → 0,5 m
  montre:{kd:.7,fl:0,s:[.19,.2],w:[3,7],v:[4,8],vie:[2.6,3.4],nl:[[0,1,0],[0,.7,.7],[0,.7,-.7]],gc:[1,.95,.8]}, // la montre fermée : 6,5 cm de tour → 0,65 m
  or:{kd:.5,fl:0,s:[.11,.21],w:[3,9],v:[5,9],vie:[2.4,3.4],nl:RICH_OR_NL},                   // pépites de 1 à 3 cm → 0,23 à 0,42 m
  lingot:{kd:.55,fl:0,s:[.56,.88],w:[3,7],v:[4,8],vie:[2.4,3.4],nl:RICH_OR_NL},              // de 100 g (5 cm) à 1 kg (11,6 cm)
  chaine:{kd:1.1,s:[1.3,1.45],v:[4,7],vie:[2.8,3.6]},                                        // le collier de 50 cm, plafonné (s = sa longueur)
  diamant:{kd:.55,fl:0,s:[.08,.13],w:[3,8],v:[5,9],vie:[2.6,3.6],nl:RICH_GEM_NL,gem:1,gc:[.95,.97,1]}, // 5 à 12 mm → 0,16 à 0,26 m
  rubis:{kd:.55,fl:0,s:[.085,.13],w:[3,8],v:[5,9],vie:[2.6,3.6],nl:RICH_GEM_NL,gem:1,gc:[1,.5,.58]},
  emeraude:{kd:.55,fl:0,s:[.12,.17],w:[3,8],v:[5,9],vie:[2.6,3.6],nl:[[0,1,0],[.55,.55,0],[-.55,.55,0],[0,.5,.7],[0,-.6,.6]],gem:1,gc:[.6,1,.72]},
  champagne:{kd:.7,fl:0,s:[.9,.93],w:[3,7],v:[4,7],vie:[2.6,3.4]},                          // 30 cm → plafonnée à 1,2 m
  crane:{kd:.6,fl:0,s:[.24,.29],w:[2,4],v:[4,7],vie:[3,3.8],nl:[[0,1,0],[.5,.6,.6],[-.5,.6,.6]],face:1}, // un crâne de collection, 0,5-0,6 m (Léo : « plus petit ») — face : il part le regard vers la caméra et tourne sur lui-même
  coeur:{kd:1.25,fl:1.1,s:[.17,.25],w:[1.1,2.4],v:[2.5,6.5],vie:[2.4,3.4],face:1,bat:1,pop:1,nl:[[.32,.55,.77],[-.32,.55,.77],[0,.15,1]],gp:40,gs:1.15,gc:[1,.8,.93]}, // (2026-10-15, Léo) le PETIT CŒUR (s = sa largeur ; 2026-10-16, Léo : « plus petits, plus nombreux, et ils explosent — pas tous en même temps » : 17-25 cm, ils viennent en NUÉE (RICH_NUEE) et chacun ÉCLATE à son heure, pop) : léger, il flotte et papillonne un peu, se balance face à toi et BAT (bat, voir richTick), fait de minuscules cubes qu'on voit au travers (richCoeurCubes, RICH_FS_COEUR), et ses lobes scintillent doucement (gp : un éclat large, gs : une étoile à sa taille)
  fleur:{kd:1.3,fl:1.2,s:[.42,.6],w:[1,2],v:[3,6],vie:[3,3.8],fleur:1,nl:[[0,1,0]],gp:22,gs:.9,gc:[1,.92,.96]}, // (2026-10-16, Léo) une PETITE FLEUR (s = sa taille, 42-60 cm) : hibiscus, rose, lilas, lotus, lys ou tulipe — légère, elle flotte, se tourne de trois quarts vers toi et tourne lentement sur sa tige (richTick)
  fruit:{kd:1,fl:.4,s:[.94,1.06],w:[3,7],v:[3,6],vie:[2.4,3.2]}}; // fruit : s = un écart autour de SON rayon (RICH_FRUIT_R, par nom : la règle de taille donne rayon = 0,525 m × (diamètre en cm ÷ 15,6)^0,55 — cerise 2,2 cm, kiwi 6,5, pêche 7, orange 8, mangue 11, pomme 8, melon 15, litchi 3,5)
const RICH_CAP={billet:30,liasse:6,carte:6,trefle:6,jeton:12,montre:4,piece2:8,piece1:8,piece50:8,btc:7,or:14,lingot:5,diamant:18,rubis:12,emeraude:12,champagne:8,crane:6,coeur:22,fleur:12,fruit:8};
const RICH_PD=[0,2,4,7,9,12,14,16,19,21],RICH_MEL=[0,2,4,7,9,12,14,16,14,12,9,7,4,2]; // RICH_MEL : la mélodie des cœurs qui éclatent — elle monte puis redescend (un aller-retour, pas une chute)
function richSon(){const B=window.CCSON_BANQUE;return !!(B&&B.m&&B.m['riche.coup']);} // richSon : la banque a-t-elle les sons de la pluie de richesse ? (sinon, l'ancien jeu de sons)
 // (2026-10-16) la pentatonique en demi-tons (degré → st) : la note du combo, la mélodie des cœurs
const RICH_NUEE={petit:[.22,4,6],bon:[.35,6,9],gros:[.5,8,12],jackpot:[.75,12,16]}; // (2026-10-16) LA NUÉE DE CŒURS : la chance qu'une gerbe en porte une, combien de petits cœurs (min, max) // (la chaîne : son pool à elle, RICH.ch)
/* (2026-10-14, Léo : « diminue la quantité d'objets déversés lors des coups, garde la variété ; vise quelque chose d'addictif qui joue avec le
   besoin d'effort et de récompense ») LES GERBES MAIGRISSENT (≈ ÷2,5 : petit 1-2, bon 3-5, gros 6-9, jackpot 14-19 ; les répliques aussi), les
   MÉLANGES ne bougent pas (la variété reste) — et L'EFFORT DÉCIDE DE LA TAILLE : un coup isolé paie surtout PETIT (le jackpot n'y tombe
   presque jamais), la RAFALE (le combo) fait monter gros et jackpot (voir richTire). La rareté rend le gros lot lisible : il se MÉRITE. */
const RICH_TIER={ // la taille de la gerbe : combien, et quoi (poids)
  petit:  {n:[1,2],  fl:.75,w:{billet:22,piece2:11,piece1:11,piece50:10,jeton:9,fruit:17,trefle:7,or:10,carte:4,rubis:6,emeraude:6,diamant:5,liasse:4,montre:1,fleur:9,champagne:2}},
  bon:    {n:[3,5],  fl:1,  w:{jeton:9,montre:3,billet:26,piece2:7,piece1:7,piece50:5,or:15,lingot:4,fruit:8,trefle:4,btc:6,diamant:9,rubis:9,emeraude:9,carte:6,liasse:6,champagne:7,chaine:3,fleur:9}},
  gros:   {n:[6,9],  fl:1.3,w:{jeton:8,montre:5,billet:20,or:16,lingot:6,piece2:5,piece1:5,piece50:3,btc:10,diamant:18,rubis:13,emeraude:13,carte:7,liasse:8,champagne:9,chaine:6,crane:2,trefle:3,fruit:3,fleur:9}},
  jackpot:{n:[14,19],fl:1.8,w:{jeton:8,montre:6,billet:20,or:15,lingot:7,diamant:24,rubis:16,emeraude:16,btc:10,carte:6,liasse:8,champagne:11,chaine:6,crane:4,piece2:4,piece1:4,piece50:2,trefle:4,fruit:3,fleur:11}}}; // (2026-10-15) + les petits cœurs rouges, dans les quatre tailles · (2026-10-16, Léo : « plus de pierres précieuses en général ») diamants, rubis, émeraudes ≈ ×1,6 (et le diamant entre dans la petite gerbe) ; + les petites fleurs ; (2026-10-16) + les vins chers (le champagne a quatre cousins, plus souvent) ; les cœurs ne sont plus tirés ici : ils viennent en NUÉE (RICH_NUEE)

// ---- LES PROGRAMMES ----
const RICH_VS=['varying vec3 vN;varying vec3 vP;varying vec2 vUv;uniform float uT;uniform float uBend;',
  'void main(){vec3 p=position;vec3 nn=normal;',
  '#ifdef SOUPLE',
  ' float ph=dot(modelMatrix[3].xyz,vec3(.9,1.3,.7))+uT*7.;float a=uBend*.07,b=uBend*.035;', // le papier ONDULE (la phase suit sa place : chaque billet bat à son rythme)
  ' p.z+=sin(p.x*3.2+ph)*a+sin(p.y*5.+ph*1.4)*b;',
  ' nn=normalize(vec3(-cos(p.x*3.2+ph)*a*3.2,-cos(p.y*5.+ph*1.4)*b*5.,1.));',
  '#endif',
  ' vec4 w=modelMatrix*vec4(p,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*nn);vUv=uv;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const RICH_STUDIO=['vec3 studio(vec3 r,float fl){', // LE STUDIO DU BIJOUTIER : un reflet à contraste franc (sol sombre, horizon gris, ciel clair, une bande de lumière, des boîtes à lumière) — c'est le contraste qui fait le « bling », le ciel réel n'en a pas
  ' float y=r.y,a=atan(r.z,r.x);vec3 c=mix(vec3(.04,.035,.05)+fl,vec3(.42,.42,.47)+fl*.5,smoothstep(-.4,.04,y));c=mix(c,vec3(1.45),smoothstep(.06,.6,y));',
  ' c+=vec3(1.3)*smoothstep(.07,0.,abs(y-.2));c+=vec3(1.4)*pow(max(0.,cos(a*3.)),36.)*smoothstep(.12,.6,y);return c;}'].join('\n');
const RICH_FS_METAL=['uniform sampler2D uMap;uniform samplerCube uEnv;uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;uniform float uShin;',
  'varying vec3 vN;varying vec3 vP;varying vec2 vUv;',RICH_STUDIO,
  '#ifdef PIECE', // (2026-10-10, Léo : « les pièces un tout petit peu plus flashy et réalistes ») LE RELIEF FRAPPÉ : une carte de hauteur (le listel, les étoiles, le chiffre, le cordon de la tranche) incline la normale à chaque pixel — c'est lui qui accroche la lumière quand la pièce tourne
  'uniform sampler2D uBump;uniform float uBumpK;',
  'vec3 bosse(vec3 N){vec2 dx=dFdx(vUv),dy=dFdy(vUv);float h=texture2D(uBump,vUv).r;',
  ' float bx=texture2D(uBump,vUv+dx).r-h,by=texture2D(uBump,vUv+dy).r-h;',
  ' vec3 sx=dFdx(vP),sy=dFdy(vP),r1=cross(sy,N),r2=cross(N,sx);float det=dot(sx,r1);', // la normale perturbée par les dérivées (la recette du bump de three, en monde)
  ' return normalize(abs(det)*N-sign(det)*(bx*r1+by*r2)*uBumpK);}',
  '#endif',
  'void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vP);',
  '#ifdef PIECE',
  ' N=bosse(N);',
  '#endif',
  ' vec3 F0=texture2D(uMap,vUv).rgb;',
  ' vec3 R=reflect(-V,N);vec3 env=textureCube(uEnv,vec3(-R.x,R.y,R.z)).rgb;',
  ' float ndv=max(dot(N,V),0.),fr=pow(1.-ndv,5.);',
  '#ifdef PIECE',
  ' vec3 F=F0+(vec3(1.)-F0)*fr*.85;float kS=1.45;', // les pièces : le bord qui blanchit plus franc, les éclats plus forts (le « flashy »)
  '#else',
  ' vec3 F=F0+(vec3(1.)-F0)*fr*.5;float kS=1.;',
  '#endif',
  ' vec3 L=normalize(uSunDir),H=normalize(L+V),H2=normalize(normalize(V+vec3(.3,.9,.2))+V);',
  ' float s1=pow(max(dot(N,H),0.),uShin),s2=pow(max(dot(N,H2),0.),uShin*.7);',
  '#ifdef PIECE',
  ' vec3 rfl=mix(studio(R,.4),env*1.1,.14);vec3 Vb=normalize(V+vec3(0.,.55,0.));float bx9=max(dot(R,Vb),0.);', // les pièces : moins de ciel teinté (l'argent reste argent, l'or reste or)…
  ' rfl+=vec3(.62)*pow(bx9,8.)+vec3(.7)*pow(bx9,90.);', // …et la BOÎTE À LUMIÈRE derrière l'objectif : la face qui te regarde s'allume d'un coup (le « flash » d'une pièce qu'on fait tourner)
  '#else',
  ' vec3 rfl=mix(studio(R,.24),env*1.15,.3);', // le studio d'abord, un peu du vrai ciel (l'heure se lit encore sur l'or)
  '#endif',
  ' vec3 c=F*(rfl+mix(uGnd,uSky,N.y*.5+.5)*.18)+F*(uSunCol*s1*2.4+vec3(s2)*1.6)*kS;',
  ' gl_FragColor=vec4(c,1.);}'].join('\n');
const RICH_FS_GEMME=['uniform samplerCube uEnv;uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uTint;',
  'varying vec3 vN;varying vec3 vP;varying vec2 vUv;',RICH_STUDIO,
  'vec3 cube(vec3 d){return textureCube(uEnv,vec3(-d.x,d.y,d.z)).rgb;}',
  'void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vP),I=-V;float ndv=max(dot(N,V),0.);',
  ' vec3 hN=normalize(vec3(sin(dot(N,vec3(12.9,78.2,37.7))*43.7),cos(dot(N,vec3(39.3,11.1,83.7))*17.3),sin(dot(N,vec3(73.1,52.2,9.4))*29.1)));', // la facette du FOND, propre à chaque facette vue
  ' vec3 tr=reflect(refract(I,N,.405),hN),tg=reflect(refract(I,N,.413),hN),tb=reflect(refract(I,N,.421),hN);', // l'indice du diamant, un peu différent par couleur : la DISPERSION — elle ne se voit qu'aux bords des bandes du studio (le FEU, là où il est dans un vrai diamant)
  ' vec3 rf=vec3(studio(tr,0.).r,studio(tg,0.).g,studio(tb,0.).b)*1.15+cube(tg)*.12;',
  ' vec3 Rl=reflect(I,N);float fr=.1+.9*pow(1.-ndv,4.);',
  ' vec3 L=normalize(uSunDir),H=normalize(L+V),H2=normalize(normalize(V+vec3(.3,.9,.2))+V);',
  ' float sp=pow(max(dot(N,H),0.),200.)*8.+pow(max(dot(N,H2),0.),120.)*3.;',
  ' vec3 c=mix(rf*uTint,studio(Rl,0.)*.8+cube(Rl)*.4,fr)+uSunCol*sp+vec3(sp*.4);',
  ' gl_FragColor=vec4(c,1.);}'].join('\n');
const RICH_FS_SOUPLE=['uniform sampler2D uMap;uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;uniform vec3 uSheen;uniform float uSheenK;uniform float uT;uniform float uLum;',
  'varying vec3 vN;varying vec3 vP;varying vec2 vUv;',
  'void main(){vec2 uv=gl_FrontFacing?vUv:vec2(1.-vUv.x,vUv.y);vec4 tx=texture2D(uMap,uv);if(tx.a<.5)discard;',
  ' vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cameraPosition-vP),L=normalize(uSunDir);',
  ' float nl=dot(N,L),df=max(nl,0.)*.75+abs(nl)*.25;', // le papier laisse passer un peu de jour
  ' vec3 hc=mix(uGnd,uSky,N.y*.5+.5);vec3 c=tx.rgb*(hc*.75+uSunCol*df*.6+.2);',
  ' float ndv=abs(dot(N,V)),sw=fract(uv.x*.8+uv.y*.5-uT*.32+dot(vP,vec3(.05)));', // le reflet qui GLISSE en dégradé
  ' float band=smoothstep(0.,.35,sw)*smoothstep(.8,.35,sw);',
  ' c+=uSheen*(pow(1.-ndv,2.)*.55+band*.4)*uSheenK;',
  ' vec3 H=normalize(L+V);c+=uSunCol*pow(max(dot(N,H),0.),36.)*.3*uSheenK;',
  ' float lm=max(tx.r,max(tx.g,tx.b));c+=(tx.rgb*.6+.4)*uLum*smoothstep(.74,.95,lm);', // (2026-10-20, Léo : « les numéros un peu brillants, pas qui scintillent — une petite lumière légère sur le billet ») LE CHIFFRE LUIT : ce qui est presque blanc dans la toile (le grand chiffre, les petites valeurs) émet un peu de sa couleur, constant, même à l'ombre — uLum le dose (0 partout sauf les billets)
  ' gl_FragColor=vec4(c,1.);}'].join('\n');
/* (2026-10-15, Léo : « des petits cœurs rouges — un bon rouge, bien rouge, avec un petit dégradé rose fuchsia et un peu de blanc pour les
   rendre vraiment dreamy ») puis (2026-10-16 : « rends les cœurs en minuscules cubes ; joue la transparence, je ne vois pas assez ce côté
   rouge et blanc fantomatique ; ils sont trop solides et font jeu vidéo — on parle de l'amour, c'est autre chose que du matériel »)
   LE CŒUR FANTÔME : une PEAU de minuscules cubes (richCoeurCubes) qu'on voit au travers. Chaque cube connaît la normale LISSE du cœur à sa
   place (aN) : là où le cœur te fait face il est presque transparent, rouge (on voit le ciel au travers, et les cubes du dos par-dessus) ;
   vers le bord il s'épaissit, passe au FUCHSIA puis au BLANC — la silhouette brille, le milieu est un souffle. Quelques cubes blancs
   scintillent à leur rythme (aR.y = le hasard), une ONDE de lumière monte de la pointe aux lobes (aR.x = la hauteur). Mélange PRÉMULTIPLIÉ :
   ce qui couvre (alpha) et ce qui luit (la couleur au-delà de l'alpha) se dosent à part. Faces des cubes : un peu de soleil, pour qu'on lise
   les cubes. Un programme de plus, compilé sous l'écran titre (richChauffeTick). */
const RICH_VS_COEUR=['attribute vec3 aN;attribute vec2 aR;attribute vec4 aK;uniform float uPop;varying vec3 vN;varying vec3 vP;varying vec3 vH;varying vec2 vR;varying float vPeau;varying float vPop;',
  'void main(){vec3 p=position;vPeau=aK.w;vPop=uPop;',
  ' if(uPop>0.){vec3 C=aK.xyz,j=vec3(fract(aR.y*7.13),fract(aR.y*13.37),fract(aR.y*3.71))-.5,dr=normalize(aN+j*1.1+C*1.2);', // (2026-10-16) POP : le cœur ÉCLATE en ses cubes, qui filent dehors en rapetissant
  '  p=C+(p-C)*(1.-uPop*.65)+dr*uPop*(.3+aR.y*.6);p.y-=uPop*uPop*.3;}',
  ' vec4 w=modelMatrix*vec4(p,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vH=normalize(mat3(modelMatrix)*aN);vR=aR;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const RICH_FS_COEUR=['uniform vec3 uSunDir;uniform float uT;uniform vec3 uRouge;uniform vec3 uFuch;uniform float uBlanc;uniform float uA;',
  'varying vec3 vN;varying vec3 vP;varying vec3 vH;varying vec2 vR;varying float vPeau;varying float vPop;',
  'void main(){vec3 N=normalize(vN),Hn=normalize(vH),V=normalize(cameraPosition-vP),L=normalize(uSunDir);',
  ' float bo=1.-abs(dot(Hn,V));', // le BORD du cœur (sa silhouette) : 1 ; la face qui te regarde, devant comme au dos : 0
  ' float tw=.5+.5*sin(uT*(2.4+vR.y*4.)+vR.y*37.),on=smoothstep(.14,0.,abs(fract(vR.x*.8-uT*.42)-.5));', // chaque cube scintille à son rythme ; l'onde qui monte
  ' vec3 col=mix(uRouge,uFuch,smoothstep(.35,.88,bo));',
  ' col=mix(col,vec3(1.,.95,.98),clamp(smoothstep(.5,1.,bo)*.9+step(.86,vR.y)*tw*.85,0.,1.));', // blanc tout au bord, et quelques cubes blancs qui scintillent
  ' float df=.66+.34*max(dot(N,L),0.)+.1*N.y;', // les faces des cubes se lisent (un peu de soleil, le dessus plus clair)
  ' float a=min(.92,mix(uA,.86,pow(bo,1.25))*(.8+.2*tw)*(1.+.5*on));',
  ' if(vPeau<.5){col=uRouge*(1.05+.25*tw);a=.3;bo=0.;}', // le DEDANS : des cubes d'un rouge plein, à demi transparents — le cœur est rempli
  ' float fl=smoothstep(0.,.25,vPop)*(1.-vPop);col=mix(col,vec3(1.,.95,.98),fl*.7);a*=pow(1.-vPop,1.4);', // l'éclat blanc du pop, puis les cubes s'éteignent
  ' gl_FragColor=vec4(col*df*a*(1.+.45*on)+col*(.1+.3*bo)*uBlanc*(1.-vPop),a);}'].join('\n');
/* (2026-10-16) LES PÉTALES : de la soie qui laisse passer le jour (éclairés de face COMME de dos), un liseré blanc rosé à la silhouette (la
   lueur des cœurs), un lustre doux ; transparents (aC.a), mélange prémultiplié — ils écrivent la profondeur : les pétales de derrière que
   cache un pétale de devant ne se mélangent pas en bouillie. */
const RICH_VS_FLEUR=['attribute vec4 aC;varying vec3 vN;varying vec3 vP;varying vec4 vC;',
  'void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vC=aC;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const RICH_FS_FLEUR=['uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;',
  'varying vec3 vN;varying vec3 vP;varying vec4 vC;',
  'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cameraPosition-vP),L=normalize(uSunDir);',
  ' float nl=dot(N,L),df=max(nl,0.)*.55+max(-nl,0.)*.38+.3;', // le jour passe au travers du pétale
  ' vec3 c=vC.rgb*(mix(uGnd,uSky,N.y*.5+.5)*.32+uSunCol*df*.55+.34);',
  ' float bo=1.-abs(dot(N,V));c+=vec3(1.,.93,.97)*pow(bo,2.4)*.42+uSunCol*pow(max(dot(N,normalize(L+V)),0.),36.)*.22;', // le liseré blanc rosé, le lustre de la soie
  ' float a=vC.a*(.78+.22*bo);gl_FragColor=vec4(c*a,a);}'].join('\n');
 // prémultiplié : ce qui couvre + ce qui luit (le fantôme brille un peu)
function richMat(fs,u,defs,side){const U=Object.assign({},RICH_U,u||{});return new THREE.ShaderMaterial({uniforms:U,vertexShader:RICH_VS,fragmentShader:fs,defines:defs||{},side:side||THREE.FrontSide,fog:false,lights:false});}

// ---- LES DESSINS (canvas) ----
function richCv(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');fn(x,w,h);const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t;}
function richEtoile(x,cx,cy,r){x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();x.fill();}
/* (2026-10-10, Léo : « les pièces un tout petit peu plus flashy et réalistes ») LES PIÈCES v2 : chaque pièce a DEUX images tirées du MÊME
   dessin (même graine) — la COULEUR (le métal, plus vif : l'or nordique et le cupronickel montent d'un cran) et la HAUTEUR (gris : le champ
   bas, le LISTEL qui dépasse au bord, les étoiles, l'arbre, le chiffre en relief, la rainure entre les deux métaux, le cordon de la tranche),
   que le programme du métal lit pour incliner la lumière pixel par pixel (#define PIECE) : le relief accroche le soleil quand la pièce tourne.
   Mise en page (512 × 256, une puissance de deux : ses mips existent partout) : les deux faces (centres 128 / 384, 122 ; rayon 120) et la
   TRANCHE en bande au bas de l'image (246-256) — le cordon fin du 2 €, les segments striés du 1 €, la fleur d'Espagne du 50 c. */
function richDuo(fn){ // deux toiles, le même dessin : [couleur, hauteur]
  return [false,true].map(function(H){return richCv(512,256,function(x){let sd=0x51ec7;
    const rn=function(){sd=(sd+0x6D2B79F5)|0;let q=Math.imul(sd^sd>>>15,1|sd);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296;};fn(x,H,rn);});});}
function richFace(x,cx,cy,R,ext,int,face,val,H,rn){ // une face d'euro : le listel, la couronne (12 étoiles), le cœur ; face 0 = côté France (l'arbre dans l'hexagone, RF), 1 = côté commun (le chiffre) — H : la carte de HAUTEUR
  const g=(r,c0,c1)=>{const G=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);G.addColorStop(0,c0);G.addColorStop(1,c1);return G;};
  const frappe=function(dessin,fort){ // ce qui est EN RELIEF : en hauteur, un gris clair ; en couleur, une ombre portée puis une lumière décalées (le relief se lit encore de loin, quand le vrai bosselage n'a plus de pixels)
    if(H){x.fillStyle=x.strokeStyle='#d6d6d6';dessin();return;}
    x.save();x.translate(R*.012,R*.016);x.fillStyle=x.strokeStyle='rgba(60,42,12,'+(fort?.46:.32)+')';dessin();x.restore();
    x.save();x.translate(-R*.008,-R*.011);x.fillStyle=x.strokeStyle='rgba(255,252,236,'+(fort?.42:.3)+')';dessin();x.restore();};
  x.fillStyle=H?'#5c5c5c':g(R,ext[0],ext[1]);x.beginPath();x.arc(cx,cy,R,0,6.2832);x.fill();
  x.lineWidth=R*.07;x.strokeStyle=H?'#ffffff':'rgba(255,250,232,.34)';x.beginPath();x.arc(cx,cy,R*.955,0,6.2832);x.stroke(); // le LISTEL : le rebord qui dépasse, poli
  x.lineWidth=R*.02;x.strokeStyle=H?'#909090':'rgba(60,40,10,.42)';x.beginPath();x.arc(cx,cy,R*.912,0,6.2832);x.stroke();   // son pied
  const r=int?R*.68:R*.76;
  if(int){x.fillStyle=H?'#585858':g(r,int[0],int[1]);x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fill();
    x.strokeStyle=H?'#262626':'rgba(40,30,10,.55)';x.lineWidth=R*.028;x.stroke();} // la RAINURE où les deux métaux se rejoignent
  frappe(function(){for(let i=0;i<12;i++){const a=i/12*6.2832-Math.PI/2;richEtoile(x,cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8,R*.056);}},false); // les 12 étoiles
  if(face===0){ // l'arbre de vie dans l'hexagone, R F
    const fe=[];for(let i=0;i<70;i++){const a=rn()*6.2832,d=Math.sqrt(rn())*r*.48;fe.push(cx+Math.cos(a)*d,cy-r*.18+Math.sin(a)*d*.8);} // (tiré une fois : les deux images ont le même feuillage)
    x.fillStyle=H?'#cfcfcf':'rgba(60,42,12,.26)';for(let i=0;i<fe.length;i+=2){x.beginPath();x.arc(fe[i],fe[i+1],r*.036,0,6.2832);x.fill();} // le feuillage : le relief le dessine, la couleur à peine (en lumière décalée, il faisait des points blancs)
    frappe(function(){x.lineWidth=R*.03;x.beginPath();for(let i=0;i<=6;i++){const a=i/6*6.2832+Math.PI/6;x.lineTo(cx+Math.cos(a)*r*.82,cy+Math.sin(a)*r*.82);}x.stroke();
      x.fillRect(cx-r*.05,cy-r*.05,r*.1,r*.6);
      x.font=Math.round(r*.26)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('R',cx-r*.5,cy+r*.35);x.fillText('F',cx+r*.5,cy+r*.35);},true);
  }else{ // le chiffre, frappé
    frappe(function(){x.font=Math.round(r*(val.length>1?.5:.8))+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(val,cx,cy-r*.05);
      x.font=Math.round(r*.12)+'px "Press Start 2P",monospace';x.fillText(val.length>1?'EURO CENT':'EURO',cx,cy+r*.62);},true);
  }
}
function richTranche(x,H,k,c){ // la TRANCHE (bande 246-256) : h = le relief le long du tour
  if(!H){x.fillStyle=c;x.fillRect(0,244,512,12);}
  for(let i=0;i<512;i++){let h;
    if(k==='2')h=(i%4)<2?1:0;                                                  // le cordon fin
    else if(k==='1')h=Math.floor(i/(512/12))%2?((i%4)<2?1:0):.55;               // six segments striés, six lisses
    else if(k==='50')h=.5+.5*Math.cos(i/512*6.2832*41);                         // la fleur d'Espagne : des creux arrondis
    else h=(i%8)<4?1:0;                                                         // le crénelage large de la pièce-souvenir
    if(H){const v=Math.round(64+h*170);x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(i,244,1,12);}
    else if(h<.99){x.fillStyle='rgba(40,28,8,'+(.34*(1-h))+')';x.fillRect(i,244,1,12);}}}
const RICH_ARG=['#f8fafd','#bcc3cd'],RICH_OR=['#fff0b0','#d9ad48'],RICH_ORN=['#ffeba2','#d2a540']; // l'argent (cupronickel), l'or nordique du 1/2 €, celui des centimes — un cran plus vifs (2026-10-10)
function richTexPiece(k){
  const P=k==='2'?[RICH_ARG,RICH_OR]:k==='1'?[RICH_OR,RICH_ARG]:[RICH_ORN,null];
  return richDuo(function(x,H,rn){x.fillStyle=H?'#5c5c5c':P[0][1];x.fillRect(0,0,512,256);
    richFace(x,128,122,120,P[0],P[1],0,'',H,rn);richFace(x,384,122,120,P[0],P[1],1,k==='50'?'50':k,H,rn);
    richTranche(x,H,k,P[0][0]);});}
function richTexBtc(){return richDuo(function(x,H){x.fillStyle=H?'#5c5c5c':'#c8902e';x.fillRect(0,0,512,256);
  for(const cx of [128,384]){const cy=122,R=120,u=R/124;
    if(H)x.fillStyle='#5c5c5c';else{const G=x.createRadialGradient(cx-38,cy-40,10,cx,cy,R);G.addColorStop(0,'#fff0b0');G.addColorStop(1,'#bc7e1c');x.fillStyle=G;}x.beginPath();x.arc(cx,cy,R,0,6.2832);x.fill();
    x.lineWidth=R*.07;x.strokeStyle=H?'#ffffff':'rgba(255,248,222,.34)';x.beginPath();x.arc(cx,cy,R*.955,0,6.2832);x.stroke(); // le listel
    x.strokeStyle=H?'#d0d0d0':'rgba(90,55,10,.55)';x.lineWidth=3;for(let i=0;i<72;i++){const a=i/72*6.2832;x.beginPath();x.moveTo(cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8);x.lineTo(cx+Math.cos(a)*R*.89,cy+Math.sin(a)*R*.89);x.stroke();} // le crénelage
    if(H)x.fillStyle='#4c4c4c';else{const O=x.createRadialGradient(cx-25,cy-23,8,cx,cy,R*.79);O.addColorStop(0,'#ffb347');O.addColorStop(1,'#e2760c');x.fillStyle=O;}x.beginPath();x.arc(cx,cy,R*.79,0,6.2832);x.fill(); // l'émail (en creux)
    x.save();x.translate(cx,cy);x.rotate(.24);x.fillStyle=H?'#e8e8e8':'#fff';x.font=Math.round(104*u)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('B',4*u,6*u);
    x.fillRect(-22*u,-72*u,11*u,26*u);x.fillRect(4*u,-72*u,11*u,26*u);x.fillRect(-22*u,46*u,11*u,26*u);x.fillRect(4*u,46*u,11*u,26*u);x.restore();} // ₿ : le B et ses deux barres
  richTranche(x,H,'btc','#e8b048');});}
function richTexUni(c){return richCv(4,4,function(x){x.fillStyle=c;x.fillRect(0,0,4,4);});}
/* (2026-10-10, Léo : « les billets, on peut faire plusieurs couleurs — les liasses restent vertes ») UNE SÉRIE : une couleur par valeur ; le 100 est
   celui des liasses. (2026-10-16 : la série est redessinée, voir richTexBillet.) */
/* (2026-10-16, Léo, après les billets « de sa toile » : « trop moches, ils étaient mieux ; le style enfantin dégoûte ; fais juste le chiffre
   écrit de manière CARRÉE — de ma toile, garde seulement l'EMPLACEMENT du chiffre — dans le style de la première version, et plus joli » ;
   la série : 10 rouge (comme l'ancien), 20 bleu « plus français », 50 orange, 100 vert en dégradé (un peu plus vert), 500 violet ; le rose,
   le jaune et le 200 s'en vont) LES BILLETS v3 : le papier de la 1re version (dégradé, guilloche, double cadre, rosace, bande), un voile clair
   au milieu (le filigrane), et la valeur en GRAND au milieu, en lettres carrées (la police pixel du jeu), frappée : ombre d'encre, contour,
   dégradé clair, un fil de lumière. Le 20 a sa tour Eiffel dans la rosace et sa bande BLEU-BLANC-ROUGE ; le 500 est violet et OR. */
const RICH_BILLETS=[ // (2026-10-20, Léo : « chaque billet une plus belle couleur, un dégradé de DEUX couleurs sur chacun ; le 500 en blanc aussi ») c:[départ, arrivée] = le dégradé en diagonale ; l = la couleur des filets/guilloches ; sh = le reflet qui glisse
  {v:'10', m:'DIX DOLLARS',       c:['#7a0c2c','#ff6a58'],l:[255,170,190],sh:[1,.6,.7]},   // grenat → framboise (peu saturé au départ : l'étalonnage du jeu sature ×1,4)
  {v:'20', m:'VINGT FRANCS',      c:['#1a2cae','#30d8ff'],l:[150,215,255],sh:[.55,.85,1],fr:1}, // bleu roi → turquoise, à la française
  {v:'50', m:'CINQUANTE DOLLARS', c:['#d0340a','#ffc83a'],l:[255,215,140],sh:[1,.82,.45]},  // orange brûlé → ambre doré
  {v:'100',m:'CENT DOLLARS',      c:['#0a6a50','#86ec62'],l:[160,255,205],sh:[.5,1,.65]},  // vert sapin → vert menthe
  {v:'500',m:'CINQ CENTS DOLLARS',c:['#4a14c4','#ee5ccc'],l:[225,175,255],sh:[.9,.7,1],or:1}]; // violet → magenta ; les filets restent dorés, le chiffre est BLANC
const RICH_B100=3;
function richTexBillet(B){return richCv(512,236,function(x,w,h){
  const L=function(k,a){const c=B.l.map(function(v){return Math.round(v+(255-v)*k);});return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}, // la couleur des traits, éclaircie de k
    O=function(a){return 'rgba(255,214,128,'+a+')';},T=B.or?function(k,a){return O(a);}:L,F='"Press Start 2P",monospace';
  const G=x.createLinearGradient(0,0,w,h);G.addColorStop(0,B.c[0]);G.addColorStop(1,B.c[1]);x.fillStyle=G;x.fillRect(0,0,w,h); // (2026-10-20) UN dégradé de deux couleurs, en diagonale
  x.lineWidth=1;for(let k=0;k<26;k++){x.strokeStyle=L(0,.09);x.beginPath();for(let i=0;i<=w;i+=6)x.lineTo(i,h/2+Math.sin(i*.03+k*.5)*h*.42*Math.sin(k*.21+1));x.stroke(); // la guilloche, deux familles croisées
    x.strokeStyle=L(.1,.05);x.beginPath();for(let i=0;i<=w;i+=6)x.lineTo(i,h/2-Math.sin(i*.024+k*.61)*h*.4*Math.sin(k*.17+2));x.stroke();}
  x.strokeStyle=T(.25,.42);x.lineWidth=3;x.strokeRect(10,10,w-20,h-20);x.lineWidth=1;x.strokeRect(18,18,w-36,h-36);           // le double cadre
  x.fillStyle=T(.3,.5);for(const [a,b] of [[14,14],[w-22,14],[14,h-22],[w-22,h-22]])x.fillRect(a,b,8,8);                      // ses coins
  const rx=96,ry=118;for(let i=0;i<14;i++){x.strokeStyle=T(0,.07+i*.012);x.beginPath();x.ellipse(rx,ry,58-i*4,58-i*4,0,0,6.2832);x.stroke();} // la rosace
  x.strokeStyle=T(.2,.16);for(let i=0;i<12;i++){x.save();x.translate(rx,ry);x.rotate(i*Math.PI/6);x.beginPath();x.ellipse(0,-30,9,26,0,0,6.2832);x.stroke();x.restore();}
  if(B.fr){x.fillStyle=L(.6,.85);x.beginPath();x.moveTo(rx-22,ry+40);x.lineTo(rx-6,ry-6);x.lineTo(rx-2,ry-38);x.lineTo(rx,ry-50);x.lineTo(rx+2,ry-38);x.lineTo(rx+6,ry-6);x.lineTo(rx+22,ry+40); // la TOUR EIFFEL
    x.lineTo(rx+12,ry+40);x.quadraticCurveTo(rx,ry+18,rx-12,ry+40);x.closePath();x.fill();x.fillRect(rx-13,ry+14,26,4);x.fillRect(rx-8,ry-10,16,3);x.fillRect(rx-1,ry-58,2,9);}
  else{x.fillStyle=T(.55,.85);x.font='44px '+F;x.textAlign='center';x.textBaseline='middle';x.fillText('$',rx+2,ry+2);}
  const n=B.v.length,fz=n>2?74:92,cx=w*.555,cy=h*.53;x.font=fz+'px '+F;x.textAlign='center';x.textBaseline='middle'; // LE GRAND CHIFFRE CARRÉ, là où le pose la toile de Léo
  {const tw=x.measureText(B.v).width,px=cx-tw*.5-16,py=cy-fz*.5-13,pw=tw+32,ph=fz+26;x.fillStyle='rgba(0,0,0,.3)';richRond(x,px,py,pw,ph,10);x.fill(); // (2026-10-16, Léo : « plus visibles les numéros ») un CARTOUCHE sombre sous le chiffre (le voile clair d'avant le noyait)
   x.strokeStyle=T(.45,.4);x.lineWidth=2;richRond(x,px+4,py+4,pw-8,ph-8,7);x.stroke();}
  x.save();x.shadowColor=B.or?'rgba(255,232,170,.55)':'rgba(255,255,255,.55)';x.shadowBlur=28;x.shadowOffsetX=2000;x.fillStyle='#fff';x.fillText(B.v,cx-2000,cy);x.restore(); // (2026-10-20, Léo) LA LUEUR : un halo blanc doux autour du chiffre, peint dans la toile (le chiffre est dessiné hors toile, seule son ombre floue reste) — la lumière qu'il pose sur le papier ; le chiffre lui-même luit dans le programme (uLum)
  x.fillStyle='rgba(0,0,0,.55)';x.fillText(B.v,cx+6,cy+7);                                                                  // son ombre d'encre
  x.lineJoin='miter';x.lineWidth=9;x.strokeStyle='rgba(0,0,0,.72)';x.strokeText(B.v,cx,cy); /* (2026-10-20) contour, taille et ombre REMIS comme avant (Léo : « remets les numéros comme avant ») */                                  // son contour, épais
  const Z=x.createLinearGradient(0,cy-fz*.5,0,cy+fz*.5);if(B.or){Z.addColorStop(0,'#fff8dc');Z.addColorStop(.5,'#ffd970');Z.addColorStop(1,'#e2a73c');}else{Z.addColorStop(0,'#ffffff');Z.addColorStop(.55,L(.88,1));Z.addColorStop(1,L(.7,1));} // (2026-10-20) le 500 aussi en BLANC (chaud à peine)
  x.fillStyle=Z;x.fillText(B.v,cx,cy);x.save();x.beginPath();x.rect(0,cy-fz*.5,w,fz*.16);x.clip();x.fillStyle='rgba(255,255,255,.45)';x.fillText(B.v,cx,cy);x.restore(); // dégradé clair, et le fil de lumière en haut
  x.font='20px '+F;x.fillStyle=T(.8,.95);x.textAlign='left';x.fillText(B.v,30,42);x.textAlign='right';x.fillText(B.v,w-30,h-38); // les petites valeurs aux coins (un cran plus grandes, plus claires)
  x.textAlign='center';x.font='11px '+F;x.fillStyle=T(.55,.8);x.fillText('CASH CAR',cx,h*.2);
  x.font='7px '+F;x.fillStyle=L(.3,.55);x.fillText((B.fr?'REPUBLIQUE DU CIEL':'BANQUE CENTRALE DU CIEL')+' · '+B.m,cx,h*.84);
  x.textAlign='left';x.fillText('CC '+(4100+B.v.length*977+B.v.charCodeAt(0)*13),30,h-34);                                   // le numéro de série
  const bx=w*.8,bw=w*.075;
  if(B.fr){[['rgba(30,70,200,.75)',0],['rgba(245,245,250,.75)',1],['rgba(220,30,50,.75)',2]].forEach(function(q){x.fillStyle=q[0];x.fillRect(bx+q[1]*bw/3,0,bw/3+.5,h);});} // la bande BLEU-BLANC-ROUGE
  else{const Bd=x.createLinearGradient(0,0,0,h);Bd.addColorStop(0,B.or?'rgba(255,220,140,.5)':'rgba(255,160,220,.38)');Bd.addColorStop(.5,B.or?'rgba(255,245,200,.62)':'rgba(150,250,255,.42)');Bd.addColorStop(1,B.or?'rgba(210,150,60,.5)':'rgba(255,230,140,.38)');x.fillStyle=Bd;x.fillRect(bx,0,bw,h); // la bande irisée
    x.strokeStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++){x.beginPath();x.moveTo(bx+4+i*6,0);x.lineTo(bx+4+i*6,h);x.stroke();}}
});}
function richTexTrefle(){return richCv(256,256,function(x){x.clearRect(0,0,256,256);
  x.strokeStyle='#2f7a2a';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(128,132);x.quadraticCurveTo(150,190,132,248);x.stroke(); // la tige
  for(let i=0;i<4;i++){x.save();x.translate(128,128);x.rotate(i*Math.PI/2+Math.PI/4);
    const G=x.createLinearGradient(0,0,0,-110);G.addColorStop(0,'#1f6f2a');G.addColorStop(1,'#4fbf4a');x.fillStyle=G;
    x.beginPath();x.moveTo(0,-4);x.bezierCurveTo(-62,-34,-58,-112,-16,-108);x.bezierCurveTo(-6,-106,0,-96,0,-88);x.bezierCurveTo(0,-96,6,-106,16,-108);x.bezierCurveTo(58,-112,62,-34,0,-4);x.fill(); // un cœur
    x.strokeStyle='rgba(225,255,215,.55)';x.lineWidth=5;x.beginPath();x.moveTo(-22,-62);x.lineTo(0,-46);x.lineTo(22,-62);x.stroke(); // le chevron pâle
    x.strokeStyle='rgba(20,70,25,.45)';x.lineWidth=2;x.beginPath();x.moveTo(0,-6);x.lineTo(0,-84);x.stroke();x.restore();}});}
function richTexEtoile(){return richCv(128,128,function(x){x.clearRect(0,0,128,128);
  const C=x.createRadialGradient(64,64,0,64,64,22);C.addColorStop(0,'rgba(255,255,255,1)');C.addColorStop(.4,'rgba(255,250,235,.55)');C.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=C;x.fillRect(0,0,128,128);
  for(const [a,l,w] of [[0,62,3.2],[Math.PI/2,62,3.2],[Math.PI/4,30,1.8],[-Math.PI/4,30,1.8]]){x.save();x.translate(64,64);x.rotate(a);
    const g=x.createLinearGradient(-l,0,l,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;
    x.beginPath();x.moveTo(-l,0);x.lineTo(0,-w);x.lineTo(l,0);x.lineTo(0,w);x.fill();x.restore();}});} // l'éclat : quatre branches fines et un cœur doux
function richTexFlamme(){return richCv(128,128,function(x){x.clearRect(0,0,128,128);
  const G=x.createRadialGradient(64,64,0,64,64,62);G.addColorStop(0,'rgba(255,250,235,1)');G.addColorStop(.25,'rgba(255,214,140,.75)');G.addColorStop(.55,'rgba(255,128,40,.3)');G.addColorStop(1,'rgba(200,40,10,0)');
  x.fillStyle=G;x.fillRect(0,0,128,128);});}

