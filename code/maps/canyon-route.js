/* =========================== LE CANYON DES GÉANTS (2026-10-14, Sacha) ===========================
   Sacha : « fais une map façon canyon Monument Valley mais genre géant, avec des grandes gorges où la route passe entre, au-dessus des
   lits de rivière, entre deux grandes parois de pierre ; il faut quand même que la route descende vers le bas, pas comme la map montagne
   chinoise ; fais quelque chose de magnifique où tu t'amuses sur les couleurs de la roche, avec des teintes jaune et rose ; la map doit
   avoir le même niveau d'exigence que les autres, et toutes les météos et heures de la journée parfaitement gérées et adaptées à un biome
   désertique ».
   · LA ROUTE (`genCanyon`) : elle PLONGE comme celle des nuages (MESURÉ sur la MER DE NUAGES : pente médiane ~30°, 7,8 km de dénivelé
     sur 18 km — les Pics de jade, eux, restent à plat) le long d'une rivière qui serpente : la vallée des MITAINES au départ, LA BRÈCHE (le
     grand plongeon dans la gorge), les méandres et leurs bosses, LE FER À CHEVAL, LES ÉTROITS, L'ARCHE, L'AMPHITHÉÂTRE, le DOS DE CHAMEAU,
     la finale. Jamais deux tronçons trop proches (contrôle à la génération, nouvel essai sinon) ; son propre flux de hasard (UN tirage de rnd).
   · LE MONDE (`buildCanyon`) : un relief calculé autour de la route — la rivière en VASQUES et en CASCADES sous la dalle (une rivière ne
     remonte jamais : le lit suit le minimum de la route moins sa hauteur), ses berges, les PAROIS (un profil par section : gorge en U,
     étroits presque verticaux, amphithéâtre en gradins), le PLATEAU en ESCALIER qui descend avec la route (des escarpements tous les
     ~250 m de dénivelé), les BUTTES de Monument Valley posées dessus (une grille de 760 m, loin de la route). Quatre textures de données :
     la TAILLE fine (le creusement et l'eau, 9 m), le PLATEAU (48 m, jusqu'au plan lointain), la hauteur d'OMBRE (le soleil de l'heure,
     balayé une fois sur la grille), et deux bruits partagés avec le processeur (la collision lit EXACTEMENT les mêmes données que la puce).
   · LE RENDU (`CY_VS`/`CY_FS`) : un terrain GPU à niveaux de détail continus (CDLOD : UN maillage de grille en instances, choisi par un
     quadtree à chaque image, qui se MORPHE d'un niveau à l'autre — ni fissure ni saut) ; la hauteur se lit dans les textures et se taille
     en CORNICHES (marches de 15-26 m, contremarches franches) ; les STRATES (une colonne de 1 024 couches : crème, jaune beurre, saumon,
     rose, corail, ocre, lavande, brique), le litage oblique des grès, le VERNIS du désert qui coule sous les corniches, le sable et le
     maquis sur les replats, la ripisylve verte au bord de l'eau ; la lumière : le soleil (et l'ombre portée des parois), le ciel qui
     s'assombrit au fond de la gorge, le REBOND chaud des parois éclairées dans l'ombre, l'eau turquoise (vasques, reflets de la gorge,
     cascades blanches), la brume du matin au fond, la boue de l'orage, l'éclair.
   · L'HEURE : c'est le seul niveau où le SOLEIL BOUGE (`cyA` de chaque ambiance : hauteur et azimut) — bas et rose à l'aube, haut à midi
     (la gorge s'allume), rasant le soir, la lune la nuit. `canyonSoleil` pose SUN_DIR dans la boucle ; ailleurs il revient à sa valeur
     d'origine AU BIT PRÈS (SUN_DIR0). Le ciel est à lui (`canyonCiel`, un programme dédié : dégradé du désert, ceinture de Vénus, soleil,
     nuages, mesas à l'horizon, Voie lactée et lune la nuit, plafond de pluie, enclumes d'orage).
   · RÈGLE D'OR : aucun relief ne touche la route, dessus ni dessous (`dbgCanyon('test')`). En vol, la roche, l'eau et le fond TUENT
     (`canyonHeurt` → « ENCASTRÉ DANS LA PAROI », « AU FOND DU CANYON »).
   Console : `dbgCanyon()` (état, temps de construction) · `dbgCanyon('test')` (la règle d'or) · `dbgCanyon('vue',d,h,cap)` (photo figée)
   · `?carte=canyon&meteo=soir` (ou `dbgClassique('canyon','orage')` puis `dbgSaut()`). */
const NIV_CANYON={id:'canyon',nm:'CANYON DES GÉANTS',bio:['canyonSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'canyon',pr:'LES PAROIS NE PARDONNENT PAS'};
const CANYON_OK=!!(renderer.capabilities&&renderer.capabilities.isWebGL2); // les textures de données en flottants et la lecture de textures au sommet
PAL.B.cyFin=[16,14,12];PAL.B.cyPlat=[96,80,64];PAL.B.cyOmbre=[36,32,27];PAL.B.cyGrille=[16,16,32];PAL.B.cyR0=[85,100,118];PAL.B.cyChem=[120,200,300];PAL.B.cyArbres=[260,450,700];PAL.B.cyDet=[0,1,2];PAL.B.cyPous=[40,90,160]; /* (2026-11-11, Léo : « trouve un life hack », suite de Jade) LE CANYON SUR TÉLÉPHONE RÉCENT. MESURÉ sur l'iPhone 15 (banc appareils simulés) : 22-23 ms par image au palier 2 (cadence tombée à 30) contre 12-13 ms au palier 1, à résolution plus haute. Comparé sur le même iPhone : la GRILLE du relief (32 → 16, 4 fois moins de triangles) et son DÉTAIL (2 → 1) suffisent : 12 ms, cadence 60 ; peupliers, cheminées, poussière et ombres restent au maximum. L'ordi garde tout. `?cyleger=0` = avant, `=1` = grille et détail (défaut du téléphone), `=2` = toutes les valeurs moyennes. */
{const m9=/[?&]cyleger=([012])/.exec(location.search),n9=m9?+m9[1]:(ALLEGE?1:0);if(n9)for(const k9 of (n9===1?['cyGrille','cyDet']:['cyFin','cyPlat','cyOmbre','cyGrille','cyR0','cyChem','cyArbres','cyDet','cyPous']))PAL.B[k9][2]=PAL.B[k9][1];} // (2026-10-14, CANYON) la finesse du relief par palier [ancien, moyen, récent]
const SUN_DIR0=SUN_DIR.clone(),CY_UP=new THREE.Vector3(0,1,0),CY_SD=new THREE.Vector3(); // le soleil d'origine : il revient au bit près hors du canyon
const CY={Q:null,on:false,ms:{},yMin:-1e4,yMax:1e4,ombre:1,prof:0,mesh:null,mat:null,geo:null,aN:null,maxN:900,G:32,S0:64,R0:118,lods:7,
  F:null,Z:null,O:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),box:new THREE.Box3(),n:0,v:new THREE.Vector3(),sol:null};
/* LA ROUTE v2 (2026-10-14 soir, Sacha : « le but du jeu est de prendre des RACCOURCIS en coupant la route quand une autre la croise plus
   bas » + « c'est un jeu de COURSE, pas de balade : plus de virages ») — droites et arcs (≤ 8° par point), la PENTE en grade (dy/dx).
   Le cap reste dans ±58° de l'axe (la piste ne revient jamais sur elle-même… SAUF dans les BOUCLES, faites pour ça). LV élargit les rayons.
   LA BOUCLE (le raccourci) — un TROMBONE qui descend : l'APPROCHE (droite, la zone de saut), un demi-tour R1, le RETOUR, un demi-tour R2
   plus serré, la SORTIE. R2 = R1 − e/2 : la sortie court PARALLÈLE à l'approche, décalée de e (~90 m d'axe à axe, ~35 m de vide entre
   les bords) et PLUS BAS de `dh` (~120 m) — puis elle passe SOUS le premier demi-tour (la route repasse sous elle-même). Celui qui sort
   par le bord de l'approche retombe sur la sortie : il saute ~2 km de route. Les repères `racX0/racX1` (approche) et `racX2/racX3`
   (la sortie, sous l'approche) sont relus par buildCanyon → `CY.rac`. */
/* LE CANYON AU HASARD (2026-10-19, Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») — MESURÉ (40 graines, palier 0) : la graine
   changeait à chaque partie, mais genCanyon suivait toujours la même RECETTE : plein nord (±11°), Route 67 → brèche → fer à cheval/raccourci → arche →
   finale, aux mêmes % du parcours (écart de forme 0,08 ; la jade après son tirage : 0,26). Désormais chaque canyon tire :
   · son AXE (±`axe`° autour du nord) et ses COUDES : entre deux pièces, `coude` fois sur 1, l'axe tourne de ±10-25° (±`cmax`° au plus) ;
   · ses PIÈCES et leur ORDRE entre le départ (Route 67 + brèche, gardés) et la finale (le tunnel) : un raccourci et une pièce toujours (l'arche
     ou l'amphithéâtre le plus souvent : poids `PDS`), puis, mélangées, celles que la longueur tient parmi les étroits, les monuments, la mine, le
     dos de chameau, les bosses et un 2e raccourci (hors JOUER : tout, huit raccourcis) ;
   · un CARACTÈRE par liaison — méandres, gorge, serpent, dérive, cassures — ou un module (`mod` : la part des liaisons qui en sont un) ;
   · sa PENTE (les liaisons ×0,85-1,2) et sa LONGUEUR : longueurCible() × `kL` ±8 % (la longueur réelle d'avant au palier 0, celle sur laquelle la
     durée des maps a été mesurée : 46 s) ; `lien` = la longueur moyenne d'une liaison au JOUER (×LL).
   MESURÉ (banc des tracés, 40 graines, palier 0 → 25) : écart de forme 0,08 → 0,26 ; 1 → 17 ordres des pièces ; longueur/visée 1,34 (avant 1,34) ;
   rayon mini 1,11 × RMIN au palier 0, 1,0 au palier 25 (comme avant) ; aucun croisement hors des boucles ; 4-23 ms par tracé.
   Le relief, la rivière, les parois et tous les décors (Mitaines, station, arche, cheminées, mine, tunnel) sont posés AUTOUR de la route : ils suivent ;
   le soleil de l'heure (`cyA`) reste celui du monde — il ne tombe plus toujours du même côté de la route. `?sans=canyonhasard` = la recette d'avant,
   au tirage près ; `dbgCanyon().hz` = l'axe, la pente, la longueur visée et les pièces dans l'ordre. */
const CY_HZ={on:!/[?&]sans=([^&]*,)?canyonhasard(,|&|$)/.test(location.search),axe:55,kL:1.34,mod:.75,lien:150,coude:.65,cmax:28};
/* ===== LE CANYON AU HASARD, SON DÉCOR (2026-10-20, Sacha : « volcan, grotte, dune : ces maps ne sont pas générées aléatoirement, il faut que chaque map soit
   aléatoire avec des modules et des décors qui changent ») ===== — le tracé changeait déjà (écart de forme 0,29), le DÉCOR jamais : les mêmes strates jaune-rose,
   les Mitaines et leur mesa, la même station-service à droite à 430 m, la même rivière pleine, les mêmes peupliers, cinq vautours. Chaque canyon tire
   désormais (`cyTirage`, un flux à lui né de la graine) : la PALETTE des strates (classique, rouge de Sedona, crème de Zion, désert peint lavande, ocre de
   Bryce), la brume du fond, la rivière (pleine, basse, à sec : un lit de sable), la densité des buttes au loin, les Mitaines (les deux, l'une, aucune ;
   la mesa ; leur taille), les cheminées de fées (combien), la ripisylve (combien, verte, dorée d'automne, sombre), les éboulis du fond (0 à 400 blocs),
   les vautours (2 à 9), la mine (présente ou non ; ses filons, ses cadres, ses torches), la Route 67 (la station : là ou pas, à gauche ou à droite, plus ou
   moins loin ; le panneau ; un MOTEL ; des carcasses de voitures ; des cactus ; des panneaux publicitaires). Aucun programme neuf (la colonne des strates est
   réécrite dans SA texture ; le reste : des pavés cuits, la matière des arbres). `?sans=canyondecor` = le décor d'avant ; `?sans=canyonmodules` = le paquet
   de modules d'avant (4 sortes ; 7 désormais) ; `dbgCanyon().deco` = le tirage. */
const CY_DECO={on:!/[?&]sans=([^&]*,)?canyondecor(,|&|$)/.test(location.search),mods:!/[?&]sans=([^&]*,)?canyonmodules(,|&|$)/.test(location.search)};
/* ===== LA REFONTE DU CANYON (2026-11-12, Sacha : « c'est de loin la map la plus dure… des modules plus exploratifs : on est dans une gorge serrée et puis, bam, on arrive dans une plus
   grande gorge avec une rivière en dessous, et on prend une route le long de la falaise… plus de passages plus larges… des modules plus variés, sans grand demi-tour où il faut aller en
   arrière… qui exploitent beaucoup les parois, agréables à rider ») =====
   MESURÉ avant (outils/banc-routes/canyon.cjs, 40 graines, palier 0) : un canyon de 6,2 km = la Route 67, la brèche, puis 3 pièces seulement — dont TOUJOURS le raccourci en trombone
   (deux demi-tours de 180°, 1,5 à 2 km : 30 % de la map) ; 64 % de la route en gorge SERRÉE (la paroi à 5 m du bord des deux côtés), 3 liaisons sur 4 = un module de virages serrés.
   Désormais LA LARGEUR EST UN OUTIL : chaque pièce et chaque liaison déclare son GABARIT (`CY.gab`, relu par cyBatitG) —
     fente (les étroits, le goulot) · gorge serrée (le défaut : la paroi à 5 m) · ouvert (le pied des parois à ~70 m de l'axe) · large / vallée (150-170 m, la route au ras de l'eau) ·
     CORNICHE (la route colle UNE falaise, le vide de l'autre côté, la rivière 200 m plus bas : l'axe de la vallée est décalé de la route — `S.of`, voir cyProfil).
   LES PIÈCES NEUVES : `gorge` LA GRANDE GORGE (un goulot en fente, puis la gorge s'ouvre en ~1 s : trois grandes courbes en corniche qui descendent vers l'eau) · `meandre` LE GRAND MÉANDRE
   (deux grands coudes opposés en corniche ; entre les deux la route TRAVERSE la gorge en pont, d'une falaise à l'autre) · `traversee` LA TRAVERSÉE (le pont seul) · `toboggan` LE TOBOGGAN
   (3 grandes courbes enchaînées, la dalle relevée de 32° d'un côté puis de l'autre : un bobsleigh) · `vire` LA VIRE (un mur doux : 58°, ~4,6 s) · `riviere` LE LIT DE LA RIVIÈRE (on descend
   au ras de l'eau dans une vallée large) et LE SAUT DE LA CASCADE (la rivière tombe, la route plonge : on décolle droit vers une longue réception).
   LES MODULES NEUFS (liaisons) : `courbes` les grandes courbes (2,4-3,3 RMIN) · `entonnoir` une courbe dont le rayon se resserre (3,2 → 1,5 RMIN) · `tremplin` une crête et une longue réception.
   LE JEU DE PIÈCES : la grande gorge et le rapide toujours ; une pièce de PAROI ou d'EAU (toboggan, vire, grand mur, rivière, méandre ou traversée) ; puis ce que la longueur tient
   (les mêmes, l'arche, l'amphithéâtre, les étroits, la mine, le dos de chameau, les bosses). L'ORDRE alterne large et serré ; LA LIAISON dépend de ses voisines : entre deux larges, du TECHNIQUE aux parois serrées (slalom, chicane, goulet : `tech` par canyon au plus,
   rayons × `kTech`) ; sinon un souffle (droite franche) ou un module coulé en gabarit ouvert. LE TROMBONE (le raccourci, la seule pièce à demi-tours) devient RARE : dans `rac` canyons
   sur 1 (Sacha, le 12/11, une fois dit qu'aucun raccourci n'existe sans boucle : « trombone ok »), à la place de la 2e pièce due ; hors de lui, aucun cap à plus de 86° de l'axe.
   ⚠ MESURÉ au calcul : sans boucle, AUCUN raccourci « rentable » n'est possible à 78 m/s (rayon mini 68 m, 2-3 s de vol = 156-234 m : un détour sans demi-tour n'allonge la route que de
   quelques mètres) — le canyon y gagne des SAUTS (cascade, tremplin, whoops, bosses) ; le raccourci de distance reste celui du trombone, quand il sort. `?sans=canyonrefonte` = le canyon d'avant, au tirage près. */
/* ===== LA ROUTE SUR LES PAROIS ET LA VOÛTE (2026-11-13, Sacha : « la route est toujours plate : elle pourrait être torsadée et longer les parois des canyons par moments, jouer sur le côté sans dessus dessous ») =====
   MESURÉ avant (banc, 80 graines) : 6 % de la route penchée de plus de 20°, 1 % de plus de 60° — le roulis n'existait que dans trois pièces. Désormais :
   · LA CORNICHE SE COUCHE : chaque courbe de la grande gorge, du méandre et de la traversée qui tourne vers le VIDE (la falaise est à l'extérieur, comme un mur de la mort) penche la dalle
     jusqu'à `corMax`° contre la paroi — le même dévers que le grand mur (cyMurBank), avec son plan de roche ; cyProfil mêle le décalage de la corniche (S.of) et ce plan (S.mu) ;
   · `pipe` LE HALF-PIPE : trois grandes courbes alternées, la dalle montée à `pipeMax`° (80°) d'un côté puis de l'autre : on monte sur une paroi, on traverse, on monte sur l'autre ;
   · la vire et le toboggan penchent plus (84° et 48°) ; ils sortent plus souvent (le grand mur, la vire, le pipe, le toboggan : quatre pièces de paroi, trois au plus par canyon) ;
   · `voute` LA VOÛTE (le « sans dessus dessous ») : un TUBE de grès de 10 s de long (`vouteT`) que la route traverse en faisant UN TOUR COMPLET de roulis (0 → 360°, lisse : 54°/s au plus) —
     on monte sur une paroi, on passe au plafond (~4,5 s à l'envers), on redescend par l'autre. Le relief est un terrain : il ne sait pas faire de plafond ; le tube est un maillage cuit
     (canyon-voute.js) qui tourne AVEC la dalle (sa section est fixe dans le repère de la route), la gorge s'élargit autour (gabarit `tonneau`, parois à 170 m, rivière à 120 m au moins)
     et le plan de roche des murs y est coupé (S.mu = 0 : il ne sait pas faire de dessous). Au plus une voûte par canyon, dans ~1 canyon sur 3.
   `?sans=canyonvoute` : sans la voûte · `?sans=canyonrefonte` : le canyon d'avant. */
const CY_REF={on:!/[?&]sans=([^&]*,)?canyonrefonte(,|&|$)/.test(location.search),tech:2,kTech:1.15,vireT:4.6,vireMax:84,tobMax:48,rac:.25,corMax:66,pipeMax:80,vou:!/[?&]sans=([^&]*,)?canyonvoute(,|&|$)/.test(location.search),vouteT:10,vouteW:5.5};
function* genCanyon(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais et pendant la mesure des écarts
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;
  const LV=lvPiste(),RS=1.25+.3*(LV-1),LL=1+Math.min(1.3,(LV-1)*.5),SQ=Math.sqrt(LV),g0=(rnd()*4294967296)>>>0;
  // LE RAYON MINIMAL TENABLE à la vitesse du palier (règle RACCOURCIS de GAMEPLAY : 40 + 0,3 × la croisière du palier en m/s — le vrai
  // plafond du joueur, lacetMax ; dessous un virage est INFRANCHISSABLE) : rayonPalier() du jeu s'il est là, ×1,08 de marge
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);CY.rmin=Math.round(RMIN);
  let best=null,bestSep=-1,bestNote=1e9;const cib9=rythmeCible('canyon'),notes9=[]; /* (2026-11-05, LE DIRECTEUR DE RYTHME) l'essai gardé : écarts tenus ET la meilleure note de rythme (route-rythme.js) */
  for(let essai=0;essai<14;essai++){if(essai)yield;
    const r=mulberry32((g0+essai*0x9E3779B1)>>>0),C=[],Q={},P=new THREE.Vector3(0,0,0),BO=[];let phi=0,AX9=0,cDette=0;const LIM=58*Math.PI/180,V2=GEN_V2,A26=BRIQUE.angMin,A28=A26+3,recad=(d,t)=>{const q=briqueRecadre(d,t||0);if(q.dessine&&Math.abs(q.dessine)<A28)return {dessine:0,dette:q.dessine};return q;}; /* A28 : le banc mesure un arc de 26° à 25° (spline) — on dessine 29° au moins */ /* AX9 : (AU HASARD) le COUDE de l'axe — 0 dans la recette d'avant */
    const push=()=>C.push(P.clone()),ici=k=>{Q[k]={p:P.clone(),phi:phi+AX9};};
    let aSg=0,aR=0; /* (2026-11-07 soir) le côté et le rayon du dernier arc, tant qu'aucune droite ne l'a suivi : à l'INFLEXION de deux arcs opposés serrés (sous 2 rP), la courbe lissée fait une pointe sous rP (5-25 m au palier 20) */
    const droite=(l,pe,n)=>{aSg=0;if(CY_V3.on)n=Math.max(n||0,Math.ceil(l/90)); /* (V3, la charte, R2) un point tous les 90 m au plus : au palier 20 une droite de 650 m n'avait que 2 points, et le lissage des pentes (lisserRaccords) étalait chaque cassure sur un kilomètre — la réception « à plat » d'une cascade ressortait à 10° */n=V2?Math.max(1,Math.min(n||Math.round(l/90),Math.floor(l/40))):(n||Math.max(2,Math.round(l/90))); /* (2026-11-07, GÉNÉRATION PROPRE) v2 : un point tous les 40 m au moins */for(let k=0;k<n;k++){P.x+=Math.sin(phi+AX9)*l/n;P.z+=Math.cos(phi+AX9)*l/n;P.y+=pe*l/n;push();}};
    const arc=(aDeg,R,pe)=>{R=Math.max(R,RMIN);if(V2&&aSg&&Math.sign(aDeg)!==aSg&&(R<2*RMIN||aR<2*RMIN))droite(Math.max(30*LL,.25*VW),(pe||0)*.5,1);aSg=Math.sign(aDeg);aR=R;const n=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
      for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi+AX9)*ch;P.z+=Math.cos(phi+AX9)*ch;P.y+=pe*ch;phi+=st/2;push();}};
    const recentre=pe=>{if(V2){const t=recad(-phi*57.2958,0);cDette=t.dette;if(t.dessine)arc(t.dessine,RMIN*(2.2+r()*1.0),pe);return;} /* v2 : sous 8° rien, 8-26° une dette reportée sur le prochain vrai virage, au-delà un vrai virage */if(Math.abs(phi)>.06)arc(-phi*57.2958,RMIN*(2.2+r()*1.0),pe);}; /* (2026-11-05, LE DIRECTEUR DE RYTHME) les rayons de liaison en RAYONS TENABLES (RMIN) : à (230-350)×RS, au palier 0 c'était 4 rP et plus — une droite qui penche (banc : 1,5 virage/km, des droites de 24 s) */ // (2026-10-15) R 300-450 : à 520-720 le retour au cap faisait 900 m qu on prenait pour une droite
    /* (2026-11-13, LE CANYON V3, la charte des routes R1) VISER UN CAP et BALANCER : `vise` tourne du cap actuel jusqu'à `c9` (radians, autour de l'axe) ; `zig` enchaîne des arcs
       qui vont d'un côté de l'axe à l'autre (±A/2, A tiré dans [a0, a1]°, rayon [k0, k1] × RMIN, `dr` : la part de courtes droites entre deux). Un S qui ne fait que revenir au cap
       (0 → 50° → 0) laisse la route « dans la même direction » au sens du juge (un cône de 30° autour de la direction d'entrée) — MESURÉ : 13 à 16 s dans un pipe, une gorge, des courbes */
    const vise=(c9,R,pe)=>{cDette=0;const a=(c9-phi)*57.2958;if(Math.abs(a)>.5)arc(a,R,pe);},
      zig=(len,p0,p1,a0,a1,k0,k1,dr)=>{let f9=0,sg=phi>.01?-1:phi<-.01?1:(r()<.5?-1:1);while(f9<len){const A=(a0+r()*(a1-a0))/57.2958,R=RMIN*(k0+r()*(k1-k0)),d9=Math.abs(sg*A/2-phi);vise(sg*A/2,R,-(p0+r()*(p1-p0)));f9+=R*d9+1;sg=-sg;
        if(dr&&r()<dr){const l=(60+r()*60)*LL;droite(l,-(p0+r()*(p1-p0))*.8);f9+=l;}}};
    // LES VIRAGES DE COURSE (règle RACCOURCIS de GAMEPLAY : ≥ 2,5 virages/km de rayon < 250 m, enchaînés) : gauche-droite, presque plus de droites
    // LE GRAND VIRAGE (2026-10-15, Sacha : « plus de virages larges, la plupart de la map fait du tout droit ») : une longueur donnée
    // posée en COURBE ample (R 300-520 m) au lieu d'une droite — le côté se choisit d'après la place qui reste dans les ±58°
    const large=(len,pe,R)=>{R=R||RMIN*(2.2+r()*1.2); /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») : 200-350 m (c'étaient 300-520) */let sg=r()<.5?-1:1;const a=len/R*57.2958;
      if((LIM-sg*phi)*57.2958<a*.6)sg=-sg;const lib=Math.max(4,(LIM-sg*phi)*57.2958);
      if(V2){const a9=Math.min(a,lib);if(a9<A28&&R<6*RMIN){droite(len,pe);return;}arc(sg*a9,R,pe);if(a>a9+.5){const rm9=a-a9;if(rm9>=A28)arc(-sg*Math.min(rm9,(LIM+sg*phi)*57.2958),R,pe);else droite(rm9/57.2958*R,pe);}return;} /* v2 : jamais un arc sous 26° à moins de 6 RMIN ; le reste devient une droite, pas un S minuscule */
      if(a<=lib){arc(sg*a,R,pe);return;}arc(sg*lib,R,pe);arc(-sg*Math.min(a-lib,(LIM+sg*phi)*57.2958),R,pe);}; // trop long d'un côté : il repart en S
    const virages=(len,p0,p1)=>{if(CY_V3.on){zig(len,p0,p1,64,84,1.5,3.6,.12);return;} /* (V3) les méandres balancent */let fait=0,sg=r()<.5?-1:1,sgP=0,RP=0; /* sgP, RP (2026-11-07 soir) : le côté et le rayon de l'arc précédent, pour l'inflexion */
      while(fait<len){if(r()<.8)sg=-sg;if(V2&&cDette)sg=cDette<0?-1:1;const lg=r()<.4;let a=lg?40+r()*35:30+r()*45;const a0=a,R=RMIN*(lg?2.4+r()*1.2:1.5+r()*1.0); // 4 sur 10 sont des GRANDS virages (2,4-3,6 rP) : on tient l'appui longtemps
        const lib=(LIM-sg*phi)*57.2958;if(lib<(V2?A28+2:18)){sg=-sg;a=Math.min(a,(LIM-sg*phi)*57.2958);}else a=Math.min(a,lib);
        if(V2){if(a<A28){sg=-sg;a=Math.max(A28,Math.min(a0,(LIM-sg*phi)*57.2958));}if(cDette){if(sg*cDette>0)a=Math.min(Math.abs(briqueDette(sg*a,cDette)),(LIM-sg*phi)*57.2958);cDette=0;}}
        const pe=-(p0+r()*(p1-p0));
        if(V2&&sgP&&sg!==sgP&&(R<2*RMIN||RP<2*RMIN)){const l=Math.max(40*LL,.3*VW);droite(l,pe*.6);fait+=l;} /* (2026-11-07 soir) deux arcs OPPOSÉS serrés collés faisaient une pointe à l'inflexion (5-25 m sous rP au palier 20) : 0,3 s de droite entre les deux */
        arc(sg*a,R,pe);fait+=R*a/57.2958;sgP=sg;RP=R;
        if(r()<.12){const l=(50+r()*70)*LL,p2=-(p0+r()*(p1-p0))*.8;droite(l,p2);fait+=l;sgP=0;}}};
    const bosses=n=>{for(let k=0;k<n;k++){const l1=(70+r()*25)*LL,l2=(105+r()*30)*LL,h=(14+r()*8)*SQ,h2=(26+r()*14)*SQ;droite(l1,h/l1,2);droite(l2,-(h+h2)/l2,3);}};
    /* LES MODULES DU CANYON (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). 5 ou 6 des 6 « virages » de liaison (tirés au sort) deviennent
       un module — jamais les boucles à raccourci, la route 67, les étroits, l'arche, l'amphithéâtre, la mine ni la finale. Paquet mélangé, jamais
       deux fois de suite ; leur hasard `rm` naît de la graine de l'essai (aucun tirage de plus, ni dans `rnd` ni dans `r`) :
         cSlalom  · LE SLALOM DES CAIRNS : 4-5 virages alternés de 35-55° à 1,25-1,6 × RMIN — plus vif que les étroits, entre des parois larges
         cCorde   · LA DOUBLE CORDE : deux appuis du même côté autour d'une butte (95-110° en tout), le second plus serré, une courte droite entre
         cWhoops  · LES WHOOPS DE LA GORGE : 3-4 bosses rondes (une montée douce, une plongée franche), chacune un virage de 55-70°, en slalom — on décolle à chaque crête
         cChicane · LA CHICANE DES BUTTES : gauche-droite-gauche SERRÉE (1,1-1,3 × RMIN)
       Le cap reste dans ± LIM (on recentre avant s'il le faut) ; les pentes sont celles de la liaison qu'ils remplacent. */
    const rm=MODC_ON?mulberry32(((g0^0x6D0D5EED)+Math.imul(essai+1,0x85EBCA6B))>>>0):null,MM=[],GA=[],cmPaq=[],cmCase=new Set();let cmK=0,cmLast=-1,cmK9=1; /* GA : (LA REFONTE) les gabarits déclarés · cmK9 : le rayon des modules techniques (× 1 hors refonte) */
    if(rm){const t=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}const nb=5+(rm()<.5?1:0);for(let i=0;i<nb;i++)cmCase.add(t[i]);}
    const cmPe=(p0,p1)=>-(p0+rm()*(p1-p0)),cmRe=(lim,pe)=>{if(V2){if(Math.abs(phi)>lim){const t=recad(-(phi-Math.sign(phi)*lim*.3)*57.2958,0);cDette=t.dette;if(t.dessine)arc(t.dessine,RMIN*(2.4+rm()*1.0),pe);}return;}if(Math.abs(phi)>lim)arc(-(phi-Math.sign(phi)*lim*.3)*57.2958,RMIN*(2.4+rm()*1.0),pe);};
    const cSlalom=(p0,p1)=>{const n=4+(rm()<.5?1:0),a=35+rm()*20,R=RMIN*(1.25+rm()*.35)*cmK9;cmRe(LIM-a/57.3*.6,cmPe(p0,p1));let sg=phi>0?-1:1;if(V2){const m=n+(n&1);for(let k=0;k<m;k++){if(k)droite(Math.max(30*LL,.25*VW),cmPe(p0,p1)*.5,1);arc(sg*a,R,cmPe(p0,p1));sg=-sg;}return;} /* (2026-11-07 soir) 0,25 s de droite entre deux lobes opposés : collés, la courbe lissée faisait une pointe sous rP à l'inflexion (5-25 m au palier 20) */ /* v2 : plus de demi-lobes de 17-27° (douilles) : des lobes pleins, en nombre pair (le cap revient) */arc(sg*a*.5,R,cmPe(p0,p1));
      for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R,cmPe(p0,p1));}arc(-sg*a*.5,R,cmPe(p0,p1));};
    const cCorde=(p0,p1)=>{const T=95+rm()*15,sg=phi>0?-1:1,a1=T*(.5+rm()*.1),R=RMIN*(1.5+rm()*.4);{const d=(-sg*T/2/57.2958-phi)*57.2958;if(V2){const t=recad(d,0);cDette=t.dette;if(t.dessine)arc(t.dessine,RMIN*(2.4+rm()*.8),cmPe(p0,p1));}else if(Math.abs(d)>3)arc(d,RMIN*(2.4+rm()*.8),cmPe(p0,p1));}
      if(V2&&cDette){const aD=Math.abs(briqueDette(sg*a1,sg*cDette>0?cDette:0));cDette=0;arc(sg*aD,R,cmPe(p0,p1));}else arc(sg*a1,R,cmPe(p0,p1));droite((40+rm()*40)*LL,cmPe(p0,p1)*.8);arc(sg*(T-a1),Math.max(RMIN*1.15,R*.8),cmPe(p0,p1));};
    const cWhoops=(p0,p1)=>{const n=3+(rm()<.5?1:0);cmRe(.5,cmPe(p0,p1));let sg=phi>0?-1:1;
      for(let k=0;k<n;k++){const lu=(80+rm()*20)*LL,ld=(110+rm()*30)*LL,a=(k?55+rm()*15:30+rm()*8)/57.2958,R=Math.max(RMIN*1.4,(lu+ld)/a),au=lu/R*57.2958,ad=ld/R*57.2958;arc(sg*au,R,.12+rm()*.05);arc(sg*ad,R,-(.38+rm()*.1));sg=-sg;}};
    const cChicane=(p0,p1)=>{const a=30+rm()*10,R=RMIN*(1.1+rm()*.2)*cmK9;cmRe(LIM-a/57.3-.05,cmPe(p0,p1));const sg=phi>0?-1:1;droite(50*LL,cmPe(p0,p1)*.6,1);
      arc(sg*a,R,cmPe(p0,p1));arc(-sg*2*a,R,cmPe(p0,p1));arc(sg*a,R,cmPe(p0,p1));droite(50*LL,cmPe(p0,p1)*.6,1);};
    /* (2026-10-20, LE DÉSERT AU HASARD) TROIS MODULES DE PLUS — seulement avec le tracé au hasard (`?sans=canyonhasard` reste la recette d'avant) :
         cGoulet  · LE GOULET : un S serré qui PLONGE (50-65° puis le double en sens contraire puis 50-65°, à 1,2-1,4 × RMIN, la pente × 1,3)
         cMesa2   · LES DEUX CORDES : on contourne une mesa par la gauche puis la suivante par la droite (deux appuis de 85-100°, une droite entre)
         cGradins · LA DESCENTE EN GRADINS : 3 replats (un virage doux, du même côté) et 3 marches raides (−40 à −46 %)
       Le paquet en compte 8 : la double corde y est DEUX fois (MESURÉ, banc des tracés, 48 graines : sans elle, l'écart de forme tombait de 0,274 à 0,24 —
       c'est elle qui fait dériver la gorge). */
    const cGoulet=(p0,p1)=>{const a=50+rm()*15,R=RMIN*(1.2+rm()*.2)*cmK9;cmRe(LIM-a/57.3-.05,cmPe(p0,p1));const sg=phi>0?-1:1;droite(40*LL,cmPe(p0,p1),2);
      arc(sg*a,R,cmPe(p0,p1)*1.3);arc(-sg*2*a,R*1.1,cmPe(p0,p1)*1.3);droite(40*LL,cmPe(p0,p1)*.8,2);}; /* (il sort du goulet de biais : de a, 50-65°) */
    const cMesa2=(p0,p1)=>{const T=85+rm()*15,R=RMIN*(1.5+rm()*.3);let sg=phi>0?-1:1;{const d=(-sg*T/2/57.2958-phi)*57.2958;if(V2){const t=recad(d,0);cDette=t.dette;if(t.dessine)arc(t.dessine,RMIN*(1.8+rm()*.4),cmPe(p0,p1));}else if(Math.abs(d)>3)arc(d,RMIN*(1.8+rm()*.4),cmPe(p0,p1));}
      arc(sg*T,R,cmPe(p0,p1));droite((40+rm()*30)*LL,cmPe(p0,p1)*.8);if(!V2)arc(-sg*T*.15,R,cmPe(p0,p1));}; /* v2 : la queue de 13-15° est une dette (le cap n'a pas à être tenu au degré) */ /* (on repart de biais : ~T/3, la route a changé de vallée) */
    const cGradins=(p0,p1)=>{const n=3;cmRe(.45,cmPe(p0,p1));let sg=phi>0?-1:1;
      for(let k=0;k<n;k++){if(V2&&(LIM-sg*phi)*57.2958<A28+10)sg=-sg;const a=V2?A28+rm()*8:Math.min(12+rm()*10,Math.max(4,(LIM-sg*phi)*57.2958-4));arc(sg*a,RMIN*(2.4+rm()*.6),-.04);droite((35+rm()*15)*LL,-(.40+rm()*.06),2);if((LIM-sg*phi)*57.2958<16)sg=-sg;}}; /* (les replats tournent du même côté tant que le cap le permet : la descente dérive) */
    const cmJ=[cSlalom,cCorde,cWhoops,cChicane,cGoulet,cMesa2,cGradins],cmN=CY_HZ.on&&CY_DECO.mods?7:4;
    const cmPose=(p0,p1)=>{let m=0;for(let e=0;e<6;e++){if(!cmPaq.length){const t=[];for(let i=0;i<cmN;i++)t.push(i);if(cmN>4)t.push(1);for(let i=t.length-1;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}for(const x9 of t)cmPaq.push(x9);}m=cmPaq.shift();if(m!==cmLast)break;}
      cmLast=m;const i0=C.length-1;cmJ[m](p0,p1);MM.push({i0:i0,i1:C.length-1});}; // le module suivant du paquet (jamais deux fois le même de suite)
    const lien=(len,p0,p1)=>{const k=cmK++;if(!rm||!cmCase.has(k)){virages(len,p0,p1);return;}cmPose(p0,p1);};  // (2026-10-18) une liaison : des virages… ou un MODULE (voir cSlalom)
    // LA BOUCLE (le raccourci) : approche ~220 m · demi-tour R1 ~135 m · retour · demi-tour SERRÉ R2 = R1 − e/2 (~80 m) · la SORTIE, 94 m à côté
    // de l'approche et 55 à 90 m plus bas (2,6 à 3,4 s de vol : à 70-140 m/s on retombe de 180 à 480 m plus loin — la sortie file droit
    // sous l'approche puis sous le premier demi-tour, et s'incurve à peine : elle est là où la caisse arrive)
    const boucle=(nm,sg)=>{const k0=C.length;if(V2){const t=recad(-phi*57.2958,0);if(t.dessine)arc(t.dessine,RMIN*(2.0+r()*.8),-.25);}else if(Math.abs(phi)>.06)arc(-phi*57.2958,RMIN*(2.0+r()*.8),-.25);
      const e=2*ROAD_HALF+32+r()*12,R1=Math.max((100+r()*20)*RS,RMIN+e/2),R2=R1-e/2,La=(200+r()*50)*LL,Lb=(140+r()*30)*LL,pa=.10,dh=55+r()*35,
        pl=Math.max(.02,(dh-pa*Lb)/(Math.PI*(R1+R2)+Lb));
      ici(nm+'0');const ia9=C.length-1;if(CY_V3.on){droite(La*.5,-.06,Math.max(2,Math.round(La*.5/70)));droite(La*.5,-.21,Math.max(2,Math.round(La*.5/70)));}else droite(La,-pa,Math.max(3,Math.round(La/70)));ici(nm+'1');const ib9=C.length-1; // l'APPROCHE : la zone de saut ((V3) elle casse sa pente : pas de tout droit de plus de 5 s)
      arc(sg*180,R1,-pl);droite(Lb,-pl,Math.max(2,Math.round(Lb/70)));if(CY_V3.on)ici(nm+'r');arc(sg*180,R2,-pl);phi-=sg*2*Math.PI; // demi-tour, retour, demi-tour serré (le cap a fait un tour : on le ramène) — (V3) nm+'r' : l'entrée du 2e demi-tour (l'ÉPERON de roche se pose en son centre : aucune route ne passe dedans, la sortie repasse, elle, dans le 1er)
      ici(nm+'2');const ic9=C.length-1;droite(Lb,-pa,Math.max(2,Math.round(Lb/70)));const id9=C.length-1;                          // la SORTIE : droite sous l'approche…
      if(CY_V3.on){GA.push({t:'plat',i0:ia9,i1:ib9,ramp:80},{t:'plat',i0:ic9,i1:id9,ramp:80});MM.push({i0:ib9,i1:id9,rac:1,nom:'raccourci du trombone'});} /* (V3) à plat : l'approche (la lèvre) et la sortie (la pose) — le dévers partout n'y touche pas */
      {const R3=(400+r()*100)*RS;arc(-sg*150*LL/R3*57.2958,R3,-pa);}ici(nm+'3');          // …puis elle tourne déjà sous le 1er demi-tour (150 m sur R 400-500 : 28 m d'écart au bout, la pose reste sur la dalle)
      arc(-sg*(18+r()*14),(380+r()*120)*RS,-pa);                                          // …et elle finit son GRAND virage (R 380-500 m : la pose de ceux qui volent loin reste douce)
      if(CY_V3.on){let kb=k0;{let d9=0;while(kb>0&&d9<650){d9+=Math.hypot(C[kb].x-C[kb-1].x,C[kb].z-C[kb-1].z);kb--;}}BO.push([kb,C.length-1,450]);}else BO.push([k0,C.length-1]); /* (V3) comme la butte : le trombone repasse près de ce qui le précède et le suit (le directeur de rythme lui comptait 50 points d'écart) */MM.push({i0:k0,i1:C.length-1,fig:'raccourci',nom:'le trombone'});}; /* (2026-11-05, LE DIRECTEUR DE RYTHME) le raccourci est un temps fort DÉCLARÉ : ses deux demi-tours ne sont pas une spirale, sa sortie (la zone de pose) n'est pas une droite de trop */
    let sg0=r()<.5?1:-1;const sens=()=>(sg0=-sg0);                            // les boucles alternent de côté : la piste ne dérive pas
    /* (LA DURÉE DES MAPS) au JOUER (LC9 > 0) : la Route 66 (moitié), la brèche, le raccourci A, les étroits, l'arche, l'amphithéâtre et la finale
       restent ; les raccourcis B à H, les bosses, la mine et le dos de chameau n'entrent que si la longueur visée les tient (`tient`) */
    const LC9=typeof longueurCible==='function'?longueurCible():0,kC=LC9?.4:1,fait=()=>{let a=0;for(let k=1;k<C.length;k++)a+=Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);return a;},tient=f=>!LC9||fait()<LC9*f;
    let ax=0,hz=null;
    if(CY_HZ.on){ /* LE CANYON AU HASARD (2026-10-19) — voir CY_HZ. Tout se tire dans `rh` (né de la graine de l'essai) et dans `r` ; la route est bâtie
                     dans l'axe (+z) puis TOURNÉE de `ax` à la fin (la butée de cap ±58°, les recentrages et les boucles se comptent autour de l'axe) */
      const rh=mulberry32(((g0^0x0CA4A5A1)+Math.imul(essai+1,0x27D4EB2F))>>>0),kP=.85+rh()*.35,mel=a=>{for(let i=a.length-1;i>0;i--){const j=(rh()*(i+1))|0,x9=a[i];a[i]=a[j];a[j]=x9;}return a;};
      ax=(rh()-.5)*2*CY_HZ.axe/57.2958;
      // LES CARACTÈRES DES LIAISONS : les méandres (les virages d'avant), la gorge (grandes courbes), le serpent (S serrés), la dérive (la gorge part
      // en biais jusqu'à la butée et y ondule), les cassures (courtes droites et coudes) — jamais deux fois le même de suite ; ou un MODULE (cmPose)
      const cote=(sg,a)=>{if(V2&&cDette){sg=cDette<0?-1:1;a=Math.abs(briqueDette(sg*a,cDette));cDette=0;}const l9=(LIM-sg*phi)*57.2958;if(l9<(V2?A28+2:15)){sg=-sg;a=Math.min(a,(LIM-sg*phi)*57.2958);}else a=Math.min(a,l9);return [sg,a];};
      const gorge=(len,p0,p1)=>{if(CY_V3.on)return zig(len,p0,p1,70,84,2.1,3.3,0); /* (V3) de grandes courbes d'un côté de l'axe à l'autre */let f9=0,sg=r()<.5?-1:1;while(f9<len){const t=cote(-sg,40+r()*35),R=RMIN*(2.1+r()*1.2);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=R*t[1]/57.2958;}};
      const serpent=(len,p0,p1)=>{if(CY_V3.on)return zig(len,p0,p1,64,74,1.3,1.7,0);let f9=0,sg=r()<.5?-1:1;while(f9<len){const t=cote(-sg,30+r()*18),R=RMIN*(1.25+r()*.35);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=R*t[1]/57.2958;}};
      const derive=(len,p0,p1)=>{if(CY_V3.on)return zig(len,p0,p1,66,80,2.2,3.2,.25);const sg=r()<.5?-1:1,c9=sg*(LIM*57.2958-6-r()*12)-phi*57.2958,R0=RMIN*(2.4+r()*1.0);cDette=0;let f9=0;if(V2){const t=recad(c9,0);if(t.dessine){arc(t.dessine,R0,-(p0+r()*(p1-p0)));f9=R0*Math.abs(t.dessine)/57.2958;}}else{arc(c9,R0,-(p0+r()*(p1-p0)));f9=R0*Math.abs(c9)/57.2958;}
        while(f9<len){const s9=sg*phi*57.2958>LIM*57.2958-(V2?42:24)?-sg:sg,a=Math.min(V2?28+r()*12:16+r()*20,(LIM-s9*phi)*57.2958),R=RMIN*(2.0+r()*1.2);arc(s9*a,R,-(p0+r()*(p1-p0)));f9+=R*a/57.2958;}};
      const cassures=(len,p0,p1)=>{if(CY_V3.on)return zig(len,p0,p1,64,76,1.3,1.8,.85);let f9=0,sg=r()<.5?-1:1;while(f9<len){const l=(60+r()*60)*LL;droite(l,-(p0+r()*(p1-p0))*.8);const t=cote(-sg,28+r()*20),R=RMIN*(1.3+r()*.5);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=l+R*t[1]/57.2958;}};
      const CAR9=[virages,gorge,serpent,derive,cassures],CARN=['meandres','gorge','serpent','derive','cassures'];let hPrec=-1;
      const lienH=(len,p0,p1)=>{p0*=kP;p1*=kP;if(rm&&rm()<CY_HZ.mod){cmPose(p0,p1);return 'module';}
        let i=(rh()*CAR9.length)|0;if(i===hPrec)i=(i+1+((rh()*(CAR9.length-1))|0))%CAR9.length;hPrec=i;CAR9[i](len,p0,p1);return CARN[i];};
      // LES PIÈCES (celles d'avant, telles quelles) — chacune derrière sa liaison
      let nRac=0,phrV='traversee'; /* phrV : la variante de la phrase du mur (traversée / arche), tirée avec le jeu (à la graine) */
      let pPrec='';
      const PENTE={rac:.25,etroits:.3,arche:.2,amphi:.35,mine:.16,chameau:.2,bosses:.2,mur:.28,rapide:.3};
      /* (2026-11-07, GÉNÉRATION PROPRE) LE RAPIDE, le module unique du canyon : 2,5 s de descente droite et raide au fond de la gorge, puis une double corde du même côté.
         Le cap reste dans ±LIM : deux appuis de 55° au plus (110° en tout), on s'aligne avant par un vrai virage si le cap est trop au centre (et non 2 × 90°, qui ferait demi-tour) */
      /* (V3, la supervision : « le climax est encore un couloir ») LA GRANDE CHUTE : le rapide accélère dans le serré, puis la gorge s'OUVRE d'un coup sur l'amphithéâtre (gabarit
         `chute` : 330 m de large, le fond à 260 m sous la route) et la route PLONGE par trois marches de pente (−48, −62, −72 % : jusqu'à 36°, adoucies) le long de la rivière qui tombe
         en cascades — le ciel et tout le canyon en dessous —, puis se POSE au fond dans une grande courbe. Durées à la vitesse ressentie. */
      const rapide=()=>{const i0=C.length-1,sg=phi>0?-1:1;
        if(CY_V3.on){if(Math.abs(phi)*57.2958<29)arc((-sg*55)-phi*57.2958,RMIN*2.4,-.2);const vP=VW*cyElan(),l1=1.6*vP;droite(l1,-.33,Math.ceil(l1/60));
          const ic=C.length-1;ici('chute0');droite(.5*vP,-.48,3);droite(.5*vP,-.62,3);droite(1.6*vP,-.72,Math.ceil(1.6*vP/50));
          const a=Math.min(55,(LIM-sg*phi)*57.2958/2);arc(sg*a,2.2*RMIN,-.12);droite(.8*vP,-.06,2);arc(sg*a,2.4*RMIN,-.08);ici('chute1');
          GA.push({t:'chute',i0:ic,i1:C.length-1});MM.push({i0:i0,i1:C.length-1,fig:'rapide',climax:1,nom:'la grande chute'});return;}
        if(Math.abs(phi)*57.2958<29)arc((-sg*55)-phi*57.2958,RMIN*2.4,-.2);
        const l=2.5*VW;droite(l,-.35,Math.ceil(l/60));
        const a=Math.min(55,(LIM-sg*phi)*57.2958/2);arc(sg*a,1.6*RMIN,-.1);droite(40*LL,-.1,1);arc(sg*a,1.7*RMIN,-.1);droite(60*LL,-.05);
        MM.push({i0:i0,i1:C.length-1,fig:'rapide',climax:1,nom:'le rapide'});};
      const mq=(i0,nm)=>{if(CY_V3.on)MM.push({i0:i0,i1:C.length-1,nm:nm});}; /* (V3, la charte, R4/R5) les pièces d'avant sont des modules nommés : sans marque, le juge les comptait comme « rien » (jusqu'à 15 s sans module) */
      const PC={rapide:rapide,rac:()=>{const nm='rac'+'ABCDEFGH'[nRac];if(!nRac)ici('fer0');boucle(nm,sens());if(!nRac)ici('fer1');nRac++;},
        etroits:()=>{recentre(-.3);ici('etroit0');let sg=sens();for(let k=0;k<(LC9?4:6);k++){arc(sg*(V2?28+r()*16:24+r()*16),RMIN*(1.6+r()*.6),-.30);sg=-sg;}ici('etroit1');large(260*LL,-.28);},
        arche:()=>{const i0=C.length-1;droite(90*LL,-.2,2);ici('arche0');large(360*LL*(LC9?.6:1),-.14,CY_V3.on?RMIN*(3+r()):(560+r()*200)*RS);ici('arche1');mq(i0,'arche');}, /* (V3) une vraie courbe (3-4 RMIN) : à 560-760 m elle tenait le cap avec ses voisines (la règle des dix secondes) */
        amphi:()=>{recentre(-.3);const i0=C.length-1,sg=sens();arc(-sg*40,RMIN*3,-.35);ici('amphi0');arc(sg*96,RMIN*(2.3+r()*.4),-.42);ici('amphi1');mq(i0,'amphi');},
        mine:()=>{const i0=C.length-1;ici('mine0');large(300*LL,-.16);large(300*LL,-.16);ici('mine1');mq(i0,'mine');},
        chameau:()=>{const i0=C.length-1,l1=(150+r()*40)*LL,h=(24+r()*10)*SQ,l2=(250+r()*60)*LL;ici('chameau');droite(l1,h/l1,3);large(l2,-(h+80*SQ)/l2);mq(i0,'chameau');},
        bosses:()=>{const i0=C.length-1;ici('bosses');bosses(2);mq(i0,'bosses');},
        mur:()=>{recentre(-.3);ici('mur0');const sg=sens(),aT=70+r()*22,aR=aT/57.2958; /* (2026-11-05, LE CANYON SUR LES MURS — voir CY_MUR) l'approche à contre-courbe puis UN grand virage dont la dalle se couche à 86° : la falaise est à l'extérieur */
          {const d=(-sg*38/57.2958-phi)*57.2958;if(V2){const t=recad(d,0);if(t.dessine)arc(t.dessine,RMIN*(2.6+r()*.8),-.30);}else if(Math.abs(d)>3)arc(d,RMIN*(2.6+r()*.8),-.30);}
          const im9=C.length-1;ici('mur1');arc(sg*aT,Math.max(RMIN*1.6,CY_MUR.T*VW*(.92+r()*.16)/aR),-(.26+r()*.08));ici('mur2');if(V2)MM.push({i0:im9,i1:C.length-1,fig:'mur'}); /* v2 : le grand balayage des murs est un module déclaré (ni virage ni droite : une zone à part) */large(140*LL,-.25);}};
      // LA LONGUEUR de chaque pièce, en moyenne (MESURÉ au banc des tracés, 40 graines × paliers 0 à 25) — pour savoir lesquelles la longueur visée tient ;
      // une liaison : un module (~8,4 × RMIN) ou un caractère (~1,75 × la longueur demandée : on finit le virage commencé)
      const LIEN=(LC9?CY_HZ.lien:300)*LL,EST={rac:290*LL+1190*RS+190,etroits:(LC9?860:1290)*RS,arche:(90+360*(LC9?.6:1))*LL,amphi:783*RS,mine:600*LL,chameau:450*LL,bosses:410*LL,mur:CY_MUR.T*VW*1.05+330*LL},
        LI9=(rm?CY_HZ.mod*8.4*RMIN:0)+(1-(rm?CY_HZ.mod:0))*1.75*LIEN,FIN=LI9+80+(LC9?372:620)*LL+150,B=LC9?LC9*CY_HZ.kL*(.92+rh()*.16):0;
      // LE JEU DE PIÈCES : un raccourci et une pièce DUS (le plus souvent un monument : l'arche ou l'amphithéâtre) ; les autres, prises dans un ordre
      // mélangé, entrent si la longueur visée les tient ; puis l'ORDRE de toutes est mélangé à son tour
      if(CY_REF.on){ /* ===== LA REFONTE DU CANYON (2026-11-12) — voir CY_REF ===== */
      const gab=(t,i0,o)=>{GA.push(Object.assign({t:t,i0:i0,i1:C.length-1},o||{}));}, /* le gabarit d'un tronçon (du point de contrôle i0 au dernier posé) */
        cour=(sg,a,k0,k1,pe)=>{const t=cote(sg,a);arc(t[0]*t[1],RMIN*(k0+r()*(k1-k0)),pe);return t[0];}; /* une grande courbe du côté voulu (de l'autre si le cap n'a plus la place) : rend le côté pris */
      cmK9=CY_REF.kTech;Object.assign(PENTE,{gorge:.24,meandre:.25,traversee:.2,toboggan:.25,vire:.26,riviere:.3,pipe:.25,voute:.15,phrase:.12,butte:.12,gouffre:.12,porte:.14,galerie:.12,aiguilles:.18});
      /* LA GRANDE GORGE : le goulot (une fente, tout droit), la révélation (la gorge s'ouvre en ~1,2 s), puis trois grandes courbes en corniche qui descendent vers la rivière.
         `sv` : le côté du VIDE (la falaise est de l'autre côté) — la première courbe tourne vers le vide : la falaise est à l'extérieur, on la voit filer */
      PC.gorge=()=>{recentre(-.3);const iF=C.length-1;droite(Math.max(120*LL,1.4*VW),-.24,2);gab(CY_V3.on?'serre':'fente',iF); /* (V3) le goulot en couloir serré : la fente (pied à 46 m, parois à pic) étirait ses nappes violettes */
        droite(Math.max(100*LL,1.2*VW),CY_V3.on?-.05:-.12,2);const i0=C.length-1,sv=sens();let sg=sv;
        if(CY_V3.on){const A=(72+r()*12)/57.2958;let tg=sv;for(let k=0;k<3;k++){const ia=C.length-1;vise(tg*A/2,RMIN*(2.6+r()*1.0),-(.15+r()*.06));if(tg===sv)gab('devers',ia,{max:CY_REF.corMax});tg=-tg;if(k<2&&r()<.5)droite((60+r()*50)*LL,-.14,1);}} /* (V3) la corniche balance d'un côté de l'axe à l'autre (±36-42°) */
        else for(let k=0;k<3;k++){const ia=C.length-1,ts=cour(sg,42+r()*16,2.6,3.6,-(.15+r()*.06));if(ts===sv)gab('devers',ia,{max:CY_REF.corMax});sg=-ts;if(k<2&&r()<.5)droite((60+r()*50)*LL,-.14,1);}
        droite(70*LL,-.12,1);gab('corniche',i0,{sg:sv});MM.push({i0:iF,i1:C.length-1,nm:'gorge'});};
      /* LE GRAND MÉANDRE : on se place de biais, puis un grand coude (~96°) en corniche, la falaise à l'extérieur ; LA TRAVERSÉE (la route quitte la falaise et franchit la gorge
         en pont) ; un second coude, opposé, contre la falaise d'en face. Aucun demi-tour : le cap reste dans ± LIM */
      PC.meandre=()=>{recentre(-.3);const sv=sens(),A=LIM*57.2958-4;
        {const t=recad(-sv*(A-6)-phi*57.2958,0);if(t.dessine)arc(t.dessine,RMIN*(2.2+r()*.6),-.25);}
        const iA=C.length-1;arc(sv*Math.max(A28+4,Math.min(2*A-12,(LIM-sv*phi)*57.2958-3)),RMIN*(2.8+r()*.6),-(.16+r()*.05));gab('corniche',iA,{sg:sv});gab('devers',iA,{max:CY_REF.corMax+4});
        droite(Math.max(150*LL,1.9*VW),-.08,2);
        const iC=C.length-1;arc(-sv*Math.max(A28+4,Math.min(55+r()*25,(LIM+sv*phi)*57.2958-3)),RMIN*(2.6+r()*.6),-(.16+r()*.05));gab('devers',iC,{max:CY_REF.corMax});droite(60*LL,-.14,1);gab('corniche',iC,{sg:-sv});
        MM.push({i0:iA,i1:C.length-1,nm:'meandre'});};
      /* LA TRAVERSÉE seule : une courbe contre une falaise, le pont (droit, presque à plat : la rivière loin dessous), une courbe contre la falaise d'en face */
      PC.traversee=()=>{recentre(-.25);if(CY_V3.on){const i0=C.length-1,s1=sens(),A=(72+r()*12)/57.2958;vise(s1*A/2,RMIN*(3+r()*.6),-.14);gab('corniche',i0,{sg:s1});gab('devers',i0,{max:CY_REF.corMax-10}); /* (V3) le pont en biais : d'un côté de l'axe à l'autre */
          const ip=C.length-1;droite(Math.max(190*LL,2.4*VW),-.07,3);gab('pont',ip);const i2=C.length-1;vise(-s1*A/2,RMIN*(3+r()*.6),-.14);gab('corniche',i2,{sg:-s1});gab('devers',i2,{max:CY_REF.corMax-10});MM.push({i0:i0,i1:C.length-1,nm:'traversee'});return;}
        const i0=C.length-1,s1=cour(sens(),30+r()*10,3,3.6,-.14);gab('corniche',i0,{sg:s1});gab('devers',i0,{max:CY_REF.corMax-10});
        const ip=C.length-1;droite(Math.max(190*LL,2.4*VW),-.07,3);if(CY_V3.on)gab('pont',ip); /* (V3) le pont naturel sous la droite */const i2=C.length-1,s2=cour(-s1,30+r()*10,3,3.6,-.14);gab('corniche',i2,{sg:s2});gab('devers',i2,{max:CY_REF.corMax-10});MM.push({i0:i0,i1:C.length-1,nm:'traversee'});};
      /* LE TOBOGGAN : trois grandes courbes enchaînées (3 s chacune au moins : le temps que la dalle bascule), la dalle relevée de `tobMax`° vers l'intérieur — la paroi est à l'extérieur,
         au ras du bord relevé (gabarit serré : c'est un bobsleigh, pas un balcon) */
      PC.toboggan=()=>{recentre(-.3);if(CY_V3.on){let sg=phi>0?-1:1;const A=(68+r()*8)/57.2958;vise(-sg*A/2,RMIN*(2.4+r()*.6),-.22);const i0=C.length-1; /* (V3) trois courbes d'un côté de l'axe à l'autre */
          for(let k=0;k<3;k++){vise(sg*A/2,Math.max(RMIN*2.2,3*VW/A),-(.18+r()*.06));sg=-sg;}gab('devers',i0,{max:CY_REF.tobMax});MM.push({i0:i0,i1:C.length-1,nm:'toboggan'});droite(50*LL,-.2,1);return;}
        const i0=C.length-1;let sg=phi>0?-1:1;
        for(let k=0;k<3;k++){const t=cote(sg,50+r()*8);arc(t[0]*t[1],Math.max(RMIN*2.2,3*VW/(Math.max(A28,t[1])/57.2958)),-(.18+r()*.06));sg=-t[0];}
        gab('devers',i0,{max:CY_REF.tobMax});MM.push({i0:i0,i1:C.length-1,nm:'toboggan'});droite(50*LL,-.2,1);};
      /* LA VIRE : le mur en petit — une contre-courbe, puis UN virage de 58-76° qui dure `vireT` s ; la dalle se couche à `vireMax`° (le relief s'écarte et pose son plan de roche
         derrière la dalle tout seul : S.mu, comme pour le grand mur) */
      PC.vire=()=>{recentre(-.3);const sg=sens(),aT=58+r()*18;
        {const t=recad((-sg*32/57.2958-phi)*57.2958,0);if(t.dessine)arc(t.dessine,RMIN*(2.6+r()*.8),-.26);}
        const i0=C.length-1,a9=Math.max(A28+4,Math.min(aT,(LIM-sg*phi)*57.2958-2));arc(sg*a9,Math.max(RMIN*1.8,CY_REF.vireT*VW*(.92+r()*.16)/(a9/57.2958)),-(.22+r()*.06));
        gab('devers',i0,{max:CY_REF.vireMax});MM.push({i0:i0,i1:C.length-1,fig:'vire'});large(120*LL,-.24);};
      /* LE HALF-PIPE : trois grandes courbes alternées (~3,4 s chacune), la dalle montée à `pipeMax`° d'un côté puis de l'autre — le toboggan en vrai : on grimpe sur la paroi de la courbe,
         on retombe au milieu, on grimpe sur l'autre */
      PC.pipe=()=>{recentre(-.3);if(CY_V3.on){let sg=phi>0?-1:1;const A=(74+r()*10)/57.2958;vise(-sg*A/2,RMIN*(2.6+r()*.6),-.24);const i0=C.length-1; /* (V3) le half-pipe d'un côté de l'axe à l'autre (±37-42°) : MESURÉ, à 0 → 60° → 0 il tenait la même direction 10-13 s */
          for(let k=0;k<3;k++){vise(sg*A/2,Math.max(RMIN*2.4,3.4*VW/A),-(.2+r()*.06));sg=-sg;}gab('devers',i0,{max:CY_REF.pipeMax});MM.push({i0:i0,i1:C.length-1,nm:'pipe'});droite(50*LL,-.2,1);return;}
        const i0=C.length-1;let sg=phi>0?-1:1;
        for(let k=0;k<3;k++){const t=cote(sg,54+r()*14);arc(t[0]*t[1],Math.max(RMIN*2.4,3.4*VW/(Math.max(A28,t[1])/57.2958)),-(.2+r()*.06));sg=-t[0];}
        gab('devers',i0,{max:CY_REF.pipeMax});MM.push({i0:i0,i1:C.length-1,nm:'pipe'});droite(50*LL,-.2,1);};
      /* LA VOÛTE : une approche droite (la bouche du tube se voit venir), puis `vouteT` s de route droite dans un tube de grès où la dalle fait un tour complet de roulis (sens tiré) ; le tube
         lui-même est cuit à la pose (cyVoute, canyon-voute.js) autour de `CY.vou` = les deux repères du gabarit `tonneau` */
      /* LA PHRASE DU MUR (voir cyPhraseCles, canyon-v3.js) — le chemin suit les morceaux de la phrase, mis bout à bout à la vitesse ressentie : le plat, la montée et la paroi (une courbe
         douce), le tunnel (un S doux, tête en bas), la seconde paroi (de l'autre côté pour la traversée, du même pour l'arche), le plat. Les zones : `phrase` (le roulis, dans Bt),
         `plat` (le dévers partout s'y tait), `tube` (le tunnel : la gorge serre le tube, le bouchon de roche la ferme au-dessus) */
      PC.phrase=()=>{recentre(-.2);const v=phrV,vP=VW*cyElan(),K=cyPhraseCles(v),Lk=K.map(function(k){return k[0]*vP;}),sg=r()<.5?-1:1,i0=C.length-1;ici('phr0');
        const tour=(a9,len,pe)=>{const d9=a9-phi;if(Math.abs(d9)<.03){droite(len,pe,Math.max(1,Math.ceil(len/80)));return;}const R9=Math.max(RMIN*1.6,len/Math.abs(d9));arc(d9*57.2958,R9,pe);const rest=len-R9*Math.abs(d9);if(rest>12)droite(rest,pe,Math.max(1,Math.ceil(rest/80)));};
        droite(Lk[0],-.10,Math.max(1,Math.ceil(Lk[0]/80)));tour(-sg*.80,Lk[1]+Lk[2],-.13); /* la phrase BALANCE de ±40° (la charte R1 : à ±25°, 21 s « dans la même direction ») */
        const it0=C.length-1;tour(sg*.80,Lk[3]+Lk[4]*.5,-.09);tour(-sg*.80,Lk[4]*.5+Lk[5],-.16);const it1=C.length-1; /* ±40° : à −23°, la bande du S (63°) restait sous les 2 × 30° du juge */
        tour(sg*.80,Lk[6]+Lk[7],-.11);droite(Lk[8],-.06,Math.max(1,Math.ceil(Lk[8]/80)));ici('phr1');
        GA.push({t:'phrase',i0:i0,i1:C.length-1,sg:sg,v:v,vP:vP},{t:'plat',i0:i0,i1:C.length-1,ramp:60},{t:'tube',i0:it0,i1:it1});
        MM.push({i0:i0,i1:C.length-1,fig:'phrase',nom:v==='arche'?'le demi-tour sous l\'arche':'la traversée sous la roche'});};
      PC.voute=()=>{recentre(-.3);droite(Math.max(90*LL,1.2*VW),-.16,2);const i0=C.length-1,sg=r()<.5?-1:1;ici('voute0');
        const l=(CY_V3.on?cyVouteT():CY_REF.vouteT)*VW;
        if(CY_V3.on){ /* (V3, la règle des dix secondes) le tube ondule : cinq arcs (+θ, −2θ, +2θ, −2θ, +θ ; θ = 40° : à ±28° le juge le voyait « dans la même direction ») — MESURÉ : un seul grand S (±22°) tenait le cap
             11,5 s (la règle : 9) ; en petits arcs (~40 m entre deux points : le roulis s'y pose finement) */
          const th=40,Rv=l/(8*th/57.2958),sv=r()<.5?-1:1,arcL=(a9,R9)=>{const m=Math.max(1,Math.round(Math.abs(a9)/57.2958*R9/120));for(let q=0;q<m;q++)arc(a9/m,R9,-.14);};
          arcL(sv*th,Rv);arcL(-sv*2*th,Rv);arcL(sv*2*th,Rv);arcL(-sv*2*th,Rv);arcL(sv*th,Rv);}
        else droite(l,-.14,Math.max(2,Math.ceil(l/40)));ici('voute1');gab('tonneau',i0,{sg:sg});MM.push({i0:i0,i1:C.length-1,fig:'voute'});droite(Math.max(70*LL,.9*VW),-.14,1);};
      /* ===== LE CANYON V3 (2026-11-13) — voir CY_V3 (canyon-v3.js) : les pièces qui jouent avec le relief ; leurs rochers et leurs ouvrages naissent dans cyV3Plan ===== */
      /* LA BOUCLE DE LA BUTTE : le balcon (2,8 s : la butte, et la route d'en bas qui file dans l'axe), un tour complet autour de la butte (rayon ~2,15 RMIN) qui descend de 70-86 m,
         puis la piste d'atterrissage DANS L'AXE du balcon, sous lui. Le fond de la boucle (22 % → 78 % du tour) se couche à `butMax`° : la falaise est derrière la dalle (le plan de roche des
         murs), on ride le mur. Le raccourci est le SAUT de la ville : celui qui ne tourne pas sort par le bord extérieur ~90 m après le début du tour, vole ~2,6 s et se pose dans le sens de la
         marche sur la piste d'en bas (1,6 × la portée). Une boucle déclarée (BO) : elle repasse sous elle-même. */
      /* (2026-11-13, la charte des routes, R6 : deux replis par route) LA BOUCLE a deux habits : la BUTTE (on tourne autour d'une butte géante) et le GOUFFRE (autour d'un puits
         profond, des aiguilles dressées au fond) — mêmes chiffres, mêmes saut et pose ; leurs repères : bt0/bt1 et gf0/gf1. Chaque boucle marque son RACCOURCI (`rac:1` : i0 la lèvre,
         le balcon où le tour commence — on file tout droit ; i1 la pose sur la piste, ~3 s de vol plus loin) ; la piste casse sa pente à mi-longueur (−10 % puis −25 % : la charte, R2, pas de tout droit de plus de 5 s) */
      const boucleP=v=>{const pre=v==='gouffre'?'gf':'bt';recentre(-.18);const ia=C.length-1,La=Math.max(240*LL,2.8*VW);droite(La,-.08,Math.max(2,Math.ceil(La/80)));
        const i0=C.length-1;ici(pre+'0');const sg=sens(),R=Math.max(RMIN*1.6,Math.min(RMIN*(2.0+r()*.3),CY_V3.butT*VW)),dh=70+r()*16,pl=dh/(2*Math.PI*R); /* (la règle des dix secondes) le tour en 9 s au plus */
        arc(sg*360,R,-pl);phi-=sg*2*Math.PI;ici(pre+'1');
        const iL=C.length-1,Lr=Math.max(470*LL,5.3*VW);droite(Lr*.45,-.06,Math.max(2,Math.ceil(Lr*.45/80)));droite(Lr*.55,-.30,Math.max(2,Math.ceil(Lr*.55/80))); /* (la charte, R2) 3° puis 17° : la cassure survit au lissage des pentes (à −10/−25 %, elle s'y fondait) */ /* la piste : le vol (~3,1 s), la dérive avant la sortie du bord (~1 s au palier 0) et de la marge — les sauteurs de 0,9 à 1,5 × la croisière s'y posent */
        const nA=Math.max(3,Math.ceil(360/8));GA.push({t:'devers',i0:i0+Math.round(nA*.36),i1:i0+Math.round(nA*.80),max:CY_V3.butMax});
        GA.push({t:'plat',i0:ia,i1:i0+Math.round(nA*.30),ramp:110},{t:'plat',i0:i0+nA,i1:C.length-1,ramp:90}); /* LES PLATS (MESURÉ en jeu : le dévers du fond de la boucle, lissé sur ±150 m, se levait dès 90 m après le balcon — la caisse qui ne tourne pas
           montait sur le bord relevé et s'envolait VERS LE HAUT, au lieu de tomber sur la piste) : le balcon, le premier tiers du tour (le couloir du saut) et la piste restent à plat ; le mur du fond commence à 36 % du tour */
        let ib=ia;{let d9=0;while(ib>0&&d9<650){d9+=Math.hypot(C[ib].x-C[ib-1].x,C[ib].z-C[ib-1].z);ib--;}} /* le fond de la boucle repasse à 150-520 m de la route qui précède le balcon (sans danger : 70 m plus bas, de biais) — la boucle déclarée commence 650 m plus tôt (MESURÉ : à 350 m, une paire restait à 510 m) */
        BO.push([ib,C.length-1,450]);gab('boucle',ia,{sg:sg,v:v});MM.push({i0:ia,i1:C.length-1,fig:v,nom:v==='gouffre'?'le gouffre':'la boucle de la butte'});
        {let d9=0,ip=iL;const cible=3.1*VW;while(ip<C.length-1&&d9<cible){d9+=Math.hypot(C[ip+1].x-C[ip].x,C[ip+1].z-C[ip].z);ip++;}MM.push({i0:i0,i1:ip,rac:1,nom:v==='gouffre'?'raccourci du gouffre':'raccourci de la butte'});}};
      PC.butte=()=>boucleP('butte');PC.gouffre=()=>boucleP('gouffre');
      /* LA PORTE DE GRÈS : une courbe d'approche, la ligne droite face à l'aileron (1,7 s : sa bouche noire grandit), le tunnel (~1 s : la fente de l'aileron fermée par son bouchon) ;
         deux fois sur cinq, une seconde porte après un S entre les deux ailerons */
      PC.porte=()=>{recentre(-.22);const i0=C.length-1,nF=r()<.4?2:1;cour(sens(),36+r()*14,2.4,3.2,-.16);
        for(let f=0;f<nF;f++){droite(Math.max(150*LL,1.7*VW),-.22,2);const it=C.length-1,Lt=Math.max(120*LL,1.05*VW);droite(Lt,-.06,Math.max(2,Math.ceil(Lt/40)));gab('porte',it); /* l'approche plonge vers la bouche (−22 %), le tunnel s'aplatit (−6 %) : 9° de cassure (la charte, R2) */
          if(f<nF-1){droite(Math.max(60*LL,.6*VW),-.14,1);let sg=sens();for(let k=0;k<2;k++){const t=cote(sg,32+r()*12);arc(t[0]*t[1],RMIN*(2.0+r()*.6),-.15);sg=-t[0];}}}
        droite(Math.max(50*LL,.6*VW),-.14,1);cour(sens(),36+r()*12,2.4,3.2,-.14);gab('large',i0);MM.push({i0:i0,i1:C.length-1,fig:'porte'});}; /* la sortie tourne tout de suite (la règle des dix secondes) */
      /* LA GALERIE : la route taillée dans la falaise (corniche : la falaise côté -sv), trois longues courbes douces et deux droites sous un toit de roche — piliers et fenêtres côté vide */
      PC.galerie=()=>{recentre(-.22);const sv=sens(),i0=C.length-1,A=(70+r()*10)/57.2958;vise(sv*A/2,RMIN*(3.0+r()*.8),-.12);const ig=C.length-1; /* (la charte, R1) elle balance d'un côté de l'axe à l'autre (±35-40°) : à 34-46° autour du cap, le juge la voyait dans la même direction 9-10 s */
        droite(Math.max(90*LL,1.1*VW),-.10,2);vise(-sv*A/2,RMIN*(3.0+r()*.8),-.10);droite(Math.max(90*LL,1.1*VW),-.10,2);vise(sv*A/2,RMIN*(3.0+r()*.8),-.10);
        gab('galerie',ig,{sg:sv});droite(Math.max(70*LL,.8*VW),-.12,1);gab('corniche',i0,{sg:sv});MM.push({i0:i0,i1:C.length-1,nm:'galerie'});};
      /* LE SLALOM DES AIGUILLES : dans une vallée large, 4 ou 5 virages enchaînés (1,8-2,6 RMIN, 40-62°), une aiguille de 110-220 m à la corde de chacun */
      PC.aiguilles=()=>{recentre(-.25);const i0=C.length-1;let sg=phi>0?-1:1;const n=4+(r()<.45?1:0),A=(66+r()*12)/57.2958;droite(Math.max(60*LL,.7*VW),-.14,1);vise(-sg*A/2,RMIN*(2.0+r()*.6),-.14); /* (la charte, R1) le slalom balance de ±33-39° autour de l'axe */
        for(let k=0;k<n;k++){const ia=C.length-1;vise(sg*A/2,RMIN*(1.8+r()*.8),-(.13+r()*.06));gab('aiguille',ia);sg=-sg;if(k<n-1&&r()<.45)droite(Math.max(30*LL,.4*VW),-.12,1);}
        droite(Math.max(50*LL,.6*VW),-.14,1);gab('large',i0);MM.push({i0:i0,i1:C.length-1,nm:'aiguilles'});};
      /* LE LIT DE LA RIVIÈRE : une grande courbe qui descend au ras de l'eau, deux courbes amples presque à plat dans une vallée large (le lit : la rivière est là, 16 à 38 m sous la dalle),
         puis LE SAUT DE LA CASCADE : la rivière tombe, la route plonge à 55 % (la crête est adoucie par adoucirCretes : on décolle), une longue réception droite à 10 %.
         MESURÉ au calcul (g 15,8 m/s², 0,75 à 1,25 × la croisière) : 3,1 à 3,4 s de vol, la pose 30 à 180 m après le début de la réception (elle fait 2,9 s de croisière) */
      PC.riviere=()=>{recentre(-.3);large(Math.max(200*LL,2.3*VW),-.36);
        const i1=C.length-1;let sg=sens();if(CY_V3.on){const A=(70+r()*12)/57.2958;for(let k=0;k<2;k++){vise(sg*A/2,RMIN*(3+r()),-.03);sg=-sg;droite((50+r()*40)*LL,-.03,1);}} /* (V3) le lit balance d'un côté de l'axe à l'autre */
        else for(let k=0;k<2;k++){sg=-cour(sg,34+r()*14,3,4,-.03);droite((50+r()*40)*LL,-.03,1);}
        gab('vallee',i1);const i2=C.length-1;droite(Math.max(150*LL,1.9*VW),-.55,2);if(CY_V3.on){droite(Math.max(130*LL,1.6*VW),-.04,2);const l9=Math.max(110*LL,1.3*VW),a9=(phi>0?-1:1)*18;arc(a9,l9/(18/57.2958),-.28);} /* (la charte, R2) la fin de la réception tourne de 18° : droite, cascade et réception tenaient 3,6 s dans un cône de 8° */else droite(Math.max(240*LL,2.9*VW),-.10,3); /* (V3, la charte, R2) la réception à plat (la pose), puis une descente franche : lissée, la cascade et sa réception d'un seul tenant restaient 4,9 s dans un cône de 8° */
        gab('large',i2);MM.push({i0:i2,i1:C.length-1,fig:'cascade'});};
      /* LES MODULES NEUFS — même contrat que cSlalom : (p0, p1) = les pentes de la liaison, leur hasard dans `rm` */
      const cCourbes=(p0,p1)=>{if(CY_V3.on){let sg=phi>.01?-1:phi<-.01?1:(rm()<.5?-1:1);const n=2+(rm()<.5?1:0);for(let k=0;k<n;k++){vise(sg*(70+rm()*14)/114.59,RMIN*(2.4+rm()*.9),cmPe(p0,p1)*.8);sg=-sg;}return;} /* (V3) d'un côté de l'axe à l'autre */cmRe(.5,cmPe(p0,p1));let sg=phi>0?-1:1;const n=2+(rm()<.5?1:0);for(let k=0;k<n;k++){const t=cote(sg,44+rm()*18);arc(t[0]*t[1],RMIN*(2.4+rm()*.9),cmPe(p0,p1)*.8);sg=-t[0];}},
        cEntonnoir=(p0,p1)=>{cmRe(.45,cmPe(p0,p1));const sg=phi>0?-1:1,pe=cmPe(p0,p1),aT=Math.max(60,Math.min(96,(LIM-sg*phi)*57.2958-3));
          arc(sg*aT*.42,RMIN*3.2,pe*.7);arc(sg*aT*.33,RMIN*2.2,pe);arc(sg*aT*.25,RMIN*1.5,pe);droite(40*LL,pe*.8,1);}, /* le rayon se resserre (3,2 → 2,2 → 1,5 RMIN) : on entre dans le serré */
        cTremplin=(p0,p1)=>{cmRe(.5,cmPe(p0,p1));droite(Math.max(90*LL,1.2*VW),-.04,1);droite(Math.max(110*LL,1.4*VW),-.42,2);
          if(CY_V3.on){droite(Math.max(150*LL,1.9*VW),-.12,2);const t=cote(phi>0?-1:1,36+rm()*14);arc(t[0]*t[1],RMIN*(2.4+rm()*.6),-.12);} /* (V3) la réception finit en courbe : 5,2 s de droites d'affilée (la règle des dix secondes) */
          else droite(Math.max(200*LL,2.6*VW),-.12,2);}; /* la crête (−4 % → −42 %), ~2 s de vol, la réception droite */
      const CM2=cmJ.concat([cCourbes,cEntonnoir,cTremplin]),CMN=['slalom','corde','whoops','chicane','goulet','mesa2','gradins','courbes','entonnoir','tremplin'],
        PAQ={T:[],F:[]},JEU9={T:[0,3,4],F:[1,2,5,6,7,8,9]},rmK=mulberry32((g0^0x2C1B3D5F)>>>0);let nTech=0,mDer=-1,cPrec=''; /* rmK : (V3, la charte, R5) les paquets se mélangent à la GRAINE, pareil pour les 14 essais — tirés par essai, le meilleur essai gardait toujours les mêmes sortes (mesa2, chicane, courbes, entonnoir : 45-55 % des routes) */ /* deux paquets : T le technique (slalom, chicane, goulet), F le coulé */
      const tire=q=>{let m=0;for(let e=0;e<6;e++){if(!PAQ[q].length){const t=JEU9[q].slice();for(let i=t.length-1;i>0;i--){const j=((CY_V3.on?rmK:rm)()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}for(const x9 of t)PAQ[q].push(x9);}m=PAQ[q].shift();if(m!==mDer)break;}mDer=m;return m;},
        poseR=(q,p0,p1,evite)=>{let m=tire(q);if(evite&&m===9)m=tire(q);const i0=C.length-1; /* evite : (V3) pas de tremplin (ses 4,5 s de droites) collé à une pièce déjà longue et droite — la règle des dix secondes */CM2[m](p0,p1);MM.push({i0:i0,i1:C.length-1,nm:CMN[m]});if(q==='F'){if(!CY_V3.on)gab('ouvert',i0);} /* (V3) la liaison coulée reste dans le serré */else{nTech++;if(CY_V3.on)gab('serre',i0);} /* (V3) le technique garde ses parois collées : c'est le seul couloir hors des fentes */return CMN[m];},
        carR=(noms,len,p0,p1,ouv)=>{const i0=C.length-1;let i=(rh()*noms.length)|0;if(noms[i]===cPrec)i=(i+1)%noms.length;cPrec=noms[i];CAR9[CARN.indexOf(noms[i])](len,p0,p1);if(ouv&&!CY_V3.on)gab('ouvert',i0);return noms[i]==='gorge'?'amples':noms[i];}; /* (le caractère « gorge » = de grandes courbes : « amples » dans le bilan, la pièce `gorge` est la grande gorge) */
      /* LA LIAISON selon ses voisines (`av`, `ap` : la pièce d'avant, la pièce d'après) : entre deux pièces LARGES, du technique aux parois serrées (le contraste : on resserre avant
         de rouvrir) ; sinon un souffle (une droite franche de 1,8-3,2 s), un module coulé ou un caractère ample — en gabarit OUVERT */
      const LRG={gorge:1,meandre:1,traversee:1,riviere:1,amphi:1,vire:1,mur:1,rac:1,voute:1,butte:1,gouffre:1,porte:1,galerie:1,aiguilles:1,phrase:1},
        lienR=(av,ap)=>{const p0=.30*kP,p1=.55*kP,u=rh(),len=LIEN*(.7+rh()*.6);
          if(CY_V3.on&&av==='breche'&&rm)return poseR('F',p0*.8,p1*.8,/^(butte|gouffre|porte|voute)$/.test(ap)); /* (V3, la charte, R4) après la brèche, un module nommé : la route 67, la brèche et une liaison sans nom faisaient jusqu'à 12,9 s sans rien */
          if(LRG[av]&&LRG[ap]){if(rm&&nTech<(CY_V3.on?1:CY_REF.tech)&&u<(CY_V3.on?.45:.75))return poseR('T',p0,p1); /* (V3, la charte, R5) un seul technique par route : ses trois sortes revenaient d'une graine à l'autre */return carR(['serpent','cassures','meandres'],len,p0,p1,0);}
          if(ap!=='rapide'&&av!=='rapide'&&ap!=='rac'&&av!=='rac'&&!(CY_V3.on&&(/^(butte|gouffre|porte|voute)$/.test(av)||/^(butte|gouffre|porte|voute)$/.test(ap)))&&u<.3){ /* (V3) pas de souffle collé aux pièces déjà longues et droites (la règle des dix secondes) */const i0=C.length-1,sj=((CY_V3.on?1.4:1.8)+rh()*1.4)*VW;droite(sj,-PENTE[ap]*kP,Math.max(1,Math.round(sj/90)));if(!CY_V3.on)gab('ouvert',i0);return 'souffle';}
          if(rm&&u<(CY_V3.on?.42:.8))return poseR('F',p0*.8,p1*.8, /* (V3, la charte, R5) une liaison sur quatre devient un module nommé (au lieu d'une sur deux) : les sept sortes du paquet revenaient d'une graine à l'autre (Jaccard 0,55-0,60) ; les autres balancent sans nom */CY_V3.on&&(/^(butte|gouffre|porte|voute)$/.test(av)||/^(butte|gouffre|porte|voute)$/.test(ap)));
          if(rm&&nTech<(CY_V3.on?1:CY_REF.tech)&&!LRG[ap]&&u<(CY_V3.on?.62:.9))return poseR('T',p0,p1); /* (V3, la charte, R5) le technique n'est plus de chaque route : ses trois sortes faisaient une paire commune sur trois */
          return carR(['gorge','derive','meandres'],len,p0*.8,p1*.8,1);};
      /* LE JEU DE PIÈCES : la grande gorge toujours, et une pièce de PAROI ou d'EAU (toboggan, vire, grand mur, rivière, méandre, traversée : la longueur d'un canyon — ~6 km au palier 0 —
         tient 4 pièces avec le rapide ; la rivière et le méandre, les plus longues, ne sortaient jamais comme simples facultatives) ; puis, mélangées, celles que la longueur visée tient (jamais la vire ET le
         grand mur) ; l'ordre alterne large et serré ; le rapide (le climax) à ~62 % de la suite. Une fois sur trois, entre une pièce large et une serrée, PAS de liaison : on passe
         de l'une à l'autre d'un coup (MESURÉ au banc : avec une liaison partout, la longueur ne tenait que 4 pièces et plus jamais l'arche, l'amphithéâtre, la mine ni les étroits) */
      const E2={gorge:2.6*VW+(CY_V3.on?9.7:8.1)*RMIN+150*LL,meandre:10.6*RMIN+1.9*VW+60*LL,traversee:(CY_V3.on?6.2:4)*RMIN+2.4*VW,toboggan:9*VW+(CY_V3.on?1.8*RMIN:0)+50*LL,vire:2*RMIN+CY_REF.vireT*VW+120*LL,riviere:7.1*VW+(CY_V3.on?6.5:5)*RMIN+140*LL,
          mur:EST.mur,rac:EST.rac,pipe:(CY_V3.on?10.2*VW+2*RMIN:9*VW)+50*LL,voute:((CY_V3.on?cyVouteT():CY_REF.vouteT)+1.2)*VW+160*LL,phrase:CY_V3.on?cyPhraseCles('traversee').reduce(function(a,k){return a+k[0];},0)*VW*cyElan()+2*RMIN:0,butte:2.8*VW+13.5*RMIN+Math.max(470*LL,5.3*VW),gouffre:2.8*VW+13.5*RMIN+Math.max(470*LL,5.3*VW),porte:5.1*VW+2.9*RMIN,galerie:3.4*VW+(CY_V3.on?10.7:5.5)*RMIN,aiguilles:1.4*VW+(CY_V3.on?13.8:9)*RMIN,rapide:CY_V3.on?5*VW*cyElan()+6.5*RMIN:2.5*VW+4.5*RMIN+100*LL,etroits:4.8*RMIN+260*LL,arche:EST.arche,amphi:6.3*RMIN,mine:EST.mine,chameau:EST.chameau,bosses:EST.bosses},
        LI2=(CY_V3.on?.5:.78)*(.75*VW+3.25*RMIN+.35*LIEN), /* (V3) des liaisons plus courtes : il se passe plus de choses */DEB=820*LL*(LC9?.35:1)+100*RS+420*LL,FIN2=LI2+80+(LC9?372:620)*LL+150,
        rj=mulberry32((g0^0x7E51A9C3)>>>0),melJ=a=>{for(let i=a.length-1;i>0;i--){const j=(rj()*(i+1))|0,x9=a[i];a[i]=a[j];a[j]=x9;}return a;}, /* LE JEU se tire dans `rj`, né de la graine SEULE (pas de l'essai) : MESURÉ au banc, tiré à chaque essai, le directeur de rythme gardait toujours les essais sans rivière, sans méandre ni bosses (leur crête, leur pont droit coûtent à la note) — ces pièces ne sortaient plus jamais. Les 14 essais d'un canyon ont désormais les mêmes pièces dans le même ordre : seule leur géométrie change */
        B2=LC9?LC9*(CY_V3.on?CY_V3.kL:CY_HZ.kL)*(.92+rj()*.16):0, /* (V3) un canyon un peu plus long (×1,45 au lieu de 1,34) : deux replis, une pièce de paroi et une autre y tiennent */
        tir=P9=>{let s9=0;for(const k in P9)s9+=P9[k];let t=rj()*s9;for(const k in P9){t-=P9[k];if(t<0)return k;}return Object.keys(P9)[0];};
      const FAM=/^(vire|mur|pipe|voute|toboggan)$/;let jeu; /* FAM : les pièces de PAROI (la dalle se couche) — trois au plus par canyon */
      if(CY_V3.on){ /* ===== LE JEU V3 : une pièce SIGNATURE (le spectacle : la butte, la porte, la galerie, la voûte, le trombone), puis des pièces tirées AU POIDS sans remise tant que la
         longueur visée les tient — trois pièces de paroi au plus, deux signatures au plus ===== */
        /* (la charte des routes) R6 : DEUX REPLIS par route (deux sortes différentes parmi la butte, le gouffre et le trombone : la route repasse sous elle-même, on saute dessus) ;
           puis les autres pièces au poids — la grande gorge en tête ; au moins DEUX moments contre une paroi (la gorge et ses corniches couchées, les boucles, la voûte, le pipe, la vire, le mur) */
        {const PLI={butte:1,gouffre:1,rac:1},p1=tir(PLI);let p2=p1;for(let e=0;e<8&&p2===p1;e++)p2=tir(PLI);if(p2===p1)p2=p1==='butte'?'gouffre':'butte';jeu=[p1,p2];}
        if(CY_MUR.on){jeu.push('phrase');phrV=rj()<.45?'arche':'traversee';} /* (Sacha : « à l'endroit, à l'envers… rider sur les murs ») LA PHRASE DU MUR sur CHAQUE route */
        if(CY_MUR.on&&CY_REF.vou&&rj()<CY_V3.vouteP)jeu.push('voute'); /* (évaluation de Sacha : « l'envers a disparu ») LA VOÛTE plus d'une route sur deux : le tour complet dans le tube, sens dessus dessous */
        const FW={gorge:1.8,porte:1.8,galerie:1.6,voute:0,pipe:CY_MUR.on?1.5:0,vire:CY_MUR.on?1.5:0,mur:CY_MUR.on?1.4:0,toboggan:1.2,aiguilles:1.7,traversee:1.7,meandre:1.4,riviere:1.4,arche:1.2,amphi:1.2,etroits:0,mine:1,chameau:.9,bosses:.9}, /* (la charte, R5) des poids presque égaux : la porte, la galerie, les aiguilles sortaient dans une route sur deux */ /* (V3) etroits : 0 — leurs parois à pic (la fente : pied à 46 m) étiraient leurs nappes violettes, comme le goulot */
          pool=Object.keys(FW).filter(k=>FW[k]>0&&jeu.indexOf(k)<0),ord=[];
        while(pool.length){let t=0;for(const k of pool)t+=FW[k];let u9=rj()*t,j=0;for(;j<pool.length-1;j++){u9-=FW[pool[j]];if(u9<0)break;}ord.push(pool.splice(j,1)[0]);}
        const SIGF=/^(porte|galerie|voute)$/,MURS=/^(gorge|butte|gouffre|voute|pipe|vire|mur|phrase)$/;let u=DEB+FIN2+LI2+E2.rapide;for(const p of jeu)u+=LI2+E2[p];
        for(const p of ord){if(/^(vire|mur|pipe)$/.test(p)&&jeu.some(q=>/^(vire|mur|pipe)$/.test(q)))continue; /* une paroi par route (la charte, R5) */if((p==='vire'&&jeu.indexOf('mur')>=0)||(p==='mur'&&jeu.indexOf('vire')>=0))continue;if(FAM.test(p)&&jeu.filter(q=>FAM.test(q)).length>=3)continue;
          if(SIGF.test(p)&&jeu.filter(q=>SIGF.test(q)).length>=2)continue;if(!LC9||u+LI2+E2[p]<=B2){jeu.push(p);u+=LI2+E2[p];}}
        const ok9=p=>jeu.indexOf(p)<0&&!(/^(vire|mur|pipe)$/.test(p)&&jeu.some(q=>/^(vire|mur|pipe)$/.test(q))) /* (la charte, R5) UNE paroi parmi la vire, le grand mur et le pipe : deux routes au hasard partageaient souvent les deux mêmes */&&!((p==='vire'&&jeu.indexOf('mur')>=0)||(p==='mur'&&jeu.indexOf('vire')>=0))&&!(FAM.test(p)&&jeu.filter(q=>FAM.test(q)).length>=3)&&!(SIGF.test(p)&&jeu.filter(q=>SIGF.test(q)).length>=2);
        if(CY_MUR.on&&!jeu.some(q=>/^(vire|mur|pipe)$/.test(q))){const W9=['vire','mur','pipe'].filter(ok9);if(W9.length)jeu.push(W9[(rj()*W9.length)|0]);} /* (« fais rider les murs ») un VRAI passage sur la paroi par route : la vire, le grand mur ou le pipe (80-86° de dévers) */
        for(const p of ord){if(jeu.length>=6)break;if(ok9(p))jeu.push(p);} /* (la charte, R5) trois pièces au moins hors des replis : la route raconte autre chose que ses deux boucles (à deux, deux routes au hasard partageaient jusqu'à 60 % de leurs modules) */
        if(jeu.filter(q=>MURS.test(q)).length<2){const w9=ord.find(p=>MURS.test(p)&&ok9(p));if(w9)jeu.push(w9);} /* deux moments contre la paroi au moins, même au-delà de la longueur visée */
      }else{
      const due2=tir(CY_MUR.on?{toboggan:3,vire:3,mur:2.5,pipe:3.5,riviere:2.5,meandre:2.5,traversee:1.5,voute:CY_REF.vou?CY_REF.vouteW:0}:{toboggan:3,riviere:2.5,meandre:2.5,traversee:1.5});jeu=['gorge',rj()<CY_REF.rac?'rac':due2]; /* le trombone, rare : il prend la place de la pièce due (1,5 à 2 km : avec lui la longueur ne tient plus que la gorge et le rapide) */
      {const autres=melJ(['meandre','traversee','riviere','toboggan','vire','mur','pipe','voute','amphi','arche','etroits','mine','chameau','bosses'].filter(k=>jeu.indexOf(k)<0&&(CY_MUR.on||!/^(vire|mur|pipe|voute)$/.test(k))&&(k!=='voute'||CY_REF.vou)));
        let u=DEB+FIN2+LI2+E2.rapide;for(const p of jeu)u+=LI2+E2[p];
        for(const p of autres){if((p==='vire'&&jeu.indexOf('mur')>=0)||(p==='mur'&&jeu.indexOf('vire')>=0))continue;if(FAM.test(p)&&jeu.filter(q=>FAM.test(q)).length>=3)continue;if(!LC9||u+LI2+E2[p]<=B2){jeu.push(p);u+=LI2+E2[p];}}}
      }
      melJ(jeu);{const o=[],pool=jeu.slice();while(pool.length){let k=0;if(o.length){const d=!!LRG[o[o.length-1]],j=pool.findIndex(p=>!!LRG[p]!==d);if(j>=0)k=j;}o.push(pool.splice(k,1)[0]);}jeu=o;}
      if(CY_V3.on){const PL9=/^(butte|gouffre|rac)$/;for(let k=1;k<jeu.length;k++)if(PL9.test(jeu[k])&&PL9.test(jeu[k-1])){const j=jeu.findIndex((p,q)=>!PL9.test(p)&&q!==k-1&&q!==k);if(j>=0){const x9=jeu.splice(j,1)[0];jeu.splice(j<k?k-1:k,0,x9);}}} /* (V3) deux replis collés : une autre pièce entre les deux */
      {const ins=Math.max(1,Math.min(jeu.length,Math.round(.62*jeu.length)));let bon=null;for(let d=0;d<=jeu.length&&bon===null;d++)for(const q of [ins+d,ins-d])if(q>=1&&q<=jeu.length&&jeu[q-1]!=='rac'&&jeu[q]!=='rac'){bon=q;break;}
        jeu.splice(bon===null?ins:bon,0,'rapide');} /* le climax à ~62 % de la suite, jamais collé au trombone */
      hz={axe:Math.round(ax*57.2958),pente:+kP.toFixed(2),B:Math.round(B2),LL:+LL.toFixed(2),RS:+RS.toFixed(2),RMIN:Math.round(RMIN),refonte:1,p:[],c:[]};
      push();ici('depart');
      {const l9=820*LL*(LC9?.35:1);if(CY_V3.on){droite(l9*.55,-.025,Math.max(2,Math.round(l9*.55/90)));droite(l9*.45,-.18,Math.max(2,Math.round(l9*.45/90)));}else droite(l9,-.025,Math.max(2,Math.round(l9/90)));}ici('breche0');   // LA ROUTE 67 (sa station, son panneau) — (V3) toujours droite, mais elle plonge à mi-chemin (la charte, R2 : pas de tout droit de plus de 5 s)
      {const a=(r()<.5?-1:1)*(5+r()*6);if(CY_V3.on)arc(a*2.4,700*RS,-.35);else droite(Math.abs(a)/57.2958*700*RS,-.2);} /* (V3, la charte R2) la brèche reprend sa courbe (12-26°) : la route 67 et la brèche droites tenaient 3,2 s dans un cône de 8° */
      large(330*LL,-.62);ici('breche1');droite(90*LL,-.25,2);                                            // LA BRÈCHE : le plongeon dans la gorge
      const coude=()=>{if(rh()>=CY_HZ.coude)return;let d=(rh()<.5?-1:1)*(10+rh()*15)/57.2958;const M9=CY_HZ.cmax/57.2958;if(Math.abs(AX9+d)>M9)d=-d;
        if(Math.abs(AX9+d)<=M9&&Math.abs(phi-d)<LIM-.09){AX9+=d;phi-=d;hz.c.push(Math.round(d*57.2958));}};
      jeu.forEach(function(p,k){if(k)coude();const f0=fait(),dir9=k&&p!=='rapide'&&jeu[k-1]!=='rapide'&&p!=='rac'&&jeu[k-1]!=='rac'&&!!LRG[p]!==!!LRG[jeu[k-1]]&&rh()<(CY_V3.on?.55:.35),c9=dir9?'direct':lienR(k?jeu[k-1]:'breche',p),f1=fait();PC[p]();hz.p.push([c9,Math.round(f1-f0)],[p,Math.round(fait()-f1)]);});
      coude();{const f0=fait(),c9=carR(['gorge','meandres','derive'],LC9?Math.max(.5*LIEN,Math.min(CY_V3.on?320*LL:700*LL,(B2-fait()-(FIN2-LI2))/1.75)):240*LL,.30*kP,.5*kP,1); /* (V3, la charte, R4) 320 m au plus : à 700 m (× 1,75), la dernière liaison faisait jusqu'à 14 s sans module avant la finale */hz.p.push([c9,Math.round(fait()-f0)]);}recentre(-.4); // la dernière liaison prend ce qui manque à la longueur visée
      ici('finale0');large(300*LL*(LC9?.6:1),-.75);large(320*LL*(LC9?.6:1),-.12);ici('fin');droite(150,-.05,2); // LA FINALE (le tunnel de grès)
      }else{
      const PDS={arche:3,amphi:3,etroits:2,mine:1.5,chameau:1,bosses:1};let deux='arche';{let t=rh()*11.5;for(const k in PDS){t-=PDS[k];if(t<0){deux=k;break;}}}
      const autres=Object.keys(PDS).filter(k=>k!==deux);let jeu=['rac',deux];
      if(CY_MUR.on&&rh()<CY_MUR.proba){autres.push(deux);jeu=['rac','mur'];deux='mur';} /* (LE CANYON SUR LES MURS) dans ~4 canyons sur 10, la pièce DUE est le module des parois (la pièce tirée passe au rang des facultatives) : le budget de longueur ne change pas */
      if(!LC9)jeu=jeu.concat(autres,['rac','rac','rac','rac','rac','rac','rac']);
      else{let u=FIN+2*LI9+EST.rac+EST[deux]+820*LL*.35+98*RS+420*LL;for(const p of mel(autres.concat(['rac'])))if(u+LI9+EST[p]<=B){jeu.push(p);u+=LI9+EST[p];}}
      mel(jeu);
      if(V2){let ins=Math.round(.62*jeu.length),bon=null;for(let d=0;d<=jeu.length&&bon===null;d++)for(const q of [ins+d,ins-d]){if(q>=1&&q<=jeu.length&&jeu[q-1]!=='rac'&&jeu[q]!=='rac'){bon=q;break;}}
        jeu.splice(bon===null?ins:bon,0,'rapide');} /* le climax, à ~62 % de la suite, jamais collé à une boucle */
      hz={axe:Math.round(ax*57.2958),pente:+kP.toFixed(2),B:Math.round(B),LL:+LL.toFixed(2),RS:+RS.toFixed(2),RMIN:Math.round(RMIN),p:[]};
      push();ici('depart');
      {const l9=820*LL*(LC9?.35:1);droite(l9,-.025,Math.max(2,Math.round(l9/90)));}ici('breche0');   // LA ROUTE 67 (sa station, son panneau)
      {const a=(r()<.5?-1:1)*(5+r()*6);if(V2)droite(Math.abs(a)/57.2958*700*RS,-.2);else arc(a,700*RS,-.2);} /* v2 : l'arc de 5-11° est une droite */
      large(330*LL,-.62);ici('breche1');droite(90*LL,-.25,2);                                            // LA BRÈCHE : le plongeon dans la gorge
      // LE COUDE : entre deux pièces, l'axe de la gorge tourne (±10-25°, ±`cmax`° au plus autour de l'axe tiré) — la route garde son cap, la suite se
      // compte autour du nouvel axe (le cap reste à moins de 90° de l'axe tiré : la route ne revient jamais sur elle-même)
      const coude=()=>{if(rh()>=CY_HZ.coude)return;let d=(rh()<.5?-1:1)*(10+rh()*15)/57.2958;const M9=CY_HZ.cmax/57.2958;if(Math.abs(AX9+d)>M9)d=-d;
        if(Math.abs(AX9+d)<=M9&&Math.abs(phi-d)<LIM-.09){AX9+=d;phi-=d;hz.c.push(Math.round(d*57.2958));}};hz.c=[];
      jeu.forEach(function(p,k){if(k)coude();const f0=fait();let c9;if(V2&&p!=='rapide'&&p!=='rac'&&pPrec!=='rac'&&rh()<.5){const sj=(1.8+rh()*1.4)*VW;droite(sj,-PENTE[p]*kP,Math.max(1,Math.round(sj/90)));c9='souffle';}else c9=lienH(LIEN*(.7+rh()*.6),.30,.55); /* v2 : une fois sur deux, le souffle = une droite franche de 1,8-3,2 s */const f1=fait();PC[p]();pPrec=p;hz.p.push([c9,Math.round(f1-f0)],[p,Math.round(fait()-f1)]);});
      coude();{const f0=fait(),c9=lienH(LC9?Math.max(.6*LIEN,Math.min(900*LL,(B-fait()-(FIN-LI9))/1.75)):240*LL,.30,.55);hz.p.push([c9,Math.round(fait()-f0)]);}recentre(-.4); // la dernière liaison prend ce qui manque à la longueur visée
      ici('finale0');large(300*LL*(LC9?.6:1),-.75);large(320*LL*(LC9?.6:1),-.12);ici('fin');droite(150,-.05,2); // LA FINALE (le tunnel de grès)
      }
    }else{
    push();ici('depart');
    r();r();{const l9=820*LL*(LC9?.35:1);droite(l9,-.025,Math.max(2,Math.round(l9/90)));}ici('breche0'); /* (2026-10-15 soir, Sacha : « le niveau dans le canyon doit commencer par une longue ligne droite, une vieille station-service et un panneau ROUTE 66 ») LA ROUTE 66 : la vallée des Mitaines en LONGUE LIGNE DROITE (820 m, à peine en pente) — les deux tirages de l'ancienne courbe sont gardés : la suite du canyon ne bouge pas. Avant : large(340*LL,-.05,(480+r()*200)*RS) */
    {const a=(r()<.5?-1:1)*(5+r()*6);arc(a,700*RS,-.2);}
    large(330*LL,-.62);ici('breche1');droite(90*LL,-.25,2);                 // LA BRÈCHE : le grand plongeon dans la gorge — en virage
    lien(380*LL*kC,.30,.55);
    {ici('fer0');boucle('racA',sens());ici('fer1');}                          // les RACCOURCIS, un tous les ~1,5 km
    if(tient(.3)){lien(300*LL,.28,.5);boucle('racB',sens());}
    if(tient(.38)){ici('bosses');bosses(2);boucle('racC',sens());}
    lien(300*LL*kC,.30,.55);recentre(-.3);
    if(tient(.45)){ici('etroit0');let sg=sens();for(let k=0;k<(LC9?4:6);k++){arc(sg*(24+r()*16),(150+r()*60)*RS,-.30);sg=-sg;}ici('etroit1');} // LES ÉTROITS : le COULOIR — ça serpente entre deux murs collés à la route
    if(tient(.5)){large(260*LL,-.28);boucle('racD',sens());}else large(160*LL,-.28);  // (2026-10-15) un grand virage de sortie : la zone de saut du raccourci D sort du fondu de la fente (sinon une crête de roche coupait le saut)
    droite(90*LL,-.2,2);ici('arche0');large(360*LL*(LC9?.6:1),-.14,(560+r()*200)*RS);ici('arche1');  // L'ARCHE (une courbe douce : l'arche se pose au milieu, en travers)
    if(tient(.62)){const sg=sens();arc(-sg*40,300*RS,-.35);ici('amphi0');arc(sg*96,(230+r()*40)*RS,-.42);ici('amphi1');} // L'AMPHITHÉÂTRE
    if(tient(.68)){boucle('racE',sens());ici('mine0');large(300*LL,-.16);large(300*LL,-.16);ici('mine1');}  // LA MINE abandonnée : deux grandes courbes sous la roche (cyMine)
    if(tient(.74))boucle('racF',sens());
    if(tient(.78)){const l1=(150+r()*40)*LL,h=(24+r()*10)*SQ,l2=(250+r()*60)*LL;ici('chameau');droite(l1,h/l1,3);large(l2,-(h+80*SQ)/l2);} // LE DOS DE CHAMEAU (la descente tourne)
    if(tient(.8)){lien(260*LL,.30,.55);boucle('racG',sens());}
    if(tient(.84)){lien(260*LL,.30,.55);boucle('racH',sens());}
    lien(240*LL*kC,.30,.55);recentre(-.4);
    ici('finale0');large(300*LL*(LC9?.6:1),-.75);large(320*LL*(LC9?.6:1),-.12);ici('fin');droite(150,-.05,2); // la finale : deux grandes courbes, seule la ligne d'arrivée reste droite
    }
    // LE CONTRÔLE : deux tronçons à plus de 1,2 km l'un de l'autre sur la route ne passent jamais à moins de ~560 m — SAUF à l'intérieur
    // d'une même boucle (c'est le raccourci, voulu)
    const n=C.length,acc=new Float32Array(n),bo=new Int16Array(n).fill(-1);for(let k=1;k<n;k++)acc[k]=acc[k-1]+Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);
    BO.forEach(function(q,m){let e=q[1];if(q[2]){let d9=0;while(e<n-1&&d9<q[2]){d9+=Math.hypot(C[e+1].x-C[e].x,C[e+1].z-C[e].z);e++;}}for(let k=q[0];k<=e;k++)bo[k]=m;}); /* (V3) q[2] : la boucle déclarée se prolonge de q[2] m après la pièce (la route qui file dans l'axe après la piste de la butte passe forcément à ~500 m du début du tour) */
    let sep=1e9;for(let i=0;i<n;i++){if((i&63)===63)yield;for(let j=i+1;j<n;j++){if(acc[j]-acc[i]<1200*LL||(bo[i]>=0&&bo[i]===bo[j]))continue;const d=Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z);if(d<sep)sep=d;}}
    const ok9=sep>560*SQ,f9=rythmeMesure(C,{vP:VW,rP:RMIN/1.08,marks:MM}),dx9=CY_V3.on?cyDix(cyLisse(C),VW,RMIN):null,nt9=rythmeNote(f9,cib9)+(ok9?0:50+(560*SQ-sep)*.1)+(dx9?cyDixNote(dx9):0);if(hz&&dx9)hz.dix=dx9;notes9.push(+nt9.toFixed(1)); /* (LE DIRECTEUR DE RYTHME) un essai aux écarts trop courts coûte 50 et plus : on le garde seulement faute de mieux */
    if(nt9<bestNote){bestNote=nt9;bestSep=sep;best={C:C,Q:Q,MM:MM,GA:GA,ax:ax,hz:hz,note:nt9,fiche:f9};}
    if(ok9&&nt9<=1.5)break;}
  RYTHME.der={carte:'canyon',note:best.note,notes:notes9,fiche:best.fiche};
  if(best.ax){const ca=Math.cos(best.ax),sa=Math.sin(best.ax),tr=v=>{const x=v.x;v.x=x*ca+v.z*sa;v.z=v.z*ca-x*sa;}; // (LE CANYON AU HASARD) l'AXE : la route bâtie dans l'axe +z, tournée autour du départ
    for(const v of best.C)tr(v);for(const k in best.Q){tr(best.Q[k].p);best.Q[k].phi+=best.ax;}}
  CY.hz=best.hz||null;if(CY.hz){CY.hz.sep=Math.round(bestSep);CY.hz.note=+best.note.toFixed(1);CY.hz.notes=notes9;}
  lisserRaccords(best.C);adoucirCretes(best.C,1);
  for(const k in best.Q){const o=best.Q[k];let bi=0,bd=1e18;for(let j=0;j<best.C.length;j++){const d=best.C[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.copy(best.C[bi]);}
  cyMurPose(best.C,best.Q,VW,best.GA); /* (LE CANYON SUR LES MURS) les normales de la dalle couchée (CY.murN) — (LA REFONTE) et les dévers du toboggan et de la vire */
  CY.Q=best.Q;CY.sep=Math.round(bestSep);
  CY.gab=(best.GA||[]).map(function(g){return Object.assign({},g,{p0:best.C[g.i0].clone(),p1:best.C[Math.min(best.C.length-1,g.i1)].clone()});}); /* (LA REFONTE) les gabarits : leurs deux bouts sur la route finale (cyBatitG en fait des abscisses) */
  for(const m of best.MM||[]){if(m.nom==null)m.nom=m.nm||m.fig||'module';MODMARK.push(m);} /* (2026-11-13, la charte des routes) chaque module porte son nom */ // (2026-10-18) LES MODULES DE CHAQUE MAP : ceux de l'essai gardé (voir cSlalom)
  return best.C;
}
/* LES BRUITS PARTAGÉS (une fois par session) — deux textures RGBA8 256², et les MÊMES octets côté processeur : `CY.rnd` (des tirages bruts,
   lus au texel près : les buttes) et `CY.nz` (quatre bruits fbm qui se répètent, lus en bilinéaire : les corniches, le grain). */
/* (2026-11-01, Léo : « règle les petits à-coups ») LES BRUITS EN PAS : au menu, la chauffe (cyBruitsPas) en fait un canal par image — d'un bloc,
   MESURÉ 91 ms ×4. Les mêmes tirages dans le même ordre (g passe d'un canal au suivant) : les mêmes octets. cyBruits finit ce qui reste. */
function cyBruitsPas(){if(CY.nz)return false;const N=256;let Z=CY.bz;
  if(!Z){const rd=new Uint8Array(N*N*4),r=mulberry32(0xC4A170);for(let i=0;i<rd.length;i++)rd[i]=(r()*256)|0;Z=CY.bz={rd:rd,nz:new Uint8Array(N*N*4),g:mulberry32(0x5A4D),c:0};return true;}
  if(Z.c<4){const c=Z.c++,nz=Z.nz,g=Z.g,F=[4,8,16,32][c],lat=[];for(let o=0;o<4;o++){const f=F<<o,a=new Float32Array(f*f);for(let i=0;i<a.length;i++)a[i]=g();lat.push([f,a]);}
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0,am=.5,tt=0;
      for(const L9 of lat){const f=L9[0],a=L9[1],u=x/N*f,w=y/N*f,i=Math.floor(u),j=Math.floor(w),fu=u-i,fw=w-j,su=fu*fu*(3-2*fu),sw=fw*fw*(3-2*fw);
        const A=a[(j%f)*f+(i%f)],B9=a[(j%f)*f+((i+1)%f)],C9=a[((j+1)%f)*f+(i%f)],D9=a[((j+1)%f)*f+((i+1)%f)];
        v+=am*(A+(B9-A)*su+(C9-A)*sw+(A-B9-C9+D9)*su*sw);tt+=am;am*=.5;}
      nz[(y*N+x)*4+c]=Math.max(0,Math.min(255,Math.round(((v/tt-.5)*1.7+.5)*255)));}}
  return Z.c<4;}
function cyBruits(){ if(CY.nz)return;
  while(cyBruitsPas());const N=256,rd=CY.bz.rd,nz=CY.bz.nz;CY.bz=null;
  const mk=(d,lin)=>{const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat,THREE.UnsignedByteType);t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.magFilter=t.minFilter=lin?THREE.LinearFilter:THREE.NearestFilter;t.generateMipmaps=false;if(lin){t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;}t.needsUpdate=true;return t;};
  CY.rnd=rd;CY.nz=nz;CY.tRnd=mk(rd,false);CY.tNz=mk(nz,true);
  CY.tStr=cyStrates();}
function cyNz(u,v,c){ // le bruit `CY.nz` lu comme la puce (bilinéaire, répété) — u, v en tuiles (1 = 256 texels)
  const N=256,x=u*N-.5,y=v*N-.5,i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,d=CY.nz,i0=((i%N)+N)%N,j0=((j%N)+N)%N,i1=(i0+1)%N,j1=(j0+1)%N;
  const a=d[(j0*N+i0)*4+c],b=d[(j0*N+i1)*4+c],e=d[(j1*N+i0)*4+c],f=d[(j1*N+i1)*4+c];
  return ((a+(b-a)*fx)*(1-fy)+(e+(f-e)*fx)*fy)/255;}
/* LES STRATES — une colonne de 1 024 couches (un texel = 2,3 m : ~2,4 km de roche, répétée) : des GRÈS MASSIFS (crème, jaune beurre,
   saumon, corail, blanc de calcaire : les falaises) séparés de LITS MINCES (rose, brique, lavande, ocre, magenta : les talus). Le jaune et le
   rose d'abord (Sacha) ; le corail et la brique en accents. sRGB dans la texture (décodé au carré dans le shader) ; A = « massif » (le litage oblique). */
function cyStrates(){
  const N=1024,d=cyStratesDonnees(new Uint8Array(N*4),null);
  const t=new THREE.DataTexture(d,1,N,THREE.RGBAFormat,THREE.UnsignedByteType);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;{t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;}t.needsUpdate=true;
  return t;}
/* (2026-10-20, LE CANYON AU HASARD, SON DÉCOR) LES PALETTES DES STRATES : mêmes lits, mêmes épaisseurs (le même tirage), la teinte de chaque lit tirée vers celle
   de la palette À LUMINANCE ÉGALE — m : les grès massifs, n : les lits minces ; [r, g, b, part, gain]. `classique` (null) = les octets d'avant, au bit près. */
const CY_PALS={classique:null,sedona:{m:[.90,.46,.30,.36,.96],n:[.72,.28,.20,.4,.92]},zion:{m:[1,.93,.82,.55,1.06],n:[.86,.42,.28,.42,.95]},
  peint:{m:[.94,.64,.54,.35,1],n:[.62,.54,.80,.72,1.02]},bryce:{m:[.99,.66,.36,.38,1],n:[.97,.84,.68,.4,1.05]}};
function cyStratesTeinte(nm){if(!CY.tStr)return;cyStratesDonnees(CY.tStr.image.data,CY_PALS[nm]||null);CY.tStr.needsUpdate=true;}
function cyStratesDonnees(d,T){
  const N=1024,r=mulberry32(0x57A7A),te=(L9,mas)=>{if(!T)return L9;const q=mas?T.m:T.n,l=L9[0]*.3+L9[1]*.55+L9[2]*.15,n=q[0]*.3+q[1]*.55+q[2]*.15,g=l*q[4]/n,k=q[3];
    return [L9[0]+(q[0]*g-L9[0])*k,L9[1]+(q[1]*g-L9[1])*k,L9[2]+(q[2]*g-L9[2])*k,L9[3],L9[4]];};
  /* (2026-10-17, continuité des maps — « la colorimétrie et les textures ») LA ROCHE EN TERRES : les lits ROSE, MAGENTA et ROSE PÂLE, poussés au fluo par
     la chaîne de saturation (×1,55), faisaient des rayures roses sur toutes les falaises ; ils deviennent VIEUX ROSE, LIE-DE-VIN et PÊCHE, la lavande
     un GRIS-VIOLET froid (l'ombre commune des maps), le corail une TERRE CUITE. Mêmes lits, mêmes épaisseurs (le tirage ne bouge pas). */
  const MAS=[[244,228,204,16,38],[240,204,132,12,30],[236,172,138,10,24],[232,190,152,8,20],[212,126,88,7,16],[246,236,224,6,14],[236,212,166,10,26]];
  const MIN=[[208,150,138,3,10],[166,82,62,3,9],[156,148,166,2,7],[214,166,92,3,10],[164,96,90,1,3],[230,170,142,2,6]];
  let y=0,mas=true;
  while(y<N){
    const L9=te(mas?MAS[Math.floor(r()*MAS.length)]:MIN[Math.floor(r()*MIN.length)],mas),t=Math.max(!mas?4:0,Math.round(L9[3]+r()*(L9[4]-L9[3]))); // (matière) un lit mince n'est plus un trait de 2 m
    const sub=2+Math.floor(r()*3);
    for(let k=0;k<t&&y<N;k++,y++){const v=1+(mas?.04*Math.sin(k/sub*3.1+r()*.6):.03*(r()-.5)),o=y*4;
      d[o]=Math.min(255,Math.round(L9[0]*v));d[o+1]=Math.min(255,Math.round(L9[1]*v));d[o+2]=Math.min(255,Math.round(L9[2]*v));d[o+3]=mas?255:0;}
    mas=mas?false:(r()<.55);} // après une falaise : un ou deux lits minces
  return d;}
/* LE TIRAGE DU DÉCOR DU CANYON (2026-10-20) : des choix INDÉPENDANTS, dans un flux né de la graine de la piste (ni `rnd`, ni `r`, ni le tracé) — un objet simple
   (il part au travailleur) */
function cyTirage(seed){let h9=Math.imul((seed^0xDEC0CA)>>>0,0x9E3779B1);h9^=h9>>>15;h9=Math.imul(h9,0x85EBCA6B);h9^=h9>>>13;const rd=mulberry32(h9>>>0), /* (la graine brassée : des graines voisines ne tirent plus les mêmes choix) */ch=(L9,P9)=>{let t=rd()*P9.reduce((a,b)=>a+b,0);for(let i=0;i<L9.length;i++){t-=P9[i];if(t<0)return L9[i];}return L9[L9.length-1];},
    ent=(a,b)=>a+Math.floor(rd()*(b-a+1)),D={sd:(rd()*4294967296)>>>0};
  D.strates=ch(['classique','sedona','zion','peint','bryce'],[2.4,1.6,1.3,1.2,1.3]);D.brume=+ch([.4,1,1.7],[1,2,1]).toFixed(2);
  D.riviere=ch(['pleine','basse','asec'],[2.2,1.3,1.2]);D.eau={pleine:1,basse:.45,asec:0}[D.riviere];D.buttes=+(.55+rd()*1.1).toFixed(2);
  D.mit={g:rd()<.8,d:rd()<.8,mesa:rd()<.7,k:+(.8+rd()*.45).toFixed(2)};D.chem=+ch([.4,1,1.6],[1,2,1.2]).toFixed(2);
  D.arbres={k:+ch([.35,1,1.6],[1,2,1.3]).toFixed(2),nm:ch(['vert','automne','sombre'],[2,1.4,1])};D.eboulis=ch([0,120,260,420],[1,1.6,1.4,1]);D.vautours=ent(2,9);
  D.mine={la:rd()<.82,or:+(.4+rd()*2).toFixed(2),cad:rd()<.6?2:3,tq:rd()<.5?1:2,bois:ch(['clair','sombre','rouge'],[2,1,1])};
  D.r66={station:rd()<.8,sc:rd()<.5?-1:1,ss:Math.round(330+rd()*240),panneau:rd()<.85,pc:rd()<.5?-1:1,motel:rd()<.5,carcasses:ch([0,1,2,4],[1.2,1.5,1.2,.8]),cactus:ch([0,14,32],[1,1.6,1.4]),pubs:ch([0,1,2],[1.2,1.5,.9])};
  return D;}
/* ---- LE MONDE : appelé en fin de buildTrack (no-op hors du canyon) ---- */
function cyEteindre(){CY.on=false;if(CY.mesh)CY.mesh.visible=false;if(CY.grp)CY.grp.visible=false;}
/* ===== LE CANYON QU'ON QUITTE (2026-11-03, passe « maps cohérentes » — Sacha : « qu'elles soient toutes cohérentes et optimisées ») =====
   cyEteindre CACHAIT le relief et ses pièces sans rien rendre : passé le portail, la map suivante gardait en mémoire de la puce les quatre textures de
   données du canyon (la taille fine en RG32F et sa marque, le plateau en RGBA flottant, l'ombre de l'heure : plusieurs Mo) et toutes ses géométries
   cuites (parois des Étroits, galerie et façade du tunnel, mine, arche, route 66, éboulis) avec les tampons d'instances (peupliers, cheminées).
   Hors du canyon on les rend : le prochain canyon les refait de toute façon (cyMondePose, cyMonuments). Restent : la matière et ses programmes
   (compilés au menu), les bruits partagés (CY.tNz, CY.tRnd — les dunes s'en servent), la colonne des strates, les géométries partagées (peuplier,
   cheminée, bloc) et le monde côté processeur (petit, et relu par le canyon d'avance). */
function cyLiberer(){if(CY.on||!CY.mat)return;const U=CY.mat.uniforms,z9=CY.z1;let n=0;
  for(const k of ['tC','tM','tZ','tS'])if(CY[k]){CY[k].dispose();CY[k]=null;n++;}
  if(z9){U.uTC.value=z9;U.uTZ.value=z9;U.uTS.value=z9;U.uTM.value=CY.tRnd;}
  if(CY.grp)for(const o of CY.grp.children.slice()){CY.grp.remove(o);n++;if(instSegJette(o))continue; /* (2026-11-10) voir LES SEGMENTS SE LIBÈRENT */if(o.geometry&&o.userData.jeter)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();}
  CY.couT=CY.tunT=CY.mineT=CY.vouT=null;CY.monu=false;CY.libere=n;}
/* LA CONSTRUCTION EN DEUX TEMPS (2026-10-14, CANYON) — MESURÉ (banc processeur, piste de 19 km au palier 0) : ~0,65 s de calcul (le
   plateau ~0,16, la taille fine ~0,28, l'ombre ~0,06…), 1,1 s pour la piste de 40 km de fin de partie — au portail, c'était un GEL (la
   règle d'OPTIMISATION : ≤ 250 ms). Désormais : les échantillons de la route ici (~20 ms), le MONDE (plateau, taille, ombre, monuments)
   dans un TRAVAILLEUR à part (`cyTravailleur` : les mêmes fonctions, recopiées par leur source — la collision et la puce lisent les MÊMES
   données), puis `cyMondePose` (textures, maillages) quand il répond. En course, le relief apparaît ~0,6 s après le portail, pendant le
   fondu sombre ; hors course (sous le voile du JOUER, au banc) ou sans travailleur, le calcul se fait tout de suite, ici. */
/* ===== LE CANYON D'AVANCE (2026-10-23, session PERF — Sacha : « quand tu arrives dans une nouvelle map, des fois il y a du temps à apparaître,
   et du coup tu peux mourir sans voir des obstacles arriver ») =====
   Depuis le portail de cubes (17/10) il n'y a plus de fondu sombre au passage : le monde bascule d'un coup (bioPortDur 0,05 s). Le relief du
   canyon, lui, partait au travailleur APRÈS le passage — on roulait 0,6 à 1,1 s (plus sur téléphone, plus en fin de partie) sur une route SANS
   parois ni collision (canyonHeurt rend '' tant que CY.on est faux), puis toute la roche surgissait d'un bloc, parfois autour d'une caisse en vol.
   Désormais le pré-bâti (prebJob) calcule les échantillons d'avance, par tranches (cyBatitG), et envoie le monde au travailleur pendant qu'on
   roule vers le portail (cyAvPart) ; au passage, cyAvPrend le reprend et le POSE dans la construction même, sous l'image du portail. Le
   travailleur pas encore revenu : il est attendu comme avant. Même graine, même palier, même piste : le même canyon au bit près (cyCle).
   `?cyw=0` : sans travailleur (rien d'avance, comme avant) · `dbgCanyon().ms.avance` : 'pret' (posé au passage) ou 'en vol'. */
function buildCanyon(seed){if(cyAvPrend(seed))return;const g=cyBatitG(seed,null);while(!g.next().done);}
function cyCle(seed){return [seed,L,NP,lvPiste(),ROAD_HALF,(LVL.cur&&LVL.cur.bio&&LVL.cur.bio[0])||'',PAL.n,CY_DECO.on?1:0].join('|');} // ce dont le monde du canyon dépend
function cyAvPart(seed,C,S,opt){ // (le pré-bâti) le monde part au travailleur ; sa réponse attend dans CY.av
  const W=/[?&]cyw=0\b/.test(location.search)?null:cyTravailleur();if(!W)return;
  const job=-(CY.jav=(CY.jav||0)+1); // (négatif : jamais un numéro de construction)
  CY.av={cle:cyCle(seed),job:job,C:C,S:S,opt:opt,R:null,t0:performance.now(),ms:0};
  try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz,rnd:CY.rnd});}catch(e){console.warn('canyon : travailleur',e);CY.av=null;}}
function cyAvPrend(seed){ // (buildCanyon, au passage) le monde calculé d'avance, si c'est cette piste-ci
  const A=CY.av;if(!A)return false;CY.av=null;
  if(A.cle!==cyCle(seed)||PARK.on||!LVL.cur||LVL.cur.piste!=='canyon'||!CANYON_OK)return false;
  cyEteindre();CY.job=(CY.job||0)+1;
  Object.assign(CY,A.C);CY.t0=performance.now();CY.ms.avance=A.R?'pret':'en vol';CY.ms.avMs=A.ms;if(A.C.deco)cyStratesTeinte(A.C.deco.strates);
  if(A.R)cyMondePose(A.R);else CY.attente={job:A.job,pour:CY.job,S:A.S,opt:A.opt};
  return true;}
function* cyBatitG(seed,av){ // av : (le pré-bâti) le travail de la route d'en face — rien n'est écrit dans CY, le monde part au travailleur
  if(!av){cyEteindre();CY.job=(CY.job||0)+1;}
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='canyon'||!(NP>1)||!CANYON_OK){if(!av)cyLiberer();return;} /* (2026-11-03) hors du canyon : sa mémoire rendue */
  const t0=performance.now(),LV=lvPiste(),K=Math.sqrt(LV),r=mulberry32((seed^0xCA4F0A)>>>0);
  cyBruits();cyTerrain();
  const C={},D9=CY_DECO.on?cyTirage(seed):null;C.deco=D9;if(CY_V3.on&&D9&&CY.hz&&CY.hz.p&&CY.hz.p.some(function(p){return p[0]==='riviere';})&&D9.riviere==='asec'){D9.riviere='basse';D9.eau=.45;} /* (V3) la pièce « rivière » a toujours de l'eau (MESURÉ, graine 9 : un lit à sec sous la route) */if(D9&&!av)cyStratesTeinte(D9.strates); // (2026-10-20) LE DÉCOR TIRÉ : la palette des strates d'abord (le tunnel la relit) — d'avance : au passage (cyAvPrend)
  // ---- 1. LES ÉCHANTILLONS : la route tous les 8 m ----
  const DS=8,NS=Math.max(3,Math.floor(L/DS)+1),st9=L/(NP-1),A=n=>new Float32Array(n);
  const S={n:NS,ds:DS,x:A(NS),z:A(NS),y:A(NS),tx:A(NS),tz:A(NS),wF:A(NS),wW:A(NS),wR:A(NS),H:A(NS),D:A(NS),F:A(NS),R:A(NS),V:A(NS),zS:A(NS),zA:A(NS),zH:A(NS),as:A(NS),aw:A(NS),fo:A(NS),st:A(NS),RE:A(NS),zL:A(NS),co:A(NS),of:A(NS)}; /* (LA REFONTE) zL : le gabarit large (0 → 1 : le serrage des parois s'efface) · co : la corniche (−1 → 1 : le côté du vide) · of : l'écart de l'axe de la vallée (m, + à droite) */
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=0;i<NS;i++){const s9=Math.min(L,i*DS),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k,a=pts[k],b=pts[k+1];
    S.x[i]=a.x+(b.x-a.x)*u;S.y[i]=a.y+(b.y-a.y)*u;S.z[i]=a.z+(b.z-a.z)*u;const tx=b.x-a.x,tz=b.z-a.z,tl=Math.hypot(tx,tz)||1;S.tx[i]=tx/tl;S.tz[i]=tz/tl;
    if(S.x[i]<x0)x0=S.x[i];if(S.x[i]>x1)x1=S.x[i];if(S.z[i]<z0)z0=S.z[i];if(S.z[i]>z1)z1=S.z[i];}
  S.bb=[x0,x1,z0,z1];S.mu=null;if(CY_MUR.on&&TORD.murs&&Nn&&Nn.length>=NP)cyMurEchantillons(S,st9); // (LE CANYON SUR LES MURS) la dalle de chaque échantillon
  yield; // (le pré-bâti : une tranche par étape)
  // ---- 2. LES SECTIONS (repères de genCanyon → leur abscisse) et le profil de chaque tronçon, fondu d'une clé à l'autre ----
  const sQ={};if(CY.Q)for(const k in CY.Q){const p=CY.Q[k].p;let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}sQ[k]=bi*DS;}
  const KEYS=[],q=k=>sQ[k]!=null?sQ[k]:null,key=(s9,o)=>{if(s9!=null&&isFinite(s9))KEYS.push([Math.max(0,Math.min(L,s9)),o]);};
  const B0={wF:140,H:0,st:.4,V:1,D:78,zS:0,zA:0,zH:0,aw:30,zL:CY_V3.on?CY_V3.zL0:0,co:0}, /* (V3) zL0 : la gorge par défaut est MI-OUVERTE (le pied des parois à ~60 m de l'axe au lieu de 33) */G=o=>Object.assign({},B0,{V:0},o);
  key(0,B0);key(q('breche0'),B0);
  {const a=q('breche0'),b=q('breche1');if(a!=null&&b!=null)key(a+(b-a)*.55,G({wF:150,H:280,st:.34,V:.35,D:96}));}
  key(q('breche1'),G({wF:118,H:460,st:.30,V:.12,D:110}));key(q('bosses'),G({wF:112,H:640,st:.30,V:.06}));
  key(q('fer0'),G({wF:130,H:700,st:.28}));key(q('fer1'),G({wF:128,H:760,st:.28}));
  {const e0=q('etroit0'),e1=q('etroit1');if(e0!=null){key(e0-280,G({wF:108,H:640,st:.30}));key(e0,G({wF:46,H:420,st:.07,D:74,zS:1,aw:8}));}
   if(e1!=null){key(e1,G({wF:46,H:420,st:.07,D:74,zS:1,aw:8}));key(e1+220,G({wF:104,H:600,st:.26}));}}
  {const m0=q('mur0'),m2=q('mur2');if(m0!=null&&m2!=null){key(m0,G({wF:130,H:700,st:.28}));key(m2,G({wF:130,H:760,st:.28}));}} // (LE CANYON SUR LES MURS) la gorge s'élargit autour du grand virage
  key(q('arche0'),G({wF:98,H:620,st:.22,zA:1}));key(q('arche1'),G({wF:98,H:620,st:.22,zA:1}));
  {const a0=q('amphi0'),a1=q('amphi1');if(a0!=null){key(a0-170,G({wF:118,H:600,st:.30}));key(a0+140,G({wF:235,H:560,st:.92,V:.30,zH:1,aw:60}));}
   if(a1!=null){key(a1,G({wF:235,H:560,st:.92,V:.30,zH:1,aw:60}));key(a1+260,G({wF:124,H:820,st:.32,V:.08}));}}
  key(q('chameau'),G({wF:136,H:940,st:.32}));key(q('finale0'),G({wF:132,H:1050,st:.30}));key(L,G({wF:140,H:1150,st:.30}));
  KEYS.sort(function(a,b){return a[0]-b[0];});
  /* (2026-11-12, LA REFONTE DU CANYON) LES GABARITS DÉCLARÉS (`CY.gab`, posés par les pièces et les liaisons de genCanyon) → des clés de profil. Chaque gabarit ne dit que ce qu'il CHANGE :
     le reste (la hauteur des parois, qui grandit le long de la route…) est le profil de base à cet endroit. Deux gabarits qui se suivent de près se fondent l'un dans l'autre, sans
     revenir à la gorge serrée entre les deux (la traversée : d'une corniche à celle d'en face). Les fondus sont COURTS à l'entrée d'une corniche (70 m : « bam, la gorge s'ouvre »).
       fente    : la fente des étroits (le goulot de la grande gorge) · ouvert : le pied des parois à ~70 m de l'axe · large : à 150 m · vallée : à 170 m, la rivière 16 à 38 m sous la dalle
       corniche : la vallée fait 420 m de large et son AXE est décalé de la route du côté `sg` (S.co → S.of, plus bas) : la route colle la falaise d'en face ; la rivière est profonde
                  à l'entrée (150 m au moins, et de quoi laisser la route descendre vers elle : la rivière ne remonte jamais) */
  C.vou=null;
  if(CY_REF.on&&CY.gab&&CY.gab.length){
    const sDe=p=>{let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}return bi*DS;},yDe=s9=>S.y[Math.max(0,Math.min(NS-1,Math.round(s9/DS)))],
      base=s9=>{let k=0;while(k<KEYS.length-2&&KEYS[k+1][0]<s9)k++;const a=KEYS[k],b=KEYS[Math.min(KEYS.length-1,k+1)];let u=b[0]>a[0]?(s9-a[0])/(b[0]-a[0]):1;u=Math.max(0,Math.min(1,u));u=u*u*u*(u*(u*6-15)+10);const o={};for(const f in B0)o[f]=a[1][f]+(b[1][f]-a[1][f])*u;return o;},
      GP={fente:{tin:150,tout:60},corniche:{tin:70,tout:190},vallee:{tin:200,tout:60},large:{tin:60,tout:160},ouvert:{tin:110,tout:110},tonneau:{tin:90,tout:90},serre:{tin:80,tout:80},boucle:{tin:140,tout:140},pont:{tin:50,tout:50},tube:{tin:60,tout:60},chute:{tin:40,tout:220}},
      ZA=CY.gab.map(function(g){return {t:g.t,sg:g.sg||0,v:g.v||null,a:sDe(g.p0),b:sDe(g.p1)};}), /* (V3) TOUS les gabarits avec leurs abscisses (le plan des rochers en lit aussi les pièces : aiguille, porte, galerie) */
      Z=ZA.filter(function(z){return GP[z.t]&&z.b>z.a+2*DS;}).map(function(z){return Object.assign({},z);}).sort(function(x,y){return x.a-y.a;}),add=[];
    for(let k=0;k<Z.length;k++){const z=Z[k];z.in=z.out=true;if(k){const p=Z[k-1];if(z.a-GP[z.t].tin<p.b+GP[p.t].tout){z.in=false;p.out=false;}}}
    const prof=(z,s9)=>{const o=base(s9);
      if(z.t==='fente')return Object.assign(o,{wF:46,H:Math.min(o.H||420,460),st:.07,zS:1,aw:8,V:0,zL:0,co:0,zA:0,zH:0});
      if(z.t==='corniche')return Object.assign(o,{wF:210,st:.34,zL:1,co:z.sg,aw:5,V:.3,zS:0,zA:0,zH:0,D:Math.max(150,base(z.b).D+.9*Math.max(0,yDe(s9)-yDe(z.b)))});
      if(z.t==='vallee')return Object.assign(o,{wF:170,st:.5,zL:1,co:0,D:(22*K+16)/Math.pow(LV,.2),aw:40,V:.2,zS:0,zA:0,zH:0}); /* la rivière sous la dalle : le lit descend par MARCHES de 22 × K m (les cascades, étape 3) — entre deux marches il reste jusqu'à 22 × K m au-dessus de « la route moins D ». MESURÉ en jeu (graine 9) : à D = 16 m le lit et ses berges passaient AU-DESSUS de la route (règle d'or : 25 points dessus, 136 dessous). D = une marche + 16 m (S.D = D × LV^0,2) : la dalle est de 16 à 16 + 22 × K m au-dessus du lit */
      if(z.t==='large')return Object.assign(o,{wF:150,st:.4,zL:1,co:0,aw:30,zS:0,zA:0,zH:0});
      if(z.t==='tonneau')return Object.assign(o,{wF:170,st:.45,zL:1,co:0,D:Math.max(120,o.D||0),aw:20,V:.15,zS:0,zA:0,zH:0});
      if(z.t==='chute')return Object.assign(o,{wF:330,st:.55,zL:1,co:0,D:Math.max(260,o.D||0),aw:40,V:.3,zS:0,zA:0,zH:0}); /* (V3) LA GRANDE CHUTE : la gorge s'ouvre d'un coup (40 m de fondu) sur un amphithéâtre de 660 m, la rivière 260 m plus bas */
      if(z.t==='tube')return Object.assign(o,{wF:CY_V3.tubeR+2,st:.06,zL:1,co:0,D:Math.max(CY_V3.tubeR+8,o.D||0),aw:6,V:0,zS:0,zA:0,zH:0}); /* (V3) LE TUNNEL DE LA PHRASE : les parois SERRENT le tube (juste au-delà de son creux qui tourne : ~67 m de l'axe) — la voûte d'avant flottait au milieu d'une gorge ouverte à 170 m */
      if(z.t==='serre')return Object.assign(o,{zL:0,co:0}); /* (V3) le couloir des passages techniques : les parois collées d'avant */
      if(z.t==='boucle')return Object.assign(o,{wF:300,st:.5,zL:1,co:0,D:Math.max(200,o.D||0),aw:12,V:.25,zS:0,zA:0,zH:0}); /* (V3) LA BOUCLE DE LA BUTTE : un cirque de 600 m, la rivière 200 m sous le balcon */
      if(z.t==='pont')return Object.assign(o,{wF:200,st:.42,zL:1,co:0,D:Math.max(190,o.D||0),aw:10,zS:0,zA:0,zH:0}); /* (V3) LE PONT NATUREL : une gorge large et profonde sous la traversée */ /* (LA VOÛTE) la gorge s'ouvre autour du tube : 170 m de l'axe, la rivière 120 m au moins sous la dalle (la section du tube fait ~70 m de rayon) */
      return Object.assign(o,{wF:Math.max(o.wF,95),zL:.6,co:0,zS:0});};
    for(const z of Z){const P=GP[z.t];if(z.in)add.push([Math.max(0,z.a-P.tin),base(z.a-P.tin)]);add.push([z.a,prof(z,z.a)],[z.b,prof(z,z.b)]);if(z.out)add.push([Math.min(L,z.b+P.tout),base(z.b+P.tout)]);}
    for(let k=KEYS.length-1;k>=0;k--){const s9=KEYS[k][0];if(Z.some(function(z){return s9>z.a&&s9<z.b;}))KEYS.splice(k,1);} /* une clé de base tombée DANS un gabarit s'efface : le gabarit commande */
    for(const a of add)KEYS.push(a);KEYS.sort(function(a,b){return a[0]-b[0];});C.gabZ=Z;C.gabA=ZA;
    const ZT=Z.filter(function(z){return z.t==='tonneau'||z.t==='tube';});if(ZT.length){C.vou=ZT.map(function(z){return [z.a,z.b];}); /* LA VOÛTE, LES TUNNELS DES PHRASES : chaque tube se cuit entre ses deux abscisses (cyVoute) */
      for(const zt of ZT)if(S.mu)for(let i=Math.max(0,Math.floor(zt.a/DS)-2);i<=Math.min(NS-1,Math.ceil(zt.b/DS)+2);i++)S.mu[i]=0;} /* le plan de roche des murs ne sait pas faire un dessous : coupé dans la voûte (le roulis y est de 0 à 360°) */
  }
  C.sQ=sQ;yield;
  const ph=[r()*6.28,r()*6.28,r()*6.28,r()*6.28,r()*6.28],K6=Math.pow(LV,.3),K4=Math.pow(LV,.2);let kk=0;
  // LA GARDE DES RACCOURCIS (2026-10-15) : l'approche, le 1er demi-tour et la sortie de chaque boucle gardent les parois d'avant — serrées là,
  // une arête de roche monterait entre la zone de saut et la sortie, 94 m plus loin, et le raccourci deviendrait un mur. Fondu sur 120 m.
  const GD=new Float32Array(NS);
  for(const k0 in sQ){const m=/^(rac[A-Z])0$/.exec(k0);if(!m)continue;const nm=m[1],iv=[[sQ[nm+'0']-60,sQ[nm+'1']+450],[sQ[nm+'2']-60,sQ[nm+'3']+60]];
    for(const v9 of iv){if(!isFinite(v9[0])||!isFinite(v9[1]))continue;const i0=Math.max(0,Math.floor((v9[0]-120)/DS)),i1=Math.min(NS-1,Math.ceil((v9[1]+120)/DS));
      for(let i=i0;i<=i1;i++){const s9=i*DS,d=s9<v9[0]?v9[0]-s9:s9>v9[1]?s9-v9[1]:0,g=Math.max(0,1-d/120);if(g>GD[i])GD[i]=g;}}}
  for(let i=0;i<NS;i++){const s9=i*DS;while(kk<KEYS.length-2&&KEYS[kk+1][0]<s9)kk++;const a=KEYS[kk],b=KEYS[Math.min(KEYS.length-1,kk+1)];
    let u=b[0]>a[0]?(s9-a[0])/(b[0]-a[0]):1;u=Math.max(0,Math.min(1,u));u=u*u*u*(u*(u*6-15)+10);const v=f=>a[1][f]+(b[1][f]-a[1][f])*u;
    const zS=v('zS'),zA=v('zA'),zH=v('zH'),zL=v('zL'),co9=v('co');S.zS[i]=zS;S.zA[i]=zA;S.zH[i]=zH;S.zL[i]=zL;S.co[i]=co9;S.V[i]=v('V');S.st[i]=v('st');S.aw[i]=v('aw')*K;
    S.wF[i]=(v('wF')*(1-zS)*K+v('wF')*zS*(1+.45*(K-1)))*(1+(.16*Math.sin(s9/530+ph[0])+.08*Math.sin(s9/173+ph[1]))*(1-zS));
    S.H[i]=v('H')*K6*(1+.12*Math.sin(s9/910+ph[2]));S.D[i]=v('D')*K4;S.as[i]=.24*Math.sin(s9/760+ph[3])*(1-zS)*(1-.5*zA);
    let kS=0;
    {kS=(1-zS)*(1-GD[i])*(1-zH)*(1-zL); /* (LA REFONTE) × (1 − zL) : dans un gabarit large, aucun serrage — ni le 2e (kS) ni le 1er (k9) */ // (2026-10-15, 2e serrage, Sacha : « encore plus proche de la route ») hors Étroits, raccourcis et amphithéâtre : pied à 24 m, excès gardé à 6 %, parois DEUX fois plus raides
      const b9=CY_SERRE.pied+(CY_SERRE.pied2-CY_SERRE.pied)*kS,ex=Math.max(0,S.wF[i]-b9)*(CY_SERRE.k+(CY_SERRE.k2-CY_SERRE.k)*kS)/Math.sqrt(K); // (2026-10-15, Sacha : « les parois doivent être plus proches encore de la route ») LE CANYON SERRÉ : le pied des parois à 30 m de l'axe (2 m du bord), seul l'EXCÈS se garde au quart — et il ne gonfle plus avec le palier (les rayons, eux, si)
      const k9=(1-zS)*(1-zL);S.as[i]*=1-k9+k9*ex/Math.max(1,b9+ex);if(co9)S.as[i]*=1-Math.abs(co9); /* (la corniche n'a pas d'asymétrie en plus : son axe est déjà décalé) */S.wF[i]+=(b9+ex-S.wF[i])*k9;S.aw[i]*=1-.7*k9-.15*kS;} // les ÉTROITS (zS) gardent leur fente : elle ondule de ±8 m et monte à pic, son couloir a déjà ses murs collés // les alcôves (le bruit qui recule la roche) : 9 m au lieu de 30
    S.wR[i]=Math.min(S.wF[i]-5,(16+9*Math.sin(s9/310+ph[4]))*K*(1-zS)+(S.wF[i]-5)*zS);S.wW[i]=Math.max(10,S.H[i]*S.st[i]*(1-(1-CY_SERRE.raide)*kS));} // (raide : la paroi atteint la hauteur de la route ~8 m après le bord au lieu de ~30)
  if(S.mu)for(let i=0;i<NS;i++){const m9=S.mu[i];if(m9>.002){S.wF[i]+=(Math.max(S.wF[i],CY_MUR.larg)-S.wF[i])*m9;S.as[i]*=1-m9;S.aw[i]*=1-.7*m9;}} // (LE CANYON SUR LES MURS) le pied des parois à 235 m : la vallée s'élargit, la route longe la falaise
  yield;
  if(TUN2_ON){const a=L-CY_TUN2.ev0-60,b=L-CY_TUN2.ev1; /* (2026-10-19) LE TUNNEL DE GRÈS : la roche s'écarte de la SALLE DU PORTAIL (le dôme fait 78 m de large) — le pied des parois à 106 m de l'axe, sans asymétrie ni alcôve, sur 140 m de fondu (rien ne la traverse : dbgTunnel('test')) */
    for(let i=Math.max(0,Math.floor(a/DS));i<NS;i++){let u=(i*DS-a)/(b-a);u=u<0?0:u>1?1:u;u=u*u*(3-2*u);if(u<=0)continue;S.wF[i]+=(Math.max(S.wF[i],CY_TUN2.A+28)-S.wF[i])*u;S.as[i]*=1-u;S.aw[i]*=1-u;}}
  // ---- 3. LA RIVIÈRE : jamais plus haut qu'en amont, en vasques et en cascades ----
  {let mn=1e9,Lp=null,p0=0;const stepH=22*K;
   for(let i=0;i<NS;i++){mn=Math.min(mn,S.y[i]-S.D[i]);
     if(Lp===null||mn<Lp-stepH||(i-p0>Math.round(420/DS)&&mn<Lp-2)){if(Lp!==null&&Lp-mn>3){for(let k=Math.max(0,i-1);k<Math.min(NS,i+4);k++)S.fo[k]=1;}Lp=mn;p0=i;} // une CASCADE : l'écume au pied
     S.F[i]=Lp;}}
  // le PLATEAU voulu (le haut des parois), lissé sur ±300 m ; la PORTÉE de chaque échantillon (jusqu'où il creuse)
  {const w=Math.round(300/DS),c=new Float64Array(NS+1);for(let i=0;i<NS;i++)c[i+1]=c[i]+S.F[i]+S.H[i];
   for(let i=0;i<NS;i++){const a=Math.max(0,i-w),b=Math.min(NS,i+w+1);S.R[i]=(c[b]-c[a])/(b-a);}}
  /* (LA REFONTE) LA CORNICHE : l'écart de l'axe de la vallée (S.of, + = à droite). La paroi du côté de la falaise doit passer à la hauteur de la route à `ROAD_HALF + 7 m + la morsure des
     alcôves` de l'axe de la route : on inverse le profil de la paroi (cyProfil : Fl + H × gor(t), puis 2,4 m par m) à la hauteur de la route au-dessus du lit (+ 12 m de garde) — l'axe de la
     vallée se met à cette distance-là, moins la garde. Sous la dalle la roche reste loin dessous (la paroi tombe à ~75° : 20 m et plus sous le bord). */
  if(CY_REF.on){const gor=function(t){return .5*Math.pow(t,.75)+.5*(1-Math.pow(1-t,1.8));};
    for(let i=0;i<NS;i++){const c=S.co[i];if(Math.abs(c)<.002){S.of[i]=0;continue;}
      const hv=(S.y[i]-S.F[i]+12)/Math.max(1,S.H[i]);let tt;if(hv>=1)tt=1+(hv-1)*S.H[i]/(2.4*S.wW[i]);else{let a=0,b=1;for(let k=0;k<22;k++){const m=(a+b)/2;if(gor(m)<hv)a=m;else b=m;}tt=(a+b)/2;}
      S.of[i]=c*Math.max(0,S.wF[i]+tt*S.wW[i]-(ROAD_HALF+7+1.3*S.aw[i]));}}
  let reach=0;for(let i=0;i<NS;i++){S.RE[i]=S.wF[i]*(1+Math.abs(S.as[i]))+S.wW[i]+160*K+S.aw[i]+Math.abs(S.of[i]);if(S.RE[i]>reach)reach=S.RE[i];}S.reach=reach;
  /* (LE CANYON V3) les rochers et les ouvrages de CE canyon (cyV3Plan) — la taille fine s'étend jusqu'au plus lointain d'entre eux */
  const P3=cyV3Plan(S,C.gabA||[],sQ,K,seed);C.rel=P3.rel;C.toits=P3.toits;C.v3n=P3.n;if(P3.ext+40>S.reach)S.reach=P3.ext+40;
  C.rac=[];for(const nm of Object.keys(sQ).filter(function(k){return /^rac[A-Z]0$/.test(k);}).map(function(k){return k.slice(0,4);}).sort()){const a0=sQ[nm+'0'],a1=sQ[nm+'1'],b0=sQ[nm+'2'],b1=sQ[nm+'3'];if(a0==null||a1==null||b0==null||b1==null)continue;
    const o={nm:nm,haut:[a0,a1],bas:[b0,b1],gain:Math.round(b0-a1),dh:1e9,lat:0,ecart:[]};
    for(let s9=a0;s9<=a1;s9+=40){const i=Math.min(NS-1,Math.round(s9/DS));let bj=-1,bd=1e18;for(let j=Math.round(b0/DS);j<=Math.min(NS-1,Math.round(b1/DS));j++){const d=(S.x[j]-S.x[i])**2+(S.z[j]-S.z[i])**2;if(d<bd){bd=d;bj=j;}}
      if(bj<0)continue;const lat=Math.sqrt(bd),dh=S.y[i]-S.y[bj];o.ecart.push([Math.round(s9),Math.round(lat),Math.round(dh)]);if(lat<120&&dh<o.dh){o.dh=Math.round(dh);o.lat=Math.round(lat);o.cote=Math.sign((S.x[bj]-S.x[i])*-S.tz[i]+(S.z[bj]-S.z[i])*S.tx[i]);}}
    C.rac.push(o);}
  C.cou=(sQ.etroit0!=null&&sQ.etroit1!=null)?[sQ.etroit0,sQ.etroit1]:null;C.couT=null;
  C.mine=(sQ.mine0!=null&&sQ.mine1!=null&&sQ.mine1-sQ.mine0>200)?[sQ.mine0,sQ.mine1]:null;C.mineT=null; // LA MINE abandonnée (cyMine)
  if(D9&&!D9.mine.la)C.mine=null; // (2026-10-20) le tirage : parfois la mine n'a jamais été creusée (les deux grandes courbes restent, à ciel ouvert)
  C.tun=[Math.max(0,L-CY_TUN.l),L+60];C.tunT=null; // LE TUNNEL d'arrivée : ses derniers mètres de route (et un peu au-delà du bout)
  C.S=S;C.ms={ech:Math.round(performance.now()-t0)};
  const bio9=BIOMES[(LVL.cur.bio&&LVL.cur.bio[0])||'canyonSoir']||BIOMES.canyonSoir,cA=bio9.cyA||[6,-110,0,0];
  const opt={K:K,seed:seed,L:L,RH:ROAD_HALF,TH:THICK,rel:P3.rel,lev:P3.lev,sQ:sQ,sun:[cA[0],cA[1]],deco:D9,pal:{cyPlat:PAL.b('cyPlat',64),cyFin:PAL.b('cyFin',12),cyOmbre:PAL.b('cyOmbre',27),cyChem:PAL.b('cyChem',300)}};
  C.t0=t0;C.seed=seed; /* (2026-11-07) la graine de la piste : les monuments et la mine en tirent leur hasard (plus le numéro de construction) */
  if(av){cyAvPart(seed,C,S,opt);return;} // (LE CANYON D'AVANCE) rien n'est écrit dans CY : le passage reprendra tout (cyAvPrend)
  Object.assign(CY,C);
  const W=started&&!/[?&]cyw=0\b/.test(location.search)?cyTravailleur():null;
  if(W){const job=CY.job;CY.attente={job:job,pour:job,S:S,opt:opt};try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz,rnd:CY.rnd});return;}catch(e){console.warn('canyon : travailleur',e);CY.attente=null;}}
  cyMondePose(cyMondeCalc(S,opt));
}
/* le travailleur : les fonctions du MONDE recopiées par leur source (une seule écriture : elles servent aussi ici, à la collision) */
function cyTravailleur(){if(CY.w!==undefined)return CY.w;
  try{const fns=[mulberry32,cyNz,cyBil,cyButteDe,cyButtesH,cyHauteur,cyHauteurVite,cyProfil,cyOmbre,cyMitaines,cyMonuPrevoir,cyReliefs,cyMondeCalc].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var CY={},CY_O9={},L=0,ROAD_HALF=28,PAL={B:{},b:function(k,d){return PAL.B[k]!=null?PAL.B[k]:d;}};\n"+fns+
      "\nonmessage=function(e){var m=e.data;CY={nz:m.nz,rnd:m.rnd};PAL.B=m.opt.pal;L=m.opt.L;ROAD_HALF=m.opt.RH;var R=cyMondeCalc(m.S,m.opt);R.job=m.job;"+
      "postMessage(R,[R.Z.d.buffer,R.F.c.buffer,R.F.m.buffer,R.O.h.buffer,R.qw.d.buffer,R.bg.i.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const R=e.data;
      if(CY.av&&R.job===CY.av.job){CY.av.R=R;CY.av.ms=Math.round(performance.now()-CY.av.t0);return;} // (LE CANYON D'AVANCE) le monde d'en face attend le passage
      const A=CY.attente;if(!A||R.job!==A.job||A.pour!==CY.job)return;CY.attente=null;try{cyMondePose(R);}catch(er){console.warn('canyon : pose',er);}};
    W.onerror=function(e){console.warn('canyon : travailleur en erreur',e.message);CY.w=null;CY.av=null;const a=CY.attente;CY.attente=null;if(a&&a.pour===CY.job)try{cyMondePose(cyMondeCalc(a.S,a.opt));}catch(er){console.warn('canyon',er);}};
    CY.w=W;}catch(e){CY.w=null;}
  return CY.w;}
/* LE MONDE (ici ou dans le travailleur) : n'utilise que CY.nz, CY.rnd, ses arguments et les fonctions recopiées — rend tout ce que la pose
   et la collision lisent */
function cyMondeCalc(S,opt){
  const K=opt.K,sQ=opt.sQ,NS=S.n,DS=S.ds,x0=S.bb[0],x1=S.bb[1],z0=S.bb[2],z1=S.bb[3],reach=S.reach,RE=S.RE,ms={},r=mulberry32((opt.seed^0x51ED7A)>>>0);
  // ---- 4. LE PLATEAU (grossier, jusqu'à 7,5 km) : la marche de l'escalier, le fond (pour la brume et l'ombre du ciel), la densité de buttes, la roche des escarpements ----
  const t1=performance.now(),TZ=PAL.b('cyPlat',64),MZ=7500,STP=250*Math.sqrt(K);
  const Z={ts:TZ,x0:x0-MZ,z0:z0-MZ},znx=Math.ceil((x1-x0+2*MZ)/TZ)+1,znz=Math.ceil((z1-z0+2*MZ)/TZ)+1;Z.nx=znx;Z.nz=znz;
  const zi=new Int32Array(znx*znz).fill(-1),zd=new Float32Array(znx*znz).fill(1e18),RZ=1500;
  for(let i=0;i<NS;i+=6){const cx=(S.x[i]-Z.x0)/TZ,cz=(S.z[i]-Z.z0)/TZ,rr=Math.ceil(RZ/TZ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(znz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(znx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,d2=(ex*ex+ez*ez)*TZ*TZ;if(d2>RZ*RZ)continue;const o=jz*znx+jx;if(d2<zd[o]){zd[o]=d2;zi[o]=i;}}}
  for(let o=0;o<zd.length;o++)if(zi[o]>=0)zd[o]=Math.sqrt(zd[o]);
  {let X9=0,Z9=0;const pr=(o,o2)=>{const i=zi[o2];if(i<0||i===zi[o])return;const ex=X9-S.x[i],ez=Z9-S.z[i],d=ex*ex+ez*ez;if(d<zd[o]*zd[o]){zd[o]=Math.sqrt(d);zi[o]=i;}}; // le plus proche, propagé à tout le plateau (deux passes)
   for(let jz=0;jz<znz;jz++){Z9=Z.z0+jz*TZ;for(let jx=0;jx<znx;jx++){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx>0)pr(o,o-1);if(jz>0){pr(o,o-znx);if(jx>0)pr(o,o-znx-1);if(jx<znx-1)pr(o,o-znx+1);}}}
   for(let jz=znz-1;jz>=0;jz--){Z9=Z.z0+jz*TZ;for(let jx=znx-1;jx>=0;jx--){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx<znx-1)pr(o,o+1);if(jz<znz-1){pr(o,o+znx);if(jx<znx-1)pr(o,o+znx+1);if(jx>0)pr(o,o+znx-1);}}}}
  const zdat=new Float32Array(znx*znz*4),rq=new Float32Array(znx*znz);
  let yMax=-1e9;
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=jz*znx+jx,i=Math.max(0,zi[o]),x=Z.x0+jx*TZ,z=Z.z0+jz*TZ,d=zd[o];
    const hp=S.R[i]-S.F[i],wq=hp<150?0:hp>420?1:(hp-150)/270,Rd=S.R[i]+(150*(cyNz(x/5200,z/5200,0)-.5)+60*(cyNz(x/1700,z/1700,1)-.5))*wq,u=(Rd+STP*.5)/STP,fu=u-Math.floor(u),e=fu<.86?0:(fu-.86)/.14;
    rq[o]=Math.max(S.F[i]+4,Rd+((Math.floor(u)+e*e*(3-2*e))*STP-Rd)*wq); // L'ESCALIER : une marche tous les ~250 m (l'escarpement dans les derniers 14 %), seulement là où les parois sont hautes — la vallée reste plate, le plateau jamais sous la rivière
    zdat[o*4]=rq[o];zdat[o*4+1]=S.F[i]; // (l'ondulation du plateau, ±16 m et ±6 m, est ajoutée au SOMMET et dans cyHauteur : deux lectures de bruit de moins par case)
    zdat[o*4+2]=(S.V[i]*(d>650*K?1:d<330*K?0:(d-330*K)/(320*K))+.07*(d>2400?1:d<1200?0:(d-1200)/1200))*(opt.deco?opt.deco.buttes:1);if(zdat[o*4]>yMax)yMax=zdat[o*4];} // (2026-10-20) × la densité de buttes tirée
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=jz*znx+jx,gx=(rq[jz*znx+Math.min(znx-1,jx+1)]-rq[jz*znx+Math.max(0,jx-1)])/(2*TZ),gz=(rq[Math.min(znz-1,jz+1)*znx+jx]-rq[Math.max(0,jz-1)*znx+jx])/(2*TZ);
    zdat[o*4+3]=Math.min(1,Math.sqrt(gx*gx+gz*gz)/.9);}
  Z.d=zdat;CY.Z=Z;
  // les BUTTES : chaque case de 760 m où il en naît une marque son voisinage (le shader ne les cherche que là où la densité est > 0,3 %)
  const CS=760,cx0=Math.floor(Z.x0/CS)-1,cx1=Math.floor((Z.x0+znx*TZ)/CS)+1,cz0=Math.floor(Z.z0/CS)-1,cz1=Math.floor((Z.z0+znz*TZ)/CS)+1;CY.buttes=[];
  const BG={cx0:cx0,cz0:cz0,nx:cx1-cx0+1,nz:cz1-cz0+1};BG.i=new Int32Array(BG.nx*BG.nz).fill(-1);CY.bg=BG;
  for(let cz=cz0;cz<=cz1;cz++)for(let cx=cx0;cx<=cx1;cx++){const b=cyButteDe(cx,cz);if(!b)continue;BG.i[(cz-cz0)*BG.nx+(cx-cx0)]=CY.buttes.length;CY.buttes.push(b);const rr=b.rad*1.95;
    for(let jz=Math.max(0,Math.floor((b.z-rr-Z.z0)/TZ));jz<=Math.min(znz-1,Math.ceil((b.z+rr-Z.z0)/TZ));jz++)for(let jx=Math.max(0,Math.floor((b.x-rr-Z.x0)/TZ));jx<=Math.min(znx-1,Math.ceil((b.x+rr-Z.x0)/TZ));jx++){const o=(jz*znx+jx)*4+2;if(zdat[o]<.004)zdat[o]=.004;}
    if(b.z0+b.ht>yMax)yMax=b.z0+b.ht;}
  ms.plat=Math.round(performance.now()-t1);
  // ---- 5. LA TAILLE FINE (12 m) : le lit, l'eau, les berges, les parois — et la ripisylve, l'écume ----
  const t2=performance.now(),TF=PAL.b('cyFin',12),ME=reach+80;
  const F={ts:TF,x0:x0-ME,z0:z0-ME},fnx=Math.ceil((x1-x0+2*ME)/TF)+1,fnz=Math.ceil((z1-z0+2*ME)/TF)+1;F.nx=fnx;F.nz=fnz;
  const fc=new Float32Array(fnx*fnz*2),fm=new Uint8Array(fnx*fnz*4);for(let o=0;o<fnx*fnz;o++){fc[o*2]=1e5;fc[o*2+1]=-1e5;}
  // la grille d'accès (32 m) : pour chaque case, les deux échantillons les plus proches de deux BRAS différents de la route
  const TQ=32,qnx=Math.ceil((fnx*TF)/TQ)+1,qnz=Math.ceil((fnz*TF)/TQ)+1,q1=new Int32Array(qnx*qnz).fill(-1),q2=new Int32Array(qnx*qnz).fill(-1),d1=new Float32Array(qnx*qnz).fill(1e9),d2=new Float32Array(qnx*qnz).fill(1e9),LEG=Math.round(560/DS);
  for(let i=0;i<NS;i+=4){const cx=(S.x[i]-F.x0)/TQ,cz=(S.z[i]-F.z0)/TQ,R9=RE[i]+48,rr=Math.ceil(R9/TQ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(qnz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(qnx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,dq=(ex*ex+ez*ez)*TQ*TQ;if(dq>R9*R9)continue;const d=Math.sqrt(dq),o=jz*qnx+jx;
      if(q1[o]<0||Math.abs(i-q1[o])<LEG){if(d<d1[o]){d1[o]=d;q1[o]=i;}}
      else if(d<d1[o]){q2[o]=q1[o];d2[o]=d1[o];q1[o]=i;d1[o]=d;}
      else if((q2[o]<0||Math.abs(i-q2[o])<LEG||d<d2[o])&&d<d2[o]){q2[o]=i;d2[o]=d;}}}
  const qw=new Float32Array(qnx*qnz);for(let jz=0;jz<qnz;jz++)for(let jx=0;jx<qnx;jx++){const x=F.x0+jx*TQ,z=F.z0+jz*TQ;qw[jz*qnx+jx]=(cyNz(x/260,z/260,1)-.5)*2+(cyNz(x/90,z/90,2)-.5)*.6;}
  CY.qw={d:qw,nx:qnx,nz:qnz,ts:TQ,x0:F.x0,z0:F.z0};
  const prof={},E9=opt.deco?opt.deco.eau:1;let nc=0; // (2026-10-20) E9 : la rivière tirée (pleine 1, basse 0,45, à sec 0 : un lit de sable, plus d'écume)
  for(let jz=0;jz<fnz;jz++)for(let jx=0;jx<fnx;jx++){const qo=Math.min(qnz-1,Math.round(jz*TF/TQ))*qnx+Math.min(qnx-1,Math.round(jx*TF/TQ));
    if(q1[qo]<0)continue;const x=F.x0+jx*TF,z=F.z0+jz*TF;let best=1e9,bo=0,bdep=0,brk=0,bveg=0,bfo=0;
    for(let c=0;c<2;c++){const i0=c?q2[qo]:q1[qo];if(i0<0||(c&&d2[qo]>RE[i0]+48))continue;if(!cyProfil(S,RE,i0,x,z,prof))continue;
      if(prof.C<best){best=prof.C;bo=1;bdep=prof.dep;brk=prof.rk;bveg=prof.veg;bfo=prof.fo;}}
    if(!bo)continue;nc++;const o=jz*fnx+jx;fc[o*2]=best;
    fm[o*4]=Math.min(255,Math.round(bdep*10*E9));fm[o*4+1]=Math.round(brk*255);fm[o*4+2]=Math.round(bveg*255);fm[o*4+3]=Math.round(bfo*255*(E9>0?1:0));}
  F.c=fc;F.m=fm;CY.F=F;ms.fin=Math.round(performance.now()-t2);ms.texels=nc;
  cyMonuPrevoir(S,sQ,K,r,opt.deco);try{cyMitaines(S,F,sQ,K,r,opt.deco);}catch(e){}
  {const t9=performance.now();try{ms.rel=cyReliefs(S,F,opt);}catch(e){ms.relErr=String(e&&e.message||e);}ms.relMs=Math.round(performance.now()-t9);}CY.lev=opt.lev||null; /* (LE CANYON V3) les rochers posés, puis les disques d'ombre des ouvrages (cyOmbre) */
  // ---- 6. L'OMBRE : la hauteur sous laquelle on est à l'ombre, balayée une fois dans le sens du soleil de l'heure ----
  const t3=performance.now();cyOmbre(opt.sun[0],opt.sun[1]);ms.ombre=Math.round(performance.now()-t3);
  let fMin=1e9;for(let i=0;i<NS;i++)if(S.F[i]<fMin)fMin=S.F[i];
  return {Z:Z,F:F,O:CY.O,qw:CY.qw,bg:BG,buttes:CY.buttes,arche:CY.arche,chem:CY.chem,mit:CY.mit,yMin:fMin-60,yMax:Math.max(yMax,CY.yMaxM)+60,ms:ms};
}
/* LA POSE : les données du monde dans CY (la collision), à la puce (quatre textures), les monuments — et le relief s'allume */
function cyMondePose(R){
  if(!CY.mat||!(LVL.cur&&LVL.cur.piste==='canyon'))return;const t4=performance.now();try{cyDetPose();}catch(e){}
  CY.Z=R.Z;CY.F=R.F;CY.O=R.O;CY.qw=R.qw;CY.bg=R.bg;CY.buttes=R.buttes;CY.arche=R.arche;CY.chem=R.chem||[];CY.mit=R.mit;CY.yMin=R.yMin;CY.yMax=R.yMax;Object.assign(CY.ms,R.ms);
  const F=R.F,Z=R.Z,O=R.O;
  const dt=(d,w,h,fmt,typ,inf)=>{const t=new THREE.DataTexture(d,w,h,fmt,typ);if(inf)t.internalFormat=inf;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
  for(const k of ['tC','tM','tZ','tS'])if(CY[k])CY[k].dispose();
  CY.tC=dt(F.c,F.nx,F.nz,THREE.RGFormat,THREE.FloatType,'RG32F'); /* r128 ne connaît pas RG + flottant : sans le format nommé, la texture n'arrive JAMAIS à la puce (les parois disparaissaient) */CY.tM=dt(F.m,F.nx,F.nz,THREE.RGBAFormat,THREE.UnsignedByteType);
  CY.tZ=dt(Z.d,Z.nx,Z.nz,THREE.RGBAFormat,THREE.FloatType);CY.tS=dt(O.h,O.nx,O.nz,THREE.RedFormat,THREE.FloatType,'R32F');
  const U=CY.mat.uniforms;U.uTC.value=CY.tC;U.uTM.value=CY.tM;U.uTZ.value=CY.tZ;U.uTS.value=CY.tS;
  U.uFD.value.set(F.x0-F.ts*.5,F.z0-F.ts*.5,1/(F.nx*F.ts),1/(F.nz*F.ts));U.uFN.value.set(F.nx,F.nz);
  U.uZD.value.set(Z.x0-Z.ts*.5,Z.z0-Z.ts*.5,1/(Z.nx*Z.ts),1/(Z.nz*Z.ts));U.uZN.value.set(Z.nx,Z.nz);
  U.uSD.value.set(O.x0-O.ts*.5,O.z0-O.ts*.5,1/(O.nx*O.ts),1/(O.nz*O.ts));U.uSN.value.set(O.nx,O.nz);
  CY.on=true;CY.mesh.visible=true;
  try{cyMonuments(CY.seed>>>0);} /* (2026-11-07) la GRAINE de la piste, plus CY.job (le numéro de construction : les peupliers changeaient d'une partie à l'autre à graine égale) */catch(e){console.warn('canyon : monuments',e);}
  CY.ms.pose=Math.round(performance.now()-t4);CY.ms.total=Math.round(performance.now()-(CY.t0||t4));
}
/* le profil en travers à la position (x, z), vu depuis l'échantillon i0 (affiné ±6 échantillons) — renvoie faux hors de portée */
function cyProfil(S,RE,i0,x,z,o){
  let bd=1e18,bj=-1,bu=0;const a=Math.max(0,i0-4),b=Math.min(S.n-2,i0+4);
  for(let j=a;j<=b;j++){const ax=S.x[j],az=S.z[j],dx=S.x[j+1]-ax,dz=S.z[j+1]-az,l2=dx*dx+dz*dz||1;let u=((x-ax)*dx+(z-az)*dz)/l2;u=u<0?0:u>1?1:u;
    const px=ax+dx*u-x,pz=az+dz*u-z,d=px*px+pz*pz;if(d<bd){bd=d;bj=j;bu=u;}}
  if(bj<0)return false;const j=bj,u=bu,j1=j+1,d=Math.sqrt(bd);
  if(d>RE[j]+20)return false;
  const tx=S.tx[j],tz=S.tz[j],side0=((x-S.x[j])*tz-(z-S.z[j])*tx)>0?1:-1; // +1 = à droite de la route
  const v=1-u,mu=S.mu?S.mu[j]*v+S.mu[j1]*u:0;let dm=d,side=side0; /* (LE CANYON SUR LES MURS) le profil se compte depuis l'axe VIRTUEL de la vallée, écarté de la route du côté du vide ; la falaise (S.mg) est de l'autre côté */
  const of9=S.of?S.of[j]*v+S.of[j1]*u:0;
  if(mu>.002){const cs=S.mg[u<.5?j:j1],w9=(side0===cs?d:-d)+mu*S.dec-(of9!==0?cs*of9*(1-mu):0);dm=Math.abs(w9);side=w9>=0?cs:-cs;} /* (2026-11-13) en CORNICHE penchée : le décalage de la corniche (of9) s'efface à mesure que le plan de roche des murs prend la place (1 − mu) */
  else if(of9!==0){const w9=side0*d-of9;dm=Math.abs(w9);side=w9>=0?1:-1;} /* (2026-11-12, LA REFONTE) LA CORNICHE : l'axe de la vallée est à of9 m de la route (+ = à droite) — le lit, la rivière et les deux parois se comptent depuis lui ; la route longe la falaise d'en face */
  const wF0=(S.wF[j]*v+S.wF[j1]*u)*(1+side*(S.as[j]*v+S.as[j1]*u)),wR=S.wR[j]*v+S.wR[j1]*u,Fl=S.F[u<.5?j:j1],H=S.H[j]*v+S.H[j1]*u,wW=S.wW[j]*v+S.wW[j1]*u,zS=S.zS[j]*v+S.zS[j1]*u,zH=S.zH[j]*v+S.zH[j1]*u,aw=S.aw[j]*v+S.aw[j1]*u,s9=(j+u)*S.ds;
  const wF=zS<.5?Math.max(wF0,ROAD_HALF+5):wF0; // (2026-10-15) LE PIED DE PAROI ne passe jamais sous le bord + 5 m (sauf la fente des Étroits) : l'asymétrie, les alcôves et le 2e serrage s'additionnaient, la roche mordait la dalle
  const Q9=CY.qw,dd=dm+(dm>wR+4?cyBil(Q9.d,Q9.nx,Q9.nz,1,0,(x-Q9.x0)/Q9.ts+.5,(z-Q9.z0)/Q9.ts+.5)*aw:0)+zS*8*Math.sin(s9/36+side*1.3);
  o.dep=0;o.rk=0;o.veg=0;o.fo=0;
  if(dd<wR){const q=dd/wR;o.C=Fl-(1.2+2.6*(1-q*q));o.dep=Math.max(0,Fl-.7-o.C);o.fo=S.fo[j]*(1-q*.3);}
  else if(dd<wF){o.C=Fl+.10*(dd-wR)+1.6*(cyNz(x/40,z/40,3)-.5)*(1-zS);
    const vb=(dd>wR+1?1:0)*(dd<wR+34?1:Math.max(0,1-(dd-wR-34)/14))*(1-zS);o.veg=vb*(cyNz(x/60,z/60,0)>.42?1:.35);}
  else{const t=(dd-wF)/Math.max(8,wW),tt=Math.min(1,t);
    const gor=.5*Math.pow(tt,.75)+.5*(1-Math.pow(1-tt,1.8)),slot=Math.pow(tt,.45);
    o.C=Fl+H*(gor*(1-zS-zH)+slot*zS+tt*zH)+Math.max(0,dd-wF-wW)*2.4;o.rk=Math.min(1,t/.06);}
  if(mu>.002){ /* (LE CANYON SUR LES MURS) LE PLAN DE LA FALAISE : parallèle à la dalle, à `gap` m derrière elle (700 m plus bas quand elle est à plat) ; la roche vaut max(le canyon, le plan) */
    const nx=S.nx[j]*v+S.nx[j1]*u,ny=S.ny[j]*v+S.ny[j1]*u,nz=S.nz[j]*v+S.nz[j1]*u,nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1,py=S.y[j]*v+S.y[j1]*u,qx=S.x[j]*v+S.x[j1]*u,qz=S.z[j]*v+S.z[j1]*u,
      gp=S.gap+(1-mu)*(1-mu)*700,yP=py+(-gp-((x-qx)*nx+(z-qz)*nz)/nl)/Math.max(.04,ny/nl);
    if(yP>o.C){o.C=yP;o.rk=1;o.dep=0;o.veg=0;o.fo=0;}}
  return true;
}
/* la butte de la case (cx, cz) de 760 m — ou null : mêmes octets que le shader (CY.rnd au texel, la densité du plateau au texel du centre) */
function cyButteDe(cx,cz){const Z=CY.Z,R=CY.rnd,N=256,i0=((cx%N)+N)%N,j0=((cz%N)+N)%N,o=(j0*N+i0)*4;
  const ctx=(cx+.22+.56*R[o+1]/255)*760,ctz=(cz+.22+.56*R[o+2]/255)*760;
  const zx=Math.max(0,Math.min(Z.nx-1,Math.floor((ctx-(Z.x0-Z.ts*.5))/Z.ts))),zz=Math.max(0,Math.min(Z.nz-1,Math.floor((ctz-(Z.z0-Z.ts*.5))/Z.ts))),dc=Z.d[(zz*Z.nx+zx)*4+2];
  if(dc<.01||R[o]/255>dc*.85)return null;
  const i2=(((cx+101)%N)+N)%N,j2=(((cz+37)%N)+N)%N,o2=(j2*N+i2)*4,r1=R[o2]/255,r2=R[o2+1]/255;
  const rad=70+200*r1*r1,ht=(150+300*r2)*(rad<115?1.3:1);
  return {x:ctx,z:ctz,rad:rad,ht:ht,z0:Z.d[(zz*Z.nx+zx)*4],p3:R[o2+2]/255,p4:R[o2+3]/255};}
/* LE BALAYAGE DE L'OMBRE (grille de 18 m sur le domaine fin) : hS(p) = max(H, hS) relu 2 cases plus près du soleil − 2 cases × tan(hauteur).
   On parcourt les colonnes (ou les rangées) depuis le côté du soleil : la case relue est toujours déjà faite. */
function cyOmbre(elDeg,azDeg){const F=CY.F,TS=PAL.b('cyOmbre',27),nx=Math.ceil(F.nx*F.ts/TS)+1,nz=Math.ceil(F.nz*F.ts/TS)+1,O={ts:TS,x0:F.x0,z0:F.z0,nx:nx,nz:nz};
  const H=new Float32Array(nx*nz),M=new Float32Array(nx*nz),hS=new Float32Array(nx*nz);
  for(let jz=0;jz<nz;jz++)for(let jx=0;jx<nx;jx++)H[jz*nx+jx]=cyHauteurVite(O.x0+jx*TS,O.z0+jz*TS);
  const lever=(x,z,rr,y)=>{const i0=Math.max(0,Math.floor((x-rr-O.x0)/TS)),i1=Math.min(nx-1,Math.ceil((x+rr-O.x0)/TS)),j0=Math.max(0,Math.floor((z-rr-O.z0)/TS)),j1=Math.min(nz-1,Math.ceil((z+rr-O.z0)/TS));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const dx=O.x0+jx*TS-x,dz=O.z0+jz*TS-z;if(dx*dx+dz*dz<=rr*rr){const o=jz*nx+jx;if(y>H[o])H[o]=y;}}};
  if(CY.arche)for(const p of CY.arche.P)lever(p.x,p.z,CY.arche.W*.5,p.y+CY.arche.T*.5); // l'arche et les cheminées ombrent ce qui est dessous
  for(const c of CY.chem||[])lever(c.x,c.z,c.r,c.y+c.h);
  for(const q of CY.lev||[])lever(q[0],q[1],q[2],q[3]); // (LE CANYON V3) le bouchon des portes, le toit de la galerie, le pont naturel ombrent ce qui est dessous
  const el=Math.max(1,elDeg)*Math.PI/180,az=azDeg*Math.PI/180,sx=Math.sin(az),sz=Math.cos(az),te=Math.tan(el)*2*TS,sh=2;
  const bil=(fx,fz)=>{const i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=nx-1||j>=nz-1){const ci=Math.max(0,Math.min(nx-1,Math.round(fx))),cj=Math.max(0,Math.min(nz-1,Math.round(fz)));return H[cj*nx+ci];}
    const u=fx-i,v=fz-j,a=M[j*nx+i],b=M[j*nx+i+1],c=M[(j+1)*nx+i],d=M[(j+1)*nx+i+1];return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;};
  const fait=(jx,jz)=>{const o=jz*nx+jx,v=bil(jx+sx*sh,jz+sz*sh)-te;hS[o]=v;M[o]=Math.max(H[o],v);};
  if(Math.abs(sx)>=Math.abs(sz)){const dx=sx>0?-1:1;for(let jx=sx>0?nx-1:0;jx>=0&&jx<nx;jx+=dx)for(let jz=0;jz<nz;jz++)fait(jx,jz);}
  else{const dz=sz>0?-1:1;for(let jz=sz>0?nz-1:0;jz>=0&&jz<nz;jz+=dz)for(let jx=0;jx<nx;jx++)fait(jx,jz);}
  O.h=hS;CY.O=O;}
