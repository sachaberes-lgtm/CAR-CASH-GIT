/* ---------- LA VILLE SOUS LES NUAGES — LE FOND DE SCÈNE EN VOXELS (2026-09-11) ----------------
   ⚠ POURQUOI ELLE EXISTE. Mesuré avant d'écrire une ligne : en dehors du ruban, de la caisse, des
   ramassages et des nuages, il n'y avait RIEN en 3D dans le monde. Le « décor » était peint — le
   dégradé, le soleil, la lune, les étoiles ET la ville, cette dernière tenant en UNE ligne du
   shader du dôme (une bande de néon sur l'horizon). Entre le ruban et l'horizon, le champ visuel
   était littéralement vide, alors que `scene.fog` offre 2 600 unités de profondeur déjà payées.
   Le lore, lui, parlait déjà d'« une ville sous la mer de nuages » : on ne l'invente pas, on la
   construit enfin.

   LE MODULE. `VOX_M` (5 cm) est LA brique du jeu — une seule, jamais deux (verdict du user, vérifié
   à l'œil dans `atelier-voxel.html` : un coin diagonal ne toucherait que 2 % des briques d'une
   carrosserie et ne se voit pas). La ville n'en pose évidemment pas une par une — une tour de 100 m
   en ferait deux mille de haut — mais toutes ses dimensions sont des multiples ENTIERS de `VOX_CITY`,
   lui-même 128 × `VOX_M`. Une seule trame pour tout le jeu : à la distance d'une ville on ne résout
   que la maille, jamais la brique, et c'est ce qui fait qu'elle appartient au même monde que les
   caisses sans coûter un million d'instances.

   ⚠ LE TIRAGE EST UN FLUX DÉRIVÉ, JAMAIS `rnd`. `rnd` est la suite seedée de la piste, consommée
   séquentiellement : y ajouter ne serait-ce qu'un appel décalerait TOUTE la génération en aval
   (motifs, pièces, plots, trous). Même précaution que la 2e vague de plots de l'endgame — on
   dérive le seed et on tire à côté.

   ⚠ DEUX DRAW CALLS, PAS DEUX MILLE. Les corps et les couronnes sont deux `InstancedMesh` : ~2 500
   tours (5 000 volumes avec les retraits) coûtent exactement deux appels de rendu. Le corps est en
   MeshLambert — il hérite donc GRATUITEMENT des dix biomes et du brouillard, sans une ligne de
   code : la ville vire au bleu la nuit et s'éteint sous l'orage comme le reste du monde.

   ⚠⚠ LE PLANCHER NE PEUT PAS ÊTRE FIXE, ET C'EST LA MESURE QUI L'A DIT. Premier jet : la ville
   posée à `trackMinY-420`, par analogie avec la prairie du parc freestyle. Résultat en jeu :
   INVISIBLE. En mesurant l'altitude réelle du ruban sur une zone tirée au hasard — min -3544,
   médiane -630, max +693, soit **4 237 unités d'amplitude** — la caisse se retrouvait à 3 860 au-
   dessus des toits alors que `scene.fog` s'arrête à 2 600. Un plancher unique ne PEUT PAS rester en
   vue sur une piste qui plonge de quatre kilomètres.
   Le remède tient à une dissymétrie mesurée elle aussi : l'étendue HORIZONTALE de la piste n'est que
   de ~1 800 unités, largement dans le rayon de la ville. Donc on ne touche pas à X/Z — la parallaxe
   horizontale, celle qui vend la profondeur, reste VRAIE — et on ne fait suivre que l'ALTITUDE, avec
   du retard (`cityTick`). Une ville qui colle à la caméra serait un décor peint ; une ville qui la
   suit avec retard se laisse rattraper dans les plongeons et reprend sa distance ensuite.
   ⚠ le couperet du plongeon fatal (`trackMinY-120`) n'est jamais atteint au-dessus des toits :
   la ville se regarde, elle ne se percute jamais. ------------------------------------------------ */
/* ================= LA VILLE v3 — LE CANYON DU VILLAGE DE LA PLUIE (2026-09-26) =================
   User : « je préférais quand la route était plus proche des immeubles ; le niveau dans la ville est celui qui a le plus de
   potentiel mais c'est mal maîtrisé — retravaille tous les éléments de la ville pour un truc vraiment premium, compatible iPhone ».
   MESURÉ AVANT : la v2 était un PLANCHER qui suivait la caméra 520 à 1 200 m plus bas (captures du 26/09 : on n'en voyait RIEN
   — seule la couronne peinte de l'horizon et la pluie). La v3 renverse le principe : la ville est bâtie AUTOUR DU RUBAN, en
   coordonnées monde, chaque tour calée sur la route qui passe près d'elle :
     · LE CANYON, à 55-330 m de l'axe : des murs de tours qui MONTENT au-dessus de la route (−50 à +360 m) — on roule dans une
       rue de gratte-ciel, pas au-dessus d'un tapis ;
     · SOUS LE RUBAN : des blocs bas, toits 60 m sous la dalle au moins ;
     · AU LARGE (330-1 100 m) : la forêt de tours du village, jusqu'à la couronne peinte de l'horizon.
   LA RÈGLE D'OR (`tourLibre`) : aucune tour ne coupe la route, où que le ruban repasse — au-dessus d'elle (la tour se raccourcit)
   ou en dessous (son pied se relève). Balayage d'une grille de hachage des points de piste : coût de construction, zéro par image.
   LES PIEDS NE SE POSENT SUR RIEN : ils se NOIENT dans la brume (fondu vers la couleur du brouillard sur 280 m, avec la lueur
   néon qui monte des rues) — le village de la pluie émerge de la brume, quelle que soit l'altitude de la route (4 km d'amplitude).
   LE RENDU PREMIUM À COÛT FIXE (iPhone) — TROIS appels de rendu pour toute la ville :
     · les TOURS (Lambert, teinte par instance) avec leurs FENÊTRES dans le shader (maille 3,2 × 4 m, allumées au hasard, ambre,
       cyan, rose) : des milliers d'étages allumés pour zéro géométrie, fondus en lueur moyenne au loin (pas de moiré) ;
     · les NÉONS (enseignes, couronnes, feux d'antenne) qui respirent, dont quelques-uns clignotent et une poignée grésille ;
     · la CIRCULATION : des voitures volantes en files (phares blancs d'en face, feux rouges devant) qui filent le long du ruban —
       le vertex shader les déplace, une instance = un véhicule, zéro CPU par image.
   ⚠ LE TIRAGE EST UN FLUX DÉRIVÉ (`seed^0x5EED10C1`), JAMAIS `rnd` : la piste en aval ne bouge pas d'un mètre. */
const VOX_M=.05;            // LA BRIQUE. Le module de base du jeu, et il n'y en a qu'un.
const VOX_CITY=VOX_M*128;   // 6,4 m — la maille de la ville : un multiple ENTIER de la brique.
const CITY={root:null,uT:{value:0},uC:{value:1},uPied:{value:1},n:{}}; // uC : le COURANT de la ville (1 = allumée, 0 = la panne du niveau 16 de la campagne VILLE)
/* (2026-10-14, passe graphismes · facades-jour) LES FAÇADES DE JOUR — Sacha : « la ville ensoleillée ne marche pas » (fenêtres orange
   allumées en plein midi, tours lavande). De jour, une fenêtre est un REFLET (le verre renvoie le ciel), pas une lumière ; le béton perd
   sa teinte lavande. `CITY.uJ` = le JOUR des façades (0 la nuit, le soir, sous la pluie et l'orage ; 1 au matin et à midi), posé par
   villeApres. Les néons et les parapets : ambre / blanc / rouge de balise. */
CITY.uJ={value:0};
/* (2026-10-17, Léo : « retouche un petit peu la ville, donne-lui plus un aspect GTA ; les immeubles sont cool, mais ils pourraient être encore plus
   cyberpunk réaliste ») LES FAÇADES GTA — la nuit seulement (pondéré par 1 − uJ9), même géométrie, même nombre d'appels, un programme remplacé
   (clé +g). Chaque tour lit sa graine : les BUREAUX deviennent des murs-rideaux (grands carreaux de 1,8-2,6 m, verre teinté qui renvoie la lueur
   de la ville et le ciel selon l'angle — Fresnel, normale tirée des dérivées : zéro varying de plus —, plateaux allumés en néon de bureau, plus
   clair sous le plafond, rangées de tubes, bureaux sombres en bas) ; les LOGEMENTS gardent leurs fenêtres, mais chaque carreau est du VERRE
   (éteint, il reflète), éclairé en cloche par la lampe de la pièce, stores (1 sur 4), rideaux de couleur (1 sur 6) ; une ligne de dalle à chaque
   étage ; les FEUX D'OBSTACLE rouges qui battent aux coins du toit des tours de plus de 150 m ; une tour sur cinq porte des BANDES LED à ses arêtes
   (violet de la ville — remappé par la teinte — ou cyan), lumière qui monte. `CITY.uGta` (banc : dbgVilleGta) éteint tout sur la même image (mix vers l'ancien calcul). */
CITY.uGta={value:1};
CITY.uPiedC={value:new THREE.Vector3(.16,.04,.2)}; // (2026-10-16) la lueur VIOLETTE qui monte au pied des tours (villePied) — remappée dans une ville teintée (voir VTEINTES, vtPose)
/* (2026-09-27/28, passe perf iPhone) LA VILLE NE TRAVAILLE PLUS POUR RIEN — mesuré au banc en rendu logiciel (image figée, iPhone
   585×1266) : la ville coûtait ~25 % de l'image en VILLE, et la plus grosse part n'était PAS des pixels — avec une fenêtre de rendu
   d'un seul pixel, elle en coûtait encore les deux tiers. C'était le travail PAR SOMMET : ~5 000 volumes × 24 sommets, chacun éclairé
   (Lambert calcule la lumière au sommet : hémisphère, 3 directionnelles et ~10 lampes ponctuelles/spots), pour une ville dont 75 à
   80 % des volumes sont ENTIÈREMENT au-delà du brouillard (la forêt du village : des silhouettes couleur de brume, rien de plus).
   Cinq règles, à RÉSULTAT IDENTIQUE (A/B au pixel, `dbgVilleAncien`) :
     · LES QUARTIERS (`villeTri`) : chaque rendu juge des cubes de 320 m — HORS du champ → pas dessinés ; entièrement AU-DELÀ du
       brouillard → une matière NUE (villeMatToursLoin / villeMatNeonLoin : fogColor, le pied noyé, l'air de la pluie) ; sinon la
       matière complète. 5 appels de rendu au lieu de 3, tampons mis à jour par petits bouts (voir villeTri) ;
     · `VILLE_TRI` (au sommet, par instance — centre et demi-diagonale lus dans `instanceMatrix`) : une boîte entièrement hors d'un
       plan du champ est REPLIÉE en un point (zéro triangle rastérisé) ; entièrement au-delà de `fogFar` (la profondeur de vue du
       brouillard de three) elle SAUTE l'éclairage — ses fragments valent fogColor (mix(…, fogColor, 1)), la lumière n'y peut rien ;
     · LA PORTÉE DES LAMPES (`villeLampes`, `uLum9`) : les boucles ponctuelles/spots sautées là où aucune n'arrive (apport exactement 0) ;
     · au pixel : fenêtres, liserés, enseignes, pied, pluie ne se calculent que là où ils PEIGNENT (brouillard < 1, courant > 0, face
       murale, motif plus grand que le pixel, carreau allumé, pied < 280 m, pluie > 0) — les dérivées (fwidth) restent calculées
       AVANT tout branchement, comme avant ;
     · la ville ne REÇOIT pas d'ombre (receiveShadow false) : `USE_SHADOWMAP` retiré de ses programmes (getShadowMask valait 1 —
       mais le ternaire `receiveShadow ? getShadow(…)` peut être évalué des deux côtés).
   `villeMatTours(true)` / `villeMatNeon(true)` = l'ANCIEN chemin (`dbgVilleAncien(true)` : ancienne matière, tout dans l'ordre d'origine). */
const VILLE_TRI='#ifdef USE_INSTANCING\n'+
  'if(!isOrthographic){vec3 c9=(modelViewMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz;'+ // le centre de la boîte, dans le repère de la caméra (la ville est posée à l'identité : `root` jamais déplacé)
  'float r9=.5*length(vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz)))+1.;'+ // demi-diagonale + 1 m de marge
  'vec2 px9=vec2(projectionMatrix[0][0],projectionMatrix[2][0]),py9=vec2(projectionMatrix[1][1],projectionMatrix[2][1]);'+ // les 4 plans latéraux, tirés de la projection (décalage compris)
  'if(c9.z>r9||px9.x*c9.x+(px9.y+1.)*c9.z>r9*length(vec2(px9.x,px9.y+1.))||-px9.x*c9.x+(1.-px9.y)*c9.z>r9*length(vec2(px9.x,1.-px9.y))'+
  '||py9.x*c9.y+(py9.y+1.)*c9.z>r9*length(vec2(py9.x,py9.y+1.))||-py9.x*c9.y+(1.-py9.y)*c9.z>r9*length(vec2(py9.x,1.-py9.y))){gl_Position=vec4(0.,0.,2.,1.);loin9=true;}'+ // HORS CHAMP : repliée en un point
  '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\n'+
  'if(-c9.z-r9>fogFar)loin9=true;'+ // AU-DELÀ DU BROUILLARD : couleur de brume au bit près, la lumière n'y peut rien
  '\n#endif\n}\n#endif\n';
const VT={QC:320,H:120,M:60,G:256,K:.3,lum:true,avAr:true,fr:new THREE.Frustum(),pv:new THREE.Matrix4(),pl:new Float64Array(24),lp:new THREE.Vector3(),ord:[],n:0,nu:0,ko:0,ms:0,im:0}; // le tri par QUARTIERS (villeTri) : cube de 320 m, hystérésis brouillard H / champ M, compteur de remontées
const villePied=Q=> // APRÈS le brouillard de three — partagé par les tours PRÈS et les tours AU LOIN (villeMatToursLoin) : le même code, au caractère près
  // LE PIED DANS LA BRUME : fondu vers la couleur du brouillard sur 280 m, et la lueur des rues qui monte — (passe perf) au-dessus de 280 m
  // du pied (mb = 1 : presque toute tour vue de la route) le mélange rendait la couleur telle quelle, il ne se calcule plus
  '#ifdef USE_FOG\n{float mb=smoothstep(10.,280.,vB9);if('+Q('vB9<280.')+'){vec3 mc=fogColor+uPiedC9*uPied9*(1.-smoothstep(0.,160.,vB9));'+
  'gl_FragColor.rgb=mix(mc,gl_FragColor.rgb,mb);}'+
  /* L'AIR DE LA PLUIE (2026-09-26) : le brouillard du biome ne commence qu'à 320 m — les trois rangs du canyon (55-330 m) avaient
     TOUS le même contraste, un seul plan plat. Sous la pluie, l'air s'épaissit dès 40 m : chaque rang un peu plus noyé que le
     précédent, la profondeur se lit. Et ce qui monte AU-DESSUS de l'œil se noie vers le PLAFOND (plus sombre que la brume de
     l'horizon) : les grandes tours lointaines ne font plus des aplats lilas plus clairs que le ciel derrière elles. */
  'if('+Q('uWet9>0.')+'){vec3 e9=vW9-cameraPosition;float d9=length(e9),el9=e9.y/max(d9,1.);'+ // (passe perf) pluie nulle : fc9 = fogColor, les deux termes valent 0
  'vec3 fc9=fogColor*mix(1.,.62,smoothstep(.04,.5,el9)*uWet9);'+
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,fc9,uWet9*.36*(1.-exp(-max(0.,d9-40.)/320.)));'+
  'float ff9=smoothstep(fogNear,fogFar,d9);gl_FragColor.rgb+=(fc9-fogColor)*ff9*mb;}}\n#endif';
/* (passe perf) LA PORTÉE DES LAMPES — Lambert éclaire au SOMMET, et chaque sommet de chaque tour évaluait toutes les lumières ponctuelles et
   les spots de la scène (caisse, phares, nitro, traînée, pose, meute, portail : ~10). Leur apport est EXACTEMENT nul au-delà de leur
   portée (`distance`, décroissance > 0 : pow(saturate(1 − d/portée), décroissance) = 0), et elles vivent toutes près de la caisse, des
   bots ou du portail. `villeLampes` les regroupe en 4 SPHÈRES de portée (monde) ; une tour qui n'en touche aucune saute ces deux
   boucles — l'hémisphère et les trois directionnelles restent. Une lampe de portée infinie (ou sans décroissance) : tout le monde calcule. */
CITY.uL={value:[new THREE.Vector4(0,0,0,-1e30),new THREE.Vector4(0,0,0,-1e30),new THREE.Vector4(0,0,0,-1e30),new THREE.Vector4(0,0,0,-1e30)]};
const VILLE_LLV=(function(){const c=THREE.ShaderChunk.lights_lambert_vertex,a='#if NUM_POINT_LIGHTS > 0',b='#if NUM_DIR_LIGHTS > 0'; // point et spot, puis directionnelles
  const i=c.indexOf(a),j=c.indexOf(b);return (i<0||j<i||c.indexOf('#if NUM_SPOT_LIGHTS > 0')<i||c.indexOf('#if NUM_SPOT_LIGHTS > 0')>j)?c:c.slice(0,i)+'if(proche9){\n'+c.slice(i,j)+'}\n'+c.slice(j);})();
function villeLampes(){
  const L=CITY.lampes,u=CITY.matT&&renderer.properties.get(CITY.matT).uniforms; // la liste des lampes ; si three en compte PLUS (une lampe née depuis), on la refait
  if(!L||(u&&u.pointLights&&u.spotLights&&u.pointLights.value.length+u.spotLights.value.length>L.length)){CITY.lampes=[];scene.traverse(function(o){if(o.isPointLight||o.isSpotLight)CITY.lampes.push(o);});}
  const S=CITY.uL.value,P=VT.lp;let n=0;
  for(const l of CITY.lampes){if(!l.visible||!(l.intensity>0))continue; // éteinte : sa couleur vaut 0, son apport aussi
    if(!VT.lum){S[0].set(0,0,0,1e30);n=1;break;} // (banc) dbgVilleTri({lum:false}) : toutes les tours calculent toutes les lampes
    if(!(l.distance>0)||!(l.decay>0)){S[0].set(0,0,0,1e30);n=1;break;}
    P.setFromMatrixPosition(l.matrixWorld);const r=l.distance;let b=-1,bR=1e30;
    for(let i=0;i<n;i++){const s9=S[i],d=Math.hypot(P.x-s9.x,P.y-s9.y,P.z-s9.z),R9=d+r<=s9.w?s9.w:d+s9.w<=r?r:(d+r+s9.w)/2;if(R9<bR){bR=R9;b=i;}}
    if(b>=0&&(n===4||bR<=Math.max(S[b].w,r)+40)){const s9=S[b],d=Math.hypot(P.x-s9.x,P.y-s9.y,P.z-s9.z); // on fusionne (la sphère qui contient les deux)
      if(d+r<=s9.w){}else if(d+s9.w<=r)s9.set(P.x,P.y,P.z,r);else{const k=(bR-s9.w)/d;s9.set(s9.x+(P.x-s9.x)*k,s9.y+(P.y-s9.y)*k,s9.z+(P.z-s9.z)*k,bR);}}
    else S[n++].set(P.x,P.y,P.z,r);}
  for(let i=n;i<4;i++)S[i].set(0,0,0,-1e30);
}
function villeMatTours(ancien){ // béton du village + fenêtres + pied noyé dans la brume (PARTAGÉ : jamais disposé)
  const K=ancien?'matT0':'matT';if(CITY[K])return CITY[K];
  const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x07080d});
  m.extensions={derivatives:true}; // fwidth (WebGL1) : les fenêtres se filtrent à la taille du pixel
  // (2026-10-14, passe graphismes · facades-jour) V5 = les façades de jour ; FIN9 = le verre en Fresnel vrai (normale
  // monde + reflet du ciel), réservé au palier 2 — aux paliers 0-1 le verre prend une part fixe de l'horizon (zéro calcul de plus).
  const V5=true,NV5=true,FIN9=PAL.n===2,GTA9=!ancien; // (2026-10-17) GTA9 : les façades GTA
  const DECL='varying vec3 vLoc9;varying vec3 vNrm9;varying float vB9;varying float vSeed9;varying vec3 vSc9;varying vec3 vW9;'+(FIN9?'varying vec3 vWN9;':'');
  const Q=c=>ancien?'true':c; // (passe perf) chaque saut de calcul : `true` sur l'ANCIEN chemin (le banc compare au même code)
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CITY.uT;sh.uniforms.uWet9=ROAD_U.uWet;sh.uniforms.uCour9=CITY.uC;sh.uniforms.uPied9=CITY.uPied;sh.uniforms.uPiedC9=CITY.uPiedC;if(!ancien){sh.uniforms.uLum9=CITY.uL;}
    {sh.uniforms.uJ9=CITY.uJ;sh.uniforms.uJHor9=skyU.uJHor;sh.uniforms.uJMid9=skyU.uJMid;} // le jour, et le ciel que le verre renvoie
    if(GTA9){sh.uniforms.uGta9=CITY.uGta;sh.uniforms.uAcc9=VV.uAcc;sh.uniforms.uCamE9=VIT.uCam;sh.uniforms.uEmb9=CITY.uEmb;} // (2026-10-20, VILLE EMBELLIE) l'accent de la teinte, l'œil, l'interrupteur des ajouts (voir ville-embellie.js)
    sh.vertexShader=(ancien?'':'#undef USE_SHADOWMAP\n')+sh.vertexShader.replace('#include <common>','#include <common>\n'+DECL+(ancien?'':'\nuniform vec4 uLum9[4];\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nuniform float fogFar;\n#endif\n'))
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+
        'vec3 sc9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));'+
        'vSeed9=fract(instanceMatrix[3].x*.0131+instanceMatrix[3].z*.0173);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvec3 sc9=vec3(1.);vSeed9=0.;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n'+
        'vLoc9=position*sc9;vNrm9=normal;vB9=(position.y+.5)*sc9.y;vSc9=sc9;'+
        (FIN9?'\n#ifdef USE_INSTANCING\nvWN9=mat3(modelMatrix)*(mat3(instanceMatrix)*normal);\n#else\nvWN9=mat3(modelMatrix)*normal;\n#endif\n':''))
      .replace('#include <project_vertex>','#include <project_vertex>\nbool loin9=false;\n'+(ancien?'':VILLE_TRI+
        '#ifdef USE_INSTANCING\nbool proche9=false;{vec3 w9=(modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz;float r9=.5*length(sc9)+1.;'+ // la boîte touche-t-elle la portée d'une lampe ?
        'for(int i=0;i<4;i++)if(distance(w9,uLum9[i].xyz)<uLum9[i].w+r9)proche9=true;}\n#else\nbool proche9=true;\n#endif\n'))
      .replace('#include <lights_lambert_vertex>',ancien?'#include <lights_lambert_vertex>':'vLightFront=vec3(0.);vIndirectFront=vec3(0.);\nif(!loin9){\n'+VILLE_LLV+'\n}');
    if(!ancien)sh.fragmentShader='#undef USE_SHADOWMAP\n'+sh.fragmentShader;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uWet9,uCour9,uPied9;uniform vec3 uPiedC9;'+DECL+('uniform float uJ9;uniform vec3 uJHor9,uJMid9;')+(GTA9?'uniform float uGta9,uEmb9;uniform vec3 uAcc9,uCamE9;':''))
      .replace('#include <fog_fragment>',
        /* LES FENÊTRES v2 (2026-09-26) — chaque tour a sa PERSONNALITÉ, tirée de sa graine : travée 2,6-4,4 m, étage 3,5-4,4 m, taux
           d'allumage 22-62 %, habitation (ambre chaud) ou bureaux (blanc-cyan froid, fenêtres en BANDEAU allumées par plateaux entiers).
           Quelques fenêtres changent d'état toutes les 15-40 s, une poignée d'écrans bleutés papillotent : la ville est HABITÉE.
           Les bords sont ANTICRÉNELÉS à l'empreinte du pixel (fwidth) et, quand la travée tombe sous ~2 px, le motif se fond dans sa
           lueur MOYENNE, calculée d'après la même personnalité : plus de fenêtres qui scintillent ni de moiré en roulant, et aucun
           saut entre le proche et le lointain (l'ancien fondu 240-900 m ignorait la taille réelle à l'écran). */
        /* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») FINI LA GUIRLANDE DE NOËL. Ambre, cyan et rose étaient semés au hasard fenêtre par
           fenêtre, sur toutes les tours : de loin, un confetti uniforme, sans une tour qu'on reconnaisse. Désormais chaque tour a UNE
           teinte DOMINANTE (80 % de ses fenêtres) — CHAUDE #ffb04a (on y vit) ou FROIDE #8fd8ff (on y travaille) — l'autre teinte
           ne fait que ponctuer ; 35 à 45 % des fenêtres sont éteintes, et les étages s'allument en BANDES (de 1 à 3 étages : un
           plateau sur quatre dort). Le rose n'est plus aux fenêtres : il est aux ENSEIGNES (néon magenta et cyan). */
        '{vec3 an=abs(vNrm9);float fv=step(an.y,.5)*step(9.,min(vSc9.x,vSc9.z));'+
        'float s1=fract(vSeed9*7.13),s2=fract(vSeed9*13.71),s3=fract(vSeed9*29.37),bur=step(.7,s3),fro=step(.58,s3);'+ // fro : tour FROIDE (les bureaux en sont)
        (GTA9?'float s4=fract(vSeed9*41.17),s5=fract(vSeed9*53.91),G9=uGta9*(1.-uJ9);'+ // (GTA) deux graines de plus ; G9 = les façades GTA (la nuit)
          'vec2 cel=mix(vec2(2.6+s1*1.8,3.5+s2*.9),vec2(1.8+s1*.8,3.8+s2*.4),bur*G9),uv=(an.x>an.z?vLoc9.zy:vLoc9.xy)/cel,fw=max(fwidth(uv),vec2(1e-4));' // (GTA) les bureaux : le carreau d'un mur-rideau
          :'vec2 cel=vec2(2.6+s1*1.8,3.5+s2*.9),uv=(an.x>an.z?vLoc9.zy:vLoc9.xy)/cel,fw=max(fwidth(uv),vec2(1e-4));')+
        // LES TOITS (2026-09-26) : vus d'avion (vol libre, plongeons), c'étaient des dalles noires. Chaque toit porte désormais un LISERÉ
        // néon sur son parapet (ambre, cyan des bureaux, parfois magenta) : d'en haut, la ville dessine ses blocs et ses retraits en
        // lignes de lumière. Anticrénelé, et éteint quand le liseré tombe sous le pixel (pas de fourmillement au loin).
        'float tt=step(.5,vNrm9.y)*step(9.,min(vSc9.x,vSc9.z)),de=min(vSc9.x*.5-abs(vLoc9.x),vSc9.z*.5-abs(vLoc9.z)),fe=max(fwidth(de),1e-4);'+ // (passe perf) les DEUX dérivées avant tout branchement
        (GTA9?'bool AX9=an.x>an.z;float dc9=(AX9?vSc9.z:vSc9.x)*.5-abs(AX9?vLoc9.z:vLoc9.x),dt9=vSc9.y*.5-vLoc9.y,fc9=max(fwidth(dc9),1e-4),ft9=max(fwidth(dt9),1e-4);'+ // (GTA) distance à l'ARÊTE et au TOIT (m), leur taille au pixel
          'vec3 Nd9=cross(dFdx(vW9),dFdy(vW9));'+ // (GTA) la normale MONDE de la face, tirée des dérivées (exacte sur une face plane) — avant tout branchement
          '\n#ifdef USE_FOG\nvec3 fo9=fogColor;\n#else\nvec3 fo9=vec3(.1);\n#endif\n':'')+
        '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nbool VIS9=fogDepth<fogFar;\n#else\nbool VIS9=true;\n#endif\n'+ // au-delà, le brouillard rend fogColor au bit près : rien de ce qui suit ne se verrait
        'if('+Q('VIS9&&uCour9>0.')+'){vec3 cW=vec3(1.,.69,.29),cC=vec3(.56,.85,1.),dom=mix(cW,cC,fro),aut=mix(cC,cW,fro);'+ // #ffb04a / #8fd8ff : la dominante et l'autre
        (GTA9?'vec3 V9=normalize(cameraPosition-vW9);float nl9=length(Nd9);vec3 N9=nl9>1e-12?Nd9/nl9:vec3(0.,1.,0.);N9*=dot(N9,V9)<0.?-1.:1.;'+
          'float F9=min(.04+.96*pow(1.-max(dot(N9,V9),0.),5.),.5);vec3 R9=reflect(-V9,N9);'+ // (GTA) le VERRE : Fresnel de Schlick
          'vec3 sk9=mix(fo9*1.1+uPiedC9*1.4*uPied9,fo9*.3,smoothstep(-.05,.45,R9.y));'+ // ce qu'il renvoie : la lueur de la ville sur l'horizon, le ciel sombre au-dessus
          'sk9=mix(sk9,fo9*.55+uPiedC9*2.6*uPied9,smoothstep(0.,-.35,R9.y));'+ // … et la rue violette en dessous
          'vec3 gl9=mix(vec3(.010,.012,.020)*(1.+bur),sk9*.5,F9);'+(PAL.n>=1?VEMB_ECHO:'')+'float sl9=0.,pr9=1.;':'')+ /* (2026-10-20, VILLE EMBELLIE) l'écho des néons dans le verre éteint — paliers MOYEN et RÉCENT (voir VEMB_ECHO) */ // pr9 : chaque carreau un peu de travers (le reflet varie) // le verre teinté (les bureaux un peu plus clairs) ; sl9 : la ligne de dalle
        'if('+Q('fv>0.')+'){vec2 hw='+(GTA9?'mix(vec2(mix(.3,.46,bur),.26),mix(vec2(.32,.28),vec2(.46,.40),bur),G9);':'vec2(mix(.3,.46,bur),.26);')+ // (GTA) logements : le carreau un peu plus grand ; bureaux : le verre de dalle à dalle
        'float tx=.55+.1*s2,far=smoothstep(.3,.75,max(fw.x,fw.y)),avg=tx*4.*hw.x*hw.y;vec3 wv=mix(dom,aut,.2)*avg*1.05;'+ // wv : la lueur MOYENNE (le lointain)
        (GTA9?'wv=mix(wv,vec3(.66,.84,1.)*avg*.62,bur*G9);':'')+ // (GTA) au loin, les bureaux gardent la couleur de leur néon (et leurs 40 % allumés)
        ('float gm9=4.*hw.x*hw.y;')+ // (facades-jour) gm9 : la part de VERRE du mur (le carreau de près, la moyenne au loin)
        'if('+Q('far<1.')+'){vec2 id=floor(uv),f=fract(uv),dd=(hw-abs(f-.5))/fw;float w=clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.);'+ // (passe perf) motif sous le pixel : la moyenne suffit, les hachages ne se calculent pas
        ('gm9=mix(w,gm9,far);')+
        (GTA9?'sl9=(1.-smoothstep(.035,.035+fw.y*1.5,min(f.y,1.-f.y)))*(1.-far);pr9=mix(.7+.6*fract(sin(dot(id,vec2(41.3,17.9))+vSeed9*7.)*4375.85),1.,far);':'')+ // (GTA) la DALLE de chaque étage : un fil qui accroche la brume
        'vec3 wo=vec3(0.);if('+Q('w>0.')+'){'+ // (passe perf) entre deux carreaux (la moitié du mur de près) : rien à allumer, les hachages ne se calculent pas
        (GTA9?'vec2 idH=bur>.5?vec2(floor(id.x/mix(5.,4.+floor(s1*6.),G9)),id.y):id;':'vec2 idH=bur>.5?vec2(floor(id.x/5.),id.y):id;')+ // (GTA) des plateaux de 4 à 9 carreaux                                   // les bureaux s'allument par PLATEAUX
        'float h=fract(sin(dot(idH+vec2(vSeed9*97.,vSeed9*61.),vec2(12.9898,78.233)))*43758.5453);'+
        'float hb=fract(sin(floor(id.y/(1.+floor(s1*3.)))*91.7+vSeed9*311.)*43758.5453),vit=step(.26,hb);'+ // les BANDES d'étages : 3 plateaux sur 4 vivent
        'float on=step(1.-mix(.08,(tx-.02)/.74,vit),h);'+(GTA9?'on*=1.-bur*G9*step(fract(h*4.73),.36);':'')+ // (GTA) des plateaux de bureaux éteints (la nuit, 40 % restent allumés)                                  // 55-65 % allumées en moyenne (un plateau qui dort garde 8 % de veilleuses)
        'float hv=fract(sin(dot(id+vec2(floor(uT9/(15.+25.*h)+h*7.),vSeed9*13.),vec2(39.34,11.13)))*24634.63);on=abs(on-step(.94,hv));'+ // la VIE : ~6 % des fenêtres basculent de temps en temps
        'if('+Q('on>0.')+'){vec3 wc=mix(dom,aut,step(.8,fract(h*7.77)))*(.8+.4*fract(h*13.1));'+ // (passe perf) fenêtre éteinte : ni teinte ni écran
        'float tv=step(.955,hv)*step(hv,.975)*(.55+.45*sin(uT9*7.3+h*40.)*sin(uT9*2.9+h*9.));wc=mix(wc,vec3(.45,.6,1.)*1.2*tv,step(.001,tv));'+ // les ÉCRANS
        (GTA9?'vec2 p9=(f-.5)/hw;'+ // (GTA) LA PIÈCE ALLUMÉE — p9 : la place dans le carreau (−1…1)
          'float lu9=bur>.5?(.62+.38*smoothstep(-.7,.8,p9.y)+.8*exp(-pow((p9.y-.8)/.09,2.))*step(.4,fract(f.x*2.6+id.x*.37))-.28*step(p9.y,-.5)*step(.45,fract(f.x*4.3+id.x*1.7))):(1.08-.32*dot(p9,p9));'+ // bureaux : clair sous le plafond, tubes, bureaux sombres en bas ; logement : la lampe en cloche
          'float bl9=step(.75,fract(h*5.31))*(1.-bur);lu9*=mix(1.,.58+.42*step(.42,fract(f.y*15.)),bl9);'+ // les STORES (un logement sur quatre)
          'float ch9=fract(h*11.3);vec3 cc9=ch9<.34?vec3(1.,.55,.35):ch9<.67?vec3(1.,.42,.46):vec3(.95,.78,.48);'+ // les RIDEAUX, CHAUDS : orange, rouge rosé, or (vague 2 : pas de guirlande de Noël)
          'vec3 wg9=bur>.5?mix(vec3(.66,.84,1.),vec3(.74,.94,.86),step(.65,fract(h*5.7)))*(.8+.35*fract(h*13.1)):mix(wc,wc*cc9*1.2,step(.875,fract(h*3.17))*.6);'+ // le néon de bureau (blanc, parfois verdâtre)
          'wc=mix(wc,wg9*lu9,G9);'+
          'if(bur<.5){vec2 mf9=fw*1.3+.012;float mu9=min(smoothstep(0.,mf9.x,abs(f.x-.5)-.016),smoothstep(0.,mf9.y,abs(p9.y-.38)*hw.y-.012));wc*=mix(1.,.25+.75*mu9,G9);}':'')+ // (GTA) la CROISÉE du logement : un montant et une traverse sombres (sous le pixel, ils s'effacent)
        'wo=wc*w*on;}}wv=mix(wo,wv,far);}'+
        /* (2026-10-14, passe graphismes · facades-jour) LE VERRE DE JOUR : le carreau s'assombrit (l'intérieur d'un bureau au soleil)
           et, en rasant, renvoie le CIEL de la ville (horizon → milieu du ciel selon le reflet) — Fresnel de Schlick au palier 2, une
           part fixe d'horizon ailleurs. Pondéré par uJ9 : la nuit, le soir, la pluie et l'orage gardent leur image au bit près. */
        ((FIN9?'{vec3 V9=normalize(cameraPosition-vW9),N9=normalize(vWN9);float F9=min(.04+.96*pow(1.-max(dot(N9,V9),0.),5.),.8);'+
          ('vec3 R9=reflect(-V9,N9),sk9=mix(uJHor9,uJMid9,.5+.5*smoothstep(0.,.6,R9.y))*.85;gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(gl_FragColor.rgb*.85,sk9,F9*.8),gm9*fv*uJ9);}') /* (metropole) le verre de jour reflète le BLEU du ciel et garde la couleur de sa tour (à ×.5 + l'horizon crème, une tour bleue sortait beige) */
          :('gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(gl_FragColor.rgb*.88,mix(uJHor9,uJMid9,.65)*.85,.26),gm9*fv*uJ9);')))+ /* (metropole) idem aux paliers 0-1 */
        (GTA9?'gl_FragColor.rgb=mix(gl_FragColor.rgb,gl9*pr9,gm9*G9);gl_FragColor.rgb+=fo9*(.28*sl9*(1.-gm9)+.3*(1.-smoothstep(0.,max(.7,1.5*fc9),dc9)))*G9;':'')+ // les ARÊTES de la tour accrochent la lueur : on lit son volume // (GTA) chaque carreau est du VERRE (allumé ou non), la dalle accroche la brume
        'gl_FragColor.rgb+=wv*fv*1.3*uCour9'+('*(1.-.9*uJ9)')+';}'+
        (GTA9?'if(G9>0.&&fv>0.){'+
          'if(vSc9.y>150.&&s5<.62){float rr=max(.9,2.2*max(fc9,ft9));float ka=(1.-smoothstep(rr*.5,rr,dc9))*(1.-smoothstep(rr*.5,rr,dt9));gl_FragColor.rgb+=vec3(1.,.07,.04)*ka*step(.55,fract(uT9*.8+s5*3.))*3.5*G9;}'+ // (GTA) les FEUX D'OBSTACLE aux coins du toit (≥ 1 px)
          'if(s4>.8&&vSc9.y>80.){float lw=max(.5,1.8*fc9);float kl=max(1.-smoothstep(lw*.5,lw,dc9),1.-smoothstep(lw*.5,lw,dt9));vec3 lc=s5>.5?vec3(.24,.91,1.):normalize(uPiedC9+1e-4)*1.5;'+
          'gl_FragColor.rgb+=lc*kl*(.75+.45*sin(vLoc9.y*.06-uT9*3.+s5*20.))*1.25*uCour9*G9;}}':'')+ // (GTA) les BANDES LED des arêtes et du toit (une tour sur cinq), la lumière qui monte
        // uCour9 : la PANNE éteint les fenêtres (campagne VILLE, niveau 16) ; (facades-jour) de jour, un reflet à 10 %, pas une lumière
        'if('+Q('tt>0.&&fe<1.4')+'){vec3 rc='+('fro>.5?vec3(.91,.93,.95):vec3(1.,.69,.29);')+ // (vague 2) le parapet suit la dominante de la tour (cyan #3ee8ff / ambre), parfois magenta #ff3ec8 — (facades-jour) blanc de bureau #E8EEF2 / ambre #FFB04A
        'gl_FragColor.rgb+=rc*tt*(1.-smoothstep(.55,.55+fe*1.5,de))*(1.-smoothstep(.5,1.4,fe))*.55*uCour9'+('*(1.-.9*uJ9)')+';}}}\n'+
        '#include <fog_fragment>\n'+villePied(Q));
    // (2026-10-14, passe graphismes · facades-jour) LE BÉTON DE JOUR : la teinte d'instance (.20,.21,.26)×t9 — lavande — glisse vers le
    // béton neutre-froid #6B717A ramené à la même luminance (.2016,.2126,.2294), soit ×(1.008,1.013,.883) ; t9 garde sa variation.
    // Pondéré par uJ9 : la nuit garde ses teintes au bit près (mix(…,0) rend la couleur telle quelle).
    sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(vec3(1.),'+('vec3(1.,1.,.98)')+',uJ9);'); /* (metropole) le béton de jour reste NEUTRE (la teinte jaunâtre beigeait l'acier et le verre) */
  };
  m.customProgramCacheKey=function(){return ancien?('toursV3j'):('toursV5'+(FIN9?'f':'')+('n')+(GTA9?'g':''));}; // (facades-jour) une clé remplacée, pas un programme de plus
  CITY[K]=m;return m;
}
/* (2026-10-17, banc) dbgVilleGta(k,a,d,h) : les façades GTA à k (0 = l'image d'avant, 1 = GTA) et UNE image re-rendue — la caméra posée par
   dbgView si a est donné (angle relatif au CAP de la caisse : 0 = derrière), sinon telle quelle (en pause : la même image, A puis B). */
window.dbgVilleGta=function(k,a,d,h){CITY.uGta.value=k==null?1:+k;
  if(a!=null){const f=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.getWorldQuaternion(new THREE.Quaternion()));window.dbgView(Math.atan2(-f.x,-f.z)+a,d,h);}
  else if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  return {k:CITY.uGta.value};};
function villeMatNeon(ancien){ // enseignes, couronnes, feux d'antenne — ils RESPIRENT, quelques-uns clignotent, une poignée grésille
  const K=ancien?'matN0':'matN';if(CITY[K])return CITY[K];
  const Q=c=>ancien?'true':c; // (passe perf) voir villeMatTours
  const m=new THREE.MeshBasicMaterial({color:0xffffff});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CITY.uT;sh.uniforms.uCour9=CITY.uC;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vS9;varying vec3 vL9,vN9,vC9;'+(ancien?'':'\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nuniform float fogFar;\n#endif\n'))
      .replace('#include <project_vertex>','#include <project_vertex>\nbool loin9=false;\n'+(ancien?'':VILLE_TRI)) // (passe perf) hors champ : repliée en un point
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+
        'vS9=fract(instanceMatrix[3].x*.113+instanceMatrix[3].z*.071+instanceMatrix[3].y*.037);vC9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));\n#else\nvS9=0.;vC9=vec3(1.);\n#endif\n'+
        'vL9=position*vC9;vN9=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uCour9;varying float vS9;varying vec3 vL9,vN9,vC9;'+
        'float nH9(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}')
      .replace('#include <fog_fragment>','{vec3 fL=fwidth(vL9);'+ // ⚠ les dérivées HORS des branches (elles y seraient indéfinies)
        '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nbool VIS9=fogDepth<fogFar;\n#else\nbool VIS9=true;\n#endif\n'+ // (passe perf) au-delà du brouillard : fogColor au bit près, rien ne se calcule
        'if('+Q('VIS9')+'){float fl=.8+.2*sin(uT9*(2.+vS9*7.)+vS9*40.);'+
        'if(vS9>.88)fl*=step(.3,fract(uT9*(.5+vS9)+vS9*7.));'+
        'if(vS9<.05)fl*=.2+.8*step(.1,fract(sin(floor(uT9*15.)+vS9*91.)*437.5));'+
        /* LES ENSEIGNES PARLENT (2026-09-26) — c'étaient des pavés de couleur unie. Désormais, sans une donnée de plus (tout se déduit de
           la forme de l'instance) : l'ENSEIGNE VERTICALE (plaque haute et mince) porte une colonne de CARACTÈRES en pixels (glyphes
           tirés au hasard, 4 × 5 pixels, l'alphabet d'une ville qu'on ne lit pas), un cadre et un fond sombre ; une sur trois fait
           DÉFILER son texte pixel par pixel. La COURONNE des toits devient une guirlande d'ampoules qui court. Les détails se fondent
           dans leur lueur moyenne quand ils tombent sous le pixel (fwidth) : zéro scintillement au loin. */
        'vec3 an=abs(vN9),sc=vC9;float k9=1.;'+
        'if(sc.y>12.&&min(sc.x,sc.z)<3.){bool fx=sc.x<sc.z;float fn=fx?an.x:an.z;'+
        '  if(fn>.5){vec2 p=fx?vL9.zy:vL9.xy;float W=fx?sc.z:sc.x,ps=W*.15;'+
        '    vec2 e=vec2(W,sc.y)*.5-abs(p),fe=fx?fL.zy:fL.xy;float cad=1.-smoothstep(ps*.6,ps*.6+fe.y*1.5,min(e.x,e.y));'+
        '    float sy=p.y+(vS9>.66?floor(uT9*(4.+vS9*6.))*ps:0.);vec2 g=vec2(p.x/ps+2.,sy/ps);'+
        '    vec2 gi=floor(g),gf=vec2(gi.x,mod(gi.y,6.));float ch=floor(gi.y/6.);'+
        '    float px=step(0.,gf.x)*step(gf.x,3.5)*step(gf.y,4.5)*step(.46,nH9(vec3(gf,ch+vS9*113.)))*step(ps*1.2,min(e.x,e.y));'+
        '    float fg=max(fe.x,fe.y)/ps,lo=smoothstep(.45,1.1,fg);px=mix(px,.36,lo);'+
        '    k9=.13+1.25*px+.95*cad*(1.-lo*.5);}}'+
        'else if(sc.y<3.5&&max(sc.x,sc.z)>8.){float fv=step(an.y,.5);'+
        '  float q=(an.x>an.z?vL9.z:vL9.x)+(an.x>an.z?vL9.x:vL9.z)*.3,d=fract(q/2.2-uT9*(1.+vS9*2.));'+
        '  float b=smoothstep(.3,.08,abs(d-.5)),lo=smoothstep(.3,.8,(an.x>an.z?fL.z:fL.x)/2.2);'+
        '  k9=mix(.45,mix(.3+1.1*b,.72,lo),fv);}'+
        'gl_FragColor.rgb*=fl*k9*mix(.03,1.,uCour9);}}\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return ancien?'neonsV2':'neonsV3';};
  CITY[K]=m;return m;
}
/* (2026-09-28, passe perf iPhone) LES MATIÈRES NUES — pour les QUARTIERS entièrement au-delà du brouillard (voir villeTri). Là-bas la
   matière complète rend, au bit près, `fogColor` (mix(…, fogColor, 1)) puis — pour les tours — le pied noyé et l'air de la pluie,
   qui ne dépendent que de la position. Ces deux matières ne calculent QUE ça : ni lumière (Lambert l'évaluait au sommet, ~12 lampes),
   ni fenêtres, ni enseignes, 4 interpolants au lieu de 24. Pas de couleur par instance (villeChauffe les compile pareil). */
function villeMatToursLoin(){
  if(CITY.matTL)return CITY.matTL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uWet9=ROAD_U.uWet;sh.uniforms.uPied9=CITY.uPied;sh.uniforms.uPiedC9=CITY.uPiedC;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vB9;varying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+ // vB9 et vW9 : les MÊMES expressions que villeMatTours
        'vB9=(position.y+.5)*length(instanceMatrix[1].xyz);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvB9=position.y+.5;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWet9,uPied9;uniform vec3 uPiedC9;varying float vB9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+villePied(c=>c));};
  m.customProgramCacheKey=function(){return 'toursLoin';};
  CITY.matTL=m;return m;
}
function villeMatNeonLoin(){ // une enseigne au-delà du brouillard : fogColor, rien d'autre
  if(CITY.matNL)return CITY.matNL;
  const m=new THREE.MeshBasicMaterial({color:0xffffff});
  m.customProgramCacheKey=function(){return 'neonsLoin';};
  CITY.matNL=m;return m;
}
/* LES PANNEAUX HOLOGRAPHIQUES (2026-09-26) — le cyberpunk, c'est la PUB : seize réclames en pixels (la police du jeu) peintes UNE
   fois dans un atlas 512², posées face à la route sur les murs du canyon. Additives, elles flottent dans la pluie ; elles défilent
   en lignes de balayage et, de temps en temps, un GLITCH les décale. Un appel de rendu pour toutes ; chaque panneau pioche sa case
   dans l'atlas d'après sa position (aucune donnée par instance). */
const PUB_EN={'LA CAISSE QUI PAIE':'THE CAR PAYS','JPEG MILLIONAIRE':'JPEG MILLIONAIRE','PLEIN GAZ':'FULL THROTTLE','BANQUE OUVERTE':'BANK IS OPEN','BRILLE FORT':'SHINE BRIGHT','NE LACHE RIEN':'NEVER GIVE UP',
  'VITE VITE':'QUICK QUICK','NUIT BLANCHE':'ALL NIGHTER','CHAUD':'HOT','PLUIE ET LUMIERE':'RAIN AND LIGHT','PLUS VITE':'FASTER','TOUT OU RIEN':'ALL OR NOTHING','OU CREVE':'OR DIE',
  'VITESSE':'SPEED','ILLEGALE':'ILLEGAL','LEVIER MAX':'MAX LEVERAGE','QUEL DIP ?':'WHAT DIP?'};
function pubLangue(P){if(typeof LANG==='undefined'||LANG==='fr')return;for(const p of P)for(let j=0;j<4;j++)if(PUB_EN[p[j]])p[j]=PUB_EN[p[j]];} // (2026-10-14, textes) peintes une fois, dans la langue du moment
function villePubAtlas(){
  const T9=vtCur(),te9=T9?LVL.cur.teinte:''; // (2026-10-16) LES TEINTES DE LA VILLE : l'atlas est repeint (une fois, à la construction de la ville) quand la teinte change
  if(CITY.pub&&CITY.pubT===te9)return CITY.pub;
  const N=512,C=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
  const PUB=[['CASH CAR','#ffd75e','#ff2e8e','LA CAISSE QUI PAIE'],['1.61','#fff3be','#b86bff','GAME STUDIO'],['NITRO','#ff8d2e','#ff2e2e','PLEIN GAZ'],['$$$','#ffd75e','#7a1fb0','BANQUE OUVERTE'],
    ['AURA','#ff9ee6','#7a2fd0','BRILLE FORT'],['FLOW','#5ee6ff','#1d63c8','NE LACHE RIEN'],['GO !','#ffffff','#ff5e7a','VITE VITE'],['24/7','#ffe23e','#ff7a14','NUIT BLANCHE'],
    ['RAMEN','#ffb85a','#d8261e','CHAUD'],['NEON','#2ee6ff','#ff3ea5','PLUIE ET LUMIERE'],['TURBO','#ffffff','#ff2e8e','PLUS VITE'],['CASINO','#ffd75e','#b0106a','TOUT OU RIEN'],
    ['DRIVE','#9fe8ff','#3a2fd0','OU CREVE'],['LUCKY','#7dffec','#ff3ea5','7 7 7'],['SUSHI','#ffffff','#ff5e7a','24 H'],['VITESSE','#ffe23e','#b0102a','ILLEGALE']];
  pubLangue(PUB); // (2026-10-14, textes) les réclames parlent la langue du joueur
  if(T9)for(const p of PUB){p[1]=vtHex(p[1],T9);p[2]=vtHex(p[2],T9);} // (teintes) le magenta et le violet des réclames → la couleur de la ville
  x.imageSmoothingEnabled=false; // (2026-09-26, vague 2) plus de VERT dans la ville (il n'est nulle part dans la bible) : « $$$ » et « CASINO » passent à l'or sur violet et sur magenta
  PUB.forEach(function(p,k){const ox=(k%4)*C,oy=((k/4)|0)*C;
    const g=x.createLinearGradient(0,oy,0,oy+C);g.addColorStop(0,p[2]);g.addColorStop(1,vtHex('#08061a',T9));x.fillStyle=g;x.fillRect(ox+4,oy+4,C-8,C-8);
    x.strokeStyle=p[1];x.lineWidth=4;x.strokeRect(ox+8,oy+8,C-16,C-16);
    x.fillStyle=p[1];x.textAlign='center';x.textBaseline='middle';
    const fz=Math.min(26,Math.floor((C-28)/Math.max(3,p[0].length)));x.font=fz+'px "Press Start 2P",monospace';x.fillText(p[0],ox+C/2,oy+C*.44);
    x.font='8px "Press Start 2P",monospace';x.fillStyle='#ffffff';x.fillText(p[3],ox+C/2,oy+C*.74);
    for(let i=0;i<5;i++){x.fillStyle=p[1];x.globalAlpha=.55;x.fillRect(ox+14+i*20,oy+C-22,12,4);}x.globalAlpha=1;});
  CITY.pubT=te9;if(CITY.pub){CITY.pub.image=cv;CITY.pub.needsUpdate=true;return CITY.pub;} // (teintes) la même texture, sa toile remplacée : la matière des panneaux ne bouge pas
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;texLibere(t); // (2026-10-14, passe perf mobile) 512² : 1 Mo
  CITY.pub=t;return t;
}
function villeMatPub(){
  if(CITY.matP)return CITY.matP;
  const m=new THREE.MeshBasicMaterial({map:villePubAtlas(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CITY.uT;sh.uniforms.uCour9=CITY.uC;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT9;varying float vS9;')
      .replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING\n'+
        'vS9=fract(instanceMatrix[3].x*.0713+instanceMatrix[3].z*.0419+instanceMatrix[3].y*.017);float c9=floor(vS9*16.);'+
        'float gl9=step(.93,fract(uT9*(.3+vS9*.4)+vS9*9.))*(fract(sin(floor(uT9*12.)+vS9*50.)*43.7)-.5)*.35;'+ // le GLITCH : la case glisse un instant
        'vUv=(vec2(clamp(vUv.x+gl9,0.,1.),vUv.y)*.96+.02+vec2(mod(c9,4.),3.-floor(c9/4.)))/4.;\n#else\nvS9=0.;\n#endif');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uCour9;varying float vS9;')
      .replace('#include <fog_fragment>','gl_FragColor.rgb*=(.78+.22*step(.5,fract(gl_FragCoord.y*.25-uT9*6.)))*(.85+.15*sin(uT9*(3.+vS9*4.)))*uCour9;\n#include <fog_fragment>');};
  m.dispose=function(){};CITY.matP=m;return m;
}
