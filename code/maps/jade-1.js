/* ======================= LES PICS DE JADE — LA MAP DE LÉO (2026-10-09) =======================
   Léo, trois images (les piliers de grès de Zhangjiajie couronnés de pins, un pic du Huangshan peint aux bleus-verts minéraux sur une
   mer de nuages, les mêmes piliers noyés de brume) : « travaille sur une nouvelle map inspirée de ça, vas-y à fond » — puis : « donne-moi
   la capacité d'aller dans cette map avec une voiture, la mobilité comme le main, mais seulement ça : pas de jeu, que la voiture dans la map »
   — puis (v2) : « couleurs plus similaires à l'image, et les montagnes fabriquées en pixels, comme du Minecraft art mais plus beau ».
   → `?map=jade` (voir BALADE) : la caisse, sa conduite telle quelle, et la map. Ni pièces, ni plots, ni score, ni HUD ; la mort n'est qu'un
     replacement (le bac à sable). Le portail mène à une autre vallée de la même map (nouvelle graine).
   · LA ROUTE (`genJade`) : un ruban suspendu qui serpente ENTRE les piliers — grands virages (R 280-700 m), pentes douces, aucun trou,
     aucun looping ; deux droites gardées pour les deux monuments.
   · LES PILIERS, LA PORTE DU CIEL (le trou de Tianmen), LE PONT DU CIEL (l'arche de Zhangjiajie) : EN CUBES — voir « EN CUBES » plus bas.
     RÈGLE D'OR (comme les tours de la ville) : aucun pilier ne touche la route — celui qui la croiserait passe SOUS elle (sommet 45 m sous
     la dalle : la face du dessous reste roulable).
   · LE CIEL (dôme, `jadeCiel`) : horizon pâle, bleu de brume, soleil voilé, quatre rangées de monts EN PIXELS (les crêtes au fond, des
     peignes de piliers devant), chacune le pied dans la brume, et sous l'horizon la MER DE NUAGES (un plan, parallaxe vraie).
   · Les nappes de BRUME restent douces, des vols de GRUES traversent la vallée.
   Console : `dbgJade()`, `dbgJadeVue(k)` ('route' 'porte' 'pont' 'haut' 'loin' 'grue'), `dbgJadeAller('porte'|'pont')`, `dbgJadeHeurt('test')`. */
const BALADE_MOTEUR=(/[?&]moteur=(\d+)/.exec(location.search)||[0,8])[1]|0; // (BALADE) le moteur de la balade : sans pièces il ne monterait jamais — un V6 biturbo par défaut, `?moteur=n` pour un autre palier
const JADE_NOM='SOLEIL DE JADE'; // (2026-10-12) le nom du NIVEAU (choisi par Claude, à la demande de Léo) — la map, elle, reste « PICS DE JADE »
const NIV_JADE={graine:(+((/[?&]graine=(\d+)/.exec(location.search)||[])[1])||0x51ADE),id:'jade',nm:'PICS DE JADE',bio:['jade'],planete:0,espace:0,pluie:0,cielMusical:false,route:.42,sheen:.16,piste:'jade',pr:'',sansNuages:1}; /* (2026-10-23, Sacha : « enlève les nuages de la map de jade ») le ciel de coton de Jade (cotonJade) n'est plus posé : `sansNuages` fait que lvlNuageOk() refuse, buildCoton() ne bâtit rien. La mer de cubes sous les pics, la brume et les rayons restent. */
/* (2026-10-13, Léo) CRYPTOCITY — LA VILLE EN BULL RUN : id 'ville' (toute la mécanique de la ville suit, comme MINUIT EN VILLE), `crypto`
   change l'air (voir « CRYPTOCITY — LA VILLE EN BULL RUN », après villeMatPub). (2026-10-15, Sacha) une MAP du mode classique au hasard :
   SF_CARTES.crypto (« CRYPTO CITY ») — `?carte=crypto` ou `?niveau=crypto` l'impose au 1er JOUER, `dbgNiveauCrypto(meteo)` aussi. */
const NIV_CRYPTO={id:'ville',crypto:1,nm:'CRYPTO CITY',bio:['bullrun'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.16,pr:'BULL RUN'};
const NIV_VITRE={id:'ville',vitre:1,nm:'VILLE VITRÉE',bio:['vitreMidi'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.16,pr:'LE CIEL DANS LES VITRES'}; // (2026-10-17, Léo) LA VILLE VITRÉE : la ville (mêmes tirages), des tours de verre — voir « LA VILLE VITRÉE »
const JADE={root:null,Q:null,fam:[],col:null,porte:null,pont:null,brume:null,n:{},ms:0,merY:-420,t:0,sig:0,geos:null,cl:null};
const JADE_U={uSunDir:{value:SUN_DIR},uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},
  uFillD:{value:new THREE.Vector3(0,-1,0)},uFillC:{value:new THREE.Color()},uMist:{value:new THREE.Color(.86,.87,.82)},
  uMerY:{value:-420},uSous:{value:0},uEauT:skyU.uEauT,uTime:{value:0},uCam:{value:new THREE.Vector3()},uY0:{value:0},uYH:{value:1},uGhost:{value:new THREE.Color(.70,.92,1.)},uRocT:{value:new THREE.Vector3(1,1,1)},uVerT:{value:new THREE.Vector3(1,1,1)}}; /* (2026-10-20, LE DÉCOR AU HASARD) uRocT, uVerT : la teinte de la roche et des verts de CETTE vallée (1 = celles d'avant) */
const JADE_MODULES=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jademodules(,|&|$)/.test(location.search); /* (2026-10-20) SIX MODULES (voir jCorniche) — `?sans=jademodules` = le paquet d'avant (lacets, épingle, double sommet) */
const JADE_DECOR=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadedecor(,|&|$)/.test(location.search); /* (2026-10-20) LE DÉCOR AU HASARD (voir jadeDecoTire) — `?sans=jadedecor` = la vallée d'avant, au tirage près */
/* LE DÉVERS DE JADE (2026-11-05, Sacha : « longues torsades, dans les virages la route s'incline légèrement comme les routes de NASCAR, pour frôler les montagnes — pas des torsades comme les nuages ou l'espace, des longues torsades beaucoup plus smooth »)
   max : l'angle plafond (les dunes vont à 22°, les nuages à 50°) · W : le demi-fenêtrage de la courbure (m) — passé DEUX fois : l'angle monte et redescend sur ~600 m, jamais d'à-coup · `?sans=jadebank` = la route plate d'avant */
const JADE_BANK={on:typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadebank(,|&|$)/.test(location.search),max:16*Math.PI/180,W:150};
/* LA ROUTE — même outillage que genParis (droites, arcs ≤ 9° par point), mais tirée à la graine de la piste : chaque vallée est neuve.
   Le cap reste dans ±85° de l'axe de départ (aucun retour sur ses pas : la route ne recroise jamais un de ses tronçons).
   (2026-10-18, Sacha : « la génération de map dans les montagnes chinoises est toujours la même, rends-la plus aléatoire ») MESURÉ (les plans
   de 60 graines, vus de dessus) : la graine changeait bien à chaque partie, mais la RECETTE était la même — un serpentin doux tout droit vers
   le nord, la Porte au premier quart, le Pont au milieu, 11 à 13 km, deux ondes de relief : on croyait rouler la même vallée. LA VALLÉE AU
   HASARD — chaque piste tire désormais :
   · l'AXE de la vallée (±45° autour du nord : la lumière rasante du soleil bas change de côté d'une piste à l'autre) ;
   · l'ORDRE des deux monuments (la Porte puis le Pont, ou le Pont d'abord) et leur PLACE : les trois tronçons de virages se partagent la
     longueur au hasard (chacun entre ~20 et ~45 %) ;
   · un CARACTÈRE par tronçon (`JADE_HUMEURS`), jamais deux fois le même de suite — le serpentin serré, les grandes courbes, la DÉRIVE (la
     vallée part en biais d'un côté puis revient), le balcon (de longues droites cassées de coudes), les chicanes, et la vallée d'origine ;
   · la LONGUEUR (≈ 10,5 à 14,5 km : ni trop court ni trop long, la règle de la v14) et le RELIEF (amplitudes et longueurs d'onde tirées, une
     3e onde courte une fois sur deux, le tout ramené sous la pente d'origine), puis les rampes vers les monuments ADOUCIES (`adoucirPentes`) :
     avant, elles montaient jusqu'à ~70 % entre deux points de contrôle.
   Le départ, l'arrivée, l'effondrement, les deux monuments à plat et dans l'axe : inchangés. `?graine=n` (la balade, `?niveau=jade`) garde
   une vallée fixe — mais plus celle d'avant. */
const JADE_HUMEURS=[ // a : angle d'un virage (°, minimum + étendue) · R : rayon (m, minimum + étendue) · inv : la chance d'inverser le sens (un S) · dr : [chance d'une droite après, longueur minimum, étendue]
  {nm:'vallee',  a:[32,62],R:[260,300],k:[2.4,1.4],inv:.74,dr:[.3,70,160]},   // l'ancienne recette, gardée parmi les autres · k : (2026-11-05) le rayon en RAYONS TENABLES (minimum + étendue), avec les modules
  {nm:'serpent', a:[40,42],R:[280,140],k:[1.9,.8],inv:.88,dr:[.12,60,100]},  // des S serrés, presque sans répit (280 m : jamais plus serré que l'ancienne recette)
  {nm:'courbes', a:[34,40],R:[420,300],k:[2.8,1.2],inv:.66,dr:[.25,100,160]},  // de grandes courbes qui se prennent à fond
  {nm:'derive',  a:[22,28],R:[340,240],k:[2.6,1.2],inv:.25,dr:[.25,80,140]},   // la vallée tourne d'un côté jusqu'à la butée, puis revient : un grand biais
  {nm:'balcon',  a:[24,30],R:[340,260],k:[2.6,1.2],inv:.6,dr:[.7,110,170]},    // de longues droites cassées de coudes : on voit loin
  {nm:'chicanes',a:[22,20],R:[280,80],k:[1.9,.6],inv:1,dr:[.06,40,70]}];     // gauche-droite-gauche, vite
const JADE_PENTE={seuil:.12,garde:.3}; // au-delà de 12 %, la pente n'est gardée qu'à 30 % (voir adoucirPentes)

/* ===== JADE QUI SECOUE (2026-11-12, Sacha : « refonte du système de route des montagnes de Jade : trop répétitif, trop plat, il se passe pas grand-chose — rajoute beaucoup de modules, propres à la map, fun, simples et sobres, sans grands demi-tours ; il faut que ça secoue ») =====
   HUIT MODULES DE PLUS, chacun avec SES pics (JADE.pose, posés par jadeBatit à quelques mètres du bord — la règle d'or tient : aucun ne touche la route) ou SON relief (LEV, ajouté après adoucirPentes) :
     jSlalom    · LE SLALOM DES PICS : 4 ou 6 virages alternés (44-54° à 2-2,3 rP), un pic de jade planté À LA CORDE de chacun, plus haut que la route : on ne voit pas la suite
     jDefile    · LE DÉFILÉ : un S large entre deux rangées de pics en quinconce, à 7-11 m du bord — un couloir
     jCarrousel · LE CARROUSEL : un seul grand appui de 105-125° enroulé autour d'un vrai pic (il remplace l'épingle et le double sommet dans le paquet : plus de demi-tour)
     jVrille    · LA VRILLE : une droite où la dalle fait UN tonneau complet (360° en ~4 s, doux aux deux bouts) — la tête à l'envers au-dessus de la mer
     jColimacon · LE COLIMAÇON : un tour complet autour d'un pic en prenant 64-90 m (la route repasse AU-DESSUS d'elle-même) ; il descend si une plongée l'attend plus loin
     jPlongee   · LE GRAND PLONGEON (jPlongeon) : la route pique de 62 à 90 m entre deux pics, sous une île qui flotte au-dessus d'elle (c'était, un temps, la route sous la mer)
     jBosses    · LE DOS DU DRAGON : 3 ou 4 bosses de 6-8 m sur une droite
     jAscension · L'ESCALIER DU CIEL (rare : JADE_ASC.chance) : un tour autour d'un pic jusqu'AU-DESSUS de son sommet (150-200 m), une crête au-dessus des montagnes, un tour de l'autre main pour redescendre
   Et PLUS DE MODULES PAR VALLÉE (jusqu'à 5 au lieu de 3, deux par tronçon), toujours deux « signatures » au moins (slalom, vrille, colimaçon, plongée) dans les quatre premiers.
   `?sans=jadefun` = la vallée d'avant · `?jmod=plongee,vrille` impose les premiers modules (lacets corniche chicane dragon slalom defile carrousel vrille colimacon plongee bosses ascension) · `?asc=1` force l'ascension. */
/* ===== JADE SANS MER (2026-11-12, Sacha : « plus de mer dans les pics de jade, ça doit juste être des pics flottants comme Avatar ; retravaille la génération et le design pour que ce soit à couper le souffle ; la route doit descendre en passant entre les montagnes qui flottent ») =====
   · plus d'eau : le ciel peint un ABÎME de brume et une mer de nuages loin dessous (scene-ciel.js, jAbime). (Sacha, ensuite : « j'en veux plus ») la mer, sa physique, ses effets, ses dauphins
     et le ras de l'eau sont RETIRÉS du code ; seul JEAU reste, neutre (jade-3.js) ;
   · LA DESCENTE : le relief au hasard penche vers le bas (JDESC, 5,5 à 8,5 % — 400 à 600 m sur une vallée), le colimaçon descend toujours ;
   · LE GRAND PLONGEON (remplace la plongée sous la mer) : la route pique de 62 à 90 m entre deux pics qui se dressent de part et d'autre, sous une île qui flotte au-dessus d'elle ;
   · LES ÎLES DU CIEL (jade-3.js) : de loin en loin une montagne flotte AU-DESSUS de la route, on passe dessous ; les montagnes du lointain s'étagent plus haut et plus bas.
*/
const JADE_FUN=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadefun(,|&|$)/.test(location.search);
/* ===== LA CHUTE DE JADE (2026-11-12, Sacha : « retravaille la génération de route : il faut que ça aille vers le bas et exploite les pics volants ; on doit descendre en roulant à travers
   des pics de jade volants, c'est super épique — prends des libertés, inspire-toi des autres maps ») =====
   · LA PENTE DE FOND passe de 5,5-8,5 % à 17-23 % (JADE_CHUTE.fond) : une vallée de 7 km descend de 1,2 à 1,6 km, des îles du ciel jusqu'au-dessus de la mer de nuages ; elle NAÎT en pente
     (aux nuages, une route qui partait à plat puis plongeait tuait un saut fait juste après le portail) ; les ondes du relief, plus douces, ne font plus que la houler ;
   · LE PUITS (le module rare, à la place de l'escalier du ciel qui montait — le vertige de la grotte, les spirales de l'orbite) : deux tours complets autour d'un pic géant, 170 à 250 m plus bas ;
   · LE COULOIR (les murs du canyon) : des pics serrés des DEUX côtés, une île au-dessus ; LES ARCHES : trois îles au-dessus d'un S, on passe dessous, un pic à chaque corde ;
     LES MARCHES (le toboggan du glacier) : trois ou quatre bascules de 30 à 45 m, chacune suivie d'un virage autour d'un pic ;
   · LE PLONGEON plus profond (80 à 115 m) mais plus long et plus doux à l'entrée, LE COLIMAÇON plus bas (90 à 140 m), les îles du ciel deux fois plus nombreuses.
   Chaque bascule est une rampe arrondie (`e`, la part de la longueur où la pente monte et retombe) : une pente qui s'accentue d'un coup tue un saut.
   `?jadepente=0.07` : une autre pente de fond (0.07 : celle d'avant) ; `?jmod=puits,couloir,arches,marches`. */
const JADE_CHUTE={fond:(function(){const m=typeof location==='undefined'?null:/[?&]jadepente=([\d.]+)/.exec(location.search);return m?[+m[1],0]:[.17,.06];})()};
const JADE_PROX=typeof location==='undefined'||!/[?&]proxi=0(&|$)/.test(location.search); /* (2026-11-13) LA ROUTE FRÔLE LES PICS : `?proxi=0` rend la vallée d'avant (droites libres, pics au hasard seulement) */
const JADE_ASC={chance:.25,force:typeof location!=='undefined'&&/[?&]asc=1(&|$)/.test(location.search)};
const JADE_JMOD=typeof location==='undefined'?null:((/[?&]jmod=([a-z,]+)/.exec(location.search)||[])[1]||null);
function genJade(rnd){return rythmeMeilleur(rnd,RYTHME.N,'jade',genJade1,{assez:1}).ctrl;} /* (2026-11-05, LE DIRECTEUR DE RYTHME) N vallées sur des flux dérivés d'un seul tirage, la mieux notée est gardée (route-rythme.js) */
function genJade1(rnd){
  const ctrl=[];CAMPM.length=0;MODMARK.length=0;
  const phi0=(rnd()-.5)*1.5708; // l'AXE de la vallée, tourné au hasard (±45°) : le soleil bas du rouleau (SUN_DIR, derrière le départ) ne tombe plus toujours du même côté
  let P=new THREE.Vector3(0,0,0),phi=phi0;
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi)),push=()=>ctrl.push(P.clone());
  let jDette=0; /* (2026-11-07, GÉNÉRATION v2) la dette de cap : un recadrage de 8 à 26° ne se dessine pas, il est reporté sur le prochain vrai virage (briqueRecadre / briqueDette) */
  const droite=(l,nn)=>{nn=GEN_V2?Math.max(1,Math.min(nn||Math.round(l/100),Math.floor(l/40))):(nn||Math.max(2,Math.round(l/100)));/* v2 : jamais un segment sous 40 m */for(let k=0;k<nn;k++){P.addScaledVector(dir(),l/nn);push();}};
  const ARCR=[]; /* (2026-11-13) chaque arc dessiné : où il commence, où il finit, son angle, son rayon — les frôleurs s'y posent (fin de genJade1) */
  const arc=(aDeg,R)=>{const i9=ctrl.length-1,nn=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;P.addScaledVector(dir(),ch);phi+=st/2;push();}ARCR.push({i0:i9,i1:ctrl.length-1,a:aDeg,R:R});};
  const recadre=(dDeg,R,garde)=>{if(!GEN_V2){if(Math.abs(dDeg)>3)arc(dDeg,R);return;}const r=briqueRecadre(dDeg,0); /* dDeg est mesuré depuis le cap réel : il contient déjà la dette */
    if(garde)jDette=r.dette;if(r.dessine)arc(Math.abs(r.dessine)<36?36*Math.sign(r.dessine):r.dessine,R);}; /* (v2) la brique : rien sous 8°, une dette de 8 à 26°, un vrai virage au-delà */
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi};};
  const LIM=85*Math.PI/180;
  const virages=(len,H)=>{let fait=0,sg=rnd()<.5?-1:1;
    while(fait<len){
      if(GEN_V2&&jDette)sg=jDette<0?-1:1;else if(rnd()<H.inv)sg=-sg;  // (v2) la dette de cap fixe le côté · le plus souvent un S : on serpente (la DÉRIVE, elle, insiste du même côté)
      let a=H.a[0]+rnd()*H.a[1];const R=rj?Math.max(jRm,(H.k[0]+rnd()*H.k[1])*jRP):H.R[0]+rnd()*H.R[1];if(rj)a=a*1.25+6; /* (2026-11-05, LE DIRECTEUR DE RYTHME) les rayons en RAYONS TENABLES (H.k × rayonPalier) : à 260-560 m fixes, au palier 0 aucun virage ne demandait le volant (banc : 0 virage/km) */ // (2e tour) avec les modules : 2 × plus serré, 25 % plus tourné (jRm : jamais sous 1,4 × le rayon tenable)
      const lib=(LIM-sg*(phi-phi0))*57.2958;                      // ce qu'il reste avant la butée de cap (autour de l'axe), dans ce sens
      if(lib<(GEN_V2?38:22)){sg=-sg;a=Math.min(a,(LIM-sg*(phi-phi0))*57.2958);}else a=Math.min(a,lib);
      if(GEN_V2){a=Math.max(a,36);if(jDette){a=Math.max(36,Math.abs(briqueDette(sg*a,jDette)));jDette=0;}} /* 36° : la fiche mesure 5 à 7° de moins qu'on ne dessine (pas de la corde), un 30° passerait pour une douille */ /* (v2) jamais sous 26° (la douille) ; la dette de cap est rendue ici */
      arc(sg*a,R);fait+=R*a/57.2958;
      if(rnd()<H.dr[0]){const l=H.dr[1]+rnd()*H.dr[2],l9=rj?l*(GEN_V2?.5:.4):l;if(!GEN_V2||l9>=60){if(rj&&JADE_FUN&&JADE_PROX&&l9>=80&&rj()<.9){const s9=phi-phi0>0?-1:1,a9=34+rj()*12,R9=jRP*(2.1+rj()*.4);arc(s9*a9,R9);arc(-s9*a9,R9);fait+=2*R9*a9/57.2958;} /* (2026-11-13, « trop de tout droit ») une droite libre de 100 m et plus : un S autour d'un pic (le pic se pose à l'apex de chaque arc), d'abord vers l'axe de la vallée */else{droite(l9);fait+=l9;}}}}}; /* (v2) une droite de moins de 60 m n'existe pas : ni droite franche ni courbe */ // (2e tour) les droites entre deux virages, 60 % plus courtes avec les modules
  let hPrec=-1;const humeur=()=>{let i=(rnd()*JADE_HUMEURS.length)|0;if(i===hPrec)i=(i+1+((rnd()*(JADE_HUMEURS.length-1))|0))%JADE_HUMEURS.length;hPrec=i;return JADE_HUMEURS[i];}; // jamais deux fois le même caractère de suite
  const tot0=5200+rnd()*3200,pa=[.75+rnd(),.75+rnd(),.75+rnd()],ps=pa[0]+pa[1]+pa[2]; // la longueur des virages, partagée au hasard entre les trois tronçons
  /* (LA DURÉE DES MAPS) au JOUER, les virages prennent ce qui reste de la longueur visée une fois posés le départ, les deux monuments et la
     ligne de la fin (`FX9` : ~2,4 km avec les modules, 3,2 sans), et les MODULES de Sacha (~1 km chacun : ils prennent leur longueur sur les
     tronçons, mais pas en dessous de la leur) — un seul au départ, les trois quand la longueur visée les tient (`jmN`) : la Porte, le Pont et
     l'effondrement ne raccourcissent pas. */
  const FX9=MODC_ON?2000:3200,MD9=MODC_ON?Math.max(420,Math.min(1000,9*(typeof rayonPalier==='function'?rayonPalier():63))):0, /* (2026-11-05) les modules en rayons tenables sont plus courts (~9 rP) et les monuments aussi (FX9 2400 → 2000) : la vallée garde sa longueur visée */LC9=longueurCible(),jmN=!LC9?(JADE_FUN?5:3):Math.max(1,Math.min(JADE_FUN?5:3,Math.floor((LC9-FX9-900)/(JADE_FUN?700:1000)))),vir9=LC9?Math.max(900,LC9-FX9-jmN*MD9):0,chu9=LC9?Math.min(1000,Math.max(350,vir9*.12)):0,tot=LC9?vir9-chu9:tot0;
  const porte=()=>{{const a=(phi0-phi)*57.2958*.7;if(GEN_V2)recadre(a,2.8*jRP,true);else if(Math.abs(a)>4)arc(a,rj?2.8*jRP:520);} // (2e tour) avec les modules : l'alignement plus serré, les abords plus courts // la Porte se prend plutôt dans l'axe de la vallée
    const i9=ctrl.length-1;droite(rj?(GEN_V2?(JADE_PROX?55:80):110):380,2);ici('porte0');droite(rj?(GEN_V2?(JADE_PROX?250:280):360):520,4);ici('porte1');droite(rj?(GEN_V2?(JADE_PROX?45:70):80):260,2); /* v2 : 430 m (5,5 s) au lieu de 550 : jamais plus de 6,5 s entre deux virages */MODMARK.push({i0:i9,i1:ctrl.length-1,fig:'porte'});}; /* fig : la Porte est un temps fort déclaré (sa droite est la sienne) */ /* (2026-11-05, « trop de tout droit ») la Porte : 740 m de droite → 550 (son modèle se pose au milieu, jade-3 : iPorte) */ /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») : abords plus courts */
  const pont=()=>{const i9=ctrl.length-1;droite(rj?(GEN_V2?(JADE_PROX?55:80):90):300,2);ici('pont0');droite(rj?(GEN_V2?(JADE_PROX?220:240):280):360,3);ici('pont1');droite(rj?(GEN_V2?(JADE_PROX?45:60):70):200,2);MODMARK.push({i0:i9,i1:ctrl.length-1,fig:'pont'});}; /* (2026-11-05) le Pont : 550 m de droite → 440 */
  const monus=rnd()<.5?[porte,pont]:[pont,porte];               // la Porte d'abord, ou le Pont
  /* LES MODULES DE JADE (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). Un au cœur de chacun des trois tronçons de virages (après 40 à 60 %
     de sa longueur : jamais collé à la Porte ni au Pont), les trois chaque fois, dans un ordre tiré au hasard (`rj`, un seul tirage de plus) :
       jLacets  · LES LACETS DU DRAGON : 5-7 virages alternés de 34-49° à 190-250 m, sans une droite — la route de Tianmen
       jEpingle · L'ÉPINGLE DE LA FALAISE : un demi-tour de 150-166° à 200-240 m, pris d'une butée de cap à l'autre (la route avance toujours)
       jSommet  · LE DOUBLE SOMMET : deux grands appuis du même côté (145-165° en tout, R 250-300) et une droite entre — on contourne un pic
     Le cap reste dans ± LIM de l'axe : la vallée ne se recroise jamais ; rien ne change au relief (il se lit sur la longueur) ; le module prend sa longueur
     sur celle du tronçon (sans ça la vallée s'allongeait de moitié : banc). */
  const rj=MODC_ON?mulberry32((rnd()*4294967296)>>>0):null,jmPaq=JADE_MODULES?[0,1,2,3,4,5]:[0,1,2],jRP=typeof rayonPalier==='function'?rayonPalier():63,jRm=1.8*jRP,jVP=typeof vPalier==='function'?vPalier():78; /* (2026-11-05) jRm : jamais sous 1,8 × le rayon tenable (c'était max(170 m, 1,4 rP) : 2,7 rP au palier 0, des courbes molles) */
  if(rj)for(let i=jmPaq.length-1;i>0;i--){const j=(rj()*(i+1))|0,x9=jmPaq[i];jmPaq[i]=jmPaq[j];jmPaq[j]=x9;} /* (2026-10-20) six sortes : le paquet de six, mélangé, en donne trois différentes (jamais deux fois la même) */
  const jCap=h=>{const d=(h-phi)*57.2958;if(GEN_V2){recadre(d,Math.max(2.6*jRP,Math.min(3.4*jRP,Math.abs(d)*6)),h===phi0)/* v2 : jamais au-delà de 3,4 rP (au-dessus de 4 rP la fiche ne voit plus un virage) */;return;}if(Math.abs(d)>3)arc(d,Math.max(2.6*jRP,Math.min(4*jRP,Math.abs(d)*6)));}; // se mettre au cap h (radians)
  const jLacets=()=>{const n=5+((rj()*3)|0),a=34+rj()*15,R=jRP*(2.0+rj()*.5);if(Math.abs(phi-phi0)>LIM-a/57.3*.6)jCap(phi0);let sg=phi-phi0>0?-1:1;
    if(GEN_V2){const m=4+2*((rj()*2)|0);for(let k=0;k<m;k++){arc(sg*a,R);sg=-sg;}return;} /* (v2) pas de demi-virage de 17-24° (une douille) : 4 ou 6 lacets pleins, alternés, qui se compensent */
    arc(sg*a*.5,R);
    for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R);}arc(-sg*a*.5,R);};
  const jEpingle=()=>{const s9=phi-phi0>0?-1:1,a=150+rj()*16,R=jRP*(1.9+rj()*.4);jCap(phi0-s9*a/2/57.2958);droite(80+rj()*60);arc(s9*a,R);droite(100+rj()*80);};
  const jSommet=()=>{const s9=phi-phi0>0?-1:1,T=145+rj()*20,a1=T*(.45+rj()*.1),R=jRP*(2.4+rj()*.6);jCap(phi0-s9*T/2/57.2958);arc(s9*a1,R);droite(80+rj()*60);arc(s9*(T-a1),R*(.9+rj()*.15));};
  /* ===== TROIS MODULES DE PLUS (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =====
       jCorniche · LA CORNICHE : une grande courbe rapide de 55-80° (R 480-640 m, ≥ 1,6 × le rayon tenable), une droite, un contre-appui de 60 % — à fond
       jChicane  · LA CHICANE DU COL : gauche-droite-gauche (28 / 56 / 28° à 180-210 m), une courte droite, la même en miroir — la main, vite
       jDragon   · LE GRAND S DU DRAGON : trois arcs (+a, −2a, +a ; a = 60-75° à 220-260 m), pris dans l'axe de la vallée — on balance de tout son poids
     Le cap reste dans ± LIM de l'axe (chaque module s'y remet avant de partir si besoin) : la vallée ne se recroise jamais. */
  const jCorniche=()=>{if(Math.abs(phi-phi0)>LIM*.5)jCap(phi0);const s9=phi-phi0>0?-1:1,a=55+rj()*25,R=jRP*(3.0+rj()*.8);arc(s9*a,R);droite(60+rj()*60);arc(-s9*a*(GEN_V2?.68:.6),R*.9);};
  const jChicane=()=>{if(Math.abs(phi-phi0)>LIM-.6)jCap(phi0);const sg=phi-phi0>0?-1:1,R=jRP*(1.8+rj()*.4);{const c9=GEN_V2?36:28;arc(sg*c9,R);arc(-sg*2*c9,R);arc(sg*c9,R);droite(60+rj()*50);arc(-sg*c9,R);arc(sg*2*c9,R);arc(-sg*c9,R);}};
  const jDragon=()=>{jCap(phi0);const sg=rj()<.5?-1:1,a=60+rj()*15,R=jRP*(2.2+rj()*.5);arc(sg*a,R);arc(-sg*2*a,R*1.05);arc(sg*a,R);};
  /* ===== LES TROIS PICS (2026-11-07, GÉNÉRATION v2 : le module UNIQUE de Jade, le climax, une fois par route dans le dernier tiers) =====
       Trois crêtes en ligne : une droite montante de 1,5 s, la CRÊTE (`pic0..2`), puis la descente en un virage de 50° (R 2,2-2,6 rP), alternés. Le plan est ici ;
       la hauteur (22-30 m par crête) est ajoutée APRÈS adoucirPentes, plus bas (JADE_PICS), pour qu'elle ne soit pas écrasée. */
  const PICS=[];
  const jPics=()=>{if(Math.abs(phi-phi0)>LIM*.5)jCap(phi0);let sg=phi-phi0>0?-1:1;
    for(let k=0;k<3;k++){const a9=ctrl.length-1;droite(1.6*jVP,3);const c9=ctrl.length-1;ici('pic'+k);arc(sg*50,(2.2+rj()*.4)*jRP);PICS.push({a:a9,c:c9,b:ctrl.length-1,H:22+rj()*6});sg=-sg;}};
  /* ===== JADE QUI SECOUE (2026-11-12) : les huit modules de plus (voir JADE_FUN) ===== */
  const LEV=[],POSE=[],VRI=[],coDesc=true; /* coDesc : le colimaçon descend toujours (la route descend) */
  const fil=(l,pas)=>{const nn=Math.max(1,Math.round(l/pas));for(let k=0;k<nn;k++){P.addScaledVector(dir(),l/nn);push();}}; /* une droite à pas serré : le relief (bosses, rampes) et le tonneau s'y dessinent point par point */
  const jAxe=m=>{if(Math.abs(phi-phi0)>LIM*m)jCap(phi0);};
  const jSlalom=()=>{const a=44+rj()*10,R=jRP*(2+rj()*.3),m=4+2*((rj()*2)|0);if(Math.abs(phi-phi0)>LIM-a/57.3*.6)jCap(phi0);let sg=phi-phi0>0?-1:1;
    for(let k=0;k<m;k++){arc(sg*a*.5,R);POSE.push({k:ctrl.length-1,s:sg,r:15+rj()*13,h:130+rj()*150,gap:8+rj()*4});arc(sg*a*.5,R);sg=-sg;}}; /* le pic à la corde : au milieu de chaque arc, du côté du centre */
  const jDefile=()=>{jAxe(.5);const sg=phi-phi0>0?-1:1,R=jRP*(3+rj()*.4),a=36+rj()*8,i0=ctrl.length-1;
    fil(1.2*jVP,45);arc(sg*a,R);fil(.9*jVP,45);arc(-sg*a,R);fil(jVP,45);
    let acc=0,cote=rj()<.5?-1:1;for(let k=i0+1;k<ctrl.length-1;k++){acc+=ctrl[k].distanceTo(ctrl[k-1]);if(acc<48)continue;acc=0;POSE.push({k:k,s:cote,r:13+rj()*10,h:170+rj()*170,gap:7+rj()*4});cote=-cote;}}; /* en quinconce : un pic à gauche, le suivant à droite, tous les ~50 m */
  const jCarrousel=()=>{const s9=phi-phi0>0?-1:1,T9=105+rj()*20,R=jRP*(2.3+rj()*.3);jCap(phi0-s9*T9/2/57.2958);droite(60+rj()*40);
    POSE.push({c:1,x:P.x+s9*Math.cos(phi)*R,z:P.z-s9*Math.sin(phi)*R,R:R,k:ctrl.length-1,r:56,h:150+rj()*120,gap:9,sat:5});arc(s9*T9,R);droite(60+rj()*40);};
  const jVrille=()=>{jAxe(.6);const sg=rj()<.5?-1:1,l=Math.max(20,.26*jVP);fil(Math.max(70,JADE_PROX?.6*jVP:jVP),40);const a=ctrl.length-1;fil(16*l,l);VRI.push({a:a,b:ctrl.length-1,sg:sg});fil(Math.max(70,JADE_PROX?.6*jVP:jVP),40);}; /* 16 pas : jamais plus de ~34° de roulis entre deux points de contrôle (buildTrack mélange les normales en ligne droite) */
  const jColimacon=()=>{jAxe(.6);const s9=rj()<.5?-1:1,R=jRP*(2+rj()*.25),H=(coDesc?-1:1)*(90+rj()*50);droite(Math.max(60,.8*jVP));const a=ctrl.length-1;
    POSE.push({c:1,x:P.x+s9*Math.cos(phi)*R,z:P.z-s9*Math.sin(phi)*R,R:R,k:a,r:56,h:Math.max(0,H)+110+rj()*120,bas:Math.min(0,H),gap:9,sat:4});
    arc(s9*360,R);phi-=s9*2*Math.PI; /* le cap revient à sa valeur : la butée ±LIM se lit toujours autour de l'axe */LEV.push({t:'marche',a:a,b:ctrl.length-1,H:H});droite(Math.max(60,.8*jVP));};
  const jPlongeon=()=>{jAxe(.5);const sg=phi-phi0>0?-1:1,ld=Math.max(360,4.6*jVP),D=-(80+rj()*35),R=jRP*(2.6+rj()*.4),a9=40+rj()*10;fil(Math.max(60,.8*jVP),40);const a=ctrl.length-1;
    for(const s9 of [-1,1])POSE.push({k:a,s:s9,r:30+rj()*12,h:110+rj()*130,gap:8+rj()*3}); /* LA PORTE : deux pics de part et d'autre du bord, au sommet de la descente */
    fil(ld,40);const b=ctrl.length-1;POSE.push({k:Math.round(a+(b-a)*.55),dessus:1,r:22+rj()*10,clear:44,h:0,gap:8}); /* L'ÎLE : une montagne qui flotte AU-DESSUS du plongeon, 44 m sous son pied */
    for(const s9 of [-1,1])POSE.push({k:b,s:s9,r:16+rj()*12,h:60+rj()*140,gap:9+rj()*4});
    LEV.push({t:'marche',a:a,b:b,H:D,e:.3});arc(sg*a9,R);fil(Math.max(60,.8*jVP),40);};
  const jPlongee=jPlongeon;
  const jBosses=()=>{jAxe(.6);const n=3+((rj()*2)|0),lam=Math.max(80,1.25*jVP);fil(Math.max(50,.6*jVP),40);const a=ctrl.length-1;fil(n*lam,lam/6);LEV.push({t:'bosses',a:a,b:ctrl.length-1,H:6+rj()*2.5,n:n});fil(Math.max(50,.6*jVP),40);};
  const jPuits=()=>{jAxe(.5);const s9=rj()<.5?-1:1,R=jRP*(2.3+rj()*.3),H=-(170+rj()*80);droite(Math.max(60,.8*jVP));const a=ctrl.length-1;
    POSE.push({c:1,x:P.x+s9*Math.cos(phi)*R,z:P.z-s9*Math.sin(phi)*R,R:R,k:a,r:56,h:90+rj()*160,bas:H,gap:9,sat:7}); /* LE PIC GÉANT au cœur du puits, et sa cour de pics plus fins */
    arc(s9*720,R);phi-=s9*4*Math.PI;LEV.push({t:'marche',a:a,b:ctrl.length-1,H:H,e:.12});droite(Math.max(60,.8*jVP));}; /* deux tours : chaque étage passe 85 à 125 m sous le précédent */
  const jCouloir=()=>{jAxe(.55);const sg=phi-phi0>0?-1:1,R=jRP*(2.7+rj()*.4),a9=34+rj()*8,i0=ctrl.length-1;
    fil(jVP,45);arc(sg*a9,R);fil(.8*jVP,45);arc(-sg*a9,R);fil(.9*jVP,45);
    let acc=0;for(let k=i0+1;k<ctrl.length-1;k++){acc+=ctrl[k].distanceTo(ctrl[k-1]);if(acc<38)continue;acc=0;for(const s9 of [-1,1])POSE.push({k:k,s:s9,r:11+rj()*11,h:120+rj()*200,gap:6+rj()*3});} /* les deux murs de pics, tous les ~40 m */
    POSE.push({k:Math.round((i0+ctrl.length-1)/2),dessus:1,r:20+rj()*10,clear:40,h:0,gap:8});};
  const jArches=()=>{jAxe(.55);let sg=phi-phi0>0?-1:1;const R=jRP*(2.4+rj()*.4),a9=40+rj()*10;
    for(let k=0;k<3;k++){arc(sg*a9*.5,R);const k9=ctrl.length-1;POSE.push({k:k9,dessus:1,r:20+rj()*12,clear:36+rj()*14,h:0,gap:8});POSE.push({k:k9,s:sg,r:14+rj()*10,h:150+rj()*150,gap:8});arc(sg*a9*.5,R);sg=-sg;}
    fil(.6*jVP,40);};
  const jMarches=()=>{jAxe(.55);let sg=phi-phi0>0?-1:1;const n=3+((rj()*2)|0),R=jRP*(2.4+rj()*.4),lm=Math.max(160,2*jVP);
    for(let k=0;k<n;k++){const a=ctrl.length-1;fil(lm,40);LEV.push({t:'marche',a:a,b:ctrl.length-1,H:-(30+rj()*15),e:.3});
      const a9=34+rj()*10;arc(sg*a9*.5,R);POSE.push({k:ctrl.length-1,s:sg,r:24+rj()*14,h:140+rj()*160,gap:8});arc(sg*a9*.5,R);sg=-sg;}};
  const jEnvers=()=>{jAxe(.6);const sg=rj()<.5?-1:1,n=30,l=Math.max(18,5.5*jVP/n);fil(Math.max(70,jVP),40);const a=ctrl.length-1;fil(n*l,l);const b=ctrl.length-1;VRI.push({a:a,b:b,sg:sg,env:1});
    for(let k=0;k<3;k++)POSE.push({k:Math.round(a+(b-a)*(.38+.12*k)),dessus:1,inv:1,r:24+rj()*12,clear:55+rj()*20,h:0,gap:8}); /* au-dessus de la route retournée, trois pics RENVERSÉS : vus la tête en bas, ils sont à l'endroit */
    fil(Math.max(70,jVP),40);}; /* LE RETOURNEMENT : un demi-tonneau, ~2 s la tête en bas en descendant, un demi-tonneau pour finir (30 pas : jamais plus de 20° de roulis entre deux points) */
  const jAscension=jPuits; /* (2026-11-12) l'escalier du ciel montait : la route descend désormais, le module rare est le puits */
  const jmJ=[jLacets,jEpingle,jSommet,jCorniche,jChicane,jDragon,jSlalom,jDefile,jCarrousel,jVrille,jColimacon,jPlongee,jBosses,jPuits,jCouloir,jMarches,jArches,jEnvers],
    JM_NOM=['lacets','épingle','sommet','corniche','chicane','dragon','slalom','défilé','carrousel','vrille','colimaçon','plongée','bosses','puits','couloir','marches','arches','retournement'],
    JM_CLE=['lacets','epingle','sommet','corniche','chicane','dragon','slalom','defile','carrousel','vrille','colimacon','plongee','bosses','puits','couloir','marches','arches','envers'],MK9=[];
  /* LE PAQUET : les signatures (slalom, vrille, colimaçon, plongée) et les autres, mélangés chacun de son côté puis entrelacés — deux signatures au moins dans les quatre premiers */
  let jmN2=jmN;const jmQ=[0,0,0];
  if(rj&&JADE_FUN){const mel=A=>{for(let i=A.length-1;i>0;i--){const j=(rj()*(i+1))|0,x9=A[i];A[i]=A[j];A[j]=x9;}return A;};
    const sig=mel(JADE_BANK.on?[6,9,10,11,14,16,17]:[6,10,11,14,16]),aut=mel([0,3,4,5,7,8,12,15]); /* (LA CHUTE) le couloir et les arches rejoignent les signatures, les marches les autres */jmPaq.length=0;
    while(sig.length||aut.length){if(sig.length)jmPaq.push(sig.shift());if(aut.length)jmPaq.push(aut.shift());}
    if((JADE_ASC.force||rj()<JADE_ASC.chance)&&jmN2>=2){jmPaq.splice(1,0,13);jmN2--;} /* le puits fait près de deux kilomètres : il compte pour deux */
    if(JADE_JMOD){const v9=JADE_JMOD.split(',').map(function(c9){return JM_CLE.indexOf(c9);}).filter(function(i9){return i9>=0&&(i9!==9||JADE_BANK.on);});
      for(let k=v9.length-1;k>=0;k--){const j9=jmPaq.indexOf(v9[k]);if(j9>=0)jmPaq.splice(j9,1);jmPaq.unshift(v9[k]);}jmN2=Math.max(jmN2,Math.min(5,v9.length));}
    jmQ[0]=Math.ceil(jmN2/3);jmQ[1]=Math.ceil((jmN2-jmQ[0])/2);jmQ[2]=jmN2-jmQ[0]-jmQ[1];}
  const troncFun=(len,H,uni)=>{const pics=GEN_V2&&uni,q=jmQ.shift()||0,np=q+(pics?1:0);if(!np){virages(len,H);return;}
    let reste=len;const part=len/(np+1);
    for(let m=0;m<np;m++){const lv=Math.min(reste,part*(.75+rj()*.5));if(lv>80){virages(lv,H);reste-=lv;}
      if(GEN_V2){const sj=(JADE_PROX?1.1+rj()*.6:1.8+rj()*.9)*jVP;droite(sj,Math.max(1,Math.round(sj/90)));reste-=sj;} /* le SOUFFLE avant chaque module (2026-11-13 : 1,1 à 1,7 s au lieu de 1,8 à 2,7) */
      const i0=ctrl.length-1;
      if(pics&&m===np-1){jPics();MK9.push('pics');MODMARK.push({i0:i0,i1:ctrl.length-1,fig:'pics'});}
      else{const m9=jmPaq.shift();if(m9==null)continue;jmJ[m9]();MK9.push(JM_NOM[m9]);MODMARK.push(m9>5?{i0:i0,i1:ctrl.length-1,fig:JM_CLE[m9]}:{i0:i0,i1:ctrl.length-1});} /* fig : un temps fort déclaré (le directeur de rythme ne compte ni le tour du colimaçon comme une spirale, ni la droite de la vrille comme un tout-droit) */
      for(let k=i0+1;k<ctrl.length;k++)reste-=ctrl[k].distanceTo(ctrl[k-1]);}
    virages(Math.max(0,reste),H);}; /* les modules prennent LEUR longueur sur le tronçon */
  let jmK=0;const tronc=(len,H,uni)=>{if(rj&&JADE_FUN){troncFun(len,H,uni);return;}const pics=GEN_V2&&rj&&uni;if(!rj||(!pics&&jmK>=jmN)){virages(len,H);return;}if(!pics)jmK++;const f=.4+rj()*.2;virages(len*f,H);
    if(GEN_V2){const sj=(1.8+rj()*.9)*jVP;droite(sj,Math.max(1,Math.round(sj/90)));} /* (v2) le SOUFFLE avant le module : une droite franche de 1,8 à 3,2 s */
    const i0=ctrl.length-1;if(pics){jPics();MK9.push('pics');MODMARK.push({i0:i0,i1:ctrl.length-1,fig:'pics'});}else{const m9=jmPaq.shift();jmJ[m9]();MK9.push(JM_NOM[m9]);MODMARK.push({i0:i0,i1:ctrl.length-1});}
    let lm=0;for(let k=i0+1;k<ctrl.length;k++)lm+=ctrl[k].distanceTo(ctrl[k-1]);virages(Math.max(0,len*(1-f)-lm),H);}; // le module prend SA longueur sur le tronçon : la vallée garde la sienne
  push();ici('depart');
  droite(bandeL(rj?220:380,jVP),4); // (2e tour) le départ plus court avec les modules · (2026-11-11) LA BANDE D'ADAPTATION : jamais sous 2 s de croisière
  tronc(tot*pa[0]/ps,humeur());monus[0]();
  tronc(tot*pa[1]/ps,humeur());monus[1]();
  tronc(tot*pa[2]/ps,humeur(),true); // (v2) le dernier tronçon porte LES TROIS PICS
  ici('chute');{const c9=700+rnd()*300;virages(LC9?chu9:c9,humeur());}droite(rj?Math.max(260,Math.min(420,3*jVP)):650,4);ici('fin');droite(150,2); /* (2026-11-05) la ligne de la fin : 3 s de croisière (260-420 m), plus 570 m */ // (v14) LA FIN : les montagnes commencent à tomber autour (jadeChute), puis la ligne droite vers l'arrivée
  // LE RELIEF : des ondes lentes tirées au hasard (pente ramenée sous celle d'origine), aplanies sous les deux monuments (la Porte et le Pont se prennent à plat)
  let ph1=rnd()*6.283,ph2=rnd()*6.283,ph3=rnd()*6.283;const L1=2600+rnd()*2400,L2=850+rnd()*900,L3=480+rnd()*360;
  let A1=35+rnd()*75,A2=10+rnd()*28,A3=rnd()<.5?5+rnd()*13:0;
  const JDESC=JADE_CHUTE.fond[0]+(rj?rj():.5)*JADE_CHUTE.fond[1]; /* (JADE SANS MER) LA DESCENTE : la pente moyenne de la vallée, vers le bas */
  {const k9=Math.min(1,.16/(6.283*(A1/L1+A2/L2+A3/L3)));A1*=k9;A2*=k9;A3*=k9;} // (sans mer) les ondes plus douces : la descente prend sa part de la pente // .30 : le pire cas de l'ancienne recette (95 m sur 3,6 km + 32 m sur 1,3 km)
  let acc=0;const sOf=[0];for(let k=1;k<ctrl.length;k++){acc+=Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z);sOf.push(acc);}
  const sDe=v=>{let bi=0,bd=1e18;for(let k=0;k<ctrl.length;k++){const d=(ctrl[k].x-v.x)**2+(ctrl[k].z-v.z)**2;if(d<bd){bd=d;bi=k;}}return sOf[bi];};
  const zones=[[sDe(Q.porte0.p)-260,sDe(Q.porte1.p)+180],[sDe(Q.pont0.p)-220,sDe(Q.pont1.p)+160],[0,300]];
  if(PICS.length)zones.push([sOf[PICS[0].a]-100,sOf[PICS[2].b]+100]); // (v2) le relief aléatoire s'aplanit autour des trois pics (comme sous la Porte et le Pont)
  /* JADE QUI SECOUE : le relief au hasard s'aplanit sous chaque module à relief (comme sous les trois pics) ; et la PLONGÉE se met au creux — les trois ondes sont calées pour être au plus bas en son milieu */
  const zJ=[];for(const v9 of LEV)zJ.push([sOf[v9.a]-80,sOf[v9.d||v9.b]+80]);for(const v9 of VRI)zJ.push([sOf[v9.a]-80,sOf[v9.b]+80]);
  for(const z9 of zJ)zones.push(z9);
  const rampe=(t,e9)=>{t=Math.max(0,Math.min(1,t));const e=e9||.2;return t<e?t*t/(2*e*(1-e)):t>1-e?1-(1-t)*(1-t)/(2*e*(1-e)):(t-e/2)/(1-e);}; /* une rampe droite, arrondie aux deux bouts : la pente ne dépasse jamais 1,25 × la moyenne */
  const brut=s9=>A1*Math.sin(s9/L1*6.283+ph1)+A2*Math.sin(s9/L2*6.283+ph2)+A3*Math.sin(s9/L3*6.283+ph3); /* (la descente JDESC s'ajoute APRÈS les paliers : ils n'aplanissent que les ondes, la route descend partout du même pas) */
  { /* (2026-11-12) LES PALIERS VOISINS : deux zones aplanies (monument, module, les trois pics) à moins de 400 m l'une de l'autre prennent le même niveau — sinon la route passait
       de l'une à l'autre en 300 m et la crête suivante s'ajoutait par-dessus (53 % mesuré au banc, graine 23 : un colimaçon juste avant les trois pics). */
    const zs=zones.slice().sort(function(a9,b9){return a9[0]-b9[0];});
    for(let k=1;k<zs.length;k++){const A9=zs[k-1],B9=zs[k];if(B9[0]-A9[1]>400)continue;B9[2]=A9[2]!=null?A9[2]:brut((A9[0]+A9[1])/2)-brut(0);}}
  for(let k=0;k<ctrl.length;k++){const s9=sOf[k];let y=brut(s9)-brut(0);
    for(const z of zones){const c=(z[0]+z[1])/2,yc=z[2]!=null?z[2]:brut(c)-brut(0),w=1-THREE.MathUtils.smoothstep(Math.abs(s9-c),(z[1]-z[0])/2,(z[1]-z[0])/2+260);y+=(yc-y)*w;}
    ctrl[k].y=y-JDESC*s9;} /* (JADE SANS MER) la descente, hors des paliers : sinon une zone aplanie de 1,3 km l'annulait et la route rattrapait 50 m en sortant (59 % mesuré, graine 20) */
  adoucirPentes(ctrl,JADE_PENTE); // les rampes vers les monuments (et les crêtes des ondes) ramenées vers ~10° — les paliers restent à plat
  for(const v9 of LEV)if(v9.t==='marche'){const sa=sOf[v9.a],sb=sOf[v9.b];for(let k=v9.a;k<ctrl.length;k++)ctrl[k].y+=v9.H*(k>=v9.b?1:rampe((sOf[k]-sa)/(sb-sa),v9.e));} /* LE COLIMAÇON : la marche reste — tout ce qui suit est plus haut (ou plus bas) ; avant le ras, qui rogne ensuite les creux des deux étages */
  JADE.ras=null;
  /* LES TROIS PICS : la hauteur de chaque crête, ajoutée après adoucirPentes et le ras (rien ne l'écrase) — une montée lissée sur la droite de 1,5 s, une descente lissée sur le virage de 50° */
  JADE.pics=null;
  if(PICS.length){const sm=(a9,b9,x)=>{const t=Math.max(0,Math.min(1,(x-a9)/(b9-a9)));return t*t*(3-2*t);};
    for(const p9 of PICS){const sa=sOf[p9.a],sc9=sOf[p9.c],sb=sOf[p9.b];for(let k=p9.a;k<=p9.b;k++){const w9=sOf[k]<=sc9?sm(sa,sc9,sOf[k]):1-sm(sc9,sb,sOf[k]);ctrl[k].y+=p9.H*w9;}p9.s=sc9;}
    JADE.pics=PICS.map(function(p9){return {s:Math.round(p9.s),H:Math.round(p9.H)};});}
  /* JADE QUI SECOUE : L'ASCENSION et LES BOSSES.
     JADE.lev : ce que ces modules ajoutent à la route, point par point — jadeBatit pose les montagnes à la hauteur d'AVANT (la crête de l'ascension passe au-dessus d'elles). */
  JADE.lev=null;
  {const LV9=[];
   for(const v9 of LEV){
     if(v9.t==='dome'){const sa=sOf[v9.a],sb=sOf[v9.b],sc9=sOf[v9.c],sd=sOf[v9.d];for(let k=v9.a;k<=v9.d;k++){const dy=v9.H*(k<=v9.b?rampe((sOf[k]-sa)/(sb-sa)):k<v9.c?1:1-rampe((sOf[k]-sc9)/(sd-sc9)));ctrl[k].y+=dy;if(dy)LV9.push([k,dy]);}}
     else if(v9.t==='bosses'){const sa=sOf[v9.a],sb=sOf[v9.b];for(let k=v9.a;k<=v9.b;k++)ctrl[k].y+=v9.H*.5*(1-Math.cos(6.2832*v9.n*(sOf[k]-sa)/(sb-sa)));}}
   if(LV9.length)JADE.lev=LV9.map(function(e9){const p9=ctrl[e9[0]];return [p9.x,p9.y,p9.z,e9[1]];});}
  for(const k in Q){const o=Q[k];let bi=0,bd=1e18;for(let j=0;j<ctrl.length;j++){const d=ctrl[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.y=ctrl[bi].y;}
  /* L'INCLINAISON (2026-11-05, voir JADE_BANK) — même recette que les dunes (genDunes) : la dalle se couche vers l'INTÉRIEUR du virage, de l'angle d'une courbure moyennée sur ±W m (deux passes) et pliée par un tanh.
     À plat : le départ (jusqu'à 250 m, plein à 650 m), la Porte du ciel et le Pont du ciel (fondu sur 260 m de part et d'autre) et la ligne d'arrivée. Les normales (une par point de contrôle) passent à buildTrack par TORD.N, sans TORD.on. */
  JADE.bankN=null;JADE.bankMax=0;
  if(JADE_BANK.on){const n=ctrl.length,sc=new Float32Array(n),kap=new Float32Array(n),hh=new Float32Array(n),sm9=(a9,b9,x)=>{const t=Math.max(0,Math.min(1,(x-a9)/(b9-a9)));return t*t*(3-2*t);};
    for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(ctrl[i].x-ctrl[i-1].x,ctrl[i].z-ctrl[i-1].z);
    for(let i=0;i<n;i++){const a9=ctrl[Math.max(0,i-1)],b9=ctrl[Math.min(n-1,i+1)];hh[i]=Math.hypot(b9.x-a9.x,b9.z-a9.z)/2||1;}
    for(let i=1;i<n-1;i++){const ax=ctrl[i].x-ctrl[i-1].x,az=ctrl[i].z-ctrl[i-1].z,bx=ctrl[i+1].x-ctrl[i].x,bz=ctrl[i+1].z-ctrl[i].z,la=Math.hypot(ax,az)||1,lb=Math.hypot(bx,bz)||1;kap[i]=Math.asin(Math.max(-1,Math.min(1,(ax*bz-az*bx)/(la*lb))))/((la+lb)/2);}
    const W9=JADE_BANK.W,lisse=a9=>{const o9=new Float32Array(n);for(let i=0;i<n;i++){let sw=0,sk=0;for(let j=i;j>=0&&sc[i]-sc[j]<W9;j--){sw+=hh[j];sk+=a9[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<W9;j++){sw+=hh[j];sk+=a9[j]*hh[j];}o9[i]=sk/sw;}return o9;};
    const kl=lisse(lisse(kap)),kref=1/(2.4*jRm);
    const iDe=k9=>{let bi=0,bd=1e18;for(let j=0;j<n;j++){const d=ctrl[j].distanceToSquared(Q[k9].p);if(d<bd){bd=d;bi=j;}}return bi;};
    const plat=[['porte0','porte1'],['pont0','pont1']].map(function(c9){const a9=sc[iDe(c9[0])],b9=sc[iDe(c9[1])];return [Math.min(a9,b9),Math.max(a9,b9)];});
    JADE.bankN=[];let mx=0;
    for(let i=0;i<n;i++){let m=sm9(250,650,sc[i])*sm9(0,400,sc[n-1]-sc[i]);
      for(const z9 of plat){const d=Math.max(z9[0]-sc[i],sc[i]-z9[1],0);m=Math.min(m,sm9(0,260,d));}
      for(const p9 of PICS)m=Math.min(m,sm9(30,130,Math.abs(sc[i]-sc[p9.c]))); /* (v2) à plat sur chaque crête : la voiture ne se couche pas sur un pic */
      let vr9=0;for(const v9 of VRI){const dv=Math.max(sc[v9.a]-sc[i],sc[i]-sc[v9.b],0);m=Math.min(m,sm9(0,110,dv));if(!dv){const t9=(sc[i]-sc[v9.a])/(sc[v9.b]-sc[v9.a]),ea=u9=>u9-Math.sin(6.2832*u9)/6.2832;vr9=v9.sg*(v9.env?(t9<.3?3.1416*ea(t9/.3):t9<.7?3.1416:3.1416+3.1416*ea((t9-.7)/.3)):6.2832*t9-.5*Math.sin(6.2832*t9));} /* env : LE RETOURNEMENT — un demi-tour en 30 %, la tête en bas 40 %, l'autre demi-tour */} /* LA VRILLE : un tour complet de la normale, doux aux deux bouts ; le dévers s'éteint 110 m avant et après */
      const b9=vr9+JADE_BANK.max*Math.tanh(kl[i]/kref)*m,a9=ctrl[Math.max(0,i-1)],c9=ctrl[Math.min(n-1,i+1)],tl=Math.hypot(c9.x-a9.x,c9.z-a9.z)||1,tx=(c9.x-a9.x)/tl,tz=(c9.z-a9.z)/tl;
      JADE.bankN.push(new THREE.Vector3(-tz*Math.sin(b9),Math.cos(b9),tx*Math.sin(b9)));if(!vr9&&Math.abs(b9)>mx)mx=Math.abs(b9);}
    JADE.bankMax=Math.round(mx*57.2958);}
  /* ===== LES FRÔLEURS (2026-11-13, Sacha : « trop de tout droit, joue avec l'environnement, la route doit exploiter la proximité avec les pics de manière créative ») =====
     Hors des modules, la route n'est plus un couloir vide : chaque virage a son pic, et chaque droite sa façon de frôler la montagne (les pics sont posés par jadeBatit à 5-10 m du bord, la règle d'or tient).
       · PIVOT   : au creux du virage, un pic planté à la corde — la route l'enroule de près ;
       · MUR     : de l'autre côté, une paroi qu'on longe, haute ;
       · PORTE   : les deux à la fois, le virage passe entre ;
       · QUINCONCE / PORTES / FALAISE / VOÛTE : les droites — un pic à gauche puis à droite, des portes de pics, une paroi continue d'un seul côté, une île (une fois sur deux renversée) qui passe au-dessus.
     Les longues droites libres sont déjà devenues des S (virages) ; ce qui reste de droite est habité. */
  if(rj&&JADE_FUN&&JADE_PROX){
    const nm=ctrl.length,hors=new Uint8Array(nm);for(const m9 of MODMARK){if(!(m9.fig==='porte'||m9.fig==='pont'||m9.fig==='pics'||POSE.some(function(o9){return o9.k>=m9.i0&&o9.k<=m9.i1;})))continue;for(let k=m9.i0;k<=m9.i1;k++)hors[k]=1;} /* seuls les monuments, les trois pics et les modules qui ont DÉJÀ leurs pics (slalom, défilé, couloir…) sont laissés tranquilles : les lacets, la corniche, la chicane, le dragon, la vrille, les bosses n'avaient aucun pic */
    const sFin=sDe(Q.chute.p)-60,dn=JADE_SOBRE?1.7:1;let np9=0;
    const peu=(k,k9)=>sOf[k]<260||sOf[k]>sFin||hors[k]||(k9!=null&&hors[k9]);
    for(const A of ARCR){if(Math.abs(A.a)<30)continue;const km=(A.i0+A.i1)>>1;if(peu(km,A.i0)||hors[A.i1])continue;
      const sg=Math.sign(A.a),lg=Math.abs(A.a)*A.R/57.2958,t=rj(),ks=lg>230*dn?[A.i0+Math.round((A.i1-A.i0)*.3),A.i0+Math.round((A.i1-A.i0)*.7)]:[km];
      for(const k of ks){
        POSE.push({k:k,s:sg,r:13+rj()*15,h:110+rj()*200,gap:4.5+rj()*3.5}); /* le PIVOT : toujours */
        if(t>=.5)POSE.push({k:k,s:-sg,r:16+rj()*14,h:150+rj()*220,gap:4+rj()*3});np9++;} /* le MUR, une fois sur deux */
      if(rj()<.4/dn)POSE.push({k:A.i1,dessus:1,inv:rj()<.5?1:0,r:18+rj()*12,clear:38+rj()*20,h:0,gap:8});}
    for(let ia=1;ia<nm-1;){ /* les droites : tant que le cap ne change pas de plus de 1,2° d'un segment à l'autre */
      const cap=k=>Math.atan2(ctrl[k+1].x-ctrl[k].x,ctrl[k+1].z-ctrl[k].z);let ib=ia;
      while(ib<nm-2&&!hors[ib+1]&&Math.abs(Math.atan2(Math.sin(cap(ib+1)-cap(ib)),Math.cos(cap(ib+1)-cap(ib))))<.021)ib++;
      const Ls=sOf[ib]-sOf[ia];
      if(Ls>=70&&!peu(ia,ib)){const gen=rj(),at=s9=>{let k=ia;while(k<ib&&sOf[k]-sOf[ia]<s9)k++;return k;},pas=(a9,b9)=>(a9+rj()*b9)*dn;
        if(gen<.35){let c9=rj()<.5?-1:1;for(let x=28;x<Ls-24;x+=pas(42,24)){POSE.push({k:at(x),s:c9,r:11+rj()*11,h:130+rj()*170,gap:4.5+rj()*3.5});c9=-c9;np9++;}} /* QUINCONCE */
        else if(gen<.6){for(let x=30;x<Ls-24;x+=pas(85,40)){const k=at(x);for(const s9 of [-1,1])POSE.push({k:k,s:s9,r:14+rj()*10,h:140+rj()*120,gap:6+rj()*3});np9++;}} /* PORTES */
        else if(gen<.8){const c9=rj()<.5?-1:1;for(let x=24;x<Ls-20;x+=pas(30,12)){POSE.push({k:at(x),s:c9,r:12+rj()*10,h:150+rj()*150,gap:4.5+rj()*2});np9++;}} /* FALAISE */
        else{const n9=Ls>260?2:1;for(let j=1;j<=n9;j++){const k=at(Ls*j/(n9+1));POSE.push({k:k,dessus:1,inv:rj()<.5?1:0,r:18+rj()*12,clear:36+rj()*22,h:0,gap:8});for(const s9 of [-1,1])POSE.push({k:k,s:s9,r:12+rj()*9,h:120+rj()*120,gap:8+rj()*3});np9++;}}} /* VOÛTE */
      ia=ib+1;}
    JADE.frol=np9;JADE.frolD=[ARCR.length,hors.reduce(function(a9,b9){return a9+b9;},0),nm,Math.round(sFin),POSE.length];}
  /* les pics voulus par les modules, en coordonnées du monde (jadeBatit) : au bord de la route (le côté s, perpendiculaire à la tangente) ou au centre d'un tour (c) */
  JADE.pose=POSE.length?POSE.map(function(o9){const p9=ctrl[o9.k];if(o9.c)return {c:1,x:o9.x,z:o9.z,R:o9.R,y:p9.y,r:o9.r,h:o9.h,bas:o9.bas||0,gap:o9.gap,sat:o9.sat||0,fond:o9.fond||0}; /* fond : son pied peut descendre sous la mer (l'ascension : le sommet doit rester sous la crête, quelle que soit la hauteur du gabarit) */
    const a9=ctrl[Math.max(0,o9.k-1)],b9=ctrl[Math.min(ctrl.length-1,o9.k+1)],l9=Math.hypot(b9.x-a9.x,b9.z-a9.z)||1,tx=(b9.x-a9.x)/l9,tz=(b9.z-a9.z)/l9;
    return {x:p9.x,z:p9.z,y:p9.y,ix:(o9.s||0)*tz,iz:-(o9.s||0)*tx,r:o9.r,h:o9.h,bas:0,gap:o9.gap,dessus:o9.dessus||0,clear:o9.clear||0,inv:o9.inv||0};}):null; /* inv : les pics du retournement et des voûtes se posent renversés (le champ n'était pas transmis) */
  JADE.vrille=VRI.length?VRI.map(function(v9){return {s0:Math.round(sOf[v9.a]),s1:Math.round(sOf[v9.b]),sens:v9.sg};}):null;
  JADE.desc=JDESC;JADE.Q=Q;JADE.mk=MK9; /* (2026-10-20) les modules de cette vallée (dbgJade().mods) */
  return ctrl;
}
// les petits volumes colorés (pins, pavillons) : un tableau de sommets + une couleur par sommet, sans index (facettes)
function jadeKit(){const P=[],C=[];
  const tri=(a,b,c,ca,cb,cc)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);C.push(ca[0],ca[1],ca[2],(cb||ca)[0],(cb||ca)[1],(cb||ca)[2],(cc||ca)[0],(cc||ca)[1],(cc||ca)[2]);};
  return {P:P,C:C,tri:tri,
    // un tronc (prisme à n pans) d'un point à un autre, rayon r0 → r1
    tube:function(a,b,r0,r1,n,col){const ax=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L9=Math.hypot(ax[0],ax[1],ax[2]);const u=[ax[0]/L9,ax[1]/L9,ax[2]/L9];
      let t=Math.abs(u[1])<.9?[0,1,0]:[1,0,0];let p=[u[1]*t[2]-u[2]*t[1],u[2]*t[0]-u[0]*t[2],u[0]*t[1]-u[1]*t[0]];const lp=Math.hypot(p[0],p[1],p[2]);p=[p[0]/lp,p[1]/lp,p[2]/lp];
      const q=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]],R=(o,rr,k)=>{const an=k/n*Math.PI*2,c9=Math.cos(an)*rr,s9=Math.sin(an)*rr;return [o[0]+p[0]*c9+q[0]*s9,o[1]+p[1]*c9+q[1]*s9,o[2]+p[2]*c9+q[2]*s9];};
      for(let k=0;k<n;k++){const a0=R(a,r0,k),a1=R(a,r0,k+1),b0=R(b,r1,k),b1=R(b,r1,k+1);tri(a0,b0,a1,col);tri(a1,b0,b1,col);}},
    // un PLATEAU d'aiguilles (lentille à n pans, bord irrégulier) : dessus clair, dessous sombre
    plateau:function(c,rx,rz,h,n,cH,cB,cR,rg){const bord=[];for(let k=0;k<n;k++){const an=k/n*Math.PI*2+rg()*.3,f=.78+rg()*.34;bord.push([c[0]+Math.cos(an)*rx*f,c[1]+(rg()-.5)*h*.5,c[2]+Math.sin(an)*rz*f]);}
      const hT=[c[0]+(rg()-.5)*rx*.2,c[1]+h,c[2]+(rg()-.5)*rz*.2],hB=[c[0],c[1]-h*.55,c[2]];
      for(let k=0;k<n;k++){const a=bord[k],b=bord[(k+1)%n];tri(hT,b,a,cH,cR,cR);tri(hB,a,b,cB,cR,cR);}},
    // une boîte (pavillons)
    boite:function(c,sx,sy,sz,col,colT){const x0=c[0]-sx/2,x1=c[0]+sx/2,y0=c[1],y1=c[1]+sy,z0=c[2]-sz/2,z1=c[2]+sz/2,T9=colT||col;
      const f=(a,b,c9,d,k)=>{tri(a,b,c9,k);tri(a,c9,d,k);};
      f([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],T9);f([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],col);f([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],col);
      f([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],col);f([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],col);},
    geo:function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aCol',new THREE.Float32BufferAttribute(C,3));g.computeBoundingSphere();return g;}};}
/* ======================= LES PICS DE JADE v4 — LES CUBES DE WUKONG (2026-10-09, Léo) =======================
   Léo, après la v3 réaliste (Wukong) : « cube et ça, mélangé ». Le mélange retenu : un MINECRAFT AUX SHADERS RÉALISTES —
   · LA FORME est en CUBES (5 m, `VX`) : les montagnes flottantes (`voxPilier` : bâties couche par couche — corniches, cannelures, profil
     qui marche au hasard — avec un DESSOUS en pointe d'escalier décentrée), la muraille de la Porte, l'arche du Pont, les rochers qui
     flottent ; touffes de FEUILLES et LIANES en cubes ; maillage glouton + occlusion aux coins (`voxMesh`), trois niveaux de détail.
   · LA MATIÈRE est celle de la v3 (`JADE_VR`) : chaque cube est un BLOC de calcaire (sa nuance à lui, un joint creusé autour, l'arête
     qui accroche la lumière), traversé par les fissures nettes, les coulées humides, la rouille, le lichen, la mousse de la roche
     réaliste ; relief au pixel, ombre de cavité, liseré de brume. L'herbe et les feuilles ont leurs verts profonds réalistes.
   · LE RESTE est réaliste : les pins du Huangshan et les lianes PEINTS, les cascades, les pagodes, la brume, les grues, le ciel.
   (v1 facettes lisses, v2 cubes « Minecraft art », v3 Wukong lisse : dans l'historique — a827c45, e18c44d, eaf6c50.) */
/* (v5, Léo : « des cubes plus petits, un peu de transparence, et joue avec la lumière : presque fantomatique ») VX 5 → 3,5 m sur l'ordi
   (5 m sur un vrai téléphone) ; la muraille de la Porte et l'arche du Pont gardent des cubes de 5 m (`VXG` : leur grille à 3,5 m pèserait
   ~5 millions de cases). */
/* (v7, Léo : « pas Minecraft » → « des cubes minuscules ») VX 3,5 → 1,75 m sur l'ordi (3,5 m sur un vrai téléphone), la muraille et l'arche
   5 → 2,5 m ; un 4e niveau de détail (1,75 · 3,5 · 7 · 14 m) garde le coût : les petits cubes ne se dessinent que de près. */
const VX=TEL_NATIF?3.5:1.75,VXG=TEL_NATIF?5:2.5;
/* (2026-10-24, Sacha : « réduire la map jade sur mobile : moins de montagnes, plus d'animaux ni de nuages, et le reste ») JADE_SOBRE : sur téléphone, la vallée est allégée — montagnes ÷2, ni singes, ni dauphins, ni grues, ni nuages, ni rayons, ni lucioles, moins de rochers flottants, de cascades et de brume. `?jadeplein=1` rend la vallée d'avant. L'ordi n'est pas touché. */
const JADE_SOBRE=mapsSobres()&&!/[?&]jadeplein=1\b/.test(location.search); /* (2026-11-08) mapsSobres : le téléphone RÉCENT retrouve la vallée pleine (voir LES MAPS PLEINES) */
const JADE_NUVOX=!/[?&]nuvox=0\b/.test(location.search); // (v13) les volutes en cubes — `?nuvox=0` : les panneaux en relief de la v9
 // (v10) les montagnes en VITRAIL (voir « LE VITRAIL ») — (v11, Léo : « laisse tomber, reviens sur les pixels, c'était plus joli ») : seulement avec `?vitrail=1`
const JM={roche:1,rouille:2,herbe:3,feuille:4,bois:5,laque:6,tuile:7,or:8,pierre:9};
const JADE_TPL=[[10,190,1],[14,250,0],[16,220,3],[18,300,2],[23,350,3],[26,330,1],[29,400,0],[36,440,2],[45,490,1],[56,540,3]]; // rayon (m), hauteur (m), sorte : 0 colonne · 1 aiguille · 2 gradins · 3 tête large
const JADE_NTPL=JADE_TPL.length;
function rocNoise2(sd){return function(a,b){const i=Math.floor(a),j=Math.floor(b),fa=a-i,fb=b-j,h=(x,y)=>{const s=Math.sin(x*127.1+y*311.7+sd)*43758.5453;return s-Math.floor(s);};
  const u=fa*fa*(3-2*fa),w=fb*fb*(3-2*fb);return (h(i,j)*(1-u)+h(i+1,j)*u)*(1-w)+(h(i,j+1)*(1-u)+h(i+1,j+1)*u)*w;};}
function voxG(nx,ny,nz){return {nx:nx,ny:ny,nz:nz,d:new Uint8Array(nx*ny*nz)};}
function voxAt(G,x,y,z){return (x<0||y<0||z<0||x>=G.nx||y>=G.ny||z>=G.nz)?0:G.d[x+G.nx*(z+G.nz*y)];}
/* LE MAILLAGE GLOUTON — pour chaque axe et chaque sens, plan par plan : un masque des faces (matière + ombre des 4 coins), puis les plus
   grands rectangles identiques. Sortie : position (en cubes), normale, aM (matière), aAO (0 = coin enfoui, 1 = à l'air). */
/* (2026-10-13, passe perf « le JOUER qui gèle ») MÊME maillage, au bit près (banc test-vox : grilles au hasard avec cases fantômes, les
   13 gabarits, des montagnes au hasard, la grille de la Porte ; et l'empreinte de la carte), ~4× plus vite. MESURÉ : le masque et la passe
   gloutonne balayaient chaque plan EN ENTIER — 6 × le volume de la grille (20 M de cases pour la plus grande montagne, 80 M pour la Porte),
   dont quelques % portent une face, chaque case par voxAt et des tableaux créés à la volée. Désormais :
   · un premier passage relève, pour chaque rang de chaque plan, sa première et sa dernière case pleine ;
   · chaque TRANCHE (le long de chaque axe) est lue UNE fois en INTERVALLES par rang : les cases pleines (S) et celles qui portent des faces
     (F : pleines et pas fantômes) ;
   · un plan ne regarde que F(dedans) \ S(dehors) — les faces de bord, avec l'ombre de leurs coins — et, sur un plan intérieur, F ∩ S rempli
     d'un trait ; la passe gloutonne ne parcourt que ces intervalles (même ordre, mêmes rectangles : le masque est vide partout ailleurs) ;
   · les cases lues à plat (bornes testées au bord seulement), aucun tableau créé par case ni par face, sorties en tampons typés.
   LES TRANCHES : voxMeshG, voxPilierG, colMeshG… sont des GÉNÉRATEURS qui rendent la main dès que l'échéance JF.lim est passée — Infinity
   d'ordinaire (ils vont d'une traite : `jadeFini`, exactement comme avant), quelques ms quand la carte se prépare AU MENU (jadeFondTick). */
const JF={lim:Infinity};
function jadeFini(it){let r;do{r=it.next();}while(!r.done);return r.value;} // un générateur mené d'un trait
const VOXM={P:null,N:null,M:null,A:null,I:null,pris:false};
function voxMesh(G,inner){return jadeFini(voxMeshG(G,inner));}
function* voxMeshG(G,inner){ // inner : une face INTÉRIEURE (matière 10) tous les `inner` cubes, entre deux cubes pleins — on la voit à travers le verre
  const nx=G.nx,ny=G.ny,nz=G.nz,dims=[nx,ny,nz],ST=[1,nx*nz,nx],GD=G.d,INN=10|(255<<8)|(1<<20),NUL=(3<<8)|(3<<10)|(3<<12)|(3<<14)|(1<<20),q=[0,0,0];
  const own=!VOXM.pris;if(own)VOXM.pris=true; // les tampons de sortie partagés (un maillage suspendu en tranche garde les siens)
  try{
  let P=own&&VOXM.P||new Float32Array(3<<14),Nm=own&&VOXM.N||new Int8Array(3<<14),Ma=own&&VOXM.M||new Uint8Array(1<<14),Ao=own&&VOXM.A||new Uint8Array(1<<14),I=own&&VOXM.I||new Uint32Array(3<<14),nv4=0,ni=0;
  // L'ÉTENDUE DES RANGS : pour l'axe d, le plan c et le rang j (le long de v), la première et la dernière case non vide le long de u
  const LO=[new Int32Array(nx*nz).fill(1<<30),new Int32Array(ny*nx).fill(1<<30),new Int32Array(nz*ny).fill(1<<30)],HI=[new Int32Array(nx*nz).fill(-1),new Int32Array(ny*nx).fill(-1),new Int32Array(nz*ny).fill(-1)];
  {const L0=LO[0],H0=HI[0],L1=LO[1],H1=HI[1],L2=LO[2],H2=HI[2];let k=0;
   for(let y=0;y<ny;y++){if(performance.now()>JF.lim)yield;for(let z=0;z<nz;z++)for(let x=0;x<nx;x++,k++)if(GD[k]){ // d=0 : plan x, rang z, le long de y · d=1 : plan y, rang x, le long de z · d=2 : plan z, rang y, le long de x
     const a=x*nz+z,b=y*nx+x,c=z*ny+y;if(L0[a]>y)L0[a]=y;H0[a]=y;if(L1[b]>z)L1[b]=z;H1[b]=z;if(L2[c]>x)L2[c]=x;H2[c]=x;}}}
  let RS=new Int32Array(4096),RF=new Int32Array(4096),CA=new Int32Array(4096);
  const grand9=(A,n)=>{const B=new Int32Array(Math.max(n,A.length*2));B.set(A);return B;};
  for(let d=0;d<3;d++){const u=(d+1)%3,v=(d+2)%3,nu=dims[u],nv=dims[v],nd=dims[d],sd=ST[d],su=ST[u],sv=ST[v],mask=new Int32Array(nu*nv),Ld=LO[d],Hd=HI[d];
    // LES INTERVALLES de chaque rang de chaque tranche : S (cases pleines) et F (pleines, pas fantômes), [a, b) le long de u
    const OS=new Int32Array(nd*nv+1),OF=new Int32Array(nd*nv+1);let nS=0,nF=0;
    for(let c=0;c<nd;c++){if(performance.now()>JF.lim)yield;
      for(let j=0;j<nv;j++){const r=c*nv+j,ia=Ld[r],ib=Hd[r];OS[r]=nS;OF[r]=nF;if(ia>ib)continue;
        if(nS+2*(ib-ia+2)>RS.length)RS=grand9(RS,nS+2*(ib-ia+2));if(nF+2*(ib-ia+2)>RF.length)RF=grand9(RF,nF+2*(ib-ia+2));
        let s0=-1,f0=-1,k=c*sd+j*sv+ia*su;
        for(let i=ia;i<=ib;i++,k+=su){const m=GD[k];
          if(m){if(s0<0)s0=i;}else if(s0>=0){RS[nS++]=s0;RS[nS++]=i;s0=-1;}
          if(m&&m!==255){if(f0<0)f0=i;}else if(f0>=0){RF[nF++]=f0;RF[nF++]=i;f0=-1;}}
        if(s0>=0){RS[nS++]=s0;RS[nS++]=ib+1;}if(f0>=0){RF[nF++]=f0;RF[nF++]=ib+1;}}}
    OS[nd*nv]=nS;OF[nd*nv]=nF;
    const OC=new Int32Array(nv+1);
    for(const sg of [1,-1])for(let x=0;x<=nd;x++){
      const xi=sg>0?x-1:x,xo=sg>0?x:x-1;if(xi<0||xi>=nd)continue; // le plan des cases hors de la grille : aucune face
      if(performance.now()>JF.lim)yield;
      const okO=xo>=0&&xo<nd,dO=(xo-xi)*sd,inn=inner&&sg>0&&x%inner===0?INN:0,rI=xi*nv,rO=okO?xo*nv:0;let nC=0;
      // LE MASQUE : les faces de bord F(dedans) \ S(dehors), une à une (l'ombre de leurs coins) ; sur un plan intérieur, F ∩ S d'un trait
      for(let j=0;j<nv;j++){if((j&63)===63&&performance.now()>JF.lim)yield;OC[j]=nC;let fa=OF[rI+j];const fb=OF[rI+j+1];if(fa===fb)continue;
        let sa=okO?OS[rO+j]:0;const sb=okO?OS[rO+j+1]:0,jD=j>0,jU=j<nv-1,base9=j*nu;
        if(nC+(fb-fa)*2+4>CA.length)CA=grand9(CA,nC+(fb-fa)*2+4);
        if(inn){for(let t=fa;t<fb;t+=2){CA[nC++]=RF[t];CA[nC++]=RF[t+1];}} // un plan intérieur : la passe gloutonne parcourt tout F
        for(;fa<fb;fa+=2){let a=RF[fa];const b=RF[fa+1];
          while(sa<sb&&RS[sa+1]<=a)sa+=2;
          for(let t=sa;a<b;t+=2){const c0=t<sb?Math.min(b,Math.max(a,RS[t])):b,c1=t<sb?Math.min(b,RS[t+1]):b; // [a, c0) : du bord (rien dehors) · [c0, c1) : plein dehors
            if(c0>a){if(!inn){CA[nC++]=a;CA[nC++]=c0;}
              let n=base9+a,k=xi*sd+j*sv+a*su;
              for(let i=a;i<c0;i++,n++,k+=su){const m=GD[k];
                if(!okO){mask[n]=m|NUL;continue;}               // la voisine dehors est hors de la grille : rien autour, les 4 coins à l'air
                const ko=k+dO,iL=i>0,iR=i<nu-1; // l'ombre des 4 coins (−1,−1) (1,−1) (1,1) (−1,1) : le côté u, le côté v, la diagonale — dans le plan du dehors
                const Lf=iL&&GD[ko-su]?1:0,Rt=iR&&GD[ko+su]?1:0,Dn=jD&&GD[ko-sv]?1:0,Up=jU&&GD[ko+sv]?1:0;
                mask[n]=m|((Lf&&Dn?0:3-(Lf+Dn+(iL&&jD&&GD[ko-su-sv]?1:0)))<<8)|((Rt&&Dn?0:3-(Rt+Dn+(iR&&jD&&GD[ko+su-sv]?1:0)))<<10)
                         |((Rt&&Up?0:3-(Rt+Up+(iR&&jU&&GD[ko+su+sv]?1:0)))<<12)|((Lf&&Up?0:3-(Lf+Up+(iL&&jU&&GD[ko-su+sv]?1:0)))<<14)|(1<<20);}}
            if(c1>c0&&inn)mask.fill(INN,base9+c0,base9+c1);
            a=Math.max(a,c1);if(t>=sb)break;}}}
      OC[nv]=nC;
      // LA PASSE GLOUTONNE — seulement sur ces intervalles (le masque est vide ailleurs, et il ressort vide : chaque case est mangée)
      for(let j=0;j<nv;j++){if((j&63)===63&&performance.now()>JF.lim)yield;for(let t=OC[j],te=OC[j+1];t<te;t+=2){const ib=CA[t+1];let i=CA[t],n=j*nu+i;
        while(i<ib){const c=mask[n];if(!c){i++;n++;continue;}
          let w=1;while(i+w<nu&&mask[n+w]===c)w++;
          let h=1;grand:while(j+h<nv){for(let k=0,o=n+h*nu;k<w;k++)if(mask[o+k]!==c)break grand;h++;}
          if(nv4+4>Ma.length){const k2=Ma.length*2,g9=(A,k)=>{const B=new A.constructor(k);B.set(A);return B;};P=g9(P,k2*3);Nm=g9(Nm,k2*3);Ma=g9(Ma,k2);Ao=g9(Ao,k2);if(own){VOXM.P=P;VOXM.N=Nm;VOXM.M=Ma;VOXM.A=Ao;}}
          if(ni+6>I.length){const B=new Uint32Array(I.length*2);B.set(I);I=B;if(own)VOXM.I=B;}
          const base=nv4,m=c&255,a0=(c>>8)&3,a1=(c>>10)&3,a2=(c>>12)&3,a3=(c>>14)&3;
          for(let k=0;k<4;k++){q[d]=x;q[u]=k===1||k===2?i+w:i;q[v]=k>=2?j+h:j;const o=nv4*3;P[o]=q[0];P[o+1]=q[1];P[o+2]=q[2];Nm[o]=d===0?sg:0;Nm[o+1]=d===1?sg:0;Nm[o+2]=d===2?sg:0;Ma[nv4]=m;Ao[nv4]=k===0?a0:k===1?a1:k===2?a2:a3;nv4++;}
          if(a0+a2<a1+a3){if(sg>0){I[ni]=base+1;I[ni+1]=base+2;I[ni+2]=base+3;I[ni+3]=base+1;I[ni+4]=base+3;I[ni+5]=base;}else{I[ni]=base+1;I[ni+1]=base+3;I[ni+2]=base+2;I[ni+3]=base+1;I[ni+4]=base;I[ni+5]=base+3;}} // la diagonale suit l'ombre (sinon un coin sombre s'étire en losange)
          else if(sg>0){I[ni]=base;I[ni+1]=base+1;I[ni+2]=base+2;I[ni+3]=base;I[ni+4]=base+2;I[ni+5]=base+3;}else{I[ni]=base;I[ni+1]=base+2;I[ni+2]=base+1;I[ni+3]=base;I[ni+4]=base+3;I[ni+5]=base+2;}
          ni+=6;
          for(let l=0;l<h;l++)mask.fill(0,n+l*nu,n+l*nu+w);
          i+=w;n+=w;}}}}}
  if(performance.now()>JF.lim)yield;
  const g=new THREE.BufferGeometry(),Ao9=new Float32Array(nv4),A3=[0,1/3,2/3,1];for(let k=0;k<nv4;k++)Ao9[k]=A3[Ao[k]]; // (a/3 : les mêmes flottants)
  g.setAttribute('position',new THREE.BufferAttribute(P.slice(0,nv4*3),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(Nm.subarray(0,nv4*3)),3));
  g.setAttribute('aM',new THREE.BufferAttribute(new Float32Array(Ma.subarray(0,nv4)),1));g.setAttribute('aAO',new THREE.BufferAttribute(Ao9,1));
  g.setIndex(nv4>65535?new THREE.BufferAttribute(I.slice(0,ni),1):new THREE.BufferAttribute(new Uint16Array(I.subarray(0,ni)),1));g.computeBoundingSphere();
  return g;
  }finally{if(own)VOXM.pris=false;}
}
function* voxDemiG(G){const H=voxG(Math.ceil(G.nx/2),Math.ceil(G.ny/2),Math.ceil(G.nz/2)),gx=G.nx,gy=G.ny,gz=G.nz,D=G.d,Fe=JM.feuille,He=JM.herbe,Ro=JM.rouille; // (perf) mêmes cases, lues à plat
  for(let y=0;y<H.ny;y++){if(performance.now()>JF.lim)yield;for(let z=0;z<H.nz;z++)for(let x=0;x<H.nx;x++){let n=0,v=0,r=0;
    for(let k=0;k<8;k++){const X=2*x+(k&1),Y=2*y+((k>>1)&1),Z=2*z+(k>>2);if(X>=gx||Y>=gy||Z>=gz)continue;const m=D[X+gx*(Z+gz*Y)];if(m){n++;if(m===Fe||m===He)v++;else if(m===Ro)r++;}}
    if(n>=3)H.d[x+H.nx*(z+H.nz*y)]=v>=2?JM.herbe:r>=3?JM.rouille:JM.roche;}}
  return H;}
/* UNE MONTAGNE FLOTTANTE EN CUBES — R : rayon moyen, H : hauteur (en cubes) ; kind : 0 colonne · 1 aiguille · 2 gradins · 3 tête large.
   Le DESSOUS (Hb, ~30 % de la hauteur) : des tranches d'un ou deux cubes qui rétrécissent en escalier vers une pointe décentrée. */
function voxPilier(R,H,kind,graine){return jadeFini(voxPilierG(R,H,kind,graine));}
function* voxPilierG(R,H,kind,graine){
  const rg=mulberry32(graine),M=2*Math.ceil((R*1.55+2)/2),N=2*M,G=voxG(N,H+5,N);
  const harm=[];for(let k=2;k<=5;k++)harm.push([k,(.05+rg()*.11)*(k===2?1.35:1),rg()*6.283]);
  const can=[];for(let k=0,nc=2+((rg()*2.6)|0);k<nc;k++)can.push([rg()*6.283,.18+rg()*.2,.22+rg()*.2]); // les CANNELURES
  const tr=[];for(let k=0,nt=1+((rg()*2.4)|0);k<nt;k++)tr.push([rg()*6.283,.12+rg()*.14,(.4+rg()*.55)*H,(.15+rg()*.3)*H]); // les TRAÎNÉES de rouille
  const Hb=Math.max(3,Math.round(H*(.26+rg()*.12))),bA=rg()*6.283,bK=.22+rg()*.3;
  /* (2026-10-13, passe perf) LE CONTOUR ENCADRÉ — les mêmes cases au bit près (banc test-vox), sans les cosinus là où c'est sûr : f(angle) est
     encadré globalement (1 ± les harmoniques, moins toutes les cannelures) et par SECTEUR d'angle (256 : harmoniques et cannelures sont
     lipschitziennes — au milieu du secteur ± la pente × la demi-largeur, marges comprises) ; une case nettement dehors ou dedans est tranchée
     d'emblée, près du bord le calcul exact d'avant, au même angle. */
  let fHi=1,fLo=1;for(const hq of harm){fHi+=hq[1];fLo-=hq[1];}for(const c of can)fLo-=c[2];
  const NS=256,WS=6.283185307179586/NS,SH=new Float64Array(NS),SL=new Float64Array(NS);
  {const h=WS/2*1.000001+1e-9;for(let s9=0;s9<NS;s9++){const am=-Math.PI+(s9+.5)*WS;let b9=1,hv=0,cLo=0,cHi=0;
     for(const hq of harm){b9+=hq[1]*Math.cos(hq[0]*am+hq[2]);hv+=hq[1]*hq[0]*h;}
     for(const c of can){const da=Math.abs(((am-c[0])%6.2832+9.4248)%6.2832-3.1416),S0=da<c[1]?c[2]*(1-da/c[1]):0,dv=c[2]/c[1]*h;cLo+=Math.max(0,S0-dv);cHi+=Math.min(c[2],S0+dv);}
     SH[s9]=b9+hv-cLo+1e-9;SL[s9]=b9-hv-cHi-1e-9;}}
  let y=0,cx=M,cz=M,rw=0;const LY=[]; // les COUCHES, gardées pour les cubes fins (voxPilierFin)
  while(y<H){if(performance.now()>JF.lim)yield;const bas=y<Hb,h=bas?1+((rg()*1.6)|0):2+((rg()*5)|0),v=(y+h/2)/H;
    rw=rw*.6+(rg()-.5)*.17;let s;
    if(kind===0)s=1+rw;else if(kind===1)s=1.14-.44*v+rw*.6;else if(kind===2)s=(((y/3)|0)%2?.82:1)+rw*.5;else s=.86+.34*v*v+rw*.5;
    let ox=0,oz=0;
    if(bas){const t=Math.min(1,(y+h/2)/Hb);s*=Math.pow(t,.62)*(.82+.18*t);const k9=(1-t)*(1-t)*bK*R;ox=Math.cos(bA)*k9;oz=Math.sin(bA)*k9;} // la POINTE, décentrée
    else{cx=Math.max(M-R*.25,Math.min(M+R*.25,cx+(rg()-.5)*.7));cz=Math.max(M-R*.25,Math.min(M+R*.25,cz+(rg()-.5)*.7));}
    const rr=Math.max(bas?.55:1.15,R*s),y1=Math.min(H,y+h);LY.push([y,y1,cx+ox,cz+oz,rr,bas?1:0]);
    const dOut=rr*fHi*1.000001,dIn=fLo>0?rr*fLo*.999999:-1;
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){const dx=i+.5-cx-ox,dz=j+.5-cz-oz,d=Math.hypot(dx,dz);if(d>dOut)continue;
      if(d>=dIn){const an=Math.atan2(dz,dx);let s9=((an+Math.PI)/WS)|0;if(s9>=NS)s9=NS-1;else if(s9<0)s9=0;
        if(d>rr*SH[s9]*1.000001+1e-9)continue; // nettement dehors
        if(!(d<rr*SL[s9]*.999999-1e-9)){ // ni nettement dedans : le contour exact
          let f=1;for(const hq of harm)f+=hq[1]*Math.cos(hq[0]*an+hq[2]);
          for(const c of can){const da=Math.abs(((an-c[0])%6.2832+9.4248)%6.2832-3.1416);if(da<c[1])f-=c[2]*(1-da/c[1]);}
          if(!(d<rr*f))continue;}}
      for(let yy=y;yy<y1;yy++)G.d[i+N*(j+N*yy)]=JM.roche;}
    y=y1;}
  // LA ROUILLE en coulées sur la peau
  const D9=G.d,NN=N*N,AN=new Float64Array(NN);for(let i=0;i<N;i++)for(let j=0;j<N;j++)AN[i+N*j]=Math.atan2(j+.5-M,i+.5-M); // (perf) les mêmes passes, lues à plat (voxAt sans bornes là où la case est forcément dans la grille)
  for(let yy=0;yy<H;yy++){if(!(yy&15)&&performance.now()>JF.lim)yield;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k0=i+N*(j+N*yy);if(D9[k0]!==JM.roche)continue;
    if((i+1<N&&D9[k0+1])&&(i>0&&D9[k0-1])&&(j+1<N&&D9[k0+N])&&(j>0&&D9[k0-N]))continue;
    const an=AN[i+N*j];
    for(const t of tr){const da=Math.abs(((an-t[0])%6.2832+9.4248)%6.2832-3.1416);if(da<t[1]&&yy<t[2]&&yy>t[2]-t[3]&&rg()<.9){D9[k0]=JM.rouille;break;}}}}
  // LA VIE : l'herbe sur ce qui regarde le ciel, des touffes de feuilles, des buissons accrochés ; dessous, des LIANES de feuilles qui pendent
  const tops=[],cor=[],des=[];
  if(performance.now()>JF.lim)yield;
  for(let yy=Hb;yy<H;yy++)for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k0=i+N*(j+N*yy),m=D9[k0];if(!m||D9[k0+NN])continue;
    D9[k0]=JM.herbe;(yy>=H-1?tops:cor).push([i,yy,j]);}
  // (v7) plus de touffes, de buissons ni de lianes EN CUBES (c'était le Minecraft) : la forêt et les lianes sont peintes (jadeArbresTex)
  for(let yy=1;yy<Math.min(H,Hb+4);yy++)for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k0=i+N*(j+N*yy),m=D9[k0];if(m!==JM.roche&&m!==JM.rouille)continue;if(D9[k0-NN])continue;
    des.push([i,yy,j]);} // les dessous, d'où pendent les lianes peintes
  let yTop=0,rmax=0;for(let i=0;i<N;i++)for(let j=0;j<N;j++){let yh=-1;for(let yy=G.ny-1;yy>=0;yy--)if(D9[i+N*(j+N*yy)]){yh=yy;break;} // la colonne : sa case pleine la plus haute
    if(yh>=0){yTop=Math.max(yTop,yh+1);rmax=Math.max(rmax,Math.hypot(i+.5-M,j+.5-M)+.71);}}
  if(performance.now()>JF.lim)yield;
  const G1=(yield* voxDemiG(G)),G2=(yield* voxDemiG(G1)),G3=(yield* voxDemiG(G2));
  const geo=[yield* voxMeshG(G,4),yield* voxMeshG(G1,2),yield* voxMeshG(G2,1),yield* voxMeshG(G3)];
  return {G:G,M:M,H:H,Hb:Hb,yTop:yTop,rmax:rmax,N:N,ly:LY,harm:harm,can:can,tr:tr,graine:graine,tops:tops.filter(function(c){return !voxAt(G,c[0],c[1]+1,c[2]);}),cor:cor.filter(function(c){return !voxAt(G,c[0],c[1]+1,c[2]);}),des:des,
    geo:geo}; // les plans intérieurs tous les 7 m à chaque niveau (le verre garde la même teinte) — en vitrail : la peau et le cœur lisses (jadeLisse) // les plans intérieurs tous les 7 m à chaque niveau (le verre garde la même teinte) — en vitrail : la peau et le cœur lisses (jadeLisse)
}
/* ---- LES CUBES MINUSCULES (v8, Léo : « trois fois plus petit ») — un niveau de détail de PLUS, de près seulement (≤ FIN.D de la caméra) :
   des cubes de VX/3 (58 cm sur l'ordi). Une grille pleine à ce pas pèserait ~250 millions de cases : la montagne est donc relue telle
   qu'elle a été bâtie, COUCHE PAR COUCHE (`T9.ly` : hauteurs, centre, rayon ; harmoniques et cannelures du gabarit), chaque couche
   redécoupée en sous-couches de 1 à 3 cubes fins qui avancent ou reculent d'un cube (des corniches fines), son contour tracé en polygone
   puis balayé rang par rang (des INTERVALLES). Les faces se lisent sur ces intervalles — bouts de rang = faces ±x, écarts entre deux rangs
   = faces ±z, écarts entre deux sous-couches = dessus / dessous — fusionnées le long du rang et dans la hauteur ; plans intérieurs tous
   les 12 cubes fins (7 m, comme aux autres niveaux). La roche DURE (les chocs) reste celle des cubes de 1,75 m (`T9.G`). ---- */
const FIN={on:!TEL_NATIF,k:3,D:130,near:[],sig:0,fam:[],tpl:null,veut:new Set(),job:null,dans:new Set(),mats:new Map()};
const FIN_VIDE=[];
function finDiff(A,B){if(!B.length||!A.length)return A.length?A:FIN_VIDE;const o=[];let j=0; // A \ B (listes d'intervalles [a,b, a,b…] triés)
  for(let k=0;k<A.length;k+=2){let a=A[k];const b=A[k+1];while(j<B.length&&B[j+1]<=a)j+=2;
    for(let jj=j;jj<B.length&&B[jj]<b;jj+=2){if(B[jj]>a)o.push(a,B[jj]);a=Math.max(a,B[jj+1]);}
    if(a<b)o.push(a,b);}
  return o;}
function finInter(A,B){if(!A.length||!B.length)return FIN_VIDE;const o=[];let i=0,j=0;
  while(i<A.length&&j<B.length){const a=Math.max(A[i],B[j]),b=Math.min(A[i+1],B[j+1]);if(a<b)o.push(a,b);if(A[i+1]<B[j+1])i+=2;else j+=2;}return o;}
function* voxPilierFin(T9){ // un GÉNÉRATEUR : il rend la main après chaque couche (finTravail le fait avancer quelques ms par image)
  const K=FIN.k,N=T9.N*K,rg=mulberry32((T9.graine^0xF1E5)>>>0),HbF=T9.Hb*K;
  const fh=[];for(let k=7;k<=12;k++)fh.push([k,.006+rg()*.012,rg()*6.283]); // le contour FIN (en plus de celui du gabarit)
  const P=[],Nm=[],Ma=[],I=[],q=[0,0,0];
  const quad=(d,sg,x,u0,u1,v0,v1,m)=>{const u=(d+1)%3,v=(d+2)%3,b=P.length/3;
    q[d]=x;q[u]=u0;q[v]=v0;P.push(q[0],q[1],q[2]);q[u]=u1;P.push(q[0],q[1],q[2]);q[v]=v1;P.push(q[0],q[1],q[2]);q[u]=u0;P.push(q[0],q[1],q[2]);
    const nx=d===0?sg:0,ny=d===1?sg:0,nz=d===2?sg:0;for(let k=0;k<4;k++){Nm.push(nx,ny,nz);Ma.push(m);}
    if(sg>0)I.push(b,b+1,b+2,b,b+2,b+3);else I.push(b,b+2,b+1,b,b+3,b+2);};
  const contour=(cx,cz,rr)=>{ // le contour d'une sous-couche (en cubes fins) → ses rangs d'intervalles
    const na=Math.max(24,Math.min(1440,Math.ceil(6.2832*rr/1.1))),X=new Float32Array(na),Z=new Float32Array(na);let zmin=1e9,zmax=-1e9;
    for(let k=0;k<na;k++){const an=k/na*6.2832;let f=1;for(const h of T9.harm)f+=h[1]*Math.cos(h[0]*an+h[2]);for(const h of fh)f+=h[1]*Math.cos(h[0]*an+h[2]);
      for(const c of T9.can){const da=Math.abs(((an-c[0])%6.2832+9.4248)%6.2832-3.1416);if(da<c[1])f-=c[2]*(1-da/c[1]);}
      const r=Math.max(0,rr*f);X[k]=cx+Math.cos(an)*r;Z[k]=cz+Math.sin(an)*r;if(Z[k]<zmin)zmin=Z[k];if(Z[k]>zmax)zmax=Z[k];}
    const j0=Math.max(0,Math.ceil(zmin-.5)),j1=Math.min(N,Math.ceil(zmax-.5)),xs=[];for(let j=j0;j<j1;j++)xs.push([]);
    for(let k=0;k<na;k++){const k2=k+1===na?0:k+1,za=Z[k],zb=Z[k2];if(za===zb)continue;const lo=Math.min(za,zb),hi=Math.max(za,zb);
      for(let j=Math.max(j0,Math.ceil(lo-.5)),je=Math.min(j1,Math.ceil(hi-.5));j<je;j++)xs[j-j0].push(X[k]+(j+.5-za)/(zb-za)*(X[k2]-X[k]));}
    return {j0:j0,R:xs.map(function(a){a.sort(function(u,w){return u-w;});const o=[];
      for(let k=0;k+1<a.length;k+=2){const u=Math.max(0,Math.ceil(a[k]-.5)),w=Math.min(N,Math.ceil(a[k+1]-.5));if(w>u){if(o.length&&o[o.length-1]>=u)o[o.length-1]=Math.max(o[o.length-1],w);else o.push(u,w);}}return o;})};};
  const row=(S,j)=>{if(!S)return FIN_VIDE;const k=j-S.j0;return k>=0&&k<S.R.length?S.R[k]:FIN_VIDE;};
  const plaque=(ja,jb,fr,Y,sg,m)=>{const op=new Map(),vu=new Set(); // les rectangles d'une région horizontale, fusionnés d'un rang au suivant
    for(let j=ja;j<=jb;j++){const r=j<jb?fr(j):FIN_VIDE;vu.clear();
      for(let k=0;k<r.length;k+=2){const key=r[k]*8192+r[k+1];vu.add(key);if(!op.has(key))op.set(key,j);}
      for(const [key,j0] of op)if(!vu.has(key)){quad(1,sg,Y,j0,j,Math.floor(key/8192),key%8192,m);op.delete(key);}}};
  const rouille=(x,z,cx,cz,y)=>{const an=Math.atan2(z-cz,x-cx),yC=y/K;
    for(const t of T9.tr){const da=Math.abs(((an-t[0])%6.2832+9.4248)%6.2832-3.1416);if(da<t[1]&&yC<t[2]&&yC>t[2]-t[3])return 2;}return 1;};
  const op=new Map(),vu=new Set(); // les faces VERTICALES ouvertes (elles montent tant que la sous-couche suivante les a aussi)
  const cle=(dd,s9,pl,a,b,m)=>((((dd*3+s9)*4096+pl)*4096+a)*4096+b)*16+m;
  const ouvre=(key,d,sg,pl,a,b,m,y)=>{vu.add(key);if(!op.has(key))op.set(key,[y,d,sg,pl,a,b,m]);};
  const ferme=y=>{for(const [key,o] of op)if(!vu.has(key)){if(o[1]===0)quad(0,o[2],o[3],o[0],y,o[4],o[5],o[6]);else quad(2,o[2],o[3],o[4],o[5],o[0],y,o[6]);op.delete(key);}vu.clear();};
  const runs=new Map();
  let prev=null,y=0,dr=0,cw=0,cv=0;
  for(const ly of T9.ly){const yb0=ly[1]*K;y=ly[0]*K;
    while(y<yb0){const h=Math.min(yb0-y,ly[5]?1+((rg()*2)|0):1+((rg()*3)|0)),yb=y+h;
      if(rg()<.5){dr=(rg()-.5)*(ly[5]?.9:1.8);cw=(rg()-.5)*.5;cv=(rg()-.5)*.5;} // la corniche fine : la sous-couche avance ou recule d'un cube
      const cx=ly[2]*K+cw,cz=ly[3]*K+cv,S=contour(cx,cz,Math.max(.7,ly[4]*K+dr));
      const ja=Math.min(S.j0,prev?prev.j0:S.j0),jb=Math.max(S.j0+S.R.length,prev?prev.j0+prev.R.length:0);
      plaque(ja,jb,function(j){return finDiff(row(S,j),row(prev,j));},y,-1,1);                       // les DESSOUS
      if(prev)plaque(ja,jb,function(j){return finDiff(row(prev,j),row(S,j));},y,1,y>=HbF?JM.herbe:1);  // les DESSUS (la mousse au-dessus du pied)
      for(let Y=Math.ceil(Math.max(y,1)/12)*12;Y<yb;Y+=12){if(Y===y){if(prev)plaque(ja,jb,function(j){return finInter(row(S,j),row(prev,j));},Y,1,10);}
        else plaque(S.j0,S.j0+S.R.length,function(j){return row(S,j);},Y,1,10);}                     // les plans intérieurs horizontaux
      // les faces ±x (les bouts de rang, fusionnés le long de z) et les plans intérieurs x
      runs.clear();const jE=S.j0+S.R.length;
      const sortRun=(k2,o)=>{const s9=Math.floor(k2/4096),pl=k2%4096,m=s9===2?10:rouille(pl,(o[0]+o[1]+1)/2,cx,cz,(y+yb)/2);ouvre(cle(0,s9,pl,o[0],o[1]+1,m),0,s9===0?-1:1,pl,o[0],o[1]+1,m,y);};
      for(let j=S.j0;j<jE;j++){const r=row(S,j);
        for(let k=0;k<r.length;k+=2){const a=r[k],b=r[k+1];
          for(const k2 of [a,4096+b]){const o=runs.get(k2);if(o&&o[1]===j-1)o[1]=j;else{if(o)sortRun(k2,o);runs.set(k2,[j,j]);}}
          for(let i=Math.ceil((a+1)/12)*12;i<b;i+=12){const k2=8192+i,o=runs.get(k2);if(o&&o[1]===j-1)o[1]=j;else{if(o)sortRun(k2,o);runs.set(k2,[j,j]);}}}}
      for(const [k2,o] of runs)sortRun(k2,o);
      // les faces ±z (les écarts entre deux rangs) et les plans intérieurs z
      for(let j=S.j0;j<=jE;j++){const A=row(S,j-1),B=row(S,j),up=finDiff(A,B),dn=finDiff(B,A);
        for(let k=0;k<up.length;k+=2){const m=rouille((up[k]+up[k+1])/2,j,cx,cz,(y+yb)/2);ouvre(cle(1,1,j,up[k],up[k+1],m),2,1,j,up[k],up[k+1],m,y);}
        for(let k=0;k<dn.length;k+=2){const m=rouille((dn[k]+dn[k+1])/2,j,cx,cz,(y+yb)/2);ouvre(cle(1,0,j,dn[k],dn[k+1],m),2,-1,j,dn[k],dn[k+1],m,y);}
        if(j>0&&j%12===0){const it=finInter(A,B);for(let k=0;k<it.length;k+=2)ouvre(cle(1,2,j,it[k],it[k+1],10),2,1,j,it[k],it[k+1],10,y);}}
      ferme(y);prev=S;y=yb;}
    yield;}
  ferme(y);
  if(prev)plaque(prev.j0,prev.j0+prev.R.length,function(j){return row(prev,j);},y,1,JM.herbe); // le sommet
  const g=new THREE.BufferGeometry(),nv=P.length/3;
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));
  g.setAttribute('aM',new THREE.Float32BufferAttribute(Ma,1));g.setAttribute('aAO',new THREE.Float32BufferAttribute(new Float32Array(nv).fill(.92),1));
  g.setIndex(nv>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeBoundingSphere();return g;}
/* LE MAILLEUR DE COLONNES (v8, l'arche et le pont en cubes fins) — une grille de colonnes (u, v), chacune pleine sur UN intervalle [LO, HI)
   le long de w (`perm` dit quel axe x/y/z est u, v, w). Les deux bouts de chaque colonne = faces ±w (rectangles gloutons de même hauteur) ;
   entre deux colonnes voisines, ce que l'une a et pas l'autre = faces ±u / ±v (fusionnées le long du rang) ; `nb(u,v)` donne la colonne
   d'à côté quand elle sort de la grille (la région refaite en cubes fins touche la muraille en cubes de 2,5 m : les marches entre les deux
   sont posées ici, dans les deux sens). Plans intérieurs tous les `inner` cubes. */
function* colMeshG(NU,NV,LO,HI,perm,mat,nb,inner){ // (passe perf) en tranches au menu, d'une traite sinon (voir LES TRANCHES)
  const P=[],Nm=[],Ma=[],I=[],q=[0,0,0],Rg=[null,null,null],au=perm[0],av=perm[1],aw=perm[2];
  const Q=(d,sg,pl,m)=>{const e1=(d+1)%3,e2=(d+2)%3,b=P.length/3,a0=Rg[e1][0],a1=Rg[e1][1],b0=Rg[e2][0],b1=Rg[e2][1];
    q[d]=pl;q[e1]=a0;q[e2]=b0;P.push(q[0],q[1],q[2]);q[e1]=a1;P.push(q[0],q[1],q[2]);q[e2]=b1;P.push(q[0],q[1],q[2]);q[e1]=a0;P.push(q[0],q[1],q[2]);
    const nx=d===0?sg:0,ny=d===1?sg:0,nz=d===2?sg:0;for(let k=0;k<4;k++){Nm.push(nx,ny,nz);Ma.push(m);}
    if(sg>0)I.push(b,b+1,b+2,b,b+2,b+3);else I.push(b,b+2,b+1,b,b+3,b+2);};
  const plein=k=>HI[k]>LO[k];
  const col=(u,v)=>{if(u>=0&&u<NU&&v>=0&&v<NV){const k=u+NU*v;return HI[k]>LO[k]?[LO[k],HI[k]]:null;}return nb?nb(u,v):null;};
  // 1. les bouts des colonnes (faces ±w)
  for(const sg of [-1,1]){const V=sg<0?LO:HI,fait=new Uint8Array(NU*NV);
    for(let v=0;v<NV;v++){if(performance.now()>JF.lim)yield;for(let u=0;u<NU;u++){const k=u+NU*v;if(fait[k]||!plein(k))continue;const h=V[k],m=mat('w',u,v,sg);
      let w=1;while(u+w<NU){const k2=k+w;if(fait[k2]||!plein(k2)||V[k2]!==h||mat('w',u+w,v,sg)!==m)break;w++;}
      let hh=1;grand:while(v+hh<NV){for(let i=0;i<w;i++){const k2=u+i+NU*(v+hh);if(fait[k2]||!plein(k2)||V[k2]!==h||mat('w',u+i,v+hh,sg)!==m)break grand;}hh++;}
      for(let j=0;j<hh;j++)fait.fill(1,u+NU*(v+j),u+w+NU*(v+j));
      Rg[au]=[u,u+w];Rg[av]=[v,v+hh];Q(aw,sg,h,m);}}}
  // 2. les flancs : entre la colonne d'avant et celle-ci, le long de u (along 0) puis de v (along 1)
  const pieces=[];
  const dif=(A,B)=>{pieces.length=0;if(!A)return;if(!B){pieces.push(A[0],A[1]);return;}if(A[0]<B[0])pieces.push(A[0],Math.min(A[1],B[0]));if(A[1]>B[1])pieces.push(Math.max(A[0],B[1]),A[1]);};
  for(const along of [0,1]){const NA=along?NV:NU,NB=along?NU:NV,dAx=along?av:au,rAx=along?au:av,kind=along?'v':'u';
    for(let pl=0;pl<=NA;pl++){if(performance.now()>JF.lim)yield;const op=new Map(),vu=new Set();
      const ouvre=(sg,w0,w1,m,b,cu,cv)=>{const key=((sg>0?1:0)*65536+w0)*65536*16+w1*16+m;vu.add(key);if(!op.has(key))op.set(key,[b,sg,w0,w1,m]);};
      for(let b=0;b<=NB;b++){
        if(b<NB){const A=along?col(b,pl-1):col(pl-1,b),B=along?col(b,pl):col(pl,b);
          dif(A,B);for(let k=0;k<pieces.length;k+=2){const u9=along?b:pl-1,v9=along?pl-1:b;ouvre(1,pieces[k],pieces[k+1],(u9>=0&&v9>=0&&u9<NU&&v9<NV)?mat(kind,u9,v9,1):1,b);}
          dif(B,A);for(let k=0;k<pieces.length;k+=2){const u9=along?b:pl,v9=along?pl:b;ouvre(-1,pieces[k],pieces[k+1],(u9<NU&&v9<NV)?mat(kind,u9,v9,-1):1,b);}
          if(inner&&pl%inner===0&&A&&B){const w0=Math.max(A[0],B[0]),w1=Math.min(A[1],B[1]);if(w1>w0)ouvre(1,w0,w1,10,b);}}
        for(const [key,o] of op)if(!vu.has(key)){Rg[rAx]=[o[0],b];Rg[aw]=[o[2],o[3]];Q(dAx,o[1],pl,o[4]);op.delete(key);}
        vu.clear();}}}
  // 3. les plans intérieurs le long de w
  if(inner){let wmin=1e9,wmax=-1e9;for(let k=0;k<NU*NV;k++)if(plein(k)){if(LO[k]<wmin)wmin=LO[k];if(HI[k]>wmax)wmax=HI[k];}
    for(let W9=Math.ceil((wmin+1)/inner)*inner;W9<wmax;W9+=inner){if(performance.now()>JF.lim)yield;const op=new Map(),vu=new Set();
      for(let v=0;v<=NV;v++){
        if(v<NV){let u=0;while(u<NU){const k=u+NU*v;if(!(plein(k)&&LO[k]<W9&&HI[k]>W9)){u++;continue;}let u1=u+1;while(u1<NU){const k2=u1+NU*v;if(!(plein(k2)&&LO[k2]<W9&&HI[k2]>W9))break;u1++;}
          const key=u*65536+u1;vu.add(key);if(!op.has(key))op.set(key,v);u=u1;}}
        for(const [key,v0] of op)if(!vu.has(key)){Rg[au]=[Math.floor(key/65536),key%65536];Rg[av]=[v0,v];Q(aw,1,W9,10);op.delete(key);}
        vu.clear();}}}
  const g=new THREE.BufferGeometry(),nv=P.length/3;
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));
  g.setAttribute('aM',new THREE.Float32BufferAttribute(Ma,1));g.setAttribute('aAO',new THREE.Float32BufferAttribute(new Float32Array(nv).fill(.92),1));
  g.setIndex(nv>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeBoundingSphere();return g;}
const JADE_VIT_U={uCielH:{value:new THREE.Color(.8,.87,.89)},uCielZ:{value:new THREE.Color(.48,.66,.8)},uPeauA0:{value:.56},uPeauA1:{value:.95},uEcart:{value:.89},uLueur:{value:.85}};
const JADE_ONDE='float onde(float sd){return uMerY+mod(uTime*55.+sd*977.,1500.)-80.;}'; // l ONDE : un plan de lumière qui monte du fleuve vers le ciel
